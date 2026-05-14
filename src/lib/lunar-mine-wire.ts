'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/* ================================================================
   TYPES
   ================================================================ */

type LmRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type LmMineAction = 'drill' | 'excavate' | 'blast' | 'scan' | 'refine'
type LmEventType = 'meteor_shower' | 'solar_flare' | 'moonquake' | 'helium_surge' | 'alien_signal' | 'dust_storm'
type LmRoverStatus = 'idle' | 'deployed' | 'returning' | 'damaged'
type LmMineralCategory = 'regolith' | 'crystal' | 'ore' | 'isotope' | 'anomaly'
type LmBuildingCategory = 'habitat' | 'energy' | 'mining' | 'research' | 'storage' | 'defense' | 'communication' | 'life_support'
type LmGravityZone = 'micro_g' | 'low_g' | 'medium_g' | 'standard_g'

interface LmRarityInfo {
  id: LmRarityTier
  name: string
  emoji: string
  color: string
  glow: string
  xpMultiplier: number
  spawnWeight: number
  coinMultiplier: number
}

interface LmMineral {
  id: string
  name: string
  category: LmMineralCategory
  rarity: LmRarityTier
  color: string
  glowIntensity: number
  xpReward: number
  sellPrice: number
  description: string
  processUses: string[]
  foundAt: string[]
  emoji: string
}

interface LmSector {
  id: string
  name: string
  description: string
  requiredLevel: number
  dangerLevel: number
  ambientColor: string
  unlockCost: number
  mineralIds: string[]
  gravityZone: LmGravityZone
  depthKm: number
  dailyCapacity: number
  backgroundEmoji: string
}

interface LmMiningTool {
  id: string
  name: string
  type: string
  rarity: LmRarityTier
  power: number
  level: number
  maxLevel: number
  upgradeCost: number
  description: string
  miningBonus: number
  efficiencyBonus: number
  color: string
  emoji: string
}

interface LmColonyBuilding {
  id: string
  name: string
  category: LmBuildingCategory
  rarity: LmRarityTier
  level: number
  maxLevel: number
  buildCost: number
  upgradeCost: number
  description: string
  productionBonus: number
  storageBonus: number
  color: string
  emoji: string
}

interface LmEngineeringAbility {
  id: string
  name: string
  description: string
  cooldown: number
  duration: number
  effect: string
  effectValue: number
  requiredLevel: number
  energyCost: number
  color: string
  emoji: string
}

interface LmAchievement {
  id: string
  name: string
  description: string
  condition: string
  reward: { type: string; value: number }
  icon: string
  color: string
  emoji: string
}

interface LmEvent {
  id: string
  name: string
  type: LmEventType
  description: string
  duration: number
  effect: string
  effectValue: number
  color: string
  emoji: string
}

interface LmTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  bonusXpPercent: number
  bonusCoinPercent: number
  color: string
  emoji: string
}

interface LmLunarRover {
  id: string
  name: string
  status: LmRoverStatus
  fuel: number
  maxFuel: number
  cargo: { mineralId: string; count: number }[]
  maxCargo: number
  deployedSectorId: string | null
  returnTime: number | null
  speed: number
  durability: number
  color: string
  emoji: string
}

interface LmMineralRecord {
  mineralId: string
  count: number
  totalMined: number
}

interface LmToolRecord {
  toolId: string
  level: number
  equipped: boolean
}

interface LmBuildingRecord {
  buildingId: string
  level: number
  built: boolean
}

interface LmAchievementRecord {
  achievementId: string
  unlockedAt: number
}

interface LmActiveEvent {
  eventId: string
  startTime: number
  endTime: number
}

interface LmDailyQuest {
  id: string
  name: string
  description: string
  target: number
  progress: number
  reward: { coins: number; xp: number }
  expiresAt: number
  completed: boolean
  claimed: boolean
  emoji: string
}

interface LmColonyStats {
  population: number
  morale: number
  energy: number
  maxEnergy: number
  oxygen: number
  maxOxygen: number
  storage: number
  maxStorage: number
}

interface LmGameState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  inventory: LmMineralRecord[]
  tools: LmToolRecord[]
  buildings: LmBuildingRecord[]
  achievements: LmAchievementRecord[]
  currentSectorId: string | null
  currentTitleId: string
  activeEvents: LmActiveEvent[]
  rovers: LmLunarRover[]
  dailyQuest: LmDailyQuest | null
  dailyStreak: number
  lastDailyDate: string
  lastSaveTime: number
  totalMineralsMined: number
  totalRareMined: number
  totalLegendaryMined: number
  totalRefined: number
  totalRoversDeployed: number
  totalBuildingsConstructed: number
  totalMeteorShields: number
  totalCoinsSpent: number
  deepestSectorReached: number
  playTimeMinutes: number
  sessionStartTime: number
  miningActionsCount: number
  currentAction: LmMineAction
  actionPower: number
  colonyStats: LmColonyStats
  engineeringCooldowns: Record<string, number>
  processingSlots: { mineralId: string | null; startedAt: number | null; finishTime: number | null }[]
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const LM_SAVE_KEY = 'lunar-mine-save'
const LM_STORAGE_KEY = 'lunar-mine-state'
const LM_MAX_LEVEL = 50
const LM_AUTO_SAVE_INTERVAL = 30000
const LM_DAILY_STREAK_WINDOW = 86400000
const LM_TOOL_MAX_LEVEL = 10
const LM_BUILDING_MAX_LEVEL = 5
const LM_ROVER_MAX_FUEL = 100
const LM_ROVER_MAX_CARGO = 20
const LM_ROVER_DEPLOY_TIME = 120000
const LM_PROCESSING_SLOTS = 3
const LM_PROCESSING_BASE_TIME = 45000
const LM_EVENT_BASE_DURATION = 3600000
const LM_ACTION_COOLDOWN = 400
const LM_MAX_INVENTORY_ITEM = 999
const LM_ACHIEVEMENT_CHECK_INTERVAL = 5000
const LM_EVENT_SPAWN_INTERVAL = 180000
const LM_INITIAL_COINS = 150
const LM_INITIAL_ENERGY = 50
const LM_INITIAL_OXYGEN = 80
const LM_INITIAL_POPULATION = 5
const LM_MAX_ENERGY = 500
const LM_MAX_OXYGEN = 300
const LM_MAX_POPULATION = 100
const LM_MAX_STORAGE = 5000
const LM_ENERGY_REGEN_RATE = 2
const LM_OXYGEN_REGEN_RATE = 1

const LM_THEME_COLORS = {
  lunarSilver: '#C0C0C0',
  regolithGray: '#8B8682',
  craterDark: '#2C2C34',
  moonGlow: '#E8E4D8',
  starBlue: '#4A90D9',
  heliumGold: '#DAA520',
  neonGreen: '#39FF14',
  solarOrange: '#FF6B35',
  cosmicPurple: '#6B3FA0',
  voidBlack: '#0D0D1A',
  background: '#0D0D1A',
  surface: '#1A1A2E',
  textPrimary: '#E8E4D8',
  textSecondary: '#A09B8C',
  accent: '#DAA520',
  danger: '#FF4757',
  success: '#39FF14',
  warning: '#FF6B35',
}

const LM_GRAVITY_MULTIPLIERS: Record<LmGravityZone, number> = {
  micro_g: 0.4,
  low_g: 0.6,
  medium_g: 0.8,
  standard_g: 1.0,
}

const LM_RARITY: Record<LmRarityTier, LmRarityInfo> = {
  common: {
    id: 'common',
    name: 'Common',
    emoji: '🪨',
    color: '#A0A0A0',
    glow: '#808080',
    xpMultiplier: 1,
    spawnWeight: 45,
    coinMultiplier: 1,
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    emoji: '💎',
    color: '#50C878',
    glow: '#3DA85E',
    xpMultiplier: 1.5,
    spawnWeight: 28,
    coinMultiplier: 2,
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    emoji: '✨',
    color: '#4A90D9',
    glow: '#2E6EB0',
    xpMultiplier: 2.5,
    spawnWeight: 16,
    coinMultiplier: 4,
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    emoji: '🔥',
    color: '#E0115F',
    glow: '#B80D4E',
    xpMultiplier: 4,
    spawnWeight: 8,
    coinMultiplier: 8,
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    emoji: '🌟',
    color: '#DAA520',
    glow: '#B8860B',
    xpMultiplier: 7,
    spawnWeight: 3,
    coinMultiplier: 15,
  },
}

const LM_RARITY_ORDER: readonly LmRarityTier[] = [
  'common', 'uncommon', 'rare', 'epic', 'legendary',
]

const LM_XP_TABLE: number[] = Array.from({ length: LM_MAX_LEVEL + 1 }, (_, i) =>
  i === 0 ? 0 : Math.floor(85 * Math.pow(i, 1.35) + i * 30),
)

const LM_ACTION_POWER_BASE: Record<LmMineAction, number> = {
  drill: 12,
  excavate: 22,
  blast: 55,
  scan: 8,
  refine: 15,
}

const LM_ACTION_COIN_COST: Record<LmMineAction, number> = {
  drill: 0,
  excavate: 8,
  blast: 30,
  scan: 3,
  refine: 12,
}

const LM_ACTION_XP_REWARD: Record<LmMineAction, number> = {
  drill: 6,
  excavate: 14,
  blast: 32,
  scan: 4,
  refine: 18,
}

const LM_ACTION_ENERGY_COST: Record<LmMineAction, number> = {
  drill: 3,
  excavate: 6,
  blast: 15,
  scan: 2,
  refine: 5,
}

/* ================================================================
   TITLES (8): Moon Cadet → Lunar Overlord
   ================================================================ */

const LM_TITLES: LmTitle[] = [
  { id: 'moon-cadet', name: 'Moon Cadet', requiredLevel: 1, description: 'A fresh recruit arriving at the lunar colony.', bonusXpPercent: 0, bonusCoinPercent: 0, color: '#A0A0A0', emoji: '🌙' },
  { id: 'regolith-worker', name: 'Regolith Worker', requiredLevel: 5, description: 'Skilled at sifting through moon dust for resources.', bonusXpPercent: 5, bonusCoinPercent: 3, color: '#8B8682', emoji: '⛏️' },
  { id: 'crater-prospector', name: 'Crater Prospector', requiredLevel: 12, description: 'Can identify mineral veins from crater rim surveys.', bonusXpPercent: 10, bonusCoinPercent: 7, color: '#50C878', emoji: '🔭' },
  { id: 'orbital-engineer', name: 'Orbital Engineer', requiredLevel: 20, description: 'Expert at constructing orbital infrastructure.', bonusXpPercent: 16, bonusCoinPercent: 12, color: '#4A90D9', emoji: '🔧' },
  { id: 'helium-baron', name: 'Helium Baron', requiredLevel: 28, description: 'Controls the most lucrative helium-3 extraction operations.', bonusXpPercent: 22, bonusCoinPercent: 18, color: '#DAA520', emoji: '⚡' },
  { id: 'colony-commander', name: 'Colony Commander', requiredLevel: 36, description: 'Leads the entire lunar colony with strategic brilliance.', bonusXpPercent: 30, bonusCoinPercent: 25, color: '#E0115F', emoji: '🚀' },
  { id: 'moon-sovereign', name: 'Moon Sovereign', requiredLevel: 44, description: 'Rules over vast lunar territories and resources.', bonusXpPercent: 40, bonusCoinPercent: 35, color: '#6B3FA0', emoji: '👑' },
  { id: 'lunar-overlord', name: 'Lunar Overlord', requiredLevel: 50, description: 'Supreme ruler of all lunar mining operations.', bonusXpPercent: 50, bonusCoinPercent: 45, color: '#FFD700', emoji: '🌕' },
]

/* ================================================================
   MINERALS / CRYSTALS (35 types, 5 rarity tiers)
   ================================================================ */

