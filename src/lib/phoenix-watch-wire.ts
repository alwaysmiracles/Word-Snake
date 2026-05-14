import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Phoenix Watch (Fire Guardian Theme) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// 8 phoenix types defend 10 watchtowers against waves of enemies. Phoenixes level
// 1-50 with a rebirth mechanic (5 rebirths). Collect 20 feather collectibles, earn
// 15 achievements, and complete daily patrol challenges.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Storage Key ─────────────────────────────────────────────────────────────

const PW_STORAGE_KEY = 'phoenix-watch-state-v1';

// ─── Phoenix Type IDs ────────────────────────────────────────────────────────

const PW_TYPE_CRIMSON_BLAZE = 'crimson_blaze';
const PW_TYPE_GOLDEN_DAWN = 'golden_dawn';
const PW_TYPE_AZURE_FROST = 'azure_frost';
const PW_TYPE_EMERALD_LIFE = 'emerald_life';
const PW_TYPE_SHADOW_FLAME = 'shadow_flame';
const PW_TYPE_CELESTIAL_STAR = 'celestial_star';
const PW_TYPE_VOID_EMBER = 'void_ember';
const PW_TYPE_PRISMATIC_WING = 'prismatic_wing';

// ─── Rarity Tier IDs ─────────────────────────────────────────────────────────

const PW_RARITY_COMMON = 'common';
const PW_RARITY_UNCOMMON = 'uncommon';
const PW_RARITY_RARE = 'rare';
const PW_RARITY_EPIC = 'epic';
const PW_RARITY_LEGENDARY = 'legendary';

// ─── Enemy Type IDs ──────────────────────────────────────────────────────────

const PW_ENEMY_ASH_WRAITH = 'ash_wraith';
const PW_ENEMY_FROST_DRAKE = 'frost_drake';
const PW_ENEMY_SHADOW_SPIDER = 'shadow_spider';
const PW_ENEMY_STORM_ELEMENTAL = 'storm_elemental';
const PW_ENEMY_VOID_WALKER = 'void_walker';
const PW_ENEMY_BONE_COLOSSUS = 'bone_colossus';
const PW_ENEMY_CHAOS_DEMON = 'chaos_demon';
const PW_ENEMY_DRAGON_LORD = 'dragon_lord';

// ─── Tower IDs ───────────────────────────────────────────────────────────────

const PW_TOWER_DAWN_SPIRE = 'dawn_spire';
const PW_TOWER_EMBER_GATE = 'ember_gate';
const PW_TOWER_FROST_KEEP = 'frost_keep';
const PW_TOWER_VERDANT_WATCH = 'verdant_watch';
const PW_TOWER_SHADOW_BASTION = 'shadow_bastion';
const PW_TOWER_STAR_CITADEL = 'star_citadel';
const PW_TOWER_VOID_PINNACLE = 'void_pinnacle';
const PW_TOWER_PRISM_TOWER = 'prism_tower';
const PW_TOWER_PHOENIX_NEST = 'phoenix_nest';
const PW_TOWER_ETERNAL_FLAME = 'eternal_flame';

// ─── Achievement IDs ─────────────────────────────────────────────────────────

const PW_ACH_FIRST_FLAME = 'first_flame';
const PW_ACH_TOWER_MASTER = 'tower_master';
const PW_ACH_WAVE_CLEARER = 'wave_clearer';
const PW_ACH_LEVEL_TEN = 'level_ten';
const PW_ACH_LEVEL_TWENTY_FIVE = 'level_twenty_five';
const PW_ACH_LEVEL_FIFTY = 'level_fifty';
const PW_ACH_FIRST_REBIRTH = 'first_rebirth';
const PW_ACH_FIVE_REBIRTHS = 'five_rebirths';
const PW_ACH_FEATHER_HUNTER = 'feather_hunter';
const PW_ACH_DAILY_PATROL = 'daily_patrol';
const PW_ACH_BOSS_SLAYER = 'boss_slayer';
const PW_ACH_ELITE_GUARDIAN = 'elite_guardian';
const PW_ACH_NO_DAMAGE_WAVE = 'no_damage_wave';
const PW_ACH_ALL_TOWERS = 'all_towers_defended';
const PW_ACH_COLLECTOR = 'collector';

// ═══════════════════════════════════════════════════════════════════════════════
// Type Definitions
// ═══════════════════════════════════════════════════════════════════════════════

type PwRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type PwPhoenixTypeId =
  | 'crimson_blaze'
  | 'golden_dawn'
  | 'azure_frost'
  | 'emerald_life'
  | 'shadow_flame'
  | 'celestial_star'
  | 'void_ember'
  | 'prismatic_wing';

type PwEnemyTypeId =
  | 'ash_wraith'
  | 'frost_drake'
  | 'shadow_spider'
  | 'storm_elemental'
  | 'void_walker'
  | 'bone_colossus'
  | 'chaos_demon'
  | 'dragon_lord';

type PwTowerId =
  | 'dawn_spire'
  | 'ember_gate'
  | 'frost_keep'
  | 'verdant_watch'
  | 'shadow_bastion'
  | 'star_citadel'
  | 'void_pinnacle'
  | 'prism_tower'
  | 'phoenix_nest'
  | 'eternal_flame';

type PwAchievementId =
  | 'first_flame'
  | 'tower_master'
  | 'wave_clearer'
  | 'level_ten'
  | 'level_twenty_five'
  | 'level_fifty'
  | 'first_rebirth'
  | 'five_rebirths'
  | 'feather_hunter'
  | 'daily_patrol'
  | 'boss_slayer'
  | 'elite_guardian'
  | 'no_damage_wave'
  | 'all_towers_defended'
  | 'collector';

type PwCombatPhase = 'player_turn' | 'enemy_turn' | 'wave_complete' | 'battle_over';

interface PwPhoenixStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  special: number;
  critChance: number;
  critMultiplier: number;
  dodgeChance: number;
}

interface PwPhoenixTypeDefinition {
  id: PwPhoenixTypeId;
  name: string;
  nameZh: string;
  description: string;
  lore: string;
  icon: string;
  element: string;
  baseStats: PwPhoenixStats;
  growthPerLevel: PwPhoenixStats;
  specialAbility: string;
  specialAbilityZh: string;
  specialAbilityDescription: string;
  color: string;
  resistElement: string;
  weakElement: string;
}

interface PwActivePhoenix {
  typeId: PwPhoenixTypeId;
  level: number;
  xp: number;
  xpToNext: number;
  rebirthCount: number;
  totalRebirths: number;
  currentStats: PwPhoenixStats;
  rebirthBonuses: PwPhoenixStats;
  isActive: boolean;
  nickname: string;
  feathersCollected: number;
  towersDefended: number;
  totalKills: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  highestWave: number;
  daysPatrolled: number;
  patrolStreak: number;
  unlocked: boolean;
  selectedForBattle: boolean;
}

interface PwTowerDefinition {
  id: PwTowerId;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  defenseBonus: number;
  attackBonus: number;
  maxLevel: number;
  element: string;
  position: number;
}

interface PwTowerState {
  level: number;
  currentHp: number;
  maxHp: number;
  isDefended: boolean;
  totalWavesDefended: number;
  isUnlocked: boolean;
  wasAttacked: boolean;
  tookDamageThisWave: boolean;
}

interface PwEnemyDefinition {
  id: PwEnemyTypeId;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  xpReward: number;
  featherDropChance: number;
  isBoss: boolean;
  element: string;
  specialAbility: string;
  waveMin: number;
}

interface PwActiveEnemy {
  typeId: PwEnemyTypeId;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  isBoss: boolean;
  statusEffects: PwStatusEffect[];
  turnsAlive: number;
}

interface PwStatusEffect {
  id: string;
  name: string;
  type: 'burn' | 'freeze' | 'poison' | 'stun' | 'shield' | 'regen' | 'weakness' | 'vulnerability';
  duration: number;
  value: number;
  sourcePhoenix: PwPhoenixTypeId;
}

interface PwFeatherDefinition {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  rarity: PwRarity;
  bonusType: 'hp' | 'attack' | 'defense' | 'speed' | 'special' | 'crit' | 'dodge' | 'xp' | 'rebirth';
  bonusValue: number;
  sourceEnemy: PwEnemyTypeId | null;
  requiredWave: number;
}

interface PwFeatherCollection {
  featherId: string;
  quantity: number;
  isNew: boolean;
}

interface PwAchievementDefinition {
  id: PwAchievementId;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  rewardXp: number;
  condition: string;
}

interface PwWaveState {
  waveNumber: number;
  enemies: PwActiveEnemy[];
  turnNumber: number;
  phase: PwCombatPhase;
  battleLog: PwBattleLogEntry[];
  totalDamageDealt: number;
  totalDamageTaken: number;
  phoenixHpBeforeWave: number;
  towersDamagedThisWave: string[];
  isVictory: boolean;
  isDefeat: boolean;
}

interface PwBattleLogEntry {
  turn: number;
  actor: 'phoenix' | 'enemy' | 'system';
  message: string;
  damage?: number;
  heal?: number;
  isCrit?: boolean;
  enemyName?: string;
  phoenixName?: string;
  statusApplied?: string;
}

interface PwDailyPatrol {
  date: string;
  isCompleted: boolean;
  challengeType: 'kill_enemies' | 'defend_tower' | 'survive_waves' | 'boss_rush' | 'no_damage';
  targetValue: number;
  currentValue: number;
  rewardXp: number;
  rewardFeatherId: string | null;
  towerId: PwTowerId | null;
  startTime: number | null;
}

interface PwRebirthRecord {
  rebirthNumber: number;
  timestamp: number;
  previousLevel: number;
  previousKills: number;
  bonusGranted: PwPhoenixStats;
}

interface PwStats {
  totalKills: number;
  totalWavesCleared: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  totalXpEarned: number;
  totalFeathersCollected: number;
  totalRebirths: number;
  totalDaysPatrolled: number;
  totalBossKills: number;
  totalTowersUnlocked: number;
  totalAchievements: number;
  highestWave: number;
  totalPlayTime: number;
  criticalHitsLanded: number;
  timesDodged: number;
  perfectWaves: number;
  towersLost: number;
  enemiesDefeatedBySpecial: number;
}

interface PwPhoenixWatchState {
  phoenixes: Record<PwPhoenixTypeId, PwActivePhoenix>;
  towers: Record<PwTowerId, PwTowerState>;
  feathers: PwFeatherCollection[];
  achievements: string[];
  currentWave: PwWaveState | null;
  activePhoenixId: PwPhoenixTypeId | null;
  activeTowerId: PwTowerId | null;
  dailyPatrol: PwDailyPatrol | null;
  rebirthHistory: PwRebirthRecord[];
  stats: PwStats;
  isInBattle: boolean;
  battleCount: number;
  globalTurnCount: number;
  lastSaveTimestamp: number;
  createdAt: number;
  eventLog: PwEventLogEntry[];
}

