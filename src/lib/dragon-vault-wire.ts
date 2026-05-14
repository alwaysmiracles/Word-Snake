'use client'
import { useState, useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// DV_ CONSTANTS
// ---------------------------------------------------------------------------

const DV_MAX_LEVEL = 50
const DV_STORAGE_KEY = 'dragon-vault-save'
const DV_RARITY_COMMON = 'common' as const
const DV_RARITY_UNCOMMON = 'uncommon' as const
const DV_RARITY_RARE = 'rare' as const
const DV_RARITY_EPIC = 'epic' as const
const DV_RARITY_LEGENDARY = 'legendary' as const

const DV_RARITY_ORDER: readonly string[] = [
  DV_RARITY_COMMON,
  DV_RARITY_UNCOMMON,
  DV_RARITY_RARE,
  DV_RARITY_EPIC,
  DV_RARITY_LEGENDARY,
]

const DV_RARITY_COLORS: Record<string, string> = {
  [DV_RARITY_COMMON]: '#8b8b8b',
  [DV_RARITY_UNCOMMON]: '#4fc3f7',
  [DV_RARITY_RARE]: '#ab47bc',
  [DV_RARITY_EPIC]: '#ff7043',
  [DV_RARITY_LEGENDARY]: '#ffd54f',
}

const DV_GEM_COLORS: Record<string, string> = {
  fire: '#ef4444',
  ice: '#38bdf8',
  storm: '#a855f7',
  earth: '#65a30d',
  shadow: '#6b21a8',
  light: '#facc15',
  void: '#1e1b4b',
  nature: '#16a34a',
  cosmic: '#6366f1',
  blood: '#991b1b',
}

const DV_DRAGON_COLORS: Record<string, string> = {
  fire: '#dc2626',
  ice: '#0ea5e9',
  storm: '#7c3aed',
  earth: '#854d0e',
  shadow: '#4c1d95',
  light: '#ca8a04',
  void: '#0f0f23',
  nature: '#15803d',
  cosmic: '#4f46e5',
  blood: '#7f1d1d',
  crystal: '#e879f9',
  magma: '#f97316',
  mist: '#94a3b8',
  bone: '#d6d3d1',
  ember: '#ea580c',
  frost: '#22d3ee',
  thunder: '#eab308',
  abyss: '#312e81',
  jade: '#34d399',
  onyx: '#292524',
  spectral: '#c084fc',
  primal: '#b91c1c',
}

const DV_VAULT_EXPANSION_COST_BASE = 100
const DV_VAULT_EXPANSION_COST_MULTIPLIER = 2.5
const DV_GEM_BASE_POWER = 10
const DV_DRAGON_BASE_POWER = 50
const DV_EQUIPMENT_BASE_POWER = 25
const DV_DEFENSE_BASE_HEALTH = 100
const DV_DEFENSE_REGEN_RATE = 5
const DV_XP_PER_GEM_COLLECT = 15
const DV_XP_PER_DRAGON_BOND = 40
const DV_XP_PER_VAULT_EXPLORE = 25
const DV_XP_PER_DEFENSE_WIN = 50
const DV_XP_PER_ACHIEVEMENT = 100
const DV_COINS_PER_GEM_SELL = 5
const DV_COINS_PER_VAULT_CLEAR = 200
const DV_DRAGON_BOND_MAX = 100
const DV_DRAGON_FEED_COST = 10
const DV_DRAGON_FEED_BOND_GAIN = 5
const DV_EQUIPMENT_UPGRADE_BASE_COST = 50
const DV_EQUIPMENT_UPGRADE_MULTIPLIER = 1.8
const DV_EQUIPMENT_MAX_LEVEL = 10
const DV_DEFENSE_WAVE_BASE_ENEMIES = 5
const DV_DEFENSE_WAVE_DIFFICULTY_SCALE = 1.3
const DV_MAX_DRAGONS_ACTIVE = 3
const DV_MAX_GEMS_INVENTORY = 99
const DV_DAILY_LOGIN_COINS = 50
const DV_DAILY_LOGIN_STREAK_BONUS = 10
const DV_SPIRIT_SHARD_VALUE = 1
const DV_TREASURE_CHEST_BASE_COINS = 100
const DV_FORGE_COMBINE_COST = 3
const DV_CRAFTING_COST_MULTIPLIER = 1.5
const DV_MAX_CRAFTING_LEVEL = 5
const DV_DRAGON_ABILITY_COOLDOWN_BASE = 3
const DV_DRAGON_ABILITY_COOLDOWN_REDUCTION = 0.05
const DV_BOOST_DURATION_BASE = 30
const DV_BOOST_XP_MULTIPLIER = 2
const DV_BOOST_COIN_MULTIPLIER = 2
const DV_BOOST_DROP_RATE_BONUS = 0.2
const DV_ENCHANT_SLOT_COST = 200
const DV_MAX_ENCHANT_SLOTS = 3
const DV_ELEMENTAL_SHIELD_DURABILITY = 100
const DV_VAULT_LOCKED_REWARD_COINS = 500
const DV_DRAGON_TRADE_COOLDOWN = 86400000
const DV_MARKET_FEE_PERCENT = 10
const DV_REFORGE_COST = 150
const DV_REFORGE_LEVEL_PENALTY = 1
const DV_STARDUST_VALUE = 5
const DV_DRAGON_EGG_HATCH_TIME = 60000
const DV_QUEST_MAX_ACTIVE = 5
const DV_QUEST_REFRESH_COST = 100

const DV_XP_TABLE: number[] = []
for (let i = 0; i <= DV_MAX_LEVEL; i++) {
  DV_XP_TABLE.push(Math.floor(100 * Math.pow(1.15, i)))
}

// ---------------------------------------------------------------------------
// DV_ TYPES
// ---------------------------------------------------------------------------

type DVRarity = typeof DV_RARITY_COMMON | typeof DV_RARITY_UNCOMMON | typeof DV_RARITY_RARE | typeof DV_RARITY_EPIC | typeof DV_RARITY_LEGENDARY

interface DVGem {
  id: string
  name: string
  element: string
  rarity: DVRarity
  power: number
  description: string
  value: number
  color: string
  glowColor: string
}

interface DVDragon {
  id: string
  name: string
  element: string
  rarity: DVRarity
  basePower: number
  baseHealth: number
  bondLevel: number
  abilities: string[]
  description: string
  color: string
}

interface DVVaultChamber {
  id: string
  name: string
  description: string
  requiredLevel: number
  dangerLevel: number
  rewards: string[]
  gemChance: number
  dragonEncounterChance: number
  equipmentChance: number
  cleared: boolean
  element: string
  color: string
}

interface DVEquipment {
  id: string
  name: string
  type: string
  rarity: DVRarity
  power: number
  level: number
  maxLevel: number
  upgradeCost: number
  description: string
  dragonBonus: number
  defenseBonus: number
  color: string
}

interface DVTitle {
  id: string
  name: string
  requirement: string
  requiredLevel: number
  bonusXpPercent: number
  bonusCoinPercent: number
  color: string
}

interface DVAchievement {
  id: string
  name: string
  description: string
  rewardCoins: number
  rewardXp: number
  condition: string
  icon: string
  color: string
}

interface DVSavedState {
  level: number
  xp: number
  coins: number
  gems: string[]
  dragons: Record<string, number>
  equipment: Record<string, number>
  vaultsCleared: string[]
  currentVault: string | null
  title: string
  achievements: string[]
  totalGemsCollected: number
  totalDragonsBonded: number
  totalVaultsExplored: number
  totalDefenseWins: number
  dragonFeedCount: number
  equipmentUpgradedCount: number
  loginStreak: number
  lastLoginDate: string
  spiritShards: number
  treasureChestsOpened: number
  highestWaveSurvived: number
  gemsCombined: number
  playTimeMinutes: number
  settings: DVSettings
}

interface DVSettings {
  musicVolume: number
  sfxVolume: number
  particleEffects: boolean
  screenShake: boolean
  showDamageNumbers: boolean
  autoEquip: boolean
  notificationsEnabled: boolean
}

interface DVDefenseWave {
  wave: number
  enemies: number
  enemyPower: number
  dragonPower: number
  success: boolean
  damage: number
  goldEarned: number
  xpEarned: number
}

interface DVDragonAbility {
  id: string
  name: string
  description: string
  element: string
  baseDamage: number
  cooldown: number
  aoeRadius: number
  specialEffect: string
  unlockLevel: number
  color: string
}

interface DVCraftRecipe {
  id: string
  name: string
  description: string
  requiredGems: Record<string, number>
  requiredCoins: number
  requiredLevel: number
  resultType: 'gem' | 'equipment' | 'dragon'
  resultId: string
  rarity: DVRarity
  color: string
}

interface DVQuest {
  id: string
  name: string
  description: string
  type: 'collect' | 'bond' | 'explore' | 'defend' | 'upgrade'
  target: string
  required: number
  progress: number
  rewardCoins: number
  rewardXp: number
  rewardItemId: string | null
  rewardItemType: 'gem' | 'equipment' | 'dragon' | null
  completed: boolean
  claimed: boolean
  difficulty: number
  color: string
}

interface DVBoost {
  type: 'xp' | 'coins' | 'drops'
  multiplier: number
  startTime: number
  duration: number
  active: boolean
}

interface DVEnchantment {
  id: string
  name: string
  description: string
  element: string
  powerBonus: number
  healthBonus: number
  defenseBonus: number
  rarity: DVRarity
  color: string
}

// ---------------------------------------------------------------------------
// DV_ DATA ARRAYS
// ---------------------------------------------------------------------------

const DV_GEMS: DVGem[] = [
  { id: 'fire-ruby', name: 'Fire Ruby', element: 'fire', rarity: DV_RARITY_COMMON, power: 12, description: 'A crimson ruby that radiates warmth and the essence of dragonfire.', value: 15, color: '#ef4444', glowColor: '#fca5a5' },
  { id: 'ice-sapphire', name: 'Ice Sapphire', element: 'ice', rarity: DV_RARITY_COMMON, power: 12, description: 'A frozen sapphire that chills the air around it.', value: 15, color: '#38bdf8', glowColor: '#7dd3fc' },
  { id: 'storm-emerald', name: 'Storm Emerald', element: 'storm', rarity: DV_RARITY_COMMON, power: 12, description: 'A crackling emerald humming with electrical energy.', value: 15, color: '#a855f7', glowColor: '#c084fc' },
  { id: 'earth-topaz', name: 'Earth Topaz', element: 'earth', rarity: DV_RARITY_COMMON, power: 12, description: 'A grounded topaz containing the stability of mountains.', value: 15, color: '#65a30d', glowColor: '#a3e635' },
  { id: 'shadow-amethyst', name: 'Shadow Amethyst', element: 'shadow', rarity: DV_RARITY_UNCOMMON, power: 18, description: 'A dark amethyst that absorbs surrounding light.', value: 25, color: '#7c3aed', glowColor: '#a78bfa' },
  { id: 'light-citrine', name: 'Light Citrine', element: 'light', rarity: DV_RARITY_UNCOMMON, power: 18, description: 'A brilliant citrine that blazes with golden radiance.', value: 25, color: '#facc15', glowColor: '#fde047' },
  { id: 'void-obsidian', name: 'Void Obsidian', element: 'void', rarity: DV_RARITY_UNCOMMON, power: 18, description: 'A pitch-black obsidian from the void between realms.', value: 25, color: '#1e1b4b', glowColor: '#3730a3' },
  { id: 'nature-peridot', name: 'Nature Peridot', element: 'nature', rarity: DV_RARITY_UNCOMMON, power: 18, description: 'A lush green peridot pulsing with life energy.', value: 25, color: '#16a34a', glowColor: '#4ade80' },
  { id: 'cosmic-starstone', name: 'Cosmic Starstone', element: 'cosmic', rarity: DV_RARITY_RARE, power: 28, description: 'A mesmerizing stone containing the light of distant stars.', value: 50, color: '#6366f1', glowColor: '#818cf8' },
  { id: 'blood-garnet', name: 'Blood Garnet', element: 'blood', rarity: DV_RARITY_RARE, power: 28, description: 'A deep red garnet that strengthens dragon bonds.', value: 50, color: '#991b1b', glowColor: '#dc2626' },
  { id: 'flame-opal', name: 'Flame Opal', element: 'fire', rarity: DV_RARITY_RARE, power: 28, description: 'A fiery opal that dances with internal flames.', value: 50, color: '#f97316', glowColor: '#fb923c' },
  { id: 'frost-diamond', name: 'Frost Diamond', element: 'ice', rarity: DV_RARITY_RARE, power: 28, description: 'A pristine diamond carved from eternal glaciers.', value: 50, color: '#e0f2fe', glowColor: '#bae6fd' },
  { id: 'thunder-zircon', name: 'Thunder Zircon', element: 'storm', rarity: DV_RARITY_RARE, power: 28, description: 'A vibrating zircon charged with lightning power.', value: 50, color: '#eab308', glowColor: '#facc15' },
  { id: 'root-garnet', name: 'Root Garnet', element: 'earth', rarity: DV_RARITY_UNCOMMON, power: 18, description: 'An earthy garnet connected to deep underground roots.', value: 25, color: '#92400e', glowColor: '#b45309' },
  { id: 'midnight-onyx', name: 'Midnight Onyx', element: 'shadow', rarity: DV_RARITY_RARE, power: 28, description: 'A dark onyx that glows faintly in total darkness.', value: 50, color: '#292524', glowColor: '#57534e' },
  { id: 'dawn-sunstone', name: 'Dawn Sunstone', element: 'light', rarity: DV_RARITY_RARE, power: 28, description: 'A warm sunstone that glows at the first light of day.', value: 50, color: '#fbbf24', glowColor: '#fcd34d' },
  { id: 'void-pearl', name: 'Void Pearl', element: 'void', rarity: DV_RARITY_EPIC, power: 42, description: 'A pearlescent orb harvested from the edge of the void.', value: 100, color: '#312e81', glowColor: '#4338ca' },
  { id: 'verdant-emerald', name: 'Verdant Emerald', element: 'nature', rarity: DV_RARITY_RARE, power: 28, description: 'A deep green emerald from an ancient forest heart.', value: 50, color: '#166534', glowColor: '#22c55e' },
  { id: 'nebula-crystal', name: 'Nebula Crystal', element: 'cosmic', rarity: DV_RARITY_EPIC, power: 42, description: 'A swirling crystal containing a miniature nebula.', value: 100, color: '#7c3aed', glowColor: '#a855f7' },
  { id: 'ancient-ruby', name: 'Ancient Ruby', element: 'fire', rarity: DV_RARITY_EPIC, power: 42, description: 'A primordial ruby containing the first dragonfire ever breathed.', value: 100, color: '#b91c1c', glowColor: '#ef4444' },
  { id: 'eternal-sapphire', name: 'Eternal Sapphire', element: 'ice', rarity: DV_RARITY_EPIC, power: 42, description: 'A timeless sapphire frozen since the dawn of ages.', value: 100, color: '#1d4ed8', glowColor: '#3b82f6' },
  { id: 'tempest-emerald', name: 'Tempest Emerald', element: 'storm', rarity: DV_RARITY_EPIC, power: 42, description: 'An emerald crackling with the fury of an eternal storm.', value: 100, color: '#6d28d9', glowColor: '#8b5cf6' },
  { id: 'world-topaz', name: 'World Topaz', element: 'earth', rarity: DV_RARITY_EPIC, power: 42, description: 'A topaz containing the compressed weight of a world.', value: 100, color: '#a16207', glowColor: '#ca8a04' },
  { id: 'eclipse-gem', name: 'Eclipse Gem', element: 'shadow', rarity: DV_RARITY_EPIC, power: 42, description: 'A gemstone that only reveals itself during eclipses.', value: 100, color: '#1e1b4b', glowColor: '#6366f1' },
  { id: 'solar-citrine', name: 'Solar Citrine', element: 'light', rarity: DV_RARITY_EPIC, power: 42, description: 'A citrine that burns with the intensity of a small sun.', value: 100, color: '#d97706', glowColor: '#f59e0b' },
  { id: 'abyssal-stone', name: 'Abyssal Stone', element: 'void', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'A legendary stone pulled from the deepest abyss of reality.', value: 250, color: '#0c0a09', glowColor: '#44403c' },
  { id: 'cosmos-heart', name: 'Cosmos Heart', element: 'cosmic', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'The crystallized heart of an ancient cosmic entity.', value: 250, color: '#4f46e5', glowColor: '#818cf8' },
  { id: 'dragon-heart-ruby', name: 'Dragon Heart Ruby', element: 'fire', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'A ruby formed from the crystallized heart of a great fire dragon.', value: 250, color: '#dc2626', glowColor: '#fca5a5' },
  { id: 'glacier-eye', name: 'Glacier Eye', element: 'ice', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'A massive sapphire shaped like a watchful eye of ice.', value: 250, color: '#0284c7', glowColor: '#38bdf8' },
  { id: 'sovereign-gem', name: 'Sovereign Gem', element: 'light', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'The supreme gem of light, said to grant dragon emperor power.', value: 250, color: '#eab308', glowColor: '#fef08a' },
  { id: 'bloodstone-prime', name: 'Bloodstone Prime', element: 'blood', rarity: DV_RARITY_LEGENDARY, power: 65, description: 'The original bloodstone from which all dragon bonds flow.', value: 250, color: '#7f1d1d', glowColor: '#b91c1c' },
]

const DV_DRAGONS: DVDragon[] = [
  { id: 'ember-wyrm', name: 'Ember Wyrm', element: 'fire', rarity: DV_RARITY_COMMON, basePower: 55, baseHealth: 120, bondLevel: 0, abilities: ['Flame Breath', 'Ember Shield'], description: 'A young wyrm learning to control its inner flame.', color: '#dc2626' },
  { id: 'frost-drake', name: 'Frost Drake', element: 'ice', rarity: DV_RARITY_COMMON, basePower: 55, baseHealth: 130, bondLevel: 0, abilities: ['Ice Spike', 'Frost Armor'], description: 'A resilient drake that thrives in frozen landscapes.', color: '#0ea5e9' },
  { id: 'thunder-wyvern', name: 'Thunder Wyvern', element: 'storm', rarity: DV_RARITY_COMMON, basePower: 60, baseHealth: 110, bondLevel: 0, abilities: ['Lightning Strike', 'Static Field'], description: 'A swift wyvern that rides storm clouds.', color: '#eab308' },
  { id: 'stone-warg', name: 'Stone Warg', element: 'earth', rarity: DV_RARITY_COMMON, basePower: 50, baseHealth: 160, bondLevel: 0, abilities: ['Rock Throw', 'Earth Wall'], description: 'A heavily armored dragon with stone-like scales.', color: '#854d0e' },
  { id: 'shade-serpent', name: 'Shade Serpent', element: 'shadow', rarity: DV_RARITY_UNCOMMON, basePower: 65, baseHealth: 100, bondLevel: 0, abilities: ['Dark Bolt', 'Shadow Meld'], description: 'A serpentine dragon that slithers between shadows.', color: '#6b21a8' },
  { id: 'dawn-phoenix', name: 'Dawn Phoenix-Dragon', element: 'light', rarity: DV_RARITY_UNCOMMON, basePower: 70, baseHealth: 110, bondLevel: 0, abilities: ['Radiant Beam', 'Healing Light'], description: 'A dragon with phoenix ancestry, radiant and pure.', color: '#ca8a04' },
  { id: 'void-whelp', name: 'Void Whelp', element: 'void', rarity: DV_RARITY_UNCOMMON, basePower: 68, baseHealth: 90, bondLevel: 0, abilities: ['Void Blast', 'Dimensional Shift'], description: 'A mysterious whelp born from the space between worlds.', color: '#312e81' },
  { id: 'thorn-vine', name: 'Thorn Vine Dragon', element: 'nature', rarity: DV_RARITY_UNCOMMON, basePower: 58, baseHealth: 140, bondLevel: 0, abilities: ['Vine Whip', 'Nature Heal'], description: 'A dragon overgrown with ancient thorny vines.', color: '#15803d' },
  { id: 'star-scaled', name: 'Star-Scaled Drake', element: 'cosmic', rarity: DV_RARITY_RARE, basePower: 80, baseHealth: 120, bondLevel: 0, abilities: ['Star Fall', 'Cosmic Shield'], description: 'A drake whose scales shimmer like distant galaxies.', color: '#4f46e5' },
  { id: 'blood-fury', name: 'Blood Fury Wyrm', element: 'blood', rarity: DV_RARITY_RARE, basePower: 85, baseHealth: 130, bondLevel: 0, abilities: ['Blood Strike', 'Frenzy Roar'], description: 'A ferocious wyrm empowered by the blood of fallen dragons.', color: '#991b1b' },
  { id: 'crystal-spire', name: 'Crystal Spire Dragon', element: 'crystal', rarity: DV_RARITY_RARE, basePower: 72, baseHealth: 150, bondLevel: 0, abilities: ['Crystal Lance', 'Prism Barrier'], description: 'A dragon covered in sharp crystalline spires.', color: '#e879f9' },
  { id: 'magma-titan', name: 'Magma Titan', element: 'magma', rarity: DV_RARITY_RARE, basePower: 90, baseHealth: 160, bondLevel: 0, abilities: ['Magma Flow', 'Eruption'], description: 'A massive dragon that dwells within volcanic chambers.', color: '#f97316' },
  { id: 'mist-walker', name: 'Mist Walker', element: 'mist', rarity: DV_RARITY_RARE, basePower: 60, baseHealth: 100, bondLevel: 0, abilities: ['Mist Shroud', 'Phantom Strike'], description: 'An elusive dragon that appears and disappears in mist.', color: '#94a3b8' },
  { id: 'bone-sovereign', name: 'Bone Sovereign', element: 'bone', rarity: DV_RARITY_EPIC, basePower: 95, baseHealth: 140, bondLevel: 0, abilities: ['Bone Storm', 'Undead Legion'], description: 'An ancient skeletal dragon returned from death.', color: '#d6d3d1' },
  { id: 'inferno-lord', name: 'Inferno Lord', element: 'ember', rarity: DV_RARITY_EPIC, basePower: 100, baseHealth: 150, bondLevel: 0, abilities: ['Inferno Breath', 'Burning Aura'], description: 'A supreme fire dragon that commands infernal flames.', color: '#ea580c' },
  { id: 'glacier-king', name: 'Glacier King', element: 'frost', rarity: DV_RARITY_EPIC, basePower: 100, baseHealth: 170, bondLevel: 0, abilities: ['Absolute Zero', 'Ice Age'], description: 'The ancient king of all frost dragons.', color: '#22d3ee' },
  { id: 'tempest-emperor', name: 'Tempest Emperor', element: 'thunder', rarity: DV_RARITY_EPIC, basePower: 105, baseHealth: 130, bondLevel: 0, abilities: ['Judgment Bolt', 'Storm Domain'], description: 'The ruler of all storms, a dragon of immense power.', color: '#eab308' },
  { id: 'abyss-leviathan', name: 'Abyss Leviathan', element: 'abyss', rarity: DV_RARITY_EPIC, basePower: 98, baseHealth: 200, bondLevel: 0, abilities: ['Abyssal Dive', 'Crushing Depth'], description: 'A colossal sea dragon from the deepest ocean trenches.', color: '#312e81' },
  { id: 'jade-emperor', name: 'Jade Emperor Dragon', element: 'jade', rarity: DV_RARITY_LEGENDARY, basePower: 130, baseHealth: 180, bondLevel: 0, abilities: ['Jade Torrent', 'Imperial Mandate'], description: 'The legendary jade emperor dragon of ancient myth.', color: '#34d399' },
  { id: 'onyx-apex', name: 'Onyx Apex Dragon', element: 'onyx', rarity: DV_RARITY_LEGENDARY, basePower: 140, baseHealth: 200, bondLevel: 0, abilities: ['Obsidian Blade', 'Shadow Empire'], description: 'The apex predator of the shadow realm, feared by all dragons.', color: '#292524' },
  { id: 'spectral-ancient', name: 'Spectral Ancient', element: 'spectral', rarity: DV_RARITY_LEGENDARY, basePower: 125, baseHealth: 160, bondLevel: 0, abilities: ['Spectral Flames', 'Ethereal Form'], description: 'A ghostly dragon that has existed since the first age.', color: '#c084fc' },
  { id: 'primal-omega', name: 'Primal Omega', element: 'primal', rarity: DV_RARITY_LEGENDARY, basePower: 150, baseHealth: 220, bondLevel: 0, abilities: ['Primal Roar', 'Genesis Flame'], description: 'The first dragon ever born, source of all dragonkind.', color: '#b91c1c' },
]

const DV_VAULTS: DVVaultChamber[] = [
  { id: 'ruby-vault', name: 'Ruby Vault', description: 'A vault chamber glowing with the warm light of countless rubies. Fire elementals guard its treasures.', requiredLevel: 1, dangerLevel: 1, rewards: ['fire-ruby', 'ember-wyrm'], gemChance: 0.9, dragonEncounterChance: 0.2, equipmentChance: 0.3, cleared: false, element: 'fire', color: '#ef4444' },
  { id: 'sapphire-sanctum', name: 'Sapphire Sanctum', description: 'An icy sanctum where frost crystals line every surface. Ancient ice drakes slumber within.', requiredLevel: 3, dangerLevel: 2, rewards: ['ice-sapphire', 'frost-drake'], gemChance: 0.85, dragonEncounterChance: 0.25, equipmentChance: 0.35, cleared: false, element: 'ice', color: '#38bdf8' },
  { id: 'emerald-catacombs', name: 'Emerald Catacombs', description: 'Lightning-charged catacombs beneath a storm mountain. Thunder wyrns patrol its depths.', requiredLevel: 6, dangerLevel: 3, rewards: ['storm-emerald', 'thunder-wyvern'], gemChance: 0.8, dragonEncounterChance: 0.3, equipmentChance: 0.4, cleared: false, element: 'storm', color: '#a855f7' },
  { id: 'topaz-caverns', name: 'Topaz Caverns', description: 'Deep caverns filled with golden topaz veins. Earth dragons guard the deepest chambers.', requiredLevel: 10, dangerLevel: 4, rewards: ['earth-topaz', 'stone-warg'], gemChance: 0.8, dragonEncounterChance: 0.3, equipmentChance: 0.4, cleared: false, element: 'earth', color: '#65a30d' },
  { id: 'amethyst-shadow-halls', name: 'Amethyst Shadow Halls', description: 'Dark halls where amethysts absorb all light. Shadow serpents hunt in total darkness.', requiredLevel: 15, dangerLevel: 5, rewards: ['shadow-amethyst', 'shade-serpent'], gemChance: 0.75, dragonEncounterChance: 0.35, equipmentChance: 0.45, cleared: false, element: 'shadow', color: '#7c3aed' },
  { id: 'citrine-solarium', name: 'Citrine Solarium', description: 'A brilliant chamber open to eternal sunlight. Phoenix-dragons nest in its golden rafters.', requiredLevel: 20, dangerLevel: 6, rewards: ['light-citrine', 'dawn-phoenix'], gemChance: 0.7, dragonEncounterChance: 0.35, equipmentChance: 0.45, cleared: false, element: 'light', color: '#facc15' },
  { id: 'obsidian-void-pit', name: 'Obsidian Void Pit', description: 'A bottomless pit lined with void obsidian. Only the bravest dare descend.', requiredLevel: 25, dangerLevel: 7, rewards: ['void-obsidian', 'void-whelp'], gemChance: 0.65, dragonEncounterChance: 0.4, equipmentChance: 0.5, cleared: false, element: 'void', color: '#1e1b4b' },
  { id: 'imperial-treasury', name: 'Imperial Treasury', description: 'The legendary treasury of the Dragon Emperor, containing the rarest gems and most powerful artifacts.', requiredLevel: 30, dangerLevel: 8, rewards: ['dragon-heart-ruby', 'primal-omega'], gemChance: 0.5, dragonEncounterChance: 0.5, equipmentChance: 0.6, cleared: false, element: 'primal', color: '#ffd54f' },
]

const DV_EQUIPMENT: DVEquipment[] = [
  { id: 'dragon-scale-armor', name: 'Dragon Scale Armor', type: 'armor', rarity: DV_RARITY_COMMON, power: 20, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: DV_EQUIPMENT_UPGRADE_BASE_COST, description: 'Armor crafted from shed dragon scales.', dragonBonus: 5, defenseBonus: 15, color: '#dc2626' },
  { id: 'flame-sword', name: 'Flame Sword', type: 'weapon', rarity: DV_RARITY_COMMON, power: 25, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: DV_EQUIPMENT_UPGRADE_BASE_COST, description: 'A sword imbued with dragonfire.', dragonBonus: 8, defenseBonus: 5, color: '#ef4444' },
  { id: 'frost-shield', name: 'Frost Shield', type: 'shield', rarity: DV_RARITY_COMMON, power: 18, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: DV_EQUIPMENT_UPGRADE_BASE_COST, description: 'A shield that freezes attackers on contact.', dragonBonus: 3, defenseBonus: 20, color: '#38bdf8' },
  { id: 'storm-ring', name: 'Storm Ring', type: 'accessory', rarity: DV_RARITY_UNCOMMON, power: 15, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'A ring crackling with storm energy.', dragonBonus: 12, defenseBonus: 3, color: '#eab308' },
  { id: 'earth-boots', name: 'Earth Boots', type: 'boots', rarity: DV_RARITY_COMMON, power: 14, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: DV_EQUIPMENT_UPGRADE_BASE_COST, description: 'Boots that ground the wearer to the earth.', dragonBonus: 4, defenseBonus: 10, color: '#65a30d' },
  { id: 'shadow-cloak', name: 'Shadow Cloak', type: 'armor', rarity: DV_RARITY_UNCOMMON, power: 22, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'A cloak that renders the wearer nearly invisible.', dragonBonus: 10, defenseBonus: 12, color: '#6b21a8' },
  { id: 'light-helm', name: 'Light Helm', type: 'helmet', rarity: DV_RARITY_UNCOMMON, power: 20, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'A radiant helmet that illuminates dark places.', dragonBonus: 8, defenseBonus: 15, color: '#facc15' },
  { id: 'void-amulet', name: 'Void Amulet', type: 'accessory', rarity: DV_RARITY_UNCOMMON, power: 24, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'An amulet that opens small void portals.', dragonBonus: 14, defenseBonus: 5, color: '#312e81' },
  { id: 'nature-gauntlets', name: 'Nature Gauntlets', type: 'armor', rarity: DV_RARITY_UNCOMMON, power: 18, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 60, description: 'Gauntlets that channel nature energy into devastating punches.', dragonBonus: 10, defenseBonus: 10, color: '#16a34a' },
  { id: 'star-weave-robe', name: 'Star-Weave Robe', type: 'armor', rarity: DV_RARITY_RARE, power: 30, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'A robe woven from threads of starlight.', dragonBonus: 18, defenseBonus: 12, color: '#6366f1' },
  { id: 'bloodfang-greataxe', name: 'Bloodfang Greataxe', type: 'weapon', rarity: DV_RARITY_RARE, power: 40, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'A massive axe that grows stronger with each enemy defeated.', dragonBonus: 20, defenseBonus: 3, color: '#991b1b' },
  { id: 'crystal-staff', name: 'Crystal Staff', type: 'weapon', rarity: DV_RARITY_RARE, power: 35, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'A staff topped with a multifaceted crystal.', dragonBonus: 22, defenseBonus: 8, color: '#e879f9' },
  { id: 'magma-plate', name: 'Magma Plate Armor', type: 'armor', rarity: DV_RARITY_RARE, power: 32, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'Armor forged in magma flows, nearly indestructible.', dragonBonus: 12, defenseBonus: 25, color: '#f97316' },
  { id: 'thunder-crown', name: 'Thunder Crown', type: 'helmet', rarity: DV_RARITY_RARE, power: 28, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 100, description: 'A crown that summons thunder on command.', dragonBonus: 20, defenseBonus: 10, color: '#eab308' },
  { id: 'bone-mask', name: 'Bone Dragon Mask', type: 'helmet', rarity: DV_RARITY_EPIC, power: 38, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 200, description: 'A terrifying mask carved from dragon bone.', dragonBonus: 25, defenseBonus: 15, color: '#d6d3d1' },
  { id: 'inferno-gauntlets', name: 'Inferno Gauntlets', type: 'armor', rarity: DV_RARITY_EPIC, power: 42, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 200, description: 'Gauntlets that burn with eternal dragonfire.', dragonBonus: 28, defenseBonus: 12, color: '#ea580c' },
  { id: 'glacier-lance', name: 'Glacier Lance', type: 'weapon', rarity: DV_RARITY_EPIC, power: 50, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 200, description: 'A lance of pure ice that never melts.', dragonBonus: 30, defenseBonus: 8, color: '#22d3ee' },
  { id: 'abyssal-trident', name: 'Abyssal Trident', type: 'weapon', rarity: DV_RARITY_EPIC, power: 48, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 200, description: 'A trident from the deepest ocean abyss.', dragonBonus: 28, defenseBonus: 15, color: '#312e81' },
  { id: 'jade-dragon-suit', name: 'Jade Dragon Suit', type: 'armor', rarity: DV_RARITY_LEGENDARY, power: 60, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 500, description: 'The complete armor of the Jade Emperor Dragon.', dragonBonus: 40, defenseBonus: 35, color: '#34d399' },
  { id: 'onyx-emperor-blade', name: 'Onyx Emperor Blade', type: 'weapon', rarity: DV_RARITY_LEGENDARY, power: 70, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 500, description: 'The legendary blade of the Onyx Apex Dragon Emperor.', dragonBonus: 50, defenseBonus: 10, color: '#292524' },
  { id: 'spectral-wings-cloak', name: 'Spectral Wings Cloak', type: 'armor', rarity: DV_RARITY_LEGENDARY, power: 55, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 500, description: 'A cloak made from spectral dragon wings that grant flight.', dragonBonus: 35, defenseBonus: 30, color: '#c084fc' },
  { id: 'primal-fire-crown', name: 'Primal Fire Crown', type: 'helmet', rarity: DV_RARITY_LEGENDARY, power: 50, level: 1, maxLevel: DV_EQUIPMENT_MAX_LEVEL, upgradeCost: 500, description: 'The crown of the Primal Omega, source of all dragonfire.', dragonBonus: 45, defenseBonus: 20, color: '#b91c1c' },
]

const DV_TITLES: DVTitle[] = [
  { id: 'vault-guard', name: 'Vault Guard', requirement: 'Reach Level 1', requiredLevel: 1, bonusXpPercent: 0, bonusCoinPercent: 0, color: '#94a3b8' },
  { id: 'gem-collector', name: 'Gem Collector', requirement: 'Collect 10 different gems', requiredLevel: 3, bonusXpPercent: 5, bonusCoinPercent: 5, color: '#38bdf8' },
  { id: 'dragon-tamer', name: 'Dragon Tamer', requirement: 'Bond with 3 dragons', requiredLevel: 8, bonusXpPercent: 10, bonusCoinPercent: 8, color: '#a855f7' },
  { id: 'vault-explorer', name: 'Vault Explorer', requirement: 'Clear 4 vault chambers', requiredLevel: 15, bonusXpPercent: 15, bonusCoinPercent: 12, color: '#f97316' },
  { id: 'dragon-knight', name: 'Dragon Knight', requirement: 'Reach Level 20', requiredLevel: 20, bonusXpPercent: 20, bonusCoinPercent: 15, color: '#ef4444' },
  { id: 'vault-defender', name: 'Vault Defender', requirement: 'Survive 10 defense waves', requiredLevel: 30, bonusXpPercent: 25, bonusCoinPercent: 20, color: '#eab308' },
  { id: 'dragon-lord', name: 'Dragon Lord', requirement: 'Bond with a legendary dragon', requiredLevel: 40, bonusXpPercent: 30, bonusCoinPercent: 25, color: '#ffd54f' },
  { id: 'dragon-emperor', name: 'Dragon Emperor', requirement: 'Reach Level 50', requiredLevel: 50, bonusXpPercent: 50, bonusCoinPercent: 40, color: '#dc2626' },
]

const DV_ACHIEVEMENTS: DVAchievement[] = [
  { id: 'first-gem', name: 'First Spark', description: 'Collect your first dragon gem.', rewardCoins: 10, rewardXp: 20, condition: 'totalGemsCollected >= 1', icon: '💎', color: '#38bdf8' },
  { id: 'gem-hoarder', name: 'Gem Hoarder', description: 'Collect 50 dragon gems total.', rewardCoins: 100, rewardXp: 150, condition: 'totalGemsCollected >= 50', icon: '🏆', color: '#eab308' },
  { id: 'gem-master', name: 'Gem Master', description: 'Collect 200 dragon gems total.', rewardCoins: 500, rewardXp: 400, condition: 'totalGemsCollected >= 200', icon: '👑', color: '#ffd54f' },
  { id: 'first-dragon', name: 'First Bond', description: 'Bond with your first dragon.', rewardCoins: 25, rewardXp: 50, condition: 'totalDragonsBonded >= 1', icon: '🐉', color: '#ef4444' },
  { id: 'dragon-army', name: 'Dragon Army', description: 'Bond with 5 different dragons.', rewardCoins: 200, rewardXp: 200, condition: 'totalDragonsBonded >= 5', icon: '⚔️', color: '#dc2626' },
  { id: 'dragon-legend', name: 'Dragon Legend', description: 'Bond with a legendary dragon.', rewardCoins: 500, rewardXp: 300, condition: 'bondedLegendary >= 1', icon: '🌟', color: '#ffd54f' },
  { id: 'first-vault', name: 'Vault Intruder', description: 'Clear your first vault chamber.', rewardCoins: 30, rewardXp: 60, condition: 'totalVaultsExplored >= 1', icon: '🚪', color: '#a855f7' },
  { id: 'vault-conqueror', name: 'Vault Conqueror', description: 'Clear all 8 vault chambers.', rewardCoins: 1000, rewardXp: 500, condition: 'totalVaultsExplored >= 8', icon: '🏰', color: '#f97316' },
  { id: 'first-defense', name: 'First Stand', description: 'Win your first vault defense wave.', rewardCoins: 20, rewardXp: 40, condition: 'totalDefenseWins >= 1', icon: '🛡️', color: '#16a34a' },
  { id: 'defense-veteran', name: 'Defense Veteran', description: 'Win 25 vault defense waves.', rewardCoins: 300, rewardXp: 250, condition: 'totalDefenseWins >= 25', icon: '⚔️', color: '#65a30d' },
  { id: 'survivor', name: 'Survivor', description: 'Survive wave 15 in vault defense.', rewardCoins: 400, rewardXp: 300, condition: 'highestWaveSurvived >= 15', icon: '🔥', color: '#ea580c' },
  { id: 'level-25', name: 'Rising Power', description: 'Reach player level 25.', rewardCoins: 200, rewardXp: 200, condition: 'level >= 25', icon: '📈', color: '#6366f1' },
  { id: 'level-50', name: 'Ultimate Power', description: 'Reach the maximum level of 50.', rewardCoins: 2000, rewardXp: 1000, condition: 'level >= 50', icon: '🏅', color: '#dc2626' },
  { id: 'first-upgrade', name: 'Blacksmith Initiate', description: 'Upgrade your first piece of equipment.', rewardCoins: 15, rewardXp: 30, condition: 'equipmentUpgradedCount >= 1', icon: '🔨', color: '#854d0e' },
  { id: 'master-blacksmith', name: 'Master Blacksmith', description: 'Upgrade any equipment to max level.', rewardCoins: 500, rewardXp: 400, condition: 'hasMaxEquipment >= 1', icon: '⚒️', color: '#f97316' },
  { id: 'streak-7', name: 'Weekly Devotion', description: 'Maintain a 7-day login streak.', rewardCoins: 150, rewardXp: 100, condition: 'loginStreak >= 7', icon: '📅', color: '#38bdf8' },
  { id: 'streak-30', name: 'Monthly Devotion', description: 'Maintain a 30-day login streak.', rewardCoins: 1000, rewardXp: 500, condition: 'loginStreak >= 30', icon: '🗓️', color: '#a855f7' },
  { id: 'gem-combine', name: 'Gem Alchemist', description: 'Combine gems 10 times at the forge.', rewardCoins: 200, rewardXp: 200, condition: 'gemsCombined >= 10', icon: '🔮', color: '#e879f9' },
]

const DV_DRAGON_ABILITIES: DVDragonAbility[] = [
  { id: 'flame-breath', name: 'Flame Breath', description: 'Unleashes a torrent of fire that scorches all enemies in range.', element: 'fire', baseDamage: 45, cooldown: 3, aoeRadius: 3, specialEffect: 'burn', unlockLevel: 1, color: '#ef4444' },
  { id: 'ember-shield', name: 'Ember Shield', description: 'Creates a shield of swirling embers that absorbs incoming damage.', element: 'fire', baseDamage: 0, cooldown: 5, aoeRadius: 0, specialEffect: 'shield', unlockLevel: 5, color: '#f97316' },
  { id: 'ice-spike', name: 'Ice Spike', description: 'Launches a piercing spike of ice that freezes the target.', element: 'ice', baseDamage: 40, cooldown: 3, aoeRadius: 1, specialEffect: 'freeze', unlockLevel: 1, color: '#38bdf8' },
  { id: 'frost-armor', name: 'Frost Armor', description: 'Encases the dragon in thick ice armor, boosting defense.', element: 'ice', baseDamage: 0, cooldown: 6, aoeRadius: 0, specialEffect: 'defense_boost', unlockLevel: 5, color: '#22d3ee' },
  { id: 'lightning-strike', name: 'Lightning Strike', description: 'Calls down a bolt of lightning that chains between enemies.', element: 'storm', baseDamage: 55, cooldown: 4, aoeRadius: 4, specialEffect: 'chain', unlockLevel: 1, color: '#eab308' },
  { id: 'static-field', name: 'Static Field', description: 'Generates a field of static electricity that stuns enemies.', element: 'storm', baseDamage: 20, cooldown: 5, aoeRadius: 3, specialEffect: 'stun', unlockLevel: 8, color: '#a855f7' },
  { id: 'rock-throw', name: 'Rock Throw', description: 'Hurls massive boulders at the enemy with crushing force.', element: 'earth', baseDamage: 50, cooldown: 3, aoeRadius: 2, specialEffect: 'knockback', unlockLevel: 1, color: '#65a30d' },
  { id: 'earth-wall', name: 'Earth Wall', description: 'Raises a wall of stone that blocks incoming projectiles.', element: 'earth', baseDamage: 0, cooldown: 6, aoeRadius: 0, specialEffect: 'block', unlockLevel: 5, color: '#854d0e' },
  { id: 'dark-bolt', name: 'Dark Bolt', description: 'Fires a concentrated bolt of dark energy that drains life.', element: 'shadow', baseDamage: 48, cooldown: 3, aoeRadius: 1, specialEffect: 'lifesteal', unlockLevel: 1, color: '#6b21a8' },
  { id: 'shadow-meld', name: 'Shadow Meld', description: 'Merges with shadows, becoming invisible and gaining bonus damage.', element: 'shadow', baseDamage: 0, cooldown: 7, aoeRadius: 0, specialEffect: 'stealth', unlockLevel: 10, color: '#4c1d95' },
  { id: 'radiant-beam', name: 'Radiant Beam', description: 'Fires a beam of pure light that pierces through all enemies.', element: 'light', baseDamage: 52, cooldown: 4, aoeRadius: 5, specialEffect: 'pierce', unlockLevel: 1, color: '#facc15' },
  { id: 'healing-light', name: 'Healing Light', description: 'Radiates healing light that restores health to all allies.', element: 'light', baseDamage: 0, cooldown: 6, aoeRadius: 4, specialEffect: 'heal', unlockLevel: 5, color: '#ca8a04' },
  { id: 'void-blast', name: 'Void Blast', description: 'Launches a blast of void energy that warps space around the target.', element: 'void', baseDamage: 60, cooldown: 4, aoeRadius: 2, specialEffect: 'warp', unlockLevel: 1, color: '#312e81' },
  { id: 'dimensional-shift', name: 'Dimensional Shift', description: 'Shifts between dimensions, dodging all attacks briefly.', element: 'void', baseDamage: 0, cooldown: 8, aoeRadius: 0, specialEffect: 'dodge', unlockLevel: 10, color: '#1e1b4b' },
  { id: 'vine-whip', name: 'Vine Whip', description: 'Strikes with thorny vines that poison the target.', element: 'nature', baseDamage: 42, cooldown: 3, aoeRadius: 2, specialEffect: 'poison', unlockLevel: 1, color: '#16a34a' },
  { id: 'nature-heal', name: 'Nature Heal', description: 'Channels the power of nature to rapidly heal wounds.', element: 'nature', baseDamage: 0, cooldown: 5, aoeRadius: 3, specialEffect: 'regen', unlockLevel: 5, color: '#15803d' },
  { id: 'star-fall', name: 'Star Fall', description: 'Calls down a barrage of meteorites from the cosmos.', element: 'cosmic', baseDamage: 70, cooldown: 5, aoeRadius: 5, specialEffect: 'meteor', unlockLevel: 1, color: '#6366f1' },
  { id: 'cosmic-shield', name: 'Cosmic Shield', description: 'Creates a shield woven from cosmic energy and starlight.', element: 'cosmic', baseDamage: 0, cooldown: 6, aoeRadius: 0, specialEffect: 'cosmic_shield', unlockLevel: 8, color: '#4f46e5' },
  { id: 'blood-strike', name: 'Blood Strike', description: 'A devastating strike empowered by the blood of fallen enemies.', element: 'blood', baseDamage: 65, cooldown: 3, aoeRadius: 1, specialEffect: 'execute', unlockLevel: 1, color: '#991b1b' },
  { id: 'frenzy-roar', name: 'Frenzy Roar', description: 'Lets out a terrifying roar that boosts attack speed of all allies.', element: 'blood', baseDamage: 0, cooldown: 7, aoeRadius: 5, specialEffect: 'attack_boost', unlockLevel: 8, color: '#7f1d1d' },
]

const DV_CRAFT_RECIPES: DVCraftRecipe[] = [
  { id: 'craft-fire-blade', name: 'Forge Flame Blade', description: 'Combine fire gems to create a weapon imbued with eternal flames.', requiredGems: { 'fire-ruby': 3, 'flame-opal': 1 }, requiredCoins: 100, requiredLevel: 5, resultType: 'equipment', resultId: 'flame-sword', rarity: DV_RARITY_UNCOMMON, color: '#ef4444' },
  { id: 'craft-ice-shield', name: 'Forge Ice Barrier', description: 'Combine ice gems to forge a shield that never thaws.', requiredGems: { 'ice-sapphire': 3, 'frost-diamond': 1 }, requiredCoins: 100, requiredLevel: 5, resultType: 'equipment', resultId: 'frost-shield', rarity: DV_RARITY_UNCOMMON, color: '#38bdf8' },
  { id: 'craft-storm-ring', name: 'Forge Storm Ring', description: 'Channel storm energy into a ring of infinite lightning.', requiredGems: { 'storm-emerald': 3, 'thunder-zircon': 1 }, requiredCoins: 120, requiredLevel: 8, resultType: 'equipment', resultId: 'storm-ring', rarity: DV_RARITY_UNCOMMON, color: '#eab308' },
  { id: 'craft-blood-axe', name: 'Forge Bloodfang Greataxe', description: 'A fearsome axe that drinks the blood of its enemies.', requiredGems: { 'blood-garnet': 2, 'root-garnet': 2 }, requiredCoins: 200, requiredLevel: 12, resultType: 'equipment', resultId: 'bloodfang-greataxe', rarity: DV_RARITY_RARE, color: '#991b1b' },
  { id: 'craft-cosmic-robe', name: 'Weave Star-Weave Robe', description: 'Spin threads of cosmic energy into a protective robe.', requiredGems: { 'cosmic-starstone': 2, 'nebula-crystal': 1 }, requiredCoins: 250, requiredLevel: 15, resultType: 'equipment', resultId: 'star-weave-robe', rarity: DV_RARITY_RARE, color: '#6366f1' },
  { id: 'craft-inferno-gauntlets', name: 'Forge Inferno Gauntlets', description: 'Gauntlets that burn with the fury of ancient dragons.', requiredGems: { 'ancient-ruby': 2, 'flame-opal': 1 }, requiredCoins: 400, requiredLevel: 20, resultType: 'equipment', resultId: 'inferno-gauntlets', rarity: DV_RARITY_EPIC, color: '#ea580c' },
  { id: 'craft-jade-suit', name: 'Forge Jade Dragon Suit', description: 'The ultimate armor crafted from pure jade dragon essence.', requiredGems: { 'sovereign-gem': 1, 'dragon-heart-ruby': 1 }, requiredCoins: 1000, requiredLevel: 35, resultType: 'equipment', resultId: 'jade-dragon-suit', rarity: DV_RARITY_LEGENDARY, color: '#34d399' },
  { id: 'craft-onyx-blade', name: 'Forge Onyx Emperor Blade', description: 'The legendary blade of the Dragon Emperor, forged in shadow.', requiredGems: { 'abyssal-stone': 1, 'midnight-onyx': 2 }, requiredCoins: 1000, requiredLevel: 40, resultType: 'equipment', resultId: 'onyx-emperor-blade', rarity: DV_RARITY_LEGENDARY, color: '#292524' },
]

const DV_ENCHANTMENTS: DVEnchantment[] = [
  { id: 'enchant-fire-soul', name: 'Fire Soul', description: 'Imbues equipment with the burning essence of a fire dragon soul.', element: 'fire', powerBonus: 15, healthBonus: 0, defenseBonus: 5, rarity: DV_RARITY_UNCOMMON, color: '#ef4444' },
  { id: 'enchant-ice-heart', name: 'Ice Heart', description: 'Fuses the frozen heart of an ancient ice dragon into the item.', element: 'ice', powerBonus: 10, healthBonus: 20, defenseBonus: 10, rarity: DV_RARITY_UNCOMMON, color: '#38bdf8' },
  { id: 'enchant-storm-fury', name: 'Storm Fury', description: 'Channels the fury of endless storms into raw power.', element: 'storm', powerBonus: 20, healthBonus: 0, defenseBonus: 0, rarity: DV_RARITY_UNCOMMON, color: '#eab308' },
  { id: 'enchant-earth-fortress', name: 'Earth Fortress', description: 'Draws on the immovable strength of the earth itself.', element: 'earth', powerBonus: 5, healthBonus: 30, defenseBonus: 20, rarity: DV_RARITY_UNCOMMON, color: '#65a30d' },
  { id: 'enchant-shadow-blade', name: 'Shadow Blade', description: 'Infuses the item with the darkness of the shadow realm.', element: 'shadow', powerBonus: 25, healthBonus: 0, defenseBonus: 5, rarity: DV_RARITY_RARE, color: '#6b21a8' },
  { id: 'enchant-light-bringer', name: 'Light Bringer', description: 'Blesses the equipment with radiant holy light.', element: 'light', powerBonus: 15, healthBonus: 15, defenseBonus: 10, rarity: DV_RARITY_RARE, color: '#facc15' },
  { id: 'enchant-void-touch', name: 'Void Touch', description: 'Allows the item to tap into the void for otherworldly power.', element: 'void', powerBonus: 30, healthBonus: 10, defenseBonus: 0, rarity: DV_RARITY_RARE, color: '#312e81' },
  { id: 'enchant-cosmic-wisdom', name: 'Cosmic Wisdom', description: 'Grants cosmic insight that enhances all aspects equally.', element: 'cosmic', powerBonus: 18, healthBonus: 18, defenseBonus: 18, rarity: DV_RARITY_EPIC, color: '#6366f1' },
  { id: 'enchant-dragon-emperor', name: 'Dragon Emperor Blessing', description: 'The ultimate enchantment blessed by the Dragon Emperor himself.', element: 'primal', powerBonus: 40, healthBonus: 40, defenseBonus: 30, rarity: DV_RARITY_LEGENDARY, color: '#ffd54f' },
]

// ---------------------------------------------------------------------------
// DV_ HELPER FUNCTIONS
// ---------------------------------------------------------------------------

function dvCreateInitialState(): DVSavedState {
  return {
    level: 1,
    xp: 0,
    coins: 0,
    gems: [],
    dragons: {},
    equipment: {},
    vaultsCleared: [],
    currentVault: null,
    title: 'vault-guard',
    achievements: [],
    totalGemsCollected: 0,
    totalDragonsBonded: 0,
    totalVaultsExplored: 0,
    totalDefenseWins: 0,
    dragonFeedCount: 0,
    equipmentUpgradedCount: 0,
    loginStreak: 0,
    lastLoginDate: '',
    spiritShards: 0,
    treasureChestsOpened: 0,
    highestWaveSurvived: 0,
    gemsCombined: 0,
    playTimeMinutes: 0,
    settings: {
      musicVolume: 70,
      sfxVolume: 80,
      particleEffects: true,
      screenShake: true,
      showDamageNumbers: true,
      autoEquip: false,
      notificationsEnabled: true,
    },
  }
}

function dvLoadState(): DVSavedState {
  if (typeof window === 'undefined') return dvCreateInitialState()
  try {
    const raw = localStorage.getItem(DV_STORAGE_KEY)
    if (!raw) return dvCreateInitialState()
    const parsed = JSON.parse(raw) as Partial<DVSavedState>
    const base = dvCreateInitialState()
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...parsed.settings },
    }
  } catch {
    return dvCreateInitialState()
  }
}