const LM_MINERALS: LmMineral[] = [
  // ── Common (8) ──
  { id: 'regolith-chunk', name: 'Regolith Chunk', category: 'regolith', rarity: 'common', color: '#8B8682', glowIntensity: 0.05, xpReward: 6, sellPrice: 2, description: 'Basic lunar soil rich in silicon and iron oxide.', processUses: ['glass-powder', 'ceramic-mold'], foundAt: ['sea-of-tranquility-shaft', 'copernicus-pit'], emoji: '🪨' },
  { id: 'basalt-shard', name: 'Basalt Shard', category: 'regolith', rarity: 'common', color: '#4A4A4A', glowIntensity: 0, xpReward: 5, sellPrice: 2, description: 'Dark volcanic rock common across the lunar maria.', processUses: ['construction-block', 'insulation-panel'], foundAt: ['sea-of-tranquility-shaft', 'copernicus-pit'], emoji: '🖤' },
  { id: 'iron-dust', name: 'Iron Dust', category: 'ore', rarity: 'common', color: '#71797E', glowIntensity: 0, xpReward: 7, sellPrice: 4, description: 'Fine metallic iron particles scattered in the regolith.', processUses: ['steel-alloy', 'reinforced-beam'], foundAt: ['sea-of-tranquility-shaft', 'kepler-tunnel', 'mare-imbrium-quarry'], emoji: '⚙️' },
  { id: 'silicon-grain', name: 'Silicon Grain', category: 'ore', rarity: 'common', color: '#4A90D9', glowIntensity: 0.05, xpReward: 8, sellPrice: 3, description: 'Purified silicon extracted from lunar sand.', processUses: ['solar-cell', 'circuit-board'], foundAt: ['sea-of-tranquility-shaft', 'tycho-deep-mine'], emoji: '📱' },
  { id: 'anorthosite', name: 'Anorthosite', category: 'regolith', rarity: 'common', color: '#E8E4D8', glowIntensity: 0.08, xpReward: 7, sellPrice: 3, description: 'Light-colored plagioclase feldspar found in highland crust.', processUses: ['white-ceramic', 'light-reflector'], foundAt: ['copernicus-pit', 'tycho-deep-mine'], emoji: '🤍' },
  { id: 'titanium-oxide', name: 'Titanium Oxide', category: 'ore', rarity: 'common', color: '#878681', glowIntensity: 0, xpReward: 9, sellPrice: 5, description: 'Ilmenite mineral containing valuable titanium.', processUses: ['titanium-ingot', 'heat-shield'], foundAt: ['sea-of-tranquility-shaft', 'mare-imbrium-quarry'], emoji: '🔩' },
  { id: 'calcium-deposit', name: 'Calcium Deposit', category: 'ore', rarity: 'common', color: '#F5DEB3', glowIntensity: 0, xpReward: 5, sellPrice: 2, description: 'Plagioclase-derived calcium for construction.', processUses: ['cement-mix', 'bone-fortifier'], foundAt: ['copernicus-pit', 'kepler-tunnel'], emoji: '🦴' },
  { id: 'lunar-glass', name: 'Lunar Glass', category: 'regolith', rarity: 'common', color: '#B0C4DE', glowIntensity: 0.1, xpReward: 8, sellPrice: 4, description: 'Naturally formed glass beads from meteorite impacts.', processUses: ['fiber-optic', 'dome-panel'], foundAt: ['tycho-deep-mine', 'aristarchus-vein'], emoji: '🔮' },

  // ── Uncommon (8) ──
  { id: 'kREEP-mineral', name: 'KREEP Mineral', category: 'anomaly', rarity: 'uncommon', color: '#50C878', glowIntensity: 0.25, xpReward: 20, sellPrice: 12, description: 'Potassium, Rare Earth Elements, and Phosphorus composite.', processUses: ['fertilizer-boost', 'rare-earth-extract'], foundAt: ['copernicus-pit', 'tycho-deep-mine', 'far-side-deposit'], emoji: '🌿' },
  { id: 'helium-3-pocket', name: 'Helium-3 Pocket', category: 'isotope', rarity: 'uncommon', color: '#DAA520', glowIntensity: 0.35, xpReward: 28, sellPrice: 18, description: 'Trapped solar wind helium-3 — fusion fuel of the future.', processUses: ['fusion-cell', 'energy-core'], foundAt: ['sea-of-tranquility-shaft', 'mare-imbrium-quarry', 'kepler-tunnel'], emoji: '⚡' },
  { id: 'olivine-crystal', name: 'Olivine Crystal', category: 'crystal', rarity: 'uncommon', color: '#9ACD32', glowIntensity: 0.3, xpReward: 22, sellPrice: 14, description: 'Green magnesium-iron silicate crystal from deep magma.', processUses: ['peridot-gem', 'heat-insulator'], foundAt: ['tycho-deep-mine', 'aristarchus-vein'], emoji: '💚' },
  { id: 'pyroxene-shard', name: 'Pyroxene Shard', category: 'crystal', rarity: 'uncommon', color: '#2E8B57', glowIntensity: 0.2, xpReward: 18, sellPrice: 10, description: 'Dark green clinopyroxene from lunar basalt flows.', processUses: ['ceramic-glaze', 'radiation-shield'], foundAt: ['copernicus-pit', 'mare-imbrium-quarry'], emoji: '🌲' },
  { id: 'spinel-gem', name: 'Spinel Gem', category: 'crystal', rarity: 'uncommon', color: '#DC143C', glowIntensity: 0.35, xpReward: 25, sellPrice: 16, description: 'Red spinel formed under extreme impact pressure.', processUses: ['laser-lens', 'armor-plating'], foundAt: ['aristarchus-vein', 'far-side-deposit'], emoji: '❤️' },
  { id: 'aluminum-nugget', name: 'Aluminum Nugget', category: 'ore', rarity: 'uncommon', color: '#C0C0C0', glowIntensity: 0.1, xpReward: 19, sellPrice: 11, description: 'Pure aluminum extracted from lunar anorthosite.', processUses: ['alloy-frame', 'mirror-array'], foundAt: ['sea-of-tranquility-shaft', 'kepler-tunnel'], emoji: '🪙' },
  { id: 'magnesium-ingot', name: 'Magnesium Ingot', category: 'ore', rarity: 'uncommon', color: '#E0E0E0', glowIntensity: 0.05, xpReward: 16, sellPrice: 9, description: 'Lightweight magnesium for colony construction.', processUses: ['lightweight-alloy', 'flare-charge'], foundAt: ['tycho-deep-mine', 'mare-imbrium-quarry'], emoji: '🔷' },
  { id: 'chrome-vein', name: 'Chrome Vein', category: 'ore', rarity: 'uncommon', color: '#B0B0B0', glowIntensity: 0.15, xpReward: 21, sellPrice: 13, description: 'Chromium deposits for corrosion-resistant alloys.', processUses: ['stainless-steel', 'solar-mirror'], foundAt: ['kepler-tunnel', 'aristarchus-vein'], emoji: '🔲' },

  // ── Rare (8) ──
  { id: 'armalcolite', name: 'Armalcolite', category: 'anomaly', rarity: 'rare', color: '#4A4A6A', glowIntensity: 0.45, xpReward: 48, sellPrice: 38, description: 'Titanium-iron-magnesium oxide found only on the Moon.', processUses: ['super-alloy', 'thermal-coating'], foundAt: ['tycho-deep-mine', 'the-core'], emoji: '🌌' },
  { id: 'tranquillityite', name: 'Tranquillityite', category: 'anomaly', rarity: 'rare', color: '#8B0000', glowIntensity: 0.5, xpReward: 52, sellPrice: 42, description: 'Extremely rare mineral first discovered in Apollo 11 samples.', processUses: ['quantum-chip', 'antimatter-battery'], foundAt: ['sea-of-tranquility-shaft', 'the-core'], emoji: '🔴' },
  { id: 'pyroxferroite', name: 'Pyroxferroite', category: 'anomaly', rarity: 'rare', color: '#8B4513', glowIntensity: 0.4, xpReward: 45, sellPrice: 35, description: 'Iron-rich pyroxenoid unique to lunar geology.', processUses: ['magnetic-core', 'railgun-coil'], foundAt: ['mare-imbrium-quarry', 'far-side-deposit'], emoji: '🟤' },
  { id: 'zircon-crystal', name: 'Zircon Crystal', category: 'crystal', rarity: 'rare', color: '#CD853F', glowIntensity: 0.5, xpReward: 50, sellPrice: 40, description: 'Ancient zircon containing primordial lunar history.', processUses: ['dating-scanner', 'power-crystal'], foundAt: ['aristarchus-vein', 'far-side-deposit'], emoji: '🟡' },
  { id: 'cosmic-glass', name: 'Cosmic Glass', category: 'crystal', rarity: 'rare', color: '#87CEEB', glowIntensity: 0.55, xpReward: 46, sellPrice: 36, description: 'Glass formed by cosmic ray bombardment over eons.', processUses: ['radiation-filter', 'star-map-lens'], foundAt: ['far-side-deposit', 'the-core'], emoji: '🫧' },
  { id: 'uranium-shard', name: 'Uranium Shard', category: 'isotope', rarity: 'rare', color: '#32CD32', glowIntensity: 0.6, xpReward: 55, sellPrice: 45, description: 'Radioactive uranium deposits for nuclear power.', processUses: ['reactor-fuel', 'depleted-armor'], foundAt: ['kepler-tunnel', 'the-core'], emoji: '☢️' },
  { id: 'thorium-ore', name: 'Thorium Ore', category: 'isotope', rarity: 'rare', color: '#FF6347', glowIntensity: 0.45, xpReward: 42, sellPrice: 32, description: 'Thorium for safe, clean molten-salt reactors.', processUses: ['salt-reactor', 'radiation-lens'], foundAt: ['tycho-deep-mine', 'aristarchus-vein'], emoji: '🧲' },
  { id: 'moissanite', name: 'Moissanite', category: 'crystal', rarity: 'rare', color: '#E0FFFF', glowIntensity: 0.6, xpReward: 58, sellPrice: 48, description: 'Silicon carbide crystal harder than diamond.', processUses: ['industrial-drill', 'quantum-lens'], foundAt: ['far-side-deposit', 'the-core'], emoji: '💠' },

  // ── Epic (6) ──
  { id: 'lunar-diamond', name: 'Lunar Diamond', category: 'crystal', rarity: 'epic', color: '#B9F2FF', glowIntensity: 0.75, xpReward: 95, sellPrice: 85, description: 'Diamonds formed by massive meteorite impacts on the Moon.', processUses: ['quantum-processor', 'indestructible-blade'], foundAt: ['aristarchus-vein', 'the-core'], emoji: '💠' },
  { id: 'dark-matter-nodule', name: 'Dark Matter Nodule', category: 'anomaly', rarity: 'epic', color: '#191970', glowIntensity: 0.8, xpReward: 110, sellPrice: 100, description: 'Mysterious nodules containing trace dark matter.', processUses: ['warp-drive', 'gravity-manipulator'], foundAt: ['the-core'], emoji: '🌑' },
  { id: 'helium-4-supercell', name: 'Helium-4 Supercell', category: 'isotope', rarity: 'epic', color: '#FFD700', glowIntensity: 0.7, xpReward: 100, sellPrice: 90, description: 'Hyper-concentrated helium-4 for advanced fusion reactors.', processUses: ['fusion-reactor', 'star-drive'], foundAt: ['mare-imbrium-quarry', 'the-core'], emoji: '💫' },
  { id: 'moon-pearl', name: 'Moon Pearl', category: 'crystal', rarity: 'epic', color: '#C8D6E5', glowIntensity: 0.65, xpReward: 88, sellPrice: 78, description: 'Luminous pearl-like formation that stores solar energy.', processUses: ['solar-battery', 'light-amplifier'], foundAt: ['far-side-deposit', 'the-core'], emoji: '🫧' },
  { id: 'quantum-quartz', name: 'Quantum Quartz', category: 'crystal', rarity: 'epic', color: '#9370DB', glowIntensity: 0.85, xpReward: 105, sellPrice: 95, description: 'Quartz exhibiting quantum entanglement properties.', processUses: ['comm-array', 'teleporter-core'], foundAt: ['far-side-deposit', 'the-core'], emoji: '🔮' },
  { id: 'ancient-regolith-core', name: 'Ancient Regolith Core', category: 'anomaly', rarity: 'epic', color: '#8B6914', glowIntensity: 0.6, xpReward: 92, sellPrice: 82, description: '4-billion-year-old regolith preserving solar system secrets.', processUses: ['time-scanner', 'origin-beacon'], foundAt: ['sea-of-tranquility-shaft', 'the-core'], emoji: '🏛️' },

  // ── Legendary (5) ──
  { id: 'sunstone-fragment', name: 'Sunstone Fragment', category: 'anomaly', rarity: 'legendary', color: '#FF8C00', glowIntensity: 1.0, xpReward: 200, sellPrice: 280, description: 'Fragment of the original solar disk embedded in lunar crust.', processUses: ['solar-forge', 'eternal-engine'], foundAt: ['the-core'], emoji: '☀️' },
  { id: 'void-crystal', name: 'Void Crystal', category: 'anomaly', rarity: 'legendary', color: '#0D0D2B', glowIntensity: 0.95, xpReward: 250, sellPrice: 350, description: 'Crystal formed in the void between Earth and Moon.', processUses: ['dimensional-gate', 'antimatter-core'], foundAt: ['the-core'], emoji: '🕳️' },
  { id: 'genesis-stone', name: 'Genesis Stone', category: 'anomaly', rarity: 'legendary', color: '#FFD700', glowIntensity: 1.0, xpReward: 300, sellPrice: 500, description: 'Primordial stone containing the seed of lunar formation.', processUses: ['terraformer', 'world-forge'], foundAt: ['the-core'], emoji: '🌍' },
  { id: 'moonfire-gem', name: 'Moonfire Gem', category: 'crystal', rarity: 'legendary', color: '#FF4500', glowIntensity: 0.95, xpReward: 220, sellPrice: 320, description: 'Gem that burns with cold lunar fire, never extinguishing.', processUses: ['infinity-blade', 'colony-shield'], foundAt: ['the-core'], emoji: '🔥' },
  { id: 'cosmic-egg', name: 'Cosmic Egg', category: 'anomaly', rarity: 'legendary', color: '#E0FFFF', glowIntensity: 1.0, xpReward: 350, sellPrice: 600, description: 'An egg-shaped anomaly that pulses with creation energy.', processUses: ['genesis-engine', 'universe-key'], foundAt: ['the-core'], emoji: '🥚' },
]

/* ================================================================
   MINING SECTORS (8)
   ================================================================ */

