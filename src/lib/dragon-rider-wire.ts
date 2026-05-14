// ============================================================
// dragon-rider-wire.ts — Dragon Rider (龙骑士) Wire
// Dragon riding aerial combat with breeding, races & defense
// All named exports use `dr` prefix. No React in named exports.
// ============================================================

// ---- Dragon Element Types ----
export type DrElement =
  | 'fire'
  | 'ice'
  | 'storm'
  | 'shadow'
  | 'crystal'
  | 'earth'
  | 'wind'
  | 'phantom'
  | 'iron'
  | 'ember';

// ---- Dragon Life Stage ----
export type DrLifeStage = 'egg' | 'hatchling' | 'juvenile' | 'adult' | 'elder';

// ---- Dragon Rarity ----
export type DrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

// ---- Equipment Slot ----
export type DrEquipSlot = 'saddle' | 'armor' | 'reins' | 'amulet' | 'clawGuard';

// ---- Mission Status ----
export type DrMissionStatus = 'available' | 'inProgress' | 'completed' | 'failed';

// ---- Race Status ----
export type DrRaceStatus = 'idle' | 'countdown' | 'racing' | 'finished';

// ---- Flight Zone ----
export type DrFlightZoneId =
  | 'volcanic_peaks'
  | 'frozen_tundra'
  | 'storm_heights'
  | 'shadow_vale'
  | 'crystal_spire'
  | 'ancient_ruins';

// ---- Enemy ID ----
export type DrEnemyId =
  | 'harpy'
  | 'griffon'
  | 'chimera'
  | 'thunderbird'
  | 'wyvern'
  | 'basilisk'
  | 'manticore'
  | 'roc'
  | 'dark_phoenix'
  | 'shadow_bat'
  | 'storm_falcon'
  | 'frost_eagle';

// ---- Territory ID ----
export type DrTerritoryId =
  | 'dragons_keep'
  | 'ember_plains'
  | 'frost_gate'
  | 'thunder_ridge'
  | 'shadow_march'
  | 'crystal_lake'
  | 'iron_forge'
  | 'sky_citadel';

// ---- Achievement ID ----
export type DrAchievementId =
  | 'first_flight'
  | 'breeder_novice'
  | 'ace_rider'
  | 'defender'
  | 'champion_breeder'
  | 'storm_breaker'
  | 'shadow_slayer'
  | 'legendary_bond'
  | 'speed_demon'
  | 'kingdom_hero'
  | 'dragon_lord'
  | 'elemental_master'
  | 'perfectionist'
  | 'daily_patrol_7'
  | 'ancient_awakener';

// ---- Dragon Species Definition ----
export interface DrDragonSpecies {
  readonly id: string;
  readonly name: string;
  readonly element: DrElement;
  readonly baseHp: number;
  readonly baseSpeed: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly rarity: DrRarity;
  readonly description: string;
  readonly evolutionLevel: number;
}

// ---- Dragon Instance ----
export interface DrDragon {
  readonly id: string;
  readonly speciesId: string;
  readonly name: string;
  readonly nickname: string;
  readonly level: number;
  readonly xp: number;
  readonly lifeStage: DrLifeStage;
  readonly hp: number;
  readonly maxHp: number;
  readonly speed: number;
  readonly attack: number;
  readonly defense: number;
  readonly bond: number;
  readonly happiness: number;
  readonly isMounted: boolean;
}

// ---- Dragon Egg ----
export interface DrDragonEgg {
  readonly id: string;
  readonly speciesId: string;
  readonly incubationDays: number;
  readonly daysRemaining: number;
  readonly isReady: boolean;
}

// ---- Riding Skill ----
export interface DrRidingSkill {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cooldown: number;
  readonly currentCooldown: number;
  readonly damage: number;
  readonly element: DrElement;
  readonly isUnlocked: boolean;
  readonly level: number;
}

// ---- Flight Zone ----
export interface DrFlightZone {
  readonly id: DrFlightZoneId;
  readonly name: string;
  readonly description: string;
  readonly difficulty: number;
  readonly element: DrElement;
  readonly requiredLevel: number;
  readonly isUnlocked: boolean;
  readonly enemies: readonly DrEnemyId[];
}

// ---- Aerial Enemy ----
export interface DrAerialEnemy {
  readonly id: DrEnemyId;
  readonly name: string;
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly speed: number;
  readonly element: DrElement;
  readonly isBoss: boolean;
  readonly reward: number;
}

// ---- Territory ----
export interface DrTerritory {
  readonly id: DrTerritoryId;
  readonly name: string;
  readonly defenseLevel: number;
  readonly maxDefenseLevel: number;
  readonly underSiege: boolean;
  readonly siegeProgress: number;
  readonly defenderCount: number;
  readonly requiredRiders: number;
}

// ---- Kingdom Defense Mission ----
export interface DrDefenseMission {
  readonly id: string;
  readonly territoryId: DrTerritoryId;
  readonly status: DrMissionStatus;
  readonly wave: number;
  readonly maxWaves: number;
  readonly enemiesDefeated: number;
  readonly dragonsDeployed: readonly string[];
  readonly reward: number;
  readonly startTime: number;
}

// ---- Equipment Item ----
export interface DrEquipment {
  readonly id: string;
  readonly name: string;
  readonly slot: DrEquipSlot;
  readonly statBoost: number;
  readonly element: DrElement;
  readonly rarity: DrRarity;
  readonly isEquipped: boolean;
  readonly dragonId: string;
}

// ---- Race ----
export interface DrAerialRace {
  readonly id: string;
  readonly zoneId: DrFlightZoneId;
  readonly status: DrRaceStatus;
  readonly distance: number;
  readonly currentTime: number;
  readonly bestTime: number;
  readonly dragonId: string;
  readonly obstaclesCleared: number;
  readonly rank: number;
}

// ---- Achievement ----
export interface DrAchievement {
  readonly id: DrAchievementId;
  readonly name: string;
  readonly description: string;
  readonly isUnlocked: boolean;
  readonly progress: number;
  readonly target: number;
  readonly reward: number;
}

// ---- Daily Patrol ----
export interface DrDailyPatrol {
  readonly id: string;
  readonly zoneId: DrFlightZoneId;
  readonly isCompleted: boolean;
  readonly enemiesDefeated: number;
  readonly requiredKills: number;
  readonly reward: number;
  readonly streak: number;
}

// ---- Rider Profile ----
export interface DrRiderProfile {
  readonly name: string;
  readonly title: string;
  readonly level: number;
  readonly xp: number;
  readonly maxXp: number;
  readonly gold: number;
  readonly gems: number;
  readonly totalFlights: number;
  readonly totalKills: number;
  readonly totalRaces: number;
  readonly totalBreeds: number;
  readonly totalDefenses: number;
}

// ---- Combat Log Entry ----
export interface DrCombatEntry {
  readonly id: string;
  readonly turn: number;
  readonly attacker: string;
  readonly defender: string;
  readonly skill: string;
  readonly damage: number;
  readonly isCritical: boolean;
  readonly timestamp: number;
}

// ---- Breeding Record ----
export interface DrBreedingRecord {
  readonly id: string;
  readonly parentA: string;
  readonly parentB: string;
  readonly offspringId: string;
  readonly date: number;
  readonly inheritedTraits: readonly string[];
}

// ---- Complete State ----
export interface DragonRiderState {
  readonly rider: DrRiderProfile;
  readonly dragons: readonly DrDragon[];
  readonly activeDragonId: string;
  readonly eggs: readonly DrDragonEgg[];
  readonly skills: readonly DrRidingSkill[];
  readonly zones: readonly DrFlightZone[];
  readonly enemies: readonly DrAerialEnemy[];
  readonly territories: readonly DrTerritory[];
  readonly defenseMissions: readonly DrDefenseMission[];
  readonly equipment: readonly DrEquipment[];
  readonly races: readonly DrAerialRace[];
  readonly achievements: readonly DrAchievement[];
  readonly dailyPatrol: DrDailyPatrol;
  readonly combatLog: readonly DrCombatEntry[];
  readonly breedingLog: readonly DrBreedingRecord[];
  readonly currentZoneId: DrFlightZoneId;
  readonly isMounted: boolean;
  readonly currentHp: number;
}

// ============================================================
// CONSTANTS — Dragon Species
// ============================================================

export const DR_DRAGON_SPECIES: readonly DrDragonSpecies[] = [
  {
    id: 'fire_drake',
    name: 'Fire Drake',
    element: 'fire',
    baseHp: 120,
    baseSpeed: 85,
    baseAttack: 30,
    baseDefense: 20,
    rarity: 'common',
    description: 'A fierce fire-breathing drake, loyal and bold.',
    evolutionLevel: 10,
  },
  {
    id: 'ice_wyrm',
    name: 'Ice Wyrm',
    element: 'ice',
    baseHp: 130,
    baseSpeed: 70,
    baseAttack: 25,
    baseDefense: 30,
    rarity: 'common',
    description: 'A serpentine wyrm that commands the frost.',
    evolutionLevel: 10,
  },
  {
    id: 'storm_dragon',
    name: 'Storm Dragon',
    element: 'storm',
    baseHp: 110,
    baseSpeed: 95,
    baseAttack: 28,
    baseDefense: 22,
    rarity: 'uncommon',
    description: 'Lightning-wreathed dragon of tempest skies.',
    evolutionLevel: 15,
  },
  {
    id: 'shadow_drake',
    name: 'Shadow Drake',
    element: 'shadow',
    baseHp: 100,
    baseSpeed: 100,
    baseAttack: 35,
    baseDefense: 15,
    rarity: 'uncommon',
    description: 'Veiled in darkness, strikes from the unseen.',
    evolutionLevel: 15,
  },
  {
    id: 'crystal_dragon',
    name: 'Crystal Dragon',
    element: 'crystal',
    baseHp: 140,
    baseSpeed: 75,
    baseAttack: 22,
    baseDefense: 35,
    rarity: 'rare',
    description: 'Scales of living crystal deflect all but the strongest blows.',
    evolutionLevel: 20,
  },
  {
    id: 'earth_wyrm',
    name: 'Earth Wyrm',
    element: 'earth',
    baseHp: 160,
    baseSpeed: 55,
    baseAttack: 26,
    baseDefense: 40,
    rarity: 'rare',
    description: 'Ancient guardian of the mountain roots.',
    evolutionLevel: 20,
  },
  {
    id: 'sky_serpent',
    name: 'Sky Serpent',
    element: 'wind',
    baseHp: 90,
    baseSpeed: 110,
    baseAttack: 20,
    baseDefense: 18,
    rarity: 'epic',
    description: 'Swift as the gale, dancing among the clouds.',
    evolutionLevel: 25,
  },
  {
    id: 'phantom_drake',
    name: 'Phantom Drake',
    element: 'phantom',
    baseHp: 105,
    baseSpeed: 90,
    baseAttack: 32,
    baseDefense: 25,
    rarity: 'epic',
    description: 'Neither alive nor dead — a spectral predator.',
    evolutionLevel: 25,
  },
  {
    id: 'iron_dragon',
    name: 'Iron Dragon',
    element: 'iron',
    baseHp: 180,
    baseSpeed: 50,
    baseAttack: 38,
    baseDefense: 45,
    rarity: 'epic',
    description: 'Forged in the heart of a dying star.',
    evolutionLevel: 30,
  },
  {
    id: 'ember_wyrm',
    name: 'Ember Wyrm',
    element: 'ember',
    baseHp: 150,
    baseSpeed: 80,
    baseAttack: 36,
    baseDefense: 28,
    rarity: 'legendary',
    description: 'Last descendant of the Primordial Flame.',
    evolutionLevel: 35,
  },
] as const;

