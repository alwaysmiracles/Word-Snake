// ============================================================================
// Deep Sea Trench Wire — Abyssal Exploration Game Engine
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// All exports use the `dt` / `DT_` prefix. Hook-based pattern.
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ============================================================
// Types
// ============================================================

export type DtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type DtZoneId =
  | 'twilight_shelf'
  | 'midnight_slope'
  | 'abyssal_plain'
  | 'hadal_trench'
  | 'hydrothermal_vents'
  | 'brine_pool'
  | 'submarine_canyon'
  | 'deep_unknown';

export type DtEquipmentSlot = 'suit' | 'head' | 'tool' | 'vehicle';

export type DtStationModuleType =
  | 'research'
  | 'pressure'
  | 'aquarium'
  | 'sonar'
  | 'power'
  | 'storage'
  | 'medical'
  | 'crafting';

export interface DtRarityInfo {
  key: DtRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface DtTitleInfo {
  id: string;
  name: string;
  nameZh: string;
  requiredLevel: number;
  description: string;
}

export interface DtZoneDef {
  id: DtZoneId;
  name: string;
  nameZh: string;
  depthRange: [number, number];
  pressureMultiplier: number;
  dangerLevel: number;
  visibility: number;
  description: string;
  emoji: string;
  unlockLevel: number;
  color: string;
}

export interface DtCreatureDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: DtRarity;
  zoneId: DtZoneId;
  description: string;
  hp: number;
  speed: number;
  bioluminescent: boolean;
  hostile: boolean;
  xpReward: number;
  coinReward: number;
  discoverDepth: number;
  emoji: string;
  requiredLevel: number;
}

export interface DtResourceDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: DtRarity;
  category: 'mineral' | 'fluid' | 'fossil' | 'crystal' | 'organic';
  description: string;
  value: number;
  harvestDepth: [number, number];
  zoneId: DtZoneId;
  emoji: string;
}

export interface DtStationModuleDef {
  id: string;
  name: string;
  nameZh: string;
  moduleType: DtStationModuleType;
  description: string;
  maxLevel: number;
  baseBuildCost: number;
  baseUpgradeCost: number;
  bonusType: string;
  baseBonusValue: number;
  emoji: string;
}

export interface DtEquipmentDef {
  id: string;
  name: string;
  nameZh: string;
  slot: DtEquipmentSlot;
  description: string;
  maxDepthBonus: number;
  pressureResist: number;
  speedBonus: number;
  sonarBoost: number;
  rarity: DtRarity;
  cost: number;
  requiredLevel: number;
  emoji: string;
}

export interface DtAchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface DtDailyDiveDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  type: 'explore' | 'harvest' | 'discover' | 'build';
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface DtVentEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  duration: number;
  rewardCoins: number;
  rewardXP: number;
  riskLevel: number;
  emoji: string;
}

// ---- State interfaces ----

export interface DtStationState {
  moduleId: string;
  level: number;
  active: boolean;
}

export interface DtDiscoveredCreature {
  creatureId: string;
  discoveredAt: number;
  documented: boolean;
}

export interface DtHarvestedResource {
  resourceId: string;
  amount: number;
}

export interface DtEquippedItem {
  equipmentId: string;
}

export interface DtActiveVentEvent {
  eventId: string;
  startedAt: number;
  endsAt: number;
  claimed: boolean;
}

export interface DtQuestState {
  questId: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface DtAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface DtDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface DtExpeditionLog {
  id: string;
  timestamp: number;
  zoneId: DtZoneId;
  depth: number;
  event: string;
  details: string;
}

export interface DtDeepSeaTrenchState {
  // Player
  diverName: string;
  level: number;
  xp: number;
  coins: number;
  totalXp: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  currentTitleId: string;
  // Exploration
  currentZoneId: DtZoneId;
  currentDepth: number;
  maxDepthReached: number;
  discoveredZoneIds: DtZoneId[];
  oxygen: number;
  maxOxygen: number;
  pressure: number;
  hullIntegrity: number;
  // Creatures
  discoveredCreatures: DtDiscoveredCreature[];
  legendaryEncounterCount: number;
  totalEncounterCount: number;
  // Resources
  harvestedResources: Record<string, number>;
  totalHarvestCount: number;
  // Station
  stationModules: DtStationState[];
  stationPower: number;
  // Equipment
  ownedEquipment: string[];
  equippedItems: DtEquippedItem[];
  // Achievements
  achievements: DtAchievementState[];
  // Daily
  dailyTask: DtDailyTaskState | null;
  dailyStreak: number;
  lastDailyKey: string | null;
  dailyDivesCompleted: number;
  // Vent Events
  activeVentEvent: DtActiveVentEvent | null;
  ventEventsCompleted: number;
  // Quests
  activeQuests: DtQuestState[];
  completedQuestIds: string[];
  // Logs
  expeditionLogs: DtExpeditionLog[];
  // Meta
  seed: number;
  diveCountByRarity: Record<DtRarity, number>;
  harvestCountByCategory: Record<string, number>;
  stationUpgradeCount: number;
}

// ============================================================
// Seeded PRNG (mulberry32 — no Math.random)
// ============================================================

function dtMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dtHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ============================================================
// Helpers
// ============================================================

const DT_MAX_LEVEL = 50;

function dtXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= DT_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.14));
}

function dtClampLevel(lvl: number): number {
  return Math.max(1, Math.min(DT_MAX_LEVEL, lvl));
}

function dtClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function dtGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function dtRarityMultiplier(r: DtRarity): number {
  const map: Record<DtRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3, legendary: 5,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const DT_RARITIES: DtRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

// ---- 8 Trench Zones ----

export const DT_ZONES: DtZoneDef[] = [
  { id: 'twilight_shelf', name: 'Twilight Shelf', nameZh: '暮光架', depthRange: [200, 1000], pressureMultiplier: 1.2, dangerLevel: 2, visibility: 40, description: 'The last dim traces of sunlight fade away. Strange bioluminescent flickers begin.', emoji: '🌅', unlockLevel: 1, color: '#5c6bc0' },
  { id: 'midnight_slope', name: 'Midnight Slope', nameZh: '午夜斜坡', depthRange: [1000, 3000], pressureMultiplier: 2.0, dangerLevel: 4, visibility: 15, description: 'A steep descent into permanent darkness. Bizarre shadows lurk in the gloom.', emoji: '🌑', unlockLevel: 5, color: '#37474f' },
  { id: 'abyssal_plain', name: 'Abyssal Plain', nameZh: '深渊平原', depthRange: [3000, 5000], pressureMultiplier: 3.5, dangerLevel: 6, visibility: 5, description: 'An endless flat wasteland of marine snow punctuated by alien life.', emoji: '🏜️', unlockLevel: 10, color: '#263238' },
  { id: 'hadal_trench', name: 'Hadal Trench', nameZh: '海沟深渊', depthRange: [5000, 8000], pressureMultiplier: 6.0, dangerLevel: 8, visibility: 2, description: 'The deepest scars in Earth\'s crust. Crushing pressure guards ancient secrets.', emoji: '🕳️', unlockLevel: 18, color: '#1a237e' },
  { id: 'hydrothermal_vents', name: 'Hydrothermal Vents', nameZh: '深海热泉', depthRange: [2500, 4500], pressureMultiplier: 4.0, dangerLevel: 7, visibility: 8, description: 'Superheated mineral chimneys erupting from the seafloor, sustaining unique ecosystems.', emoji: '🌋', unlockLevel: 15, color: '#ff5722' },
  { id: 'brine_pool', name: 'Brine Pool', nameZh: '卤水池', depthRange: [3500, 5500], pressureMultiplier: 4.5, dangerLevel: 5, visibility: 10, description: 'A toxic lake of ultra-dense saltwater on the ocean floor, deadly to the unwary.', emoji: '🧪', unlockLevel: 22, color: '#00897b' },
  { id: 'submarine_canyon', name: 'Submarine Canyon', nameZh: '海底峡谷', depthRange: [1500, 4000], pressureMultiplier: 2.5, dangerLevel: 5, visibility: 20, description: 'Massive underwater gorges carved by ancient currents, rich with fossils.', emoji: '🏔️', unlockLevel: 8, color: '#4e342e' },
  { id: 'deep_unknown', name: 'The Deep Unknown', nameZh: '未知深渊', depthRange: [8000, 11000], pressureMultiplier: 10.0, dangerLevel: 10, visibility: 0, description: 'Beyond the limits of human exploration. Reality itself seems to thin here.', emoji: '👁️', unlockLevel: 35, color: '#311b92' },
];

// ---- 35 Abyssal Creatures ----

export const DT_CREATURES: DtCreatureDef[] = [
  // Common (8)
  { id: 'hatchetfish', name: 'Hatchetfish', nameZh: '斧头鱼', rarity: 'common', zoneId: 'twilight_shelf', description: 'Silver-bodied with upward-facing tubular eyes to spot predators above.', hp: 8, speed: 3, bioluminescent: true, hostile: false, xpReward: 10, coinReward: 6, discoverDepth: 300, emoji: '🐟', requiredLevel: 1 },
  { id: 'lanternfish', name: 'Lanternfish', nameZh: '灯笼鱼', rarity: 'common', zoneId: 'twilight_shelf', description: 'Tiny fish with a glowing lure dangling from its lower jaw.', hp: 6, speed: 4, bioluminescent: true, hostile: false, xpReward: 8, coinReward: 5, discoverDepth: 400, emoji: '💡', requiredLevel: 1 },
  { id: 'viperfish', name: 'Viperfish', nameZh: '蝰鱼', rarity: 'common', zoneId: 'midnight_slope', description: 'Enormous fang-toothed predator lurking in the midnight depths.', hp: 30, speed: 5, bioluminescent: true, hostile: true, xpReward: 12, coinReward: 8, discoverDepth: 1200, emoji: '🐍', requiredLevel: 1 },
  { id: 'siphonophore', name: 'Siphonophore', nameZh: '管水母', rarity: 'common', zoneId: 'twilight_shelf', description: 'A colonial organism forming a glowing chain up to 40 meters long.', hp: 15, speed: 1, bioluminescent: true, hostile: false, xpReward: 10, coinReward: 6, discoverDepth: 500, emoji: '🔗', requiredLevel: 1 },
  { id: 'gulper_eel', name: 'Gulper Eel', nameZh: '吞噬鳗', rarity: 'common', zoneId: 'midnight_slope', description: 'Enormous hinged jaws capable of swallowing prey larger than itself.', hp: 40, speed: 3, bioluminescent: true, hostile: true, xpReward: 14, coinReward: 9, discoverDepth: 1800, emoji: '👅', requiredLevel: 1 },
  { id: 'ratfish', name: 'Chimaera Ratfish', nameZh: '银鲛', rarity: 'common', zoneId: 'submarine_canyon', description: 'Ancient cartilaginous fish with a retractable venomous spine on its dorsal fin.', hp: 25, speed: 4, bioluminescent: false, hostile: false, xpReward: 11, coinReward: 7, discoverDepth: 2000, emoji: '🐀', requiredLevel: 1 },
  { id: 'sea_pig', name: 'Sea Pig', nameZh: '海猪', rarity: 'common', zoneId: 'abyssal_plain', description: 'A chubby deep-sea sea cucumber walking on tubular legs across the abyss.', hp: 5, speed: 1, bioluminescent: false, hostile: false, xpReward: 12, coinReward: 8, discoverDepth: 3500, emoji: '🐷', requiredLevel: 1 },
  { id: 'comb_jelly', name: 'Comb Jelly', nameZh: '栉水母', rarity: 'common', zoneId: 'twilight_shelf', description: 'Translucent drifter whose cilia refract light into shimmering rainbows.', hp: 3, speed: 2, bioluminescent: true, hostile: false, xpReward: 9, coinReward: 5, discoverDepth: 250, emoji: '🪼', requiredLevel: 1 },
  // Uncommon (8)
  { id: 'vampire_squid', name: 'Vampire Squid', nameZh: '吸血鬼乌贼', rarity: 'uncommon', zoneId: 'midnight_slope', description: 'Neither squid nor octopus. Drapes webbed arms over itself like a cloak.', hp: 45, speed: 4, bioluminescent: true, hostile: true, xpReward: 25, coinReward: 18, discoverDepth: 1500, emoji: '🧛', requiredLevel: 2 },
  { id: 'giant_isopod', name: 'Giant Isopod', nameZh: '巨型等足虫', rarity: 'uncommon', zoneId: 'abyssal_plain', description: 'Armored deep-sea pill bug growing up to 50 cm, a living fossil.', hp: 60, speed: 1, bioluminescent: false, hostile: false, xpReward: 28, coinReward: 20, discoverDepth: 4000, emoji: '🪲', requiredLevel: 3 },
  { id: 'benthic_jelly', name: 'Benthic Jellyfish', nameZh: '底栖水母', rarity: 'uncommon', zoneId: 'abyssal_plain', description: 'A deep-sea jelly with short stumpy tentacles that crawls along the seafloor.', hp: 10, speed: 1, bioluminescent: true, hostile: true, xpReward: 22, coinReward: 15, discoverDepth: 3800, emoji: '🪼', requiredLevel: 3 },
  { id: 'frilled_shark', name: 'Frilled Shark', nameZh: '皱鳃鲨', rarity: 'uncommon', zoneId: 'submarine_canyon', description: 'A prehistoric shark with six gill slits and a serpentine body, unchanged for 80 million years.', hp: 80, speed: 6, bioluminescent: false, hostile: true, xpReward: 30, coinReward: 22, discoverDepth: 2500, emoji: '🦈', requiredLevel: 4 },
  { id: 'barrel_eye', name: 'Barreleye Fish', nameZh: '管眼鱼', rarity: 'uncommon', zoneId: 'midnight_slope', description: 'Transparent-headed fish with tubular upward-pointing eyes filled with green lenses.', hp: 15, speed: 3, bioluminescent: true, hostile: false, xpReward: 26, coinReward: 18, discoverDepth: 1400, emoji: '👁️', requiredLevel: 2 },
  { id: 'spider_crab', name: 'Japanese Spider Crab', nameZh: '甘氏巨螯蟹', rarity: 'uncommon', zoneId: 'submarine_canyon', description: 'Leg span of 3.7 meters. A gentle giant scuttling across the deep seabed.', hp: 70, speed: 2, bioluminescent: false, hostile: false, xpReward: 20, coinReward: 15, discoverDepth: 2200, emoji: '🦀', requiredLevel: 3 },
  { id: 'sloan_viperfish', name: 'Sloane\'s Viperfish', nameZh: '斯隆蝰鱼', rarity: 'uncommon', zoneId: 'hydrothermal_vents', description: 'A ferocious fish with needle-like teeth found near superheated vent waters.', hp: 50, speed: 7, bioluminescent: true, hostile: true, xpReward: 28, coinReward: 20, discoverDepth: 3000, emoji: '🐉', requiredLevel: 4 },
  { id: 'tripod_fish', name: 'Tripod Fish', nameZh: '三脚鱼', rarity: 'uncommon', zoneId: 'abyssal_plain', description: 'Stands on elongated fin rays like stilts, facing the current to catch food.', hp: 12, speed: 1, bioluminescent: false, hostile: false, xpReward: 24, coinReward: 16, discoverDepth: 4200, emoji: '🦿', requiredLevel: 3 },
  // Rare (8)
  { id: 'anglerfish', name: 'Anglerfish', nameZh: '鮟鱇鱼', rarity: 'rare', zoneId: 'midnight_slope', description: 'Terrifying jaws illuminated by a bioluminescent lure dangling from its head.', hp: 65, speed: 3, bioluminescent: true, hostile: true, xpReward: 45, coinReward: 35, discoverDepth: 2000, emoji: '🪝', requiredLevel: 5 },
  { id: 'ghost_octopus', name: 'Ghost Octopus', nameZh: '幽灵章鱼', rarity: 'rare', zoneId: 'hadal_trench', description: 'A translucent octopus with wing-like fins, drifting through the crushing dark.', hp: 40, speed: 4, bioluminescent: true, hostile: false, xpReward: 50, coinReward: 38, discoverDepth: 6000, emoji: '👻', requiredLevel: 6 },
  { id: 'yeti_crab', name: 'Yeti Crab', nameZh: '雪人蟹', rarity: 'rare', zoneId: 'hydrothermal_vents', description: 'Furry claws cultivate bacteria for food near boiling vent chimneys.', hp: 20, speed: 2, bioluminescent: false, hostile: false, xpReward: 40, coinReward: 30, discoverDepth: 3200, emoji: '🦀', requiredLevel: 6 },
  { id: 'dumbo_octopus', name: 'Dumbo Octopus', nameZh: '小飞象章鱼', rarity: 'rare', zoneId: 'hadal_trench', description: 'Ear-like fins flap gracefully in the crushing dark. Deepest-living octopus known.', hp: 35, speed: 3, bioluminescent: true, hostile: false, xpReward: 48, coinReward: 36, discoverDepth: 7000, emoji: '🐘', requiredLevel: 7 },
  { id: 'biolum_jelly', name: 'Atolla Jellyfish', nameZh: '冠水母', rarity: 'rare', zoneId: 'midnight_slope', description: 'Produces brilliant bioluminescent blue displays to attract predators of its attacker.', hp: 12, speed: 2, bioluminescent: true, hostile: true, xpReward: 42, coinReward: 32, discoverDepth: 1600, emoji: '💎', requiredLevel: 5 },
  { id: 'hadal_snailfish', name: 'Hadal Snailfish', nameZh: '深渊狮子鱼', rarity: 'rare', zoneId: 'hadal_trench', description: 'Ghostly translucent fish at the very bottom of the ocean, depth record holder.', hp: 20, speed: 2, bioluminescent: false, hostile: false, xpReward: 52, coinReward: 40, discoverDepth: 8000, emoji: '🐟', requiredLevel: 8 },
  { id: 'brine_shrimp_giant', name: 'Giant Brine Shrimp', nameZh: '巨型卤虾', rarity: 'rare', zoneId: 'brine_pool', description: 'Supersized shrimp adapted to the extreme salinity of brine pools.', hp: 18, speed: 4, bioluminescent: false, hostile: false, xpReward: 38, coinReward: 28, discoverDepth: 4000, emoji: '🦐', requiredLevel: 6 },
  { id: 'canyon_eel', name: 'Canyon Moray', nameZh: '峡谷海鳝', rarity: 'rare', zoneId: 'submarine_canyon', description: 'An enormous moray eel nesting in submarine canyon crevices, ancient and wise.', hp: 90, speed: 5, bioluminescent: false, hostile: true, xpReward: 44, coinReward: 34, discoverDepth: 3500, emoji: '🐍', requiredLevel: 7 },
  // Epic (6)
  { id: 'giant_squid', name: 'Giant Squid', nameZh: '大王乌贼', rarity: 'epic', zoneId: 'midnight_slope', description: 'Eight arms and two longest tentacles. Legends speak of ships pulled under.', hp: 150, speed: 7, bioluminescent: false, hostile: true, xpReward: 80, coinReward: 60, discoverDepth: 2500, emoji: '🦑', requiredLevel: 10 },
  { id: 'colossal_squid', name: 'Colossal Squid', nameZh: '大王酸浆鱿', rarity: 'epic', zoneId: 'abyssal_plain', description: 'The largest invertebrate on Earth. Rotating hook-covered tentacles seize prey.', hp: 200, speed: 6, bioluminescent: true, hostile: true, xpReward: 100, coinReward: 80, discoverDepth: 4500, emoji: '🦑', requiredLevel: 12 },
  { id: 'black_dragonfish', name: 'Black Dragonfish', nameZh: '黑龙鱼', rarity: 'epic', zoneId: 'hadal_trench', description: 'Produces red bioluminescence invisible to most deep-sea creatures. Apex midnight predator.', hp: 100, speed: 8, bioluminescent: true, hostile: true, xpReward: 90, coinReward: 70, discoverDepth: 5500, emoji: '🐉', requiredLevel: 12 },
  { id: 'tube_worm_giant', name: 'Giant Tube Worm Colony', nameZh: '巨型管虫群落', rarity: 'epic', zoneId: 'hydrothermal_vents', description: 'Two-meter red plumes harboring chemosynthetic bacteria at superheated vents.', hp: 80, speed: 0, bioluminescent: false, hostile: false, xpReward: 85, coinReward: 65, discoverDepth: 3800, emoji: '🪱', requiredLevel: 11 },
  { id: 'mariana_ghost', name: 'Mariana Ghost', nameZh: '马里亚纳幽灵', rarity: 'epic', zoneId: 'hadal_trench', description: 'Semi-transparent predator that materializes from the darkness without warning.', hp: 120, speed: 9, bioluminescent: true, hostile: true, xpReward: 95, coinReward: 75, discoverDepth: 9000, emoji: '👻', requiredLevel: 14 },
  { id: 'abyssal_siren', name: 'Abyssal Siren', nameZh: '深渊海妖', rarity: 'epic', zoneId: 'brine_pool', description: 'A creature of hypnotic beauty whose bioluminescent song lures divers to their doom.', hp: 110, speed: 6, bioluminescent: true, hostile: true, xpReward: 88, coinReward: 68, discoverDepth: 5000, emoji: '🧜‍♀️', requiredLevel: 13 },
  // Legendary (5)
  { id: 'leviathan', name: 'The Leviathan', nameZh: '利维坦', rarity: 'legendary', zoneId: 'hadal_trench', description: 'An ancient sea serpent of immense power, said to encircle the entire trench.', hp: 500, speed: 8, bioluminescent: true, hostile: true, xpReward: 200, coinReward: 150, discoverDepth: 9500, emoji: '🐍', requiredLevel: 20 },
  { id: 'kraken', name: 'The Kraken', nameZh: '北欧海怪', rarity: 'legendary', zoneId: 'deep_unknown', description: 'A legendary tentacled beast capable of dragging entire research stations under.', hp: 600, speed: 7, bioluminescent: true, hostile: true, xpReward: 250, coinReward: 200, discoverDepth: 10000, emoji: '🦑', requiredLevel: 25 },
  { id: 'abyssal_phantom', name: 'Abyssal Phantom', nameZh: '深渊幻影', rarity: 'legendary', zoneId: 'deep_unknown', description: 'A formless entity that shifts between dimensions, visible only as a shimmer.', hp: 300, speed: 10, bioluminescent: true, hostile: true, xpReward: 220, coinReward: 170, discoverDepth: 10500, emoji: '👁️‍🗨️', requiredLevel: 28 },
  { id: 'ancient_leviathan', name: 'Ancient Leviathan', nameZh: '远古利维坦', rarity: 'legendary', zoneId: 'brine_pool', description: 'A fossilized leviathan somehow still alive, its body encased in salt crystals.', hp: 400, speed: 3, bioluminescent: true, hostile: true, xpReward: 180, coinReward: 140, discoverDepth: 5500, emoji: '🦴', requiredLevel: 22 },
  { id: 'titan_worm', name: 'Titan Worm', nameZh: '泰坦蠕虫', rarity: 'legendary', zoneId: 'hadal_trench', description: 'A segmented behemoth 15 meters long burrowing through trench sediments.', hp: 450, speed: 4, bioluminescent: false, hostile: true, xpReward: 190, coinReward: 145, discoverDepth: 8500, emoji: '🐛', requiredLevel: 24 },
];

// ---- 30 Abyssal Resources ----

export const DT_RESOURCES: DtResourceDef[] = [
  // Minerals (8)
  { id: 'manganese_nodule', name: 'Manganese Nodule', nameZh: '锰结核', rarity: 'common', category: 'mineral', description: 'Potato-sized concretions of manganese and iron scattered across the abyssal plain.', value: 10, harvestDepth: [3000, 6000], zoneId: 'abyssal_plain', emoji: '🪨' },
  { id: 'cobalt_crust', name: 'Cobalt Crust', nameZh: '钴结壳', rarity: 'uncommon', category: 'mineral', description: 'Metal-rich crusts forming on seamount slopes, crucial for advanced alloys.', value: 30, harvestDepth: [1500, 4000], zoneId: 'submarine_canyon', emoji: '🔩' },
  { id: 'sulfide_deposit', name: 'Polymetallic Sulfide', nameZh: '多金属硫化物', rarity: 'rare', category: 'mineral', description: 'Rich ore deposits formed by hydrothermal vent activity over millennia.', value: 80, harvestDepth: [2500, 4500], zoneId: 'hydrothermal_vents', emoji: '⛏️' },
  { id: 'abyssal_iron', name: 'Abyssal Iron', nameZh: '深渊铁', rarity: 'common', category: 'mineral', description: 'Heavy iron deposits resting on the ocean floor for millions of years.', value: 8, harvestDepth: [2000, 5000], zoneId: 'abyssal_plain', emoji: '🧱' },
  { id: 'rare_earth_nodule', name: 'Rare Earth Nodule', nameZh: '稀土结核', rarity: 'epic', category: 'mineral', description: 'Exceptionally rare nodules containing vital rare earth elements.', value: 200, harvestDepth: [5000, 8000], zoneId: 'hadal_trench', emoji: '💎' },
  { id: 'osmium_shard', name: 'Osmium Shard', nameZh: '锇碎片', rarity: 'rare', category: 'mineral', description: 'Fragments of the densest naturally occurring element, found near hydrothermal vents.', value: 120, harvestDepth: [3000, 5000], zoneId: 'hydrothermal_vents', emoji: '✨' },
  { id: 'brine_mineral', name: 'Brine Crystal', nameZh: '卤水晶', rarity: 'uncommon', category: 'mineral', description: 'Crystals formed in the extreme salinity of brine pools, unique geochemistry.', value: 45, harvestDepth: [3500, 5500], zoneId: 'brine_pool', emoji: '🔷' },
  { id: 'void_ore', name: 'Void Ore', nameZh: '虚空矿石', rarity: 'legendary', category: 'mineral', description: 'An alien mineral from the deepest unknown that absorbs all electromagnetic radiation.', value: 500, harvestDepth: [8000, 11000], zoneId: 'deep_unknown', emoji: '🕳️' },
  // Fluids (6)
  { id: 'bio_lum_fluid', name: 'Bioluminescent Fluid', nameZh: '生物发光液', rarity: 'common', category: 'fluid', description: 'Concentrated extract from bioluminescent organisms, glows for decades.', value: 15, harvestDepth: [200, 2000], zoneId: 'twilight_shelf', emoji: '💧' },
  { id: 'vent_fluid', name: 'Vent Fluid Sample', nameZh: '热泉液样本', rarity: 'uncommon', category: 'fluid', description: 'Superheated mineral-rich water from hydrothermal vent chimneys.', value: 35, harvestDepth: [2500, 4500], zoneId: 'hydrothermal_vents', emoji: '🧪' },
  { id: 'primordial_soup', name: 'Primordial Soup', nameZh: '原始汤', rarity: 'epic', category: 'fluid', description: 'A vial of vent fluid containing organisms that may resemble earliest life.', value: 250, harvestDepth: [3000, 5000], zoneId: 'hydrothermal_vents', emoji: '🫧' },
  { id: 'abyssal_brine', name: 'Ultra-dense Brine', nameZh: '超高密度卤水', rarity: 'uncommon', category: 'fluid', description: 'Densest naturally occurring water, toxic to most life but valuable for chemistry.', value: 40, harvestDepth: [3500, 5500], zoneId: 'brine_pool', emoji: '🧴' },
  { id: 'deep_time_water', name: 'Deep Time Water', nameZh: '深层时间水', rarity: 'rare', category: 'fluid', description: 'Water trapped in abyssal sediments for millions of years, pristine and ancient.', value: 100, harvestDepth: [4000, 7000], zoneId: 'hadal_trench', emoji: '⏳' },
  { id: 'void_ichor', name: 'Void Ichor', nameZh: '虚空之液', rarity: 'legendary', category: 'fluid', description: 'A mysterious luminescent liquid from the deep unknown with unknown chemical properties.', value: 600, harvestDepth: [9000, 11000], zoneId: 'deep_unknown', emoji: '💜' },
  // Fossils (6)
  { id: 'ammonite_fossil', name: 'Ammonite Fossil', nameZh: '菊石化石', rarity: 'common', category: 'fossil', description: 'Spiral-shelled cephalopod fossil from 65 million years ago.', value: 20, harvestDepth: [1500, 3500], zoneId: 'submarine_canyon', emoji: '🐚' },
  { id: 'ancient_fish_fossil', name: 'Ancient Fish Fossil', nameZh: '古鱼化石', rarity: 'uncommon', category: 'fossil', description: 'Perfectly preserved prehistoric fish encased in sedimentary rock.', value: 50, harvestDepth: [2000, 5000], zoneId: 'abyssal_plain', emoji: '🦴' },
  { id: 'trilobite_specimen', name: 'Trilobite Specimen', nameZh: '三叶虫标本', rarity: 'rare', category: 'fossil', description: 'A remarkably intact trilobite from 250 million years ago, still showing compound eyes.', value: 150, harvestDepth: [3000, 5500], zoneId: 'submarine_canyon', emoji: '🪲' },
  { id: 'cambrian_explosion_fossil', name: 'Cambrian Explosion Fossil', nameZh: '寒武纪爆发化石', rarity: 'epic', category: 'fossil', description: 'A fossil from the dawn of complex life, containing unprecedented evolutionary data.', value: 300, harvestDepth: [4000, 7000], zoneId: 'hadal_trench', emoji: '🗿' },
  { id: 'titanoboa_tooth', name: 'Titanoboa Tooth', nameZh: '泰坦巨蟒牙齿', rarity: 'rare', category: 'fossil', description: 'A massive fang from the largest snake to ever live, found in abyssal sediment.', value: 130, harvestDepth: [2500, 4500], zoneId: 'brine_pool', emoji: '🦷' },
  { id: 'pre_sCambrian_fossil', name: 'Pre-Cambrian Organism', nameZh: '前寒武纪生物', rarity: 'legendary', category: 'fossil', description: 'A fossil of an unknown organism from before the Cambrian explosion — a missing link.', value: 700, harvestDepth: [8000, 11000], zoneId: 'deep_unknown', emoji: '🧬' },
  // Crystals (6)
  { id: 'pressure_crystal', name: 'Pressure Crystal', nameZh: '压力水晶', rarity: 'uncommon', category: 'crystal', description: 'Crystals that formed under immense pressure, storing mechanical energy.', value: 25, harvestDepth: [3000, 6000], zoneId: 'abyssal_plain', emoji: '🔮' },
  { id: 'abyssal_quartz', name: 'Abyssal Quartz', nameZh: '深渊石英', rarity: 'common', category: 'crystal', description: 'Dark quartz formed in the absence of light, with unique piezoelectric properties.', value: 12, harvestDepth: [2000, 5000], zoneId: 'midnight_slope', emoji: '💎' },
  { id: 'vent_crystal', name: 'Hydrothermal Crystal', nameZh: '热泉水晶', rarity: 'rare', category: 'crystal', description: 'Grown from mineral-rich vent water, contains trapped micro-organisms.', value: 90, harvestDepth: [2500, 4500], zoneId: 'hydrothermal_vents', emoji: '💠' },
  { id: 'hadal_gem', name: 'Hadal Gem', nameZh: '深渊宝石', rarity: 'epic', category: 'crystal', description: 'A gemstone of impossible beauty formed under extreme pressure in the hadal zone.', value: 280, harvestDepth: [6000, 9000], zoneId: 'hadal_trench', emoji: '💚' },
  { id: 'brine_crystal', name: 'Brine Salt Crystal', nameZh: '卤盐结晶', rarity: 'uncommon', category: 'crystal', description: 'Perfect cubic crystals of exotic salts found only in brine pools.', value: 40, harvestDepth: [3500, 5500], zoneId: 'brine_pool', emoji: '🧊' },
  { id: 'singularity_crystal', name: 'Singularity Crystal', nameZh: '奇点水晶', rarity: 'legendary', category: 'crystal', description: 'A crystal that seems to contain a miniature singularity, warping light around it.', value: 800, harvestDepth: [9000, 11000], zoneId: 'deep_unknown', emoji: '🌀' },
  // Organic (4)
  { id: 'marine_snow_sample', name: 'Marine Snow Sample', nameZh: '海洋雪样本', rarity: 'common', category: 'organic', description: 'A concentrated sample of organic debris drifting down from above.', value: 5, harvestDepth: [200, 3000], zoneId: 'twilight_shelf', emoji: '❄️' },
  { id: 'chemosynthetic_bacteria', name: 'Chemosynthetic Bacteria', nameZh: '化能合成菌', rarity: 'uncommon', category: 'organic', description: 'Bacteria that derive energy from chemical reactions rather than sunlight.', value: 30, harvestDepth: [2500, 5000], zoneId: 'hydrothermal_vents', emoji: '🦠' },
  { id: 'abyssal_sponge', name: 'Abyssal Glass Sponge', nameZh: '深渊玻璃海绵', rarity: 'rare', category: 'organic', description: 'A deep-sea sponge with a silica skeleton that could revolutionize optics.', value: 110, harvestDepth: [4000, 7000], zoneId: 'hadal_trench', emoji: '🧽' },
  { id: 'living_fossil_bacteria', name: 'Living Fossil Bacteria', nameZh: '活化石细菌', rarity: 'epic', category: 'organic', description: 'Bacteria identical to 3-billion-year-old fossils, still alive and reproducing.', value: 350, harvestDepth: [5000, 8000], zoneId: 'brine_pool', emoji: '🔬' },
];

// ---- 25 Research Station Modules ----

export const DT_STATION_MODULES: DtStationModuleDef[] = [
  { id: 'research_lab', name: 'Research Lab', nameZh: '研究实验室', moduleType: 'research', description: 'Analyzes specimens to unlock creature data and technology bonuses.', maxLevel: 10, baseBuildCost: 500, baseUpgradeCost: 200, bonusType: 'xp_boost', baseBonusValue: 5, emoji: '🔬' },
  { id: 'pressure_chamber', name: 'Pressure Chamber', nameZh: '压力舱', moduleType: 'pressure', description: 'Simulates extreme depths for testing equipment and cultivating deep organisms.', maxLevel: 10, baseBuildCost: 600, baseUpgradeCost: 250, bonusType: 'depth_bonus', baseBonusValue: 200, emoji: '//⚠' },
  { id: 'deep_aquarium', name: 'Deep Aquarium', nameZh: '深渊水族馆', moduleType: 'aquarium', description: 'Houses and studies discovered creatures in controlled conditions.', maxLevel: 10, baseBuildCost: 400, baseUpgradeCost: 150, bonusType: 'coin_boost', baseBonusValue: 3, emoji: '🐠' },
  { id: 'sonar_array', name: 'Sonar Array', nameZh: '声纳阵列', moduleType: 'sonar', description: 'Advanced sonar system that maps surroundings and detects rare creatures.', maxLevel: 10, baseBuildCost: 700, baseUpgradeCost: 300, bonusType: 'discovery_boost', baseBonusValue: 5, emoji: '📡' },
  { id: 'thermal_generator', name: 'Thermal Generator', nameZh: '热力发电机', moduleType: 'power', description: 'Converts hydrothermal energy into station power for all modules.', maxLevel: 10, baseBuildCost: 800, baseUpgradeCost: 350, bonusType: 'power_boost', baseBonusValue: 10, emoji: '⚡' },
  { id: 'resource_silo', name: 'Resource Silo', nameZh: '资源仓库', moduleType: 'storage', description: 'Stores harvested resources and protects them from pressure damage.', maxLevel: 10, baseBuildCost: 350, baseUpgradeCost: 120, bonusType: 'storage_boost', baseBonusValue: 50, emoji: '🏗️' },
  { id: 'medical_bay', name: 'Medical Bay', nameZh: '医疗舱', moduleType: 'medical', description: 'Treats decompression sickness and creature-related injuries.', maxLevel: 8, baseBuildCost: 450, baseUpgradeCost: 180, bonusType: 'oxygen_boost', baseBonusValue: 10, emoji: '🏥' },
  { id: 'fabrication_lab', name: 'Fabrication Lab', nameZh: '制造实验室', moduleType: 'crafting', description: 'Crafts equipment and tools from harvested deep-sea materials.', maxLevel: 10, baseBuildCost: 600, baseUpgradeCost: 250, bonusType: 'craft_boost', baseBonusValue: 5, emoji: '🔨' },
  { id: 'biolum_lab', name: 'Bioluminescence Lab', nameZh: '生物发光实验室', moduleType: 'research', description: 'Studies bioluminescent organisms to develop new light technologies.', maxLevel: 8, baseBuildCost: 550, baseUpgradeCost: 220, bonusType: 'rarity_boost', baseBonusValue: 3, emoji: '💡' },
  { id: 'hull_forgery', name: 'Hull Forge', nameZh: '船体锻造厂', moduleType: 'crafting', description: 'Forges ultra-strong hull materials from abyssal metals.', maxLevel: 8, baseBuildCost: 700, baseUpgradeCost: 300, bonusType: 'hull_boost', baseBonusValue: 10, emoji: '🔩' },
  { id: 'specimen_vault', name: 'Specimen Vault', nameZh: '标本库', moduleType: 'storage', description: 'Preserves rare specimens at precise pressure and temperature.', maxLevel: 8, baseBuildCost: 500, baseUpgradeCost: 200, bonusType: 'preservation_boost', baseBonusValue: 5, emoji: '🏦' },
  { id: 'comm_relay', name: 'Communications Relay', nameZh: '通讯中继', moduleType: 'sonar', description: 'Maintains contact with the surface through deep-ocean acoustic channels.', maxLevel: 6, baseBuildCost: 400, baseUpgradeCost: 160, bonusType: 'coin_boost', baseBonusValue: 2, emoji: '📡' },
  { id: 'oxygen_extractor', name: 'Oxygen Extractor', nameZh: '氧气提取器', moduleType: 'medical', description: 'Extracts dissolved oxygen from seawater for station life support.', maxLevel: 10, baseBuildCost: 500, baseUpgradeCost: 200, bonusType: 'oxygen_boost', baseBonusValue: 8, emoji: '💨' },
  { id: 'mining_laser', name: 'Mining Laser', nameZh: '采矿激光器', moduleType: 'crafting', description: 'Precision laser for extracting minerals from the seafloor without damage.', maxLevel: 8, baseBuildCost: 800, baseUpgradeCost: 350, bonusType: 'harvest_boost', baseBonusValue: 8, emoji: '🔫' },
  { id: 'energy_core', name: 'Energy Core', nameZh: '能量核心', moduleType: 'power', description: 'Advanced reactor powered by abyssal crystal energy.', maxLevel: 6, baseBuildCost: 1200, baseUpgradeCost: 500, bonusType: 'power_boost', baseBonusValue: 20, emoji: '☢️' },
  { id: 'xenobiology_lab', name: 'Xenobiology Lab', nameZh: '外星生物学实验室', moduleType: 'research', description: 'Studies the biology of deep-unknown creatures that defy classification.', maxLevel: 6, baseBuildCost: 1000, baseUpgradeCost: 400, bonusType: 'xp_boost', baseBonusValue: 10, emoji: '👽' },
  { id: 'navigation_hub', name: 'Navigation Hub', nameZh: '导航中心', moduleType: 'sonar', description: 'Central navigation system integrating all sonar and depth data.', maxLevel: 8, baseBuildCost: 600, baseUpgradeCost: 250, bonusType: 'discovery_boost', baseBonusValue: 8, emoji: '🗺️' },
  { id: 'thermal_suit_bay', name: 'Thermal Suit Bay', nameZh: '温控装备库', moduleType: 'medical', description: 'Maintains and upgrades thermal protection for deep dive suits.', maxLevel: 8, baseBuildCost: 550, baseUpgradeCost: 220, bonusType: 'hull_boost', baseBonusValue: 8, emoji: '🥽' },
  { id: 'crystal_grow_room', name: 'Crystal Growth Room', nameZh: '水晶培育室', moduleType: 'crafting', description: 'Cultivates abyssal crystals under controlled pressure conditions.', maxLevel: 6, baseBuildCost: 650, baseUpgradeCost: 280, bonusType: 'craft_boost', baseBonusValue: 8, emoji: '💎' },
  { id: 'deep_fridge', name: 'Cryogenic Storage', nameZh: '冷冻储存', moduleType: 'storage', description: 'Ultra-cold storage preserving organic samples indefinitely.', maxLevel: 6, baseBuildCost: 500, baseUpgradeCost: 200, bonusType: 'preservation_boost', baseBonusValue: 8, emoji: '🧊' },
  { id: 'sonar_dome', name: 'Sonar Dome', nameZh: '声纳穹顶', moduleType: 'sonar', description: 'Massive hemispherical array detecting life up to 50km away.', maxLevel: 6, baseBuildCost: 900, baseUpgradeCost: 400, bonusType: 'discovery_boost', baseBonusValue: 12, emoji: '🏟️' },
  { id: 'xeno_forge', name: 'Xeno Forge', nameZh: '异形锻造炉', moduleType: 'crafting', description: 'Forges equipment from materials unknown to surface science.', maxLevel: 5, baseBuildCost: 1500, baseUpgradeCost: 600, bonusType: 'craft_boost', baseBonusValue: 15, emoji: '🔨' },
  { id: 'abyssal_observatory', name: 'Abyssal Observatory', nameZh: '深渊观测台', moduleType: 'research', description: 'Long-term observation post monitoring ecosystem changes in the deep.', maxLevel: 5, baseBuildCost: 1000, baseUpgradeCost: 450, bonusType: 'xp_boost', baseBonusValue: 12, emoji: '🔭' },
  { id: 'teleporter_pad', name: 'Teleporter Pad', nameZh: '传送平台', moduleType: 'power', description: 'Experimental technology for instant resource transfer to the surface.', maxLevel: 3, baseBuildCost: 2000, baseUpgradeCost: 1000, bonusType: 'coin_boost', baseBonusValue: 10, emoji: '🌀' },
  { id: 'leviathan_pen', name: 'Leviathan Enclosure', nameZh: '利维坦围栏', moduleType: 'aquarium', description: 'A massive reinforced pen capable of holding legendary deep-sea creatures.', maxLevel: 3, baseBuildCost: 2500, baseUpgradeCost: 1200, bonusType: 'coin_boost', baseBonusValue: 15, emoji: '🐊' },
];

// ---- 22 Deep-Sea Equipment ----

export const DT_EQUIPMENT: DtEquipmentDef[] = [
  // Suits (6)
  { id: 'basic_diving_suit', name: 'Basic Diving Suit', nameZh: '基础潜水服', slot: 'suit', description: 'Standard issue pressure suit rated for 1000m depth.', maxDepthBonus: 200, pressureResist: 10, speedBonus: 0, sonarBoost: 0, rarity: 'common', cost: 0, requiredLevel: 1, emoji: '🥽' },
  { id: 'reinforced_suit', name: 'Reinforced Pressure Suit', nameZh: '加压潜水服', slot: 'suit', description: 'Double-walled titanium suit withstood pressure tests to 4000m.', maxDepthBonus: 800, pressureResist: 30, speedBonus: 0, sonarBoost: 0, rarity: 'uncommon', cost: 500, requiredLevel: 3, emoji: '🛡️' },
  { id: 'abyssal_exosuit', name: 'Abyssal Exosuit', nameZh: '深渊外骨骼', slot: 'suit', description: 'Powered exoskeleton suit enabling movement at crushing depths.', maxDepthBonus: 2000, pressureResist: 60, speedBonus: 2, sonarBoost: 0, rarity: 'rare', cost: 2000, requiredLevel: 8, emoji: '🤖' },
  { id: 'hadal_walker', name: 'Hadal Walker Suit', nameZh: '超深渊行走服', slot: 'suit', description: 'Cutting-edge suit using crystalline pressure redistribution technology.', maxDepthBonus: 4000, pressureResist: 80, speedBonus: 3, sonarBoost: 0, rarity: 'epic', cost: 8000, requiredLevel: 15, emoji: '🚀' },
  { id: 'void_dive_suit', name: 'Void Dive Armor', nameZh: '虚空潜水装甲', slot: 'suit', description: 'Armor incorporating void ore — theoretically pressure-proof at any depth.', maxDepthBonus: 8000, pressureResist: 95, speedBonus: 4, sonarBoost: 5, rarity: 'legendary', cost: 30000, requiredLevel: 25, emoji: '⚫' },
  { id: 'leviathan_scale_suit', name: 'Leviathan Scale Suit', nameZh: '利维坦鳞甲', slot: 'suit', description: 'Crafted from shed leviathan scales, each one a perfect pressure seal.', maxDepthBonus: 6000, pressureResist: 90, speedBonus: 5, sonarBoost: 10, rarity: 'legendary', cost: 25000, requiredLevel: 22, emoji: '🐉' },
  // Head (5)
  { id: 'basic_helmet', name: 'Standard Helmet', nameZh: '标准头盔', slot: 'head', description: 'Toughened glass helmet with LED headlamp.', maxDepthBonus: 0, pressureResist: 5, speedBonus: 0, sonarBoost: 20, rarity: 'common', cost: 0, requiredLevel: 1, emoji: '⛑️' },
  { id: 'sonar_helm', name: 'Sonar Commander Helm', nameZh: '声纳指挥头盔', slot: 'head', description: 'Integrated active sonar with 3D mapping display.', maxDepthBonus: 0, pressureResist: 15, speedBonus: 0, sonarBoost: 80, rarity: 'rare', cost: 1500, requiredLevel: 7, emoji: '📡' },
  { id: 'biolum_visor', name: 'Bioluminescence Visor', nameZh: '生物发光面罩', slot: 'head', description: 'Enhances natural bioluminescence, revealing hidden creatures.', maxDepthBonus: 0, pressureResist: 20, speedBonus: 0, sonarBoost: 50, rarity: 'uncommon', cost: 400, requiredLevel: 4, emoji: '🥽' },
  { id: 'abyssal_crown', name: 'Crown of the Deep', nameZh: '深渊王冠', slot: 'head', description: 'An ancient headpiece of unknown origin that enhances all senses at depth.', maxDepthBonus: 500, pressureResist: 40, speedBonus: 1, sonarBoost: 120, rarity: 'epic', cost: 6000, requiredLevel: 12, emoji: '👑' },
  { id: 'phasing_helm', name: 'Phase Shifting Helm', nameZh: '相位头盔', slot: 'head', description: 'Helm that partially phases the wearer out of normal space, reducing pressure.', maxDepthBonus: 3000, pressureResist: 70, speedBonus: 2, sonarBoost: 60, rarity: 'legendary', cost: 20000, requiredLevel: 20, emoji: '🌀' },
  // Tools (6)
  { id: 'basic_flashlight', name: 'Dive Flashlight', nameZh: '潜水手电', slot: 'tool', description: 'High-lumen waterproof flashlight for dark waters.', maxDepthBonus: 0, pressureResist: 0, speedBonus: 0, sonarBoost: 10, rarity: 'common', cost: 50, requiredLevel: 1, emoji: '🔦' },
  { id: 'harvest_claw', name: 'Mechanical Harvest Claw', nameZh: '机械收割爪', slot: 'tool', description: 'Hydraulic claw for collecting specimens and mineral samples.', maxDepthBonus: 0, pressureResist: 0, speedBonus: 0, sonarBoost: 0, rarity: 'common', cost: 100, requiredLevel: 2, emoji: '🦾' },
  { id: 'mining_laser_mk1', name: 'Mining Laser Mk.I', nameZh: '采矿激光器 I型', slot: 'tool', description: 'Precision laser cutter for extracting minerals from the seafloor.', maxDepthBonus: 0, pressureResist: 0, speedBonus: 2, sonarBoost: 0, rarity: 'uncommon', cost: 600, requiredLevel: 5, emoji: '🔫' },
  { id: 'sonar_probe', name: 'Deployable Sonar Probe', nameZh: '声纳探测器', slot: 'tool', description: 'Launches a probe that maps a 500m radius around the diver.', maxDepthBonus: 0, pressureResist: 0, speedBonus: 0, sonarBoost: 200, rarity: 'rare', cost: 2500, requiredLevel: 8, emoji: '🛰️' },
  { id: 'xeno_tool', name: 'Xeno Extractor', nameZh: '异形提取器', slot: 'tool', description: 'Alien technology that harvests resources without physical contact.', maxDepthBonus: 1000, pressureResist: 10, speedBonus: 3, sonarBoost: 30, rarity: 'epic', cost: 7000, requiredLevel: 14, emoji: '🔧' },
  { id: 'void_key', name: 'Key of the Void', nameZh: '虚空之钥', slot: 'tool', description: 'A crystalline key that unlocks hidden chambers in the deep unknown.', maxDepthBonus: 2000, pressureResist: 20, speedBonus: 5, sonarBoost: 150, rarity: 'legendary', cost: 25000, requiredLevel: 28, emoji: '🗝️' },
  // Vehicles (5)
  { id: 'mini_sub', name: 'Mini Submersible', nameZh: '小型潜水器', slot: 'vehicle', description: 'Compact one-person sub rated to 2000m with basic sonar.', maxDepthBonus: 1000, pressureResist: 20, speedBonus: 3, sonarBoost: 40, rarity: 'common', cost: 800, requiredLevel: 3, emoji: '🔵' },
  { id: 'deep_diver_sub', name: 'Deep Diver Sub', nameZh: '深潜潜水器', slot: 'vehicle', description: 'Research submarine rated to 5000m with external manipulator arms.', maxDepthBonus: 3000, pressureResist: 40, speedBonus: 4, sonarBoost: 80, rarity: 'uncommon', cost: 3000, requiredLevel: 7, emoji: '🟢' },
  { id: 'crystal_sub', name: 'Crystal Submarine', nameZh: '水晶潜艇', slot: 'vehicle', description: 'Submersible with crystalline hull that amplifies sonar signals.', maxDepthBonus: 5000, pressureResist: 60, speedBonus: 5, sonarBoost: 150, rarity: 'rare', cost: 10000, requiredLevel: 12, emoji: '🟣' },
  { id: 'abyss_walker_sub', name: 'Abyss Walker', nameZh: '深渊行者号', slot: 'vehicle', description: 'Heavy-duty sub built for hadal zone exploration with reinforced titanium hull.', maxDepthBonus: 7000, pressureResist: 80, speedBonus: 6, sonarBoost: 200, rarity: 'epic', cost: 25000, requiredLevel: 18, emoji: '🔴' },
  { id: 'leviathan_sub', name: 'Leviathan Class', nameZh: '利维坦级', slot: 'vehicle', description: 'The ultimate deep-sea vessel. Named after the beast it was built to study.', maxDepthBonus: 10000, pressureResist: 99, speedBonus: 8, sonarBoost: 300, rarity: 'legendary', cost: 80000, requiredLevel: 30, emoji: '🔱' },
];

// ---- 18 Achievements ----

export const DT_ACHIEVEMENTS: DtAchievementDef[] = [
  { id: 'ach_first_dive', name: 'First Descent', nameZh: '初次下潜', description: 'Complete your first trench exploration dive.', conditionKey: 'totalDives', targetValue: 1, rewardCoins: 25, rewardXP: 10, emoji: '🤿' },
  { id: 'ach_depth_1000', name: 'Into the Dark', nameZh: '进入黑暗', description: 'Reach a depth of 1,000 meters.', conditionKey: 'maxDepthReached', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '🌑' },
  { id: 'ach_depth_5000', name: 'Abyssal Pioneer', nameZh: '深渊先驱', description: 'Reach a depth of 5,000 meters.', conditionKey: 'maxDepthReached', targetValue: 5000, rewardCoins: 500, rewardXP: 250, emoji: '🕳️' },
  { id: 'ach_depth_10000', name: 'The Bottom', nameZh: '触底', description: 'Reach a depth of 10,000 meters.', conditionKey: 'maxDepthReached', targetValue: 10000, rewardCoins: 2000, rewardXP: 1000, emoji: '👁️' },
  { id: 'ach_creatures_10', name: 'Naturalist', nameZh: '自然学家', description: 'Discover 10 different abyssal creatures.', conditionKey: 'discoveredCreatures', targetValue: 10, rewardCoins: 200, rewardXP: 100, emoji: '🐟' },
  { id: 'ach_creatures_25', name: 'Deep Biologist', nameZh: '深海生物学家', description: 'Discover 25 different abyssal creatures.', conditionKey: 'discoveredCreatures', targetValue: 25, rewardCoins: 1000, rewardXP: 500, emoji: '🔬' },
  { id: 'ach_all_creatures', name: 'Catalog Complete', nameZh: '图鉴完成', description: 'Discover all 35 abyssal creatures.', conditionKey: 'discoveredCreatures', targetValue: 35, rewardCoins: 5000, rewardXP: 2500, emoji: '📖' },
  { id: 'ach_harvest_100', name: 'Resource Baron', nameZh: '资源大亨', description: 'Harvest 100 total abyssal resources.', conditionKey: 'totalHarvestCount', targetValue: 100, rewardCoins: 300, rewardXP: 150, emoji: '⛏️' },
  { id: 'ach_station_5', name: 'Station Chief', nameZh: '站长', description: 'Build 5 research station modules.', conditionKey: 'stationCount', targetValue: 5, rewardCoins: 400, rewardXP: 200, emoji: '🏗️' },
  { id: 'ach_station_all', name: 'Deep Complex', nameZh: '深海综合体', description: 'Build all 25 research station modules.', conditionKey: 'stationCount', targetValue: 25, rewardCoins: 5000, rewardXP: 2500, emoji: '🏛️' },
  { id: 'ach_vent_5', name: 'Vent Veteran', nameZh: '热泉老兵', description: 'Complete 5 hydrothermal vent events.', conditionKey: 'ventEventsCompleted', targetValue: 5, rewardCoins: 500, rewardXP: 250, emoji: '🌋' },
  { id: 'ach_daily_7', name: 'Week of Dives', nameZh: '一周潜水', description: 'Complete 7 daily deep dive quests.', conditionKey: 'dailyDivesCompleted', targetValue: 7, rewardCoins: 300, rewardXP: 150, emoji: '📅' },
  { id: 'ach_equipment_10', name: 'Fully Equipped', nameZh: '全副武装', description: 'Own 10 different pieces of deep-sea equipment.', conditionKey: 'equipmentCount', targetValue: 10, rewardCoins: 400, rewardXP: 200, emoji: '🦾' },
  { id: 'ach_level_25', name: 'Deep Expert', nameZh: '深海专家', description: 'Reach diver level 25.', conditionKey: 'level', targetValue: 25, rewardCoins: 1500, rewardXP: 750, emoji: '⭐' },
  { id: 'ach_level_50', name: 'Abyssal Overlord', nameZh: '深渊霸主', description: 'Reach the maximum diver level 50.', conditionKey: 'level', targetValue: 50, rewardCoins: 10000, rewardXP: 5000, emoji: '👑' },
  { id: 'ach_all_zones', name: 'Cartographer', nameZh: '制图师', description: 'Discover all 8 trench zones.', conditionKey: 'zonesDiscovered', targetValue: 8, rewardCoins: 2000, rewardXP: 1000, emoji: '🗺️' },
  { id: 'ach_coins_100k', name: 'Deep Tycoon', nameZh: '深渊大亨', description: 'Accumulate 100,000 coins.', conditionKey: 'totalCoinsEarned', targetValue: 100000, rewardCoins: 5000, rewardXP: 2500, emoji: '💰' },
  { id: 'ach_legendary_3', name: 'Legendary Hunter', nameZh: '传奇猎人', description: 'Encounter 3 legendary creatures.', conditionKey: 'legendaryEncounterCount', targetValue: 3, rewardCoins: 2000, rewardXP: 1000, emoji: '🌟' },
];

// ---- 8 Titles ----

export const DT_TITLES: DtTitleInfo[] = [
  { id: 'title_surface', name: 'Surface Diver', nameZh: '水面潜水员', requiredLevel: 1, description: 'A newcomer taking their first steps beneath the waves.' },
  { id: 'title_twilight', name: 'Twilight Explorer', nameZh: '暮光探索者', requiredLevel: 5, description: 'Comfortable in the fading light where strange creatures dwell.' },
  { id: 'title_midnight', name: 'Midnight Diver', nameZh: '午夜潜水员', requiredLevel: 10, description: 'Bold enough to enter the permanent darkness of the midnight zone.' },
  { id: 'title_abyssal', name: 'Abyssal Pioneer', nameZh: '深渊先驱', requiredLevel: 18, description: 'A veteran explorer of the crushing abyssal plains.' },
  { id: 'title_hadal', name: 'Hadal Descent', nameZh: '海沟下降者', requiredLevel: 25, description: 'One of the few who has entered the hadal trench and returned.' },
  { id: 'title_vent', name: 'Vent Master', nameZh: '热泉大师', requiredLevel: 32, description: 'Master of the superheated hydrothermal vent ecosystems.' },
  { id: 'title_unknown', name: 'Deep Unknown Seeker', nameZh: '未知深渊追寻者', requiredLevel: 42, description: 'A seeker of truths beyond the edge of human knowledge.' },
  { id: 'title_overlord', name: 'Abyssal Overlord', nameZh: '深渊霸主', requiredLevel: 50, description: 'Supreme ruler of the deepest trenches. The ocean bows to you.' },
];

// ---- 8 Daily Dive Quests ----

export const DT_DAILY_DIVE_POOL: DtDailyDiveDef[] = [
  { id: 'daily_explore_3', name: 'Daily Exploration', nameZh: '每日探索', description: 'Explore 3 zones today.', type: 'explore', target: 3, rewardCoins: 50, rewardXP: 25, emoji: '🤿' },
  { id: 'daily_explore_5', name: 'Deep Expedition', nameZh: '深度远征', description: 'Explore 5 zones today.', type: 'explore', target: 5, rewardCoins: 100, rewardXP: 50, emoji: '🌊' },
  { id: 'daily_harvest_10', name: 'Resource Run', nameZh: '资源采集', description: 'Harvest 10 resources today.', type: 'harvest', target: 10, rewardCoins: 40, rewardXP: 20, emoji: '⛏️' },
  { id: 'daily_harvest_20', name: 'Mining Spree', nameZh: '采矿狂潮', description: 'Harvest 20 resources today.', type: 'harvest', target: 20, rewardCoins: 80, rewardXP: 40, emoji: '💎' },
  { id: 'daily_discover_2', name: 'Creature Watch', nameZh: '生物观察', description: 'Discover 2 new creatures today.', type: 'discover', target: 2, rewardCoins: 60, rewardXP: 30, emoji: '🐠' },
  { id: 'daily_discover_5', name: 'Biodiversity Day', nameZh: '生物多样性日', description: 'Discover 5 new creatures today.', type: 'discover', target: 5, rewardCoins: 150, rewardXP: 75, emoji: '🔍' },
  { id: 'daily_build_1', name: 'Construction Duty', nameZh: '建设任务', description: 'Build or upgrade 1 station module today.', type: 'build', target: 1, rewardCoins: 70, rewardXP: 35, emoji: '🏗️' },
  { id: 'daily_build_3', name: 'Station Expansion', nameZh: '站点扩建', description: 'Build or upgrade 3 station modules today.', type: 'build', target: 3, rewardCoins: 200, rewardXP: 100, emoji: '🏭' },
];

// ---- 10 Hydrothermal Vent Events ----

export const DT_VENT_EVENTS: DtVentEventDef[] = [
  { id: 'vent_eruption', name: 'Vent Eruption', nameZh: '热泉喷发', description: 'A massive eruption sends superheated water and minerals in all directions.', duration: 30, rewardCoins: 200, rewardXP: 100, riskLevel: 5, emoji: '🌋' },
  { id: 'vent_calm', name: 'Vent Serenity', nameZh: '热泉宁静', description: 'The vents settle into a rare calm state, revealing hidden mineral deposits.', duration: 60, rewardCoins: 300, rewardXP: 150, riskLevel: 1, emoji: '😌' },
  { id: 'vent_migration', name: 'Creature Migration', nameZh: '生物迁徙', description: 'Rare creatures swarm toward the vent warmth. Perfect discovery opportunity.', duration: 45, rewardCoins: 150, rewardXP: 200, riskLevel: 2, emoji: '🐟' },
  { id: 'vent_tremor', name: 'Seafloor Tremor', nameZh: '海底震动', description: 'A seismic event shakes the station. Resources may be dislodged or destroyed.', duration: 20, rewardCoins: 100, rewardXP: 50, riskLevel: 7, emoji: '💥' },
  { id: 'vent_crystal_bloom', name: 'Crystal Bloom', nameZh: '水晶绽放', description: 'Vent crystals grow at accelerated rate for a limited time.', duration: 50, rewardCoins: 250, rewardXP: 120, riskLevel: 2, emoji: '💎' },
  { id: 'vent_fossil_exposure', name: 'Fossil Exposure', nameZh: '化石出露', description: 'Geothermal activity exposes ancient fossils from the seafloor.', duration: 40, rewardCoins: 350, rewardXP: 180, riskLevel: 3, emoji: '🦴' },
  { id: 'vent_brine_overflow', name: 'Brine Overflow', nameZh: '卤水溢出', description: 'Brine pool overflows into vent area, creating extreme salinity zone.', duration: 35, rewardCoins: 180, rewardXP: 90, riskLevel: 4, emoji: '🧪' },
  { id: 'vent_biolum_surge', name: 'Bioluminescence Surge', nameZh: '生物发光潮涌', description: 'A massive wave of bioluminescent energy illuminates the entire region.', duration: 30, rewardCoins: 120, rewardXP: 150, riskLevel: 1, emoji: '✨' },
  { id: 'vent_leviathan', name: 'Leviathan Passes', nameZh: '利维坦经过', description: 'The legendary leviathan swims past the vents, disturbing everything.', duration: 25, rewardCoins: 500, rewardXP: 300, riskLevel: 9, emoji: '🐍' },
  { id: 'vent_temporal_rift', name: 'Temporal Rift', nameZh: '时间裂缝', description: 'A brief rift in time-space near the vents. Reality warps for a moment.', duration: 15, rewardCoins: 1000, rewardXP: 500, riskLevel: 8, emoji: '🌀' },
];

// ============================================================
// Initial State Factory
// ============================================================

function dtCreateInitialState(seed?: number): DtDeepSeaTrenchState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    diverName: 'Diver',
    level: 1,
    xp: 0,
    coins: 200,
    totalXp: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    currentTitleId: 'title_surface',
    currentZoneId: 'twilight_shelf',
    currentDepth: 0,
    maxDepthReached: 0,
    discoveredZoneIds: ['twilight_shelf'],
    oxygen: 100,
    maxOxygen: 100,
    pressure: 100,
    hullIntegrity: 100,
    discoveredCreatures: [],
    legendaryEncounterCount: 0,
    totalEncounterCount: 0,
    harvestedResources: {},
    totalHarvestCount: 0,
    stationModules: [],
    stationPower: 0,
    ownedEquipment: ['basic_diving_suit', 'basic_helmet', 'basic_flashlight'],
    equippedItems: [
      { equipmentId: 'basic_diving_suit' },
      { equipmentId: 'basic_helmet' },
      { equipmentId: 'basic_flashlight' },
    ],
    achievements: DT_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    dailyStreak: 0,
    lastDailyKey: null,
    dailyDivesCompleted: 0,
    activeVentEvent: null,
    ventEventsCompleted: 0,
    activeQuests: [],
    completedQuestIds: [],
    expeditionLogs: [],
    seed: effectiveSeed,
    diveCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    harvestCountByCategory: { mineral: 0, fluid: 0, fossil: 0, crystal: 0, organic: 0 },
    stationUpgradeCount: 0,
  };
}