const LM_SECTORS: LmSector[] = [
  { id: 'sea-of-tranquility-shaft', name: 'Sea of Tranquility Shaft', description: 'The historic first mining site where Apollo 11 landed. Rich in helium-3.', requiredLevel: 1, dangerLevel: 1, ambientColor: '#4A90D9', unlockCost: 0, mineralIds: ['regolith-chunk', 'basalt-shard', 'iron-dust', 'silicon-grain', 'helium-3-pocket', 'aluminum-nugget', 'tranquillityite', 'ancient-regolith-core'], gravityZone: 'low_g', depthKm: 2, dailyCapacity: 100, backgroundEmoji: '🌊' },
  { id: 'copernicus-pit', name: 'Copernicus Pit', description: 'A deep impact crater pit with exposed ancient geological layers.', requiredLevel: 4, dangerLevel: 2, ambientColor: '#8B8682', unlockCost: 0, mineralIds: ['regolith-chunk', 'basalt-shard', 'anorthosite', 'kREEP-mineral', 'calcium-deposit', 'pyroxene-shard', 'lunar-glass'], gravityZone: 'low_g', depthKm: 5, dailyCapacity: 120, backgroundEmoji: '🕳️' },
  { id: 'tycho-deep-mine', name: 'Tycho Deep Mine', description: 'Deep shafts beneath Tycho crater with rare mineral deposits.', requiredLevel: 8, dangerLevel: 3, ambientColor: '#50C878', unlockCost: 120, mineralIds: ['silicon-grain', 'anorthosite', 'olivine-crystal', 'magnesium-ingot', 'lunar-glass', 'armalcolite', 'tranquillityite', 'thorium-ore'], gravityZone: 'medium_g', depthKm: 12, dailyCapacity: 150, backgroundEmoji: '⛏️' },
  { id: 'aristarchus-vein', name: 'Aristarchus Vein', description: 'The brightest spot on the Moon with unusual volcanic deposits.', requiredLevel: 14, dangerLevel: 4, ambientColor: '#E0115F', unlockCost: 300, mineralIds: ['lunar-glass', 'spinel-gem', 'chrome-vein', 'zircon-crystal', 'thorium-ore', 'lunar-diamond', 'moon-pearl'], gravityZone: 'low_g', depthKm: 8, dailyCapacity: 130, backgroundEmoji: '💎' },
  { id: 'kepler-tunnel', name: 'Kepler Tunnel', description: 'An extensive tunnel network with radioactive ore deposits.', requiredLevel: 20, dangerLevel: 5, ambientColor: '#32CD32', unlockCost: 600, mineralIds: ['iron-dust', 'titanium-oxide', 'chrome-vein', 'uranium-shard', 'helium-3-pocket', 'pyroxferroite'], gravityZone: 'medium_g', depthKm: 18, dailyCapacity: 160, backgroundEmoji: '🚇' },
  { id: 'mare-imbrium-quarry', name: 'Mare Imbrium Quarry', description: 'Vast open quarry in the Sea of Rains with massive ore veins.', requiredLevel: 27, dangerLevel: 6, ambientColor: '#DAA520', unlockCost: 1000, mineralIds: ['iron-dust', 'titanium-oxide', 'helium-3-pocket', 'magnesium-ingot', 'pyroxferroite', 'helium-4-supercell'], gravityZone: 'standard_g', depthKm: 4, dailyCapacity: 200, backgroundEmoji: '🏔️' },
  { id: 'far-side-deposit', name: 'Far Side Deposit', description: 'The radio-shielded far side hides unique cosmic-exposed minerals.', requiredLevel: 35, dangerLevel: 7, ambientColor: '#6B3FA0', unlockCost: 2000, mineralIds: ['kREEP-mineral', 'cosmic-glass', 'moissanite', 'moon-pearl', 'quantum-quartz', 'zircon-crystal', 'pyroxferroite'], gravityZone: 'micro_g', depthKm: 25, dailyCapacity: 140, backgroundEmoji: '🌑' },
  { id: 'the-core', name: 'The Core', description: 'The deepest, most dangerous sector. Legendary minerals await the brave.', requiredLevel: 42, dangerLevel: 9, ambientColor: '#FF4500', unlockCost: 4000, mineralIds: ['armalcolite', 'tranquillityite', 'lunar-diamond', 'dark-matter-nodule', 'helium-4-supercell', 'quantum-quartz', 'ancient-regolith-core', 'sunstone-fragment', 'void-crystal', 'genesis-stone', 'moonfire-gem', 'cosmic-egg', 'moissanite', 'uranium-shard'], gravityZone: 'micro_g', depthKm: 50, dailyCapacity: 80, backgroundEmoji: '🌟' },
]

/* ================================================================
   MINING TOOLS / UPGRADES (30)
   ================================================================ */

const LM_TOOLS: LmMiningTool[] = [
  { id: 'hand-shovel', name: 'Hand Shovel', type: 'tool', rarity: 'common', power: 5, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 15, description: 'Basic shovel for surface regolith collection.', miningBonus: 3, efficiencyBonus: 0, color: '#8B4513', emoji: '🪣' },
  { id: 'lunar-pickaxe', name: 'Lunar Pickaxe', type: 'tool', rarity: 'common', power: 10, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 25, description: 'Lightweight pickaxe designed for low-gravity mining.', miningBonus: 6, efficiencyBonus: 0.05, color: '#A0A0A0', emoji: '⛏️' },
  { id: 'rotary-drill', name: 'Rotary Drill', type: 'tool', rarity: 'uncommon', power: 18, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 50, description: 'Electric rotary drill for harder lunar rock.', miningBonus: 12, efficiencyBonus: 0.1, color: '#4A90D9', emoji: '🔩' },
  { id: 'laser-cutter', name: 'Laser Cutter', type: 'tool', rarity: 'uncommon', power: 25, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 75, description: 'Precision laser that slices through rock like butter.', miningBonus: 18, efficiencyBonus: 0.12, color: '#FF4500', emoji: '🔴' },
  { id: 'plasma-torch', name: 'Plasma Torch', type: 'tool', rarity: 'rare', power: 38, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 150, description: 'High-temperature plasma torch for deep mining.', miningBonus: 28, efficiencyBonus: 0.18, color: '#9370DB', emoji: '🔥' },
  { id: 'diamond-core-drill', name: 'Diamond Core Drill', type: 'tool', rarity: 'epic', power: 55, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 350, description: 'Industrial diamond-tipped core drill for any material.', miningBonus: 42, efficiencyBonus: 0.25, color: '#B9F2FF', emoji: '💎' },
  { id: 'quantum-excavator', name: 'Quantum Excavator', type: 'tool', rarity: 'legendary', power: 80, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 800, description: 'Quantum-tipped excavator that dissolves matter at atomic level.', miningBonus: 65, efficiencyBonus: 0.35, color: '#FFD700', emoji: '🌟' },
  { id: 'seismic-resonator', name: 'Seismic Resonator', type: 'weapon', rarity: 'uncommon', power: 22, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 60, description: 'Creates controlled seismic waves to shatter rock formations.', miningBonus: 14, efficiencyBonus: 0.08, color: '#FF6347', emoji: '💫' },
  { id: 'gravity-hammer', name: 'Gravity Hammer', type: 'weapon', rarity: 'rare', power: 35, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 140, description: 'Hammer that manipulates local gravity for devastating impact.', miningBonus: 22, efficiencyBonus: 0.15, color: '#2E8B57', emoji: '🔨' },
  { id: 'moonbeam-laser', name: 'Moonbeam Laser', type: 'weapon', rarity: 'epic', power: 50, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 300, description: 'Channels concentrated moonlight into a mining beam.', miningBonus: 35, efficiencyBonus: 0.22, color: '#DAA520', emoji: '🌙' },
  { id: 'void-reaper', name: 'Void Reaper', type: 'weapon', rarity: 'legendary', power: 72, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 700, description: 'Weapon that tears openings in reality itself.', miningBonus: 50, efficiencyBonus: 0.32, color: '#0D0D2B', emoji: '🌀' },
  { id: 'hardsuit-basic', name: 'Basic Hardsuit', type: 'armor', rarity: 'common', power: 8, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 20, description: 'Standard EVA suit for surface operations.', miningBonus: 0, efficiencyBonus: 0.05, color: '#E8E4D8', emoji: '🧑‍🚀' },
  { id: 'pressurized-armor', name: 'Pressurized Armor', type: 'armor', rarity: 'uncommon', power: 16, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 55, description: 'Reinforced pressure suit for deep mining operations.', miningBonus: 2, efficiencyBonus: 0.08, color: '#708090', emoji: '🛡️' },
  { id: 'titanium-exosuit', name: 'Titanium Exosuit', type: 'armor', rarity: 'rare', power: 30, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 130, description: 'Powered exoskeleton with integrated mining tools.', miningBonus: 8, efficiencyBonus: 0.15, color: '#4A90D9', emoji: '🤖' },
  { id: 'nano-weave-hardsuit', name: 'Nano-Weave Hardsuit', type: 'armor', rarity: 'epic', power: 48, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 280, description: 'Self-repairing nanofiber suit with radiation shielding.', miningBonus: 12, efficiencyBonus: 0.22, color: '#9370DB', emoji: '🧬' },
  { id: 'celestial-plating', name: 'Celestial Plating', type: 'armor', rarity: 'legendary', power: 70, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 650, description: 'Armor forged from cosmic materials, impervious to all hazards.', miningBonus: 20, efficiencyBonus: 0.3, color: '#FFD700', emoji: '👑' },
  { id: 'mineral-scanner', name: 'Mineral Scanner', type: 'utility', rarity: 'common', power: 5, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 18, description: 'Handheld device that detects nearby mineral deposits.', miningBonus: 8, efficiencyBonus: 0.1, color: '#50C878', emoji: '📡' },
  { id: 'geo-sonar', name: 'Geo-Sonar', type: 'utility', rarity: 'uncommon', power: 12, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 45, description: 'Ground-penetrating sonar for deep mineral mapping.', miningBonus: 15, efficiencyBonus: 0.15, color: '#4169E1', emoji: '🔊' },
  { id: 'spectral-analyzer', name: 'Spectral Analyzer', type: 'utility', rarity: 'rare', power: 22, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 110, description: 'Identifies mineral composition through light spectrum analysis.', miningBonus: 25, efficiencyBonus: 0.22, color: '#FF8C00', emoji: '🌈' },
  { id: 'quantum-probe', name: 'Quantum Probe', type: 'utility', rarity: 'epic', power: 38, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 260, description: 'Quantum sensor array that sees through anything.', miningBonus: 40, efficiencyBonus: 0.3, color: '#6B3FA0', emoji: '🔭' },
  { id: 'omni-scanner', name: 'Omni Scanner', type: 'utility', rarity: 'legendary', power: 60, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 600, description: 'All-knowing scanner that reveals every secret of the Moon.', miningBonus: 60, efficiencyBonus: 0.4, color: '#FFD700', emoji: '👁️' },
  { id: 'cargo-sled', name: 'Cargo Sled', type: 'transport', rarity: 'common', power: 6, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 15, description: 'Simple sled for hauling minerals across the surface.', miningBonus: 0, efficiencyBonus: 0.08, color: '#8B8682', emoji: '🛷' },
  { id: 'lunar-rover-mk1', name: 'Lunar Rover Mk.I', type: 'transport', rarity: 'uncommon', power: 14, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 55, description: 'Basic rover for transporting larger mineral loads.', miningBonus: 0, efficiencyBonus: 0.12, color: '#C0C0C0', emoji: '🚙' },
  { id: 'heavy-hauler', name: 'Heavy Hauler', type: 'transport', rarity: 'rare', power: 26, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 120, description: 'Massive transport vehicle for industrial-scale hauling.', miningBonus: 5, efficiencyBonus: 0.18, color: '#FF6347', emoji: '🚛' },
  { id: 'grav-skiff', name: 'Grav Skiff', type: 'transport', rarity: 'epic', power: 40, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 250, description: 'Anti-gravity skiff that floats above terrain.', miningBonus: 10, efficiencyBonus: 0.25, color: '#00CED1', emoji: '🛸' },
  { id: 'void-transport', name: 'Void Transport', type: 'transport', rarity: 'legendary', power: 58, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 550, description: 'Teleport-capable transport for instant resource delivery.', miningBonus: 20, efficiencyBonus: 0.35, color: '#191970', emoji: '✨' },
  { id: 'solar-charger', name: 'Solar Charger', type: 'support', rarity: 'common', power: 4, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 12, description: 'Portable solar panel for recharging equipment.', miningBonus: 0, efficiencyBonus: 0.05, color: '#DAA520', emoji: '☀️' },
  { id: 'oxygen-recycler', name: 'Oxygen Recycler', type: 'support', rarity: 'uncommon', power: 10, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 40, description: 'Extends oxygen supply during extended mining trips.', miningBonus: 0, efficiencyBonus: 0.08, color: '#87CEEB', emoji: '💨' },
  { id: 'shield-generator', name: 'Shield Generator', type: 'support', rarity: 'rare', power: 20, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 100, description: 'Generates protective energy shield against hazards.', miningBonus: 0, efficiencyBonus: 0.15, color: '#39FF14', emoji: '🛡️' },
  { id: 'repair-drone', name: 'Repair Drone', type: 'support', rarity: 'epic', power: 32, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 220, description: 'Autonomous drone that repairs equipment automatically.', miningBonus: 5, efficiencyBonus: 0.2, color: '#FF8C00', emoji: '🤖' },
  { id: 'nano-swarm', name: 'Nano Swarm', type: 'support', rarity: 'legendary', power: 50, level: 1, maxLevel: LM_TOOL_MAX_LEVEL, upgradeCost: 500, description: 'Swarms of nanobots that boost all mining operations.', miningBonus: 15, efficiencyBonus: 0.3, color: '#E0FFFF', emoji: '🦠' },
]

