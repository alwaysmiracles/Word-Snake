'use client'

import { useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Frost Fury Wire (冰霜狂怒) — Ice Combat Arena Game System
// Theme: Ice/winter combat arena with ice powers vs frozen monsters
// Color palette: Deep frost #0A1628, Ice blue #4FC3F7, Crystal white #E1F5FE,
//                Aurora teal #00BCD4, Frost silver #B0BEC5, Blizzard white #FAFAFA
// ═══════════════════════════════════════════════════════════════════

// ─── TYPE DEFINITIONS ────────────────────────────────────────────

export type FfRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type FfAbilitySchool = 'frost' | 'glacier' | 'blizzard' | 'crystal' | 'aurora'
export type FfMonsterElement = 'ice' | 'frost' | 'glacier' | 'storm' | 'shadow'
export type FfEquipSlot = 'weapon' | 'armor' | 'helmet' | 'boots' | 'ring' | 'amulet'
export type FfArenaId = 'frozen_lake' | 'ice_cavern' | 'glacier_peak' | 'snowstorm_valley' | 'eternal_winter'
export type FfStatusEffect = 'frozen' | 'slowed' | 'shielded' | 'frostBurn' | 'stunned' | 'none'

// ─── COLOR THEME CONSTANTS ──────────────────────────────────────

export const FF_DEEP_FROST = '#0A1628'
export const FF_ICE_BLUE = '#4FC3F7'
export const FF_CRYSTAL_WHITE = '#E1F5FE'
export const FF_AURORA_TEAL = '#00BCD4'
export const FF_FROST_SILVER = '#B0BEC5'
export const FF_BLIZZARD_WHITE = '#FAFAFA'
export const FF_GLACIER_CYAN = '#00ACC1'
export const FF_SNOW_BLUE = '#81D4FA'
export const FF_FROSTBITE = '#0288D1'
export const FF_ABSOLUTE_ZERO = '#01579B'

export const FF_RARITY_COLORS: Record<FfRarity, string> = {
  common: '#B0BEC5',
  uncommon: '#4FC3F7',
  rare: '#00BCD4',
  epic: '#7C4DFF',
  legendary: '#FFD740',
}

export const FF_RARITY_ICONS: Record<FfRarity, string> = {
  common: '🧊',
  uncommon: '❄️',
  rare: '🌨️',
  epic: '💎',
  legendary: '👑',
}

// ─── INTERFACES ─────────────────────────────────────────────────

export interface FfAbilityDef {
  id: string
  name: string
  school: FfAbilitySchool
  power: number
  manaCost: number
  frostCost: number
  cooldown: number
  unlockLevel: number
  description: string
  icon: string
  color: string
  isUltimate: boolean
}

export interface FfMonsterDef {
  id: string
  name: string
  element: FfMonsterElement
  hp: number
  attack: number
  defense: number
  speed: number
  frostResist: number
  weakness: FfAbilitySchool
  xpReward: number
  frostMeterReward: number
  description: string
  lore: string
  icon: string
  color: string
  specialAbility: string
}

export interface FfMonsterState {
  monsterId: string
  currentHp: number
  maxHp: number
  statusEffect: FfStatusEffect
  statusTurns: number
  turnCount: number
}

export interface FfEquipmentDef {
  id: string
  name: string
  slot: FfEquipSlot
  rarity: FfRarity
  attackBonus: number
  defenseBonus: number
  speedBonus: number
  frostPowerBonus: number
  hpBonus: number
  manaBonus: number
  description: string
  lore: string
  icon: string
  color: string
  requiredLevel: number
}

export interface FfArenaDef {
  id: FfArenaId
  name: string
  description: string
  unlockLevel: number
  monsterPool: string[]
  difficultyMultiplier: number
  iceBonusPercent: number
  background: string
  ambientColor: string
  wavesPerRun: number
}

export interface FfAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  hidden: boolean
  icon: string
}

export interface FfDailyChallenge {
  challengeId: string
  date: string
  arenaId: FfArenaId
  monsterId: string
  objective: string
  objectiveTarget: number
  objectiveProgress: number
  completed: boolean
  rewardXp: number
  rewardFrostBonus: number
}

export interface FfCombatLog {
  turn: number
  actor: 'player' | 'monster'
  action: string
  damage: number
  frostMeterGained: number
  detail: string
}

export interface FfComboEntry {
  abilityId: string
  turnNumber: number
  damage: number
}

export interface FfPlayerStats {
  level: number
  xp: number
  totalXp: number
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  baseAttack: number
  baseDefense: number
  baseSpeed: number
  baseFrostPower: number
  frostMeter: number
  maxFrostMeter: number
}

export interface FfStats {
  totalKills: number
  totalDamageDealt: number
  totalDamageTaken: number
  totalHealing: number
  totalAbilitiesCast: number
  totalCombosCompleted: number
  longestCombo: number
  arenasCompleted: number
  totalWavesCleared: number
  totalFrostMeterGained: number
  ultimateAbilitiesCast: number
  frozenMonstersCount: number
  criticalHits: number
  totalGoldEarned: number
  gold: number
}

export interface FfEquipmentState {
  weapon: string | null
  armor: string | null
  helmet: string | null
  boots: string | null
  ring: string | null
  amulet: string | null
}

export interface FfCombatState {
  active: boolean
  arenaId: FfArenaId | null
  monster: FfMonsterState | null
  turn: number
  comboChain: number
  comboLog: FfComboEntry[]
  combatLog: FfCombatLog[]
  shieldAmount: number
  shieldTurns: number
  glacialWallTurns: number
  glacialWallDefense: number
  blizzardActive: boolean
  blizzardTurns: number
  playerStatusEffect: FfStatusEffect
  playerStatusTurns: number
  cooldowns: Record<string, number>
  waveNumber: number
  monstersKilledInWave: number
  waveMonsterCount: number
  combatWon: boolean
  combatLost: boolean
}

export interface FrostFuryState {
  player: FfPlayerStats
  equipment: FfEquipmentState
  combat: FfCombatState
  achievements: string[]
  streak: number
  bestStreak: number
  lastPlayDate: string
  dailyChallenge: FfDailyChallenge | null
  stats: FfStats
  unlockedArenas: FfArenaId[]
  title: string
  seed: number
}

// ─── ABILITIES (8) ──────────────────────────────────────────────

export const FF_ABILITIES: readonly FfAbilityDef[] = [
  {
    id: 'frost_bolt',
    name: 'Frost Bolt',
    school: 'frost',
    power: 25,
    manaCost: 8,
    frostCost: 0,
    cooldown: 0,
    unlockLevel: 1,
    description: 'Hurls a bolt of concentrated frost energy that chills the target to the bone. Basic yet reliable ice attack.',
    icon: '💠',
    color: '#4FC3F7',
    isUltimate: false,
  },
  {
    id: 'ice_shield',
    name: 'Ice Shield',
    school: 'glacier',
    power: 0,
    manaCost: 15,
    frostCost: 0,
    cooldown: 3,
    unlockLevel: 1,
    description: 'Conjures a protective barrier of hardened ice that absorbs incoming damage for several turns.',
    icon: '🛡️',
    color: '#00BCD4',
    isUltimate: false,
  },
  {
    id: 'blizzard',
    name: 'Blizzard',
    school: 'blizzard',
    power: 40,
    manaCost: 25,
    frostCost: 0,
    cooldown: 4,
    unlockLevel: 5,
    description: 'Summons a raging blizzard that deals continuous ice damage and slows the enemy over multiple turns.',
    icon: '🌨️',
    color: '#B0BEC5',
    isUltimate: false,
  },
  {
    id: 'frozen_lance',
    name: 'Frozen Lance',
    school: 'frost',
    power: 55,
    manaCost: 18,
    frostCost: 0,
    cooldown: 2,
    unlockLevel: 10,
    description: 'Forms a massive crystalline lance of pure ice and hurls it with devastating piercing force.',
    icon: '🔱',
    color: '#81D4FA',
    isUltimate: false,
  },
  {
    id: 'glacier_wall',
    name: 'Glacier Wall',
    school: 'glacier',
    power: 0,
    manaCost: 20,
    frostCost: 0,
    cooldown: 5,
    unlockLevel: 15,
    description: 'Raises an ancient glacier wall that dramatically increases defense and reflects ice damage to attackers.',
    icon: '🧱',
    color: '#00ACC1',
    isUltimate: false,
  },
  {
    id: 'avalanche',
    name: 'Avalanche',
    school: 'blizzard',
    power: 70,
    manaCost: 30,
    frostCost: 10,
    cooldown: 6,
    unlockLevel: 20,
    description: 'Triggers a catastrophic avalanche of ice and stone that crushes everything in its path with overwhelming force.',
    icon: '⛰️',
    color: '#0288D1',
    isUltimate: false,
  },
  {
    id: 'crystal_storm',
    name: 'Crystal Storm',
    school: 'crystal',
    power: 85,
    manaCost: 35,
    frostCost: 15,
    cooldown: 7,
    unlockLevel: 28,
    description: 'Unleashes a devastating storm of razor-sharp ice crystals that shreds through even the toughest frozen armor.',
    icon: '💎',
    color: '#7C4DFF',
    isUltimate: false,
  },
  {
    id: 'absolute_zero',
    name: 'Absolute Zero',
    school: 'aurora',
    power: 150,
    manaCost: 50,
    frostCost: 100,
    cooldown: 10,
    unlockLevel: 35,
    description: 'The ultimate ice technique — drops the temperature to absolute zero, freezing matter at the molecular level and shattering it completely.',
    icon: '🌟',
    color: '#FFD740',
    isUltimate: true,
  },
]

// ─── MONSTERS (10) ──────────────────────────────────────────────

