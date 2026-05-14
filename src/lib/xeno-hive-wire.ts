'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Xeno Hive Wire — Alien Insectoid Colony Management Wire
// All constants use XO_ prefix. All hook functions use xo prefix.
// Acid green / chitin brown / hive purple color theme.
// =============================================================================

// === SECTION 1: TYPE DEFINITIONS ===

export type XoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type XoSpecies =
  | 'drone_soldier'
  | 'swarm_queen'
  | 'chitin_guard'
  | 'venom_sprayer'
  | 'hive_mind'
  | 'carapace_tank'
  | 'spore_reaper'

export type XoChamberId =
  | 'hatchery'
  | 'brood_nest'
  | 'acid_cavern'
  | 'royal_chamber'
  | 'spore_garden'
  | 'chitin_forge'
  | 'hive_nexus'
  | 'void_depths'

export type XoMaterialId =
  | 'resin_drip'
  | 'chitin_shard'
  | 'venom_vial'
  | 'acid_gland'
  | 'royal_jelly'
  | 'spore_sac'
  | 'void_crystal'
  | 'hive_heart'
  | 'mutation_serum'
  | 'queens_essence'
  | 'neural_core'
  | 'abyssal_nectar'

export type XoStructureId =
  | 'resin_wall'
  | 'spore_tower'
  | 'acid_pool'
  | 'chitin_bridge'
  | 'brood_cannon'
  | 'hive_eye'
  | 'royal_throne'
  | 'void_gate'

export type XoAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon'

export type XoEventId =
  | 'infestation_wave'
  | 'meteor_strike'
  | 'parasite_outbreak'
  | 'queen_awakening'
  | 'void_rift'
  | 'mutation_surge'
  | 'tunnel_collapse'
  | 'aphid_bloom'

export interface XoCreatureDef {
  id: string
  name: string
  species: XoSpecies
  rarity: XoRarity
  description: string
  lore: string
  emoji: string
  power: number
  defense: number
  cost: number
  xpReward: number
}

export interface XoChamberDef {
  id: XoChamberId
  name: string
  description: string
  lore: string
  emoji: string
  level: number
  resources: Record<string, number>
  capacity: number
  unlockLevel: number
  ambientColor: string
  dangerLevel: number
}

export interface XoMaterialDef {
  id: XoMaterialId
  name: string
  description: string
  emoji: string
  rarity: XoRarity
  value: number
  gatherTime: number
}

export interface XoStructureDef {
  id: XoStructureId
  name: string
  description: string
  emoji: string
  baseCost: number
  maxLevel: number
  costMultiplier: number
  bonusPerLevel: number
  bonusType: 'defense' | 'production' | 'capacity' | 'power' | 'xp'
}

export interface XoAbilityDef {
  id: string
  name: string
  description: string
  emoji: string
  category: XoAbilityCategory
  cooldown: number
  powerCost: number
  damage: number
  effect: string
  unlockLevel: number
}

export interface XoAchievementDef {
  id: string
  name: string
  icon: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXP: number
  rewardCoins: number
}

export interface XoTitleDef {
  name: string
  levelRequired: number
  icon: string
  description: string
}

export interface XoArtifactDef {
  id: string
  name: string
  description: string
  lore: string
  emoji: string
  rarity: XoRarity
  bonusType: 'power' | 'defense' | 'xp' | 'coins' | 'hatch_speed' | 'swarm_bonus'
  bonusValue: number
  unlockCondition: string
}

export interface XoEventDef {
  id: XoEventId
  name: string
  description: string
  lore: string
  emoji: string
  duration: number
  effect: string
  effectValue: number
  rarity: XoRarity
  rewardXP: number
  rewardCoins: number
}

export interface XoCreatureEntity {
  id: string
  creatureDefId: string
  nickname: string
  level: number
  xp: number
  health: number
  maxHealth: number
  hatchedAt: number
  isMutated: boolean
  chamberId: XoChamberId
}

export interface XoChamberEntity {
  chamberId: XoChamberId
  unlocked: boolean
  creatureCount: number
  level: number
  lastHarvest: number
  totalHarvested: number
}

export interface XoMaterialEntity {
  materialId: XoMaterialId
  amount: number
}

export interface XoStructureEntity {
  structureId: XoStructureId
  level: number
  built: boolean
}

export interface XoAbilityEntity {
  abilityId: string
  unlocked: boolean
  lastUsed: number
}

export interface XoAchievementEntity {
  id: string
  unlocked: boolean
  unlockedAt: number
}

export interface XoArtifactEntity {
  artifactId: string
  activated: boolean
  activatedAt: number
}

export interface XoEventEntity {
  eventId: XoEventId
  active: boolean
  startedAt: number
  expiresAt: number
}

// === RUNTIME STATE INTERFACE ===

export interface XoHiveState {
  xoLevel: number
  xoXp: number
  xoTotalXp: number
  xoCoins: number
  creatures: XoCreatureEntity[]
  chambers: XoChamberEntity[]
  materials: XoMaterialEntity[]
  structures: XoStructureEntity[]
  abilities: XoAbilityEntity[]
  achievements: XoAchievementEntity[]
  artifacts: XoArtifactEntity[]
  activeEvent: XoEventEntity | null
  activeTitle: string
  totalHatched: number
  totalSwarmed: number
  totalEvolved: number
  totalAssimilated: number
  totalInfected: number
  totalFortified: number
  totalMetamorphed: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  totalMaterialsGathered: number
  totalBuilt: number
  streak: number
  bestStreak: number
  dailyClaimed: boolean
  dailyDate: string
  seed: number
  tick: number
}

// === SECTION 2: XO_ CONSTANTS ===

export const XO_SAVE_KEY = 'xeno-hive-save'

export const XO_MAX_LEVEL = 50

export const XO_STARTING_COINS = 100
export const XO_STARTING_XP = 0

export const XO_HATCH_BASE_COST = 25
export const XO_SWARM_BASE_COST = 50
export const XO_EVOLVE_BASE_COST = 200
export const XO_ASSIMILATE_BASE_COST = 150
export const XO_INFECT_BASE_COST = 75
export const XO_FORTIFY_BASE_COST = 120
export const XO_METAMORPH_BASE_COST = 500

export const XO_AUTO_SAVE_INTERVAL = 30_000

export const XO_DAILY_COINS = 50
export const XO_DAILY_XP = 25

export const XO_MAX_CREATURES = 100

export const XO_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= XO_MAX_LEVEL; i++) {
    table.push(Math.floor(90 * i * (1 + i * 0.18)))
  }
  return table
})()

// === SECTION 3: COLOR THEME CONSTANTS ===

export const XO_COLOR_ACID_GREEN = '#39FF14'
export const XO_COLOR_CHITIN_BROWN = '#8B4513'
export const XO_COLOR_HIVE_PURPLE = '#6B21A8'
export const XO_COLOR_ALIEN_BLUE = '#00BFFF'
export const XO_COLOR_VENOM_YELLOW = '#FFD700'
export const XO_COLOR_SLIME_GREEN = '#7CFC00'
export const XO_COLOR_VOID_BLACK = '#0A0A0A'

export const XO_COLOR_DARK_CHITIN = '#5C2D0A'
export const XO_COLOR_PALE_SLIME = '#B8F5A0'
export const XO_COLOR_MUTATION_PINK = '#FF1493'
export const XO_COLOR_EMBER_ORANGE = '#FF6600'
export const XO_COLOR_ROYAL_AMETHYST = '#9966CC'
export const XO_COLOR_VENOM_GLOW = '#ADFF2F'
export const XO_COLOR_ABYSS_TEAL = '#20B2AA'
export const XO_COLOR_HIVE_AMBER = '#FFBF00'

export const XO_RARITY_COLORS: Record<XoRarity, string> = {
  common: '#7CFC00',
  uncommon: '#39FF14',
  rare: '#00BFFF',
  epic: '#6B21A8',
  legendary: '#FFD700',
}

export const XO_RARITY_ICONS: Record<XoRarity, string> = {
  common: '🟢',
  uncommon: '💚',
  rare: '💎',
  epic: '🔱',
  legendary: '👑',
}

export const XO_SPECIES_COLORS: Record<XoSpecies, string> = {
  drone_soldier: '#7CFC00',
  swarm_queen: '#FFD700',
  chitin_guard: '#8B4513',
  venom_sprayer: '#39FF14',
  hive_mind: '#6B21A8',
  carapace_tank: '#5C2D0A',
  spore_reaper: '#FF1493',
}

export const XO_SPECIES_ICONS: Record<XoSpecies, string> = {
  drone_soldier: '🐜',
  swarm_queen: '👑',
  chitin_guard: '🛡️',
  venom_sprayer: '🧪',
  hive_mind: '🧠',
  carapace_tank: '🪲',
  spore_reaper: '☠️',
}

export const XO_SPECIES_LABELS: Record<XoSpecies, string> = {
  drone_soldier: 'Drone Soldier',
  swarm_queen: 'Swarm Queen',
  chitin_guard: 'Chitin Guard',
  venom_sprayer: 'Venom Sprayer',
  hive_mind: 'Hive Mind',
  carapace_tank: 'Carapace Tank',
  spore_reaper: 'Spore Reaper',
}

// === SECTION 4: XO_SPECIES — 7 Species ===

export interface XoSpeciesDef {
  id: XoSpecies
  name: string
  emoji: string
  color: string
  description: string
  passiveAbility: string
  baseStats: { power: number; defense: number }
  favoredChamber: XoChamberId
}

export const XO_SPECIES_DRONE_SOLDIER: XoSpeciesDef = {
  id: 'drone_soldier',
  name: 'Drone Soldier',
  emoji: '🐜',
  color: '#7CFC00',
  description: 'The backbone of the hive army — tireless, expendable, and relentless in vast numbers.',
  passiveAbility: 'Swarm Bond: +2 power for each other Drone Soldier in the same chamber.',
  baseStats: { power: 8, defense: 4 },
  favoredChamber: 'hatchery',
}

export const XO_SPECIES_SWARM_QUEEN: XoSpeciesDef = {
  id: 'swarm_queen',
  name: 'Swarm Queen',
  emoji: '👑',
  color: '#FFD700',
  description: 'A commanding matriarch whose pheromone aura boosts all nearby hive creatures.',
  passiveAbility: 'Royal Decree: +5% XP gain for all creatures in the same chamber.',
  baseStats: { power: 15, defense: 12 },
  favoredChamber: 'royal_chamber',
}

export const XO_SPECIES_CHITIN_GUARD: XoSpeciesDef = {
  id: 'chitin_guard',
  name: 'Chitin Guard',
  emoji: '🛡️',
  color: '#8B4513',
  description: 'Thick-armored defenders with interlocking exoskeletons, forming living walls of chitin.',
  passiveAbility: 'Iron Carapace: Reduces incoming damage to all creatures in the same chamber by 10%.',
  baseStats: { power: 6, defense: 18 },
  favoredChamber: 'chitin_forge',
}

export const XO_SPECIES_VENOM_SPRAYER: XoSpeciesDef = {
  id: 'venom_sprayer',
  name: 'Venom Sprayer',
  emoji: '🧪',
  color: '#39FF14',
  description: 'Acid-spewing insectoids that corrode defenses with lethal chemical streams.',
  passiveAbility: 'Corrosive Mist: Deals 3 bonus damage to enemies every round in combat.',
  baseStats: { power: 14, defense: 6 },
  favoredChamber: 'acid_cavern',
}

export const XO_SPECIES_HIVE_MIND: XoSpeciesDef = {
  id: 'hive_mind',
  name: 'Hive Mind',
  emoji: '🧠',
  color: '#6B21A8',
  description: 'Psychic overlords that network the hive consciousness across vast distances.',
  passiveAbility: 'Neural Link: +3 to all stats for creatures in chambers connected to Hive Nexus.',
  baseStats: { power: 10, defense: 10 },
  favoredChamber: 'hive_nexus',
}

export const XO_SPECIES_CARAPACE_TANK: XoSpeciesDef = {
  id: 'carapace_tank',
  name: 'Carapace Tank',
  emoji: '🪲',
  color: '#5C2D0A',
  description: 'Living siege engines with organic plating thick enough to withstand explosions.',
  passiveAbility: 'Unbreakable: Cannot be killed in a single hit; survives with 1 HP minimum.',
  baseStats: { power: 5, defense: 25 },
  favoredChamber: 'chitin_forge',
}

