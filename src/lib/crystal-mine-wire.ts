'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

/* ================================================================
   TYPES
   ================================================================ */

type CmRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type CmMineAction = 'swing' | 'dig' | 'blast' | 'excavate'
type CmEventType = 'crystal_surge' | 'cave_in' | 'gem_exhibition' | 'lucky_strike' | 'ore_vein' | 'tremor'
type CmCreatureType = 'passive' | 'neutral' | 'hostile' | 'boss'
type CmCrystalCategory = 'gem' | 'mineral' | 'ore' | 'fossil' | 'essence'

interface CmRarityInfo {
  id: CmRarityTier
  name: string
  color: string
  glow: string
  xpMultiplier: number
  spawnWeight: number
  coinMultiplier: number
}

interface CmCrystal {
  id: string
  name: string
  category: CmCrystalCategory
  rarity: CmRarityTier
  color: string
  glowIntensity: number
  xpReward: number
  sellPrice: number
  description: string
  craftUses: string[]
  foundAt: string[]
}

interface CmMineLevel {
  id: string
  name: string
  depth: number
  description: string
  requiredLevel: number
  dangerLevel: number
  ambientColor: string
  unlockCost: number
  crystalIds: string[]
  creatureIds: string[]
  oreChance: number
  bossCreatureId: string | null
}

interface CmCreature {
  id: string
  name: string
  type: CmCreatureType
  hp: number
  damage: number
  xpReward: number
  coinDrop: number
  description: string
  crystalDrop: string
  tameable: boolean
  tamedBonus: string
  color: string
}

interface CmEquipment {
  id: string
  name: string
  type: string
  rarity: CmRarityTier
  power: number
  level: number
  maxLevel: number
  upgradeCost: number
  description: string
  miningBonus: number
  defenseBonus: number
  color: string
}

interface CmRecipe {
  id: string
  name: string
  description: string
  ingredients: { crystalId: string; count: number }[]
  requiredCoins: number
  requiredLevel: number
  rarity: CmRarityTier
  resultType: 'equipment' | 'crystal' | 'boost'
  resultId: string
  xpReward: number
  color: string
}

interface CmTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  bonusXpPercent: number
  bonusCoinPercent: number
  color: string
}

interface CmAchievement {
  id: string
  name: string
  description: string
  condition: string
  reward: { type: string; value: number }
  icon: string
  color: string
}

interface CmEvent {
  id: string
  name: string
  type: CmEventType
  description: string
  duration: number
  effect: string
  effectValue: number
  color: string
}

interface CmInventoryItem {
  crystalId: string
  count: number
}

interface CmEquipmentRecord {
  equipmentId: string
  level: number
  equipped: boolean
}

interface CmCreatureRecord {
  creatureId: string
  encountered: boolean
  defeated: boolean
  tamed: boolean
  defeatCount: number
}

interface CmMineRecord {
  mineId: string
  explored: boolean
  explorationPercent: number
  totalMined: number
  bossDefeated: boolean
}

interface CmAchievementRecord {
  achievementId: string
  unlockedAt: number
}

interface CmActiveEvent {
  eventId: string
  startTime: number
  endTime: number
}

interface CmMineCart {
  capacity: number
  currentLoad: number
  crystalIds: string[]
  upgradeLevel: number
  maxUpgradeLevel: number
}

interface CmExpedition {
  id: string
  targetMineId: string
  startTime: number
  duration: number
  rewards: CmInventoryItem[]
  completed: boolean
  claimed: boolean
}

interface CmSynthesisSlot {
  slotId: number
  crystalId1: string | null
  crystalId2: string | null
  resultCrystalId: string | null
  startedAt: number | null
  finishTime: number | null
}

interface CmGameState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  inventory: CmInventoryItem[]
  equipment: CmEquipmentRecord[]
  equippedWeapon: string | null
  equippedArmor: string | null
  equippedTool: string | null
  creatures: CmCreatureRecord[]
  mines: CmMineRecord[]
  achievements: CmAchievementRecord[]
  currentMineId: string | null
  currentTitleId: string
  activeEvents: CmActiveEvent[]
  mineCart: CmMineCart
  expedition: CmExpedition | null
  synthesisSlots: CmSynthesisSlot[]
  dailyStreak: number
  lastDailyDate: string
  lastSaveTime: number
  totalCrystalsMined: number
  totalRareMined: number
  totalLegendaryMined: number
  totalCrafted: number
  totalSynthesized: number
  totalCreaturesDefeated: number
  totalCreaturesTamed: number
  totalBossesDefeated: number
  totalExpeditions: number
  totalCoinsSpent: number
  deepestMineReached: number
  playTimeMinutes: number
  sessionStartTime: number
  miningActionsCount: number
  currentAction: CmMineAction
  actionPower: number
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const CM_SAVE_KEY = 'crystal-mine-save'
const CM_MAX_LEVEL = 50
const CM_STORAGE_KEY = 'crystal-mine-state'
const CM_AUTO_SAVE_INTERVAL = 30000
const CM_DAILY_STREAK_WINDOW = 86400000
const CM_EQUIPMENT_MAX_LEVEL = 10
const CM_MINE_CART_BASE_CAPACITY = 20
const CM_MINE_CART_MAX_UPGRADE = 10
const CM_MINE_CART_UPGRADE_COST_BASE = 50
const CM_SYNTHESIS_SLOTS_COUNT = 3
const CM_SYNTHESIS_BASE_TIME = 60000
const CM_EXPEDITION_BASE_TIME = 120000
const CM_EVENT_BASE_DURATION = 3600000
const CM_ACTION_COOLDOWN = 500
const CM_MAX_INVENTORY_ITEM = 999
const CM_ACHIEVEMENT_CHECK_INTERVAL = 5000
const CM_EVENT_SPAWN_INTERVAL = 120000
const CM_TRADE_LOG_MAX = 100
const CM_BOSS_BONUS_COINS = 200
const CM_BOSS_BONUS_XP = 300
const CM_INITIAL_COINS = 100

const CM_THEME_COLORS = {
  deepPurple: '#4B0082',
  crystalBlue: '#00CED1',
  emerald: '#50C878',
  rubyRed: '#E0115F',
  amber: '#FFBF00',
  background: '#1a0a2e',
  surface: '#2d1b4e',
  textPrimary: '#e8e0f0',
  textSecondary: '#a89cc8',
  accent: '#00CED1',
  danger: '#E0115F',
  success: '#50C878',
  warning: '#FFBF00',
}

const CM_COLORS: Record<string, string> = {
  deepPurple: '#4B0082',
  crystalBlue: '#00CED1',
  emerald: '#50C878',
  rubyRed: '#E0115F',
  amber: '#FFBF00',
}

const CM_RARITY: Record<CmRarityTier, CmRarityInfo> = {
  common: {
    id: 'common',
    name: 'Common',
    color: '#a0a0a0',
    glow: '#808080',
    xpMultiplier: 1,
    spawnWeight: 50,
    coinMultiplier: 1,
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#50C878',
    glow: '#3da85e',
    xpMultiplier: 1.5,
    spawnWeight: 30,
    coinMultiplier: 2,
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    color: '#00CED1',
    glow: '#009aa0',
    xpMultiplier: 2.5,
    spawnWeight: 14,
    coinMultiplier: 4,
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    color: '#E0115F',
    glow: '#b80d4e',
    xpMultiplier: 4,
    spawnWeight: 5,
    coinMultiplier: 8,
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    color: '#FFBF00',
    glow: '#e6ac00',
    xpMultiplier: 7,
    spawnWeight: 1,
    coinMultiplier: 15,
  },
}

const CM_RARITY_ORDER: readonly CmRarityTier[] = [
  'common', 'uncommon', 'rare', 'epic', 'legendary',
]

const CM_XP_TABLE: number[] = Array.from({ length: CM_MAX_LEVEL + 1 }, (_, i) =>
  i === 0 ? 0 : Math.floor(90 * Math.pow(i, 1.4) + i * 35),
)

const CM_ACTION_POWER_BASE: Record<CmMineAction, number> = {
  swing: 10,
  dig: 20,
  blast: 50,
  excavate: 35,
}

const CM_ACTION_COIN_COST: Record<CmMineAction, number> = {
  swing: 0,
  dig: 5,
  blast: 25,
  excavate: 15,
}

const CM_ACTION_XP_REWARD: Record<CmMineAction, number> = {
  swing: 5,
  dig: 12,
  blast: 30,
  excavate: 20,
}

/* ================================================================
   TITLES (8)
   ================================================================ */

const CM_TITLES: CmTitle[] = [
  { id: 'novice-miner', name: 'Novice Miner', requiredLevel: 1, description: 'A fresh face in the crystal mines.', bonusXpPercent: 0, bonusCoinPercent: 0, color: '#a0a0a0' },
  { id: 'pick-scraper', name: 'Pick Scraper', requiredLevel: 5, description: 'Learned the basics of mineral identification.', bonusXpPercent: 5, bonusCoinPercent: 3, color: '#50C878' },
  { id: 'vein-seeker', name: 'Vein Seeker', requiredLevel: 10, description: 'Can trace crystal veins through solid rock.', bonusXpPercent: 10, bonusCoinPercent: 7, color: '#00CED1' },
  { id: 'gem-cutter', name: 'Gem Cutter', requiredLevel: 18, description: 'Skilled at extracting and shaping precious gems.', bonusXpPercent: 15, bonusCoinPercent: 12, color: '#9370DB' },
  { id: 'mine-foreman', name: 'Mine Foreman', requiredLevel: 25, description: 'Leads mining crews into the deepest caverns.', bonusXpPercent: 20, bonusCoinPercent: 16, color: '#E0115F' },
  { id: 'crystal-smith', name: 'Crystal Smith', requiredLevel: 33, description: 'Master craftsman who forges crystal into powerful equipment.', bonusXpPercent: 28, bonusCoinPercent: 22, color: '#FFBF00' },
  { id: 'depth-lord', name: 'Depth Lord', requiredLevel: 42, description: 'Rules over the deepest reaches of the mine.', bonusXpPercent: 38, bonusCoinPercent: 30, color: '#FF8C00' },
  { id: 'prismatic-sovereign', name: 'Prismatic Sovereign', requiredLevel: 50, description: 'The supreme ruler of all crystal domains.', bonusXpPercent: 50, bonusCoinPercent: 40, color: '#FFD700' },
]

/* ================================================================
   CRYSTALS (36 types)
   ================================================================ */