export const FF_MONSTERS: readonly FfMonsterDef[] = [
  {
    id: 'frost_imp',
    name: 'Frost Imp',
    element: 'ice',
    hp: 40,
    attack: 8,
    defense: 4,
    speed: 18,
    frostResist: 10,
    weakness: 'crystal',
    xpReward: 15,
    frostMeterReward: 5,
    description: 'A small mischievous ice spirit that scurries across frozen battlefields, pelting foes with snowballs.',
    lore: 'Frost imps are born from the laughter of glaciers. They are annoying but deceptively dangerous in swarms.',
    icon: '👺',
    color: '#81D4FA',
    specialAbility: 'Frost Bite — deals bonus damage on critical hits.',
  },
  {
    id: 'ice_golem_brute',
    name: 'Ice Golem Brute',
    element: 'glacier',
    hp: 120,
    attack: 18,
    defense: 25,
    speed: 3,
    frostResist: 40,
    weakness: 'frost',
    xpReward: 35,
    frostMeterReward: 12,
    description: 'A massive golem constructed from ancient glacial ice. Its armor is nearly impenetrable to physical attacks.',
    lore: 'The first Ice Golem Brutes were carved by the Frost Titan himself during the First Eternal Winter.',
    icon: '🗿',
    color: '#4FC3F7',
    specialAbility: 'Glacial Slam — crushes target and reduces their speed.',
  },
  {
    id: 'blizzard_hawk',
    name: 'Blizzard Hawk',
    element: 'storm',
    hp: 60,
    attack: 22,
    defense: 8,
    speed: 30,
    frostResist: 15,
    weakness: 'aurora',
    xpReward: 25,
    frostMeterReward: 8,
    description: 'A fierce raptor that rides the freezing winds. Its ice-crystal talons can shred through steel.',
    lore: 'Blizzard Hawks nest in perpetual cyclones. Only the aurora can calm their fury.',
    icon: '🦅',
    color: '#B0BEC5',
    specialAbility: 'Cyclone Dive — strikes twice in one turn with increased speed.',
  },
  {
    id: 'frost_wraith',
    name: 'Frost Wraith',
    element: 'frost',
    hp: 80,
    attack: 28,
    defense: 12,
    speed: 20,
    frostResist: 50,
    weakness: 'crystal',
    xpReward: 40,
    frostMeterReward: 15,
    description: 'A spectral entity formed from the collective sorrow of frozen travelers. Drains warmth from all living things.',
    lore: 'Frost Wraiths whisper the names of those they have frozen. Listening too closely invites permanent frostbite.',
    icon: '👻',
    color: '#00BCD4',
    specialAbility: 'Life Drain — heals itself for half the damage dealt.',
  },
  {
    id: 'glacier_titan',
    name: 'Glacier Titan',
    element: 'glacier',
    hp: 200,
    attack: 32,
    defense: 40,
    speed: 5,
    frostResist: 60,
    weakness: 'blizzard',
    xpReward: 60,
    frostMeterReward: 20,
    description: 'An ancient titan of living glacier ice that towers over the battlefield. Its footsteps create ice quakes.',
    lore: 'The Glacier Titan has existed since before the continents formed. It dreams of a world returned to ice.',
    icon: '🏔️',
    color: '#00ACC1',
    specialAbility: 'Ice Quake — deals area damage and stuns for one turn.',
  },
  {
    id: 'snowstorm_serpent',
    name: 'Snowstorm Serpent',
    element: 'storm',
    hp: 100,
    attack: 25,
    defense: 15,
    speed: 24,
    frostResist: 25,
    weakness: 'frost',
    xpReward: 45,
    frostMeterReward: 14,
    description: 'A serpentine beast that weaves through blizzards, invisible until it strikes with venomous frost fangs.',
    lore: 'The Snowstorm Serpent is the guardian of the eternal snowstorm. Its venom can freeze blood in seconds.',
    icon: '🐍',
    color: '#B0BEC5',
    specialAbility: 'Venomous Frost — inflicts frost burn damage over three turns.',
  },
  {
    id: 'crystal_frost_mage',
    name: 'Crystal Frost Mage',
    element: 'frost',
    hp: 70,
    attack: 35,
    defense: 18,
    speed: 15,
    frostResist: 55,
    weakness: 'aurora',
    xpReward: 50,
    frostMeterReward: 18,
    description: 'A powerful sorcerer who has fused crystal magic with frost energy. Casts devastating ice spells.',
    lore: 'The Crystal Frost Mage sacrificed their humanity for power. Their blood now runs as liquid crystal.',
    icon: '🧙',
    color: '#7C4DFF',
    specialAbility: 'Crystal Barrage — hits three times with random frost attacks.',
  },
  {
    id: 'permafrost_elemental',
    name: 'Permafrost Elemental',
    element: 'glacier',
    hp: 150,
    attack: 20,
    defense: 35,
    speed: 8,
    frostResist: 70,
    weakness: 'blizzard',
    xpReward: 55,
    frostMeterReward: 16,
    description: 'A massive elemental born from ancient permafrost that predates civilization. Nearly immune to ice damage.',
    lore: 'The Permafrost Elemental does not think. It simply exists, embodying the concept of eternal cold.',
    icon: '🌀',
    color: '#00BCD4',
    specialAbility: 'Permafrost Shell — gains massive temporary defense for two turns.',
  },
  {
    id: 'frostbite_wyrm',
    name: 'Frostbite Wyrm',
    element: 'ice',
    hp: 180,
    attack: 38,
    defense: 28,
    speed: 16,
    frostResist: 30,
    weakness: 'crystal',
    xpReward: 70,
    frostMeterReward: 22,
    description: 'A fearsome ice dragon whose breath weapon can freeze entire armies solid in seconds.',
    lore: 'The Frostbite Wyrm sleeps curled around the world tree, its body forming the polar ice cap.',
    icon: '🐉',
    color: '#4FC3F7',
    specialAbility: 'Breath of Winter — freezes target for one turn and deals heavy damage.',
  },
  {
    id: 'eternal_frost_lord',
    name: 'Eternal Frost Lord',
    element: 'shadow',
    hp: 300,
    attack: 45,
    defense: 50,
    speed: 12,
    frostResist: 45,
    weakness: 'aurora',
    xpReward: 150,
    frostMeterReward: 50,
    description: 'The supreme ruler of the frozen wastes. A being of absolute cold and ancient malice that commands all ice.',
    lore: 'The Eternal Frost Lord was once a mortal king who sought immortality through ice. He succeeded, but at a terrible cost.',
    icon: '👑',
    color: '#FFD740',
    specialAbility: 'Eternal Winter — summons a blizzard and freezes the player for two turns.',
  },
]

// ─── EQUIPMENT (6 slots × 4 rarities = 24 items) ───────────────

