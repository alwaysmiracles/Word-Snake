'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Crystal Glacier Wire — Ancient Frozen World Crystal Harvesting Wire
// All constants use CG_ prefix. All hook functions use cg prefix.
// Ice blue / crystal white / frost cyan / glacial silver / arctic purple theme.
// =============================================================================

// === TYPE DEFINITIONS ===

export type CgRarity = 'common' | 'unusual' | 'rare' | 'epic' | 'legendary'
export type CgCreatureType = 'golem' | 'wolf' | 'dragon' | 'beast' | 'spirit' | 'serpent' | 'insect' | 'avian' | 'aquatic' | 'elemental'
export type CgAbilitySchool = 'crystal' | 'glacial' | 'permafrost' | 'frost' | 'aurora' | 'rime'
export type CgZoneId = 'crystal_cavern' | 'frozen_lake' | 'permafrost_peak' | 'ice_cathedral' | 'glacial_maze' | 'diamond_depths' | 'aurora_field' | 'eternal_permafrost'
export type CgMaterialCategory = 'gem' | 'shard' | 'ore' | 'crystal' | 'dust' | 'essence'
export type CgStructureType = 'mine' | 'sculpture' | 'altar' | 'forge' | 'shrine' | 'tower' | 'bridge' | 'vault' | 'observatory' | 'workshop'
export type CgQuestDifficulty = 'easy' | 'moderate' | 'hard' | 'extreme' | 'mythic'
export type CgFusionTier = 'basic' | 'enhanced' | 'superior' | 'transcendent' | 'primordial'

// === RARITY CONSTANTS ===

export const CG_RARITY_COMMON: CgRarity = 'common'
export const CG_RARITY_UNUSUAL: CgRarity = 'unusual'
export const CG_RARITY_RARE: CgRarity = 'rare'
export const CG_RARITY_EPIC: CgRarity = 'epic'
export const CG_RARITY_LEGENDARY: CgRarity = 'legendary'

export const CG_RARITY_COLORS: Record<CgRarity, string> = {
  [CG_RARITY_COMMON]: '#a8d8ea',
  [CG_RARITY_UNUSUAL]: '#7ec8e3',
  [CG_RARITY_RARE]: '#5ab0cd',
  [CG_RARITY_EPIC]: '#b8a9c9',
  [CG_RARITY_LEGENDARY]: '#e8e0f0',
}

export const CG_RARITY_XP_MULTIPLIER: Record<CgRarity, number> = {
  [CG_RARITY_COMMON]: 1,
  [CG_RARITY_UNUSUAL]: 1.5,
  [CG_RARITY_RARE]: 2.5,
  [CG_RARITY_EPIC]: 4,
  [CG_RARITY_LEGENDARY]: 7,
}

export const CG_RARITY_DROP_WEIGHTS: Record<CgRarity, number> = {
  [CG_RARITY_COMMON]: 40,
  [CG_RARITY_UNUSUAL]: 28,
  [CG_RARITY_RARE]: 18,
  [CG_RARITY_EPIC]: 9,
  [CG_RARITY_LEGENDARY]: 5,
}

export const CG_RARITY_ICONS: Record<CgRarity, string> = {
  [CG_RARITY_COMMON]: '💎',
  [CG_RARITY_UNUSUAL]: '❄️',
  [CG_RARITY_RARE]: '💠',
  [CG_RARITY_EPIC]: '🌟',
  [CG_RARITY_LEGENDARY]: '👑',
}

export const CG_FUSION_TIER_BASIC: CgFusionTier = 'basic'
export const CG_FUSION_TIER_ENHANCED: CgFusionTier = 'enhanced'
export const CG_FUSION_TIER_SUPERIOR: CgFusionTier = 'superior'
export const CG_FUSION_TIER_TRANSCENDENT: CgFusionTier = 'transcendent'
export const CG_FUSION_TIER_PRIMORDIAL: CgFusionTier = 'primordial'

// === COLOR THEME ===

export const CG_COLOR_ICE_BLUE = '#a8d8ea'
export const CG_COLOR_CRYSTAL_WHITE = '#f0f4f8'
export const CG_COLOR_FROST_CYAN = '#76d7ea'
export const CG_COLOR_GLACIAL_SILVER = '#c0c8d4'
export const CG_COLOR_ARCTIC_PURPLE = '#8e7cc3'
export const CG_COLOR_DEEP_FROST = '#4a6fa5'
export const CG_COLOR_PERMAFROST = '#6b8fa3'
export const CG_COLOR_AURORA_TEAL = '#5fb8b0'
export const CG_COLOR_DIAMOND = '#b9f2ff'
export const CG_COLOR_FROST_GLOW = '#d4eaf7'

// === INTERFACES ===

export interface CgCreatureDef {
  id: string
  name: string
  type: CgCreatureType
  rarity: CgRarity
  hp: number
  frostPower: number
  speed: number
  description: string
  lore: string
  icon: string
  color: string
  tamingCost: number
}

export interface CgCreatureEntity {
  creatureId: string
  nickname: string
  level: number
  xp: number
  hp: number
  maxHp: number
  deployed: boolean
  zoneId: CgZoneId | null
  tamedAt: number | null
}

export interface CgMaterialDef {
  id: string
  name: string
  category: CgMaterialCategory
  rarity: CgRarity
  harvestYield: number
  frostValue: number
  description: string
  lore: string
  icon: string
  color: string
}

export interface CgMaterialEntity {
  materialId: string
  owned: boolean
  quantity: number
  harvestedAt: number | null
}

export interface CgZoneDef {
  id: CgZoneId
  name: string
  description: string
  unlockLevel: number
  ambientColor: string
  dangerLevel: number
  maxCreatures: number
  crystalReserve: number
  maxCrystalReserve: number
  rewards: string[]
}

export interface CgZoneEntity {
  zoneId: CgZoneId
  unlocked: boolean
  crystalReserve: number
  maxCrystalReserve: number
  creaturesDeployed: number
  totalHarvests: number
  lastExploredAt: number | null
}

export interface CgStructureDef {
  id: string
  name: string
  type: CgStructureType
  zoneId: CgZoneId
  buildCost: number
  buildTime: number
  harvestBonus: number
  frostBonus: number
  description: string
  icon: string
  levelReq: number
  maxLevel: number
}

export interface CgStructureEntity {
  structureId: string
  built: boolean
  level: number
  builtAt: number | null
}

export interface CgAbilityDef {
  id: string
  name: string
  school: CgAbilitySchool
  rarity: CgRarity
  power: number
  manaCost: number
  cooldown: number
  unlockLevel: number
  description: string
  icon: string
  color: string
}

export interface CgAbilityEntity {
  abilityId: string
  learned: boolean
  mastery: number
  castCount: number
}

export interface CgAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  rewardCoins: number
  hidden: boolean
  icon: string
}

export interface CgAchievementEntity {
  achievementId: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface CgTitleDef {
  level: number
  title: string
  description: string
  icon: string
}

export interface CgDailyQuest {
  date: string
  completed: boolean
  crystalsHarvested: number
  creaturesTamed: number
  sculpturesCompleted: number
  coinsEarned: number
  xpEarned: number
}

export interface CgFusionRecipe {
  id: string
  name: string
  tier: CgFusionTier
  materialIds: string[]
  resultMaterialId: string
  frostPowerBonus: number
  description: string
  icon: string
}

export interface CrystalGlacierState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  creatures: CgCreatureEntity[]
  materials: CgMaterialEntity[]
  zones: CgZoneEntity[]
  structures: CgStructureEntity[]
  abilities: CgAbilityEntity[]
  achievements: CgAchievementEntity[]
  title: string
  totalCreaturesTamed: number
  totalCreaturesDeployed: number
  totalCrystalsHarvested: number
  totalSculpturesCompleted: number
  totalFusionsPerformed: number
  totalAbilitiesCast: number
  totalAchievements: number
  totalStructuresBuilt: number
  dailyQuest: CgDailyQuest
  streak: number
  bestStreak: number
  seed: number
  tick: number
  frostEssence: number
}

// === ICE CREATURES (35) ===

export const CG_CREATURES: CgCreatureDef[] = [
  // Common (10)
  { id: 'ice_golem', name: 'Ice Golem', type: 'golem', rarity: CG_RARITY_COMMON, hp: 120, frostPower: 15, speed: 3, tamingCost: 50, description: 'A humanoid construct of packed ice and ancient glacial magic.', lore: 'Ice golems were first carved by the Crystal Monarchs to guard the cavern entrances.', icon: '🗿', color: '#a8d8ea' },
  { id: 'frost_sprite', name: 'Frost Sprite', type: 'spirit', rarity: CG_RARITY_COMMON, hp: 40, frostPower: 8, speed: 15, tamingCost: 30, description: 'A tiny mischievous spirit that leaves crystalline trails on everything it touches.', lore: 'Frost sprites are born from the breath of sleeping glaciers.', icon: '🧚', color: '#b8e6f0' },
  { id: 'winter_wolf', name: 'Winter Wolf', type: 'wolf', rarity: CG_RARITY_COMMON, hp: 80, frostPower: 20, speed: 25, tamingCost: 40, description: 'A fierce wolf with a pelt of hardened glacier ice and eyes of deep cyan.', lore: 'Winter wolves run in packs across the frozen tundra, their howls creating echoing ice harmonics.', icon: '🐺', color: '#89c2d9' },
  { id: 'frost_bear', name: 'Frost Bear', type: 'beast', rarity: CG_RARITY_COMMON, hp: 150, frostPower: 22, speed: 5, tamingCost: 55, description: 'An enormous bear with fur as white as fresh snow and claws of solid crystal.', lore: 'Frost bears hibernate for centuries. When they wake, the surrounding landscape is permanently changed.', icon: '🐻', color: '#b8e6f0' },
  { id: 'ice_moth', name: 'Ice Moth', type: 'insect', rarity: CG_RARITY_COMMON, hp: 25, frostPower: 5, speed: 20, tamingCost: 20, description: 'A delicate moth with wings made of thin ice that refracts moonlight into prisms.', lore: 'Ice moths swarm around crystal formations at night, creating mesmerizing light shows.', icon: '🦋', color: '#d4eaf7' },
  { id: 'crystal_beetle', name: 'Crystal Beetle', type: 'insect', rarity: CG_RARITY_COMMON, hp: 35, frostPower: 10, speed: 12, tamingCost: 25, description: 'A beetle with a crystalline carapace that reflects and refracts light.', lore: 'Crystal beetles are nature\'s gem polishers, their shells gradually smoothing rough stones.', icon: '🪲', color: '#a8d8ea' },
  { id: 'snow_hare', name: 'Snow Hare', type: 'beast', rarity: CG_RARITY_COMMON, hp: 30, frostPower: 6, speed: 28, tamingCost: 20, description: 'A swift arctic hare whose fur sparkles with embedded ice crystals.', lore: 'Snow hares can outrun avalanches by sensing tremors through their crystal-tipped paws.', icon: '🐇', color: '#e8f4f8' },
  { id: 'permafrost_worm', name: 'Permafrost Worm', type: 'serpent', rarity: CG_RARITY_COMMON, hp: 60, frostPower: 12, speed: 8, tamingCost: 35, description: 'A thick segmented worm that tunnels through permanently frozen ground.', lore: 'Permafrost worms create the intricate tunnel networks found beneath glacier caves.', icon: '🪱', color: '#7ec8e3' },
  { id: 'glacier_finch', name: 'Glacier Finch', type: 'avian', rarity: CG_RARITY_COMMON, hp: 20, frostPower: 4, speed: 30, tamingCost: 15, description: 'A tiny bird with feathers of thin ice crystals that shimmer in the light.', lore: 'Glacier finches are the only creatures that can fly through blizzards without losing their way.', icon: '🐦', color: '#b9f2ff' },
  { id: 'ice_newt', name: 'Ice Newt', type: 'aquatic', rarity: CG_RARITY_COMMON, hp: 25, frostPower: 8, speed: 10, tamingCost: 25, description: 'A small amphibian that swims through glacial meltwater streams.', lore: 'Ice newts can survive being completely frozen solid for decades and revive unharmed.', icon: '🦎', color: '#76d7ea' },
  // Unusual (8)
  { id: 'glacier_wolf_alpha', name: 'Glacier Wolf Alpha', type: 'wolf', rarity: CG_RARITY_UNUSUAL, hp: 110, frostPower: 30, speed: 28, tamingCost: 120, description: 'The pack leader of winter wolves, marked by silver-tipped fur and icy fangs.', lore: 'Glacier Wolf Alphas can summon the entire pack with a single subsonic howl.', icon: '🐺', color: '#5ab0cd' },
  { id: 'crystal_fox', name: 'Crystal Fox', type: 'beast', rarity: CG_RARITY_UNUSUAL, hp: 55, frostPower: 18, speed: 28, tamingCost: 100, description: 'A swift fox whose fur refracts light into dazzling crystal patterns.', lore: 'Crystal foxes are the messengers of the glacier, delivering frozen scrolls between zones.', icon: '🦊', color: '#7ec8e3' },
  { id: 'frost_elemental', name: 'Frost Elemental', type: 'elemental', rarity: CG_RARITY_UNUSUAL, hp: 100, frostPower: 32, speed: 15, tamingCost: 130, description: 'A living manifestation of pure cold energy, constantly shifting form.', lore: 'Frost elementals are the architects of the glacier, reshaping ice with a thought.', icon: '🌊', color: '#5fb8b0' },
  { id: 'ice_serpent', name: 'Ice Serpent', type: 'serpent', rarity: CG_RARITY_UNUSUAL, hp: 70, frostPower: 22, speed: 22, tamingCost: 110, description: 'A coiling serpent made of frozen mist that strikes with venomous frost.', lore: 'Ice serpents dwell in the frozen rivers beneath the glacier, guarding submerged crystal treasures.', icon: '🐉', color: '#6b8fa3' },
  { id: 'rime_stag', name: 'Rime Stag', type: 'beast', rarity: CG_RARITY_UNUSUAL, hp: 120, frostPower: 25, speed: 20, tamingCost: 115, description: 'A magnificent stag with antlers made of razor-sharp rime ice crystals.', lore: 'Rime Stags appear at the boundary between autumn and winter, heralding the first frost.', icon: '🦌', color: '#c0c8d4' },
  { id: 'glacial_turtle', name: 'Glacial Turtle', type: 'aquatic', rarity: CG_RARITY_UNUSUAL, hp: 160, frostPower: 12, speed: 4, tamingCost: 125, description: 'A slow-moving turtle with a shell made from thousand-year-old glacial ice.', lore: 'Glacial turtles carry miniature frozen ecosystems on their shells.', icon: '🐢', color: '#a8d8ea' },
  { id: 'crystal_mantis', name: 'Crystal Mantis', type: 'insect', rarity: CG_RARITY_UNUSUAL, hp: 45, frostPower: 28, speed: 24, tamingCost: 105, description: 'A predatory insect with scythes made of enchanted crystal that never dull.', lore: 'Crystal mantises are the apex predators of the glacier insect world.', icon: '🦗', color: '#5ab0cd' },
  { id: 'frost_owl', name: 'Frost Owl', type: 'avian', rarity: CG_RARITY_UNUSUAL, hp: 55, frostPower: 20, speed: 22, tamingCost: 110, description: 'An owl whose feathers are made of thin ice that refracts starlight.', lore: 'Frost owls can see in complete darkness by detecting thermal gradients in the ice.', icon: '🦉', color: '#b9f2ff' },
  // Rare (8)
  { id: 'permafrost_golem', name: 'Permafrost Golem', type: 'golem', rarity: CG_RARITY_RARE, hp: 200, frostPower: 35, speed: 2, tamingCost: 300, description: 'An ancient golem made from permanently frozen earth older than civilization.', lore: 'Permafrost golems contain fossils of creatures that lived before the first ice age.', icon: '🗿', color: '#4a6fa5' },
  { id: 'snow_dragon', name: 'Snow Dragon', type: 'dragon', rarity: CG_RARITY_RARE, hp: 180, frostPower: 38, speed: 20, tamingCost: 350, description: 'A majestic dragon with scales that shimmer like fresh snowfall in sunlight.', lore: 'Snow Dragons nest at the peaks of the highest mountains, only descending during the deepest winters.', icon: '🐲', color: '#d4eaf7' },
  { id: 'glacier_guardian', name: 'Glacier Guardian', type: 'golem', rarity: CG_RARITY_RARE, hp: 250, frostPower: 30, speed: 4, tamingCost: 370, description: 'A massive guardian carved from living glacier ice that regenerates endlessly.', lore: 'Glacier Guardians have stood watch over the Eternal Permafrost for millennia without moving.', icon: '🏔️', color: '#4a6fa5' },
  { id: 'crystal_wyvern', name: 'Crystal Wyvern', type: 'dragon', rarity: CG_RARITY_RARE, hp: 150, frostPower: 35, speed: 24, tamingCost: 340, description: 'A two-legged dragon covered in razor-sharp rime ice crystal plates.', lore: 'Crystal Wyverns patrol the skies above the glacier, diving on any approaching threat.', icon: '🦇', color: '#7ec8e3' },
  { id: 'winter_phoenix', name: 'Winter Phoenix', type: 'avian', rarity: CG_RARITY_RARE, hp: 130, frostPower: 40, speed: 30, tamingCost: 360, description: 'A phoenix reborn not from fire but from the heart of eternal winter.', lore: 'The Winter Phoenix dies when spring comes and is reborn at the first frost of autumn.', icon: '🦅', color: '#a8d8ea' },
  { id: 'frost_leviathan', name: 'Frost Leviathan', type: 'aquatic', rarity: CG_RARITY_RARE, hp: 220, frostPower: 32, speed: 12, tamingCost: 380, description: 'A massive serpentine creature that swims through underground glacial lakes.', lore: 'Frost Leviathans are worshiped by ice newts as living gods of the deep freeze.', icon: '🐋', color: '#5ab0cd' },
  { id: 'diamond_spider', name: 'Diamond Spider', type: 'insect', rarity: CG_RARITY_RARE, hp: 80, frostPower: 30, speed: 26, tamingCost: 310, description: 'A spider that spins webs of pure diamond-like crystal fiber.', lore: 'Diamond Spider silk is the most valuable material in the glacier, stronger than steel.', icon: '🕷️', color: '#b9f2ff' },
  { id: 'rime_giant', name: 'Rime Giant', type: 'golem', rarity: CG_RARITY_RARE, hp: 300, frostPower: 28, speed: 6, tamingCost: 395, description: 'A towering giant whose footsteps cause localized blizzards.', lore: 'Rime Giants were the original builders of the glacier tunnels, carving ice with their bare hands.', icon: '👹', color: '#6b8fa3' },
  // Epic (5)
  { id: 'blizzard_wyrm', name: 'Blizzard Wyrm', type: 'dragon', rarity: CG_RARITY_EPIC, hp: 220, frostPower: 48, speed: 18, tamingCost: 800, description: 'A serpentine dragon that lives inside raging blizzards, invisible to the naked eye.', lore: 'When a Blizzard Wyrm dies, the storm it inhabits continues for seven days and seven nights.', icon: '🐉', color: '#8e7cc3' },
  { id: 'ice_crown_bear', name: 'Ice Crown Bear', type: 'beast', rarity: CG_RARITY_EPIC, hp: 250, frostPower: 38, speed: 8, tamingCost: 850, description: 'A legendary frost bear with a crown of ice crystals growing from its skull.', lore: 'Only five Ice Crown Bears have ever been sighted. Each commands an entire frozen mountain.', icon: '🐻', color: '#5fb8b0' },
  { id: 'avalanche_golem', name: 'Avalanche Golem', type: 'golem', rarity: CG_RARITY_EPIC, hp: 280, frostPower: 35, speed: 5, tamingCost: 900, description: 'A colossal golem that embodies the destructive power of an avalanche.', lore: 'When an Avalanche Golem awakens, entire mountainsides crumble in its wake.', icon: '🗿', color: '#4a6fa5' },
  { id: 'frost_matriarch', name: 'Frost Matriarch', type: 'spirit', rarity: CG_RARITY_EPIC, hp: 110, frostPower: 45, speed: 18, tamingCost: 870, description: 'The queen of all frost spirits, commanding an army of ice and wind.', lore: 'The Frost Matriarch once froze an entire army mid-charge, preserving them as ice statues.', icon: '👸', color: '#b8a9c9' },
  { id: 'arctic_aurora_eagle', name: 'Arctic Aurora Eagle', type: 'avian', rarity: CG_RARITY_EPIC, hp: 90, frostPower: 42, speed: 35, tamingCost: 820, description: 'An eagle whose wings shimmer with captured aurora light, soaring above the highest peaks.', lore: 'Arctic Aurora Eagles can fly so high they touch the aurora borealis itself.', icon: '🦅', color: '#e8e0f0' },
  // Legendary (4)
  { id: 'aurora_wyrm', name: 'Aurora Wyrm', type: 'dragon', rarity: CG_RARITY_LEGENDARY, hp: 300, frostPower: 55, speed: 25, tamingCost: 2000, description: 'A magnificent dragon that channels the northern lights through its translucent body.', lore: 'The Aurora Wyrm appears only when all seven colors of the aurora align. Its cry shatters mountains.', icon: '🐲', color: '#b8a9c9' },
  { id: 'cryo_hydra', name: 'Cryo Hydra', type: 'serpent', rarity: CG_RARITY_LEGENDARY, hp: 350, frostPower: 50, speed: 15, tamingCost: 2200, description: 'A multi-headed serpent of pure crystal. Each severed head regrows stronger and colder.', lore: 'The Cryo Hydra sleeps beneath the glacier foundations. Its dreams are the source of every blizzard.', icon: '🐍', color: '#8e7cc3' },
  { id: 'eternal_frost_spirit', name: 'Eternal Frost Spirit', type: 'elemental', rarity: CG_RARITY_LEGENDARY, hp: 180, frostPower: 60, speed: 20, tamingCost: 2500, description: 'The primordial spirit of winter itself, older than the concept of seasons.', lore: 'Before the world had seasons, the Eternal Frost Spirit ruled all of existence in perpetual ice.', icon: '👻', color: '#e8e0f0' },
  { id: 'crystal_behemoth', name: 'Crystal Behemoth', type: 'golem', rarity: CG_RARITY_LEGENDARY, hp: 400, frostPower: 45, speed: 4, tamingCost: 2800, description: 'A mountain-sized golem composed entirely of enchanted diamond crystal.', lore: 'The Crystal Behemoth is said to be the first creature ever created by the glacier itself.', icon: '💎', color: '#b9f2ff' },
]