interface PwEventLogEntry {
  id: string;
  type: 'battle' | 'level_up' | 'rebirth' | 'achievement' | 'feather' | 'patrol' | 'tower';
  message: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Phoenix Type Definitions (8 types)
// ═══════════════════════════════════════════════════════════════════════════════

const PW_PHOENIX_TYPES: PwPhoenixTypeDefinition[] = [
  {
    id: PW_TYPE_CRIMSON_BLAZE,
    name: 'Crimson Blaze',
    nameZh: '赤焰凤凰',
    description: 'A blazing phoenix wreathed in crimson flames, specializing in devastating fire attacks',
    lore: 'Born from the heart of an ancient volcano, the Crimson Blaze feeds on battle fury to grow ever stronger. Its feathers burn with an inner fire that never dims.',
    icon: '🔥',
    element: 'fire',
    baseStats: {
      hp: 120, maxHp: 120, attack: 18, defense: 8, speed: 14,
      special: 15, critChance: 0.12, critMultiplier: 1.8, dodgeChance: 0.08,
    },
    growthPerLevel: {
      hp: 12, maxHp: 12, attack: 3, defense: 1, speed: 1,
      special: 2, critChance: 0.004, critMultiplier: 0.01, dodgeChance: 0.002,
    },
    specialAbility: 'Inferno Blast',
    specialAbilityZh: '炼狱冲击',
    specialAbilityDescription: 'Deals massive fire damage to all enemies, applying burn for 3 turns',
    color: '#DC2626',
    resistElement: 'fire',
    weakElement: 'ice',
  },
  {
    id: PW_TYPE_GOLDEN_DAWN,
    name: 'Golden Dawn',
    nameZh: '金黎凤凰',
    description: 'A radiant phoenix of healing light that restores HP and purifies status effects',
    lore: 'The Golden Dawn rises at the first light of each morning, carrying the promise of renewal. Its tears can mend even the most grievous wounds.',
    icon: '🌅',
    element: 'holy',
    baseStats: {
      hp: 150, maxHp: 150, attack: 10, defense: 12, speed: 10,
      special: 20, critChance: 0.06, critMultiplier: 1.5, dodgeChance: 0.06,
    },
    growthPerLevel: {
      hp: 15, maxHp: 15, attack: 1, defense: 2, speed: 1,
      special: 3, critChance: 0.002, critMultiplier: 0.005, dodgeChance: 0.002,
    },
    specialAbility: 'Dawn Renewal',
    specialAbilityZh: '黎明新生',
    specialAbilityDescription: 'Heals the phoenix for 40% of max HP and removes all negative status effects',
    color: '#EAB308',
    resistElement: 'holy',
    weakElement: 'shadow',
  },
  {
    id: PW_TYPE_AZURE_FROST,
    name: 'Azure Frost',
    nameZh: '苍蓝凤凰',
    description: 'An ice phoenix with superior defense that freezes enemies in their tracks',
    lore: 'The Azure Frost dwells in the highest peaks where no warmth can reach. Its breath can freeze entire armies in a single exhalation.',
    icon: '❄️',
    element: 'ice',
    baseStats: {
      hp: 140, maxHp: 140, attack: 12, defense: 18, speed: 8,
      special: 14, critChance: 0.08, critMultiplier: 1.6, dodgeChance: 0.1,
    },
    growthPerLevel: {
      hp: 14, maxHp: 14, attack: 2, defense: 3, speed: 1,
      special: 2, critChance: 0.003, critMultiplier: 0.008, dodgeChance: 0.003,
    },
    specialAbility: 'Glacial Prison',
    specialAbilityZh: '冰牢禁锢',
    specialAbilityDescription: 'Freezes all enemies for 2 turns, reducing their defense by 50%',
    color: '#2563EB',
    resistElement: 'ice',
    weakElement: 'fire',
  },
  {
    id: PW_TYPE_EMERALD_LIFE,
    name: 'Emerald Life',
    nameZh: '翡翠凤凰',
    description: 'A nature phoenix with regenerative powers that grows stronger each turn',
    lore: 'Rooted deep in the World Tree, the Emerald Life draws vitality from the earth itself. Each battle makes it hardier than before.',
    icon: '🌿',
    element: 'nature',
    baseStats: {
      hp: 160, maxHp: 160, attack: 11, defense: 10, speed: 12,
      special: 16, critChance: 0.07, critMultiplier: 1.5, dodgeChance: 0.07,
    },
    growthPerLevel: {
      hp: 16, maxHp: 16, attack: 2, defense: 2, speed: 1,
      special: 2, critChance: 0.002, critMultiplier: 0.005, dodgeChance: 0.002,
    },
    specialAbility: 'Verdant Bloom',
    specialAbilityZh: '翠绿绽放',
    specialAbilityDescription: 'Regenerates 8% max HP per turn for 5 turns and gains +5 attack per turn',
    color: '#16A34A',
    resistElement: 'nature',
    weakElement: 'fire',
  },
  {
    id: PW_TYPE_SHADOW_FLAME,
    name: 'Shadow Flame',
    nameZh: '影焰凤凰',
    description: 'A stealthy phoenix that strikes from darkness with devastating critical hits',
    lore: 'Neither fully flame nor fully shadow, the Shadow Flame exists in the spaces between. Its victims never see the blow that fells them.',
    icon: '🌑',
    element: 'shadow',
    baseStats: {
      hp: 100, maxHp: 100, attack: 20, defense: 6, speed: 20,
      special: 12, critChance: 0.25, critMultiplier: 2.2, dodgeChance: 0.18,
    },
    growthPerLevel: {
      hp: 10, maxHp: 10, attack: 4, defense: 1, speed: 2,
      special: 2, critChance: 0.006, critMultiplier: 0.015, dodgeChance: 0.005,
    },
    specialAbility: 'Phantom Strike',
    specialAbilityZh: '幻影打击',
    specialAbilityDescription: 'A guaranteed critical hit that ignores 80% of enemy defense',
    color: '#7C3AED',
    resistElement: 'shadow',
    weakElement: 'holy',
  },
  {
    id: PW_TYPE_CELESTIAL_STAR,
    name: 'Celestial Star',
    nameZh: '星辰凤凰',
    description: 'A cosmic phoenix with devastating AOE abilities that rain starlight on foes',
    lore: 'Born from collapsing stars, the Celestial Star carries the weight of galaxies within its wings. When it unleashes its power, constellations rearrange.',
    icon: '⭐',
    element: 'cosmic',
    baseStats: {
      hp: 110, maxHp: 110, attack: 22, defense: 7, speed: 12,
      special: 18, critChance: 0.1, critMultiplier: 1.7, dodgeChance: 0.08,
    },
    growthPerLevel: {
      hp: 11, maxHp: 11, attack: 3, defense: 1, speed: 1,
      special: 3, critChance: 0.003, critMultiplier: 0.008, dodgeChance: 0.002,
    },
    specialAbility: 'Starfall',
    specialAbilityZh: '星陨',
    specialAbilityDescription: 'Calls down a barrage of stars dealing AOE damage equal to 200% special',
    color: '#D946EF',
    resistElement: 'cosmic',
    weakElement: 'void',
  },
  {
    id: PW_TYPE_VOID_EMBER,
    name: 'Void Ember',
    nameZh: '虚空凤凰',
    description: 'A dark phoenix that devours enemy power and turns it against them',
    lore: 'The Void Ember is what remains when a star is consumed by the abyss. It feeds on the strength of its foes, growing mightier as they weaken.',
    icon: '🌀',
    element: 'void',
    baseStats: {
      hp: 105, maxHp: 105, attack: 16, defense: 9, speed: 16,
      special: 19, critChance: 0.14, critMultiplier: 2.0, dodgeChance: 0.12,
    },
    growthPerLevel: {
      hp: 11, maxHp: 11, attack: 3, defense: 1, speed: 2,
      special: 3, critChance: 0.005, critMultiplier: 0.01, dodgeChance: 0.003,
    },
    specialAbility: 'Devour Soul',
    specialAbilityZh: '灵魂吞噬',
    specialAbilityDescription: 'Drains 30% of enemy HP, healing self and reducing enemy attack by 20%',
    color: '#1E1B4B',
    resistElement: 'void',
    weakElement: 'cosmic',
  },
  {
    id: PW_TYPE_PRISMATIC_WING,
    name: 'Prismatic Wing',
    nameZh: '彩翼凤凰',
    description: 'A balanced all-rounder phoenix that adapts its element to counter enemies',
    lore: 'The rarest of all phoenixes, the Prismatic Wing reflects every element at once. It is said to be the perfected form all phoenixes aspire to become.',
    icon: '🌈',
    element: 'all',
    baseStats: {
      hp: 130, maxHp: 130, attack: 15, defense: 13, speed: 14,
      special: 15, critChance: 0.1, critMultiplier: 1.7, dodgeChance: 0.1,
    },
    growthPerLevel: {
      hp: 13, maxHp: 13, attack: 2, defense: 2, speed: 1,
      special: 2, critChance: 0.003, critMultiplier: 0.008, dodgeChance: 0.003,
    },
    specialAbility: 'Prismatic Shift',
    specialAbilityZh: '棱镜变换',
    specialAbilityDescription: 'Changes element to resist the strongest enemy and gains 30% stat boost',
    color: '#F59E0B',
    resistElement: 'all',
    weakElement: 'none',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Watchtower Definitions (10 towers)
// ═══════════════════════════════════════════════════════════════════════════════

const PW_TOWERS: PwTowerDefinition[] = [
  {
    id: PW_TOWER_DAWN_SPIRE,
    name: 'Dawn Spire',
    nameZh: '黎明尖塔',
    description: 'The easternmost watchtower, first to greet the morning sun and first to spot approaching threats',
    icon: '🗼',
    defenseBonus: 10,
    attackBonus: 5,
    maxLevel: 10,
    element: 'holy',
    position: 1,
  },
  {
    id: PW_TOWER_EMBER_GATE,
    name: 'Ember Gate',
    nameZh: '余烬之门',
    description: 'A fortified gate stoked by eternal flames that incinerates enemies on approach',
    icon: '🔥',
    defenseBonus: 8,
    attackBonus: 12,
    maxLevel: 10,
    element: 'fire',
    position: 2,
  },
  {
    id: PW_TOWER_FROST_KEEP,
    name: 'Frost Keep',
    nameZh: '霜寒堡垒',
    description: 'An ice-encased fortress that slows all enemies within its aura of freezing cold',
    icon: '🏰',
    defenseBonus: 15,
    attackBonus: 5,
    maxLevel: 10,
    element: 'ice',
    position: 3,
  },
  {
    id: PW_TOWER_VERDANT_WATCH,
    name: 'Verdant Watch',
    nameZh: '翠绿守望',
    description: 'A living tower of ancient vines that regenerates its defenses and heals allies',
    icon: '🌳',
    defenseBonus: 12,
    attackBonus: 6,
    maxLevel: 10,
    element: 'nature',
    position: 4,
  },
  {
    id: PW_TOWER_SHADOW_BASTION,
    name: 'Shadow Bastion',
    nameZh: '暗影堡垒',
    description: 'A nearly invisible fortress hidden in perpetual twilight, striking unseen',
    icon: '🏰',
    defenseBonus: 8,
    attackBonus: 14,
    maxLevel: 10,
    element: 'shadow',
    position: 5,
  },
  {
    id: PW_TOWER_STAR_CITADEL,
    name: 'Star Citadel',
    nameZh: '星辰堡垒',
    description: 'A citadel powered by starlight that amplifies all phoenix abilities within range',
    icon: '⭐',
    defenseBonus: 10,
    attackBonus: 10,
    maxLevel: 10,
    element: 'cosmic',
    position: 6,
  },
  {
    id: PW_TOWER_VOID_PINNACLE,
    name: 'Void Pinnacle',
    nameZh: '虚空峰',
    description: 'A tower that exists partially in the void, making it impossible for enemies to target directly',
    icon: '🌀',
    defenseBonus: 14,
    attackBonus: 8,
    maxLevel: 10,
    element: 'void',
    position: 7,
  },
  {
    id: PW_TOWER_PRISM_TOWER,
    name: 'Prism Tower',
    nameZh: '棱镜塔',
    description: 'A tower of pure crystal that refracts attacks into harmless light, adapting to any threat',
    icon: '💎',
    defenseBonus: 12,
    attackBonus: 10,
    maxLevel: 10,
    element: 'all',
    position: 8,
  },
  {
    id: PW_TOWER_PHOENIX_NEST,
    name: 'Phoenix Nest',
    nameZh: '凤凰之巢',
    description: 'The sacred heart of the watch where phoenixes rest and draw their greatest strength',
    icon: '🪹',
    defenseBonus: 16,
    attackBonus: 12,
    maxLevel: 10,
    element: 'fire',
    position: 9,
  },
  {
    id: PW_TOWER_ETERNAL_FLAME,
    name: 'Eternal Flame',
    nameZh: '永恒之火',
    description: 'The ultimate defense: a pillar of undying flame that has never been extinguished',
    icon: '🕯️',
    defenseBonus: 20,
    attackBonus: 15,
    maxLevel: 10,
    element: 'fire',
    position: 10,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Enemy Definitions (8 enemy types)
// ═══════════════════════════════════════════════════════════════════════════════

const PW_ENEMIES: PwEnemyDefinition[] = [
  {
    id: PW_ENEMY_ASH_WRAITH,
    name: 'Ash Wraith',
    nameZh: '灰烬怨灵',
    description: 'A ghostly apparition formed from the cremated remains of fallen warriors',
    icon: '👻',
    baseHp: 40,
    baseAttack: 8,
    baseDefense: 3,
    baseSpeed: 12,
    xpReward: 15,
    featherDropChance: 0.08,
    isBoss: false,
    element: 'shadow',
    specialAbility: 'Ash Suffocate',
    waveMin: 1,
  },
  {
    id: PW_ENEMY_FROST_DRAKE,
    name: 'Frost Drake',
    nameZh: '霜龙',
    description: 'A lesser dragon of ice that freezes its prey before shattering them to pieces',
    icon: '🐉',
    baseHp: 60,
    baseAttack: 12,
    baseDefense: 8,
    baseSpeed: 8,
    xpReward: 25,
    featherDropChance: 0.1,
    isBoss: false,
    element: 'ice',
    specialAbility: 'Frost Breath',
    waveMin: 1,
  },
  {
    id: PW_ENEMY_SHADOW_SPIDER,
    name: 'Shadow Spider',
    nameZh: '暗影蜘蛛',
    description: 'A massive arachnid that spins webs of solid darkness to trap its victims',
    icon: '🕷️',
    baseHp: 35,
    baseAttack: 14,
    baseDefense: 4,
    baseSpeed: 16,
    xpReward: 20,
    featherDropChance: 0.09,
    isBoss: false,
    element: 'shadow',
    specialAbility: 'Web Trap',
    waveMin: 1,
  },
  {
    id: PW_ENEMY_STORM_ELEMENTAL,
    name: 'Storm Elemental',
    nameZh: '风暴元素',
    description: 'A being of pure lightning and wind that moves with terrifying speed',
    icon: '⛈️',
    baseHp: 50,
    baseAttack: 16,
    baseDefense: 5,
    baseSpeed: 18,
    xpReward: 30,
    featherDropChance: 0.12,
    isBoss: false,
    element: 'cosmic',
    specialAbility: 'Lightning Strike',
    waveMin: 3,
  },
  {
    id: PW_ENEMY_VOID_WALKER,
    name: 'Void Walker',
    nameZh: '虚空行者',
    description: 'A creature from the space between dimensions that phases through defenses',
    icon: '🕳️',
    baseHp: 55,
    baseAttack: 15,
    baseDefense: 7,
    baseSpeed: 14,
    xpReward: 35,
    featherDropChance: 0.14,
    isBoss: false,
    element: 'void',
    specialAbility: 'Dimensional Rift',
    waveMin: 5,
  },
  {
    id: PW_ENEMY_BONE_COLOSSUS,
    name: 'Bone Colossus',
    nameZh: '骸骨巨像',
    description: 'An enormous construct of fused bones from ancient battlefields',
    icon: '💀',
    baseHp: 120,
    baseAttack: 10,
    baseDefense: 20,
    baseSpeed: 4,
    xpReward: 45,
    featherDropChance: 0.16,
    isBoss: false,
    element: 'nature',
    specialAbility: 'Bone Shield',
    waveMin: 7,
  },
  {
    id: PW_ENEMY_CHAOS_DEMON,
    name: 'Chaos Demon',
    nameZh: '混沌恶魔',
    description: 'A demon lord of pure chaos whose attacks are utterly unpredictable',
    icon: '😈',
    baseHp: 80,
    baseAttack: 22,
    baseDefense: 10,
    baseSpeed: 12,
    xpReward: 55,
    featherDropChance: 0.18,
    isBoss: false,
    element: 'shadow',
    specialAbility: 'Chaos Burst',
    waveMin: 10,
  },
  {
    id: PW_ENEMY_DRAGON_LORD,
    name: 'Dragon Lord',
    nameZh: '龙领主',
    description: 'The supreme ruler of all dragonkin, a boss of devastating power',
    icon: '🐲',
    baseHp: 300,
    baseAttack: 30,
    baseDefense: 18,
    baseSpeed: 10,
    xpReward: 150,
    featherDropChance: 0.5,
    isBoss: true,
    element: 'fire',
    specialAbility: 'Apocalypse Roar',
    waveMin: 15,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Feather Collectibles (20 feathers across 5 rarity tiers)
// ═══════════════════════════════════════════════════════════════════════════════

const PW_FEATHERS: PwFeatherDefinition[] = [
  // Common (6)
  {
    id: 'feather_01', name: 'Smoldering Pinion', nameZh: '烟翎',
    description: 'A slightly charred feather still radiating gentle warmth',
    icon: '🪶', rarity: 'common', bonusType: 'attack', bonusValue: 2,
    sourceEnemy: PW_ENEMY_ASH_WRAITH, requiredWave: 1,
  },
  {
    id: 'feather_02', name: 'Frosty Down', nameZh: '霜绒',
    description: 'Soft downy feathers that are cold to the touch but never melt',
    icon: '🪶', rarity: 'common', bonusType: 'defense', bonusValue: 2,
    sourceEnemy: PW_ENEMY_FROST_DRAKE, requiredWave: 1,
  },
  {
    id: 'feather_03', name: 'Silk Thread Feather', nameZh: '丝线羽',
    description: 'A delicate feather woven from spider silk and shadow',
    icon: '🪶', rarity: 'common', bonusType: 'speed', bonusValue: 2,
    sourceEnemy: PW_ENEMY_SHADOW_SPIDER, requiredWave: 1,
  },
  {
    id: 'feather_04', name: 'Static Plume', nameZh: '静电羽',
    description: 'A feather crackling with captured lightning from a storm',
    icon: '🪶', rarity: 'common', bonusType: 'crit', bonusValue: 0.02,
    sourceEnemy: PW_ENEMY_STORM_ELEMENTAL, requiredWave: 3,
  },
  {
    id: 'feather_05', name: 'Ember Heart', nameZh: '余烬之心',
    description: 'The core feather of a phoenix, pulsing with life force',
    icon: '🪶', rarity: 'common', bonusType: 'hp', bonusValue: 10,
    sourceEnemy: null, requiredWave: 1,
  },
  {
    id: 'feather_06', name: 'Dust Mote', nameZh: '尘粒羽',
    description: 'A tiny feather fragment that somehow boosts awareness',
    icon: '🪶', rarity: 'common', bonusType: 'dodge', bonusValue: 0.02,
    sourceEnemy: null, requiredWave: 2,
  },
  // Uncommon (5)
  {
    id: 'feather_07', name: 'Blaze Wing Shard', nameZh: '烈焰翼片',
    description: 'A shard of wing membrane burning with fierce determination',
    icon: '🪶', rarity: 'uncommon', bonusType: 'attack', bonusValue: 5,
    sourceEnemy: PW_ENEMY_ASH_WRAITH, requiredWave: 5,
  },
  {
    id: 'feather_08', name: 'Glacial Crest', nameZh: '冰川冠羽',
    description: 'A majestic crest feather from a frost drake, razor sharp',
    icon: '🪶', rarity: 'uncommon', bonusType: 'defense', bonusValue: 5,
    sourceEnemy: PW_ENEMY_FROST_DRAKE, requiredWave: 5,
  },
  {
    id: 'feather_09', name: 'Shadow Silk Feather', nameZh: '暗影丝羽',
    description: 'A feather woven from living shadow that enhances reflexes',
    icon: '🪶', rarity: 'uncommon', bonusType: 'speed', bonusValue: 4,
    sourceEnemy: PW_ENEMY_SHADOW_SPIDER, requiredWave: 5,
  },
  {
    id: 'feather_10', name: 'Lightning Quill', nameZh: '闪电翎',
    description: 'A quill that crackles with electric power, boosting critical strikes',
    icon: '🪶', rarity: 'uncommon', bonusType: 'crit', bonusValue: 0.05,
    sourceEnemy: PW_ENEMY_STORM_ELEMENTAL, requiredWave: 6,
  },
  {
    id: 'feather_11', name: 'Verdant Pinion', nameZh: '翠翎',
    description: 'A living feather that photosynthesizes and regenerates its owner',
    icon: '🪶', rarity: 'uncommon', bonusType: 'hp', bonusValue: 25,
    sourceEnemy: null, requiredWave: 4,
  },
  // Rare (4)
  {
    id: 'feather_12', name: 'Void Essence Plume', nameZh: '虚空精华翎',
    description: 'A feather that pulses with interdimensional energy',
    icon: '🪶', rarity: 'rare', bonusType: 'special', bonusValue: 8,
    sourceEnemy: PW_ENEMY_VOID_WALKER, requiredWave: 8,
  },
  {
    id: 'feather_13', name: 'Bone Circuit Feather', nameZh: '骨电路羽',
    description: 'A feather etched with ancient bone runes of power',
    icon: '🪶', rarity: 'rare', bonusType: 'defense', bonusValue: 10,
    sourceEnemy: PW_ENEMY_BONE_COLOSSUS, requiredWave: 10,
  },
  {
    id: 'feather_14', name: 'Chaos Flare', nameZh: '混沌火花',
    description: 'An unpredictable feather that sometimes doubles attack power',
    icon: '🪶', rarity: 'rare', bonusType: 'attack', bonusValue: 12,
    sourceEnemy: PW_ENEMY_CHAOS_DEMON, requiredWave: 12,
  },
  {
    id: 'feather_15', name: 'Storm Crown Pinion', nameZh: '暴风冠翎',
    description: 'A crown feather that commands the fury of tempests',
    icon: '🪶', rarity: 'rare', bonusType: 'speed', bonusValue: 8,
    sourceEnemy: PW_ENEMY_STORM_ELEMENTAL, requiredWave: 9,
  },
  // Epic (3)
  {
    id: 'feather_16', name: 'Dragon Scale Plume', nameZh: '龙鳞翎',
    description: 'A feather armored with dragon scales, nearly impervious to harm',
    icon: '🪶', rarity: 'epic', bonusType: 'defense', bonusValue: 20,
    sourceEnemy: PW_ENEMY_DRAGON_LORD, requiredWave: 15,
  },
  {
    id: 'feather_17', name: 'Phoenix Soul Feather', nameZh: '凤凰魂羽',
    description: 'Contains a fragment of phoenix soul, granting rebirth power',
    icon: '🪶', rarity: 'epic', bonusType: 'rebirth', bonusValue: 1,
    sourceEnemy: null, requiredWave: 12,
  },
  {
    id: 'feather_18', name: 'Void Singularity Down', nameZh: '虚空奇点绒',
    description: 'Down from a void phoenix that distorts space-time around the bearer',
    icon: '🪶', rarity: 'epic', bonusType: 'special', bonusValue: 18,
    sourceEnemy: PW_ENEMY_VOID_WALKER, requiredWave: 14,
  },
  // Legendary (2)
  {
    id: 'feather_19', name: 'Eternal Flame Crest', nameZh: '永恒之火冠羽',
    description: 'The most powerful offensive feather — it burns with the first fire ever created',
    icon: '🪶', rarity: 'legendary', bonusType: 'attack', bonusValue: 30,
    sourceEnemy: PW_ENEMY_DRAGON_LORD, requiredWave: 20,
  },
  {
    id: 'feather_20', name: 'Cosmic Origin Plume', nameZh: '宇宙起源翎',
    description: 'A feather from the cosmic phoenix origin — grants mastery over all elements',
    icon: '🪶', rarity: 'legendary', bonusType: 'xp', bonusValue: 50,
    sourceEnemy: PW_ENEMY_DRAGON_LORD, requiredWave: 25,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Achievement Definitions (15 achievements)
// ═══════════════════════════════════════════════════════════════════════════════

const PW_ACHIEVEMENTS: PwAchievementDefinition[] = [
  {
    id: PW_ACH_FIRST_FLAME,
    name: 'First Flame',
    nameZh: '初焰',
    description: 'Defeat your first enemy in battle',
    icon: '🔥',
    rewardXp: 50,
    condition: 'first_kill',
  },
  {
    id: PW_ACH_TOWER_MASTER,
    name: 'Tower Master',
    nameZh: '塔主',
    description: 'Upgrade any tower to its maximum level',
    icon: '🏰',
    rewardXp: 200,
    condition: 'tower_max_level',
  },
  {
    id: PW_ACH_WAVE_CLEARER,
    name: 'Wave Clearer',
    nameZh: '清波者',
    description: 'Successfully clear 10 waves in a single battle session',
    icon: '🌊',
    rewardXp: 150,
    condition: 'clear_10_waves',
  },
  {
    id: PW_ACH_LEVEL_TEN,
    name: 'Rising Phoenix',
    nameZh: '升腾凤凰',
    description: 'Reach level 10 with any phoenix',
    icon: '⬆️',
    rewardXp: 100,
    condition: 'reach_level_10',
  },
  {
    id: PW_ACH_LEVEL_TWENTY_FIVE,
    name: 'Seasoned Guardian',
    nameZh: '资深守护者',
    description: 'Reach level 25 with any phoenix',
    icon: '🛡️',
    rewardXp: 300,
    condition: 'reach_level_25',
  },
  {
    id: PW_ACH_LEVEL_FIFTY,
    name: 'Apex Flame',
    nameZh: '巅峰烈焰',
    description: 'Reach the maximum level of 50 with any phoenix',
    icon: '👑',
    rewardXp: 500,
    condition: 'reach_level_50',
  },
  {
    id: PW_ACH_FIRST_REBIRTH,
    name: 'Born Again',
    nameZh: '再次降生',
    description: 'Perform your first phoenix rebirth',
    icon: '🐣',
    rewardXp: 250,
    condition: 'first_rebirth',
  },
  {
    id: PW_ACH_FIVE_REBIRTHS,
    name: 'Eternal Cycle',
    nameZh: '永恒轮回',
    description: 'Complete all 5 rebirths with any phoenix',
    icon: '♾️',
    rewardXp: 1000,
    condition: 'five_rebirths',
  },
  {
    id: PW_ACH_FEATHER_HUNTER,
    name: 'Feather Hunter',
    nameZh: '羽毛猎人',
    description: 'Collect 10 different types of feathers',
    icon: '🪶',
    rewardXp: 200,
    condition: 'collect_10_feathers',
  },
  {
    id: PW_ACH_DAILY_PATROL,
    name: 'Dutiful Guardian',
    nameZh: '尽责守护者',
    description: 'Complete 7 daily patrol challenges',
    icon: '📋',
    rewardXp: 300,
    condition: 'complete_7_patrols',
  },
  {
    id: PW_ACH_BOSS_SLAYER,
    name: 'Boss Slayer',
    nameZh: '首领杀手',
    description: 'Defeat the Dragon Lord boss enemy',
    icon: '🐲',
    rewardXp: 400,
    condition: 'defeat_dragon_lord',
  },
  {
    id: PW_ACH_ELITE_GUARDIAN,
    name: 'Elite Guardian',
    nameZh: '精英守护者',
    description: 'Defend all 10 watchtowers at least once',
    icon: '🏅',
    rewardXp: 350,
    condition: 'defend_all_towers',
  },
  {
    id: PW_ACH_NO_DAMAGE_WAVE,
    name: 'Untouchable',
    nameZh: '无法触碰',
    description: 'Clear a wave without taking any damage',
    icon: '✨',
    rewardXp: 250,
    condition: 'no_damage_wave',
  },
  {
    id: PW_ACH_ALL_TOWERS,
    name: 'Grand Architect',
    nameZh: '大建筑师',
    description: 'Unlock all 10 watchtowers',
    icon: '🏗️',
    rewardXp: 500,
    condition: 'unlock_all_towers',
  },
  {
    id: PW_ACH_COLLECTOR,
    name: 'Master Collector',
    nameZh: '收藏大师',
    description: 'Collect all 20 feather types',
    icon: '🏆',
    rewardXp: 1000,
    condition: 'collect_all_feathers',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Utility & Helper Functions (internal, not exported)
// ═══════════════════════════════════════════════════════════════════════════════

function pwGenerateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

function pwCreateEmptyStats(): PwPhoenixStats {
  return {
    hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0,
    special: 0, critChance: 0, critMultiplier: 1, dodgeChance: 0,
  };
}

function pwCreateEmptyPhoenixStats(): PwPhoenixStats {
  return {
    hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0,
    special: 0, critChance: 0, critMultiplier: 1, dodgeChance: 0,
  };
}

function pwCreatePhoenix(typeDef: PwPhoenixTypeDefinition): PwActivePhoenix {
  return {
    typeId: typeDef.id,
    level: 1,
    xp: 0,
    xpToNext: pwGetXpForLevel(2),
    rebirthCount: 0,
    totalRebirths: 0,
    currentStats: { ...typeDef.baseStats },
    rebirthBonuses: pwCreateEmptyPhoenixStats(),
    isActive: typeDef.id === PW_TYPE_CRIMSON_BLAZE,
    nickname: '',
    feathersCollected: 0,
    towersDefended: 0,
    totalKills: 0,
    totalDamageDealt: 0,
    totalDamageTaken: 0,
    highestWave: 0,
    daysPatrolled: 0,
    patrolStreak: 0,
    unlocked: typeDef.id === PW_TYPE_CRIMSON_BLAZE,
    selectedForBattle: false,
  };
}

function pwGetXpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5) + 20 * level);
}

function pwCalculatePhoenixStats(
  typeDef: PwPhoenixTypeDefinition,
  level: number,
  rebirthCount: number,
  featherBonuses: PwPhoenixStats,
): PwPhoenixStats {
  const rebirthMultiplier = 1 + rebirthCount * 0.15;
  const stats: PwPhoenixStats = {
    hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0,
    special: 0, critChance: 0, critMultiplier: 1, dodgeChance: 0,
  };

  for (let i = 1; i <= level; i++) {
    stats.hp += typeDef.baseStats.hp + (i - 1) * typeDef.growthPerLevel.hp;
    stats.maxHp += typeDef.baseStats.maxHp + (i - 1) * typeDef.growthPerLevel.maxHp;
    stats.attack += typeDef.baseStats.attack + (i - 1) * typeDef.growthPerLevel.attack;
    stats.defense += typeDef.baseStats.defense + (i - 1) * typeDef.growthPerLevel.defense;
    stats.speed += typeDef.baseStats.speed + (i - 1) * typeDef.growthPerLevel.speed;
    stats.special += typeDef.baseStats.special + (i - 1) * typeDef.growthPerLevel.special;
  }

  stats.hp = Math.floor(stats.hp * rebirthMultiplier) + featherBonuses.hp;
  stats.maxHp = Math.floor(stats.maxHp * rebirthMultiplier) + featherBonuses.hp;
  stats.attack = Math.floor(stats.attack * rebirthMultiplier) + featherBonuses.attack;
  stats.defense = Math.floor(stats.defense * rebirthMultiplier) + featherBonuses.defense;
  stats.speed = Math.floor(stats.speed * rebirthMultiplier) + featherBonuses.speed;
  stats.special = Math.floor(stats.special * rebirthMultiplier) + featherBonuses.special;
  stats.critChance = Math.min(
    typeDef.baseStats.critChance + (level - 1) * typeDef.growthPerLevel.critChance + featherBonuses.critChance,
    0.75,
  );
  stats.critMultiplier = typeDef.baseStats.critMultiplier + (level - 1) * typeDef.growthPerLevel.critMultiplier + featherBonuses.critMultiplier;
  stats.dodgeChance = Math.min(
    typeDef.baseStats.dodgeChance + (level - 1) * typeDef.growthPerLevel.dodgeChance + featherBonuses.dodgeChance,
    0.4,
  );

  return stats;
}

function pwCreateTowerState(towerDef: PwTowerDefinition, index: number): PwTowerState {
  return {
    level: 1,
    currentHp: 100 + index * 20,
    maxHp: 100 + index * 20,
    isDefended: false,
    totalWavesDefended: 0,
    isUnlocked: index < 3,
    wasAttacked: false,
    tookDamageThisWave: false,
  };
}

function pwCreateInitialState(): PwPhoenixWatchState {
  const phoenixes: Record<PwPhoenixTypeId, PwActivePhoenix> = {} as Record<PwPhoenixTypeId, PwActivePhoenix>;
  for (const pt of PW_PHOENIX_TYPES) {
    phoenixes[pt.id] = pwCreatePhoenix(pt);
  }

  const towers: Record<PwTowerId, PwTowerState> = {} as Record<PwTowerId, PwTowerState>;
  for (let i = 0; i < PW_TOWERS.length; i++) {
    towers[PW_TOWERS[i].id] = pwCreateTowerState(PW_TOWERS[i], i);
  }

  return {
    phoenixes,
    towers,
    feathers: [],
    achievements: [],
    currentWave: null,
    activePhoenixId: PW_TYPE_CRIMSON_BLAZE,
    activeTowerId: PW_TOWER_DAWN_SPIRE,
    dailyPatrol: null,
    rebirthHistory: [],
    stats: {
      totalKills: 0,
      totalWavesCleared: 0,
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      totalXpEarned: 0,
      totalFeathersCollected: 0,
      totalRebirths: 0,
      totalDaysPatrolled: 0,
      totalBossKills: 0,
      totalTowersUnlocked: 0,
      totalAchievements: 0,
      highestWave: 0,
      totalPlayTime: 0,
      criticalHitsLanded: 0,
      timesDodged: 0,
      perfectWaves: 0,
      towersLost: 0,
      enemiesDefeatedBySpecial: 0,
    },
    isInBattle: false,
    battleCount: 0,
    globalTurnCount: 0,
    lastSaveTimestamp: Date.now(),
    createdAt: Date.now(),
    eventLog: [],
  };
}

function pwLoadFromStorage(): PwPhoenixWatchState {
  if (typeof window === 'undefined') {
    return pwCreateInitialState();
  }
  try {
    const raw = localStorage.getItem(PW_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as PwPhoenixWatchState;
      return parsed;
    }
  } catch {
    // Silently fail and return initial state
  }
  return pwCreateInitialState();
}

function pwSaveToStorage(state: PwPhoenixWatchState): void {
  if (typeof window === 'undefined') return;
  try {
    const toSave: PwPhoenixWatchState = {
      ...state,
      lastSaveTimestamp: Date.now(),
    };
    localStorage.setItem(PW_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Silently fail on storage errors
  }
}

function pwCalculateFeatherBonuses(feathers: PwFeatherCollection[]): PwPhoenixStats {
  const bonuses = pwCreateEmptyPhoenixStats();
  const uniqueFeathers = new Set(feathers.filter(f => f.quantity > 0).map(f => f.featherId));

  const uniqueFeatherIds = Array.from(uniqueFeathers);
  for (const featherId of uniqueFeatherIds) {
    const def = PW_FEATHERS.find(f => f.id === featherId);
    if (!def) continue;
    const collection = feathers.find(f => f.featherId === featherId);
    const count = collection ? collection.quantity : 0;

    switch (def.bonusType) {
      case 'hp':
        bonuses.hp += def.bonusValue * count;
        bonuses.maxHp += def.bonusValue * count;
        break;
      case 'attack':
        bonuses.attack += def.bonusValue * count;
        break;
      case 'defense':
        bonuses.defense += def.bonusValue * count;
        break;
      case 'speed':
        bonuses.speed += def.bonusValue * count;
        break;
      case 'special':
        bonuses.special += def.bonusValue * count;
        break;
      case 'crit':
        bonuses.critChance += def.bonusValue * count;
        break;
      case 'dodge':
        bonuses.dodgeChance += def.bonusValue * count;
        break;
      default:
        break;
    }
  }

  return bonuses;
}

function pwGetEnemiesForWave(waveNumber: number): PwActiveEnemy[] {
  const availableEnemies = PW_ENEMIES.filter(e => e.waveMin <= waveNumber && !e.isBoss);
  const bossEnemy = PW_ENEMIES.find(e => e.isBoss && e.waveMin <= waveNumber);
  const enemyCount = Math.min(2 + Math.floor(waveNumber / 3), 6);
  const waveScale = 1 + (waveNumber - 1) * 0.12;
  const enemies: PwActiveEnemy[] = [];

  for (let i = 0; i < enemyCount; i++) {
    const template = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    const scaledHp = Math.floor(template.baseHp * waveScale * (1 + Math.random() * 0.2));
    enemies.push({
      typeId: template.id,
      currentHp: scaledHp,
      maxHp: scaledHp,
      attack: Math.floor(template.baseAttack * waveScale * (1 + Math.random() * 0.15)),
      defense: Math.floor(template.baseDefense * waveScale * (1 + Math.random() * 0.1)),
      speed: Math.floor(template.baseSpeed * (1 + Math.random() * 0.1)),
      isBoss: false,
      statusEffects: [],
      turnsAlive: 0,
    });
  }

  if (bossEnemy && waveNumber % 5 === 0) {
    const bossScale = waveScale * 1.5;
    enemies.push({
      typeId: bossEnemy.id,
      currentHp: Math.floor(bossEnemy.baseHp * bossScale),
      maxHp: Math.floor(bossEnemy.baseHp * bossScale),
      attack: Math.floor(bossEnemy.baseAttack * bossScale),
      defense: Math.floor(bossEnemy.baseDefense * bossScale),
      speed: Math.floor(bossEnemy.baseSpeed * (1 + Math.random() * 0.1)),
      isBoss: true,
      statusEffects: [],
      turnsAlive: 0,
    });
  }

  return enemies;
}

function pwGetTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function pwGenerateDailyPatrol(): PwDailyPatrol {
  const challengeTypes: Array<'kill_enemies' | 'defend_tower' | 'survive_waves' | 'boss_rush' | 'no_damage'> = [
    'kill_enemies', 'defend_tower', 'survive_waves', 'boss_rush', 'no_damage',
  ];
  const type = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
  const availableTowers = PW_TOWERS.map(t => t.id);
  const randomTower = availableTowers[Math.floor(Math.random() * availableTowers.length)] as PwTowerId;
  const availableFeathers = PW_FEATHERS.filter(f => f.rarity !== 'legendary');
  const randomFeather = availableFeathers.length > 0
    ? availableFeathers[Math.floor(Math.random() * availableFeathers.length)].id
    : null;

  let targetValue = 5;
  let rewardXp = 100;

  switch (type) {
    case 'kill_enemies':
      targetValue = 5 + Math.floor(Math.random() * 10);
      rewardXp = 80 + targetValue * 5;
      break;
    case 'defend_tower':
      targetValue = 3 + Math.floor(Math.random() * 5);
      rewardXp = 100 + targetValue * 10;
      break;
    case 'survive_waves':
      targetValue = 3 + Math.floor(Math.random() * 7);
      rewardXp = 120 + targetValue * 15;
      break;
    case 'boss_rush':
      targetValue = 1 + Math.floor(Math.random() * 3);
      rewardXp = 200 + targetValue * 50;
      break;
    case 'no_damage':
      targetValue = 1 + Math.floor(Math.random() * 3);
      rewardXp = 150 + targetValue * 40;
      break;
  }

  return {
    date: pwGetTodayDateString(),
    isCompleted: false,
    challengeType: type,
    targetValue,
    currentValue: 0,
    rewardXp,
    rewardFeatherId: randomFeather,
    towerId: type === 'defend_tower' ? randomTower : null,
    startTime: null,
  };
}

function pwRecalculatePhoenixStats(
  state: PwPhoenixWatchState,
  phoenixId: PwPhoenixTypeId,
): PwActivePhoenix {
  const phoenix = state.phoenixes[phoenixId];
  const typeDef = PW_PHOENIX_TYPES.find(t => t.id === phoenixId);
  if (!typeDef) return phoenix;

  const featherBonuses = pwCalculateFeatherBonuses(state.feathers);
  const newStats = pwCalculatePhoenixStats(typeDef, phoenix.level, phoenix.rebirthCount, featherBonuses);

  return {
    ...phoenix,
    currentStats: newStats,
  };
}

function pwCheckAndGrantAchievements(state: PwPhoenixWatchState): { state: PwPhoenixWatchState; newAchievements: string[] } {
  const newAchievements: string[] = [];
  const updatedAchievements = [...state.achievements];

  const activePhoenix = state.activePhoenixId ? state.phoenixes[state.activePhoenixId] : null;
  const hasAchievement = (id: string) => updatedAchievements.includes(id);

  // First Flame — first kill
  if (!hasAchievement(PW_ACH_FIRST_FLAME) && state.stats.totalKills >= 1) {
    newAchievements.push(PW_ACH_FIRST_FLAME);
    updatedAchievements.push(PW_ACH_FIRST_FLAME);
  }

  // Level 10
  if (!hasAchievement(PW_ACH_LEVEL_TEN) && activePhoenix && activePhoenix.level >= 10) {
    newAchievements.push(PW_ACH_LEVEL_TEN);
    updatedAchievements.push(PW_ACH_LEVEL_TEN);
  }

  // Level 25
  if (!hasAchievement(PW_ACH_LEVEL_TWENTY_FIVE) && activePhoenix && activePhoenix.level >= 25) {
    newAchievements.push(PW_ACH_LEVEL_TWENTY_FIVE);
    updatedAchievements.push(PW_ACH_LEVEL_TWENTY_FIVE);
  }

  // Level 50
  if (!hasAchievement(PW_ACH_LEVEL_FIFTY) && activePhoenix && activePhoenix.level >= 50) {
    newAchievements.push(PW_ACH_LEVEL_FIFTY);
    updatedAchievements.push(PW_ACH_LEVEL_FIFTY);
  }

  // First rebirth
  if (!hasAchievement(PW_ACH_FIRST_REBIRTH) && state.stats.totalRebirths >= 1) {
    newAchievements.push(PW_ACH_FIRST_REBIRTH);
    updatedAchievements.push(PW_ACH_FIRST_REBIRTH);
  }

  // Five rebirths
  if (!hasAchievement(PW_ACH_FIVE_REBIRTHS) && state.stats.totalRebirths >= 5) {
    newAchievements.push(PW_ACH_FIVE_REBIRTHS);
    updatedAchievements.push(PW_ACH_FIVE_REBIRTHS);
  }

  // Wave clearer — 10 waves
  if (!hasAchievement(PW_ACH_WAVE_CLEARER) && state.stats.totalWavesCleared >= 10) {
    newAchievements.push(PW_ACH_WAVE_CLEARER);
    updatedAchievements.push(PW_ACH_WAVE_CLEARER);
  }

  // Feather hunter — 10 types
  const uniqueFeathers = state.feathers.filter(f => f.quantity > 0).length;
  if (!hasAchievement(PW_ACH_FEATHER_HUNTER) && uniqueFeathers >= 10) {
    newAchievements.push(PW_ACH_FEATHER_HUNTER);
    updatedAchievements.push(PW_ACH_FEATHER_HUNTER);
  }

  // Daily patrol — 7 completed
  if (!hasAchievement(PW_ACH_DAILY_PATROL) && state.stats.totalDaysPatrolled >= 7) {
    newAchievements.push(PW_ACH_DAILY_PATROL);
    updatedAchievements.push(PW_ACH_DAILY_PATROL);
  }

  // Boss slayer
  if (!hasAchievement(PW_ACH_BOSS_SLAYER) && state.stats.totalBossKills >= 1) {
    newAchievements.push(PW_ACH_BOSS_SLAYER);
    updatedAchievements.push(PW_ACH_BOSS_SLAYER);
  }

  // Elite guardian — defend all towers
  const defendedTowers = Object.values(state.towers).filter(t => t.totalWavesDefended > 0).length;
  if (!hasAchievement(PW_ACH_ELITE_GUARDIAN) && defendedTowers >= 10) {
    newAchievements.push(PW_ACH_ELITE_GUARDIAN);
    updatedAchievements.push(PW_ACH_ELITE_GUARDIAN);
  }

  // No damage wave
  if (!hasAchievement(PW_ACH_NO_DAMAGE_WAVE) && state.stats.perfectWaves >= 1) {
    newAchievements.push(PW_ACH_NO_DAMAGE_WAVE);
    updatedAchievements.push(PW_ACH_NO_DAMAGE_WAVE);
  }

  // All towers unlocked
  const unlockedTowers = Object.values(state.towers).filter(t => t.isUnlocked).length;
  if (!hasAchievement(PW_ACH_ALL_TOWERS) && unlockedTowers >= 10) {
    newAchievements.push(PW_ACH_ALL_TOWERS);
    updatedAchievements.push(PW_ACH_ALL_TOWERS);
  }

  // Collector — all 20 feathers
  if (!hasAchievement(PW_ACH_COLLECTOR) && uniqueFeathers >= 20) {
    newAchievements.push(PW_ACH_COLLECTOR);
    updatedAchievements.push(PW_ACH_COLLECTOR);
  }

  // Tower master — any tower at max level
  const maxLevelTower = Object.values(state.towers).find(t => t.level >= t.maxHp);
  if (!hasAchievement(PW_ACH_TOWER_MASTER) && Object.values(state.towers).some(t => t.level >= 10)) {
    newAchievements.push(PW_ACH_TOWER_MASTER);
    updatedAchievements.push(PW_ACH_TOWER_MASTER);
  }

  // Calculate total XP from new achievements
  let totalRewardXp = 0;
  for (const achId of newAchievements) {
    const achDef = PW_ACHIEVEMENTS.find(a => a.id === achId);
    if (achDef) totalRewardXp += achDef.rewardXp;
  }

  const newEventLogEntries: PwEventLogEntry[] = newAchievements.map(id => {
    const achDef = PW_ACHIEVEMENTS.find(a => a.id === id);
    return {
      id: pwGenerateId(),
      type: 'achievement' as const,
      message: `Achievement unlocked: ${achDef ? achDef.name : id}`,
      timestamp: Date.now(),
    };
  });

  return {
    state: {
      ...state,
      achievements: updatedAchievements,
      stats: {
        ...state.stats,
        totalAchievements: updatedAchievements.length,
        totalXpEarned: state.stats.totalXpEarned + totalRewardXp,
      },
      eventLog: [...state.eventLog.slice(-199), ...newEventLogEntries],
    },
    newAchievements,
  };
}

function pwAddXpToPhoenix(
  state: PwPhoenixWatchState,
  phoenixId: PwPhoenixTypeId,
  rawXp: number,
): PwPhoenixWatchState {
  const phoenix = state.phoenixes[phoenixId];
  if (!phoenix) return state;

  const rebirthXpMultiplier = 1 + phoenix.rebirthCount * 0.25;
  const xpBonusFeathers = state.feathers.filter(f => {
    const def = PW_FEATHERS.find(fd => fd.id === f.featherId);
    return def && def.bonusType === 'xp' && f.quantity > 0;
  });
  let xpBonus = 0;
  for (const f of xpBonusFeathers) {
    const def = PW_FEATHERS.find(fd => fd.id === f.featherId);
    if (def) xpBonus += def.bonusValue * f.quantity;
  }
  const finalXp = Math.floor(rawXp * rebirthXpMultiplier) + xpBonus;

  let newXp = phoenix.xp + finalXp;
  let newLevel = phoenix.level;
  let newXpToNext = phoenix.xpToNext;
  let leveledUp = false;

  while (newXp >= newXpToNext && newLevel < 50) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = pwGetXpForLevel(newLevel + 1);
    leveledUp = true;
  }

  if (newLevel >= 50) {
    newXp = 0;
    newXpToNext = 0;
  }

  const updatedPhoenix: PwActivePhoenix = {
    ...phoenix,
    level: newLevel,
    xp: newXp,
    xpToNext: newXpToNext,
  };

  const updatedPhoenixes = { ...state.phoenixes, [phoenixId]: updatedPhoenix };
  let updatedState: PwPhoenixWatchState = {
    ...state,
    phoenixes: updatedPhoenixes,
    stats: {
      ...state.stats,
      totalXpEarned: state.stats.totalXpEarned + finalXp,
    },
  };

  if (leveledUp) {
    updatedState = {
      ...updatedState,
      phoenixes: {
        ...updatedState.phoenixes,
        [phoenixId]: pwRecalculatePhoenixStats(updatedState, phoenixId),
      },
      eventLog: [
        ...updatedState.eventLog.slice(-199),
        {
          id: pwGenerateId(),
          type: 'level_up' as const,
          message: `${PW_PHOENIX_TYPES.find(p => p.id === phoenixId)?.nameZh ?? phoenixId} reached level ${newLevel}!`,
          timestamp: Date.now(),
        },
      ],
    };

    const achResult = pwCheckAndGrantAchievements(updatedState);
    updatedState = achResult.state;
  }

  return updatedState;
}

function pwProcessStatusEffects(
  enemy: PwActiveEnemy,
  enemyDef: PwEnemyDefinition,
  logEntries: PwBattleLogEntry[],
  turn: number,
): { updatedEnemy: PwActiveEnemy; damageFromEffects: number } {
  let totalDotDamage = 0;
  let updatedEffects = [...enemy.statusEffects];
  const processedEffects: string[] = [];

  for (const effect of updatedEffects) {
    switch (effect.type) {
      case 'burn': {
        const burnDmg = Math.floor(effect.value);
        totalDotDamage += burnDmg;
        processedEffects.push(`burn for ${burnDmg} damage`);
        break;
      }
      case 'poison': {
        const poisonDmg = Math.floor(effect.value);
        totalDotDamage += poisonDmg;
        processedEffects.push(`poison for ${poisonDmg} damage`);
        break;
      }
      case 'freeze': {
        processedEffects.push('frozen (skip turn)');
        break;
      }
      default:
        break;
    }

    const remaining = effect.duration - 1;
    if (remaining <= 0) {
      processedEffects.push(`${effect.name} expired`);
    }
  }

  updatedEffects = updatedEffects
    .map(e => ({ ...e, duration: e.duration - 1 }))
    .filter(e => e.duration > 0);

  if (processedEffects.length > 0) {
    logEntries.push({
      turn,
      actor: 'system',
      message: `${enemyDef.nameZh}: ${processedEffects.join(', ')}`,
      damage: totalDotDamage > 0 ? totalDotDamage : undefined,
    });
  }

  return {
    updatedEnemy: {
      ...enemy,
      currentHp: Math.max(0, enemy.currentHp - totalDotDamage),
      statusEffects: updatedEffects,
    },
    damageFromEffects: totalDotDamage,
  };
}

function pwPerformPhoenixAttack(
  phoenix: PwActivePhoenix,
  enemy: PwActiveEnemy,
  enemyDef: PwEnemyDefinition,
  towerDef: PwTowerDefinition | null,
  logEntries: PwBattleLogEntry[],
  turn: number,
): { updatedEnemy: PwActiveEnemy; damage: number; isCrit: boolean; xpGained: number } {
  const phoenixDef = PW_PHOENIX_TYPES.find(p => p.id === phoenix.typeId);
  if (!phoenixDef) return { updatedEnemy: enemy, damage: 0, isCrit: false, xpGained: 0 };

  const towerAtkBonus = towerDef ? towerDef.attackBonus * Math.floor(towerDef.maxLevel / 2) : 0;
  let totalAttack = phoenix.currentStats.attack + towerAtkBonus;

  // Check vulnerability status
  const hasVulnerability = enemy.statusEffects.some(e => e.type === 'vulnerability');
  if (hasVulnerability) totalAttack = Math.floor(totalAttack * 1.4);

  const hasWeakness = enemy.statusEffects.some(e => e.type === 'weakness');
  if (hasWeakness) totalAttack = Math.floor(totalAttack * 1.3);

  let enemyDefVal = enemy.defense;
  const hasShield = enemy.statusEffects.some(e => e.type === 'shield');
  if (hasShield) enemyDefVal = Math.floor(enemyDefVal * 1.5);

  let isCrit = Math.random() < phoenix.currentStats.critChance;
  let critMult = isCrit ? phoenix.currentStats.critMultiplier : 1;

  let baseDamage = Math.max(1, totalAttack - Math.floor(enemyDefVal * 0.5));
  let finalDamage = Math.floor(baseDamage * critMult);

  // Stunned enemies take double damage
  const isStunned = enemy.statusEffects.some(e => e.type === 'stun');
  if (isStunned) finalDamage = Math.floor(finalDamage * 2);

  // Element advantage check
  if (phoenixDef.resistElement === enemyDef.element) {
    finalDamage = Math.floor(finalDamage * 1.25);
  }
  if (phoenixDef.weakElement === enemyDef.element) {
    finalDamage = Math.floor(finalDamage * 0.75);
  }

  finalDamage = Math.max(1, finalDamage);

  const isFrozen = enemy.statusEffects.some(e => e.type === 'freeze');
  if (isFrozen) finalDamage = Math.floor(finalDamage * 1.3);

  logEntries.push({
    turn,
    actor: 'phoenix',
    message: `${phoenixDef.nameZh} attacks ${enemyDef.nameZh} for ${finalDamage} damage${isCrit ? ' (CRITICAL!)' : ''}`,
    damage: finalDamage,
    isCrit,
    phoenixName: phoenixDef.nameZh,
    enemyName: enemyDef.nameZh,
  });

  const updatedEnemy: PwActiveEnemy = {
    ...enemy,
    currentHp: Math.max(0, enemy.currentHp - finalDamage),
    turnsAlive: enemy.turnsAlive + 1,
  };

  const isKilled = updatedEnemy.currentHp <= 0;
  const xpGained = isKilled ? Math.floor(enemyDef.xpReward * (enemy.isBoss ? 3 : 1)) : 0;

  if (isKilled) {
    logEntries.push({
      turn,
      actor: 'system',
      message: `${enemyDef.nameZh} was defeated!${isKilled ? ` +${xpGained} XP` : ''}`,
      enemyName: enemyDef.nameZh,
    });
  }

  return { updatedEnemy, damage: finalDamage, isCrit, xpGained };
}

function pwPerformEnemyAttack(
  enemy: PwActiveEnemy,
  enemyDef: PwEnemyDefinition,
  phoenix: PwActivePhoenix,
  towerState: PwTowerState | null,
  logEntries: PwBattleLogEntry[],
  turn: number,
): { updatedPhoenix: PwActivePhoenix; updatedTower: PwTowerState | null; damage: number; phoenixDodged: boolean } {
  if (enemy.currentHp <= 0) {
    return { updatedPhoenix: phoenix, updatedTower: towerState, damage: 0, phoenixDodged: false };
  }

  const isFrozen = enemy.statusEffects.some(e => e.type === 'freeze');
  if (isFrozen) {
    logEntries.push({
      turn,
      actor: 'system',
      message: `${enemyDef.nameZh} is frozen and cannot act!`,
      enemyName: enemyDef.nameZh,
    });
    return { updatedPhoenix: phoenix, updatedTower: towerState, damage: 0, phoenixDodged: false };
  }

  const isStunned = enemy.statusEffects.some(e => e.type === 'stun');
  if (isStunned) {
    logEntries.push({
      turn,
      actor: 'system',
      message: `${enemyDef.nameZh} is stunned and cannot act!`,
      enemyName: enemyDef.nameZh,
    });
    return { updatedPhoenix: phoenix, updatedTower: towerState, damage: 0, phoenixDodged: false };
  }

  // Check phoenix dodge
  if (Math.random() < phoenix.currentStats.dodgeChance) {
    logEntries.push({
      turn,
      actor: 'phoenix',
      message: `${PW_PHOENIX_TYPES.find(p => p.id === phoenix.typeId)?.nameZh ?? phoenix.typeId} dodged the attack!`,
      phoenixName: PW_PHOENIX_TYPES.find(p => p.id === phoenix.typeId)?.nameZh,
    });
    return { updatedPhoenix: phoenix, updatedTower: towerState, damage: 0, phoenixDodged: true };
  }

  let enemyAttack = enemy.attack;
  let phoenixDefense = phoenix.currentStats.defense;
  const towerDefBonus = towerState ? PW_TOWERS.find(t => t.id === state_tower_id_for(towerState))?.defenseBonus ?? 0 : 0;
  phoenixDefense += towerDefBonus;

  // Check shield status on phoenix
  const hasShield = phoenix.currentStats.critMultiplier > 2;
  let damageReduction = 1;
  if (hasShield) damageReduction = 0.8;

  const baseDamage = Math.max(1, enemyAttack - Math.floor(phoenixDefense * 0.4));
  const finalDamage = Math.max(1, Math.floor(baseDamage * damageReduction));

  let damageToPhoenix = finalDamage;
  let damageToTower = 0;

  // Tower absorbs some damage
  if (towerState && towerState.currentHp > 0) {
    const towerAbsorb = Math.floor(finalDamage * 0.3);
    damageToPhoenix = finalDamage - towerAbsorb;
    damageToTower = towerAbsorb;
  }

  logEntries.push({
    turn,
    actor: 'enemy',
    message: `${enemyDef.nameZh} attacks for ${finalDamage} damage (${damageToPhoenix} to phoenix, ${damageToTower} to tower)`,
    damage: finalDamage,
    enemyName: enemyDef.nameZh,
  });

  const updatedPhoenix: PwActivePhoenix = {
    ...phoenix,
    currentStats: {
      ...phoenix.currentStats,
      hp: Math.max(0, phoenix.currentStats.hp - damageToPhoenix),
    },
  };

  let updatedTower: PwTowerState | null = null;
  if (towerState && damageToTower > 0) {
    updatedTower = {
      ...towerState,
      currentHp: Math.max(0, towerState.currentHp - damageToTower),
      tookDamageThisWave: true,
    };
  }

  return { updatedPhoenix, updatedTower, damage: finalDamage, phoenixDodged: false };
}

// Dummy placeholder to satisfy TS (the real tower id lookup is done inline)
function state_tower_id_for(towerState: PwTowerState): string {
  const towerKeys = [
    PW_TOWER_DAWN_SPIRE, PW_TOWER_EMBER_GATE, PW_TOWER_FROST_KEEP, PW_TOWER_VERDANT_WATCH,
    PW_TOWER_SHADOW_BASTION, PW_TOWER_STAR_CITADEL, PW_TOWER_VOID_PINNACLE,
    PW_TOWER_PRISM_TOWER, PW_TOWER_PHOENIX_NEST, PW_TOWER_ETERNAL_FLAME,
  ];
  return towerKeys[0];
}

function pwPerformSpecialAbility(
  phoenix: PwActivePhoenix,
  enemies: PwActiveEnemy[],
  logEntries: PwBattleLogEntry[],
  turn: number,
): { updatedEnemies: PwActiveEnemy[]; updatedPhoenix: PwActivePhoenix; specialDamage: number } {
  const phoenixDef = PW_PHOENIX_TYPES.find(p => p.id === phoenix.typeId);
  if (!phoenixDef) return { updatedEnemies: enemies, updatedPhoenix: phoenix, specialDamage: 0 };

  let updatedPhoenix = { ...phoenix };
  let totalSpecialDamage = 0;

  switch (phoenixDef.id) {
    case PW_TYPE_CRIMSON_BLAZE: {
      // Inferno Blast: AOE fire damage + burn
      const updatedEnemies = enemies.map(e => {
        if (e.currentHp <= 0) return e;
        const dmg = Math.floor(updatedPhoenix.currentStats.special * 1.8);
        totalSpecialDamage += dmg;
        logEntries.push({
          turn,
          actor: 'phoenix',
          message: `🔥 Inferno Blast hits ${PW_ENEMIES.find(ed => ed.id === e.typeId)?.nameZh ?? ''} for ${dmg} fire damage!`,
          damage: dmg,
          phoenixName: phoenixDef.nameZh,
        });
        return {
          ...e,
          currentHp: Math.max(0, e.currentHp - dmg),
          statusEffects: [
            ...e.statusEffects.filter(se => se.type !== 'burn'),
            { id: pwGenerateId(), name: 'Burn', type: 'burn' as const, duration: 3, value: updatedPhoenix.currentStats.special * 0.3, sourcePhoenix: phoenixDef.id },
          ],
        };
      });
      return { updatedEnemies, updatedPhoenix, specialDamage: totalSpecialDamage };
    }
    case PW_TYPE_GOLDEN_DAWN: {
      // Dawn Renewal: Heal 40% max HP + remove debuffs
      const healAmount = Math.floor(updatedPhoenix.currentStats.maxHp * 0.4);
      updatedPhoenix = {
        ...updatedPhoenix,
        currentStats: {
          ...updatedPhoenix.currentStats,
          hp: Math.min(updatedPhoenix.currentStats.maxHp, updatedPhoenix.currentStats.hp + healAmount),
        },
      };
      logEntries.push({
        turn,
        actor: 'phoenix',
        message: `🌅 Dawn Renewal heals ${healAmount} HP! All debuffs removed.`,
        heal: healAmount,
        phoenixName: phoenixDef.nameZh,
      });
      return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
    }
    case PW_TYPE_AZURE_FROST: {
      // Glacial Prison: Freeze all + reduce defense
      const updatedEnemies = enemies.map(e => {
        if (e.currentHp <= 0) return e;
        logEntries.push({
          turn,
          actor: 'phoenix',
          message: `❄️ Glacial Prison freezes ${PW_ENEMIES.find(ed => ed.id === e.typeId)?.nameZh ?? ''}!`,
          statusApplied: 'freeze',
          phoenixName: phoenixDef.nameZh,
        });
        return {
          ...e,
          statusEffects: [
            ...e.statusEffects.filter(se => se.type !== 'freeze'),
            { id: pwGenerateId(), name: 'Freeze', type: 'freeze' as const, duration: 2, value: 0, sourcePhoenix: phoenixDef.id },
            { id: pwGenerateId(), name: 'Defense Down', type: 'weakness' as const, duration: 3, value: 10, sourcePhoenix: phoenixDef.id },
          ],
        };
      });
      return { updatedEnemies, updatedPhoenix, specialDamage: 0 };
    }
    case PW_TYPE_EMERALD_LIFE: {
      // Verdant Bloom: Regen buff + attack buff per turn
      const regenValue = Math.floor(updatedPhoenix.currentStats.maxHp * 0.08);
      updatedPhoenix = {
        ...updatedPhoenix,
        currentStats: {
          ...updatedPhoenix.currentStats,
          hp: Math.min(updatedPhoenix.currentStats.maxHp, updatedPhoenix.currentStats.hp + regenValue),
          attack: updatedPhoenix.currentStats.attack + 5,
        },
      };
      logEntries.push({
        turn,
        actor: 'phoenix',
        message: `🌿 Verdant Bloom: +${regenValue} HP, +5 attack! Regeneration active.`,
        heal: regenValue,
        phoenixName: phoenixDef.nameZh,
      });
      return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
    }
    case PW_TYPE_SHADOW_FLAME: {
      // Phantom Strike: Guaranteed crit, ignores 80% defense
      const aliveEnemies = enemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length === 0) return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
      const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
      const effectiveDef = Math.floor(target.defense * 0.2);
      const rawDmg = Math.max(1, updatedPhoenix.currentStats.attack * 2 - effectiveDef);
      const critDmg = Math.floor(rawDmg * updatedPhoenix.currentStats.critMultiplier);
      totalSpecialDamage = critDmg;
      const updatedEnemies = enemies.map(e => {
        if (e.typeId !== target.typeId) return e;
        logEntries.push({
          turn,
          actor: 'phoenix',
          message: `🌑 Phantom Strike critically hits ${PW_ENEMIES.find(ed => ed.id === e.typeId)?.nameZh ?? ''} for ${critDmg} damage!`,
          damage: critDmg,
          isCrit: true,
          phoenixName: phoenixDef.nameZh,
        });
        return { ...e, currentHp: Math.max(0, e.currentHp - critDmg) };
      });
      return { updatedEnemies, updatedPhoenix, specialDamage: totalSpecialDamage };
    }
    case PW_TYPE_CELESTIAL_STAR: {
      // Starfall: AOE 200% special
      const updatedEnemies = enemies.map(e => {
        if (e.currentHp <= 0) return e;
        const dmg = Math.floor(updatedPhoenix.currentStats.special * 2);
        totalSpecialDamage += dmg;
        logEntries.push({
          turn,
          actor: 'phoenix',
          message: `⭐ Starfall hits ${PW_ENEMIES.find(ed => ed.id === e.typeId)?.nameZh ?? ''} for ${dmg} cosmic damage!`,
          damage: dmg,
          phoenixName: phoenixDef.nameZh,
        });
        return { ...e, currentHp: Math.max(0, e.currentHp - dmg) };
      });
      return { updatedEnemies, updatedPhoenix, specialDamage: totalSpecialDamage };
    }
    case PW_TYPE_VOID_EMBER: {
      // Devour Soul: Drain 30% HP, heal self, reduce enemy atk
      const aliveEnemies = enemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length === 0) return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
      const target = aliveEnemies.reduce((a, b) => a.currentHp > b.currentHp ? a : b);
      const drainAmount = Math.floor(target.maxHp * 0.3);
      totalSpecialDamage = drainAmount;
      updatedPhoenix = {
        ...updatedPhoenix,
        currentStats: {
          ...updatedPhoenix.currentStats,
          hp: Math.min(updatedPhoenix.currentStats.maxHp, updatedPhoenix.currentStats.hp + drainAmount),
        },
      };
      const updatedEnemies = enemies.map(e => {
        if (e.typeId !== target.typeId) return e;
        logEntries.push({
          turn,
          actor: 'phoenix',
          message: `🌀 Devour Soul drains ${drainAmount} HP from ${PW_ENEMIES.find(ed => ed.id === e.typeId)?.nameZh ?? ''}!`,
          damage: drainAmount,
          heal: drainAmount,
          phoenixName: phoenixDef.nameZh,
        });
        return {
          ...e,
          currentHp: Math.max(0, e.currentHp - drainAmount),
          attack: Math.floor(e.attack * 0.8),
          statusEffects: [
            ...e.statusEffects,
            { id: pwGenerateId(), name: 'Soul Drain', type: 'weakness' as const, duration: 2, value: 5, sourcePhoenix: phoenixDef.id },
          ],
        };
      });
      return { updatedEnemies, updatedPhoenix, specialDamage: totalSpecialDamage };
    }
    case PW_TYPE_PRISMATIC_WING: {
      // Prismatic Shift: Resist strongest enemy + 30% stat boost
      const aliveEnemies = enemies.filter(e => e.currentHp > 0);
      if (aliveEnemies.length === 0) return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
      const strongest = aliveEnemies.reduce((a, b) => a.attack > b.attack ? a : b);
      const boostFactor = 1.3;
      updatedPhoenix = {
        ...updatedPhoenix,
        currentStats: {
          ...updatedPhoenix.currentStats,
          hp: Math.floor(updatedPhoenix.currentStats.hp * boostFactor),
          maxHp: Math.floor(updatedPhoenix.currentStats.maxHp * boostFactor),
          attack: Math.floor(updatedPhoenix.currentStats.attack * boostFactor),
          defense: Math.floor(updatedPhoenix.currentStats.defense * boostFactor),
          speed: Math.floor(updatedPhoenix.currentStats.speed * boostFactor),
          special: Math.floor(updatedPhoenix.currentStats.special * boostFactor),
        },
      };
      logEntries.push({
        turn,
        actor: 'phoenix',
        message: `🌈 Prismatic Shift: Adapted to counter ${PW_ENEMIES.find(ed => ed.id === strongest.typeId)?.nameZh ?? ''}! All stats +30%!`,
        phoenixName: phoenixDef.nameZh,
      });
      return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
    }
    default:
      return { updatedEnemies: enemies, updatedPhoenix, specialDamage: 0 };
  }
}

function pwHandleFeatherDrop(
  waveNumber: number,
  enemyDef: PwEnemyDefinition,
  isBoss: boolean,
): string | null {
  const eligibleFeathers = PW_FEATHERS.filter(f => f.requiredWave <= waveNumber);
  if (eligibleFeathers.length === 0) return null;

  // Boss enemies have higher feather drop rates
  const dropChance = isBoss ? enemyDef.featherDropChance * 2 : enemyDef.featherDropChance;
  if (Math.random() > dropChance) return null;

  // Weight by rarity
  const weights: number[] = [];
  for (const f of eligibleFeathers) {
    switch (f.rarity) {
      case 'common': weights.push(50); break;
      case 'uncommon': weights.push(25); break;
      case 'rare': weights.push(10); break;
      case 'epic': weights.push(3); break;
      case 'legendary': weights.push(1); break;
      default: weights.push(10);
    }
  }

  // Source enemy preference
  for (let i = 0; i < eligibleFeathers.length; i++) {
    if (eligibleFeathers[i].sourceEnemy === enemyDef.id) {
      weights[i] = Math.floor(weights[i] * 2.5);
    }
  }

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < eligibleFeathers.length; i++) {
    roll -= weights[i];
    if (roll <= 0) return eligibleFeathers[i].id;
  }

  return eligibleFeathers[eligibleFeathers.length - 1].id;
}

function pwAddFeatherToState(state: PwPhoenixWatchState, featherId: string): PwPhoenixWatchState {
  const existingIndex = state.feathers.findIndex(f => f.featherId === featherId);
  let updatedFeathers: PwFeatherCollection[];

  if (existingIndex >= 0) {
    updatedFeathers = [...state.feathers];
    updatedFeathers[existingIndex] = {
      ...updatedFeathers[existingIndex],
      quantity: updatedFeathers[existingIndex].quantity + 1,
    };
  } else {
    updatedFeathers = [...state.feathers, { featherId, quantity: 1, isNew: true }];
  }

  // Recalculate all phoenix stats with new feather
  const updatedPhoenixes = { ...state.phoenixes };
  for (const key of Object.keys(updatedPhoenixes) as PwPhoenixTypeId[]) {
    if (updatedPhoenixes[key].unlocked) {
      const tempState = { ...state, feathers: updatedFeathers };
      updatedPhoenixes[key] = pwRecalculatePhoenixStats(tempState, key);
    }
  }

  const featherDef = PW_FEATHERS.find(f => f.id === featherId);

  return {
    ...state,
    feathers: updatedFeathers,
    phoenixes: updatedPhoenixes,
    stats: {
      ...state.stats,
      totalFeathersCollected: state.stats.totalFeathersCollected + 1,
    },
    eventLog: [
      ...state.eventLog.slice(-199),
      {
        id: pwGenerateId(),
        type: 'feather' as const,
        message: `Feather collected: ${featherDef ? featherDef.nameZh : featherId}!`,
        timestamp: Date.now(),
      },
    ],
  };
}

function pwUpdateDailyPatrolProgress(
  state: PwPhoenixWatchState,
  waveCompleted: boolean,
  enemiesKilled: number,
  bossKilled: boolean,
  tookDamage: boolean,
): PwPhoenixWatchState {
  if (!state.dailyPatrol || state.dailyPatrol.isCompleted) return state;

  const patrol = { ...state.dailyPatrol };
  let newValue = patrol.currentValue;

  switch (patrol.challengeType) {
    case 'kill_enemies':
      newValue += enemiesKilled;
      break;
    case 'defend_tower':
      if (waveCompleted) newValue += 1;
      break;
    case 'survive_waves':
      if (waveCompleted) newValue += 1;
      break;
    case 'boss_rush':
      if (bossKilled) newValue += 1;
      break;
    case 'no_damage':
      if (waveCompleted && !tookDamage) newValue += 1;
      break;
  }

  patrol.currentValue = Math.min(newValue, patrol.targetValue);
  patrol.isCompleted = patrol.currentValue >= patrol.targetValue;

  let updatedState: PwPhoenixWatchState = {
    ...state,
    dailyPatrol: patrol,
  };

  if (patrol.isCompleted) {
    const activePhoenixId = updatedState.activePhoenixId;
    if (activePhoenixId) {
      updatedState = pwAddXpToPhoenix(updatedState, activePhoenixId, patrol.rewardXp);
    }

    if (patrol.rewardFeatherId) {
      updatedState = pwAddFeatherToState(updatedState, patrol.rewardFeatherId);
    }

    updatedState = {
      ...updatedState,
      stats: {
        ...updatedState.stats,
        totalDaysPatrolled: updatedState.stats.totalDaysPatrolled + 1,
      },
      eventLog: [
        ...updatedState.eventLog.slice(-199),
        {
          id: pwGenerateId(),
          type: 'patrol' as const,
          message: `Daily patrol completed! +${patrol.rewardXp} XP${patrol.rewardFeatherId ? ' + feather reward' : ''}`,
          timestamp: Date.now(),
        },
      ],
    };

    const achResult = pwCheckAndGrantAchievements(updatedState);
    updatedState = achResult.state;
  }

  return updatedState;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Exported Helper Functions (pw prefix)
// ═══════════════════════════════════════════════════════════════════════════════

export function pwGetPhoenixType(typeId: PwPhoenixTypeId): PwPhoenixTypeDefinition | undefined {
  return PW_PHOENIX_TYPES.find(p => p.id === typeId);
}

export function pwGetAllPhoenixTypes(): PwPhoenixTypeDefinition[] {
  return [...PW_PHOENIX_TYPES];
}

export function pwGetTower(towerId: PwTowerId): PwTowerDefinition | undefined {
  return PW_TOWERS.find(t => t.id === towerId);
}

export function pwGetAllTowers(): PwTowerDefinition[] {
  return [...PW_TOWERS];
}

export function pwGetEnemy(enemyId: PwEnemyTypeId): PwEnemyDefinition | undefined {
  return PW_ENEMIES.find(e => e.id === enemyId);
}

export function pwGetAllEnemies(): PwEnemyDefinition[] {
  return [...PW_ENEMIES];
}

export function pwGetFeather(featherId: string): PwFeatherDefinition | undefined {
  return PW_FEATHERS.find(f => f.id === featherId);
}

export function pwGetAllFeathers(): PwFeatherDefinition[] {
  return [...PW_FEATHERS];
}

export function pwGetAchievement(achievementId: string): PwAchievementDefinition | undefined {
  return PW_ACHIEVEMENTS.find(a => a.id === achievementId);
}

export function pwGetAllAchievements(): PwAchievementDefinition[] {
  return [...PW_ACHIEVEMENTS];
}

export function pwGetXpRequiredForLevel(level: number): number {
  return pwGetXpForLevel(level);
}

export function pwGetRarityColor(rarity: PwRarity): string {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'uncommon': return '#4ADE80';
    case 'rare': return '#60A5FA';
    case 'epic': return '#C084FC';
    case 'legendary': return '#FFD700';
    default: return '#9CA3AF';
  }
}

export function pwGetRarityLabel(rarity: PwRarity): string {
  switch (rarity) {
    case 'common': return 'Common';
    case 'uncommon': return 'Uncommon';
    case 'rare': return 'Rare';
    case 'epic': return 'Epic';
    case 'legendary': return 'Legendary';
    default: return 'Common';
  }
}

export function pwGetPhoenixTypeName(typeId: PwPhoenixTypeId): string {
  return PW_PHOENIX_TYPES.find(p => p.id === typeId)?.nameZh ?? typeId;
}

export function pwGetTowerName(towerId: PwTowerId): string {
  return PW_TOWERS.find(t => t.id === towerId)?.nameZh ?? towerId;
}

export function pwGetEnemyName(enemyId: PwEnemyTypeId): string {
  return PW_ENEMIES.find(e => e.id === enemyId)?.nameZh ?? enemyId;
}

export function pwGetRebirthMultiplier(rebirthCount: number): number {
  return 1 + rebirthCount * 0.15;
}

export function pwGetMaxRebirths(): number {
  return 5;
}

export function pwGetMaxLevel(): number {
  return 50;
}

export function pwGetMaxTowerLevel(): number {
  return 10;
}

export function pwGetTotalFeatherCount(): number {
  return PW_FEATHERS.length;
}

export function pwGetTotalAchievementCount(): number {
  return PW_ACHIEVEMENTS.length;
}

export function pwGetTotalTowerCount(): number {
  return PW_TOWERS.length;
}

export function pwGetTotalEnemyCount(): number {
  return PW_ENEMIES.length;
}

export function pwGetTotalPhoenixCount(): number {
  return PW_PHOENIX_TYPES.length;
}

export function pwIsElementalAdvantage(phoenixElement: string, enemyElement: string): boolean {
  const advantages: Record<string, string> = {
    fire: 'nature',
    ice: 'fire',
    nature: 'ice',
    shadow: 'holy',
    holy: 'shadow',
    cosmic: 'void',
    void: 'cosmic',
  };
  return advantages[phoenixElement] === enemyElement;
}

export function pwIsElementalDisadvantage(phoenixElement: string, enemyElement: string): boolean {
  const disadvantages: Record<string, string> = {
    fire: 'ice',
    ice: 'nature',
    nature: 'fire',
    shadow: 'cosmic',
    holy: 'void',
    cosmic: 'shadow',
    void: 'holy',
  };
  return disadvantages[phoenixElement] === enemyElement;
}

export function pwCalculateDamageRange(attack: number, defense: number): { min: number; max: number } {
  const base = Math.max(1, attack - Math.floor(defense * 0.5));
  return {
    min: Math.max(1, Math.floor(base * 0.85)),
    max: Math.floor(base * 1.15),
  };
}

export function pwFormatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
}

export function pwGetHpPercentage(currentHp: number, maxHp: number): number {
  if (maxHp <= 0) return 0;
  return Math.floor((currentHp / maxHp) * 100);
}

export function pwGetHpBarColor(percentage: number): string {
  if (percentage > 60) return '#4ADE80';
  if (percentage > 30) return '#FBBF24';
  return '#EF4444';
}

export function pwGetWaveDifficulty(waveNumber: number): 'easy' | 'medium' | 'hard' | 'extreme' | 'boss' {
  if (waveNumber % 5 === 0) return 'boss';
  if (waveNumber <= 3) return 'easy';
  if (waveNumber <= 8) return 'medium';
  if (waveNumber <= 14) return 'hard';
  return 'extreme';
}

export function pwGetWaveDifficultyColor(waveNumber: number): string {
  const difficulty = pwGetWaveDifficulty(waveNumber);
  switch (difficulty) {
    case 'easy': return '#4ADE80';
    case 'medium': return '#FBBF24';
    case 'hard': return '#F97316';
    case 'extreme': return '#EF4444';
    case 'boss': return '#A855F7';
    default: return '#9CA3AF';
  }
}

export function pwGetStatusEffectIcon(effectType: PwStatusEffect['type']): string {
  switch (effectType) {
    case 'burn': return '🔥';
    case 'freeze': return '❄️';
    case 'poison': return '🧪';
    case 'stun': return '💫';
    case 'shield': return '🛡️';
    case 'regen': return '💚';
    case 'weakness': return '📉';
    case 'vulnerability': return '💔';
    default: return '❓';
  }
}

export function pwGetStatusEffectName(effectType: PwStatusEffect['type']): string {
  switch (effectType) {
    case 'burn': return 'Burn';
    case 'freeze': return 'Freeze';
    case 'poison': return 'Poison';
    case 'stun': return 'Stun';
    case 'shield': return 'Shield';
    case 'regen': return 'Regeneration';
    case 'weakness': return 'Weakness';
    case 'vulnerability': return 'Vulnerability';
    default: return 'Unknown';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK — usePhoenixWatch
// ═══════════════════════════════════════════════════════════════════════════════

export default function usePhoenixWatch() {
  // Lazy initializer reads from localStorage
  const [state, setState] = useState<PwPhoenixWatchState>(pwLoadFromStorage);
  // Second useState tracks save version for persistence
  const [saveVersion, setSaveVersion] = useState<number>(0);

  // ─── Persistence Helper ──────────────────────────────────────────────────

  const pwPersist = (newState: PwPhoenixWatchState) => {
    setState(newState);
    pwSaveToStorage(newState);
    setSaveVersion(prev => prev + 1);
  };

  // ─── Action: Select Phoenix ──────────────────────────────────────────────

  const pwSelectPhoenix = (phoenixId: PwPhoenixTypeId): boolean => {
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || !phoenix.unlocked) return false;
    if (state.isInBattle) return false;

    const updatedPhoenixes = { ...state.phoenixes };
    for (const key of Object.keys(updatedPhoenixes) as PwPhoenixTypeId[]) {
      updatedPhoenixes[key] = { ...updatedPhoenixes[key], isActive: key === phoenixId };
    }

    pwPersist({ ...state, phoenixes: updatedPhoenixes, activePhoenixId: phoenixId });
    return true;
  };

  // ─── Action: Unlock Phoenix ──────────────────────────────────────────────

  const pwUnlockPhoenix = (phoenixId: PwPhoenixTypeId): boolean => {
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || phoenix.unlocked) return false;
    if (state.isInBattle) return false;

    const typeIndex = PW_PHOENIX_TYPES.findIndex(p => p.id === phoenixId);
    if (typeIndex <= 0) return false;

    const requiredTotalKills = typeIndex * 20;
    if (state.stats.totalKills < requiredTotalKills) return false;

    const updatedPhoenixes = {
      ...state.phoenixes,
      [phoenixId]: {
        ...phoenix,
        unlocked: true,
        currentStats: pwCalculatePhoenixStats(
          PW_PHOENIX_TYPES.find(p => p.id === phoenixId)!,
          1,
          0,
          pwCalculateFeatherBonuses(state.feathers),
        ),
      },
    };

    const eventEntry: PwEventLogEntry = {
      id: pwGenerateId(),
      type: 'battle',
      message: `New phoenix unlocked: ${PW_PHOENIX_TYPES.find(p => p.id === phoenixId)?.nameZh ?? phoenixId}!`,
      timestamp: Date.now(),
    };

    pwPersist({
      ...state,
      phoenixes: updatedPhoenixes,
      stats: { ...state.stats, totalTowersUnlocked: Object.values(updatedPhoenixes).filter(p => p.unlocked).length },
      eventLog: [...state.eventLog.slice(-199), eventEntry],
    });
    return true;
  };

  // ─── Action: Select Tower for Defense ────────────────────────────────────

  const pwSelectTower = (towerId: PwTowerId): boolean => {
    const tower = state.towers[towerId];
    if (!tower || !tower.isUnlocked) return false;
    if (state.isInBattle) return false;

    pwPersist({ ...state, activeTowerId: towerId });
    return true;
  };

  // ─── Action: Upgrade Tower ───────────────────────────────────────────────

  const pwUpgradeTower = (towerId: PwTowerId): boolean => {
    const tower = state.towers[towerId];
    const towerDef = PW_TOWERS.find(t => t.id === towerId);
    if (!tower || !towerDef || !tower.isUnlocked) return false;
    if (state.isInBattle) return false;
    if (tower.level >= towerDef.maxLevel) return false;

    const upgradeCost = Math.floor(50 * Math.pow(tower.level, 1.5));
    if (state.stats.totalXpEarned < upgradeCost) return false;

    const newLevel = tower.level + 1;
    const hpIncrease = 20 + newLevel * 5;

    const updatedTowers = {
      ...state.towers,
      [towerId]: {
        ...tower,
        level: newLevel,
        maxHp: tower.maxHp + hpIncrease,
        currentHp: tower.currentHp + hpIncrease,
      },
    };

    const eventEntry: PwEventLogEntry = {
      id: pwGenerateId(),
      type: 'tower',
      message: `${towerDef.nameZh} upgraded to level ${newLevel}!`,
      timestamp: Date.now(),
    };

    const newState = {
      ...state,
      towers: updatedTowers,
      eventLog: [...state.eventLog.slice(-199), eventEntry],
    };

    const achResult = pwCheckAndGrantAchievements(newState);
    pwPersist(achResult.state);
    return true;
  };

  // ─── Action: Unlock Tower ────────────────────────────────────────────────

  const pwUnlockTower = (towerId: PwTowerId): boolean => {
    const tower = state.towers[towerId];
    const towerDef = PW_TOWERS.find(t => t.id === towerId);
    if (!tower || !towerDef || tower.isUnlocked) return false;
    if (state.isInBattle) return false;

    const towerIndex = PW_TOWERS.findIndex(t => t.id === towerId);
    const requiredKills = 15 + towerIndex * 25;
    if (state.stats.totalKills < requiredKills) return false;

    const updatedTowers = {
      ...state.towers,
      [towerId]: { ...tower, isUnlocked: true },
    };

    const eventEntry: PwEventLogEntry = {
      id: pwGenerateId(),
      type: 'tower',
      message: `New tower unlocked: ${towerDef.nameZh}!`,
      timestamp: Date.now(),
    };

    const newState = {
      ...state,
      towers: updatedTowers,
      stats: {
        ...state.stats,
        totalTowersUnlocked: Object.values(updatedTowers).filter(t => t.isUnlocked).length,
      },
      eventLog: [...state.eventLog.slice(-199), eventEntry],
    };

    const achResult = pwCheckAndGrantAchievements(newState);
    pwPersist(achResult.state);
    return true;
  };

  // ─── Action: Start Battle ────────────────────────────────────────────────

  const pwStartBattle = (waveNumber?: number): boolean => {
    if (state.isInBattle) return false;
    if (!state.activePhoenixId) return false;

    const phoenix = state.phoenixes[state.activePhoenixId];
    if (!phoenix || !phoenix.unlocked) return false;
    if (phoenix.currentStats.hp <= 0) return false;

    const wave = waveNumber ?? 1;
    const enemies = pwGetEnemiesForWave(wave);

    const waveState: PwWaveState = {
      waveNumber: wave,
      enemies,
      turnNumber: 0,
      phase: 'player_turn',
      battleLog: [{
        turn: 0,
        actor: 'system',
        message: `Wave ${wave} begins! ${enemies.length} enemies approach the ${PW_TOWERS.find(t => t.id === state.activeTowerId)?.nameZh ?? 'tower'}!`,
      }],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      phoenixHpBeforeWave: phoenix.currentStats.hp,
      towersDamagedThisWave: [],
      isVictory: false,
      isDefeat: false,
    };

    pwPersist({
      ...state,
      isInBattle: true,
      currentWave: waveState,
      battleCount: state.battleCount + 1,
    });
    return true;
  };

  // ─── Action: Execute Player Turn (Attack) ────────────────────────────────

  const pwAttackEnemy = (enemyIndex: number): {
    damage: number;
    isCrit: boolean;
    enemyKilled: boolean;
    xpGained: number;
    featherDropped: string | null;
  } => {
    if (!state.currentWave || !state.activePhoenixId) {
      return { damage: 0, isCrit: false, enemyKilled: false, xpGained: 0, featherDropped: null };
    }
    if (state.currentWave.phase !== 'player_turn') {
      return { damage: 0, isCrit: false, enemyKilled: false, xpGained: 0, featherDropped: null };
    }

    const enemy = state.currentWave.enemies[enemyIndex];
    if (!enemy || enemy.currentHp <= 0) {
      return { damage: 0, isCrit: false, enemyKilled: false, xpGained: 0, featherDropped: null };
    }

    const phoenix = state.phoenixes[state.activePhoenixId];
    const enemyDef = PW_ENEMIES.find(e => e.id === enemy.typeId);
    if (!enemyDef) return { damage: 0, isCrit: false, enemyKilled: false, xpGained: 0, featherDropped: null };

    const towerDef = state.activeTowerId ? PW_TOWERS.find(t => t.id === state.activeTowerId) ?? null : null;
    const logEntries = [...state.currentWave.battleLog];
    const turn = state.currentWave.turnNumber + 1;

    const result = pwPerformPhoenixAttack(phoenix, enemy, enemyDef, towerDef, logEntries, turn);
    let updatedEnemies = [...state.currentWave.enemies];
    updatedEnemies[enemyIndex] = result.updatedEnemy;

    let updatedState: PwPhoenixWatchState = state;
    let featherDropped: string | null = null;

    // Check if enemy was killed
    if (result.updatedEnemy.currentHp <= 0) {
      updatedState = pwAddXpToPhoenix(state, state.activePhoenixId, result.xpGained);
      featherDropped = pwHandleFeatherDrop(state.currentWave.waveNumber, enemyDef, enemy.isBoss);

      if (featherDropped) {
        updatedState = pwAddFeatherToState(updatedState, featherDropped);
      }

      // Update stats
      const isBoss = enemy.isBoss;
      updatedState = {
        ...updatedState,
        stats: {
          ...updatedState.stats,
          totalKills: updatedState.stats.totalKills + 1,
          totalDamageDealt: updatedState.stats.totalDamageDealt + result.damage,
          totalBossKills: updatedState.stats.totalBossKills + (isBoss ? 1 : 0),
          criticalHitsLanded: updatedState.stats.criticalHitsLanded + (result.isCrit ? 1 : 0),
        },
      };

      // Check daily patrol progress
      if (isBoss) {
        updatedState = pwUpdateDailyPatrolProgress(updatedState, false, 0, true, false);
      }
    }

    // Check if all enemies are dead
    const allDead = updatedEnemies.every(e => e.currentHp <= 0);

    const updatedWave: PwWaveState = {
      ...state.currentWave,
      enemies: updatedEnemies,
      turnNumber: turn,
      phase: allDead ? 'wave_complete' : 'enemy_turn',
      battleLog: logEntries,
      totalDamageDealt: state.currentWave.totalDamageDealt + result.damage,
    };

    if (allDead) {
      updatedWave.isVictory = true;
      logEntries.push({
        turn,
        actor: 'system',
        message: `Wave ${state.currentWave.waveNumber} cleared! Victory!`,
      });

      const isPerfectWave = updatedWave.totalDamageTaken === 0;
      updatedState = {
        ...updatedState,
        stats: {
          ...updatedState.stats,
          totalWavesCleared: updatedState.stats.totalWavesCleared + 1,
          highestWave: Math.max(updatedState.stats.highestWave, state.currentWave.waveNumber),
          perfectWaves: updatedState.stats.perfectWaves + (isPerfectWave ? 1 : 0),
        },
      };

      // Update tower defended count
      if (state.activeTowerId) {
        const tower = updatedState.towers[state.activeTowerId];
        if (tower) {
          updatedState = {
            ...updatedState,
            towers: {
              ...updatedState.towers,
              [state.activeTowerId]: {
                ...tower,
                totalWavesDefended: tower.totalWavesDefended + 1,
                isDefended: true,
                tookDamageThisWave: false,
              },
            },
          };
        }
      }

      // Daily patrol
      updatedState = pwUpdateDailyPatrolProgress(updatedState, true, 1, false, updatedWave.totalDamageTaken > 0);

      // Check achievements
      const achResult = pwCheckAndGrantAchievements(updatedState);
      updatedState = achResult.state;
    }

    pwPersist({
      ...updatedState,
      currentWave: updatedWave,
    });

    return {
      damage: result.damage,
      isCrit: result.isCrit,
      enemyKilled: result.updatedEnemy.currentHp <= 0,
      xpGained: result.xpGained,
      featherDropped,
    };
  };

  // ─── Action: Execute Player Turn (Special Ability) ───────────────────────

  const pwUseSpecialAbility = (): {
    specialDamage: number;
    enemiesKilled: number;
    xpGained: number;
    healed: number;
  } => {
    if (!state.currentWave || !state.activePhoenixId) {
      return { specialDamage: 0, enemiesKilled: 0, xpGained: 0, healed: 0 };
    }
    if (state.currentWave.phase !== 'player_turn') {
      return { specialDamage: 0, enemiesKilled: 0, xpGained: 0, healed: 0 };
    }

    const phoenix = state.phoenixes[state.activePhoenixId];
    if (!phoenix) return { specialDamage: 0, enemiesKilled: 0, xpGained: 0, healed: 0 };

    const logEntries = [...state.currentWave.battleLog];
    const turn = state.currentWave.turnNumber + 1;

    const result = pwPerformSpecialAbility(phoenix, state.currentWave.enemies, logEntries, turn);
    const healAmount = Math.max(0, result.updatedPhoenix.currentStats.hp - phoenix.currentStats.hp);

    let updatedState: PwPhoenixWatchState = {
      ...state,
      phoenixes: {
        ...state.phoenixes,
        [state.activePhoenixId]: result.updatedPhoenix,
      },
      stats: {
        ...state.stats,
        totalDamageDealt: state.stats.totalDamageDealt + result.specialDamage,
        enemiesDefeatedBySpecial: state.stats.enemiesDefeatedBySpecial + 1,
      },
    };

    // Check for killed enemies
    let enemiesKilled = 0;
    let totalXpGained = 0;
    for (let i = 0; i < result.updatedEnemies.length; i++) {
      const updatedEnemy = result.updatedEnemies[i];
      const originalEnemy = state.currentWave.enemies[i];
      if (originalEnemy.currentHp > 0 && updatedEnemy.currentHp <= 0) {
        enemiesKilled += 1;
        const enemyDef = PW_ENEMIES.find(e => e.id === updatedEnemy.typeId);
        if (enemyDef) {
          const xp = Math.floor(enemyDef.xpReward * (updatedEnemy.isBoss ? 3 : 1));
          totalXpGained += xp;
        }

        // Check feather drops
        const eDef = PW_ENEMIES.find(e => e.id === updatedEnemy.typeId);
        if (eDef) {
          const featherId = pwHandleFeatherDrop(state.currentWave.waveNumber, eDef, updatedEnemy.isBoss);
          if (featherId) {
            updatedState = pwAddFeatherToState(updatedState, featherId);
          }
        }
      }
    }

    if (totalXpGained > 0) {
      updatedState = pwAddXpToPhoenix(updatedState, state.activePhoenixId, totalXpGained);
      updatedState = {
        ...updatedState,
        stats: {
          ...updatedState.stats,
          totalKills: updatedState.stats.totalKills + enemiesKilled,
        },
      };
    }

    // Check all dead
    const allDead = result.updatedEnemies.every(e => e.currentHp <= 0);

    const updatedWave: PwWaveState = {
      ...state.currentWave,
      enemies: result.updatedEnemies,
      turnNumber: turn,
      phase: allDead ? 'wave_complete' : 'enemy_turn',
      battleLog: logEntries,
      totalDamageDealt: state.currentWave.totalDamageDealt + result.specialDamage,
      isVictory: allDead,
    };

    if (allDead) {
      logEntries.push({
        turn,
        actor: 'system',
        message: `Wave ${state.currentWave.waveNumber} cleared by special ability!`,
      });

      if (state.activeTowerId) {
        const tower = updatedState.towers[state.activeTowerId];
        if (tower) {
          updatedState = {
            ...updatedState,
            towers: {
              ...updatedState.towers,
              [state.activeTowerId]: {
                ...tower,
                totalWavesDefended: tower.totalWavesDefended + 1,
                isDefended: true,
              },
            },
            stats: {
              ...updatedState.stats,
              totalWavesCleared: updatedState.stats.totalWavesCleared + 1,
              highestWave: Math.max(updatedState.stats.highestWave, state.currentWave.waveNumber),
            },
          };
        }
      }

      updatedState = pwUpdateDailyPatrolProgress(updatedState, true, enemiesKilled, false, updatedWave.totalDamageTaken > 0);

      const achResult = pwCheckAndGrantAchievements(updatedState);
      updatedState = achResult.state;
    }

    pwPersist({
      ...updatedState,
      currentWave: updatedWave,
    });

    return {
      specialDamage: result.specialDamage,
      enemiesKilled,
      xpGained: totalXpGained,
      healed: healAmount,
    };
  };

  // ─── Action: Execute Enemy Turn ──────────────────────────────────────────

  const pwExecuteEnemyTurn = (): {
    totalDamage: number;
    towerDamage: number;
    phoenixDodged: boolean;
    phoenixHp: number;
  } => {
    if (!state.currentWave || !state.activePhoenixId) {
      return { totalDamage: 0, towerDamage: 0, phoenixDodged: false, phoenixHp: 0 };
    }
    if (state.currentWave.phase !== 'enemy_turn') {
      return { totalDamage: 0, towerDamage: 0, phoenixDodged: false, phoenixHp: 0 };
    }

    const logEntries = [...state.currentWave.battleLog];
    const turn = state.currentWave.turnNumber;
    let totalDamage = 0;
    let totalTowerDamage = 0;
    let phoenixDodged = false;

    let currentPhoenix = state.phoenixes[state.activePhoenixId];
    let currentTowerState: PwTowerState | null = state.activeTowerId ? state.towers[state.activeTowerId] : null;
    let updatedEnemies = [...state.currentWave.enemies];

    // Process status effects on each enemy first
    for (let i = 0; i < updatedEnemies.length; i++) {
      const enemy = updatedEnemies[i];
      if (enemy.currentHp <= 0) continue;

      const enemyDef = PW_ENEMIES.find(e => e.id === enemy.typeId);
      if (!enemyDef) continue;

      const effectResult = pwProcessStatusEffects(enemy, enemyDef, logEntries, turn);
      updatedEnemies[i] = effectResult.updatedEnemy;
      totalDamage += 0; // DOT damage is not "taken" by phoenix
    }

    // Each living enemy attacks the phoenix
    for (const enemy of updatedEnemies) {
      if (enemy.currentHp <= 0) continue;

      const enemyDef = PW_ENEMIES.find(e => e.id === enemy.typeId);
      if (!enemyDef) continue;

      const attackResult = pwPerformEnemyAttack(
        enemy,
        enemyDef,
        currentPhoenix,
        currentTowerState,
        logEntries,
        turn,
      );

      totalDamage += attackResult.damage;
      if (attackResult.updatedTower) {
        totalTowerDamage += attackResult.damage - Math.max(1, attackResult.damage - (attackResult.updatedTower ? Math.floor(attackResult.damage * 0.3) : 0));
      }
      if (attackResult.phoenixDodged) phoenixDodged = true;

      currentPhoenix = attackResult.updatedPhoenix;
      currentTowerState = attackResult.updatedTower;
    }

    // Update stats
    const updatedState: PwPhoenixWatchState = {
      ...state,
      phoenixes: {
        ...state.phoenixes,
        [state.activePhoenixId]: currentPhoenix,
      },
      stats: {
        ...state.stats,
        totalDamageTaken: state.stats.totalDamageTaken + totalDamage,
        timesDodged: state.stats.timesDodged + (phoenixDodged ? 1 : 0),
      },
    };

    // Update tower if it took damage
    let finalState = updatedState;
    if (currentTowerState && state.activeTowerId) {
      finalState = {
        ...finalState,
        towers: {
          ...finalState.towers,
          [state.activeTowerId]: currentTowerState,
        },
      };
    }

    // Check phoenix death
    const isPhoenixDead = currentPhoenix.currentStats.hp <= 0;
    const isTowerDestroyed = currentTowerState ? currentTowerState.currentHp <= 0 : false;

    const updatedWave: PwWaveState = {
      ...state.currentWave,
      enemies: updatedEnemies,
      phase: isPhoenixDead || isTowerDestroyed ? 'battle_over' : 'player_turn',
      battleLog: logEntries,
      totalDamageTaken: state.currentWave.totalDamageTaken + totalDamage,
      isDefeat: isPhoenixDead || isTowerDestroyed,
    };

    if (isPhoenixDead) {
      logEntries.push({
        turn,
        actor: 'system',
        message: `${PW_PHOENIX_TYPES.find(p => p.id === state.activePhoenixId)?.nameZh ?? 'Phoenix'} has fallen! Battle lost!`,
      });
      finalState = {
        ...finalState,
        stats: {
          ...finalState.stats,
          towersLost: finalState.stats.towersLost + (isTowerDestroyed ? 1 : 0),
        },
      };
    }

    if (isTowerDestroyed && !isPhoenixDead) {
      logEntries.push({
        turn,
        actor: 'system',
        message: `${PW_TOWERS.find(t => t.id === state.activeTowerId)?.nameZh ?? 'Tower'} has been destroyed! Battle lost!`,
      });
      finalState = {
        ...finalState,
        stats: {
          ...finalState.stats,
          towersLost: finalState.stats.towersLost + 1,
        },
      };
    }

    pwPersist({
      ...finalState,
      currentWave: updatedWave,
    });

    return {
      totalDamage,
      towerDamage: totalTowerDamage,
      phoenixDodged,
      phoenixHp: currentPhoenix.currentStats.hp,
    };
  };

  // ─── Action: End Battle ──────────────────────────────────────────────────

  const pwEndBattle = (): {
    waveNumber: number;
    wasVictory: boolean;
    totalDamageDealt: number;
    totalDamageTaken: number;
  } => {
    if (!state.currentWave) {
      return { waveNumber: 0, wasVictory: false, totalDamageDealt: 0, totalDamageTaken: 0 };
    }

    const result = {
      waveNumber: state.currentWave.waveNumber,
      wasVictory: state.currentWave.isVictory,
      totalDamageDealt: state.currentWave.totalDamageDealt,
      totalDamageTaken: state.currentWave.totalDamageTaken,
    };

    // Restore phoenix HP on defeat
    let updatedState: PwPhoenixWatchState = {
      ...state,
      isInBattle: false,
      currentWave: null,
    };

    if (!state.currentWave.isVictory && state.activePhoenixId) {
      const phoenix = updatedState.phoenixes[state.activePhoenixId];
      if (phoenix.currentStats.hp <= 0) {
        updatedState = {
          ...updatedState,
          phoenixes: {
            ...updatedState.phoenixes,
            [state.activePhoenixId]: {
              ...phoenix,
              currentStats: {
                ...phoenix.currentStats,
                hp: Math.floor(phoenix.currentStats.maxHp * 0.3),
              },
            },
          },
        };
      }
    }

    // Reset tower damage flags
    if (state.activeTowerId) {
      const tower = updatedState.towers[state.activeTowerId];
      if (tower) {
        updatedState = {
          ...updatedState,
          towers: {
            ...updatedState.towers,
            [state.activeTowerId]: { ...tower, tookDamageThisWave: false, wasAttacked: false },
          },
        };
      }
    }

    pwPersist(updatedState);
    return result;
  };

  // ─── Action: Continue to Next Wave ───────────────────────────────────────

  const pwContinueToNextWave = (): boolean => {
    if (!state.currentWave || !state.currentWave.isVictory) return false;
    if (state.currentWave.phase !== 'wave_complete') return false;

    const nextWaveNumber = state.currentWave.waveNumber + 1;
    const enemies = pwGetEnemiesForWave(nextWaveNumber);
    const phoenix = state.activePhoenixId ? state.phoenixes[state.activePhoenixId] : null;

    const waveState: PwWaveState = {
      waveNumber: nextWaveNumber,
      enemies,
      turnNumber: 0,
      phase: 'player_turn',
      battleLog: [{
        turn: 0,
        actor: 'system',
        message: `Wave ${nextWaveNumber} begins! ${enemies.length} enemies approach!`,
      }],
      totalDamageDealt: 0,
      totalDamageTaken: 0,
      phoenixHpBeforeWave: phoenix ? phoenix.currentStats.hp : 0,
      towersDamagedThisWave: [],
      isVictory: false,
      isDefeat: false,
    };

    pwPersist({ ...state, currentWave: waveState });
    return true;
  };

  // ─── Action: Rebirth Phoenix ─────────────────────────────────────────────

  const pwRebirthPhoenix = (phoenixId: PwPhoenixTypeId): {
    success: boolean;
    rebirthNumber: number;
    bonusStats: PwPhoenixStats;
    message: string;
  } => {
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || !phoenix.unlocked) {
      return { success: false, rebirthNumber: 0, bonusStats: pwCreateEmptyStats(), message: 'Phoenix not unlocked' };
    }
    if (phoenix.level < 50) {
      return { success: false, rebirthNumber: 0, bonusStats: pwCreateEmptyStats(), message: 'Phoenix must be level 50 to rebirth' };
    }
    if (phoenix.rebirthCount >= 5) {
      return { success: false, rebirthNumber: 0, bonusStats: pwCreateEmptyStats(), message: 'Maximum rebirths (5) reached' };
    }
    if (state.isInBattle) {
      return { success: false, rebirthNumber: 0, bonusStats: pwCreateEmptyStats(), message: 'Cannot rebirth during battle' };
    }

    const newRebirthCount = phoenix.rebirthCount + 1;
    const typeDef = PW_PHOENIX_TYPES.find(p => p.id === phoenixId);
    if (!typeDef) return { success: false, rebirthNumber: 0, bonusStats: pwCreateEmptyStats(), message: 'Phoenix type not found' };

    // Calculate rebirth bonuses
    const rebirthBonusPercent = 0.15 + (newRebirthCount - 1) * 0.03;
    const bonusStats: PwPhoenixStats = {
      hp: Math.floor(typeDef.baseStats.hp * rebirthBonusPercent),
      maxHp: Math.floor(typeDef.baseStats.maxHp * rebirthBonusPercent),
      attack: Math.floor(typeDef.baseStats.attack * rebirthBonusPercent),
      defense: Math.floor(typeDef.baseStats.defense * rebirthBonusPercent),
      speed: Math.floor(typeDef.baseStats.speed * rebirthBonusPercent),
      special: Math.floor(typeDef.baseStats.special * rebirthBonusPercent),
      critChance: typeDef.baseStats.critChance * rebirthBonusPercent,
      critMultiplier: typeDef.baseStats.critMultiplier * rebirthBonusPercent * 0.1,
      dodgeChance: typeDef.baseStats.dodgeChance * rebirthBonusPercent,
    };

    const featherBonuses = pwCalculateFeatherBonuses(state.feathers);
    const newStats = pwCalculatePhoenixStats(typeDef, 1, newRebirthCount, featherBonuses);

    const rebirthedPhoenix: PwActivePhoenix = {
      ...phoenix,
      level: 1,
      xp: 0,
      xpToNext: pwGetXpForLevel(2),
      rebirthCount: newRebirthCount,
      currentStats: newStats,
      rebirthBonuses: {
        hp: phoenix.rebirthBonuses.hp + bonusStats.hp,
        maxHp: phoenix.rebirthBonuses.maxHp + bonusStats.maxHp,
        attack: phoenix.rebirthBonuses.attack + bonusStats.attack,
        defense: phoenix.rebirthBonuses.defense + bonusStats.defense,
        speed: phoenix.rebirthBonuses.speed + bonusStats.speed,
        special: phoenix.rebirthBonuses.special + bonusStats.special,
        critChance: phoenix.rebirthBonuses.critChance + bonusStats.critChance,
        critMultiplier: phoenix.rebirthBonuses.critMultiplier + bonusStats.critMultiplier,
        dodgeChance: phoenix.rebirthBonuses.dodgeChance + bonusStats.dodgeChance,
      },
    };

    const rebirthRecord: PwRebirthRecord = {
      rebirthNumber: newRebirthCount,
      timestamp: Date.now(),
      previousLevel: 50,
      previousKills: phoenix.totalKills,
      bonusGranted: bonusStats,
    };

    const updatedState: PwPhoenixWatchState = {
      ...state,
      phoenixes: {
        ...state.phoenixes,
        [phoenixId]: rebirthedPhoenix,
      },
      rebirthHistory: [...state.rebirthHistory, rebirthRecord],
      stats: {
        ...state.stats,
        totalRebirths: state.stats.totalRebirths + 1,
      },
      eventLog: [
        ...state.eventLog.slice(-199),
        {
          id: pwGenerateId(),
          type: 'rebirth' as const,
          message: `${typeDef.nameZh} has been reborn (Rebirth #${newRebirthCount})! All stats enhanced!`,
          timestamp: Date.now(),
        },
      ],
    };

    const achResult = pwCheckAndGrantAchievements(updatedState);
    pwPersist(achResult.state);

    return {
      success: true,
      rebirthNumber: newRebirthCount,
      bonusStats,
      message: `${typeDef.nameZh} reborn! Rebirth #${newRebirthCount} completed.`,
    };
  };

  // ─── Action: Heal Phoenix ────────────────────────────────────────────────

  const pwHealPhoenix = (phoenixId: PwPhoenixTypeId, amount: number): boolean => {
    if (state.isInBattle) return false;
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || !phoenix.unlocked) return false;

    const actualHeal = Math.min(amount, phoenix.currentStats.maxHp - phoenix.currentStats.hp);
    if (actualHeal <= 0) return false;

    const updatedPhoenix: PwActivePhoenix = {
      ...phoenix,
      currentStats: {
        ...phoenix.currentStats,
        hp: phoenix.currentStats.hp + actualHeal,
      },
    };

    pwPersist({
      ...state,
      phoenixes: { ...state.phoenixes, [phoenixId]: updatedPhoenix },
    });
    return true;
  };

  // ─── Action: Full Heal (out of combat) ───────────────────────────────────

  const pwFullHeal = (): boolean => {
    if (state.isInBattle) return false;
    if (!state.activePhoenixId) return false;

    const phoenix = state.phoenixes[state.activePhoenixId];
    if (!phoenix) return false;

    const updatedPhoenix: PwActivePhoenix = {
      ...phoenix,
      currentStats: {
        ...phoenix.currentStats,
        hp: phoenix.currentStats.maxHp,
      },
    };

    pwPersist({
      ...state,
      phoenixes: { ...state.phoenixes, [state.activePhoenixId]: updatedPhoenix },
    });
    return true;
  };

  // ─── Action: Start Daily Patrol ──────────────────────────────────────────

  const pwStartDailyPatrol = (): PwDailyPatrol => {
    const today = pwGetTodayDateString();

    // If patrol already exists for today, return it
    if (state.dailyPatrol && state.dailyPatrol.date === today) {
      return state.dailyPatrol;
    }

    const patrol = pwGenerateDailyPatrol();
    patrol.startTime = Date.now();

    pwPersist({
      ...state,
      dailyPatrol: patrol,
    });
    return patrol;
  };

  // ─── Action: Check/Initialize Daily Patrol ───────────────────────────────

  const pwCheckDailyPatrol = (): PwDailyPatrol | null => {
    const today = pwGetTodayDateString();
    if (state.dailyPatrol && state.dailyPatrol.date === today) {
      return state.dailyPatrol;
    }
    return null;
  };

  // ─── Action: Reset State ─────────────────────────────────────────────────

  const pwResetState = (): void => {
    const freshState = pwCreateInitialState();
    pwPersist(freshState);
  };

  // ─── Action: Set Phoenix Nickname ────────────────────────────────────────

  const pwSetNickname = (phoenixId: PwPhoenixTypeId, nickname: string): boolean => {
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || !phoenix.unlocked) return false;

    const updatedPhoenixes = {
      ...state.phoenixes,
      [phoenixId]: { ...phoenix, nickname: nickname.slice(0, 20) },
    };

    pwPersist({ ...state, phoenixes: updatedPhoenixes });
    return true;
  };

  // ─── Action: Select Phoenix for Battle ───────────────────────────────────

  const pwSelectForBattle = (phoenixId: PwPhoenixTypeId, selected: boolean): boolean => {
    const phoenix = state.phoenixes[phoenixId];
    if (!phoenix || !phoenix.unlocked) return false;
    if (state.isInBattle) return false;

    const updatedPhoenixes = {
      ...state.phoenixes,
      [phoenixId]: { ...phoenix, selectedForBattle: selected },
    };

    pwPersist({ ...state, phoenixes: updatedPhoenixes });
    return true;
  };

  // ─── Computed Values ─────────────────────────────────────────────────────

  const activePhoenix = state.activePhoenixId ? state.phoenixes[state.activePhoenixId] : null;
  const activeTower = state.activeTowerId ? state.towers[state.activeTowerId] : null;
  const activeTowerDef = state.activeTowerId ? PW_TOWERS.find(t => t.id === state.activeTowerId) ?? null : null;
  const unlockedPhoenixes = PW_PHOENIX_TYPES.map(t => state.phoenixes[t.id]).filter(p => p.unlocked);
  const unlockedTowers = PW_TOWERS.map(t => ({
    definition: t,
    state: state.towers[t.id],
  })).filter(t => t.state.isUnlocked);

  const battleState = state.currentWave
    ? {
        isInBattle: state.isInBattle,
        waveNumber: state.currentWave.waveNumber,
        turnNumber: state.currentWave.turnNumber,
        phase: state.currentWave.phase,
        enemies: state.currentWave.enemies,
        battleLog: state.currentWave.battleLog,
        totalDamageDealt: state.currentWave.totalDamageDealt,
        totalDamageTaken: state.currentWave.totalDamageTaken,
        isVictory: state.currentWave.isVictory,
        isDefeat: state.currentWave.isDefeat,
      }
    : null;

  const feathersWithDefinitions = state.feathers.map(f => ({
    collection: f,
    definition: PW_FEATHERS.find(fd => fd.id === f.featherId),
  })).filter(f => f.definition !== undefined);

  const achievementsWithDefinitions = PW_ACHIEVEMENTS.map(a => ({
    definition: a,
    isUnlocked: state.achievements.includes(a.id),
  }));

  const phoenixProgress = PW_PHOENIX_TYPES.map(typeDef => {
    const phoenix = state.phoenixes[typeDef.id];
    return {
      type: typeDef,
      phoenix,
      canUnlock: !phoenix.unlocked && state.stats.totalKills >= PW_PHOENIX_TYPES.findIndex(p => p.id === typeDef.id) * 20,
      unlockCost: PW_PHOENIX_TYPES.findIndex(p => p.id === typeDef.id) * 20,
    };
  });

  const towerUpgradeCosts = PW_TOWERS.map(t => {
    const towerState = state.towers[t.id];
    return {
      towerId: t.id,
      currentLevel: towerState.level,
      maxLevel: t.maxLevel,
      upgradeCost: Math.floor(50 * Math.pow(towerState.level, 1.5)),
      canUpgrade: towerState.isUnlocked && towerState.level < t.maxLevel,
    };
  });

  const overallPower = PW_PHOENIX_TYPES.reduce((total, typeDef) => {
    const p = state.phoenixes[typeDef.id];
    if (!p.unlocked) return total;
    return total + p.currentStats.attack + p.currentStats.defense + p.currentStats.special + p.currentStats.hp;
  }, 0);

  const guardianRank = overallPower >= 50000 ? 'Mythic Guardian'
    : overallPower >= 20000 ? 'Legendary Guardian'
    : overallPower >= 10000 ? 'Elite Guardian'
    : overallPower >= 5000 ? 'Veteran Guardian'
    : overallPower >= 2000 ? 'Seasoned Guardian'
    : overallPower >= 500 ? 'Junior Guardian'
    : 'Novice Guardian';

  // ─── Return Interface ────────────────────────────────────────────────────

  return {
    // State
    state,
    saveVersion,
    activePhoenix,
    activeTower,
    activeTowerDef,
    unlockedPhoenixes,
    unlockedTowers,
    battleState,
    feathersWithDefinitions,
    achievementsWithDefinitions,
    phoenixProgress,
    towerUpgradeCosts,
    overallPower,
    guardianRank,

    // Actions
    pwSelectPhoenix,
    pwUnlockPhoenix,
    pwSelectTower,
    pwUpgradeTower,
    pwUnlockTower,
    pwStartBattle,
    pwAttackEnemy,
    pwUseSpecialAbility,
    pwExecuteEnemyTurn,
    pwEndBattle,
    pwContinueToNextWave,
    pwRebirthPhoenix,
    pwHealPhoenix,
    pwFullHeal,
    pwStartDailyPatrol,
    pwCheckDailyPatrol,
    pwResetState,
    pwSetNickname,
    pwSelectForBattle,
    pwPersist,
  };
}