const CM_CRYSTALS: CmCrystal[] = [
  { id: 'quartz-shard', name: 'Quartz Shard', category: 'mineral', rarity: 'common', color: '#f5f5f5', glowIntensity: 0.1, xpReward: 8, sellPrice: 3, description: 'A basic quartz crystal found near the mine entrance.', craftUses: ['glass-lens', 'basic-pickaxe'], foundAt: ['entrance-hall', 'dusty-tunnel'] },
  { id: 'copper-nugget', name: 'Copper Nugget', category: 'ore', rarity: 'common', color: '#b87333', glowIntensity: 0, xpReward: 6, sellPrice: 4, description: 'A chunky copper nugget with a warm metallic sheen.', craftUses: ['copper-wire', 'reinforced-pick'], foundAt: ['entrance-hall', 'dusty-tunnel'] },
  { id: 'iron-ore', name: 'Iron Ore', category: 'ore', rarity: 'common', color: '#71797E', glowIntensity: 0, xpReward: 7, sellPrice: 5, description: 'Raw iron ore extracted from deep rock seams.', craftUses: ['steel-ingot', 'iron-pickaxe'], foundAt: ['dusty-tunnel', 'limestone-cavern'] },
  { id: 'calcite-crystal', name: 'Calcite Crystal', category: 'mineral', rarity: 'common', color: '#fcd5ce', glowIntensity: 0.05, xpReward: 9, sellPrice: 3, description: 'A pinkish calcite formation found in limestone caves.', craftUses: ['alkaline-solution', 'lime-powder'], foundAt: ['limestone-cavern'] },
  { id: 'coal-gem', name: 'Coal Gem', category: 'ore', rarity: 'common', color: '#2c2c2c', glowIntensity: 0, xpReward: 5, sellPrice: 2, description: 'Compressed coal that sparkles like a dark gemstone.', craftUses: ['fuel-brick', 'carbon-filter'], foundAt: ['entrance-hall', 'dusty-tunnel'] },
  { id: 'fluorite-chunk', name: 'Fluorite Chunk', category: 'gem', rarity: 'uncommon', color: '#a855f7', glowIntensity: 0.4, xpReward: 22, sellPrice: 12, description: 'Purple fluorite that glows under ultraviolet light.', craftUses: ['uv-lamp', 'prism-lens'], foundAt: ['limestone-cavern', 'crystal-grotto'] },
  { id: 'malachite-stone', name: 'Malachite Stone', category: 'mineral', rarity: 'uncommon', color: '#2ecc71', glowIntensity: 0.2, xpReward: 20, sellPrice: 14, description: 'Banded green malachite with swirling patterns.', craftUses: ['copper-extract', 'green-pigment'], foundAt: ['limestone-cavern', 'emerald-depths'] },
  { id: 'amber-fossil', name: 'Amber Fossil', category: 'fossil', rarity: 'uncommon', color: '#f39c12', glowIntensity: 0.3, xpReward: 25, sellPrice: 18, description: 'Ancient tree resin containing a perfectly preserved insect.', craftUses: ['ancient-essence', 'golden-varnish'], foundAt: ['emerald-depths', 'fossil-chamber'] },
  { id: 'sapphire-flake', name: 'Sapphire Flake', category: 'gem', rarity: 'uncommon', color: '#00CED1', glowIntensity: 0.5, xpReward: 28, sellPrice: 20, description: 'A brilliant blue sapphire flake from a deeper vein.', craftUses: ['blue-lens', 'water-resistant-coating'], foundAt: ['crystal-grotto', 'sapphire-shaft'] },
  { id: 'ruby-fragment', name: 'Ruby Fragment', category: 'gem', rarity: 'uncommon', color: '#E0115F', glowIntensity: 0.5, xpReward: 30, sellPrice: 22, description: 'A blood-red ruby fragment with inner fire.', craftUses: ['heat-resist-coating', 'crystal-blade'], foundAt: ['crystal-grotto', 'ruby-rift'] },
  { id: 'emerald-shard', name: 'Emerald Shard', category: 'gem', rarity: 'uncommon', color: '#50C878', glowIntensity: 0.45, xpReward: 26, sellPrice: 19, description: 'A vivid green emerald shard of remarkable clarity.', craftUses: ['healing-crystal', 'nature-amulet'], foundAt: ['emerald-depths'] },
  { id: 'topaz-grain', name: 'Topaz Grain', category: 'gem', rarity: 'uncommon', color: '#FFBF00', glowIntensity: 0.35, xpReward: 24, sellPrice: 17, description: 'A golden topaz grain that catches every light ray.', craftUses: ['light-amplifier', 'golden-shield'], foundAt: ['amber-tunnels'] },
  { id: 'amethyst-cluster', name: 'Amethyst Cluster', category: 'gem', rarity: 'rare', color: '#9370DB', glowIntensity: 0.6, xpReward: 50, sellPrice: 40, description: 'A beautiful cluster of deep purple amethyst crystals.', craftUses: ['mind-shield', 'psychic-amplifier', 'purple-dye'], foundAt: ['crystal-grotto', 'amethyst-cathedral'] },
  { id: 'obsidian-blade', name: 'Obsidian Blade', category: 'mineral', rarity: 'rare', color: '#1a1a2e', glowIntensity: 0.15, xpReward: 45, sellPrice: 35, description: 'Volcanic glass sharper than steel, forged by ancient heat.', craftUses: ['razor-tool', 'dark-mirror', 'cutting-blade'], foundAt: ['ruby-rift', 'lava-gallery'] },
  { id: 'aquamarine-gem', name: 'Aquamarine Gem', category: 'gem', rarity: 'rare', color: '#7fdbda', glowIntensity: 0.55, xpReward: 52, sellPrice: 42, description: 'A sea-blue aquamarine that whispers of ocean depths.', craftUses: ['water-purifier', 'breathing-crystal'], foundAt: ['sapphire-shaft', 'underground-lake'] },
  { id: 'garnet-deep', name: 'Deep Garnet', category: 'gem', rarity: 'rare', color: '#8b0000', glowIntensity: 0.5, xpReward: 48, sellPrice: 38, description: 'A dark garnet pulsing with inner warmth.', craftUses: ['fire-crystal', 'warm-stone', 'rage-amulet'], foundAt: ['ruby-rift', 'magma-chamber'] },
  { id: 'peridot-facet', name: 'Peridot Facet', category: 'gem', rarity: 'rare', color: '#a8e06e', glowIntensity: 0.45, xpReward: 46, sellPrice: 36, description: 'Olive-green peridot with an otherworldly glow.', craftUses: ['nature-elixir', 'growth-stimulant'], foundAt: ['emerald-depths'] },
  { id: 'tourmaline-rainbow', name: 'Rainbow Tourmaline', category: 'gem', rarity: 'rare', color: '#ff6b6b', glowIntensity: 0.6, xpReward: 55, sellPrice: 44, description: 'Tourmaline that shifts through every color of the spectrum.', craftUses: ['prism-shield', 'spectrum-analyzer'], foundAt: ['crystal-grotto', 'amethyst-cathedral'] },
  { id: 'titanium-ore', name: 'Titanium Ore', category: 'ore', rarity: 'rare', color: '#878681', glowIntensity: 0.1, xpReward: 42, sellPrice: 32, description: 'Lightweight but incredibly strong titanium deposits.', craftUses: ['titanium-alloy', 'reinforced-armor', 'drill-bit'], foundAt: ['magma-chamber', 'deep-forge'] },
  { id: 'moonstone-pearl', name: 'Moonstone Pearl', category: 'gem', rarity: 'epic', color: '#c8d6e5', glowIntensity: 0.7, xpReward: 90, sellPrice: 80, description: 'A luminous moonstone that stores moonlight energy.', craftUses: ['night-vision-crystal', 'lunar-battery', 'moonbeam-weapon'], foundAt: ['underground-lake', 'amethyst-cathedral'] },
  { id: 'opal-fire', name: 'Fire Opal', category: 'gem', rarity: 'epic', color: '#ff4500', glowIntensity: 0.75, xpReward: 95, sellPrice: 85, description: 'A blazing opal that seems to contain living flames.', craftUses: ['flame-core', 'explosive-crystal', 'inferno-amulet'], foundAt: ['magma-chamber', 'lava-gallery'] },
  { id: 'alexandrite-shift', name: 'Alexandrite', category: 'gem', rarity: 'epic', color: '#4B0082', glowIntensity: 0.8, xpReward: 100, sellPrice: 95, description: 'A color-shifting alexandrite that changes hue with the viewer.', craftUses: ['chameleon-armor', 'illusion-gem', 'shift-crystal'], foundAt: ['amethyst-cathedral', 'void-abyss'] },
  { id: 'star-sapphire', name: 'Star Sapphire', category: 'gem', rarity: 'epic', color: '#4169E1', glowIntensity: 0.7, xpReward: 92, sellPrice: 82, description: 'A sapphire with a perfect six-rayed star pattern within.', craftUses: ['navigation-crystal', 'stellar-compass', 'warp-gem'], foundAt: ['sapphire-shaft', 'void-abyss'] },
  { id: 'petrified-amber', name: 'Petrified Amber', category: 'fossil', rarity: 'epic', color: '#d4a017', glowIntensity: 0.6, xpReward: 88, sellPrice: 78, description: 'Amber millions of years old containing ancient life energy.', craftUses: ['time-crystal', 'revival-elixir'], foundAt: ['fossil-chamber', 'deep-forge'] },
  { id: 'platinum-vein', name: 'Platinum Vein', category: 'ore', rarity: 'epic', color: '#e5e4e2', glowIntensity: 0.3, xpReward: 85, sellPrice: 75, description: 'Rare platinum ore worth more than its weight in gold.', craftUses: ['platinum-ingot', 'eternal-tool', 'conductive-wire'], foundAt: ['deep-forge', 'void-abyss'] },
  { id: 'void-quartz', name: 'Void Quartz', category: 'mineral', rarity: 'epic', color: '#0f0f23', glowIntensity: 0.5, xpReward: 96, sellPrice: 88, description: 'Quartz that absorbs all light, creating a miniature void.', craftUses: ['dark-crystal', 'void-container', 'stealth-gem'], foundAt: ['void-abyss'] },
  { id: 'diamond-princess', name: 'Princess Diamond', category: 'gem', rarity: 'legendary', color: '#b9f2ff', glowIntensity: 0.95, xpReward: 200, sellPrice: 250, description: 'A flawless diamond of extraordinary size and brilliance.', craftUses: ['ultimate-lens', 'diamond-armor', 'prismatic-core'], foundAt: ['void-abyss'] },
  { id: 'tanzanite-prism', name: 'Tanzanite Prism', category: 'gem', rarity: 'legendary', color: '#7b68ee', glowIntensity: 0.9, xpReward: 210, sellPrice: 280, description: 'A trichroic tanzanite that splits light into three perfect beams.', craftUses: ['tri-beam-weapon', 'trinity-shield', 'prism-gate'], foundAt: ['amethyst-cathedral', 'void-abyss'] },
  { id: 'radiant-opal', name: 'Radiant Opal', category: 'gem', rarity: 'legendary', color: '#ff69b4', glowIntensity: 0.95, xpReward: 220, sellPrice: 300, description: 'An opal of impossible beauty that radiates pure energy.', craftUses: ['energy-core', 'radiant-armor', 'infinity-gem'], foundAt: ['void-abyss'] },
  { id: 'mythril-seam', name: 'Mythril Seam', category: 'ore', rarity: 'legendary', color: '#4fc3f7', glowIntensity: 0.85, xpReward: 195, sellPrice: 240, description: 'Mythical metal lighter than feather yet harder than diamond.', craftUses: ['mythril-ingot', 'legendary-weapon', 'divine-armor'], foundAt: ['deep-forge', 'void-abyss'] },
  { id: 'chronos-crystal', name: 'Chronos Crystal', category: 'essence', rarity: 'legendary', color: '#ffd700', glowIntensity: 1.0, xpReward: 250, sellPrice: 400, description: 'A crystal that pulses with the heartbeat of time itself.', craftUses: ['time-stop-device', 'rewind-crystal', 'eternity-ring'], foundAt: ['void-abyss'] },
  { id: 'soul-gem', name: 'Soul Gem', category: 'essence', rarity: 'legendary', color: '#da70d6', glowIntensity: 0.9, xpReward: 230, sellPrice: 350, description: 'Contains the essence of an ancient crystal spirit.', craftUses: ['spirit-weapon', 'soul-bind-armor', 'resurrection-crystal'], foundAt: ['amethyst-cathedral', 'void-abyss'] },
  { id: 'aurora-stone', name: 'Aurora Stone', category: 'essence', rarity: 'epic', color: '#00ff88', glowIntensity: 0.8, xpReward: 98, sellPrice: 90, description: 'A stone that mimics the colors of the northern lights.', craftUses: ['aurora-shield', 'prismatic-cloak'], foundAt: ['underground-lake'] },
  { id: 'volcanic-core', name: 'Volcanic Core', category: 'essence', rarity: 'rare', color: '#ff6347', glowIntensity: 0.65, xpReward: 58, sellPrice: 48, description: 'A fragment from the heart of an ancient volcano.', craftUses: ['heat-source', 'lava-pick'], foundAt: ['magma-chamber', 'lava-gallery'] },
  { id: 'glacial-shard', name: 'Glacial Shard', category: 'mineral', rarity: 'rare', color: '#e0ffff', glowIntensity: 0.5, xpReward: 44, sellPrice: 34, description: 'Never-melting ice crystal from a prehistoric glacier.', craftUses: ['freeze-core', 'ice-pick'], foundAt: ['underground-lake', 'sapphire-shaft'] },
]

/* ================================================================
   MINE LEVELS (8 depths)
   ================================================================ */

const CM_MINE_LEVELS: CmMineLevel[] = [
  { id: 'entrance-hall', name: 'Entrance Hall', depth: 1, description: 'A well-lit entrance tunnel with easy-to-reach surface deposits.', requiredLevel: 1, dangerLevel: 1, ambientColor: '#8B7355', unlockCost: 0, crystalIds: ['quartz-shard', 'copper-nugget', 'coal-gem'], creatureIds: ['cave-bat', 'dust-spider', 'rock-rat'], oreChance: 0.8, bossCreatureId: null },
  { id: 'dusty-tunnel', name: 'Dusty Tunnel', depth: 2, description: 'Narrow, dusty tunnels requiring basic mining equipment.', requiredLevel: 3, dangerLevel: 2, ambientColor: '#A0522D', unlockCost: 0, crystalIds: ['iron-ore', 'quartz-shard', 'coal-gem', 'copper-nugget'], creatureIds: ['tunnel-worm', 'dust-spider', 'crystal-mite'], oreChance: 0.7, bossCreatureId: null },
  { id: 'limestone-cavern', name: 'Limestone Cavern', depth: 3, description: 'Vast cavern of white limestone with mineral veins.', requiredLevel: 6, dangerLevel: 3, ambientColor: '#F5DEB3', unlockCost: 100, crystalIds: ['calcite-crystal', 'fluorite-chunk', 'malachite-stone', 'iron-ore'], creatureIds: ['cave-beetle', 'stalactite-golem', 'blind-salamander'], oreChance: 0.6, bossCreatureId: null },
  { id: 'crystal-grotto', name: 'Crystal Grotto', depth: 4, description: 'A breathtaking grotto filled with colorful crystal formations.', requiredLevel: 10, dangerLevel: 4, ambientColor: '#9370DB', unlockCost: 250, crystalIds: ['sapphire-flake', 'ruby-fragment', 'amethyst-cluster', 'fluorite-chunk', 'tourmaline-rainbow'], creatureIds: ['crystal-sprite', 'gem-moth', 'prism-scorpion'], oreChance: 0.5, bossCreatureId: null },
  { id: 'emerald-depths', name: 'Emerald Depths', depth: 5, description: 'A verdant underground layer rich with emeralds and fossils.', requiredLevel: 15, dangerLevel: 5, ambientColor: '#50C878', unlockCost: 500, crystalIds: ['emerald-shard', 'amber-fossil', 'malachite-stone', 'peridot-facet', 'volcanic-core'], creatureIds: ['emerald-wyrm', 'fossil-guardian', 'vine-serpent'], oreChance: 0.4, bossCreatureId: 'emerald-wyrm' },
  { id: 'sapphire-shaft', name: 'Sapphire Shaft', depth: 6, description: 'A vertical shaft descending into sapphire-rich strata.', requiredLevel: 20, dangerLevel: 6, ambientColor: '#00CED1', unlockCost: 800, crystalIds: ['aquamarine-gem', 'star-sapphire', 'glacial-shard', 'aurora-stone'], creatureIds: ['depth-crab', 'sapphire-drake', 'abyssal-jellyfish'], oreChance: 0.35, bossCreatureId: 'sapphire-drake' },
  { id: 'magma-chamber', name: 'Magma Chamber', depth: 7, description: 'Scorching tunnels near volcanic activity with rare ore deposits.', requiredLevel: 28, dangerLevel: 7, ambientColor: '#E0115F', unlockCost: 1500, crystalIds: ['garnet-deep', 'obsidian-blade', 'titanium-ore', 'opal-fire'], creatureIds: ['magma-slug', 'fire-elemental', 'lava-titan', 'ember-wraith'], oreChance: 0.3, bossCreatureId: 'lava-titan' },
  { id: 'void-abyss', name: 'Void Abyss', depth: 8, description: 'The deepest, most dangerous level where legendary crystals await.', requiredLevel: 38, dangerLevel: 9, ambientColor: '#0f0f23', unlockCost: 3000, crystalIds: ['diamond-princess', 'tanzanite-prism', 'radiant-opal', 'mythril-seam', 'chronos-crystal', 'soul-gem', 'void-quartz', 'alexandrite-shift', 'platinum-vein', 'petrified-amber', 'moonstone-pearl'], creatureIds: ['void-wraith', 'crystal-colossus', 'abyss-worm', 'shadow-stalker'], oreChance: 0.15, bossCreatureId: 'crystal-colossus' },
]

/* ================================================================
   CREATURES (24 species)
   ================================================================ */