export const XO_SPECIES_SPORE_REAPER: XoSpeciesDef = {
  id: 'spore_reaper',
  name: 'Spore Reaper',
  emoji: '☠️',
  color: '#FF1493',
  description: 'Harvesters of bio-mass that spread mutagenic spores to terraform environments.',
  passiveAbility: 'Spore Cloud: Has a 15% chance to infect a defeated enemy and add it to the hive.',
  baseStats: { power: 12, defense: 8 },
  favoredChamber: 'spore_garden',
}

export const XO_SPECIES: XoSpeciesDef[] = [
  XO_SPECIES_DRONE_SOLDIER,
  XO_SPECIES_SWARM_QUEEN,
  XO_SPECIES_CHITIN_GUARD,
  XO_SPECIES_VENOM_SPRAYER,
  XO_SPECIES_HIVE_MIND,
  XO_SPECIES_CARAPACE_TANK,
  XO_SPECIES_SPORE_REAPER,
]

// === SECTION 5: XO_CREATURES — 35 Creatures (5 tiers × 7 species) ===

export const XO_CREATURES: XoCreatureDef[] = [
  // === COMMON TIER (7 creatures) ===
  {
    id: 'worker_antling',
    name: 'Worker Antling',
    species: 'drone_soldier',
    rarity: 'common',
    description: 'A tireless juvenile drone that digs tunnels and carries larvae by instinct alone.',
    lore: 'Born in the darkest crevices, worker antlings form the first line of the hive economy.',
    emoji: '🐜',
    power: 8,
    defense: 4,
    cost: 25,
    xpReward: 10,
  },
  {
    id: 'minor_princess',
    name: 'Minor Princess',
    species: 'swarm_queen',
    rarity: 'common',
    description: 'A young queen larva with budding pheromone glands, learning to command the swarm.',
    lore: 'Every great Swarm Queen began as a Minor Princess — fed royal jelly and ambition.',
    emoji: '🐣',
    power: 12,
    defense: 10,
    cost: 40,
    xpReward: 15,
  },
  {
    id: 'chitin_scout',
    name: 'Chitin Scout',
    species: 'chitin_guard',
    rarity: 'common',
    description: 'A lightly armored guard that patrols the hive perimeter with unwavering vigilance.',
    lore: 'The first to see danger, the first to fall — but never the first to flee.',
    emoji: '🪲',
    power: 6,
    defense: 14,
    cost: 30,
    xpReward: 12,
  },
  {
    id: 'drip_sprayer',
    name: 'Drip Sprayer',
    species: 'venom_sprayer',
    rarity: 'common',
    description: 'A small insectoid that secretes mild acid to dissolve organic matter for the hive.',
    lore: 'Its venom is weak alone, but a thousand Drip Sprayers can melt through stone.',
    emoji: '💧',
    power: 10,
    defense: 3,
    cost: 28,
    xpReward: 11,
  },
  {
    id: 'larval_node',
    name: 'Larval Node',
    species: 'hive_mind',
    rarity: 'common',
    description: 'A developing psychic node that faintly hums with nascent hive consciousness.',
    lore: 'The Hive Mind begins not as a brain, but as a whisper shared between larvae.',
    emoji: '🫧',
    power: 7,
    defense: 7,
    cost: 35,
    xpReward: 13,
  },
  {
    id: 'shell_crawler',
    name: 'Shell Crawler',
    species: 'carapace_tank',
    rarity: 'common',
    description: 'A slow-moving beetle with a surprisingly thick carapace for its size.',
    lore: 'Shell Crawlers are nature\'s first draft of an indestructible war machine.',
    emoji: '🪲',
    power: 4,
    defense: 20,
    cost: 32,
    xpReward: 12,
  },
  {
    id: 'spore_spreader',
    name: 'Spore Spreader',
    species: 'spore_reaper',
    rarity: 'common',
    description: 'A fungal insectoid that releases harmless spores to fertilize the spore garden.',
    lore: 'Without the Spore Spreader, the garden dies — and without the garden, the hive starves.',
    emoji: '🍄',
    power: 9,
    defense: 5,
    cost: 27,
    xpReward: 10,
  },

  // === UNCOMMON TIER (7 creatures) ===
  {
    id: 'spear_drone',
    name: 'Spear Drone',
    species: 'drone_soldier',
    rarity: 'uncommon',
    description: 'A battle-hardened drone with sharpened forelimbs capable of piercing armor.',
    lore: 'Where the Worker Antling builds, the Spear Drone conquers.',
    emoji: '🗡️',
    power: 18,
    defense: 10,
    cost: 80,
    xpReward: 30,
  },
  {
    id: 'brood_matriarch',
    name: 'Brood Matriarch',
    species: 'swarm_queen',
    rarity: 'uncommon',
    description: 'A mid-tier queen that commands a brood of 500 and boosts hive productivity.',
    lore: 'The Matriarch\'s pheromones are so potent they can compel other species to serve.',
    emoji: '👸',
    power: 22,
    defense: 18,
    cost: 120,
    xpReward: 40,
  },
  {
    id: 'ridge_shield',
    name: 'Ridge Shield',
    species: 'chitin_guard',
    rarity: 'uncommon',
    description: 'A reinforced guard whose ridged exoskeleton deflects projectile attacks.',
    lore: 'Legend says no Ridge Shield has ever retreated — only advanced or died.',
    emoji: '🛡️',
    power: 12,
    defense: 28,
    cost: 90,
    xpReward: 35,
  },
  {
    id: 'venom_fang',
    name: 'Venom Fang',
    species: 'venom_sprayer',
    rarity: 'uncommon',
    description: 'An evolved sprayer with fangs that inject neurotoxin directly into prey.',
    lore: 'One bite from the Venom Fang paralyzes prey in seconds — the hive calls it "mercy."',
    emoji: '🐍',
    power: 24,
    defense: 8,
    cost: 85,
    xpReward: 32,
  },
  {
    id: 'thought_weaver',
    name: 'Thought Weaver',
    species: 'hive_mind',
    rarity: 'uncommon',
    description: 'A psychic entity that weaves the thoughts of individual creatures into a chorus.',
    lore: 'Through the Thought Weaver, the hive dreams — and those dreams shape reality.',
    emoji: '🔮',
    power: 16,
    defense: 16,
    cost: 100,
    xpReward: 38,
  },
  {
    id: 'iron_beetle',
    name: 'Iron Beetle',
    species: 'carapace_tank',
    rarity: 'uncommon',
    description: 'A massive beetle with mineral-infused carapace that gleams like polished metal.',
    lore: 'The Iron Beetle does not fight — it simply advances and crushes all in its path.',
    emoji: '⚙️',
    power: 10,
    defense: 38,
    cost: 95,
    xpReward: 36,
  },
  {
    id: 'bloom_reaper',
    name: 'Bloom Reaper',
    species: 'spore_reaper',
    rarity: 'uncommon',
    description: 'A deadly spore carrier whose blooming spores can assimilate dead tissue.',
    lore: 'When the Bloom Reaper passes, the dead do not rot — they rise and serve.',
    emoji: '🌸',
    power: 20,
    defense: 12,
    cost: 75,
    xpReward: 28,
  },

  // === RARE TIER (7 creatures) ===
  {
    id: 'executioner_drone',
    name: 'Executioner Drone',
    species: 'drone_soldier',
    rarity: 'rare',
    description: 'An elite assassin drone that strikes from the shadows with molecular-sharp blades.',
    lore: 'The Executioner answers only to the Hive Mind. Its blades have never been seen by the living.',
    emoji: '⚔️',
    power: 35,
    defense: 18,
    cost: 250,
    xpReward: 80,
  },
  {
    id: 'empress_larva',
    name: 'Empress Larva',
    species: 'swarm_queen',
    rarity: 'rare',
    description: 'A royal larva on the verge of metamorphosis into a true Hive Empress.',
    lore: 'To witness an Empress Larva pupate is to witness the birth of a god among insects.',
    emoji: '🫅',
    power: 40,
    defense: 30,
    cost: 350,
    xpReward: 110,
  },
  {
    id: 'fortress_wall',
    name: 'Fortress Wall',
    species: 'chitin_guard',
    rarity: 'rare',
    description: 'A living barricade that can seal tunnel openings with its massive fused body.',
    lore: 'The Fortress Wall does not guard a chamber — it IS the chamber\'s only door.',
    emoji: '🏰',
    power: 20,
    defense: 50,
    cost: 280,
    xpReward: 90,
  },
  {
    id: 'acid_maw',
    name: 'Acid Maw',
    species: 'venom_sprayer',
    rarity: 'rare',
    description: 'A terrifying creature whose entire maw is an acid gland capable of dissolving steel.',
    lore: 'The Acid Maw does not eat its prey — it baptizes them in dissolution.',
    emoji: '👁️',
    power: 42,
    defense: 14,
    cost: 300,
    xpReward: 95,
  },
  {
    id: 'neural_conductor',
    name: 'Neural Conductor',
    species: 'hive_mind',
    rarity: 'rare',
    description: 'A psychic node that can override the nervous systems of lesser organisms.',
    lore: 'The Neural Conductor does not command — it rewires reality at the synaptic level.',
    emoji: '🧬',
    power: 30,
    defense: 28,
    cost: 320,
    xpReward: 100,
  },
  {
    id: 'siege_cocoon',
    name: 'Siege Cocoon',
    species: 'carapace_tank',
    rarity: 'rare',
    description: 'A hibernating tank that awakens in battle with explosive carapace regeneration.',
    lore: 'Sleeping Siege Cocoons have been mistaken for boulders — until the ground trembles.',
    emoji: '🪨',
    power: 18,
    defense: 60,
    cost: 270,
    xpReward: 85,
  },
  {
    id: 'death_bloom',
    name: 'Death Bloom',
    species: 'spore_reaper',
    rarity: 'rare',
    description: 'A magnificent fungal entity whose spores can animate entire ecosystems of dead matter.',
    lore: 'When the Death Bloom opens, the boundary between life and death dissolves like morning mist.',
    emoji: '🥀',
    power: 38,
    defense: 20,
    cost: 260,
    xpReward: 82,
  },

  // === EPIC TIER (7 creatures) ===
  {
    id: 'xeno_marauder',
    name: 'Xeno Marauder',
    species: 'drone_soldier',
    rarity: 'epic',
    description: 'A transdimensional drone that phases between reality and the void to strike unseen.',
    lore: 'The Xeno Marauder exists in two dimensions simultaneously — the one you see, and the one that kills you.',
    emoji: '👤',
    power: 58,
    defense: 30,
    cost: 800,
    xpReward: 200,
  },
  {
    id: 'hive_sovereign',
    name: 'Hive Sovereign',
    species: 'swarm_queen',
    rarity: 'epic',
    description: 'A queen of legendary power whose telepathic reach spans entire underground networks.',
    lore: 'The Sovereign does not speak — reality reshapes itself in obedience before she even thinks.',
    emoji: '👑',
    power: 65,
    defense: 50,
    cost: 1000,
    xpReward: 250,
  },
  {
    id: 'chitin_colossus',
    name: 'Chitin Colossus',
    species: 'chitin_guard',
    rarity: 'epic',
    description: 'A towering wall of fused chitin so dense it generates its own gravitational field.',
    lore: 'To breach the Chitin Colossus is to break the laws of physics — many have tried, none have lived.',
    emoji: '🗿',
    power: 35,
    defense: 85,
    cost: 850,
    xpReward: 220,
  },
  {
    id: 'venom_archon',
    name: 'Venom Archon',
    species: 'venom_sprayer',
    rarity: 'epic',
    description: 'An ancient sprayer whose venom has evolved sentience and attacks on its own volition.',
    lore: 'The Venom Archon\'s acid is alive. It thinks. It chooses. It is hungry.',
    emoji: '☠️',
    power: 70,
    defense: 22,
    cost: 900,
    xpReward: 230,
  },
  {
    id: 'overmind_nexus',
    name: 'Overmind Nexus',
    species: 'hive_mind',
    rarity: 'epic',
    description: 'A psychic hub that links every hive creature into a singular, unstoppable consciousness.',
    lore: 'The Overmind Nexus is the reason the hive has no fear — fear requires individuality.',
    emoji: '🌌',
    power: 50,
    defense: 45,
    cost: 950,
    xpReward: 240,
  },
  {
    id: 'abyssal_juggernaut',
    name: 'Abyssal Juggernaut',
    species: 'carapace_tank',
    rarity: 'epic',
    description: 'A subterranean leviathan whose carapace has been pressure-forged in the planet\'s core.',
    lore: 'The Abyssal Juggernaut crawled up from the mantle. Nothing above can stop what rose from below.',
    emoji: '🌋',
    power: 30,
    defense: 100,
    cost: 880,
    xpReward: 225,
  },
  {
    id: 'spore_abomination',
    name: 'Spore Abomination',
    species: 'spore_reaper',
    rarity: 'epic',
    description: 'A horrifying fusion of fungal matter and void energy that rewrites biology itself.',
    lore: 'The Spore Abomination is not a creature — it is an extinction event with legs.',
    emoji: '👁️‍🗨️',
    power: 62,
    defense: 35,
    cost: 820,
    xpReward: 210,
  },

  // === LEGENDARY TIER (7 creatures) ===
  {
    id: 'void_reaper_drone',
    name: 'Void Reaper Drone',
    species: 'drone_soldier',
    rarity: 'legendary',
    description: 'The ultimate drone — forged in the void between dimensions, it exists beyond death.',
    lore: 'When a Void Reaper falls, it rises again — not resurrected, but as if death simply forgot it existed.',
    emoji: '💀',
    power: 100,
    defense: 50,
    cost: 3000,
    xpReward: 600,
  },
  {
    id: 'eternal_hive_queen',
    name: 'Eternal Hive Queen',
    species: 'swarm_queen',
    rarity: 'legendary',
    description: 'The immortal matriarch from which all hive species descended — a living god of the deep.',
    lore: 'Before the earth cooled, before the first cell divided, the Eternal Queen already dreamed of her children.',
    emoji: '👸',
    power: 110,
    defense: 85,
    cost: 4000,
    xpReward: 800,
  },
  {
    id: 'adamantine_bastion',
    name: 'Adamantine Bastion',
    species: 'chitin_guard',
    rarity: 'legendary',
    description: 'An unkillable fortress of living chitin that has never taken damage in recorded history.',
    lore: 'Weapons break against the Adamantine Bastion. Armies shatter. The Bastion does not notice.',
    emoji: '🏰',
    power: 60,
    defense: 150,
    cost: 3500,
    xpReward: 700,
  },
  {
    id: 'primordial_venom_lord',
    name: 'Primordial Venom Lord',
    species: 'venom_sprayer',
    rarity: 'legendary',
    description: 'The first Venom Sprayer, whose ancient venom can dissolve concepts as well as matter.',
    lore: 'The Primordial Venom Lord\'s acid once dissolved an idea. The concept of "surrender" no longer exists in the hive.',
    emoji: '🐉',
    power: 130,
    defense: 40,
    cost: 3800,
    xpReward: 750,
  },
  {
    id: 'omniscient_core',
    name: 'Omniscient Core',
    species: 'hive_mind',
    rarity: 'legendary',
    description: 'The central consciousness of the hive — a psychic entity older than the planet itself.',
    lore: 'The Omniscient Core does not perceive reality — it authors it. Every creature is a sentence it writes.',
    emoji: '🌌',
    power: 90,
    defense: 90,
    cost: 4500,
    xpReward: 900,
  },
  {
    id: 'world_carapace',
    name: 'World Carapace',
    species: 'carapace_tank',
    rarity: 'legendary',
    description: 'A creature so vast its shell forms the ceiling of the deepest hive chamber — the world above walks on its back.',
    lore: 'When the World Carapace moves, continents shift. It does not move often — it has nowhere to go.',
    emoji: '🌍',
    power: 50,
    defense: 200,
    cost: 4200,
    xpReward: 850,
  },
  {
    id: 'apex_spore_entity',
    name: 'Apex Spore Entity',
    species: 'spore_reaper',
    rarity: 'legendary',
    description: 'The final evolution of the spore line — a sentient ecosystem that exists in all places simultaneously.',
    lore: 'The Apex Spore Entity is already inside you. It was inside you before you were born. It is patient.',
    emoji: '🌀',
    power: 120,
    defense: 70,
    cost: 3600,
    xpReward: 780,
  },
]