export const FF_EQUIPMENT: readonly FfEquipmentDef[] = [
  // ── Weapons (4) ──
  {
    id: 'frost_dagger', name: 'Frost Dagger', slot: 'weapon', rarity: 'common',
    attackBonus: 5, defenseBonus: 0, speedBonus: 3, frostPowerBonus: 2, hpBonus: 0, manaBonus: 5,
    description: 'A simple dagger etched with frost runes that chills on contact.',
    lore: 'Every frost initiate crafts their own dagger from icicle shards on their first day.', icon: '🗡️', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'glacial_sword', name: 'Glacial Sword', slot: 'weapon', rarity: 'rare',
    attackBonus: 18, defenseBonus: 4, speedBonus: 0, frostPowerBonus: 8, hpBonus: 10, manaBonus: 10,
    description: 'A sword forged from glacial ice that never melts, humming with ancient frost energy.',
    lore: 'The Glacial Sword was pulled from a frozen lake by the first frost knight.', icon: '⚔️', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'crystal_warblade', name: 'Crystal Warblade', slot: 'weapon', rarity: 'epic',
    attackBonus: 30, defenseBonus: 8, speedBonus: 5, frostPowerBonus: 15, hpBonus: 20, manaBonus: 15,
    description: 'A legendary blade encrusted with enchanted ice crystals that amplify frost power dramatically.',
    lore: 'Each crystal on this blade contains the scream of a frozen enemy.', icon: '🗡️', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'absolute_zero_blade', name: 'Absolute Zero Blade', slot: 'weapon', rarity: 'legendary',
    attackBonus: 50, defenseBonus: 12, speedBonus: 8, frostPowerBonus: 30, hpBonus: 50, manaBonus: 30,
    description: 'The ultimate ice weapon, radiating absolute cold. Cuts through any defense like a hot knife through butter.',
    lore: 'This blade was forged at the heart of a dying star frozen in time. It hungers for warmth.', icon: '⚔️', color: '#FFD740', requiredLevel: 35,
  },
  // ── Armor (4) ──
  {
    id: 'snow_vest', name: 'Snow Vest', slot: 'armor', rarity: 'common',
    attackBonus: 0, defenseBonus: 8, speedBonus: 0, frostPowerBonus: 1, hpBonus: 15, manaBonus: 0,
    description: 'Padded armor lined with enchanted snow that provides basic protection against cold.',
    lore: 'The Snow Vest keeps its wearer warm while freezing everything around them.', icon: '🧥', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'ice_plate', name: 'Ice Plate Armor', slot: 'armor', rarity: 'rare',
    attackBonus: 3, defenseBonus: 22, speedBonus: -2, frostPowerBonus: 5, hpBonus: 40, manaBonus: 5,
    description: 'Full plate armor made from reinforced glacier ice, offering superb protection.',
    lore: 'The Ice Plate weighs nothing to its wearer but crushes anyone else who tries to lift it.', icon: '🛡️', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'frostlord_mail', name: 'Frostlord Chainmail', slot: 'armor', rarity: 'epic',
    attackBonus: 8, defenseBonus: 35, speedBonus: 0, frostPowerBonus: 12, hpBonus: 60, manaBonus: 10,
    description: 'Magical chainmail woven from unmelting frost threads. Each link hums with protective energy.',
    lore: 'The links of this mail were forged one at a time over a thousand years by frost dwarves.', icon: '🛡️', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'aurora_aegis', name: 'Aurora Aegis', slot: 'armor', rarity: 'legendary',
    attackBonus: 15, defenseBonus: 55, speedBonus: 2, frostPowerBonus: 25, hpBonus: 100, manaBonus: 25,
    description: 'Armor forged from captured aurora light. Grants immunity to ice damage and incredible defense.',
    lore: 'The Aurora Aegis bends light around its wearer, making them invisible to all frozen creatures.', icon: '🛡️', color: '#FFD740', requiredLevel: 35,
  },
  // ── Helmets (4) ──
  {
    id: 'frost_cap', name: 'Frost Cap', slot: 'helmet', rarity: 'common',
    attackBonus: 1, defenseBonus: 4, speedBonus: 1, frostPowerBonus: 2, hpBonus: 5, manaBonus: 8,
    description: 'A warm cap woven from frost spider silk that enhances mental focus for frost spells.',
    lore: 'Frost spiders spin silk only during the coldest nights of the year.', icon: '🧢', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'glacial_helm', name: 'Glacial Helm', slot: 'helmet', rarity: 'rare',
    attackBonus: 3, defenseBonus: 12, speedBonus: 0, frostPowerBonus: 6, hpBonus: 15, manaBonus: 12,
    description: 'A helmet carved from a single block of blue glacial ice. Enhances frost perception.',
    lore: 'The wearer of the Glacial Helm can see through any blizzard and detect ice creatures.', icon: '⛑️', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'crystal_crown', name: 'Crystal Crown', slot: 'helmet', rarity: 'epic',
    attackBonus: 6, defenseBonus: 18, speedBonus: 2, frostPowerBonus: 14, hpBonus: 25, manaBonus: 20,
    description: 'A crown of living ice crystals that channels ambient frost energy directly into the mind.',
    lore: 'The Crystal Crown whispers secrets of the ice age to its wearer.', icon: '👑', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'winter_sovereign_diadem', name: 'Winter Sovereign Diadem', slot: 'helmet', rarity: 'legendary',
    attackBonus: 10, defenseBonus: 28, speedBonus: 5, frostPowerBonus: 28, hpBonus: 40, manaBonus: 40,
    description: 'The crown of the Winter Sovereign, granting mastery over all ice and absolute mental clarity.',
    lore: 'Whoever wears this diadem becomes one with the concept of winter itself.', icon: '👑', color: '#FFD740', requiredLevel: 35,
  },
  // ── Boots (4) ──
  {
    id: 'snowshoes', name: 'Enchanted Snowshoes', slot: 'boots', rarity: 'common',
    attackBonus: 0, defenseBonus: 2, speedBonus: 5, frostPowerBonus: 1, hpBonus: 5, manaBonus: 0,
    description: 'Snowshoes enchanted to never sink in snow, allowing swift movement across frozen terrain.',
    lore: 'With these shoes, one can walk on top of snow drifts as if they were solid ground.', icon: '👢', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'glacier_treads', name: 'Glacier Treads', slot: 'boots', rarity: 'rare',
    attackBonus: 2, defenseBonus: 8, speedBonus: 12, frostPowerBonus: 4, hpBonus: 10, manaBonus: 5,
    description: 'Boots with soles made from living glacier ice. Leaves a trail of frost wherever the wearer walks.',
    lore: 'The Glacier Treads leave footprints that freeze into temporary ice platforms.', icon: '👢', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'frostwind_greaves', name: 'Frostwind Greaves', slot: 'boots', rarity: 'epic',
    attackBonus: 5, defenseBonus: 14, speedBonus: 20, frostPowerBonus: 10, hpBonus: 20, manaBonus: 10,
    description: 'Greaves that harness the power of frost winds, granting supernatural speed and agility.',
    lore: 'The Frostwind Greaves allow their wearer to sprint faster than a blizzard.', icon: '👢', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'aurora_striders', name: 'Aurora Striders', slot: 'boots', rarity: 'legendary',
    attackBonus: 8, defenseBonus: 20, speedBonus: 30, frostPowerBonus: 20, hpBonus: 35, manaBonus: 20,
    description: 'Boots infused with aurora energy. The wearer moves so fast they leave trails of northern lights.',
    lore: 'With the Aurora Striders, one can outrun the turning of the earth itself.', icon: '👢', color: '#FFD740', requiredLevel: 35,
  },
  // ── Rings (4) ──
  {
    id: 'frost_signet', name: 'Frost Signet', slot: 'ring', rarity: 'common',
    attackBonus: 3, defenseBonus: 3, speedBonus: 1, frostPowerBonus: 3, hpBonus: 5, manaBonus: 5,
    description: 'A simple signet ring that glows with faint frost energy, enhancing basic ice abilities.',
    lore: 'Every frost academy graduate receives this ring upon completing their training.', icon: '💍', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'ice_loop', name: 'Ice Loop', slot: 'ring', rarity: 'rare',
    attackBonus: 8, defenseBonus: 8, speedBonus: 3, frostPowerBonus: 10, hpBonus: 15, manaBonus: 10,
    description: 'A ring carved from a perfect circle of unmelting ice that amplifies all frost magic.',
    lore: 'The Ice Loop was created when a drop of water froze mid-air in a perfect circle.', icon: '💍', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'permafrost_band', name: 'Permafrost Band', slot: 'ring', rarity: 'epic',
    attackBonus: 14, defenseBonus: 14, speedBonus: 5, frostPowerBonus: 18, hpBonus: 30, manaBonus: 18,
    description: 'A band of ancient permafrost containing the power of a million frozen years.',
    lore: 'Touching the Permafrost Band reveals visions of the world before it thawed.', icon: '💍', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'ring_of_eternal_frost', name: 'Ring of Eternal Frost', slot: 'ring', rarity: 'legendary',
    attackBonus: 22, defenseBonus: 22, speedBonus: 8, frostPowerBonus: 30, hpBonus: 50, manaBonus: 30,
    description: 'The supreme ice ring that grants absolute frost power and regeneration in cold environments.',
    lore: 'This ring was forged by the first winter. Removing it causes the wearer to age a thousand years.', icon: '💍', color: '#FFD740', requiredLevel: 35,
  },
  // ── Amulets (4) ──
  {
    id: 'snowflake_charm', name: 'Snowflake Charm', slot: 'amulet', rarity: 'common',
    attackBonus: 1, defenseBonus: 2, speedBonus: 0, frostPowerBonus: 4, hpBonus: 8, manaBonus: 8,
    description: 'A charm containing a perfectly preserved snowflake that boosts frost mana regeneration.',
    lore: 'No two Snowflake Charms are alike, each containing a uniquely structured snowflake.', icon: '📿', color: '#B0BEC5', requiredLevel: 1,
  },
  {
    id: 'glacial_heart', name: 'Glacial Heart', slot: 'amulet', rarity: 'rare',
    attackBonus: 5, defenseBonus: 6, speedBonus: 2, frostPowerBonus: 12, hpBonus: 25, manaBonus: 15,
    description: 'An amulet containing a gem that beats with a cold pulse like a frozen heart.',
    lore: 'The Glacial Heart beats once per hour. Each beat releases a wave of healing frost.', icon: '📿', color: '#00BCD4', requiredLevel: 10,
  },
  {
    id: 'aurora_pendant', name: 'Aurora Pendant', slot: 'amulet', rarity: 'epic',
    attackBonus: 10, defenseBonus: 12, speedBonus: 4, frostPowerBonus: 20, hpBonus: 40, manaBonus: 25,
    description: 'A pendant that contains captured aurora light, granting spectacular frost enhancement and healing.',
    lore: 'The Aurora Pendant dances with shifting colors, each hue granting a different power.', icon: '📿', color: '#7C4DFF', requiredLevel: 25,
  },
  {
    id: 'heart_of_winter', name: 'Heart of Winter', slot: 'amulet', rarity: 'legendary',
    attackBonus: 18, defenseBonus: 20, speedBonus: 6, frostPowerBonus: 35, hpBonus: 80, manaBonus: 40,
    description: 'The literal heart of the season of winter, containing infinite frost energy and regenerative power.',
    lore: 'The Heart of Winter beats for all of eternity. Those who possess it command the season itself.', icon: '📿', color: '#FFD740', requiredLevel: 35,
  },
]

// ─── ARENAS (5) ─────────────────────────────────────────────────

export const FF_ARENAS: readonly FfArenaDef[] = [
  {
    id: 'frozen_lake',
    name: 'Frozen Lake',
    description: 'A vast frozen lake surrounded by snow-covered pines. The ice beneath creaks and groans with every step. Common frost creatures patrol these crystalline shores.',
    unlockLevel: 1,
    monsterPool: ['frost_imp', 'frost_imp', 'frost_imp', 'blizzard_hawk', 'frost_wraith'],
    difficultyMultiplier: 1.0,
    iceBonusPercent: 0,
    background: 'linear-gradient(180deg, #0A1628 0%, #0288D1 40%, #4FC3F7 70%, #E1F5FE 100%)',
    ambientColor: '#4FC3F7',
    wavesPerRun: 3,
  },
  {
    id: 'ice_cavern',
    name: 'Ice Cavern',
    description: 'A labyrinth of frozen tunnels beneath the mountains. Stalactites of pure ice hang from the ceiling, and bioluminescent frost fungi light the way in eerie blue-green hues.',
    unlockLevel: 8,
    monsterPool: ['frost_imp', 'blizzard_hawk', 'frost_wraith', 'snowstorm_serpent', 'ice_golem_brute'],
    difficultyMultiplier: 1.3,
    iceBonusPercent: 5,
    background: 'linear-gradient(180deg, #01579B 0%, #0288D1 30%, #00BCD4 60%, #004D40 100%)',
    ambientColor: '#00BCD4',
    wavesPerRun: 4,
  },
  {
    id: 'glacier_peak',
    name: 'Glacier Peak',
    description: 'The summit of an ancient glacier where the air thins and frost giants roam. Ice storms rage constantly, and the ground is treacherous with hidden crevasses.',
    unlockLevel: 15,
    monsterPool: ['ice_golem_brute', 'snowstorm_serpent', 'crystal_frost_mage', 'permafrost_elemental', 'frost_wraith'],
    difficultyMultiplier: 1.7,
    iceBonusPercent: 10,
    background: 'linear-gradient(180deg, #0A1628 0%, #37474F 30%, #78909C 60%, #CFD8DC 100%)',
    ambientColor: '#78909C',
    wavesPerRun: 5,
  },
  {
    id: 'snowstorm_valley',
    name: 'Snowstorm Valley',
    description: 'A perpetually storm-swept valley where visibility is zero and the wind howls like a chorus of the damned. Only the strongest frost creatures survive here.',
    unlockLevel: 22,
    monsterPool: ['crystal_frost_mage', 'permafrost_elemental', 'frostbite_wyrm', 'snowstorm_serpent', 'ice_golem_brute'],
    difficultyMultiplier: 2.2,
    iceBonusPercent: 15,
    background: 'linear-gradient(180deg, #0A1628 0%, #263238 20%, #455A64 50%, #B0BEC5 80%, #ECEFF1 100%)',
    ambientColor: '#B0BEC5',
    wavesPerRun: 5,
  },
  {
    id: 'eternal_winter',
    name: 'Eternal Winter',
    description: 'The heart of the frozen wastes where the Eternal Frost Lord holds dominion. Time itself is frozen here, and reality bends under the weight of absolute cold.',
    unlockLevel: 30,
    monsterPool: ['frostbite_wyrm', 'permafrost_elemental', 'crystal_frost_mage', 'frostbite_wyrm', 'eternal_frost_lord'],
    difficultyMultiplier: 3.0,
    iceBonusPercent: 25,
    background: 'linear-gradient(180deg, #000000 0%, #0A1628 20%, #01579B 50%, #00BCD4 80%, #FFD740 100%)',
    ambientColor: '#FFD740',
    wavesPerRun: 6,
  },
]