const CM_CREATURES: CmCreature[] = [
  { id: 'cave-bat', name: 'Cave Bat', type: 'passive', hp: 20, damage: 2, xpReward: 8, coinDrop: 3, description: 'Small, harmless bats that roost in the mine entrance.', crystalDrop: 'quartz-shard', tameable: true, tamedBonus: 'Echo location reveals nearby crystals', color: '#5c4033' },
  { id: 'dust-spider', name: 'Dust Spider', type: 'neutral', hp: 35, damage: 8, xpReward: 12, coinDrop: 5, description: 'Pale spiders that spin webs across tunnel ceilings.', crystalDrop: 'calcite-crystal', tameable: false, tamedBonus: '', color: '#c4b09a' },
  { id: 'rock-rat', name: 'Rock Rat', type: 'neutral', hp: 25, damage: 5, xpReward: 10, coinDrop: 4, description: 'Tough rats that gnaw through stone seeking minerals.', crystalDrop: 'copper-nugget', tameable: true, tamedBonus: 'Detects nearby ore veins', color: '#8B7355' },
  { id: 'tunnel-worm', name: 'Tunnel Worm', type: 'hostile', hp: 60, damage: 12, xpReward: 22, coinDrop: 10, description: 'Aggressive worms that burrow through mine walls.', crystalDrop: 'iron-ore', tameable: false, tamedBonus: '', color: '#a0522d' },
  { id: 'crystal-mite', name: 'Crystal Mite', type: 'passive', hp: 15, damage: 0, xpReward: 8, coinDrop: 2, description: 'Tiny mites that feed on mineral deposits harmlessly.', crystalDrop: 'fluorite-chunk', tameable: true, tamedBonus: 'Bonus crystal discovery rate', color: '#a855f7' },
  { id: 'cave-beetle', name: 'Cave Beetle', type: 'neutral', hp: 50, damage: 10, xpReward: 18, coinDrop: 8, description: 'Armored beetles with crystal growths on their shells.', crystalDrop: 'malachite-stone', tameable: true, tamedBonus: 'Bonus mining defense', color: '#2ecc71' },
  { id: 'stalactite-golem', name: 'Stalactite Golem', type: 'hostile', hp: 120, damage: 20, xpReward: 40, coinDrop: 20, description: 'Golem formed from fallen stalactites, slow but powerful.', crystalDrop: 'calcite-crystal', tameable: false, tamedBonus: '', color: '#f5deb3' },
  { id: 'blind-salamander', name: 'Blind Salamander', type: 'passive', hp: 30, damage: 0, xpReward: 15, coinDrop: 6, description: 'Pale amphibians that sense vibrations in underground pools.', crystalDrop: 'aquamarine-gem', tameable: true, tamedBonus: 'Improved underwater mining', color: '#ffe4c4' },
  { id: 'crystal-sprite', name: 'Crystal Sprite', type: 'passive', hp: 18, damage: 0, xpReward: 20, coinDrop: 8, description: 'Tiny glowing sprites born from concentrated crystal energy.', crystalDrop: 'amethyst-cluster', tameable: true, tamedBonus: 'Bonus XP from crystal harvesting', color: '#dda0dd' },
  { id: 'gem-moth', name: 'Gem Moth', type: 'passive', hp: 22, damage: 0, xpReward: 18, coinDrop: 7, description: 'Moths with wings that refract light like gem facets.', crystalDrop: 'sapphire-flake', tameable: true, tamedBonus: 'Increased rare crystal chance', color: '#00CED1' },
  { id: 'prism-scorpion', name: 'Prism Scorpion', type: 'hostile', hp: 80, damage: 18, xpReward: 35, coinDrop: 15, description: 'Crystalline scorpion with a venomous prismatic stinger.', crystalDrop: 'ruby-fragment', tameable: false, tamedBonus: '', color: '#E0115F' },
  { id: 'emerald-wyrm', name: 'Emerald Wyrm', type: 'boss', hp: 400, damage: 35, xpReward: 200, coinDrop: 100, description: 'A massive serpentine creature made of living emerald crystal.', crystalDrop: 'emerald-shard', tameable: false, tamedBonus: '', color: '#50C878' },
  { id: 'fossil-guardian', name: 'Fossil Guardian', type: 'neutral', hp: 100, damage: 15, xpReward: 32, coinDrop: 14, description: 'Animated fossil that guards ancient amber deposits.', crystalDrop: 'amber-fossil', tameable: true, tamedBonus: 'Bonus fossil discovery', color: '#f39c12' },
  { id: 'vine-serpent', name: 'Vine Serpent', type: 'hostile', hp: 90, damage: 22, xpReward: 38, coinDrop: 16, description: 'Serpent woven from underground roots and crystal vines.', crystalDrop: 'peridot-facet', tameable: false, tamedBonus: '', color: '#6b8e23' },
  { id: 'depth-crab', name: 'Depth Crab', type: 'neutral', hp: 70, damage: 14, xpReward: 28, coinDrop: 12, description: 'Armored crabs dwelling near underground lakes.', crystalDrop: 'aquamarine-gem', tameable: true, tamedBonus: 'Aquatic mining speed boost', color: '#4169E1' },
  { id: 'sapphire-drake', name: 'Sapphire Drake', type: 'boss', hp: 550, damage: 40, xpReward: 280, coinDrop: 150, description: 'A draconic creature with scales of pure sapphire.', crystalDrop: 'star-sapphire', tameable: false, tamedBonus: '', color: '#00CED1' },
  { id: 'abyssal-jellyfish', name: 'Abyssal Jellyfish', type: 'hostile', hp: 45, damage: 25, xpReward: 30, coinDrop: 11, description: 'Translucent jellyfish that deliver stunning shocks.', crystalDrop: 'glacial-shard', tameable: false, tamedBonus: '', color: '#87CEEB' },
  { id: 'magma-slug', name: 'Magma Slug', type: 'neutral', hp: 65, damage: 16, xpReward: 25, coinDrop: 10, description: 'Slugs trailing molten rock, found near volcanic vents.', crystalDrop: 'garnet-deep', tameable: true, tamedBonus: 'Heat resistance bonus', color: '#ff4500' },
  { id: 'fire-elemental', name: 'Fire Elemental', type: 'hostile', hp: 110, damage: 28, xpReward: 42, coinDrop: 18, description: 'Pure flame given form by the heat of deep magma.', crystalDrop: 'opal-fire', tameable: false, tamedBonus: '', color: '#ff6347' },
  { id: 'lava-titan', name: 'Lava Titan', type: 'boss', hp: 750, damage: 50, xpReward: 400, coinDrop: 250, description: 'A colossal being of molten rock and obsidian.', crystalDrop: 'obsidian-blade', tameable: false, tamedBonus: '', color: '#E0115F' },
  { id: 'ember-wraith', name: 'Ember Wraith', type: 'hostile', hp: 85, damage: 22, xpReward: 36, coinDrop: 15, description: 'Ghostly figure formed from dying volcanic embers.', crystalDrop: 'volcanic-core', tameable: false, tamedBonus: '', color: '#ff8c00' },
  { id: 'void-wraith', name: 'Void Wraith', type: 'hostile', hp: 130, damage: 32, xpReward: 48, coinDrop: 22, description: 'Spectral entity from the void between dimensions.', crystalDrop: 'void-quartz', tameable: false, tamedBonus: '', color: '#0f0f23' },
  { id: 'crystal-colossus', name: 'Crystal Colossus', type: 'boss', hp: 1000, damage: 60, xpReward: 600, coinDrop: 400, description: 'An ancient golem of fused legendary crystals. The ultimate mine guardian.', crystalDrop: 'diamond-princess', tameable: false, tamedBonus: '', color: '#FFD700' },
  { id: 'abyss-worm', name: 'Abyss Worm', type: 'hostile', hp: 95, damage: 26, xpReward: 44, coinDrop: 20, description: 'Gigantic worm that devours anything in the deepest tunnels.', crystalDrop: 'chronos-crystal', tameable: false, tamedBonus: '', color: '#191970' },
]

/* ================================================================
   EQUIPMENT (22 pieces)
   ================================================================ */

const CM_EQUIPMENT: CmEquipment[] = [
  { id: 'wooden-pickaxe', name: 'Wooden Pickaxe', type: 'tool', rarity: 'common', power: 5, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 20, description: 'A simple pickaxe for beginner miners.', miningBonus: 3, defenseBonus: 0, color: '#8B4513' },
  { id: 'copper-pickaxe', name: 'Copper Pickaxe', type: 'tool', rarity: 'common', power: 10, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 30, description: 'A copper-headed pickaxe with decent durability.', miningBonus: 6, defenseBonus: 0, color: '#b87333' },
  { id: 'iron-pickaxe', name: 'Iron Pickaxe', type: 'tool', rarity: 'uncommon', power: 18, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'Sturdy iron pickaxe for intermediate mining.', miningBonus: 12, defenseBonus: 0, color: '#71797E' },
  { id: 'steel-pickaxe', name: 'Steel Pickaxe', type: 'tool', rarity: 'uncommon', power: 25, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 80, description: 'A high-quality steel pickaxe with reinforced handle.', miningBonus: 18, defenseBonus: 0, color: '#708090' },
  { id: 'crystal-pickaxe', name: 'Crystal Pickaxe', type: 'tool', rarity: 'rare', power: 38, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 150, description: 'A pickaxe with crystal-tipped edges that cut through stone.', miningBonus: 28, defenseBonus: 2, color: '#9370DB' },
  { id: 'diamond-drill', name: 'Diamond Drill', type: 'tool', rarity: 'epic', power: 55, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 350, description: 'Industrial drill tipped with diamond shards.', miningBonus: 42, defenseBonus: 5, color: '#b9f2ff' },
  { id: 'mythril-excavator', name: 'Mythril Excavator', type: 'tool', rarity: 'legendary', power: 80, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 800, description: 'The ultimate mining tool forged from mythril.', miningBonus: 65, defenseBonus: 10, color: '#4fc3f7' },
  { id: 'leather-vest', name: 'Leather Vest', type: 'armor', rarity: 'common', power: 8, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 20, description: 'Basic leather protection for shallow mining.', miningBonus: 0, defenseBonus: 8, color: '#8B4513' },
  { id: 'chainmail', name: 'Chainmail', type: 'armor', rarity: 'uncommon', power: 16, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 50, description: 'Interlocking metal rings provide solid protection.', miningBonus: 2, defenseBonus: 16, color: '#708090' },
  { id: 'crystal-plate', name: 'Crystal Plate Armor', type: 'armor', rarity: 'rare', power: 30, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 120, description: 'Armor reinforced with crystal plating.', miningBonus: 5, defenseBonus: 30, color: '#9370DB' },
  { id: 'obsidian-suit', name: 'Obsidian Hazard Suit', type: 'armor', rarity: 'epic', power: 48, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 280, description: 'Near-impenetrable obsidian plating with heat shielding.', miningBonus: 8, defenseBonus: 48, color: '#1a1a2e' },
  { id: 'mythril-warplate', name: 'Mythril Warplate', type: 'armor', rarity: 'legendary', power: 70, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 700, description: 'Legendary armor lighter than cloth yet stronger than steel.', miningBonus: 12, defenseBonus: 70, color: '#4fc3f7' },
  { id: 'mining-helmet', name: 'Mining Helmet', type: 'helmet', rarity: 'common', power: 5, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 15, description: 'A helmet with a built-in lamp for dark tunnels.', miningBonus: 2, defenseBonus: 5, color: '#FFD700' },
  { id: 'gem-lens-helm', name: 'Gem Lens Helm', type: 'helmet', rarity: 'rare', power: 20, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'Helmet with gemstone lenses that reveal hidden crystals.', miningBonus: 15, defenseBonus: 12, color: '#00CED1' },
  { id: 'crown-of-depths', name: 'Crown of Depths', type: 'helmet', rarity: 'legendary', power: 45, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 600, description: 'Ancient crown that grants mastery over underground realms.', miningBonus: 25, defenseBonus: 25, color: '#FFD700' },
  { id: 'rock-boots', name: 'Rock Boots', type: 'boots', rarity: 'common', power: 4, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 15, description: 'Sturdy boots with steel-reinforced toes.', miningBonus: 0, defenseBonus: 4, color: '#5c4033' },
  { id: 'crystal-greaves', name: 'Crystal Greaves', type: 'boots', rarity: 'rare', power: 18, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 90, description: 'Greaves embedded with crystals for stability on rough terrain.', miningBonus: 5, defenseBonus: 18, color: '#50C878' },
  { id: 'void-striders', name: 'Void Striders', type: 'boots', rarity: 'legendary', power: 40, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 550, description: 'Boots that let the wearer walk on any surface, even void.', miningBonus: 15, defenseBonus: 30, color: '#191970' },
  { id: 'dynamite-stick', name: 'Dynamite Pack', type: 'weapon', rarity: 'uncommon', power: 22, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 50, description: 'Blast through stubborn rock walls with explosive force.', miningBonus: 10, defenseBonus: 0, color: '#ff4500' },
  { id: 'crystal-cannon', name: 'Crystal Cannon', type: 'weapon', rarity: 'epic', power: 42, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 250, description: 'Fires concentrated crystal beams that shatter anything.', miningBonus: 20, defenseBonus: 3, color: '#E0115F' },
  { id: 'depth-blade', name: 'Depth Blade', type: 'weapon', rarity: 'rare', power: 32, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 130, description: 'A sword enchanted to cut through earth and crystal alike.', miningBonus: 12, defenseBonus: 5, color: '#4B0082' },
  { id: 'prismatic-buster', name: 'Prismatic Buster', type: 'weapon', rarity: 'legendary', power: 65, level: 1, maxLevel: CM_EQUIPMENT_MAX_LEVEL, upgradeCost: 750, description: 'Ultimate weapon that channels all crystal energies into devastation.', miningBonus: 35, defenseBonus: 8, color: '#FFD700' },
]

/* ================================================================
   RECIPES (28)
   ================================================================ */

