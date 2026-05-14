'use client'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

// ══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════

export type APRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type APChamberId =
  | 'entrance_hall'
  | 'scarab_passage'
  | 'pharaohs_tomb'
  | 'treasure_vault'
  | 'anubis_shrine'
  | 'sphinx_chamber'
  | 'hidden_catacombs'
  | 'golden_sarcophagus'

export type APCurseSeverity = 'minor' | 'moderate' | 'severe' | 'pharaohs_wrath'

export type APTrapType =
  | 'spike_pit'
  | 'poison_dart'
  | 'falling_ceiling'
  | 'sand_sinkhole'
  | 'fire_jet'
  | 'acid_pool'
  | 'rolling_boulder'
  | 'crushing_walls'
  | 'scythe_blades'
  | 'mummy_wrap'

export type APToolCategory =
  | 'excavation'
  | 'brushing'
  | 'scanning'
  | 'translation'
  | 'survival'
  | 'disarming'

export type APPuzzleType =
  | 'translation'
  | 'sequence'
  | 'cipher'
  | 'riddle'
  | 'pattern'
  | 'anagram'

export type APAbilityCategory =
  | 'combat'
  | 'exploration'
  | 'puzzle_solving'
  | 'survival'
  | 'artifact_lore'

export interface APArtifact {
  id: string
  name: string
  emoji: string
  rarity: APRarityTier
  description: string
  era: string
  baseValue: number
  xpReward: number
  chamber: APChamberId
  curseChance: number
}

export interface APChamber {
  id: APChamberId
  name: string
  emoji: string
  description: string
  depth: number
  dangerLevel: number
  requiredLevel: number
  trapChance: number
  artifactChance: number
  puzzleChance: number
  curseChance: number
  coinRewardRange: [number, number]
  xpRewardRange: [number, number]
  bgTint: string
}

export interface APHieroglyphicPuzzle {
  id: string
  name: string
  emoji: string
  type: APPuzzleType
  difficulty: number
  description: string
  hintText: string
  answer: string
  xpReward: number
  coinReward: number
  chamber: APChamberId
}

export interface APExcavationTool {
  id: string
  name: string
  emoji: string
  category: APToolCategory
  description: string
  level: number
  maxLevel: number
  efficiency: number
  precision: number
  durability: number
  maxDurability: number
  upgradeCost: number
  repairCost: number
}

export interface APExplorerAbility {
  id: string
  name: string
  emoji: string
  category: APAbilityCategory
  description: string
  levelReq: number
  cooldown: number
  duration: number
  effectValue: number
  isActive: boolean
  currentCooldown: number
  unlockCost: number
}

export interface APAchievement {
  id: string
  name: string
  emoji: string
  description: string
  reward: { coins: number; xp: number }
  unlocked: boolean
  unlockedAt: number | null
  condition: string
}

export interface APTitle {
  id: string
  name: string
  emoji: string
  levelReq: number
  description: string
}

export interface APCurseEvent {
  id: string
  name: string
  emoji: string
  severity: APCurseSeverity
  description: string
  healthPenalty: number
  coinPenalty: number
  xpPenalty: number
  durationTurns: number
  cureCost: number
  chamber: APChamberId
}

export interface APTrapInstance {
  id: string
  type: APTrapType
  name: string
  emoji: string
  description: string
  minDamage: number
  maxDamage: number
  disarmDifficulty: number
  disarmed: boolean
  triggered: boolean
  chamber: APChamberId
}

export interface APDailyQuest {
  id: string
  name: string
  emoji: string
  description: string
  target: number
  progress: number
  reward: { coins: number; xp: number; artifactChance: number }
  completed: boolean
  expiresAt: number
  questType: 'explore' | 'disarm' | 'puzzle' | 'artifact' | 'excavate'
}

export interface APInventorySlot {
  artifactId: string
  acquiredAt: number
  equipped: boolean
  quantity: number
}

export interface AncientPyramidState {
  initialized: boolean
  version: number
  // Player progression
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  explorerName: string
  title: string
  // Health & vitality
  health: number
  maxHealth: number
  stamina: number
  maxStamina: number
  // Exploration
  currentChamber: APChamberId | null
  chambersVisited: APChamberId[]
  chambersCleared: APChamberId[]
  totalExplorations: number
  explorationDepth: number
  // Traps
  trapsEncountered: number
  trapsDisarmed: number
  trapsTriggered: number
  activeTraps: APTrapInstance[]
  // Artifacts
  inventory: APInventorySlot[]
  equippedArtifactIds: string[]
  totalArtifactsCollected: number
  legendaryArtifactsFound: number
  artifactValueTotal: number
  // Puzzles
  puzzlesSolved: string[]
  puzzlesAttempted: number
  puzzlesFailed: number
  currentPuzzleId: string | null
  // Tools
  tools: APExcavationTool[]
  activeToolId: string | null
  // Abilities
  abilities: APExplorerAbility[]
  activeAbilityIds: string[]
  // Curses
  activeCurses: APCurseEvent[]
  totalCursesSuffered: number
  cursesCured: number
  // Achievements & titles
  achievements: APAchievement[]
  unlockedTitleIds: string[]
  // Daily quest
  dailyQuest: APDailyQuest | null
  lastDailyDate: string
  dailyStreak: number
  // Stats
  totalDamageTaken: number
  totalHealing: number
  totalStaminaUsed: number
  totalCoinsSpent: number
  totalPuzzleXpEarned: number
  totalArtifactXpEarned: number
  // Log
  eventLog: string[]
  createdAt: number
  lastSaveAt: number
}

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — RARITY TIERS
// ══════════════════════════════════════════════════════════════════

const AP_RARITY_COMMON = {
  name: 'common' as const,
  color: '#9ca3af',
  weight: 45,
  xpMult: 1,
  coinMult: 1,
  emoji: '🪨',
}
const AP_RARITY_UNCOMMON = {
  name: 'uncommon' as const,
  color: '#34d399',
  weight: 28,
  xpMult: 1.5,
  coinMult: 1.5,
  emoji: '🏺',
}
const AP_RARITY_RARE = {
  name: 'rare' as const,
  color: '#60a5fa',
  weight: 16,
  xpMult: 2.5,
  coinMult: 2.5,
  emoji: '💎',
}
const AP_RARITY_EPIC = {
  name: 'epic' as const,
  color: '#a78bfa',
  weight: 8,
  xpMult: 4,
  coinMult: 4,
  emoji: '👑',
}
const AP_RARITY_LEGENDARY = {
  name: 'legendary' as const,
  color: '#fbbf24',
  weight: 3,
  xpMult: 8,
  coinMult: 8,
  emoji: '👁️',
}

const AP_RARITIES = [
  AP_RARITY_COMMON,
  AP_RARITY_UNCOMMON,
  AP_RARITY_RARE,
  AP_RARITY_EPIC,
  AP_RARITY_LEGENDARY,
]

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — XP TABLE (Level 1-50)
// ══════════════════════════════════════════════════════════════════

const AP_XP_TABLE: number[] = [
  0, 120, 280, 500, 780, 1120, 1520, 1980, 2500, 3080,
  3720, 4420, 5180, 6000, 6880, 7820, 8820, 9880, 11000, 12180,
  13420, 14720, 16080, 17500, 18980, 20520, 22120, 23780, 25500, 27280,
  29120, 31020, 32980, 35000, 37080, 39220, 41420, 43680, 46000, 48380,
  50820, 53320, 55880, 58500, 61180, 63920, 66720, 69580, 72500, 75480,
]

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — GENERAL
// ══════════════════════════════════════════════════════════════════

const AP_MAX_LEVEL = 50
const AP_BASE_HEALTH = 100
const AP_HEALTH_PER_LEVEL = 10
const AP_BASE_STAMINA = 50
const AP_STAMINA_PER_LEVEL = 5
const AP_STAMINA_REGEN_RATE = 2
const AP_EXPLORATION_COOLDOWN_MS = 2000
const AP_MAX_INVENTORY_SIZE = 60
const AP_MAX_COINS = 9999999
const AP_SAVE_KEY = 'ancient-pyramid-save'
const AP_AUTO_SAVE_INTERVAL_MS = 20000
const AP_DAILY_QUEST_RESET_HOUR = 4
const AP_CURSE_BASE_DURATION = 5
const AP_TOOL_REPAIR_MULT = 0.3

// ══════════════════════════════════════════════════════════════════
// TITLES (8: Novice Explorer → Eternal Pharaoh)
// ══════════════════════════════════════════════════════════════════

const AP_TITLES: APTitle[] = [
  { id: 'novice_explorer', name: 'Novice Explorer', emoji: '🧭', levelReq: 1, description: 'A fresh-faced adventurer at the pyramid gates' },
  { id: 'sand_walker', name: 'Sand Walker', emoji: '🏜️', levelReq: 5, description: 'Accustomed to the burning desert winds' },
  { id: 'tomb_raider', name: 'Tomb Raider', emoji: '⛏️', levelReq: 10, description: 'Skilled in navigating ancient corridors' },
  { id: 'artifact_scholar', name: 'Artifact Scholar', emoji: '📜', levelReq: 18, description: 'A learned student of pyramid antiquities' },
  { id: 'curse_breaker', name: 'Curse Breaker', emoji: '🛡️', levelReq: 26, description: 'Defiant against the darkest maledictions' },
  { id: 'pyramid_master', name: 'Pyramid Master', emoji: '🏛️', levelReq: 34, description: 'Master of all chambers and their secrets' },
  { id: 'pharaohs_chosen', name: "Pharaoh's Chosen", emoji: '☀️', levelReq: 42, description: 'Blessed by the ancient sun god Ra' },
  { id: 'eternal_pharaoh', name: 'Eternal Pharaoh', emoji: '👁️', levelReq: 50, description: 'Supreme ruler of the eternal pyramid' },
]

// ══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS (18)
// ══════════════════════════════════════════════════════════════════

const AP_ACHIEVEMENT_TEMPLATES: Omit<APAchievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_step', name: 'First Steps', emoji: '👣', description: 'Enter the pyramid for the first time', condition: 'enter_pyramid', reward: { coins: 50, xp: 25 } },
  { id: 'first_artifact', name: 'Hoarder Begins', emoji: '🏺', description: 'Collect your first artifact', condition: 'collect_1_artifact', reward: { coins: 100, xp: 50 } },
  { id: 'ten_artifacts', name: 'Relic Collector', emoji: '🏺', description: 'Collect 10 artifacts', condition: 'collect_10_artifacts', reward: { coins: 500, xp: 200 } },
  { id: 'twenty_five_artifacts', name: 'Museum Curator', emoji: '🏛️', description: 'Collect 25 artifacts', condition: 'collect_25_artifacts', reward: { coins: 2000, xp: 600 } },
  { id: 'first_puzzle', name: 'Glyph Reader', emoji: '🔤', description: 'Solve your first hieroglyphic puzzle', condition: 'solve_1_puzzle', reward: { coins: 75, xp: 40 } },
  { id: 'ten_puzzles', name: 'Master Scribe', emoji: '📝', description: 'Solve 10 hieroglyphic puzzles', condition: 'solve_10_puzzles', reward: { coins: 800, xp: 350 } },
  { id: 'first_trap_disarm', name: 'Cautious Explorer', emoji: '🪤', description: 'Disarm your first trap', condition: 'disarm_1_trap', reward: { coins: 60, xp: 30 } },
  { id: 'twenty_traps', name: 'Trap Master', emoji: '🔧', description: 'Disarm 20 traps', condition: 'disarm_20_traps', reward: { coins: 1500, xp: 500 } },
  { id: 'survive_curse', name: 'Curse Survivor', emoji: '💀', description: 'Survive your first curse', condition: 'survive_1_curse', reward: { coins: 200, xp: 100 } },
  { id: 'cure_five_curses', name: 'Purifier', emoji: '✨', description: 'Cure 5 curses', condition: 'cure_5_curses', reward: { coins: 1200, xp: 450 } },
  { id: 'find_legendary', name: 'Legendary Discovery', emoji: '👁️', description: 'Find a legendary artifact', condition: 'find_legendary', reward: { coins: 5000, xp: 2000 } },
  { id: 'clear_first_chamber', name: 'Chamber Conquered', emoji: '🚪', description: 'Clear your first pyramid chamber', condition: 'clear_1_chamber', reward: { coins: 200, xp: 100 } },
  { id: 'clear_all_chambers', name: 'Pyramid Conqueror', emoji: '🏛️', description: 'Clear all 8 pyramid chambers', condition: 'clear_all_chambers', reward: { coins: 8000, xp: 3000 } },
  { id: 'level_10', name: 'Seasoned Adventurer', emoji: '⭐', description: 'Reach level 10', condition: 'reach_level_10', reward: { coins: 500, xp: 0 } },
  { id: 'level_25', name: 'Veteran Archaeologist', emoji: '⭐', description: 'Reach level 25', condition: 'reach_level_25', reward: { coins: 2500, xp: 0 } },
  { id: 'level_50', name: 'Eternal Pharaoh', emoji: '🌟', description: 'Reach level 50', condition: 'reach_level_50', reward: { coins: 15000, xp: 0 } },
  { id: 'earn_10k_coins', name: 'Golden Pharaoh', emoji: '💰', description: 'Accumulate 10,000 coins', condition: 'earn_10k_coins', reward: { coins: 0, xp: 300 } },
  { id: 'daily_streak_7', name: 'Devoted Explorer', emoji: '🔥', description: 'Maintain a 7-day daily quest streak', condition: 'daily_streak_7', reward: { coins: 2000, xp: 800 } },
]

// ══════════════════════════════════════════════════════════════════
// CHAMBERS (8)
// ══════════════════════════════════════════════════════════════════