// === SECTION 6: XO_CHAMBERS — 8 Hive Chambers ===

export const XO_CHAMBER_HATCHERY: XoChamberDef = {
  id: 'hatchery',
  name: 'Hatchery',
  description: 'The primary breeding chamber where new creatures are born from nutrient-rich cocoons.',
  lore: 'Every hive begins here — in the warmth of the Hatchery, where life pulses with acidic purpose.',
  emoji: '🥚',
  level: 1,
  resources: { resin_drip: 5, royal_jelly: 2 },
  capacity: 15,
  unlockLevel: 1,
  ambientColor: '#7CFC00',
  dangerLevel: 1,
}

export const XO_CHAMBER_BROOD_NEST: XoChamberDef = {
  id: 'brood_nest',
  name: 'Brood Nest',
  description: 'A warm, humid chamber dedicated to nurturing larvae and accelerating growth cycles.',
  lore: 'The Brood Nest hums with a frequency that accelerates cellular division — growth is not optional here.',
  emoji: '🏠',
  level: 1,
  resources: { royal_jelly: 3, resin_drip: 3 },
  capacity: 12,
  unlockLevel: 1,
  ambientColor: '#FFBF00',
  dangerLevel: 2,
}

export const XO_CHAMBER_ACID_CAVERN: XoChamberDef = {
  id: 'acid_cavern',
  name: 'Acid Cavern',
  description: 'A treacherous cavern filled with corrosive pools that Venom Sprayers call home.',
  lore: 'Only the acid-resistant thrive here. The walls themselves are alive, digesting anything that touches them.',
  emoji: '🧪',
  level: 2,
  resources: { venom_vial: 4, acid_gland: 3 },
  capacity: 10,
  unlockLevel: 5,
  ambientColor: '#39FF14',
  dangerLevel: 5,
}

export const XO_CHAMBER_ROYAL_CHAMBER: XoChamberDef = {
  id: 'royal_chamber',
  name: 'Royal Chamber',
  description: 'The sacred throne room of the Swarm Queens, radiating pheromonal authority.',
  lore: 'To enter the Royal Chamber uninvited is to invite the fury of ten thousand queens.',
  emoji: '👑',
  level: 3,
  resources: { queens_essence: 5, royal_jelly: 5 },
  capacity: 8,
  unlockLevel: 10,
  ambientColor: '#FFD700',
  dangerLevel: 4,
}

export const XO_CHAMBER_SPORE_GARDEN: XoChamberDef = {
  id: 'spore_garden',
  name: 'Spore Garden',
  description: 'An underground bioluminescent garden where Spore Reapers cultivate mutagenic fungi.',
  lore: 'The Spore Garden is beautiful in the way that a predator\'s lure is beautiful —致命的优雅。',
  emoji: '🍄',
  level: 2,
  resources: { spore_sac: 4, mutation_serum: 2 },
  capacity: 12,
  unlockLevel: 8,
  ambientColor: '#FF1493',
  dangerLevel: 3,
}

export const XO_CHAMBER_CHITIN_FORGE: XoChamberDef = {
  id: 'chitin_forge',
  name: 'Chitin Forge',
  description: 'A superheated chamber where Chitin Guards temper their exoskeletons in magma veins.',
  lore: 'The Chitin Forge burns at temperatures that would vaporize steel — but chitin only grows stronger.',
  emoji: '🔥',
  level: 3,
  resources: { chitin_shard: 5, resin_drip: 4 },
  capacity: 10,
  unlockLevel: 12,
  ambientColor: '#FF6600',
  dangerLevel: 6,
}

export const XO_CHAMBER_HIVE_NEXUS: XoChamberDef = {
  id: 'hive_nexus',
  name: 'Hive Nexus',
  description: 'The psychic core of the colony where Hive Minds commune with the collective consciousness.',
  lore: 'In the Hive Nexus, thought becomes action, and the boundary between "one" and "all" dissolves entirely.',
  emoji: '🧠',
  level: 4,
  resources: { neural_core: 5, queens_essence: 3 },
  capacity: 6,
  unlockLevel: 20,
  ambientColor: '#6B21A8',
  dangerLevel: 7,
}

export const XO_CHAMBER_VOID_DEPTHS: XoChamberDef = {
  id: 'void_depths',
  name: 'Void Depths',
  description: 'The deepest, most dangerous chamber — a rift into the void where legendary entities dwell.',
  lore: 'The Void Depths whisper promises of infinite power to those brave enough — or foolish enough — to listen.',
  emoji: '🕳️',
  level: 5,
  resources: { void_crystal: 6, abyssal_nectar: 4 },
  capacity: 5,
  unlockLevel: 30,
  ambientColor: '#0A0A0A',
  dangerLevel: 10,
}

export const XO_CHAMBERS: XoChamberDef[] = [
  XO_CHAMBER_HATCHERY,
  XO_CHAMBER_BROOD_NEST,
  XO_CHAMBER_ACID_CAVERN,
  XO_CHAMBER_ROYAL_CHAMBER,
  XO_CHAMBER_SPORE_GARDEN,
  XO_CHAMBER_CHITIN_FORGE,
  XO_CHAMBER_HIVE_NEXUS,
  XO_CHAMBER_VOID_DEPTHS,
]

// === SECTION 7: XO_MATERIALS — 12 Materials ===

export const XO_MATERIAL_RESIN_DRIP: XoMaterialDef = {
  id: 'resin_drip',
  name: 'Resin Drip',
  description: 'Sticky bio-resin secreted by worker drones, essential for building and sealing.',
  emoji: '🍯',
  rarity: 'common',
  value: 5,
  gatherTime: 2000,
}

export const XO_MATERIAL_CHITIN_SHARD: XoMaterialDef = {
  id: 'chitin_shard',
  name: 'Chitin Shard',
  description: 'A fragment of hardened exoskeleton, useful for crafting armor and weapons.',
  emoji: '💎',
  rarity: 'common',
  value: 6,
  gatherTime: 2500,
}

export const XO_MATERIAL_VENOM_VIAL: XoMaterialDef = {
  id: 'venom_vial',
  name: 'Venom Vial',
  description: 'A small phial of collected insectoid venom, potent in alchemy and combat.',
  emoji: '🧪',
  rarity: 'common',
  value: 7,
  gatherTime: 3000,
}

export const XO_MATERIAL_ACID_GLAND: XoMaterialDef = {
  id: 'acid_gland',
  name: 'Acid Gland',
  description: 'An organic gland that produces concentrated acid for engineering applications.',
  emoji: '⚗️',
  rarity: 'uncommon',
  value: 15,
  gatherTime: 5000,
}

export const XO_MATERIAL_ROYAL_JELLY: XoMaterialDef = {
  id: 'royal_jelly',
  name: 'Royal Jelly',
  description: 'A nutrient-dense secretion fed to queens and larvae to accelerate evolution.',
  emoji: '👑',
  rarity: 'uncommon',
  value: 18,
  gatherTime: 6000,
}

export const XO_MATERIAL_SPORE_SAC: XoMaterialDef = {
  id: 'spore_sac',
  name: 'Spore Sac',
  description: 'A membrane sac containing viable mutagenic spores for terraforming.',
  emoji: '🍄',
  rarity: 'uncommon',
  value: 16,
  gatherTime: 5500,
}

export const XO_MATERIAL_VOID_CRYSTAL: XoMaterialDef = {
  id: 'void_crystal',
  name: 'Void Crystal',
  description: 'A crystallized fragment of interdimensional void energy, pulsing with dark power.',
  emoji: '🔮',
  rarity: 'rare',
  value: 40,
  gatherTime: 10000,
}

export const XO_MATERIAL_HIVE_HEART: XoMaterialDef = {
  id: 'hive_heart',
  name: 'Hive Heart',
  description: 'The crystallized core of a deceased queen, radiating residual psychic energy.',
  emoji: '💜',
  rarity: 'rare',
  value: 45,
  gatherTime: 12000,
}

export const XO_MATERIAL_MUTATION_SERUM: XoMaterialDef = {
  id: 'mutation_serum',
  name: 'Mutation Serum',
  description: 'A volatile liquid extracted from Spore Reapers that can trigger rapid evolution.',
  emoji: '🧬',
  rarity: 'epic',
  value: 100,
  gatherTime: 20000,
}

export const XO_MATERIAL_QUEENS_ESSENCE: XoMaterialDef = {
  id: 'queens_essence',
  name: 'Queen\'s Essence',
  description: 'The distilled pheromonal essence of a Swarm Queen, granting authority over lesser creatures.',
  emoji: '✨',
  rarity: 'epic',
  value: 110,
  gatherTime: 22000,
}

export const XO_MATERIAL_NEURAL_CORE: XoMaterialDef = {
  id: 'neural_core',
  name: 'Neural Core',
  description: 'The brain-like processing center of a Hive Mind, humming with psychic potential.',
  emoji: '🧠',
  rarity: 'legendary',
  value: 250,
  gatherTime: 40000,
}