// ─── ACHIEVEMENTS (15) ──────────────────────────────────────────

export const FF_ACHIEVEMENTS: readonly FfAchievementDef[] = [
  { id: 'ff_first_kill', name: 'First Frost', description: 'Defeat your first frozen monster.', condition: 'totalKills >= 1', rewardXp: 25, hidden: false, icon: '🧊' },
  { id: 'ff_ten_kills', name: 'Monster Hunter', description: 'Defeat 10 frozen monsters.', condition: 'totalKills >= 10', rewardXp: 100, hidden: false, icon: '⚔️' },
  { id: 'ff_fifty_kills', name: 'Frost Slayer', description: 'Defeat 50 frozen monsters.', condition: 'totalKills >= 50', rewardXp: 300, hidden: false, icon: '🗡️' },
  { id: 'ff_hundred_kills', name: 'Ice Reaper', description: 'Defeat 100 frozen monsters.', condition: 'totalKills >= 100', rewardXp: 750, hidden: false, icon: '💀' },
  { id: 'ff_combo_3', name: 'Chain Reaction', description: 'Achieve a 3-hit combo chain.', condition: 'longestCombo >= 3', rewardXp: 50, hidden: false, icon: '🔗' },
  { id: 'ff_combo_5', name: 'Frost Cascade', description: 'Achieve a 5-hit combo chain.', condition: 'longestCombo >= 5', rewardXp: 200, hidden: false, icon: '❄️' },
  { id: 'ff_combo_10', name: 'Absolute Blizzard', description: 'Achieve a 10-hit combo chain.', condition: 'longestCombo >= 10', rewardXp: 500, hidden: true, icon: '🌟' },
  { id: 'ff_ultimate_cast', name: 'Absolute Zero!', description: 'Cast the Absolute Zero ultimate ability.', condition: 'ultimateAbilitiesCast >= 1', rewardXp: 400, hidden: false, icon: '🌟' },
  { id: 'ff_frost_meter_max', name: 'Frost Charged', description: 'Fill the frost meter to maximum.', condition: 'frostMeterFull', rewardXp: 150, hidden: false, icon: '🔋' },
  { id: 'ff_arena_complete', name: 'Arena Conqueror', description: 'Complete all 5 arenas at least once.', condition: 'arenasCompleted >= 5', rewardXp: 500, hidden: false, icon: '🏔️' },
  { id: 'ff_frost_lord_slain', name: 'Lord Fallen', description: 'Defeat the Eternal Frost Lord.', condition: 'eternalFrostLordSlain', rewardXp: 1000, hidden: false, icon: '👑' },
  { id: 'ff_streak_3', name: 'Cold Streak', description: 'Maintain a 3-day play streak.', condition: 'streak >= 3', rewardXp: 75, hidden: false, icon: '📅' },
  { id: 'ff_streak_7', name: 'Week of Fury', description: 'Maintain a 7-day play streak.', condition: 'streak >= 7', rewardXp: 300, hidden: false, icon: '📆' },
  { id: 'ff_level_20', name: 'Frost Veteran', description: 'Reach player level 20.', condition: 'level >= 20', rewardXp: 500, hidden: false, icon: '⭐' },
  { id: 'ff_level_40', name: 'Fury Incarnate', description: 'Reach the maximum player level of 40.', condition: 'level >= 40', rewardXp: 2000, hidden: true, icon: '🏆' },
]

// ─── LEVEL TITLES ───────────────────────────────────────────────

export const FF_TITLES: readonly { level: number; title: string; description: string }[] = [
  { level: 1, title: 'Frost Initiate', description: 'A newcomer to the arena, just learning to channel frost energy.' },
  { level: 5, title: 'Ice Apprentice', description: 'Has mastered basic frost bolts and can hold their own against imps.' },
  { level: 10, title: 'Glacial Warrior', description: 'A proven fighter who has survived the Ice Cavern trials.' },
  { level: 15, title: 'Blizzard Knight', description: 'Commands blizzard magic and stands firm on Glacier Peak.' },
  { level: 20, title: 'Frost Warden', description: 'Guardian of the frozen reaches, feared by ice creatures.' },
  { level: 25, title: 'Crystal Sage', description: 'Master of crystal frost magic, sought for wisdom.' },
  { level: 30, title: 'Permafrost Archon', description: 'Commands ancient permafrost power from the deep ice.' },
  { level: 35, title: 'Fury Avatar', description: 'Embodiment of frost fury, wielding ultimate ice power.' },
  { level: 40, title: 'Frost Sovereign', description: 'Absolute ruler of the ice arenas, master of all frost.' },
]

// ─── INTERNAL HELPERS ───────────────────────────────────────────

const FF_MAX_LEVEL = 40
const FF_BASE_HP = 80
const FF_HP_PER_LEVEL = 12
const FF_BASE_MANA = 40
const FF_MANA_PER_LEVEL = 6
const FF_BASE_ATTACK = 10
const FF_ATTACK_PER_LEVEL = 3
const FF_BASE_DEFENSE = 8
const FF_DEFENSE_PER_LEVEL = 2
const FF_BASE_SPEED = 10
const FF_SPEED_PER_LEVEL = 1
const FF_BASE_FROST_POWER = 8
const FF_FROST_POWER_PER_LEVEL = 2
const FF_MAX_FROST_METER = 100
const FF_INITIAL_GOLD = 100

function ffXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= FF_MAX_LEVEL) return Infinity
  return Math.floor(50 * Math.pow(1.12, level) + level * 15)
}

