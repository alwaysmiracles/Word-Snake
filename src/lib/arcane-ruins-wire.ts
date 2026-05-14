'use client'
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'

// ══════════════════════════════════════════════════════════════════
// TYPE DEFINITIONS
// ══════════════════════════════════════════════════════════════════

export type ARRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type ARChamberId =
  | 'crumbled_gate'
  | 'whispering_corridor'
  | 'golem_forge'
  | 'spell_vault'
  | 'crystal_sanctum'
  | 'shadow_catacombs'
  | 'rune_amphitheater'
  | 'elders_nexus'

export type ARCorruptionSeverity = 'minor' | 'moderate' | 'severe' | 'void_taint'

export type ARGolemType =
  | 'stone_guardian'
  | 'clay_sentinel'
  | 'iron_warden'
  | 'obsidian_beast'
  | 'crystal_phalanx'
  | 'shadow_construct'
  | 'ember_colossus'
  | 'void_gargoyle'
  | 'rune_golem'
  | 'ancient_titan'

export type ARStructureCategory =
  | 'research'
  | 'golem_control'
  | 'rune_decoding'
  | 'mana_channeling'
  | 'exploration'
  | 'warding'

export type ARFragmentType =
  | 'translation'
  | 'sequence'
  | 'cipher'
  | 'riddle'
  | 'pattern'
  | 'anagram'

export type ARAbilityCategory =
  | 'combat'
  | 'exploration'
  | 'spell_research'
  | 'golem_control'
  | 'arcane_lore'

export interface ARConstruct {
  id: string
  name: string
  emoji: string
  rarity: ARRarityTier
  description: string
  era: string
  baseValue: number
  xpReward: number
  chamber: ARChamberId
  corruptionChance: number
}

export interface ARChamber {
  id: ARChamberId
  name: string
  emoji: string
  description: string
  depth: number
  dangerLevel: number
  requiredLevel: number
  golemChance: number
  constructChance: number
  fragmentChance: number
  corruptionChance: number
  shardRewardRange: [number, number]
  xpRewardRange: [number, number]
  bgTint: string
}

export interface ARSpellFragment {
  id: string
  name: string
  emoji: string
  type: ARFragmentType
  difficulty: number
  description: string
  hintText: string
  answer: string
  xpReward: number
  shardReward: number
  chamber: ARChamberId
}

export interface ARStructure {
  id: string
  name: string
  emoji: string
  category: ARStructureCategory
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

export interface ARArcaneAbility {
  id: string
  name: string
  emoji: string
  category: ARAbilityCategory
  description: string
  levelReq: number
  cooldown: number
  duration: number
  effectValue: number
  isActive: boolean
  currentCooldown: number
  unlockCost: number
}

export interface ARAchievement {
  id: string
  name: string
  emoji: string
  description: string
  reward: { shards: number; xp: number }
  unlocked: boolean
  unlockedAt: number | null
  condition: string
}

export interface ARTitle {
  id: string
  name: string
  emoji: string
  levelReq: number
  description: string
}

export interface ARCorruptionEvent {
  id: string
  name: string
  emoji: string
  severity: ARCorruptionSeverity
  description: string
  vitalityPenalty: number
  shardPenalty: number
  xpPenalty: number
  durationTurns: number
  purifyCost: number
  chamber: ARChamberId
}

export interface ARGolemInstance {
  id: string
  type: ARGolemType
  name: string
  emoji: string
  description: string
  minDamage: number
  maxDamage: number
  deactivateDifficulty: number
  deactivated: boolean
  triggered: boolean
  chamber: ARChamberId
}

export interface ARDailyQuest {
  id: string
  name: string
  emoji: string
  description: string
  target: number
  progress: number
  reward: { shards: number; xp: number; constructChance: number }
  completed: boolean
  expiresAt: number
  questType: 'explore' | 'deactivate' | 'decode' | 'construct' | 'research'
}

export interface ARInventorySlot {
  constructId: string
  acquiredAt: number
  equipped: boolean
  quantity: number
}

export interface ArcaneRuinsState {
  initialized: boolean
  version: number
  // Player progression
  level: number
  xp: number
  totalXp: number
  shards: number
  totalShardsEarned: number
  arcanistName: string
  title: string
  // Vitality & mana
  vitality: number
  maxVitality: number
  mana: number
  maxMana: number
  // Exploration
  currentChamber: ARChamberId | null
  chambersVisited: ARChamberId[]
  chambersCleared: ARChamberId[]
  totalExplorations: number
  explorationDepth: number
  // Golems
  golemsEncountered: number
  golemsDeactivated: number
  golemsTriggered: number
  activeGolems: ARGolemInstance[]
  // Constructs
  inventory: ARInventorySlot[]
  equippedConstructIds: string[]
  totalConstructsCollected: number
  legendaryConstructsFound: number
  constructValueTotal: number
  // Spell fragments
  fragmentsDecoded: string[]
  fragmentsAttempted: number
  fragmentsFailed: number
  currentFragmentId: string | null
  // Structures
  structures: ARStructure[]
  activeStructureId: string | null
  // Abilities
  abilities: ARArcaneAbility[]
  activeAbilityIds: string[]
  // Corruption
  activeCorruptions: ARCorruptionEvent[]
  totalCorruptionsSuffered: number
  corruptionsPurified: number
  // Achievements & titles
  achievements: ARAchievement[]
  unlockedTitleIds: string[]
  // Daily quest
  dailyQuest: ARDailyQuest | null
  lastDailyDate: string
  dailyStreak: number
  // Stats
  totalDamageTaken: number
  totalHealing: number
  totalManaUsed: number
  totalShardsSpent: number
  totalFragmentXpEarned: number
  totalConstructXpEarned: number
  // Log
  eventLog: string[]
  createdAt: number
  lastSaveAt: number
}

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — RARITY TIERS
// ══════════════════════════════════════════════════════════════════

const AR_RARITY_COMMON = {
  name: 'common' as const,
  color: '#78716c',
  weight: 45,
  xpMult: 1,
  shardMult: 1,
  emoji: '🪨',
}
const AR_RARITY_UNCOMMON = {
  name: 'uncommon' as const,
  color: '#2dd4bf',
  weight: 28,
  xpMult: 1.5,
  shardMult: 1.5,
  emoji: '🔮',
}
const AR_RARITY_RARE = {
  name: 'rare' as const,
  color: '#8b5cf6',
  weight: 16,
  xpMult: 2.5,
  shardMult: 2.5,
  emoji: '💎',
}
const AR_RARITY_EPIC = {
  name: 'epic' as const,
  color: '#f97316',
  weight: 8,
  xpMult: 4,
  shardMult: 4,
  emoji: '🔥',
}
const AR_RARITY_LEGENDARY = {
  name: 'legendary' as const,
  color: '#fbbf24',
  weight: 3,
  xpMult: 8,
  shardMult: 8,
  emoji: '✨',
}

const AR_RARITIES = [
  AR_RARITY_COMMON,
  AR_RARITY_UNCOMMON,
  AR_RARITY_RARE,
  AR_RARITY_EPIC,
  AR_RARITY_LEGENDARY,
]

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — XP TABLE (Level 1-50)
// ══════════════════════════════════════════════════════════════════

const AR_XP_TABLE: number[] = [
  0, 130, 300, 540, 840, 1200, 1620, 2100, 2640, 3240,
  3900, 4620, 5400, 6240, 7140, 8100, 9120, 10200, 11340, 12540,
  13800, 15120, 16500, 17940, 19440, 21000, 22620, 24300, 26040, 27840,
  29700, 31620, 33600, 35640, 37740, 39900, 42120, 44400, 46740, 49140,
  51600, 54120, 56700, 59340, 62040, 64800, 67620, 70500, 73440, 76440,
]

// ══════════════════════════════════════════════════════════════════
// CONSTANTS — GENERAL
// ══════════════════════════════════════════════════════════════════

const AR_MAX_LEVEL = 50
const AR_BASE_VITALITY = 100
const AR_VITALITY_PER_LEVEL = 10
const AR_BASE_MANA = 60
const AR_MANA_PER_LEVEL = 6
const AR_MANA_REGEN_RATE = 3
const AR_EXPLORATION_COOLDOWN_MS = 2000
const AR_MAX_INVENTORY_SIZE = 60
const AR_MAX_SHARDS = 9999999
const AR_SAVE_KEY = 'arcane-ruins-save'
const AR_AUTO_SAVE_INTERVAL_MS = 20000
const AR_DAILY_QUEST_RESET_HOUR = 4
const AR_CORRUPTION_BASE_DURATION = 5
const AR_STRUCTURE_REPAIR_MULT = 0.3

// ══════════════════════════════════════════════════════════════════
// TITLES (8: Novice Wanderer → Elder Archon)
// ══════════════════════════════════════════════════════════════════

const AR_TITLES: ARTitle[] = [
  { id: 'novice_wanderer', name: 'Novice Wanderer', emoji: '🧭', levelReq: 1, description: 'A curious soul drawn to the whispering ruins' },
  { id: 'rune_scratcher', name: 'Rune Scratcher', emoji: '✍️', levelReq: 5, description: 'Learning the first glyphs etched into crumbling stone' },
  { id: 'golem_whisperer', name: 'Golem Whisperer', emoji: '🗿', levelReq: 10, description: 'Adept at calming and commanding ancient guardians' },
  { id: 'spell_scholar', name: 'Spell Scholar', emoji: '📜', levelReq: 18, description: 'Devoted student of the forgotten arcane sciences' },
  { id: 'corruption_purger', name: 'Corruption Purger', emoji: '🛡️', levelReq: 26, description: 'Unyielding against the void taint seeping through the ruins' },
  { id: 'ruin_sovereign', name: 'Ruin Sovereign', emoji: '🏰', levelReq: 34, description: 'Master of all eight ruin chambers and their secrets' },
  { id: 'arcane_sage', name: 'Arcane Sage', emoji: '💜', levelReq: 42, description: 'Cloaked in deep violet, wielding primordial knowledge' },
  { id: 'elder_archon', name: 'Elder Archon', emoji: '✨', levelReq: 50, description: 'Supreme guardian of the arcane ruins and all their power' },
]

// ══════════════════════════════════════════════════════════════════
// ACHIEVEMENTS (18)
// ══════════════════════════════════════════════════════════════════

const AR_ACHIEVEMENT_TEMPLATES: Omit<ARAchievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_step', name: 'First Steps', emoji: '👣', description: 'Enter the arcane ruins for the first time', condition: 'enter_ruins', reward: { shards: 50, xp: 25 } },
  { id: 'first_construct', name: 'Hoarder Begins', emoji: '🔮', description: 'Collect your first arcane construct', condition: 'collect_1_construct', reward: { shards: 100, xp: 50 } },
  { id: 'ten_constructs', name: 'Relic Collector', emoji: '🔮', description: 'Collect 10 arcane constructs', condition: 'collect_10_constructs', reward: { shards: 500, xp: 200 } },
  { id: 'twenty_five_constructs', name: 'Museum Curator', emoji: '🏰', description: 'Collect 25 arcane constructs', condition: 'collect_25_constructs', reward: { shards: 2000, xp: 600 } },
  { id: 'first_fragment', name: 'Rune Reader', emoji: '🔤', description: 'Decode your first spell fragment', condition: 'decode_1_fragment', reward: { shards: 75, xp: 40 } },
  { id: 'ten_fragments', name: 'Master Decoder', emoji: '📝', description: 'Decode 10 spell fragments', condition: 'decode_10_fragments', reward: { shards: 800, xp: 350 } },
  { id: 'first_golem', name: 'Cautious Arcanist', emoji: '🗿', description: 'Deactivate your first golem guardian', condition: 'deactivate_1_golem', reward: { shards: 60, xp: 30 } },
  { id: 'twenty_golems', name: 'Golem Master', emoji: '🔧', description: 'Deactivate 20 golem guardians', condition: 'deactivate_20_golems', reward: { shards: 1500, xp: 500 } },
  { id: 'survive_corruption', name: 'Corruption Survivor', emoji: '💀', description: 'Survive your first corruption event', condition: 'survive_1_corruption', reward: { shards: 200, xp: 100 } },
  { id: 'purify_five', name: 'Purifier', emoji: '✨', description: 'Purify 5 corruptions', condition: 'purify_5_corruptions', reward: { shards: 1200, xp: 450 } },
  { id: 'find_legendary', name: 'Legendary Discovery', emoji: '✨', description: 'Find a legendary arcane construct', condition: 'find_legendary', reward: { shards: 5000, xp: 2000 } },
  { id: 'clear_first_chamber', name: 'Chamber Conquered', emoji: '🚪', description: 'Clear your first ruin chamber', condition: 'clear_1_chamber', reward: { shards: 200, xp: 100 } },
  { id: 'clear_all_chambers', name: 'Ruin Conqueror', emoji: '🏰', description: 'Clear all 8 ruin chambers', condition: 'clear_all_chambers', reward: { shards: 8000, xp: 3000 } },
  { id: 'level_10', name: 'Seasoned Arcanist', emoji: '⭐', description: 'Reach level 10', condition: 'reach_level_10', reward: { shards: 500, xp: 0 } },
  { id: 'level_25', name: 'Veteran Scholar', emoji: '⭐', description: 'Reach level 25', condition: 'reach_level_25', reward: { shards: 2500, xp: 0 } },
  { id: 'level_50', name: 'Elder Archon', emoji: '🌟', description: 'Reach level 50', condition: 'reach_level_50', reward: { shards: 15000, xp: 0 } },
  { id: 'earn_10k_shards', name: 'Shard Hoarder', emoji: '💰', description: 'Accumulate 10,000 arcane shards', condition: 'earn_10k_shards', reward: { shards: 0, xp: 300 } },
  { id: 'daily_streak_7', name: 'Devoted Arcanist', emoji: '🔥', description: 'Maintain a 7-day daily quest streak', condition: 'daily_streak_7', reward: { shards: 2000, xp: 800 } },
]