/* ================================================================
   COLONY BUILDINGS (25)
   ================================================================ */

const LM_BUILDINGS: LmColonyBuilding[] = [
  { id: 'habitat-dome', name: 'Habitat Dome', category: 'habitat', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 80, upgradeCost: 40, description: 'Basic pressurized dome for colonist housing.', productionBonus: 5, storageBonus: 20, color: '#E8E4D8', emoji: '🏠' },
  { id: 'command-center', name: 'Command Center', category: 'communication', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 120, upgradeCost: 60, description: 'Central hub for colony operations and communications.', productionBonus: 3, storageBonus: 10, color: '#4A90D9', emoji: '🏛️' },
  { id: 'solar-array', name: 'Solar Array', category: 'energy', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 60, upgradeCost: 30, description: 'Solar panels for harvesting lunar energy.', productionBonus: 8, storageBonus: 0, color: '#DAA520', emoji: '☀️' },
  { id: 'oxygen-garden', name: 'Oxygen Garden', category: 'life_support', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 50, upgradeCost: 25, description: 'Hydroponic garden that produces oxygen and food.', productionBonus: 6, storageBonus: 5, color: '#50C878', emoji: '🌿' },
  { id: 'storage-bunker', name: 'Storage Bunker', category: 'storage', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 40, upgradeCost: 20, description: 'Underground storage for minerals and equipment.', productionBonus: 0, storageBonus: 50, color: '#8B8682', emoji: '📦' },
  { id: 'mining-outpost', name: 'Mining Outpost', category: 'mining', rarity: 'common', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 100, upgradeCost: 50, description: 'Forward base for extended mining operations.', productionBonus: 10, storageBonus: 15, color: '#FF6B35', emoji: '⛏️' },
  { id: 'research-lab', name: 'Research Lab', category: 'research', rarity: 'uncommon', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 200, upgradeCost: 100, description: 'Laboratory for studying lunar minerals and anomalies.', productionBonus: 5, storageBonus: 10, color: '#9370DB', emoji: '🔬' },
  { id: 'fusion-reactor', name: 'Fusion Reactor', category: 'energy', rarity: 'rare', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 500, upgradeCost: 250, description: 'Helium-3 powered fusion reactor for massive energy.', productionBonus: 25, storageBonus: 0, color: '#FF4500', emoji: '⚡' },
  { id: 'refinery-plant', name: 'Refinery Plant', category: 'mining', rarity: 'uncommon', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 300, upgradeCost: 150, description: 'Processes raw minerals into refined materials.', productionBonus: 15, storageBonus: 20, color: '#C0C0C0', emoji: '🏭' },
  { id: 'med-bay', name: 'Med Bay', category: 'life_support', rarity: 'uncommon', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 180, upgradeCost: 90, description: 'Medical facility for treating injured colonists.', productionBonus: 3, storageBonus: 5, color: '#FF4757', emoji: '🏥' },
  { id: 'comm-tower', name: 'Comm Tower', category: 'communication', rarity: 'uncommon', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 150, upgradeCost: 75, description: 'Long-range communication with Earth and other colonies.', productionBonus: 2, storageBonus: 0, color: '#87CEEB', emoji: '📡' },
  { id: 'hangar-bay', name: 'Hangar Bay', category: 'storage', rarity: 'rare', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 400, upgradeCost: 200, description: 'Large hangar for storing rovers and equipment.', productionBonus: 5, storageBonus: 80, color: '#708090', emoji: '🚀' },
  { id: 'shield-emitter', name: 'Shield Emitter', category: 'defense', rarity: 'rare', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 450, upgradeCost: 225, description: 'Energy shield protecting against meteorite impacts.', productionBonus: 0, storageBonus: 0, color: '#39FF14', emoji: '🛡️' },
  { id: 'processing-vault', name: 'Processing Vault', category: 'mining', rarity: 'rare', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 350, upgradeCost: 175, description: 'Advanced processing facility for rare minerals.', productionBonus: 20, storageBonus: 30, color: '#E0115F', emoji: '🔩' },
  { id: 'observation-deck', name: 'Observation Deck', category: 'research', rarity: 'uncommon', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 160, upgradeCost: 80, description: 'Earth-viewing platform that boosts colony morale.', productionBonus: 2, storageBonus: 0, color: '#4169E1', emoji: '🔭' },
  { id: 'greenhouse-dome', name: 'Greenhouse Dome', category: 'life_support', rarity: 'rare', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 380, upgradeCost: 190, description: 'Large-scale food production with enhanced oxygen output.', productionBonus: 18, storageBonus: 15, color: '#2E8B57', emoji: '🌻' },
  { id: 'quantum-lab', name: 'Quantum Lab', category: 'research', rarity: 'epic', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 800, upgradeCost: 400, description: 'Advanced quantum research for processing anomalies.', productionBonus: 12, storageBonus: 20, color: '#6B3FA0', emoji: '⚛️' },
  { id: 'antimatter-facility', name: 'Antimatter Facility', category: 'energy', rarity: 'epic', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 900, upgradeCost: 450, description: 'Produces antimatter for next-generation power systems.', productionBonus: 35, storageBonus: 0, color: '#191970', emoji: '🕳️' },
  { id: 'space-elevator-base', name: 'Space Elevator Base', category: 'storage', rarity: 'epic', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 1000, upgradeCost: 500, description: 'Base station for the lunar space elevator.', productionBonus: 10, storageBonus: 100, color: '#B9F2FF', emoji: '🗼' },
  { id: 'laser-defense-grid', name: 'Laser Defense Grid', category: 'defense', rarity: 'epic', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 850, upgradeCost: 425, description: 'Automated laser turrets that destroy incoming threats.', productionBonus: 0, storageBonus: 0, color: '#FF0000', emoji: '🔫' },
  { id: 'dark-matter-collector', name: 'Dark Matter Collector', category: 'research', rarity: 'legendary', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 2000, upgradeCost: 1000, description: 'Harvests trace dark matter from the lunar environment.', productionBonus: 20, storageBonus: 50, color: '#0D0D2B', emoji: '🌌' },
  { id: 'terraforming-core', name: 'Terraforming Core', category: 'life_support', rarity: 'legendary', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 2500, upgradeCost: 1250, description: 'Begins the process of creating a breathable atmosphere.', productionBonus: 50, storageBonus: 40, color: '#00FF7F', emoji: '🌍' },
  { id: 'genesis-forge', name: 'Genesis Forge', category: 'mining', rarity: 'legendary', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 3000, upgradeCost: 1500, description: 'Ultimate processing facility that creates new materials.', productionBonus: 40, storageBonus: 60, color: '#FFD700', emoji: '🔥' },
  { id: 'dyson-link', name: 'Dyson Link', category: 'energy', rarity: 'legendary', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 3500, upgradeCost: 1750, description: 'Beam receiver connected to a Dyson sphere.', productionBonus: 80, storageBonus: 0, color: '#FFD700', emoji: '☀️' },
  { id: 'citadel-overlord', name: 'Citadel Overlord', category: 'defense', rarity: 'legendary', level: 1, maxLevel: LM_BUILDING_MAX_LEVEL, buildCost: 5000, upgradeCost: 2500, description: 'The ultimate lunar fortress, impervious to any threat.', productionBonus: 15, storageBonus: 200, color: '#FFD700', emoji: '🏰' },
]

/* ================================================================
   ENGINEERING ABILITIES (22)
   ================================================================ */

const LM_ABILITIES: LmEngineeringAbility[] = [
  { id: 'low-g-leap', name: 'Low-G Leap', description: 'Leap great distances in low gravity to reach high deposits.', cooldown: 10000, duration: 3000, effect: 'reach_bonus', effectValue: 2, requiredLevel: 1, energyCost: 5, color: '#87CEEB', emoji: '🦘' },
  { id: 'regolith-shield', name: 'Regolith Shield', description: 'Compress regolith into a temporary protective barrier.', cooldown: 20000, duration: 8000, effect: 'defense_bonus', effectValue: 30, requiredLevel: 3, energyCost: 10, color: '#8B8682', emoji: '🛡️' },
  { id: 'solar-focus', name: 'Solar Focus', description: 'Focus sunlight through lenses to boost mining laser power.', cooldown: 15000, duration: 10000, effect: 'mining_bonus', effectValue: 50, requiredLevel: 5, energyCost: 8, color: '#FFD700', emoji: '🔍' },
  { id: 'moonquake-blast', name: 'Moonquake Blast', description: 'Trigger a controlled moonquake to reveal hidden minerals.', cooldown: 45000, duration: 2000, effect: 'reveal_minerals', effectValue: 3, requiredLevel: 8, energyCost: 20, color: '#FF6347', emoji: '💥' },
  { id: 'vacuum-siphon', name: 'Vacuum Siphon', description: 'Use vacuum to draw floating mineral dust into containers.', cooldown: 12000, duration: 5000, effect: 'auto_collect', effectValue: 5, requiredLevel: 10, energyCost: 7, color: '#C0C0C0', emoji: '🌀' },
  { id: 'helium-infusion', name: 'Helium Infusion', description: 'Infuse equipment with helium-3 for temporary power boost.', cooldown: 30000, duration: 15000, effect: 'power_multiplier', effectValue: 2, requiredLevel: 13, energyCost: 15, color: '#DAA520', emoji: '⚡' },
  { id: 'crystal-resonance', name: 'Crystal Resonance', description: 'Tune into crystal frequencies to find rare deposits.', cooldown: 25000, duration: 8000, effect: 'rarity_boost', effectValue: 1.5, requiredLevel: 16, energyCost: 12, color: '#9370DB', emoji: '🔔' },
  { id: 'thermal-drill', name: 'Thermal Drill', description: 'Superheat drill bit to melt through the toughest rock.', cooldown: 20000, duration: 12000, effect: 'penetration_bonus', effectValue: 3, requiredLevel: 18, energyCost: 14, color: '#FF4500', emoji: '🪠' },
  { id: 'gravity-well', name: 'Gravity Well', description: 'Create a localized gravity well to pull minerals toward you.', cooldown: 35000, duration: 6000, effect: 'attract_minerals', effectValue: 8, requiredLevel: 21, energyCost: 18, color: '#2E8B57', emoji: '🕳️' },
  { id: 'micro-fabricate', name: 'Micro-Fabricate', description: 'Instantly fabricate basic tools from collected materials.', cooldown: 60000, duration: 0, effect: 'instant_craft', effectValue: 1, requiredLevel: 23, energyCost: 25, color: '#4A90D9', emoji: '🔧' },
  { id: 'dust-cloak', name: 'Dust Cloak', description: 'Wrap yourself in regolith dust for stealth and protection.', cooldown: 40000, duration: 15000, effect: 'stealth_mode', effectValue: 100, requiredLevel: 25, energyCost: 16, color: '#A09B8C', emoji: '👻' },
  { id: 'orbital-strike', name: 'Orbital Strike', description: 'Call in an orbital laser to clear large mining areas.', cooldown: 90000, duration: 3000, effect: 'area_clear', effectValue: 5, requiredLevel: 28, energyCost: 35, color: '#FF0000', emoji: '☄️' },
  { id: 'quantum-tunnel', name: 'Quantum Tunnel', description: 'Create a short-range quantum tunnel to teleport minerals.', cooldown: 50000, duration: 5000, effect: 'teleport_ore', effectValue: 10, requiredLevel: 30, energyCost: 22, color: '#6B3FA0', emoji: '🌀' },
  { id: 'solar-flare-shield', name: 'Solar Flare Shield', description: 'Deploy a magnetic shield against solar radiation bursts.', cooldown: 120000, duration: 20000, effect: 'radiation_block', effectValue: 100, requiredLevel: 32, energyCost: 30, color: '#FF8C00', emoji: '🧲' },
  { id: 'nano-repair', name: 'Nano Repair', description: 'Release nanobots to repair damaged equipment instantly.', cooldown: 45000, duration: 5000, effect: 'repair_all', effectValue: 100, requiredLevel: 34, energyCost: 20, color: '#39FF14', emoji: '🤖' },
  { id: 'helium-bomb', name: 'Helium Bomb', description: 'Detonate a concentrated helium-3 charge for massive excavation.', cooldown: 120000, duration: 2000, effect: 'mega_blast', effectValue: 10, requiredLevel: 36, energyCost: 45, color: '#FFD700', emoji: '💣' },
  { id: 'antigravity-field', name: 'Antigravity Field', description: 'Neutralize gravity in an area for effortless mining.', cooldown: 60000, duration: 20000, effect: 'zero_gravity', effectValue: 1, requiredLevel: 38, energyCost: 30, color: '#00CED1', emoji: '🫧' },
  { id: 'cosmic-sight', name: 'Cosmic Sight', description: 'See through solid rock to identify all mineral deposits.', cooldown: 55000, duration: 15000, effect: 'xray_vision', effectValue: 20, requiredLevel: 40, energyCost: 25, color: '#E0FFFF', emoji: '👁️' },
  { id: 'terra-pulse', name: 'Terra Pulse', description: 'Send a pulse through lunar crust to energize all deposits.', cooldown: 80000, duration: 10000, effect: 'boost_all_sectors', effectValue: 1.3, requiredLevel: 42, energyCost: 40, color: '#00FF7F', emoji: '🌍' },
  { id: 'void-harvest', name: 'Void Harvest', description: 'Reach into the void between dimensions to extract anomaly materials.', cooldown: 100000, duration: 8000, effect: 'anomaly_mining', effectValue: 5, requiredLevel: 45, energyCost: 50, color: '#0D0D2B', emoji: '🌑' },
  { id: 'genesis-wave', name: 'Genesis Wave', description: 'Trigger a wave of creation that transforms raw materials.', cooldown: 150000, duration: 5000, effect: 'transmute_materials', effectValue: 3, requiredLevel: 47, energyCost: 60, color: '#FFD700', emoji: '🌟' },
  { id: 'lunar-overdrive', name: 'Lunar Overdrive', description: 'Ultimate ability: all stats tripled for a short duration.', cooldown: 300000, duration: 30000, effect: 'triple_all', effectValue: 3, requiredLevel: 50, energyCost: 100, color: '#FFD700', emoji: '🌕' },
]