const CM_RECIPES: CmRecipe[] = [
  { id: 'craft-copper-wire', name: 'Copper Wire', description: 'Twist copper nuggets into useful wire.', ingredients: [{ crystalId: 'copper-nugget', count: 3 }], requiredCoins: 10, requiredLevel: 1, rarity: 'common', resultType: 'equipment', resultId: 'copper-pickaxe', xpReward: 15, color: '#b87333' },
  { id: 'craft-basic-pick', name: 'Basic Pickaxe', description: 'A simple wooden pickaxe for starters.', ingredients: [{ crystalId: 'quartz-shard', count: 2 }, { crystalId: 'coal-gem', count: 1 }], requiredCoins: 15, requiredLevel: 1, rarity: 'common', resultType: 'equipment', resultId: 'wooden-pickaxe', xpReward: 12, color: '#8B4513' },
  { id: 'craft-glass-lens', name: 'Glass Lens', description: 'Melt quartz into a clear lens for lamps.', ingredients: [{ crystalId: 'quartz-shard', count: 5 }], requiredCoins: 20, requiredLevel: 2, rarity: 'common', resultType: 'boost', resultId: 'mine-light', xpReward: 18, color: '#f5f5f5' },
  { id: 'craft-steel-ingot', name: 'Steel Ingot', description: 'Smelt iron with coal to produce steel.', ingredients: [{ crystalId: 'iron-ore', count: 3 }, { crystalId: 'coal-gem', count: 2 }], requiredCoins: 30, requiredLevel: 4, rarity: 'uncommon', resultType: 'equipment', resultId: 'iron-pickaxe', xpReward: 35, color: '#708090' },
  { id: 'craft-uv-lamp', name: 'UV Lantern', description: 'Powerful lantern using fluorite illumination.', ingredients: [{ crystalId: 'fluorite-chunk', count: 3 }, { crystalId: 'copper-nugget', count: 2 }], requiredCoins: 40, requiredLevel: 5, rarity: 'uncommon', resultType: 'boost', resultId: 'reveal-crystals', xpReward: 42, color: '#a855f7' },
  { id: 'craft-green-pigment', name: 'Emerald Dye', description: 'Crush malachite into vibrant green pigment.', ingredients: [{ crystalId: 'malachite-stone', count: 4 }], requiredCoins: 25, requiredLevel: 6, rarity: 'uncommon', resultType: 'boost', resultId: 'xp-boost', xpReward: 38, color: '#2ecc71' },
  { id: 'craft-prism-lens', name: 'Prism Lens', description: 'Cut fluorite into a focusing prism.', ingredients: [{ crystalId: 'fluorite-chunk', count: 2 }, { crystalId: 'quartz-shard', count: 3 }], requiredCoins: 50, requiredLevel: 7, rarity: 'uncommon', resultType: 'boost', resultId: 'rare-find', xpReward: 45, color: '#dda0dd' },
  { id: 'craft-ancient-essence', name: 'Ancient Essence Extract', description: 'Extract life essence from amber fossils.', ingredients: [{ crystalId: 'amber-fossil', count: 2 }], requiredCoins: 60, requiredLevel: 8, rarity: 'uncommon', resultType: 'boost', resultId: 'time-boost', xpReward: 50, color: '#f39c12' },
  { id: 'craft-blue-lens', name: 'Sapphire Lens', description: 'Polish sapphire into a lens of clarity.', ingredients: [{ crystalId: 'sapphire-flake', count: 3 }], requiredCoins: 70, requiredLevel: 10, rarity: 'rare', resultType: 'boost', resultId: 'depth-vision', xpReward: 60, color: '#00CED1' },
  { id: 'craft-crystal-blade', name: 'Ruby Crystal Blade', description: 'Forge a blade from ruby fragments.', ingredients: [{ crystalId: 'ruby-fragment', count: 3 }, { crystalId: 'iron-ore', count: 2 }], requiredCoins: 80, requiredLevel: 11, rarity: 'rare', resultType: 'equipment', resultId: 'depth-blade', xpReward: 68, color: '#E0115F' },
  { id: 'craft-healing-crystal', name: 'Emerald Healing Crystal', description: 'Shape emerald into a crystal that restores vitality.', ingredients: [{ crystalId: 'emerald-shard', count: 3 }], requiredCoins: 90, requiredLevel: 12, rarity: 'rare', resultType: 'boost', resultId: 'heal-boost', xpReward: 65, color: '#50C878' },
  { id: 'craft-mind-shield', name: 'Amethyst Mind Shield', description: 'Create a psychic barrier from amethyst.', ingredients: [{ crystalId: 'amethyst-cluster', count: 2 }], requiredCoins: 100, requiredLevel: 14, rarity: 'rare', resultType: 'boost', resultId: 'defense-boost', xpReward: 72, color: '#9370DB' },
  { id: 'craft-razor-tool', name: 'Obsidian Razor Set', description: 'Shape obsidian into precision cutting tools.', ingredients: [{ crystalId: 'obsidian-blade', count: 2 }], requiredCoins: 110, requiredLevel: 16, rarity: 'rare', resultType: 'equipment', resultId: 'crystal-pickaxe', xpReward: 78, color: '#1a1a2e' },
  { id: 'craft-prism-shield', name: 'Prism Shield', description: 'Forge a shield from rainbow tourmaline.', ingredients: [{ crystalId: 'tourmaline-rainbow', count: 2 }, { crystalId: 'iron-ore', count: 3 }], requiredCoins: 130, requiredLevel: 18, rarity: 'rare', resultType: 'equipment', resultId: 'crystal-plate', xpReward: 85, color: '#ff6b6b' },
  { id: 'craft-water-purifier', name: 'Aquamarine Water Filter', description: 'Build a water purification system.', ingredients: [{ crystalId: 'aquamarine-gem', count: 2 }, { crystalId: 'glacial-shard', count: 1 }], requiredCoins: 120, requiredLevel: 20, rarity: 'rare', resultType: 'boost', resultId: 'stamina-boost', xpReward: 82, color: '#7fdbda' },
  { id: 'craft-fire-crystal', name: 'Garnet Fire Core', description: 'Extract fire essence from deep garnet.', ingredients: [{ crystalId: 'garnet-deep', count: 2 }, { crystalId: 'obsidian-blade', count: 1 }], requiredCoins: 150, requiredLevel: 22, rarity: 'epic', resultType: 'boost', resultId: 'blast-boost', xpReward: 100, color: '#8b0000' },
  { id: 'craft-titanium-alloy', name: 'Titanium Alloy Plate', description: 'Forge titanium ore into armor plating.', ingredients: [{ crystalId: 'titanium-ore', count: 3 }, { crystalId: 'coal-gem', count: 5 }], requiredCoins: 200, requiredLevel: 25, rarity: 'epic', resultType: 'equipment', resultId: 'obsidian-suit', xpReward: 120, color: '#878681' },
  { id: 'craft-moonbeam-weapon', name: 'Moonstone Beam Emitter', description: 'Focus moonstone energy into a directed beam.', ingredients: [{ crystalId: 'moonstone-pearl', count: 2 }], requiredCoins: 220, requiredLevel: 28, rarity: 'epic', resultType: 'equipment', resultId: 'crystal-cannon', xpReward: 130, color: '#c8d6e5' },
  { id: 'craft-flame-core', name: 'Opal Flame Core', description: 'Extract the living fire from a fire opal.', ingredients: [{ crystalId: 'opal-fire', count: 2 }, { crystalId: 'volcanic-core', count: 1 }], requiredCoins: 250, requiredLevel: 30, rarity: 'epic', resultType: 'boost', resultId: 'excavate-boost', xpReward: 140, color: '#ff4500' },
  { id: 'craft-shift-crystal', name: 'Alexandrite Shift Crystal', description: 'Harness the color-shifting power of alexandrite.', ingredients: [{ crystalId: 'alexandrite-shift', count: 2 }], requiredCoins: 280, requiredLevel: 33, rarity: 'epic', resultType: 'boost', resultId: 'rarity-boost', xpReward: 150, color: '#4B0082' },
  { id: 'craft-stellar-compass', name: 'Star Sapphire Compass', description: 'Navigate using the star within a sapphire.', ingredients: [{ crystalId: 'star-sapphire', count: 2 }, { crystalId: 'titanium-ore', count: 1 }], requiredCoins: 260, requiredLevel: 35, rarity: 'epic', resultType: 'boost', resultId: 'map-reveal', xpReward: 145, color: '#4169E1' },
  { id: 'craft-time-crystal', name: 'Time Crystal Device', description: 'Build a device that slows time using petrified amber.', ingredients: [{ crystalId: 'petrified-amber', count: 2 }], requiredCoins: 300, requiredLevel: 38, rarity: 'epic', resultType: 'boost', resultId: 'time-stop', xpReward: 160, color: '#d4a017' },
  { id: 'craft-diamond-armor', name: 'Diamond Plating', description: 'Apply diamond to armor for ultimate protection.', ingredients: [{ crystalId: 'diamond-princess', count: 1 }, { crystalId: 'mythril-seam', count: 2 }], requiredCoins: 500, requiredLevel: 40, rarity: 'legendary', resultType: 'equipment', resultId: 'mythril-warplate', xpReward: 250, color: '#b9f2ff' },
  { id: 'craft-prismatic-core', name: 'Prismatic Energy Core', description: 'Create a core that channels all crystal types.', ingredients: [{ crystalId: 'diamond-princess', count: 1 }, { crystalId: 'radiant-opal', count: 1 }, { crystalId: 'tanzanite-prism', count: 1 }], requiredCoins: 600, requiredLevel: 42, rarity: 'legendary', resultType: 'equipment', resultId: 'prismatic-buster', xpReward: 300, color: '#FFD700' },
  { id: 'craft-mythril-ingot', name: 'Mythril Ingot', description: 'Smelt mythril ore into usable ingots.', ingredients: [{ crystalId: 'mythril-seam', count: 3 }], requiredCoins: 400, requiredLevel: 38, rarity: 'legendary', resultType: 'equipment', resultId: 'mythril-excavator', xpReward: 220, color: '#4fc3f7' },
  { id: 'craft-dark-crystal', name: 'Void Dark Crystal', description: 'Condense void quartz into a dark energy crystal.', ingredients: [{ crystalId: 'void-quartz', count: 2 }], requiredCoins: 320, requiredLevel: 36, rarity: 'epic', resultType: 'boost', resultId: 'stealth-boost', xpReward: 155, color: '#0f0f23' },
  { id: 'craft-eternal-tool', name: 'Platinum Eternal Tool', description: 'Forge a tool that never dulls from platinum.', ingredients: [{ crystalId: 'platinum-vein', count: 2 }, { crystalId: 'titanium-ore', count: 1 }], requiredCoins: 350, requiredLevel: 37, rarity: 'epic', resultType: 'equipment', resultId: 'diamond-drill', xpReward: 170, color: '#e5e4e2' },
  { id: 'craft-infinity-gem', name: 'Infinity Gem', description: 'The ultimate synthesis of radiant opal energy.', ingredients: [{ crystalId: 'radiant-opal', count: 2 }, { crystalId: 'chronos-crystal', count: 1 }], requiredCoins: 700, requiredLevel: 45, rarity: 'legendary', resultType: 'crystal', resultId: 'radiant-opal', xpReward: 350, color: '#ff69b4' },
]

/* ================================================================
   ACHIEVEMENTS (18)
   ================================================================ */

const CM_ACHIEVEMENTS: CmAchievement[] = [
  { id: 'first-swing', name: 'First Swing', description: 'Perform your first mining action.', condition: 'miningActionsCount >= 1', reward: { type: 'xp', value: 20 }, icon: '⛏️', color: '#8B7355' },
  { id: 'crystal-novice', name: 'Crystal Novice', description: 'Mine 10 crystals.', condition: 'totalCrystalsMined >= 10', reward: { type: 'xp', value: 50 }, icon: '💎', color: '#00CED1' },
  { id: 'ore-hoarder', name: 'Ore Hoarder', description: 'Mine 50 crystals total.', condition: 'totalCrystalsMined >= 50', reward: { type: 'coins', value: 100 }, icon: '💰', color: '#FFBF00' },
  { id: 'crystal-master', name: 'Crystal Master', description: 'Mine 200 crystals total.', condition: 'totalCrystalsMined >= 200', reward: { type: 'coins', value: 500 }, icon: '🏆', color: '#FFD700' },
  { id: 'rare-find', name: 'Rare Find', description: 'Mine your first rare crystal.', condition: 'totalRareMined >= 1', reward: { type: 'xp', value: 80 }, icon: '✨', color: '#00CED1' },
  { id: 'legendary-miner', name: 'Legendary Miner', description: 'Mine a legendary crystal.', condition: 'totalLegendaryMined >= 1', reward: { type: 'coins', value: 300 }, icon: '🌟', color: '#FFD700' },
  { id: 'deep-delver', name: 'Deep Delver', description: 'Reach mine depth 5.', condition: 'deepestMineReached >= 5', reward: { type: 'xp', value: 120 }, icon: '🔽', color: '#50C878' },
  { id: 'void-walker', name: 'Void Walker', description: 'Reach mine depth 8.', condition: 'deepestMineReached >= 8', reward: { type: 'coins', value: 500 }, icon: '🕳️', color: '#0f0f23' },
  { id: 'creature-hunter', name: 'Creature Hunter', description: 'Defeat 10 creatures.', condition: 'totalCreaturesDefeated >= 10', reward: { type: 'xp', value: 60 }, icon: '⚔️', color: '#E0115F' },
  { id: 'boss-slayer', name: 'Boss Slayer', description: 'Defeat your first mine boss.', condition: 'totalBossesDefeated >= 1', reward: { type: 'coins', value: 200 }, icon: '👑', color: '#FFD700' },
  { id: 'creature-friend', name: 'Creature Friend', description: 'Tame 3 cave creatures.', condition: 'totalCreaturesTamed >= 3', reward: { type: 'xp', value: 100 }, icon: '🐾', color: '#50C878' },
  { id: 'first-craft', name: 'Apprentice Smith', description: 'Complete your first craft recipe.', condition: 'totalCrafted >= 1', reward: { type: 'xp', value: 40 }, icon: '🔨', color: '#878681' },
  { id: 'master-smith', name: 'Master Smith', description: 'Complete 20 crafting recipes.', condition: 'totalCrafted >= 20', reward: { type: 'coins', value: 400 }, icon: '⚒️', color: '#FFBF00' },
  { id: 'fusion-start', name: 'First Fusion', description: 'Synthesize your first crystal.', condition: 'totalSynthesized >= 1', reward: { type: 'xp', value: 50 }, icon: '🔮', color: '#9370DB' },
  { id: 'cart-upgrade', name: 'Cart Master', description: 'Upgrade mine cart to max capacity.', condition: 'mineCartLevel >= 10', reward: { type: 'coins', value: 300 }, icon: '🛒', color: '#b87333' },
  { id: 'expedition-veteran', name: 'Expedition Veteran', description: 'Complete 10 mining expeditions.', condition: 'totalExpeditions >= 10', reward: { type: 'xp', value: 150 }, icon: '🗺️', color: '#4169E1' },
  { id: 'streak-7', name: 'Weekly Miner', description: 'Maintain a 7-day mining streak.', condition: 'dailyStreak >= 7', reward: { type: 'coins', value: 200 }, icon: '📅', color: '#00CED1' },
  { id: 'level-50', name: 'Crystal Apex', description: 'Reach the maximum level of 50.', condition: 'level >= 50', reward: { type: 'coins', value: 2000 }, icon: '🏅', color: '#FFD700' },
]

/* ================================================================
   EVENTS (6 types)
   ================================================================ */

const CM_EVENTS: CmEvent[] = [
  { id: 'crystal-surge', name: 'Crystal Surge', type: 'crystal_surge', description: 'A surge of crystal energy increases spawn rates for rare crystals!', duration: 1800000, effect: 'rarity_boost', effectValue: 2, color: '#50C878' },
  { id: 'cave-in', name: 'Cave-In!', type: 'cave_in', description: 'A cave-in has occurred! Mining actions cost double but rewards triple.', duration: 900000, effect: 'risk_reward', effectValue: 3, color: '#E0115F' },
  { id: 'gem-exhibition', name: 'Gem Exhibition', type: 'gem_exhibition', description: 'Sell prices for all gems are doubled during the exhibition.', duration: 3600000, effect: 'sell_boost', effectValue: 2, color: '#FFBF00' },
  { id: 'lucky-strike', name: 'Lucky Strike', type: 'lucky_strike', description: 'Fortune smiles! Every mining action has a chance to find bonus coins.', duration: 1200000, effect: 'coin_bonus', effectValue: 50, color: '#FFD700' },
  { id: 'ore-vein', name: 'Ore Vein Discovery', type: 'ore_vein', description: 'A massive ore vein discovered! Ore mining yields are greatly increased.', duration: 2400000, effect: 'ore_boost', effectValue: 2.5, color: '#b87333' },
  { id: 'tremor', name: 'Mine Tremor', type: 'tremor', description: 'Tremors shake the mine! Creatures are disturbed but hidden crystals are revealed.', duration: 600000, effect: 'creature_alert', effectValue: 1.5, color: '#ff4500' },
]

