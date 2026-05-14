'use client'
import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type DoRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type DoCreatureType = 'passive' | 'neutral' | 'hostile' | 'boss'
type DoEventType = 'sandstorm' | 'oasis_bloom' | 'desert_festival' | 'mirage_wave' | 'scarab_surge' | 'trade_caravan' | 'tomb_awakening'
type DoBuildingType = 'tent' | 'well' | 'market' | 'garden' | 'watchtower' | 'temple' | 'caravansary' | 'palace'
type DoPatrolZone = 'dunes' | 'canyon' | 'oasis' | 'ruins' | 'tomb' | 'plateau'
type DoTombChamber = 'entrance' | 'corridor' | 'trap_room' | 'puzzle_hall' | 'treasure_vault' | 'pharaoh_chamber'
type DoTradeRoute = 'silk_road' | 'spice_trail' | 'incense_path' | 'gold_caravan'
type DoEventStatus = 'idle' | 'active' | 'ended'

interface DoRarityInfo {
  id: DoRarityTier
  name: string
  color: string
  glow: string
  xpMultiplier: number
  spawnWeight: number
  coinMultiplier: number
}

interface DoCreature {
  id: string
  name: string
  type: DoCreatureType
  rarity: DoRarityTier
  hp: number
  damage: number
  xpReward: number
  coinDrop: number
  description: string
  habitat: string[]
  tamedBonus: string
  color: string
}

interface DoLocation {
  id: string
  name: string
  description: string
  requiredLevel: number
  dangerLevel: number
  ambientColor: string
  creatureIds: string[]
  artifactChance: number
  coinReward: number
  xpReward: number
}

interface DoArtifact {
  id: string
  name: string
  rarity: DoRarityTier
  xpBonus: number
  coinBonus: number
  description: string
  lore: string
  color: string
}

interface DoTradingGood {
  id: string
  name: string
  basePrice: number
  volatility: number
  description: string
  category: string
  color: string
}

interface DoTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  bonusXpPercent: number
  bonusCoinPercent: number
  color: string
}

interface DoAchievement {
  id: string
  name: string
  description: string
  condition: string
  xpReward: number
  coinReward: number
  icon: string
  color: string
}

interface DoDesertEvent {
  id: string
  name: string
  type: DoEventType
  description: string
  duration: number
  effect: string
  effectValue: number
  color: string
}

interface DoBuildingDef {
  id: string
  name: string
  type: DoBuildingType
  baseCost: number
  maxLevel: number
  xpPerLevel: number
  coinPerLevel: number
  description: string
  color: string
}

interface DoPatrolDef {
  id: string
  name: string
  zone: DoPatrolZone
  requiredLevel: number
  duration: number
  xpReward: number
  coinReward: number
  dangerLevel: number
  description: string
  color: string
}

interface DoTombRoom {
  id: string
  name: string
  chamber: DoTombChamber
  requiredLevel: number
  dangerLevel: number
  xpReward: number
  coinReward: number
  artifactChance: number
  trapChance: number
  description: string
  color: string
}

interface DoCaravanDef {
  id: string
  name: string
  route: DoTradeRoute
  cost: number
  duration: number
  xpReward: number
  coinReward: number
  goodBonus: number
  requiredLevel: number
  description: string
  color: string
}

interface DoInventoryRecord {
  artifactId: string
  quantity: number
}

interface DoBuildingRecord {
  buildingId: string
  level: number
  built: boolean
}

interface DoCreatureRecord {
  creatureId: string
  encountered: boolean
  defeated: boolean
  tamed: boolean
  defeatCount: number
}

interface DoLocationRecord {
  locationId: string
  discovered: boolean
  visits: number
  totalXpGained: number
  totalCoinsGained: number
}

interface DoAchievementRecord {
  achievementId: string
  unlockedAt: number
}

interface DoActiveEvent {
  eventId: string
  startTime: number
  endTime: number
  status: DoEventStatus
}

interface DoTradeLogEntry {
  goodId: string
  action: 'buy' | 'sell'
  quantity: number
  price: number
  timestamp: number
}

interface DoPatrolRecord {
  patrolId: string
  completed: boolean
  lastCompleted: number | null
  completionCount: number
}

interface DoTombRecord {
  roomId: string
  explored: boolean
  cleared: boolean
  artifactsFound: number
}

interface DoCaravanRecord {
  caravanId: string
  dispatched: boolean
  dispatchTime: number | null
  completions: number
}

interface DoGameState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  currentTitleId: string
  inventory: DoInventoryRecord[]
  buildings: DoBuildingRecord[]
  creatures: DoCreatureRecord[]
  locations: DoLocationRecord[]
  achievements: DoAchievementRecord[]
  activeEvents: DoActiveEvent[]
  tradeLogs: DoTradeLogEntry[]
  patrolRecords: DoPatrolRecord[]
  tombRecords: DoTombRecord[]
  caravanRecords: DoCaravanRecord[]
  dailyStreak: number
  lastDailyDate: string
  currentLocationId: string | null
  currentPatrolId: string | null
  currentTombRoomId: string | null
  sandstormActive: boolean
  sandstormIntensity: number
  sandstormStartTime: number | null
  oasisHealth: number
  oasisMaxHealth: number
  totalCreaturesDefeated: number
  totalCreaturesTamed: number
  totalArtifactsFound: number
  totalPatrolsCompleted: number
  totalTombRoomsCleared: number
  totalCaravansCompleted: number
  totalTradesExecuted: number
  totalSandstormsSurvived: number
  totalEventsCompleted: number
  playTimeMinutes: number
  sessionStartTime: number
  seed: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const DO_SAVE_KEY = 'desert-oasis-save'
const DO_MAX_LEVEL = 50
const DO_STORAGE_KEY = 'desert-oasis-state'
const DO_AUTO_SAVE_INTERVAL = 30000
const DO_DAILY_STREAK_WINDOW = 86400000
const DO_MAX_INVENTORY_ITEM = 999
const DO_TRADE_LOG_MAX = 100
const DO_EVENT_CHECK_INTERVAL = 60000
const DO_SANDSTORM_BASE_DURATION = 120000
const DO_PATROL_BASE_DURATION = 60000
const DO_CARAVAN_BASE_DURATION = 180000
const DO_INITIAL_COINS = 150
const DO_OASIS_BASE_HEALTH = 100
const DO_BUILDING_MAX_LEVEL = 10
const DO_SANDSTORM_MAX_INTENSITY = 100

const DO_THEME_COLORS = {
  sandGold: '#DAA520',
  sunsetOrange: '#FF8C00',
  oasisTeal: '#40E0D0',
  desertRed: '#CD853F',
  nightBlue: '#191970',
  palmGreen: '#2E8B57',
  background: '#2C1810',
  surface: '#3D2B1F',
  textPrimary: '#F5DEB3',
  textSecondary: '#D2B48C',
  accent: '#DAA520',
  danger: '#CD853F',
  success: '#2E8B57',
  warning: '#FF8C00',
}

const DO_COLORS: Record<string, string> = {
  sandGold: '#DAA520',
  sunsetOrange: '#FF8C00',
  oasisTeal: '#40E0D0',
  desertRed: '#CD853F',
  nightBlue: '#191970',
  palmGreen: '#2E8B57',
}

const DO_RARITY: Record<DoRarityTier, DoRarityInfo> = {
  common: { id: 'common', name: 'Common', color: '#a0a0a0', glow: '#808080', xpMultiplier: 1, spawnWeight: 45, coinMultiplier: 1 },
  uncommon: { id: 'uncommon', name: 'Uncommon', color: '#2E8B57', glow: '#246b43', xpMultiplier: 1.5, spawnWeight: 28, coinMultiplier: 2 },
  rare: { id: 'rare', name: 'Rare', color: '#40E0D0', glow: '#30b0a0', xpMultiplier: 2.5, spawnWeight: 16, coinMultiplier: 4 },
  epic: { id: 'epic', name: 'Epic', color: '#FF8C00', glow: '#cc7000', xpMultiplier: 4, spawnWeight: 8, coinMultiplier: 8 },
  legendary: { id: 'legendary', name: 'Legendary', color: '#DAA520', glow: '#b8891a', xpMultiplier: 7, spawnWeight: 3, coinMultiplier: 15 },
}

const DO_RARITY_ORDER: readonly DoRarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']

const DO_XP_TABLE: number[] = Array.from({ length: DO_MAX_LEVEL + 1 }, (_, i) =>
  i === 0 ? 0 : Math.floor(85 * Math.pow(i, 1.42) + i * 30),
)