export const XO_MATERIAL_ABYSSAL_NECTAR: XoMaterialDef = {
  id: 'abyssal_nectar',
  name: 'Abyssal Nectar',
  description: 'A luminescent substance from the void depths that grants near-immortality to those who consume it.',
  emoji: '🌌',
  rarity: 'legendary',
  value: 300,
  gatherTime: 50000,
}

export const XO_MATERIALS: XoMaterialDef[] = [
  XO_MATERIAL_RESIN_DRIP,
  XO_MATERIAL_CHITIN_SHARD,
  XO_MATERIAL_VENOM_VIAL,
  XO_MATERIAL_ACID_GLAND,
  XO_MATERIAL_ROYAL_JELLY,
  XO_MATERIAL_SPORE_SAC,
  XO_MATERIAL_VOID_CRYSTAL,
  XO_MATERIAL_HIVE_HEART,
  XO_MATERIAL_MUTATION_SERUM,
  XO_MATERIAL_QUEENS_ESSENCE,
  XO_MATERIAL_NEURAL_CORE,
  XO_MATERIAL_ABYSSAL_NECTAR,
]

// === SECTION 8: XO_STRUCTURES — 8 Structures (upgradable to level 10) ===

export const XO_STRUCTURE_RESIN_WALL: XoStructureDef = {
  id: 'resin_wall',
  name: 'Resin Wall',
  description: 'A bio-organic barrier that protects hive chambers from intruders and cave-ins.',
  emoji: '🧱',
  baseCost: 50,
  maxLevel: 10,
  costMultiplier: 1.6,
  bonusPerLevel: 5,
  bonusType: 'defense',
}

export const XO_STRUCTURE_SPORE_TOWER: XoStructureDef = {
  id: 'spore_tower',
  name: 'Spore Tower',
  description: 'A towering fungal structure that disperses beneficial spores, boosting creature growth.',
  emoji: '🗼',
  baseCost: 75,
  maxLevel: 10,
  costMultiplier: 1.5,
  bonusPerLevel: 8,
  bonusType: 'xp',
}

export const XO_STRUCTURE_ACID_POOL: XoStructureDef = {
  id: 'acid_pool',
  name: 'Acid Pool',
  description: 'A corrosive reservoir used for material processing and passive resource generation.',
  emoji: '🏊',
  baseCost: 60,
  maxLevel: 10,
  costMultiplier: 1.7,
  bonusPerLevel: 3,
  bonusType: 'production',
}

export const XO_STRUCTURE_CHITIN_BRIDGE: XoStructureDef = {
  id: 'chitin_bridge',
  name: 'Chitin Bridge',
  description: 'Connects isolated chambers, increasing the maximum creature capacity of the hive.',
  emoji: '🌉',
  baseCost: 100,
  maxLevel: 10,
  costMultiplier: 1.8,
  bonusPerLevel: 2,
  bonusType: 'capacity',
}

export const XO_STRUCTURE_BROOD_CANNON: XoStructureDef = {
  id: 'brood_cannon',
  name: 'Brood Cannon',
  description: 'A biological siege weapon that launches acid-soaked projectiles at invaders.',
  emoji: '💣',
  baseCost: 150,
  maxLevel: 10,
  costMultiplier: 1.6,
  bonusPerLevel: 7,
  bonusType: 'power',
}

export const XO_STRUCTURE_HIVE_EYE: XoStructureDef = {
  id: 'hive_eye',
  name: 'Hive Eye',
  description: 'A sensory organ array that provides early warning and boosts XP from all activities.',
  emoji: '👁️',
  baseCost: 120,
  maxLevel: 10,
  costMultiplier: 1.5,
  bonusPerLevel: 5,
  bonusType: 'xp',
}

export const XO_STRUCTURE_ROYAL_THRONE: XoStructureDef = {
  id: 'royal_throne',
  name: 'Royal Throne',
  description: 'An ornate seat of power that amplifies the Swarm Queen\'s authority across the hive.',
  emoji: '🪑',
  baseCost: 200,
  maxLevel: 10,
  costMultiplier: 2.0,
  bonusPerLevel: 10,
  bonusType: 'power',
}

export const XO_STRUCTURE_VOID_GATE: XoStructureDef = {
  id: 'void_gate',
  name: 'Void Gate',
  description: 'A rift in spacetime that draws power from the void, granting immense bonuses to all hive stats.',
  emoji: '🌀',
  baseCost: 500,
  maxLevel: 10,
  costMultiplier: 2.2,
  bonusPerLevel: 12,
  bonusType: 'defense',
}

export const XO_STRUCTURES: XoStructureDef[] = [
  XO_STRUCTURE_RESIN_WALL,
  XO_STRUCTURE_SPORE_TOWER,
  XO_STRUCTURE_ACID_POOL,
  XO_STRUCTURE_CHITIN_BRIDGE,
  XO_STRUCTURE_BROOD_CANNON,
  XO_STRUCTURE_HIVE_EYE,
  XO_STRUCTURE_ROYAL_THRONE,
  XO_STRUCTURE_VOID_GATE,
]

// === SECTION 9: XO_ABILITIES — 8 Abilities (2 per category) ===

export const XO_ABILITY_ACID_BURST: XoAbilityDef = {
  id: 'acid_burst',
  name: 'Acid Burst',
  description: 'Unleash a devastating spray of concentrated acid that damages all enemies in a chamber.',
  emoji: '💥',
  category: 'offensive',
  cooldown: 3,
  powerCost: 20,
  damage: 35,
  effect: 'Deals AoE acid damage equal to 35 + (hive level × 2) to all enemies.',
  unlockLevel: 1,
}

export const XO_ABILITY_VENOM_STRIKE: XoAbilityDef = {
  id: 'venom_strike',
  name: 'Venom Strike',
  description: 'A precision neurotoxin injection that targets the weakest enemy for massive damage.',
  emoji: '🐍',
  category: 'offensive',
  cooldown: 4,
  powerCost: 30,
  damage: 60,
  effect: 'Deals single-target damage equal to 60 + (highest creature power × 1.5).',
  unlockLevel: 8,
}

export const XO_ABILITY_CHITIN_BARRIER: XoAbilityDef = {
  id: 'chitin_barrier',
  name: 'Chitin Barrier',
  description: 'Summon an emergency wall of hardened chitin that absorbs incoming damage for the hive.',
  emoji: '🛡️',
  category: 'defensive',
  cooldown: 5,
  powerCost: 25,
  damage: 0,
  effect: 'Grants a shield absorbing 50 + (total defense × 0.3) damage for 3 turns.',
  unlockLevel: 3,
}

export const XO_ABILITY_REPAIR_SWARM: XoAbilityDef = {
  id: 'repair_swarm',
  name: 'Repair Swarm',
  description: 'Deploy a swarm of nanite-like insects that rapidly heal all damaged creatures.',
  emoji: '🩹',
  category: 'defensive',
  cooldown: 6,
  powerCost: 35,
  damage: 0,
  effect: 'Heals all creatures for 20 + (hive level × 1.5) HP.',
  unlockLevel: 12,
}

export const XO_ABILITY_HIVE_SCAN: XoAbilityDef = {
  id: 'hive_scan',
  name: 'Hive Scan',
  description: 'Extend the hive consciousness to reveal hidden resources and enemy weaknesses.',
  emoji: '🔍',
  category: 'utility',
  cooldown: 2,
  powerCost: 10,
  damage: 0,
  effect: 'Reveals hidden material deposits and doubles material gathering for 2 turns.',
  unlockLevel: 5,
}

export const XO_ABILITY_PHEROMONE_BOOST: XoAbilityDef = {
  id: 'pheromone_boost',
  name: 'Pheromone Boost',
  description: 'Release an empowering pheromone cloud that temporarily enhances all creature stats.',
  emoji: '🌸',
  category: 'utility',
  cooldown: 4,
  powerCost: 20,
  damage: 0,
  effect: 'Boosts all creature power and defense by 15% for 3 turns.',
  unlockLevel: 15,
}

export const XO_ABILITY_RAPID_HATCH: XoAbilityDef = {
  id: 'rapid_hatch',
  name: 'Rapid Hatch',
  description: 'Force-mature a clutch of eggs, instantly hatching multiple creatures at once.',
  emoji: '🥚',
  category: 'summon',
  cooldown: 5,
  powerCost: 40,
  damage: 0,
  effect: 'Instantly hatches 1–3 random common creatures based on hive level.',
  unlockLevel: 7,
}

export const XO_ABILITY_VOID_SUMMON: XoAbilityDef = {
  id: 'void_summon',
  name: 'Void Summon',
  description: 'Tear open a rift to the void and pull forth a powerful creature from beyond reality.',
  emoji: '🌀',
  category: 'summon',
  cooldown: 8,
  powerCost: 80,
  damage: 0,
  effect: 'Summons a random rare or epic creature with boosted stats.',
  unlockLevel: 25,
}

export const XO_ABILITIES: XoAbilityDef[] = [
  XO_ABILITY_ACID_BURST,
  XO_ABILITY_VENOM_STRIKE,
  XO_ABILITY_CHITIN_BARRIER,
  XO_ABILITY_REPAIR_SWARM,
  XO_ABILITY_HIVE_SCAN,
  XO_ABILITY_PHEROMONE_BOOST,
  XO_ABILITY_RAPID_HATCH,
  XO_ABILITY_VOID_SUMMON,
]

// === SECTION 10: XO_ACHIEVEMENTS — 10 Achievements ===

export const XO_ACHIEVEMENTS: XoAchievementDef[] = [
  {
    id: 'xo_ach_first_hatch',
    name: 'First Emergence',
    icon: '🥚',
    description: 'Hatch your very first creature from the Hatchery.',
    conditionKey: 'totalHatched',
    targetValue: 1,
    rewardXP: 25,
    rewardCoins: 30,
  },
  {
    id: 'xo_ach_hatch_25',
    name: 'Brood Master',
    icon: '👶',
    description: 'Hatch a total of 25 creatures across all chambers.',
    conditionKey: 'totalHatched',
    targetValue: 25,
    rewardXP: 200,
    rewardCoins: 200,
  },
  {
    id: 'xo_ach_swarm_50',
    name: 'Endless Swarm',
    icon: '🐜',
    description: 'Send creatures to swarm a total of 50 times.',
    conditionKey: 'totalSwarmed',
    targetValue: 50,
    rewardXP: 300,
    rewardCoins: 300,
  },
  {
    id: 'xo_ach_evolve_10',
    name: 'Metamorphosis',
    icon: '🦋',
    description: 'Evolve 10 creatures to their next form.',
    conditionKey: 'totalEvolved',
    targetValue: 10,
    rewardXP: 400,
    rewardCoins: 350,
  },
  {
    id: 'xo_ach_assimilate_5',
    name: 'Hive Expansion',
    icon: '🧬',
    description: 'Assimilate 5 enemy creatures into the hive.',
    conditionKey: 'totalAssimilated',
    targetValue: 5,
    rewardXP: 250,
    rewardCoins: 250,
  },
  {
    id: 'xo_ach_all_chambers',
    name: 'Full Colony',
    icon: '🏛️',
    description: 'Unlock all 8 hive chambers.',
    conditionKey: 'chambersUnlocked',
    targetValue: 8,
    rewardXP: 600,
    rewardCoins: 600,
  },
  {
    id: 'xo_ach_build_5',
    name: 'Master Architect',
    icon: '🏗️',
    description: 'Build or upgrade structures a total of 5 times.',
    conditionKey: 'totalBuilt',
    targetValue: 5,
    rewardXP: 150,
    rewardCoins: 150,
  },
  {
    id: 'xo_ach_level_25',
    name: 'Hive Overlord',
    icon: '👑',
    description: 'Reach hive level 25.',
    conditionKey: 'xoLevel',
    targetValue: 25,
    rewardXP: 1500,
    rewardCoins: 1500,
  },
  {
    id: 'xo_ach_streak_7',
    name: 'Devoted Overmind',
    icon: '📅',
    description: 'Maintain a 7-day daily claim streak.',
    conditionKey: 'bestStreak',
    targetValue: 7,
    rewardXP: 300,
    rewardCoins: 300,
  },
  {
    id: 'xo_ach_legendary',
    name: 'Mythic Presence',
    icon: '🏆',
    description: 'Hatch a legendary-tier creature.',
    conditionKey: 'legendaryHatched',
    targetValue: 1,
    rewardXP: 2000,
    rewardCoins: 2000,
  },
]

// === SECTION 11: XO_TITLES — 8 Titles ===