// ============================================================
// CONSTANTS — Riding Skills (8)
// ============================================================

export const DR_RIDING_SKILLS: readonly Omit<DrRidingSkill, 'currentCooldown' | 'isUnlocked' | 'level'>[] = [
  {
    id: 'barrel_roll',
    name: 'Barrel Roll',
    description: 'Dodge incoming attacks with a swift aerial spin.',
    cooldown: 3,
    damage: 0,
    element: 'wind',
  },
  {
    id: 'dive_bomb',
    name: 'Dive Bomb',
    description: 'Plummet from above for devastating impact damage.',
    cooldown: 5,
    damage: 45,
    element: 'earth',
  },
  {
    id: 'fire_breath',
    name: 'Fire Breath',
    description: 'Unleash a torrent of dragon fire upon foes.',
    cooldown: 4,
    damage: 35,
    element: 'fire',
  },
  {
    id: 'ice_shield',
    name: 'Ice Shield',
    description: 'Encase yourself in protective ice crystals.',
    cooldown: 6,
    damage: 0,
    element: 'ice',
  },
  {
    id: 'lightning_strike',
    name: 'Lightning Strike',
    description: 'Call down a bolt of lightning from the heavens.',
    cooldown: 4,
    damage: 40,
    element: 'storm',
  },
  {
    id: 'shadow_cloak',
    name: 'Shadow Cloak',
    description: 'Vanish into shadows, becoming untargetable.',
    cooldown: 7,
    damage: 0,
    element: 'shadow',
  },
  {
    id: 'wind_gust',
    name: 'Wind Gust',
    description: 'Blast enemies with a powerful gust of wind.',
    cooldown: 3,
    damage: 20,
    element: 'wind',
  },
  {
    id: 'dragon_roar',
    name: 'Dragon Roar',
    description: 'Let out a terrifying roar that stuns all nearby foes.',
    cooldown: 8,
    damage: 25,
    element: 'iron',
  },
] as const;

// ============================================================
// CONSTANTS — Flight Zones (6)
// ============================================================

export const DR_FLIGHT_ZONES: readonly Omit<DrFlightZone, 'isUnlocked'>[] = [
  {
    id: 'volcanic_peaks',
    name: 'Volcanic Peaks',
    description: 'Treacherous peaks wreathed in smoke and lava.',
    difficulty: 1,
    element: 'fire',
    requiredLevel: 1,
    enemies: ['harpy', 'fire_drake' as unknown as DrEnemyId, 'wyvern', 'shadow_bat'],
  },
  {
    id: 'frozen_tundra',
    name: 'Frozen Tundra',
    description: 'A vast expanse of ice and biting wind.',
    difficulty: 2,
    element: 'ice',
    requiredLevel: 5,
    enemies: ['frost_eagle', 'wyvern', 'basilisk', 'storm_falcon'],
  },
  {
    id: 'storm_heights',
    name: 'Storm Heights',
    description: 'Perpetual thunderstorms hide lethal predators.',
    difficulty: 3,
    element: 'storm',
    requiredLevel: 10,
    enemies: ['thunderbird', 'griffon', 'storm_falcon', 'harpy'],
  },
  {
    id: 'shadow_vale',
    name: 'Shadow Vale',
    description: 'Darkness blankets this cursed valley forever.',
    difficulty: 4,
    element: 'shadow',
    requiredLevel: 15,
    enemies: ['shadow_bat', 'chimera', 'manticore', 'basilisk'],
  },
  {
    id: 'crystal_spire',
    name: 'Crystal Spire',
    description: 'A glittering spire of living crystal — home to rare beasts.',
    difficulty: 5,
    element: 'crystal',
    requiredLevel: 20,
    enemies: ['roc', 'dark_phoenix', 'griffon', 'chimera'],
  },
  {
    id: 'ancient_ruins',
    name: 'Ancient Ruins',
    description: 'Crumbled temples of a forgotten dragon civilization.',
    difficulty: 6,
    element: 'phantom',
    requiredLevel: 25,
    enemies: ['dark_phoenix', 'manticore', 'roc', 'basilisk'],
  },
] as const;

// ============================================================
// CONSTANTS — Aerial Enemies (12)
// ============================================================

export const DR_AERIAL_ENEMIES: readonly DrAerialEnemy[] = [
  { id: 'harpy', name: 'Harpy', hp: 60, attack: 12, defense: 8, speed: 20, element: 'wind', isBoss: false, reward: 15 },
  { id: 'griffon', name: 'Griffon', hp: 90, attack: 18, defense: 14, speed: 25, element: 'wind', isBoss: false, reward: 25 },
  { id: 'chimera', name: 'Chimera', hp: 120, attack: 24, defense: 16, speed: 18, element: 'fire', isBoss: false, reward: 35 },
  { id: 'thunderbird', name: 'Thunderbird', hp: 80, attack: 22, defense: 10, speed: 30, element: 'storm', isBoss: false, reward: 30 },
  { id: 'wyvern', name: 'Wyvern', hp: 100, attack: 20, defense: 18, speed: 22, element: 'earth', isBoss: false, reward: 28 },
  { id: 'basilisk', name: 'Basilisk', hp: 70, attack: 28, defense: 12, speed: 15, element: 'shadow', isBoss: false, reward: 32 },
  { id: 'manticore', name: 'Manticore', hp: 140, attack: 26, defense: 20, speed: 20, element: 'shadow', isBoss: true, reward: 50 },
  { id: 'roc', name: 'Roc', hp: 160, attack: 30, defense: 22, speed: 28, element: 'wind', isBoss: true, reward: 55 },
  { id: 'dark_phoenix', name: 'Dark Phoenix', hp: 130, attack: 34, defense: 16, speed: 35, element: 'ember', isBoss: true, reward: 60 },
  { id: 'shadow_bat', name: 'Shadow Bat', hp: 40, attack: 10, defense: 5, speed: 40, element: 'shadow', isBoss: false, reward: 10 },
  { id: 'storm_falcon', name: 'Storm Falcon', hp: 55, attack: 16, defense: 8, speed: 38, element: 'storm', isBoss: false, reward: 18 },
  { id: 'frost_eagle', name: 'Frost Eagle', hp: 75, attack: 18, defense: 12, speed: 32, element: 'ice', isBoss: false, reward: 22 },
] as const;

// ============================================================
// CONSTANTS — Kingdom Territories (8)
// ============================================================

export const DR_TERRITORIES: readonly Omit<DrTerritory, 'defenseLevel' | 'underSiege' | 'siegeProgress' | 'defenderCount'>[] = [
  { id: 'dragons_keep', name: "Dragon's Keep", maxDefenseLevel: 100, requiredRiders: 1 },
  { id: 'ember_plains', name: 'Ember Plains', maxDefenseLevel: 100, requiredRiders: 2 },
  { id: 'frost_gate', name: 'Frost Gate', maxDefenseLevel: 100, requiredRiders: 3 },
  { id: 'thunder_ridge', name: 'Thunder Ridge', maxDefenseLevel: 100, requiredRiders: 3 },
  { id: 'shadow_march', name: 'Shadow March', maxDefenseLevel: 100, requiredRiders: 4 },
  { id: 'crystal_lake', name: 'Crystal Lake', maxDefenseLevel: 100, requiredRiders: 4 },
  { id: 'iron_forge', name: 'Iron Forge', maxDefenseLevel: 100, requiredRiders: 5 },
  { id: 'sky_citadel', name: 'Sky Citadel', maxDefenseLevel: 100, requiredRiders: 6 },
] as const;

// ============================================================
// CONSTANTS — Achievements (15)
// ============================================================

