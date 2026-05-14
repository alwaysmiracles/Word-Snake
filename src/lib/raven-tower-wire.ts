/**
 * Raven Tower Wire (渡鸦塔) — A dark gothic tower defense game
 *
 * 8 tower floors (Dungeon → Observatory), 10 raven types, 8 traps,
 * 4 wall upgrades, 12 dark magic spells, 12 monster types, boss
 * encounters every 5 waves, 15 achievements, Tower Keeper levels 1–45,
 * and daily dark assault challenges.
 *
 * All named exports use the `rv` prefix.
 * Default export: `useRavenTower(initialState?)` — uses only `useState`.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════

export type RavenType =
  | 'shadow'
  | 'storm'
  | 'fire'
  | 'ice'
  | 'death'
  | 'blood'
  | 'void'
  | 'bone'
  | 'hex'
  | 'soul';

export type FloorId =
  | 'dungeon'
  | 'catacombs'
  | 'blood_cellar'
  | 'soul_gallery'
  | 'curse_vault'
  | 'necropolis'
  | 'alchemy_spire'
  | 'observatory';

export type TrapType =
  | 'shadow_snare'
  | 'bone_spike'
  | 'blood_pit'
  | 'frost_field'
  | 'hex_circle'
  | 'void_rift'
  | 'fire_brazier'
  | 'soul_chain';

export type WallType =
  | 'stone'
  | 'iron'
  | 'obsidian'
  | 'void_barrier';

export type SpellId =
  | 'shadow_veil'
  | 'blood_boil'
  | 'frost_nova'
  | 'fire_storm'
  | 'death_grip'
  | 'soul_drain'
  | 'void_blast'
  | 'bone_army'
  | 'hex_bomb'
  | 'storm_call'
  | 'dark_heal'
  | 'raven_swarm';

export type MonsterType =
  | 'goblin'
  | 'skeleton'
  | 'ghost'
  | 'demon'
  | 'vampire'
  | 'wraith'
  | 'troll'
  | 'lich'
  | 'gargoyle'
  | 'banshee'
  | 'shadow_wyrm'
  | 'tower_boss';

export type AchievementId =
  | 'first_blood'
  | 'wave_10'
  | 'wave_25'
  | 'wave_50'
  | 'first_boss_kill'
  | 'all_floors_unlocked'
  | 'all_ravens_unlocked'
  | 'master_of_shadows'
  | 'ice_cold_killer'
  | 'fire_storm_master'
  | 'dark_healer'
  | 'trap_lord'
  | 'wall_of_steel'
  | 'keeper_level_30'
  | 'daily_assault_victor';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface RavenDef {
  readonly id: RavenType;
  readonly name: string;
  readonly description: string;
  readonly element: string;
  readonly baseDamage: number;
  readonly baseHealth: number;
  readonly speed: number;
  readonly range: number;
  readonly unlockLevel: number;
  readonly abilityName: string;
  readonly abilityDescription: string;
  readonly cooldown: number;
  readonly rarity: Rarity;
}

export interface FloorDef {
  readonly id: FloorId;
  readonly name: string;
  readonly description: string;
  readonly depth: number;
  readonly unlockLevel: number;
  readonly baseHp: number;
  readonly enemiesPerWave: number;
  readonly monsterPool: readonly MonsterType[];
  readonly bossType: MonsterType;
  readonly bgGradient: string;
}

export interface TrapDef {
  readonly id: TrapType;
  readonly name: string;
  readonly description: string;
  readonly damage: number;
  readonly slowFactor: number;
  readonly duration: number;
  readonly cost: number;
  readonly unlockLevel: number;
  readonly icon: string;
}

export interface WallDef {
  readonly id: WallType;
  readonly name: string;
  readonly description: string;
  readonly hp: number;
  readonly cost: number;
  readonly unlockLevel: number;
  readonly icon: string;
}

export interface SpellDef {
  readonly id: SpellId;
  readonly name: string;
  readonly description: string;
  readonly damage: number;
  readonly manaCost: number;
  readonly cooldown: number;
  readonly aoeRadius: number;
  readonly unlockLevel: number;
  readonly icon: string;
}

export interface MonsterDef {
  readonly id: MonsterType;
  readonly name: string;
  readonly description: string;
  readonly baseHp: number;
  readonly baseDamage: number;
  readonly speed: number;
  readonly armor: number;
  readonly soulShardDrop: number;
  readonly darkCrystalDrop: number;
  readonly isBoss: boolean;
  readonly icon: string;
}

export interface AchievementDef {
  readonly id: AchievementId;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly reward: { readonly darkCrystals: number; readonly soulShards: number };
}

export interface DeployedRaven {
  readonly instanceId: string;
  readonly ravenType: RavenType;
  readonly level: number;
  readonly currentHp: number;
  readonly maxHp: number;
  readonly currentCooldown: number;
  readonly kills: number;
}

export interface DeployedTrap {
  readonly instanceId: string;
  readonly trapType: TrapType;
  readonly remainingDuration: number;
  readonly charges: number;
  readonly position: number;
}

export interface WaveState {
  readonly waveNumber: number;
  readonly enemiesRemaining: number;
  readonly isBossWave: boolean;
  readonly currentFloor: FloorId;
  readonly isComplete: boolean;
}

export interface DailyAssault {
  readonly date: string;
  readonly isActive: boolean;
  readonly wavesCompleted: number;
  readonly totalWaves: number;
  readonly bonusMultiplier: number;
  readonly isComplete: boolean;
  readonly darkCrystalsEarned: number;
  readonly soulShardsEarned: number;
}

export interface RavenTowerState {
  readonly darkCrystals: number;
  readonly soulShards: number;
  readonly mana: number;
  readonly maxMana: number;
  readonly keeperLevel: number;
  readonly keeperXp: number;
  readonly xpToNextLevel: number;
  readonly currentFloor: FloorId;
  readonly floorLevels: Readonly<Record<FloorId, number>>;
  readonly unlockedRavens: readonly RavenType[];
  readonly unlockedSpells: readonly SpellId[];
  readonly unlockedFloors: readonly FloorId[];
  readonly unlockedTraps: readonly TrapType[];
  readonly unlockedWalls: readonly WallType[];
  readonly achievements: readonly AchievementId[];
  readonly deployedRavens: readonly DeployedRaven[];
  readonly deployedTraps: readonly DeployedTrap[];
  readonly currentWave: WaveState;
  readonly totalKills: number;
  readonly totalWavesCompleted: number;
  readonly bossKills: number;
  readonly highestWave: number;
  readonly dailyAssault: DailyAssault;
  readonly wallType: WallType;
  readonly wallHp: number;
  readonly wallMaxHp: number;
  readonly shieldAmount: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: CONSTANTS — FLOOR DEFINITIONS (8 floors)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_FLOOR_DEFS: readonly FloorDef[] = [
  {
    id: 'dungeon',
    name: 'Dungeon',
    description: 'The darkest depths of the tower, where goblins and skeletons lurk in the eternal gloom.',
    depth: 0,
    unlockLevel: 1,
    baseHp: 200,
    enemiesPerWave: 5,
    monsterPool: ['goblin', 'skeleton', 'ghost'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 50%, #0d0d1a 100%)',
  },
  {
    id: 'catacombs',
    name: 'Catacombs',
    description: 'Twisting passages filled with restless dead and cursed bones that whisper in the dark.',
    depth: 1,
    unlockLevel: 5,
    baseHp: 350,
    enemiesPerWave: 6,
    monsterPool: ['skeleton', 'ghost', 'wraith'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 50%, #0d0d1a 100%)',
  },
  {
    id: 'blood_cellar',
    name: 'Blood Cellar',
    description: 'A cellar stained crimson by centuries of dark rituals. Vampires prowl among the barrels.',
    depth: 2,
    unlockLevel: 10,
    baseHp: 500,
    enemiesPerWave: 7,
    monsterPool: ['vampire', 'ghost', 'demon'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #2d0a0a 0%, #4a0e0e 50%, #1a0a0a 100%)',
  },
  {
    id: 'soul_gallery',
    name: 'Soul Gallery',
    description: 'Portraits of trapped souls line the walls. Wraiths drift between the frames, seeking escape.',
    depth: 3,
    unlockLevel: 15,
    baseHp: 700,
    enemiesPerWave: 8,
    monsterPool: ['wraith', 'ghost', 'banshee'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #1a1a2e 0%, #0e2a4a 50%, #0d1a2d 100%)',
  },
  {
    id: 'curse_vault',
    name: 'Curse Vault',
    description: 'Sealed chambers of concentrated hex energy. The air crackles with misfortune and dark intent.',
    depth: 4,
    unlockLevel: 20,
    baseHp: 900,
    enemiesPerWave: 9,
    monsterPool: ['demon', 'wraith', 'gargoyle'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #2e0a2e 0%, #4a1e4a 50%, #1a0d1a 100%)',
  },
  {
    id: 'necropolis',
    name: 'Necropolis',
    description: 'An indoor graveyard of towering tombstones. Liches command armies of risen dead.',
    depth: 5,
    unlockLevel: 28,
    baseHp: 1200,
    enemiesPerWave: 10,
    monsterPool: ['skeleton', 'lich', 'troll'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #0a1a0a 0%, #1a3a1a 50%, #0d0d0d 100%)',
  },
  {
    id: 'alchemy_spire',
    name: 'Alchemy Spire',
    description: 'A soaring spire of bubbling cauldrons. Trolls guard the passages to forbidden knowledge.',
    depth: 6,
    unlockLevel: 36,
    baseHp: 1500,
    enemiesPerWave: 11,
    monsterPool: ['demon', 'troll', 'shadow_wyrm'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #1a1a0a 0%, #3a2a0a 50%, #0d0d0d 100%)',
  },
  {
    id: 'observatory',
    name: 'Observatory',
    description: 'The pinnacle of the Raven Tower. All dark arts converge under an endless starless sky.',
    depth: 7,
    unlockLevel: 42,
    baseHp: 2000,
    enemiesPerWave: 12,
    monsterPool: ['demon', 'lich', 'shadow_wyrm', 'banshee'],
    bossType: 'tower_boss',
    bgGradient: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a3a 50%, #2a1a4a 100%)',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: CONSTANTS — RAVEN DEFINITIONS (10 raven types)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_RAVEN_DEFS: readonly RavenDef[] = [
  {
    id: 'shadow',
    name: 'Shadow Raven',
    description: 'A raven woven from living darkness. It strikes from unseen angles and blinds enemies with shadow.',
    element: 'Darkness',
    baseDamage: 18,
    baseHealth: 120,
    speed: 14,
    range: 5,
    unlockLevel: 1,
    abilityName: 'Shadow Veil',
    abilityDescription: 'Cloaks all allied ravens in shadow, making them untargetable for 3 seconds.',
    cooldown: 5,
    rarity: 'common',
  },
  {
    id: 'storm',
    name: 'Storm Raven',
    description: 'Feathers crackle with lightning. It summons thunderbolts that chain between enemies.',
    element: 'Lightning',
    baseDamage: 22,
    baseHealth: 100,
    speed: 18,
    range: 6,
    unlockLevel: 1,
    abilityName: 'Thunder Strike',
    abilityDescription: 'Calls down a lightning bolt that chains to 3 nearby enemies, stunning them briefly.',
    cooldown: 4,
    rarity: 'common',
  },
  {
    id: 'fire',
    name: 'Fire Raven',
    description: 'A raven of living flame. Its attacks leave burning ground that damages enemies over time.',
    element: 'Fire',
    baseDamage: 28,
    baseHealth: 90,
    speed: 12,
    range: 4,
    unlockLevel: 5,
    abilityName: 'Inferno Dive',
    abilityDescription: 'Dives into a group of enemies, exploding in a ring of fire that burns for 4 seconds.',
    cooldown: 6,
    rarity: 'uncommon',
  },
  {
    id: 'ice',
    name: 'Ice Raven',
    description: 'Frost crystallizes on its wings. It freezes enemies solid and shatters them with sonic cries.',
    element: 'Ice',
    baseDamage: 15,
    baseHealth: 130,
    speed: 10,
    range: 5,
    unlockLevel: 8,
    abilityName: 'Cryogenic Pulse',
    abilityDescription: 'Emits a pulse of absolute cold, freezing all enemies in range for 2 seconds.',
    cooldown: 7,
    rarity: 'uncommon',
  },
  {
    id: 'death',
    name: 'Death Raven',
    description: 'An omen of doom. Its touch drains life force, transferring it to allied ravens.',
    element: 'Death',
    baseDamage: 24,
    baseHealth: 110,
    speed: 13,
    range: 4,
    unlockLevel: 12,
    abilityName: 'Soul Reaper',
    abilityDescription: 'Marks a target for death. After 3 seconds the target takes massive damage and heals all allies.',
    cooldown: 8,
    rarity: 'rare',
  },
  {
    id: 'blood',
    name: 'Blood Raven',
    description: 'Crimson feathers drip with dark vitality. It can siphon blood from enemies to restore allies.',
    element: 'Blood',
    baseDamage: 20,
    baseHealth: 140,
    speed: 11,
    range: 3,
    unlockLevel: 16,
    abilityName: 'Blood Pact',
    abilityDescription: 'Drains health from all enemies in range and distributes it evenly among allied ravens.',
    cooldown: 6,
    rarity: 'rare',
  },
  {
    id: 'void',
    name: 'Void Raven',
    description: 'A raven that tears holes in reality. It banishes enemies to the void between dimensions.',
    element: 'Void',
    baseDamage: 35,
    baseHealth: 80,
    speed: 16,
    range: 7,
    unlockLevel: 22,
    abilityName: 'Dimensional Rift',
    abilityDescription: 'Opens a rift that pulls all enemies toward its center, then banishes them for 3 seconds.',
    cooldown: 10,
    rarity: 'epic',
  },
  {
    id: 'bone',
    name: 'Bone Raven',
    description: 'Constructed from the remains of fallen warriors. It summons skeletal minions to fight alongside.',
    element: 'Bone',
    baseDamage: 16,
    baseHealth: 160,
    speed: 8,
    range: 3,
    unlockLevel: 26,
    abilityName: 'Raise Dead',
    abilityDescription: 'Summons 3 skeletal ravens that fight for 5 seconds before collapsing into bone dust.',
    cooldown: 9,
    rarity: 'epic',
  },
  {
    id: 'hex',
    name: 'Hex Raven',
    description: 'Its feathers are inscribed with ancient curse sigils. Enemies near it suffer weakening hexes.',
    element: 'Curse',
    baseDamage: 30,
    baseHealth: 95,
    speed: 15,
    range: 6,
    unlockLevel: 32,
    abilityName: 'Cascade Hex',
    abilityDescription: 'Casts a hex that jumps between 5 enemies, reducing their armor and speed by 50% for 4 seconds.',
    cooldown: 8,
    rarity: 'legendary',
  },
  {
    id: 'soul',
    name: 'Soul Raven',
    description: 'The rarest of all ravens, forged from captured souls. It can bind spirits and command ethereal forces.',
    element: 'Soul',
    baseDamage: 40,
    baseHealth: 100,
    speed: 20,
    range: 8,
    unlockLevel: 38,
    abilityName: 'Spirit Tempest',
    abilityDescription: 'Unleashes a tempest of vengeful spirits that damage all enemies and shield all allies for 5 seconds.',
    cooldown: 12,
    rarity: 'legendary',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 4: CONSTANTS — TRAP DEFINITIONS (8 trap types)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_TRAP_DEFS: readonly TrapDef[] = [
  {
    id: 'shadow_snare',
    name: 'Shadow Snare',
    description: 'A net of living darkness that entangles enemies, reducing their speed drastically.',
    damage: 5,
    slowFactor: 0.4,
    duration: 8,
    cost: 30,
    unlockLevel: 1,
    icon: '🕸️',
  },
  {
    id: 'bone_spike',
    name: 'Bone Spike',
    description: 'Skeletal spikes erupt from the ground, impaling enemies that step on them.',
    damage: 25,
    slowFactor: 0,
    duration: 6,
    cost: 50,
    unlockLevel: 3,
    icon: '🦴',
  },
  {
    id: 'blood_pit',
    name: 'Blood Pit',
    description: 'A pool of cursed blood that continuously damages and weakens enemies wading through.',
    damage: 15,
    slowFactor: 0.3,
    duration: 10,
    cost: 60,
    unlockLevel: 6,
    icon: '🩸',
  },
  {
    id: 'frost_field',
    name: 'Frost Field',
    description: 'An area of supernatural cold that freezes enemies solid upon contact.',
    damage: 10,
    slowFactor: 0.7,
    duration: 5,
    cost: 45,
    unlockLevel: 9,
    icon: '❄️',
  },
  {
    id: 'hex_circle',
    name: 'Hex Circle',
    description: 'A drawn circle of curse sigils that strips armor from enemies within its bounds.',
    damage: 8,
    slowFactor: 0.2,
    duration: 12,
    cost: 70,
    unlockLevel: 14,
    icon: '🔮',
  },
  {
    id: 'void_rift',
    name: 'Void Rift',
    description: 'A tear in reality that slowly pulls enemies toward its center, dealing void damage.',
    damage: 30,
    slowFactor: 0.5,
    duration: 8,
    cost: 90,
    unlockLevel: 20,
    icon: '🌀',
  },
  {
    id: 'fire_brazier',
    name: 'Fire Brazier',
    description: 'A hellfire brazier that launches fireballs at enemies passing nearby.',
    damage: 35,
    slowFactor: 0,
    duration: 10,
    cost: 80,
    unlockLevel: 25,
    icon: '🔥',
  },
  {
    id: 'soul_chain',
    name: 'Soul Chain',
    description: 'Ethereal chains that link enemies together, causing damage to spread between them.',
    damage: 20,
    slowFactor: 0.35,
    duration: 7,
    cost: 100,
    unlockLevel: 30,
    icon: '⛓️',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 5: CONSTANTS — WALL DEFINITIONS (4 wall types)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_WALL_DEFS: readonly WallDef[] = [
  {
    id: 'stone',
    name: 'Stone Wall',
    description: 'Basic stone fortification. Provides minimal protection against the undead horde.',
    hp: 500,
    cost: 100,
    unlockLevel: 1,
    icon: '🧱',
  },
  {
    id: 'iron',
    name: 'Iron Wall',
    description: 'Reinforced iron plating. Wards off physical attacks and resists curses.',
    hp: 1000,
    cost: 300,
    unlockLevel: 10,
    icon: '🔩',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Wall',
    description: 'Wall forged from volcanic obsidian. Absorbs dark magic and reflects hexes.',
    hp: 2000,
    cost: 700,
    unlockLevel: 22,
    icon: '🖤',
  },
  {
    id: 'void_barrier',
    name: 'Void Barrier',
    description: 'A shimmering barrier of pure void energy. Nearly indestructible and phases attackers.',
    hp: 4000,
    cost: 1500,
    unlockLevel: 35,
    icon: '🌀',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 6: CONSTANTS — SPELL DEFINITIONS (12 spells)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_SPELL_DEFS: readonly SpellDef[] = [
  {
    id: 'shadow_veil',
    name: 'Shadow Veil',
    description: 'Shrouds the entire floor in impenetrable darkness, making enemies unable to attack for 3 seconds.',
    damage: 0,
    manaCost: 15,
    cooldown: 8,
    aoeRadius: 10,
    unlockLevel: 1,
    icon: '🌑',
  },
  {
    id: 'blood_boil',
    name: 'Blood Boil',
    description: 'Causes the blood of all enemies in range to boil, dealing heavy damage over 4 seconds.',
    damage: 60,
    manaCost: 25,
    cooldown: 6,
    aoeRadius: 4,
    unlockLevel: 3,
    icon: '🩸',
  },
  {
    id: 'frost_nova',
    name: 'Frost Nova',
    description: 'An explosion of absolute cold that freezes all nearby enemies solid for 3 seconds.',
    damage: 30,
    manaCost: 20,
    cooldown: 7,
    aoeRadius: 5,
    unlockLevel: 5,
    icon: '❄️',
  },
  {
    id: 'fire_storm',
    name: 'Fire Storm',
    description: 'Rains hellfire across a wide area, dealing massive damage to all enemies caught within.',
    damage: 90,
    manaCost: 40,
    cooldown: 10,
    aoeRadius: 7,
    unlockLevel: 8,
    icon: '🔥',
  },
  {
    id: 'death_grip',
    name: 'Death Grip',
    description: 'A spectral hand reaches from the ground and crushes a single powerful enemy.',
    damage: 150,
    manaCost: 50,
    cooldown: 12,
    aoeRadius: 1,
    unlockLevel: 12,
    icon: '💀',
  },
  {
    id: 'soul_drain',
    name: 'Soul Drain',
    description: 'Rips fragments of soul energy from all enemies, healing all ravens by the damage dealt.',
    damage: 40,
    manaCost: 30,
    cooldown: 8,
    aoeRadius: 6,
    unlockLevel: 15,
    icon: '👻',
  },
  {
    id: 'void_blast',
    name: 'Void Blast',
    description: 'Concentrates void energy into a devastating explosion that banishes enemies from reality.',
    damage: 120,
    manaCost: 55,
    cooldown: 14,
    aoeRadius: 6,
    unlockLevel: 20,
    icon: '🕳️',
  },
  {
    id: 'bone_army',
    name: 'Bone Army',
    description: 'Raises an army of skeletal warriors that fight alongside your ravens for 8 seconds.',
    damage: 20,
    manaCost: 45,
    cooldown: 15,
    aoeRadius: 8,
    unlockLevel: 25,
    icon: '☠️',
  },
  {
    id: 'hex_bomb',
    name: 'Hex Bomb',
    description: 'Detonates a concentrated hex that reduces all enemy armor to zero in a massive blast.',
    damage: 70,
    manaCost: 35,
    cooldown: 9,
    aoeRadius: 8,
    unlockLevel: 30,
    icon: '🔮',
  },
  {
    id: 'storm_call',
    name: 'Storm Call',
    description: 'Summons a thunderstorm that strikes random enemies with lightning for 6 seconds.',
    damage: 50,
    manaCost: 45,
    cooldown: 11,
    aoeRadius: 9,
    unlockLevel: 34,
    icon: '⚡',
  },
  {
    id: 'dark_heal',
    name: 'Dark Heal',
    description: 'Channels dark energy to fully restore all ravens to full health and grant temporary shield.',
    damage: 0,
    manaCost: 60,
    cooldown: 18,
    aoeRadius: 10,
    unlockLevel: 38,
    icon: '💚',
  },
  {
    id: 'raven_swarm',
    name: 'Raven Swarm',
    description: 'Summons a massive swarm of shadow ravens that devour all enemies on the floor.',
    damage: 200,
    manaCost: 80,
    cooldown: 25,
    aoeRadius: 10,
    unlockLevel: 42,
    icon: '🐦‍⬛',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 7: CONSTANTS — MONSTER DEFINITIONS (12 monster types)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_MONSTER_DEFS: readonly MonsterDef[] = [
  {
    id: 'goblin',
    name: 'Cave Goblin',
    description: 'Small, numerous, and vicious. Goblins swarm in packs and overwhelm defenses with sheer numbers.',
    baseHp: 40,
    baseDamage: 5,
    speed: 8,
    armor: 0,
    soulShardDrop: 1,
    darkCrystalDrop: 1,
    isBoss: false,
    icon: '👺',
  },
  {
    id: 'skeleton',
    name: 'Skeleton Warrior',
    description: 'Animated bones armed with rusted weapons. They feel no pain and never stop advancing.',
    baseHp: 60,
    baseDamage: 8,
    speed: 5,
    armor: 3,
    soulShardDrop: 2,
    darkCrystalDrop: 1,
    isBoss: false,
    icon: '💀',
  },
  {
    id: 'ghost',
    name: 'Wailing Ghost',
    description: 'Ethereal spirits that phase through physical defenses. Only magic can harm them.',
    baseHp: 30,
    baseDamage: 12,
    speed: 10,
    armor: 0,
    soulShardDrop: 3,
    darkCrystalDrop: 2,
    isBoss: false,
    icon: '👻',
  },
  {
    id: 'demon',
    name: 'Lesser Demon',
    description: 'Imps and fiends from the lower planes. They burn with chaotic energy and hit hard.',
    baseHp: 100,
    baseDamage: 18,
    speed: 7,
    armor: 5,
    soulShardDrop: 4,
    darkCrystalDrop: 3,
    isBoss: false,
    icon: '😈',
  },
  {
    id: 'vampire',
    name: 'Crypt Vampire',
    description: 'Undead nobles that heal themselves by draining life from ravens and the tower wall.',
    baseHp: 120,
    baseDamage: 15,
    speed: 9,
    armor: 4,
    soulShardDrop: 5,
    darkCrystalDrop: 3,
    isBoss: false,
    icon: '🧛',
  },
  {
    id: 'wraith',
    name: 'Shadow Wraith',
    description: 'Formless terrors born from pure darkness. They drain mana from spellcasters on contact.',
    baseHp: 80,
    baseDamage: 20,
    speed: 12,
    armor: 2,
    soulShardDrop: 6,
    darkCrystalDrop: 4,
    isBoss: false,
    icon: '👤',
  },
  {
    id: 'troll',
    name: 'Cursed Troll',
    description: 'Massive brutes that regenerate health rapidly. They smash through defenses with brute force.',
    baseHp: 250,
    baseDamage: 25,
    speed: 4,
    armor: 10,
    soulShardDrop: 7,
    darkCrystalDrop: 5,
    isBoss: false,
    icon: '👹',
  },
  {
    id: 'lich',
    name: 'Tower Lich',
    description: 'Undead sorcerers of terrible power. They cast dark magic that weakens your ravens.',
    baseHp: 180,
    baseDamage: 30,
    speed: 6,
    armor: 6,
    soulShardDrop: 8,
    darkCrystalDrop: 6,
    isBoss: false,
    icon: '🧙',
  },
  {
    id: 'gargoyle',
    name: 'Stone Gargoyle',
    description: 'Living stone statues that fly over traps and land among your ravens with crushing force.',
    baseHp: 200,
    baseDamage: 22,
    speed: 11,
    armor: 15,
    soulShardDrop: 6,
    darkCrystalDrop: 5,
    isBoss: false,
    icon: '🗿',
  },
  {
    id: 'banshee',
    name: 'Death Banshee',
    description: 'Spectral harbingers whose scream stuns all ravens in range. They move terrifyingly fast.',
    baseHp: 70,
    baseDamage: 35,
    speed: 14,
    armor: 0,
    soulShardDrop: 9,
    darkCrystalDrop: 7,
    isBoss: false,
    icon: '😱',
  },
  {
    id: 'shadow_wyrm',
    name: 'Shadow Wyrm',
    description: 'A serpentine horror from the void. It consumes ravens whole and regenerates from shadow.',
    baseHp: 300,
    baseDamage: 40,
    speed: 8,
    armor: 12,
    soulShardDrop: 10,
    darkCrystalDrop: 8,
    isBoss: false,
    icon: '🐉',
  },
  {
    id: 'tower_boss',
    name: 'Tower Guardian',
    description: 'The ancient guardian of this floor. A colossal entity of dark magic that tests all who ascend.',
    baseHp: 1000,
    baseDamage: 50,
    speed: 3,
    armor: 20,
    soulShardDrop: 25,
    darkCrystalDrop: 15,
    isBoss: true,
    icon: '👑',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 8: CONSTANTS — ACHIEVEMENT DEFINITIONS (15 achievements)
// ═══════════════════════════════════════════════════════════════════════════

export const RV_ACHIEVEMENT_DEFS: readonly AchievementDef[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Defeat your first enemy in the Raven Tower.',
    icon: '🩸',
    reward: { darkCrystals: 50, soulShards: 20 },
  },
  {
    id: 'wave_10',
    name: 'Wave Breaker',
    description: 'Survive 10 waves on any floor.',
    icon: '🌊',
    reward: { darkCrystals: 100, soulShards: 50 },
  },
  {
    id: 'wave_25',
    name: 'Veteran Defender',
    description: 'Survive 25 waves total across all floors.',
    icon: '⚔️',
    reward: { darkCrystals: 200, soulShards: 100 },
  },
  {
    id: 'wave_50',
    name: 'Legendary Sentinel',
    description: 'Survive 50 waves total. True mastery of tower defense.',
    icon: '🏅',
    reward: { darkCrystals: 500, soulShards: 250 },
  },
  {
    id: 'first_boss_kill',
    name: 'Boss Slayer',
    description: 'Defeat a Tower Guardian boss for the first time.',
    icon: '💀',
    reward: { darkCrystals: 150, soulShards: 75 },
  },
  {
    id: 'all_floors_unlocked',
    name: 'Tower Explorer',
    description: 'Unlock all 8 floors of the Raven Tower.',
    icon: '🏰',
    reward: { darkCrystals: 300, soulShards: 150 },
  },
  {
    id: 'all_ravens_unlocked',
    name: 'Master of Ravens',
    description: 'Unlock all 10 raven types.',
    icon: '🐦‍⬛',
    reward: { darkCrystals: 400, soulShards: 200 },
  },
  {
    id: 'master_of_shadows',
    name: 'Master of Shadows',
    description: 'Kill 100 enemies using Shadow Ravens.',
    icon: '🌑',
    reward: { darkCrystals: 200, soulShards: 100 },
  },
  {
    id: 'ice_cold_killer',
    name: 'Ice Cold Killer',
    description: 'Freeze 50 enemies using Ice Raven abilities.',
    icon: '🧊',
    reward: { darkCrystals: 200, soulShards: 100 },
  },
  {
    id: 'fire_storm_master',
    name: 'Firestorm Master',
    description: 'Deal 5000 total damage with Fire Ravens.',
    icon: '🔥',
    reward: { darkCrystals: 250, soulShards: 125 },
  },
  {
    id: 'dark_healer',
    name: 'Dark Healer',
    description: 'Heal ravens for 2000 total HP using Soul Drain or Dark Heal.',
    icon: '💚',
    reward: { darkCrystals: 200, soulShards: 100 },
  },
  {
    id: 'trap_lord',
    name: 'Trap Lord',
    description: 'Deploy 50 traps across all floors.',
    icon: '🕸️',
    reward: { darkCrystals: 300, soulShards: 150 },
  },
  {
    id: 'wall_of_steel',
    name: 'Wall of Steel',
    description: 'Upgrade to an Obsidian Wall or higher.',
    icon: '🧱',
    reward: { darkCrystals: 250, soulShards: 125 },
  },
  {
    id: 'keeper_level_30',
    name: 'Veteran Keeper',
    description: 'Reach Tower Keeper level 30.',
    icon: '⭐',
    reward: { darkCrystals: 400, soulShards: 200 },
  },
  {
    id: 'daily_assault_victor',
    name: 'Assault Victor',
    description: 'Complete a daily dark assault challenge.',
    icon: '🏆',
    reward: { darkCrystals: 500, soulShards: 300 },
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 9: LOOKUP MAPS
// ═══════════════════════════════════════════════════════════════════════════

const rvRavenMap: Readonly<Record<RavenType, RavenDef>> = RV_RAVEN_DEFS.reduce(
  (acc, r) => ({ ...acc, [r.id]: r }),
  {} as Record<RavenType, RavenDef>
);

const rvFloorMap: Readonly<Record<FloorId, FloorDef>> = RV_FLOOR_DEFS.reduce(
  (acc, f) => ({ ...acc, [f.id]: f }),
  {} as Record<FloorId, FloorDef>
);

const rvTrapMap: Readonly<Record<TrapType, TrapDef>> = RV_TRAP_DEFS.reduce(
  (acc, t) => ({ ...acc, [t.id]: t }),
  {} as Record<TrapType, TrapDef>
);

const rvWallMap: Readonly<Record<WallType, WallDef>> = RV_WALL_DEFS.reduce(
  (acc, w) => ({ ...acc, [w.id]: w }),
  {} as Record<WallType, WallDef>
);

const rvSpellMap: Readonly<Record<SpellId, SpellDef>> = RV_SPELL_DEFS.reduce(
  (acc, s) => ({ ...acc, [s.id]: s }),
  {} as Record<SpellId, SpellDef>
);

const rvMonsterMap: Readonly<Record<MonsterType, MonsterDef>> = RV_MONSTER_DEFS.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<MonsterType, MonsterDef>
);

const rvAchievementMap: Readonly<Record<AchievementId, AchievementDef>> = RV_ACHIEVEMENT_DEFS.reduce(
  (acc, a) => ({ ...acc, [a.id]: a }),
  {} as Record<AchievementId, AchievementDef>
);

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 10: XP & LEVELING CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const RV_BASE_XP = 100;
const RV_XP_GROWTH = 1.18;
const RV_MAX_LEVEL = 45;
const RV_MANA_PER_LEVEL = 5;
const RV_MANA_BASE = 30;
const RV_FLOOR_UPGRADE_XP = 50;
const RV_KILL_XP = 10;
const RV_BOSS_KILL_XP = 50;
const RV_WAVE_COMPLETE_XP = 25;
const RV_DAILY_ASSAULT_BONUS_XP = 100;
const RV_ASSAULT_TOTAL_WAVES = 10;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 11: PURE HELPER FUNCTIONS (all rv prefix)
// ═══════════════════════════════════════════════════════════════════════════

export function rvXpForLevel(level: number): number {
  return Math.floor(RV_BASE_XP * Math.pow(RV_XP_GROWTH, level - 1));
}

export function rvMaxManaForLevel(level: number): number {
  return RV_MANA_BASE + level * RV_MANA_PER_LEVEL;
}

export function rvGetRavenDef(type: RavenType): RavenDef {
  return rvRavenMap[type];
}

export function rvGetFloorDef(id: FloorId): FloorDef {
  return rvFloorMap[id];
}

export function rvGetTrapDef(id: TrapType): TrapDef {
  return rvTrapMap[id];
}

export function rvGetWallDef(id: WallType): WallDef {
  return rvWallMap[id];
}

export function rvGetSpellDef(id: SpellId): SpellDef {
  return rvSpellMap[id];
}

export function rvGetMonsterDef(id: MonsterType): MonsterDef {
  return rvMonsterMap[id];
}

export function rvGetAchievementDef(id: AchievementId): AchievementDef {
  return rvAchievementMap[id];
}

export function rvIsBossWave(waveNumber: number): boolean {
  return waveNumber > 0 && waveNumber % 5 === 0;
}

export function rvScaledMonsterHp(baseHp: number, waveNumber: number, floorLevel: number): number {
  const waveScale = 1 + (waveNumber - 1) * 0.12;
  const floorScale = 1 + floorLevel * 0.08;
  return Math.floor(baseHp * waveScale * floorScale);
}

export function rvScaledMonsterDamage(baseDamage: number, waveNumber: number): number {
  const waveScale = 1 + (waveNumber - 1) * 0.08;
  return Math.floor(baseDamage * waveScale);
}

export function rvRavenDamage(raven: RavenDef, ravenLevel: number): number {
  const levelBonus = 1 + (ravenLevel - 1) * 0.15;
  return Math.floor(raven.baseDamage * levelBonus);
}

export function rvRavenMaxHp(raven: RavenDef, ravenLevel: number): number {
  const levelBonus = 1 + (ravenLevel - 1) * 0.12;
  return Math.floor(raven.baseHealth * levelBonus);
}

export function rvRavenManaCost(raven: RavenDef, ravenLevel: number): number {
  return Math.max(5, Math.floor(raven.baseDamage * 0.5 * (1 + ravenLevel * 0.1)));
}

export function rvSpellDamage(spell: SpellDef, keeperLevel: number): number {
  if (spell.damage === 0) return 0;
  const levelBonus = 1 + (keeperLevel - 1) * 0.05;
  return Math.floor(spell.damage * levelBonus);
}

export function rvTrapTotalDamage(trap: TrapDef, floorLevel: number): number {
  const ticks = Math.ceil(trap.duration);
  const scaledDamage = trap.damage * (1 + floorLevel * 0.05);
  return Math.floor(scaledDamage * ticks);
}

export function rvWallEffectiveHp(wall: WallDef, floorLevel: number): number {
  return Math.floor(wall.hp * (1 + floorLevel * 0.1));
}

export function rvMonsterRewards(monster: MonsterDef, waveNumber: number): { darkCrystals: number; soulShards: number } {
  const waveMultiplier = 1 + (waveNumber - 1) * 0.05;
  const bossMultiplier = monster.isBoss ? 3 : 1;
  return {
    darkCrystals: Math.floor(monster.darkCrystalDrop * waveMultiplier * bossMultiplier),
    soulShards: Math.floor(monster.soulShardDrop * waveMultiplier * bossMultiplier),
  };
}

export function rvWaveEnemyCount(floorDef: FloorDef, waveNumber: number): number {
  const base = floorDef.enemiesPerWave;
  const waveBonus = Math.floor((waveNumber - 1) / 3);
  const bossBonus = rvIsBossWave(waveNumber) ? -2 : 0;
  return Math.max(1, base + waveBonus + bossBonus);
}

export function rvFloorUpgradeCost(floorLevel: number): number {
  return Math.floor(100 * Math.pow(1.5, floorLevel - 1));
}

export function rvRavenLevelUpCost(ravenLevel: number): number {
  return Math.floor(50 * Math.pow(1.6, ravenLevel - 1));
}

export function rvWallUpgradeCost(currentWall: WallType): number {
  const wallOrder: readonly WallType[] = ['stone', 'iron', 'obsidian', 'void_barrier'];
  const currentIndex = wallOrder.indexOf(currentWall);
  if (currentIndex >= wallOrder.length - 1) return Infinity;
  return rvWallMap[wallOrder[currentIndex + 1]].cost;
}

export function rvNextWallType(currentWall: WallType): WallType | null {
  const wallOrder: readonly WallType[] = ['stone', 'iron', 'obsidian', 'void_barrier'];
  const currentIndex = wallOrder.indexOf(currentWall);
  if (currentIndex >= wallOrder.length - 1) return null;
  return wallOrder[currentIndex + 1];
}

export function rvCanUpgradeFloor(state: RavenTowerState): boolean {
  const floor = rvFloorMap[state.currentFloor];
  const currentLevel = state.floorLevels[state.currentFloor];
  return currentLevel < 10;
}

export function rvAvailableRavens(keeperLevel: number): readonly RavenType[] {
  return RV_RAVEN_DEFS.filter(r => r.unlockLevel <= keeperLevel).map(r => r.id);
}

export function rvAvailableSpells(keeperLevel: number): readonly SpellId[] {
  return RV_SPELL_DEFS.filter(s => s.unlockLevel <= keeperLevel).map(s => s.id);
}

export function rvAvailableTraps(keeperLevel: number): readonly TrapType[] {
  return RV_TRAP_DEFS.filter(t => t.unlockLevel <= keeperLevel).map(t => t.id);
}

export function rvAvailableWalls(keeperLevel: number): readonly WallType[] {
  return RV_WALL_DEFS.filter(w => w.unlockLevel <= keeperLevel).map(w => w.id);
}

export function rvAvailableFloors(keeperLevel: number): readonly FloorId[] {
  return RV_FLOOR_DEFS.filter(f => f.unlockLevel <= keeperLevel).map(f => f.id);
}

export function rvCheckAchievement(state: RavenTowerState, id: AchievementId): boolean {
  return state.achievements.includes(id);
}

export function rvGetKeeperTitle(keeperLevel: number): string {
  if (keeperLevel >= 42) return 'Tower Deity';
  if (keeperLevel >= 35) return 'Abyss Lord';
  if (keeperLevel >= 28) return 'Soul Archon';
  if (keeperLevel >= 22) return 'Tower Keeper';
  if (keeperLevel >= 15) return 'Curse Weaver';
  if (keeperLevel >= 10) return 'Dark Flockmaster';
  if (keeperLevel >= 5) return 'Shadow Apprentice';
  return 'Raven Fledgling';
}

export function rvDailyAssaultMultiplier(wavesCompleted: number): number {
  return 1 + wavesCompleted * 0.15;
}

export function rvDailyAssaultReward(wavesCompleted: number, monsterCount: number): { darkCrystals: number; soulShards: number } {
  const base = wavesCompleted * 20;
  const multiplier = rvDailyAssaultMultiplier(wavesCompleted);
  return {
    darkCrystals: Math.floor(base * multiplier * 1.5),
    soulShards: Math.floor(base * multiplier),
  };
}

export function rvTotalAchievementRewards(achievements: readonly AchievementId[]): { darkCrystals: number; soulShards: number } {
  let darkCrystals = 0;
  let soulShards = 0;
  for (const id of achievements) {
    const def = rvAchievementMap[id];
    darkCrystals += def.reward.darkCrystals;
    soulShards += def.reward.soulShards;
  }
  return { darkCrystals, soulShards };
}

export function rvDefensePower(ravens: readonly DeployedRaven[], traps: readonly DeployedTrap[]): number {
  let ravenPower = 0;
  for (const r of ravens) {
    const def = rvRavenMap[r.ravenType];
    ravenPower += rvRavenDamage(def, r.level) * (1 + r.level * 0.1);
  }
  let trapPower = 0;
  for (const t of traps) {
    const def = rvTrapMap[t.trapType];
    trapPower += rvTrapTotalDamage(def, 5) * (t.charges / 3);
  }
  return Math.floor(ravenPower + trapPower);
}

export function rvThreatLevel(waveNumber: number, floorLevel: number): number {
  const base = waveNumber * 2;
  const floorMod = floorLevel * 3;
  const bossMod = rvIsBossWave(waveNumber) ? 15 : 0;
  return Math.min(100, Math.floor(base + floorMod + bossMod));
}

export function rvEffectiveShield(state: RavenTowerState): number {
  return state.shieldAmount;
}

export function rvWallHealthPercent(state: RavenTowerState): number {
  if (state.wallMaxHp <= 0) return 0;
  return Math.floor((state.wallHp / state.wallMaxHp) * 100);
}

export function rvManaPercent(state: RavenTowerState): number {
  if (state.maxMana <= 0) return 0;
  return Math.floor((state.mana / state.maxMana) * 100);
}

export function rvXpPercent(state: RavenTowerState): number {
  if (state.xpToNextLevel <= 0) return 100;
  return Math.floor((state.keeperXp / state.xpToNextLevel) * 100);
}

export function rvRavenSurvivalPercent(ravens: readonly DeployedRaven[]): number {
  if (ravens.length === 0) return 100;
  const alive = ravens.filter(r => r.currentHp > 0).length;
  return Math.floor((alive / ravens.length) * 100);
}

export function rvKillEfficiency(totalKills: number, wavesCompleted: number): number {
  if (wavesCompleted <= 0) return 0;
  return Math.floor(totalKills / wavesCompleted * 10) / 10;
}

export function rvBossesDefeatedPerHour(bossKills: number, _hoursPlayed: number): number {
  if (_hoursPlayed <= 0) return 0;
  return Math.floor(bossKills / _hoursPlayed * 10) / 10;
}

export function rvResourceScore(state: RavenTowerState): number {
  return state.darkCrystals * 2 + state.soulShards * 5;
}

export function rvOverallPowerScore(state: RavenTowerState): number {
  const ravenScore = state.unlockedRavens.length * 100;
  const spellScore = state.unlockedSpells.length * 80;
  const trapScore = state.unlockedTraps.length * 50;
  const floorScore = state.unlockedFloors.length * 60;
  const achievementScore = state.achievements.length * 120;
  const levelScore = state.keeperLevel * 30;
  const killScore = state.totalKills * 2;
  const bossScore = state.bossKills * 50;
  return ravenScore + spellScore + trapScore + floorScore + achievementScore + levelScore + killScore + bossScore;
}

export function rvRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return '#a0a0a0';
    case 'uncommon': return '#2ecc71';
    case 'rare': return '#3498db';
    case 'epic': return '#9b59b6';
    case 'legendary': return '#f1c40f';
  }
}

export function rvElementIcon(element: string): string {
  switch (element) {
    case 'Darkness': return '🌑';
    case 'Lightning': return '⚡';
    case 'Fire': return '🔥';
    case 'Ice': return '❄️';
    case 'Death': return '💀';
    case 'Blood': return '🩸';
    case 'Void': return '🌀';
    case 'Bone': return '🦴';
    case 'Curse': return '🔮';
    case 'Soul': return '👻';
    default: return '🐦‍⬛';
  }
}

export function rvFloorIcon(floorId: FloorId): string {
  switch (floorId) {
    case 'dungeon': return '🏚️';
    case 'catacombs': return '⚰️';
    case 'blood_cellar': return '🩸';
    case 'soul_gallery': return '🖼️';
    case 'curse_vault': return '📜';
    case 'necropolis': return '☠️';
    case 'alchemy_spire': return '⚗️';
    case 'observatory': return '🔭';
  }
}

export function rvMonsterHpBar(current: number, max: number): string {
  if (max <= 0) return '[██████████] 100%';
  const pct = Math.max(0, Math.min(100, Math.floor((current / max) * 100)));
  const filled = Math.floor(pct / 10);
  const empty = 10 - filled;
  return `[${'█'.repeat(filled)}${'░'.repeat(empty)}] ${pct}%`;
}

export function rvCooldownDisplay(current: number, max: number): string {
  if (max <= 0 || current <= 0) return 'READY';
  return `${current}s`;
}

export function rvFormatResources(darkCrystals: number, soulShards: number): string {
  return `💎 ${darkCrystals}  🔮 ${soulShards}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 12: STATE REDUCER FUNCTIONS (pure, rv prefix)
// ═══════════════════════════════════════════════════════════════════════════

export function rvInitialState(): RavenTowerState {
  return {
    darkCrystals: 200,
    soulShards: 100,
    mana: RV_MANA_BASE,
    maxMana: RV_MANA_BASE,
    keeperLevel: 1,
    keeperXp: 0,
    xpToNextLevel: rvXpForLevel(2),
    currentFloor: 'dungeon',
    floorLevels: {
      dungeon: 1,
      catacombs: 0,
      blood_cellar: 0,
      soul_gallery: 0,
      curse_vault: 0,
      necropolis: 0,
      alchemy_spire: 0,
      observatory: 0,
    },
    unlockedRavens: ['shadow', 'storm'] as const,
    unlockedSpells: ['shadow_veil'] as const,
    unlockedFloors: ['dungeon'] as const,
    unlockedTraps: ['shadow_snare'] as const,
    unlockedWalls: ['stone'] as const,
    achievements: [] as const,
    deployedRavens: [],
    deployedTraps: [],
    currentWave: {
      waveNumber: 0,
      enemiesRemaining: 0,
      isBossWave: false,
      currentFloor: 'dungeon',
      isComplete: true,
    },
    totalKills: 0,
    totalWavesCompleted: 0,
    bossKills: 0,
    highestWave: 0,
    dailyAssault: {
      date: '',
      isActive: false,
      wavesCompleted: 0,
      totalWaves: RV_ASSAULT_TOTAL_WAVES,
      bonusMultiplier: 1,
      isComplete: false,
      darkCrystalsEarned: 0,
      soulShardsEarned: 0,
    },
    wallType: 'stone',
    wallHp: rvWallMap['stone'].hp,
    wallMaxHp: rvWallMap['stone'].hp,
    shieldAmount: 0,
  };
}

export function rvAddXp(state: RavenTowerState, amount: number): RavenTowerState {
  let newLevel = state.keeperLevel;
  let newXp = state.keeperXp + amount;
  let newXpToNext = state.xpToNextLevel;
  let newMana = state.mana;
  let newMaxMana = state.maxMana;

  while (newXp >= newXpToNext && newLevel < RV_MAX_LEVEL) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = rvXpForLevel(newLevel + 1);
    newMaxMana = rvMaxManaForLevel(newLevel);
    newMana = newMaxMana;
  }

  if (newLevel >= RV_MAX_LEVEL) {
    newXp = 0;
    newXpToNext = 1;
  }

  const newUnlockedRavens = [...state.unlockedRavens];
  for (const raven of RV_RAVEN_DEFS) {
    if (raven.unlockLevel <= newLevel && !newUnlockedRavens.includes(raven.id)) {
      newUnlockedRavens.push(raven.id);
    }
  }

  const newUnlockedSpells = [...state.unlockedSpells];
  for (const spell of RV_SPELL_DEFS) {
    if (spell.unlockLevel <= newLevel && !newUnlockedSpells.includes(spell.id)) {
      newUnlockedSpells.push(spell.id);
    }
  }

  const newUnlockedTraps = [...state.unlockedTraps];
  for (const trap of RV_TRAP_DEFS) {
    if (trap.unlockLevel <= newLevel && !newUnlockedTraps.includes(trap.id)) {
      newUnlockedTraps.push(trap.id);
    }
  }

  const newUnlockedWalls = [...state.unlockedWalls];
  for (const wall of RV_WALL_DEFS) {
    if (wall.unlockLevel <= newLevel && !newUnlockedWalls.includes(wall.id)) {
      newUnlockedWalls.push(wall.id);
    }
  }

  const newUnlockedFloors = [...state.unlockedFloors];
  for (const floor of RV_FLOOR_DEFS) {
    if (floor.unlockLevel <= newLevel && !newUnlockedFloors.includes(floor.id)) {
      newUnlockedFloors.push(floor.id);
    }
  }

  return {
    ...state,
    keeperLevel: newLevel,
    keeperXp: newXp,
    xpToNextLevel: newXpToNext,
    mana: newMana,
    maxMana: newMaxMana,
    unlockedRavens: newUnlockedRavens,
    unlockedSpells: newUnlockedSpells,
    unlockedTraps: newUnlockedTraps,
    unlockedWalls: newUnlockedWalls,
    unlockedFloors: newUnlockedFloors,
  };
}

export function rvAddResources(
  state: RavenTowerState,
  darkCrystals: number,
  soulShards: number
): RavenTowerState {
  return {
    ...state,
    darkCrystals: state.darkCrystals + darkCrystals,
    soulShards: state.soulShards + soulShards,
  };
}

export function rvSpendResources(
  state: RavenTowerState,
  darkCrystals: number,
  soulShards: number
): RavenTowerState | null {
  if (state.darkCrystals < darkCrystals || state.soulShards < soulShards) return null;
  return {
    ...state,
    darkCrystals: state.darkCrystals - darkCrystals,
    soulShards: state.soulShards - soulShards,
  };
}

export function rvSpendMana(state: RavenTowerState, amount: number): RavenTowerState | null {
  if (state.mana < amount) return null;
  return { ...state, mana: state.mana - amount };
}

export function rvRegenMana(state: RavenTowerState, amount: number): RavenTowerState {
  return { ...state, mana: Math.min(state.maxMana, state.mana + amount) };
}

export function rvAscendFloor(state: RavenTowerState, floorId: FloorId): RavenTowerState | null {
  if (!state.unlockedFloors.includes(floorId)) return null;
  const wallDef = rvWallMap[state.wallType];
  const floorDef = rvFloorMap[floorId];
  const floorLevel = state.floorLevels[floorId];
  return {
    ...state,
    currentFloor: floorId,
    deployedRavens: [],
    deployedTraps: [],
    currentWave: {
      waveNumber: 0,
      enemiesRemaining: 0,
      isBossWave: false,
      currentFloor: floorId,
      isComplete: true,
    },
    wallHp: rvWallEffectiveHp(wallDef, floorLevel),
    wallMaxHp: rvWallEffectiveHp(wallDef, floorLevel),
    shieldAmount: 0,
    mana: state.maxMana,
  };
}

export function rvUpgradeFloor(state: RavenTowerState): RavenTowerState | null {
  const floorId = state.currentFloor;
  const currentLevel = state.floorLevels[floorId];
  if (currentLevel >= 10) return null;
  const cost = rvFloorUpgradeCost(currentLevel);
  const result = rvSpendResources(state, cost, 0);
  if (!result) return null;
  const newFloorLevels = { ...result.floorLevels, [floorId]: currentLevel + 1 };
  return rvAddXp({ ...result, floorLevels: newFloorLevels }, RV_FLOOR_UPGRADE_XP);
}

export function rvUnlockRaven(state: RavenTowerState, type: RavenType): RavenTowerState | null {
  if (state.unlockedRavens.includes(type)) return null;
  const def = rvRavenMap[type];
  if (state.keeperLevel < def.unlockLevel) return null;
  const cost = Math.floor(100 * (1 + RV_RAVEN_DEFS.filter(r => state.unlockedRavens.includes(r.id)).length * 0.3));
  const result = rvSpendResources(state, cost, 0);
  if (!result) return null;
  return { ...result, unlockedRavens: [...result.unlockedRavens, type] };
}

export function rvDeployRaven(state: RavenTowerState, ravenType: RavenType): RavenTowerState | null {
  if (!state.unlockedRavens.includes(ravenType)) return null;
  if (state.currentWave.isComplete && state.currentWave.waveNumber === 0) {
    const def = rvRavenMap[ravenType];
    const ravenLevel = Math.min(10, Math.floor(state.keeperLevel / 5) + 1);
    const maxHp = rvRavenMaxHp(def, ravenLevel);
    const deployed: DeployedRaven = {
      instanceId: `${ravenType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      ravenType,
      level: ravenLevel,
      currentHp: maxHp,
      maxHp,
      currentCooldown: 0,
      kills: 0,
    };
    if (state.deployedRavens.length >= 6) return null;
    return { ...state, deployedRavens: [...state.deployedRavens, deployed] };
  }
  return null;
}

export function rvRecallRaven(state: RavenTowerState, instanceId: string): RavenTowerState {
  return {
    ...state,
    deployedRavens: state.deployedRavens.filter(r => r.instanceId !== instanceId),
  };
}

export function rvDeployTrap(state: RavenTowerState, trapType: TrapType, position: number): RavenTowerState | null {
  if (!state.unlockedTraps.includes(trapType)) return null;
  const def = rvTrapMap[trapType];
  const result = rvSpendResources(state, def.cost, 0);
  if (!result) return null;
  if (result.deployedTraps.length >= 8) return null;
  const deployed: DeployedTrap = {
    instanceId: `${trapType}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    trapType,
    remainingDuration: def.duration,
    charges: 3,
    position,
  };
  return { ...result, deployedTraps: [...result.deployedTraps, deployed] };
}

export function rvCastSpell(state: RavenTowerState, spellId: SpellId): RavenTowerState | null {
  if (!state.unlockedSpells.includes(spellId)) return null;
  const def = rvSpellMap[spellId];
  const manaResult = rvSpendMana(state, def.manaCost);
  if (!manaResult) return null;
  const isHeal = spellId === 'dark_heal';
  let newRavens = manaResult.deployedRavens;
  if (isHeal) {
    newRavens = newRavens.map(r => ({
      ...r,
      currentHp: r.maxHp,
    }));
  }
  const shieldGain = spellId === 'dark_heal' ? 50 : 0;
  return {
    ...manaResult,
    deployedRavens: newRavens,
    shieldAmount: manaResult.shieldAmount + shieldGain,
  };
}

export function rvStartWave(state: RavenTowerState): RavenTowerState {
  const floorDef = rvFloorMap[state.currentFloor];
  const newWaveNum = state.currentWave.waveNumber + 1;
  const isBoss = rvIsBossWave(newWaveNum);
  const enemyCount = rvWaveEnemyCount(floorDef, newWaveNum);
  return {
    ...state,
    currentWave: {
      waveNumber: newWaveNum,
      enemiesRemaining: enemyCount,
      isBossWave: isBoss,
      currentFloor: state.currentFloor,
      isComplete: false,
    },
  };
}

export function rvEnemyKilled(state: RavenTowerState, monsterType: MonsterType): RavenTowerState {
  const monsterDef = rvMonsterMap[monsterType];
  const rewards = rvMonsterRewards(monsterDef, state.currentWave.waveNumber);
  const isBoss = monsterDef.isBoss;
  const newXp = isBoss ? RV_BOSS_KILL_XP : RV_KILL_XP;
  const newEnemiesRemaining = Math.max(0, state.currentWave.enemiesRemaining - 1);
  const waveComplete = newEnemiesRemaining === 0;

  const newState: RavenTowerState = {
    ...state,
    totalKills: state.totalKills + 1,
    bossKills: state.bossKills + (isBoss ? 1 : 0),
    currentWave: {
      ...state.currentWave,
      enemiesRemaining: newEnemiesRemaining,
      isComplete: waveComplete,
    },
  };

  const withResources = rvAddResources(newState, rewards.darkCrystals, rewards.soulShards);
  const withXp = rvAddXp(withResources, newXp);
  let final = withXp;

  if (waveComplete) {
    const newHighest = Math.max(state.highestWave, state.currentWave.waveNumber);
    final = rvAddXp(
      { ...final, totalWavesCompleted: final.totalWavesCompleted + 1, highestWave: newHighest },
      RV_WAVE_COMPLETE_XP
    );
  }

  return rvCheckAndGrantAchievements(final);
}

export function rvDamageWall(state: RavenTowerState, damage: number): RavenTowerState {
  let remainingDamage = damage;

  if (state.shieldAmount > 0) {
    const absorbed = Math.min(state.shieldAmount, remainingDamage);
    remainingDamage -= absorbed;
  }

  const newShield = Math.max(0, state.shieldAmount - damage);
  const newWallHp = Math.max(0, state.wallHp - remainingDamage);
  const manaRegen = Math.floor(damage * 0.1);

  return {
    ...state,
    wallHp: newWallHp,
    shieldAmount: newShield,
    mana: Math.min(state.maxMana, state.mana + manaRegen),
  };
}

export function rvHealWall(state: RavenTowerState, amount: number): RavenTowerState {
  const cost = Math.floor(amount * 0.5);
  const result = rvSpendResources(state, cost, 0);
  if (!result) return state;
  return {
    ...result,
    wallHp: Math.min(result.wallMaxHp, result.wallHp + amount),
  };
}

export function rvUpgradeWall(state: RavenTowerState): RavenTowerState | null {
  const nextWall = rvNextWallType(state.wallType);
  if (!nextWall) return null;
  if (!state.unlockedWalls.includes(nextWall)) return null;
  const cost = rvWallMap[nextWall].cost;
  const result = rvSpendResources(state, cost, 0);
  if (!result) return null;
  const newWallDef = rvWallMap[nextWall];
  const floorLevel = state.floorLevels[state.currentFloor];
  const newMaxHp = rvWallEffectiveHp(newWallDef, floorLevel);
  return {
    ...result,
    wallType: nextWall,
    wallHp: newMaxHp,
    wallMaxHp: newMaxHp,
  };
}

export function rvAddShield(state: RavenTowerState, amount: number): RavenTowerState {
  return { ...state, shieldAmount: state.shieldAmount + amount };
}

export function rvStartDailyAssault(state: RavenTowerState, date: string): RavenTowerState {
  return {
    ...state,
    dailyAssault: {
      date,
      isActive: true,
      wavesCompleted: 0,
      totalWaves: RV_ASSAULT_TOTAL_WAVES,
      bonusMultiplier: 1,
      isComplete: false,
      darkCrystalsEarned: 0,
      soulShardsEarned: 0,
    },
    currentWave: {
      waveNumber: 0,
      enemiesRemaining: 0,
      isBossWave: false,
      currentFloor: state.currentFloor,
      isComplete: true,
    },
    deployedRavens: [],
    deployedTraps: [],
    mana: state.maxMana,
  };
}

export function rvCompleteAssaultWave(state: RavenTowerState): RavenTowerState {
  const assault = state.dailyAssault;
  if (!assault.isActive) return state;

  const newWavesCompleted = assault.wavesCompleted + 1;
  const reward = rvDailyAssaultReward(newWavesCompleted, 8);
  const newMultiplier = rvDailyAssaultMultiplier(newWavesCompleted);
  const isComplete = newWavesCompleted >= assault.totalWaves;

  const newState: RavenTowerState = {
    ...state,
    dailyAssault: {
      ...assault,
      wavesCompleted: newWavesCompleted,
      bonusMultiplier: newMultiplier,
      isComplete,
      darkCrystalsEarned: assault.darkCrystalsEarned + reward.darkCrystals,
      soulShardsEarned: assault.soulShardsEarned + reward.soulShards,
      isActive: !isComplete,
    },
  };

  const withResources = rvAddResources(newState, reward.darkCrystals, reward.soulShards);
  const withXp = rvAddXp(withResources, RV_DAILY_ASSAULT_BONUS_XP);

  if (isComplete) {
    return rvCheckAndGrantAchievements(withXp);
  }

  return withXp;
}

export function rvClaimAchievement(state: RavenTowerState, id: AchievementId): RavenTowerState | null {
  if (state.achievements.includes(id)) return null;
  const def = rvAchievementMap[id];
  const withResources = rvAddResources(state, def.reward.darkCrystals, def.reward.soulShards);
  return {
    ...withResources,
    achievements: [...withResources.achievements, id],
  };
}

export function rvCheckAndGrantAchievements(state: RavenTowerState): RavenTowerState {
  const pending: AchievementId[] = [];

  if (state.totalKills >= 1 && !state.achievements.includes('first_blood')) {
    pending.push('first_blood');
  }
  if (state.totalWavesCompleted >= 10 && !state.achievements.includes('wave_10')) {
    pending.push('wave_10');
  }
  if (state.totalWavesCompleted >= 25 && !state.achievements.includes('wave_25')) {
    pending.push('wave_25');
  }
  if (state.totalWavesCompleted >= 50 && !state.achievements.includes('wave_50')) {
    pending.push('wave_50');
  }
  if (state.bossKills >= 1 && !state.achievements.includes('first_boss_kill')) {
    pending.push('first_boss_kill');
  }
  if (state.unlockedFloors.length >= 8 && !state.achievements.includes('all_floors_unlocked')) {
    pending.push('all_floors_unlocked');
  }
  if (state.unlockedRavens.length >= 10 && !state.achievements.includes('all_ravens_unlocked')) {
    pending.push('all_ravens_unlocked');
  }
  if (state.keeperLevel >= 30 && !state.achievements.includes('keeper_level_30')) {
    pending.push('keeper_level_30');
  }
  if (state.dailyAssault.isComplete && !state.achievements.includes('daily_assault_victor')) {
    pending.push('daily_assault_victor');
  }

  const shadowRaven = state.deployedRavens.find(r => r.ravenType === 'shadow');
  if (shadowRaven && shadowRaven.kills >= 100 && !state.achievements.includes('master_of_shadows')) {
    pending.push('master_of_shadows');
  }

  if (state.unlockedWalls.includes('obsidian') && !state.achievements.includes('wall_of_steel')) {
    pending.push('wall_of_steel');
  }

  if (state.deployedTraps.length >= 50 && !state.achievements.includes('trap_lord')) {
    pending.push('trap_lord');
  }

  let result = state;
  for (const id of pending) {
    const claimed = rvClaimAchievement(result, id);
    if (claimed) result = claimed;
  }

  return result;
}

export function rvResetFloor(state: RavenTowerState): RavenTowerState {
  const wallDef = rvWallMap[state.wallType];
  const floorLevel = state.floorLevels[state.currentFloor];
  const newMaxHp = rvWallEffectiveHp(wallDef, floorLevel);
  return {
    ...state,
    deployedRavens: [],
    deployedTraps: [],
    currentWave: {
      waveNumber: 0,
      enemiesRemaining: 0,
      isBossWave: false,
      currentFloor: state.currentFloor,
      isComplete: true,
    },
    wallHp: newMaxHp,
    wallMaxHp: newMaxHp,
    shieldAmount: 0,
    mana: state.maxMana,
  };
}

export function rvLevelUpRaven(state: RavenTowerState, instanceId: string): RavenTowerState | null {
  const raven = state.deployedRavens.find(r => r.instanceId === instanceId);
  if (!raven) return null;
  if (raven.level >= 10) return null;
  const cost = rvRavenLevelUpCost(raven.level);
  const result = rvSpendResources(state, cost, 0);
  if (!result) return null;
  const def = rvRavenMap[raven.ravenType];
  const newLevel = raven.level + 1;
  const newMaxHp = rvRavenMaxHp(def, newLevel);
  return {
    ...result,
    deployedRavens: result.deployedRavens.map(r =>
      r.instanceId === instanceId
        ? { ...r, level: newLevel, maxHp: newMaxHp, currentHp: newMaxHp }
        : r
    ),
  };
}

export function rvHealRaven(state: RavenTowerState, instanceId: string, amount: number): RavenTowerState {
  return {
    ...state,
    deployedRavens: state.deployedRavens.map(r =>
      r.instanceId === instanceId
        ? { ...r, currentHp: Math.min(r.maxHp, r.currentHp + amount) }
        : r
    ),
  };
}

export function rvHealAllRavens(state: RavenTowerState, amount: number): RavenTowerState {
  return {
    ...state,
    deployedRavens: state.deployedRavens.map(r => ({
      ...r,
      currentHp: Math.min(r.maxHp, r.currentHp + amount),
    })),
  };
}

export function rvDamageRaven(state: RavenTowerState, instanceId: string, damage: number): RavenTowerState {
  const raven = state.deployedRavens.find(r => r.instanceId === instanceId);
  if (!raven) return state;
  let remaining = damage;
  if (state.shieldAmount > 0) {
    const absorbed = Math.min(state.shieldAmount, remaining);
    remaining -= absorbed;
  }
  return {
    ...state,
    shieldAmount: Math.max(0, state.shieldAmount - damage),
    deployedRavens: state.deployedRavens.map(r =>
      r.instanceId === instanceId
        ? { ...r, currentHp: Math.max(0, r.currentHp - remaining) }
        : r
    ),
  };
}

export function rvRemoveDeadRavens(state: RavenTowerState): RavenTowerState {
  return {
    ...state,
    deployedRavens: state.deployedRavens.filter(r => r.currentHp > 0),
  };
}

export function rvTickTraps(state: RavenTowerState): RavenTowerState {
  return {
    ...state,
    deployedTraps: state.deployedTraps
      .map(t => ({
        ...t,
        remainingDuration: t.remainingDuration - 1,
      }))
      .filter(t => t.remainingDuration > 0 && t.charges > 0),
  };
}

export function rvConsumeTrapCharge(state: RavenTowerState, instanceId: string): RavenTowerState {
  return {
    ...state,
    deployedTraps: state.deployedTraps.map(t =>
      t.instanceId === instanceId
        ? { ...t, charges: t.charges - 1 }
        : t
    ).filter(t => t.charges > 0),
  };
}

export function rvTickCooldowns(state: RavenTowerState): RavenTowerState {
  return {
    ...state,
    deployedRavens: state.deployedRavens.map(r => ({
      ...r,
      currentCooldown: Math.max(0, r.currentCooldown - 1),
    })),
  };
}

export function rvResetTower(state: RavenTowerState): RavenTowerState {
  const fresh = rvInitialState();
  return { ...fresh, darkCrystals: state.darkCrystals, soulShards: state.soulShards };
}

export function rvGrantCheatResources(state: RavenTowerState, amount: number): RavenTowerState {
  return rvAddResources(state, amount, Math.floor(amount * 0.5));
}

export function rvSetKeeperLevel(state: RavenTowerState, level: number): RavenTowerState {
  if (level < 1 || level > RV_MAX_LEVEL) return state;
  const target = rvInitialState();
  let current = target;
  const levelDiff = level - 1;
  if (levelDiff > 0) {
    current = rvAddXp(current, rvXpForLevel(2) * levelDiff + 99999);
  }
  return {
    ...current,
    darkCrystals: state.darkCrystals,
    soulShards: state.soulShards,
    keeperLevel: Math.min(level, RV_MAX_LEVEL),
    xpToNextLevel: level >= RV_MAX_LEVEL ? 1 : rvXpForLevel(level + 1),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 13: DERIVED / DISPLAY HELPERS (all rv prefix)
// ═══════════════════════════════════════════════════════════════════════════

export function rvGetCurrentFloor(state: RavenTowerState): FloorDef {
  return rvFloorMap[state.currentFloor];
}

export function rvGetCurrentWall(state: RavenTowerState): WallDef {
  return rvWallMap[state.wallType];
}

export function rvGetDeployedRavenDefs(state: RavenTowerState): ReadonlyArray<RavenDef & { instanceId: string; level: number; currentHp: number; maxHp: number; currentCooldown: number; kills: number }> {
  return state.deployedRavens.map(r => ({
    ...rvRavenMap[r.ravenType],
    instanceId: r.instanceId,
    level: r.level,
    currentHp: r.currentHp,
    maxHp: r.maxHp,
    currentCooldown: r.currentCooldown,
    kills: r.kills,
  }));
}

export function rvGetDeployedTrapDefs(state: RavenTowerState): ReadonlyArray<TrapDef & { instanceId: string; remainingDuration: number; charges: number; position: number }> {
  return state.deployedTraps.map(t => ({
    ...rvTrapMap[t.trapType],
    instanceId: t.instanceId,
    remainingDuration: t.remainingDuration,
    charges: t.charges,
    position: t.position,
  }));
}

export function rvGetUnlockedRavenDefs(state: RavenTowerState): readonly RavenDef[] {
  return state.unlockedRavens.map(r => rvRavenMap[r]);
}

export function rvGetUnlockedSpellDefs(state: RavenTowerState): readonly SpellDef[] {
  return state.unlockedSpells.map(s => rvSpellMap[s]);
}

export function rvGetUnlockedTrapDefs(state: RavenTowerState): readonly TrapDef[] {
  return state.unlockedTraps.map(t => rvTrapMap[t]);
}

export function rvGetUnlockedWallDefs(state: RavenTowerState): readonly WallDef[] {
  return state.unlockedWalls.map(w => rvWallMap[w]);
}

export function rvGetUnlockedFloorDefs(state: RavenTowerState): readonly FloorDef[] {
  return state.unlockedFloors.map(f => rvFloorMap[f]);
}

export function rvGetLockedRavens(state: RavenTowerState): readonly RavenDef[] {
  return RV_RAVEN_DEFS.filter(r => !state.unlockedRavens.includes(r.id));
}

export function rvGetLockedSpells(state: RavenTowerState): readonly SpellDef[] {
  return RV_SPELL_DEFS.filter(s => !state.unlockedSpells.includes(s.id));
}

export function rvGetLockedFloors(state: RavenTowerState): readonly FloorDef[] {
  return RV_FLOOR_DEFS.filter(f => !state.unlockedFloors.includes(f.id));
}

export function rvCanAffordRaven(state: RavenTowerState, type: RavenType): boolean {
  if (state.unlockedRavens.includes(type)) return false;
  const count = state.unlockedRavens.length;
  const cost = Math.floor(100 * (1 + count * 0.3));
  return state.darkCrystals >= cost;
}

export function rvCanAffordTrap(state: RavenTowerState, trapType: TrapType): boolean {
  const def = rvTrapMap[trapType];
  return state.darkCrystals >= def.cost;
}

export function rvCanAffordWallUpgrade(state: RavenTowerState): boolean {
  const nextWall = rvNextWallType(state.wallType);
  if (!nextWall) return false;
  if (!state.unlockedWalls.includes(nextWall)) return false;
  return state.darkCrystals >= rvWallMap[nextWall].cost;
}

export function rvCanAffordFloorUpgrade(state: RavenTowerState): boolean {
  const currentLevel = state.floorLevels[state.currentFloor];
  if (currentLevel >= 10) return false;
  const cost = rvFloorUpgradeCost(currentLevel);
  return state.darkCrystals >= cost;
}

export function rvCanAffordSpell(state: RavenTowerState, spellId: SpellId): boolean {
  const def = rvSpellMap[spellId];
  return state.mana >= def.manaCost;
}

export function rvCanDeployRaven(state: RavenTowerState): boolean {
  return state.deployedRavens.length < 6;
}

export function rvCanDeployTrap(state: RavenTowerState): boolean {
  return state.deployedTraps.length < 8;
}

export function rvIsFloorMaxed(state: RavenTowerState, floorId: FloorId): boolean {
  return state.floorLevels[floorId] >= 10;
}

export function rvIsWallMaxed(state: RavenTowerState): boolean {
  return state.wallType === 'void_barrier';
}

export function rvIsKeeperMaxLevel(state: RavenTowerState): boolean {
  return state.keeperLevel >= RV_MAX_LEVEL;
}

export function rvIsWaveActive(state: RavenTowerState): boolean {
  return !state.currentWave.isComplete;
}

export function rvIsDailyAssaultActive(state: RavenTowerState): boolean {
  return state.dailyAssault.isActive;
}

export function rvIsDailyAssaultComplete(state: RavenTowerState): boolean {
  return state.dailyAssault.isComplete;
}

export function rvGetDailyAssaultProgress(state: RavenTowerState): number {
  if (state.dailyAssault.totalWaves <= 0) return 0;
  return Math.floor((state.dailyAssault.wavesCompleted / state.dailyAssault.totalWaves) * 100);
}

export function rvRavenCapacityUsed(state: RavenTowerState): number {
  return state.deployedRavens.length;
}

export function rvRavenCapacityMax(): number {
  return 6;
}

export function rvTrapCapacityUsed(state: RavenTowerState): number {
  return state.deployedTraps.length;
}

export function rvTrapCapacityMax(): number {
  return 8;
}

export function rvGetSummaryStats(state: RavenTowerState): Readonly<{
  keeperTitle: string;
  keeperLevel: number;
  unlockedRavens: number;
  unlockedSpells: number;
  unlockedFloors: number;
  totalKills: number;
  bossKills: number;
  totalWavesCompleted: number;
  highestWave: number;
  achievements: number;
  powerScore: number;
  darkCrystals: number;
  soulShards: number;
}> {
  return {
    keeperTitle: rvGetKeeperTitle(state.keeperLevel),
    keeperLevel: state.keeperLevel,
    unlockedRavens: state.unlockedRavens.length,
    unlockedSpells: state.unlockedSpells.length,
    unlockedFloors: state.unlockedFloors.length,
    totalKills: state.totalKills,
    bossKills: state.bossKills,
    totalWavesCompleted: state.totalWavesCompleted,
    highestWave: state.highestWave,
    achievements: state.achievements.length,
    powerScore: rvOverallPowerScore(state),
    darkCrystals: state.darkCrystals,
    soulShards: state.soulShards,
  };
}

export function rvGetFloorSummary(state: RavenTowerState, floorId: FloorId): Readonly<{
  name: string;
  level: number;
  maxLevel: number;
  isUnlocked: boolean;
  isMaxed: boolean;
  icon: string;
  description: string;
}> {
  const def = rvFloorMap[floorId];
  const level = state.floorLevels[floorId];
  return {
    name: def.name,
    level,
    maxLevel: 10,
    isUnlocked: state.unlockedFloors.includes(floorId),
    isMaxed: level >= 10,
    icon: rvFloorIcon(floorId),
    description: def.description,
  };
}

export function rvGetWaveInfo(state: RavenTowerState): Readonly<{
  waveNumber: number;
  enemiesRemaining: number;
  isBossWave: boolean;
  isComplete: boolean;
  floor: string;
}> {
  return {
    waveNumber: state.currentWave.waveNumber,
    enemiesRemaining: state.currentWave.enemiesRemaining,
    isBossWave: state.currentWave.isBossWave,
    isComplete: state.currentWave.isComplete,
    floor: rvFloorMap[state.currentFloor].name,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 14: ADDITIONAL BATTLE & STRATEGY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

export function rvCalculateDps(state: RavenTowerState): number {
  let totalDps = 0;
  for (const r of state.deployedRavens) {
    const def = rvRavenMap[r.ravenType];
    const damage = rvRavenDamage(def, r.level);
    const attacksPerSecond = r.currentCooldown > 0 ? 0.5 : 1;
    totalDps += damage * attacksPerSecond;
  }
  for (const t of state.deployedTraps) {
    const def = rvTrapMap[t.trapType];
    totalDps += def.damage * (1 + state.floorLevels[state.currentFloor] * 0.05) * 0.3;
  }
  return Math.floor(totalDps);
}

export function rvCalculateTankiness(state: RavenTowerState): number {
  let totalHp = state.wallHp;
  totalHp += state.shieldAmount;
  for (const r of state.deployedRavens) {
    totalHp += r.currentHp;
  }
  return totalHp;
}

export function rvWaveDifficultyRating(waveNumber: number, floorLevel: number, isBoss: boolean): string {
  const raw = waveNumber * 2 + floorLevel * 3 + (isBoss ? 20 : 0);
  if (raw >= 80) return 'NIGHTMARE';
  if (raw >= 60) return 'HORRIFYING';
  if (raw >= 40) return 'DANGEROUS';
  if (raw >= 25) return 'CHALLENGING';
  if (raw >= 12) return 'MODERATE';
  return 'EASY';
}

export function rvOptimalRavenForMonster(monsterType: MonsterType): RavenType {
  const def = rvMonsterMap[monsterType];
  if (def.speed >= 12) return 'ice';
  if (def.armor >= 10) return 'hex';
  if (def.baseHp >= 200) return 'fire';
  if (def.isBoss) return 'death';
  return 'storm';
}

export function rvGetCounterStrategy(monsterType: MonsterType): string {
  const def = rvMonsterMap[monsterType];
  const optimal = rvOptimalRavenForMonster(monsterType);
  const ravenDef = rvRavenMap[optimal];
  if (def.armor >= 10) {
    return `Deploy ${ravenDef.name} to strip armor with ${ravenDef.abilityName}. Use Hex Circle traps to weaken further.`;
  }
  if (def.speed >= 12) {
    return `Deploy ${ravenDef.name} to freeze with ${ravenDef.abilityName}. Frost Field traps will slow them further.`;
  }
  if (def.isBoss) {
    return `Deploy ${ravenDef.name} and use Death Grip spell. Bone Army can distract while damage is dealt.`;
  }
  if (def.baseHp >= 200) {
    return `Deploy ${ravenDef.name} for sustained AOE damage. Fire Brazier traps add extra burn.`;
  }
  return `Shadow Ravens and Storm Ravens work well. Shadow Snares slow them for easy kills.`;
}

export function rvSimulateBattleRound(
  state: RavenTowerState,
  monsterType: MonsterType,
  waveNumber: number
): Readonly<{
  damageToMonster: number;
  damageToWall: number;
  ravensLost: number;
  monstersSlain: number;
}> {
  const monsterDef = rvMonsterMap[monsterType];
  const scaledHp = rvScaledMonsterHp(monsterDef.baseHp, waveNumber, state.floorLevels[state.currentFloor]);
  const scaledDmg = rvScaledMonsterDamage(monsterDef.baseDamage, waveNumber);

  let damageToMonster = 0;
  let damageToWall = 0;
  let ravensLost = 0;

  for (const r of state.deployedRavens) {
    if (r.currentHp <= 0) {
      ravensLost++;
      continue;
    }
    const ravenDef = rvRavenMap[r.ravenType];
    const ravenDmg = rvRavenDamage(ravenDef, r.level);
    damageToMonster += ravenDmg;
    damageToWall += scaledDmg * 0.5;
  }

  for (const t of state.deployedTraps) {
    const trapDef = rvTrapMap[t.trapType];
    damageToMonster += trapDef.damage * (1 + state.floorLevels[state.currentFloor] * 0.05);
  }

  const monstersSlain = Math.floor(damageToMonster / Math.max(1, scaledHp));

  return {
    damageToMonster,
    damageToWall: Math.floor(damageToWall),
    ravensLost,
    monstersSlain: Math.min(monstersSlain, 5),
  };
}

export function rvRecommendFormation(state: RavenTowerState): readonly RavenType[] {
  const floor = rvFloorMap[state.currentFloor];
  const monsterPool = floor.monsterPool;
  const scores: { type: RavenType; score: number }[] = [];

  for (const raven of state.unlockedRavens) {
    let score = 0;
    for (const monsterType of monsterPool) {
      const optimal = rvOptimalRavenForMonster(monsterType);
      if (raven === optimal) score += 3;
      const def = rvMonsterMap[monsterType];
      const ravenDef = rvRavenMap[raven];
      if (ravenDef.baseDamage > def.armor) score += 1;
      if (ravenDef.speed > def.speed) score += 1;
    }
    scores.push({ type: raven, score });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 6).map(s => s.type);
}

export function rvGetBattleLogPreview(state: RavenTowerState): string {
  const floor = rvGetCurrentFloor(state);
  const wave = rvGetWaveInfo(state);
  const ravenCount = state.deployedRavens.length;
  const trapCount = state.deployedTraps.length;
  const dps = rvCalculateDps(state);
  const title = rvGetKeeperTitle(state.keeperLevel);

  if (wave.isComplete && wave.waveNumber === 0) {
    return `[${title}] Standing ready on ${floor.name}. ${ravenCount} ravens deployed, ${trapCount} traps set. DPS: ${dps}. Awaiting command to begin.`;
  }
  if (wave.isComplete) {
    return `[${title}] Wave ${wave.waveNumber} on ${floor.name} complete! ${wave.enemiesRemaining === 0 ? 'All enemies vanquished.' : ''} Prepare for the next assault.`;
  }
  if (wave.isBossWave) {
    return `[${title}] ⚠️ BOSS WAVE ${wave.waveNumber} on ${floor.name}! ${wave.enemiesRemaining} enemies remain. The Tower Guardian approaches!`;
  }
  return `[${title}] Wave ${wave.waveNumber} on ${floor.name} in progress. ${wave.enemiesRemaining} enemies remaining. DPS: ${dps}.`;
}

export function rvRavenAbilityReady(raven: DeployedRaven): boolean {
  return raven.currentCooldown <= 0;
}

export function rvRavenPowerLevel(raven: DeployedRaven): number {
  const def = rvRavenMap[raven.ravenType];
  const damage = rvRavenDamage(def, raven.level);
  const hp = raven.currentHp;
  return damage + hp;
}

export function rvGetStrongestRaven(state: RavenTowerState): DeployedRaven | null {
  if (state.deployedRavens.length === 0) return null;
  return state.deployedRavens.reduce((best, r) =>
    rvRavenPowerLevel(r) > rvRavenPowerLevel(best) ? r : best
  );
}

export function rvGetWeakestRaven(state: RavenTowerState): DeployedRaven | null {
  if (state.deployedRavens.length === 0) return null;
  return state.deployedRavens.reduce((weakest, r) =>
    rvRavenPowerLevel(r) < rvRavenPowerLevel(weakest) ? r : weakest
  );
}

export function rvAverageRavenLevel(state: RavenTowerState): number {
  if (state.deployedRavens.length === 0) return 0;
  const total = state.deployedRavens.reduce((sum, r) => sum + r.level, 0);
  return Math.floor((total / state.deployedRavens.length) * 10) / 10;
}

export function rvTotalTrapDamage(state: RavenTowerState): number {
  let total = 0;
  for (const t of state.deployedTraps) {
    const def = rvTrapMap[t.trapType];
    total += rvTrapTotalDamage(def, state.floorLevels[state.currentFloor]);
  }
  return total;
}

export function rvMostEffectiveTrapForFloor(floorId: FloorId): TrapType {
  const floor = rvFloorMap[floorId];
  const monsterPool = floor.monsterPool;
  const trapScores: { trap: TrapType; score: number }[] = [];

  for (const trap of RV_TRAP_DEFS) {
    let score = 0;
    for (const monsterType of monsterPool) {
      const monster = rvMonsterMap[monsterType];
      if (monster.speed >= 10 && trap.slowFactor > 0) score += 3;
      if (monster.armor >= 5 && trap.damage > 20) score += 2;
      if (monster.baseHp >= 150 && trap.damage > 25) score += 2;
      score += trap.slowFactor * 2;
    }
    trapScores.push({ trap: trap.id, score });
  }

  trapScores.sort((a, b) => b.score - a.score);
  return trapScores[0]?.trap ?? 'shadow_snare';
}

export function rvMostEffectiveSpellForWave(waveNumber: number, isBoss: boolean): SpellId {
  if (isBoss) return 'death_grip';
  if (waveNumber <= 5) return 'blood_boil';
  if (waveNumber <= 15) return 'frost_nova';
  if (waveNumber <= 25) return 'fire_storm';
  if (waveNumber <= 35) return 'void_blast';
  return 'raven_swarm';
}

export function rvEstimateWavesSurvivable(state: RavenTowerState): number {
  const dps = rvCalculateDps(state);
  const tankiness = rvCalculateTankiness(state);
  const floorLevel = state.floorLevels[state.currentFloor];
  const avgMonsterHp = 80 * (1 + floorLevel * 0.08);
  const avgMonsterDmg = 15;

  if (dps <= 0) return 0;
  const timeToKillOne = avgMonsterHp / dps;
  const enemiesPerWave = rvFloorMap[state.currentFloor].enemiesPerWave;
  const timePerWave = timeToKillOne * enemiesPerWave;
  const hitsPerWave = enemiesPerWave * avgMonsterDmg;
  const wavesBeforeDeath = tankiness / Math.max(1, hitsPerWave);

  return Math.max(0, Math.floor(wavesBeforeDeath));
}

export function rvGetRank(state: RavenTowerState): string {
  const score = rvOverallPowerScore(state);
  if (score >= 10000) return 'S+';
  if (score >= 7000) return 'S';
  if (score >= 5000) return 'A+';
  if (score >= 3500) return 'A';
  if (score >= 2500) return 'B+';
  if (score >= 1500) return 'B';
  if (score >= 800) return 'C';
  if (score >= 400) return 'D';
  return 'F';
}

export function rvGetNextUnlockHint(state: RavenTowerState): string {
  const nextRaven = RV_RAVEN_DEFS.find(r => !state.unlockedRavens.includes(r.id));
  if (nextRaven) return `Next raven: ${nextRaven.name} (Level ${nextRaven.unlockLevel})`;
  const nextSpell = RV_SPELL_DEFS.find(s => !state.unlockedSpells.includes(s.id));
  if (nextSpell) return `Next spell: ${nextSpell.name} (Level ${nextSpell.unlockLevel})`;
  const nextFloor = RV_FLOOR_DEFS.find(f => !state.unlockedFloors.includes(f.id));
  if (nextFloor) return `Next floor: ${nextFloor.name} (Level ${nextFloor.unlockLevel})`;
  return 'All content unlocked!';
}

export function rvGetTowerProgress(state: RavenTowerState): number {
  const floorProgress = state.unlockedFloors.length / RV_FLOOR_DEFS.length;
  const ravenProgress = state.unlockedRavens.length / RV_RAVEN_DEFS.length;
  const spellProgress = state.unlockedSpells.length / RV_SPELL_DEFS.length;
  const achievementProgress = state.achievements.length / RV_ACHIEVEMENT_DEFS.length;
  const levelProgress = state.keeperLevel / RV_MAX_LEVEL;
  return Math.floor(((floorProgress + ravenProgress + spellProgress + achievementProgress + levelProgress) / 5) * 100);
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 15: DEFAULT EXPORT — useRavenTower HOOK (React import only here)
// ═══════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

export interface UseRavenTowerReturn {
  state: RavenTowerState;
  rvAddXp: (amount: number) => void;
  rvAddResources: (darkCrystals: number, soulShards: number) => void;
  rvSpendResources: (darkCrystals: number, soulShards: number) => boolean;
  rvSpendMana: (amount: number) => boolean;
  rvRegenMana: (amount: number) => void;
  rvAscendFloor: (floorId: FloorId) => boolean;
  rvUpgradeFloor: () => boolean;
  rvUnlockRaven: (type: RavenType) => boolean;
  rvDeployRaven: (ravenType: RavenType) => boolean;
  rvRecallRaven: (instanceId: string) => void;
  rvDeployTrap: (trapType: TrapType, position: number) => boolean;
  rvCastSpell: (spellId: SpellId) => boolean;
  rvStartWave: () => void;
  rvEnemyKilled: (monsterType: MonsterType) => void;
  rvDamageWall: (damage: number) => void;
  rvHealWall: (amount: number) => void;
  rvUpgradeWall: () => boolean;
  rvAddShield: (amount: number) => void;
  rvStartDailyAssault: (date: string) => void;
  rvCompleteAssaultWave: () => void;
  rvClaimAchievement: (id: AchievementId) => boolean;
  rvResetFloor: () => void;
  rvLevelUpRaven: (instanceId: string) => boolean;
  rvHealRaven: (instanceId: string, amount: number) => void;
  rvHealAllRavens: (amount: number) => void;
  rvDamageRaven: (instanceId: string, damage: number) => void;
  rvRemoveDeadRavens: () => void;
  rvTickTraps: () => void;
  rvConsumeTrapCharge: (instanceId: string) => void;
  rvTickCooldowns: () => void;
  rvResetTower: () => void;
  rvGrantCheatResources: (amount: number) => void;
  rvSetKeeperLevel: (level: number) => void;
}

export default function useRavenTower(initialState?: RavenTowerState): UseRavenTowerReturn {
  const [state, setState] = useState<RavenTowerState>(initialState ?? rvInitialState());

  const addXp = (amount: number) => setState(prev => rvAddXp(prev, amount));
  const addResources = (darkCrystals: number, soulShards: number) =>
    setState(prev => rvAddResources(prev, darkCrystals, soulShards));
  const spendResources = (darkCrystals: number, soulShards: number) => {
    const result = rvSpendResources(state, darkCrystals, soulShards);
    if (result) setState(result);
    return result !== null;
  };
  const spendMana = (amount: number) => {
    const result = rvSpendMana(state, amount);
    if (result) setState(result);
    return result !== null;
  };
  const regenMana = (amount: number) => setState(prev => rvRegenMana(prev, amount));
  const ascendFloor = (floorId: FloorId) => {
    const result = rvAscendFloor(state, floorId);
    if (result) setState(result);
    return result !== null;
  };
  const upgradeFloor = () => {
    const result = rvUpgradeFloor(state);
    if (result) setState(result);
    return result !== null;
  };
  const unlockRaven = (type: RavenType) => {
    const result = rvUnlockRaven(state, type);
    if (result) setState(result);
    return result !== null;
  };
  const deployRaven = (ravenType: RavenType) => {
    const result = rvDeployRaven(state, ravenType);
    if (result) setState(result);
    return result !== null;
  };
  const recallRaven = (instanceId: string) => setState(prev => rvRecallRaven(prev, instanceId));
  const deployTrap = (trapType: TrapType, position: number) => {
    const result = rvDeployTrap(state, trapType, position);
    if (result) setState(result);
    return result !== null;
  };
  const castSpell = (spellId: SpellId) => {
    const result = rvCastSpell(state, spellId);
    if (result) setState(result);
    return result !== null;
  };
  const startWave = () => setState(prev => rvStartWave(prev));
  const enemyKilled = (monsterType: MonsterType) => setState(prev => rvEnemyKilled(prev, monsterType));
  const damageWall = (damage: number) => setState(prev => rvDamageWall(prev, damage));
  const healWall = (amount: number) => setState(prev => rvHealWall(prev, amount));
  const upgradeWall = () => {
    const result = rvUpgradeWall(state);
    if (result) setState(result);
    return result !== null;
  };
  const addShield = (amount: number) => setState(prev => rvAddShield(prev, amount));
  const startDailyAssault = (date: string) => setState(prev => rvStartDailyAssault(prev, date));
  const completeAssaultWave = () => setState(prev => rvCompleteAssaultWave(prev));
  const claimAchievement = (id: AchievementId) => {
    const result = rvClaimAchievement(state, id);
    if (result) setState(result);
    return result !== null;
  };
  const resetFloor = () => setState(prev => rvResetFloor(prev));
  const levelUpRaven = (instanceId: string) => {
    const result = rvLevelUpRaven(state, instanceId);
    if (result) setState(result);
    return result !== null;
  };
  const healRaven = (instanceId: string, amount: number) =>
    setState(prev => rvHealRaven(prev, instanceId, amount));
  const healAllRavens = (amount: number) => setState(prev => rvHealAllRavens(prev, amount));
  const damageRaven = (instanceId: string, damage: number) =>
    setState(prev => rvDamageRaven(prev, instanceId, damage));
  const removeDeadRavens = () => setState(prev => rvRemoveDeadRavens(prev));
  const tickTraps = () => setState(prev => rvTickTraps(prev));
  const consumeTrapCharge = (instanceId: string) =>
    setState(prev => rvConsumeTrapCharge(prev, instanceId));
  const tickCooldowns = () => setState(prev => rvTickCooldowns(prev));
  const resetTower = () => setState(prev => rvResetTower(prev));
  const grantCheatResources = (amount: number) =>
    setState(prev => rvGrantCheatResources(prev, amount));
  const setKeeperLevel = (level: number) =>
    setState(prev => rvSetKeeperLevel(prev, level));

  return {
    state,
    rvAddXp: addXp,
    rvAddResources: addResources,
    rvSpendResources: spendResources,
    rvSpendMana: spendMana,
    rvRegenMana: regenMana,
    rvAscendFloor: ascendFloor,
    rvUpgradeFloor: upgradeFloor,
    rvUnlockRaven: unlockRaven,
    rvDeployRaven: deployRaven,
    rvRecallRaven: recallRaven,
    rvDeployTrap: deployTrap,
    rvCastSpell: castSpell,
    rvStartWave: startWave,
    rvEnemyKilled: enemyKilled,
    rvDamageWall: damageWall,
    rvHealWall: healWall,
    rvUpgradeWall: upgradeWall,
    rvAddShield: addShield,
    rvStartDailyAssault: startDailyAssault,
    rvCompleteAssaultWave: completeAssaultWave,
    rvClaimAchievement: claimAchievement,
    rvResetFloor: resetFloor,
    rvLevelUpRaven: levelUpRaven,
    rvHealRaven: healRaven,
    rvHealAllRavens: healAllRavens,
    rvDamageRaven: damageRaven,
    rvRemoveDeadRavens: removeDeadRavens,
    rvTickTraps: tickTraps,
    rvConsumeTrapCharge: consumeTrapCharge,
    rvTickCooldowns: tickCooldowns,
    rvResetTower: resetTower,
    rvGrantCheatResources: grantCheatResources,
    rvSetKeeperLevel: setKeeperLevel,
  };
}