// ============================================================
// Quest progress helper (processes inside setState)
// ============================================================

function dtProcessQuestProgress(state: DtDeepSeaTrenchState, type: string, amount: number): DtDeepSeaTrenchState {
  let s = state;
  for (const q of s.activeQuests) {
    if (q.completed) continue;
    const questMatch = type === 'explore' || type === 'harvest' || type === 'discover' || type === 'build';
    if (!questMatch) continue;
    const newProgress = q.progress + amount;
    if (newProgress >= 10) {
      s = {
        ...s,
        activeQuests: s.activeQuests.map((aq) =>
          aq.questId === q.questId ? { ...aq, progress: newProgress, completed: true } : aq
        ),
      };
    } else {
      s = {
        ...s,
        activeQuests: s.activeQuests.map((aq) =>
          aq.questId === q.questId ? { ...aq, progress: newProgress } : aq
        ),
      };
    }
  }
  return s;
}

// ============================================================
// Hook: useDeepSeaTrench
// ============================================================

export default function useDeepSeaTrench(initialSeed?: number) {
  const [state, setState] = useState<DtDeepSeaTrenchState>(() => dtCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(dtMulberry32(state.seed));

  // Keep prngRef.current in sync with state.seed via useEffect
  useEffect(() => {
    prngRef.current = dtMulberry32(state.seed);
  }, [state.seed]);

  // ---- Core State ----

  const dtGetState = useCallback((): Readonly<DtDeepSeaTrenchState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const dtResetState = useCallback((newSeed?: number) => {
    const s = dtCreateInitialState(newSeed);
    setState(s);
  }, []);

  // ---- PRNG helpers ----

  const dtRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const dtRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const dtRandomChoice = useCallback(<T,>(arr: T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP / Coins ----

  const dtGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const dtGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const dtGetXPTillNext = useCallback((): number => {
    return dtXpRequiredForLevel(state.level);
  }, [state.level]);

  const dtAddXP = useCallback((amount: number): { leveledUp: boolean; newLevel: number; state: DtDeepSeaTrenchState } => {
    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += amount;
      let leveledUp = false;
      while (level < DT_MAX_LEVEL && xp >= dtXpRequiredForLevel(level)) {
        xp -= dtXpRequiredForLevel(level);
        level += 1;
        leveledUp = true;
      }
      if (level >= DT_MAX_LEVEL) xp = 0;
      next = { ...prev, level: dtClampLevel(level), xp, totalXp: prev.totalXp + amount };
      return next;
    });
    return { leveledUp: next.level > state.level, newLevel: next.level, state: next };
  }, [state]);

  const dtGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const dtAddCoins = useCallback((amount: number): DtDeepSeaTrenchState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: dtClampCoins(prev.coins + amount), totalCoinsEarned: prev.totalCoinsEarned + amount };
      return next;
    });
    return next;
  }, [state]);

  const dtSpendCoins = useCallback((amount: number): { success: boolean; state: DtDeepSeaTrenchState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: dtClampCoins(prev.coins - amount), totalCoinsSpent: prev.totalCoinsSpent + amount };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Title ----

  const dtGetCurrentTitle = useCallback((): DtTitleInfo => {
    const title = DT_TITLES.find((t) => t.id === state.currentTitleId);
    return title ?? DT_TITLES[0];
  }, [state.currentTitleId]);

  const dtGetAllTitles = useCallback((): DtTitleInfo[] => {
    return [...DT_TITLES];
  }, []);

  const dtGetUnlockedTitles = useCallback((): DtTitleInfo[] => {
    return DT_TITLES.filter((t) => state.level >= t.requiredLevel);
  }, [state.level]);

  const dtSetTitle = useCallback((titleId: string): { success: boolean; state: DtDeepSeaTrenchState } => {
    const title = DT_TITLES.find((t) => t.id === titleId);
    if (!title) return { success: false, state };
    if (state.level < title.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, currentTitleId: titleId };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Zones ----

  const dtGetZones = useCallback((): DtZoneDef[] => {
    return [...DT_ZONES];
  }, []);

  const dtGetCurrentZone = useCallback((): DtZoneDef | null => {
    return DT_ZONES.find((z) => z.id === state.currentZoneId) ?? null;
  }, [state.currentZoneId]);

  const dtGetDiscoveredZones = useCallback((): DtZoneDef[] => {
    return DT_ZONES.filter((z) => state.discoveredZoneIds.includes(z.id));
  }, [state.discoveredZoneIds]);

  const dtGetLockedZones = useCallback((): DtZoneDef[] => {
    return DT_ZONES.filter((z) => !state.discoveredZoneIds.includes(z.id));
  }, [state.discoveredZoneIds]);

  const dtSetCurrentZone = useCallback((zoneId: DtZoneId): { success: boolean; state: DtDeepSeaTrenchState } => {
    const zone = DT_ZONES.find((z) => z.id === zoneId);
    if (!zone) return { success: false, state };
    if (!state.discoveredZoneIds.includes(zoneId)) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, currentZoneId: zoneId, currentDepth: zone.depthRange[0] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtDiscoverZone = useCallback((zoneId: DtZoneId): { success: boolean; state: DtDeepSeaTrenchState } => {
    if (state.discoveredZoneIds.includes(zoneId)) return { success: false, state };
    const zone = DT_ZONES.find((z) => z.id === zoneId);
    if (!zone || state.level < zone.unlockLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, discoveredZoneIds: [...prev.discoveredZoneIds, zoneId] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Depth & Pressure ----

  const dtGetCurrentDepth = useCallback((): number => {
    return state.currentDepth;
  }, [state.currentDepth]);

  const dtGetMaxDepth = useCallback((): number => {
    return state.maxDepthReached;
  }, [state.maxDepthReached]);

  const dtGetOxygen = useCallback((): number => {
    return state.oxygen;
  }, [state.oxygen]);

  const dtGetHullIntegrity = useCallback((): number => {
    return state.hullIntegrity;
  }, [state.hullIntegrity]);

  const dtGetMaxDiveDepth = useCallback((): number => {
    const equippedSuit = state.equippedItems.find((e) => {
      const eq = DT_EQUIPMENT.find((d) => d.id === e.equipmentId);
      return eq?.slot === 'suit';
    });
    if (!equippedSuit) return 200;
    const def = DT_EQUIPMENT.find((d) => d.id === equippedSuit.equipmentId);
    const suitDepth = def?.maxDepthBonus ?? 200;

    const pressureChamber = state.stationModules.find((m) => m.moduleId === 'pressure_chamber');
    const chamberBonus = pressureChamber ? (pressureChamber.level - 1) * 200 : 0;

    return suitDepth + chamberBonus;
  }, [state.equippedItems, state.stationModules]);

  const dtDescend = useCallback((meters: number): { success: boolean; newDepth: number; state: DtDeepSeaTrenchState } => {
    const maxDepth = dtGetMaxDiveDepth();
    const newDepth = Math.min(state.currentDepth + meters, maxDepth);
    if (newDepth <= state.currentDepth) return { success: false, newDepth: state.currentDepth, state };

    let next = state;
    setState((prev) => {
      const oxygenDrain = Math.floor(meters * 0.05);
      const newOxygen = Math.max(0, prev.oxygen - oxygenDrain);
      next = {
        ...prev,
        currentDepth: newDepth,
        oxygen: newOxygen,
        maxDepthReached: Math.max(prev.maxDepthReached, newDepth),
      };
      return next;
    });
    return { success: true, newDepth, state: next };
  }, [state, dtGetMaxDiveDepth]);

  const dtSurface = useCallback((): DtDeepSeaTrenchState => {
    let next = state;
    setState((prev) => {
      const zone = DT_ZONES.find((z) => z.id === prev.currentZoneId);
      next = {
        ...prev,
        currentDepth: zone?.depthRange[0] ?? 0,
        oxygen: prev.maxOxygen,
        pressure: 100,
        hullIntegrity: 100,
      };
      return next;
    });
    return next;
  }, [state]);

  // ---- Creatures ----

  const dtGetCreatures = useCallback((): DtCreatureDef[] => {
    return [...DT_CREATURES];
  }, []);

  const dtGetCreatureById = useCallback((id: string): DtCreatureDef | null => {
    return DT_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const dtGetDiscoveredCreatures = useCallback((): DtCreatureDef[] => {
    return state.discoveredCreatures
      .map((dc) => DT_CREATURES.find((c) => c.id === dc.creatureId))
      .filter((c): c is DtCreatureDef => c !== null);
  }, [state.discoveredCreatures]);

  const dtGetUndiscoveredCreatures = useCallback((): DtCreatureDef[] => {
    const discoveredIds = new Set(state.discoveredCreatures.map((dc) => dc.creatureId));
    return DT_CREATURES.filter((c) => !discoveredIds.has(c.id));
  }, [state.discoveredCreatures]);

  const dtIsCreatureDiscovered = useCallback((creatureId: string): boolean => {
    return state.discoveredCreatures.some((dc) => dc.creatureId === creatureId);
  }, [state.discoveredCreatures]);

  const dtDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: DtDeepSeaTrenchState } => {
    const creature = DT_CREATURES.find((c) => c.id === creatureId);
    if (!creature) return { success: false, state };
    if (state.discoveredCreatures.some((dc) => dc.creatureId === creatureId)) return { success: false, state };
    if (state.level < creature.requiredLevel) return { success: false, state };

    const now = Date.now();
    const xpGain = Math.floor(creature.xpReward * dtRarityMultiplier(creature.rarity));
    const coinGain = Math.floor(creature.coinReward * dtRarityMultiplier(creature.rarity));
    const isLegendary = creature.rarity === 'legendary';

    let next = state;
    setState((prev) => {
      let updated = {
        ...prev,
        discoveredCreatures: [
          ...prev.discoveredCreatures,
          { creatureId, discoveredAt: now, documented: false },
        ],
        coins: dtClampCoins(prev.coins + coinGain),
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        totalEncounterCount: prev.totalEncounterCount + 1,
        legendaryEncounterCount: prev.legendaryEncounterCount + (isLegendary ? 1 : 0),
        diveCountByRarity: {
          ...prev.diveCountByRarity,
          [creature.rarity]: prev.diveCountByRarity[creature.rarity] + 1,
        },
      };
      // XP with level up
      let { level, xp } = updated;
      xp += xpGain;
      while (level < DT_MAX_LEVEL && xp >= dtXpRequiredForLevel(level)) {
        xp -= dtXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= DT_MAX_LEVEL) xp = 0;
      updated = { ...updated, level: dtClampLevel(level), xp, totalXp: prev.totalXp + xpGain };

      // Auto discover zone if new creature is from undiscovered zone
      if (!prev.discoveredZoneIds.includes(creature.zoneId)) {
        const zone = DT_ZONES.find((z) => z.id === creature.zoneId);
        if (zone && level >= zone.unlockLevel) {
          updated = { ...updated, discoveredZoneIds: [...updated.discoveredZoneIds, creature.zoneId] };
        }
      }

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const dailyDef = DT_DAILY_DIVE_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (dailyDef && dailyDef.type === 'discover') {
          updated = {
            ...updated,
            dailyTask: { ...updated.dailyTask!, progress: updated.dailyTask!.progress + 1 },
          };
        }
      }

      next = updated;
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtDocumentCreature = useCallback((creatureId: string): { success: boolean; state: DtDeepSeaTrenchState } => {
    if (!state.discoveredCreatures.some((dc) => dc.creatureId === creatureId)) return { success: false, state };
    const alreadyDocumented = state.discoveredCreatures.find((dc) => dc.creatureId === creatureId)?.documented;
    if (alreadyDocumented) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        discoveredCreatures: prev.discoveredCreatures.map((dc) =>
          dc.creatureId === creatureId ? { ...dc, documented: true } : dc
        ),
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtExploreZone = useCallback((zoneId: DtZoneId, now: number = Date.now()): { success: boolean; discovered: DtCreatureDef | null; resources: DtResourceDef[]; xp: number; coins: number; state: DtDeepSeaTrenchState } => {
    if (!state.discoveredZoneIds.includes(zoneId)) return { success: false, discovered: null, resources: [], xp: 0, coins: 0, state };
    const zone = DT_ZONES.find((z) => z.id === zoneId);
    if (!zone) return { success: false, discovered: null, resources: [], xp: 0, coins: 0, state };

    // Creature encounter check
    const undiscoveredInZone = DT_CREATURES.filter(
      (c) => c.zoneId === zoneId && !state.discoveredCreatures.some((dc) => dc.creatureId === c.id) && state.level >= c.requiredLevel
    );

    let discovered: DtCreatureDef | null = null;
    if (undiscoveredInZone.length > 0) {
      const roll = prngRef.current();
      const rarityWeights: Record<DtRarity, number> = { common: 0.4, uncommon: 0.25, rare: 0.15, epic: 0.1, legendary: 0.05 };
      const weightedCreatures = undiscoveredInZone.map((c) => ({ creature: c, weight: rarityWeights[c.rarity] }));
      const totalWeight = weightedCreatures.reduce((s, w) => s + w.weight, 0);
      let r = roll * totalWeight;
      for (const wc of weightedCreatures) {
        r -= wc.weight;
        if (r <= 0) {
          discovered = wc.creature;
          break;
        }
      }
    }

    // Resource harvest check
    const zoneResources = DT_RESOURCES.filter((res) => res.zoneId === zoneId);
    const harvestedResources: DtResourceDef[] = [];
    const harvestRolls = 1 + Math.floor(prngRef.current() * 3);
    for (let i = 0; i < harvestRolls; i++) {
      if (zoneResources.length > 0 && prngRef.current() > 0.3) {
        const res = zoneResources[Math.floor(prngRef.current() * zoneResources.length)];
        if (res) harvestedResources.push(res);
      }
    }

    const xpGain = Math.floor((10 + zone.dangerLevel * 5) * dtRarityMultiplier(discovered?.rarity ?? 'common'));
    const coinGain = Math.floor((5 + zone.dangerLevel * 3) * dtRarityMultiplier(discovered?.rarity ?? 'common'));

    let next = state;
    setState((prev) => {
      let updated = { ...prev, totalEncounterCount: prev.totalEncounterCount + 1 };

      if (discovered) {
        updated = {
          ...updated,
          discoveredCreatures: [
            ...updated.discoveredCreatures,
            { creatureId: discovered.id, discoveredAt: now, documented: false },
          ],
          legendaryEncounterCount: updated.legendaryEncounterCount + (discovered.rarity === 'legendary' ? 1 : 0),
          diveCountByRarity: {
            ...updated.diveCountByRarity,
            [discovered.rarity]: updated.diveCountByRarity[discovered.rarity] + 1,
          },
        };
      }

      if (harvestedResources.length > 0) {
        const newResources = { ...updated.harvestedResources };
        const newCategoryCount = { ...updated.harvestCountByCategory };
        for (const res of harvestedResources) {
          newResources[res.id] = (newResources[res.id] ?? 0) + 1;
          newCategoryCount[res.category] = (newCategoryCount[res.category] ?? 0) + 1;
        }
        updated = { ...updated, harvestedResources: newResources, harvestCountByCategory: newCategoryCount, totalHarvestCount: updated.totalHarvestCount + harvestedResources.length };
      }

      // XP and coins
      updated = {
        ...updated,
        coins: dtClampCoins(updated.coins + coinGain),
        totalCoinsEarned: updated.totalCoinsEarned + coinGain,
      };
      let { level, xp } = updated;
      xp += xpGain;
      while (level < DT_MAX_LEVEL && xp >= dtXpRequiredForLevel(level)) {
        xp -= dtXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= DT_MAX_LEVEL) xp = 0;
      updated = { ...updated, level: dtClampLevel(level), xp, totalXp: updated.totalXp + xpGain };

      // Auto discover zone for discovered creature
      if (discovered && !updated.discoveredZoneIds.includes(discovered.zoneId)) {
        const z = DT_ZONES.find((zz) => zz.id === discovered.zoneId);
        if (z && level >= z.unlockLevel) {
          updated = { ...updated, discoveredZoneIds: [...updated.discoveredZoneIds, discovered.zoneId] };
        }
      }

      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const dailyDef = DT_DAILY_DIVE_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (dailyDef) {
          let progressInc = 0;
          if (dailyDef.type === 'explore') progressInc = 1;
          if (dailyDef.type === 'discover' && discovered) progressInc = 1;
          if (dailyDef.type === 'harvest' && harvestedResources.length > 0) progressInc = harvestedResources.length;
          if (progressInc > 0) {
            updated = { ...updated, dailyTask: { ...updated.dailyTask!, progress: updated.dailyTask!.progress + progressInc } };
          }
        }
      }

      // Expedition log
      const log: DtExpeditionLog = {
        id: `log_${now}_${zoneId}`,
        timestamp: now,
        zoneId,
        depth: zone.depthRange[0] + Math.floor(prngRef.current() * (zone.depthRange[1] - zone.depthRange[0])),
        event: discovered ? `Discovered: ${discovered.name}` : 'Explored zone',
        details: harvestedResources.length > 0 ? `Harvested ${harvestedResources.length} resource(s)` : 'No resources found',
      };
      updated = { ...updated, expeditionLogs: [...updated.expeditionLogs.slice(-50), log] };

      next = updated;
      return next;
    });

    return { success: true, discovered, resources: harvestedResources, xp: xpGain, coins: coinGain, state: next };
  }, [state]);

  // ---- Resources ----

  const dtGetResources = useCallback((): DtResourceDef[] => {
    return [...DT_RESOURCES];
  }, []);

  const dtGetResourceInventory = useCallback((): Record<string, number> => {
    return { ...state.harvestedResources };
  }, [state.harvestedResources]);

  const dtGetResourceCount = useCallback((resourceId: string): number => {
    return state.harvestedResources[resourceId] ?? 0;
  }, [state.harvestedResources]);

  const dtHarvestResource = useCallback((resourceId: string, amount: number = 1): { success: boolean; state: DtDeepSeaTrenchState } => {
    const def = DT_RESOURCES.find((r) => r.id === resourceId);
    if (!def) return { success: false, state };
    if (state.currentDepth < def.harvestDepth[0] || state.currentDepth > def.harvestDepth[1]) return { success: false, state };

    const coinGain = def.value * amount;
    let next = state;
    setState((prev) => {
      const newResources = { ...prev.harvestedResources, [resourceId]: (prev.harvestedResources[resourceId] ?? 0) + amount };
      const newCategoryCount = { ...prev.harvestCountByCategory, [def.category]: (prev.harvestCountByCategory[def.category] ?? 0) + amount };
      next = {
        ...prev,
        harvestedResources: newResources,
        harvestCountByCategory: newCategoryCount,
        totalHarvestCount: prev.totalHarvestCount + amount,
        coins: dtClampCoins(prev.coins + coinGain),
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Station Modules ----

  const dtGetStationModules = useCallback((): DtStationModuleDef[] => {
    return [...DT_STATION_MODULES];
  }, []);

  const dtGetBuiltModules = useCallback((): DtStationState[] => {
    return [...state.stationModules];
  }, [state.stationModules]);

  const dtBuildModule = useCallback((moduleId: string): { success: boolean; cost: number; state: DtDeepSeaTrenchState } => {
    const def = DT_STATION_MODULES.find((m) => m.id === moduleId);
    if (!def) return { success: false, cost: 0, state };
    if (state.stationModules.some((m) => m.moduleId === moduleId)) return { success: false, cost: 0, state };
    if (state.level < Math.max(1, Math.floor(def.baseBuildCost / 100))) return { success: false, cost: def.baseBuildCost, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        stationModules: [...prev.stationModules, { moduleId, level: 1, active: true }],
        coins: dtClampCoins(prev.coins - def.baseBuildCost),
        totalCoinsSpent: prev.totalCoinsSpent + def.baseBuildCost,
        stationUpgradeCount: prev.stationUpgradeCount + 1,
      };
      // Daily task progress
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const dailyDef = DT_DAILY_DIVE_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (dailyDef && dailyDef.type === 'build') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }
      return next;
    });
    return { success: true, cost: def.baseBuildCost, state: next };
  }, [state]);

  const dtUpgradeModule = useCallback((moduleId: string): { success: boolean; cost: number; state: DtDeepSeaTrenchState } => {
    const def = DT_STATION_MODULES.find((m) => m.id === moduleId);
    const mod = state.stationModules.find((m) => m.moduleId === moduleId);
    if (!def || !mod) return { success: false, cost: 0, state };
    if (mod.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseUpgradeCost * Math.pow(1.5, mod.level - 1));
    if (state.coins < cost) return { success: false, cost, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        stationModules: prev.stationModules.map((m) =>
          m.moduleId === moduleId ? { ...m, level: m.level + 1 } : m
        ),
        coins: dtClampCoins(prev.coins - cost),
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        stationUpgradeCount: prev.stationUpgradeCount + 1,
      };
      if (prev.dailyTask && !prev.dailyTask.claimed) {
        const dailyDef = DT_DAILY_DIVE_POOL.find((d) => d.id === prev.dailyTask!.poolId);
        if (dailyDef && dailyDef.type === 'build') {
          next = { ...next, dailyTask: { ...next.dailyTask!, progress: next.dailyTask!.progress + 1 } };
        }
      }
      return next;
    });
    return { success: true, cost, state: next };
  }, [state]);

  const dtGetModuleLevel = useCallback((moduleId: string): number => {
    const mod = state.stationModules.find((m) => m.moduleId === moduleId);
    return mod?.level ?? 0;
  }, [state.stationModules]);

  const dtGetModuleBonus = useCallback((moduleId: string): number => {
    const def = DT_STATION_MODULES.find((m) => m.id === moduleId);
    const mod = state.stationModules.find((m) => m.moduleId === moduleId);
    if (!def || !mod) return 0;
    return def.baseBonusValue * (0.5 + mod.level * 0.15);
  }, [state.stationModules]);

  // ---- Equipment ----

  const dtGetEquipment = useCallback((): DtEquipmentDef[] => {
    return [...DT_EQUIPMENT];
  }, []);

  const dtGetOwnedEquipment = useCallback((): DtEquipmentDef[] => {
    return state.ownedEquipment
      .map((id) => DT_EQUIPMENT.find((e) => e.id === id))
      .filter((e): e is DtEquipmentDef => e !== null);
  }, [state.ownedEquipment]);

  const dtGetEquippedItems = useCallback((): DtEquipmentDef[] => {
    return state.equippedItems
      .map((ei) => DT_EQUIPMENT.find((e) => e.id === ei.equipmentId))
      .filter((e): e is DtEquipmentDef => e !== null);
  }, [state.equippedItems]);

  const dtBuyEquipment = useCallback((equipmentId: string): { success: boolean; cost: number; state: DtDeepSeaTrenchState } => {
    const def = DT_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!def) return { success: false, cost: 0, state };
    if (state.ownedEquipment.includes(equipmentId)) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: def.cost, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        ownedEquipment: [...prev.ownedEquipment, equipmentId],
        coins: dtClampCoins(prev.coins - def.cost),
        totalCoinsSpent: prev.totalCoinsSpent + def.cost,
      };
      return next;
    });
    return { success: true, cost: def.cost, state: next };
  }, [state]);

  const dtEquipItem = useCallback((equipmentId: string): { success: boolean; state: DtDeepSeaTrenchState } => {
    const def = DT_EQUIPMENT.find((e) => e.id === equipmentId);
    if (!def) return { success: false, state };
    if (!state.ownedEquipment.includes(equipmentId)) return { success: false, state };

    // Unequip any item in the same slot
    const newEquipped = state.equippedItems.filter((ei) => {
      const eq = DT_EQUIPMENT.find((e) => e.id === ei.equipmentId);
      return eq?.slot !== def.slot;
    });

    let next = state;
    setState((prev) => {
      next = { ...prev, equippedItems: [...newEquipped, { equipmentId }] };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtUnequipItem = useCallback((slot: DtEquipmentSlot): { success: boolean; state: DtDeepSeaTrenchState } => {
    const hadItem = state.equippedItems.some((ei) => {
      const eq = DT_EQUIPMENT.find((e) => e.id === ei.equipmentId);
      return eq?.slot === slot;
    });
    if (!hadItem) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = { ...prev, equippedItems: prev.equippedItems.filter((ei) => DT_EQUIPMENT.find((e) => e.id === ei.equipmentId)?.slot !== slot) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const dtGetAchievements = useCallback((): DtAchievementDef[] => {
    return [...DT_ACHIEVEMENTS];
  }, []);

  const dtGetUnlockedAchievements = useCallback((): DtAchievementState[] => {
    return state.achievements.filter((a) => a.unlocked);
  }, [state.achievements]);

  const dtIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements.find((a) => a.achievementId === achievementId)?.unlocked ?? false;
  }, [state.achievements]);

  const dtCheckAchievements = useCallback((): DtAchievementState[] => {
    const now = Date.now();
    const conditionValues: Record<string, number> = {
      totalDives: state.totalEncounterCount,
      maxDepthReached: state.maxDepthReached,
      discoveredCreatures: state.discoveredCreatures.length,
      totalHarvestCount: state.totalHarvestCount,
      stationCount: state.stationModules.length,
      ventEventsCompleted: state.ventEventsCompleted,
      dailyDivesCompleted: state.dailyDivesCompleted,
      equipmentCount: state.ownedEquipment.length,
      level: state.level,
      zonesDiscovered: state.discoveredZoneIds.length,
      totalCoinsEarned: state.totalCoinsEarned,
      legendaryEncounterCount: state.legendaryEncounterCount,
    };

    const newlyUnlocked: DtAchievementState[] = [];
    setState((prev) => {
      let updated = prev;
      for (const ach of DT_ACHIEVEMENTS) {
        const current = updated.achievements.find((a) => a.achievementId === ach.id);
        if (!current || current.unlocked) continue;
        const val = conditionValues[ach.conditionKey] ?? 0;
        if (val >= ach.targetValue) {
          updated = {
            ...updated,
            achievements: updated.achievements.map((a) =>
              a.achievementId === ach.id ? { ...a, unlocked: true, unlockedAt: now } : a
            ),
            coins: dtClampCoins(updated.coins + ach.rewardCoins),
            totalCoinsEarned: updated.totalCoinsEarned + ach.rewardCoins,
          };
          newlyUnlocked.push({ achievementId: ach.id, unlocked: true, unlockedAt: now });
        }
      }
      return updated;
    });
    return newlyUnlocked;
  }, [state]);

  // ---- Daily Tasks ----

  const dtGetDailyTask = useCallback((): DtDailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const dtRefreshDailyTask = useCallback((now: number = Date.now()): { task: DtDailyDiveDef | null; state: DtDeepSeaTrenchState } => {
    const dayKey = dtGenerateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = DT_DAILY_DIVE_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { task: pool ?? null, state };
    }

    const daySeed = dtHashString(dayKey) & 0x7fffffff;
    const rng = dtMulberry32(daySeed);
    const taskIndex = Math.floor(rng() * DT_DAILY_DIVE_POOL.length);
    const task = DT_DAILY_DIVE_POOL[taskIndex];

    const yesterdayKey = dtGenerateDayKey(now - 86400000);
    const newStreak = state.lastDailyKey === yesterdayKey ? state.dailyStreak + 1 : (state.lastDailyKey === dayKey ? state.dailyStreak : 1);

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyTask: { poolId: task.id, progress: 0, claimed: false, dayKey },
        dailyStreak: newStreak,
        lastDailyKey: dayKey,
      };
      return next;
    });
    return { task, state: next };
  }, [state]);

  const dtClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: DtDeepSeaTrenchState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = DT_DAILY_DIVE_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };

    const streakBonus = 1 + state.dailyStreak * 0.05;
    const rewardCoins = Math.floor(poolDef.rewardCoins * streakBonus);
    const rewardXP = Math.floor(poolDef.rewardXP * streakBonus);

    let next = state;
    setState((prev) => {
      let { level, xp } = prev;
      xp += rewardXP;
      while (level < DT_MAX_LEVEL && xp >= dtXpRequiredForLevel(level)) {
        xp -= dtXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= DT_MAX_LEVEL) xp = 0;
      next = {
        ...prev,
        dailyTask: { ...prev.dailyTask!, claimed: true },
        coins: dtClampCoins(prev.coins + rewardCoins),
        totalCoinsEarned: prev.totalCoinsEarned + rewardCoins,
        dailyDivesCompleted: prev.dailyDivesCompleted + 1,
        level: dtClampLevel(level),
        xp,
      };
      return next;
    });
    return { success: true, rewardCoins, rewardXP, state: next };
  }, [state]);

  const dtGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  // ---- Vent Events ----

  const dtGetActiveVentEvent = useCallback((): DtActiveVentEvent | null => {
    return state.activeVentEvent;
  }, [state.activeVentEvent]);

  const dtGetVentEvents = useCallback((): DtVentEventDef[] => {
    return [...DT_VENT_EVENTS];
  }, []);

  const dtStartVentEvent = useCallback((eventId: string, now: number = Date.now()): { success: boolean; state: DtDeepSeaTrenchState } => {
    if (state.activeVentEvent) return { success: false, state };
    const def = DT_VENT_EVENTS.find((e) => e.id === eventId);
    if (!def) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        activeVentEvent: {
          eventId,
          startedAt: now,
          endsAt: now + def.duration * 1000,
          claimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const dtClaimVentReward = useCallback((now: number = Date.now()): { success: boolean; coins: number; xp: number; state: DtDeepSeaTrenchState } => {
    if (!state.activeVentEvent || state.activeVentEvent.claimed) return { success: false, coins: 0, xp: 0, state };
    if (now < state.activeVentEvent.endsAt) return { success: false, coins: 0, xp: 0, state };

    const def = DT_VENT_EVENTS.find((e) => e.id === state.activeVentEvent.eventId);
    if (!def) return { success: false, coins: 0, xp: 0, state };

    const riskRoll = prngRef.current();
    const survived = riskRoll > def.riskLevel * 0.1;
    const coins = survived ? def.rewardCoins : Math.floor(def.rewardCoins * 0.3);
    const xp = survived ? def.rewardXP : Math.floor(def.rewardXP * 0.3);

    let next = state;
    setState((prev) => {
      let { level, xp: currentXp } = prev;
      currentXp += xp;
      while (level < DT_MAX_LEVEL && currentXp >= dtXpRequiredForLevel(level)) {
        currentXp -= dtXpRequiredForLevel(level);
        level += 1;
      }
      if (level >= DT_MAX_LEVEL) currentXp = 0;
      next = {
        ...prev,
        activeVentEvent: null,
        ventEventsCompleted: prev.ventEventsCompleted + 1,
        coins: dtClampCoins(prev.coins + coins),
        totalCoinsEarned: prev.totalCoinsEarned + coins,
        level: dtClampLevel(level),
        xp: currentXp,
      };
      return next;
    });
    return { success: true, coins, xp, state: next };
  }, [state]);

  // ---- Stats ----

  const dtGetStats = useCallback(() => {
    const stationBonus = state.stationModules.reduce((acc, m) => {
      const def = DT_STATION_MODULES.find((d) => d.id === m.moduleId);
      return acc + (def?.baseBonusValue ?? 0) * m.level;
    }, 0);

    return {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      maxDepthReached: state.maxDepthReached,
      creaturesDiscovered: state.discoveredCreatures.length,
      creaturesTotal: DT_CREATURES.length,
      resourcesHarvested: state.totalHarvestCount,
      totalCoinsEarned: state.totalCoinsEarned,
      totalCoinsSpent: state.totalCoinsSpent,
      stationModuleCount: state.stationModules.length,
      stationPower: stationBonus,
      equipmentCount: state.ownedEquipment.length,
      zonesDiscovered: state.discoveredZoneIds.length,
      achievementsUnlocked: state.achievements.filter((a) => a.unlocked).length,
      ventEventsCompleted: state.ventEventsCompleted,
      dailyStreak: state.dailyStreak,
      dailyDivesCompleted: state.dailyDivesCompleted,
      totalEncounters: state.totalEncounterCount,
      legendaryEncounters: state.legendaryEncounterCount,
    };
  }, [state]);

  const dtGetOverallProgress = useCallback((): number => {
    const creatureProgress = state.discoveredCreatures.length / DT_CREATURES.length;
    const zoneProgress = state.discoveredZoneIds.length / DT_ZONES.length;
    const achievementProgress = state.achievements.filter((a) => a.unlocked).length / DT_ACHIEVEMENTS.length;
    const levelProgress = state.level / DT_MAX_LEVEL;
    return Math.floor(((creatureProgress + zoneProgress + achievementProgress + levelProgress) / 4) * 100);
  }, [state]);

  // ---- Expedition Logs ----

  const dtGetExpeditionLogs = useCallback((): DtExpeditionLog[] => {
    return [...state.expeditionLogs];
  }, [state.expeditionLogs]);

  const dtGetExpeditionLogsByZone = useCallback((zoneId: DtZoneId): DtExpeditionLog[] => {
    return state.expeditionLogs.filter((log) => log.zoneId === zoneId);
  }, [state.expeditionLogs]);

  const dtGetRecentLogs = useCallback((count: number = 10): DtExpeditionLog[] => {
    return state.expeditionLogs.slice(-count);
  }, [state.expeditionLogs]);

  const dtClearExpeditionLogs = useCallback((): DtDeepSeaTrenchState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, expeditionLogs: [] };
      return next;
    });
    return next;
  }, [state]);

  // ---- Creature Queries ----

  const dtGetCreaturesByZone = useCallback((zoneId: DtZoneId): DtCreatureDef[] => {
    return DT_CREATURES.filter((c) => c.zoneId === zoneId);
  }, []);

  const dtGetCreaturesByRarity = useCallback((rarity: DtRarity): DtCreatureDef[] => {
    return DT_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const dtGetCreatureRarityBreakdown = useCallback((): Record<DtRarity, number> => {
    const breakdown: Record<DtRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const dc of state.discoveredCreatures) {
      const def = DT_CREATURES.find((c) => c.id === dc.creatureId);
      if (def) breakdown[def.rarity] += 1;
    }
    return breakdown;
  }, [state.discoveredCreatures]);

  const dtGetHostileCreatures = useCallback((): DtCreatureDef[] => {
    return DT_CREATURES.filter((c) => c.hostile);
  }, []);

  const dtGetBioluminescentCreatures = useCallback((): DtCreatureDef[] => {
    return DT_CREATURES.filter((c) => c.bioluminescent);
  }, []);

  // ---- Resource Queries ----

  const dtGetResourcesByZone = useCallback((zoneId: DtZoneId): DtResourceDef[] => {
    return DT_RESOURCES.filter((r) => r.zoneId === zoneId);
  }, []);

  const dtGetResourcesByRarity = useCallback((rarity: DtRarity): DtResourceDef[] => {
    return DT_RESOURCES.filter((r) => r.rarity === rarity);
  }, []);

  const dtGetResourcesByCategory = useCallback((category: string): DtResourceDef[] => {
    return DT_RESOURCES.filter((r) => r.category === category);
  }, []);

  const dtGetHarvestableResources = useCallback((): DtResourceDef[] => {
    return DT_RESOURCES.filter(
      (r) => state.currentDepth >= r.harvestDepth[0] && state.currentDepth <= r.harvestDepth[1]
    );
  }, [state.currentDepth]);

  // ---- Resource Selling ----

  const dtSellResource = useCallback((resourceId: string, amount: number = 1): { success: boolean; coins: number; state: DtDeepSeaTrenchState } => {
    const owned = state.harvestedResources[resourceId] ?? 0;
    if (owned < amount || amount <= 0) return { success: false, coins: 0, state };

    const def = DT_RESOURCES.find((r) => r.id === resourceId);
    const value = def ? def.value * amount : 0;

    let next = state;
    setState((prev) => {
      const newResources = { ...prev.harvestedResources };
      const newAmount = newResources[resourceId] - amount;
      if (newAmount <= 0) {
        delete newResources[resourceId];
      } else {
        newResources[resourceId] = newAmount;
      }
      next = {
        ...prev,
        harvestedResources: newResources,
        coins: dtClampCoins(prev.coins + value),
        totalCoinsEarned: prev.totalCoinsEarned + value,
      };
      return next;
    });
    return { success: true, coins: value, state: next };
  }, [state]);

  const dtSellAllResources = useCallback((): { totalCoins: number; state: DtDeepSeaTrenchState } => {
    let totalValue = 0;
    for (const [resourceId, amount] of Object.entries(state.harvestedResources)) {
      const def = DT_RESOURCES.find((r) => r.id === resourceId);
      if (def && amount > 0) totalValue += def.value * amount;
    }

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        harvestedResources: {},
        coins: dtClampCoins(prev.coins + totalValue),
        totalCoinsEarned: prev.totalCoinsEarned + totalValue,
      };
      return next;
    });
    return { totalCoins: totalValue, state: next };
  }, [state]);

  const dtGetTotalInventoryValue = useCallback((): number => {
    let total = 0;
    for (const [resourceId, amount] of Object.entries(state.harvestedResources)) {
      const def = DT_RESOURCES.find((r) => r.id === resourceId);
      if (def && amount > 0) total += def.value * amount;
    }
    return total;
  }, [state.harvestedResources]);

  // ---- Equipment Stats ----

  const dtGetEquipmentStats = useCallback((): { maxDepthBonus: number; pressureResist: number; speedBonus: number; sonarBoost: number } => {
    let maxDepthBonus = 0;
    let pressureResist = 0;
    let speedBonus = 0;
    let sonarBoost = 0;
    for (const ei of state.equippedItems) {
      const def = DT_EQUIPMENT.find((e) => e.id === ei.equipmentId);
      if (def) {
        maxDepthBonus += def.maxDepthBonus;
        pressureResist += def.pressureResist;
        speedBonus += def.speedBonus;
        sonarBoost += def.sonarBoost;
      }
    }
    return { maxDepthBonus, pressureResist, speedBonus, sonarBoost };
  }, [state.equippedItems]);

  const dtGetEquipmentBySlot = useCallback((slot: DtEquipmentSlot): DtEquipmentDef[] => {
    return DT_EQUIPMENT.filter((e) => e.slot === slot);
  }, []);

  const dtGetEquippedBySlot = useCallback((slot: DtEquipmentSlot): DtEquipmentDef | null => {
    const equipped = state.equippedItems.find((ei) => {
      const def = DT_EQUIPMENT.find((e) => e.id === ei.equipmentId);
      return def?.slot === slot;
    });
    if (!equipped) return null;
    return DT_EQUIPMENT.find((e) => e.id === equipped.equipmentId) ?? null;
  }, [state.equippedItems]);

  const dtGetAffordableEquipment = useCallback((): DtEquipmentDef[] => {
    return DT_EQUIPMENT.filter(
      (e) => !state.ownedEquipment.includes(e.id) && state.coins >= e.cost && state.level >= e.requiredLevel
    );
  }, [state.ownedEquipment, state.coins, state.level]);

  // ---- Station Module Queries ----

  const dtGetStationModulesByType = useCallback((type: DtStationModuleType): DtStationModuleDef[] => {
    return DT_STATION_MODULES.filter((m) => m.moduleType === type);
  }, []);

  const dtGetAffordableModules = useCallback((): DtStationModuleDef[] => {
    return DT_STATION_MODULES.filter(
      (m) => !state.stationModules.some((sm) => sm.moduleId === m.id) && state.coins >= m.baseBuildCost
    );
  }, [state.stationModules, state.coins]);

  const dtGetModuleUpgradeCost = useCallback((moduleId: string): number => {
    const def = DT_STATION_MODULES.find((m) => m.id === moduleId);
    const mod = state.stationModules.find((m) => m.moduleId === moduleId);
    if (!def || !mod) return 0;
    if (mod.level >= def.maxLevel) return 0;
    return Math.floor(def.baseUpgradeCost * Math.pow(1.5, mod.level - 1));
  }, [state.stationModules]);

  const dtGetTotalStationPower = useCallback((): number => {
    return state.stationModules.reduce((acc, m) => {
      const def = DT_STATION_MODULES.find((d) => d.id === m.moduleId);
      return acc + (def?.baseBonusValue ?? 0) * m.level;
    }, 0);
  }, [state.stationModules]);

  // ---- Repair & Refill ----

  const dtRefillOxygen = useCallback((): DtDeepSeaTrenchState => {
    let next = state;
    setState((prev) => {
      const medicalBonus = prev.stationModules
        .filter((m) => {
          const def = DT_STATION_MODULES.find((d) => d.id === m.moduleId);
          return def?.moduleType === 'medical';
        })
        .reduce((acc, m) => acc + m.level * 10, 0);
      next = { ...prev, oxygen: prev.maxOxygen + medicalBonus };
      return next;
    });
    return next;
  }, [state]);

  const dtRepairHull = useCallback((): { cost: number; success: boolean; state: DtDeepSeaTrenchState } => {
    const damage = 100 - state.hullIntegrity;
    if (damage <= 0) return { cost: 0, success: false, state };
    const cost = Math.floor(damage * 5);
    if (state.coins < cost) return { cost, success: false, state };

    let next = state;
    setState((prev) => {
      next = { ...prev, hullIntegrity: 100, coins: dtClampCoins(prev.coins - cost), totalCoinsSpent: prev.totalCoinsSpent + cost };
      return next;
    });
    return { cost, success: true, state: next };
  }, [state]);

  // ---- Zone Helpers ----

  const dtIsZoneUnlocked = useCallback((zoneId: DtZoneId): boolean => {
    const zone = DT_ZONES.find((z) => z.id === zoneId);
    if (!zone) return false;
    return state.level >= zone.unlockLevel;
  }, [state.level]);

  const dtGetZoneById = useCallback((zoneId: DtZoneId): DtZoneDef | null => {
    return DT_ZONES.find((z) => z.id === zoneId) ?? null;
  }, []);

  const dtGetUnlockedZones = useCallback((): DtZoneDef[] => {
    return DT_ZONES.filter((z) => state.level >= z.unlockLevel);
  }, [state.level]);

  // ---- Vent & Daily Helpers ----

  const dtGetVentEventDef = useCallback((eventId: string): DtVentEventDef | null => {
    return DT_VENT_EVENTS.find((e) => e.id === eventId) ?? null;
  }, []);

  const dtGetActiveVentEventDef = useCallback((): DtVentEventDef | null => {
    if (!state.activeVentEvent) return null;
    return DT_VENT_EVENTS.find((e) => e.id === state.activeVentEvent.eventId) ?? null;
  }, [state.activeVentEvent]);

  const dtGetDailyTaskDef = useCallback((): DtDailyDiveDef | null => {
    if (!state.dailyTask) return null;
    return DT_DAILY_DIVE_POOL.find((d) => d.id === state.dailyTask.poolId) ?? null;
  }, [state.dailyTask]);

  const dtIsDailyComplete = useCallback((): boolean => {
    if (!state.dailyTask || state.dailyTask.claimed) return false;
    const poolDef = DT_DAILY_DIVE_POOL.find((d) => d.id === state.dailyTask.poolId);
    if (!poolDef) return false;
    return state.dailyTask.progress >= poolDef.target;
  }, [state.dailyTask]);

  // ---- Rarity Helper ----

  const dtGetRarityInfo = useCallback((rarity: DtRarity): DtRarityInfo => {
    return DT_RARITIES.find((r) => r.key === rarity) ?? DT_RARITIES[0];
  }, []);

  // ---- Diver Name ----

  const dtSetDiverName = useCallback((name: string): DtDeepSeaTrenchState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, diverName: name };
      return next;
    });
    return next;
  }, [state]);

  // ---- Summary ----

  const dtGetSummary = useMemo((): {
    diverName: string;
    level: number;
    title: DtTitleInfo;
    coins: number;
    xp: number;
    xpTillNext: number;
    progress: number;
    maxDepth: number;
    creaturesFound: number;
    zonesExplored: number;
    stationModules: number;
    dailyStreak: number;
    overallProgress: number;
  } => {
    const title = DT_TITLES.find((t) => t.id === state.currentTitleId) ?? DT_TITLES[0];
    const progress = dtGetOverallProgress();
    return {
      diverName: state.diverName,
      level: state.level,
      title,
      coins: state.coins,
      xp: state.xp,
      xpTillNext: dtXpRequiredForLevel(state.level),
      progress: dtXpRequiredForLevel(state.level) > 0 ? state.xp / dtXpRequiredForLevel(state.level) : 1,
      maxDepth: state.maxDepthReached,
      creaturesFound: state.discoveredCreatures.length,
      zonesExplored: state.discoveredZoneIds.length,
      stationModules: state.stationModules.length,
      dailyStreak: state.dailyStreak,
      overallProgress: progress,
    };
  }, [state, dtGetOverallProgress]);

  // ---- Return ----

  return {
    dtGetState,
    dtResetState,
    dtRandom,
    dtRandomInt,
    dtRandomChoice,
    dtSetDiverName,
    // Level / XP / Coins
    dtGetLevel,
    dtGetXP,
    dtGetXPTillNext,
    dtAddXP,
    dtGetCoins,
    dtAddCoins,
    dtSpendCoins,
    dtCanAfford,
    // Title
    dtGetCurrentTitle,
    dtGetAllTitles,
    dtGetUnlockedTitles,
    dtSetTitle,
    // Zones
    dtGetZones,
    dtGetCurrentZone,
    dtGetDiscoveredZones,
    dtGetLockedZones,
    dtGetUnlockedZones,
    dtSetCurrentZone,
    dtDiscoverZone,
    dtIsZoneUnlocked,
    dtGetZoneById,
    // Depth & Pressure
    dtGetCurrentDepth,
    dtGetMaxDepth,
    dtGetOxygen,
    dtGetHullIntegrity,
    dtGetMaxDiveDepth,
    dtDescend,
    dtSurface,
    dtRefillOxygen,
    dtRepairHull,
    // Creatures
    dtGetCreatures,
    dtGetCreatureById,
    dtGetDiscoveredCreatures,
    dtGetUndiscoveredCreatures,
    dtIsCreatureDiscovered,
    dtDiscoverCreature,
    dtDocumentCreature,
    dtExploreZone,
    dtGetCreaturesByZone,
    dtGetCreaturesByRarity,
    dtGetCreatureRarityBreakdown,
    dtGetHostileCreatures,
    dtGetBioluminescentCreatures,
    // Resources
    dtGetResources,
    dtGetResourceInventory,
    dtGetResourceCount,
    dtHarvestResource,
    dtGetResourcesByZone,
    dtGetResourcesByRarity,
    dtGetResourcesByCategory,
    dtGetHarvestableResources,
    dtSellResource,
    dtSellAllResources,
    dtGetTotalInventoryValue,
    // Station
    dtGetStationModules,
    dtGetBuiltModules,
    dtBuildModule,
    dtUpgradeModule,
    dtGetModuleLevel,
    dtGetModuleBonus,
    dtGetModuleUpgradeCost,
    dtGetStationModulesByType,
    dtGetAffordableModules,
    dtGetTotalStationPower,
    // Equipment
    dtGetEquipment,
    dtGetOwnedEquipment,
    dtGetEquippedItems,
    dtBuyEquipment,
    dtEquipItem,
    dtUnequipItem,
    dtGetEquipmentStats,
    dtGetEquipmentBySlot,
    dtGetEquippedBySlot,
    dtGetAffordableEquipment,
    // Achievements
    dtGetAchievements,
    dtGetUnlockedAchievements,
    dtIsAchievementUnlocked,
    dtCheckAchievements,
    // Daily
    dtGetDailyTask,
    dtGetDailyTaskDef,
    dtIsDailyComplete,
    dtRefreshDailyTask,
    dtClaimDailyReward,
    dtGetDailyStreak,
    // Vent Events
    dtGetActiveVentEvent,
    dtGetActiveVentEventDef,
    dtGetVentEvents,
    dtGetVentEventDef,
    dtStartVentEvent,
    dtClaimVentReward,
    // Expedition Logs
    dtGetExpeditionLogs,
    dtGetExpeditionLogsByZone,
    dtGetRecentLogs,
    dtClearExpeditionLogs,
    // Rarity
    dtGetRarityInfo,
    // Stats
    dtGetStats,
    dtGetOverallProgress,
    dtGetSummary,
  };
}