/* ================================================================
   ACHIEVEMENTS (18)
   ================================================================ */

const LM_ACHIEVEMENTS: LmAchievement[] = [
  { id: 'first-footprint', name: 'First Footprint', description: 'Mine your first mineral on the lunar surface.', condition: 'totalMineralsMined >= 1', reward: { type: 'coins', value: 50 }, icon: '👣', color: '#A0A0A0', emoji: '👣' },
  { id: 'regolith-master', name: 'Regolith Master', description: 'Mine 100 minerals from the surface.', condition: 'totalMineralsMined >= 100', reward: { type: 'coins', value: 200 }, icon: '🪨', color: '#8B8682', emoji: '🪨' },
  { id: 'helium-hunter', name: 'Helium Hunter', description: 'Collect 20 helium-3 pockets.', condition: 'inventory includes helium-3-pocket count >= 20', reward: { type: 'coins', value: 300 }, icon: '⚡', color: '#DAA520', emoji: '⚡' },
  { id: 'deep-miner', name: 'Deep Miner', description: 'Reach the deepest sector: The Core.', condition: 'deepestSectorReached >= 50', reward: { type: 'coins', value: 500 }, icon: '🕳️', color: '#FF4500', emoji: '🕳️' },
  { id: 'colony-founder', name: 'Colony Founder', description: 'Construct your first colony building.', condition: 'totalBuildingsConstructed >= 1', reward: { type: 'coins', value: 100 }, icon: '🏗️', color: '#4A90D9', emoji: '🏗️' },
  { id: 'colony-architect', name: 'Colony Architect', description: 'Construct 10 colony buildings.', condition: 'totalBuildingsConstructed >= 10', reward: { type: 'coins', value: 800 }, icon: '🏙️', color: '#50C878', emoji: '🏙️' },
  { id: 'rare-find', name: 'Rare Find', description: 'Mine your first rare mineral.', condition: 'totalRareMined >= 1', reward: { type: 'coins', value: 150 }, icon: '✨', color: '#4A90D9', emoji: '✨' },
  { id: 'legendary-discovery', name: 'Legendary Discovery', description: 'Mine your first legendary mineral.', condition: 'totalLegendaryMined >= 1', reward: { type: 'coins', value: 1000 }, icon: '🌟', color: '#DAA520', emoji: '🌟' },
  { id: 'rover-pioneer', name: 'Rover Pioneer', description: 'Deploy your first lunar rover.', condition: 'totalRoversDeployed >= 1', reward: { type: 'coins', value: 200 }, icon: '🚙', color: '#C0C0C0', emoji: '🚙' },
  { id: 'meteor-shield', name: 'Meteor Shield', description: 'Successfully shield against 5 meteor shower events.', condition: 'totalMeteorShields >= 5', reward: { type: 'coins', value: 500 }, icon: '🛡️', color: '#39FF14', emoji: '🛡️' },
  { id: 'master-refiner', name: 'Master Refiner', description: 'Refine 50 minerals into processed materials.', condition: 'totalRefined >= 50', reward: { type: 'coins', value: 600 }, icon: '⚗️', color: '#E0115F', emoji: '⚗️' },
  { id: 'quest-completer', name: 'Quest Completer', description: 'Complete 10 daily mining quests.', condition: 'dailyStreak >= 10', reward: { type: 'coins', value: 700 }, icon: '📋', color: '#FF8C00', emoji: '📋' },
  { id: 'sector-explorer', name: 'Sector Explorer', description: 'Unlock all 8 mining sectors.', condition: 'unlockedSectors >= 8', reward: { type: 'coins', value: 1500 }, icon: '🗺️', color: '#9370DB', emoji: '🗺️' },
  { id: 'low-gravity-ace', name: 'Low-Gravity Ace', description: 'Mine 500 minerals using low-gravity mechanics.', condition: 'totalMineralsMined >= 500', reward: { type: 'coins', value: 1000 }, icon: '🦘', color: '#87CEEB', emoji: '🦘' },
  { id: 'wealthy-baron', name: 'Wealthy Baron', description: 'Accumulate 10,000 coins.', condition: 'coins >= 10000', reward: { type: 'coins', value: 2000 }, icon: '💰', color: '#FFD700', emoji: '💰' },
  { id: 'engineering-genius', name: 'Engineering Genius', description: 'Use 50 engineering abilities total.', condition: 'miningActionsCount >= 200', reward: { type: 'coins', value: 1200 }, icon: '🧠', color: '#6B3FA0', emoji: '🧠' },
  { id: 'lunar-veteran', name: 'Lunar Veteran', description: 'Reach level 30.', condition: 'level >= 30', reward: { type: 'coins', value: 2000 }, icon: '🎖️', color: '#E0115F', emoji: '🎖️' },
  { id: 'moon-conqueror', name: 'Moon Conqueror', description: 'Reach the maximum level of 50.', condition: 'level >= 50', reward: { type: 'coins', value: 5000 }, icon: '🌕', color: '#FFD700', emoji: '🌕' },
]

/* ================================================================
   EVENTS (6 meteor/space events)
   ================================================================ */

const LM_EVENTS: LmEvent[] = [
  { id: 'meteor-shower', name: 'Meteor Shower', type: 'meteor_shower', description: 'A shower of micrometeorites rains down on the colony!', duration: 30000, effect: 'damage_colony', effectValue: 20, color: '#FF4500', emoji: '☄️' },
  { id: 'solar-flare', name: 'Solar Flare', type: 'solar_flare', description: 'A massive solar flare threatens communications and electronics.', duration: 45000, effect: 'energy_drain', effectValue: 30, color: '#FFD700', emoji: '🌞' },
  { id: 'moonquake', name: 'Moonquake', type: 'moonquake', description: 'Seismic activity reveals new mineral deposits!', duration: 20000, effect: 'reveal_minerals', effectValue: 50, color: '#FF6347', emoji: '💥' },
  { id: 'helium-surge', name: 'Helium Surge', type: 'helium_surge', description: 'A surge of helium-3 deposits detected in all sectors!', duration: 60000, effect: 'boost_helium', effectValue: 2, color: '#DAA520', emoji: '⚡' },
  { id: 'alien-signal', name: 'Alien Signal', type: 'alien_signal', description: 'A mysterious signal detected from deep space!', duration: 30000, effect: 'xp_bonus', effectValue: 1.5, color: '#39FF14', emoji: '👽' },
  { id: 'dust-storm', name: 'Dust Storm', type: 'dust_storm', description: 'Electrostatic dust storm reduces visibility and equipment efficiency.', duration: 40000, effect: 'reduce_efficiency', effectValue: 0.7, color: '#A09B8C', emoji: '🌪️' },
]

/* ================================================================
   INITIAL STATE FACTORY
   ================================================================ */

function lmCreateInitialState(): LmGameState {
  const now = Date.now()
  const initialInventory: LmMineralRecord[] = LM_MINERALS.map((m) => ({
    mineralId: m.id,
    count: 0,
    totalMined: 0,
  }))

  const initialTools: LmToolRecord[] = [
    { toolId: 'hand-shovel', level: 1, equipped: true },
    { toolId: 'hardsuit-basic', level: 1, equipped: true },
  ]

  const initialBuildings: LmBuildingRecord[] = LM_BUILDINGS.map((b) => ({
    buildingId: b.id,
    level: 0,
    built: false,
  }))

  const initialAchievements: LmAchievementRecord[] = LM_ACHIEVEMENTS.map((a) => ({
    achievementId: a.id,
    unlockedAt: 0,
  }))

  const initialProcessingSlots = Array.from({ length: LM_PROCESSING_SLOTS }, () => ({
    mineralId: null as string | null,
    startedAt: null as number | null,
    finishTime: null as number | null,
  }))

  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: LM_INITIAL_COINS,
    totalCoinsEarned: LM_INITIAL_COINS,
    inventory: initialInventory,
    tools: initialTools,
    buildings: initialBuildings,
    achievements: initialAchievements,
    currentSectorId: 'sea-of-tranquility-shaft',
    currentTitleId: 'moon-cadet',
    activeEvents: [],
    rovers: [],
    dailyQuest: null,
    dailyStreak: 0,
    lastDailyDate: '',
    lastSaveTime: now,
    totalMineralsMined: 0,
    totalRareMined: 0,
    totalLegendaryMined: 0,
    totalRefined: 0,
    totalRoversDeployed: 0,
    totalBuildingsConstructed: 0,
    totalMeteorShields: 0,
    totalCoinsSpent: 0,
    deepestSectorReached: 2,
    playTimeMinutes: 0,
    sessionStartTime: now,
    miningActionsCount: 0,
    currentAction: 'drill',
    actionPower: LM_ACTION_POWER_BASE.drill,
    colonyStats: {
      population: LM_INITIAL_POPULATION,
      morale: 75,
      energy: LM_INITIAL_ENERGY,
      maxEnergy: LM_MAX_ENERGY,
      oxygen: LM_INITIAL_OXYGEN,
      maxOxygen: LM_MAX_OXYGEN,
      storage: 0,
      maxStorage: LM_MAX_STORAGE,
    },
    engineeringCooldowns: {},
    processingSlots: initialProcessingSlots,
  }
}

/* ================================================================
   HELPERS
   ================================================================ */

function lmGetXpForLevel(level: number): number {
  if (level <= 0 || level > LM_MAX_LEVEL) return 0
  return LM_XP_TABLE[level] ?? 0
}

function lmGetTitleForLevel(level: number): string {
  let titleId = 'moon-cadet'
  for (const title of LM_TITLES) {
    if (level >= title.requiredLevel) {
      titleId = title.id
    }
  }
  return titleId
}

function lmGetMineralById(id: string): LmMineral | undefined {
  return LM_MINERALS.find((m) => m.id === id)
}

function lmGetSectorById(id: string): LmSector | undefined {
  return LM_SECTORS.find((s) => s.id === id)
}

function lmGetToolById(id: string): LmMiningTool | undefined {
  return LM_TOOLS.find((t) => t.id === id)
}

function lmGetBuildingById(id: string): LmColonyBuilding | undefined {
  return LM_BUILDINGS.find((b) => b.id === id)
}

function lmGetGravityMultiplier(zone: LmGravityZone): number {
  return LM_GRAVITY_MULTIPLIERS[zone] ?? 1.0
}

function lmGetEquippedTool(state: LmGameState, type: string): LmMiningTool | undefined {
  const record = state.tools.find((t) => t.equipped)
  if (!record) return undefined
  const tool = LM_TOOLS.find((t) => t.id === record.toolId && t.type === type)
  return tool
}

function lmCalculateMiningYield(state: LmGameState, sector: LmSector, action: LmMineAction): number {
  const basePower = LM_ACTION_POWER_BASE[action]
  const gravityMult = lmGetGravityMultiplier(sector.gravityZone)
  const equippedTool = lmGetEquippedTool(state, 'tool')
  const toolBonus = equippedTool ? equippedTool.miningBonus * (equippedTool.level || 1) * 0.3 : 0
  const utilityTool = lmGetEquippedTool(state, 'utility')
  const utilityBonus = utilityTool ? utilityTool.miningBonus * (utilityTool.level || 1) * 0.15 : 0
  return Math.floor((basePower + toolBonus + utilityBonus) * gravityMult)
}

function lmPickRandomMineral(sector: LmSector): LmMineral {
  const minerals = sector.mineralIds
    .map((id) => LM_MINERALS.find((m) => m.id === id))
    .filter((m): m is LmMineral => m !== undefined)
  if (minerals.length === 0) {
    return LM_MINERALS[0]
  }
  const totalWeight = minerals.reduce((sum, m) => sum + LM_RARITY[m.rarity].spawnWeight, 0)
  let roll = Math.random() * totalWeight
  for (const mineral of minerals) {
    roll -= LM_RARITY[mineral.rarity].spawnWeight
    if (roll <= 0) return mineral
  }
  return minerals[minerals.length - 1]
}

