import { useState, useCallback, useRef } from 'react';

// ============================================================
// Steampunk Factory — Victorian Mechanical Engineering Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// ============================================================

// ============================================================
// Types
// ============================================================

export type FPRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type FPMachineBonus = 'speed' | 'quality' | 'efficiency' | 'output';
export type FPQuestType = 'build' | 'produce' | 'sell' | 'expand' | 'research';
export type FPDailyType = 'produce' | 'sell' | 'earn' | 'build';
export type FPSkillType = 'engineering' | 'machining' | 'design' | 'leadership' | 'innovation';

export interface FPMachineDef {
  id: string;
  name: string;
  rarity: FPRarity;
  floorId: string;
  baseCost: number;
  baseProductionTime: number;
  outputMaterialId: string;
  outputAmount: number;
  inputMaterials: { materialId: string; amount: number }[];
  description: string;
  emoji: string;
  requiredLevel: number;
  maxLevel: number;
  bonusType: FPMachineBonus;
  baseBonusValue: number;
}

export interface FPMaterialDef {
  id: string;
  name: string;
  rarity: FPRarity;
  cost: number;
  description: string;
  emoji: string;
  category: 'metal' | 'component' | 'fuel' | 'exotic';
}

export interface FPFloorDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  expansionCost: number;
  maxMachines: number;
  productionBonus: number;
}

export interface FPInventionDef {
  id: string;
  name: string;
  rarity: FPRarity;
  requiredMaterials: { materialId: string; amount: number }[];
  requiredMachineId: string;
  buildTime: number;
  sellPrice: number;
  xpReward: number;
  description: string;
  emoji: string;
  requiredLevel: number;
  effect: string;
  blueprintCost: number;
}

export interface FPWorkerDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  skills: FPSkillType[];
  hireCost: number;
  salaryPerCycle: number;
  requiredLevel: number;
  bonusMultiplier: number;
}

export interface FPQuestDef {
  id: string;
  name: string;
  description: string;
  type: FPQuestType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  requiredLevel: number;
  emoji: string;
}

export interface FPNPCDef {
  id: string;
  name: string;
  role: string;
  description: string;
  emoji: string;
  greeting: string;
}

export interface FPAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface FPDailyTaskPoolDef {
  id: string;
  name: string;
  description: string;
  type: FPDailyType;
  target: number;
  rewardCoins: number;
  rewardXP: number;
  emoji: string;
}

export interface FPTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface FPRarityInfo {
  key: FPRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface FPMachineState {
  id: string;
  level: number;
  active: boolean;
  builtOnFloor: string | null;
}

export interface FPFloorState {
  id: string;
  unlocked: boolean;
  level: number;
}

export interface FPProductionJob {
  id: string;
  machineId: string;
  floorId: string;
  startedAt: number;
  endsAt: number;
  quality: number;
}

export interface FPBlueprint {
  inventionId: string;
  purchased: boolean;
  timesCrafted: number;
}

export interface FPQuestState {
  id: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
}

export interface FPAchievementState {
  id: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface FPDailyTaskState {
  poolId: string;
  progress: number;
  claimed: boolean;
  dayKey: string;
}

export interface FPWorkerState {
  id: string;
  hired: boolean;
  assignedFloor: string | null;
  morale: number;
}

export interface FPPatentDef {
  id: string;
  name: string;
  description: string;
  cost: number;
  requiredLevel: number;
  bonusDescription: string;
  emoji: string;
}

export interface FPPatentState {
  id: string;
  owned: boolean;
  purchasedAt: number | null;
}

export interface FPQuotaState {
  target: number;
  progress: number;
  dayKey: string;
  rewardClaimed: boolean;
}

export interface FPSteampunkFactoryState {
  level: number;
  xp: number;
  coins: number;
  reputation: number;
  reputationTitle: string;
  materials: Record<string, number>;
  machines: FPMachineState[];
  floors: FPFloorState[];
  blueprints: FPBlueprint[];
  patents: FPPatentState[];
  workers: FPWorkerState[];
  productionQueue: FPProductionJob[];
  activeFloor: string;
  completedProductions: number;
  completedInventions: number;
  soldInventions: number;
  totalEarned: number;
  totalSpent: number;
  dailyStreak: number;
  lastDaily: string | null;
  activeQuests: FPQuestState[];
  completedQuests: string[];
  unlockedAchievements: FPAchievementState[];
  dailyTask: FPDailyTaskState | null;
  dailyQuota: FPQuotaState | null;
  seed: number;
  machineUpgradeCount: number;
  floorExpansionCount: number;
  totalPatentsResearched: number;
  totalWorkersHired: number;
  productionCountByRarity: Record<FPRarity, number>;
  inventionCountByRarity: Record<FPRarity, number>;
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

function fpHashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return hash;
}

// ============================================================
// XP Curve Helpers
// ============================================================

function fpXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= FP_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.11));
}

function fpClampLevel(lvl: number): number {
  return Math.max(1, Math.min(FP_MAX_LEVEL, lvl));
}

function fpClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function fpGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function fpRarityMultiplier(r: FPRarity): number {
  const map: Record<FPRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2, epic: 3.5, legendary: 6,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const FP_MAX_LEVEL = 50;

export const FP_RARITIES: FPRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 6 },
];

export const FP_TITLE_THRESHOLDS: FPTitleInfo[] = [
  { name: 'Apprentice', levelRequired: 1, description: 'A fledgling mechanic learning the basics of steam and brass' },
  { name: 'Junior Engineer', levelRequired: 5, description: 'Can operate basic steam engines and simple machinery' },
  { name: 'Mechanic', levelRequired: 10, description: 'Skilled in repairs, maintenance, and basic fabrication' },
  { name: 'Senior Engineer', levelRequired: 18, description: 'Designs complex clockwork mechanisms and steam systems' },
  { name: 'Master Fabricator', levelRequired: 25, description: 'Creates remarkable inventions admired across the empire' },
  { name: 'Chief Machinist', levelRequired: 33, description: 'Leads entire production floors with unmatched expertise' },
  { name: 'Grand Artificer', levelRequired: 42, description: 'Your mechanical marvels are exhibited in royal galleries' },
  { name: 'Grand Inventor', levelRequired: 50, description: 'The most celebrated inventor of the Victorian age' },
];

export const FP_REPUTATION_TITLES: string[] = [
  'Unknown Tinkerer', 'Local Handyman', 'Respected Engineer', 'Master Artificer',
  'Renowned Inventor', 'Legend of the Age',
];

export const FP_MATERIALS: FPMaterialDef[] = [
  // Common metals
  { id: 'copper', name: 'Copper', rarity: 'common', cost: 5, description: 'Conductive reddish metal, essential for wiring and pipes', emoji: '🟤', category: 'metal' },
  { id: 'iron', name: 'Wrought Iron', rarity: 'common', cost: 6, description: 'Strong and malleable, the backbone of industrial construction', emoji: '⚙️', category: 'metal' },
  { id: 'tin', name: 'Tin Sheet', rarity: 'common', cost: 4, description: 'Lightweight plating used for boiler casings', emoji: '🪙', category: 'metal' },
  { id: 'coal', name: 'Coal', rarity: 'common', cost: 3, description: 'Primary fuel source for all steam-powered machinery', emoji: '⬛', category: 'fuel' },
  // Common components
  { id: 'bolts', name: 'Brass Bolts', rarity: 'common', cost: 3, description: 'Standard fasteners holding the factory together', emoji: '🔩', category: 'component' },
  { id: 'pipes', name: 'Copper Pipes', rarity: 'common', cost: 5, description: 'Channels steam and fluids throughout the factory', emoji: '🔧', category: 'component' },
  { id: 'rivets', name: 'Steel Rivets', rarity: 'common', cost: 4, description: 'Heavy-duty rivets for reinforcing structural joints', emoji: '📌', category: 'component' },
  { id: 'valves', name: 'Pressure Valves', rarity: 'common', cost: 6, description: 'Regulates steam pressure in the pipeline system', emoji: '🎛️', category: 'component' },
  // Uncommon
  { id: 'brass', name: 'Polished Brass', rarity: 'uncommon', cost: 12, description: 'Golden alloy used for decorative gears and fittings', emoji: '🔔', category: 'metal' },
  { id: 'steel', name: 'Carbon Steel', rarity: 'uncommon', cost: 14, description: 'High-strength steel for critical machine components', emoji: '🔩', category: 'metal' },
  { id: 'gears', name: 'Precision Gears', rarity: 'uncommon', cost: 11, description: 'Interlocking gears machined to exact tolerances', emoji: '⚙️', category: 'component' },
  { id: 'springs', name: 'Clockwork Springs', rarity: 'uncommon', cost: 10, description: 'Coiled springs storing mechanical energy', emoji: '🌀', category: 'component' },
  { id: 'oil', name: 'Lubricant Oil', rarity: 'uncommon', cost: 8, description: 'Keeps all moving parts running smoothly', emoji: '🛢️', category: 'fuel' },
  { id: 'glass', name: 'Industrial Glass', rarity: 'uncommon', cost: 9, description: 'Reinforced glass for pressure gauges and viewports', emoji: '🔮', category: 'exotic' },
  // Rare
  { id: 'teakwood', name: 'Teak Wood', rarity: 'rare', cost: 22, description: 'Dense, oil-rich wood used for fine cabinetry in inventions', emoji: '🪵', category: 'exotic' },
  { id: 'silicon', name: 'Crystal Silicon', rarity: 'rare', cost: 25, description: 'Semi-conductive crystals for advanced sensor arrays', emoji: '💎', category: 'exotic' },
  { id: 'hydraulic', name: 'Hydraulic Fluid', rarity: 'rare', cost: 20, description: 'Specialized fluid for high-pressure hydraulic systems', emoji: '💧', category: 'fuel' },
  { id: 'phosphor', name: 'Phosphor Powder', rarity: 'rare', cost: 24, description: 'Glowing powder used in gauges and display dials', emoji: '✨', category: 'exotic' },
  // Epic
  { id: 'titanium', name: 'Titanium Alloy', rarity: 'epic', cost: 45, description: 'Lightweight yet incredibly strong aerospace-grade metal', emoji: '🔒', category: 'metal' },
  { id: 'chronium', name: 'Chronium', rarity: 'epic', cost: 50, description: 'Time-resistant metal found in ancient clockwork ruins', emoji: '⏱️', category: 'metal' },
  { id: 'aether', name: 'Refined Aether', rarity: 'epic', cost: 55, description: 'Mysterious energy source harvested from atmospheric phenomena', emoji: '🌟', category: 'fuel' },
  { id: 'voltaic', name: 'Voltaic Crystal', rarity: 'epic', cost: 48, description: 'Naturally electric crystal that powers advanced machinery', emoji: '⚡', category: 'exotic' },
  // Legendary
  { id: 'adamantine', name: 'Adamantine Plate', rarity: 'legendary', cost: 100, description: 'Indestructible metal forged in the heart of volcanoes', emoji: '🛡️', category: 'metal' },
  { id: 'quintessence', name: 'Quintessence', rarity: 'legendary', cost: 120, description: 'The fifth element — pure creative energy in liquid form', emoji: '💫', category: 'fuel' },
  { id: 'orichalcum', name: 'Orichalcum Ingot', rarity: 'legendary', cost: 110, description: 'Legendary metal from Atlantean ruins, conducts all energies', emoji: '🏅', category: 'exotic' },
];

export const FP_FLOORS: FPFloorDef[] = [
  { id: 'boiler_room', name: 'Boiler Room', description: 'The roaring heart of the factory, where coal and steam power everything', emoji: '🔥', unlockLevel: 1, expansionCost: 0, maxMachines: 6, productionBonus: 0 },
  { id: 'assembly_line', name: 'Assembly Line', description: 'Belt-driven production floor for mass-manufacturing components', emoji: '🏭', unlockLevel: 5, expansionCost: 500, maxMachines: 8, productionBonus: 0.05 },
  { id: 'brass_foundry', name: 'Brass Foundry', description: 'Where molten metals are cast into precision parts', emoji: '🧪', unlockLevel: 10, expansionCost: 1200, maxMachines: 7, productionBonus: 0.1 },
  { id: 'clockwork_tower', name: 'Clockwork Tower', description: 'A spiraling tower of gears, springs, and delicate mechanisms', emoji: '🗼', unlockLevel: 15, expansionCost: 2500, maxMachines: 6, productionBonus: 0.15 },
  { id: 'aether_lab', name: 'Aether Laboratory', description: 'Experimental chamber for harnessing mysterious energies', emoji: '🔬', unlockLevel: 22, expansionCost: 5000, maxMachines: 5, productionBonus: 0.2 },
  { id: 'steam_dock', name: 'Steam Docks', description: 'Massive hangar where airships and steam vehicles are assembled', emoji: '🚢', unlockLevel: 30, expansionCost: 10000, maxMachines: 5, productionBonus: 0.25 },
  { id: 'invention_vault', name: 'Invention Vault', description: 'Secure underground vault where the most extraordinary inventions take shape', emoji: '🏛️', unlockLevel: 38, expansionCost: 20000, maxMachines: 4, productionBonus: 0.3 },
  { id: 'steamwork_spire', name: 'Grand Steamwork Spire', description: 'The pinnacle of engineering — a towering monument of brass and steam', emoji: '🗼', unlockLevel: 46, expansionCost: 50000, maxMachines: 4, productionBonus: 0.4 },
];

