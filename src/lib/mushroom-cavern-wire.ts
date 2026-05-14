'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

/* ================================================================
   TYPES
   ================================================================ */

type McRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
type McMushroomType = 'edible' | 'medicinal' | 'magical' | 'toxic' | 'legendary'
type McCreatureType = 'passive' | 'neutral' | 'hostile' | 'boss'
type McHarvestMode = 'auto' | 'manual' | 'targeted'

interface McRarityInfo {
  id: McRarityTier
  name: string
  color: string
  glow: string
  xpMultiplier: number
  spawnWeight: number
}

interface McMushroom {
  id: string
  name: string
  type: McMushroomType
  rarity: McRarityTier
  habitat: string
  sporeColor: string
  glowIntensity: number
  xpReward: number
  description: string
  sellPrice: number
  potionIngredients: string[]
}

interface McCavern {
  id: string
  name: string
  depth: number
  description: string
  mushroomIds: string[]
  creatureIds: string[]
  requiredLevel: number
  dangerLevel: number
  ambientColor: string
  unlockCost: number
}

interface McCreature {
  id: string
  name: string
  type: McCreatureType
  hp: number
  damage: number
  xpReward: number
  description: string
  sporeDrop: string
  tameable: boolean
  tamedBonus: string
}

interface McPotion {
  id: string
  name: string
  description: string
  ingredients: { mushroomId: string; count: number }[]
  rarity: McRarityTier
  effect: string
  duration: number
  brewTime: number
  xpReward: number
  color: string
}

interface McTitle {
  id: string
  name: string
  requiredLevel: number
  description: string
  bonus: string
}

interface McAchievement {
  id: string
  name: string
  description: string
  condition: string
  reward: { type: string; value: number }
  icon: string
}

interface McCultivationSlot {
  id: string
  mushroomId: string | null
  plantedAt: number | null
  growthTime: number
  yieldMultiplier: number
}

interface McMyceliumNode {
  id: string
  cavernId: string
  strength: number
  maxStrength: number
  connectedNodes: string[]
  bonusType: string
  bonusValue: number
}

interface McBrewingStatus {
  potionId: string | null
  startedAt: number | null
  finishTime: number | null
  boosted: boolean
}

interface McInventoryItem {
  mushroomId: string
  count: number
}

interface McPotionItem {
  potionId: string
  count: number
}

interface McEquippedPotion {
  slot: number
  potionId: string | null
  remainingUses: number
}

interface McAchievementRecord {
  achievementId: string
  unlockedAt: number
}

interface McCreatureRecord {
  creatureId: string
  encountered: boolean
  tamed: boolean
  defeated: boolean
  feedCount: number
  lastFedAt: number
}

interface McHarvestRecord {
  mushroomId: string
  count: number
  lastHarvested: number
}

interface McCavernRecord {
  cavernId: string
  explored: boolean
  explorationPercent: number
  totalExplored: number
  bossDefeated: boolean
}

interface McActiveEffect {
  potionId: string
  name: string
  effect: string
  expiresAt: number
  strength: number
}

interface McTradeLog {
  timestamp: number
  type: 'sell' | 'buy' | 'brew'
  itemId: string
  itemName: string
  amount: number
  goldChange: number
  sporeChange: number
  xpGained: number
}

interface McGameState {
  level: number
  xp: number
  totalXp: number
  harvested: McHarvestRecord[]
  discovered: string[]
  inventory: McInventoryItem[]
  potions: McPotionItem[]
  equippedPotions: McEquippedPotion[]
  brewing: McBrewingStatus
  caverns: McCavernRecord[]
  creatures: McCreatureRecord[]
  achievements: McAchievementRecord[]
  cultivationSlots: McCultivationSlot[]
  myceliumNodes: McMyceliumNode[]
  sporeCount: number
  goldCount: number
  totalGoldEarned: number
  totalSporesEarned: number
  gardenSlots: number
  gardenLevel: number
  harvestMode: McHarvestMode
  targetMushroomId: string | null
  activeEffects: McActiveEffect[]
  lastSaveTime: number
  totalHarvested: number
  totalPotionsBrewed: number
  totalCultivated: number
  totalCavernExplored: number
  totalCreaturesTamed: number
  totalBossesDefeated: number
  playTimeMinutes: number
  sessionStartTime: number
  tradeLog: McTradeLog[]
  dailyHarvestStreak: number
  lastDailyHarvest: number
}

/* ================================================================
   CONSTANTS
   ================================================================ */

const MC_SAVE_KEY = 'mushroom-cavern-save'
const MC_MAX_LEVEL = 50
const MC_EQUIP_SLOTS = 3
const MC_MAX_NETWORK_STRENGTH = 100
const MC_CULTIVATION_BASE_TIME = 60000
const MC_NETWORK_EXPAND_COST_BASE = 100
const MC_AUTO_SAVE_INTERVAL = 30000
const MC_BREW_BOOST_MULTIPLIER = 2
const MC_EFFECT_CLEANUP_INTERVAL = 10000
const MC_DAILY_STREAK_WINDOW = 86400000
const MC_MAX_GARDEN_LEVEL = 9
const MC_TAME_FEED_COST = 10
const MC_TRADE_LOG_MAX = 100
const MC_BOSS_DEFEAT_BONUS_SPores = 25

const MC_GARDEN_UPGRADE_COSTS = [
  0, 200, 500, 1000, 2000, 4000, 8000, 15000, 25000, 50000,
]

const MC_RARITY: Record<McRarityTier, McRarityInfo> = {
  common: {
    id: 'common',
    name: 'Common',
    color: '#2dd4a0',
    glow: '#0fa87e',
    xpMultiplier: 1,
    spawnWeight: 50,
  },
  uncommon: {
    id: 'uncommon',
    name: 'Uncommon',
    color: '#a78bfa',
    glow: '#7c5ce0',
    xpMultiplier: 1.5,
    spawnWeight: 30,
  },
  rare: {
    id: 'rare',
    name: 'Rare',
    color: '#00cec9',
    glow: '#0984e3',
    xpMultiplier: 2.5,
    spawnWeight: 14,
  },
  epic: {
    id: 'epic',
    name: 'Epic',
    color: '#f472b6',
    glow: '#db2777',
    xpMultiplier: 4,
    spawnWeight: 5,
  },
  legendary: {
    id: 'legendary',
    name: 'Legendary',
    color: '#fbbf24',
    glow: '#f59e0b',
    xpMultiplier: 7,
    spawnWeight: 1,
  },
}

const MC_XP_TABLE: number[] = Array.from({ length: MC_MAX_LEVEL + 1 }, (_, i) =>
  i === 0 ? 0 : Math.floor(80 * Math.pow(i, 1.45) + i * 40),
)

const MC_SPORE_REWARDS: Record<McRarityTier, number> = {
  common: 1,
  uncommon: 3,
  rare: 8,
  epic: 20,
  legendary: 50,
}

/* ================================================================
   MUSHROOMS (37 species)
   ================================================================ */

