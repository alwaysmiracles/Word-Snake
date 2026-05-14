'use client'

import { useState, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════════
// Sky Valkyrie Wire (天空女武神) — Norse Aerial Combat Game System
// Theme: Valkyries choosing fallen warriors, aerial combat across realms
// Color palette: Dawn gold #FFD54F, Storm violet #7C4DFF, Sky azure #42A5F5,
//                Frost silver #B0BEC5, Blood crimson #EF5350, Midnight indigo #1A237E
// ═══════════════════════════════════════════════════════════════════

// ─── TYPE DEFINITIONS ────────────────────────────────────────────

export type SkRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type SkElement = 'thunder' | 'frost' | 'fire' | 'shadow' | 'holy' | 'wind' | 'earth' | 'void'
export type SkValkyrieClassId =
  | 'shieldmaiden'
  | 'stormrider'
  | 'lightbringer'
  | 'frostweaver'
  | 'deathwhisper'
  | 'skycaller'
  | 'wardancer'
  | 'runeforged'
  | 'starhunter'
  | 'ragnarok_herald'
export type SkWingTypeId =
  | 'feathered_swallow'
  | 'storm_eagle'
  | 'frost_moth'
  | 'shadow_bat'
  | 'golden_phoenix'
  | 'crystal_dragonfly'
  | 'void_raven'
  | 'aurora_swan'
export type SkRealmId =
  | 'asgard'
  | 'midgard'
  | 'vanaheim'
  | 'alfheim'
  | 'svartalfheim'
  | 'niflheim'
  | 'muspelheim'
  | 'jotunheim'
  | 'helheim'
  | 'folkvangr'
  | 'valhalla'
  | 'bifrost'
export type SkAttackType = 'swoop' | 'dive' | 'shield_bash' | 'wing_slash' | 'spear_throw' | 'holy_beam' | 'thunder_strike' | 'frost_breath'
export type SkEquipSlot = 'armor' | 'spear' | 'shield' | 'cloak'
export type SkHeroId =
  | 'berserker'
  | 'shield_wall'
  | 'archer'
  | 'runemaster'
  | 'horseman'
  | 'jarl'
  | 'seeress'
  | 'ship_captain'
  | 'axewielder'
  | 'spear_maiden'
  | 'storm_caller'
  | 'frost_giant_born'
  | 'dragon_slayer'
  | 'troll_hunter'
  | 'rune_singer'
  | 'war_shaman'
  | 'blood_eagle'
  | 'shield_maiden_hero'
  | 'longship_raider'
  | 'wyrm_rider'

export type SkEnemyId =
  | 'fire_dragon'
  | 'frost_giant'
  | 'storm_titan'
  | 'shadow_wraith'
  | 'void_serpent'
  | 'earth_golem'
  | 'death_herald'
  | 'ragnarok_wolf'

// ─── COLOR THEME CONSTANTS ──────────────────────────────────────

export const SK_DAWN_GOLD = '#FFD54F'
export const SK_STORM_VIOLET = '#7C4DFF'
export const SK_SKY_AZURE = '#42A5F5'
export const SK_FROST_SILVER = '#B0BEC5'
export const SK_BLOOD_CRIMSON = '#EF5350'
export const SK_MIDNIGHT_INDIGO = '#1A237E'
export const SK_ASGARD_GLOW = '#FFF9C4'
export const SK_RUNE_BLUE = '#2979FF'
export const SK_HOLY_WHITE = '#FAFAFA'
export const SK_SHADOW_PURPLE = '#6A1B9A'
export const SK_BIFROST_PRISM = '#00E5FF'
export const SK_RAGNAROK_RED = '#B71C1C'

export const SK_RARITY_COLORS: Record<SkRarity, string> = {
  common: '#B0BEC5',
  uncommon: '#42A5F5',
  rare: '#7C4DFF',
  epic: '#FFD740',
  legendary: '#FF6D00',
}

export const SK_RARITY_ICONS: Record<SkRarity, string> = {
  common: '🪶',
  uncommon: '⚔️',
  rare: '🛡️',
  epic: '👑',
  legendary: '⚡',
}

export const SK_ELEMENT_COLORS: Record<SkElement, string> = {
  thunder: '#FFD740',
  frost: '#4FC3F7',
  fire: '#FF6E40',
  shadow: '#6A1B9A',
  holy: '#FFF9C4',
  wind: '#81D4FA',
  earth: '#8D6E63',
  void: '#1A237E',
}

export const SK_ELEMENT_ICONS: Record<SkElement, string> = {
  thunder: '⚡',
  frost: '❄️',
  fire: '🔥',
  shadow: '🌑',
  holy: '✨',
  wind: '🌀',
  earth: '🪨',
  void: '🕳️',
}

// ─── INTERFACES ─────────────────────────────────────────────────

export interface SkValkyrieClassDef {
  id: SkValkyrieClassId
  name: string
  description: string
  lore: string
  icon: string
  color: string
  primaryElement: SkElement
  baseHp: number
  baseAttack: number
  baseDefense: number
  baseSpeed: number
  baseDivinity: number
  hpPerLevel: number
  attackPerLevel: number
  defensePerLevel: number
  speedPerLevel: number
  divinityPerLevel: number
  unlockLevel: number
  passiveAbility: string
  passiveDescription: string
}

export interface SkWingTypeDef {
  id: SkWingTypeId
  name: string
  description: string
  lore: string
  icon: string
  color: string
  speedBonus: number
  evasionBonus: number
  attackBonus: number
  defenseBonus: number
  specialAbility: string
  specialDescription: string
  unlockLevel: number
}

export interface SkRealmDef {
  id: SkRealmId
  name: string
  description: string
  lore: string
  icon: string
  color: string
  background: string
  ambientColor: string
  unlockLevel: number
  enemyPool: SkEnemyId[]
  difficultyMultiplier: number
  xpBonus: number
  divinityBonus: number
  windSpeed: number
  visibilityRange: number
}

export interface SkHeroDef {
  id: SkHeroId
  name: string
  title: string
  description: string
  lore: string
  icon: string
  color: string
  element: SkElement
  rarity: SkRarity
  combatBonus: number
  defenseBonus: number
  specialAbility: string
  specialDescription: string
  requiredValkyrieLevel: number
  worthyScore: number
}

export interface SkEnemyDef {
  id: SkEnemyId
  name: string
  description: string
  lore: string
  icon: string
  color: string
  element: SkElement
  hp: number
  attack: number
  defense: number
  speed: number
  weakness: SkElement
  resistances: SkElement[]
  xpReward: number
  divinityReward: number
  specialAbility: string
  specialDescription: string
  isBoss: boolean
}

export interface SkEquipmentDef {
  id: string
  name: string
  slot: SkEquipSlot
  rarity: SkRarity
  description: string
  lore: string
  icon: string
  color: string
  requiredLevel: number
  attackBonus: number
  defenseBonus: number
  speedBonus: number
  divinityBonus: number
  hpBonus: number
  elementBonus: SkElement | null
}

export interface SkAchievementDef {
  id: string
  name: string
  description: string
  condition: string
  rewardXp: number
  rewardDivinity: number
  hidden: boolean
  icon: string
}

export interface SkDailyPatrol {
  patrolId: string
  date: string
  realmId: SkRealmId
  objective: string
  objectiveTarget: number
  objectiveProgress: number
  completed: boolean
  rewardXp: number
  rewardDivinity: number
}

export interface SkAerialCombatLog {
  turn: number
  actor: 'valkyrie' | 'enemy' | 'environment'
  action: SkAttackType | string
  damage: number
  divinityGained: number
  altitude: number
  detail: string
}

export interface SkWarriorSoul {
  heroId: SkHeroId
  selectedAt: string
  currentHp: number
  maxHp: number
  combatBonus: number
  defenseBonus: number
  isActive: boolean
}

export interface SkPlayerStats {
  level: number
  xp: number
  totalXp: number
  divinity: number
  maxDivinity: number
  hp: number
  maxHp: number
  mana: number
  maxMana: number
  baseAttack: number
  baseDefense: number
  baseSpeed: number
  baseDivinity: number
  altitude: number
  maxAltitude: number
  evasion: number
}

export interface SkCombatStats {
  totalKills: number
  totalDamageDealt: number
  totalDamageTaken: number
  totalSoulsCollected: number
  totalDivinityGained: number
  totalAerialDistance: number
  totalSwoopAttacks: number
  totalDiveAttacks: number
  totalShieldBashes: number
  totalWingSlashes: number
  longestAltitudeReached: number
  totalPatrolsCompleted: number
  realmsConquered: SkRealmId[]
  bossesDefeated: SkEnemyId[]
  totalStreak: number
  currentStreak: number
  bestStreak: number
  gold: number
  totalGoldEarned: number
}

export interface SkCombatState {
  active: boolean
  realmId: SkRealmId | null
  enemy: {
    enemyId: SkEnemyId
    currentHp: number
    maxHp: number
    statusEffect: string
    statusTurns: number
    altitude: number
    turnCount: number
  } | null
  turn: number
  altitude: number
  combatLog: SkAerialCombatLog[]
  cooldowns: Record<string, number>
  warriorSoul: SkWarriorSoul | null
  shieldActive: boolean
  shieldTurns: number
  shieldAmount: number
  diveCharging: boolean
  diveTurns: number
  swoopBonus: boolean
  swoopTurns: number
  playerStatusEffect: string
  playerStatusTurns: number
  waveNumber: number
  enemiesDefeatedInWave: number
  waveEnemyCount: number
  combatWon: boolean
  combatLost: boolean
}

export interface SkyValkyrieState {
  player: SkPlayerStats
  combat: SkCombatState
  achievements: string[]
  valkyrieClass: SkValkyrieClassId
  wingType: SkWingTypeId
  selectedWarriors: SkHeroId[]
  equipment: Record<SkEquipSlot, string | null>
  unlockedRealms: SkRealmId[]
  streak: number
  bestStreak: number
  lastPlayDate: string
  dailyPatrol: SkDailyPatrol | null
  stats: SkCombatStats
  seed: number
}

// ─── VALKYRIE CLASSES (10) ──────────────────────────────────────

export const SK_VALKYRIE_CLASSES: readonly SkValkyrieClassDef[] = [
  {
    id: 'shieldmaiden',
    name: 'Shieldmaiden',
    description: 'A steadfast guardian who soars into battle with an unbreakable shield wall. Excels at defense and protecting chosen warriors.',
    lore: 'The first Shieldmaidens were mortal women who died defending their villages. Odin was so impressed he elevated them to Valkyrie status.',
    icon: '🛡️',
    color: '#42A5F5',
    primaryElement: 'holy',
    baseHp: 120, baseAttack: 8, baseDefense: 14, baseSpeed: 8, baseDivinity: 10,
    hpPerLevel: 15, attackPerLevel: 2, defensePerLevel: 3, speedPerLevel: 1, divinityPerLevel: 2,
    unlockLevel: 1,
    passiveAbility: 'Valkyrie Bulwark',
    passiveDescription: 'Shieldmaiden takes 15% less damage at high altitudes and generates divinity when blocking attacks.',
  },
  {
    id: 'stormrider',
    name: 'Stormrider',
    description: 'Master of the tempest who channels lightning through her wings. Fast, devastating, and unpredictable in aerial combat.',
    lore: 'Stormriders are born during thunderstorms when lightning strikes the summit of a burial mound. The Thunder God Thor personally names each one.',
    icon: '⚡',
    color: '#FFD740',
    primaryElement: 'thunder',
    baseHp: 85, baseAttack: 16, baseDefense: 7, baseSpeed: 16, baseDivinity: 12,
    hpPerLevel: 10, attackPerLevel: 3, defensePerLevel: 1, speedPerLevel: 3, divinityPerLevel: 2,
    unlockLevel: 1,
    passiveAbility: 'Lightning Reflexes',
    passiveDescription: 'Stormrider has a 20% chance to dodge attacks and deals bonus damage with each consecutive strike in the air.',
  },
  {
    id: 'lightbringer',
    name: 'Lightbringer',
    description: 'Radiant warrior who illuminates the darkest realms with divine light. Her presence strengthens allies and weakens the wicked.',
    lore: 'Lightbringers carry a fragment of the sun itself, granted by Sol during the age of the gods. Their wings shimmer with perpetual daylight.',
    icon: '☀️',
    color: '#FFF9C4',
    primaryElement: 'holy',
    baseHp: 90, baseAttack: 14, baseDefense: 10, baseSpeed: 12, baseDivinity: 18,
    hpPerLevel: 11, attackPerLevel: 3, defensePerLevel: 2, speedPerLevel: 2, divinityPerLevel: 4,
    unlockLevel: 5,
    passiveAbility: 'Radiant Aura',
    passiveDescription: 'All attacks deal 10% bonus holy damage. Fallen warrior allies gain +3 defense per turn while Lightbringer is active.',
  },
  {
    id: 'frostweaver',
    name: 'Frostweaver',
    description: 'Weaver of ice and snow who transforms the sky into a frozen battlefield. Slows enemies and controls the pace of aerial combat.',
    lore: 'The Frostweavers learned their craft from the Niflheim frost giants in exchange for ferrying worthy giant souls to Valhalla.',
    icon: '❄️',
    color: '#4FC3F7',
    primaryElement: 'frost',
    baseHp: 95, baseAttack: 12, baseDefense: 11, baseSpeed: 10, baseDivinity: 14,
    hpPerLevel: 12, attackPerLevel: 2, defensePerLevel: 2, speedPerLevel: 2, divinityPerLevel: 3,
    unlockLevel: 8,
    passiveAbility: 'Permafrost Veil',
    passiveDescription: 'Enemies hit by Frostweaver lose 10% speed per turn (stacking). At max altitude, creates an ice storm around herself.',
  },
  {
    id: 'deathwhisper',
    name: 'Deathwhisper',
    description: 'Ethereal Valkyrie who walks between life and death. Can drain vitality from enemies and channel it into fallen warriors.',
    lore: 'Deathwhispers hear the final words of every dying warrior. They carry these whispers as power, using the voices of the fallen as weapons.',
    icon: '💀',
    color: '#6A1B9A',
    primaryElement: 'shadow',
    baseHp: 80, baseAttack: 18, baseDefense: 6, baseSpeed: 14, baseDivinity: 16,
    hpPerLevel: 9, attackPerLevel: 4, defensePerLevel: 1, speedPerLevel: 2, divinityPerLevel: 3,
    unlockLevel: 12,
    passiveAbility: 'Whisper of the Fallen',
    passiveDescription: 'Deals 15% of damage dealt as healing to chosen warriors. Killing enemies has a 30% chance to summon a ghostly echo.',
  },
  {
    id: 'skycaller',
    name: 'Skycaller',
    description: 'Commands the very winds and weather. Can manipulate atmospheric conditions to gain tactical advantages in aerial battles.',
    lore: 'The first Skycaller was once Freyja favorite handmaiden. When the goddess taught her the secret names of the winds, she became unstoppable.',
    icon: '🌪️',
    color: '#81D4FA',
    primaryElement: 'wind',
    baseHp: 88, baseAttack: 13, baseDefense: 9, baseSpeed: 18, baseDivinity: 13,
    hpPerLevel: 10, attackPerLevel: 3, defensePerLevel: 2, speedPerLevel: 4, divinityPerLevel: 3,
    unlockLevel: 16,
    passiveAbility: 'Wind Sovereignty',
    passiveDescription: 'Gains +5 speed for every 100 altitude. Can redirect enemy projectiles and change wind direction once per 3 turns.',
  },
  {
    id: 'wardancer',
    name: 'Wardancer',
    description: 'Agile aerial acrobat who weaves through combat with grace and lethal precision. Her unpredictable movements make her nearly impossible to hit.',
    lore: 'Wardancers trained with the elves of Alfheim for centuries, learning aerial combat forms that no mortal eye can follow.',
    icon: '💃',
    color: '#CE93D8',
    primaryElement: 'wind',
    baseHp: 75, baseAttack: 15, baseDefense: 5, baseSpeed: 20, baseDivinity: 12,
    hpPerLevel: 9, attackPerLevel: 3, defensePerLevel: 1, speedPerLevel: 4, divinityPerLevel: 2,
    unlockLevel: 20,
    passiveAbility: 'Aerial Ballet',
    passiveDescription: 'Each dodge increases attack power by 8% for the next strike. Chaining three dodges triggers a devastating counter-attack.',
  },
  {
    id: 'runeforged',
    name: 'Runeforged',
    description: 'A Valkyrie whose armor and weapons are inscribed with ancient runes of power. Each rune provides unique combat enhancements.',
    lore: 'The Runeforged was created when Odin carved the original runes into a shieldmaiden armor during the winter of the Great Famine.',
    icon: 'ᚱ',
    color: '#2979FF',
    primaryElement: 'thunder',
    baseHp: 100, baseAttack: 14, baseDefense: 13, baseSpeed: 10, baseDivinity: 15,
    hpPerLevel: 13, attackPerLevel: 3, defensePerLevel: 3, speedPerLevel: 1, divinityPerLevel: 3,
    unlockLevel: 25,
    passiveAbility: 'Runic Resonance',
    passiveDescription: 'Every 3 attacks, a random rune activates granting bonus damage, defense, or divinity. Multiple runes can stack.',
  },
  {
    id: 'starhunter',
    name: 'Starhunter',
    description: 'Hunts across the cosmos following the paths of fallen stars. Her power grows under the night sky and during cosmic events.',
    lore: 'Starhunters were created from the fragments of the first aurora borealis. They can sense when a great soul is about to fall by watching the stars.',
    icon: '🌟',
    color: '#00E5FF',
    primaryElement: 'holy',
    baseHp: 82, baseAttack: 17, baseDefense: 8, baseSpeed: 15, baseDivinity: 17,
    hpPerLevel: 10, attackPerLevel: 4, defensePerLevel: 2, speedPerLevel: 3, divinityPerLevel: 4,
    unlockLevel: 32,
    passiveAbility: 'Celestial Alignment',
    passiveDescription: 'Attack power scales with altitude (up to +50% at max height). Landing a killing blow restores some mana and divinity.',
  },
  {
    id: 'ragnarok_herald',
    name: 'Ragnarok Herald',
    description: 'The ultimate Valkyrie class, harbinger of the end times. Channels apocalyptic power that grows stronger as the battle rages on.',
    lore: 'Only one Ragnarok Herald exists at any time. She is the last Valkyrie who will fly when the world tree Yggdrasil finally falls.',
    icon: '🔥',
    color: '#FF6D00',
    primaryElement: 'fire',
    baseHp: 110, baseAttack: 20, baseDefense: 12, baseSpeed: 14, baseDivinity: 20,
    hpPerLevel: 14, attackPerLevel: 5, defensePerLevel: 3, speedPerLevel: 2, divinityPerLevel: 4,
    unlockLevel: 40,
    passiveAbility: 'Twilight of the Gods',
    passiveDescription: 'Every 5 turns, power increases by 15%. When HP drops below 25%, enters Ragnarok Mode with doubled attack for 3 turns.',
  },
]

// ─── WING TYPES (8) ────────────────────────────────────────────

export const SK_WING_TYPES: readonly SkWingTypeDef[] = [
  {
    id: 'feathered_swallow',
    name: 'Feathered Swallow',
    description: 'Lightweight and maneuverable wings favored by young Valkyries. Reliable in all weather conditions.',
    lore: 'Swallow wings are the first set granted to new Valkyries. Though humble, they never fail their bearer.',
    icon: '🕊️',
    color: '#B0BEC5',
    speedBonus: 5, evasionBonus: 10, attackBonus: 0, defenseBonus: 2,
    specialAbility: 'Swift Return',
    specialDescription: 'Can immediately return to a previous altitude once per combat encounter.',
    unlockLevel: 1,
  },
  {
    id: 'storm_eagle',
    name: 'Storm Eagle',
    description: 'Broad powerful wings that channel electrical energy. Crackles with lightning during dives.',
    lore: 'Plucked from the great eagle Hresvelgr who sits at the edge of the world, these wings carry the weight of storms.',
    icon: '🦅',
    color: '#FFD740',
    speedBonus: 10, evasionBonus: 5, attackBonus: 8, defenseBonus: 3,
    specialAbility: 'Thunder Dive',
    specialDescription: 'Dive attacks deal bonus thunder damage and stun enemies for one turn.',
    unlockLevel: 3,
  },
  {
    id: 'frost_moth',
    name: 'Frost Moth',
    description: 'Ethereal crystalline wings that shimmer with frost. Leave trails of ice crystals in flight.',
    lore: 'Frost Moth wings are spun from Niflheim silk by the ice giantess Skadi. They glow with an otherworldly blue light.',
    icon: '🦋',
    color: '#4FC3F7',
    speedBonus: 3, evasionBonus: 15, attackBonus: 3, defenseBonus: 8,
    specialAbility: 'Ice Shroud',
    specialDescription: 'Creates a protective ice barrier that absorbs the next attack and freezes the attacker.',
    unlockLevel: 7,
  },
  {
    id: 'shadow_bat',
    name: 'Shadow Bat',
    description: 'Dark leathery wings that can fold into the shadows. Ideal for stealth approaches and ambush attacks.',
    lore: 'Shadow Bat wings were a gift from Hel herself. Their wielders can become invisible in darkness for short periods.',
    icon: '🦇',
    color: '#6A1B9A',
    speedBonus: 12, evasionBonus: 20, attackBonus: 5, defenseBonus: 0,
    specialAbility: 'Night Veil',
    specialDescription: 'Becomes invisible for one turn, guaranteeing a critical hit on the next attack.',
    unlockLevel: 11,
  },
  {
    id: 'golden_phoenix',
    name: 'Golden Phoenix',
    description: 'Magnificent blazing wings of divine fire. Can be reborn from defeat with renewed fury.',
    lore: 'Only three Golden Phoenix wing sets exist, each containing a spark from Muspelheim primordial flame.',
    icon: '🦚',
    color: '#FF6D00',
    speedBonus: 8, evasionBonus: 8, attackBonus: 12, defenseBonus: 5,
    specialAbility: 'Phoenix Rebirth',
    specialDescription: 'Once per combat, when defeated, revives with 50% HP and doubled attack for 2 turns.',
    unlockLevel: 18,
  },
  {
    id: 'crystal_dragonfly',
    name: 'Crystal Dragonfly',
    description: 'Translucent wings made from enchanted crystal that refract light into prismatic beams.',
    lore: 'Dwarven smiths crafted these wings from the same crystal that forms the walls of Asgard palace.',
    icon: '🪰',
    color: '#00E5FF',
    speedBonus: 15, evasionBonus: 12, attackBonus: 6, defenseBonus: 6,
    specialAbility: 'Prismatic Shift',
    specialDescription: 'Can change element affinity each turn, adapting to enemy weaknesses.',
    unlockLevel: 24,
  },
  {
    id: 'void_raven',
    name: 'Void Raven',
    description: 'Wings of absolute darkness that absorb all light and energy. Channel the power of the void between realms.',
    lore: 'Void Raven wings are formed from the spaces between worlds. Their feathers are heavier than lead but lighter than thought.',
    icon: '🐦‍⬛',
    color: '#1A237E',
    speedBonus: 6, evasionBonus: 18, attackBonus: 15, defenseBonus: 3,
    specialAbility: 'Void Rift',
    specialDescription: 'Opens a rift that banishes the enemy to the void for 1 turn, dealing heavy shadow damage.',
    unlockLevel: 33,
  },
  {
    id: 'aurora_swan',
    name: 'Aurora Swan',
    description: 'The most beautiful and powerful wings, shimmering with the colors of the northern lights. Ultimate aerial grace.',
    lore: 'Aurora Swan wings are the rarest of all, gifted only to the most legendary Valkyries. Each feather contains a miniature aurora.',
    icon: '🦢',
    color: '#E040FB',
    speedBonus: 18, evasionBonus: 25, attackBonus: 10, defenseBonus: 10,
    specialAbility: 'Borealis Grace',
    specialDescription: 'All abilities cooldowns reduced by 1. At max altitude, all stats increase by 20%.',
    unlockLevel: 40,
  },
]

// ─── REALMS (12) ────────────────────────────────────────────────

export const SK_REALMS: readonly SkRealmDef[] = [
  {
    id: 'asgard',
    name: 'Asgard',
    description: 'The golden realm of the Aesir gods, where Valhalla stands eternal. Crystal spires pierce cloudless skies of perfect azure.',
    lore: 'Asgard floats above Midgard, connected only by the shimmering Bifrost bridge. Its skies are always clear and its winds carry the songs of the gods.',
    icon: '🏛️',
    color: '#FFD54F',
    background: 'linear-gradient(180deg, #FFF9C4 0%, #FFD54F 30%, #42A5F5 70%, #1A237E 100%)',
    ambientColor: '#FFD54F',
    unlockLevel: 1,
    enemyPool: ['fire_dragon', 'fire_dragon', 'storm_titan', 'death_herald', 'ragnarok_wolf'],
    difficultyMultiplier: 1.0,
    xpBonus: 0,
    divinityBonus: 10,
    windSpeed: 5,
    visibilityRange: 1000,
  },
  {
    id: 'midgard',
    name: 'Midgard',
    description: 'The realm of mortals, where great warriors forge their legends. Vast skies stretch over fjords and frozen tundras.',
    lore: 'Midgard is the center of the Norse cosmos, surrounded by the world serpent Jormungandr. Its winds carry the prayers of mortals to the gods.',
    icon: '🌍',
    color: '#66BB6A',
    background: 'linear-gradient(180deg, #81D4FA 0%, #42A5F5 40%, #66BB6A 70%, #8D6E63 100%)',
    ambientColor: '#42A5F5',
    unlockLevel: 1,
    enemyPool: ['storm_titan', 'storm_titan', 'earth_golem', 'fire_dragon', 'shadow_wraith'],
    difficultyMultiplier: 1.1,
    xpBonus: 5,
    divinityBonus: 5,
    windSpeed: 10,
    visibilityRange: 800,
  },
  {
    id: 'vanaheim',
    name: 'Vanaheim',
    description: 'Lush realm of the Vanir gods, filled with enchanted forests and rivers that flow with magic. The air itself hums with ancient power.',
    lore: 'Vanaheim is home to Freyja, who taught the first Valkyries the art of choosing the worthy dead. Its forests whisper secrets of the cosmos.',
    icon: '🌿',
    color: '#26A69A',
    background: 'linear-gradient(180deg, #E8F5E9 0%, #26A69A 40%, #00695C 70%, #004D40 100%)',
    ambientColor: '#26A69A',
    unlockLevel: 4,
    enemyPool: ['earth_golem', 'earth_golem', 'storm_titan', 'frost_giant', 'shadow_wraith'],
    difficultyMultiplier: 1.2,
    xpBonus: 10,
    divinityBonus: 15,
    windSpeed: 7,
    visibilityRange: 600,
  },
  {
    id: 'alfheim',
    name: 'Alfheim',
    description: 'Realm of the light elves, a place of ethereal beauty where the sky shimmers with prismatic light and floating islands drift lazily.',
    lore: 'The light elves of Alfheim taught Valkyries the art of aerial combat. Their floating islands serve as training grounds for the greatest flyers.',
    icon: '🧝',
    color: '#CE93D8',
    background: 'linear-gradient(180deg, #F3E5F5 0%, #CE93D8 30%, #7C4DFF 60%, #4A148C 100%)',
    ambientColor: '#CE93D8',
    unlockLevel: 7,
    enemyPool: ['shadow_wraith', 'shadow_wraith', 'void_serpent', 'death_herald', 'storm_titan'],
    difficultyMultiplier: 1.4,
    xpBonus: 15,
    divinityBonus: 20,
    windSpeed: 3,
    visibilityRange: 500,
  },
  {
    id: 'svartalfheim',
    name: 'Svartalfheim',
    description: 'Dark underground realm of the dwarves, lit only by volcanic fires and enchanted crystals. Toxic clouds obscure the cavernous skies.',
    lore: 'The dwarves of Svartalfheim forge the greatest weapons and armor. Valkyries come here to acquire equipment and face the dark elf warriors.',
    icon: '⛏️',
    color: '#795548',
    background: 'linear-gradient(180deg, #3E2723 0%, #795548 30%, #FF6E40 60%, #BF360C 100%)',
    ambientColor: '#FF6E40',
    unlockLevel: 10,
    enemyPool: ['fire_dragon', 'earth_golem', 'fire_dragon', 'shadow_wraith', 'void_serpent'],
    difficultyMultiplier: 1.6,
    xpBonus: 20,
    divinityBonus: 10,
    windSpeed: 2,
    visibilityRange: 300,
  },
  {
    id: 'niflheim',
    name: 'Niflheim',
    description: 'Frozen realm of ice and mist, where cold so intense it freezes the very concept of warmth. Only the hardiest survive its skies.',
    lore: 'Niflheim existed before all other realms, born from the primordial void. Its ice never melts and its mists never lift. The dead who are not chosen rest here.',
    icon: '🧊',
    color: '#4FC3F7',
    background: 'linear-gradient(180deg, #E1F5FE 0%, #4FC3F7 30%, #0277BD 60%, #01579B 100%)',
    ambientColor: '#4FC3F7',
    unlockLevel: 14,
    enemyPool: ['frost_giant', 'frost_giant', 'frost_giant', 'void_serpent', 'death_herald'],
    difficultyMultiplier: 1.8,
    xpBonus: 25,
    divinityBonus: 15,
    windSpeed: 15,
    visibilityRange: 200,
  },
  {
    id: 'muspelheim',
    name: 'Muspelheim',
    description: 'Burning realm of fire giants and volcanic fury. The sky is filled with ash clouds and rivers of lava crisscross below.',
    lore: 'Muspelheim is the oldest of all realms, born of fire at the dawn of time. The fire giant Surtr guards its gates with a flaming sword brighter than the sun.',
    icon: '🌋',
    color: '#FF6E40',
    background: 'linear-gradient(180deg, #FF8A65 0%, #FF6E40 30%, #BF360C 60%, #3E2723 100%)',
    ambientColor: '#FF6E40',
    unlockLevel: 18,
    enemyPool: ['fire_dragon', 'fire_dragon', 'fire_dragon', 'earth_golem', 'ragnarok_wolf'],
    difficultyMultiplier: 2.1,
    xpBonus: 30,
    divinityBonus: 20,
    windSpeed: 20,
    visibilityRange: 250,
  },
  {
    id: 'jotunheim',
    name: 'Jotunheim',
    description: 'Realm of the giants, where mountains touch the sky and ice storms rage with devastating fury across impossible landscapes.',
    lore: 'Jotunheim is a land of extremes where everything is larger than life. The frost giants who dwell here remember when the gods were young.',
    icon: '🏔️',
    color: '#78909C',
    background: 'linear-gradient(180deg, #B0BEC5 0%, #78909C 30%, #455A64 60%, #263238 100%)',
    ambientColor: '#78909C',
    unlockLevel: 22,
    enemyPool: ['frost_giant', 'earth_golem', 'storm_titan', 'frost_giant', 'ragnarok_wolf'],
    difficultyMultiplier: 2.4,
    xpBonus: 35,
    divinityBonus: 25,
    windSpeed: 25,
    visibilityRange: 400,
  },
  {
    id: 'helheim',
    name: 'Helheim',
    description: 'Realm of the dishonorable dead, ruled by the goddess Hel. A place of eternal twilight where the sky is a sickly green-black.',
    lore: 'Those who die of sickness or old age come to Helheim. Its queen Hel grants passage to no one, but Valkyries may enter to retrieve wrongly judged souls.',
    icon: '💀',
    color: '#455A64',
    background: 'linear-gradient(180deg, #263238 0%, #37474F 30%, #004D40 60%, #1B5E20 100%)',
    ambientColor: '#00695C',
    unlockLevel: 27,
    enemyPool: ['shadow_wraith', 'death_herald', 'void_serpent', 'shadow_wraith', 'death_herald'],
    difficultyMultiplier: 2.8,
    xpBonus: 40,
    divinityBonus: 30,
    windSpeed: 5,
    visibilityRange: 150,
  },
  {
    id: 'folkvangr',
    name: 'Folkvangr',
    description: 'Freyja magnificent meadow in Asgard where half the chosen dead reside. Fields of golden grain stretch beneath perpetual sunset skies.',
    lore: 'Folkvangr is where Freyja receives her share of the fallen. It is said to be more beautiful than Valhalla, with flowers that bloom from fallen warriors blood.',
    icon: '🌸',
    color: '#F48FB1',
    background: 'linear-gradient(180deg, #FCE4EC 0%, #F48FB1 30%, #FFD54F 60%, #FF8A65 100%)',
    ambientColor: '#F48FB1',
    unlockLevel: 32,
    enemyPool: ['death_herald', 'ragnarok_wolf', 'void_serpent', 'frost_giant', 'storm_titan'],
    difficultyMultiplier: 3.2,
    xpBonus: 50,
    divinityBonus: 35,
    windSpeed: 8,
    visibilityRange: 900,
  },
  {
    id: 'valhalla',
    name: 'Valhalla',
    description: 'The great hall of Odin where the einherjar feast and fight eternally. A vast golden roof stretches across an endless sky of glory.',
    lore: 'Valhalla has 540 doors, each wide enough for 800 warriors to walk abreast. Its rafters are made of spears and its roof of shields.',
    icon: '🍺',
    color: '#FFD54F',
    background: 'linear-gradient(180deg, #FFF9C4 0%, #FFD54F 20%, #FF6D00 50%, #B71C1C 100%)',
    ambientColor: '#FFD54F',
    unlockLevel: 37,
    enemyPool: ['ragnarok_wolf', 'death_herald', 'fire_dragon', 'frost_giant', 'void_serpent'],
    difficultyMultiplier: 3.7,
    xpBonus: 60,
    divinityBonus: 40,
    windSpeed: 12,
    visibilityRange: 700,
  },
  {
    id: 'bifrost',
    name: 'Bifrost',
    description: 'The shimmering rainbow bridge connecting all realms. A cosmic highway of prismatic light where space and time twist together.',
    lore: 'The Bifrost is guarded by Heimdall, who can see a thousand miles by day or night. Walking its length takes a mortal a lifetime, but a Valkyrie merely a heartbeat.',
    icon: '🌈',
    color: '#00E5FF',
    background: 'linear-gradient(180deg, #E040FB 0%, #00E5FF 25%, #FFD54F 50%, #FF6E40 75%, #7C4DFF 100%)',
    ambientColor: '#00E5FF',
    unlockLevel: 42,
    enemyPool: ['void_serpent', 'ragnarok_wolf', 'death_herald', 'storm_titan', 'fire_dragon'],
    difficultyMultiplier: 4.5,
    xpBonus: 75,
    divinityBonus: 50,
    windSpeed: 30,
    visibilityRange: 2000,
  },
]

// ─── HEROES (20) ────────────────────────────────────────────────

export const SK_HEROES: readonly SkHeroDef[] = [
  {
    id: 'berserker', name: 'Berserker', title: 'The Unstoppable Fury',
    description: 'A warrior who fights in a trance of rage, immune to pain and fear. His blows shatter shields and his war cry terrifies enemies.',
    lore: 'Berserkers wore bear skins and fought in a fury that transcended madness. When they fell, Odin claimed them personally for Valhalla.',
    icon: '😡', color: '#EF5350', element: 'fire', rarity: 'common',
    combatBonus: 12, defenseBonus: 0, specialAbility: 'Frenzy',
    specialDescription: 'Berserker gains +5 attack per turn while below 50% HP, but loses 3 defense.',
    requiredValkyrieLevel: 1, worthyScore: 30,
  },
  {
    id: 'shield_wall', name: 'Shield Wall', title: 'The Immovable Bulwark',
    description: 'A master defender who creates an unbreakable formation with overlapping shields. His presence turns the tide of any aerial battle.',
    lore: 'The Shield Wall held the line at the Battle of Bravellir for three days without rest, allowing their allies to escape.',
    icon: '🛡️', color: '#42A5F5', element: 'holy', rarity: 'common',
    combatBonus: 2, defenseBonus: 15, specialAbility: 'Phalanx',
    specialDescription: 'Reduces all damage taken by 20% and reflects 10% back to attackers.',
    requiredValkyrieLevel: 1, worthyScore: 25,
  },
  {
    id: 'archer', name: 'Archer', title: 'The Sky Piercer',
    description: 'A master of the longbow whose arrows fly true across the greatest distances. His shots never miss their mark in aerial combat.',
    lore: 'The Archer could split a falling leaf with his arrows from a thousand paces. Even the gods feared his aim.',
    icon: '🏹', color: '#66BB6A', element: 'wind', rarity: 'common',
    combatBonus: 10, defenseBonus: 2, specialAbility: 'Rain of Arrows',
    specialDescription: 'Fires a volley that hits all enemies in range for 60% normal damage each.',
    requiredValkyrieLevel: 1, worthyScore: 28,
  },
  {
    id: 'runemaster', name: 'Runemaster', title: 'The Binder of Fate',
    description: 'A sage who inscribes ancient runes that alter the fabric of reality. His runes can weaken enemies and strengthen allies in flight.',
    lore: 'The greatest Runemasters could carve runes into the sky itself, creating floating sigils that persisted for centuries.',
    icon: 'ᚱ', color: '#2979FF', element: 'thunder', rarity: 'uncommon',
    combatBonus: 6, defenseBonus: 6, specialAbility: 'Runic Empowerment',
    specialDescription: 'Boosts Valkyrie divinity by +5 and grants a random elemental resistance each turn.',
    requiredValkyrieLevel: 5, worthyScore: 40,
  },
  {
    id: 'horseman', name: 'Horseman', title: 'The Wild Rider',
    description: 'A cavalry warrior who rides a spectral horse through the skies. His mounted charges devastate aerial formations.',
    lore: 'The Horseman rode Sleipnir shadow, an eight-legged ghost horse that could gallop on clouds and leap between realms.',
    icon: '🐴', color: '#8D6E63', element: 'earth', rarity: 'common',
    combatBonus: 8, defenseBonus: 4, specialAbility: 'Thundering Charge',
    specialDescription: 'Charges at the enemy dealing damage based on current speed stat and stuns for 1 turn.',
    requiredValkyrieLevel: 3, worthyScore: 32,
  },
  {
    id: 'jarl', name: 'Jarl', title: 'The Battle Commander',
    description: 'A noble warlord whose tactical genius turns chaotic aerial battles into orchestrated victories. Inspires all allies to fight harder.',
    lore: 'The Jarl who became Jarl of the Sky commanded a fleet of a hundred longships and never lost a battle.',
    icon: '👑', color: '#FFD54F', element: 'holy', rarity: 'rare',
    combatBonus: 5, defenseBonus: 8, specialAbility: 'War Council',
    specialDescription: 'All allied warriors gain +3 combat bonus and +2 defense per turn while Jarl is active.',
    requiredValkyrieLevel: 8, worthyScore: 55,
  },
  {
    id: 'seeress', name: 'Seeress', title: 'The All-Seeing Eye',
    description: 'A prophetic woman who can glimpse the threads of fate. Her foresight reveals enemy weaknesses before they strike.',
    lore: 'The Seeress could see all possible futures simultaneously. She chose to die in battle so Odin could not steal her knowledge of Ragnarok.',
    icon: '🔮', color: '#CE93D8', element: 'shadow', rarity: 'uncommon',
    combatBonus: 4, defenseBonus: 4, specialAbility: 'Foresight',
    specialDescription: 'Reveals enemy weakness for +25% damage and predicts the next attack for guaranteed dodge once per combat.',
    requiredValkyrieLevel: 10, worthyScore: 50,
  },
  {
    id: 'ship_captain', name: 'Ship Captain', title: 'The Wave Rider',
    description: 'A fearless navigator who steered longships through the most treacherous storms. His knowledge of winds translates to aerial mastery.',
    lore: 'The Ship Captain sailed his vessel up a waterfall and into the sky itself, where it became the constellation we call the Longship.',
    icon: '⛵', color: '#4FC3F7', element: 'wind', rarity: 'common',
    combatBonus: 7, defenseBonus: 5, specialAbility: 'Favorable Winds',
    specialDescription: 'Increases Valkyrie speed by +8 and grants immunity to wind-based enemy attacks.',
    requiredValkyrieLevel: 3, worthyScore: 35,
  },
  {
    id: 'axewielder', name: 'Axewielder', title: 'The Storm Cleaver',
    description: 'A devastating warrior whose twin axes cleave through armor, flesh, and the very air. Each swing creates a shockwave.',
    lore: 'The Axewielder was so strong he accidentally split a mountain in two while practicing. The gap is still visible today.',
    icon: '🪓', color: '#FF6E40', element: 'fire', rarity: 'uncommon',
    combatBonus: 14, defenseBonus: 1, specialAbility: 'Cleaving Strike',
    specialDescription: 'Attacks deal splash damage to nearby enemies and have a 20% chance to break enemy shields.',
    requiredValkyrieLevel: 6, worthyScore: 42,
  },
  {
    id: 'spear_maiden', name: 'Spear Maiden', title: 'The Piercing Light',
    description: 'A spear-fighter of unparalleled precision whose thrown spears fly straight as light. Her reach in aerial combat is unmatched.',
    lore: 'The original Spear Maiden was Odin daughter, taught by the Allfather himself. Her spears never missed and never failed to return.',
    icon: '🔱', color: '#FFF9C4', element: 'holy', rarity: 'uncommon',
    combatBonus: 11, defenseBonus: 3, specialAbility: 'Javelin Storm',
    specialDescription: 'Throws three spears in rapid succession, each with increasing damage (100%, 130%, 160%).',
    requiredValkyrieLevel: 5, worthyScore: 38,
  },
  {
    id: 'storm_caller', name: 'Storm Caller', title: 'The Tempest Voice',
    description: 'A shaman who summons thunderstorms with his drums. Lightning answers his call and strikes his enemies from above.',
    lore: 'The Storm Caller could bring a clear sky to a raging hurricane with a single drumbeat. The Thunder God Thor was his patron.',
    icon: '⚡', color: '#FFD740', element: 'thunder', rarity: 'rare',
    combatBonus: 10, defenseBonus: 5, specialAbility: 'Thunder Summon',
    specialDescription: 'Calls a lightning strike that deals heavy thunder damage and chains to all nearby enemies.',
    requiredValkyrieLevel: 12, worthyScore: 58,
  },
  {
    id: 'frost_giant_born', name: 'Frost Giant Born', title: 'The Ice Blood',
    description: 'A half-human warrior with frost giant heritage. His blood runs cold and his touch freezes everything he strikes.',
    lore: 'Born of a forbidden union between a human shieldmaiden and a frost giant jarl, he fought for both peoples and was rejected by neither.',
    icon: '🥶', color: '#81D4FA', element: 'frost', rarity: 'rare',
    combatBonus: 8, defenseBonus: 10, specialAbility: 'Giant Blood',
    specialDescription: 'Passively slows enemies who attack him and gains +5 defense in cold realms.',
    requiredValkyrieLevel: 15, worthyScore: 62,
  },
  {
    id: 'dragon_slayer', name: 'Dragon Slayer', title: 'The Wyrm Bane',
    description: 'A legendary warrior who has slain three dragons. His weapons are enchanted specifically to pierce draconic scales.',
    lore: 'The Dragon Slayer forged his sword from the heart of the first dragon he killed. Each subsequent kill made it stronger.',
    icon: '🐉', color: '#EF5350', element: 'fire', rarity: 'epic',
    combatBonus: 16, defenseBonus: 6, specialAbility: 'Dragon Bane',
    specialDescription: 'Deals triple damage to dragon-type enemies and reduces their attack by 20%.',
    requiredValkyrieLevel: 18, worthyScore: 72,
  },
  {
    id: 'troll_hunter', name: 'Troll Hunter', title: 'The Twilight Stalker',
    description: 'A stealthy warrior who specializes in hunting trolls and giants in the twilight hours between day and night.',
    lore: 'The Troll Hunter learned to turn invisible by wearing the skin of a troll he outsmarted. He never spoke of how he acquired it.',
    icon: '🧌', color: '#6D4C41', element: 'shadow', rarity: 'uncommon',
    combatBonus: 9, defenseBonus: 7, specialAbility: 'Twilight Ambush',
    specialDescription: 'Gains critical hit chance when attacking from shadows and deals bonus damage to large enemies.',
    requiredValkyrieLevel: 8, worthyScore: 45,
  },
  {
    id: 'rune_singer', name: 'Rune Singer', title: 'The Song of Power',
    description: 'A warrior who channels magic through song. Her haunting melodies strengthen allies and weaken enemies with ancient power.',
    lore: 'The Rune Singer could make weapons sharper, shields harder, and wounds close with her voice alone. Her songs echo across the nine realms.',
    icon: '🎤', color: '#E040FB', element: 'thunder', rarity: 'rare',
    combatBonus: 6, defenseBonus: 8, specialAbility: 'Battle Song',
    specialDescription: 'Each turn sings a verse that buffs one stat of all allies by +4 (cycling through attack, defense, speed, divinity).',
    requiredValkyrieLevel: 12, worthyScore: 55,
  },
  {
    id: 'war_shaman', name: 'War Shaman', title: 'The Spirit Channeler',
    description: 'A powerful shaman who channels the spirits of ancient warriors into combat. Each spirit grants different combat bonuses.',
    lore: 'The War Shaman can see and speak with the dead. In battle, she summons ancestor spirits to fight alongside the Valkyrie.',
    icon: '🎭', color: '#009688', element: 'shadow', rarity: 'rare',
    combatBonus: 8, defenseBonus: 6, specialAbility: 'Spirit Channel',
    specialDescription: 'Channels a random ancestor spirit each turn, providing a unique bonus (damage, healing, shield, or speed).',
    requiredValkyrieLevel: 15, worthyScore: 60,
  },
  {
    id: 'blood_eagle', name: 'Blood Eagle', title: 'The Sacred Rite',
    description: 'An elite warrior who performed the Blood Eagle rite. His attacks are savage and unforgettable, leaving permanent marks.',
    lore: 'The Blood Eagle was both an execution and an offering to Odin. This warrior mastered it as a combat technique that terrifies even the gods.',
    icon: '🦅', color: '#B71C1C', element: 'fire', rarity: 'epic',
    combatBonus: 18, defenseBonus: 2, specialAbility: 'Eagle Strike',
    specialDescription: 'A devastating attack that deals massive damage and causes the enemy to bleed for 3 turns.',
    requiredValkyrieLevel: 22, worthyScore: 78,
  },
  {
    id: 'shield_maiden_hero', name: 'Shield Maiden Hero', title: 'The Unyielding Rose',
    description: 'The greatest shield maiden who ever lived. She held the bridge at Volund alone against a hundred foes.',
    lore: 'The Shield Maiden Hero was offered a place among the gods but refused, choosing instead to keep fighting until Ragnarok.',
    icon: '🌹', color: '#F48FB1', element: 'holy', rarity: 'epic',
    combatBonus: 10, defenseBonus: 14, specialAbility: 'Last Stand',
    specialDescription: 'When HP drops below 10%, gains invincibility for 1 turn and deals double damage on counterattack.',
    requiredValkyrieLevel: 25, worthyScore: 82,
  },
  {
    id: 'longship_raider', name: 'Longship Raider', title: 'The Sea Wolf',
    description: 'A veteran raider who crossed the sea a hundred times. His battle experience and tactical knowledge make him invaluable in any fight.',
    lore: 'The Longship Raider could smell a storm three days before it arrived and navigate by starlight through the thickest fog.',
    icon: '🏴‍☠️', color: '#546E7A', element: 'wind', rarity: 'uncommon',
    combatBonus: 8, defenseBonus: 6, specialAbility: 'Raiding Party',
    specialDescription: 'Summons a spectral longship that provides cover fire and boosts all allies speed by +5.',
    requiredValkyrieLevel: 8, worthyScore: 40,
  },
  {
    id: 'wyrm_rider', name: 'Wyrm Rider', title: 'The Sky Tamer',
    description: 'A warrior who tamed a lesser wyrm and rides it into battle. Together, they are a devastating aerial combat team.',
    lore: 'The Wyrm Rider was the only mortal to ever tame a living wyrm. The beast chose her, recognizing a kindred wild spirit.',
    icon: '🐲', color: '#FF6D00', element: 'fire', rarity: 'legendary',
    combatBonus: 20, defenseBonus: 10, specialAbility: 'Wyrm Breath',
    specialDescription: 'The wyrm breathes fire dealing massive area damage. Once per combat, the wyrm performs a devastating strafing run.',
    requiredValkyrieLevel: 30, worthyScore: 95,
  },
]

// ─── ENEMIES (8) ────────────────────────────────────────────────

export const SK_ENEMIES: readonly SkEnemyDef[] = [
  {
    id: 'fire_dragon',
    name: 'Fire Dragon',
    description: 'A massive winged beast of pure flame that haunts the volcanic skies of Muspelheim. Its breath can melt mountains.',
    lore: 'Fire Dragons are the oldest creatures in the Norse cosmos, born from the first sparks of creation. They predate even the gods.',
    icon: '🐉', color: '#FF6E40', element: 'fire',
    hp: 180, attack: 30, defense: 18, speed: 12,
    weakness: 'frost', resistances: ['fire'],
    xpReward: 55, divinityReward: 15,
    specialAbility: 'Inferno Breath',
    specialDescription: 'Unleashes a torrent of flame dealing heavy fire damage to all targets in a cone.',
    isBoss: false,
  },
  {
    id: 'frost_giant',
    name: 'Frost Giant',
    description: 'A colossal being of living ice that towers over the battlefield. Its frozen fists can shatter steel like glass.',
    lore: 'The Frost Giants of Jotunheim have warred with the Aesir since the dawn of time. Their king Ymir was the first being in existence.',
    icon: '🧊', color: '#4FC3F7', element: 'frost',
    hp: 250, attack: 22, defense: 30, speed: 4,
    weakness: 'fire', resistances: ['frost', 'earth'],
    xpReward: 65, divinityReward: 20,
    specialAbility: 'Glacial Slam',
    specialDescription: 'Slams the ground creating a shockwave of ice that damages and slows all enemies.',
    isBoss: false,
  },
  {
    id: 'storm_titan',
    name: 'Storm Titan',
    description: 'A being of pure electrical energy that rides the wind currents. Lightning arcs between its outstretched arms.',
    lore: 'Storm Titans are born when enough lightning strikes converge at a single point. They are mindless but incredibly powerful.',
    icon: '⚡', color: '#FFD740', element: 'thunder',
    hp: 120, attack: 35, defense: 10, speed: 22,
    weakness: 'earth', resistances: ['thunder', 'wind'],
    xpReward: 50, divinityReward: 18,
    specialAbility: 'Chain Lightning',
    specialDescription: 'Fires a bolt of lightning that chains between multiple targets, growing weaker with each bounce.',
    isBoss: false,
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    description: 'A spectral entity formed from the collective despair of the unworthy dead. Drains life force with every touch.',
    lore: 'Shadow Wraiths are the remnants of souls that were neither chosen for Valhalla nor claimed by Hel. They exist in perpetual agony.',
    icon: '👻', color: '#6A1B9A', element: 'shadow',
    hp: 90, attack: 28, defense: 5, speed: 20,
    weakness: 'holy', resistances: ['shadow', 'void'],
    xpReward: 45, divinityReward: 12,
    specialAbility: 'Life Drain',
    specialDescription: 'Drains HP from the target and heals itself. Stacks increase the drain amount.',
    isBoss: false,
  },
  {
    id: 'void_serpent',
    name: 'Void Serpent',
    description: 'A massive serpentine creature from the spaces between realms. Its body is made of anti-matter that disintegrates on contact.',
    lore: 'The Void Serpents are children of Nidhogg, the dragon that gnaws at the roots of Yggdrasil. They slither between dimensions.',
    icon: '🐍', color: '#1A237E', element: 'void',
    hp: 200, attack: 32, defense: 15, speed: 16,
    weakness: 'holy', resistances: ['void', 'shadow'],
    xpReward: 70, divinityReward: 22,
    specialAbility: 'Dimensional Rift',
    specialDescription: 'Opens a rift that pulls all enemies toward it and deals continuous void damage.',
    isBoss: false,
  },
  {
    id: 'earth_golem',
    name: 'Earth Golem',
    description: 'A massive construct of rock and metal animated by ancient magic. Nearly indestructible but slow-moving.',
    lore: 'Earth Golems were created by the dwarves as siege weapons during the Aesir-Vanir war. Some still wander the realms, mindless but loyal.',
    icon: '🗿', color: '#8D6E63', element: 'earth',
    hp: 300, attack: 18, defense: 40, speed: 2,
    weakness: 'wind', resistances: ['earth', 'fire'],
    xpReward: 60, divinityReward: 16,
    specialAbility: 'Earthen Fortress',
    specialDescription: 'Buries itself underground becoming immune to damage for 2 turns, then erupts dealing area damage.',
    isBoss: false,
  },
  {
    id: 'death_herald',
    name: 'Death Herald',
    description: 'A harbinger of doom sent by Hel to collect souls. Its mere presence weakens the will of all living beings.',
    lore: 'Death Heralds are the servants of Hel, goddess of the dead. They appear before great battles to mark those who will fall.',
    icon: '⚰️', color: '#455A64', element: 'shadow',
    hp: 150, attack: 25, defense: 12, speed: 18,
    weakness: 'holy', resistances: ['shadow', 'frost'],
    xpReward: 75, divinityReward: 25,
    specialAbility: 'Doom Mark',
    specialDescription: 'Marks a target who takes 30% increased damage for 3 turns. If the target dies, Death Herald gains 50% of their max HP.',
    isBoss: true,
  },
  {
    id: 'ragnarok_wolf',
    name: 'Ragnarok Wolf',
    description: 'One of the great wolves of Ragnarok, a beast of apocalyptic power that can swallow the sun and moon.',
    lore: 'The Ragnarok Wolves are the children of Fenrir, the great wolf destined to devour Odin during Ragnarok. Each one is a world-ending threat.',
    icon: '🐺', color: '#B71C1C', element: 'void',
    hp: 400, attack: 38, defense: 25, speed: 14,
    weakness: 'holy', resistances: ['void', 'shadow', 'fire'],
    xpReward: 150, divinityReward: 50,
    specialAbility: 'Devour',
    specialDescription: 'Swallows the target whole, trapping them for 1 turn and dealing massive damage. Cannot be used on bosses.',
    isBoss: true,
  },
]

// ─── EQUIPMENT ──────────────────────────────────────────────────

export const SK_EQUIPMENT: readonly SkEquipmentDef[] = [
  // ── Armor (5) ──
  {
    id: 'linen_vest', name: 'Linen Vest', slot: 'armor', rarity: 'common',
    description: 'A simple reinforced vest woven from enchanted linen. Basic protection for new Valkyries.',
    lore: 'Every Valkyrie starts with a linen vest blessed by Freyja maidens.', icon: '👘', color: '#B0BEC5',
    requiredLevel: 1, attackBonus: 0, defenseBonus: 6, speedBonus: 0, divinityBonus: 1, hpBonus: 10, elementBonus: null,
  },
  {
    id: 'chainmail_dress', name: 'Chainmail Dress', slot: 'armor', rarity: 'uncommon',
    description: 'Elven-woven chainmail that gleams with protective runes. Light yet remarkably strong.',
    lore: 'The elves of Alfheim weave chainmail so fine it flows like silk but stops blades like stone.', icon: '🛡️', color: '#42A5F5',
    requiredLevel: 8, attackBonus: 2, defenseBonus: 14, speedBonus: 0, divinityBonus: 3, hpBonus: 25, elementBonus: null,
  },
  {
    id: 'valkyrie_plate', name: 'Valkyrie Plate', slot: 'armor', rarity: 'rare',
    description: 'Full plate armor forged from Asgardian steel, inscribed with protective wards of the Allfather.',
    lore: 'Valkyrie Plate is forged in the heart of a dying star. Only those chosen by Odin may wear it without being crushed.', icon: '⚔️', color: '#7C4DFF',
    requiredLevel: 18, attackBonus: 5, defenseBonus: 25, speedBonus: -2, divinityBonus: 5, hpBonus: 50, elementBonus: 'holy',
  },
  {
    id: 'ragnarok_aegis', name: 'Ragnarok Aegis', slot: 'armor', rarity: 'epic',
    description: 'Armor forged from fragments of the World Tree Yggdrasil itself. Contains the power of creation.',
    lore: 'When Ragnarok comes, this armor will be the last defense against the end of all things.', icon: '🔱', color: '#FFD740',
    requiredLevel: 30, attackBonus: 10, defenseBonus: 38, speedBonus: 0, divinityBonus: 10, hpBonus: 80, elementBonus: 'holy',
  },
  {
    id: 'divine_resplendence', name: 'Divine Resplendence', slot: 'armor', rarity: 'legendary',
    description: 'The ultimate armor made from solidified starlight and divine essence. Makes the wearer nearly invincible.',
    lore: 'Only one set of Divine Resplendence exists, worn by the original Valkyrie commander during the first choosing of the dead.',
    icon: '✨', color: '#FF6D00',
    requiredLevel: 40, attackBonus: 15, defenseBonus: 55, speedBonus: 5, divinityBonus: 20, hpBonus: 150, elementBonus: 'holy',
  },
  // ── Spears (5) ──
  {
    id: 'ash_wood_spear', name: 'Ash Wood Spear', slot: 'spear', rarity: 'common',
    description: 'A simple but sturdy spear carved from Yggdrasil ash wood. Reliable and well-balanced.',
    lore: 'Even a simple spear of ash wood can pierce dragon scale if wielded by a worthy Valkyrie.', icon: '🏹', color: '#8D6E63',
    requiredLevel: 1, attackBonus: 6, defenseBonus: 0, speedBonus: 2, divinityBonus: 1, hpBonus: 0, elementBonus: null,
  },
  {
    id: 'gungnir_replica', name: 'Gungnir Replica', slot: 'spear', rarity: 'uncommon',
    description: 'A masterwork replica of Odin legendary spear. Never misses its target when thrown.',
    lore: 'The dwarven smiths who made the original Gungnir created only seven replicas before destroying the formula.', icon: '🔱', color: '#2979FF',
    requiredLevel: 8, attackBonus: 14, defenseBonus: 2, speedBonus: 3, divinityBonus: 4, hpBonus: 5, elementBonus: 'thunder',
  },
  {
    id: 'ice_shard_lance', name: 'Ice Shard Lance', slot: 'spear', rarity: 'rare',
    description: 'A lance forged from Niflheim eternal ice. Cuts through any defense with frozen precision.',
    lore: 'The Ice Shard Lance grows sharper the colder the environment. In Niflheim itself, it can cut concepts in half.', icon: '🧊', color: '#4FC3F7',
    requiredLevel: 18, attackBonus: 22, defenseBonus: 3, speedBonus: 2, divinityBonus: 6, hpBonus: 10, elementBonus: 'frost',
  },
  {
    id: 'hel_bane', name: 'Hel Bane', slot: 'spear', rarity: 'epic',
    description: 'A spear forged specifically to slay creatures of the underworld. Glows with holy fire.',
    lore: 'Hel Bane was created by Odin from a shard of the sun, tempered in the tears of the dead.', icon: '🔥', color: '#FFD740',
    requiredLevel: 30, attackBonus: 32, defenseBonus: 5, speedBonus: 4, divinityBonus: 12, hpBonus: 20, elementBonus: 'holy',
  },
  {
    id: 'twilight_sovereign', name: 'Twilight Sovereign', slot: 'spear', rarity: 'legendary',
    description: 'The supreme spear that contains the power of both creation and destruction. Shatters reality on impact.',
    lore: 'The Twilight Sovereign was wielded by the first being to ever exist. It contains the echo of the Big Bang.',
    icon: '⚡', color: '#FF6D00',
    requiredLevel: 40, attackBonus: 45, defenseBonus: 8, speedBonus: 6, divinityBonus: 25, hpBonus: 40, elementBonus: 'void',
  },
  // ── Shields (5) ──
  {
    id: 'round_shield', name: 'Round Shield', slot: 'shield', rarity: 'common',
    description: 'A traditional Viking round shield with an iron boss. Simple but effective for aerial blocking.',
    lore: 'The round shield design has not changed in a thousand years. If it works, do not fix it.', icon: '🛡️', color: '#795548',
    requiredLevel: 1, attackBonus: 1, defenseBonus: 8, speedBonus: -1, divinityBonus: 1, hpBonus: 15, elementBonus: null,
  },
  {
    id: 'aegis_of_freyr', name: 'Aegis of Freyr', slot: 'shield', rarity: 'uncommon',
    description: 'A magical shield blessed by Freyr that regenerates when not in combat. Self-repairing divine steel.',
    lore: 'Freyr gave this shield to his most devoted warrior. It repairs itself using the power of sunlight.', icon: '☀️', color: '#66BB6A',
    requiredLevel: 8, attackBonus: 3, defenseBonus: 16, speedBonus: 0, divinityBonus: 4, hpBonus: 25, elementBonus: null,
  },
  {
    id: 'storm_barrier', name: 'Storm Barrier', slot: 'shield', rarity: 'rare',
    description: 'A shield that generates a field of electrical energy, shocking anyone who strikes it.',
    lore: 'The Storm Barrier was forged in the heart of a perpetual thunderstorm by Thor himself during a drinking contest.', icon: '⚡', color: '#FFD740',
    requiredLevel: 18, attackBonus: 6, defenseBonus: 22, speedBonus: 0, divinityBonus: 6, hpBonus: 30, elementBonus: 'thunder',
  },
  {
    id: 'nidhogg_scale', name: 'Nidhogg Scale', slot: 'shield', rarity: 'epic',
    description: 'A shield made from a scale of Nidhogg, the dragon that gnaws the World Tree. Nearly indestructible.',
    lore: 'Nidhogg shed this scale when Thor once jabbed him with a stick. Even a fragment of Nidhogg contains primordial power.', icon: '🐲', color: '#FFD740',
    requiredLevel: 30, attackBonus: 8, defenseBonus: 35, speedBonus: -1, divinityBonus: 10, hpBonus: 50, elementBonus: 'void',
  },
  {
    id: 'yggdrasil_heart', name: 'Yggdrasil Heart', slot: 'shield', rarity: 'legendary',
    description: 'A living shield grown from the heartwood of Yggdrasil. It pulses with the life force of all nine realms.',
    lore: 'The Yggdrasil Heart shield contains the essence of the World Tree. Holding it, one can feel the pulse of every living thing.',
    icon: '🌳', color: '#FF6D00',
    requiredLevel: 40, attackBonus: 12, defenseBonus: 50, speedBonus: 2, divinityBonus: 20, hpBonus: 80, elementBonus: 'holy',
  },
  // ── Cloaks (5) ──
  {
    id: 'falcon_feather', name: 'Falcon Feather Cloak', slot: 'cloak', rarity: 'common',
    description: 'A cloak woven from falcon feathers that grants enhanced agility and basic wind resistance.',
    lore: 'Freyja Falcon Feather Cloak allows its wearer to fly between realms. This lesser version still grants remarkable agility.', icon: '🪶', color: '#B0BEC5',
    requiredLevel: 1, attackBonus: 0, defenseBonus: 2, speedBonus: 6, divinityBonus: 2, hpBonus: 5, elementBonus: 'wind',
  },
  {
    id: 'night_veil', name: 'Night Veil', slot: 'cloak', rarity: 'uncommon',
    description: 'A cloak of living shadow that renders the wearer nearly invisible in darkness and dim light.',
    lore: 'The Night Veil was woven by the dwarves from threads of pure darkness extracted from Niflheim deepest caves.', icon: '🌑', color: '#455A64',
    requiredLevel: 8, attackBonus: 3, defenseBonus: 4, speedBonus: 8, divinityBonus: 3, hpBonus: 10, elementBonus: 'shadow',
  },
  {
    id: 'aurora_mantle', name: 'Aurora Mantle', slot: 'cloak', rarity: 'rare',
    description: 'A cloak that shimmers with the colors of the northern lights. Grants divine protection and enhanced vision.',
    lore: 'The Aurora Mantle captures the light of the Borealis. Each color provides a different blessing to its wearer.', icon: '🌈', color: '#E040FB',
    requiredLevel: 18, attackBonus: 5, defenseBonus: 8, speedBonus: 10, divinityBonus: 10, hpBonus: 20, elementBonus: 'holy',
  },
  {
    id: 'cosmic_shroud', name: 'Cosmic Shroud', slot: 'cloak', rarity: 'epic',
    description: 'A cloak woven from the fabric of space itself. The wearer exists partially outside normal reality.',
    lore: 'The Cosmic Shroud was found drifting between the stars by a curious Valkyrie. It has no maker and no origin.', icon: '🌌', color: '#1A237E',
    requiredLevel: 30, attackBonus: 8, defenseBonus: 12, speedBonus: 14, divinityBonus: 15, hpBonus: 35, elementBonus: 'void',
  },
  {
    id: 'odin_cloak', name: 'Cloak of the Allfather', slot: 'cloak', rarity: 'legendary',
    description: 'The legendary cloak of Odin himself, which renders the wearer invisible and grants omniscient awareness.',
    lore: 'Odin lent this cloak to the first Valkyrie when he created the order. It has been passed down ever since as the symbol of leadership.',
    icon: '👑', color: '#FF6D00',
    requiredLevel: 40, attackBonus: 12, defenseBonus: 18, speedBonus: 20, divinityBonus: 30, hpBonus: 60, elementBonus: 'void',
  },
]

// ─── ACHIEVEMENTS (15) ──────────────────────────────────────────

export const SK_ACHIEVEMENTS: readonly SkAchievementDef[] = [
  { id: 'sk_first_soul', name: 'First Choosing', description: 'Select your first fallen warrior soul.', condition: 'totalSoulsCollected >= 1', rewardXp: 30, rewardDivinity: 10, hidden: false, icon: '🕊️' },
  { id: 'sk_ten_souls', name: 'Soul Gatherer', description: 'Collect 10 worthy warrior souls.', condition: 'totalSoulsCollected >= 10', rewardXp: 120, rewardDivinity: 40, hidden: false, icon: '👻' },
  { id: 'sk_fifty_souls', name: 'Chooser of the Slain', description: 'Collect 50 worthy warrior souls.', condition: 'totalSoulsCollected >= 50', rewardXp: 400, rewardDivinity: 120, hidden: false, icon: '⚔️' },
  { id: 'sk_hundred_kills', name: 'Sky Reaper', description: 'Defeat 100 enemies in aerial combat.', condition: 'totalKills >= 100', rewardXp: 600, rewardDivinity: 150, hidden: false, icon: '💀' },
  { id: 'sk_max_altitude', name: 'Touching Heaven', description: 'Reach maximum altitude in combat.', condition: 'maxAltitudeReached', rewardXp: 100, rewardDivinity: 50, hidden: false, icon: '☁️' },
  { id: 'sk_dive_master', name: 'Falling Star', description: 'Execute 50 dive attacks.', condition: 'totalDiveAttacks >= 50', rewardXp: 200, rewardDivinity: 60, hidden: false, icon: '🌠' },
  { id: 'sk_swoop_master', name: 'Eagle Eye', description: 'Execute 50 swoop attacks.', condition: 'totalSwoopAttacks >= 50', rewardXp: 200, rewardDivinity: 60, hidden: false, icon: '🦅' },
  { id: 'sk_all_realms', name: 'Realm Walker', description: 'Unlock and visit all 12 Norse realms.', condition: 'allRealmsUnlocked', rewardXp: 1000, rewardDivinity: 300, hidden: false, icon: '🌍' },
  { id: 'sk_boss_slayer', name: 'Boss Conqueror', description: 'Defeat both boss enemies (Death Herald and Ragnarok Wolf).', condition: 'allBossesDefeated', rewardXp: 800, rewardDivinity: 200, hidden: false, icon: '🏆' },
  { id: 'sk_streak_3', name: 'Dutiful Valkyrie', description: 'Maintain a 3-day patrol streak.', condition: 'streak >= 3', rewardXp: 75, rewardDivinity: 25, hidden: false, icon: '📅' },
  { id: 'sk_streak_7', name: 'Eternal Vigil', description: 'Maintain a 7-day patrol streak.', condition: 'streak >= 7', rewardXp: 300, rewardDivinity: 100, hidden: false, icon: '📆' },
  { id: 'sk_streak_30', name: 'Immortal Watch', description: 'Maintain a 30-day patrol streak.', condition: 'streak >= 30', rewardXp: 2000, rewardDivinity: 500, hidden: true, icon: '🔥' },
  { id: 'sk_level_15', name: 'Winged Warrior', description: 'Reach Valkyrie level 15.', condition: 'level >= 15', rewardXp: 300, rewardDivinity: 100, hidden: false, icon: '⭐' },
  { id: 'sk_level_30', name: 'Sky Commander', description: 'Reach Valkyrie level 30.', condition: 'level >= 30', rewardXp: 1000, rewardDivinity: 300, hidden: false, icon: '🌟' },
  { id: 'sk_level_45', name: 'Ragnarok Valkyrie', description: 'Reach the maximum Valkyrie level of 45.', condition: 'level >= 45', rewardXp: 3000, rewardDivinity: 1000, hidden: true, icon: '👑' },
]

// ─── LEVEL TITLES ───────────────────────────────────────────────

export const SK_TITLES: readonly { level: number; title: string; description: string }[] = [
  { level: 1, title: 'Fledgling', description: 'A newly awakened Valkyrie, barely able to stay aloft in the winds of fate.' },
  { level: 5, title: 'Wind Strider', description: 'Has learned to ride the winds with confidence and can perform basic aerial maneuvers.' },
  { level: 10, title: 'Cloud Dancer', description: 'Dances among the clouds with grace, selecting souls from the fallen on the battlefield.' },
  { level: 15, title: 'Storm Seeker', description: 'Actively hunts enemies across the realms, braving storms and dark skies without fear.' },
  { level: 20, title: 'Soul Collector', description: 'Has collected a hundred souls and earned the respect of the lesser gods.' },
  { level: 25, title: 'Realm Walker', description: 'Can travel freely between multiple realms, a trusted servant of Odin and Freyja.' },
  { level: 30, title: 'Sky Commander', description: 'Commands other Valkyries in battle and has faced the mightiest foes of the nine realms.' },
  { level: 35, title: 'Divine Herald', description: 'Carries the authority of the gods themselves, her wings shine with celestial light.' },
  { level: 40, title: 'Ragnarok Guardian', description: 'One of the last defenders against the end times, holding the line when all seems lost.' },
  { level: 45, title: 'Chooser of the Slain', description: 'The ultimate title, earned by only the greatest Valkyrie to ever fly the skies of the nine realms.' },
]

// ─── INTERNAL HELPERS ───────────────────────────────────────────

const SK_MAX_LEVEL = 45
const SK_BASE_HP = 90
const SK_HP_PER_LEVEL = 10
const SK_BASE_MANA = 50
const SK_MANA_PER_LEVEL = 5
const SK_BASE_ATTACK = 10
const SK_ATTACK_PER_LEVEL = 2
const SK_BASE_DEFENSE = 8
const SK_DEFENSE_PER_LEVEL = 2
const SK_BASE_SPEED = 10
const SK_SPEED_PER_LEVEL = 2
const SK_BASE_DIVINITY = 10
const SK_DIVINITY_PER_LEVEL = 3
const SK_MAX_DIVINITY = 200
const SK_MAX_ALTITUDE = 1000
const SK_INITIAL_GOLD = 150

function skXpForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= SK_MAX_LEVEL) return Infinity
  return Math.floor(60 * Math.pow(1.1, level) + level * 20)
}