function ffLevelFromXp(totalXp: number): number {
  let level = 1
  let remaining = totalXp
  while (level < FF_MAX_LEVEL) {
    const needed = ffXpForLevel(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return level
}

function ffClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function ffSeedRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function ffPseudoRandom(seed: number, index: number): number {
  const rng = ffSeedRandom(seed + index)
  return rng()
}

function ffGetEffectiveStats(state: FrostFuryState): {
  attack: number; defense: number; speed: number; frostPower: number; maxHp: number; maxMana: number
} {
  let atk = state.player.baseAttack
  let def = state.player.baseDefense
  let spd = state.player.baseSpeed
  let fp = state.player.baseFrostPower
  let hp = state.player.maxHp
  let mp = state.player.maxMana

  for (const slot of ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'] as FfEquipSlot[]) {
    const itemId = state.equipment[slot]
    if (!itemId) continue
    const item = FF_EQUIPMENT.find(e => e.id === itemId)
    if (!item) continue
    atk += item.attackBonus
    def += item.defenseBonus
    spd += item.speedBonus
    fp += item.frostPowerBonus
    hp += item.hpBonus
    mp += item.manaBonus
  }

  return { attack: atk, defense: def, speed: spd, frostPower: fp, maxHp: hp, maxMana: mp }
}

function ffMonsterAt(state: FrostFuryState): FfMonsterDef | null {
  if (!state.combat.monster) return null
  return FF_MONSTERS.find(m => m.id === state.combat.monster!.monsterId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// NAMED EXPORTS — All pure functions with ff prefix
// ═══════════════════════════════════════════════════════════════════

// ─── State Management (6) ───────────────────────────────────────

export function ffInitialState(): FrostFuryState {
  return {
    player: {
      level: 1, xp: 0, totalXp: 0,
      hp: FF_BASE_HP, maxHp: FF_BASE_HP,
      mana: FF_BASE_MANA, maxMana: FF_BASE_MANA,
      baseAttack: FF_BASE_ATTACK, baseDefense: FF_BASE_DEFENSE,
      baseSpeed: FF_BASE_SPEED, baseFrostPower: FF_BASE_FROST_POWER,
      frostMeter: 0, maxFrostMeter: FF_MAX_FROST_METER,
    },
    equipment: { weapon: null, armor: null, helmet: null, boots: null, ring: null, amulet: null },
    combat: {
      active: false, arenaId: null, monster: null, turn: 0,
      comboChain: 0, comboLog: [], combatLog: [],
      shieldAmount: 0, shieldTurns: 0,
      glacialWallTurns: 0, glacialWallDefense: 0,
      blizzardActive: false, blizzardTurns: 0,
      playerStatusEffect: 'none', playerStatusTurns: 0,
      cooldowns: {}, waveNumber: 1,
      monstersKilledInWave: 0, waveMonsterCount: 1,
      combatWon: false, combatLost: false,
    },
    achievements: [], streak: 0, bestStreak: 0, lastPlayDate: '',
    dailyChallenge: null, stats: {
      totalKills: 0, totalDamageDealt: 0, totalDamageTaken: 0,
      totalHealing: 0, totalAbilitiesCast: 0, totalCombosCompleted: 0,
      longestCombo: 0, arenasCompleted: 0, totalWavesCleared: 0,
      totalFrostMeterGained: 0, ultimateAbilitiesCast: 0,
      frozenMonstersCount: 0, criticalHits: 0,
      totalGoldEarned: 0, gold: FF_INITIAL_GOLD,
    },
    unlockedArenas: ['frozen_lake'], title: 'Frost Initiate', seed: 42,
  }
}

export function ffResetState(): FrostFuryState {
  return ffInitialState()
}

export function ffGetState(state: FrostFuryState): FrostFuryState {
  return state
}

export function ffCloneState(state: FrostFuryState): FrostFuryState {
  return JSON.parse(JSON.stringify(state)) as FrostFuryState
}

export function ffMergeState(base: FrostFuryState, patch: Partial<FrostFuryState>): FrostFuryState {
  return { ...base, ...patch }
}

// ─── Player Functions (10) ──────────────────────────────────────

export function ffGetPlayerLevel(state: FrostFuryState): number {
  return state.player.level
}

export function ffGetXpForLevel(level: number): number {
  return ffXpForLevel(level)
}

export function ffGetLevelFromXp(totalXp: number): number {
  return ffLevelFromXp(totalXp)
}

export function ffGetXpToNextLevel(state: FrostFuryState): number {
  if (state.player.level >= FF_MAX_LEVEL) return 0
  return ffXpForLevel(state.player.level)
}

export function ffGetXpProgress(state: FrostFuryState): number {
  if (state.player.level >= FF_MAX_LEVEL) return 1
  const needed = ffXpForLevel(state.player.level)
  if (needed <= 0) return 0
  return Math.min(1, state.player.xp / needed)
}

export function ffGetPlayerTitle(state: FrostFuryState): string {
  let title = FF_TITLES[0].title
  for (const t of FF_TITLES) {
    if (state.player.level >= t.level) title = t.title
  }
  return title
}

export function ffGetTitleForLevel(level: number): string {
  let title = FF_TITLES[0].title
  for (const t of FF_TITLES) {
    if (level >= t.level) title = t.title
  }
  return title
}

export function ffAddXp(state: FrostFuryState, amount: number): FrostFuryState {
  const newTotal = state.player.totalXp + amount
  const newLevel = ffLevelFromXp(newTotal)
  const newMaxHp = FF_BASE_HP + newLevel * FF_HP_PER_LEVEL
  const newMaxMana = FF_BASE_MANA + newLevel * FF_MANA_PER_LEVEL
  const hpDiff = newMaxHp - state.player.maxHp
  const manaDiff = newMaxMana - state.player.maxMana
  return {
    ...state,
    player: {
      ...state.player,
      totalXp: newTotal,
      xp: newTotal - Array.from({ length: newLevel - 1 }, (_, i) => ffXpForLevel(i + 1)).reduce((a, b) => a + b, 0),
      level: newLevel,
      baseAttack: FF_BASE_ATTACK + newLevel * FF_ATTACK_PER_LEVEL,
      baseDefense: FF_BASE_DEFENSE + newLevel * FF_DEFENSE_PER_LEVEL,
      baseSpeed: FF_BASE_SPEED + newLevel * FF_SPEED_PER_LEVEL,
      baseFrostPower: FF_BASE_FROST_POWER + newLevel * FF_FROST_POWER_PER_LEVEL,
      maxHp: newMaxHp,
      hp: Math.min(state.player.hp + hpDiff, newMaxHp),
      maxMana: newMaxMana,
      mana: Math.min(state.player.mana + manaDiff, newMaxMana),
    },
    title: ffGetTitleForLevel(newLevel),
    unlockedArenas: FF_ARENAS.filter(a => a.unlockLevel <= newLevel).map(a => a.id),
  }
}

export function ffGetEffectiveAttack(state: FrostFuryState): number {
  return ffGetEffectiveStats(state).attack
}

export function ffGetEffectiveDefense(state: FrostFuryState): number {
  return ffGetEffectiveStats(state).defense
}

export function ffGetEffectiveSpeed(state: FrostFuryState): number {
  return ffGetEffectiveStats(state).speed
}

export function ffGetEffectiveFrostPower(state: FrostFuryState): number {
  return ffGetEffectiveStats(state).frostPower
}

export function ffHealPlayer(state: FrostFuryState, amount: number): FrostFuryState {
  return {
    ...state,
    player: { ...state.player, hp: Math.min(state.player.hp + amount, state.player.maxHp) },
    stats: { ...state.stats, totalHealing: state.stats.totalHealing + amount },
  }
}

export function ffDamagePlayer(state: FrostFuryState, amount: number): FrostFuryState {
  const actualDamage = Math.max(1, amount - Math.floor(ffGetEffectiveDefense(state) * 0.3))
  return {
    ...state,
    player: { ...state.player, hp: Math.max(0, state.player.hp - actualDamage) },
    stats: { ...state.stats, totalDamageTaken: state.stats.totalDamageTaken + actualDamage },
  }
}

export function ffRestoreMana(state: FrostFuryState, amount: number): FrostFuryState {
  return {
    ...state,
    player: { ...state.player, mana: Math.min(state.player.mana + amount, state.player.maxMana) },
  }
}

// ─── Frost Meter Functions (6) ─────────────────────────────────

export function ffGetFrostMeter(state: FrostFuryState): number {
  return state.player.frostMeter
}

export function ffGetMaxFrostMeter(): number {
  return FF_MAX_FROST_METER
}

export function ffAddFrostMeter(state: FrostFuryState, amount: number): FrostFuryState {
  const newMeter = Math.min(state.player.frostMeter + amount, FF_MAX_FROST_METER)
  return {
    ...state,
    player: { ...state.player, frostMeter: newMeter },
    stats: { ...state.stats, totalFrostMeterGained: state.stats.totalFrostMeterGained + amount },
  }
}

export function ffIsFrostMeterFull(state: FrostFuryState): boolean {
  return state.player.frostMeter >= FF_MAX_FROST_METER
}

export function ffGetFrostMeterPercent(state: FrostFuryState): number {
  return (state.player.frostMeter / FF_MAX_FROST_METER) * 100
}

export function ffResetFrostMeter(state: FrostFuryState): FrostFuryState {
  return { ...state, player: { ...state.player, frostMeter: 0 } }
}

// ─── Ability Functions (14) ─────────────────────────────────────

export function ffGetAbilityDef(abilityId: string): FfAbilityDef | undefined {
  return FF_ABILITIES.find(a => a.id === abilityId)
}

export function ffGetAbilityList(): readonly FfAbilityDef[] {
  return FF_ABILITIES
}

export function ffGetUnlockedAbilities(state: FrostFuryState): FfAbilityDef[] {
  return FF_ABILITIES.filter(a => a.unlockLevel <= state.player.level)
}

export function ffIsAbilityUnlocked(state: FrostFuryState, abilityId: string): boolean {
  const def = ffGetAbilityDef(abilityId)
  if (!def) return false
  return def.unlockLevel <= state.player.level
}

export function ffCanCastAbility(state: FrostFuryState, abilityId: string): boolean {
  const def = ffGetAbilityDef(abilityId)
  if (!def) return false
  if (!ffIsAbilityUnlocked(state, abilityId)) return false
  if (state.player.mana < def.manaCost) return false
  if (state.player.frostMeter < def.frostCost) return false
  const cd = state.combat.cooldowns[abilityId] ?? 0
  if (cd > 0) return false
  if (!state.combat.active) return false
  return true
}

export function ffGetAbilityCooldown(state: FrostFuryState, abilityId: string): number {
  return state.combat.cooldowns[abilityId] ?? 0
}

export function ffIsAbilityReady(state: FrostFuryState, abilityId: string): boolean {
  return ffGetAbilityCooldown(state, abilityId) <= 0
}

export function ffGetFrostBoltDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.attack * 1.2 + stats.frostPower * 0.5)
}

export function ffGetIceShieldValue(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.defense * 1.5 + stats.frostPower * 0.8)
}

export function ffGetBlizzardDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.frostPower * 1.8 + stats.attack * 0.6)
}

export function ffGetFrozenLanceDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.attack * 2.0 + stats.frostPower * 0.7)
}

export function ffGetGlacierWallDefense(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.defense * 2.5 + stats.frostPower * 1.0)
}

export function ffGetAvalancheDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.attack * 2.5 + stats.frostPower * 1.2)
}

export function ffGetCrystalStormDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.frostPower * 2.5 + stats.attack * 1.0)
}

export function ffGetAbsoluteZeroDamage(state: FrostFuryState): number {
  const stats = ffGetEffectiveStats(state)
  return Math.floor(stats.frostPower * 4.0 + stats.attack * 2.0)
}

// ─── Monster Functions (8) ──────────────────────────────────────

export function ffGetMonsterDef(monsterId: string): FfMonsterDef | undefined {
  return FF_MONSTERS.find(m => m.id === monsterId)
}

export function ffGetMonsterList(): readonly FfMonsterDef[] {
  return FF_MONSTERS
}

export function ffSpawnMonster(state: FrostFuryState, monsterId: string, difficultyMultiplier: number): FrostFuryState {
  const def = ffGetMonsterDef(monsterId)
  if (!def) return state
  const scaledHp = Math.floor(def.hp * difficultyMultiplier)
  return {
    ...state,
    combat: {
      ...state.combat,
      monster: {
        monsterId: def.id,
        currentHp: scaledHp,
        maxHp: scaledHp,
        statusEffect: 'none',
        statusTurns: 0,
        turnCount: 0,
      },
    },
  }
}

export function ffGetMonsterHpPercent(state: FrostFuryState): number {
  if (!state.combat.monster) return 0
  return (state.combat.monster.currentHp / state.combat.monster.maxHp) * 100
}

export function ffIsMonsterAlive(state: FrostFuryState): boolean {
  return state.combat.monster !== null && state.combat.monster.currentHp > 0
}

export function ffGetMonsterWeakness(state: FrostFuryState): FfAbilitySchool | null {
  const mDef = ffMonsterAt(state)
  return mDef ? mDef.weakness : null
}