// ══════════════════════════════════════════════════════════════════
// CHAMBERS (8)
// ══════════════════════════════════════════════════════════════════

const AR_CHAMBERS: ARChamber[] = [
  {
    id: 'crumbled_gate',
    name: 'The Crumbled Gate',
    emoji: '🚪',
    description: 'A massive stone archway, half-collapsed under creeping ivy and age. Faint violet light pulses from the runes carved into its pillars, beckoning the curious forward.',
    depth: 0,
    dangerLevel: 1,
    requiredLevel: 1,
    golemChance: 0.08,
    constructChance: 0.15,
    fragmentChance: 0.1,
    corruptionChance: 0.02,
    shardRewardRange: [12, 35],
    xpRewardRange: [18, 45],
    bgTint: '#4c1d95',
  },
  {
    id: 'whispering_corridor',
    name: 'The Whispering Corridor',
    emoji: '🗣️',
    description: 'A long hallway lined with fractured murals that seem to speak in forgotten tongues. Shadows shift along the walls, and the air hums with residual magic.',
    depth: 1,
    dangerLevel: 2,
    requiredLevel: 3,
    golemChance: 0.12,
    constructChance: 0.2,
    fragmentChance: 0.15,
    corruptionChance: 0.04,
    shardRewardRange: [22, 60],
    xpRewardRange: [35, 75],
    bgTint: '#3b0764',
  },
  {
    id: 'golem_forge',
    name: 'The Golem Forge',
    emoji: '🔨',
    description: 'A vast chamber where ancient animators once breathed life into stone. Inactive golems line the walls, their gemstone eyes dark but watchful. Molten mana pools glow faintly on the floor.',
    depth: 2,
    dangerLevel: 3,
    requiredLevel: 7,
    golemChance: 0.18,
    constructChance: 0.22,
    fragmentChance: 0.18,
    corruptionChance: 0.06,
    shardRewardRange: [38, 95],
    xpRewardRange: [55, 130],
    bgTint: '#1e1b4b',
  },
  {
    id: 'spell_vault',
    name: 'The Spell Vault',
    emoji: '📚',
    description: 'Towering shelves of crystalline tablets stretch into darkness, each inscribed with spells of immense power. A protective ward hums at the entrance, testing all who enter.',
    depth: 3,
    dangerLevel: 4,
    requiredLevel: 12,
    golemChance: 0.15,
    constructChance: 0.3,
    fragmentChance: 0.2,
    corruptionChance: 0.08,
    shardRewardRange: [65, 175],
    xpRewardRange: [85, 210],
    bgTint: '#581c87',
  },
  {
    id: 'crystal_sanctum',
    name: 'The Crystal Sanctum',
    emoji: '💎',
    description: 'A cavern of living crystal that refracts light into a thousand violet hues. Resonant tones echo from deep within, and the ground itself vibrates with arcane energy.',
    depth: 4,
    dangerLevel: 5,
    requiredLevel: 18,
    golemChance: 0.2,
    constructChance: 0.35,
    fragmentChance: 0.25,
    corruptionChance: 0.12,
    shardRewardRange: [90, 240],
    xpRewardRange: [130, 310],
    bgTint: '#0f172a',
  },
  {
    id: 'shadow_catacombs',
    name: 'The Shadow Catacombs',
    emoji: '🌑',
    description: 'Dark tunnels where light itself seems to bend and flee. Whispered incantations drift from unseen sources, and the shadows move with predatory intelligence.',
    depth: 5,
    dangerLevel: 6,
    requiredLevel: 25,
    golemChance: 0.18,
    constructChance: 0.4,
    fragmentChance: 0.3,
    corruptionChance: 0.15,
    shardRewardRange: [130, 340],
    xpRewardRange: [190, 470],
    bgTint: '#0c0a09',
  },
  {
    id: 'rune_amphitheater',
    name: 'The Rune Amphitheater',
    emoji: '⚖️',
    description: 'A circular arena where massive runes glow on every surface. Ancient arcanists once gathered here to debate the nature of magic. The runes still pulse with their collective power.',
    depth: 6,
    dangerLevel: 7,
    requiredLevel: 34,
    golemChance: 0.25,
    constructChance: 0.45,
    fragmentChance: 0.28,
    corruptionChance: 0.2,
    shardRewardRange: [175, 450],
    xpRewardRange: [260, 620],
    bgTint: '#1c1917',
  },
  {
    id: 'elders_nexus',
    name: "The Elder's Nexus",
    emoji: '✨',
    description: 'The deepest sanctum of the ruins. A convergence point where all arcane ley lines meet, radiating blinding gold energy. The air crackles with the voices of the Elders themselves.',
    depth: 7,
    dangerLevel: 8,
    requiredLevel: 42,
    golemChance: 0.3,
    constructChance: 0.55,
    fragmentChance: 0.35,
    corruptionChance: 0.25,
    shardRewardRange: [270, 650],
    xpRewardRange: [420, 950],
    bgTint: '#78350f',
  },
]

// ══════════════════════════════════════════════════════════════════
// ARCANE CONSTRUCTS (35, across 5 rarity tiers)
// ══════════════════════════════════════════════════════════════════

const AR_CONSTRUCTS: ARConstruct[] = [
  // ── Common (12) ──────────────────────────────────────────────
  { id: 'cracked_orb', name: 'Cracked Mana Orb', emoji: '🔮', rarity: 'common', description: 'A fractured glass sphere with a faint violet shimmer inside.', era: '~3000 AE', baseValue: 15, xpReward: 10, chamber: 'crumbled_gate', corruptionChance: 0 },
  { id: 'rune_pebble', name: 'Rune Pebble', emoji: '🪨', rarity: 'common', description: 'A smooth stone with a single glowing glyph etched into its surface.', era: '~2800 AE', baseValue: 18, xpReward: 12, chamber: 'crumbled_gate', corruptionChance: 0 },
  { id: 'dulled_crystal', name: 'Dulled Focus Crystal', emoji: '💎', rarity: 'common', description: 'Once a potent amplifier, now clouded and nearly powerless.', era: '~2500 AE', baseValue: 22, xpReward: 14, chamber: 'whispering_corridor', corruptionChance: 0 },
  { id: 'worn_scroll', name: 'Worn Spell Scroll', emoji: '📜', rarity: 'common', description: 'A brittle parchment with barely legible arcane formulae.', era: '~2200 AE', baseValue: 16, xpReward: 10, chamber: 'whispering_corridor', corruptionChance: 0 },
  { id: 'golem_shard', name: 'Golem Shard', emoji: '🗿', rarity: 'common', description: 'A fragment of a destroyed guardian, still warm to the touch.', era: '~2600 AE', baseValue: 20, xpReward: 12, chamber: 'golem_forge', corruptionChance: 0.01 },
  { id: 'tarnished_ring', name: 'Tarnished Arcane Ring', emoji: '💍', rarity: 'common', description: 'A simple band of dark metal that occasionally sparks.', era: '~1900 AE', baseValue: 24, xpReward: 14, chamber: 'golem_forge', corruptionChance: 0.01 },
  { id: 'ember_dust_vial', name: 'Ember Dust Vial', emoji: '🧪', rarity: 'common', description: 'A tiny phial of orange-glowing powder, remnants of a fire spell.', era: '~1700 AE', baseValue: 14, xpReward: 8, chamber: 'spell_vault', corruptionChance: 0 },
  { id: 'stone_quill', name: 'Stone Quill', emoji: '🪶', rarity: 'common', description: 'A writing instrument carved from enchanted limestone.', era: '~2100 AE', baseValue: 19, xpReward: 12, chamber: 'spell_vault', corruptionChance: 0.01 },
  { id: 'mana_thread', name: 'Mana Thread Spool', emoji: '🧵', rarity: 'common', description: 'Luminescent thread spun from crystallized magical energy.', era: '~1800 AE', baseValue: 17, xpReward: 10, chamber: 'crystal_sanctum', corruptionChance: 0.01 },
  { id: 'rusty_charm', name: 'Rusty Ward Charm', emoji: '🗝️', rarity: 'common', description: 'A corroded protective talisman, its magic nearly spent.', era: '~2400 AE', baseValue: 13, xpReward: 8, chamber: 'shadow_catacombs', corruptionChance: 0 },
  { id: 'chalk_stick', name: 'Ritual Chalk', emoji: '🖍️', rarity: 'common', description: 'A stub of chalk used to draw binding circles on stone floors.', era: '~1500 AE', baseValue: 11, xpReward: 8, chamber: 'rune_amphitheater', corruptionChance: 0 },
  { id: 'copper_conduit', name: 'Copper Mana Conduit', emoji: '🔌', rarity: 'common', description: 'A simple pipe segment that once channeled arcane energy between rooms.', era: '~2000 AE', baseValue: 20, xpReward: 12, chamber: 'crumbled_gate', corruptionChance: 0 },

  // ── Uncommon (10) ────────────────────────────────────────────
  { id: 'teal_sigil', name: 'Teal Ward Sigil', emoji: '🛡️', rarity: 'uncommon', description: 'A polished teal stone inscribed with protective runes that glow softly.', era: '~1500 AE', baseValue: 130, xpReward: 65, chamber: 'crystal_sanctum', corruptionChance: 0.03 },
  { id: 'ember_core', name: 'Ember Spell Core', emoji: '🔥', rarity: 'uncommon', description: 'A small sphere of compressed flame essence, radiating warmth.', era: '~1300 AE', baseValue: 155, xpReward: 78, chamber: 'golem_forge', corruptionChance: 0.04 },
  { id: 'violet_lens', name: 'Violet Scrying Lens', emoji: '🔍', rarity: 'uncommon', description: 'A hand-held lens that reveals hidden magical auras and traces.', era: '~1400 AE', baseValue: 140, xpReward: 70, chamber: 'spell_vault', corruptionChance: 0.03 },
  { id: 'golem_heart', name: 'Golem Heart Stone', emoji: '💜', rarity: 'uncommon', description: 'The central power source from a small guardian, still pulsing with energy.', era: '~1600 AE', baseValue: 170, xpReward: 85, chamber: 'golem_forge', corruptionChance: 0.05 },
  { id: 'echoing_shell', name: 'Echoing Conch Shell', emoji: '🐚', rarity: 'uncommon', description: 'When held to the ear, it replays snippets of ancient incantations.', era: '~1200 AE', baseValue: 95, xpReward: 48, chamber: 'whispering_corridor', corruptionChance: 0.02 },
  { id: 'rune_bracelet', name: 'Rune-etched Bracelet', emoji: '⭕', rarity: 'uncommon', description: 'A silver bracelet with flowing script that adapts to the wearer\'s mana.', era: '~1100 AE', baseValue: 120, xpReward: 60, chamber: 'crystal_sanctum', corruptionChance: 0.04 },
  { id: 'shadow_vial', name: 'Bottled Shadow', emoji: '🌑', rarity: 'uncommon', description: 'A sealed vial containing captured darkness that writhes inside.', era: '~900 AE', baseValue: 145, xpReward: 72, chamber: 'shadow_catacombs', corruptionChance: 0.04 },
  { id: 'amber_pendant', name: 'Amber Resonance Pendant', emoji: '📿', rarity: 'uncommon', description: 'An amber gem that vibrates when powerful spells are cast nearby.', era: '~1350 AE', baseValue: 115, xpReward: 58, chamber: 'rune_amphitheater', corruptionChance: 0.03 },
  { id: 'frost_quill', name: 'Frost Ink Quill', emoji: '🖋️', rarity: 'uncommon', description: 'Writes in magical ink that freezes the words onto any surface permanently.', era: '~1000 AE', baseValue: 80, xpReward: 40, chamber: 'spell_vault', corruptionChance: 0.02 },
  { id: 'mana_bulb', name: 'Glowing Mana Bulb', emoji: '💡', rarity: 'uncommon', description: 'A bioluminescent orb harvested from deep-cave arcane flora.', era: '~800 AE', baseValue: 165, xpReward: 82, chamber: 'elders_nexus', corruptionChance: 0.04 },

  // ── Rare (7) ─────────────────────────────────────────────────
  { id: 'void_crystal', name: 'Void-Touched Crystal', emoji: '💜', rarity: 'rare', description: 'A crystal that pulses between violet and black, humming with dangerous energy.', era: '~700 AE', baseValue: 620, xpReward: 260, chamber: 'shadow_catacombs', corruptionChance: 0.08 },
  { id: 'golden_rune_tablet', name: 'Golden Rune Tablet', emoji: '📜', rarity: 'rare', description: 'A solid gold tablet inscribed with the foundational laws of arcana.', era: '~500 AE', baseValue: 750, xpReward: 310, chamber: 'rune_amphitheater', corruptionChance: 0.1 },
  { id: 'ember_blade_hilt', name: 'Ember Blade Hilt', emoji: '⚔️', rarity: 'rare', description: 'The handle of a legendary weapon, its missing blade still radiating heat.', era: '~600 AE', baseValue: 580, xpReward: 240, chamber: 'golem_forge', corruptionChance: 0.07 },
  { id: 'elders_eye', name: "Elder's Eye Amulet", emoji: '👁️', rarity: 'rare', description: 'A pendant shaped like an all-seeing eye that grants brief clairvoyance.', era: '~400 AE', baseValue: 700, xpReward: 280, chamber: 'elders_nexus', corruptionChance: 0.09 },
  { id: 'teal_scepter', name: 'Teal Arcane Scepter', emoji: '🪄', rarity: 'rare', description: 'A rod of deep teal crystal that focuses and amplifies spell energy.', era: '~550 AE', baseValue: 540, xpReward: 220, chamber: 'crystal_sanctum', corruptionChance: 0.06 },
  { id: 'shadow_cloak_frag', name: 'Shadow Cloak Fragment', emoji: '🧥', rarity: 'rare', description: 'A piece of fabric that seems to absorb light and sound around it.', era: '~450 AE', baseValue: 660, xpReward: 270, chamber: 'shadow_catacombs', corruptionChance: 0.08 },
  { id: 'runic_crown_shard', name: 'Runic Crown Shard', emoji: '👑', rarity: 'rare', description: 'A fragment of a crown worn by the last ruling Archon of the ruins.', era: '~300 AE', baseValue: 600, xpReward: 250, chamber: 'elders_nexus', corruptionChance: 0.07 },

  // ── Epic (4) ─────────────────────────────────────────────────
  { id: 'nexus_core', name: 'Nexus Power Core', emoji: '⚡', rarity: 'epic', description: 'The heart of an arcane nexus, containing enough energy to power a city-sized ward.', era: '~200 AE', baseValue: 2600, xpReward: 850, chamber: 'elders_nexus', corruptionChance: 0.15 },
  { id: 'codex_page', name: 'Elder Codex Page', emoji: '📖', rarity: 'epic', description: 'A single page from the Elder Codex, containing a complete seventh-circle spell.', era: '~150 AE', baseValue: 3300, xpReward: 1050, chamber: 'spell_vault', corruptionChance: 0.18 },
  { id: 'golem_sovereign_mask', name: 'Golem Sovereign Mask', emoji: '🎭', rarity: 'epic', description: 'A mask that grants command over all golems within a one-mile radius.', era: '~100 AE', baseValue: 2900, xpReward: 950, chamber: 'golem_forge', corruptionChance: 0.15 },
  { id: 'void_mirror', name: 'Void Mirror', emoji: '🪞', rarity: 'epic', description: 'A mirror that reflects not the viewer, but the void dimension beyond reality.', era: '~50 AE', baseValue: 3600, xpReward: 1150, chamber: 'shadow_catacombs', corruptionChance: 0.2 },

  // ── Legendary (2) ────────────────────────────────────────────
  { id: 'elders_scepter', name: "Elder's Sovereign Scepter", emoji: '✨', rarity: 'legendary', description: 'The ultimate instrument of arcane authority, forged at the dawn of magic itself. It bends reality to its wielder\'s will.', era: 'Dawn Era', baseValue: 16000, xpReward: 5500, chamber: 'elders_nexus', corruptionChance: 0.25 },
  { id: 'genesis_orb', name: 'Genesis Orb', emoji: '🌟', rarity: 'legendary', description: 'A sphere of pure creation energy, said to be the first artifact ever made. Legends claim it can rewrite the laws of magic.', era: 'Genesis', baseValue: 22000, xpReward: 7500, chamber: 'elders_nexus', corruptionChance: 0.3 },
]