const MC_MUSHROOMS: McMushroom[] = [
  {
    id: 'shiitake',
    name: 'Shiitake',
    type: 'edible',
    rarity: 'common',
    habitat: 'Spore Forest',
    sporeColor: '#d4c5a0',
    glowIntensity: 0,
    xpReward: 10,
    description: 'A staple edible mushroom with rich umami flavor found on fallen logs.',
    sellPrice: 5,
    potionIngredients: ['health-salve', 'stamina-brew', 'earthtonic'],
  },
  {
    id: 'reishi',
    name: 'Reishi',
    type: 'medicinal',
    rarity: 'uncommon',
    habitat: 'Ancient Garden',
    sporeColor: '#c0392b',
    glowIntensity: 0.2,
    xpReward: 25,
    description: 'The mushroom of immortality, prized for its immune-boosting properties.',
    sellPrice: 15,
    potionIngredients: ['vitality-elixir', 'longevity-serum', 'fortify-aura'],
  },
  {
    id: 'chanterelle',
    name: 'Chanterelle',
    type: 'edible',
    rarity: 'common',
    habitat: 'Spore Forest',
    sporeColor: '#f39c12',
    glowIntensity: 0,
    xpReward: 12,
    description: 'Golden chanterelles with a fruity aroma and peppery taste.',
    sellPrice: 8,
    potionIngredients: ['golden-luster', 'appetite-stim', 'sunburst-draft'],
  },
  {
    id: 'glowcap',
    name: 'Glowcap',
    type: 'magical',
    rarity: 'uncommon',
    habitat: 'Bioluminescent Bay',
    sporeColor: '#00ff88',
    glowIntensity: 0.9,
    xpReward: 30,
    description: 'Emits steady bioluminescent glow, used by cavern dwellers as torches.',
    sellPrice: 20,
    potionIngredients: ['light-elixir', 'glow-serum', 'night-vision-potion'],
  },
  {
    id: 'mindbender',
    name: 'Mindbender',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Fungal Maze',
    sporeColor: '#9b59b6',
    glowIntensity: 0.6,
    xpReward: 55,
    description: 'Psychoactive properties unlock hidden psychic potential in the consumer.',
    sellPrice: 45,
    potionIngredients: ['mind-sharpen', 'telepathy-tonic', 'dream-weaver-brew'],
  },
  {
    id: 'phoenix-fungus',
    name: 'Phoenix Fungus',
    type: 'legendary',
    rarity: 'legendary',
    habitat: 'Deep Root Chamber',
    sporeColor: '#e74c3c',
    glowIntensity: 1.0,
    xpReward: 200,
    description: 'Burns with eternal flame yet never turns to ash. Grants rebirth.',
    sellPrice: 500,
    potionIngredients: ['phoenix-rebirth', 'flameheart-elixir', 'inferno-resistance'],
  },
  {
    id: 'crystal-morel',
    name: 'Crystal Morel',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Crystal Grotto',
    sporeColor: '#74b9ff',
    glowIntensity: 0.7,
    xpReward: 60,
    description: 'Translucent cap refracts light into prismatic cascades. Hardy and beautiful.',
    sellPrice: 50,
    potionIngredients: ['prismatic-shield', 'clarity-draught', 'diamond-skin-potion'],
  },
  {
    id: 'shadow-toadstool',
    name: 'Shadow Toadstool',
    type: 'toxic',
    rarity: 'rare',
    habitat: 'Fungal Maze',
    sporeColor: '#2c3e50',
    glowIntensity: 0.4,
    xpReward: 50,
    description: 'Thrives in complete darkness. Spores induce vivid nightmares if inhaled.',
    sellPrice: 40,
    potionIngredients: ['shadow-cloak', 'nightmare-venom', 'darkvision-elixir'],
  },
  {
    id: 'thunder-truffle',
    name: 'Thunder Truffle',
    type: 'magical',
    rarity: 'epic',
    habitat: 'Underground Lake',
    sporeColor: '#f1c40f',
    glowIntensity: 0.5,
    xpReward: 100,
    description: 'Crackles with static electricity. Found only after subterranean storms.',
    sellPrice: 150,
    potionIngredients: ['lightning-brew', 'shock-therapy', 'stormheart-tonic'],
  },
  {
    id: 'dreamcap',
    name: 'Dreamcap',
    type: 'magical',
    rarity: 'uncommon',
    habitat: 'Bioluminescent Bay',
    sporeColor: '#a29bfe',
    glowIntensity: 0.3,
    xpReward: 35,
    description: 'Induces lucid dreams. Shamans use it to commune with the mycelial consciousness.',
    sellPrice: 25,
    potionIngredients: ['dream-well-potion', 'lucid-rest', 'prophet-sleep'],
  },
  {
    id: 'void-shroom',
    name: 'Void Shroom',
    type: 'toxic',
    rarity: 'epic',
    habitat: 'Mycelium Network',
    sporeColor: '#0d0d0d',
    glowIntensity: 0.1,
    xpReward: 120,
    description: 'Absorbs all light around it. Its mycelium extends into dimensions unseen.',
    sellPrice: 180,
    potionIngredients: ['void-walk-potion', 'abyssal-gaze', 'null-field-elixir'],
  },
  {
    id: 'star-mushroom',
    name: 'Star Mushroom',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Crystal Grotto',
    sporeColor: '#ffeaa7',
    glowIntensity: 0.8,
    xpReward: 65,
    description: 'Cap resembles a five-pointed star. Pulses with cosmic energy at midnight.',
    sellPrice: 55,
    potionIngredients: ['starfall-draught', 'cosmic-awareness', 'celestial-brew'],
  },
  {
    id: 'ember-fungi',
    name: 'Ember Fungi',
    type: 'medicinal',
    rarity: 'uncommon',
    habitat: 'Deep Root Chamber',
    sporeColor: '#e17055',
    glowIntensity: 0.5,
    xpReward: 28,
    description: 'Warm to the touch. Ground into powder, it mends internal injuries.',
    sellPrice: 18,
    potionIngredients: ['warming-salve', 'emberheart', 'inner-fire-potion'],
  },
  {
    id: 'frost-cap',
    name: 'Frost Cap',
    type: 'medicinal',
    rarity: 'uncommon',
    habitat: 'Underground Lake',
    sporeColor: '#dfe6e9',
    glowIntensity: 0.3,
    xpReward: 26,
    description: 'Perpetually covered in frost crystals. Lowers body temperature to soothe fevers.',
    sellPrice: 16,
    potionIngredients: ['frostbite-cure', 'chill-aura', 'ice-resistance'],
  },
  {
    id: 'golden-oyster',
    name: 'Golden Oyster',
    type: 'edible',
    rarity: 'common',
    habitat: 'Spore Forest',
    sporeColor: '#fdcb6e',
    glowIntensity: 0.1,
    xpReward: 14,
    description: 'Cascading shelves of golden gills. A delicacy among cavern dwellers.',
    sellPrice: 10,
    potionIngredients: ['wealth-attractor', 'gilded-shield', 'prosperity-brew'],
  },
  {
    id: 'sapphire-shelf',
    name: 'Sapphire Shelf',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Crystal Grotto',
    sporeColor: '#0984e3',
    glowIntensity: 0.6,
    xpReward: 58,
    description: 'Deep blue shelves that resonate with water magic near underground springs.',
    sellPrice: 48,
    potionIngredients: ['aqua-breath', 'sapphire-fortify', 'tidal-control'],
  },
  {
    id: 'ruby-bolete',
    name: 'Ruby Bolete',
    type: 'edible',
    rarity: 'uncommon',
    habitat: 'Spore Forest',
    sporeColor: '#d63031',
    glowIntensity: 0.2,
    xpReward: 22,
    description: 'Rich ruby-red cap with firm flesh. Said to strengthen the blood.',
    sellPrice: 14,
    potionIngredients: ['blood-iron', 'ruby-vigor', 'crimson-stamina'],
  },
  {
    id: 'amethyst-coral',
    name: 'Amethyst Coral',
    type: 'magical',
    rarity: 'epic',
    habitat: 'Bioluminescent Bay',
    sporeColor: '#6c5ce7',
    glowIntensity: 0.85,
    xpReward: 110,
    description: 'Branching purple coral-like fungus. Vibrates with arcane harmonics.',
    sellPrice: 160,
    potionIngredients: ['arcane-surge', 'amethyst-shield', 'resonance-brew'],
  },
  {
    id: 'jade-tuft',
    name: 'Jade Tuft',
    type: 'medicinal',
    rarity: 'common',
    habitat: 'Ancient Garden',
    sporeColor: '#00b894',
    glowIntensity: 0.15,
    xpReward: 15,
    description: 'Small emerald tufts that purify the air around them. Natural healers.',
    sellPrice: 8,
    potionIngredients: ['purify-essence', 'jade-recovery', 'toxin-cleanse'],
  },
  {
    id: 'copper-ring',
    name: 'Copper Ring',
    type: 'edible',
    rarity: 'common',
    habitat: 'Fungal Maze',
    sporeColor: '#b87333',
    glowIntensity: 0,
    xpReward: 11,
    description: 'Ring-shaped mushroom with a metallic sheen. Crunchy and nutty.',
    sellPrice: 6,
    potionIngredients: ['copper-defense', 'ring-fortify', 'metallic-mend'],
  },
  {
    id: 'spectral-wisp',
    name: 'Spectral Wisp',
    type: 'magical',
    rarity: 'epic',
    habitat: 'Mycelium Network',
    sporeColor: '#dfe6e9',
    glowIntensity: 0.95,
    xpReward: 115,
    description: 'Nearly transparent mushroom that floats above ground. Hauntingly beautiful.',
    sellPrice: 170,
    potionIngredients: ['spectral-pass', 'ghost-walk', 'ethereal-form'],
  },
  {
    id: 'ironcap',
    name: 'Ironcap',
    type: 'medicinal',
    rarity: 'uncommon',
    habitat: 'Fungal Maze',
    sporeColor: '#636e72',
    glowIntensity: 0,
    xpReward: 24,
    description: 'Incredibly dense mushroom cap. Used to brew fortification potions.',
    sellPrice: 13,
    potionIngredients: ['iron-skin', 'fortify-armor', 'stoneheart-draught'],
  },
  {
    id: 'silk-strand',
    name: 'Silk Strand',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Bioluminescent Bay',
    sporeColor: '#ffeef2',
    glowIntensity: 0.55,
    xpReward: 52,
    description: 'Thread-like mycelium strands that shimmer like spider silk. Enhances reflexes.',
    sellPrice: 42,
    potionIngredients: ['silk-reflex', 'thread-sight', 'weaver-draught'],
  },
  {
    id: 'lava-belly',
    name: 'Lava Belly',
    type: 'toxic',
    rarity: 'rare',
    habitat: 'Deep Root Chamber',
    sporeColor: '#ff7675',
    glowIntensity: 0.7,
    xpReward: 62,
    description: 'Grows near volcanic vents. Internal enzymes produce extreme heat.',
    sellPrice: 55,
    potionIngredients: ['heat-shield', 'lava-walk', 'magma-resistance'],
  },
  {
    id: 'moonlight-parasol',
    name: 'Moonlight Parasol',
    type: 'magical',
    rarity: 'epic',
    habitat: 'Ancient Garden',
    sporeColor: '#b2bec3',
    glowIntensity: 0.75,
    xpReward: 105,
    description: 'Only opens its cap under moonlight. Reflects beams in dazzling patterns.',
    sellPrice: 155,
    potionIngredients: ['moonbeam-shield', 'lunar-blessing', 'tide-control'],
  },
  {
    id: 'vermilion-tooth',
    name: 'Vermilion Tooth',
    type: 'toxic',
    rarity: 'uncommon',
    habitat: 'Spore Forest',
    sporeColor: '#e84393',
    glowIntensity: 0.15,
    xpReward: 20,
    description: 'Bright red teeth-like spines. Causes numbness but useful in small doses.',
    sellPrice: 12,
    potionIngredients: ['numb-touch', 'vermilion-antidote', 'pain-ease'],
  },
  {
    id: 'moss-beard',
    name: 'Moss Beard',
    type: 'edible',
    rarity: 'common',
    habitat: 'Ancient Garden',
    sporeColor: '#55a630',
    glowIntensity: 0,
    xpReward: 9,
    description: 'Draped in soft moss, this mushroom is tender and earthy with herbal notes.',
    sellPrice: 4,
    potionIngredients: ['moss-camouflage', 'beard-growth', 'nature-grip'],
  },
  {
    id: 'veil-puffball',
    name: 'Veil Puffball',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Underground Lake',
    sporeColor: '#a29bfe',
    glowIntensity: 0.45,
    xpReward: 48,
    description: 'Releases a shimmering spore veil when disturbed, creating temporary barriers.',
    sellPrice: 38,
    potionIngredients: ['veil-shield', 'spore-screen', 'mist-walk'],
  },
  {
    id: 'bloodcap',
    name: 'Bloodcap',
    type: 'toxic',
    rarity: 'epic',
    habitat: 'Deep Root Chamber',
    sporeColor: '#c0392b',
    glowIntensity: 0.4,
    xpReward: 95,
    description: 'Bleeds dark ichor when cut. Extremely toxic but a powerful alchemical catalyst.',
    sellPrice: 140,
    potionIngredients: ['blood-rage', 'hemoglobin-boost', 'crimson-fury'],
  },
  {
    id: 'prism-oyster',
    name: 'Prism Oyster',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Crystal Grotto',
    sporeColor: '#fd79a8',
    glowIntensity: 0.65,
    xpReward: 54,
    description: 'Iridescent oyster that shifts color depending on viewing angle.',
    sellPrice: 46,
    potionIngredients: ['prism-shift', 'color-weave', 'illusion-draught'],
  },
  {
    id: 'dusk-morel',
    name: 'Dusk Morel',
    type: 'edible',
    rarity: 'uncommon',
    habitat: 'Spore Forest',
    sporeColor: '#6c5ce7',
    glowIntensity: 0.2,
    xpReward: 18,
    description: 'Appears at twilight. Honeycomb cap filled with spore-rich chambers.',
    sellPrice: 11,
    potionIngredients: ['twilight-vision', 'dusk-creep', 'shadow-step'],
  },
  {
    id: 'abyss-brain',
    name: 'Abyss Brain',
    type: 'legendary',
    rarity: 'legendary',
    habitat: 'Mycelium Network',
    sporeColor: '#2d3436',
    glowIntensity: 0.2,
    xpReward: 210,
    description: 'Pulsating brain-like fungus at the deepest mycelial node. Sentient and ancient.',
    sellPrice: 550,
    potionIngredients: ['omniscience-elixir', 'neural-burst', 'hive-mind-join'],
  },
  {
    id: 'cloud-ear',
    name: 'Cloud Ear',
    type: 'edible',
    rarity: 'common',
    habitat: 'Underground Lake',
    sporeColor: '#b2bec3',
    glowIntensity: 0,
    xpReward: 8,
    description: 'Translucent and gelatinous. Absorbs flavors when cooked in broths.',
    sellPrice: 3,
    potionIngredients: ['cloud-walk', 'ear-sharpen', 'sound-absorb'],
  },
  {
    id: 'witch-butter',
    name: 'Witch Butter',
    type: 'medicinal',
    rarity: 'uncommon',
    habitat: 'Ancient Garden',
    sporeColor: '#fdcb6e',
    glowIntensity: 0.1,
    xpReward: 21,
    description: 'Gelatinous orange fungus. Dissipates fevers and strengthens the will.',
    sellPrice: 12,
    potionIngredients: ['witch-sight', 'butter-melt', 'willpower-fortify'],
  },
  {
    id: 'thorn-coral',
    name: 'Thorn Coral',
    type: 'toxic',
    rarity: 'uncommon',
    habitat: 'Fungal Maze',
    sporeColor: '#e55039',
    glowIntensity: 0.25,
    xpReward: 23,
    description: 'Covered in sharp crystalline thorns. Poison on contact but a great reagent.',
    sellPrice: 15,
    potionIngredients: ['thorn-armor', 'coral-blade', 'sting-resistance'],
  },
  {
    id: 'echo-bell',
    name: 'Echo Bell',
    type: 'magical',
    rarity: 'rare',
    habitat: 'Crystal Grotto',
    sporeColor: '#00cec9',
    glowIntensity: 0.6,
    xpReward: 56,
    description: 'Bell-shaped mushroom that amplifies sound. Rings softly in cave drafts.',
    sellPrice: 44,
    potionIngredients: ['echo-location', 'sonic-blast', 'bell-shield'],
  },
  {
    id: 'briar-knot',
    name: 'Briar Knot',
    type: 'edible',
    rarity: 'common',
    habitat: 'Spore Forest',
    sporeColor: '#8B4513',
    glowIntensity: 0,
    xpReward: 10,
    description: 'Knotted, twisted mushroom resembling a briar patch. Smoky flavor.',
    sellPrice: 5,
    potionIngredients: ['briar-wall', 'knot-bind', 'smokescreen'],
  },
  {
    id: 'time-wither',
    name: 'Time Wither',
    type: 'legendary',
    rarity: 'legendary',
    habitat: 'Mycelium Network',
    sporeColor: '#ffeaa7',
    glowIntensity: 0.3,
    xpReward: 220,
    description: 'Ages anything it touches by centuries. Masters of time seek it endlessly.',
    sellPrice: 600,
    potionIngredients: ['time-stop', 'age-reversal', 'chronos-brew'],
  },
  {
    id: 'nether-crown',
    name: 'Nether Crown',
    type: 'legendary',
    rarity: 'legendary',
    habitat: 'Deep Root Chamber',
    sporeColor: '#636e72',
    glowIntensity: 0.5,
    xpReward: 230,
    description: 'Crown-shaped fungus radiating nether energy. Grants dominion over fungi.',
    sellPrice: 650,
    potionIngredients: ['nether-lord', 'crown-authority', 'fungal-dominion'],
  },
]

/* ================================================================
   CAVERNS (8 zones)
   ================================================================ */