export function ffDamageMonster(state: FrostFuryState, rawDamage: number): FrostFuryState {
  if (!state.combat.monster) return state
  const mDef = ffMonsterAt(state)
  if (!mDef) return state
  const resist = mDef.frostResist / 100
  const actualDamage = Math.max(1, Math.floor(rawDamage * (1 - resist)))
  return {
    ...state,
    combat: {
      ...state.combat,
      monster: { ...state.combat.monster, currentHp: Math.max(0, state.combat.monster.currentHp - actualDamage) },
    },
    stats: { ...state.stats, totalDamageDealt: state.stats.totalDamageDealt + actualDamage },
  }
}

export function ffCalculateIceBonus(state: FrostFuryState, abilityId: string, monsterId: string): number {
  const aDef = ffGetAbilityDef(abilityId)
  const mDef = ffGetMonsterDef(monsterId)
  if (!aDef || !mDef) return 0
  let bonus = 0
  if (aDef.school === mDef.weakness) bonus += 0.5
  const arena = FF_ARENAS.find(a => a.id === state.combat.arenaId)
  if (arena) bonus += arena.iceBonusPercent / 100
  return bonus
}

// ─── Combat Functions (14) ──────────────────────────────────────

export function ffIsCombatActive(state: FrostFuryState): boolean {
  return state.combat.active
}

export function ffGetTurnCount(state: FrostFuryState): number {
  return state.combat.turn
}

export function ffStartCombat(state: FrostFuryState, arenaId: FfArenaId, monsterId: string): FrostFuryState {
  const arena = FF_ARENAS.find(a => a.id === arenaId)
  if (!arena) return state
  const s = ffSpawnMonster(state, monsterId, arena.difficultyMultiplier)
  return {
    ...s,
    combat: {
      ...s.combat,
      active: true,
      arenaId,
      turn: 1,
      comboChain: 0,
      comboLog: [],
      combatLog: [],
      shieldAmount: 0,
      shieldTurns: 0,
      glacialWallTurns: 0,
      glacialWallDefense: 0,
      blizzardActive: false,
      blizzardTurns: 0,
      playerStatusEffect: 'none',
      playerStatusTurns: 0,
      cooldowns: {},
      waveNumber: 1,
      monstersKilledInWave: 0,
      waveMonsterCount: arena.wavesPerRun,
      combatWon: false,
      combatLost: false,
    },
    player: { ...s.player, hp: s.player.maxHp, mana: s.player.maxMana },
  }
}

export function ffEndCombat(state: FrostFuryState, victory: boolean): FrostFuryState {
  const newStats = { ...state.stats }
  if (victory && state.combat.arenaId) {
    const arena = FF_ARENAS.find(a => a.id === state.combat.arenaId)
    if (arena) {
      newStats.gold += Math.floor(20 * arena.difficultyMultiplier)
      newStats.totalGoldEarned += Math.floor(20 * arena.difficultyMultiplier)
    }
  }
  if (state.combat.comboChain >= 3) {
    newStats.totalCombosCompleted++
  }
  return {
    ...state,
    combat: {
      ...ffInitialState().combat,
    },
    stats: newStats,
  }
}

export function ffNextTurn(state: FrostFuryState): FrostFuryState {
  if (!state.combat.active) return state

  const newCooldowns: Record<string, number> = {}
  for (const [key, val] of Object.entries(state.combat.cooldowns)) {
    newCooldowns[key] = Math.max(0, val - 1)
  }

  let shieldAmount = state.combat.shieldAmount
  let shieldTurns = state.combat.shieldTurns
  if (shieldTurns > 0) {
    shieldTurns--
    if (shieldTurns <= 0) shieldAmount = 0
  }

  let glacialWallTurns = state.combat.glacialWallTurns
  let glacialWallDefense = state.combat.glacialWallDefense
  if (glacialWallTurns > 0) {
    glacialWallTurns--
    if (glacialWallTurns <= 0) glacialWallDefense = 0
  }

  let blizzardActive = state.combat.blizzardActive
  let blizzardTurns = state.combat.blizzardTurns
  let newState = { ...state }
  if (blizzardActive && blizzardTurns > 0) {
    blizzardTurns--
    if (state.combat.monster && state.combat.monster.currentHp > 0) {
      const blizzDmg = Math.floor(ffGetBlizzardDamage(state) * 0.3)
      newState = ffDamageMonster(newState, blizzDmg)
    }
    if (blizzardTurns <= 0) blizzardActive = false
  }

  let playerStatusEffect = state.combat.playerStatusEffect
  let playerStatusTurns = state.combat.playerStatusTurns
  if (playerStatusTurns > 0) {
    playerStatusTurns--
    if (playerStatusTurns <= 0) playerStatusEffect = 'none'
  }

  return {
    ...newState,
    combat: {
      ...newState.combat,
      turn: newState.combat.turn + 1,
      cooldowns: newCooldowns,
      shieldAmount,
      shieldTurns,
      glacialWallTurns,
      glacialWallDefense,
      blizzardActive,
      blizzardTurns,
      playerStatusEffect,
      playerStatusTurns,
    },
  }
}

export function ffMonsterAttack(state: FrostFuryState): FrostFuryState {
  if (!state.combat.active || !state.combat.monster || state.combat.monster.currentHp <= 0) return state
  const mDef = ffMonsterAt(state)
  if (!mDef) return state

  let damage = Math.floor(mDef.attack * (0.8 + ffPseudoRandom(state.seed, state.combat.turn * 7) * 0.4))
  if (state.combat.glacialWallDefense > 0) {
    damage = Math.max(1, damage - state.combat.glacialWallDefense)
  }
  if (state.combat.shieldAmount > 0) {
    const absorbed = Math.min(state.combat.shieldAmount, damage)
    damage -= absorbed
  }
  if (damage > 0) {
    state = ffDamagePlayer(state, damage)
  }

  return state
}

export function ffProcessTurn(state: FrostFuryState, abilityId: string): FrostFuryState {
  let s = ffCastAbilityInternal(state, abilityId)
  if (!ffIsMonsterAlive(s)) {
    s = ffHandleMonsterDeath(s)
    return s
  }
  if (state.combat.playerStatusEffect !== 'frozen' && state.combat.playerStatusEffect !== 'stunned') {
    s = ffMonsterAttack(s)
  }
  if (s.player.hp <= 0) {
    s = { ...s, combat: { ...s.combat, active: false, combatLost: true }, streak: 0 }
    return s
  }
  s = ffNextTurn(s)
  return s
}

export function ffGetCombatLog(state: FrostFuryState): FfCombatLog[] {
  return state.combat.combatLog
}

export function ffIsPlayerDead(state: FrostFuryState): boolean {
  return state.player.hp <= 0
}

export function ffIsVictory(state: FrostFuryState): boolean {
  return state.combat.combatWon
}

export function ffIsDefeat(state: FrostFuryState): boolean {
  return state.combat.combatLost
}

// ─── Internal Cast ──────────────────────────────────────────────

function ffCastAbilityInternal(state: FrostFuryState, abilityId: string): FrostFuryState {
  if (!ffCanCastAbility(state, abilityId)) return state
  const def = ffGetAbilityDef(abilityId)
  if (!def || !state.combat.monster) return state

  let s = {
    ...state,
    player: { ...state.player, mana: state.player.mana - def.manaCost },
    stats: { ...state.stats, totalAbilitiesCast: state.stats.totalAbilitiesCast + 1 },
  }

  if (def.frostCost > 0) {
    s = ffResetFrostMeter(s)
  }

  if (def.isUltimate) {
    s = { ...s, stats: { ...s.stats, ultimateAbilitiesCast: s.stats.ultimateAbilitiesCast + 1 } }
  }

  const iceBonus = ffCalculateIceBonus(state, abilityId, state.combat.monster!.monsterId)
  let damage = 0
  let frostGained = def.frostCost > 0 ? 0 : Math.floor(3 + def.power * 0.1)
  let logDetail = ''

  switch (abilityId) {
    case 'frost_bolt': {
      damage = Math.floor(ffGetFrostBoltDamage(s) * (1 + iceBonus))
      logDetail = `Frost Bolt hits for ${damage} ice damage!`
      break
    }
    case 'ice_shield': {
      const shieldVal = ffGetIceShieldValue(s)
      s = { ...s, combat: { ...s.combat, shieldAmount: shieldVal, shieldTurns: 3 } }
      logDetail = `Ice Shield absorbs up to ${shieldVal} damage for 3 turns!`
      break
    }
    case 'blizzard': {
      damage = Math.floor(ffGetBlizzardDamage(s) * (1 + iceBonus) * 0.5)
      s = {
        ...s,
        combat: { ...s.combat, blizzardActive: true, blizzardTurns: 3 },
      }
      if (state.combat.monster.currentHp > 0) {
        s = ffDamageMonster(s, damage)
      }
      logDetail = `Blizzard summoned! Initial hit for ${damage} damage. Storm rages for 3 turns!`
      break
    }
    case 'frozen_lance': {
      damage = Math.floor(ffGetFrozenLanceDamage(s) * (1 + iceBonus))
      if (state.combat.monster.currentHp > 0) {
        s = ffDamageMonster(s, damage)
      }
      logDetail = `Frozen Lance pierces for ${damage} piercing ice damage!`
      break
    }
    case 'glacier_wall': {
      const wallDef = ffGetGlacierWallDefense(s)
      s = {
        ...s,
        combat: { ...s.combat, glacialWallTurns: 4, glacialWallDefense: wallDef },
      }
      logDetail = `Glacier Wall raised! +${wallDef} defense for 4 turns!`
      break
    }
    case 'avalanche': {
      damage = Math.floor(ffGetAvalancheDamage(s) * (1 + iceBonus))
      if (state.combat.monster.currentHp > 0) {
        s = ffDamageMonster(s, damage)
      }
      logDetail = `Avalanche crashes down for ${damage} crushing ice damage!`
      break
    }
    case 'crystal_storm': {
      const hits = 3
      let totalDmg = 0
      for (let i = 0; i < hits; i++) {
        if (s.combat.monster && s.combat.monster.currentHp > 0) {
          const hitDmg = Math.floor(ffGetCrystalStormDamage(s) * (1 + iceBonus) / hits)
          s = ffDamageMonster(s, hitDmg)
          totalDmg += hitDmg
        }
      }
      damage = totalDmg
      logDetail = `Crystal Storm unleashes ${hits} hits for ${damage} total damage!`
      break
    }
    case 'absolute_zero': {
      damage = Math.floor(ffGetAbsoluteZeroDamage(s) * (1 + iceBonus))
      if (state.combat.monster.currentHp > 0) {
        s = ffDamageMonster(s, damage)
        if (s.combat.monster && s.combat.monster.currentHp > 0) {
          s = {
            ...s,
            combat: {
              ...s.combat,
              monster: { ...s.combat.monster, statusEffect: 'frozen', statusTurns: 2 },
            },
            stats: { ...s.stats, frozenMonstersCount: s.stats.frozenMonstersCount + 1 },
          }
        }
      }
      frostGained = 0
      logDetail = `ABSOLUTE ZERO! ${damage} devastating damage! Target frozen for 2 turns!`
      break
    }
  }

  s = ffAddFrostMeter(s, frostGained)

  const comboChain = damage > 0 ? state.combat.comboChain + 1 : state.combat.comboChain
  const comboMultiplier = ffGetComboMultiplier(comboChain)
  if (comboMultiplier > 1 && damage > 0) {
    const bonusDmg = Math.floor(damage * (comboMultiplier - 1))
    if (s.combat.monster && s.combat.monster.currentHp > 0) {
      s = ffDamageMonster(s, bonusDmg)
    }
    logDetail += ` (${comboChain}x combo! +${bonusDmg} bonus)`
  }

  const combatLog: FfCombatLog = {
    turn: state.combat.turn,
    actor: 'player',
    action: def.name,
    damage,
    frostMeterGained: frostGained,
    detail: logDetail,
  }

  const newComboLog = damage > 0
    ? [...state.combat.comboLog, { abilityId, turnNumber: state.combat.turn, damage }]
    : state.combat.comboLog

  const newCooldowns = { ...state.combat.cooldowns }
  if (def.cooldown > 0) {
    newCooldowns[abilityId] = def.cooldown
  }

  const newLongestCombo = Math.max(state.stats.longestCombo, comboChain)

  return {
    ...s,
    combat: {
      ...s.combat,
      comboChain,
      comboLog: newComboLog,
      combatLog: [...s.combat.combatLog, combatLog],
      cooldowns: newCooldowns,
    },
    stats: { ...s.stats, longestCombo: newLongestCombo },
  }
}