// === GLACIER ZONES (8) ===

export const CG_ZONES: CgZoneDef[] = [
  { id: 'crystal_cavern', name: 'Crystal Cavern', description: 'A vast underground cavern filled with naturally growing crystals of every color. The air hums with latent glacial energy.', unlockLevel: 1, ambientColor: '#a8d8ea', dangerLevel: 1, maxCreatures: 5, crystalReserve: 500, maxCrystalReserve: 1000, rewards: ['ice_golem', 'frost_sprite', 'frost_touch', 'crystal_shard_basic'] },
  { id: 'frozen_lake', name: 'Frozen Lake', description: 'A perfectly still lake frozen so clear you can see fish preserved in the ice below. Crystals grow along the shorelines.', unlockLevel: 5, ambientColor: '#7ec8e3', dangerLevel: 2, maxCreatures: 6, crystalReserve: 800, maxCrystalReserve: 2000, rewards: ['ice_newt', 'frost_leviathan', 'glacial_ray', 'frost_essence_minor'] },
  { id: 'permafrost_peak', name: 'Permafrost Peak', description: 'A towering mountain of permanently frozen earth where rare crystals form under extreme pressure deep underground.', unlockLevel: 10, ambientColor: '#4a6fa5', dangerLevel: 3, maxCreatures: 7, crystalReserve: 1200, maxCrystalReserve: 4000, rewards: ['permafrost_golem', 'rime_giant', 'diamond_fist', 'permafrost_core'] },
  { id: 'ice_cathedral', name: 'Ice Cathedral', description: 'A natural cathedral formed from enormous crystal spires, where ancient frost rituals were once performed.', unlockLevel: 8, ambientColor: '#b8a9c9', dangerLevel: 2, maxCreatures: 4, crystalReserve: 600, maxCrystalReserve: 1500, rewards: ['frost_elemental', 'frost_matriarch', 'crystal_resonance', 'aurora_shard'] },
  { id: 'glacial_maze', name: 'Glacial Maze', description: 'A shifting labyrinth of ice walls that rearrange themselves. Hidden crystal caches are scattered throughout.', unlockLevel: 15, ambientColor: '#5ab0cd', dangerLevel: 4, maxCreatures: 5, crystalReserve: 1000, maxCrystalReserve: 3000, rewards: ['diamond_spider', 'ice_serpent', 'maze_freeze', 'glacial_mote'] },
  { id: 'diamond_depths', name: 'Diamond Depths', description: 'The deepest level of the glacier, where pressure creates flawless diamond crystals worth a fortune.', unlockLevel: 20, ambientColor: '#b9f2ff', dangerLevel: 4, maxCreatures: 4, crystalReserve: 900, maxCrystalReserve: 2500, rewards: ['blizzard_wyrm', 'crystal_wyvern', 'diamond_storm', 'pure_diamond'] },
  { id: 'aurora_field', name: 'Aurora Field', description: 'A high-altitude plateau where the aurora borealis touches the earth, infusing crystals with magical light.', unlockLevel: 12, ambientColor: '#e8e0f0', dangerLevel: 2, maxCreatures: 3, crystalReserve: 400, maxCrystalReserve: 1200, rewards: ['arctic_aurora_eagle', 'winter_phoenix', 'aurora_healing', 'prismatic_dust'] },
  { id: 'eternal_permafrost', name: 'Eternal Permafrost', description: 'The deepest and most sacred zone — ancient permafrost that predates the glacier itself. Legendary creatures dwell within.', unlockLevel: 30, ambientColor: '#4a6fa5', dangerLevel: 5, maxCreatures: 8, crystalReserve: 2000, maxCrystalReserve: 8000, rewards: ['aurora_wyrm', 'cryo_hydra', 'eternal_frost_spirit', 'primordial_crystal'] },
]

// === CRYSTAL MATERIALS (30) ===

