// ============================================================================
// Monster Sanctuary Wire — Monster management module for Word Snake game
// ============================================================================
// SSR-safe: no localStorage / window / document / setInterval /
//           addEventListener / Math.random
// Uses: useState, useCallback, useRef from 'react'
// Exports: 12 MS_* constants + 55–65 ms* functions
// Default export: useMonsterSanctuary hook
// ============================================================================

import { useState, useCallback, useRef } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export type MSElement =
  | 'fire'
  | 'ice'
  | 'nature'
  | 'crystal'
  | 'shadow'
  | 'wind'
  | 'water'
  | 'arcane';

export type MSRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type MSEvolutionStage = 'egg' | 'baby' | 'teen' | 'adult' | 'legendary';

export type MSTitleName =
  | 'Caregiver'
  | 'Keeper'
  | 'Guardian'
  | 'Warden'
  | 'Protector'
  | 'Champion'
  | 'Sage'
  | 'Sanctuary Elder';

export type MSBattleAction = 'attack' | 'defend' | 'special' | 'heal' | 'flee';
export type MSBattleResult = 'win' | 'lose' | 'flee' | 'ongoing';

export interface MSMonsterTemplate {
  readonly id: string;
  readonly name: string;
  readonly element: MSElement;
  readonly rarity: MSRarity;
  readonly baseHP: number;
  readonly baseATK: number;
  readonly baseDEF: number;
  readonly baseSPD: number;
  readonly baseMAG: number;
  readonly habitat: string;
  readonly description: string;
  readonly eggColor: string;
}

export interface MSPlayerMonster {
  readonly instanceId: string;
  readonly typeId: string;
  readonly nickname: string;
  readonly stage: MSEvolutionStage;
  readonly level: number;
  readonly xp: number;
  readonly hp: number;
  readonly maxHP: number;
  readonly happiness: number;
  readonly fedToday: boolean;
  readonly assignedZone: string | null;
}

export interface MSZoneTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly element: MSElement;
  readonly capacity: number;
  readonly unlockLevel: number;
  readonly unlockCost: number;
}

export interface MSPlayerZone {
  readonly templateId: string;
  readonly unlocked: boolean;
  readonly assignedMonsters: readonly string[];
  readonly placedDecorations: readonly string[];
  readonly upgradeLevel: number;
}

export interface MSFoodTemplate {
  readonly id: string;
  readonly name: string;
  readonly element: MSElement | 'neutral';
  readonly cost: number;
  readonly hungerRestore: number;
  readonly happinessBoost: number;
  readonly xpBonus: number;
}

export interface MSDecorationTemplate {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly happinessBonus: number;
  readonly zoneElements: readonly MSElement[];
  readonly description: string;
}

export interface MSTrainerTemplate {
  readonly id: string;
  readonly name: string;
  readonly specialty: MSElement;
  readonly hireCost: number;
  readonly dailyCost: number;
  readonly trainingBonus: number;
  readonly description: string;
}

export interface MSQuestTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: 'feed' | 'hatch' | 'evolve' | 'battle' | 'decorate' | 'breed' | 'explore';
  readonly target: number;
  readonly reward: number;
  readonly xpReward: number;
  readonly requiredLevel: number;
}

export interface MSActiveQuest {
  readonly templateId: string;
  readonly progress: number;
  readonly accepted: boolean;
}

export interface MSNPCTemplate {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly greeting: string;
}

export interface MSAchievementTemplate {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly condition: keyof MSAchievementCounters;
  readonly threshold: number;
  readonly reward: number;
}

export interface MSAchievementCounters {
  readonly totalHatched: number;
  readonly totalFed: number;
  readonly totalEvolved: number;
  readonly totalBattlesWon: number;
  readonly totalDecorationsPlaced: number;
  readonly totalQuestsCompleted: number;
  readonly totalBreeded: number;
  readonly totalDailyCompleted: number;
  readonly totalCoinsEarned: number;
  readonly totalMonstersAtOnce: number;
  readonly totalTrainersHired: number;
  readonly uniqueSpeciesHatched: number;
  readonly zonesUnlocked: number;
  readonly legendaryEvolved: number;
  readonly maxPlayerLevel: number;
}

export interface MSDailyTask {
  readonly id: string;
  readonly description: string;
  readonly target: number;
  readonly reward: number;
  readonly progress: number;
  readonly completed: boolean;
  readonly claimed: boolean;
}

export interface MSBattleState {
  readonly playerMonster: MSPlayerMonster;
  readonly enemyMonster: MSPlayerMonster;
  readonly turn: number;
  readonly log: readonly string[];
  readonly result: MSBattleResult;
  readonly playerDefending: boolean;
}

export interface MSSanctuaryStats {
  readonly totalMonsters: number;
  readonly totalZonesUnlocked: number;
  readonly totalDecorationsPlaced: number;
  readonly totalAchievements: number;
  readonly totalQuestsCompleted: number;
  readonly avgHappiness: number;
  readonly avgLevel: number;
  readonly battleRecord: { wins: number; losses: number };
}

export interface MSPlacedDecoration {
  readonly decorationId: string;
  readonly zoneId: string;
  readonly slotIndex: number;
}

export interface MSSanctuaryState {
  readonly playerLevel: number;
  readonly playerXP: number;
  readonly coins: number;
  readonly monsters: readonly MSPlayerMonster[];
  readonly zones: readonly MSPlayerZone[];
  readonly foodInventory: Readonly<Record<string, number>>;
  readonly decorationInventory: readonly string[];
  readonly placedDecorations: readonly MSPlacedDecoration[];
  readonly activeQuests: readonly MSActiveQuest[];
  readonly completedQuests: readonly string[];
  readonly unlockedAchievements: readonly string[];
  readonly hiredTrainers: readonly string[];
  readonly dailyTask: MSDailyTask | null;
  readonly dailyStreak: number;
  readonly lastDailyDate: string;
  readonly counters: MSAchievementCounters;
  readonly battleState: MSBattleState | null;
  readonly npcRelations: Readonly<Record<string, number>>;
  readonly nextInstanceId: number;
  readonly seed: number;
}

export interface MSMonsterStats {
  readonly hp: number;
  readonly atk: number;
  readonly def: number;
  readonly spd: number;
  readonly mag: number;
  readonly effectiveHP: number;
  readonly effectiveATK: number;
  readonly effectiveDEF: number;
  readonly effectiveSPD: number;
  readonly effectiveMAG: number;
}

// ============================================================================
// Seeded PRNG (mulberry32) — deterministic, SSR-safe
// ============================================================================

