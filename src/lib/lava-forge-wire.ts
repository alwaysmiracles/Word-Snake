'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Lava Forge — Volcanic Blacksmith Wire for Word Snake
// Mine materials, smelt ores, craft legendary weapons & armor,
// upgrade forge rooms, and master the art of the forge.
// All exported functions use `lf` prefix. Constants use `LF_` prefix.
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type LFRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type LFSlot = 'head' | 'chest' | 'hands' | 'legs' | 'feet' | 'ring' | 'neck'
export type LFMaterialCategory = 'ore' | 'ingot' | 'gem' | 'organic' | 'elemental' | 'mythic'

export interface LFRarityDef {
  key: LFRarity
  label: string
  color: string
  xpMultiplier: number
}

export interface LFMaterialDef {
  id: string
  name: string
  rarity: LFRarity
  category: LFMaterialCategory
  smeltXp: number
  description: string
  emoji: string
}

export interface LFWeaponDef {
  id: string
  name: string
  rarity: LFRarity
  damage: number
  speed: number
  description: string
  emoji: string
  requiredMaterials: { materialId: string; amount: number }[]
  requiredLevel: number
  bonusCritChance: number
  bonusFireDamage: number
}

export interface LFArmorDef {
  id: string
  name: string
  rarity: LFRarity
  slot: LFSlot
  defense: number
  description: string
  emoji: string
  requiredMaterials: { materialId: string; amount: number }[]
  requiredLevel: number
  bonusFireResist: number
  bonusMaxHp: number
}

export interface LFForgeRoomDef {
  id: string
  name: string
  description: string
  emoji: string
  unlockLevel: number
  upgradeCost: number
  maxLevel: number
  smeltBonus: number
  craftBonus: number
}

export interface LFRecipeDef {
  id: string
  name: string
  type: 'weapon' | 'armor'
  outputId: string
  description: string
  emoji: string
  requiredRoomId: string
  requiredMaterials: { materialId: string; amount: number }[]
  xpReward: number
  requiredLevel: number
}

export interface LFTitleDef {
  name: string
  levelRequired: number
  description: string
}

export interface LFAchievementDef {
  id: string
  name: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXp: number
  emoji: string
}

// State types

export interface LFCraftedWeapon {
  weaponId: string
  craftedAt: number
  upgrades: number
}

export interface LFCraftedArmor {
  armorId: string
  craftedAt: number
  upgrades: number
}

export interface LFForgeRoomState {
  id: string
  level: number
  unlocked: boolean
}

export interface LFAchievementState {
  id: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface LFMaterialInventory {
  materialId: string
  amount: number
}

export interface LFLavaForgeState {
  level: number
  xp: number
  totalXp: number
  materials: Record<string, number>
  craftedWeapons: LFCraftedWeapon[]
  craftedArmor: LFCraftedArmor[]
  forgeRooms: LFForgeRoomState[]
  achievements: LFAchievementState[]
  title: string
  dailyForged: number
  dailyDate: string | null
  totalCrafted: number
  totalSmelted: number
  masterpieces: number
  totalMaterialsMined: number
  totalUpgrades: number
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  streak: number
  bestStreak: number
  lastPlayDate: string | null
  activeRoom: string
  smeltCountByRarity: Record<LFRarity, number>
  craftCountByRarity: Record<LFRarity, number>
}

// =============================================================================
// XP Curve Helpers
// =============================================================================

export const LF_MAX_LEVEL = 50

function lfXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= LF_MAX_LEVEL) return Infinity
  return Math.floor(100 * level * (1 + level * 0.12))
}

export const LF_XP_TABLE: number[] = []
for (let i = 0; i <= LF_MAX_LEVEL; i++) {
  LF_XP_TABLE.push(lfXpRequiredForLevel(i))
}

function lfClampLevel(lvl: number): number {
  return Math.max(1, Math.min(LF_MAX_LEVEL, lvl))
}

function lfGenerateDayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// =============================================================================
// Constants: Rarity
// =============================================================================

export const LF_RARITY_COMMON: LFRarity = 'common'
export const LF_RARITY_UNCOMMON: LFRarity = 'uncommon'
export const LF_RARITY_RARE: LFRarity = 'rare'
export const LF_RARITY_EPIC: LFRarity = 'epic'
export const LF_RARITY_LEGENDARY: LFRarity = 'legendary'

export const LF_RARITIES: LFRarityDef[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#F59E0B', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#EF4444', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#DC2626', xpMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#F97316', xpMultiplier: 6 },
]

// =============================================================================
// Constants: Materials (25+)
// =============================================================================

export const LF_MATERIALS: LFMaterialDef[] = [
  // Common ores
  { id: 'iron_ore', name: 'Iron Ore', rarity: 'common', category: 'ore', smeltXp: 5, description: 'Abundant reddish ore found near volcanic vents', emoji: '🪨' },
  { id: 'copper_ore', name: 'Copper Ore', rarity: 'common', category: 'ore', smeltXp: 5, description: 'Soft orange metal used for basic tools', emoji: '🟤' },
  { id: 'coal_chunk', name: 'Coal Chunk', rarity: 'common', category: 'ore', smeltXp: 3, description: 'Burns hot and steady, fuel for any forge', emoji: '⬛' },
  { id: 'tin_ore', name: 'Tin Ore', rarity: 'common', category: 'ore', smeltXp: 4, description: 'Lightweight silvery ore, easy to smelt', emoji: '🔘' },
  { id: 'sand_quartz', name: 'Sand Quartz', rarity: 'common', category: 'ore', smeltXp: 4, description: 'Common silica sand, base for glass-making', emoji: '⏳' },
  // Uncommon ingots
  { id: 'copper_ingot', name: 'Copper Ingot', rarity: 'uncommon', category: 'ingot', smeltXp: 12, description: 'Refined copper, warm to the touch', emoji: '🟠' },
  { id: 'bronze_ingot', name: 'Bronze Ingot', rarity: 'uncommon', category: 'ingot', smeltXp: 15, description: 'Alloy of copper and tin, sturdy and timeless', emoji: '🥉' },
  { id: 'steel_ingot', name: 'Steel Ingot', rarity: 'uncommon', category: 'ingot', smeltXp: 18, description: 'Iron purified with carbon, backbone of smithing', emoji: '⚙️' },
  { id: 'obsidian_shard', name: 'Obsidian Shard', rarity: 'uncommon', category: 'ore', smeltXp: 14, description: 'Volcanic glass sharper than any steel blade', emoji: '🖤' },
  { id: 'limestone', name: 'Limestone', rarity: 'uncommon', category: 'ore', smeltXp: 10, description: 'Used as flux to purify molten metals', emoji: '🧱' },
  // Rare materials
  { id: 'mithril_ore', name: 'Mithril Ore', rarity: 'rare', category: 'ore', smeltXp: 30, description: 'Light as silk, strong as dragonbone', emoji: '🩶' },
  { id: 'silver_ore', name: 'Silver Ore', rarity: 'rare', category: 'ore', smeltXp: 25, description: 'Lustrous ore with natural antimagic properties', emoji: '🤍' },
  { id: 'gold_ore', name: 'Gold Ore', rarity: 'rare', category: 'ore', smeltXp: 28, description: 'Malleable and precious, conducts heat perfectly', emoji: '✨' },
  { id: 'ruby_gem', name: 'Ruby Gem', rarity: 'rare', category: 'gem', smeltXp: 35, description: 'Deep crimson gemstone imbued with fire essence', emoji: '🔴' },
  { id: 'emerald_shard', name: 'Emerald Shard', rarity: 'rare', category: 'gem', smeltXp: 32, description: 'Green gem that glows near volcanic heat', emoji: '🟢' },
  { id: 'dragon_bone', name: 'Dragon Bone', rarity: 'rare', category: 'organic', smeltXp: 40, description: 'Fossilized bones of ancient fire dragons', emoji: '🦴' },
  // Epic materials
  { id: 'adamantine_ore', name: 'Adamantine Ore', rarity: 'epic', category: 'ore', smeltXp: 60, description: 'Nigh-indestructible metal from the earth\'s core', emoji: '💠' },
  { id: 'dragon_scale', name: 'Dragon Scale', rarity: 'epic', category: 'organic', smeltXp: 70, description: 'Iridescent scales shed by elder dragons', emoji: '🐉' },
  { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: 'epic', category: 'organic', smeltXp: 65, description: 'Eternal flame burns within this radiant plume', emoji: '🪶' },
  { id: 'fire_sapphire', name: 'Fire Sapphire', rarity: 'epic', category: 'gem', smeltXp: 55, description: 'Burns with an inner fire that never extinguishes', emoji: '🔶' },
  { id: 'basalt_glass', name: 'Basalt Glass', rarity: 'epic', category: 'ore', smeltXp: 50, description: 'Volcanic glass forged in magma flows', emoji: '🔲' },
  // Legendary materials
  { id: 'infernal_core', name: 'Infernal Core', rarity: 'legendary', category: 'elemental', smeltXp: 120, description: 'The crystallized heart of a dying volcano', emoji: '🌋' },
  { id: 'starfall_metal', name: 'Starfall Metal', rarity: 'legendary', category: 'mythic', smeltXp: 150, description: 'Metal that fell from the sky in a meteor of fire', emoji: '☄️' },
  { id: 'world_tree_ember', name: 'World Tree Ember', rarity: 'legendary', category: 'mythic', smeltXp: 130, description: 'A burning coal from the roots of the World Tree', emoji: '🌳' },
  { id: 'primordial_lava', name: 'Primordial Lava', rarity: 'legendary', category: 'elemental', smeltXp: 140, description: 'Molten rock from the dawn of the world itself', emoji: '🔥' },
  { id: 'void_obsidian', name: 'Void Obsidian', rarity: 'legendary', category: 'mythic', smeltXp: 160, description: 'Obsidian that absorbs all light and heat', emoji: '🌑' },
  { id: 'titan_heart', name: 'Titan Heart', rarity: 'legendary', category: 'mythic', smeltXp: 200, description: 'The still-beating heart of a fallen titan', emoji: '💚' },
]

// =============================================================================
// Constants: Weapons (30+)
// =============================================================================