export const CG_MATERIALS: CgMaterialDef[] = [
  // Gems (8)
  { id: 'frost_quartz', name: 'Frost Quartz', category: 'gem', rarity: CG_RARITY_COMMON, harvestYield: 3, frostValue: 5, description: 'A common translucent quartz infused with mild frost energy.', lore: 'Frost quartz is the most abundant crystal in the cavern, used in basic glacial crafts.', icon: '💎', color: '#a8d8ea' },
  { id: 'ice_sapphire', name: 'Ice Sapphire', category: 'gem', rarity: CG_RARITY_UNUSUAL, harvestYield: 2, frostValue: 15, description: 'A deep blue sapphire that radiates cold to the touch.', lore: 'Ice sapphires form only in areas where the temperature never rises above freezing.', icon: '💠', color: '#5ab0cd' },
  { id: 'glacier_emerald', name: 'Glacier Emerald', category: 'gem', rarity: CG_RARITY_RARE, harvestYield: 1, frostValue: 40, description: 'An emerald green gem found in the deepest ice tunnels.', lore: 'Glacier emeralds glow faintly green in the dark, serving as natural lanterns for explorers.', icon: '💚', color: '#5fb8b0' },
  { id: 'aurora_diamond', name: 'Aurora Diamond', category: 'gem', rarity: CG_RARITY_EPIC, harvestYield: 1, frostValue: 80, description: 'A flawless diamond that displays all aurora colors when held to light.', lore: 'Only one Aurora Diamond is found per century, formed where aurora light meets glacier ice.', icon: '🔶', color: '#b8a9c9' },
  { id: 'primordial_crystal', name: 'Primordial Crystal', category: 'gem', rarity: CG_RARITY_LEGENDARY, harvestYield: 1, frostValue: 200, description: 'A crystal from the dawn of time, containing the essence of creation itself.', lore: 'Primordial Crystals are said to be fragments of the first ice that ever formed on earth.', icon: '👑', color: '#e8e0f0' },
  { id: 'rime_ruby', name: 'Rime Ruby', category: 'gem', rarity: CG_RARITY_UNUSUAL, harvestYield: 2, frostValue: 12, description: 'A ruby tinged with frost, warm to the eye but freezing to the touch.', lore: 'Rime rubies paradoxically generate heat internally while their surface is below zero.', icon: '❤️‍🧊', color: '#d4605a' },
  { id: 'permafrost_topaz', name: 'Permafrost Topaz', category: 'gem', rarity: CG_RARITY_RARE, harvestYield: 1, frostValue: 35, description: 'A golden topaz preserved in perfect condition within ancient permafrost.', lore: 'Permafrost topaz is valued for its ability to store and release frost energy on command.', icon: '💛', color: '#c0a84a' },
  { id: 'arctic_amethyst', name: 'Arctic Amethyst', category: 'gem', rarity: CG_RARITY_RARE, harvestYield: 1, frostValue: 30, description: 'A purple amethyst found only in arctic purple light zones.', lore: 'Arctic amethysts sing faintly when the temperature drops below negative fifty.', icon: '💜', color: '#8e7cc3' },
  // Shards (6)
  { id: 'crystal_shard_basic', name: 'Basic Crystal Shard', category: 'shard', rarity: CG_RARITY_COMMON, harvestYield: 5, frostValue: 2, description: 'A small shard of crystallized ice, useful for basic crafting.', lore: 'Basic crystal shards are the foundation of all glacial crafting.', icon: '🔹', color: '#a8d8ea' },
  { id: 'frost_shard', name: 'Frost Shard', category: 'shard', rarity: CG_RARITY_COMMON, harvestYield: 4, frostValue: 3, description: 'A shard imbued with frost energy, sharper than steel.', lore: 'Frost shards are used as arrowheads and blade edges by glacier dwellers.', icon: '🔸', color: '#b8e6f0' },
  { id: 'glacier_shard', name: 'Glacier Shard', category: 'shard', rarity: CG_RARITY_UNUSUAL, harvestYield: 3, frostValue: 8, description: 'A shard from ancient glacial ice, containing compressed frost magic.', lore: 'Glacier shards retain their magical properties for centuries after being harvested.', icon: '🔷', color: '#7ec8e3' },
  { id: 'diamond_shard', name: 'Diamond Shard', category: 'shard', rarity: CG_RARITY_RARE, harvestYield: 2, frostValue: 25, description: 'A razor-sharp shard of natural diamond-grade crystal.', lore: 'Diamond shards are the key ingredient in crafting legendary frost weapons.', icon: '💠', color: '#b9f2ff' },
  { id: 'aurora_shard', name: 'Aurora Shard', category: 'shard', rarity: CG_RARITY_EPIC, harvestYield: 1, frostValue: 60, description: 'A shard that pulses with aurora light, shifting colors endlessly.', lore: 'Aurora shards are formed when the aurora borealis physically touches glacier surfaces.', icon: '🌈', color: '#b8a9c9' },
  { id: 'prismatic_shard', name: 'Prismatic Shard', category: 'shard', rarity: CG_RARITY_LEGENDARY, harvestYield: 1, frostValue: 150, description: 'A shard containing all colors simultaneously, bending light in impossible ways.', lore: 'Looking into a Prismatic Shard shows you visions of every frozen world that exists.', icon: '✨', color: '#e8e0f0' },
  // Ores (5)
  { id: 'glacial_iron', name: 'Glacial Iron Ore', category: 'ore', rarity: CG_RARITY_COMMON, harvestYield: 4, frostValue: 4, description: 'Iron ore infused with frost-resistant properties from millennia in ice.', lore: 'Glacial iron is the primary building material for all glacier structures.', icon: '⛏️', color: '#6b8fa3' },
  { id: 'frost_silver', name: 'Frost Silver Ore', category: 'ore', rarity: CG_RARITY_UNUSUAL, harvestYield: 3, frostValue: 10, description: 'Silver ore that has been naturally purified by glacial pressure.', lore: 'Frost silver conducts frost energy perfectly, making it ideal for enchanted circuits.', icon: '🪙', color: '#c0c8d4' },
  { id: 'permafrost_gold', name: 'Permafrost Gold Ore', category: 'ore', rarity: CG_RARITY_RARE, harvestYield: 2, frostValue: 30, description: 'Gold extracted from permafrost veins, imbued with ancient frost magic.', lore: 'Permafrost gold never tarnishes and glows with a soft cold light.', icon: '🥇', color: '#c0a84a' },
  { id: 'cryo_platinum', name: 'Cryo Platinum', category: 'ore', rarity: CG_RARITY_EPIC, harvestYield: 1, frostValue: 70, description: 'An ultra-rare platinum that becomes harder the colder it gets.', lore: 'Cryo Platinum is used in the most advanced glacial technology.', icon: '⚪', color: '#a8d8ea' },
  { id: 'eternal_titanium', name: 'Eternal Titanium', category: 'ore', rarity: CG_RARITY_LEGENDARY, harvestYield: 1, frostValue: 180, description: 'A metal of extraterrestrial origin found only in the deepest permafrost.', lore: 'Eternal Titanium is believed to have fallen from the sky in the ice age that created the glacier.', icon: '🌑', color: '#4a6fa5' },
  // Crystals (5)
  { id: 'frost_crystal', name: 'Frost Crystal', category: 'crystal', rarity: CG_RARITY_COMMON, harvestYield: 3, frostValue: 6, description: 'A naturally formed crystal that stores basic frost energy.', lore: 'Frost crystals are the lifeblood of the glacier ecosystem.', icon: '❄️', color: '#76d7ea' },
  { id: 'glacier_crystal', name: 'Glacier Crystal', category: 'crystal', rarity: CG_RARITY_UNUSUAL, harvestYield: 2, frostValue: 15, description: 'A large crystal grown from compressed glacial ice over thousands of years.', lore: 'Glacier crystals pulse with a slow heartbeat-like rhythm.', icon: '🔷', color: '#5ab0cd' },
  { id: 'diamond_crystal', name: 'Diamond Crystal', category: 'crystal', rarity: CG_RARITY_RARE, harvestYield: 1, frostValue: 45, description: 'A crystal that has been compressed to near-diamond hardness.', lore: 'Diamond crystals are the hardest natural substance in the frozen world.', icon: '💎', color: '#b9f2ff' },
  { id: 'aurora_crystal', name: 'Aurora Crystal', category: 'crystal', rarity: CG_RARITY_EPIC, harvestYield: 1, frostValue: 90, description: 'A crystal infused with aurora borealis energy, shifting colors endlessly.', lore: 'Aurora crystals can project images of distant frozen lands.', icon: '🌟', color: '#b8a9c9' },
  { id: 'primordial_crystal_mat', name: 'Primordial Crystal', category: 'crystal', rarity: CG_RARITY_LEGENDARY, harvestYield: 1, frostValue: 250, description: 'A crystal from the beginning of time itself, radiating pure creation energy.', lore: 'The original Primordial Crystal is said to be the seed from which the glacier grew.', icon: '👑', color: '#e8e0f0' },
  // Dust (3)
  { id: 'crystal_dust', name: 'Crystal Dust', category: 'dust', rarity: CG_RARITY_COMMON, harvestYield: 8, frostValue: 1, description: 'Fine powder from crushed crystals, used in alchemy and crafting.', lore: 'Crystal dust is the currency of trade between glacier settlements.', icon: '✨', color: '#d4eaf7' },
  { id: 'glacial_dust', name: 'Glacial Dust', category: 'dust', rarity: CG_RARITY_UNUSUAL, harvestYield: 5, frostValue: 5, description: 'Dust from ground glacier ice, retaining potent frost properties.', lore: 'Glacial dust is sprinkled on crops in arctic villages to extend the growing season.', icon: '🌬️', color: '#a8d8ea' },
  { id: 'aurora_dust', name: 'Aurora Dust', category: 'dust', rarity: CG_RARITY_EPIC, harvestYield: 2, frostValue: 40, description: 'Luminescent dust shed by aurora crystals, glowing with soft light.', lore: 'Aurora dust is used in the most powerful frost rituals and enchantments.', icon: '🌟', color: '#b8a9c9' },
  // Essences (3)
  { id: 'frost_essence_minor', name: 'Minor Frost Essence', category: 'essence', rarity: CG_RARITY_UNUSUAL, harvestYield: 2, frostValue: 12, description: 'Concentrated frost energy extracted from ice creatures.', lore: 'Minor frost essences are used to power basic glacier machinery.', icon: '🧪', color: '#7ec8e3' },
  { id: 'permafrost_core', name: 'Permafrost Core', category: 'essence', rarity: CG_RARITY_RARE, harvestYield: 1, frostValue: 50, description: 'The dense core of ancient permafrost, pulsing with frozen energy.', lore: 'Permafrost cores are the power source for the largest glacier structures.', icon: '🔮', color: '#4a6fa5' },
  { id: 'glacial_mote', name: 'Glacial Mote', category: 'essence', rarity: CG_RARITY_EPIC, harvestYield: 1, frostValue: 65, description: 'A mote of pure glacial energy, glowing with inner light.', lore: 'Glacial motes are said to be the dreams of sleeping ice gods.', icon: '💫', color: '#5fb8b0' },
]

// === GLACIER STRUCTURES (25) ===

export const CG_STRUCTURES: CgStructureDef[] = [
  { id: 'crystal_mine_alpha', name: 'Alpha Crystal Mine', type: 'mine', zoneId: 'crystal_cavern', buildCost: 100, buildTime: 60, harvestBonus: 10, frostBonus: 2, description: 'A basic mine extracting common crystals from the cavern walls.', icon: '⛏️', levelReq: 1, maxLevel: 10 },
  { id: 'crystal_mine_beta', name: 'Beta Crystal Mine', type: 'mine', zoneId: 'crystal_cavern', buildCost: 150, buildTime: 80, harvestBonus: 12, frostBonus: 2, description: 'A deeper mine shaft reaching richer crystal veins.', icon: '⛏️', levelReq: 3, maxLevel: 10 },
  { id: 'frost_sculpture_garden', name: 'Frost Sculpture Garden', type: 'sculpture', zoneId: 'crystal_cavern', buildCost: 200, buildTime: 100, harvestBonus: 5, frostBonus: 5, description: 'A gallery of ice sculptures that generate ambient frost energy.', icon: '🎨', levelReq: 5, maxLevel: 10 },
  { id: 'glacial_fishing_hut', name: 'Glacial Fishing Hut', type: 'workshop', zoneId: 'frozen_lake', buildCost: 120, buildTime: 60, harvestBonus: 8, frostBonus: 3, description: 'A sheltered hut for ice fishing and gathering frozen lake crystals.', icon: '🏠', levelReq: 5, maxLevel: 10 },
  { id: 'lake_crystal_drill', name: 'Lake Crystal Drill', type: 'mine', zoneId: 'frozen_lake', buildCost: 250, buildTime: 120, harvestBonus: 15, frostBonus: 4, description: 'A drill platform that extracts crystals from beneath the frozen lake bed.', icon: '🔩', levelReq: 8, maxLevel: 10 },
  { id: 'permafrost_excavator', name: 'Permafrost Excavator', type: 'mine', zoneId: 'permafrost_peak', buildCost: 350, buildTime: 150, harvestBonus: 20, frostBonus: 6, description: 'Heavy excavating equipment powered by frost energy for deep mining.', icon: '🚜', levelReq: 10, maxLevel: 10 },
  { id: 'peak_observation_tower', name: 'Peak Observation Tower', type: 'observatory', zoneId: 'permafrost_peak', buildCost: 300, buildTime: 130, harvestBonus: 5, frostBonus: 10, description: 'A tower offering views of approaching storms and crystal formation events.', icon: '🗼', levelReq: 12, maxLevel: 10 },
  { id: 'cathedral_altar', name: 'Cathedral Crystal Altar', type: 'altar', zoneId: 'ice_cathedral', buildCost: 400, buildTime: 180, harvestBonus: 8, frostBonus: 15, description: 'A sacred altar where crystals can be infused with ancient frost magic.', icon: '⛪', levelReq: 8, maxLevel: 10 },
  { id: 'ritual_forge', name: 'Ritual Frost Forge', type: 'forge', zoneId: 'ice_cathedral', buildCost: 450, buildTime: 200, harvestBonus: 10, frostBonus: 12, description: 'A forge that uses frost rituals to shape and enchant crystal materials.', icon: '🔨', levelReq: 12, maxLevel: 10 },
  { id: 'cathedral_library', name: 'Crystal Cathedral Library', type: 'workshop', zoneId: 'ice_cathedral', buildCost: 350, buildTime: 160, harvestBonus: 3, frostBonus: 8, description: 'A library of ice-carved tablets containing ancient frost knowledge.', icon: '📚', levelReq: 10, maxLevel: 10 },
  { id: 'maze_navigation_beacon', name: 'Maze Navigation Beacon', type: 'observatory', zoneId: 'glacial_maze', buildCost: 200, buildTime: 90, harvestBonus: 5, frostBonus: 8, description: 'A beacon that helps navigate the shifting walls of the Glacial Maze.', icon: '📡', levelReq: 15, maxLevel: 10 },
  { id: 'maze_crystal_trap', name: 'Maze Crystal Trap', type: 'mine', zoneId: 'glacial_maze', buildCost: 280, buildTime: 120, harvestBonus: 18, frostBonus: 5, description: 'Automated crystal harvesters placed throughout the maze corridors.', icon: '⚠️', levelReq: 16, maxLevel: 10 },
  { id: 'diamond_extraction_rig', name: 'Diamond Extraction Rig', type: 'mine', zoneId: 'diamond_depths', buildCost: 600, buildTime: 250, harvestBonus: 25, frostBonus: 8, description: 'A massive rig for extracting diamond-grade crystals from extreme depths.', icon: '🏗️', levelReq: 20, maxLevel: 10 },
  { id: 'depths_pressure_chamber', name: 'Depths Pressure Chamber', type: 'forge', zoneId: 'diamond_depths', buildCost: 500, buildTime: 220, harvestBonus: 12, frostBonus: 15, description: 'Uses extreme pressure to fuse materials into new crystalline forms.', icon: '⚗️', levelReq: 22, maxLevel: 10 },
  { id: 'aurora_collector', name: 'Aurora Light Collector', type: 'observatory', zoneId: 'aurora_field', buildCost: 400, buildTime: 180, harvestBonus: 15, frostBonus: 20, description: 'Collects aurora light and converts it into crystalline energy.', icon: '🌟', levelReq: 12, maxLevel: 10 },
  { id: 'aurora_shrine', name: 'Aurora Worship Shrine', type: 'shrine', zoneId: 'aurora_field', buildCost: 350, buildTime: 160, harvestBonus: 8, frostBonus: 18, description: 'A shrine where aurora spirits gather, granting blessings to the faithful.', icon: '⛩️', levelReq: 14, maxLevel: 10 },
  { id: 'eternal_shrine', name: 'Eternal Frost Shrine', type: 'shrine', zoneId: 'eternal_permafrost', buildCost: 800, buildTime: 350, harvestBonus: 10, frostBonus: 30, description: 'The most sacred shrine in the glacier, radiating ancient frost power.', icon: '⛪', levelReq: 30, maxLevel: 10 },
  { id: 'permafrost_vault', name: 'Permafrost Vault', type: 'vault', zoneId: 'eternal_permafrost', buildCost: 700, buildTime: 300, harvestBonus: 5, frostBonus: 25, description: 'A vault that preserves the rarest crystals in perfect condition indefinitely.', icon: '🏦', levelReq: 32, maxLevel: 10 },
  { id: 'ice_bridge_north', name: 'Northern Ice Bridge', type: 'bridge', zoneId: 'crystal_cavern', buildCost: 150, buildTime: 90, harvestBonus: 3, frostBonus: 4, description: 'A bridge of enchanted ice connecting cavern sections safely.', icon: '🌉', levelReq: 2, maxLevel: 10 },
  { id: 'ice_bridge_south', name: 'Southern Ice Bridge', type: 'bridge', zoneId: 'frozen_lake', buildCost: 180, buildTime: 100, harvestBonus: 3, frostBonus: 4, description: 'A reinforced ice bridge spanning the frozen lake\'s deepest crevasse.', icon: '🌉', levelReq: 6, maxLevel: 10 },
  { id: 'crystal_greenhouse', name: 'Crystal Greenhouse', type: 'workshop', zoneId: 'aurora_field', buildCost: 250, buildTime: 120, harvestBonus: 12, frostBonus: 10, description: 'A greenhouse where cryo crystals are cultivated from aurora-infused soil.', icon: '🏡', levelReq: 13, maxLevel: 10 },
  { id: 'frostwork_armory', name: 'Frostwork Armory', type: 'forge', zoneId: 'permafrost_peak', buildCost: 400, buildTime: 180, harvestBonus: 5, frostBonus: 12, description: 'An armory where crystal weapons and ice armor are crafted.', icon: '⚔️', levelReq: 11, maxLevel: 10 },
  { id: 'glacier_storage_vault', name: 'Glacier Storage Vault', type: 'vault', zoneId: 'diamond_depths', buildCost: 350, buildTime: 160, harvestBonus: 2, frostBonus: 8, description: 'A secure vault for storing harvested materials and crafted items.', icon: '📦', levelReq: 18, maxLevel: 10 },
  { id: 'ancient_frost_observatory', name: 'Ancient Frost Observatory', type: 'observatory', zoneId: 'eternal_permafrost', buildCost: 600, buildTime: 280, harvestBonus: 8, frostBonus: 22, description: 'An observatory built by ancient glacier dwellers to study the stars through ice.', icon: '🔭', levelReq: 28, maxLevel: 10 },
  { id: 'master_sculpture_studio', name: 'Master Sculpture Studio', type: 'sculpture', zoneId: 'ice_cathedral', buildCost: 300, buildTime: 140, harvestBonus: 6, frostBonus: 10, description: 'A studio for master ice sculptors to create works of frozen art.', icon: '🎨', levelReq: 9, maxLevel: 10 },
]

