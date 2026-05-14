// Dragon Sanctuary Wire — Dragon management module for Word Snake
// SSR-safe: no localStorage, window, document, setInterval, addEventListener
// All exported functions use `ds` prefix, constants use `DS_` prefix

import { useState, useCallback, useRef } from 'react';

// ============================================================
// SECTION 1: TYPES & INTERFACES
// ============================================================

export type DSElement =
  | 'fire'
  | 'ice'
  | 'storm'
  | 'earth'
  | 'water'
  | 'shadow'
  | 'light'
  | 'nature';

export type DSRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type DSDragonRole = 'attacker' | 'defender' | 'support' | 'healer' | 'scout';

export type DSQuestType = 'rescue' | 'defense' | 'taming' | 'arena' | 'exploration' | 'collection' | 'boss';

export type DSEquipmentSlot = 'saddle' | 'armor' | 'accessory';

export type DSDragonTrait = 'fierce' | 'gentle' | 'clever' | 'brave' | 'shy' | 'loyal' | 'wild' | 'mystic';

export type DSDailyTaskCategory = 'feed' | 'train' | 'breed' | 'quest' | 'battle' | 'explore';

export interface DSDragonSpecies {
  readonly id: string;
  readonly name: string;
  readonly element: DSElement;
  readonly rarity: DSRarity;
  readonly baseHP: number;
  readonly baseAttack: number;
  readonly baseDefense: number;
  readonly baseSpeed: number;
  readonly baseMagic: number;
  readonly description: string;
  readonly trait: DSDragonTrait;
}

export interface DSHabitatType {
  readonly id: string;
  readonly name: string;
  readonly element: DSElement;
  readonly capacity: number;
  readonly unlockCost: number;
  readonly comfortBonus: number;
  readonly description: string;
}

export interface DSDragonInstance {
  readonly id: string;
  speciesId: string;
  name: string;
  level: number;
  xp: number;
  hp: number;
  maxHP: number;
  attack: number;
  defense: number;
  speed: number;
  magic: number;
  trait: DSDragonTrait;
  abilities: string[];
  equippedSaddle: string | null;
  equippedArmor: string | null;
  equippedAccessory: string | null;
  habitatId: string | null;
  mood: number; // 0–100
  hunger: number; // 0–100
  health: number; // 0–100
  isHatching: boolean;
  hatchProgress: number; // 0–100
  hatchTimeTotal: number;
}

export interface DSHabitatInstance {
  readonly id: string;
  habitatTypeId: string;
  name: string;
  dragonIds: string[];
  unlocked: boolean;
  level: number;
  cleanliness: number; // 0–100
}

export interface DSFood {
  readonly id: string;
  readonly name: string;
  readonly element: DSElement | 'neutral';
  readonly hungerRestore: number;
  readonly moodBonus: number;
  readonly hpRestore: number;
  readonly cost: number;
  readonly description: string;
}

export interface DSTrainingGround {
  readonly id: string;
  readonly name: string;
  readonly statBoosted: 'attack' | 'defense' | 'speed' | 'magic' | 'hp';
  readonly boostAmount: number;
  readonly elementBonus: DSElement | 'neutral';
  readonly cost: number;
  readonly description: string;
}

export interface DSPotion {
  readonly id: string;
  readonly name: string;
  readonly effectType: 'heal' | 'xp_boost' | 'mood_boost' | 'trait_boost' | 'evolution';
  readonly value: number;
  readonly cost: number;
  readonly description: string;
}

export interface DSAbility {
  readonly id: string;
  readonly name: string;
  readonly element: DSElement;
  readonly power: number;
  readonly cooldown: number;
  readonly manaCost: number;
  readonly description: string;
  readonly unlockLevel: number;
  readonly requiredElement: DSElement[];
}

export interface DSQuest {
  readonly id: string;
  readonly name: string;
  readonly type: DSQuestType;
  readonly description: string;
  readonly requiredLevel: number;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly rewardItems: string[];
  readonly steps: number;
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
  readonly elementAffinity: DSElement | 'neutral';
}

export interface DSQuestProgress {
  questId: string;
  accepted: boolean;
  currentStep: number;
  completed: boolean;
  rewardClaimed: boolean;
}

export interface DSEquipment {
  readonly id: string;
  readonly name: string;
  readonly slot: DSEquipmentSlot;
  readonly rarity: DSRarity;
  readonly statBoosts: {
    hp?: number;
    attack?: number;
    defense?: number;
    speed?: number;
    magic?: number;
  };
  readonly elementAffinity: DSElement | 'neutral';
  readonly cost: number;
  readonly description: string;
}

export interface DSEquipmentInstance {
  readonly id: string;
  equipmentId: string;
  dragonId: string | null;
  durability: number;
  maxDurability: number;
}

export interface DSNPC {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly greeting: string;
  readonly element: DSElement | 'neutral';
}

export interface DSAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly condition: string;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly hidden: boolean;
}

export interface DSDailyTask {
  readonly id: string;
  readonly name: string;
  readonly category: DSDailyTaskCategory;
  readonly description: string;
  readonly target: number;
  readonly progress: number;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly completed: boolean;
  readonly claimed: boolean;
}

export interface DSTitleThreshold {
  readonly level: number;
  readonly title: string;
}

export interface DSBreedingResult {
  readonly eggSpeciesId: string;
  readonly inheritedTrait: DSDragonTrait;
  readonly hatchTime: number;
  readonly elementMix: DSElement[];
  readonly rarityBonus: boolean;
}

export interface DSSanctuaryState {
  xp: number;
  coins: number;
  level: number;
  dragons: DSDragonInstance[];
  habitats: DSHabitatInstance[];
  inventory: DSEquipmentInstance[];
  abilities: string[];
  questProgress: DSQuestProgress[];
  achievements: string[];
  dailyTasks: DSDailyTask[];
  activeDragonId: string | null;
  totalHatched: number;
  totalBattlesWon: number;
  totalQuestsCompleted: number;
  totalFed: number;
  totalTrained: number;
  totalBreeds: number;
  daySeed: number;
}

// ============================================================
// SECTION 2: CONSTANTS — DRAGON SPECIES (32 species)
// ============================================================

export const DS_MAX_LEVEL: number = 50;

export const DS_DRAGONS: readonly DSDragonSpecies[] = [
  { id: 'fire_drake', name: 'Fire Drake', element: 'fire', rarity: 'common', baseHP: 120, baseAttack: 35, baseDefense: 20, baseSpeed: 28, baseMagic: 15, description: 'A fierce ember-scaled drake found near volcanic vents.', trait: 'fierce' },
  { id: 'ice_wyrm', name: 'Ice Wyrm', element: 'ice', rarity: 'common', baseHP: 110, baseAttack: 20, baseDefense: 35, baseSpeed: 18, baseMagic: 25, description: 'A serpentine wyrm from frozen caverns, breathes razor ice.', trait: 'shy' },
  { id: 'storm_dragon', name: 'Storm Dragon', element: 'storm', rarity: 'uncommon', baseHP: 100, baseAttack: 30, baseDefense: 18, baseSpeed: 40, baseMagic: 30, description: 'Rides lightning bolts across mountain peaks.', trait: 'wild' },
  { id: 'earth_golem', name: 'Earth Golem Dragon', element: 'earth', rarity: 'common', baseHP: 180, baseAttack: 15, baseDefense: 40, baseSpeed: 8, baseMagic: 10, description: 'A massive dragon with stone scales and root-like claws.', trait: 'loyal' },
  { id: 'water_serpent', name: 'Water Serpent', element: 'water', rarity: 'common', baseHP: 130, baseAttack: 22, baseDefense: 25, baseSpeed: 30, baseMagic: 20, description: 'A graceful aquatic dragon that commands ocean currents.', trait: 'gentle' },
  { id: 'shadow_drake', name: 'Shadow Drake', element: 'shadow', rarity: 'uncommon', baseHP: 90, baseAttack: 38, baseDefense: 15, baseSpeed: 42, baseMagic: 28, description: 'A dark-scaled predator that moves through shadows.', trait: 'clever' },
  { id: 'light_wyrm', name: 'Light Wyrm', element: 'light', rarity: 'uncommon', baseHP: 95, baseAttack: 25, baseDefense: 22, baseSpeed: 32, baseMagic: 40, description: 'A radiant dragon that purifies corruption with golden light.', trait: 'mystic' },
  { id: 'forest_dragon', name: 'Forest Dragon', element: 'nature', rarity: 'common', baseHP: 140, baseAttack: 18, baseDefense: 30, baseSpeed: 22, baseMagic: 25, description: 'A green-scaled guardian of ancient woodland groves.', trait: 'gentle' },
  { id: 'crystal_dragon', name: 'Crystal Dragon', element: 'ice', rarity: 'rare', baseHP: 110, baseAttack: 28, baseDefense: 38, baseSpeed: 20, baseMagic: 35, description: 'A glittering dragon whose scales are living crystal formations.', trait: 'mystic' },
  { id: 'lava_titan', name: 'Lava Titan', element: 'fire', rarity: 'rare', baseHP: 200, baseAttack: 42, baseDefense: 35, baseSpeed: 10, baseMagic: 20, description: 'An enormous dragon born from magma flows in the deep earth.', trait: 'fierce' },
  { id: 'frost_wyrm', name: 'Frost Wyrm', element: 'ice', rarity: 'uncommon', baseHP: 125, baseAttack: 25, baseDefense: 30, baseSpeed: 24, baseMagic: 28, description: 'A pale blue dragon that freezes everything it touches.', trait: 'shy' },
  { id: 'thunder_drake', name: 'Thunder Drake', element: 'storm', rarity: 'uncommon', baseHP: 105, baseAttack: 32, baseDefense: 20, baseSpeed: 38, baseMagic: 26, description: 'A crackling dragon that channels thunder through its wings.', trait: 'wild' },
  { id: 'sand_dragon', name: 'Sand Dragon', element: 'earth', rarity: 'uncommon', baseHP: 130, baseAttack: 24, baseDefense: 28, baseSpeed: 26, baseMagic: 18, description: 'A desert-dwelling dragon that controls sandstorms.', trait: 'clever' },
  { id: 'mist_dragon', name: 'Mist Dragon', element: 'water', rarity: 'uncommon', baseHP: 115, baseAttack: 20, baseDefense: 25, baseSpeed: 35, baseMagic: 32, description: 'A translucent dragon that dissolves into mist at will.', trait: 'shy' },
  { id: 'solar_dragon', name: 'Solar Dragon', element: 'light', rarity: 'rare', baseHP: 140, baseAttack: 35, baseDefense: 28, baseSpeed: 30, baseMagic: 38, description: 'A blindingly brilliant dragon fueled by solar energy.', trait: 'brave' },
  { id: 'lunar_dragon', name: 'Lunar Dragon', element: 'light', rarity: 'rare', baseHP: 120, baseAttack: 22, baseDefense: 24, baseSpeed: 28, baseMagic: 45, description: 'A silver dragon that draws power from moonlight phases.', trait: 'mystic' },
  { id: 'poison_drake', name: 'Poison Drake', element: 'nature', rarity: 'uncommon', baseHP: 100, baseAttack: 34, baseDefense: 18, baseSpeed: 30, baseMagic: 22, description: 'A toxic-green drake with venomous fangs and corrosive breath.', trait: 'wild' },
  { id: 'wind_dragon', name: 'Wind Dragon', element: 'storm', rarity: 'common', baseHP: 90, baseAttack: 20, baseDefense: 15, baseSpeed: 50, baseMagic: 22, description: 'The fastest dragon, a blur of feathers and wind.', trait: 'gentle' },
  { id: 'iron_dragon', name: 'Iron Dragon', element: 'earth', rarity: 'rare', baseHP: 190, baseAttack: 30, baseDefense: 45, baseSpeed: 12, baseMagic: 15, description: 'A metallic dragon forged in ancient dwarven forges.', trait: 'loyal' },
  { id: 'bone_dragon', name: 'Bone Dragon', element: 'shadow', rarity: 'rare', baseHP: 130, baseAttack: 36, baseDefense: 30, baseSpeed: 22, baseMagic: 30, description: 'An undead dragon that commands skeletal armies.', trait: 'fierce' },
  { id: 'cloud_dragon', name: 'Cloud Dragon', element: 'storm', rarity: 'uncommon', baseHP: 100, baseAttack: 18, baseDefense: 20, baseSpeed: 40, baseMagic: 30, description: 'A soft white dragon that lives high in the atmosphere.', trait: 'gentle' },
  { id: 'ember_drake', name: 'Ember Drake', element: 'fire', rarity: 'uncommon', baseHP: 105, baseAttack: 30, baseDefense: 22, baseSpeed: 32, baseMagic: 20, description: 'A smaller cousin of the Fire Drake with smoldering scales.', trait: 'brave' },
  { id: 'glacial_drake', name: 'Glacial Drake', element: 'ice', rarity: 'uncommon', baseHP: 135, baseAttack: 26, baseDefense: 32, baseSpeed: 20, baseMagic: 24, description: 'A thick-ice-scaled drake from the deepest glaciers.', trait: 'loyal' },
  { id: 'volt_dragon', name: 'Volt Dragon', element: 'storm', rarity: 'rare', baseHP: 95, baseAttack: 40, baseDefense: 16, baseSpeed: 44, baseMagic: 32, description: 'An electric-blue dragon crackling with raw voltage.', trait: 'wild' },
  { id: 'magma_wyrm', name: 'Magma Wyrm', element: 'fire', rarity: 'rare', baseHP: 170, baseAttack: 38, baseDefense: 32, baseSpeed: 14, baseMagic: 24, description: 'A worm-like dragon that swims through molten rock.', trait: 'fierce' },
  { id: 'blizzard_dragon', name: 'Blizzard Dragon', element: 'ice', rarity: 'rare', baseHP: 145, baseAttack: 30, baseDefense: 35, baseSpeed: 22, baseMagic: 32, description: 'A massive white dragon that summons eternal blizzards.', trait: 'brave' },
  { id: 'tempest_dragon', name: 'Tempest Dragon', element: 'storm', rarity: 'epic', baseHP: 130, baseAttack: 38, baseDefense: 25, baseSpeed: 42, baseMagic: 38, description: 'A mythical dragon that controls hurricanes and typhoons.', trait: 'wild' },
  { id: 'jade_dragon', name: 'Jade Dragon', element: 'nature', rarity: 'rare', baseHP: 155, baseAttack: 22, baseDefense: 35, baseSpeed: 25, baseMagic: 35, description: 'A sacred dragon carved from living jade stone.', trait: 'mystic' },
  { id: 'obsidian_drake', name: 'Obsidian Drake', element: 'shadow', rarity: 'epic', baseHP: 160, baseAttack: 44, baseDefense: 38, baseSpeed: 28, baseMagic: 30, description: 'A razor-sharp dragon made of volcanic obsidian glass.', trait: 'fierce' },
  { id: 'aurora_dragon', name: 'Aurora Dragon', element: 'light', rarity: 'epic', baseHP: 135, baseAttack: 32, baseDefense: 28, baseSpeed: 38, baseMagic: 42, description: 'A shimmering dragon that paints the sky with aurora lights.', trait: 'mystic' },
  { id: 'phantom_dragon', name: 'Phantom Dragon', element: 'shadow', rarity: 'epic', baseHP: 110, baseAttack: 42, baseDefense: 20, baseSpeed: 46, baseMagic: 40, description: 'A ghostly dragon that phases between dimensions.', trait: 'clever' },
  { id: 'stardust_dragon', name: 'Stardust Dragon', element: 'light', rarity: 'legendary', baseHP: 150, baseAttack: 45, baseDefense: 35, baseSpeed: 40, baseMagic: 48, description: 'A cosmic dragon born from collapsing stars.', trait: 'mystic' },
  { id: 'inferno_sovereign', name: 'Inferno Sovereign', element: 'fire', rarity: 'legendary', baseHP: 200, baseAttack: 50, baseDefense: 40, baseSpeed: 35, baseMagic: 42, description: 'The king of all fire dragons, wreathed in eternal flame.', trait: 'fierce' },
];