const AP_CHAMBERS: APChamber[] = [
  {
    id: 'entrance_hall',
    name: 'Entrance Hall',
    emoji: '🚪',
    description: 'A crumbling stone corridor flanked by towering statues of jackal-headed guardians. Torchlight flickers across faded hieroglyphs that tell of the pharaoh\'s glory.',
    depth: 0,
    dangerLevel: 1,
    requiredLevel: 1,
    trapChance: 0.08,
    artifactChance: 0.15,
    puzzleChance: 0.1,
    curseChance: 0.02,
    coinRewardRange: [10, 30],
    xpRewardRange: [15, 40],
    bgTint: '#78716c',
  },
  {
    id: 'scarab_passage',
    name: 'Scarab Passage',
    emoji: '🪲',
    description: 'A narrow tunnel adorned with thousands of carved scarab beetles. The walls seem to shift and whisper ancient prayers as you pass through.',
    depth: 1,
    dangerLevel: 2,
    requiredLevel: 3,
    trapChance: 0.12,
    artifactChance: 0.2,
    puzzleChance: 0.15,
    curseChance: 0.04,
    coinRewardRange: [20, 55],
    xpRewardRange: [30, 70],
    bgTint: '#57534e',
  },
  {
    id: 'pharaohs_tomb',
    name: "Pharaoh's Tomb",
    emoji: '⚰️',
    description: 'The resting place of an ancient ruler. A massive stone sarcophagus dominates the center, surrounded by offerings of food, wine, and treasure that have waited millennia.',
    depth: 2,
    dangerLevel: 3,
    requiredLevel: 7,
    trapChance: 0.15,
    artifactChance: 0.25,
    puzzleChance: 0.2,
    curseChance: 0.06,
    coinRewardRange: [35, 90],
    xpRewardRange: [50, 120],
    bgTint: '#44403c',
  },
  {
    id: 'treasure_vault',
    name: 'Treasure Vault',
    emoji: '💰',
    description: 'Mountains of golden coins, jewel-encrusted weapons, and ornate chests fill this vast chamber. But ancient guardians still patrol these hallowed halls.',
    depth: 3,
    dangerLevel: 4,
    requiredLevel: 12,
    trapChance: 0.18,
    artifactChance: 0.3,
    puzzleChance: 0.15,
    curseChance: 0.08,
    coinRewardRange: [60, 160],
    xpRewardRange: [80, 200],
    bgTint: '#713f12',
  },
  {
    id: 'anubis_shrine',
    name: 'Anubis Shrine',
    emoji: '🐺',
    description: 'A sacred shrine to the jackal god of the dead. Black candles burn with blue flame, and the air is thick with the scent of frankincense and myrrh.',
    depth: 4,
    dangerLevel: 5,
    requiredLevel: 18,
    trapChance: 0.2,
    artifactChance: 0.35,
    puzzleChance: 0.25,
    curseChance: 0.12,
    coinRewardRange: [80, 220],
    xpRewardRange: [120, 300],
    bgTint: '#3f3f46',
  },
  {
    id: 'sphinx_chamber',
    name: 'Sphinx Chamber',
    emoji: '🦁',
    description: 'A colossal sphinx carved from living rock guards this chamber. Its riddles have turned away countless explorers, and its patience is truly eternal.',
    depth: 5,
    dangerLevel: 6,
    requiredLevel: 25,
    trapChance: 0.15,
    artifactChance: 0.4,
    puzzleChance: 0.35,
    curseChance: 0.15,
    coinRewardRange: [120, 320],
    xpRewardRange: [180, 450],
    bgTint: '#5c4a3a',
  },
  {
    id: 'hidden_catacombs',
    name: 'Hidden Catacombs',
    emoji: '💀',
    description: 'A labyrinth of unmarked passages beneath the pyramid. Skeletal remains line the walls, and the groans of the restless dead echo endlessly.',
    depth: 6,
    dangerLevel: 7,
    requiredLevel: 34,
    trapChance: 0.25,
    artifactChance: 0.45,
    puzzleChance: 0.2,
    curseChance: 0.2,
    coinRewardRange: [160, 420],
    xpRewardRange: [250, 600],
    bgTint: '#292524',
  },
  {
    id: 'golden_sarcophagus',
    name: 'The Golden Sarcophagus',
    emoji: '👁️',
    description: 'The innermost sanctum of the pyramid. A massive golden coffin radiates otherworldly energy, and the walls pulse with living hieroglyphs of immense power.',
    depth: 7,
    dangerLevel: 8,
    requiredLevel: 42,
    trapChance: 0.3,
    artifactChance: 0.55,
    puzzleChance: 0.3,
    curseChance: 0.25,
    coinRewardRange: [250, 600],
    xpRewardRange: [400, 900],
    bgTint: '#78350f',
  },
]

// ══════════════════════════════════════════════════════════════════
// ARTIFACTS (35, across 5 rarity tiers)
// ══════════════════════════════════════════════════════════════════

const AP_ARTIFACTS: APArtifact[] = [
  // ── Common (12) ──────────────────────────────────────────────
  { id: 'clay_shard', name: 'Clay Shard', emoji: '🪨', rarity: 'common', description: 'A weathered pottery fragment with faint markings.', era: '~2500 BCE', baseValue: 15, xpReward: 10, chamber: 'entrance_hall', curseChance: 0 },
  { id: 'worn_scarab', name: 'Worn Scarab', emoji: '🪲', rarity: 'common', description: 'A crumbling clay scarab amulet, once carried by a common worker.', era: '~1450 BCE', baseValue: 20, xpReward: 12, chamber: 'entrance_hall', curseChance: 0 },
  { id: 'rusty_khopesh', name: 'Rusty Khopesh', emoji: '🗡️', rarity: 'common', description: 'A bronze sickle-sword heavily corroded by millennia of neglect.', era: '~1300 BCE', baseValue: 25, xpReward: 15, chamber: 'scarab_passage', curseChance: 0 },
  { id: 'papyrus_scrap', name: 'Papyrus Scrap', emoji: '📜', rarity: 'common', description: 'A faded fragment of a funerary text in hieratic script.', era: '~1100 BCE', baseValue: 18, xpReward: 10, chamber: 'scarab_passage', curseChance: 0 },
  { id: 'faience_bead', name: 'Faience Bead', emoji: '📿', rarity: 'common', description: 'A turquoise-glazed ceramic bead from a priest\'s collar.', era: '~1350 BCE', baseValue: 22, xpReward: 12, chamber: 'pharaohs_tomb', curseChance: 0.01 },
  { id: 'stone_ushabti', name: 'Stone Ushabti', emoji: '🗿', rarity: 'common', description: 'A small servant figure meant to labor in the afterlife.', era: '~1000 BCE', baseValue: 30, xpReward: 18, chamber: 'pharaohs_tomb', curseChance: 0.01 },
  { id: 'linen_bandage', name: 'Linen Bandage', emoji: '🩹', rarity: 'common', description: 'Preserved wrapping cloth from a minor mummification.', era: '~900 BCE', baseValue: 12, xpReward: 8, chamber: 'pharaohs_tomb', curseChance: 0 },
  { id: 'copper_mirror', name: 'Copper Mirror', emoji: '🪞', rarity: 'common', description: 'A polished copper disc once used by a noblewoman.', era: '~1400 BCE', baseValue: 28, xpReward: 14, chamber: 'treasure_vault', curseChance: 0.01 },
  { id: 'terracotta_oil_lamp', name: 'Terracotta Oil Lamp', emoji: '🪔', rarity: 'common', description: 'A simple oil lamp with traces of ancient soot.', era: '~1200 BCE', baseValue: 16, xpReward: 10, chamber: 'treasure_vault', curseChance: 0 },
  { id: 'wooden_scribe_palette', name: 'Wooden Scribe Palette', emoji: '🖌️', rarity: 'common', description: 'A scribe\'s palette with dry ink wells for red and black.', era: '~1250 BCE', baseValue: 24, xpReward: 14, chamber: 'anubis_shrine', curseChance: 0.01 },
  { id: 'cane_fragment', name: 'Cane Fragment', emoji: '🦯', rarity: 'common', description: 'A section of a pharaoh\'s ceremonial walking stick.', era: '~1350 BCE', baseValue: 20, xpReward: 12, chamber: 'anubis_shrine', curseChance: 0 },
  { id: 'sandstone_block', name: 'Sandstone Block', emoji: '🧱', rarity: 'common', description: 'A carved block with a single hieroglyph: "Eternity."', era: '~2600 BCE', baseValue: 14, xpReward: 8, chamber: 'entrance_hall', curseChance: 0 },

  // ── Uncommon (10) ────────────────────────────────────────────
  { id: 'lapis_necklace', name: 'Lapis Lazuli Necklace', emoji: '💎', rarity: 'uncommon', description: 'A string of deep blue lapis beads once worn by a princess.', era: '~1350 BCE', baseValue: 120, xpReward: 60, chamber: 'treasure_vault', curseChance: 0.03 },
  { id: 'bronze_cat_statue', name: 'Bronze Cat Statue', emoji: '🐱', rarity: 'uncommon', description: 'A finely cast bronze figurine of Bastet, goddess of cats.', era: '~750 BCE', baseValue: 150, xpReward: 75, chamber: 'anubis_shrine', curseChance: 0.04 },
  { id: 'canopic_jar_set', name: 'Canopic Jar Set', emoji: '🏺', rarity: 'uncommon', description: 'Four limestone jars with lids shaped as the four sons of Horus.', era: '~1200 BCE', baseValue: 180, xpReward: 90, chamber: 'pharaohs_tomb', curseChance: 0.05 },
  { id: 'wax_tablet', name: 'Wax Tablet', emoji: '📋', rarity: 'uncommon', description: 'A schoolboy\'s wax tablet with hieratic writing exercises.', era: '~1150 BCE', baseValue: 90, xpReward: 45, chamber: 'scarab_passage', curseChance: 0.02 },
  { id: 'gold_earring', name: 'Gold Earring', emoji: '✨', rarity: 'uncommon', description: 'A delicate gold hoop earring with granulation detail.', era: '~1400 BCE', baseValue: 130, xpReward: 65, chamber: 'treasure_vault', curseChance: 0.03 },
  { id: 'ostraca_fragment', name: 'Ostraca Fragment', emoji: '📄', rarity: 'uncommon', description: 'A limestone flake with a worker\'s complaint about rations.', era: '~1200 BCE', baseValue: 85, xpReward: 42, chamber: 'scarab_passage', curseChance: 0.02 },
  { id: 'jade_amulet', name: 'Jade Amulet', emoji: '💚', rarity: 'uncommon', description: 'A heart-shaped amulet meant to protect the soul in judgment.', era: '~1300 BCE', baseValue: 140, xpReward: 70, chamber: 'anubis_shrine', curseChance: 0.04 },
  { id: 'carved_ivory_comb', name: 'Carved Ivory Comb', emoji: '🪮', rarity: 'uncommon', description: 'An ornate ivory comb depicting lions hunting gazelles.', era: '~1350 BCE', baseValue: 110, xpReward: 55, chamber: 'sphinx_chamber', curseChance: 0.03 },
  { id: 'beer_jar', name: 'Ceramic Beer Jar', emoji: '🍺', rarity: 'uncommon', description: 'A sealed vessel with residue of ancient Egyptian beer.', era: '~1550 BCE', baseValue: 75, xpReward: 38, chamber: 'pharaohs_tomb', curseChance: 0.02 },
  { id: 'shabti_box', name: 'Shabti Box', emoji: '📦', rarity: 'uncommon', description: 'A painted wooden box containing dozens of servant figurines.', era: '~1000 BCE', baseValue: 160, xpReward: 80, chamber: 'pharaohs_tomb', curseChance: 0.04 },

  // ── Rare (7) ─────────────────────────────────────────────────
  { id: 'golden_scarab', name: 'Golden Scarab', emoji: '🪙', rarity: 'rare', description: 'A solid gold scarab with the throne name of Thutmose III on its base.', era: '~1450 BCE', baseValue: 600, xpReward: 250, chamber: 'treasure_vault', curseChance: 0.08 },
  { id: 'rosetta_stone_shard', name: 'Rosetta Stone Shard', emoji: '🪨', rarity: 'rare', description: 'A fragment bearing parallel hieroglyphic and Greek inscriptions.', era: '~196 BCE', baseValue: 750, xpReward: 300, chamber: 'sphinx_chamber', curseChance: 0.1 },
  { id: 'obsidian_blade', name: 'Obsidian Blade', emoji: '🔪', rarity: 'rare', description: 'A razor-sharp ritual flint knife used in the Opening of the Mouth ceremony.', era: '~1350 BCE', baseValue: 550, xpReward: 220, chamber: 'anubis_shrine', curseChance: 0.07 },
  { id: 'eye_of_horus', name: 'Eye of Horus', emoji: '👁️', rarity: 'rare', description: 'A solid gold wadjet eye inlaid with lapis lazuli and carnelian.', era: '~1250 BCE', baseValue: 680, xpReward: 270, chamber: 'sphinx_chamber', curseChance: 0.09 },
  { id: 'silver_vessel', name: 'Silver Vessel', emoji: '🫖', rarity: 'rare', description: 'A rare silver libation vessel from the reign of Amenhotep III.', era: '~1370 BCE', baseValue: 500, xpReward: 200, chamber: 'treasure_vault', curseChance: 0.06 },
  { id: 'painted_sarcophagus_panel', name: 'Painted Sarcophagus Panel', emoji: '🖼️', rarity: 'rare', description: 'A vividly painted wooden panel showing the deceased before Osiris.', era: '~1000 BCE', baseValue: 620, xpReward: 240, chamber: 'pharaohs_tomb', curseChance: 0.08 },
  { id: 'rishi_bead_collar', name: 'Rishi Bead Collar', emoji: '📿', rarity: 'rare', description: 'A magnificent collar of gold and faience beads in feathered pattern.', era: '~1550 BCE', baseValue: 580, xpReward: 230, chamber: 'sphinx_chamber', curseChance: 0.07 },

  // ── Epic (4) ─────────────────────────────────────────────────
  { id: 'book_of_dead_page', name: 'Book of the Dead Page', emoji: '📖', rarity: 'epic', description: 'A complete papyrus page from Spell 125 — the Weighing of the Heart ceremony.', era: '~1070 BCE', baseValue: 2500, xpReward: 800, chamber: 'golden_sarcophagus', curseChance: 0.15 },
  { id: 'pharaohs_mask_fragment', name: "Pharaoh's Mask Fragment", emoji: '🎭', rarity: 'epic', description: 'A section of a golden death mask with lapis and turquoise inlay.', era: '~1323 BCE', baseValue: 3200, xpReward: 1000, chamber: 'hidden_catacombs', curseChance: 0.18 },
  { id: 'anubis_shrine_model', name: 'Anubis Shrine Model', emoji: '🐺', rarity: 'epic', description: 'A gilded wooden shrine containing a perfectly preserved jackal figure.', era: '~1350 BCE', baseValue: 2800, xpReward: 900, chamber: 'anubis_shrine', curseChance: 0.15 },
  { id: 'crystal_scarab_pectoral', name: 'Crystal Scarab Pectoral', emoji: '💎', rarity: 'epic', description: 'A magnificent chest ornament of rock crystal, gold, and carnelian scarabs.', era: '~1300 BCE', baseValue: 3500, xpReward: 1100, chamber: 'hidden_catacombs', curseChance: 0.2 },

  // ── Legendary (2) ────────────────────────────────────────────
  { id: 'eye_of_ra_medallion', name: 'Eye of Ra Medallion', emoji: '☀️', rarity: 'legendary', description: 'A blazing medallion said to channel the power of the sun god himself. It emanates warmth and light.', era: '~2500 BCE', baseValue: 15000, xpReward: 5000, chamber: 'golden_sarcophagus', curseChance: 0.25 },
  { id: 'eternal_scepter', name: 'Eternal Scepter', emoji: '👑', rarity: 'legendary', description: 'The crook and flail of a forgotten pharaoh, radiating timeless authority and dark power.', era: '~2600 BCE', baseValue: 20000, xpReward: 7000, chamber: 'golden_sarcophagus', curseChance: 0.3 },
]