// ══════════════════════════════════════════════════════════════════
// SPELL FRAGMENTS / RUNE PUZZLES (30)
// ══════════════════════════════════════════════════════════════════

const AR_FRAGMENTS: ARSpellFragment[] = [
  // ── Translation puzzles (8) ──────────────────────────────────
  { id: 'sf_translate_01', name: 'The Builder\'s Glyph', emoji: '🔤', type: 'translation', difficulty: 1, description: 'Translate this ancient rune: ᚱ (rune of journey)', hintText: 'Think of those who first walked these halls', answer: 'journey', xpReward: 28, shardReward: 18, chamber: 'crumbled_gate' },
  { id: 'sf_translate_02', name: 'The Shield Mark', emoji: '🛡️', type: 'translation', difficulty: 1, description: 'Translate this rune: ᛉ (rune of protection)', hintText: 'It represents safety and defense', answer: 'protection', xpReward: 28, shardReward: 18, chamber: 'crumbled_gate' },
  { id: 'sf_translate_03', name: 'The Fire Glyph', emoji: '🔥', type: 'translation', difficulty: 2, description: 'What does the rune ᚲ represent in the Elder alphabet?', hintText: 'A fundamental force of destruction and creation', answer: 'fire', xpReward: 42, shardReward: 28, chamber: 'whispering_corridor' },
  { id: 'sf_translate_04', name: 'The Shadow Word', emoji: '🌑', type: 'translation', difficulty: 2, description: 'Translate this archaic term: "Umbrafontis"', hintText: 'It relates to darkness and the casting of shadows', answer: 'shadow', xpReward: 48, shardReward: 32, chamber: 'whispering_corridor' },
  { id: 'sf_translate_05', name: 'The Crystal Term', emoji: '💎', type: 'translation', difficulty: 3, description: 'What does "Resonara" mean in the ancient arcane tongue?', hintText: 'Crystals do this when they amplify magical energy', answer: 'resonance', xpReward: 68, shardReward: 48, chamber: 'crystal_sanctum' },
  { id: 'sf_translate_06', name: 'The Golem Command', emoji: '🗿', type: 'translation', difficulty: 3, description: 'Decode the golem activation word: "Surgitapetra"', hintText: 'A combination of "rise" and "stone" in the Elder language', answer: 'awaken', xpReward: 72, shardReward: 52, chamber: 'golem_forge' },
  { id: 'sf_translate_07', name: 'The Void Inscription', emoji: '🕳️', type: 'translation', difficulty: 4, description: 'What does the void glyph ᛞ-ᛟ-ᛁ-ᛞ signify?', hintText: 'The process of entering the space between dimensions', answer: 'voidwalk', xpReward: 105, shardReward: 75, chamber: 'shadow_catacombs' },
  { id: 'sf_translate_08', name: 'The Elder\'s Final Word', emoji: '✨', type: 'translation', difficulty: 4, description: 'What does "Aethernexus" translate to?', hintText: 'The convergence point of all magical energy', answer: 'nexus', xpReward: 115, shardReward: 82, chamber: 'elders_nexus' },

  // ── Sequence puzzles (6) ─────────────────────────────────────
  { id: 'sf_sequence_01', name: 'Rune Casting Order', emoji: '📊', type: 'sequence', difficulty: 1, description: 'Order these spell stages: Focus, Channel, Release, Ground', hintText: 'The natural flow of magical energy', answer: 'focus,channel,release,ground', xpReward: 32, shardReward: 22, chamber: 'crumbled_gate' },
  { id: 'sf_sequence_02', name: 'Golem Activation Steps', emoji: '🗿', type: 'sequence', difficulty: 2, description: 'Order: Inscribe Core, Place Heart, Speak Command, Pour Mana', hintText: 'Follow the ancient ritual for awakening guardians', answer: 'inscribe,place,speak,pour', xpReward: 55, shardReward: 38, chamber: 'golem_forge' },
  { id: 'sf_sequence_03', name: 'Rune Decay Stages', emoji: '📉', type: 'sequence', difficulty: 2, description: 'Order: Flicker, Dim, Crack, Shatter (rune deterioration)', hintText: 'How enchantments degrade over time', answer: 'flicker,dim,crack,shatter', xpReward: 58, shardReward: 42, chamber: 'whispering_corridor' },
  { id: 'sf_sequence_04', name: 'Elder Hierarchy', emoji: '⛰️', type: 'sequence', difficulty: 3, description: 'Rank: Archon, Sage, Adept, Initiate (highest to lowest)', hintText: 'The ancient order of arcane mastery', answer: 'archon,sage,adept,initiate', xpReward: 80, shardReward: 55, chamber: 'rune_amphitheater' },
  { id: 'sf_sequence_05', name: 'Corruption Stages', emoji: '☠️', type: 'sequence', difficulty: 3, description: 'Order: Whispers, Taint, Bind, Consumed (void corruption)', hintText: 'How the void corrupts an arcanist', answer: 'whispers,taint,bind,consumed', xpReward: 85, shardReward: 58, chamber: 'shadow_catacombs' },
  { id: 'sf_sequence_06', name: 'The Convergence Ritual', emoji: '⚡', type: 'sequence', difficulty: 4, description: 'Order: Align Ley, Open Gate, Channel Prism, Merge Nexus', hintText: 'The final ritual performed at the Elder\'s Nexus', answer: 'align,open,channel,merge', xpReward: 125, shardReward: 90, chamber: 'elders_nexus' },

  // ── Cipher puzzles (5) ───────────────────────────────────────
  { id: 'sf_cipher_01', name: 'Rune Shift Cipher', emoji: '🔐', type: 'cipher', difficulty: 1, description: 'Decode: "VKDWH" → shift each letter back 3 positions', hintText: 'D=G, E=H, ...', answer: 'shark', xpReward: 38, shardReward: 25, chamber: 'crumbled_gate' },
  { id: 'sf_cipher_02', name: 'Arcane Atbash', emoji: '🔁', type: 'cipher', difficulty: 2, description: 'Decode "WILZXH" using Atbash (A↔Z, B↔Y)', hintText: 'The first letter W becomes D', answer: 'droras', xpReward: 58, shardReward: 40, chamber: 'whispering_corridor' },
  { id: 'sf_cipher_03', name: 'Rune Number Code', emoji: '🔢', type: 'cipher', difficulty: 2, description: 'ᚠᚠᚠᚢ = ? (ᚠ=1, ᚢ=10, ᚦ=100)', hintText: 'Each Elder rune has a numeric value', answer: '13', xpReward: 62, shardReward: 42, chamber: 'golem_forge' },
  { id: 'sf_cipher_04', name: 'Crystal Matrix', emoji: '🔲', type: 'cipher', difficulty: 3, description: 'Decode: "42 15 33 54 21" using the crystal 5x5 grid', hintText: 'Each number pair maps to a letter position', answer: 'arcane', xpReward: 95, shardReward: 68, chamber: 'crystal_sanctum' },
  { id: 'sf_cipher_05', name: 'Elder Sealed Scroll', emoji: '📜', type: 'cipher', difficulty: 4, description: 'Decode: "NRTH-VNXS-PWR" → the Elder\'s core principle', hintText: 'The ancient teaching about where magic comes from', answer: 'inner nexus power', xpReward: 145, shardReward: 105, chamber: 'elders_nexus' },

  // ── Riddle puzzles (5) ───────────────────────────────────────
  { id: 'sf_riddle_01', name: 'The Golem Riddle', emoji: '🗿', type: 'riddle', difficulty: 2, description: 'I have no voice yet I obey commands. I have no heart yet I guard. What am I?', hintText: 'The ancient guardians of these ruins', answer: 'golem', xpReward: 48, shardReward: 32, chamber: 'golem_forge' },
  { id: 'sf_riddle_02', name: 'The Mana Riddle', emoji: '💧', type: 'riddle', difficulty: 1, description: 'I flow through all living things and power every spell. I am invisible yet essential. What am I?', hintText: 'The essence of all magic', answer: 'mana', xpReward: 32, shardReward: 20, chamber: 'crumbled_gate' },
  { id: 'sf_riddle_03', name: 'The Rune Riddle', emoji: '✍️', type: 'riddle', difficulty: 2, description: 'I am carved in stone but live in the mind. I speak without a voice. What am I?', hintText: 'The written language of ancient magic', answer: 'rune', xpReward: 52, shardReward: 38, chamber: 'rune_amphitheater' },
  { id: 'sf_riddle_04', name: 'The Void Riddle', emoji: '🕳️', type: 'riddle', difficulty: 3, description: 'I am the space between spaces, the silence between words. I consume all light yet have no form. What am I?', hintText: 'The dark dimension that threatens the ruins', answer: 'void', xpReward: 75, shardReward: 52, chamber: 'shadow_catacombs' },
  { id: 'sf_riddle_05', name: 'The Crystal Riddle', emoji: '💎', type: 'riddle', difficulty: 4, description: 'I was born in pressure, shaped by magic, and I sing when touched by energy. I hold the memories of the Elders. What am I?', hintText: 'Found deep within the Crystal Sanctum', answer: 'crystal', xpReward: 135, shardReward: 95, chamber: 'crystal_sanctum' },

  // ── Pattern puzzles (4) ──────────────────────────────────────
  { id: 'sf_pattern_01', name: 'Elder Rune Pattern', emoji: '🔱', type: 'pattern', difficulty: 1, description: 'Complete the rune sequence: ᚠ ᚢ ᚦ ?', hintText: 'The first four runes of the Elder Futhark alphabet', answer: 'ᚨ', xpReward: 30, shardReward: 20, chamber: 'crumbled_gate' },
  { id: 'sf_pattern_02', name: 'Mana Flow Pattern', emoji: '🔢', type: 'pattern', difficulty: 2, description: 'Complete: 2, 6, 18, 54, ?', hintText: 'Each number is tripled', answer: '162', xpReward: 48, shardReward: 32, chamber: 'whispering_corridor' },
  { id: 'sf_pattern_03', name: 'Ley Line Pattern', emoji: '⭐', type: 'pattern', difficulty: 3, description: 'Complete: Fire, Water, Earth, ?, Aether (elemental sequence)', hintText: 'The classical elemental wheel', answer: 'air', xpReward: 82, shardReward: 58, chamber: 'crystal_sanctum' },
  { id: 'sf_pattern_04', name: 'Arcane Geometry', emoji: '📐', type: 'pattern', difficulty: 4, description: 'What shape has infinite symmetry and appears at the center of every nexus?', hint: 'A fundamental geometric form with no edges', answer: 'circle', xpReward: 115, shardReward: 80, chamber: 'elders_nexus' },

  // ── Anagram puzzles (2) ──────────────────────────────────────
  { id: 'sf_anagram_01', name: 'Scrambled Spell', emoji: '🔀', type: 'anagram', difficulty: 2, description: 'Unscramble: "LAMAN" → an arcane resource', hintText: 'The energy that powers all spells', answer: 'manal', shardReward: 35, chamber: 'spell_vault', xpReward: 52 },
  { id: 'sf_anagram_02', name: 'Scrambled Title', emoji: '🔀', type: 'anagram', difficulty: 3, description: 'Unscramble: "RONCHAA" → a title of arcane mastery', hintText: 'The highest rank in the Elder hierarchy', answer: 'archon', shardReward: 70, chamber: 'rune_amphitheater', xpReward: 100 },
]