function ffHandleMonsterDeath(state: FrostFuryState): FrostFuryState {
  if (!state.combat.monster) return state
  const mDef = ffMonsterAt(state)
  if (!mDef) return state

  let s = ffAddXp(state, mDef.xpReward)
  s = ffAddFrostMeter(s, mDef.frostMeterReward)

  const waveNum = state.combat.waveNumber
  const arena = state.combat.arenaId ? FF_ARENAS.find(a => a.id === state.combat.arenaId) : null
  const totalWaves = arena ? arena.wavesPerRun : 1

  s = {
    ...s,
    stats: {
      ...s.stats,
      totalKills: s.stats.totalKills + 1,
      totalWavesCleared: s.stats.totalWavesCleared + 1,
    },
  }

  if (mDef.id === 'eternal_frost_lord') {
    s = {
      ...s,
      stats: { ...s.stats },
    }
  }

  if (waveNum >= totalWaves) {
    s = {
      ...s,
      combat: { ...s.combat, active: false, combatWon: true, waveNumber: waveNum + 1 },
      stats: {
        ...s.stats,
        arenasCompleted: s.stats.arenasCompleted + 1,
      },
    }
  } else {
    const nextMonsterPool = arena ? arena.monsterPool : [mDef.id]
    const nextMonsterId = nextMonsterPool[Math.floor(ffPseudoRandom(state.seed, state.combat.turn * 13) * nextMonsterPool.length)]
    s = ffSpawnMonster(s, nextMonsterId, arena ? arena.difficultyMultiplier : 1)
    s = {
      ...s,
      combat: {
        ...s.combat,
        waveNumber: waveNum + 1,
        monstersKilledInWave: 0,
      },
    }
  }

  return s
}

// ─── Combo Functions (6) ────────────────────────────────────────

export function ffGetComboChain(state: FrostFuryState): number {
  return state.combat.comboChain
}

export function ffGetComboMultiplier(comboChain: number): number {
  if (comboChain <= 0) return 1.0
  if (comboChain === 1) return 1.0
  if (comboChain === 2) return 1.1
  if (comboChain === 3) return 1.25
  if (comboChain === 4) return 1.4
  if (comboChain === 5) return 1.6
  return 1.6 + (comboChain - 5) * 0.1
}

export function ffGetComboLog(state: FrostFuryState): FfComboEntry[] {
  return state.combat.comboLog
}

export function ffGetLongestCombo(state: FrostFuryState): number {
  return state.stats.longestCombo
}

export function ffResetCombo(state: FrostFuryState): FrostFuryState {
  return { ...state, combat: { ...state.combat, comboChain: 0, comboLog: [] } }
}

export function ffGetComboBonusDamage(state: FrostFuryState, baseDamage: number): number {
  const mult = ffGetComboMultiplier(state.combat.comboChain)
  return Math.floor(baseDamage * (mult - 1))
}

// ─── Arena Functions (8) ────────────────────────────────────────

export function ffGetArenaDef(arenaId: string): FfArenaDef | undefined {
  return FF_ARENAS.find(a => a.id === arenaId)
}

export function ffGetArenaList(): readonly FfArenaDef[] {
  return FF_ARENAS
}

export function ffGetUnlockedArenas(state: FrostFuryState): FfArenaDef[] {
  return FF_ARENAS.filter(a => state.unlockedArenas.includes(a.id))
}

export function ffIsArenaUnlocked(state: FrostFuryState, arenaId: FfArenaId): boolean {
  return state.unlockedArenas.includes(arenaId)
}

export function ffGetArenaDifficulty(arenaId: FfArenaId): number {
  const arena = FF_ARENAS.find(a => a.id === arenaId)
  return arena ? arena.difficultyMultiplier : 1
}

export function ffGetArenaIceBonus(arenaId: FfArenaId): number {
  const arena = FF_ARENAS.find(a => a.id === arenaId)
  return arena ? arena.iceBonusPercent : 0
}

export function ffGetArenaWaves(arenaId: FfArenaId): number {
  const arena = FF_ARENAS.find(a => a.id === arenaId)
  return arena ? arena.wavesPerRun : 3
}

export function ffEnterArena(state: FrostFuryState, arenaId: FfArenaId): FrostFuryState {
  if (!ffIsArenaUnlocked(state, arenaId)) return state
  const arena = FF_ARENAS.find(a => a.id === arenaId)
  if (!arena) return state
  const monsterPool = arena.monsterPool
  const firstMonster = monsterPool[Math.floor(ffPseudoRandom(state.seed, state.player.totalXp) * monsterPool.length)]
  return ffStartCombat(state, arenaId, firstMonster)
}

export function ffLeaveArena(state: FrostFuryState): FrostFuryState {
  return ffEndCombat(state, false)
}

// ─── Equipment Functions (8) ────────────────────────────────────

export function ffGetEquipmentDef(itemId: string): FfEquipmentDef | undefined {
  return FF_EQUIPMENT.find(e => e.id === itemId)
}

export function ffGetEquipmentList(): readonly FfEquipmentDef[] {
  return FF_EQUIPMENT
}

export function ffGetEquipmentBySlot(slot: FfEquipSlot): FfEquipmentDef[] {
  return FF_EQUIPMENT.filter(e => e.slot === slot)
}

export function ffGetSlotName(slot: FfEquipSlot): string {
  const names: Record<FfEquipSlot, string> = {
    weapon: 'Weapon', armor: 'Armor', helmet: 'Helmet',
    boots: 'Boots', ring: 'Ring', amulet: 'Amulet',
  }
  return names[slot]
}

export function ffGetEquippedItem(state: FrostFuryState, slot: FfEquipSlot): string | null {
  return state.equipment[slot]
}

export function ffEquipItem(state: FrostFuryState, slot: FfEquipSlot, itemId: string): FrostFuryState {
  const item = ffGetEquipmentDef(itemId)
  if (!item) return state
  if (item.slot !== slot) return state
  if (item.requiredLevel > state.player.level) return state
  return { ...state, equipment: { ...state.equipment, [slot]: itemId } }
}

export function ffUnequipItem(state: FrostFuryState, slot: FfEquipSlot): FrostFuryState {
  return { ...state, equipment: { ...state.equipment, [slot]: null } }
}

export function ffGetEquippedStatsTotal(state: FrostFuryState): {
  attackBonus: number; defenseBonus: number; speedBonus: number
  frostPowerBonus: number; hpBonus: number; manaBonus: number
} {
  let atk = 0, def = 0, spd = 0, fp = 0, hp = 0, mp = 0
  for (const slot of ['weapon', 'armor', 'helmet', 'boots', 'ring', 'amulet'] as FfEquipSlot[]) {
    const itemId = state.equipment[slot]
    if (!itemId) continue
    const item = ffGetEquipmentDef(itemId)
    if (!item) continue
    atk += item.attackBonus
    def += item.defenseBonus
    spd += item.speedBonus
    fp += item.frostPowerBonus
    hp += item.hpBonus
    mp += item.manaBonus
  }
  return { attackBonus: atk, defenseBonus: def, speedBonus: spd, frostPowerBonus: fp, hpBonus: hp, manaBonus: mp }
}

export function ffGetFullStats(state: FrostFuryState): {
  attack: number; defense: number; speed: number; frostPower: number; maxHp: number; maxMana: number
} {
  return ffGetEffectiveStats(state)
}

// ─── Achievement Functions (6) ─────────────────────────────────

export function ffGetAchievementDef(achievementId: string): FfAchievementDef | undefined {
  return FF_ACHIEVEMENTS.find(a => a.id === achievementId)
}

export function ffGetAchievementList(): readonly FfAchievementDef[] {
  return FF_ACHIEVEMENTS
}

export function ffGetUnlockedAchievements(state: FrostFuryState): FfAchievementDef[] {
  return FF_ACHIEVEMENTS.filter(a => state.achievements.includes(a.id))
}