// ══════════════════════════════════════════════════════════════════
// HIEROGLYPHIC INSCRIPTIONS / PUZZLES (30)
// ══════════════════════════════════════════════════════════════════

const AP_PUZZLES: APHieroglyphicPuzzle[] = [
  // ── Translation puzzles (8) ──────────────────────────────────
  { id: 'pz_translate_01', name: 'The Builder\'s Mark', emoji: '🔤', type: 'translation', difficulty: 1, description: 'Translate this hieroglyph: 𓊵 (worker)', hintText: 'Think of those who built the pyramids', answer: 'laborer', xpReward: 25, coinReward: 15, chamber: 'entrance_hall' },
  { id: 'pz_translate_02', name: 'The Sacred Bird', emoji: '🐦', type: 'translation', difficulty: 1, description: 'Translate this hieroglyph: 𓅃 (bird of the Nile)', hintText: 'This bird represents the letter "M" in hieroglyphs', answer: 'owl', xpReward: 25, coinReward: 15, chamber: 'entrance_hall' },
  { id: 'pz_translate_03', name: 'The Pharaoh\'s Title', emoji: '👑', type: 'translation', difficulty: 2, description: 'What does "Nesut-Bity" mean?', hintText: 'It is composed of the sedge plant and the bee', answer: 'king', xpReward: 40, coinReward: 25, chamber: 'scarab_passage' },
  { id: 'pz_translate_04', name: 'The God of Wisdom', emoji: '🦅', type: 'translation', difficulty: 2, description: 'Which god is associated with the ibis hieroglyph 𓅓?', hintText: 'He is the scribe of the gods and inventor of writing', answer: 'thoth', xpReward: 45, coinReward: 30, chamber: 'scarab_passage' },
  { id: 'pz_translate_05', name: 'The Offering Formula', emoji: '📜', type: 'translation', difficulty: 3, description: 'What does "Hetep-di-nesu" mean?', hintText: 'It is the most common prayer found on tomb walls', answer: 'offering', xpReward: 65, coinReward: 45, chamber: 'pharaohs_tomb' },
  { id: 'pz_translate_06', name: 'The Duat Passage', emoji: '🌅', type: 'translation', difficulty: 3, description: 'What is "Duat" in Egyptian cosmology?', hintText: 'The sun god Ra travels through it each night', answer: 'underworld', xpReward: 70, coinReward: 50, chamber: 'anubis_shrine' },
  { id: 'pz_translate_07', name: 'The Cartouche Riddle', emoji: '⭕', type: 'translation', difficulty: 4, description: 'What does the oval ring (cartouche) signify around a name?', hintText: 'It shows this name belongs to someone very important', answer: 'pharaoh', xpReward: 100, coinReward: 70, chamber: 'sphinx_chamber' },
  { id: 'pz_translate_08', name: 'The Akh Sign', emoji: '✨', type: 'translation', difficulty: 4, description: 'What does the crested ibis 𓄡 symbolize in funerary texts?', hintText: 'It represents a transfigured spirit after death', answer: 'spirit', xpReward: 110, coinReward: 80, chamber: 'hidden_catacombs' },

  // ── Sequence puzzles (6) ─────────────────────────────────────
  { id: 'pz_sequence_01', name: 'Dynasty Order', emoji: '📊', type: 'sequence', difficulty: 1, description: 'Order these periods: Old Kingdom, New Kingdom, Middle Kingdom', hintText: 'Oldest to newest', answer: 'old,middle,new', xpReward: 30, coinReward: 20, chamber: 'entrance_hall' },
  { id: 'pz_sequence_02', name: 'Mummification Steps', emoji: '🧟', type: 'sequence', difficulty: 2, description: 'Order the mummification: remove organs, wrap body, wash body, place in sarcophagus', hintText: 'Think about the logical order of preparation', answer: 'wash,organs,wrap,sarcophagus', xpReward: 50, coinReward: 35, chamber: 'pharaohs_tomb' },
  { id: 'pz_sequence_03', name: 'Book of the Dead Spells', emoji: '📖', type: 'sequence', difficulty: 2, description: 'Order: Weighing of Heart, Opening of Mouth, Journey through Duat, Reunion with Ka', hintText: 'Follow the soul\'s journey after death', answer: 'journey,weighing,opening,reunion', xpReward: 55, coinReward: 40, chamber: 'pharaohs_tomb' },
  { id: 'pz_sequence_04', name: 'Pyramid Evolution', emoji: '🔺', type: 'sequence', difficulty: 3, description: 'Order: Red Pyramid, Great Pyramid, Bent Pyramid, Step Pyramid', hintText: 'Chronological order of construction', answer: 'step,bent,red,great', xpReward: 75, coinReward: 50, chamber: 'sphinx_chamber' },
  { id: 'pz_sequence_05', name: 'God Hierarchy', emoji: '⛰️', type: 'sequence', difficulty: 3, description: 'Rank by power: Ra, Shu, Geb, Osiris (highest to lowest)', hintText: 'Follow the Ennead creation myth from sun to earth', answer: 'ra,shu,geb,osiris', xpReward: 80, coinReward: 55, chamber: 'anubis_shrine' },
  { id: 'pz_sequence_06', name: 'Judgment of Osiris', emoji: '⚖️', type: 'sequence', difficulty: 4, description: 'Order: Confession, Heart weighed, Ammut waits, 42 Negative Confessions, Outcome', hintText: 'The judgment ritual from Spell 125', answer: 'confession,negative,weighed,ammut,outcome', xpReward: 120, coinReward: 85, chamber: 'golden_sarcophagus' },

  // ── Cipher puzzles (5) ───────────────────────────────────────
  { id: 'pz_cipher_01', name: 'Simple Substitution', emoji: '🔐', type: 'cipher', difficulty: 1, description: 'Decode: "PRWR" → shift each letter back 3 positions', hintText: 'A=C, B=D, ...', answer: 'mono', xpReward: 35, coinReward: 22, chamber: 'entrance_hall' },
  { id: 'pz_cipher_02', name: 'Atbash Cipher', emoji: '🔁', type: 'cipher', difficulty: 2, description: 'Decode "TLIZHR" using Atbash (A↔Z, B↔Y)', hintText: 'The first letter T becomes G', answer: 'goraas', xpReward: 55, coinReward: 38, chamber: 'scarab_passage' },
  { id: 'pz_cipher_03', name: 'Hieroglyph Numbers', emoji: '🔢', type: 'cipher', difficulty: 2, description: '𓏺𓏺𓏺𓍿 = ? (stroke=1, hobble=10, coil=100)', hintText: 'Each symbol has a numeric value', answer: '13', xpReward: 60, coinReward: 40, chamber: 'pharaohs_tomb' },
  { id: 'pz_cipher_04', name: 'Polybius Square', emoji: '🔲', type: 'cipher', difficulty: 3, description: 'Decode: "11 42 34 22" using a 5x5 Polybius square', hintText: 'A=11, B=12, C=13...', answer: 'adventure', xpReward: 90, coinReward: 65, chamber: 'sphinx_chamber' },
  { id: 'pz_cipher_05', name: 'Royal Cartouche', emoji: '👑', type: 'cipher', difficulty: 4, description: 'Decode the cartouche: "MN-KHPR-R" → who is this pharaoh?', hintText: 'The boy king with the famous golden mask', answer: 'tutankhamun', xpReward: 140, coinReward: 100, chamber: 'golden_sarcophagus' },

  // ── Riddle puzzles (5) ───────────────────────────────────────
  { id: 'pz_riddle_01', name: 'The Sphinx Riddle', emoji: '🦁', type: 'riddle', difficulty: 2, description: 'I have a body of a lion and the head of a human. I guard the Giza plateau. What am I?', hintText: 'The Great ___ of Giza', answer: 'sphinx', xpReward: 45, coinReward: 30, chamber: 'sphinx_chamber' },
  { id: 'pz_riddle_02', name: 'The River Riddle', emoji: '🌊', type: 'riddle', difficulty: 1, description: 'I flow northward through the desert and give life to all of Egypt. What am I?', hintText: 'The sacred river of Egypt', answer: 'nile', xpReward: 30, coinReward: 18, chamber: 'entrance_hall' },
  { id: 'pz_riddle_03', name: 'The Jackal Riddle', emoji: '🐺', type: 'riddle', difficulty: 2, description: 'I weigh the hearts of the dead and guide souls through the Duat. Which god am I?', hintText: 'The god with the jackal head', answer: 'anubis', xpReward: 50, coinReward: 35, chamber: 'anubis_shrine' },
  { id: 'pz_riddle_04', name: 'The Sun Boat Riddle', emoji: '⛵', type: 'riddle', difficulty: 3, description: 'I sail across the sky by day and through the underworld by night. Who am I?', hintText: 'The king of the Egyptian gods', answer: 'ra', xpReward: 70, coinReward: 48, chamber: 'sphinx_chamber' },
  { id: 'pz_riddle_05', name: 'The Eternity Riddle', emoji: '♾️', type: 'riddle', difficulty: 4, description: 'I am the scarab god who rolls the sun across the sky. I represent creation and renewal. Who am I?', hintText: 'Another form of Ra at dawn', answer: 'khepri', xpReward: 130, coinReward: 90, chamber: 'hidden_catacombs' },

  // ── Pattern puzzles (4) ──────────────────────────────────────
  { id: 'pz_pattern_01', name: 'Hieroglyph Pattern', emoji: '🔱', type: 'pattern', difficulty: 1, description: 'Complete the pattern: 𓀀 𓀁 𓀂 ?', hintText: 'Each symbol represents a seated man in a different posture', answer: '𓀃', xpReward: 28, coinReward: 18, chamber: 'entrance_hall' },
  { id: 'pz_pattern_02', name: 'Sacred Number Pattern', emoji: '🔢', type: 'pattern', difficulty: 2, description: 'Complete: 1, 4, 9, 16, ?', hintText: 'These are the squares of natural numbers', answer: '25', xpReward: 45, coinReward: 30, chamber: 'scarab_passage' },
  { id: 'pz_pattern_03', name: 'Star Pattern', emoji: '⭐', type: 'pattern', difficulty: 3, description: 'Complete: Orion, Sirius, ?, Vega (Egyptian significance)', hintText: 'The star associated with the goddess Sopdet', answer: 'sopdet', xpReward: 80, coinReward: 55, chamber: 'anubis_shrine' },
  { id: 'pz_pattern_04', name: 'Sacred Geometry', emoji: '📐', type: 'pattern', difficulty: 4, description: 'What shape has 4 equal sides and appears on the pyramid\'s cross-section?', hintText: 'The mathematical perfection of the Great Pyramid', answer: 'triangle', xpReward: 110, coinReward: 75, chamber: 'golden_sarcophagus' },

  // ── Anagram puzzles (2) ──────────────────────────────────────
  { id: 'pz_anagram_01', name: 'Scrambled God', emoji: '🔀', type: 'anagram', difficulty: 2, description: 'Unscramble: "HOTUHS" → an Egyptian god', hintText: 'God of writing and wisdom', answer: 'thoth', xpReward: 50, coinReward: 32, chamber: 'pharaohs_tomb' },
  { id: 'pz_anagram_02', name: 'Scrambled City', emoji: '🔀', type: 'anagram', difficulty: 3, description: 'Unscramble: "XESW TKABNA" → an ancient Egyptian city', hintText: 'The city of the pharaohs on the Nile delta', answer: 'thebes karnak', xpReward: 95, coinReward: 65, chamber: 'sphinx_chamber' },
]

// ══════════════════════════════════════════════════════════════════
// EXCAVATION TOOLS (25)
// ══════════════════════════════════════════════════════════════════