export const FP_MACHINES: FPMachineDef[] = [
  // === Boiler Room (common machines) ===
  { id: 'steam_engine', name: 'Steam Engine', rarity: 'common', floorId: 'boiler_room', baseCost: 80, baseProductionTime: 20, outputMaterialId: 'iron', outputAmount: 2, inputMaterials: [{ materialId: 'coal', amount: 1 }], description: 'The workhorse of industry — converts coal heat into mechanical power', emoji: '🚂', requiredLevel: 1, maxLevel: 10, bonusType: 'speed', baseBonusValue: 5 },
  { id: 'copper_forge', name: 'Copper Forge', rarity: 'common', floorId: 'boiler_room', baseCost: 60, baseProductionTime: 15, outputMaterialId: 'copper', outputAmount: 3, inputMaterials: [{ materialId: 'coal', amount: 1 }], description: 'Smelts raw ore into workable copper sheets', emoji: '🔨', requiredLevel: 1, maxLevel: 10, bonusType: 'output', baseBonusValue: 3 },
  { id: 'pipe_bender', name: 'Pipe Bender', rarity: 'common', floorId: 'boiler_room', baseCost: 50, baseProductionTime: 12, outputMaterialId: 'pipes', outputAmount: 2, inputMaterials: [{ materialId: 'copper', amount: 1 }], description: 'Shapes copper into precise pipe sections for steam transport', emoji: '🔧', requiredLevel: 1, maxLevel: 10, bonusType: 'efficiency', baseBonusValue: 4 },
  { id: 'bolt_press', name: 'Bolt Press', rarity: 'common', floorId: 'boiler_room', baseCost: 40, baseProductionTime: 10, outputMaterialId: 'bolts', outputAmount: 3, inputMaterials: [{ materialId: 'iron', amount: 1 }], description: 'Stamps out brass bolts by the hundred', emoji: '🔩', requiredLevel: 1, maxLevel: 10, bonusType: 'speed', baseBonusValue: 3 },
  { id: 'rivet_gun', name: 'Pneumatic Rivet Gun', rarity: 'common', floorId: 'boiler_room', baseCost: 55, baseProductionTime: 11, outputMaterialId: 'rivets', outputAmount: 3, inputMaterials: [{ materialId: 'iron', amount: 1 }], description: 'Drives rivets through steel plates with air pressure', emoji: '📌', requiredLevel: 2, maxLevel: 10, bonusType: 'output', baseBonusValue: 2 },
  { id: 'valve_lathe', name: 'Valve Lathe', rarity: 'common', floorId: 'boiler_room', baseCost: 65, baseProductionTime: 14, outputMaterialId: 'valves', outputAmount: 2, inputMaterials: [{ materialId: 'brass', amount: 1 }, { materialId: 'iron', amount: 1 }], description: 'Precision-lathes brass and iron into steam valves', emoji: '🎛️', requiredLevel: 3, maxLevel: 10, bonusType: 'quality', baseBonusValue: 3 },
  // === Assembly Line (uncommon) ===
  { id: 'clockwork_assembler', name: 'Clockwork Assembler', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 200, baseProductionTime: 25, outputMaterialId: 'gears', outputAmount: 3, inputMaterials: [{ materialId: 'brass', amount: 2 }, { materialId: 'bolts', amount: 1 }], description: 'Automated assembly of precision clockwork gear sets', emoji: '⚙️', requiredLevel: 5, maxLevel: 10, bonusType: 'speed', baseBonusValue: 6 },
  { id: 'spring_coiler', name: 'Spring Coiler', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 180, baseProductionTime: 22, outputMaterialId: 'springs', outputAmount: 3, inputMaterials: [{ materialId: 'steel', amount: 1 }, { materialId: 'brass', amount: 1 }], description: 'Winds steel wire into perfect clockwork springs', emoji: '🌀', requiredLevel: 5, maxLevel: 10, bonusType: 'output', baseBonusValue: 4 },
  { id: 'brass_polisher', name: 'Brass Polisher', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 150, baseProductionTime: 18, outputMaterialId: 'brass', outputAmount: 4, inputMaterials: [{ materialId: 'copper', amount: 2 }, { materialId: 'tin', amount: 1 }], description: 'Alloys and polishes copper and tin into gleaming brass', emoji: '🔔', requiredLevel: 6, maxLevel: 10, bonusType: 'quality', baseBonusValue: 5 },
  { id: 'steel_smelter', name: 'Steel Smelter', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 220, baseProductionTime: 28, outputMaterialId: 'steel', outputAmount: 3, inputMaterials: [{ materialId: 'iron', amount: 2 }, { materialId: 'coal', amount: 2 }], description: 'Burns impurities from iron to produce high-grade steel', emoji: '🔥', requiredLevel: 7, maxLevel: 10, bonusType: 'efficiency', baseBonusValue: 5 },
  { id: 'glass_blower', name: 'Industrial Glass Blower', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 170, baseProductionTime: 20, outputMaterialId: 'glass', outputAmount: 2, inputMaterials: [{ materialId: 'coal', amount: 2 }, { materialId: 'tin', amount: 1 }], description: 'Blows and shapes industrial glass for gauges and viewports', emoji: '🔮', requiredLevel: 8, maxLevel: 10, bonusType: 'quality', baseBonusValue: 4 },
  { id: 'oil_distiller', name: 'Oil Distiller', rarity: 'uncommon', floorId: 'assembly_line', baseCost: 160, baseProductionTime: 24, outputMaterialId: 'oil', outputAmount: 2, inputMaterials: [{ materialId: 'coal', amount: 3 }], description: 'Refines crude into lubricant oil for machinery', emoji: '🛢️', requiredLevel: 9, maxLevel: 10, bonusType: 'output', baseBonusValue: 3 },
  // === Brass Foundry (rare) ===
  { id: 'teak_miller', name: 'Teak Milling Machine', rarity: 'rare', floorId: 'brass_foundry', baseCost: 450, baseProductionTime: 30, outputMaterialId: 'teakwood', outputAmount: 2, inputMaterials: [{ materialId: 'bolts', amount: 2 }, { materialId: 'oil', amount: 1 }], description: 'Precision mills raw teak into fine wooden components', emoji: '🪵', requiredLevel: 10, maxLevel: 10, bonusType: 'quality', baseBonusValue: 6 },
  { id: 'hydraulic_press', name: 'Hydraulic Press', rarity: 'rare', floorId: 'brass_foundry', baseCost: 500, baseProductionTime: 32, outputMaterialId: 'hydraulic', outputAmount: 2, inputMaterials: [{ materialId: 'steel', amount: 2 }, { materialId: 'oil', amount: 2 }], description: 'Generates and channels extreme hydraulic pressure', emoji: '💧', requiredLevel: 12, maxLevel: 10, bonusType: 'efficiency', baseBonusValue: 7 },
  { id: 'phosphor_mixer', name: 'Phosphor Mixer', rarity: 'rare', floorId: 'brass_foundry', baseCost: 420, baseProductionTime: 26, outputMaterialId: 'phosphor', outputAmount: 2, inputMaterials: [{ materialId: 'glass', amount: 1 }, { materialId: 'coal', amount: 3 }], description: 'Mixes phosphorescent compounds for glowing dials', emoji: '✨', requiredLevel: 13, maxLevel: 10, bonusType: 'output', baseBonusValue: 5 },
  { id: 'tin_plate_roller', name: 'Tin Plate Roller', rarity: 'rare', floorId: 'brass_foundry', baseCost: 380, baseProductionTime: 22, outputMaterialId: 'tin', outputAmount: 5, inputMaterials: [{ materialId: 'iron', amount: 2 }, { materialId: 'coal', amount: 1 }], description: 'Rolls iron into thin tin-coated sheets', emoji: '🪙', requiredLevel: 11, maxLevel: 10, bonusType: 'speed', baseBonusValue: 7 },
  // === Clockwork Tower (rare) ===
  { id: 'silicon_cutter', name: 'Silicon Wafer Cutter', rarity: 'rare', floorId: 'clockwork_tower', baseCost: 550, baseProductionTime: 35, outputMaterialId: 'silicon', outputAmount: 2, inputMaterials: [{ materialId: 'glass', amount: 2 }, { materialId: 'oil', amount: 1 }], description: 'Cuts silicon crystals into precision wafers for sensors', emoji: '💎', requiredLevel: 15, maxLevel: 10, bonusType: 'quality', baseBonusValue: 8 },
  { id: 'grand_chronometer', name: 'Grand Chronometer', rarity: 'rare', floorId: 'clockwork_tower', baseCost: 600, baseProductionTime: 40, outputMaterialId: 'springs', outputAmount: 5, inputMaterials: [{ materialId: 'steel', amount: 2 }, { materialId: 'gears', amount: 2 }], description: 'A masterpiece of timekeeping that produces ultra-precise springs', emoji: '⏱️', requiredLevel: 17, maxLevel: 10, bonusType: 'speed', baseBonusValue: 8 },
  { id: 'automaton_forge', name: 'Automaton Forge', rarity: 'rare', floorId: 'clockwork_tower', baseCost: 650, baseProductionTime: 45, outputMaterialId: 'steel', outputAmount: 5, inputMaterials: [{ materialId: 'iron', amount: 3 }, { materialId: 'gears', amount: 2 }], description: 'A self-operating forge that produces high-grade steel autonomously', emoji: '🤖', requiredLevel: 19, maxLevel: 10, bonusType: 'output', baseBonusValue: 6 },
  // === Aether Lab (epic) ===
  { id: 'titanium_furnace', name: 'Titanium Crucible Furnace', rarity: 'epic', floorId: 'aether_lab', baseCost: 1200, baseProductionTime: 50, outputMaterialId: 'titanium', outputAmount: 2, inputMaterials: [{ materialId: 'steel', amount: 3 }, { materialId: 'coal', amount: 4 }], description: 'Extreme-heat furnace capable of forging titanium alloy', emoji: '🔒', requiredLevel: 22, maxLevel: 10, bonusType: 'quality', baseBonusValue: 10 },
  { id: 'aether_condenser', name: 'Aether Condenser', rarity: 'epic', floorId: 'aether_lab', baseCost: 1500, baseProductionTime: 55, outputMaterialId: 'aether', outputAmount: 2, inputMaterials: [{ materialId: 'glass', amount: 3 }, { materialId: 'phosphor', amount: 2 }], description: 'Condenses atmospheric aether into usable energy vials', emoji: '🌟', requiredLevel: 25, maxLevel: 10, bonusType: 'efficiency', baseBonusValue: 10 },
  { id: 'voltaic_array', name: 'Voltaic Crystal Array', rarity: 'epic', floorId: 'aether_lab', baseCost: 1300, baseProductionTime: 48, outputMaterialId: 'voltaic', outputAmount: 2, inputMaterials: [{ materialId: 'silicon', amount: 3 }, { materialId: 'aether', amount: 1 }], description: 'Arrays voltaic crystals into powerful energy cells', emoji: '⚡', requiredLevel: 28, maxLevel: 10, bonusType: 'output', baseBonusValue: 8 },
  // === Steam Docks (epic) ===
  { id: 'chronium_extractor', name: 'Chronium Extractor', rarity: 'epic', floorId: 'steam_docks', baseCost: 1800, baseProductionTime: 60, outputMaterialId: 'chronium', outputAmount: 2, inputMaterials: [{ materialId: 'titanium', amount: 2 }, { materialId: 'aether', amount: 2 }], description: 'Extracts time-resistant chronium from temporal anomalies', emoji: '⏱️', requiredLevel: 30, maxLevel: 10, bonusType: 'speed', baseBonusValue: 10 },
  { id: 'hull_press', name: 'Steamship Hull Press', rarity: 'epic', floorId: 'steam_docks', baseCost: 1600, baseProductionTime: 45, outputMaterialId: 'titanium', outputAmount: 4, inputMaterials: [{ materialId: 'steel', amount: 4 }, { materialId: 'rivets', amount: 3 }], description: 'Massive press that stamps out airship hull plates', emoji: '🚢', requiredLevel: 32, maxLevel: 10, bonusType: 'quality', baseBonusValue: 9 },
  // === Invention Vault (legendary) ===
  { id: 'adamantine_forge', name: 'Adamantine Heartforge', rarity: 'legendary', floorId: 'invention_vault', baseCost: 5000, baseProductionTime: 80, outputMaterialId: 'adamantine', outputAmount: 2, inputMaterials: [{ materialId: 'titanium', amount: 3 }, { materialId: 'chronium', amount: 2 }], description: 'Ancient volcanic forge capable of smelting indestructible adamantine', emoji: '🛡️', requiredLevel: 38, maxLevel: 10, bonusType: 'quality', baseBonusValue: 15 },
  { id: 'quintessence_distiller', name: 'Quintessence Distiller', rarity: 'legendary', floorId: 'invention_vault', baseCost: 6000, baseProductionTime: 90, outputMaterialId: 'quintessence', outputAmount: 2, inputMaterials: [{ materialId: 'aether', amount: 3 }, { materialId: 'voltaic', amount: 2 }], description: 'Distills raw aether into pure quintessence — the fuel of gods', emoji: '💫', requiredLevel: 42, maxLevel: 10, bonusType: 'output', baseBonusValue: 12 },
  // === Steamwork Spire (legendary) ===
  { id: 'orichalcum_crucible', name: 'Orichalcum Crucible', rarity: 'legendary', floorId: 'steamwork_spire', baseCost: 8000, baseProductionTime: 100, outputMaterialId: 'orichalcum', outputAmount: 2, inputMaterials: [{ materialId: 'adamantine', amount: 2 }, { materialId: 'quintessence', amount: 2 }], description: 'The ultimate crucible — transmutes base metals into legendary orichalcum', emoji: '🏅', requiredLevel: 46, maxLevel: 10, bonusType: 'efficiency', baseBonusValue: 15 },
  { id: 'nexus_engine', name: 'Nexus Prime Engine', rarity: 'legendary', floorId: 'steamwork_spire', baseCost: 10000, baseProductionTime: 120, outputMaterialId: 'quintessence', outputAmount: 4, inputMaterials: [{ materialId: 'orichalcum', amount: 1 }, { materialId: 'adamantine', amount: 2 }], description: 'The crowning achievement of steampunk engineering — produces quintessence endlessly', emoji: '👑', requiredLevel: 48, maxLevel: 10, bonusType: 'output', baseBonusValue: 20 },
];