// ══════════════════════════════════════════════════════════════════
// STRUCTURES (25)
// ══════════════════════════════════════════════════════════════════

const AR_STRUCTURE_TEMPLATES: Omit<ARStructure, 'level' | 'durability'>[] = [
  // ── Research (5) ─────────────────────────────────────────────
  { id: 'struct_research_table', name: 'Research Table', emoji: '🪵', category: 'research', description: 'A basic wooden table for studying spell fragments and ancient texts.', maxLevel: 5, efficiency: 0.5, precision: 0.7, maxDurability: 100, upgradeCost: 100, repairCost: 20 },
  { id: 'struct_arcane_library', name: 'Arcane Library Shelf', emoji: '📚', category: 'research', description: 'A shelf of preserved grimoires and reference tomes for deep study.', maxLevel: 5, efficiency: 0.8, precision: 0.6, maxDurability: 80, upgradeCost: 200, repairCost: 35 },
  { id: 'struct_crystal_lens', name: 'Crystal Analysis Lens', emoji: '🔍', category: 'research', description: 'A precision magnifier that reveals hidden layers in spell fragments.', maxLevel: 5, efficiency: 0.6, precision: 0.95, maxDurability: 90, upgradeCost: 350, repairCost: 45 },
  { id: 'struct_mana_microscope', name: 'Mana Microscope', emoji: '🔬', category: 'research', description: 'An enchanted device that visualizes mana flow at the molecular level.', maxLevel: 5, efficiency: 0.7, precision: 1.0, maxDurability: 60, upgradeCost: 600, repairCost: 55 },
  { id: 'struct_elder_terminal', name: 'Elder Data Terminal', emoji: '💻', category: 'research', description: 'A reconstructed Elder device that cross-references all known arcane knowledge.', maxLevel: 5, efficiency: 0.95, precision: 0.9, maxDurability: 120, upgradeCost: 1200, repairCost: 80 },

  // ── Golem Control (4) ────────────────────────────────────────
  { id: 'struct_control_wand', name: 'Golem Control Wand', emoji: '🪄', category: 'golem_control', description: 'A simple wand that emits calming frequencies to soothe guardian golems.', maxLevel: 5, efficiency: 0.4, precision: 0.6, maxDurability: 100, upgradeCost: 120, repairCost: 25 },
  { id: 'struct_resonance_tuner', name: 'Resonance Tuner', emoji: '📻', category: 'golem_control', description: 'Tunes into golem frequency bands to detect and pacify them at range.', maxLevel: 5, efficiency: 0.6, precision: 0.8, maxDurability: 85, upgradeCost: 250, repairCost: 38 },
  { id: 'struct_heart_connector', name: 'Heart Stone Connector', emoji: '💜', category: 'golem_control', description: 'Direct interface device that plugs into a golem\'s heart stone for override.', maxLevel: 5, efficiency: 0.8, precision: 0.7, maxDurability: 70, upgradeCost: 500, repairCost: 55 },
  { id: 'struct_sovereign_crown', name: 'Sovereign Override Crown', emoji: '👑', category: 'golem_control', description: 'The ultimate command interface that can override any golem\'s core programming.', maxLevel: 5, efficiency: 0.95, precision: 0.95, maxDurability: 150, upgradeCost: 1000, repairCost: 70 },

  // ── Rune Decoding (4) ────────────────────────────────────────
  { id: 'struct_rune_dictionary', name: 'Rune Dictionary', emoji: '📖', category: 'rune_decoding', description: 'A comprehensive guide to Elder rune symbols and their meanings.', maxLevel: 5, efficiency: 0.4, precision: 0.6, maxDurability: 200, upgradeCost: 80, repairCost: 15 },
  { id: 'struct_glyph_analyzer', name: 'Glyph Analyzer', emoji: '🧮', category: 'rune_decoding', description: 'Automated scanner that identifies and translates common rune combinations.', maxLevel: 5, efficiency: 0.6, precision: 0.8, maxDurability: 120, upgradeCost: 300, repairCost: 40 },
  { id: 'struct_context_matrix', name: 'Context Matrix', emoji: '🔲', category: 'rune_decoding', description: 'Cross-references rune context with historical usage patterns for accuracy.', maxLevel: 5, efficiency: 0.75, precision: 0.9, maxDurability: 90, upgradeCost: 550, repairCost: 50 },
  { id: 'struct_elder_translator', name: 'Elder Neural Translator', emoji: '🧠', category: 'rune_decoding', description: 'Advanced AI-like construct that achieves near-perfect Elder language translation.', maxLevel: 5, efficiency: 0.9, precision: 0.98, maxDurability: 80, upgradeCost: 1000, repairCost: 65 },

  // ── Mana Channeling (4) ─────────────────────────────────────
  { id: 'struct_mana_crystal', name: 'Basic Mana Crystal', emoji: '💠', category: 'mana_channeling', description: 'A raw crystal that stores small amounts of ambient mana for later use.', maxLevel: 5, efficiency: 0.4, precision: 0.5, maxDurability: 100, upgradeCost: 90, repairCost: 18 },
  { id: 'struct_conduit_pipe', name: 'Arcane Conduit Pipe', emoji: '🔌', category: 'mana_channeling', description: 'Channels mana between locations, reducing spell casting costs.', maxLevel: 5, efficiency: 0.6, precision: 0.7, maxDurability: 110, upgradeCost: 200, repairCost: 30 },
  { id: 'struct_ley_capacitor', name: 'Ley Line Capacitor', emoji: '🔋', category: 'mana_channeling', description: 'Taps directly into underground ley lines for massive mana regeneration.', maxLevel: 5, efficiency: 0.8, precision: 0.8, maxDurability: 130, upgradeCost: 450, repairCost: 50 },
  { id: 'struct_nexus_battery', name: 'Nexus Power Battery', emoji: '⚡', category: 'mana_channeling', description: 'Stores energy from a nexus convergence for emergency spellcasting.', maxLevel: 5, efficiency: 0.95, precision: 0.9, maxDurability: 160, upgradeCost: 900, repairCost: 65 },

  // ── Exploration (4) ──────────────────────────────────────────
  { id: 'struct_wisp_lantern', name: 'Wisp Lantern', emoji: '🏮', category: 'exploration', description: 'A lantern enchanted with a friendly wisp that illuminates hidden passages.', maxLevel: 5, efficiency: 0.5, precision: 0.6, maxDurability: 120, upgradeCost: 100, repairCost: 20 },
  { id: 'struct_shadow_cloak', name: 'Shadow Weave Cloak', emoji: '🧥', category: 'exploration', description: 'A cloak woven from shadow threads that makes the wearer harder to detect.', maxLevel: 5, efficiency: 0.7, precision: 0.7, maxDurability: 90, upgradeCost: 280, repairCost: 35 },
  { id: 'struct_phase_boots', name: 'Phase Walker Boots', emoji: '👢', category: 'exploration', description: 'Boots that allow brief phasing through thin walls and barriers.', maxLevel: 5, efficiency: 0.6, precision: 0.85, maxDurability: 80, upgradeCost: 400, repairCost: 48 },
  { id: 'struct_ley_compass', name: 'Ley Line Compass', emoji: '🧭', category: 'exploration', description: 'A compass that points toward the nearest source of arcane energy.', maxLevel: 5, efficiency: 0.85, precision: 0.95, maxDurability: 140, upgradeCost: 750, repairCost: 60 },

  // ── Warding (4) ──────────────────────────────────────────────
  { id: 'struct_ward_stone', name: 'Basic Ward Stone', emoji: '🪨', category: 'warding', description: 'A stone carved with protective runes that absorbs minor magical damage.', maxLevel: 5, efficiency: 0.5, precision: 0.7, maxDurability: 100, upgradeCost: 110, repairCost: 22 },
  { id: 'struct_teal_barrier', name: 'Teal Barrier Pendant', emoji: '🛡️', category: 'warding', description: 'Projects a shimmering teal shield that deflects corruption attempts.', maxLevel: 5, efficiency: 0.65, precision: 0.8, maxDurability: 90, upgradeCost: 250, repairCost: 38 },
  { id: 'struct_void_ward', name: 'Void Anchoring Ward', emoji: '🕳️', category: 'warding', description: 'Anchors the wearer to reality, preventing involuntary void displacement.', maxLevel: 5, efficiency: 0.8, precision: 0.85, maxDurability: 75, upgradeCost: 500, repairCost: 52 },
  { id: 'struct_elder_sanctuary', name: 'Elder Sanctuary Circle', emoji: '⭕', category: 'warding', description: 'A portable sanctuary that provides complete protection within its radius.', maxLevel: 5, efficiency: 0.95, precision: 0.95, maxDurability: 200, upgradeCost: 1100, repairCost: 75 },
]

// ══════════════════════════════════════════════════════════════════
// ARCANE ABILITIES (22)
// ══════════════════════════════════════════════════════════════════

const AR_ABILITY_TEMPLATES: Omit<ARArcaneAbility, 'isActive' | 'currentCooldown'>[] = [
  // ── Combat (5) ───────────────────────────────────────────────
  { id: 'ab_arcane_bolt', name: 'Arcane Bolt', emoji: '💜', category: 'combat', description: 'Fire a concentrated bolt of violet energy that stuns golems for 3 turns.', levelReq: 1, cooldown: 5, duration: 3, effectValue: 22, unlockCost: 0 },
  { id: 'ab_rain_of_runes', name: 'Rain of Runes', emoji: '✍️', category: 'combat', description: 'Summon a torrent of glowing runes that weaken golem armor by 30%.', levelReq: 5, cooldown: 4, duration: 2, effectValue: 30, unlockCost: 200 },
  { id: 'ab_ember_nova', name: 'Ember Nova', emoji: '🔥', category: 'combat', description: 'Release a burst of orange flame that damages all nearby threats.', levelReq: 12, cooldown: 6, duration: 1, effectValue: 50, unlockCost: 800 },
  { id: 'ab_golem_override', name: 'Golem Override', emoji: '🗿', category: 'combat', description: 'Forcefully reprogram a golem guardian to fight for you temporarily.', levelReq: 22, cooldown: 8, duration: 0, effectValue: 100, unlockCost: 3000 },
  { id: 'ab_void_eruption', name: 'Void Eruption', emoji: '🌑', category: 'combat', description: 'Tear open a rift to the void, consuming all enemies in a 5-tile radius.', levelReq: 35, cooldown: 10, duration: 1, effectValue: 85, unlockCost: 8000 },

  // ── Exploration (5) ──────────────────────────────────────────
  { id: 'ab_arcane_sight', name: 'Arcane Sight', emoji: '👁️', category: 'exploration', description: 'See through walls and detect hidden chambers, constructs, and golems for 3 turns.', levelReq: 1, cooldown: 4, duration: 3, effectValue: 40, unlockCost: 0 },
  { id: 'ab_phase_walk', name: 'Phase Walk', emoji: '👻', category: 'exploration', description: 'Phase through walls and barriers for 2 turns.', levelReq: 7, cooldown: 5, duration: 2, effectValue: 25, unlockCost: 300 },
  { id: 'ab_rune_path', name: 'Rune Path', emoji: '✍️', category: 'exploration', description: 'Create a teleportation rune to any previously visited chamber.', levelReq: 15, cooldown: 8, duration: 0, effectValue: 60, unlockCost: 1200 },
  { id: 'ab_ley_flash', name: 'Ley Line Flash', emoji: '⚡', category: 'exploration', description: 'Surf the ley lines to instantly illuminate the entire ruin map.', levelReq: 28, cooldown: 10, duration: 5, effectValue: 100, unlockCost: 5000 },
  { id: 'ab_shadow_step', name: 'Shadow Step', emoji: '👤', category: 'exploration', description: 'Teleport through shadows to any chamber regardless of level requirement.', levelReq: 40, cooldown: 12, duration: 0, effectValue: 100, unlockCost: 12000 },

  // ── Spell Research (4) ───────────────────────────────────────
  { id: 'ab_glyph_insight', name: 'Glyph Insight', emoji: '🔤', category: 'spell_research', description: 'Gain a powerful hint that reveals 50% of the spell fragment answer.', levelReq: 1, cooldown: 3, duration: 1, effectValue: 50, unlockCost: 0 },
  { id: 'ab_research_focus', name: 'Research Focus', emoji: '📝', category: 'spell_research', description: 'Double XP earned from spell fragment decoding for 4 turns.', levelReq: 10, cooldown: 5, duration: 4, effectValue: 100, unlockCost: 600 },
  { id: 'ab_elder_wisdom', name: 'Elder Wisdom', emoji: '🧠', category: 'spell_research', description: 'Automatically decode the next spell fragment without penalty.', levelReq: 20, cooldown: 7, duration: 0, effectValue: 100, unlockCost: 2500 },
  { id: 'ab_omniscience', name: 'Arcane Omniscience', emoji: '🔮', category: 'spell_research', description: 'Permanently reveal the correct answer to any fragment you encounter.', levelReq: 38, cooldown: 15, duration: 1, effectValue: 100, unlockCost: 10000 },

  // ── Golem Control (4) ────────────────────────────────────────
  { id: 'ab_mana_rest', name: 'Mana Restoration', emoji: '💧', category: 'golem_control', description: 'Rest at a mana spring, restoring 50% vitality and full mana.', levelReq: 1, cooldown: 6, duration: 0, effectValue: 50, unlockCost: 0 },
  { id: 'ab_golem_soothe', name: 'Golem Soothe', emoji: '🎵', category: 'golem_control', description: 'Emit calming frequencies that pacify golems, preventing activation for 3 turns.', levelReq: 8, cooldown: 5, duration: 3, effectValue: 75, unlockCost: 350 },
  { id: 'ab_purify_aura', name: 'Purify Aura', emoji: '✨', category: 'golem_control', description: 'Become immune to all corruption effects for 3 turns.', levelReq: 16, cooldown: 7, duration: 3, effectValue: 100, unlockCost: 1500 },
  { id: 'ab_arcane_resurrection', name: 'Arcane Resurrection', emoji: '⚡', category: 'golem_control', description: 'If you would fall, instead revive with full vitality once per cooldown.', levelReq: 30, cooldown: 12, duration: 0, effectValue: 100, unlockCost: 6000 },

  // ── Arcane Lore (4) ──────────────────────────────────────────
  { id: 'ab_construct_radar', name: 'Construct Radar', emoji: '📡', category: 'arcane_lore', description: 'Detect nearby arcane constructs and estimate their rarity tier.', levelReq: 1, cooldown: 3, duration: 2, effectValue: 35, unlockCost: 0 },
  { id: 'ab_pristine_touch', name: 'Pristine Touch', emoji: '🧤', category: 'arcane_lore', description: 'Handle constructs with perfect care, eliminating corruption chance for 2 turns.', levelReq: 11, cooldown: 5, duration: 2, effectValue: 100, unlockCost: 500 },
  { id: 'ab_true_identify', name: 'True Identify', emoji: '🔎', category: 'arcane_lore', description: 'Reveal the full lore and hidden value of any construct in inventory.', levelReq: 19, cooldown: 4, duration: 1, effectValue: 80, unlockCost: 2000 },
  { id: 'ab_eternal_bond', name: 'Eternal Bond', emoji: '💫', category: 'arcane_lore', description: 'Permanently link to a construct, doubling its value and XP rewards.', levelReq: 33, cooldown: 10, duration: 0, effectValue: 100, unlockCost: 7000 },
]