// ═══════════════════════════════════════════════════════════════════════════════
// TITLES (8)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_TITLES: DoTitle[] = [
  { id: 'nomad', name: 'Nomad', requiredLevel: 1, description: 'A wanderer of the endless dunes.', bonusXpPercent: 0, bonusCoinPercent: 0, color: '#a0a0a0' },
  { id: 'sand-walker', name: 'Sand Walker', requiredLevel: 5, description: 'Learned to read the shifting sands.', bonusXpPercent: 5, bonusCoinPercent: 3, color: '#CD853F' },
  { id: 'dune-ranger', name: 'Dune Ranger', requiredLevel: 12, description: 'Guardian of the golden dunes.', bonusXpPercent: 10, bonusCoinPercent: 7, color: '#DAA520' },
  { id: 'oasis-keeper', name: 'Oasis Keeper', requiredLevel: 20, description: 'Tender of the sacred springs.', bonusXpPercent: 15, bonusCoinPercent: 12, color: '#40E0D0' },
  { id: 'scarab-champion', name: 'Scarab Champion', requiredLevel: 28, description: 'Blessed by the ancient scarab.', bonusXpPercent: 20, bonusCoinPercent: 16, color: '#2E8B57' },
  { id: 'tomb-raider', name: 'Tomb Raider', requiredLevel: 35, description: 'Explorer of forbidden crypts.', bonusXpPercent: 28, bonusCoinPercent: 22, color: '#FF8C00' },
  { id: 'desert-vizier', name: 'Desert Vizier', requiredLevel: 42, description: 'Chief advisor to the desert lords.', bonusXpPercent: 38, bonusCoinPercent: 30, color: '#191970' },
  { id: 'desert-sultan', name: 'Desert Sultan', requiredLevel: 50, description: 'Supreme ruler of the Desert Kingdom.', bonusXpPercent: 50, bonusCoinPercent: 40, color: '#DAA520' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// CREATURES (38 species)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_CREATURES: DoCreature[] = [
  { id: 'desert-fox', name: 'Desert Fox', type: 'passive', rarity: 'common', hp: 25, damage: 4, xpReward: 10, coinDrop: 5, description: 'A sleek fox with sand-colored fur that blends into the dunes.', habitat: ['golden-dunes', 'palm-valley'], tamedBonus: 'Improved scavenging yields', color: '#CD853F' },
  { id: 'sand-lizard', name: 'Sand Lizard', type: 'passive', rarity: 'common', hp: 15, damage: 2, xpReward: 6, coinDrop: 3, description: 'A small lizard that basks on sun-warmed rocks.', habitat: ['golden-dunes', 'ancient-ruins'], tamedBonus: 'Desert heat resistance', color: '#DAA520' },
  { id: 'dung-beetle', name: 'Sacred Dung Beetle', type: 'passive', rarity: 'common', hp: 10, damage: 0, xpReward: 8, coinDrop: 4, description: 'Revered beetle that rolls treasures across the sand.', habitat: ['golden-dunes', 'sand-bazaar'], tamedBonus: 'Bonus artifact discovery', color: '#8B7355' },
  { id: 'fennec', name: 'Fennec', type: 'passive', rarity: 'uncommon', hp: 20, damage: 3, xpReward: 14, coinDrop: 7, description: 'An oversized-eared fox that hears tremors from far away.', habitat: ['golden-dunes', 'mirage-temple'], tamedBonus: 'Early danger detection', color: '#F5DEB3' },
  { id: 'jerboa', name: 'Jerboa', type: 'passive', rarity: 'common', hp: 12, damage: 1, xpReward: 7, coinDrop: 3, description: 'A tiny hopping rodent that leaps across the hot sand.', habitat: ['golden-dunes', 'starlight-desert'], tamedBonus: 'Increased movement speed bonus', color: '#DEB887' },
  { id: 'cobra', name: 'Desert Cobra', type: 'hostile', rarity: 'uncommon', hp: 45, damage: 15, xpReward: 22, coinDrop: 12, description: 'A venomous cobra that lurks near oases.', habitat: ['oasis-spring', 'palm-valley'], tamedBonus: 'Poison immunity in tombs', color: '#2E8B57' },
  { id: 'scorpion', name: 'Giant Scorpion', type: 'hostile', rarity: 'uncommon', hp: 55, damage: 18, xpReward: 25, coinDrop: 14, description: 'A massive scorpion with a shimmering exoskeleton.', habitat: ['ancient-ruins', 'scarab-tomb'], tamedBonus: 'Trap resistance bonus', color: '#8B0000' },
  { id: 'vulture', name: 'Desert Vulture', type: 'neutral', rarity: 'common', hp: 30, damage: 8, xpReward: 12, coinDrop: 6, description: 'Circling birds that follow travelers through the wastes.', habitat: ['golden-dunes', 'ancient-ruins'], tamedBonus: 'Far vision for patrols', color: '#4A4A4A' },
  { id: 'camel-spider', name: 'Camel Spider', type: 'hostile', rarity: 'uncommon', hp: 40, damage: 12, xpReward: 20, coinDrop: 10, description: 'A fast predatory arachnid that hunts at night.', habitat: ['starlight-desert', 'scarab-tomb'], tamedBonus: 'Night patrol bonus', color: '#696969' },
  { id: 'sand-cat', name: 'Sand Cat', type: 'passive', rarity: 'uncommon', hp: 22, damage: 5, xpReward: 16, coinDrop: 8, description: 'A rare wild cat that stalks the dunes at twilight.', habitat: ['golden-dunes', 'starlight-desert'], tamedBonus: 'Stealth bonus in tombs', color: '#F4A460' },
  { id: 'monitor-lizard', name: 'Desert Monitor', type: 'neutral', rarity: 'uncommon', hp: 70, damage: 14, xpReward: 28, coinDrop: 15, description: 'A large lizard that dominates small desert prey.', habitat: ['ancient-ruins', 'golden-dunes'], tamedBonus: 'Companion damage boost', color: '#556B2F' },
  { id: 'sand-wasp', name: 'Sand Wasp', type: 'hostile', rarity: 'common', hp: 18, damage: 10, xpReward: 11, coinDrop: 5, description: 'Aggressive wasps that build nests beneath the sand.', habitat: ['palm-valley', 'oasis-spring'], tamedBonus: 'Nest detection radius', color: '#DAA520' },
  { id: 'desert-hare', name: 'Desert Hare', type: 'passive', rarity: 'common', hp: 14, damage: 0, xpReward: 6, coinDrop: 3, description: 'Swift hares that dart between desert shrubs.', habitat: ['golden-dunes', 'palm-valley'], tamedBonus: 'Flee speed boost', color: '#DEB887' },
  { id: 'locust-swarm', name: 'Locust Swarm', type: 'hostile', rarity: 'uncommon', hp: 60, damage: 10, xpReward: 18, coinDrop: 8, description: 'A devastating swarm that strips vegetation bare.', habitat: ['golden-dunes', 'sand-bazaar'], tamedBonus: 'Crop protection bonus', color: '#808000' },
  { id: 'sand-dollar-crab', name: 'Sand Dollar Crab', type: 'passive', rarity: 'common', hp: 20, damage: 2, xpReward: 9, coinDrop: 5, description: 'Crabs that scuttle along oasis shorelines.', habitat: ['oasis-spring'], tamedBonus: 'Oasis resource bonus', color: '#FF6347' },
  { id: 'hyena', name: 'Desert Hyena', type: 'hostile', rarity: 'rare', hp: 90, damage: 22, xpReward: 40, coinDrop: 22, description: 'Cunning pack hunters that shadow caravans.', habitat: ['golden-dunes', 'sand-bazaar', 'ancient-ruins'], tamedBonus: 'Caravan guard bonus', color: '#696969' },
  { id: 'sand-golem', name: 'Sand Golem', type: 'hostile', rarity: 'rare', hp: 150, damage: 28, xpReward: 55, coinDrop: 30, description: 'Animated sand given form by ancient magic.', habitat: ['mirage-temple', 'scarab-tomb'], tamedBonus: 'Earth magic resistance', color: '#D2B48C' },
  { id: 'fire-salamander', name: 'Fire Salamander', type: 'neutral', rarity: 'rare', hp: 75, damage: 20, xpReward: 45, coinDrop: 25, description: 'A burning salamander born from desert heat.', habitat: ['mirage-temple', 'scarab-tomb'], tamedBonus: 'Fire resistance in tombs', color: '#FF4500' },
  { id: 'mummy-guard', name: 'Mummy Guard', type: 'hostile', rarity: 'rare', hp: 120, damage: 25, xpReward: 50, coinDrop: 28, description: 'Undead protectors of the ancient tombs.', habitat: ['scarab-tomb'], tamedBonus: 'Undead knowledge bonus', color: '#8B7355' },
  { id: 'scarab-beetle-giant', name: 'Giant Scarab', type: 'hostile', rarity: 'rare', hp: 130, damage: 24, xpReward: 48, coinDrop: 26, description: 'An enormous sacred beetle that guards treasure.', habitat: ['scarab-tomb'], tamedBonus: 'Treasure sense improvement', color: '#006400' },
  { id: 'desert-owl', name: 'Desert Owl', type: 'passive', rarity: 'rare', hp: 35, damage: 6, xpReward: 30, coinDrop: 18, description: 'A wise owl that nests in desert cliffs.', habitat: ['ancient-ruins', 'starlight-desert'], tamedBonus: 'Night exploration vision', color: '#8B4513' },
  { id: 'sphinx-cat', name: 'Sphinx Cat', type: 'neutral', rarity: 'epic', hp: 100, damage: 18, xpReward: 65, coinDrop: 40, description: 'A mystical feline with riddling intelligence.', habitat: ['mirage-temple', 'ancient-ruins'], tamedBonus: 'Riddle-solving bonus', color: '#DAA520' },
  { id: 'dust-devil', name: 'Dust Devil', type: 'hostile', rarity: 'rare', hp: 80, damage: 22, xpReward: 42, coinDrop: 24, description: 'A minor elemental spirit of swirling dust.', habitat: ['golden-dunes', 'starlight-desert'], tamedBonus: 'Wind resistance', color: '#C0C0C0' },
  { id: 'sandworm', name: 'Sand Worm', type: 'hostile', rarity: 'epic', hp: 250, damage: 40, xpReward: 90, coinDrop: 55, description: 'A colossal worm that tunnels beneath the dunes.', habitat: ['golden-dunes', 'starlight-desert'], tamedBonus: 'Tremor sense for dangers', color: '#8B0000' },
  { id: 'ghost-pharaoh', name: 'Ghost Pharaoh', type: 'boss', rarity: 'epic', hp: 400, damage: 35, xpReward: 150, coinDrop: 100, description: 'The spectral remains of a powerful desert king.', habitat: ['scarab-tomb'], tamedBonus: 'Ancient authority bonus', color: '#DAA520' },
  { id: 'djinn', name: 'Djinn', type: 'neutral', rarity: 'legendary', hp: 180, damage: 30, xpReward: 120, coinDrop: 80, description: 'A powerful spirit trapped in a golden lamp.', habitat: ['mirage-temple', 'oasis-spring'], tamedBonus: 'Wish-granting power', color: '#40E0D0' },
  { id: 'basilisk', name: 'Basilisk', type: 'hostile', rarity: 'epic', hp: 200, damage: 45, xpReward: 100, coinDrop: 60, description: 'A serpent whose gaze turns flesh to stone.', habitat: ['scarab-tomb', 'ancient-ruins'], tamedBonus: 'Petrification immunity', color: '#2F4F4F' },
  { id: 'roc', name: 'Roc', type: 'hostile', rarity: 'legendary', hp: 350, damage: 50, xpReward: 180, coinDrop: 120, description: 'A gigantic bird of prey from ancient legends.', habitat: ['starlight-desert', 'golden-dunes'], tamedBonus: 'Aerial scouting ability', color: '#F5F5DC' },
  { id: 'manticore', name: 'Manticore', type: 'boss', rarity: 'epic', hp: 450, damage: 42, xpReward: 160, coinDrop: 110, description: 'A fearsome beast with the body of a lion and tail of a scorpion.', habitat: ['golden-dunes', 'ancient-ruins'], tamedBonus: 'Beast lord presence', color: '#B22222' },
  { id: 'anubis-hound', name: 'Anubis Hound', type: 'hostile', rarity: 'epic', hp: 160, damage: 32, xpReward: 85, coinDrop: 50, description: 'A black jackal-headed guardian of the dead.', habitat: ['scarab-tomb'], tamedBonus: 'Death ward protection', color: '#191970' },
  { id: 'desert-dragon', name: 'Desert Dragon', type: 'boss', rarity: 'legendary', hp: 600, damage: 55, xpReward: 250, coinDrop: 180, description: 'An ancient dragon adapted to the harsh desert.', habitat: ['mirage-temple', 'starlight-desert'], tamedBonus: 'Dragon fire breath ability', color: '#FF8C00' },
  { id: 'phoenix', name: 'Phoenix', type: 'neutral', rarity: 'legendary', hp: 200, damage: 25, xpReward: 200, coinDrop: 150, description: 'A reborn bird wreathed in eternal flames.', habitat: ['mirage-temple'], tamedBonus: 'Rebirth resurrection chance', color: '#FF4500' },
  { id: 'ifrit', name: 'Ifrit', type: 'hostile', rarity: 'legendary', hp: 500, damage: 60, xpReward: 220, coinDrop: 160, description: 'A powerful fire spirit from the deepest desert.', habitat: ['mirage-temple', 'scarab-tomb'], tamedBonus: 'Fire command ability', color: '#FF0000' },
  { id: 'sphinx', name: 'Great Sphinx', type: 'boss', rarity: 'legendary', hp: 800, damage: 48, xpReward: 350, coinDrop: 250, description: 'The mythical guardian of ancient wisdom and treasure.', habitat: ['mirage-temple', 'ancient-ruins'], tamedBonus: 'Ultimate wisdom and knowledge', color: '#DAA520' },
  { id: 'nomad-spirit', name: 'Nomad Spirit', type: 'passive', rarity: 'rare', hp: 50, damage: 0, xpReward: 35, coinDrop: 20, description: 'The ghostly echo of a lost desert traveler.', habitat: ['starlight-desert', 'golden-dunes'], tamedBonus: 'Navigation guidance', color: '#B0C4DE' },
  { id: 'tarantula', name: 'Desert Tarantula', type: 'hostile', rarity: 'uncommon', hp: 50, damage: 14, xpReward: 20, coinDrop: 11, description: 'A large hairy spider that hunts at dusk.', habitat: ['scarab-tomb', 'ancient-ruins'], tamedBonus: 'Silk production bonus', color: '#8B4513' },
  { id: 'sand-parrot', name: 'Sand Parrot', type: 'passive', rarity: 'uncommon', hp: 18, damage: 2, xpReward: 13, coinDrop: 7, description: 'Colorful parrots found near desert oases.', habitat: ['oasis-spring', 'palm-valley'], tamedBonus: 'Communication boost', color: '#FF69B4' },
  { id: 'skeleton-warrior', name: 'Skeleton Warrior', type: 'hostile', rarity: 'rare', hp: 100, damage: 20, xpReward: 38, coinDrop: 20, description: 'Animated bones of an ancient desert soldier.', habitat: ['scarab-tomb', 'ancient-ruins'], tamedBonus: 'Undead command influence', color: '#F5F5DC' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// LOCATIONS (8)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_LOCATIONS: DoLocation[] = [
  { id: 'golden-dunes', name: 'Golden Dunes', description: 'Endless rolling dunes of shimmering gold stretching to every horizon.', requiredLevel: 1, dangerLevel: 2, ambientColor: '#DAA520', creatureIds: ['desert-fox', 'sand-lizard', 'dung-beetle', 'vulture', 'jerboa', 'hyena', 'dust-devil', 'sandworm', 'roc', 'desert-dragon', 'locust-swarm', 'manticore'], artifactChance: 0.08, coinReward: 15, xpReward: 10 },
  { id: 'oasis-spring', name: 'Oasis Spring', description: 'A crystal-clear spring surrounded by palms, the lifeblood of the desert.', requiredLevel: 1, dangerLevel: 1, ambientColor: '#40E0D0', creatureIds: ['cobra', 'sand-wasp', 'sand-dollar-crab', 'sand-parrot', 'djinn', 'phoenix'], artifactChance: 0.12, coinReward: 20, xpReward: 12 },
  { id: 'sand-bazaar', name: 'Sand Bazaar', description: 'A bustling marketplace where merchants trade exotic desert wares.', requiredLevel: 3, dangerLevel: 1, ambientColor: '#FF8C00', creatureIds: ['dung-beetle', 'locust-swarm', 'hyena', 'vulture'], artifactChance: 0.05, coinReward: 25, xpReward: 8 },
  { id: 'ancient-ruins', name: 'Ancient Ruins', description: 'Crumbled stone temples from a forgotten desert civilization.', requiredLevel: 6, dangerLevel: 4, ambientColor: '#CD853F', creatureIds: ['monitor-lizard', 'scorpion', 'sand-golem', 'mummy-guard', 'scarab-beetle-giant', 'desert-owl', 'sphinx-cat', 'basilisk', 'sphinx', 'skeleton-warrior', 'manticore', 'tarantula'], artifactChance: 0.2, coinReward: 35, xpReward: 25 },
  { id: 'scarab-tomb', name: 'Scarab Tomb', description: 'A vast underground tomb filled with traps, treasures, and restless dead.', requiredLevel: 10, dangerLevel: 7, ambientColor: '#191970', creatureIds: ['scorpion', 'mummy-guard', 'scarab-beetle-giant', 'ghost-pharaoh', 'basilisk', 'anubis-hound', 'camel-spider', 'ifrit', 'skeleton-warrior', 'tarantula'], artifactChance: 0.3, coinReward: 50, xpReward: 40 },
  { id: 'palm-valley', name: 'Palm Valley', description: 'A lush valley dotted with date palms and natural water pools.', requiredLevel: 5, dangerLevel: 2, ambientColor: '#2E8B57', creatureIds: ['desert-fox', 'sand-wasp', 'cobra', 'desert-hare', 'sand-parrot', 'sand-dollar-crab', 'sand-cat'], artifactChance: 0.1, coinReward: 22, xpReward: 15 },
  { id: 'mirage-temple', name: 'Mirage Temple', description: 'A temple that appears only during certain atmospheric conditions.', requiredLevel: 15, dangerLevel: 6, ambientColor: '#DAA520', creatureIds: ['fennec', 'sand-golem', 'fire-salamander', 'sphinx-cat', 'djinn', 'sandworm', 'desert-dragon', 'phoenix', 'ifrit', 'sphinx'], artifactChance: 0.25, coinReward: 60, xpReward: 45 },
  { id: 'starlight-desert', name: 'Starlight Desert', description: 'A mystical stretch of desert that glows under the night sky.', requiredLevel: 20, dangerLevel: 5, ambientColor: '#191970', creatureIds: ['jerboa', 'sand-cat', 'camel-spider', 'desert-owl', 'nomad-spirit', 'dust-devil', 'sandworm', 'roc'], artifactChance: 0.18, coinReward: 45, xpReward: 35 },
]

// ═══════════════════════════════════════════════════════════════════════════════
// ARTIFACTS (28)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_ARTIFACTS: DoArtifact[] = [
  { id: 'scarab-amulet', name: 'Scarab Amulet', rarity: 'common', xpBonus: 0.03, coinBonus: 0.02, description: 'A small carved scarab that brings good fortune.', lore: 'Crafted by the first desert priests to honor the sun god Ra.', color: '#006400' },
  { id: 'sand-vial', name: 'Vial of Enchanted Sand', rarity: 'common', xpBonus: 0.02, coinBonus: 0.03, description: 'Sand that glows faintly with ancient magic.', lore: 'Collected from the footprints of the Great Sphinx.', color: '#DAA520' },
  { id: 'oasis-shell', name: 'Oasis Pearl Shell', rarity: 'common', xpBonus: 0.03, coinBonus: 0.02, description: 'A pearlescent shell from a rare desert mollusk.', lore: 'Found only in the deepest oasis pools during full moons.', color: '#FFDEAD' },
  { id: 'palm-seed', name: 'Eternal Palm Seed', rarity: 'common', xpBonus: 0.02, coinBonus: 0.02, description: 'A seed that never dries out, radiating life energy.', lore: 'Said to have been planted by the first oasis spirit.', color: '#2E8B57' },
  { id: 'dune-crystal', name: 'Dune Crystal', rarity: 'uncommon', xpBonus: 0.06, coinBonus: 0.04, description: 'A crystal formed by millennia of desert pressure.', lore: 'Contains compressed starlight from ancient desert nights.', color: '#40E0D0' },
  { id: 'cobra-fang', name: 'Cobra Fang Dagger', rarity: 'uncommon', xpBonus: 0.05, coinBonus: 0.05, description: 'A dagger carved from a giant cobra\'s fang.', lore: 'Poison evaporates but the magic remains forever.', color: '#8B0000' },
  { id: 'nomad-map', name: 'Ancient Nomad Map', rarity: 'uncommon', xpBonus: 0.07, coinBonus: 0.03, description: 'A weathered map showing hidden oasis locations.', lore: 'Drawn by a nomad who walked every inch of the desert.', color: '#DEB887' },
  { id: 'trade-coin', name: 'First Trade Coin', rarity: 'uncommon', xpBonus: 0.04, coinBonus: 0.08, description: 'The original currency of the desert merchants.', lore: 'Minted from the first gold nugget found in the dunes.', color: '#FFD700' },
  { id: 'dried-rose', name: 'Petrified Desert Rose', rarity: 'uncommon', xpBonus: 0.06, coinBonus: 0.05, description: 'A rose turned to crystal by ancient magic.', lore: 'The last flower of a kingdom that sank beneath the sand.', color: '#FF69B4' },
  { id: 'sun-dial', name: 'Golden Sun Dial', rarity: 'rare', xpBonus: 0.1, coinBonus: 0.06, description: 'A sun dial that tells more than just the time.', lore: 'Created by astronomers who could read the future in shadows.', color: '#DAA520' },
  { id: 'pharaoh-mask', name: 'Pharaoh\'s Mask Fragment', rarity: 'rare', xpBonus: 0.08, coinBonus: 0.08, description: 'A fragment of a death mask of an unknown pharaoh.', lore: 'Each fragment contains a whisper of the pharaoh\'s power.', color: '#FFD700' },
  { id: 'sandstorm-bottle', name: 'Bottled Sandstorm', rarity: 'rare', xpBonus: 0.09, coinBonus: 0.07, description: 'A swirling mini-sandstorm trapped in glass.', lore: 'Captured by a mad wizard who tried to control the desert.', color: '#D2B48C' },
  { id: 'oasis-water', name: 'Tears of the Oasis', rarity: 'rare', xpBonus: 0.12, coinBonus: 0.05, description: 'Sacred water that never evaporates.', lore: 'The oasis spirit weeps when a traveler perishes of thirst.', color: '#40E0D0' },
  { id: 'golden-scarab', name: 'Golden Scarab', rarity: 'rare', xpBonus: 0.1, coinBonus: 0.1, description: 'A living golden beetle of immense power.', lore: 'The scarab of Khepri, god of the rising sun.', color: '#FFD700' },
  { id: 'tomb-key', name: 'Tomb Master Key', rarity: 'rare', xpBonus: 0.07, coinBonus: 0.12, description: 'A key that can open any tomb chamber.', lore: 'Forged by the tomb architects who sealed the pharaohs away.', color: '#708090' },
  { id: 'sphinx-riddle', name: 'Sphinx Riddle Tablet', rarity: 'epic', xpBonus: 0.15, coinBonus: 0.1, description: 'A stone tablet inscribed with unsolvable riddles.', lore: 'Only the worthy can read the true answer hidden within.', color: '#DAA520' },
  { id: 'djinn-lamp', name: 'Djinn Lamp', rarity: 'epic', xpBonus: 0.12, coinBonus: 0.15, description: 'An oil lamp that hums with contained power.', lore: 'Rub carefully—one wrong wish and the desert swallows you.', color: '#FF8C00' },
  { id: 'phoenix-feather', name: 'Phoenix Feather', rarity: 'epic', xpBonus: 0.18, coinBonus: 0.08, description: 'A feather that radiates warmth and rebirth energy.', lore: 'Falls during the phoenix\'s burning and is reborn with it.', color: '#FF4500' },
  { id: 'desert-scroll', name: 'Scroll of Sands', rarity: 'epic', xpBonus: 0.14, coinBonus: 0.12, description: 'An ancient scroll that controls the movement of dunes.', lore: 'Written in a language of wind and sand.', color: '#F5DEB3' },
  { id: 'anubis-scales', name: 'Scales of Anubis', rarity: 'epic', xpBonus: 0.1, coinBonus: 0.18, description: 'Golden scales that judge the weight of deeds.', lore: 'Used to weigh hearts against the feather of Ma\'at.', color: '#FFD700' },
  { id: 'eye-of-ra', name: 'Eye of Ra', rarity: 'epic', xpBonus: 0.16, coinBonus: 0.14, description: 'A blazing eye amulet of immense solar power.', lore: 'The all-seeing eye that burns away darkness and deceit.', color: '#FF8C00' },
  { id: 'book-of-dead', name: 'Book of the Dead', rarity: 'legendary', xpBonus: 0.22, coinBonus: 0.15, description: 'An ancient papyrus containing secrets of the afterlife.', lore: 'Those who read it gain power over death itself.', color: '#191970' },
  { id: 'scepter-of-sands', name: 'Scepter of Shifting Sands', rarity: 'legendary', xpBonus: 0.2, coinBonus: 0.2, description: 'A scepter that commands the desert itself.', lore: 'Wielded by the first Desert Sultan to carve his kingdom from nothing.', color: '#DAA520' },
  { id: 'eternal-flask', name: 'Eternal Oasis Flask', rarity: 'legendary', xpBonus: 0.18, coinBonus: 0.22, description: 'A flask that produces infinite pure water.', lore: 'Filled from the Genesis Spring, the source of all desert water.', color: '#40E0D0' },
  { id: 'crown-of-pharaohs', name: 'Crown of the Pharaohs', rarity: 'legendary', xpBonus: 0.25, coinBonus: 0.2, description: 'The unified crown of all desert rulers.', lore: 'When worn, the desert recognizes you as its rightful king.', color: '#FFD700' },
  { id: 'time-hourglass', name: 'Hourglass of Eternity', rarity: 'legendary', xpBonus: 0.2, coinBonus: 0.25, description: 'An hourglass whose sand flows upward.', lore: 'Time flows differently within its presence.', color: '#C0C0C0' },
  { id: 'star-map-desert', name: 'Desert Star Map', rarity: 'legendary', xpBonus: 0.24, coinBonus: 0.18, description: 'A map of constellations visible only from the desert.', lore: 'Aligns with the stars once every thousand years to reveal a path.', color: '#191970' },
  { id: 'heart-of-desert', name: 'Heart of the Desert', rarity: 'legendary', xpBonus: 0.3, coinBonus: 0.3, description: 'The crystallized essence of the desert itself.', lore: 'The desert is alive, and this is its beating heart.', color: '#DAA520' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TRADING GOODS (22)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_TRADING_GOODS: DoTradingGood[] = [
  { id: 'spices', name: 'Exotic Spices', basePrice: 15, volatility: 0.3, description: 'Aromatic spices from the eastern dunes.', category: 'consumable', color: '#FF8C00' },
  { id: 'silk', name: 'Desert Silk', basePrice: 40, volatility: 0.25, description: 'Fine silk woven by desert spiders.', category: 'luxury', color: '#F5DEB3' },
  { id: 'dates', name: 'Sun-Ripened Dates', basePrice: 8, volatility: 0.15, description: 'Sweet dates from oasis palm trees.', category: 'food', color: '#8B4513' },
  { id: 'gold-dust', name: 'Gold Dust', basePrice: 80, volatility: 0.4, description: 'Raw gold flakes from desert rivers.', category: 'material', color: '#FFD700' },
  { id: 'incense', name: 'Sacred Incense', basePrice: 25, volatility: 0.2, description: 'Fragrant resin burned in desert temples.', category: 'luxury', color: '#DEB887' },
  { id: 'myrrh', name: 'Desert Myrrh', basePrice: 35, volatility: 0.35, description: 'Precious myrrh harvested from desert shrubs.', category: 'luxury', color: '#8B0000' },
  { id: 'water-skins', name: 'Enchanted Water Skins', basePrice: 12, volatility: 0.1, description: 'Water skins that keep water cool forever.', category: 'tool', color: '#40E0D0' },
  { id: 'scarabs', name: 'Carved Scarabs', basePrice: 30, volatility: 0.2, description: 'Decorative scarabs carved from precious stones.', category: 'trinket', color: '#006400' },
  { id: 'medicine', name: 'Desert Herbs', basePrice: 18, volatility: 0.25, description: 'Medicinal herbs from hidden desert gardens.', category: 'consumable', color: '#2E8B57' },
  { id: 'ceramics', name: 'Painted Ceramics', basePrice: 22, volatility: 0.15, description: 'Hand-painted pottery with desert motifs.', category: 'craft', color: '#CD853F' },
  { id: 'jewels', name: 'Desert Jewels', basePrice: 100, volatility: 0.45, description: 'Precious gems mined from desert caves.', category: 'luxury', color: '#9370DB' },
  { id: 'olive-oil', name: 'Oasis Olive Oil', basePrice: 10, volatility: 0.12, description: 'Premium olive oil from oasis groves.', category: 'food', color: '#808000' },
  { id: 'papyrus', name: 'Ancient Papyrus', basePrice: 28, volatility: 0.3, description: 'Preserved papyrus scrolls with forgotten texts.', category: 'material', color: '#F5DEB3' },
  { id: 'frankincense', name: 'Pure Frankincense', basePrice: 45, volatility: 0.35, description: 'The finest frankincense from high desert trees.', category: 'luxury', color: '#FFFACD' },
  { id: 'copper-ingots', name: 'Copper Ingots', basePrice: 20, volatility: 0.2, description: 'Refined copper from desert mines.', category: 'material', color: '#B87333' },
  { id: 'tapestries', name: 'Desert Tapestries', basePrice: 55, volatility: 0.25, description: 'Woven tapestries depicting desert legends.', category: 'craft', color: '#8B4513' },
  { id: 'wine', name: 'Desert Wine', basePrice: 32, volatility: 0.2, description: 'Wine made from rare desert grapes.', category: 'consumable', color: '#722F37' },
  { id: 'henna', name: 'Desert Henna', basePrice: 14, volatility: 0.18, description: 'Natural henna for traditional body art.', category: 'craft', color: '#2E8B57' },
  { id: 'lapis-lazuli', name: 'Lapis Lazuli', basePrice: 70, volatility: 0.4, description: 'Deep blue gemstone prized by desert artisans.', category: 'material', color: '#191970' },
  { id: 'perfume', name: 'Desert Rose Perfume', basePrice: 50, volatility: 0.3, description: 'Exquisite perfume distilled from desert roses.', category: 'luxury', color: '#FF69B4' },
  { id: 'telescope', name: 'Desert Telescope', basePrice: 90, volatility: 0.15, description: 'A brass telescope for stargazing.', category: 'tool', color: '#C0C0C0' },
  { id: 'camel-saddles', name: 'Ornate Camel Saddles', basePrice: 38, volatility: 0.18, description: 'Decorative saddles for caravan camels.', category: 'tool', color: '#8B4513' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// ACHIEVEMENTS (17)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_ACHIEVEMENTS: DoAchievement[] = [
  { id: 'first-steps', name: 'First Steps in Sand', description: 'Begin your desert journey.', condition: 'level >= 1', xpReward: 20, coinReward: 30, icon: '👣', color: '#DAA520' },
  { id: 'dune-master', name: 'Dune Master', description: 'Reach level 10.', condition: 'level >= 10', xpReward: 100, coinReward: 150, icon: '🏜️', color: '#FF8C00' },
  { id: 'oasis-founder', name: 'Oasis Founder', description: 'Build your first structure.', condition: 'buildings_built >= 1', xpReward: 50, coinReward: 80, icon: '🏗️', color: '#40E0D0' },
  { id: 'scarab-hunter', name: 'Scarab Hunter', description: 'Defeat 50 desert creatures.', condition: 'totalCreaturesDefeated >= 50', xpReward: 150, coinReward: 200, icon: '🪲', color: '#006400' },
  { id: 'tomb-raider-ach', name: 'Tomb Raider', description: 'Clear 10 tomb rooms.', condition: 'totalTombRoomsCleared >= 10', xpReward: 200, coinReward: 250, icon: '⚱️', color: '#191970' },
  { id: 'merchant-prince', name: 'Merchant Prince', description: 'Execute 25 trades.', condition: 'totalTradesExecuted >= 25', xpReward: 120, coinReward: 300, icon: '💰', color: '#FFD700' },
  { id: 'storm-survivor', name: 'Storm Survivor', description: 'Survive 5 sandstorms.', condition: 'totalSandstormsSurvived >= 5', xpReward: 180, coinReward: 150, icon: '🌪️', color: '#D2B48C' },
  { id: 'patrol-legend', name: 'Patrol Legend', description: 'Complete 20 desert patrols.', condition: 'totalPatrolsCompleted >= 20', xpReward: 160, coinReward: 200, icon: '🚶', color: '#CD853F' },
  { id: 'caravan-lord', name: 'Caravan Lord', description: 'Complete 15 trading caravans.', condition: 'totalCaravansCompleted >= 15', xpReward: 200, coinReward: 350, icon: '🐫', color: '#DAA520' },
  { id: 'artifact-collector', name: 'Artifact Collector', description: 'Collect 15 different artifacts.', condition: 'uniqueArtifacts >= 15', xpReward: 250, coinReward: 300, icon: '🏺', color: '#FF8C00' },
  { id: 'creature-tamer', name: 'Creature Tamer', description: 'Tame 10 desert creatures.', condition: 'totalCreaturesTamed >= 10', xpReward: 180, coinReward: 180, icon: '🐾', color: '#2E8B57' },
  { id: 'event-hero', name: 'Event Hero', description: 'Complete 10 desert events.', condition: 'totalEventsCompleted >= 10', xpReward: 200, coinReward: 250, icon: '🎉', color: '#FF69B4' },
  { id: 'desert-scholar', name: 'Desert Scholar', description: 'Discover all 8 locations.', condition: 'locationsDiscovered >= 8', xpReward: 300, coinReward: 400, icon: '📜', color: '#40E0D0' },
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Maintain a 7-day login streak.', condition: 'dailyStreak >= 7', xpReward: 100, coinReward: 150, icon: '🔥', color: '#FF4500' },
  { id: 'treasure-monger', name: 'Treasure Monger', description: 'Earn 10,000 total coins.', condition: 'totalCoinsEarned >= 10000', xpReward: 150, coinReward: 500, icon: '👑', color: '#FFD700' },
  { id: 'pharaoh-ascend', name: 'Pharaoh\'s Ascent', description: 'Reach level 50.', condition: 'level >= 50', xpReward: 500, coinReward: 1000, icon: '🏛️', color: '#DAA520' },
  { id: 'mythic-finder', name: 'Mythic Finder', description: 'Find a legendary artifact.', condition: 'hasLegendaryArtifact', xpReward: 300, coinReward: 500, icon: '⭐', color: '#FFD700' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// DESERT EVENTS (7)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_EVENTS: DoDesertEvent[] = [
  { id: 'sandstorm-event', name: 'Great Sandstorm', type: 'sandstorm', description: 'A massive sandstorm engulfs the desert! Find shelter or brave the winds.', duration: 300000, effect: 'danger_increase', effectValue: 50, color: '#D2B48C' },
  { id: 'oasis-bloom-event', name: 'Oasis Bloom', type: 'oasis_bloom', description: 'The oases burst with rare flowers and magical energy.', duration: 600000, effect: 'xp_boost', effectValue: 50, color: '#40E0D0' },
  { id: 'desert-festival-event', name: 'Desert Festival', type: 'desert_festival', description: 'A grand festival with doubled trading profits and rare merchants.', duration: 900000, effect: 'coin_boost', effectValue: 100, color: '#FF8C00' },
  { id: 'mirage-wave-event', name: 'Mirage Wave', type: 'mirage_wave', description: 'Reality bends as powerful mirages reveal hidden paths.', duration: 480000, effect: 'artifact_chance', effectValue: 200, color: '#DAA520' },
  { id: 'scarab-surge-event', name: 'Scarab Surge', type: 'scarab_surge', description: 'Millions of scarabs swarm the desert, bringing buried treasure to the surface.', duration: 420000, effect: 'coin_rain', effectValue: 75, color: '#006400' },
  { id: 'trade-caravan-event', name: 'Grand Caravan Arrival', type: 'trade_caravan', description: 'A legendary caravan arrives with exotic goods from distant lands.', duration: 720000, effect: 'trade_discount', effectValue: 30, color: '#FFD700' },
  { id: 'tomb-awakening-event', name: 'Tomb Awakening', type: 'tomb_awakening', description: 'Ancient tombs glow with energy, revealing new chambers and dangers.', duration: 540000, effect: 'tomb_bonus', effectValue: 60, color: '#191970' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// BUILDINGS (8 types)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_BUILDINGS: DoBuildingDef[] = [
  { id: 'nomad-tent', name: 'Nomad Tent', type: 'tent', baseCost: 50, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 5, coinPerLevel: 3, description: 'A sturdy tent for desert travelers.', color: '#CD853F' },
  { id: 'water-well', name: 'Water Well', type: 'well', baseCost: 80, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 8, coinPerLevel: 5, description: 'A well that draws water from deep aquifers.', color: '#40E0D0' },
  { id: 'trade-post', name: 'Trade Post', type: 'market', baseCost: 120, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 10, coinPerLevel: 10, description: 'A marketplace for buying and selling goods.', color: '#FF8C00' },
  { id: 'herb-garden', name: 'Herb Garden', type: 'garden', baseCost: 100, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 7, coinPerLevel: 6, description: 'A garden growing rare desert medicinal plants.', color: '#2E8B57' },
  { id: 'watch-tower', name: 'Watch Tower', type: 'watchtower', baseCost: 150, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 12, coinPerLevel: 8, description: 'A tower for spotting sandstorms and approaching caravans.', color: '#DAA520' },
  { id: 'sun-temple', name: 'Sun Temple', type: 'temple', baseCost: 300, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 20, coinPerLevel: 15, description: 'A temple for worship and magical rituals.', color: '#FF8C00' },
  { id: 'caravansary', name: 'Grand Caravansary', type: 'caravansary', baseCost: 500, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 25, coinPerLevel: 20, description: 'A grand inn for traveling merchants and their caravans.', color: '#DAA520' },
  { id: 'sand-palace', name: 'Sand Palace', type: 'palace', baseCost: 1000, maxLevel: DO_BUILDING_MAX_LEVEL, xpPerLevel: 40, coinPerLevel: 35, description: 'A magnificent palace befitting a Desert Sultan.', color: '#FFD700' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// PATROLS (8)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_PATROLS: DoPatrolDef[] = [
  { id: 'dune-sweep', name: 'Dune Sweep', zone: 'dunes', requiredLevel: 1, duration: 30000, xpReward: 15, coinReward: 10, dangerLevel: 1, description: 'A light patrol across the nearest dunes.', color: '#DAA520' },
  { id: 'canyon-watch', name: 'Canyon Watch', zone: 'canyon', requiredLevel: 5, duration: 45000, xpReward: 25, coinReward: 18, dangerLevel: 2, description: 'Guard the canyon passages from bandits.', color: '#CD853F' },
  { id: 'oasis-guard', name: 'Oasis Guard', zone: 'oasis', requiredLevel: 3, duration: 35000, xpReward: 20, coinReward: 15, dangerLevel: 1, description: 'Protect the oasis from desert threats.', color: '#40E0D0' },
  { id: 'ruin-explore', name: 'Ruin Exploration', zone: 'ruins', requiredLevel: 8, duration: 60000, xpReward: 40, coinReward: 30, dangerLevel: 4, description: 'Explore the ancient ruins for artifacts.', color: '#8B7355' },
  { id: 'tomb-approach', name: 'Tomb Approach', zone: 'tomb', requiredLevel: 12, duration: 75000, xpReward: 55, coinReward: 45, dangerLevel: 6, description: 'Scout the entrance to the ancient tombs.', color: '#191970' },
  { id: 'plateau-survey', name: 'Plateau Survey', zone: 'plateau', requiredLevel: 15, duration: 90000, xpReward: 70, coinReward: 55, dangerLevel: 5, description: 'Survey the high plateau for resources and threats.', color: '#FF8C00' },
  { id: 'deep-desert-march', name: 'Deep Desert March', zone: 'dunes', requiredLevel: 25, duration: 120000, xpReward: 100, coinReward: 80, dangerLevel: 7, description: 'A perilous march into the deep desert.', color: '#D2B48C' },
  { id: 'pharaoh-trail', name: 'Pharaoh\'s Trail', zone: 'tomb', requiredLevel: 35, duration: 150000, xpReward: 150, coinReward: 120, dangerLevel: 9, description: 'Follow the legendary Pharaoh\'s Trail to hidden treasures.', color: '#FFD700' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// TOMB ROOMS (8)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_TOMB_ROOMS: DoTombRoom[] = [
  { id: 'tomb-entrance', name: 'Tomb Entrance', chamber: 'entrance', requiredLevel: 10, dangerLevel: 3, xpReward: 30, coinReward: 25, artifactChance: 0.1, trapChance: 0.1, description: 'The crumbling entrance to an ancient pharaoh\'s tomb.', color: '#8B7355' },
  { id: 'tomb-corridor', name: 'Hall of Echoes', chamber: 'corridor', requiredLevel: 12, dangerLevel: 4, xpReward: 40, coinReward: 35, artifactChance: 0.12, trapChance: 0.15, description: 'A long corridor where whispers of the dead echo endlessly.', color: '#A0522D' },
  { id: 'tomb-trap-room', name: 'Chamber of Traps', chamber: 'trap_room', requiredLevel: 15, dangerLevel: 6, xpReward: 55, coinReward: 45, artifactChance: 0.18, trapChance: 0.4, description: 'A room filled with deadly mechanical traps.', color: '#696969' },
  { id: 'tomb-puzzle-hall', name: 'Riddle Hall', chamber: 'puzzle_hall', requiredLevel: 18, dangerLevel: 5, xpReward: 65, coinReward: 55, artifactChance: 0.22, trapChance: 0.1, description: 'A hall where ancient riddles guard the way forward.', color: '#DAA520' },
  { id: 'tomb-treasure-vault', name: 'Treasure Vault', chamber: 'treasure_vault', requiredLevel: 22, dangerLevel: 7, xpReward: 80, coinReward: 100, artifactChance: 0.35, trapChance: 0.25, description: 'A vault overflowing with ancient treasures.', color: '#FFD700' },
  { id: 'tomb-pharaoh-chamber', name: 'Pharaoh\'s Rest', chamber: 'pharaoh_chamber', requiredLevel: 30, dangerLevel: 9, xpReward: 150, coinReward: 200, artifactChance: 0.5, trapChance: 0.2, description: 'The inner sanctum where the pharaoh sleeps for eternity.', color: '#DAA520' },
  { id: 'tomb-sphinx-chamber', name: 'Sphinx\'s Trial', chamber: 'puzzle_hall', requiredLevel: 25, dangerLevel: 8, xpReward: 100, coinReward: 80, artifactChance: 0.28, trapChance: 0.15, description: 'A chamber where the Sphinx poses its ultimate riddle.', color: '#40E0D0' },
  { id: 'tomb-catacombs', name: 'Deep Catacombs', chamber: 'corridor', requiredLevel: 20, dangerLevel: 7, xpReward: 70, coinReward: 60, artifactChance: 0.2, trapChance: 0.3, description: 'Winding catacombs beneath the main tomb structure.', color: '#191970' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// CARAVANS (8)
// ═══════════════════════════════════════════════════════════════════════════════

const DO_CARAVANS: DoCaravanDef[] = [
  { id: 'silk-road-caravan', name: 'Silk Road Caravan', route: 'silk_road', cost: 80, duration: 120000, xpReward: 30, coinReward: 60, goodBonus: 2, requiredLevel: 5, description: 'Send a caravan along the legendary Silk Road.', color: '#F5DEB3' },
  { id: 'spice-trail-caravan', name: 'Spice Trail Caravan', route: 'spice_trail', cost: 120, duration: 150000, xpReward: 45, coinReward: 90, goodBonus: 3, requiredLevel: 10, description: 'A caravan following the ancient spice trails.', color: '#FF8C00' },
  { id: 'incense-caravan', name: 'Incense Path Caravan', route: 'incense_path', cost: 150, duration: 180000, xpReward: 55, coinReward: 110, goodBonus: 4, requiredLevel: 15, description: 'Transport precious incense to distant temples.', color: '#DEB887' },
  { id: 'gold-caravan', name: 'Golden Caravan', route: 'gold_caravan', cost: 250, duration: 240000, xpReward: 80, coinReward: 200, goodBonus: 5, requiredLevel: 20, description: 'A heavily guarded caravan carrying gold across the desert.', color: '#FFD700' },
  { id: 'mirage-caravan', name: 'Mirage Express', route: 'silk_road', cost: 200, duration: 90000, xpReward: 40, coinReward: 75, goodBonus: 3, requiredLevel: 12, description: 'A fast caravan that travels through mirage shortcuts.', color: '#40E0D0' },
  { id: 'pharaoh-caravan', name: 'Pharaoh\'s Caravan', route: 'gold_caravan', cost: 400, duration: 300000, xpReward: 120, coinReward: 350, goodBonus: 8, requiredLevel: 30, description: 'A royal caravan bearing the pharaoh\'s seal.', color: '#DAA520' },
  { id: 'nomad-caravan', name: 'Nomad Trade Train', route: 'spice_trail', cost: 60, duration: 100000, xpReward: 25, coinReward: 45, goodBonus: 2, requiredLevel: 3, description: 'A small but reliable nomad trade train.', color: '#CD853F' },
  { id: 'starlight-caravan', name: 'Starlight Caravan', route: 'incense_path', cost: 300, duration: 200000, xpReward: 90, coinReward: 180, goodBonus: 6, requiredLevel: 25, description: 'A mysterious caravan that travels only by starlight.', color: '#191970' },
]

// ═══════════════════════════════════════════════════════════════════════════════
// SEEDED PRNG
// ═══════════════════════════════════════════════════════════════════════════════

function createPRNG(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function seededInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

function seededPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function seededShuffle<T>(rng: () => number, arr: readonly T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function xpForLevel(level: number): number {
  if (level >= DO_MAX_LEVEL) return Infinity
  return DO_XP_TABLE[level] ?? Math.floor(85 * Math.pow(level, 1.42) + level * 30)
}

function isSameDay(ts1: string, ts2: string): boolean {
  return ts1 === ts2
}

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function findDef<T extends { id: string }>(defs: readonly T[], id: string): T | undefined {
  return defs.find(d => d.id === id)
}

function dateHash(): number {
  const d = new Date()
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate()
}

function createInitialState(): DoGameState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: DO_INITIAL_COINS,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    currentTitleId: 'nomad',
    inventory: [],
    buildings: DO_BUILDINGS.map(b => ({ buildingId: b.id, level: 0, built: false })),
    creatures: DO_CREATURES.map(c => ({ creatureId: c.id, encountered: false, defeated: false, tamed: false, defeatCount: 0 })),
    locations: DO_LOCATIONS.slice(0, 2).map(l => ({ locationId: l.id, discovered: true, visits: 0, totalXpGained: 0, totalCoinsGained: 0 }))
      .concat(DO_LOCATIONS.slice(2).map(l => ({ locationId: l.id, discovered: false, visits: 0, totalXpGained: 0, totalCoinsGained: 0 }))),
    achievements: [],
    activeEvents: [],
    tradeLogs: [],
    patrolRecords: DO_PATROLS.map(p => ({ patrolId: p.id, completed: false, lastCompleted: null, completionCount: 0 })),
    tombRecords: DO_TOMB_ROOMS.map(r => ({ roomId: r.id, explored: false, cleared: false, artifactsFound: 0 })),
    caravanRecords: DO_CARAVANS.map(c => ({ caravanId: c.id, dispatched: false, dispatchTime: null, completions: 0 })),
    dailyStreak: 0,
    lastDailyDate: '',
    currentLocationId: 'golden-dunes',
    currentPatrolId: null,
    currentTombRoomId: null,
    sandstormActive: false,
    sandstormIntensity: 0,
    sandstormStartTime: null,
    oasisHealth: DO_OASIS_BASE_HEALTH,
    oasisMaxHealth: DO_OASIS_BASE_HEALTH,
    totalCreaturesDefeated: 0,
    totalCreaturesTamed: 0,
    totalArtifactsFound: 0,
    totalPatrolsCompleted: 0,
    totalTombRoomsCleared: 0,
    totalCaravansCompleted: 0,
    totalTradesExecuted: 0,
    totalSandstormsSurvived: 0,
    totalEventsCompleted: 0,
    playTimeMinutes: 0,
    sessionStartTime: Date.now(),
    seed: dateHash(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function useDesertOasis() {
  const [state, setState] = useState<DoGameState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(DO_STORAGE_KEY)
        if (saved) {
          const parsed = JSON.parse(saved) as DoGameState
          const merged = { ...createInitialState(), ...parsed }
          return merged
        }
      } catch {
        // ignore
      }
    }
    return createInitialState()
  })

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem(DO_STORAGE_KEY, JSON.stringify(stateRef.current))
    }, DO_AUTO_SAVE_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // Session play time
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => ({
        ...prev,
        playTimeMinutes: prev.playTimeMinutes + 1,
      }))
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Event tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now()
        const activeEvents = prev.activeEvents.filter(e => e.endTime > now)
        const justEnded = prev.activeEvents.filter(e => e.endTime <= now && e.status === 'active')
        if (justEnded.length > 0) {
          const completedEvents = justEnded.length
          return {
            ...prev,
            activeEvents: activeEvents.map(e => e.endTime > now ? e : { ...e, status: 'ended' }),
            totalEventsCompleted: prev.totalEventsCompleted + completedEvents,
            sandstormActive: !!(prev.sandstormActive && activeEvents.some(e => e.eventId === 'sandstorm-event')),
          }
        }
        return { ...prev }
      })
    }, DO_EVENT_CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  // ── Multiplier computations ─────────────────────────────────────────────

  const getTitleMultiplier = useCallback((currentState: DoGameState): { xp: number; coins: number } => {
    const title = findDef(DO_TITLES, currentState.currentTitleId)
    return { xp: 1 + (title?.bonusXpPercent ?? 0) / 100, coins: 1 + (title?.bonusCoinPercent ?? 0) / 100 }
  }, [])

  const getArtifactMultiplier = useCallback((currentState: DoGameState): { xp: number; coins: number } => {
    let xpMul = 0
    let coinMul = 0
    for (const item of currentState.inventory) {
      const def = findDef(DO_ARTIFACTS, item.artifactId)
      if (def) {
        xpMul += def.xpBonus * item.quantity
        coinMul += def.coinBonus * item.quantity
      }
    }
    return { xp: 1 + xpMul, coins: 1 + coinMul }
  }, [])

  const getEventMultiplier = useCallback((currentState: DoGameState): { xp: number; coins: number } => {
    let xpMul = 1
    let coinMul = 1
    const now = Date.now()
    for (const evt of currentState.activeEvents) {
      if (evt.endTime > now && evt.status === 'active') {
        const def = findDef(DO_EVENTS, evt.eventId)
        if (def) {
          if (def.effect === 'xp_boost') xpMul += def.effectValue / 100
          if (def.effect === 'coin_boost') coinMul += def.effectValue / 100
          if (def.effect === 'coin_rain') coinMul += def.effectValue / 200
        }
      }
    }
    return { xp: xpMul, coins: coinMul }
  }, [])

  const getBuildingMultiplier = useCallback((currentState: DoGameState): { xp: number; coins: number } => {
    let xpMul = 0
    let coinMul = 0
    for (const b of currentState.buildings) {
      const def = findDef(DO_BUILDINGS, b.buildingId)
      if (def && b.built && b.level > 0) {
        xpMul += (def.xpPerLevel * b.level) / 200
        coinMul += (def.coinPerLevel * b.level) / 200
      }
    }
    return { xp: 1 + xpMul, coins: 1 + coinMul }
  }, [])

  const getOverallMultiplier = useCallback((currentState: DoGameState): { xp: number; coins: number } => {
    const t = getTitleMultiplier(currentState)
    const a = getArtifactMultiplier(currentState)
    const e = getEventMultiplier(currentState)
    const b = getBuildingMultiplier(currentState)
    return { xp: t.xp * a.xp * e.xp * b.xp, coins: t.coins * a.coins * e.coins * b.coins }
  }, [getTitleMultiplier, getArtifactMultiplier, getEventMultiplier, getBuildingMultiplier])

  // ── Core: add XP / coins ───────────────────────────────────────────────

  const doAddXP = useCallback((amount: number) => {
    setState(prev => {
      const mul = getOverallMultiplier(prev)
      const gained = Math.floor(amount * mul.xp)
      let newTotalXp = prev.totalXp + gained
      let newLevel = prev.level
      let newXP = prev.xp + gained
      let leveledUp = false
      while (newLevel < DO_MAX_LEVEL && newXP >= xpForLevel(newLevel)) {
        newXP -= xpForLevel(newLevel)
        newLevel++
        leveledUp = true
      }
      if (newLevel >= DO_MAX_LEVEL) {
        newXP = 0
      }
      return { ...prev, xp: newXP, level: newLevel, totalXp: newTotalXp }
    })
  }, [getOverallMultiplier])

  const doAddCoins = useCallback((amount: number) => {
    setState(prev => {
      const mul = getOverallMultiplier(prev)
      const gained = Math.floor(amount * mul.coins)
      return { ...prev, coins: prev.coins + gained, totalCoinsEarned: prev.totalCoinsEarned + gained }
    })
  }, [getOverallMultiplier])

  const doSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins >= amount) {
        success = true
        return { ...prev, coins: prev.coins - amount, totalCoinsSpent: prev.totalCoinsSpent + amount }
      }
      return prev
    })
    return success
  }, [])

  // ── Level / XP queries ─────────────────────────────────────────────────

  const doGetLevel = useCallback(() => stateRef.current.level, [])

  const doGetXp = useCallback(() => stateRef.current.xp, [])

  const doGetCoins = useCallback(() => stateRef.current.coins, [])

  const doGetTitle = useCallback((): DoTitle => {
    const current = findDef(DO_TITLES, stateRef.current.currentTitleId)
    return current ?? DO_TITLES[0]
  }, [])

  const doGetProgress = useCallback(() => {
    const s = stateRef.current
    const needed = xpForLevel(s.level)
    return needed === Infinity ? 100 : Math.floor((s.xp / needed) * 100)
  }, [])

  const doGetProgressToNextLevel = useCallback(() => {
    const s = stateRef.current
    const needed = xpForLevel(s.level)
    if (needed === Infinity) return { current: 0, required: 0, pct: 100 }
    return { current: s.xp, required: needed, pct: Math.floor((s.xp / needed) * 100) }
  }, [])

  // ── Title management ───────────────────────────────────────────────────

  const doGetAvailableTitles = useCallback((): DoTitle[] => {
    const s = stateRef.current
    return DO_TITLES.filter(t => s.level >= t.requiredLevel)
  }, [])

  const doSetTitle = useCallback((titleId: string): boolean => {
    const title = findDef(DO_TITLES, titleId)
    if (!title) return false
    let ok = false
    setState(prev => {
      if (prev.level >= title.requiredLevel) {
        ok = true
        return { ...prev, currentTitleId: titleId }
      }
      return prev
    })
    return ok
  }, [])

  // ── State reset ────────────────────────────────────────────────────────

  const doResetState = useCallback(() => {
    const fresh = createInitialState()
    setState(fresh)
    localStorage.removeItem(DO_STORAGE_KEY)
  }, [])

  const doGetState = useCallback(() => stateRef.current, [])

  // ── Location management ────────────────────────────────────────────────

  const doDiscoverLocation = useCallback((locationId: string): boolean => {
    const loc = findDef(DO_LOCATIONS, locationId)
    if (!loc) return false
    let discovered = false
    setState(prev => {
      const rec = prev.locations.find(l => l.locationId === locationId)
      if (!rec) return prev
      if (!rec.discovered && prev.level >= loc.requiredLevel) {
        discovered = true
        return {
          ...prev,
          locations: prev.locations.map(l => l.locationId === locationId ? { ...l, discovered: true } : l),
          xp: prev.xp + 20,
          totalXp: prev.totalXp + 20,
        }
      }
      return prev
    })
    return discovered
  }, [])

  const doVisitLocation = useCallback((locationId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const loc = findDef(DO_LOCATIONS, locationId)
    if (!loc) return { success: false, xpGained: 0, coinsGained: 0 }
    let result = { success: false, xpGained: 0, coinsGained: 0 }
    setState(prev => {
      const rec = prev.locations.find(l => l.locationId === locationId)
      if (!rec || !rec.discovered) return prev
      const mul = getOverallMultiplier(prev)
      const xpGained = Math.floor(loc.xpReward * mul.xp)
      const coinsGained = Math.floor(loc.coinReward * mul.coins)
      result = { success: true, xpGained, coinsGained }
      return {
        ...prev,
        currentLocationId: locationId,
        locations: prev.locations.map(l =>
          l.locationId === locationId
            ? { ...l, visits: l.visits + 1, totalXpGained: l.totalXpGained + xpGained, totalCoinsGained: l.totalCoinsGained + coinsGained }
            : l
        ),
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
      }
    })
    return result
  }, [getOverallMultiplier])

  const doGetLocations = useCallback(() => DO_LOCATIONS, [])
  const doGetDiscoveredLocations = useCallback(() => {
    const s = stateRef.current
    return DO_LOCATIONS.filter(l => s.locations.find(r => r.locationId === l.id)?.discovered)
  }, [])
  const doGetLocationRecord = useCallback((locationId: string) => {
    return stateRef.current.locations.find(l => l.locationId === locationId) ?? null
  }, [])

  // ── Creature management ────────────────────────────────────────────────

  const doGetCreatures = useCallback(() => DO_CREATURES, [])

  const doGetCreaturesByLocation = useCallback((locationId: string): DoCreature[] => {
    const loc = findDef(DO_LOCATIONS, locationId)
    if (!loc) return []
    return loc.creatureIds.map(id => findDef(DO_CREATURES, id)).filter((c): c is DoCreature => c !== undefined)
  }, [])

  const doGetCreatureRecord = useCallback((creatureId: string) => {
    return stateRef.current.creatures.find(c => c.creatureId === creatureId) ?? null
  }, [])

  const doEncounterCreature = useCallback((creatureId: string): DoCreature | null => {
    const creature = findDef(DO_CREATURES, creatureId)
    if (!creature) return null
    setState(prev => ({
      ...prev,
      creatures: prev.creatures.map(c =>
        c.creatureId === creatureId ? { ...c, encountered: true } : c
      ),
    }))
    return creature
  }, [])

  const doDefeatCreature = useCallback((creatureId: string): { success: boolean; xpGained: number; coinsGained: number; artifactFound: boolean } => {
    const creature = findDef(DO_CREATURES, creatureId)
    if (!creature) return { success: false, xpGained: 0, coinsGained: 0, artifactFound: false }
    let result: { success: boolean; xpGained: number; coinsGained: number; artifactFound: boolean } = { success: false, xpGained: 0, coinsGained: 0, artifactFound: false }
    setState(prev => {
      const rec = prev.creatures.find(c => c.creatureId === creatureId)
      if (!rec) return prev
      const rarityMul = DO_RARITY[creature.rarity].xpMultiplier
      const mul = getOverallMultiplier(prev)
      const xpGained = Math.floor(creature.xpReward * rarityMul * mul.xp)
      const coinsGained = Math.floor(creature.coinDrop * rarityMul * mul.coins)
      const artifactFound = Math.random() < 0.05 * rarityMul
      result = { success: true, xpGained, coinsGained, artifactFound }
      const newInventory = artifactFound ? (() => {
        const eligible = DO_ARTIFACTS.filter(a => {
          const rarityIdx = DO_RARITY_ORDER.indexOf(a.rarity)
          const creatureRarityIdx = DO_RARITY_ORDER.indexOf(creature.rarity)
          return rarityIdx <= creatureRarityIdx + 1
        })
        if (eligible.length === 0) return prev.inventory
        const picked = eligible[Math.floor(Math.random() * eligible.length)]
        const existing = prev.inventory.find(i => i.artifactId === picked.id)
        if (existing) {
          return prev.inventory.map(i => i.artifactId === picked.id ? { ...i, quantity: i.quantity + 1 } : i)
        }
        return [...prev.inventory, { artifactId: picked.id, quantity: 1 }]
      })() : prev.inventory
      return {
        ...prev,
        creatures: prev.creatures.map(c =>
          c.creatureId === creatureId ? { ...c, defeated: true, defeatCount: c.defeatCount + 1 } : c
        ),
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        totalCreaturesDefeated: prev.totalCreaturesDefeated + 1,
        totalArtifactsFound: prev.totalArtifactsFound + (artifactFound ? 1 : 0),
        inventory: newInventory,
      }
    })
    return result
  }, [getOverallMultiplier])

  const doTameCreature = useCallback((creatureId: string): boolean => {
    const creature = findDef(DO_CREATURES, creatureId)
    if (!creature || creature.type === 'boss') return false
    let tamed = false
    setState(prev => {
      const rec = prev.creatures.find(c => c.creatureId === creatureId)
      if (!rec || rec.tamed) return prev
      tamed = true
      return {
        ...prev,
        creatures: prev.creatures.map(c =>
          c.creatureId === creatureId ? { ...c, tamed: true } : c
        ),
        totalCreaturesTamed: prev.totalCreaturesTamed + 1,
      }
    })
    return tamed
  }, [])

  // ── Artifact / Inventory management ────────────────────────────────────

  const doGetArtifacts = useCallback(() => DO_ARTIFACTS, [])

  const doGetInventory = useCallback(() => stateRef.current.inventory, [])

  const doGetInventoryCount = useCallback(() => {
    return stateRef.current.inventory.reduce((sum, i) => sum + i.quantity, 0)
  }, [])

  const doGetArtifactCount = useCallback((artifactId: string): number => {
    return stateRef.current.inventory.find(i => i.artifactId === artifactId)?.quantity ?? 0
  }, [])

  const doCollectArtifact = useCallback((artifactId: string): { success: boolean; isNew: boolean } => {
    const def = findDef(DO_ARTIFACTS, artifactId)
    if (!def) return { success: false, isNew: false }
    let result: { success: boolean; isNew: boolean } = { success: false, isNew: false }
    setState(prev => {
      const existing = prev.inventory.find(i => i.artifactId === artifactId)
      if (existing && existing.quantity >= DO_MAX_INVENTORY_ITEM) return prev
      result = { success: true, isNew: !existing }
      const newInventory = existing
        ? prev.inventory.map(i => i.artifactId === artifactId ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev.inventory, { artifactId, quantity: 1 }]
      return {
        ...prev,
        inventory: newInventory,
        totalArtifactsFound: prev.totalArtifactsFound + (existing ? 0 : 1),
      }
    })
    return result
  }, [])

  // ── Building / Oasis management ────────────────────────────────────────

  const doGetBuildings = useCallback(() => DO_BUILDINGS, [])

  const doGetBuildingRecords = useCallback(() => stateRef.current.buildings, [])

  const doGetBuildingCost = useCallback((buildingId: string, currentLevel: number): number => {
    const def = findDef(DO_BUILDINGS, buildingId)
    if (!def) return 0
    return Math.floor(def.baseCost * Math.pow(1.5, currentLevel))
  }, [])

  const doBuildStructure = useCallback((buildingId: string): { success: boolean; newLevel: number } => {
    const def = findDef(DO_BUILDINGS, buildingId)
    if (!def) return { success: false, newLevel: 0 }
    let result: { success: boolean; newLevel: number } = { success: false, newLevel: 0 }
    setState(prev => {
      const rec = prev.buildings.find(b => b.buildingId === buildingId)
      if (!rec) return prev
      const nextLevel = rec.built ? rec.level + 1 : 1
      if (nextLevel > def.maxLevel) return prev
      const cost = Math.floor(def.baseCost * Math.pow(1.5, rec.built ? rec.level - 1 : 0))
      if (prev.coins < cost) return prev
      result = { success: true, newLevel: nextLevel }
      return {
        ...prev,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        buildings: prev.buildings.map(b =>
          b.buildingId === buildingId ? { ...b, built: true, level: nextLevel } : b
        ),
      }
    })
    return result
  }, [])

  const doGetOasisHealth = useCallback(() => ({
    health: stateRef.current.oasisHealth,
    maxHealth: stateRef.current.oasisMaxHealth,
    pct: Math.floor((stateRef.current.oasisHealth / stateRef.current.oasisMaxHealth) * 100),
  }), [])

  const doRepairOasis = useCallback((amount: number): number => {
    let repaired = 0
    setState(prev => {
      const needed = prev.oasisMaxHealth - prev.oasisHealth
      const actual = Math.min(amount, needed)
      repaired = actual
      return { ...prev, oasisHealth: prev.oasisHealth + actual }
    })
    return repaired
  }, [])

  // ── Sandstorm survival ─────────────────────────────────────────────────

  const doStartSandstorm = useCallback(() => {
    setState(prev => {
      const intensity = seededInt(createPRNG(prev.seed + Date.now()), 20, DO_SANDSTORM_MAX_INTENSITY)
      const duration = DO_SANDSTORM_BASE_DURATION + intensity * 2000
      return {
        ...prev,
        sandstormActive: true,
        sandstormIntensity: intensity,
        sandstormStartTime: Date.now(),
        activeEvents: [
          ...prev.activeEvents.filter(e => e.eventId !== 'sandstorm-event'),
          { eventId: 'sandstorm-event', startTime: Date.now(), endTime: Date.now() + duration, status: 'active' },
        ],
      }
    })
  }, [])

  const doEndSandstorm = useCallback(() => {
    let survived = false
    setState(prev => {
      if (!prev.sandstormActive) return prev
      survived = true
      return {
        ...prev,
        sandstormActive: false,
        sandstormIntensity: 0,
        sandstormStartTime: null,
        totalSandstormsSurvived: prev.totalSandstormsSurvived + 1,
        activeEvents: prev.activeEvents.map(e =>
          e.eventId === 'sandstorm-event' ? { ...e, status: 'ended' as DoEventStatus } : e
        ),
      }
    })
    return survived
  }, [])

  const doTakeShelter = useCallback((): { sheltered: boolean; healthLost: number; coinsLost: number } => {
    let result = { sheltered: false, healthLost: 0, coinsLost: 0 }
    setState(prev => {
      if (!prev.sandstormActive) return prev
      const intensity = prev.sandstormIntensity
      const healthLost = Math.floor(intensity * 0.3)
      const coinsLost = Math.floor(intensity * 0.5)
      result = { sheltered: true, healthLost, coinsLost }
      const newHealth = Math.max(0, prev.oasisHealth - healthLost)
      const newCoins = Math.max(0, prev.coins - coinsLost)
      if (newHealth <= 0) {
        return {
          ...prev,
          oasisHealth: Math.floor(prev.oasisMaxHealth * 0.1),
          coins: Math.max(0, newCoins),
          totalCoinsSpent: prev.totalCoinsSpent + coinsLost,
          sandstormActive: false,
          sandstormIntensity: 0,
          totalSandstormsSurvived: prev.totalSandstormsSurvived + 1,
        }
      }
      return {
        ...prev,
        oasisHealth: newHealth,
        coins: newCoins,
        totalCoinsSpent: prev.totalCoinsSpent + coinsLost,
      }
    })
    return result
  }, [])

  const doBraveSandstorm = useCallback((): { braved: boolean; xpGained: number; coinsGained: number; damageTaken: number } => {
    let result = { braved: false, xpGained: 0, coinsGained: 0, damageTaken: 0 }
    setState(prev => {
      if (!prev.sandstormActive) return prev
      const intensity = prev.sandstormIntensity
      const xpGained = Math.floor(intensity * 2)
      const coinsGained = Math.floor(intensity * 1.5)
      const damageTaken = Math.floor(intensity * 0.5)
      result = { braved: true, xpGained, coinsGained, damageTaken }
      return {
        ...prev,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        oasisHealth: Math.max(1, prev.oasisHealth - damageTaken),
      }
    })
    return result
  }, [])

  const doGetSandstormStatus = useCallback(() => ({
    active: stateRef.current.sandstormActive,
    intensity: stateRef.current.sandstormIntensity,
    startTime: stateRef.current.sandstormStartTime,
  }), [])

  // ── Trading system ─────────────────────────────────────────────────────

  const doGetTradingGoods = useCallback(() => DO_TRADING_GOODS, [])

  const doGetGoodPrice = useCallback((goodId: string, seedOverride?: number): number => {
    const good = findDef(DO_TRADING_GOODS, goodId)
    if (!good) return 0
    const rng = createPRNG(seedOverride ?? dateHash() + goodId.length)
    const fluctuation = (rng() - 0.5) * 2 * good.volatility
    return Math.max(1, Math.floor(good.basePrice * (1 + fluctuation)))
  }, [])

  const doGetAllPrices = useCallback((): Record<string, number> => {
    const prices: Record<string, number> = {}
    for (const good of DO_TRADING_GOODS) {
      prices[good.id] = doGetGoodPrice(good.id)
    }
    return prices
  }, [doGetGoodPrice])

  const doBuyGood = useCallback((goodId: string, quantity: number): { success: boolean; totalCost: number } => {
    const price = doGetGoodPrice(goodId)
    const totalCost = price * quantity
    let success = false
    setState(prev => {
      if (prev.coins < totalCost) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - totalCost,
        totalCoinsSpent: prev.totalCoinsSpent + totalCost,
        tradeLogs: [{ goodId, action: 'buy' as const, quantity, price, timestamp: Date.now() }, ...prev.tradeLogs].slice(0, DO_TRADE_LOG_MAX),
        totalTradesExecuted: prev.totalTradesExecuted + 1,
      }
    })
    return { success, totalCost }
  }, [doGetGoodPrice])

  const doSellGood = useCallback((goodId: string, quantity: number): { success: boolean; totalRevenue: number } => {
    const price = doGetGoodPrice(goodId)
    const totalRevenue = Math.floor(price * quantity * 0.9)
    let success = false
    setState(prev => {
      success = true
      return {
        ...prev,
        coins: prev.coins + totalRevenue,
        totalCoinsEarned: prev.totalCoinsEarned + totalRevenue,
        tradeLogs: [{ goodId, action: 'sell' as const, quantity, price: Math.floor(price * 0.9), timestamp: Date.now() }, ...prev.tradeLogs].slice(0, DO_TRADE_LOG_MAX),
        totalTradesExecuted: prev.totalTradesExecuted + 1,
      }
    })
    return { success, totalRevenue }
  }, [doGetGoodPrice])

  const doGetTradeLogs = useCallback(() => stateRef.current.tradeLogs, [])

  // ── Daily patrol ───────────────────────────────────────────────────────

  const doGetPatrols = useCallback(() => DO_PATROLS, [])

  const doGetPatrolRecord = useCallback((patrolId: string) => {
    return stateRef.current.patrolRecords.find(p => p.patrolId === patrolId) ?? null
  }, [])

  const doStartPatrol = useCallback((patrolId: string): { success: boolean; reason?: string } => {
    const def = findDef(DO_PATROLS, patrolId)
    if (!def) return { success: false, reason: 'Invalid patrol' }
    let result: { success: boolean; reason?: string } = { success: false, reason: 'Cannot start' }
    setState(prev => {
      if (prev.currentPatrolId !== null) return (() => { result = { success: false, reason: 'Patrol already in progress' }; return prev })()
      if (prev.level < def.requiredLevel) return (() => { result = { success: false, reason: 'Level too low' }; return prev })()
      result = { success: true }
      return { ...prev, currentPatrolId: patrolId }
    })
    return result
  }, [])

  const doCompletePatrol = useCallback((patrolId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const def = findDef(DO_PATROLS, patrolId)
    if (!def) return { success: false, xpGained: 0, coinsGained: 0 }
    let result = { success: false, xpGained: 0, coinsGained: 0 }
    setState(prev => {
      if (prev.currentPatrolId !== patrolId) return prev
      const mul = getOverallMultiplier(prev)
      const xpGained = Math.floor(def.xpReward * mul.xp)
      const coinsGained = Math.floor(def.coinReward * mul.coins)
      result = { success: true, xpGained, coinsGained }
      return {
        ...prev,
        currentPatrolId: null,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        patrolRecords: prev.patrolRecords.map(p =>
          p.patrolId === patrolId ? { ...p, completed: true, lastCompleted: Date.now(), completionCount: p.completionCount + 1 } : p
        ),
        totalPatrolsCompleted: prev.totalPatrolsCompleted + 1,
      }
    })
    return result
  }, [getOverallMultiplier])

  const doCancelPatrol = useCallback((): boolean => {
    let cancelled = false
    setState(prev => {
      if (prev.currentPatrolId === null) return prev
      cancelled = true
      return { ...prev, currentPatrolId: null }
    })
    return cancelled
  }, [])

  // ── Tomb exploration ───────────────────────────────────────────────────

  const doGetTombRooms = useCallback(() => DO_TOMB_ROOMS, [])

  const doGetTombRecord = useCallback((roomId: string) => {
    return stateRef.current.tombRecords.find(r => r.roomId === roomId) ?? null
  }, [])

  const doExploreRoom = useCallback((roomId: string): { success: boolean; xpGained: number; coinsGained: number; artifactFound: boolean; artifactName?: string; trapped: boolean; damage: number } => {
    const def = findDef(DO_TOMB_ROOMS, roomId)
    if (!def) return { success: false, xpGained: 0, coinsGained: 0, artifactFound: false, trapped: false, damage: 0 }
    let result: { success: boolean; xpGained: number; coinsGained: number; artifactFound: boolean; artifactName?: string; trapped: boolean; damage: number } = { success: false, xpGained: 0, coinsGained: 0, artifactFound: false, trapped: false, damage: 0 }
    setState(prev => {
      if (prev.level < def.requiredLevel) return prev
      const rec = prev.tombRecords.find(r => r.roomId === roomId)
      if (rec?.cleared) return prev
      const mul = getOverallMultiplier(prev)
      const xpGained = Math.floor(def.xpReward * mul.xp)
      const coinsGained = Math.floor(def.coinReward * mul.coins)
      const trapped = Math.random() < def.trapChance
      const damage = trapped ? Math.floor(def.dangerLevel * 8) : 0
      const artifactFound = Math.random() < def.artifactChance
      let artifactName: string | undefined
      let newInventory = prev.inventory
      if (artifactFound) {
        const eligible = DO_ARTIFACTS.filter(a => {
          const idx = DO_RARITY_ORDER.indexOf(a.rarity)
          return idx <= (def.dangerLevel >= 8 ? 4 : def.dangerLevel >= 5 ? 3 : 2)
        })
        if (eligible.length > 0) {
          const picked = eligible[Math.floor(Math.random() * eligible.length)]
          artifactName = picked.name
          const existing = prev.inventory.find(i => i.artifactId === picked.id)
          newInventory = existing
            ? prev.inventory.map(i => i.artifactId === picked.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...prev.inventory, { artifactId: picked.id, quantity: 1 }]
        }
      }
      result = { success: true, xpGained, coinsGained, artifactFound, artifactName, trapped, damage }
      return {
        ...prev,
        currentTombRoomId: roomId,
        tombRecords: prev.tombRecords.map(r =>
          r.roomId === roomId
            ? { ...r, explored: true, cleared: true, artifactsFound: r.artifactsFound + (artifactFound ? 1 : 0) }
            : r
        ),
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        oasisHealth: Math.max(1, prev.oasisHealth - damage),
        inventory: newInventory,
        totalArtifactsFound: prev.totalArtifactsFound + (artifactFound ? 1 : 0),
        totalTombRoomsCleared: prev.totalTombRoomsCleared + 1,
      }
    })
    return result
  }, [getOverallMultiplier])

  // ── Trading caravans ───────────────────────────────────────────────────

  const doGetCaravans = useCallback(() => DO_CARAVANS, [])

  const doGetCaravanRecord = useCallback((caravanId: string) => {
    return stateRef.current.caravanRecords.find(c => c.caravanId === caravanId) ?? null
  }, [])

  const doDispatchCaravan = useCallback((caravanId: string): { success: boolean; reason?: string } => {
    const def = findDef(DO_CARAVANS, caravanId)
    if (!def) return { success: false, reason: 'Invalid caravan' }
    let result: { success: boolean; reason?: string } = { success: false, reason: 'Cannot dispatch' }
    setState(prev => {
      const rec = prev.caravanRecords.find(c => c.caravanId === caravanId)
      if (!rec) return prev
      if (rec.dispatched) return (() => { result = { success: false, reason: 'Already dispatched' }; return prev })()
      if (prev.coins < def.cost) return (() => { result = { success: false, reason: 'Not enough coins' }; return prev })()
      if (prev.level < def.requiredLevel) return (() => { result = { success: false, reason: 'Level too low' }; return prev })()
      result = { success: true }
      return {
        ...prev,
        coins: prev.coins - def.cost,
        totalCoinsSpent: prev.totalCoinsSpent + def.cost,
        caravanRecords: prev.caravanRecords.map(c =>
          c.caravanId === caravanId ? { ...c, dispatched: true, dispatchTime: Date.now() } : c
        ),
      }
    })
    return result
  }, [])

  const doCompleteCaravan = useCallback((caravanId: string): { success: boolean; xpGained: number; coinsGained: number; goodsReturned: number } => {
    const def = findDef(DO_CARAVANS, caravanId)
    if (!def) return { success: false, xpGained: 0, coinsGained: 0, goodsReturned: 0 }
    let result = { success: false, xpGained: 0, coinsGained: 0, goodsReturned: 0 }
    setState(prev => {
      const rec = prev.caravanRecords.find(c => c.caravanId === caravanId)
      if (!rec || !rec.dispatched || !rec.dispatchTime) return prev
      const mul = getOverallMultiplier(prev)
      const xpGained = Math.floor(def.xpReward * mul.xp)
      const coinsGained = Math.floor(def.coinReward * mul.coins)
      result = { success: true, xpGained, coinsGained, goodsReturned: def.goodBonus }
      return {
        ...prev,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        caravanRecords: prev.caravanRecords.map(c =>
          c.caravanId === caravanId ? { ...c, dispatched: false, dispatchTime: null, completions: c.completions + 1 } : c
        ),
        totalCaravansCompleted: prev.totalCaravansCompleted + 1,
      }
    })
    return result
  }, [getOverallMultiplier])

  // ── Desert events ──────────────────────────────────────────────────────

  const doGetEvents = useCallback(() => DO_EVENTS, [])

  const doGetActiveEvents = useCallback((): DoDesertEvent[] => {
    const now = Date.now()
    return stateRef.current.activeEvents
      .filter(e => e.endTime > now && e.status === 'active')
      .map(e => findDef(DO_EVENTS, e.eventId))
      .filter((e): e is DoDesertEvent => e !== undefined)
  }, [])

  const doTriggerEvent = useCallback((eventId: string): { success: boolean } => {
    const def = findDef(DO_EVENTS, eventId)
    if (!def) return { success: false }
    let result = { success: false }
    setState(prev => {
      const alreadyActive = prev.activeEvents.some(e => e.eventId === eventId && e.endTime > Date.now())
      if (alreadyActive) return prev
      result = { success: true }
      return {
        ...prev,
        activeEvents: [...prev.activeEvents, {
          eventId,
          startTime: Date.now(),
          endTime: Date.now() + def.duration,
          status: 'active' as DoEventStatus,
        }],
        sandstormActive: def.type === 'sandstorm' ? true : prev.sandstormActive,
      }
    })
    return result
  }, [])

  // ── Achievements ───────────────────────────────────────────────────────

  const doGetAchievements = useCallback(() => DO_ACHIEVEMENTS, [])

  const doGetUnlockedAchievements = useCallback(() => {
    return stateRef.current.achievements.map(a => {
      const def = findDef(DO_ACHIEVEMENTS, a.achievementId)
      return { record: a, def: def ?? null }
    })
  }, [])

  const doCheckAchievements = useCallback((): DoAchievement[] => {
    const s = stateRef.current
    const newlyUnlocked: DoAchievement[] = []
    setState(prev => {
      const unlocked = new Set(prev.achievements.map(a => a.achievementId))
      const newAchievements: typeof prev.achievements = []
      for (const ach of DO_ACHIEVEMENTS) {
        if (unlocked.has(ach.id)) continue
        let met = false
        switch (ach.id) {
          case 'first-steps': met = prev.level >= 1; break
          case 'dune-master': met = prev.level >= 10; break
          case 'oasis-founder': met = prev.buildings.filter(b => b.built).length >= 1; break
          case 'scarab-hunter': met = prev.totalCreaturesDefeated >= 50; break
          case 'tomb-raider-ach': met = prev.totalTombRoomsCleared >= 10; break
          case 'merchant-prince': met = prev.totalTradesExecuted >= 25; break
          case 'storm-survivor': met = prev.totalSandstormsSurvived >= 5; break
          case 'patrol-legend': met = prev.totalPatrolsCompleted >= 20; break
          case 'caravan-lord': met = prev.totalCaravansCompleted >= 15; break
          case 'artifact-collector': met = prev.inventory.filter(i => i.quantity > 0).length >= 15; break
          case 'creature-tamer': met = prev.totalCreaturesTamed >= 10; break
          case 'event-hero': met = prev.totalEventsCompleted >= 10; break
          case 'desert-scholar': met = prev.locations.filter(l => l.discovered).length >= 8; break
          case 'streak-keeper': met = prev.dailyStreak >= 7; break
          case 'treasure-monger': met = prev.totalCoinsEarned >= 10000; break
          case 'pharaoh-ascend': met = prev.level >= 50; break
          case 'mythic-finder': met = prev.inventory.some(i => {
            const a = findDef(DO_ARTIFACTS, i.artifactId)
            return a && a.rarity === 'legendary'
          }); break
        }
        if (met) {
          newAchievements.push({ achievementId: ach.id, unlockedAt: Date.now() })
          newlyUnlocked.push(ach)
        }
      }
      if (newAchievements.length === 0) return prev
      const totalXpReward = newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0)
      const totalCoinReward = newlyUnlocked.reduce((sum, a) => sum + a.coinReward, 0)
      return {
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        xp: prev.xp + totalXpReward,
        totalXp: prev.totalXp + totalXpReward,
        coins: prev.coins + totalCoinReward,
        totalCoinsEarned: prev.totalCoinsEarned + totalCoinReward,
      }
    })
    return newlyUnlocked
  }, [])

  const doIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return stateRef.current.achievements.some(a => a.achievementId === achievementId)
  }, [])

  // ── Daily streak ───────────────────────────────────────────────────────

  const doGetDailyStreak = useCallback(() => stateRef.current.dailyStreak, [])

  const doClaimDailyReward = useCallback((): { success: boolean; xpGained: number; coinsGained: number; isNewDay: boolean } => {
    const today = todayStr()
    let result: { success: boolean; xpGained: number; coinsGained: number; isNewDay: boolean } = { success: false, xpGained: 0, coinsGained: 0, isNewDay: false }
    setState(prev => {
      if (prev.lastDailyDate === today) return prev
      const isNewDay = prev.lastDailyDate !== ''
      const streakMultiplier = Math.min(prev.dailyStreak + 1, 7)
      const xpGained = 10 * streakMultiplier
      const coinsGained = 15 * streakMultiplier
      result = { success: true, xpGained, coinsGained, isNewDay }
      return {
        ...prev,
        lastDailyDate: today,
        dailyStreak: prev.dailyStreak + 1,
        xp: prev.xp + xpGained,
        totalXp: prev.totalXp + xpGained,
        coins: prev.coins + coinsGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
      }
    })
    return result
  }, [])

  const doCheckStreak = useCallback(() => {
    const s = stateRef.current
    const today = todayStr()
    return { streak: s.dailyStreak, isToday: s.lastDailyDate === today }
  }, [])

  // ── Total stats ────────────────────────────────────────────────────────

  const doGetTotalStats = useCallback((): Record<string, number> => {
    const s = stateRef.current
    return {
      level: s.level,
      totalXp: s.totalXp,
      totalCoinsEarned: s.totalCoinsEarned,
      totalCoinsSpent: s.totalCoinsSpent,
      totalCreaturesDefeated: s.totalCreaturesDefeated,
      totalCreaturesTamed: s.totalCreaturesTamed,
      totalArtifactsFound: s.totalArtifactsFound,
      totalPatrolsCompleted: s.totalPatrolsCompleted,
      totalTombRoomsCleared: s.totalTombRoomsCleared,
      totalCaravansCompleted: s.totalCaravansCompleted,
      totalTradesExecuted: s.totalTradesExecuted,
      totalSandstormsSurvived: s.totalSandstormsSurvived,
      totalEventsCompleted: s.totalEventsCompleted,
      dailyStreak: s.dailyStreak,
      playTimeMinutes: s.playTimeMinutes,
      buildingsBuilt: s.buildings.filter(b => b.built).length,
      locationsDiscovered: s.locations.filter(l => l.discovered).length,
      achievementsUnlocked: s.achievements.length,
      uniqueArtifacts: s.inventory.filter(i => i.quantity > 0).length,
    }
  }, [])

  // ── Multiplier queries ─────────────────────────────────────────────────

  const doGetMultiplier = useCallback((): { xp: number; coins: number } => {
    return getOverallMultiplier(stateRef.current)
  }, [getOverallMultiplier])

  const doGetCompletionPercentage = useCallback((): number => {
    const s = stateRef.current
    const totalCategories = 5
    const creaturesPct = s.creatures.filter(c => c.defeated).length / DO_CREATURES.length
    const locationsPct = s.locations.filter(l => l.discovered).length / DO_LOCATIONS.length
    const artifactsPct = Math.min(1, s.inventory.filter(i => i.quantity > 0).length / DO_ARTIFACTS.length)
    const achievementsPct = s.achievements.length / DO_ACHIEVEMENTS.length
    const tombPct = s.tombRecords.filter(r => r.cleared).length / DO_TOMB_ROOMS.length
    return Math.floor(((creaturesPct + locationsPct + artifactsPct + achievementsPct + tombPct) / totalCategories) * 100)
  }, [])

  // ── Recommendations ────────────────────────────────────────────────────

  const doGetRecommendations = useCallback((): string[] => {
    const s = stateRef.current
    const recs: string[] = []
    if (s.level < 5) recs.push('Explore the Golden Dunes to gain early XP.')
    if (s.buildings.filter(b => b.built).length < 3) recs.push('Build more structures to boost your multipliers.')
    if (s.totalCreaturesTamed < 3) recs.push('Tame creatures for useful bonuses.')
    if (s.locations.filter(l => l.discovered).length < 4) recs.push('Discover new locations for more adventures.')
    if (s.dailyStreak < 3) recs.push('Login daily to build your streak bonus.')
    if (s.totalTombRoomsCleared < 5) recs.push('Explore the Scarab Tomb for artifacts.')
    if (s.totalTradesExecuted < 10) recs.push('Trade goods at the bazaar for profit.')
    if (s.totalPatrolsCompleted < 5) recs.push('Complete patrols for reliable rewards.')
    if (s.totalCaravansCompleted < 3) recs.push('Dispatch caravans for passive income.')
    if (s.oasisHealth < s.oasisMaxHealth * 0.5) recs.push('Repair your oasis before the next sandstorm!')
    if (s.totalArtifactsFound < 5) recs.push('Explore and defeat creatures to find artifacts.')
    if (recs.length === 0) recs.push('The desert awaits, great Sultan. Continue your legacy!')
    return recs
  }, [])

  // ── Rarity helpers ─────────────────────────────────────────────────────

  const doGetRarityInfo = useCallback((rarity: DoRarityTier): DoRarityInfo => DO_RARITY[rarity], [])
  const doGetRarityOrder = useCallback(() => DO_RARITY_ORDER, [])

  // ── Constants accessors ────────────────────────────────────────────────

  const doGetMaxLevel = useCallback(() => DO_MAX_LEVEL, [])
  const doGetThemeColors = useCallback(() => DO_THEME_COLORS, [])
  const doGetColors = useCallback(() => DO_COLORS, [])
  const doGetTitles = useCallback(() => DO_TITLES, [])

  // ── Computed memos ─────────────────────────────────────────────────────

  const currentMultiplier = useMemo(() => getOverallMultiplier(state), [state, getOverallMultiplier])
  const discoveredCount = useMemo(() => state.locations.filter(l => l.discovered).length, [state.locations])
  const defeatedCount = useMemo(() => state.creatures.filter(c => c.defeated).length, [state.creatures])
  const tamedCount = useMemo(() => state.creatures.filter(c => c.tamed).length, [state.creatures])
  const artifactCount = useMemo(() => state.inventory.reduce((s, i) => s + i.quantity, 0), [state.inventory])
  const achievementCount = useMemo(() => state.achievements.length, [state.achievements])
  const builtCount = useMemo(() => state.buildings.filter(b => b.built).length, [state.buildings])
  const completionPct = useMemo(() => {
    const cPct = defeatedCount / DO_CREATURES.length
    const lPct = discoveredCount / DO_LOCATIONS.length
    const aPct = Math.min(1, state.inventory.filter(i => i.quantity > 0).length / DO_ARTIFACTS.length)
    const achPct = achievementCount / DO_ACHIEVEMENTS.length
    const tPct = state.tombRecords.filter(r => r.cleared).length / DO_TOMB_ROOMS.length
    return Math.floor(((cPct + lPct + aPct + achPct + tPct) / 5) * 100)
  }, [defeatedCount, discoveredCount, state.inventory, achievementCount, state.tombRecords])

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    state,
    currentMultiplier,
    discoveredCount,
    defeatedCount,
    tamedCount,
    artifactCount,
    achievementCount,
    builtCount,
    completionPct,

    // Core
    doAPI_getState: doGetState,
    doAPI_resetState: doResetState,
    doAPI_getLevel: doGetLevel,
    doAPI_getXp: doGetXp,
    doAPI_getCoins: doGetCoins,
    doAPI_getTitle: doGetTitle,
    doAPI_getProgress: doGetProgress,
    doAPI_getProgressToNextLevel: doGetProgressToNextLevel,
    doAPI_addXP: doAddXP,
    doAPI_addCoins: doAddCoins,
    doAPI_spendCoins: doSpendCoins,

    // Title
    doAPI_getAvailableTitles: doGetAvailableTitles,
    doAPI_setTitle: doSetTitle,
    doAPI_getTitles: doGetTitles,

    // Multiplier
    doAPI_getMultiplier: doGetMultiplier,
    doAPI_getTitleMultiplier: () => getTitleMultiplier(stateRef.current),
    doAPI_getArtifactMultiplier: () => getArtifactMultiplier(stateRef.current),
    doAPI_getEventMultiplier: () => getEventMultiplier(stateRef.current),
    doAPI_getBuildingMultiplier: () => getBuildingMultiplier(stateRef.current),
    doAPI_getOverallMultiplier: () => getOverallMultiplier(stateRef.current),

    // Locations
    doAPI_getLocations: doGetLocations,
    doAPI_getDiscoveredLocations: doGetDiscoveredLocations,
    doAPI_getLocationRecord: doGetLocationRecord,
    doAPI_discoverLocation: doDiscoverLocation,
    doAPI_visitLocation: doVisitLocation,

    // Creatures
    doAPI_getCreatures: doGetCreatures,
    doAPI_getCreaturesByLocation: doGetCreaturesByLocation,
    doAPI_getCreatureRecord: doGetCreatureRecord,
    doAPI_encounterCreature: doEncounterCreature,
    doAPI_defeatCreature: doDefeatCreature,
    doAPI_tameCreature: doTameCreature,

    // Artifacts
    doAPI_getArtifacts: doGetArtifacts,
    doAPI_getInventory: doGetInventory,
    doAPI_getInventoryCount: doGetInventoryCount,
    doAPI_getArtifactCount: doGetArtifactCount,
    doAPI_collectArtifact: doCollectArtifact,

    // Buildings
    doAPI_getBuildings: doGetBuildings,
    doAPI_getBuildingRecords: doGetBuildingRecords,
    doAPI_getBuildingCost: doGetBuildingCost,
    doAPI_buildStructure: doBuildStructure,

    // Oasis
    doAPI_getOasisHealth: doGetOasisHealth,
    doAPI_repairOasis: doRepairOasis,

    // Sandstorm
    doAPI_getSandstormStatus: doGetSandstormStatus,
    doAPI_startSandstorm: doStartSandstorm,
    doAPI_endSandstorm: doEndSandstorm,
    doAPI_takeShelter: doTakeShelter,
    doAPI_braveSandstorm: doBraveSandstorm,

    // Trading
    doAPI_getTradingGoods: doGetTradingGoods,
    doAPI_getGoodPrice: doGetGoodPrice,
    doAPI_getAllPrices: doGetAllPrices,
    doAPI_buyGood: doBuyGood,
    doAPI_sellGood: doSellGood,
    doAPI_getTradeLogs: doGetTradeLogs,

    // Patrols
    doAPI_getPatrols: doGetPatrols,
    doAPI_getPatrolRecord: doGetPatrolRecord,
    doAPI_startPatrol: doStartPatrol,
    doAPI_completePatrol: doCompletePatrol,
    doAPI_cancelPatrol: doCancelPatrol,

    // Tombs
    doAPI_getTombRooms: doGetTombRooms,
    doAPI_getTombRecord: doGetTombRecord,
    doAPI_exploreRoom: doExploreRoom,

    // Caravans
    doAPI_getCaravans: doGetCaravans,
    doAPI_getCaravanRecord: doGetCaravanRecord,
    doAPI_dispatchCaravan: doDispatchCaravan,
    doAPI_completeCaravan: doCompleteCaravan,

    // Events
    doAPI_getEvents: doGetEvents,
    doAPI_getActiveEvents: doGetActiveEvents,
    doAPI_triggerEvent: doTriggerEvent,

    // Achievements
    doAPI_getAchievements: doGetAchievements,
    doAPI_getUnlockedAchievements: doGetUnlockedAchievements,
    doAPI_checkAchievements: doCheckAchievements,
    doAPI_isAchievementUnlocked: doIsAchievementUnlocked,

    // Daily
    doAPI_getDailyStreak: doGetDailyStreak,
    doAPI_claimDailyReward: doClaimDailyReward,
    doAPI_checkStreak: doCheckStreak,

    // Stats & info
    doAPI_getTotalStats: doGetTotalStats,
    doAPI_getCompletionPercentage: doGetCompletionPercentage,
    doAPI_getRecommendations: doGetRecommendations,
    doAPI_getMaxLevel: doGetMaxLevel,
    doAPI_getThemeColors: doGetThemeColors,
    doAPI_getColors: doGetColors,
    doAPI_getRarityInfo: doGetRarityInfo,
    doAPI_getRarityOrder: doGetRarityOrder,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTED CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export { DO_MAX_LEVEL, DO_THEME_COLORS, DO_COLORS, DO_TITLES, DO_CREATURES, DO_LOCATIONS, DO_ARTIFACTS, DO_TRADING_GOODS, DO_ACHIEVEMENTS, DO_EVENTS, DO_BUILDINGS, DO_PATROLS, DO_TOMB_ROOMS, DO_CARAVANS, DO_RARITY, DO_RARITY_ORDER }
export type { DoGameState, DoRarityTier, DoCreatureType, DoEventType, DoBuildingType, DoPatrolZone, DoTombChamber, DoTradeRoute, DoEventStatus, DoCreature, DoLocation, DoArtifact, DoTradingGood, DoTitle, DoAchievement, DoDesertEvent, DoBuildingDef, DoPatrolDef, DoTombRoom, DoCaravanDef, DoInventoryRecord, DoBuildingRecord, DoCreatureRecord, DoLocationRecord, DoAchievementRecord, DoActiveEvent, DoTradeLogEntry, DoPatrolRecord, DoTombRecord, DoCaravanRecord, DoRarityInfo }