// === FROST ABILITIES (22) ===

export const CG_ABILITIES: CgAbilityDef[] = [
  { id: 'frost_touch', name: 'Frost Touch', school: 'crystal', rarity: CG_RARITY_COMMON, power: 12, manaCost: 5, cooldown: 1, unlockLevel: 1, description: 'A basic ability that crystallizes the surface of anything touched.', icon: '🧊', color: '#a8d8ea' },
  { id: 'ice_shard_bolt', name: 'Ice Shard Bolt', school: 'crystal', rarity: CG_RARITY_COMMON, power: 18, manaCost: 8, cooldown: 2, unlockLevel: 1, description: 'Launches a volley of razor-sharp crystal shards at the target.', icon: '❄️', color: '#7ec8e3' },
  { id: 'frozen_armor', name: 'Frozen Crystal Armor', school: 'glacial', rarity: CG_RARITY_COMMON, power: 0, manaCost: 10, cooldown: 3, unlockLevel: 2, description: 'Encases the caster in a protective layer of hardened crystal.', icon: '🛡️', color: '#a8d8ea' },
  { id: 'crystal_resonance', name: 'Crystal Resonance', school: 'crystal', rarity: CG_RARITY_UNUSUAL, power: 22, manaCost: 7, cooldown: 2, unlockLevel: 3, description: 'Causes nearby crystals to vibrate and shatter, dealing damage.', icon: '💠', color: '#5ab0cd' },
  { id: 'glacial_ray', name: 'Glacial Ray', school: 'glacial', rarity: CG_RARITY_UNUSUAL, power: 25, manaCost: 12, cooldown: 3, unlockLevel: 5, description: 'Fires a concentrated beam of glacial energy that freezes targets solid.', icon: '🔵', color: '#7ec8e3' },
  { id: 'permafrost_bind', name: 'Permafrost Bind', school: 'permafrost', rarity: CG_RARITY_RARE, power: 20, manaCost: 16, cooldown: 3, unlockLevel: 7, description: 'Roots the target in place with ancient permafrost that never melts.', icon: '⛓️', color: '#6b8fa3' },
  { id: 'aurora_healing', name: 'Aurora Healing', school: 'aurora', rarity: CG_RARITY_RARE, power: -30, manaCost: 20, cooldown: 4, unlockLevel: 10, description: 'Wraps the target in aurora light that mends wounds and restores vitality.', icon: '💚', color: '#b8a9c9' },
  { id: 'frost_nova', name: 'Frost Nova', school: 'frost', rarity: CG_RARITY_RARE, power: 45, manaCost: 25, cooldown: 4, unlockLevel: 10, description: 'Releases a shockwave of absolute cold in all directions.', icon: '💥', color: '#a8d8ea' },
  { id: 'crystal_shatter', name: 'Crystal Shatter', school: 'crystal', rarity: CG_RARITY_RARE, power: 40, manaCost: 18, cooldown: 3, unlockLevel: 9, description: 'Creates crystals around the target and detonates them simultaneously.', icon: '💎', color: '#5ab0cd' },
  { id: 'diamond_fist', name: 'Diamond Fist', school: 'crystal', rarity: CG_RARITY_RARE, power: 35, manaCost: 14, cooldown: 2, unlockLevel: 11, description: 'Encases the fist in diamond-hard crystal for devastating melee strikes.', icon: '✊', color: '#b9f2ff' },
  { id: 'maze_freeze', name: 'Maze Freeze', school: 'glacial', rarity: CG_RARITY_EPIC, power: 50, manaCost: 30, cooldown: 5, unlockLevel: 15, description: 'Creates an ice labyrinth around enemies, trapping them in frozen walls.', icon: '🏰', color: '#4a6fa5' },
  { id: 'diamond_storm', name: 'Diamond Storm', school: 'crystal', rarity: CG_RARITY_EPIC, power: 65, manaCost: 38, cooldown: 7, unlockLevel: 18, description: 'Summons a hurricane of razor-sharp diamond crystals.', icon: '🌪️', color: '#b9f2ff' },
  { id: 'aurora_veil', name: 'Aurora Veil', school: 'aurora', rarity: CG_RARITY_RARE, power: 0, manaCost: 22, cooldown: 5, unlockLevel: 8, description: 'Wraps allies in a shimmering aurora that deflects attacks and heals.', icon: '🌈', color: '#b8a9c9' },
  { id: 'permafrost_avalanche', name: 'Permafrost Avalanche', school: 'permafrost', rarity: CG_RARITY_LEGENDARY, power: 90, manaCost: 55, cooldown: 12, unlockLevel: 30, description: 'Triggers a catastrophic avalanche of ancient frozen earth.', icon: '🏔️', color: '#4a6fa5' },
  { id: 'frost_sculpt', name: 'Frost Sculpt', school: 'glacial', rarity: CG_RARITY_COMMON, power: 8, manaCost: 6, cooldown: 2, unlockLevel: 2, description: 'Shapes ice into sculptures that generate ambient frost energy.', icon: '🎨', color: '#a8d8ea' },
  { id: 'ice_prison', name: 'Ice Prison', school: 'glacial', rarity: CG_RARITY_RARE, power: 10, manaCost: 22, cooldown: 5, unlockLevel: 11, description: 'Encloses the target in an inescapable dome of thick crystal ice.', icon: '🔒', color: '#c0c8d4' },
  { id: 'rime_arrow', name: 'Rime Arrow', school: 'rime', rarity: CG_RARITY_UNUSUAL, power: 20, manaCost: 10, cooldown: 2, unlockLevel: 6, description: 'Fires an arrow of pure rime that slows and damages the target.', icon: '🏹', color: '#6b8fa3' },
  { id: 'glacier_charge', name: 'Glacier Charge', school: 'glacial', rarity: CG_RARITY_EPIC, power: 70, manaCost: 35, cooldown: 6, unlockLevel: 17, description: 'Surrounds the caster with a glacier and charges forward, crushing everything.', icon: '🏔️', color: '#7ec8e3' },
  { id: 'absolute_zero', name: 'Absolute Zero', school: 'permafrost', rarity: CG_RARITY_LEGENDARY, power: 80, manaCost: 50, cooldown: 10, unlockLevel: 20, description: 'Drops the temperature to absolute zero, shattering matter at the molecular level.', icon: '🔵', color: '#4a6fa5' },
  { id: 'crystal_bloom', name: 'Crystal Bloom', school: 'crystal', rarity: CG_RARITY_COMMON, power: -15, manaCost: 6, cooldown: 2, unlockLevel: 3, description: 'Summons beautiful crystal flowers that heal allies in their radius.', icon: '🌸', color: '#d4eaf7' },
  { id: 'primordial_awakening', name: 'Primordial Awakening', school: 'permafrost', rarity: CG_RARITY_LEGENDARY, power: 100, manaCost: 60, cooldown: 15, unlockLevel: 35, description: 'Awakens the primordial crystal power within, unleashing devastating ancient magic.', icon: '👑', color: '#e8e0f0' },
  { id: 'aurora_blessing', name: 'Aurora Blessing', school: 'aurora', rarity: CG_RARITY_EPIC, power: -40, manaCost: 28, cooldown: 6, unlockLevel: 16, description: 'Channels aurora energy to fully restore all allies and boost frost power.', icon: '🌟', color: '#b8a9c9' },
]

// === FUSION RECIPES (8) ===

export const CG_FUSION_RECIPES: CgFusionRecipe[] = [
  { id: 'fusion_crystal_shard', name: 'Crystal Shard Fusion', tier: CG_FUSION_TIER_BASIC, materialIds: ['crystal_shard_basic', 'frost_shard'], resultMaterialId: 'glacier_shard', frostPowerBonus: 10, description: 'Combine basic shards to create a stronger glacier shard.', icon: '🔶' },
  { id: 'fusion_frost_gems', name: 'Frost Gem Fusion', tier: CG_FUSION_TIER_BASIC, materialIds: ['frost_quartz', 'rime_ruby'], resultMaterialId: 'ice_sapphire', frostPowerBonus: 20, description: 'Fuse quartz and ruby to create an ice sapphire.', icon: '💠' },
  { id: 'fusion_glacier_crystal', name: 'Glacier Crystal Synthesis', tier: CG_FUSION_TIER_ENHANCED, materialIds: ['frost_crystal', 'glacier_shard'], resultMaterialId: 'glacier_crystal', frostPowerBonus: 30, description: 'Synthesize a glacier crystal from frost crystal and glacier shards.', icon: '🔷' },
  { id: 'fusion_rare_gem', name: 'Rare Gem Transmutation', tier: CG_FUSION_TIER_ENHANCED, materialIds: ['ice_sapphire', 'glacier_emerald'], resultMaterialId: 'diamond_crystal', frostPowerBonus: 50, description: 'Transmute rare gems into a diamond crystal of immense value.', icon: '💎' },
  { id: 'fusion_diamond_shard', name: 'Diamond Shard Crafting', tier: CG_FUSION_TIER_SUPERIOR, materialIds: ['diamond_crystal', 'glacier_crystal'], resultMaterialId: 'diamond_shard', frostPowerBonus: 70, description: 'Craft razor-sharp diamond shards from pure diamond crystals.', icon: '✨' },
  { id: 'fusion_aurora_materials', name: 'Aurora Material Fusion', tier: CG_FUSION_TIER_SUPERIOR, materialIds: ['aurora_shard', 'aurora_dust'], resultMaterialId: 'aurora_crystal', frostPowerBonus: 90, description: 'Fuse aurora components into a complete aurora crystal.', icon: '🌈' },
  { id: 'fusion_primordial', name: 'Primordial Transcendence', tier: CG_FUSION_TIER_TRANSCENDENT, materialIds: ['aurora_diamond', 'permafrost_core'], resultMaterialId: 'primordial_crystal_mat', frostPowerBonus: 150, description: 'Transcend mortal materials to create a primordial crystal.', icon: '👑' },
  { id: 'fusion_eternal', name: 'Eternal Frost Fusion', tier: CG_FUSION_TIER_PRIMORDIAL, materialIds: ['primordial_crystal_mat', 'eternal_titanium'], resultMaterialId: 'primordial_crystal', frostPowerBonus: 250, description: 'The ultimate fusion, creating a crystal from the dawn of time itself.', icon: '🌟' },
]

// === QUEST TYPES ===

export const CG_QUEST_TYPES = [
  { id: 'crystal_harvest', name: 'Crystal Harvest', description: 'Harvest crystals from unlocked zones.', crystalsRequired: 10, creaturesRequired: 0, sculpturesRequired: 0, coins: 30, xp: 40, icon: '⛏️' },
  { id: 'creature_tame', name: 'Creature Taming', description: 'Tame frost beasts found in the glacier.', crystalsRequired: 0, creaturesRequired: 2, sculpturesRequired: 0, coins: 45, xp: 60, icon: '🐾' },
  { id: 'sculpt_master', name: 'Sculpt Master', description: 'Complete ice sculptures to practice crystal shaping.', crystalsRequired: 5, creaturesRequired: 0, sculpturesRequired: 3, coins: 40, xp: 55, icon: '🎨' },
  { id: 'deep_expedition', name: 'Deep Expedition', description: 'Explore the deeper glacier zones for rare finds.', crystalsRequired: 20, creaturesRequired: 1, sculpturesRequired: 0, coins: 65, xp: 90, icon: '🧭' },
  { id: 'fusion_ritual', name: 'Fusion Ritual', description: 'Perform frost fusion to create advanced materials.', crystalsRequired: 15, creaturesRequired: 0, sculpturesRequired: 0, coins: 55, xp: 75, icon: '⚗️' },
] as const

export const CG_QUEST_DIFFICULTY_CONFIG: Record<CgQuestDifficulty, { multiplier: number; bonusCoins: number; bonusXp: number }> = {
  easy: { multiplier: 1, bonusCoins: 0, bonusXp: 0 },
  moderate: { multiplier: 1.5, bonusCoins: 15, bonusXp: 20 },
  hard: { multiplier: 2, bonusCoins: 30, bonusXp: 45 },
  extreme: { multiplier: 3, bonusCoins: 60, bonusXp: 90 },
  mythic: { multiplier: 5, bonusCoins: 120, bonusXp: 200 },
}

export const CG_REWARD_CONFIG = {
  harvest: { baseCoins: 5, perRarity: { common: 1, unusual: 3, rare: 8, epic: 20, legendary: 50 } },
  tame: { baseXp: 30, perLevelBonus: 5 },
  sculpture: { baseCoins: 8, perQuality: 4 },
  fusion: { baseXp: 50, frostBonus: 10 },
  dailyQuest: { baseCoins: 25, perQuestLevel: 15, streakBonus: 10 },
  achievementBonus: { base: 0, multiplier: 1.0 },
} as const

// === TYPE ICON RECORDS ===

export const CG_CREATURE_TYPE_ICONS: Record<CgCreatureType, string> = {
  golem: '🗿', wolf: '🐺', dragon: '🐲', beast: '🦁', spirit: '🧚',
  serpent: '🐉', insect: '🦗', avian: '🦅', aquatic: '🐋', elemental: '🌊',
}

export const CG_MATERIAL_CATEGORY_ICONS: Record<CgMaterialCategory, string> = {
  gem: '💎', shard: '🔹', ore: '⛏️', crystal: '❄️', dust: '✨', essence: '🧪',
}

export const CG_STRUCTURE_TYPE_ICONS: Record<CgStructureType, string> = {
  mine: '⛏️', sculpture: '🎨', altar: '⛪', forge: '🔨', shrine: '⛩️',
  tower: '🗼', bridge: '🌉', vault: '🏦', observatory: '🔭', workshop: '🔧',
}

export const CG_ABILITY_SCHOOL_ICONS: Record<CgAbilitySchool, string> = {
  crystal: '💎', glacial: '🏔️', permafrost: '💠', frost: '❄️', aurora: '🌈', rime: '🧊',
}

export const CG_ZONE_ICONS: Record<CgZoneId, string> = {
  crystal_cavern: '🪨', frozen_lake: '❄️', permafrost_peak: '🏔️', ice_cathedral: '⛪',
  glacial_maze: '🌀', diamond_depths: '💎', aurora_field: '🌈', eternal_permafrost: '🏔️',
}

// === LEVEL TITLES (8) ===

export const CG_TITLES: CgTitleDef[] = [
  { level: 1, title: 'Ice Walker', description: 'A novice explorer taking their first steps into the frozen world.', icon: '🧊' },
  { level: 5, title: 'Frost Gatherer', description: 'An experienced collector of crystals and frost materials.', icon: '💎' },
  { level: 10, title: 'Crystal Sculptor', description: 'A skilled artisan who shapes ice into beautiful and functional forms.', icon: '🎨' },
  { level: 15, title: 'Glacier Explorer', description: 'A brave explorer venturing into the deeper, more dangerous glacier zones.', icon: '🧭' },
  { level: 20, title: 'Frost Beast Tamer', description: 'A master tamer who commands a stable of powerful frost creatures.', icon: '🐾' },
  { level: 30, title: 'Diamond Sovereign', description: 'A ruler of the diamond depths, wielding power over the rarest crystals.', icon: '💠' },
  { level: 40, title: 'Aurora Warden', description: 'A guardian of the aurora, channeling its light to protect the glacier.', icon: '🌈' },
  { level: 50, title: 'Crystal Monarch', description: 'The supreme ruler of the Crystal Glacier, master of all frost and crystal.', icon: '👑' },
]

// === ACHIEVEMENTS (18) ===