const MC_CAVERNS: McCavern[] = [
  {
    id: 'crystal-grotto',
    name: 'Crystal Grotto',
    depth: 1,
    description: 'A shimmering cavern lined with luminescent crystals and refracting fungi.',
    mushroomIds: ['crystal-morel', 'star-mushroom', 'sapphire-shelf', 'prism-oyster', 'echo-bell'],
    creatureIds: ['crystal-moth', 'gem-beetle', 'prism-sprite'],
    requiredLevel: 1,
    dangerLevel: 1,
    ambientColor: '#74b9ff',
    unlockCost: 0,
  },
  {
    id: 'spore-forest',
    name: 'Spore Forest',
    depth: 2,
    description: 'Dense fungal undergrowth filled with common and uncommon species.',
    mushroomIds: ['shiitake', 'chanterelle', 'golden-oyster', 'ruby-bolete', 'vermilion-tooth', 'dusk-morel', 'briar-knot'],
    creatureIds: ['spore-beetle', 'fungus-rat', 'mycelium-crawler'],
    requiredLevel: 1,
    dangerLevel: 2,
    ambientColor: '#00b894',
    unlockCost: 0,
  },
  {
    id: 'underground-lake',
    name: 'Underground Lake',
    depth: 3,
    description: 'A vast subterranean lake where bioluminescent fungi reflect off still waters.',
    mushroomIds: ['thunder-truffle', 'frost-cap', 'veil-puffball', 'cloud-ear'],
    creatureIds: ['blind-fish', 'lake-spirit', 'depth-worm'],
    requiredLevel: 5,
    dangerLevel: 3,
    ambientColor: '#0984e3',
    unlockCost: 100,
  },
  {
    id: 'fungal-maze',
    name: 'Fungal Maze',
    depth: 4,
    description: 'Twisting corridors where toxic and magical mushrooms create deadly barriers.',
    mushroomIds: ['mindbender', 'shadow-toadstool', 'copper-ring', 'ironcap', 'thorn-coral'],
    creatureIds: ['maze-guardian', 'spore-wraith', 'fungus-golem'],
    requiredLevel: 10,
    dangerLevel: 5,
    ambientColor: '#6c5ce7',
    unlockCost: 300,
  },
  {
    id: 'bioluminescent-bay',
    name: 'Bioluminescent Bay',
    depth: 5,
    description: 'An ethereal bay where every surface glows with living light.',
    mushroomIds: ['glowcap', 'dreamcap', 'amethyst-coral', 'silk-strand'],
    creatureIds: ['glow-jellyfish', 'lunar-moth', 'spore-sprite'],
    requiredLevel: 15,
    dangerLevel: 4,
    ambientColor: '#00ff88',
    unlockCost: 600,
  },
  {
    id: 'ancient-garden',
    name: 'Ancient Garden',
    depth: 6,
    description: 'A primordial garden preserved by fungal magic since the dawn of time.',
    mushroomIds: ['reishi', 'jade-tuft', 'moss-beard', 'witch-butter', 'moonlight-parasol'],
    creatureIds: ['ancient-treant', 'garden-keeper', 'spore-phoenix'],
    requiredLevel: 20,
    dangerLevel: 6,
    ambientColor: '#55a630',
    unlockCost: 800,
  },
  {
    id: 'deep-root-chamber',
    name: 'Deep Root Chamber',
    depth: 7,
    description: 'Volcanic vents heat this deep chamber where fire-resistant fungi thrive.',
    mushroomIds: ['phoenix-fungus', 'ember-fungi', 'lava-belly', 'bloodcap', 'nether-crown'],
    creatureIds: ['fire-elemental', 'magma-toad', 'ash-wraith'],
    requiredLevel: 25,
    dangerLevel: 7,
    ambientColor: '#e17055',
    unlockCost: 1200,
  },
  {
    id: 'mycelium-network',
    name: 'Mycelium Network',
    depth: 8,
    description: 'The living nervous system of the cavern. Vast threads of mycelium pulse with energy.',
    mushroomIds: ['void-shroom', 'spectral-wisp', 'abyss-brain', 'time-wither'],
    creatureIds: ['mycelium-golem', 'neural-parasite', 'hive-queen'],
    requiredLevel: 35,
    dangerLevel: 9,
    ambientColor: '#2d3436',
    unlockCost: 2500,
  },
]

/* ================================================================
   POTIONS (25 recipes)
   ================================================================ */

const MC_POTIONS: McPotion[] = [
  {
    id: 'health-salve',
    name: 'Health Salve',
    description: 'Restores vitality and mends minor wounds with earthy mushroom essence.',
    ingredients: [{ mushroomId: 'shiitake', count: 3 }],
    rarity: 'common',
    effect: 'heal',
    duration: 0,
    brewTime: 30,
    xpReward: 15,
    color: '#00b894',
  },
  {
    id: 'stamina-brew',
    name: 'Stamina Brew',
    description: 'Restores energy for extended cavern exploration sessions.',
    ingredients: [{ mushroomId: 'shiitake', count: 2 }, { mushroomId: 'chanterelle', count: 1 }],
    rarity: 'common',
    effect: 'stamina',
    duration: 300,
    brewTime: 45,
    xpReward: 20,
    color: '#fdcb6e',
  },
  {
    id: 'earthtonic',
    name: 'Earthtonic',
    description: 'Grants temporary earth resistance and ground stability.',
    ingredients: [{ mushroomId: 'shiitake', count: 1 }, { mushroomId: 'ironcap', count: 2 }],
    rarity: 'uncommon',
    effect: 'earth_resist',
    duration: 600,
    brewTime: 60,
    xpReward: 35,
    color: '#b87333',
  },
  {
    id: 'vitality-elixir',
    name: 'Vitality Elixir',
    description: 'Greatly boosts maximum health for a limited time.',
    ingredients: [{ mushroomId: 'reishi', count: 2 }, { mushroomId: 'jade-tuft', count: 2 }],
    rarity: 'uncommon',
    effect: 'max_hp_boost',
    duration: 900,
    brewTime: 90,
    xpReward: 40,
    color: '#c0392b',
  },
  {
    id: 'longevity-serum',
    name: 'Longevity Serum',
    description: 'Slows the effects of exhaustion, extending exploration time.',
    ingredients: [{ mushroomId: 'reishi', count: 3 }, { mushroomId: 'witch-butter', count: 1 }],
    rarity: 'rare',
    effect: 'fatigue_resist',
    duration: 1800,
    brewTime: 120,
    xpReward: 70,
    color: '#e84393',
  },
  {
    id: 'fortify-aura',
    name: 'Fortify Aura',
    description: 'Creates a protective aura that reduces incoming damage.',
    ingredients: [{ mushroomId: 'reishi', count: 1 }, { mushroomId: 'ironcap', count: 3 }],
    rarity: 'rare',
    effect: 'damage_reduce',
    duration: 600,
    brewTime: 100,
    xpReward: 65,
    color: '#6c5ce7',
  },
  {
    id: 'golden-luster',
    name: 'Golden Luster',
    description: 'Increases gold earned from mushroom sales temporarily.',
    ingredients: [{ mushroomId: 'chanterelle', count: 3 }, { mushroomId: 'golden-oyster', count: 2 }],
    rarity: 'uncommon',
    effect: 'gold_boost',
    duration: 1200,
    brewTime: 60,
    xpReward: 30,
    color: '#f39c12',
  },
  {
    id: 'sunburst-draft',
    name: 'Sunburst Draft',
    description: 'Illuminates dark cavern areas, revealing hidden passages.',
    ingredients: [{ mushroomId: 'chanterelle', count: 2 }, { mushroomId: 'glowcap', count: 1 }],
    rarity: 'uncommon',
    effect: 'reveal_hidden',
    duration: 300,
    brewTime: 50,
    xpReward: 28,
    color: '#ffeaa7',
  },
  {
    id: 'light-elixir',
    name: 'Light Elixir',
    description: 'Grants the ability to see in complete darkness for an extended period.',
    ingredients: [{ mushroomId: 'glowcap', count: 3 }],
    rarity: 'uncommon',
    effect: 'darkvision',
    duration: 1800,
    brewTime: 70,
    xpReward: 38,
    color: '#00ff88',
  },
  {
    id: 'glow-serum',
    name: 'Glow Serum',
    description: 'Causes the drinker to emit a soft bioluminescent glow.',
    ingredients: [{ mushroomId: 'glowcap', count: 2 }, { mushroomId: 'dreamcap', count: 1 }],
    rarity: 'rare',
    effect: 'self_glow',
    duration: 2400,
    brewTime: 80,
    xpReward: 55,
    color: '#55efc4',
  },
  {
    id: 'night-vision-potion',
    name: 'Night Vision Potion',
    description: 'Enhances perception to detect hidden creatures and rare fungi.',
    ingredients: [{ mushroomId: 'glowcap', count: 2 }, { mushroomId: 'silk-strand', count: 1 }],
    rarity: 'rare',
    effect: 'enhance_perception',
    duration: 1200,
    brewTime: 90,
    xpReward: 60,
    color: '#a29bfe',
  },
  {
    id: 'mind-sharpen',
    name: 'Mind Sharpen',
    description: 'Sharply increases mental clarity and XP gains temporarily.',
    ingredients: [{ mushroomId: 'mindbender', count: 2 }],
    rarity: 'rare',
    effect: 'xp_boost',
    duration: 1800,
    brewTime: 120,
    xpReward: 75,
    color: '#9b59b6',
  },
  {
    id: 'telepathy-tonic',
    name: 'Telepathy Tonic',
    description: 'Enables brief telepathic communication with cavern creatures.',
    ingredients: [{ mushroomId: 'mindbender', count: 2 }, { mushroomId: 'dreamcap', count: 2 }],
    rarity: 'epic',
    effect: 'telepathy',
    duration: 600,
    brewTime: 180,
    xpReward: 130,
    color: '#6c5ce7',
  },
  {
    id: 'dream-weaver-brew',
    name: 'Dream Weaver Brew',
    description: 'Allows entry into the collective mushroom consciousness through dreams.',
    ingredients: [{ mushroomId: 'mindbender', count: 1 }, { mushroomId: 'dreamcap', count: 3 }],
    rarity: 'epic',
    effect: 'dream_entry',
    duration: 0,
    brewTime: 240,
    xpReward: 140,
    color: '#a29bfe',
  },
  {
    id: 'prismatic-shield',
    name: 'Prismatic Shield',
    description: 'A swirling shield of prismatic light deflects all damage types.',
    ingredients: [{ mushroomId: 'crystal-morel', count: 2 }, { mushroomId: 'sapphire-shelf', count: 2 }],
    rarity: 'rare',
    effect: 'prismatic_defense',
    duration: 900,
    brewTime: 150,
    xpReward: 80,
    color: '#74b9ff',
  },
  {
    id: 'clarity-draught',
    name: 'Clarity Draught',
    description: 'Clears all status ailments and negative mental effects instantly.',
    ingredients: [{ mushroomId: 'crystal-morel', count: 1 }, { mushroomId: 'jade-tuft', count: 3 }],
    rarity: 'uncommon',
    effect: 'cure_all',
    duration: 0,
    brewTime: 60,
    xpReward: 32,
    color: '#dfe6e9',
  },
  {
    id: 'shadow-cloak',
    name: 'Shadow Cloak',
    description: 'Renders the user invisible to hostile cavern creatures.',
    ingredients: [{ mushroomId: 'shadow-toadstool', count: 2 }, { mushroomId: 'dusk-morel', count: 2 }],
    rarity: 'rare',
    effect: 'invisibility',
    duration: 600,
    brewTime: 140,
    xpReward: 72,
    color: '#2c3e50',
  },
  {
    id: 'phoenix-rebirth',
    name: 'Phoenix Rebirth',
    description: 'Upon death, resurrect with full health once. The ultimate survival potion.',
    ingredients: [{ mushroomId: 'phoenix-fungus', count: 1 }, { mushroomId: 'ember-fungi', count: 3 }],
    rarity: 'legendary',
    effect: 'auto_revive',
    duration: 7200,
    brewTime: 600,
    xpReward: 350,
    color: '#e74c3c',
  },
  {
    id: 'flameheart-elixir',
    name: 'Flameheart Elixir',
    description: 'Wraps the user in protective flames that burn enemies on contact.',
    ingredients: [{ mushroomId: 'phoenix-fungus', count: 1 }, { mushroomId: 'lava-belly', count: 2 }],
    rarity: 'legendary',
    effect: 'flame_aura',
    duration: 1800,
    brewTime: 480,
    xpReward: 320,
    color: '#ff7675',
  },
  {
    id: 'lightning-brew',
    name: 'Lightning Brew',
    description: 'Charges the user with electrical energy, enhancing attack speed.',
    ingredients: [{ mushroomId: 'thunder-truffle', count: 2 }],
    rarity: 'epic',
    effect: 'speed_boost',
    duration: 600,
    brewTime: 200,
    xpReward: 150,
    color: '#f1c40f',
  },
  {
    id: 'void-walk-potion',
    name: 'Void Walk Potion',
    description: 'Allows passage through solid walls for a brief, disorienting moment.',
    ingredients: [{ mushroomId: 'void-shroom', count: 2 }, { mushroomId: 'spectral-wisp', count: 1 }],
    rarity: 'epic',
    effect: 'phase_walk',
    duration: 30,
    brewTime: 240,
    xpReward: 145,
    color: '#2d3436',
  },
  {
    id: 'abyssal-gaze',
    name: 'Abyssal Gaze',
    description: 'Strikes terror into enemies, reducing their combat effectiveness.',
    ingredients: [{ mushroomId: 'void-shroom', count: 1 }, { mushroomId: 'shadow-toadstool', count: 2 }],
    rarity: 'epic',
    effect: 'fear_aura',
    duration: 900,
    brewTime: 200,
    xpReward: 135,
    color: '#0d0d0d',
  },
  {
    id: 'starfall-draught',
    name: 'Starfall Draught',
    description: 'Calls down a barrage of starlight to damage all enemies in range.',
    ingredients: [{ mushroomId: 'star-mushroom', count: 2 }, { mushroomId: 'moonlight-parasol', count: 1 }],
    rarity: 'epic',
    effect: 'starfall',
    duration: 0,
    brewTime: 220,
    xpReward: 155,
    color: '#ffeaa7',
  },
  {
    id: 'stormheart-tonic',
    name: 'Stormheart Tonic',
    description: 'Summons a localized thunderstorm to stun nearby enemies.',
    ingredients: [{ mushroomId: 'thunder-truffle', count: 1 }, { mushroomId: 'void-shroom', count: 1 }],
    rarity: 'legendary',
    effect: 'aoe_stun',
    duration: 0,
    brewTime: 420,
    xpReward: 300,
    color: '#ffeaa7',
  },
  {
    id: 'cosmic-awareness',
    name: 'Cosmic Awareness',
    description: 'Reveals the entire cavern map and all hidden treasures temporarily.',
    ingredients: [{ mushroomId: 'star-mushroom', count: 3 }],
    rarity: 'legendary',
    effect: 'full_reveal',
    duration: 600,
    brewTime: 360,
    xpReward: 280,
    color: '#fd79a8',
  },
]