export const DR_ACHIEVEMENTS: readonly Omit<DrAchievement, 'isUnlocked' | 'progress'>[] = [
  { id: 'first_flight', name: 'First Flight', description: 'Complete your first flight.', target: 1, reward: 50 },
  { id: 'breeder_novice', name: 'Breeder Novice', description: 'Hatch your first dragon egg.', target: 1, reward: 75 },
  { id: 'ace_rider', name: 'Ace Rider', description: 'Reach rider level 10.', target: 10, reward: 200 },
  { id: 'defender', name: 'Defender', description: 'Complete 5 defense missions.', target: 5, reward: 150 },
  { id: 'champion_breeder', name: 'Champion Breeder', description: 'Breed 10 dragons.', target: 10, reward: 300 },
  { id: 'storm_breaker', name: 'Storm Breaker', description: 'Defeat 50 enemies in Storm Heights.', target: 50, reward: 250 },
  { id: 'shadow_slayer', name: 'Shadow Slayer', description: 'Kill every shadow-type enemy at least once.', target: 4, reward: 200 },
  { id: 'legendary_bond', name: 'Legendary Bond', description: 'Achieve max bond (100) with any dragon.', target: 100, reward: 500 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Win an aerial race in under 60 seconds.', target: 1, reward: 300 },
  { id: 'kingdom_hero', name: 'Kingdom Hero', description: 'Defend all 8 territories at once.', target: 8, reward: 600 },
  { id: 'dragon_lord', name: 'Dragon Lord', description: 'Reach rider level 45.', target: 45, reward: 1000 },
  { id: 'elemental_master', name: 'Elemental Master', description: 'Own at least one dragon of every element.', target: 10, reward: 400 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Unlock all 15 achievements.', target: 15, reward: 2000 },
  { id: 'daily_patrol_7', name: 'Patrol Regular', description: 'Complete daily patrols 7 days in a row.', target: 7, reward: 350 },
  { id: 'ancient_awakener', name: 'Ancient Awakener', description: 'Evolve a dragon to elder stage.', target: 1, reward: 500 },
] as const;

// ============================================================
// CONSTANTS — Default Equipment Templates
// ============================================================

export const DR_DEFAULT_SADDLES: readonly DrEquipment[] = [
  { id: 'saddle_leather', name: 'Leather Saddle', slot: 'saddle', statBoost: 5, element: 'earth', rarity: 'common', isEquipped: false, dragonId: '' },
  { id: 'saddle_iron', name: 'Iron Saddle', slot: 'saddle', statBoost: 12, element: 'iron', rarity: 'uncommon', isEquipped: false, dragonId: '' },
  { id: 'saddle_crystal', name: 'Crystal Saddle', slot: 'saddle', statBoost: 20, element: 'crystal', rarity: 'rare', isEquipped: false, dragonId: '' },
  { id: 'saddle_shadow', name: 'Shadow Saddle', slot: 'saddle', statBoost: 28, element: 'shadow', rarity: 'epic', isEquipped: false, dragonId: '' },
] as const;

export const DR_DEFAULT_ARMOR: readonly DrEquipment[] = [
  { id: 'armor_scale', name: 'Scale Armor', slot: 'armor', statBoost: 8, element: 'earth', rarity: 'common', isEquipped: false, dragonId: '' },
  { id: 'armor_steel', name: 'Steel Armor', slot: 'armor', statBoost: 15, element: 'iron', rarity: 'uncommon', isEquipped: false, dragonId: '' },
  { id: 'armor_ice', name: 'Frost Armor', slot: 'armor', statBoost: 22, element: 'ice', rarity: 'rare', isEquipped: false, dragonId: '' },
  { id: 'armor_ember', name: 'Ember Plate', slot: 'armor', statBoost: 30, element: 'ember', rarity: 'epic', isEquipped: false, dragonId: '' },
] as const;

export const DR_DEFAULT_REINS: readonly DrEquipment[] = [
  { id: 'reins_rope', name: 'Hemp Reins', slot: 'reins', statBoost: 3, element: 'earth', rarity: 'common', isEquipped: false, dragonId: '' },
  { id: 'reins_chain', name: 'Chain Reins', slot: 'reins', statBoost: 10, element: 'iron', rarity: 'uncommon', isEquipped: false, dragonId: '' },
  { id: 'reins_silk', name: 'Silk Reins', slot: 'reins', statBoost: 16, element: 'wind', rarity: 'rare', isEquipped: false, dragonId: '' },
  { id: 'reins_phantom', name: 'Phantom Reins', slot: 'reins', statBoost: 24, element: 'phantom', rarity: 'epic', isEquipped: false, dragonId: '' },
] as const;

// ============================================================
// CONSTANTS — Rider Level XP Table (1–45)
// ============================================================

export const DR_RIDER_XP_TABLE: readonly number[] = (() => {
  const table: number[] = [0];
  for (let i = 1; i <= 45; i++) {
    table.push(Math.floor(100 * Math.pow(1.15, i)));
  }
  return Object.freeze(table);
})();

// ============================================================
// CONSTANTS — Rider Titles
// ============================================================

export const DR_RIDER_TITLES: readonly string[] = [
  'Hatchling Handler',
  'Sky Wanderer',
  'Wind Chaser',
  'Cloud Strider',
  'Storm Rider',
  'Dragon Tamer',
  'Wyrm Lord',
  'Sky Guardian',
  'Aerial Commander',
  'Dragon Knight',
  'Wyvern Master',
  'Thunder Warden',
  'Frost Sovereign',
  'Shadow Wing',
  'Crystal Warden',
  'Ember Herald',
  'Storm Bringer',
  'Earth Shaker',
  'Phantom Rider',
  'Iron Sentinel',
  'Legendary Rider',
] as const;

// ============================================================
// HELPERS — Pure functions (no React)
// ============================================================

/** Generate a unique ID string. */
export function drGenerateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/** Clamp a number between min and max. */
export function drClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Calculate XP needed for a rider level. */
export function drXpForLevel(level: number): number {
  if (level < 1 || level > 45) return DR_RIDER_XP_TABLE[45];
  return DR_RIDER_XP_TABLE[level];
}

/** Calculate rider level from total XP. */
export function drLevelFromXp(totalXp: number): number {
  let level = 1;
  let accumulated = 0;
  for (let i = 1; i <= 45; i++) {
    accumulated += DR_RIDER_XP_TABLE[i];
    if (totalXp >= accumulated) {
      level = i + 1;
    } else {
      break;
    }
  }
  return Math.min(level, 45);
}

/** Get rider title for a given level. */
export function drRiderTitleForLevel(level: number): string {
  const index = Math.min(Math.floor((level - 1) / 3), DR_RIDER_TITLES.length - 1);
  return DR_RIDER_TITLES[index];
}

/** Determine dragon life stage from level. */
export function drLifeStageFromLevel(level: number): DrLifeStage {
  if (level <= 3) return 'egg';
  if (level <= 8) return 'hatchling';
  if (level <= 18) return 'juvenile';
  if (level <= 35) return 'adult';
  return 'elder';
}

/** Calculate dragon stats from species and level. */
export function drCalculateDragonStats(
  species: DrDragonSpecies,
  level: number,
): { readonly hp: number; readonly speed: number; readonly attack: number; readonly defense: number } {
  const multiplier = 1 + (level - 1) * 0.08;
  return {
    hp: Math.floor(species.baseHp * multiplier),
    speed: Math.floor(species.baseSpeed * multiplier),
    attack: Math.floor(species.baseAttack * multiplier),
    defense: Math.floor(species.baseDefense * multiplier),
  };
}

/** Element advantage multiplier (2.0 advantage, 0.5 disadvantage). */
export function drElementMultiplier(attacker: DrElement, defender: DrElement): number {
  const advantages: Record<string, readonly string[]> = {
    fire: ['ice', 'wind'],
    ice: ['earth', 'wind'],
    storm: ['shadow', 'iron'],
    shadow: ['crystal', 'phantom'],
    crystal: ['fire', 'storm'],
    earth: ['storm', 'iron'],
    wind: ['phantom', 'shadow'],
    phantom: ['ice', 'crystal'],
    iron: ['fire', 'earth'],
    ember: ['ice', 'crystal', 'iron'],
  };
  const strong = advantages[attacker];
  if (strong && strong.includes(defender)) return 2.0;
  const reverse = advantages[defender];
  if (reverse && reverse.includes(attacker)) return 0.5;
  return 1.0;
}

/** Calculate combat damage. */
export function drCalculateDamage(
  attackerAttack: number,
  defenderDefense: number,
  skillDamage: number,
  attackerElement: DrElement,
  defenderElement: DrElement,
): number {
  const base = Math.max(1, attackerAttack - Math.floor(defenderDefense * 0.5));
  const elementMult = drElementMultiplier(attackerElement, defenderElement);
  const isCritical = Math.random() < 0.15;
  const critMult = isCritical ? 1.5 : 1.0;
  return Math.floor((base + skillDamage) * elementMult * critMult);
}

/** Breed two dragons and return the offspring species. */
export function drBreedDragons(parentA: DrDragonSpecies, parentB: DrDragonSpecies): DrDragonSpecies {
  const rarityOrder: readonly DrRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const parentAIndex = rarityOrder.indexOf(parentA.rarity);
  const parentBIndex = rarityOrder.indexOf(parentB.rarity);
  const childRarityIndex = Math.min(parentAIndex, parentBIndex) + (Math.random() < 0.2 ? 1 : 0);
  const childRarity = rarityOrder[Math.min(childRarityIndex, rarityOrder.length - 1)];
  const parents = [parentA, parentB];
  const randomParent = parents[Math.floor(Math.random() * 2)];
  const randomSpecies = DR_DRAGON_SPECIES.filter(s => s.rarity === childRarity);
  const chosen = randomSpecies.length > 0
    ? randomSpecies[Math.floor(Math.random() * randomSpecies.length)]
    : randomParent;
  return {
    ...chosen,
    id: drGenerateId(),
    rarity: childRarity,
    baseHp: Math.floor((parentA.baseHp + parentB.baseHp) / 2) + (Math.random() < 0.3 ? 10 : 0),
    baseSpeed: Math.floor((parentA.baseSpeed + parentB.baseSpeed) / 2) + (Math.random() < 0.3 ? 5 : 0),
    baseAttack: Math.floor((parentA.baseAttack + parentB.baseAttack) / 2) + (Math.random() < 0.3 ? 3 : 0),
    baseDefense: Math.floor((parentA.baseDefense + parentB.baseDefense) / 2) + (Math.random() < 0.3 ? 3 : 0),
  };
}

/** Format time in seconds to MM:SS. */
export function drFormatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number): string => n < 10 ? `0${n}` : `${n}`;
  return `${pad(mins)}:${pad(secs)}`;
}

/** Element color mapping for UI. */
export function drElementColor(element: DrElement): string {
  const colors: Record<DrElement, string> = {
    fire: '#ff4422',
    ice: '#44bbff',
    storm: '#ffdd00',
    shadow: '#7733aa',
    crystal: '#dd66ff',
    earth: '#88aa44',
    wind: '#aaddcc',
    phantom: '#445566',
    iron: '#aaaaaa',
    ember: '#ff6633',
  };
  return colors[element];
}

/** Element icon/emoji mapping. */
export function drElementIcon(element: DrElement): string {
  const icons: Record<DrElement, string> = {
    fire: '🔥',
    ice: '❄️',
    storm: '⚡',
    shadow: '🌑',
    crystal: '💎',
    earth: '⛰️',
    wind: '🌪️',
    phantom: '👻',
    iron: '⚙️',
    ember: '🌋',
  };
  return icons[element];
}

/** Rarity color mapping. */
export function drRarityColor(rarity: DrRarity): string {
  const colors: Record<DrRarity, string> = {
    common: '#cccccc',
    uncommon: '#44cc44',
    rare: '#4488ff',
    epic: '#aa44ff',
    legendary: '#ffaa00',
  };
  return colors[rarity];
}

/** Check if an enemy is alive. */
export function drIsEnemyAlive(enemy: DrAerialEnemy): boolean {
  return enemy.hp > 0;
}

/** Get total stat boost from equipped gear. */
export function drTotalEquipBoost(equipment: readonly DrEquipment[], dragonId: string): number {
  return equipment
    .filter(e => e.isEquipped && e.dragonId === dragonId)
    .reduce((sum, e) => sum + e.statBoost, 0);
}

/** Get equipment for a specific slot on a dragon. */
export function drGetEquippedItem(
  equipment: readonly DrEquipment[],
  dragonId: string,
  slot: DrEquipSlot,
): DrEquipment | undefined {
  return equipment.find(e => e.isEquipped && e.dragonId === dragonId && e.slot === slot);
}

/** Count dragons owned by element. */
export function drCountDragonsByElement(dragons: readonly DrDragon[], element: DrElement): number {
  return dragons.filter(d => {
    const species = DR_DRAGON_SPECIES.find(s => s.id === d.speciesId);
    return species?.element === element;
  }).length;
}

/** Count unique elements among owned dragons. */
export function drUniqueElementCount(dragons: readonly DrDragon[]): number {
  const elements = new Set<string>();
  for (const dragon of dragons) {
    const species = DR_DRAGON_SPECIES.find(s => s.id === dragon.speciesId);
    if (species) elements.add(species.element);
  }
  return elements.size;
}