export function ffIsAchievementUnlocked(state: FrostFuryState, achievementId: string): boolean {
  return state.achievements.includes(achievementId)
}

export function ffUnlockAchievement(state: FrostFuryState, achievementId: string): FrostFuryState {
  if (state.achievements.includes(achievementId)) return state
  const def = ffGetAchievementDef(achievementId)
  if (!def) return state
  return ffAddXp(
    { ...state, achievements: [...state.achievements, achievementId] },
    def.rewardXp,
  )
}

export function ffCheckAchievements(state: FrostFuryState): FrostFuryState {
  let s = state
  const conditions: Record<string, boolean> = {
    'totalKills >= 1': s.stats.totalKills >= 1,
    'totalKills >= 10': s.stats.totalKills >= 10,
    'totalKills >= 50': s.stats.totalKills >= 50,
    'totalKills >= 100': s.stats.totalKills >= 100,
    'longestCombo >= 3': s.stats.longestCombo >= 3,
    'longestCombo >= 5': s.stats.longestCombo >= 5,
    'longestCombo >= 10': s.stats.longestCombo >= 10,
    'ultimateAbilitiesCast >= 1': s.stats.ultimateAbilitiesCast >= 1,
    'frostMeterFull': ffIsFrostMeterFull(s),
    'arenasCompleted >= 5': s.stats.arenasCompleted >= 5,
    'eternalFrostLordSlain': s.stats.totalKills >= 1,
    'streak >= 3': s.streak >= 3,
    'streak >= 7': s.streak >= 7,
    'level >= 20': s.player.level >= 20,
    'level >= 40': s.player.level >= 40,
  }
  for (const ach of FF_ACHIEVEMENTS) {
    if (!s.achievements.includes(ach.id) && conditions[ach.condition]) {
      s = ffUnlockAchievement(s, ach.id)
    }
  }
  return s
}

// ─── Streak Functions (6) ───────────────────────────────────────

export function ffGetStreak(state: FrostFuryState): number {
  return state.streak
}

export function ffGetBestStreak(state: FrostFuryState): number {
  return state.bestStreak
}

export function ffGetStreakBonus(state: FrostFuryState): number {
  const s = state.streak
  if (s <= 0) return 0
  if (s <= 2) return 0.05
  if (s <= 6) return 0.15
  return 0.3
}

export function ffIncrementStreak(state: FrostFuryState): FrostFuryState {
  const newStreak = state.streak + 1
  return {
    ...state,
    streak: newStreak,
    bestStreak: Math.max(state.bestStreak, newStreak),
  }
}

export function ffResetStreak(state: FrostFuryState): FrostFuryState {
  return { ...state, streak: 0 }
}

export function ffUpdateStreakForDate(state: FrostFuryState, dateStr: string): FrostFuryState {
  if (state.lastPlayDate === dateStr) return state
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]
  if (state.lastPlayDate === yesterdayStr) {
    return ffIncrementStreak({ ...state, lastPlayDate: dateStr })
  }
  return { ...ffResetStreak(state), lastPlayDate: dateStr, streak: 1 }
}

// ─── Daily Challenge Functions (5) ─────────────────────────────

export function ffGenerateDailyChallenge(dateStr: string, seed: number): FfDailyChallenge {
  const dayHash = dateStr.split('-').map(Number).reduce((a, b) => a * 31 + b, 0)
  const rng = ffSeedRandom(dayHash + seed)
  const arenaIdx = Math.floor(rng() * FF_ARENAS.length)
  const arena = FF_ARENAS[arenaIdx]
  const monsterIdx = Math.floor(rng() * arena.monsterPool.length)
  const monsterId = arena.monsterPool[monsterIdx]
  const objectives = [
    { obj: 'Defeat monsters', target: 3 },
    { obj: 'Deal total damage', target: 200 },
    { obj: 'Reach a 3-hit combo', target: 3 },
    { obj: 'Freeze a monster', target: 1 },
    { obj: 'Cast abilities', target: 10 },
  ]
  const objIdx = Math.floor(rng() * objectives.length)
  return {
    challengeId: `daily_${dateStr}`,
    date: dateStr,
    arenaId: arena.id,
    monsterId,
    objective: objectives[objIdx].obj,
    objectiveTarget: objectives[objIdx].target,
    objectiveProgress: 0,
    completed: false,
    rewardXp: Math.floor(50 + arena.difficultyMultiplier * 40),
    rewardFrostBonus: Math.floor(15 + arena.difficultyMultiplier * 10),
  }
}

export function ffGetDailyChallenge(state: FrostFuryState): FfDailyChallenge | null {
  return state.dailyChallenge
}

export function ffSetDailyChallenge(state: FrostFuryState, challenge: FfDailyChallenge): FrostFuryState {
  return { ...state, dailyChallenge: challenge }
}

export function ffUpdateDailyProgress(state: FrostFuryState, amount: number): FrostFuryState {
  if (!state.dailyChallenge || state.dailyChallenge.completed) return state
  const newProgress = Math.min(
    state.dailyChallenge.objectiveProgress + amount,
    state.dailyChallenge.objectiveTarget,
  )
  const completed = newProgress >= state.dailyChallenge.objectiveTarget
  let s: FrostFuryState = {
    ...state,
    dailyChallenge: { ...state.dailyChallenge, objectiveProgress: newProgress, completed },
  }
  if (completed) {
    s = ffAddXp(s, state.dailyChallenge.rewardXp)
    s = ffAddFrostMeter(s, state.dailyChallenge.rewardFrostBonus)
  }
  return s
}

export function ffIsDailyChallengeComplete(state: FrostFuryState): boolean {
  return state.dailyChallenge?.completed ?? false
}

export function ffGetTodayDateString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ─── Stats & Utility Functions (8) ─────────────────────────────

export function ffGetTotalKills(state: FrostFuryState): number {
  return state.stats.totalKills
}

export function ffGetTotalDamageDealt(state: FrostFuryState): number {
  return state.stats.totalDamageDealt
}

export function ffGetTotalGold(state: FrostFuryState): number {
  return state.stats.gold
}

export function ffSpendGold(state: FrostFuryState, amount: number): FrostFuryState {
  if (state.stats.gold < amount) return state
  return { ...state, stats: { ...state.stats, gold: state.stats.gold - amount } }
}

export function ffAddGold(state: FrostFuryState, amount: number): FrostFuryState {
  return {
    ...state,
    stats: { ...state.stats, gold: state.stats.gold + amount, totalGoldEarned: state.stats.totalGoldEarned + amount },
  }
}

export function ffGetWinRate(state: FrostFuryState): number {
  const total = state.stats.arenasCompleted + 1
  return state.stats.arenasCompleted / total
}

export function ffGetMaxLevel(): number {
  return FF_MAX_LEVEL
}

export function ffGetStreakColor(streak: number): string {
  if (streak >= 7) return '#FFD740'
  if (streak >= 3) return '#00BCD4'
  if (streak >= 1) return '#4FC3F7'
  return '#B0BEC5'
}

// ─── Status Effect Functions (4) ────────────────────────────────

export function ffGetPlayerStatusEffect(state: FrostFuryState): FfStatusEffect {
  return state.combat.playerStatusEffect
}

export function ffGetMonsterStatusEffect(state: FrostFuryState): FfStatusEffect {
  return state.combat.monster?.statusEffect ?? 'none'
}

export function ffIsPlayerFrozen(state: FrostFuryState): boolean {
  return state.combat.playerStatusEffect === 'frozen'
}

export function ffIsMonsterFrozen(state: FrostFuryState): boolean {
  return state.combat.monster?.statusEffect === 'frozen'
}

// ─── Wave Functions (3) ─────────────────────────────────────────

export function ffGetCurrentWave(state: FrostFuryState): number {
  return state.combat.waveNumber
}

export function ffGetTotalWaves(state: FrostFuryState): number {
  const arena = state.combat.arenaId ? FF_ARENAS.find(a => a.id === state.combat.arenaId) : null
  return arena ? arena.wavesPerRun : 1
}

export function ffGetWaveProgress(state: FrostFuryState): number {
  const total = ffGetTotalWaves(state)
  if (total <= 0) return 0
  return (state.combat.waveNumber - 1) / total
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT EXPORT — React Hook (useFrostFury)
// Only this function may use React hooks
// ═══════════════════════════════════════════════════════════════════

export default function useFrostFury(initialState?: FrostFuryState) {
  const [state, setState] = useState<FrostFuryState>(initialState ?? ffInitialState())

  const handleCastAbility = useCallback((abilityId: string) => {
    setState(prev => {
      if (!prev.combat.active) return prev
      return ffProcessTurn(prev, abilityId)
    })
  }, [])

  const handleStartCombat = useCallback((arenaId: FfArenaId) => {
    setState(prev => ffEnterArena(prev, arenaId))
  }, [])

  const handleEndCombat = useCallback(() => {
    setState(prev => ffEndCombat(prev, prev.combat.combatWon))
  }, [])

  const handleEquipItem = useCallback((slot: FfEquipSlot, itemId: string) => {
    setState(prev => ffEquipItem(prev, slot, itemId))
  }, [])

  const handleUnequipItem = useCallback((slot: FfEquipSlot) => {
    setState(prev => ffUnequipItem(prev, slot))
  }, [])

  const handleResetState = useCallback(() => {
    setState(ffInitialState())
  }, [])

  const handleHealPlayer = useCallback((amount: number) => {
    setState(prev => ffHealPlayer(prev, amount))
  }, [])

  const handleSetDailyChallenge = useCallback((dateStr: string) => {
    setState(prev => {
      if (prev.dailyChallenge?.date === dateStr) return prev
      return ffSetDailyChallenge(prev, ffGenerateDailyChallenge(dateStr, prev.seed))
    })
  }, [])

  return {
    ...state,
    ffCastAbility: handleCastAbility,
    ffStartCombat: handleStartCombat,
    ffEndCombat: handleEndCombat,
    ffEquipItem: handleEquipItem,
    ffUnequipItem: handleUnequipItem,
    ffResetState: handleResetState,
    ffHealPlayer: handleHealPlayer,
    ffSetDailyChallenge: handleSetDailyChallenge,
  }
}