export const LF_WEAPONS: LFWeaponDef[] = [
  // Common weapons (6)
  { id: 'iron_dagger', name: 'Iron Dagger', rarity: 'common', damage: 8, speed: 12, description: 'A simple but reliable iron blade for close combat', emoji: '🗡️', requiredMaterials: [{ materialId: 'copper_ingot', amount: 1 }, { materialId: 'coal_chunk', amount: 2 }], requiredLevel: 1, bonusCritChance: 0.02, bonusFireDamage: 0 },
  { id: 'copper_sword', name: 'Copper Sword', rarity: 'common', damage: 12, speed: 10, description: 'A warm-hued sword favored by apprentice smiths', emoji: '⚔️', requiredMaterials: [{ materialId: 'copper_ingot', amount: 3 }, { materialId: 'iron_ore', amount: 1 }], requiredLevel: 1, bonusCritChance: 0.03, bonusFireDamage: 0 },
  { id: 'iron_axe', name: 'Iron Axe', rarity: 'common', damage: 15, speed: 8, description: 'A heavy chopping axe forged from raw iron', emoji: '🪓', requiredMaterials: [{ materialId: 'iron_ore', amount: 4 }, { materialId: 'coal_chunk', amount: 2 }], requiredLevel: 2, bonusCritChance: 0.04, bonusFireDamage: 0 },
  { id: 'bronze_mace', name: 'Bronze Mace', rarity: 'common', damage: 14, speed: 9, description: 'A blunt weapon that crushes armor with ease', emoji: '🔨', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'limestone', amount: 1 }], requiredLevel: 3, bonusCritChance: 0.02, bonusFireDamage: 2 },
  { id: 'stone_hammer', name: 'Stone Hammer', rarity: 'common', damage: 18, speed: 6, description: 'A crude but devastating hammer of volcanic stone', emoji: '⚒️', requiredMaterials: [{ materialId: 'sand_quartz', amount: 3 }, { materialId: 'iron_ore', amount: 2 }], requiredLevel: 4, bonusCritChance: 0.05, bonusFireDamage: 3 },
  { id: 'iron_spear', name: 'Iron Spear', rarity: 'common', damage: 11, speed: 11, description: 'A long-reach spear tipped with sharpened iron', emoji: '🔱', requiredMaterials: [{ materialId: 'iron_ore', amount: 3 }, { materialId: 'tin_ore', amount: 2 }], requiredLevel: 5, bonusCritChance: 0.03, bonusFireDamage: 0 },
  // Uncommon weapons (6)
  { id: 'obsidian_blade', name: 'Obsidian Blade', rarity: 'uncommon', damage: 22, speed: 11, description: 'A razor-sharp sword of volcanic glass', emoji: '🗡️', requiredMaterials: [{ materialId: 'obsidian_shard', amount: 3 }, { materialId: 'copper_ingot', amount: 2 }], requiredLevel: 6, bonusCritChance: 0.08, bonusFireDamage: 5 },
  { id: 'steel_longsword', name: 'Steel Longsword', rarity: 'uncommon', damage: 25, speed: 9, description: 'A balanced longsword of polished steel', emoji: '⚔️', requiredMaterials: [{ materialId: 'steel_ingot', amount: 4 }, { materialId: 'coal_chunk', amount: 3 }], requiredLevel: 8, bonusCritChance: 0.05, bonusFireDamage: 0 },
  { id: 'silver_scythe', name: 'Silver Scythe', rarity: 'uncommon', damage: 20, speed: 8, description: 'A curved blade of pure silver, bane of the undead', emoji: '🌙', requiredMaterials: [{ materialId: 'silver_ore', amount: 3 }, { materialId: 'steel_ingot', amount: 2 }], requiredLevel: 9, bonusCritChance: 0.06, bonusFireDamage: 0 },
  { id: 'bronze_warbow', name: 'Bronze Warbow', rarity: 'uncommon', damage: 18, speed: 12, description: 'A powerful bow reinforced with bronze fittings', emoji: '🏹', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'dragon_bone', amount: 1 }], requiredLevel: 10, bonusCritChance: 0.10, bonusFireDamage: 0 },
  { id: 'steel_greathammer', name: 'Steel Greathammer', rarity: 'uncommon', damage: 30, speed: 5, description: 'A massive two-handed hammer of hardened steel', emoji: '🔨', requiredMaterials: [{ materialId: 'steel_ingot', amount: 5 }, { materialId: 'limestone', amount: 2 }], requiredLevel: 11, bonusCritChance: 0.07, bonusFireDamage: 8 },
  { id: 'flamebrand', name: 'Flamebrand', rarity: 'uncommon', damage: 24, speed: 9, description: 'A blade enchanted to burn with constant flame', emoji: '🔥', requiredMaterials: [{ materialId: 'steel_ingot', amount: 3 }, { materialId: 'obsidian_shard', amount: 2 }, { materialId: 'coal_chunk', amount: 4 }], requiredLevel: 12, bonusCritChance: 0.06, bonusFireDamage: 15 },
  // Rare weapons (7)
  { id: 'mithril_rapier', name: 'Mithril Rapier', rarity: 'rare', damage: 32, speed: 13, description: 'Impossibly light and deadly, a duelist\'s dream', emoji: '🗡️', requiredMaterials: [{ materialId: 'mithril_ore', amount: 3 }, { materialId: 'silver_ore', amount: 2 }], requiredLevel: 14, bonusCritChance: 0.12, bonusFireDamage: 5 },
  { id: 'gold_crown_scepter', name: 'Gold Crown Scepter', rarity: 'rare', damage: 20, speed: 10, description: 'A royal scepter that channels arcane fire', emoji: '👑', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'ruby_gem', amount: 2 }], requiredLevel: 16, bonusCritChance: 0.08, bonusFireDamage: 25 },
  { id: 'dragon_bone_halberd', name: 'Dragon Bone Halberd', rarity: 'rare', damage: 38, speed: 7, description: 'A fearsome polearm carved from dragon fossils', emoji: '🔱', requiredMaterials: [{ materialId: 'dragon_bone', amount: 3 }, { materialId: 'steel_ingot', amount: 4 }], requiredLevel: 18, bonusCritChance: 0.10, bonusFireDamage: 12 },
  { id: 'emerald_fang', name: 'Emerald Fang', rarity: 'rare', damage: 28, speed: 11, description: 'A dagger encrusted with venomous emeralds', emoji: '💚', requiredMaterials: [{ materialId: 'emerald_shard', amount: 3 }, { materialId: 'mithril_ore', amount: 2 }], requiredLevel: 19, bonusCritChance: 0.15, bonusFireDamage: 0 },
  { id: 'ruby_blazecannon', name: 'Ruby Blazecannon', rarity: 'rare', damage: 35, speed: 6, description: 'Fires concentrated beams of ruby fire', emoji: '🔴', requiredMaterials: [{ materialId: 'ruby_gem', amount: 4 }, { materialId: 'obsidian_shard', amount: 3 }, { materialId: 'steel_ingot', amount: 2 }], requiredLevel: 20, bonusCritChance: 0.08, bonusFireDamage: 35 },
  { id: 'mithril_twinblades', name: 'Mithril Twinblades', rarity: 'rare', damage: 26, speed: 14, description: 'A pair of perfectly balanced mithril blades', emoji: '⚔️', requiredMaterials: [{ materialId: 'mithril_ore', amount: 5 }, { materialId: 'emerald_shard', amount: 2 }], requiredLevel: 21, bonusCritChance: 0.14, bonusFireDamage: 8 },
  { id: 'golden_gauntlet_axe', name: 'Golden Gauntlet Axe', rarity: 'rare', damage: 36, speed: 7, description: 'An axe with a gold-inlaid head for maximum impact', emoji: '🪓', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'dragon_bone', amount: 2 }, { materialId: 'steel_ingot', amount: 3 }], requiredLevel: 22, bonusCritChance: 0.09, bonusFireDamage: 15 },
  // Epic weapons (6)
  { id: 'dragon_slayer_sword', name: 'Dragon Slayer Sword', rarity: 'epic', damage: 50, speed: 10, description: 'Forged to slay the mightiest wyrms', emoji: '🐉', requiredMaterials: [{ materialId: 'dragon_scale', amount: 4 }, { materialId: 'adamantine_ore', amount: 2 }, { materialId: 'ruby_gem', amount: 3 }], requiredLevel: 25, bonusCritChance: 0.15, bonusFireDamage: 30 },
  { id: 'phoenix_talon', name: 'Phoenix Talon', rarity: 'epic', damage: 42, speed: 13, description: 'A blade wreathed in eternal phoenix flame', emoji: '🪶', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 3 }, { materialId: 'mithril_ore', amount: 4 }, { materialId: 'gold_ore', amount: 2 }], requiredLevel: 28, bonusCritChance: 0.18, bonusFireDamage: 50 },
  { id: 'adamantine_greatsword', name: 'Adamantine Greatsword', rarity: 'epic', damage: 55, speed: 7, description: 'An unbreakable greatsword of pure adamantine', emoji: '⚔️', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 5 }, { materialId: 'dragon_bone', amount: 3 }], requiredLevel: 30, bonusCritChance: 0.12, bonusFireDamage: 20 },
  { id: 'basalt_fist', name: 'Basalt Fist', rarity: 'epic', damage: 45, speed: 11, description: 'Gauntlets of volcanic glass that shatter anything', emoji: '🥊', requiredMaterials: [{ materialId: 'basalt_glass', amount: 4 }, { materialId: 'dragon_scale', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], requiredLevel: 32, bonusCritChance: 0.20, bonusFireDamage: 25 },
  { id: 'inferno_staff', name: 'Inferno Staff', rarity: 'epic', damage: 40, speed: 10, description: 'Channels the raw fury of the earth\'s magma', emoji: '🪄', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 2 }, { materialId: 'dragon_scale', amount: 3 }, { materialId: 'fire_sapphire', amount: 3 }], requiredLevel: 35, bonusCritChance: 0.14, bonusFireDamage: 60 },
  { id: 'adamantine_warbow', name: 'Adamantine Warbow', rarity: 'epic', damage: 48, speed: 12, description: 'A bow of indestructible adamantine and dragon sinew', emoji: '🏹', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 3 }, { materialId: 'dragon_bone', amount: 4 }, { materialId: 'phoenix_feather', amount: 2 }], requiredLevel: 37, bonusCritChance: 0.22, bonusFireDamage: 15 },
  // Legendary weapons (7)
  { id: 'infernal_blade', name: 'Infernal Blade', rarity: 'legendary', damage: 70, speed: 11, description: 'Forged in the heart of a dying volcano, it burns with primordial fire', emoji: '🌋', requiredMaterials: [{ materialId: 'infernal_core', amount: 2 }, { materialId: 'adamantine_ore', amount: 4 }, { materialId: 'dragon_scale', amount: 3 }], requiredLevel: 40, bonusCritChance: 0.25, bonusFireDamage: 80 },
  { id: 'starfall_sword', name: 'Starfall Sword', rarity: 'legendary', damage: 75, speed: 12, description: 'A blade of celestial metal that glows like a falling star', emoji: '☄️', requiredMaterials: [{ materialId: 'starfall_metal', amount: 2 }, { materialId: 'infernal_core', amount: 1 }, { materialId: 'phoenix_feather', amount: 3 }], requiredLevel: 42, bonusCritChance: 0.28, bonusFireDamage: 50 },
  { id: 'world_tree_club', name: 'World Tree Club', rarity: 'legendary', damage: 80, speed: 6, description: 'A massive club grown from a branch of the World Tree, still burning', emoji: '🌳', requiredMaterials: [{ materialId: 'world_tree_ember', amount: 2 }, { materialId: 'dragon_bone', amount: 4 }, { materialId: 'adamantine_ore', amount: 3 }], requiredLevel: 44, bonusCritChance: 0.20, bonusFireDamage: 100 },
  { id: 'primordial_forge_hammer', name: 'Primordial Forge Hammer', rarity: 'legendary', damage: 85, speed: 5, description: 'The original hammer used to forge the world itself', emoji: '🔨', requiredMaterials: [{ materialId: 'primordial_lava', amount: 2 }, { materialId: 'infernal_core', amount: 2 }, { materialId: 'titan_heart', amount: 1 }], requiredLevel: 45, bonusCritChance: 0.22, bonusFireDamage: 120 },
  { id: 'void_reaver', name: 'Void Reaver', rarity: 'legendary', damage: 65, speed: 14, description: 'A dagger of absolute darkness that consumes light and life', emoji: '🌑', requiredMaterials: [{ materialId: 'void_obsidian', amount: 3 }, { materialId: 'starfall_metal', amount: 2 }, { materialId: 'primordial_lava', amount: 1 }], requiredLevel: 46, bonusCritChance: 0.35, bonusFireDamage: 40 },
  { id: 'titan_cleaver', name: 'Titan Cleaver', rarity: 'legendary', damage: 90, speed: 6, description: 'A colossal blade that once belonged to a titan warlord', emoji: '⚔️', requiredMaterials: [{ materialId: 'titan_heart', amount: 2 }, { materialId: 'adamantine_ore', amount: 5 }, { materialId: 'infernal_core', amount: 2 }], requiredLevel: 48, bonusCritChance: 0.24, bonusFireDamage: 90 },
  { id: 'the_eternal_flame', name: 'The Eternal Flame', rarity: 'legendary', damage: 100, speed: 10, description: 'The ultimate weapon — a sentient blade of pure living fire', emoji: '🔥', requiredMaterials: [{ materialId: 'primordial_lava', amount: 2 }, { materialId: 'titan_heart', amount: 1 }, { materialId: 'starfall_metal', amount: 2 }, { materialId: 'world_tree_ember', amount: 1 }], requiredLevel: 50, bonusCritChance: 0.30, bonusFireDamage: 150 },
]

// =============================================================================
// Constants: Armor (20+)
// =============================================================================

