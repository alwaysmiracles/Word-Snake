// ============================================================
// Mana Nexus Wire (魔力枢纽)
// Spell Crafting & Mana Management Game Logic
// ============================================================

// ============================================================
// Type Definitions
// ============================================================

export type ManaType = 'arcane' | 'fire' | 'water' | 'earth' | 'air' | 'shadow';

export type SpellSchool =
  | 'pyromancy'
  | 'hydromancy'
  | 'geomancy'
  | 'aeromancy'
  | 'shadowmancy'
  | 'arcanomancy'
  | 'chronomancy'
  | 'necromancy'
  | 'enchantment'
  | 'summoning';

export type EnemyType =
  | 'goblin'
  | 'dark_knight'
  | 'dragon'
  | 'lich'
  | 'shadow_wraith'
  | 'earth_golem'
  | 'fire_imp'
  | 'void_walker';

export type RealmId =
  | 'ember_peaks'
  | 'tidal_depths'
  | 'stone_hollows'
  | 'sky_sanctum'
  | 'twilight_woods'
  | 'arcane_vault';

export type CoreType = 'mana' | 'defense' | 'crafting' | 'mastery' | 'regen';

export interface SpellDef {
  id: string;
  name: string;
  school: SpellSchool;
  manaCost: Record<ManaType, number>;
  power: number;
  description: string;
  element: ManaType;
  cooldown: number;
}

export interface SpellScroll {
  id: string;
  spellId: string;
  charges: number;
  powerMultiplier: number;
  createdAt: number;
  enchantments: string[];
}

export interface EnchantmentDef {
  id: string;
  name: string;
  description: string;
  manaCost: Record<ManaType, number>;
  effectType: 'power_boost' | 'cost_reduce' | 'cooldown_reduce' | 'aoe_expand' | 'heal_on_cast';
  value: number;
}

export interface EnemyDef {
  id: EnemyType;
  name: string;
  baseHp: number;
  attack: number;
  defense: number;
  weakness: ManaType[];
  resistance: ManaType[];
  loot: { xp: number; score: number; mana: Partial<Record<ManaType, number>> };
  description: string;
}

export interface EnemyInstance {
  id: string;
  enemyType: EnemyType;
  currentHp: number;
  maxHp: number;
  wave: number;
  debuffs: { type: string; turns: number; value: number }[];
}

export interface FamiliarDef {
  id: string;
  name: string;
  element: ManaType;
  baseBonus: number;
  description: string;
  summonCost: Record<ManaType, number>;
  maxLevel: number;
  bonusType: 'mana_regen' | 'spell_power' | 'defense' | 'crafting_boost' | 'xp_boost' | 'loot_boost';
}

export interface Familiar {
  id: string;
  familiarDefId: string;
  level: number;
  xp: number;
  active: boolean;
}

export interface RealmDef {
  id: RealmId;
  name: string;
  element: ManaType;
  description: string;
  unlockLevel: number;
  baseCrystals: number;
  manaYield: Partial<Record<ManaType, number>>;
  dangers: number;
}

export interface RealmState {
  unlocked: boolean;
  explored: boolean;
  crystalsCollected: number;
  totalCrystals: number;
  lastExplored: number;
  explorationCount: number;
}

export interface NexusCoreState {
  levels: Record<CoreType, number>;
}

export interface CoreDef {
  type: CoreType;
  name: string;
  description: string;
  maxLevel: number;
  baseUpgradeCost: number;
  bonusPerLevel: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: { xp: number; score: number };
}

export interface CraftingRecipe {
  spellId: string;
  ingredients: Record<ManaType, number>;
  scrollCharges: number;
  powerMultiplier: number;
}

export interface WaveConfig {
  wave: number;
  enemies: { type: EnemyType; count: number; hpMultiplier: number }[];
  bonusMana: Partial<Record<ManaType, number>>;
}

export interface EnchantmentInstance {
  id: string;
  enchantmentDefId: string;
  spellId: string;
  appliedAt: number;
}

export interface ManaNexusState {
  level: number;
  xp: number;
  xpToNext: number;
  totalScore: number;
  mana: Record<ManaType, number>;
  manaCapacity: Record<ManaType, number>;
  manaRegen: Record<ManaType, number>;
  knownSpells: string[];
  craftedScrolls: SpellScroll[];
  nexusCore: NexusCoreState;
  defenseWave: number;
  defenseCycle: number;
  enemiesDefeated: number;
  currentEnemies: EnemyInstance[];
  defenseActive: boolean;
  dailyDefenseCompleted: boolean;
  familiars: Familiar[];
  realmExploration: Record<RealmId, RealmState>;
  spellMastery: Record<string, number>;
  enchantments: EnchantmentInstance[];
  achievements: string[];
  streak: number;
  totalManaCollected: number;
  totalSpellsCast: number;
  totalScrollsCrafted: number;
  totalRealmsExplored: number;
  highestWaveReached: number;
  totalCyclesCompleted: number;
  lastDailyTimestamp: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalEnemiesDefeated: number;
}

// ============================================================
// Constants: Spell Definitions (10 schools × 5 spells = 50)
// ============================================================

export const MANA_TYPES: ManaType[] = ['arcane', 'fire', 'water', 'earth', 'air', 'shadow'];

export const SPELL_SCHOOLS: SpellSchool[] = [
  'pyromancy', 'hydromancy', 'geomancy', 'aeromancy', 'shadowmancy',
  'arcanomancy', 'chronomancy', 'necromancy', 'enchantment', 'summoning',
];

export const ARCANE_MANA: Record<ManaType, number> = {
  arcane: 1, fire: 0, water: 0, earth: 0, air: 0, shadow: 0,
};

export const FIRE_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 1, water: 0, earth: 0, air: 0, shadow: 0,
};

export const WATER_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 0, water: 1, earth: 0, air: 0, shadow: 0,
};

export const EARTH_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 0, water: 0, earth: 1, air: 0, shadow: 0,
};

export const AIR_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 0, water: 0, earth: 0, air: 1, shadow: 0,
};

export const SHADOW_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 0, water: 0, earth: 0, air: 0, shadow: 1,
};

export const ZERO_MANA: Record<ManaType, number> = {
  arcane: 0, fire: 0, water: 0, earth: 0, air: 0, shadow: 0,
};

export const SPELLS: SpellDef[] = [
  // Pyromancy (5 spells)
  { id: 'fireball', name: 'Fireball', school: 'pyromancy', manaCost: { ...FIRE_MANA, fire: 15 }, power: 40, description: 'Hurl a blazing sphere of fire at enemies.', element: 'fire', cooldown: 2 },
  { id: 'flame_wall', name: 'Flame Wall', school: 'pyromancy', manaCost: { ...FIRE_MANA, fire: 25, earth: 5 }, power: 30, description: 'Create a wall of flame that burns all enemies.', element: 'fire', cooldown: 4 },
  { id: 'inferno', name: 'Inferno', school: 'pyromancy', manaCost: { ...FIRE_MANA, fire: 40, arcane: 10 }, power: 80, description: 'Unleash devastating firestorm across the battlefield.', element: 'fire', cooldown: 6 },
  { id: 'ember_shot', name: 'Ember Shot', school: 'pyromancy', manaCost: { ...FIRE_MANA, fire: 8 }, power: 18, description: 'Quick burst of fiery embers.', element: 'fire', cooldown: 1 },
  { id: 'phoenix_strike', name: 'Phoenix Strike', school: 'pyromancy', manaCost: { ...FIRE_MANA, fire: 50, arcane: 20 }, power: 120, description: 'Summon phoenix energy for a devastating strike.', element: 'fire', cooldown: 8 },

  // Hydromancy (5 spells)
  { id: 'water_jet', name: 'Water Jet', school: 'hydromancy', manaCost: { ...WATER_MANA, water: 12 }, power: 25, description: 'Blast enemies with a high-pressure water jet.', element: 'water', cooldown: 1 },
  { id: 'tidal_wave', name: 'Tidal Wave', school: 'hydromancy', manaCost: { ...WATER_MANA, water: 30, air: 10 }, power: 55, description: 'Summon a massive wave to sweep enemies away.', element: 'water', cooldown: 4 },
  { id: 'frost_nova', name: 'Frost Nova', school: 'hydromancy', manaCost: { ...WATER_MANA, water: 20, arcane: 5 }, power: 35, description: 'Freeze nearby enemies with an icy explosion.', element: 'water', cooldown: 3 },
  { id: 'healing_rain', name: 'Healing Rain', school: 'hydromancy', manaCost: { ...WATER_MANA, water: 25 }, power: 30, description: 'Restore nexus health with regenerative rain.', element: 'water', cooldown: 5 },
  { id: 'leviathan_call', name: 'Leviathan Call', school: 'hydromancy', manaCost: { ...WATER_MANA, water: 55, shadow: 15 }, power: 100, description: 'Channel the deep leviathan\'s power.', element: 'water', cooldown: 8 },

  // Geomancy (5 spells)
  { id: 'rock_throw', name: 'Rock Throw', school: 'geomancy', manaCost: { ...EARTH_MANA, earth: 10 }, power: 22, description: 'Hurl a boulder at the enemy.', element: 'earth', cooldown: 1 },
  { id: 'earthquake', name: 'Earthquake', school: 'geomancy', manaCost: { ...EARTH_MANA, earth: 35, fire: 5 }, power: 60, description: 'Shake the ground, damaging all foes.', element: 'earth', cooldown: 5 },
  { id: 'stone_armor', name: 'Stone Armor', school: 'geomancy', manaCost: { ...EARTH_MANA, earth: 20 }, power: 40, description: 'Encase the nexus in protective stone.', element: 'earth', cooldown: 6 },
  { id: 'crystal_shard', name: 'Crystal Shard', school: 'geomancy', manaCost: { ...EARTH_MANA, earth: 15, arcane: 8 }, power: 35, description: 'Launch razor-sharp crystal fragments.', element: 'earth', cooldown: 2 },
  { id: 'mountain_fall', name: 'Mountain Fall', school: 'geomancy', manaCost: { ...EARTH_MANA, earth: 50, air: 10 }, power: 110, description: 'Cause a mountainside to collapse on enemies.', element: 'earth', cooldown: 8 },

  // Aeromancy (5 spells)
  { id: 'gust', name: 'Gust', school: 'aeromancy', manaCost: { ...AIR_MANA, air: 8 }, power: 15, description: 'A swift burst of wind.', element: 'air', cooldown: 1 },
  { id: 'lightning_bolt', name: 'Lightning Bolt', school: 'aeromancy', manaCost: { ...AIR_MANA, air: 25, arcane: 10 }, power: 55, description: 'Strike enemies with a bolt of lightning.', element: 'air', cooldown: 3 },
  { id: 'tornado', name: 'Tornado', school: 'aeromancy', manaCost: { ...AIR_MANA, air: 40 }, power: 70, description: 'Spawn a tornado that devastates the field.', element: 'air', cooldown: 5 },
  { id: 'wind_shield', name: 'Wind Shield', school: 'aeromancy', manaCost: { ...AIR_MANA, air: 18 }, power: 25, description: 'Create a barrier of swirling winds.', element: 'air', cooldown: 4 },
  { id: 'storm_sovereign', name: 'Storm Sovereign', school: 'aeromancy', manaCost: { ...AIR_MANA, air: 50, water: 15, arcane: 10 }, power: 115, description: 'Become one with the storm itself.', element: 'air', cooldown: 9 },

  // Shadowmancy (5 spells)
  { id: 'shadow_bolt', name: 'Shadow Bolt', school: 'shadowmancy', manaCost: { ...SHADOW_MANA, shadow: 12 }, power: 28, description: 'Fire a bolt of pure shadow energy.', element: 'shadow', cooldown: 1 },
  { id: 'void_drain', name: 'Void Drain', school: 'shadowmancy', manaCost: { ...SHADOW_MANA, shadow: 30 }, power: 45, description: 'Drain life force from enemies.', element: 'shadow', cooldown: 3 },
  { id: 'dark_nova', name: 'Dark Nova', school: 'shadowmancy', manaCost: { ...SHADOW_MANA, shadow: 40, arcane: 10 }, power: 75, description: 'Explode with concentrated dark energy.', element: 'shadow', cooldown: 5 },
  { id: 'phantom_strike', name: 'Phantom Strike', school: 'shadowmancy', manaCost: { ...SHADOW_MANA, shadow: 20, air: 5 }, power: 38, description: 'Attack from the shadows with lethal precision.', element: 'shadow', cooldown: 2 },
  { id: 'abyss_call', name: 'Abyss Call', school: 'shadowmancy', manaCost: { ...SHADOW_MANA, shadow: 55, fire: 10 }, power: 110, description: 'Open a rift to the abyss itself.', element: 'shadow', cooldown: 8 },

  // Arcanomancy (5 spells)
  { id: 'arcane_missile', name: 'Arcane Missile', school: 'arcanomancy', manaCost: { ...ARCANE_MANA, arcane: 10 }, power: 20, description: 'Launch homing arcane missiles.', element: 'arcane', cooldown: 1 },
  { id: 'mana_burst', name: 'Mana Burst', school: 'arcanomancy', manaCost: { ...ARCANE_MANA, arcane: 30, fire: 5, water: 5 }, power: 50, description: 'Release a burst of raw mana energy.', element: 'arcane', cooldown: 3 },
  { id: 'disintegrate', name: 'Disintegrate', school: 'arcanomancy', manaCost: { ...ARCANE_MANA, arcane: 45 }, power: 85, description: 'Unmake matter at the atomic level.', element: 'arcane', cooldown: 6 },
  { id: 'spell_pierce', name: 'Spell Pierce', school: 'arcanomancy', manaCost: { ...ARCANE_MANA, arcane: 18, shadow: 5 }, power: 35, description: 'A spell that ignores enemy defenses.', element: 'arcane', cooldown: 2 },
  { id: 'nexus_overload', name: 'Nexus Overload', school: 'arcanomancy', manaCost: { ...ARCANE_MANA, arcane: 60, fire: 10, water: 10, earth: 10, air: 10, shadow: 10 }, power: 150, description: 'Channel all mana types into ultimate destruction.', element: 'arcane', cooldown: 10 },

  // Chronomancy (5 spells)
  { id: 'haste', name: 'Haste', school: 'chronomancy', manaCost: { ...ARCANE_MANA, arcane: 15, air: 10 }, power: 20, description: 'Accelerate time to speed up your next action.', element: 'arcane', cooldown: 4 },
  { id: 'time_warp', name: 'Time Warp', school: 'chronomancy', manaCost: { ...ARCANE_MANA, arcane: 35, shadow: 10 }, power: 55, description: 'Warp time to slow all enemies.', element: 'arcane', cooldown: 6 },
  { id: 'rewind', name: 'Rewind', school: 'chronomancy', manaCost: { ...ARCANE_MANA, arcane: 40 }, power: 30, description: 'Turn back time to restore the nexus.', element: 'arcane', cooldown: 7 },
  { id: 'temporal_shock', name: 'Temporal Shock', school: 'chronomancy', manaCost: { ...ARCANE_MANA, arcane: 20, fire: 8 }, power: 40, description: 'Shock enemies through temporal distortion.', element: 'arcane', cooldown: 3 },
  { id: 'eternity_pause', name: 'Eternity Pause', school: 'chronomancy', manaCost: { ...ARCANE_MANA, arcane: 55, shadow: 15, air: 10 }, power: 95, description: 'Freeze time itself for devastating effect.', element: 'arcane', cooldown: 9 },

  // Necromancy (5 spells)
  { id: 'life_drain', name: 'Life Drain', school: 'necromancy', manaCost: { ...SHADOW_MANA, shadow: 18, water: 5 }, power: 30, description: 'Steal life force from an enemy.', element: 'shadow', cooldown: 2 },
  { id: 'bone_spear', name: 'Bone Spear', school: 'necromancy', manaCost: { ...SHADOW_MANA, shadow: 15, earth: 8 }, power: 35, description: 'Launch a spear of sharpened bone.', element: 'shadow', cooldown: 2 },
  { id: 'soul_harvest', name: 'Soul Harvest', school: 'necromancy', manaCost: { ...SHADOW_MANA, shadow: 35, arcane: 10 }, power: 65, description: 'Harvest souls from fallen enemies.', element: 'shadow', cooldown: 5 },
  { id: 'death_coil', name: 'Death Coil', school: 'necromancy', manaCost: { ...SHADOW_MANA, shadow: 25, fire: 10 }, power: 45, description: 'Unleash a coil of death energy.', element: 'shadow', cooldown: 3 },
  { id: 'apocalypse', name: 'Apocalypse', school: 'necromancy', manaCost: { ...SHADOW_MANA, shadow: 60, earth: 15, fire: 10 }, power: 130, description: 'Bring about a localized apocalypse.', element: 'shadow', cooldown: 10 },

  // Enchantment (5 spells)
  { id: 'mana_shield', name: 'Mana Shield', school: 'enchantment', manaCost: { ...ARCANE_MANA, arcane: 20, water: 10 }, power: 35, description: 'Create a protective mana barrier.', element: 'arcane', cooldown: 5 },
  { id: 'elemental_fury', name: 'Elemental Fury', school: 'enchantment', manaCost: { ...ARCANE_MANA, arcane: 25, fire: 10, water: 10 }, power: 40, description: 'Boost the power of all element spells.', element: 'arcane', cooldown: 6 },
  { id: 'mana_surge', name: 'Mana Surge', school: 'enchantment', manaCost: { ...ARCANE_MANA, arcane: 15 }, power: 20, description: 'Temporarily double mana regeneration.', element: 'arcane', cooldown: 4 },
  { id: 'crystal_focus', name: 'Crystal Focus', school: 'enchantment', manaCost: { ...ARCANE_MANA, arcane: 18, earth: 12 }, power: 30, description: 'Focus mana to boost the next spell cast.', element: 'arcane', cooldown: 3 },
  { id: 'nexus_blessing', name: 'Nexus Blessing', school: 'enchantment', manaCost: { ...ARCANE_MANA, arcane: 40, fire: 10, water: 10, earth: 10, air: 10, shadow: 10 }, power: 60, description: 'Bless the nexus with all elemental powers.', element: 'arcane', cooldown: 8 },

  // Summoning (5 spells)
  { id: 'imp_summon', name: 'Imp Summon', school: 'summoning', manaCost: { ...FIRE_MANA, fire: 15, shadow: 5 }, power: 25, description: 'Summon a fire imp to fight for you.', element: 'fire', cooldown: 3 },
  { id: 'elemental_guardian', name: 'Elemental Guardian', school: 'summoning', manaCost: { ...ARCANE_MANA, arcane: 30, earth: 15, water: 10 }, power: 50, description: 'Summon a powerful elemental guardian.', element: 'arcane', cooldown: 6 },
  { id: 'spirit_wolf', name: 'Spirit Wolf', school: 'summoning', manaCost: { ...AIR_MANA, air: 20, shadow: 10 }, power: 35, description: 'Call a spectral wolf to hunt enemies.', element: 'air', cooldown: 4 },
  { id: 'golem_rise', name: 'Golem Rise', school: 'summoning', manaCost: { ...EARTH_MANA, earth: 35, arcane: 10 }, power: 55, description: 'Raise a stone golem from the earth.', element: 'earth', cooldown: 5 },
  { id: 'celestial_avatar', name: 'Celestial Avatar', school: 'summoning', manaCost: { ...ARCANE_MANA, arcane: 50, fire: 15, water: 15, air: 15 }, power: 100, description: 'Manifest a celestial being of pure energy.', element: 'arcane', cooldown: 9 },
];