// ============================================================
// SECTION 3: CONSTANTS — HABITAT TYPES (8)
// ============================================================

export const DS_HABITATS: readonly DSHabitatType[] = [
  { id: 'volcanic_cavern', name: 'Volcanic Cavern', element: 'fire', capacity: 4, unlockCost: 0, comfortBonus: 15, description: 'A warm cavern near volcanic vents. Ideal for fire dragons.' },
  { id: 'frozen_tundra', name: 'Frozen Tundra', element: 'ice', capacity: 4, unlockCost: 500, comfortBonus: 15, description: 'An icy expanse with crystalline ice formations.' },
  { id: 'storm_peak', name: 'Storm Peak', element: 'storm', capacity: 3, unlockCost: 1000, comfortBonus: 20, description: 'A lightning-struck mountain peak with constant storms.' },
  { id: 'ancient_forest', name: 'Ancient Forest', element: 'nature', capacity: 4, unlockCost: 800, comfortBonus: 15, description: 'A lush forest grove with giant ancient trees.' },
  { id: 'ocean_depths', name: 'Ocean Depths', element: 'water', capacity: 3, unlockCost: 1200, comfortBonus: 20, description: 'A deep underwater grotto with bioluminescent coral.' },
  { id: 'shadow_vale', name: 'Shadow Vale', element: 'shadow', capacity: 3, unlockCost: 1500, comfortBonus: 20, description: 'A dark valley where shadows never fade.' },
  { id: 'sunlit_meadow', name: 'Sunlit Meadow', element: 'light', capacity: 3, unlockCost: 1500, comfortBonus: 20, description: 'A radiant meadow bathed in perpetual golden light.' },
  { id: 'crystal_cavern', name: 'Crystal Cavern', element: 'earth', capacity: 5, unlockCost: 2000, comfortBonus: 25, description: 'A vast cavern lined with precious crystals.' },
];

// ============================================================
// SECTION 4: CONSTANTS — FOOD TYPES (8)
// ============================================================

export const DS_FOODS: readonly DSFood[] = [
  { id: 'ember_berry', name: 'Ember Berry', element: 'fire', hungerRestore: 30, moodBonus: 5, hpRestore: 10, cost: 10, description: 'A spicy berry that glows with inner heat.' },
  { id: 'frost_fruit', name: 'Frost Fruit', element: 'ice', hungerRestore: 30, moodBonus: 5, hpRestore: 10, cost: 10, description: 'A cold fruit that never melts.' },
  { id: 'static_apple', name: 'Static Apple', element: 'storm', hungerRestore: 25, moodBonus: 8, hpRestore: 5, cost: 15, description: 'A crackling apple that shocks the tongue.' },
  { id: 'root_bulb', name: 'Root Bulb', element: 'nature', hungerRestore: 35, moodBonus: 5, hpRestore: 15, cost: 8, description: 'A hearty underground tuber loved by earth dragons.' },
  { id: 'sea_kelp', name: 'Sea Kelp', element: 'water', hungerRestore: 28, moodBonus: 7, hpRestore: 12, cost: 10, description: 'Nutrient-rich kelp harvested from deep waters.' },
  { id: 'nightshade', name: 'Nightshade', element: 'shadow', hungerRestore: 20, moodBonus: 12, hpRestore: 8, cost: 20, description: 'A dark berry that enhances shadow dragon powers.' },
  { id: 'sun_flower', name: 'Sun Flower', element: 'light', hungerRestore: 22, moodBonus: 15, hpRestore: 8, cost: 20, description: 'A radiant flower that blooms with inner light.' },
  { id: 'stone_nut', name: 'Stone Nut', element: 'neutral', hungerRestore: 40, moodBonus: 2, hpRestore: 5, cost: 5, description: 'A hard but filling nut that any dragon can eat.' },
];

// ============================================================
// SECTION 5: CONSTANTS — TRAINING GROUNDS (6)
// ============================================================

export const DS_TRAINING_GROUNDS: readonly DSTrainingGround[] = [
  { id: 'flame_forge', name: 'Flame Forge', statBoosted: 'attack', boostAmount: 5, elementBonus: 'fire', cost: 30, description: 'Train in extreme heat to boost attack power.' },
  { id: 'glacier_wall', name: 'Glacier Wall', statBoosted: 'defense', boostAmount: 5, elementBonus: 'ice', cost: 30, description: 'Endure freezing walls to harden your defenses.' },
  { id: 'wind_tunnel', name: 'Wind Tunnel', statBoosted: 'speed', boostAmount: 5, elementBonus: 'storm', cost: 30, description: 'Race through high-speed wind currents.' },
  { id: 'stone_circle', name: 'Stone Circle', statBoosted: 'hp', boostAmount: 8, elementBonus: 'earth', cost: 35, description: 'Meditate among ancient stones to increase vitality.' },
  { id: 'shadow_maze', name: 'Shadow Maze', statBoosted: 'magic', boostAmount: 5, elementBonus: 'shadow', cost: 30, description: 'Navigate a dark maze that sharpens magical senses.' },
  { id: 'radiant_spring', name: 'Radiant Spring', statBoosted: 'magic', boostAmount: 4, elementBonus: 'light', cost: 40, description: 'Bask in purifying light to enhance magical affinity.' },
];

// ============================================================
// SECTION 6: CONSTANTS — POTIONS (5)
// ============================================================

export const DS_POTIONS: readonly DSPotion[] = [
  { id: 'health_elixir', name: 'Health Elixir', effectType: 'heal', value: 50, cost: 25, description: 'Restores 50 HP to a dragon.' },
  { id: 'xp_potion', name: 'Wisdom Draught', effectType: 'xp_boost', value: 100, cost: 50, description: 'Grants 100 bonus XP to a dragon.' },
  { id: 'mood_serum', name: 'Joy Serum', effectType: 'mood_boost', value: 30, cost: 20, description: 'Increases dragon mood by 30.' },
  { id: 'trait_tonic', name: 'Trait Tonic', effectType: 'trait_boost', value: 10, cost: 80, description: 'Temporarily boosts all dragon stats by 10%.' },
  { id: 'evo_catalyst', name: 'Evolution Catalyst', effectType: 'evolution', value: 1, cost: 200, description: 'Triggers evolution for a dragon at max level.' },
];

// ============================================================
// SECTION 7: CONSTANTS — ABILITIES (42 abilities)
// ============================================================

export const DS_ABILITIES: readonly DSAbility[] = [
  // Fire abilities (6)
  { id: 'fire_breath', name: 'Fire Breath', element: 'fire', power: 30, cooldown: 2, manaCost: 10, description: 'Unleashes a cone of searing flames.', unlockLevel: 1, requiredElement: ['fire'] },
  { id: 'inferno', name: 'Inferno', element: 'fire', power: 55, cooldown: 5, manaCost: 25, description: 'Engulfs the target in an all-consuming firestorm.', unlockLevel: 10, requiredElement: ['fire'] },
  { id: 'flame_shield', name: 'Flame Shield', element: 'fire', power: 15, cooldown: 4, manaCost: 15, description: 'Wraps the caster in protective fire that burns attackers.', unlockLevel: 5, requiredElement: ['fire'] },
  { id: 'ember_burst', name: 'Ember Burst', element: 'fire', power: 22, cooldown: 2, manaCost: 8, description: 'Launches a cluster of explosive embers.', unlockLevel: 3, requiredElement: ['fire'] },
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', element: 'fire', power: 70, cooldown: 8, manaCost: 40, description: 'Summons a volcanic eruption that devastates all enemies.', unlockLevel: 25, requiredElement: ['fire'] },
  { id: 'pyro_claws', name: 'Pyro Claws', element: 'fire', power: 18, cooldown: 1, manaCost: 5, description: 'Infuses claws with fire for a rapid melee attack.', unlockLevel: 1, requiredElement: ['fire'] },
  // Ice abilities (6)
  { id: 'ice_shard', name: 'Ice Shard', element: 'ice', power: 25, cooldown: 2, manaCost: 10, description: 'Launches a sharp shard of ice.', unlockLevel: 1, requiredElement: ['ice'] },
  { id: 'blizzard', name: 'Blizzard', element: 'ice', power: 50, cooldown: 5, manaCost: 25, description: 'Summons a freezing blizzard that slows all targets.', unlockLevel: 10, requiredElement: ['ice'] },
  { id: 'frost_armor', name: 'Frost Armor', element: 'ice', power: 15, cooldown: 4, manaCost: 15, description: 'Encases the caster in protective ice armor.', unlockLevel: 5, requiredElement: ['ice'] },
  { id: 'glacier_lance', name: 'Glacier Lance', element: 'ice', power: 35, cooldown: 3, manaCost: 15, description: 'Forms a massive ice lance and hurls it.', unlockLevel: 7, requiredElement: ['ice'] },
  { id: 'absolute_zero', name: 'Absolute Zero', element: 'ice', power: 65, cooldown: 8, manaCost: 40, description: 'Freezes everything in a wide area to absolute zero.', unlockLevel: 25, requiredElement: ['ice'] },
  { id: 'cryo_bite', name: 'Cryo Bite', element: 'ice', power: 18, cooldown: 1, manaCost: 5, description: 'Bites with frost-infused fangs.', unlockLevel: 1, requiredElement: ['ice'] },
  // Storm abilities (6)
  { id: 'lightning_bolt', name: 'Lightning Bolt', element: 'storm', power: 28, cooldown: 2, manaCost: 10, description: 'Strikes with a bolt of lightning.', unlockLevel: 1, requiredElement: ['storm'] },
  { id: 'thunderstorm', name: 'Thunderstorm', element: 'storm', power: 48, cooldown: 5, manaCost: 25, description: 'Calls down a devastating thunderstorm.', unlockLevel: 10, requiredElement: ['storm'] },
  { id: 'static_field', name: 'Static Field', element: 'storm', power: 20, cooldown: 4, manaCost: 15, description: 'Creates an electrified field that damages nearby enemies.', unlockLevel: 5, requiredElement: ['storm'] },
  { id: 'chain_lightning', name: 'Chain Lightning', element: 'storm', power: 32, cooldown: 3, manaCost: 18, description: 'Lightning that jumps between multiple targets.', unlockLevel: 8, requiredElement: ['storm'] },
  { id: 'tempest_wrath', name: 'Tempest Wrath', element: 'storm', power: 68, cooldown: 8, manaCost: 40, description: 'Unleashes the full fury of the tempest.', unlockLevel: 25, requiredElement: ['storm'] },
  { id: 'shock_wing', name: 'Shock Wing', element: 'storm', power: 16, cooldown: 1, manaCost: 5, description: 'Slaps enemies with electrified wings.', unlockLevel: 1, requiredElement: ['storm'] },
  // Earth/Nature abilities (6)
  { id: 'vine_whip', name: 'Vine Whip', element: 'nature', power: 24, cooldown: 2, manaCost: 10, description: 'Strikes with thorny vines.', unlockLevel: 1, requiredElement: ['nature'] },
  { id: 'nature_wrath', name: "Nature's Wrath", element: 'nature', power: 52, cooldown: 5, manaCost: 25, description: 'Commands the forest to attack all enemies.', unlockLevel: 10, requiredElement: ['nature'] },
  { id: 'thorn_wall', name: 'Thorn Wall', element: 'nature', power: 15, cooldown: 4, manaCost: 15, description: 'Raises a wall of thorns for protection.', unlockLevel: 5, requiredElement: ['nature'] },
  { id: 'earthquake', name: 'Earthquake', element: 'earth', power: 45, cooldown: 5, manaCost: 22, description: 'Shakes the ground violently to damage all nearby.', unlockLevel: 10, requiredElement: ['earth'] },
  { id: 'stone_spire', name: 'Stone Spire', element: 'earth', power: 38, cooldown: 3, manaCost: 18, description: 'Launches stone spikes from the ground.', unlockLevel: 7, requiredElement: ['earth'] },
  { id: 'root_bind', name: 'Root Bind', element: 'nature', power: 20, cooldown: 3, manaCost: 12, description: 'Entangles the target with magical roots.', unlockLevel: 3, requiredElement: ['nature'] },
  // Water abilities (4)
  { id: 'water_jet', name: 'Water Jet', element: 'water', power: 22, cooldown: 2, manaCost: 8, description: 'Fires a high-pressure water jet.', unlockLevel: 1, requiredElement: ['water'] },
  { id: 'tidal_wave', name: 'Tidal Wave', element: 'water', power: 55, cooldown: 6, manaCost: 30, description: 'Summons a massive tidal wave.', unlockLevel: 12, requiredElement: ['water'] },
  { id: 'whirlpool', name: 'Whirlpool', element: 'water', power: 35, cooldown: 4, manaCost: 18, description: 'Creates a whirlpool that traps and damages enemies.', unlockLevel: 6, requiredElement: ['water'] },
  { id: 'healing_rain', name: 'Healing Rain', element: 'water', power: -30, cooldown: 5, manaCost: 20, description: 'Calls restorative rain that heals allies.', unlockLevel: 4, requiredElement: ['water'] },
  // Shadow abilities (4)
  { id: 'shadow_bolt', name: 'Shadow Bolt', element: 'shadow', power: 30, cooldown: 2, manaCost: 12, description: 'Fires a bolt of concentrated darkness.', unlockLevel: 1, requiredElement: ['shadow'] },
  { id: 'void_rift', name: 'Void Rift', element: 'shadow', power: 60, cooldown: 7, manaCost: 35, description: 'Tears open a rift to the void that consumes enemies.', unlockLevel: 20, requiredElement: ['shadow'] },
  { id: 'dark_mist', name: 'Dark Mist', element: 'shadow', power: 18, cooldown: 3, manaCost: 14, description: 'Covers the area in obscuring dark mist.', unlockLevel: 5, requiredElement: ['shadow'] },
  { id: 'shadow_step', name: 'Shadow Step', element: 'shadow', power: 10, cooldown: 2, manaCost: 8, description: 'Teleports through shadows to reposition.', unlockLevel: 3, requiredElement: ['shadow'] },
  // Light abilities (4)
  { id: 'holy_light', name: 'Holy Light', element: 'light', power: 26, cooldown: 2, manaCost: 10, description: 'Channels purifying light to damage dark creatures.', unlockLevel: 1, requiredElement: ['light'] },
  { id: 'divine_shield', name: 'Divine Shield', element: 'light', power: 20, cooldown: 5, manaCost: 22, description: 'Creates a shield of divine energy.', unlockLevel: 8, requiredElement: ['light'] },
  { id: 'solar_beam', name: 'Solar Beam', element: 'light', power: 58, cooldown: 6, manaCost: 30, description: 'Fires a concentrated beam of solar energy.', unlockLevel: 15, requiredElement: ['light'] },
  { id: 'purify', name: 'Purify', element: 'light', power: -25, cooldown: 4, manaCost: 16, description: 'Purifies allies, removing debuffs and healing.', unlockLevel: 6, requiredElement: ['light'] },
  // Universal abilities (2)
  { id: 'roar', name: 'Dragon Roar', element: 'fire', power: 20, cooldown: 4, manaCost: 10, description: 'A fearsome roar that intimidates all enemies. Any dragon can learn this.', unlockLevel: 1, requiredElement: ['fire', 'ice', 'storm', 'earth', 'water', 'shadow', 'light', 'nature'] },
  { id: 'tail_slam', name: 'Tail Slam', element: 'earth', power: 22, cooldown: 2, manaCost: 6, description: 'A powerful slam with the tail. Universal ability.', unlockLevel: 2, requiredElement: ['fire', 'ice', 'storm', 'earth', 'water', 'shadow', 'light', 'nature'] },
];

