// ==========================================
// Nether Underground Wire
// Underground Cave Exploration - Word Snake Feature Module  
// ==========================================

import { useState } from 'react';

const NU_STORAGE_KEY = 'nether-underground-save';

export type ZoneId = 'mossy-caverns' | 'crystal-grotto' | 'lava-tubes' | 'frozen-depths' | 'mycelium-network' | 'iron-labyrinth' | 'void-chasm' | 'amber-palace' | 'shadow-realm' | 'abyssal-core';
export type ExplorerClassId = 'spelunker' | 'miner' | 'geologist' | 'ranger' | 'alchemist' | 'warrior' | 'shadow-walker' | 'void-seer';
export type OreId = 'copper' | 'iron-ore' | 'silver' | 'gold-ore' | 'sapphire' | 'ruby' | 'emerald' | 'diamond' | 'obsidian' | 'void-crystal' | 'amber' | 'mythril' | 'dark-quartz' | 'shadow-gem' | 'star-metal';
export type CreatureId = 'cave-spider' | 'rock-golem' | 'crystal-bat' | 'deep-worm' | 'fire-salamander' | 'frost-wraith' | 'fungus-giant' | 'iron-beetle' | 'shadow-lurker' | 'lava-serpent' | 'void-specter' | 'amber-wasp' | 'dark-crystal' | 'abyss-jellyfish' | 'stone-titan' | 'mythril-golem' | 'shadow-dragon' | 'void-reaper' | 'elder-wyrm' | 'core-guardian';
export type EquipmentSlot = 'head' | 'body' | 'hands' | 'feet' | 'lantern';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type ResourceId = 'iron' | 'gold' | 'crystal' | 'darkMatter' | 'torchOil' | 'rations';
export type StructureId = 'shelter' | 'forge' | 'mine' | 'lighthouse' | 'armory' | 'lab' | 'portal-frame' | 'nexus-portal';

export const ZONES: Array<{ id: ZoneId; name: string; depth: number; hazard: string; rankReq: number }> = [
  { id: 'mossy-caverns', name: 'Mossy Caverns', depth: 100, hazard: 'Slippery floors', rankReq: 1 },
  { id: 'crystal-grotto', name: 'Crystal Grotto', depth: 250, hazard: 'Crystal shards', rankReq: 5 },
  { id: 'lava-tubes', name: 'Lava Tubes', depth: 500, hazard: 'Lava pools', rankReq: 10 },
  { id: 'frozen-depths', name: 'Frozen Depths', depth: 750, hazard: 'Freezing cold', rankReq: 15 },
  { id: 'mycelium-network', name: 'Mycelium Network', depth: 1000, hazard: 'Spore clouds', rankReq: 20 },
  { id: 'iron-labyrinth', name: 'Iron Labyrinth', depth: 1500, hazard: 'Shifting walls', rankReq: 25 },
  { id: 'void-chasm', name: 'Void Chasm', depth: 2000, hazard: 'Gravity wells', rankReq: 30 },
  { id: 'amber-palace', name: 'Amber Palace', depth: 3000, hazard: 'Amber traps', rankReq: 35 },
  { id: 'shadow-realm', name: 'Shadow Realm', depth: 4000, hazard: 'Darkness', rankReq: 40 },
  { id: 'abyssal-core', name: 'Abyssal Core', depth: 5000, hazard: 'Void energy', rankReq: 45 },
];

export const EXPLORER_CLASSES: Array<{ id: ExplorerClassId; name: string; strength: number; agility: number; perception: number; endurance: number; luck: number; description: string; unlockLevel: number }> = [
  { id: 'spelunker', name: 'Spelunker', strength: 5, agility: 7, perception: 6, endurance: 5, luck: 4, description: 'Balanced explorer', unlockLevel: 1 },
  { id: 'miner', name: 'Miner', strength: 8, agility: 3, perception: 5, endurance: 7, luck: 3, description: 'Mining specialist', unlockLevel: 1 },
  { id: 'geologist', name: 'Geologist', strength: 3, agility: 4, perception: 9, endurance: 4, luck: 5, description: 'Ore detection bonus', unlockLevel: 5 },
  { id: 'ranger', name: 'Ranger', strength: 5, agility: 9, perception: 6, endurance: 4, luck: 4, description: 'Speed and evasion', unlockLevel: 10 },
  { id: 'alchemist', name: 'Alchemist', strength: 3, agility: 4, perception: 5, endurance: 5, luck: 8, description: 'Crafting and luck', unlockLevel: 15 },
  { id: 'warrior', name: 'Warrior', strength: 10, agility: 5, perception: 3, endurance: 8, luck: 2, description: 'Combat powerhouse', unlockLevel: 20 },
  { id: 'shadow-walker', name: 'Shadow Walker', strength: 6, agility: 8, perception: 7, endurance: 4, luck: 5, description: 'Stealth and detection', unlockLevel: 30 },
  { id: 'void-seer', name: 'Void Seer', strength: 4, agility: 5, perception: 8, endurance: 5, luck: 8, description: 'Cosmic awareness', unlockLevel: 40 },
];

export const ORES: Array<{ id: OreId; name: string; rarity: Rarity; baseValue: number; hardness: number }> = [
  { id: 'copper', name: 'Copper', rarity: 'common', baseValue: 5, hardness: 1 },
  { id: 'iron-ore', name: 'Iron Ore', rarity: 'common', baseValue: 8, hardness: 2 },
  { id: 'silver', name: 'Silver', rarity: 'common', baseValue: 12, hardness: 2 },
  { id: 'gold-ore', name: 'Gold Ore', rarity: 'uncommon', baseValue: 20, hardness: 3 },
  { id: 'sapphire', name: 'Sapphire', rarity: 'uncommon', baseValue: 30, hardness: 4 },
  { id: 'ruby', name: 'Ruby', rarity: 'uncommon', baseValue: 35, hardness: 4 },
  { id: 'emerald', name: 'Emerald', rarity: 'rare', baseValue: 50, hardness: 5 },
  { id: 'diamond', name: 'Diamond', rarity: 'rare', baseValue: 80, hardness: 6 },
  { id: 'obsidian', name: 'Obsidian', rarity: 'rare', baseValue: 65, hardness: 7 },
  { id: 'void-crystal', name: 'Void Crystal', rarity: 'rare', baseValue: 100, hardness: 8 },
  { id: 'amber', name: 'Amber', rarity: 'uncommon', baseValue: 25, hardness: 3 },
  { id: 'mythril', name: 'Mythril', rarity: 'legendary', baseValue: 150, hardness: 9 },
  { id: 'dark-quartz', name: 'Dark Quartz', rarity: 'rare', baseValue: 70, hardness: 6 },
  { id: 'shadow-gem', name: 'Shadow Gem', rarity: 'legendary', baseValue: 120, hardness: 8 },
  { id: 'star-metal', name: 'Star Metal', rarity: 'legendary', baseValue: 200, hardness: 10 },
];

export const CREATURES: Array<{ id: CreatureId; name: string; hp: number; attack: number; defense: number; speed: number; zone: ZoneId; loot: string; xpReward: number }> = [
  { id: 'cave-spider', name: 'Cave Spider', hp: 20, attack: 5, defense: 2, speed: 8, zone: 'mossy-caverns', loot: 'iron', xpReward: 15 },
  { id: 'rock-golem', name: 'Rock Golem', hp: 80, attack: 12, defense: 15, speed: 2, zone: 'mossy-caverns', loot: 'copper', xpReward: 25 },
  { id: 'crystal-bat', name: 'Crystal Bat', hp: 30, attack: 8, defense: 3, speed: 10, zone: 'crystal-grotto', loot: 'sapphire', xpReward: 30 },
  { id: 'deep-worm', name: 'Deep Worm', hp: 50, attack: 10, defense: 5, speed: 6, zone: 'crystal-grotto', loot: 'silver', xpReward: 35 },
  { id: 'fire-salamander', name: 'Fire Salamander', hp: 45, attack: 15, defense: 4, speed: 7, zone: 'lava-tubes', loot: 'ruby', xpReward: 45 },
  { id: 'frost-wraith', name: 'Frost Wraith', hp: 55, attack: 12, defense: 8, speed: 9, zone: 'frozen-depths', loot: 'obsidian', xpReward: 50 },
  { id: 'fungus-giant', name: 'Fungus Giant', hp: 100, attack: 14, defense: 12, speed: 3, zone: 'mycelium-network', loot: 'dark-quartz', xpReward: 60 },
  { id: 'iron-beetle', name: 'Iron Beetle', hp: 70, attack: 16, defense: 18, speed: 4, zone: 'iron-labyrinth', loot: 'iron-ore', xpReward: 55 },
  { id: 'shadow-lurker', name: 'Shadow Lurker', hp: 60, attack: 20, defense: 6, speed: 12, zone: 'shadow-realm', loot: 'shadow-gem', xpReward: 70 },
  { id: 'lava-serpent', name: 'Lava Serpent', hp: 90, attack: 18, defense: 10, speed: 8, zone: 'lava-tubes', loot: 'gold-ore', xpReward: 50 },
  { id: 'void-specter', name: 'Void Specter', hp: 75, attack: 22, defense: 8, speed: 10, zone: 'void-chasm', loot: 'void-crystal', xpReward: 75 },
  { id: 'amber-wasp', name: 'Amber Wasp', hp: 40, attack: 14, defense: 3, speed: 14, zone: 'amber-palace', loot: 'amber', xpReward: 55 },
  { id: 'dark-crystal', name: 'Dark Crystal Entity', hp: 120, attack: 25, defense: 20, speed: 5, zone: 'shadow-realm', loot: 'dark-quartz', xpReward: 80 },
  { id: 'abyss-jellyfish', name: 'Abyss Jellyfish', hp: 65, attack: 18, defense: 5, speed: 7, zone: 'abyssal-core', loot: 'void-crystal', xpReward: 85 },
  { id: 'stone-titan', name: 'Stone Titan', hp: 200, attack: 20, defense: 25, speed: 2, zone: 'iron-labyrinth', loot: 'mythril', xpReward: 100 },
  { id: 'mythril-golem', name: 'Mythril Golem', hp: 250, attack: 30, defense: 35, speed: 1, zone: 'abyssal-core', loot: 'mythril', xpReward: 120 },
  { id: 'shadow-dragon', name: 'Shadow Dragon', hp: 300, attack: 35, defense: 28, speed: 8, zone: 'shadow-realm', loot: 'shadow-gem', xpReward: 150 },
  { id: 'void-reaper', name: 'Void Reaper', hp: 350, attack: 40, defense: 30, speed: 10, zone: 'void-chasm', loot: 'star-metal', xpReward: 200 },
  { id: 'elder-wyrm', name: 'Elder Wyrm', hp: 500, attack: 45, defense: 40, speed: 6, zone: 'abyssal-core', loot: 'star-metal', xpReward: 300 },
  { id: 'core-guardian', name: 'Core Guardian', hp: 600, attack: 50, defense: 45, speed: 4, zone: 'abyssal-core', loot: 'star-metal', xpReward: 500 },
];