function skLevelFromXp(totalXp: number): number {
  let level = 1
  let remaining = totalXp
  while (level < SK_MAX_LEVEL) {
    const needed = skXpForLevel(level)
    if (remaining < needed) break
    remaining -= needed
    level++
  }
  return level
}

function skClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function skSeedRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

function skPseudoRandom(seed: number, index: number): number {
  const rng = skSeedRandom(seed + index)
  return rng()
}

function skGetValkyrieClassDef(classId: SkValkyrieClassId): SkValkyrieClassDef | undefined {
  return SK_VALKYRIE_CLASSES.find(c => c.id === classId)
}

function skGetWingTypeDef(wingId: SkWingTypeId): SkWingTypeDef | undefined {
  return SK_WING_TYPES.find(w => w.id === wingId)
}

function _skCalcEffectiveStats(state: SkyValkyrieState): {
  attack: number; defense: number; speed: number; divinity: number; maxHp: number; maxMana: number; evasion: number
} {
  const classDef = skGetValkyrieClassDef(state.valkyrieClass)
  const wingDef = skGetWingTypeDef(state.wingType)

  let atk = state.player.baseAttack
  let def = state.player.baseDefense
  let spd = state.player.baseSpeed
  let div = state.player.baseDivinity
  let hp = state.player.maxHp
  let mp = state.player.maxMana
  let eva = state.player.evasion

  if (wingDef) {
    atk += wingDef.attackBonus
    def += wingDef.defenseBonus
    spd += wingDef.speedBonus
    eva += wingDef.evasionBonus
  }

  for (const slot of ['armor', 'spear', 'shield', 'cloak'] as SkEquipSlot[]) {
    const itemId = state.equipment[slot]
    if (!itemId) continue
    const item = SK_EQUIPMENT.find(e => e.id === itemId)
    if (!item) continue
    atk += item.attackBonus
    def += item.defenseBonus
    spd += item.speedBonus
    div += item.divinityBonus
    hp += item.hpBonus
  }

  const warriorBonus = _skCalcWarriorBonus(state)
  atk += warriorBonus.attack
  def += warriorBonus.defense

  if (classDef) {
    const altRatio = state.player.altitude / SK_MAX_ALTITUDE
    if (classDef.id === 'shieldmaiden') {
      def = Math.floor(def * (1 + 0.15 * altRatio))
    } else if (classDef.id === 'starhunter') {
      atk = Math.floor(atk * (1 + 0.5 * altRatio))
    }
  }

  return { attack: atk, defense: def, speed: spd, divinity: div, maxHp: hp, maxMana: mp, evasion: eva }
}