// ══════════════════════════════════════════════════════════════════
// GOLEM TEMPLATES (10 types)
// ══════════════════════════════════════════════════════════════════

const AR_GOLEM_TEMPLATES: Omit<ARGolemInstance, 'deactivated' | 'triggered'>[] = [
  { id: 'golem_stone', type: 'stone_guardian', name: 'Stone Guardian', emoji: '🗿', description: 'A hulking figure of rough-hewn granite, its eyes glowing with dim violet light.', minDamage: 12, maxDamage: 28, deactivateDifficulty: 2, chamber: 'crumbled_gate' },
  { id: 'golem_clay', type: 'clay_sentinel', name: 'Clay Sentinel', emoji: '🏺', description: 'A slender golem of fired clay, surprisingly fast despite its fragile appearance.', minDamage: 8, maxDamage: 22, deactivateDifficulty: 3, chamber: 'whispering_corridor' },
  { id: 'golem_iron', type: 'iron_warden', name: 'Iron Warden', emoji: '🛡️', description: 'A heavily armored golem forged from enchanted iron, nearly impervious to physical attacks.', minDamage: 25, maxDamage: 50, deactivateDifficulty: 4, chamber: 'golem_forge' },
  { id: 'golem_obsidian', type: 'obsidian_beast', name: 'Obsidian Beast', emoji: ' 黑', description: 'A four-legged golem of volcanic glass that moves with predatory silence.', minDamage: 18, maxDamage: 38, deactivateDifficulty: 4, chamber: 'shadow_catacombs' },
  { id: 'golem_crystal', type: 'crystal_phalanx', name: 'Crystal Phalanx', emoji: '💎', description: 'A formation of interlocking crystal golems that refract light into blinding beams.', minDamage: 22, maxDamage: 45, deactivateDifficulty: 5, chamber: 'crystal_sanctum' },
  { id: 'golem_shadow', type: 'shadow_construct', name: 'Shadow Construct', emoji: '🌑', description: 'A golem made of solidified shadow that phases in and out of visibility.', minDamage: 20, maxDamage: 42, deactivateDifficulty: 5, chamber: 'shadow_catacombs' },
  { id: 'golem_ember', type: 'ember_colossus', name: 'Ember Colossus', emoji: '🔥', description: 'A massive golem with veins of molten orange light coursing through its stone body.', minDamage: 28, maxDamage: 55, deactivateDifficulty: 6, chamber: 'spell_vault' },
  { id: 'golem_void', type: 'void_gargoyle', name: 'Void Gargoyle', emoji: '👁️', description: 'A winged golem infused with void energy, capable of short-range teleportation.', minDamage: 24, maxDamage: 48, deactivateDifficulty: 6, chamber: 'rune_amphitheater' },
  { id: 'golem_rune', type: 'rune_golem', name: 'Rune Golem', emoji: '✍️', description: 'A golem covered in shifting runes that adapt its defenses in real time.', minDamage: 18, maxDamage: 40, deactivateDifficulty: 7, chamber: 'rune_amphitheater' },
  { id: 'golem_titan', type: 'ancient_titan', name: 'Ancient Titan', emoji: '⚔️', description: 'The largest and most powerful golem type, a remnant of the Elder civilization itself.', minDamage: 35, maxDamage: 70, deactivateDifficulty: 8, chamber: 'elders_nexus' },
]

// ══════════════════════════════════════════════════════════════════
// CORRUPTION EVENTS (10)
// ══════════════════════════════════════════════════════════════════

const AR_CORRUPTION_TEMPLATES: ARCorruptionEvent[] = [
  { id: 'corr_whisper', name: 'Void Whispers', emoji: '🗣️', severity: 'minor', description: 'Insidious voices fill your mind, clouding concentration and awareness.', vitalityPenalty: 0, shardPenalty: 0, xpPenalty: 5, durationTurns: 3, purifyCost: 50, chamber: 'crumbled_gate' },
  { id: 'corr_mana_leak', name: 'Mana Leak', emoji: '💧', severity: 'minor', description: 'Your magical reserves seep away through invisible cracks in your aura.', vitalityPenalty: 0, shardPenalty: 0, xpPenalty: 0, durationTurns: 4, purifyCost: 60, chamber: 'whispering_corridor' },
  { id: 'corr_shadow_bite', name: 'Shadow Bite', emoji: '🌑', severity: 'moderate', description: 'Shadow tendrils lash out from the darkness, draining your vitality.', vitalityPenalty: 15, shardPenalty: 0, xpPenalty: 10, durationTurns: 5, purifyCost: 150, chamber: 'shadow_catacombs' },
  { id: 'corr_rune_madness', name: 'Rune Madness', emoji: '🌀', severity: 'moderate', description: 'The runes around you spin and warp, causing disorientation and shard loss.', vitalityPenalty: 5, shardPenalty: 100, xpPenalty: 15, durationTurns: 0, purifyCost: 0, chamber: 'rune_amphitheater' },
  { id: 'corr_golem_backlash', name: 'Golem Backlash', emoji: '🗿', severity: 'moderate', description: 'A deactivated golem\'s residual magic lashes back at its controller.', vitalityPenalty: 5, shardPenalty: 50, xpPenalty: 20, durationTurns: 4, purifyCost: 200, chamber: 'golem_forge' },
  { id: 'corr_void_rot', name: 'Void Rot', emoji: '☠️', description: 'The void\'s touch causes your very essence to decay slowly.', severity: 'severe', vitalityPenalty: 30, shardPenalty: 0, xpPenalty: 25, durationTurns: 6, purifyCost: 500, chamber: 'shadow_catacombs' },
  { id: 'corr_silence', name: 'Arcane Silence', emoji: '🤫', severity: 'severe', description: 'Your ability to cast spells and decode runes is severely impaired.', vitalityPenalty: 10, shardPenalty: 0, xpPenalty: 40, durationTurns: 5, purifyCost: 400, chamber: 'rune_amphitheater' },
  { id: 'corr_shadow_bind', name: 'Shadow Bind', emoji: '⛓️', severity: 'severe', description: 'Dark chains materialize to restrict movement and drain energy.', vitalityPenalty: 20, shardPenalty: 100, xpPenalty: 30, durationTurns: 5, purifyCost: 600, chamber: 'shadow_catacombs' },
  { id: 'corr_nexus_malady', name: 'Nexus Sickness', emoji: '⚡', severity: 'severe', description: 'Proximity to raw nexus energy overwhelms your magical circuits.', vitalityPenalty: 40, shardPenalty: 200, xpPenalty: 50, durationTurns: 7, purifyCost: 800, chamber: 'elders_nexus' },
  { id: 'corr_void_taint', name: 'Void Taint', emoji: '🕳️', severity: 'void_taint', description: 'The most feared corruption: your soul begins merging with the void dimension itself.', vitalityPenalty: 60, shardPenalty: 500, xpPenalty: 100, durationTurns: 10, purifyCost: 2000, chamber: 'elders_nexus' },
]

// ══════════════════════════════════════════════════════════════════
// DAILY QUEST TEMPLATES
// ══════════════════════════════════════════════════════════════════

const AR_DAILY_QUEST_TYPES: ARDailyQuest['questType'][] = [
  'explore', 'deactivate', 'decode', 'construct', 'research',
]

const AR_DAILY_QUEST_TEMPLATES = [
  { name: 'Chamber Patrol', emoji: '🚶', description: 'Explore {target} ruin chambers', questType: 'explore' as const, target: 3, reward: { shards: 160, xp: 85, constructChance: 0.1 } },
  { name: 'Golem Clearance', emoji: '🗿', description: 'Deactivate {target} golem guardians', questType: 'deactivate' as const, target: 2, reward: { shards: 210, xp: 105, constructChance: 0.1 } },
  { name: 'Rune Scholar', emoji: '📝', description: 'Decode {target} spell fragments', questType: 'decode' as const, target: 2, reward: { shards: 260, xp: 130, constructChance: 0.15 } },
  { name: 'Construct Hunt', emoji: '🔮', description: 'Collect {target} arcane constructs', questType: 'construct' as const, target: 1, reward: { shards: 320, xp: 160, constructChance: 0.2 } },
  { name: 'Deep Research', emoji: '📖', description: 'Complete {target} full research sessions', questType: 'research' as const, target: 2, reward: { shards: 190, xp: 95, constructChance: 0.1 } },
]

// ══════════════════════════════════════════════════════════════════
// STATE FACTORY
// ══════════════════════════════════════════════════════════════════

function arCreateDefaultState(): ArcaneRuinsState {
  const structures: ARStructure[] = AR_STRUCTURE_TEMPLATES.map(s => ({
    ...s,
    level: 1,
    durability: s.maxDurability,
  }))
  const abilities: ARArcaneAbility[] = AR_ABILITY_TEMPLATES.map(a => ({
    ...a,
    isActive: false,
    currentCooldown: 0,
  }))
  const achievements: ARAchievement[] = AR_ACHIEVEMENT_TEMPLATES.map(a => ({
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
    shards: 100,
    totalShardsEarned: 100,
    arcanistName: 'Arcanist',
    title: 'Novice Wanderer',
    vitality: AR_BASE_VITALITY,
    maxVitality: AR_BASE_VITALITY,
    mana: AR_BASE_MANA,
    maxMana: AR_BASE_MANA,
    currentChamber: null,
    chambersVisited: [],
    chambersCleared: [],
    totalExplorations: 0,
    explorationDepth: 0,
    golemsEncountered: 0,
    golemsDeactivated: 0,
    golemsTriggered: 0,
    activeGolems: [],
    inventory: [],
    equippedConstructIds: [],
    totalConstructsCollected: 0,
    legendaryConstructsFound: 0,
    constructValueTotal: 0,
    fragmentsDecoded: [],
    fragmentsAttempted: 0,
    fragmentsFailed: 0,
    currentFragmentId: null,
    structures,
    activeStructureId: structures.length > 0 ? structures[0].id : null,
    abilities,
    activeAbilityIds: [],
    activeCorruptions: [],
    totalCorruptionsSuffered: 0,
    corruptionsPurified: 0,
    achievements,
    unlockedTitleIds: [AR_TITLES[0].id],
    dailyQuest: null,
    lastDailyDate: '',
    dailyStreak: 0,
    totalDamageTaken: 0,
    totalHealing: 0,
    totalManaUsed: 0,
    totalShardsSpent: 0,
    totalFragmentXpEarned: 0,
    totalConstructXpEarned: 0,
    eventLog: ['🏰 You stand before the crumbled gate of the arcane ruins, violet light pulsing from within.'],
    createdAt: Date.now(),
    lastSaveAt: Date.now(),
  }
}

// ══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════

function arRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function arRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function arClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function arPickRarity(): ARRarityTier {
  const totalWeight = AR_RARITIES.reduce((sum, r) => sum + r.weight, 0)
  let roll = Math.random() * totalWeight
  for (const rarity of AR_RARITIES) {
    roll -= rarity.weight
    if (roll <= 0) return rarity.name
  }
  return 'common'
}

function arGetRarityData(tier: ARRarityTier) {
  return AR_RARITIES.find(r => r.name === tier) ?? AR_RARITIES[0]
}

function arLoadState(): ArcaneRuinsState {
  if (typeof window === 'undefined') return arCreateDefaultState()
  try {
    const raw = localStorage.getItem(AR_SAVE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ArcaneRuinsState>
      const defaults = arCreateDefaultState()
      return { ...defaults, ...parsed }
    }
  } catch {
    // corrupted save — start fresh
  }
  return arCreateDefaultState()
}

function arSaveState(state: ArcaneRuinsState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AR_SAVE_KEY, JSON.stringify({ ...state, lastSaveAt: Date.now() }))
  } catch {
    // storage full or unavailable
  }
}