export const EQUIPMENT: Array<{ id: string; slot: EquipmentSlot; name: string; rarity: Rarity; defense: number; bonus: string; value: number }> = [
  { id: 'leather-cap', slot: 'head', name: 'Leather Cap', rarity: 'common', defense: 2, bonus: '+1 Perception', value: 10 },
  { id: 'iron-helm', slot: 'head', name: 'Iron Helm', rarity: 'uncommon', defense: 5, bonus: '+2 Endurance', value: 30 },
  { id: 'crystal-crown', slot: 'head', name: 'Crystal Crown', rarity: 'rare', defense: 8, bonus: '+3 Luck', value: 80 },
  { id: 'void-helmet', slot: 'head', name: 'Void Helmet', rarity: 'legendary', defense: 15, bonus: '+5 All Stats', value: 200 },
  { id: 'cloth-vest', slot: 'body', name: 'Cloth Vest', rarity: 'common', defense: 3, bonus: '+1 Agility', value: 15 },
  { id: 'chain-mail', slot: 'body', name: 'Chain Mail', rarity: 'uncommon', defense: 7, bonus: '+3 Endurance', value: 45 },
  { id: 'mythril-plate', slot: 'body', name: 'Mythril Plate', rarity: 'rare', defense: 12, bonus: '+5 Strength', value: 120 },
  { id: 'abyss-armor', slot: 'body', name: 'Abyss Armor', rarity: 'legendary', defense: 20, bonus: '+8 All Stats', value: 300 },
  { id: 'cloth-gloves', slot: 'hands', name: 'Cloth Gloves', rarity: 'common', defense: 1, bonus: '+1 Luck', value: 8 },
  { id: 'grip-gauntlets', slot: 'hands', name: 'Grip Gauntlets', rarity: 'uncommon', defense: 3, bonus: '+2 Strength', value: 25 },
  { id: 'miner-mitts', slot: 'hands', name: 'Miner Mitts', rarity: 'rare', defense: 6, bonus: '+4 Mining Speed', value: 70 },
  { id: 'void-grips', slot: 'hands', name: 'Void Grips', rarity: 'legendary', defense: 10, bonus: '+6 Luck, +4 Mining', value: 180 },
  { id: 'sandals', slot: 'feet', name: 'Sandals', rarity: 'common', defense: 1, bonus: '+1 Agility', value: 8 },
  { id: 'iron-boots', slot: 'feet', name: 'Iron Boots', rarity: 'uncommon', defense: 4, bonus: '+2 Endurance', value: 28 },
  { id: 'crystal-treads', slot: 'feet', name: 'Crystal Treads', rarity: 'rare', defense: 7, bonus: '+4 Agility', value: 65 },
  { id: 'void-striders', slot: 'feet', name: 'Void Striders', rarity: 'legendary', defense: 12, bonus: '+6 Speed, +3 Perception', value: 170 },
  { id: 'candle', slot: 'lantern', name: 'Candle', rarity: 'common', defense: 0, bonus: '+1 Vision', value: 5 },
  { id: 'oil-lantern', slot: 'lantern', name: 'Oil Lantern', rarity: 'uncommon', defense: 0, bonus: '+3 Vision', value: 20 },
  { id: 'crystal-lamp', slot: 'lantern', name: 'Crystal Lamp', rarity: 'rare', defense: 0, bonus: '+5 Vision, +2 Luck', value: 60 },
  { id: 'void-beacon', slot: 'lantern', name: 'Void Beacon', rarity: 'legendary', defense: 0, bonus: '+10 Vision, +5 Perception', value: 150 },
];

export const STRUCTURES: Array<{ id: StructureId; name: string; maxLevel: number; baseCost: number; description: string }> = [
  { id: 'shelter', name: 'Shelter', maxLevel: 10, baseCost: 20, description: 'Rest and recovery' },
  { id: 'forge', name: 'Forge', maxLevel: 10, baseCost: 50, description: 'Craft equipment' },
  { id: 'mine', name: 'Mine Shaft', maxLevel: 10, baseCost: 40, description: 'Passive ore generation' },
  { id: 'lighthouse', name: 'Lighthouse', maxLevel: 10, baseCost: 35, description: 'Extend vision range' },
  { id: 'armory', name: 'Armory', maxLevel: 10, baseCost: 60, description: 'Store and upgrade gear' },
  { id: 'lab', name: 'Research Lab', maxLevel: 10, baseCost: 80, description: 'Unlock new recipes' },
  { id: 'portal-frame', name: 'Portal Frame', maxLevel: 10, baseCost: 100, description: 'Fast travel between zones' },
  { id: 'nexus-portal', name: 'Nexus Portal', maxLevel: 10, baseCost: 200, description: 'Access the void' },
];

export const CAVE_EVENTS: Array<{ id: string; name: string; description: string; effect: string }> = [
  { id: 'earthquake', name: 'Earthquake', description: 'The ground shakes violently!', effect: 'damage' },
  { id: 'gas-leak', name: 'Gas Leak', description: 'Toxic gas fills the tunnel!', effect: 'damage' },
  { id: 'treasure-chest', name: 'Treasure Chest', description: 'A chest left by previous explorers!', effect: 'reward' },
  { id: 'underground-river', name: 'Underground River', description: 'A fast-flowing river blocks the path!', effect: 'teleport' },
  { id: 'crystal-bloom', name: 'Crystal Bloom', description: 'Crystals glow with healing energy!', effect: 'heal' },
  { id: 'cave-in', name: 'Cave-In', description: 'Rocks fall from the ceiling!', effect: 'damage' },
  { id: 'ancient-inscription', name: 'Ancient Inscription', description: 'Mysterious writing on the wall...', effect: 'buff' },
  { id: 'fungus-bloom', name: 'Fungus Bloom', description: 'Glowing mushrooms release spores!', effect: 'buff' },
  { id: 'mining-vein', name: 'Mining Vein', description: 'A rich ore vein discovered!', effect: 'reward' },
  { id: 'echo-whisper', name: 'Echo Whisper', description: 'Voices echo from deep below...', effect: 'buff' },
  { id: 'abandoned-camp', name: 'Abandoned Camp', description: 'Supplies left by lost miners!', effect: 'reward' },
  { id: 'void-rift', name: 'Void Rift', description: 'A crack in reality opens!', effect: 'encounter' },
];

export const ARTIFACTS: Array<{ id: string; name: string; rarity: Rarity; lore: string; bonus: string }> = [
  { id: 'moss-stone', name: 'Moss Stone', rarity: 'common', lore: 'A stone covered in ancient moss that never dies.', bonus: '+2 Endurance' },
  { id: 'crystal-shard', name: 'Crystal Shard', rarity: 'common', lore: 'A fragment of the Great Crystal Grotto.', bonus: '+2 Perception' },
  { id: 'lava-heart', name: 'Lava Heart', rarity: 'uncommon', lore: 'The still-beating heart of a lava serpent.', bonus: '+3 Strength' },
  { id: 'frozen-tear', name: 'Frozen Tear', rarity: 'uncommon', lore: 'A tear from a frost wraith, forever frozen.', bonus: '+3 Luck' },
  { id: 'mycelium-crown', name: 'Mycelium Crown', rarity: 'uncommon', lore: 'A crown woven from underground fungus.', bonus: '+2 All Stats' },
  { id: 'iron-fist', name: 'Iron Fist', rarity: 'rare', lore: 'A gauntlet forged in the Iron Labyrinth.', bonus: '+5 Strength, +3 Endurance' },
  { id: 'void-eye', name: 'Void Eye', rarity: 'rare', lore: 'An eye that sees through darkness itself.', bonus: '+6 Perception, +4 Luck' },
  { id: 'amber-soul', name: 'Amber Soul', rarity: 'rare', lore: 'A creature preserved in amber for millennia.', bonus: '+4 All Stats' },
  { id: 'shadow-cloak', name: 'Shadow Cloak', rarity: 'legendary', lore: 'A cloak woven from pure shadow.', bonus: '+8 Agility, +5 Perception' },
  { id: 'abyssal-pearl', name: 'Abyssal Pearl', rarity: 'legendary', lore: 'A pearl from the bottom of the world.', bonus: '+6 All Stats, +10% XP' },
  { id: 'core-fragment', name: 'Core Fragment', rarity: 'legendary', lore: 'A shard of the worlds core.', bonus: '+10 All Stats' },
  { id: 'star-metal-anvil', name: 'Star Metal Anvil', rarity: 'legendary', lore: 'An anvil forged from fallen stars.', bonus: '+8 Strength, +6 Defense' },
];