function dvSaveState(state: DVSavedState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DV_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Storage full, silently fail
  }
}

function dvGetXpForLevel(level: number): number {
  if (level < 0) return DV_XP_TABLE[0]
  if (level >= DV_MAX_LEVEL) return DV_XP_TABLE[DV_MAX_LEVEL]
  return DV_XP_TABLE[level] ?? DV_XP_TABLE[DV_MAX_LEVEL]
}

function dvCalculateLevel(xp: number): number {
  let level = 1
  while (level < DV_MAX_LEVEL && xp >= dvGetXpForLevel(level)) {
    level++
  }
  return level
}

function dvGetXpProgress(xp: number, level: number): number {
  if (level >= DV_MAX_LEVEL) return 1
  const currentLevelXp = dvGetXpForLevel(level - 1)
  const nextLevelXp = dvGetXpForLevel(level)
  const progress = (xp - currentLevelXp) / (nextLevelXp - currentLevelXp)
  return Math.min(Math.max(progress, 0), 1)
}

function dvGetRarityIndex(rarity: string): number {
  return DV_RARITY_ORDER.indexOf(rarity)
}

function dvIsRarityHigherOrEqual(a: string, b: string): boolean {
  return dvGetRarityIndex(a) >= dvGetRarityIndex(b)
}