export const XO_TITLES: XoTitleDef[] = [
  {
    name: 'Larva Tender',
    levelRequired: 1,
    icon: '🥚',
    description: 'A newly initiated caretaker of the hive, learning the ways of the colony.',
  },
  {
    name: 'Brood Keeper',
    levelRequired: 5,
    icon: '🐛',
    description: 'A trusted keeper who tends to the growing brood with steady hands.',
  },
  {
    name: 'Chitin Forgemaster',
    levelRequired: 12,
    icon: '⚒️',
    description: 'Master of the Chitin Forge, shaping organic armor for the hive army.',
  },
  {
    name: 'Venom Alchemist',
    levelRequired: 18,
    icon: '🧪',
    description: 'A skilled chemist of the hive, brewing acids and toxins of devastating potency.',
  },
  {
    name: 'Spore Cultivator',
    levelRequired: 25,
    icon: '🍄',
    description: 'Tender of the Spore Garden, nurturing mutagenic fungi that reshape biology.',
  },
  {
    name: 'Hive Commander',
    levelRequired: 33,
    icon: '⚔️',
    description: 'A battlefield tactician who directs the swarm with psychic precision.',
  },
  {
    name: 'Neural Archon',
    levelRequired: 42,
    icon: '🧠',
    description: 'A psychic sovereign whose consciousness spans the entire hive network.',
  },
  {
    name: 'Void Emperor',
    levelRequired: 50,
    icon: '🌌',
    description: 'The supreme ruler of the Xeno Hive, a being of limitless psychic and physical power.',
  },
]

// === SECTION 12: XO_ARTIFACTS — 6 Artifacts ===

export const XO_ARTIFACTS: XoArtifactDef[] = [
  {
    id: 'xo_art_heart_of_the_queen',
    name: 'Heart of the Queen',
    description: 'A crystallized queen heart that beats with psychic energy, boosting hive power.',
    lore: 'The Heart of the Queen still pulses. Some say it remembers being alive.',
    emoji: '💜',
    rarity: 'rare',
    bonusType: 'power',
    bonusValue: 15,
    unlockCondition: 'Assimilate 3 Swarm Queen creatures.',
  },
  {
    id: 'xo_art_void_shard',
    name: 'Void Shard',
    description: 'A fragment of pure void energy that renders creatures partially immune to damage.',
    lore: 'The Void Shard whispers from between dimensions — it promises protection at a price.',
    emoji: '🔮',
    rarity: 'epic',
    bonusType: 'defense',
    bonusValue: 25,
    unlockCondition: 'Reach the Void Depths chamber.',
  },
  {
    id: 'xo_art_primordial_slime',
    name: 'Primordial Slime',
    description: 'Prehistoric bio-matter that accelerates all hive evolution processes.',
    lore: 'This slime predates the dinosaurs. It predates the earth. It may predate time itself.',
    emoji: '🟢',
    rarity: 'epic',
    bonusType: 'xp',
    bonusValue: 20,
    unlockCondition: 'Evolve 10 creatures.',
  },
  {
    id: 'xo_art_hive_crown',
    name: 'Hive Crown',
    description: 'The legendary diadem of the first Hive Mind, granting dominion over all creatures.',
    lore: 'Whoever wears the Hive Crown becomes the Hive. There is no difference.',
    emoji: '👑',
    rarity: 'legendary',
    bonusType: 'coins',
    bonusValue: 50,
    unlockCondition: 'Reach hive level 40.',
  },
  {
    id: 'xo_art_abyssal_egg',
    name: 'Abyssal Egg',
    description: 'An egg from the void that dramatically increases hatch speed and creature quality.',
    lore: 'The Abyssal Egg has been incubating for millennia. When it hatches, reality will notice.',
    emoji: '🥚',
    rarity: 'legendary',
    bonusType: 'hatch_speed',
    bonusValue: 30,
    unlockCondition: 'Hatch 50 creatures.',
  },
  {
    id: 'xo_art_neural_bloom',
    name: 'Neural Bloom',
    description: 'A psychic flower that strengthens swarm coordination and attack bonuses.',
    lore: 'The Neural Bloom grows only in the thoughts of the Hive Mind — a flower of pure consciousness.',
    emoji: '🌸',
    rarity: 'rare',
    bonusType: 'swarm_bonus',
    bonusValue: 20,
    unlockCondition: 'Swarm 25 times.',
  },
]

// === SECTION 13: XO_EVENTS — 8 Events ===

export const XO_EVENTS: XoEventDef[] = [
  {
    id: 'infestation_wave',
    name: 'Infestation Wave',
    description: 'A massive wave of feral insectoids floods the tunnels — defend or be overrun!',
    lore: 'They come from the deep places, numberless and hungry. The hive must stand firm.',
    emoji: '🐜',
    duration: 120_000,
    effect: 'double_xp',
    effectValue: 2,
    rarity: 'common',
    rewardXP: 100,
    rewardCoins: 100,
  },
  {
    id: 'meteor_strike',
    name: 'Meteor Strike',
    description: 'A meteor impacts near the surface, revealing rare minerals and awakening dormant creatures.',
    lore: 'From the sky comes fire and treasure — the hive feeds on both.',
    emoji: '☄️',
    duration: 90_000,
    effect: 'material_bonus',
    effectValue: 3,
    rarity: 'uncommon',
    rewardXP: 150,
    rewardCoins: 150,
  },
  {
    id: 'parasite_outbreak',
    name: 'Parasite Outbreak',
    description: 'A swarm of brain-parasites infiltrates the hive — creatures lose power temporarily.',
    lore: 'The parasites whisper false commands. Only the strongest minds resist.',
    emoji: '🦠',
    duration: 60_000,
    effect: 'power_reduction',
    effectValue: 0.7,
    rarity: 'common',
    rewardXP: 75,
    rewardCoins: 50,
  },
  {
    id: 'queen_awakening',
    name: 'Queen Awakening',
    description: 'A dormant queen rises from her cocoon, granting massive bonuses to all Swarm Queens.',
    lore: 'The ancient queen stirs. Her first thought is of her children. Her second is of conquest.',
    emoji: '👸',
    duration: 150_000,
    effect: 'swarm_queen_boost',
    effectValue: 2.5,
    rarity: 'epic',
    rewardXP: 300,
    rewardCoins: 300,
  },
  {
    id: 'void_rift',
    name: 'Void Rift',
    description: 'A rift to the void opens in the Hive Nexus, granting access to legendary materials.',
    lore: 'The void is not empty — it is full of everything that was, is, and could be.',
    emoji: '🌀',
    duration: 180_000,
    effect: 'void_material_access',
    effectValue: 5,
    rarity: 'legendary',
    rewardXP: 500,
    rewardCoins: 500,
  },
  {
    id: 'mutation_surge',
    name: 'Mutation Surge',
    description: 'Spore Reapers go into overdrive, causing rapid mutations that boost creature stats.',
    lore: 'The mutations are beautiful and terrible. Some creatures become gods. Others become art.',
    emoji: '🧬',
    duration: 100_000,
    effect: 'mutation_boost',
    effectValue: 1.8,
    rarity: 'rare',
    rewardXP: 200,
    rewardCoins: 200,
  },
  {
    id: 'tunnel_collapse',
    name: 'Tunnel Collapse',
    description: 'A section of the hive caves in, blocking resource production until cleared.',
    lore: 'The earth is alive and it does not appreciate being hollowed out. It reminds us occasionally.',
    emoji: '🪨',
    duration: 45_000,
    effect: 'production_halt',
    effectValue: 0,
    rarity: 'common',
    rewardXP: 50,
    rewardCoins: 75,
  },
  {
    id: 'aphid_bloom',
    name: 'Aphid Bloom',
    description: 'A swarm of aphids enters the hive, providing an unexpected food source and coin bonus.',
    lore: 'The aphids come willingly. They do not know they are sustenance. The hive does not care.',
    emoji: '🌿',
    duration: 80_000,
    effect: 'coin_bonus',
    effectValue: 2.5,
    rarity: 'uncommon',
    rewardXP: 120,
    rewardCoins: 200,
  },
]

// === SECTION 14: MAIN HOOK — useXenoHive() ===