/* ================================================================
   CREATURES (17 species)
   ================================================================ */

const MC_CREATURES: McCreature[] = [
  {
    id: 'mycelium-golem',
    name: 'Mycelium Golem',
    type: 'boss',
    hp: 500,
    damage: 40,
    xpReward: 300,
    description: 'A massive construct of intertwined mycelium strands, guardian of the deep network.',
    sporeDrop: 'void-shroom',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'spore-sprite',
    name: 'Spore Sprite',
    type: 'passive',
    hp: 30,
    damage: 0,
    xpReward: 25,
    description: 'Tiny floating sprites born from concentrated mushroom spores. Harmless and curious.',
    sporeDrop: 'glowcap',
    tameable: true,
    tamedBonus: 'Increased mushroom discovery rate',
  },
  {
    id: 'fungal-beetle',
    name: 'Fungal Beetle',
    type: 'neutral',
    hp: 60,
    damage: 10,
    xpReward: 40,
    description: 'Hard-shelled beetle with symbiotic fungi growing on its carapace.',
    sporeDrop: 'ironcap',
    tameable: true,
    tamedBonus: 'Bonus defense during cavern exploration',
  },
  {
    id: 'crystal-moth',
    name: 'Crystal Moth',
    type: 'passive',
    hp: 20,
    damage: 0,
    xpReward: 20,
    description: 'Translucent wings scatter light into rainbow patterns. Guides lost travelers.',
    sporeDrop: 'crystal-morel',
    tameable: true,
    tamedBonus: 'Reduced exploration danger level',
  },
  {
    id: 'gem-beetle',
    name: 'Gem Beetle',
    type: 'neutral',
    hp: 80,
    damage: 15,
    xpReward: 55,
    description: 'Beetle with a gemstone-like shell. Defends crystal formations aggressively.',
    sporeDrop: 'sapphire-shelf',
    tameable: true,
    tamedBonus: 'Increased rare mushroom find chance',
  },
  {
    id: 'prism-sprite',
    name: 'Prism Sprite',
    type: 'passive',
    hp: 15,
    damage: 0,
    xpReward: 18,
    description: 'Minuscule sprite that refracts light into miniature rainbows.',
    sporeDrop: 'prism-oyster',
    tameable: true,
    tamedBonus: 'Bonus XP from crystal harvesting',
  },
  {
    id: 'spore-beetle',
    name: 'Spore Beetle',
    type: 'neutral',
    hp: 45,
    damage: 8,
    xpReward: 35,
    description: 'Common beetle that disperses mushroom spores as it moves through the forest.',
    sporeDrop: 'chanterelle',
    tameable: true,
    tamedBonus: 'Faster cultivation growth speed',
  },
  {
    id: 'fungus-rat',
    name: 'Fungus Rat',
    type: 'neutral',
    hp: 35,
    damage: 5,
    xpReward: 22,
    description: 'Overgrown rat with a fungal colony on its back. Scavenges fallen mushrooms.',
    sporeDrop: 'briar-knot',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'mycelium-crawler',
    name: 'Mycelium Crawler',
    type: 'hostile',
    hp: 100,
    damage: 20,
    xpReward: 65,
    description: 'Insectoid creature woven from mycelium threads. Hunts in swarms.',
    sporeDrop: 'copper-ring',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'blind-fish',
    name: 'Blind Fish',
    type: 'passive',
    hp: 25,
    damage: 0,
    xpReward: 15,
    description: 'Albino cave fish with no eyes. Navigates by sensing fungal vibrations.',
    sporeDrop: 'cloud-ear',
    tameable: true,
    tamedBonus: 'Improved underwater exploration',
  },
  {
    id: 'lake-spirit',
    name: 'Lake Spirit',
    type: 'neutral',
    hp: 150,
    damage: 25,
    xpReward: 90,
    description: 'A serene water spirit that guards the underground lake. Tests the worthy.',
    sporeDrop: 'frost-cap',
    tameable: true,
    tamedBonus: 'Water breathing and swim speed boost',
  },
  {
    id: 'depth-worm',
    name: 'Depth Worm',
    type: 'hostile',
    hp: 200,
    damage: 35,
    xpReward: 120,
    description: 'Enormous worm that burrows through cavern walls. Emerges without warning.',
    sporeDrop: 'veil-puffball',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'maze-guardian',
    name: 'Maze Guardian',
    type: 'boss',
    hp: 400,
    damage: 30,
    xpReward: 250,
    description: 'Sentient fungal construct that reshapes the maze to trap intruders.',
    sporeDrop: 'mindbender',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'spore-wraith',
    name: 'Spore Wraith',
    type: 'hostile',
    hp: 180,
    damage: 28,
    xpReward: 100,
    description: 'Spectral entity formed from toxic spore clouds. Corrodes armor on contact.',
    sporeDrop: 'shadow-toadstool',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'fungus-golem',
    name: 'Fungus Golem',
    type: 'boss',
    hp: 450,
    damage: 35,
    xpReward: 280,
    description: 'Ancient guardian of the fungal maze, constructed from centuries of fungal growth.',
    sporeDrop: 'ironcap',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'hive-queen',
    name: 'Hive Queen',
    type: 'boss',
    hp: 600,
    damage: 50,
    xpReward: 400,
    description: 'The central intelligence of the mycelium network. Controls all fungal life.',
    sporeDrop: 'abyss-brain',
    tameable: false,
    tamedBonus: '',
  },
  {
    id: 'spore-phoenix',
    name: 'Spore Phoenix',
    type: 'boss',
    hp: 550,
    damage: 45,
    xpReward: 350,
    description: 'Legendary bird-reptile hybrid reborn from mushroom spore combustion cycles.',
    sporeDrop: 'phoenix-fungus',
    tameable: false,
    tamedBonus: '',
  },
]

/* ================================================================
   TITLES (8 ranks)
   ================================================================ */

const MC_TITLES: McTitle[] = [
  {
    id: 'spore-collector',
    name: 'Spore Collector',
    requiredLevel: 1,
    description: 'A curious explorer beginning their journey into the fungal depths.',
    bonus: '+5% harvest speed',
  },
  {
    id: 'cavern-walker',
    name: 'Cavern Walker',
    requiredLevel: 5,
    description: 'Accustomed to the dark passages and twisting tunnels below.',
    bonus: '+10% exploration radius',
  },
  {
    id: 'fungus-whisperer',
    name: 'Fungus Whisperer',
    requiredLevel: 12,
    description: 'Can sense the subtle communications of the mycelial network.',
    bonus: '+15% mushroom discovery chance',
  },
  {
    id: 'potion-master',
    name: 'Potion Master',
    requiredLevel: 20,
    description: 'Brews elixirs of remarkable potency from cavern fungi.',
    bonus: '+20% potion effectiveness',
  },
  {
    id: 'mycelium-lord',
    name: 'Mycelium Lord',
    requiredLevel: 30,
    description: 'Commands vast stretches of the underground fungal network.',
    bonus: '+25% network expansion speed',
  },
  {
    id: 'deep-delver',
    name: 'Deep Delver',
    requiredLevel: 38,
    description: 'Has plumbed the deepest, most dangerous reaches of the caverns.',
    bonus: '+30% XP from deep caverns',
  },
  {
    id: 'spore-sovereign',
    name: 'Spore Sovereign',
    requiredLevel: 45,
    description: 'Rules over the fungal kingdom with wisdom and fungal might.',
    bonus: '+35% all resource gains',
  },
  {
    id: 'fungal-overlord',
    name: 'Fungal Overlord',
    requiredLevel: 50,
    description: 'The ultimate master of the Mushroom Cavern. All fungi bow.',
    bonus: '+50% harvest yield, +50% potion power',
  },
]

/* ================================================================
   ACHIEVEMENTS (16 milestones)
   ================================================================ */

const MC_ACHIEVEMENTS: McAchievement[] = [
  {
    id: 'first-harvest',
    name: 'First Harvest',
    description: 'Harvest your very first mushroom from the cavern.',
    condition: 'totalHarvested >= 1',
    reward: { type: 'xp', value: 50 },
    icon: '\uD83C\uDF44',
  },
  {
    id: 'spore-novice',
    name: 'Spore Novice',
    description: 'Discover 10 different mushroom species.',
    condition: 'discovered >= 10',
    reward: { type: 'xp', value: 200 },
    icon: '\uD83D\uDD0D',
  },
  {
    id: 'master-forager',
    name: 'Master Forager',
    description: 'Discover all 37 mushroom species.',
    condition: 'discovered >= 37',
    reward: { type: 'xp', value: 2000 },
    icon: '\uD83C\uDFC6',
  },
  {
    id: 'green-thumb',
    name: 'Green Thumb',
    description: 'Successfully cultivate 50 mushrooms in your garden.',
    condition: 'cultivated >= 50',
    reward: { type: 'spores', value: 500 },
    icon: '\uD83C\uDF31',
  },
  {
    id: 'potion-apprentice',
    name: 'Potion Apprentice',
    description: 'Brew your first potion.',
    condition: 'totalPotions >= 1',
    reward: { type: 'xp', value: 100 },
    icon: '\uD83E\uDDEA',
  },
  {
    id: 'master-alchemist',
    name: 'Master Alchemist',
    description: 'Brew 100 potions total.',
    condition: 'totalPotions >= 100',
    reward: { type: 'xp', value: 3000 },
    icon: '\u2697\uFE0F',
  },
  {
    id: 'deep-explorer',
    name: 'Deep Explorer',
    description: 'Explore all 8 cavern zones.',
    condition: 'cavernsExplored >= 8',
    reward: { type: 'xp', value: 1500 },
    icon: '\uD83D\uDDFA\uFE0F',
  },
  {
    id: 'fully-mapped',
    name: 'Fully Mapped',
    description: 'Achieve 100% exploration in every cavern.',
    condition: 'allCavernsComplete',
    reward: { type: 'gold', value: 5000 },
    icon: '\uD83D\uDCDC',
  },
  {
    id: 'creature-friend',
    name: 'Creature Friend',
    description: 'Tame your first cavern creature.',
    condition: 'creaturesTamed >= 1',
    reward: { type: 'xp', value: 150 },
    icon: '\uD83D\uDC3E',
  },
  {
    id: 'beast-master',
    name: 'Beast Master',
    description: 'Tame 10 different cavern creatures.',
    condition: 'creaturesTamed >= 10',
    reward: { type: 'xp', value: 2500 },
    icon: '\uD83D\uDC81',
  },
  {
    id: 'network-starter',
    name: 'Network Starter',
    description: 'Establish your first mycelium network node.',
    condition: 'networkNodes >= 1',
    reward: { type: 'spores', value: 200 },
    icon: '\uD83D\uDD17',
  },
  {
    id: 'network-complete',
    name: 'Network Complete',
    description: 'Connect all 8 mycelium network nodes at full strength.',
    condition: 'networkFull',
    reward: { type: 'xp', value: 5000 },
    icon: '\uD83C\uDF10',
  },
  {
    id: 'wealthy-mycologist',
    name: 'Wealthy Mycologist',
    description: 'Accumulate 10,000 gold from mushroom sales.',
    condition: 'totalGold >= 10000',
    reward: { type: 'spores', value: 1000 },
    icon: '\uD83D\uDCB0',
  },
  {
    id: 'legendary-harvest',
    name: 'Legendary Harvest',
    description: 'Harvest a legendary-tier mushroom.',
    condition: 'legendaryHarvest',
    reward: { type: 'xp', value: 500 },
    icon: '\u2B50',
  },
  {
    id: 'boss-slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first cavern boss.',
    condition: 'bossesDefeated >= 1',
    reward: { type: 'xp', value: 500 },
    icon: '\uD83D\uDDE1\uFE0F',
  },
  {
    id: 'all-bosses-fallen',
    name: 'All Bosses Fallen',
    description: 'Defeat every cavern boss.',
    condition: 'bossesDefeated >= 5',
    reward: { type: 'gold', value: 10000 },
    icon: '\uD83D\uDC80',
  },
]