export const FP_INVENTIONS: FPInventionDef[] = [
  // Common inventions
  { id: 'brass_compass', name: 'Brass Compass', rarity: 'common', requiredMaterials: [{ materialId: 'brass', amount: 2 }, { materialId: 'gears', amount: 1 }], requiredMachineId: 'clockwork_assembler', buildTime: 30, sellPrice: 45, xpReward: 15, description: 'A reliable brass compass that always points true north', emoji: '🧭', requiredLevel: 1, effect: '+5% navigation accuracy', blueprintCost: 0 },
  { id: 'steam_lantern', name: 'Steam Lantern', rarity: 'common', requiredMaterials: [{ materialId: 'copper', amount: 2 }, { materialId: 'coal', amount: 2 }, { materialId: 'glass', amount: 1 }], requiredMachineId: 'copper_forge', buildTime: 25, sellPrice: 38, xpReward: 12, description: 'A portable lantern powered by a miniature steam engine', emoji: '🏮', requiredLevel: 1, effect: 'Illuminates a 20ft radius', blueprintCost: 0 },
  { id: 'pocket_watch', name: 'Pocket Watch', rarity: 'common', requiredMaterials: [{ materialId: 'brass', amount: 1 }, { materialId: 'gears', amount: 2 }, { materialId: 'springs', amount: 1 }], requiredMachineId: 'clockwork_assembler', buildTime: 35, sellPrice: 55, xpReward: 18, description: 'A finely crafted pocket watch with exposed gears', emoji: '⌚', requiredLevel: 2, effect: 'Tracks time with ±1 second accuracy', blueprintCost: 0 },
  { id: 'steam_whistle', name: 'Steam Whistle', rarity: 'common', requiredMaterials: [{ materialId: 'copper', amount: 2 }, { materialId: 'pipes', amount: 1 }, { materialId: 'valves', amount: 1 }], requiredMachineId: 'pipe_bender', buildTime: 20, sellPrice: 32, xpReward: 10, description: 'A loud steam whistle for signaling across the factory', emoji: '📯', requiredLevel: 3, effect: 'Audible from 2 miles away', blueprintCost: 0 },
  // Uncommon inventions
  { id: 'mechanical_arm', name: 'Mechanical Arm', rarity: 'uncommon', requiredMaterials: [{ materialId: 'steel', amount: 2 }, { materialId: 'gears', amount: 3 }, { materialId: 'springs', amount: 2 }], requiredMachineId: 'steel_smelter', buildTime: 50, sellPrice: 120, xpReward: 35, description: 'A clockwork prosthetic arm with remarkable dexterity', emoji: '🦾', requiredLevel: 5, effect: '+20 strength for manipulation tasks', blueprintCost: 100 },
  { id: 'telescope', name: 'Brass Telescope', rarity: 'uncommon', requiredMaterials: [{ materialId: 'brass', amount: 3 }, { materialId: 'glass', amount: 2 }, { materialId: 'gears', amount: 1 }], requiredMachineId: 'glass_blower', buildTime: 45, sellPrice: 110, xpReward: 30, description: 'A powerful brass telescope with adjustable magnification', emoji: '🔭', requiredLevel: 6, effect: '10x magnification, sees 5 miles', blueprintCost: 120 },
  { id: 'steam_cart', name: 'Steam-Powered Cart', rarity: 'uncommon', requiredMaterials: [{ materialId: 'iron', amount: 4 }, { materialId: 'gears', amount: 2 }, { materialId: 'coal', amount: 3 }], requiredMachineId: 'steam_engine', buildTime: 55, sellPrice: 140, xpReward: 38, description: 'A small steam cart for transporting materials around the factory', emoji: '🛒', requiredLevel: 7, effect: 'Carries 200kg, 15 mph', blueprintCost: 150 },
  { id: 'pressure_gauge', name: 'Precision Pressure Gauge', rarity: 'uncommon', requiredMaterials: [{ materialId: 'brass', amount: 2 }, { materialId: 'glass', amount: 2 }, { materialId: 'phosphor', amount: 1 }], requiredMachineId: 'phosphor_mixer', buildTime: 40, sellPrice: 95, xpReward: 28, description: 'Glowing gauge that reads steam pressure with extreme precision', emoji: '📊', requiredLevel: 8, effect: '±0.01 PSI accuracy', blueprintCost: 130 },
  // Rare inventions
  { id: 'steam_car', name: 'Steam Carriage', rarity: 'rare', requiredMaterials: [{ materialId: 'steel', amount: 5 }, { materialId: 'gears', amount: 4 }, { materialId: 'springs', amount: 3 }, { materialId: 'hydraulic', amount: 2 }], requiredMachineId: 'hydraulic_press', buildTime: 80, sellPrice: 350, xpReward: 75, description: 'A magnificent steam-powered automobile with brass trim', emoji: '🚗', requiredLevel: 10, effect: '25 mph, seats 4, brass appointments', blueprintCost: 300 },
  { id: 'telegraph_key', name: 'Automatic Telegraph Key', rarity: 'rare', requiredMaterials: [{ materialId: 'brass', amount: 3 }, { materialId: 'steel', amount: 2 }, { materialId: 'voltaic', amount: 1 }], requiredMachineId: 'grand_chronometer', buildTime: 60, sellPrice: 280, xpReward: 65, description: 'An automated telegraph that transmits messages at record speed', emoji: '📟', requiredLevel: 13, effect: '50 words per minute transmission', blueprintCost: 250 },
  { id: 'diving_suit', name: 'Brass Diving Suit', rarity: 'rare', requiredMaterials: [{ materialId: 'steel', amount: 4 }, { materialId: 'glass', amount: 3 }, { materialId: 'hydraulic', amount: 2 }, { materialId: 'copper', amount: 2 }], requiredMachineId: 'hydraulic_press', buildTime: 70, sellPrice: 300, xpReward: 70, description: 'A fully sealed brass diving suit with articulated joints', emoji: '🤿', requiredLevel: 15, effect: 'Survive to 300ft depth for 2 hours', blueprintCost: 350 },
  // Epic inventions
  { id: 'airship', name: 'Steam Airship', rarity: 'epic', requiredMaterials: [{ materialId: 'titanium', amount: 4 }, { materialId: 'steel', amount: 6 }, { materialId: 'hydraulic', amount: 3 }, { materialId: 'aether', amount: 2 }], requiredMachineId: 'hull_press', buildTime: 120, sellPrice: 900, xpReward: 180, description: 'A majestic lighter-than-air vessel powered by twin steam engines', emoji: '🎈', requiredLevel: 22, effect: '50 mph, 1000 mile range, 20 passengers', blueprintCost: 800 },
  { id: 'mechanical_golem', name: 'Mechanical Golem', rarity: 'epic', requiredMaterials: [{ materialId: 'titanium', amount: 5 }, { materialId: 'gears', amount: 6 }, { materialId: 'springs', amount: 4 }, { materialId: 'aether', amount: 3 }], requiredMachineId: 'titanium_furnace', buildTime: 130, sellPrice: 1000, xpReward: 200, description: 'A towering automaton powered by aetheric energy', emoji: '🤖', requiredLevel: 25, effect: '10ft tall, obeys 20 commands, immense strength', blueprintCost: 900 },
  { id: 'timepiece', name: 'Chronos Timepiece', rarity: 'epic', requiredMaterials: [{ materialId: 'chronium', amount: 3 }, { materialId: 'gears', amount: 5 }, { materialId: 'springs', amount: 4 }, { materialId: 'phosphor', amount: 2 }], requiredMachineId: 'grand_chronometer', buildTime: 100, sellPrice: 850, xpReward: 170, description: 'A legendary timepiece that can slow local time by 10%', emoji: '⏳', requiredLevel: 28, effect: 'Slow time 10% in 30ft radius', blueprintCost: 850 },
  // Legendary inventions
  { id: 'steam_titans armor', name: 'Steam Titan Armor', rarity: 'legendary', requiredMaterials: [{ materialId: 'adamantine', amount: 4 }, { materialId: 'chronium', amount: 3 }, { materialId: 'quintessence', amount: 2 }], requiredMachineId: 'adamantine_forge', buildTime: 180, sellPrice: 2500, xpReward: 500, description: 'Impenetrable powered armor fueled by quintessence', emoji: '🛡️', requiredLevel: 38, effect: 'Near-invulnerable, +50 STR, flight for 1 hour', blueprintCost: 2000 },
  { id: 'world_engine', name: 'World Engine', rarity: 'legendary', requiredMaterials: [{ materialId: 'orichalcum', amount: 3 }, { materialId: 'adamantine', amount: 4 }, { materialId: 'quintessence', amount: 3 }], requiredMachineId: 'nexus_engine', buildTime: 240, sellPrice: 4000, xpReward: 800, description: 'A machine of mythic proportions — said to reshape continents', emoji: '🌍', requiredLevel: 46, effect: 'Generate unlimited steam power for 1 day', blueprintCost: 3500 },
  { id: 'aether_zeppelin', name: 'Aether Zeppelin', rarity: 'legendary', requiredMaterials: [{ materialId: 'orichalcum', amount: 2 }, { materialId: 'adamantine', amount: 3 }, { materialId: 'aether', amount: 4 }, { materialId: 'quintessence', amount: 2 }], requiredMachineId: 'nexus_engine', buildTime: 200, sellPrice: 3500, xpReward: 700, description: 'The ultimate flying vessel — silent, invisible, and infinitely fast', emoji: '🚀', requiredLevel: 48, effect: '200 mph, invisible, unlimited range', blueprintCost: 3000 },
];

export const FP_WORKERS: FPWorkerDef[] = [
  { id: 'worker_finn', name: 'Finn Copperpot', role: 'Boiler Stoker', description: 'A burly Irishman with years of experience keeping furnaces at peak heat', emoji: '👷', skills: ['engineering'], hireCost: 100, salaryPerCycle: 10, requiredLevel: 1, bonusMultiplier: 1.1 },
  { id: 'worker_clara', name: 'Clara Gearsworth', role: 'Master Machinist', description: 'A brilliant Swiss machinist whose precision is unmatched in all of Europe', emoji: '👩‍🔧', skills: ['machining', 'engineering'], hireCost: 250, salaryPerCycle: 20, requiredLevel: 5, bonusMultiplier: 1.2 },
  { id: 'worker_hugo', name: 'Hugo Blackwell', role: 'Design Engineer', description: 'A visionary designer who sketches inventions that others cannot even imagine', emoji: '🧑‍🔬', skills: ['design', 'innovation'], hireCost: 400, salaryPerCycle: 30, requiredLevel: 10, bonusMultiplier: 1.25 },
  { id: 'worker_ophelia', name: 'Ophelia Brassington', role: 'Forewoman', description: 'A strict but fair forewoman who maximizes efficiency on every floor', emoji: '👩‍💼', skills: ['leadership', 'engineering'], hireCost: 350, salaryPerCycle: 25, requiredLevel: 12, bonusMultiplier: 1.2 },
  { id: 'worker_gideon', name: 'Gideon Steamwright', role: 'Senior Mechanic', description: 'Veteran mechanic who can diagnose any machine fault by sound alone', emoji: '👨‍🔧', skills: ['machining', 'engineering'], hireCost: 500, salaryPerCycle: 35, requiredLevel: 18, bonusMultiplier: 1.3 },
  { id: 'worker_lucia', name: 'Lucia Celestine', role: 'Aether Researcher', description: 'A brilliant but eccentric scientist studying the properties of aether', emoji: '🧙‍♀️', skills: ['innovation', 'design'], hireCost: 800, salaryPerCycle: 50, requiredLevel: 25, bonusMultiplier: 1.4 },
  { id: 'worker_bartholomew', name: 'Bartholomew Ironsides', role: 'Factory Director', description: 'A legendary industrialist who managed the largest factories in London', emoji: '🎩', skills: ['leadership', 'machining'], hireCost: 1200, salaryPerCycle: 70, requiredLevel: 33, bonusMultiplier: 1.5 },
  { id: 'worker_seraphina', name: 'Seraphina Von Clank', role: 'Grand Artificer', description: 'A reclusive genius whose inventions border on the miraculous', emoji: '👑', skills: ['innovation', 'design', 'engineering'], hireCost: 2500, salaryPerCycle: 120, requiredLevel: 42, bonusMultiplier: 1.6 },
];