function _skFindEnemyDef(enemyId: SkEnemyId): SkEnemyDef | undefined {
  return SK_ENEMIES.find(e => e.id === enemyId)
}

function _skCalcWarriorBonus(state: SkyValkyrieState): { attack: number; defense: number } {
  let totalAtk = 0
  let totalDef = 0
  for (const heroId of state.selectedWarriors) {
    const hero = SK_HEROES.find(h => h.id === heroId)
    if (!hero) continue
    totalAtk += hero.combatBonus
    totalDef += hero.defenseBonus
  }
  return { attack: totalAtk, defense: totalDef }
}

function _skEnemyAt(state: SkyValkyrieState): SkEnemyDef | null {
  if (!state.combat.enemy) return null
  return SK_ENEMIES.find(e => e.id === state.combat.enemy!.enemyId) ?? null
}

// ═══════════════════════════════════════════════════════════════════
// NAMED EXPORTS — All pure functions with sk prefix
// ═══════════════════════════════════════════════════════════════════

// ─── State Management (6) ───────────────────────────────────────

export function skInitialState(): SkyValkyrieState {
  return {
    player: {
      level: 1, xp: 0, totalXp: 0,
      divinity: 0, maxDivinity: SK_MAX_DIVINITY,
      hp: SK_BASE_HP, maxHp: SK_BASE_HP,
      mana: SK_BASE_MANA, maxMana: SK_BASE_MANA,
      baseAttack: SK_BASE_ATTACK, baseDefense: SK_BASE_DEFENSE,
      baseSpeed: SK_BASE_SPEED, baseDivinity: SK_BASE_DIVINITY,
      altitude: 0, maxAltitude: SK_MAX_ALTITUDE, evasion: 5,
    },
    combat: {
      active: false, realmId: null, enemy: null, turn: 0,
      altitude: 100, combatLog: [], cooldowns: {},
      warriorSoul: null,
      shieldActive: false, shieldTurns: 0, shieldAmount: 0,
      diveCharging: false, diveTurns: 0,
      swoopBonus: false, swoopTurns: 0,
      playerStatusEffect: 'none', playerStatusTurns: 0,
      waveNumber: 1, enemiesDefeatedInWave: 0, waveEnemyCount: 1,
      combatWon: false, combatLost: false,
    },
    achievements: [],
    valkyrieClass: 'shieldmaiden',
    wingType: 'feathered_swallow',
    selectedWarriors: [],
    equipment: { armor: null, spear: null, shield: null, cloak: null },
    unlockedRealms: ['asgard', 'midgard'],
    streak: 0, bestStreak: 0, lastPlayDate: '',
    dailyPatrol: null,
    stats: {
      totalKills: 0, totalDamageDealt: 0, totalDamageTaken: 0,
      totalSoulsCollected: 0, totalDivinityGained: 0,
      totalAerialDistance: 0, totalSwoopAttacks: 0, totalDiveAttacks: 0,
      totalShieldBashes: 0, totalWingSlashes: 0,
      longestAltitudeReached: 0, totalPatrolsCompleted: 0,
      realmsConquered: [], bossesDefeated: [],
      totalStreak: 0, currentStreak: 0, bestStreak: 0,
      gold: SK_INITIAL_GOLD, totalGoldEarned: SK_INITIAL_GOLD,
    },
    seed: 42,
  }
}