export const CRAFTING_RECIPES: Array<{ id: string; name: string; ingredients: Record<string, number>; result: string; xp: number }> = [
  { id: 'iron-ingot', name: 'Iron Ingot', ingredients: { 'iron-ore': 3 }, result: 'Iron Ingot', xp: 10 },
  { id: 'gold-bar', name: 'Gold Bar', ingredients: { 'gold-ore': 3 }, result: 'Gold Bar', xp: 15 },
  { id: 'crystal-lens', name: 'Crystal Lens', ingredients: { 'sapphire': 2, 'silver': 1 }, result: 'Crystal Lens', xp: 25 },
  { id: 'torch-bundle', name: 'Torch Bundle', ingredients: { 'iron': 1, 'copper': 1 }, result: '3 Torches', xp: 5 },
  { id: 'healing-salve', name: 'Healing Salve', ingredients: { 'rations': 2 }, result: 'Healing Salve', xp: 10 },
  { id: 'dark-bomb', name: 'Dark Bomb', ingredients: { 'darkMatter': 3 }, result: 'Dark Bomb', xp: 30 },
  { id: 'mythril-blade', name: 'Mythril Blade', ingredients: { 'mythril': 5, 'crystal': 3 }, result: 'Mythril Blade', xp: 80 },
  { id: 'void-scanner', name: 'Void Scanner', ingredients: { 'void-crystal': 2, 'darkMatter': 1 }, result: 'Void Scanner', xp: 50 },
];

export const ACHIEVEMENTS: Array<{ id: string; name: string; description: string; reward: string }> = [
  { id: 'first-descent', name: 'First Descent', description: 'Enter your first cave zone', reward: '50 XP' },
  { id: 'ore-hunter', name: 'Ore Hunter', description: 'Mine 100 ore total', reward: '100 XP' },
  { id: 'creature-slayer', name: 'Creature Slayer', description: 'Defeat 50 creatures', reward: '150 XP' },
  { id: 'deep-explorer', name: 'Deep Explorer', description: 'Reach depth 2000m', reward: '200 XP' },
  { id: 'boss-tamer', name: 'Boss Tamer', description: 'Defeat 3 zone bosses', reward: '300 XP' },
  { id: 'master-miner', name: 'Master Miner', description: 'Mine 500 ore total', reward: '250 XP' },
  { id: 'artifact-collector', name: 'Artifact Collector', description: 'Collect 5 artifacts', reward: '200 XP' },
  { id: 'builder', name: 'Underground Builder', description: 'Build 4 structures to level 5', reward: '300 XP' },
  { id: 'survivor', name: 'Survivor', description: 'Survive 10 cave events', reward: '150 XP' },
  { id: 'legendary-miner', name: 'Legendary Miner', description: 'Mine a legendary ore', reward: '500 XP' },
  { id: 'void-walker', name: 'Void Walker', description: 'Enter the Void Chasm', reward: '400 XP' },
  { id: 'core-reached', name: 'Core Reached', description: 'Reach the Abyssal Core', reward: '1000 XP' },
  { id: 'streak-7', name: 'Week Warrior', description: '7-day expedition streak', reward: '300 XP' },
  { id: 'streak-30', name: 'Monthly Miner', description: '30-day expedition streak', reward: '1000 XP' },
  { id: 'rank-50', name: 'Legendary Explorer', description: 'Reach Explorer rank 50', reward: '2000 XP' },
];

export const MINING_DIFFICULTY: Record<string, { baseTime: number; windowStart: number; windowEnd: number }> = {
  'mossy-caverns': { baseTime: 2000, windowStart: 0.3, windowEnd: 0.7 },
  'crystal-grotto': { baseTime: 1800, windowStart: 0.25, windowEnd: 0.75 },
  'lava-tubes': { baseTime: 1500, windowStart: 0.2, windowEnd: 0.65 },
  'frozen-depths': { baseTime: 1500, windowStart: 0.2, windowEnd: 0.6 },
  'mycelium-network': { baseTime: 1400, windowStart: 0.15, windowEnd: 0.6 },
  'iron-labyrinth': { baseTime: 1200, windowStart: 0.15, windowEnd: 0.55 },
  'void-chasm': { baseTime: 1000, windowStart: 0.1, windowEnd: 0.5 },
  'amber-palace': { baseTime: 1200, windowStart: 0.15, windowEnd: 0.55 },
  'shadow-realm': { baseTime: 1000, windowStart: 0.1, windowEnd: 0.45 },
  'abyssal-core': { baseTime: 800, windowStart: 0.05, windowEnd: 0.4 },
};

export const BOSS_PHASES: Record<string, Array<{ hpPercent: number; attackBoost: number; newAbility: string }>> = {
  'stone-titan': [{ hpPercent: 1.0, attackBoost: 0, newAbility: 'Stone Throw' }, { hpPercent: 0.5, attackBoost: 1.5, newAbility: 'Ground Slam' }],
  'shadow-dragon': [{ hpPercent: 1.0, attackBoost: 0, newAbility: 'Shadow Breath' }, { hpPercent: 0.6, attackBoost: 1.3, newAbility: 'Dark Wing' }, { hpPercent: 0.3, attackBoost: 1.8, newAbility: 'Void Roar' }],
  'void-reaper': [{ hpPercent: 1.0, attackBoost: 0, newAbility: 'Soul Harvest' }, { hpPercent: 0.5, attackBoost: 2.0, newAbility: 'Void Slash' }],
  'elder-wyrm': [{ hpPercent: 1.0, attackBoost: 0, newAbility: 'Bite' }, { hpPercent: 0.7, attackBoost: 1.2, newAbility: 'Tail Whip' }, { hpPercent: 0.4, attackBoost: 1.5, newAbility: 'Venom Spray' }],
  'core-guardian': [{ hpPercent: 1.0, attackBoost: 0, newAbility: 'Core Beam' }, { hpPercent: 0.75, attackBoost: 1.3, newAbility: 'Gravity Pulse' }, { hpPercent: 0.5, attackBoost: 1.6, newAbility: 'Void Collapse' }, { hpPercent: 0.25, attackBoost: 2.0, newAbility: 'Final Core Explosion' }],
};

export const ZONE_RESOURCES: Record<string, Array<{ resource: string; abundance: number }>> = {
  'mossy-caverns': [{ resource: 'copper', abundance: 5 }, { resource: 'iron-ore', abundance: 3 }, { resource: 'silver', abundance: 1 }],
  'crystal-grotto': [{ resource: 'sapphire', abundance: 4 }, { resource: 'silver', abundance: 3 }, { resource: 'emerald', abundance: 1 }, { resource: 'obsidian', abundance: 2 }],
  'lava-tubes': [{ resource: 'gold-ore', abundance: 4 }, { resource: 'ruby', abundance: 3 }, { resource: 'obsidian', abundance: 2 }, { resource: 'iron-ore', abundance: 1 }],
  'frozen-depths': [{ resource: 'obsidian', abundance: 4 }, { resource: 'silver', abundance: 3 }, { resource: 'sapphire', abundance: 2 }, { resource: 'diamond', abundance: 1 }],
  'mycelium-network': [{ resource: 'dark-quartz', abundance: 4 }, { resource: 'emerald', abundance: 2 }, { resource: 'crystal', abundance: 3 }, { resource: 'silver', abundance: 2 }],
  'iron-labyrinth': [{ resource: 'iron-ore', abundance: 5 }, { resource: 'mythril', abundance: 1 }, { resource: 'gold-ore', abundance: 3 }, { resource: 'diamond', abundance: 1 }],
  'void-chasm': [{ resource: 'void-crystal', abundance: 4 }, { resource: 'dark-quartz', abundance: 3 }, { resource: 'shadow-gem', abundance: 1 }, { resource: 'mythril', abundance: 1 }],
  'amber-palace': [{ resource: 'amber', abundance: 5 }, { resource: 'gold-ore', abundance: 3 }, { resource: 'ruby', abundance: 2 }, { resource: 'emerald', abundance: 2 }],
  'shadow-realm': [{ resource: 'shadow-gem', abundance: 3 }, { resource: 'void-crystal', abundance: 2 }, { resource: 'mythril', abundance: 1 }, { resource: 'star-metal', abundance: 0.5 }],
  'abyssal-core': [{ resource: 'star-metal', abundance: 2 }, { resource: 'mythril', abundance: 3 }, { resource: 'void-crystal', abundance: 4 }, { resource: 'diamond', abundance: 2 }],
};