const AP_TOOL_TEMPLATES: Omit<APExcavationTool, 'level' | 'durability'>[] = [
  // ── Excavation (5) ───────────────────────────────────────────
  { id: 'trowel_basic', name: 'Basic Trowel', emoji: '🪣', category: 'excavation', description: 'A standard hand trowel for careful soil removal.', maxLevel: 5, efficiency: 0.5, precision: 0.7, maxDurability: 100, upgradeCost: 100, repairCost: 20 },
  { id: 'shovel_expedition', name: 'Expedition Shovel', emoji: '⛏️', category: 'excavation', description: 'A heavy-duty shovel for clearing large amounts of sand and debris.', maxLevel: 5, efficiency: 0.8, precision: 0.3, maxDurability: 80, upgradeCost: 150, repairCost: 30 },
  { id: 'pick_digging', name: 'Digging Pick', emoji: '⚒️', category: 'excavation', description: 'A pickaxe for breaking through hardened sediment and stone.', maxLevel: 5, efficiency: 0.9, precision: 0.2, maxDurability: 60, upgradeCost: 200, repairCost: 40 },
  { id: 'trowel_ceramic', name: 'Ceramic Specialist Trowel', emoji: '🏺', category: 'excavation', description: 'A precision trowel designed for delicate ceramic artifact recovery.', maxLevel: 5, efficiency: 0.6, precision: 0.95, maxDurability: 90, upgradeCost: 250, repairCost: 35 },
  { id: 'mechanical_excavator', name: 'Mechanical Excavator', emoji: '🤖', category: 'excavation', description: 'A steam-powered excavating machine for deep chamber clearing.', maxLevel: 5, efficiency: 0.95, precision: 0.4, maxDurability: 120, upgradeCost: 500, repairCost: 60 },

  // ── Brushing (4) ─────────────────────────────────────────────
  { id: 'brush_soft', name: 'Soft-Bristle Brush', emoji: '🖌️', category: 'brushing', description: 'A fine brush for gently cleaning dust from artifact surfaces.', maxLevel: 5, efficiency: 0.3, precision: 1.0, maxDurability: 150, upgradeCost: 80, repairCost: 15 },
  { id: 'brush_wire', name: 'Wire Brush', emoji: '🧹', category: 'brushing', description: 'A stiffer brush for removing encrusted soil from robust finds.', maxLevel: 5, efficiency: 0.6, precision: 0.8, maxDurability: 100, upgradeCost: 120, repairCost: 22 },
  { id: 'brush_air', name: 'Compressed Air Blower', emoji: '💨', category: 'brushing', description: 'Precision air tool for removing fine particles from fragile relics.', maxLevel: 5, efficiency: 0.5, precision: 0.9, maxDurability: 200, upgradeCost: 180, repairCost: 25 },
  { id: 'brush_laser', name: 'Laser Cleaning Tool', emoji: '🔦', category: 'brushing', description: 'Advanced laser device for non-contact cleaning of delicate surfaces.', maxLevel: 5, efficiency: 0.4, precision: 1.0, maxDurability: 80, upgradeCost: 400, repairCost: 50 },

  // ── Scanning (4) ─────────────────────────────────────────────
  { id: 'scanner_metal', name: 'Metal Detector', emoji: '📡', category: 'scanning', description: 'Electromagnetic scanner for detecting metallic artifacts nearby.', maxLevel: 5, efficiency: 0.5, precision: 0.7, maxDurability: 100, upgradeCost: 200, repairCost: 30 },
  { id: 'scanner_ground', name: 'Ground-Penetrating Radar', emoji: '📡', category: 'scanning', description: 'Reveals underground structures and hidden chambers.', maxLevel: 5, efficiency: 0.4, precision: 0.85, maxDurability: 80, upgradeCost: 350, repairCost: 45 },
  { id: 'scanner_ultrasonic', name: 'Ultrasonic Scanner', emoji: '🔊', category: 'scanning', description: 'Uses sound waves to detect void spaces behind walls.', maxLevel: 5, efficiency: 0.6, precision: 0.8, maxDurability: 90, upgradeCost: 300, repairCost: 38 },
  { id: 'scanner_xray', name: 'Portable X-Ray', emoji: '☢️', category: 'scanning', description: 'Advanced imaging tool that reveals contents inside sealed containers.', maxLevel: 5, efficiency: 0.3, precision: 0.95, maxDurability: 60, upgradeCost: 600, repairCost: 70 },

  // ── Translation (4) ──────────────────────────────────────────
  { id: 'translator_basic', name: 'Hieroglyph Dictionary', emoji: '📖', category: 'translation', description: 'A reference guide for common hieroglyphic symbols and meanings.', maxLevel: 5, efficiency: 0.4, precision: 0.6, maxDurability: 200, upgradeCost: 100, repairCost: 10 },
  { id: 'translator_advanced', name: 'Grammar Compendium', emoji: '📚', category: 'translation', description: 'Comprehensive guide to Middle Egyptian grammar and syntax.', maxLevel: 5, efficiency: 0.6, precision: 0.75, maxDurability: 200, upgradeCost: 200, repairCost: 15 },
  { id: 'translator_ai', name: 'AI Translation Tablet', emoji: '💻', category: 'translation', description: 'A tablet running neural network hieroglyphic recognition software.', maxLevel: 5, efficiency: 0.8, precision: 0.9, maxDurability: 150, upgradeCost: 500, repairCost: 40 },
  { id: 'translator_rosetta', name: 'Rosetta Matrix', emoji: '🔮', category: 'translation', description: 'Advanced holographic translation device with full glyph database.', maxLevel: 5, efficiency: 0.95, precision: 0.98, maxDurability: 120, upgradeCost: 1000, repairCost: 60 },

  // ── Survival (4) ─────────────────────────────────────────────
  { id: 'survival_firstaid', name: 'First Aid Kit', emoji: '🩹', category: 'survival', description: 'Basic medical supplies for treating injuries in the field.', maxLevel: 5, efficiency: 0.5, precision: 0.7, maxDurability: 100, upgradeCost: 80, repairCost: 20 },
  { id: 'survival_torch', name: 'Everflame Torch', emoji: '🔥', category: 'survival', description: 'A torch enchanted to burn without fuel, illuminating dark passages.', maxLevel: 5, efficiency: 0.7, precision: 0.5, maxDurability: 120, upgradeCost: 120, repairCost: 15 },
  { id: 'survival_gas_mask', name: 'Antique Gas Mask', emoji: '😷', category: 'survival', description: 'Filters out toxic gases and ancient airborne pathogens.', maxLevel: 5, efficiency: 0.8, precision: 0.6, maxDurability: 80, upgradeCost: 200, repairCost: 35 },
  { id: 'survival_shield', name: 'Amulet Shield', emoji: '🛡️', category: 'survival', description: 'A magical barrier amulet that absorbs a portion of trap damage.', maxLevel: 5, efficiency: 0.6, precision: 0.8, maxDurability: 150, upgradeCost: 350, repairCost: 45 },

  // ── Disarming (4) ────────────────────────────────────────────
  { id: 'disarm_wire_cutters', name: 'Ancient Wire Cutters', emoji: '🔧', category: 'disarming', description: 'Precision cutters for snipping tripwires and pressure mechanisms.', maxLevel: 5, efficiency: 0.6, precision: 0.7, maxDurability: 100, upgradeCost: 150, repairCost: 25 },
  { id: 'disarm_lockpick', name: 'Master Lockpick Set', emoji: '🗝️', category: 'disarming', description: 'A complete set of picks for opening ancient Egyptian locks.', maxLevel: 5, efficiency: 0.5, precision: 0.85, maxDurability: 90, upgradeCost: 200, repairCost: 30 },
  { id: 'disarm_magnet', name: 'Electromagnetic Disruptor', emoji: '🧲', category: 'disarming', description: 'Disrupts magnetic and spring-loaded trap mechanisms remotely.', maxLevel: 5, efficiency: 0.7, precision: 0.8, maxDurability: 70, upgradeCost: 400, repairCost: 50 },
  { id: 'disarm_defusal', name: 'Ancient Defusal Kit', emoji: '💣', category: 'disarming', description: 'Complete toolkit with counterweights, pulleys, and dummy triggers.', maxLevel: 5, efficiency: 0.8, precision: 0.9, maxDurability: 110, upgradeCost: 600, repairCost: 55 },
]

// ══════════════════════════════════════════════════════════════════
// EXPLORER ABILITIES (22)
// ══════════════════════════════════════════════════════════════════

const AP_ABILITY_TEMPLATES: Omit<APExplorerAbility, 'isActive' | 'currentCooldown'>[] = [
  // ── Combat (5) ───────────────────────────────────────────────
  { id: 'ab_sandstorm', name: 'Sandstorm Strike', emoji: '🌪️', category: 'combat', description: 'Unleash a blinding sandstorm that stuns enemies and traps for 3 turns.', levelReq: 1, cooldown: 5, duration: 3, effectValue: 20, unlockCost: 0 },
  { id: 'ab_scarab_swarm', name: 'Scarab Swarm', emoji: '🪲', category: 'combat', description: 'Summon sacred scarabs that weaken trap mechanisms by 30%.', levelReq: 5, cooldown: 4, duration: 2, effectValue: 30, unlockCost: 200 },
  { id: 'ab_sun_ray', name: 'Sun Ray Blast', emoji: '☀️', category: 'combat', description: 'Channel Ra\'s power to burn through obstacles and deal heavy damage.', levelReq: 12, cooldown: 6, duration: 1, effectValue: 50, unlockCost: 800 },
  { id: 'ab_anubis_judgment', name: 'Anubis Judgment', emoji: '🐺', category: 'combat', description: 'Call upon Anubis to instantly disarm all traps in the current chamber.', levelReq: 22, cooldown: 8, duration: 0, effectValue: 100, unlockCost: 3000 },
  { id: 'ab_pharaohs_wrath', name: "Pharaoh's Wrath", emoji: '👁️', category: 'combat', description: 'Invoke the pharaoh\'s rage to obliterate all threats in a 5-tile radius.', levelReq: 35, cooldown: 10, duration: 1, effectValue: 80, unlockCost: 8000 },

  // ── Exploration (5) ──────────────────────────────────────────
  { id: 'ab_desert_sight', name: 'Desert Sight', emoji: '👁️', category: 'exploration', description: 'See through walls to reveal hidden chambers and traps for 3 turns.', levelReq: 1, cooldown: 4, duration: 3, effectValue: 40, unlockCost: 0 },
  { id: 'ab_sand_walker', name: 'Sand Walker', emoji: '🏜️', category: 'exploration', description: 'Phase through sand barriers and collapsed passages for 2 turns.', levelReq: 7, cooldown: 5, duration: 2, effectValue: 25, unlockCost: 300 },
  { id: 'ab_burrow', name: 'Sacred Burrow', emoji: '🕳️', category: 'exploration', description: 'Dig a shortcut tunnel to any previously visited chamber.', levelReq: 15, cooldown: 8, duration: 0, effectValue: 60, unlockCost: 1200 },
  { id: 'ab_ra_illumination', name: 'Ra Illumination', emoji: '💡', category: 'exploration', description: 'Illuminate the entire pyramid map, revealing all secret locations.', levelReq: 28, cooldown: 10, duration: 5, effectValue: 100, unlockCost: 5000 },
  { id: 'ab_shadow_step', name: 'Shadow Step', emoji: '👤', category: 'exploration', description: 'Teleport through shadows to any chamber regardless of level requirement.', levelReq: 40, cooldown: 12, duration: 0, effectValue: 100, unlockCost: 12000 },

  // ── Puzzle Solving (4) ───────────────────────────────────────
  { id: 'ab_glyph_insight', name: 'Glyph Insight', emoji: '🔤', category: 'puzzle_solving', description: 'Gain a powerful hint that reveals 50% of the puzzle answer.', levelReq: 1, cooldown: 3, duration: 1, effectValue: 50, unlockCost: 0 },
  { id: 'ab_scribe_blessing', name: 'Scribe Blessing', emoji: '📝', category: 'puzzle_solving', description: 'Doubles XP earned from puzzle solving for 4 turns.', levelReq: 10, cooldown: 5, duration: 4, effectValue: 100, unlockCost: 600 },
  { id: 'ab_thoth_wisdom', name: 'Thoth Wisdom', emoji: '🦅', category: 'puzzle_solving', description: 'Automatically solve the next hieroglyphic puzzle without penalty.', levelReq: 20, cooldown: 7, duration: 0, effectValue: 100, unlockCost: 2500 },
  { id: 'ab_rosetta_vision', name: 'Rosetta Vision', emoji: '🔮', category: 'puzzle_solving', description: 'Permanently reveals the correct answer to any puzzle you encounter.', levelReq: 38, cooldown: 15, duration: 1, effectValue: 100, unlockCost: 10000 },

  // ── Survival (4) ─────────────────────────────────────────────
  { id: 'ab_oasis_rest', name: 'Oasis Rest', emoji: '🌴', category: 'survival', description: 'Rest at a mystical oasis, restoring 50% health and full stamina.', levelReq: 1, cooldown: 6, duration: 0, effectValue: 50, unlockCost: 0 },
  { id: 'ab_desert_shield', name: 'Desert Shield', emoji: '🛡️', category: 'survival', description: 'Create a sand barrier that blocks the next 3 trap triggers.', levelReq: 8, cooldown: 5, duration: 3, effectValue: 75, unlockCost: 350 },
  { id: 'ab_curse_immunity', name: 'Curse Immunity', emoji: '✨', category: 'survival', description: 'Become immune to all curse effects for 3 turns.', levelReq: 16, cooldown: 7, duration: 3, effectValue: 100, unlockCost: 1500 },
  { id: 'ab_resurrection', name: 'Resurrection Ritual', emoji: '⚡', category: 'survival', description: 'If you would die, instead revive with full health once per cooldown.', levelReq: 30, cooldown: 12, duration: 0, effectValue: 100, unlockCost: 6000 },

  // ── Artifact Lore (4) ────────────────────────────────────────
  { id: 'ab_artifact_radar', name: 'Artifact Radar', emoji: '📡', category: 'artifact_lore', description: 'Detect nearby artifacts and estimate their rarity tier.', levelReq: 1, cooldown: 3, duration: 2, effectValue: 35, unlockCost: 0 },
  { id: 'ab_preserve_touch', name: 'Preserve Touch', emoji: '🧤', category: 'artifact_lore', description: 'Handle artifacts with perfect care, eliminating curse chance for 2 turns.', levelReq: 11, cooldown: 5, duration: 2, effectValue: 100, unlockCost: 500 },
  { id: 'ab_identify', name: 'True Identify', emoji: '🔎', category: 'artifact_lore', description: 'Reveal the full lore and hidden value of any artifact in inventory.', levelReq: 19, cooldown: 4, duration: 1, effectValue: 80, unlockCost: 2000 },
  { id: 'ab_eternal_bond', name: 'Eternal Bond', emoji: '💫', category: 'artifact_lore', description: 'Permanently link to an artifact, doubling its value and XP rewards.', levelReq: 33, cooldown: 10, duration: 0, effectValue: 100, unlockCost: 7000 },
]