export function skResetState(): SkyValkyrieState {
  return skInitialState()
}

export function skGetState(state: SkyValkyrieState): SkyValkyrieState {
  return state
}

export function skCloneState(state: SkyValkyrieState): SkyValkyrieState {
  return JSON.parse(JSON.stringify(state)) as SkyValkyrieState
}

export function skMergeState(base: SkyValkyrieState, patch: Partial<SkyValkyrieState>): SkyValkyrieState {
  return { ...base, ...patch }
}

export function skValidateState(state: SkyValkyrieState): boolean {
  if (state.player.level < 1 || state.player.level > SK_MAX_LEVEL) return false
  if (state.player.hp < 0 || state.player.hp > state.player.maxHp) return false
  if (state.player.divinity < 0 || state.player.divinity > state.player.maxDivinity) return false
  if (!SK_VALKYRIE_CLASSES.find(c => c.id === state.valkyrieClass)) return false
  if (!SK_WING_TYPES.find(w => w.id === state.wingType)) return false
  return true
}

// ─── Player Functions (10) ──────────────────────────────────────

export function skGetPlayerLevel(state: SkyValkyrieState): number {
  return state.player.level
}

export function skGetXpForLevel(level: number): number {
  return skXpForLevel(level)
}

export function skGetLevelFromXp(totalXp: number): number {
  return skLevelFromXp(totalXp)
}