function arGenerateDailyQuest(): ARDailyQuest {
  const template = AR_DAILY_QUEST_TEMPLATES[arRandomInt(0, AR_DAILY_QUEST_TEMPLATES.length - 1)]
  const target = arRandomInt(Math.max(1, template.target - 1), template.target + 2)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  expiresAt.setHours(AR_DAILY_QUEST_RESET_HOUR, 0, 0, 0)
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

function arGetTodayString(): string {
  return new Date().toISOString().split('T')[0]
}

// ══════════════════════════════════════════════════════════════════
// THE HOOK — useArcaneRuins
// ══════════════════════════════════════════════════════════════════

export default function useArcaneRuins() {
  const [state, setState] = useState<ArcaneRuinsState>(arCreateDefaultState)
  const stateRef = useRef<ArcaneRuinsState>(state)

  // Sync ref on every state change via useEffect
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Hydrate from localStorage after mount
  useEffect(() => {
    const saved = arLoadState()
    setState(saved)
  }, [])

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      arSaveState(stateRef.current)
    }, AR_AUTO_SAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // ── Simple Getters ──────────────────────────────────────────

  const arGetLevel = useCallback((): number => state.level, [state])
  const arGetXp = useCallback((): number => state.xp, [state])
  const arGetTotalXp = useCallback((): number => state.totalXp, [state])
  const arGetShards = useCallback((): number => state.shards, [state])
  const arGetVitality = useCallback((): number => state.vitality, [state])
  const arGetMaxVitality = useCallback((): number => state.maxVitality, [state])
  const arGetMana = useCallback((): number => state.mana, [state])
  const arGetMaxMana = useCallback((): number => state.maxMana, [state])
  const arGetTitle = useCallback((): string => state.title, [state])
  const arGetArcanistName = useCallback((): string => state.arcanistName, [state])
  const arGetCurrentChamber = useCallback((): ARChamberId | null => state.currentChamber, [state])
  const arGetChambersVisited = useCallback((): ARChamberId[] => state.chambersVisited, [state])
  const arGetChambersCleared = useCallback((): ARChamberId[] => state.chambersCleared, [state])
  const arGetTotalExplorations = useCallback((): number => state.totalExplorations, [state])
  const arGetGolemsEncountered = useCallback((): number => state.golemsEncountered, [state])
  const arGetGolemsDeactivated = useCallback((): number => state.golemsDeactivated, [state])
  const arGetActiveGolems = useCallback((): ARGolemInstance[] => state.activeGolems, [state])
  const arGetInventory = useCallback((): ARInventorySlot[] => state.inventory, [state])
  const arGetEquippedConstructIds = useCallback((): string[] => state.equippedConstructIds, [state])
  const arGetTotalConstructsCollected = useCallback((): number => state.totalConstructsCollected, [state])
  const arGetLegendaryConstructsFound = useCallback((): number => state.legendaryConstructsFound, [state])
  const arGetFragmentsDecoded = useCallback((): string[] => state.fragmentsDecoded, [state])
  const arGetCurrentFragmentId = useCallback((): string | null => state.currentFragmentId, [state])
  const arGetStructures = useCallback((): ARStructure[] => state.structures, [state])
  const arGetActiveStructureId = useCallback((): string | null => state.activeStructureId, [state])
  const arGetAbilities = useCallback((): ARArcaneAbility[] => state.abilities, [state])
  const arGetActiveAbilityIds = useCallback((): string[] => state.activeAbilityIds, [state])
  const arGetActiveCorruptions = useCallback((): ARCorruptionEvent[] => state.activeCorruptions, [state])
  const arGetAchievements = useCallback((): ARAchievement[] => state.achievements, [state])
  const arGetUnlockedTitleIds = useCallback((): string[] => state.unlockedTitleIds, [state])
  const arGetDailyQuest = useCallback((): ARDailyQuest | null => state.dailyQuest, [state])
  const arGetDailyStreak = useCallback((): number => state.dailyStreak, [state])
  const arGetEventLog = useCallback((): string[] => state.eventLog, [state])
  const arGetState = useCallback((): ArcaneRuinsState => state, [state])

  // ── Derived / Computed Values ───────────────────────────────

  const arGetXpForNextLevel = useCallback((): number => {
    if (state.level >= AR_MAX_LEVEL) return 0
    return AR_XP_TABLE[state.level]
  }, [state])

  const arGetXpProgress = useCallback((): number => {
    if (state.level >= AR_MAX_LEVEL) return 1
    const needed = AR_XP_TABLE[state.level]
    return needed > 0 ? state.xp / needed : 0
  }, [state])

  const arGetVitalityPercent = useCallback((): number => {
    return state.maxVitality > 0 ? state.vitality / state.maxVitality : 0
  }, [state])

  const arGetManaPercent = useCallback((): number => {
    return state.maxMana > 0 ? state.mana / state.maxMana : 0
  }, [state])

  const arGetAccessibleChambers = useCallback((): ARChamber[] => {
    return AR_CHAMBERS.filter(c => c.requiredLevel <= state.level)
  }, [state])

  const arGetCurrentChamberData = useCallback((): ARChamber | null => {
    if (!state.currentChamber) return null
    return AR_CHAMBERS.find(c => c.id === state.currentChamber) ?? null
  }, [state])

  const arGetConstructsByChamber = useCallback((chamberId: ARChamberId): ARConstruct[] => {
    return AR_CONSTRUCTS.filter(c => c.chamber === chamberId)
  }, [])

  const arGetFragmentsByChamber = useCallback((chamberId: ARChamberId): ARSpellFragment[] => {
    return AR_FRAGMENTS.filter(f => f.chamber === chamberId)
  }, [])

  const arGetActiveStructureData = useCallback((): ARStructure | null => {
    if (!state.activeStructureId) return null
    return state.structures.find(s => s.id === state.activeStructureId) ?? null
  }, [state])

  const arGetAvailableAbilities = useCallback((): ARArcaneAbility[] => {
    return state.abilities.filter(a => a.levelReq <= state.level && a.currentCooldown <= 0)
  }, [state])

  const arGetInventoryValue = useCallback((): number => {
    let total = 0
    for (const slot of state.inventory) {
      const construct = AR_CONSTRUCTS.find(c => c.id === slot.constructId)
      if (construct) {
        const rarityData = arGetRarityData(construct.rarity)
        total += Math.floor(construct.baseValue * rarityData.shardMult * slot.quantity)
      }
    }
    return total
  }, [state])

  const arGetChamberById = useCallback((id: string): ARChamber | null => {
    return AR_CHAMBERS.find(c => c.id === id) ?? null
  }, [])

  const arGetConstructById = useCallback((id: string): ARConstruct | null => {
    return AR_CONSTRUCTS.find(c => c.id === id) ?? null
  }, [])

  const arGetFragmentById = useCallback((id: string): ARSpellFragment | null => {
    return AR_FRAGMENTS.find(f => f.id === id) ?? null
  }, [])

  const arGetAbilityById = useCallback((id: string): ARArcaneAbility | null => {
    return state.abilities.find(a => a.id === id) ?? null
  }, [state])

  // ── Static data accessors ───────────────────────────────────

  const arGetAllChambers = useCallback((): ARChamber[] => AR_CHAMBERS, [])
  const arGetAllConstructs = useCallback((): ARConstruct[] => AR_CONSTRUCTS, [])
  const arGetAllFragments = useCallback((): ARSpellFragment[] => AR_FRAGMENTS, [])
  const arGetAllTitles = useCallback((): ARTitle[] => AR_TITLES, [])
  const arGetAllRarities = useCallback((): typeof AR_RARITIES => AR_RARITIES, [])
  const arGetGolemTemplates = useCallback((): Omit<ARGolemInstance, 'deactivated' | 'triggered'>[] => AR_GOLEM_TEMPLATES, [])
  const arGetCorruptionTemplates = useCallback((): ARCorruptionEvent[] => AR_CORRUPTION_TEMPLATES, [])

  // ── XP & Leveling ───────────────────────────────────────────

  const arAddXp = useCallback((amount: number) => {
    setState(prev => {
      let newXp = prev.xp + amount
      let newLevel = prev.level
      let newMaxVitality = prev.maxVitality
      let newMaxMana = prev.maxMana

      while (newLevel < AR_MAX_LEVEL && newXp >= AR_XP_TABLE[newLevel]) {
        newXp -= AR_XP_TABLE[newLevel]
        newLevel += 1
        newMaxVitality = AR_BASE_VITALITY + newLevel * AR_VITALITY_PER_LEVEL
        newMaxMana = AR_BASE_MANA + newLevel * AR_MANA_PER_LEVEL
      }

      if (newLevel >= AR_MAX_LEVEL) {
        newXp = 0
      }

      const newUnlockedTitles = [...prev.unlockedTitleIds]
      for (const title of AR_TITLES) {
        if (newLevel >= title.levelReq && !newUnlockedTitles.includes(title.id)) {
          newUnlockedTitles.push(title.id)
        }
      }

      const highestTitle = [...AR_TITLES]
        .filter(t => newUnlockedTitles.includes(t.id))
        .sort((a, b) => b.levelReq - a.levelReq)[0]
      const newTitle = highestTitle ? highestTitle.name : prev.title

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        totalXp: prev.totalXp + amount,
        maxVitality: newMaxVitality,
        maxMana: newMaxMana,
        vitality: Math.min(prev.vitality, newMaxVitality),
        mana: Math.min(prev.mana, newMaxMana),
        unlockedTitleIds: newUnlockedTitles,
        title: newTitle,
        eventLog: [...prev.eventLog.slice(-99), `⭐ Gained ${amount} XP! (Level ${newLevel})`],
      }
    })
  }, [])

  // ── Shards ──────────────────────────────────────────────────

  const arAddShards = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      shards: arClamp(prev.shards + amount, 0, AR_MAX_SHARDS),
      totalShardsEarned: prev.totalShardsEarned + amount,
      eventLog: [...prev.eventLog.slice(-99), `💰 +${amount} shards`],
    }))
  }, [])

  const arSpendShards = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.shards < amount) return prev
      success = true
      return {
        ...prev,
        shards: prev.shards - amount,
        totalShardsSpent: prev.totalShardsSpent + amount,
        eventLog: [...prev.eventLog.slice(-99), `💸 -${amount} shards`],
      }
    })
    return success
  }, [])

  // ── Vitality & Mana ─────────────────────────────────────────

  const arTakeDamage = useCallback((amount: number) => {
    setState(prev => {
      const newVitality = arClamp(prev.vitality - amount, 0, prev.maxVitality)
      return {
        ...prev,
        vitality: newVitality,
        totalDamageTaken: prev.totalDamageTaken + amount,
        eventLog: [...prev.eventLog.slice(-99), `💔 Took ${amount} damage! (HP: ${newVitality}/${prev.maxVitality})`],
      }
    })
  }, [])

  const arHeal = useCallback((amount: number) => {
    setState(prev => {
      const oldVitality = prev.vitality
      const newVitality = arClamp(prev.vitality + amount, 0, prev.maxVitality)
      const actualHeal = newVitality - oldVitality
      return {
        ...prev,
        vitality: newVitality,
        totalHealing: prev.totalHealing + actualHeal,
        eventLog: [...prev.eventLog.slice(-99), `💚 Healed ${actualHeal} HP! (HP: ${newVitality}/${prev.maxVitality})`],
      }
    })
  }, [])

  const arFullHeal = useCallback(() => {
    setState(prev => {
      const oldVitality = prev.vitality
      const actualHeal = prev.maxVitality - oldVitality
      return {
        ...prev,
        vitality: prev.maxVitality,
        totalHealing: prev.totalHealing + actualHeal,
        eventLog: [...prev.eventLog.slice(-99), `💚 Fully healed! (+${actualHeal} HP)`],
      }
    })
  }, [])

  const arUseMana = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.mana < amount) return prev
      success = true
      return {
        ...prev,
        mana: prev.mana - amount,
        totalManaUsed: prev.totalManaUsed + amount,
      }
    })
    return success
  }, [])

  const arRegenMana = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      mana: arClamp(prev.mana + amount, 0, prev.maxMana),
    }))
  }, [])

  const arFullManaRestore = useCallback(() => {
    setState(prev => ({
      ...prev,
      mana: prev.maxMana,
    }))
  }, [])

  // ── Chamber Navigation ──────────────────────────────────────

  const arEnterChamber = useCallback((chamberId: ARChamberId) => {
    setState(prev => {
      const chamber = AR_CHAMBERS.find(c => c.id === chamberId)
      if (!chamber || prev.level < chamber.requiredLevel) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `🚫 Cannot enter ${chamber ? chamber.name : 'unknown'} — level requirement not met.`],
        }
      }
      const newVisited = prev.chambersVisited.includes(chamberId)
        ? prev.chambersVisited
        : [...prev.chambersVisited, chamberId]

      // Generate golems for the chamber
      const chamberGolems = AR_GOLEM_TEMPLATES.filter(g => g.chamber === chamberId)
      const numGolems = chamber.golemChance > 0 ? arRandomInt(1, Math.min(3, chamberGolems.length)) : 0
      const newActiveGolems: ARGolemInstance[] = []
      for (let i = 0; i < numGolems; i++) {
        const template = chamberGolems[arRandomInt(0, chamberGolems.length - 1)]
        newActiveGolems.push({ ...template, deactivated: false, triggered: false })
      }

      return {
        ...prev,
        currentChamber: chamberId,
        chambersVisited: newVisited,
        activeGolems: newActiveGolems,
        totalExplorations: prev.totalExplorations + 1,
        explorationDepth: chamber.depth,
        eventLog: [...prev.eventLog.slice(-99), `${chamber.emoji} Entered ${chamber.name} — depth ${chamber.depth}`],
      }
    })
  }, [])

  const arLeaveChamber = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentChamber: null,
      activeGolems: [],
      eventLog: [...prev.eventLog.slice(-99), '🔙 Left the chamber and returned to the ruins entrance.'],
    }))
  }, [])

  const arClearChamber = useCallback((chamberId: ARChamberId) => {
    const chamber = AR_CHAMBERS.find(c => c.id === chamberId)
    if (!chamber) return
    setState(prev => {
      if (prev.chambersCleared.includes(chamberId)) return prev
      const shardReward = arRandomInt(chamber.shardRewardRange[0], chamber.shardRewardRange[1])
      const xpReward = arRandomInt(chamber.xpRewardRange[0], chamber.xpRewardRange[1])
      return {
        ...prev,
        chambersCleared: [...prev.chambersCleared, chamberId],
        shards: arClamp(prev.shards + shardReward, 0, AR_MAX_SHARDS),
        totalShardsEarned: prev.totalShardsEarned + shardReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        eventLog: [...prev.eventLog.slice(-99), `🏆 Chamber cleared: ${chamber.name}! +${shardReward}💰 +${xpReward}⭐`],
      }
    })
  }, [])

  // ── Golem System ────────────────────────────────────────────

  const arDeactivateGolem = useCallback((golemId: string): boolean => {
    let success = false
    setState(prev => {
      const golemIndex = prev.activeGolems.findIndex(g => g.id === golemId)
      if (golemIndex === -1 || prev.activeGolems[golemIndex].deactivated) return prev
      const golem = prev.activeGolems[golemIndex]
      const structureData = prev.activeStructureId
        ? prev.structures.find(s => s.id === prev.activeStructureId)
        : null
      const structBonus = structureData ? structureData.precision * 20 : 0
      const roll = Math.random() * 100 + structBonus
      if (roll < golem.deactivateDifficulty * 15) {
        // Failed deactivation — golem triggers
        const damage = arRandomInt(golem.minDamage, golem.maxDamage)
        success = false
        const newGolems = [...prev.activeGolems]
        newGolems[golemIndex] = { ...golem, triggered: true }
        return {
          ...prev,
          activeGolems: newGolems,
          vitality: arClamp(prev.vitality - damage, 0, prev.maxVitality),
          golemsTriggered: prev.golemsTriggered + 1,
          golemsEncountered: prev.golemsEncountered + 1,
          totalDamageTaken: prev.totalDamageTaken + damage,
          eventLog: [...prev.eventLog.slice(-99), `💥 Failed to deactivate ${golem.name}! Took ${damage} damage!`],
        }
      }
      success = true
      const newGolems = [...prev.activeGolems]
      newGolems[golemIndex] = { ...golem, deactivated: true }
      return {
        ...prev,
        activeGolems: newGolems,
        golemsDeactivated: prev.golemsDeactivated + 1,
        golemsEncountered: prev.golemsEncountered + 1,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Successfully deactivated ${golem.name}!`],
      }
    })
    return success
  }, [])

  const arTriggerRandomGolem = useCallback((): ARGolemInstance | null => {
    let triggered: ARGolemInstance | null = null
    setState(prev => {
      const undisarmed = prev.activeGolems.filter(g => !g.deactivated && !g.triggered)
      if (undisarmed.length === 0) return prev
      const golem = undisarmed[arRandomInt(0, undisarmed.length - 1)]
      const damage = arRandomInt(golem.minDamage, golem.maxDamage)
      triggered = { ...golem, triggered: true }
      const newGolems = prev.activeGolems.map(g =>
        g.id === golem.id ? { ...g, triggered: true } : g
      )
      return {
        ...prev,
        activeGolems: newGolems,
        vitality: arClamp(prev.vitality - damage, 0, prev.maxVitality),
        golemsTriggered: prev.golemsTriggered + 1,
        golemsEncountered: prev.golemsEncountered + 1,
        totalDamageTaken: prev.totalDamageTaken + damage,
        eventLog: [...prev.eventLog.slice(-99), `💥 ${golem.name} triggered! Took ${damage} damage!`],
      }
    })
    return triggered
  }, [])

  // ── Construct Collection ────────────────────────────────────

  const arCollectConstruct = useCallback((constructId: string): boolean => {
    let collected = false
    setState(prev => {
      const construct = AR_CONSTRUCTS.find(c => c.id === constructId)
      if (!construct) return prev
      if (prev.inventory.length >= AR_MAX_INVENTORY_SIZE) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `🎒 Inventory full! Cannot collect ${construct.name}.`],
        }
      }

      const existingSlot = prev.inventory.find(s => s.constructId === constructId)
      const rarityData = arGetRarityData(construct.rarity)
      const xpReward = Math.floor(construct.xpReward * rarityData.xpMult)

      // Check for corruption
      const corruptionRoll = Math.random()
      let newCorruptions = prev.activeCorruptions
      let newCorruptionLog = ''
      if (corruptionRoll < construct.corruptionChance) {
        const corruption = AR_CORRUPTION_TEMPLATES[arRandomInt(0, AR_CORRUPTION_TEMPLATES.length - 1)]
        newCorruptions = [...prev.activeCorruptions, { ...corruption }]
        newCorruptionLog = ` | ⚠️ CORRUPTED: ${corruption.name}!`
      }

      let newInventory: ARInventorySlot[]
      if (existingSlot) {
        newInventory = prev.inventory.map(s =>
          s.constructId === constructId
            ? { ...s, quantity: s.quantity + 1, acquiredAt: Date.now() }
            : s
        )
      } else {
        newInventory = [
          ...prev.inventory,
          { constructId, acquiredAt: Date.now(), equipped: false, quantity: 1 },
        ]
      }

      collected = true
      const isLegendary = construct.rarity === 'legendary'

      return {
        ...prev,
        inventory: newInventory,
        totalConstructsCollected: prev.totalConstructsCollected + 1,
        legendaryConstructsFound: isLegendary ? prev.legendaryConstructsFound + 1 : prev.legendaryConstructsFound,
        constructValueTotal: prev.constructValueTotal + construct.baseValue,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        totalConstructXpEarned: prev.totalConstructXpEarned + xpReward,
        activeCorruptions: newCorruptions,
        totalCorruptionsSuffered: newCorruptions.length > prev.activeCorruptions.length ? prev.totalCorruptionsSuffered + 1 : prev.totalCorruptionsSuffered,
        eventLog: [
          ...prev.eventLog.slice(-99),
          `${construct.emoji} Found ${construct.name} (${rarityData.name})! +${xpReward} XP${newCorruptionLog}`,
        ],
      }
    })
    return collected
  }, [])

  const arEquipConstruct = useCallback((constructId: string) => {
    setState(prev => {
      const slot = prev.inventory.find(s => s.constructId === constructId)
      if (!slot || slot.equipped) return prev
      const newInventory = prev.inventory.map(s =>
        s.constructId === constructId ? { ...s, equipped: true } : s
      )
      const newEquipped = prev.equippedConstructIds.includes(constructId)
        ? prev.equippedConstructIds
        : [...prev.equippedConstructIds, constructId]
      return {
        ...prev,
        inventory: newInventory,
        equippedConstructIds: newEquipped,
        eventLog: [...prev.eventLog.slice(-99), `✨ Equipped: ${AR_CONSTRUCTS.find(c => c.id === constructId)?.name ?? constructId}`],
      }
    })
  }, [])

  const arUnequipConstruct = useCallback((constructId: string) => {
    setState(prev => {
      const newInventory = prev.inventory.map(s =>
        s.constructId === constructId ? { ...s, equipped: false } : s
      )
      return {
        ...prev,
        inventory: newInventory,
        equippedConstructIds: prev.equippedConstructIds.filter(id => id !== constructId),
      }
    })
  }, [])

  // ── Spell Fragment Solving ──────────────────────────────────

  const arStartFragment = useCallback((fragmentId: string): boolean => {
    let started = false
    setState(prev => {
      if (prev.fragmentsDecoded.includes(fragmentId)) return prev
      const fragment = AR_FRAGMENTS.find(f => f.id === fragmentId)
      if (!fragment || !prev.currentChamber) return prev
      started = true
      return {
        ...prev,
        currentFragmentId: fragmentId,
        fragmentsAttempted: prev.fragmentsAttempted + 1,
        eventLog: [...prev.eventLog.slice(-99), `${fragment.emoji} Fragment started: ${fragment.name}`],
      }
    })
    return started
  }, [])

  const arSolveFragment = useCallback((fragmentId: string, answer: string): boolean => {
    let correct = false
    setState(prev => {
      const fragment = AR_FRAGMENTS.find(f => f.id === fragmentId)
      if (!fragment) return prev
      const isCorrect = answer.trim().toLowerCase() === fragment.answer.toLowerCase()

      if (isCorrect) {
        const structureData = prev.activeStructureId
          ? prev.structures.find(s => s.id === prev.activeStructureId)
          : null
        const structBonus = structureData && structureData.category === 'rune_decoding'
          ? Math.floor(fragment.xpReward * structureData.efficiency * 0.5)
          : 0
        const totalXpReward = fragment.xpReward + structBonus
        correct = true

        return {
          ...prev,
          currentFragmentId: null,
          fragmentsDecoded: [...prev.fragmentsDecoded, fragmentId],
          shards: arClamp(prev.shards + fragment.shardReward, 0, AR_MAX_SHARDS),
          totalShardsEarned: prev.totalShardsEarned + fragment.shardReward,
          xp: prev.xp + totalXpReward,
          totalXp: prev.totalXp + totalXpReward,
          totalFragmentXpEarned: prev.totalFragmentXpEarned + totalXpReward,
          eventLog: [
            ...prev.eventLog.slice(-99),
            `✅ Correct! Decoded "${fragment.name}" — +${totalXpReward} XP, +${fragment.shardReward}💰`,
          ],
        }
      }

      return {
        ...prev,
        currentFragmentId: null,
        fragmentsFailed: prev.fragmentsFailed + 1,
        eventLog: [...prev.eventLog.slice(-99), `❌ Wrong answer for "${fragment.name}". The correct answer was: ${fragment.answer}`],
      }
    })
    return correct
  }, [])

  const arCancelFragment = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentFragmentId: null,
      eventLog: [...prev.eventLog.slice(-99), '❌ Fragment decoding cancelled.'],
    }))
  }, [])

  // ── Corruption System ───────────────────────────────────────

  const arPurifyCorruption = useCallback((corruptionId: string): boolean => {
    let purified = false
    setState(prev => {
      const corruption = prev.activeCorruptions.find(c => c.id === corruptionId)
      if (!corruption) return prev
      if (prev.shards < corruption.purifyCost) {
        return {
          ...prev,
          eventLog: [...prev.eventLog.slice(-99), `💸 Not enough shards to purify ${corruption.name}. Need ${corruption.purifyCost}💰`],
        }
      }
      purified = true
      return {
        ...prev,
        activeCorruptions: prev.activeCorruptions.filter(c => c.id !== corruptionId),
        shards: prev.shards - corruption.purifyCost,
        totalShardsSpent: prev.totalShardsSpent + corruption.purifyCost,
        corruptionsPurified: prev.corruptionsPurified + 1,
        eventLog: [...prev.eventLog.slice(-99), `✨ Purified: ${corruption.name}! (-${corruption.purifyCost}💰)`],
      }
    })
    return purified
  }, [])

  const arTickCorruptions = useCallback(() => {
    setState(prev => {
      if (prev.activeCorruptions.length === 0) return prev
      const remaining = prev.activeCorruptions
        .map(c => ({ ...c, durationTurns: c.durationTurns - 1 }))
        .filter(c => c.durationTurns > 0 || c.shardPenalty > 0 || c.vitalityPenalty > 0)

      const vitalityLoss = remaining.reduce((sum, c) => sum + c.vitalityPenalty, 0)
      const xpLoss = remaining.reduce((sum, c) => sum + c.xpPenalty, 0)

      return {
        ...prev,
        activeCorruptions: remaining.filter(c => c.durationTurns > 0),
        vitality: arClamp(prev.vitality - vitalityLoss, 0, prev.maxVitality),
        totalDamageTaken: prev.totalDamageTaken + vitalityLoss,
        xp: Math.max(0, prev.xp - xpLoss),
        totalXp: Math.max(0, prev.totalXp - xpLoss),
      }
    })
  }, [])

  // ── Structure Management ────────────────────────────────────

  const arSetActiveStructure = useCallback((structureId: string) => {
    setState(prev => ({
      ...prev,
      activeStructureId: structureId,
    }))
  }, [])

  const arUpgradeStructure = useCallback((structureId: string): boolean => {
    let upgraded = false
    setState(prev => {
      const structIndex = prev.structures.findIndex(s => s.id === structureId)
      if (structIndex === -1) return prev
      const structure = prev.structures[structIndex]
      if (structure.level >= structure.maxLevel) return prev
      if (prev.shards < structure.upgradeCost) return prev
      upgraded = true
      const newStructures = [...prev.structures]
      newStructures[structIndex] = {
        ...structure,
        level: structure.level + 1,
        efficiency: Math.min(1, structure.efficiency + 0.1),
        precision: Math.min(1, structure.precision + 0.05),
        maxDurability: Math.floor(structure.maxDurability * 1.15),
        upgradeCost: Math.floor(structure.upgradeCost * 1.5),
        repairCost: Math.floor(structure.repairCost * 1.2),
      }
      return {
        ...prev,
        structures: newStructures,
        shards: prev.shards - structure.upgradeCost,
        totalShardsSpent: prev.totalShardsSpent + structure.upgradeCost,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Upgraded ${structure.name} to level ${structure.level + 1}!`],
      }
    })
    return upgraded
  }, [])

  const arRepairStructure = useCallback((structureId: string): boolean => {
    let repaired = false
    setState(prev => {
      const structIndex = prev.structures.findIndex(s => s.id === structureId)
      if (structIndex === -1) return prev
      const structure = prev.structures[structIndex]
      const missingDurability = structure.maxDurability - structure.durability
      if (missingDurability <= 0) return prev
      const cost = Math.max(1, Math.floor(structure.repairCost * AR_STRUCTURE_REPAIR_MULT * (missingDurability / structure.maxDurability)))
      if (prev.shards < cost) return prev
      repaired = true
      const newStructures = [...prev.structures]
      newStructures[structIndex] = { ...structure, durability: structure.maxDurability }
      return {
        ...prev,
        structures: newStructures,
        shards: prev.shards - cost,
        totalShardsSpent: prev.totalShardsSpent + cost,
        eventLog: [...prev.eventLog.slice(-99), `🔧 Repaired ${structure.name}! (-${cost}💰)`],
      }
    })
    return repaired
  }, [])

  const arUseStructureDurability = useCallback((structureId: string, amount: number) => {
    setState(prev => {
      const newStructures = prev.structures.map(s =>
        s.id === structureId ? { ...s, durability: Math.max(0, s.durability - amount) } : s
      )
      return { ...prev, structures: newStructures }
    })
  }, [])

  // ── Ability System ──────────────────────────────────────────

  const arActivateAbility = useCallback((abilityId: string): boolean => {
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

  const arTickAbilities = useCallback(() => {
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

  const arDeactivateAbility = useCallback((abilityId: string) => {
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

  const arCheckAchievements = useCallback(() => {
    setState(prev => {
      const newAchievements = [...prev.achievements]
      let changed = false

      const checkCondition = (condition: string): boolean => {
        switch (condition) {
          case 'enter_ruins': return prev.totalExplorations >= 1
          case 'collect_1_construct': return prev.totalConstructsCollected >= 1
          case 'collect_10_constructs': return prev.totalConstructsCollected >= 10
          case 'collect_25_constructs': return prev.totalConstructsCollected >= 25
          case 'decode_1_fragment': return prev.fragmentsDecoded.length >= 1
          case 'decode_10_fragments': return prev.fragmentsDecoded.length >= 10
          case 'deactivate_1_golem': return prev.golemsDeactivated >= 1
          case 'deactivate_20_golems': return prev.golemsDeactivated >= 20
          case 'survive_1_corruption': return prev.corruptionsPurified >= 1
          case 'purify_5_corruptions': return prev.corruptionsPurified >= 5
          case 'find_legendary': return prev.legendaryConstructsFound >= 1
          case 'clear_1_chamber': return prev.chambersCleared.length >= 1
          case 'clear_all_chambers': return prev.chambersCleared.length >= AR_CHAMBERS.length
          case 'reach_level_10': return prev.level >= 10
          case 'reach_level_25': return prev.level >= 25
          case 'reach_level_50': return prev.level >= 50
          case 'earn_10k_shards': return prev.totalShardsEarned >= 10000
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
        a => `🏆 Achievement unlocked: ${a.emoji} ${a.name}! +${a.reward.shards}💰 +${a.reward.xp}⭐`
      )

      const totalRewardShards = newlyUnlocked.reduce((sum, a) => sum + a.reward.shards, 0)
      const totalRewardXp = newlyUnlocked.reduce((sum, a) => sum + a.reward.xp, 0)

      return {
        ...prev,
        achievements: newAchievements,
        shards: arClamp(prev.shards + totalRewardShards, 0, AR_MAX_SHARDS),
        totalShardsEarned: prev.totalShardsEarned + totalRewardShards,
        xp: prev.xp + totalRewardXp,
        totalXp: prev.totalXp + totalRewardXp,
        eventLog: [...prev.eventLog.slice(-(100 - logEntries.length)), ...logEntries],
      }
    })
  }, [])

  // ── Daily Quest System ──────────────────────────────────────

  const arCheckDailyQuest = useCallback(() => {
    const today = arGetTodayString()
    if (state.lastDailyDate === today) return

    setState(prev => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const streakContinuation = prev.lastDailyDate === yesterdayStr
      const newStreak = streakContinuation ? prev.dailyStreak + 1 : 1

      return {
        ...prev,
        dailyQuest: arGenerateDailyQuest(),
        lastDailyDate: today,
        dailyStreak: newStreak,
        eventLog: [
          ...prev.eventLog.slice(-99),
          `📋 New daily quest! (Day streak: ${newStreak}🔥)`,
        ],
      }
    })
  }, [state])

  const arAdvanceDailyQuest = useCallback((questType: ARDailyQuest['questType'], amount: number = 1) => {
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
          shards: arClamp(prev.shards + updatedQuest.reward.shards, 0, AR_MAX_SHARDS),
          totalShardsEarned: prev.totalShardsEarned + updatedQuest.reward.shards,
          xp: prev.xp + updatedQuest.reward.xp,
          totalXp: prev.totalXp + updatedQuest.reward.xp,
          eventLog: [
            ...prev.eventLog.slice(-99),
            `📋 Daily quest completed: ${updatedQuest.name}! +${updatedQuest.reward.shards}💰 +${updatedQuest.reward.xp}⭐`,
          ],
        }
      }

      return {
        ...prev,
        dailyQuest: updatedQuest,
      }
    })
  }, [])

  // ── Arcanist Name ───────────────────────────────────────────

  const arSetArcanistName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      arcanistName: name,
      eventLog: [...prev.eventLog.slice(-99), `📛 Arcanist renamed to: ${name}`],
    }))
  }, [])

  // ── Title Selection ─────────────────────────────────────────

  const arSetTitle = useCallback((titleId: string) => {
    setState(prev => {
      if (!prev.unlockedTitleIds.includes(titleId)) return prev
      const title = AR_TITLES.find(t => t.id === titleId)
      if (!title) return prev
      return {
        ...prev,
        title: title.name,
        eventLog: [...prev.eventLog.slice(-99), `${title.emoji} Title changed to: ${title.name}`],
      }
    })
  }, [])

  // ── Random Construct Discovery ──────────────────────────────

  const arDiscoverRandomConstruct = useCallback((): ARConstruct | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AR_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    if (Math.random() > chamberData.constructChance) return null

    const chamberConstructs = AR_CONSTRUCTS.filter(c => c.chamber === chamber)
    if (chamberConstructs.length === 0) return null

    // Weighted rarity selection
    const rarity = arPickRarity()
    const matchingConstructs = chamberConstructs.filter(c => c.rarity === rarity)
    const pool = matchingConstructs.length > 0 ? matchingConstructs : chamberConstructs
    const selected = pool[arRandomInt(0, pool.length - 1)]

    arCollectConstruct(selected.id)
    arCheckAchievements()

    return selected
  }, [state, arCollectConstruct, arCheckAchievements])

  // ── Random Fragment Generation ──────────────────────────────

  const arGetRandomFragmentForChamber = useCallback((): ARSpellFragment | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AR_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    if (Math.random() > chamberData.fragmentChance) return null

    const available = AR_FRAGMENTS.filter(
      f => f.chamber === chamber && !state.fragmentsDecoded.includes(f.id)
    )
    if (available.length === 0) return null

    return available[arRandomInt(0, available.length - 1)]
  }, [state])

  // ── Random Corruption Event ─────────────────────────────────

  const arCheckForCorruptionEvent = useCallback((): ARCorruptionEvent | null => {
    const chamber = state.currentChamber
    if (!chamber) return null
    const chamberData = AR_CHAMBERS.find(c => c.id === chamber)
    if (!chamberData) return null

    // Check if purify aura is active
    if (state.activeAbilityIds.includes('ab_purify_aura')) return null

    if (Math.random() > chamberData.corruptionChance) return null

    const corruptionPool = AR_CORRUPTION_TEMPLATES.filter(c => c.chamber === chamber)
    if (corruptionPool.length === 0) return null

    const corruption = corruptionPool[arRandomInt(0, corruptionPool.length - 1)]
    setState(prev => ({
      ...prev,
      activeCorruptions: [...prev.activeCorruptions, { ...corruption }],
      totalCorruptionsSuffered: prev.totalCorruptionsSuffered + 1,
      shards: Math.max(0, prev.shards - corruption.shardPenalty),
      vitality: arClamp(prev.vitality - corruption.vitalityPenalty, 0, prev.maxVitality),
      xp: Math.max(0, prev.xp - corruption.xpPenalty),
      totalDamageTaken: prev.totalDamageTaken + corruption.vitalityPenalty,
      eventLog: [...prev.eventLog.slice(-99), `⚠️ CORRUPTED: ${corruption.name}! ${corruption.description}`],
    }))
    return corruption
  }, [state])

  // ── Full Exploration Turn ───────────────────────────────────

  const arPerformExploration = useCallback((): void => {
    if (!stateRef.current.currentChamber) return
    if (stateRef.current.mana < 5) return

    setState(prev => {
      if (!prev.currentChamber || prev.mana < 5) return prev

      const chamberData = AR_CHAMBERS.find(c => c.id === prev.currentChamber)
      if (!chamberData) return prev

      const manaCost = 5
      const shardReward = arRandomInt(chamberData.shardRewardRange[0], chamberData.shardRewardRange[1])
      const xpReward = arRandomInt(chamberData.xpRewardRange[0], chamberData.xpRewardRange[1])

      return {
        ...prev,
        mana: prev.mana - manaCost,
        totalManaUsed: prev.totalManaUsed + manaCost,
        shards: arClamp(prev.shards + shardReward, 0, AR_MAX_SHARDS),
        totalShardsEarned: prev.totalShardsEarned + shardReward,
        xp: prev.xp + xpReward,
        totalXp: prev.totalXp + xpReward,
        eventLog: [...prev.eventLog.slice(-99), `🚶 Explored ${chamberData.name} — +${shardReward}💰 +${xpReward}⭐ (mana: ${prev.mana - manaCost}/${prev.maxMana})`],
      }
    })

    // Random encounters happen after exploration
    arDiscoverRandomConstruct()
    arCheckForCorruptionEvent()
    arCheckAchievements()
  }, [arDiscoverRandomConstruct, arCheckForCorruptionEvent, arCheckAchievements])

  // ── Save / Load / Reset ─────────────────────────────────────

  const arSave = useCallback(() => {
    arSaveState(stateRef.current)
  }, [])

  const arReset = useCallback(() => {
    setState(arCreateDefaultState())
  }, [])

  // ── Memoized constant lookups ───────────────────────────────

  const arChamberList = useMemo((): ARChamber[] => AR_CHAMBERS, [])
  const arConstructList = useMemo((): ARConstruct[] => AR_CONSTRUCTS, [])
  const arFragmentList = useMemo((): ARSpellFragment[] => AR_FRAGMENTS, [])
  const arTitleList = useMemo((): ARTitle[] => AR_TITLES, [])
  const arRarityList = useMemo((): typeof AR_RARITIES => AR_RARITIES, [])

  // ── Return everything as arAPI ──────────────────────────────

  const arAPI = {
    // State
    state,
    // Getters
    arGetLevel,
    arGetXp,
    arGetTotalXp,
    arGetShards,
    arGetVitality,
    arGetMaxVitality,
    arGetMana,
    arGetMaxMana,
    arGetTitle,
    arGetArcanistName,
    arGetCurrentChamber,
    arGetChambersVisited,
    arGetChambersCleared,
    arGetTotalExplorations,
    arGetGolemsEncountered,
    arGetGolemsDeactivated,
    arGetActiveGolems,
    arGetInventory,
    arGetEquippedConstructIds,
    arGetTotalConstructsCollected,
    arGetLegendaryConstructsFound,
    arGetFragmentsDecoded,
    arGetCurrentFragmentId,
    arGetStructures,
    arGetActiveStructureId,
    arGetAbilities,
    arGetActiveAbilityIds,
    arGetActiveCorruptions,
    arGetAchievements,
    arGetUnlockedTitleIds,
    arGetDailyQuest,
    arGetDailyStreak,
    arGetEventLog,
    arGetState,
    // Computed
    arGetXpForNextLevel,
    arGetXpProgress,
    arGetVitalityPercent,
    arGetManaPercent,
    arGetAccessibleChambers,
    arGetCurrentChamberData,
    arGetConstructsByChamber,
    arGetFragmentsByChamber,
    arGetActiveStructureData,
    arGetAvailableAbilities,
    arGetInventoryValue,
    arGetChamberById,
    arGetConstructById,
    arGetFragmentById,
    arGetAbilityById,
    // Static data
    arGetAllChambers,
    arGetAllConstructs,
    arGetAllFragments,
    arGetAllTitles,
    arGetAllRarities,
    arGetGolemTemplates,
    arGetCorruptionTemplates,
    // Memoized lists
    arChamberList,
    arConstructList,
    arFragmentList,
    arTitleList,
    arRarityList,
    // Actions
    arAddXp,
    arAddShards,
    arSpendShards,
    arTakeDamage,
    arHeal,
    arFullHeal,
    arUseMana,
    arRegenMana,
    arFullManaRestore,
    arEnterChamber,
    arLeaveChamber,
    arClearChamber,
    arDeactivateGolem,
    arTriggerRandomGolem,
    arCollectConstruct,
    arEquipConstruct,
    arUnequipConstruct,
    arStartFragment,
    arSolveFragment,
    arCancelFragment,
    arPurifyCorruption,
    arTickCorruptions,
    arSetActiveStructure,
    arUpgradeStructure,
    arRepairStructure,
    arUseStructureDurability,
    arActivateAbility,
    arTickAbilities,
    arDeactivateAbility,
    arCheckAchievements,
    arCheckDailyQuest,
    arAdvanceDailyQuest,
    arSetArcanistName,
    arSetTitle,
    arDiscoverRandomConstruct,
    arGetRandomFragmentForChamber,
    arCheckForCorruptionEvent,
    arPerformExploration,
    arSave,
    arReset,
  }

  return arAPI
}