export const EXPLORATION_LOGS: Array<{ zone: ZoneId; message: string; rarity: Rarity }> = [
  { zone: 'mossy-caverns', message: 'Found ancient mining equipment covered in moss.', rarity: 'common' },
  { zone: 'mossy-caverns', message: 'Discovered a underground stream with fresh water.', rarity: 'common' },
  { zone: 'mossy-caverns', message: 'Unusual crystal formations pulse with faint light.', rarity: 'uncommon' },
  { zone: 'crystal-grotto', message: 'The walls here are studded with raw sapphires.', rarity: 'common' },
  { zone: 'crystal-grotto', message: 'An entire cavern made of crystal, reflecting light infinitely.', rarity: 'rare' },
  { zone: 'crystal-grotto', message: 'Found ancient carvings depicting underground civilization.', rarity: 'uncommon' },
  { zone: 'lava-tubes', message: 'Molten rock flows in channels, illuminating the tunnels.', rarity: 'common' },
  { zone: 'lava-tubes', message: 'A lava serpent nest with eggs made of cooled magma.', rarity: 'uncommon' },
  { zone: 'lava-tubes', message: 'Discovered a volcanic forge used by an ancient race.', rarity: 'rare' },
  { zone: 'frozen-depths', message: 'Permafrost layers reveal perfectly preserved fossils.', rarity: 'common' },
  { zone: 'frozen-depths', message: 'An ice cathedral formed by centuries of freezing.', rarity: 'rare' },
  { zone: 'frozen-depths', message: 'Frost wraiths dance in a blizzard of their own making.', rarity: 'uncommon' },
  { zone: 'mycelium-network', message: 'Bioluminescent fungi light the path ahead.', rarity: 'common' },
  { zone: 'mycelium-network', message: 'A massive fungal organism spans multiple caverns.', rarity: 'uncommon' },
  { zone: 'mycelium-network', message: 'Spore clouds reveal hidden paths when illuminated.', rarity: 'rare' },
  { zone: 'iron-labyrinth', message: 'Metallic walls shift and rearrange the maze.', rarity: 'common' },
  { zone: 'iron-labyrinth', message: 'Found a golem construction workshop with blueprints.', rarity: 'uncommon' },
  { zone: 'iron-labyrinth', message: 'The heart of the labyrinth: a self-aware iron construct.', rarity: 'legendary' },
  { zone: 'void-chasm', message: 'Gravity warps near the edge of the chasm.', rarity: 'common' },
  { zone: 'void-chasm', message: 'Floating islands of rock drift in the void.', rarity: 'uncommon' },
  { zone: 'void-chasm', message: 'A rift to another dimension pulses with energy.', rarity: 'rare' },
  { zone: 'amber-palace', message: 'Entire chambers preserved in golden amber.', rarity: 'common' },
  { zone: 'amber-palace', message: 'Found a creature frozen in amber for millions of years.', rarity: 'uncommon' },
  { zone: 'amber-palace', message: 'The Amber Throne, seat of the ancient insect kings.', rarity: 'legendary' },
  { zone: 'shadow-realm', message: 'Shadows move independently of any light source.', rarity: 'common' },
  { zone: 'shadow-realm', message: 'A shadow dragon watches from the darkness above.', rarity: 'rare' },
  { zone: 'shadow-realm', message: 'The boundary between shadow and void thins here.', rarity: 'legendary' },
  { zone: 'abyssal-core', message: 'The core of the world pulses with raw energy.', rarity: 'common' },
  { zone: 'abyssal-core', message: 'Star metal deposits line the walls of the core.', rarity: 'uncommon' },
  { zone: 'abyssal-core', message: 'The Core Guardian awakens at your approach.', rarity: 'legendary' },
];

export const WEATHER_EFFECTS: Array<{ name: string; effect: string; description: string }> = [
  { name: 'Damp', effect: 'reduce_speed', description: 'Water drips from above, slowing movement.' },
  { name: 'Dust Storm', effect: 'reduce_perception', description: 'Fine particles fill the air, reducing visibility.' },
  { name: 'Tremors', effect: 'random_damage', description: 'Small tremors occasionally shake the ground.' },
  { name: 'Crystal Resonance', effect: 'boost_perception', description: 'Crystals hum, enhancing awareness.' },
  { name: 'Stale Air', effect: 'reduce_endurance', description: 'Lack of fresh air causes fatigue.' },
  { name: 'Mineral Glow', effect: 'boost_luck', description: 'Ores glow, making them easier to spot.' },
  { name: 'Deep Silence', effect: 'boost_stealth', description: 'Complete silence makes creatures unaware.' },
  { name: 'Void Whisper', effect: 'random_buff', description: 'Whispers from the void grant random bonuses.' },
];

export const TRADER_NPCS: Array<{ id: string; name: string; specialty: string; priceMultiplier: number; dialogue: string }> = [
  { id: 'grimm', name: 'Old Grimm', specialty: 'Equipment', priceMultiplier: 1.0, dialogue: 'Got the finest gear from the deep, I do.' },
  { id: 'luna', name: 'Luna the Gemcutter', specialty: 'Gems', priceMultiplier: 0.85, dialogue: 'I can make your gems shine brighter than torchlight.' },
  { id: 'thorne', name: 'Thorne', specialty: 'Resources', priceMultiplier: 1.1, dialogue: 'Need supplies? Everything has a price down here.' },
  { id: 'mira', name: 'Mira the Alchemist', specialty: 'Crafting', priceMultiplier: 1.2, dialogue: 'My potions can turn the tide of any battle.' },
  { id: 'dusk', name: 'Dusk', specialty: 'Artifacts', priceMultiplier: 2.0, dialogue: 'Rare things find their way to me.' },
  { id: 'cobalt', name: 'Cobalt', specialty: 'Maps', priceMultiplier: 0.9, dialogue: 'I know these tunnels better than anyone alive.' },
];

export const MILESTONES: Array<{ rank: number; reward: string; title: string }> = [
  { rank: 5, reward: 'Unlock Crystal Grotto zone', title: 'Cave Diver' },
  { rank: 10, reward: 'Unlock Lava Tubes zone + Ranger class', title: 'Deep Explorer' },
  { rank: 15, reward: 'Unlock Frozen Depths zone + Alchemist class', title: 'Veteran Spelunker' },
  { rank: 20, reward: 'Unlock Mycelium Network zone + Warrior class', title: 'Underground Legend' },
  { rank: 25, reward: 'Unlock Iron Labyrinth zone', title: 'Labyrinth Runner' },
  { rank: 30, reward: 'Unlock Void Chasm zone + Shadow Walker class', title: 'Void Touched' },
  { rank: 35, reward: 'Unlock Amber Palace zone', title: 'Amber Seeker' },
  { rank: 40, reward: 'Unlock Shadow Realm zone + Void Seer class', title: 'Shadow Walker' },
  { rank: 45, reward: 'Unlock Abyssal Core zone', title: 'Abyssal Diver' },
  { rank: 50, reward: 'All zones and classes unlocked', title: 'Primordial Explorer' },
];

export const TIPS: Array<string> = [
  'Upgrade your Shelter early for better HP recovery.',
  'The Mine Shaft structure generates passive ore income.',
  'Different zones have different ore distributions.',
  'Equipment with higher rarity provides better stat bonuses.',
  'Bosses have multiple phases with increasing difficulty.',
  'Events can be dangerous but also very rewarding.',
  'Maintain your daily expedition streak for bonus rewards.',
  'The Alchemist class has the best luck for rare ore finds.',
  'Lantern equipment extends your vision in dark zones.',
  'Crafting can turn common materials into valuable items.',
  'Artifacts provide permanent stat bonuses when collected.',
  'Void Chasm and Abyssal Core have the rarest ores.',
  'The Warrior class excels at defeating tough creatures.',
  'Building all structures to max level unlocks special bonuses.',
  'Zone bosses are found at the deepest points of each zone.',
];

export const MINING_COMBOS: Array<{ name: string; multipler: number; requiredHits: number; description: string }> = [
  { name: 'Double Strike', multipler: 1.5, requiredHits: 2, description: 'Mine twice in succession' },
  { name: 'Triple Smash', multipler: 2.0, requiredHits: 3, description: 'Mine three times perfectly' },
  { name: 'Quarry Storm', multipler: 2.5, requiredHits: 4, description: 'Mine four times perfectly' },
  { name: 'Earth Shaker', multipler: 3.0, requiredHits: 5, description: 'Mine five times perfectly' },
  { name: 'Core Breaker', multipler: 4.0, requiredHits: 6, description: 'Mine six times perfectly' },
  { name: 'Void Crusher', multipler: 5.0, requiredHits: 7, description: 'Mine seven times perfectly' },
];

export const REST_MESSAGES: Array<string> = [
  'You rest by the cave wall, feeling the cool stone against your back.',
  'A small alcove provides shelter for a brief rest.',
  'You sit on a flat boulder and catch your breath.',
  'The sound of dripping water lulls you into a light sleep.',
  'You find a dry spot and tend to your equipment.',
  'The faint glow of distant crystals provides comfort as you rest.',
  'You lean against a stalagmite and eat some rations.',
  'A warm air current from below provides welcome relief as you rest.',
  'You meditate in the darkness, finding inner peace underground.',
  'The rhythmic echo of water drops helps you relax.',
];

export const RESPAWN_MESSAGES: Array<string> = [
  'You wake up back at your shelter, battered but alive.',
  'A passing explorer found you unconscious and carried you to safety.',
  'Your emergency teleport crystal activated, returning you to base.',
  'You barely crawled back to your shelter, vowing to be better prepared next time.',
  'The shelter healing aura slowly restores your strength.',
  'You dream of the deep dark as you recover in your shelter.',
];

