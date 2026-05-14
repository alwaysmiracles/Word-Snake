'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'

// =============================================================================
// Frost Citadel Wire — Ancient Ice Fortress Defense & Management Wire
// All constants use FC_ prefix. All hook functions use fc prefix.
// Deep blue / silver / ice-white color theme.
// =============================================================================

// === TYPE DEFINITIONS ===

export type FcRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FcGuardianType = 'golem' | 'wolf' | 'giant' | 'knight' | 'dragon' | 'elemental' | 'spirit' | 'beast' | 'archer' | 'mage'
export type FcSpellSchool = 'cryo' | 'glacier' | 'blizzard' | 'rime' | 'frostfire' | 'permafrost'
export type FcZoneId = 'outer_wall' | 'inner_keep' | 'frozen_throne' | 'crystal_armory' | 'ice_dungeon' | 'blizzard_tower' | 'frost_garden' | 'eternal_glacier'
export type FcWeaponSlot = 'weapon' | 'shield' | 'helmet' | 'chestplate' | 'boots' | 'ring' | 'amulet'
export type FcStructureType = 'watchtower' | 'barracks' | 'library' | 'forge' | 'temple' | 'wall' | 'trap' | 'gate' | 'treasury' | 'workshop'
export type FcSiegeSeverity = 'scout' | 'raid' | 'assault' | 'siege' | 'apocalypse'
export type FcBlizzardIntensity = 'flurry' | 'moderate' | 'heavy' | 'catastrophic'

// === RARITY CONSTANTS ===

export const FC_RARITY_COMMON: FcRarity = 'common'
export const FC_RARITY_UNCOMMON: FcRarity = 'uncommon'
export const FC_RARITY_RARE: FcRarity = 'rare'
export const FC_RARITY_EPIC: FcRarity = 'epic'
export const FC_RARITY_LEGENDARY: FcRarity = 'legendary'

export const FC_RARITY_COLORS: Record<FcRarity, string> = {
  [FC_RARITY_COMMON]: '#9ec5d4',
  [FC_RARITY_UNCOMMON]: '#5dade2',
  [FC_RARITY_RARE]: '#2e86c1',
  [FC_RARITY_EPIC]: '#a8dadc',
  [FC_RARITY_LEGENDARY]: '#e0fbfc',
}

export const FC_RARITY_XP_MULTIPLIER: Record<FcRarity, number> = {
  [FC_RARITY_COMMON]: 1,
  [FC_RARITY_UNCOMMON]: 1.5,
  [FC_RARITY_RARE]: 2.5,
  [FC_RARITY_EPIC]: 4,
  [FC_RARITY_LEGENDARY]: 7,
}

export const FC_RARITY_DROP_WEIGHTS: Record<FcRarity, number> = {
  [FC_RARITY_COMMON]: 42,
  [FC_RARITY_UNCOMMON]: 28,
  [FC_RARITY_RARE]: 17,
  [FC_RARITY_EPIC]: 9,
  [FC_RARITY_LEGENDARY]: 4,
}

export const FC_RARITY_ICONS: Record<FcRarity, string> = {
  [FC_RARITY_COMMON]: '🧊',
  [FC_RARITY_UNCOMMON]: '❄️',
  [FC_RARITY_RARE]: '🌨️',
  [FC_RARITY_EPIC]: '💎',
  [FC_RARITY_LEGENDARY]: '👑',
}

// === COLOR THEME ===

export const FC_COLOR_SILVER = '#c0c7cf'
export const FC_COLOR_DEEP_BLUE = '#0b1d3a'
export const FC_COLOR_ICE_WHITE = '#e8f4f8'
export const FC_COLOR_FROST_CYAN = '#76d7ea'
export const FC_COLOR_GLACIER_BLUE = '#4a90b8'
export const FC_COLOR_ARCTIC_NAVY = '#0d2137'
export const FC_COLOR_SNOW_GRAY = '#b8c6d4'
export const FC_COLOR_CRYSTAL = '#a8d8ea'
export const FC_COLOR_STEEL = '#5a6a7a'
export const FC_COLOR_EMBER_ICE = '#6ec6ff'

// === INTERFACES ===

export interface FcGuardianDef {
  id: string
  name: string
  type: FcGuardianType
  rarity: FcRarity
  hp: number
  attack: number
  defense: number
  speed: number
  magic: number
  recruitCost: number
  description: string
  lore: string
  icon: string
  color: string
}

export interface FcGuardianEntity {
  guardianId: string
  nickname: string
  level: number
  xp: number
  hp: number
  maxHp: number
  deployed: boolean
  zoneId: FcZoneId | null
  recruitedAt: number | null
}

export interface FcWeaponDef {
  id: string
  name: string
  slot: FcWeaponSlot
  rarity: FcRarity
  attackBonus: number
  defenseBonus: number
  frostBonus: number
  forgeCost: number
  crystalCost: number
  levelReq: number
  description: string
  lore: string
  icon: string
  color: string
}

export interface FcWeaponEntity {
  weaponId: string
  owned: boolean
  equipped: boolean
  forgedAt: number | null
  upgradeLevel: number
}

export interface FcZoneDef {
  id: FcZoneId
  name: string
  description: string
  unlockLevel: number
  ambientColor: string
  dangerLevel: number
  maxGuardians: number
  wallHp: number
  maxWallHp: number
  rewards: string[]
}

export interface FcZoneEntity {
  zoneId: FcZoneId
  unlocked: boolean
  wallHp: number
  maxWallHp: number
  guardiansDeployed: number
  totalDefenseEvents: number
  lastPatrolledAt: number | null
}

export interface FcStructureDef {
  id: string
  name: string
  type: FcStructureType
  zoneId: FcZoneId
  buildCost: number
  buildTime: number
  defenseBonus: number
  coinBonus: number
  description: string
  icon: string
  levelReq: number
}

export interface FcStructureEntity {
  structureId: string
  built: boolean
  level: number
  builtAt: number | null
}

export interface FcSpellDef {
  id: string
  name: string
  school: FcSpellSchool
  rarity: FcRarity
  power: number
  manaCost: number
  cooldown: number
  unlockLevel: number
  description: string
  icon: string
  color: string
}

export interface FcSpellEntity {
  spellId: string
  learned: boolean
  mastery: number
  castCount: number
}

export interface FcAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  rewardCoins: number
  hidden: boolean
  icon: string
}