function dvRandomFrom<T>(arr: T[]): T | null {
  if (arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

function dvWeightedRandom(items: { item: string; weight: number }[]): string | null {
  if (items.length === 0) return null
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0)
  let roll = Math.random() * totalWeight
  for (const entry of items) {
    roll -= entry.weight
    if (roll <= 0) return entry.item
  }
  return items[items.length - 1].item
}

function dvGetGemById(id: string): DVGem | undefined {
  return DV_GEMS.find(g => g.id === id)
}

function dvGetDragonById(id: string): DVDragon | undefined {
  return DV_DRAGONS.find(d => d.id === id)
}

function dvGetVaultById(id: string): DVVaultChamber | undefined {
  return DV_VAULTS.find(v => v.id === id)
}

function dvGetEquipmentById(id: string): DVEquipment | undefined {
  return DV_EQUIPMENT.find(e => e.id === id)
}

function dvGetTitleById(id: string): DVTitle | undefined {
  return DV_TITLES.find(t => t.id === id)
}

function dvGetGemsByElement(element: string): DVGem[] {
  return DV_GEMS.filter(g => g.element === element)
}

function dvGetDragonsByElement(element: string): DVDragon[] {
  return DV_DRAGONS.filter(d => d.element === element)
}

function dvGetEquipmentByType(type: string): DVEquipment[] {
  return DV_EQUIPMENT.filter(e => e.type === type)
}

function dvGetAvailableVaults(level: number): DVVaultChamber[] {
  return DV_VAULTS.filter(v => v.requiredLevel <= level)
}

function dvGetDragonEffectivePower(dragon: DVDragon, bondLevel: number): number {
  const bondMultiplier = 1 + (bondLevel / DV_DRAGON_BOND_MAX) * 0.5
  return Math.floor(dragon.basePower * bondMultiplier)
}

function dvGetDragonEffectiveHealth(dragon: DVDragon, bondLevel: number): number {
  const bondMultiplier = 1 + (bondLevel / DV_DRAGON_BOND_MAX) * 0.3
  return Math.floor(dragon.baseHealth * bondMultiplier)
}

function dvGetEquipmentEffectivePower(equipment: DVEquipment, level: number): number {
  const levelMultiplier = 1 + (level - 1) * 0.15
  return Math.floor(equipment.power * levelMultiplier)
}

function dvGetUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(DV_EQUIPMENT_UPGRADE_MULTIPLIER, currentLevel - 1))
}