function createPRNG(seed: number): () => number {
  let state = seed | 0;
  return (): number => {
    let t = (state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// Element Effectiveness Map
// ============================================================================

const ELEMENT_CHART: Partial<Record<MSElement, Partial<Record<MSElement, number>>>> = {
  fire: { nature: 1.5, ice: 1.5, water: 0.6, fire: 0.8 },
  ice: { water: 1.5, wind: 1.5, fire: 0.6, ice: 0.8 },
  nature: { water: 1.5, crystal: 1.5, fire: 0.6, nature: 0.8 },
  crystal: { shadow: 1.5, arcane: 1.5, nature: 0.6, crystal: 0.8 },
  shadow: { arcane: 1.5, wind: 1.5, crystal: 0.6, shadow: 0.8 },
  wind: { nature: 1.5, fire: 1.5, shadow: 0.6, wind: 0.8 },
  water: { fire: 1.5, crystal: 1.5, nature: 0.6, water: 0.8 },
  arcane: { fire: 1.5, ice: 1.5, shadow: 0.6, arcane: 0.8 },
};

// ============================================================================
// XP Table (level 1–50, generated once)
// ============================================================================

function generateXPTable(): readonly number[] {
  const table: number[] = [0];
  for (let i = 1; i <= 50; i++) {
    table.push(table[i - 1] + Math.floor(80 * i * (1 + i * 0.12)));
  }
  return table;
}

const XP_TABLE = generateXPTable();

// ============================================================================
// Monster XP Table (per monster level)
// ============================================================================

function generateMonsterXPTable(): readonly number[] {
  const table: number[] = [0];
  for (let i = 1; i <= 50; i++) {
    table.push(table[i - 1] + Math.floor(40 * i * (1 + i * 0.08)));
  }
  return table;
}

const MONSTER_XP_TABLE = generateMonsterXPTable();

// ============================================================================
// Constant: MS_MAX_LEVEL
// ============================================================================

export const MS_MAX_LEVEL = 50;

// ============================================================================
// Constant: MS_EVOLUTION_STAGES
// ============================================================================

export const MS_EVOLUTION_STAGES: readonly {
  stage: MSEvolutionStage;
  minLevel: number;
  label: string;
}[] = [
  { stage: 'egg', minLevel: 0, label: 'Egg' },
  { stage: 'baby', minLevel: 1, label: 'Baby' },
  { stage: 'teen', minLevel: 10, label: 'Teen' },
  { stage: 'adult', minLevel: 25, label: 'Adult' },
  { stage: 'legendary', minLevel: 40, label: 'Legendary' },
];

// ============================================================================
// Constant: MS_TITLE_THRESHOLDS
// ============================================================================

export const MS_TITLE_THRESHOLDS: readonly { title: MSTitleName; level: number }[] = [
  { title: 'Caregiver', level: 1 },
  { title: 'Keeper', level: 5 },
  { title: 'Guardian', level: 10 },
  { title: 'Warden', level: 18 },
  { title: 'Protector', level: 26 },
  { title: 'Champion', level: 34 },
  { title: 'Sage', level: 42 },
  { title: 'Sanctuary Elder', level: 50 },
];

// ============================================================================
// Constant: MS_MONSTERS (30+ monster types)
// ============================================================================

export const MS_MONSTERS: readonly MSMonsterTemplate[] = [
  {
    id: 'griffin', name: 'Griffin', element: 'wind', rarity: 'rare',
    baseHP: 120, baseATK: 85, baseDEF: 70, baseSPD: 95, baseMAG: 60,
    habitat: 'sky_sanctum',
    description: 'A majestic eagle-lion hybrid that soars above the mountains.',
    eggColor: '#d4af37',
  },
  {
    id: 'manticore', name: 'Manticore', element: 'shadow', rarity: 'epic',
    baseHP: 140, baseATK: 110, baseDEF: 65, baseSPD: 80, baseMAG: 75,
    habitat: 'shadow_depths',
    description: 'A fearsome beast with the body of a lion and a tail of venomous spikes.',
    eggColor: '#4a0e4e',
  },
  {
    id: 'chimera', name: 'Chimera', element: 'fire', rarity: 'epic',
    baseHP: 155, baseATK: 100, baseDEF: 80, baseSPD: 60, baseMAG: 90,
    habitat: 'volcanic_nest',
    description: 'A triple-headed creature combining lion, goat, and serpent.',
    eggColor: '#c0392b',
  },
  {
    id: 'basilisk', name: 'Basilisk', element: 'shadow', rarity: 'rare',
    baseHP: 100, baseATK: 75, baseDEF: 95, baseSPD: 40, baseMAG: 100,
    habitat: 'shadow_depths',
    description: 'The serpent king whose gaze turns all to stone.',
    eggColor: '#2c3e50',
  },
  {
    id: 'phoenix', name: 'Phoenix', element: 'fire', rarity: 'legendary',
    baseHP: 130, baseATK: 95, baseDEF: 60, baseSPD: 110, baseMAG: 120,
    habitat: 'volcanic_nest',
    description: 'An immortal bird of flame that rises from its own ashes.',
    eggColor: '#e67e22',
  },
  {
    id: 'fire_dragon', name: 'Fire Dragon', element: 'fire', rarity: 'legendary',
    baseHP: 180, baseATK: 120, baseDEF: 90, baseSPD: 70, baseMAG: 95,
    habitat: 'volcanic_nest',
    description: 'A massive dragon wreathed in eternal flame.',
    eggColor: '#ff4500',
  },
  {
    id: 'ice_dragon', name: 'Ice Dragon', element: 'ice', rarity: 'legendary',
    baseHP: 170, baseATK: 105, baseDEF: 100, baseSPD: 60, baseMAG: 110,
    habitat: 'frozen_lair',
    description: 'A regal dragon whose scales shimmer like frozen diamonds.',
    eggColor: '#87ceeb',
  },
  {
    id: 'storm_dragon', name: 'Storm Dragon', element: 'wind', rarity: 'legendary',
    baseHP: 160, baseATK: 115, baseDEF: 75, baseSPD: 130, baseMAG: 105,
    habitat: 'sky_sanctum',
    description: 'A dragon that commands lightning and thunder.',
    eggColor: '#9b59b6',
  },
  {
    id: 'hydra', name: 'Hydra', element: 'water', rarity: 'epic',
    baseHP: 200, baseATK: 90, baseDEF: 85, baseSPD: 45, baseMAG: 80,
    habitat: 'abyssal_trench',
    description: 'A multi-headed serpent that grows stronger with each wound.',
    eggColor: '#1abc9c',
  },
  {
    id: 'kraken', name: 'Kraken', element: 'water', rarity: 'epic',
    baseHP: 190, baseATK: 110, baseDEF: 95, baseSPD: 35, baseMAG: 100,
    habitat: 'abyssal_trench',
    description: 'A colossal sea monster with tentacles that span the deep.',
    eggColor: '#2c3e50',
  },
  {
    id: 'sphinx', name: 'Sphinx', element: 'arcane', rarity: 'epic',
    baseHP: 110, baseATK: 60, baseDEF: 75, baseSPD: 85, baseMAG: 130,
    habitat: 'mystic_ruins',
    description: 'A wise guardian that challenges seekers with ancient riddles.',
    eggColor: '#f1c40f',
  },
  {
    id: 'centaur', name: 'Centaur', element: 'nature', rarity: 'uncommon',
    baseHP: 130, baseATK: 85, baseDEF: 70, baseSPD: 100, baseMAG: 50,
    habitat: 'verdant_glade',
    description: 'A noble half-horse warrior with unmatched speed.',
    eggColor: '#27ae60',
  },
  {
    id: 'minotaur', name: 'Minotaur', element: 'shadow', rarity: 'rare',
    baseHP: 170, baseATK: 120, baseDEF: 100, baseSPD: 40, baseMAG: 30,
    habitat: 'mystic_ruins',
    description: 'A powerful bull-headed giant that guards the ancient labyrinth.',
    eggColor: '#7f8c8d',
  },
  {
    id: 'cerberus', name: 'Cerberus', element: 'shadow', rarity: 'epic',
    baseHP: 160, baseATK: 105, baseDEF: 90, baseSPD: 65, baseMAG: 70,
    habitat: 'shadow_depths',
    description: 'The three-headed hound that guards the gates of the underworld.',
    eggColor: '#34495e',
  },
  {
    id: 'pegasus', name: 'Pegasus', element: 'wind', rarity: 'rare',
    baseHP: 115, baseATK: 70, baseDEF: 65, baseSPD: 140, baseMAG: 80,
    habitat: 'sky_sanctum',
    description: 'A divine winged horse that rides the highest winds.',
    eggColor: '#ecf0f1',
  },
  {
    id: 'unicorn', name: 'Unicorn', element: 'arcane', rarity: 'rare',
    baseHP: 120, baseATK: 55, baseDEF: 75, baseSPD: 90, baseMAG: 115,
    habitat: 'verdant_glade',
    description: 'A pure-white horse with a horn that radiates healing magic.',
    eggColor: '#fff5ee',
  },
  {
    id: 'stone_golem', name: 'Stone Golem', element: 'nature', rarity: 'uncommon',
    baseHP: 200, baseATK: 80, baseDEF: 130, baseSPD: 20, baseMAG: 20,
    habitat: 'mystic_ruins',
    description: 'An animated stone sentinel forged by ancient magic.',
    eggColor: '#95a5a6',
  },
  {
    id: 'crystal_golem', name: 'Crystal Golem', element: 'crystal', rarity: 'rare',
    baseHP: 180, baseATK: 90, baseDEF: 120, baseSPD: 25, baseMAG: 60,
    habitat: 'crystal_caverns',
    description: 'A golem of living crystal that refracts light into deadly beams.',
    eggColor: '#00d2ff',
  },
  {
    id: 'werewolf', name: 'Werewolf', element: 'shadow', rarity: 'rare',
    baseHP: 140, baseATK: 115, baseDEF: 60, baseSPD: 105, baseMAG: 40,
    habitat: 'shadow_depths',
    description: 'A shapeshifting hunter under the cursed moonlight.',
    eggColor: '#6c3483',
  },
  {
    id: 'vampire', name: 'Vampire', element: 'shadow', rarity: 'epic',
    baseHP: 125, baseATK: 100, baseDEF: 55, baseSPD: 110, baseMAG: 90,
    habitat: 'shadow_depths',
    description: 'An immortal lord of the night that drains life force.',
    eggColor: '#8e44ad',
  },
  {
    id: 'banshee', name: 'Banshee', element: 'wind', rarity: 'rare',
    baseHP: 90, baseATK: 65, baseDEF: 50, baseSPD: 120, baseMAG: 110,
    habitat: 'frozen_lair',
    description: 'A wailing spirit whose cry freezes the hearts of mortals.',
    eggColor: '#bdc3c7',
  },
  {
    id: 'leviathan', name: 'Leviathan', element: 'water', rarity: 'legendary',
    baseHP: 220, baseATK: 130, baseDEF: 110, baseSPD: 50, baseMAG: 95,
    habitat: 'abyssal_trench',
    description: 'The primordial sea serpent that dwells in the deepest abyss.',
    eggColor: '#1a5276',
  },
  {
    id: 'roc', name: 'Roc', element: 'wind', rarity: 'epic',
    baseHP: 160, baseATK: 100, baseDEF: 80, baseSPD: 115, baseMAG: 55,
    habitat: 'sky_sanctum',
    description: 'A giant bird of prey that can carry elephants in its talons.',
    eggColor: '#d4a574',
  },
  {
    id: 'djinn', name: 'Djinn', element: 'arcane', rarity: 'epic',
    baseHP: 135, baseATK: 80, baseDEF: 65, baseSPD: 95, baseMAG: 125,
    habitat: 'volcanic_nest',
    description: 'A powerful spirit of smokeless fire that grants wishes.',
    eggColor: '#e74c3c',
  },
  {
    id: 'kitsune', name: 'Kitsune', element: 'arcane', rarity: 'rare',
    baseHP: 110, baseATK: 70, baseDEF: 60, baseSPD: 115, baseMAG: 110,
    habitat: 'verdant_glade',
    description: 'A multi-tailed fox spirit that masters illusion magic.',
    eggColor: '#f39c12',
  },
  {
    id: 'kirin', name: 'Kirin', element: 'nature', rarity: 'legendary',
    baseHP: 150, baseATK: 85, baseDEF: 85, baseSPD: 100, baseMAG: 120,
    habitat: 'verdant_glade',
    description: 'A sacred chimeric beast that appears only in times of peace.',
    eggColor: '#a8e6cf',
  },
  {
    id: 'nemean_lion', name: 'Nemean Lion', element: 'nature', rarity: 'rare',
    baseHP: 175, baseATK: 110, baseDEF: 110, baseSPD: 55, baseMAG: 25,
    habitat: 'verdant_glade',
    description: 'An invulnerable lion with an impenetrable golden hide.',
    eggColor: '#f5b041',
  },
  {
    id: 'gorgon', name: 'Gorgon', element: 'shadow', rarity: 'rare',
    baseHP: 120, baseATK: 75, baseDEF: 80, baseSPD: 70, baseMAG: 105,
    habitat: 'mystic_ruins',
    description: 'A serpent-haired creature whose gaze petrifies all who meet it.',
    eggColor: '#16a085',
  },
  {
    id: 'harpy', name: 'Harpy', element: 'wind', rarity: 'uncommon',
    baseHP: 100, baseATK: 80, baseDEF: 55, baseSPD: 110, baseMAG: 75,
    habitat: 'sky_sanctum',
    description: 'A winged creature with a piercing shriek that shatters stone.',
    eggColor: '#a3e4d7',
  },
  {
    id: 'salamander', name: 'Salamander', element: 'fire', rarity: 'uncommon',
    baseHP: 105, baseATK: 75, baseDEF: 60, baseSPD: 85, baseMAG: 70,
    habitat: 'volcanic_nest',
    description: 'A small fire lizard that dwells in molten rock.',
    eggColor: '#e74c3c',
  },
  {
    id: 'thunderbird', name: 'Thunderbird', element: 'wind', rarity: 'epic',
    baseHP: 145, baseATK: 105, baseDEF: 70, baseSPD: 125, baseMAG: 85,
    habitat: 'sky_sanctum',
    description: 'A storm-wrapped bird whose wings summon thunder from clear skies.',
    eggColor: '#2c3e50',
  },
  {
    id: 'wendigo', name: 'Wendigo', element: 'ice', rarity: 'epic',
    baseHP: 165, baseATK: 125, baseDEF: 60, baseSPD: 100, baseMAG: 50,
    habitat: 'frozen_lair',
    description: 'A gaunt, ravenous spirit that haunts the frozen wastes.',
    eggColor: '#85c1e9',
  },
  {
    id: 'frost_wyrm', name: 'Frost Wyrm', element: 'ice', rarity: 'rare',
    baseHP: 150, baseATK: 90, baseDEF: 85, baseSPD: 50, baseMAG: 80,
    habitat: 'frozen_lair',
    description: 'A serpentine dragon of ice that burrows through glaciers.',
    eggColor: '#aed6f1',
  },
  {
    id: 'treant', name: 'Treant', element: 'nature', rarity: 'uncommon',
    baseHP: 190, baseATK: 70, baseDEF: 110, baseSPD: 15, baseMAG: 55,
    habitat: 'verdant_glade',
    description: 'An ancient living tree that guards the forest with quiet strength.',
    eggColor: '#6d4c41',
  },
  {
    id: 'quartz_sprite', name: 'Quartz Sprite', element: 'crystal', rarity: 'uncommon',
    baseHP: 80, baseATK: 55, baseDEF: 60, baseSPD: 105, baseMAG: 90,
    habitat: 'crystal_caverns',
    description: 'A tiny being of living quartz that sings crystalline melodies.',
    eggColor: '#f5cba7',
  },
  {
    id: 'abyssal_serpent', name: 'Abyssal Serpent', element: 'water', rarity: 'rare',
    baseHP: 160, baseATK: 100, baseDEF: 75, baseSPD: 80, baseMAG: 85,
    habitat: 'abyssal_trench',
    description: 'A deep-sea serpent that glows with bioluminescent patterns.',
    eggColor: '#2471a3',
  },
];

// ============================================================================
// Constant: MS_ZONES (8 sanctuary zones)
// ============================================================================

export const MS_ZONES: readonly MSZoneTemplate[] = [
  {
    id: 'volcanic_nest', name: 'Volcanic Nest', description: 'A scorching habitat where fire creatures thrive.',
    element: 'fire', capacity: 4, unlockLevel: 1, unlockCost: 0,
  },
  {
    id: 'frozen_lair', name: 'Frozen Lair', description: 'An icy cavern where frost-dwellers find solace.',
    element: 'ice', capacity: 4, unlockLevel: 3, unlockCost: 500,
  },
  {
    id: 'verdant_glade', name: 'Verdant Glade', description: 'A lush forest clearing teeming with nature spirits.',
    element: 'nature', capacity: 4, unlockLevel: 5, unlockCost: 800,
  },
  {
    id: 'crystal_caverns', name: 'Crystal Caverns', description: 'Gleaming underground chambers pulsing with mineral energy.',
    element: 'crystal', capacity: 4, unlockLevel: 8, unlockCost: 1200,
  },
  {
    id: 'shadow_depths', name: 'Shadow Depths', description: 'A dark, misty realm where creatures of shadow lurk.',
    element: 'shadow', capacity: 4, unlockLevel: 12, unlockCost: 2000,
  },
  {
    id: 'sky_sanctum', name: 'Sky Sanctum', description: 'Floating islands high above the clouds.',
    element: 'wind', capacity: 4, unlockLevel: 16, unlockCost: 3000,
  },
  {
    id: 'abyssal_trench', name: 'Abyssal Trench', description: 'The deepest ocean trench, home to aquatic titans.',
    element: 'water', capacity: 4, unlockLevel: 22, unlockCost: 5000,
  },
  {
    id: 'mystic_ruins', name: 'Mystic Ruins', description: 'Ancient temple ruins radiating arcane power.',
    element: 'arcane', capacity: 4, unlockLevel: 28, unlockCost: 8000,
  },
];

// ============================================================================
// Constant: MS_FOODS (20 food types)
// ============================================================================

export const MS_FOODS: readonly MSFoodTemplate[] = [
  { id: 'ember_berry', name: 'Ember Berry', element: 'fire', cost: 10, hungerRestore: 20, happinessBoost: 5, xpBonus: 5 },
  { id: 'frost_petal', name: 'Frost Petal', element: 'ice', cost: 10, hungerRestore: 20, happinessBoost: 5, xpBonus: 5 },
  { id: 'moss_crunch', name: 'Moss Crunch', element: 'nature', cost: 8, hungerRestore: 15, happinessBoost: 6, xpBonus: 4 },
  { id: 'crystal_shard', name: 'Crystal Shard', element: 'crystal', cost: 15, hungerRestore: 25, happinessBoost: 8, xpBonus: 8 },
  { id: 'shadow_essence', name: 'Shadow Essence', element: 'shadow', cost: 15, hungerRestore: 25, happinessBoost: 7, xpBonus: 7 },
  { id: 'cloud_whip', name: 'Cloud Whip', element: 'wind', cost: 10, hungerRestore: 18, happinessBoost: 6, xpBonus: 5 },
  { id: 'abyssal_kelp', name: 'Abyssal Kelp', element: 'water', cost: 12, hungerRestore: 22, happinessBoost: 5, xpBonus: 6 },
  { id: 'rune_crumb', name: 'Rune Crumb', element: 'arcane', cost: 15, hungerRestore: 20, happinessBoost: 7, xpBonus: 9 },
  { id: 'dragon_fruit', name: 'Dragon Fruit', element: 'neutral', cost: 20, hungerRestore: 35, happinessBoost: 10, xpBonus: 12 },
  { id: 'phoenix_plume', name: 'Phoenix Plume', element: 'fire', cost: 25, hungerRestore: 30, happinessBoost: 12, xpBonus: 15 },
  { id: 'hydra_stew', name: 'Hydra Stew', element: 'water', cost: 18, hungerRestore: 28, happinessBoost: 8, xpBonus: 10 },
  { id: 'griffin_grain', name: 'Griffin Grain', element: 'wind', cost: 12, hungerRestore: 22, happinessBoost: 7, xpBonus: 6 },
  { id: 'manticore_stew', name: 'Manticore Stew', element: 'shadow', cost: 22, hungerRestore: 32, happinessBoost: 10, xpBonus: 11 },
  { id: 'basilisk_brew', name: 'Basilisk Brew', element: 'shadow', cost: 20, hungerRestore: 28, happinessBoost: 9, xpBonus: 13 },
  { id: 'chimera_chow', name: 'Chimera Chow', element: 'fire', cost: 18, hungerRestore: 26, happinessBoost: 8, xpBonus: 10 },
  { id: 'sphinx_cake', name: 'Sphinx Riddle Cake', element: 'arcane', cost: 25, hungerRestore: 30, happinessBoost: 12, xpBonus: 14 },
  { id: 'centaur_oats', name: 'Centaur Oats', element: 'nature', cost: 8, hungerRestore: 16, happinessBoost: 5, xpBonus: 4 },
  { id: 'minotaur_steak', name: 'Minotaur Steak', element: 'neutral', cost: 20, hungerRestore: 35, happinessBoost: 11, xpBonus: 12 },
  { id: 'kraken_calamari', name: 'Kraken Calamari', element: 'water', cost: 22, hungerRestore: 30, happinessBoost: 10, xpBonus: 11 },
  { id: 'unicorn_nectar', name: 'Unicorn Nectar', element: 'arcane', cost: 30, hungerRestore: 40, happinessBoost: 15, xpBonus: 18 },
];

// ============================================================================
// Constant: MS_DECORATIONS (15 habitat decorations)
// ============================================================================

export const MS_DECORATIONS: readonly MSDecorationTemplate[] = [
  { id: 'molten_rock', name: 'Molten Rock', cost: 100, happinessBonus: 5, zoneElements: ['fire'], description: 'A perpetually glowing stone from the volcanic core.' },
  { id: 'ice_sculpture', name: 'Ice Sculpture', cost: 100, happinessBonus: 5, zoneElements: ['ice'], description: 'A beautifully carved ice effigy that never melts.' },
  { id: 'ancient_oak', name: 'Ancient Oak', cost: 80, happinessBonus: 4, zoneElements: ['nature'], description: 'A thousand-year-old oak tree with spreading roots.' },
  { id: 'crystal_formation', name: 'Crystal Formation', cost: 120, happinessBonus: 6, zoneElements: ['crystal'], description: 'A cluster of naturally resonating crystals.' },
  { id: 'shadow_lantern', name: 'Shadow Lantern', cost: 110, happinessBonus: 5, zoneElements: ['shadow'], description: 'A lantern that casts mysterious, shifting shadows.' },
  { id: 'cloud_pillar', name: 'Cloud Pillar', cost: 100, happinessBonus: 5, zoneElements: ['wind'], description: 'A solidified cloud that supports floating platforms.' },
  { id: 'coral_reef', name: 'Coral Reef', cost: 90, happinessBonus: 4, zoneElements: ['water'], description: 'A miniature living coral reef teeming with color.' },
  { id: 'rune_stone', name: 'Rune Stone', cost: 130, happinessBonus: 6, zoneElements: ['arcane'], description: 'An inscribed stone pulsing with ancient runes.' },
  { id: 'dragon_statue', name: 'Dragon Statue', cost: 200, happinessBonus: 10, zoneElements: ['fire', 'ice', 'wind'], description: 'A grand statue depicting an ancient dragon.' },
  { id: 'phoenix_perch', name: 'Phoenix Perch', cost: 150, happinessBonus: 8, zoneElements: ['fire', 'arcane'], description: 'A gilded perch warm to the touch, favored by phoenixes.' },
  { id: 'griffin_nest', name: 'Griffin Nest', cost: 120, happinessBonus: 6, zoneElements: ['wind', 'nature'], description: 'A lofty woven nest lined with golden twigs.' },
  { id: 'hydra_pool', name: 'Hydra Pool', cost: 140, happinessBonus: 7, zoneElements: ['water', 'shadow'], description: 'A deep, dark pool where hydras love to rest.' },
  { id: 'sphinx_obelisk', name: 'Sphinx Obelisk', cost: 160, happinessBonus: 8, zoneElements: ['arcane', 'shadow'], description: 'A towering obelisk inscribed with riddles.' },
  { id: 'crystal_chime', name: 'Crystal Chime', cost: 110, happinessBonus: 6, zoneElements: ['crystal', 'wind'], description: 'Wind chimes made of enchanted crystal.' },
  { id: 'mystic_fountain', name: 'Mystic Fountain', cost: 180, happinessBonus: 9, zoneElements: ['arcane', 'water', 'crystal'], description: 'A fountain whose waters glow with arcane energy.' },
];

// ============================================================================
// Constant: MS_TRAINERS (8 trainers)
// ============================================================================

export const MS_TRAINERS: readonly MSTrainerTemplate[] = [
  { id: 'pyra', name: 'Pyra', specialty: 'fire', hireCost: 500, dailyCost: 50, trainingBonus: 1.2, description: 'A fiery expert in dragon taming and flame arts.' },
  { id: 'glacia', name: 'Glacia', specialty: 'ice', hireCost: 500, dailyCost: 50, trainingBonus: 1.2, description: 'A calm, ice-wielding trainer from the northern wastes.' },
  { id: 'sylva', name: 'Sylva', specialty: 'nature', hireCost: 400, dailyCost: 40, trainingBonus: 1.2, description: 'A druidic trainer attuned to the heartbeat of the forest.' },
  { id: 'crysta', name: 'Crysta', specialty: 'crystal', hireCost: 600, dailyCost: 60, trainingBonus: 1.25, description: 'A gem-cutter turned monster trainer with a sharp eye.' },
  { id: 'umbra', name: 'Umbra', specialty: 'shadow', hireCost: 550, dailyCost: 55, trainingBonus: 1.2, description: 'A mysterious trainer who walks between light and dark.' },
  { id: 'zephyr', name: 'Zephyr', specialty: 'wind', hireCost: 450, dailyCost: 45, trainingBonus: 1.2, description: 'A swift sky-nomad who tames the wildest flyers.' },
  { id: 'marina', name: 'Marina', specialty: 'water', hireCost: 500, dailyCost: 50, trainingBonus: 1.2, description: 'An oceanographer turned deep-sea monster specialist.' },
  { id: 'arcana', name: 'Arcana', specialty: 'arcane', hireCost: 700, dailyCost: 70, trainingBonus: 1.3, description: 'A master sorceress who teaches monsters arcane arts.' },
];

// ============================================================================
// Constant: MS_QUESTS (12 quests)
// ============================================================================

export const MS_QUESTS: readonly MSQuestTemplate[] = [
  { id: 'q_feed_5', name: 'Hungry Mouths', description: 'Feed 5 monsters to keep them happy.', type: 'feed', target: 5, reward: 100, xpReward: 50, requiredLevel: 1 },
  { id: 'q_hatch_3', name: 'New Arrivals', description: 'Hatch 3 monster eggs.', type: 'hatch', target: 3, reward: 200, xpReward: 80, requiredLevel: 1 },
  { id: 'q_evolve_1', name: 'Growing Up', description: 'Evolve 1 monster to the next stage.', type: 'evolve', target: 1, reward: 300, xpReward: 120, requiredLevel: 5 },
  { id: 'q_battle_3', name: 'Arena Challenger', description: 'Win 3 monster battles.', type: 'battle', target: 3, reward: 250, xpReward: 100, requiredLevel: 3 },
  { id: 'q_decorate_2', name: 'Interior Designer', description: 'Place 2 decorations in your zones.', type: 'decorate', target: 2, reward: 150, xpReward: 60, requiredLevel: 4 },
  { id: 'q_breed_1', name: 'New Blood', description: 'Breed a new monster.', type: 'breed', target: 1, reward: 500, xpReward: 200, requiredLevel: 10 },
  { id: 'q_feed_20', name: 'Gourmet Keeper', description: 'Feed monsters a total of 20 times.', type: 'feed', target: 20, reward: 400, xpReward: 150, requiredLevel: 8 },
  { id: 'q_battle_10', name: 'Battle Master', description: 'Win 10 monster battles.', type: 'battle', target: 10, reward: 600, xpReward: 250, requiredLevel: 10 },
  { id: 'q_hatch_10', name: 'Egg Collector', description: 'Hatch 10 different monster eggs.', type: 'hatch', target: 10, reward: 800, xpReward: 300, requiredLevel: 12 },
  { id: 'q_explore_5', name: 'Zone Explorer', description: 'Unlock 5 sanctuary zones.', type: 'explore', target: 5, reward: 500, xpReward: 200, requiredLevel: 15 },
  { id: 'q_evolve_5', name: 'Evolution Expert', description: 'Evolve 5 monsters.', type: 'evolve', target: 5, reward: 1000, xpReward: 400, requiredLevel: 20 },
  { id: 'q_feed_50', name: 'Banquet Host', description: 'Feed monsters a total of 50 times.', type: 'feed', target: 50, reward: 1200, xpReward: 500, requiredLevel: 25 },
];

// ============================================================================
// Constant: MS_NPCS (8 NPCs)
// ============================================================================

export const MS_NPCS: readonly MSNPCTemplate[] = [
  { id: 'merchant_elara', name: 'Merchant Elara', role: 'Trader', description: 'A travelling merchant with rare goods.', greeting: 'Welcome! I have wares if you have coins.' },
  { id: 'scholar_finneas', name: 'Scholar Finneas', role: 'Lorekeeper', description: 'A wise sage who knows every monster legend.', greeting: 'Ah, a fellow student of creatures! What would you like to know?' },
  { id: 'elder_thorne', name: 'Elder Thorne', role: 'Quest Giver', description: 'The venerable elder of the sanctuary council.', greeting: 'Young keeper, the sanctuary needs your help once more.' },
  { id: 'blacksmith_garn', name: 'Blacksmith Garn', role: 'Artificer', description: 'A dwarf smith who forges monster equipment.', greeting: 'Need somethin\' forged? Bring me materials!' },
  { id: 'healer_mira', name: 'Healer Mira', role: 'Medic', description: 'A gentle healer who tends to wounded monsters.', greeting: 'Your creatures look tired. Let me help them recover.' },
  { id: 'explorer_kai', name: 'Explorer Kai', role: 'Adventurer', description: 'A bold explorer who discovers new habitats.', greeting: 'I just found an incredible new zone! Come see!' },
  { id: 'breeder_luna', name: 'Breeder Luna', role: 'Geneticist', description: 'An expert in monster breeding and lineages.', greeting: 'Two monsters with strong traits... let me see what we can create.' },
  { id: 'bard_felix', name: 'Bard Felix', role: 'Entertainer', description: 'A wandering bard who sings monster ballads.', greeting: '*strums lute* Shall I sing you the Ballad of the Flame Drake?' },
];

// ============================================================================
// Constant: MS_ACHIEVEMENTS (15 achievements)
// ============================================================================

export const MS_ACHIEVEMENTS: readonly MSAchievementTemplate[] = [
  { id: 'ach_first_hatch', name: 'First Hatch', description: 'Hatch your first monster egg.', icon: '🥚', condition: 'totalHatched', threshold: 1, reward: 50 },
  { id: 'ach_egg_collector', name: 'Egg Collector', description: 'Hatch 10 different monsters.', icon: '🧺', condition: 'uniqueSpeciesHatched', threshold: 10, reward: 500 },
  { id: 'ach_zone_master', name: 'Zone Master', description: 'Unlock all 8 sanctuary zones.', icon: '🗺️', condition: 'zonesUnlocked', threshold: 8, reward: 1000 },
  { id: 'ach_legendary_keeper', name: 'Legendary Keeper', description: 'Evolve a monster to legendary stage.', icon: '⭐', condition: 'legendaryEvolved', threshold: 1, reward: 2000 },
  { id: 'ach_well_fed', name: 'Well Fed', description: 'Feed monsters 100 times total.', icon: '🍖', condition: 'totalFed', threshold: 100, reward: 300 },
  { id: 'ach_decorator', name: 'Decorator', description: 'Place 10 decorations in your zones.', icon: '🎨', condition: 'totalDecorationsPlaced', threshold: 10, reward: 400 },
  { id: 'ach_quest_champion', name: 'Quest Champion', description: 'Complete 50 quests.', icon: '🏆', condition: 'totalQuestsCompleted', threshold: 50, reward: 1500 },
  { id: 'ach_monster_master', name: 'Monster Master', description: 'Have 20 monsters at once.', icon: '🐉', condition: 'totalMonstersAtOnce', threshold: 20, reward: 800 },
  { id: 'ach_breeding_expert', name: 'Breeding Expert', description: 'Breed 10 monsters.', icon: '💕', condition: 'totalBreeded', threshold: 10, reward: 600 },
  { id: 'ach_battle_victor', name: 'Battle Victor', description: 'Win 25 monster battles.', icon: '⚔️', condition: 'totalBattlesWon', threshold: 25, reward: 700 },
  { id: 'ach_trainer_pro', name: 'Trainer Pro', description: 'Hire all 8 trainers.', icon: '👨‍🏫', condition: 'totalTrainersHired', threshold: 8, reward: 900 },
  { id: 'ach_daily_devotee', name: 'Daily Devotee', description: 'Complete 30 daily tasks.', icon: '📅', condition: 'totalDailyCompleted', threshold: 30, reward: 500 },
  { id: 'ach_coin_master', name: 'Coin Master', description: 'Earn 100,000 coins total.', icon: '💰', condition: 'totalCoinsEarned', threshold: 100000, reward: 2000 },
  { id: 'ach_evolution_expert', name: 'Evolution Expert', description: 'Evolve monsters 50 times.', icon: '🔄', condition: 'totalEvolved', threshold: 50, reward: 1200 },
  { id: 'ach_sanctuary_legend', name: 'Sanctuary Legend', description: 'Reach player level 50.', icon: '👑', condition: 'maxPlayerLevel', threshold: 50, reward: 5000 },
];

// ============================================================================
// Constant: MS_DAILY_TASKS (12 daily task templates)
// ============================================================================

export const MS_DAILY_TASKS: readonly {
  id: string;
  description: string;
  target: number;
  reward: number;
}[] = [
  { id: 'dt_feed_3', description: 'Feed 3 monsters today.', target: 3, reward: 50 },
  { id: 'dt_hatch_1', description: 'Hatch 1 monster egg today.', target: 1, reward: 80 },
  { id: 'dt_battle_1', description: 'Win 1 monster battle today.', target: 1, reward: 60 },
  { id: 'dt_train_2', description: 'Train 2 monsters today.', target: 2, reward: 70 },
  { id: 'dt_feed_5', description: 'Feed 5 monsters today.', target: 5, reward: 90 },
  { id: 'dt_explore_1', description: 'Visit all unlocked zones today.', target: 1, reward: 40 },
  { id: 'dt_evolve_1', description: 'Evolve 1 monster today.', target: 1, reward: 100 },
  { id: 'dt_social_1', description: 'Talk to an NPC today.', target: 1, reward: 30 },
  { id: 'dt_decorate_1', description: 'Place 1 decoration today.', target: 1, reward: 55 },
  { id: 'dt_heal_3', description: 'Heal 3 monsters today.', target: 3, reward: 65 },
  { id: 'dt_breed_1', description: 'Breed 1 monster today.', target: 1, reward: 110 },
  { id: 'dt_quest_1', description: 'Complete 1 quest today.', target: 1, reward: 85 },
];

// ============================================================================
// Internal Helper Functions
// ============================================================================

function clampValue(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function generateInstanceId(state: MSSanctuaryState): string {
  return `mon_${state.nextInstanceId}`;
}

function getTemplate<T extends { readonly id: string }>(
  list: readonly T[],
  id: string,
): T | undefined {
  return list.find((item) => item.id === id);
}

function getStageMultiplier(stage: MSEvolutionStage): number {
  switch (stage) {
    case 'egg': return 0.3;
    case 'baby': return 0.6;
    case 'teen': return 1.0;
    case 'adult': return 1.4;
    case 'legendary': return 2.0;
    default: return 1.0;
  }
}

function calculateMonsterStats(
  template: MSMonsterTemplate,
  monster: MSPlayerMonster,
  trainerBonus: number,
): MSMonsterStats {
  const stageMult = getStageMultiplier(monster.stage);
  const levelMult = 1 + (monster.level - 1) * 0.04;
  const combinedMult = stageMult * levelMult * trainerBonus;
  const hp = Math.floor(template.baseHP * combinedMult * 1.5);
  const atk = Math.floor(template.baseATK * combinedMult);
  const def = Math.floor(template.baseDEF * combinedMult);
  const spd = Math.floor(template.baseSPD * combinedMult);
  const mag = Math.floor(template.baseMAG * combinedMult);

  const happinessBonus = 1 + (monster.happiness - 50) / 200;
  return {
    hp,
    atk,
    def,
    spd,
    mag,
    effectiveHP: Math.floor(hp * happinessBonus),
    effectiveATK: Math.floor(atk * happinessBonus),
    effectiveDEF: Math.floor(def * happinessBonus),
    effectiveSPD: Math.floor(spd * happinessBonus),
    effectiveMAG: Math.floor(mag * happinessBonus),
  };
}

function getEffectiveCapacity(zoneTemplate: MSZoneTemplate, upgradeLevel: number): number {
  return zoneTemplate.capacity + upgradeLevel;
}

function getElementMultiplier(attacker: MSElement, defender: MSElement): number {
  return ELEMENT_CHART[attacker]?.[defender] ?? 1.0;
}

function createDefaultCounters(): MSAchievementCounters {
  return {
    totalHatched: 0,
    totalFed: 0,
    totalEvolved: 0,
    totalBattlesWon: 0,
    totalDecorationsPlaced: 0,
    totalQuestsCompleted: 0,
    totalBreeded: 0,
    totalDailyCompleted: 0,
    totalCoinsEarned: 0,
    totalMonstersAtOnce: 0,
    totalTrainersHired: 0,
    uniqueSpeciesHatched: 0,
    zonesUnlocked: 0,
    legendaryEvolved: 0,
    maxPlayerLevel: 1,
  };
}

function createInitialState(seed: number): MSSanctuaryState {
  const starterZone: MSPlayerZone = {
    templateId: 'volcanic_nest',
    unlocked: true,
    assignedMonsters: [],
    placedDecorations: [],
    upgradeLevel: 0,
  };

  return {
    playerLevel: 1,
    playerXP: 0,
    coins: 200,
    monsters: [],
    zones: [starterZone],
    foodInventory: { ember_berry: 5, moss_crunch: 3 },
    decorationInventory: [],
    placedDecorations: [],
    activeQuests: [],
    completedQuests: [],
    unlockedAchievements: [],
    hiredTrainers: [],
    dailyTask: null,
    dailyStreak: 0,
    lastDailyDate: '',
    counters: createDefaultCounters(),
    battleState: null,
    npcRelations: {},
    nextInstanceId: 1,
    seed,
  };
}

function calculateDamage(
  attackerStats: MSMonsterStats,
  defenderStats: MSMonsterStats,
  attackerElement: MSElement,
  defenderElement: MSElement,
  isSpecial: boolean,
  isDefending: boolean,
): number {
  const basePower = isSpecial
    ? attackerStats.effectiveMAG * 1.6
    : attackerStats.effectiveATK;
  const elementMult = getElementMultiplier(attackerElement, defenderElement);
  const defenseReduction = defenderStats.effectiveDEF / (defenderStats.effectiveDEF + 100);
  let damage = basePower * elementMult * (1 - defenseReduction);
  if (isDefending) damage *= 0.4;
  const variance = 0.85 + (elementMult * attackerStats.effectiveSPD % 30) / 100;
  damage *= variance;
  return Math.max(1, Math.floor(damage));
}

function determineEvolutionStage(level: number): MSEvolutionStage {
  if (level >= 40) return 'legendary';
  if (level >= 25) return 'adult';
  if (level >= 10) return 'teen';
  if (level >= 1) return 'baby';
  return 'egg';
}

// ============================================================================
// Hook: useMonsterSanctuary
// ============================================================================

function useMonsterSanctuary(initialSeed?: number) {
  const [state, setState] = useState<MSSanctuaryState>(() =>
    createInitialState(initialSeed ?? 42),
  );
  const seedRef = useRef(initialSeed ?? 42);
  const prngRef = useRef<(() => number) | null>(null);

  const getPRNG = useCallback((): (() => number) => {
    if (!prngRef.current) {
      prngRef.current = createPRNG(seedRef.current);
    }
    return prngRef.current;
  }, []);

  // -- State Management --------------------------------------------------

  const msGetState = useCallback((): MSSanctuaryState => {
    return state;
  }, [state]);

  const msResetState = useCallback((newSeed?: number): void => {
    const s = newSeed ?? seedRef.current;
    seedRef.current = s;
    prngRef.current = null;
    setState(createInitialState(s));
  }, []);

  // -- Player Level & Title ----------------------------------------------

  const msGetLevel = useCallback((): number => {
    return state.playerLevel;
  }, [state.playerLevel]);

  const msGetTitle = useCallback((): MSTitleName => {
    let title: MSTitleName = 'Caregiver';
    for (const t of MS_TITLE_THRESHOLDS) {
      if (state.playerLevel >= t.level) {
        title = t.title;
      }
    }
    return title;
  }, [state.playerLevel]);

  const msGetProgress = useCallback((): { current: number; required: number; percent: number } => {
    const currentLevelXP = XP_TABLE[state.playerLevel - 1] ?? 0;
    const nextLevelXP = XP_TABLE[state.playerLevel] ?? currentLevelXP;
    const progress = state.playerXP - currentLevelXP;
    const required = nextLevelXP - currentLevelXP;
    const percent = required > 0 ? Math.floor((progress / required) * 100) : 100;
    return { current: progress, required, percent: clampValue(percent, 0, 100) };
  }, [state.playerLevel, state.playerXP]);

  const msAddXP = useCallback((amount: number): { leveled: boolean; newLevel: number } => {
    let leveled = false;
    let newLevel = state.playerLevel;
    let newXP = state.playerXP + amount;

    while (newLevel < MS_MAX_LEVEL) {
      const needed = XP_TABLE[newLevel] - (XP_TABLE[newLevel - 1] ?? 0);
      const currentBase = XP_TABLE[newLevel - 1] ?? 0;
      if (newXP >= currentBase + needed) {
        newLevel++;
        leveled = true;
      } else {
        break;
      }
    }

    if (newLevel >= MS_MAX_LEVEL) {
      newLevel = MS_MAX_LEVEL;
      newXP = XP_TABLE[MS_MAX_LEVEL - 1] ?? state.playerXP;
    }

    setState((prev) => ({
      ...prev,
      playerLevel: newLevel,
      playerXP: newXP,
      counters: {
        ...prev.counters,
        maxPlayerLevel: Math.max(prev.counters.maxPlayerLevel, newLevel),
      },
    }));

    return { leveled, newLevel };
  }, [state.playerLevel, state.playerXP]);

  // -- Coins ------------------------------------------------------------

  const msGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const msAddCoins = useCallback((amount: number): number => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      counters: {
        ...prev.counters,
        totalCoinsEarned: prev.counters.totalCoinsEarned + Math.max(0, amount),
      },
    }));
    return state.coins + amount;
  }, [state.coins]);

  const msSpendCoins = useCallback((amount: number): boolean => {
    if (state.coins < amount) return false;
    setState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  // -- Monsters ---------------------------------------------------------

  const msGetMonsters = useCallback((): readonly MSPlayerMonster[] => {
    return state.monsters;
  }, [state.monsters]);

  const msGetMonsterById = useCallback(
    (instanceId: string): MSPlayerMonster | undefined => {
      return state.monsters.find((m) => m.instanceId === instanceId);
    },
    [state.monsters],
  );

  const msGetMonsterStats = useCallback(
    (instanceId: string): MSMonsterStats | null => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return null;
      const template = getTemplate(MS_MONSTERS, monster.typeId);
      if (!template) return null;

      let trainerBonus = 1.0;
      const zone = state.zones.find((z) =>
        z.assignedMonsters.includes(monster.instanceId),
      );
      if (zone) {
        const zoneTemplate = getTemplate(MS_ZONES, zone.templateId);
        if (zoneTemplate) {
          const matchingTrainer = state.hiredTrainers.find((tid) => {
            const trainer = getTemplate(MS_TRAINERS, tid);
            return trainer?.specialty === zoneTemplate.element;
          });
          if (matchingTrainer) {
            const trainer = getTemplate(MS_TRAINERS, matchingTrainer);
            trainerBonus = trainer?.trainingBonus ?? 1.0;
          }
        }
      }

      return calculateMonsterStats(template, monster, trainerBonus);
    },
    [state.monsters, state.zones, state.hiredTrainers],
  );

  const msHatchEgg = useCallback(
    (typeId: string, nickname?: string): MSPlayerMonster | null => {
      const template = getTemplate(MS_MONSTERS, typeId);
      if (!template) return null;

      const id = generateInstanceId(state);
      const baseHP = Math.floor(template.baseHP * 0.3 * 1.5);

      const newMonster: MSPlayerMonster = {
        instanceId: id,
        typeId,
        nickname: nickname ?? template.name,
        stage: 'egg',
        level: 0,
        xp: 0,
        hp: baseHP,
        maxHP: baseHP,
        happiness: 70,
        fedToday: false,
        assignedZone: null,
      };

      setState((prev) => {
        const hatchedSpecies = new Set(prev.monsters.map((m) => m.typeId));
        hatchedSpecies.add(typeId);
        return {
          ...prev,
          monsters: [...prev.monsters, newMonster],
          counters: {
            ...prev.counters,
            totalHatched: prev.counters.totalHatched + 1,
            uniqueSpeciesHatched: hatchedSpecies.size,
            totalMonstersAtOnce: Math.max(prev.counters.totalMonstersAtOnce, prev.monsters.length + 1),
          },
          nextInstanceId: prev.nextInstanceId + 1,
        };
      });

      return newMonster;
    },
    [state],
  );

  const msRenameMonster = useCallback(
    (instanceId: string, newName: string): boolean => {
      const exists = state.monsters.some((m) => m.instanceId === instanceId);
      if (!exists) return false;
      setState((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId ? { ...m, nickname: newName } : m,
        ),
      }));
      return true;
    },
    [state.monsters],
  );

  const msReleaseMonster = useCallback(
    (instanceId: string): boolean => {
      const exists = state.monsters.some((m) => m.instanceId === instanceId);
      if (!exists) return false;
      setState((prev) => ({
        ...prev,
        monsters: prev.monsters.filter((m) => m.instanceId !== instanceId),
        zones: prev.zones.map((z) => ({
          ...z,
          assignedMonsters: z.assignedMonsters.filter((id) => id !== instanceId),
        })),
      }));
      return true;
    },
    [state.monsters],
  );

  const msHealMonster = useCallback(
    (instanceId: string): boolean => {
      const exists = state.monsters.some((m) => m.instanceId === instanceId);
      if (!exists) return false;
      setState((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId ? { ...m, hp: m.maxHP } : m,
        ),
      }));
      return true;
    },
    [state.monsters],
  );

  const msGetMonsterHappiness = useCallback(
    (instanceId: string): number => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      return monster?.happiness ?? 0;
    },
    [state.monsters],
  );

  const msTrainMonster = useCallback(
    (instanceId: string): boolean => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster || monster.stage === 'egg') return false;

      let trainerBonus = 1.0;
      const zone = state.zones.find((z) =>
        z.assignedMonsters.includes(instanceId),
      );
      if (zone) {
        const zoneTemplate = getTemplate(MS_ZONES, zone.templateId);
        if (zoneTemplate) {
          const matchingTrainer = state.hiredTrainers.find((tid) => {
            const trainer = getTemplate(MS_TRAINERS, tid);
            return trainer?.specialty === zoneTemplate.element;
          });
          if (matchingTrainer) {
            const trainer = getTemplate(MS_TRAINERS, matchingTrainer);
            trainerBonus = trainer?.trainingBonus ?? 1.0;
          }
        }
      }

      const xpGain = Math.floor((15 + monster.level * 3) * trainerBonus);
      let newXP = monster.xp + xpGain;
      let newLevel = monster.level;

      while (
        newLevel < MS_MAX_LEVEL &&
        newXP >= (MONSTER_XP_TABLE[newLevel] ?? Infinity)
      ) {
        newXP -= MONSTER_XP_TABLE[newLevel] ?? 0;
        newLevel++;
      }

      if (newLevel >= MS_MAX_LEVEL) {
        newLevel = MS_MAX_LEVEL;
        newXP = 0;
      }

      const template = getTemplate(MS_MONSTERS, monster.typeId);
      const newMaxHP = template
        ? Math.floor(template.baseHP * getStageMultiplier(determineEvolutionStage(newLevel)) * (1 + (newLevel - 1) * 0.04) * 1.5)
        : monster.maxHP;

      setState((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId
            ? { ...m, level: newLevel, xp: newXP, maxHP: newMaxHP, hp: Math.min(m.hp, newMaxHP) }
            : m,
        ),
      }));

      return true;
    },
    [state.monsters, state.zones, state.hiredTrainers],
  );

  // -- Zones ------------------------------------------------------------

  const msGetZones = useCallback((): readonly MSPlayerZone[] => {
    return state.zones;
  }, [state.zones]);

  const msAssignMonster = useCallback(
    (instanceId: string, zoneId: string): boolean => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return false;

      const zoneIdx = state.zones.findIndex((z) => z.templateId === zoneId);
      if (zoneIdx === -1) return false;

      const zone = state.zones[zoneIdx];
      if (!zone.unlocked) return false;

      const zoneTemplate = getTemplate(MS_ZONES, zoneId);
      if (!zoneTemplate) return false;

      const effectiveCap = getEffectiveCapacity(zoneTemplate, zone.upgradeLevel);
      if (zone.assignedMonsters.length >= effectiveCap) return false;

      setState((prev) => ({
        ...prev,
        zones: prev.zones.map((z, i) => {
          if (i === zoneIdx) {
            return {
              ...z,
              assignedMonsters: [...z.assignedMonsters, instanceId],
            };
          }
          return {
            ...z,
            assignedMonsters: z.assignedMonsters.filter((id) => id !== instanceId),
          };
        }),
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId ? { ...m, assignedZone: zoneId } : m,
        ),
      }));

      return true;
    },
    [state.monsters, state.zones],
  );

  const msRemoveFromZone = useCallback(
    (instanceId: string): boolean => {
      const inZone = state.zones.some((z) => z.assignedMonsters.includes(instanceId));
      if (!inZone) return false;

      setState((prev) => ({
        ...prev,
        zones: prev.zones.map((z) => ({
          ...z,
          assignedMonsters: z.assignedMonsters.filter((id) => id !== instanceId),
        })),
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId ? { ...m, assignedZone: null } : m,
        ),
      }));

      return true;
    },
    [state.zones],
  );

  const msGetZoneCapacity = useCallback(
    (zoneId: string): { current: number; max: number } => {
      const zone = state.zones.find((z) => z.templateId === zoneId);
      const zoneTemplate = getTemplate(MS_ZONES, zoneId);
      if (!zone || !zoneTemplate) return { current: 0, max: 0 };
      const effectiveCap = getEffectiveCapacity(zoneTemplate, zone.upgradeLevel);
      return { current: zone.assignedMonsters.length, max: effectiveCap };
    },
    [state.zones],
  );

  const msUpgradeZone = useCallback(
    (zoneId: string): boolean => {
      const zoneIdx = state.zones.findIndex((z) => z.templateId === zoneId);
      if (zoneIdx === -1) return false;

      const zone = state.zones[zoneIdx];
      const zoneTemplate = getTemplate(MS_ZONES, zoneId);
      if (!zoneTemplate) return false;

      const upgradeCost = (zone.upgradeLevel + 1) * 500;
      if (state.coins < upgradeCost) return false;
      if (zone.upgradeLevel >= 5) return false;

      setState((prev) => ({
        ...prev,
        coins: prev.coins - upgradeCost,
        zones: prev.zones.map((z, i) =>
          i === zoneIdx ? { ...z, upgradeLevel: z.upgradeLevel + 1 } : z,
        ),
      }));

      return true;
    },
    [state.zones, state.coins],
  );

  // -- Food -------------------------------------------------------------

  const msGetFoods = useCallback((): readonly MSFoodTemplate[] => {
    return MS_FOODS;
  }, []);

  const msGetFoodInventory = useCallback((): Readonly<Record<string, number>> => {
    return state.foodInventory;
  }, [state.foodInventory]);

  const msBuyFood = useCallback(
    (foodId: string, quantity: number): boolean => {
      const food = getTemplate(MS_FOODS, foodId);
      if (!food) return false;
      const totalCost = food.cost * quantity;
      if (state.coins < totalCost) return false;

      setState((prev) => ({
        ...prev,
        coins: prev.coins - totalCost,
        foodInventory: {
          ...prev.foodInventory,
          [foodId]: (prev.foodInventory[foodId] ?? 0) + quantity,
        },
      }));

      return true;
    },
    [state.coins],
  );

  const msFeedMonster = useCallback(
    (instanceId: string, foodId: string): { success: boolean; xpGained: number; happinessGain: number } => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return { success: false, xpGained: 0, happinessGain: 0 };

      const food = getTemplate(MS_FOODS, foodId);
      if (!food) return { success: false, xpGained: 0, happinessGain: 0 };

      const currentAmount = state.foodInventory[foodId] ?? 0;
      if (currentAmount <= 0) return { success: false, xpGained: 0, happinessGain: 0 };

      const template = getTemplate(MS_MONSTERS, monster.typeId);
      let elementBonus = 1.0;
      if (template && food.element !== 'neutral' && template.element === food.element) {
        elementBonus = 1.5;
      }

      const xpGained = Math.floor(food.xpBonus * elementBonus);
      const happinessGain = Math.floor(food.happinessBoost * elementBonus);

      setState((prev) => ({
        ...prev,
        foodInventory: {
          ...prev.foodInventory,
          [foodId]: Math.max(0, (prev.foodInventory[foodId] ?? 0) - 1),
        },
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId
            ? {
                ...m,
                hp: Math.min(m.maxHP, m.hp + Math.floor(food.hungerRestore * elementBonus)),
                happiness: clampValue(m.happiness + happinessGain, 0, 100),
                fedToday: true,
              }
            : m,
        ),
        counters: {
          ...prev.counters,
          totalFed: prev.counters.totalFed + 1,
        },
      }));

      return { success: true, xpGained, happinessGain };
    },
    [state.monsters, state.foodInventory],
  );

  // -- Evolution --------------------------------------------------------

  const msGetEvolutionStage = useCallback(
    (instanceId: string): MSEvolutionStage => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      return monster?.stage ?? 'egg';
    },
    [state.monsters],
  );

  const msCanEvolve = useCallback(
    (instanceId: string): boolean => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster || monster.stage === 'legendary') return false;

      const currentStageIdx = MS_EVOLUTION_STAGES.findIndex(
        (s) => s.stage === monster.stage,
      );
      if (currentStageIdx === -1 || currentStageIdx >= MS_EVOLUTION_STAGES.length - 1) {
        return false;
      }

      const nextStage = MS_EVOLUTION_STAGES[currentStageIdx + 1];
      return monster.level >= nextStage.minLevel;
    },
    [state.monsters],
  );

  const msEvolveMonster = useCallback(
    (instanceId: string): boolean => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return false;

      const currentStageIdx = MS_EVOLUTION_STAGES.findIndex(
        (s) => s.stage === monster.stage,
      );
      if (currentStageIdx === -1 || currentStageIdx >= MS_EVOLUTION_STAGES.length - 1) {
        return false;
      }

      const nextStage = MS_EVOLUTION_STAGES[currentStageIdx + 1];
      if (monster.level < nextStage.minLevel) return false;

      const template = getTemplate(MS_MONSTERS, monster.typeId);
      const newMaxHP = template
        ? Math.floor(template.baseHP * getStageMultiplier(nextStage.stage) * (1 + (monster.level - 1) * 0.04) * 1.5)
        : monster.maxHP;

      const isLegendary = nextStage.stage === 'legendary';

      setState((prev) => ({
        ...prev,
        monsters: prev.monsters.map((m) =>
          m.instanceId === instanceId
            ? { ...m, stage: nextStage.stage, maxHP: newMaxHP, hp: newMaxHP }
            : m,
        ),
        counters: {
          ...prev.counters,
          totalEvolved: prev.counters.totalEvolved + 1,
          legendaryEvolved: prev.counters.legendaryEvolved + (isLegendary ? 1 : 0),
        },
      }));

      return true;
    },
    [state.monsters],
  );

  // -- Decorations ------------------------------------------------------

  const msGetDecorations = useCallback((): readonly MSDecorationTemplate[] => {
    return MS_DECORATIONS;
  }, []);

  const msBuyDecoration = useCallback(
    (decorationId: string): boolean => {
      const deco = getTemplate(MS_DECORATIONS, decorationId);
      if (!deco) return false;
      if (state.coins < deco.cost) return false;

      setState((prev) => ({
        ...prev,
        coins: prev.coins - deco.cost,
        decorationInventory: [...prev.decorationInventory, decorationId],
      }));

      return true;
    },
    [state.coins],
  );

  const msPlaceDecoration = useCallback(
    (decorationId: string, zoneId: string): boolean => {
      const decoIdx = state.decorationInventory.indexOf(decorationId);
      if (decoIdx === -1) return false;

      const deco = getTemplate(MS_DECORATIONS, decorationId);
      if (!deco) return false;

      const zone = state.zones.find((z) => z.templateId === zoneId);
      if (!zone || !zone.unlocked) return false;

      const zoneTemplate = getTemplate(MS_ZONES, zoneId);
      if (zoneTemplate && !deco.zoneElements.includes(zoneTemplate.element)) {
        return false;
      }

      const slotIndex = zone.placedDecorations.length;

      setState((prev) => ({
        ...prev,
        decorationInventory: prev.decorationInventory.filter((_, i) => i !== decoIdx),
        placedDecorations: [
          ...prev.placedDecorations,
          { decorationId, zoneId, slotIndex },
        ],
        zones: prev.zones.map((z) =>
          z.templateId === zoneId
            ? { ...z, placedDecorations: [...z.placedDecorations, decorationId] }
            : z,
        ),
        counters: {
          ...prev.counters,
          totalDecorationsPlaced: prev.counters.totalDecorationsPlaced + 1,
        },
      }));

      return true;
    },
    [state.decorationInventory, state.zones],
  );

  const msRemoveDecoration = useCallback(
    (decorationId: string, zoneId: string): boolean => {
      const placed = state.placedDecorations.find(
        (p) => p.decorationId === decorationId && p.zoneId === zoneId,
      );
      if (!placed) return false;

      setState((prev) => ({
        ...prev,
        decorationInventory: [...prev.decorationInventory, decorationId],
        placedDecorations: prev.placedDecorations.filter(
          (p) => !(p.decorationId === decorationId && p.zoneId === zoneId),
        ),
        zones: prev.zones.map((z) =>
          z.templateId === zoneId
            ? {
                ...z,
                placedDecorations: z.placedDecorations.filter((d) => d !== decorationId),
              }
            : z,
        ),
      }));

      return true;
    },
    [state.placedDecorations, state.zones],
  );

  // -- Quests -----------------------------------------------------------

  const msGetQuests = useCallback((): readonly MSQuestTemplate[] => {
    return MS_QUESTS;
  }, []);

  const msGetActiveQuests = useCallback((): readonly MSActiveQuest[] => {
    return state.activeQuests;
  }, [state.activeQuests]);

  const msAcceptQuest = useCallback(
    (questId: string): boolean => {
      const quest = getTemplate(MS_QUESTS, questId);
      if (!quest) return false;
      if (state.playerLevel < quest.requiredLevel) return false;
      if (state.activeQuests.some((q) => q.templateId === questId)) return false;
      if (state.completedQuests.includes(questId)) return false;

      setState((prev) => ({
        ...prev,
        activeQuests: [
          ...prev.activeQuests,
          { templateId: questId, progress: 0, accepted: true },
        ],
      }));

      return true;
    },
    [state.playerLevel, state.activeQuests, state.completedQuests],
  );

  const msCompleteQuest = useCallback(
    (questId: string): { success: boolean; coins: number; xp: number } => {
      const questIdx = state.activeQuests.findIndex((q) => q.templateId === questId);
      if (questIdx === -1) {
        return { success: false, coins: 0, xp: 0 };
      }

      const quest = getTemplate(MS_QUESTS, questId);
      if (!quest) return { success: false, coins: 0, xp: 0 };

      const activeQuest = state.activeQuests[questIdx];
      if (activeQuest.progress < quest.target) {
        return { success: false, coins: 0, xp: 0 };
      }

      setState((prev) => ({
        ...prev,
        coins: prev.coins + quest.reward,
        activeQuests: prev.activeQuests.filter((_, i) => i !== questIdx),
        completedQuests: [...prev.completedQuests, questId],
        counters: {
          ...prev.counters,
          totalQuestsCompleted: prev.counters.totalQuestsCompleted + 1,
        },
      }));

      return { success: true, coins: quest.reward, xp: quest.xpReward };
    },
    [state.activeQuests],
  );

  // -- Achievements -----------------------------------------------------

  const msGetAchievements = useCallback((): readonly MSAchievementTemplate[] => {
    return MS_ACHIEVEMENTS;
  }, []);

  const msCheckAchievements = useCallback(
    (): readonly string[] => {
      const newUnlocks: string[] = [];
      for (const ach of MS_ACHIEVEMENTS) {
        if (state.unlockedAchievements.includes(ach.id)) continue;
        const value = state.counters[ach.condition];
        if (value >= ach.threshold) {
          newUnlocks.push(ach.id);
        }
      }
      return newUnlocks;
    },
    [state.unlockedAchievements, state.counters],
  );

  const msUnlockAchievement = useCallback(
    (achievementId: string): { success: boolean; reward: number } => {
      if (state.unlockedAchievements.includes(achievementId)) {
        return { success: false, reward: 0 };
      }

      const ach = getTemplate(MS_ACHIEVEMENTS, achievementId);
      if (!ach) return { success: false, reward: 0 };

      const value = state.counters[ach.condition];
      if (value < ach.threshold) return { success: false, reward: 0 };

      setState((prev) => ({
        ...prev,
        coins: prev.coins + ach.reward,
        unlockedAchievements: [...prev.unlockedAchievements, achievementId],
      }));

      return { success: true, reward: ach.reward };
    },
    [state.unlockedAchievements, state.counters],
  );

  // -- Daily Tasks ------------------------------------------------------

  const msGetDailyTask = useCallback((): MSDailyTask | null => {
    return state.dailyTask;
  }, [state.dailyTask]);

  const msClaimDailyReward = useCallback(
    (): { success: boolean; reward: number } => {
      if (!state.dailyTask) return { success: false, reward: 0 };
      if (!state.dailyTask.completed) return { success: false, reward: 0 };
      if (state.dailyTask.claimed) return { success: false, reward: 0 };

      setState((prev) => ({
        ...prev,
        coins: prev.coins + prev.dailyTask!.reward,
        dailyTask: prev.dailyTask ? { ...prev.dailyTask, claimed: true } : null,
      }));

      return { success: true, reward: state.dailyTask.reward };
    },
    [state.dailyTask],
  );

  const msResetDaily = useCallback(
    (dateString: string): MSDailyTask => {
      const rng = createPRNG(
        dateString.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + 7919,
      );
      const idx = Math.floor(rng() * MS_DAILY_TASKS.length);
      const template = MS_DAILY_TASKS[idx];

      const newTask: MSDailyTask = {
        id: template.id,
        description: template.description,
        target: template.target,
        reward: template.reward,
        progress: 0,
        completed: false,
        claimed: false,
      };

      const isStreakContinuation = state.lastDailyDate === getPreviousDateString(dateString);
      const newStreak = isStreakContinuation ? state.dailyStreak + 1 : 1;

      setState((prev) => ({
        ...prev,
        dailyTask: newTask,
        lastDailyDate: dateString,
        dailyStreak: newStreak,
        monsters: prev.monsters.map((m) => ({ ...m, fedToday: false })),
      }));

      return newTask;
    },
    [state.lastDailyDate, state.dailyStreak],
  );

  const msAdvanceDailyProgress = useCallback(
    (amount: number): void => {
      if (!state.dailyTask || state.dailyTask.claimed) return;

      setState((prev) => {
        if (!prev.dailyTask || prev.dailyTask.claimed) return prev;

        const newProgress = Math.min(prev.dailyTask.target, prev.dailyTask.progress + amount);
        const completed = newProgress >= prev.dailyTask.target;

        return {
          ...prev,
          dailyTask: {
            ...prev.dailyTask,
            progress: newProgress,
            completed,
          },
          counters: completed
            ? {
                ...prev.counters,
                totalDailyCompleted: prev.counters.totalDailyCompleted + 1,
              }
            : prev.counters,
        };
      });
    },
    [state.dailyTask],
  );

  // -- NPCs -------------------------------------------------------------

  const msGetNPCs = useCallback((): readonly MSNPCTemplate[] => {
    return MS_NPCS;
  }, []);

  const msTalkToNPC = useCallback(
    (npcId: string): { greeting: string; affection: number } => {
      const npc = getTemplate(MS_NPCS, npcId);
      if (!npc) return { greeting: '', affection: 0 };

      const currentRelation = state.npcRelations[npcId] ?? 0;
      const newRelation = clampValue(currentRelation + 5, 0, 100);

      setState((prev) => ({
        ...prev,
        npcRelations: { ...prev.npcRelations, [npcId]: newRelation },
      }));

      msAdvanceDailyProgress(1);

      return { greeting: npc.greeting, affection: newRelation };
    },
    [state.npcRelations, msAdvanceDailyProgress],
  );

  const msGetNPCRelations = useCallback(
    (): Readonly<Record<string, number>> => {
      return state.npcRelations;
    },
    [state.npcRelations],
  );

  // -- Trainers ---------------------------------------------------------

  const msHireTrainer = useCallback(
    (trainerId: string): boolean => {
      const trainer = getTemplate(MS_TRAINERS, trainerId);
      if (!trainer) return false;
      if (state.hiredTrainers.includes(trainerId)) return false;
      if (state.coins < trainer.hireCost) return false;

      setState((prev) => ({
        ...prev,
        coins: prev.coins - trainer.hireCost,
        hiredTrainers: [...prev.hiredTrainers, trainerId],
        counters: {
          ...prev.counters,
          totalTrainersHired: prev.counters.totalTrainersHired + 1,
        },
      }));

      return true;
    },
    [state.hiredTrainers, state.coins],
  );

  const msGetHiredTrainers = useCallback((): readonly string[] => {
    return state.hiredTrainers;
  }, [state.hiredTrainers]);

  const msDismissTrainer = useCallback(
    (trainerId: string): boolean => {
      if (!state.hiredTrainers.includes(trainerId)) return false;

      setState((prev) => ({
        ...prev,
        hiredTrainers: prev.hiredTrainers.filter((id) => id !== trainerId),
      }));

      return true;
    },
    [state.hiredTrainers],
  );

  const msGetTrainerBonus = useCallback(
    (element: MSElement): number => {
      const matchingTrainerId = state.hiredTrainers.find((tid) => {
        const trainer = getTemplate(MS_TRAINERS, tid);
        return trainer?.specialty === element;
      });
      if (!matchingTrainerId) return 1.0;
      const trainer = getTemplate(MS_TRAINERS, matchingTrainerId);
      return trainer?.trainingBonus ?? 1.0;
    },
    [state.hiredTrainers],
  );

  // -- Breeding ---------------------------------------------------------

  const msCanBreed = useCallback(
    (instanceIdA: string, instanceIdB: string): boolean => {
      if (instanceIdA === instanceIdB) return false;
      const monsterA = state.monsters.find((m) => m.instanceId === instanceIdA);
      const monsterB = state.monsters.find((m) => m.instanceId === instanceIdB);
      if (!monsterA || !monsterB) return false;
      if (monsterA.stage === 'egg' || monsterB.stage === 'egg') return false;
      if (monsterA.level < 5 || monsterB.level < 5) return false;
      if (monsterA.typeId === monsterB.typeId) return false;
      return true;
    },
    [state.monsters],
  );

  const msGetBreedingCost = useCallback(
    (instanceIdA: string, instanceIdB: string): number => {
      const monsterA = state.monsters.find((m) => m.instanceId === instanceIdA);
      const monsterB = state.monsters.find((m) => m.instanceId === instanceIdB);
      if (!monsterA || !monsterB) return 0;
      return Math.floor((monsterA.level + monsterB.level) * 25);
    },
    [state.monsters],
  );

  const msBreedMonsters = useCallback(
    (instanceIdA: string, instanceIdB: string): MSPlayerMonster | null => {
      if (!msCanBreed(instanceIdA, instanceIdB)) return null;

      const monsterA = state.monsters.find((m) => m.instanceId === instanceIdA);
      const monsterB = state.monsters.find((m) => m.instanceId === instanceIdB);
      if (!monsterA || !monsterB) return null;

      const cost = Math.floor((monsterA.level + monsterB.level) * 25);
      if (state.coins < cost) return null;

      const rng = getPRNG();
      const parentA = getTemplate(MS_MONSTERS, monsterA.typeId);
      const parentB = getTemplate(MS_MONSTERS, monsterB.typeId);
      if (!parentA || !parentB) return null;

      const childTemplate = rng() < 0.5 ? parentA : parentB;
      const id = generateInstanceId(state);
      const baseHP = Math.floor(childTemplate.baseHP * 0.3 * 1.5);

      const newMonster: MSPlayerMonster = {
        instanceId: id,
        typeId: childTemplate.id,
        nickname: childTemplate.name,
        stage: 'egg',
        level: 0,
        xp: 0,
        hp: baseHP,
        maxHP: baseHP,
        happiness: 80,
        fedToday: false,
        assignedZone: null,
      };

      setState((prev) => ({
        ...prev,
        coins: prev.coins - cost,
        monsters: [...prev.monsters, newMonster],
        counters: {
          ...prev.counters,
          totalBreeded: prev.counters.totalBreeded + 1,
          totalMonstersAtOnce: Math.max(prev.counters.totalMonstersAtOnce, prev.monsters.length + 1),
        },
        nextInstanceId: prev.nextInstanceId + 1,
      }));

      return newMonster;
    },
    [state.monsters, state.coins, msCanBreed, getPRNG],
  );

  // -- Battle -----------------------------------------------------------

  const msGetBattleState = useCallback((): MSBattleState | null => {
    return state.battleState;
  }, [state.battleState]);

  const msStartBattle = useCallback(
    (playerInstanceId: string): MSBattleState | null => {
      if (state.battleState && state.battleState.result === 'ongoing') {
        return state.battleState;
      }

      const playerMonster = state.monsters.find(
        (m) => m.instanceId === playerInstanceId,
      );
      if (!playerMonster || playerMonster.stage === 'egg') return null;
      if (playerMonster.hp <= 0) return null;

      const rng = createPRNG(state.seed + Date.now() % 100000);
      const validEnemies = MS_MONSTERS.filter((m) => m.rarity !== 'legendary');
      const enemyTemplate = validEnemies[Math.floor(rng() * validEnemies.length)];

      const enemyLevel = clampValue(
        playerMonster.level + Math.floor(rng() * 5) - 2,
        1,
        MS_MAX_LEVEL,
      );

      const enemyMaxHP = Math.floor(
        enemyTemplate.baseHP *
          getStageMultiplier('adult') *
          (1 + (enemyLevel - 1) * 0.04) *
          1.5,
      );

      const enemyMonster: MSPlayerMonster = {
        instanceId: `enemy_${state.seed}_${Date.now() % 10000}`,
        typeId: enemyTemplate.id,
        nickname: `Wild ${enemyTemplate.name}`,
        stage: 'adult',
        level: enemyLevel,
        xp: 0,
        hp: enemyMaxHP,
        maxHP: enemyMaxHP,
        happiness: 50,
        fedToday: false,
        assignedZone: null,
      };

      const newBattle: MSBattleState = {
        playerMonster,
        enemyMonster,
        turn: 1,
        log: [`Battle started! ${playerMonster.nickname} vs Wild ${enemyTemplate.name}!`],
        result: 'ongoing',
        playerDefending: false,
      };

      setState((prev) => ({
        ...prev,
        battleState: newBattle,
      }));

      return newBattle;
    },
    [state.battleState, state.monsters, state.seed],
  );

  const msBattleTurn = useCallback(
    (action: MSBattleAction): MSBattleState | null => {
      if (!state.battleState || state.battleState.result !== 'ongoing') {
        return state.battleState;
      }

      const battle = state.battleState;
      const playerTemplate = getTemplate(MS_MONSTERS, battle.playerMonster.typeId);
      const enemyTemplate = getTemplate(MS_MONSTERS, battle.enemyMonster.typeId);
      if (!playerTemplate || !enemyTemplate) return battle;

      const playerStats = calculateMonsterStats(playerTemplate, battle.playerMonster, 1.0);
      const enemyStats = calculateMonsterStats(enemyTemplate, battle.enemyMonster, 1.0);

      const log: string[] = [...battle.log];
      let pHP = battle.playerMonster.hp;
      let eHP = battle.enemyMonster.hp;
      let result: MSBattleResult = 'ongoing';
      const newTurn = battle.turn + 1;

      // Player action
      if (action === 'flee') {
        const fleeChance = 0.4 + (playerStats.effectiveSPD - enemyStats.effectiveSPD) / 500;
        if (fleeChance > 0.6) {
          log.push(`${battle.playerMonster.nickname} fled successfully!`);
          result = 'flee';
        } else {
          log.push(`${battle.playerMonster.nickname} tried to flee but failed!`);
          const enemyDmg = calculateDamage(
            enemyStats, playerStats, enemyTemplate.element, playerTemplate.element, false, false,
          );
          pHP = Math.max(0, pHP - enemyDmg);
          log.push(`Wild ${enemyTemplate.name} attacks for ${enemyDmg} damage!`);
          if (pHP <= 0) {
            log.push(`${battle.playerMonster.nickname} was defeated!`);
            result = 'lose';
          }
        }
      } else if (action === 'defend') {
        log.push(`${battle.playerMonster.nickname} takes a defensive stance!`);
        const enemyDmg = calculateDamage(
          enemyStats, playerStats, enemyTemplate.element, playerTemplate.element,
          (state.seed + battle.turn) % 5 === 0, true,
        );
        pHP = Math.max(0, pHP - enemyDmg);
        log.push(`Wild ${enemyTemplate.name} attacks for ${enemyDmg} damage (reduced)!`);

        if (pHP <= 0) {
          log.push(`${battle.playerMonster.nickname} was defeated!`);
          result = 'lose';
        }
      } else if (action === 'heal') {
        const healAmount = Math.floor(playerStats.effectiveMAG * 0.8);
        pHP = Math.min(battle.playerMonster.maxHP, pHP + healAmount);
        log.push(`${battle.playerMonster.nickname} heals for ${healAmount} HP!`);

        const enemyDmg = calculateDamage(
          enemyStats, playerStats, enemyTemplate.element, playerTemplate.element, false, false,
        );
        pHP = Math.max(0, pHP - enemyDmg);
        log.push(`Wild ${enemyTemplate.name} attacks for ${enemyDmg} damage!`);

        if (pHP <= 0) {
          log.push(`${battle.playerMonster.nickname} was defeated!`);
          result = 'lose';
        }
      } else {
        const isSpecial = action === 'special';
        const playerDmg = calculateDamage(
          playerStats, enemyStats, playerTemplate.element, enemyTemplate.element,
          isSpecial, false,
        );
        eHP = Math.max(0, eHP - playerDmg);
        log.push(
          `${battle.playerMonster.nickname} uses ${isSpecial ? 'special' : 'attack'} for ${playerDmg} damage!`,
        );

        if (eHP <= 0) {
          log.push(`Wild ${enemyTemplate.name} was defeated!`);
          result = 'win';
        } else {
          const enemyIsSpecial = enemyStats.effectiveSPD > playerStats.effectiveSPD;
          const enemyDmg = calculateDamage(
            enemyStats, playerStats, enemyTemplate.element, playerTemplate.element,
            enemyIsSpecial, false,
          );
          pHP = Math.max(0, pHP - enemyDmg);
          log.push(`Wild ${enemyTemplate.name} attacks for ${enemyDmg} damage!`);

          if (pHP <= 0) {
            log.push(`${battle.playerMonster.nickname} was defeated!`);
            result = 'lose';
          }
        }
      }

      const newBattle: MSBattleState = {
        ...battle,
        playerMonster: { ...battle.playerMonster, hp: pHP },
        enemyMonster: { ...battle.enemyMonster, hp: eHP },
        turn: newTurn,
        log,
        result,
        playerDefending: action === 'defend',
      };

      setState((prev) => ({ ...prev, battleState: newBattle }));

      if (result === 'win') {
        const coinReward = 20 + battle.enemyMonster.level * 5;
        const xpReward = 30 + battle.enemyMonster.level * 8;
        setState((prev) => ({
          ...prev,
          coins: prev.coins + coinReward,
          counters: {
            ...prev.counters,
            totalBattlesWon: prev.counters.totalBattlesWon + 1,
            totalCoinsEarned: prev.counters.totalCoinsEarned + coinReward,
          },
        }));
      }

      return newBattle;
    },
    [state.battleState],
  );

  const msEndBattle = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      battleState: null,
    }));
  }, []);

  // -- Titles -----------------------------------------------------------

  const msGetTitleByLevel = useCallback(
    (level: number): MSTitleName => {
      let title: MSTitleName = 'Caregiver';
      for (const t of MS_TITLE_THRESHOLDS) {
        if (level >= t.level) title = t.title;
      }
      return title;
    },
    [],
  );

  const msGetNextTitle = useCallback((): { title: MSTitleName; levelNeeded: number; currentLevel: number } | null => {
    const nextThreshold = MS_TITLE_THRESHOLDS.find(
      (t) => t.level > state.playerLevel,
    );
    if (!nextThreshold) return null;
    return {
      title: nextThreshold.title,
      levelNeeded: nextThreshold.level,
      currentLevel: state.playerLevel,
    };
  }, [state.playerLevel]);

  // -- Stats ------------------------------------------------------------

  const msGetSanctuaryStats = useCallback((): MSSanctuaryStats => {
    const monsters = state.monsters;
    const avgHappiness =
      monsters.length > 0
        ? monsters.reduce((sum, m) => sum + m.happiness, 0) / monsters.length
        : 0;
    const avgLevel =
      monsters.length > 0
        ? monsters.reduce((sum, m) => sum + m.level, 0) / monsters.length
        : 0;

    return {
      totalMonsters: monsters.length,
      totalZonesUnlocked: state.zones.filter((z) => z.unlocked).length,
      totalDecorationsPlaced: state.placedDecorations.length,
      totalAchievements: state.unlockedAchievements.length,
      totalQuestsCompleted: state.completedQuests.length,
      avgHappiness: Math.round(avgHappiness * 100) / 100,
      avgLevel: Math.round(avgLevel * 100) / 100,
      battleRecord: {
        wins: state.counters.totalBattlesWon,
        losses: state.counters.totalEvolved > 0 ? Math.floor(state.counters.totalBattlesWon * 0.3) : 0,
      },
    };
  }, [state]);

  // -- Import / Export ---------------------------------------------------

  const msExportState = useCallback((): string => {
    return JSON.stringify(state);
  }, [state]);

  const msImportState = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString) as MSSanctuaryState;
        if (typeof parsed.playerLevel !== 'number') return false;
        if (!Array.isArray(parsed.monsters)) return false;
        setState(parsed);
        return true;
      } catch {
        return false;
      }
    },
    [],
  );

  // -- Seed -------------------------------------------------------------

  const msGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const msSetSeed = useCallback((newSeed: number): void => {
    seedRef.current = newSeed;
    prngRef.current = null;
    setState((prev) => ({ ...prev, seed: newSeed }));
  }, []);

  // -- Zone unlocking helper --------------------------------------------

  const msUnlockZone = useCallback(
    (zoneId: string): boolean => {
      const zoneTemplate = getTemplate(MS_ZONES, zoneId);
      if (!zoneTemplate) return false;

      const existingZone = state.zones.find((z) => z.templateId === zoneId);
      if (existingZone) return existingZone.unlocked;

      if (state.playerLevel < zoneTemplate.unlockLevel) return false;
      if (state.coins < zoneTemplate.unlockCost) return false;

      setState((prev) => ({
        ...prev,
        coins: prev.coins - zoneTemplate.unlockCost,
        zones: [
          ...prev.zones,
          {
            templateId: zoneId,
            unlocked: true,
            assignedMonsters: [],
            placedDecorations: [],
            upgradeLevel: 0,
          },
        ],
        counters: {
          ...prev.counters,
          zonesUnlocked: prev.zones.filter((z) => z.unlocked).length + 1,
        },
      }));

      return true;
    },
    [state.playerLevel, state.coins, state.zones],
  );

  // -- Monster count helper ---------------------------------------------

  const msGetMonsterCount = useCallback(
    (typeId?: string): number => {
      if (!typeId) return state.monsters.length;
      return state.monsters.filter((m) => m.typeId === typeId).length;
    },
    [state.monsters],
  );

  // -- Zone happiness bonus helper --------------------------------------

  const msGetZoneHappinessBonus = useCallback(
    (zoneId: string): number => {
      const zone = state.zones.find((z) => z.templateId === zoneId);
      if (!zone) return 0;

      let totalBonus = 0;
      for (const decoId of zone.placedDecorations) {
        const deco = getTemplate(MS_DECORATIONS, decoId);
        if (deco) totalBonus += deco.happinessBonus;
      }

      return totalBonus;
    },
    [state.zones],
  );

  // -- Get daily streak -------------------------------------------------

  const msGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  // -- Get battle log ---------------------------------------------------

  const msGetBattleLog = useCallback((): readonly string[] => {
    return state.battleState?.log ?? [];
  }, [state.battleState]);

  // -- Get available eggs to hatch --------------------------------------

  const msGetAvailableEggs = useCallback(
    (): readonly MSMonsterTemplate[] => {
      const rng = createPRNG(state.seed + state.playerLevel * 7 + 13);
      const available: MSMonsterTemplate[] = [];

      for (const monster of MS_MONSTERS) {
        const zone = state.zones.find((z) => z.templateId === monster.habitat);
        if (!zone || !zone.unlocked) continue;

        const rarityChance: Record<MSRarity, number> = {
          common: 0.6,
          uncommon: 0.3,
          rare: 0.15,
          epic: 0.08,
          legendary: 0.03,
        };

        if (rng() < rarityChance[monster.rarity]) {
          available.push(monster);
        }
      }

      return available;
    },
    [state.seed, state.playerLevel, state.zones],
  );

  // -- Get element affinity for a monster --------------------------------

  const msGetMonsterElement = useCallback(
    (instanceId: string): MSElement | null => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return null;
      const template = getTemplate(MS_MONSTERS, monster.typeId);
      return template?.element ?? null;
    },
    [state.monsters],
  );

  // -- Get random encounter monster --------------------------------------

  const msGetRandomEncounter = useCallback(
    (zoneId?: string): MSMonsterTemplate | null => {
      const rng = createPRNG(state.seed + Date.now() % 10000 + 97);
      const candidates = zoneId
        ? MS_MONSTERS.filter((m) => m.habitat === zoneId)
        : MS_MONSTERS;

      if (candidates.length === 0) return null;
      return candidates[Math.floor(rng() * candidates.length)];
    },
    [state.seed],
  );

  // -- Monster XP to next level ------------------------------------------

  const msGetMonsterXPToNext = useCallback(
    (instanceId: string): { current: number; needed: number; percent: number } => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return { current: 0, needed: 0, percent: 0 };

      const needed = MONSTER_XP_TABLE[monster.level] ?? 9999;
      const percent = needed > 0 ? Math.floor((monster.xp / needed) * 100) : 100;
      return {
        current: monster.xp,
        needed,
        percent: clampValue(percent, 0, 100),
      };
    },
    [state.monsters],
  );

  // -- Check if zone is unlocked -----------------------------------------

  const msIsZoneUnlocked = useCallback(
    (zoneId: string): boolean => {
      const zone = state.zones.find((z) => z.templateId === zoneId);
      return zone?.unlocked ?? false;
    },
    [state.zones],
  );

  // -- Get monster rarity -----------------------------------------------

  const msGetMonsterRarity = useCallback(
    (instanceId: string): MSRarity | null => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return null;
      const template = getTemplate(MS_MONSTERS, monster.typeId);
      return template?.rarity ?? null;
    },
    [state.monsters],
  );

  // -- Get total unlocked achievement count ------------------------------

  const msGetUnlockedAchievementCount = useCallback((): number => {
    return state.unlockedAchievements.length;
  }, [state.unlockedAchievements]);

  // -- Get monster habitat info ------------------------------------------

  const msGetMonsterHabitat = useCallback(
    (instanceId: string): string | null => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return null;
      const template = getTemplate(MS_MONSTERS, monster.typeId);
      return template?.habitat ?? null;
    },
    [state.monsters],
  );

  // -- Get zone monsters ------------------------------------------------

  const msGetZoneMonsters = useCallback(
    (zoneId: string): readonly MSPlayerMonster[] => {
      const zone = state.zones.find((z) => z.templateId === zoneId);
      if (!zone) return [];
      return zone.assignedMonsters
        .map((id) => state.monsters.find((m) => m.instanceId === id))
        .filter((m): m is MSPlayerMonster => m !== undefined);
    },
    [state.zones, state.monsters],
  );

  // -- Pay daily trainer costs ------------------------------------------

  const msPayDailyTrainerCosts = useCallback((): number => {
    let totalCost = 0;
    for (const trainerId of state.hiredTrainers) {
      const trainer = getTemplate(MS_TRAINERS, trainerId);
      if (trainer) totalCost += trainer.dailyCost;
    }

    if (totalCost > 0 && state.coins >= totalCost) {
      setState((prev) => ({ ...prev, coins: prev.coins - totalCost }));
    }

    return totalCost;
  }, [state.hiredTrainers, state.coins]);

  // -- Get element effectiveness -----------------------------------------

  const msGetElementEffectiveness = useCallback(
    (attacker: MSElement, defender: MSElement): number => {
      return getElementMultiplier(attacker, defender);
    },
    [],
  );

  // -- Batch heal all monsters ------------------------------------------

  const msHealAllMonsters = useCallback((): number => {
    const woundedCount = state.monsters.filter((m) => m.hp < m.maxHP).length;
    if (woundedCount === 0) return 0;

    setState((prev) => ({
      ...prev,
      monsters: prev.monsters.map((m) => ({ ...m, hp: m.maxHP })),
    }));

    return woundedCount;
  }, [state.monsters]);

  // -- Batch feed all hungry monsters -----------------------------------

  const msFeedAllHungry = useCallback(
    (foodId: string): { fed: number; remaining: number } => {
      const hungryMonsters = state.monsters.filter((m) => !m.fedToday && m.stage !== 'egg');
      const available = state.foodInventory[foodId] ?? 0;
      const fed = Math.min(hungryMonsters.length, available);

      if (fed === 0) return { fed: 0, remaining: available };

      setState((prev) => {
        const fedIds = new Set(hungryMonsters.slice(0, fed).map((m) => m.instanceId));
        return {
          ...prev,
          foodInventory: {
            ...prev.foodInventory,
            [foodId]: available - fed,
          },
          monsters: prev.monsters.map((m) =>
            fedIds.has(m.instanceId)
              ? {
                  ...m,
                  fedToday: true,
                  happiness: clampValue(m.happiness + 3, 0, 100),
                }
              : m,
          ),
          counters: {
            ...prev.counters,
            totalFed: prev.counters.totalFed + fed,
          },
        };
      });

      msAdvanceDailyProgress(fed);
      return { fed, remaining: available - fed };
    },
    [state.monsters, state.foodInventory, msAdvanceDailyProgress],
  );

  // -- Get unique species count -----------------------------------------

  const msGetUniqueSpeciesCount = useCallback((): number => {
    const species = new Set(state.monsters.map((m) => m.typeId));
    return species.size;
  }, [state.monsters]);

  // -- Sort monsters by stat --------------------------------------------

  const msSortMonstersBy = useCallback(
    (
      sortBy: 'level' | 'happiness' | 'hp' | 'atk' | 'def' | 'spd' | 'mag',
      ascending: boolean = false,
    ): readonly MSPlayerMonster[] => {
      return [...state.monsters].sort((a, b) => {
        let valA: number;
        let valB: number;

        if (sortBy === 'level') {
          valA = a.level;
          valB = b.level;
        } else if (sortBy === 'happiness') {
          valA = a.happiness;
          valB = b.happiness;
        } else if (sortBy === 'hp') {
          valA = a.maxHP;
          valB = b.maxHP;
        } else {
          const templateA = getTemplate(MS_MONSTERS, a.typeId);
          const templateB = getTemplate(MS_MONSTERS, b.typeId);
          const stageA = getStageMultiplier(a.stage);
          const stageB = getStageMultiplier(b.stage);
          const levelA = 1 + (a.level - 1) * 0.04;
          const levelB = 1 + (b.level - 1) * 0.04;

          switch (sortBy) {
            case 'atk':
              valA = (templateA?.baseATK ?? 0) * stageA * levelA;
              valB = (templateB?.baseATK ?? 0) * stageB * levelB;
              break;
            case 'def':
              valA = (templateA?.baseDEF ?? 0) * stageA * levelA;
              valB = (templateB?.baseDEF ?? 0) * stageB * levelB;
              break;
            case 'spd':
              valA = (templateA?.baseSPD ?? 0) * stageA * levelA;
              valB = (templateB?.baseSPD ?? 0) * stageB * levelB;
              break;
            case 'mag':
              valA = (templateA?.baseMAG ?? 0) * stageA * levelA;
              valB = (templateB?.baseMAG ?? 0) * stageB * levelB;
              break;
            default:
              valA = 0;
              valB = 0;
          }
        }

        return ascending ? valA - valB : valB - valA;
      });
    },
    [state.monsters],
  );

  // -- Filter monsters --------------------------------------------------

  const msFilterMonsters = useCallback(
    (filters: {
      element?: MSElement;
      stage?: MSEvolutionStage;
      minLevel?: number;
      maxLevel?: number;
      rarity?: MSRarity;
      assigned?: boolean;
      healthy?: boolean;
    }): readonly MSPlayerMonster[] => {
      return state.monsters.filter((m) => {
        if (filters.element) {
          const template = getTemplate(MS_MONSTERS, m.typeId);
          if (template?.element !== filters.element) return false;
        }
        if (filters.stage && m.stage !== filters.stage) return false;
        if (filters.minLevel !== undefined && m.level < filters.minLevel) return false;
        if (filters.maxLevel !== undefined && m.level > filters.maxLevel) return false;
        if (filters.rarity) {
          const template = getTemplate(MS_MONSTERS, m.typeId);
          if (template?.rarity !== filters.rarity) return false;
        }
        if (filters.assigned === true && !m.assignedZone) return false;
        if (filters.assigned === false && m.assignedZone) return false;
        if (filters.healthy === true && m.hp < m.maxHP) return false;
        if (filters.healthy === false && m.hp >= m.maxHP) return false;
        return true;
      });
    },
    [state.monsters],
  );

  // -- Get quest progress -----------------------------------------------

  const msGetQuestProgress = useCallback(
    (questId: string): { progress: number; target: number; complete: boolean } => {
      const active = state.activeQuests.find((q) => q.templateId === questId);
      const quest = getTemplate(MS_QUESTS, questId);
      if (!quest) return { progress: 0, target: 0, complete: false };

      if (!active) {
        return { progress: 0, target: quest.target, complete: state.completedQuests.includes(questId) };
      }

      return {
        progress: active.progress,
        target: quest.target,
        complete: active.progress >= quest.target,
      };
    },
    [state.activeQuests, state.completedQuests],
  );

  // -- Increment quest progress -----------------------------------------

  const msIncrementQuestProgress = useCallback(
    (questType: MSQuestTemplate['type'], amount?: number): void => {
      const increment = amount ?? 1;

      setState((prev) => {
        let updated = false;
        const newActiveQuests = prev.activeQuests.map((q) => {
          const quest = getTemplate(MS_QUESTS, q.templateId);
          if (!quest || quest.type !== questType) return q;
          if (q.progress >= quest.target) return q;

          updated = true;
          return {
            ...q,
            progress: Math.min(quest.target, q.progress + increment),
          };
        });

        if (updated) {
          return { ...prev, activeQuests: newActiveQuests };
        }
        return prev;
      });
    },
    [],
  );

  // -- Get max monsters allowed -----------------------------------------

  const msGetMaxMonsters = useCallback((): number => {
    const zoneSlots = state.zones
      .filter((z) => z.unlocked)
      .reduce((total, z) => {
        const template = getTemplate(MS_ZONES, z.templateId);
        return total + (template ? getEffectiveCapacity(template, z.upgradeLevel) : 0);
      }, 0);
    return zoneSlots;
  }, [state.zones]);

  // -- Get evolution info for monster -----------------------------------

  const msGetEvolutionInfo = useCallback(
    (instanceId: string): { current: MSEvolutionStage; next: MSEvolutionStage | null; levelNeeded: number; canEvolve: boolean } | null => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return null;

      const currentIdx = MS_EVOLUTION_STAGES.findIndex((s) => s.stage === monster.stage);
      if (currentIdx === -1 || currentIdx >= MS_EVOLUTION_STAGES.length - 1) {
        return { current: monster.stage, next: null, levelNeeded: 0, canEvolve: false };
      }

      const nextStage = MS_EVOLUTION_STAGES[currentIdx + 1];
      const canEvolve = monster.level >= nextStage.minLevel;

      return {
        current: monster.stage,
        next: nextStage.stage,
        levelNeeded: nextStage.minLevel,
        canEvolve,
      };
    },
    [state.monsters],
  );

  // -- Restore all monsters HP ------------------------------------------

  const msRestoreAllHP = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      monsters: prev.monsters.map((m) => ({ ...m, hp: m.maxHP })),
    }));
  }, []);

  // -- Decay happiness over time ----------------------------------------

  const msDecayHappiness = useCallback((): number => {
    setState((prev) => ({
      ...prev,
      monsters: prev.monsters.map((m) => ({
        ...m,
        happiness: Math.max(0, m.happiness - 2),
      })),
    }));
    return state.monsters.length;
  }, [state.monsters.length]);

  // -- Check if monster is at max level ---------------------------------

  const msIsMaxLevel = useCallback(
    (instanceId: string): boolean => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      return (monster?.level ?? 0) >= MS_MAX_LEVEL;
    },
    [state.monsters],
  );

  // -- Get food effectiveness for monster --------------------------------

  const msGetFoodEffectiveness = useCallback(
    (foodId: string, instanceId: string): number => {
      const food = getTemplate(MS_FOODS, foodId);
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!food || !monster) return 1.0;

      if (food.element === 'neutral') return 1.0;

      const template = getTemplate(MS_MONSTERS, monster.typeId);
      if (!template) return 1.0;

      return template.element === food.element ? 1.5 : 0.8;
    },
    [state.monsters],
  );

  // -- Return all hook functions and state ------------------------------

  return {
    // State
    msGetState,
    msResetState,

    // Player
    msGetLevel,
    msGetTitle,
    msGetProgress,
    msAddXP,
    msGetCoins,
    msAddCoins,
    msSpendCoins,

    // Monsters
    msGetMonsters,
    msGetMonsterById,
    msGetMonsterStats,
    msHatchEgg,
    msRenameMonster,
    msReleaseMonster,
    msHealMonster,
    msGetMonsterHappiness,
    msTrainMonster,
    msGetMonsterCount,
    msGetMonsterElement,
    msGetMonsterRarity,
    msGetMonsterHabitat,
    msGetMonsterXPToNext,
    msGetMonsterEggColor: (instanceId: string): string => {
      const monster = state.monsters.find((m) => m.instanceId === instanceId);
      if (!monster) return '#888888';
      const template = getTemplate(MS_MONSTERS, monster.typeId);
      return template?.eggColor ?? '#888888';
    },
    msIsMaxLevel,

    // Zones
    msGetZones,
    msAssignMonster,
    msRemoveFromZone,
    msGetZoneCapacity,
    msUpgradeZone,
    msUnlockZone,
    msIsZoneUnlocked,
    msGetZoneMonsters,
    msGetZoneHappinessBonus,

    // Food
    msGetFoods,
    msGetFoodInventory,
    msBuyFood,
    msFeedMonster,
    msGetFoodEffectiveness,
    msFeedAllHungry,

    // Evolution
    msGetEvolutionStage,
    msCanEvolve,
    msEvolveMonster,
    msGetEvolutionInfo,

    // Decorations
    msGetDecorations,
    msBuyDecoration,
    msPlaceDecoration,
    msRemoveDecoration,

    // Quests
    msGetQuests,
    msGetActiveQuests,
    msAcceptQuest,
    msCompleteQuest,
    msGetQuestProgress,
    msIncrementQuestProgress,

    // Achievements
    msGetAchievements,
    msCheckAchievements,
    msUnlockAchievement,
    msGetUnlockedAchievementCount,

    // Daily
    msGetDailyTask,
    msClaimDailyReward,
    msResetDaily,
    msAdvanceDailyProgress,
    msGetDailyStreak,

    // NPCs
    msGetNPCs,
    msTalkToNPC,
    msGetNPCRelations,

    // Trainers
    msHireTrainer,
    msGetHiredTrainers,
    msDismissTrainer,
    msGetTrainerBonus,
    msPayDailyTrainerCosts,

    // Breeding
    msCanBreed,
    msGetBreedingCost,
    msBreedMonsters,

    // Battle
    msGetBattleState,
    msStartBattle,
    msBattleTurn,
    msEndBattle,
    msGetBattleLog,

    // Titles
    msGetTitleByLevel,
    msGetNextTitle,

    // Stats
    msGetSanctuaryStats,

    // Import / Export
    msExportState,
    msImportState,

    // Seed
    msGetSeed,
    msSetSeed,

    // Utilities
    msGetElementEffectiveness,
    msGetAvailableEggs,
    msGetRandomEncounter,
    msHealAllMonsters,
    msRestoreAllHP,
    msGetUniqueSpeciesCount,
    msSortMonstersBy,
    msFilterMonsters,
    msGetMaxMonsters,
    msDecayHappiness,
  };
}

// ============================================================================
// Helper: get previous date string (for streak calculation)
// ============================================================================

function getPreviousDateString(dateString: string): string {
  const parts = dateString.split('-');
  if (parts.length < 3) return '';
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default useMonsterSanctuary;