/* ================================================================
   INITIAL STATE
   ================================================================ */

const CM_INITIAL_STATE: CmGameState = {
  level: 1,
  xp: 0,
  totalXp: 0,
  coins: CM_INITIAL_COINS,
  totalCoinsEarned: CM_INITIAL_COINS,
  inventory: [],
  equipment: [
    { equipmentId: 'wooden-pickaxe', level: 1, equipped: false },
    { equipmentId: 'leather-vest', level: 1, equipped: true },
    { equipmentId: 'mining-helmet', level: 1, equipped: true },
  ],
  equippedWeapon: null,
  equippedArmor: 'leather-vest',
  equippedTool: null,
  creatures: [],
  mines: [
    { mineId: 'entrance-hall', explored: true, explorationPercent: 0, totalMined: 0, bossDefeated: false },
  ],
  achievements: [],
  currentMineId: 'entrance-hall',
  currentTitleId: 'novice-miner',
  activeEvents: [],
  mineCart: {
    capacity: CM_MINE_CART_BASE_CAPACITY,
    currentLoad: 0,
    crystalIds: [],
    upgradeLevel: 0,
    maxUpgradeLevel: CM_MINE_CART_MAX_UPGRADE,
  },
  expedition: null,
  synthesisSlots: [
    { slotId: 0, crystalId1: null, crystalId2: null, resultCrystalId: null, startedAt: null, finishTime: null },
    { slotId: 1, crystalId1: null, crystalId2: null, resultCrystalId: null, startedAt: null, finishTime: null },
    { slotId: 2, crystalId1: null, crystalId2: null, resultCrystalId: null, startedAt: null, finishTime: null },
  ],
  dailyStreak: 0,
  lastDailyDate: '',
  lastSaveTime: Date.now(),
  totalCrystalsMined: 0,
  totalRareMined: 0,
  totalLegendaryMined: 0,
  totalCrafted: 0,
  totalSynthesized: 0,
  totalCreaturesDefeated: 0,
  totalCreaturesTamed: 0,
  totalBossesDefeated: 0,
  totalExpeditions: 0,
  totalCoinsSpent: 0,
  deepestMineReached: 1,
  playTimeMinutes: 0,
  sessionStartTime: Date.now(),
  miningActionsCount: 0,
  currentAction: 'swing',
  actionPower: CM_ACTION_POWER_BASE['swing'],
}

/* ================================================================
   HELPER FUNCTIONS
   ================================================================ */

function cmXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level > CM_MAX_LEVEL) return CM_XP_TABLE[CM_MAX_LEVEL]
  return CM_XP_TABLE[level]
}

function cmGetTitle(level: number): CmTitle {
  let best = CM_TITLES[0]
  for (const title of CM_TITLES) {
    if (level >= title.requiredLevel) {
      best = title
    }
  }
  return best
}

function cmGetRarityInfo(rarity: CmRarityTier): CmRarityInfo {
  return CM_RARITY[rarity]
}

function cmGetCrystal(id: string): CmCrystal | undefined {
  return CM_CRYSTALS.find(c => c.id === id)
}

function cmGetMine(id: string): CmMineLevel | undefined {
  return CM_MINE_LEVELS.find(m => m.id === id)
}

function cmGetCreature(id: string): CmCreature | undefined {
  return CM_CREATURES.find(c => c.id === id)
}

function cmGetEquipment(id: string): CmEquipment | undefined {
  return CM_EQUIPMENT.find(e => e.id === id)
}

function cmGetRecipe(id: string): CmRecipe | undefined {
  return CM_RECIPES.find(r => r.id === id)
}

function cmGetEvent(id: string): CmEvent | undefined {
  return CM_EVENTS.find(e => e.id === id)
}

function cmRandomFrom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function cmWeightedRandom(weights: Record<string, number>): string {
  const entries = Object.entries(weights)
  const total = entries.reduce((s, [, w]) => s + w, 0)
  let roll = Math.random() * total
  for (const [key, w] of entries) {
    roll -= w
    if (roll <= 0) return key
  }
  return entries[entries.length - 1][0]
}

function cmTodayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/* ================================================================
   HOOK
   ================================================================ */