export const LF_ARMOR: LFArmorDef[] = [
  // Common armor (5)
  { id: 'copper_helm', name: 'Copper Helm', rarity: 'common', slot: 'head', defense: 5, description: 'A simple copper helmet with basic protection', emoji: '⛑️', requiredMaterials: [{ materialId: 'copper_ingot', amount: 3 }, { materialId: 'coal_chunk', amount: 1 }], requiredLevel: 1, bonusFireResist: 2, bonusMaxHp: 10 },
  { id: 'iron_chestplate', name: 'Iron Chestplate', rarity: 'common', slot: 'chest', defense: 10, description: 'A sturdy iron breastplate for torso protection', emoji: '🛡️', requiredMaterials: [{ materialId: 'iron_ore', amount: 5 }, { materialId: 'coal_chunk', amount: 3 }], requiredLevel: 2, bonusFireResist: 3, bonusMaxHp: 20 },
  { id: 'bronze_gauntlets', name: 'Bronze Gauntlets', rarity: 'common', slot: 'hands', defense: 4, description: 'Heavy bronze gloves for gripping hot metal', emoji: '🧤', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 2 }, { materialId: 'tin_ore', amount: 1 }], requiredLevel: 3, bonusFireResist: 5, bonusMaxHp: 5 },
  { id: 'iron_greaves', name: 'Iron Greaves', rarity: 'common', slot: 'legs', defense: 7, description: 'Iron plating for the lower legs', emoji: '🦿', requiredMaterials: [{ materialId: 'iron_ore', amount: 4 }, { materialId: 'limestone', amount: 1 }], requiredLevel: 4, bonusFireResist: 2, bonusMaxHp: 15 },
  { id: 'leather_boots', name: 'Volcanic Leather Boots', rarity: 'common', slot: 'feet', defense: 3, description: 'Heat-resistant boots made from dragon hide scraps', emoji: '👢', requiredMaterials: [{ materialId: 'coal_chunk', amount: 2 }, { materialId: 'iron_ore', amount: 2 }], requiredLevel: 5, bonusFireResist: 4, bonusMaxHp: 8 },
  // Uncommon armor (5)
  { id: 'steel_helm', name: 'Steel Helm', rarity: 'uncommon', slot: 'head', defense: 12, description: 'A polished steel helmet with a visor', emoji: '⛑️', requiredMaterials: [{ materialId: 'steel_ingot', amount: 4 }, { materialId: 'coal_chunk', amount: 2 }], requiredLevel: 7, bonusFireResist: 5, bonusMaxHp: 25 },
  { id: 'obsidian_vest', name: 'Obsidian Vest', rarity: 'uncommon', slot: 'chest', defense: 15, description: 'A vest of interlocking obsidian plates', emoji: '🛡️', requiredMaterials: [{ materialId: 'obsidian_shard', amount: 4 }, { materialId: 'steel_ingot', amount: 2 }], requiredLevel: 9, bonusFireResist: 8, bonusMaxHp: 30 },
  { id: 'silver_ring', name: 'Silver Ring of Warding', rarity: 'uncommon', slot: 'ring', defense: 5, description: 'A silver ring that deflects minor flames', emoji: '💍', requiredMaterials: [{ materialId: 'silver_ore', amount: 3 }, { materialId: 'obsidian_shard', amount: 1 }], requiredLevel: 10, bonusFireResist: 10, bonusMaxHp: 15 },
  { id: 'steel_legguards', name: 'Steel Legguards', rarity: 'uncommon', slot: 'legs', defense: 10, description: 'Articulated steel plates protecting the legs', emoji: '🦿', requiredMaterials: [{ materialId: 'steel_ingot', amount: 3 }, { materialId: 'limestone', amount: 2 }], requiredLevel: 11, bonusFireResist: 4, bonusMaxHp: 20 },
  { id: 'bronze_amulet', name: 'Bronze Fire Amulet', rarity: 'uncommon', slot: 'neck', defense: 3, description: 'An amulet that warms the wearer against cold', emoji: '📿', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'ruby_gem', amount: 1 }], requiredLevel: 12, bonusFireResist: 12, bonusMaxHp: 10 },
  // Rare armor (5)
  { id: 'mithril_crown', name: 'Mithril Crown', rarity: 'rare', slot: 'head', defense: 18, description: 'A lightweight crown that radiates protective energy', emoji: '👑', requiredMaterials: [{ materialId: 'mithril_ore', amount: 3 }, { materialId: 'gold_ore', amount: 2 }], requiredLevel: 15, bonusFireResist: 10, bonusMaxHp: 40 },
  { id: 'dragon_scale_mail', name: 'Dragon Scale Mail', rarity: 'rare', slot: 'chest', defense: 25, description: 'Armor crafted from genuine dragon scales', emoji: '🐉', requiredMaterials: [{ materialId: 'dragon_bone', amount: 2 }, { materialId: 'ruby_gem', amount: 2 }, { materialId: 'steel_ingot', amount: 4 }], requiredLevel: 18, bonusFireResist: 20, bonusMaxHp: 50 },
  { id: 'emerald_bracers', name: 'Emerald Bracers', rarity: 'rare', slot: 'hands', defense: 12, description: 'Bracers set with emeralds that absorb heat', emoji: '💚', requiredMaterials: [{ materialId: 'emerald_shard', amount: 3 }, { materialId: 'mithril_ore', amount: 2 }], requiredLevel: 20, bonusFireResist: 15, bonusMaxHp: 20 },
  { id: 'gold_ring', name: 'Gold Ring of the Forge', rarity: 'rare', slot: 'ring', defense: 8, description: 'A golden ring bearing the mark of the ancient smiths', emoji: '💍', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'ruby_gem', amount: 2 }], requiredLevel: 21, bonusFireResist: 18, bonusMaxHp: 25 },
  { id: 'ruby_pendant', name: 'Ruby Pendant of Flames', rarity: 'rare', slot: 'neck', defense: 7, description: 'A pendant with a ruby that burns with inner fire', emoji: '🔴', requiredMaterials: [{ materialId: 'ruby_gem', amount: 3 }, { materialId: 'gold_ore', amount: 2 }, { materialId: 'dragon_bone', amount: 1 }], requiredLevel: 22, bonusFireResist: 22, bonusMaxHp: 30 },
  // Epic armor (5)
  { id: 'adamantine_full_helm', name: 'Adamantine Full Helm', rarity: 'epic', slot: 'head', defense: 30, description: 'An indestructible helm of pure adamantine', emoji: '⛑️', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 4 }, { materialId: 'dragon_scale', amount: 2 }], requiredLevel: 26, bonusFireResist: 25, bonusMaxHp: 60 },
  { id: 'phoenix_plate', name: 'Phoenix Plate Armor', rarity: 'epic', slot: 'chest', defense: 40, description: 'Armor that ignites when struck, reborn from ashes', emoji: '🪶', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 3 }, { materialId: 'adamantine_ore', amount: 3 }, { materialId: 'dragon_scale', amount: 2 }], requiredLevel: 30, bonusFireResist: 35, bonusMaxHp: 80 },
  { id: 'basalt_gauntlets', name: 'Basalt Gauntlets of Power', rarity: 'epic', slot: 'hands', defense: 22, description: 'Volcanic glass gauntlets that enhance smithing strength', emoji: '🧤', requiredMaterials: [{ materialId: 'basalt_glass', amount: 3 }, { materialId: 'adamantine_ore', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], requiredLevel: 33, bonusFireResist: 20, bonusMaxHp: 35 },
  { id: 'fire_sapphire_ring', name: 'Fire Sapphire Ring', rarity: 'epic', slot: 'ring', defense: 15, description: 'A ring with a sapphire that burns with trapped fire', emoji: '🔶', requiredMaterials: [{ materialId: 'fire_sapphire', amount: 3 }, { materialId: 'adamantine_ore', amount: 2 }], requiredLevel: 35, bonusFireResist: 30, bonusMaxHp: 40 },
  { id: 'dragon_fire_cloak', name: 'Dragon Fire Cloak', rarity: 'epic', slot: 'neck', defense: 12, description: 'A cloak woven from dragon scale thread, immune to flame', emoji: '🧥', requiredMaterials: [{ materialId: 'dragon_scale', amount: 4 }, { materialId: 'phoenix_feather', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], requiredLevel: 37, bonusFireResist: 40, bonusMaxHp: 50 },
  // Legendary armor (5)
  { id: 'infernal_crown', name: 'Infernal Crown', rarity: 'legendary', slot: 'head', defense: 45, description: 'A crown of cooled magma, radiating primal heat', emoji: '👑', requiredMaterials: [{ materialId: 'infernal_core', amount: 2 }, { materialId: 'starfall_metal', amount: 1 }, { materialId: 'adamantine_ore', amount: 3 }], requiredLevel: 40, bonusFireResist: 50, bonusMaxHp: 100 },
  { id: 'primordial_plate', name: 'Primordial Plate', rarity: 'legendary', slot: 'chest', defense: 60, description: 'Armor from the first age of creation, unbreakable and ever-burning', emoji: '🛡️', requiredMaterials: [{ materialId: 'primordial_lava', amount: 2 }, { materialId: 'infernal_core', amount: 2 }, { materialId: 'titan_heart', amount: 1 }], requiredLevel: 43, bonusFireResist: 60, bonusMaxHp: 150 },
  { id: 'titan_gauntlets', name: 'Titan Gauntlets', rarity: 'legendary', slot: 'hands', defense: 35, description: 'Gauntlets that grant the strength of fallen titans', emoji: '🧤', requiredMaterials: [{ materialId: 'titan_heart', amount: 1 }, { materialId: 'starfall_metal', amount: 2 }, { materialId: 'void_obsidian', amount: 2 }], requiredLevel: 45, bonusFireResist: 40, bonusMaxHp: 80 },
  { id: 'void_band', name: 'Void Band', rarity: 'legendary', slot: 'ring', defense: 25, description: 'A ring of absolute void that absorbs all damage', emoji: '🌑', requiredMaterials: [{ materialId: 'void_obsidian', amount: 3 }, { materialId: 'infernal_core', amount: 1 }, { materialId: 'world_tree_ember', amount: 1 }], requiredLevel: 47, bonusFireResist: 45, bonusMaxHp: 60 },
  { id: 'world_tree_vestment', name: 'World Tree Vestment', rarity: 'legendary', slot: 'neck', defense: 20, description: 'A living garment from the World Tree that regenerates the wearer', emoji: '🌿', requiredMaterials: [{ materialId: 'world_tree_ember', amount: 2 }, { materialId: 'primordial_lava', amount: 1 }, { materialId: 'phoenix_feather', amount: 3 }], requiredLevel: 48, bonusFireResist: 55, bonusMaxHp: 120 },
]

// =============================================================================
// Constants: Forge Rooms (8)
// =============================================================================

export const LF_FORGE_ROOMS: LFForgeRoomDef[] = [
  { id: 'spark_chamber', name: 'Spark Chamber', description: 'The entry forge where apprentices learn to strike their first sparks', emoji: '⚡', unlockLevel: 1, upgradeCost: 0, maxLevel: 10, smeltBonus: 0, craftBonus: 0 },
  { id: 'magma_pit', name: 'Magma Pit', description: 'An open channel of molten rock for smelting ores at extreme temperatures', emoji: '🌋', unlockLevel: 5, upgradeCost: 500, maxLevel: 10, smeltBonus: 0.1, craftBonus: 0.05 },
  { id: 'crystal_anvil', name: 'Crystal Anvil', description: 'An anvil grown from volcanic crystal, perfect for precision work', emoji: '💎', unlockLevel: 10, upgradeCost: 1500, maxLevel: 10, smeltBonus: 0.05, craftBonus: 0.15 },
  { id: 'dragon_hearth', name: 'Dragon\'s Hearth', description: 'A forge pit warmed by ancient dragon fire, imbuing items with flame', emoji: '🐉', unlockLevel: 16, upgradeCost: 4000, maxLevel: 10, smeltBonus: 0.15, craftBonus: 0.1 },
  { id: 'ember_vault', name: 'Ember Vault', description: 'A sealed vault where rare materials are stored in stasis', emoji: '🗄️', unlockLevel: 22, upgradeCost: 8000, maxLevel: 10, smeltBonus: 0.1, craftBonus: 0.2 },
  { id: 'infernal_crucible', name: 'Infernal Crucible', description: 'The hottest forge in the mountain, capable of melting anything', emoji: '🔥', unlockLevel: 30, upgradeCost: 15000, maxLevel: 10, smeltBonus: 0.25, craftBonus: 0.15 },
  { id: 'titan_forge', name: 'Titan\'s Forge', description: 'A colossal forge built by the ancient titans themselves', emoji: '⚔️', unlockLevel: 38, upgradeCost: 30000, maxLevel: 10, smeltBonus: 0.2, craftBonus: 0.25 },
  { id: 'world_heart', name: 'World Heart Chamber', description: 'The innermost sanctum where the planet\'s core fires burn eternal', emoji: '🌍', unlockLevel: 46, upgradeCost: 60000, maxLevel: 10, smeltBonus: 0.35, craftBonus: 0.35 },
]

// =============================================================================
// Constants: Recipes (30+)
// =============================================================================

export const LF_RECIPES: LFRecipeDef[] = [
  // Common weapon recipes (6)
  { id: 'recipe_iron_dagger', name: 'Forge Iron Dagger', type: 'weapon', outputId: 'iron_dagger', description: 'Heat copper and hammer it into a simple dagger', emoji: '🗡️', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'copper_ingot', amount: 1 }, { materialId: 'coal_chunk', amount: 2 }], xpReward: 10, requiredLevel: 1 },
  { id: 'recipe_copper_sword', name: 'Forge Copper Sword', type: 'weapon', outputId: 'copper_sword', description: 'A longer blade of hammered copper', emoji: '⚔️', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'copper_ingot', amount: 3 }, { materialId: 'iron_ore', amount: 1 }], xpReward: 15, requiredLevel: 1 },
  { id: 'recipe_iron_axe', name: 'Forge Iron Axe', type: 'weapon', outputId: 'iron_axe', description: 'Shape raw iron into a devastating axe head', emoji: '🪓', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'iron_ore', amount: 4 }, { materialId: 'coal_chunk', amount: 2 }], xpReward: 20, requiredLevel: 2 },
  { id: 'recipe_bronze_mace', name: 'Forge Bronze Mace', type: 'weapon', outputId: 'bronze_mace', description: 'Cast bronze into a skull-crushing mace', emoji: '🔨', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'limestone', amount: 1 }], xpReward: 18, requiredLevel: 3 },
  { id: 'recipe_stone_hammer', name: 'Forge Stone Hammer', type: 'weapon', outputId: 'stone_hammer', description: 'Bind volcanic stone to an iron handle', emoji: '⚒️', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'sand_quartz', amount: 3 }, { materialId: 'iron_ore', amount: 2 }], xpReward: 22, requiredLevel: 4 },
  { id: 'recipe_iron_spear', name: 'Forge Iron Spear', type: 'weapon', outputId: 'iron_spear', description: 'Affix a sharpened iron tip to a long shaft', emoji: '🔱', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'iron_ore', amount: 3 }, { materialId: 'tin_ore', amount: 2 }], xpReward: 18, requiredLevel: 5 },
  // Common armor recipes (5)
  { id: 'recipe_copper_helm', name: 'Forge Copper Helm', type: 'armor', outputId: 'copper_helm', description: 'Hammer copper into a protective helmet', emoji: '⛑️', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'copper_ingot', amount: 3 }, { materialId: 'coal_chunk', amount: 1 }], xpReward: 10, requiredLevel: 1 },
  { id: 'recipe_iron_chestplate', name: 'Forge Iron Chestplate', type: 'armor', outputId: 'iron_chestplate', description: 'Shape iron plates into body armor', emoji: '🛡️', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'iron_ore', amount: 5 }, { materialId: 'coal_chunk', amount: 3 }], xpReward: 20, requiredLevel: 2 },
  { id: 'recipe_bronze_gauntlets', name: 'Forge Bronze Gauntlets', type: 'armor', outputId: 'bronze_gauntlets', description: 'Mold bronze into heavy protective gloves', emoji: '🧤', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 2 }, { materialId: 'tin_ore', amount: 1 }], xpReward: 12, requiredLevel: 3 },
  { id: 'recipe_iron_greaves', name: 'Forge Iron Greaves', type: 'armor', outputId: 'iron_greaves', description: 'Plate the lower legs with iron for defense', emoji: '🦿', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'iron_ore', amount: 4 }, { materialId: 'limestone', amount: 1 }], xpReward: 16, requiredLevel: 4 },
  { id: 'recipe_leather_boots', name: 'Forge Volcanic Boots', type: 'armor', outputId: 'leather_boots', description: 'Craft heat-resistant boots from volcanic materials', emoji: '👢', requiredRoomId: 'spark_chamber', requiredMaterials: [{ materialId: 'coal_chunk', amount: 2 }, { materialId: 'iron_ore', amount: 2 }], xpReward: 12, requiredLevel: 5 },
  // Uncommon weapon recipes (6)
  { id: 'recipe_obsidian_blade', name: 'Forge Obsidian Blade', type: 'weapon', outputId: 'obsidian_blade', description: 'Shape volcanic glass into a razor edge', emoji: '🗡️', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'obsidian_shard', amount: 3 }, { materialId: 'copper_ingot', amount: 2 }], xpReward: 35, requiredLevel: 6 },
  { id: 'recipe_steel_longsword', name: 'Forge Steel Longsword', type: 'weapon', outputId: 'steel_longword', description: 'Fold and temper steel into a legendary blade', emoji: '⚔️', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'steel_ingot', amount: 4 }, { materialId: 'coal_chunk', amount: 3 }], xpReward: 40, requiredLevel: 8 },
  { id: 'recipe_silver_scythe', name: 'Forge Silver Scythe', type: 'weapon', outputId: 'silver_scythe', description: 'Curve pure silver into a crescent blade', emoji: '🌙', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'silver_ore', amount: 3 }, { materialId: 'steel_ingot', amount: 2 }], xpReward: 38, requiredLevel: 9 },
  { id: 'recipe_bronze_warbow', name: 'Forge Bronze Warbow', type: 'weapon', outputId: 'bronze_warbow', description: 'Reinforce a bone bow with bronze fittings', emoji: '🏹', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'dragon_bone', amount: 1 }], xpReward: 35, requiredLevel: 10 },
  { id: 'recipe_steel_greathammer', name: 'Forge Steel Greathammer', type: 'weapon', outputId: 'steel_greathammer', description: 'A massive hammer requiring all your strength', emoji: '🔨', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'steel_ingot', amount: 5 }, { materialId: 'limestone', amount: 2 }], xpReward: 45, requiredLevel: 11 },
  { id: 'recipe_flamebrand', name: 'Forge Flamebrand', type: 'weapon', outputId: 'flamebrand', description: 'Enchant a steel blade with volcanic fire', emoji: '🔥', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'steel_ingot', amount: 3 }, { materialId: 'obsidian_shard', amount: 2 }, { materialId: 'coal_chunk', amount: 4 }], xpReward: 42, requiredLevel: 12 },
  // Uncommon armor recipes (5)
  { id: 'recipe_steel_helm', name: 'Forge Steel Helm', type: 'armor', outputId: 'steel_helm', description: 'Raise a dome of steel for head protection', emoji: '⛑️', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'steel_ingot', amount: 4 }, { materialId: 'coal_chunk', amount: 2 }], xpReward: 30, requiredLevel: 7 },
  { id: 'recipe_obsidian_vest', name: 'Forge Obsidian Vest', type: 'armor', outputId: 'obsidian_vest', description: 'Interlock obsidian shards into flexible armor', emoji: '🛡️', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'obsidian_shard', amount: 4 }, { materialId: 'steel_ingot', amount: 2 }], xpReward: 38, requiredLevel: 9 },
  { id: 'recipe_silver_ring', name: 'Forge Silver Ring', type: 'armor', outputId: 'silver_ring', description: 'Cast a warding ring of pure silver', emoji: '💍', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'silver_ore', amount: 3 }, { materialId: 'obsidian_shard', amount: 1 }], xpReward: 30, requiredLevel: 10 },
  { id: 'recipe_steel_legguards', name: 'Forge Steel Legguards', type: 'armor', outputId: 'steel_legguards', description: 'Articulate steel plates for leg defense', emoji: '🦿', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'steel_ingot', amount: 3 }, { materialId: 'limestone', amount: 2 }], xpReward: 32, requiredLevel: 11 },
  { id: 'recipe_bronze_amulet', name: 'Forge Bronze Fire Amulet', type: 'armor', outputId: 'bronze_amulet', description: 'Set a ruby in a bronze amulet of flame', emoji: '📿', requiredRoomId: 'magma_pit', requiredMaterials: [{ materialId: 'bronze_ingot', amount: 3 }, { materialId: 'ruby_gem', amount: 1 }], xpReward: 35, requiredLevel: 12 },
  // Rare weapon recipes (7)
  { id: 'recipe_mithril_rapier', name: 'Forge Mithril Rapier', type: 'weapon', outputId: 'mithril_rapier', description: 'Work mithril into an impossibly light blade', emoji: '🗡️', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'mithril_ore', amount: 3 }, { materialId: 'silver_ore', amount: 2 }], xpReward: 60, requiredLevel: 14 },
  { id: 'recipe_gold_crown_scepter', name: 'Forge Gold Scepter', type: 'weapon', outputId: 'gold_crown_scepter', description: 'Gild a ruby-topped scepter in pure gold', emoji: '👑', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'ruby_gem', amount: 2 }], xpReward: 65, requiredLevel: 16 },
  { id: 'recipe_dragon_bone_halberd', name: 'Forge Dragon Halberd', type: 'weapon', outputId: 'dragon_bone_halberd', description: 'Mount dragon bone on a steel shaft', emoji: '🔱', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'dragon_bone', amount: 3 }, { materialId: 'steel_ingot', amount: 4 }], xpReward: 70, requiredLevel: 18 },
  { id: 'recipe_emerald_fang', name: 'Forge Emerald Fang', type: 'weapon', outputId: 'emerald_fang', description: 'Inlay venomous emeralds into a mithril dagger', emoji: '💚', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'emerald_shard', amount: 3 }, { materialId: 'mithril_ore', amount: 2 }], xpReward: 62, requiredLevel: 19 },
  { id: 'recipe_ruby_blazecannon', name: 'Forge Ruby Blazecannon', type: 'weapon', outputId: 'ruby_blazecannon', description: 'Focus ruby fire through an obsidian barrel', emoji: '🔴', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'ruby_gem', amount: 4 }, { materialId: 'obsidian_shard', amount: 3 }, { materialId: 'steel_ingot', amount: 2 }], xpReward: 75, requiredLevel: 20 },
  { id: 'recipe_mithril_twinblades', name: 'Forge Mithril Twinblades', type: 'weapon', outputId: 'mithril_twinblades', description: 'Forge a perfectly matched pair of mithril swords', emoji: '⚔️', requiredRoomId: 'dragon_hearth', requiredMaterials: [{ materialId: 'mithril_ore', amount: 5 }, { materialId: 'emerald_shard', amount: 2 }], xpReward: 72, requiredLevel: 21 },
  { id: 'recipe_golden_gauntlet_axe', name: 'Forge Golden Axe', type: 'weapon', outputId: 'golden_gauntlet_axe', description: 'Inlay gold into a dragon-bone axe', emoji: '🪓', requiredRoomId: 'dragon_hearth', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'dragon_bone', amount: 2 }, { materialId: 'steel_ingot', amount: 3 }], xpReward: 68, requiredLevel: 22 },
  // Epic weapon recipes (6)
  { id: 'recipe_dragon_slayer', name: 'Forge Dragon Slayer', type: 'weapon', outputId: 'dragon_slayer_sword', description: 'The ultimate dragon-killing blade', emoji: '🐉', requiredRoomId: 'dragon_hearth', requiredMaterials: [{ materialId: 'dragon_scale', amount: 4 }, { materialId: 'adamantine_ore', amount: 2 }, { materialId: 'ruby_gem', amount: 3 }], xpReward: 150, requiredLevel: 25 },
  { id: 'recipe_phoenix_talon', name: 'Forge Phoenix Talon', type: 'weapon', outputId: 'phoenix_talon', description: 'Bind phoenix flame to a mithril blade', emoji: '🪶', requiredRoomId: 'ember_vault', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 3 }, { materialId: 'mithril_ore', amount: 4 }, { materialId: 'gold_ore', amount: 2 }], xpReward: 160, requiredLevel: 28 },
  { id: 'recipe_adamantine_greatsword', name: 'Forge Adamantine Greatsword', type: 'weapon', outputId: 'adamantine_greatsword', description: 'Fold adamantine into an indestructible blade', emoji: '⚔️', requiredRoomId: 'ember_vault', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 5 }, { materialId: 'dragon_bone', amount: 3 }], xpReward: 170, requiredLevel: 30 },
  { id: 'recipe_basalt_fist', name: 'Forge Basalt Fist', type: 'weapon', outputId: 'basalt_fist', description: 'Shape basalt glass into devastating gauntlets', emoji: '🥊', requiredRoomId: 'infernal_crucible', requiredMaterials: [{ materialId: 'basalt_glass', amount: 4 }, { materialId: 'dragon_scale', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], xpReward: 175, requiredLevel: 32 },
  { id: 'recipe_inferno_staff', name: 'Forge Inferno Staff', type: 'weapon', outputId: 'inferno_staff', description: 'Channel magma through phoenix and dragon relics', emoji: '🪄', requiredRoomId: 'infernal_crucible', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 2 }, { materialId: 'dragon_scale', amount: 3 }, { materialId: 'fire_sapphire', amount: 3 }], xpReward: 180, requiredLevel: 35 },
  { id: 'recipe_adamantine_warbow', name: 'Forge Adamantine Warbow', type: 'weapon', outputId: 'adamantine_warbow', description: 'String an adamantine bow with dragon sinew', emoji: '🏹', requiredRoomId: 'titan_forge', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 3 }, { materialId: 'dragon_bone', amount: 4 }, { materialId: 'phoenix_feather', amount: 2 }], xpReward: 185, requiredLevel: 37 },
  // Legendary weapon recipes (3)
  { id: 'recipe_infernal_blade', name: 'Forge Infernal Blade', type: 'weapon', outputId: 'infernal_blade', description: 'Imbue adamantine with the core of a dying volcano', emoji: '🌋', requiredRoomId: 'titan_forge', requiredMaterials: [{ materialId: 'infernal_core', amount: 2 }, { materialId: 'adamantine_ore', amount: 4 }, { materialId: 'dragon_scale', amount: 3 }], xpReward: 350, requiredLevel: 40 },
  { id: 'recipe_starfall_sword', name: 'Forge Starfall Sword', type: 'weapon', outputId: 'starfall_sword', description: 'Melt celestial metal and forge it into a blazing sword', emoji: '☄️', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'starfall_metal', amount: 2 }, { materialId: 'infernal_core', amount: 1 }, { materialId: 'phoenix_feather', amount: 3 }], xpReward: 400, requiredLevel: 42 },
  { id: 'recipe_eternal_flame', name: 'Forge The Eternal Flame', type: 'weapon', outputId: 'the_eternal_flame', description: 'The ultimate weapon — requires all legendary materials', emoji: '🔥', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'primordial_lava', amount: 2 }, { materialId: 'titan_heart', amount: 1 }, { materialId: 'starfall_metal', amount: 2 }, { materialId: 'world_tree_ember', amount: 1 }], xpReward: 600, requiredLevel: 50 },
  // Rare armor recipes (5)
  { id: 'recipe_mithril_crown', name: 'Forge Mithril Crown', type: 'armor', outputId: 'mithril_crown', description: 'Hammer mithril and gold into a radiant crown', emoji: '👑', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'mithril_ore', amount: 3 }, { materialId: 'gold_ore', amount: 2 }], xpReward: 55, requiredLevel: 15 },
  { id: 'recipe_dragon_scale_mail', name: 'Forge Dragon Scale Mail', type: 'armor', outputId: 'dragon_scale_mail', description: 'Sew dragon bone and ruby into steel plate armor', emoji: '🐉', requiredRoomId: 'dragon_hearth', requiredMaterials: [{ materialId: 'dragon_bone', amount: 2 }, { materialId: 'ruby_gem', amount: 2 }, { materialId: 'steel_ingot', amount: 4 }], xpReward: 65, requiredLevel: 18 },
  { id: 'recipe_emerald_bracers', name: 'Forge Emerald Bracers', type: 'armor', outputId: 'emerald_bracers', description: 'Set emeralds into mithril bracer bands', emoji: '💚', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'emerald_shard', amount: 3 }, { materialId: 'mithril_ore', amount: 2 }], xpReward: 50, requiredLevel: 20 },
  { id: 'recipe_gold_ring', name: 'Forge Gold Ring of the Forge', type: 'armor', outputId: 'gold_ring', description: 'Cast a ring of gold and set rubies into it', emoji: '💍', requiredRoomId: 'crystal_anvil', requiredMaterials: [{ materialId: 'gold_ore', amount: 4 }, { materialId: 'ruby_gem', amount: 2 }], xpReward: 55, requiredLevel: 21 },
  { id: 'recipe_ruby_pendant', name: 'Forge Ruby Pendant of Flames', type: 'armor', outputId: 'ruby_pendant', description: 'Suspend a large ruby in a gold and bone frame', emoji: '🔴', requiredRoomId: 'dragon_hearth', requiredMaterials: [{ materialId: 'ruby_gem', amount: 3 }, { materialId: 'gold_ore', amount: 2 }, { materialId: 'dragon_bone', amount: 1 }], xpReward: 60, requiredLevel: 22 },
  // Epic armor recipes (5)
  { id: 'recipe_adamantine_full_helm', name: 'Forge Adamantine Full Helm', type: 'armor', outputId: 'adamantine_full_helm', description: 'Fold adamantine with dragon scales into a helm', emoji: '⛑️', requiredRoomId: 'ember_vault', requiredMaterials: [{ materialId: 'adamantine_ore', amount: 4 }, { materialId: 'dragon_scale', amount: 2 }], xpReward: 130, requiredLevel: 26 },
  { id: 'recipe_phoenix_plate', name: 'Forge Phoenix Plate Armor', type: 'armor', outputId: 'phoenix_plate', description: 'Bind phoenix feathers to adamantine plates', emoji: '🪶', requiredRoomId: 'ember_vault', requiredMaterials: [{ materialId: 'phoenix_feather', amount: 3 }, { materialId: 'adamantine_ore', amount: 3 }, { materialId: 'dragon_scale', amount: 2 }], xpReward: 150, requiredLevel: 30 },
  { id: 'recipe_basalt_gauntlets_armor', name: 'Forge Basalt Gauntlets of Power', type: 'armor', outputId: 'basalt_gauntlets', description: 'Shape basalt glass with adamantine and sapphire', emoji: '🧤', requiredRoomId: 'infernal_crucible', requiredMaterials: [{ materialId: 'basalt_glass', amount: 3 }, { materialId: 'adamantine_ore', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], xpReward: 140, requiredLevel: 33 },
  { id: 'recipe_fire_sapphire_ring', name: 'Forge Fire Sapphire Ring', type: 'armor', outputId: 'fire_sapphire_ring', description: 'Set fire sapphires in an adamantine band', emoji: '🔶', requiredRoomId: 'infernal_crucible', requiredMaterials: [{ materialId: 'fire_sapphire', amount: 3 }, { materialId: 'adamantine_ore', amount: 2 }], xpReward: 135, requiredLevel: 35 },
  { id: 'recipe_dragon_fire_cloak', name: 'Forge Dragon Fire Cloak', type: 'armor', outputId: 'dragon_fire_cloak', description: 'Weave dragon scales with phoenix feathers into a cloak', emoji: '🧥', requiredRoomId: 'titan_forge', requiredMaterials: [{ materialId: 'dragon_scale', amount: 4 }, { materialId: 'phoenix_feather', amount: 2 }, { materialId: 'fire_sapphire', amount: 2 }], xpReward: 160, requiredLevel: 37 },
  // Legendary armor recipes (5)
  { id: 'recipe_infernal_crown', name: 'Forge Infernal Crown', type: 'armor', outputId: 'infernal_crown', description: 'Cool magma around starfall metal and adamantine', emoji: '👑', requiredRoomId: 'titan_forge', requiredMaterials: [{ materialId: 'infernal_core', amount: 2 }, { materialId: 'starfall_metal', amount: 1 }, { materialId: 'adamantine_ore', amount: 3 }], xpReward: 300, requiredLevel: 40 },
  { id: 'recipe_primordial_plate', name: 'Forge Primordial Plate', type: 'armor', outputId: 'primordial_plate', description: 'Shape primordial lava into indestructible plate armor', emoji: '🛡️', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'primordial_lava', amount: 2 }, { materialId: 'infernal_core', amount: 2 }, { materialId: 'titan_heart', amount: 1 }], xpReward: 400, requiredLevel: 43 },
  { id: 'recipe_titan_gauntlets', name: 'Forge Titan Gauntlets', type: 'armor', outputId: 'titan_gauntlets', description: 'Encase a titan heart in starfall metal and void obsidian', emoji: '🧤', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'titan_heart', amount: 1 }, { materialId: 'starfall_metal', amount: 2 }, { materialId: 'void_obsidian', amount: 2 }], xpReward: 350, requiredLevel: 45 },
  { id: 'recipe_void_band', name: 'Forge Void Band', type: 'armor', outputId: 'void_band', description: 'Trap infernal fire inside a ring of void obsidian', emoji: '🌑', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'void_obsidian', amount: 3 }, { materialId: 'infernal_core', amount: 1 }, { materialId: 'world_tree_ember', amount: 1 }], xpReward: 380, requiredLevel: 47 },
  { id: 'recipe_world_tree_vestment', name: 'Forge World Tree Vestment', type: 'armor', outputId: 'world_tree_vestment', description: 'Weave phoenix feathers with primordial lava into living cloth', emoji: '🌿', requiredRoomId: 'world_heart', requiredMaterials: [{ materialId: 'world_tree_ember', amount: 2 }, { materialId: 'primordial_lava', amount: 1 }, { materialId: 'phoenix_feather', amount: 3 }], xpReward: 420, requiredLevel: 48 },
]