export const FP_PATENTS: FPPatentDef[] = [
  { id: 'pat_double_gear', name: 'Double Helix Gearing', description: 'A revolutionary gear design that doubles torque output', cost: 200, requiredLevel: 3, bonusDescription: '+10% machine speed on all floors', emoji: '⚙️' },
  { id: 'pat_pressure_valve', name: 'Auto-Regulating Valve', description: 'Valves that self-adjust to maintain optimal steam pressure', cost: 400, requiredLevel: 8, bonusDescription: '+8% production efficiency', emoji: '🎛️' },
  { id: 'pat_heat_shield', name: 'Adamantine Heat Shielding', description: 'Machines run cooler, reducing maintenance costs', cost: 600, requiredLevel: 12, bonusDescription: '+5% material efficiency', emoji: '🛡️' },
  { id: 'pat_aether_cell', name: 'Miniaturized Aether Cell', description: 'Compact aether batteries that power small machines', cost: 1000, requiredLevel: 18, bonusDescription: '+12% quality on all production', emoji: '⚡' },
  { id: 'pat_clockwork_ai', name: 'Clockwork Logic Engine', description: 'Primitive mechanical computation for automated decisions', cost: 1500, requiredLevel: 22, bonusDescription: '+10% output from all machines', emoji: '🧠' },
  { id: 'pat_steam_turbo', name: 'Turbocharged Steam Injection', description: 'Boosts raw power output of all steam engines', cost: 2000, requiredLevel: 28, bonusDescription: '+15% production speed', emoji: '🚀' },
  { id: 'pat_chronium_hull', name: 'Chronium Temporal Plating', description: 'Plating that slightly delays material degradation', cost: 3500, requiredLevel: 35, bonusDescription: '+20% machine durability (slower decay)', emoji: '⏱️' },
  { id: 'pat_quint_drive', name: 'Quintessence Perpetual Drive', description: 'A theoretical infinite energy source — the holy grail of engineering', cost: 8000, requiredLevel: 45, bonusDescription: '+25% all bonuses combined', emoji: '💫' },
];

export const FP_QUESTS: FPQuestDef[] = [
  { id: 'quest_first_production', name: 'First Sparks', description: 'Complete 5 production cycles to prove your engineering skill', type: 'produce', target: 5, rewardCoins: 100, rewardXP: 50, requiredLevel: 1, emoji: '⚙️' },
  { id: 'quest_material_hoarder', name: 'Material Hoarder', description: 'Accumulate 100 units of any material in your warehouse', type: 'produce', target: 100, rewardCoins: 150, rewardXP: 75, requiredLevel: 1, emoji: '📦' },
  { id: 'quest_floor_expansion', name: 'Expand Operations', description: 'Unlock and expand 2 factory floors', type: 'expand', target: 2, rewardCoins: 300, rewardXP: 150, requiredLevel: 5, emoji: '🏗️' },
  { id: 'quest_sell_inventions', name: 'Merchant Engineer', description: 'Sell 5 inventions for profit', type: 'sell', target: 5, rewardCoins: 250, rewardXP: 125, requiredLevel: 5, emoji: '💰' },
  { id: 'quest_hire_crew', name: 'Build Your Crew', description: 'Hire 3 workers to help run the factory', type: 'build', target: 3, rewardCoins: 200, rewardXP: 100, requiredLevel: 10, emoji: '👷' },
  { id: 'quest_research_patent', name: 'Patent Researcher', description: 'Research and acquire 2 patents', type: 'research', target: 2, rewardCoins: 500, rewardXP: 250, requiredLevel: 15, emoji: '📜' },
  { id: 'quest_production_50', name: 'Production Maven', description: 'Complete 50 total production cycles', type: 'produce', target: 50, rewardCoins: 400, rewardXP: 200, requiredLevel: 18, emoji: '🏭' },
  { id: 'quest_wealthy_inventor', name: 'Wealthy Inventor', description: 'Earn a total of 3000 coins', type: 'sell', target: 3000, rewardCoins: 600, rewardXP: 300, requiredLevel: 22, emoji: '👑' },
  { id: 'quest_epic_production', name: 'Epic Manufacturing', description: 'Build 3 epic-rarity inventions', type: 'build', target: 3, rewardCoins: 1000, rewardXP: 500, requiredLevel: 28, emoji: '🌟' },
  { id: 'quest_grand_inventor', name: 'Grand Invention', description: 'Complete 200 total production cycles', type: 'produce', target: 200, rewardCoins: 2000, rewardXP: 1000, requiredLevel: 38, emoji: '🏆' },
];

export const FP_NPCS: FPNPCDef[] = [
  { id: 'npc_professor_archibald', name: 'Professor Archibald Clank', role: 'Dean of Engineering', description: 'A distinguished professor who invented the modern steam engine', emoji: '🧓', greeting: 'Ah, welcome to the factory! Remember: measure twice, cut once, and always mind the pressure gauge.' },
  { id: 'npc_madam_rosalind', name: 'Madame Rosalind Brass', role: 'Patent Office Clerk', description: 'Handles all patent applications with bureaucratic efficiency', emoji: '📋', greeting: 'Papers, please. I shall review your patent application posthaste.' },
  { id: 'npc_captain_thaddeus', name: 'Captain Thaddeus Gears', role: 'Airship Captain', description: 'Buys inventions in bulk for his fleet of steam airships', emoji: '🎈', greeting: 'Avast! I need reliable parts for my airships — what have you got?' },
  { id: 'npc_lord_william', name: 'Lord William Steamsworth', role: 'Factory Inspector', description: 'A strict nobleman who enforces the Imperial Factory Safety Code', emoji: '🎩', greeting: 'I trust all your pressure valves are up to code? The last thing we need is another explosion.' },
  { id: 'npc_iris', name: 'Iris Copperwire', role: 'Scrap Merchant', description: 'Sells discounted materials salvaged from decommissioned factories', emoji: '🧳', greeting: 'One man\'s scrap is another man\'s treasure! Got some lovely copper here, barely used.' },
  { id: 'npc_baron_von_steam', name: 'Baron Von Steam', role: 'Rival Industrialist', description: 'Your main competitor in the race to build the greatest factory', emoji: '😰', greeting: 'So you think your little factory can rival mine? How... quaint.' },
];

export const FP_ACHIEVEMENTS: FPAchievementDef[] = [
  { id: 'ach_first_production', name: 'First Gear Turns', description: 'Complete your first production cycle', conditionKey: 'completedProductions', targetValue: 1, rewardCoins: 10, rewardXP: 5, emoji: '⚙️' },
  { id: 'ach_production_10', name: 'Gears in Motion', description: 'Complete 10 production cycles', conditionKey: 'completedProductions', targetValue: 10, rewardCoins: 50, rewardXP: 25, emoji: '🔧' },
  { id: 'ach_production_50', name: 'Factory Humming', description: 'Complete 50 production cycles', conditionKey: 'completedProductions', targetValue: 50, rewardCoins: 200, rewardXP: 100, emoji: '🏭' },
  { id: 'ach_production_100', name: 'Industrial Powerhouse', description: 'Complete 100 production cycles', conditionKey: 'completedProductions', targetValue: 100, rewardCoins: 500, rewardXP: 250, emoji: '💥' },
  { id: 'ach_first_invention', name: 'First Invention', description: 'Complete your first invention', conditionKey: 'completedInventions', targetValue: 1, rewardCoins: 20, rewardXP: 10, emoji: '💡' },
  { id: 'ach_sell_10', name: 'Successful Sales', description: 'Sell 10 inventions', conditionKey: 'soldInventions', targetValue: 10, rewardCoins: 100, rewardXP: 50, emoji: '💰' },
  { id: 'ach_sell_50', name: 'Industrial Magnate', description: 'Sell 50 inventions', conditionKey: 'soldInventions', targetValue: 50, rewardCoins: 500, rewardXP: 250, emoji: '🎉' },
  { id: 'ach_earn_1000', name: 'Thousand Coin Club', description: 'Earn 1000 coins total', conditionKey: 'totalEarned', targetValue: 1000, rewardCoins: 100, rewardXP: 50, emoji: '🪙' },
  { id: 'ach_earn_10000', name: 'Factory Tycoon', description: 'Earn 10000 coins total', conditionKey: 'totalEarned', targetValue: 10000, rewardCoins: 1000, rewardXP: 500, emoji: '🤑' },
  { id: 'ach_level_10', name: 'Double Digits', description: 'Reach level 10', conditionKey: 'level', targetValue: 10, rewardCoins: 150, rewardXP: 75, emoji: '🔟' },
  { id: 'ach_level_25', name: 'Quarter Century', description: 'Reach level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 400, rewardXP: 200, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Maximum Power', description: 'Reach the maximum level', conditionKey: 'level', targetValue: 50, rewardCoins: 2000, rewardXP: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week Warrior', description: 'Maintain a 7-day daily streak', conditionKey: 'dailyStreak', targetValue: 7, rewardCoins: 200, rewardXP: 100, emoji: '📅' },
  { id: 'ach_streak_30', name: 'Monthly Devotee', description: 'Maintain a 30-day daily streak', conditionKey: 'dailyStreak', targetValue: 30, rewardCoins: 1000, rewardXP: 500, emoji: '🗓️' },
  { id: 'ach_all_floors', name: 'Factory Empire', description: 'Unlock all 8 factory floors', conditionKey: 'floorExpansionCount', targetValue: 7, rewardCoins: 5000, rewardXP: 2500, emoji: '🏛️' },
];

export const FP_DAILY_TASK_POOL: FPDailyTaskPoolDef[] = [
  { id: 'daily_produce_5', name: 'Daily Production', description: 'Complete 5 production cycles today', type: 'produce', target: 5, rewardCoins: 40, rewardXP: 20, emoji: '⚙️' },
  { id: 'daily_produce_10', name: 'Production Rush', description: 'Complete 10 production cycles today', type: 'produce', target: 10, rewardCoins: 80, rewardXP: 40, emoji: '🏭' },
  { id: 'daily_sell_3', name: 'Daily Sales', description: 'Sell 3 inventions today', type: 'sell', target: 3, rewardCoins: 50, rewardXP: 25, emoji: '💰' },
  { id: 'daily_sell_5', name: 'Busy Market', description: 'Sell 5 inventions today', type: 'sell', target: 5, rewardCoins: 100, rewardXP: 50, emoji: '🎉' },
  { id: 'daily_earn_300', name: 'Daily Income', description: 'Earn 300 coins today', type: 'earn', target: 300, rewardCoins: 50, rewardXP: 25, emoji: '🪙' },
  { id: 'daily_earn_800', name: 'Big Earnings', description: 'Earn 800 coins today', type: 'earn', target: 800, rewardCoins: 100, rewardXP: 50, emoji: '🤑' },
  { id: 'daily_build_2', name: 'Build Day', description: 'Build 2 machines today', type: 'build', target: 2, rewardCoins: 60, rewardXP: 30, emoji: '🔨' },
];

// ============================================================
// Initial State
// ============================================================

function createInitialState(seed?: number): FPSteampunkFactoryState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  return {
    level: 1,
    xp: 0,
    coins: 150,
    reputation: 0,
    reputationTitle: FP_REPUTATION_TITLES[0],
    materials: { copper: 10, iron: 8, coal: 15, bolts: 6, pipes: 4 },
    machines: FP_MACHINES.map((m) => ({
      id: m.id,
      level: 0,
      active: false,
      builtOnFloor: null,
    })),
    floors: FP_FLOORS.map((f) => ({
      id: f.id,
      unlocked: f.unlockLevel <= 1,
      level: f.unlockLevel <= 1 ? 1 : 0,
    })),
    blueprints: FP_INVENTIONS.filter((i) => i.blueprintCost === 0).map((i) => ({
      inventionId: i.id,
      purchased: true,
      timesCrafted: 0,
    })),
    patents: FP_PATENTS.map((p) => ({
      id: p.id,
      owned: false,
      purchasedAt: null,
    })),
    workers: FP_WORKERS.map((w) => ({
      id: w.id,
      hired: false,
      assignedFloor: null,
      morale: 100,
    })),
    productionQueue: [],
    activeFloor: 'boiler_room',
    completedProductions: 0,
    completedInventions: 0,
    soldInventions: 0,
    totalEarned: 0,
    totalSpent: 0,
    dailyStreak: 0,
    lastDaily: null,
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: FP_ACHIEVEMENTS.map((a) => ({ id: a.id, unlocked: false, unlockedAt: null })),
    dailyTask: null,
    dailyQuota: null,
    seed: effectiveSeed,
    machineUpgradeCount: 0,
    floorExpansionCount: 0,
    totalPatentsResearched: 0,
    totalWorkersHired: 0,
    productionCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    inventionCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  };
}

// ============================================================
// Hook: useSteampunkFactory
// ============================================================