/** Check if rider can access a flight zone. */
export function drCanAccessZone(riderLevel: number, zone: DrFlightZone): boolean {
  return riderLevel >= zone.requiredLevel;
}

/** Get enemies in a flight zone. */
export function drGetZoneEnemies(zoneId: DrFlightZoneId): readonly DrAerialEnemy[] {
  const zone = DR_FLIGHT_ZONES.find(z => z.id === zoneId);
  if (!zone) return [];
  return DR_AERIAL_ENEMIES.filter(e => zone.enemies.includes(e.id));
}

/** Get total gold reward from all achievements. */
export function drTotalAchievementGold(achievements: readonly DrAchievement[]): number {
  return achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.reward, 0);
}

/** Count completed defense missions. */
export function drCompletedMissions(missions: readonly DrDefenseMission[]): number {
  return missions.filter(m => m.status === 'completed').length;
}

/** Count territories currently under siege. */
export function drSiegeCount(territories: readonly DrTerritory[]): number {
  return territories.filter(t => t.underSiege).length;
}

/** Get dragon by ID. */
export function drGetDragon(dragons: readonly DrDragon[], id: string): DrDragon | undefined {
  return dragons.find(d => d.id === id);
}

/** Get active dragon. */
export function drGetActiveDragon(dragons: readonly DrDragon[], activeId: string): DrDragon | undefined {
  return drGetDragon(dragons, activeId);
}

/** Get species info for a dragon. */
export function drGetSpeciesForDragon(dragon: DrDragon): DrDragonSpecies | undefined {
  return DR_DRAGON_SPECIES.find(s => s.id === dragon.speciesId);
}

/** Check if a dragon can evolve. */
export function drCanEvolve(dragon: DrDragon): boolean {
  const species = drGetSpeciesForDragon(dragon);
  if (!species) return false;
  if (dragon.level < species.evolutionLevel) return false;
  if (dragon.lifeStage === 'elder') return false;
  return true;
}

/** Get the next life stage for a dragon. */
export function drNextLifeStage(current: DrLifeStage): DrLifeStage | null {
  const stages: readonly DrLifeStage[] = ['egg', 'hatchling', 'juvenile', 'adult', 'elder'];
  const idx = stages.indexOf(current);
  if (idx < 0 || idx >= stages.length - 1) return null;
  return stages[idx + 1];
}

/** Calculate egg incubation reduction per day. */
export function drIncubateEgg(egg: DrDragonEgg): DrDragonEgg {
  const newRemaining = Math.max(0, egg.daysRemaining - 1);
  return {
    ...egg,
    daysRemaining: newRemaining,
    isReady: newRemaining <= 0,
  };
}

/** Hatch an egg into a dragon. */
export function drHatchEgg(egg: DrDragonEgg): DrDragon {
  const species = DR_DRAGON_SPECIES.find(s => s.id === egg.speciesId);
  if (!species) {
    throw new Error(`Unknown species: ${egg.speciesId}`);
  }
  const stats = drCalculateDragonStats(species, 1);
  return {
    id: drGenerateId(),
    speciesId: species.id,
    name: species.name,
    nickname: species.name,
    level: 1,
    xp: 0,
    lifeStage: 'hatchling',
    hp: stats.hp,
    maxHp: stats.hp,
    speed: stats.speed,
    attack: stats.attack,
    defense: stats.defense,
    bond: 0,
    happiness: 80,
    isMounted: false,
  };
}

/** Add XP to a dragon and return updated instance. */
export function drAddDragonXp(dragon: DrDragon, xp: number): DrDragon {
  const newXp = dragon.xp + xp;
  const xpToLevel = Math.floor(50 * Math.pow(1.2, dragon.level));
  if (newXp >= xpToLevel) {
    const newLevel = dragon.level + 1;
    const species = drGetSpeciesForDragon(dragon);
    const stats = species ? drCalculateDragonStats(species, newLevel) : { hp: dragon.maxHp, speed: dragon.speed, attack: dragon.attack, defense: dragon.defense };
    const newLifeStage = drLifeStageFromLevel(newLevel);
    return {
      ...dragon,
      level: newLevel,
      xp: newXp - xpToLevel,
      lifeStage: newLifeStage,
      hp: stats.hp,
      maxHp: stats.hp,
      speed: stats.speed,
      attack: stats.attack,
      defense: stats.defense,
    };
  }
  return { ...dragon, xp: newXp };
}

/** Evolve a dragon to its next life stage. */
export function drEvolveDragon(dragon: DrDragon): DrDragon {
  const nextStage = drNextLifeStage(dragon.lifeStage);
  if (!nextStage) return dragon;
  const species = drGetSpeciesForDragon(dragon);
  if (!species) return dragon;
  const stats = drCalculateDragonStats(species, dragon.level);
  const hpBonus = dragon.maxHp + Math.floor(dragon.maxHp * 0.15);
  return {
    ...dragon,
    lifeStage: nextStage,
    hp: hpBonus,
    maxHp: hpBonus,
    speed: stats.speed + 5,
    attack: stats.attack + 3,
    defense: stats.defense + 3,
  };
}

/** Train a dragon (gain XP + bond). */
export function drTrainDragon(dragon: DrDragon, xpGain: number, bondGain: number): DrDragon {
  const withXp = drAddDragonXp(dragon, xpGain);
  return {
    ...withXp,
    bond: drClamp(withXp.bond + bondGain, 0, 100),
    happiness: drClamp(withXp.happiness + 2, 0, 100),
  };
}

/** Feed a dragon (increase happiness). */
export function drFeedDragon(dragon: DrDragon, foodValue: number): DrDragon {
  return {
    ...dragon,
    happiness: drClamp(dragon.happiness + foodValue, 0, 100),
    bond: drClamp(dragon.bond + Math.floor(foodValue * 0.3), 0, 100),
  };
}

/** Heal a dragon. */
export function drHealDragon(dragon: DrDragon, healAmount: number): DrDragon {
  return {
    ...dragon,
    hp: drClamp(dragon.hp + healAmount, 0, dragon.maxHp),
  };
}

/** Bond with a dragon (increase bond value). */
export function drBondWithDragon(dragon: DrDragon, bondAmount: number): DrDragon {
  return {
    ...dragon,
    bond: drClamp(dragon.bond + bondAmount, 0, 100),
    happiness: drClamp(dragon.happiness + 1, 0, 100),
  };
}

/** Mount a dragon. */
export function drMountDragon(dragon: DrDragon): DrDragon {
  return { ...dragon, isMounted: true };
}

/** Dismount a dragon. */
export function drDismountDragon(dragon: DrDragon): DrDragon {
  return { ...dragon, isMounted: false };
}

// ============================================================
// STATE REDUCERS — Zone Navigation
// ============================================================

/** Change current flight zone. */
export function drChangeZone(state: DragonRiderState, zoneId: DrFlightZoneId): DragonRiderState {
  return { ...state, currentZoneId: zoneId };
}

/** Unlock a flight zone. */
export function drUnlockZone(state: DragonRiderState, zoneId: DrFlightZoneId): DragonRiderState {
  const updatedZones = state.zones.map(z =>
    z.id === zoneId ? { ...z, isUnlocked: true } : z,
  );
  return { ...state, zones: updatedZones };
}

/** Set active dragon. */
export function drSetActiveDragon(state: DragonRiderState, dragonId: string): DragonRiderState {
  const updatedDragons = state.dragons.map(d => ({
    ...d,
    isMounted: d.id === dragonId,
  }));
  return {
    ...state,
    dragons: updatedDragons,
    activeDragonId: dragonId,
    isMounted: true,
  };
}

// ============================================================
// STATE REDUCERS — Combat
// ============================================================

/** Process an attack against an enemy. Returns updated enemy and combat entry. */
export function drAttackEnemy(
  dragon: DrDragon,
  enemy: DrAerialEnemy,
  skill: DrRidingSkill,
): { readonly updatedEnemy: DrAerialEnemy; readonly entry: DrCombatEntry } {
  const species = drGetSpeciesForDragon(dragon);
  const dragonElement = species?.element ?? 'fire';
  const damage = drCalculateDamage(dragon.attack, enemy.defense, skill.damage, dragonElement, enemy.element);
  const updatedEnemy: DrAerialEnemy = {
    ...enemy,
    hp: Math.max(0, enemy.hp - damage),
  };
  const entry: DrCombatEntry = {
    id: drGenerateId(),
    turn: 0,
    attacker: dragon.nickname,
    defender: enemy.name,
    skill: skill.name,
    damage,
    isCritical: damage > (dragon.attack + skill.damage) * 1.2,
    timestamp: Date.now(),
  };
  return { updatedEnemy, entry };
}

/** Process enemy counter-attack. */
export function drEnemyAttack(
  dragon: DrDragon,
  enemy: DrAerialEnemy,
): { readonly updatedDragon: DrDragon; readonly entry: DrCombatEntry } {
  const species = drGetSpeciesForDragon(dragon);
  const dragonElement = species?.element ?? 'fire';
  const damage = drCalculateDamage(enemy.attack, dragon.defense, 0, enemy.element, dragonElement);
  const updatedDragon = {
    ...dragon,
    hp: Math.max(0, dragon.hp - damage),
  };
  const entry: DrCombatEntry = {
    id: drGenerateId(),
    turn: 0,
    attacker: enemy.name,
    defender: dragon.nickname,
    skill: 'Claw Strike',
    damage,
    isCritical: damage > enemy.attack * 1.2,
    timestamp: Date.now(),
  };
  return { updatedDragon, entry };
}

/** Check if combat is over. */
export function drIsCombatOver(dragonHp: number, enemyHp: number): boolean {
  return dragonHp <= 0 || enemyHp <= 0;
}

/** Get combat result. */
export function drCombatResult(dragonHp: number, enemyHp: number): 'victory' | 'defeat' | 'ongoing' {
  if (enemyHp <= 0 && dragonHp > 0) return 'victory';
  if (dragonHp <= 0) return 'defeat';
  return 'ongoing';
}