export const CG_ACHIEVEMENTS: CgAchievementDef[] = [
  { id: 'first_tame', name: 'First Companion', description: 'Tame your first frost creature.', condition: 'totalCreaturesTamed >= 1', rewardXp: 50, rewardCoins: 20, hidden: false, icon: '🐾' },
  { id: 'creature_5', name: 'Small Menagerie', description: 'Tame 5 different frost creatures.', condition: 'creatures >= 5', rewardXp: 100, rewardCoins: 50, hidden: false, icon: '❄️' },
  { id: 'creature_15', name: 'Growing Pack', description: 'Tame 15 different frost creatures.', condition: 'creatures >= 15', rewardXp: 300, rewardCoins: 150, hidden: false, icon: '🐺' },
  { id: 'creature_35', name: 'Full Bestiary', description: 'Tame all 35 frost creatures.', condition: 'creatures >= 35', rewardXp: 1500, rewardCoins: 500, hidden: true, icon: '👑' },
  { id: 'harvest_100', name: 'Crystal Collector', description: 'Harvest 100 total crystals.', condition: 'totalCrystalsHarvested >= 100', rewardXp: 80, rewardCoins: 40, hidden: false, icon: '💎' },
  { id: 'harvest_500', name: 'Harvest Master', description: 'Harvest 500 total crystals.', condition: 'totalCrystalsHarvested >= 500', rewardXp: 300, rewardCoins: 200, hidden: false, icon: '🪨' },
  { id: 'harvest_2000', name: 'Glacier Titan', description: 'Harvest 2000 total crystals.', condition: 'totalCrystalsHarvested >= 2000', rewardXp: 1000, rewardCoins: 500, hidden: false, icon: '🏔️' },
  { id: 'sculpt_10', name: 'Novice Sculptor', description: 'Complete 10 ice sculptures.', condition: 'totalSculpturesCompleted >= 10', rewardXp: 150, rewardCoins: 80, hidden: false, icon: '🎨' },
  { id: 'sculpt_50', name: 'Master Sculptor', description: 'Complete 50 ice sculptures.', condition: 'totalSculpturesCompleted >= 50', rewardXp: 500, rewardCoins: 300, hidden: true, icon: '🎭' },
  { id: 'material_10', name: 'Resourceful', description: 'Collect 10 different material types.', condition: 'materials >= 10', rewardXp: 150, rewardCoins: 80, hidden: false, icon: '📦' },
  { id: 'material_30', name: 'Hoarder Supreme', description: 'Collect all 30 material types.', condition: 'materials >= 30', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '🏦' },
  { id: 'build_10', name: 'Glacier Architect', description: 'Build 10 glacier structures.', condition: 'structures >= 10', rewardXp: 200, rewardCoins: 100, hidden: false, icon: '🏗️' },
  { id: 'build_25', name: 'Grand Architect', description: 'Build all 25 glacier structures.', condition: 'structures >= 25', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '🏰' },
  { id: 'ability_10', name: 'Frost Scholar', description: 'Learn 10 different frost abilities.', condition: 'abilities >= 10', rewardXp: 200, rewardCoins: 100, hidden: false, icon: '📖' },
  { id: 'ability_22', name: 'Grand Cryomancer', description: 'Learn all 22 frost abilities.', condition: 'abilities >= 22', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '🧙' },
  { id: 'fusion_5', name: 'Fusion Apprentice', description: 'Perform 5 frost fusions.', condition: 'totalFusionsPerformed >= 5', rewardXp: 150, rewardCoins: 80, hidden: false, icon: '⚗️' },
  { id: 'streak_7', name: 'Weekly Devotion', description: 'Maintain a 7-day quest streak.', condition: 'streak >= 7', rewardXp: 300, rewardCoins: 150, hidden: false, icon: '📅' },
  { id: 'legendary_creature', name: 'Mythic Tamer', description: 'Tame a legendary frost creature.', condition: 'legendary >= 1', rewardXp: 500, rewardCoins: 250, hidden: false, icon: '⭐' },
]

// === MAX LEVEL & XP TABLE ===

export const CG_MAX_LEVEL = 50

export const CG_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= CG_MAX_LEVEL; i++) {
    table[i] = Math.floor(90 * Math.pow(i, 1.34) + i * 20)
  }
  return table
})()

// === DEFAULT STATE ===

function cgCreateDefaultState(): CrystalGlacierState {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 100,
    totalCoinsEarned: 100,
    creatures: [],
    materials: CG_MATERIALS.map(m => ({ materialId: m.id, owned: false, quantity: 0, harvestedAt: null })),
    zones: CG_ZONES.map(z => ({
      zoneId: z.id,
      unlocked: z.unlockLevel <= 1,
      crystalReserve: z.unlockLevel <= 1 ? z.crystalReserve : 0,
      maxCrystalReserve: z.maxCrystalReserve,
      creaturesDeployed: 0,
      totalHarvests: 0,
      lastExploredAt: null,
    })),
    structures: CG_STRUCTURES.map(s => ({ structureId: s.id, built: false, level: 0, builtAt: null })),
    abilities: CG_ABILITIES.map(a => ({ abilityId: a.id, learned: a.unlockLevel <= 1, mastery: 0, castCount: 0 })),
    achievements: CG_ACHIEVEMENTS.map(a => ({ achievementId: a.id, unlocked: false, unlockedAt: null })),
    title: CG_TITLES[0].title,
    totalCreaturesTamed: 0,
    totalCreaturesDeployed: 0,
    totalCrystalsHarvested: 0,
    totalSculpturesCompleted: 0,
    totalFusionsPerformed: 0,
    totalAbilitiesCast: 0,
    totalAchievements: 0,
    totalStructuresBuilt: 0,
    dailyQuest: { date: todayKey, completed: false, crystalsHarvested: 0, creaturesTamed: 0, sculpturesCompleted: 0, coinsEarned: 0, xpEarned: 0 },
    streak: 0,
    bestStreak: 0,
    seed: Date.now(),
    tick: 0,
    frostEssence: 10,
  }
}

// === HELPER FUNCTIONS (module-level) ===

function cgGetTitleForLevel(level: number): string {
  let title = CG_TITLES[0].title
  for (const t of CG_TITLES) {
    if (level >= t.level) title = t.title
  }
  return title
}

function cgGetXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= CG_MAX_LEVEL) return Infinity
  return CG_XP_TABLE[level] ?? 100
}

function cgGetTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