export function skGetXpToNextLevel(state: SkyValkyrieState): number {
  if (state.player.level >= SK_MAX_LEVEL) return 0
  return skXpForLevel(state.player.level)
}

export function skGetXpProgress(state: SkyValkyrieState): number {
  if (state.player.level >= SK_MAX_LEVEL) return 1
  const needed = skXpForLevel(state.player.level)
  if (needed <= 0) return 0
  return Math.min(1, state.player.xp / needed)
}

export function skGetPlayerTitle(state: SkyValkyrieState): string {
  let title = SK_TITLES[0].title
  for (const t of SK_TITLES) {
    if (state.player.level >= t.level) title = t.title
  }
  return title
}

export function skGetTitleForLevel(level: number): string {
  let title = SK_TITLES[0].title
  for (const t of SK_TITLES) {
    if (level >= t.level) title = t.title
  }
  return title
}

export function skGetDivinityProgress(state: SkyValkyrieState): number {
  if (state.player.maxDivinity <= 0) return 0
  return skClamp(state.player.divinity / state.player.maxDivinity, 0, 1)
}

export function skGetAltitudeProgress(state: SkyValkyrieState): number {
  if (state.player.maxAltitude <= 0) return 0
  return skClamp(state.player.altitude / state.player.maxAltitude, 0, 1)
}