export interface FcAchievementEntity {
  achievementId: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface FcTitleDef {
  level: number
  title: string
  description: string
  icon: string
}

export interface FcSiegeWave {
  id: string
  severity: FcSiegeSeverity
  waveNumber: number
  enemyCount: number
  enemyPower: number
  startedAt: number
  duration: number
  survived: boolean
  damage: number
  coinsEarned: number
  xpEarned: number
}

export interface FcBlizzardEvent {
  id: string
  intensity: FcBlizzardIntensity
  startedAt: number
  duration: number
  survived: boolean
  damage: number
  bonusCoins: number
}

export interface FcDailyPatrol {
  date: string
  completed: boolean
  zonesPatrolled: number
  enemiesDefeated: number
  coinsEarned: number
  xpEarned: number
}

export interface FcTrapEntity {
  trapId: string
  zoneId: FcZoneId
  placed: boolean
  charges: number
  damage: number
  placedAt: number | null
}

export interface FcTrapDef {
  id: string
  name: string
  zoneId: FcZoneId
  damage: number
  charges: number
  cost: number
  description: string
  icon: string
}

export interface FrostCitadelState {
  level: number
  xp: number
  totalXp: number
  coins: number
  totalCoinsEarned: number
  guardians: FcGuardianEntity[]
  weapons: FcWeaponEntity[]
  zones: FcZoneEntity[]
  structures: FcStructureEntity[]
  spells: FcSpellEntity[]
  achievements: FcAchievementEntity[]
  traps: FcTrapEntity[]
  title: string
  totalGuardiansRecruited: number
  totalGuardiansDeployed: number
  totalSiegesDefended: number
  totalSiegesLost: number
  totalWavesDefeated: number
  totalWeaponsForged: number
  totalSpellsCast: number
  totalAchievements: number
  totalStructuresBuilt: number
  totalTrapsPlaced: number
  totalBlizzardsSurvived: number
  currentSiege: FcSiegeWave | null
  currentBlizzard: FcBlizzardEvent | null
  dailyPatrol: FcDailyPatrol
  streak: number
  bestStreak: number
  seed: number
  tick: number
  iceCrystals: number
}

// === FROST GUARDIANS (35) ===

export const FC_GUARDIANS: FcGuardianDef[] = [
  // Common (10)
  { id: 'ice_golem', name: 'Ice Golem', type: 'golem', rarity: FC_RARITY_COMMON, hp: 120, attack: 18, defense: 25, speed: 3, magic: 8, recruitCost: 50, description: 'A humanoid construct of packed ice and ancient frozen magic.', lore: 'Ice golems were first carved by the Frost Sovereign to guard the citadel gates during the Eternal Winter.', icon: '🗿', color: '#a2d2ff' },
  { id: 'frost_sprite', name: 'Frost Sprite', type: 'spirit', rarity: FC_RARITY_COMMON, hp: 40, attack: 8, defense: 5, speed: 15, magic: 12, recruitCost: 30, description: 'A tiny mischievous spirit that leaves trails of frost on everything it touches.', lore: 'Frost sprites are born from the breath of sleeping glaciers.', icon: '🧚', color: '#caf0f8' },
  { id: 'winter_wolf', name: 'Winter Wolf', type: 'wolf', rarity: FC_RARITY_COMMON, hp: 80, attack: 22, defense: 15, speed: 25, magic: 10, recruitCost: 40, description: 'A fierce wolf with a pelt of hardened glacier ice and eyes of deep blue.', lore: 'Winter wolves run in packs across the frozen tundra, their howls creating echoing ice harmonics.', icon: '🐺', color: '#89c2d9' },
  { id: 'frost_bear', name: 'Frost Bear', type: 'beast', rarity: FC_RARITY_COMMON, hp: 150, attack: 25, defense: 28, speed: 5, magic: 5, recruitCost: 55, description: 'An enormous bear with fur as white as fresh snow and claws of solid ice.', lore: 'Frost bears hibernate for centuries. When they wake, the surrounding landscape is permanently changed.', icon: '🐻', color: '#caf0f8' },
  { id: 'ice_archer', name: 'Ice Archer', type: 'archer', rarity: FC_RARITY_COMMON, hp: 60, attack: 20, defense: 8, speed: 18, magic: 6, recruitCost: 35, description: 'A silent archer who crafts arrows from frozen raindrops.', lore: 'Ice archers never miss their mark, for their arrows are guided by the wind itself.', icon: '🏹', color: '#bde0fe' },
  { id: 'snow_sentry', name: 'Snow Sentry', type: 'golem', rarity: FC_RARITY_COMMON, hp: 100, attack: 12, defense: 20, speed: 4, magic: 5, recruitCost: 40, description: 'A small golem made of compacted snow that patrols the outer walls.', lore: 'Snow sentries are the first line of defense, melting and reforming endlessly.', icon: '🏗️', color: '#e0fbfc' },
  { id: 'frost_viper', name: 'Frost Viper', type: 'beast', rarity: FC_RARITY_COMMON, hp: 50, attack: 16, defense: 8, speed: 26, magic: 12, recruitCost: 35, description: 'A venomous snake whose bite instantly crystallizes the blood of its prey.', lore: 'Frost viper venom is used in the most powerful cryo weapons.', icon: '🐍', color: '#89c2d9' },
  { id: 'ice_moth', name: 'Ice Moth', type: 'spirit', rarity: FC_RARITY_COMMON, hp: 25, attack: 4, defense: 3, speed: 20, magic: 8, recruitCost: 20, description: 'A delicate moth with wings made of thin ice that refracts moonlight.', lore: 'Ice moths swarm around the Frost Garden at night, creating mesmerizing light shows.', icon: '🦋', color: '#caf0f8' },
  { id: 'crystal_scout', name: 'Crystal Scout', type: 'archer', rarity: FC_RARITY_COMMON, hp: 45, attack: 14, defense: 6, speed: 22, magic: 10, recruitCost: 30, description: 'A swift scout who navigates by reading crystal formations.', lore: 'Crystal scouts can detect incoming sieges days before they arrive.', icon: '🔮', color: '#a2d2ff' },
  { id: 'frost_apprentice', name: 'Frost Apprentice', type: 'mage', rarity: FC_RARITY_COMMON, hp: 50, attack: 10, defense: 6, speed: 12, magic: 18, recruitCost: 45, description: 'A young mage learning the basics of cryomancy.', lore: 'Every great cryomancer began as a frost apprentice shivering in the outer corridors.', icon: '🧙', color: '#48cae4' },
  // Uncommon (8)
  { id: 'glacier_wolf_alpha', name: 'Glacier Wolf Alpha', type: 'wolf', rarity: FC_RARITY_UNCOMMON, hp: 110, attack: 30, defense: 20, speed: 28, magic: 15, recruitCost: 120, description: 'The pack leader of winter wolves, marked by silver-tipped fur and icy fangs.', lore: 'Glacier Wolf Alphas can summon the entire pack with a single subsonic howl.', icon: '🐺', color: '#219ebc' },
  { id: 'crystal_fox', name: 'Crystal Fox', type: 'beast', rarity: FC_RARITY_UNCOMMON, hp: 55, attack: 14, defense: 10, speed: 28, magic: 18, recruitCost: 100, description: 'A swift fox whose fur refracts light into dazzling crystal patterns.', lore: 'Crystal foxes are the messengers of the citadel, delivering frozen scrolls between zones.', icon: '🦊', color: '#48cae4' },
  { id: 'frost_elemental', name: 'Frost Elemental', type: 'elemental', rarity: FC_RARITY_UNCOMMON, hp: 100, attack: 25, defense: 18, speed: 15, magic: 32, recruitCost: 130, description: 'A living manifestation of pure cold energy, constantly shifting form.', lore: 'Frost elementals are the architects of the citadel, reshaping walls with a thought.', icon: '🌊', color: '#00e5ff' },
  { id: 'ice_serpent', name: 'Ice Serpent', type: 'beast', rarity: FC_RARITY_UNCOMMON, hp: 70, attack: 20, defense: 12, speed: 22, magic: 22, recruitCost: 110, description: 'A coiling serpent made of frozen mist that strikes with venomous frost.', lore: 'Ice serpents dwell in the frozen rivers beneath the citadel, guarding submerged treasures.', icon: '🐉', color: '#00b4d8' },
  { id: 'rime_stag', name: 'Rime Stag', type: 'beast', rarity: FC_RARITY_UNCOMMON, hp: 120, attack: 24, defense: 22, speed: 20, magic: 25, recruitCost: 115, description: 'A magnificent stag with antlers made of razor-sharp rime ice crystals.', lore: 'Rime Stags appear at the boundary between autumn and winter, heralding the first frost.', icon: '🦌', color: '#e0fbfc' },
  { id: 'glacial_turtle', name: 'Glacial Turtle', type: 'golem', rarity: FC_RARITY_UNCOMMON, hp: 160, attack: 10, defense: 35, speed: 4, magic: 12, recruitCost: 125, description: 'A slow-moving turtle with a shell made from thousand-year-old glacial ice.', lore: 'Glacial turtles carry miniature frozen ecosystems on their shells.', icon: '🐢', color: '#bde0fe' },
  { id: 'cryo_knight', name: 'Cryo Knight', type: 'knight', rarity: FC_RARITY_UNCOMMON, hp: 130, attack: 22, defense: 30, speed: 10, magic: 14, recruitCost: 140, description: 'A knight encased in enchanted ice armor that never cracks.', lore: 'Cryo Knights swear an oath of eternal vigilance to protect the Inner Keep.', icon: '⚔️', color: '#a2d2ff' },
  { id: 'frost_archmage', name: 'Frost Archmage', type: 'mage', rarity: FC_RARITY_UNCOMMON, hp: 70, attack: 15, defense: 10, speed: 14, magic: 38, recruitCost: 135, description: 'A master of frost magic capable of conjuring blizzards at will.', lore: 'Frost Archmages have studied the frozen arts for at least three centuries.', icon: '🧙‍♂️', color: '#48cae4' },
  // Rare (8)
  { id: 'permafrost_golem', name: 'Permafrost Golem', type: 'golem', rarity: FC_RARITY_RARE, hp: 200, attack: 22, defense: 40, speed: 2, magic: 15, recruitCost: 300, description: 'An ancient golem made from permanently frozen earth older than civilization.', lore: 'Permafrost golems contain fossils of creatures that lived before the first ice age.', icon: '🗿', color: '#023e8a' },
  { id: 'snow_dragon', name: 'Snow Dragon', type: 'dragon', rarity: FC_RARITY_RARE, hp: 180, attack: 35, defense: 22, speed: 20, magic: 30, recruitCost: 350, description: 'A majestic dragon with scales that shimmer like fresh snowfall in sunlight.', lore: 'Snow Dragons nest at the peaks of the highest mountains, only descending during the deepest winters.', icon: '🐲', color: '#e0fbfc' },
  { id: 'frost_giant', name: 'Frost Giant', type: 'giant', rarity: FC_RARITY_RARE, hp: 300, attack: 40, defense: 35, speed: 6, magic: 20, recruitCost: 380, description: 'A towering giant whose footsteps cause localized blizzards.', lore: 'Frost Giants were the original builders of the citadel walls, carving stone with their bare hands.', icon: '👹', color: '#219ebc' },
  { id: 'crystal_knight', name: 'Crystal Knight', type: 'knight', rarity: FC_RARITY_RARE, hp: 160, attack: 30, defense: 35, speed: 14, magic: 25, recruitCost: 320, description: 'A knight whose armor is forged from enchanted crystal harder than steel.', lore: 'Crystal Knights are chosen by the Frozen Throne itself. Their armor sings in battle.', icon: '🛡️', color: '#48cae4' },
  { id: 'winter_phoenix', name: 'Winter Phoenix', type: 'dragon', rarity: FC_RARITY_RARE, hp: 130, attack: 30, defense: 20, speed: 30, magic: 35, recruitCost: 360, description: 'A phoenix reborn not from fire but from the heart of eternal winter.', lore: 'The Winter Phoenix dies when spring comes and is reborn at the first frost of autumn.', icon: '🦅', color: '#48cae4' },
  { id: 'frozen_owl_sage', name: 'Frozen Owl Sage', type: 'mage', rarity: FC_RARITY_RARE, hp: 70, attack: 15, defense: 18, speed: 22, magic: 35, recruitCost: 310, description: 'An ancient owl whose eyes hold the accumulated wisdom of a thousand winters.', lore: 'The Frozen Owl Sage can see into the past by reading the patterns in ice crystals.', icon: '🦉', color: '#a2d2ff' },
  { id: 'rime_wyvern', name: 'Rime Wyvern', type: 'dragon', rarity: FC_RARITY_RARE, hp: 150, attack: 32, defense: 18, speed: 24, magic: 28, recruitCost: 340, description: 'A two-legged dragon covered in razor-sharp rime ice plates.', lore: 'Rime Wyverns patrol the skies above the citadel, diving on any approaching threat.', icon: '🦇', color: '#89c2d9' },
  { id: 'glacier_guardian', name: 'Glacier Guardian', type: 'giant', rarity: FC_RARITY_RARE, hp: 250, attack: 28, defense: 45, speed: 4, magic: 18, recruitCost: 370, description: 'A massive guardian carved from living glacier ice that regenerates endlessly.', lore: 'Glacier Guardians have stood watch over the Eternal Glacier for millennia without moving.', icon: '🏔️', color: '#023e8a' },
  // Epic (5)
  { id: 'blizzard_wyrm', name: 'Blizzard Wyrm', type: 'dragon', rarity: FC_RARITY_EPIC, hp: 220, attack: 42, defense: 30, speed: 18, magic: 38, recruitCost: 800, description: 'A serpentine dragon that lives inside raging blizzards, invisible to the naked eye.', lore: 'When a Blizzard Wyrm dies, the storm it inhabits continues for seven days and seven nights.', icon: '🐉', color: '#03045e' },
  { id: 'ice_crown_bear', name: 'Ice Crown Bear', type: 'beast', rarity: FC_RARITY_EPIC, hp: 250, attack: 35, defense: 45, speed: 8, magic: 20, recruitCost: 850, description: 'A legendary frost bear with a crown of ice crystals growing from its skull.', lore: 'Only five Ice Crown Bears have ever been sighted. Each commands an entire frozen mountain.', icon: '🐻', color: '#48cae4' },
  { id: 'avalanche_golem', name: 'Avalanche Golem', type: 'golem', rarity: FC_RARITY_EPIC, hp: 280, attack: 30, defense: 50, speed: 5, magic: 25, recruitCost: 900, description: 'A colossal golem that embodies the destructive power of an avalanche.', lore: 'When an Avalanche Golem awakens, entire mountainsides crumble in its wake.', icon: '🗿', color: '#023e8a' },
  { id: 'frost_matriarch', name: 'Frost Matriarch', type: 'spirit', rarity: FC_RARITY_EPIC, hp: 110, attack: 28, defense: 20, speed: 18, magic: 40, recruitCost: 870, description: 'The queen of all frost spirits, commanding an army of ice and wind.', lore: 'The Frost Matriarch once froze an entire invading army mid-charge, preserving them as ice statues.', icon: '👸', color: '#00e5ff' },
  { id: 'arctic_fox_spirit', name: 'Arctic Fox Spirit', type: 'beast', rarity: FC_RARITY_EPIC, hp: 90, attack: 18, defense: 15, speed: 35, magic: 28, recruitCost: 820, description: 'The ghostly spirit of an arctic fox that has transcended mortal form.', lore: 'Fox spirits can phase between dimensions, appearing in reflections of frozen lakes.', icon: '🦊', color: '#caf0f8' },
  // Legendary (4)
  { id: 'aurora_wyrm', name: 'Aurora Wyrm', type: 'dragon', rarity: FC_RARITY_LEGENDARY, hp: 300, attack: 50, defense: 35, speed: 25, magic: 45, recruitCost: 2000, description: 'A magnificent dragon that channels the northern lights through its translucent body.', lore: 'The Aurora Wyrm appears only when all seven colors of the aurora align. Its cry shatters mountains.', icon: '🐲', color: '#48cae4' },
  { id: 'cryo_hydra', name: 'Cryo Hydra', type: 'dragon', rarity: FC_RARITY_LEGENDARY, hp: 350, attack: 45, defense: 38, speed: 15, magic: 42, recruitCost: 2200, description: 'A multi-headed serpent of pure ice. Each severed head regrows stronger and colder.', lore: 'The Cryo Hydra sleeps beneath the citadel foundations. Its dreams are the source of every blizzard.', icon: '🐍', color: '#03045e' },
  { id: 'eternal_frost_spirit', name: 'Eternal Frost Spirit', type: 'elemental', rarity: FC_RARITY_LEGENDARY, hp: 180, attack: 35, defense: 30, speed: 20, magic: 50, recruitCost: 2500, description: 'The primordial spirit of winter itself, older than the concept of seasons.', lore: 'Before the world had seasons, the Eternal Frost Spirit ruled all of existence in perpetual ice.', icon: '👻', color: '#caf0f8' },
  { id: 'frostfire_phoenix', name: 'Frostfire Phoenix', type: 'dragon', rarity: FC_RARITY_LEGENDARY, hp: 200, attack: 40, defense: 28, speed: 35, magic: 48, recruitCost: 2800, description: 'A paradoxical phoenix of both fire and ice, its flames freeze and its ice burns.', lore: 'The Frostfire Phoenix was born when a comet of blue fire struck the heart of an ancient glacier.', icon: '🔥', color: '#00e5ff' },
]

// === CITADEL ZONES (8) ===

export const FC_ZONES: FcZoneDef[] = [
  { id: 'outer_wall', name: 'Outer Wall', description: 'The first line of defense — massive ice walls reinforced with ancient magic. Patrol sentries keep watch for approaching threats.', unlockLevel: 1, ambientColor: '#b8c6d4', dangerLevel: 1, maxGuardians: 5, wallHp: 500, maxWallHp: 1000, rewards: ['ice_golem', 'frost_sprite', 'frost_touch', 'ice_shard_bolt'] },
  { id: 'inner_keep', name: 'Inner Keep', description: 'The central fortress where the war council meets. Strong walls and strategic choke points make it nearly impregnable.', unlockLevel: 5, ambientColor: '#5dade2', dangerLevel: 2, maxGuardians: 8, wallHp: 800, maxWallHp: 2000, rewards: ['cryo_knight', 'winter_wolf', 'glacier_wall_spell', 'cryo_dart'] },
  { id: 'frozen_throne', name: 'Frozen Throne', description: 'The heart of the Frost Citadel. The throne of frozen starlight sits upon a dais of clear ice, radiating ancient power.', unlockLevel: 10, ambientColor: '#00e5ff', dangerLevel: 3, maxGuardians: 10, wallHp: 1200, maxWallHp: 4000, rewards: ['crystal_knight', 'frost_giant', 'absolute_zero', 'aurora_veil'] },
  { id: 'crystal_armory', name: 'Crystal Armory', description: 'A vast armory where cryo weapons and ice armor are forged from enchanted crystals. The heat of the forge never melts the ice.', unlockLevel: 8, ambientColor: '#a2d2ff', dangerLevel: 2, maxGuardians: 4, wallHp: 600, maxWallHp: 1500, rewards: ['frost_elemental', 'frost_archmage', 'crystal_shatter', 'permafrost_bind'] },
  { id: 'ice_dungeon', name: 'Ice Dungeon', description: 'A deep frozen labyrinth beneath the citadel where captured invaders are imprisoned in eternal ice. Ghostly echoes fill the corridors.', unlockLevel: 15, ambientColor: '#023e8a', dangerLevel: 4, maxGuardians: 6, wallHp: 1000, maxWallHp: 3000, rewards: ['permafrost_golem', 'frozen_owl_sage', 'cryostasis', 'winter_grasp'] },
  { id: 'blizzard_tower', name: 'Blizzard Tower', description: 'A towering spire that generates and controls blizzards to shield the citadel. From its peak, the commander can see for miles.', unlockLevel: 20, ambientColor: '#48cae4', dangerLevel: 4, maxGuardians: 5, wallHp: 900, maxWallHp: 2500, rewards: ['blizzard_wyrm', 'rime_wyvern', 'blizzard_surge', 'frost_nova'] },
  { id: 'frost_garden', name: 'Frost Garden', description: 'A breathtaking garden where crystalline flowers bloom in perpetual frost. Guardian spirits rest and meditate among the frozen blooms.', unlockLevel: 12, ambientColor: '#e0fbfc', dangerLevel: 2, maxGuardians: 3, wallHp: 400, maxWallHp: 1200, rewards: ['frost_matriarch', 'arctic_fox_spirit', 'aurora_healing', 'frost_bloom'] },
  { id: 'eternal_glacier', name: 'The Eternal Glacier', description: 'The deepest and most sacred zone — an ancient glacier that predates the citadel itself. Legendary guardians slumber within its frozen heart.', unlockLevel: 30, ambientColor: '#03045e', dangerLevel: 5, maxGuardians: 12, wallHp: 2000, maxWallHp: 8000, rewards: ['aurora_wyrm', 'cryo_hydra', 'eternal_frost_spirit', 'permafrost_avalanche'] },
]

// === CRYO WEAPONS (30) ===

export const FC_WEAPONS: FcWeaponDef[] = [
  // Weapons (10)
  { id: 'ice_dagger', name: 'Ice Dagger', slot: 'weapon', rarity: FC_RARITY_COMMON, attackBonus: 5, defenseBonus: 0, frostBonus: 2, forgeCost: 30, crystalCost: 3, levelReq: 1, description: 'A small dagger carved from a single icicle, sharp enough to cut steel.', lore: 'Every new recruit receives an ice dagger upon joining the citadel guard.', icon: '🗡️', color: '#caf0f8' },
  { id: 'frost_sword', name: 'Frost Sword', slot: 'weapon', rarity: FC_RARITY_UNCOMMON, attackBonus: 12, defenseBonus: 0, frostBonus: 5, forgeCost: 80, crystalCost: 8, levelReq: 5, description: 'A sword that freezes anything it cuts, leaving a trail of ice crystals.', lore: 'Frost Swords are forged in the Crystal Armory during the coldest full moon.', icon: '⚔️', color: '#a2d2ff' },
  { id: 'glacier_axe', name: 'Glacier Axe', slot: 'weapon', rarity: FC_RARITY_UNCOMMON, attackBonus: 15, defenseBonus: 2, frostBonus: 4, forgeCost: 100, crystalCost: 10, levelReq: 8, description: 'A heavy axe made from a single piece of ancient glacier ice.', lore: 'The Glacier Axe can cleave through stone walls in a single swing.', icon: '🪓', color: '#89c2d9' },
  { id: 'crystal_lance', name: 'Crystal Lance', slot: 'weapon', rarity: FC_RARITY_RARE, attackBonus: 22, defenseBonus: 0, frostBonus: 10, forgeCost: 250, crystalCost: 25, levelReq: 12, description: 'A lance tipped with a razor-sharp enchanted crystal that never dulls.', lore: 'Crystal Lances are used by the citadel cavalry to shatter siege equipment.', icon: '🔱', color: '#48cae4' },
  { id: 'permafrost_greatsword', name: 'Permafrost Greatsword', slot: 'weapon', rarity: FC_RARITY_RARE, attackBonus: 28, defenseBonus: 3, frostBonus: 12, forgeCost: 350, crystalCost: 30, levelReq: 18, description: 'A massive two-handed sword forged from permafrost older than civilization.', lore: 'This greatsword contains the captured fury of a thousand winter storms.', icon: '⚔️', color: '#023e8a' },
  { id: 'blizzard_staff', name: 'Blizzard Staff', slot: 'weapon', rarity: FC_RARITY_EPIC, attackBonus: 18, defenseBonus: 5, frostBonus: 25, forgeCost: 700, crystalCost: 50, levelReq: 25, description: 'A staff that channels the power of blizzards, creating localized storms.', lore: 'The Blizzard Staff was carved from a lightning-struck frozen oak at the peak of winter.', icon: '🪄', color: '#48cae4' },
  { id: 'frostfire_blade', name: 'Frostfire Blade', slot: 'weapon', rarity: FC_RARITY_LEGENDARY, attackBonus: 35, defenseBonus: 0, frostBonus: 30, forgeCost: 1500, crystalCost: 100, levelReq: 35, description: 'A blade that burns with cold fire — its flames freeze instead of ignite.', lore: 'The Frostfire Blade was forged in the heart of a dying star that fell as ice.', icon: '🗡️', color: '#00e5ff' },
  { id: 'rime_bow', name: 'Rime Bow', slot: 'weapon', rarity: FC_RARITY_COMMON, attackBonus: 8, defenseBonus: 0, frostBonus: 3, forgeCost: 40, crystalCost: 4, levelReq: 3, description: 'A bow whose arrows form from thin air, tipped with rime ice.', lore: 'Rime Bows are favored by the Crystal Scouts for their unlimited ammunition.', icon: '🏹', color: '#bde0fe' },
  { id: 'avalanche_hammer', name: 'Avalanche Hammer', slot: 'weapon', rarity: FC_RARITY_EPIC, attackBonus: 30, defenseBonus: 8, frostBonus: 18, forgeCost: 800, crystalCost: 60, levelReq: 28, description: 'A war hammer that creates miniature avalanches with every ground strike.', lore: 'The Avalanche Hammer was wielded by the first Frost Sovereign to carve out the citadel.', icon: '🔨', color: '#023e8a' },
  { id: 'aurora_spear', name: 'Aurora Spear', slot: 'weapon', rarity: FC_RARITY_LEGENDARY, attackBonus: 32, defenseBonus: 5, frostBonus: 28, forgeCost: 1800, crystalCost: 120, levelReq: 40, description: 'A spear that shimmers with captured aurora light, piercing any defense.', lore: 'The Aurora Spear appears only to those the Frozen Throne deems worthy.', icon: '🔱', color: '#e0fbfc' },
  // Shields (5)
  { id: 'snow_buckler', name: 'Snow Buckler', slot: 'shield', rarity: FC_RARITY_COMMON, attackBonus: 0, defenseBonus: 8, frostBonus: 1, forgeCost: 25, crystalCost: 2, levelReq: 1, description: 'A small shield made of compressed snow that hardens on impact.', lore: 'Deceptively fragile-looking, this buckler has stopped a frost giant charge.', icon: '🛡️', color: '#e0fbfc' },
  { id: 'glacier_shield', name: 'Glacier Shield', slot: 'shield', rarity: FC_RARITY_RARE, attackBonus: 2, defenseBonus: 20, frostBonus: 8, forgeCost: 200, crystalCost: 18, levelReq: 10, description: 'A massive shield carved from ancient glacial ice, nearly indestructible.', lore: 'The Glacier Shield has never been breached. Its surface is harder than diamond.', icon: '🛡️', color: '#023e8a' },
  { id: 'permafrost_aegis', name: 'Permafrost Aegis', slot: 'shield', rarity: FC_RARITY_EPIC, attackBonus: 0, defenseBonus: 35, frostBonus: 15, forgeCost: 750, crystalCost: 55, levelReq: 22, description: 'An impenetrable shield of primordial permafrost that absorbs all damage.', lore: 'Nothing in existence has ever damaged the Permafrost Aegis.', icon: '🔰', color: '#219ebc' },
  { id: 'ice_mirror_shield', name: 'Ice Mirror Shield', slot: 'shield', rarity: FC_RARITY_LEGENDARY, attackBonus: 5, defenseBonus: 30, frostBonus: 20, forgeCost: 1600, crystalCost: 110, levelReq: 38, description: 'A perfectly smooth shield that reflects spells and projectiles back at attackers.', lore: 'The Ice Mirror Shield was forged during the War of Frozen Suns.', icon: '🪞', color: '#48cae4' },
  { id: 'frost_wall_shield', name: 'Frost Wall Shield', slot: 'shield', rarity: FC_RARITY_UNCOMMON, attackBonus: 0, defenseBonus: 14, frostBonus: 4, forgeCost: 70, crystalCost: 7, levelReq: 6, description: 'A tower shield that generates a small ice wall on command.', lore: 'Frost Wall Shields are standard issue for citadel defenders on the Outer Wall.', icon: '🛡️', color: '#89c2d9' },
  // Helmets (4)
  { id: 'ice_helm', name: 'Ice Helm', slot: 'helmet', rarity: FC_RARITY_COMMON, attackBonus: 0, defenseBonus: 5, frostBonus: 2, forgeCost: 20, crystalCost: 2, levelReq: 1, description: 'A helmet carved from clear ice that provides basic protection.', lore: 'Every citadel recruit starts with a simple Ice Helm.', icon: '⛑️', color: '#caf0f8' },
  { id: 'crystal_crown', name: 'Crystal Crown', slot: 'helmet', rarity: FC_RARITY_RARE, attackBonus: 3, defenseBonus: 12, frostBonus: 10, forgeCost: 220, crystalCost: 20, levelReq: 14, description: 'A crown of enchanted crystals that enhances frost magic and protects the mind.', lore: 'Crystal Crowns grant their wearers immunity to psychic attacks from ice wraiths.', icon: '👑', color: '#48cae4' },
  { id: 'frost_lord_helm', name: 'Frost Lord Helm', slot: 'helmet', rarity: FC_RARITY_EPIC, attackBonus: 5, defenseBonus: 18, frostBonus: 15, forgeCost: 650, crystalCost: 45, levelReq: 26, description: 'The helmet of an ancient Frost Lord, radiating an aura of intense cold.', lore: 'Wearing this helm lets you see through the thickest blizzard.', icon: '👑', color: '#00e5ff' },
  { id: 'eternal_winter_diadem', name: 'Eternal Winter Diadem', slot: 'helmet', rarity: FC_RARITY_LEGENDARY, attackBonus: 8, defenseBonus: 22, frostBonus: 25, forgeCost: 2000, crystalCost: 130, levelReq: 45, description: 'The supreme crown of the Frost Citadel, granting mastery over all ice.', lore: 'Only the Eternal Winter Sovereign can wear this diadem without being consumed.', icon: '👑', color: '#e0fbfc' },
  // Chestplates (4)
  { id: 'snow_chestplate', name: 'Snow Chestplate', slot: 'chestplate', rarity: FC_RARITY_COMMON, attackBonus: 0, defenseBonus: 10, frostBonus: 1, forgeCost: 35, crystalCost: 3, levelReq: 2, description: 'A chestplate woven from enchanted snow fibers.', lore: 'Lightweight yet surprisingly durable, perfect for quick maneuvers on the walls.', icon: '🦺', color: '#bde0fe' },
  { id: 'glacier_armor', name: 'Glacier Armor', slot: 'chestplate', rarity: FC_RARITY_RARE, attackBonus: 2, defenseBonus: 25, frostBonus: 12, forgeCost: 280, crystalCost: 25, levelReq: 16, description: 'Full body armor forged from living glacier ice that slowly regenerates.', lore: 'Glacier Armor repairs itself by absorbing moisture from the air.', icon: '🛡️', color: '#219ebc' },
  { id: 'cryo_plate', name: 'Cryo Plate', slot: 'chestplate', rarity: FC_RARITY_EPIC, attackBonus: 5, defenseBonus: 30, frostBonus: 18, forgeCost: 700, crystalCost: 50, levelReq: 24, description: 'Advanced cryo armor that generates a protective frost field around the wearer.', lore: 'Cryo Plates are the pinnacle of the Crystal Armory forging tradition.', icon: '🛡️', color: '#023e8a' },
  { id: 'citadel_royal_mail', name: 'Citadel Royal Mail', slot: 'chestplate', rarity: FC_RARITY_LEGENDARY, attackBonus: 10, defenseBonus: 40, frostBonus: 30, forgeCost: 2200, crystalCost: 140, levelReq: 42, description: 'The legendary armor of the Frost Sovereign, impervious to all damage.', lore: 'This mail was forged from the heart of the first glacier by the ancients.', icon: '🛡️', color: '#00e5ff' },
  // Boots (3)
  { id: 'ice_boots', name: 'Ice Boots', slot: 'boots', rarity: FC_RARITY_COMMON, attackBonus: 0, defenseBonus: 4, frostBonus: 2, forgeCost: 15, crystalCost: 2, levelReq: 1, description: 'Boots with soles of enchanted ice that never slip.', lore: 'Ice Boots let you walk on any frozen surface without losing traction.', icon: '👢', color: '#a2d2ff' },
  { id: 'glacier_treads', name: 'Glacier Treads', slot: 'boots', rarity: FC_RARITY_RARE, attackBonus: 0, defenseBonus: 10, frostBonus: 8, forgeCost: 150, crystalCost: 12, levelReq: 10, description: 'Heavy boots that leave a trail of frost, slowing any pursuer.', lore: 'Wearing Glacier Treads, you can outrun any creature on ice.', icon: '👢', color: '#89c2d9' },
  { id: 'frost_wind_boots', name: 'Frost Wind Boots', slot: 'boots', rarity: FC_RARITY_EPIC, attackBonus: 0, defenseBonus: 12, frostBonus: 12, forgeCost: 500, crystalCost: 35, levelReq: 22, description: 'Boots that create small ice tornadoes beneath each step for enhanced speed.', lore: 'Frost Wind Boots let you move as fast as the winter wind itself.', icon: '👢', color: '#48cae4' },
  // Rings & Amulets (4)
  { id: 'frost_ring', name: 'Ring of Frost', slot: 'ring', rarity: FC_RARITY_COMMON, attackBonus: 2, defenseBonus: 0, frostBonus: 5, forgeCost: 25, crystalCost: 3, levelReq: 1, description: 'A silver ring that glows with a faint blue frost.', lore: 'Given to every new recruit upon entering the citadel.', icon: '💍', color: '#caf0f8' },
  { id: 'glacial_amulet', name: 'Glacial Amulet', slot: 'amulet', rarity: FC_RARITY_UNCOMMON, attackBonus: 0, defenseBonus: 3, frostBonus: 12, forgeCost: 90, crystalCost: 8, levelReq: 7, description: 'An amulet containing water from a ten-thousand-year-old glacier.', lore: 'The water inside shifts and flows, showing visions of ancient frozen landscapes.', icon: '📿', color: '#48cae4' },
  { id: 'permafrost_signet', name: 'Permafrost Signet', slot: 'ring', rarity: FC_RARITY_EPIC, attackBonus: 8, defenseBonus: 5, frostBonus: 20, forgeCost: 600, crystalCost: 42, levelReq: 20, description: 'A signet ring that stamps commands in frost upon any surface.', lore: 'Used by ancient frost generals to issue orders that could not be disobeyed.', icon: '💍', color: '#023e8a' },
  { id: 'heart_of_glacier', name: 'Heart of the Glacier', slot: 'amulet', rarity: FC_RARITY_LEGENDARY, attackBonus: 10, defenseBonus: 15, frostBonus: 35, forgeCost: 2500, crystalCost: 150, levelReq: 45, description: 'A glowing blue gem that is the literal heart of the ancient glacier.', lore: 'It beats once every hundred years. Each beat causes an earthquake of ice.', icon: '💠', color: '#48cae4' },
]

// === CITADEL STRUCTURES (25) ===

export const FC_STRUCTURES: FcStructureDef[] = [
  { id: 'north_watchtower', name: 'North Watchtower', type: 'watchtower', zoneId: 'outer_wall', buildCost: 100, buildTime: 60, defenseBonus: 10, coinBonus: 2, description: 'A tall stone-and-ice watchtower overlooking the northern approach.', icon: '🗼', levelReq: 1 },
  { id: 'south_watchtower', name: 'South Watchtower', type: 'watchtower', zoneId: 'outer_wall', buildCost: 100, buildTime: 60, defenseBonus: 10, coinBonus: 2, description: 'A watchtower guarding the southern pass through the frozen mountains.', icon: '🗼', levelReq: 1 },
  { id: 'east_watchtower', name: 'East Watchtower', type: 'watchtower', zoneId: 'outer_wall', buildCost: 100, buildTime: 60, defenseBonus: 10, coinBonus: 2, description: 'A watchtower with a view of the frozen sea and approaching naval threats.', icon: '🗼', levelReq: 3 },
  { id: 'west_watchtower', name: 'West Watchtower', type: 'watchtower', zoneId: 'outer_wall', buildCost: 100, buildTime: 60, defenseBonus: 10, coinBonus: 2, description: 'A watchtower watching over the glacial plains to the west.', icon: '🗼', levelReq: 3 },
  { id: 'golem_barracks', name: 'Golem Barracks', type: 'barracks', zoneId: 'outer_wall', buildCost: 200, buildTime: 120, defenseBonus: 15, coinBonus: 5, description: 'Housing and training facilities for ice golems and snow sentries.', icon: '🏚️', levelReq: 5 },
  { id: 'wolf_den', name: 'Wolf Den', type: 'barracks', zoneId: 'outer_wall', buildCost: 180, buildTime: 100, defenseBonus: 12, coinBonus: 4, description: 'A heated den where winter wolves rest between patrols.', icon: '🐺', levelReq: 6 },
  { id: 'frost_library', name: 'Frost Library', type: 'library', zoneId: 'inner_keep', buildCost: 300, buildTime: 180, defenseBonus: 5, coinBonus: 8, description: 'An infinite library where books are carved from ice containing the knowledge of every winter.', icon: '📚', levelReq: 8 },
  { id: 'crystal_forge', name: 'Crystal Forge', type: 'forge', zoneId: 'crystal_armory', buildCost: 400, buildTime: 200, defenseBonus: 8, coinBonus: 12, description: 'A forge that uses cryo energy to shape weapons from enchanted crystals.', icon: '🔨', levelReq: 10 },
  { id: 'ice_temple', name: 'Temple of Eternal Frost', type: 'temple', zoneId: 'frozen_throne', buildCost: 500, buildTime: 300, defenseBonus: 20, coinBonus: 5, description: 'A sacred temple where frost spirits commune with the ancient winter gods.', icon: '⛪', levelReq: 12 },
  { id: 'reinforced_wall_north', name: 'Northern Reinforced Wall', type: 'wall', zoneId: 'outer_wall', buildCost: 150, buildTime: 90, defenseBonus: 25, coinBonus: 0, description: 'Thickened ice walls with embedded crystal reinforcements on the northern face.', icon: '🧱', levelReq: 4 },
  { id: 'reinforced_wall_south', name: 'Southern Reinforced Wall', type: 'wall', zoneId: 'outer_wall', buildCost: 150, buildTime: 90, defenseBonus: 25, coinBonus: 0, description: 'Double-layered ice walls protecting the southern gate.', icon: '🧱', levelReq: 4 },
  { id: 'ice_trap_field', name: 'Ice Trap Field', type: 'trap', zoneId: 'outer_wall', buildCost: 80, buildTime: 45, defenseBonus: 15, coinBonus: 0, description: 'A field of hidden ice spikes that activate when enemies step on them.', icon: '⚠️', levelReq: 3 },
  { id: 'frost_mine_tunnel', name: 'Frost Mine Tunnel', type: 'trap', zoneId: 'ice_dungeon', buildCost: 120, buildTime: 60, defenseBonus: 20, coinBonus: 0, description: 'Underground tunnels rigged with frost explosives.', icon: '💣', levelReq: 15 },
  { id: 'inner_gate_fortress', name: 'Inner Gate Fortress', type: 'gate', zoneId: 'inner_keep', buildCost: 250, buildTime: 150, defenseBonus: 30, coinBonus: 0, description: 'A massive fortified gate protecting the transition from outer wall to inner keep.', icon: '🚪', levelReq: 7 },
  { id: 'throne_guard_post', name: 'Throne Guard Post', type: 'barracks', zoneId: 'frozen_throne', buildCost: 350, buildTime: 180, defenseBonus: 18, coinBonus: 6, description: 'Elite guard quarters adjacent to the Frozen Throne.', icon: '⚔️', levelReq: 14 },
  { id: 'dragon_perch', name: 'Dragon Perch', type: 'barracks', zoneId: 'blizzard_tower', buildCost: 450, buildTime: 240, defenseBonus: 22, coinBonus: 8, description: 'An elevated platform where snow dragons and wyverns can rest between sorties.', icon: '🐲', levelReq: 20 },
  { id: 'rune_archive', name: 'Rune Archive', type: 'library', zoneId: 'ice_dungeon', buildCost: 350, buildTime: 200, defenseBonus: 5, coinBonus: 10, description: 'A vast underground archive of ancient frost rune inscriptions.', icon: '📜', levelReq: 16 },
  { id: 'permafrost_forge', name: 'Permafrost Forge', type: 'forge', zoneId: 'ice_dungeon', buildCost: 500, buildTime: 250, defenseBonus: 10, coinBonus: 15, description: 'A deep forge powered by permafrost geothermal energy.', icon: '⚒️', levelReq: 18 },
  { id: 'spirit_shrine', name: 'Spirit Shrine', type: 'temple', zoneId: 'frost_garden', buildCost: 280, buildTime: 160, defenseBonus: 12, coinBonus: 4, description: 'A serene shrine where frost spirits gather to restore their energy.', icon: '⛩️', levelReq: 12 },
  { id: 'crystal_greenhouse', name: 'Crystal Greenhouse', type: 'workshop', zoneId: 'frost_garden', buildCost: 200, buildTime: 120, defenseBonus: 3, coinBonus: 10, description: 'A greenhouse where rare cryo crystals are cultivated for forging.', icon: '🏡', levelReq: 13 },
  { id: 'glacier_treasury', name: 'Glacier Treasury', type: 'treasury', zoneId: 'inner_keep', buildCost: 600, buildTime: 300, defenseBonus: 5, coinBonus: 25, description: 'A heavily guarded vault that stores the citadel coin reserves.', icon: '🏦', levelReq: 15 },
  { id: 'siege_workshop', name: 'Siege Workshop', type: 'workshop', zoneId: 'crystal_armory', buildCost: 400, buildTime: 200, defenseBonus: 8, coinBonus: 12, description: 'A workshop where siege weapons and defensive mechanisms are crafted.', icon: '🔧', levelReq: 16 },
  { id: 'blizzard_generator', name: 'Blizzard Generator', type: 'workshop', zoneId: 'blizzard_tower', buildCost: 800, buildTime: 400, defenseBonus: 35, coinBonus: 8, description: 'An ancient machine that generates controlled blizzards around the citadel.', icon: '🌪️', levelReq: 22 },
  { id: 'frost_barracks_elite', name: 'Elite Frost Barracks', type: 'barracks', zoneId: 'eternal_glacier', buildCost: 700, buildTime: 350, defenseBonus: 25, coinBonus: 12, description: 'Elite quarters for the most powerful guardians of the citadel.', icon: '🏰', levelReq: 30 },
  { id: 'eternal_shrine', name: 'Eternal Shrine', type: 'temple', zoneId: 'eternal_glacier', buildCost: 1000, buildTime: 500, defenseBonus: 40, coinBonus: 10, description: 'The most sacred site in the citadel, where the original frost covenant was made.', icon: '⛪', levelReq: 35 },
]

// === WINTER SPELLS (22) ===

export const FC_SPELLS: FcSpellDef[] = [
  { id: 'frost_touch', name: 'Frost Touch', school: 'cryo', rarity: FC_RARITY_COMMON, power: 12, manaCost: 5, cooldown: 1, unlockLevel: 1, description: 'A basic spell that freezes the surface of anything touched.', icon: '🧊', color: '#caf0f8' },
  { id: 'ice_shard_bolt', name: 'Ice Shard Bolt', school: 'cryo', rarity: FC_RARITY_COMMON, power: 18, manaCost: 8, cooldown: 2, unlockLevel: 1, description: 'Launches a volley of razor-sharp ice shards at the target.', icon: '❄️', color: '#a2d2ff' },
  { id: 'cryo_dart', name: 'Cryo Dart', school: 'cryo', rarity: FC_RARITY_UNCOMMON, power: 22, manaCost: 7, cooldown: 1, unlockLevel: 3, description: 'A focused bolt of intense cold that penetrates armor.', icon: '💠', color: '#48cae4' },
  { id: 'frozen_armor', name: 'Frozen Armor', school: 'glacier', rarity: FC_RARITY_COMMON, power: 0, manaCost: 10, cooldown: 3, unlockLevel: 2, description: 'Encases the caster in a protective layer of hardened ice.', icon: '🛡️', color: '#89c2d9' },
  { id: 'glacier_wall_spell', name: 'Glacier Wall', school: 'glacier', rarity: FC_RARITY_UNCOMMON, power: 5, manaCost: 18, cooldown: 4, unlockLevel: 5, description: 'Raises a massive wall of glacial ice that blocks attacks and passage.', icon: '🧱', color: '#023e8a' },
  { id: 'permafrost_bind', name: 'Permafrost Bind', school: 'permafrost', rarity: FC_RARITY_RARE, power: 20, manaCost: 16, cooldown: 3, unlockLevel: 7, description: 'Roots the target in place with ancient permafrost that never melts.', icon: '⛓️', color: '#219ebc' },
  { id: 'aurora_veil', name: 'Aurora Veil', school: 'rime', rarity: FC_RARITY_RARE, power: 0, manaCost: 22, cooldown: 5, unlockLevel: 8, description: 'Wraps allies in a shimmering aurora that deflects spells and heals wounds.', icon: '🌈', color: '#48cae4' },
  { id: 'frost_nova', name: 'Frost Nova', school: 'blizzard', rarity: FC_RARITY_RARE, power: 45, manaCost: 25, cooldown: 4, unlockLevel: 10, description: 'Releases a shockwave of absolute cold in all directions.', icon: '💥', color: '#caf0f8' },
  { id: 'crystal_shatter', name: 'Crystal Shatter', school: 'rime', rarity: FC_RARITY_RARE, power: 40, manaCost: 18, cooldown: 3, unlockLevel: 9, description: 'Creates crystals around the target and detonates them simultaneously.', icon: '💎', color: '#00e5ff' },
  { id: 'cryostasis', name: 'Cryostasis', school: 'permafrost', rarity: FC_RARITY_EPIC, power: 0, manaCost: 35, cooldown: 8, unlockLevel: 12, description: 'Puts the target in complete suspended animation, frozen in time and ice.', icon: '🧊', color: '#023e8a' },
  { id: 'winter_grasp', name: 'Winter Grasp', school: 'permafrost', rarity: FC_RARITY_EPIC, power: 50, manaCost: 28, cooldown: 5, unlockLevel: 16, description: 'The ground erupts with frozen hands that drag enemies into the permafrost.', icon: '🖐️', color: '#023e8a' },
  { id: 'absolute_zero', name: 'Absolute Zero', school: 'permafrost', rarity: FC_RARITY_LEGENDARY, power: 80, manaCost: 50, cooldown: 10, unlockLevel: 20, description: 'Drops the temperature to absolute zero, shattering matter at the molecular level.', icon: '🔵', color: '#03045e' },
  { id: 'blizzard_surge', name: 'Blizzard Surge', school: 'blizzard', rarity: FC_RARITY_EPIC, power: 65, manaCost: 38, cooldown: 7, unlockLevel: 18, description: 'Unleashes the full fury of a class-five blizzard upon the battlefield.', icon: '🌨️', color: '#e0fbfc' },
  { id: 'aurora_healing', name: 'Aurora Healing', school: 'rime', rarity: FC_RARITY_RARE, power: -30, manaCost: 20, cooldown: 4, unlockLevel: 10, description: 'Wraps the target in aurora light that mends wounds and restores vitality.', icon: '💚', color: '#48cae4' },
  { id: 'frost_bloom', name: 'Frost Bloom', school: 'rime', rarity: FC_RARITY_COMMON, power: 8, manaCost: 6, cooldown: 2, unlockLevel: 2, description: 'Summons beautiful frost flowers that heal allies in their radius.', icon: '🌸', color: '#bde0fe' },
  { id: 'ice_prison', name: 'Ice Prison', school: 'glacier', rarity: FC_RARITY_RARE, power: 10, manaCost: 22, cooldown: 5, unlockLevel: 11, description: 'Encloses the target in an inescapable dome of thick ice.', icon: '🔒', color: '#e0fbfc' },
  { id: 'rime_arrow', name: 'Rime Arrow', school: 'rime', rarity: FC_RARITY_UNCOMMON, power: 20, manaCost: 10, cooldown: 2, unlockLevel: 6, description: 'Fires an arrow of pure rime that slows and damages the target.', icon: '🏹', color: '#89c2d9' },
  { id: 'glacier_charge', name: 'Glacier Charge', school: 'glacier', rarity: FC_RARITY_EPIC, power: 70, manaCost: 35, cooldown: 6, unlockLevel: 17, description: 'Surrounds the caster with a glacier and charges forward, crushing everything.', icon: '🏔️', color: '#89c2d9' },
  { id: 'frostfire_burst', name: 'Frostfire Burst', school: 'frostfire', rarity: FC_RARITY_LEGENDARY, power: 75, manaCost: 45, cooldown: 8, unlockLevel: 25, description: 'An explosion of paradoxical frostfire that freezes and burns simultaneously.', icon: '🔥', color: '#00e5ff' },
  { id: 'crystal_storm', name: 'Crystal Storm', school: 'rime', rarity: FC_RARITY_EPIC, power: 60, manaCost: 32, cooldown: 6, unlockLevel: 15, description: 'Summons a hurricane of razor-sharp crystal shards.', icon: '🌪️', color: '#00e5ff' },
  { id: 'permafrost_avalanche', name: 'Permafrost Avalanche', school: 'permafrost', rarity: FC_RARITY_LEGENDARY, power: 90, manaCost: 55, cooldown: 12, unlockLevel: 30, description: 'Triggers a catastrophic avalanche of ancient frozen earth.', icon: '🏔️', color: '#03045e' },
  { id: 'ice_mirror_reflect', name: 'Ice Mirror Reflect', school: 'rime', rarity: FC_RARITY_UNCOMMON, power: 0, manaCost: 12, cooldown: 4, unlockLevel: 5, description: 'Creates a reflective ice mirror that bounces spells back at attackers.', icon: '🪞', color: '#a2d2ff' },
]

// === TRAP DEFINITIONS (8) ===

export const FC_SIEGE_ENEMIES = [
  { id: 'frost_raider', name: 'Frost Raider', power: 8, hp: 40, speed: 12, description: 'A bandit wielding ice-picked weapons.', icon: '🗡️', coinDrop: 5 },
  { id: 'snow_troll', name: 'Snow Troll', power: 15, hp: 80, speed: 6, description: 'A hulking troll covered in frozen mud and rock.', icon: '👹', coinDrop: 10 },
  { id: 'ice_wraith', name: 'Ice Wraith', power: 20, hp: 50, speed: 18, description: 'A spectral being that drains warmth from living things.', icon: '👻', coinDrop: 12 },
  { id: 'glacier_orc', name: 'Glacier Orc', power: 25, hp: 100, speed: 8, description: 'An armored orc from the glacier wastes beyond the tundra.', icon: '👺', coinDrop: 15 },
  { id: 'frost_mage_enemy', name: 'Frost Mage', power: 30, hp: 60, speed: 14, description: 'A rival cryomancer seeking to claim the citadel secrets.', icon: '🧙', coinDrop: 18 },
  { id: 'stone_giant', name: 'Stone Giant', power: 35, hp: 200, speed: 4, description: 'A massive giant immune to cold, hurling boulders at the walls.', icon: '🪨', coinDrop: 25 },
  { id: 'fire_demon', name: 'Fire Demon', power: 40, hp: 120, speed: 16, description: 'A creature of living flame, the natural enemy of the citadel.', icon: '🔥', coinDrop: 30 },
  { id: 'shadow_dragon', name: 'Shadow Dragon', power: 50, hp: 180, speed: 14, description: 'A dragon wreathed in darkness and charged with anti-frost energy.', icon: '🐲', coinDrop: 40 },
  { id: 'warlord_krampus', name: 'Warlord Krampus', power: 60, hp: 250, speed: 10, description: 'A legendary warlord who leads the great winter invasions.', icon: '😈', coinDrop: 50 },
  { id: 'ancient_fire_titan', name: 'Ancient Fire Titan', power: 80, hp: 400, speed: 6, description: 'A primordial titan of fire, ancient enemy of the frost citadel.', icon: '🌋', coinDrop: 75 },
] as const

export const FC_FORTIFICATION_TYPES = [
  { id: 'ice_reinforcement', name: 'Ice Reinforcement', costPerHp: 2, maxHpPerUse: 50, description: 'Reinforces walls with compacted ice blocks.', icon: '🧱' },
  { id: 'crystal_lattice', name: 'Crystal Lattice', costPerHp: 4, maxHpPerUse: 100, description: 'Embeds crystal lattices into the wall structure for greater resilience.', icon: '💎' },
  { id: 'permafrost_foundation', name: 'Permafrost Foundation', costPerHp: 6, maxHpPerUse: 150, description: 'Deepens the permafrost beneath the wall for ultimate stability.', icon: '🏔️' },
  { id: 'frost_enchantment', name: 'Frost Enchantment', costPerHp: 8, maxHpPerUse: 200, description: 'Enchants the wall with ancient frost magic that regenerates damage.', icon: '✨' },
] as const

export const FC_PATROL_QUEST_TYPES = [
  { id: 'wall_patrol', name: 'Wall Patrol', description: 'Patrol the outer walls for any signs of enemy approach.', zones: 2, enemies: 2, coins: 20, xp: 30, icon: '🔍' },
  { id: 'zone_sweep', name: 'Zone Sweep', description: 'Sweep through all unlocked zones to check for infiltrators.', zones: 4, enemies: 5, coins: 45, xp: 60, icon: '🏛️' },
  { id: 'perimeter_check', name: 'Perimeter Check', description: 'Conduct a thorough perimeter check of the citadel defenses.', zones: 6, enemies: 8, coins: 70, xp: 100, icon: '🧭' },
 { id: 'deep_recon', name: 'Deep Reconnaissance', description: 'Send scouts deep into enemy territory for intelligence.', zones: 3, enemies: 10, coins: 60, xp: 80, icon: '🔭' },
  { id: 'full_citadel_patrol', name: 'Full Citadel Patrol', description: 'Patrol every zone and defend against any threats found.', zones: 8, enemies: 15, coins: 120, xp: 200, icon: '🏰' },
] as const

export const FC_BLIZZARD_BONUSES = [
  { id: 'crystal_shower', name: 'Crystal Shower', description: 'Blizzard deposits extra ice crystals across the citadel.', crystalReward: 15, coinMultiplier: 1.2, icon: '💎' },
  { id: 'frost_bloom_wave', name: 'Frost Bloom Wave', description: 'The blizzard triggers mass blooming in the Frost Garden.', crystalReward: 20, coinMultiplier: 1.0, icon: '🌸' },
  { id: 'guardian_boost', name: 'Guardian Frost Boost', description: 'The cold empowers all deployed guardians temporarily.', crystalReward: 5, coinMultiplier: 1.5, icon: '💪' },
 { id: 'forge_heat', name: 'Forge Heating', description: 'Extreme cold paradoxically supercharges the Crystal Forge.', crystalReward: 25, coinMultiplier: 1.3, icon: '🔥' },
] as const

export const FC_COIN_REWARDS = {
  siegeWave: { base: 30, perPower: 1.5, survivalMultiplier: 2.0 },
  dailyPatrol: { perZone: 15, perEnemy: 8, streakBonus: 10 },
  blizzardSurvival: { base: 50, perIntensityLevel: 50 },
  structureCoinBonus: { base: 2, perLevel: 2 },
  achievementBonus: { base: 0, multiplier: 1.0 },
} as const

export const FC_TRAINING_COSTS = {
  basic: { coins: 10, xp: 20 },
  advanced: { coins: 25, xp: 50 },
  elite: { coins: 60, xp: 120 },
  legendary: { coins: 150, xp: 300 },
} as const

export const FC_GUARDIAN_TYPE_ICONS: Record<FcGuardianType, string> = {
  golem: '🗿', wolf: '🐺', giant: '👹', knight: '⚔️', dragon: '🐲',
  elemental: '🌊', spirit: '🧚', beast: '🦁', archer: '🏹', mage: '🧙',
}

export const FC_WEAPON_SLOT_ICONS: Record<FcWeaponSlot, string> = {
  weapon: '⚔️', shield: '🛡️', helmet: '⛑️', chestplate: '🦺', boots: '👢', ring: '💍', amulet: '📿',
}

export const FC_STRUCTURE_TYPE_ICONS: Record<FcStructureType, string> = {
  watchtower: '🗼', barracks: '🏚️', library: '📚', forge: '🔨', temple: '⛪',
  wall: '🧱', trap: '⚠️', gate: '🚪', treasury: '🏦', workshop: '🔧',
}

export const FC_SPELL_SCHOOL_ICONS: Record<FcSpellSchool, string> = {
  cryo: '🧊', glacier: '🏔️', blizzard: '🌨️', rime: '❄️', frostfire: '🔥', permafrost: '💎',
}

export const FC_ZONE_ICONS: Record<FcZoneId, string> = {
  outer_wall: '🧱', inner_keep: '🏰', frozen_throne: '👑', crystal_armory: '⚒️',
  ice_dungeon: '🕳️', blizzard_tower: '🗼', frost_garden: '🌸', eternal_glacier: '🏔️',
}


export const FC_TRAPS: FcTrapDef[] = [
  { id: 'frost_spike', name: 'Frost Spike', zoneId: 'outer_wall', damage: 15, charges: 3, cost: 20, description: 'Ice spikes that erupt from the ground when triggered.', icon: '📍' },
  { id: 'blizzard_trap', name: 'Blizzard Trap', zoneId: 'outer_wall', damage: 25, charges: 2, cost: 40, description: 'Releases a localized blizzard that slows all enemies in range.', icon: '🌪️' },
  { id: 'crystal_shard_mine', name: 'Crystal Shard Mine', zoneId: 'inner_keep', damage: 35, charges: 1, cost: 60, description: 'An explosive crystal that shatters into deadly shards.', icon: '💎' },
  { id: 'permafrost_pit', name: 'Permafrost Pit', zoneId: 'inner_keep', damage: 40, charges: 2, cost: 50, description: 'A hidden pit lined with permafrost that freezes anything that falls in.', icon: '🕳️' },
  { id: 'ice_wall_collapse', name: 'Ice Wall Collapse', zoneId: 'frozen_throne', damage: 50, charges: 1, cost: 80, description: 'A section of reinforced wall that collapses on command.', icon: '🧱' },
  { id: 'frost_vine', name: 'Frost Vine', zoneId: 'frost_garden', damage: 20, charges: 3, cost: 30, description: 'Frozen vines that entangle and freeze intruders.', icon: '🌿' },
  { id: 'glacial_eruption', name: 'Glacial Eruption', zoneId: 'eternal_glacier', damage: 60, charges: 1, cost: 100, description: 'Triggers a miniature glacial eruption of ice and rock.', icon: '🌋' },
  { id: 'cryo_freeze_field', name: 'Cryo Freeze Field', zoneId: 'blizzard_tower', damage: 30, charges: 2, cost: 45, description: 'A field of absolute cold that freezes enemies solid.', icon: '❄️' },
]

// === LEVEL TITLES (8) ===

export const FC_TITLES: FcTitleDef[] = [
  { level: 1, title: 'Frozen Recruit', description: 'A new recruit to the Frost Citadel, learning the basics of citadel defense.', icon: '🧊' },
  { level: 5, title: 'Ice Sentinel', description: 'A proven defender of the outer walls, trusted with basic patrol duties.', icon: '❄️' },
  { level: 10, title: 'Frost Warden', description: 'A warden of the inner keep, commanding squads of frozen guardians.', icon: '🛡️' },
  { level: 15, title: 'Glacial Commander', description: 'A commander of the citadel forces, leading defense against major sieges.', icon: '⚔️' },
  { level: 20, title: 'Blizzard Architect', description: 'Master of blizzard magic, capable of shaping the weather itself.', icon: '🌨️' },
  { level: 30, title: 'Crystal Sovereign', description: 'A sovereign of the crystal arts, wielding power over enchanted ice.', icon: '💎' },
  { level: 40, title: 'Permafrost Archon', description: 'An archon of ancient permafrost, commanding the deepest frozen powers.', icon: '🏔️' },
  { level: 50, title: 'Eternal Winter Sovereign', description: 'The supreme ruler of the Frost Citadel and all frozen realms.', icon: '👑' },
]

// === ACHIEVEMENTS (18) ===

export const FC_ACHIEVEMENTS: FcAchievementDef[] = [
  { id: 'first_recruit', name: 'First Guardian', description: 'Recruit your first frost guardian.', condition: 'totalGuardiansRecruited >= 1', rewardXp: 50, rewardCoins: 20, hidden: false, icon: '🧊' },
  { id: 'guardian_5', name: 'Small Garrison', description: 'Recruit 5 different frost guardians.', condition: 'guardians >= 5', rewardXp: 100, rewardCoins: 50, hidden: false, icon: '❄️' },
  { id: 'guardian_15', name: 'Growing Army', description: 'Recruit 15 different frost guardians.', condition: 'guardians >= 15', rewardXp: 300, rewardCoins: 150, hidden: false, icon: '🐺' },
  { id: 'guardian_35', name: 'Full Roster', description: 'Recruit all 35 frost guardians.', condition: 'guardians >= 35', rewardXp: 1500, rewardCoins: 500, hidden: true, icon: '👑' },
  { id: 'first_siege', name: 'First Blood', description: 'Defend your first siege wave.', condition: 'totalSiegesDefended >= 1', rewardXp: 80, rewardCoins: 40, hidden: false, icon: '⚔️' },
  { id: 'siege_10', name: 'Veteran Defender', description: 'Defend 10 siege waves.', condition: 'totalSiegesDefended >= 10', rewardXp: 300, rewardCoins: 200, hidden: false, icon: '🛡️' },
  { id: 'siege_50', name: 'Siege Master', description: 'Defend 50 siege waves.', condition: 'totalSiegesDefended >= 50', rewardXp: 1000, rewardCoins: 500, hidden: false, icon: '🏆' },
  { id: 'siege_100', name: 'Citadel Legend', description: 'Defend 100 siege waves.', condition: 'totalSiegesDefended >= 100', rewardXp: 2500, rewardCoins: 1000, hidden: true, icon: '🌟' },
  { id: 'forge_5', name: 'Novice Blacksmith', description: 'Forge 5 different cryo weapons.', condition: 'weapons >= 5', rewardXp: 150, rewardCoins: 80, hidden: false, icon: '🔨' },
  { id: 'forge_30', name: 'Master Forgemaster', description: 'Forge all 30 cryo weapons.', condition: 'weapons >= 30', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '⚒️' },
  { id: 'build_10', name: 'Architect', description: 'Build 10 citadel structures.', condition: 'structures >= 10', rewardXp: 200, rewardCoins: 100, hidden: false, icon: '🏗️' },
  { id: 'build_25', name: 'Grand Architect', description: 'Build all 25 citadel structures.', condition: 'structures >= 25', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '🏰' },
  { id: 'spell_10', name: 'Frost Scholar', description: 'Learn 10 different winter spells.', condition: 'spells >= 10', rewardXp: 200, rewardCoins: 100, hidden: false, icon: '📖' },
  { id: 'spell_22', name: 'Grand Cryomancer', description: 'Learn all 22 winter spells.', condition: 'spells >= 22', rewardXp: 2000, rewardCoins: 800, hidden: true, icon: '🧙' },
  { id: 'blizzard_5', name: 'Storm Survivor', description: 'Survive 5 blizzards.', condition: 'totalBlizzardsSurvived >= 5', rewardXp: 200, rewardCoins: 100, hidden: false, icon: '🌨️' },
  { id: 'streak_7', name: 'Weekly Watch', description: 'Maintain a 7-day patrol streak.', condition: 'streak >= 7', rewardXp: 300, rewardCoins: 150, hidden: false, icon: '📅' },
  { id: 'max_level', name: 'Frost Apex', description: 'Reach the maximum level of 50.', condition: 'level >= 50', rewardXp: 3000, rewardCoins: 1500, hidden: true, icon: '🏔️' },
  { id: 'legendary_guardian', name: 'Mythic Commander', description: 'Recruit a legendary guardian.', condition: 'legendary >= 1', rewardXp: 500, rewardCoins: 250, hidden: false, icon: '⭐' },
]

// === MAX LEVEL & XP TABLE ===

export const FC_MAX_LEVEL = 50

export const FC_XP_TABLE: number[] = (() => {
  const table: number[] = [0]
  for (let i = 1; i <= FC_MAX_LEVEL; i++) {
    table[i] = Math.floor(85 * Math.pow(i, 1.32) + i * 18)
  }
  return table
})()

// === DEFAULT STATE ===

function fcCreateDefaultState(): FrostCitadelState {
  const now = new Date()
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 100,
    totalCoinsEarned: 100,
    guardians: [],
    weapons: FC_WEAPONS.map(w => ({ weaponId: w.id, owned: false, equipped: false, forgedAt: null, upgradeLevel: 0 })),
    zones: FC_ZONES.map(z => ({
      zoneId: z.id,
      unlocked: z.unlockLevel <= 1,
      wallHp: z.unlockLevel <= 1 ? z.wallHp : 0,
      maxWallHp: z.maxWallHp,
      guardiansDeployed: 0,
      totalDefenseEvents: 0,
      lastPatrolledAt: null,
    })),
    structures: FC_STRUCTURES.map(s => ({ structureId: s.id, built: false, level: 0, builtAt: null })),
    spells: FC_SPELLS.map(s => ({ spellId: s.id, learned: s.unlockLevel <= 1, mastery: 0, castCount: 0 })),
    achievements: FC_ACHIEVEMENTS.map(a => ({ achievementId: a.id, unlocked: false, unlockedAt: null })),
    traps: FC_TRAPS.map(t => ({ trapId: t.id, zoneId: t.zoneId, placed: false, charges: t.charges, damage: t.damage, placedAt: null })),
    title: FC_TITLES[0].title,
    totalGuardiansRecruited: 0,
    totalGuardiansDeployed: 0,
    totalSiegesDefended: 0,
    totalSiegesLost: 0,
    totalWavesDefeated: 0,
    totalWeaponsForged: 0,
    totalSpellsCast: 0,
    totalAchievements: 0,
    totalStructuresBuilt: 0,
    totalTrapsPlaced: 0,
    totalBlizzardsSurvived: 0,
    currentSiege: null,
    currentBlizzard: null,
    dailyPatrol: { date: todayKey, completed: false, zonesPatrolled: 0, enemiesDefeated: 0, coinsEarned: 0, xpEarned: 0 },
    streak: 0,
    bestStreak: 0,
    seed: Date.now(),
    tick: 0,
    iceCrystals: 10,
  }
}