export const COMBAT_LOG_TEMPLATES: Array<{ type: string; templates: string[] }> = [
  { type: 'miss', templates: ['The {creature} dodges your attack!', 'Your swing goes wide as the {creature} sidesteps.', 'The {creature} blocks with surprising speed.'] },
  { type: 'hit', templates: ['You strike the {creature} for {damage} damage!', 'A solid hit! The {creature} takes {damage} damage.'] },
  { type: 'critical', templates: ['CRITICAL HIT! You devastate the {creature} for {damage}!', 'A devastating blow! {damage} damage to the {creature}!'] },
  { type: 'enemy_hit', templates: ['The {creature} hits you for {damage}!', 'The {creature} attack connects for {damage} damage.'] },
  { type: 'dodge', templates: ['You narrowly dodge the {creature} attack!', 'Quick reflexes! The {creature} misses by inches.'] },
  { type: 'victory', templates: ['The {creature} falls! Victory!', 'You have defeated the {creature}!'] },
  { type: 'defeat', templates: ['The {creature} overwhelms you. You retreat to safety...', 'Too strong! The {creature} sends you fleeing.'] },
];

export function nuCalculateXpToNext(level: number): number { return Math.floor(100 * Math.pow(1.15, level - 1)); }
export function nuGetRankTitleStatic(rank: number): string {
  const titles = ['Novice','Apprentice','Journeyman','Pathfinder','Trailblazer','Cave Runner','Deep Diver','Tunnel Master','Dark Walker','Underlord',
    'Abyss Scout','Void Touched','Lore Seeker','Stone Whisperer','Crystal Sage','Iron Will','Shadow Stalker','Mythril Born','Void Born','Core Seeker',
    'Depth Master','Zone Lord','Cave King','Ore Baron','Labyrinth Lord','Abyss Knight','Shadow Duke','Void Prince','Core Duke','Underground Emperor',
    'Moss Warden','Crystal Keeper','Lava Lord','Frost Sovereign','Fungus Overlord','Iron Emperor','Void Warden','Amber Monarch','Shadow Emperor','Abyss Overlord',
    'Eternal Spelunker','Deep One','Void Immortal','Core Guardian','World Delver','Star Miner','Cosmic Explorer','Eternal Wanderer','Underworld God','Primordial Explorer'];
  return titles[Math.min(rank - 1, titles.length - 1)] || 'Novice';
}
export function nuGetZoneById(id: ZoneId) { return ZONES.find(z => z.id === id); }
export function nuGetCreatureById(id: CreatureId) { return CREATURES.find(c => c.id === id); }
export function nuGetEquipmentById(id: string) { return EQUIPMENT.find(e => e.id === id); }
export function nuGetOreById(id: OreId) { return ORES.find(o => o.id === id); }
export function nuGetArtifactById(id: string) { return ARTIFACTS.find(a => a.id === id); }

// State
interface NetherUndergroundState {
  level: number; xp: number; xpToNext: number; totalXp: number; rank: number;
  currentZone: ZoneId; explorerClass: ExplorerClassId;
  strength: number; agility: number; perception: number; endurance: number; luck: number;
  iron: number; gold: number; crystal: number; darkMatter: number; torchOil: number; rations: number;
  creaturesDefeated: number; totalOreMined: number; bossesDefeated: number;
  artifacts: string[]; achievements: Record<string, boolean>;
  structures: Record<string, number>; equipment: Record<EquipmentSlot, string | null>;
  currentHp: number; maxHp: number; eventsSurvived: number;
  dailyCompleted: boolean; dailyDate: string; streak: number; bestStreak: number;
  totalExpeditions: number; craftingCount: number; lastMineTime: number; lastEventTime: number;
}

const defaultState: NetherUndergroundState = {
  level: 1, xp: 0, xpToNext: 100, totalXp: 0, rank: 1, currentZone: 'mossy-caverns', explorerClass: 'spelunker',
  strength: 5, agility: 7, perception: 6, endurance: 5, luck: 4,
  iron: 10, gold: 5, crystal: 0, darkMatter: 0, torchOil: 20, rations: 15,
  creaturesDefeated: 0, totalOreMined: 0, bossesDefeated: 0, artifacts: [], achievements: {},
  structures: { shelter: 1, forge: 0, mine: 0, lighthouse: 0, armory: 0, lab: 0, 'portal-frame': 0, 'nexus-portal': 0 },
  equipment: { head: null, body: null, hands: null, feet: null, lantern: null },
  currentHp: 100, maxHp: 100, eventsSurvived: 0,
  dailyCompleted: false, dailyDate: '', streak: 0, bestStreak: 0, totalExpeditions: 0, craftingCount: 0, lastMineTime: 0, lastEventTime: 0,
};