// ══════════════════════════════════════════════════════════════════
// TRAP TEMPLATES (10 types)
// ══════════════════════════════════════════════════════════════════

const AP_TRAP_TEMPLATES: Omit<APTrapInstance, 'disarmed' | 'triggered'>[] = [
  { id: 'trap_spike', type: 'spike_pit', name: 'Spike Pit', emoji: '🪤', description: 'A concealed pit lined with rusted iron spikes beneath loose sand.', minDamage: 12, maxDamage: 28, disarmDifficulty: 2, chamber: 'entrance_hall' },
  { id: 'trap_dart', type: 'poison_dart', name: 'Poison Dart Trap', emoji: '💉', description: 'Tiny holes in the wall shoot poisoned darts when pressure plates are triggered.', minDamage: 8, maxDamage: 22, disarmDifficulty: 3, chamber: 'scarab_passage' },
  { id: 'trap_ceiling', type: 'falling_ceiling', name: 'Falling Ceiling', emoji: '🧱', description: 'Massive stone blocks crash down from above when the tripwire is touched.', minDamage: 25, maxDamage: 50, disarmDifficulty: 4, chamber: 'pharaohs_tomb' },
  { id: 'trap_sinkhole', type: 'sand_sinkhole', name: 'Sand Sinkhole', emoji: '🕳️', description: 'The floor gives way to a deep pit of shifting sand beneath your feet.', minDamage: 10, maxDamage: 25, disarmDifficulty: 2, chamber: 'scarab_passage' },
  { id: 'trap_fire', type: 'fire_jet', name: 'Greek Fire Jet', emoji: '🔥', description: 'Ancient Greek fire ignites from floor vents in a devastating blast.', minDamage: 20, maxDamage: 42, disarmDifficulty: 5, chamber: 'treasure_vault' },
  { id: 'trap_acid', type: 'acid_pool', name: 'Corrosive Acid Pool', emoji: '☢️', description: 'A hidden pool of ancient corrosive liquid awaits the unwary traveler.', minDamage: 15, maxDamage: 35, disarmDifficulty: 4, chamber: 'anubis_shrine' },
  { id: 'trap_boulder', type: 'rolling_boulder', name: 'Rolling Boulder', emoji: '🪨', description: 'A massive stone sphere rolls down the corridor with deadly momentum.', minDamage: 22, maxDamage: 48, disarmDifficulty: 5, chamber: 'sphinx_chamber' },
  { id: 'trap_crush', type: 'crushing_walls', name: 'Crushing Walls', emoji: '🧱', description: 'The walls slowly close in with grinding, unstoppable force.', minDamage: 18, maxDamage: 40, disarmDifficulty: 6, chamber: 'hidden_catacombs' },
  { id: 'trap_scythe', type: 'scythe_blades', name: 'Scythe Blades', emoji: '⚔️', description: 'Bladed scythes swing from concealed ceiling mounts in deadly arcs.', minDamage: 16, maxDamage: 38, disarmDifficulty: 4, chamber: 'golden_sarcophagus' },
  { id: 'trap_mummy', type: 'mummy_wrap', name: 'Mummy Wraps', emoji: '🧟', description: 'Bandaged arms reach from the walls to ensnare and constrict.', minDamage: 12, maxDamage: 30, disarmDifficulty: 5, chamber: 'hidden_catacombs' },
]

// ══════════════════════════════════════════════════════════════════
// CURSE EVENTS (10)
// ══════════════════════════════════════════════════════════════════

const AP_CURSE_TEMPLATES: APCurseEvent[] = [
  { id: 'curse_sand_blindness', name: 'Curse of Sand Blindness', emoji: '🏜️', severity: 'minor', description: 'Sand fills your eyes, reducing awareness of nearby dangers.', healthPenalty: 0, coinPenalty: 0, xpPenalty: 5, durationTurns: 3, cureCost: 50, chamber: 'entrance_hall' },
  { id: 'curse_weakness', name: 'Curse of Weakness', emoji: '💀', severity: 'minor', description: 'Your muscles wither, reducing stamina recovery rate.', healthPenalty: 0, coinPenalty: 0, xpPenalty: 0, durationTurns: 4, cureCost: 60, chamber: 'scarab_passage' },
  { id: 'curse_poison', name: 'Scarab Venom', emoji: '🪲', severity: 'moderate', description: 'Toxic scarab venom courses through your veins.', healthPenalty: 15, coinPenalty: 0, xpPenalty: 10, durationTurns: 5, cureCost: 150, chamber: 'scarab_passage' },
  { id: 'curse_thief', name: 'Anubis Toll', emoji: '🐺', severity: 'moderate', description: 'The jackal god demands his tithe from your coin purse.', healthPenalty: 0, coinPenalty: 100, xpPenalty: 15, durationTurns: 0, cureCost: 0, chamber: 'anubis_shrine' },
  { id: 'curse_hallucination', name: 'Desert Mirage Curse', emoji: '🫥', severity: 'moderate', description: 'Terrifying visions distort your perception of reality.', healthPenalty: 5, coinPenalty: 50, xpPenalty: 20, durationTurns: 4, cureCost: 200, chamber: 'sphinx_chamber' },
  { id: 'curse_decay', name: 'Flesh Rot Curse', emoji: '☠️', severity: 'severe', description: 'Ancient necrotic magic causes your flesh to slowly decay.', healthPenalty: 30, coinPenalty: 0, xpPenalty: 25, durationTurns: 6, cureCost: 500, chamber: 'pharaohs_tomb' },
  { id: 'curse_silence', name: 'Silence of the Scribe', emoji: '🤫', severity: 'severe', description: 'Your voice is stolen, making puzzle solving much harder.', healthPenalty: 10, coinPenalty: 0, xpPenalty: 40, durationTurns: 5, cureCost: 400, chamber: 'sphinx_chamber' },
  { id: 'curse_shadow_bind', name: 'Shadow Bind', emoji: '👤', severity: 'severe', description: 'Dark tendrils restrict your movement and drain your energy.', healthPenalty: 20, coinPenalty: 100, xpPenalty: 30, durationTurns: 5, cureCost: 600, chamber: 'hidden_catacombs' },
  { id: 'curse_phaorohs_malady', name: "Pharaoh's Malady", emoji: '👁️', severity: 'severe', description: 'The pharaoh\'s dying curse afflicts you with wasting sickness.', healthPenalty: 40, coinPenalty: 200, xpPenalty: 50, durationTurns: 7, cureCost: 800, chamber: 'golden_sarcophagus' },
  { id: 'curse_eternal_servitude', name: 'Eternal Servitude', emoji: '⛓️', severity: 'pharaohs_wrath', description: 'The most feared curse: your soul is bound to serve the pharaoh forever.', healthPenalty: 60, coinPenalty: 500, xpPenalty: 100, durationTurns: 10, cureCost: 2000, chamber: 'golden_sarcophagus' },
]

// ══════════════════════════════════════════════════════════════════
// DAILY QUEST TEMPLATES
// ══════════════════════════════════════════════════════════════════

const AP_DAILY_QUEST_TYPES: APDailyQuest['questType'][] = [
  'explore', 'disarm', 'puzzle', 'artifact', 'excavate',
]

const AP_DAILY_QUEST_TEMPLATES = [
  { name: 'Chamber Patrol', emoji: '🚶', description: 'Explore {target} chambers', questType: 'explore' as const, target: 3, reward: { coins: 150, xp: 80, artifactChance: 0.1 } },
  { name: 'Trap Clearance', emoji: '🪤', description: 'Disarm {target} traps', questType: 'disarm' as const, target: 2, reward: { coins: 200, xp: 100, artifactChance: 0.1 } },
  { name: 'Glyph Scholar', emoji: '📝', description: 'Solve {target} hieroglyphic puzzles', questType: 'puzzle' as const, target: 2, reward: { coins: 250, xp: 120, artifactChance: 0.15 } },
  { name: 'Artifact Hunt', emoji: '🏺', description: 'Collect {target} artifacts', questType: 'artifact' as const, target: 1, reward: { coins: 300, xp: 150, artifactChance: 0.2 } },
  { name: 'Deep Excavation', emoji: '⛏️', description: 'Complete {target} full excavations', questType: 'excavate' as const, target: 2, reward: { coins: 180, xp: 90, artifactChance: 0.1 } },
]

// ══════════════════════════════════════════════════════════════════
// STATE FACTORY
// ══════════════════════════════════════════════════════════════════

function apCreateDefaultState(): AncientPyramidState {
  const tools: APExcavationTool[] = AP_TOOL_TEMPLATES.map(t => ({
    ...t,
    level: 1,
    durability: t.maxDurability,
  }))
  const abilities: APExplorerAbility[] = AP_ABILITY_TEMPLATES.map(a => ({
    ...a,
    isActive: false,
    currentCooldown: 0,
  }))
  const achievements: APAchievement[] = AP_ACHIEVEMENT_TEMPLATES.map(a => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }))
  return {
    initialized: true,
    version: 1,
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 100,
    totalCoinsEarned: 100,
    explorerName: 'Explorer',
    title: 'Novice Explorer',
    health: AP_BASE_HEALTH,
    maxHealth: AP_BASE_HEALTH,
    stamina: AP_BASE_STAMINA,
    maxStamina: AP_BASE_STAMINA,
    currentChamber: null,
    chambersVisited: [],
    chambersCleared: [],
    totalExplorations: 0,
    explorationDepth: 0,
    trapsEncountered: 0,
    trapsDisarmed: 0,
    trapsTriggered: 0,
    activeTraps: [],
    inventory: [],
    equippedArtifactIds: [],
    totalArtifactsCollected: 0,
    legendaryArtifactsFound: 0,
    artifactValueTotal: 0,
    puzzlesSolved: [],
    puzzlesAttempted: 0,
    puzzlesFailed: 0,
    currentPuzzleId: null,
    tools,
    activeToolId: tools.length > 0 ? tools[0].id : null,
    abilities,
    activeAbilityIds: [],
    activeCurses: [],
    totalCursesSuffered: 0,
    cursesCured: 0,
    achievements,
    unlockedTitleIds: [AP_TITLES[0].id],
    dailyQuest: null,
    lastDailyDate: '',
    dailyStreak: 0,
    totalDamageTaken: 0,
    totalHealing: 0,
    totalStaminaUsed: 0,
    totalCoinsSpent: 0,
    totalPuzzleXpEarned: 0,
    totalArtifactXpEarned: 0,
    eventLog: ['🏰 You stand before the ancient pyramid, its peak piercing the desert sky.'],
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
  }
}

// ══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════

function apRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function apRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function apClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function apPickRarity(): APRarityTier {
  const totalWeight = AP_RARITIES.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const rarity of AP_RARITIES) {
    roll -= rarity.weight
    if (roll <= 0) return rarity.name
  }
  return 'common'
}

function apGetRarityData(tier: APRarityTier) {
  return AP_RARITIES.find(r => r.name === tier) ?? AP_RARITIES[0]
}

function apLoadState(): AncientPyramidState {
  if (typeof window === 'undefined') return apCreateDefaultState()
  try {
    const raw = localStorage.getItem(AP_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AncientPyramidState>
      const defaults = apCreateDefaultState()
      return { ...defaults, ...parsed }
    }
  } catch {
    // corrupted save — start fresh
  }
  return apCreateDefaultState()
}

function apSaveState(state: AncientPyramidState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AP_SAVE_KEY, JSON.stringify({ ...state, lastSaveAt: Date.now() }))
  } catch {
    // storage full or unavailable
  }
}

function apGenerateDailyQuest(): APDailyQuest {
  const template = AP_DAILY_QUEST_TEMPLATES[apRandomInt(0, AP_DAILY_QUEST_TEMPLATES.length - 1)]
  const target = apRandomInt(Math.max(1, template.target - 1), template.target + 2)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  expiresAt.setHours(AP_DAILY_QUEST_RESET_HOUR, 0, 0, 0)
  return {
    id: `dq_${Date.now()}`,
    name: template.name,
    emoji: template.emoji,
    description: template.description.replace('{target}', String(target)),
    target,
    progress: 0,
    reward: { ...template.reward },
    completed: false,
    expiresAt: expiresAt.getTime(),
    questType: template.questType,
  }
}

function apGetTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// ══════════════════════════════════════════════════════════════════
// THE HOOK — useAncientPyramid
// ══════════════════════════════════════════════════════════════════