/** Resolve a full combat encounter. */
export function drResolveCombat(
  state: DragonRiderState,
  enemy: DrAerialEnemy,
  skillId: string,
): DragonRiderState {
  const dragon = drGetActiveDragon(state.dragons, state.activeDragonId);
  if (!dragon) return state;

  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || skill.currentCooldown > 0) return state;

  const { updatedEnemy, entry } = drAttackEnemy(dragon, enemy, skill);

  let newState = {
    ...state,
    combatLog: [...state.combatLog, { ...entry, turn: state.combatLog.length + 1 }],
  };

  if (updatedEnemy.hp > 0) {
    const counterResult = drEnemyAttack(dragon, updatedEnemy);
    const updatedDragons = newState.dragons.map(d =>
      d.id === dragon.id ? counterResult.updatedDragon : d,
    );
    newState = {
      ...newState,
      dragons: updatedDragons,
      currentHp: counterResult.updatedDragon.hp,
      combatLog: [
        ...newState.combatLog,
        { ...counterResult.entry, turn: newState.combatLog.length + 1 },
      ],
    };
  } else {
    const result = drCombatResult(dragon.hp, 0);
    if (result === 'victory') {
      const xpGain = enemy.isBoss ? 80 : 30;
      const goldGain = enemy.reward;
      const updatedDragons = newState.dragons.map(d =>
        d.id === dragon.id ? drAddDragonXp(d, xpGain) : d,
      );
      const riderXpGain = Math.floor(xpGain * 0.5);
      newState = {
        ...newState,
        dragons: updatedDragons,
        rider: {
          ...newState.rider,
          xp: newState.rider.xp + riderXpGain,
          gold: newState.rider.gold + goldGain,
          totalKills: newState.rider.totalKills + 1,
        },
      };
    }
  }

  const updatedSkills = newState.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...newState, skills: updatedSkills };
}

/** Reduce skill cooldowns by 1. */
export function drTickCooldowns(state: DragonRiderState): DragonRiderState {
  const updatedSkills = state.skills.map(s => ({
    ...s,
    currentCooldown: Math.max(0, s.currentCooldown - 1),
  }));
  return { ...state, skills: updatedSkills };
}

/** Unlock a riding skill. */
export function drUnlockSkill(state: DragonRiderState, skillId: string): DragonRiderState {
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, isUnlocked: true, level: 1 } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Level up a riding skill. */
export function drLevelUpSkill(state: DragonRiderState, skillId: string): DragonRiderState {
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, level: s.level + 1 } : s,
  );
  return { ...state, skills: updatedSkills };
}

// ============================================================
// STATE REDUCERS — Kingdom Defense
// ============================================================

/** Start a siege on a territory. */
export function drStartSiege(state: DragonRiderState, territoryId: DrTerritoryId): DragonRiderState {
  const updatedTerritories = state.territories.map(t =>
    t.id === territoryId ? { ...t, underSiege: true, siegeProgress: 0 } : t,
  );
  const missionId = drGenerateId();
  const newMission: DrDefenseMission = {
    id: missionId,
    territoryId,
    status: 'inProgress',
    wave: 1,
    maxWaves: 5,
    enemiesDefeated: 0,
    dragonsDeployed: state.dragons.filter(d => d.isMounted).map(d => d.id),
    reward: 100,
    startTime: Date.now(),
  };
  return {
    ...state,
    territories: updatedTerritories,
    defenseMissions: [...state.defenseMissions, newMission],
  };
}

/** Advance defense mission to next wave. */
export function drAdvanceDefenseWave(state: DragonRiderState, missionId: string): DragonRiderState {
  const updatedMissions = state.defenseMissions.map(m => {
    if (m.id !== missionId || m.status !== 'inProgress') return m;
    const nextWave = m.wave + 1;
    if (nextWave > m.maxWaves) {
      return { ...m, status: 'completed' as const, wave: m.maxWaves };
    }
    return { ...m, wave: nextWave };
  });
  const completedMission = updatedMissions.find(m => m.id === missionId && m.status === 'completed');
  if (completedMission) {
    const territory = state.territories.find(t => t.id === completedMission.territoryId);
    const updatedTerritories = state.territories.map(t => {
      if (t.id !== completedMission.territoryId) return t;
      return { ...t, underSiege: false, siegeProgress: 100, defenseLevel: Math.min(t.maxDefenseLevel, t.defenseLevel + 10) };
    });
    return {
      ...state,
      defenseMissions: updatedMissions,
      territories: updatedTerritories,
      rider: {
        ...state.rider,
        gold: state.rider.gold + completedMission.reward,
        totalDefenses: state.rider.totalDefenses + 1,
      },
    };
  }
  return { ...state, defenseMissions: updatedMissions };
}

/** Record an enemy kill in a defense mission. */
export function drRecordDefenseKill(state: DragonRiderState, missionId: string): DragonRiderState {
  const updatedMissions = state.defenseMissions.map(m =>
    m.id === missionId ? { ...m, enemiesDefeated: m.enemiesDefeated + 1 } : m,
  );
  return { ...state, defenseMissions: updatedMissions };
}

/** Fail a defense mission. */
export function drFailDefenseMission(state: DragonRiderState, missionId: string): DragonRiderState {
  const mission = state.defenseMissions.find(m => m.id === missionId);
  if (!mission) return state;
  const updatedMissions = state.defenseMissions.map(m =>
    m.id === missionId ? { ...m, status: 'failed' as const } : m,
  );
  const updatedTerritories = state.territories.map(t => {
    if (t.id !== mission.territoryId) return t;
    return { ...t, underSiege: false, defenseLevel: Math.max(0, t.defenseLevel - 5) };
  });
  return {
    ...state,
    defenseMissions: updatedMissions,
    territories: updatedTerritories,
  };
}

/** Deploy a dragon to a territory. */
export function drDeployToTerritory(
  state: DragonRiderState,
  territoryId: DrTerritoryId,
  dragonId: string,
): DragonRiderState {
  const updatedTerritories = state.territories.map(t =>
    t.id === territoryId ? { ...t, defenderCount: t.defenderCount + 1 } : t,
  );
  return { ...state, territories: updatedTerritories };
}

/** Get territory by ID. */
export function drGetTerritory(state: DragonRiderState, territoryId: DrTerritoryId): DrTerritory | undefined {
  return state.territories.find(t => t.id === territoryId);
}

/** Get active defense mission for a territory. */
export function drGetActiveMission(
  state: DragonRiderState,
  territoryId: DrTerritoryId,
): DrDefenseMission | undefined {
  return state.defenseMissions.find(m => m.territoryId === territoryId && m.status === 'inProgress');
}

// ============================================================
// STATE REDUCERS — Equipment
// ============================================================

/** Equip an item to a dragon. */
export function drEquipItem(state: DragonRiderState, equipId: string, dragonId: string): DragonRiderState {
  const item = state.equipment.find(e => e.id === equipId);
  if (!item) return state;
  const unequipped = state.equipment.map(e =>
    e.slot === item.slot && e.dragonId === dragonId && e.isEquipped
      ? { ...e, isEquipped: false, dragonId: '' }
      : e,
  );
  const updated = unequipped.map(e =>
    e.id === equipId ? { ...e, isEquipped: true, dragonId } : e,
  );
  return { ...state, equipment: updated };
}

/** Unequip an item. */
export function drUnequipItem(state: DragonRiderState, equipId: string): DragonRiderState {
  const updated = state.equipment.map(e =>
    e.id === equipId ? { ...e, isEquipped: false, dragonId: '' } : e,
  );
  return { ...state, equipment: updated };
}

/** Add a new equipment item. */
export function drAddEquipment(state: DragonRiderState, item: DrEquipment): DragonRiderState {
  return { ...state, equipment: [...state.equipment, item] };
}

/** Remove equipment item. */
export function drRemoveEquipment(state: DragonRiderState, equipId: string): DragonRiderState {
  return { ...state, equipment: state.equipment.filter(e => e.id !== equipId) };
}

/** Buy equipment from shop. */
export function drBuyEquipment(state: DragonRiderState, equipId: string, cost: number): DragonRiderState {
  if (state.rider.gold < cost) return state;
  return {
    ...state,
    rider: { ...state.rider, gold: state.rider.gold - cost },
  };
}

// ============================================================
// STATE REDUCERS — Aerial Races
// ============================================================

/** Start an aerial race. */
export function drStartRace(state: DragonRiderState, zoneId: DrFlightZoneId, dragonId: string): DragonRiderState {
  const zone = DR_FLIGHT_ZONES.find(z => z.id === zoneId);
  if (!zone) return state;
  const dragon = drGetDragon(state.dragons, dragonId);
  if (!dragon) return state;

  const raceId = drGenerateId();
  const distanceBase = 500 + zone.difficulty * 200;
  const newRace: DrAerialRace = {
    id: raceId,
    zoneId,
    status: 'racing',
    distance: distanceBase,
    currentTime: 0,
    bestTime: state.races.find(r => r.dragonId === dragonId)?.bestTime ?? 0,
    dragonId,
    obstaclesCleared: 0,
    rank: 0,
  };
  return {
    ...state,
    races: [...state.races, newRace],
    rider: { ...state.rider, totalFlights: state.rider.totalFlights + 1 },
  };
}

/** Update race time (tick). */
export function drUpdateRaceTime(state: DragonRiderState, raceId: string, deltaSeconds: number): DragonRiderState {
  const updatedRaces = state.races.map(r => {
    if (r.id !== raceId || r.status !== 'racing') return r;
    return { ...r, currentTime: r.currentTime + deltaSeconds };
  });
  return { ...state, races: updatedRaces };
}

/** Clear an obstacle in a race. */
export function drClearObstacle(state: DragonRiderState, raceId: string): DragonRiderState {
  const updatedRaces = state.races.map(r => {
    if (r.id !== raceId || r.status !== 'racing') return r;
    return { ...r, obstaclesCleared: r.obstaclesCleared + 1 };
  });
  return { ...state, races: updatedRaces };
}

/** Finish a race. */
export function drFinishRace(state: DragonRiderState, raceId: string): DragonRiderState {
  const race = state.races.find(r => r.id === raceId);
  if (!race) return state;

  const updatedRaces = state.races.map(r => {
    if (r.id !== raceId) return r;
    const isNewBest = race.bestTime === 0 || r.currentTime < race.bestTime;
    return {
      ...r,
      status: 'finished' as const,
      bestTime: isNewBest ? r.currentTime : race.bestTime,
      rank: r.currentTime < 60 ? 1 : r.currentTime < 90 ? 2 : r.currentTime < 120 ? 3 : 4,
    };
  });

  const finishedRace = updatedRaces.find(r => r.id === raceId);
  const rank = finishedRace?.rank ?? 4;
  const rewards: Record<number, number> = { 1: 200, 2: 120, 3: 70, 4: 30 };
  const goldReward = rewards[rank] ?? 30;
  const xpReward = 20 + (5 - rank) * 15;

  const updatedDragons = state.dragons.map(d =>
    d.id === race.dragonId ? drAddDragonXp(d, xpReward) : d,
  );

  return {
    ...state,
    races: updatedRaces,
    dragons: updatedDragons,
    rider: {
      ...state.rider,
      gold: state.rider.gold + goldReward,
      xp: state.rider.xp + Math.floor(xpReward * 0.5),
      totalRaces: state.rider.totalRaces + 1,
    },
  };
}

/** Get best race time for a dragon. */
export function drBestRaceTime(races: readonly DrAerialRace[], dragonId: string): number {
  const dragonRaces = races.filter(r => r.dragonId === dragonId && r.bestTime > 0);
  if (dragonRaces.length === 0) return 0;
  return Math.min(...dragonRaces.map(r => r.bestTime));
}