export function skAddXp(state: SkyValkyrieState, amount: number): SkyValkyrieState {
  const newTotal = state.player.totalXp + amount
  const newLevel = skLevelFromXp(newTotal)
  const classDef = skGetValkyrieClassDef(state.valkyrieClass)
  const baseClass = classDef ?? SK_VALKYRIE_CLASSES[0]
  const newMaxHp = SK_BASE_HP + (baseClass.baseHp - SK_BASE_HP) + newLevel * SK_HP_PER_LEVEL + newLevel * baseClass.hpPerLevel
  const newMaxMana = SK_BASE_MANA + newLevel * SK_MANA_PER_LEVEL
  const newMaxDiv = SK_MAX_DIVINITY
  const xpForPrevious = Array.from({ length: newLevel - 1 }, (_, i) => skXpForLevel(i + 1)).reduce((a, b) => a + b, 0)
  const newClasses = SK_VALKYRIE_CLASSES.filter(c => newLevel >= c.unlockLevel).map(c => c.id)
  const newWings = SK_WING_TYPES.filter(w => newLevel >= w.unlockLevel).map(w => w.id)
  const newRealms = SK_REALMS.filter(r => newLevel >= r.unlockLevel).map(r => r.id)
  const mergedRealms = Array.from(new Set([...state.unlockedRealms, ...newRealms])) as SkRealmId[]
  return {
    ...state,
    player: {
      ...state.player,
      totalXp: newTotal,
      xp: newTotal - xpForPrevious,
      level: newLevel,
      maxHp: newMaxHp,
      maxMana: newMaxMana,
      maxDivinity: newMaxDiv,
      baseAttack: SK_BASE_ATTACK + newLevel * SK_ATTACK_PER_LEVEL,
      baseDefense: SK_BASE_DEFENSE + newLevel * SK_DEFENSE_PER_LEVEL,
      baseSpeed: SK_BASE_SPEED + newLevel * SK_SPEED_PER_LEVEL,
      baseDivinity: SK_BASE_DIVINITY + newLevel * SK_DIVINITY_PER_LEVEL,
    },
    unlockedRealms: mergedRealms,
  }
}

export function skAddDivinity(state: SkyValkyrieState, amount: number): SkyValkyrieState {
  return {
    ...state,
    player: {
      ...state.player,
      divinity: skClamp(state.player.divinity + amount, 0, state.player.maxDivinity),
    },
    stats: {
      ...state.stats,
      totalDivinityGained: state.stats.totalDivinityGained + Math.max(0, amount),
    },
  }
}

export function skSpendDivinity(state: SkyValkyrieState, amount: number): SkyValkyrieState {
  return {
    ...state,
    player: {
      ...state.player,
      divinity: skClamp(state.player.divinity - amount, 0, state.player.maxDivinity),
    },
  }
}

// ─── Valkyrie Class Functions (5) ───────────────────────────────

export function skGetValkyrieClass(state: SkyValkyrieState): SkValkyrieClassDef {
  return SK_VALKYRIE_CLASSES.find(c => c.id === state.valkyrieClass) ?? SK_VALKYRIE_CLASSES[0]
}

export function skGetAvailableClasses(state: SkyValkyrieState): SkValkyrieClassDef[] {
  return SK_VALKYRIE_CLASSES.filter(c => state.player.level >= c.unlockLevel)
}

export function skSetValkyrieClass(state: SkyValkyrieState, classId: SkValkyrieClassId): SkyValkyrieState {
  const classDef = SK_VALKYRIE_CLASSES.find(c => c.id === classId)
  if (!classDef || state.player.level < classDef.unlockLevel) return state
  return {
    ...state,
    valkyrieClass: classId,
  }
}

export function skGetClassStats(state: SkyValkyrieState): { attack: number; defense: number; speed: number; divinity: number } {
  const classDef = skGetValkyrieClassDef(state.valkyrieClass)
  if (!classDef) return { attack: 0, defense: 0, speed: 0, divinity: 0 }
  return {
    attack: state.player.baseAttack + (classDef.baseHp > 0 ? 0 : 0),
    defense: state.player.baseDefense,
    speed: state.player.baseSpeed,
    divinity: state.player.baseDivinity,
  }
}

export function skGetClassElement(state: SkyValkyrieState): SkElement {
  const classDef = skGetValkyrieClassDef(state.valkyrieClass)
  return classDef?.primaryElement ?? 'holy'
}

// ─── Wing Functions (5) ─────────────────────────────────────────

export function skGetWingType(state: SkyValkyrieState): SkWingTypeDef {
  return SK_WING_TYPES.find(w => w.id === state.wingType) ?? SK_WING_TYPES[0]
}

export function skGetAvailableWings(state: SkyValkyrieState): SkWingTypeDef[] {
  return SK_WING_TYPES.filter(w => state.player.level >= w.unlockLevel)
}

export function skSetWingType(state: SkyValkyrieState, wingId: SkWingTypeId): SkyValkyrieState {
  const wingDef = SK_WING_TYPES.find(w => w.id === wingId)
  if (!wingDef || state.player.level < wingDef.unlockLevel) return state
  return { ...state, wingType: wingId }
}

export function skGetWingSpeedBonus(state: SkyValkyrieState): number {
  const wingDef = skGetWingTypeDef(state.wingType)
  return wingDef?.speedBonus ?? 0
}

export function skGetWingEvasionBonus(state: SkyValkyrieState): number {
  const wingDef = skGetWingTypeDef(state.wingType)
  return wingDef?.evasionBonus ?? 0
}

// ─── Warrior Selection Functions (8) ───────────────────────────