// === HELPER FUNCTIONS (module-level) ===

function fcGetTitleForLevel(level: number): string {
  let title = FC_TITLES[0].title
  for (const t of FC_TITLES) {
    if (level >= t.level) title = t.title
  }
  return title
}

function fcGetXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FC_MAX_LEVEL) return Infinity
  return FC_XP_TABLE[level] ?? 100
}

function fcGetTodayKey(): string {
  const now = new Date()
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
}

function fcGetPreviousDayKey(todayKey: string): string {
  const parts = todayKey.split('-').map(Number)
  const date = new Date(parts[0], parts[1] - 1, parts[2])
  date.setDate(date.getDate() - 1)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function fcRandomFromSeed(seed: number, index: number): number {
  let s = seed + index * 2654435761
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b)
  s ^= s >>> 16
  return (s >>> 0) / 4294967296
}

// === HOOK ===

export default function useFrostCitadel() {
  const stateRef = useRef<FrostCitadelState>(fcCreateDefaultState())
  const [state, setState] = useState<FrostCitadelState>(() => {
    if (typeof window === 'undefined') return fcCreateDefaultState()
    try {
      const saved = localStorage.getItem('frost-citadel-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        return { ...fcCreateDefaultState(), ...parsed }
      }
    } catch {
      // ignore parse errors
    }
    return fcCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('frost-citadel-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // === COMPUTED VALUES (useMemo) ===

  const xpProgress = useMemo(() => {
    const needed = fcGetXpRequiredForLevel(state.level)
    if (needed === Infinity || needed <= 0) return 1
    return Math.min(1, state.xp / needed)
  }, [state.level, state.xp])

  const overallProgress = useMemo(() => state.level / FC_MAX_LEVEL, [state.level])

  const unlockedZoneCount = useMemo(() => state.zones.filter(z => z.unlocked).length, [state.zones])

  const deployedGuardians = useMemo(() => state.guardians.filter(g => g.deployed).length, [state.guardians])

  const totalDefenseRating = useMemo(() => {
    const guardianPower = state.guardians.reduce((sum, g) => {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      return sum + (def ? def.attack + def.defense + def.magic + g.level * 2 : 0)
    }, 0)
    const structureBonus = state.structures.filter(s => s.built).reduce((sum, s) => {
      const def = FC_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.defenseBonus * (s.level + 1) : 0)
    }, 0)
    const wallHp = state.zones.reduce((sum, z) => sum + z.wallHp, 0)
    return guardianPower + structureBonus + Math.floor(wallHp / 10)
  }, [state.guardians, state.structures, state.zones])

  const currentSiegeActive = useMemo(() => state.currentSiege !== null && !state.currentSiege.survived, [state.currentSiege])

  const currentBlizzardActive = useMemo(() => state.currentBlizzard !== null && !state.currentBlizzard.survived, [state.currentBlizzard])

  const guardianCount = useMemo(() => state.guardians.length, [state.guardians])

  const legendaryGuardianCount = useMemo(() => {
    return state.guardians.filter(g => {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      return def && def.rarity === FC_RARITY_LEGENDARY
    }).length
  }, [state.guardians])

  const weaponCount = useMemo(() => state.weapons.filter(w => w.owned).length, [state.weapons])

  const learnedSpellCount = useMemo(() => state.spells.filter(s => s.learned).length, [state.spells])

  const builtStructureCount = useMemo(() => state.structures.filter(s => s.built).length, [state.structures])

  const unlockedAchievementCount = useMemo(() => state.achievements.filter(a => a.unlocked).length, [state.achievements])

  const patrolCompletedToday = useMemo(() => {
    return state.dailyPatrol.date === fcGetTodayKey() && state.dailyPatrol.completed
  }, [state.dailyPatrol])

  // === SIMPLE GETTERS ===

  const fcGetLevel = (): number => state.level
  const fcGetXp = (): number => state.xp
  const fcGetTotalXp = (): number => state.totalXp
  const fcGetCoins = (): number => state.coins
  const fcGetTitle = (): string => state.title
  const fcGetIceCrystals = (): number => state.iceCrystals
  const fcGetGuardians = (): FcGuardianEntity[] => state.guardians
  const fcGetWeapons = (): FcWeaponEntity[] => state.weapons
  const fcGetZones = (): FcZoneEntity[] => state.zones
  const fcGetStructures = (): FcStructureEntity[] => state.structures
  const fcGetSpells = (): FcSpellEntity[] => state.spells
  const fcGetAchievements = (): FcAchievementEntity[] => state.achievements
  const fcGetTraps = (): FcTrapEntity[] => state.traps
  const fcGetStreak = (): number => state.streak
  const fcGetBestStreak = (): number => state.bestStreak
  const fcGetDailyPatrol = (): FcDailyPatrol => state.dailyPatrol
  const fcGetCurrentSiege = (): FcSiegeWave | null => state.currentSiege
  const fcGetCurrentBlizzard = (): FcBlizzardEvent | null => state.currentBlizzard
  const fcGetTotalSiegesDefended = (): number => state.totalSiegesDefended
  const fcGetTotalWeaponsForged = (): number => state.totalWeaponsForged
  const fcGetTotalSpellsCast = (): number => state.totalSpellsCast
  const fcGetTotalBlizzardsSurvived = (): number => state.totalBlizzardsSurvived
  const fcGetXpRequired = (): number => fcGetXpRequiredForLevel(state.level)

  // === LOOKUP HELPERS ===

  const fcGetGuardianDef = useCallback((guardianId: string): FcGuardianDef | null => {
    return FC_GUARDIANS.find(g => g.id === guardianId) ?? null
  }, [])

  const fcGetWeaponDef = useCallback((weaponId: string): FcWeaponDef | null => {
    return FC_WEAPONS.find(w => w.id === weaponId) ?? null
  }, [])

  const fcGetZoneDef = useCallback((zoneId: string): FcZoneDef | null => {
    return FC_ZONES.find(z => z.id === zoneId) ?? null
  }, [])

  const fcGetStructureDef = useCallback((structureId: string): FcStructureDef | null => {
    return FC_STRUCTURES.find(s => s.id === structureId) ?? null
  }, [])

  const fcGetSpellDef = useCallback((spellId: string): FcSpellDef | null => {
    return FC_SPELLS.find(s => s.id === spellId) ?? null
  }, [])

  const fcGetAchievementDef = useCallback((achievementId: string): FcAchievementDef | null => {
    return FC_ACHIEVEMENTS.find(a => a.id === achievementId) ?? null
  }, [])

  const fcGetRarityColor = useCallback((rarity: FcRarity): string => FC_RARITY_COLORS[rarity] ?? FC_COLOR_SILVER, [])
  const fcGetRarityIcon = useCallback((rarity: FcRarity): string => FC_RARITY_ICONS[rarity] ?? '🧊', [])
  const fcGetRarityName = useCallback((rarity: FcRarity): string => {
    const names: Record<FcRarity, string> = { common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic', legendary: 'Legendary' }
    return names[rarity] ?? 'Unknown'
  }, [])

  // === STATE MODIFIERS (useCallback) ===

  const fcAddXp = useCallback((amount: number) => {
    setState(prev => {
      let { level, xp, totalXp } = prev
      const gained = Math.floor(amount)
      xp += gained
      totalXp += gained
      while (level < FC_MAX_LEVEL && xp >= fcGetXpRequiredForLevel(level)) {
        xp -= fcGetXpRequiredForLevel(level)
        level += 1
      }
      if (level >= FC_MAX_LEVEL) xp = 0
      const title = fcGetTitleForLevel(level)
      const newZones = prev.zones.map(z => {
        const def = FC_ZONES.find(d => d.id === z.zoneId)
        if (!def) return z
        if (level >= def.unlockLevel && !z.unlocked) {
          return { ...z, unlocked: true, wallHp: Math.max(z.wallHp, def.wallHp) }
        }
        return z
      })
      return { ...prev, level: Math.min(level, FC_MAX_LEVEL), xp, totalXp, title, zones: newZones }
    })
  }, [])

  const fcAddCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }))
  }, [])

  const fcSpendCoins = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.coins < amount) return prev
      success = true
      return { ...prev, coins: prev.coins - amount }
    })
    return success
  }, [])

  const fcAddCrystals = useCallback((amount: number) => {
    setState(prev => ({ ...prev, iceCrystals: prev.iceCrystals + amount }))
  }, [])

  const fcSpendCrystals = useCallback((amount: number): boolean => {
    let success = false
    setState(prev => {
      if (prev.iceCrystals < amount) return prev
      success = true
      return { ...prev, iceCrystals: prev.iceCrystals - amount }
    })
    return success
  }, [])

  const fcRecruitGuard = useCallback((guardianId: string): boolean => {
    let success = false
    setState(prev => {
      const def = FC_GUARDIANS.find(g => g.id === guardianId)
      if (!def) return prev
      if (prev.coins < def.recruitCost) return prev
      if (prev.guardians.some(g => g.guardianId === guardianId)) return prev
      success = true
      const entity: FcGuardianEntity = {
        guardianId, nickname: def.name, level: 1, xp: 0,
        hp: def.hp, maxHp: def.hp, deployed: false, zoneId: null, recruitedAt: Date.now(),
      }
      return {
        ...prev, coins: prev.coins - def.recruitCost,
        guardians: [...prev.guardians, entity],
        totalGuardiansRecruited: prev.totalGuardiansRecruited + 1,
      }
    })
    return success
  }, [])

  const fcDeployGuard = useCallback((guardianId: string, zoneId: FcZoneId): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.guardians.findIndex(g => g.guardianId === guardianId)
      if (idx === -1) return prev
      const zoneEntity = prev.zones.find(z => z.zoneId === zoneId)
      if (!zoneEntity || !zoneEntity.unlocked) return prev
      const zoneDef = FC_ZONES.find(z => z.id === zoneId)
      if (!zoneDef) return prev
      const deployedInZone = prev.guardians.filter(g => g.deployed && g.zoneId === zoneId).length
      if (deployedInZone >= zoneDef.maxGuardians) return prev
      success = true
      const newGuardians = [...prev.guardians]
      newGuardians[idx] = { ...newGuardians[idx], deployed: true, zoneId }
      return { ...prev, guardians: newGuardians, totalGuardiansDeployed: prev.totalGuardiansDeployed + 1 }
    })
    return success
  }, [])

  const fcRecallGuard = useCallback((guardianId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.guardians.findIndex(g => g.guardianId === guardianId)
      if (idx === -1) return prev
      if (!prev.guardians[idx].deployed) return prev
      success = true
      const newGuardians = [...prev.guardians]
      newGuardians[idx] = { ...newGuardians[idx], deployed: false, zoneId: null }
      return { ...prev, guardians: newGuardians }
    })
    return success
  }, [])

  const fcTrainGuard = useCallback((guardianId: string, xpAmount: number) => {
    setState(prev => {
      const idx = prev.guardians.findIndex(g => g.guardianId === guardianId)
      if (idx === -1) return prev
      const guardian = prev.guardians[idx]
      const def = FC_GUARDIANS.find(g => g.id === guardianId)
      if (!def) return prev
      const newGuardians = [...prev.guardians]
      let newXp = guardian.xp + Math.floor(xpAmount)
      let newLevel = guardian.level
      while (newLevel < FC_MAX_LEVEL && newXp >= fcGetXpRequiredForLevel(newLevel)) {
        newXp -= fcGetXpRequiredForLevel(newLevel)
        newLevel += 1
      }
      if (newLevel >= FC_MAX_LEVEL) newXp = 0
      newGuardians[idx] = {
        ...guardian, level: Math.min(newLevel, FC_MAX_LEVEL), xp: newXp,
        maxHp: def.hp + (newLevel - 1) * 12, hp: def.hp + (newLevel - 1) * 12,
      }
      return { ...prev, guardians: newGuardians }
    })
  }, [])

  const fcRenameGuard = useCallback((guardianId: string, nickname: string) => {
    setState(prev => {
      const idx = prev.guardians.findIndex(g => g.guardianId === guardianId)
      if (idx === -1) return prev
      const newGuardians = [...prev.guardians]
      newGuardians[idx] = { ...newGuardians[idx], nickname: nickname.slice(0, 30) }
      return { ...prev, guardians: newGuardians }
    })
  }, [])

  const fcDismissGuard = useCallback((guardianId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.guardians.findIndex(g => g.guardianId === guardianId)
      if (idx === -1) return prev
      success = true
      const newGuardians = [...prev.guardians]
      newGuardians.splice(idx, 1)
      return { ...prev, guardians: newGuardians }
    })
    return success
  }, [])

  const fcForgeWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.weapons.findIndex(w => w.weaponId === weaponId)
      if (idx === -1) return prev
      if (prev.weapons[idx].owned) return prev
      const def = FC_WEAPONS.find(w => w.id === weaponId)
      if (!def) return prev
      if (prev.coins < def.forgeCost || prev.iceCrystals < def.crystalCost) return prev
      if (prev.level < def.levelReq) return prev
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[idx] = { ...newWeapons[idx], owned: true, forgedAt: Date.now(), upgradeLevel: 1 }
      return {
        ...prev, coins: prev.coins - def.forgeCost, iceCrystals: prev.iceCrystals - def.crystalCost,
        weapons: newWeapons, totalWeaponsForged: prev.totalWeaponsForged + 1,
      }
    })
    return success
  }, [])

  const fcEquipWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.weapons.findIndex(w => w.weaponId === weaponId)
      if (idx === -1) return prev
      if (!prev.weapons[idx].owned) return prev
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[idx] = { ...newWeapons[idx], equipped: !newWeapons[idx].equipped }
      return { ...prev, weapons: newWeapons }
    })
    return success
  }, [])

  const fcUpgradeWeapon = useCallback((weaponId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.weapons.findIndex(w => w.weaponId === weaponId)
      if (idx === -1) return prev
      if (!prev.weapons[idx].owned) return prev
      const weapon = prev.weapons[idx]
      if (weapon.upgradeLevel >= 10) return prev
      const cost = 20 + weapon.upgradeLevel * 15
      if (prev.iceCrystals < cost) return prev
      success = true
      const newWeapons = [...prev.weapons]
      newWeapons[idx] = { ...weapon, upgradeLevel: weapon.upgradeLevel + 1 }
      return { ...prev, iceCrystals: prev.iceCrystals - cost, weapons: newWeapons }
    })
    return success
  }, [])

  const fcBuildStructure = useCallback((structureId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.structures.findIndex(s => s.structureId === structureId)
      if (idx === -1) return prev
      if (prev.structures[idx].built) return prev
      const def = FC_STRUCTURES.find(s => s.id === structureId)
      if (!def) return prev
      if (prev.coins < def.buildCost || prev.level < def.levelReq) return prev
      success = true
      const newStructures = [...prev.structures]
      newStructures[idx] = { ...newStructures[idx], built: true, level: 1, builtAt: Date.now() }
      return {
        ...prev, coins: prev.coins - def.buildCost,
        structures: newStructures, totalStructuresBuilt: prev.totalStructuresBuilt + 1,
      }
    })
    return success
  }, [])

  const fcUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.structures.findIndex(s => s.structureId === structureId)
      if (idx === -1) return prev
      if (!prev.structures[idx].built) return prev
      const structure = prev.structures[idx]
      if (structure.level >= 5) return prev
      const def = FC_STRUCTURES.find(s => s.id === structureId)
      if (!def) return prev
      const cost = Math.floor(def.buildCost * 0.5 * (structure.level + 1))
      if (prev.coins < cost) return prev
      success = true
      const newStructures = [...prev.structures]
      newStructures[idx] = { ...structure, level: structure.level + 1 }
      return { ...prev, coins: prev.coins - cost, structures: newStructures }
    })
    return success
  }, [])

  const fcFortifyWall = useCallback((zoneId: FcZoneId, amount: number) => {
    setState(prev => {
      const idx = prev.zones.findIndex(z => z.zoneId === zoneId)
      if (idx === -1) return prev
      const zone = prev.zones[idx]
      if (!zone.unlocked) return prev
      const newZones = [...prev.zones]
      newZones[idx] = { ...zone, wallHp: Math.min(zone.maxWallHp, zone.wallHp + amount) }
      return { ...prev, zones: newZones }
    })
  }, [])

  const fcPlaceTrap = useCallback((trapId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.traps.findIndex(t => t.trapId === trapId)
      if (idx === -1) return prev
      if (prev.traps[idx].placed) return prev
      const def = FC_TRAPS.find(t => t.id === trapId)
      if (!def) return prev
      if (prev.coins < def.cost) return prev
      success = true
      const newTraps = [...prev.traps]
      newTraps[idx] = { ...newTraps[idx], placed: true, charges: def.charges, placedAt: Date.now() }
      return { ...prev, coins: prev.coins - def.cost, traps: newTraps, totalTrapsPlaced: prev.totalTrapsPlaced + 1 }
    })
    return success
  }, [])

  const fcLearnSpell = useCallback((spellId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.spells.findIndex(s => s.spellId === spellId)
      if (idx === -1) return prev
      if (prev.spells[idx].learned) return prev
      const def = FC_SPELLS.find(s => s.id === spellId)
      if (!def || def.unlockLevel > prev.level) return prev
      success = true
      const newSpells = [...prev.spells]
      newSpells[idx] = { ...newSpells[idx], learned: true }
      return { ...prev, spells: newSpells }
    })
    return success
  }, [])

  const fcCastSpell = useCallback((spellId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.spells.findIndex(s => s.spellId === spellId)
      if (idx === -1) return prev
      const spell = prev.spells[idx]
      if (!spell.learned) return prev
      success = true
      const newSpells = [...prev.spells]
      newSpells[idx] = { ...spell, castCount: spell.castCount + 1, mastery: Math.min(100, spell.mastery + 1) }
      return { ...prev, spells: newSpells, totalSpellsCast: prev.totalSpellsCast + 1 }
    })
    return success
  }, [])

  const fcStartSiege = useCallback((severity: FcSiegeSeverity) => {
    setState(prev => {
      const powerMap: Record<FcSiegeSeverity, { enemies: number; power: number; duration: number }> = {
        scout: { enemies: 3, power: 30, duration: 30 },
        raid: { enemies: 6, power: 60, duration: 60 },
        assault: { enemies: 12, power: 100, duration: 90 },
        siege: { enemies: 20, power: 160, duration: 120 },
        apocalypse: { enemies: 30, power: 250, duration: 180 },
      }
      const config = powerMap[severity]
      const waveNumber = prev.totalSiegesDefended + prev.totalSiegesLost + 1
      const wave: FcSiegeWave = {
        id: `siege_${Date.now()}`, severity, waveNumber,
        enemyCount: config.enemies, enemyPower: config.power,
        startedAt: Date.now(), duration: config.duration,
        survived: false, damage: 0, coinsEarned: 0, xpEarned: 0,
      }
      return { ...prev, currentSiege: wave }
    })
  }, [])

  const fcDefendSiege = useCallback(() => {
    let result = { success: false, coinsEarned: 0, xpEarned: 0 }
    setState(prev => {
      if (!prev.currentSiege || prev.currentSiege.survived) return prev
      const damageTaken = Math.floor(prev.currentSiege.enemyPower * 0.3)
      const totalWallHp = prev.zones.reduce((sum, z) => sum + z.wallHp, 0)
      const survived = totalWallHp > damageTaken
      const coinsEarned = Math.floor(prev.currentSiege.enemyPower * (survived ? 1.5 : 0.3))
      const xpEarned = Math.floor(prev.currentSiege.enemyPower * (survived ? 2 : 0.5))
      const newZones = survived ? prev.zones.map(z => ({
        ...z, wallHp: Math.max(0, z.wallHp - Math.floor(damageTaken / Math.max(1, prev.zones.filter(zz => zz.unlocked).length))),
      })) : prev.zones.map(z => ({ ...z, wallHp: Math.max(0, z.wallHp - Math.floor(damageTaken * 0.8 / Math.max(1, prev.zones.filter(zz => zz.unlocked).length))) }))
      result = { success: true, coinsEarned, xpEarned }
      return {
        ...prev, currentSiege: { ...prev.currentSiege, survived, damage: damageTaken, coinsEarned, xpEarned },
        zones: newZones,
        coins: prev.coins + coinsEarned,
        totalSiegesDefended: prev.totalSiegesDefended + (survived ? 1 : 0),
        totalSiegesLost: prev.totalSiegesLost + (survived ? 0 : 1),
        totalWavesDefended: prev.totalWavesDefeated + (survived ? 1 : 0),
      }
    })
    if (result.success) {
      fcAddXp(result.xpEarned)
      fcAddCoins(result.coinsEarned)
    }
    return result
  }, [fcAddXp, fcAddCoins])

  const fcEndSiege = useCallback(() => {
    setState(prev => ({ ...prev, currentSiege: null }))
  }, [])

  const fcStartBlizzard = useCallback((intensity: FcBlizzardIntensity) => {
    setState(prev => {
      const configMap: Record<FcBlizzardIntensity, { duration: number; damage: number; bonus: number }> = {
        flurry: { duration: 30, damage: 5, bonus: 20 },
        moderate: { duration: 60, damage: 15, bonus: 50 },
        heavy: { duration: 120, damage: 30, bonus: 120 },
        catastrophic: { duration: 240, damage: 60, bonus: 300 },
      }
      const config = configMap[intensity]
      const blizzard: FcBlizzardEvent = {
        id: `blizzard_${Date.now()}`, intensity,
        startedAt: Date.now(), duration: config.duration,
        survived: false, damage: config.damage, bonusCoins: config.bonus,
      }
      return { ...prev, currentBlizzard: blizzard }
    })
  }, [])

  const fcSurviveBlizzard = useCallback(() => {
    let result = false
    setState(prev => {
      if (!prev.currentBlizzard || prev.currentBlizzard.survived) return prev
      result = true
      return {
        ...prev,
        currentBlizzard: { ...prev.currentBlizzard, survived: true },
        totalBlizzardsSurvived: prev.totalBlizzardsSurvived + 1,
        coins: prev.coins + prev.currentBlizzard.bonusCoins,
      }
    })
    return result
  }, [])

  const fcEndBlizzard = useCallback(() => {
    setState(prev => ({ ...prev, currentBlizzard: null }))
  }, [])

  const fcCompleteDailyPatrol = useCallback((zonesPatrolled: number, enemiesDefeated: number) => {
    setState(prev => {
      const todayKey = fcGetTodayKey()
      const patrol: FcDailyPatrol = {
        date: todayKey, completed: true, zonesPatrolled, enemiesDefeated,
        coinsEarned: zonesPatrolled * 15 + enemiesDefeated * 8,
        xpEarned: zonesPatrolled * 20 + enemiesDefeated * 12,
      }
      const prevDayKey = fcGetPreviousDayKey(todayKey)
      const newStreak = prev.dailyPatrol.date === prevDayKey ? prev.streak + 1 : 1
      return {
        ...prev, dailyPatrol: patrol,
        coins: prev.coins + patrol.coinsEarned,
        streak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        seed: prev.seed + 1,
      }
    })
    fcAddXp(zonesPatrolled * 20 + enemiesDefeated * 12)
  }, [fcAddXp])

  const fcUnlockAchievement = useCallback((achievementId: string): boolean => {
    let success = false
    setState(prev => {
      const idx = prev.achievements.findIndex(a => a.achievementId === achievementId)
      if (idx === -1) return prev
      if (prev.achievements[idx].unlocked) return prev
      success = true
      const newAchievements = [...prev.achievements]
      newAchievements[idx] = { ...newAchievements[idx], unlocked: true, unlockedAt: Date.now() }
      return { ...prev, achievements: newAchievements, totalAchievements: prev.totalAchievements + 1 }
    })
    return success
  }, [])

  const fcCheckAchievements = useCallback((): string[] => {
    const unlocked: string[] = []
    const s = stateRef.current
    const checks: Record<string, boolean> = {
      first_recruit: s.totalGuardiansRecruited >= 1,
      guardian_5: s.guardians.length >= 5,
      guardian_15: s.guardians.length >= 15,
      guardian_35: s.guardians.length >= 35,
      first_siege: s.totalSiegesDefended >= 1,
      siege_10: s.totalSiegesDefended >= 10,
      siege_50: s.totalSiegesDefended >= 50,
      siege_100: s.totalSiegesDefended >= 100,
      forge_5: s.totalWeaponsForged >= 5,
      forge_30: s.totalWeaponsForged >= 30,
      build_10: s.totalStructuresBuilt >= 10,
      build_25: s.totalStructuresBuilt >= 25,
      spell_10: s.spells.filter(sp => sp.learned).length >= 10,
      spell_22: s.spells.filter(sp => sp.learned).length >= 22,
      blizzard_5: s.totalBlizzardsSurvived >= 5,
      streak_7: s.streak >= 7,
      max_level: s.level >= FC_MAX_LEVEL,
      legendary_guardian: s.guardians.some(g => {
        const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
        return def && def.rarity === FC_RARITY_LEGENDARY
      }),
    }
    for (const [id, met] of Object.entries(checks)) {
      if (met) {
        const existing = s.achievements.find(a => a.achievementId === id)
        if (existing && !existing.unlocked) {
          unlocked.push(id)
        }
      }
    }
    return unlocked
  }, [])

  const fcGetGuardiansByRarity = useCallback((rarity: FcRarity): FcGuardianEntity[] => {
    return stateRef.current.guardians.filter(g => {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      return def && def.rarity === rarity
    })
  }, [])

  const fcGetGuardiansByType = useCallback((type: FcGuardianType): FcGuardianEntity[] => {
    return stateRef.current.guardians.filter(g => {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      return def && def.type === type
    })
  }, [])

  const fcGetGuardiansInZone = useCallback((zoneId: FcZoneId): FcGuardianEntity[] => {
    return stateRef.current.guardians.filter(g => g.deployed && g.zoneId === zoneId)
  }, [])

  const fcGetWeaponsBySlot = useCallback((slot: FcWeaponSlot): FcWeaponEntity[] => {
    return stateRef.current.weapons.filter(w => {
      const def = FC_WEAPONS.find(d => d.id === w.weaponId)
      return def && def.slot === slot
    })
  }, [])

  const fcGetStructuresByZone = useCallback((zoneId: FcZoneId): FcStructureEntity[] => {
    return stateRef.current.structures.filter(s => {
      const def = FC_STRUCTURES.find(d => d.id === s.structureId)
      return def && def.zoneId === zoneId
    })
  }, [])

  const fcGetSpellsBySchool = useCallback((school: FcSpellSchool): FcSpellEntity[] => {
    return stateRef.current.spells.filter(s => {
      const def = FC_SPELLS.find(d => d.id === s.spellId)
      return def && def.school === school
    })
  }, [])

  const fcGetTrapsInZone = useCallback((zoneId: FcZoneId): FcTrapEntity[] => {
    return stateRef.current.traps.filter(t => t.zoneId === zoneId && t.placed)
  }, [])

  const fcRecruitRandomGuardian = useCallback((): FcGuardianDef | null => {
    const s = stateRef.current
    const owned = new Set(s.guardians.map(g => g.guardianId))
    const available = FC_GUARDIANS.filter(g => !owned.has(g.id) && g.recruitCost <= s.coins)
    if (available.length === 0) return null
    const weights = available.map(g => FC_RARITY_DROP_WEIGHTS[g.rarity])
    const totalWeight = weights.reduce((a, b) => a + b, 0)
    let rand = fcRandomFromSeed(s.seed + Date.now(), 5) * totalWeight
    for (let i = 0; i < available.length; i++) {
      rand -= weights[i]
      if (rand <= 0) {
        fcRecruitGuard(available[i].id)
        return available[i]
      }
    }
    fcRecruitGuard(available[0].id)
    return available[0]
  }, [fcRecruitGuard])

  // === ADVANCED COMPUTED VALUES (useMemo) ===

  const totalFrostPower = useMemo(() => {
    let power = 0
    for (const g of state.guardians) {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      if (def) {
        const levelMult = 1 + (g.level - 1) * 0.12
        power += (def.attack + def.defense + def.magic) * levelMult
      }
    }
    for (const w of state.weapons) {
      if (!w.equipped) continue
      const def = FC_WEAPONS.find(d => d.id === w.weaponId)
      if (def) {
        const upgradeMult = 1 + (w.upgradeLevel - 1) * 0.15
        power += (def.attackBonus + def.defenseBonus + def.frostBonus) * upgradeMult
      }
    }
    return Math.floor(power)
  }, [state])

  const citadelDefenseScore = useMemo(() => {
    let score = 0
    for (const z of state.zones) {
      if (!z.unlocked) continue
      score += z.wallHp
      const zoneStructures = state.structures.filter(s => {
        const def = FC_STRUCTURES.find(d => d.id === s.structureId)
        return def && def.zoneId === z.zoneId && s.built
      })
      for (const s of zoneStructures) {
        const def = FC_STRUCTURES.find(d => d.id === s.structureId)
        if (def) score += def.defenseBonus * s.level
      }
      const zoneTraps = state.traps.filter(t => t.zoneId === z.zoneId && t.placed)
      for (const t of zoneTraps) score += t.damage
    }
    return score
  }, [state])

  const forgeProgressStats = useMemo(() => {
    const owned = state.weapons.filter(w => w.owned).length
    const maxUpgrade = state.weapons.reduce((max, w) => Math.max(max, w.upgradeLevel), 0)
    const totalUpgradeLevels = state.weapons.reduce((sum, w) => sum + w.upgradeLevel, 0)
    return { owned, maxUpgrade, totalUpgradeLevels, total: FC_WEAPONS.length }
  }, [state])

  const guardianRarityBreakdown = useMemo((): Record<FcRarity, number> => {
    const counts = {
      [FC_RARITY_COMMON]: 0,
      [FC_RARITY_UNCOMMON]: 0,
      [FC_RARITY_RARE]: 0,
      [FC_RARITY_EPIC]: 0,
      [FC_RARITY_LEGENDARY]: 0,
    } as Record<FcRarity, number>
    for (const g of state.guardians) {
      const def = FC_GUARDIANS.find(d => d.id === g.guardianId)
      if (def) counts[def.rarity] += 1
    }
    return counts
  }, [state])

  const zoneFortificationStats = useMemo(() => {
    return state.zones.map(z => {
      const def = FC_ZONES.find(d => d.id === z.zoneId)
      const structureCount = state.structures.filter(s => {
        const sd = FC_STRUCTURES.find(d => d.id === s.structureId)
        return sd && sd.zoneId === z.zoneId && s.built
      }).length
      const trapCount = state.traps.filter(t => t.zoneId === z.zoneId && t.placed).length
      const guardianCount = state.guardians.filter(g => g.deployed && g.zoneId === z.zoneId).length
      return {
        zoneId: z.zoneId,
        name: def?.name ?? z.zoneId,
        wallHealth: z.maxWallHp > 0 ? Math.floor((z.wallHp / z.maxWallHp) * 100) : 0,
        structureCount,
        trapCount,
        guardianCount,
        totalDefenseEvents: z.totalDefenseEvents,
        unlocked: z.unlocked,
      }
    })
  }, [state])

  const spellMasteryStats = useMemo(() => {
    const learnedCount = state.spells.filter(s => s.learned).length
    const avgMastery = state.spells.length > 0
      ? state.spells.filter(s => s.learned).reduce((sum, s) => sum + s.mastery, 0) / Math.max(1, learnedCount)
      : 0
    const masteredCount = state.spells.filter(s => s.learned && s.mastery >= 100).length
    return { learnedCount, avgMastery: Math.floor(avgMastery), masteredCount, total: FC_SPELLS.length }
  }, [state])

  const structureBuildProgress = useMemo(() => {
    const built = state.structures.filter(s => s.built).length
    const totalDefenseBonus = state.structures.reduce((sum, s) => {
      if (!s.built) return sum
      const def = FC_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.defenseBonus * s.level : 0)
    }, 0)
    const totalCoinBonus = state.structures.reduce((sum, s) => {
      if (!s.built) return sum
      const def = FC_STRUCTURES.find(d => d.id === s.structureId)
      return sum + (def ? def.coinBonus * s.level : 0)
    }, 0)
    return { built, total: FC_STRUCTURES.length, totalDefenseBonus, totalCoinBonus }
  }, [state])

  const dailyIncomeRate = useMemo(() => {
    let income = 0
    for (const s of state.structures) {
      if (!s.built) continue
      const def = FC_STRUCTURES.find(d => d.id === s.structureId)
      if (def) income += def.coinBonus * s.level
    }
    return income
  }, [state])

  const nextLevelXpInfo = useMemo(() => {
    if (state.level >= FC_MAX_LEVEL) return { required: 0, remaining: 0, percent: 100 }
    const required = fcGetXpRequiredForLevel(state.level)
    return { required, remaining: Math.max(0, required - state.xp), percent: Math.floor((state.xp / required) * 100) }
  }, [state.level, state.xp])

  const powerRank = useMemo(() => {
    const p = totalFrostPower
    if (p >= 10000) return { rank: 'Mythic', tier: 5, icon: '🌟', color: '#FFD700' }
    if (p >= 5000) return { rank: 'Legendary', tier: 4, icon: '💎', color: '#e0fbfc' }
    if (p >= 2000) return { rank: 'Epic', tier: 3, icon: '💜', color: '#a8dadc' }
    if (p >= 800) return { rank: 'Rare', tier: 2, icon: '❄️', color: '#48cae4' }
    if (p >= 200) return { rank: 'Uncommon', tier: 1, icon: '🧊', color: '#5dade2' }
    return { rank: 'Common', tier: 0, icon: '⚪', color: '#9ec5d4' }
  }, [totalFrostPower])

  const nextUnlockInfo = useMemo(() => {
    const nextZone = FC_ZONES
      .filter(z => z.unlockLevel > state.level)
      .sort((a, b) => a.unlockLevel - b.unlockLevel)[0]
    if (nextZone) return { type: 'zone' as const, name: nextZone.name, levelReq: nextZone.unlockLevel, icon: '🏰' }
    return null
  }, [state.level])

  const equippedWeaponSummary = useMemo(() => {
    return state.weapons
      .filter(w => w.equipped)
      .map(w => {
        const def = FC_WEAPONS.find(d => d.id === w.weaponId)
        return {
          weaponId: w.weaponId,
          name: def?.name ?? w.weaponId,
          slot: def?.slot ?? 'weapon',
          upgradeLevel: w.upgradeLevel,
          totalAttack: (def?.attackBonus ?? 0) + Math.floor((def?.attackBonus ?? 0) * 0.15 * (w.upgradeLevel - 1)),
          totalDefense: (def?.defenseBonus ?? 0) + Math.floor((def?.defenseBonus ?? 0) * 0.15 * (w.upgradeLevel - 1)),
          totalFrost: (def?.frostBonus ?? 0) + Math.floor((def?.frostBonus ?? 0) * 0.15 * (w.upgradeLevel - 1)),
          icon: def?.icon ?? '⚔️',
          color: def?.color ?? '#caf0f8',
          rarity: def?.rarity ?? FC_RARITY_COMMON,
        }
      })
  }, [state])

  // === ADDITIONAL fc FUNCTIONS ===

  const fcGetCitadelPowerSummary = useCallback(() => {
    const s = stateRef.current
    const guardCount = s.guardians.length
    const deployedCount = s.guardians.filter(g => g.deployed).length
    const weaponCount = s.weapons.filter(w => w.owned).length
    const spellCount = s.spells.filter(sp => sp.learned).length
    const structCount = s.structures.filter(st => st.built).length
    const zoneCount = s.zones.filter(z => z.unlocked).length
    return {
      level: s.level,
      totalPower: totalFrostPower,
      defense: citadelDefenseScore,
      guardians: guardCount,
      deployed: deployedCount,
      weapons: weaponCount,
      spells: spellCount,
      structures: structCount,
      zones: zoneCount,
      coins: s.coins,
      iceCrystals: s.iceCrystals,
      streak: s.streak,
    }
  }, [totalFrostPower, citadelDefenseScore])

  const fcGetGuardianDetailedStats = useCallback((guardianId: string) => {
    const s = stateRef.current
    const entity = s.guardians.find(g => g.guardianId === guardianId)
    if (!entity) return null
    const def = FC_GUARDIANS.find(d => d.id === guardianId)
    if (!def) return null
    const levelMult = 1 + (entity.level - 1) * 0.12
    const xpNeeded = entity.level < FC_MAX_LEVEL ? fcGetXpRequiredForLevel(entity.level) : 0
    const xpPercent = xpNeeded > 0 ? Math.floor((entity.xp / xpNeeded) * 100) : 100
    return {
      ...entity,
      def,
      effectiveAttack: Math.floor(def.attack * levelMult),
      effectiveDefense: Math.floor(def.defense * levelMult),
      effectiveMagic: Math.floor(def.magic * levelMult),
      effectiveHp: entity.maxHp,
      levelMult,
      xpNeeded,
      xpPercent,
      canLevelUp: entity.level < FC_MAX_LEVEL,
      isMaxLevel: entity.level >= FC_MAX_LEVEL,
    }
  }, [])

  const fcGetZoneSecurityReport = useCallback((zoneId: FcZoneId) => {
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    if (!zone) return null
    const def = FC_ZONES.find(d => d.id === zoneId)
    const guardians = s.guardians.filter(g => g.deployed && g.zoneId === zoneId)
    const structures = s.structures.filter(st => {
      const sd = FC_STRUCTURES.find(d => d.id === st.structureId)
      return sd && sd.zoneId === zoneId && st.built
    })
    const traps = s.traps.filter(t => t.zoneId === zoneId && t.placed)
    const wallPercent = zone.maxWallHp > 0 ? Math.floor((zone.wallHp / zone.maxWallHp) * 100) : 0
    const totalGuardianPower = guardians.reduce((sum, g) => {
      const gd = FC_GUARDIANS.find(d => d.id === g.guardianId)
      return sum + (gd ? gd.attack + gd.defense + gd.magic : 0)
    }, 0)
    const totalStructureDefense = structures.reduce((sum, st) => {
      const sd = FC_STRUCTURES.find(d => d.id === st.structureId)
      return sum + (sd ? sd.defenseBonus * st.level : 0)
    }, 0)
    const totalTrapDamage = traps.reduce((sum, t) => sum + t.damage * t.charges, 0)
    return {
      zoneId,
      name: def?.name ?? zoneId,
      wallPercent,
      guardianCount: guardians.length,
      maxGuardians: def?.maxGuardians ?? 0,
      totalGuardianPower,
      structureCount: structures.length,
      totalStructureDefense,
      trapCount: traps.length,
      totalTrapDamage,
      overallSecurity: wallPercent + totalGuardianPower + totalStructureDefense + totalTrapDamage,
      lastPatrolledAt: zone.lastPatrolledAt,
    }
  }, [])

  const fcCalculateTotalFrostBonus = useCallback(() => {
    const s = stateRef.current
    let bonus = 0
    for (const w of s.weapons) {
      if (!w.equipped) continue
      const def = FC_WEAPONS.find(d => d.id === w.weaponId)
      if (def) bonus += def.frostBonus + Math.floor(def.frostBonus * 0.15 * (w.upgradeLevel - 1))
    }
    return bonus
  }, [])

  const fcGetWeaponForgeCost = useCallback((weaponId: string) => {
    const def = FC_WEAPONS.find(w => w.id === weaponId)
    if (!def) return null
    const s = stateRef.current
    const owned = s.weapons.find(w => w.weaponId === weaponId && w.owned)
    if (owned) return null
    return { coins: def.forgeCost, crystals: def.crystalCost, levelReq: def.levelReq }
  }, [])

  const fcGetWeaponUpgradeCost = useCallback((weaponId: string) => {
    const s = stateRef.current
    const weapon = s.weapons.find(w => w.weaponId === weaponId)
    if (!weapon || !weapon.owned || weapon.upgradeLevel >= 10) return null
    const cost = 20 + weapon.upgradeLevel * 15
    return { crystals: cost, currentLevel: weapon.upgradeLevel, maxLevel: 10 }
  }, [])

  const fcGetStructureUpgradeCost = useCallback((structureId: string) => {
    const s = stateRef.current
    const structure = s.structures.find(st => st.structureId === structureId)
    if (!structure || !structure.built || structure.level >= 5) return null
    const def = FC_STRUCTURES.find(d => d.id === structureId)
    if (!def) return null
    const cost = Math.floor(def.buildCost * 0.5 * (structure.level + 1))
    return { coins: cost, currentLevel: structure.level, maxLevel: 5 }
  }, [])

  const fcGetRecruitCostInfo = useCallback((guardianId: string) => {
    const def = FC_GUARDIANS.find(g => g.id === guardianId)
    if (!def) return null
    const s = stateRef.current
    const alreadyOwned = s.guardians.some(g => g.guardianId === guardianId)
    if (alreadyOwned) return null
    return { coins: def.recruitCost, canAfford: s.coins >= def.recruitCost }
  }, [])

  const fcGetSiegeDifficultyInfo = useCallback((severity: FcSiegeSeverity) => {
    const s = stateRef.current
    const basePowers: Record<FcSiegeSeverity, number> = {
      scout: 10, raid: 25, assault: 50, siege: 80, apocalypse: 120,
    }
    const waveScale = 1 + s.totalWavesDefeated * 0.05
    const enemyPower = Math.floor(basePowers[severity] * waveScale)
    const enemyCount = Math.ceil(enemyPower / 15)
    const duration = 30 + (severity === 'siege' ? 30 : severity === 'apocalypse' ? 60 : 0)
    const survivable = citadelDefenseScore >= enemyPower * 0.5
    return { severity, enemyPower, enemyCount, duration, survivable, waveScale: Math.floor(waveScale * 100) }
  }, [citadelDefenseScore])

  const fcResetDailyPatrol = useCallback(() => {
    const now = new Date()
    const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    setState(prev => {
      if (prev.dailyPatrol.date === todayKey) return prev
      return {
        ...prev,
        dailyPatrol: {
          date: todayKey,
          completed: false,
          zonesPatrolled: 0,
          enemiesDefeated: 0,
          coinsEarned: 0,
          xpEarned: 0,
        },
      }
    })
  }, [])

  const fcGetAllDeployableZones = useCallback(() => {
    const s = stateRef.current
    return FC_ZONES.filter(z => {
      const zone = s.zones.find(ze => ze.zoneId === z.id)
      return zone && zone.unlocked
    })
  }, [])

  const fcGetAvailableRecruits = useCallback(() => {
    const s = stateRef.current
    const owned = new Set(s.guardians.map(g => g.guardianId))
    return FC_GUARDIANS.filter(g => !owned.has(g.id)).sort((a, b) => a.recruitCost - b.recruitCost)
  }, [])

  const fcGetAvailableForges = useCallback(() => {
    const s = stateRef.current
    const owned = new Set(s.weapons.filter(w => w.owned).map(w => w.weaponId))
    return FC_WEAPONS.filter(w => {
      if (owned.has(w.id)) return false
      if (s.level < w.levelReq) return false
      if (s.coins < w.forgeCost || s.iceCrystals < w.crystalCost) return false
      return true
    })
  }, [])

  const fcGetAvailableBuilds = useCallback(() => {
    const s = stateRef.current
    return FC_STRUCTURES.filter(st => {
      const entity = s.structures.find(se => se.structureId === st.id)
      if (entity && entity.built) return false
      if (s.level < st.levelReq) return false
      if (s.coins < st.buildCost) return false
      return true
    })
  }, [])

  const fcGetLearnableSpells = useCallback(() => {
    const s = stateRef.current
    return FC_SPELLS.filter(sp => {
      const entity = s.spells.find(se => se.spellId === sp.id)
      if (entity && entity.learned) return false
      return s.level >= sp.unlockLevel
    })
  }, [])

  const fcGetSiegeHistoryStats = useCallback(() => {
    const s = stateRef.current
    const winRate = s.totalSiegesDefended + s.totalSiegesLost > 0
      ? Math.floor((s.totalSiegesDefended / (s.totalSiegesDefended + s.totalSiegesLost)) * 100)
      : 0
    return {
      defended: s.totalSiegesDefended,
      lost: s.totalSiegesLost,
      total: s.totalSiegesDefended + s.totalSiegesLost,
      winRate,
      wavesDefeated: s.totalWavesDefeated,
      avgXpPerSiege: s.totalSiegesDefended > 0
        ? Math.floor((s.totalXp - (s.totalSiegesDefended * 50)) / s.totalSiegesDefended)
        : 0,
    }
  }, [])

  const fcGetBlizzardSurvivalStats = useCallback(() => {
    const s = stateRef.current
    return {
      survived: s.totalBlizzardsSurvived,
      currentActive: s.currentBlizzard !== null,
      intensity: s.currentBlizzard?.intensity ?? null,
    }
  }, [])

  const fcGetTrainingOptions = useCallback((guardianId: string) => {
    const s = stateRef.current
    const entity = s.guardians.find(g => g.guardianId === guardianId)
    if (!entity) return []
    if (entity.level >= FC_MAX_LEVEL) return []
    return [
      { tier: 'basic' as const, coins: FC_TRAINING_COSTS.basic.coins, xp: FC_TRAINING_COSTS.basic.xp, icon: '📘' },
      { tier: 'advanced' as const, coins: FC_TRAINING_COSTS.advanced.coins, xp: FC_TRAINING_COSTS.advanced.xp, icon: '📗' },
      { tier: 'elite' as const, coins: FC_TRAINING_COSTS.elite.coins, xp: FC_TRAINING_COSTS.elite.xp, icon: '📕' },
      { tier: 'legendary' as const, coins: FC_TRAINING_COSTS.legendary.coins, xp: FC_TRAINING_COSTS.legendary.xp, icon: '🌟' },
    ].filter(opt => s.coins >= opt.coins)
  }, [])

  const fcGetCitadelOverview = useCallback(() => {
    const s = stateRef.current
    const guardianSummary = FC_GUARDIANS.reduce<Record<FcRarity, number>>((acc, g) => {
      if (s.guardians.some(ge => ge.guardianId === g.id)) acc[g.rarity] += 1
      return acc
    }, { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 })
    const weaponSummary = FC_WEAPONS.reduce<Record<FcWeaponSlot, number>>((acc, w) => {
      if (s.weapons.some(we => we.weaponId === w.id && we.owned)) acc[w.slot] += 1
      return acc
    }, { weapon: 0, shield: 0, helmet: 0, chestplate: 0, boots: 0, ring: 0, amulet: 0 })
    return {
      level: s.level,
      title: s.title,
      xp: s.xp,
      coins: s.coins,
      iceCrystals: s.iceCrystals,
      streak: s.streak,
      bestStreak: s.bestStreak,
      guardianSummary,
      weaponSummary,
      zoneCount: s.zones.filter(z => z.unlocked).length,
      structureCount: s.structures.filter(st => st.built).length,
      spellCount: s.spells.filter(sp => sp.learned).length,
      achievementCount: s.achievements.filter(a => a.unlocked).length,
      totalPower: totalFrostPower,
      defenseScore: citadelDefenseScore,
    }
  }, [totalFrostPower, citadelDefenseScore])

  const fcGetEconomyStats = useCallback(() => {
    const s = stateRef.current
    return {
      coins: s.coins,
      totalCoinsEarned: s.totalCoinsEarned,
      iceCrystals: s.iceCrystals,
      dailyIncome: dailyIncomeRate,
      avgIncomePerSiege: s.totalSiegesDefended > 0
        ? Math.floor(s.totalCoinsEarned / (s.totalSiegesDefended + s.totalBlizzardsSurvived + s.structures.length))
        : 0,
    }
  }, [dailyIncomeRate])

  const fcGetNextTitle = useCallback(() => {
    const s = stateRef.current
    const current = FC_TITLES.findIndex(t => t.title === s.title)
    if (current >= FC_TITLES.length - 1) return null
    const next = FC_TITLES[current + 1]
    const levelsRemaining = next.level - s.level
    const xpRemaining = next.level <= FC_MAX_LEVEL
      ? Array.from({ length: levelsRemaining }, (_, i) => fcGetXpRequiredForLevel(s.level + i)).reduce((a, b) => a + b, 0) - s.xp
      : 0
    return {
      title: next.title,
      levelReq: next.level,
      levelsRemaining,
      xpRemaining: Math.max(0, xpRemaining),
      icon: next.icon,
      description: next.description,
    }
  }, [])

  const fcGetFortificationOptions = useCallback((zoneId: FcZoneId) => {
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    if (!zone || !zone.unlocked) return []
    if (zone.wallHp >= zone.maxWallHp) return []
    return FC_FORTIFICATION_TYPES.filter(ft => {
      const cost = ft.costPerHp * ft.maxHpPerUse
      return s.coins >= cost
    })
  }, [])

  const fcGetTrapPlacementOptions = useCallback((zoneId: FcZoneId) => {
    const s = stateRef.current
    const zone = s.zones.find(z => z.zoneId === zoneId)
    if (!zone || !zone.unlocked) return []
    const placedTraps = s.traps.filter(t => t.zoneId === zoneId && t.placed)
    const placedIds = new Set(placedTraps.map(t => t.trapId))
    return FC_TRAPS.filter(t => {
      if (placedIds.has(t.id)) return false
      if (t.zoneId !== zoneId) return false
      return s.coins >= t.cost
    })
  }, [])

  const fcGetPatrolQuestOptions = useCallback(() => {
    const s = stateRef.current
    if (s.dailyPatrol.completed) return []
    return FC_PATROL_QUEST_TYPES
  }, [])

  const fcCanStartSiege = useCallback(() => {
    const s = stateRef.current
    return s.currentSiege === null
  }, [])

  const fcCanStartBlizzard = useCallback(() => {
    const s = stateRef.current
    return s.currentBlizzard === null
  }, [])

  const fcGetAchievementProgress = useCallback((achievementId: string) => {
    const s = stateRef.current
    const ach = FC_ACHIEVEMENTS.find(a => a.id === achievementId)
    if (!ach) return null
    const entity = s.achievements.find(a => a.achievementId === achievementId)
    let current = 0
    let target = 1
    const cond = ach.condition
    if (cond.startsWith('totalGuardiansRecruited')) { current = s.totalGuardiansRecruited; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('guardians')) { current = s.guardians.length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('totalSiegesDefended')) { current = s.totalSiegesDefended; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('weapons')) { current = s.weapons.filter(w => w.owned).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('structures')) { current = s.structures.filter(st => st.built).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('spells')) { current = s.spells.filter(sp => sp.learned).length; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('totalBlizzardsSurvived')) { current = s.totalBlizzardsSurvived; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('streak')) { current = s.streak; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('level')) { current = s.level; target = parseInt(cond.split('>= ')[1]) }
    else if (cond.startsWith('legendary')) { current = s.guardians.filter(g => { const d = FC_GUARDIANS.find(dd => dd.id === g.guardianId); return d && d.rarity === FC_RARITY_LEGENDARY }).length; target = 1 }
    return {
      achievement: ach,
      unlocked: entity?.unlocked ?? false,
      current,
      target,
      percent: Math.min(100, Math.floor((current / target) * 100)),
    }
  }, [])

  // === RETURN ===

  return {
    // State
    state,
    // Computed
    xpProgress,
    overallProgress,
    unlockedZoneCount,
    deployedGuardians,
    totalDefenseRating,
    currentSiegeActive,
    currentBlizzardActive,
    guardianCount,
    legendaryGuardianCount,
    weaponCount,
    learnedSpellCount,
    builtStructureCount,
    unlockedAchievementCount,
    patrolCompletedToday,
    // Constants
    FC_GUARDIANS,
    FC_WEAPONS,
    FC_ZONES,
    FC_STRUCTURES,
    FC_SPELLS,
    FC_ACHIEVEMENTS,
    FC_TITLES,
    FC_TRAPS,
    FC_MAX_LEVEL,
    FC_XP_TABLE,
    FC_RARITY_COLORS,
    FC_RARITY_ICONS,
    FC_RARITY_XP_MULTIPLIER,
    FC_RARITY_DROP_WEIGHTS,
    // Getters
    fcGetLevel,
    fcGetXp,
    fcGetTotalXp,
    fcGetCoins,
    fcGetTitle,
    fcGetIceCrystals,
    fcGetGuardians,
    fcGetWeapons,
    fcGetZones,
    fcGetStructures,
    fcGetSpells,
    fcGetAchievements,
    fcGetTraps,
    fcGetStreak,
    fcGetBestStreak,
    fcGetDailyPatrol,
    fcGetCurrentSiege,
    fcGetCurrentBlizzard,
    fcGetTotalSiegesDefended,
    fcGetTotalWeaponsForged,
    fcGetTotalSpellsCast,
    fcGetTotalBlizzardsSurvived,
    fcGetXpRequired,
    // Lookups
    fcGetGuardianDef,
    fcGetWeaponDef,
    fcGetZoneDef,
    fcGetStructureDef,
    fcGetSpellDef,
    fcGetAchievementDef,
    fcGetRarityColor,
    fcGetRarityIcon,
    fcGetRarityName,
    // Actions
    fcAddXp,
    fcAddCoins,
    fcSpendCoins,
    fcAddCrystals,
    fcSpendCrystals,
    fcRecruitGuard,
    fcDeployGuard,
    fcRecallGuard,
    fcTrainGuard,
    fcRenameGuard,
    fcDismissGuard,
    fcForgeWeapon,
    fcEquipWeapon,
    fcUpgradeWeapon,
    fcBuildStructure,
    fcUpgradeStructure,
    fcFortifyWall,
    fcPlaceTrap,
    fcLearnSpell,
    fcCastSpell,
    fcStartSiege,
    fcDefendSiege,
    fcEndSiege,
    fcStartBlizzard,
    fcSurviveBlizzard,
    fcEndBlizzard,
    fcCompleteDailyPatrol,
    fcUnlockAchievement,
    fcCheckAchievements,
    fcRecruitRandomGuardian,
    // Filters
    fcGetGuardiansByRarity,
    fcGetGuardiansByType,
    fcGetGuardiansInZone,
    fcGetWeaponsBySlot,
    fcGetStructuresByZone,
    fcGetSpellsBySchool,
    fcGetTrapsInZone,
    // Advanced Computed
    totalFrostPower,
    citadelDefenseScore,
    forgeProgressStats,
    guardianRarityBreakdown,
    zoneFortificationStats,
    spellMasteryStats,
    structureBuildProgress,
    dailyIncomeRate,
    nextLevelXpInfo,
    powerRank,
    nextUnlockInfo,
    equippedWeaponSummary,
    // Advanced Functions
    fcGetCitadelPowerSummary,
    fcGetGuardianDetailedStats,
    fcGetZoneSecurityReport,
    fcCalculateTotalFrostBonus,
    fcGetWeaponForgeCost,
    fcGetWeaponUpgradeCost,
    fcGetStructureUpgradeCost,
    fcGetRecruitCostInfo,
    fcGetSiegeDifficultyInfo,
    fcResetDailyPatrol,
    fcGetAllDeployableZones,
    fcGetAvailableRecruits,
    fcGetAvailableForges,
    fcGetAvailableBuilds,
    fcGetLearnableSpells,
    fcGetSiegeHistoryStats,
    fcGetBlizzardSurvivalStats,
    fcGetTrainingOptions,
    fcGetCitadelOverview,
    fcGetEconomyStats,
    fcGetNextTitle,
    fcGetFortificationOptions,
    fcGetTrapPlacementOptions,
    fcGetPatrolQuestOptions,
    fcCanStartSiege,
    fcCanStartBlizzard,
    fcGetAchievementProgress,
  }
}