/** Count races completed by a dragon. */
export function drRacesCompleted(races: readonly DrAerialRace[], dragonId: string): number {
  return races.filter(r => r.dragonId === dragonId && r.status === 'finished').length;
}

// ============================================================
// STATE REDUCERS — Breeding
// ============================================================

/** Create a breeding record. */
export function drCreateBreedingRecord(
  parentAId: string,
  parentBId: string,
  offspringId: string,
  traits: readonly string[],
): DrBreedingRecord {
  return {
    id: drGenerateId(),
    parentA: parentAId,
    parentB: parentBId,
    offspringId,
    date: Date.now(),
    inheritedTraits: traits,
  };
}

/** Add an egg to the state. */
export function drAddEgg(state: DragonRiderState, egg: DrDragonEgg): DragonRiderState {
  return { ...state, eggs: [...state.eggs, egg] };
}

/** Remove an egg from the state. */
export function drRemoveEgg(state: DragonRiderState, eggId: string): DragonRiderState {
  return { ...state, eggs: state.eggs.filter(e => e.id !== eggId) };
}

/** Process breeding between two dragons. */
export function drBreed(
  state: DragonRiderState,
  parentAId: string,
  parentBId: string,
): DragonRiderState {
  const parentA = drGetDragon(state.dragons, parentAId);
  const parentB = drGetDragon(state.dragons, parentBId);
  if (!parentA || !parentB) return state;
  if (parentA.id === parentB.id) return state;

  const speciesA = drGetSpeciesForDragon(parentA);
  const speciesB = drGetSpeciesForDragon(parentB);
  if (!speciesA || !speciesB) return state;

  const offspringSpecies = drBreedDragons(speciesA, speciesB);
  const traits = [speciesA.element, speciesB.element, speciesA.rarity];

  const egg: DrDragonEgg = {
    id: drGenerateId(),
    speciesId: offspringSpecies.id,
    incubationDays: 3,
    daysRemaining: 3,
    isReady: false,
  };

  const record = drCreateBreedingRecord(parentAId, parentBId, offspringSpecies.id, traits);

  return {
    ...state,
    eggs: [...state.eggs, egg],
    breedingLog: [...state.breedingLog, record],
    rider: { ...state.rider, totalBreeds: state.rider.totalBreeds + 1, gold: Math.max(0, state.rider.gold - 50) },
  };
}

/** Hatch the first ready egg. */
export function drHatchReadyEgg(state: DragonRiderState): DragonRiderState {
  const readyEgg = state.eggs.find(e => e.isReady);
  if (!readyEgg) return state;
  const newDragon = drHatchEgg(readyEgg);
  return {
    ...state,
    dragons: [...state.dragons, newDragon],
    eggs: state.eggs.filter(e => e.id !== readyEgg.id),
  };
}

// ============================================================
// STATE REDUCERS — Achievements
// ============================================================

/** Check and unlock achievements based on state. */
export function drCheckAchievements(state: DragonRiderState): DragonRiderState {
  let updated = state;
  const achievementChecks: Array<() => DragonRiderState> = [
    () => drCheckFirstFlight(updated),
    () => drCheckBreederNovice(updated),
    () => drCheckAceRider(updated),
    () => drCheckDefender(updated),
    () => drCheckChampionBreeder(updated),
    () => drCheckSpeedDemon(updated),
    () => drCheckDragonLord(updated),
    () => drCheckElementalMaster(updated),
    () => drCheckLegendaryBond(updated),
    () => drCheckDailyPatrol7(updated),
    () => drCheckAncientAwakener(updated),
    () => drCheckKingdomHero(updated),
  ];
  for (const check of achievementChecks) {
    updated = check();
  }
  return updated;
}

function drUpdateAchievementProgress(
  state: DragonRiderState,
  achievementId: DrAchievementId,
  progress: number,
): DragonRiderState {
  return {
    ...state,
    achievements: state.achievements.map(a =>
      a.id === achievementId
        ? { ...a, progress: Math.min(progress, a.target), isUnlocked: progress >= a.target }
        : a,
    ),
  };
}

function drCheckFirstFlight(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'first_flight', state.rider.totalFlights);
}

function drCheckBreederNovice(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'breeder_novice', state.rider.totalBreeds);
}

function drCheckAceRider(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'ace_rider', state.rider.level);
}

function drCheckDefender(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'defender', drCompletedMissions(state.defenseMissions));
}

function drCheckChampionBreeder(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'champion_breeder', state.rider.totalBreeds);
}

function drCheckSpeedDemon(state: DragonRiderState): DragonRiderState {
  const fastWin = state.races.find(r => r.status === 'finished' && r.currentTime < 60);
  return drUpdateAchievementProgress(state, 'speed_demon', fastWin ? 1 : 0);
}

function drCheckDragonLord(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'dragon_lord', state.rider.level);
}

function drCheckElementalMaster(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'elemental_master', drUniqueElementCount(state.dragons));
}

function drCheckLegendaryBond(state: DragonRiderState): DragonRiderState {
  const maxBond = state.dragons.length > 0 ? Math.max(...state.dragons.map(d => d.bond)) : 0;
  return drUpdateAchievementProgress(state, 'legendary_bond', maxBond);
}

function drCheckDailyPatrol7(state: DragonRiderState): DragonRiderState {
  return drUpdateAchievementProgress(state, 'daily_patrol_7', state.dailyPatrol.streak);
}

function drCheckAncientAwakener(state: DragonRiderState): DragonRiderState {
  const hasElder = state.dragons.some(d => d.lifeStage === 'elder');
  return drUpdateAchievementProgress(state, 'ancient_awakener', hasElder ? 1 : 0);
}

function drCheckKingdomHero(state: DragonRiderState): DragonRiderState {
  const defendedCount = state.territories.filter(t => t.defenseLevel >= 80).length;
  return drUpdateAchievementProgress(state, 'kingdom_hero', defendedCount);
}

/** Get unlocked achievement count. */
export function drUnlockedAchievementCount(achievements: readonly DrAchievement[]): number {
  return achievements.filter(a => a.isUnlocked).length;
}

/** Get achievement progress as percentage. */
export function drAchievementProgress(achievement: DrAchievement): number {
  if (achievement.target <= 0) return 100;
  return Math.floor((achievement.progress / achievement.target) * 100);
}

/** Check if a specific achievement is unlocked. */
export function drIsAchievementUnlocked(achievements: readonly DrAchievement[], id: DrAchievementId): boolean {
  return achievements.find(a => a.id === id)?.isUnlocked ?? false;
}

// ============================================================
// STATE REDUCERS — Daily Patrol
// ============================================================

/** Start daily patrol. */
export function drStartPatrol(state: DragonRiderState, zoneId: DrFlightZoneId): DragonRiderState {
  const patrol: DrDailyPatrol = {
    id: drGenerateId(),
    zoneId,
    isCompleted: false,
    enemiesDefeated: 0,
    requiredKills: 10,
    reward: 80,
    streak: state.dailyPatrol.streak,
  };
  return { ...state, dailyPatrol: patrol };
}

/** Record a patrol kill. */
export function drRecordPatrolKill(state: DragonRiderState): DragonRiderState {
  const newKills = state.dailyPatrol.enemiesDefeated + 1;
  const isCompleted = newKills >= state.dailyPatrol.requiredKills;
  const newStreak = isCompleted ? state.dailyPatrol.streak + 1 : state.dailyPatrol.streak;
  return {
    ...state,
    dailyPatrol: {
      ...state.dailyPatrol,
      enemiesDefeated: newKills,
      isCompleted,
      streak: newStreak,
    },
    rider: isCompleted
      ? { ...state.rider, gold: state.rider.gold + state.dailyPatrol.reward }
      : state.rider,
  };
}

/** Claim daily patrol reward. */
export function drClaimPatrolReward(state: DragonRiderState): DragonRiderState {
  if (!state.dailyPatrol.isCompleted) return state;
  return {
    ...state,
    rider: {
      ...state.rider,
      gold: state.rider.gold + state.dailyPatrol.reward,
      xp: state.rider.xp + 25,
    },
  };
}

/** Get patrol progress percentage. */
export function drPatrolProgress(patrol: DrDailyPatrol): number {
  if (patrol.requiredKills <= 0) return 100;
  return Math.floor((patrol.enemiesDefeated / patrol.requiredKills) * 100);
}

/** Reset daily patrol (new day). */
export function drResetPatrol(state: DragonRiderState): DragonRiderState {
  return {
    ...state,
    dailyPatrol: {
      id: drGenerateId(),
      zoneId: state.currentZoneId,
      isCompleted: false,
      enemiesDefeated: 0,
      requiredKills: 10,
      reward: 80,
      streak: state.dailyPatrol.isCompleted ? state.dailyPatrol.streak : 0,
    },
  };
}

// ============================================================
// STATE REDUCERS — Rider Profile
// ============================================================

/** Add XP to the rider profile and level up if needed. */
export function drAddRiderXp(state: DragonRiderState, xp: number): DragonRiderState {
  const newTotalXp = state.rider.xp + xp;
  const newLevel = drLevelFromXp(newTotalXp);
  const newTitle = drRiderTitleForLevel(newLevel);
  const maxXpForLevel = drXpForLevel(newLevel);
  return {
    ...state,
    rider: {
      ...state.rider,
      xp: newTotalXp,
      level: newLevel,
      title: newTitle,
      maxXp: maxXpForLevel,
    },
  };
}

/** Spend gold. */
export function drSpendGold(state: DragonRiderState, amount: number): DragonRiderState {
  if (state.rider.gold < amount) return state;
  return { ...state, rider: { ...state.rider, gold: state.rider.gold - amount } };
}

/** Add gold. */
export function drAddGold(state: DragonRiderState, amount: number): DragonRiderState {
  return { ...state, rider: { ...state.rider, gold: state.rider.gold + amount } };
}

/** Spend gems. */
export function drSpendGems(state: DragonRiderState, amount: number): DragonRiderState {
  if (state.rider.gems < amount) return state;
  return { ...state, rider: { ...state.rider, gems: state.rider.gems - amount } };
}

/** Add gems. */
export function drAddGems(state: DragonRiderState, amount: number): DragonRiderState {
  return { ...state, rider: { ...state.rider, gems: state.rider.gems + amount } };
}

/** Set rider name. */
export function drSetRiderName(state: DragonRiderState, name: string): DragonRiderState {
  return { ...state, rider: { ...state.rider, name } };
}

/** Rename a dragon. */
export function drRenameDragon(state: DragonRiderState, dragonId: string, nickname: string): DragonRiderState {
  const updatedDragons = state.dragons.map(d =>
    d.id === dragonId ? { ...d, nickname } : d,
  );
  return { ...state, dragons: updatedDragons };
}