function lmGenerateDailyQuest(): LmDailyQuest {
  const questTemplates = [
    { id: 'mine-common', name: 'Regolith Run', description: 'Mine 15 common minerals today.', target: 15, reward: { coins: 80, xp: 40 }, emoji: '🪨' },
    { id: 'mine-rare', name: 'Rare Hunt', description: 'Mine 3 rare minerals today.', target: 3, reward: { coins: 200, xp: 100 }, emoji: '💎' },
    { id: 'refine-ore', name: 'Refine and Process', description: 'Refine 8 minerals in the processing plant.', target: 8, reward: { coins: 150, xp: 75 }, emoji: '⚗️' },
    { id: 'deploy-rover', name: 'Rover Patrol', description: 'Deploy a rover on a mining run.', target: 1, reward: { coins: 120, xp: 60 }, emoji: '🚙' },
    { id: 'build-structure', name: 'Colony Expansion', description: 'Build or upgrade a colony structure.', target: 1, reward: { coins: 180, xp: 90 }, emoji: '🏗️' },
    { id: 'use-ability', name: 'Engineering Feat', description: 'Use engineering abilities 5 times.', target: 5, reward: { coins: 100, xp: 50 }, emoji: '🔧' },
    { id: 'explore-sector', name: 'Deep Exploration', description: 'Mine in 3 different sectors today.', target: 3, reward: { coins: 250, xp: 120 }, emoji: '🗺️' },
    { id: 'sell-minerals', name: 'Trade Mission', description: 'Sell minerals worth 500 coins total.', target: 500, reward: { coins: 300, xp: 150 }, emoji: '💰' },
  ]
  const template = questTemplates[Math.floor(Math.random() * questTemplates.length)]
  const now = Date.now()
  return {
    ...template,
    progress: 0,
    expiresAt: now + LM_DAILY_STREAK_WINDOW,
    completed: false,
    claimed: false,
  }
}

function lmCheckAchievements(currentState: LmGameState): LmGameState {
  const newAchievements = currentState.achievements.map((a) => ({ ...a }))
  let coinsGained = 0

  const check = (id: string, condition: boolean) => {
    const entry = newAchievements.find((a) => a.achievementId === id)
    if (entry && entry.unlockedAt === 0 && condition) {
      entry.unlockedAt = Date.now()
      const ach = LM_ACHIEVEMENTS.find((a) => a.id === id)
      if (ach) {
        coinsGained += ach.reward.value
      }
    }
  }

  check('first-footprint', currentState.totalMineralsMined >= 1)
  check('regolith-master', currentState.totalMineralsMined >= 100)
  check('deep-miner', currentState.deepestSectorReached >= 50)
  check('colony-founder', currentState.totalBuildingsConstructed >= 1)
  check('colony-architect', currentState.totalBuildingsConstructed >= 10)
  check('rare-find', currentState.totalRareMined >= 1)
  check('legendary-discovery', currentState.totalLegendaryMined >= 1)
  check('rover-pioneer', currentState.totalRoversDeployed >= 1)
  check('meteor-shield', currentState.totalMeteorShields >= 5)
  check('master-refiner', currentState.totalRefined >= 50)
  check('quest-completer', currentState.dailyStreak >= 10)
  check('low-gravity-ace', currentState.totalMineralsMined >= 500)
  check('wealthy-baron', currentState.coins >= 10000)
  check('lunar-veteran', currentState.level >= 30)
  check('moon-conqueror', currentState.level >= 50)
  check('engineering-genius', currentState.miningActionsCount >= 200)

  const unlockedCount = newAchievements.filter((a) => a.unlockedAt > 0).length
  check('sector-explorer', unlockedCount >= 12)

  const heliumRecord = currentState.inventory.find((i) => i.mineralId === 'helium-3-pocket')
  check('helium-hunter', (heliumRecord?.count ?? 0) >= 20)

  return {
    ...currentState,
    achievements: newAchievements,
    coins: currentState.coins + coinsGained,
    totalCoinsEarned: currentState.totalCoinsEarned + coinsGained,
  }
}

/* ================================================================
   ROVER NAME GENERATOR
   ================================================================ */

const LM_ROVER_DESIGNS = [
  'Artemis', 'Orion', 'Tranquility', 'Copernicus', 'Tycho',
  'Kepler', 'Aristarchus', 'Imbrium', 'Apollo', 'Surveyor',
  'Ranger', 'Luna', 'Chang\'e', 'Selene', 'Kaguya',
]

const LM_ROVER_SUFFIXES = [
  'Mk.I', 'Mk.II', 'Mk.III', 'Prime', 'Ultra',
  'Pro', 'Elite', 'Titan', 'Nova', 'Omega',
]

function lmGenerateRoverName(index: number): string {
  const design = LM_ROVER_DESIGNS[index % LM_ROVER_DESIGNS.length]
  const suffix = LM_ROVER_SUFFIXES[Math.floor(index / LM_ROVER_DESIGNS.length) % LM_ROVER_SUFFIXES.length]
  return design + ' ' + suffix
}

/* ================================================================
   DAILY QUEST TEMPLATES
   ================================================================ */

const LM_QUEST_TEMPLATES = [
  { id: 'mine-common', name: 'Regolith Run', description: 'Mine 15 common minerals today.', target: 15, reward: { coins: 80, xp: 40 }, emoji: '🪨' },
  { id: 'mine-rare', name: 'Rare Hunt', description: 'Mine 3 rare minerals today.', target: 3, reward: { coins: 200, xp: 100 }, emoji: '💎' },
  { id: 'refine-ore', name: 'Refine and Process', description: 'Refine 8 minerals in the processing plant.', target: 8, reward: { coins: 150, xp: 75 }, emoji: '⚗️' },
  { id: 'deploy-rover', name: 'Rover Patrol', description: 'Deploy a rover on a mining run.', target: 1, reward: { coins: 120, xp: 60 }, emoji: '🚙' },
  { id: 'build-structure', name: 'Colony Expansion', description: 'Build or upgrade a colony structure.', target: 1, reward: { coins: 180, xp: 90 }, emoji: '🏗️' },
  { id: 'use-ability', name: 'Engineering Feat', description: 'Use engineering abilities 5 times.', target: 5, reward: { coins: 100, xp: 50 }, emoji: '🔧' },
  { id: 'explore-sector', name: 'Deep Exploration', description: 'Mine in 3 different sectors today.', target: 3, reward: { coins: 250, xp: 120 }, emoji: '🗺️' },
  { id: 'sell-minerals', name: 'Trade Mission', description: 'Sell minerals worth 500 coins total.', target: 500, reward: { coins: 300, xp: 150 }, emoji: '💰' },
]

/* ================================================================
   STAT CALCULATION HELPERS
   ================================================================ */

function lmCalculateColonyOutput(state: LmGameState): { energyPerTick: number; oxygenPerTick: number; miningBonus: number; storageCapacity: number } {
  let energyPerTick = LM_ENERGY_REGEN_RATE
  let oxygenPerTick = LM_OXYGEN_REGEN_RATE
  let miningBonus = 0
  let storageCapacity = 0

  for (const record of state.buildings) {
    if (!record.built) continue
    const def = LM_BUILDINGS.find((b) => b.id === record.buildingId)
    if (!def) continue
    storageCapacity += def.storageBonus
    if (def.category === 'energy') energyPerTick += def.productionBonus * record.level
    if (def.category === 'life_support') oxygenPerTick += def.productionBonus * record.level * 0.5
    if (def.category === 'mining') miningBonus += def.productionBonus * record.level
  }

  return { energyPerTick, oxygenPerTick, miningBonus, storageCapacity }
}

function lmCalculateToolStats(state: LmGameState): { totalMiningPower: number; totalEfficiency: number; totalDefense: number } {
  let totalMiningPower = 0
  let totalEfficiency = 0
  let totalDefense = 0

  for (const record of state.tools) {
    if (!record.equipped) continue
    const tool = LM_TOOLS.find((t) => t.id === record.toolId)
    if (!tool) continue
    totalMiningPower += tool.miningBonus * (record.level * 0.3 + 0.7)
    totalEfficiency += tool.efficiencyBonus * (record.level * 0.2 + 0.8)
    if (tool.type === 'armor') totalDefense += tool.power * (record.level * 0.3 + 0.7)
  }

  return { totalMiningPower, totalEfficiency, totalDefense }
}

function lmCalculateNetWorth(state: LmGameState): number {
  let mineralValue = 0
  for (const record of state.inventory) {
    if (record.count <= 0) continue
    const mineral = LM_MINERALS.find((m) => m.id === record.mineralId)
    if (!mineral) continue
    mineralValue += mineral.sellPrice * record.count
  }
  return state.coins + mineralValue
}

/* ================================================================
   HOOK
   ================================================================ */