// =============================================================================
// Constants: Titles (8)
// =============================================================================

export const LF_TITLES: LFTitleDef[] = [
  { name: 'Apprentice', levelRequired: 1, description: 'A novice smith learning to hold a hammer without burning their fingers' },
  { name: 'Charcoal Burner', levelRequired: 5, description: 'Can maintain a steady fire and smelt basic ores' },
  { name: 'Ironhand', levelRequired: 12, description: 'Your hands are calloused from a thousand hours at the anvil' },
  { name: 'Molten Artisan', levelRequired: 20, description: 'You shape metal like clay and bend fire to your will' },
  { name: 'Flameforged Master', levelRequired: 28, description: 'Your weapons are sought by warriors across the land' },
  { name: 'Dragon Smith', levelRequired: 35, description: 'You work with dragon materials as easily as iron' },
  { name: 'Volcano Lord', levelRequired: 43, description: 'The mountain itself bends to your hammer strikes' },
  { name: 'Forge God', levelRequired: 50, description: 'Your name is etched in the stones of the world\'s oldest forges' },
]

// =============================================================================
// Constants: Achievements (12+)
// =============================================================================

export const LF_ACHIEVEMENTS: LFAchievementDef[] = [
  { id: 'ach_first_smelt', name: 'First Spark', description: 'Smelt your first material at the forge', conditionKey: 'totalSmelted', targetValue: 1, rewardXp: 20, emoji: '⚡' },
  { id: 'ach_first_craft', name: 'Born in Fire', description: 'Craft your first weapon or armor piece', conditionKey: 'totalCrafted', targetValue: 1, rewardXp: 30, emoji: '🔥' },
  { id: 'ach_smelt_50', name: 'Ore Glutton', description: 'Smelt 50 materials total', conditionKey: 'totalSmelted', targetValue: 50, rewardXp: 100, emoji: '🪨' },
  { id: 'ach_craft_10', name: 'Armorer\'s Apprentice', description: 'Craft 10 weapons or armor pieces', conditionKey: 'totalCrafted', targetValue: 10, rewardXp: 150, emoji: '🛡️' },
  { id: 'ach_mine_100', name: 'Deep Miner', description: 'Mine 100 materials from the volcanic depths', conditionKey: 'totalMaterialsMined', targetValue: 100, rewardXp: 120, emoji: '⛏️' },
  { id: 'ach_masterpiece', name: 'Masterpiece', description: 'Forge your first masterpiece weapon or armor', conditionKey: 'masterpieces', targetValue: 1, rewardXp: 200, emoji: '⭐' },
  { id: 'ach_rare_craft', name: 'Rare Excellence', description: 'Craft a rare-tier weapon or armor', conditionKey: 'craftCountByRarity_rare', targetValue: 1, rewardXp: 180, emoji: '💎' },
  { id: 'ach_epic_craft', name: 'Epic Forgemaster', description: 'Craft an epic-tier weapon or armor', conditionKey: 'craftCountByRarity_epic', targetValue: 1, rewardXp: 300, emoji: '🔶' },
  { id: 'ach_legendary_craft', name: 'Legend Forged', description: 'Craft a legendary-tier weapon or armor', conditionKey: 'craftCountByRarity_legendary', targetValue: 1, rewardXp: 500, emoji: '🌟' },
  { id: 'ach_level_25', name: 'Halfway to Godhood', description: 'Reach forge level 25', conditionKey: 'level', targetValue: 25, rewardXp: 250, emoji: '📝' },
  { id: 'ach_level_50', name: 'Forge God Achieved', description: 'Reach the maximum forge level 50', conditionKey: 'level', targetValue: 50, rewardXp: 1000, emoji: '👑' },
  { id: 'ach_streak_7', name: 'Week of Flames', description: 'Maintain a 7-day forging streak', conditionKey: 'bestStreak', targetValue: 7, rewardXp: 200, emoji: '📅' },
  { id: 'ach_all_rooms', name: 'Master of All Chambers', description: 'Unlock all 8 forge rooms', conditionKey: 'unlockedRooms', targetValue: 8, rewardXp: 400, emoji: '🏛️' },
  { id: 'ach_5_masterpieces', name: 'Five Stars', description: 'Forge 5 masterpieces', conditionKey: 'masterpieces', targetValue: 5, rewardXp: 500, emoji: '🌟' },
  { id: 'ach_craft_50', name: 'Arsenal of Flame', description: 'Craft 50 weapons and armor total', conditionKey: 'totalCrafted', targetValue: 50, rewardXp: 350, emoji: '⚔️' },
  { id: 'ach_smelt_200', name: 'Molten Obsession', description: 'Smelt 200 materials at the forge', conditionKey: 'totalSmelted', targetValue: 200, rewardXp: 250, emoji: '🪨' },
  { id: 'ach_mine_500', name: 'Mountain Eater', description: 'Mine 500 materials from volcanic depths', conditionKey: 'totalMaterialsMined', targetValue: 500, rewardXp: 300, emoji: '⛏️' },
  { id: 'ach_coins_1000', name: 'Wealthy Smith', description: 'Earn 1000 coins from forging', conditionKey: 'totalCoinsEarned', targetValue: 1000, rewardXp: 200, emoji: '💰' },
  { id: 'ach_upgrade_20', name: 'Chamber Master', description: 'Perform 20 forge room upgrades', conditionKey: 'totalUpgrades', targetValue: 20, rewardXp: 250, emoji: '🏗️' },
  { id: 'ach_epic_smelt', name: 'Epic Smelter', description: 'Smelt 10 epic-tier materials', conditionKey: 'smeltCountByRarity_epic', targetValue: 10, rewardXp: 220, emoji: '🔶' },
  { id: 'ach_legendary_smelt', name: 'Legendary Refiner', description: 'Smelt a legendary-tier material', conditionKey: 'smeltCountByRarity_legendary', targetValue: 1, rewardXp: 350, emoji: '🌟' },
]