/** Release (delete) a dragon. */
export function drReleaseDragon(state: DragonRiderState, dragonId: string): DragonRiderState {
  const filtered = state.dragons.filter(d => d.id !== dragonId);
  const newActiveId = state.activeDragonId === dragonId
    ? (filtered.length > 0 ? filtered[0].id : '')
    : state.activeDragonId;
  return { ...state, dragons: filtered, activeDragonId: newActiveId };
}

/** Rest all dragons to full HP. */
export function drRestDragons(state: DragonRiderState): DragonRiderState {
  const updatedDragons = state.dragons.map(d => ({ ...d, hp: d.maxHp }));
  return { ...state, dragons: updatedDragons, currentHp: updatedDragons.find(d => d.id === state.activeDragonId)?.maxHp ?? 0 };
}

// ============================================================
// STATE REDUCERS — Flight Actions
// ============================================================

/** Execute barrel roll (dodge). */
export function drBarrelRoll(state: DragonRiderState): DragonRiderState {
  const skillId = 'barrel_roll';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute dive bomb. */
export function drDiveBomb(state: DragonRiderState): DragonRiderState {
  const skillId = 'dive_bomb';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute fire breath. */
export function drFireBreath(state: DragonRiderState): DragonRiderState {
  const skillId = 'fire_breath';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute ice shield. */
export function drIceShield(state: DragonRiderState): DragonRiderState {
  const skillId = 'ice_shield';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  const activeDragon = drGetActiveDragon(state.dragons, state.activeDragonId);
  if (activeDragon) {
    const boostedDragon = { ...activeDragon, defense: activeDragon.defense + 10 };
    const updatedDragons = state.dragons.map(d =>
      d.id === activeDragon.id ? boostedDragon : d,
    );
    return { ...state, skills: updatedSkills, dragons: updatedDragons };
  }
  return { ...state, skills: updatedSkills };
}

/** Execute lightning strike. */
export function drLightningStrike(state: DragonRiderState): DragonRiderState {
  const skillId = 'lightning_strike';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute shadow cloak. */
export function drShadowCloak(state: DragonRiderState): DragonRiderState {
  const skillId = 'shadow_cloak';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute wind gust. */
export function drWindGust(state: DragonRiderState): DragonRiderState {
  const skillId = 'wind_gust';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** Execute dragon roar. */
export function drDragonRoar(state: DragonRiderState): DragonRiderState {
  const skillId = 'dragon_roar';
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

/** General skill execution by ID. */
export function drExecuteSkill(state: DragonRiderState, skillId: string): DragonRiderState {
  const skill = state.skills.find(s => s.id === skillId);
  if (!skill || !skill.isUnlocked || skill.currentCooldown > 0) return state;
  const updatedSkills = state.skills.map(s =>
    s.id === skillId ? { ...s, currentCooldown: s.cooldown } : s,
  );
  return { ...state, skills: updatedSkills };
}

// ============================================================
// AGGREGATE QUERIES
// ============================================================

/** Get dragon power score (composite). */
export function drDragonPower(dragon: DrDragon): number {
  return dragon.hp + dragon.speed * 2 + dragon.attack * 3 + dragon.defense * 2 + dragon.bond;
}

/** Get strongest dragon. */
export function drStrongestDragon(dragons: readonly DrDragon[]): DrDragon | undefined {
  if (dragons.length === 0) return undefined;
  return dragons.reduce((best, d) => drDragonPower(d) > drDragonPower(best) ? d : best, dragons[0]);
}

/** Get fastest dragon. */
export function drFastestDragon(dragons: readonly DrDragon[]): DrDragon | undefined {
  if (dragons.length === 0) return undefined;
  return dragons.reduce((fastest, d) => d.speed > fastest.speed ? d : fastest, dragons[0]);
}

/** Get total dragon count. */
export function drDragonCount(dragons: readonly DrDragon[]): number {
  return dragons.length;
}

/** Get egg count. */
export function drEggCount(eggs: readonly DrDragonEgg[]): number {
  return eggs.length;
}

/** Get ready egg count. */
export function drReadyEggCount(eggs: readonly DrDragonEgg[]): number {
  return eggs.filter(e => e.isReady).length;
}

/** Get average dragon bond. */
export function drAverageBond(dragons: readonly DrDragon[]): number {
  if (dragons.length === 0) return 0;
  const total = dragons.reduce((sum, d) => sum + d.bond, 0);
  return Math.floor(total / dragons.length);
}

/** Get total dragon XP across all dragons. */
export function drTotalDragonXp(dragons: readonly DrDragon[]): number {
  return dragons.reduce((sum, d) => sum + d.xp, 0);
}

/** Get average dragon happiness. */
export function drAverageHappiness(dragons: readonly DrDragon[]): number {
  if (dragons.length === 0) return 0;
  const total = dragons.reduce((sum, d) => sum + d.happiness, 0);
  return Math.floor(total / dragons.length);
}

/** Count dragons by life stage. */
export function drCountByLifeStage(dragons: readonly DrDragon[], stage: DrLifeStage): number {
  return dragons.filter(d => d.lifeStage === stage).length;
}

/** Get life stage distribution. */
export function drLifeStageDistribution(dragons: readonly DrDragon[]): Record<DrLifeStage, number> {
  return {
    egg: drCountByLifeStage(dragons, 'egg'),
    hatchling: drCountByLifeStage(dragons, 'hatchling'),
    juvenile: drCountByLifeStage(dragons, 'juvenile'),
    adult: drCountByLifeStage(dragons, 'adult'),
    elder: drCountByLifeStage(dragons, 'elder'),
  };
}

/** Get unlocked skill count. */
export function drUnlockedSkillCount(skills: readonly DrRidingSkill[]): number {
  return skills.filter(s => s.isUnlocked).length;
}

/** Get skills on cooldown. */
export function drSkillsOnCooldown(skills: readonly DrRidingSkill[]): readonly DrRidingSkill[] {
  return skills.filter(s => s.isUnlocked && s.currentCooldown > 0);
}

/** Get territory defense percentage. */
export function drTerritoryDefensePct(territory: DrTerritory): number {
  if (territory.maxDefenseLevel <= 0) return 0;
  return Math.floor((territory.defenseLevel / territory.maxDefenseLevel) * 100);
}

/** Get overall kingdom defense rating. */
export function drKingdomDefenseRating(territories: readonly DrTerritory[]): number {
  if (territories.length === 0) return 0;
  const total = territories.reduce((sum, t) => sum + t.defenseLevel, 0);
  return Math.floor(total / territories.length);
}

/** Count equipment owned. */
export function drEquipmentCount(equipment: readonly DrEquipment[]): number {
  return equipment.length;
}

/** Count equipped items. */
export function drEquippedCount(equipment: readonly DrEquipment[]): number {
  return equipment.filter(e => e.isEquipped).length;
}

/** Get flight zone danger level as a label. */
export function drZoneDangerLabel(difficulty: number): string {
  if (difficulty <= 1) return 'Safe';
  if (difficulty <= 2) return 'Moderate';
  if (difficulty <= 3) return 'Dangerous';
  if (difficulty <= 4) return 'Lethal';
  if (difficulty <= 5) return 'Extreme';
  return 'Apex';
}

/** Get enemy threat level as a label. */
export function drEnemyThreatLabel(enemy: DrAerialEnemy): string {
  if (enemy.isBoss) return 'BOSS';
  if (enemy.hp >= 120) return 'High';
  if (enemy.hp >= 70) return 'Medium';
  return 'Low';
}

/** Calculate breed compatibility (0-100). */
export function drBreedCompatibility(parentA: DrDragon, parentB: DrDragon): number {
  if (parentA.id === parentB.id) return 0;
  const speciesA = drGetSpeciesForDragon(parentA);
  const speciesB = drGetSpeciesForDragon(parentB);
  if (!speciesA || !speciesB) return 0;
  if (speciesA.element === speciesB.element) return 90;
  if (speciesA.rarity === speciesB.rarity) return 70;
  return 50;
}

/** Determine breed outcome rarity preview. */
export function drBreedRarityPreview(parentA: DrDragon, parentB: DrDragon): DrRarity {
  const speciesA = drGetSpeciesForDragon(parentA);
  const speciesB = drGetSpeciesForDragon(parentB);
  if (!speciesA || !speciesB) return 'common';
  const rarityOrder: readonly DrRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const idxA = rarityOrder.indexOf(speciesA.rarity);
  const idxB = rarityOrder.indexOf(speciesB.rarity);
  const childIdx = Math.min(idxA, idxB);
  const boosted = Math.random() < 0.2 ? childIdx + 1 : childIdx;
  return rarityOrder[Math.min(boosted, rarityOrder.length - 1)];
}

/** Generate a random enemy for a zone. */
export function drRandomZoneEnemy(zoneId: DrFlightZoneId): DrAerialEnemy | undefined {
  const enemies = drGetZoneEnemies(zoneId);
  if (enemies.length === 0) return undefined;
  return enemies[Math.floor(Math.random() * enemies.length)];
}

/** Get flight summary stats. */
export function drFlightSummary(rider: DrRiderProfile): Readonly<{
  readonly totalFlights: number;
  readonly totalKills: number;
  readonly totalRaces: number;
  readonly totalBreeds: number;
  readonly totalDefenses: number;
  readonly killPerFlight: number;
}> {
  const killPerFlight = rider.totalFlights > 0
    ? Math.floor((rider.totalKills / rider.totalFlights) * 100) / 100
    : 0;
  return {
    totalFlights: rider.totalFlights,
    totalKills: rider.totalKills,
    totalRaces: rider.totalRaces,
    totalBreeds: rider.totalBreeds,
    totalDefenses: rider.totalDefenses,
    killPerFlight,
  };
}

/** Get dragon portfolio summary. */
export function drPortfolioSummary(
  dragons: readonly DrDragon[],
  eggs: readonly DrDragonEgg[],
): Readonly<{
  readonly dragonCount: number;
  readonly eggCount: number;
  readonly readyToHatch: number;
  readonly maxLevel: number;
  readonly avgBond: number;
  readonly elderCount: number;
}> {
  return {
    dragonCount: dragons.length,
    eggCount: eggs.length,
    readyToHatch: drReadyEggCount(eggs),
    maxLevel: dragons.length > 0 ? Math.max(...dragons.map(d => d.level)) : 0,
    avgBond: drAverageBond(dragons),
    elderCount: drCountByLifeStage(dragons, 'elder'),
  };
}

/** Calculate rider progress to next level as percentage. */
export function drRiderLevelProgress(rider: DrRiderProfile): number {
  const currentThreshold = drXpForLevel(rider.level);
  const nextThreshold = drXpForLevel(Math.min(rider.level + 1, 45));
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;
  return Math.floor(((rider.xp - currentThreshold) / range) * 100);
}

/** Check if rider has reached max level. */
export function drIsMaxLevel(rider: DrRiderProfile): boolean {
  return rider.level >= 45;
}

/** Get total combat entries. */
export function drCombatLogSize(combatLog: readonly DrCombatEntry[]): number {
  return combatLog.length;
}

/** Get last N combat entries. */
export function drRecentCombatLog(combatLog: readonly DrCombatEntry[], count: number): readonly DrCombatEntry[] {
  return combatLog.slice(-count);
}

/** Filter combat log by attacker name. */
export function drCombatLogByAttacker(combatLog: readonly DrCombatEntry[], attackerName: string): readonly DrCombatEntry[] {
  return combatLog.filter(e => e.attacker === attackerName);
}

/** Get total damage dealt in combat log. */
export function drTotalDamageDealt(combatLog: readonly DrCombatEntry[]): number {
  return combatLog.reduce((sum, e) => sum + e.damage, 0);
}

/** Get critical hit count. */
export function drCriticalHitCount(combatLog: readonly DrCombatEntry[]): number {
  return combatLog.filter(e => e.isCritical).length;
}

/** Get critical hit rate. */
export function drCriticalHitRate(combatLog: readonly DrCombatEntry[]): number {
  if (combatLog.length === 0) return 0;
  return Math.floor((drCriticalHitCount(combatLog) / combatLog.length) * 100);
}

/** Sort dragons by power (descending). */
export function drSortDragonsByPower(dragons: readonly DrDragon[]): readonly DrDragon[] {
  return [...dragons].sort((a, b) => drDragonPower(b) - drDragonPower(a));
}

/** Sort dragons by level (descending). */
export function drSortDragonsByLevel(dragons: readonly DrDragon[]): readonly DrDragon[] {
  return [...dragons].sort((a, b) => b.level - a.level);
}

/** Sort dragons by speed (descending). */
export function drSortDragonsBySpeed(dragons: readonly DrDragon[]): readonly DrDragon[] {
  return [...dragons].sort((a, b) => b.speed - a.speed);
}

/** Sort dragons by bond (descending). */
export function drSortDragonsByBond(dragons: readonly DrDragon[]): readonly DrDragon[] {
  return [...dragons].sort((a, b) => b.bond - a.bond);
}

/** Sort equipment by stat boost (descending). */
export function drSortEquipmentByBoost(equipment: readonly DrEquipment[]): readonly DrEquipment[] {
  return [...equipment].sort((a, b) => b.statBoost - a.statBoost);
}

/** Filter equipment by slot. */
export function drFilterEquipmentBySlot(equipment: readonly DrEquipment[], slot: DrEquipSlot): readonly DrEquipment[] {
  return equipment.filter(e => e.slot === slot);
}

/** Filter equipment by rarity. */
export function drFilterEquipmentByRarity(equipment: readonly DrEquipment[], rarity: DrRarity): readonly DrEquipment[] {
  return equipment.filter(e => e.rarity === rarity);
}

/** Filter equipment by element. */
export function drFilterEquipmentByElement(equipment: readonly DrEquipment[], element: DrElement): readonly DrEquipment[] {
  return equipment.filter(e => e.element === element);
}

/** Get territories that need reinforcement. */
export function drTerritoriesNeedingReinforcement(territories: readonly DrTerritory[]): readonly DrTerritory[] {
  return territories.filter(t => t.defenseLevel < 50);
}

/** Get territories currently under siege. */
export function drTerritoriesUnderSiege(territories: readonly DrTerritory[]): readonly DrTerritory[] {
  return territories.filter(t => t.underSiege);
}

/** Get defense mission for a given territory. */
export function drDefenseMissionForTerritory(
  missions: readonly DrDefenseMission[],
  territoryId: DrTerritoryId,
): DrDefenseMission | undefined {
  return missions.find(m => m.territoryId === territoryId && m.status === 'inProgress');
}

/** Get completed missions count. */
export function drCompletedDefenseMissions(missions: readonly DrDefenseMission[]): number {
  return missions.filter(m => m.status === 'completed').length;
}

/** Get failed missions count. */
export function drFailedDefenseMissions(missions: readonly DrDefenseMission[]): number {
  return missions.filter(m => m.status === 'failed').length;
}

/** Get breeding log size. */
export function drBreedingLogSize(breedingLog: readonly DrBreedingRecord[]): number {
  return breedingLog.length;
}

/** Get recent breeding records. */
export function drRecentBreedingLog(breedingLog: readonly DrBreedingRecord[], count: number): readonly DrBreedingRecord[] {
  return breedingLog.slice(-count);
}

/** Get dragon combat readiness (HP percentage). */
export function drCombatReadiness(dragon: DrDragon): number {
  if (dragon.maxHp <= 0) return 0;
  return Math.floor((dragon.hp / dragon.maxHp) * 100);
}

/** Check if dragon is ready for combat (HP > 50%). */
export function drIsCombatReady(dragon: DrDragon): boolean {
  return drCombatReadiness(dragon) >= 50;
}

/** Get skill effectiveness against an enemy element. */
export function drSkillEffectiveness(skill: DrRidingSkill, enemyElement: DrElement): number {
  return drElementMultiplier(skill.element, enemyElement);
}

/** Determine recommended skill for an enemy. */
export function drRecommendedSkill(
  skills: readonly DrRidingSkill[],
  enemyElement: DrElement,
): DrRidingSkill | undefined {
  const available = skills.filter(s => s.isUnlocked && s.currentCooldown === 0 && s.damage > 0);
  if (available.length === 0) return undefined;
  return available.reduce((best, s) => {
    const eff = drElementMultiplier(s.element, enemyElement);
    const bestEff = drElementMultiplier(best.element, enemyElement);
    return eff > bestEff ? s : best;
  });
}

/** Get dragon overview text. */
export function drDragonOverview(dragon: DrDragon): string {
  const readiness = drCombatReadiness(dragon);
  const power = drDragonPower(dragon);
  return `${dragon.nickname} (Lv.${dragon.level} ${dragon.lifeStage}) — HP: ${dragon.hp}/${dragon.maxHp} | Power: ${power} | Readiness: ${readiness}%`;
}

/** Get rider summary text. */
export function drRiderSummary(rider: DrRiderProfile): string {
  return `${rider.name} — ${rider.title} | Level ${rider.level} | Gold: ${rider.gold} | Gems: ${rider.gems}`;
}

/** Get zone summary text. */
export function drZoneSummary(zone: DrFlightZone): string {
  const danger = drZoneDangerLabel(zone.difficulty);
  return `${zone.name} — Danger: ${danger} | Required Level: ${zone.requiredLevel} | Enemies: ${zone.enemies.length}`;
}

/** Get territory summary text. */
export function drTerritorySummary(territory: DrTerritory): string {
  const pct = drTerritoryDefensePct(territory);
  const status = territory.underSiege ? ' ⚠️ UNDER SIEGE' : '';
  return `${territory.name} — Defense: ${pct}% | Defenders: ${territory.defenderCount}${status}`;
}

/** Get enemy summary text. */
export function drEnemySummary(enemy: DrAerialEnemy): string {
  const threat = drEnemyThreatLabel(enemy);
  return `${enemy.name} — HP: ${enemy.hp} | ATK: ${enemy.attack} | DEF: ${enemy.defense} | Threat: ${threat}`;
}

/** Create initial default state. */
export function drCreateInitialState(): DragonRiderState {
  const starterSpecies = DR_DRAGON_SPECIES[0];
  const starterStats = drCalculateDragonStats(starterSpecies, 1);
  const starterDragon: DrDragon = {
    id: drGenerateId(),
    speciesId: starterSpecies.id,
    name: starterSpecies.name,
    nickname: starterSpecies.name,
    level: 1,
    xp: 0,
    lifeStage: 'hatchling',
    hp: starterStats.hp,
    maxHp: starterStats.hp,
    speed: starterStats.speed,
    attack: starterStats.attack,
    defense: starterStats.defense,
    bond: 30,
    happiness: 90,
    isMounted: true,
  };

  const initialSkills: DrRidingSkill[] = DR_RIDING_SKILLS.map((s, idx) => ({
    ...s,
    currentCooldown: 0,
    isUnlocked: idx < 3,
    level: 1,
  }));

  const initialZones: DrFlightZone[] = DR_FLIGHT_ZONES.map(z => ({
    ...z,
    isUnlocked: z.requiredLevel <= 1,
  }));

  const initialTerritories: DrTerritory[] = DR_TERRITORIES.map(t => ({
    ...t,
    defenseLevel: 60,
    underSiege: false,
    siegeProgress: 0,
    defenderCount: 1,
  }));

  const initialAchievements: DrAchievement[] = DR_ACHIEVEMENTS.map(a => ({
    ...a,
    isUnlocked: false,
    progress: 0,
  }));

  const allEquipment: DrEquipment[] = [
    ...DR_DEFAULT_SADDLES,
    ...DR_DEFAULT_ARMOR,
    ...DR_DEFAULT_REINS,
  ];

  const initialPatrol: DrDailyPatrol = {
    id: drGenerateId(),
    zoneId: 'volcanic_peaks',
    isCompleted: false,
    enemiesDefeated: 0,
    requiredKills: 10,
    reward: 80,
    streak: 0,
  };

  return {
    rider: {
      name: 'New Rider',
      title: DR_RIDER_TITLES[0],
      level: 1,
      xp: 0,
      maxXp: DR_RIDER_XP_TABLE[1],
      gold: 200,
      gems: 5,
      totalFlights: 0,
      totalKills: 0,
      totalRaces: 0,
      totalBreeds: 0,
      totalDefenses: 0,
    },
    dragons: [starterDragon],
    activeDragonId: starterDragon.id,
    eggs: [],
    skills: initialSkills,
    zones: initialZones,
    enemies: [...DR_AERIAL_ENEMIES],
    territories: initialTerritories,
    defenseMissions: [],
    equipment: allEquipment,
    races: [],
    achievements: initialAchievements,
    dailyPatrol: initialPatrol,
    combatLog: [],
    breedingLog: [],
    currentZoneId: 'volcanic_peaks',
    isMounted: true,
    currentHp: starterStats.hp,
  };
}

// ============================================================
// DEFAULT EXPORT — React Hook (ONLY place React is imported)
// ============================================================
/* eslint-disable @typescript-eslint/no-require-imports */

type DrSetState = (next: DragonRiderState | ((prev: DragonRiderState) => DragonRiderState)) => void;

export default function useDragonRider(initialState?: DragonRiderState): {
  readonly state: DragonRiderState;
  readonly setState: DrSetState;
} {
  const React = require('react') as { useState: <T>(v: T) => [T, DrSetState & ((v: T) => void)] };
  const [state, setState] = React.useState<DragonRiderState>(initialState ?? drCreateInitialState());
  return { state, setState };
}