// ============================================================
// SECTION 8: CONSTANTS — QUESTS (22 quests)
// ============================================================

export const DS_QUESTS: readonly DSQuest[] = [
  { id: 'q_rescue_wyrmling', name: 'Rescue the Lost Wyrmling', type: 'rescue', description: 'A baby Ice Wyrm has been spotted trapped in an avalanche. Rescue it!', requiredLevel: 1, rewardXP: 100, rewardCoins: 200, rewardItems: ['health_elixir'], steps: 3, difficulty: 1, elementAffinity: 'ice' },
  { id: 'q_village_defense', name: 'Defend the Village', type: 'defense', description: 'Shadow Drakes are attacking the mountain village. Drive them back!', requiredLevel: 3, rewardXP: 150, rewardCoins: 300, rewardItems: ['ember_berry'], steps: 4, difficulty: 2, elementAffinity: 'neutral' },
  { id: 'q_tame_wild', name: 'Tame the Wild Thunder Drake', type: 'taming', description: 'A wild Thunder Drake is causing chaos on Storm Peak. Tame it!', requiredLevel: 5, rewardXP: 250, rewardCoins: 400, rewardItems: ['mood_serum'], steps: 5, difficulty: 2, elementAffinity: 'storm' },
  { id: 'q_arena_trial', name: 'Arena Trial', type: 'arena', description: 'Enter the arena and defeat 3 challengers to prove your worth.', requiredLevel: 4, rewardXP: 200, rewardCoins: 350, rewardItems: [], steps: 3, difficulty: 2, elementAffinity: 'neutral' },
  { id: 'q_herb_gathering', name: 'Gather Dragon Herbs', type: 'collection', description: 'Collect rare herbs from the Ancient Forest for the healer NPC.', requiredLevel: 2, rewardXP: 80, rewardCoins: 150, rewardItems: ['root_bulb', 'health_elixir'], steps: 4, difficulty: 1, elementAffinity: 'nature' },
  { id: 'q_crystal_expedition', name: 'Explore Crystal Cavern', type: 'exploration', description: 'Map the deepest reaches of the Crystal Cavern. Danger lurks below.', requiredLevel: 7, rewardXP: 300, rewardCoins: 500, rewardItems: ['stone_nut', 'trait_tonic'], steps: 6, difficulty: 3, elementAffinity: 'earth' },
  { id: 'q_shadow_invasion', name: 'Stop the Shadow Invasion', type: 'defense', description: 'A wave of shadow creatures is pouring from Shadow Vale. Stop them!', requiredLevel: 10, rewardXP: 400, rewardCoins: 600, rewardItems: ['nightshade', 'health_elixir'], steps: 7, difficulty: 3, elementAffinity: 'shadow' },
  { id: 'q_stolen_eggs', name: 'Recover Stolen Eggs', type: 'rescue', description: 'Dragon eggs have been stolen by poachers. Track them down!', requiredLevel: 6, rewardXP: 350, rewardCoins: 450, rewardItems: ['mood_serum'], steps: 5, difficulty: 3, elementAffinity: 'neutral' },
  { id: 'q_ancient_heal', name: 'Heal the Ancient Dragon', type: 'exploration', description: 'An ancient Forest Dragon lies ill deep in the groves. Find the cure.', requiredLevel: 8, rewardXP: 300, rewardCoins: 400, rewardItems: ['health_elixir', 'xp_potion'], steps: 5, difficulty: 2, elementAffinity: 'nature' },
  { id: 'q_legendary_armor', name: 'Find Legendary Armor', type: 'exploration', description: 'Rumors speak of ancient dragon armor in the Ocean Depths.', requiredLevel: 12, rewardXP: 500, rewardCoins: 800, rewardItems: [], steps: 8, difficulty: 4, elementAffinity: 'water' },
  { id: 'q_volcanic_path', name: 'Clear the Volcanic Path', type: 'exploration', description: 'Lava flows have blocked the trade route. Clear the path!', requiredLevel: 5, rewardXP: 200, rewardCoins: 350, rewardItems: ['ember_berry', 'ember_berry'], steps: 4, difficulty: 2, elementAffinity: 'fire' },
  { id: 'q_ice_bridge', name: 'Ice Bridge Reconnaissance', type: 'exploration', description: 'Scout the newly formed ice bridge for threats.', requiredLevel: 9, rewardXP: 280, rewardCoins: 420, rewardItems: ['frost_fruit'], steps: 5, difficulty: 3, elementAffinity: 'ice' },
  { id: 'q_summit_battle', name: 'Storm Peak Summit', type: 'boss', description: 'A rogue Tempest Dragon awaits at the summit. Defeat it!', requiredLevel: 15, rewardXP: 600, rewardCoins: 900, rewardItems: ['static_apple', 'trait_tonic'], steps: 3, difficulty: 4, elementAffinity: 'storm' },
  { id: 'q_forest_patrol', name: 'Deep Forest Patrol', type: 'defense', description: 'Patrol the Ancient Forest and handle any threats.', requiredLevel: 4, rewardXP: 150, rewardCoins: 250, rewardItems: ['root_bulb'], steps: 4, difficulty: 1, elementAffinity: 'nature' },
  { id: 'q_ocean_dive', name: 'Ocean Depths Dive', type: 'exploration', description: 'Dive deep into the ocean to discover a sunken dragon temple.', requiredLevel: 14, rewardXP: 550, rewardCoins: 750, rewardItems: ['sea_kelp', 'xp_potion'], steps: 7, difficulty: 4, elementAffinity: 'water' },
  { id: 'q_shadow_escape', name: 'Shadow Realm Escape', type: 'boss', description: 'Trapped in the Shadow Realm! Find the exit before darkness consumes you.', requiredLevel: 18, rewardXP: 700, rewardCoins: 1000, rewardItems: ['nightshade', 'health_elixir'], steps: 6, difficulty: 5, elementAffinity: 'shadow' },
  { id: 'q_tower_ascent', name: 'Celestial Tower Ascent', type: 'boss', description: 'Climb the Celestial Tower and face the guardian at its peak.', requiredLevel: 20, rewardXP: 800, rewardCoins: 1200, rewardItems: ['sun_flower', 'evo_catalyst'], steps: 8, difficulty: 5, elementAffinity: 'light' },
  { id: 'q_dragon_race', name: 'Dragon Race Championship', type: 'arena', description: 'Enter the annual dragon race and aim for the podium!', requiredLevel: 8, rewardXP: 250, rewardCoins: 500, rewardItems: ['stone_nut'], steps: 3, difficulty: 2, elementAffinity: 'neutral' },
  { id: 'q_breeding_research', name: 'Breeding Research Expedition', type: 'exploration', description: 'Study wild dragon mating behaviors for the breeding expert.', requiredLevel: 11, rewardXP: 350, rewardCoins: 550, rewardItems: ['xp_potion', 'mood_serum'], steps: 6, difficulty: 3, elementAffinity: 'neutral' },
  { id: 'q_artifact_hunt', name: 'Ancient Artifact Recovery', type: 'collection', description: 'Find all 5 pieces of the ancient dragon artifact.', requiredLevel: 16, rewardXP: 650, rewardCoins: 950, rewardItems: ['trait_tonic'], steps: 5, difficulty: 4, elementAffinity: 'earth' },
  { id: 'q_tournament', name: 'Grand Dragon Tournament', type: 'arena', description: 'Compete in the grandest tournament in dragon history!', requiredLevel: 25, rewardXP: 1000, rewardCoins: 2000, rewardItems: ['evo_catalyst', 'trait_tonic'], steps: 5, difficulty: 5, elementAffinity: 'neutral' },
  { id: 'q_sovereign_challenge', name: 'Sovereign Challenge', type: 'boss', description: 'Face the legendary Inferno Sovereign in its volcanic lair.', requiredLevel: 35, rewardXP: 2000, rewardCoins: 5000, rewardItems: ['evo_catalyst', 'evo_catalyst'], steps: 4, difficulty: 5, elementAffinity: 'fire' },
];

// ============================================================
// SECTION 9: CONSTANTS — EQUIPMENT (20 saddles + 15 armor + 10 accessories)
// ============================================================