// =============================================================================
// Default State Factory
// =============================================================================

function lfCreateDefaultState(): LFLavaForgeState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    materials: {},
    craftedWeapons: [],
    craftedArmor: [],
    forgeRooms: LF_FORGE_ROOMS.map((room) => ({
      id: room.id,
      level: room.unlockLevel === 1 ? 1 : 0,
      unlocked: room.unlockLevel === 1,
    })),
    achievements: LF_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    title: 'Apprentice',
    dailyForged: 0,
    dailyDate: null,
    totalCrafted: 0,
    totalSmelted: 0,
    masterpieces: 0,
    totalMaterialsMined: 0,
    totalUpgrades: 0,
    coins: 50,
    totalCoinsEarned: 50,
    totalCoinsSpent: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayDate: null,
    activeRoom: 'spark_chamber',
    smeltCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
    craftCountByRarity: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 },
  }
}

// =============================================================================
// Hook: useLavaForge
// =============================================================================

export default function useLavaForge() {
  const stateRef = useRef<LFLavaForgeState>(lfCreateDefaultState())
  const [state, setState] = useState<LFLavaForgeState>(() => {
    if (typeof window === 'undefined') return lfCreateDefaultState()
    try {
      const saved = localStorage.getItem('lava-forge-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        const fresh = lfCreateDefaultState()
        return { ...fresh, ...parsed, forgeRooms: parsed.forgeRooms ?? fresh.forgeRooms, achievements: parsed.achievements ?? fresh.achievements, smeltCountByRarity: parsed.smeltCountByRarity ?? fresh.smeltCountByRarity, craftCountByRarity: parsed.craftCountByRarity ?? fresh.craftCountByRarity }
      }
    } catch {
      // ignore parse errors
    }
    return lfCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('lava-forge-save', JSON.stringify(state))
    } catch {
      // ignore storage errors
    }
  }, [state])

  useEffect(() => {
    stateRef.current = state
  }, [state])

  // ===========================================================================
  // Simple Getters
  // ===========================================================================

  const lfGetLevel = useCallback((): number => stateRef.current.level, [])
  const lfGetXp = useCallback((): number => stateRef.current.xp, [])
  const lfGetTotalXp = useCallback((): number => stateRef.current.totalXp, [])
  const lfGetCoins = useCallback((): number => stateRef.current.coins, [])
  const lfGetTotalCoinsEarned = useCallback((): number => stateRef.current.totalCoinsEarned, [])
  const lfGetTotalCoinsSpent = useCallback((): number => stateRef.current.totalCoinsSpent, [])
  const lfGetMaterials = useCallback((): Record<string, number> => stateRef.current.materials, [])
  const lfGetCraftedWeapons = useCallback((): LFCraftedWeapon[] => stateRef.current.craftedWeapons, [])
  const lfGetCraftedArmor = useCallback((): LFCraftedArmor[] => stateRef.current.craftedArmor, [])
  const lfGetForgeRooms = useCallback((): LFForgeRoomState[] => stateRef.current.forgeRooms, [])
  const lfGetAchievements = useCallback((): LFAchievementState[] => stateRef.current.achievements, [])
  const lfGetTitle = useCallback((): string => stateRef.current.title, [])
  const lfGetDailyForged = useCallback((): number => stateRef.current.dailyForged, [])
  const lfGetDailyDate = useCallback((): string | null => stateRef.current.dailyDate, [])
  const lfGetTotalCrafted = useCallback((): number => stateRef.current.totalCrafted, [])
  const lfGetTotalSmelted = useCallback((): number => stateRef.current.totalSmelted, [])
  const lfGetMasterpieces = useCallback((): number => stateRef.current.masterpieces, [])
  const lfGetTotalMaterialsMined = useCallback((): number => stateRef.current.totalMaterialsMined, [])
  const lfGetTotalUpgrades = useCallback((): number => stateRef.current.totalUpgrades, [])
  const lfGetStreak = useCallback((): number => stateRef.current.streak, [])
  const lfGetBestStreak = useCallback((): number => stateRef.current.bestStreak, [])
  const lfGetActiveRoom = useCallback((): string => stateRef.current.activeRoom, [])
  const lfGetSmeltCountByRarity = useCallback((): Record<LFRarity, number> => stateRef.current.smeltCountByRarity, [])
  const lfGetCraftCountByRarity = useCallback((): Record<LFRarity, number> => stateRef.current.craftCountByRarity, [])
  const lfGetState = useCallback((): Readonly<LFLavaForgeState> => Object.freeze({ ...stateRef.current }), [])
  const lfGetTodayKey = useCallback((): string => lfGenerateDayKey(Date.now()), [])
  const lfGetXpRequired = useCallback((): number => lfXpRequiredForLevel(stateRef.current.level), [])
  const lfGetXpProgress = useCallback((): number => {
    const s = stateRef.current
    const needed = lfXpRequiredForLevel(s.level)
    if (needed <= 0 || needed === Infinity) return 1
    return Math.min(1, s.xp / needed)
  }, [])
  const lfGetOverallProgress = useCallback((): number => {
    const s = stateRef.current
    return Math.min(1, s.totalXp / lfXpRequiredForLevel(LF_MAX_LEVEL))
  }, [])

  // ===========================================================================
  // Level / XP / Coins Modifiers
  // ===========================================================================

  const lfAddXp = useCallback((amount: number) => {
    setState((prev) => {
      let next = { ...prev, xp: prev.xp + amount, totalXp: prev.totalXp + amount }
      const needed = lfXpRequiredForLevel(next.level)
      while (next.xp >= needed && next.level < LF_MAX_LEVEL) {
        next = { ...next, xp: next.xp - needed, level: lfClampLevel(next.level + 1) }
        const titleDef = [...LF_TITLES].reverse().find((t) => next.level >= t.levelRequired)
        if (titleDef) next = { ...next, title: titleDef.name }
        if (next.level >= LF_MAX_LEVEL || next.xp < lfXpRequiredForLevel(next.level)) break
      }
      if (next.level >= LF_MAX_LEVEL) next.xp = 0
      return next
    })
  }, [])

  const lfSetLevel = useCallback((level: number) => {
    setState((prev) => {
      const clamped = lfClampLevel(level)
      const titleDef = [...LF_TITLES].reverse().find((t) => clamped >= t.levelRequired)
      return { ...prev, level: clamped, xp: 0, title: titleDef?.name ?? prev.title }
    })
  }, [])

  const lfSetXp = useCallback((xp: number) => {
    setState((prev) => ({ ...prev, xp: Math.max(0, xp) }))
  }, [])

  const lfAddCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }))
  }, [])

  const lfSpendCoins = useCallback((amount: number): boolean => {
    const s = stateRef.current
    if (s.coins < amount) return false
    setState((prev) => ({ ...prev, coins: prev.coins - amount, totalCoinsSpent: prev.totalCoinsSpent + amount }))
    return true
  }, [])

  const lfSetCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: Math.max(0, amount) }))
  }, [])

  const lfCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.coins >= amount
  }, [])

  // ===========================================================================
  // Material Management
  // ===========================================================================

  const lfGetMaterialCount = useCallback((materialId: string): number => {
    return stateRef.current.materials[materialId] ?? 0
  }, [])

  const lfHasMaterial = useCallback((materialId: string, amount: number): boolean => {
    return (stateRef.current.materials[materialId] ?? 0) >= amount
  }, [])

  const lfAddMaterial = useCallback((materialId: string, amount: number) => {
    if (amount <= 0) return
    setState((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialId]: (prev.materials[materialId] ?? 0) + amount },
      totalMaterialsMined: prev.totalMaterialsMined + amount,
    }))
  }, [])

  const lfRemoveMaterial = useCallback((materialId: string, amount: number): boolean => {
    const s = stateRef.current
    const current = s.materials[materialId] ?? 0
    if (current < amount) return false
    setState((prev) => {
      const next = { ...prev.materials, [materialId]: current - amount }
      if (next[materialId] <= 0) delete next[materialId]
      return { ...prev, materials: next }
    })
    return true
  }, [])

  const lfMineMaterial = useCallback((materialId: string): boolean => {
    const def = LF_MATERIALS.find((m) => m.id === materialId)
    if (!def) return false
    const amount = def.rarity === 'legendary' ? 1 : def.rarity === 'epic' ? 1 : def.rarity === 'rare' ? 2 : def.rarity === 'uncommon' ? 2 : 3
    setState((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialId]: (prev.materials[materialId] ?? 0) + amount },
      totalMaterialsMined: prev.totalMaterialsMined + amount,
    }))
    return true
  }, [])

  const lfSmeltMaterial = useCallback((materialId: string): number => {
    const def = LF_MATERIALS.find((m) => m.id === materialId)
    if (!def) return 0
    const s = stateRef.current
    const oreCost = def.rarity === 'legendary' ? 1 : def.rarity === 'epic' ? 1 : def.rarity === 'rare' ? 2 : 2
    if ((s.materials[materialId] ?? 0) < oreCost) return 0
    const xpGain = Math.floor(def.smeltXp * (s.forgeRooms.find((r) => r.id === s.activeRoom)?.level ?? 1))
    setState((prev) => {
      const remaining = (prev.materials[materialId] ?? 0) - oreCost
      const mats = { ...prev.materials }
      if (remaining <= 0) {
        delete mats[materialId]
      } else {
        mats[materialId] = remaining
      }
      const outputAmount = Math.ceil(oreCost * 0.8)
      const cat = def.category
      let outputId = materialId
      if (cat === 'ore' && materialId === 'iron_ore') outputId = 'copper_ingot'
      else if (cat === 'ore') outputId = materialId
      mats[outputId] = (mats[outputId] ?? 0) + outputAmount
      return {
        ...prev,
        materials: mats,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        totalSmelted: prev.totalSmelted + 1,
        smeltCountByRarity: { ...prev.smeltCountByRarity, [def.rarity]: prev.smeltCountByRarity[def.rarity] + 1 },
      }
    })
    return xpGain
  }, [])

  const lfSmeltAll = useCallback((materialId: string): number => {
    const def = LF_MATERIALS.find((m) => m.id === materialId)
    if (!def) return 0
    const count = stateRef.current.materials[materialId] ?? 0
    if (count <= 0) return 0
    const oreCost = def.rarity === 'legendary' ? 1 : 1
    const batches = Math.floor(count / oreCost)
    let totalXp = 0
    for (let i = 0; i < batches; i++) {
      totalXp += lfSmeltMaterial(materialId)
    }
    return totalXp
  }, [lfSmeltMaterial])

  // ===========================================================================
  // Crafting
  // ===========================================================================

  const lfCanCraft = useCallback((recipeId: string): boolean => {
    const recipe = LF_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return false
    const s = stateRef.current
    if (s.level < recipe.requiredLevel) return false
    const room = s.forgeRooms.find((r) => r.id === recipe.requiredRoomId)
    if (!room || !room.unlocked) return false
    for (const req of recipe.requiredMaterials) {
      if ((s.materials[req.materialId] ?? 0) < req.amount) return false
    }
    return true
  }, [])

  const lfCraftWeapon = useCallback((recipeId: string): boolean => {
    const recipe = LF_RECIPES.find((r) => r.id === recipeId)
    if (!recipe || recipe.type !== 'weapon') return false
    if (!lfCanCraft(recipeId)) return false
    const weaponDef = LF_WEAPONS.find((w) => w.id === recipe.outputId)
    if (!weaponDef) return false
    const isMasterpiece = weaponDef.rarity === 'epic' || weaponDef.rarity === 'legendary'
    const xpGain = Math.floor(recipe.xpReward * (LF_RARITIES.find((r) => r.key === weaponDef.rarity)?.xpMultiplier ?? 1))
    const coinGain = Math.floor(10 * (LF_RARITIES.find((r) => r.key === weaponDef.rarity)?.xpMultiplier ?? 1))
    setState((prev) => {
      const mats = { ...prev.materials }
      for (const req of recipe.requiredMaterials) {
        mats[req.materialId] = (mats[req.materialId] ?? 0) - req.amount
        if (mats[req.materialId] <= 0) delete mats[req.materialId]
      }
      const todayKey = lfGenerateDayKey(Date.now())
      const isNewDay = prev.dailyDate !== todayKey
      return {
        ...prev,
        materials: mats,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain,
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        craftedWeapons: [...prev.craftedWeapons, { weaponId: recipe.outputId, craftedAt: Date.now(), upgrades: 0 }],
        totalCrafted: prev.totalCrafted + 1,
        masterpieces: prev.masterpieces + (isMasterpiece ? 1 : 0),
        craftCountByRarity: { ...prev.craftCountByRarity, [weaponDef.rarity]: prev.craftCountByRarity[weaponDef.rarity] + 1 },
        dailyForged: isNewDay ? 1 : prev.dailyForged + 1,
        dailyDate: todayKey,
      }
    })
    return true
  }, [lfCanCraft])

  const lfCraftArmor = useCallback((recipeId: string): boolean => {
    const recipe = LF_RECIPES.find((r) => r.id === recipeId)
    if (!recipe || recipe.type !== 'armor') return false
    if (!lfCanCraft(recipeId)) return false
    const armorDef = LF_ARMOR.find((a) => a.id === recipe.outputId)
    if (!armorDef) return false
    const isMasterpiece = armorDef.rarity === 'epic' || armorDef.rarity === 'legendary'
    const xpGain = Math.floor(recipe.xpReward * (LF_RARITIES.find((r) => r.key === armorDef.rarity)?.xpMultiplier ?? 1))
    const coinGain = Math.floor(10 * (LF_RARITIES.find((r) => r.key === armorDef.rarity)?.xpMultiplier ?? 1))
    setState((prev) => {
      const mats = { ...prev.materials }
      for (const req of recipe.requiredMaterials) {
        mats[req.materialId] = (mats[req.materialId] ?? 0) - req.amount
        if (mats[req.materialId] <= 0) delete mats[req.materialId]
      }
      const todayKey = lfGenerateDayKey(Date.now())
      const isNewDay = prev.dailyDate !== todayKey
      return {
        ...prev,
        materials: mats,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        coins: prev.coins + coinGain,
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        craftedArmor: [...prev.craftedArmor, { armorId: recipe.outputId, craftedAt: Date.now(), upgrades: 0 }],
        totalCrafted: prev.totalCrafted + 1,
        masterpieces: prev.masterpieces + (isMasterpiece ? 1 : 0),
        craftCountByRarity: { ...prev.craftCountByRarity, [armorDef.rarity]: prev.craftCountByRarity[armorDef.rarity] + 1 },
        dailyForged: isNewDay ? 1 : prev.dailyForged + 1,
        dailyDate: todayKey,
      }
    })
    return true
  }, [lfCanCraft])

  const lfCraftAny = useCallback((recipeId: string): boolean => {
    const recipe = LF_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return false
    if (recipe.type === 'weapon') return lfCraftWeapon(recipeId)
    return lfCraftArmor(recipeId)
  }, [lfCraftWeapon, lfCraftArmor])

  // ===========================================================================
  // Forge Room Management
  // ===========================================================================

  const lfUnlockRoom = useCallback((roomId: string): boolean => {
    const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    if (!roomDef) return false
    const s = stateRef.current
    if (s.level < roomDef.unlockLevel) return false
    const existing = s.forgeRooms.find((r) => r.id === roomId)
    if (existing?.unlocked) return false
    setState((prev) => ({
      ...prev,
      forgeRooms: prev.forgeRooms.map((r) => r.id === roomId ? { ...r, unlocked: true, level: 1 } : r),
    }))
    return true
  }, [])

  const lfUpgradeForge = useCallback((roomId: string): boolean => {
    const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    if (!roomDef) return false
    const s = stateRef.current
    const room = s.forgeRooms.find((r) => r.id === roomId)
    if (!room || !room.unlocked) return false
    if (room.level >= roomDef.maxLevel) return false
    const cost = Math.floor(roomDef.upgradeCost * Math.pow(1.5, room.level - 1))
    if (s.coins < cost) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      forgeRooms: prev.forgeRooms.map((r) => r.id === roomId ? { ...r, level: r.level + 1 } : r),
      totalUpgrades: prev.totalUpgrades + 1,
    }))
    return true
  }, [])

  const lfGetUpgradeCost = useCallback((roomId: string): number => {
    const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    if (!roomDef) return 0
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    if (!room || room.level >= roomDef.maxLevel) return 0
    return Math.floor(roomDef.upgradeCost * Math.pow(1.5, room.level - 1))
  }, [])

  const lfSetActiveRoom = useCallback((roomId: string) => {
    const s = stateRef.current
    const room = s.forgeRooms.find((r) => r.id === roomId)
    if (!room || !room.unlocked) return
    setState((prev) => ({ ...prev, activeRoom: roomId }))
  }, [])

  const lfGetRoomSmeltBonus = useCallback((roomId: string): number => {
    const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    if (!roomDef || !room || !room.unlocked) return 0
    return roomDef.smeltBonus * room.level
  }, [])

  const lfGetRoomCraftBonus = useCallback((roomId: string): number => {
    const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    if (!roomDef || !room || !room.unlocked) return 0
    return roomDef.craftBonus * room.level
  }, [])

  const lfUnlockAllAvailableRooms = useCallback(() => {
    setState((prev) => ({
      ...prev,
      forgeRooms: prev.forgeRooms.map((r) => {
        const def = LF_FORGE_ROOMS.find((d) => d.id === r.id)
        if (def && prev.level >= def.unlockLevel && !r.unlocked) {
          return { ...r, unlocked: true, level: 1 }
        }
        return r
      }),
    }))
  }, [])

  // ===========================================================================
  // Streak Management
  // ===========================================================================

  const lfUpdateStreak = useCallback(() => {
    const todayKey = lfGenerateDayKey(Date.now())
    setState((prev) => {
      if (prev.lastPlayDate === todayKey) return prev
      const last = prev.lastPlayDate
      let newStreak = 1
      if (last) {
        const parts = last.split('-').map(Number)
        const lastDate = new Date(parts[0], parts[1] - 1, parts[2])
        const today = new Date()
        const diff = Math.floor((today.getTime() - lastDate.getTime()) / 86400000)
        if (diff === 1) {
          newStreak = prev.streak + 1
        } else if (diff > 1) {
          newStreak = 1
        }
      }
      const newBest = Math.max(prev.bestStreak, newStreak)
      return { ...prev, streak: newStreak, bestStreak: newBest, lastPlayDate: todayKey }
    })
  }, [])

  const lfResetStreak = useCallback(() => {
    setState((prev) => ({ ...prev, streak: 0 }))
  }, [])

  // ===========================================================================
  // Daily Reward
  // ===========================================================================

  const lfGetDailyReward = useCallback((): { coins: number; xp: number; claimed: boolean } => {
    const todayKey = lfGenerateDayKey(Date.now())
    const s = stateRef.current
    const claimed = s.dailyDate === todayKey && s.dailyForged > 0
    const streakBonus = Math.min(s.streak, 7)
    const coins = 10 + streakBonus * 5
    const xp = 20 + streakBonus * 10
    return { coins, xp, claimed }
  }, [])

  const lfClaimDailyReward = useCallback((): { coins: number; xp: number } | null => {
    const todayKey = lfGenerateDayKey(Date.now())
    const s = stateRef.current
    const alreadyClaimed = s.dailyDate === todayKey && s.dailyForged > 0
    if (alreadyClaimed) return null
    const reward = lfGetDailyReward()
    setState((prev) => ({
      ...prev,
      coins: prev.coins + reward.coins,
      totalCoinsEarned: prev.totalCoinsEarned + reward.coins,
      xp: prev.xp + reward.xp,
      totalXp: prev.totalXp + reward.xp,
      dailyForged: 1,
      dailyDate: todayKey,
    }))
    return reward
  }, [lfGetDailyReward])

  // ===========================================================================
  // Achievement Checking
  // ===========================================================================

  const lfCheckAchievements = useCallback((): string[] => {
    const s = stateRef.current
    const newlyUnlocked: string[] = []
    setState((prev) => {
      let updated = prev
      for (const achDef of LF_ACHIEVEMENTS) {
        const achState = updated.achievements.find((a) => a.id === achDef.id)
        if (!achState || achState.unlocked) continue
        let met = false
        switch (achDef.conditionKey) {
          case 'totalSmelted': met = updated.totalSmelted >= achDef.targetValue; break
          case 'totalCrafted': met = updated.totalCrafted >= achDef.targetValue; break
          case 'totalMaterialsMined': met = updated.totalMaterialsMined >= achDef.targetValue; break
          case 'masterpieces': met = updated.masterpieces >= achDef.targetValue; break
          case 'level': met = updated.level >= achDef.targetValue; break
          case 'bestStreak': met = updated.bestStreak >= achDef.targetValue; break
          case 'unlockedRooms': met = updated.forgeRooms.filter((r) => r.unlocked).length >= achDef.targetValue; break
          default: {
            if (achDef.conditionKey.startsWith('craftCountByRarity_')) {
              const rarity = achDef.conditionKey.replace('craftCountByRarity_', '') as LFRarity
              met = (updated.craftCountByRarity[rarity] ?? 0) >= achDef.targetValue
            }
          }
        }
        if (met) {
          newlyUnlocked.push(achDef.id)
          updated = {
            ...updated,
            achievements: updated.achievements.map((a) => a.id === achDef.id ? { ...a, unlocked: true, unlockedAt: Date.now() } : a),
            xp: updated.xp + achDef.rewardXp,
            totalXp: updated.totalXp + achDef.rewardXp,
          }
        }
      }
      return updated
    })
    return newlyUnlocked
  }, [])

  // ===========================================================================
  // Query Helpers
  // ===========================================================================

  const lfGetMaterialDef = useCallback((materialId: string): LFMaterialDef | undefined => {
    return LF_MATERIALS.find((m) => m.id === materialId)
  }, [])

  const lfGetWeaponDef = useCallback((weaponId: string): LFWeaponDef | undefined => {
    return LF_WEAPONS.find((w) => w.id === weaponId)
  }, [])

  const lfGetArmorDef = useCallback((armorId: string): LFArmorDef | undefined => {
    return LF_ARMOR.find((a) => a.id === armorId)
  }, [])

  const lfGetRoomDef = useCallback((roomId: string): LFForgeRoomDef | undefined => {
    return LF_FORGE_ROOMS.find((r) => r.id === roomId)
  }, [])

  const lfGetRecipeDef = useCallback((recipeId: string): LFRecipeDef | undefined => {
    return LF_RECIPES.find((r) => r.id === recipeId)
  }, [])

  const lfGetRarityDef = useCallback((rarity: LFRarity): LFRarityDef | undefined => {
    return LF_RARITIES.find((r) => r.key === rarity)
  }, [])

  const lfGetRarityColor = useCallback((rarity: LFRarity): string => {
    return LF_RARITIES.find((r) => r.key === rarity)?.color ?? '#9CA3AF'
  }, [])

  const lfGetRarityLabel = useCallback((rarity: LFRarity): string => {
    return LF_RARITIES.find((r) => r.key === rarity)?.label ?? 'Common'
  }, [])

  const lfGetAllMaterials = useCallback((): LFMaterialDef[] => [...LF_MATERIALS], [])
  const lfGetAllWeapons = useCallback((): LFWeaponDef[] => [...LF_WEAPONS], [])
  const lfGetAllArmor = useCallback((): LFArmorDef[] => [...LF_ARMOR], [])
  const lfGetAllForgeRooms = useCallback((): LFForgeRoomDef[] => [...LF_FORGE_ROOMS], [])
  const lfGetAllRecipes = useCallback((): LFRecipeDef[] => [...LF_RECIPES], [])
  const lfGetAllTitles = useCallback((): LFTitleDef[] => [...LF_TITLES], [])
  const lfGetAllAchievements = useCallback((): LFAchievementDef[] => [...LF_ACHIEVEMENTS], [])
  const lfGetAllRarities = useCallback((): LFRarityDef[] => [...LF_RARITIES], [])

  const lfGetWeaponsByRarity = useCallback((rarity: LFRarity): LFWeaponDef[] => {
    return LF_WEAPONS.filter((w) => w.rarity === rarity)
  }, [])

  const lfGetArmorByRarity = useCallback((rarity: LFRarity): LFArmorDef[] => {
    return LF_ARMOR.filter((a) => a.rarity === rarity)
  }, [])

  const lfGetArmorBySlot = useCallback((slot: LFSlot): LFArmorDef[] => {
    return LF_ARMOR.filter((a) => a.slot === slot)
  }, [])

  const lfGetRecipesByType = useCallback((type: 'weapon' | 'armor'): LFRecipeDef[] => {
    return LF_RECIPES.filter((r) => r.type === type)
  }, [])

  const lfGetRecipesByRoom = useCallback((roomId: string): LFRecipeDef[] => {
    return LF_RECIPES.filter((r) => r.requiredRoomId === roomId)
  }, [])

  const lfGetRecipesByLevel = useCallback((maxLevel: number): LFRecipeDef[] => {
    return LF_RECIPES.filter((r) => r.requiredLevel <= maxLevel)
  }, [])

  const lfGetMaterialsByRarity = useCallback((rarity: LFRarity): LFMaterialDef[] => {
    return LF_MATERIALS.filter((m) => m.rarity === rarity)
  }, [])

  const lfGetMaterialsByCategory = useCallback((category: LFMaterialCategory): LFMaterialDef[] => {
    return LF_MATERIALS.filter((m) => m.category === category)
  }, [])

  const lfGetUnlockedAchievementDefs = useCallback((): LFAchievementDef[] => {
    const s = stateRef.current
    return LF_ACHIEVEMENTS.filter((a) => s.achievements.find((sa) => sa.id === a.id)?.unlocked)
  }, [])

  const lfGetLockedAchievementDefs = useCallback((): LFAchievementDef[] => {
    const s = stateRef.current
    return LF_ACHIEVEMENTS.filter((a) => !s.achievements.find((sa) => sa.id === a.id)?.unlocked)
  }, [])

  const lfGetUnlockedRoomCount = useCallback((): number => {
    return stateRef.current.forgeRooms.filter((r) => r.unlocked).length
  }, [])

  const lfGetUnlockedRooms = useCallback((): LFForgeRoomState[] => {
    return stateRef.current.forgeRooms.filter((r) => r.unlocked)
  }, [])

  const lfGetLockedRooms = useCallback((): LFForgeRoomDef[] => {
    const unlockedIds = new Set(stateRef.current.forgeRooms.filter((r) => r.unlocked).map((r) => r.id))
    return LF_FORGE_ROOMS.filter((r) => !unlockedIds.has(r.id))
  }, [])

  const lfGetNextTitle = useCallback((): LFTitleDef | null => {
    const s = stateRef.current
    for (const t of LF_TITLES) {
      if (s.level < t.levelRequired) return t
    }
    return null
  }, [])

  const lfGetCurrentTitleInfo = useCallback((): LFTitleDef => {
    const s = stateRef.current
    let title = LF_TITLES[0]
    for (const t of LF_TITLES) {
      if (s.level >= t.levelRequired) title = t
    }
    return title
  }, [])

  const lfGetCraftedWeaponCount = useCallback((): number => stateRef.current.craftedWeapons.length, [])
  const lfGetCraftedArmorCount = useCallback((): number => stateRef.current.craftedArmor.length, [])
  const lfGetTotalInventoryCount = useCallback((): number => {
    const s = stateRef.current
    return s.craftedWeapons.length + s.craftedArmor.length
  }, [])

  const lfGetTotalDefense = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const ca of s.craftedArmor) {
      const def = LF_ARMOR.find((a) => a.id === ca.armorId)
      if (def) total += def.defense + ca.upgrades * 2
    }
    return total
  }, [])

  const lfGetTotalDamage = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const cw of s.craftedWeapons) {
      const def = LF_WEAPONS.find((w) => w.id === cw.weaponId)
      if (def) total += def.damage + cw.upgrades * 3
    }
    return total
  }, [])

  const lfGetTotalFireDamage = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const cw of s.craftedWeapons) {
      const def = LF_WEAPONS.find((w) => w.id === cw.weaponId)
      if (def) total += def.bonusFireDamage
    }
    return total
  }, [])

  const lfGetTotalFireResist = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const ca of s.craftedArmor) {
      const def = LF_ARMOR.find((a) => a.id === ca.armorId)
      if (def) total += def.bonusFireResist
    }
    return total
  }, [])

  const lfGetTotalMaxHp = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const ca of s.craftedArmor) {
      const def = LF_ARMOR.find((a) => a.id === ca.armorId)
      if (def) total += def.bonusMaxHp
    }
    return total
  }, [])

  const lfGetUniqueWeaponTypes = useCallback((): number => {
    const s = stateRef.current
    const uniqueIds = new Set(s.craftedWeapons.map((w) => w.weaponId))
    return uniqueIds.size
  }, [])

  const lfGetUniqueArmorTypes = useCallback((): number => {
    const s = stateRef.current
    const uniqueIds = new Set(s.craftedArmor.map((a) => a.armorId))
    return uniqueIds.size
  }, [])

  const lfGetMaterialInventoryList = useCallback((): LFMaterialInventory[] => {
    const s = stateRef.current
    return Object.entries(s.materials)
      .filter(([, amount]) => amount > 0)
      .map(([materialId, amount]) => ({ materialId, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [])

  const lfGetMaterialTotalCount = useCallback((): number => {
    const s = stateRef.current
    return Object.values(s.materials).reduce((sum, count) => sum + count, 0)
  }, [])

  const lfIsDailyAvailable = useCallback((): boolean => {
    const todayKey = lfGenerateDayKey(Date.now())
    return stateRef.current.dailyDate !== todayKey || stateRef.current.dailyForged === 0
  }, [])

  const lfGetSlotLabel = useCallback((slot: LFSlot): string => {
    const labels: Record<LFSlot, string> = { head: 'Head', chest: 'Chest', hands: 'Hands', legs: 'Legs', feet: 'Feet', ring: 'Ring', neck: 'Necklace' }
    return labels[slot] ?? slot
  }, [])

  const lfGetCategoryLabel = useCallback((category: LFMaterialCategory): string => {
    const labels: Record<LFMaterialCategory, string> = { ore: 'Ore', ingot: 'Ingot', gem: 'Gem', organic: 'Organic', elemental: 'Elemental', mythic: 'Mythic' }
    return labels[category] ?? category
  }, [])

  // ===========================================================================
  // Utility
  // ===========================================================================

  const lfResetDaily = useCallback(() => {
    setState((prev) => ({ ...prev, dailyForged: 0, dailyDate: null }))
  }, [])

  const lfSellWeapon = useCallback((weaponId: string): number => {
    const s = stateRef.current
    const idx = s.craftedWeapons.findIndex((w) => w.weaponId === weaponId)
    if (idx === -1) return 0
    const def = LF_WEAPONS.find((w) => w.id === weaponId)
    const sellValue = def ? Math.floor(5 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1)) : 5
    setState((prev) => ({
      ...prev,
      craftedWeapons: prev.craftedWeapons.filter((w) => w.weaponId !== weaponId),
      coins: prev.coins + sellValue,
      totalCoinsEarned: prev.totalCoinsEarned + sellValue,
    }))
    return sellValue
  }, [])

  const lfSellArmor = useCallback((armorId: string): number => {
    const s = stateRef.current
    const idx = s.craftedArmor.findIndex((a) => a.armorId === armorId)
    if (idx === -1) return 0
    const def = LF_ARMOR.find((a) => a.id === armorId)
    const sellValue = def ? Math.floor(5 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1)) : 5
    setState((prev) => ({
      ...prev,
      craftedArmor: prev.craftedArmor.filter((a) => a.armorId !== armorId),
      coins: prev.coins + sellValue,
      totalCoinsEarned: prev.totalCoinsEarned + sellValue,
    }))
    return sellValue
  }, [])

  const lfSellAllCommons = useCallback((): number => {
    const s = stateRef.current
    let totalValue = 0
    const commonWeapons = s.craftedWeapons.filter((w) => {
      const def = LF_WEAPONS.find((d) => d.id === w.weaponId)
      return def?.rarity === 'common'
    })
    const commonArmor = s.craftedArmor.filter((a) => {
      const def = LF_ARMOR.find((d) => d.id === a.armorId)
      return def?.rarity === 'common'
    })
    for (const w of commonWeapons) {
      const def = LF_WEAPONS.find((d) => d.id === w.weaponId)
      totalValue += def ? Math.floor(5 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1)) : 5
    }
    for (const a of commonArmor) {
      const def = LF_ARMOR.find((d) => d.id === a.armorId)
      totalValue += def ? Math.floor(5 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1)) : 5
    }
    if (totalValue === 0) return 0
    setState((prev) => {
      const keptWeapons = prev.craftedWeapons.filter((w) => {
        const def = LF_WEAPONS.find((d) => d.id === w.weaponId)
        return def?.rarity !== 'common'
      })
      const keptArmor = prev.craftedArmor.filter((a) => {
        const def = LF_ARMOR.find((d) => d.id === a.armorId)
        return def?.rarity !== 'common'
      })
      return {
        ...prev,
        craftedWeapons: keptWeapons,
        craftedArmor: keptArmor,
        coins: prev.coins + totalValue,
        totalCoinsEarned: prev.totalCoinsEarned + totalValue,
      }
    })
    return totalValue
  }, [])

  const lfDuplicateWeapon = useCallback((weaponId: string): boolean => {
    const s = stateRef.current
    const original = s.craftedWeapons.find((w) => w.weaponId === weaponId)
    if (!original) return false
    const def = LF_WEAPONS.find((w) => w.id === weaponId)
    if (!def) return false
    const cost = Math.floor(20 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1))
    if (s.coins < cost) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      craftedWeapons: [...prev.craftedWeapons, { weaponId, craftedAt: Date.now(), upgrades: 0 }],
    }))
    return true
  }, [])

  const lfDuplicateArmor = useCallback((armorId: string): boolean => {
    const s = stateRef.current
    const original = s.craftedArmor.find((a) => a.armorId === armorId)
    if (!original) return false
    const def = LF_ARMOR.find((a) => a.id === armorId)
    if (!def) return false
    const cost = Math.floor(20 * (LF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1))
    if (s.coins < cost) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      craftedArmor: [...prev.craftedArmor, { armorId, craftedAt: Date.now(), upgrades: 0 }],
    }))
    return true
  }, [])

  // ===========================================================================
  // Advanced Query & Sorting Functions
  // ===========================================================================

  const lfGetWeaponsSortedByDamage = useCallback((): LFWeaponDef[] => {
    return [...LF_WEAPONS].sort((a, b) => b.damage - a.damage)
  }, [])

  const lfGetWeaponsSortedBySpeed = useCallback((): LFWeaponDef[] => {
    return [...LF_WEAPONS].sort((a, b) => b.speed - a.speed)
  }, [])

  const lfGetArmorSortedByDefense = useCallback((): LFArmorDef[] => {
    return [...LF_ARMOR].sort((a, b) => b.defense - a.defense)
  }, [])

  const lfGetMaterialsSortedBySmeltXp = useCallback((): LFMaterialDef[] => {
    return [...LF_MATERIALS].sort((a, b) => b.smeltXp - a.smeltXp)
  }, [])

  const lfGetRecipesSortedByXpReward = useCallback((): LFRecipeDef[] => {
    return [...LF_RECIPES].sort((a, b) => b.xpReward - a.xpReward)
  }, [])

  const lfGetCraftableRecipes = useCallback((): LFRecipeDef[] => {
    const s = stateRef.current
    return LF_RECIPES.filter((r) => {
      if (s.level < r.requiredLevel) return false
      const room = s.forgeRooms.find((fr) => fr.id === r.requiredRoomId)
      if (!room || !room.unlocked) return false
      for (const req of r.requiredMaterials) {
        if ((s.materials[req.materialId] ?? 0) < req.amount) return false
      }
      return true
    })
  }, [])

  const lfGetUncraftableRecipes = useCallback((): LFRecipeDef[] => {
    return LF_RECIPES.filter((r) => !lfCanCraft(r.id))
  }, [lfCanCraft])

  const lfGetRecipeCostMaterials = useCallback((recipeId: string): { materialId: string; amount: number; haveAmount: number }[] => {
    const recipe = LF_RECIPES.find((r) => r.id === recipeId)
    if (!recipe) return []
    const s = stateRef.current
    return recipe.requiredMaterials.map((req) => ({
      materialId: req.materialId,
      amount: req.amount,
      haveAmount: s.materials[req.materialId] ?? 0,
    }))
  }, [])

  const lfGetWeaponTotalStats = useCallback((weaponId: string): { damage: number; speed: number; critChance: number; fireDamage: number } | null => {
    const def = LF_WEAPONS.find((w) => w.id === weaponId)
    if (!def) return null
    const s = stateRef.current
    const crafted = s.craftedWeapons.find((w) => w.weaponId === weaponId)
    const upgradeLevel = crafted?.upgrades ?? 0
    return {
      damage: def.damage + upgradeLevel * 3,
      speed: def.speed + upgradeLevel,
      critChance: def.bonusCritChance + upgradeLevel * 0.01,
      fireDamage: def.bonusFireDamage + upgradeLevel * 2,
    }
  }, [])

  const lfGetArmorTotalStats = useCallback((armorId: string): { defense: number; fireResist: number; maxHp: number } | null => {
    const def = LF_ARMOR.find((a) => a.id === armorId)
    if (!def) return null
    const s = stateRef.current
    const crafted = s.craftedArmor.find((a) => a.armorId === armorId)
    const upgradeLevel = crafted?.upgrades ?? 0
    return {
      defense: def.defense + upgradeLevel * 2,
      fireResist: def.bonusFireResist + upgradeLevel * 2,
      maxHp: def.bonusMaxHp + upgradeLevel * 5,
    }
  }, [])

  const lfGetWeaponsAboveDamage = useCallback((minDamage: number): LFWeaponDef[] => {
    return LF_WEAPONS.filter((w) => w.damage >= minDamage)
  }, [])

  const lfGetArmorAboveDefense = useCallback((minDefense: number): LFArmorDef[] => {
    return LF_ARMOR.filter((a) => a.defense >= minDefense)
  }, [])

  const lfGetMaterialsAboveRarity = useCallback((minRarity: LFRarity): LFMaterialDef[] => {
    const rarityOrder: Record<LFRarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
    const minLevel = rarityOrder[minRarity]
    return LF_MATERIALS.filter((m) => (rarityOrder[m.rarity] ?? 0) >= minLevel)
  }, [])

  const lfGetForgedWeaponsSortedByDate = useCallback((): LFCraftedWeapon[] => {
    return [...stateRef.current.craftedWeapons].sort((a, b) => b.craftedAt - a.craftedAt)
  }, [])

  const lfGetForgedArmorSortedByDate = useCallback((): LFCraftedArmor[] => {
    return [...stateRef.current.craftedArmor].sort((a, b) => b.craftedAt - a.craftedAt)
  }, [])

  const lfGetRarestCraftedWeapon = useCallback((): LFWeaponDef | null => {
    const s = stateRef.current
    if (s.craftedWeapons.length === 0) return null
    const rarityOrder: Record<LFRarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
    let best: LFWeaponDef | null = null
    let bestRarity = -1
    for (const cw of s.craftedWeapons) {
      const def = LF_WEAPONS.find((w) => w.id === cw.weaponId)
      if (def && (rarityOrder[def.rarity] ?? 0) > bestRarity) {
        best = def
        bestRarity = rarityOrder[def.rarity] ?? 0
      }
    }
    return best
  }, [])

  const lfGetRarestCraftedArmor = useCallback((): LFArmorDef | null => {
    const s = stateRef.current
    if (s.craftedArmor.length === 0) return null
    const rarityOrder: Record<LFRarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 }
    let best: LFArmorDef | null = null
    let bestRarity = -1
    for (const ca of s.craftedArmor) {
      const def = LF_ARMOR.find((a) => a.id === ca.armorId)
      if (def && (rarityOrder[def.rarity] ?? 0) > bestRarity) {
        best = def
        bestRarity = rarityOrder[def.rarity] ?? 0
      }
    }
    return best
  }, [])

  const lfGetMostValuableMaterial = useCallback((): LFMaterialDef | null => {
    const s = stateRef.current
    const entries = Object.entries(s.materials).filter(([, amt]) => amt > 0)
    if (entries.length === 0) return null
    let best: LFMaterialDef | null = null
    let bestXp = -1
    for (const [id] of entries) {
      const def = LF_MATERIALS.find((m) => m.id === id)
      if (def && def.smeltXp > bestXp) {
        best = def
        bestXp = def.smeltXp
      }
    }
    return best
  }, [])

  const lfGetTotalSmeltXpPotential = useCallback((): number => {
    const s = stateRef.current
    let total = 0
    for (const [id, amount] of Object.entries(s.materials)) {
      const def = LF_MATERIALS.find((m) => m.id === id)
      if (def) total += def.smeltXp * amount
    }
    return total
  }, [])

  const lfGetRoomLevel = useCallback((roomId: string): number => {
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    return room?.level ?? 0
  }, [])

  const lfIsRoomUnlocked = useCallback((roomId: string): boolean => {
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    return room?.unlocked ?? false
  }, [])

  const lfIsRoomMaxed = useCallback((roomId: string): boolean => {
 const roomDef = LF_FORGE_ROOMS.find((r) => r.id === roomId)
    const room = stateRef.current.forgeRooms.find((r) => r.id === roomId)
    if (!roomDef || !room) return false
    return room.level >= roomDef.maxLevel
  }, [])

  const lfGetCraftedWeaponByDef = useCallback((weaponId: string): LFCraftedWeapon | undefined => {
    return stateRef.current.craftedWeapons.find((w) => w.weaponId === weaponId)
  }, [])

  const lfGetCraftedArmorByDef = useCallback((armorId: string): LFCraftedArmor | undefined => {
    return stateRef.current.craftedArmor.find((a) => a.armorId === armorId)
  }, [])

  const lfGetWeaponCraftCount = useCallback((weaponId: string): number => {
    return stateRef.current.craftedWeapons.filter((w) => w.weaponId === weaponId).length
  }, [])

  const lfGetArmorCraftCount = useCallback((armorId: string): number => {
    return stateRef.current.craftedArmor.filter((a) => a.armorId === armorId).length
  }, [])

  const lfHasWeapon = useCallback((weaponId: string): boolean => {
    return stateRef.current.craftedWeapons.some((w) => w.weaponId === weaponId)
  }, [])

  const lfHasArmor = useCallback((armorId: string): boolean => {
    return stateRef.current.craftedArmor.some((a) => a.armorId === armorId)
  }, [])

  const lfGetCompletionPercent = useCallback((): number => {
    const totalItems = LF_WEAPONS.length + LF_ARMOR.length
    const s = stateRef.current
    const uniqueWeapons = new Set(s.craftedWeapons.map((w) => w.weaponId)).size
    const uniqueArmor = new Set(s.craftedArmor.map((a) => a.armorId)).size
    if (totalItems === 0) return 0
    return Math.floor(((uniqueWeapons + uniqueArmor) / totalItems) * 100)
  }, [])

  const lfGetSmeltCompletionPercent = useCallback((): number => {
    if (LF_MATERIALS.length === 0) return 0
    const s = stateRef.current
    const smeltedTypes = Object.keys(s.smeltCountByRarity).length > 0
    return Math.min(100, Math.floor((s.totalSmelted / (LF_MATERIALS.length * 10)) * 100))
  }, [])

  const lfGetRoomCompletionPercent = useCallback((): number => {
    const s = stateRef.current
    const totalRooms = LF_FORGE_ROOMS.length
    const unlocked = s.forgeRooms.filter((r) => r.unlocked).length
    const totalLevels = s.forgeRooms.reduce((sum, r) => sum + r.level, 0)
    const maxLevels = LF_FORGE_ROOMS.reduce((sum, r) => sum + r.maxLevel, 0)
    if (totalRooms === 0) return 0
    const unlockPct = unlocked / totalRooms * 50
    const levelPct = totalLevels / maxLevels * 50
    return Math.min(100, Math.floor(unlockPct + levelPct))
  }, [])

  const lfGetAchievementProgress = useCallback((): number => {
    const s = stateRef.current
    const total = s.achievements.length
    const unlocked = s.achievements.filter((a) => a.unlocked).length
    if (total === 0) return 0
    return Math.floor((unlocked / total) * 100)
  }, [])

  // ===========================================================================
  // RESET (NOT wrapped in useCallback)
  // ===========================================================================

  function lfResetProgress() {
    const fresh = lfCreateDefaultState()
    setState(fresh)
    stateRef.current = fresh
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('lava-forge-save')
      } catch {
        // ignore
      }
    }
  }

  // ===========================================================================
  // Return All Functions
  // ===========================================================================

  return {
    // Simple Getters
    lfGetLevel,
    lfGetXp,
    lfGetTotalXp,
    lfGetCoins,
    lfGetTotalCoinsEarned,
    lfGetTotalCoinsSpent,
    lfGetMaterials,
    lfGetCraftedWeapons,
    lfGetCraftedArmor,
    lfGetForgeRooms,
    lfGetAchievements,
    lfGetTitle,
    lfGetDailyForged,
    lfGetDailyDate,
    lfGetTotalCrafted,
    lfGetTotalSmelted,
    lfGetMasterpieces,
    lfGetTotalMaterialsMined,
    lfGetTotalUpgrades,
    lfGetStreak,
    lfGetBestStreak,
    lfGetActiveRoom,
    lfGetSmeltCountByRarity,
    lfGetCraftCountByRarity,
    lfGetState,
    lfGetTodayKey,
    lfGetXpRequired,
    lfGetXpProgress,
    lfGetOverallProgress,
    lfGetMaterialCount,
    // Level / XP / Coins Modifiers
    lfAddXp,
    lfSetLevel,
    lfSetXp,
    lfAddCoins,
    lfSpendCoins,
    lfSetCoins,
    lfCanAfford,
    // Material Management
    lfHasMaterial,
    lfAddMaterial,
    lfRemoveMaterial,
    lfMineMaterial,
    lfSmeltMaterial,
    lfSmeltAll,
    // Crafting
    lfCanCraft,
    lfCraftWeapon,
    lfCraftArmor,
    lfCraftAny,
    // Forge Room Management
    lfUnlockRoom,
    lfUpgradeForge,
    lfGetUpgradeCost,
    lfSetActiveRoom,
    lfGetRoomSmeltBonus,
    lfGetRoomCraftBonus,
    lfUnlockAllAvailableRooms,
    // Streak Management
    lfUpdateStreak,
    lfResetStreak,
    // Daily Reward
    lfGetDailyReward,
    lfClaimDailyReward,
    // Achievement Checking
    lfCheckAchievements,
    // Query Helpers
    lfGetMaterialDef,
    lfGetWeaponDef,
    lfGetArmorDef,
    lfGetRoomDef,
    lfGetRecipeDef,
    lfGetRarityDef,
    lfGetRarityColor,
    lfGetRarityLabel,
    lfGetAllMaterials,
    lfGetAllWeapons,
    lfGetAllArmor,
    lfGetAllForgeRooms,
    lfGetAllRecipes,
    lfGetAllTitles,
    lfGetAllAchievements,
    lfGetAllRarities,
    lfGetWeaponsByRarity,
    lfGetArmorByRarity,
    lfGetArmorBySlot,
    lfGetRecipesByType,
    lfGetRecipesByRoom,
    lfGetRecipesByLevel,
    lfGetMaterialsByRarity,
    lfGetMaterialsByCategory,
    lfGetUnlockedAchievementDefs,
    lfGetLockedAchievementDefs,
    lfGetUnlockedRoomCount,
    lfGetUnlockedRooms,
    lfGetLockedRooms,
    lfGetNextTitle,
    lfGetCurrentTitleInfo,
    lfGetCraftedWeaponCount,
    lfGetCraftedArmorCount,
    lfGetTotalInventoryCount,
    lfGetTotalDefense,
    lfGetTotalDamage,
    lfGetTotalFireDamage,
    lfGetTotalFireResist,
    lfGetTotalMaxHp,
    lfGetUniqueWeaponTypes,
    lfGetUniqueArmorTypes,
    lfGetMaterialInventoryList,
    lfGetMaterialTotalCount,
    lfIsDailyAvailable,
    lfGetSlotLabel,
    lfGetCategoryLabel,
    // Utility
    lfResetDaily,
    lfSellWeapon,
    lfSellArmor,
    lfSellAllCommons,
    lfDuplicateWeapon,
    lfDuplicateArmor,
    // Advanced Query & Sorting
    lfGetWeaponsSortedByDamage,
    lfGetWeaponsSortedBySpeed,
    lfGetArmorSortedByDefense,
    lfGetMaterialsSortedBySmeltXp,
    lfGetRecipesSortedByXpReward,
    lfGetCraftableRecipes,
    lfGetUncraftableRecipes,
    lfGetRecipeCostMaterials,
    lfGetWeaponTotalStats,
    lfGetArmorTotalStats,
    lfGetWeaponsAboveDamage,
    lfGetArmorAboveDefense,
    lfGetMaterialsAboveRarity,
    lfGetForgedWeaponsSortedByDate,
    lfGetForgedArmorSortedByDate,
    lfGetRarestCraftedWeapon,
    lfGetRarestCraftedArmor,
    lfGetMostValuableMaterial,
    lfGetTotalSmeltXpPotential,
    lfGetRoomLevel,
    lfIsRoomUnlocked,
    lfIsRoomMaxed,
    lfGetCraftedWeaponByDef,
    lfGetCraftedArmorByDef,
    lfGetWeaponCraftCount,
    lfGetArmorCraftCount,
    lfHasWeapon,
    lfHasArmor,
    lfGetCompletionPercent,
    lfGetSmeltCompletionPercent,
    lfGetRoomCompletionPercent,
    lfGetAchievementProgress,
    // Reset (plain function)
    lfResetProgress,
  }
}