function xoGenerateId(): string {
  return `xo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function xoGetTodayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

function xoGetTitleForLevel(level: number): string {
  let title = XO_TITLES[0].name
  for (const t of XO_TITLES) {
    if (level >= t.levelRequired) title = t.name
  }
  return title
}

function xoGetXpRequired(level: number): number {
  if (level <= 0) return 0
  if (level >= XO_MAX_LEVEL) return Infinity
  return XO_XP_TABLE[level] ?? 100
}

function xoCreateDefaultState(): XoHiveState {
  return {
    xoLevel: 1,
    xoXp: XO_STARTING_XP,
    xoTotalXp: 0,
    xoCoins: XO_STARTING_COINS,
    creatures: [],
    chambers: XO_CHAMBERS.map((c) => ({
      chamberId: c.id,
      unlocked: c.unlockLevel <= 1,
      creatureCount: 0,
      level: c.level,
      lastHarvest: 0,
      totalHarvested: 0,
    })),
    materials: XO_MATERIALS.map((m) => ({
      materialId: m.id,
      amount: m.rarity === 'common' ? 3 : 0,
    })),
    structures: XO_STRUCTURES.map((s) => ({
      structureId: s.id,
      level: 0,
      built: false,
    })),
    abilities: XO_ABILITIES.map((a) => ({
      abilityId: a.id,
      unlocked: a.unlockLevel <= 1,
      lastUsed: 0,
    })),
    achievements: XO_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: 0,
    })),
    artifacts: XO_ARTIFACTS.map((a) => ({
      artifactId: a.id,
      activated: false,
      activatedAt: 0,
    })),
    activeEvent: null,
    activeTitle: XO_TITLES[0].name,
    totalHatched: 0,
    totalSwarmed: 0,
    totalEvolved: 0,
    totalAssimilated: 0,
    totalInfected: 0,
    totalFortified: 0,
    totalMetamorphed: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalMaterialsGathered: 0,
    totalBuilt: 0,
    streak: 0,
    bestStreak: 0,
    dailyClaimed: false,
    dailyDate: '',
    seed: Date.now(),
    tick: 0,
  }
}

function xoRollRarity(hiveLevel: number): XoRarity {
  const levelBonus = Math.min(hiveLevel * 0.5, 15)
  const weights: Record<XoRarity, number> = {
    common: Math.max(50 - levelBonus, 20),
    uncommon: 28,
    rare: 14 + levelBonus * 0.3,
    epic: 5 + levelBonus * 0.12,
    legendary: 1 + levelBonus * 0.05,
  }
  const total = Object.values(weights).reduce((s, w) => s + w, 0)
  let roll = Math.random() * total
  const order: XoRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common']
  for (const rarity of order) {
    roll -= weights[rarity]
    if (roll <= 0) return rarity
  }
  return 'common'
}

function xoCheckAchievements(state: XoHiveState): XoAchievementEntity[] {
  const checks: Record<string, number> = {
    totalHatched: state.totalHatched,
    totalSwarmed: state.totalSwarmed,
    totalEvolved: state.totalEvolved,
    totalAssimilated: state.totalAssimilated,
    chambersUnlocked: state.chambers.filter((c) => c.unlocked).length,
    totalBuilt: state.totalBuilt,
    xoLevel: state.xoLevel,
    bestStreak: state.bestStreak,
    legendaryHatched: state.creatures.filter((c) => {
      const def = XO_CREATURES.find((d) => d.id === c.creatureDefId)
      return def?.rarity === 'legendary'
    }).length,
  }
  return state.achievements.map((a) => {
    if (a.unlocked) return a
    const def = XO_ACHIEVEMENTS.find((d) => d.id === a.id)
    if (!def) return a
    const current = checks[def.conditionKey] ?? 0
    if (current >= def.targetValue) {
      return { ...a, unlocked: true, unlockedAt: Date.now() }
    }
    return a
  })
}

export default function useXenoHive() {
  // === Core State ===
  const [state, setState] = useState<XoHiveState>(() => {
    if (typeof window === 'undefined') return xoCreateDefaultState()
    try {
      const saved = localStorage.getItem(XO_SAVE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...xoCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return xoCreateDefaultState()
  })

  // === Refs ===
  const initializedRef = useRef(false)
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<XoHiveState>(state)

  // Sync stateRef via useEffect — NOT during render
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === Init effect (localStorage load handled in useState initializer) ===
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true
    // Update chambers unlock based on current level
    setState((prev) => {
      const updatedChambers = prev.chambers.map((ch) => {
        const def = XO_CHAMBERS.find((c) => c.id === ch.chamberId)
        if (def && prev.xoLevel >= def.unlockLevel && !ch.unlocked) {
          return { ...ch, unlocked: true }
        }
        return ch
      })
      // Update abilities unlock based on current level
      const updatedAbilities = prev.abilities.map((ab) => {
        const def = XO_ABILITIES.find((a) => a.id === ab.abilityId)
        if (def && prev.xoLevel >= def.unlockLevel && !ab.unlocked) {
          return { ...ab, unlocked: true }
        }
        return ab
      })
      return {
        ...prev,
        chambers: updatedChambers,
        abilities: updatedAbilities,
        activeTitle: xoGetTitleForLevel(prev.xoLevel),
      }
    })
  }, [])

  // === Auto-save effect ===
  useEffect(() => {
    if (typeof window === 'undefined') return
    autoSaveTimerRef.current = setInterval(() => {
      try {
        localStorage.setItem(XO_SAVE_KEY, JSON.stringify(stateRef.current))
      } catch {
        // ignore storage errors
      }
    }, XO_AUTO_SAVE_INTERVAL)
    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current)
      }
    }
  }, [])

  // === Manual Save ===
  const xoSave = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(XO_SAVE_KEY, JSON.stringify(stateRef.current))
    } catch {
      // ignore
    }
  }, [])

  // === Core XP / Coins Helpers ===

  const xoAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let { xoLevel, xoXp, xoTotalXp } = prev
      const gained = Math.floor(amount)
      xoXp += gained
      xoTotalXp += gained
      while (xoLevel < XO_MAX_LEVEL && xoXp >= xoGetXpRequired(xoLevel)) {
        xoXp -= xoGetXpRequired(xoLevel)
        xoLevel += 1
      }
      if (xoLevel >= XO_MAX_LEVEL) xoXp = 0
      const activeTitle = xoGetTitleForLevel(xoLevel)
      return { ...prev, xoLevel: Math.min(xoLevel, XO_MAX_LEVEL), xoXp, xoTotalXp, activeTitle }
    })
  }, [])

  const xoAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins + Math.floor(amount),
      totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, Math.floor(amount)),
    }))
  }, [])

  const xoSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState((prev) => {
      if (prev.xoCoins < amount) return prev
      success = true
      return {
        ...prev,
        xoCoins: prev.xoCoins - Math.floor(amount),
        totalCoinsSpent: prev.totalCoinsSpent + Math.floor(amount),
      }
    })
    return success
  }, [])

  const xoCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.xoCoins >= amount
  }, [])

  // === Action: Hatch ===
  const xoHatch = useCallback((creatureDefId: string): XoCreatureEntity | null => {
    const def = XO_CREATURES.find((c) => c.id === creatureDefId)
    if (!def) return null
    if (stateRef.current.creatures.length >= XO_MAX_CREATURES) return null
    if (stateRef.current.xoCoins < def.cost) return null

    const hatcheryChamber = stateRef.current.chambers.find(
      (c) => c.chamberId === 'hatchery' && c.unlocked
    )
    if (!hatcheryChamber) return null

    const speciesDef = XO_SPECIES.find((s) => s.id === def.species)
    const chamberId = speciesDef?.favoredChamber ?? 'hatchery'

    const creature: XoCreatureEntity = {
      id: xoGenerateId(),
      creatureDefId: def.id,
      nickname: def.name,
      level: 1,
      xp: 0,
      health: def.power + def.defense,
      maxHealth: def.power + def.defense,
      hatchedAt: Date.now(),
      isMutated: false,
      chamberId,
    }

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - def.cost,
      totalCoinsSpent: prev.totalCoinsSpent + def.cost,
      creatures: [...prev.creatures, creature],
      totalHatched: prev.totalHatched + 1,
      chambers: prev.chambers.map((ch) =>
        ch.chamberId === chamberId
          ? { ...ch, creatureCount: ch.creatureCount + 1 }
          : ch
      ),
      achievements: xoCheckAchievements({
        ...prev,
        creatures: [...prev.creatures, creature],
        totalHatched: prev.totalHatched + 1,
      }),
    }))
    return creature
  }, [])

  // === Action: Hatch Random ===
  const xoHatchRandom = useCallback((): XoCreatureEntity | null => {
    const rarity = xoRollRarity(stateRef.current.xoLevel)
    const eligible = XO_CREATURES.filter((c) => c.rarity === rarity)
    if (eligible.length === 0) return null
    const chosen = eligible[Math.floor(Math.random() * eligible.length)]
    return xoHatch(chosen.id)
  }, [xoHatch])

  // === Action: Swarm ===
  const xoSwarm = useCallback((creatureId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return { success: false, xpGained: 0, coinsGained: 0 }
    const def = XO_CREATURES.find((c) => c.id === creature.creatureDefId)
    if (!def) return { success: false, xpGained: 0, coinsGained: 0 }

    const swarmCost = Math.max(10, Math.floor(XO_SWARM_BASE_COST * (def.rarity === 'legendary' ? 3 : def.rarity === 'epic' ? 2 : 1)))
    if (stateRef.current.xoCoins < swarmCost) return { success: false, xpGained: 0, coinsGained: 0 }

    const xpGained = Math.floor(def.xpReward * (1 + creature.level * 0.2))
    const coinsGained = Math.floor(def.cost * 0.3 * (1 + creature.level * 0.1))

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - swarmCost,
      totalCoinsSpent: prev.totalCoinsSpent + swarmCost,
      xoXp: prev.xoXp + xpGained,
      xoTotalXp: prev.xoTotalXp + xpGained,
      xoCoins: prev.xoCoins - swarmCost + coinsGained,
      totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
      totalSwarmed: prev.totalSwarmed + 1,
      tick: prev.tick + 1,
    }))

    return { success: true, xpGained, coinsGained }
  }, [])

  // === Action: Evolve ===
  const xoEvolve = useCallback((creatureId: string): boolean => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return false
    const def = XO_CREATURES.find((c) => c.id === creature.creatureDefId)
    if (!def) return false

    const evolveCost = Math.floor(XO_EVOLVE_BASE_COST * creature.level)
    if (stateRef.current.xoCoins < evolveCost) return false
    if (creature.xp < xoGetXpRequired(creature.level)) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - evolveCost,
      totalCoinsSpent: prev.totalCoinsSpent + evolveCost,
      creatures: prev.creatures.map((c) => {
        if (c.id !== creatureId) return c
        const newLevel = c.level + 1
        const newMaxHealth = (def.power + def.defense) * (1 + newLevel * 0.15)
        return {
          ...c,
          level: newLevel,
          xp: 0,
          health: Math.floor(newMaxHealth),
          maxHealth: Math.floor(newMaxHealth),
        }
      }),
      totalEvolved: prev.totalEvolved + 1,
      achievements: xoCheckAchievements({ ...prev, totalEvolved: prev.totalEvolved + 1 }),
    }))
    return true
  }, [])

  // === Action: Assimilate ===
  const xoAssimilate = useCallback((targetCreatureDefId: string): XoCreatureEntity | null => {
    const def = XO_CREATURES.find((c) => c.id === targetCreatureDefId)
    if (!def) return null
    if (stateRef.current.creatures.length >= XO_MAX_CREATURES) return null

    const assimilateCost = Math.floor(def.cost * 0.8)
    if (stateRef.current.xoCoins < assimilateCost) return null

    const speciesDef = XO_SPECIES.find((s) => s.id === def.species)
    const chamberId = speciesDef?.favoredChamber ?? 'hatchery'

    const creature: XoCreatureEntity = {
      id: xoGenerateId(),
      creatureDefId: def.id,
      nickname: `Assimilated ${def.name}`,
      level: 1,
      xp: 0,
      health: Math.floor((def.power + def.defense) * 0.7),
      maxHealth: Math.floor((def.power + def.defense) * 0.7),
      hatchedAt: Date.now(),
      isMutated: true,
      chamberId,
    }

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - assimilateCost,
      totalCoinsSpent: prev.totalCoinsSpent + assimilateCost,
      creatures: [...prev.creatures, creature],
      totalAssimilated: prev.totalAssimilated + 1,
      chambers: prev.chambers.map((ch) =>
        ch.chamberId === chamberId
          ? { ...ch, creatureCount: ch.creatureCount + 1 }
          : ch
      ),
      achievements: xoCheckAchievements({
        ...prev,
        creatures: [...prev.creatures, creature],
        totalAssimilated: prev.totalAssimilated + 1,
      }),
    }))
    return creature
  }, [])

  // === Action: Infect ===
  const xoInfect = useCallback((creatureId: string): boolean => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return false
    if (creature.isMutated) return false
    if (stateRef.current.xoCoins < XO_INFECT_BASE_COST) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - XO_INFECT_BASE_COST,
      totalCoinsSpent: prev.totalCoinsSpent + XO_INFECT_BASE_COST,
      creatures: prev.creatures.map((c) => {
        if (c.id !== creatureId) return c
        const def = XO_CREATURES.find((d) => d.id === c.creatureDefId)
        if (!def) return c
        const boostFactor = 1.15
        return {
          ...c,
          isMutated: true,
          health: Math.floor(c.maxHealth * boostFactor),
          maxHealth: Math.floor(c.maxHealth * boostFactor),
        }
      }),
      totalInfected: prev.totalInfected + 1,
      tick: prev.tick + 1,
    }))
    return true
  }, [])

  // === Action: Fortify ===
  const xoFortify = useCallback((structureId: string): boolean => {
    const structure = stateRef.current.structures.find((s) => s.structureId === structureId)
    if (!structure) return false
    const def = XO_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return false

    const currentLevel = structure.level
    const newLevel = currentLevel + 1
    if (newLevel > def.maxLevel) return false

    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, newLevel))
    if (stateRef.current.xoCoins < cost) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      structures: prev.structures.map((s) =>
        s.structureId === structureId
          ? { ...s, level: newLevel, built: true }
          : s
      ),
      totalFortified: prev.totalFortified + 1,
      totalBuilt: prev.totalBuilt + 1,
      achievements: xoCheckAchievements({
        ...prev,
        totalBuilt: prev.totalBuilt + 1,
      }),
    }))
    return true
  }, [])

  // === Action: Metamorph ===
  const xoMetamorph = useCallback((creatureId: string): boolean => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return false
    if (creature.level < 10) return false
    if (stateRef.current.xoCoins < XO_METAMORPH_BASE_COST) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - XO_METAMORPH_BASE_COST,
      totalCoinsSpent: prev.totalCoinsSpent + XO_METAMORPH_BASE_COST,
      creatures: prev.creatures.map((c) => {
        if (c.id !== creatureId) return c
        const def = XO_CREATURES.find((d) => d.id === c.creatureDefId)
        if (!def) return c
        const metaFactor = 1.5
        return {
          ...c,
          level: c.level + 1,
          xp: 0,
          health: Math.floor(c.maxHealth * metaFactor),
          maxHealth: Math.floor(c.maxHealth * metaFactor),
          isMutated: true,
        }
      }),
      totalMetamorphed: prev.totalMetamorphed + 1,
      tick: prev.tick + 1,
    }))
    return true
  }, [])

  // === Build ===
  const xoBuild = useCallback((structureId: string): boolean => {
    const structure = stateRef.current.structures.find((s) => s.structureId === structureId)
    if (!structure) return false
    const def = XO_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return false

    if (structure.built) {
      // Already built — upgrade
      return xofortifyUpgrade(structureId)
    }

    if (stateRef.current.xoCoins < def.baseCost) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - def.baseCost,
      totalCoinsSpent: prev.totalCoinsSpent + def.baseCost,
      structures: prev.structures.map((s) =>
        s.structureId === structureId
          ? { ...s, level: 1, built: true }
          : s
      ),
      totalBuilt: prev.totalBuilt + 1,
      achievements: xoCheckAchievements({
        ...prev,
        totalBuilt: prev.totalBuilt + 1,
      }),
    }))
    return true
  }, [])

  const xofortifyUpgrade = useCallback((structureId: string): boolean => {
    const structure = stateRef.current.structures.find((s) => s.structureId === structureId)
    if (!structure) return false
    const def = XO_STRUCTURES.find((s) => s.id === structureId)
    if (!def) return false

    const newLevel = structure.level + 1
    if (newLevel > def.maxLevel) return false
    const cost = Math.floor(def.baseCost * Math.pow(def.costMultiplier, newLevel))
    if (stateRef.current.xoCoins < cost) return false

    setState((prev) => ({
      ...prev,
      xoCoins: prev.xoCoins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      structures: prev.structures.map((s) =>
        s.structureId === structureId
          ? { ...s, level: newLevel }
          : s
      ),
      totalBuilt: prev.totalBuilt + 1,
    }))
    return true
  }, [])

  // === Activate Artifact ===
  const xoActivateArtifact = useCallback((artifactId: string): boolean => {
    const artifact = stateRef.current.artifacts.find((a) => a.artifactId === artifactId)
    if (!artifact) return false
    if (artifact.activated) return false

    setState((prev) => ({
      ...prev,
      artifacts: prev.artifacts.map((a) =>
        a.artifactId === artifactId
          ? { ...a, activated: true, activatedAt: Date.now() }
          : a
      ),
      tick: prev.tick + 1,
    }))
    return true
  }, [])

  // === Gather Material ===
  const xoGatherMaterial = useCallback((materialId: string): number => {
    const def = XO_MATERIALS.find((m) => m.id === materialId)
    if (!def) return 0

    setState((prev) => ({
      ...prev,
      materials: prev.materials.map((m) =>
        m.materialId === materialId
          ? { ...m, amount: m.amount + 1 }
          : m
      ),
      totalMaterialsGathered: prev.totalMaterialsGathered + 1,
      tick: prev.tick + 1,
    }))
    return 1
  }, [])

  // === Use Ability ===
  const xoUseAbility = useCallback((abilityId: string): { success: boolean; cooldownLeft: number } => {
    const ability = stateRef.current.abilities.find((a) => a.abilityId === abilityId)
    if (!ability) return { success: false, cooldownLeft: 0 }
    if (!ability.unlocked) return { success: false, cooldownLeft: 0 }

    const def = XO_ABILITIES.find((a) => a.id === abilityId)
    if (!def) return { success: false, cooldownLeft: 0 }

    const now = Date.now()
    const timeSinceLastUse = now - ability.lastUsed
    const cooldownMs = def.cooldown * 10_000
    if (timeSinceLastUse < cooldownMs) {
      return { success: false, cooldownLeft: Math.ceil((cooldownMs - timeSinceLastUse) / 1000) }
    }

    setState((prev) => ({
      ...prev,
      abilities: prev.abilities.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsed: now }
          : a
      ),
      tick: prev.tick + 1,
    }))
    return { success: true, cooldownLeft: 0 }
  }, [])

  // === Move Creature ===
  const xoMoveCreature = useCallback((creatureId: string, targetChamberId: XoChamberId): boolean => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return false
    const targetChamber = stateRef.current.chambers.find((c) => c.chamberId === targetChamberId)
    if (!targetChamber || !targetChamber.unlocked) return false

    setState((prev) => {
      const chamberDef = XO_CHAMBERS.find((c) => c.id === targetChamberId)
      const creaturesInTarget = prev.creatures.filter((c) => c.chamberId === targetChamberId).length
      if (chamberDef && creaturesInTarget >= chamberDef.capacity) return prev

      const oldChamberId = creature.chamberId
      return {
        ...prev,
        creatures: prev.creatures.map((c) =>
          c.id === creatureId ? { ...c, chamberId: targetChamberId } : c
        ),
        chambers: prev.chambers.map((ch) => {
          if (ch.chamberId === targetChamberId) return { ...ch, creatureCount: ch.creatureCount + 1 }
          if (ch.chamberId === oldChamberId) return { ...ch, creatureCount: Math.max(0, ch.creatureCount - 1) }
          return ch
        }),
      }
    })
    return true
  }, [])

  // === Release Creature ===
  const xoReleaseCreature = useCallback((creatureId: string): number => {
    const creature = stateRef.current.creatures.find((c) => c.id === creatureId)
    if (!creature) return 0
    const def = XO_CREATURES.find((c) => c.id === creature.creatureDefId)
    const refund = def ? Math.floor(def.cost * 0.25) : 5

    setState((prev) => ({
      ...prev,
      creatures: prev.creatures.filter((c) => c.id !== creatureId),
      xoCoins: prev.xoCoins + refund,
      totalCoinsEarned: prev.totalCoinsEarned + refund,
      chambers: prev.chambers.map((ch) =>
        ch.chamberId === creature.chamberId
          ? { ...ch, creatureCount: Math.max(0, ch.creatureCount - 1) }
          : ch
      ),
    }))
    return refund
  }, [])

  // === Trigger Event ===
  const xoTriggerEvent = useCallback((eventId: XoEventId): boolean => {
    if (stateRef.current.activeEvent) return false
    const def = XO_EVENTS.find((e) => e.id === eventId)
    if (!def) return false

    setState((prev) => ({
      ...prev,
      activeEvent: {
        eventId,
        active: true,
        startedAt: Date.now(),
        expiresAt: Date.now() + def.duration,
      },
    }))
    return true
  }, [])

  // === Daily Claim ===
  const xoClaimDaily = useCallback((): { coins: number; xp: number; isNewDay: boolean } => {
    const todayKey = xoGetTodayKey()
    const isSameDay = stateRef.current.dailyDate === todayKey

    if (isSameDay) {
      return { coins: 0, xp: 0, isNewDay: false }
    }

    setState((prev) => {
      const newStreak = prev.streak + 1
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      return {
        ...prev,
        xoCoins: prev.xoCoins + XO_DAILY_COINS,
        totalCoinsEarned: prev.totalCoinsEarned + XO_DAILY_COINS,
        xoXp: prev.xoXp + XO_DAILY_XP,
        xoTotalXp: prev.xoTotalXp + XO_DAILY_XP,
        dailyClaimed: true,
        dailyDate: todayKey,
        streak: newStreak,
        bestStreak: newBestStreak,
        achievements: xoCheckAchievements({
          ...prev,
          streak: newStreak,
          bestStreak: newBestStreak,
        }),
      }
    })
    return { coins: XO_DAILY_COINS, xp: XO_DAILY_XP, isNewDay: true }
  }, [])

  // === Rename Creature ===
  const xoRenameCreature = useCallback((creatureId: string, newName: string): boolean => {
    if (!newName.trim()) return false
    setState((prev) => ({
      ...prev,
      creatures: prev.creatures.map((c) =>
        c.id === creatureId ? { ...c, nickname: newName.trim() } : c
      ),
    }))
    return true
  }, [])

  // === Reset State ===
  const xoResetState = useCallback(() => {
    const fresh = xoCreateDefaultState()
    setState(fresh)
    if (typeof window !== 'undefined') {
      localStorage.setItem(XO_SAVE_KEY, JSON.stringify(fresh))
    }
  }, [])

  // === COMPUTED VALUES (useMemo) ===

  const xoCreaturesByRarity = useMemo(() => {
    const result: Record<XoRarity, XoCreatureEntity[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    }
    for (const creature of state.creatures) {
      const def = XO_CREATURES.find((d) => d.id === creature.creatureDefId)
      if (def) result[def.rarity].push(creature)
    }
    return result
  }, [state.creatures])

  const xoCreaturesBySpecies = useMemo(() => {
    const result: Record<XoSpecies, XoCreatureEntity[]> = {
      drone_soldier: [], swarm_queen: [], chitin_guard: [],
      venom_sprayer: [], hive_mind: [], carapace_tank: [], spore_reaper: [],
    }
    for (const creature of state.creatures) {
      const def = XO_CREATURES.find((d) => d.id === creature.creatureDefId)
      if (def) result[def.species].push(creature)
    }
    return result
  }, [state.creatures])

  const xoCreaturesByChamber = useMemo(() => {
    const result: Record<XoChamberId, XoCreatureEntity[]> = {
      hatchery: [], brood_nest: [], acid_cavern: [], royal_chamber: [],
      spore_garden: [], chitin_forge: [], hive_nexus: [], void_depths: [],
    }
    for (const creature of state.creatures) {
      result[creature.chamberId].push(creature)
    }
    return result
  }, [state.creatures])

  const xoTotalPower = useMemo(() => {
    let total = 0
    for (const creature of state.creatures) {
      const def = XO_CREATURES.find((d) => d.id === creature.creatureDefId)
      if (def) {
        total += Math.floor(def.power * (1 + creature.level * 0.15))
      }
    }
    return total
  }, [state.creatures])

  const xoTotalDefense = useMemo(() => {
    let total = 0
    for (const creature of state.creatures) {
      const def = XO_CREATURES.find((d) => d.id === creature.creatureDefId)
      if (def) {
        total += Math.floor(def.defense * (1 + creature.level * 0.15))
      }
    }
    return total
  }, [state.creatures])

  const xoCreatureCount = useMemo(() => state.creatures.length, [state.creatures])

  const xoUnlockedChamberCount = useMemo(
    () => state.chambers.filter((c) => c.unlocked).length,
    [state.chambers]
  )

  const xoBuiltStructureCount = useMemo(
    () => state.structures.filter((s) => s.built).length,
    [state.structures]
  )

  const xoUnlockedAbilityCount = useMemo(
    () => state.abilities.filter((a) => a.unlocked).length,
    [state.abilities]
  )

  const xoUnlockedAchievementCount = useMemo(
    () => state.achievements.filter((a) => a.unlocked).length,
    [state.achievements]
  )

  const xoActivatedArtifactCount = useMemo(
    () => state.artifacts.filter((a) => a.activated).length,
    [state.artifacts]
  )

  const xoTotalMaterialValue = useMemo(() => {
    let total = 0
    for (const mat of state.materials) {
      const def = XO_MATERIALS.find((d) => d.id === mat.materialId)
      if (def) total += def.value * mat.amount
    }
    return total
  }, [state.materials])

  const xoStructureBonus = useMemo(() => {
    const bonuses: Record<string, number> = {
      defense: 0, production: 0, capacity: 0, power: 0, xp: 0,
    }
    for (const struct of state.structures) {
      if (!struct.built) continue
      const def = XO_STRUCTURES.find((d) => d.id === struct.structureId)
      if (def) {
        bonuses[def.bonusType] += def.bonusPerLevel * struct.level
      }
    }
    return bonuses
  }, [state.structures])

  const xoArtifactBonus = useMemo(() => {
    const bonuses: Record<string, number> = {
      power: 0, defense: 0, xp: 0, coins: 0, hatch_speed: 0, swarm_bonus: 0,
    }
    for (const artifact of state.artifacts) {
      if (!artifact.activated) continue
      const def = XO_ARTIFACTS.find((d) => d.id === artifact.artifactId)
      if (def) {
        bonuses[def.bonusType] += def.bonusValue
      }
    }
    return bonuses
  }, [state.artifacts])

  const xoXpToNextLevel = useMemo(() => {
    return xoGetXpRequired(state.xoLevel)
  }, [state.xoLevel])

  const xoXpProgress = useMemo(() => {
    const needed = xoGetXpRequired(state.xoLevel)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xoXp / needed)
  }, [state.xoXp, state.xoLevel])

  const xoOverallProgress = useMemo(() => {
    return state.xoLevel / XO_MAX_LEVEL
  }, [state.xoLevel])

  const xoUniqueSpeciesOwned = useMemo(() => {
    const speciesSet = new Set<XoSpecies>()
    for (const creature of state.creatures) {
      const def = XO_CREATURES.find((d) => d.id === creature.creatureDefId)
      if (def) speciesSet.add(def.species)
    }
    return speciesSet.size
  }, [state.creatures])

  const xoUniqueCreaturesOwned = useMemo(() => {
    const idSet = new Set<string>()
    for (const creature of state.creatures) {
      idSet.add(creature.creatureDefId)
    }
    return idSet.size
  }, [state.creatures])

  const xoMutatedCreatureCount = useMemo(
    () => state.creatures.filter((c) => c.isMutated).length,
    [state.creatures]
  )

  const xoHighestCreatureLevel = useMemo(() => {
    if (state.creatures.length === 0) return 0
    return Math.max(...state.creatures.map((c) => c.level))
  }, [state.creatures])

  const xoActiveEventDef = useMemo(() => {
    if (!state.activeEvent) return null
    if (!state.activeEvent.active) return null
    if (Date.now() > state.activeEvent.expiresAt) return null
    return XO_EVENTS.find((e) => e.id === state.activeEvent!.eventId) ?? null
  }, [state.activeEvent])

  const xoCollectionProgress = useMemo(() => {
    const totalDefCreatures = XO_CREATURES.length
    const ownedSet = new Set<string>()
    for (const creature of state.creatures) {
      ownedSet.add(creature.creatureDefId)
    }
    return {
      owned: ownedSet.size,
      total: totalDefCreatures,
      percentage: totalDefCreatures > 0 ? (ownedSet.size / totalDefCreatures) * 100 : 0,
    }
  }, [state.creatures])

  const xoMaterialSummary = useMemo(() => {
    return state.materials.map((m) => {
      const def = XO_MATERIALS.find((d) => d.id === m.materialId)
      return {
        ...m,
        name: def?.name ?? m.materialId,
        emoji: def?.emoji ?? '❓',
        rarity: def?.rarity ?? 'common',
        value: def?.value ?? 0,
      }
    })
  }, [state.materials])

  const xoChamberSummary = useMemo(() => {
    return state.chambers.map((ch) => {
      const def = XO_CHAMBERS.find((c) => c.id === ch.chamberId)
      const creatures = state.creatures.filter((c) => c.chamberId === ch.chamberId)
      return {
        ...ch,
        name: def?.name ?? ch.chamberId,
        emoji: def?.emoji ?? '❓',
        description: def?.description ?? '',
        ambientColor: def?.ambientColor ?? '#0A0A0A',
        dangerLevel: def?.dangerLevel ?? 0,
        capacity: def?.capacity ?? 0,
        creatures,
        isFull: def ? creatures.length >= def.capacity : false,
      }
    })
  }, [state.chambers, state.creatures])

  const xoStructureSummary = useMemo(() => {
    return state.structures.map((s) => {
      const def = XO_STRUCTURES.find((d) => d.id === s.structureId)
      const upgradeCost = def
        ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, s.level + 1))
        : 0
      return {
        ...s,
        name: def?.name ?? s.structureId,
        emoji: def?.emoji ?? '❓',
        description: def?.description ?? '',
        bonusPerLevel: def?.bonusPerLevel ?? 0,
        bonusType: def?.bonusType ?? 'power',
        maxLevel: def?.maxLevel ?? 10,
        isMaxLevel: def ? s.level >= def.maxLevel : false,
        currentBonus: def ? def.bonusPerLevel * s.level : 0,
        upgradeCost,
      }
    })
  }, [state.structures])

  const xoAbilitySummary = useMemo(() => {
    return state.abilities.map((ab) => {
      const def = XO_ABILITIES.find((d) => d.id === ab.abilityId)
      const cooldownMs = def ? def.cooldown * 10_000 : 0
      const timeSinceLastUse = Date.now() - ab.lastUsed
      const cooldownLeft = Math.max(0, Math.ceil((cooldownMs - timeSinceLastUse) / 1000))
      const isReady = ab.unlocked && cooldownLeft <= 0
      return {
        ...ab,
        name: def?.name ?? ab.abilityId,
        emoji: def?.emoji ?? '❓',
        description: def?.description ?? '',
        category: def?.category ?? 'utility',
        damage: def?.damage ?? 0,
        effect: def?.effect ?? '',
        powerCost: def?.powerCost ?? 0,
        cooldownLeft,
        isReady,
      }
    })
  }, [state.abilities, state.tick])

  const xoAchievementSummary = useMemo(() => {
    return state.achievements.map((a) => {
      const def = XO_ACHIEVEMENTS.find((d) => d.id === a.id)
      return {
        ...a,
        name: def?.name ?? a.id,
        icon: def?.icon ?? '🏅',
        description: def?.description ?? '',
        rewardXP: def?.rewardXP ?? 0,
        rewardCoins: def?.rewardCoins ?? 0,
        targetValue: def?.targetValue ?? 0,
        conditionKey: def?.conditionKey ?? '',
      }
    })
  }, [state.achievements])

  const xoEnrichedCreatures = useMemo(() => {
    return state.creatures.map((c) => {
      const def = XO_CREATURES.find((d) => d.id === c.creatureDefId)
      const speciesDef = def ? XO_SPECIES.find((s) => s.id === def.species) : null
      const chamberDef = XO_CHAMBERS.find((ch) => ch.id === c.chamberId)
      return {
        ...c,
        def: def ?? null,
        speciesDef: speciesDef ?? null,
        chamberDef: chamberDef ?? null,
        effectivePower: def ? Math.floor(def.power * (1 + c.level * 0.15)) : 0,
        effectiveDefense: def ? Math.floor(def.defense * (1 + c.level * 0.15)) : 0,
        xpToNextLevel: xoGetXpRequired(c.level),
        xpProgress: (() => {
          const needed = xoGetXpRequired(c.level)
          if (needed === Infinity || needed <= 0) return 1
          return Math.min(1, c.xp / needed)
        })(),
        rarityColor: def ? XO_RARITY_COLORS[def.rarity] : '#7CFC00',
        rarityIcon: def ? XO_RARITY_ICONS[def.rarity] : '🟢',
      }
    })
  }, [state.creatures])

  // === SIMPLE GETTERS ===
  const xoGetLevel = (): number => state.xoLevel
  const xoGetXp = (): number => state.xoXp
  const xoGetCoins = (): number => state.xoCoins
  const xoGetTitle = (): string => state.activeTitle
  const xoGetCreatures = (): XoCreatureEntity[] => state.creatures
  const xoGetChambers = (): XoChamberEntity[] => state.chambers
  const xoGetMaterials = (): XoMaterialEntity[] => state.materials
  const xoGetStructures = (): XoStructureEntity[] => state.structures
  const xoGetAbilities = (): XoAbilityEntity[] => state.abilities
  const xoGetAchievements = (): XoAchievementEntity[] => state.achievements
  const xoGetArtifacts = (): XoArtifactEntity[] => state.artifacts
  const xoGetStreak = (): number => state.streak
  const xoGetBestStreak = (): number => state.bestStreak
  const xoGetSeed = (): number => state.seed
  const xoGetTick = (): number => state.tick
  const xoGetTotalHatched = (): number => state.totalHatched
  const xoGetTotalSwarmed = (): number => state.totalSwarmed
  const xoGetTotalEvolved = (): number => state.totalEvolved
  const xoGetTotalAssimilated = (): number => state.totalAssimilated
  const xoGetTotalInfected = (): number => state.totalInfected
  const xoGetTotalFortified = (): number => state.totalFortified
  const xoGetTotalMetamorphed = (): number => state.totalMetamorphed
  const xoGetTotalCoinsEarned = (): number => state.totalCoinsEarned
  const xoGetTotalCoinsSpent = (): number => state.totalCoinsSpent
  const xoGetTotalMaterialsGathered = (): number => state.totalMaterialsGathered
  const xoGetTotalBuilt = (): number => state.totalBuilt
  const xoIsDailyClaimed = (): boolean => state.dailyClaimed

  // === RETURN OBJECT ===

  return {
    // Constants
    XO_SAVE_KEY,
    XO_MAX_LEVEL,
    XO_STARTING_COINS,
    XO_STARTING_XP,
    XO_HATCH_BASE_COST,
    XO_SWARM_BASE_COST,
    XO_EVOLVE_BASE_COST,
    XO_ASSIMILATE_BASE_COST,
    XO_INFECT_BASE_COST,
    XO_FORTIFY_BASE_COST,
    XO_METAMORPH_BASE_COST,
    XO_AUTO_SAVE_INTERVAL,
    XO_DAILY_COINS,
    XO_DAILY_XP,
    XO_MAX_CREATURES,
    XO_XP_TABLE,

    // Colors
    XO_COLOR_ACID_GREEN,
    XO_COLOR_CHITIN_BROWN,
    XO_COLOR_HIVE_PURPLE,
    XO_COLOR_ALIEN_BLUE,
    XO_COLOR_VENOM_YELLOW,
    XO_COLOR_SLIME_GREEN,
    XO_COLOR_VOID_BLACK,
    XO_COLOR_DARK_CHITIN,
    XO_COLOR_PALE_SLIME,
    XO_COLOR_MUTATION_PINK,
    XO_COLOR_EMBER_ORANGE,
    XO_COLOR_ROYAL_AMETHYST,
    XO_COLOR_VENOM_GLOW,
    XO_COLOR_ABYSS_TEAL,
    XO_COLOR_HIVE_AMBER,

    // Data
    XO_SPECIES,
    XO_CREATURES,
    XO_CHAMBERS,
    XO_MATERIALS,
    XO_STRUCTURES,
    XO_ABILITIES,
    XO_ACHIEVEMENTS,
    XO_TITLES,
    XO_ARTIFACTS,
    XO_EVENTS,

    // Mappings
    XO_RARITY_COLORS,
    XO_RARITY_ICONS,
    XO_SPECIES_COLORS,
    XO_SPECIES_ICONS,
    XO_SPECIES_LABELS,

    // State
    xoLevel: state.xoLevel,
    xoXp: state.xoXp,
    xoTotalXp: state.xoTotalXp,
    xoCoins: state.xoCoins,
    xoActiveTitle: state.activeTitle,
    xoActiveEvent: state.activeEvent,
    creatures: state.creatures,
    chambers: state.chambers,
    materials: state.materials,
    structures: state.structures,
    abilities: state.abilities,
    achievements: state.achievements,
    artifacts: state.artifacts,
    streak: state.streak,
    bestStreak: state.bestStreak,

    // Actions
    hatch: xoHatch,
    hatchRandom: xoHatchRandom,
    swarm: xoSwarm,
    evolve: xoEvolve,
    assimilate: xoAssimilate,
    infect: xoInfect,
    fortify: xoFortify,
    metamorph: xoMetamorph,
    build: xoBuild,
    activateArtifact: xoActivateArtifact,
    gatherMaterial: xoGatherMaterial,
    useAbility: xoUseAbility,
    moveCreature: xoMoveCreature,
    releaseCreature: xoReleaseCreature,
    triggerEvent: xoTriggerEvent,
    claimDaily: xoClaimDaily,
    renameCreature: xoRenameCreature,
    addXp: xoAddXp,
    addCoins: xoAddXp,
    spendCoins: xoSpendCoins,
    canAfford: xoCanAfford,
    save: xoSave,
    resetState: xoResetState,

    // Computed values
    creaturesByRarity: xoCreaturesByRarity,
    creaturesBySpecies: xoCreaturesBySpecies,
    creaturesByChamber: xoCreaturesByChamber,
    enrichedCreatures: xoEnrichedCreatures,
    totalPower: xoTotalPower,
    totalDefense: xoTotalDefense,
    creatureCount: xoCreatureCount,
    unlockedChamberCount: xoUnlockedChamberCount,
    builtStructureCount: xoBuiltStructureCount,
    unlockedAbilityCount: xoUnlockedAbilityCount,
    unlockedAchievementCount: xoUnlockedAchievementCount,
    activatedArtifactCount: xoActivatedArtifactCount,
    totalMaterialValue: xoTotalMaterialValue,
    structureBonus: xoStructureBonus,
    artifactBonus: xoArtifactBonus,
    xpToNextLevel: xoXpToNextLevel,
    xpProgress: xoXpProgress,
    overallProgress: xoOverallProgress,
    uniqueSpeciesOwned: xoUniqueSpeciesOwned,
    uniqueCreaturesOwned: xoUniqueCreaturesOwned,
    mutatedCreatureCount: xoMutatedCreatureCount,
    highestCreatureLevel: xoHighestCreatureLevel,
    activeEventDef: xoActiveEventDef,
    collectionProgress: xoCollectionProgress,
    materialSummary: xoMaterialSummary,
    chamberSummary: xoChamberSummary,
    structureSummary: xoStructureSummary,
    abilitySummary: xoAbilitySummary,
    achievementSummary: xoAchievementSummary,

    // Simple getters
    getLevel: xoGetLevel,
    getXp: xoGetXp,
    getCoins: xoGetCoins,
    getTitle: xoGetTitle,
    getCreatures: xoGetCreatures,
    getChambers: xoGetChambers,
    getMaterials: xoGetMaterials,
    getStructures: xoGetStructures,
    getAbilities: xoGetAbilities,
    getAchievements: xoGetAchievements,
    getArtifacts: xoGetArtifacts,
    getStreak: xoGetStreak,
    getBestStreak: xoGetBestStreak,
    getSeed: xoGetSeed,
    getTick: xoGetTick,
    getTotalHatched: xoGetTotalHatched,
    getTotalSwarmed: xoGetTotalSwarmed,
    getTotalEvolved: xoGetTotalEvolved,
    getTotalAssimilated: xoGetTotalAssimilated,
    getTotalInfected: xoGetTotalInfected,
    getTotalFortified: xoGetTotalFortified,
    getTotalMetamorphed: xoGetTotalMetamorphed,
    getTotalCoinsEarned: xoGetTotalCoinsEarned,
    getTotalCoinsSpent: xoGetTotalCoinsSpent,
    getTotalMaterialsGathered: xoGetTotalMaterialsGathered,
    getTotalBuilt: xoGetTotalBuilt,
    isDailyClaimed: xoIsDailyClaimed,
  }
}