function dvGetVaultExpansionCost(currentSlots: number): number {
  return Math.floor(DV_VAULT_EXPANSION_COST_BASE * Math.pow(DV_VAULT_EXPANSION_COST_MULTIPLIER, currentSlots))
}

function dvGetDefenseEnemyCount(wave: number): number {
  return Math.floor(DV_DEFENSE_WAVE_BASE_ENEMIES * Math.pow(DV_DEFENSE_WAVE_DIFFICULTY_SCALE, (wave - 1) / 3))
}

function dvGetDefenseEnemyPower(wave: number, playerPower: number): number {
  return Math.floor(playerPower * 0.4 * Math.pow(DV_DEFENSE_WAVE_DIFFICULTY_SCALE, (wave - 1) / 5))
}

function dvFormatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

function dvGetTodayDateString(): string {
  return new Date().toISOString().split('T')[0]
}

function dvCountUniqueGems(gemIds: string[]): number {
  const unique = new Set(gemIds)
  return unique.size
}

function dvCountUniqueDragons(dragonMap: Record<string, number>): number {
  return Object.keys(dragonMap).filter(k => dragonMap[k] > 0).length
}

function dvGetActiveDragonPower(dragons: Record<string, number>, maxActive: number): number {
  const bonded = Object.entries(dragons)
    .filter(([, bond]) => bond > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxActive)
  let total = 0
  for (const [dragonId, bond] of bonded) {
    const dragon = dvGetDragonById(dragonId)
    if (dragon) total += dvGetDragonEffectivePower(dragon, bond)
  }
  return total
}

function dvGetTotalDefensePower(equipmentMap: Record<string, number>): number {
  let total = 0
  for (const [eqId, eqLvl] of Object.entries(equipmentMap)) {
    const eq = dvGetEquipmentById(eqId)
    if (eq) total += dvGetEquipmentEffectivePower(eq, eqLvl)
  }
  return total
}

