'use client';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';

// ────────────────────────────────────────────────────────────
// SECTION 1: CONSTANTS (GV_ prefixed)
// ────────────────────────────────────────────────────────────

export const GV_RARITY_COMMON = 'common';
export const GV_RARITY_UNCOMMON = 'uncommon';
export const GV_RARITY_RARE = 'rare';
export const GV_RARITY_EPIC = 'epic';
export const GV_RARITY_LEGENDARY = 'legendary';

export const GV_RARITY_ORDER = [
  GV_RARITY_COMMON,
  GV_RARITY_UNCOMMON,
  GV_RARITY_RARE,
  GV_RARITY_EPIC,
  GV_RARITY_LEGENDARY,
] as const;

export const GV_RARITY_COLORS: Record<string, string> = {
  [GV_RARITY_COMMON]: '#8B7355',
  [GV_RARITY_UNCOMMON]: '#6B8E23',
  [GV_RARITY_RARE]: '#4682B4',
  [GV_RARITY_EPIC]: '#8A2BE2',
  [GV_RARITY_LEGENDARY]: '#DAA520',
};

export const GV_RARITY_CRAFT_COST_MULT: Record<string, number> = {
  [GV_RARITY_COMMON]: 1,
  [GV_RARITY_UNCOMMON]: 2,
  [GV_RARITY_RARE]: 5,
  [GV_RARITY_EPIC]: 12,
  [GV_RARITY_LEGENDARY]: 30,
};

export const GV_MAX_LEVEL = 50;
export const GV_MAX_GOLEM_LEVEL = 30;
export const GV_STARTING_COINS = 500;
export const GV_XP_PER_LEVEL_BASE = 100;
export const GV_XP_SCALE_FACTOR = 1.18;
export const GV_COIN_REWARD_PER_LEVEL = 50;
export const GV_DAILY_TASK_COINS = 200;
export const GV_DEFENSE_REWARD_COINS = 150;
export const GV_MAX_INVENTORY_MATERIAL = 999;
export const GV_MAX_OWNED_GOLEMS = 50;
export const GV_MAX_ZONE_ASSIGNMENTS = 4;
export const GV_CRAFT_COIN_BASE = 25;
export const GV_UPGRADE_COIN_BASE = 40;
export const GV_RUNE_ACTIVATE_COST = 100;
export const GV_EQUIP_COST = 30;
export const GV_SHOP_REFRESH_COINS = 50;
export const GV_ATTACK_COOLDOWN_MS = 30000;
export const GV_DAILY_RESET_MS = 86400000;
export const GV_AUTO_SAVE_MS = 15000;

export const GV_THEME_AMBER = '#D4A017';
export const GV_THEME_BROWN = '#6B4226';
export const GV_THEME_STONE = '#A0937D';
export const GV_THEME_SLATE = '#4A5568';
export const GV_THEME_PARCHMENT = '#F5F0E8';
export const GV_THEME_DARK_EARTH = '#3E2723';
export const GV_THEME_WARM_GOLD = '#C5961A';
export const GV_THEME_CLAY = '#CC7722';

export const GV_ELEMENT_FIRE = 'fire';
export const GV_ELEMENT_WATER = 'water';
export const GV_ELEMENT_EARTH = 'earth';
export const GV_ELEMENT_WIND = 'wind';
export const GV_ELEMENT_LIGHTNING = 'lightning';
export const GV_ELEMENT_SHADOW = 'shadow';
export const GV_ELEMENT_LIGHT = 'light';
export const GV_ELEMENT_ARCANE = 'arcane';

export const GV_ALL_ELEMENTS = [
  GV_ELEMENT_FIRE,
  GV_ELEMENT_WATER,
  GV_ELEMENT_EARTH,
  GV_ELEMENT_WIND,
  GV_ELEMENT_LIGHTNING,
  GV_ELEMENT_SHADOW,
  GV_ELEMENT_LIGHT,
  GV_ELEMENT_ARCANE,
] as const;

export const GV_ELEMENT_COLORS: Record<string, string> = {
  [GV_ELEMENT_FIRE]: '#E25822',
  [GV_ELEMENT_WATER]: '#1E90FF',
  [GV_ELEMENT_EARTH]: '#8B6914',
  [GV_ELEMENT_WIND]: '#87CEEB',
  [GV_ELEMENT_LIGHTNING]: '#FFD700',
  [GV_ELEMENT_SHADOW]: '#4B0082',
  [GV_ELEMENT_LIGHT]: '#FFFACD',
  [GV_ELEMENT_ARCANE]: '#BA55D3',
};

// ────────────────────────────────────────────────────────────
// 32 Golem Types
// ────────────────────────────────────────────────────────────

export interface GolemTypeDefinition {
  id: string;
  name: string;
  rarity: string;
  element: string;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  craftCost: number;
  description: string;
  emoji: string;
}