/* ================================================================
   DEFAULT STATE FACTORY
   ================================================================ */

function mcCreateDefaultState(): McGameState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    harvested: [],
    discovered: [],
    inventory: [],
    potions: [],
    equippedPotions: Array.from({ length: MC_EQUIP_SLOTS }, (_, i) => ({
      slot: i,
      potionId: null,
      remainingUses: 0,
    })),
    brewing: {
      potionId: null,
      startedAt: null,
      finishTime: null,
      boosted: false,
    },
    caverns: MC_CAVERNS.map((c) => ({
      cavernId: c.id,
      explored: c.unlockCost === 0,
      explorationPercent: 0,
      totalExplored: 0,
      bossDefeated: false,
    })),
    creatures: MC_CREATURES.map((c) => ({
      creatureId: c.id,
      encountered: false,
      tamed: false,
      defeated: false,
      feedCount: 0,
      lastFedAt: 0,
    })),
    achievements: [],
    cultivationSlots: Array.from({ length: 3 }, (_, i) => ({
      id: `slot-${i}`,
      mushroomId: null,
      plantedAt: null,
      growthTime: MC_CULTIVATION_BASE_TIME,
      yieldMultiplier: 1,
    })),
    myceliumNodes: MC_CAVERNS.map((c) => ({
      id: `node-${c.id}`,
      cavernId: c.id,
      strength: 0,
      maxStrength: MC_MAX_NETWORK_STRENGTH,
      connectedNodes: [],
      bonusType: 'xp',
      bonusValue: 0,
    })),
    sporeCount: 50,
    goldCount: 100,
    totalGoldEarned: 100,
    totalSporesEarned: 50,
    gardenSlots: 3,
    gardenLevel: 0,
    harvestMode: 'manual',
    targetMushroomId: null,
    activeEffects: [],
    lastSaveTime: 0,
    totalHarvested: 0,
    totalPotionsBrewed: 0,
    totalCultivated: 0,
    totalCavernExplored: 0,
    totalCreaturesTamed: 0,
    totalBossesDefeated: 0,
    playTimeMinutes: 0,
    sessionStartTime: Date.now(),
    tradeLog: [],
    dailyHarvestStreak: 0,
    lastDailyHarvest: 0,
  }
}

/* ================================================================
   PERSISTENCE HELPERS
   ================================================================ */

function mcLoadState(): McGameState {
  if (typeof window === 'undefined') return mcCreateDefaultState()
  try {
    const raw = localStorage.getItem(MC_SAVE_KEY)
    if (!raw) return mcCreateDefaultState()
    const parsed = JSON.parse(raw) as Partial<McGameState>
    const defaults = mcCreateDefaultState()
    return {
      ...defaults,
      ...parsed,
      equippedPotions: parsed.equippedPotions ?? defaults.equippedPotions,
      brewing: { ...defaults.brewing, ...parsed.brewing },
      caverns: parsed.caverns ?? defaults.caverns,
      creatures: parsed.creatures ?? defaults.creatures,
      cultivationSlots: parsed.cultivationSlots ?? defaults.cultivationSlots,
      myceliumNodes: parsed.myceliumNodes ?? defaults.myceliumNodes,
      tradeLog: parsed.tradeLog ?? [],
      sessionStartTime: Date.now(),
    }
  } catch {
    return mcCreateDefaultState()
  }
}

function mcSaveState(gameState: McGameState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(
      MC_SAVE_KEY,
      JSON.stringify({ ...gameState, lastSaveTime: Date.now() }),
    )
  } catch {
    /* storage full or unavailable */
  }
}

/* ================================================================
   THE HOOK
   ================================================================ */