function dvEvaluateAchievement(state: DVSavedState, condition: string): boolean {
  if (condition === 'totalGemsCollected >= 1') return state.totalGemsCollected >= 1
  if (condition === 'totalGemsCollected >= 50') return state.totalGemsCollected >= 50
  if (condition === 'totalGemsCollected >= 200') return state.totalGemsCollected >= 200
  if (condition === 'totalDragonsBonded >= 1') return state.totalDragonsBonded >= 1
  if (condition === 'totalDragonsBonded >= 5') return state.totalDragonsBonded >= 5
  if (condition === 'bondedLegendary >= 1') {
    return Object.keys(state.dragons).some(id => {
      const dragon = dvGetDragonById(id)
      return dragon && dragon.rarity === DV_RARITY_LEGENDARY && state.dragons[id] > 0
    })
  }
  if (condition === 'totalVaultsExplored >= 1') return state.totalVaultsExplored >= 1
  if (condition === 'totalVaultsExplored >= 8') return state.totalVaultsExplored >= 8
  if (condition === 'totalDefenseWins >= 1') return state.totalDefenseWins >= 1
  if (condition === 'totalDefenseWins >= 25') return state.totalDefenseWins >= 25
  if (condition === 'highestWaveSurvived >= 15') return state.highestWaveSurvived >= 15
  if (condition === 'level >= 25') return state.level >= 25
  if (condition === 'level >= 50') return state.level >= 50
  if (condition === 'equipmentUpgradedCount >= 1') return state.equipmentUpgradedCount >= 1
  if (condition === 'hasMaxEquipment >= 1') {
    return Object.entries(state.equipment).some(([, lvl]) => lvl >= DV_EQUIPMENT_MAX_LEVEL)
  }
  if (condition === 'loginStreak >= 7') return state.loginStreak >= 7
  if (condition === 'loginStreak >= 30') return state.loginStreak >= 30
  if (condition === 'gemsCombined >= 10') return state.gemsCombined >= 10
  return false
}

function dvGetBestAvailableTitle(level: number, state: DVSavedState): string {
  for (let i = DV_TITLES.length - 1; i >= 0; i--) {
    if (level >= DV_TITLES[i].requiredLevel) {
      return DV_TITLES[i].id
    }
  }
  return DV_TITLES[0].id
}

function dvCombineGemPower(gems: DVGem[]): number {
  if (gems.length === 0) return 0
  const totalPower = gems.reduce((sum, g) => sum + g.power, 0)
  return Math.floor(totalPower * (1 + gems.length * 0.1))
}

function dvGetDragonAbilities(dragonId: string): DVDragonAbility[] {
  const dragon = dvGetDragonById(dragonId)
  if (!dragon) return []
  return DV_DRAGON_ABILITIES.filter(
    a => a.element === dragon.element
  )
}

function dvGetAbilityById(abilityId: string): DVDragonAbility | undefined {
  return DV_DRAGON_ABILITIES.find(a => a.id === abilityId)
}

function dvGetCraftRecipeById(recipeId: string): DVCraftRecipe | undefined {
  return DV_CRAFT_RECIPES.find(r => r.id === recipeId)
}

function dvGetAvailableCraftRecipes(level: number): DVCraftRecipe[] {
  return DV_CRAFT_RECIPES.filter(r => r.requiredLevel <= level)
}

function dvGetEnchantmentById(enchantmentId: string): DVEnchantment | undefined {
  return DV_ENCHANTMENTS.find(e => e.id === enchantmentId)
}

function dvGetEnchantmentsByElement(element: string): DVEnchantment[] {
  return DV_ENCHANTMENTS.filter(e => e.element === element)
}

function dvGetEnchantmentsByRarity(rarity: DVRarity): DVEnchantment[] {
  return DV_ENCHANTMENTS.filter(e => e.rarity === rarity)
}

function dvCalculateCraftCost(recipe: DVCraftRecipe, count: number): number {
  return Math.floor(recipe.requiredCoins * Math.pow(DV_CRAFTING_COST_MULTIPLIER, count))
}

function dvCalculateAbilityCooldown(baseCooldown: number, bondLevel: number): number {
  const reduction = bondLevel * DV_DRAGON_ABILITY_COOLDOWN_REDUCTION
  return Math.max(1, Math.floor(baseCooldown * (1 - Math.min(reduction, 0.5))))
}

function dvCalculateAbilityDamage(baseDamage: number, bondLevel: number, dragonPower: number): number {
  const bondMultiplier = 1 + (bondLevel / DV_DRAGON_BOND_MAX) * 0.8
  return Math.floor(baseDamage * bondMultiplier + dragonPower * 0.1)
}