export const DS_EQUIPMENT: readonly DSEquipment[] = [
  // Saddles (20)
  { id: 'leather_saddle', name: 'Leather Saddle', slot: 'saddle', rarity: 'common', statBoosts: { speed: 3 }, elementAffinity: 'neutral', cost: 50, description: 'A basic leather saddle for everyday riding.' },
  { id: 'iron_saddle', name: 'Iron Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 5, defense: 2 }, elementAffinity: 'earth', cost: 150, description: 'A sturdy iron saddle that provides extra defense.' },
  { id: 'steel_saddle', name: 'Steel Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 6, attack: 2 }, elementAffinity: 'neutral', cost: 200, description: 'A well-crafted steel saddle for battle.' },
  { id: 'crystal_saddle', name: 'Crystal Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 8, magic: 4 }, elementAffinity: 'ice', cost: 500, description: 'A beautiful saddle carved from enchanted crystal.' },
  { id: 'shadow_saddle', name: 'Shadow Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 10, attack: 3 }, elementAffinity: 'shadow', cost: 500, description: 'A saddle that phases through shadows for stealth riding.' },
  { id: 'flame_saddle', name: 'Flame Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 5, attack: 4 }, elementAffinity: 'fire', cost: 180, description: 'A heat-resistant saddle for fire dragons.' },
  { id: 'frost_saddle', name: 'Frost Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 5, defense: 3 }, elementAffinity: 'ice', cost: 180, description: 'An insulated saddle for icy flights.' },
  { id: 'storm_saddle', name: 'Storm Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 12 }, elementAffinity: 'storm', cost: 450, description: 'A lightweight saddle that cuts through storms.' },
  { id: 'forest_saddle', name: 'Forest Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 4, hp: 10 }, elementAffinity: 'nature', cost: 160, description: 'A saddle woven from living vines.' },
  { id: 'ocean_saddle', name: 'Ocean Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 7, defense: 4 }, elementAffinity: 'water', cost: 480, description: 'A waterproof saddle for aquatic dragons.' },
  { id: 'light_saddle', name: 'Light Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 8, magic: 5 }, elementAffinity: 'light', cost: 520, description: 'A radiant saddle that glows with inner light.' },
  { id: 'ember_saddle', name: 'Ember Saddle', slot: 'saddle', rarity: 'common', statBoosts: { speed: 4, attack: 2 }, elementAffinity: 'fire', cost: 80, description: 'A simple saddle with ember-stitched leather.' },
  { id: 'thunder_saddle', name: 'Thunder Saddle', slot: 'saddle', rarity: 'uncommon', statBoosts: { speed: 8, attack: 3 }, elementAffinity: 'storm', cost: 220, description: 'A saddle that crackles with static energy.' },
  { id: 'jade_saddle', name: 'Jade Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 6, hp: 15, magic: 3 }, elementAffinity: 'nature', cost: 550, description: 'A sacred jade saddle that enhances vitality.' },
  { id: 'obsidian_saddle', name: 'Obsidian Saddle', slot: 'saddle', rarity: 'epic', statBoosts: { speed: 10, attack: 6, defense: 4 }, elementAffinity: 'shadow', cost: 1200, description: 'A razor-sharp saddle forged from volcanic glass.' },
  { id: 'aurora_saddle', name: 'Aurora Saddle', slot: 'saddle', rarity: 'epic', statBoosts: { speed: 14, magic: 6 }, elementAffinity: 'light', cost: 1300, description: 'A saddle that trails aurora lights during flight.' },
  { id: 'stardust_saddle', name: 'Stardust Saddle', slot: 'saddle', rarity: 'legendary', statBoosts: { speed: 18, magic: 10, hp: 20 }, elementAffinity: 'light', cost: 5000, description: 'A cosmic saddle woven from stardust and nebula threads.' },
  { id: 'magma_saddle', name: 'Magma Saddle', slot: 'saddle', rarity: 'epic', statBoosts: { speed: 8, attack: 8, hp: 15 }, elementAffinity: 'fire', cost: 1100, description: 'A saddle that flows with molten rock.' },
  { id: 'bone_saddle', name: 'Bone Saddle', slot: 'saddle', rarity: 'rare', statBoosts: { speed: 7, attack: 5, magic: 3 }, elementAffinity: 'shadow', cost: 600, description: 'A macabre saddle crafted from dragon bones.' },
  { id: 'legendary_saddle', name: 'Dragonlord Saddle', slot: 'saddle', rarity: 'legendary', statBoosts: { speed: 20, attack: 8, defense: 8, magic: 8, hp: 30 }, elementAffinity: 'neutral', cost: 8000, description: 'The ultimate saddle forged by the first Dragonlord.' },
  // Armor (15)
  { id: 'leather_armor', name: 'Leather Armor', slot: 'armor', rarity: 'common', statBoosts: { defense: 5, hp: 5 }, elementAffinity: 'neutral', cost: 60, description: 'Basic dragon armor made from tough leather.' },
  { id: 'chain_mail', name: 'Chain Mail', slot: 'armor', rarity: 'uncommon', statBoosts: { defense: 8, hp: 10 }, elementAffinity: 'neutral', cost: 180, description: 'Interlocking metal rings provide solid protection.' },
  { id: 'iron_plate', name: 'Iron Plate', slot: 'armor', rarity: 'uncommon', statBoosts: { defense: 12, hp: 15 }, elementAffinity: 'earth', cost: 250, description: 'Heavy iron plates that absorb impact.' },
  { id: 'steel_plate', name: 'Steel Plate', slot: 'armor', rarity: 'rare', statBoosts: { defense: 16, hp: 20, attack: 2 }, elementAffinity: 'neutral', cost: 550, description: 'Masterwork steel plating for serious combat.' },
  { id: 'crystal_breastplate', name: 'Crystal Breastplate', slot: 'armor', rarity: 'rare', statBoosts: { defense: 14, magic: 8, hp: 10 }, elementAffinity: 'ice', cost: 600, description: 'Crystal armor that refracts magical attacks.' },
  { id: 'shadow_cloak', name: 'Shadow Cloak', slot: 'armor', rarity: 'rare', statBoosts: { defense: 10, speed: 8 }, elementAffinity: 'shadow', cost: 520, description: 'A cloak that bends light around the wearer.' },
  { id: 'flame_vest', name: 'Flame Vest', slot: 'armor', rarity: 'uncommon', statBoosts: { defense: 10, attack: 5 }, elementAffinity: 'fire', cost: 200, description: 'A vest woven from fire-resistant threads.' },
  { id: 'frost_guard', name: 'Frost Guard', slot: 'armor', rarity: 'uncommon', statBoosts: { defense: 11, hp: 12 }, elementAffinity: 'ice', cost: 210, description: 'Frozen armor that chills attackers on contact.' },
  { id: 'storm_shield_armor', name: 'Storm Shield', slot: 'armor', rarity: 'rare', statBoosts: { defense: 13, speed: 5, magic: 4 }, elementAffinity: 'storm', cost: 580, description: 'Armor that generates a protective static field.' },
  { id: 'forest_hide', name: 'Forest Hide', slot: 'armor', rarity: 'uncommon', statBoosts: { defense: 9, hp: 15, speed: 2 }, elementAffinity: 'nature', cost: 190, description: 'Bark-like armor grown from enchanted trees.' },
  { id: 'aqua_shell', name: 'Aqua Shell', slot: 'armor', rarity: 'rare', statBoosts: { defense: 15, hp: 18, magic: 3 }, elementAffinity: 'water', cost: 560, description: 'Armor crafted from giant enchanted seashells.' },
  { id: 'dragon_scale_mail', name: 'Dragon Scale Mail', slot: 'armor', rarity: 'epic', statBoosts: { defense: 22, hp: 30, attack: 4 }, elementAffinity: 'fire', cost: 1500, description: 'Armor made from the scales of a legendary dragon.' },
  { id: 'obsidian_armor', name: 'Obsidian Armor', slot: 'armor', rarity: 'epic', statBoosts: { defense: 20, hp: 25, attack: 6 }, elementAffinity: 'shadow', cost: 1400, description: 'Impenetrable obsidian armor with razor edges.' },
  { id: 'celestial_armor', name: 'Celestial Armor', slot: 'armor', rarity: 'legendary', statBoosts: { defense: 30, hp: 40, magic: 10, speed: 5 }, elementAffinity: 'light', cost: 6000, description: 'Armor blessed by celestial beings.' },
  { id: 'ancient_plate', name: 'Ancient Dragon Plate', slot: 'armor', rarity: 'epic', statBoosts: { defense: 25, hp: 35, attack: 8 }, elementAffinity: 'earth', cost: 1600, description: 'Ancient armor discovered in buried dragon ruins.' },
  // Accessories (10)
  { id: 'amulet_fire', name: 'Amulet of Fire', slot: 'accessory', rarity: 'uncommon', statBoosts: { attack: 6, magic: 3 }, elementAffinity: 'fire', cost: 120, description: 'A blazing amulet that enhances fire abilities.' },
  { id: 'ring_ice', name: 'Ring of Ice', slot: 'accessory', rarity: 'uncommon', statBoosts: { defense: 5, magic: 4 }, elementAffinity: 'ice', cost: 120, description: 'A frozen ring that grants ice resistance.' },
  { id: 'talisman_storm', name: 'Storm Talisman', slot: 'accessory', rarity: 'uncommon', statBoosts: { speed: 6, attack: 3 }, elementAffinity: 'storm', cost: 130, description: 'A crackling talisman that channels storm energy.' },
  { id: 'bracelet_nature', name: 'Nature Bracelet', slot: 'accessory', rarity: 'uncommon', statBoosts: { hp: 12, defense: 3 }, elementAffinity: 'nature', cost: 110, description: 'A living vine bracelet that slowly regenerates health.' },
  { id: 'crystal_lens', name: 'Crystal Lens', slot: 'accessory', rarity: 'rare', statBoosts: { magic: 8, speed: 4 }, elementAffinity: 'ice', cost: 400, description: 'A lens that reveals hidden magical properties.' },
  { id: 'water_pearl', name: 'Water Pearl', slot: 'accessory', rarity: 'uncommon', statBoosts: { hp: 15, magic: 3 }, elementAffinity: 'water', cost: 140, description: 'A luminous pearl from the deepest ocean trench.' },
  { id: 'shadow_amulet', name: 'Shadow Amulet', slot: 'accessory', rarity: 'rare', statBoosts: { speed: 8, attack: 5 }, elementAffinity: 'shadow', cost: 420, description: 'An amulet that cloaks the wearer in darkness.' },
  { id: 'light_crown', name: 'Light Crown', slot: 'accessory', rarity: 'rare', statBoosts: { magic: 10, hp: 10 }, elementAffinity: 'light', cost: 450, description: 'A radiant crown that enhances all light abilities.' },
  { id: 'dragon_heart', name: 'Dragon Heart', slot: 'accessory', rarity: 'epic', statBoosts: { hp: 30, attack: 5, defense: 5, magic: 5 }, elementAffinity: 'neutral', cost: 2000, description: 'The crystallized heart of an ancient dragon.' },
  { id: 'elemental_keystone', name: 'Elemental Keystone', slot: 'accessory', rarity: 'legendary', statBoosts: { attack: 10, defense: 10, magic: 10, speed: 10, hp: 25 }, elementAffinity: 'neutral', cost: 7000, description: 'A keystone containing pure elemental energy.' },
];

// ============================================================
// SECTION 10: CONSTANTS — NPCs (8)
// ============================================================

export const DS_NPCS: readonly DSNPC[] = [
  { id: 'npc_eldric', name: 'Eldric the Elder', role: 'Dragon Scholar', description: 'An ancient scholar who has studied dragons for centuries.', greeting: 'Welcome, young keeper. The dragons have much to teach those who listen.', element: 'light' },
  { id: 'npc_pyra', name: 'Pyra', role: 'Fire Trainer', description: 'A passionate fire dragon trainer with singed eyebrows.', greeting: "Let's turn up the heat! Your fire dragons have untapped potential.", element: 'fire' },
  { id: 'npc_glacius', name: 'Glacius', role: 'Ice Specialist', description: 'A calm and collected expert in ice dragon care.', greeting: 'Patience is the key to understanding ice dragons. Let me guide you.', element: 'ice' },
  { id: 'npc_thorin', name: 'Thorin', role: 'Blacksmith', description: 'A master blacksmith who crafts dragon equipment.', greeting: 'Need gear for your dragons? I forge the finest in the land!', element: 'earth' },
  { id: 'npc_selene', name: 'Selene', role: 'Healer', description: 'A gentle healer who tends to injured dragons.', greeting: 'Bring me your wounded dragons. I will nurse them back to health.', element: 'water' },
  { id: 'npc_zephyr', name: 'Zephyr', role: 'Breeding Expert', description: 'An eccentric expert in dragon genetics and breeding.', greeting: "Two dragons walk into my sanctuary... let's see what beautiful babies they make!", element: 'nature' },
  { id: 'npc_nyx', name: 'Nyx', role: 'Quest Giver', description: 'A mysterious figure who knows of dangers threatening the realm.', greeting: 'Darkness stirs beyond the sanctuary. I have tasks for the brave.', element: 'shadow' },
  { id: 'npc_aurum', name: 'Aurum', role: 'Merchant', description: 'A wealthy merchant dealing in rare dragon goods.', greeting: "Gold talks, friend! I have the finest wares for your sanctuary.", element: 'neutral' },
];

// ============================================================
// SECTION 11: CONSTANTS — ACHIEVEMENTS (15)
// ============================================================

export const DS_ACHIEVEMENTS: readonly DSAchievement[] = [
  { id: 'ach_first_hatch', name: 'First Hatch', description: 'Hatch your very first dragon egg.', condition: 'totalHatched >= 1', rewardXP: 50, rewardCoins: 100, hidden: false },
  { id: 'ach_collector_5', name: 'Dragon Collector', description: 'Own 5 or more dragons.', condition: 'dragonCount >= 5', rewardXP: 200, rewardCoins: 500, hidden: false },
  { id: 'ach_collector_10', name: 'Pack Leader', description: 'Own 10 or more dragons.', condition: 'dragonCount >= 10', rewardXP: 500, rewardCoins: 1000, hidden: false },
  { id: 'ach_master_breeder', name: 'Master Breeder', description: 'Successfully breed 5 dragons.', condition: 'totalBreeds >= 5', rewardXP: 400, rewardCoins: 800, hidden: false },
  { id: 'ach_arena_champ', name: 'Arena Champion', description: 'Win 20 arena battles.', condition: 'totalBattlesWon >= 20', rewardXP: 600, rewardCoins: 1500, hidden: false },
  { id: 'ach_quest_master', name: 'Quest Master', description: 'Complete 10 quests.', condition: 'totalQuestsCompleted >= 10', rewardXP: 500, rewardCoins: 1200, hidden: false },
  { id: 'ach_wealthy', name: 'Wealthy Keeper', description: 'Accumulate 10,000 coins.', condition: 'coins >= 10000', rewardXP: 300, rewardCoins: 0, hidden: false },
  { id: 'ach_habitat_builder', name: 'Habitat Builder', description: 'Unlock all 8 habitat types.', condition: 'habitatsUnlocked >= 8', rewardXP: 800, rewardCoins: 2000, hidden: false },
  { id: 'ach_whisperer', name: 'Dragon Whisperer', description: 'Max out a dragon at level 50.', condition: 'maxDragonLevel >= 50', rewardXP: 700, rewardCoins: 1500, hidden: false },
  { id: 'ach_element_master', name: 'Element Master', description: 'Own at least one dragon of each element.', condition: 'elementCount >= 8', rewardXP: 1000, rewardCoins: 3000, hidden: true },
  { id: 'ach_legendary_tamer', name: 'Legendary Tamer', description: 'Own a legendary rarity dragon.', condition: 'hasLegendary >= 1', rewardXP: 600, rewardCoins: 2000, hidden: false },
  { id: 'ach_daily_devotee', name: 'Daily Devotee', description: 'Complete daily tasks for 7 consecutive days.', condition: 'dailyStreak >= 7', rewardXP: 350, rewardCoins: 700, hidden: false },
  { id: 'ach_potion_master', name: 'Potion Master', description: 'Use 20 potions on your dragons.', condition: 'potionsUsed >= 20', rewardXP: 250, rewardCoins: 500, hidden: true },
  { id: 'ach_equipment_master', name: 'Equipment Master', description: 'Equip a dragon with all 3 equipment slots.', condition: 'fullyEquipped >= 1', rewardXP: 300, rewardCoins: 600, hidden: false },
  { id: 'ach_sanctuary_legend', name: 'Sanctuary Legend', description: 'Reach player level 50.', condition: 'playerLevel >= 50', rewardXP: 2000, rewardCoins: 5000, hidden: false },
];

// ============================================================
// SECTION 12: CONSTANTS — TITLE THRESHOLDS (8 titles)
// ============================================================

export const DS_TITLE_THRESHOLDS: readonly DSTitleThreshold[] = [
  { level: 1, title: 'Hatchling Keeper' },
  { level: 5, title: 'Wyrm Handler' },
  { level: 10, title: 'Drake Master' },
  { level: 15, title: 'Dragon Tamer' },
  { level: 20, title: 'Wyrm Lord' },
  { level: 30, title: 'Dragon Master' },
  { level: 40, title: 'Dragon Sage' },
  { level: 50, title: 'Dragon Legend' },
];

// ============================================================
// SECTION 13: SEEDED PRNG UTILITY
// ============================================================

function createSeededPRNG(seed: number): () => number {
  let state = seed;
  return (): number => {
    state = (state * 1664525 + 1013904223) & 0xFFFFFFFF;
    return (state >>> 0) / 0xFFFFFFFF;
  };
}

function seededInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function seededPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.35, level - 1));
}

function calculateDragonStats(
  species: DSDragonSpecies,
  level: number,
  equipmentBoosts: { hp?: number; attack?: number; defense?: number; speed?: number; magic?: number } = {}
): Pick<DSDragonInstance, 'maxHP' | 'attack' | 'defense' | 'speed' | 'magic'> {
  const growthFactor = 1 + (level - 1) * 0.12;
  return {
    maxHP: Math.floor(species.baseHP * growthFactor) + (equipmentBoosts.hp ?? 0),
    attack: Math.floor(species.baseAttack * growthFactor) + (equipmentBoosts.attack ?? 0),
    defense: Math.floor(species.baseDefense * growthFactor) + (equipmentBoosts.defense ?? 0),
    speed: Math.floor(species.baseSpeed * growthFactor) + (equipmentBoosts.speed ?? 0),
    magic: Math.floor(species.baseMagic * growthFactor) + (equipmentBoosts.magic ?? 0),
  };
}

function getElementAdvantage(attacker: DSElement, defender: DSElement): number {
  const advantageMap: Record<DSElement, DSElement[]> = {
    fire: ['ice', 'nature'],
    ice: ['storm', 'earth'],
    storm: ['water', 'fire'],
    earth: ['storm', 'shadow'],
    water: ['fire', 'earth'],
    shadow: ['light', 'nature'],
    light: ['shadow', 'ice'],
    nature: ['water', 'earth'],
  };
  if (advantageMap[attacker]?.includes(defender)) return 1.5;
  if (advantageMap[defender]?.includes(attacker)) return 0.7;
  return 1.0;
}

let _idCounter = 0;
function generateId(): string {
  _idCounter += 1;
  return `ds_${_idCounter.toString(36)}_${(Date.now() % 1000000).toString(36)}`;
}

function getEquipmentBoosts(
  inventory: DSEquipmentInstance[],
  dragon: DSDragonInstance
): { hp?: number; attack?: number; defense?: number; speed?: number; magic?: number } {
  const boosts: { hp?: number; attack?: number; defense?: number; speed?: number; magic?: number } = {};
  const slots: DSEquipmentSlot[] = ['saddle', 'armor', 'accessory'];
  const equippedIds: string[] = [];
  if (dragon.equippedSaddle) equippedIds.push(dragon.equippedSaddle);
  if (dragon.equippedArmor) equippedIds.push(dragon.equippedArmor);
  if (dragon.equippedAccessory) equippedIds.push(dragon.equippedAccessory);

  for (const instId of equippedIds) {
    const inst = inventory.find(i => i.id === instId);
    if (inst) {
      const equip = DS_EQUIPMENT.find(e => e.id === inst.equipmentId);
      if (equip) {
        boosts.hp = (boosts.hp ?? 0) + (equip.statBoosts.hp ?? 0);
        boosts.attack = (boosts.attack ?? 0) + (equip.statBoosts.attack ?? 0);
        boosts.defense = (boosts.defense ?? 0) + (equip.statBoosts.defense ?? 0);
        boosts.speed = (boosts.speed ?? 0) + (equip.statBoosts.speed ?? 0);
        boosts.magic = (boosts.magic ?? 0) + (equip.statBoosts.magic ?? 0);
      }
    }
  }
  return boosts;
}

function createInitialDailyTasks(daySeed: number): DSDailyTask[] {
  const rng = createSeededPRNG(daySeed);
  const allTasks: Array<{ id: string; name: string; category: DSDailyTaskCategory; description: string; target: number; rewardXP: number; rewardCoins: number }> = [
    { id: 'daily_feed_3', name: 'Feed Three Dragons', category: 'feed', description: 'Feed 3 dragons to keep them happy.', target: 3, rewardXP: 30, rewardCoins: 50 },
    { id: 'daily_feed_5', name: 'Grand Feast', category: 'feed', description: 'Feed 5 dragons today.', target: 5, rewardXP: 60, rewardCoins: 100 },
    { id: 'daily_train_2', name: 'Training Session', category: 'train', description: 'Train 2 dragons at the training grounds.', target: 2, rewardXP: 40, rewardCoins: 70 },
    { id: 'daily_train_4', name: 'Intensive Training', category: 'train', description: 'Complete 4 training sessions.', target: 4, rewardXP: 80, rewardCoins: 140 },
    { id: 'daily_breed', name: 'Breeding Day', category: 'breed', description: 'Breed one pair of dragons.', target: 1, rewardXP: 50, rewardCoins: 80 },
    { id: 'daily_quest', name: 'Quest Completion', category: 'quest', description: 'Complete any active quest.', target: 1, rewardXP: 60, rewardCoins: 100 },
    { id: 'daily_battle_2', name: 'Arena Fights', category: 'battle', description: 'Win 2 arena battles.', target: 2, rewardXP: 50, rewardCoins: 90 },
    { id: 'daily_battle_5', name: 'Arena Champion', category: 'battle', description: 'Win 5 arena battles today.', target: 5, rewardXP: 120, rewardCoins: 200 },
    { id: 'daily_explore', name: 'Sanctuary Exploration', category: 'explore', description: 'Visit 3 different habitats.', target: 3, rewardXP: 35, rewardCoins: 60 },
    { id: 'daily_heal', name: 'Healer Duty', category: 'feed', description: 'Heal 2 dragons to full health.', target: 2, rewardXP: 40, rewardCoins: 65 },
  ];

  const shuffled = [...allTasks].sort(() => rng() - 0.5);
  return shuffled.slice(0, 3).map(task => ({
    ...task,
    progress: 0,
    completed: false,
    claimed: false,
  }));
}

function createInitialHabitats(): DSHabitatInstance[] {
  return DS_HABITATS.map(h => ({
    id: `hab_${h.id}`,
    habitatTypeId: h.id,
    name: h.name,
    dragonIds: [],
    unlocked: h.id === 'volcanic_cavern',
    level: 1,
    cleanliness: 100,
  }));
}

// ============================================================
// SECTION 15: MAIN HOOK
// ============================================================

export function useDragonSanctuary() {
  const [state, setState] = useState<DSSanctuaryState>(() => ({
    xp: 0,
    coins: 500,
    level: 1,
    dragons: [],
    habitats: createInitialHabitats(),
    inventory: [],
    abilities: [],
    questProgress: [],
    achievements: [],
    dailyTasks: createInitialDailyTasks(Date.now() % 100000),
    activeDragonId: null,
    totalHatched: 0,
    totalBattlesWon: 0,
    totalQuestsCompleted: 0,
    totalFed: 0,
    totalTrained: 0,
    totalBreeds: 0,
    daySeed: Date.now() % 100000,
  }));

  const stateRef = useRef(state);
  stateRef.current = state;

  // ---- STATE GETTERS ----

  const dsGetState = useCallback((): DSSanctuaryState => {
    return stateRef.current;
  }, []);

  const dsResetState = useCallback((): void => {
    const fresh: DSSanctuaryState = {
      xp: 0,
      coins: 500,
      level: 1,
      dragons: [],
      habitats: createInitialHabitats(),
      inventory: [],
      abilities: [],
      questProgress: [],
      achievements: [],
      dailyTasks: createInitialDailyTasks(Date.now() % 100000),
      activeDragonId: null,
      totalHatched: 0,
      totalBattlesWon: 0,
      totalQuestsCompleted: 0,
      totalFed: 0,
      totalTrained: 0,
      totalBreeds: 0,
      daySeed: Date.now() % 100000,
    };
    setState(fresh);
  }, []);

  const dsGetLevel = useCallback((): number => {
    return stateRef.current.level;
  }, []);

  const dsGetTitle = useCallback((): string => {
    const level = stateRef.current.level;
    let title = 'Hatchling Keeper';
    for (const t of DS_TITLE_THRESHOLDS) {
      if (level >= t.level) title = t.title;
    }
    return title;
  }, []);

  const dsGetProgress = useCallback((): number => {
    const s = stateRef.current;
    const currentLevelXP = xpForLevel(s.level);
    const nextLevelXP = xpForLevel(s.level + 1);
    const progress = ((s.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  }, []);

  // ---- ECONOMY ----

  const dsAddXP = useCallback((amount: number): { leveledUp: boolean; newLevel: number } => {
    let leveledUp = false;
    let newLevel = stateRef.current.level;

    setState(prev => {
      let newXP = prev.xp + amount;
      let lvl = prev.level;
      while (lvl < DS_MAX_LEVEL && newXP >= xpForLevel(lvl + 1)) {
        lvl++;
        leveledUp = true;
        newLevel = lvl;
      }
      return { ...prev, xp: newXP, level: lvl };
    });

    return { leveledUp, newLevel };
  }, []);

  const dsGetCoins = useCallback((): number => {
    return stateRef.current.coins;
  }, []);

  const dsAddCoins = useCallback((amount: number): number => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
    return stateRef.current.coins + amount;
  }, []);

  const dsSpendCoins = useCallback((amount: number): boolean => {
    if (stateRef.current.coins < amount) return false;
    setState(prev => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, []);

  // ---- DRAGONS ----

  const dsGetDragons = useCallback((): DSDragonInstance[] => {
    return stateRef.current.dragons;
  }, []);

  const dsHatchDragon = useCallback((speciesId: string): DSDragonInstance | null => {
    const species = DS_DRAGONS.find(d => d.id === speciesId);
    if (!species) return null;

    const stats = calculateDragonStats(species, 1);
    const rng = createSeededPRNG(Date.now());
    const hatchTime = species.rarity === 'legendary' ? 100 : species.rarity === 'epic' ? 80 : species.rarity === 'rare' ? 60 : 40;

    const newDragon: DSDragonInstance = {
      id: generateId(),
      speciesId: species.id,
      name: species.name,
      level: 1,
      xp: 0,
      hp: stats.maxHP,
      maxHP: stats.maxHP,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      magic: stats.magic,
      trait: rng() > 0.5 ? species.trait : seededPick(rng, ['fierce', 'gentle', 'clever', 'brave', 'shy', 'loyal', 'wild', 'mystic'] as DSDragonTrait[]),
      abilities: DS_ABILITIES.filter(a => a.unlockLevel <= 1 && a.requiredElement.includes(species.element)).map(a => a.id),
      equippedSaddle: null,
      equippedArmor: null,
      equippedAccessory: null,
      habitatId: null,
      mood: 70,
      hunger: 80,
      health: 100,
      isHatching: true,
      hatchProgress: 0,
      hatchTimeTotal: hatchTime,
    };

    setState(prev => ({
      ...prev,
      dragons: [...prev.dragons, newDragon],
      activeDragonId: prev.activeDragonId ?? newDragon.id,
      totalHatched: prev.totalHatched + 1,
    }));

    return newDragon;
  }, []);

  const dsFeedDragon = useCallback((dragonId: string, foodId: string): boolean => {
    const food = DS_FOODS.find(f => f.id === foodId);
    if (!food) return false;

    let success = false;
    setState(prev => {
      const dragon = prev.dragons.find(d => d.id === dragonId);
      if (!dragon || dragon.isHatching) return prev;

      const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
      const elementMatch = species && food.element === species.element;
      const hungerMultiplier = elementMatch ? 1.5 : 1.0;
      const moodMultiplier = elementMatch ? 1.8 : 1.0;

      success = true;
      return {
        ...prev,
        dragons: prev.dragons.map(d => {
          if (d.id !== dragonId) return d;
          return {
            ...d,
            hunger: Math.min(100, d.hunger + Math.floor(food.hungerRestore * hungerMultiplier)),
            mood: Math.min(100, d.mood + Math.floor(food.moodBonus * moodMultiplier)),
            hp: Math.min(d.maxHP, d.hp + food.hpRestore),
            health: Math.min(100, d.health + Math.floor(food.hpRestore / 2)),
          };
        }),
        totalFed: prev.totalFed + 1,
      };
    });
    return success;
  }, []);

  const dsTrainDragon = useCallback((dragonId: string, trainingGroundId: string): boolean => {
    const ground = DS_TRAINING_GROUNDS.find(t => t.id === trainingGroundId);
    if (!ground) return false;

    if (stateRef.current.coins < ground.cost) return false;

    let success = false;
    setState(prev => {
      const dragon = prev.dragons.find(d => d.id === dragonId);
      if (!dragon || dragon.isHatching) return prev;

      const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
      const elementBonus = species && ground.elementBonus === species.element;
      const boostMult = elementBonus ? 1.5 : 1.0;
      const finalBoost = Math.floor(ground.boostAmount * boostMult);

      success = true;
      return {
        ...prev,
        coins: prev.coins - ground.cost,
        dragons: prev.dragons.map(d => {
          if (d.id !== dragonId) return d;
          const updated: DSDragonInstance = { ...d };
          switch (ground.statBoosted) {
            case 'attack': updated.attack += finalBoost; break;
            case 'defense': updated.defense += finalBoost; break;
            case 'speed': updated.speed += finalBoost; break;
            case 'magic': updated.magic += finalBoost; break;
            case 'hp': updated.maxHP += finalBoost; updated.hp = Math.min(updated.hp + finalBoost, updated.maxHP); break;
          }
          updated.hunger = Math.max(0, updated.hunger - 15);
          updated.mood = Math.max(0, updated.mood - 5);
          return updated;
        }),
        totalTrained: prev.totalTrained + 1,
      };
    });
    return success;
  }, []);

  const dsHealDragon = useCallback((dragonId: string, potionId: string): boolean => {
    const potion = DS_POTIONS.find(p => p.id === potionId);
    if (!potion) return false;

    if (stateRef.current.coins < potion.cost) return false;

    let success = false;
    setState(prev => {
      const dragon = prev.dragons.find(d => d.id === dragonId);
      if (!dragon || dragon.isHatching) return prev;

      success = true;
      return {
        ...prev,
        coins: prev.coins - potion.cost,
        dragons: prev.dragons.map(d => {
          if (d.id !== dragonId) return d;
          const updated = { ...d };
          switch (potion.effectType) {
            case 'heal':
              updated.hp = Math.min(updated.maxHP, updated.hp + potion.value);
              updated.health = Math.min(100, updated.health + potion.value);
              break;
            case 'xp_boost':
              updated.xp += potion.value;
              break;
            case 'mood_boost':
              updated.mood = Math.min(100, updated.mood + potion.value);
              break;
            case 'trait_boost':
              updated.attack = Math.floor(updated.attack * 1.1);
              updated.defense = Math.floor(updated.defense * 1.1);
              updated.speed = Math.floor(updated.speed * 1.1);
              updated.magic = Math.floor(updated.magic * 1.1);
              break;
            case 'evolution':
              if (updated.level >= DS_MAX_LEVEL) {
                updated.maxHP = Math.floor(updated.maxHP * 1.2);
                updated.attack = Math.floor(updated.attack * 1.2);
                updated.defense = Math.floor(updated.defense * 1.2);
                updated.speed = Math.floor(updated.speed * 1.15);
                updated.magic = Math.floor(updated.magic * 1.2);
              }
              break;
          }
          return updated;
        }),
      };
    });
    return success;
  }, []);

  const dsGetActiveDragon = useCallback((): DSDragonInstance | null => {
    const s = stateRef.current;
    if (!s.activeDragonId) return null;
    return s.dragons.find(d => d.id === s.activeDragonId) ?? null;
  }, []);

  const dsSetActiveDragon = useCallback((dragonId: string): boolean => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return false;
    setState(prev => ({ ...prev, activeDragonId: dragonId }));
    return true;
  }, []);

  const dsSetDragonName = useCallback((dragonId: string, name: string): boolean => {
    if (!name || name.trim().length === 0 || name.length > 30) return false;
    setState(prev => ({
      ...prev,
      dragons: prev.dragons.map(d => d.id === dragonId ? { ...d, name: name.trim() } : d),
    }));
    return true;
  }, []);

  const dsAddDragonXP = useCallback((dragonId: string, amount: number): boolean => {
    let didLevelUp = false;
    setState(prev => ({
      ...prev,
      dragons: prev.dragons.map(d => {
        if (d.id !== dragonId || d.isHatching) return d;
        let newXp = d.xp + amount;
        let newLevel = d.level;
        const xpNeeded = newLevel * 80 + 50;
        while (newLevel < DS_MAX_LEVEL && newXp >= xpNeeded) {
          newXp -= xpNeeded;
          newLevel++;
          didLevelUp = true;
        }
        if (didLevelUp || newXp !== d.xp) {
          const species = DS_DRAGONS.find(s => s.id === d.speciesId);
          if (species) {
            const newStats = calculateDragonStats(species, newLevel);
            return {
              ...d,
              xp: newXp,
              level: newLevel,
              maxHP: newStats.maxHP,
              attack: newStats.attack,
              defense: newStats.defense,
              speed: newStats.speed,
              magic: newStats.magic,
            };
          }
        }
        return { ...d, xp: newXp };
      }),
    }));
    return true;
  }, []);

  const dsGetDragonStats = useCallback((dragonId: string): Pick<DSDragonInstance, 'maxHP' | 'attack' | 'defense' | 'speed' | 'magic'> | null => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return null;
    const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
    if (!species) return null;
    const boosts = getEquipmentBoosts(stateRef.current.inventory, dragon);
    return calculateDragonStats(species, dragon.level, boosts);
  }, []);

  const dsGetDragonLevel = useCallback((dragonId: string): number => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    return dragon?.level ?? 0;
  }, []);

  const dsGetDragonMood = useCallback((dragonId: string): number => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    return dragon?.mood ?? 0;
  }, []);

  const dsIsDragonReady = useCallback((dragonId: string): boolean => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return false;
    if (dragon.isHatching) return false;
    return dragon.health > 20 && dragon.hunger > 10;
  }, []);

  // ---- HABITATS ----

  const dsGetHabitats = useCallback((): DSHabitatInstance[] => {
    return stateRef.current.habitats;
  }, []);

  const dsUnlockHabitat = useCallback((habitatId: string): boolean => {
    const habitatType = DS_HABITATS.find(h => h.id === habitatId);
    if (!habitatType) return false;

    if (stateRef.current.coins < habitatType.unlockCost) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - habitatType.unlockCost,
      habitats: prev.habitats.map(h =>
        h.habitatTypeId === habitatId ? { ...h, unlocked: true } : h
      ),
    }));
    return true;
  }, []);

  const dsAssignDragon = useCallback((dragonId: string, habitatId: string): boolean => {
    const habitat = stateRef.current.habitats.find(h => h.id === habitatId);
    if (!habitat || !habitat.unlocked) return false;

    const habitatType = DS_HABITATS.find(ht => ht.id === habitat.habitatTypeId);
    if (!habitatType) return false;

    if (habitat.dragonIds.length >= habitatType.capacity) return false;

    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon || dragon.isHatching) return false;

    setState(prev => {
      const updatedDragons = prev.dragons.map(d =>
        d.id === dragonId ? { ...d, habitatId } : d
      );
      const updatedHabitats = prev.habitats.map(h => {
        if (h.id === habitatId) {
          if (!h.dragonIds.includes(dragonId)) {
            return { ...h, dragonIds: [...h.dragonIds, dragonId] };
          }
        }
        if (h.dragonIds.includes(dragonId) && h.id !== habitatId) {
          return { ...h, dragonIds: h.dragonIds.filter(id => id !== dragonId) };
        }
        return h;
      });
      return { ...prev, dragons: updatedDragons, habitats: updatedHabitats };
    });
    return true;
  }, []);

  const dsRemoveDragonFromHabitat = useCallback((dragonId: string): boolean => {
    setState(prev => {
      const dragon = prev.dragons.find(d => d.id === dragonId);
      if (!dragon) return prev;

      return {
        ...prev,
        dragons: prev.dragons.map(d =>
          d.id === dragonId ? { ...d, habitatId: null } : d
        ),
        habitats: prev.habitats.map(h => ({
          ...h,
          dragonIds: h.dragonIds.filter(id => id !== dragonId),
        })),
      };
    });
    return true;
  }, []);

  const dsGetHabitatEfficiency = useCallback((habitatId: string): number => {
    const habitat = stateRef.current.habitats.find(h => h.id === habitatId);
    if (!habitat || !habitat.unlocked) return 0;

    const habitatType = DS_HABITATS.find(ht => ht.id === habitat.habitatTypeId);
    if (!habitatType) return 0;

    let efficiency = 50; // base efficiency
    efficiency += habitatType.comfortBonus;
    efficiency += habitat.cleanliness * 0.2;
    efficiency -= (habitat.dragonIds.length / habitatType.capacity) * 10; // overcrowding penalty

    const dragons = stateRef.current.dragons.filter(d => habitat.dragonIds.includes(d.id));
    for (const dragon of dragons) {
      const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
      if (species && species.element === habitatType.element) {
        efficiency += 10;
      }
      efficiency += dragon.mood * 0.1;
    }

    return Math.max(0, Math.min(100, Math.floor(efficiency)));
  }, []);

  // ---- BREEDING ----

  const dsBreedDragons = useCallback((dragonId1: string, dragonId2: string): DSBreedingResult | null => {
    const d1 = stateRef.current.dragons.find(d => d.id === dragonId1);
    const d2 = stateRef.current.dragons.find(d => d.id === dragonId2);
    if (!d1 || !d2 || d1.isHatching || d2.isHatching) return null;
    if (d1.id === d2.id) return null;
    if (d1.level < 5 || d2.level < 5) return null;

    return dsGetBreedingResult(dragonId1, dragonId2);
  }, []);

  const dsGetBreedingResult = useCallback((dragonId1: string, dragonId2: string): DSBreedingResult => {
    const rng = createSeededPRNG(
      (dragonId1.charCodeAt(2) * 7 + dragonId2.charCodeAt(2) * 13 + Date.now()) & 0xFFFFFFFF
    );

    const d1 = stateRef.current.dragons.find(d => d.id === dragonId1);
    const d2 = stateRef.current.dragons.find(d => d.id === dragonId2);

    const elem1: DSElement = d1 ? (DS_DRAGONS.find(s => s.id === d1.speciesId)?.element ?? 'fire') : 'fire';
    const elem2: DSElement = d2 ? (DS_DRAGONS.find(s => s.id === d2.speciesId)?.element ?? 'fire') : 'fire';

    const elementMix = [elem1, elem2];
    const primaryElement = rng() > 0.5 ? elem1 : elem2;
    const sameElement = elem1 === elem2;

    const sameElementSpecies = DS_DRAGONS.filter(s => s.element === primaryElement);
    const mixedSpecies = DS_DRAGONS.filter(s => s.element === primaryElement);

    const rarityRoll = rng();
    let targetRarity: DSRarity;
    if (sameElement && rarityRoll > 0.7) targetRarity = 'rare';
    else if (sameElement && rarityRoll > 0.9) targetRarity = 'epic';
    else if (rarityRoll > 0.95) targetRarity = 'legendary';
    else if (rarityRoll > 0.75) targetRarity = 'uncommon';
    else targetRarity = 'common';

    const candidateSpecies = sameElementSpecies.length > 0 ? sameElementSpecies : mixedSpecies;
    const filtered = candidateSpecies.filter(s => s.rarity === targetRarity);
    const pool = filtered.length > 0 ? filtered : candidateSpecies;
    const eggSpecies = seededPick(rng, pool);

    const trait1: DSDragonTrait = d1?.trait ?? 'gentle';
    const trait2: DSDragonTrait = d2?.trait ?? 'brave';
    const inheritedTrait = rng() > 0.5 ? trait1 : trait2;

    const hatchTime = targetRarity === 'legendary' ? 100 : targetRarity === 'epic' ? 80 : targetRarity === 'rare' ? 60 : targetRarity === 'uncommon' ? 50 : 40;

    const rarityBonus = sameElement && rng() > 0.6;

    return {
      eggSpeciesId: eggSpecies.id,
      inheritedTrait,
      hatchTime,
      elementMix,
      rarityBonus,
    };
  }, []);

  const dsGetBreedingCompatibility = useCallback((dragonId1: string, dragonId2: string): number => {
    const d1 = stateRef.current.dragons.find(d => d.id === dragonId1);
    const d2 = stateRef.current.dragons.find(d => d.id === dragonId2);
    if (!d1 || !d2) return 0;
    if (d1.id === d2.id) return 0;

    let compatibility = 50;
    const s1 = DS_DRAGONS.find(s => s.id === d1.speciesId);
    const s2 = DS_DRAGONS.find(s => s.id === d2.speciesId);
    if (s1 && s2 && s1.element === s2.element) compatibility += 25;
    if (d1.trait === d2.trait) compatibility += 10;
    if (d1.level >= 10 && d2.level >= 10) compatibility += 10;
    if (d1.level < 5 || d2.level < 5) compatibility -= 30;
    compatibility += Math.min(d1.mood + d2.mood, 50) * 0.1;

    return Math.max(0, Math.min(100, Math.floor(compatibility)));
  }, []);

  // ---- ABILITIES ----

  const dsGetAbilities = useCallback((): readonly DSAbility[] => {
    return DS_ABILITIES;
  }, []);

  const dsGetDragonAbilities = useCallback((dragonId: string): DSAbility[] => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return [];
    return DS_ABILITIES.filter(a => dragon.abilities.includes(a.id));
  }, []);

  const dsTeachAbility = useCallback((dragonId: string, abilityId: string): boolean => {
    const ability = DS_ABILITIES.find(a => a.id === abilityId);
    if (!ability) return false;

    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon || dragon.isHatching) return false;
    if (dragon.abilities.includes(abilityId)) return false;

    const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
    if (!species) return false;

    if (!ability.requiredElement.includes(species.element)) return false;
    if (dragon.level < ability.unlockLevel) return false;

    if (stateRef.current.coins < 100) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - 100,
      dragons: prev.dragons.map(d =>
        d.id === dragonId ? { ...d, abilities: [...d.abilities, abilityId] } : d
      ),
    }));
    return true;
  }, []);

  const dsUseAbility = useCallback(
    (dragonId: string, abilityId: string): { damage: number; healed: number; effective: boolean } => {
      const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
      const ability = DS_ABILITIES.find(a => a.id === abilityId);
      if (!dragon || !ability) return { damage: 0, healed: 0, effective: false };
      if (!dragon.abilities.includes(abilityId)) return { damage: 0, healed: 0, effective: false };

      const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
      const elementBonus = species ? 1.0 : 0.5;
      const moodMultiplier = 0.8 + (dragon.mood / 100) * 0.4;
      const levelMultiplier = 1 + dragon.level * 0.02;

      if (ability.power < 0) {
        const healed = Math.floor(Math.abs(ability.power) * elementBonus * moodMultiplier * levelMultiplier);
        return { damage: 0, healed, effective: true };
      }

      const baseDamage = ability.power * elementBonus * moodMultiplier * levelMultiplier;
      const rng = createSeededPRNG(dragonId.charCodeAt(2) + abilityId.charCodeAt(0) + Date.now());
      const critRoll = rng();
      const isCrit = critRoll > 0.85;
      const finalDamage = Math.floor(baseDamage * (isCrit ? 1.5 : 1));

      return { damage: finalDamage, healed: 0, effective: true, ...(isCrit ? { crit: true } : {}) };
    },
    []
  );

  const dsGetElementalBonus = useCallback((dragonId: string): number => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return 0;

    const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
    if (!species) return 0;

    const habitat = stateRef.current.habitats.find(h =>
      h.id === dragon.habitatId
    );
    if (!habitat) return 0;

    const habitatType = DS_HABITATS.find(ht => ht.id === habitat.habitatTypeId);
    if (!habitatType) return 0;

    if (species.element === habitatType.element) return habitatType.comfortBonus;
    return 0;
  }, []);

  const dsGetDragonElementAdvantage = useCallback(
    (attackerId: string, defenderId: string): number => {
      const attacker = stateRef.current.dragons.find(d => d.id === attackerId);
      const defender = stateRef.current.dragons.find(d => d.id === defenderId);
      if (!attacker || !defender) return 1;

      const aSpecies = DS_DRAGONS.find(s => s.id === attacker.speciesId);
      const dSpecies = DS_DRAGONS.find(s => s.id === defender.speciesId);
      if (!aSpecies || !dSpecies) return 1;

      return getElementAdvantage(aSpecies.element, dSpecies.element);
    },
    []
  );

  const dsCalculateBattlePower = useCallback((dragonId: string): number => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return 0;

    const stats = dsGetDragonStats(dragonId);
    if (!stats) return 0;

    const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
    const rarityMultiplier = species
      ? species.rarity === 'legendary' ? 2.0 : species.rarity === 'epic' ? 1.6 : species.rarity === 'rare' ? 1.3 : species.rarity === 'uncommon' ? 1.1 : 1.0
      : 1.0;

    const moodMultiplier = 0.7 + (dragon.mood / 100) * 0.6;
    const healthMultiplier = 0.5 + (dragon.health / 100) * 0.5;
    const levelMultiplier = 1 + dragon.level * 0.015;

    const totalStats = stats.maxHP + stats.attack * 2 + stats.defense * 1.5 + stats.speed * 1.2 + stats.magic * 1.8;

    return Math.floor(totalStats * rarityMultiplier * moodMultiplier * healthMultiplier * levelMultiplier);
  }, [dsGetDragonStats]);

  // ---- QUESTS ----

  const dsGetQuests = useCallback((): readonly DSQuest[] => {
    return DS_QUESTS;
  }, []);

  const dsAcceptQuest = useCallback((questId: string): boolean => {
    const quest = DS_QUESTS.find(q => q.id === questId);
    if (!quest) return false;
    if (stateRef.current.level < quest.requiredLevel) return false;

    const alreadyAccepted = stateRef.current.questProgress.find(qp => qp.questId === questId);
    if (alreadyAccepted) return false;

    setState(prev => ({
      ...prev,
      questProgress: [
        ...prev.questProgress,
        { questId, accepted: true, currentStep: 0, completed: false, rewardClaimed: false },
      ],
    }));
    return true;
  }, []);

  const dsCompleteQuest = useCallback((questId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const quest = DS_QUESTS.find(q => q.id === questId);
    const progress = stateRef.current.questProgress.find(qp => qp.questId === questId);

    if (!quest || !progress || !progress.accepted || progress.completed) {
      return { success: false, xpGained: 0, coinsGained: 0 };
    }

    setState(prev => ({
      ...prev,
      questProgress: prev.questProgress.map(qp =>
        qp.questId === questId ? { ...qp, completed: true, rewardClaimed: true } : qp
      ),
      xp: prev.xp + quest.rewardXP,
      coins: prev.coins + quest.rewardCoins,
      totalQuestsCompleted: prev.totalQuestsCompleted + 1,
    }));

    return { success: true, xpGained: quest.rewardXP, coinsGained: quest.rewardCoins };
  }, []);

  const dsGetActiveQuests = useCallback((): DSQuestProgress[] => {
    return stateRef.current.questProgress.filter(qp => qp.accepted && !qp.completed);
  }, []);

  const dsGetCompletedQuests = useCallback((): DSQuestProgress[] => {
    return stateRef.current.questProgress.filter(qp => qp.completed);
  }, []);

  const dsGetQuestProgress = useCallback((questId: string): number => {
    const progress = stateRef.current.questProgress.find(qp => qp.questId === questId);
    return progress?.currentStep ?? 0;
  }, []);

  // ---- EQUIPMENT ----

  const dsGetEquipment = useCallback((): readonly DSEquipment[] => {
    return DS_EQUIPMENT;
  }, []);

  const dsEquipItem = useCallback((dragonId: string, equipmentInstanceId: string): boolean => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    const inst = stateRef.current.inventory.find(i => i.id === equipmentInstanceId);
    if (!dragon || !inst) return false;
    if (dragon.isHatching) return false;

    const equip = DS_EQUIPMENT.find(e => e.id === inst.equipmentId);
    if (!equip) return false;

    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.id === equipmentInstanceId ? { ...i, dragonId } : i
      ),
      dragons: prev.dragons.map(d => {
        if (d.id !== dragonId) return d;
        switch (equip.slot) {
          case 'saddle':
            return { ...d, equippedSaddle: equipmentInstanceId };
          case 'armor':
            return { ...d, equippedArmor: equipmentInstanceId };
          case 'accessory':
            return { ...d, equippedAccessory: equipmentInstanceId };
          default:
            return d;
        }
      }),
    }));
    return true;
  }, []);

  const dsUnequipItem = useCallback((dragonId: string, equipmentInstanceId: string): boolean => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return false;

    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(i =>
        i.id === equipmentInstanceId ? { ...i, dragonId: null } : i
      ),
      dragons: prev.dragons.map(d => {
        if (d.id !== dragonId) return d;
        return {
          ...d,
          equippedSaddle: d.equippedSaddle === equipmentInstanceId ? null : d.equippedSaddle,
          equippedArmor: d.equippedArmor === equipmentInstanceId ? null : d.equippedArmor,
          equippedAccessory: d.equippedAccessory === equipmentInstanceId ? null : d.equippedAccessory,
        };
      }),
    }));
    return true;
  }, []);

  const dsBuyEquipment = useCallback((equipmentId: string): DSEquipmentInstance | null => {
    const equip = DS_EQUIPMENT.find(e => e.id === equipmentId);
    if (!equip) return null;
    if (stateRef.current.coins < equip.cost) return null;

    const maxDur = equip.rarity === 'legendary' ? 200 : equip.rarity === 'epic' ? 150 : equip.rarity === 'rare' ? 100 : equip.rarity === 'uncommon' ? 75 : 50;

    const newInstance: DSEquipmentInstance = {
      id: generateId(),
      equipmentId: equip.id,
      dragonId: null,
      durability: maxDur,
      maxDurability: maxDur,
    };

    setState(prev => ({
      ...prev,
      coins: prev.coins - equip.cost,
      inventory: [...prev.inventory, newInstance],
    }));

    return newInstance;
  }, []);

  const dsSellEquipment = useCallback((equipmentInstanceId: string): number => {
    const inst = stateRef.current.inventory.find(i => i.id === equipmentInstanceId);
    if (!inst) return 0;

    const equip = DS_EQUIPMENT.find(e => e.id === inst.equipmentId);
    if (!equip) return 0;

    const sellPrice = Math.floor(equip.cost * 0.4 * (inst.durability / inst.maxDurability));

    setState(prev => ({
      ...prev,
      coins: prev.coins + sellPrice,
      inventory: prev.inventory.filter(i => i.id !== equipmentInstanceId),
      dragons: prev.dragons.map(d => ({
        ...d,
        equippedSaddle: d.equippedSaddle === equipmentInstanceId ? null : d.equippedSaddle,
        equippedArmor: d.equippedArmor === equipmentInstanceId ? null : d.equippedArmor,
        equippedAccessory: d.equippedAccessory === equipmentInstanceId ? null : d.equippedAccessory,
      })),
    }));

    return sellPrice;
  }, []);

  const dsGetInventory = useCallback((): DSEquipmentInstance[] => {
    return stateRef.current.inventory;
  }, []);

  const dsGetEquippedItems = useCallback((dragonId: string): DSEquipmentInstance[] => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return [];

    const ids: string[] = [];
    if (dragon.equippedSaddle) ids.push(dragon.equippedSaddle);
    if (dragon.equippedArmor) ids.push(dragon.equippedArmor);
    if (dragon.equippedAccessory) ids.push(dragon.equippedAccessory);

    return stateRef.current.inventory.filter(i => ids.includes(i.id));
  }, []);

  const dsGetDragonHealth = useCallback((dragonId: string): { hp: number; maxHP: number; healthPercent: number } | null => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon) return null;
    return { hp: dragon.hp, maxHP: dragon.maxHP, healthPercent: Math.floor((dragon.hp / dragon.maxHP) * 100) };
  }, []);

  // ---- ACHIEVEMENTS ----

  const dsGetAchievements = useCallback((): readonly DSAchievement[] => {
    return DS_ACHIEVEMENTS;
  }, []);

  const dsCheckAchievements = useCallback((): DSAchievement[] => {
    const s = stateRef.current;
    const newAchievements: DSAchievement[] = [];

    const conditions: Record<string, boolean> = {
      'totalHatched >= 1': s.totalHatched >= 1,
      'dragonCount >= 5': s.dragons.length >= 5,
      'dragonCount >= 10': s.dragons.length >= 10,
      'totalBreeds >= 5': s.totalBreeds >= 5,
      'totalBattlesWon >= 20': s.totalBattlesWon >= 20,
      'totalQuestsCompleted >= 10': s.totalQuestsCompleted >= 10,
      'coins >= 10000': s.coins >= 10000,
      'habitatsUnlocked >= 8': s.habitats.filter(h => h.unlocked).length >= 8,
      'maxDragonLevel >= 50': s.dragons.some(d => d.level >= 50),
      'elementCount >= 8': (() => {
        const elements = new Set(s.dragons.map(d => DS_DRAGONS.find(sp => sp.id === d.speciesId)?.element).filter(Boolean));
        return elements.size >= 8;
      })(),
      'hasLegendary >= 1': s.dragons.some(d => {
        const sp = DS_DRAGONS.find(species => species.id === d.speciesId);
        return sp?.rarity === 'legendary';
      }),
      'dailyStreak >= 7': s.dailyTasks.filter(t => t.claimed).length >= 3,
      'potionsUsed >= 20': s.totalFed >= 20,
      'fullyEquipped >= 1': s.dragons.some(d => d.equippedSaddle && d.equippedArmor && d.equippedAccessory),
      'playerLevel >= 50': s.level >= 50,
    };

    for (const ach of DS_ACHIEVEMENTS) {
      if (!s.achievements.includes(ach.id) && conditions[ach.condition]) {
        newAchievements.push(ach);
        setState(prev => ({
          ...prev,
          achievements: [...prev.achievements, ach.id],
          xp: prev.xp + ach.rewardXP,
          coins: prev.coins + ach.rewardCoins,
        }));
      }
    }

    return newAchievements;
  }, []);

  // ---- DAILY TASKS ----

  const dsGetDailyTask = useCallback((): DSDailyTask[] => {
    return stateRef.current.dailyTasks;
  }, []);

  const dsClaimDailyReward = useCallback(
    (taskId: string): { xpGained: number; coinsGained: number } => {
      const task = stateRef.current.dailyTasks.find(t => t.id === taskId);
      if (!task || !task.completed || task.claimed) return { xpGained: 0, coinsGained: 0 };

      setState(prev => ({
        ...prev,
        xp: prev.xp + task.rewardXP,
        coins: prev.coins + task.rewardCoins,
        dailyTasks: prev.dailyTasks.map(t =>
          t.id === taskId ? { ...t, claimed: true } : t
        ),
      }));

      return { xpGained: task.rewardXP, coinsGained: task.rewardCoins };
    },
    []
  );

  const dsUpdateDailyProgress = useCallback(
    (taskId: string, increment: number): boolean => {
      setState(prev => ({
        ...prev,
        dailyTasks: prev.dailyTasks.map(t => {
          if (t.id !== taskId || t.completed) return t;
          const newProgress = Math.min(t.target, t.progress + increment);
          return { ...t, progress: newProgress, completed: newProgress >= t.target };
        }),
      }));
      return true;
    },
    []
  );

  const dsRefreshDailyTasks = useCallback((): void => {
    setState(prev => ({
      ...prev,
      dailyTasks: createInitialDailyTasks(Date.now() % 100000),
    }));
  }, []);

  // ---- NPC INTERACTIONS ----

  const dsGetNPCDialogue = useCallback(
    (npcId: string, context: 'greeting' | 'trade' | 'quest' | 'breed' | 'heal' | 'train'): string => {
      const npc = DS_NPCS.find(n => n.id === npcId);
      if (!npc) return 'This person does not seem to be here.';

      const dialogues: Record<string, Record<string, string[]>> = {
        npc_eldric: {
          greeting: [npc.greeting],
          trade: ['I have no wares, but I can teach you about dragon lore.'],
          quest: ['The ancient texts speak of great trials ahead, keeper.'],
          breed: ['Dragon genetics are fascinating! Each offspring carries unique traits.'],
          heal: ['Rest is the greatest healer. Ensure your dragons sleep well.'],
          train: ['Training sharpens both dragon and keeper alike.'],
        },
        npc_pyra: {
          greeting: [npc.greeting],
          trade: ['I have spare fire-resistant gear if you need it.'],
          quest: ['A fire dragon makes quick work of ice-based threats.'],
          breed: ['Cross-breeding fire with shadow produces fearsome offspring!'],
          heal: ['A warm bath in the volcanic spring does wonders for fire dragons.'],
          train: ['The Flame Forge is the best place for fire dragon training.'],
        },
        npc_glacius: {
          greeting: [npc.greeting],
          trade: ['I can provide frost-resistant provisions for cold journeys.'],
          quest: ['The frozen peaks hold many secrets waiting to be discovered.'],
          breed: ['Ice and water dragons share a deep elemental bond.'],
          heal: ['Let me tend to any frostbites or ice-related injuries.'],
          train: ['The Glacier Wall builds true resilience.'],
        },
        npc_thorin: {
          greeting: [npc.greeting],
          trade: ['Welcome to my forge! I have the finest dragon equipment available.'],
          quest: ['I need rare metals from the Crystal Cavern. Can you help?'],
          breed: ['Strong parents make strong offspring. Equip them well!'],
          heal: ['I can repair damaged armor if you bring it to me.'],
          train: ['A well-armored dragon fights with confidence!'],
        },
        npc_selene: {
          greeting: [npc.greeting],
          trade: ['I sell healing potions and restorative items.'],
          quest: ['There are injured wild dragons that need our help.'],
          breed: ['Healthy dragons produce healthier offspring. Keep them fed!'],
          heal: ['Let me examine your dragon and provide the best treatment.'],
          train: ['Rest between training sessions is essential for growth.'],
        },
        npc_zephyr: {
          greeting: [npc.greeting],
          trade: ['I sell special breeding supplements and compatibility charms.'],
          quest: ['Study rare dragon species in the wild for my research.'],
          breed: ['The key to great breeding is matching complementary traits.'],
          heal: ['A happy dragon is a healthy dragon!'],
          train: ['Breeding success improves when both parents are well-trained.'],
        },
        npc_nyx: {
          greeting: [npc.greeting],
          trade: ['I deal in rare shadow artifacts and mysterious items.'],
          quest: ['Dark forces gather. I have urgent missions for the brave.'],
          breed: ['Shadow dragons are elusive. Handle them with care.'],
          heal: ['Some wounds go deeper than flesh. I know remedies for all.'],
          train: ['The Shadow Maze is the ultimate test of a dragons cunning.'],
        },
        npc_aurum: {
          greeting: [npc.greeting],
          trade: ['Everything has a price, friend. Browse my collection!'],
          quest: ['Gold opens doors. Earn coins and the world is yours.'],
          breed: ['Rare dragon eggs sell for a fortune, you know.'],
          heal: ['I sell the finest health elixirs money can buy.'],
          train: ['Quality training costs quality coin, but the results speak for themselves.'],
        },
      };

      const contextDialogues = dialogues[npcId]?.[context];
      if (!contextDialogues || contextDialogues.length === 0) {
        return '...';
      }

      const rng = createSeededPRNG(npcId.charCodeAt(4) + context.length + (Date.now() % 3600));
      return contextDialogues[Math.floor(rng() * contextDialogues.length)];
    },
    []
  );

  // ---- LEVEL & PROGRESSION ----

  const dsGetLevelUpRewards = useCallback((level: number): { coins: number; unlockDescription: string } => {
    if (level % 5 === 0) {
      return {
        coins: level * 50,
        unlockDescription: level >= 50
          ? 'Maximum level reached! You are a true Dragon Legend!'
          : `Level ${level} milestone! New quests and equipment unlocked.`,
      };
    }
    return { coins: level * 10, unlockDescription: `You reached level ${level}! Keep growing, keeper.` };
  }, []);

  const dsGetTitleForLevel = useCallback((level: number): string => {
    let title = 'Hatchling Keeper';
    for (const t of DS_TITLE_THRESHOLDS) {
      if (level >= t.level) title = t.title;
    }
    return title;
  }, []);

  const dsEvolveDragon = useCallback((dragonId: string): boolean => {
    const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
    if (!dragon || dragon.level < DS_MAX_LEVEL) return false;
    if (stateRef.current.coins < 200) return false;

    setState(prev => ({
      ...prev,
      coins: prev.coins - 200,
      dragons: prev.dragons.map(d => {
        if (d.id !== dragonId) return d;
        return {
          ...d,
          maxHP: Math.floor(d.maxHP * 1.25),
          hp: Math.floor(d.hp * 1.25),
          attack: Math.floor(d.attack * 1.2),
          defense: Math.floor(d.defense * 1.2),
          speed: Math.floor(d.speed * 1.15),
          magic: Math.floor(d.magic * 1.2),
        };
      }),
    }));
    return true;
  }, []);

  // ---- SHOP / UTILITY ----

  const dsGetShopItems = useCallback((): { foods: typeof DS_FOODS; potions: typeof DS_POTIONS; equipment: typeof DS_EQUIPMENT } => {
    return {
      foods: DS_FOODS,
      potions: DS_POTIONS,
      equipment: DS_EQUIPMENT,
    };
  }, []);

  const dsGetHabitatCapacity = useCallback((habitatId: string): { current: number; max: number } => {
    const habitat = stateRef.current.habitats.find(h => h.id === habitatId);
    if (!habitat) return { current: 0, max: 0 };
    const type = DS_HABITATS.find(ht => ht.id === habitat.habitatTypeId);
    return {
      current: habitat.dragonIds.length,
      max: type?.capacity ?? 0,
    };
  }, []);

  const dsGetSpeciesInfo = useCallback((speciesId: string): DSDragonSpecies | null => {
    return DS_DRAGONS.find(d => d.id === speciesId) ?? null;
  }, []);

  const dsGetHabitatTypeInfo = useCallback((habitatTypeId: string): DSHabitatType | null => {
    return DS_HABITATS.find(h => h.id === habitatTypeId) ?? null;
  }, []);

  const dsAdvanceHatch = useCallback((dragonId: string, ticks: number): DSDragonInstance | null => {
    let result: DSDragonInstance | null = null;
    setState(prev => ({
      ...prev,
      dragons: prev.dragons.map(d => {
        if (d.id !== dragonId || !d.isHatching) return d;
        const newProgress = Math.min(100, d.hatchProgress + ticks);
        const updated: DSDragonInstance = {
          ...d,
          hatchProgress: newProgress,
          isHatching: newProgress < 100,
        };
        if (newProgress >= 100) {
          result = updated;
        }
        return updated;
      }),
    }));
    return result;
  }, []);

  const dsRecordBattleWin = useCallback((): void => {
    setState(prev => ({
      ...prev,
      totalBattlesWon: prev.totalBattlesWon + 1,
      xp: prev.xp + 25,
      coins: prev.coins + 50,
    }));
  }, []);

  const dsRecordBreed = useCallback((): void => {
    setState(prev => ({
      ...prev,
      totalBreeds: prev.totalBreeds + 1,
    }));
  }, []);

  const dsCleanHabitat = useCallback((habitatId: string): boolean => {
    setState(prev => ({
      ...prev,
      habitats: prev.habitats.map(h =>
        h.id === habitatId ? { ...h, cleanliness: 100 } : h
      ),
    }));
    return true;
  }, []);

  const dsGetHabitatTypeInfoById = useCallback((habitatTypeId: string): DSHabitatType | null => {
    return DS_HABITATS.find(h => h.id === habitatTypeId) ?? null;
  }, []);

  const dsGetUnlockedAbilitiesForDragon = useCallback(
    (dragonId: string): DSAbility[] => {
      const dragon = stateRef.current.dragons.find(d => d.id === dragonId);
      if (!dragon) return [];

      const species = DS_DRAGONS.find(s => s.id === dragon.speciesId);
      if (!species) return [];

      return DS_ABILITIES.filter(
        a =>
          a.requiredElement.includes(species.element) &&
          a.unlockLevel <= dragon.level &&
          !dragon.abilities.includes(a.id)
      );
    },
    []
  );

  const dsGetShopItemsBySlot = useCallback(
    (slot: DSEquipmentSlot): DSEquipment[] => {
      return DS_EQUIPMENT.filter(e => e.slot === slot);
    },
    []
  );

  const dsGetAllSpeciesByElement = useCallback((element: DSElement): DSDragonSpecies[] => {
    return DS_DRAGONS.filter(d => d.element === element);
  }, []);

  const dsGetAllSpeciesByRarity = useCallback((rarity: DSRarity): DSDragonSpecies[] => {
    return DS_DRAGONS.filter(d => d.rarity === rarity);
  }, []);

  // ---- COMPREHENSIVE OBJECT RETURN ----

  return {
    // State
    dsGetState,
    dsResetState,
    dsGetLevel,
    dsGetTitle,
    dsGetProgress,
    // Economy
    dsAddXP,
    dsGetCoins,
    dsAddCoins,
    dsSpendCoins,
    // Dragons
    dsGetDragons,
    dsHatchDragon,
    dsFeedDragon,
    dsTrainDragon,
    dsHealDragon,
    dsGetActiveDragon,
    dsSetActiveDragon,
    dsSetDragonName,
    dsAddDragonXP,
    dsGetDragonStats,
    dsGetDragonLevel,
    dsGetDragonMood,
    dsIsDragonReady,
    dsEvolveDragon,
    dsAdvanceHatch,
    // Habitats
    dsGetHabitats,
    dsUnlockHabitat,
    dsAssignDragon,
    dsRemoveDragonFromHabitat,
    dsGetHabitatEfficiency,
    dsGetHabitatCapacity,
    dsCleanHabitat,
    // Breeding
    dsBreedDragons,
    dsGetBreedingResult,
    dsGetBreedingCompatibility,
    dsRecordBreed,
    // Abilities
    dsGetAbilities,
    dsGetDragonAbilities,
    dsTeachAbility,
    dsUseAbility,
    dsGetElementalBonus,
    dsGetDragonElementAdvantage,
    dsCalculateBattlePower,
    dsGetUnlockedAbilitiesForDragon,
    // Quests
    dsGetQuests,
    dsAcceptQuest,
    dsCompleteQuest,
    dsGetActiveQuests,
    dsGetCompletedQuests,
    dsGetQuestProgress,
    // Equipment
    dsGetEquipment,
    dsEquipItem,
    dsUnequipItem,
    dsBuyEquipment,
    dsSellEquipment,
    dsGetInventory,
    dsGetEquippedItems,
    dsGetDragonHealth,
    dsGetShopItemsBySlot,
    // Achievements
    dsGetAchievements,
    dsCheckAchievements,
    // Daily
    dsGetDailyTask,
    dsClaimDailyReward,
    dsUpdateDailyProgress,
    dsRefreshDailyTasks,
    // NPC
    dsGetNPCDialogue,
    // Level & Progression
    dsGetLevelUpRewards,
    dsGetTitleForLevel,
    // Shop
    dsGetShopItems,
    // Battle
    dsRecordBattleWin,
    // Info lookups
    dsGetSpeciesInfo,
    dsGetHabitatTypeInfo,
    dsGetHabitatTypeInfoById,
    dsGetAllSpeciesByElement,
    dsGetAllSpeciesByRarity,
  };
}

export default useDragonSanctuary;