export default function useSteampunkFactory(initialSeed?: number) {
  const [state, setState] = useState<FPSteampunkFactoryState>(() => createInitialState(initialSeed));
  const prngRef = useRef<() => number>(mulberry32(state.seed));

  // ---- Core State ----

  const fpGetState = useCallback((): Readonly<FPSteampunkFactoryState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const fpResetState = useCallback((newSeed?: number) => {
    const s = newSeed ?? (Date.now() & 0x7fffffff);
    prngRef.current = mulberry32(s);
    setState(createInitialState(s));
  }, []);

  const fpSeed = useCallback((seed: number) => {
    prngRef.current = mulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  const fpRandom = useCallback((): number => {
    return prngRef.current();
  }, []);

  const fpRandomInt = useCallback((min: number, max: number): number => {
    return Math.floor(prngRef.current() * (max - min + 1)) + min;
  }, []);

  const fpRandomChoice = useCallback(<T>(arr: readonly T[]): T | null => {
    if (arr.length === 0) return null;
    return arr[Math.floor(prngRef.current() * arr.length)];
  }, []);

  // ---- Level / XP ----

  const fpGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const fpGetXP = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const fpGetXPTillNext = useCallback((): number => {
    return fpXpRequiredForLevel(state.level);
  }, [state.level]);

  const fpGetXPTotal = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const fpAddXP = useCallback((amount: number): FPSteampunkFactoryState => {
    let next = { ...state, xp: state.xp + amount };
    const needed = fpXpRequiredForLevel(next.level);
    while (next.xp >= needed && next.level < FP_MAX_LEVEL) {
      next = { ...next, xp: next.xp - fpXpRequiredForLevel(next.level), level: fpClampLevel(next.level + 1) };
      if (next.xp < fpXpRequiredForLevel(next.level) || next.level >= FP_MAX_LEVEL) break;
    }
    if (next.level >= FP_MAX_LEVEL) next.xp = 0;
    setState(next);
    return next;
  }, [state]);

  const fpGetTitle = useCallback((): FPTitleInfo => {
    let title = FP_TITLE_THRESHOLDS[0];
    for (const t of FP_TITLE_THRESHOLDS) {
      if (state.level >= t.levelRequired) title = t;
    }
    return title;
  }, [state.level]);

  const fpGetAllTitles = useCallback((): FPTitleInfo[] => {
    return [...FP_TITLE_THRESHOLDS];
  }, []);

  const fpGetNextTitle = useCallback((): FPTitleInfo | null => {
    const current = fpGetTitle();
    const idx = FP_TITLE_THRESHOLDS.indexOf(current);
    if (idx < FP_TITLE_THRESHOLDS.length - 1) return FP_TITLE_THRESHOLDS[idx + 1];
    return null;
  }, [fpGetTitle]);

  const fpGetProgress = useCallback((): number => {
    const needed = fpXpRequiredForLevel(state.level);
    if (needed === Infinity) return 100;
    return Math.min(100, (state.xp / needed) * 100);
  }, [state.level, state.xp]);

  const fpGetOverallProgress = useCallback((): number => {
    return (state.level / FP_MAX_LEVEL) * 100;
  }, [state.level]);

  // ---- Coins ----

  const fpGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const fpAddCoins = useCallback((amount: number): FPSteampunkFactoryState => {
    const next = { ...state, coins: fpClampCoins(state.coins + amount), totalEarned: state.totalEarned + Math.max(0, amount) };
    setState(next);
    return next;
  }, [state]);

  const fpSpendCoins = useCallback((amount: number): { success: boolean; state: FPSteampunkFactoryState } => {
    if (state.coins < amount) return { success: false, state };
    const next = { ...state, coins: fpClampCoins(state.coins - amount), totalSpent: state.totalSpent + amount };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Machines ----

  const fpGetMachines = useCallback((): FPMachineDef[] => {
    return [...FP_MACHINES];
  }, []);

  const fpGetMachineById = useCallback((id: string): FPMachineDef | null => {
    return FP_MACHINES.find((m) => m.id === id) ?? null;
  }, []);

  const fpGetMachineStates = useCallback((): FPMachineState[] => {
    return [...state.machines];
  }, [state.machines]);

  const fpGetBuiltMachines = useCallback((): FPMachineState[] => {
    return state.machines.filter((m) => m.active);
  }, [state.machines]);

  const fpGetMachinesByFloor = useCallback((floorId: string): FPMachineState[] => {
    return state.machines.filter((m) => m.builtOnFloor === floorId && m.active);
  }, [state.machines]);

  const fpGetMachineLevel = useCallback((machineId: string): number => {
    return state.machines.find((m) => m.id === machineId)?.level ?? 0;
  }, [state.machines]);

  const fpGetMachineBonus = useCallback((machineId: string): number => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    const ms = state.machines.find((m) => m.id === machineId);
    if (!def || !ms || ms.level === 0) return 0;
    return def.baseBonusValue + (ms.level - 1) * Math.ceil(def.baseBonusValue * 0.3);
  }, [state.machines]);

  const fpBuildMachine = useCallback((machineId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    const ms = state.machines.find((m) => m.id === machineId);
    if (!def || !ms) return { success: false, cost: 0, state };
    if (ms.active) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    const floor = state.floors.find((f) => f.id === def.floorId);
    if (!floor || !floor.unlocked) return { success: false, cost: 0, state };
    const floorMachines = state.machines.filter((m) => m.builtOnFloor === def.floorId && m.active).length;
    const floorDef = FP_FLOORS.find((f) => f.id === def.floorId);
    if (floorDef && floorMachines >= floorDef.maxMachines) return { success: false, cost: 0, state };
    const cost = def.baseCost;
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, level: 1, active: true, builtOnFloor: def.floorId } : m
      ),
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state]);

  const fpUpgradeMachine = useCallback((machineId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    const ms = state.machines.find((m) => m.id === machineId);
    if (!def || !ms) return { success: false, cost: 0, state };
    if (!ms.active || ms.level >= def.maxLevel) return { success: false, cost: 0, state };
    const cost = Math.floor(def.baseCost * (0.5 + ms.level * 0.4));
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, level: m.level + 1 } : m
      ),
      machineUpgradeCount: state.machineUpgradeCount + 1,
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state]);

  const fpDismantleMachine = useCallback((machineId: string): { success: boolean; refund: number; state: FPSteampunkFactoryState } => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    const ms = state.machines.find((m) => m.id === machineId);
    if (!def || !ms || !ms.active) return { success: false, refund: 0, state };
    const refund = Math.floor(def.baseCost * 0.3);
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + refund),
      machines: state.machines.map((m) =>
        m.id === machineId ? { ...m, level: 0, active: false, builtOnFloor: null } : m
      ),
    };
    setState(next);
    return { success: true, refund, state: next };
  }, [state]);

  // ---- Floors ----

  const fpGetFloors = useCallback((): FPFloorDef[] => {
    return [...FP_FLOORS];
  }, []);

  const fpGetFloorStates = useCallback((): FPFloorState[] => {
    return [...state.floors];
  }, [state.floors]);

  const fpGetUnlockedFloors = useCallback((): FPFloorState[] => {
    return state.floors.filter((f) => f.unlocked);
  }, [state.floors]);

  const fpGetFloorById = useCallback((id: string): FPFloorDef | null => {
    return FP_FLOORS.find((f) => f.id === id) ?? null;
  }, []);

  const fpGetActiveFloor = useCallback((): string => {
    return state.activeFloor;
  }, [state.activeFloor]);

  const fpSetActiveFloor = useCallback((floorId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const fs = state.floors.find((f) => f.id === floorId);
    if (!fs || !fs.unlocked) return { success: false, state };
    const next = { ...state, activeFloor: floorId };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpUnlockFloor = useCallback((floorId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_FLOORS.find((f) => f.id === floorId);
    const fs = state.floors.find((f) => f.id === floorId);
    if (!def || !fs) return { success: false, cost: 0, state };
    if (fs.unlocked) return { success: false, cost: 0, state };
    if (state.level < def.unlockLevel) return { success: false, cost: 0, state };
    const cost = def.expansionCost;
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      floors: state.floors.map((f) =>
        f.id === floorId ? { ...f, unlocked: true, level: 1 } : f
      ),
      floorExpansionCount: state.floorExpansionCount + 1,
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state]);

  const fpUpgradeFloor = useCallback((floorId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_FLOORS.find((f) => f.id === floorId);
    const fs = state.floors.find((f) => f.id === floorId);
    if (!def || !fs || !fs.unlocked) return { success: false, cost: 0, state };
    const newLevel = fs.level + 1;
    if (newLevel > 10) return { success: false, cost: 0, state };
    const cost = Math.floor(def.expansionCost * (0.4 + fs.level * 0.35));
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      floors: state.floors.map((f) =>
        f.id === floorId ? { ...f, level: newLevel } : f
      ),
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state]);

  // ---- Materials ----

  const fpGetMaterials = useCallback((): FPMaterialDef[] => {
    return [...FP_MATERIALS];
  }, []);

  const fpGetMaterialById = useCallback((id: string): FPMaterialDef | null => {
    return FP_MATERIALS.find((m) => m.id === id) ?? null;
  }, []);

  const fpGetInventory = useCallback((): Record<string, number> => {
    return { ...state.materials };
  }, [state.materials]);

  const fpGetMaterialCount = useCallback((materialId: string): number => {
    return state.materials[materialId] ?? 0;
  }, [state.materials]);

  const fpGetMaterialCost = useCallback((materialId: string): number => {
    const def = FP_MATERIALS.find((m) => m.id === materialId);
    return def?.cost ?? 0;
  }, []);

  const fpBuyMaterial = useCallback((materialId: string, amount: number = 1): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_MATERIALS.find((m) => m.id === materialId);
    if (!def) return { success: false, cost: 0, state };
    const totalCost = def.cost * amount;
    if (state.coins < totalCost) return { success: false, cost: totalCost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - totalCost),
      totalSpent: state.totalSpent + totalCost,
      materials: { ...state.materials, [materialId]: (state.materials[materialId] ?? 0) + amount },
    };
    setState(next);
    return { success: true, cost: totalCost, state: next };
  }, [state]);

  const fpUseMaterial = useCallback((materialId: string, amount: number = 1): boolean => {
    const have = state.materials[materialId] ?? 0;
    if (have < amount) return false;
    setState((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialId]: prev.materials[materialId] - amount },
    }));
    return true;
  }, [state.materials]);

  const fpHasMaterials = useCallback((requirements: { materialId: string; amount: number }[]): boolean => {
    return requirements.every((r) => (state.materials[r.materialId] ?? 0) >= r.amount);
  }, [state.materials]);

  const fpGetMissingMaterials = useCallback((requirements: { materialId: string; amount: number }[]): { materialId: string; name: string; have: number; need: number }[] => {
    return requirements
      .filter((r) => (state.materials[r.materialId] ?? 0) < r.amount)
      .map((r) => {
        const def = FP_MATERIALS.find((m) => m.id === r.materialId);
        return { materialId: r.materialId, name: def?.name ?? r.materialId, have: state.materials[r.materialId] ?? 0, need: r.amount };
      });
  }, [state.materials]);

  const fpGetMaterialsByRarity = useCallback((rarity: FPRarity): FPMaterialDef[] => {
    return FP_MATERIALS.filter((m) => m.rarity === rarity);
  }, []);

  const fpGetMaterialsByCategory = useCallback((category: 'metal' | 'component' | 'fuel' | 'exotic'): FPMaterialDef[] => {
    return FP_MATERIALS.filter((m) => m.category === category);
  }, []);

  // ---- Production ----

  const fpStartProduction = useCallback((machineId: string, now: number = Date.now()): { success: boolean; job: FPProductionJob | null; state: FPSteampunkFactoryState } => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    const ms = state.machines.find((m) => m.id === machineId);
    if (!def || !ms || !ms.active) return { success: false, job: null, state };
    if (!fpHasMaterials(def.inputMaterials)) return { success: false, job: null, state };
    const activeJobs = state.productionQueue.filter((j) => j.machineId === machineId).length;
    if (activeJobs >= 1) return { success: false, job: null, state };
    const rng = mulberry32(fpHashString(machineId) + now);
    const baseQuality = 50 + ms.level * 5 + Math.floor(rng() * 20);
    const floor = state.floors.find((f) => f.id === def.floorId);
    const floorBonus = floor ? (floor.level - 1) * 2 : 0;
    const quality = Math.min(100, baseQuality + floorBonus);
    const baseTime = def.baseProductionTime;
    const speedBonus = fpGetMachineBonus(machineId);
    const effectiveTime = Math.max(5, Math.floor(baseTime * (1 - speedBonus / 100)));
    const jobId = `job_${machineId}_${now}`;
    const job: FPProductionJob = {
      id: jobId,
      machineId,
      floorId: def.floorId,
      startedAt: now,
      endsAt: now + effectiveTime * 1000,
      quality,
    };
    const newMaterials = { ...state.materials };
    for (const inp of def.inputMaterials) {
      newMaterials[inp.materialId] = (newMaterials[inp.materialId] ?? 0) - inp.amount;
    }
    const next = { ...state, materials: newMaterials, productionQueue: [...state.productionQueue, job] };
    setState(next);
    return { success: true, job, state: next };
  }, [state, fpHasMaterials, fpGetMachineBonus]);

  const fpGetProductionQueue = useCallback((): FPProductionJob[] => {
    return [...state.productionQueue];
  }, [state.productionQueue]);

  const fpIsProducing = useCallback((machineId: string): boolean => {
    return state.productionQueue.some((j) => j.machineId === machineId);
  }, [state.productionQueue]);

  const fpCollectProduction = useCallback((jobId: string, now: number = Date.now()): { success: boolean; machineId: string; materialId: string; amount: number; quality: number; xpEarned: number; state: FPSteampunkFactoryState } => {
    const job = state.productionQueue.find((j) => j.id === jobId);
    if (!job) return { success: false, machineId: '', materialId: '', amount: 0, quality: 0, xpEarned: 0, state };
    if (now < job.endsAt) return { success: false, machineId: job.machineId, materialId: '', amount: 0, quality: 0, xpEarned: 0, state };
    const def = FP_MACHINES.find((m) => m.id === job.machineId);
    const ms = state.machines.find((m) => m.id === job.machineId);
    if (!def || !ms) return { success: false, machineId: job.machineId, materialId: '', amount: 0, quality: 0, xpEarned: 0, state };
    const qualityMultiplier = 1 + job.quality / 200;
    const amount = Math.ceil(def.outputAmount * qualityMultiplier);
    const workerBonus = state.workers
      .filter((w) => w.hired && w.assignedFloor === job.floorId)
      .reduce((acc, w) => {
        const wDef = FP_WORKERS.find((wd) => wd.id === w.id);
        return acc + (wDef?.bonusMultiplier ?? 1);
      }, 0);
    const finalAmount = Math.ceil(amount * (workerBonus > 0 ? (workerBonus / state.workers.filter((w) => w.hired && w.assignedFloor === job.floorId).length) : 1));
    const xpEarned = Math.floor(10 * fpRarityMultiplier(def.rarity) * (1 + ms.level * 0.1));
    const newMaterials = { ...state.materials, [def.outputMaterialId]: (state.materials[def.outputMaterialId] ?? 0) + finalAmount };
    const next = {
      ...state,
      materials: newMaterials,
      productionQueue: state.productionQueue.filter((j) => j.id !== jobId),
      completedProductions: state.completedProductions + 1,
      productionCountByRarity: { ...state.productionCountByRarity, [def.rarity]: (state.productionCountByRarity[def.rarity] ?? 0) + 1 },
    };
    // Add XP
    let xpNext = next;
    let xp = next.xp + xpEarned;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, machineId: job.machineId, materialId: def.outputMaterialId, amount: finalAmount, quality: job.quality, xpEarned, state: xpNext };
  }, [state]);

  const fpCancelProduction = useCallback((jobId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const idx = state.productionQueue.findIndex((j) => j.id === jobId);
    if (idx === -1) return { success: false, state };
    const next = { ...state, productionQueue: state.productionQueue.filter((j) => j.id !== jobId) };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpGetProductionTimeRemaining = useCallback((jobId: string, now: number = Date.now()): number => {
    const job = state.productionQueue.find((j) => j.id === jobId);
    if (!job) return 0;
    return Math.max(0, Math.ceil((job.endsAt - now) / 1000));
  }, [state.productionQueue]);

  // ---- Inventions ----

  const fpGetInventions = useCallback((): FPInventionDef[] => {
    return [...FP_INVENTIONS];
  }, []);

  const fpGetInventionById = useCallback((id: string): FPInventionDef | null => {
    return FP_INVENTIONS.find((i) => i.id === id) ?? null;
  }, []);

  const fpGetBlueprints = useCallback((): FPBlueprint[] => {
    return [...state.blueprints];
  }, [state.blueprints]);

  const fpHasBlueprint = useCallback((inventionId: string): boolean => {
    return state.blueprints.some((b) => b.inventionId === inventionId && b.purchased);
  }, [state.blueprints]);

  const fpPurchaseBlueprint = useCallback((inventionId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_INVENTIONS.find((i) => i.id === inventionId);
    if (!def) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    if (fpHasBlueprint(inventionId)) return { success: false, cost: 0, state };
    const cost = def.blueprintCost;
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      blueprints: [...state.blueprints, { inventionId, purchased: true, timesCrafted: 0 }],
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state, fpHasBlueprint]);

  const fpCraftInvention = useCallback((inventionId: string, now: number = Date.now()): { success: boolean; xpEarned: number; state: FPSteampunkFactoryState } => {
    const def = FP_INVENTIONS.find((i) => i.id === inventionId);
    if (!def) return { success: false, xpEarned: 0, state };
    if (!fpHasBlueprint(inventionId)) return { success: false, xpEarned: 0, state };
    if (state.level < def.requiredLevel) return { success: false, xpEarned: 0, state };
    if (!fpHasMaterials(def.requiredMaterials)) return { success: false, xpEarned: 0, state };
    const newMaterials = { ...state.materials };
    for (const req of def.requiredMaterials) {
      newMaterials[req.materialId] = (newMaterials[req.materialId] ?? 0) - req.amount;
    }
    const xpEarned = Math.floor(def.xpReward * fpRarityMultiplier(def.rarity));
    const next = {
      ...state,
      materials: newMaterials,
      completedInventions: state.completedInventions + 1,
      inventionCountByRarity: { ...state.inventionCountByRarity, [def.rarity]: (state.inventionCountByRarity[def.rarity] ?? 0) + 1 },
      blueprints: state.blueprints.map((b) =>
        b.inventionId === inventionId ? { ...b, timesCrafted: b.timesCrafted + 1 } : b
      ),
    };
    let xpNext = next;
    let xp = next.xp + xpEarned;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, xpEarned, state: xpNext };
  }, [state, fpHasBlueprint, fpHasMaterials]);

  const fpSellInvention = useCallback((inventionId: string): { success: boolean; price: number; xpEarned: number; state: FPSteampunkFactoryState } => {
    const def = FP_INVENTIONS.find((i) => i.id === inventionId);
    if (!def) return { success: false, price: 0, xpEarned: 0, state };
    const bp = state.blueprints.find((b) => b.inventionId === inventionId);
    if (!bp || bp.timesCrafted < 1) return { success: false, price: 0, xpEarned: 0, state };
    const price = def.sellPrice;
    const xpEarned = Math.floor(def.xpReward * 0.3);
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + price),
      totalEarned: state.totalEarned + price,
      soldInventions: state.soldInventions + 1,
      blueprints: state.blueprints.map((b) =>
        b.inventionId === inventionId ? { ...b, timesCrafted: Math.max(0, b.timesCrafted - 1) } : b
      ),
    };
    let xpNext = next;
    let xp = next.xp + xpEarned;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, price, xpEarned, state: xpNext };
  }, [state]);

  const fpGetInventionsByRarity = useCallback((rarity: FPRarity): FPInventionDef[] => {
    return FP_INVENTIONS.filter((i) => i.rarity === rarity);
  }, []);

  const fpGetCraftableInventions = useCallback((): FPInventionDef[] => {
    return FP_INVENTIONS.filter((i) =>
      fpHasBlueprint(i.id) && state.level >= i.requiredLevel && fpHasMaterials(i.requiredMaterials)
    );
  }, [fpHasBlueprint, fpHasMaterials, state.level]);

  const fpGetAffordableInventions = useCallback((): FPInventionDef[] => {
    return FP_INVENTIONS.filter((i) =>
      !fpHasBlueprint(i.id) && state.level >= i.requiredLevel && state.coins >= i.blueprintCost
    );
  }, [fpHasBlueprint, state.level, state.coins]);

  // ---- Workers ----

  const fpGetWorkers = useCallback((): FPWorkerDef[] => {
    return [...FP_WORKERS];
  }, []);

  const fpGetWorkerById = useCallback((id: string): FPWorkerDef | null => {
    return FP_WORKERS.find((w) => w.id === id) ?? null;
  }, []);

  const fpGetWorkerStates = useCallback((): FPWorkerState[] => {
    return [...state.workers];
  }, [state.workers]);

  const fpGetHiredWorkers = useCallback((): FPWorkerState[] => {
    return state.workers.filter((w) => w.hired);
  }, [state.workers]);

  const fpHireWorker = useCallback((workerId: string): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_WORKERS.find((w) => w.id === workerId);
    const ws = state.workers.find((w) => w.id === workerId);
    if (!def || !ws) return { success: false, cost: 0, state };
    if (ws.hired) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    if (state.coins < def.hireCost) return { success: false, cost: def.hireCost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - def.hireCost),
      totalSpent: state.totalSpent + def.hireCost,
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, hired: true, morale: 100 } : w
      ),
      totalWorkersHired: state.totalWorkersHired + 1,
    };
    setState(next);
    return { success: true, cost: def.hireCost, state: next };
  }, [state]);

  const fpAssignWorker = useCallback((workerId: string, floorId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const ws = state.workers.find((w) => w.id === workerId);
    const fs = state.floors.find((f) => f.id === floorId);
    if (!ws || !ws.hired || !fs || !fs.unlocked) return { success: false, state };
    const next = {
      ...state,
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, assignedFloor: floorId } : w
      ),
    };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpUnassignWorker = useCallback((workerId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const next = {
      ...state,
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, assignedFloor: null } : w
      ),
    };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpDismissWorker = useCallback((workerId: string): { success: boolean; refund: number; state: FPSteampunkFactoryState } => {
    const ws = state.workers.find((w) => w.id === workerId);
    if (!ws || !ws.hired) return { success: false, refund: 0, state };
    const refund = Math.floor(FP_WORKERS.find((w) => w.id === workerId)?.hireCost ?? 0 * 0.2);
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + refund),
      workers: state.workers.map((w) =>
        w.id === workerId ? { ...w, hired: false, assignedFloor: null, morale: 100 } : w
      ),
    };
    setState(next);
    return { success: true, refund, state: next };
  }, [state]);

  const fpGetWorkersByFloor = useCallback((floorId: string): FPWorkerState[] => {
    return state.workers.filter((w) => w.hired && w.assignedFloor === floorId);
  }, [state.workers]);

  const fpGetFloorBonus = useCallback((floorId: string): number => {
    const workers = state.workers.filter((w) => w.hired && w.assignedFloor === floorId);
    if (workers.length === 0) return 1;
    const totalBonus = workers.reduce((acc, w) => {
      const def = FP_WORKERS.find((wd) => wd.id === w.id);
      return acc + ((def?.bonusMultiplier ?? 1) - 1);
    }, 0);
    return 1 + totalBonus / workers.length;
  }, [state.workers]);

  // ---- Patents ----

  const fpGetPatents = useCallback((): FPPatentDef[] => {
    return [...FP_PATENTS];
  }, []);

  const fpGetPatentStates = useCallback((): FPPatentState[] => {
    return [...state.patents];
  }, [state.patents]);

  const fpGetOwnedPatents = useCallback((): FPPatentState[] => {
    return state.patents.filter((p) => p.owned);
  }, [state.patents]);

  const fpResearchPatent = useCallback((patentId: string, now: number = Date.now()): { success: boolean; cost: number; state: FPSteampunkFactoryState } => {
    const def = FP_PATENTS.find((p) => p.id === patentId);
    const ps = state.patents.find((p) => p.id === patentId);
    if (!def || !ps) return { success: false, cost: 0, state };
    if (ps.owned) return { success: false, cost: 0, state };
    if (state.level < def.requiredLevel) return { success: false, cost: 0, state };
    const cost = def.cost;
    if (state.coins < cost) return { success: false, cost, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins - cost),
      totalSpent: state.totalSpent + cost,
      patents: state.patents.map((p) =>
        p.id === patentId ? { ...p, owned: true, purchasedAt: now } : p
      ),
      totalPatentsResearched: state.totalPatentsResearched + 1,
    };
    setState(next);
    return { success: true, cost, state: next };
  }, [state]);

  const fpGetPatentBonus = useCallback((): number => {
    let totalBonus = 0;
    for (const ps of state.patents) {
      if (ps.owned) {
        const def = FP_PATENTS.find((p) => p.id === ps.id);
        if (def) totalBonus += parseFloat(def.bonusDescription.match(/[\d.]+/)?.[0] ?? '0');
      }
    }
    return totalBonus;
  }, [state.patents]);

  // ---- Reputation ----

  const fpGetReputation = useCallback((): number => {
    return state.reputation;
  }, [state.reputation]);

  const fpGetReputationTitle = useCallback((): string => {
    return state.reputationTitle;
  }, [state.reputationTitle]);

  const fpGetReputationRank = useCallback((): number => {
    const idx = FP_REPUTATION_TITLES.indexOf(state.reputationTitle);
    return idx >= 0 ? idx : 0;
  }, [state.reputationTitle]);

  const fpGetNextReputationTitle = useCallback((): string | null => {
    const rank = fpGetReputationRank();
    if (rank < FP_REPUTATION_TITLES.length - 1) return FP_REPUTATION_TITLES[rank + 1];
    return null;
  }, [fpGetReputationRank]);

  const fpGetReputationProgress = useCallback((): number => {
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    const rank = fpGetReputationRank();
    if (rank >= thresholds.length - 1) return 100;
    const lower = thresholds[rank];
    const upper = thresholds[rank + 1];
    return Math.min(100, ((state.reputation - lower) / (upper - lower)) * 100);
  }, [state.reputation, fpGetReputationRank]);

  const fpAddReputation = useCallback((amount: number): FPSteampunkFactoryState => {
    const newRep = Math.max(0, state.reputation + amount);
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    let title = state.reputationTitle;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (newRep >= thresholds[i]) { title = FP_REPUTATION_TITLES[i]; break; }
    }
    const next = { ...state, reputation: newRep, reputationTitle: title };
    setState(next);
    return next;
  }, [state]);

  // ---- Quests ----

  const fpGetQuests = useCallback((): FPQuestDef[] => {
    return [...FP_QUESTS];
  }, []);

  const fpGetActiveQuests = useCallback((): (FPQuestDef & FPQuestState)[] => {
    return state.activeQuests.map((aq) => {
      const def = FP_QUESTS.find((q) => q.id === aq.id);
      if (!def) return { ...aq, name: '', description: '', type: 'produce' as FPQuestType, target: 0, rewardCoins: 0, rewardXP: 0, requiredLevel: 0, emoji: '' };
      return { ...aq, ...def };
    });
  }, [state.activeQuests]);

  const fpGetAvailableQuests = useCallback((): FPQuestDef[] => {
    return FP_QUESTS.filter(
      (q) => state.level >= q.requiredLevel &&
        !state.activeQuests.some((aq) => aq.id === q.id) &&
        !state.completedQuests.includes(q.id)
    );
  }, [state.level, state.activeQuests, state.completedQuests]);

  const fpGetCompletedQuests = useCallback((): string[] => {
    return [...state.completedQuests];
  }, [state.completedQuests]);

  const fpAcceptQuest = useCallback((questId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const def = FP_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.activeQuests.some((q) => q.id === questId)) return { success: false, state };
    if (state.completedQuests.includes(questId)) return { success: false, state };
    if (state.activeQuests.length >= 5) return { success: false, state };
    const next = { ...state, activeQuests: [...state.activeQuests, { id: questId, accepted: true, completed: false, progress: 0 }] };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  const fpGetQuestProgress = useCallback((questId: string): number => {
    return state.activeQuests.find((q) => q.id === questId)?.progress ?? 0;
  }, [state.activeQuests]);

  const fpUpdateQuestProgress = useCallback((questId: string, increment: number): FPSteampunkFactoryState => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    const def = FP_QUESTS.find((q) => q.id === questId);
    if (!aq || !def) return state;
    const newProgress = Math.min(def.target, aq.progress + increment);
    const completed = newProgress >= def.target;
    const next = {
      ...state,
      activeQuests: state.activeQuests.map((q) =>
        q.id === questId ? { ...q, progress: newProgress, completed } : q
      ),
    };
    setState(next);
    return next;
  }, [state]);

  const fpCompleteQuest = useCallback((questId: string): { success: boolean; rewardCoins: number; rewardXP: number; state: FPSteampunkFactoryState } => {
    const aq = state.activeQuests.find((q) => q.id === questId);
    if (!aq || !aq.completed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const def = FP_QUESTS.find((q) => q.id === questId);
    if (!def) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + def.rewardCoins),
      totalEarned: state.totalEarned + def.rewardCoins,
      activeQuests: state.activeQuests.filter((q) => q.id !== questId),
      completedQuests: [...state.completedQuests, questId],
    };
    let xpNext = next;
    let xp = next.xp + def.rewardXP;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, rewardCoins: def.rewardCoins, rewardXP: def.rewardXP, state: xpNext };
  }, [state]);

  const fpAbandonQuest = useCallback((questId: string): { success: boolean; state: FPSteampunkFactoryState } => {
    const idx = state.activeQuests.findIndex((q) => q.id === questId);
    if (idx === -1) return { success: false, state };
    const next = { ...state, activeQuests: state.activeQuests.filter((q) => q.id !== questId) };
    setState(next);
    return { success: true, state: next };
  }, [state]);

  // ---- Achievements ----

  const fpGetAchievements = useCallback((): FPAchievementDef[] => {
    return [...FP_ACHIEVEMENTS];
  }, []);

  const fpGetUnlockedAchievements = useCallback((): FPAchievementState[] => {
    return state.unlockedAchievements.filter((a) => a.unlocked);
  }, [state.unlockedAchievements]);

  const fpIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.unlockedAchievements.find((a) => a.id === achievementId)?.unlocked ?? false;
  }, [state.unlockedAchievements]);

  const fpCheckAchievements = useCallback((): FPAchievementState[] => {
    const newlyUnlocked: FPAchievementState[] = [];
    const values: Record<string, number> = {
      completedProductions: state.completedProductions,
      completedInventions: state.completedInventions,
      soldInventions: state.soldInventions,
      totalEarned: state.totalEarned,
      level: state.level,
      dailyStreak: state.dailyStreak,
      floorExpansionCount: state.floorExpansionCount,
    };
    let changed = false;
    const newAchievements = state.unlockedAchievements.map((a) => {
      if (a.unlocked) return a;
      const def = FP_ACHIEVEMENTS.find((d) => d.id === a.id);
      if (!def) return a;
      const val = values[def.conditionKey] ?? 0;
      if (val >= def.targetValue) {
        changed = true;
        const unlocked: FPAchievementState = { ...a, unlocked: true, unlockedAt: Date.now() };
        newlyUnlocked.push(unlocked);
        return unlocked;
      }
      return a;
    });
    if (changed) {
      let totalRewardCoins = 0;
      let totalRewardXP = 0;
      for (const a of newlyUnlocked) {
        const def = FP_ACHIEVEMENTS.find((d) => d.id === a.id);
        if (def) { totalRewardCoins += def.rewardCoins; totalRewardXP += def.rewardXP; }
      }
      const next = {
        ...state,
        unlockedAchievements: newAchievements,
        coins: fpClampCoins(state.coins + totalRewardCoins),
        totalEarned: state.totalEarned + totalRewardCoins,
      };
      let xp = next.xp + totalRewardXP;
      let lvl = next.level;
      while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
        xp -= fpXpRequiredForLevel(lvl);
        lvl = fpClampLevel(lvl + 1);
      }
      if (lvl >= FP_MAX_LEVEL) xp = 0;
      const xpNext = { ...next, xp, level: lvl };
      setState(xpNext);
      return newlyUnlocked;
    }
    return [];
  }, [state]);

  // ---- Daily Tasks ----

  const fpGetDailyTask = useCallback((): FPDailyTaskState | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const fpRefreshDailyTask = useCallback((now: number = Date.now()): { dailyTask: FPDailyTaskPoolDef | null; state: FPSteampunkFactoryState } => {
    const dayKey = fpGenerateDayKey(now);
    if (state.dailyTask && state.dailyTask.dayKey === dayKey) {
      const pool = FP_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
      return { dailyTask: pool ?? null, state };
    }
    const rng = mulberry32(fpHashString(dayKey) + state.seed);
    const idx = Math.floor(rng() * FP_DAILY_TASK_POOL.length);
    const task = FP_DAILY_TASK_POOL[idx];
    const dtState: FPDailyTaskState = { poolId: task.id, progress: 0, claimed: false, dayKey };
    const next = { ...state, dailyTask: dtState };
    setState(next);
    return { dailyTask: task, state: next };
  }, [state]);

  const fpUpdateDailyProgress = useCallback((increment: number): FPSteampunkFactoryState => {
    if (!state.dailyTask || state.dailyTask.claimed) return state;
    const poolDef = FP_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!poolDef) return state;
    const newProgress = Math.min(poolDef.target, state.dailyTask.progress + increment);
    const next = { ...state, dailyTask: { ...state.dailyTask, progress: newProgress } };
    setState(next);
    return next;
  }, [state]);

  const fpClaimDailyReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: FPSteampunkFactoryState } => {
    if (!state.dailyTask || state.dailyTask.claimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const poolDef = FP_DAILY_TASK_POOL.find((d) => d.id === state.dailyTask!.poolId);
    if (!poolDef) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyTask.progress < poolDef.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + poolDef.rewardCoins),
      totalEarned: state.totalEarned + poolDef.rewardCoins,
      dailyTask: { ...state.dailyTask, claimed: true },
    };
    let xpNext = next;
    let xp = next.xp + poolDef.rewardXP;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, rewardCoins: poolDef.rewardCoins, rewardXP: poolDef.rewardXP, state: xpNext };
  }, [state]);

  // ---- Daily Quota ----

  const fpGetDailyQuota = useCallback((): FPQuotaState | null => {
    return state.dailyQuota;
  }, [state.dailyQuota]);

  const fpRefreshDailyQuota = useCallback((now: number = Date.now()): { quota: FPQuotaState; state: FPSteampunkFactoryState } => {
    const dayKey = fpGenerateDayKey(now);
    if (state.dailyQuota && state.dailyQuota.dayKey === dayKey) {
      return { quota: state.dailyQuota, state };
    }
    const target = 10 + Math.floor(state.level * 1.5);
    const quota: FPQuotaState = { target, progress: 0, dayKey, rewardClaimed: false };
    const next = { ...state, dailyQuota: quota };
    setState(next);
    return { quota, state: next };
  }, [state]);

  const fpUpdateQuotaProgress = useCallback((increment: number): FPSteampunkFactoryState => {
    if (!state.dailyQuota || state.dailyQuota.rewardClaimed) return state;
    const newProgress = Math.min(state.dailyQuota.target, state.dailyQuota.progress + increment);
    const next = { ...state, dailyQuota: { ...state.dailyQuota, progress: newProgress } };
    setState(next);
    return next;
  }, [state]);

  const fpClaimQuotaReward = useCallback((): { success: boolean; rewardCoins: number; rewardXP: number; state: FPSteampunkFactoryState } => {
    if (!state.dailyQuota || state.dailyQuota.rewardClaimed) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    if (state.dailyQuota.progress < state.dailyQuota.target) return { success: false, rewardCoins: 0, rewardXP: 0, state };
    const rewardCoins = 100 + state.dailyQuota.target * 10;
    const rewardXP = 50 + state.dailyQuota.target * 5;
    const next = {
      ...state,
      coins: fpClampCoins(state.coins + rewardCoins),
      totalEarned: state.totalEarned + rewardCoins,
      dailyQuota: { ...state.dailyQuota, rewardClaimed: true },
    };
    let xpNext = next;
    let xp = next.xp + rewardXP;
    let lvl = next.level;
    while (xp >= fpXpRequiredForLevel(lvl) && lvl < FP_MAX_LEVEL) {
      xp -= fpXpRequiredForLevel(lvl);
      lvl = fpClampLevel(lvl + 1);
    }
    if (lvl >= FP_MAX_LEVEL) xp = 0;
    xpNext = { ...xpNext, xp, level: lvl };
    setState(xpNext);
    return { success: true, rewardCoins, rewardXP, state: xpNext };
  }, [state]);

  // ---- Daily Streak ----

  const fpGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const fpGetLastDaily = useCallback((): string | null => {
    return state.lastDaily;
  }, [state.lastDaily]);

  const fpCheckInDaily = useCallback((now: number = Date.now()): { streak: number; isStreakContinued: boolean; state: FPSteampunkFactoryState } => {
    const today = fpGenerateDayKey(now);
    if (state.lastDaily === today) return { streak: state.dailyStreak, isStreakContinued: false, state };
    const last = state.lastDaily ? new Date(state.lastDaily) : null;
    const tod = new Date(today);
    let isContinued = true;
    if (last) {
      const diff = (tod.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 1) isContinued = false;
    }
    const newStreak = isContinued ? state.dailyStreak + 1 : 1;
    const repGain = 10 + newStreak * 2;
    const next = {
      ...state,
      dailyStreak: newStreak,
      lastDaily: today,
      reputation: state.reputation + repGain,
    };
    // Recalculate reputation title
    const thresholds = [0, 100, 300, 600, 1000, 2000];
    let title = next.reputationTitle;
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (next.reputation >= thresholds[i]) { title = FP_REPUTATION_TITLES[i]; break; }
    }
    next.reputationTitle = title;
    setState(next);
    return { streak: newStreak, isStreakContinued: isContinued, state: next };
  }, [state]);

  // ---- NPCs ----

  const fpGetNPCs = useCallback((): FPNPCDef[] => {
    return [...FP_NPCS];
  }, []);

  const fpGetNPCById = useCallback((id: string): FPNPCDef | null => {
    return FP_NPCS.find((n) => n.id === id) ?? null;
  }, []);

  // ---- Rarity Info ----

  const fpGetRarityInfo = useCallback((rarity: FPRarity): FPRarityInfo | null => {
    return FP_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const fpGetAllRarities = useCallback((): FPRarityInfo[] => {
    return [...FP_RARITIES];
  }, []);

  // ---- Stats ----

  const fpGetStats = useCallback(() => {
    return {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      reputation: state.reputation,
      reputationTitle: state.reputationTitle,
      completedProductions: state.completedProductions,
      completedInventions: state.completedInventions,
      soldInventions: state.soldInventions,
      totalEarned: state.totalEarned,
      totalSpent: state.totalSpent,
      dailyStreak: state.dailyStreak,
      activeMachines: state.machines.filter((m) => m.active).length,
      unlockedFloors: state.floors.filter((f) => f.unlocked).length,
      hiredWorkers: state.workers.filter((w) => w.hired).length,
      ownedPatents: state.patents.filter((p) => p.owned).length,
      completedQuests: state.completedQuests.length,
      unlockedAchievements: state.unlockedAchievements.filter((a) => a.unlocked).length,
    };
  }, [state]);

  const fpGetCompletedProductions = useCallback((): number => {
    return state.completedProductions;
  }, [state.completedProductions]);

  const fpGetCompletedInventions = useCallback((): number => {
    return state.completedInventions;
  }, [state.completedInventions]);

  const fpGetSoldInventions = useCallback((): number => {
    return state.soldInventions;
  }, [state.soldInventions]);

  const fpGetTotalEarned = useCallback((): number => {
    return state.totalEarned;
  }, [state.totalEarned]);

  const fpGetTotalSpent = useCallback((): number => {
    return state.totalSpent;
  }, [state.totalSpent]);

  const fpGetProfit = useCallback((): number => {
    return state.totalEarned - state.totalSpent;
  }, [state.totalEarned, state.totalSpent]);

  // ---- Helper / Utility ----

  const fpGetMachinesByRarity = useCallback((rarity: FPRarity): FPMachineDef[] => {
    return FP_MACHINES.filter((m) => m.rarity === rarity);
  }, []);

  const fpGetInventionsForMachine = useCallback((machineId: string): FPInventionDef[] => {
    return FP_INVENTIONS.filter((i) => i.requiredMachineId === machineId);
  }, []);

  const fpGetProductionChain = useCallback((inventionId: string): { materialId: string; name: string; amount: number; machineId: string | null }[] => {
    const inv = FP_INVENTIONS.find((i) => i.id === inventionId);
    if (!inv) return [];
    const chain: { materialId: string; name: string; amount: number; machineId: string | null }[] = [];
    for (const req of inv.requiredMaterials) {
      const producer = FP_MACHINES.find((m) => m.outputMaterialId === req.materialId);
      chain.push({ materialId: req.materialId, name: FP_MATERIALS.find((m) => m.id === req.materialId)?.name ?? req.materialId, amount: req.amount, machineId: producer?.id ?? null });
    }
    return chain;
  }, []);

  const fpGetInventoryValue = useCallback((): number => {
    let total = 0;
    for (const [id, count] of Object.entries(state.materials)) {
      const def = FP_MATERIALS.find((m) => m.id === id);
      if (def) total += def.cost * count;
    }
    return total;
  }, [state.materials]);

  const fpGetNetWorth = useCallback((): number => {
    return state.coins + fpGetInventoryValue();
  }, [state.coins, fpGetInventoryValue]);

  const fpSimulateProduction = useCallback((machineId: string): { machine: FPMachineDef | null; canProduce: boolean; estimatedTime: number; estimatedOutput: number; estimatedQuality: number; missingMaterials: { materialId: string; name: string; have: number; need: number }[] } => {
    const def = FP_MACHINES.find((m) => m.id === machineId);
    if (!def) return { machine: null, canProduce: false, estimatedTime: 0, estimatedOutput: 0, estimatedQuality: 0, missingMaterials: [] };
    const ms = state.machines.find((m) => m.id === machineId);
    if (!ms || !ms.active) return { machine: def, canProduce: false, estimatedTime: 0, estimatedOutput: 0, estimatedQuality: 0, missingMaterials: [] };
    const missing = fpGetMissingMaterials(def.inputMaterials);
    if (missing.length > 0) return { machine: def, canProduce: false, estimatedTime: 0, estimatedOutput: 0, estimatedQuality: 0, missingMaterials: missing };
    const speedBonus = fpGetMachineBonus(machineId);
    const estTime = Math.max(5, Math.floor(def.baseProductionTime * (1 - speedBonus / 100)));
    const baseQuality = 50 + ms.level * 5 + 10;
    const floor = state.floors.find((f) => f.id === def.floorId);
    const floorBonus = floor ? (floor.level - 1) * 2 : 0;
    const estQuality = Math.min(100, baseQuality + floorBonus);
    const qualityMult = 1 + estQuality / 200;
    const estOutput = Math.ceil(def.outputAmount * qualityMult);
    return { machine: def, canProduce: true, estimatedTime: estTime, estimatedOutput: estOutput, estimatedQuality: estQuality, missingMaterials: [] };
  }, [state, fpGetMissingMaterials, fpGetMachineBonus]);

  const fpSimulateInvention = useCallback((inventionId: string): { invention: FPInventionDef | null; canCraft: boolean; hasBlueprint: boolean; estimatedXP: number; sellPrice: number; missingMaterials: { materialId: string; name: string; have: number; need: number }[] } => {
    const def = FP_INVENTIONS.find((i) => i.id === inventionId);
    if (!def) return { invention: null, canCraft: false, hasBlueprint: false, estimatedXP: 0, sellPrice: 0, missingMaterials: [] };
    const hasBP = fpHasBlueprint(inventionId);
    if (!hasBP) return { invention: def, canCraft: false, hasBlueprint: false, estimatedXP: 0, sellPrice: def.sellPrice, missingMaterials: [] };
    if (state.level < def.requiredLevel) return { invention: def, canCraft: false, hasBlueprint: true, estimatedXP: 0, sellPrice: def.sellPrice, missingMaterials: [] };
    const missing = fpGetMissingMaterials(def.requiredMaterials);
    if (missing.length > 0) return { invention: def, canCraft: false, hasBlueprint: true, estimatedXP: 0, sellPrice: def.sellPrice, missingMaterials: missing };
    const estXP = Math.floor(def.xpReward * fpRarityMultiplier(def.rarity));
    return { invention: def, canCraft: true, hasBlueprint: true, estimatedXP: estXP, sellPrice: def.sellPrice, missingMaterials: [] };
  }, [state, fpHasBlueprint, fpGetMissingMaterials]);

  const fpGetFactorySummary = useCallback((): {
    title: string;
    level: number;
    floors: { id: string; name: string; machineCount: number; workerCount: number }[];
    totalMachines: number;
    totalWorkers: number;
    netWorth: number;
    inventionCount: number;
  } => {
    return {
      title: fpGetTitle().name,
      level: state.level,
      floors: state.floors.filter((f) => f.unlocked).map((f) => ({
        id: f.id,
        name: FP_FLOORS.find((fd) => fd.id === f.id)?.name ?? f.id,
        machineCount: state.machines.filter((m) => m.builtOnFloor === f.id && m.active).length,
        workerCount: state.workers.filter((w) => w.hired && w.assignedFloor === f.id).length,
      })),
      totalMachines: state.machines.filter((m) => m.active).length,
      totalWorkers: state.workers.filter((w) => w.hired).length,
      netWorth: fpGetNetWorth(),
      inventionCount: state.completedInventions,
    };
  }, [state, fpGetTitle, fpGetNetWorth]);

  const fpGetFactoryTips = useCallback((): string[] => {
    const tips: string[] = [];
    if (state.level < 5) tips.push('Start by producing basic materials in the Boiler Room to build up your stockpile.');
    if (state.machines.filter((m) => m.active).length < 3) tips.push('Build more machines to increase your production capacity across the factory.');
    if (state.workers.filter((w) => w.hired).length === 0) tips.push('Hire workers to boost production output on your floors.');
    if (state.patents.filter((p) => p.owned).length === 0) tips.push('Research patents to gain permanent bonuses for your entire factory.');
    if (state.floors.filter((f) => f.unlocked).length < 3) tips.push('Unlock new floors to access more powerful machines and rare materials.');
    if (state.blueprints.filter((b) => b.purchased).length <= 4) tips.push('Purchase blueprints for uncommon inventions to increase your earning potential.');
    if (state.dailyStreak === 0) tips.push('Check in daily to build your streak and earn bonus reputation!');
    if (state.activeQuests.length === 0) tips.push('Accept quests for bonus coin and XP rewards.');
    if (state.totalEarned > 1000 && state.machines.filter((m) => m.active && m.level < 5).length > 0) tips.push('Upgrade your machines for better speed, quality, and output bonuses.');
    if (state.level >= 22) tips.push('The Aether Laboratory unlocks epic-tier machines — invest early for a huge advantage.');
    if (tips.length === 0) tips.push('Keep expanding your factory and pushing the boundaries of steampunk engineering!');
    return tips;
  }, [state]);

  const fpGetMostProfitableInvention = useCallback((): FPInventionDef | null => {
    const available = FP_INVENTIONS.filter((i) => fpHasBlueprint(i.id) && state.level >= i.requiredLevel);
    if (available.length === 0) return null;
    return available.reduce((best, current) => current.sellPrice > best.sellPrice ? current : best, available[0]);
  }, [state.level, fpHasBlueprint]);

  const fpGetRecommendedUpgrades = useCallback((): { type: 'machine' | 'floor' | 'patent' | 'worker' | 'blueprint'; id: string; name: string; cost: number; benefit: string }[] => {
    const recommendations: { type: 'machine' | 'floor' | 'patent' | 'worker' | 'blueprint'; id: string; name: string; cost: number; benefit: string }[] = [];
    // Recommend upgrading low-level active machines
    for (const ms of state.machines.filter((m) => m.active && m.level < 5)) {
      const def = FP_MACHINES.find((d) => d.id === ms.id);
      if (def) {
        const cost = Math.floor(def.baseCost * (0.5 + ms.level * 0.4));
        if (cost <= state.coins) {
          recommendations.push({ type: 'machine', id: ms.id, name: def.name, cost, benefit: `+${Math.ceil(def.baseBonusValue * 0.3)} ${def.bonusType} bonus` });
        }
      }
    }
    // Recommend affordable patents
    for (const ps of state.patents.filter((p) => !p.owned)) {
      const def = FP_PATENTS.find((d) => d.id === ps.id);
      if (def && state.level >= def.requiredLevel && def.cost <= state.coins) {
        recommendations.push({ type: 'patent', id: ps.id, name: def.name, cost: def.cost, benefit: def.bonusDescription });
      }
    }
    // Recommend hiring available workers
    for (const ws of state.workers.filter((w) => !w.hired)) {
      const def = FP_WORKERS.find((d) => d.id === ws.id);
      if (def && state.level >= def.requiredLevel && def.hireCost <= state.coins) {
        recommendations.push({ type: 'worker', id: ws.id, name: def.name, cost: def.hireCost, benefit: `+${Math.round((def.bonusMultiplier - 1) * 100)}% floor production` });
      }
    }
    // Sort by cost ascending
    recommendations.sort((a, b) => a.cost - b.cost);
    return recommendations.slice(0, 5);
  }, [state]);

  // ============================================================
  // Return
  // ============================================================

  return {
    // Core
    fpGetState,
    fpResetState,
    fpSeed,
    fpRandom,
    fpRandomInt,
    fpRandomChoice,
    // Level / XP
    fpGetLevel,
    fpGetXP,
    fpGetXPTillNext,
    fpGetXPTotal,
    fpAddXP,
    fpGetTitle,
    fpGetAllTitles,
    fpGetNextTitle,
    fpGetProgress,
    fpGetOverallProgress,
    // Coins
    fpGetCoins,
    fpAddCoins,
    fpSpendCoins,
    fpCanAfford,
    // Machines
    fpGetMachines,
    fpGetMachineById,
    fpGetMachineStates,
    fpGetBuiltMachines,
    fpGetMachinesByFloor,
    fpGetMachinesByRarity,
    fpGetMachineLevel,
    fpGetMachineBonus,
    fpBuildMachine,
    fpUpgradeMachine,
    fpDismantleMachine,
    // Floors
    fpGetFloors,
    fpGetFloorStates,
    fpGetUnlockedFloors,
    fpGetFloorById,
    fpGetActiveFloor,
    fpSetActiveFloor,
    fpUnlockFloor,
    fpUpgradeFloor,
    // Materials
    fpGetMaterials,
    fpGetMaterialById,
    fpGetInventory,
    fpGetMaterialCount,
    fpGetMaterialCost,
    fpBuyMaterial,
    fpUseMaterial,
    fpHasMaterials,
    fpGetMissingMaterials,
    fpGetMaterialsByRarity,
    fpGetMaterialsByCategory,
    // Production
    fpStartProduction,
    fpGetProductionQueue,
    fpIsProducing,
    fpCollectProduction,
    fpCancelProduction,
    fpGetProductionTimeRemaining,
    // Inventions
    fpGetInventions,
    fpGetInventionById,
    fpGetBlueprints,
    fpHasBlueprint,
    fpPurchaseBlueprint,
    fpCraftInvention,
    fpSellInvention,
    fpGetInventionsByRarity,
    fpGetCraftableInventions,
    fpGetAffordableInventions,
    fpGetInventionsForMachine,
    fpGetProductionChain,
    // Workers
    fpGetWorkers,
    fpGetWorkerById,
    fpGetWorkerStates,
    fpGetHiredWorkers,
    fpHireWorker,
    fpAssignWorker,
    fpUnassignWorker,
    fpDismissWorker,
    fpGetWorkersByFloor,
    fpGetFloorBonus,
    // Patents
    fpGetPatents,
    fpGetPatentStates,
    fpGetOwnedPatents,
    fpResearchPatent,
    fpGetPatentBonus,
    // Reputation
    fpGetReputation,
    fpGetReputationTitle,
    fpGetReputationRank,
    fpGetNextReputationTitle,
    fpGetReputationProgress,
    fpAddReputation,
    // Quests
    fpGetQuests,
    fpGetActiveQuests,
    fpGetAvailableQuests,
    fpGetCompletedQuests,
    fpAcceptQuest,
    fpGetQuestProgress,
    fpUpdateQuestProgress,
    fpCompleteQuest,
    fpAbandonQuest,
    // Achievements
    fpGetAchievements,
    fpGetUnlockedAchievements,
    fpIsAchievementUnlocked,
    fpCheckAchievements,
    // Daily Tasks
    fpGetDailyTask,
    fpRefreshDailyTask,
    fpUpdateDailyProgress,
    fpClaimDailyReward,
    // Daily Quota
    fpGetDailyQuota,
    fpRefreshDailyQuota,
    fpUpdateQuotaProgress,
    fpClaimQuotaReward,
    // Daily Streak
    fpGetDailyStreak,
    fpGetLastDaily,
    fpCheckInDaily,
    // NPCs
    fpGetNPCs,
    fpGetNPCById,
    // Rarity
    fpGetRarityInfo,
    fpGetAllRarities,
    // Stats
    fpGetStats,
    fpGetCompletedProductions,
    fpGetCompletedInventions,
    fpGetSoldInventions,
    fpGetTotalEarned,
    fpGetTotalSpent,
    fpGetProfit,
    // Utility
    fpGetInventoryValue,
    fpGetNetWorth,
    fpSimulateProduction,
    fpSimulateInvention,
    fpGetFactorySummary,
    fpGetFactoryTips,
    fpGetMostProfitableInvention,
    fpGetRecommendedUpgrades,
    // Constants re-exported
    FP_MAX_LEVEL,
    FP_RARITIES,
    FP_TITLE_THRESHOLDS,
    FP_REPUTATION_TITLES,
    FP_MATERIALS,
    FP_FLOORS,
    FP_MACHINES,
    FP_INVENTIONS,
    FP_WORKERS,
    FP_PATENTS,
    FP_QUESTS,
    FP_NPCS,
    FP_ACHIEVEMENTS,
    FP_DAILY_TASK_POOL,
  };
}