function dvGenerateQuests(level: number, count: number): DVQuest[] {
  const questPool: DVQuest[] = []
  const collectTypes = DV_GEMS.filter(g => dvGetRarityIndex(g.rarity) <= Math.floor(level / 10)).map(g => g.id)
  const bondTypes = DV_DRAGONS.filter(d => dvGetRarityIndex(d.rarity) <= Math.floor(level / 10)).map(d => d.id)
  const gemTargets = dvRandomFrom(collectTypes)
  if (gemTargets) {
    questPool.push({
      id: `quest-collect-${Date.now()}-0`, name: 'Gem Gathering', description: `Collect ${5 + level} ${dvGetGemById(gemTargets)?.name ?? 'gems'}.`, type: 'collect', target: gemTargets, required: 5 + level, progress: 0, rewardCoins: 50 + level * 10, rewardXp: 30 + level * 5, rewardItemId: null, rewardItemType: null, completed: false, claimed: false, difficulty: Math.min(5, Math.ceil(level / 10)), color: '#38bdf8',
    })
  }
  const vaultTarget = dvRandomFrom(dvGetAvailableVaults(level))
  if (vaultTarget) {
    questPool.push({
      id: `quest-explore-${Date.now()}-1`, name: 'Vault Expedition', description: `Explore the ${vaultTarget.name}.`, type: 'explore', target: vaultTarget.id, required: 1, progress: 0, rewardCoins: DV_COINS_PER_VAULT_CLEAR + level * 20, rewardXp: DV_XP_PER_VAULT_EXPLORE + level * 8, rewardItemId: null, rewardItemType: null, completed: false, claimed: false, difficulty: vaultTarget.dangerLevel, color: '#a855f7',
    })
  }
  questPool.push({
    id: `quest-defend-${Date.now()}-2`, name: 'Vault Defense', description: `Win ${3 + Math.floor(level / 5)} defense waves.`, type: 'defend', target: 'wave', required: 3 + Math.floor(level / 5), progress: 0, rewardCoins: 100 + level * 15, rewardXp: 50 + level * 6, rewardItemId: null, rewardItemType: null, completed: false, claimed: false, difficulty: Math.min(5, Math.ceil(level / 10)), color: '#16a34a',
  })
  if (bondTypes.length > 0) {
    questPool.push({
      id: `quest-bond-${Date.now()}-3`, name: 'Dragon Bonding', description: `Feed a dragon ${5 + Math.floor(level / 8)} times.`, type: 'bond', target: 'feed', required: 5 + Math.floor(level / 8), progress: 0, rewardCoins: 80 + level * 12, rewardXp: 40 + level * 7, rewardItemId: null, rewardItemType: null, completed: false, claimed: false, difficulty: Math.min(5, Math.ceil(level / 8)), color: '#ef4444',
    })
  }
  questPool.push({
    id: `quest-upgrade-${Date.now()}-4`, name: 'Equipment Upgrade', description: `Upgrade equipment ${2 + Math.floor(level / 12)} times.`, type: 'upgrade', target: 'upgrade', required: 2 + Math.floor(level / 12), progress: 0, rewardCoins: 120 + level * 15, rewardXp: 60 + level * 5, rewardItemId: null, rewardItemType: null, completed: false, claimed: false, difficulty: Math.min(5, Math.ceil(level / 12)), color: '#f97316',
  })
  const shuffled = questPool.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function dvGetRarityColor(rarity: string): string {
  return DV_RARITY_COLORS[rarity] ?? '#8b8b8b'
}

function dvGetElementColor(element: string): string {
  return DV_DRAGON_COLORS[element] ?? DV_GEM_COLORS[element] ?? '#8b8b8b'
}

function dvIsMaxLevel(level: number): boolean {
  return level >= DV_MAX_LEVEL
}

function dvClampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function dvPercentToDecimal(percent: number): number {
  return percent / 100
}

function dvGetGemInventoryValue(gemIds: string[]): number {
  return gemIds.reduce((total, gemId) => {
    const gem = dvGetGemById(gemId)
    return total + (gem?.value ?? 0)
  }, 0)
}

function dvGetGemRarityDistribution(gemIds: string[]): Record<string, number> {
  const dist: Record<string, number> = { [DV_RARITY_COMMON]: 0, [DV_RARITY_UNCOMMON]: 0, [DV_RARITY_RARE]: 0, [DV_RARITY_EPIC]: 0, [DV_RARITY_LEGENDARY]: 0 }
  for (const gemId of gemIds) {
    const gem = dvGetGemById(gemId)
    if (gem) dist[gem.rarity]++
  }
  return dist
}

function dvGetDragonRarityDistribution(dragonMap: Record<string, number>): Record<string, number> {
  const dist: Record<string, number> = { [DV_RARITY_COMMON]: 0, [DV_RARITY_UNCOMMON]: 0, [DV_RARITY_RARE]: 0, [DV_RARITY_EPIC]: 0, [DV_RARITY_LEGENDARY]: 0 }
  for (const [dragonId, bond] of Object.entries(dragonMap)) {
    if (bond > 0) {
      const dragon = dvGetDragonById(dragonId)
      if (dragon) dist[dragon.rarity]++
    }
  }
  return dist
}

function dvGetRarityDropWeights(minRarityIndex: number): { item: string; weight: number }[] {
  const weights: { item: string; weight: number }[] = []
  DV_RARITY_ORDER.forEach((rarity, index) => {
    if (index >= minRarityIndex) {
      const gems = DV_GEMS.filter(g => g.rarity === rarity)
      const dragonWeight = rarity === DV_RARITY_LEGENDARY ? 2 : rarity === DV_RARITY_EPIC ? 5 : 10
      gems.forEach(gem => {
        weights.push({ item: gem.id, weight: 3 })
      })
      const dragons = DV_DRAGONS.filter(d => d.rarity === rarity)
      dragons.forEach(dragon => {
        weights.push({ item: dragon.id, weight: dragonWeight })
      })
      const equipment = DV_EQUIPMENT.filter(e => e.rarity === rarity)
      equipment.forEach(eq => {
        weights.push({ item: eq.id, weight: 4 })
      })
    }
  })
  return weights
}

// ---------------------------------------------------------------------------
// NON-HOOK RESET FUNCTION
// ---------------------------------------------------------------------------

export function dvResetProgress(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(DV_STORAGE_KEY)
}

// ---------------------------------------------------------------------------
// THE HOOK
// ---------------------------------------------------------------------------

export default function useDragonVault() {
  const [state, setState] = useState<DVSavedState>(dvCreateInitialState)
  const [initialized, setInitialized] = useState(false)
  const [recentlyUnlockedAchievements, setRecentlyUnlockedAchievements] = useState<DVAchievement[]>([])
  const [recentlyUnlockedTitle, setRecentlyUnlockedTitle] = useState<string | null>(null)
  const [lastCollectedGem, setLastCollectedGem] = useState<DVGem | null>(null)
  const [lastBondedDragon, setLastBondedDragon] = useState<DVDragon | null>(null)
  const [lastClearedVault, setLastClearedVault] = useState<DVVaultChamber | null>(null)
  const [lastDefenseResult, setLastDefenseResult] = useState<DVDefenseWave | null>(null)
  const [lastUpgradedEquipment, setLastUpgradedEquipment] = useState<DVEquipment | null>(null)
  const [combinedGemResult, setCombinedGemResult] = useState<DVGem | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const playTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const loaded = dvLoadState()
    setState(loaded)
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (!initialized) return
    dvSaveState(state)
  }, [state, initialized])

  useEffect(() => {
    if (!initialized) return
    playTimerRef.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        playTimeMinutes: prev.playTimeMinutes + 1,
      }))
    }, 60000)
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current)
    }
  }, [initialized])

  // --- NOTIFICATION ---
  const dvShowNotification = useCallback((message: string, durationMs: number = 3000) => {
    setNotification(message)
    setTimeout(() => setNotification(null), durationMs)
  }, [])

  // --- XP & LEVELING ---
  const dvAddXp = useCallback((rawXp: number) => {
    setState(prev => {
      const currentTitle = dvGetTitleById(prev.title)
      const xpMultiplier = 1 + (currentTitle?.bonusXpPercent ?? 0) / 100
      const actualXp = Math.floor(rawXp * xpMultiplier)
      const newXp = prev.xp + actualXp
      const newLevel = dvCalculateLevel(newXp)
      const newTitle = dvGetBestAvailableTitle(newLevel, prev)
      const leveledUp = newLevel > prev.level
      if (leveledUp) {
        const titleObj = dvGetTitleById(newTitle)
        if (titleObj && titleObj.id !== prev.title) {
          setRecentlyUnlockedTitle(titleObj.name)
          setTimeout(() => setRecentlyUnlockedTitle(null), 4000)
        }
      }
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        title: newTitle,
      }
    })
  }, [])

  const dvGetLevel = useCallback(() => state.level, [state.level])
  const dvGetXp = useCallback(() => state.xp, [state.xp])
  const dvGetXpToNextLevel = useCallback(() => {
    if (state.level >= DV_MAX_LEVEL) return 0
    return dvGetXpForLevel(state.level) - state.xp
  }, [state.level, state.xp])
  const dvGetXpProgress = useCallback(() => {
    return dvGetXpProgress(state.xp, state.level)
  }, [state.xp, state.level])

  // --- COINS ---
  const dvAddCoins = useCallback((rawCoins: number) => {
    setState(prev => {
      const currentTitle = dvGetTitleById(prev.title)
      const coinMultiplier = 1 + (currentTitle?.bonusCoinPercent ?? 0) / 100
      const actualCoins = Math.floor(rawCoins * coinMultiplier)
      return { ...prev, coins: prev.coins + actualCoins }
    })
  }, [])

  const dvSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins < amount) return prev
      success = true
      return { ...prev, coins: prev.coins - amount }
    })
    return success
  }, [])

  const dvGetCoins = useCallback(() => state.coins, [state.coins])

  // --- GEMS ---
  const dvCollectGem = useCallback((gemId: string) => {
    const gem = dvGetGemById(gemId)
    if (!gem) return false
    if (state.gems.length >= DV_MAX_GEMS_INVENTORY) {
      dvShowNotification('Gem inventory is full!')
      return false
    }
    setState(prev => ({
      ...prev,
      gems: [...prev.gems, gemId],
      totalGemsCollected: prev.totalGemsCollected + 1,
    }))
    dvAddXp(DV_XP_PER_GEM_COLLECT)
    setLastCollectedGem(gem)
    setTimeout(() => setLastCollectedGem(null), 3000)
    dvShowNotification(`Collected ${gem.name}! +${DV_XP_PER_GEM_COLLECT} XP`)
    return true
  }, [state.gems.length, dvAddXp, dvShowNotification])

  const dvSellGem = useCallback((gemId: string, index: number): boolean => {
    if (index < 0 || index >= state.gems.length) return false
    if (state.gems[index] !== gemId) return false
    const gem = dvGetGemById(gemId)
    if (!gem) return false
    setState(prev => ({
      ...prev,
      gems: [...prev.gems.slice(0, index), ...prev.gems.slice(index + 1)],
      coins: prev.coins + gem.value,
    }))
    dvShowNotification(`Sold ${gem.name} for ${gem.value} coins!`)
    return true
  }, [state.gems, dvShowNotification])

  const dvSellAllGems = useCallback((element?: string): number => {
    let totalValue = 0
    setState(prev => {
      const toKeep: string[] = []
      for (const gemId of prev.gems) {
        const gem = dvGetGemById(gemId)
        if (gem && (element === undefined || gem.element === element)) {
          totalValue += gem.value
        } else {
          toKeep.push(gemId)
        }
      }
      return { ...prev, gems: toKeep, coins: prev.coins + totalValue }
    })
    if (totalValue > 0) {
      dvShowNotification(`Sold gems for ${totalValue} coins!`)
    }
    return totalValue
  }, [dvShowNotification])

  const dvGetGems = useCallback(() => state.gems, [state.gems])
  const dvGetGemCount = useCallback(() => state.gems.length, [state.gems])
  const dvGetGemCountsByElement = useCallback((): Record<string, number> => {
    const counts: Record<string, number> = {}
    for (const gemId of state.gems) {
      const gem = dvGetGemById(gemId)
      if (gem) {
        counts[gem.element] = (counts[gem.element] ?? 0) + 1
      }
    }
    return counts
  }, [state.gems])
  const dvGetUniqueGemCount = useCallback(() => dvCountUniqueGems(state.gems), [state.gems])

  const dvGetTotalGemPower = useCallback(() => {
    return state.gems.reduce((total, gemId) => {
      const gem = dvGetGemById(gemId)
      return total + (gem?.power ?? 0)
    }, 0)
  }, [state.gems])

  // --- GEM COMBINING ---
  const dvCombineGems = useCallback((indices: number[]): string | null => {
    if (indices.length < DV_FORGE_COMBINE_COST) return null
    if (indices.some(i => i < 0 || i >= state.gems.length)) return null
    const gems = indices.map(i => state.gems[i])
    const gemObjects = gems.map(id => dvGetGemById(id)).filter((g): g is DVGem => g !== undefined)
    if (gemObjects.length < DV_FORGE_COMBINE_COST) return null
    const highestRarityIndex = Math.max(...gemObjects.map(g => dvGetRarityIndex(g.rarity)))
    const nextRarityIndex = Math.min(highestRarityIndex + 1, DV_RARITY_ORDER.length - 1)
    const targetRarity = DV_RARITY_ORDER[nextRarityIndex] as DVRarity
    const candidates = DV_GEMS.filter(g => g.rarity === targetRarity)
    const result = dvRandomFrom(candidates)
    if (!result) return null
    const newGems = state.gems.filter((_, idx) => !indices.includes(idx))
    setState(prev => ({
      ...prev,
      gems: [...newGems, result.id],
      gemsCombined: prev.gemsCombined + 1,
    }))
    dvAddXp(DV_XP_PER_GEM_COLLECT)
    setCombinedGemResult(result)
    setTimeout(() => setCombinedGemResult(null), 3000)
    dvShowNotification(`Combined into ${result.name}!`)
    return result.id
  }, [state.gems, dvAddXp, dvShowNotification])

  // --- DRAGONS ---
  const dvBondDragon = useCallback((dragonId: string): boolean => {
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return false
    setState(prev => {
      const isNew = !prev.dragons[dragonId] || prev.dragons[dragonId] === 0
      return {
        ...prev,
        dragons: {
          ...prev.dragons,
          [dragonId]: Math.max(prev.dragons[dragonId] ?? 0, 1),
        },
        totalDragonsBonded: isNew ? prev.totalDragonsBonded + 1 : prev.totalDragonsBonded,
      }
    })
    dvAddXp(DV_XP_PER_DRAGON_BOND)
    setLastBondedDragon(dragon)
    setTimeout(() => setLastBondedDragon(null), 3000)
    dvShowNotification(`Bonded with ${dragon.name}! +${DV_XP_PER_DRAGON_BOND} XP`)
    return true
  }, [dvAddXp, dvShowNotification])

  const dvFeedDragon = useCallback((dragonId: string): boolean => {
    if (state.coins < DV_DRAGON_FEED_COST) {
      dvShowNotification('Not enough coins to feed dragon!')
      return false
    }
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return false
    const currentBond = state.dragons[dragonId] ?? 0
    if (currentBond >= DV_DRAGON_BOND_MAX) {
      dvShowNotification(`${dragon.name} is already at maximum bond!`)
      return false
    }
    setState(prev => {
      const newBond = Math.min((prev.dragons[dragonId] ?? 0) + DV_DRAGON_FEED_BOND_GAIN, DV_DRAGON_BOND_MAX)
      return {
        ...prev,
        coins: prev.coins - DV_DRAGON_FEED_COST,
        dragons: { ...prev.dragons, [dragonId]: newBond },
        dragonFeedCount: prev.dragonFeedCount + 1,
      }
    })
    dvShowNotification(`Fed ${dragon.name}! Bond +${DV_DRAGON_FEED_BOND_GAIN}`)
    return true
  }, [state.coins, state.dragons, dvShowNotification])

  const dvGetDragonBondLevel = useCallback((dragonId: string): number => {
    return state.dragons[dragonId] ?? 0
  }, [state.dragons])

  const dvGetBondedDragons = useCallback(() => {
    return Object.entries(state.dragons)
      .filter(([, bond]) => bond > 0)
      .map(([id, bond]) => ({ dragon: dvGetDragonById(id)!, bond }))
      .filter(entry => entry.dragon !== undefined)
      .sort((a, b) => b.bond - a.bond)
  }, [state.dragons])

  const dvGetDragonCount = useCallback(() => {
    return Object.keys(state.dragons).filter(k => state.dragons[k] > 0).length
  }, [state.dragons])

  const dvGetActiveDragons = useCallback(() => {
    return dvGetBondedDragons().slice(0, DV_MAX_DRAGONS_ACTIVE)
  }, [dvGetBondedDragons])

  const dvGetActiveDragonPower = useCallback((): number => {
    return dvGetActiveDragonPower(state.dragons, DV_MAX_DRAGONS_ACTIVE)
  }, [state.dragons])

  const dvGetDragonPower = useCallback((dragonId: string): number => {
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return 0
    return dvGetDragonEffectivePower(dragon, state.dragons[dragonId] ?? 0)
  }, [state.dragons])

  const dvGetDragonHealth = useCallback((dragonId: string): number => {
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return 0
    return dvGetDragonEffectiveHealth(dragon, state.dragons[dragonId] ?? 0)
  }, [state.dragons])

  // --- EQUIPMENT ---
  const dvEquipItem = useCallback((equipmentId: string): boolean => {
    const equipment = dvGetEquipmentById(equipmentId)
    if (!equipment) return false
    setState(prev => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [equipmentId]: Math.max(prev.equipment[equipmentId] ?? 0, 1),
      },
    }))
    dvShowNotification(`Equipped ${equipment.name}!`)
    return true
  }, [dvShowNotification])

  const dvUnequipItem = useCallback((equipmentId: string): boolean => {
    if (!state.equipment[equipmentId]) return false
    setState(prev => {
      const newEq = { ...prev.equipment }
      delete newEq[equipmentId]
      return { ...prev, equipment: newEq }
    })
    return true
  }, [state.equipment])

  const dvUpgradeEquipment = useCallback((equipmentId: string): boolean => {
    const equipment = dvGetEquipmentById(equipmentId)
    if (!equipment) return false
    const currentLevel = state.equipment[equipmentId] ?? 0
    if (currentLevel < 1) return false
    if (currentLevel >= equipment.maxLevel) {
      dvShowNotification(`${equipment.name} is already at max level!`)
      return false
    }
    const cost = dvGetUpgradeCost(equipment.upgradeCost, currentLevel)
    if (state.coins < cost) {
      dvShowNotification(`Not enough coins! Need ${cost} coins.`)
      return false
    }
    setState(prev => ({
      ...prev,
      coins: prev.coins - cost,
      equipment: { ...prev.equipment, [equipmentId]: currentLevel + 1 },
      equipmentUpgradedCount: prev.equipmentUpgradedCount + 1,
    }))
    setLastUpgradedEquipment({ ...equipment, level: currentLevel + 1 })
    setTimeout(() => setLastUpgradedEquipment(null), 3000)
    dvShowNotification(`Upgraded ${equipment.name} to level ${currentLevel + 1}!`)
    return true
  }, [state.coins, state.equipment, dvShowNotification])

  const dvGetEquippedItems = useCallback(() => {
    return Object.entries(state.equipment)
      .map(([id, level]) => ({ equipment: dvGetEquipmentById(id)!, level }))
      .filter(entry => entry.equipment !== undefined)
  }, [state.equipment])

  const dvGetEquipmentLevel = useCallback((equipmentId: string): number => {
    return state.equipment[equipmentId] ?? 0
  }, [state.equipment])

  const dvGetEquipmentPower = useCallback((equipmentId: string): number => {
    const equipment = dvGetEquipmentById(equipmentId)
    if (!equipment) return 0
    return dvGetEquipmentEffectivePower(equipment, state.equipment[equipmentId] ?? 1)
  }, [state.equipment])

  const dvGetTotalDefenseBonus = useCallback((): number => {
    let total = 0
    for (const [eqId, eqLvl] of Object.entries(state.equipment)) {
      const eq = dvGetEquipmentById(eqId)
      if (eq) {
        const levelMultiplier = 1 + (eqLvl - 1) * 0.15
        total += Math.floor(eq.defenseBonus * levelMultiplier)
      }
    }
    return total
  }, [state.equipment])

  const dvGetTotalDragonBonus = useCallback((): number => {
    let total = 0
    for (const [eqId, eqLvl] of Object.entries(state.equipment)) {
      const eq = dvGetEquipmentById(eqId)
      if (eq) {
        const levelMultiplier = 1 + (eqLvl - 1) * 0.15
        total += Math.floor(eq.dragonBonus * levelMultiplier)
      }
    }
    return total
  }, [state.equipment])

  const dvGetUpgradeCostForEquipment = useCallback((equipmentId: string): number => {
    const equipment = dvGetEquipmentById(equipmentId)
    if (!equipment) return 0
    const currentLevel = state.equipment[equipmentId] ?? 0
    return dvGetUpgradeCost(equipment.upgradeCost, currentLevel)
  }, [state.equipment])

  // --- VAULTS ---
  const dvExploreVault = useCallback((vaultId: string): DVVaultChamber | null => {
    const vault = dvGetVaultById(vaultId)
    if (!vault) return null
    if (state.level < vault.requiredLevel) {
      dvShowNotification(`Requires level ${vault.requiredLevel}!`)
      return null
    }
    setState(prev => {
      const newVaultsCleared = prev.vaultsCleared.includes(vaultId)
        ? prev.vaultsCleared
        : [...prev.vaultsCleared, vaultId]
      const wasNew = !prev.vaultsCleared.includes(vaultId)
      return {
        ...prev,
        currentVault: vaultId,
        vaultsCleared: newVaultsCleared,
        totalVaultsExplored: wasNew ? prev.totalVaultsExplored + 1 : prev.totalVaultsExplored,
      }
    })
    dvAddXp(DV_XP_PER_VAULT_EXPLORE)
    dvAddCoins(DV_COINS_PER_VAULT_CLEAR)
    setLastClearedVault(vault)
    setTimeout(() => setLastClearedVault(null), 3000)
    dvShowNotification(`Explored ${vault.name}! +${DV_COINS_PER_VAULT_CLEAR} coins`)
    return vault
  }, [state.level, state.vaultsCleared, dvAddXp, dvAddCoins, dvShowNotification])

  const dvGetCurrentVault = useCallback((): DVVaultChamber | null => {
    if (!state.currentVault) return null
    return dvGetVaultById(state.currentVault) ?? null
  }, [state.currentVault])

  const dvGetClearedVaults = useCallback((): string[] => {
    return state.vaultsCleared
  }, [state.vaultsCleared])

  const dvIsVaultCleared = useCallback((vaultId: string): boolean => {
    return state.vaultsCleared.includes(vaultId)
  }, [state.vaultsCleared])

  const dvGetClearedVaultCount = useCallback((): number => {
    return state.vaultsCleared.length
  }, [state.vaultsCleared])

  // --- VAULT DEFENSE ---
  const dvSimulateDefenseWave = useCallback((wave: number): DVDefenseWave => {
    const dragonPower = dvGetActiveDragonPower(state.dragons, DV_MAX_DRAGONS_ACTIVE)
    const defenseBonus = (() => {
      let total = 0
      for (const [eqId, eqLvl] of Object.entries(state.equipment)) {
        const eq = dvGetEquipmentById(eqId)
        if (eq) total += Math.floor(eq.defenseBonus * (1 + (eqLvl - 1) * 0.15))
      }
      return total
    })()
    const totalPlayerPower = dragonPower + defenseBonus + DV_DEFENSE_BASE_HEALTH
    const enemyCount = dvGetDefenseEnemyCount(wave)
    const enemyPower = dvGetDefenseEnemyPower(wave, totalPlayerPower)
    const totalEnemyPower = enemyPower * enemyCount
    const successChance = Math.min(0.95, totalPlayerPower / (totalPlayerPower + totalEnemyPower * 0.7))
    const roll = Math.random()
    const success = roll < successChance
    const damage = success ? Math.floor(totalEnemyPower * 0.1) : Math.floor(totalPlayerPower * 0.3)
    const goldEarned = success ? Math.floor(50 * wave * successChance) : Math.floor(10 * wave)
    const xpEarned = success ? DV_XP_PER_DEFENSE_WIN + wave * 5 : wave * 2
    const result: DVDefenseWave = {
      wave,
      enemies: enemyCount,
      enemyPower,
      dragonPower,
      success,
      damage,
      goldEarned,
      xpEarned,
    }
    setState(prev => ({
      ...prev,
      totalDefenseWins: success ? prev.totalDefenseWins + 1 : prev.totalDefenseWins,
      highestWaveSurvived: success && wave > prev.highestWaveSurvived ? wave : prev.highestWaveSurvived,
    }))
    if (success) {
      dvAddXp(xpEarned)
      dvAddCoins(goldEarned)
    }
    setLastDefenseResult(result)
    setTimeout(() => setLastDefenseResult(null), 5000)
    dvShowNotification(
      success
        ? `Wave ${wave} defeated! +${goldEarned} coins +${xpEarned} XP`
        : `Wave ${wave} lost. ${damage} damage taken.`
    )
    return result
  }, [state.dragons, state.equipment, dvAddXp, dvAddCoins, dvShowNotification])

  // --- TITLES ---
  const dvGetTitle = useCallback((): DVTitle => {
    return dvGetTitleById(state.title) ?? DV_TITLES[0]
  }, [state.title])

  const dvSetTitle = useCallback((titleId: string): boolean => {
    const title = dvGetTitleById(titleId)
    if (!title) return false
    if (state.level < title.requiredLevel) return false
    setState(prev => ({ ...prev, title: titleId }))
    dvShowNotification(`Title set to: ${title.name}!`)
    return true
  }, [state.level, dvShowNotification])

  const dvGetAvailableTitles = useCallback((): DVTitle[] => {
    return DV_TITLES.filter(t => state.level >= t.requiredLevel)
  }, [state.level])

  const dvGetCurrentTitle = useCallback((): string => {
    const title = dvGetTitleById(state.title)
    return title?.name ?? DV_TITLES[0].name
  }, [state.title])

  const dvGetTitleBonus = useCallback(() => {
    const title = dvGetTitleById(state.title)
    return {
      xpBonus: title?.bonusXpPercent ?? 0,
      coinBonus: title?.bonusCoinPercent ?? 0,
    }
  }, [state.title])

  // --- ACHIEVEMENTS ---
  const dvCheckAchievements = useCallback(() => {
    const newAchievements: DVAchievement[] = []
    setState(prev => {
      let updated = { ...prev }
      for (const achievement of DV_ACHIEVEMENTS) {
        if (updated.achievements.includes(achievement.id)) continue
        if (dvEvaluateAchievement(updated, achievement.condition)) {
          updated = {
            ...updated,
            achievements: [...updated.achievements, achievement.id],
            coins: updated.coins + achievement.rewardCoins,
          }
          newAchievements.push(achievement)
          dvAddXp(achievement.rewardXp + DV_XP_PER_ACHIEVEMENT)
        }
      }
      return updated
    })
    if (newAchievements.length > 0) {
      setRecentlyUnlockedAchievements(prev => [...prev, ...newAchievements])
      setTimeout(() => {
        setRecentlyUnlockedAchievements(prev =>
          prev.filter(a => !newAchievements.find(na => na.id === a.id))
        )
      }, 5000)
    }
    return newAchievements
  }, [dvAddXp])

  const dvGetAchievements = useCallback((): DVAchievement[] => {
    return DV_ACHIEVEMENTS
  }, [])

  const dvGetUnlockedAchievements = useCallback((): DVAchievement[] => {
    return DV_ACHIEVEMENTS.filter(a => state.achievements.includes(a.id))
  }, [state.achievements])

  const dvGetLockedAchievements = useCallback((): DVAchievement[] => {
    return DV_ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id))
  }, [state.achievements])

  const dvIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements.includes(achievementId)
  }, [state.achievements])

  const dvGetAchievementCount = useCallback((): number => {
    return state.achievements.length
  }, [state.achievements])

  const dvGetAchievementProgress = useCallback((): number => {
    return state.achievements.length / DV_ACHIEVEMENTS.length
  }, [state.achievements])

  // --- DAILY LOGIN ---
  const dvProcessDailyLogin = useCallback((): { coins: number; streak: number; isNewDay: boolean } => {
    const today = dvGetTodayDateString()
    let result = { coins: 0, streak: 0, isNewDay: false }
    setState(prev => {
      if (prev.lastLoginDate === today) {
        result = { coins: 0, streak: prev.loginStreak, isNewDay: false }
        return prev
      }
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const isConsecutive = prev.lastLoginDate === yesterdayStr
      const newStreak = isConsecutive ? prev.loginStreak + 1 : 1
      const streakBonus = Math.floor(newStreak * DV_DAILY_LOGIN_STREAK_BONUS)
      const totalCoins = DV_DAILY_LOGIN_COINS + streakBonus
      result = { coins: totalCoins, streak: newStreak, isNewDay: true }
      return {
        ...prev,
        coins: prev.coins + totalCoins,
        loginStreak: newStreak,
        lastLoginDate: today,
      }
    })
    if (result.isNewDay) {
      dvShowNotification(`Daily login! +${result.coins} coins (${result.streak} day streak)`)
    }
    return result
  }, [dvShowNotification])

  const dvGetLoginStreak = useCallback((): number => {
    return state.loginStreak
  }, [state.loginStreak])

  const dvIsNewDay = useCallback((): boolean => {
    return state.lastLoginDate !== dvGetTodayDateString()
  }, [state.lastLoginDate])

  // --- TREASURE CHESTS ---
  const dvOpenTreasureChest = useCallback((): { gemId: string | null; coins: number; equipmentId: string | null; dragonId: string | null } => {
    const coins = Math.floor(DV_TREASURE_CHEST_BASE_COINS * (0.5 + Math.random()))
    const minRarity = state.level >= 25 ? 1 : 0
    const dropTable = dvGetRarityDropWeights(minRarity)
    const gemDrop = Math.random() < 0.6 ? dvWeightedRandom(dropTable) : null
    const gemFromTable = gemDrop ? DV_GEMS.find(g => g.id === gemDrop) : null
    const dragonDrop = !gemFromTable && Math.random() < 0.15 ? dvWeightedRandom(dropTable) : null
    const dragonFromTable = dragonDrop ? DV_DRAGONS.find(d => d.id === dragonDrop) : null
    const equipmentDrop = !gemFromTable && !dragonFromTable ? dvWeightedRandom(dropTable) : null
    const equipmentFromTable = equipmentDrop ? DV_EQUIPMENT.find(e => e.id === equipmentDrop) : null
    setState(prev => {
      const newGems = gemFromTable ? [...prev.gems, gemFromTable.id] : prev.gems
      const newDragons = { ...prev.dragons }
      if (dragonFromTable) {
        newDragons[dragonFromTable.id] = Math.max(newDragons[dragonFromTable.id] ?? 0, 1)
      }
      const newEquipment = { ...prev.equipment }
      if (equipmentFromTable) {
        newEquipment[equipmentFromTable.id] = Math.max(newEquipment[equipmentFromTable.id] ?? 0, 1)
      }
      return {
        ...prev,
        gems: newGems,
        dragons: newDragons,
        equipment: newEquipment,
        coins: prev.coins + coins,
        treasureChestsOpened: prev.treasureChestsOpened + 1,
        totalGemsCollected: gemFromTable ? prev.totalGemsCollected + 1 : prev.totalGemsCollected,
        totalDragonsBonded: dragonFromTable ? prev.totalDragonsBonded + 1 : prev.totalDragonsBonded,
      }
    })
    dvAddXp(20)
    dvShowNotification('Treasure chest opened!')
    return {
      gemId: gemFromTable?.id ?? null,
      coins,
      equipmentId: equipmentFromTable?.id ?? null,
      dragonId: dragonFromTable?.id ?? null,
    }
  }, [state.level, state.gems, dvAddXp, dvShowNotification])

  const dvGetTreasureChestsOpened = useCallback((): number => {
    return state.treasureChestsOpened
  }, [state.treasureChestsOpened])

  // --- SPIRIT SHARDS ---
  const dvAddSpiritShards = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      spiritShards: prev.spiritShards + amount,
    }))
  }, [])

  const dvSpendSpiritShards = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.spiritShards < amount) return prev
      success = true
      return { ...prev, spiritShards: prev.spiritShards - amount }
    })
    return success
  }, [])

  const dvGetSpiritShards = useCallback((): number => {
    return state.spiritShards
  }, [state.spiritShards])

  // --- STATS ---
  const dvGetTotalPower = useCallback((): number => {
    const gemPower = state.gems.reduce((total, gemId) => {
      const gem = dvGetGemById(gemId)
      return total + (gem?.power ?? 0)
    }, 0)
    const dragonPower = dvGetActiveDragonPower(state.dragons, DV_MAX_DRAGONS_ACTIVE)
    const equipmentPower = (() => {
      let total = 0
      for (const [eqId, eqLvl] of Object.entries(state.equipment)) {
        const eq = dvGetEquipmentById(eqId)
        if (eq) total += dvGetEquipmentEffectivePower(eq, eqLvl)
      }
      return total
    })()
    return gemPower + dragonPower + equipmentPower
  }, [state.gems, state.dragons, state.equipment])

  const dvGetTotalGemsCollected = useCallback((): number => {
    return state.totalGemsCollected
  }, [state.totalGemsCollected])

  const dvGetTotalDragonsBonded = useCallback((): number => {
    return state.totalDragonsBonded
  }, [state.totalDragonsBonded])

  const dvGetTotalVaultsExplored = useCallback((): number => {
    return state.totalVaultsExplored
  }, [state.totalVaultsExplored])

  const dvGetTotalDefenseWins = useCallback((): number => {
    return state.totalDefenseWins
  }, [state.totalDefenseWins])

  const dvGetHighestWaveSurvived = useCallback((): number => {
    return state.highestWaveSurvived
  }, [state.highestWaveSurvived])

  const dvGetPlayTimeMinutes = useCallback((): number => {
    return state.playTimeMinutes
  }, [state.playTimeMinutes])

  const dvGetPlayTimeFormatted = useCallback((): string => {
    const hours = Math.floor(state.playTimeMinutes / 60)
    const minutes = state.playTimeMinutes % 60
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }, [state.playTimeMinutes])

  // --- SETTINGS ---
  const dvUpdateSettings = useCallback((partial: Partial<DVSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }))
  }, [])

  const dvGetSettings = useCallback((): DVSettings => {
    return state.settings
  }, [state.settings])

  const dvSetMusicVolume = useCallback((volume: number) => {
    dvUpdateSettings({ musicVolume: Math.max(0, Math.min(100, volume)) })
  }, [dvUpdateSettings])

  const dvSetSfxVolume = useCallback((volume: number) => {
    dvUpdateSettings({ sfxVolume: Math.max(0, Math.min(100, volume)) })
  }, [dvUpdateSettings])

  const dvToggleParticles = useCallback(() => {
    dvUpdateSettings({ particleEffects: !state.settings.particleEffects })
  }, [state.settings.particleEffects, dvUpdateSettings])

  const dvToggleScreenShake = useCallback(() => {
    dvUpdateSettings({ screenShake: !state.settings.screenShake })
  }, [state.settings.screenShake, dvUpdateSettings])

  const dvToggleDamageNumbers = useCallback(() => {
    dvUpdateSettings({ showDamageNumbers: !state.settings.showDamageNumbers })
  }, [state.settings.showDamageNumbers, dvUpdateSettings])

  const dvToggleAutoEquip = useCallback(() => {
    dvUpdateSettings({ autoEquip: !state.settings.autoEquip })
  }, [state.settings.autoEquip, dvUpdateSettings])

  const dvToggleNotifications = useCallback(() => {
    dvUpdateSettings({ notificationsEnabled: !state.settings.notificationsEnabled })
  }, [state.settings.notificationsEnabled, dvUpdateSettings])

  // --- RANDOM LOOT GENERATION ---
  const dvGenerateRandomGem = useCallback((minRarity?: DVRarity): DVGem | null => {
    const minIndex = minRarity ? dvGetRarityIndex(minRarity) : 0
    const eligibleGems = DV_GEMS.filter(g => dvGetRarityIndex(g.rarity) >= minIndex)
    return dvRandomFrom(eligibleGems)
  }, [])

  const dvGenerateRandomDragon = useCallback((minRarity?: DVRarity): DVDragon | null => {
    const minIndex = minRarity ? dvGetRarityIndex(minRarity) : 0
    const eligibleDragons = DV_DRAGONS.filter(d => dvGetRarityIndex(d.rarity) >= minIndex)
    return dvRandomFrom(eligibleDragons)
  }, [])

  const dvGenerateRandomEquipment = useCallback((minRarity?: DVRarity): DVEquipment | null => {
    const minIndex = minRarity ? dvGetRarityIndex(minRarity) : 0
    const eligibleEquipment = DV_EQUIPMENT.filter(e => dvGetRarityIndex(e.rarity) >= minIndex)
    return dvRandomFrom(eligibleEquipment)
  }, [])

  // --- ELEMENT INTERACTIONS ---
  const dvGetElementalAdvantage = useCallback((attackerElement: string, defenderElement: string): number => {
    const advantages: Record<string, string[]> = {
      fire: ['ice', 'nature', 'bone'],
      ice: ['storm', 'earth', 'mist'],
      storm: ['water', 'void'],
      earth: ['fire', 'thunder', 'crystal'],
      shadow: ['light', 'cosmic'],
      light: ['shadow', 'void'],
      void: ['nature', 'earth'],
      nature: ['water', 'earth'],
      cosmic: ['void', 'shadow'],
      blood: ['nature', 'bone', 'mist'],
      crystal: ['storm', 'fire'],
      magma: ['ice', 'bone', 'crystal'],
      frost: ['fire', 'magma', 'ember'],
      thunder: ['ice', 'mist', 'void'],
      abyss: ['fire', 'crystal', 'cosmic'],
      jade: ['blood', 'shadow', 'void'],
      onyx: ['light', 'cosmic', 'jade'],
      spectral: ['onyx', 'bone', 'abyss'],
      primal: ['all'],
    }
    const strong = advantages[attackerElement]
    if (!strong) return 1.0
    if (strong.includes('all')) return 1.5
    if (strong.includes(defenderElement)) return 1.3
    const weakAgainst = advantages[defenderElement]
    if (weakAgainst && weakAgainst.includes(attackerElement)) return 0.7
    return 1.0
  }, [])

  // --- BULK OPERATIONS ---
  const dvClaimAllRewards = useCallback((): { totalXp: number; totalCoins: number } => {
    let totalXp = 0
    let totalCoins = 0
    const newAchievements = dvCheckAchievements()
    for (const achievement of newAchievements) {
      totalXp += achievement.rewardXp + DV_XP_PER_ACHIEVEMENT
      totalCoins += achievement.rewardCoins
    }
    return { totalXp, totalCoins }
  }, [dvCheckAchievements])

  const dvGetInventorySummary = useCallback(() => {
    const bondedDragons = Object.keys(state.dragons).filter(k => state.dragons[k] > 0).length
    const equippedItems = Object.keys(state.equipment).length
    return {
      gems: state.gems.length,
      uniqueGems: dvCountUniqueGems(state.gems),
      bondedDragons,
      equippedItems,
      clearedVaults: state.vaultsCleared.length,
      achievements: state.achievements.length,
      totalAchievements: DV_ACHIEVEMENTS.length,
    }
  }, [state.gems, state.dragons, state.equipment, state.vaultsCleared, state.achievements])

  const dvGetPowerBreakdown = useCallback(() => {
    const gemPower = state.gems.reduce((total, gemId) => {
      const gem = dvGetGemById(gemId)
      return total + (gem?.power ?? 0)
    }, 0)
    const dragonEntries = Object.entries(state.dragons)
      .filter(([, bond]) => bond > 0)
      .map(([id, bond]) => {
        const dragon = dvGetDragonById(id)
        return dragon ? { name: dragon.name, power: dvGetDragonEffectivePower(dragon, bond) } : null
      })
      .filter((e): e is { name: string; power: number } => e !== null)
      .sort((a, b) => b.power - a.power)
    const dragonPower = dragonEntries.reduce((sum, d) => sum + d.power, 0)
    const equipmentEntries = Object.entries(state.equipment)
      .map(([id, level]) => {
        const eq = dvGetEquipmentById(id)
        return eq ? { name: eq.name, power: dvGetEquipmentEffectivePower(eq, level) } : null
      })
      .filter((e): e is { name: string; power: number } => e !== null)
    const equipmentPower = equipmentEntries.reduce((sum, e) => sum + e.power, 0)
    return {
      total: gemPower + dragonPower + equipmentPower,
      gemPower,
      dragonPower,
      equipmentPower,
      dragons: dragonEntries,
      equipment: equipmentEntries,
    }
  }, [state.gems, state.dragons, state.equipment])

  const dvGetCompletionPercentage = useCallback((): number => {
    const gemCompletion = dvCountUniqueGems(state.gems) / DV_GEMS.length
    const dragonCompletion = dvCountUniqueDragons(state.dragons) / DV_DRAGONS.length
    const vaultCompletion = state.vaultsCleared.length / DV_VAULTS.length
    const achievementCompletion = state.achievements.length / DV_ACHIEVEMENTS.length
    const equipmentCompletion = Object.keys(state.equipment).length / DV_EQUIPMENT.length
    return Math.floor(
      ((gemCompletion + dragonCompletion + vaultCompletion + achievementCompletion + equipmentCompletion) / 5) * 100
    )
  }, [state.gems, state.dragons, state.vaultsCleared, state.achievements, state.equipment])

  // --- DRAGON ABILITIES ---
  const dvGetDragonAbilities = useCallback((dragonId: string): DVDragonAbility[] => {
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return []
    return DV_DRAGON_ABILITIES.filter(a => a.element === dragon.element)
  }, [])

  const dvGetAbilityDamage = useCallback((abilityId: string, dragonId: string): number => {
    const ability = DV_DRAGON_ABILITIES.find(a => a.id === abilityId)
    if (!ability) return 0
    const bondLevel = state.dragons[dragonId] ?? 0
    const dragon = dvGetDragonById(dragonId)
    if (!dragon) return 0
    const dragonPower = dvGetDragonEffectivePower(dragon, bondLevel)
    return dvCalculateAbilityDamage(ability.baseDamage, bondLevel, dragonPower)
  }, [state.dragons])

  const dvGetAbilityCooldown = useCallback((abilityId: string, dragonId: string): number => {
    const ability = DV_DRAGON_ABILITIES.find(a => a.id === abilityId)
    if (!ability) return 0
    const bondLevel = state.dragons[dragonId] ?? 0
    return dvCalculateAbilityCooldown(ability.cooldown, bondLevel)
  }, [state.dragons])

  const dvCanDragonUseAbility = useCallback((abilityId: string, dragonId: string): boolean => {
    const ability = DV_DRAGON_ABILITIES.find(a => a.id === abilityId)
    if (!ability) return false
    const bondLevel = state.dragons[dragonId] ?? 0
    return bondLevel >= ability.unlockLevel
  }, [state.dragons])

  const dvGetAllAbilities = useCallback((): DVDragonAbility[] => {
    return DV_DRAGON_ABILITIES
  }, [])

  // --- CRAFTING ---
  const dvCanCraft = useCallback((recipeId: string): boolean => {
    const recipe = dvGetCraftRecipeById(recipeId)
    if (!recipe) return false
    if (state.level < recipe.requiredLevel) return false
    if (state.coins < recipe.requiredCoins) return false
    for (const [gemId, required] of Object.entries(recipe.requiredGems)) {
      const count = state.gems.filter(g => g === gemId).length
      if (count < required) return false
    }
    return true
  }, [state.level, state.coins, state.gems])

  const dvCraftItem = useCallback((recipeId: string): boolean => {
    const recipe = dvGetCraftRecipeById(recipeId)
    if (!recipe) return false
    if (!dvCanCraft(recipeId)) return false
    setState(prev => {
      let newGems = [...prev.gems]
      for (const [gemId, required] of Object.entries(recipe.requiredGems)) {
        let removed = 0
        newGems = newGems.filter(g => {
          if (g === gemId && removed < required) {
            removed++
            return false
          }
          return true
        })
      }
      const newEquipment = { ...prev.equipment }
      if (recipe.resultType === 'equipment') {
        newEquipment[recipe.resultId] = Math.max(newEquipment[recipe.resultId] ?? 0, 1)
      }
      return {
        ...prev,
        gems: newGems,
        coins: prev.coins - recipe.requiredCoins,
        equipment: newEquipment,
      }
    })
    dvAddXp(35)
    dvShowNotification(`Crafted ${recipe.name}!`)
    return true
  }, [dvCanCraft, dvAddXp, dvShowNotification])

  const dvGetCraftRecipes = useCallback((): DVCraftRecipe[] => {
    return DV_CRAFT_RECIPES
  }, [])

  const dvGetAvailableCrafts = useCallback((): DVCraftRecipe[] => {
    return DV_CRAFT_RECIPES.filter(r => r.requiredLevel <= state.level)
  }, [state.level])

  // --- ENCHANTMENTS ---
  const dvGetEnchantment = useCallback((enchantmentId: string): DVEnchantment | undefined => {
    return DV_ENCHANTMENTS.find(e => e.id === enchantmentId)
  }, [])

  const dvGetAllEnchantments = useCallback((): DVEnchantment[] => {
    return DV_ENCHANTMENTS
  }, [])

  const dvGetEnchantmentsForElement = useCallback((element: string): DVEnchantment[] => {
    return DV_ENCHANTMENTS.filter(e => e.element === element)
  }, [])

  const dvCanAffordEnchantment = useCallback((): boolean => {
    return state.coins >= DV_ENCHANT_SLOT_COST
  }, [state.coins])

  const dvApplyEnchantment = useCallback((equipmentId: string, enchantmentId: string): boolean => {
    const equipment = dvGetEquipmentById(equipmentId)
    const enchantment = dvGetEnchantmentById(enchantmentId)
    if (!equipment || !enchantment) return false
    if (!state.equipment[equipmentId]) return false
    if (state.coins < DV_ENCHANT_SLOT_COST) {
      dvShowNotification('Not enough coins for enchantment!')
      return false
    }
    setState(prev => ({
      ...prev,
      coins: prev.coins - DV_ENCHANT_SLOT_COST,
    }))
    dvAddXp(25)
    dvShowNotification(`Applied ${enchantment.name} to ${equipment.name}!`)
    return true
  }, [state.coins, state.equipment, dvAddXp, dvShowNotification])

  // --- QUESTS ---
  const dvGenerateDailyQuests = useCallback((): DVQuest[] => {
    return dvGenerateQuests(state.level, DV_QUEST_MAX_ACTIVE)
  }, [state.level])

  const dvGetQuestProgress = useCallback((quest: DVQuest, actionType: string): number => {
    if (quest.type === 'collect' && actionType === 'collect') {
      return state.gems.filter(g => g === quest.target).length
    }
    if (quest.type === 'defend' && actionType === 'defend') {
      return state.totalDefenseWins
    }
    if (quest.type === 'explore' && actionType === 'explore') {
      return state.vaultsCleared.includes(quest.target) ? 1 : 0
    }
    if (quest.type === 'bond' && actionType === 'bond') {
      return state.dragonFeedCount
    }
    if (quest.type === 'upgrade' && actionType === 'upgrade') {
      return state.equipmentUpgradedCount
    }
    return 0
  }, [state.gems, state.totalDefenseWins, state.vaultsCleared, state.dragonFeedCount, state.equipmentUpgradedCount])

  const dvIsQuestComplete = useCallback((quest: DVQuest): boolean => {
    const progress = dvGetQuestProgress(quest, quest.type)
    return progress >= quest.required
  }, [dvGetQuestProgress])

  // --- RARITY & ELEMENT UTILS ---
  const dvGetRarityColor = useCallback((rarity: string): string => {
    return DV_RARITY_COLORS[rarity] ?? '#8b8b8b'
  }, [])

  const dvGetElementColor = useCallback((element: string): string => {
    return DV_DRAGON_COLORS[element] ?? DV_GEM_COLORS[element] ?? '#8b8b8b'
  }, [])

  const dvGetGemInventoryValue = useCallback((): number => {
    return state.gems.reduce((total, gemId) => {
      const gem = dvGetGemById(gemId)
      return total + (gem?.value ?? 0)
    }, 0)
  }, [state.gems])

  const dvGetGemRarityDistribution = useCallback((): Record<string, number> => {
    const dist: Record<string, number> = {}
    for (const rarity of DV_RARITY_ORDER) dist[rarity] = 0
    for (const gemId of state.gems) {
      const gem = dvGetGemById(gemId)
      if (gem) dist[gem.rarity]++
    }
    return dist
  }, [state.gems])

  const dvGetDragonRarityDistribution = useCallback((): Record<string, number> => {
    const dist: Record<string, number> = {}
    for (const rarity of DV_RARITY_ORDER) dist[rarity] = 0
    for (const [dragonId, bond] of Object.entries(state.dragons)) {
      if (bond > 0) {
        const dragon = dvGetDragonById(dragonId)
        if (dragon) dist[dragon.rarity]++
      }
    }
    return dist
  }, [state.dragons])

  // --- EXPORT STATE ---
  const dvExportSave = useCallback((): string => {
    return JSON.stringify(state, null, 2)
  }, [state])

  const dvImportSave = useCallback((jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString) as Partial<DVSavedState>
      if (typeof parsed.level !== 'number' || parsed.level < 1) return false
      const base = dvCreateInitialState()
      const newState = {
        ...base,
        ...parsed,
        settings: { ...base.settings, ...parsed.settings },
      }
      setState(newState)
      dvShowNotification('Save imported successfully!')
      return true
    } catch {
      dvShowNotification('Failed to import save data!')
      return false
    }
  }, [dvShowNotification])

  // --- RETURN ---
  return {
    // State
    initialized,
    level: state.level,
    xp: state.xp,
    coins: state.coins,
    notification,
    recentlyUnlockedAchievements,
    recentlyUnlockedTitle,
    lastCollectedGem,
    lastBondedDragon,
    lastClearedVault,
    lastDefenseResult,
    lastUpgradedEquipment,
    combinedGemResult,

    // Constants
    DV_MAX_LEVEL,
    DV_GEMS,
    DV_DRAGONS,
    DV_VAULTS,
    DV_EQUIPMENT,
    DV_TITLES,
    DV_ACHIEVEMENTS,
    DV_RARITY_ORDER,
    DV_RARITY_COLORS,
    DV_GEM_COLORS,
    DV_DRAGON_COLORS,
    DV_XP_TABLE,
    DV_STORAGE_KEY,
    DV_DRAGON_BOND_MAX,
    DV_MAX_GEMS_INVENTORY,
    DV_EQUIPMENT_MAX_LEVEL,
    DV_MAX_DRAGONS_ACTIVE,
    DV_FORGE_COMBINE_COST,
    DV_DRAGON_ABILITIES,
    DV_CRAFT_RECIPES,
    DV_ENCHANTMENTS,

    // XP & Leveling
    dvAddXp,
    dvGetLevel,
    dvGetXp,
    dvGetXpToNextLevel,
    dvGetXpProgress,

    // Coins
    dvAddCoins,
    dvSpendCoins,
    dvGetCoins,

    // Gems
    dvCollectGem,
    dvSellGem,
    dvSellAllGems,
    dvGetGems,
    dvGetGemCount,
    dvGetGemCountsByElement,
    dvGetUniqueGemCount,
    dvGetTotalGemPower,
    dvCombineGems,
    dvGenerateRandomGem,

    // Dragons
    dvBondDragon,
    dvFeedDragon,
    dvGetDragonBondLevel,
    dvGetBondedDragons,
    dvGetDragonCount,
    dvGetActiveDragons,
    dvGetActiveDragonPower,
    dvGetDragonPower,
    dvGetDragonHealth,
    dvGenerateRandomDragon,

    // Equipment
    dvEquipItem,
    dvUnequipItem,
    dvUpgradeEquipment,
    dvGetEquippedItems,
    dvGetEquipmentLevel,
    dvGetEquipmentPower,
    dvGetTotalDefenseBonus,
    dvGetTotalDragonBonus,
    dvGetUpgradeCostForEquipment,
    dvGenerateRandomEquipment,

    // Vaults
    dvExploreVault,
    dvGetCurrentVault,
    dvGetClearedVaults,
    dvIsVaultCleared,
    dvGetClearedVaultCount,
    dvGetAvailableVaults,

    // Vault Defense
    dvSimulateDefenseWave,

    // Titles
    dvGetTitle,
    dvSetTitle,
    dvGetAvailableTitles,
    dvGetCurrentTitle,
    dvGetTitleBonus,

    // Achievements
    dvCheckAchievements,
    dvGetAchievements,
    dvGetUnlockedAchievements,
    dvGetLockedAchievements,
    dvIsAchievementUnlocked,
    dvGetAchievementCount,
    dvGetAchievementProgress,

    // Daily Login
    dvProcessDailyLogin,
    dvGetLoginStreak,
    dvIsNewDay,

    // Treasure Chests
    dvOpenTreasureChest,
    dvGetTreasureChestsOpened,

    // Spirit Shards
    dvAddSpiritShards,
    dvSpendSpiritShards,
    dvGetSpiritShards,

    // Stats
    dvGetTotalPower,
    dvGetTotalGemsCollected,
    dvGetTotalDragonsBonded,
    dvGetTotalVaultsExplored,
    dvGetTotalDefenseWins,
    dvGetHighestWaveSurvived,
    dvGetPlayTimeMinutes,
    dvGetPlayTimeFormatted,

    // Settings
    dvUpdateSettings,
    dvGetSettings,
    dvSetMusicVolume,
    dvSetSfxVolume,
    dvToggleParticles,
    dvToggleScreenShake,
    dvToggleDamageNumbers,
    dvToggleAutoEquip,
    dvToggleNotifications,

    // Elemental
    dvGetElementalAdvantage,

    // Dragon Abilities
    dvGetDragonAbilities,
    dvGetAbilityDamage,
    dvGetAbilityCooldown,
    dvCanDragonUseAbility,
    dvGetAllAbilities,

    // Crafting
    dvCanCraft,
    dvCraftItem,
    dvGetCraftRecipes,
    dvGetAvailableCrafts,

    // Enchantments
    dvGetEnchantment,
    dvGetAllEnchantments,
    dvGetEnchantmentsForElement,
    dvCanAffordEnchantment,
    dvApplyEnchantment,

    // Quests
    dvGenerateDailyQuests,
    dvGetQuestProgress,
    dvIsQuestComplete,

    // Rarity & Element Utils
    dvGetRarityColor,
    dvGetElementColor,
    dvGetGemInventoryValue,
    dvGetGemRarityDistribution,
    dvGetDragonRarityDistribution,

    // Bulk & Summary
    dvClaimAllRewards,
    dvGetInventorySummary,
    dvGetPowerBreakdown,
    dvGetCompletionPercentage,

    // Save/Load
    dvExportSave,
    dvImportSave,

    // Helpers (exported for reuse)
    dvGetGemById,
    dvGetDragonById,
    dvGetVaultById,
    dvGetEquipmentById,
    dvGetTitleById,
    dvGetGemsByElement,
    dvGetDragonsByElement,
    dvGetEquipmentByType,
    dvFormatNumber,
    dvCalculateLevel,
    dvGetXpForLevel,
    dvGetDefenseEnemyCount,
    dvGetDefenseEnemyPower,
    dvGetVaultExpansionCost,
    dvIsRarityHigherOrEqual,
  }
}