export function skGetAvailableHeroes(state: SkyValkyrieState): SkHeroDef[] {
  return SK_HEROES.filter(h => state.player.level >= h.requiredValkyrieLevel)
}

export function skGetHeroDef(heroId: SkHeroId): SkHeroDef | undefined {
  return SK_HEROES.find(h => h.id === heroId)
}

export function skGetHeroRarity(heroId: SkHeroId): SkRarity {
  return SK_HEROES.find(h => h.id === heroId)?.rarity ?? 'common'
}

export function skGetHeroElement(heroId: SkHeroId): SkElement {
  return SK_HEROES.find(h => h.id === heroId)?.element ?? 'holy'
}

export function skSelectWarrior(state: SkyValkyrieState, heroId: SkHeroId): SkyValkyrieState {
  if (state.selectedWarriors.length >= 3) return state
  if (state.selectedWarriors.includes(heroId)) return state
  const hero = SK_HEROES.find(h => h.id === heroId)
  if (!hero || state.player.level < hero.requiredValkyrieLevel) return state
  return {
    ...state,
    selectedWarriors: [...state.selectedWarriors, heroId],
    stats: {
      ...state.stats,
      totalSoulsCollected: state.stats.totalSoulsCollected + 1,
    },
  }
}

export function skRemoveWarrior(state: SkyValkyrieState, heroId: SkHeroId): SkyValkyrieState {
  return {
    ...state,
    selectedWarriors: state.selectedWarriors.filter(id => id !== heroId),
  }
}

export function skGetSelectedHeroes(state: SkyValkyrieState): SkHeroDef[] {
  return state.selectedWarriors
    .map(id => SK_HEROES.find(h => h.id === id))
    .filter((h): h is SkHeroDef => h !== undefined)
}

export function skGetTotalWarriorBonus(state: SkyValkyrieState): { attack: number; defense: number } {
  return _skCalcWarriorBonus(state)
}

// ─── Equipment Functions (6) ────────────────────────────────────

export function skGetEquipmentForSlot(state: SkyValkyrieState, slot: SkEquipSlot): SkEquipmentDef | null {
  const itemId = state.equipment[slot]
  if (!itemId) return null
  return SK_EQUIPMENT.find(e => e.id === itemId) ?? null
}

export function skGetAvailableEquipment(state: SkyValkyrieState, slot: SkEquipSlot): SkEquipmentDef[] {
  return SK_EQUIPMENT.filter(e => e.slot === slot && state.player.level >= e.requiredLevel)
}

export function skEquipItem(state: SkyValkyrieState, slot: SkEquipSlot, itemId: string): SkyValkyrieState {
  const item = SK_EQUIPMENT.find(e => e.id === itemId)
  if (!item || item.slot !== slot) return state
  if (state.player.level < item.requiredLevel) return state
  return {
    ...state,
    equipment: { ...state.equipment, [slot]: itemId },
  }
}

export function skUnequipItem(state: SkyValkyrieState, slot: SkEquipSlot): SkyValkyrieState {
  return {
    ...state,
    equipment: { ...state.equipment, [slot]: null },
  }
}

export function skGetEquipmentStats(state: SkyValkyrieState): {
  totalAttack: number; totalDefense: number; totalSpeed: number; totalDivinity: number; totalHp: number
} {
  let atk = 0, def = 0, spd = 0, div = 0, hp = 0
  for (const slot of ['armor', 'spear', 'shield', 'cloak'] as SkEquipSlot[]) {
    const itemId = state.equipment[slot]
    if (!itemId) continue
    const item = SK_EQUIPMENT.find(e => e.id === itemId)
    if (!item) continue
    atk += item.attackBonus
    def += item.defenseBonus
    spd += item.speedBonus
    div += item.divinityBonus
    hp += item.hpBonus
  }
  return { totalAttack: atk, totalDefense: def, totalSpeed: spd, totalDivinity: div, totalHp: hp }
}

export function skGetEquippedCount(state: SkyValkyrieState): number {
  let count = 0
  for (const slot of ['armor', 'spear', 'shield', 'cloak'] as SkEquipSlot[]) {
    if (state.equipment[slot]) count++
  }
  return count
}

// ─── Combat Functions (12) ──────────────────────────────────────

export function skGetEffectiveStats(state: SkyValkyrieState): {
  attack: number; defense: number; speed: number; divinity: number; maxHp: number; maxMana: number; evasion: number
} {
  return _skCalcEffectiveStats(state)
}

export function skGetEnemyDef(enemyId: SkEnemyId): SkEnemyDef | undefined {
  return SK_ENEMIES.find(e => e.id === enemyId)
}

export function skGetEnemyAt(state: SkyValkyrieState): SkEnemyDef | null {
  return _skEnemyAt(state)
}

export function skIsEnemyWeakTo(enemy: SkEnemyDef, element: SkElement): boolean {
  return enemy.weakness === element
}

export function skIsEnemyResistantTo(enemy: SkEnemyDef, element: SkElement): boolean {
  return enemy.resistances.includes(element)
}

export function skCalculateDamage(
  attackerPower: number,
  defenderDefense: number,
  elementModifier: number,
  altitudeBonus: number,
  isCritical: boolean
): number {
  const baseDamage = Math.max(1, attackerPower - defenderDefense * 0.5)
  const elemental = baseDamage * elementModifier
  const altitude = elemental * (1 + altitudeBonus * 0.01)
  const critical = isCritical ? altitude * 1.5 : altitude
  return Math.max(1, Math.floor(critical))
}

export function skGetElementModifier(attackElement: SkElement, defender: SkEnemyDef): number {
  if (defender.weakness === attackElement) return 1.5
  if (defender.resistances.includes(attackElement)) return 0.5
  return 1.0
}

export function skIsCriticalHit(evasion: number, seed: number): boolean {
  const threshold = Math.min(80, 5 + evasion)
  return skPseudoRandom(seed, 99) * 100 < threshold
}

export function skPerformSwoop(state: SkyValkyrieState): SkyValkyrieState {
  if (!state.combat.active || !state.combat.enemy) return state
  const enemyDef = _skEnemyAt(state)
  if (!enemyDef) return state
  const effective = _skCalcEffectiveStats(state)
  const classElement = skGetClassElement(state)
  const elementMod = skGetElementModifier(classElement, enemyDef)
  const altBonus = (state.combat.altitude / SK_MAX_ALTITUDE) * 100
  const isCrit = skIsCriticalHit(effective.evasion, state.seed + state.combat.turn)
  const damage = skCalculateDamage(effective.attack, enemyDef.defense, elementMod, altBonus, isCrit) * 1.2
  const newEnemyHp = Math.max(0, state.combat.enemy.currentHp - damage)
  const logEntry: SkAerialCombatLog = {
    turn: state.combat.turn,
    actor: 'valkyrie',
    action: 'swoop',
    damage: Math.floor(damage),
    divinityGained: Math.floor(damage * 0.1),
    altitude: state.combat.altitude,
    detail: isCrit ? 'Critical swoop attack!' : 'Swift swoop strike from above.',
  }
  const newState = {
    ...state,
    combat: {
      ...state.combat,
      enemy: { ...state.combat.enemy!, currentHp: newEnemyHp },
      swoopBonus: true,
      swoopTurns: 2,
      combatLog: [...state.combat.combatLog, logEntry],
    },
    stats: {
      ...state.stats,
      totalDamageDealt: state.stats.totalDamageDealt + Math.floor(damage),
      totalSwoopAttacks: state.stats.totalSwoopAttacks + 1,
    },
  }
  return skAddDivinity(newState, Math.floor(damage * 0.1))
}

export function skPerformDive(state: SkyValkyrieState): SkyValkyrieState {
  if (!state.combat.active || !state.combat.enemy) return state
  const enemyDef = _skEnemyAt(state)
  if (!enemyDef) return state
  const effective = _skCalcEffectiveStats(state)
  const classElement = skGetClassElement(state)
  const elementMod = skGetElementModifier(classElement, enemyDef)
  const altBonus = (state.combat.altitude / SK_MAX_ALTITUDE) * 200
  const isCrit = skIsCriticalHit(effective.evasion, state.seed + state.combat.turn + 1)
  const damage = skCalculateDamage(effective.attack * 1.5, enemyDef.defense * 0.8, elementMod, altBonus, isCrit)
  const newEnemyHp = Math.max(0, state.combat.enemy.currentHp - damage)
  const logEntry: SkAerialCombatLog = {
    turn: state.combat.turn,
    actor: 'valkyrie',
    action: 'dive',
    damage: Math.floor(damage),
    divinityGained: Math.floor(damage * 0.15),
    altitude: Math.max(0, state.combat.altitude - 200),
    detail: isCrit ? 'Devastating critical dive!' : 'Powerful diving attack from the heavens.',
  }
  const newState = {
    ...state,
    player: {
      ...state.player,
      altitude: Math.max(0, state.player.altitude - 200),
    },
    combat: {
      ...state.combat,
      enemy: { ...state.combat.enemy!, currentHp: newEnemyHp },
      altitude: Math.max(0, state.combat.altitude - 200),
      diveCharging: false,
      combatLog: [...state.combat.combatLog, logEntry],
    },
    stats: {
      ...state.stats,
      totalDamageDealt: state.stats.totalDamageDealt + Math.floor(damage),
      totalDiveAttacks: state.stats.totalDiveAttacks + 1,
    },
  }
  return skAddDivinity(newState, Math.floor(damage * 0.15))
}

export function skPerformShieldBash(state: SkyValkyrieState): SkyValkyrieState {
  if (!state.combat.active || !state.combat.enemy) return state
  const enemyDef = _skEnemyAt(state)
  if (!enemyDef) return state
  const effective = _skCalcEffectiveStats(state)
  const damage = skCalculateDamage(effective.attack * 0.8, enemyDef.defense * 0.5, 1.0, 0, false)
  const newEnemyHp = Math.max(0, state.combat.enemy.currentHp - damage)
  const shieldAmt = Math.floor(effective.defense * 1.5)
  const logEntry: SkAerialCombatLog = {
    turn: state.combat.turn,
    actor: 'valkyrie',
    action: 'shield_bash',
    damage: Math.floor(damage),
    divinityGained: 5,
    altitude: state.combat.altitude,
    detail: `Shield bash! Dealt ${Math.floor(damage)} damage and raised shield for ${shieldAmt}.`,
  }
  return {
    ...state,
    combat: {
      ...state.combat,
      enemy: { ...state.combat.enemy!, currentHp: newEnemyHp },
      shieldActive: true,
      shieldTurns: 3,
      shieldAmount: shieldAmt,
      combatLog: [...state.combat.combatLog, logEntry],
    },
    stats: {
      ...state.stats,
      totalDamageDealt: state.stats.totalDamageDealt + Math.floor(damage),
      totalShieldBashes: state.stats.totalShieldBashes + 1,
    },
  }
}

export function skAdjustAltitude(state: SkyValkyrieState, delta: number): SkyValkyrieState {
  const newAlt = skClamp(state.combat.altitude + delta, 0, SK_MAX_ALTITUDE)
  const logEntry: SkAerialCombatLog = {
    turn: state.combat.turn,
    actor: 'valkyrie',
    action: delta > 0 ? 'ascend' : 'descend',
    damage: 0,
    divinityGained: 0,
    altitude: newAlt,
    detail: delta > 0 ? `Ascended to altitude ${newAlt}m.` : `Descended to altitude ${newAlt}m.`,
  }
  const maxAltReached = Math.max(state.stats.longestAltitudeReached, newAlt)
  return {
    ...state,
    player: { ...state.player, altitude: newAlt },
    combat: {
      ...state.combat,
      altitude: newAlt,
      combatLog: [...state.combat.combatLog, logEntry],
    },
    stats: { ...state.stats, longestAltitudeReached: maxAltReached },
  }
}

export function skEnemyTurn(state: SkyValkyrieState): SkyValkyrieState {
  if (!state.combat.active || !state.combat.enemy) return state
  const enemyDef = _skEnemyAt(state)
  if (!enemyDef) return state
  const effective = _skCalcEffectiveStats(state)
  const enemyDamage = Math.max(1, enemyDef.attack - effective.defense * 0.4)
  const finalDamage = state.combat.shieldActive
    ? Math.max(0, Math.floor(enemyDamage - state.combat.shieldAmount))
    : Math.floor(enemyDamage)
  const actualDamage = state.combat.shieldActive ? finalDamage : Math.floor(enemyDamage)
  const newShield = state.combat.shieldActive
    ? Math.max(0, state.combat.shieldAmount - Math.floor(enemyDamage))
    : 0
  const logEntry: SkAerialCombatLog = {
    turn: state.combat.turn,
    actor: 'enemy',
    action: enemyDef.specialAbility,
    damage: actualDamage,
    divinityGained: 0,
    altitude: state.combat.altitude,
    detail: `${enemyDef.name} uses ${enemyDef.specialAbility}! Deals ${actualDamage} damage.`,
  }
  const newHp = Math.max(0, state.player.hp - actualDamage)
  const newShieldTurns = state.combat.shieldActive && newShield <= 0
    ? 0
    : state.combat.shieldTurns > 0 ? state.combat.shieldTurns - 1 : 0
  return {
    ...state,
    player: { ...state.player, hp: newHp },
    combat: {
      ...state.combat,
      enemy: { ...state.combat.enemy!, turnCount: state.combat.enemy.turnCount + 1 },
      shieldActive: newShield > 0,
      shieldTurns: newShieldTurns,
      shieldAmount: newShield,
      combatLog: [...state.combat.combatLog, logEntry],
    },
    stats: {
      ...state.stats,
      totalDamageTaken: state.stats.totalDamageTaken + actualDamage,
    },
  }
}

// ─── Realm Functions (6) ────────────────────────────────────────

export function skGetRealmDef(realmId: SkRealmId): SkRealmDef | undefined {
  return SK_REALMS.find(r => r.id === realmId)
}

export function skGetAvailableRealms(state: SkyValkyrieState): SkRealmDef[] {
  return SK_REALMS.filter(r => state.unlockedRealms.includes(r.id))
}

export function skGetLockedRealms(state: SkyValkyrieState): SkRealmDef[] {
  return SK_REALMS.filter(r => !state.unlockedRealms.includes(r.id))
}

export function skIsRealmUnlocked(state: SkyValkyrieState, realmId: SkRealmId): boolean {
  return state.unlockedRealms.includes(realmId)
}