// =============================================================================
// Module-level Forge Lore Constants
// =============================================================================

export const LF_FORGE_TIPS: string[] = [
  'Always smelt ores before crafting — ingots unlock better recipes.',
  'The Magma Pit unlocks at level 5 with a smelting bonus.',
  'Dragon materials are required for epic-tier equipment.',
  'Legendary recipes require the World Heart Chamber at level 46.',
  'Upgrade your forge rooms to boost smelting and crafting bonuses.',
  'Maintain your daily streak for increasing coin and XP rewards.',
  'Sell common equipment to fund rare material acquisitions.',
  'Phoenix Feathers and Dragon Scales are the keys to epic crafting.',
  'The Infernal Core is found only in the heart of dying volcanoes.',
  'Void Obsidian absorbs all light — and all damage.',
  'Starfall Metal fell from the sky in a meteor of pure fire.',
  'Titan Hearts still beat, even after millennia.',
  'Masterpieces are epic and legendary items you craft.',
  'Each forge room provides unique bonuses to your work.',
  'Primordial Lava predates the world itself — handle with care.',
  'The World Tree Ember connects you to all living things.',
  'Obsidian shards make the sharpest blades known to smiths.',
  'Mithril is as light as silk yet stronger than steel.',
  'Rubies glow brighter near volcanic heat — use them for fire weapons.',
  'Adamantine cannot be destroyed by any known force.',
]