function cgGetPreviousDayKey(todayKey: string): string {
  const parts = todayKey.split('-').map(Number)
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  date.setDate(date.getDate() - 1)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function cgRandomFromSeed(seed: number, index: number): number {
  let s = seed + index * 2654435761
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s ^= s >>> 16
  return (s >>> 0) / 4294967296
}

// === HOOK ===

export default function useCrystalGlacier() {
  const stateRef = useRef<CrystalGlacierState>(cgCreateDefaultState())
  const [state, setState] = useState<CrystalGlacierState>(() => {
    if (typeof window === 'undefined') return cgCreateDefaultState()
    try {
      const saved = localStorage.getItem('crystal-glacier-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...cgCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return cgCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('crystal-glacier-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === COMPUTED VALUES (useMemo) ===

  const xpProgress = useMemo(() => {
    const needed = cgGetXpRequiredForLevel(state.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xp / needed)
  }, [state.level, state.xp])

  const overallProgress = useMemo(() => state.level / CG_MAX_LEVEL, [state.level])

  const unlockedZoneCount = useMemo(() => state.zones.filter(z => z.unlocked).length, [state.zones])

  const deployedCreatures = useMemo(() => state.creatures.filter(c => c.deployed).length, [state.creatures])

  const totalFrostPower = useMemo(() => {
    const creaturePower = state.creatures.reduce((sum, c) => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      return sum + (def ? def.frostPower + c.level * 2 : 0)
    }, 0)
    const structureBonus = state.structures.filter(s => s.built).reduce((sum, s) => {
      const def = CG_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.frostBonus * (s.level + 1) : 0)
    }, 0)
    const materialBonus = state.materials.filter(m => m.owned).reduce((sum, m) => {
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      return sum + (def ? def.frostValue * m.quantity : 0)
    }, 0)
    return creaturePower + structureBonus + Math.floor(materialBonus / 10)
  }, [state.creatures, state.structures, state.materials])

  const creatureCount = useMemo(() => state.creatures.length, [state.creatures])

  const legendaryCreatureCount = useMemo(() => {
    return state.creatures.filter(c => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      return def && def.rarity === CG_RARITY_LEGENDARY
    }).length
  }, [state.creatures])

  const materialCount = useMemo(() => state.materials.filter(m => m.owned).length, [state.materials])

  const learnedAbilityCount = useMemo(() => state.abilities.filter(a => a.learned).length, [state.abilities])

  const builtStructureCount = useMemo(() => state.structures.filter(s => s.built).length, [state.structures])

  const unlockedAchievementCount = useMemo(() => state.achievements.filter(a => a.unlocked).length, [state.achievements])

  const questCompletedToday = useMemo(() => {
    return state.dailyQuest.date === cgGetTodayKey() && state.dailyQuest.completed
  }, [state.dailyQuest])

  // === SIMPLE GETTERS ===

  const cgGetLevel = (): number => state.level
  const cgGetXp = (): number => state.xp
  const cgGetTotalXp = (): number => state.totalXp
  const cgGetCoins = (): number => state.coins
  const cgGetTitle = (): string => state.title
  const cgGetFrostEssence = (): number => state.frostEssence
  const cgGetCreatures = (): CgCreatureEntity[] => state.creatures
  const cgGetMaterials = (): CgMaterialEntity[] => state.materials
  const cgGetZones = (): CgZoneEntity[] => state.zones
  const cgGetStructures = (): CgStructureEntity[] => state.structures
  const cgGetAbilities = (): CgAbilityEntity[] => state.abilities
  const cgGetAchievements = (): CgAchievementEntity[] => state.achievements
  const cgGetStreak = (): number => state.streak
  const cgGetBestStreak = (): number => state.bestStreak
  const cgGetDailyQuest = (): CgDailyQuest => state.dailyQuest
  const cgGetTotalCreaturesTamed = (): number => state.totalCreaturesTamed
  const cgGetTotalCrystalsHarvested = (): number => state.totalCrystalsHarvested
  const cgGetTotalSculpturesCompleted = (): number => state.totalSculpturesCompleted
  const cgGetTotalFusionsPerformed = (): number => state.totalFusionsPerformed
  const cgGetTotalAbilitiesCast = (): number => state.totalAbilitiesCast
  const cgGetXpRequired = (): number => cgGetXpRequiredForLevel(state.level)

  // === LOOKUP HELPERS ===

  const cgGetCreatureDef = useCallback((creatureId: string): CgCreatureDef | null => {
    return CG_CREATURES.find(c => c.id === creatureId) ?? null
  }, [])

  const cgGetMaterialDef = useCallback((materialId: string): CgMaterialDef | null => {
    return CG_MATERIALS.find(m => m.id === materialId) ?? null
  }, [])

  const cgGetZoneDef = useCallback((zoneId: string): CgZoneDef | null => {
    return CG_ZONES.find(z => z.id === zoneId) ?? null
  }, [])

  const cgGetStructureDef = useCallback((structureId: string): CgStructureDef | null => {
    return CG_STRUCTURES.find(s => s.id === structureId) ?? null
  }, [])

  const cgGetAbilityDef = useCallback((abilityId: string): CgAbilityDef | null => {
    return CG_ABILITIES.find(a => a.id === abilityId) ?? null
  }, [])

  const cgGetAchievementDef = useCallback((achievementId: string): CgAchievementDef | null => {
    return CG_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null
  }, [])

  const cgGetRarityColor = useCallback((rarity: CgRarity): string => CG_RARITY_COLORS[rarity] ?? CG_COLOR_ICE_BLUE, [])
  const cgGetRarityIcon = useCallback((rarity: CgRarity): string => CG_RARITY_ICONS[rarity] ?? '💎', [])
  const cgGetRarityName = useCallback((rarity: CgRarity): string => {
    const names: Record<CgRarity, string> = { common: 'Common', unusual: 'Unusual', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }
    return names[rarity] ?? 'Unknown'
  }, [])

  // === STATE MODIFIERS (useCallback) ===

  const cgAddXp = useCallback((amount: number) => {
    setState(prev => {
      let { level, xp, totalXp } = prev
      const gained = Math.floor(amount)
      xp += gained
      totalXp += gained
      while (level < CG_MAX_LEVEL && xp >= cgGetXpRequiredForLevel(level)) {
        xp -= cgGetXpRequiredForLevel(level)
        level += 1
      }
      if (level >= CG_MAX_LEVEL) xp = 0
      const title = cgGetTitleForLevel(level)
      const newZones = prev.zones.map(z => {
        const def = CG_ZONES.find(d => d.id === z.zoneId)
        if (!def) return z
        if (level >= def.unlockLevel && !z.unlocked) {
          return { ...z, unlocked: true, crystalReserve: Math.max(z.crystalReserve, def.crystalReserve) }
        }
        return z
      })
      const newAbilities = prev.abilities.map(a => {
        const def = CG_ABILITIES.find(d => d.id === a.abilityId)
        if (!def) return a
        if (level >= def.unlockLevel && !a.learned) {
          return { ...a, learned: true }
        }
        return a
      })
      return { ...prev, level: Math.min(level, CG_MAX_LEVEL), xp, totalXp, title, zones: newZones, abilities: newAbilities }
    })
  }, [])

  const cgAddCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }))
  }, [])

  const cgSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins < amount) return prev
      success = true
      return { ...prev, coins: prev.coins - amount }
    })
    return success
  }, [])

  const cgAddFrostEssence = useCallback((amount: number) => {
    setState(prev => ({ ...prev, frostEssence: prev.frostEssence + amount }))
  }, [])

  const cgSpendFrostEssence = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.frostEssence < amount) return prev
      success = true
      return { ...prev, frostEssence: prev.frostEssence - amount }
    })
    return success
  }, [])

  const cgTameCreature = useCallback((creatureId: string): boolean => {
    let success = false
    setState(prev => {
      const def = CG_CREATURES.find(c => c.id === creatureId)
      if (!def) return prev
      if (prev.coins < def.tamingCost) return prev
      if (prev.creatures.some(c => c.creatureId === creatureId)) return prev
      success = true
      const newCreature: CgCreatureEntity = {
        creatureId: def.id,
        nickname: def.name,
        level: 1,
        xp: 0,
        hp: def.hp,
        maxHp: def.hp,
        deployed: false,
        zoneId: null,
        tamedAt: Date.now(),
      }
      return {
        ...prev,
        coins: prev.coins - def.tamingCost,
        creatures: [...prev.creatures, newCreature],
        totalCreaturesTamed: prev.totalCreaturesTamed + 1,
      }
    })
    return success
  }, [])

  const cgDeployCreature = useCallback((creatureId: string, zoneId: CgZoneId): boolean => {
    let success = false
    setState(prev => {
      const zone = prev.zones.find(z => z.zoneId === zoneId)
      if (!zone || !zone.unlocked) return prev
      const zoneDef = CG_ZONES.find(z => z.id === zoneId)
      if (!zoneDef) return prev
      if (zone.creaturesDeployed >= zoneDef.maxCreatures) return prev
      const creatureIdx = prev.creatures.findIndex(c => c.creatureId === creatureId)
      if (creatureIdx === -1) return prev
      if (prev.creatures[creatureIdx].deployed) return prev
      success = true
      const newCreatures = [...prev.creatures]
      newCreatures[creatureIdx] = { ...newCreatures[creatureIdx], deployed: true, zoneId }
      const newZones = prev.zones.map(z => {
        if (z.zoneId === zoneId) return { ...z, creaturesDeployed: z.creaturesDeployed + 1 }
        return z
      })
      return { ...prev, creatures: newCreatures, zones: newZones, totalCreaturesDeployed: prev.totalCreaturesDeployed + 1 }
    })
    return success
  }, [])

  const cgRecallCreature = useCallback((creatureId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.creatures.findIndex(c => c.creatureId === creatureId)
      if (idx === -1) return prev
      if (!prev.creatures[idx].deployed) return prev
      const zoneId = prev.creatures[idx].zoneId
      success = true
      const newCreatures = [...prev.creatures]
      newCreatures[idx] = { ...newCreatures[idx], deployed: false, zoneId: null }
      const newZones = zoneId ? prev.zones.map(z => {
        if (z.zoneId === zoneId) return { ...z, creaturesDeployed: Math.max(0, z.creaturesDeployed - 1) }
        return z
      }) : prev.zones
      return { ...prev, creatures: newCreatures, zones: newZones }
    })
    return success
  }, [])

  const cgTrainCreature = useCallback((creatureId: string, xpAmount: number) => {
    setState(prev => {
      const newCreatures = prev.creatures.map(c => {
        if (c.creatureId !== creatureId) return c
        const def = CG_CREATURES.find(d => d.id === creatureId)
        if (!def) return c
        let newLevel = c.level
        let newXp = c.xp + xpAmount
        const xpNeeded = 50 + newLevel * 30
        while (newXp >= xpNeeded && newLevel < 50) {
          newXp -= xpNeeded
          newLevel += 1
        }
        const newMaxHp = def.hp + (newLevel - 1) * 12
        return { ...c, level: newLevel, xp: newXp, maxHp: newMaxHp, hp: newMaxHp }
      })
      return { ...prev, creatures: newCreatures }
    })
  }, [])

  const cgRenameCreature = useCallback((creatureId: string, nickname: string) => {
    setState(prev => ({
      ...prev,
      creatures: prev.creatures.map(c => c.creatureId === creatureId ? { ...c, nickname } : c),
    }))
  }, [])

  const cgReleaseCreature = useCallback((creatureId: string): boolean => {
    let success = false
    setState(prev => {
      const creature = prev.creatures.find(c => c.creatureId === creatureId)
      if (!creature) return prev
      success = true
      const newZones = creature.zoneId
        ? prev.zones.map(z => z.zoneId === creature.zoneId ? { ...z, creaturesDeployed: Math.max(0, z.creaturesDeployed - 1) } : z)
        : prev.zones
      return { ...prev, creatures: prev.creatures.filter(c => c.creatureId !== creatureId), zones: newZones }
    })
    return success
  }, [])

  const cgHarvestCrystal = useCallback((zoneId: CgZoneId, amount: number): number => {
    let harvested = 0
    setState(prev => {
      const newZones = prev.zones.map(z => {
        if (z.zoneId !== zoneId || !z.unlocked) return z
        const actual = Math.min(amount, z.crystalReserve)
        harvested = actual
        return { ...z, crystalReserve: z.crystalReserve - actual, totalHarvests: z.totalHarvests + 1, lastExploredAt: Date.now() }
      })
      return { ...prev, zones: newZones, frostEssence: prev.frostEssence + harvested, totalCrystalsHarvested: prev.totalCrystalsHarvested + harvested }
    })
    return harvested
  }, [])

  const cgCollectMaterial = useCallback((materialId: string): boolean => {
    let success = false
    setState(prev => {
      const def = CG_MATERIALS.find(m => m.id === materialId)
      if (!def) return prev
      success = true
      return {
        ...prev,
        materials: prev.materials.map(m => m.materialId === materialId ? { ...m, owned: true, quantity: m.quantity + def.harvestYield, harvestedAt: Date.now() } : m),
      }
    })
    return success
  }, [])

  const cgSpendMaterial = useCallback((materialId: string, amount: number): boolean => {
    let success = false
    setState(prev => {
      return {
        ...prev,
        materials: prev.materials.map(m => {
          if (m.materialId !== materialId) return m
          if (m.quantity < amount) return m
          success = true
          return { ...m, quantity: m.quantity - amount, owned: m.quantity - amount > 0 }
        }),
      }
    })
    return success
  }, [])

  const cgBuildStructure = useCallback((structureId: string): boolean => {
    let success = false
    setState(prev => {
      const def = CG_STRUCTURES.find(s => s.id === structureId)
      if (!def) return prev
      if (prev.coins < def.buildCost) return prev
      if (prev.level < def.levelReq) return prev
      const existing = prev.structures.find(s => s.structureId === structureId)
      if (existing && existing.built) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - def.buildCost,
        structures: prev.structures.map(s => s.structureId === structureId ? { ...s, built: true, level: 1, builtAt: Date.now() } : s),
        totalStructuresBuilt: prev.totalStructuresBuilt + 1,
      }
    })
    return success
  }, [])

  const cgUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false
    setState(prev => {
      const def = CG_STRUCTURES.find(s => s.id === structureId)
      if (!def) return prev
      const entity = prev.structures.find(s => s.structureId === structureId)
      if (!entity || !entity.built) return prev
      if (entity.level >= def.maxLevel) return prev
      const cost = Math.floor(def.buildCost * 0.6 * entity.level)
      if (prev.coins < cost) return prev
      success = true
      return {
        ...prev,
        coins: prev.coins - cost,
        structures: prev.structures.map(s => s.structureId === structureId ? { ...s, level: s.level + 1 } : s),
      }
    })
    return success
  }, [])

  const cgLearnAbility = useCallback((abilityId: string): boolean => {
    let success = false
    setState(prev => {
      const def = CG_ABILITIES.find(a => a.id === abilityId)
      if (!def) return prev
      if (prev.level < def.unlockLevel) return prev
      const entity = prev.abilities.find(a => a.abilityId === abilityId)
      if (!entity || entity.learned) return prev
      success = true
      return {
        ...prev,
        abilities: prev.abilities.map(a => a.abilityId === abilityId ? { ...a, learned: true } : a),
      }
    })
    return success
  }, [])

  const cgCastAbility = useCallback((abilityId: string): boolean => {
    let success = false
    setState(prev => {
      const entity = prev.abilities.find(a => a.abilityId === abilityId)
      if (!entity || !entity.learned) return prev
      success = true
      const newMastery = Math.min(100, entity.mastery + 1)
      return {
        ...prev,
        abilities: prev.abilities.map(a => a.abilityId === abilityId ? { ...a, castCount: a.castCount + 1, mastery: newMastery } : a),
        totalAbilitiesCast: prev.totalAbilitiesCast + 1,
      }
    })
    return success
  }, [])

  const cgCompleteSculpture = useCallback(() => {
    setState(prev => ({
      ...prev,
      totalSculpturesCompleted: prev.totalSculpturesCompleted + 1,
      coins: prev.coins + 15,
      totalCoinsEarned: prev.totalCoinsEarned + 15,
    }))
  }, [])

  const cgPerformFusion = useCallback((recipeId: string): boolean => {
    let success = false
    setState(prev => {
      const recipe = CG_FUSION_RECIPES.find(r => r.id === recipeId)
      if (!recipe) return prev
      for (const matId of recipe.materialIds) {
        const matEntity = prev.materials.find(m => m.materialId === matId)
        if (!matEntity || !matEntity.owned || matEntity.quantity < 1) return prev
      }
      success = true
      const newMaterials = prev.materials.map(m => {
        if (recipe.materialIds.includes(m.materialId)) {
          const newQty = m.quantity - 1
          return { ...m, quantity: newQty, owned: newQty > 0 }
        }
        if (m.materialId === recipe.resultMaterialId) {
          return { ...m, owned: true, quantity: m.quantity + 1, harvestedAt: Date.now() }
        }
        return m
      })
      const resultDef = CG_MATERIALS.find(m => m.id === recipe.resultMaterialId)
      const xpGain = resultDef ? resultDef.frostValue * 2 : 50
      return {
        ...prev,
        materials: newMaterials,
        totalFusionsPerformed: prev.totalFusionsPerformed + 1,
        frostEssence: prev.frostEssence + recipe.frostPowerBonus,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
      }
    })
    return success
  }, [])

  const cgCompleteDailyQuest = useCallback((crystalsHarvested: number, creaturesTamed: number, sculpturesCompleted: number) => {
    setState(prev => {
      const todayKey = cgGetTodayKey()
      const coinsEarned = 25 + crystalsHarvested * 2 + creaturesTamed * 10 + sculpturesCompleted * 5
      const xpEarned = 30 + crystalsHarvested + creaturesTamed * 8 + sculpturesCompleted * 4
      const prevDayKey = cgGetPreviousDayKey(todayKey)
      const wasYesterday = prev.dailyQuest.date === prevDayKey && prev.dailyQuest.completed
      const newStreak = wasYesterday ? prev.streak + 1 : 1
      const newBestStreak = Math.max(prev.bestStreak, newStreak)
      return {
        ...prev,
        dailyQuest: { date: todayKey, completed: true, crystalsHarvested, creaturesTamed, sculpturesCompleted, coinsEarned: coinsEarned + (newStreak * 10), xpEarned: xpEarned + (newStreak * 5) },
        coins: prev.coins + coinsEarned + (newStreak * 10),
        totalCoinsEarned: prev.totalCoinsEarned + coinsEarned + (newStreak * 10),
        streak: newStreak,
        bestStreak: newBestStreak,
        xp: prev.xp + xpEarned + (newStreak * 5),
        totalXp: prev.totalXp + xpEarned + (newStreak * 5),
      }
    })
  }, [])

  const cgUnlockAchievement = useCallback((achievementId: string): boolean => {
    let success = false
    setState(prev => {
      const entity = prev.achievements.find(a => a.achievementId === achievementId)
      if (!entity || entity.unlocked) return prev
      const def = CG_ACHIEVEMENTS.find(a => a.id === achievementId)
      if (!def) return prev
      success = true
      return {
        ...prev,
        achievements: prev.achievements.map(a => a.achievementId === achievementId ? { ...a, unlocked: true, unlockedAt: Date.now() } : a),
        totalAchievements: prev.totalAchievements + 1,
        xp: prev.xp + def.rewardXp,
        totalXp: prev.totalXp + def.rewardXp,
        coins: prev.coins + def.rewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + def.rewardCoins,
      }
    })
    return success
  }, [])

  const cgCheckAchievements = useCallback((): string[] => {
    const s = stateRef.current
    const newlyUnlocked: string[] = []
    for (const ach of CG_ACHIEVEMENTS) {
      const entity = s.achievements.find(a => a.achievementId === ach.id)
      if (entity && entity.unlocked) continue
      let conditionMet = false
      const cond = ach.condition
      if (cond.startsWith('totalCreaturesTamed')) { conditionMet = s.totalCreaturesTamed >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('creatures')) { conditionMet = s.creatures.length >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('totalCrystalsHarvested')) { conditionMet = s.totalCrystalsHarvested >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('totalSculpturesCompleted')) { conditionMet = s.totalSculpturesCompleted >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('materials')) { conditionMet = s.materials.filter(m => m.owned).length >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('structures')) { conditionMet = s.structures.filter(st => st.built).length >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('abilities')) { conditionMet = s.abilities.filter(a => a.learned).length >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('streak')) { conditionMet = s.streak >= parseInt(cond.split('>= ')[1]) }
      else if (cond.startsWith('legendary')) { conditionMet = s.creatures.filter(c => { const d = CG_CREATURES.find(dd => dd.id === c.creatureId); return d && d.rarity === CG_RARITY_LEGENDARY }).length >= 1 }
      if (conditionMet) {
        newlyUnlocked.push(ach.id)
        cgUnlockAchievement(ach.id)
      }
    }
    return newlyUnlocked
  }, [cgUnlockAchievement])

  const cgReplenishZoneCrystals = useCallback((zoneId: CgZoneId) => {
    setState(prev => ({
      ...prev,
      zones: prev.zones.map(z => {
        if (z.zoneId !== zoneId) return z
        const def = CG_ZONES.find(d => d.id === zoneId)
        if (!def) return z
        return { ...z, crystalReserve: Math.min(z.crystalReserve + 50, z.maxCrystalReserve) }
      }),
    }))
  }, [])

  // === FILTER HELPERS ===

  const cgGetCreaturesByRarity = useCallback((rarity: CgRarity): CgCreatureEntity[] => {
    return stateRef.current.creatures.filter(c => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      return def && def.rarity === rarity
    })
  }, [])

  const cgGetCreaturesByType = useCallback((type: CgCreatureType): CgCreatureEntity[] => {
    return stateRef.current.creatures.filter(c => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      return def && def.type === type
    })
  }, [])

  const cgGetCreaturesInZone = useCallback((zoneId: CgZoneId): CgCreatureEntity[] => {
    return stateRef.current.creatures.filter(c => c.zoneId === zoneId && c.deployed)
  }, [])

  const cgGetMaterialsByCategory = useCallback((category: CgMaterialCategory): CgMaterialEntity[] => {
    return stateRef.current.materials.filter(m => {
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      return def && def.category === category
    })
  }, [])

  const cgGetStructuresByZone = useCallback((zoneId: CgZoneId): CgStructureEntity[] => {
    return stateRef.current.structures.filter(s => {
      const def = CG_STRUCTURES.find(d => d.id === s.structureId)
      return def && def.zoneId === zoneId && s.built
    })
  }, [])

  const cgGetAbilitiesBySchool = useCallback((school: CgAbilitySchool): CgAbilityEntity[] => {
    return stateRef.current.abilities.filter(a => {
      const def = CG_ABILITIES.find(d => d.id === a.abilityId)
      return def && def.school === school
    })
  }, [])

  const cgTameRandomCreature = useCallback((): CgCreatureDef | null => {
    const s = stateRef.current
    const owned = new Set(s.creatures.map(c => c.creatureId))
    const available = CG_CREATURES.filter(c => !owned.has(c.id) && s.coins >= c.tamingCost)
    if (available.length === 0) return null
    const totalWeight = available.reduce((sum, c) => sum + CG_RARITY_DROP_WEIGHTS[c.rarity], 0)
    let roll = cgRandomFromSeed(s.seed, s.tick) * totalWeight
    for (const c of available) {
      roll -= CG_RARITY_DROP_WEIGHTS[c.rarity]
      if (roll <= 0) {
        cgTameCreature(c.id)
        return c
      }
    }
    return null
  }, [cgTameCreature])

  // === ADVANCED COMPUTED VALUES (useMemo) ===

  const crystalHarvestStats = useMemo((): Record<CgZoneId, { reserve: number; maxReserve: number; totalHarvests: number; percent: number }> => {
    const stats = {} as Record<CgZoneId, { reserve: number; maxReserve: number; totalHarvests: number; percent: number }>
    for (const z of state.zones) {
      stats[z.zoneId] = {
        reserve: z.crystalReserve,
        maxReserve: z.maxCrystalReserve,
        totalHarvests: z.totalHarvests,
        percent: z.maxCrystalReserve > 0 ? Math.floor((z.crystalReserve / z.maxCrystalReserve) * 100) : 0,
      }
    }
    return stats
  }, [state.zones])

  const creatureRarityBreakdown = useMemo((): Record<CgRarity, number> => {
    const breakdown: Record<CgRarity, number> = { common: 0, unusual: 0, rare: 0, epic: 0, legendary: 0 }
    for (const c of state.creatures) {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      if (def) breakdown[def.rarity] += 1
    }
    return breakdown
  }, [state.creatures])

  const structureLevelStats = useMemo(() => {
    const built = state.structures.filter(s => s.built)
    const totalLevels = built.reduce((sum, s) => sum + s.level, 0)
    const maxLevels = built.reduce((sum, s) => {
      const def = CG_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.maxLevel : 10)
    }, 0)
    return { built: built.length, total: CG_STRUCTURES.length, totalLevels, maxLevels, avgLevel: built.length > 0 ? Math.floor(totalLevels / built.length) : 0 }
  }, [state.structures])

  const abilityMasteryStats = useMemo(() => {
    const learned = state.abilities.filter(a => a.learned)
    const totalMastery = learned.reduce((sum, a) => sum + a.mastery, 0)
    const mastered = learned.filter(a => a.mastery >= 100).length
    return { learnedCount: learned.length, avgMastery: learned.length > 0 ? Math.floor(totalMastery / learned.length) : 0, masteredCount: mastered, total: CG_ABILITIES.length }
  }, [state.abilities])

  const materialCollectionProgress = useMemo(() => {
    const owned = state.materials.filter(m => m.owned).length
    const totalFrostValue = state.materials.reduce((sum, m) => {
      if (!m.owned) return sum
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      return sum + (def ? def.frostValue * m.quantity : 0)
    }, 0)
    return { owned, total: CG_MATERIALS.length, percent: Math.floor((owned / CG_MATERIALS.length) * 100), totalFrostValue }
  }, [state.materials])

  const nextLevelXpInfo = useMemo(() => {
    if (state.level >= CG_MAX_LEVEL) return { required: 0, remaining: 0, percent: 100 }
    const required = cgGetXpRequiredForLevel(state.level)
    return { required, remaining: Math.max(0, required - state.xp), percent: Math.floor((state.xp / required) * 100) }
  }, [state.level, state.xp])

  const powerRank = useMemo(() => {
    const p = totalFrostPower
    if (p >= 10000) return { rank: 'Mythic', tier: 5, icon: '🌟', color: '#e8e0f0' }
    if (p >= 5000) return { rank: 'Legendary', tier: 4, icon: '👑', color: '#b8a9c9' }
    if (p >= 2000) return { rank: 'Epic', tier: 3, icon: '💎', color: '#5ab0cd' }
    if (p >= 800) return { rank: 'Rare', tier: 2, icon: '💠', color: '#7ec8e3' }
    if (p >= 200) return { rank: 'Unusual', tier: 1, icon: '❄️', color: '#a8d8ea' }
    return { rank: 'Common', tier: 0, icon: '🧊', color: '#a8d8ea' }
  }, [totalFrostPower])

  const dailyIncomeRate = useMemo(() => {
    const structureIncome = state.structures.filter(s => s.built).reduce((sum, s) => {
      const def = CG_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.harvestBonus * s.level : 0)
    }, 0)
    const creatureBonus = state.creatures.filter(c => c.deployed).reduce((sum, c) => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      return sum + (def ? Math.floor(def.frostPower / 5) : 0)
    }, 0)
    return { base: structureIncome, bonus: creatureBonus, total: structureIncome + creatureBonus }
  }, [state.structures, state.creatures])

  // === ADVANCED FUNCTIONS ===

  const cgGetGlacierOverview = useCallback(() => {
    const s = stateRef.current
    return {
      level: s.level,
      title: s.title,
      frostPower: totalFrostPower,
      creatures: s.creatures.length,
      materials: s.materials.filter(m => m.owned).length,
      structures: s.structures.filter(st => st.built).length,
      abilities: s.abilities.filter(a => a.learned).length,
      achievements: s.achievements.filter(a => a.unlocked).length,
      zones: s.zones.filter(z => z.unlocked).length,
      coins: s.coins,
      frostEssence: s.frostEssence,
      streak: s.streak,
    }
  }, [totalFrostPower])

  const cgGetCreatureDetailedStats = useCallback((creatureId: string) => {
    const s = stateRef.current
    const entity = s.creatures.find(c => c.creatureId === creatureId)
    if (!entity) return null
    const def = CG_CREATURES.find(d => d.id === creatureId)
    if (!def) return null
    const xpNeeded = 50 + entity.level * 30
    return {
      def,
      entity,
      xpPercent: Math.floor((entity.xp / xpNeeded) * 100),
      xpNeeded,
      powerWithLevel: def.frostPower + entity.level * 2,
      effectiveHp: entity.maxHp,
      deployedIn: entity.zoneId,
    }
  }, [])

  const cgGetZoneHarvestReport = useCallback((zoneId: CgZoneId) => {
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    if (!zone) return null
    const def = CG_ZONES.find(d => d.id === zoneId)
    if (!def) return null
    const creatures = s.creatures.filter(c => c.zoneId === zoneId && c.deployed)
    const structures = s.structures.filter(st => {
      const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
      return stDef && stDef.zoneId === zoneId && st.built
    })
    const harvestBonus = structures.reduce((sum, st) => {
      const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
      return sum + (stDef ? stDef.harvestBonus * st.level : 0)
    }, 0)
    return {
      zone,
      def,
      deployedCreatures: creatures,
      builtStructures: structures,
      harvestBonus,
      reservePercent: Math.floor((zone.crystalReserve / zone.maxCrystalReserve) * 100),
      lastExplored: zone.lastExploredAt,
    }
  }, [])

  const cgGetFusionRecipeInfo = useCallback((recipeId: string) => {
    const recipe = CG_FUSION_RECIPES.find(r => r.id === recipeId)
    if (!recipe) return null
    const s = stateRef.current
    const canFuse = recipe.materialIds.every(matId => {
      const mat = s.materials.find(m => m.materialId === matId)
      return mat && mat.owned && mat.quantity >= 1
    })
    const resultDef = CG_MATERIALS.find(m => m.id === recipe.resultMaterialId)
    return { recipe, canFuse, resultDef, inputDefs: recipe.materialIds.map(id => CG_MATERIALS.find(m => m.id === id)).filter(Boolean) }
  }, [])

  const cgGetTamingCostInfo = useCallback((creatureId: string) => {
    const def = CG_CREATURES.find(c => c.id === creatureId)
    if (!def) return null
    const s = stateRef.current
    const alreadyOwned = s.creatures.some(c => c.creatureId === creatureId)
    return { cost: def.tamingCost, canAfford: s.coins >= def.tamingCost && !alreadyOwned, alreadyOwned }
  }, [])

  const cgGetStructureUpgradeCost = useCallback((structureId: string) => {
    const def = CG_STRUCTURES.find(s => s.id === structureId)
    if (!def) return null
    const entity = stateRef.current.structures.find(s => s.structureId === structureId)
    if (!entity || !entity.built) return null
    const cost = Math.floor(def.buildCost * 0.6 * entity.level)
    return { cost, currentLevel: entity.level, maxLevel: def.maxLevel }
  }, [])

  const cgGetBuildCostInfo = useCallback((structureId: string) => {
    const def = CG_STRUCTURES.find(s => s.id === structureId)
    if (!def) return null
    const s = stateRef.current
    const alreadyBuilt = s.structures.find(st => st.structureId === structureId && st.built)
    return { cost: def.buildCost, levelReq: def.levelReq, canAfford: s.coins >= def.buildCost && s.level >= def.levelReq, alreadyBuilt: !!alreadyBuilt }
  }, [])

  const cgGetNextTitle = useCallback(() => {
    const s = stateRef.current
    const nextTitle = CG_TITLES.find(t => t.level > s.level)
    if (!nextTitle) return null
    return { title: nextTitle, levelsAway: nextTitle.level - s.level }
  }, [])

  const cgResetDailyQuest = useCallback(() => {
    const todayKey = cgGetTodayKey()
    setState(prev => {
      if (prev.dailyQuest.date === todayKey) return prev
      return {
        ...prev,
        dailyQuest: { date: todayKey, completed: false, crystalsHarvested: 0, creaturesTamed: 0, sculpturesCompleted: 0, coinsEarned: 0, xpEarned: 0 },
      }
    })
  }, [])

  const cgGetAvailableTames = useCallback(() => {
    const s = stateRef.current
    const owned = new Set(s.creatures.map(c => c.creatureId))
    return CG_CREATURES.filter(c => !owned.has(c.id) && s.coins >= c.tamingCost)
  }, [])

  const cgGetAvailableBuilds = useCallback(() => {
    const s = stateRef.current
    return CG_STRUCTURES.filter(def => {
      if (s.level < def.levelReq) return false
      if (s.coins < def.buildCost) return false
      const existing = s.structures.find(st => st.structureId === def.id)
      return !(existing && existing.built)
    })
  }, [])

  const cgGetLearnableAbilities = useCallback(() => {
    const s = stateRef.current
    return CG_ABILITIES.filter(def => {
      if (s.level < def.unlockLevel) return false
      const entity = s.abilities.find(a => a.abilityId === def.id)
      return !(entity && entity.learned)
    })
  }, [])

  const cgGetAvailableFusions = useCallback(() => {
    const s = stateRef.current
    return CG_FUSION_RECIPES.filter(recipe => {
      return recipe.materialIds.every(matId => {
        const mat = s.materials.find(m => m.materialId === matId)
        return mat && mat.owned && mat.quantity >= 1
      })
    })
  }, [])

  const cgGetTamingStats = useCallback(() => {
    const s = stateRef.current
    const total = s.creatures.length
    const deployed = s.creatures.filter(c => c.deployed).length
    const avgLevel = total > 0 ? Math.floor(s.creatures.reduce((sum, c) => sum + c.level, 0) / total) : 0
    return { total, deployed, avgLevel, totalTamed: s.totalCreaturesTamed, totalDeployed: s.totalCreaturesDeployed }
  }, [])

  const cgGetHarvestingStats = useCallback(() => {
    const s = stateRef.current
    const totalMaterials = s.materials.reduce((sum, m) => sum + m.quantity, 0)
    const ownedTypes = s.materials.filter(m => m.owned).length
    return { totalCrystals: s.totalCrystalsHarvested, totalMaterials, ownedTypes, frostEssence: s.frostEssence }
  }, [])

  const cgGetEconomyStats = useCallback(() => {
    const s = stateRef.current
    const structureIncome = s.structures.filter(st => st.built).reduce((sum, st) => {
      const def = CG_STRUCTURES.find(d => d.id === st.structureId)
      return sum + (def ? def.harvestBonus * st.level : 0)
    }, 0)
    return {
      coins: s.coins,
      totalEarned: s.totalCoinsEarned,
      dailyIncome: structureIncome,
      totalFrostEssence: s.frostEssence,
    }
  }, [])

  const cgGetAchievementProgress = useCallback((achievementId: string) => {
    const ach = CG_ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!ach) return null
    const s = stateRef.current
    const entity = s.achievements.find(a => a.achievementId === achievementId)
    let current = 0
    let target = 1
    const cond = ach.condition
    if (cond.startsWith('totalCreaturesTamed')) { current = s.totalCreaturesTamed; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('creatures')) { current = s.creatures.length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('totalCrystalsHarvested')) { current = s.totalCrystalsHarvested; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('totalSculpturesCompleted')) { current = s.totalSculpturesCompleted; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('materials')) { current = s.materials.filter(m => m.owned).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('structures')) { current = s.structures.filter(st => st.built).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('abilities')) { current = s.abilities.filter(a => a.learned).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('streak')) { current = s.streak; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('legendary')) { current = s.creatures.filter(c => { const d = CG_CREATURES.find(dd => dd.id === c.creatureId); return d && d.rarity === CG_RARITY_LEGENDARY }).length; target = 1 }
    return {
      achievement: ach,
      unlocked: entity?.unlocked ?? false,
      current,
      target,
      percent: Math.min(100, Math.floor((current / target) * 100)),
    }
  }, [])

  // === PERMAFROST MINING ===

  const cgGetPermafrostMiningInfo = useCallback((zoneId: CgZoneId) => {
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    if (!zone || !zone.unlocked) return null
    const def = CG_ZONES.find(d => d.id === zoneId)
    if (!def) return null
    const deployedCount = s.creatures.filter(c => c.zoneId === zoneId && c.deployed).length
    const deployedPower = s.creatures.filter(c => c.zoneId === zoneId && c.deployed).reduce((sum, c) => {
      const cDef = CG_CREATURES.find(d => d.id === c.creatureId)
      return sum + (cDef ? cDef.frostPower + c.level * 2 : 0)
    }, 0)
    const structures = s.structures.filter(st => {
      const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
      return stDef && stDef.zoneId === zoneId && st.built
    })
    const structureBonus = structures.reduce((sum, st) => {
      const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
      return sum + (stDef ? stDef.harvestBonus * st.level : 0)
    }, 0)
    const miningRate = Math.floor((def.crystalReserve * 0.01) + deployedPower * 0.5 + structureBonus)
    return {
      zone,
      def,
      deployedCount,
      deployedPower,
      structureBonus,
      miningRate,
      reservePercent: Math.floor((zone.crystalReserve / zone.maxCrystalReserve) * 100),
      canMine: zone.crystalReserve > 0,
      structures,
    }
  }, [])

  const cgPerformPermafrostMining = useCallback((zoneId: CgZoneId): { harvested: number; essence: number; materials: string[] } => {
    const info = cgGetPermafrostMiningInfo(zoneId)
    if (!info || !info.canMine) return { harvested: 0, essence: 0, materials: [] }
    const baseHarvest = info.miningRate
    const bonusRoll = cgRandomFromSeed(stateRef.current.seed + Date.now(), 42)
    const bonus = bonusRoll > 0.8 ? Math.floor(baseHarvest * 0.5) : 0
    const total = baseHarvest + bonus
    const essenceGain = Math.floor(total * 0.3)
    let materialFound = false
    const foundMaterials: string[] = []
    setState(prev => {
      const newZones = prev.zones.map(z => {
        if (z.zoneId !== zoneId) return z
        const actual = Math.min(total, z.crystalReserve)
        return { ...z, crystalReserve: z.crystalReserve - actual, totalHarvests: z.totalHarvests + 1, lastExploredAt: Date.now() }
      })
      // Random material discovery chance
      const roll = cgRandomFromSeed(prev.seed + Date.now(), 99)
      let newMaterials = prev.materials
      if (roll > 0.7) {
        const zoneMaterials = CG_MATERIALS.filter(m => {
          const rarityThreshold = info.def.dangerLevel
          const rarityOrder = [CG_RARITY_COMMON, CG_RARITY_UNUSUAL, CG_RARITY_RARE, CG_RARITY_EPIC, CG_RARITY_LEGENDARY]
          const rarityIndex = rarityOrder.indexOf(m.rarity)
          return rarityIndex <= rarityThreshold
        })
        if (zoneMaterials.length > 0) {
          const chosen = zoneMaterials[Math.floor(roll * zoneMaterials.length)]
          newMaterials = prev.materials.map(m => {
            if (m.materialId === chosen.id) {
              return { ...m, owned: true, quantity: m.quantity + chosen.harvestYield, harvestedAt: Date.now() }
            }
            return m
          })
          foundMaterials.push(chosen.name)
          materialFound = true
        }
      }
      return {
        ...prev,
        zones: newZones,
        materials: newMaterials,
        frostEssence: prev.frostEssence + essenceGain,
        totalCrystalsHarvested: prev.totalCrystalsHarvested + total,
      }
    })
    return { harvested: total, essence: essenceGain, materials: foundMaterials }
  }, [cgGetPermafrostMiningInfo])

  // === FROST FUSION ANALYSIS ===

  const cgGetFrostFusionAnalysis = useCallback(() => {
    const s = stateRef.current
    const analysis = CG_FUSION_RECIPES.map(recipe => {
      const hasAllMaterials = recipe.materialIds.every(matId => {
        const mat = s.materials.find(m => m.materialId === matId)
        return mat && mat.owned && mat.quantity >= 1
      })
      const missingMaterials = recipe.materialIds.filter(matId => {
        const mat = s.materials.find(m => m.materialId === matId)
        return !(mat && mat.owned && mat.quantity >= 1)
      }).map(matId => {
        const def = CG_MATERIALS.find(m => m.id === matId)
        return def ? def.name : matId
      })
      const resultDef = CG_MATERIALS.find(m => m.id === recipe.resultMaterialId)
      return {
        recipe,
        canFuse: hasAllMaterials,
        missingMaterials,
        resultDef,
        resultValue: resultDef ? resultDef.frostValue : 0,
        frostPowerBonus: recipe.frostPowerBonus,
        tier: recipe.tier,
      }
    })
    return analysis.sort((a, b) => {
      const tierOrder = [CG_FUSION_TIER_BASIC, CG_FUSION_TIER_ENHANCED, CG_FUSION_TIER_SUPERIOR, CG_FUSION_TIER_TRANSCENDENT, CG_FUSION_TIER_PRIMORDIAL]
      return tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier)
    })
  }, [])

  // === CREATURE SYNERGY ===

  const cgGetCreatureSynergy = useCallback((creatureIds: string[]) => {
    const creatures = creatureIds.map(id => CG_CREATURES.find(c => c.id === id)).filter(Boolean)
    let synergyBonus = 0
    let synergyType = ''
    // Same type bonus
    const typeCounts: Record<string, number> = {}
    for (const c of creatures) {
      typeCounts[c.type] = (typeCounts[c.type] ?? 0) + 1
    }
    for (const count of Object.values(typeCounts)) {
      if (count >= 2) {
        synergyBonus += count * 5
      }
    }
    // Same zone deployed bonus
    const zoneCounts: Record<string, number> = {}
    const s = stateRef.current
    for (const id of creatureIds) {
      const entity = s.creatures.find(c => c.creatureId === id)
      if (entity && entity.zoneId) {
        zoneCounts[entity.zoneId] = (zoneCounts[entity.zoneId] ?? 0) + 1
      }
    }
    for (const count of Object.values(zoneCounts)) {
      if (count >= 2) {
        synergyBonus += count * 3
      }
    }
    // Determine synergy type
    if (typeCounts['dragon'] && typeCounts['dragon'] >= 2) synergyType = 'Dragon Pact'
    else if (typeCounts['wolf'] && typeCounts['wolf'] >= 2) synergyType = 'Wolf Pack'
    else if (typeCounts['golem'] && typeCounts['golem'] >= 2) synergyType = 'Crystal Formation'
    else if (typeCounts['spirit'] && typeCounts['spirit'] >= 2) synergyType = 'Spirit Resonance'
    else if (typeCounts['elemental'] && typeCounts['elemental'] >= 2) synergyType = 'Elemental Confluence'
    else if (typeCounts['avian'] && typeCounts['avian'] >= 2) synergyType = 'Flock Harmony'
    else if (synergyBonus > 0) synergyType = 'Glacial Bond'
    return { synergyBonus, synergyType, typeCounts, zoneCounts }
  }, [])

  // === ZONE CREATURE CAPACITY ===

  const cgGetZoneCreatureCapacity = useCallback((zoneId: CgZoneId) => {
    const def = CG_ZONES.find(z => z.id === zoneId)
    if (!def) return { max: 0, current: 0, remaining: 0 }
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    const current = zone ? zone.creaturesDeployed : 0
    return { max: def.maxCreatures, current, remaining: def.maxCreatures - current }
  }, [])

  // === MATERIAL WORTH ===

  const cgGetMaterialWorth = useCallback(() => {
    const s = stateRef.current
    const totalWorth = s.materials.reduce((sum, m) => {
      if (!m.owned) return sum
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      return sum + (def ? def.frostValue * m.quantity : 0)
    }, 0)
    const rarityWorth: Record<CgRarity, number> = { common: 0, unusual: 0, rare: 0, epic: 0, legendary: 0 }
    for (const m of s.materials) {
      if (!m.owned) continue
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      if (def) rarityWorth[def.rarity] += def.frostValue * m.quantity
    }
    return { totalWorth, rarityWorth }
  }, [])

  // === BEST HARVEST ZONE ===

  const cgGetBestHarvestZone = useCallback((): CgZoneId | null => {
    const s = stateRef.current
    let bestZone: CgZoneId | null = null
    let bestScore = -1
    for (const zone of s.zones) {
      if (!zone.unlocked || zone.crystalReserve <= 0) continue
      const def = CG_ZONES.find(d => d.id === zone.zoneId)
      if (!def) continue
      const deployed = s.creatures.filter(c => c.zoneId === zone.zoneId && c.deployed)
      const deployPower = deployed.reduce((sum, c) => {
        const cDef = CG_CREATURES.find(d => d.id === c.creatureId)
        return sum + (cDef ? cDef.frostPower + c.level * 2 : 0)
      }, 0)
      const structures = s.structures.filter(st => {
        const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
        return stDef && stDef.zoneId === zone.zoneId && st.built
      })
      const structureBonus = structures.reduce((sum, st) => {
        const stDef = CG_STRUCTURES.find(d => d.id === st.structureId)
        return sum + (stDef ? stDef.harvestBonus * st.level : 0)
      }, 0)
      const score = zone.crystalReserve + deployPower * 10 + structureBonus * 5
      if (score > bestScore) {
        bestScore = score
        bestZone = zone.zoneId
      }
    }
    return bestZone
  }, [])

  // === SCULPTURE REWARD ===

  const cgGetSculptureReward = useCallback((quality: number) => {
    const baseCoins = 8
    const qualityBonus = quality * 4
    const xpGain = 10 + quality * 3
    const essenceGain = Math.floor(quality * 1.5)
    const coinReward = baseCoins + qualityBonus
    return { coins: coinReward, xp: xpGain, essence: essenceGain, quality }
  }, [])

  // === UPGRADEABLE STRUCTURES ===

  const cgGetUpgradeableStructures = useCallback(() => {
    const s = stateRef.current
    return s.structures.filter(st => {
      if (!st.built) return false
      const def = CG_STRUCTURES.find(d => d.id === st.structureId)
      if (!def) return false
      if (st.level >= def.maxLevel) return false
      const cost = Math.floor(def.buildCost * 0.6 * st.level)
      return s.coins >= cost
    })
  }, [])

  // === ZONE EXPLORED STATUS ===

  const cgGetZoneExploredStatus = useCallback((): Record<CgZoneId, { unlocked: boolean; lastExplored: number | null; totalHarvests: number; reservePercent: number }> => {
    const s = stateRef.current
    const status = {} as Record<CgZoneId, { unlocked: boolean; lastExplored: number | null; totalHarvests: number; reservePercent: number }>
    for (const z of s.zones) {
      const def = CG_ZONES.find(d => d.id === z.zoneId)
      status[z.zoneId] = {
        unlocked: z.unlocked,
        lastExplored: z.lastExploredAt,
        totalHarvests: z.totalHarvests,
        reservePercent: def ? Math.floor((z.crystalReserve / z.maxCrystalReserve) * 100) : 0,
      }
    }
    return status
  }, [])

  // === CREATURE POWER RANKING ===

  const cgGetCreaturePowerRanking = useCallback((): Array<{ creatureId: string; name: string; power: number; level: number; rarity: CgRarity }> => {
    const s = stateRef.current
    const ranking = s.creatures.map(c => {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      if (!def) return null
      const power = def.frostPower + c.level * 2
      return {
        creatureId: c.creatureId,
        name: c.nickname,
        power,
        level: c.level,
        rarity: def.rarity,
      }
    }).filter((x): x is NonNullable<typeof x> => x !== null)
    return ranking.sort((a, b) => b.power - a.power)
  }, [])

  // === DAILY QUEST REQUIREMENTS ===

  const cgGetDailyQuestRequirements = useCallback(() => {
    const s = stateRef.current
    const todayKey = cgGetTodayKey()
    const isCompleted = s.dailyQuest.date === todayKey && s.dailyQuest.completed
    const baseQuest = CG_QUEST_TYPES[0]
    return {
      isCompleted,
      date: s.dailyQuest.date,
      crystalsHarvested: s.dailyQuest.crystalsHarvested,
      creaturesTamed: s.dailyQuest.creaturesTamed,
      sculpturesCompleted: s.dailyQuest.sculpturesCompleted,
      targetCrystals: baseQuest.crystalsRequired,
      targetCreatures: baseQuest.creaturesRequired,
      targetSculptures: baseQuest.sculpturesRequired,
      rewardCoins: baseQuest.coins,
      rewardXp: baseQuest.xp,
      streakBonus: s.streak * 10,
    }
  }, [])

  // === GLACIER COMPLETION PERCENT ===

  const cgGetGlacierCompletionPercent = useCallback(() => {
    const s = stateRef.current
    const creaturePercent = (s.creatures.length / CG_CREATURES.length) * 100
    const materialPercent = (s.materials.filter(m => m.owned).length / CG_MATERIALS.length) * 100
    const structurePercent = (s.structures.filter(st => st.built).length / CG_STRUCTURES.length) * 100
    const abilityPercent = (s.abilities.filter(a => a.learned).length / CG_ABILITIES.length) * 100
    const achievementPercent = (s.achievements.filter(a => a.unlocked).length / CG_ACHIEVEMENTS.length) * 100
    const zonePercent = (s.zones.filter(z => z.unlocked).length / CG_ZONES.length) * 100
    const overall = (creaturePercent + materialPercent + structurePercent + abilityPercent + achievementPercent + zonePercent) / 6
    return {
      creatures: Math.floor(creaturePercent),
      materials: Math.floor(materialPercent),
      structures: Math.floor(structurePercent),
      abilities: Math.floor(abilityPercent),
      achievements: Math.floor(achievementPercent),
      zones: Math.floor(zonePercent),
      overall: Math.floor(overall),
    }
  }, [])

  // === RARITY DISTRIBUTION ===

  const cgGetRarityDistribution = useCallback(() => {
    const s = stateRef.current
    const creatures: Record<CgRarity, number> = { common: 0, unusual: 0, rare: 0, epic: 0, legendary: 0 }
    const materials: Record<CgRarity, number> = { common: 0, unusual: 0, rare: 0, epic: 0, legendary: 0 }
    for (const c of s.creatures) {
      const def = CG_CREATURES.find(d => d.id === c.creatureId)
      if (def) creatures[def.rarity] += 1
    }
    for (const m of s.materials) {
      if (!m.owned) continue
      const def = CG_MATERIALS.find(d => d.id === m.materialId)
      if (def) materials[def.rarity] += 1
    }
    return { creatures, materials }
  }, [])

  // === RETURN ===

  return {
    // State
    state,
    // Computed
    xpProgress,
    overallProgress,
    unlockedZoneCount,
    deployedCreatures,
    totalFrostPower,
    creatureCount,
    legendaryCreatureCount,
    materialCount,
    learnedAbilityCount,
    builtStructureCount,
    unlockedAchievementCount,
    questCompletedToday,
    crystalHarvestStats,
    creatureRarityBreakdown,
    structureLevelStats,
    abilityMasteryStats,
    materialCollectionProgress,
    nextLevelXpInfo,
    powerRank,
    dailyIncomeRate,
    // Constants
    CG_CREATURES,
    CG_MATERIALS,
    CG_ZONES,
    CG_STRUCTURES,
    CG_ABILITIES,
    CG_ACHIEVEMENTS,
    CG_TITLES,
    CG_FUSION_RECIPES,
    CG_QUEST_TYPES,
    CG_MAX_LEVEL,
    CG_XP_TABLE,
    CG_RARITY_COLORS,
    CG_RARITY_ICONS,
    CG_RARITY_XP_MULTIPLIER,
    CG_RARITY_DROP_WEIGHTS,
    CG_REWARD_CONFIG,
    CG_QUEST_DIFFICULTY_CONFIG,
    // Getters
    cgGetLevel,
    cgGetXp,
    cgGetTotalXp,
    cgGetCoins,
    cgGetTitle,
    cgGetFrostEssence,
    cgGetCreatures,
    cgGetMaterials,
    cgGetZones,
    cgGetStructures,
    cgGetAbilities,
    cgGetAchievements,
    cgGetStreak,
    cgGetBestStreak,
    cgGetDailyQuest,
    cgGetTotalCreaturesTamed,
    cgGetTotalCrystalsHarvested,
    cgGetTotalSculpturesCompleted,
    cgGetTotalFusionsPerformed,
    cgGetTotalAbilitiesCast,
    cgGetXpRequired,
    // Lookups
    cgGetCreatureDef,
    cgGetMaterialDef,
    cgGetZoneDef,
    cgGetStructureDef,
    cgGetAbilityDef,
    cgGetAchievementDef,
    cgGetRarityColor,
    cgGetRarityIcon,
    cgGetRarityName,
    // Actions
    cgAddXp,
    cgAddCoins,
    cgSpendCoins,
    cgAddFrostEssence,
    cgSpendFrostEssence,
    cgTameCreature,
    cgDeployCreature,
    cgRecallCreature,
    cgTrainCreature,
    cgRenameCreature,
    cgReleaseCreature,
    cgHarvestCrystal,
    cgCollectMaterial,
    cgSpendMaterial,
    cgBuildStructure,
    cgUpgradeStructure,
    cgLearnAbility,
    cgCastAbility,
    cgCompleteSculpture,
    cgPerformFusion,
    cgCompleteDailyQuest,
    cgUnlockAchievement,
    cgCheckAchievements,
    cgReplenishZoneCrystals,
    cgTameRandomCreature,
    cgResetDailyQuest,
    // Filters
    cgGetCreaturesByRarity,
    cgGetCreaturesByType,
    cgGetCreaturesInZone,
    cgGetMaterialsByCategory,
    cgGetStructuresByZone,
    cgGetAbilitiesBySchool,
    cgGetAvailableTames,
    cgGetAvailableBuilds,
    cgGetLearnableAbilities,
    cgGetAvailableFusions,
    // Advanced Functions
    cgGetGlacierOverview,
    cgGetCreatureDetailedStats,
    cgGetZoneHarvestReport,
    cgGetFusionRecipeInfo,
    cgGetTamingCostInfo,
    cgGetStructureUpgradeCost,
    cgGetBuildCostInfo,
    cgGetNextTitle,
    cgGetTamingStats,
    cgGetHarvestingStats,
    cgGetEconomyStats,
    cgGetAchievementProgress,
    // Expanded Functions
    cgGetPermafrostMiningInfo,
    cgPerformPermafrostMining,
    cgGetFrostFusionAnalysis,
    cgGetCreatureSynergy,
    cgGetZoneCreatureCapacity,
    cgGetMaterialWorth,
    cgGetBestHarvestZone,
    cgGetSculptureReward,
    cgGetUpgradeableStructures,
    cgGetZoneExploredStatus,
    cgGetCreaturePowerRanking,
    cgGetDailyQuestRequirements,
    cgGetGlacierCompletionPercent,
    cgGetRarityDistribution,
  }
}