// ============================================================
// Constants: Enemy Definitions (8 enemy types)
// ============================================================

export const ENEMIES: EnemyDef[] = [
  {
    id: 'goblin', name: 'Goblin', baseHp: 30, attack: 8, defense: 3,
    weakness: ['arcane'], resistance: ['earth'],
    loot: { xp: 10, score: 50, mana: { fire: 3, shadow: 2 } },
    description: 'A sneaky goblin scavenger.',
  },
  {
    id: 'dark_knight', name: 'Dark Knight', baseHp: 80, attack: 20, defense: 12,
    weakness: ['fire', 'arcane'], resistance: ['shadow'],
    loot: { xp: 30, score: 150, mana: { shadow: 8, earth: 5 } },
    description: 'An armored knight corrupted by dark magic.',
  },
  {
    id: 'dragon', name: 'Dragon', baseHp: 200, attack: 45, defense: 20,
    weakness: ['water', 'air'], resistance: ['fire'],
    loot: { xp: 80, score: 400, mana: { fire: 15, arcane: 10 } },
    description: 'An ancient dragon with immense power.',
  },
  {
    id: 'lich', name: 'Lich', baseHp: 150, attack: 35, defense: 15,
    weakness: ['shadow', 'fire'], resistance: ['arcane'],
    loot: { xp: 60, score: 300, mana: { shadow: 12, arcane: 8 } },
    description: 'An undead sorcerer of terrible power.',
  },
  {
    id: 'shadow_wraith', name: 'Shadow Wraith', baseHp: 60, attack: 25, defense: 5,
    weakness: ['arcane', 'fire'], resistance: ['shadow'],
    loot: { xp: 25, score: 120, mana: { shadow: 10, air: 5 } },
    description: 'A ghostly entity of pure shadow.',
  },
  {
    id: 'earth_golem', name: 'Earth Golem', baseHp: 180, attack: 30, defense: 25,
    weakness: ['air', 'water'], resistance: ['earth', 'fire'],
    loot: { xp: 50, score: 250, mana: { earth: 15, fire: 5 } },
    description: 'A massive construct of animated stone.',
  },
  {
    id: 'fire_imp', name: 'Fire Imp', baseHp: 25, attack: 15, defense: 2,
    weakness: ['water'], resistance: ['fire', 'shadow'],
    loot: { xp: 8, score: 40, mana: { fire: 5, arcane: 2 } },
    description: 'A mischievous imp wreathed in flames.',
  },
  {
    id: 'void_walker', name: 'Void Walker', baseHp: 250, attack: 50, defense: 18,
    weakness: ['arcane'], resistance: ['shadow', 'fire', 'water', 'earth', 'air'],
    loot: { xp: 100, score: 500, mana: { arcane: 20, shadow: 10 } },
    description: 'A being from beyond the void itself.',
  },
];

// ============================================================
// Constants: Familiar Definitions (12 familiars)
// ============================================================

export const FAMILIAR_DEFS: FamiliarDef[] = [
  { id: 'spark_wisp', name: 'Spark Wisp', element: 'arcane', baseBonus: 5, description: 'A tiny wisp of arcane energy.', summonCost: { ...ARCANE_MANA, arcane: 30 }, maxLevel: 10, bonusType: 'mana_regen' },
  { id: 'flame_kitten', name: 'Flame Kitten', element: 'fire', baseBonus: 8, description: 'An adorable kitten made of fire.', summonCost: { ...FIRE_MANA, fire: 30 }, maxLevel: 10, bonusType: 'spell_power' },
  { id: 'tidal_turtle', name: 'Tidal Turtle', element: 'water', baseBonus: 6, description: 'A wise turtle of the deep.', summonCost: { ...WATER_MANA, water: 30 }, maxLevel: 10, bonusType: 'defense' },
  { id: 'stone_badger', name: 'Stone Badger', element: 'earth', baseBonus: 7, description: 'A sturdy badger of living rock.', summonCost: { ...EARTH_MANA, earth: 30 }, maxLevel: 10, bonusType: 'crafting_boost' },
  { id: 'breeze_hawk', name: 'Breeze Hawk', element: 'air', baseBonus: 5, description: 'A hawk that rides the winds.', summonCost: { ...AIR_MANA, air: 30 }, maxLevel: 10, bonusType: 'xp_boost' },
  { id: 'shade_fox', name: 'Shade Fox', element: 'shadow', baseBonus: 6, description: 'A cunning fox of shadow and dusk.', summonCost: { ...SHADOW_MANA, shadow: 30 }, maxLevel: 10, bonusType: 'loot_boost' },
  { id: 'prism_moth', name: 'Prism Moth', element: 'arcane', baseBonus: 10, description: 'A moth radiating prismatic light.', summonCost: { ...ARCANE_MANA, arcane: 50 }, maxLevel: 10, bonusType: 'spell_power' },
  { id: 'magma_toad', name: 'Magma Toad', element: 'fire', baseBonus: 8, description: 'A toad that belches magma.', summonCost: { ...FIRE_MANA, fire: 50 }, maxLevel: 10, bonusType: 'mana_regen' },
  { id: 'frost_owl', name: 'Frost Owl', element: 'water', baseBonus: 9, description: 'An owl of glacial wisdom.', summonCost: { ...WATER_MANA, water: 50 }, maxLevel: 10, bonusType: 'xp_boost' },
  { id: 'root_beetle', name: 'Root Beetle', element: 'earth', baseBonus: 7, description: 'A beetle with roots for legs.', summonCost: { ...EARTH_MANA, earth: 50 }, maxLevel: 10, bonusType: 'defense' },
  { id: 'cloud_sheep', name: 'Cloud Sheep', element: 'air', baseBonus: 6, description: 'A fluffy sheep of cumulus.', summonCost: { ...AIR_MANA, air: 50 }, maxLevel: 10, bonusType: 'mana_regen' },
  { id: 'void_cat', name: 'Void Cat', element: 'shadow', baseBonus: 12, description: 'A cat from the spaces between worlds.', summonCost: { ...SHADOW_MANA, shadow: 50 }, maxLevel: 10, bonusType: 'loot_boost' },
];

// ============================================================
// Constants: Realm Definitions (6 realms)
// ============================================================

export const REALM_DEFS: RealmDef[] = [
  { id: 'ember_peaks', name: 'Ember Peaks', element: 'fire', description: 'Volcanic mountains flowing with liquid fire.', unlockLevel: 3, baseCrystals: 20, manaYield: { fire: 25, earth: 10 }, dangers: 4 },
  { id: 'tidal_depths', name: 'Tidal Depths', element: 'water', description: 'An oceanic abyss teeming with magical life.', unlockLevel: 5, baseCrystals: 25, manaYield: { water: 30, shadow: 8 }, dangers: 5 },
  { id: 'stone_hollows', name: 'Stone Hollows', element: 'earth', description: 'Vast underground caverns of crystal and stone.', unlockLevel: 8, baseCrystals: 30, manaYield: { earth: 35, arcane: 10 }, dangers: 6 },
  { id: 'sky_sanctum', name: 'Sky Sanctum', element: 'air', description: 'Floating islands above the clouds.', unlockLevel: 12, baseCrystals: 35, manaYield: { air: 40, arcane: 12 }, dangers: 7 },
  { id: 'twilight_woods', name: 'Twilight Woods', element: 'shadow', description: 'An enchanted forest perpetually at dusk.', unlockLevel: 16, baseCrystals: 40, manaYield: { shadow: 45, arcane: 15 }, dangers: 8 },
  { id: 'arcane_vault', name: 'Arcane Vault', element: 'arcane', description: 'The ultimate repository of pure arcane energy.', unlockLevel: 20, baseCrystals: 50, manaYield: { arcane: 60, fire: 10, water: 10, earth: 10, air: 10, shadow: 10 }, dangers: 10 },
];

// ============================================================
// Constants: Core Definitions (5 cores × 10 levels)
// ============================================================

export const CORE_DEFS: CoreDef[] = [
  { type: 'mana', name: 'Mana Core', description: 'Increases maximum mana capacity.', maxLevel: 10, baseUpgradeCost: 100, bonusPerLevel: 20 },
  { type: 'defense', name: 'Defense Core', description: 'Reduces damage taken during nexus defense.', maxLevel: 10, baseUpgradeCost: 120, bonusPerLevel: 5 },
  { type: 'crafting', name: 'Crafting Core', description: 'Reduces crafting costs and improves scroll quality.', maxLevel: 10, baseUpgradeCost: 110, bonusPerLevel: 8 },
  { type: 'mastery', name: 'Mastery Core', description: 'Increases spell mastery experience gained.', maxLevel: 10, baseUpgradeCost: 130, bonusPerLevel: 10 },
  { type: 'regen', name: 'Regen Core', description: 'Boosts mana regeneration rates.', maxLevel: 10, baseUpgradeCost: 115, bonusPerLevel: 3 },
];