export const LF_FORGE_COLORS = {
  primary: '#F97316',
  secondary: '#EF4444',
  accent: '#F59E0B',
  ember: '#DC2626',
  magma: '#B91C1C',
  gold: '#FBBF24',
  smoke: '#78716C',
  ash: '#A8A29E',
  spark: '#FDE68A',
  dark: '#292524',
  common: '#9CA3AF',
  uncommon: '#F59E0B',
  rare: '#EF4444',
  epic: '#DC2626',
  legendary: '#F97316',
} as const

export const LF_SLOTS: LFSlot[] = ['head', 'chest', 'hands', 'legs', 'feet', 'ring', 'neck']

export const LF_MATERIAL_CATEGORIES: LFMaterialCategory[] = [
  'ore', 'ingot', 'gem', 'organic', 'elemental', 'mythic',
]

export function lfGetRandomTip(index: number): string {
  if (index < 0 || index >= LF_FORGE_TIPS.length) return LF_FORGE_TIPS[0]
  return LF_FORGE_TIPS[index]
}

export function lfGetMaterialCountForRarity(rarity: LFRarity): number {
  return LF_MATERIALS.filter((m) => m.rarity === rarity).length
}

export function lfGetWeaponCountForRarity(rarity: LFRarity): number {
  return LF_WEAPONS.filter((w) => w.rarity === rarity).length
}