export default function useCrystalMine() {
  const [state, setState] = useState<CmGameState>(() => {
    if (typeof window === 'undefined') return { ...CM_INITIAL_STATE }
    try {
      const raw = localStorage.getItem(CM_SAVE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as Partial<CmGameState>
        return { ...CM_INITIAL_STATE, ...saved, sessionStartTime: Date.now() }
      }
    } catch { /* ignore */ }
    return { ...CM_INITIAL_STATE }
  })

  const stateRef = useRef<CmGameState>(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      const s = stateRef.current
      const toSave = { ...s, sessionStartTime: s.lastSaveTime }
      try { localStorage.setItem(CM_SAVE_KEY, JSON.stringify(toSave)) } catch { /* ignore */ }
    }, CM_AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // Play time tracker
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        playTimeMinutes: prev.playTimeMinutes + 1,
      }))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  /* ==============================================================
     CORE STATE GETTERS
     ============================================================== */

  const getLevel = useCallback((): number => {
    return stateRef.current.level
  }, [])

  const getXp = useCallback((): number => {
    return stateRef.current.xp
  }, [])

  const getCoins = useCallback((): number => {
    return stateRef.current.coins
  }, [])

  const getTotalXp = useCallback((): number => {
    return stateRef.current.totalXp
  }, [])

  const getTotalCoinsEarned = useCallback((): number => {
    return stateRef.current.totalCoinsEarned
  }, [])

  const getInventory = useCallback((): CmInventoryItem[] => {
    return stateRef.current.inventory
  }, [])

  const getCurrentMineId = useCallback((): string | null => {
    return stateRef.current.currentMineId
  }, [])

  const getCurrentAction = useCallback((): CmMineAction => {
    return stateRef.current.currentAction
  }, [])

  const getActionPower = useCallback((): number => {
    return stateRef.current.actionPower
  }, [])

  const getDailyStreak = useCallback((): number => {
    return stateRef.current.dailyStreak
  }, [])

  const getPlayTime = useCallback((): number => {
    return stateRef.current.playTimeMinutes
  }, [])

  const getTotalCrystalsMined = useCallback((): number => {
    return stateRef.current.totalCrystalsMined
  }, [])

  const getTotalCrafted = useCallback((): number => {
    return stateRef.current.totalCrafted
  }, [])

  const getTotalSynthesized = useCallback((): number => {
    return stateRef.current.totalSynthesized
  }, [])

  const getTotalCreaturesDefeated = useCallback((): number => {
    return stateRef.current.totalCreaturesDefeated
  }, [])

  const getTotalBossesDefeated = useCallback((): number => {
    return stateRef.current.totalBossesDefeated
  }, [])

  const getDeepestMineReached = useCallback((): number => {
    return stateRef.current.deepestMineReached
  }, [])

  const getMiningActionsCount = useCallback((): number => {
    return stateRef.current.miningActionsCount
  }, [])

  const getTotalExpeditions = useCallback((): number => {
    return stateRef.current.totalExpeditions
  }, [])

  const getTotalCoinsSpent = useCallback((): number => {
    return stateRef.current.totalCoinsSpent
  }, [])

  /* ==============================================================
     TITLE / LEVEL HELPERS
     ============================================================== */

  const getCurrentTitle = useCallback((): CmTitle => {
    const s = stateRef.current
    const found = CM_TITLES.find(t => t.id === s.currentTitleId)
    return found || cmGetTitle(s.level)
  }, [])

  const getTitleForLevel = useCallback((level: number): CmTitle => {
    return cmGetTitle(level)
  }, [])

  const getXpToNextLevel = useCallback((): number => {
    const s = stateRef.current
    if (s.level >= CM_MAX_LEVEL) return 0
    return cmXpForLevel(s.level + 1) - s.xp
  }, [])

  const getXpProgress = useCallback((): number => {
    const s = stateRef.current
    if (s.level >= CM_MAX_LEVEL) return 1
    const current = cmXpForLevel(s.level)
    const next = cmXpForLevel(s.level + 1)
    return (s.xp - current) / (next - current)
  }, [])

  const getPercentToNextLevel = useCallback((): number => {
    return Math.floor(getXpProgress() * 100)
  }, [])

  const getTitleBonusXp = useCallback((): number => {
    const title = getCurrentTitle()
    return title.bonusXpPercent
  }, [])

  const getTitleBonusCoins = useCallback((): number => {
    const title = getCurrentTitle()
    return title.bonusCoinPercent
  }, [])

  /* ==============================================================
     INVENTORY
     ============================================================== */

  const getInventoryCount = useCallback((crystalId: string): number => {
    const item = stateRef.current.inventory.find(i => i.crystalId === crystalId)
    return item ? item.count : 0
  }, [])

  const getInventoryItem = useCallback((crystalId: string): CmInventoryItem | null => {
    const item = stateRef.current.inventory.find(i => i.crystalId === crystalId)
    return item || null
  }, [])

  const getInventoryValue = useCallback((): number => {
    return stateRef.current.inventory.reduce((sum, item) => {
      const crystal = cmGetCrystal(item.crystalId)
      return sum + (crystal ? crystal.sellPrice * item.count : 0)
    }, 0)
  }, [])

  const getCartCapacity = useCallback((): number => {
    return stateRef.current.mineCart.capacity
  }, [])

  const getCartLoad = useCallback((): number => {
    return stateRef.current.mineCart.currentLoad
  }, [])

  const isCartFull = useCallback((): boolean => {
    const cart = stateRef.current.mineCart
    return cart.currentLoad >= cart.capacity
  }, [])

  const getCartContents = useCallback((): string[] => {
    return stateRef.current.mineCart.crystalIds
  }, [])

  /* ==============================================================
     MINES
     ============================================================== */

  const getMineInfo = useCallback((mineId: string): CmMineLevel | undefined => {
    return cmGetMine(mineId)
  }, [])

  const getCurrentMineInfo = useCallback((): CmMineLevel | undefined => {
    const s = stateRef.current
    return s.currentMineId ? cmGetMine(s.currentMineId) : undefined
  }, [])

  const getAvailableMines = useCallback((): CmMineLevel[] => {
    const s = stateRef.current
    return CM_MINE_LEVELS.filter(m => s.level >= m.requiredLevel)
  }, [])

  const getLockedMines = useCallback((): CmMineLevel[] => {
    const s = stateRef.current
    return CM_MINE_LEVELS.filter(m => s.level < m.requiredLevel)
  }, [])

  const getMineRecord = useCallback((mineId: string): CmMineRecord | undefined => {
    return stateRef.current.mines.find(m => m.mineId === mineId)
  }, [])

  const isMineExplored = useCallback((mineId: string): boolean => {
    const record = stateRef.current.mines.find(m => m.mineId === mineId)
    return record ? record.explored : false
  }, [])

  const getMineExplorationPercent = useCallback((mineId: string): number => {
    const record = stateRef.current.mines.find(m => m.mineId === mineId)
    return record ? record.explorationPercent : 0
  }, [])

  const getMineCrystals = useCallback((mineId: string): CmCrystal[] => {
    const mine = cmGetMine(mineId)
    if (!mine) return []
    return mine.crystalIds.map(id => cmGetCrystal(id)).filter((c): c is CmCrystal => c !== undefined)
  }, [])

  const getMineCreatures = useCallback((mineId: string): CmCreature[] => {
    const mine = cmGetMine(mineId)
    if (!mine) return []
    return mine.creatureIds.map(id => cmGetCreature(id)).filter((c): c is CmCreature => c !== undefined)
  }, [])

  const getMinesWithBosses = useCallback((): CmMineLevel[] => {
    return CM_MINE_LEVELS.filter(m => m.bossCreatureId !== null)
  }, [])

  /* ==============================================================
     CRYSTAL HELPERS
     ============================================================== */

  const getCrystalInfo = useCallback((crystalId: string): CmCrystal | undefined => {
    return cmGetCrystal(crystalId)
  }, [])

  const getCrystalsByRarity = useCallback((rarity: CmRarityTier): CmCrystal[] => {
    return CM_CRYSTALS.filter(c => c.rarity === rarity)
  }, [])

  const getCrystalsByCategory = useCallback((category: CmCrystalCategory): CmCrystal[] => {
    return CM_CRYSTALS.filter(c => c.category === category)
  }, [])

  const getRarityInfo = useCallback((rarity: CmRarityTier): CmRarityInfo => {
    return cmGetRarityInfo(rarity)
  }, [])

  const isCrystalRare = useCallback((rarity: CmRarityTier): boolean => {
    return rarity === 'rare' || rarity === 'epic' || rarity === 'legendary'
  }, [])

  const isCrystalLegendary = useCallback((rarity: CmRarityTier): boolean => {
    return rarity === 'legendary'
  }, [])

  /* ==============================================================
     CREATURE HELPERS
     ============================================================== */

  const getCreatureInfo = useCallback((creatureId: string): CmCreature | undefined => {
    return cmGetCreature(creatureId)
  }, [])

  const getCreaturesByType = useCallback((type: CmCreatureType): CmCreature[] => {
    return CM_CREATURES.filter(c => c.type === type)
  }, [])

  const getCreatureRecord = useCallback((creatureId: string): CmCreatureRecord | undefined => {
    return stateRef.current.creatures.find(c => c.creatureId === creatureId)
  }, [])

  const isCreatureDefeated = useCallback((creatureId: string): boolean => {
    const record = stateRef.current.creatures.find(c => c.creatureId === creatureId)
    return record ? record.defeated : false
  }, [])

  const isCreatureTamed = useCallback((creatureId: string): boolean => {
    const record = stateRef.current.creatures.find(c => c.creatureId === creatureId)
    return record ? record.tamed : false
  }, [])

  const getDefeatCount = useCallback((creatureId: string): number => {
    const record = stateRef.current.creatures.find(c => c.creatureId === creatureId)
    return record ? record.defeatCount : 0
  }, [])

  /* ==============================================================
     EQUIPMENT HELPERS
     ============================================================== */

  const getEquipmentInfo = useCallback((equipmentId: string): CmEquipment | undefined => {
    return cmGetEquipment(equipmentId)
  }, [])

  const getEquipmentRecord = useCallback((equipmentId: string): CmEquipmentRecord | undefined => {
    return stateRef.current.equipment.find(e => e.equipmentId === equipmentId)
  }, [])

  const getEquipmentLevel = useCallback((equipmentId: string): number => {
    const record = stateRef.current.equipment.find(e => e.equipmentId === equipmentId)
    return record ? record.level : 0
  }, [])

  const getEquipmentByType = useCallback((type: string): CmEquipment[] => {
    return CM_EQUIPMENT.filter(e => e.type === type)
  }, [])

  const getEquipmentByRarity = useCallback((rarity: CmRarityTier): CmEquipment[] => {
    return CM_EQUIPMENT.filter(e => e.rarity === rarity)
  }, [])

  const getEquippedWeapon = useCallback((): CmEquipment | undefined => {
    const s = stateRef.current
    return s.equippedWeapon ? cmGetEquipment(s.equippedWeapon) : undefined
  }, [])

  const getEquippedArmor = useCallback((): CmEquipment | undefined => {
    const s = stateRef.current
    return s.equippedArmor ? cmGetEquipment(s.equippedArmor) : undefined
  }, [])

  const getEquippedTool = useCallback((): CmEquipment | undefined => {
    const s = stateRef.current
    return s.equippedTool ? cmGetEquipment(s.equippedTool) : undefined
  }, [])

  const getTotalMiningBonus = useCallback((): number => {
    let bonus = 0
    const s = stateRef.current
    if (s.equippedWeapon) {
      const eq = cmGetEquipment(s.equippedWeapon)
      if (eq) bonus += eq.miningBonus
    }
    if (s.equippedArmor) {
      const eq = cmGetEquipment(s.equippedArmor)
      if (eq) bonus += eq.miningBonus
    }
    if (s.equippedTool) {
      const eq = cmGetEquipment(s.equippedTool)
      if (eq) bonus += eq.miningBonus
    }
    return bonus
  }, [])

  const getTotalDefenseBonus = useCallback((): number => {
    let bonus = 0
    const s = stateRef.current
    if (s.equippedWeapon) {
      const eq = cmGetEquipment(s.equippedWeapon)
      if (eq) bonus += eq.defenseBonus
    }
    if (s.equippedArmor) {
      const eq = cmGetEquipment(s.equippedArmor)
      if (eq) bonus += eq.defenseBonus
    }
    if (s.equippedTool) {
      const eq = cmGetEquipment(s.equippedTool)
      if (eq) bonus += eq.defenseBonus
    }
    return bonus
  }, [])

  /* ==============================================================
     RECIPE HELPERS
     ============================================================== */

  const getRecipeInfo = useCallback((recipeId: string): CmRecipe | undefined => {
    return cmGetRecipe(recipeId)
  }, [])

  const getRecipesByRarity = useCallback((rarity: CmRarityTier): CmRecipe[] => {
    return CM_RECIPES.filter(r => r.rarity === rarity)
  }, [])

  const getAvailableRecipes = useCallback((): CmRecipe[] => {
    return CM_RECIPES.filter(r => stateRef.current.level >= r.requiredLevel)
  }, [])

  const getLockedRecipes = useCallback((): CmRecipe[] => {
    return CM_RECIPES.filter(r => stateRef.current.level < r.requiredLevel)
  }, [])

  const canCraftRecipe = useCallback((recipeId: string): boolean => {
    const recipe = cmGetRecipe(recipeId)
    if (!recipe) return false
    const s = stateRef.current
    if (s.coins < recipe.requiredCoins) return false
    if (s.level < recipe.requiredLevel) return false
    for (const ing of recipe.ingredients) {
      const inv = s.inventory.find(i => i.crystalId === ing.crystalId)
      if (!inv || inv.count < ing.count) return false
    }
    return true
  }, [])

  const getMissingIngredients = useCallback((recipeId: string): { crystalId: string; missing: number }[] => {
    const recipe = cmGetRecipe(recipeId)
    if (!recipe) return []
    const s = stateRef.current
    return recipe.ingredients
      .map(ing => {
        const inv = s.inventory.find(i => i.crystalId === ing.crystalId)
        const have = inv ? inv.count : 0
        return { crystalId: ing.crystalId, missing: Math.max(0, ing.count - have) }
      })
      .filter(m => m.missing > 0)
  }, [])

  /* ==============================================================
     SYNTHESIS
     ============================================================== */

  const getSynthesisSlots = useCallback((): CmSynthesisSlot[] => {
    return stateRef.current.synthesisSlots
  }, [])

  const getSynthesisSlot = useCallback((slotId: number): CmSynthesisSlot | undefined => {
    return stateRef.current.synthesisSlots.find(s => s.slotId === slotId)
  }, [])

  const isSynthesisSlotBusy = useCallback((slotId: number): boolean => {
    const slot = stateRef.current.synthesisSlots.find(s => s.slotId === slotId)
    return slot ? (slot.startedAt !== null && slot.finishTime !== null && slot.finishTime > Date.now()) : false
  }, [])

  const getSynthesisRemainingTime = useCallback((slotId: number): number => {
    const slot = stateRef.current.synthesisSlots.find(s => s.slotId === slotId)
    if (!slot || !slot.finishTime) return 0
    return Math.max(0, slot.finishTime - Date.now())
  }, [])

  /* ==============================================================
     EVENTS
     ============================================================== */

  const getActiveEvents = useCallback((): CmActiveEvent[] => {
    const now = Date.now()
    return stateRef.current.activeEvents.filter(e => e.endTime > now)
  }, [])

  const getEventInfo = useCallback((eventId: string): CmEvent | undefined => {
    return cmGetEvent(eventId)
  }, [])

  const hasActiveEvent = useCallback((eventType: CmEventType): boolean => {
    const now = Date.now()
    const eventDef = CM_EVENTS.find(e => e.type === eventType)
    if (!eventDef) return false
    return stateRef.current.activeEvents.some(ae => ae.eventId === eventDef.id && ae.endTime > now)
  }, [])

  const isCrystalSurgeActive = useCallback((): boolean => {
    return hasActiveEvent('crystal_surge')
  }, [])

  const isCaveInActive = useCallback((): boolean => {
    return hasActiveEvent('cave_in')
  }, [])

  const isGemExhibitionActive = useCallback((): boolean => {
    return hasActiveEvent('gem_exhibition')
  }, [])

  const getEventMultiplier = useCallback((): number => {
    const active = getActiveEvents()
    let multiplier = 1
    for (const ae of active) {
      const def = cmGetEvent(ae.eventId)
      if (def && def.effect === 'rarity_boost') multiplier *= def.effectValue
    }
    return multiplier
  }, [])

  /* ==============================================================
     EXPEDITION
     ============================================================== */

  const getExpedition = useCallback((): CmExpedition | null => {
    return stateRef.current.expedition
  }, [])

  const isExpeditionActive = useCallback((): boolean => {
    const exp = stateRef.current.expedition
    return exp ? !exp.completed : false
  }, [])

  const getExpeditionRemainingTime = useCallback((): number => {
    const exp = stateRef.current.expedition
    if (!exp || exp.completed) return 0
    return Math.max(0, exp.startTime + exp.duration - Date.now())
  }, [])

  /* ==============================================================
     ACHIEVEMENTS
     ============================================================== */

  const getUnlockedAchievements = useCallback((): CmAchievementRecord[] => {
    return stateRef.current.achievements
  }, [])

  const isAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.some(a => a.achievementId === achievementId)
  }, [])

  const getLockedAchievements = useCallback((): CmAchievement[] => {
    const unlocked = new Set(stateRef.current.achievements.map(a => a.achievementId))
    return CM_ACHIEVEMENTS.filter(a => !unlocked.has(a.id))
  }, [])

  const getAchievementProgress = useCallback((achievementId: string): number => {
    const s = stateRef.current
    const ach = CM_ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!ach) return 0
    const condition = ach.condition
    if (condition.startsWith('miningActionsCount')) return s.miningActionsCount
    if (condition.startsWith('totalCrystalsMined')) return s.totalCrystalsMined
    if (condition.startsWith('totalRareMined')) return s.totalRareMined
    if (condition.startsWith('totalLegendaryMined')) return s.totalLegendaryMined
    if (condition.startsWith('deepestMineReached')) return s.deepestMineReached
    if (condition.startsWith('totalCreaturesDefeated')) return s.totalCreaturesDefeated
    if (condition.startsWith('totalBossesDefeated')) return s.totalBossesDefeated
    if (condition.startsWith('totalCreaturesTamed')) return s.totalCreaturesTamed
    if (condition.startsWith('totalCrafted')) return s.totalCrafted
    if (condition.startsWith('totalSynthesized')) return s.totalSynthesized
    if (condition.startsWith('mineCartLevel')) return s.mineCart.upgradeLevel
    if (condition.startsWith('totalExpeditions')) return s.totalExpeditions
    if (condition.startsWith('dailyStreak')) return s.dailyStreak
    if (condition.startsWith('level')) return s.level
    return 0
  }, [])

  /* ==============================================================
     ACTIONS: MINING
     ============================================================== */

  const performMineAction = useCallback((action: CmMineAction): { success: boolean; crystalId?: string; xpGained: number; coinsGained: number; message: string } => {
    const cost = CM_ACTION_COIN_COST[action]
    let s = stateRef.current
    if (s.coins < cost) return { success: false, xpGained: 0, coinsGained: 0, message: 'Not enough coins!' }
    if (!s.currentMineId) return { success: false, xpGained: 0, coinsGained: 0, message: 'No mine selected!' }

    const mine = cmGetMine(s.currentMineId)
    if (!mine) return { success: false, xpGained: 0, coinsGained: 0, message: 'Invalid mine!' }
    if (s.level < mine.requiredLevel) return { success: false, xpGained: 0, coinsGained: 0, message: 'Mine level too high!' }

    let power = CM_ACTION_POWER_BASE[action] + getTotalMiningBonus()
    let coinMultiplier = 1
    let xpMultiplier = 1

    if (isCrystalSurgeActive()) xpMultiplier *= 2
    if (isCaveInActive()) { coinMultiplier *= 3; }
    if (isGemExhibitionActive()) coinMultiplier *= 2

    const titleBonusXp = getTitleBonusXp()
    xpMultiplier *= (1 + titleBonusXp / 100)
    const titleBonusCoins = getTitleBonusCoins()
    coinMultiplier *= (1 + titleBonusCoins / 100)

    if (isCaveInActive()) power *= 2

    const roll = Math.random() * 100
    let rarityRoll = roll + power * 0.5
    if (isCrystalSurgeActive()) rarityRoll += 20

    let selectedRarity: CmRarityTier
    if (rarityRoll >= 95) selectedRarity = 'legendary'
    else if (rarityRoll >= 82) selectedRarity = 'epic'
    else if (rarityRoll >= 60) selectedRarity = 'rare'
    else if (rarityRoll >= 35) selectedRarity = 'uncommon'
    else selectedRarity = 'common'

    const available = mine.crystalIds.map(id => cmGetCrystal(id)).filter((c): c is CmCrystal => c !== undefined)
    const matching = available.filter(c => c.rarity === selectedRarity)
    const candidates = matching.length > 0 ? matching : available.filter(c => c.rarity === 'common')
    const crystal = candidates.length > 0 ? cmRandomFrom(candidates) : null

    if (!crystal) return { success: true, xpGained: 0, coinsGained: -cost, message: 'Swung but found nothing.' }

    const rarityInfo = cmGetRarityInfo(crystal.rarity)
    const xpGained = Math.floor(CM_ACTION_XP_REWARD[action] * rarityInfo.xpMultiplier * xpMultiplier)
    const coinsGained = Math.floor(crystal.sellPrice * rarityInfo.coinMultiplier * coinMultiplier) - cost

    const isRare = crystal.rarity === 'rare' || crystal.rarity === 'epic' || crystal.rarity === 'legendary'
    const isLegendary = crystal.rarity === 'legendary'

    setState(prev => {
      const newInv = [...prev.inventory]
      const idx = newInv.findIndex(i => i.crystalId === crystal.id)
      if (idx >= 0) {
        newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, CM_MAX_INVENTORY_ITEM) }
      } else {
        newInv.push({ crystalId: crystal.id, count: 1 })
      }

      let newCart = { ...prev.mineCart }
      if (newCart.currentLoad < newCart.capacity) {
        newCart = {
          ...newCart,
          currentLoad: newCart.currentLoad + 1,
          crystalIds: [...newCart.crystalIds, crystal.id],
        }
      }

      const newMines = prev.mines.map(m =>
        m.mineId === prev.currentMineId
          ? { ...m, totalMined: m.totalMined + 1, explorationPercent: Math.min(100, m.explorationPercent + 2) }
          : m
      )

      const newXp = prev.xp + xpGained
      const newTotalXp = prev.totalXp + xpGained
      let newLevel = prev.level
      if (newLevel < CM_MAX_LEVEL && newXp >= cmXpForLevel(newLevel + 1)) {
        newLevel += 1
      }

      const newDeepest = Math.max(prev.deepestMineReached, mine.depth)

      return {
        ...prev,
        coins: Math.max(0, prev.coins + coinsGained),
        totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, coinsGained),
        inventory: newInv,
        mineCart: newCart,
        mines: newMines,
        xp: newLevel === prev.level ? newXp : newXp - cmXpForLevel(newLevel),
        totalXp: newTotalXp,
        level: newLevel,
        totalCrystalsMined: prev.totalCrystalsMined + 1,
        totalRareMined: prev.totalRareMined + (isRare ? 1 : 0),
        totalLegendaryMined: prev.totalLegendaryMined + (isLegendary ? 1 : 0),
        deepestMineReached: newDeepest,
        miningActionsCount: prev.miningActionsCount + 1,
        currentAction: action,
        actionPower: CM_ACTION_POWER_BASE[action] + getTotalMiningBonus(),
        currentTitleId: cmGetTitle(newLevel).id,
      }
    })

    return { success: true, crystalId: crystal.id, xpGained, coinsGained, message: `Found ${crystal.name}!` }
  }, [getTotalMiningBonus, isCrystalSurgeActive, isCaveInActive, isGemExhibitionActive, getTitleBonusXp, getTitleBonusCoins])

  const swingPick = useCallback(() => {
    return performMineAction('swing')
  }, [performMineAction])

  const digDeep = useCallback(() => {
    return performMineAction('dig')
  }, [performMineAction])

  const blastRock = useCallback(() => {
    return performMineAction('blast')
  }, [performMineAction])

  const excavate = useCallback(() => {
    return performMineAction('excavate')
  }, [performMineAction])

  const switchAction = useCallback((action: CmMineAction) => {
    setState(prev => ({
      ...prev,
      currentAction: action,
      actionPower: CM_ACTION_POWER_BASE[action] + getTotalMiningBonus(),
    }))
  }, [getTotalMiningBonus])

  /* ==============================================================
     ACTIONS: TRAVEL
     ============================================================== */

  const travelToMine = useCallback((mineId: string): boolean => {
    const mine = cmGetMine(mineId)
    if (!mine) return false
    const s = stateRef.current
    if (s.level < mine.requiredLevel) return false

    const mineRecord = s.mines.find(m => m.mineId === mineId)
    if (!mineRecord) return false

    setState(prev => ({
      ...prev,
      currentMineId: mineId,
      mines: prev.mines.map(m =>
        m.mineId === mineId ? { ...m, explored: true } : m
      ),
    }))
    return true
  }, [])

  const unlockMine = useCallback((mineId: string): boolean => {
    const mine = cmGetMine(mineId)
    if (!mine) return false
    const s = stateRef.current
    if (s.level < mine.requiredLevel) return false
    if (s.coins < mine.unlockCost) return false
    if (s.mines.find(m => m.mineId === mineId)) return false

    setState(prev => ({
      ...prev,
      coins: prev.coins - mine.unlockCost,
      totalCoinsSpent: prev.totalCoinsSpent + mine.unlockCost,
      mines: [
        ...prev.mines,
        { mineId, explored: false, explorationPercent: 0, totalMined: 0, bossDefeated: false },
      ],
    }))
    return true
  }, [])

  /* ==============================================================
     ACTIONS: SELLING
     ============================================================== */

  const sellCrystal = useCallback((crystalId: string, count: number): number => {
    const crystal = cmGetCrystal(crystalId)
    if (!crystal) return 0
    const s = stateRef.current
    const inv = s.inventory.find(i => i.crystalId === crystalId)
    if (!inv || inv.count < count) return 0

    let sellMultiplier = 1
    if (isGemExhibitionActive()) sellMultiplier *= 2
    const titleCoins = getTitleBonusCoins()
    sellMultiplier *= (1 + titleCoins / 100)

    const coinsEarned = Math.floor(crystal.sellPrice * cmGetRarityInfo(crystal.rarity).coinMultiplier * sellMultiplier * count)

    setState(prev => {
      const newInv = prev.inventory.map(i => {
        if (i.crystalId === crystalId) {
          const newCount = i.count - count
          return newCount <= 0 ? { ...i, count: 0 } : { ...i, count: newCount }
        }
        return i
      }).filter(i => i.count > 0)

      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned,
        inventory: newInv,
      }
    })
    return coinsEarned
  }, [isGemExhibitionActive, getTitleBonusCoins])

  const sellAllCrystals = useCallback((): number => {
    const s = stateRef.current
    let totalEarned = 0
    for (const item of s.inventory) {
      const earned = sellCrystal(item.crystalId, item.count)
      totalEarned += earned
    }
    return totalEarned
  }, [sellCrystal])

  const sellCartContents = useCallback((): number => {
    const cart = stateRef.current.mineCart
    let totalEarned = 0
    const counts: Record<string, number> = {}
    for (const id of cart.crystalIds) {
      counts[id] = (counts[id] || 0) + 1
    }
    for (const [crystalId, count] of Object.entries(counts)) {
      totalEarned += sellCrystal(crystalId, count)
    }
    setState(prev => ({
      ...prev,
      mineCart: { ...prev.mineCart, currentLoad: 0, crystalIds: [] },
    }))
    return totalEarned
  }, [sellCrystal])

  /* ==============================================================
     ACTIONS: EQUIPMENT
     ============================================================== */

  const equipItem = useCallback((equipmentId: string): boolean => {
    const eq = cmGetEquipment(equipmentId)
    if (!eq) return false
    const s = stateRef.current
    const record = s.equipment.find(e => e.equipmentId === equipmentId)
    if (!record) return false

    setState(prev => {
      const newState = { ...prev }
      if (eq.type === 'tool') newState.equippedTool = equipmentId
      else if (eq.type === 'armor') newState.equippedArmor = equipmentId
      else if (eq.type === 'weapon') newState.equippedWeapon = equipmentId
      else if (eq.type === 'helmet') newState.equippedArmor = equipmentId
      else if (eq.type === 'boots') newState.equippedArmor = equipmentId

      newState.equipment = prev.equipment.map(e =>
        e.equipmentId === equipmentId ? { ...e, equipped: true } : e
      )
      return newState
    })
    return true
  }, [])

  const unequipItem = useCallback((equipmentId: string): void => {
    setState(prev => {
      const newState = { ...prev }
      if (prev.equippedWeapon === equipmentId) newState.equippedWeapon = null
      if (prev.equippedArmor === equipmentId) newState.equippedArmor = null
      if (prev.equippedTool === equipmentId) newState.equippedTool = null
      newState.equipment = prev.equipment.map(e =>
        e.equipmentId === equipmentId ? { ...e, equipped: false } : e
      )
      return newState
    })
  }, [])

  const acquireEquipment = useCallback((equipmentId: string): boolean => {
    const eq = cmGetEquipment(equipmentId)
    if (!eq) return false
    const s = stateRef.current
    if (s.equipment.find(e => e.equipmentId === equipmentId)) return false

    setState(prev => ({
      ...prev,
      equipment: [...prev.equipment, { equipmentId, level: 1, equipped: false }],
    }))
    return true
  }, [])

  const upgradeEquipment = useCallback((equipmentId: string): boolean => {
    const eq = cmGetEquipment(equipmentId)
    if (!eq) return false
    const s = stateRef.current
    const record = s.equipment.find(e => e.equipmentId === equipmentId)
    if (!record) return false
    if (record.level >= eq.maxLevel) return false

    const cost = Math.floor(eq.upgradeCost * Math.pow(1.6, record.level - 1))
    if (s.coins < cost) return false

    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      equipment: prev.equipment.map(e =>
        e.equipmentId === equipmentId ? { ...e, level: e.level + 1 } : e
      ),
    }))
    return true
  }, [])

  const getUpgradeCost = useCallback((equipmentId: string): number => {
    const eq = cmGetEquipment(equipmentId)
    if (!eq) return 0
    const record = stateRef.current.equipment.find(e => e.equipmentId === equipmentId)
    const lvl = record ? record.level : 1
    return Math.floor(eq.upgradeCost * Math.pow(1.6, lvl - 1))
  }, [])

  /* ==============================================================
     ACTIONS: CRAFTING
     ============================================================== */

  const craftRecipe = useCallback((recipeId: string): boolean => {
    const recipe = cmGetRecipe(recipeId)
    if (!recipe) return false
    const s = stateRef.current
    if (s.coins < recipe.requiredCoins) return false
    if (s.level < recipe.requiredLevel) return false

    for (const ing of recipe.ingredients) {
      const inv = s.inventory.find(i => i.crystalId === ing.crystalId)
      if (!inv || inv.count < ing.count) return false
    }

    setState(prev => {
      let newInv = [...prev.inventory]
      for (const ing of recipe.ingredients) {
        newInv = newInv.map(i => {
          if (i.crystalId === ing.crystalId) {
            return { ...i, count: i.count - ing.count }
          }
          return i
        }).filter(i => i.count > 0)
      }

      if (recipe.resultType === 'equipment') {
        const hasEquip = prev.equipment.find(e => e.equipmentId === recipe.resultId)
        if (!hasEquip) {
          return {
            ...prev,
            coins: prev.coins - recipe.requiredCoins,
            totalCoinsSpent: prev.totalCoinsSpent + recipe.requiredCoins,
            inventory: newInv,
            equipment: [...prev.equipment, { equipmentId: recipe.resultId, level: 1, equipped: false }],
            totalCrafted: prev.totalCrafted + 1,
            xp: prev.level < CM_MAX_LEVEL ? prev.xp + recipe.xpReward : prev.xp,
            totalXp: prev.totalXp + recipe.xpReward,
          }
        }
      } else if (recipe.resultType === 'crystal') {
        const crystalInv = newInv.find(i => i.crystalId === recipe.resultId)
        if (crystalInv) {
          newInv = newInv.map(i =>
            i.crystalId === recipe.resultId ? { ...i, count: Math.min(i.count + 1, CM_MAX_INVENTORY_ITEM) } : i
          )
        } else {
          newInv.push({ crystalId: recipe.resultId, count: 1 })
        }
      }

      return {
        ...prev,
        coins: prev.coins - recipe.requiredCoins,
        totalCoinsSpent: prev.totalCoinsSpent + recipe.requiredCoins,
        inventory: newInv,
        totalCrafted: prev.totalCrafted + 1,
        xp: prev.level < CM_MAX_LEVEL ? prev.xp + recipe.xpReward : prev.xp,
        totalXp: prev.totalXp + recipe.xpReward,
      }
    })
    return true
  }, [])

  /* ==============================================================
     ACTIONS: SYNTHESIS
     ============================================================== */

  const startSynthesis = useCallback((slotId: number, crystalId1: string, crystalId2: string): boolean => {
    const slot = stateRef.current.synthesisSlots.find(s => s.slotId === slotId)
    if (!slot) return false
    if (slot.startedAt !== null && slot.finishTime !== null && slot.finishTime > Date.now()) return false

    const c1 = cmGetCrystal(crystalId1)
    const c2 = cmGetCrystal(crystalId2)
    if (!c1 || !c2) return false
    const s = stateRef.current
    const inv1 = s.inventory.find(i => i.crystalId === crystalId1)
    const inv2 = s.inventory.find(i => i.crystalId === crystalId2)
    if (!inv1 || inv1.count < 1) return false
    if (crystalId1 !== crystalId2 && (!inv2 || inv2.count < 1)) return false

    const higherRarity = CM_RARITY_ORDER.indexOf(c1.rarity) >= CM_RARITY_ORDER.indexOf(c2.rarity) ? c1 : c2
    const rIdx = CM_RARITY_ORDER.indexOf(higherRarity.rarity)
    const resultRarity = rIdx < CM_RARITY_ORDER.length - 1 ? CM_RARITY_ORDER[rIdx + 1] : higherRarity.rarity

    const candidates = CM_CRYSTALS.filter(c => c.rarity === resultRarity)
    const result = candidates.length > 0 ? cmRandomFrom(candidates) : higherRarity

    const duration = CM_SYNTHESIS_BASE_TIME * (rIdx + 1)

    setState(prev => {
      let newInv = prev.inventory.map(i => {
        if (i.crystalId === crystalId1) return { ...i, count: i.count - 1 }
        return i
      }).filter(i => i.count > 0)

      if (crystalId1 !== crystalId2) {
        newInv = newInv.map(i => {
          if (i.crystalId === crystalId2) return { ...i, count: i.count - 1 }
          return i
        }).filter(i => i.count > 0)
      }

      const now = Date.now()
      return {
        ...prev,
        inventory: newInv,
        synthesisSlots: prev.synthesisSlots.map(s =>
          s.slotId === slotId
            ? { ...s, crystalId1, crystalId2, resultCrystalId: result.id, startedAt: now, finishTime: now + duration }
            : s
        ),
      }
    })
    return true
  }, [])

  const collectSynthesis = useCallback((slotId: number): string | null => {
    const slot = stateRef.current.synthesisSlots.find(s => s.slotId === slotId)
    if (!slot || !slot.resultCrystalId || !slot.finishTime || slot.finishTime > Date.now()) return null

    const crystalId = slot.resultCrystalId

    setState(prev => {
      const newInv = [...prev.inventory]
      const idx = newInv.findIndex(i => i.crystalId === crystalId)
      if (idx >= 0) {
        newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + 1, CM_MAX_INVENTORY_ITEM) }
      } else {
        newInv.push({ crystalId, count: 1 })
      }

      return {
        ...prev,
        inventory: newInv,
        synthesisSlots: prev.synthesisSlots.map(s =>
          s.slotId === slotId
            ? { ...s, crystalId1: null, crystalId2: null, resultCrystalId: null, startedAt: null, finishTime: null }
            : s
        ),
        totalSynthesized: prev.totalSynthesized + 1,
      }
    })
    return crystalId
  }, [])

  /* ==============================================================
     ACTIONS: CREATURES
     ============================================================== */

  const encounterCreature = useCallback((creatureId: string): boolean => {
    const creature = cmGetCreature(creatureId)
    if (!creature) return false

    setState(prev => {
      const exists = prev.creatures.find(c => c.creatureId === creatureId)
      if (exists) return prev
      return {
        ...prev,
        creatures: [...prev.creatures, { creatureId, encountered: true, defeated: false, tamed: false, defeatCount: 0 }],
      }
    })
    return true
  }, [])

  const defeatCreature = useCallback((creatureId: string): { xpGained: number; coinsGained: number; crystalDropped: string | null } => {
    const creature = cmGetCreature(creatureId)
    if (!creature) return { xpGained: 0, coinsGained: 0, crystalDropped: null }

    let crystalDropped: string | null = null
    if (Math.random() < 0.6) crystalDropped = creature.crystalDrop

    const isBoss = creature.type === 'boss'

    setState(prev => {
      let newInv = prev.inventory
      if (crystalDropped) {
        const exists = newInv.find(i => i.crystalId === crystalDropped)
        if (exists) {
          newInv = newInv.map(i =>
            i.crystalId === crystalDropped ? { ...i, count: Math.min(i.count + 1, CM_MAX_INVENTORY_ITEM) } : i
          )
        } else {
          newInv = [...newInv, { crystalId: crystalDropped, count: 1 }]
        }
      }

      const newMines = prev.mines.map(m => {
        const mine = cmGetMine(m.mineId)
        if (mine && mine.bossCreatureId === creatureId) {
          return { ...m, bossDefeated: true }
        }
        return m
      })

      return {
        ...prev,
        xp: prev.level < CM_MAX_LEVEL ? prev.xp + creature.xpReward : prev.xp,
        totalXp: prev.totalXp + creature.xpReward,
        coins: prev.coins + creature.coinDrop,
        totalCoinsEarned: prev.totalCoinsEarned + creature.coinDrop,
        inventory: newInv,
        creatures: prev.creatures.map(c =>
          c.creatureId === creatureId ? { ...c, defeated: true, defeatCount: c.defeatCount + 1 } : c
        ),
        mines: newMines,
        totalCreaturesDefeated: prev.totalCreaturesDefeated + 1,
        totalBossesDefeated: prev.totalBossesDefeated + (isBoss ? 1 : 0),
      }
    })

    return { xpGained: creature.xpReward, coinsGained: creature.coinDrop, crystalDropped }
  }, [])

  const tameCreature = useCallback((creatureId: string): boolean => {
    const creature = cmGetCreature(creatureId)
    if (!creature || !creature.tameable) return false
    const s = stateRef.current
    const record = s.creatures.find(c => c.creatureId === creatureId)
    if (!record || !record.defeated) return false
    if (record.tamed) return false

    const tameCost = Math.floor(creature.coinDrop * 5)
    if (s.coins < tameCost) return false

    setState(prev => ({
      ...prev,
      coins: prev.coins - tameCost,
      totalCoinsSpent: prev.totalCoinsSpent + tameCost,
      creatures: prev.creatures.map(c =>
        c.creatureId === creatureId ? { ...c, tamed: true } : c
      ),
      totalCreaturesTamed: prev.totalCreaturesTamed + 1,
    }))
    return true
  }, [])

  const getTameCost = useCallback((creatureId: string): number => {
    const creature = cmGetCreature(creatureId)
    if (!creature) return 0
    return Math.floor(creature.coinDrop * 5)
  }, [])

  /* ==============================================================
     ACTIONS: MINE CART
     ============================================================== */

  const upgradeCart = useCallback((): boolean => {
    const s = stateRef.current
    const cart = s.mineCart
    if (cart.upgradeLevel >= cart.maxUpgradeLevel) return false

    const cost = Math.floor(CM_MINE_CART_UPGRADE_COST_BASE * Math.pow(2, cart.upgradeLevel))
    if (s.coins < cost) return false

    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      mineCart: {
        ...prev.mineCart,
        capacity: CM_MINE_CART_BASE_CAPACITY + (prev.mineCart.upgradeLevel + 1) * 10,
        upgradeLevel: prev.mineCart.upgradeLevel + 1,
      },
    }))
    return true
  }, [])

  const getCartUpgradeCost = useCallback((): number => {
    const cart = stateRef.current.mineCart
    if (cart.upgradeLevel >= cart.maxUpgradeLevel) return 0
    return Math.floor(CM_MINE_CART_UPGRADE_COST_BASE * Math.pow(2, cart.upgradeLevel))
  }, [])

  const emptyCart = useCallback((): void => {
    setState(prev => ({
      ...prev,
      mineCart: { ...prev.mineCart, currentLoad: 0, crystalIds: [] },
    }))
  }, [])

  const transferCartToInventory = useCallback((): number => {
    const cart = stateRef.current.mineCart
    if (cart.crystalIds.length === 0) return 0

    setState(prev => {
      const counts: Record<string, number> = {}
      for (const id of prev.mineCart.crystalIds) {
        counts[id] = (counts[id] || 0) + 1
      }

      let newInv = [...prev.inventory]
      for (const [crystalId, count] of Object.entries(counts)) {
        const idx = newInv.findIndex(i => i.crystalId === crystalId)
        if (idx >= 0) {
          newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + count, CM_MAX_INVENTORY_ITEM) }
        } else {
          newInv.push({ crystalId, count: Math.min(count, CM_MAX_INVENTORY_ITEM) })
        }
      }

      return {
        ...prev,
        inventory: newInv,
        mineCart: { ...prev.mineCart, currentLoad: 0, crystalIds: [] },
      }
    })
    return cart.crystalIds.length
  }, [])

  /* ==============================================================
     ACTIONS: EXPEDITION
     ============================================================== */

  const startExpedition = useCallback((targetMineId: string): boolean => {
    const s = stateRef.current
    if (s.expedition && !s.expedition.completed) return false
    const mine = cmGetMine(targetMineId)
    if (!mine) return false
    if (s.level < mine.requiredLevel) return false
    if (s.coins < 50) return false

    const expCost = 50 + mine.depth * 20
    if (s.coins < expCost) return false

    const duration = CM_EXPEDITION_BASE_TIME + mine.depth * 30000
    const crystalCount = 2 + mine.depth
    const rewards: CmInventoryItem[] = []
    for (let i = 0; i < crystalCount; i++) {
      const crystal = cmRandomFrom(mine.crystalIds.map(id => cmGetCrystal(id)).filter((c): c is CmCrystal => c !== undefined))
      if (crystal) {
        const existing = rewards.find(r => r.crystalId === crystal.id)
        if (existing) existing.count++
        else rewards.push({ crystalId: crystal.id, count: 1 })
      }
    }

    setState(prev => ({
      ...prev,
      coins: prev.coins - expCost,
      totalCoinsSpent: prev.totalCoinsSpent + expCost,
      expedition: {
        id: `exp-${Date.now()}`,
        targetMineId,
        startTime: Date.now(),
        duration,
        rewards,
        completed: false,
        claimed: false,
      },
    }))
    return true
  }, [])

  const claimExpedition = useCallback((): CmInventoryItem[] | null => {
    const exp = stateRef.current.expedition
    if (!exp || !exp.completed || exp.claimed) return null
    if (exp.startTime + exp.duration > Date.now()) return null

    setState(prev => {
      let newInv = [...prev.inventory]
      for (const reward of exp.rewards) {
        const idx = newInv.findIndex(i => i.crystalId === reward.crystalId)
        if (idx >= 0) {
          newInv[idx] = { ...newInv[idx], count: Math.min(newInv[idx].count + reward.count, CM_MAX_INVENTORY_ITEM) }
        } else {
          newInv.push({ ...reward })
        }
      }

      return {
        ...prev,
        inventory: newInv,
        expedition: { ...exp, claimed: true },
        totalExpeditions: prev.totalExpeditions + 1,
      }
    })
    return exp.rewards
  }, [])

  const checkExpedition = useCallback((): void => {
    const exp = stateRef.current.expedition
    if (!exp || exp.completed) return
    if (exp.startTime + exp.duration > Date.now()) return

    setState(prev => ({
      ...prev,
      expedition: prev.expedition ? { ...prev.expedition, completed: true } : null,
    }))
  }, [])

  /* ==============================================================
     ACTIONS: EVENTS
     ============================================================== */

  const triggerRandomEvent = useCallback((): CmEvent | null => {
    const event = cmRandomFrom(CM_EVENTS)
    const now = Date.now()
    const active = stateRef.current.activeEvents

    if (active.some(ae => ae.eventId === event.id && ae.endTime > now)) return null

    setState(prev => ({
      ...prev,
      activeEvents: [
        ...prev.activeEvents.filter(ae => ae.endTime > now),
        { eventId: event.id, startTime: now, endTime: now + event.duration },
      ],
    }))
    return event
  }, [])

  const triggerEvent = useCallback((eventId: string): CmEvent | null => {
    const event = cmGetEvent(eventId)
    if (!event) return null
    const now = Date.now()

    setState(prev => ({
      ...prev,
      activeEvents: [
        ...prev.activeEvents.filter(ae => ae.endTime > now),
        { eventId: event.id, startTime: now, endTime: now + event.duration },
      ],
    }))
    return event
  }, [])

  const clearExpiredEvents = useCallback((): void => {
    const now = Date.now()
    setState(prev => ({
      ...prev,
      activeEvents: prev.activeEvents.filter(ae => ae.endTime > now),
    }))
  }, [])

  /* ==============================================================
     ACTIONS: DAILY
     ============================================================== */

  const claimDailyReward = useCallback((): { streak: number; coins: number; xp: number } => {
    const today = cmTodayStr()
    const s = stateRef.current

    if (s.lastDailyDate === today) {
      return { streak: s.dailyStreak, coins: 0, xp: 0 }
    }

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    const newStreak = s.lastDailyDate === yesterday ? s.dailyStreak + 1 : 1

    const coins = 50 + newStreak * 10 + Math.floor(newStreak * newStreak * 0.5)
    const xp = 20 + newStreak * 5

    setState(prev => ({
      ...prev,
      coins: prev.coins + coins,
      totalCoinsEarned: prev.totalCoinsEarned + coins,
      xp: prev.level < CM_MAX_LEVEL ? prev.xp + xp : prev.xp,
      totalXp: prev.totalXp + xp,
      dailyStreak: newStreak,
      lastDailyDate: today,
    }))

    return { streak: newStreak, coins, xp }
  }, [])

  const canClaimDaily = useCallback((): boolean => {
    return stateRef.current.lastDailyDate !== cmTodayStr()
  }, [])

  /* ==============================================================
     ACTIONS: SAVE / RESET
     ============================================================== */

  const saveGame = useCallback((): void => {
    const s = stateRef.current
    try {
      localStorage.setItem(CM_SAVE_KEY, JSON.stringify({ ...s, sessionStartTime: s.lastSaveTime }))
    } catch { /* ignore */ }
  }, [])

  const resetGame = useCallback((): void => {
    try { localStorage.removeItem(CM_SAVE_KEY) } catch { /* ignore */ }
    setState({ ...CM_INITIAL_STATE, sessionStartTime: Date.now() })
  }, [])

  const loadGameState = useCallback((): CmGameState => {
    return stateRef.current
  }, [])

  /* ==============================================================
     MEMOIZED CONSTANTS (for convenience)
     ============================================================== */

  const allTitles = useMemo(() => [...CM_TITLES], [])
  const allCrystals = useMemo(() => [...CM_CRYSTALS], [])
  const allMines = useMemo(() => [...CM_MINE_LEVELS], [])
  const allCreatures = useMemo(() => [...CM_CREATURES], [])
  const allEquipment = useMemo(() => [...CM_EQUIPMENT], [])
  const allRecipes = useMemo(() => [...CM_RECIPES], [])
  const allAchievements = useMemo(() => [...CM_ACHIEVEMENTS], [])
  const allEvents = useMemo(() => [...CM_EVENTS], [])
  const rarityData = useMemo(() => ({ ...CM_RARITY }), [])
  const rarityOrder = useMemo(() => [...CM_RARITY_ORDER], [])
  const themeColors = useMemo(() => ({ ...CM_THEME_COLORS }), [])
  const xpTable = useMemo(() => [...CM_XP_TABLE], [])
  const actionPowerBase = useMemo(() => ({ ...CM_ACTION_POWER_BASE }), [])
  const actionCoinCost = useMemo(() => ({ ...CM_ACTION_COIN_COST }), [])
  const actionXpReward = useMemo(() => ({ ...CM_ACTION_XP_REWARD }), [])

  /* ==============================================================
     RETURN
     ============================================================== */

  return {
    // State
    level: state.level,
    xp: state.xp,
    coins: state.coins,
    totalXp: state.totalXp,
    totalCoinsEarned: state.totalCoinsEarned,
    inventory: state.inventory,
    currentMineId: state.currentMineId,
    currentAction: state.currentAction,
    actionPower: state.actionPower,
    dailyStreak: state.dailyStreak,
    playTimeMinutes: state.playTimeMinutes,
    equipment: state.equipment,
    equippedWeapon: state.equippedWeapon,
    equippedArmor: state.equippedArmor,
    equippedTool: state.equippedTool,
    mineCart: state.mineCart,
    expedition: state.expedition,
    synthesisSlots: state.synthesisSlots,
    activeEvents: state.activeEvents,
    achievements: state.achievements,
    creatures: state.creatures,
    mines: state.mines,
    totalCrystalsMined: state.totalCrystalsMined,
    totalRareMined: state.totalRareMined,
    totalLegendaryMined: state.totalLegendaryMined,
    totalCrafted: state.totalCrafted,
    totalSynthesized: state.totalSynthesized,
    totalCreaturesDefeated: state.totalCreaturesDefeated,
    totalBossesDefeated: state.totalBossesDefeated,
    totalExpeditions: state.totalExpeditions,
    totalCoinsSpent: state.totalCoinsSpent,
    deepestMineReached: state.deepestMineReached,
    miningActionsCount: state.miningActionsCount,
    currentTitleId: state.currentTitleId,

    // Constants
    CM_MAX_LEVEL,
    allTitles,
    allCrystals,
    allMines,
    allCreatures,
    allEquipment,
    allRecipes,
    allAchievements,
    allEvents,
    rarityData,
    rarityOrder,
    themeColors,
    xpTable,
    actionPowerBase,
    actionCoinCost,
    actionXpReward,

    // Core Getters
    getLevel,
    getXp,
    getCoins,
    getTotalXp,
    getTotalCoinsEarned,
    getInventory,
    getCurrentMineId,
    getCurrentAction,
    getActionPower,
    getDailyStreak,
    getPlayTime,
    getTotalCrystalsMined,
    getTotalCrafted,
    getTotalSynthesized,
    getTotalCreaturesDefeated,
    getTotalBossesDefeated,
    getDeepestMineReached,
    getMiningActionsCount,
    getTotalExpeditions,
    getTotalCoinsSpent,

    // Title / Level
    getCurrentTitle,
    getTitleForLevel,
    getXpToNextLevel,
    getXpProgress,
    getPercentToNextLevel,
    getTitleBonusXp,
    getTitleBonusCoins,

    // Inventory
    getInventoryCount,
    getInventoryItem,
    getInventoryValue,
    getCartCapacity,
    getCartLoad,
    isCartFull,
    getCartContents,

    // Mines
    getMineInfo,
    getCurrentMineInfo,
    getAvailableMines,
    getLockedMines,
    getMineRecord,
    isMineExplored,
    getMineExplorationPercent,
    getMineCrystals,
    getMineCreatures,
    getMinesWithBosses,

    // Crystals
    getCrystalInfo,
    getCrystalsByRarity,
    getCrystalsByCategory,
    getRarityInfo,
    isCrystalRare,
    isCrystalLegendary,

    // Creatures
    getCreatureInfo,
    getCreaturesByType,
    getCreatureRecord,
    isCreatureDefeated,
    isCreatureTamed,
    getDefeatCount,
    getTameCost,

    // Equipment
    getEquipmentInfo,
    getEquipmentRecord,
    getEquipmentLevel,
    getEquipmentByType,
    getEquipmentByRarity,
    getEquippedWeapon,
    getEquippedArmor,
    getEquippedTool,
    getTotalMiningBonus,
    getTotalDefenseBonus,
    getUpgradeCost,

    // Recipes
    getRecipeInfo,
    getRecipesByRarity,
    getAvailableRecipes,
    getLockedRecipes,
    canCraftRecipe,
    getMissingIngredients,

    // Synthesis
    getSynthesisSlots,
    getSynthesisSlot,
    isSynthesisSlotBusy,
    getSynthesisRemainingTime,

    // Events
    getActiveEvents,
    getEventInfo,
    hasActiveEvent,
    isCrystalSurgeActive,
    isCaveInActive,
    isGemExhibitionActive,
    getEventMultiplier,

    // Expedition
    getExpedition,
    isExpeditionActive,
    getExpeditionRemainingTime,

    // Achievements
    getUnlockedAchievements,
    isAchievementUnlocked,
    getLockedAchievements,
    getAchievementProgress,

    // Actions: Mining
    performMineAction,
    swingPick,
    digDeep,
    blastRock,
    excavate,
    switchAction,

    // Actions: Travel
    travelToMine,
    unlockMine,

    // Actions: Selling
    sellCrystal,
    sellAllCrystals,
    sellCartContents,

    // Actions: Equipment
    equipItem,
    unequipItem,
    acquireEquipment,
    upgradeEquipment,

    // Actions: Crafting
    craftRecipe,

    // Actions: Synthesis
    startSynthesis,
    collectSynthesis,

    // Actions: Creatures
    encounterCreature,
    defeatCreature,
    tameCreature,

    // Actions: Mine Cart
    upgradeCart,
    getCartUpgradeCost,
    emptyCart,
    transferCartToInventory,

    // Actions: Expedition
    startExpedition,
    claimExpedition,
    checkExpedition,

    // Actions: Events
    triggerRandomEvent,
    triggerEvent,
    clearExpiredEvents,

    // Actions: Daily
    claimDailyReward,
    canClaimDaily,

    // Actions: Save / Reset
    saveGame,
    resetGame,
    loadGameState,
  }
}