export function skGetRealmForLevel(level: number): SkRealmDef[] {
  return SK_REALMS.filter(r => level >= r.unlockLevel)
}

export function skGetRealmElementBonus(realmId: SkRealmId): number {
  const realm = SK_REALMS.find(r => r.id === realmId)
  return realm?.divinityBonus ?? 0
}

// ─── Achievement Functions (4) ──────────────────────────────────

export function skGetAchievements(state: SkyValkyrieState): SkAchievementDef[] {
  return SK_ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: state.achievements.includes(a.id),
  }))
}

export function skGetUnlockedAchievements(state: SkyValkyrieState): SkAchievementDef[] {
  return SK_ACHIEVEMENTS.filter(a => state.achievements.includes(a.id))
}

export function skGetLockedAchievements(state: SkyValkyrieState): SkAchievementDef[] {
  return SK_ACHIEVEMENTS.filter(a => !state.achievements.includes(a.id) && !a.hidden)
}

export function skCheckAchievements(state: SkyValkyrieState): { state: SkyValkyrieState; newAchievements: SkAchievementDef[] } {
  const newAchievements: SkAchievementDef[] = []
  let updated = state
  const checks: Record<string, boolean> = {
    'totalSoulsCollected >= 1': state.stats.totalSoulsCollected >= 1,
    'totalSoulsCollected >= 10': state.stats.totalSoulsCollected >= 10,
    'totalSoulsCollected >= 50': state.stats.totalSoulsCollected >= 50,
    'totalKills >= 100': state.stats.totalKills >= 100,
    maxAltitudeReached: state.stats.longestAltitudeReached >= SK_MAX_ALTITUDE * 0.9,
    'totalDiveAttacks >= 50': state.stats.totalDiveAttacks >= 50,
    'totalSwoopAttacks >= 50': state.stats.totalSwoopAttacks >= 50,
    allRealmsUnlocked: state.unlockedRealms.length >= SK_REALMS.length,
    allBossesDefeated: SK_ENEMIES.filter(e => e.isBoss).every(e => state.stats.bossesDefeated.includes(e.id)),
    'streak >= 3': state.streak >= 3,
    'streak >= 7': state.streak >= 7,
    'streak >= 30': state.streak >= 30,
    'level >= 15': state.player.level >= 15,
    'level >= 30': state.player.level >= 30,
    'level >= 45': state.player.level >= SK_MAX_LEVEL,
  }
  for (const ach of SK_ACHIEVEMENTS) {
    if (updated.achievements.includes(ach.id)) continue
    if (checks[ach.condition]) {
      updated = skAddXp(updated, ach.rewardXp)
      updated = skAddDivinity(updated, ach.rewardDivinity)
      newAchievements.push(ach)
      updated = {
        ...updated,
        achievements: [...updated.achievements, ach.id],
      }
    }
  }
  return { state: updated, newAchievements }
}

// ─── Streak & Patrol Functions (6) ──────────────────────────────

export function skUpdateStreak(state: SkyValkyrieState, currentDate: string): SkyValkyrieState {
  if (state.lastPlayDate === currentDate) return state
  const yesterday = skGetPreviousDate(currentDate)
  const newStreak = state.lastPlayDate === yesterday ? state.streak + 1 : 1
  return {
    ...state,
    streak: newStreak,
    bestStreak: Math.max(state.bestStreak, newStreak),
    lastPlayDate: currentDate,
    stats: {
      ...state.stats,
      currentStreak: newStreak,
      bestStreak: Math.max(state.stats.bestStreak, newStreak),
    },
  }
}

export function skGetStreakBonus(state: SkyValkyrieState): number {
  return Math.min(50, state.streak * 5)
}

export function skGetPreviousDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() - 1)
  const ny = date.getFullYear()
  const nm = String(date.getMonth() + 1).padStart(2, '0')
  const nd = String(date.getDate()).padStart(2, '0')
  return `${ny}-${nm}-${nd}`
}

export function skGetCurrentDate(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function skCreateDailyPatrol(state: SkyValkyrieState, date: string): SkyValkyrieState {
  const availableRealms = skGetAvailableRealms(state)
  if (availableRealms.length === 0) return state
  const realmIndex = skPseudoRandom(state.seed, date.length * 7) * availableRealms.length
  const realm = availableRealms[Math.floor(realmIndex)]
  const objectives = [
    'Defeat enemies in aerial combat',
    'Collect warrior souls',
    'Reach maximum altitude',
    'Execute swoop attacks',
    'Execute dive attacks',
  ]
  const objIndex = Math.floor(skPseudoRandom(state.seed, date.length * 13) * objectives.length)
  const target = 3 + Math.floor(skPseudoRandom(state.seed, date.length * 17) * 8)
  return {
    ...state,
    dailyPatrol: {
      patrolId: `patrol_${date}`,
      date,
      realmId: realm.id,
      objective: objectives[objIndex],
      objectiveTarget: target,
      objectiveProgress: 0,
      completed: false,
      rewardXp: 50 + target * 15,
      rewardDivinity: 20 + target * 8,
    },
  }
}

export function skAdvancePatrol(state: SkyValkyrieState, progress: number): SkyValkyrieState {
  if (!state.dailyPatrol || state.dailyPatrol.completed) return state
  const newProgress = Math.min(state.dailyPatrol.objectiveTarget, state.dailyPatrol.objectiveProgress + progress)
  const completed = newProgress >= state.dailyPatrol.objectiveTarget
  let updated: SkyValkyrieState = {
    ...state,
    dailyPatrol: { ...state.dailyPatrol, objectiveProgress: newProgress, completed },
  }
  if (completed) {
    updated = skAddXp(updated, state.dailyPatrol.rewardXp)
    updated = skAddDivinity(updated, state.dailyPatrol.rewardDivinity)
    updated = {
      ...updated,
      stats: {
        ...updated.stats,
        totalPatrolsCompleted: updated.stats.totalPatrolsCompleted + 1,
      },
    }
  }
  return updated
}

// ─── Stats Functions (6) ────────────────────────────────────────

export function skGetStats(state: SkyValkyrieState): SkCombatStats {
  return state.stats
}

export function skGetTotalPower(state: SkyValkyrieState): number {
  const effective = _skCalcEffectiveStats(state)
  return effective.attack + effective.defense + effective.speed + effective.divinity + effective.maxHp
}

export function skGetKillEfficiency(state: SkyValkyrieState): number {
  if (state.stats.totalKills === 0) return 0
  return Math.floor(state.stats.totalDamageDealt / state.stats.totalKills)
}

export function skGetDiveRatio(state: SkyValkyrieState): number {
  const total = state.stats.totalSwoopAttacks + state.stats.totalDiveAttacks + state.stats.totalShieldBashes + state.stats.totalWingSlashes
  if (total === 0) return 0
  return state.stats.totalDiveAttacks / total
}

export function skGetRealmsConqueredCount(state: SkyValkyrieState): number {
  return state.stats.realmsConquered.length
}

export function skGetCompletionPercentage(state: SkyValkyrieState): number {
  let total = 0
  let completed = 0
  total += SK_VALKYRIE_CLASSES.length
  completed += SK_VALKYRIE_CLASSES.filter(c => state.player.level >= c.unlockLevel).length
  total += SK_WING_TYPES.length
  completed += SK_WING_TYPES.filter(w => state.player.level >= w.unlockLevel).length
  total += SK_HEROES.length
  completed += SK_HEROES.filter(h => state.player.level >= h.requiredValkyrieLevel).length
  total += SK_REALMS.length
  completed += state.unlockedRealms.length
  total += SK_ACHIEVEMENTS.length
  completed += state.achievements.length
  total += SK_EQUIPMENT.length
  completed += SK_EQUIPMENT.filter(e => state.player.level >= e.requiredLevel).length
  return total > 0 ? completed / total : 0
}

// ─── Calculation Helpers (4) ────────────────────────────────────

export function skGetDifficultyScaling(realmId: SkRealmId, waveNumber: number): number {
  const realm = SK_REALMS.find(r => r.id === realmId)
  const realmMult = realm?.difficultyMultiplier ?? 1.0
  return realmMult * (1 + (waveNumber - 1) * 0.15)
}

export function skGetEnemyHpScaled(enemyId: SkEnemyId, difficulty: number): number {
  const enemy = SK_ENEMIES.find(e => e.id === enemyId)
  if (!enemy) return 100
  return Math.floor(enemy.hp * difficulty)
}

export function skGetEnemyAttackScaled(enemyId: SkEnemyId, difficulty: number): number {
  const enemy = SK_ENEMIES.find(e => e.id === enemyId)
  if (!enemy) return 10
  return Math.floor(enemy.attack * difficulty)
}

export function skCalculateGoldReward(baseAmount: number, realmId: SkRealmId, streak: number): number {
  const realm = SK_REALMS.find(r => r.id === realmId)
  const realmBonus = 1 + ((realm?.xpBonus ?? 0) / 100)
  const streakBonus = 1 + (streak * 0.05)
  return Math.floor(baseAmount * realmBonus * streakBonus)
}

// ─── Gold Functions (3) ─────────────────────────────────────────

export function skGetGold(state: SkyValkyrieState): number {
  return state.stats.gold
}

export function skAddGold(state: SkyValkyrieState, amount: number): SkyValkyrieState {
  return {
    ...state,
    stats: {
      ...state.stats,
      gold: state.stats.gold + amount,
      totalGoldEarned: state.stats.totalGoldEarned + amount,
    },
  }
}

export function skSpendGold(state: SkyValkyrieState, amount: number): SkyValkyrieState {
  if (state.stats.gold < amount) return state
  return {
    ...state,
    stats: { ...state.stats, gold: state.stats.gold - amount },
  }
}

// ═══════════════════════════════════════════════════════════════════
// DEFAULT EXPORT — React Hook (only place React imports are used)
// ═══════════════════════════════════════════════════════════════════

export default function useSkyValkyrie(initialState?: SkyValkyrieState) {
  const [state, setState] = useState<SkyValkyrieState>(
    () => initialState ?? skInitialState()
  )

  const set = useCallback((updater: SkyValkyrieState | ((prev: SkyValkyrieState) => SkyValkyrieState)) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      return skValidateState(next) ? next : prev
    })
  }, [])

  const reset = useCallback(() => {
    setState(skInitialState())
  }, [])

  const clone = useCallback(() => {
    setState(prev => skCloneState(prev))
  }, [])

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const next = skAddXp(prev, amount)
      const { state: achieved } = skCheckAchievements(next)
      return achieved
    })
  }, [])

  const setClass = useCallback((classId: SkValkyrieClassId) => {
    setState(prev => skSetValkyrieClass(prev, classId))
  }, [])

  const setWings = useCallback((wingId: SkWingTypeId) => {
    setState(prev => skSetWingType(prev, wingId))
  }, [])

  const selectWarrior = useCallback((heroId: SkHeroId) => {
    setState(prev => skSelectWarrior(prev, heroId))
  }, [])

  const removeWarrior = useCallback((heroId: SkHeroId) => {
    setState(prev => skRemoveWarrior(prev, heroId))
  }, [])

  const equip = useCallback((slot: SkEquipSlot, itemId: string) => {
    setState(prev => skEquipItem(prev, slot, itemId))
  }, [])

  const unequip = useCallback((slot: SkEquipSlot) => {
    setState(prev => skUnequipItem(prev, slot))
  }, [])

  const swoop = useCallback(() => {
    setState(prev => {
      let next = skPerformSwoop(prev)
      if (next.combat.enemy && next.combat.enemy.currentHp <= 0) {
        const enemyDef = _skEnemyAt(prev)
        if (enemyDef) {
          next = skAddXp(next, enemyDef.xpReward)
          next = skAddDivinity(next, enemyDef.divinityReward)
          next = skAddGold(next, enemyDef.xpReward * 2)
          const newBosses = enemyDef.isBoss && !next.stats.bossesDefeated.includes(enemyDef.id)
            ? [...next.stats.bossesDefeated, enemyDef.id]
            : next.stats.bossesDefeated
          next = { ...next, stats: { ...next.stats, totalKills: next.stats.totalKills + 1, bossesDefeated: newBosses } }
          const { state: achieved } = skCheckAchievements(next)
          next = achieved
        }
      } else {
        next = skEnemyTurn(next)
        if (next.player.hp <= 0) {
          next = { ...next, combat: { ...next.combat, active: false, combatLost: true } }
        }
      }
      next = { ...next, combat: { ...next.combat, turn: next.combat.turn + 1 } }
      return next
    })
  }, [])

  const dive = useCallback(() => {
    setState(prev => {
      let next = skPerformDive(prev)
      if (next.combat.enemy && next.combat.enemy.currentHp <= 0) {
        const enemyDef = _skEnemyAt(prev)
        if (enemyDef) {
          next = skAddXp(next, enemyDef.xpReward)
          next = skAddDivinity(next, enemyDef.divinityReward)
          next = skAddGold(next, enemyDef.xpReward * 2)
          next = { ...next, stats: { ...next.stats, totalKills: next.stats.totalKills + 1 } }
          const { state: achieved } = skCheckAchievements(next)
          next = achieved
        }
      } else {
        next = skEnemyTurn(next)
        if (next.player.hp <= 0) {
          next = { ...next, combat: { ...next.combat, active: false, combatLost: true } }
        }
      }
      next = { ...next, combat: { ...next.combat, turn: next.combat.turn + 1 } }
      return next
    })
  }, [])

  const shieldBash = useCallback(() => {
    setState(prev => {
      let next = skPerformShieldBash(prev)
      next = skEnemyTurn(next)
      if (next.player.hp <= 0) {
        next = { ...next, combat: { ...next.combat, active: false, combatLost: true } }
      }
      next = { ...next, combat: { ...next.combat, turn: next.combat.turn + 1 } }
      return next
    })
  }, [])

  const ascend = useCallback((amount: number) => {
    setState(prev => skAdjustAltitude(prev, Math.abs(amount)))
  }, [])

  const descend = useCallback((amount: number) => {
    setState(prev => skAdjustAltitude(prev, -Math.abs(amount)))
  }, [])

  const updateStreak = useCallback((date: string) => {
    setState(prev => skUpdateStreak(prev, date))
  }, [])

  return {
    state,
    set,
    reset,
    clone,
    addXp,
    setClass,
    setWings,
    selectWarrior,
    removeWarrior,
    equip,
    unequip,
    swoop,
    dive,
    shieldBash,
    ascend,
    descend,
    updateStreak,
  }
}