// ============================================================
// Constants: Enchantment Definitions
// ============================================================

export const ENCHANTMENT_DEFS: EnchantmentDef[] = [
  { id: 'fire_infusion', name: 'Fire Infusion', description: '+50% power to fire spells.', manaCost: { ...FIRE_MANA, fire: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'water_infusion', name: 'Water Infusion', description: '+50% power to water spells.', manaCost: { ...WATER_MANA, water: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'earth_infusion', name: 'Earth Infusion', description: '+50% power to earth spells.', manaCost: { ...EARTH_MANA, earth: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'air_infusion', name: 'Air Infusion', description: '+50% power to air spells.', manaCost: { ...AIR_MANA, air: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'shadow_infusion', name: 'Shadow Infusion', description: '+50% power to shadow spells.', manaCost: { ...SHADOW_MANA, shadow: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'arcane_infusion', name: 'Arcane Infusion', description: '+50% power to arcane spells.', manaCost: { ...ARCANE_MANA, arcane: 30 }, effectType: 'power_boost', value: 50 },
  { id: 'mana_efficiency', name: 'Mana Efficiency', description: '-20% mana cost for all spells.', manaCost: { ...ARCANE_MANA, arcane: 20, water: 10 }, effectType: 'cost_reduce', value: 20 },
  { id: 'swift_cast', name: 'Swift Cast', description: '-30% cooldown for all spells.', manaCost: { ...AIR_MANA, air: 25, arcane: 10 }, effectType: 'cooldown_reduce', value: 30 },
  { id: 'arcane_expansion', name: 'Arcane Expansion', description: '+1 AOE radius for damaging spells.', manaCost: { ...ARCANE_MANA, arcane: 35, earth: 15 }, effectType: 'aoe_expand', value: 1 },
  { id: 'vitality_siphon', name: 'Vitality Siphon', description: 'Heal nexus for 15% of spell damage dealt.', manaCost: { ...WATER_MANA, water: 20, shadow: 15 }, effectType: 'heal_on_cast', value: 15 },
];

// ============================================================
// Constants: Achievement Definitions (15 achievements)
// ============================================================

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'first_spell', name: 'First Spell', description: 'Learn your first spell.', condition: 'knownSpells.length >= 1', reward: { xp: 50, score: 100 } },
  { id: 'spell_collector', name: 'Spell Collector', description: 'Learn 25 different spells.', condition: 'knownSpells.length >= 25', reward: { xp: 500, score: 1000 } },
  { id: 'master_scholar', name: 'Master Scholar', description: 'Learn all 50 spells.', condition: 'knownSpells.length >= 50', reward: { xp: 2000, score: 5000 } },
  { id: 'first_craft', name: 'Scroll Crafter', description: 'Craft your first spell scroll.', condition: 'totalScrollsCrafted >= 1', reward: { xp: 100, score: 200 } },
  { id: 'mass_producer', name: 'Mass Producer', description: 'Craft 50 spell scrolls.', condition: 'totalScrollsCrafted >= 50', reward: { xp: 800, score: 2000 } },
  { id: 'wave_survivor', name: 'Wave Survivor', description: 'Reach wave 10 in nexus defense.', condition: 'highestWaveReached >= 10', reward: { xp: 300, score: 750 } },
  { id: 'nexus_champion', name: 'Nexus Champion', description: 'Complete a full 20-wave defense cycle.', condition: 'totalCyclesCompleted >= 1', reward: { xp: 1000, score: 2500 } },
  { id: 'streak_7', name: 'Dedicated Defender', description: 'Maintain a 7-day defense streak.', condition: 'streak >= 7', reward: { xp: 500, score: 1200 } },
  { id: 'streak_30', name: 'Unbreakable Will', description: 'Maintain a 30-day defense streak.', condition: 'streak >= 30', reward: { xp: 3000, score: 8000 } },
  { id: 'explorer', name: 'Realm Explorer', description: 'Explore all 6 elemental realms.', condition: 'totalRealmsExplored >= 6', reward: { xp: 800, score: 2000 } },
  { id: 'dragon_slayer', name: 'Dragon Slayer', description: 'Defeat 10 dragons.', condition: 'enemiesDefeated >= 10', reward: { xp: 600, score: 1500 } },
  { id: 'familiar_master', name: 'Familiar Master', description: 'Summon all 12 elemental familiars.', condition: 'familiars.length >= 12', reward: { xp: 1500, score: 4000 } },
  { id: 'archmage', name: 'Archmage Ascended', description: 'Reach archmage level 30.', condition: 'level >= 30', reward: { xp: 5000, score: 12000 } },
  { id: 'core_maxed', name: 'Core Overload', description: 'Max out any nexus core to level 10.', condition: 'Any core at level 10', reward: { xp: 1200, score: 3000 } },
  { id: 'daily_hero', name: 'Daily Hero', description: 'Complete 10 daily defense challenges.', condition: 'dailyDefenseCompleted (cumulative)', reward: { xp: 2000, score: 5000 } },
];

// ============================================================
// Constants: Crafting Recipes
// ============================================================

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  { spellId: 'fireball', ingredients: { ...FIRE_MANA, fire: 20 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'water_jet', ingredients: { ...WATER_MANA, water: 15 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'rock_throw', ingredients: { ...EARTH_MANA, earth: 12 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'gust', ingredients: { ...AIR_MANA, air: 10 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'shadow_bolt', ingredients: { ...SHADOW_MANA, shadow: 15 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'arcane_missile', ingredients: { ...ARCANE_MANA, arcane: 12 }, scrollCharges: 3, powerMultiplier: 1.0 },
  { spellId: 'flame_wall', ingredients: { ...FIRE_MANA, fire: 30, earth: 8 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'tidal_wave', ingredients: { ...WATER_MANA, water: 35, air: 12 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'earthquake', ingredients: { ...EARTH_MANA, earth: 40, fire: 8 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'lightning_bolt', ingredients: { ...AIR_MANA, air: 30, arcane: 12 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'dark_nova', ingredients: { ...SHADOW_MANA, shadow: 45, arcane: 12 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'mana_burst', ingredients: { ...ARCANE_MANA, arcane: 35, fire: 8, water: 8 }, scrollCharges: 2, powerMultiplier: 1.1 },
  { spellId: 'inferno', ingredients: { ...FIRE_MANA, fire: 50, arcane: 15 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'leviathan_call', ingredients: { ...WATER_MANA, water: 60, shadow: 20 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'mountain_fall', ingredients: { ...EARTH_MANA, earth: 55, air: 15 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'storm_sovereign', ingredients: { ...AIR_MANA, air: 55, water: 18, arcane: 15 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'abyss_call', ingredients: { ...SHADOW_MANA, shadow: 60, fire: 15 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'disintegrate', ingredients: { ...ARCANE_MANA, arcane: 50 }, scrollCharges: 1, powerMultiplier: 1.25 },
  { spellId: 'phoenix_strike', ingredients: { ...FIRE_MANA, fire: 60, arcane: 25 }, scrollCharges: 1, powerMultiplier: 1.4 },
  { spellId: 'nexus_overload', ingredients: { ...ARCANE_MANA, arcane: 70, fire: 15, water: 15, earth: 15, air: 15, shadow: 15 }, scrollCharges: 1, powerMultiplier: 1.5 },
];

// ============================================================
// Constants: Wave Configuration (20 waves per cycle)
// ============================================================

export const WAVE_CONFIGS: WaveConfig[] = [
  { wave: 1, enemies: [{ type: 'goblin', count: 3, hpMultiplier: 1.0 }], bonusMana: { arcane: 5 } },
  { wave: 2, enemies: [{ type: 'goblin', count: 4, hpMultiplier: 1.1 }], bonusMana: { fire: 5 } },
  { wave: 3, enemies: [{ type: 'goblin', count: 3, hpMultiplier: 1.2 }, { type: 'fire_imp', count: 2, hpMultiplier: 1.0 }], bonusMana: { water: 8 } },
  { wave: 4, enemies: [{ type: 'fire_imp', count: 4, hpMultiplier: 1.1 }], bonusMana: { earth: 8 } },
  { wave: 5, enemies: [{ type: 'dark_knight', count: 2, hpMultiplier: 1.0 }, { type: 'goblin', count: 3, hpMultiplier: 1.3 }], bonusMana: { air: 10 } },
  { wave: 6, enemies: [{ type: 'shadow_wraith', count: 3, hpMultiplier: 1.0 }], bonusMana: { shadow: 10 } },
  { wave: 7, enemies: [{ type: 'dark_knight', count: 3, hpMultiplier: 1.1 }, { type: 'fire_imp', count: 2, hpMultiplier: 1.2 }], bonusMana: { arcane: 12 } },
  { wave: 8, enemies: [{ type: 'earth_golem', count: 2, hpMultiplier: 1.0 }], bonusMana: { water: 12 } },
  { wave: 9, enemies: [{ type: 'shadow_wraith', count: 4, hpMultiplier: 1.2 }], bonusMana: { fire: 12 } },
  { wave: 10, enemies: [{ type: 'dragon', count: 1, hpMultiplier: 1.0 }, { type: 'dark_knight', count: 2, hpMultiplier: 1.3 }], bonusMana: { arcane: 20, fire: 15 } },
  { wave: 11, enemies: [{ type: 'dark_knight', count: 4, hpMultiplier: 1.3 }], bonusMana: { earth: 15 } },
  { wave: 12, enemies: [{ type: 'lich', count: 1, hpMultiplier: 1.0 }, { type: 'shadow_wraith', count: 3, hpMultiplier: 1.3 }], bonusMana: { shadow: 18 } },
  { wave: 13, enemies: [{ type: 'earth_golem', count: 3, hpMultiplier: 1.2 }], bonusMana: { air: 15 } },
  { wave: 14, enemies: [{ type: 'dragon', count: 1, hpMultiplier: 1.2 }, { type: 'fire_imp', count: 4, hpMultiplier: 1.4 }], bonusMana: { water: 18 } },
  { wave: 15, enemies: [{ type: 'lich', count: 2, hpMultiplier: 1.1 }, { type: 'dark_knight', count: 2, hpMultiplier: 1.4 }], bonusMana: { arcane: 22 } },
  { wave: 16, enemies: [{ type: 'void_walker', count: 1, hpMultiplier: 1.0 }], bonusMana: { shadow: 25 } },
  { wave: 17, enemies: [{ type: 'dragon', count: 2, hpMultiplier: 1.3 }], bonusMana: { fire: 22, water: 22 } },
  { wave: 18, enemies: [{ type: 'void_walker', count: 1, hpMultiplier: 1.2 }, { type: 'lich', count: 2, hpMultiplier: 1.3 }], bonusMana: { arcane: 28 } },
  { wave: 19, enemies: [{ type: 'dragon', count: 2, hpMultiplier: 1.4 }, { type: 'earth_golem', count: 2, hpMultiplier: 1.4 }], bonusMana: { earth: 25, air: 25 } },
  { wave: 20, enemies: [{ type: 'void_walker', count: 2, hpMultiplier: 1.5 }], bonusMana: { arcane: 40, fire: 20, water: 20, earth: 20, air: 20, shadow: 20 } },
];

// ============================================================
// Pure Helper Functions: Internal
// ============================================================

function generateId(): string {
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
}

function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deepCloneManaRecord(record: Record<ManaType, number>): Record<ManaType, number> {
  return { ...record };
}

function applyManaCost(
  current: Record<ManaType, number>,
  cost: Record<ManaType, number>
): Record<ManaType, number> {
  const result = deepCloneManaRecord(current);
  for (const type of MANA_TYPES) {
    result[type] = Math.max(0, result[type] - (cost[type] || 0));
  }
  return result;
}

function canAffordMana(
  current: Record<ManaType, number>,
  cost: Record<ManaType, number>
): boolean {
  for (const type of MANA_TYPES) {
    if ((current[type] || 0) < (cost[type] || 0)) return false;
  }
  return true;
}

function addManaRecords(
  base: Record<ManaType, number>,
  addition: Partial<Record<ManaType, number>>
): Record<ManaType, number> {
  const result = deepCloneManaRecord(base);
  for (const type of MANA_TYPES) {
    result[type] = Math.min(
      result[type],
      result[type] + (addition[type] || 0)
    );
  }
  return result;
}

function scaleCostByCraftingCore(cost: Record<ManaType, number>, coreLevel: number): Record<ManaType, number> {
  const reduction = 1 - (coreLevel * 0.03);
  const result: Record<ManaType, number> = { ...ZERO_MANA };
  for (const type of MANA_TYPES) {
    result[type] = Math.max(0, Math.floor(cost[type] * reduction));
  }
  return result;
}

// ============================================================
// Named Export Functions: State Management (mn* prefix)
// ============================================================

export function mnCreateInitialState(): ManaNexusState {
  const baseMana: Record<ManaType, number> = {
    arcane: 50, fire: 50, water: 50, earth: 50, air: 50, shadow: 50,
  };
  const baseCapacity: Record<ManaType, number> = {
    arcane: 100, fire: 100, water: 100, earth: 100, air: 100, shadow: 100,
  };
  const baseRegen: Record<ManaType, number> = {
    arcane: 2, fire: 2, water: 2, earth: 2, air: 2, shadow: 2,
  };
  const coreLevels: Record<CoreType, number> = {
    mana: 1, defense: 1, crafting: 1, mastery: 1, regen: 1,
  };
  const realmInit: Record<RealmId, RealmState> = {
    ember_peaks: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 20, lastExplored: 0, explorationCount: 0 },
    tidal_depths: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 25, lastExplored: 0, explorationCount: 0 },
    stone_hollows: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 30, lastExplored: 0, explorationCount: 0 },
    sky_sanctum: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 35, lastExplored: 0, explorationCount: 0 },
    twilight_woods: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 40, lastExplored: 0, explorationCount: 0 },
    arcane_vault: { unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 50, lastExplored: 0, explorationCount: 0 },
  };

  return {
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalScore: 0,
    mana: baseMana,
    manaCapacity: baseCapacity,
    manaRegen: baseRegen,
    knownSpells: ['ember_shot', 'gust', 'shadow_bolt', 'arcane_missile', 'rock_throw', 'water_jet'],
    craftedScrolls: [],
    nexusCore: { levels: coreLevels },
    defenseWave: 0,
    defenseCycle: 1,
    enemiesDefeated: 0,
    currentEnemies: [],
    defenseActive: false,
    dailyDefenseCompleted: false,
    familiars: [],
    realmExploration: realmInit,
    spellMastery: {},
    enchantments: [],
    achievements: [],
    streak: 0,
    totalManaCollected: 0,
    totalSpellsCast: 0,
    totalScrollsCrafted: 0,
    totalRealmsExplored: 0,
    highestWaveReached: 0,
    totalCyclesCompleted: 0,
    lastDailyTimestamp: 0,
    totalDamageDealt: 0,
    totalHealingDone: 0,
    totalEnemiesDefeated: 0,
  };
}

export function mnGetState(state: ManaNexusState): ManaNexusState {
  return state;
}

export function mnGetLevel(state: ManaNexusState): number {
  return state.level;
}

export function mnGetXp(state: ManaNexusState): number {
  return state.xp;
}

export function mnGetXpToNext(state: ManaNexusState): number {
  return state.xpToNext;
}

export function mnGetTotalScore(state: ManaNexusState): number {
  return state.totalScore;
}

export function mnGetXpProgress(state: ManaNexusState): number {
  if (state.xpToNext <= 0) return 1;
  return clampValue(state.xp / state.xpToNext, 0, 1);
}

export function mnCalculateXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

export function mnAddXp(state: ManaNexusState, amount: number): ManaNexusState {
  const xpBoostMultiplier = 1 + mnGetFamiliarBonusByType(state, 'xp_boost') / 100;
  const effectiveXp = Math.floor(amount * xpBoostMultiplier);
  let newXp = state.xp + effectiveXp;
  let newLevel = state.level;
  let newXpToNext = state.xpToNext;

  while (newXp >= newXpToNext && newLevel < 50) {
    newXp -= newXpToNext;
    newLevel += 1;
    newXpToNext = mnCalculateXpToNext(newLevel);
  }

  return {
    ...state,
    xp: newXp,
    level: newLevel,
    xpToNext: newXpToNext,
    manaCapacity: mnRecalculateManaCapacity(state, newLevel),
    manaRegen: mnRecalculateManaRegen(state, newLevel),
  };
}

// ============================================================
// Named Export Functions: Mana System
// ============================================================

export function mnGetMana(state: ManaNexusState, type: ManaType): number {
  return state.mana[type] || 0;
}

export function mnGetAllMana(state: ManaNexusState): Record<ManaType, number> {
  return { ...state.mana };
}

export function mnGetManaCapacity(state: ManaNexusState, type: ManaType): number {
  return state.manaCapacity[type] || 100;
}

export function mnGetManaRegen(state: ManaNexusState, type: ManaType): number {
  return state.manaRegen[type] || 2;
}

export function mnGetManaPercent(state: ManaNexusState, type: ManaType): number {
  const cap = mnGetManaCapacity(state, type);
  if (cap <= 0) return 0;
  return clampValue((state.mana[type] || 0) / cap, 0, 1);
}

export function mnGetTotalManaValue(state: ManaNexusState): number {
  let total = 0;
  for (const type of MANA_TYPES) {
    total += state.mana[type] || 0;
  }
  return total;
}

export function mnGetTotalManaCapacity(state: ManaNexusState): number {
  let total = 0;
  for (const type of MANA_TYPES) {
    total += state.manaCapacity[type] || 100;
  }
  return total;
}

export function mnIsManaSufficient(state: ManaNexusState, cost: Record<ManaType, number>): boolean {
  return canAffordMana(state.mana, cost);
}

export function mnCollectMana(state: ManaNexusState, type: ManaType, amount: number): ManaNexusState {
  const cap = state.manaCapacity[type] || 100;
  const newAmount = Math.min(state.mana[type] + amount, cap);
  const regenBonus = mnGetFamiliarBonusByType(state, 'mana_regen');
  const effectiveCap = cap + Math.floor(regenBonus * 2);
  const clampedAmount = Math.min(newAmount, effectiveCap);
  const actualCollected = clampedAmount - state.mana[type];

  return {
    ...state,
    mana: { ...state.mana, [type]: clampedAmount },
    totalManaCollected: state.totalManaCollected + Math.max(0, actualCollected),
  };
}

export function mnSpendMana(state: ManaNexusState, cost: Record<ManaType, number>): ManaNexusState {
  if (!mnIsManaSufficient(state, cost)) return state;
  return {
    ...state,
    mana: applyManaCost(state.mana, cost),
  };
}

export function mnRefillAllMana(state: ManaNexusState): ManaNexusState {
  const newMana: Record<ManaType, number> = { ...ZERO_MANA };
  for (const type of MANA_TYPES) {
    newMana[type] = state.manaCapacity[type] || 100;
  }
  return { ...state, mana: newMana };
}

export function mnRegenerateMana(state: ManaNexusState): ManaNexusState {
  const regenCoreLevel = state.nexusCore.levels.regen || 1;
  const regenBonus = mnGetFamiliarBonusByType(state, 'mana_regen');
  const newMana = deepCloneManaRecord(state.mana);

  for (const type of MANA_TYPES) {
    const baseRegen = (state.manaRegen[type] || 2) + (regenCoreLevel - 1) * 1;
    const totalRegen = Math.floor(baseRegen * (1 + regenBonus / 100));
    const cap = state.manaCapacity[type] || 100;
    newMana[type] = Math.min(newMana[type] + totalRegen, cap);
  }

  return { ...state, mana: newMana };
}

export function mnCollectMultiMana(state: ManaNexusState, amounts: Partial<Record<ManaType, number>>): ManaNexusState {
  let result = state;
  for (const type of MANA_TYPES) {
    if (amounts[type] && amounts[type]! > 0) {
      result = mnCollectMana(result, type, amounts[type]!);
    }
  }
  return result;
}

export function mnRecalculateManaCapacity(state: ManaNexusState, level: number): Record<ManaType, number> {
  const coreLevel = state.nexusCore.levels.mana || 1;
  const bonusPerLevel = 20;
  const baseCapacity = 100 + (level - 1) * 10;
  const coreBonus = (coreLevel - 1) * bonusPerLevel;
  const cap = baseCapacity + coreBonus;
  const result: Record<ManaType, number> = { ...ZERO_MANA };
  for (const type of MANA_TYPES) {
    result[type] = cap;
  }
  return result;
}

export function mnRecalculateManaRegen(state: ManaNexusState, level: number): Record<ManaType, number> {
  const baseRegen = 2 + Math.floor((level - 1) * 0.5);
  const result: Record<ManaType, number> = { ...ZERO_MANA };
  for (const type of MANA_TYPES) {
    result[type] = baseRegen;
  }
  return result;
}

// ============================================================
// Named Export Functions: Spell System
// ============================================================

export function mnGetSpellDef(spellId: string): SpellDef | undefined {
  return SPELLS.find(s => s.id === spellId);
}

export function mnGetKnownSpells(state: ManaNexusState): string[] {
  return [...state.knownSpells];
}

export function mnHasSpell(state: ManaNexusState, spellId: string): boolean {
  return state.knownSpells.includes(spellId);
}

export function mnLearnSpell(state: ManaNexusState, spellId: string): ManaNexusState {
  if (mnHasSpell(state, spellId)) return state;
  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return state;

  const xpReward = 25;
  const scoreReward = 50;
  let newState = {
    ...state,
    knownSpells: [...state.knownSpells, spellId],
    spellMastery: { ...state.spellMastery, [spellId]: 0 },
  };
  newState = mnAddXp(newState, xpReward);
  return { ...newState, totalScore: newState.totalScore + scoreReward };
}

export function mnForgetSpell(state: ManaNexusState, spellId: string): ManaNexusState {
  if (!mnHasSpell(state, spellId)) return state;
  const newMastery = { ...state.spellMastery };
  delete newMastery[spellId];
  return {
    ...state,
    knownSpells: state.knownSpells.filter(id => id !== spellId),
    spellMastery: newMastery,
  };
}

export function mnGetSpellsBySchool(school: SpellSchool): SpellDef[] {
  return SPELLS.filter(s => s.school === school);
}

export function mnGetSpellsByElement(element: ManaType): SpellDef[] {
  return SPELLS.filter(s => s.element === element);
}

export function mnGetSpellPower(state: ManaNexusState, spellId: string): number {
  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return 0;

  const masteryBonus = 1 + (mnGetMasteryLevel(state, spellId) / 200);
  const familiarBonus = 1 + mnGetFamiliarBonusByType(state, 'spell_power') / 100;
  const enchantmentBonus = 1 + mnGetEnchantmentPowerBoost(state, spellId) / 100;
  const craftingBonus = 1 + ((state.nexusCore.levels.crafting || 1) - 1) * 0.02;

  return Math.floor(
    spellDef.power * masteryBonus * familiarBonus * enchantmentBonus * craftingBonus
  );
}

export function mnGetSpellCost(state: ManaNexusState, spellId: string): Record<ManaType, number> {
  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return { ...ZERO_MANA };

  const costReduction = mnGetEnchantmentCostReduction(state, spellId) / 100;
  const masteryCostReduction = mnGetMasteryLevel(state, spellId) / 500;
  const totalReduction = Math.min(costReduction + masteryCostReduction, 0.5);

  const result: Record<ManaType, number> = { ...ZERO_MANA };
  for (const type of MANA_TYPES) {
    result[type] = Math.max(0, Math.floor(spellDef.manaCost[type] * (1 - totalReduction)));
  }
  return result;
}

export function mnGetSpellCooldown(state: ManaNexusState, spellId: string): number {
  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return 0;
  const cooldownReduction = mnGetEnchantmentCooldownReduction(state, spellId) / 100;
  return Math.max(1, Math.floor(spellDef.cooldown * (1 - cooldownReduction)));
}

export function mnCanCastSpell(state: ManaNexusState, spellId: string): boolean {
  if (!mnHasSpell(state, spellId)) return false;
  const cost = mnGetSpellCost(state, spellId);
  return mnIsManaSufficient(state, cost);
}

export function mnCastSpell(state: ManaNexusState, spellId: string, targetEnemyId?: string): ManaNexusState {
  if (!mnCanCastSpell(state, spellId)) return state;

  const cost = mnGetSpellCost(state, spellId);
  const power = mnGetSpellPower(state, spellId);
  let newState = mnSpendMana(state, cost);

  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return state;

  // Apply damage to enemies if defense is active
  if (newState.defenseActive && newState.currentEnemies.length > 0) {
    let updatedEnemies = [...newState.currentEnemies];
    let totalDamage = 0;

    for (let i = 0; i < updatedEnemies.length; i++) {
      const enemy = updatedEnemies[i];
      const enemyDef = mnGetEnemyDef(enemy.enemyType);
      if (!enemyDef) continue;

      let damage = power;
      // Apply weakness/resistance
      if (enemyDef.weakness.includes(spellDef.element)) {
        damage = Math.floor(damage * 1.75);
      } else if (enemyDef.resistance.includes(spellDef.element)) {
        damage = Math.floor(damage * 0.5);
      }

      // Apply defense reduction
      damage = Math.max(1, damage - enemyDef.defense);

      // If specific target, only damage that enemy
      if (targetEnemyId && enemy.id !== targetEnemyId) continue;

      totalDamage += damage;
      const newHp = Math.max(0, enemy.currentHp - damage);
      updatedEnemies[i] = { ...enemy, currentHp: newHp };

      if (newHp <= 0) {
        totalDamage += 0; // already counted
      }
    }

    // Remove defeated enemies and award loot
    const defeated = updatedEnemies.filter(e => e.currentHp <= 0);
    const surviving = updatedEnemies.filter(e => e.currentHp > 0);
    let lootXp = 0;
    let lootScore = 0;
    const lootMana: Partial<Record<ManaType, number>> = {};

    for (const defEnemy of defeated) {
      const def = mnGetEnemyDef(defEnemy.enemyType);
      if (!def) continue;
      lootXp += def.loot.xp;
      lootScore += def.loot.score;
      for (const type of MANA_TYPES) {
        if (def.loot.mana[type]) {
          lootMana[type] = (lootMana[type] || 0) + def.loot.mana[type]!;
        }
      }
    }

    newState = {
      ...newState,
      currentEnemies: surviving,
      enemiesDefeated: newState.enemiesDefeated + defeated.length,
      totalEnemiesDefeated: newState.totalEnemiesDefeated + defeated.length,
      totalDamageDealt: newState.totalDamageDealt + totalDamage,
    };

    newState = mnAddXp(newState, lootXp);
    newState = { ...newState, totalScore: newState.totalScore + lootScore };
    newState = mnCollectMultiMana(newState, lootMana);
  }

  // Apply healing spells
  if (spellDef.element === 'water' && spellDef.school === 'hydromancy' && spellDef.id === 'healing_rain') {
    const healAmount = power;
    newState = { ...newState, totalHealingDone: newState.totalHealingDone + healAmount };
  }

  // Enchantment heal-on-cast
  const healOnCast = mnGetEnchantmentHealOnCast(state, spellId);
  if (healOnCast > 0 && newState.totalDamageDealt > 0) {
    newState = { ...newState, totalHealingDone: newState.totalHealingDone + healOnCast };
  }

  // Practice mastery
  newState = mnPracticeSpell(newState, spellId);

  // Check wave completion
  if (newState.defenseActive && newState.currentEnemies.length === 0 && newState.defenseWave > 0) {
    newState = mnCompleteWave(newState);
  }

  return {
    ...newState,
    totalSpellsCast: newState.totalSpellsCast + 1,
  };
}

export function mnGetSpellInfo(state: ManaNexusState, spellId: string): {
  spell: SpellDef | undefined;
  known: boolean;
  power: number;
  cost: Record<ManaType, number>;
  cooldown: number;
  canCast: boolean;
  mastery: number;
} {
  const spell = mnGetSpellDef(spellId);
  return {
    spell,
    known: mnHasSpell(state, spellId),
    power: mnGetSpellPower(state, spellId),
    cost: mnGetSpellCost(state, spellId),
    cooldown: mnGetSpellCooldown(state, spellId),
    canCast: mnCanCastSpell(state, spellId),
    mastery: mnGetMasteryLevel(state, spellId),
  };
}

// ============================================================
// Named Export Functions: Spell Crafting System
// ============================================================

export function mnGetCraftingRecipes(): CraftingRecipe[] {
  return [...CRAFTING_RECIPES];
}

export function mnGetCraftingRecipe(spellId: string): CraftingRecipe | undefined {
  return CRAFTING_RECIPES.find(r => r.spellId === spellId);
}

export function mnCanCraftScroll(state: ManaNexusState, spellId: string): boolean {
  const recipe = mnGetCraftingRecipe(spellId);
  if (!recipe) return false;
  const scaledCost = scaleCostByCraftingCore(recipe.ingredients, state.nexusCore.levels.crafting || 1);
  return canAffordMana(state.mana, scaledCost);
}

export function mnCraftScroll(state: ManaNexusState, spellId: string): ManaNexusState {
  if (!mnCanCraftScroll(state, spellId)) return state;
  const recipe = mnGetCraftingRecipe(spellId);
  if (!recipe) return state;

  const scaledCost = scaleCostByCraftingCore(recipe.ingredients, state.nexusCore.levels.crafting || 1);
  const coreBonus = (state.nexusCore.levels.crafting || 1) - 1;
  const extraCharges = Math.floor(coreBonus / 3);
  const extraPower = coreBonus * 0.02;

  const scroll: SpellScroll = {
    id: generateId(),
    spellId: spellId,
    charges: recipe.scrollCharges + extraCharges,
    powerMultiplier: recipe.powerMultiplier + extraPower,
    createdAt: Date.now(),
    enchantments: [],
  };

  let newState = mnSpendMana(state, scaledCost);
  newState = {
    ...newState,
    craftedScrolls: [...newState.craftedScrolls, scroll],
    totalScrollsCrafted: newState.totalScrollsCrafted + 1,
  };
  newState = mnAddXp(newState, 15);
  return { ...newState, totalScore: newState.totalScore + 30 };
}

export function mnGetCraftedScrolls(state: ManaNexusState): SpellScroll[] {
  return [...state.craftedScrolls];
}

export function mnGetScrollById(state: ManaNexusState, scrollId: string): SpellScroll | undefined {
  return state.craftedScrolls.find(s => s.id === scrollId);
}

export function mnUseScroll(state: ManaNexusState, scrollId: string): ManaNexusState {
  const scrollIndex = state.craftedScrolls.findIndex(s => s.id === scrollId);
  if (scrollIndex === -1) return state;
  const scroll = state.craftedScrolls[scrollIndex];
  if (scroll.charges <= 0) return state;

  const spellDef = mnGetSpellDef(scroll.spellId);
  if (!spellDef) return state;

  const scaledPower = Math.floor(spellDef.power * scroll.powerMultiplier);
  const updatedScroll = { ...scroll, charges: scroll.charges - 1 };
  const newScrolls = [...state.craftedScrolls];
  newScrolls[scrollIndex] = updatedScroll;

  // Remove depleted scrolls
  const filteredScrolls = newScrolls.filter(s => s.charges > 0);

  let newState: ManaNexusState = { ...state, craftedScrolls: filteredScrolls };

  // Apply scroll power as damage to current enemies
  if (newState.defenseActive && newState.currentEnemies.length > 0) {
    let updatedEnemies = [...newState.currentEnemies];
    for (let i = 0; i < updatedEnemies.length; i++) {
      const enemy = updatedEnemies[i];
      const enemyDef = mnGetEnemyDef(enemy.enemyType);
      if (!enemyDef) continue;
      let damage = scaledPower;
      if (enemyDef.weakness.includes(spellDef.element)) damage = Math.floor(damage * 1.75);
      else if (enemyDef.resistance.includes(spellDef.element)) damage = Math.floor(damage * 0.5);
      damage = Math.max(1, damage - enemyDef.defense);
      const newHp = Math.max(0, enemy.currentHp - damage);
      updatedEnemies[i] = { ...enemy, currentHp: newHp };
    }

    const defeated = updatedEnemies.filter(e => e.currentHp <= 0);
    const surviving = updatedEnemies.filter(e => e.currentHp > 0);
    let lootXp = 0;
    let lootScore = 0;
    const lootMana: Partial<Record<ManaType, number>> = {};
    for (const defEnemy of defeated) {
      const def = mnGetEnemyDef(defEnemy.enemyType);
      if (!def) continue;
      lootXp += def.loot.xp;
      lootScore += def.loot.score;
      for (const type of MANA_TYPES) {
        if (def.loot.mana[type]) lootMana[type] = (lootMana[type] || 0) + def.loot.mana[type]!;
      }
    }

    newState = {
      ...newState,
      currentEnemies: surviving,
      enemiesDefeated: newState.enemiesDefeated + defeated.length,
      totalEnemiesDefeated: newState.totalEnemiesDefeated + defeated.length,
      totalDamageDealt: newState.totalDamageDealt + scaledPower,
    };
    newState = mnAddXp(newState, lootXp);
    newState = { ...newState, totalScore: newState.totalScore + lootScore };
    newState = mnCollectMultiMana(newState, lootMana);

    if (surviving.length === 0 && newState.defenseActive && newState.defenseWave > 0) {
      newState = mnCompleteWave(newState);
    }
  }

  return newState;
}

// ============================================================
// Named Export Functions: Nexus Core System
// ============================================================

export function mnGetNexusCore(state: ManaNexusState): NexusCoreState {
  return { ...state.nexusCore, levels: { ...state.nexusCore.levels } };
}

export function mnGetCoreLevel(state: ManaNexusState, coreType: CoreType): number {
  return state.nexusCore.levels[coreType] || 1;
}

export function mnGetCoreDef(coreType: CoreType): CoreDef | undefined {
  return CORE_DEFS.find(c => c.type === coreType);
}

export function mnGetCoreUpgradeCost(state: ManaNexusState, coreType: CoreType): number {
  const coreDef = mnGetCoreDef(coreType);
  if (!coreDef) return Infinity;
  const currentLevel = mnGetCoreLevel(state, coreType);
  if (currentLevel >= coreDef.maxLevel) return Infinity;
  return Math.floor(coreDef.baseUpgradeCost * Math.pow(1.5, currentLevel - 1));
}

export function mnCanUpgradeCore(state: ManaNexusState, coreType: CoreType): boolean {
  const cost = mnGetCoreUpgradeCost(state, coreType);
  const arcaneMana = state.mana.arcane || 0;
  return arcaneMana >= cost;
}

export function mnUpgradeCore(state: ManaNexusState, coreType: CoreType): ManaNexusState {
  if (!mnCanUpgradeCore(state, coreType)) return state;
  const cost = mnGetCoreUpgradeCost(state, coreType);
  const currentLevel = mnGetCoreLevel(state, coreType);
  const coreDef = mnGetCoreDef(coreType);
  if (!coreDef || currentLevel >= coreDef.maxLevel) return state;

  const newLevels = { ...state.nexusCore.levels, [coreType]: currentLevel + 1 };
  let newState: ManaNexusState = {
    ...state,
    nexusCore: { ...state.nexusCore, levels: newLevels },
    mana: { ...state.mana, arcane: state.mana.arcane - cost },
  };

  // Recalculate capacity and regen based on new core levels
  if (coreType === 'mana') {
    newState = { ...newState, manaCapacity: mnRecalculateManaCapacity(newState, newState.level) };
  }
  if (coreType === 'regen') {
    newState = { ...newState, manaRegen: mnRecalculateManaRegen(newState, newState.level) };
  }

  newState = mnAddXp(newState, 50);
  return { ...newState, totalScore: newState.totalScore + 100 };
}

export function mnGetCoreMaxLevel(coreType: CoreType): number {
  const def = mnGetCoreDef(coreType);
  return def ? def.maxLevel : 10;
}

export function mnGetCoreBonus(state: ManaNexusState, coreType: CoreType): number {
  const def = mnGetCoreDef(coreType);
  const level = mnGetCoreLevel(state, coreType);
  if (!def) return 0;
  return (level - 1) * def.bonusPerLevel;
}

export function mnGetAllCoreBonuses(state: ManaNexusState): Record<CoreType, number> {
  const result: Record<CoreType, number> = { mana: 0, defense: 0, crafting: 0, mastery: 0, regen: 0 };
  for (const type of CORE_DEFS.map(c => c.type)) {
    result[type] = mnGetCoreBonus(state, type);
  }
  return result;
}

// ============================================================
// Named Export Functions: Enemy System
// ============================================================

export function mnGetEnemyDef(enemyType: EnemyType): EnemyDef | undefined {
  return ENEMIES.find(e => e.id === enemyType);
}

export function mnGetAllEnemyDefs(): EnemyDef[] {
  return [...ENEMIES];
}

export function mnGetEnemyWeakness(enemyType: EnemyType): ManaType[] {
  const def = mnGetEnemyDef(enemyType);
  return def ? [...def.weakness] : [];
}

export function mnGetEnemyResistance(enemyType: EnemyType): ManaType[] {
  const def = mnGetEnemyDef(enemyType);
  return def ? [...def.resistance] : [];
}

export function mnGetEnemyHP(state: ManaNexusState, enemyInstanceId: string): number {
  const enemy = state.currentEnemies.find(e => e.id === enemyInstanceId);
  return enemy ? enemy.currentHp : 0;
}

export function mnGetEnemyMaxHP(state: ManaNexusState, enemyInstanceId: string): number {
  const enemy = state.currentEnemies.find(e => e.id === enemyInstanceId);
  return enemy ? enemy.maxHp : 0;
}

export function mnGetEnemyHPPercent(state: ManaNexusState, enemyInstanceId: string): number {
  const enemy = state.currentEnemies.find(e => e.id === enemyInstanceId);
  if (!enemy || enemy.maxHp <= 0) return 0;
  return clampValue(enemy.currentHp / enemy.maxHp, 0, 1);
}

export function mnGetEnemyLoot(enemyType: EnemyType): { xp: number; score: number; mana: Partial<Record<ManaType, number>> } | undefined {
  const def = mnGetEnemyDef(enemyType);
  return def ? { ...def.loot, mana: { ...def.loot.mana } } : undefined;
}

export function mnCalculateDamage(
  basePower: number,
  spellElement: ManaType,
  enemyType: EnemyType
): number {
  const def = mnGetEnemyDef(enemyType);
  if (!def) return basePower;
  let damage = basePower;
  if (def.weakness.includes(spellElement)) {
    damage = Math.floor(damage * 1.75);
  } else if (def.resistance.includes(spellElement)) {
    damage = Math.floor(damage * 0.5);
  }
  return Math.max(1, damage - def.defense);
}

export function mnIsEnemyDefeated(state: ManaNexusState, enemyInstanceId: string): boolean {
  const enemy = state.currentEnemies.find(e => e.id === enemyInstanceId);
  if (!enemy) return true;
  return enemy.currentHp <= 0;
}

export function mnGetBestSpellForEnemy(state: ManaNexusState, enemyType: EnemyType): SpellDef | undefined {
  const weaknesses = mnGetEnemyWeakness(enemyType);
  const knownSpells = mnGetKnownSpells(state);
  let bestSpell: SpellDef | undefined;
  let bestPower = 0;

  for (const spellId of knownSpells) {
    const spell = mnGetSpellDef(spellId);
    if (!spell) continue;
    let power = mnGetSpellPower(state, spellId);
    if (weaknesses.includes(spell.element)) {
      power = Math.floor(power * 1.75);
    }
    if (power > bestPower) {
      bestPower = power;
      bestSpell = spell;
    }
  }
  return bestSpell;
}

// ============================================================
// Named Export Functions: Defense System
// ============================================================

export function mnGetDefenseWave(state: ManaNexusState): number {
  return state.defenseWave;
}

export function mnGetDefenseCycle(state: ManaNexusState): number {
  return state.defenseCycle;
}

export function mnGetHighestWave(state: ManaNexusState): number {
  return state.highestWaveReached;
}

export function mnIsDefenseActive(state: ManaNexusState): boolean {
  return state.defenseActive;
}

export function mnGetCurrentEnemies(state: ManaNexusState): EnemyInstance[] {
  return [...state.currentEnemies];
}

export function mnStartDefense(state: ManaNexusState): ManaNexusState {
  if (state.defenseActive) return state;
  return {
    ...state,
    defenseActive: true,
    defenseWave: 1,
    currentEnemies: mnSpawnWaveEnemies(state, 1),
  };
}

export function mnSpawnWaveEnemies(state: ManaNexusState, wave: number): EnemyInstance[] {
  const config = WAVE_CONFIGS.find(w => w.wave === wave);
  if (!config) return [];

  const enemies: EnemyInstance[] = [];
  for (const entry of config.enemies) {
    const def = mnGetEnemyDef(entry.type);
    if (!def) continue;
    for (let i = 0; i < entry.count; i++) {
      enemies.push({
        id: generateId(),
        enemyType: entry.type,
        currentHp: Math.floor(def.baseHp * entry.hpMultiplier),
        maxHp: Math.floor(def.baseHp * entry.hpMultiplier),
        wave,
        debuffs: [],
      });
    }
  }
  return enemies;
}

export function mnGetWaveConfig(wave: number): WaveConfig | undefined {
  return WAVE_CONFIGS.find(w => w.wave === wave);
}

export function mnAdvanceWave(state: ManaNexusState): ManaNexusState {
  if (!state.defenseActive) return state;
  const nextWave = state.defenseWave + 1;
  if (nextWave > 20) {
    return mnCompleteCycle(state);
  }
  return {
    ...state,
    defenseWave: nextWave,
    currentEnemies: mnSpawnWaveEnemies(state, nextWave),
    highestWaveReached: Math.max(state.highestWaveReached, nextWave),
  };
}

export function mnCompleteWave(state: ManaNexusState): ManaNexusState {
  const waveConfig = mnGetWaveConfig(state.defenseWave);
  if (!waveConfig) return state;

  let newState = mnCollectMultiMana(state, waveConfig.bonusMana);
  newState = mnAddXp(newState, state.defenseWave * 10);
  newState = { ...newState, totalScore: newState.totalScore + state.defenseWave * 25 };

  if (state.defenseWave >= 20) {
    return mnCompleteCycle(newState);
  }

  return mnAdvanceWave(newState);
}

export function mnCompleteCycle(state: ManaNexusState): ManaNexusState {
  let newState = {
    ...state,
    defenseActive: false,
    defenseWave: 0,
    defenseCycle: state.defenseCycle + 1,
    totalCyclesCompleted: state.totalCyclesCompleted + 1,
    currentEnemies: [],
  };
  newState = mnAddXp(newState, 500);
  newState = { ...newState, totalScore: newState.totalScore + 2000 };
  newState = mnRefillAllMana(newState);
  return newState;
}

export function mnEndDefense(state: ManaNexusState): ManaNexusState {
  return {
    ...state,
    defenseActive: false,
    defenseWave: 0,
    currentEnemies: [],
  };
}

export function mnGetWaveReward(wave: number): Partial<Record<ManaType, number>> {
  const config = mnGetWaveConfig(wave);
  return config ? { ...config.bonusMana } : {};
}

export function mnGetTotalEnemiesInWave(wave: number): number {
  const config = mnGetWaveConfig(wave);
  if (!config) return 0;
  return config.enemies.reduce((sum, e) => sum + e.count, 0);
}

export function mnGetDefenseProgress(state: ManaNexusState): number {
  if (!state.defenseActive) return 0;
  return state.defenseWave / 20;
}

// ============================================================
// Named Export Functions: Daily Defense Challenge
// ============================================================

export function mnIsDailyCompleted(state: ManaNexusState): boolean {
  return state.dailyDefenseCompleted;
}

export function mnCompleteDailyDefense(state: ManaNexusState): ManaNexusState {
  if (state.dailyDefenseCompleted) return state;
  let newState = { ...state, dailyDefenseCompleted: true };
  newState = mnAddXp(newState, 200);
  newState = { ...newState, totalScore: newState.totalScore + 500 };
  newState = mnIncrementStreak(newState);
  return newState;
}

export function mnResetDailyDefense(state: ManaNexusState): ManaNexusState {
  return { ...state, dailyDefenseCompleted: false };
}

export function mnCheckDailyReset(state: ManaNexusState): ManaNexusState {
  const now = Date.now();
  const lastReset = state.lastDailyTimestamp;
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (lastReset === 0 || now - lastReset >= oneDayMs) {
    const newState = mnResetDailyDefense(state);
    if (state.dailyDefenseCompleted) {
      return { ...newState, streak: newState.streak, lastDailyTimestamp: now };
    }
    return { ...newState, lastDailyTimestamp: now, streak: 0 };
  }
  return state;
}

// ============================================================
// Named Export Functions: Familiar System
// ============================================================

export function mnGetFamiliarDefs(): FamiliarDef[] {
  return [...FAMILIAR_DEFS];
}

export function mnGetFamiliarDef(familiarDefId: string): FamiliarDef | undefined {
  return FAMILIAR_DEFS.find(f => f.id === familiarDefId);
}

export function mnGetFamiliars(state: ManaNexusState): Familiar[] {
  return [...state.familiars];
}

export function mnGetActiveFamiliars(state: ManaNexusState): Familiar[] {
  return state.familiars.filter(f => f.active);
}

export function mnCanSummonFamiliar(state: ManaNexusState, familiarDefId: string): boolean {
  if (state.familiars.find(f => f.familiarDefId === familiarDefId)) return false;
  const def = mnGetFamiliarDef(familiarDefId);
  if (!def) return false;
  return canAffordMana(state.mana, def.summonCost);
}

export function mnSummonFamiliar(state: ManaNexusState, familiarDefId: string): ManaNexusState {
  if (!mnCanSummonFamiliar(state, familiarDefId)) return state;
  const def = mnGetFamiliarDef(familiarDefId);
  if (!def) return state;

  const familiar: Familiar = {
    id: generateId(),
    familiarDefId,
    level: 1,
    xp: 0,
    active: true,
  };

  let newState: ManaNexusState = {
    ...state,
    familiars: [...state.familiars, familiar],
    mana: applyManaCost(state.mana, def.summonCost),
  };
  newState = mnAddXp(newState, 75);
  return { ...newState, totalScore: newState.totalScore + 150 };
}

export function mnLevelUpFamiliar(state: ManaNexusState, familiarId: string): ManaNexusState {
  const index = state.familiars.findIndex(f => f.id === familiarId);
  if (index === -1) return state;
  const familiar = state.familiars[index];
  const def = mnGetFamiliarDef(familiar.familiarDefId);
  if (!def || familiar.level >= def.maxLevel) return state;

  const xpToNext = mnGetFamiliarXpToNext(familiar.level);
  if (familiar.xp < xpToNext) return state;

  const newFamiliar = { ...familiar, level: familiar.level + 1, xp: familiar.xp - xpToNext };
  const newFamiliars = [...state.familiars];
  newFamiliars[index] = newFamiliar;

  return { ...state, familiars: newFamiliars };
}

export function mnGetFamiliarXpToNext(level: number): number {
  return 50 + level * 30;
}

export function mnAddFamiliarXp(state: ManaNexusState, familiarId: string, amount: number): ManaNexusState {
  const index = state.familiars.findIndex(f => f.id === familiarId);
  if (index === -1) return state;
  const familiar = state.familiars[index];
  const newFamiliar = { ...familiar, xp: familiar.xp + amount };
  const newFamiliars = [...state.familiars];
  newFamiliars[index] = newFamiliar;

  let newState = { ...state, familiars: newFamiliars };

  // Auto level up if enough XP
  const def = mnGetFamiliarDef(familiar.familiarDefId);
  if (def) {
    while (newFamiliar.level < def.maxLevel) {
      const needed = mnGetFamiliarXpToNext(newFamiliar.level);
      if (newFamiliar.xp >= needed) {
        newFamiliar.level += 1;
        newFamiliar.xp -= needed;
      } else {
        break;
      }
    }
    const finalFamiliars = [...newState.familiars];
    finalFamiliars[index] = newFamiliar;
    newState = { ...newState, familiars: finalFamiliars };
  }

  return newState;
}

export function mnDismissFamiliar(state: ManaNexusState, familiarId: string): ManaNexusState {
  return {
    ...state,
    familiars: state.familiars.filter(f => f.id !== familiarId),
  };
}

export function mnToggleFamiliarActive(state: ManaNexusState, familiarId: string): ManaNexusState {
  const index = state.familiars.findIndex(f => f.id === familiarId);
  if (index === -1) return state;
  const familiar = state.familiars[index];
  const newFamiliars = [...state.familiars];
  newFamiliars[index] = { ...familiar, active: !familiar.active };
  return { ...state, familiars: newFamiliars };
}

export function mnGetFamiliarBonus(state: ManaNexusState, familiarId: string): number {
  const familiar = state.familiars.find(f => f.id === familiarId);
  if (!familiar || !familiar.active) return 0;
  const def = mnGetFamiliarDef(familiar.familiarDefId);
  if (!def) return 0;
  return Math.floor(def.baseBonus * (1 + (familiar.level - 1) * 0.25));
}

export function mnGetFamiliarBonusByType(state: ManaNexusState, bonusType: string): number {
  let total = 0;
  for (const familiar of state.familiars) {
    if (!familiar.active) continue;
    const def = mnGetFamiliarDef(familiar.familiarDefId);
    if (!def || def.bonusType !== bonusType) continue;
    total += Math.floor(def.baseBonus * (1 + (familiar.level - 1) * 0.25));
  }
  return total;
}

// ============================================================
// Named Export Functions: Enchantment System
// ============================================================

export function mnGetEnchantmentDefs(): EnchantmentDef[] {
  return [...ENCHANTMENT_DEFS];
}

export function mnGetEnchantmentDef(enchantmentDefId: string): EnchantmentDef | undefined {
  return ENCHANTMENT_DEFS.find(e => e.id === enchantmentDefId);
}

export function mnGetEnchantments(state: ManaNexusState): EnchantmentInstance[] {
  return [...state.enchantments];
}

export function mnGetSpellEnchantments(state: ManaNexusState, spellId: string): EnchantmentInstance[] {
  return state.enchantments.filter(e => e.spellId === spellId);
}

export function mnCanEnchant(state: ManaNexusState, enchantmentDefId: string, spellId: string): boolean {
  const def = mnGetEnchantmentDef(enchantmentDefId);
  if (!def) return false;
  if (!mnHasSpell(state, spellId)) return false;
  // Limit 3 enchantments per spell
  if (mnGetSpellEnchantments(state, spellId).length >= 3) return false;
  return canAffordMana(state.mana, def.manaCost);
}

export function mnEnchant(state: ManaNexusState, enchantmentDefId: string, spellId: string): ManaNexusState {
  if (!mnCanEnchant(state, enchantmentDefId, spellId)) return state;
  const def = mnGetEnchantmentDef(enchantmentDefId);
  if (!def) return state;

  const enchantment: EnchantmentInstance = {
    id: generateId(),
    enchantmentDefId,
    spellId,
    appliedAt: Date.now(),
  };

  let newState: ManaNexusState = {
    ...state,
    enchantments: [...state.enchantments, enchantment],
    mana: applyManaCost(state.mana, def.manaCost),
  };
  newState = mnAddXp(newState, 40);
  return { ...newState, totalScore: newState.totalScore + 80 };
}

export function mnRemoveEnchantment(state: ManaNexusState, enchantmentId: string): ManaNexusState {
  return {
    ...state,
    enchantments: state.enchantments.filter(e => e.id !== enchantmentId),
  };
}

export function mnGetEnchantmentPowerBoost(state: ManaNexusState, spellId: string): number {
  const spellDef = mnGetSpellDef(spellId);
  if (!spellDef) return 0;
  let boost = 0;
  for (const ench of state.enchantments) {
    if (ench.spellId !== spellId) continue;
    const def = mnGetEnchantmentDef(ench.enchantmentDefId);
    if (!def) continue;
    if (def.effectType === 'power_boost' && def.id.includes(spellDef.element)) {
      boost += def.value;
    }
  }
  return boost;
}

export function mnGetEnchantmentCostReduction(state: ManaNexusState, spellId: string): number {
  let reduction = 0;
  for (const ench of state.enchantments) {
    if (ench.spellId !== spellId) continue;
    const def = mnGetEnchantmentDef(ench.enchantmentDefId);
    if (!def) continue;
    if (def.effectType === 'cost_reduce') reduction += def.value;
  }
  return Math.min(reduction, 50);
}

export function mnGetEnchantmentCooldownReduction(state: ManaNexusState, spellId: string): number {
  let reduction = 0;
  for (const ench of state.enchantments) {
    if (ench.spellId !== spellId) continue;
    const def = mnGetEnchantmentDef(ench.enchantmentDefId);
    if (!def) continue;
    if (def.effectType === 'cooldown_reduce') reduction += def.value;
  }
  return Math.min(reduction, 50);
}

export function mnGetEnchantmentHealOnCast(state: ManaNexusState, spellId: string): number {
  let healPercent = 0;
  for (const ench of state.enchantments) {
    if (ench.spellId !== spellId) continue;
    const def = mnGetEnchantmentDef(ench.enchantmentDefId);
    if (!def) continue;
    if (def.effectType === 'heal_on_cast') healPercent += def.value;
  }
  return Math.min(healPercent, 50);
}

// ============================================================
// Named Export Functions: Realm Exploration System
// ============================================================

export function mnGetRealmDefs(): RealmDef[] {
  return [...REALM_DEFS];
}

export function mnGetRealmDef(realmId: RealmId): RealmDef | undefined {
  return REALM_DEFS.find(r => r.id === realmId);
}

export function mnGetRealmState(state: ManaNexusState, realmId: RealmId): RealmState {
  return state.realmExploration[realmId] || {
    unlocked: false, explored: false, crystalsCollected: 0, totalCrystals: 0, lastExplored: 0, explorationCount: 0,
  };
}

export function mnUnlockRealm(state: ManaNexusState, realmId: RealmId): ManaNexusState {
  const def = mnGetRealmDef(realmId);
  if (!def) return state;
  if (state.level < def.unlockLevel) return state;
  const realmState = state.realmExploration[realmId];
  if (realmState?.unlocked) return state;

  return {
    ...state,
    realmExploration: {
      ...state.realmExploration,
      [realmId]: {
        unlocked: true,
        explored: false,
        crystalsCollected: 0,
        totalCrystals: def.baseCrystals,
        lastExplored: 0,
        explorationCount: 0,
      },
    },
  };
}

export function mnCanExploreRealm(state: ManaNexusState, realmId: RealmId): boolean {
  const realmState = mnGetRealmState(state, realmId);
  if (!realmState.unlocked) return false;
  const def = mnGetRealmDef(realmId);
  if (!def) return false;
  // Need at least 10 of the realm's element mana to explore
  return (state.mana[def.element] || 0) >= 10;
}

export function mnExploreRealm(state: ManaNexusState, realmId: RealmId): ManaNexusState {
  if (!mnCanExploreRealm(state, realmId)) return state;
  const def = mnGetRealmDef(realmId);
  if (!def) return state;

  const lootBoost = mnGetFamiliarBonusByType(state, 'loot_boost');
  const lootMultiplier = 1 + lootBoost / 100;
  const crystalsFound = Math.floor(def.baseCrystals * (0.5 + Math.random() * 0.5) * lootMultiplier);
  const manaFound: Partial<Record<ManaType, number>> = {};
  for (const type of MANA_TYPES) {
    if (def.manaYield[type]) {
      manaFound[type] = Math.floor(def.manaYield[type]! * (0.5 + Math.random() * 0.5) * lootMultiplier);
    }
  }

  const realmState = state.realmExploration[realmId];
  const wasExplored = realmState?.explored || false;
  const newExploredCount = (realmState?.explorationCount || 0) + 1;

  let newState: ManaNexusState = {
    ...state,
    realmExploration: {
      ...state.realmExploration,
      [realmId]: {
        unlocked: true,
        explored: true,
        crystalsCollected: (realmState?.crystalsCollected || 0) + crystalsFound,
        totalCrystals: def.baseCrystals,
        lastExplored: Date.now(),
        explorationCount: newExploredCount,
      },
    },
    mana: { ...state.mana, [def.element]: (state.mana[def.element] || 0) - 10 },
  };

  newState = mnCollectMultiMana(newState, manaFound);
  newState = mnAddXp(newState, def.dangers * 15);
  newState = { ...newState, totalScore: newState.totalScore + def.dangers * 30 };

  if (!wasExplored) {
    newState = { ...newState, totalRealmsExplored: newState.totalRealmsExplored + 1 };
  }

  return newState;
}

export function mnGetRealmCrystals(state: ManaNexusState, realmId: RealmId): number {
  const realmState = mnGetRealmState(state, realmId);
  return realmState.crystalsCollected;
}

export function mnGetTotalCrystals(state: ManaNexusState): number {
  let total = 0;
  for (const realmId of REALM_DEFS.map(r => r.id)) {
    total += mnGetRealmCrystals(state, realmId);
  }
  return total;
}

export function mnGetRealmManaYield(realmId: RealmId): Partial<Record<ManaType, number>> {
  const def = mnGetRealmDef(realmId);
  return def ? { ...def.manaYield } : {};
}

// ============================================================
// Named Export Functions: Spell Mastery System
// ============================================================

export function mnGetMasteryLevel(state: ManaNexusState, spellId: string): number {
  return state.spellMastery[spellId] || 0;
}

export function mnGetMasteryPercent(spellMastery: number): number {
  return clampValue(spellMastery / 100, 0, 1);
}

export function mnGetMasteryRank(masteryLevel: number): string {
  if (masteryLevel >= 90) return 'Grandmaster';
  if (masteryLevel >= 70) return 'Master';
  if (masteryLevel >= 50) return 'Expert';
  if (masteryLevel >= 30) return 'Adept';
  if (masteryLevel >= 15) return 'Apprentice';
  if (masteryLevel > 0) return 'Novice';
  return 'Untrained';
}

export function mnGetMasteryBonus(masteryLevel: number): { costReduction: number; powerBoost: number; cooldownReduction: number } {
  return {
    costReduction: masteryLevel * 0.2,
    powerBoost: masteryLevel * 0.5,
    cooldownReduction: masteryLevel * 0.15,
  };
}

export function mnPracticeSpell(state: ManaNexusState, spellId: string): ManaNexusState {
  if (!mnHasSpell(state, spellId)) return state;
  const currentMastery = mnGetMasteryLevel(state, spellId);
  if (currentMastery >= 100) return state;

  const masteryCoreBonus = (state.nexusCore.levels.mastery || 1) - 1;
  const baseGain = 1 + Math.floor(masteryCoreBonus * 0.3);
  const diminishing = Math.max(0.1, 1 - currentMastery / 120);
  const gain = Math.floor(baseGain * diminishing);
  const newMastery = Math.min(100, currentMastery + gain);

  return {
    ...state,
    spellMastery: { ...state.spellMastery, [spellId]: newMastery },
  };
}

export function mnGetMasteryProgress(state: ManaNexusState, spellId: string): { current: number; max: number; rank: string; bonus: ReturnType<typeof mnGetMasteryBonus> } {
  const current = mnGetMasteryLevel(state, spellId);
  return {
    current,
    max: 100,
    rank: mnGetMasteryRank(current),
    bonus: mnGetMasteryBonus(current),
  };
}

export function mnGetMaxMasterySpells(state: ManaNexusState): string[] {
  return Object.entries(state.spellMastery)
    .filter(([, level]) => level >= 100)
    .map(([id]) => id);
}

// ============================================================
// Named Export Functions: Achievement System
// ============================================================

export function mnGetAchievementDefs(): AchievementDef[] {
  return [...ACHIEVEMENT_DEFS];
}

export function mnGetAchievementDef(achievementId: string): AchievementDef | undefined {
  return ACHIEVEMENT_DEFS.find(a => a.id === achievementId);
}

export function mnGetAchievements(state: ManaNexusState): string[] {
  return [...state.achievements];
}

export function mnHasAchievement(state: ManaNexusState, achievementId: string): boolean {
  return state.achievements.includes(achievementId);
}

export function mnUnlockAchievement(state: ManaNexusState, achievementId: string): ManaNexusState {
  if (mnHasAchievement(state, achievementId)) return state;
  const def = mnGetAchievementDef(achievementId);
  if (!def) return state;

  let newState: ManaNexusState = {
    ...state,
    achievements: [...state.achievements, achievementId],
  };
  newState = mnAddXp(newState, def.reward.xp);
  newState = { ...newState, totalScore: newState.totalScore + def.reward.score };
  return newState;
}

export function mnCheckAllAchievements(state: ManaNexusState): ManaNexusState {
  let newState = state;

  // First Spell
  if (newState.knownSpells.length >= 1) {
    newState = mnUnlockAchievement(newState, 'first_spell');
  }
  // Spell Collector
  if (newState.knownSpells.length >= 25) {
    newState = mnUnlockAchievement(newState, 'spell_collector');
  }
  // Master Scholar
  if (newState.knownSpells.length >= 50) {
    newState = mnUnlockAchievement(newState, 'master_scholar');
  }
  // First Craft
  if (newState.totalScrollsCrafted >= 1) {
    newState = mnUnlockAchievement(newState, 'first_craft');
  }
  // Mass Producer
  if (newState.totalScrollsCrafted >= 50) {
    newState = mnUnlockAchievement(newState, 'mass_producer');
  }
  // Wave Survivor
  if (newState.highestWaveReached >= 10) {
    newState = mnUnlockAchievement(newState, 'wave_survivor');
  }
  // Nexus Champion
  if (newState.totalCyclesCompleted >= 1) {
    newState = mnUnlockAchievement(newState, 'nexus_champion');
  }
  // Streak achievements
  if (newState.streak >= 7) {
    newState = mnUnlockAchievement(newState, 'streak_7');
  }
  if (newState.streak >= 30) {
    newState = mnUnlockAchievement(newState, 'streak_30');
  }
  // Explorer
  if (newState.totalRealmsExplored >= 6) {
    newState = mnUnlockAchievement(newState, 'explorer');
  }
  // Dragon Slayer (use enemiesDefeated as proxy)
  if (newState.totalEnemiesDefeated >= 10) {
    newState = mnUnlockAchievement(newState, 'dragon_slayer');
  }
  // Familiar Master
  if (newState.familiars.length >= 12) {
    newState = mnUnlockAchievement(newState, 'familiar_master');
  }
  // Archmage
  if (newState.level >= 30) {
    newState = mnUnlockAchievement(newState, 'archmage');
  }
  // Core Maxed
  for (const coreType of CORE_DEFS.map(c => c.type)) {
    if (mnGetCoreLevel(newState, coreType) >= 10) {
      newState = mnUnlockAchievement(newState, 'core_maxed');
      break;
    }
  }
  // Daily Hero (track via streak as approximation)
  if (newState.dailyDefenseCompleted && newState.streak >= 10) {
    newState = mnUnlockAchievement(newState, 'daily_hero');
  }

  return newState;
}

export function mnGetAchievementCount(state: ManaNexusState): number {
  return state.achievements.length;
}

export function mnGetAchievementProgress(state: ManaNexusState): number {
  return clampValue(state.achievements.length / ACHIEVEMENT_DEFS.length, 0, 1);
}

// ============================================================
// Named Export Functions: Streak System
// ============================================================

export function mnGetStreak(state: ManaNexusState): number {
  return state.streak;
}

export function mnIncrementStreak(state: ManaNexusState): ManaNexusState {
  return { ...state, streak: state.streak + 1 };
}

export function mnResetStreak(state: ManaNexusState): ManaNexusState {
  return { ...state, streak: 0 };
}

// ============================================================
// Named Export Functions: Archmage System
// ============================================================

export function mnGetArchmageLevel(state: ManaNexusState): number {
  return state.level;
}

export function mnGetArchmageTitle(level: number): string {
  if (level >= 45) return 'Supreme Archmage';
  if (level >= 40) return 'Grand Archmage';
  if (level >= 35) return 'High Archmage';
  if (level >= 30) return 'Archmage';
  if (level >= 25) return 'Master Wizard';
  if (level >= 20) return 'Senior Wizard';
  if (level >= 15) return 'Wizard';
  if (level >= 10) return 'Apprentice Wizard';
  if (level >= 5) return 'Novice Wizard';
  return 'Student';
}

export function mnGetArchmageBonus(level: number): { capacityBonus: number; regenBonus: number; powerBonus: number } {
  return {
    capacityBonus: (level - 1) * 10,
    regenBonus: Math.floor((level - 1) * 0.5),
    powerBonus: Math.floor((level - 1) * 0.8),
  };
}

// ============================================================
// Named Export Functions: Utility / Analytics
// ============================================================

export function mnCalculateManaEfficiency(state: ManaNexusState): number {
  const totalCapacity = mnGetTotalManaCapacity(state);
  if (totalCapacity <= 0) return 0;
  return mnGetTotalManaValue(state) / totalCapacity;
}

export function mnGetNexusDefenseRating(state: ManaNexusState): number {
  const coreDefense = mnGetCoreBonus(state, 'defense');
  const activeFamiliars = mnGetActiveFamiliars(state).length;
  const knownSpells = state.knownSpells.length;
  const avgMastery = Object.values(state.spellMastery).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(state.spellMastery).length);
  return Math.floor(coreDefense + activeFamiliars * 10 + knownSpells * 2 + avgMastery * 0.5);
}

export function mnGetGameState(state: ManaNexusState): {
  level: number;
  title: string;
  xpProgress: number;
  totalScore: number;
  defenseRating: number;
  manaEfficiency: number;
  spellCount: number;
  familiarCount: number;
  realmCount: number;
  achievementCount: number;
  streak: number;
} {
  return {
    level: state.level,
    title: mnGetArchmageTitle(state.level),
    xpProgress: mnGetXpProgress(state),
    totalScore: state.totalScore,
    defenseRating: mnGetNexusDefenseRating(state),
    manaEfficiency: mnCalculateManaEfficiency(state),
    spellCount: state.knownSpells.length,
    familiarCount: state.familiars.length,
    realmCount: state.totalRealmsExplored,
    achievementCount: state.achievements.length,
    streak: state.streak,
  };
}

export function mnGetTotalDamageDealt(state: ManaNexusState): number {
  return state.totalDamageDealt;
}

export function mnGetTotalHealingDone(state: ManaNexusState): number {
  return state.totalHealingDone;
}

export function mnGetTotalEnemiesDefeated(state: ManaNexusState): number {
  return state.totalEnemiesDefeated;
}

export function mnGetTotalSpellsCast(state: ManaNexusState): number {
  return state.totalSpellsCast;
}

export function mnGetTotalScrollsCrafted(state: ManaNexusState): number {
  return state.totalScrollsCrafted;
}

export function mnGetTotalCyclesCompleted(state: ManaNexusState): number {
  return state.totalCyclesCompleted;
}

export function mnGetTotalManaCollected(state: ManaNexusState): number {
  return state.totalManaCollected;
}

// ============================================================
// Named Export Functions: Auto-unlock realms on level up
// ============================================================

export function mnAutoUnlockRealms(state: ManaNexusState): ManaNexusState {
  let newState = state;
  for (const realmDef of REALM_DEFS) {
    if (state.level >= realmDef.unlockLevel) {
      newState = mnUnlockRealm(newState, realmDef.id);
    }
  }
  return newState;
}

// ============================================================
// Named Export Functions: Quick Cast — cast best spell
// ============================================================

export function mnQuickCast(state: ManaNexusState): ManaNexusState {
  if (!state.defenseActive || state.currentEnemies.length === 0) return state;

  let bestSpellId: string | undefined;
  let bestEfficiency = -1;

  for (const spellId of state.knownSpells) {
    if (!mnCanCastSpell(state, spellId)) continue;
    const spellDef = mnGetSpellDef(spellId);
    if (!spellDef) continue;

    const power = mnGetSpellPower(state, spellId);
    const cost = mnGetSpellCost(state, spellId);
    const totalCost = Object.values(cost).reduce((a, b) => a + b, 0);
    if (totalCost <= 0) continue;

    const efficiency = power / totalCost;

    // Check if any enemy is weak to this spell's element
    let hasWeaknessMatch = false;
    for (const enemy of state.currentEnemies) {
      const enemyDef = mnGetEnemyDef(enemy.enemyType);
      if (enemyDef && enemyDef.weakness.includes(spellDef.element)) {
        hasWeaknessMatch = true;
        break;
      }
    }

    const adjustedEfficiency = hasWeaknessMatch ? efficiency * 1.75 : efficiency;
    if (adjustedEfficiency > bestEfficiency) {
      bestEfficiency = adjustedEfficiency;
      bestSpellId = spellId;
    }
  }

  if (!bestSpellId) return state;
  return mnCastSpell(state, bestSpellId);
}

// ============================================================
// Named Export Functions: Realm crystal → mana conversion
// ============================================================

export function mnConvertCrystalsToMana(
  state: ManaNexusState,
  realmId: RealmId,
  amount: number
): ManaNexusState {
  const realmState = mnGetRealmState(state, realmId);
  if (realmState.crystalsCollected < amount) return state;
  const def = mnGetRealmDef(realmId);
  if (!def) return state;

  const manaPerCrystal = 5;
  const manaGain = amount * manaPerCrystal;

  return {
    ...state,
    realmExploration: {
      ...state.realmExploration,
      [realmId]: { ...realmState, crystalsCollected: realmState.crystalsCollected - amount },
    },
    mana: { ...state.mana, [def.element]: Math.min(state.mana[def.element] + manaGain, state.manaCapacity[def.element]) },
  };
}

// ============================================================
// Named Export Functions: Batch actions
// ============================================================

export function mnLearnAllSpells(state: ManaNexusState): ManaNexusState {
  let newState = state;
  for (const spell of SPELLS) {
    newState = mnLearnSpell(newState, spell.id);
  }
  return newState;
}

export function mnRegenerateAllAndCheck(state: ManaNexusState): ManaNexusState {
  let newState = mnRegenerateMana(state);
  newState = mnAutoUnlockRealms(newState);
  newState = mnCheckAllAchievements(newState);
  newState = mnCheckDailyReset(newState);
  return newState;
}

// ============================================================
// Reducer & Action Types
// ============================================================

export type ManaNexusAction =
  | { type: 'ADD_XP'; payload: number }
  | { type: 'COLLECT_MANA'; payload: { manaType: ManaType; amount: number } }
  | { type: 'SPEND_MANA'; payload: Record<ManaType, number> }
  | { type: 'REFILL_MANA' }
  | { type: 'REGENERATE_MANA' }
  | { type: 'LEARN_SPELL'; payload: string }
  | { type: 'FORGET_SPELL'; payload: string }
  | { type: 'CAST_SPELL'; payload: { spellId: string; targetEnemyId?: string } }
  | { type: 'CRAFT_SCROLL'; payload: string }
  | { type: 'USE_SCROLL'; payload: string }
  | { type: 'UPGRADE_CORE'; payload: CoreType }
  | { type: 'START_DEFENSE' }
  | { type: 'END_DEFENSE' }
  | { type: 'COMPLETE_DAILY_DEFENSE' }
  | { type: 'RESET_DAILY_DEFENSE' }
  | { type: 'SUMMON_FAMILIAR'; payload: string }
  | { type: 'DISMISS_FAMILIAR'; payload: string }
  | { type: 'TOGGLE_FAMILIAR'; payload: string }
  | { type: 'LEVEL_UP_FAMILIAR'; payload: string }
  | { type: 'ADD_FAMILIAR_XP'; payload: { familiarId: string; amount: number } }
  | { type: 'ENCHANT'; payload: { enchantmentDefId: string; spellId: string } }
  | { type: 'REMOVE_ENCHANTMENT'; payload: string }
  | { type: 'EXPLORE_REALM'; payload: RealmId }
  | { type: 'CONVERT_CRYSTALS'; payload: { realmId: RealmId; amount: number } }
  | { type: 'QUICK_CAST' }
  | { type: 'LEARN_ALL_SPELLS' }
  | { type: 'TICK' }
  | { type: 'CHECK_ACHIEVEMENTS' }
  | { type: 'SET_STATE'; payload: ManaNexusState };

export function mnReducer(state: ManaNexusState, action: ManaNexusAction): ManaNexusState {
  switch (action.type) {
    case 'ADD_XP':
      return mnAddXp(state, action.payload);
    case 'COLLECT_MANA':
      return mnCollectMana(state, action.payload.manaType, action.payload.amount);
    case 'SPEND_MANA':
      return mnSpendMana(state, action.payload);
    case 'REFILL_MANA':
      return mnRefillAllMana(state);
    case 'REGENERATE_MANA':
      return mnRegenerateMana(state);
    case 'LEARN_SPELL':
      return mnLearnSpell(state, action.payload);
    case 'FORGET_SPELL':
      return mnForgettSpell(state, action.payload);
    case 'CAST_SPELL':
      return mnCastSpell(state, action.payload.spellId, action.payload.targetEnemyId);
    case 'CRAFT_SCROLL':
      return mnCraftScroll(state, action.payload);
    case 'USE_SCROLL':
      return mnUseScroll(state, action.payload);
    case 'UPGRADE_CORE':
      return mnUpgradeCore(state, action.payload);
    case 'START_DEFENSE':
      return mnStartDefense(state);
    case 'END_DEFENSE':
      return mnEndDefense(state);
    case 'COMPLETE_DAILY_DEFENSE':
      return mnCompleteDailyDefense(state);
    case 'RESET_DAILY_DEFENSE':
      return mnResetDailyDefense(state);
    case 'SUMMON_FAMILIAR':
      return mnSummonFamiliar(state, action.payload);
    case 'DISMISS_FAMILIAR':
      return mnDismissFamiliar(state, action.payload);
    case 'TOGGLE_FAMILIAR':
      return mnToggleFamiliarActive(state, action.payload);
    case 'LEVEL_UP_FAMILIAR':
      return mnLevelUpFamiliar(state, action.payload);
    case 'ADD_FAMILIAR_XP':
      return mnAddFamiliarXp(state, action.payload.familiarId, action.payload.amount);
    case 'ENCHANT':
      return mnEnchant(state, action.payload.enchantmentDefId, action.payload.spellId);
    case 'REMOVE_ENCHANTMENT':
      return mnRemoveEnchantment(state, action.payload);
    case 'EXPLORE_REALM':
      return mnExploreRealm(state, action.payload);
    case 'CONVERT_CRYSTALS':
      return mnConvertCrystalsToMana(state, action.payload.realmId, action.payload.amount);
    case 'QUICK_CAST':
      return mnQuickCast(state);
    case 'LEARN_ALL_SPELLS':
      return mnLearnAllSpells(state);
    case 'TICK':
      return mnRegenerateAllAndCheck(state);
    case 'CHECK_ACHIEVEMENTS':
      return mnCheckAllAchievements(state);
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
}

// Fix: use the correct export name
function mnForgettSpell(state: ManaNexusState, spellId: string): ManaNexusState {
  return mnForgetSpell(state, spellId);
}

// ============================================================
// Default Export Hook
// ============================================================
import { useReducer, useCallback } from 'react';

export default function useManaNexus(initialState?: ManaNexusState) {
  const [state, dispatch] = useReducer(
    mnReducer,
    initialState ?? mnCreateInitialState()
  );

  const collectMana = useCallback((manaType: ManaType, amount: number) => {
    dispatch({ type: 'COLLECT_MANA', payload: { manaType, amount } });
  }, []);

  const spendMana = useCallback((cost: Record<ManaType, number>) => {
    dispatch({ type: 'SPEND_MANA', payload: cost });
  }, []);

  const refillMana = useCallback(() => {
    dispatch({ type: 'REFILL_MANA' });
  }, []);

  const regenerateMana = useCallback(() => {
    dispatch({ type: 'REGENERATE_MANA' });
  }, []);

  const learnSpell = useCallback((spellId: string) => {
    dispatch({ type: 'LEARN_SPELL', payload: spellId });
  }, []);

  const forgetSpell = useCallback((spellId: string) => {
    dispatch({ type: 'FORGET_SPELL', payload: spellId });
  }, []);

  const castSpell = useCallback((spellId: string, targetEnemyId?: string) => {
    dispatch({ type: 'CAST_SPELL', payload: { spellId, targetEnemyId } });
  }, []);

  const craftScroll = useCallback((spellId: string) => {
    dispatch({ type: 'CRAFT_SCROLL', payload: spellId });
  }, []);

  const useScroll = useCallback((scrollId: string) => {
    dispatch({ type: 'USE_SCROLL', payload: scrollId });
  }, []);

  const upgradeCore = useCallback((coreType: CoreType) => {
    dispatch({ type: 'UPGRADE_CORE', payload: coreType });
  }, []);

  const startDefense = useCallback(() => {
    dispatch({ type: 'START_DEFENSE' });
  }, []);

  const endDefense = useCallback(() => {
    dispatch({ type: 'END_DEFENSE' });
  }, []);

  const completeDailyDefense = useCallback(() => {
    dispatch({ type: 'COMPLETE_DAILY_DEFENSE' });
  }, []);

  const resetDailyDefense = useCallback(() => {
    dispatch({ type: 'RESET_DAILY_DEFENSE' });
  }, []);

  const summonFamiliar = useCallback((familiarDefId: string) => {
    dispatch({ type: 'SUMMON_FAMILIAR', payload: familiarDefId });
  }, []);

  const dismissFamiliar = useCallback((familiarId: string) => {
    dispatch({ type: 'DISMISS_FAMILIAR', payload: familiarId });
  }, []);

  const toggleFamiliar = useCallback((familiarId: string) => {
    dispatch({ type: 'TOGGLE_FAMILIAR', payload: familiarId });
  }, []);

  const levelUpFamiliar = useCallback((familiarId: string) => {
    dispatch({ type: 'LEVEL_UP_FAMILIAR', payload: familiarId });
  }, []);

  const addFamiliarXp = useCallback((familiarId: string, amount: number) => {
    dispatch({ type: 'ADD_FAMILIAR_XP', payload: { familiarId, amount } });
  }, []);

  const enchant = useCallback((enchantmentDefId: string, spellId: string) => {
    dispatch({ type: 'ENCHANT', payload: { enchantmentDefId, spellId } });
  }, []);

  const removeEnchantment = useCallback((enchantmentId: string) => {
    dispatch({ type: 'REMOVE_ENCHANTMENT', payload: enchantmentId });
  }, []);

  const exploreRealm = useCallback((realmId: RealmId) => {
    dispatch({ type: 'EXPLORE_REALM', payload: realmId });
  }, []);

  const convertCrystals = useCallback((realmId: RealmId, amount: number) => {
    dispatch({ type: 'CONVERT_CRYSTALS', payload: { realmId, amount } });
  }, []);

  const quickCast = useCallback(() => {
    dispatch({ type: 'QUICK_CAST' });
  }, []);

  const learnAllSpells = useCallback(() => {
    dispatch({ type: 'LEARN_ALL_SPELLS' });
  }, []);

  const tick = useCallback(() => {
    dispatch({ type: 'TICK' });
  }, []);

  const checkAchievements = useCallback(() => {
    dispatch({ type: 'CHECK_ACHIEVEMENTS' });
  }, []);

  const addXp = useCallback((amount: number) => {
    dispatch({ type: 'ADD_XP', payload: amount });
  }, []);

  const setState = useCallback((newState: ManaNexusState) => {
    dispatch({ type: 'SET_STATE', payload: newState });
  }, []);

  // Direct getter calls (no useMemo)
  return {
    state,
    // Actions
    collectMana,
    spendMana,
    refillMana,
    regenerateMana,
    learnSpell,
    forgetSpell,
    castSpell,
    craftScroll,
    useScroll,
    upgradeCore,
    startDefense,
    endDefense,
    completeDailyDefense,
    resetDailyDefense,
    summonFamiliar,
    dismissFamiliar,
    toggleFamiliar,
    levelUpFamiliar,
    addFamiliarXp,
    enchant,
    removeEnchantment,
    exploreRealm,
    convertCrystals,
    quickCast,
    learnAllSpells,
    tick,
    checkAchievements,
    addXp,
    setState,
    // Getters (direct function calls)
    getLevel: () => mnGetLevel(state),
    getXp: () => mnGetXp(state),
    getXpToNext: () => mnGetXpToNext(state),
    getXpProgress: () => mnGetXpProgress(state),
    getTotalScore: () => mnGetTotalScore(state),
    getArchmageTitle: () => mnGetArchmageTitle(state.level),
    getMana: (type: ManaType) => mnGetMana(state, type),
    getAllMana: () => mnGetAllMana(state),
    getManaCapacity: (type: ManaType) => mnGetManaCapacity(state, type),
    getManaRegen: (type: ManaType) => mnGetManaRegen(state, type),
    getManaPercent: (type: ManaType) => mnGetManaPercent(state, type),
    getTotalManaValue: () => mnGetTotalManaValue(state),
    getTotalManaCapacity: () => mnGetTotalManaCapacity(state),
    isManaSufficient: (cost: Record<ManaType, number>) => mnIsManaSufficient(state, cost),
    canCastSpell: (spellId: string) => mnCanCastSpell(state, spellId),
    hasSpell: (spellId: string) => mnHasSpell(state, spellId),
    getKnownSpells: () => mnGetKnownSpells(state),
    getSpellInfo: (spellId: string) => mnGetSpellInfo(state, spellId),
    getSpellPower: (spellId: string) => mnGetSpellPower(state, spellId),
    getSpellCost: (spellId: string) => mnGetSpellCost(state, spellId),
    getCraftedScrolls: () => mnGetCraftedScrolls(state),
    canCraftScroll: (spellId: string) => mnCanCraftScroll(state, spellId),
    getDefenseWave: () => mnGetDefenseWave(state),
    getDefenseCycle: () => mnGetDefenseCycle(state),
    isDefenseActive: () => mnIsDefenseActive(state),
    getCurrentEnemies: () => mnGetCurrentEnemies(state),
    getDefenseProgress: () => mnGetDefenseProgress(state),
    getCoreLevel: (coreType: CoreType) => mnGetCoreLevel(state, coreType),
    canUpgradeCore: (coreType: CoreType) => mnCanUpgradeCore(state, coreType),
    getCoreUpgradeCost: (coreType: CoreType) => mnGetCoreUpgradeCost(state, coreType),
    getFamiliars: () => mnGetFamiliars(state),
    getActiveFamiliars: () => mnGetActiveFamiliars(state),
    getEnchantments: () => mnGetEnchantments(state),
    getAchievements: () => mnGetAchievements(state),
    hasAchievement: (id: string) => mnHasAchievement(state, id),
    getAchievementCount: () => mnGetAchievementCount(state),
    getStreak: () => mnGetStreak(state),
    isDailyCompleted: () => mnIsDailyCompleted(state),
    getRealmState: (realmId: RealmId) => mnGetRealmState(state, realmId),
    getGameState: () => mnGetGameState(state),
    getNexusDefenseRating: () => mnGetNexusDefenseRating(state),
    getBestSpellForEnemy: (enemyType: EnemyType) => mnGetBestSpellForEnemy(state, enemyType),
    getMasteryProgress: (spellId: string) => mnGetMasteryProgress(state, spellId),
  };
}