export default function useLunarMine() {
  const [state, setState] = useState<LmGameState>(lmCreateInitialState)
  const stateRef = useRef(state)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ── State accessor ──

  const lmGetState = useCallback((): LmGameState => {
    return state
  }, [state])

  // ── XP / Level helpers ──

  const lmApplyXpGain = useCallback((current: LmGameState, amount: number): LmGameState => {
    let newXp = current.xp + amount
    let newLevel = current.level
    let newTitle = current.currentTitleId
    const newTotalXp = current.totalXp + amount

    while (newLevel < LM_MAX_LEVEL && newXp >= lmGetXpForLevel(newLevel + 1)) {
      newLevel += 1
    }

    if (newLevel >= LM_MAX_LEVEL) {
      newXp = Math.min(newXp, lmGetXpForLevel(LM_MAX_LEVEL))
    }

    newTitle = lmGetTitleForLevel(newLevel)

    const newColonyStats = { ...current.colonyStats, maxEnergy: LM_MAX_ENERGY + newLevel * 10, maxOxygen: LM_MAX_OXYGEN + newLevel * 5 }

    return { ...current, xp: newXp, level: newLevel, totalXp: newTotalXp, currentTitleId: newTitle, colonyStats: newColonyStats }
  }, [])

  // ── Mining action ──

  const lmMine = useCallback((): { mineral: LmMineral | null; xpGained: number; coinsGained: number } => {
    const current = stateRef.current
    const sectorId = current.currentSectorId
    if (!sectorId) return { mineral: null, xpGained: 0, coinsGained: 0 }

    const sector = lmGetSectorById(sectorId)
    if (!sector) return { mineral: null, xpGained: 0, coinsGained: 0 }

    const energyCost = LM_ACTION_ENERGY_COST[current.currentAction]
    if (current.colonyStats.energy < energyCost) return { mineral: null, xpGained: 0, coinsGained: 0 }

    const mineral = lmPickRandomMineral(sector)
    const yieldAmount = lmCalculateMiningYield(current, sector, current.currentAction)
    const xpGained = Math.floor(mineral.xpReward * LM_RARITY[mineral.rarity].xpMultiplier * (1 + yieldAmount * 0.01))
    const coinsGained = Math.floor(mineral.sellPrice * LM_RARITY[mineral.rarity].coinMultiplier * (1 + yieldAmount * 0.005))
    const toolBonus = lmGetEquippedTool(current, 'support')
    const efficiencyMult = toolBonus ? 1 + toolBonus.efficiencyBonus * (toolBonus.level || 1) * 0.1 : 1
    const finalCoins = Math.floor(coinsGained * efficiencyMult)
    const finalXp = Math.floor(xpGained * efficiencyMult)

    setState((prev) => {
      const newInventory = prev.inventory.map((item) => {
        if (item.mineralId === mineral.id) {
          return { ...item, count: Math.min(item.count + 1, LM_MAX_INVENTORY_ITEM), totalMined: item.totalMined + 1 }
        }
        return item
      })

      let newState: LmGameState = {
        ...prev,
        inventory: newInventory,
        coins: prev.coins + finalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
        totalMineralsMined: prev.totalMineralsMined + 1,
        miningActionsCount: prev.miningActionsCount + 1,
        colonyStats: { ...prev.colonyStats, energy: Math.max(0, prev.colonyStats.energy - energyCost) },
      }

      if (mineral.rarity === 'rare' || mineral.rarity === 'epic' || mineral.rarity === 'legendary') {
        newState = { ...newState, totalRareMined: newState.totalRareMined + 1 }
      }
      if (mineral.rarity === 'legendary') {
        newState = { ...newState, totalLegendaryMined: newState.totalLegendaryMined + 1 }
      }

      newState = lmApplyXpGain(newState, finalXp)
      newState = lmCheckAchievements(newState)
      return newState
    })

    return { mineral, xpGained: finalXp, coinsGained: finalCoins }
  }, [lmApplyXpGain])

  // ── Sell minerals ──

  const lmSellMineral = useCallback((mineralId: string, count: number): number => {
    const mineral = lmGetMineralById(mineralId)
    if (!mineral) return 0

    let totalCoins = 0
    setState((prev) => {
      const record = prev.inventory.find((i) => i.mineralId === mineralId)
      if (!record || record.count < count) return prev

      totalCoins = mineral.sellPrice * count
      const newInventory = prev.inventory.map((i) => {
        if (i.mineralId === mineralId) {
          return { ...i, count: i.count - count }
        }
        return i
      })

      if (prev.dailyQuest && !prev.dailyQuest.completed) {
        const newQuest = { ...prev.dailyQuest, progress: prev.dailyQuest.progress + totalCoins }
        return {
          ...prev,
          inventory: newInventory,
          coins: prev.coins + totalCoins,
          totalCoinsEarned: prev.totalCoinsEarned + totalCoins,
          dailyQuest: newQuest,
        }
      }

      return {
        ...prev,
        inventory: newInventory,
        coins: prev.coins + totalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + totalCoins,
      }
    })

    return totalCoins
  }, [])

  // ── Equip tool ──

  const lmEquipTool = useCallback((toolId: string): void => {
    setState((prev) => {
      const tool = LM_TOOLS.find((t) => t.id === toolId)
      if (!tool) return prev
      const owned = prev.tools.find((t) => t.toolId === toolId)
      if (!owned) return prev

      const newTools = prev.tools.map((record) => {
        const recTool = LM_TOOLS.find((lt) => lt.id === record.toolId)
        if (!recTool) return record
        return {
          ...record,
          equipped: record.toolId === toolId ? true : (recTool.type === tool.type ? false : record.equipped),
        }
      })

      return { ...prev, tools: newTools }
    })
  }, [])

  // ── Purchase tool ──

  const lmPurchaseTool = useCallback((toolId: string): boolean => {
    const tool = lmGetToolById(toolId)
    if (!tool) return false

    let success = false
    setState((prev) => {
      if (prev.tools.find((t) => t.toolId === toolId)) return prev
      if (prev.coins < tool.upgradeCost) return prev

      success = true
      return {
        ...prev,
        coins: prev.coins - tool.upgradeCost,
        totalCoinsSpent: prev.totalCoinsSpent + tool.upgradeCost,
        tools: [...prev.tools, { toolId, level: 1, equipped: false }],
      }
    })

    return success
  }, [])

  // ── Upgrade tool ──

  const lmUpgradeTool = useCallback((toolId: string): boolean => {
    const tool = lmGetToolById(toolId)
    if (!tool) return false

    let success = false
    setState((prev) => {
      const record = prev.tools.find((t) => t.toolId === toolId)
      if (!record) return prev
      if (record.level >= tool.maxLevel) return prev
      const cost = Math.floor(tool.upgradeCost * Math.pow(1.5, record.level - 1))
      if (prev.coins < cost) return prev

      success = true
      const newTools = prev.tools.map((t) => {
        if (t.toolId === toolId) return { ...t, level: t.level + 1 }
        return t
      })

      return {
        ...prev,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        tools: newTools,
      }
    })

    return success
  }, [])

  // ── Build structure ──

  const lmBuildStructure = useCallback((buildingId: string): boolean => {
    const building = lmGetBuildingById(buildingId)
    if (!building) return false

    let success = false
    setState((prev) => {
      const record = prev.buildings.find((b) => b.buildingId === buildingId)
      if (!record) return prev

      if (!record.built) {
        if (prev.coins < building.buildCost) return prev
        success = true
        const newBuildings = prev.buildings.map((b) => {
          if (b.buildingId === buildingId) return { ...b, built: true, level: 1 }
          return b
        })
        const newStorage = prev.colonyStats.storage + building.storageBonus
        const newMaxStorage = prev.colonyStats.maxStorage + building.storageBonus
        const newPop = building.category === 'habitat' ? prev.colonyStats.population + 5 : prev.colonyStats.population
        const newMorale = Math.min(100, prev.colonyStats.morale + 2)
        let newState: LmGameState = {
          ...prev,
          coins: prev.coins - building.buildCost,
          totalCoinsSpent: prev.totalCoinsSpent + building.buildCost,
          buildings: newBuildings,
          totalBuildingsConstructed: prev.totalBuildingsConstructed + 1,
          colonyStats: {
            ...prev.colonyStats,
            storage: newStorage,
            maxStorage: newMaxStorage,
            population: newPop,
            morale: newMorale,
          },
        }
        newState = lmCheckAchievements(newState)
        return newState
      } else {
        if (record.level >= building.maxLevel) return prev
        const cost = Math.floor(building.upgradeCost * Math.pow(1.6, record.level - 1))
        if (prev.coins < cost) return prev
        success = true
        const newBuildings = prev.buildings.map((b) => {
          if (b.buildingId === buildingId) return { ...b, level: b.level + 1 }
          return b
        })
        return {
          ...prev,
          coins: prev.coins - cost,
          totalCoinsSpent: prev.totalCoinsSpent + cost,
          buildings: newBuildings,
          colonyStats: { ...prev.colonyStats, storage: prev.colonyStats.storage + building.storageBonus * 0.5 },
        }
      }
    })

    return success
  }, [])

  // ── Deploy rover ──

  const lmDeployRover = useCallback((sectorId: string): boolean => {
    const sector = lmGetSectorById(sectorId)
    if (!sector) return false

    let success = false
    setState((prev) => {
      const activeRover = prev.rovers.find((r) => r.status === 'deployed')
      if (activeRover) return prev

      if (prev.colonyStats.energy < 20) return prev

      const rover: LmLunarRover = {
        id: 'rover-' + Date.now(),
        name: 'LRV-' + (prev.rovers.length + 1),
        status: 'deployed',
        fuel: LM_ROVER_MAX_FUEL,
        maxFuel: LM_ROVER_MAX_FUEL,
        cargo: [],
        maxCargo: LM_ROVER_MAX_CARGO,
        deployedSectorId: sectorId,
        returnTime: Date.now() + LM_ROVER_DEPLOY_TIME,
        speed: 1,
        durability: 100,
        color: '#C0C0C0',
        emoji: '🚙',
      }

      success = true
      return {
        ...prev,
        rovers: [...prev.rovers, rover],
        totalRoversDeployed: prev.totalRoversDeployed + 1,
        colonyStats: { ...prev.colonyStats, energy: prev.colonyStats.energy - 20 },
      }
    })

    return success
  }, [])

  // ── Recall rover ──

  const lmRecallRover = useCallback((roverId: string): boolean => {
    let success = false
    setState((prev) => {
      const rover = prev.rovers.find((r) => r.id === roverId)
      if (!rover || rover.status !== 'deployed') return prev

      success = true
      const newRovers = prev.rovers.map((r) => {
        if (r.id === roverId) return { ...r, status: 'returning' as const, returnTime: Date.now() + 10000 }
        return r
      })
      return { ...prev, rovers: newRovers }
    })
    return success
  }, [])

  // ── Collect rover cargo ──

  const lmCollectRoverCargo = useCallback((roverId: string): { minerals: { name: string; count: number; emoji: string }[]; totalXp: number; totalCoins: number } => {
    const result = { minerals: [] as { name: string; count: number; emoji: string }[], totalXp: 0, totalCoins: 0 }

    setState((prev) => {
      const rover = prev.rovers.find((r) => r.id === roverId)
      if (!rover || rover.status !== 'returning') return prev
      if ((rover.returnTime ?? 0) > Date.now()) return prev

      const sector = rover.deployedSectorId ? lmGetSectorById(rover.deployedSectorId) : undefined
      const cargoCount = Math.floor(Math.random() * 8) + 3
      let totalXp = 0
      let totalCoins = 0
      const newCargo: { mineralId: string; count: number }[] = []

      for (let i = 0; i < cargoCount; i++) {
        if (sector) {
          const mineral = lmPickRandomMineral(sector)
          const count = Math.floor(Math.random() * 3) + 1
          newCargo.push({ mineralId: mineral.id, count })
          totalXp += Math.floor(mineral.xpReward * LM_RARITY[mineral.rarity].xpMultiplier * count)
          totalCoins += Math.floor(mineral.sellPrice * LM_RARITY[mineral.rarity].coinMultiplier * count)
          result.minerals.push({ name: mineral.name, count, emoji: mineral.emoji })
        }
      }

      result.totalXp = totalXp
      result.totalCoins = totalCoins

      const newInventory = prev.inventory.map((item) => {
        const cargoItem = newCargo.find((c) => c.mineralId === item.mineralId)
        if (cargoItem) {
          return { ...item, count: Math.min(item.count + cargoItem.count, LM_MAX_INVENTORY_ITEM), totalMined: item.totalMined + cargoItem.count }
        }
        return item
      })

      const newRovers = prev.rovers.filter((r) => r.id !== roverId)
      let newState: LmGameState = {
        ...prev,
        inventory: newInventory,
        rovers: newRovers,
        coins: prev.coins + totalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + totalCoins,
        totalMineralsMined: prev.totalMineralsMined + cargoCount,
      }
      newState = lmApplyXpGain(newState, totalXp)
      newState = lmCheckAchievements(newState)
      return newState
    })

    return result
  }, [lmApplyXpGain])

  // ── Process minerals ──

  const lmProcessMineral = useCallback((slotIndex: number, mineralId: string): boolean => {
    const mineral = lmGetMineralById(mineralId)
    if (!mineral) return false

    let success = false
    setState((prev) => {
      if (slotIndex < 0 || slotIndex >= prev.processingSlots.length) return prev
      const slot = prev.processingSlots[slotIndex]
      if (slot.mineralId !== null) return prev

      const record = prev.inventory.find((i) => i.mineralId === mineralId)
      if (!record || record.count < 1) return prev
      if (prev.colonyStats.energy < 5) return prev

      success = true
      const now = Date.now()
      const newSlots = [...prev.processingSlots]
      newSlots[slotIndex] = { mineralId, startedAt: now, finishTime: now + LM_PROCESSING_BASE_TIME }

      const newInventory = prev.inventory.map((i) => {
        if (i.mineralId === mineralId) return { ...i, count: i.count - 1 }
        return i
      })

      return {
        ...prev,
        processingSlots: newSlots,
        inventory: newInventory,
        colonyStats: { ...prev.colonyStats, energy: prev.colonyStats.energy - 5 },
      }
    })

    return success
  }, [])

  // ── Collect processed minerals ──

  const lmCollectProcessed = useCallback((slotIndex: number): { mineral: LmMineral | null; bonusCoins: number } => {
    const result = { mineral: null as LmMineral | null, bonusCoins: 0 }

    setState((prev) => {
      if (slotIndex < 0 || slotIndex >= prev.processingSlots.length) return prev
      const slot = prev.processingSlots[slotIndex]
      if (!slot.mineralId || !slot.finishTime || slot.finishTime > Date.now()) return prev

      const mineral = lmGetMineralById(slot.mineralId)
      if (!mineral) return prev

      result.mineral = mineral
      const bonusCoins = Math.floor(mineral.sellPrice * LM_RARITY[mineral.rarity].coinMultiplier * 1.5)
      result.bonusCoins = bonusCoins

      const newSlots = [...prev.processingSlots]
      newSlots[slotIndex] = { mineralId: null, startedAt: null, finishTime: null }

      return {
        ...prev,
        processingSlots: newSlots,
        coins: prev.coins + bonusCoins,
        totalCoinsEarned: prev.totalCoinsEarned + bonusCoins,
        totalRefined: prev.totalRefined + 1,
      }
    })

    return result
  }, [])

  // ── Change sector ──

  const lmChangeSector = useCallback((sectorId: string): boolean => {
    const sector = lmGetSectorById(sectorId)
    if (!sector) return false

    let success = false
    setState((prev) => {
      if (prev.level < sector.requiredLevel) return prev
      if (prev.coins < sector.unlockCost && prev.currentSectorId !== sectorId) {
        const alreadyUnlocked = prev.buildings.some((b) => true)
        return prev
      }

      success = true
      const cost = prev.currentSectorId === sectorId ? 0 : sector.unlockCost
      const newDepth = Math.max(prev.deepestSectorReached, sector.depthKm)

      return {
        ...prev,
        currentSectorId: sectorId,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        deepestSectorReached: newDepth,
      }
    })

    return success
  }, [])

  // ── Change mining action ──

  const lmSetAction = useCallback((action: LmMineAction): void => {
    setState((prev) => ({
      ...prev,
      currentAction: action,
      actionPower: LM_ACTION_POWER_BASE[action],
    }))
  }, [])

  // ── Use engineering ability ──

  const lmUseAbility = useCallback((abilityId: string): boolean => {
    const ability = LM_ABILITIES.find((a) => a.id === abilityId)
    if (!ability) return false

    let success = false
    setState((prev) => {
      if (prev.level < ability.requiredLevel) return prev
      if (prev.colonyStats.energy < ability.energyCost) return prev

      const lastUsed = prev.engineeringCooldowns[abilityId] ?? 0
      if (Date.now() - lastUsed < ability.cooldown) return prev

      success = true
      const newCooldowns = { ...prev.engineeringCooldowns, [abilityId]: Date.now() }
      let newXp = Math.floor(ability.effectValue * 5)
      let newCoins = Math.floor(ability.effectValue * 2)

      return {
        ...prev,
        engineeringCooldowns: newCooldowns,
        coins: prev.coins + newCoins,
        totalCoinsEarned: prev.totalCoinsEarned + newCoins,
        xp: prev.xp + newXp,
        totalXp: prev.totalXp + newXp,
        colonyStats: { ...prev.colonyStats, energy: prev.colonyStats.energy - ability.energyCost },
        miningActionsCount: prev.miningActionsCount + 1,
      }
    })

    return success
  }, [])

  // ── Claim daily quest ──

  const lmClaimDailyQuest = useCallback((): void => {
    const today = new Date().toDateString()
    setState((prev) => {
      if (prev.lastDailyDate === today && prev.dailyQuest) return prev

      const streak = prev.lastDailyDate === '' ? 1 : (() => {
        const last = new Date(prev.lastDailyDate)
        const now = new Date(today)
        const diff = Math.floor((now.getTime() - last.getTime()) / LM_DAILY_STREAK_WINDOW)
        return diff <= 1 ? prev.dailyStreak + 1 : 1
      })()

      const quest = lmGenerateDailyQuest()

      return {
        ...prev,
        dailyQuest: quest,
        dailyStreak: streak,
        lastDailyDate: today,
      }
    })
  }, [])

  // ── Complete daily quest ──

  const lmCompleteDailyQuest = useCallback((): { coins: number; xp: number } => {
    const result = { coins: 0, xp: 0 }

    setState((prev) => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev
      if (prev.dailyQuest.progress < prev.dailyQuest.target) return prev

      const quest = prev.dailyQuest
      result.coins = quest.reward.coins
      result.xp = quest.reward.xp

      let newState: LmGameState = {
        ...prev,
        dailyQuest: { ...quest, completed: true },
        coins: prev.coins + quest.reward.coins,
        totalCoinsEarned: prev.totalCoinsEarned + quest.reward.coins,
      }
      newState = lmApplyXpGain(newState, quest.reward.xp)
      newState = lmCheckAchievements(newState)
      return newState
    })

    return result
  }, [lmApplyXpGain])

  // ── Advance daily quest progress ──

  const lmAdvanceQuestProgress = useCallback((amount: number): void => {
    setState((prev) => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev
      const newQuest = { ...prev.dailyQuest, progress: Math.min(prev.dailyQuest.progress + amount, prev.dailyQuest.target) }
      return { ...prev, dailyQuest: newQuest }
    })
  }, [])

  // ── Shield meteor event ──

  const lmShieldMeteorEvent = useCallback((): boolean => {
    let success = false
    setState((prev) => {
      const meteorEvent = prev.activeEvents.find((e) => e.eventId === 'meteor-shower')
      if (!meteorEvent) return prev
      if (prev.colonyStats.energy < 15) return prev

      success = true
      const newEvents = prev.activeEvents.filter((e) => e.eventId !== 'meteor-shower')
      return {
        ...prev,
        activeEvents: newEvents,
        totalMeteorShields: prev.totalMeteorShields + 1,
        colonyStats: { ...prev.colonyStats, energy: prev.colonyStats.energy - 15, morale: Math.min(100, prev.colonyStats.morale + 5) },
      }
    })
    return success
  }, [])

  // ── Reset game ──

  const lmResetGame = useCallback((): void => {
    setState(lmCreateInitialState())
  }, [])

  // ── Save / Load ──

  const lmSaveGame = useCallback((): void => {
    try {
      localStorage.setItem(LM_STORAGE_KEY, JSON.stringify(stateRef.current))
    } catch {
      // storage full or unavailable
    }
  }, [])

  const lmLoadGame = useCallback((): boolean => {
    try {
      const saved = localStorage.getItem(LM_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as LmGameState
        setState(parsed)
        return true
      }
    } catch {
      // corrupted save
    }
    return false
  }, [])

  // ── Auto-save ──

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        localStorage.setItem(LM_STORAGE_KEY, JSON.stringify(stateRef.current))
      } catch {
        // storage full
      }
    }, LM_AUTO_SAVE_INTERVAL)
    return () => { clearInterval(interval) }
  }, [])

  // ── Colony resource regen ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const builtEnergyBuildings = prev.buildings.filter((b) => {
          const def = LM_BUILDINGS.find((d) => d.id === b.buildingId)
          return b.built && def && def.category === 'energy'
        })
        const builtOxygenBuildings = prev.buildings.filter((b) => {
          const def = LM_BUILDINGS.find((d) => d.id === b.buildingId)
          return b.built && def && def.category === 'life_support'
        })

        const energyRegen = LM_ENERGY_REGEN_RATE + builtEnergyBuildings.reduce((sum, b) => sum + 1, 0) * 2
        const oxygenRegen = LM_OXYGEN_REGEN_RATE + builtOxygenBuildings.reduce((sum, b) => sum + 1, 0) * 1
        const newEnergy = Math.min(prev.colonyStats.maxEnergy, prev.colonyStats.energy + energyRegen)
        const newOxygen = Math.min(prev.colonyStats.maxOxygen, prev.colonyStats.oxygen + oxygenRegen)

        return {
          ...prev,
          colonyStats: { ...prev.colonyStats, energy: newEnergy, oxygen: newOxygen },
        }
      })
    }, 5000)
    return () => { clearInterval(interval) }
  }, [])

  // ── Event spawning ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (prev.activeEvents.length >= 2) return prev
        if (Math.random() > 0.3) return prev

        const availableEvents = LM_EVENTS.filter((e) => !prev.activeEvents.find((ae) => ae.eventId === e.id))
        if (availableEvents.length === 0) return prev

        const event = availableEvents[Math.floor(Math.random() * availableEvents.length)]
        const now = Date.now()

        return {
          ...prev,
          activeEvents: [...prev.activeEvents, { eventId: event.id, startTime: now, endTime: now + event.duration }],
        }
      })
    }, LM_EVENT_SPAWN_INTERVAL)
    return () => { clearInterval(interval) }
  }, [])

  // ── Event expiry ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now()
        const activeEvents = prev.activeEvents.filter((e) => e.endTime > now)
        if (activeEvents.length === prev.activeEvents.length) return prev

        return { ...prev, activeEvents }
      })
    }, 3000)
    return () => { clearInterval(interval) }
  }, [])

  // ── Processing completion check ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        const now = Date.now()
        const hasPending = prev.processingSlots.some((s) => s.mineralId !== null && s.finishTime !== null && s.finishTime <= now)
        if (!hasPending) return prev
        return prev
      })
    }, 2000)
    return () => { clearInterval(interval) }
  }, [])

  // ── Play time tracking ──

  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        playTimeMinutes: prev.playTimeMinutes + 1,
      }))
    }, 60000)
    return () => { clearInterval(interval) }
  }, [])

  // ── Computed values ──

  const lmCurrentTitle = useMemo((): LmTitle => {
    const title = LM_TITLES.find((t) => t.id === state.currentTitleId)
    return title ?? LM_TITLES[0]
  }, [state.currentTitleId])

  const lmCurrentSector = useMemo((): LmSector | null => {
    if (!state.currentSectorId) return null
    return LM_SECTORS.find((s) => s.id === state.currentSectorId) ?? null
  }, [state.currentSectorId])

  const lmXpProgress = useMemo((): { current: number; required: number; percent: number } => {
    const current = state.xp
    const nextLevel = Math.min(state.level + 1, LM_MAX_LEVEL)
    const required = lmGetXpForLevel(nextLevel)
    const percent = required > 0 ? Math.min(100, (current / required) * 100) : 100
    return { current, required, percent }
  }, [state.xp, state.level])

  const lmUnlockedSectors = useMemo((): LmSector[] => {
    return LM_SECTORS.filter((s) => state.level >= s.requiredLevel && state.coins >= s.unlockCost || state.currentSectorId === s.id)
  }, [state.level, state.coins, state.currentSectorId])

  const lmAvailableMinerals = useMemo((): LmMineral[] => {
    if (!state.currentSectorId) return []
    const sector = lmGetSectorById(state.currentSectorId)
    if (!sector) return []
    return sector.mineralIds.map((id) => LM_MINERALS.find((m) => m.id === id)).filter((m): m is LmMineral => m !== undefined)
  }, [state.currentSectorId])

  const lmActiveEvents = useMemo((): { event: LmEvent; remaining: number }[] => {
    const now = Date.now()
    return state.activeEvents
      .map((ae) => {
        const event = LM_EVENTS.find((e) => e.id === ae.eventId)
        if (!event) return null
        return { event, remaining: Math.max(0, ae.endTime - now) }
      })
      .filter((e): e is { event: LmEvent; remaining: number } => e !== null)
  }, [state.activeEvents])

  const lmAbilityCooldowns = useMemo((): Record<string, { remaining: number; ready: boolean }> => {
    const now = Date.now()
    const result: Record<string, { remaining: number; ready: boolean }> = {}
    for (const ability of LM_ABILITIES) {
      const lastUsed = state.engineeringCooldowns[ability.id] ?? 0
      const remaining = Math.max(0, ability.cooldown - (now - lastUsed))
      result[ability.id] = { remaining, ready: remaining <= 0 }
    }
    return result
  }, [state.engineeringCooldowns])

  const lmProcessingStatus = useMemo((): { slotIndex: number; mineral: LmMineral | null; progress: number; complete: boolean }[] => {
    const now = Date.now()
    return state.processingSlots.map((slot, index) => {
      if (!slot.mineralId || !slot.startedAt || !slot.finishTime) {
        return { slotIndex: index, mineral: null, progress: 0, complete: false }
      }
      const mineral = lmGetMineralById(slot.mineralId) ?? null
      const total = slot.finishTime - slot.startedAt
      const elapsed = now - slot.startedAt
      const progress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 100
      return { slotIndex: index, mineral, progress, complete: now >= slot.finishTime }
    })
  }, [state.processingSlots])

  const lmInventoryValue = useMemo((): { total: number; byRarity: Record<string, number> } => {
    let total = 0
    const byRarity: Record<string, number> = {}
    for (const record of state.inventory) {
      if (record.count <= 0) continue
      const mineral = lmGetMineralById(record.mineralId)
      if (!mineral) continue
      const value = mineral.sellPrice * record.count
      total += value
      byRarity[mineral.rarity] = (byRarity[mineral.rarity] ?? 0) + value
    }
    return { total, byRarity }
  }, [state.inventory])

  const lmAchievementSummary = useMemo((): { unlocked: number; total: number; percent: number; recent: LmAchievement[] } => {
    const unlocked = state.achievements.filter((a) => a.unlockedAt > 0)
    const recent = unlocked
      .sort((a, b) => b.unlockedAt - a.unlockedAt)
      .slice(0, 5)
      .map((a) => LM_ACHIEVEMENTS.find((ach) => ach.id === a.achievementId))
      .filter((a): a is LmAchievement => a !== undefined)
    return {
      unlocked: unlocked.length,
      total: LM_ACHIEVEMENTS.length,
      percent: LM_ACHIEVEMENTS.length > 0 ? (unlocked.length / LM_ACHIEVEMENTS.length) * 100 : 0,
      recent,
    }
  }, [state.achievements])

  const lmRoverFleet = useMemo((): { deployed: LmLunarRover[]; returning: LmLunarRover[]; idle: LmLunarRover[]; damaged: LmLunarRover[] } => {
    const now = Date.now()
    const deployed = state.rovers.filter((r) => r.status === 'deployed' && (r.returnTime ?? 0) > now)
    const returning = state.rovers.filter((r) => r.status === 'returning' && (r.returnTime ?? 0) <= now)
    const idle = state.rovers.filter((r) => r.status === 'idle')
    const damaged = state.rovers.filter((r) => r.status === 'damaged')
    return { deployed, returning, idle, damaged }
  }, [state.rovers])

  const lmColonyBuildings = useMemo((): { built: { building: LmColonyBuilding; level: number }[]; unbuilt: LmColonyBuilding[] } => {
    const built: { building: LmColonyBuilding; level: number }[] = []
    const unbuilt: LmColonyBuilding[] = []
    for (const record of state.buildings) {
      const def = LM_BUILDINGS.find((b) => b.id === record.buildingId)
      if (!def) continue
      if (record.built) {
        built.push({ building: def, level: record.level })
      } else {
        unbuilt.push(def)
      }
    }
    return { built, unbuilt }
  }, [state.buildings])

  const lmOwnedTools = useMemo((): { tool: LmMiningTool; record: LmToolRecord }[] => {
    return state.tools
      .map((record) => {
        const tool = LM_TOOLS.find((t) => t.id === record.toolId)
        return tool ? { tool, record } : null
      })
      .filter((t): t is { tool: LmMiningTool; record: LmToolRecord } => t !== null)
  }, [state.tools])

  const lmShopTools = useMemo((): LmMiningTool[] => {
    const ownedIds = new Set(state.tools.map((t) => t.toolId))
    return LM_TOOLS.filter((t) => !ownedIds.has(t.id))
  }, [state.tools])

  // ── Return all hook values ──

  return {
    state: lmGetState,
    // Actions
    lmMine,
    lmSellMineral,
    lmEquipTool,
    lmPurchaseTool,
    lmUpgradeTool,
    lmBuildStructure,
    lmDeployRover,
    lmRecallRover,
    lmCollectRoverCargo,
    lmProcessMineral,
    lmCollectProcessed,
    lmChangeSector,
    lmSetAction,
    lmUseAbility,
    lmClaimDailyQuest,
    lmCompleteDailyQuest,
    lmAdvanceQuestProgress,
    lmShieldMeteorEvent,
    lmResetGame,
    lmSaveGame,
    lmLoadGame,
    // Computed
    lmCurrentTitle,
    lmCurrentSector,
    lmXpProgress,
    lmUnlockedSectors,
    lmAvailableMinerals,
    lmActiveEvents,
    lmAbilityCooldowns,
    lmProcessingStatus,
    lmInventoryValue,
    lmAchievementSummary,
    lmRoverFleet,
    lmColonyBuildings,
    lmOwnedTools,
    lmShopTools,
  }
}