export function lfGetArmorCountForRarity(rarity: LFRarity): number {
  return LF_ARMOR.filter((a) => a.rarity === rarity).length
}

export function lfGetRecipeCountForRarity(rarity: LFRarity): number {
  return LF_RECIPES.filter((r) => {
    if (r.type === 'weapon') {
      const def = LF_WEAPONS.find((w) => w.id === r.outputId)
      return def?.rarity === rarity
    }
    const def = LF_ARMOR.find((a) => a.id === r.outputId)
    return def?.rarity === rarity
  }).length
}

export function lfGetTotalRecipeCount(): number {
  return LF_RECIPES.length
}

export function lfGetTotalMaterialDefCount(): number {
  return LF_MATERIALS.length
}

export function lfGetTotalWeaponDefCount(): number {
  return LF_WEAPONS.length
}

export function lfGetTotalArmorDefCount(): number {
  return LF_ARMOR.length
}

export function lfGetSlotIcon(slot: LFSlot): string {
  const icons: Record<LFSlot, string> = {
    head: '⛑️', chest: '🛡️', hands: '🧤', legs: '🦿', feet: '👢', ring: '💍', neck: '📿',
  }
  return icons[slot] ?? '❓'
}

export function lfGetCategoryIcon(category: LFMaterialCategory): string {
  const icons: Record<LFMaterialCategory, string> = {
    ore: '🪨', ingot: '⚙️', gem: '💎', organic: '🦴', elemental: '🔥', mythic: '✨',
  }
  return icons[category] ?? '❓'
}