export const GV_GOLEM_TYPES: GolemTypeDefinition[] = [
  // Common (7)
  { id: 'clay_golem', name: 'Clay Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH, baseHp: 80, baseAtk: 8, baseDef: 10, craftCost: 30, description: 'A humble figure molded from river clay, reliable and easy to repair.', emoji: '🏺' },
  { id: 'stone_golem', name: 'Stone Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH, baseHp: 100, baseAtk: 10, baseDef: 14, craftCost: 35, description: 'Carved from granite boulders, a steadfast guardian.', emoji: '🪨' },
  { id: 'bone_golem', name: 'Bone Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_SHADOW, baseHp: 70, baseAtk: 12, baseDef: 8, craftCost: 30, description: 'Assembled from ancient skeletal remains, eerie yet loyal.', emoji: '🦴' },
  { id: 'copper_golem', name: 'Copper Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_LIGHTNING, baseHp: 85, baseAtk: 9, baseDef: 11, craftCost: 32, description: 'A warm-toned automaton that conducts electrical currents.', emoji: '🟤' },
  { id: 'marble_golem', name: 'Marble Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_LIGHT, baseHp: 90, baseAtk: 8, baseDef: 13, craftCost: 34, description: 'Sculpted from polished marble, radiant in sunlight.', emoji: '🤍' },
  { id: 'bronze_golem', name: 'Bronze Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_FIRE, baseHp: 88, baseAtk: 11, baseDef: 11, craftCost: 33, description: 'An ancient alloy warrior, tarnished green with age.', emoji: '🥉' },
  { id: 'nature_golem', name: 'Nature Golem', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH, baseHp: 95, baseAtk: 7, baseDef: 12, craftCost: 31, description: 'Woven from roots, moss, and living wood, it breathes with the forest.', emoji: '🌿' },
  // Uncommon (7)
  { id: 'iron_golem', name: 'Iron Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_EARTH, baseHp: 140, baseAtk: 16, baseDef: 20, craftCost: 80, description: 'A hulking mass of smelted iron, nearly indestructible.', emoji: '⚙️' },
  { id: 'crystal_golem', name: 'Crystal Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_ARCANE, baseHp: 110, baseAtk: 18, baseDef: 14, craftCost: 90, description: 'Faceted crystalline body refracts light into dazzling displays.', emoji: '💎' },
  { id: 'frost_golem', name: 'Frost Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_WATER, baseHp: 120, baseAtk: 15, baseDef: 16, craftCost: 85, description: 'Perpetually encased in glacial ice, freezing all who approach.', emoji: '❄️' },
  { id: 'storm_golem', name: 'Storm Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_WIND, baseHp: 115, baseAtk: 20, baseDef: 13, craftCost: 88, description: 'Crackling with static charge, it summons thunder at will.', emoji: '⛈️' },
  { id: 'blood_golem', name: 'Blood Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_SHADOW, baseHp: 130, baseAtk: 17, baseDef: 15, craftCost: 82, description: 'Powered by enchanted lifeblood, it grows stronger with each wound.', emoji: '🩸' },
  { id: 'titanium_golem', name: 'Titanium Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_LIGHTNING, baseHp: 150, baseAtk: 14, baseDef: 22, craftCost: 95, description: 'Lightweight yet incredibly tough, a marvel of metallurgy.', emoji: '🔩' },
  { id: 'magma_golem', name: 'Magma Golem', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_FIRE, baseHp: 125, baseAtk: 22, baseDef: 12, craftCost: 92, description: 'Its body flows with molten rock, leaving trails of destruction.', emoji: '🌋' },
  // Rare (6)
  { id: 'obsidian_golem', name: 'Obsidian Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_SHADOW, baseHp: 180, baseAtk: 24, baseDef: 28, craftCost: 250, description: 'Forged from volcanic glass, its edges cut through any defense.', emoji: '🖤' },
  { id: 'gold_golem', name: 'Gold Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_LIGHT, baseHp: 160, baseAtk: 20, baseDef: 25, craftCost: 300, description: 'A gleaming symbol of wealth that shields allies with golden auras.', emoji: '🥇' },
  { id: 'shadow_golem', name: 'Shadow Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_SHADOW, baseHp: 170, baseAtk: 28, baseDef: 20, craftCost: 280, description: 'Existing between dimensions, it strikes from unseen angles.', emoji: '👤' },
  { id: 'mythril_golem', name: 'Mythril Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_ARCANE, baseHp: 200, baseAtk: 26, baseDef: 30, craftCost: 320, description: 'Mythril is lighter than steel yet harder than diamond.', emoji: '✨' },
  { id: 'ruby_golem', name: 'Ruby Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_FIRE, baseHp: 175, baseAtk: 30, baseDef: 22, craftCost: 290, description: 'A blazing ruby core radiates heat that melts armor.', emoji: '🔴' },
  { id: 'sapphire_golem', name: 'Sapphire Golem', rarity: GV_RARITY_RARE, element: GV_ELEMENT_WATER, baseHp: 190, baseAtk: 22, baseDef: 27, craftCost: 270, description: 'Its sapphire body channels deep ocean pressure into crushing force.', emoji: '🔵' },
  // Epic (6)
  { id: 'emerald_golem', name: 'Emerald Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_EARTH, baseHp: 260, baseAtk: 34, baseDef: 36, craftCost: 750, description: 'Ancient emerald energy grants it miraculous regenerative powers.', emoji: '🟢' },
  { id: 'amethyst_golem', name: 'Amethyst Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_ARCANE, baseHp: 240, baseAtk: 38, baseDef: 32, craftCost: 800, description: 'Channels psychic energy through its crystalline violet form.', emoji: '🟣' },
  { id: 'topaz_golem', name: 'Topaz Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_LIGHTNING, baseHp: 250, baseAtk: 36, baseDef: 34, craftCost: 780, description: 'Stores lightning in its faceted body and unleashes it in devastating bursts.', emoji: '🟡' },
  { id: 'diamond_golem', name: 'Diamond Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_LIGHT, baseHp: 280, baseAtk: 32, baseDef: 40, craftCost: 900, description: 'The hardest substance known, its diamond hide is virtually unbreakable.', emoji: '💠' },
  { id: 'adamantine_golem', name: 'Adamantine Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_FIRE, baseHp: 300, baseAtk: 40, baseDef: 38, craftCost: 950, description: 'Forged from the legendary metal of the gods, it cannot be destroyed.', emoji: '🛡️' },
  { id: 'electrum_golem', name: 'Electrum Golem', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_LIGHTNING, baseHp: 245, baseAtk: 42, baseDef: 30, craftCost: 820, description: 'Gold-silver alloy body crackles with infinite electrical potential.', emoji: '⚡' },
  // Legendary (6)
  { id: 'platinum_golem', name: 'Platinum Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_LIGHT, baseHp: 400, baseAtk: 48, baseDef: 50, craftCost: 2500, description: 'A flawless platinum construct radiating divine purification energy.', emoji: '👑' },
  { id: 'opal_golem', name: 'Opal Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_ARCANE, baseHp: 380, baseAtk: 52, baseDef: 46, craftCost: 2800, description: 'Shifting opal surfaces refract every spell cast upon it into power.', emoji: '🌈' },
  { id: 'onyx_golem', name: 'Onyx Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_SHADOW, baseHp: 420, baseAtk: 55, baseDef: 44, craftCost: 3000, description: 'Absorbs all light and hope, an avatar of the deep void.', emoji: '⬛' },
  { id: 'starlight_golem', name: 'Starlight Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_LIGHT, baseHp: 450, baseAtk: 50, baseDef: 52, craftCost: 3200, description: 'Woven from captured starlight, it shines with cosmic power.', emoji: '⭐' },
  { id: 'void_golem', name: 'Void Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_SHADOW, baseHp: 480, baseAtk: 58, baseDef: 48, craftCost: 3500, description: 'A hole in reality given purpose, it exists beyond comprehension.', emoji: '🕳️' },
  { id: 'primordial_golem', name: 'Primordial Golem', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_ARCANE, baseHp: 500, baseAtk: 60, baseDef: 55, craftCost: 4000, description: 'The first golem ever created, containing the spark of creation itself.', emoji: '🌟' },
];

// ────────────────────────────────────────────────────────────
// 8 Village Zones
// ────────────────────────────────────────────────────────────

export interface VillageZoneDefinition {
  id: string;
  name: string;
  minPlayerLevel: number;
  bonusElement: string;
  coinPerTick: number;
  xpPerTick: number;
  description: string;
  emoji: string;
  color: string;
}

export const GV_VILLAGE_ZONES: VillageZoneDefinition[] = [
  { id: 'clay_quarry', name: 'Clay Quarry', minPlayerLevel: 1, bonusElement: GV_ELEMENT_EARTH, coinPerTick: 5, xpPerTick: 2, description: 'A rich deposit of clay and soft stone for basic golem construction.', emoji: '🏗️', color: '#A0522D' },
  { id: 'stone_workshop', name: 'Stone Workshop', minPlayerLevel: 3, bonusElement: GV_ELEMENT_EARTH, coinPerTick: 10, xpPerTick: 4, description: 'Where raw stone is shaped into formidable guardians.', emoji: '⚒️', color: '#808080' },
  { id: 'iron_forge', name: 'Iron Forge', minPlayerLevel: 8, bonusElement: GV_ELEMENT_FIRE, coinPerTick: 18, xpPerTick: 7, description: 'A blazing forge where metal golems gain their strength.', emoji: '🔥', color: '#B22222' },
  { id: 'crystal_cavern', name: 'Crystal Cavern', minPlayerLevel: 14, bonusElement: GV_ELEMENT_ARCANE, coinPerTick: 30, xpPerTick: 12, description: 'Luminescent caves pulsing with raw arcane energy.', emoji: '💠', color: '#9370DB' },
  { id: 'obsidian_depths', name: 'Obsidian Depths', minPlayerLevel: 20, bonusElement: GV_ELEMENT_SHADOW, coinPerTick: 45, xpPerTick: 18, description: 'Deep underground tunnels lined with razor-sharp volcanic glass.', emoji: '🖤', color: '#1C1C1C' },
  { id: 'mythril_sanctum', name: 'Mythril Sanctum', minPlayerLevel: 28, bonusElement: GV_ELEMENT_LIGHT, coinPerTick: 65, xpPerTick: 25, description: 'A sacred hall where mythril is blessed by ancient rituals.', emoji: '✨', color: '#C0C0C0' },
  { id: 'starlight_terrace', name: 'Starlight Terrace', minPlayerLevel: 36, bonusElement: GV_ELEMENT_LIGHT, coinPerTick: 90, xpPerTick: 35, description: 'An open-air platform high above the clouds, bathed in starlight.', emoji: '🌙', color: '#191970' },
  { id: 'void_nexus', name: 'Void Nexus', minPlayerLevel: 44, bonusElement: GV_ELEMENT_ARCANE, coinPerTick: 130, xpPerTick: 50, description: 'A tear in reality where the fabric of worlds grows thin.', emoji: '🌀', color: '#2F0047' },
];

// ────────────────────────────────────────────────────────────
// 25 Materials
// ────────────────────────────────────────────────────────────

export interface MaterialDefinition {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  emoji: string;
  rarity: string;
  element: string;
}

export const GV_MATERIALS: MaterialDefinition[] = [
  { id: 'clay', name: 'Clay', description: 'Soft, malleable earth for basic golem frames.', baseCost: 5, emoji: '🟤', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH },
  { id: 'stone', name: 'Stone', description: 'Sturdy granite chunks for solid construction.', baseCost: 8, emoji: '🪨', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH },
  { id: 'iron_ore', name: 'Iron Ore', description: 'Raw iron deposits, essential for metal golems.', baseCost: 15, emoji: '⛏️', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH },
  { id: 'copper', name: 'Copper', description: 'Conductive metal for electrical golems.', baseCost: 12, emoji: '🟠', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_LIGHTNING },
  { id: 'bronze_ingot', name: 'Bronze Ingot', description: 'An alloy of copper and tin, fire-resistant.', baseCost: 18, emoji: '🥉', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_FIRE },
  { id: 'crystal_shards', name: 'Crystal Shards', description: 'Fragments of enchanted crystal, humming with energy.', baseCost: 25, emoji: '🔮', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_ARCANE },
  { id: 'obsidian', name: 'Obsidian', description: 'Volcanic glass sharper than steel.', baseCost: 35, emoji: '🖤', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_SHADOW },
  { id: 'gold_dust', name: 'Gold Dust', description: 'Finely ground gold particles for gilding.', baseCost: 40, emoji: '✨', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_LIGHT },
  { id: 'titanium_ore', name: 'Titanium Ore', description: 'Extremely lightweight yet durable metal.', baseCost: 50, emoji: '🔩', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_LIGHTNING },
  { id: 'mythril_ingot', name: 'Mythril Ingot', description: 'Legendary lightweight super-metal.', baseCost: 100, emoji: '💫', rarity: GV_RARITY_RARE, element: GV_ELEMENT_ARCANE },
  { id: 'marble_block', name: 'Marble Block', description: 'Pure white marble for elegant golems.', baseCost: 20, emoji: '⬜', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_LIGHT },
  { id: 'bone_fragments', name: 'Bone Fragments', description: 'Ancient bones imbued with shadow energy.', baseCost: 10, emoji: '🦴', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_SHADOW },
  { id: 'shadow_essence', name: 'Shadow Essence', description: 'Concentrated darkness harvested from the void.', baseCost: 60, emoji: '🌑', rarity: GV_RARITY_RARE, element: GV_ELEMENT_SHADOW },
  { id: 'magma_core', name: 'Magma Core', description: 'A contained sphere of liquid fire.', baseCost: 55, emoji: '🌋', rarity: GV_RARITY_RARE, element: GV_ELEMENT_FIRE },
  { id: 'frost_crystal', name: 'Frost Crystal', description: 'Perpetually frozen crystal that never melts.', baseCost: 45, emoji: '❄️', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_WATER },
  { id: 'storm_shard', name: 'Storm Shard', description: 'A fragment of solidified lightning.', baseCost: 48, emoji: '⚡', rarity: GV_RARITY_UNCOMMON, element: GV_ELEMENT_WIND },
  { id: 'blood_ruby', name: 'Blood Ruby', description: 'A crimson gemstone pulsing with life force.', baseCost: 70, emoji: '🔴', rarity: GV_RARITY_RARE, element: GV_ELEMENT_FIRE },
  { id: 'nature_seed', name: 'Nature Seed', description: 'An enchanted seed that grows into golem parts.', baseCost: 8, emoji: '🌱', rarity: GV_RARITY_COMMON, element: GV_ELEMENT_EARTH },
  { id: 'platinum_ore', name: 'Platinum Ore', description: 'The rarest of noble metals.', baseCost: 150, emoji: '👑', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_LIGHT },
  { id: 'ruby_gem', name: 'Ruby Gem', description: 'A flawless ruby of exceptional quality.', baseCost: 80, emoji: '💎', rarity: GV_RARITY_RARE, element: GV_ELEMENT_FIRE },
  { id: 'sapphire_gem', name: 'Sapphire Gem', description: 'Deep blue sapphire with oceanic depths.', baseCost: 80, emoji: '💠', rarity: GV_RARITY_RARE, element: GV_ELEMENT_WATER },
  { id: 'emerald_gem', name: 'Emerald Gem', description: 'Vibrant green emerald with healing properties.', baseCost: 90, emoji: '🟢', rarity: GV_RARITY_RARE, element: GV_ELEMENT_EARTH },
  { id: 'amethyst_gem', name: 'Amethyst Gem', description: 'Psychic amethyst radiating mental energy.', baseCost: 120, emoji: '🟣', rarity: GV_RARITY_EPIC, element: GV_ELEMENT_ARCANE },
  { id: 'starlight_fragment', name: 'Starlight Fragment', description: 'A piece of solidified starlight from the cosmos.', baseCost: 200, emoji: '⭐', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_LIGHT },
  { id: 'void_dust', name: 'Void Dust', description: 'Substance from between dimensions.', baseCost: 250, emoji: '🕳️', rarity: GV_RARITY_LEGENDARY, element: GV_ELEMENT_SHADOW },
];

// ────────────────────────────────────────────────────────────
// 8 Elemental Runes
// ────────────────────────────────────────────────────────────

export interface RuneDefinition {
  id: string;
  element: string;
  name: string;
  description: string;
  powerBonus: number;
  activationCost: number;
  emoji: string;
  color: string;
}

export const GV_RUNES: RuneDefinition[] = [
  { id: 'rune_fire', element: GV_ELEMENT_FIRE, name: 'Rune of Fire', description: 'Imbues a golem with searing flame, increasing attack power.', powerBonus: 15, activationCost: 100, emoji: '🔥', color: '#E25822' },
  { id: 'rune_water', element: GV_ELEMENT_WATER, name: 'Rune of Water', description: 'Envelops a golem in healing waters, boosting HP regeneration.', powerBonus: 12, activationCost: 100, emoji: '💧', color: '#1E90FF' },
  { id: 'rune_earth', element: GV_ELEMENT_EARTH, name: 'Rune of Earth', description: 'Fortifies a golem with stone armor, greatly increasing defense.', powerBonus: 18, activationCost: 100, emoji: '🌿', color: '#8B6914' },
  { id: 'rune_wind', element: GV_ELEMENT_WIND, name: 'Rune of Wind', description: 'Grants swift movement and evasion capabilities.', powerBonus: 10, activationCost: 100, emoji: '💨', color: '#87CEEB' },
  { id: 'rune_lightning', element: GV_ELEMENT_LIGHTNING, name: 'Rune of Lightning', description: 'Charges a golem with electric power for devastating strikes.', powerBonus: 16, activationCost: 100, emoji: '⚡', color: '#FFD700' },
  { id: 'rune_shadow', element: GV_ELEMENT_SHADOW, name: 'Rune of Shadow', description: 'Shrouds a golem in darkness for stealth and critical hits.', powerBonus: 14, activationCost: 100, emoji: '🌑', color: '#4B0082' },
  { id: 'rune_light', element: GV_ELEMENT_LIGHT, name: 'Rune of Light', description: 'Bathes a golem in radiant energy, purifying and shielding.', powerBonus: 13, activationCost: 100, emoji: '☀️', color: '#FFFACD' },
  { id: 'rune_arcane', element: GV_ELEMENT_ARCANE, name: 'Rune of Arcane', description: 'Infuses raw magical energy, enhancing all abilities.', powerBonus: 20, activationCost: 100, emoji: '🔮', color: '#BA55D3' },
];

// ────────────────────────────────────────────────────────────
// 30 Abilities
// ────────────────────────────────────────────────────────────

export interface AbilityDefinition {
  id: string;
  name: string;
  element: string;
  description: string;
  power: number;
  cooldown: number;
  isUniversal: boolean;
  emoji: string;
}

export const GV_ABILITIES: AbilityDefinition[] = [
  // Universal abilities (6)
  { id: 'shield_bash', name: 'Shield Bash', element: '', description: 'A powerful bash that stuns the target briefly.', power: 25, cooldown: 3, isUniversal: true, emoji: '🛡️' },
  { id: 'ground_slam', name: 'Ground Slam', element: '', description: 'Slams the ground creating a shockwave.', power: 30, cooldown: 4, isUniversal: true, emoji: '💥' },
  { id: 'regenerate', name: 'Regenerate', element: '', description: 'Slowly repairs golem damage over time.', power: 20, cooldown: 5, isUniversal: true, emoji: '💚' },
  { id: 'fortify', name: 'Fortify', element: '', description: 'Temporarily doubles defense for a short duration.', power: 15, cooldown: 6, isUniversal: true, emoji: '🏰' },
  { id: 'charge', name: 'Charge', element: '', description: 'Rushes forward with tremendous momentum.', power: 35, cooldown: 3, isUniversal: true, emoji: '🐂' },
  { id: 'berserk', name: 'Berserk', element: '', description: 'Enters a frenzy, doubling attack at defense cost.', power: 40, cooldown: 8, isUniversal: true, emoji: '😤' },
  // Fire (3)
  { id: 'fireball', name: 'Fireball', element: GV_ELEMENT_FIRE, description: 'Hurls a massive ball of concentrated flame.', power: 45, cooldown: 3, isUniversal: false, emoji: '🔥' },
  { id: 'flame_shield', name: 'Flame Shield', element: GV_ELEMENT_FIRE, description: 'Wraps in fire that burns attackers on contact.', power: 30, cooldown: 5, isUniversal: false, emoji: '☄️' },
  { id: 'inferno', name: 'Inferno', element: GV_ELEMENT_FIRE, description: 'Unleashes an all-consuming firestorm.', power: 60, cooldown: 7, isUniversal: false, emoji: '🌋' },
  // Water (3)
  { id: 'tidal_wave', name: 'Tidal Wave', element: GV_ELEMENT_WATER, description: 'Summons a devastating wall of water.', power: 42, cooldown: 4, isUniversal: false, emoji: '🌊' },
  { id: 'ice_armor', name: 'Ice Armor', element: GV_ELEMENT_WATER, description: 'Encases self in protective ice, boosting defense.', power: 28, cooldown: 5, isUniversal: false, emoji: '🧊' },
  { id: 'heal_rain', name: 'Heal Rain', element: GV_ELEMENT_WATER, description: 'Summons restorative rain that heals all allies.', power: 35, cooldown: 6, isUniversal: false, emoji: '🌧️' },
  // Earth (3)
  { id: 'rock_throw', name: 'Rock Throw', element: GV_ELEMENT_EARTH, description: 'Hurls massive boulders with crushing force.', power: 38, cooldown: 2, isUniversal: false, emoji: '🪨' },
  { id: 'earthquake', name: 'Earthquake', element: GV_ELEMENT_EARTH, description: 'Shakes the ground violently, damaging all enemies.', power: 55, cooldown: 6, isUniversal: false, emoji: '🏟️' },
  { id: 'stone_wall', name: 'Stone Wall', element: GV_ELEMENT_EARTH, description: 'Raises an impenetrable stone barrier.', power: 22, cooldown: 4, isUniversal: false, emoji: '🧱' },
  // Wind (3)
  { id: 'gale_force', name: 'Gale Force', element: GV_ELEMENT_WIND, description: 'Blows enemies back with hurricane winds.', power: 36, cooldown: 3, isUniversal: false, emoji: '🌬️' },
  { id: 'tornado', name: 'Tornado', element: GV_ELEMENT_WIND, description: 'Spawns a whirlwind that tosses enemies around.', power: 50, cooldown: 6, isUniversal: false, emoji: '🌪️' },
  { id: 'air_shield', name: 'Air Shield', element: GV_ELEMENT_WIND, description: 'Creates a cushion of air that deflects projectiles.', power: 24, cooldown: 4, isUniversal: false, emoji: '🌀' },
  // Lightning (3)
  { id: 'thunder_strike', name: 'Thunder Strike', element: GV_ELEMENT_LIGHTNING, description: 'Calls down a bolt of lightning from the sky.', power: 48, cooldown: 3, isUniversal: false, emoji: '⚡' },
  { id: 'chain_lightning', name: 'Chain Lightning', element: GV_ELEMENT_LIGHTNING, description: 'Lightning that jumps between multiple targets.', power: 44, cooldown: 5, isUniversal: false, emoji: '🔗' },
  { id: 'static_field', name: 'Static Field', element: GV_ELEMENT_LIGHTNING, description: 'Creates an area that slows and damages enemies.', power: 32, cooldown: 6, isUniversal: false, emoji: '🔵' },
  // Shadow (3)
  { id: 'shadow_strike', name: 'Shadow Strike', element: GV_ELEMENT_SHADOW, description: 'Attacks from the shadows for massive crit damage.', power: 52, cooldown: 4, isUniversal: false, emoji: '👤' },
  { id: 'void_drain', name: 'Void Drain', element: GV_ELEMENT_SHADOW, description: 'Drains life force from enemies to heal self.', power: 38, cooldown: 5, isUniversal: false, emoji: '🕳️' },
  { id: 'dark_pulse', name: 'Dark Pulse', element: GV_ELEMENT_SHADOW, description: 'Releases a wave of dark energy in all directions.', power: 46, cooldown: 5, isUniversal: false, emoji: '🌑' },
  // Light (3)
  { id: 'holy_radiance', name: 'Holy Radiance', element: GV_ELEMENT_LIGHT, description: 'Blinds enemies with a burst of pure light.', power: 40, cooldown: 4, isUniversal: false, emoji: '☀️' },
  { id: 'divine_shield', name: 'Divine Shield', element: GV_ELEMENT_LIGHT, description: 'Creates a protective barrier of holy energy.', power: 26, cooldown: 6, isUniversal: false, emoji: '🕉️' },
  { id: 'purify', name: 'Purify', element: GV_ELEMENT_LIGHT, description: 'Removes all debuffs and heals ailments.', power: 20, cooldown: 7, isUniversal: false, emoji: '✨' },
  // Arcane (3)
  { id: 'arcane_blast', name: 'Arcane Blast', element: GV_ELEMENT_ARCANE, description: 'Fires a concentrated beam of raw magic.', power: 50, cooldown: 3, isUniversal: false, emoji: '🔮' },
  { id: 'mana_surge', name: 'Mana Surge', element: GV_ELEMENT_ARCANE, description: 'Overloads with magical energy, boosting all abilities.', power: 35, cooldown: 7, isUniversal: false, emoji: '💫' },
  { id: 'disintegrate', name: 'Disintegrate', element: GV_ELEMENT_ARCANE, description: 'Unleashes a ray that breaks down matter at the atomic level.', power: 65, cooldown: 8, isUniversal: false, emoji: '💀' },
];

// ────────────────────────────────────────────────────────────
// 22 Equipment Items
// ────────────────────────────────────────────────────────────

export interface EquipmentDefinition {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  hpBonus: number;
  atkBonus: number;
  defBonus: number;
  cost: number;
  description: string;
  emoji: string;
}

export const GV_EQUIPMENT: EquipmentDefinition[] = [
  // Core upgrades (5)
  { id: 'basic_core', name: 'Basic Core', slot: 'core', rarity: GV_RARITY_COMMON, hpBonus: 20, atkBonus: 2, defBonus: 2, cost: 50, description: 'A simple power core for basic golems.', emoji: '🔋' },
  { id: 'reinforced_core', name: 'Reinforced Core', slot: 'core', rarity: GV_RARITY_UNCOMMON, hpBonus: 50, atkBonus: 5, defBonus: 5, cost: 150, description: 'An upgraded core with stronger energy output.', emoji: '⚡' },
  { id: 'elemental_core', name: 'Elemental Core', slot: 'core', rarity: GV_RARITY_RARE, hpBonus: 100, atkBonus: 12, defBonus: 10, cost: 400, description: 'A core attuned to elemental forces.', emoji: '🌀' },
  { id: 'mythic_core', name: 'Mythic Core', slot: 'core', rarity: GV_RARITY_EPIC, hpBonus: 200, atkBonus: 20, defBonus: 18, cost: 1000, description: 'A legendary core pulsing with mythic power.', emoji: '✨' },
  { id: 'primordial_core', name: 'Primordial Core', slot: 'core', rarity: GV_RARITY_LEGENDARY, hpBonus: 400, atkBonus: 35, defBonus: 30, cost: 3000, description: 'Contains a fragment of creation itself.', emoji: '🌟' },
  // Armor plating (5)
  { id: 'leather_plating', name: 'Leather Plating', slot: 'armor', rarity: GV_RARITY_COMMON, hpBonus: 15, atkBonus: 0, defBonus: 5, cost: 30, description: 'Basic leather armor, better than nothing.', emoji: '🧶' },
  { id: 'iron_plating', name: 'Iron Plating', slot: 'armor', rarity: GV_RARITY_UNCOMMON, hpBonus: 30, atkBonus: 0, defBonus: 12, cost: 100, description: 'Sturdy iron plates bolted onto the frame.', emoji: '🔩' },
  { id: 'steel_plating', name: 'Steel Plating', slot: 'armor', rarity: GV_RARITY_RARE, hpBonus: 60, atkBonus: 0, defBonus: 25, cost: 300, description: 'Tempered steel for maximum protection.', emoji: '🛡️' },
  { id: 'mythril_plating', name: 'Mythril Plating', slot: 'armor', rarity: GV_RARITY_EPIC, hpBonus: 120, atkBonus: 0, defBonus: 45, cost: 800, description: 'Feather-light mythril that stops any blow.', emoji: '💫' },
  { id: 'adamantine_plating', name: 'Adamantine Plating', slot: 'armor', rarity: GV_RARITY_LEGENDARY, hpBonus: 250, atkBonus: 0, defBonus: 80, cost: 2500, description: 'Virtually indestructible armor from the gods.', emoji: '🏰' },
  // Rune slots (4)
  { id: 'single_rune_slot', name: 'Single Rune Slot', slot: 'rune_slot', rarity: GV_RARITY_COMMON, hpBonus: 0, atkBonus: 3, defBonus: 3, cost: 40, description: 'Allows equipping one elemental rune.', emoji: '🔘' },
  { id: 'double_rune_slot', name: 'Double Rune Slot', slot: 'rune_slot', rarity: GV_RARITY_UNCOMMON, hpBonus: 5, atkBonus: 6, defBonus: 6, cost: 120, description: 'Allows equipping two elemental runes.', emoji: '🔘🔘' },
  { id: 'triple_rune_slot', name: 'Triple Rune Slot', slot: 'rune_slot', rarity: GV_RARITY_RARE, hpBonus: 10, atkBonus: 10, defBonus: 10, cost: 350, description: 'Allows equipping three elemental runes.', emoji: '🔘🔘🔘' },
  { id: 'quad_rune_slot', name: 'Quad Rune Slot', slot: 'rune_slot', rarity: GV_RARITY_EPIC, hpBonus: 20, atkBonus: 15, defBonus: 15, cost: 900, description: 'Allows equipping four elemental runes.', emoji: '🔘🔘🔘🔘' },
  // Power crystals (8)
  { id: 'fire_crystal', name: 'Fire Power Crystal', slot: 'crystal', rarity: GV_RARITY_UNCOMMON, hpBonus: 10, atkBonus: 8, defBonus: 2, cost: 80, description: 'A crystal burning with eternal flame.', emoji: '🔶' },
  { id: 'water_crystal', name: 'Water Power Crystal', slot: 'crystal', rarity: GV_RARITY_UNCOMMON, hpBonus: 20, atkBonus: 2, defBonus: 6, cost: 80, description: 'A crystal flowing with healing waters.', emoji: '🔷' },
  { id: 'earth_crystal', name: 'Earth Power Crystal', slot: 'crystal', rarity: GV_RARITY_UNCOMMON, hpBonus: 15, atkBonus: 4, defBonus: 8, cost: 80, description: 'A crystal grounded with earth\'s stability.', emoji: '🟫' },
  { id: 'wind_crystal', name: 'Wind Power Crystal', slot: 'crystal', rarity: GV_RARITY_UNCOMMON, hpBonus: 5, atkBonus: 6, defBonus: 4, cost: 80, description: 'A crystal swirling with compressed air.', emoji: '🟩' },
  { id: 'lightning_crystal', name: 'Lightning Power Crystal', slot: 'crystal', rarity: GV_RARITY_RARE, hpBonus: 8, atkBonus: 12, defBonus: 3, cost: 200, description: 'A crystal crackling with electrical storms.', emoji: '🟨' },
  { id: 'shadow_crystal', name: 'Shadow Power Crystal', slot: 'crystal', rarity: GV_RARITY_RARE, hpBonus: 5, atkBonus: 14, defBonus: 2, cost: 200, description: 'A crystal absorbing light into darkness.', emoji: '🟪' },
  { id: 'light_crystal', name: 'Light Power Crystal', slot: 'crystal', rarity: GV_RARITY_RARE, hpBonus: 18, atkBonus: 5, defBonus: 10, cost: 200, description: 'A crystal radiating pure, cleansing light.', emoji: '🤍' },
  { id: 'arcane_crystal', name: 'Arcane Power Crystal', slot: 'crystal', rarity: GV_RARITY_EPIC, hpBonus: 25, atkBonus: 15, defBonus: 12, cost: 600, description: 'A crystal containing raw, chaotic magical energy.', emoji: '🔮' },
];

// ────────────────────────────────────────────────────────────
// 15 Achievements
// ────────────────────────────────────────────────────────────

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  emoji: string;
  tier: string;
}

export const GV_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: 'ach_first_creation', name: 'First Creation', description: 'Craft your first golem.', condition: 'craftFirstGolem', reward: 100, emoji: '🏺', tier: GV_RARITY_COMMON },
  { id: 'ach_village_builder', name: 'Village Builder', description: 'Own 5 golems simultaneously.', condition: 'ownGolems(5)', reward: 250, emoji: '🏘️', tier: GV_RARITY_COMMON },
  { id: 'ach_golem_army', name: 'Golem Army', description: 'Own 15 golems simultaneously.', condition: 'ownGolems(15)', reward: 500, emoji: '⚔️', tier: GV_RARITY_UNCOMMON },
  { id: 'ach_full_roster', name: 'Full Roster', description: 'Own one of every golem type (32 unique).', condition: 'ownAllTypes', reward: 2000, emoji: '📋', tier: GV_RARITY_LEGENDARY },
  { id: 'ach_zone_pioneer', name: 'Zone Pioneer', description: 'Assign golems to all 8 village zones.', condition: 'allZonesFilled', reward: 400, emoji: '🗺️', tier: GV_RARITY_UNCOMMON },
  { id: 'ach_rune_master', name: 'Rune Master', description: 'Activate all 8 elemental rune types.', condition: 'allRunesActive', reward: 600, emoji: '🔮', tier: GV_RARITY_RARE },
  { id: 'ach_fully_equipped', name: 'Fully Equipped', description: 'Equip an item on a golem for the first time.', condition: 'firstEquip', reward: 150, emoji: '🔧', tier: GV_RARITY_COMMON },
  { id: 'ach_veteran_crafter', name: 'Veteran Crafter', description: 'Craft 25 golems total (lifetime).', condition: 'craftCount(25)', reward: 800, emoji: '🔨', tier: GV_RARITY_RARE },
  { id: 'ach_legendary_forge', name: 'Legendary Forge', description: 'Craft a Legendary-tier golem.', condition: 'craftLegendary', reward: 1000, emoji: '👑', tier: GV_RARITY_EPIC },
  { id: 'ach_epic_collection', name: 'Epic Collection', description: 'Own 10 Epic or Legendary golems.', condition: 'ownEpicPlus(10)', reward: 1200, emoji: '💎', tier: GV_RARITY_EPIC },
  { id: 'ach_daily_devotee', name: 'Daily Devotee', description: 'Complete 7 daily tasks.', condition: 'dailyTasks(7)', reward: 500, emoji: '📅', tier: GV_RARITY_UNCOMMON },
  { id: 'ach_battle_hardened', name: 'Battle Hardened', description: 'Successfully defend the village 50 times.', condition: 'defenseWins(50)', reward: 1500, emoji: '🛡️', tier: GV_RARITY_EPIC },
  { id: 'ach_resource_baron', name: 'Resource Baron', description: 'Accumulate 10,000 coins total (lifetime earnings).', condition: 'totalCoins(10000)', reward: 2000, emoji: '💰', tier: GV_RARITY_RARE },
  { id: 'ach_max_level', name: 'Ascended Creator', description: 'Reach player level 50.', condition: 'maxLevel', reward: 3000, emoji: '🌟', tier: GV_RARITY_LEGENDARY },
  { id: 'ach_title_seeker', name: 'Title Seeker', description: 'Unlock all 8 progression titles.', condition: 'allTitles', reward: 5000, emoji: '🏅', tier: GV_RARITY_LEGENDARY },
];

// ────────────────────────────────────────────────────────────
// 8 Titles
// ────────────────────────────────────────────────────────────

export interface TitleDefinition {
  id: string;
  name: string;
  requiredLevel: number;
  description: string;
  coinBonus: number;
  xpBonus: number;
  emoji: string;
}

export const GV_TITLES: TitleDefinition[] = [
  { id: 'title_clay_apprentice', name: 'Clay Apprentice', requiredLevel: 1, description: 'A beginner who has just started molding their first golems.', coinBonus: 0, xpBonus: 0, emoji: '🏺' },
  { id: 'title_stone_crafter', name: 'Stone Crafter', requiredLevel: 5, description: 'Skilled at working with stone, creating sturdy guardians.', coinBonus: 5, xpBonus: 3, emoji: '🪨' },
  { id: 'title_iron_smith', name: 'Iron Smith', requiredLevel: 10, description: 'A master metalworker forging powerful iron golems.', coinBonus: 10, xpBonus: 5, emoji: '⚙️' },
  { id: 'title_crystal_artificer', name: 'Crystal Artificer', requiredLevel: 20, description: 'Channels arcane energy through crystalline constructs.', coinBonus: 20, xpBonus: 10, emoji: '💎' },
  { id: 'title_mythril_master', name: 'Mythril Master', requiredLevel: 30, description: 'Commands the legendary art of mythril golem creation.', coinBonus: 35, xpBonus: 15, emoji: '✨' },
  { id: 'title_starlight_forge_lord', name: 'Starlight Forge-Lord', requiredLevel: 38, description: 'Harnesses cosmic power to forge golems from starlight.', coinBonus: 50, xpBonus: 20, emoji: '🌙' },
  { id: 'title_void_architect', name: 'Void Architect', requiredLevel: 45, description: 'Builds golems from the fabric of reality itself.', coinBonus: 75, xpBonus: 25, emoji: '🕳️' },
  { id: 'title_primordial_creator', name: 'Primordial Creator', requiredLevel: 50, description: 'Has mastered all forms of golem creation. A living legend.', coinBonus: 100, xpBonus: 35, emoji: '🌟' },
];

// ────────────────────────────────────────────────────────────
// Daily Tasks
// ────────────────────────────────────────────────────────────

export interface DailyTaskTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  target: number;
  reward: number;
  emoji: string;
}

export const GV_DAILY_TASK_TEMPLATES: DailyTaskTemplate[] = [
  { id: 'daily_craft', name: 'Craft a Golem', description: 'Craft {target} golems today.', type: 'craft', target: 1, reward: 200, emoji: '🔨' },
  { id: 'daily_assign', name: 'Assign a Golem', description: 'Assign {target} golems to zones.', type: 'assign', target: 2, reward: 150, emoji: '📍' },
  { id: 'daily_defend', name: 'Defend the Village', description: 'Win {target} village defenses.', type: 'defend', target: 1, reward: 250, emoji: '🛡️' },
  { id: 'daily_upgrade', name: 'Upgrade a Golem', description: 'Upgrade {target} golems today.', type: 'upgrade', target: 1, reward: 180, emoji: '⬆️' },
  { id: 'daily_material', name: 'Gather Materials', description: 'Buy or collect {target} materials.', type: 'material', target: 3, reward: 120, emoji: '📦' },
  { id: 'daily_rune', name: 'Activate a Rune', description: 'Activate {target} runes on golems.', type: 'rune', target: 1, reward: 200, emoji: '🔮' },
  { id: 'daily_shop', name: 'Visit the Shop', description: 'Purchase {target} items from the shop.', type: 'shop', target: 2, reward: 100, emoji: '🏪' },
  { id: 'daily_equip', name: 'Equip an Item', description: 'Equip {target} items on golems.', type: 'equip', target: 1, reward: 160, emoji: '🔧' },
];

// ────────────────────────────────────────────────────────────
// Shop System
// ────────────────────────────────────────────────────────────

export interface ShopItemDefinition {
  id: string;
  name: string;
  type: 'material' | 'equipment';
  itemId: string;
  baseCost: number;
  discountChance: number;
  stockMax: number;
  emoji: string;
}

export const GV_SHOP_ITEMS: ShopItemDefinition[] = [
  { id: 'shop_clay', name: 'Clay Bundle', type: 'material', itemId: 'clay', baseCost: 5, discountChance: 0.2, stockMax: 20, emoji: '🟤' },
  { id: 'shop_stone', name: 'Stone Bundle', type: 'material', itemId: 'stone', baseCost: 8, discountChance: 0.2, stockMax: 20, emoji: '🪨' },
  { id: 'shop_iron_ore', name: 'Iron Ore Bundle', type: 'material', itemId: 'iron_ore', baseCost: 15, discountChance: 0.15, stockMax: 15, emoji: '⛏️' },
  { id: 'shop_copper', name: 'Copper Bundle', type: 'material', itemId: 'copper', baseCost: 12, discountChance: 0.2, stockMax: 15, emoji: '🟠' },
  { id: 'shop_crystal_shards', name: 'Crystal Shard Pack', type: 'material', itemId: 'crystal_shards', baseCost: 25, discountChance: 0.15, stockMax: 10, emoji: '🔮' },
  { id: 'shop_obsidian', name: 'Obsidian Chunk', type: 'material', itemId: 'obsidian', baseCost: 35, discountChance: 0.1, stockMax: 8, emoji: '🖤' },
  { id: 'shop_gold_dust', name: 'Gold Dust Vial', type: 'material', itemId: 'gold_dust', baseCost: 40, discountChance: 0.1, stockMax: 8, emoji: '✨' },
  { id: 'shop_frost_crystal', name: 'Frost Crystal', type: 'material', itemId: 'frost_crystal', baseCost: 45, discountChance: 0.1, stockMax: 6, emoji: '❄️' },
  { id: 'shop_bone_fragments', name: 'Bone Fragments', type: 'material', itemId: 'bone_fragments', baseCost: 10, discountChance: 0.2, stockMax: 15, emoji: '🦴' },
  { id: 'shop_basic_core', name: 'Basic Core', type: 'equipment', itemId: 'basic_core', baseCost: 50, discountChance: 0.1, stockMax: 3, emoji: '🔋' },
  { id: 'shop_leather_plating', name: 'Leather Plating', type: 'equipment', itemId: 'leather_plating', baseCost: 30, discountChance: 0.15, stockMax: 5, emoji: '🧶' },
  { id: 'shop_single_rune_slot', name: 'Single Rune Slot', type: 'equipment', itemId: 'single_rune_slot', baseCost: 40, discountChance: 0.15, stockMax: 4, emoji: '🔘' },
  { id: 'shop_fire_crystal', name: 'Fire Power Crystal', type: 'equipment', itemId: 'fire_crystal', baseCost: 80, discountChance: 0.1, stockMax: 3, emoji: '🔶' },
  { id: 'shop_water_crystal', name: 'Water Power Crystal', type: 'equipment', itemId: 'water_crystal', baseCost: 80, discountChance: 0.1, stockMax: 3, emoji: '🔷' },
  { id: 'shop_earth_crystal', name: 'Earth Power Crystal', type: 'equipment', itemId: 'earth_crystal', baseCost: 80, discountChance: 0.1, stockMax: 3, emoji: '🟫' },
];

// ────────────────────────────────────────────────────────────
// Combat / Defense
// ────────────────────────────────────────────────────────────

export interface EnemyWaveDefinition {
  id: string;
  name: string;
  minLevel: number;
  enemyCount: number;
  enemyPower: number;
  reward: number;
  xpReward: number;
  emoji: string;
}

export const GV_ENEMY_WAVES: EnemyWaveDefinition[] = [
  { id: 'wave_slimes', name: 'Slime Invasion', minLevel: 1, enemyCount: 3, enemyPower: 20, reward: 50, xpReward: 15, emoji: '🟢' },
  { id: 'wave_goblins', name: 'Goblin Raiders', minLevel: 3, enemyCount: 5, enemyPower: 35, reward: 80, xpReward: 25, emoji: '👺' },
  { id: 'wave_skeletons', name: 'Skeleton Horde', minLevel: 6, enemyCount: 6, enemyPower: 50, reward: 120, xpReward: 40, emoji: '💀' },
  { id: 'wave_wolves', name: 'Dire Wolf Pack', minLevel: 10, enemyCount: 4, enemyPower: 75, reward: 160, xpReward: 55, emoji: '🐺' },
  { id: 'wave_elementals', name: 'Rogue Elementals', minLevel: 14, enemyCount: 5, enemyPower: 100, reward: 220, xpReward: 75, emoji: '🌪️' },
  { id: 'wave_dragons', name: 'Young Dragons', minLevel: 18, enemyCount: 2, enemyPower: 150, reward: 300, xpReward: 100, emoji: '🐲' },
  { id: 'wave_demons', name: 'Demon Incursion', minLevel: 24, enemyCount: 6, enemyPower: 180, reward: 400, xpReward: 130, emoji: '😈' },
  { id: 'wave_titans', name: 'Titan Assault', minLevel: 30, enemyCount: 3, enemyPower: 250, reward: 550, xpReward: 180, emoji: '🗿' },
  { id: 'wave_lich', name: 'Lich King\'s Army', minLevel: 36, enemyCount: 8, enemyPower: 300, reward: 750, xpReward: 250, emoji: '👤' },
  { id: 'wave_void', name: 'Void Breach', minLevel: 42, enemyCount: 5, enemyPower: 400, reward: 1000, xpReward: 350, emoji: '🕳️' },
  { id: 'wave_ancient', name: 'Ancient Awakened', minLevel: 48, enemyCount: 4, enemyPower: 500, reward: 1500, xpReward: 500, emoji: '☠️' },
];

// ────────────────────────────────────────────────────────────
// SECTION 2: STATE TYPES AND DEFAULTS
// ────────────────────────────────────────────────────────────

export interface OwnedGolem {
  instanceId: string;
  typeId: string;
  name: string;
  level: number;
  xp: number;
  currentHp: number;
  equippedCore: string | null;
  equippedArmor: string | null;
  equippedRuneSlot: string | null;
  equippedCrystal: string | null;
  activeRunes: string[];
  learnedAbilities: string[];
  assignedZone: string | null;
  craftDate: number;
}

export interface ZoneAssignment {
  zoneId: string;
  golemInstanceIds: string[];
}

export interface MaterialInventory {
  [materialId: string]: number;
}

export interface EquipmentInventory {
  [equipmentId: string]: number;
}

export interface AchievementState {
  [achievementId: string]: boolean;
}

export interface DailyTaskInstance {
  taskId: string;
  templateId: string;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
}

export interface ShopListing {
  shopItemId: string;
  currentCost: number;
  stock: number;
  isDiscounted: boolean;
}

export interface CombatLogEntry {
  id: string;
  waveId: string;
  timestamp: number;
  result: 'victory' | 'defeat';
  golemIds: string[];
  enemiesDefeated: number;
  totalEnemies: number;
  coinsEarned: number;
  xpEarned: number;
}

export interface GolemVillageState {
  // Player
  playerName: string;
  playerLevel: number;
  playerXp: number;
  coins: number;
  totalCoinsEarned: number;

  // Golems
  ownedGolems: OwnedGolem[];
  totalCrafted: number;

  // Zones
  zoneAssignments: ZoneAssignment[];

  // Materials
  materials: MaterialInventory;

  // Equipment
  equipment: EquipmentInventory;

  // Runes
  ownedRunes: string[];
  activeRunesByGolem: Record<string, string[]>;

  // Achievements
  achievements: AchievementState;
  unlockedTitles: string[];
  currentTitle: string;

  // Daily
  dailyTasks: DailyTaskInstance[];
  dailyTasksCompleted: number;
  lastDailyReset: number;

  // Shop
  shopListings: ShopListing[];
  shopLastRefresh: number;

  // Combat
  combatLog: CombatLogEntry[];
  totalDefenseWins: number;
  totalDefenseLosses: number;
  lastAttackTime: number;
  isUnderAttack: boolean;

  // Stats
  totalUpgrades: number;
  totalRuneActivations: number;
  totalEquipActions: number;
  totalShopPurchases: number;
  totalAssignActions: number;

  // UI
  selectedGolemId: string | null;
  selectedZoneId: string | null;
  notification: string | null;
}

const GV_INITIAL_STATE: GolemVillageState = {
  playerName: 'Golem Crafter',
  playerLevel: 1,
  playerXp: 0,
  coins: GV_STARTING_COINS,
  totalCoinsEarned: GV_STARTING_COINS,

  ownedGolems: [],
  totalCrafted: 0,

  zoneAssignments: [],

  materials: {},
  equipment: {},

  ownedRunes: [],
  activeRunesByGolem: {},

  achievements: {},
  unlockedTitles: ['title_clay_apprentice'],
  currentTitle: 'title_clay_apprentice',

  dailyTasks: [],
  dailyTasksCompleted: 0,
  lastDailyReset: 0,

  shopListings: [],
  shopLastRefresh: 0,

  combatLog: [],
  totalDefenseWins: 0,
  totalDefenseLosses: 0,
  lastAttackTime: 0,
  isUnderAttack: false,

  totalUpgrades: 0,
  totalRuneActivations: 0,
  totalEquipActions: 0,
  totalShopPurchases: 0,
  totalAssignActions: 0,

  selectedGolemId: null,
  selectedZoneId: null,
  notification: null,
};

// ────────────────────────────────────────────────────────────
// SECTION 3: HELPER FUNCTIONS (private)
// ────────────────────────────────────────────────────────────

function generateInstanceId(): string {
  return 'gv_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(GV_XP_PER_LEVEL_BASE * Math.pow(GV_XP_SCALE_FACTOR, level - 2));
}

function xpRequiredForGolemLevel(level: number): number {
  return Math.floor(50 * Math.pow(1.2, level - 1));
}

function getGolemTypeDefinition(typeId: string): GolemTypeDefinition | undefined {
  return GV_GOLEM_TYPES.find(function (g) { return g.id === typeId; });
}

function getZoneDefinition(zoneId: string): VillageZoneDefinition | undefined {
  return GV_VILLAGE_ZONES.find(function (z) { return z.id === zoneId; });
}

function getMaterialDefinition(materialId: string): MaterialDefinition | undefined {
  return GV_MATERIALS.find(function (m) { return m.id === materialId; });
}

function getEquipmentDefinition(equipmentId: string): EquipmentDefinition | undefined {
  return GV_EQUIPMENT.find(function (e) { return e.id === equipmentId; });
}

function getRuneDefinition(runeId: string): RuneDefinition | undefined {
  return GV_RUNES.find(function (r) { return r.id === runeId; });
}

function getAchievementDefinition(achId: string): AchievementDefinition | undefined {
  return GV_ACHIEVEMENTS.find(function (a) { return a.id === achId; });
}

function getTitleDefinition(titleId: string): TitleDefinition | undefined {
  return GV_TITLES.find(function (t) { return t.id === titleId; });
}

function getShopItemDefinition(shopItemId: string): ShopItemDefinition | undefined {
  return GV_SHOP_ITEMS.find(function (s) { return s.id === shopItemId; });
}

function getEnemyWaveDefinition(waveId: string): EnemyWaveDefinition | undefined {
  return GV_ENEMY_WAVES.find(function (w) { return w.id === waveId; });
}

function getAbilityDefinition(abilityId: string): AbilityDefinition | undefined {
  return GV_ABILITIES.find(function (a) { return a.id === abilityId; });
}

function getLevelTitle(level: number): TitleDefinition {
  let best = GV_TITLES[0];
  for (let i = 0; i < GV_TITLES.length; i++) {
    if (GV_TITLES[i].requiredLevel <= level) {
      best = GV_TITLES[i];
    } else {
      break;
    }
  }
  return best;
}

function calculateGolemStats(golem: OwnedGolem): { hp: number; atk: number; def: number } {
  const typeDef = getGolemTypeDefinition(golem.typeId);
  if (!typeDef) return { hp: 0, atk: 0, def: 0 };

  let hp = typeDef.baseHp;
  let atk = typeDef.baseAtk;
  let def = typeDef.baseDef;

  // Level scaling (each golem level adds ~5% to stats)
  const levelMult = 1 + (golem.level - 1) * 0.05;
  hp = Math.floor(hp * levelMult);
  atk = Math.floor(atk * levelMult);
  def = Math.floor(def * levelMult);

  // Equipment bonuses
  const slotIds: string[] = [golem.equippedCore, golem.equippedArmor, golem.equippedRuneSlot, golem.equippedCrystal].filter(function (s): s is string { return s !== null; });
  for (let i = 0; i < slotIds.length; i++) {
    const eqDef = getEquipmentDefinition(slotIds[i]);
    if (eqDef) {
      hp += eqDef.hpBonus;
      atk += eqDef.atkBonus;
      def += eqDef.defBonus;
    }
  }

  // Active rune bonuses
  if (golem.activeRunes) {
    for (let i = 0; i < golem.activeRunes.length; i++) {
      const runeDef = getRuneDefinition(golem.activeRunes[i]);
      if (runeDef) {
        // Runes boost the matching stat based on element
        if (runeDef.element === GV_ELEMENT_FIRE || runeDef.element === GV_ELEMENT_LIGHTNING) {
          atk += runeDef.powerBonus;
        } else if (runeDef.element === GV_ELEMENT_WATER || runeDef.element === GV_ELEMENT_EARTH) {
          def += runeDef.powerBonus;
        } else if (runeDef.element === GV_ELEMENT_SHADOW || runeDef.element === GV_ELEMENT_ARCANE) {
          hp += runeDef.powerBonus * 2;
          atk += Math.floor(runeDef.powerBonus / 2);
        } else {
          hp += runeDef.powerBonus;
          atk += Math.floor(runeDef.powerBonus / 2);
          def += Math.floor(runeDef.powerBonus / 2);
        }
      }
    }
  }

  return { hp, atk, def };
}

function calculateDefensePower(zoneAssignment: ZoneAssignment, golems: OwnedGolem[]): number {
  let totalPower = 0;
  for (let i = 0; i < zoneAssignment.golemInstanceIds.length; i++) {
    const golem = golems.find(function (g) { return g.instanceId === zoneAssignment.golemInstanceIds[i]; });
    if (golem) {
      const stats = calculateGolemStats(golem);
      totalPower += stats.atk + stats.def + Math.floor(stats.hp / 5);
    }
  }
  return totalPower;
}

function resolveCombat(
  defensePower: number,
  wave: EnemyWaveDefinition
): { victory: boolean; enemiesDefeated: number; coinsEarned: number; xpEarned: number } {
  // Simplified combat: compare total defense power vs enemy power * count
  const enemyTotalPower = wave.enemyPower * wave.enemyCount;
  const powerRatio = defensePower / Math.max(enemyTotalPower, 1);

  // Victory if defense power is at least 60% of enemy total
  const victory = powerRatio >= 0.6;
  const enemiesDefeated = victory
    ? wave.enemyCount
    : Math.floor(wave.enemyCount * Math.min(powerRatio, 0.99));

  const completionRatio = enemiesDefeated / Math.max(wave.enemyCount, 1);
  const coinsEarned = Math.floor(wave.reward * completionRatio);
  const xpEarned = Math.floor(wave.xpReward * completionRatio);

  return { victory, enemiesDefeated, coinsEarned, xpEarned };
}

function generateShopListings(): ShopListing[] {
  const listings: ShopListing[] = [];
  // Pick 8 random shop items
  const shuffled = [...GV_SHOP_ITEMS].sort(function () { return Math.random() - 0.5; });
  const count = Math.min(8, shuffled.length);

  for (let i = 0; i < count; i++) {
    const item = shuffled[i];
    const isDiscounted = Math.random() < item.discountChance;
    const discount = isDiscounted ? 0.75 : 1;
    listings.push({
      shopItemId: item.id,
      currentCost: Math.floor(item.baseCost * discount),
      stock: item.stockMax,
      isDiscounted,
    });
  }

  return listings;
}

function generateDailyTasks(): DailyTaskInstance[] {
  const tasks: DailyTaskInstance[] = [];
  const shuffled = [...GV_DAILY_TASK_TEMPLATES].sort(function () { return Math.random() - 0.5; });
  const count = 3;

  for (let i = 0; i < count; i++) {
    const template = shuffled[i];
    tasks.push({
      taskId: generateInstanceId(),
      templateId: template.id,
      progress: 0,
      target: template.target,
      completed: false,
      claimed: false,
    });
  }

  return tasks;
}

function getAvailableAbilitiesForGolem(typeId: string): string[] {
  const typeDef = getGolemTypeDefinition(typeId);
  if (!typeDef) return [];

  const universal = GV_ABILITIES.filter(function (a) { return a.isUniversal; }).map(function (a) { return a.id; });
  const elemental = GV_ABILITIES.filter(function (a) { return a.element === typeDef.element; }).map(function (a) { return a.id; });
  return universal.concat(elemental);
}

function getDefaultAbilitiesForGolem(typeId: string): string[] {
  const available = getAvailableAbilitiesForGolem(typeId);
  // Start with the first 2 universal abilities
  const universal = available.filter(function (id) {
    const def = getAbilityDefinition(id);
    return def && def.isUniversal;
  });
  return universal.slice(0, 2);
}

// ────────────────────────────────────────────────────────────
// SECTION 4: MAIN HOOK
// ────────────────────────────────────────────────────────────

export default function useGolemVillage() {
  const [state, setState] = useState<GolemVillageState>(GV_INITIAL_STATE);
  const stateRef = useRef<GolemVillageState>(GV_INITIAL_STATE);

  useEffect(function () {
    stateRef.current = state;
  }, [state]);

  // ── Computed Values ──

  const currentTitleDef = useMemo(function (): TitleDefinition {
    const def = getTitleDefinition(state.currentTitle);
    return def || GV_TITLES[0];
  }, [state.currentTitle]);

  const currentLevelTitleDef = useMemo(function (): TitleDefinition {
    return getLevelTitle(state.playerLevel);
  }, [state.playerLevel]);

  const xpForNextLevel = useMemo(function (): number {
    return xpRequiredForLevel(state.playerLevel + 1);
  }, [state.playerLevel]);

  const xpProgress = useMemo(function (): number {
    if (state.playerLevel >= GV_MAX_LEVEL) return 1;
    const currentLevelXp = xpRequiredForLevel(state.playerLevel);
    const nextLevelXp = xpRequiredForLevel(state.playerLevel + 1);
    const needed = nextLevelXp - currentLevelXp;
    if (needed <= 0) return 1;
    const current = state.playerXp - currentLevelXp;
    return Math.max(0, Math.min(1, current / needed));
  }, [state.playerLevel, state.playerXp]);

  const ownedGolemsByZone = useMemo(function (): Record<string, OwnedGolem[]> {
    const result: Record<string, OwnedGolem[]> = {};
    for (let i = 0; i < state.zoneAssignments.length; i++) {
      const za = state.zoneAssignments[i];
      result[za.zoneId] = [];
      for (let j = 0; j < za.golemInstanceIds.length; j++) {
        const golem = state.ownedGolems.find(function (g) { return g.instanceId === za.golemInstanceIds[j]; });
        if (golem) {
          result[za.zoneId].push(golem);
        }
      }
    }
    return result;
  }, [state.zoneAssignments, state.ownedGolems]);

  const unassignedGolems = useMemo(function (): OwnedGolem[] {
    const assignedIds = new Set<string>();
    for (let i = 0; i < state.zoneAssignments.length; i++) {
      const za = state.zoneAssignments[i];
      for (let j = 0; j < za.golemInstanceIds.length; j++) {
        assignedIds.add(za.golemInstanceIds[j]);
      }
    }
    return state.ownedGolems.filter(function (g) { return !assignedIds.has(g.instanceId); });
  }, [state.zoneAssignments, state.ownedGolems]);

  const totalDefensePower = useMemo(function (): number {
    let total = 0;
    for (let i = 0; i < state.zoneAssignments.length; i++) {
      total += calculateDefensePower(state.zoneAssignments[i], state.ownedGolems);
    }
    return total;
  }, [state.zoneAssignments, state.ownedGolems]);

  const uniqueTypesOwned = useMemo(function (): number {
    const types = new Set<string>();
    for (let i = 0; i < state.ownedGolems.length; i++) {
      types.add(state.ownedGolems[i].typeId);
    }
    return types.size;
  }, [state.ownedGolems]);

  const zonesWithAssignments = useMemo(function (): number {
    return state.zoneAssignments.filter(function (za) { return za.golemInstanceIds.length > 0; }).length;
  }, [state.zoneAssignments]);

  const epicPlusCount = useMemo(function (): number {
    let count = 0;
    for (let i = 0; i < state.ownedGolems.length; i++) {
      const typeDef = getGolemTypeDefinition(state.ownedGolems[i].typeId);
      if (typeDef && (typeDef.rarity === GV_RARITY_EPIC || typeDef.rarity === GV_RARITY_LEGENDARY)) {
        count++;
      }
    }
    return count;
  }, [state.ownedGolems]);

  const totalMaterialCount = useMemo(function (): number {
    let total = 0;
    const keys = Object.keys(state.materials);
    for (let i = 0; i < keys.length; i++) {
      total += state.materials[keys[i]];
    }
    return total;
  }, [state.materials]);

  const totalEquipmentCount = useMemo(function (): number {
    let total = 0;
    const keys = Object.keys(state.equipment);
    for (let i = 0; i < keys.length; i++) {
      total += state.equipment[keys[i]];
    }
    return total;
  }, [state.equipment]);

  const canCraftAnyGolem = useMemo(function () {
    for (let i = 0; i < GV_GOLEM_TYPES.length; i++) {
      const gt = GV_GOLEM_TYPES[i];
      const rarityMult = GV_RARITY_CRAFT_COST_MULT[gt.rarity] || 1;
      const cost = GV_CRAFT_COIN_BASE * gt.craftCost * rarityMult;
      if (state.coins >= cost && state.ownedGolems.length < GV_MAX_OWNED_GOLEMS) {
        return true;
      }
    }
    return false;
  }, [state.coins, state.ownedGolems.length]);

  const nextEnemyWave = useMemo(function (): EnemyWaveDefinition | null {
    for (let i = 0; i < GV_ENEMY_WAVES.length; i++) {
      if (GV_ENEMY_WAVES[i].minLevel <= state.playerLevel) {
        return GV_ENEMY_WAVES[i];
      }
    }
    return null;
  }, [state.playerLevel]);

  const unlockedAchievementsList = useMemo(function (): AchievementDefinition[] {
    const list: AchievementDefinition[] = [];
    const keys = Object.keys(state.achievements);
    for (let i = 0; i < keys.length; i++) {
      if (state.achievements[keys[i]]) {
        const def = getAchievementDefinition(keys[i]);
        if (def) list.push(def);
      }
    }
    return list;
  }, [state.achievements]);

  const lockedAchievementsList = useMemo(function (): AchievementDefinition[] {
    const list: AchievementDefinition[] = [];
    for (let i = 0; i < GV_ACHIEVEMENTS.length; i++) {
      if (!state.achievements[GV_ACHIEVEMENTS[i].id]) {
        list.push(GV_ACHIEVEMENTS[i]);
      }
    }
    return list;
  }, [state.achievements]);

  const achievementProgress = useMemo(function (): Record<string, number> {
    const progress: Record<string, number> = {};

    // ach_first_creation
    progress['ach_first_creation'] = state.totalCrafted > 0 ? 1 : 0;
    // ach_village_builder
    progress['ach_village_builder'] = Math.min(state.ownedGolems.length / 5, 1);
    // ach_golem_army
    progress['ach_golem_army'] = Math.min(state.ownedGolems.length / 15, 1);
    // ach_full_roster
    progress['ach_full_roster'] = uniqueTypesOwned / 32;
    // ach_zone_pioneer
    progress['ach_zone_pioneer'] = zonesWithAssignments / 8;
    // ach_rune_master
    progress['ach_rune_master'] = Math.min(state.ownedRunes.length / 8, 1);
    // ach_fully_equipped
    progress['ach_fully_equipped'] = state.totalEquipActions > 0 ? 1 : 0;
    // ach_veteran_crafter
    progress['ach_veteran_crafter'] = Math.min(state.totalCrafted / 25, 1);
    // ach_legendary_forge
    const hasLegendary = state.ownedGolems.some(function (g) {
      const td = getGolemTypeDefinition(g.typeId);
      return td && td.rarity === GV_RARITY_LEGENDARY;
    });
    progress['ach_legendary_forge'] = hasLegendary ? 1 : 0;
    // ach_epic_collection
    progress['ach_epic_collection'] = Math.min(epicPlusCount / 10, 1);
    // ach_daily_devotee
    progress['ach_daily_devotee'] = Math.min(state.dailyTasksCompleted / 7, 1);
    // ach_battle_hardened
    progress['ach_battle_hardened'] = Math.min(state.totalDefenseWins / 50, 1);
    // ach_resource_baron
    progress['ach_resource_baron'] = Math.min(state.totalCoinsEarned / 10000, 1);
    // ach_max_level
    progress['ach_max_level'] = state.playerLevel >= GV_MAX_LEVEL ? 1 : state.playerLevel / GV_MAX_LEVEL;
    // ach_title_seeker
    progress['ach_title_seeker'] = state.unlockedTitles.length / 8;

    return progress;
  }, [state, uniqueTypesOwned, zonesWithAssignments, epicPlusCount]);

  const activeDailyTasks = useMemo(function (): DailyTaskInstance[] {
    return state.dailyTasks.filter(function (t) { return !t.claimed; });
  }, [state.dailyTasks]);

  const completedDailyTasks = useMemo(function (): DailyTaskInstance[] {
    return state.dailyTasks.filter(function (t) { return t.completed && !t.claimed; });
  }, [state.dailyTasks]);

  const golemStatsCache = useMemo(function (): Record<string, { hp: number; atk: number; def: number }> {
    const cache: Record<string, { hp: number; atk: number; def: number }> = {};
    for (let i = 0; i < state.ownedGolems.length; i++) {
      cache[state.ownedGolems[i].instanceId] = calculateGolemStats(state.ownedGolems[i]);
    }
    return cache;
  }, [state.ownedGolems]);

  const availableShopItems = useMemo(function (): ShopListing[] {
    return state.shopListings.filter(function (l) { return l.stock > 0; });
  }, [state.shopListings]);

  const recentCombatLog = useMemo(function (): CombatLogEntry[] {
    return state.combatLog.slice(-10).reverse();
  }, [state.combatLog]);

  // ── Actions ──

  const showNotification = useCallback(function (message: string) {
    setState(function (prev) {
      return { ...prev, notification: message };
    });
    setTimeout(function () {
      setState(function (prev) {
        return { ...prev, notification: null };
      });
    }, 3000);
  }, []);

  const checkAchievements = useCallback(function (currentState: GolemVillageState): GolemVillageState {
    let updated = { ...currentState, achievements: { ...currentState.achievements } };
    let coinsToAdd = 0;
    const newUnlocks: string[] = [];

    // First Creation
    if (!updated.achievements['ach_first_creation'] && updated.totalCrafted > 0) {
      updated.achievements['ach_first_creation'] = true;
      newUnlocks.push('ach_first_creation');
      const ach = getAchievementDefinition('ach_first_creation');
      if (ach) coinsToAdd += ach.reward;
    }

    // Village Builder
    if (!updated.achievements['ach_village_builder'] && updated.ownedGolems.length >= 5) {
      updated.achievements['ach_village_builder'] = true;
      newUnlocks.push('ach_village_builder');
      const ach = getAchievementDefinition('ach_village_builder');
      if (ach) coinsToAdd += ach.reward;
    }

    // Golem Army
    if (!updated.achievements['ach_golem_army'] && updated.ownedGolems.length >= 15) {
      updated.achievements['ach_golem_army'] = true;
      newUnlocks.push('ach_golem_army');
      const ach = getAchievementDefinition('ach_golem_army');
      if (ach) coinsToAdd += ach.reward;
    }

    // Full Roster
    if (!updated.achievements['ach_full_roster']) {
      const types = new Set<string>();
      for (let i = 0; i < updated.ownedGolems.length; i++) {
        types.add(updated.ownedGolems[i].typeId);
      }
      if (types.size >= 32) {
        updated.achievements['ach_full_roster'] = true;
        newUnlocks.push('ach_full_roster');
        const ach = getAchievementDefinition('ach_full_roster');
        if (ach) coinsToAdd += ach.reward;
      }
    }

    // Zone Pioneer
    if (!updated.achievements['ach_zone_pioneer']) {
      const filledZones = updated.zoneAssignments.filter(function (za) { return za.golemInstanceIds.length > 0; }).length;
      if (filledZones >= 8) {
        updated.achievements['ach_zone_pioneer'] = true;
        newUnlocks.push('ach_zone_pioneer');
        const ach = getAchievementDefinition('ach_zone_pioneer');
        if (ach) coinsToAdd += ach.reward;
      }
    }

    // Rune Master
    if (!updated.achievements['ach_rune_master'] && updated.ownedRunes.length >= 8) {
      updated.achievements['ach_rune_master'] = true;
      newUnlocks.push('ach_rune_master');
      const ach = getAchievementDefinition('ach_rune_master');
      if (ach) coinsToAdd += ach.reward;
    }

    // Fully Equipped
    if (!updated.achievements['ach_fully_equipped'] && updated.totalEquipActions > 0) {
      updated.achievements['ach_fully_equipped'] = true;
      newUnlocks.push('ach_fully_equipped');
      const ach = getAchievementDefinition('ach_fully_equipped');
      if (ach) coinsToAdd += ach.reward;
    }

    // Veteran Crafter
    if (!updated.achievements['ach_veteran_crafter'] && updated.totalCrafted >= 25) {
      updated.achievements['ach_veteran_crafter'] = true;
      newUnlocks.push('ach_veteran_crafter');
      const ach = getAchievementDefinition('ach_veteran_crafter');
      if (ach) coinsToAdd += ach.reward;
    }

    // Legendary Forge
    if (!updated.achievements['ach_legendary_forge']) {
      const hasLeg = updated.ownedGolems.some(function (g) {
        const td = getGolemTypeDefinition(g.typeId);
        return td && td.rarity === GV_RARITY_LEGENDARY;
      });
      if (hasLeg) {
        updated.achievements['ach_legendary_forge'] = true;
        newUnlocks.push('ach_legendary_forge');
        const ach = getAchievementDefinition('ach_legendary_forge');
        if (ach) coinsToAdd += ach.reward;
      }
    }

    // Epic Collection
    if (!updated.achievements['ach_epic_collection']) {
      let epicCount = 0;
      for (let i = 0; i < updated.ownedGolems.length; i++) {
        const td = getGolemTypeDefinition(updated.ownedGolems[i].typeId);
        if (td && (td.rarity === GV_RARITY_EPIC || td.rarity === GV_RARITY_LEGENDARY)) {
          epicCount++;
        }
      }
      if (epicCount >= 10) {
        updated.achievements['ach_epic_collection'] = true;
        newUnlocks.push('ach_epic_collection');
        const ach = getAchievementDefinition('ach_epic_collection');
        if (ach) coinsToAdd += ach.reward;
      }
    }

    // Daily Devotee
    if (!updated.achievements['ach_daily_devotee'] && updated.dailyTasksCompleted >= 7) {
      updated.achievements['ach_daily_devotee'] = true;
      newUnlocks.push('ach_daily_devotee');
      const ach = getAchievementDefinition('ach_daily_devotee');
      if (ach) coinsToAdd += ach.reward;
    }

    // Battle Hardened
    if (!updated.achievements['ach_battle_hardened'] && updated.totalDefenseWins >= 50) {
      updated.achievements['ach_battle_hardened'] = true;
      newUnlocks.push('ach_battle_hardened');
      const ach = getAchievementDefinition('ach_battle_hardened');
      if (ach) coinsToAdd += ach.reward;
    }

    // Resource Baron
    if (!updated.achievements['ach_resource_baron'] && updated.totalCoinsEarned >= 10000) {
      updated.achievements['ach_resource_baron'] = true;
      newUnlocks.push('ach_resource_baron');
      const ach = getAchievementDefinition('ach_resource_baron');
      if (ach) coinsToAdd += ach.reward;
    }

    // Max Level
    if (!updated.achievements['ach_max_level'] && updated.playerLevel >= GV_MAX_LEVEL) {
      updated.achievements['ach_max_level'] = true;
      newUnlocks.push('ach_max_level');
      const ach = getAchievementDefinition('ach_max_level');
      if (ach) coinsToAdd += ach.reward;
    }

    // Title Seeker
    if (!updated.achievements['ach_title_seeker'] && updated.unlockedTitles.length >= 8) {
      updated.achievements['ach_title_seeker'] = true;
      newUnlocks.push('ach_title_seeker');
      const ach = getAchievementDefinition('ach_title_seeker');
      if (ach) coinsToAdd += ach.reward;
    }

    if (coinsToAdd > 0) {
      updated.coins += coinsToAdd;
      updated.totalCoinsEarned += coinsToAdd;
    }

    if (newUnlocks.length > 0) {
      // Titles check
      for (let i = 0; i < GV_TITLES.length; i++) {
        const title = GV_TITLES[i];
        if (updated.playerLevel >= title.requiredLevel && !updated.unlockedTitles.includes(title.id)) {
          updated.unlockedTitles = [...updated.unlockedTitles, title.id];
        }
      }
    }

    return updated;
  }, []);

  const grantXp = useCallback(function (amount: number): GolemVillageState {
    const current = stateRef.current;
    let updated = { ...current };
    const titleDef = getTitleDefinition(updated.currentTitle);
    const xpBonus = titleDef ? titleDef.xpBonus : 0;
    const totalXp = amount + Math.floor(amount * xpBonus / 100);
    let newXp = updated.playerXp + totalXp;
    let newLevel = updated.playerLevel;
    let levelUpCoins = 0;

    while (newLevel < GV_MAX_LEVEL && newXp >= xpRequiredForLevel(newLevel + 1)) {
      newLevel++;
      levelUpCoins += GV_COIN_REWARD_PER_LEVEL * newLevel;
    }

    if (newXp >= xpRequiredForLevel(GV_MAX_LEVEL) && newLevel >= GV_MAX_LEVEL) {
      newXp = xpRequiredForLevel(GV_MAX_LEVEL);
      newLevel = GV_MAX_LEVEL;
    }

    updated.playerLevel = newLevel;
    updated.playerXp = newXp;
    if (levelUpCoins > 0) {
      updated.coins += levelUpCoins;
      updated.totalCoinsEarned += levelUpCoins;
    }

    // Check for new title unlocks
    const newTitle = getLevelTitle(newLevel);
    if (!updated.unlockedTitles.includes(newTitle.id)) {
      updated.unlockedTitles = [...updated.unlockedTitles, newTitle.id];
    }

    return updated;
  }, []);

  const advanceDailyTask = useCallback(function (taskType: string, amount: number) {
    setState(function (prev) {
      const updatedTasks = prev.dailyTasks.map(function (task) {
        const template = GV_DAILY_TASK_TEMPLATES.find(function (t) { return t.id === task.templateId; });
        if (!template || template.type !== taskType || task.completed) return task;
        const newProgress = Math.min(task.progress + amount, task.target);
        return {
          ...task,
          progress: newProgress,
          completed: newProgress >= task.target,
        };
      });
      return { ...prev, dailyTasks: updatedTasks };
    });
  }, []);

  // ── Core Actions ──

  const craftGolem = useCallback(function (typeId: string, customName?: string) {
    setState(function (prev) {
      if (prev.ownedGolems.length >= GV_MAX_OWNED_GOLEMS) return prev;

      const typeDef = getGolemTypeDefinition(typeId);
      if (!typeDef) return prev;

      const rarityMult = GV_RARITY_CRAFT_COST_MULT[typeDef.rarity] || 1;
      const cost = GV_CRAFT_COIN_BASE * typeDef.craftCost * rarityMult;

      if (prev.coins < cost) return prev;

      const instanceId = generateInstanceId();
      const defaultAbilities = getDefaultAbilitiesForGolem(typeId);
      const stats = { hp: typeDef.baseHp, atk: typeDef.baseAtk, def: typeDef.baseDef };

      const newGolem: OwnedGolem = {
        instanceId,
        typeId,
        name: customName || typeDef.name,
        level: 1,
        xp: 0,
        currentHp: stats.hp,
        equippedCore: null,
        equippedArmor: null,
        equippedRuneSlot: null,
        equippedCrystal: null,
        activeRunes: [],
        learnedAbilities: defaultAbilities,
        assignedZone: null,
        craftDate: Date.now(),
      };

      let updated: GolemVillageState = {
        ...prev,
        ownedGolems: [...prev.ownedGolems, newGolem],
        totalCrafted: prev.totalCrafted + 1,
        coins: prev.coins - cost,
        selectedGolemId: instanceId,
      };

      updated = checkAchievements(updated);
      const leveled = grantXp(15 + (GV_RARITY_ORDER.indexOf(typeDef.rarity as typeof GV_RARITY_ORDER[number]) * 10));
      updated.playerLevel = leveled.playerLevel;
      updated.playerXp = leveled.playerXp;
      updated.coins = leveled.coins;
      updated.totalCoinsEarned = leveled.totalCoinsEarned;
      updated.unlockedTitles = leveled.unlockedTitles;

      advanceDailyTask('craft', 1);

      return updated;
    });
    showNotification('Golem crafted successfully!');
  }, [checkAchievements, grantXp, showNotification, advanceDailyTask]);

  const assignGolemToZone = useCallback(function (golemInstanceId: string, zoneId: string) {
    setState(function (prev) {
      const zoneDef = getZoneDefinition(zoneId);
      if (!zoneDef) return prev;
      if (prev.playerLevel < zoneDef.minPlayerLevel) return prev;

      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      // Remove from any existing zone
      let assignments = prev.zoneAssignments.map(function (za) {
        return {
          ...za,
          golemInstanceIds: za.golemInstanceIds.filter(function (id) { return id !== golemInstanceId; }),
        };
      });

      // Add to new zone (check capacity)
      const existingZone = assignments.find(function (za) { return za.zoneId === zoneId; });
      if (existingZone) {
        if (existingZone.golemInstanceIds.length >= GV_MAX_ZONE_ASSIGNMENTS) return prev;
        assignments = assignments.map(function (za) {
          if (za.zoneId === zoneId) {
            return { ...za, golemInstanceIds: [...za.golemInstanceIds, golemInstanceId] };
          }
          return za;
        });
      } else {
        assignments = [...assignments, { zoneId, golemInstanceIds: [golemInstanceId] }];
      }

      // Update golem's assigned zone
      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, assignedZone: zoneId };
        }
        return g;
      });

      let updated: GolemVillageState = {
        ...prev,
        zoneAssignments: assignments,
        ownedGolems: updatedGolems,
        totalAssignActions: prev.totalAssignActions + 1,
      };

      updated = checkAchievements(updated);
      return updated;
    });
    showNotification('Golem assigned to zone!');
  }, [checkAchievements, showNotification]);

  const unassignGolem = useCallback(function (golemInstanceId: string) {
    setState(function (prev) {
      const assignments = prev.zoneAssignments.map(function (za) {
        return {
          ...za,
          golemInstanceIds: za.golemInstanceIds.filter(function (id) { return id !== golemInstanceId; }),
        };
      });

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, assignedZone: null };
        }
        return g;
      });

      return { ...prev, zoneAssignments: assignments, ownedGolems: updatedGolems };
    });
  }, []);

  const upgradeGolem = useCallback(function (golemInstanceId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;
      if (golem.level >= GV_MAX_GOLEM_LEVEL) return prev;

      const cost = GV_UPGRADE_COIN_BASE * golem.level;
      if (prev.coins < cost) return prev;

      const xpNeeded = xpRequiredForGolemLevel(golem.level + 1);
      const newLevel = golem.level + 1;
      const typeDef = getGolemTypeDefinition(golem.typeId);
      const levelMult = 1 + (newLevel - 1) * 0.05;
      const newHp = typeDef ? Math.floor(typeDef.baseHp * levelMult) + (typeDef.baseHp > 0 ? 1 : 0) : 100;

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return {
            ...g,
            level: newLevel,
            xp: xpNeeded,
            currentHp: newHp,
          };
        }
        return g;
      });

      let updated: GolemVillageState = {
        ...prev,
        ownedGolems: updatedGolems,
        coins: prev.coins - cost,
        totalUpgrades: prev.totalUpgrades + 1,
      };

      const leveled = grantXp(8);
      updated.playerLevel = leveled.playerLevel;
      updated.playerXp = leveled.playerXp;
      updated.coins = leveled.coins;
      updated.totalCoinsEarned = leveled.totalCoinsEarned;

      advanceDailyTask('upgrade', 1);

      return updated;
    });
    showNotification('Golem upgraded!');
  }, [grantXp, showNotification, advanceDailyTask]);

  const activateRune = useCallback(function (golemInstanceId: string, runeId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      if (!prev.ownedRunes.includes(runeId)) return prev;
      if (golem.activeRunes.includes(runeId)) return prev;

      // Check rune slot capacity
      const runeSlotId = golem.equippedRuneSlot;
      let maxRunes = 1;
      if (runeSlotId) {
        const slotDef = getEquipmentDefinition(runeSlotId);
        if (slotDef) {
          if (slotDef.id === 'double_rune_slot') maxRunes = 2;
          if (slotDef.id === 'triple_rune_slot') maxRunes = 3;
          if (slotDef.id === 'quad_rune_slot') maxRunes = 4;
        }
      }

      if (golem.activeRunes.length >= maxRunes) return prev;

      if (prev.coins < GV_RUNE_ACTIVATE_COST) return prev;

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, activeRunes: [...g.activeRunes, runeId] };
        }
        return g;
      });

      let updated: GolemVillageState = {
        ...prev,
        ownedGolems: updatedGolems,
        coins: prev.coins - GV_RUNE_ACTIVATE_COST,
        totalRuneActivations: prev.totalRuneActivations + 1,
      };

      updated = checkAchievements(updated);
      advanceDailyTask('rune', 1);

      return updated;
    });
    showNotification('Rune activated on golem!');
  }, [checkAchievements, showNotification, advanceDailyTask]);

  const deactivateRune = useCallback(function (golemInstanceId: string, runeId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, activeRunes: g.activeRunes.filter(function (r) { return r !== runeId; }) };
        }
        return g;
      });

      return { ...prev, ownedGolems: updatedGolems };
    });
  }, []);

  const equipItem = useCallback(function (golemInstanceId: string, equipmentId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      if (!prev.equipment[equipmentId] || prev.equipment[equipmentId] <= 0) return prev;
      if (prev.coins < GV_EQUIP_COST) return prev;

      const eqDef = getEquipmentDefinition(equipmentId);
      if (!eqDef) return prev;

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          const updated = { ...g };
          if (eqDef.slot === 'core') updated.equippedCore = equipmentId;
          else if (eqDef.slot === 'armor') updated.equippedArmor = equipmentId;
          else if (eqDef.slot === 'rune_slot') updated.equippedRuneSlot = equipmentId;
          else if (eqDef.slot === 'crystal') updated.equippedCrystal = equipmentId;
          return updated;
        }
        return g;
      });

      const newEquipment = { ...prev.equipment };
      newEquipment[equipmentId] = (newEquipment[equipmentId] || 0) - 1;
      if (newEquipment[equipmentId] <= 0) delete newEquipment[equipmentId];

      let updated: GolemVillageState = {
        ...prev,
        ownedGolems: updatedGolems,
        equipment: newEquipment,
        coins: prev.coins - GV_EQUIP_COST,
        totalEquipActions: prev.totalEquipActions + 1,
      };

      updated = checkAchievements(updated);
      const leveled = grantXp(5);
      updated.playerLevel = leveled.playerLevel;
      updated.playerXp = leveled.playerXp;
      updated.coins = leveled.coins;
      updated.totalCoinsEarned = leveled.totalCoinsEarned;

      advanceDailyTask('equip', 1);

      return updated;
    });
    showNotification('Item equipped!');
  }, [checkAchievements, grantXp, showNotification, advanceDailyTask]);

  const unequipItem = useCallback(function (golemInstanceId: string, slot: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      let removedItemId: string | null = null;
      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          const updated = { ...g };
          if (slot === 'core' && g.equippedCore) {
            removedItemId = g.equippedCore;
            updated.equippedCore = null;
          } else if (slot === 'armor' && g.equippedArmor) {
            removedItemId = g.equippedArmor;
            updated.equippedArmor = null;
          } else if (slot === 'rune_slot' && g.equippedRuneSlot) {
            removedItemId = g.equippedRuneSlot;
            updated.equippedRuneSlot = null;
          } else if (slot === 'crystal' && g.equippedCrystal) {
            removedItemId = g.equippedCrystal;
            updated.equippedCrystal = null;
          }
          return updated;
        }
        return g;
      });

      if (!removedItemId) return prev;

      // Remove active runes if downgrading rune slot
      let finalGolems = updatedGolems;
      if (slot === 'rune_slot') {
        finalGolems = updatedGolems.map(function (g) {
          if (g.instanceId === golemInstanceId) {
            return { ...g, activeRunes: [] };
          }
          return g;
        });
      }

      const newEquipment = { ...prev.equipment };
      newEquipment[removedItemId] = (newEquipment[removedItemId] || 0) + 1;

      return { ...prev, ownedGolems: finalGolems, equipment: newEquipment };
    });
  }, []);

  const buyFromShop = useCallback(function (shopItemId: string) {
    setState(function (prev) {
      const listing = prev.shopListings.find(function (l) { return l.shopItemId === shopItemId; });
      if (!listing || listing.stock <= 0) return prev;

      const shopDef = getShopItemDefinition(shopItemId);
      if (!shopDef) return prev;

      if (prev.coins < listing.currentCost) return prev;

      const newShopListings = prev.shopListings.map(function (l) {
        if (l.shopItemId === shopItemId) {
          return { ...l, stock: l.stock - 1 };
        }
        return l;
      });

      let updated: GolemVillageState = {
        ...prev,
        shopListings: newShopListings,
        coins: prev.coins - listing.currentCost,
        totalShopPurchases: prev.totalShopPurchases + 1,
      };

      if (shopDef.type === 'material') {
        const newMaterials = { ...updated.materials };
        newMaterials[shopDef.itemId] = Math.min(
          (newMaterials[shopDef.itemId] || 0) + 1,
          GV_MAX_INVENTORY_MATERIAL
        );
        updated.materials = newMaterials;
      } else if (shopDef.type === 'equipment') {
        const newEquipment = { ...updated.equipment };
        newEquipment[shopDef.itemId] = (newEquipment[shopDef.itemId] || 0) + 1;
        updated.equipment = newEquipment;
      }

      advanceDailyTask('material', 1);
      advanceDailyTask('shop', 1);

      return updated;
    });
    showNotification('Item purchased!');
  }, [showNotification, advanceDailyTask]);

  const refreshShop = useCallback(function () {
    setState(function (prev) {
      if (prev.coins < GV_SHOP_REFRESH_COINS) return prev;
      return {
        ...prev,
        shopListings: generateShopListings(),
        shopLastRefresh: Date.now(),
        coins: prev.coins - GV_SHOP_REFRESH_COINS,
      };
    });
    showNotification('Shop refreshed with new items!');
  }, [showNotification]);

  const claimDailyTask = useCallback(function (taskId: string) {
    setState(function (prev) {
      const task = prev.dailyTasks.find(function (t) { return t.taskId === taskId; });
      if (!task || !task.completed || task.claimed) return prev;

      const template = GV_DAILY_TASK_TEMPLATES.find(function (t) { return t.id === task.templateId; });
      const reward = template ? template.reward : GV_DAILY_TASK_COINS;

      const newTasks = prev.dailyTasks.map(function (t) {
        if (t.taskId === taskId) {
          return { ...t, claimed: true };
        }
        return t;
      });

      let updated: GolemVillageState = {
        ...prev,
        dailyTasks: newTasks,
        coins: prev.coins + reward,
        totalCoinsEarned: prev.totalCoinsEarned + reward,
        dailyTasksCompleted: prev.dailyTasksCompleted + 1,
      };

      updated = checkAchievements(updated);

      return updated;
    });
    showNotification('Daily task reward claimed!');
  }, [checkAchievements, showNotification]);

  const resetDailyTasks = useCallback(function () {
    setState(function (prev) {
      return {
        ...prev,
        dailyTasks: generateDailyTasks(),
        lastDailyReset: Date.now(),
      };
    });
  }, []);

  const setTitle = useCallback(function (titleId: string) {
    setState(function (prev) {
      if (!prev.unlockedTitles.includes(titleId)) return prev;
      return { ...prev, currentTitle: titleId };
    });
  }, []);

  const defendVillage = useCallback(function () {
    setState(function (prev) {
      const wave = nextEnemyWave;
      if (!wave) return prev;

      let totalPower = 0;
      for (let i = 0; i < prev.zoneAssignments.length; i++) {
        totalPower += calculateDefensePower(prev.zoneAssignments[i], prev.ownedGolems);
      }

      const result = resolveCombat(totalPower, wave);
      const logEntry: CombatLogEntry = {
        id: generateInstanceId(),
        waveId: wave.id,
        timestamp: Date.now(),
        result: result.victory ? 'victory' : 'defeat',
        golemIds: prev.zoneAssignments.flatMap(function (za) { return za.golemInstanceIds; }),
        enemiesDefeated: result.enemiesDefeated,
        totalEnemies: wave.enemyCount,
        coinsEarned: result.coinsEarned,
        xpEarned: result.xpEarned,
      };

      let updated: GolemVillageState = {
        ...prev,
        combatLog: [...prev.combatLog, logEntry],
        coins: prev.coins + result.coinsEarned,
        totalCoinsEarned: prev.totalCoinsEarned + result.coinsEarned,
        lastAttackTime: Date.now(),
        isUnderAttack: false,
      };

      if (result.victory) {
        updated.totalDefenseWins = prev.totalDefenseWins + 1;
      } else {
        updated.totalDefenseLosses = prev.totalDefenseLosses + 1;
      }

      updated = checkAchievements(updated);

      const leveled = grantXp(result.xpEarned);
      updated.playerLevel = leveled.playerLevel;
      updated.playerXp = leveled.playerXp;
      updated.coins = leveled.coins;
      updated.totalCoinsEarned = leveled.totalCoinsEarned;
      updated.unlockedTitles = leveled.unlockedTitles;

      advanceDailyTask('defend', result.victory ? 1 : 0);

      return updated;
    });
    showNotification(totalDefensePower > 0 ? 'Village defended!' : 'No golems assigned for defense!');
  }, [checkAchievements, grantXp, showNotification, advanceDailyTask, totalDefensePower, nextEnemyWave]);

  const simulateAttack = useCallback(function () {
    setState(function (prev) {
      const wave = nextEnemyWave;
      if (!wave) return prev;
      return { ...prev, isUnderAttack: true };
    });
    showNotification('The village is under attack!');
  }, [showNotification, nextEnemyWave]);

  const learnAbility = useCallback(function (golemInstanceId: string, abilityId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      const available = getAvailableAbilitiesForGolem(golem.typeId);
      if (!available.includes(abilityId)) return prev;
      if (golem.learnedAbilities.includes(abilityId)) return prev;

      // Cost: 20 coins per ability level tier
      const abilityDef = getAbilityDefinition(abilityId);
      const cost = abilityDef ? 20 + abilityDef.power : 50;
      if (prev.coins < cost) return prev;

      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, learnedAbilities: [...g.learnedAbilities, abilityId] };
        }
        return g;
      });

      return {
        ...prev,
        ownedGolems: updatedGolems,
        coins: prev.coins - cost,
      };
    });
    showNotification('New ability learned!');
  }, [showNotification]);

  const renameGolem = useCallback(function (golemInstanceId: string, newName: string) {
    setState(function (prev) {
      if (!newName || newName.trim().length === 0) return prev;
      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, name: newName.trim() };
        }
        return g;
      });
      return { ...prev, ownedGolems: updatedGolems };
    });
  }, []);

  const disassembleGolem = useCallback(function (golemInstanceId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;

      const typeDef = getGolemTypeDefinition(golem.typeId);
      const rarityMult = GV_RARITY_CRAFT_COST_MULT[typeDef ? typeDef.rarity : GV_RARITY_COMMON] || 1;
      const refund = Math.floor(GV_CRAFT_COIN_BASE * (typeDef ? typeDef.craftCost : 25) * rarityMult * 0.5);

      // Return equipped items
      const newEquipment = { ...prev.equipment };
      const slotItems: string[] = [golem.equippedCore, golem.equippedArmor, golem.equippedRuneSlot, golem.equippedCrystal].filter(function (s): s is string { return s !== null; });
      for (let i = 0; i < slotItems.length; i++) {
        newEquipment[slotItems[i]] = (newEquipment[slotItems[i]] || 0) + 1;
      }

      const updatedGolems = prev.ownedGolems.filter(function (g) { return g.instanceId !== golemInstanceId; });

      // Remove from zone assignments
      const updatedAssignments = prev.zoneAssignments.map(function (za) {
        return {
          ...za,
          golemInstanceIds: za.golemInstanceIds.filter(function (id) { return id !== golemInstanceId; }),
        };
      });

      return {
        ...prev,
        ownedGolems: updatedGolems,
        zoneAssignments: updatedAssignments,
        equipment: newEquipment,
        coins: prev.coins + refund,
        totalCoinsEarned: prev.totalCoinsEarned + refund,
        selectedGolemId: prev.selectedGolemId === golemInstanceId ? null : prev.selectedGolemId,
      };
    });
    showNotification('Golem disassembled. Items returned.');
  }, [showNotification]);

  const addCoins = useCallback(function (amount: number) {
    setState(function (prev) {
      return {
        ...prev,
        coins: prev.coins + amount,
        totalCoinsEarned: prev.totalCoinsEarned + amount,
      };
    });
  }, []);

  const setPlayerName = useCallback(function (name: string) {
    setState(function (prev) {
      return { ...prev, playerName: name };
    });
  }, []);

  const selectGolem = useCallback(function (golemInstanceId: string | null) {
    setState(function (prev) {
      return { ...prev, selectedGolemId: golemInstanceId };
    });
  }, []);

  const selectZone = useCallback(function (zoneId: string | null) {
    setState(function (prev) {
      return { ...prev, selectedZoneId: zoneId };
    });
  }, []);

  const addMaterial = useCallback(function (materialId: string, amount: number) {
    setState(function (prev) {
      const newMaterials = { ...prev.materials };
      newMaterials[materialId] = Math.min(
        (newMaterials[materialId] || 0) + amount,
        GV_MAX_INVENTORY_MATERIAL
      );
      return { ...prev, materials: newMaterials };
    });
  }, []);

  const addEquipment = useCallback(function (equipmentId: string, amount: number) {
    setState(function (prev) {
      const newEquipment = { ...prev.equipment };
      newEquipment[equipmentId] = (newEquipment[equipmentId] || 0) + amount;
      return { ...prev, equipment: newEquipment };
    });
  }, []);

  const addRune = useCallback(function (runeId: string) {
    setState(function (prev) {
      if (prev.ownedRunes.includes(runeId)) return prev;
      return { ...prev, ownedRunes: [...prev.ownedRunes, runeId] };
    });
  }, []);

  const healGolem = useCallback(function (golemInstanceId: string) {
    setState(function (prev) {
      const golem = prev.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
      if (!golem) return prev;
      const cost = Math.max(10, Math.floor(golem.level * 5));
      if (prev.coins < cost) return prev;

      const stats = calculateGolemStats(golem);
      const updatedGolems = prev.ownedGolems.map(function (g) {
        if (g.instanceId === golemInstanceId) {
          return { ...g, currentHp: stats.hp };
        }
        return g;
      });

      return { ...prev, ownedGolems: updatedGolems, coins: prev.coins - cost };
    });
    showNotification('Golem fully repaired!');
  }, [showNotification]);

  const getGolemStats = useCallback(function (golemInstanceId: string): { hp: number; atk: number; def: number } {
    const golem = state.ownedGolems.find(function (g) { return g.instanceId === golemInstanceId; });
    if (!golem) return { hp: 0, atk: 0, def: 0 };
    return calculateGolemStats(golem);
  }, [state.ownedGolems]);

  const getZoneDefensePower = useCallback(function (zoneId: string): number {
    const za = state.zoneAssignments.find(function (z) { return z.zoneId === zoneId; });
    if (!za) return 0;
    return calculateDefensePower(za, state.ownedGolems);
  }, [state.zoneAssignments, state.ownedGolems]);

  // ── Initialization / Reset ──

  const initializeNewGame = useCallback(function () {
    const newState: GolemVillageState = {
      ...GV_INITIAL_STATE,
      shopListings: generateShopListings(),
      shopLastRefresh: Date.now(),
      dailyTasks: generateDailyTasks(),
      lastDailyReset: Date.now(),
    };
    setState(newState);
  }, []);

  const resetGame = useCallback(function () {
    setState(GV_INITIAL_STATE);
    showNotification('Game reset! Starting fresh.');
  }, [showNotification]);

  const loadState = useCallback(function (savedState: GolemVillageState) {
    setState(savedState);
  }, []);

  // ── Auto-init if empty ──

  useEffect(function () {
    if (state.shopListings.length === 0 && state.ownedGolems.length === 0) {
      const listings = generateShopListings();
      const tasks = generateDailyTasks();
      setState(function (prev) {
        return {
          ...prev,
          shopListings: listings,
          shopLastRefresh: Date.now(),
          dailyTasks: tasks,
          lastDailyReset: Date.now(),
        };
      });
    }
  }, []);

  // ── Daily Reset Timer ──

  useEffect(function () {
    const interval = setInterval(function () {
      const now = Date.now();
      if (now - state.lastDailyReset >= GV_DAILY_RESET_MS) {
        resetDailyTasks();
      }
    }, 60000);

    return function () { clearInterval(interval); };
  }, [state.lastDailyReset, resetDailyTasks]);

  // ── Auto-save ──

  useEffect(function () {
    const interval = setInterval(function () {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('gv_save', JSON.stringify(stateRef.current));
        }
      } catch (_e) {
        // Storage not available
      }
    }, GV_AUTO_SAVE_MS);

    return function () { clearInterval(interval); };
  }, []);

  // ── Load from storage on mount ──

  useEffect(function () {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem('gv_save');
        if (saved) {
          const parsed = JSON.parse(saved) as GolemVillageState;
          if (parsed && parsed.ownedGolems) {
            setState(parsed);
          }
        }
      }
    } catch (_e) {
      // Storage not available
    }
  }, []);

  // ── Return API Object ──

  return {
    // State
    state: state,

    // Player info
    playerName: state.playerName,
    playerLevel: state.playerLevel,
    playerXp: state.playerXp,
    coins: state.coins,
    totalCoinsEarned: state.totalCoinsEarned,
    xpForNextLevel: xpForNextLevel,
    xpProgress: xpProgress,
    currentTitle: currentTitleDef,
    currentLevelTitle: currentLevelTitleDef,

    // Golems
    ownedGolems: state.ownedGolems,
    totalCrafted: state.totalCrafted,
    selectedGolemId: state.selectedGolemId,
    unassignedGolems: unassignedGolems,
    golemStatsCache: golemStatsCache,
    uniqueTypesOwned: uniqueTypesOwned,
    epicPlusCount: epicPlusCount,

    // Zones
    zoneAssignments: state.zoneAssignments,
    selectedZoneId: state.selectedZoneId,
    ownedGolemsByZone: ownedGolemsByZone,

    // Materials
    materials: state.materials,
    totalMaterialCount: totalMaterialCount,

    // Equipment
    equipment: state.equipment,
    totalEquipmentCount: totalEquipmentCount,

    // Runes
    ownedRunes: state.ownedRunes,
    totalRuneActivations: state.totalRuneActivations,

    // Achievements
    achievements: state.achievements,
    unlockedAchievements: unlockedAchievementsList,
    lockedAchievements: lockedAchievementsList,
    achievementProgress: achievementProgress,
    unlockedTitles: state.unlockedTitles,

    // Daily Tasks
    dailyTasks: state.dailyTasks,
    activeDailyTasks: activeDailyTasks,
    completedDailyTasks: completedDailyTasks,
    dailyTasksCompleted: state.dailyTasksCompleted,

    // Shop
    shopListings: state.shopListings,
    availableShopItems: availableShopItems,

    // Combat
    combatLog: state.combatLog,
    recentCombatLog: recentCombatLog,
    totalDefenseWins: state.totalDefenseWins,
    totalDefenseLosses: state.totalDefenseLosses,
    totalDefensePower: totalDefensePower,
    nextEnemyWave: nextEnemyWave,
    isUnderAttack: state.isUnderAttack,
    lastAttackTime: state.lastAttackTime,

    // Stats
    totalUpgrades: state.totalUpgrades,
    totalEquipActions: state.totalEquipActions,
    totalShopPurchases: state.totalShopPurchases,
    totalAssignActions: state.totalAssignActions,
    canCraftAnyGolem: canCraftAnyGolem,

    // UI
    notification: state.notification,

    // Actions
    craftGolem: craftGolem,
    assignGolemToZone: assignGolemToZone,
    unassignGolem: unassignGolem,
    upgradeGolem: upgradeGolem,
    activateRune: activateRune,
    deactivateRune: deactivateRune,
    equipItem: equipItem,
    unequipItem: unequipItem,
    buyFromShop: buyFromShop,
    refreshShop: refreshShop,
    claimDailyTask: claimDailyTask,
    resetDailyTasks: resetDailyTasks,
    setTitle: setTitle,
    defendVillage: defendVillage,
    simulateAttack: simulateAttack,
    learnAbility: learnAbility,
    renameGolem: renameGolem,
    disassembleGolem: disassembleGolem,
    healGolem: healGolem,
    addCoins: addCoins,
    addMaterial: addMaterial,
    addEquipment: addEquipment,
    addRune: addRune,
    setPlayerName: setPlayerName,
    selectGolem: selectGolem,
    selectZone: selectZone,
    getGolemStats: getGolemStats,
    getZoneDefensePower: getZoneDefensePower,
    showNotification: showNotification,
    initializeNewGame: initializeNewGame,
    resetGame: resetGame,
    loadState: loadState,
    grantXp: grantXp,

    // Constants (re-exported for convenience)
    GV_GOLEM_TYPES: GV_GOLEM_TYPES,
    GV_VILLAGE_ZONES: GV_VILLAGE_ZONES,
    GV_MATERIALS: GV_MATERIALS,
    GV_RUNES: GV_RUNES,
    GV_ABILITIES: GV_ABILITIES,
    GV_EQUIPMENT: GV_EQUIPMENT,
    GV_ACHIEVEMENTS: GV_ACHIEVEMENTS,
    GV_TITLES: GV_TITLES,
    GV_DAILY_TASK_TEMPLATES: GV_DAILY_TASK_TEMPLATES,
    GV_SHOP_ITEMS: GV_SHOP_ITEMS,
    GV_ENEMY_WAVES: GV_ENEMY_WAVES,
    GV_RARITY_COLORS: GV_RARITY_COLORS,
    GV_ELEMENT_COLORS: GV_ELEMENT_COLORS,
    GV_RARITY_ORDER: GV_RARITY_ORDER,
    GV_ALL_ELEMENTS: GV_ALL_ELEMENTS,
    GV_MAX_LEVEL: GV_MAX_LEVEL,
    GV_MAX_GOLEM_LEVEL: GV_MAX_GOLEM_LEVEL,
    GV_MAX_OWNED_GOLEMS: GV_MAX_OWNED_GOLEMS,
    GV_MAX_ZONE_ASSIGNMENTS: GV_MAX_ZONE_ASSIGNMENTS,
    GV_THEME_AMBER: GV_THEME_AMBER,
    GV_THEME_BROWN: GV_THEME_BROWN,
    GV_THEME_STONE: GV_THEME_STONE,
    GV_THEME_SLATE: GV_THEME_SLATE,
    GV_THEME_PARCHMENT: GV_THEME_PARCHMENT,
    GV_THEME_DARK_EARTH: GV_THEME_DARK_EARTH,
    GV_THEME_WARM_GOLD: GV_THEME_WARM_GOLD,
    GV_THEME_CLAY: GV_THEME_CLAY,
  };
}

// ────────────────────────────────────────────────────────────
// Type exports for UI consumption
// ────────────────────────────────────────────────────────────

export type GolemVillageAPI = ReturnType<typeof useGolemVillage>;