export default function useAncientPyramid() {
  const [state, setState] = useState<AncientPyramidState>(apCreateDefaultState)
  const stateRef = useRef<AncientPyramidState>(state)

  // Sync ref on every state change via useEffect
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = apLoadState()
    setState(saved)
  }, [])

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      apSaveState(stateRef.current)
    }, AP_AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ── Simple Getters ──────────────────────────────────────────

  const apGetLevel = useCallback((): number => state.level, [state])
  const apGetXp = useCallback((): number => state.xp, [state])
  const apGetTotalXp = useCallback((): number => state.totalXp, [state])
  const apGetCoins = useCallback((): number => state.coins, [state])
  const apGetHealth = useCallback((): number => state.health, [state])
  const apGetMaxHealth = useCallback((): number => state.maxHealth, [state])
  const apGetStamina = useCallback((): number => state.stamina, [state])
  const apGetMaxStamina = useCallback((): number => state.maxStamina, [state])
  const apGetTitle = useCallback((): string => state.title, [state])
  const apGetExplorerName = useCallback((): string => state.explorerName, [state])
  const apGetCurrentChamber = useCallback((): APChamberId | null => state.currentChamber, [state])
  const apGetChambersVisited = useCallback((): APChamberId[] => state.chambersVisited, [state])
  const apGetChambersCleared = useCallback((): APChamberId[] => state.chambersCleared, [state])
  const apGetTotalExplorations = useCallback((): number => state.totalExplorations, [state])
  const apGetTrapsEncountered = useCallback((): number => state.trapsEncountered, [state])
  const apGetTrapsDisarmed = useCallback((): number => state.trapsDisarmed, [state])
  const apGetActiveTraps = useCallback((): APTrapInstance[] => state.activeTraps, [state])
  const apGetInventory = useCallback((): APInventorySlot[] => state.inventory, [state])
  const apGetEquippedArtifactIds = useCallback((): string[] => state.equippedArtifactIds, [state])
  const apGetTotalArtifactsCollected = useCallback((): number => state.totalArtifactsCollected, [state])
  const apGetLegendaryArtifactsFound = useCallback((): number => state.legendaryArtifactsFound, [state])
  const apGetPuzzlesSolved = useCallback((): string[] => state.puzzlesSolved, [state])
  const apGetCurrentPuzzleId = useCallback((): string | null => state.currentPuzzleId, [state])
  const apGetTools = useCallback((): APExcavationTool[] => state.tools, [state])
  const apGetActiveToolId = useCallback((): string | null => state.activeToolId, [state])
  const apGetAbilities = useCallback((): APExplorerAbility[] => state.abilities, [state])
  const apGetActiveAbilityIds = useCallback((): string[] => state.activeAbilityIds, [state])
  const apGetActiveCurses = useCallback((): APCurseEvent[] => state.activeCurses, [state])
  const apGetAchievements = useCallback((): APAchievement[] => state.achievements, [state])
  const apGetUnlockedTitleIds = useCallback((): string[] => state.unlockedTitleIds, [state])
  const apGetDailyQuest = useCallback((): APDailyQuest | null => state.dailyQuest, [state])
  const apGetDailyStreak = useCallback((): number => state.dailyStreak, [state])
  const apGetEventLog = useCallback((): string[] => state.eventLog, [state])
  const apGetState = useCallback((): AncientPyramidState => state, [state])

  // ── Derived / Computed Values ───────────────────────────────

  const apGetXpForNextLevel = useCallback((): number => {
    if (state.level >= AP_MAX_LEVEL) return 0
    return AP_XP_TABLE[state.level]
  }, [state])

  const apGetXpProgress = useCallback((): number => {
    if (state.level >= AP_MAX_LEVEL) return 1
    const needed = AP_XP_TABLE[state.level]
    return needed > 0 ? state.xp / needed : 0
  }, [state])

  const apGetHealthPercent = useCallback((): number => {
    return state.maxHealth > 0 ? state.health / state.maxHealth : 0
  }, [state])

  const apGetStaminaPercent = useCallback((): number => {
    return state.maxStamina > 0 ? state.stamina / state.maxStamina : 0
  }, [state])

  const apGetAccessibleChambers = useCallback((): APChamber[] => {
    return AP_CHAMBERS.filter(c => c.requiredLevel <= state.level)
  }, [state])

  const apGetCurrentChamberData = useCallback((): APChamber | null => {
    if (!state.currentChamber) return null
    return AP_CHAMBERS.find(c => c.id === state.currentChamber) ?? null
  }, [state])

  const apGetArtifactsByChamber = useCallback((chamberId: APChamberId): APArtifact[] => {
    return AP_ARTIFACTS.filter(a => a.chamber === chamberId)
  }, [])

  const apGetPuzzlesByChamber = useCallback((chamberId: APChamberId): APHieroglyphicPuzzle[] => {
    return AP_PUZZLES.filter(p => p.chamber === chamberId)
  }, [])

  const apGetActiveToolData = useCallback((): APExcavationTool | null => {
    if (!state.activeToolId) return null
    return state.tools.find(t => t.id === state.activeToolId) ?? null
  }, [state])

  const apGetAvailableAbilities = useCallback((): APExplorerAbility[] => {
    return state.abilities.filter(a => a.levelReq <= state.level && a.currentCooldown <= 0)
  }, [state])

  const apGetInventoryValue = useCallback((): number => {
    let total = 0
    for (const slot of state.inventory) {
      const artifact = AP_ARTIFACTS.find(a => a.id === slot.artifactId)
      if (artifact) {
        const rarityData = apGetRarityData(artifact.rarity)
        total += Math.floor(artifact.baseValue * rarityData.coinMult * slot.quantity)
      }
    }
    return total
  }, [state])

  const apGetChamberById = useCallback((id: string): APChamber | null => {
    return AP_CHAMBERS.find(c => c.id === id) ?? null
  }, [])

  const apGetArtifactById = useCallback((id: string): APArtifact | null => {
    return AP_ARTIFACTS.find(a => a.id === id) ?? null
  }, [])

  const apGetPuzzleById = useCallback((id: string): APHieroglyphicPuzzle | null => {
    return AP_PUZZLES.find(p => p.id === id) ?? null
  }, [])

  const apGetAbilityById = useCallback((id: string): APExplorerAbility | null => {
    return state.abilities.find(a => a.id === id) ?? null
  }, [state])

  // ── Static data accessors ───────────────────────────────────

  const apGetAllChambers = useCallback((): APChamber[] => AP_CHAMBERS, [])
  const apGetAllArtifacts = useCallback((): APArtifact[] => AP_ARTIFACTS, [])
  const apGetAllPuzzles = useCallback((): APHieroglyphicPuzzle[] => AP_PUZZLES, [])
  const apGetAllTitles = useCallback((): APTitle[] => AP_TITLES, [])
  const apGetAllRarities = useCallback((): typeof AP_RARITIES => AP_RARITIES, [])
  const apGetTrapTemplates = useCallback((): Omit<APTrapInstance, 'disarmed' | 'triggered'>[] => AP_TRAP_TEMPLATES, [])
  const apGetCurseTemplates = useCallback((): APCurseEvent[] => AP_CURSE_TEMPLATES, [])

  // ── XP & Leveling ───────────────────────────────────────────

  const apAddXp = useCallback((amount: number) => {
    setState(prev => {
      let newXp = prev.xp + amount
      let newLevel = prev.level
      let newMaxHealth = prev.maxHealth
      let newMaxStamina = prev.maxStamina

      while (newLevel < AP_MAX_LEVEL && newXp >= AP_XP_TABLE[newLevel]) {
        newXp -= AP_XP_TABLE[newLevel]
        newLevel += 1
        newMaxHealth = AP_BASE_HEALTH + newLevel * AP_HEALTH_PER_LEVEL
        newMaxStamina = AP_BASE_STAMINA + newLevel * AP_STAMINA_PER_LEVEL
      }

      if (newLevel >= AP_MAX_LEVEL) {
        newXp = 0
      }

      const newUnlockedTitles = [...prev.unlockedTitleIds]
      for (const title of AP_TITLES) {
        if (newLevel >= title.levelReq && !newUnlockedTitles.includes(title.id)) {
          newUnlockedTitles.push(title.id)
        }
      }

      const highestTitle = [...AP_TITLES]
        .filter(t => newUnlockedTitles.includes(t.id))
        .sort((a, b) => b.levelReq - a.levelReq)[0]
      const newTitle = highestTitle ? highestTitle.name : prev.title

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: prev.totalXp + amount,
        maxHealth: newMaxHealth,
        maxStamina: newMaxStamina,
        health: Math.min(prev.health, newMaxHealth),
        stamina: Math.min(prev.stamina, newMaxStamina),
        unlockedTitleIds: newUnlockedTitles,
        title: newTitle,
        eventLog: [...prev.eventLog.slice(-99), `⭐ Gained ${amount} XP! (Level ${newLevel})`],
      }
    })
  }, [])

  // ── Coins ───────────────────────────────────────────────────

  const apAddCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      coins: apClamp(prev.coins + amount, 0, AP_MAX_COINS),
      totalCoinsEarned: prev.totalCoinsEarned + amount,
      eventLog: [...prev.eventLog.slice(-99), `💰 +${amount} coins`],
    }))
  }, [])

  const apSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins < amount) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - amount,
        totalCoinsSpent: prev.totalCoinsSpent + amount,
        eventLog: [...prev.eventLog.slice(-99), `💸 -${amount} coins`],
      }
    })
    return success
  }, [])

  // ── Health & Stamina ────────────────────────────────────────

  const apTakeDamage = useCallback((amount: number) => {
    setState(prev => {
      const newHealth = apClamp(prev.health - amount, 0, prev.maxHealth)
      return {
        ...prev,
        health: newHealth,
        totalDamageTaken: prev.totalDamageTaken + amount,
        eventLog: [...prev.eventLog.slice(-99), `💔 Took ${amount} damage! (HP: ${newHealth}/${prev.maxHealth})`],
      }
    })
  }, [])

  const apHeal = useCallback((amount: number) => {
    setState(prev => {
      const oldHealth = prev.health
      const newHealth = apClamp(prev.health + amount, 0, prev.maxHealth)
      const actualHeal = newHealth - oldHealth
      return {
        ...prev,
        health: newHealth,
        totalHealing: prev.totalHealing + actualHeal,
        eventLog: [...prev.eventLog.slice(-99), `💚 Healed ${actualHeal} HP! (HP: ${newHealth}/${prev.maxHealth})`],
      }
    })
  }, [])

  const apFullHeal = useCallback(() => {
    setState(prev => {
      const oldHealth = prev.health
      const actualHeal = prev.maxHealth - oldHealth
      return {
        ...prev,
        health: prev.maxHealth,
        totalHealing: prev.totalHealing + actualHeal,
        eventLog: [...prev.eventLog.slice(-99), `💚 Fully healed! (+${actualHeal} HP)`],
      }
    })
  }, [])

  const apUseStamina = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.stamina < amount) return prev
      success = true
      return {
        ...prev,
        stamina: prev.stamina - amount,
        totalStaminaUsed: prev.totalStaminaUsed + amount,
      }
    })
    return success
  }, [])

  const apRegenStamina = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      stamina: apClamp(prev.stamina + amount, 0, prev.maxStamina),
    }))
  }, [])

  const apFullStaminaRestore = useCallback(() => {
    setState(prev => ({
      ...prev,
      stamina: prev.maxStamina,
    }))
  }, [])

  // ── Chamber Navigation ──────────────────────────────────────

  const apEnterChamber = useCallback((chamberId: APChamberId) => {
    setState(prev => {
      const chamber = AP_CHAMBERS.find(c => c.id === chamberId)
      if (!chamber || prev.level < chamber.requiredLevel) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `🚫 Cannot enter ${chamber?.name ?? 'unknown'} — level requirement not met.`],
        }
      }
      const newVisited = prev.chambersVisited.includes(chamberId)
        ? prev.chambersVisited
        : [...prev.chambersVisited, chamberId]

      // Generate traps for the chamber
      const chamberTraps = AP_TRAP_TEMPLATES.filter(t => t.chamber === chamberId)
      const numTraps = chamber.trapChance > 0 ? apRandomInt(1, Math.min(3, chamberTraps.length)) : 0
      const newActiveTraps: APTrapInstance[] = []
      for (let i = 0; i < numTraps; i++) {
        const template = chamberTraps[apRandomInt(0, chamberTraps.length - 1)]
        newActiveTraps.push({ ...template, disarmed: false, triggered: false })
      }

      return {
        ...prev,
        currentChamber: chamberId,
        chambersVisited: newVisited,
        activeTraps: newActiveTraps,
        totalExplorations: prev.totalExplorations + 1,
        explorationDepth: chamber.depth,
        eventLog: [...prev.eventLog.slice(-99), `${chamber.emoji} Entered ${chamber.name} — depth ${chamber.depth}`],
      }
    })
  }, [])

  const apLeaveChamber = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChamber: null,
      activeTraps: [],
      eventLog: [...prev.eventLog.slice(-99), '🔙 Left the chamber and returned to the pyramid entrance.'],
    }))
  }, [])

  const apClearChamber = useCallback((chamberId: APChamberId) => {
    const chamber = AP_CHAMBERS.find(c => c.id === chamberId)
    if (!chamber) return
    setState(prev => {
      if (prev.chambersCleared.includes(chamberId)) return prev
      const coinReward = apRandomInt(chamber.coinRewardRange[0], chamber.coinRewardRange[1])
      const xpReward = apRandomInt(chamber.xpRewardRange[0], chamber.xpRewardRange[1])
      return {
        ...prev,
        chambersCleared: [...prev.chambersCleared, chamberId],
        coins: apClamp(prev.coins + coinReward, 0, AP_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        eventLog: [...prev.eventLog.slice(-99), `🏆 Chamber cleared: ${chamber.name}! +${coinReward}💰 +${xpReward}⭐`],
      }
    })
  }, [])

  // ── Trap System ─────────────────────────────────────────────

  const apDisarmTrap = useCallback((trapId: string): boolean => {
    let success = false
    setState(prev => {
      const trapIndex = prev.activeTraps.findIndex(t => t.id === trapId)
      if (trapIndex === -1 || prev.activeTraps[trapIndex].disarmed) return prev
      const trap = prev.activeTraps[trapIndex]
      const toolData = prev.activeToolId
        ? prev.tools.find(t => t.id === prev.activeToolId)
        : null
      const toolBonus = toolData ? toolData.precision * 20 : 0
      const roll = Math.random() * 100 + toolBonus
      if (roll < trap.disarmDifficulty * 15) {
        // Failed disarm — trap triggers
        const damage = apRandomInt(trap.minDamage, trap.maxDamage)
        success = false
        const newTraps = [...prev.activeTraps]
        newTraps[trapIndex] = { ...trap, triggered: true }
        return {
          ...prev,
          activeTraps: newTraps,
          health: apClamp(prev.health - damage, 0, prev.maxHealth),
          trapsTriggered: prev.trapsTriggered + 1,
          trapsEncountered: prev.trapsEncountered + 1,
          totalDamageTaken: prev.totalDamageTaken + damage,
          eventLog: [...prev.eventLog.slice(-99), `💥 Failed to disarm ${trap.name}! Took ${damage} damage!`],
        }
      }
      success = true
      const newTraps = [...prev.activeTraps]
      newTraps[trapIndex] = { ...trap, disarmed: true }
      return {
        ...prev,
        activeTraps: newTraps,
        trapsDisarmed: prev.trapsDisarmed + 1,
        trapsEncountered: prev.trapsEncountered + 1,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Successfully disarmed ${trap.name}!`],
      }
    })
    return success
  }, [])

  const apTriggerRandomTrap = useCallback((): APTrapInstance | null => {
    let triggered: APTrapInstance | null = null
    setState(prev => {
      const undisarmed = prev.activeTraps.filter(t => !t.disarmed && !t.triggered)
      if (undisarmed.length === 0) return prev
      const trap = undisarmed[apRandomInt(0, undisarmed.length - 1)]
      const damage = apRandomInt(trap.minDamage, trap.maxDamage)
      triggered = { ...trap, triggered: true }
      const newTraps = prev.activeTraps.map(t =>
        t.id === trap.id ? { ...t, triggered: true } : t
      )
      return {
        ...prev,
        activeTraps: newTraps,
        health: apClamp(prev.health - damage, 0, prev.maxHealth),
        trapsTriggered: prev.trapsTriggered + 1,
        trapsEncountered: prev.trapsEncountered + 1,
        totalDamageTaken: prev.totalDamageTaken + damage,
        eventLog: [...prev.eventLog.slice(-99), `💥 ${trap.name} triggered! Took ${damage} damage!`],
      }
    })
    return triggered
  }, [])

  // ── Artifact Collection ─────────────────────────────────────

  const apCollectArtifact = useCallback((artifactId: string): boolean => {
    let collected = false
    setState(prev => {
      const artifact = AP_ARTIFACTS.find(a => a.id === artifactId)
      if (!artifact) return prev
      if (prev.inventory.length >= AP_MAX_INVENTORY_SIZE) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `🎒 Inventory full! Cannot collect ${artifact.name}.`],
        }
      }

      const existingSlot = prev.inventory.find(s => s.artifactId === artifactId)
      const rarityData = apGetRarityData(artifact.rarity)
      const xpReward = Math.floor(artifact.xpReward * rarityData.xpMult)

      // Check for curse
      const curseRoll = Math.random()
      let newCurses = prev.activeCurses
      let newCurseLog = ''
      if (curseRoll < artifact.curseChance) {
        const curse = AP_CURSE_TEMPLATES[apRandomInt(0, AP_CURSE_TEMPLATES.length - 1)]
        newCurses = [...prev.activeCurses, { ...curse }]
        newCurseLog = ` | ⚠️ CURSED: ${curse.name}!`
      }

      let newInventory: APInventorySlot[]
      if (existingSlot) {
        newInventory = prev.inventory.map(s =>
          s.artifactId === artifactId
            ? { ...s, quantity: s.quantity + 1, acquiredAt: Date.now() }
            : s
        )
      } else {
        newInventory = [
          ...prev.inventory,
          { artifactId, acquiredAt: Date.now(), equipped: false, quantity: 1 },
        ]
      }

      collected = true
      const isLegendary = artifact.rarity === 'legendary'

      return {
        ...prev,
        inventory: newInventory,
        totalArtifactsCollected: prev.totalArtifactsCollected + 1,
        legendaryArtifactsFound: isLegendary ? prev.legendaryArtifactsFound + 1 : prev.legendaryArtifactsFound,
        artifactValueTotal: prev.artifactValueTotal + artifact.baseValue,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        totalArtifactXpEarned: prev.totalArtifactXpEarned + xpReward,
        activeCurses: newCurses,
        totalCursesSuffered: newCurses.length > prev.activeCurses.length ? prev.totalCursesSuffered + 1 : prev.totalCursesSuffered,
        eventLog: [
          ...prev.eventLog.slice(-99),
          `${artifact.emoji} Found ${artifact.name} (${rarityData.name})! +${xpReward} XP${newCurseLog}`,
        ],
      }
    })
    return collected
  }, [])

  const apEquipArtifact = useCallback((artifactId: string) => {
    setState(prev => {
      const slot = prev.inventory.find(s => s.artifactId === artifactId)
      if (!slot || slot.equipped) return prev
      const newInventory = prev.inventory.map(s =>
        s.artifactId === artifactId ? { ...s, equipped: true } : s
      )
      const newEquipped = prev.equippedArtifactIds.includes(artifactId)
        ? prev.equippedArtifactIds
        : [...prev.equippedArtifactIds, artifactId]
      return {
        ...prev,
        inventory: newInventory,
        equippedArtifactIds: newEquipped,
        eventLog: [...prev.eventLog.slice(-99), `✨ Equipped: ${AP_ARTIFACTS.find(a => a.id === artifactId)?.name ?? artifactId}`],
      }
    })
  }, [])

  const apUnequipArtifact = useCallback((artifactId: string) => {
    setState(prev => {
      const newInventory = prev.inventory.map(s =>
        s.artifactId === artifactId ? { ...s, equipped: false } : s
      )
      return {
        ...prev,
        inventory: newInventory,
        equippedArtifactIds: prev.equippedArtifactIds.filter(id => id !== artifactId),
      }
    })
  }, [])

  // ── Puzzle Solving ──────────────────────────────────────────

  const apStartPuzzle = useCallback((puzzleId: string): boolean => {
    let started = false
    setState(prev => {
      if (prev.puzzlesSolved.includes(puzzleId)) return prev
      const puzzle = AP_PUZZLES.find(p => p.id === puzzleId)
      if (!puzzle || !prev.currentChamber) return prev
      if (puzzle.chamber !== prev.currentChamber && puzzle.chamber !== prev.currentChamber) return prev
      started = true
      return {
        ...prev,
        currentPuzzleId: puzzleId,
        puzzlesAttempted: prev.puzzlesAttempted + 1,
        eventLog: [...prev.eventLog.slice(-99), `${puzzle.emoji} Puzzle started: ${puzzle.name}`],
      }
    })
    return started
  }, [])

  const apSolvePuzzle = useCallback((puzzleId: string, answer: string): boolean => {
    let correct = false
    setState(prev => {
      const puzzle = AP_PUZZLES.find(p => p.id === puzzleId)
      if (!puzzle) return prev
      const isCorrect = answer.trim().toLowerCase() === puzzle.answer.toLowerCase()

      if (isCorrect) {
        const toolData = prev.activeToolId
          ? prev.tools.find(t => t.id === prev.activeToolId)
          : null
        const toolBonus = toolData?.category === 'translation' ? Math.floor(puzzle.xpReward * toolData.efficiency * 0.5) : 0
        const totalXpReward = puzzle.xpReward + toolBonus
        correct = true

        return {
          ...prev,
          currentPuzzleId: null,
          puzzlesSolved: [...prev.puzzlesSolved, puzzleId],
          coins: apClamp(prev.coins + puzzle.coinReward, 0, AP_MAX_COINS),
          totalCoinsEarned: prev.totalCoinsEarned + puzzle.coinReward,
          xp: prev.xp + totalXpReward,
          totalXp: prev.totalXp + totalXpReward,
          totalPuzzleXpEarned: prev.totalPuzzleXpEarned + totalXpReward,
          eventLog: [
            ...prev.eventLog.slice(-99),
            `✅ Correct! Solved "${puzzle.name}" — +${totalXpReward} XP, +${puzzle.coinReward}💰`,
          ],
        }
      }

      return {
        ...prev,
        currentPuzzleId: null,
        puzzlesFailed: prev.puzzlesFailed + 1,
        eventLog: [...prev.eventLog.slice(-99), `❌ Wrong answer for "${puzzle.name}". The correct answer was: ${puzzle.answer}`],
      }
    })
    return correct
  }, [])

  const apCancelPuzzle = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPuzzleId: null,
      eventLog: [...prev.eventLog.slice(-99), '❌ Puzzle cancelled.'],
    }))
  }, [])

  // ── Curse System ────────────────────────────────────────────

  const apCureCurse = useCallback((curseId: string): boolean => {
    let cured = false
    setState(prev => {
      const curse = prev.activeCurses.find(c => c.id === curseId)
      if (!curse) return prev
      if (prev.coins < curse.cureCost) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `💸 Not enough coins to cure ${curse.name}. Need ${curse.cureCost}💰`],
        }
      }
      cured = true
      return {
        ...prev,
        activeCurses: prev.activeCurses.filter(c => c.id !== curseId),
        coins: prev.coins - curse.cureCost,
        totalCoinsSpent: prev.totalCoinsSpent + curse.cureCost,
        cursesCured: prev.cursesCured + 1,
        eventLog: [...prev.eventLog.slice(-99), `✨ Cured: ${curse.name}! (-${curse.cureCost}💰)`],
      }
    })
    return cured
  }, [])

  const apTickCurses = useCallback(() => {
    setState(prev => {
      if (prev.activeCurses.length === 0) return prev
      const remaining = prev.activeCurses
        .map(c => ({ ...c, durationTurns: c.durationTurns - 1 }))
        .filter(c => c.durationTurns > 0 || c.coinPenalty > 0 || c.healthPenalty > 0)

      const healthLoss = remaining.reduce((sum, c) => sum + c.healthPenalty, 0)
      const xpLoss = remaining.reduce((sum, c) => sum + c.xpPenalty, 0)

      return {
        ...prev,
        activeCurses: remaining.filter(c => c.durationTurns > 0),
        health: apClamp(prev.health - healthLoss, 0, prev.maxHealth),
        totalDamageTaken: prev.totalDamageTaken + healthLoss,
        xp: Math.max(0, prev.xp - xpLoss),
        totalXp: Math.max(0, prev.totalXp - xpLoss),
      }
    })
  }, [])

  // ── Tool Management ─────────────────────────────────────────

  const apSetActiveTool = useCallback((toolId: string) => {
    setState(prev => ({
      ...prev,
      activeToolId: toolId,
    }))
  }, [])

  const apUpgradeTool = useCallback((toolId: string): boolean => {
    let upgraded = false
    setState(prev => {
      const toolIndex = prev.tools.findIndex(t => t.id === toolId)
      if (toolIndex === -1) return prev
      const tool = prev.tools[toolIndex]
      if (tool.level >= tool.maxLevel) return prev
      if (prev.coins < tool.upgradeCost) return prev
      upgraded = true
      const newTools = [...prev.tools]
      newTools[toolIndex] = {
        ...tool,
        level: tool.level + 1,
        efficiency: Math.min(1, tool.efficiency + 0.1),
        precision: Math.min(1, tool.precision + 0.05),
        maxDurability: Math.floor(tool.maxDurability * 1.15),
        upgradeCost: Math.floor(tool.upgradeCost * 1.5),
        repairCost: Math.floor(tool.repairCost * 1.2),
      }
      return {
        ...prev,
        tools: newTools,
        coins: prev.coins - tool.upgradeCost,
        totalCoinsSpent: prev.totalCoinsSpent + tool.upgradeCost,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Upgraded ${tool.name} to level ${tool.level + 1}!`],
      }
    })
    return upgraded
  }, [])

  const apRepairTool = useCallback((toolId: string): boolean => {
    let repaired = false
    setState(prev => {
      const toolIndex = prev.tools.findIndex(t => t.id === toolId)
      if (toolIndex === -1) return prev
      const tool = prev.tools[toolIndex]
      const missingDurability = tool.maxDurability - tool.durability
      if (missingDurability <= 0) return prev
      const cost = Math.max(1, Math.floor(tool.repairCost * AP_TOOL_REPAIR_MULT * (missingDurability / tool.maxDurability)))
      if (prev.coins < cost) return prev
      repaired = true
      const newTools = [...prev.tools]
      newTools[toolIndex] = { ...tool, durability: tool.maxDurability }
      return {
        ...prev,
        tools: newTools,
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Repaired ${tool.name}! (-${cost}💰)`],
      }
    })
    return repaired
  }, [])

  const apUseToolDurability = useCallback((toolId: string, amount: number) => {
    setState(prev => {
      const newTools = prev.tools.map(t =>
        t.id === toolId ? { ...t, durability: Math.max(0, t.durability - amount) } : t
      )
      return { ...prev, tools: newTools }
    })
  }, [])

  // ── Ability System ──────────────────────────────────────────

  const apActivateAbility = useCallback((abilityId: string): boolean => {
    let activated = false
    setState(prev => {
      const ability = prev.abilities.find(a => a.id === abilityId)
      if (!ability) return prev
      if (prev.level < ability.levelReq) return prev
      if (ability.currentCooldown > 0) return prev
      activated = true
      const newAbilities = prev.abilities.map(a =>
        a.id === abilityId ? { ...a, isActive: true, currentCooldown: a.cooldown } : a
      )
      const newActiveIds = prev.activeAbilityIds.includes(abilityId)
        ? prev.activeAbilityIds
        : [...prev.activeAbilityIds, abilityId]
      return {
        ...prev,
        abilities: newAbilities,
        activeAbilityIds: newActiveIds,
        eventLog: [...prev.eventLog.slice(-99), `${ability.emoji} Activated: ${ability.name}!`],
      }
    })
    return activated
  }, [])

  const apTickAbilities = useCallback(() => {
    setState(prev => {
      const newAbilities = prev.abilities.map(a => {
        if (a.isActive && a.duration > 0) {
          const remaining = a.duration - 1
          if (remaining <= 0) {
            return { ...a, isActive: false }
          }
          return { ...a, duration: remaining }
        }
        if (a.currentCooldown > 0) {
          return { ...a, currentCooldown: a.currentCooldown - 1 }
        }
        return a
      })
      const newActiveIds = newAbilities
        .filter(a => a.isActive)
        .map(a => a.id)
      return { ...prev, abilities: newAbilities, activeAbilityIds: newActiveIds }
    })
  }, [])

  const apDeactivateAbility = useCallback((abilityId: string) => {
    setState(prev => {
      const newAbilities = prev.abilities.map(a =>
        a.id === abilityId ? { ...a, isActive: false } : a
      )
      return {
        ...prev,
        abilities: newAbilities,
        activeAbilityIds: prev.activeAbilityIds.filter(id => id !== abilityId),
      }
    })
  }, [])

  // ── Achievement Checking ────────────────────────────────────

  const apCheckAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements = [...prev.achievements]
      let changed = false

      const checkCondition = (condition: string): boolean => {
        switch (condition) {
          case 'enter_pyramid': return prev.totalExplorations >= 1
          case 'collect_1_artifact': return prev.totalArtifactsCollected >= 1
          case 'collect_10_artifacts': return prev.totalArtifactsCollected >= 10
          case 'collect_25_artifacts': return prev.totalArtifactsCollected >= 25
          case 'solve_1_puzzle': return prev.puzzlesSolved.length >= 1
          case 'solve_10_puzzles': return prev.puzzlesSolved.length >= 10
          case 'disarm_1_trap': return prev.trapsDisarmed >= 1
          case 'disarm_20_traps': return prev.trapsDisarmed >= 20
          case 'survive_1_curse': return prev.cursesCured >= 1
          case 'cure_5_curses': return prev.cursesCured >= 5
          case 'find_legendary': return prev.legendaryArtifactsFound >= 1
          case 'clear_1_chamber': return prev.chambersCleared.length >= 1
          case 'clear_all_chambers': return prev.chambersCleared.length >= AP_CHAMBERS.length
          case 'reach_level_10': return prev.level >= 10
          case 'reach_level_25': return prev.level >= 25
          case 'reach_level_50': return prev.level >= 50
          case 'earn_10k_coins': return prev.totalCoinsEarned >= 10000
          case 'daily_streak_7': return prev.dailyStreak >= 7
          default: return false
        }
      }

      for (let i = 0; i < newAchievements.length; i++) {
        const achievement = newAchievements[i]
        if (!achievement.unlocked && checkCondition(achievement.condition)) {
          newAchievements[i] = { ...achievement, unlocked: true, unlockedAt: Date.now() }
          changed = true
        }
      }

      if (!changed) return prev

      const newlyUnlocked = newAchievements.filter(
        (a, i) => a.unlocked && !prev.achievements[i].unlocked
      )

      const logEntries = newlyUnlocked.map(
        a => `🏆 Achievement unlocked: ${a.emoji} ${a.name}! +${a.reward.coins}💰 +${a.reward.xp}⭐`
      )

      const totalRewardCoins = newlyUnlocked.reduce((sum, a) => sum + a.reward.coins, 0)
      const totalRewardXp = newlyUnlocked.reduce((sum, a) => sum + a.reward.xp, 0)

      return {
        ...prev,
        achievements: newAchievements,
        coins: apClamp(prev.coins + totalRewardCoins, 0, AP_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + totalRewardCoins,
        xp: prev.xp + totalRewardXp,
        totalXp: prev.totalXp + totalRewardXp,
        eventLog: [...prev.eventLog.slice(-(100 - logEntries.length)), ...logEntries],
      }
    })
  }, [])

  // ── Daily Quest System ──────────────────────────────────────

  const apCheckDailyQuest = useCallback(() => {
    const today = apGetTodayString()
    if (state.lastDailyDate === today) return

    setState(prev => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const streakContinuation = prev.lastDailyDate === yesterdayStr
      const newStreak = streakContinuation ? prev.dailyStreak + 1 : 1

      return {
        ...prev,
        dailyQuest: apGenerateDailyQuest(),
        lastDailyDate: today,
        dailyStreak: newStreak,
        eventLog: [
          ...prev.eventLog.slice(-99),
          `📋 New daily quest! (Day streak: ${newStreak}🔥)`,
        ],
      }
    })
  }, [state])

  const apAdvanceDailyQuest = useCallback((questType: APDailyQuest['questType'], amount: number = 1) => {
    setState(prev => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev
      if (prev.dailyQuest.questType !== questType) return prev
      const newProgress = Math.min(prev.dailyQuest.progress + amount, prev.dailyQuest.target)
      const completed = newProgress >= prev.dailyQuest.target
      const updatedQuest = { ...prev.dailyQuest, progress: newProgress, completed }

      if (completed) {
        return {
          ...prev,
          dailyQuest: updatedQuest,
          coins: apClamp(prev.coins + updatedQuest.reward.coins, 0, AP_MAX_COINS),
          totalCoinsEarned: prev.totalCoinsEarned + updatedQuest.reward.coins,
          xp: prev.xp + updatedQuest.reward.xp,
          totalXp: prev.totalXp + updatedQuest.reward.xp,
          eventLog: [
            ...prev.eventLog.slice(-99),
            `📋 Daily quest completed: ${updatedQuest.name}! +${updatedQuest.reward.coins}💰 +${updatedQuest.reward.xp}⭐`,
          ],
        }
      }

      return {
        ...prev,
        dailyQuest: updatedQuest,
      }
    })
  }, [])

  // ── Explorer Name ───────────────────────────────────────────

  const apSetExplorerName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      explorerName: name,
      eventLog: [...prev.eventLog.slice(-99), `📛 Explorer renamed to: ${name}`],
    }))
  }, [])

  // ── Title Selection ─────────────────────────────────────────

  const apSetTitle = useCallback((titleId: string) => {
    setState(prev => {
      if (!prev.unlockedTitleIds.includes(titleId)) return prev
      const title = AP_TITLES.find(t => t.id === titleId)
      if (!title) return prev
      return {
        ...prev,
        title: title.name,
        eventLog: [...prev.eventLog.slice(-99), `${title.emoji} Title changed to: ${title.name}`],
      }
    })
  }, [])

  // ── Random Artifact Discovery ───────────────────────────────

  const apDiscoverRandomArtifact = useCallback((): APArtifact | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AP_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    if (Math.random() > chamberData.artifactChance) return null

    const chamberArtifacts = AP_ARTIFACTS.filter(a => a.chamber === chamber)
    if (chamberArtifacts.length === 0) return null

    // Weighted rarity selection
    const rarity = apPickRarity()
    const matchingArtifacts = chamberArtifacts.filter(a => a.rarity === rarity)
    const pool = matchingArtifacts.length > 0 ? matchingArtifacts : chamberArtifacts
    const selected = pool[apRandomInt(0, pool.length - 1)]

    apCollectArtifact(selected.id)
    apCheckAchievements()

    return selected
  }, [state, apCollectArtifact, apCheckAchievements])

  // ── Random Puzzle Generation ────────────────────────────────

  const apGetRandomPuzzleForChamber = useCallback((): APHieroglyphicPuzzle | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AP_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    if (Math.random() > chamberData.puzzleChance) return null

    const available = AP_PUZZLES.filter(
      p => p.chamber === chamber && !state.puzzlesSolved.includes(p.id)
    )
    if (available.length === 0) return null

    return available[apRandomInt(0, available.length - 1)]
  }, [state])

  // ── Random Curse Event ──────────────────────────────────────

  const apCheckForCurseEvent = useCallback((): APCurseEvent | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AP_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    // Check if curse immunity is active
    if (state.activeAbilityIds.includes('ab_curse_immunity')) return null

    if (Math.random() > chamberData.curseChance) return null

    const cursePool = AP_CURSE_TEMPLATES.filter(c => c.chamber === chamber)
    if (cursePool.length === 0) return null

    const curse = cursePool[apRandomInt(0, cursePool.length - 1)]
    setState(prev => ({
      ...prev,
      activeCurses: [...prev.activeCurses, { ...curse }],
      totalCursesSuffered: prev.totalCursesSuffered + 1,
      coins: Math.max(0, prev.coins - curse.coinPenalty),
      health: apClamp(prev.health - curse.healthPenalty, 0, prev.maxHealth),
      xp: Math.max(0, prev.xp - curse.xpPenalty),
      totalDamageTaken: prev.totalDamageTaken + curse.healthPenalty,
      eventLog: [...prev.eventLog.slice(-99), `⚠️ CURSED: ${curse.name}! ${curse.description}`],
    }))
    return curse
  }, [state])

  // ── Full Exploration Turn ───────────────────────────────────

  const apPerformExploration = useCallback((): void => {
    if (!stateRef.current.currentChamber) return
    if (stateRef.current.stamina < 5) return

    setState(prev => {
      if (!prev.currentChamber || prev.stamina < 5) return prev

      const chamberData = AP_CHAMBERS.find(c => c.id === prev.currentChamber)
      if (!chamberData) return prev

      const staminaCost = 5
      const coinReward = apRandomInt(chamberData.coinRewardRange[0], chamberData.coinRewardRange[1])
      const xpReward = apRandomInt(chamberData.xpRewardRange[0], chamberData.xpRewardRange[1])

      return {
        ...prev,
        stamina: prev.stamina - staminaCost,
        totalStaminaUsed: prev.totalStaminaUsed + staminaCost,
        coins: apClamp(prev.coins + coinReward, 0, AP_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coinReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        eventLog: [...prev.eventLog.slice(-99), `🚶 Explored ${chamberData.name} — +${coinReward}💰 +${xpReward}⭐ (stamina: ${prev.stamina - staminaCost}/${prev.maxStamina})`],
      }
    })

    // Random encounters happen after exploration
    apDiscoverRandomArtifact()
    apCheckForCurseEvent()
    apCheckAchievements()
  }, [apDiscoverRandomArtifact, apCheckForCurseEvent, apCheckAchievements])

  // ── Save / Load / Reset ─────────────────────────────────────

  const apSave = useCallback(() => {
    apSaveState(stateRef.current)
  }, [])

  const apReset = useCallback(() => {
    setState(apCreateDefaultState())
  }, [])

  // ── Memoized constant lookups ───────────────────────────────

  const apChamberList = useMemo((): APChamber[] => AP_CHAMBERS, [])
  const apArtifactList = useMemo((): APArtifact[] => AP_ARTIFACTS, [])
  const apPuzzleList = useMemo((): APHieroglyphicPuzzle[] => AP_PUZZLES, [])
  const apTitleList = useMemo((): APTitle[] => AP_TITLES, [])
  const apRarityList = useMemo((): typeof AP_RARITIES => AP_RARITIES, [])

  // ── Return everything ───────────────────────────────────────

  return {
    // State
    state,
    // Getters
    apGetLevel,
    apGetXp,
    apGetTotalXp,
    apGetCoins,
    apGetHealth,
    apGetMaxHealth,
    apGetStamina,
    apGetMaxStamina,
    apGetTitle,
    apGetExplorerName,
    apGetCurrentChamber,
    apGetChambersVisited,
    apGetChambersCleared,
    apGetTotalExplorations,
    apGetTrapsEncountered,
    apGetTrapsDisarmed,
    apGetActiveTraps,
    apGetInventory,
    apGetEquippedArtifactIds,
    apGetTotalArtifactsCollected,
    apGetLegendaryArtifactsFound,
    apGetPuzzlesSolved,
    apGetCurrentPuzzleId,
    apGetTools,
    apGetActiveToolId,
    apGetAbilities,
    apGetActiveAbilityIds,
    apGetActiveCurses,
    apGetAchievements,
    apGetUnlockedTitleIds,
    apGetDailyQuest,
    apGetDailyStreak,
    apGetEventLog,
    apGetState,
    // Computed
    apGetXpForNextLevel,
    apGetXpProgress,
    apGetHealthPercent,
    apGetStaminaPercent,
    apGetAccessibleChambers,
    apGetCurrentChamberData,
    apGetArtifactsByChamber,
    apGetPuzzlesByChamber,
    apGetActiveToolData,
    apGetAvailableAbilities,
    apGetInventoryValue,
    apGetChamberById,
    apGetArtifactById,
    apGetPuzzleById,
    apGetAbilityById,
    // Static data
    apGetAllChambers,
    apGetAllArtifacts,
    apGetAllPuzzles,
    apGetAllTitles,
    apGetAllRarities,
    apGetTrapTemplates,
    apGetCurseTemplates,
    // Memoized lists
    apChamberList,
    apArtifactList,
    apPuzzleList,
    apTitleList,
    apRarityList,
    // Actions
    apAddXp,
    apAddCoins,
    apSpendCoins,
    apTakeDamage,
    apHeal,
    apFullHeal,
    apUseStamina,
    apRegenStamina,
    apFullStaminaRestore,
    apEnterChamber,
    apLeaveChamber,
    apClearChamber,
    apDisarmTrap,
    apTriggerRandomTrap,
    apCollectArtifact,
    apEquipArtifact,
    apUnequipArtifact,
    apStartPuzzle,
    apSolvePuzzle,
    apCancelPuzzle,
    apCureCurse,
    apTickCurses,
    apSetActiveTool,
    apUpgradeTool,
    apRepairTool,
    apUseToolDurability,
    apActivateAbility,
    apTickAbilities,
    apDeactivateAbility,
    apCheckAchievements,
    apCheckDailyQuest,
    apAdvanceDailyQuest,
    apSetExplorerName,
    apSetTitle,
    apDiscoverRandomArtifact,
    apGetRandomPuzzleForChamber,
    apCheckForCurseEvent,
    apPerformExploration,
    apSave,
    apReset,
  }
}