export default function useMushroomCavern() {
  const [state, setState] = useState<McGameState>(mcLoadState)
  const stateRef = useRef(state)
  const saveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const cleanupTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    stateRef.current = state
  }, [state])

  useEffect(() => {
    saveTimerRef.current = setInterval(() => {
      mcSaveState(stateRef.current)
    }, MC_AUTO_SAVE_INTERVAL)
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    cleanupTimerRef.current = setInterval(() => {
      const ref = stateRef.current
      const now = Date.now()
      const hasExpired = ref.activeEffects.some(
        (e) => e.expiresAt > 0 && e.expiresAt <= now,
      )
      if (hasExpired) {
        setState((prev) => ({
          ...prev,
          activeEffects: prev.activeEffects.filter(
            (e) => e.expiresAt === 0 || e.expiresAt > now,
          ),
        }))
      }
    }, MC_EFFECT_CLEANUP_INTERVAL)
    return () => {
      if (cleanupTimerRef.current) clearInterval(cleanupTimerRef.current)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => ({
        ...prev,
        playTimeMinutes: prev.playTimeMinutes + 1,
      }))
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  /* ==============================================================
     XP & LEVELING
     ============================================================== */

  const mcAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let currentXp = prev.xp + amount
      let currentLevel = prev.level
      const totalXp = prev.totalXp + amount
      while (currentLevel < MC_MAX_LEVEL && currentXp >= MC_XP_TABLE[currentLevel]) {
        currentXp -= MC_XP_TABLE[currentLevel]
        currentLevel += 1
      }
      if (currentLevel >= MC_MAX_LEVEL) currentXp = 0
      return { ...prev, xp: currentXp, level: currentLevel, totalXp }
    })
  }, [])

  const mcAddSpores = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      sporeCount: prev.sporeCount + amount,
      totalSporesEarned: prev.totalSporesEarned + amount,
    }))
  }, [])

  const mcAddGold = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      goldCount: prev.goldCount + amount,
      totalGoldEarned: Math.max(prev.totalGoldEarned, prev.goldCount + amount),
    }))
  }, [])

  /* ==============================================================
     ACHIEVEMENT CHECKING
     ============================================================== */

  const mcCheckAchievements = useCallback(() => {
    setState((prev) => {
      const unlockedIds = new Set(prev.achievements.map((a) => a.achievementId))
      const newAchs: McAchievementRecord[] = []
      let bonusXp = 0
      let bonusGold = 0
      let bonusSpores = 0
      const tamedCount = prev.creatures.filter((c) => c.tamed).length
      const defeatedBosses = prev.creatures.filter(
        (c) =>
          c.defeated &&
          MC_CREATURES.find((cr) => cr.id === c.creatureId)?.type === 'boss',
      ).length

      for (const ach of MC_ACHIEVEMENTS) {
        if (unlockedIds.has(ach.id)) continue
        let met = false
        switch (ach.condition) {
          case 'totalHarvested >= 1':
            met = prev.totalHarvested >= 1
            break
          case 'discovered >= 10':
            met = prev.discovered.length >= 10
            break
          case 'discovered >= 37':
            met = prev.discovered.length >= 37
            break
          case 'cultivated >= 50':
            met = prev.totalCultivated >= 50
            break
          case 'totalPotions >= 1':
            met = prev.totalPotionsBrewed >= 1
            break
          case 'totalPotions >= 100':
            met = prev.totalPotionsBrewed >= 100
            break
          case 'cavernsExplored >= 8':
            met = prev.caverns.filter((c) => c.explored).length >= 8
            break
          case 'allCavernsComplete':
            met = prev.caverns.every((c) => c.explorationPercent >= 100)
            break
          case 'creaturesTamed >= 1':
            met = tamedCount >= 1
            break
          case 'creaturesTamed >= 10':
            met = tamedCount >= 10
            break
          case 'networkNodes >= 1':
            met = prev.myceliumNodes.some((n) => n.strength > 0)
            break
          case 'networkFull':
            met = prev.myceliumNodes.every(
              (n) => n.strength >= n.maxStrength,
            )
            break
          case 'totalGold >= 10000':
            met = prev.totalGoldEarned >= 10000
            break
          case 'legendaryHarvest':
            met = prev.harvested.some(
              (h) =>
                MC_MUSHROOMS.find((m) => m.id === h.mushroomId)?.rarity ===
                  'legendary' && h.count > 0,
            )
            break
          case 'bossesDefeated >= 1':
            met = defeatedBosses >= 1
            break
          case 'bossesDefeated >= 5':
            met = defeatedBosses >= 5
            break
        }
        if (met) {
          newAchs.push({ achievementId: ach.id, unlockedAt: Date.now() })
          if (ach.reward.type === 'xp') bonusXp += ach.reward.value
          if (ach.reward.type === 'gold') bonusGold += ach.reward.value
          if (ach.reward.type === 'spores') bonusSpores += ach.reward.value
        }
      }
      if (newAchs.length === 0) return prev
      return {
        ...prev,
        achievements: [...prev.achievements, ...newAchs],
        xp: prev.xp + bonusXp,
        totalXp: prev.totalXp + bonusXp,
        goldCount: prev.goldCount + bonusGold,
        totalGoldEarned: prev.totalGoldEarned + bonusGold,
        sporeCount: prev.sporeCount + bonusSpores,
        totalSporesEarned: prev.totalSporesEarned + bonusSpores,
      }
    })
  }, [])

  /* ==============================================================
     MUSHROOM HARVESTING
     ============================================================== */

  const mcHarvestShroom = useCallback(
    (id: string) => {
      const mushroom = MC_MUSHROOMS.find((m) => m.id === id)
      if (!mushroom) return
      setState((prev) => {
        const harvestRecord = prev.harvested.find((h) => h.mushroomId === id)
        const updatedHarvested = harvestRecord
          ? prev.harvested.map((h) =>
              h.mushroomId === id
                ? { ...h, count: h.count + 1, lastHarvested: Date.now() }
                : h,
            )
          : [...prev.harvested, { mushroomId: id, count: 1, lastHarvested: Date.now() }]
        const newDiscovered = prev.discovered.includes(id)
          ? prev.discovered
          : [...prev.discovered, id]
        const invItem = prev.inventory.find((i) => i.mushroomId === id)
        const updatedInventory = invItem
          ? prev.inventory.map((i) =>
              i.mushroomId === id ? { ...i, count: i.count + 1 } : i,
            )
          : [...prev.inventory, { mushroomId: id, count: 1 }]
        const now = Date.now()
        const isNextDay =
          prev.lastDailyHarvest === 0 ||
          now - prev.lastDailyHarvest >= MC_DAILY_STREAK_WINDOW
        const newStreak = isNextDay
          ? prev.dailyHarvestStreak + 1
          : prev.dailyHarvestStreak
        const sporeReward = MC_SPORE_REWARDS[mushroom.rarity]
        return {
          ...prev,
          harvested: updatedHarvested,
          discovered: newDiscovered,
          inventory: updatedInventory,
          totalHarvested: prev.totalHarvested + 1,
          sporeCount: prev.sporeCount + sporeReward,
          totalSporesEarned: prev.totalSporesEarned + sporeReward,
          dailyHarvestStreak: newStreak,
          lastDailyHarvest: now,
        }
      })
      const rarityMult = MC_RARITY[mushroom.rarity].xpMultiplier
      mcAddXp(Math.floor(mushroom.xpReward * rarityMult))
    },
    [mcAddXp],
  )

  const mcDiscoverMushroom = useCallback((id: string) => {
    setState((prev) => {
      if (prev.discovered.includes(id)) return prev
      const mushroom = MC_MUSHROOMS.find((m) => m.id === id)
      if (!mushroom) return prev
      return {
        ...prev,
        discovered: [...prev.discovered, id],
        sporeCount: prev.sporeCount + MC_SPORE_REWARDS[mushroom.rarity],
        totalSporesEarned:
          prev.totalSporesEarned + MC_SPORE_REWARDS[mushroom.rarity],
      }
    })
  }, [])

  /* ==============================================================
     SELLING
     ============================================================== */

  const mcSellMushroom = useCallback((id: string, count: number) => {
    const mushroom = MC_MUSHROOMS.find((m) => m.id === id)
    if (!mushroom) return
    setState((prev) => {
      const invItem = prev.inventory.find((i) => i.mushroomId === id)
      if (!invItem || invItem.count < count) return prev
      const goldGain = mushroom.sellPrice * count
      const updatedInventory =
        invItem.count === count
          ? prev.inventory.filter((i) => i.mushroomId !== id)
          : prev.inventory.map((i) =>
              i.mushroomId === id
                ? { ...i, count: i.count - count }
                : i,
            )
      const logEntry: McTradeLog = {
        timestamp: Date.now(),
        type: 'sell',
        itemId: id,
        itemName: mushroom.name,
        amount: count,
        goldChange: goldGain,
        sporeChange: 0,
        xpGained: 0,
      }
      return {
        ...prev,
        inventory: updatedInventory,
        goldCount: prev.goldCount + goldGain,
        totalGoldEarned: prev.totalGoldEarned + goldGain,
        tradeLog: [...prev.tradeLog.slice(-MC_TRADE_LOG_MAX), logEntry],
      }
    })
  }, [])

  const mcSellAllMushrooms = useCallback((id: string) => {
    const mushroom = MC_MUSHROOMS.find((m) => m.id === id)
    if (!mushroom) return
    setState((prev) => {
      const invItem = prev.inventory.find((i) => i.mushroomId === id)
      if (!invItem || invItem.count <= 0) return prev
      const goldGain = mushroom.sellPrice * invItem.count
      return {
        ...prev,
        inventory: prev.inventory.filter((i) => i.mushroomId !== id),
        goldCount: prev.goldCount + goldGain,
        totalGoldEarned: prev.totalGoldEarned + goldGain,
        tradeLog: [
          ...prev.tradeLog.slice(-MC_TRADE_LOG_MAX),
          {
            timestamp: Date.now(),
            type: 'sell',
            itemId: id,
            itemName: mushroom.name,
            amount: invItem.count,
            goldChange: goldGain,
            sporeChange: 0,
            xpGained: 0,
          },
        ],
      }
    })
  }, [])

  /* ==============================================================
     POTION BREWING
     ============================================================== */

  const mcCanBrewPotion = useCallback((potionId: string): boolean => {
    const potion = MC_POTIONS.find((p) => p.id === potionId)
    if (!potion) return false
    if (stateRef.current.brewing.potionId !== null) return false
    return potion.ingredients.every((ing) => {
      const inv = stateRef.current.inventory.find(
        (i) => i.mushroomId === ing.mushroomId,
      )
      return inv && inv.count >= ing.count
    })
  }, [])

  const mcBrewPotion = useCallback((potionId: string) => {
    const potion = MC_POTIONS.find((p) => p.id === potionId)
    if (!potion) return
    setState((prev) => {
      if (prev.brewing.potionId !== null) return prev
      for (const ing of potion.ingredients) {
        const inv = prev.inventory.find((i) => i.mushroomId === ing.mushroomId)
        if (!inv || inv.count < ing.count) return prev
      }
      let updatedInventory = [...prev.inventory]
      for (const ing of potion.ingredients) {
        updatedInventory = updatedInventory.map((i) =>
          i.mushroomId === ing.mushroomId
            ? { ...i, count: i.count - ing.count }
            : i,
        )
        updatedInventory = updatedInventory.filter((i) => i.count > 0)
      }
      const now = Date.now()
      return {
        ...prev,
        inventory: updatedInventory,
        brewing: {
          potionId,
          startedAt: now,
          finishTime: now + potion.brewTime * 1000,
          boosted: false,
        },
      }
    })
  }, [])

  const mcCollectBrew = useCallback(() => {
    setState((prev) => {
      if (!prev.brewing.potionId || !prev.brewing.finishTime) return prev
      if (Date.now() < prev.brewing.finishTime) return prev
      const potion = MC_POTIONS.find((p) => p.id === prev.brewing.potionId)
      if (!potion) return prev
      const existing = prev.potions.find((p) => p.potionId === potion.id)
      const updatedPotions = existing
        ? prev.potions.map((p) =>
            p.potionId === potion.id ? { ...p, count: p.count + 1 } : p,
          )
        : [...prev.potions, { potionId: potion.id, count: 1 }]
      const logEntry: McTradeLog = {
        timestamp: Date.now(),
        type: 'brew',
        itemId: potion.id,
        itemName: potion.name,
        amount: 1,
        goldChange: 0,
        sporeChange: 0,
        xpGained: potion.xpReward,
      }
      return {
        ...prev,
        potions: updatedPotions,
        brewing: {
          potionId: null,
          startedAt: null,
          finishTime: null,
          boosted: false,
        },
        totalPotionsBrewed: prev.totalPotionsBrewed + 1,
        tradeLog: [...prev.tradeLog.slice(-MC_TRADE_LOG_MAX), logEntry],
      }
    })
    const potion = MC_POTIONS.find(
      (p) => p.id === stateRef.current.brewing.potionId,
    )
    if (potion) mcAddXp(potion.xpReward)
  }, [mcAddXp])

  const mcCancelBrew = useCallback(() => {
    setState((prev) => {
      if (!prev.brewing.potionId) return prev
      const potion = MC_POTIONS.find((p) => p.id === prev.brewing.potionId)
      if (!potion) return prev
      const returnedIngredients = [...prev.inventory]
      for (const ing of potion.ingredients) {
        const existing = returnedIngredients.find(
          (i) => i.mushroomId === ing.mushroomId,
        )
        if (existing) {
          existing.count += ing.count
        } else {
          returnedIngredients.push({
            mushroomId: ing.mushroomId,
            count: ing.count,
          })
        }
      }
      return {
        ...prev,
        inventory: returnedIngredients,
        brewing: {
          potionId: null,
          startedAt: null,
          finishTime: null,
          boosted: false,
        },
      }
    })
  }, [])

  const mcBoostBrew = useCallback(() => {
    setState((prev) => {
      if (!prev.brewing.potionId || prev.brewing.boosted) return prev
      if (!prev.brewing.finishTime || !prev.brewing.startedAt) return prev
      const elapsed = Date.now() - prev.brewing.startedAt
      const totalDuration = prev.brewing.finishTime - prev.brewing.startedAt
      const newElapsed = elapsed * MC_BREW_BOOST_MULTIPLIER
      return {
        ...prev,
        brewing: {
          ...prev.brewing,
          finishTime:
            prev.brewing.startedAt + Math.min(newElapsed, totalDuration),
          boosted: true,
        },
      }
    })
  }, [])

  /* ==============================================================
     POTION EQUIP & USE
     ============================================================== */

  const mcEquipPotion = useCallback((potionId: string, slot: number) => {
    setState((prev) => {
      const potionItem = prev.potions.find((p) => p.potionId === potionId)
      if (!potionItem || potionItem.count <= 0) return prev
      if (slot < 0 || slot >= MC_EQUIP_SLOTS) return prev
      return {
        ...prev,
        equippedPotions: prev.equippedPotions.map((eq) =>
          eq.slot === slot
            ? { ...eq, potionId, remainingUses: 3 }
            : eq,
        ),
        potions: prev.potions
          .map((p) =>
            p.potionId === potionId ? { ...p, count: p.count - 1 } : p,
          )
          .filter((p) => p.count > 0),
      }
    })
  }, [])

  const mcUnequipPotion = useCallback((slot: number) => {
    setState((prev) => {
      if (slot < 0 || slot >= MC_EQUIP_SLOTS) return prev
      const eq = prev.equippedPotions[slot]
      if (!eq || !eq.potionId) return prev
      const existing = prev.potions.find((p) => p.potionId === eq.potionId)
      const updatedPotions = existing
        ? prev.potions.map((p) =>
            p.potionId === eq.potionId
              ? { ...p, count: p.count + eq.remainingUses }
              : p,
          )
        : [...prev.potions, { potionId: eq.potionId, count: eq.remainingUses }]
      return {
        ...prev,
        potions: updatedPotions,
        equippedPotions: prev.equippedPotions.map((e) =>
          e.slot === slot
            ? { ...e, potionId: null, remainingUses: 0 }
            : e,
        ),
      }
    })
  }, [])

  const mcUsePotion = useCallback((slot: number) => {
    setState((prev) => {
      if (slot < 0 || slot >= MC_EQUIP_SLOTS) return prev
      const eq = prev.equippedPotions[slot]
      if (!eq || !eq.potionId || eq.remainingUses <= 0) return prev
      const potion = MC_POTIONS.find((p) => p.id === eq.potionId)
      if (!potion) return prev
      const newEquipped = prev.equippedPotions.map((e) =>
        e.slot === slot
          ? { ...e, remainingUses: eq.remainingUses - 1 }
          : e,
      )
      let newEffects = [...prev.activeEffects]
      if (potion.duration > 0) {
        newEffects = newEffects.filter((ef) => ef.potionId !== potion.id)
        newEffects.push({
          potionId: potion.id,
          name: potion.name,
          effect: potion.effect,
          expiresAt: Date.now() + potion.duration * 1000,
          strength: MC_RARITY[potion.rarity].xpMultiplier,
        })
      }
      return { ...prev, equippedPotions: newEquipped, activeEffects: newEffects }
    })
  }, [])

  /* ==============================================================
     CAVERN EXPLORATION
     ============================================================== */

  const mcUnlockCavern = useCallback((cavernId: string) => {
    setState((prev) => {
      const cavern = MC_CAVERNS.find((c) => c.id === cavernId)
      if (!cavern) return prev
      const record = prev.caverns.find((c) => c.cavernId === cavernId)
      if (!record || record.explored) return prev
      if (prev.level < cavern.requiredLevel) return prev
      if (prev.goldCount < cavern.unlockCost) return prev
      return {
        ...prev,
        caverns: prev.caverns.map((c) =>
          c.cavernId === cavernId ? { ...c, explored: true } : c,
        ),
        goldCount: prev.goldCount - cavern.unlockCost,
      }
    })
  }, [])

  const mcExploreCavern = useCallback(
    (cavernId: string, explorePercent: number) => {
      const cavern = MC_CAVERNS.find((c) => c.id === cavernId)
      if (!cavern) return
      setState((prev) => {
        const record = prev.caverns.find((c) => c.cavernId === cavernId)
        if (!record || !record.explored) return prev
        if (record.explorationPercent >= 100) return prev
        const newPercent = Math.min(
          100,
          record.explorationPercent + explorePercent,
        )
        return {
          ...prev,
          caverns: prev.caverns.map((c) =>
            c.cavernId === cavernId
              ? {
                  ...c,
                  explorationPercent: newPercent,
                  totalExplored: c.totalExplored + explorePercent,
                }
              : c,
          ),
        }
      })
      const xpGain = Math.floor(
        cavern.dangerLevel * 10 * (explorePercent / 10),
      )
      mcAddXp(xpGain)
    },
    [mcAddXp],
  )

  /* ==============================================================
     CREATURE ENCOUNTER & TAMING
     ============================================================== */

  const mcEncounterCreature = useCallback(
    (creatureId: string) => {
      const creature = MC_CREATURES.find((c) => c.id === creatureId)
      if (!creature) return
      setState((prev) => {
        const record = prev.creatures.find((c) => c.creatureId === creatureId)
        if (!record || record.encountered) return prev
        return {
          ...prev,
          creatures: prev.creatures.map((c) =>
            c.creatureId === creatureId ? { ...c, encountered: true } : c,
          ),
        }
      })
      mcAddXp(Math.floor(creature.xpReward * 0.1))
    },
    [mcAddXp],
  )

  const mcDefeatCreature = useCallback(
    (creatureId: string) => {
      const creature = MC_CREATURES.find((c) => c.id === creatureId)
      if (!creature) return
      setState((prev) => {
        const record = prev.creatures.find((c) => c.creatureId === creatureId)
        if (!record) return prev
        const isBoss = creature.type === 'boss'
        const wasNewDefeat = !record.defeated
        return {
          ...prev,
          creatures: prev.creatures.map((c) =>
            c.creatureId === creatureId ? { ...c, defeated: true } : c,
          ),
          totalBossesDefeated:
            isBoss && wasNewDefeat
              ? prev.totalBossesDefeated + 1
              : prev.totalBossesDefeated,
        }
      })
      mcAddXp(creature.xpReward)
    },
    [mcAddXp],
  )

  const mcTameCreature = useCallback((creatureId: string) => {
    setState((prev) => {
      const creature = MC_CREATURES.find((c) => c.id === creatureId)
      if (!creature || !creature.tameable) return prev
      const record = prev.creatures.find((c) => c.creatureId === creatureId)
      if (!record || record.tamed || !record.encountered) return prev
      if (prev.sporeCount < MC_TAME_FEED_COST) return prev
      return {
        ...prev,
        creatures: prev.creatures.map((c) =>
          c.creatureId === creatureId ? { ...c, tamed: true } : c,
        ),
        sporeCount: prev.sporeCount - MC_TAME_FEED_COST,
        totalCreaturesTamed: prev.totalCreaturesTamed + 1,
      }
    })
  }, [])

  const mcFeedCreature = useCallback((creatureId: string) => {
    setState((prev) => {
      const record = prev.creatures.find((c) => c.creatureId === creatureId)
      if (!record || !record.tamed) return prev
      return {
        ...prev,
        creatures: prev.creatures.map((c) =>
          c.creatureId === creatureId
            ? { ...c, feedCount: c.feedCount + 1, lastFedAt: Date.now() }
            : c,
        ),
      }
    })
  }, [])

  /* ==============================================================
     CULTIVATION
     ============================================================== */

  const mcPlantCultivation = useCallback(
    (slotId: string, mushroomId: string) => {
      setState((prev) => {
        const slot = prev.cultivationSlots.find((s) => s.id === slotId)
        if (!slot || slot.mushroomId !== null) return prev
        const invItem = prev.inventory.find((i) => i.mushroomId === mushroomId)
        if (!invItem || invItem.count < 1) return prev
        const updatedInventory =
          invItem.count === 1
            ? prev.inventory.filter((i) => i.mushroomId !== mushroomId)
            : prev.inventory.map((i) =>
                i.mushroomId === mushroomId
                  ? { ...i, count: i.count - 1 }
                  : i,
              )
        return {
          ...prev,
          cultivationSlots: prev.cultivationSlots.map((s) =>
            s.id === slotId
              ? { ...s, mushroomId, plantedAt: Date.now() }
              : s,
          ),
          inventory: updatedInventory,
        }
      })
    },
    [],
  )

  const mcHarvestCultivation = useCallback(
    (slotId: string) => {
      const slot = stateRef.current.cultivationSlots.find(
        (s) => s.id === slotId,
      )
      if (!slot || !slot.mushroomId || !slot.plantedAt) return
      if (Date.now() - slot.plantedAt < slot.growthTime) return
      const yieldAmount = Math.max(
        1,
        Math.floor(
          (1 + stateRef.current.gardenLevel * 0.15) * slot.yieldMultiplier,
        ),
      )
      setState((prev) => ({
        ...prev,
        cultivationSlots: prev.cultivationSlots.map((s) =>
          s.id === slotId
            ? { ...s, mushroomId: null, plantedAt: null }
            : s,
        ),
        totalCultivated: prev.totalCultivated + yieldAmount,
      }))
      for (let i = 0; i < yieldAmount; i++) {
        mcHarvestShroom(slot.mushroomId)
      }
    },
    [mcHarvestShroom],
  )

  /* ==============================================================
     GARDEN UPGRADE
     ============================================================== */

  const mcUpgradeGarden = useCallback(() => {
    setState((prev) => {
      const nextLevel = prev.gardenLevel + 1
      if (nextLevel > MC_MAX_GARDEN_LEVEL) return prev
      const cost = MC_GARDEN_UPGRADE_COSTS[nextLevel]
      if (prev.goldCount < cost) return prev
      const newSlot: McCultivationSlot = {
        id: `slot-${prev.gardenSlots}`,
        mushroomId: null,
        plantedAt: null,
        growthTime: MC_CULTIVATION_BASE_TIME,
        yieldMultiplier: 1 + nextLevel * 0.1,
      }
      return {
        ...prev,
        gardenLevel: nextLevel,
        gardenSlots: prev.gardenSlots + 1,
        goldCount: prev.goldCount - cost,
        cultivationSlots: [...prev.cultivationSlots, newSlot],
      }
    })
  }, [])

  /* ==============================================================
     MYCELIUM NETWORK
     ============================================================== */

  const mcExpandNetwork = useCallback(
    (nodeId: string, targetNodeId: string) => {
      setState((prev) => {
        const node = prev.myceliumNodes.find((n) => n.id === nodeId)
        const target = prev.myceliumNodes.find((n) => n.id === targetNodeId)
        if (!node || !target) return prev
        if (node.strength < 10) return prev
        if (node.connectedNodes.includes(targetNodeId)) return prev
        const cost =
          MC_NETWORK_EXPAND_COST_BASE * (node.connectedNodes.length + 1)
        if (prev.sporeCount < cost) return prev
        const bonusTypes = ['xp', 'spore', 'gold', 'harvest', 'brew_speed']
        const bonusType =
          bonusTypes[Math.floor(Math.random() * bonusTypes.length)]
        const bonusValue = 5 + Math.floor(Math.random() * 10)
        return {
          ...prev,
          myceliumNodes: prev.myceliumNodes.map((n) =>
            n.id === nodeId
              ? {
                  ...n,
                  connectedNodes: [...n.connectedNodes, targetNodeId],
                  bonusType,
                  bonusValue,
                }
              : n,
          ),
          sporeCount: prev.sporeCount - cost,
        }
      })
    },
    [],
  )

  const mcStrengthenNetwork = useCallback((nodeId: string) => {
    setState((prev) => {
      const node = prev.myceliumNodes.find((n) => n.id === nodeId)
      if (!node || node.strength >= node.maxStrength) return prev
      const cost = 20 + node.strength * 2
      if (prev.sporeCount < cost) return prev
      const gain = Math.min(10, node.maxStrength - node.strength)
      return {
        ...prev,
        myceliumNodes: prev.myceliumNodes.map((n) =>
          n.id === nodeId ? { ...n, strength: n.strength + gain } : n,
        ),
        sporeCount: prev.sporeCount - cost,
      }
    })
  }, [])

  /* ==============================================================
     HARVEST MODE
     ============================================================== */

  const mcSetHarvestMode = useCallback((mode: McHarvestMode) => {
    setState((prev) => ({ ...prev, harvestMode: mode }))
  }, [])

  const mcSetTargetMushroom = useCallback((mushroomId: string | null) => {
    setState((prev) => ({ ...prev, targetMushroomId: mushroomId }))
  }, [])

  /* ==============================================================
     SAVE / RESET (mcResetProgress is plain, NOT useCallback)
     ============================================================== */

  const mcForceSave = useCallback(() => {
    mcSaveState(stateRef.current)
  }, [])

  const mcResetProgress = () => {
    const fresh = mcCreateDefaultState()
    setState(fresh)
    mcSaveState(fresh)
  }

  const mcExportSave = useCallback((): string => {
    return JSON.stringify(stateRef.current, null, 2)
  }, [])

  const mcImportSave = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as McGameState
      setState(parsed)
      mcSaveState(parsed)
      return true
    } catch {
      return false
    }
  }, [])

  /* ==============================================================
     PLAIN GETTERS
     ============================================================== */

  const mcGetLevel = (): number => state.level
  const mcGetXp = (): number => state.xp
  const mcGetTotalXp = (): number => state.totalXp
  const mcGetXpToNext = (): number =>
    state.level >= MC_MAX_LEVEL ? 0 : MC_XP_TABLE[state.level]

  const mcGetXpProgress = (): number => {
    if (state.level >= MC_MAX_LEVEL) return 100
    const needed = MC_XP_TABLE[state.level]
    return needed === 0 ? 0 : Math.floor((state.xp / needed) * 100)
  }

  const mcGetSporeCount = (): number => state.sporeCount
  const mcGetGoldCount = (): number => state.goldCount
  const mcGetTotalGoldEarned = (): number => state.totalGoldEarned
  const mcGetTotalSporesEarned = (): number => state.totalSporesEarned
  const mcGetGardenLevel = (): number => state.gardenLevel
  const mcGetGardenSlots = (): number => state.gardenSlots
  const mcGetHarvestMode = (): McHarvestMode => state.harvestMode
  const mcGetTargetMushroomId = (): string | null => state.targetMushroomId
  const mcGetTotalHarvested = (): number => state.totalHarvested
  const mcGetTotalPotionsBrewed = (): number => state.totalPotionsBrewed
  const mcGetTotalCultivated = (): number => state.totalCultivated
  const mcGetTotalCavernExplored = (): number =>
    state.caverns.filter((c) => c.explored).length
  const mcGetTotalCreaturesTamed = (): number => state.totalCreaturesTamed
  const mcGetTotalBossesDefeated = (): number => state.totalBossesDefeated
  const mcGetDiscoveredCount = (): number => state.discovered.length
  const mcGetPlayTimeMinutes = (): number => state.playTimeMinutes
  const mcGetDailyHarvestStreak = (): number => state.dailyHarvestStreak
  const mcGetInventory = (): McInventoryItem[] => state.inventory
  const mcGetPotions = (): McPotionItem[] => state.potions
  const mcGetEquippedPotions = (): McEquippedPotion[] => state.equippedPotions
  const mcGetActiveEffects = (): McActiveEffect[] => state.activeEffects
  const mcGetCaverns = (): McCavernRecord[] => state.caverns
  const mcGetCreatures = (): McCreatureRecord[] => state.creatures
  const mcGetAchievements = (): McAchievementRecord[] => state.achievements
  const mcGetCultivationSlots = (): McCultivationSlot[] =>
    state.cultivationSlots
  const mcGetMyceliumNodes = (): McMyceliumNode[] => state.myceliumNodes
  const mcGetTradeLog = (): McTradeLog[] => state.tradeLog
  const mcGetBrewingStatus = (): McBrewingStatus => state.brewing

  const mcGetBrewProgress = (): number => {
    if (!state.brewing.startedAt || !state.brewing.finishTime) return 0
    if (Date.now() >= state.brewing.finishTime) return 100
    const total = state.brewing.finishTime - state.brewing.startedAt
    return total <= 0
      ? 100
      : Math.floor(((Date.now() - state.brewing.startedAt) / total) * 100)
  }

  const mcIsBrewComplete = (): boolean => {
    return (
      !!state.brewing.finishTime && Date.now() >= state.brewing.finishTime
    )
  }

  const mcGetCultivationProgress = (slotId: string): number => {
    const slot = state.cultivationSlots.find((s) => s.id === slotId)
    if (!slot || !slot.mushroomId || !slot.plantedAt) return -1
    if (Date.now() - slot.plantedAt >= slot.growthTime) return 100
    return Math.floor(
      ((Date.now() - slot.plantedAt) / slot.growthTime) * 100,
    )
  }

  const mcHasEffect = (effect: string): boolean => {
    return state.activeEffects.some(
      (e) => e.effect === effect && (e.expiresAt === 0 || e.expiresAt > Date.now()),
    )
  }

  const mcIsAchievementUnlocked = (achievementId: string): boolean => {
    return state.achievements.some((a) => a.achievementId === achievementId)
  }

  const mcGetMushroomData = (
    id: string,
  ): McMushroom | undefined => MC_MUSHROOMS.find((m) => m.id === id)

  const mcGetCavernData = (
    id: string,
  ): McCavern | undefined => MC_CAVERNS.find((c) => c.id === id)

  const mcGetPotionData = (
    id: string,
  ): McPotion | undefined => MC_POTIONS.find((p) => p.id === id)

  const mcGetCreatureData = (
    id: string,
  ): McCreature | undefined => MC_CREATURES.find((c) => c.id === id)

  const mcGetTitleData = (
    id: string,
  ): McTitle | undefined => MC_TITLES.find((t) => t.id === id)

  const mcGetAchievementData = (
    id: string,
  ): McAchievement | undefined => MC_ACHIEVEMENTS.find((a) => a.id === id)

  const mcGetRarityData = (tier: McRarityTier): McRarityInfo => MC_RARITY[tier]

  const mcGetCurrentTitle = (): McTitle => {
    const eligible = MC_TITLES.filter((t) => state.level >= t.requiredLevel)
    return eligible.length > 0 ? eligible[eligible.length - 1] : MC_TITLES[0]
  }

  const mcGetNextTitle = (): McTitle | null => {
    const current = mcGetCurrentTitle()
    const idx = MC_TITLES.findIndex((t) => t.id === current.id)
    return idx < MC_TITLES.length - 1 ? MC_TITLES[idx + 1] : null
  }

  const mcGetMushroomsByHabitat = (habitat: string): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.habitat === habitat)

  const mcGetMushroomsByRarity = (rarity: McRarityTier): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.rarity === rarity)

  const mcGetMushroomsByType = (type: McMushroomType): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.type === type)

  const mcGetCreaturesByType = (type: McCreatureType): McCreature[] =>
    MC_CREATURES.filter((c) => c.type === type)

  const mcGetCavernsSorted = (): McCavern[] =>
    [...MC_CAVERNS].sort((a, b) => a.depth - b.depth)

  const mcGetPotionsByRarity = (rarity: McRarityTier): McPotion[] =>
    MC_POTIONS.filter((p) => p.rarity === rarity)

  const mcGetDiscoveredMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => state.discovered.includes(m.id))

  const mcGetUndiscoveredMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => !state.discovered.includes(m.id))

  const mcGetTameableCreatures = (): McCreature[] =>
    MC_CREATURES.filter((c) => c.tameable)

  const mcGetBossCreatures = (): McCreature[] =>
    MC_CREATURES.filter((c) => c.type === 'boss')

  const mcGetBioluminescentMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.glowIntensity > 0.3)

  const mcGetToxicMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.type === 'toxic')

  const mcGetMagicalMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.type === 'magical')

  const mcGetLegendaryMushrooms = (): McMushroom[] =>
    MC_MUSHROOMS.filter((m) => m.rarity === 'legendary')

  const mcGetHostileCreatures = (): McCreature[] =>
    MC_CREATURES.filter((c) => c.type === 'hostile')

  const mcGetMushroomCount = (): number => MC_MUSHROOMS.length
  const mcGetPotionCount = (): number => MC_POTIONS.length
  const mcGetCreatureCount = (): number => MC_CREATURES.length
  const mcGetCavernCount = (): number => MC_CAVERNS.length
  const mcGetAchievementCount = (): number => MC_ACHIEVEMENTS.length
  const mcGetTitleCount = (): number => MC_TITLES.length

  const mcGetInventoryTotalItems = (): number =>
    state.inventory.reduce((sum, i) => sum + i.count, 0)

  const mcGetPotionInventoryTotal = (): number =>
    state.potions.reduce((sum, p) => sum + p.count, 0)

  const mcGetRarityDistribution = (): Record<McRarityTier, number> => {
    const dist: Record<McRarityTier, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    }
    for (const h of state.harvested) {
      const m = MC_MUSHROOMS.find((mush) => mush.id === h.mushroomId)
      if (m) dist[m.rarity] += h.count
    }
    return dist
  }

  const mcGetNetworkCoverage = (): number => {
    const total = state.myceliumNodes.length
    if (total === 0) return 0
    const active = state.myceliumNodes.filter((n) => n.strength > 0).length
    return Math.floor((active / total) * 100)
  }

  const mcGetGardenUpgradeCost = (): number => {
    const next = state.gardenLevel + 1
    return next <= MC_MAX_GARDEN_LEVEL ? MC_GARDEN_UPGRADE_COSTS[next] : 0
  }

  const mcIsGardenMaxed = (): boolean =>
    state.gardenLevel >= MC_MAX_GARDEN_LEVEL

  const mcGetExpansionCost = (nodeId: string): number => {
    const node = state.myceliumNodes.find((n) => n.id === nodeId)
    return node
      ? MC_NETWORK_EXPAND_COST_BASE * (node.connectedNodes.length + 1)
      : 0
  }

  const mcGetStrengthenCost = (nodeId: string): number => {
    const node = state.myceliumNodes.find((n) => n.id === nodeId)
    return node ? 20 + node.strength * 2 : 0
  }

  const mcGetHighestRarityHarvested = (): McRarityTier | null => {
    const tiers: McRarityTier[] = [
      'legendary',
      'epic',
      'rare',
      'uncommon',
      'common',
    ]
    for (const tier of tiers) {
      const found = state.harvested.find(
        (h) =>
          MC_MUSHROOMS.find((m) => m.id === h.mushroomId)?.rarity ===
            tier && h.count > 0,
      )
      if (found) return tier
    }
    return null
  }

  const mcGetMostHarvestedMushroom = (): {
    id: string
    name: string
    count: number
  } | null => {
    if (state.harvested.length === 0) return null
    const sorted = [...state.harvested].sort((a, b) => b.count - a.count)
    const top = sorted[0]
    const mushroom = MC_MUSHROOMS.find((m) => m.id === top.mushroomId)
    return mushroom
      ? { id: mushroom.id, name: mushroom.name, count: top.count }
      : null
  }

  const mcGetCultivationSlotCount = (): number => state.cultivationSlots.length

  const mcGetEmptyCultivationSlots = (): McCultivationSlot[] =>
    state.cultivationSlots.filter((s) => s.mushroomId === null)

  const mcGetReadyCultivations = (): McCultivationSlot[] => {
    const now = Date.now()
    return state.cultivationSlots.filter(
      (s) =>
        s.mushroomId !== null &&
        s.plantedAt !== null &&
        now - s.plantedAt >= s.growthTime,
    )
  }

  const mcGetUnlockedCaverns = (): McCavern[] =>
    MC_CAVERNS.filter((c) =>
      state.caverns.find((r) => r.cavernId === c.id)?.explored,
    )

  const mcGetLockedCaverns = (): McCavern[] =>
    MC_CAVERNS.filter(
      (c) => !state.caverns.find((r) => r.cavernId === c.id)?.explored,
    )

  const mcGetCavernMushroomCounts = (
    cavernId: string,
  ): { total: number; discovered: number } => {
    const cavern = MC_CAVERNS.find((c) => c.id === cavernId)
    if (!cavern) return { total: 0, discovered: 0 }
    const total = cavern.mushroomIds.length
    const discovered = cavern.mushroomIds.filter((mid) =>
      state.discovered.includes(mid),
    ).length
    return { total, discovered }
  }

  const mcGetCavernCreatureCounts = (
    cavernId: string,
  ): { total: number; encountered: number; tamed: number } => {
    const cavern = MC_CAVERNS.find((c) => c.id === cavernId)
    if (!cavern) return { total: 0, encountered: 0, tamed: 0 }
    const total = cavern.creatureIds.length
    let encountered = 0
    let tamed = 0
    for (const cid of cavern.creatureIds) {
      const record = state.creatures.find((cr) => cr.creatureId === cid)
      if (record?.encountered) encountered++
      if (record?.tamed) tamed++
    }
    return { total, encountered, tamed }
  }

  const mcGetAllTitles = (): McTitle[] => [...MC_TITLES]
  const mcGetAllAchievements = (): McAchievement[] => [...MC_ACHIEVEMENTS]

  const mcGetUnlockedAchievements = (): McAchievement[] => {
    const unlockedIds = new Set(
      state.achievements.map((a) => a.achievementId),
    )
    return MC_ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
  }

  const mcGetLockedAchievements = (): McAchievement[] => {
    const unlockedIds = new Set(
      state.achievements.map((a) => a.achievementId),
    )
    return MC_ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))
  }

  const mcGetCavernCompletionSummary = (): {
    id: string
    name: string
    percent: number
    explored: boolean
  }[] => {
    return MC_CAVERNS.map((cavern) => {
      const record = state.caverns.find((r) => r.cavernId === cavern.id)
      return {
        id: cavern.id,
        name: cavern.name,
        percent: record?.explorationPercent ?? 0,
        explored: record?.explored ?? false,
      }
    })
  }

  const mcGetBrewablePotions = (): McPotion[] => {
    if (state.brewing.potionId !== null) return []
    return MC_POTIONS.filter((potion) =>
      potion.ingredients.every((ing) => {
        const inv = state.inventory.find((i) => i.mushroomId === ing.mushroomId)
        return inv && inv.count >= ing.count
      }),
    )
  }

  const mcGetHarvestableMushrooms = (): McMushroom[] => {
    return MC_MUSHROOMS.filter((m) => {
      const cavern = MC_CAVERNS.find((c) => c.mushroomIds.includes(m.id))
      if (!cavern) return false
      const record = state.caverns.find((r) => r.cavernId === cavern.id)
      return record?.explored ?? false
    })
  }

  const mcGetTamedCreatureRecords = (): McCreatureRecord[] =>
    state.creatures.filter((c) => c.tamed)

  const mcGetActiveCultivations = (): (McCultivationSlot & {
    mushroomName: string
  })[] => {
    return state.cultivationSlots
      .filter((s) => s.mushroomId !== null && s.plantedAt !== null)
      .map((s) => {
        const mushroom = MC_MUSHROOMS.find((m) => m.id === s.mushroomId)
        return { ...s, mushroomName: mushroom?.name ?? 'Unknown' }
      })
  }

  const mcGetTotalConnections = (): number =>
    state.myceliumNodes.reduce((sum, n) => sum + n.connectedNodes.length, 0)

  const mcGetSessionDuration = (): number => {
    return Math.floor((Date.now() - state.sessionStartTime) / 60000)
  }

  const mcGetDiscoveryPercent = (): number => {
    const total = MC_MUSHROOMS.length
    if (total === 0) return 0
    return Math.floor((state.discovered.length / total) * 100)
  }

  const mcGetCreatureEncounterPercent = (): number => {
    const total = MC_CREATURES.length
    if (total === 0) return 0
    const encountered = state.creatures.filter((c) => c.encountered).length
    return Math.floor((encountered / total) * 100)
  }

  const mcGetAchievementPercent = (): number => {
    const total = MC_ACHIEVEMENTS.length
    if (total === 0) return 0
    return Math.floor((state.achievements.length / total) * 100)
  }

  return {
    mcAddXp,
    mcAddSpores,
    mcAddGold,
    mcCheckAchievements,
    mcHarvestShroom,
    mcDiscoverMushroom,
    mcSellMushroom,
    mcSellAllMushrooms,
    mcCanBrewPotion,
    mcBrewPotion,
    mcCollectBrew,
    mcCancelBrew,
    mcBoostBrew,
    mcEquipPotion,
    mcUnequipPotion,
    mcUsePotion,
    mcUnlockCavern,
    mcExploreCavern,
    mcEncounterCreature,
    mcDefeatCreature,
    mcTameCreature,
    mcFeedCreature,
    mcPlantCultivation,
    mcHarvestCultivation,
    mcUpgradeGarden,
    mcExpandNetwork,
    mcStrengthenNetwork,
    mcSetHarvestMode,
    mcSetTargetMushroom,
    mcForceSave,
    mcResetProgress,
    mcExportSave,
    mcImportSave,
    mcGetLevel,
    mcGetXp,
    mcGetTotalXp,
    mcGetXpToNext,
    mcGetXpProgress,
    mcGetSporeCount,
    mcGetGoldCount,
    mcGetTotalGoldEarned,
    mcGetTotalSporesEarned,
    mcGetGardenLevel,
    mcGetGardenSlots,
    mcGetHarvestMode,
    mcGetTargetMushroomId,
    mcGetTotalHarvested,
    mcGetTotalPotionsBrewed,
    mcGetTotalCultivated,
    mcGetTotalCavernExplored,
    mcGetTotalCreaturesTamed,
    mcGetTotalBossesDefeated,
    mcGetDiscoveredCount,
    mcGetPlayTimeMinutes,
    mcGetDailyHarvestStreak,
    mcGetInventory,
    mcGetPotions,
    mcGetEquippedPotions,
    mcGetActiveEffects,
    mcGetCaverns,
    mcGetCreatures,
    mcGetAchievements,
    mcGetCultivationSlots,
    mcGetMyceliumNodes,
    mcGetTradeLog,
    mcGetBrewingStatus,
    mcGetBrewProgress,
    mcIsBrewComplete,
    mcGetCultivationProgress,
    mcHasEffect,
    mcIsAchievementUnlocked,
    mcGetMushroomData,
    mcGetCavernData,
    mcGetPotionData,
    mcGetCreatureData,
    mcGetTitleData,
    mcGetAchievementData,
    mcGetRarityData,
    mcGetCurrentTitle,
    mcGetNextTitle,
    mcGetMushroomsByHabitat,
    mcGetMushroomsByRarity,
    mcGetMushroomsByType,
    mcGetCreaturesByType,
    mcGetCavernsSorted,
    mcGetPotionsByRarity,
    mcGetDiscoveredMushrooms,
    mcGetUndiscoveredMushrooms,
    mcGetTameableCreatures,
    mcGetBossCreatures,
    mcGetBioluminescentMushrooms,
    mcGetToxicMushrooms,
    mcGetMagicalMushrooms,
    mcGetLegendaryMushrooms,
    mcGetHostileCreatures,
    mcGetMushroomCount,
    mcGetPotionCount,
    mcGetCreatureCount,
    mcGetCavernCount,
    mcGetAchievementCount,
    mcGetTitleCount,
    mcGetInventoryTotalItems,
    mcGetPotionInventoryTotal,
    mcGetRarityDistribution,
    mcGetNetworkCoverage,
    mcGetGardenUpgradeCost,
    mcIsGardenMaxed,
    mcGetExpansionCost,
    mcGetStrengthenCost,
    mcGetHighestRarityHarvested,
    mcGetMostHarvestedMushroom,
    mcGetCultivationSlotCount,
    mcGetEmptyCultivationSlots,
    mcGetReadyCultivations,
    mcGetUnlockedCaverns,
    mcGetLockedCaverns,
    mcGetCavernMushroomCounts,
    mcGetCavernCreatureCounts,
    mcGetAllTitles,
    mcGetAllAchievements,
    mcGetUnlockedAchievements,
    mcGetLockedAchievements,
    mcGetCavernCompletionSummary,
    mcGetBrewablePotions,
    mcGetHarvestableMushrooms,
    mcGetTamedCreatureRecords,
    mcGetActiveCultivations,
    mcGetTotalConnections,
    mcGetSessionDuration,
    mcGetDiscoveryPercent,
    mcGetCreatureEncounterPercent,
    mcGetAchievementPercent,
  }
}