function loadState(): NetherUndergroundState {
  try { const saved = localStorage.getItem(NU_STORAGE_KEY); return saved ? { ...defaultState, ...JSON.parse(saved) } : { ...defaultState }; } catch { return { ...defaultState }; }
}
function saveState(state: NetherUndergroundState): void {
  try { localStorage.setItem(NU_STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export default function useNetherUnderground() {
 const [state, setState] = useState<NetherUndergroundState>(() => loadState());

 const update = (partial: Partial<NetherUndergroundState>) => {
 setState(prev => {
 const next = { ...prev, ...partial };
 saveState(next);
 return next;
 });
 };

 // ── Level & XP ──
 function nuGetLevel() { return state.level; }
 function nuGetXp() { return state.xp; }
 function nuGetXpToNext() { return state.xpToNext; }
 function nuGetTotalXp() { return state.totalXp; }
 function nuAddXp(amount: number) {
 let newXp = state.xp + amount;
 let newLevel = state.level;
 let newXpToNext = state.xpToNext;
 let newTotal = state.totalXp + amount;
 while (newXp >= newXpToNext) {
 newXp -= newXpToNext;
 newLevel += 1;
 newXpToNext = Math.floor(newXpToNext * 1.15);
 }
 update({ xp: newXp, level: newLevel, xpToNext: newXpToNext, totalXp: newTotal });
 }
 function nuSetLevel(level: number) { update({ level, xpToNext: Math.floor(100 * Math.pow(1.15, level - 1)) }); }

 // ── Rank ──
 function nuGetRank() { return state.rank; }
 function nuSetRank(rank: number) { update({ rank: Math.max(1, Math.min(50, rank)) }); }
 function nuAddRank(amount: number) { update({ rank: Math.min(50, state.rank + amount) }); }
 function nuGetRankTitle() {
 const titles = ['Novice', 'Apprentice', 'Journeyman', 'Pathfinder', 'Trailblazer', 'Cave Runner', 'Deep Diver', 'Tunnel Master', 'Dark Walker', 'Underlord',
 'Abyss Scout', 'Void Touched', 'Lore Seeker', 'Stone Whisperer', 'Crystal Sage', 'Iron Will', 'Shadow Stalker', 'Mythril Born', 'Void Born', 'Core Seeker',
 'Depth Master', 'Zone Lord', 'Cave King', 'Ore Baron', 'Labyrinth Lord', 'Abyss Knight', 'Shadow Duke', 'Void Prince', 'Core Duke', 'Underground Emperor',
 'Moss Warden', 'Crystal Keeper', 'Lava Lord', 'Frost Sovereign', 'Fungus Overlord', 'Iron Emperor', 'Void Warden', 'Amber Monarch', 'Shadow Emperor', 'Abyss Overlord',
 'Eternal Spelunker', 'Deep One', 'Void Immortal', 'Core Guardian', 'World Delver', 'Star Miner', 'Cosmic Explorer', 'Eternal Wanderer', 'Underworld God', 'Primordial Explorer'];
 return titles[Math.min(state.rank - 1, titles.length - 1)] || 'Novice';
 }

 // ── Class ──
 function nuGetExplorerClass() { return state.explorerClass; }
 function nuSetExplorerClass(classId: ExplorerClassId) {
 const cls = EXPLORER_CLASSES.find(c => c.id === classId);
 if (cls && state.level >= cls.unlockLevel) {
 update({ explorerClass: classId, strength: cls.strength, agility: cls.agility, perception: cls.perception, endurance: cls.endurance, luck: cls.luck });
 }
 }
 function nuGetClassStats() { return EXPLORER_CLASSES.find(c => c.id === state.explorerClass); }

 // ── Stats ──
 function nuGetStrength() { return state.strength; }
 function nuGetAgility() { return state.agility; }
 function nuGetPerception() { return state.perception; }
 function nuGetEndurance() { return state.endurance; }
 function nuGetLuck() { return state.luck; }
 function nuSetStrength(v: number) { update({ strength: v }); }
 function nuSetAgility(v: number) { update({ agility: v }); }
 function nuSetPerception(v: number) { update({ perception: v }); }
 function nuSetEndurance(v: number) { update({ endurance: v }); }
 function nuSetLuck(v: number) { update({ luck: v }); }
 function nuAddStrength(v: number) { update({ strength: state.strength + v }); }
 function nuAddAgility(v: number) { update({ agility: state.agility + v }); }
 function nuAddPerception(v: number) { update({ perception: state.perception + v }); }
 function nuAddEndurance(v: number) { update({ endurance: state.endurance + v }); }
 function nuAddLuck(v: number) { update({ luck: state.luck + v }); }

 // ── Zone ──
 function nuGetCurrentZone() { return state.currentZone; }
 function nuSetCurrentZone(zone: ZoneId) {
 const z = ZONES.find(zn => zn.id === zone);
 if (z && state.rank >= z.rankReq) { update({ currentZone: zone }); }
 }
 function nuGetAvailableZones() { return ZONES.filter(z => state.rank >= z.rankReq); }
 function nuGetZoneInfo() { return ZONES.find(z => z.id === state.currentZone); }
 function nuGetCurrentDepth() { return ZONES.find(z => z.id === state.currentZone)?.depth || 0; }

 // ── Resources ──
 function nuGetIron() { return state.iron; }
 function nuGetGold() { return state.gold; }
 function nuGetCrystal() { return state.crystal; }
 function nuGetDarkMatter() { return state.darkMatter; }
 function nuGetTorchOil() { return state.torchOil; }
 function nuGetRations() { return state.rations; }
 function nuAddIron(v: number) { update({ iron: state.iron + v }); }
 function nuAddGold(v: number) { update({ gold: state.gold + v }); }
 function nuAddCrystal(v: number) { update({ crystal: state.crystal + v }); }
 function nuAddDarkMatter(v: number) { update({ darkMatter: state.darkMatter + v }); }
 function nuAddTorchOil(v: number) { update({ torchOil: state.torchOil + v }); }
 function nuAddRations(v: number) { update({ rations: state.rations + v }); }
 function nuConsumeRations(amount: number) {
 if (state.rations >= amount) { update({ rations: state.rations - amount }); return true; }
 return false;
 }
 function nuConsumeTorchOil(amount: number) {
 if (state.torchOil >= amount) { update({ torchOil: state.torchOil - amount }); return true; }
 return false;
 }

 // ── Mining ──
 function nuMine() {
 const zoneOres = ORES.filter(o => {
 if (state.currentZone === 'abyssal-core') return o.rarity === 'legendary' || o.rarity === 'rare';
 if (state.currentZone === "shadow-realm" || state.currentZone === 'void-chasm') return o.rarity !== 'common';
 return true;
 });
 const luckBonus = state.luck * 0.02;
 const roll = Math.random() + luckBonus;
 let ore: typeof ORES[0];
 if (roll > 0.97) ore = zoneOres.filter(o => o.rarity === 'legendary')[0] || zoneOres[zoneOres.length - 1];
 else if (roll > 0.85) ore = zoneOres.filter(o => o.rarity === 'rare')[0] || zoneOres[zoneOres.length - 1];
 else if (roll > 0.6) ore = zoneOres.filter(o => o.rarity === 'uncommon')[0] || zoneOres[0];
 else ore = zoneOres.filter(o => o.rarity === 'common')[0] || zoneOres[0];
 const amount = Math.max(1, Math.floor((state.strength + state.perception) / 5));
 const xpGain = Math.floor(ore.baseValue / 2) * amount;
 update({ totalOreMined: state.totalOreMined + amount, lastMineTime: Date.now() });
 nuAddXp(xpGain);
 
 // ── Mining Minigame ──
 function nuGetMiningDifficulty() {
 return MINING_DIFFICULTY[state.currentZone] || MINING_DIFFICULTY['mossy-caverns'];
 }
 function nuAttemptMine(timingPercent: number) {
 const diff = nuGetMiningDifficulty();
 const isPerfect = timingPercent >= diff.windowStart && timingPercent <= diff.windowEnd;
 const isGood = timingPercent >= diff.windowStart - 0.1 && timingPercent <= diff.windowEnd + 0.1;
 if (isPerfect) {
 const result = nuMine();
 return {
 state,
 nuGetLevel, nuGetXp, nuGetXpToNext, nuGetTotalXp, nuAddXp, nuSetLevel,
 nuGetRank, nuSetRank, nuAddRank, nuGetRankTitle,
 nuGetExplorerClass, nuSetExplorerClass, nuGetClassStats,
 nuGetStrength, nuGetAgility, nuGetPerception, nuGetEndurance, nuGetLuck,
 nuSetStrength, nuSetAgility, nuSetPerception, nuSetEndurance, nuSetLuck,
 nuAddStrength, nuAddAgility, nuAddPerception, nuAddEndurance, nuAddLuck,
 nuGetCurrentZone, nuSetCurrentZone, nuGetAvailableZones, nuGetZoneInfo, nuGetCurrentDepth,
 nuGetIron, nuGetGold, nuGetCrystal, nuGetDarkMatter, nuGetTorchOil, nuGetRations,
 nuAddIron, nuAddGold, nuAddCrystal, nuAddDarkMatter, nuAddTorchOil, nuAddRations,
 nuConsumeRations, nuConsumeTorchOil,
 nuMine, nuGetTotalOreMined: () => state.totalOreMined,
 nuGetCreaturesDefeated, nuGetZoneCreatures, nuGetCreature, nuFightCreature,
 nuHeal, nuFullHeal, nuGetCurrentHp, nuGetMaxHp,
 nuGetEquipment, nuEquipItem, nuUnequipItem, nuGetEquippedItem,
 nuGetStructures, nuGetStructureLevel, nuUpgradeStructure, nuGetStructureUpgradeCost,
 nuGetEventsSurvived, nuGetRandomEvent, nuResolveEvent,
 nuGetArtifacts, nuGetArtifactInfo, nuCollectArtifact,
 nuGetCraftingCount, nuCraft,
 nuGetAchievements, nuIsAchievementUnlocked, nuUnlockAchievement, nuCheckAchievements,
 nuIsDailyCompleted, nuClaimDaily, nuGetStreak, nuGetBestStreak, nuGetTotalExpeditions,
 nuGetBossesDefeated, nuGetZoneBoss, nuFightBoss,
 nuGetMiningDifficulty, nuAttemptMine, nuGetMiningComboInfo, nuGetCurrentCombo,
 nuGetTraders, nuGetTraderInfo, nuTradeWithTrader,
 nuGetZoneResources, nuGetOreAbundance,
 nuExplore, nuGetZoneLogs,
 nuGetRandomWeather, nuApplyWeather,
 nuGetBossPhases, nuGetCurrentBossPhase,
 nuGetMilestones, nuGetCurrentMilestone, nuGetNextMilestone,
 nuGetRandomTip,
 nuGetStatsSummary,
 nuGetAllOres, nuGetAllCreatures, nuGetAllEquipment, nuGetAllStructures,
 nuGetAllEvents, nuGetAllArtifacts, nuGetAllRecipes, nuGetAllAchievements,
 nuGetAllClasses, nuGetAllZones, nuGetAllCombos, nuGetAllTraders,
 nuGetAllMilestones, nuGetAllWeatherEffects, nuGetAllExplorationLogs,
 nuGetAllBossPhases, nuGetAllZoneResources, nuGetAllMiningDifficulty, nuGetAllTips,
 nuGetState, nuSetState, nuReset,
 };
 }
 if (isGood) {
 const result = nuMine();
 const reducedAmount = Math.max(1, Math.floor(result.amount * 0.6));
 return { ...result, amount: reducedAmount, quality: 'good' as const, message: `Good timing! Mined ${reducedAmount} ${result.ore}.` };
 }
 return { ore: 'none', amount: 0, xp: 0, value: 0, quality: 'miss' as const, message: 'Missed the sweet spot!' };
 }
 function nuGetMiningComboInfo() { return MINING_COMBOS; }
 function nuGetCurrentCombo() { return 0; }

 // ── Trader ──
 function nuGetTraders() { return TRADER_NPCS; }
 function nuGetTraderInfo(id: string) { return TRADER_NPCS.find(t => t.id === id); }
 function nuTradeWithTrader(traderId: string, buy: boolean, itemName: string, amount: number) {
 const trader = TRADER_NPCS.find(t => t.id === traderId);
 if (!trader) return { success: false, message: 'Trader not found.' };
 const price = Math.floor(amount * 10 * trader.priceMultiplier);
 if (buy) {
 if (state.gold >= price) {
 update({ gold: state.gold - price });
 nuAddXp(5);
 return { success: true, message: `Bought ${amount}x ${itemName} for ${price} gold.`, cost: price };
 }
 return { success: false, message: `Not enough gold. Need ${price}.`, cost: price };
 } else {
 update({ gold: state.gold + price });
 nuAddXp(5);
 return { success: true, message: `Sold ${amount}x ${itemName} for ${price} gold.`, earned: price };
 }
 }

 // ── Zone Resources ──
 function nuGetZoneResources() { return ZONE_RESOURCES[state.currentZone] || []; }
 function nuGetOreAbundance(oreId: OreId) {
 const resources = ZONE_RESOURCES[state.currentZone] || [];
 const entry = resources.find(r => r.resource === oreId);
 return entry ? entry.abundance : 0;
 }

 // ── Exploration ──
 function nuExplore() {
 const zoneLogs = EXPLORATION_LOGS.filter(l => l.zone === state.currentZone);
 if (zoneLogs.length === 0) return { message: 'Nothing interesting here.', rarity: 'common' };
 const luckBonus = state.luck * 0.01;
 const roll = Math.random() + luckBonus;
 let log;
 if (roll > 0.8) log = zoneLogs.find(l => l.rarity === 'legendary') || zoneLogs.find(l => l.rarity === 'rare') || zoneLogs[0];
 else if (roll > 0.5) log = zoneLogs.find(l => l.rarity === 'rare') || zoneLogs.find(l => l.rarity === 'uncommon') || zoneLogs[0];
 else if (roll > 0.2) log = zoneLogs.find(l => l.rarity === 'uncommon') || zoneLogs[0];
 else log = zoneLogs[0];
 nuAddXp(10 + state.rank * 2);
 update({ totalExpeditions: state.totalExpeditions + 1 });
 nuCheckAchievements();
 return { message: log?.message || 'Nothing interesting here.', rarity: log?.rarity || 'common' };
 }
 function nuGetZoneLogs() {
 return EXPLORATION_LOGS.filter(l => l.zone === state.currentZone);
 }

 // ── Weather ──
 function nuGetRandomWeather() {
 return WEATHER_EFFECTS[Math.floor(Math.random() * WEATHER_EFFECTS.length)];
 }
 function nuApplyWeather(weatherId: string) {
 const weather = WEATHER_EFFECTS.find(w => w.name === weatherId);
 if (!weather) return { applied: false };
 update({ lastEventTime: Date.now() });
 switch (weather.effect) {
 case 'reduce_speed': update({ agility: Math.max(1, state.agility - 1) }); return { applied: true, message: 'Agility reduced by 1.' };
 case 'reduce_perception': update({ perception: Math.max(1, state.perception - 1) }); return { applied: true, message: 'Perception reduced by 1.' };
 case 'random_damage': { const dmg = 5 + state.rank; update({ currentHp: Math.max(1, state.currentHp - dmg) }); return { applied: true, message: `Took ${dmg} damage from tremors!` }; }
 case 'boost_perception': update({ perception: state.perception + 1 }); return { applied: true, message: 'Perception boosted by 1!' };
 case 'reduce_endurance': update({ endurance: Math.max(1, state.endurance - 1) }); return { applied: true, message: 'Endurance reduced by 1.' };
 case 'boost_luck': update({ luck: state.luck + 1 }); return { applied: true, message: 'Luck boosted by 1!' };
 case 'boost_stealth': return { applied: true, message: 'Creatures are less aware of you.' };
 case 'random_buff': { const stat = ["strength", 'agility', 'perception', 'endurance', 'luck'][Math.floor(Math.random() * 5)]; update({ [stat]: (state as any)[stat] + 1 }); return { applied: true, message: `${stat.charAt(0).toUpperCase() + stat.slice(1)} boosted by 1!` }; }
 default: return { applied: false };
 }
 }

 // ── Boss Phases ──
 function nuGetBossPhases(creatureId: string) { return BOSS_PHASES[creatureId] || []; }
 function nuGetCurrentBossPhase(creatureId: string, currentHpPercent: number) {
 const phases = BOSS_PHASES[creatureId] || [];
 let currentPhase = phases[0];
 for (const phase of phases) {
 if (currentHpPercent <= phase.hpPercent) currentPhase = phase;
 }
 return currentPhase;
 }

 // ── Milestones ──
 function nuGetMilestones() { return MILESTONES; }
 function nuGetCurrentMilestone() {
 return MILESTONES.filter(m => state.rank >= m.rank).pop() || MILESTONES[0];
 }
 function nuGetNextMilestone() {
 return MILESTONES.find(m => state.rank < m.rank) || null;
 }

 // ── Tips ──
 function nuGetRandomTip() { return TIPS[Math.floor(Math.random() * TIPS.length)]; }

 // ── Stats Summary ──
 function nuGetStatsSummary() {
 return {
 level: state.level,
 xp: state.xp,
 xpToNext: state.xpToNext,
 rank: state.rank,
 rankTitle: nuGetRankTitle(),
 className: EXPLORER_CLASSES.find(c => c.id === state.explorerClass)?.name || 'Unknown',
 zoneName: ZONES.find(z => z.id === state.currentZone)?.name || 'Unknown',
 depth: nuGetCurrentDepth(),
 hp: { current: state.currentHp, max: state.maxHp },
 resources: { iron: state.iron, gold: state.gold, crystal: state.crystal, darkMatter: state.darkMatter, torchOil: state.torchOil, rations: state.rations },
 combat: { creaturesDefeated: state.creaturesDefeated, bossesDefeated: state.bossesDefeated, totalOreMined: state.totalOreMined },
 progress: { artifacts: state.artifacts.length, achievements: Object.keys(state.achievements).filter(k => state.achievements[k]).length, streak: state.streak },
 };
 }

 // ── Full Reset ──
 function nuGetAllOres() { return ORES; }
 function nuGetAllCreatures() { return CREATURES; }
 function nuGetAllEquipment() { return EQUIPMENT; }
 function nuGetAllStructures() { return STRUCTURES; }
 function nuGetAllEvents() { return CAVE_EVENTS; }
 function nuGetAllArtifacts() { return ARTIFACTS; }
 function nuGetAllRecipes() { return CRAFTING_RECIPES; }
 function nuGetAllAchievements() { return ACHIEVEMENTS; }
 function nuGetAllClasses() { return EXPLORER_CLASSES; }
 function nuGetAllZones() { return ZONES; }
 function nuGetAllCombos() { return MINING_COMBOS; }
 function nuGetAllTraders() { return TRADER_NPCS; }
 function nuGetAllMilestones() { return MILESTONES; }
 function nuGetAllWeatherEffects() { return WEATHER_EFFECTS; }
 function nuGetAllExplorationLogs() { return EXPLORATION_LOGS; }
 function nuGetAllBossPhases() { return BOSS_PHASES; }
 function nuGetAllZoneResources() { return ZONE_RESOURCES; }
 function nuGetAllMiningDifficulty() { return MINING_DIFFICULTY; }
 function nuGetAllTips() { return TIPS; }

 return { ore: ore.name, amount, xp: xpGain, value: ore.baseValue * amount };
 }

 // ── Creatures ──
 function nuGetCreaturesDefeated() { return state.creaturesDefeated; }
 function nuGetZoneCreatures() { return CREATURES.filter(c => c.zone === state.currentZone); }
 function nuGetCreature(id: CreatureId) { return CREATURES.find(c => c.id === id); }
 function nuFightCreature(id: CreatureId) {
 const creature = CREATURES.find(c => c.id === id);
 if (!creature) return { won: false, damage: 0, xp: 0 };
 const playerAtk = state.strength * 3 + state.agility;
 const playerDef = state.endurance * 2 + 5;
 const playerDmg = Math.max(1, playerAtk - creature.defense);
 const creatureDmg = Math.max(1, creature.attack - playerDef);
 const rounds = Math.ceil(creature.hp / playerDmg);
 const totalDmgTaken = creatureDmg * Math.floor(rounds / 2);
 const won = state.currentHp - totalDmgTaken > 0;
 if (won) {
 const newXp = creature.xpReward;
 const loot = creature.loot;
 update({ creaturesDefeated: state.creaturesDefeated + 1, currentHp: Math.max(1, state.currentHp - totalDmgTaken) });
 nuAddXp(newXp);
 return { won: true, damage: totalDmgTaken, xp: newXp, loot };
 }
 update({ currentHp: 1 });
 return { won: false, damage: totalDmgTaken, xp: 0 };
 }
 function nuHeal(amount: number) { update({ currentHp: Math.min(state.maxHp, state.currentHp + amount) }); }
 function nuFullHeal() { update({ currentHp: state.maxHp }); }
 function nuGetCurrentHp() { return state.currentHp; }
 function nuGetMaxHp() { return state.maxHp; }

 // ── Equipment ──
 function nuGetEquipment() { return state.equipment; }
 function nuEquipItem(itemId: string) {
 const item = EQUIPMENT.find(e => e.id === itemId);
 if (item) {
 const eq = { ...state.equipment, [item.slot]: itemId };
 update({ equipment: eq as typeof state.equipment });
 }
 }
 function nuUnequipItem(slot: EquipmentSlot) {
 const eq = { ...state.equipment, [slot]: null };
 update({ equipment: eq as typeof state.equipment });
 }
 function nuGetEquippedItem(slot: EquipmentSlot) { return EQUIPMENT.find(e => e.id === state.equipment[slot]); }

 // ── Structures ──
 function nuGetStructures() { return state.structures; }
 function nuGetStructureLevel(id: StructureId) { return state.structures[id] || 0; }
 function nuUpgradeStructure(id: StructureId) {
 const struct = STRUCTURES.find(s => s.id === id);
 const currentLevel = state.structures[id] || 0;
 if (struct && currentLevel < struct.maxLevel) {
 const cost = Math.floor(struct.baseCost * Math.pow(1.5, currentLevel));
 if (state.gold >= cost) {
 update({ gold: state.gold - cost, structures: { ...state.structures, [id]: currentLevel + 1 } });
 nuAddXp(currentLevel * 10 + 5);
 return { success: true, cost, newLevel: currentLevel + 1 };
 }
 return { success: false, cost, reason: 'Not enough gold' };
 }
 return { success: false, reason: 'Already max level' };
 }
 function nuGetStructureUpgradeCost(id: StructureId) {
 const struct = STRUCTURES.find(s => s.id === id);
 const currentLevel = state.structures[id] || 0;
 if (!struct || currentLevel >= struct.maxLevel) return null;
 return Math.floor(struct.baseCost * Math.pow(1.5, currentLevel));
 }

 // ── Events ──
 function nuGetEventsSurvived() { return state.eventsSurvived; }
 function nuGetRandomEvent() { return CAVE_EVENTS[Math.floor(Math.random() * CAVE_EVENTS.length)]; }
 function nuResolveEvent(eventId: string) {
 const event = CAVE_EVENTS.find(e => e.id === eventId);
 if (!event) return { effect: 'none', message: 'Nothing happened.' };
 update({ eventsSurvived: state.eventsSurvived + 1, lastEventTime: Date.now() });
 switch (event.effect) {
 case 'damage':
 const dmg = Math.floor(10 + state.currentZone === 'abyssal-core' ? 30 : state.rank * 2);
 update({ currentHp: Math.max(1, state.currentHp - dmg) });
 return { effect: 'damage', message: `Took ${dmg} damage!`, value: dmg };
 case 'reward':
 const goldReward = 10 + state.rank * 5;
 update({ gold: state.gold + goldReward });
 nuAddXp(20 + state.rank * 2);
 return { effect: 'reward', message: `Found ${goldReward} gold!`, value: goldReward };
 case 'heal':
 const healAmt = Math.floor(state.maxHp * 0.3);
 update({ currentHp: Math.min(state.maxHp, state.currentHp + healAmt) });
 return { effect: 'heal', message: `Healed ${healAmt} HP!`, value: healAmt };
 case 'buff':
 update({ luck: state.luck + 1 });
 return { effect: 'buff', message: '+1 Luck!', value: 1 };
 case 'teleport':
 const available = ZONES.filter(z => state.rank >= z.rankReq);
 const newZone = available[Math.floor(Math.random() * available.length)];
 update({ currentZone: newZone.id });
 return { effect: 'teleport', message: `Teleported to ${newZone.name}!`, value: newZone.id };
 case 'encounter':
 const zoneCreatures = CREATURES.filter(c => c.zone === state.currentZone);
 const creature = zoneCreatures[Math.floor(Math.random() * zoneCreatures.length)];
 return { effect: 'encounter', message: `A ${creature?.name || 'creature'} appears!`, creatureId: creature?.id };
 default:
 return { effect: 'none', message: 'Nothing happened.' };
 }
 }

 // ── Artifacts ──
 function nuGetArtifacts() { return state.artifacts; }
 function nuGetArtifactInfo(id: string) { return ARTIFACTS.find(a => a.id === id); }
 function nuCollectArtifact(id: string) {
 if (!state.artifacts.includes(id) && ARTIFACTS.find(a => a.id === id)) {
 const artifact = ARTIFACTS.find(a => a.id === id)!;
 const newArtifacts = [...state.artifacts, id];
 update({ artifacts: newArtifacts });
 nuAddXp(artifact.rarity === 'legendary' ? 200 : artifact.rarity === 'rare' ? 100 : 50);
 return true;
 }
 return false;
 }

 // ── Crafting ──
 function nuGetCraftingCount() { return state.craftingCount; }
 function nuCraft(recipeId: string) {
 const recipe = CRAFTING_RECIPES.find(r => r.id === recipeId);
 if (!recipe) return { success: false, message: 'Recipe not found.' };
 const hasIngredients = Object.entries(recipe.ingredients).every(([key, val]) => {
 if (key === 'iron-ore') return state.iron >= val;
 if (key === 'gold-ore') return state.gold >= val;
 if (key === 'crystal') return state.crystal >= val;
 if (key === 'darkMatter') return state.darkMatter >= val;
 if (key === 'rations') return state.rations >= val;
 if (key === 'iron') return state.iron >= val;
 if (key === "silver") return state.gold >= val;
 return true;
 });
 if (hasIngredients) {
 update({ craftingCount: state.craftingCount + 1 });
 nuAddXp(recipe.xp);
 return { success: true, message: `Crafted ${recipe.name}!`, xp: recipe.xp };
 }
 return { success: false, message: 'Not enough ingredients.' };
 }

 // ── Achievements ──
 function nuGetAchievements() { return ACHIEVEMENTS.map(a => ({ ...a, unlocked: !!state.achievements[a.id] })); }
 function nuIsAchievementUnlocked(id: string) { return !!state.achievements[id]; }
 function nuUnlockAchievement(id: string) {
 if (!state.achievements[id]) {
 const achievement = ACHIEVEMENTS.find(a => a.id === id);
 if (achievement) {
 update({ achievements: { ...state.achievements, [id]: true } });
 nuAddXp(parseInt(achievement.reward.replace(/[^0-9]/g, '')) || 50);
 return true;
 }
 }
 return false;
 }
 function nuCheckAchievements() {
 const checks: Array<[string, boolean]> = [
 ['first-descent', state.totalExpeditions > 0],
 ['ore-hunter', state.totalOreMined >= 100],
 ['creature-slayer', state.creaturesDefeated >= 50],
 ['deep-explorer', nuGetCurrentDepth() >= 2000],
 ['boss-tamer', state.bossesDefeated >= 3],
 ['master-miner', state.totalOreMined >= 500],
 ['artifact-collector', state.artifacts.length >= 5],
 ["survivor", state.eventsSurvived >= 10],
 ["streak-7", state.bestStreak >= 7],
 ["streak-30", state.bestStreak >= 30],
 ['rank-50', state.rank >= 50],
 ];
 let newUnlocks = 0;
 for (const [id, condition] of checks) {
 if (condition && !state.achievements[id]) { nuUnlockAchievement(id); newUnlocks++; }
 }
 return newUnlocks;
 }

 // ── Daily ──
 function nuIsDailyCompleted() { return state.dailyCompleted; }
 function nuClaimDaily() {
 const today = new Date().toISOString().slice(0, 10);
 if (state.dailyDate === today && state.dailyCompleted) return { claimed: false, message: 'Already completed today!' };
 const newStreak = (state.dailyDate === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) ? state.streak + 1 : 1;
 const reward = 50 + newStreak * 10;
 update({ dailyCompleted: true, dailyDate: today, streak: newStreak, bestStreak: Math.max(state.bestStreak, newStreak), totalExpeditions: state.totalExpeditions + 1 });
 nuAddXp(reward);
 return { claimed: true, streak: newStreak, xp: reward, message: `Daily expedition complete! Streak: ${newStreak}` };
 }
 function nuGetStreak() { return state.streak; }
 function nuGetBestStreak() { return state.bestStreak; }
 function nuGetTotalExpeditions() { return state.totalExpeditions; }

 // ── Bosses ──
 function nuGetBossesDefeated() { return state.bossesDefeated; }
 function nuGetZoneBoss() {
 return CREATURES.filter(c => c.zone === state.currentZone).sort((a, b) => b.hp - a.hp)[0];
 }
 function nuFightBoss() {
 const boss = nuGetZoneBoss();
 if (!boss) return { won: false, message: 'No boss in this zone.' };
 const result = nuFightCreature(boss.id as CreatureId);
 if (result.won) {
 update({ bossesDefeated: state.bossesDefeated + 1 });
 return { ...result, bossName: boss.name, message: `Defeated ${boss.name}!` };
 }
 return { ...result, bossName: boss.name, message: `Lost to ${boss.name}...` };
 }

 // ── Raw State ──
 function nuGetState() { return state; }
 function nuSetState(newState: Partial<NetherUndergroundState>) { update(newState); }
 function nuReset() {
 saveState(defaultState);
 setState({ ...defaultState });
 }

 return {
 state,
 nuGetLevel, nuGetXp, nuGetXpToNext, nuGetTotalXp, nuAddXp, nuSetLevel,
 nuGetRank, nuSetRank, nuAddRank, nuGetRankTitle,
 nuGetExplorerClass, nuSetExplorerClass, nuGetClassStats,
 nuGetStrength, nuGetAgility, nuGetPerception, nuGetEndurance, nuGetLuck,
 nuSetStrength, nuSetAgility, nuSetPerception, nuSetEndurance, nuSetLuck,
 nuAddStrength, nuAddAgility, nuAddPerception, nuAddEndurance, nuAddLuck,
 nuGetCurrentZone, nuSetCurrentZone, nuGetAvailableZones, nuGetZoneInfo, nuGetCurrentDepth,
 nuGetIron, nuGetGold, nuGetCrystal, nuGetDarkMatter, nuGetTorchOil, nuGetRations,
 nuAddIron, nuAddGold, nuAddCrystal, nuAddDarkMatter, nuAddTorchOil, nuAddRations,
 nuConsumeRations, nuConsumeTorchOil,
 nuMine, nuGetTotalOreMined: () => state.totalOreMined,
 nuGetCreaturesDefeated, nuGetZoneCreatures, nuGetCreature, nuFightCreature,
 nuHeal, nuFullHeal, nuGetCurrentHp, nuGetMaxHp,
 nuGetEquipment, nuEquipItem, nuUnequipItem, nuGetEquippedItem,
 nuGetStructures, nuGetStructureLevel, nuUpgradeStructure, nuGetStructureUpgradeCost,
 nuGetEventsSurvived, nuGetRandomEvent, nuResolveEvent,
 nuGetArtifacts, nuGetArtifactInfo, nuCollectArtifact,
 nuGetCraftingCount, nuCraft,
 nuGetAchievements, nuIsAchievementUnlocked, nuUnlockAchievement, nuCheckAchievements,
 nuIsDailyCompleted, nuClaimDaily, nuGetStreak, nuGetBestStreak, nuGetTotalExpeditions,
 nuGetBossesDefeated, nuGetZoneBoss, nuFightBoss,
 nuGetState, nuSetState, nuReset,
 };
}


