'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

// =============================================================================
// Solar Forge — Harness the Power of the Sun Wire for Word Snake
// Forge legendary weapons, build solar-powered facilities, and command solar energy.
// All exported functions use `sf` prefix. Constants and state use `SF_` prefix.
// =============================================================================

// =============================================================================
// Types
// =============================================================================

export type SFRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type SFMaterialCategory = 'crystal' | 'plasma' | 'fiber' | 'dust' | 'core' | 'stellar'
export type SFCreationType = 'weapon' | 'golem' | 'beast' | 'construct' | 'titan'
export type SFFacilityType = 'smelter' | 'enchanter' | 'armory' | 'laboratory' | 'collector' | 'generator' | 'vault' | 'academy'
export type SFEventType = 'solar_flare' | 'eclipse' | 'corona' | 'prominence' | 'supernova' | 'aurora'

export interface SFRarityDef {
  key: SFRarity
  label: string
  color: string
  xpMultiplier: number
}

export interface SFMaterialDef {
  id: string
  name: string
  rarity: SFRarity
  category: SFMaterialCategory
  harvestXp: number
  description: string
  emoji: string
}

export interface SFCreationDef {
  id: string
  name: string
  type: SFCreationType
  rarity: SFRarity
  power: number
  speed: number
  description: string
  emoji: string
  requiredMaterials: { materialId: string; amount: number }[]
  requiredLevel: number
  bonusSolarDamage: number
  bonusEnergyGen: number
}

export interface SFForgeChamberDef {
  id: string
  name: string
  description: string
  emoji: string
  unlockLevel: number
  upgradeCost: number
  maxLevel: number
  harvestBonus: number
  forgeBonus: number
}

export interface SFFacilityDef {
  id: string
  name: string
  type: SFFacilityType
  description: string
  emoji: string
  unlockLevel: number
  buildCost: number
  maxLevel: number
  energyPerTick: number
  coinBonus: number
}

export interface SFAbilityDef {
  id: string
  name: string
  description: string
  type: 'ability' | 'enchantment'
  rarity: SFRarity
  unlockLevel: number
  energyCost: number
  power: number
  duration: number
  emoji: string
}

export interface SFEventDef {
  id: string
  name: string
  type: SFEventType
  description: string
  emoji: string
  energyReward: number
  xpReward: number
  coinReward: number
  duration: number
  unlockLevel: number
}

export interface SFTitleDef {
  name: string
  levelRequired: number
  description: string
  bonusXpPercent: number
  bonusCoinPercent: number
}

export interface SFAchievementDef {
  id: string
  name: string
  description: string
  conditionKey: string
  targetValue: number
  rewardXp: number
  rewardCoins: number
  emoji: string
}

export interface SFDailyQuestDef {
  id: string
  name: string
  description: string
  targetValue: number
  rewardXp: number
  rewardCoins: number
  energyBonus: number
  emoji: string
}

// State types

export interface SFCreatedItem {
  creationId: string
  awakened: boolean
  awakenedLevel: number
  createdAt: number
}

export interface SFForgeChamberState {
  id: string
  level: number
  unlocked: boolean
}

export interface SFFacilityState {
  id: string
  level: number
  built: boolean
}

export interface SFAchievementState {
  id: string
  unlocked: boolean
  unlockedAt: number | null
}

export interface SFEventState {
  id: string
  active: boolean
  startedAt: number | null
  completionCount: number
}

export interface SFDailyQuestState {
  questId: string
  progress: number
  completed: boolean
  dateKey: string
}

export interface SFSolarForgeState {
  level: number
  xp: number
  totalXp: number
  energy: number
  maxEnergy: number
  materials: Record<string, number>
  creations: SFCreatedItem[]
  forgeChambers: SFForgeChamberState[]
  facilities: SFFacilityState[]
  abilities: string[]
  achievements: SFAchievementState[]
  title: string
  coins: number
  totalCoinsEarned: number
  totalCoinsSpent: number
  totalEnergyHarvested: number
  totalEnergySpent: number
  totalForged: number
  totalAwakened: number
  totalFacilitiesBuilt: number
  totalFacilitiesUpgraded: number
  totalMaterialsCollected: number
  totalEventsCompleted: number
  totalQuestsCompleted: number
  streak: number
  bestStreak: number
  lastPlayDate: string | null
  activeChamber: string
  dailyQuest: SFDailyQuestState | null
  activeEvent: SFEventState | null
  solarFlareCooldown: number
  forgeCountByRarity: Record<SFRarity, number>
}

// =============================================================================
// XP Curve Helpers
// =============================================================================

export const SF_MAX_LEVEL = 50

function sfXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0
  if (level >= SF_MAX_LEVEL) return Infinity
  return Math.floor(100 * level * (1 + level * 0.12))
}

export const SF_XP_TABLE: number[] = []
for (let i = 0; i <= SF_MAX_LEVEL; i++) {
  SF_XP_TABLE.push(sfXpRequiredForLevel(i))
}

function sfClampLevel(lvl: number): number {
  return Math.max(1, Math.min(SF_MAX_LEVEL, lvl))
}

function sfGenerateDayKey(now: number): string {
  const d = new Date(now)
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

// =============================================================================
// Constants: Rarity
// =============================================================================

export const SF_RARITY_COMMON: SFRarity = 'common'
export const SF_RARITY_UNCOMMON: SFRarity = 'uncommon'
export const SF_RARITY_RARE: SFRarity = 'rare'
export const SF_RARITY_EPIC: SFRarity = 'epic'
export const SF_RARITY_LEGENDARY: SFRarity = 'legendary'

export const SF_RARITIES: SFRarityDef[] = [
  { key: 'common', label: 'Common', color: '#FBBF24', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#F59E0B', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#F97316', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#EF4444', xpMultiplier: 3.5 },
  { key: 'legendary', label: 'Legendary', color: '#DC2626', xpMultiplier: 6 },
]

// =============================================================================
// Constants: Solar Materials (30)
// =============================================================================

export const SF_MATERIALS: SFMaterialDef[] = [
  // Common (6)
  { id: 'helium_crystal', name: 'Helium Crystal', rarity: 'common', category: 'crystal', harvestXp: 5, description: 'A basic crystal of condensed helium from the solar wind', emoji: '💎' },
  { id: 'solar_shard', name: 'Solar Shard', rarity: 'common', category: 'crystal', harvestXp: 5, description: 'A fragment of solidified sunlight', emoji: '✨' },
  { id: 'plasma_droplet', name: 'Plasma Droplet', rarity: 'common', category: 'plasma', harvestXp: 6, description: 'A small bead of contained solar plasma', emoji: '🫧' },
  { id: 'photon_fiber', name: 'Photon Fiber', rarity: 'common', category: 'fiber', harvestXp: 4, description: 'A thread of woven photon energy', emoji: '🧵' },
  { id: 'stellar_dust', name: 'Stellar Dust', rarity: 'common', category: 'dust', harvestXp: 3, description: 'Fine particles from distant stars', emoji: '✨' },
  { id: 'corona_thread', name: 'Corona Thread', rarity: 'common', category: 'fiber', harvestXp: 5, description: 'A filament pulled from the solar corona', emoji: '🪡' },
  // Uncommon (6)
  { id: 'plasma_ingot', name: 'Plasma Ingot', rarity: 'uncommon', category: 'plasma', harvestXp: 15, description: 'A solidified bar of compressed plasma', emoji: '🟡' },
  { id: 'ion_crystal', name: 'Ion Crystal', rarity: 'uncommon', category: 'crystal', harvestXp: 14, description: 'A crystal vibrating with ionic energy', emoji: '💠' },
  { id: 'solar_glass', name: 'Solar Glass', rarity: 'uncommon', category: 'crystal', harvestXp: 12, description: 'Transparent glass forged from pure solar heat', emoji: '🔬' },
  { id: 'photon_cloth', name: 'Photon Cloth', rarity: 'uncommon', category: 'fiber', harvestXp: 13, description: 'A shimmering fabric woven from concentrated photons', emoji: '🧶' },
  { id: 'nebula_dust', name: 'Nebula Dust', rarity: 'uncommon', category: 'dust', harvestXp: 16, description: 'Cosmic dust harvested from a passing nebula', emoji: '🌌' },
  { id: 'flare_ember', name: 'Flare Ember', rarity: 'uncommon', category: 'core', harvestXp: 14, description: 'An ember ejected during a solar flare', emoji: '🔥' },
  // Rare (6)
  { id: 'corundum_sunstone', name: 'Corundum Sunstone', rarity: 'rare', category: 'crystal', harvestXp: 30, description: 'A brilliant sunstone formed under extreme solar pressure', emoji: '☀️' },
  { id: 'plasma_heart', name: 'Plasma Heart', rarity: 'rare', category: 'core', harvestXp: 35, description: 'The pulsing core of a contained plasma storm', emoji: '💛' },
  { id: 'quantum_fiber', name: 'Quantum Fiber', rarity: 'rare', category: 'fiber', harvestXp: 28, description: 'Fiber that exists in multiple quantum states simultaneously', emoji: '🔮' },
  { id: 'magnetite_ingot', name: 'Magnetite Ingot', rarity: 'rare', category: 'plasma', harvestXp: 32, description: 'A magnetic ingot charged with solar electromagnetic energy', emoji: '🧲' },
  { id: 'solar_core_fragment', name: 'Solar Core Fragment', rarity: 'rare', category: 'core', harvestXp: 38, description: 'A piece of the sun\'s inner core, radiating immense heat', emoji: '💥' },
  { id: 'starlight_silk', name: 'Starlight Silk', rarity: 'rare', category: 'fiber', harvestXp: 26, description: 'Impossibly fine silk spun from captured starlight', emoji: '🕸️' },
  // Epic (6)
  { id: 'adamant_solar', name: 'Adamant Solar Crystal', rarity: 'epic', category: 'crystal', harvestXp: 60, description: 'An indestructible crystal imbued with the sun\'s will', emoji: '🔶' },
  { id: 'dark_plasma', name: 'Dark Plasma', rarity: 'epic', category: 'plasma', harvestXp: 70, description: 'Mysterious anti-energy plasma from solar anomalies', emoji: '🌑' },
  { id: 'corona_core', name: 'Corona Core', rarity: 'epic', category: 'core', harvestXp: 65, description: 'The concentrated heart of a coronal mass ejection', emoji: '🌀' },
  { id: 'tachyon_fiber', name: 'Tachyon Fiber', rarity: 'epic', category: 'fiber', harvestXp: 55, description: 'Fiber that vibrates faster than light', emoji: '⚡' },
  { id: 'supernova_dust', name: 'Supernova Dust', rarity: 'epic', category: 'dust', harvestXp: 75, description: 'Remnants of an ancient supernova, still radiating energy', emoji: '☄️' },
  { id: 'chronoshard', name: 'Chronoshard', rarity: 'epic', category: 'crystal', harvestXp: 68, description: 'A crystal that distorts time around it', emoji: '⏳' },
  // Legendary (6)
  { id: 'solar_deity_core', name: 'Solar Deity Core', rarity: 'legendary', category: 'core', harvestXp: 150, description: 'The crystallized essence of a solar deity\'s power', emoji: '🌟' },
  { id: 'genesis_plasma', name: 'Genesis Plasma', rarity: 'legendary', category: 'plasma', harvestXp: 160, description: 'Primordial plasma from the birth of the sun', emoji: '🔥' },
  { id: 'eternal_photon_weave', name: 'Eternal Photon Weave', rarity: 'legendary', category: 'fiber', harvestXp: 140, description: 'An indestructible fabric that radiates eternal light', emoji: '🌈' },
  { id: 'void_star_crystal', name: 'Void Star Crystal', rarity: 'legendary', category: 'crystal', harvestXp: 170, description: 'A crystal from a star that collapsed into the void', emoji: '🕳️' },
  { id: 'cosmos_dust', name: 'Cosmos Dust', rarity: 'legendary', category: 'dust', harvestXp: 130, description: 'The foundational dust from which all stars are born', emoji: '🌌' },
  { id: 'infinity_core', name: 'Infinity Core', rarity: 'legendary', category: 'core', harvestXp: 200, description: 'A self-sustaining energy source with infinite potential', emoji: '♾️' },
]

// =============================================================================
// Constants: Solar Creations (35)
// =============================================================================

export const SF_CREATIONS: SFCreationDef[] = [
  // Common weapons (7)
  { id: 'sun_blade', name: 'Sun Blade', type: 'weapon', rarity: 'common', power: 10, speed: 11, description: 'A basic blade infused with sunlight', emoji: '🗡️', requiredMaterials: [{ materialId: 'solar_shard', amount: 3 }, { materialId: 'photon_fiber', amount: 2 }], requiredLevel: 1, bonusSolarDamage: 3, bonusEnergyGen: 0 },
  { id: 'helium_dagger', name: 'Helium Dagger', type: 'weapon', rarity: 'common', power: 7, speed: 14, description: 'A lightweight dagger of crystallized helium', emoji: '🔪', requiredMaterials: [{ materialId: 'helium_crystal', amount: 3 }, { materialId: 'corona_thread', amount: 1 }], requiredLevel: 1, bonusSolarDamage: 2, bonusEnergyGen: 0 },
  { id: 'photon_spear', name: 'Photon Spear', type: 'weapon', rarity: 'common', power: 12, speed: 10, description: 'A spear tipped with concentrated photon energy', emoji: '🔱', requiredMaterials: [{ materialId: 'photon_fiber', amount: 4 }, { materialId: 'solar_shard', amount: 2 }], requiredLevel: 2, bonusSolarDamage: 4, bonusEnergyGen: 0 },
  { id: 'plasma_sling', name: 'Plasma Sling', type: 'weapon', rarity: 'common', power: 8, speed: 12, description: 'Hurls superheated plasma blobs at enemies', emoji: '🪃', requiredMaterials: [{ materialId: 'plasma_droplet', amount: 3 }, { materialId: 'stellar_dust', amount: 2 }], requiredLevel: 3, bonusSolarDamage: 5, bonusEnergyGen: 0 },
  { id: 'corona_bow', name: 'Corona Bow', type: 'weapon', rarity: 'common', power: 9, speed: 13, description: 'A bow strung with corona thread, fires solar arrows', emoji: '🏹', requiredMaterials: [{ materialId: 'corona_thread', amount: 3 }, { materialId: 'helium_crystal', amount: 2 }], requiredLevel: 4, bonusSolarDamage: 3, bonusEnergyGen: 0 },
  { id: 'dust_staff', name: 'Stellar Dust Staff', type: 'weapon', rarity: 'common', power: 11, speed: 9, description: 'A staff capped with a sphere of stellar dust', emoji: '🪄', requiredMaterials: [{ materialId: 'stellar_dust', amount: 5 }, { materialId: 'plasma_droplet', amount: 1 }], requiredLevel: 5, bonusSolarDamage: 2, bonusEnergyGen: 1 },
  { id: 'crystal_mace', name: 'Crystal Mace', type: 'weapon', rarity: 'common', power: 14, speed: 7, description: 'A heavy mace of fused helium crystals', emoji: '🔨', requiredMaterials: [{ materialId: 'helium_crystal', amount: 4 }, { materialId: 'solar_shard', amount: 2 }], requiredLevel: 6, bonusSolarDamage: 5, bonusEnergyGen: 0 },
  // Uncommon creations (7)
  { id: 'solar_golem', name: 'Solar Golem', type: 'golem', rarity: 'uncommon', power: 20, speed: 5, description: 'A guardian golem powered by sunlight', emoji: '🤖', requiredMaterials: [{ materialId: 'plasma_ingot', amount: 3 }, { materialId: 'solar_glass', amount: 2 }], requiredLevel: 7, bonusSolarDamage: 8, bonusEnergyGen: 2 },
  { id: 'ion_blade', name: 'Ion Blade', type: 'weapon', rarity: 'uncommon', power: 22, speed: 12, description: 'A crackling blade of ionic energy', emoji: '⚔️', requiredMaterials: [{ materialId: 'ion_crystal', amount: 3 }, { materialId: 'plasma_ingot', amount: 2 }], requiredLevel: 8, bonusSolarDamage: 10, bonusEnergyGen: 0 },
  { id: 'photon_wolf', name: 'Photon Wolf', type: 'beast', rarity: 'uncommon', power: 18, speed: 13, description: 'A spectral wolf made of pure photon light', emoji: '🐺', requiredMaterials: [{ materialId: 'photon_cloth', amount: 4 }, { materialId: 'ion_crystal', amount: 2 }], requiredLevel: 10, bonusSolarDamage: 6, bonusEnergyGen: 3 },
  { id: 'nebula_hammer', name: 'Nebula Hammer', type: 'weapon', rarity: 'uncommon', power: 28, speed: 6, description: 'A massive hammer imbued with nebula dust', emoji: '🔨', requiredMaterials: [{ materialId: 'nebula_dust', amount: 3 }, { materialId: 'plasma_ingot', amount: 3 }], requiredLevel: 11, bonusSolarDamage: 12, bonusEnergyGen: 0 },
  { id: 'flare_golem', name: 'Flare Golem', type: 'golem', rarity: 'uncommon', power: 25, speed: 4, description: 'A golem fueled by solar flare embers', emoji: '🗿', requiredMaterials: [{ materialId: 'flare_ember', amount: 4 }, { materialId: 'solar_glass', amount: 2 }], requiredLevel: 12, bonusSolarDamage: 10, bonusEnergyGen: 4 },
  { id: 'corona_construct', name: 'Corona Construct', type: 'construct', rarity: 'uncommon', power: 16, speed: 8, description: 'A mechanical guardian that draws power from the corona', emoji: '⚙️', requiredMaterials: [{ materialId: 'plasma_ingot', amount: 2 }, { materialId: 'flare_ember', amount: 2 }, { materialId: 'solar_glass', amount: 2 }], requiredLevel: 13, bonusSolarDamage: 7, bonusEnergyGen: 5 },
  { id: 'nebula_archer', name: 'Nebula Archer', type: 'beast', rarity: 'uncommon', power: 20, speed: 12, description: 'A spectral archer that fires nebula-tipped arrows', emoji: '🏹', requiredMaterials: [{ materialId: 'nebula_dust', amount: 3 }, { materialId: 'photon_cloth', amount: 3 }], requiredLevel: 14, bonusSolarDamage: 9, bonusEnergyGen: 3 },
  // Rare creations (7)
  { id: 'plasma_dragon', name: 'Plasma Dragon', type: 'beast', rarity: 'rare', power: 40, speed: 10, description: 'A majestic dragon born from contained plasma storms', emoji: '🐉', requiredMaterials: [{ materialId: 'plasma_heart', amount: 2 }, { materialId: 'magnetite_ingot', amount: 3 }], requiredLevel: 16, bonusSolarDamage: 20, bonusEnergyGen: 5 },
  { id: 'sunstone_golem', name: 'Sunstone Golem', type: 'golem', rarity: 'rare', power: 35, speed: 5, description: 'A colossal golem encrusted with corundum sunstones', emoji: '🏔️', requiredMaterials: [{ materialId: 'corundum_sunstone', amount: 4 }, { materialId: 'magnetite_ingot', amount: 2 }], requiredLevel: 18, bonusSolarDamage: 18, bonusEnergyGen: 6 },
  { id: 'quantum_wolf', name: 'Quantum Wolf', type: 'beast', rarity: 'rare', power: 30, speed: 14, description: 'A wolf that phases between quantum states', emoji: '🐺', requiredMaterials: [{ materialId: 'quantum_fiber', amount: 4 }, { materialId: 'corundum_sunstone', amount: 2 }], requiredLevel: 20, bonusSolarDamage: 15, bonusEnergyGen: 8 },
  { id: 'core_blade', name: 'Solar Core Blade', type: 'weapon', rarity: 'rare', power: 38, speed: 11, description: 'A legendary blade housing a fragment of the solar core', emoji: '⚔️', requiredMaterials: [{ materialId: 'solar_core_fragment', amount: 2 }, { materialId: 'magnetite_ingot', amount: 3 }, { materialId: 'quantum_fiber', amount: 1 }], requiredLevel: 22, bonusSolarDamage: 25, bonusEnergyGen: 2 },
  { id: 'starlight_phoenix', name: 'Starlight Phoenix', type: 'beast', rarity: 'rare', power: 32, speed: 13, description: 'A phoenix woven from starlight silk and solar fire', emoji: '🦅', requiredMaterials: [{ materialId: 'starlight_silk', amount: 4 }, { materialId: 'solar_core_fragment', amount: 1 }, { materialId: 'quantum_fiber', amount: 2 }], requiredLevel: 24, bonusSolarDamage: 18, bonusEnergyGen: 10 },
  { id: 'iron_sun_guardian', name: 'Iron Sun Guardian', type: 'construct', rarity: 'rare', power: 38, speed: 6, description: 'An armored construct that radiates solar heat', emoji: '🛡️', requiredMaterials: [{ materialId: 'magnetite_ingot', amount: 5 }, { materialId: 'solar_core_fragment', amount: 1 }, { materialId: 'starlight_silk', amount: 2 }], requiredLevel: 25, bonusSolarDamage: 22, bonusEnergyGen: 5 },
  { id: 'quantum_serpent', name: 'Quantum Serpent', type: 'beast', rarity: 'rare', power: 28, speed: 15, description: 'A serpentine beast that travels through quantum tunnels', emoji: '🐍', requiredMaterials: [{ materialId: 'quantum_fiber', amount: 5 }, { materialId: 'corundum_sunstone', amount: 3 }], requiredLevel: 26, bonusSolarDamage: 16, bonusEnergyGen: 8 },
  // Epic creations (7)
  { id: 'dark_plasma_dragon', name: 'Dark Plasma Dragon', type: 'beast', rarity: 'epic', power: 55, speed: 11, description: 'A terrifying dragon born from dark plasma anomalies', emoji: '🐲', requiredMaterials: [{ materialId: 'dark_plasma', amount: 3 }, { materialId: 'adamant_solar', amount: 2 }, { materialId: 'tachyon_fiber', amount: 2 }], requiredLevel: 28, bonusSolarDamage: 35, bonusEnergyGen: 8 },
  { id: 'adamant_titan', name: 'Adamant Titan', type: 'titan', rarity: 'epic', power: 60, speed: 4, description: 'An indestructible titan encased in adamant solar crystal', emoji: '🗿', requiredMaterials: [{ materialId: 'adamant_solar', amount: 4 }, { materialId: 'corona_core', amount: 2 }, { materialId: 'tachyon_fiber', amount: 1 }], requiredLevel: 30, bonusSolarDamage: 30, bonusEnergyGen: 12 },
  { id: 'tachyon_specter', name: 'Tachyon Specter', type: 'construct', rarity: 'epic', power: 45, speed: 16, description: 'A ghostly construct that moves faster than light', emoji: '👻', requiredMaterials: [{ materialId: 'tachyon_fiber', amount: 4 }, { materialId: 'dark_plasma', amount: 2 }, { materialId: 'adamant_solar', amount: 1 }], requiredLevel: 32, bonusSolarDamage: 28, bonusEnergyGen: 15 },
  { id: 'corona_sovereign', name: 'Corona Sovereign', type: 'titan', rarity: 'epic', power: 58, speed: 7, description: 'A towering ruler wreathed in coronal fire', emoji: '👑', requiredMaterials: [{ materialId: 'corona_core', amount: 3 }, { materialId: 'supernova_dust', amount: 2 }, { materialId: 'adamant_solar', amount: 2 }], requiredLevel: 34, bonusSolarDamage: 40, bonusEnergyGen: 10 },
  { id: 'chronowolf', name: 'Chrono Wolf', type: 'beast', rarity: 'epic', power: 42, speed: 15, description: 'A wolf that can freeze and accelerate time', emoji: '🐺', requiredMaterials: [{ materialId: 'chronoshard', amount: 3 }, { materialId: 'tachyon_fiber', amount: 3 }, { materialId: 'dark_plasma', amount: 1 }], requiredLevel: 36, bonusSolarDamage: 25, bonusEnergyGen: 12 },
  { id: 'supernova_golem', name: 'Supernova Golem', type: 'golem', rarity: 'epic', power: 52, speed: 5, description: 'A golem powered by the explosive force of a supernova', emoji: '💥', requiredMaterials: [{ materialId: 'supernova_dust', amount: 4 }, { materialId: 'corona_core', amount: 2 }, { materialId: 'chronoshard', amount: 1 }], requiredLevel: 38, bonusSolarDamage: 45, bonusEnergyGen: 8 },
  { id: 'dark_phoenix', name: 'Dark Phoenix', type: 'beast', rarity: 'epic', power: 50, speed: 14, description: 'A phoenix reborn from dark plasma, radiating anti-light', emoji: '🦅', requiredMaterials: [{ materialId: 'dark_plasma', amount: 3 }, { materialId: 'supernova_dust', amount: 2 }, { materialId: 'chronoshard', amount: 2 }], requiredLevel: 39, bonusSolarDamage: 38, bonusEnergyGen: 15 },
  // Legendary creations (7)
  { id: 'solar_deity_blade', name: 'Solar Deity Blade', type: 'weapon', rarity: 'legendary', power: 80, speed: 12, description: 'The ultimate sun blade, containing the will of a solar deity', emoji: '⚔️', requiredMaterials: [{ materialId: 'solar_deity_core', amount: 2 }, { materialId: 'genesis_plasma', amount: 2 }, { materialId: 'eternal_photon_weave', amount: 1 }], requiredLevel: 40, bonusSolarDamage: 60, bonusEnergyGen: 10 },
  { id: 'genesis_dragon', name: 'Genesis Dragon', type: 'beast', rarity: 'legendary', power: 90, speed: 10, description: 'A primordial dragon born at the dawn of the sun', emoji: '🐉', requiredMaterials: [{ materialId: 'genesis_plasma', amount: 2 }, { materialId: 'solar_deity_core', amount: 1 }, { materialId: 'void_star_crystal', amount: 2 }], requiredLevel: 42, bonusSolarDamage: 55, bonusEnergyGen: 20 },
  { id: 'infinity_titan', name: 'Infinity Titan', type: 'titan', rarity: 'legendary', power: 95, speed: 5, description: 'A titan of boundless energy powered by the infinity core', emoji: '🗿', requiredMaterials: [{ materialId: 'infinity_core', amount: 1 }, { materialId: 'solar_deity_core', amount: 2 }, { materialId: 'adamant_solar', amount: 3 }], requiredLevel: 44, bonusSolarDamage: 65, bonusEnergyGen: 25 },
  { id: 'void_star_golem', name: 'Void Star Golem', type: 'golem', rarity: 'legendary', power: 85, speed: 6, description: 'A golem that harnesses the power of collapsed stars', emoji: '🕳️', requiredMaterials: [{ materialId: 'void_star_crystal', amount: 3 }, { materialId: 'genesis_plasma', amount: 1 }, { materialId: 'eternal_photon_weave', amount: 2 }], requiredLevel: 45, bonusSolarDamage: 50, bonusEnergyGen: 20 },
  { id: 'cosmic_phoenix', name: 'Cosmic Phoenix', type: 'beast', rarity: 'legendary', power: 75, speed: 15, description: 'The phoenix of all stars, eternal and ever-reborn', emoji: '🦅', requiredMaterials: [{ materialId: 'cosmos_dust', amount: 3 }, { materialId: 'eternal_photon_weave', amount: 2 }, { materialId: 'infinity_core', amount: 1 }], requiredLevel: 46, bonusSolarDamage: 45, bonusEnergyGen: 30 },
  { id: 'eternal_sun_guardian', name: 'Eternal Sun Guardian', type: 'construct', rarity: 'legendary', power: 88, speed: 8, description: 'An immortal construct that guards the eternal flame', emoji: '🛡️', requiredMaterials: [{ materialId: 'eternal_photon_weave', amount: 3 }, { materialId: 'void_star_crystal', amount: 2 }, { materialId: 'genesis_plasma', amount: 1 }], requiredLevel: 48, bonusSolarDamage: 58, bonusEnergyGen: 22 },
  { id: 'solar_primordial', name: 'Solar Primordial', type: 'titan', rarity: 'legendary', power: 100, speed: 10, description: 'The original titan of the sun, source of all solar energy', emoji: '☀️', requiredMaterials: [{ materialId: 'infinity_core', amount: 1 }, { materialId: 'genesis_plasma', amount: 2 }, { materialId: 'solar_deity_core', amount: 1 }, { materialId: 'cosmos_dust', amount: 2 }], requiredLevel: 50, bonusSolarDamage: 80, bonusEnergyGen: 50 },
]

// =============================================================================
// Constants: Forge Chambers (8)
// =============================================================================

export const SF_FORGE_CHAMBERS: SFForgeChamberDef[] = [
  { id: 'ignition_hall', name: 'Ignition Hall', description: 'The entry chamber where new solar smiths learn to harness the first sparks of solar energy', emoji: '🔥', unlockLevel: 1, upgradeCost: 0, maxLevel: 10, harvestBonus: 0, forgeBonus: 0 },
  { id: 'corona_chamber', name: 'Corona Chamber', description: 'A chamber open to the solar corona, drawing raw plasma from the sun\'s outer atmosphere', emoji: '🌤️', unlockLevel: 5, upgradeCost: 500, maxLevel: 10, harvestBonus: 0.1, forgeBonus: 0.05 },
  { id: 'flare_foundry', name: 'Flare Foundry', description: 'A volatile foundry that captures energy from periodic solar flares', emoji: '💫', unlockLevel: 10, upgradeCost: 1500, maxLevel: 10, harvestBonus: 0.05, forgeBonus: 0.15 },
  { id: 'photon_gallery', name: 'Photon Gallery', description: 'A brilliant gallery where photons are collected, sorted, and woven into useful forms', emoji: '✨', unlockLevel: 16, upgradeCost: 4000, maxLevel: 10, harvestBonus: 0.15, forgeBonus: 0.1 },
  { id: 'supernova_core', name: 'Supernova Core', description: 'A containment chamber housing a controlled micro-supernova for advanced forging', emoji: '💥', unlockLevel: 22, upgradeCost: 8000, maxLevel: 10, harvestBonus: 0.1, forgeBonus: 0.2 },
  { id: 'radiance_workshop', name: 'Radiance Workshop', description: 'A specialized workshop for enchanting creations with pure solar radiance', emoji: '☀️', unlockLevel: 30, upgradeCost: 15000, maxLevel: 10, harvestBonus: 0.2, forgeBonus: 0.15 },
  { id: 'eclipse_vault', name: 'Eclipse Vault', description: 'A mysterious vault that only activates during solar eclipses, storing the rarest materials', emoji: '🌑', unlockLevel: 38, upgradeCost: 30000, maxLevel: 10, harvestBonus: 0.25, forgeBonus: 0.25 },
  { id: 'sols_heart', name: 'Sol\'s Heart', description: 'The innermost sanctum, a direct conduit to the sun\'s core fire, source of all solar power', emoji: '💛', unlockLevel: 46, upgradeCost: 60000, maxLevel: 10, harvestBonus: 0.35, forgeBonus: 0.35 },
]

// =============================================================================
// Constants: Facilities (25)
// =============================================================================

export const SF_FACILITIES: SFFacilityDef[] = [
  // Smelters (4)
  { id: 'crystal_smelter', name: 'Crystal Smelter', type: 'smelter', description: 'Smelts raw crystals into refined solar ingots', emoji: '🔥', unlockLevel: 1, buildCost: 200, maxLevel: 10, energyPerTick: 5, coinBonus: 10 },
  { id: 'plasma_smelter', name: 'Plasma Smelter', type: 'smelter', description: 'Compresses and purifies raw plasma into usable forms', emoji: '⚗️', unlockLevel: 8, buildCost: 800, maxLevel: 10, energyPerTick: 10, coinBonus: 20 },
  { id: 'star_smelter', name: 'Star Smelter', type: 'smelter', description: 'Processes stellar materials at extreme temperatures', emoji: '⭐', unlockLevel: 20, buildCost: 3000, maxLevel: 10, energyPerTick: 20, coinBonus: 50 },
  { id: 'void_smelter', name: 'Void Smelter', type: 'smelter', description: 'Handles the most exotic materials from collapsed stars', emoji: '🕳️', unlockLevel: 35, buildCost: 10000, maxLevel: 10, energyPerTick: 40, coinBonus: 100 },
  // Enchanters (3)
  { id: 'sun_enchanter', name: 'Sun Enchanter', type: 'enchanter', description: 'Enchants weapons and armor with solar fire', emoji: '✨', unlockLevel: 3, buildCost: 300, maxLevel: 10, energyPerTick: 3, coinBonus: 15 },
  { id: 'corona_enchanter', name: 'Corona Enchanter', type: 'enchanter', description: 'Grants creations the protective power of the corona', emoji: '🌟', unlockLevel: 15, buildCost: 2000, maxLevel: 10, energyPerTick: 8, coinBonus: 40 },
  { id: 'deity_enchanter', name: 'Deity Enchanter', type: 'enchanter', description: 'Channels the power of solar deities for ultimate enchantments', emoji: '👑', unlockLevel: 30, buildCost: 12000, maxLevel: 10, energyPerTick: 25, coinBonus: 80 },
  // Armories (3)
  { id: 'dawn_armory', name: 'Dawn Armory', type: 'armory', description: 'Stores and displays your solar-forged weapons', emoji: '🗡️', unlockLevel: 2, buildCost: 150, maxLevel: 10, energyPerTick: 2, coinBonus: 8 },
  { id: 'zenith_armory', name: 'Zenith Armory', type: 'armory', description: 'An armory that shines at the sun\'s zenith, enhancing stored items', emoji: '⚔️', unlockLevel: 18, buildCost: 5000, maxLevel: 10, energyPerTick: 12, coinBonus: 60 },
  { id: 'infinity_armory', name: 'Infinity Armory', type: 'armory', description: 'A pocket dimension armory with limitless storage', emoji: '♾️', unlockLevel: 40, buildCost: 20000, maxLevel: 10, energyPerTick: 30, coinBonus: 120 },
  // Laboratories (3)
  { id: 'solar_lab', name: 'Solar Laboratory', type: 'laboratory', description: 'Researches new forging techniques and material combinations', emoji: '🔬', unlockLevel: 4, buildCost: 400, maxLevel: 10, energyPerTick: 4, coinBonus: 12 },
  { id: 'plasma_lab', name: 'Plasma Research Lab', type: 'laboratory', description: 'Studies plasma behavior for advanced creation abilities', emoji: '🧪', unlockLevel: 14, buildCost: 2500, maxLevel: 10, energyPerTick: 10, coinBonus: 35 },
  { id: 'quantum_lab', name: 'Quantum Forge Lab', type: 'laboratory', description: 'Quantum research facility that unlocks legendary blueprints', emoji: '⚛️', unlockLevel: 28, buildCost: 8000, maxLevel: 10, energyPerTick: 18, coinBonus: 70 },
  // Collectors (4)
  { id: 'sun_collector', name: 'Solar Collector', type: 'collector', description: 'Gathers raw solar energy from the sun\'s rays', emoji: '☀️', unlockLevel: 1, buildCost: 100, maxLevel: 10, energyPerTick: 8, coinBonus: 5 },
  { id: 'wind_collector', name: 'Solar Wind Collector', type: 'collector', description: 'Captures energetic particles from the solar wind', emoji: '🌬️', unlockLevel: 6, buildCost: 500, maxLevel: 10, energyPerTick: 12, coinBonus: 15 },
  { id: 'flare_collector', name: 'Flare Collector', type: 'collector', description: 'Harvests energy during solar flare events', emoji: '💥', unlockLevel: 12, buildCost: 1500, maxLevel: 10, energyPerTick: 20, coinBonus: 30 },
  { id: 'corona_collector', name: 'Corona Collector', type: 'collector', description: 'Draws energy directly from the solar corona', emoji: '🌐', unlockLevel: 25, buildCost: 6000, maxLevel: 10, energyPerTick: 35, coinBonus: 75 },
  // Generators (3)
  { id: 'crystal_generator', name: 'Crystal Generator', type: 'generator', description: 'Converts solar crystals into sustained energy output', emoji: '💎', unlockLevel: 7, buildCost: 600, maxLevel: 10, energyPerTick: 15, coinBonus: 18 },
  { id: 'plasma_generator', name: 'Plasma Generator', type: 'generator', description: 'Generates power from contained plasma reactions', emoji: '⚡', unlockLevel: 16, buildCost: 3000, maxLevel: 10, energyPerTick: 30, coinBonus: 45 },
  { id: 'deity_generator', name: 'Deity Generator', type: 'generator', description: 'An advanced generator tapping into cosmic energy sources', emoji: '🌟', unlockLevel: 36, buildCost: 15000, maxLevel: 10, energyPerTick: 50, coinBonus: 110 },
  // Vaults (2)
  { id: 'material_vault', name: 'Material Vault', type: 'vault', description: 'A secure vault for storing rare solar materials', emoji: '🏦', unlockLevel: 5, buildCost: 350, maxLevel: 10, energyPerTick: 1, coinBonus: 10 },
  { id: 'legendary_vault', name: 'Legendary Vault', type: 'vault', description: 'A climate-controlled vault for the most precious materials', emoji: '🏛️', unlockLevel: 32, buildCost: 10000, maxLevel: 10, energyPerTick: 5, coinBonus: 90 },
  // Academies (3)
  { id: 'spark_academy', name: 'Spark Tender Academy', type: 'academy', description: 'Trains new solar smiths in the art of energy manipulation', emoji: '📚', unlockLevel: 1, buildCost: 200, maxLevel: 10, energyPerTick: 2, coinBonus: 8 },
  { id: 'radiance_academy', name: 'Radiance Academy', type: 'academy', description: 'Advanced training ground for master solar smiths', emoji: '🎓', unlockLevel: 20, buildCost: 4000, maxLevel: 10, energyPerTick: 10, coinBonus: 50 },
  { id: 'deity_academy', name: 'Solar Deity Academy', type: 'academy', description: 'The most prestigious academy, training the next Solar Deity', emoji: '🏆', unlockLevel: 42, buildCost: 25000, maxLevel: 10, energyPerTick: 20, coinBonus: 150 },
]

// =============================================================================
// Constants: Abilities & Enchantments (22)
// =============================================================================

export const SF_ABILITIES: SFAbilityDef[] = [
  // Abilities (11)
  { id: 'solar_burst', name: 'Solar Burst', description: 'Unleash a burst of concentrated solar energy at all enemies', type: 'ability', rarity: 'common', unlockLevel: 1, energyCost: 10, power: 25, duration: 0, emoji: '💥' },
  { id: 'helium_shield', name: 'Helium Shield', description: 'Create a protective barrier of compressed helium crystals', type: 'ability', rarity: 'common', unlockLevel: 3, energyCost: 15, power: 0, duration: 5, emoji: '🛡️' },
  { id: 'plasma_wave', name: 'Plasma Wave', description: 'Send a devastating wave of plasma across the battlefield', type: 'ability', rarity: 'uncommon', unlockLevel: 6, energyCost: 20, power: 40, duration: 0, emoji: '🌊' },
  { id: 'photon_dash', name: 'Photon Dash', description: 'Transform into pure light and dash through enemies', type: 'ability', rarity: 'uncommon', unlockLevel: 8, energyCost: 12, power: 30, duration: 2, emoji: '💨' },
  { id: 'flare_storm', name: 'Flare Storm', description: 'Summon a storm of solar flares that rain down on foes', type: 'ability', rarity: 'rare', unlockLevel: 14, energyCost: 35, power: 60, duration: 0, emoji: '🌪️' },
  { id: 'corona_heal', name: 'Corona Heal', description: 'Channel the regenerative power of the corona to restore health', type: 'ability', rarity: 'rare', unlockLevel: 18, energyCost: 25, power: 0, duration: 8, emoji: '💚' },
  { id: 'quantum_blink', name: 'Quantum Blink', description: 'Teleport short distances by shifting through quantum states', type: 'ability', rarity: 'rare', unlockLevel: 22, energyCost: 18, power: 20, duration: 1, emoji: '🔮' },
  { id: 'supernova_ult', name: 'Supernova', description: 'Trigger a controlled supernova explosion of immense destructive power', type: 'ability', rarity: 'epic', unlockLevel: 28, energyCost: 60, power: 100, duration: 0, emoji: '☄️' },
  { id: 'time_freeze', name: 'Time Freeze', description: 'Freeze time for all enemies using chronoshard energy', type: 'ability', rarity: 'epic', unlockLevel: 34, energyCost: 50, power: 0, duration: 6, emoji: '⏱️' },
  { id: 'deity_wrath', name: 'Solar Deity Wrath', description: 'Channel the full wrath of a solar deity upon your enemies', type: 'ability', rarity: 'legendary', unlockLevel: 42, energyCost: 100, power: 200, duration: 0, emoji: '☀️' },
  { id: 'infinity_pulse', name: 'Infinity Pulse', description: 'Release an infinite energy pulse that affects all combatants', type: 'ability', rarity: 'legendary', unlockLevel: 48, energyCost: 80, power: 150, duration: 3, emoji: '♾️' },
  // Enchantments (11)
  { id: 'solar_fire_enchant', name: 'Solar Fire Enchantment', description: 'Enchants a weapon to burn with eternal solar fire', type: 'enchantment', rarity: 'common', unlockLevel: 2, energyCost: 8, power: 10, duration: 0, emoji: '🔥' },
  { id: 'lightweave_enchant', name: 'Lightweave', description: 'Enchants armor to become as light as photon cloth', type: 'enchantment', rarity: 'common', unlockLevel: 4, energyCost: 10, power: 5, duration: 0, emoji: '✨' },
  { id: 'plasma_edge_enchant', name: 'Plasma Edge', description: 'Adds a superheated plasma edge to any blade', type: 'enchantment', rarity: 'uncommon', unlockLevel: 9, energyCost: 20, power: 20, duration: 0, emoji: '⚡' },
  { id: 'ion_barrier_enchant', name: 'Ion Barrier', description: 'Creates an ionized barrier that deflects attacks', type: 'enchantment', rarity: 'uncommon', unlockLevel: 11, energyCost: 22, power: 15, duration: 0, emoji: '🔰' },
  { id: 'nebula_shroud_enchant', name: 'Nebula Shroud', description: 'Wraps the target in a protective nebula mist', type: 'enchantment', rarity: 'rare', unlockLevel: 17, energyCost: 35, power: 30, duration: 0, emoji: '🌌' },
  { id: 'core_ignition_enchant', name: 'Core Ignition', description: 'Enchants a creation to ignite its solar core on command', type: 'enchantment', rarity: 'rare', unlockLevel: 21, energyCost: 40, power: 35, duration: 0, emoji: '💥' },
  { id: 'quantum_lock_enchant', name: 'Quantum Lock', description: 'Locks an item in a quantum state, making it indestructible', type: 'enchantment', rarity: 'rare', unlockLevel: 24, energyCost: 30, power: 25, duration: 0, emoji: '🔒' },
  { id: 'dark_radiance_enchant', name: 'Dark Radiance', description: 'Enchants with both light and dark solar energy simultaneously', type: 'enchantment', rarity: 'epic', unlockLevel: 30, energyCost: 55, power: 50, duration: 0, emoji: '🌗' },
  { id: 'tachyon_speed_enchant', name: 'Tachyon Speed', description: 'Grants supersonic speed through tachyon field manipulation', type: 'enchantment', rarity: 'epic', unlockLevel: 36, energyCost: 60, power: 40, duration: 0, emoji: '💫' },
  { id: 'deity_blessing_enchant', name: 'Deity Blessing', description: 'The blessing of a solar deity, granting immense power', type: 'enchantment', rarity: 'legendary', unlockLevel: 44, energyCost: 100, power: 80, duration: 0, emoji: '👑' },
  { id: 'infinity_weave_enchant', name: 'Infinity Weave', description: 'Weaves infinite energy into the item for everlasting power', type: 'enchantment', rarity: 'legendary', unlockLevel: 50, energyCost: 120, power: 100, duration: 0, emoji: '♾️' },
]

// =============================================================================
// Constants: Solar Flare Events (6)
// =============================================================================

export const SF_EVENTS: SFEventDef[] = [
  { id: 'minor_flare', name: 'Minor Solar Flare', type: 'solar_flare', description: 'A small eruption of solar energy that showers the forge with bonus materials', emoji: '☀️', energyReward: 25, xpReward: 50, coinReward: 100, duration: 60, unlockLevel: 1 },
  { id: 'coronal_eclipse', name: 'Coronal Eclipse', type: 'eclipse', description: 'A rare eclipse that temporarily boosts all harvesting rates', emoji: '🌑', energyReward: 40, xpReward: 80, coinReward: 200, duration: 120, unlockLevel: 5 },
  { id: 'corona_rain', name: 'Corona Rain', type: 'corona', description: 'A rain of corona particles that grants bonus XP for all forging', emoji: '🌧️', energyReward: 30, xpReward: 120, coinReward: 150, duration: 90, unlockLevel: 10 },
  { id: 'solar_prominence', name: 'Solar Prominence', type: 'prominence', description: 'A massive prominence arc that supercharges all facilities', emoji: '🌈', energyReward: 60, xpReward: 150, coinReward: 300, duration: 180, unlockLevel: 20 },
  { id: 'micro_supernova', name: 'Micro Supernova', type: 'supernova', description: 'A controlled supernova event that drops legendary materials', emoji: '💥', energyReward: 100, xpReward: 300, coinReward: 500, duration: 240, unlockLevel: 35 },
  { id: 'aurora_borealis', name: 'Solar Aurora Borealis', type: 'aurora', description: 'A breathtaking aurora that awakens dormant creations', emoji: '🌌', energyReward: 80, xpReward: 250, coinReward: 400, duration: 150, unlockLevel: 45 },
]

// =============================================================================
// Constants: Daily Solar Ignition Quests
// =============================================================================

export const SF_DAILY_QUESTS: SFDailyQuestDef[] = [
  { id: 'harvest_5_materials', name: 'Daily Harvest', description: 'Harvest 5 solar materials today', targetValue: 5, rewardXp: 30, rewardCoins: 50, energyBonus: 10, emoji: '⛏️' },
  { id: 'forge_2_creations', name: 'Forge Creations', description: 'Forge 2 solar creations', targetValue: 2, rewardXp: 60, rewardCoins: 100, energyBonus: 20, emoji: '⚒️' },
  { id: 'harvest_10_materials', name: 'Material Frenzy', description: 'Harvest 10 solar materials in one day', targetValue: 10, rewardXp: 50, rewardCoins: 80, energyBonus: 15, emoji: '💎' },
  { id: 'awaken_1_creation', name: 'Awakening Ritual', description: 'Awaken 1 creation to increase its power', targetValue: 1, rewardXp: 80, rewardCoins: 120, energyBonus: 25, emoji: '🌟' },
  { id: 'upgrade_1_facility', name: 'Facility Upgrade', description: 'Upgrade 1 solar facility', targetValue: 1, rewardXp: 40, rewardCoins: 60, energyBonus: 10, emoji: '🏗️' },
  { id: 'use_3_abilities', name: 'Ability Mastery', description: 'Use solar abilities 3 times', targetValue: 3, rewardXp: 45, rewardCoins: 70, energyBonus: 12, emoji: '⚡' },
  { id: 'complete_1_event', name: 'Event Survivor', description: 'Complete 1 solar flare event', targetValue: 1, rewardXp: 100, rewardCoins: 200, energyBonus: 40, emoji: '☀️' },
]

// =============================================================================
// Constants: Titles (8)
// =============================================================================

export const SF_TITLES: SFTitleDef[] = [
  { name: 'Spark Tender', levelRequired: 1, description: 'A novice solar smith learning to tend the first sparks', bonusXpPercent: 0, bonusCoinPercent: 0 },
  { name: 'Solar Apprentice', levelRequired: 5, description: 'An apprentice who can shape basic solar energy', bonusXpPercent: 5, bonusCoinPercent: 5 },
  { name: 'Flame Keeper', levelRequired: 10, description: 'A keeper of the eternal solar flame', bonusXpPercent: 10, bonusCoinPercent: 8 },
  { name: 'Corona Smith', levelRequired: 18, description: 'A master smith who draws power from the corona', bonusXpPercent: 15, bonusCoinPercent: 12 },
  { name: 'Plasma Lord', levelRequired: 25, description: 'A lord of plasma, commanding its raw power', bonusXpPercent: 20, bonusCoinPercent: 15 },
  { name: 'Radiant Forgemaster', levelRequired: 33, description: 'A forgemaster whose creations shine with divine radiance', bonusXpPercent: 25, bonusCoinPercent: 20 },
  { name: 'Star Sovereign', levelRequired: 42, description: 'A sovereign ruler of stars and solar energy', bonusXpPercent: 35, bonusCoinPercent: 28 },
  { name: 'Solar Deity', levelRequired: 50, description: 'The ultimate Solar Deity, master of all sun-forged creations', bonusXpPercent: 50, bonusCoinPercent: 40 },
]

// =============================================================================
// Constants: Achievements (18)
// =============================================================================

export const SF_ACHIEVEMENTS: SFAchievementDef[] = [
  { id: 'first_harvest', name: 'First Light', description: 'Harvest your first solar material', conditionKey: 'totalMaterialsCollected', targetValue: 1, rewardXp: 20, rewardCoins: 10, emoji: '✨' },
  { id: 'harvest_50', name: 'Solar Collector', description: 'Harvest 50 solar materials total', conditionKey: 'totalMaterialsCollected', targetValue: 50, rewardXp: 100, rewardCoins: 100, emoji: '⛏️' },
  { id: 'harvest_500', name: 'Material Tycoon', description: 'Harvest 500 solar materials total', conditionKey: 'totalMaterialsCollected', targetValue: 500, rewardXp: 400, rewardCoins: 500, emoji: '💎' },
  { id: 'first_forge', name: 'First Spark', description: 'Forge your first solar creation', conditionKey: 'totalForged', targetValue: 1, rewardXp: 30, rewardCoins: 20, emoji: '⚒️' },
  { id: 'forge_25', name: 'Prolific Smith', description: 'Forge 25 solar creations total', conditionKey: 'totalForged', targetValue: 25, rewardXp: 200, rewardCoins: 200, emoji: '🔨' },
  { id: 'forge_100', name: 'Legendary Smith', description: 'Forge 100 solar creations total', conditionKey: 'totalForged', targetValue: 100, rewardXp: 500, rewardCoins: 1000, emoji: '🏆' },
  { id: 'first_awaken', name: 'Awakening', description: 'Awaken your first creation', conditionKey: 'totalAwakened', targetValue: 1, rewardXp: 50, rewardCoins: 30, emoji: '🌟' },
  { id: 'awaken_10', name: 'Soul Forgemaster', description: 'Awaken 10 creations', conditionKey: 'totalAwakened', targetValue: 10, rewardXp: 300, rewardCoins: 300, emoji: '💫' },
  { id: 'build_5_facilities', name: 'Facility Architect', description: 'Build 5 solar facilities', conditionKey: 'totalFacilitiesBuilt', targetValue: 5, rewardXp: 100, rewardCoins: 150, emoji: '🏗️' },
  { id: 'build_all_facilities', name: 'Solar Empire', description: 'Build all 25 solar facilities', conditionKey: 'totalFacilitiesBuilt', targetValue: 25, rewardXp: 800, rewardCoins: 2000, emoji: '🏰' },
  { id: 'first_event', name: 'Flare Survivor', description: 'Complete your first solar flare event', conditionKey: 'totalEventsCompleted', targetValue: 1, rewardXp: 60, rewardCoins: 50, emoji: '☀️' },
  { id: 'events_20', name: 'Event Veteran', description: 'Complete 20 solar flare events', conditionKey: 'totalEventsCompleted', targetValue: 20, rewardXp: 400, rewardCoins: 500, emoji: '💥' },
  { id: 'quests_10', name: 'Dedicated Smith', description: 'Complete 10 daily solar ignition quests', conditionKey: 'totalQuestsCompleted', targetValue: 10, rewardXp: 200, rewardCoins: 200, emoji: '📋' },
  { id: 'quests_50', name: 'Quest Champion', description: 'Complete 50 daily solar ignition quests', conditionKey: 'totalQuestsCompleted', targetValue: 50, rewardXp: 1000, rewardCoins: 1500, emoji: '🏅' },
  { id: 'streak_7', name: 'Weekly Devotion', description: 'Maintain a 7-day login streak', conditionKey: 'bestStreak', targetValue: 7, rewardXp: 150, rewardCoins: 100, emoji: '📅' },
  { id: 'streak_30', name: 'Monthly Devotion', description: 'Maintain a 30-day login streak', conditionKey: 'bestStreak', targetValue: 30, rewardXp: 500, rewardCoins: 500, emoji: '🗓️' },
  { id: 'energy_1000', name: 'Energy Hoarder', description: 'Accumulate 1000 total energy harvested', conditionKey: 'totalEnergyHarvested', targetValue: 1000, rewardXp: 200, rewardCoins: 150, emoji: '🔋' },
  { id: 'level_50', name: 'Maximum Solar Power', description: 'Reach the maximum level of 50', conditionKey: 'level', targetValue: 50, rewardXp: 1000, rewardCoins: 2000, emoji: '🌟' },
]

// =============================================================================
// Constants: Category Labels
// =============================================================================

export const SF_CATEGORY_LABELS: Record<string, string> = {
  crystal: 'Crystal',
  plasma: 'Plasma',
  fiber: 'Fiber',
  dust: 'Dust',
  core: 'Core',
  stellar: 'Stellar',
}

export const SF_FACILITY_TYPE_LABELS: Record<string, string> = {
  smelter: 'Smelter',
  enchanter: 'Enchanter',
  armory: 'Armory',
  laboratory: 'Laboratory',
  collector: 'Collector',
  generator: 'Generator',
  vault: 'Vault',
  academy: 'Academy',
}

export const SF_CREATION_TYPE_LABELS: Record<string, string> = {
  weapon: 'Weapon',
  golem: 'Golem',
  beast: 'Beast',
  construct: 'Construct',
  titan: 'Titan',
}

// =============================================================================
// Default State Factory
// =============================================================================

function sfCreateDefaultState(): SFSolarForgeState {
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    energy: 50,
    maxEnergy: 100,
    materials: {},
    creations: [],
    forgeChambers: SF_FORGE_CHAMBERS.map((ch) => ({
      id: ch.id,
      level: ch.id === 'ignition_hall' ? 1 : 0,
      unlocked: ch.id === 'ignition_hall',
    })),
    facilities: SF_FACILITIES.map((f) => ({
      id: f.id,
      level: 0,
      built: false,
    })),
    abilities: [],
    achievements: SF_ACHIEVEMENTS.map((a) => ({
      id: a.id,
      unlocked: false,
      unlockedAt: null,
    })),
    title: SF_TITLES[0].name,
    coins: 100,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalEnergyHarvested: 0,
    totalEnergySpent: 0,
    totalForged: 0,
    totalAwakened: 0,
    totalFacilitiesBuilt: 0,
    totalFacilitiesUpgraded: 0,
    totalMaterialsCollected: 0,
    totalEventsCompleted: 0,
    totalQuestsCompleted: 0,
    streak: 0,
    bestStreak: 0,
    lastPlayDate: null,
    activeChamber: 'ignition_hall',
    dailyQuest: null,
    activeEvent: null,
    solarFlareCooldown: 0,
    forgeCountByRarity: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    },
  }
}

// =============================================================================
// Solar Forge Hook
// =============================================================================

export default function useSolarForge() {
  const stateRef = useRef<SFSolarForgeState>(sfCreateDefaultState())
  const [state, setState] = useState<SFSolarForgeState>(() => {
    if (typeof window === 'undefined') return sfCreateDefaultState()
    try {
      const saved = localStorage.getItem('solar-forge-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        const fresh = sfCreateDefaultState()
        return {
          ...fresh,
          ...parsed,
          forgeChambers: parsed.forgeChambers ?? fresh.forgeChambers,
          facilities: parsed.facilities ?? fresh.facilities,
          achievements: parsed.achievements ?? fresh.achievements,
          forgeCountByRarity: parsed.forgeCountByRarity ?? fresh.forgeCountByRarity,
        }
      }
    } catch {
      // ignore parse errors
    }
    return sfCreateDefaultState()
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem('solar-forge-save', JSON.stringify(state))
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

  const sfGetLevel = useCallback((): number => state.level, [state])
  const sfGetXp = useCallback((): number => state.xp, [state])
  const sfGetTotalXp = useCallback((): number => state.totalXp, [state])
  const sfGetCoins = useCallback((): number => state.coins, [state])
  const sfGetTotalCoinsEarned = useCallback((): number => state.totalCoinsEarned, [state])
  const sfGetTotalCoinsSpent = useCallback((): number => state.totalCoinsSpent, [state])
  const sfGetEnergy = useCallback((): number => state.energy, [state])
  const sfGetMaxEnergy = useCallback((): number => state.maxEnergy, [state])
  const sfGetMaterials = useCallback((): Record<string, number> => state.materials, [state])
  const sfGetCreations = useCallback((): SFCreatedItem[] => state.creations, [state])
  const sfGetForgeChambers = useCallback((): SFForgeChamberState[] => state.forgeChambers, [state])
  const sfGetFacilities = useCallback((): SFFacilityState[] => state.facilities, [state])
  const sfGetAbilities = useCallback((): string[] => state.abilities, [state])
  const sfGetAchievements = useCallback((): SFAchievementState[] => state.achievements, [state])
  const sfGetTitle = useCallback((): string => state.title, [state])
  const sfGetStreak = useCallback((): number => state.streak, [state])
  const sfGetBestStreak = useCallback((): number => state.bestStreak, [state])
  const sfGetActiveChamber = useCallback((): string => state.activeChamber, [state])
  const sfGetTotalForged = useCallback((): number => state.totalForged, [state])
  const sfGetTotalAwakened = useCallback((): number => state.totalAwakened, [state])
  const sfGetTotalMaterialsCollected = useCallback((): number => state.totalMaterialsCollected, [state])
  const sfGetTotalEnergyHarvested = useCallback((): number => state.totalEnergyHarvested, [state])
  const sfGetTotalEnergySpent = useCallback((): number => state.totalEnergySpent, [state])
  const sfGetTotalEventsCompleted = useCallback((): number => state.totalEventsCompleted, [state])
  const sfGetTotalQuestsCompleted = useCallback((): number => state.totalQuestsCompleted, [state]
  )
  const sfGetTotalFacilitiesBuilt = useCallback((): number => state.totalFacilitiesBuilt, [state])
  const sfGetTotalFacilitiesUpgraded = useCallback((): number => state.totalFacilitiesUpgraded, [state])
  const sfGetDailyQuest = useCallback((): SFDailyQuestState | null => state.dailyQuest, [state])
  const sfGetActiveEvent = useCallback((): SFEventState | null => state.activeEvent, [state])
  const sfGetForgeCountByRarity = useCallback((): Record<SFRarity, number> => state.forgeCountByRarity, [state])
  const sfGetState = useCallback((): Readonly<SFSolarForgeState> => Object.freeze({ ...state }), [state])
  const sfGetTodayKey = useCallback((): string => sfGenerateDayKey(Date.now()), [])
  const sfGetXpRequired = useCallback((): number => sfXpRequiredForLevel(state.level), [state.level])
  const sfGetXpProgress = useCallback((): number => {
    const needed = sfXpRequiredForLevel(state.level)
    if (needed <= 0 || needed === Infinity) return 1
    return Math.min(1, state.xp / needed)
  }, [state.xp, state.level])
  const sfGetOverallProgress = useCallback((): number => {
    return Math.min(1, state.totalXp / sfXpRequiredForLevel(SF_MAX_LEVEL))
  }, [state.totalXp])

  // ===========================================================================
  // Level / XP / Coins Modifiers
  // ===========================================================================

  const sfAddXp = useCallback((amount: number) => {
    setState((prev) => {
      const titleDef = SF_TITLES.find((t) => prev.title === t.name)
      const xpMultiplier = 1 + (titleDef?.bonusXpPercent ?? 0) / 100
      const actualXp = Math.floor(amount * xpMultiplier)
      let next = { ...prev, xp: prev.xp + actualXp, totalXp: prev.totalXp + actualXp }
      const needed = sfXpRequiredForLevel(next.level)
      while (next.xp >= needed && next.level < SF_MAX_LEVEL) {
        next = { ...next, xp: next.xp - needed, level: sfClampLevel(next.level + 1) }
        const newTitle = [...SF_TITLES].reverse().find((t) => next.level >= t.levelRequired)
        if (newTitle) next = { ...next, title: newTitle.name }
        if (next.level >= SF_MAX_LEVEL || next.xp < sfXpRequiredForLevel(next.level)) break
      }
      if (next.level >= SF_MAX_LEVEL) next.xp = 0
      return next
    })
  }, [])

  const sfSetLevel = useCallback((level: number) => {
    setState((prev) => {
      const clamped = sfClampLevel(level)
      const titleDef = [...SF_TITLES].reverse().find((t) => clamped >= t.levelRequired)
      return { ...prev, level: clamped, xp: 0, title: titleDef?.name ?? prev.title }
    })
  }, [])

  const sfAddCoins = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, coins: prev.coins + amount, totalCoinsEarned: prev.totalCoinsEarned + amount }))
  }, [])

  const sfSpendCoins = useCallback((amount: number): boolean => {
    const s = stateRef.current
    if (s.coins < amount) return false
    setState((prev) => ({ ...prev, coins: prev.coins - amount, totalCoinsSpent: prev.totalCoinsSpent + amount }))
    return true
  }, [])

  const sfCanAfford = useCallback((amount: number): boolean => {
    return stateRef.current.coins >= amount
  }, [])

  // ===========================================================================
  // Solar Energy Management
  // ===========================================================================

  const sfAddEnergy = useCallback((amount: number) => {
    setState((prev) => {
      const newEnergy = Math.min(prev.maxEnergy, prev.energy + amount)
      return { ...prev, energy: newEnergy, totalEnergyHarvested: prev.totalEnergyHarvested + amount }
    })
  }, [])

  const sfSpendEnergy = useCallback((amount: number): boolean => {
    const s = stateRef.current
    if (s.energy < amount) return false
    setState((prev) => ({
      ...prev,
      energy: prev.energy - amount,
      totalEnergySpent: prev.totalEnergySpent + amount,
    }))
    return true
  }, [])

  const sfCanAffordEnergy = useCallback((amount: number): boolean => {
    return stateRef.current.energy >= amount
  }, [])

  const sfGetEnergyPercent = useCallback((): number => {
    if (state.maxEnergy <= 0) return 0
    return Math.min(1, state.energy / state.maxEnergy)
  }, [state.energy, state.maxEnergy])

  // ===========================================================================
  // Material Management
  // ===========================================================================

  const sfGetMaterialCount = useCallback((materialId: string): number => {
    return stateRef.current.materials[materialId] ?? 0
  }, [])

  const sfHasMaterial = useCallback((materialId: string, amount: number): boolean => {
    return (stateRef.current.materials[materialId] ?? 0) >= amount
  }, [])

  const sfAddMaterial = useCallback((materialId: string, amount: number) => {
    if (amount <= 0) return
    setState((prev) => ({
      ...prev,
      materials: { ...prev.materials, [materialId]: (prev.materials[materialId] ?? 0) + amount },
      totalMaterialsCollected: prev.totalMaterialsCollected + amount,
    }))
  }, [])

  const sfRemoveMaterial = useCallback((materialId: string, amount: number): boolean => {
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

  const sfHarvestMaterial = useCallback((materialId: string): number => {
    const def = SF_MATERIALS.find((m) => m.id === materialId)
    if (!def) return 0
    if (stateRef.current.energy < 5) return 0
    const amount = def.rarity === 'legendary' ? 1 : def.rarity === 'epic' ? 1 : def.rarity === 'rare' ? 2 : def.rarity === 'uncommon' ? 2 : 3
    const chamberBonus = stateRef.current.forgeChambers.find((c) => c.id === stateRef.current.activeChamber)
    const bonusMultiplier = 1 + ((chamberBonus?.level ?? 0) * 0.05)
    const finalAmount = Math.ceil(amount * bonusMultiplier)
    const xpGain = Math.floor(def.harvestXp * bonusMultiplier)
    setState((prev) => {
      const newEnergy = Math.max(0, prev.energy - 5)
      return {
        ...prev,
        materials: { ...prev.materials, [materialId]: (prev.materials[materialId] ?? 0) + finalAmount },
        totalMaterialsCollected: prev.totalMaterialsCollected + finalAmount,
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        energy: newEnergy,
      }
    })
    return finalAmount
  }, [])

  const sfHarvestAllMaterials = useCallback((): number => {
    let totalHarvested = 0
    setState((prev) => {
      let newEnergy = prev.energy
      const newMaterials = { ...prev.materials }
      let newXp = prev.xp
      let newTotalXp = prev.totalXp
      let newTotalCollected = prev.totalMaterialsCollected
      for (const def of SF_MATERIALS) {
        if (newEnergy < 5) break
        const amount = def.rarity === 'legendary' ? 1 : def.rarity === 'epic' ? 1 : def.rarity === 'rare' ? 2 : def.rarity === 'uncommon' ? 2 : 3
        const chamberBonus = prev.forgeChambers.find((c) => c.id === prev.activeChamber)
        const bonusMultiplier = 1 + ((chamberBonus?.level ?? 0) * 0.05)
        const finalAmount = Math.ceil(amount * bonusMultiplier)
        const xpGain = Math.floor(def.harvestXp * bonusMultiplier)
        newMaterials[def.id] = (newMaterials[def.id] ?? 0) + finalAmount
        newEnergy -= 5
        newXp += xpGain
        newTotalXp += xpGain
        newTotalCollected += finalAmount
        totalHarvested += finalAmount
      }
      return { ...prev, materials: newMaterials, energy: Math.max(0, newEnergy), xp: newXp, totalXp: newTotalXp, totalMaterialsCollected: newTotalCollected }
    })
    return totalHarvested
  }, [])

  // ===========================================================================
  // Creation Forging
  // ===========================================================================

  const sfCanForge = useCallback((creationId: string): boolean => {
    const def = SF_CREATIONS.find((c) => c.id === creationId)
    if (!def) return false
    const s = stateRef.current
    if (s.level < def.requiredLevel) return false
    for (const req of def.requiredMaterials) {
      if ((s.materials[req.materialId] ?? 0) < req.amount) return false
    }
    if (s.energy < 20) return false
    return true
  }, [])

  const sfForgeWeapon = useCallback((creationId: string): boolean => {
    const def = SF_CREATIONS.find((c) => c.id === creationId)
    if (!def) return false
    if (!sfCanForge(creationId)) return false
    setState((prev) => {
      const newMaterials = { ...prev.materials }
      for (const req of def.requiredMaterials) {
        newMaterials[req.materialId] = (newMaterials[req.materialId] ?? 0) - req.amount
        if (newMaterials[req.materialId] <= 0) delete newMaterials[req.materialId]
      }
      const chamberBonus = prev.forgeChambers.find((c) => c.id === prev.activeChamber)
      const rarityMultiplier = SF_RARITIES.find((r) => r.key === def.rarity)?.xpMultiplier ?? 1
      const forgeBonusMultiplier = 1 + ((chamberBonus?.level ?? 0) * 0.05)
      const xpGain = Math.floor(30 * rarityMultiplier * forgeBonusMultiplier * def.requiredLevel)
      return {
        ...prev,
        materials: newMaterials,
        energy: Math.max(0, prev.energy - 20),
        totalEnergySpent: prev.totalEnergySpent + 20,
        creations: [...prev.creations, { creationId, awakened: false, awakenedLevel: 0, createdAt: Date.now() }],
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        totalForged: prev.totalForged + 1,
        forgeCountByRarity: { ...prev.forgeCountByRarity, [def.rarity]: prev.forgeCountByRarity[def.rarity] + 1 },
      }
    })
    return true
  }, [sfCanForge])

  const sfForgeCreation = useCallback((creationId: string): boolean => {
    return sfForgeWeapon(creationId)
  }, [sfForgeWeapon])

  // ===========================================================================
  // Creation Awakening & Training
  // ===========================================================================

  const sfAwakenCreation = useCallback((index: number): boolean => {
    const s = stateRef.current
    if (index < 0 || index >= s.creations.length) return false
    const creation = s.creations[index]
    if (creation.awakened) return false
    const def = SF_CREATIONS.find((c) => c.id === creation.creationId)
    if (!def) return false
    if (s.energy < 50) return false
    setState((prev) => {
      const newCreations = [...prev.creations]
      newCreations[index] = { ...newCreations[index], awakened: true, awakenedLevel: 1 }
      return {
        ...prev,
        creations: newCreations,
        energy: prev.energy - 50,
        totalEnergySpent: prev.totalEnergySpent + 50,
        totalAwakened: prev.totalAwakened + 1,
        xp: prev.xp + 50,
        totalXp: prev.totalXp + 50,
      }
    })
    return true
  }, [])

  const sfTrainCreation = useCallback((index: number): boolean => {
    const s = stateRef.current
    if (index < 0 || index >= s.creations.length) return false
    const creation = s.creations[index]
    if (!creation.awakened) return false
    if (s.energy < 20) return false
    setState((prev) => {
      const newCreations = [...prev.creations]
      newCreations[index] = { ...newCreations[index], awakenedLevel: Math.min(10, newCreations[index].awakenedLevel + 1) }
      return {
        ...prev,
        creations: newCreations,
        energy: prev.energy - 20,
        totalEnergySpent: prev.totalEnergySpent + 20,
        xp: prev.xp + 15,
        totalXp: prev.totalXp + 15,
      }
    })
    return true
  }, [])

  // ===========================================================================
  // Forge Chamber Management
  // ===========================================================================

  const sfUnlockChamber = useCallback((chamberId: string): boolean => {
    const def = SF_FORGE_CHAMBERS.find((c) => c.id === chamberId)
    if (!def) return false
    const s = stateRef.current
    if (s.level < def.unlockLevel) return false
    const existing = s.forgeChambers.find((c) => c.id === chamberId)
    if (existing?.unlocked) return false
    setState((prev) => ({
      ...prev,
      forgeChambers: prev.forgeChambers.map((c) =>
        c.id === chamberId ? { ...c, unlocked: true, level: 1 } : c
      ),
    }))
    return true
  }, [])

  const sfUpgradeChamber = useCallback((chamberId: string): boolean => {
    const def = SF_FORGE_CHAMBERS.find((c) => c.id === chamberId)
    if (!def) return false
    const s = stateRef.current
    const existing = s.forgeChambers.find((c) => c.id === chamberId)
    if (!existing?.unlocked) return false
    if (existing.level >= def.maxLevel) return false
    const cost = Math.floor(def.upgradeCost * Math.pow(1.5, existing.level))
    if (s.coins < cost) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      forgeChambers: prev.forgeChambers.map((c) =>
        c.id === chamberId ? { ...c, level: c.level + 1 } : c
      ),
    }))
    return true
  }, [])

  const sfSetActiveChamber = useCallback((chamberId: string): boolean => {
    const existing = stateRef.current.forgeChambers.find((c) => c.id === chamberId)
    if (!existing?.unlocked) return false
    setState((prev) => ({ ...prev, activeChamber: chamberId }))
    return true
  }, [])

  const sfGetChamberLevel = useCallback((chamberId: string): number => {
    return stateRef.current.forgeChambers.find((c) => c.id === chamberId)?.level ?? 0
  }, [])

  const sfIsChamberUnlocked = useCallback((chamberId: string): boolean => {
    return stateRef.current.forgeChambers.find((c) => c.id === chamberId)?.unlocked ?? false
  }, [])

  const sfGetUpgradeCost = useCallback((chamberId: string): number => {
    const def = SF_FORGE_CHAMBERS.find((c) => c.id === chamberId)
    if (!def) return Infinity
    const existing = stateRef.current.forgeChambers.find((c) => c.id === chamberId)
    return Math.floor(def.upgradeCost * Math.pow(1.5, existing?.level ?? 0))
  }, [])

  const sfUnlockAllAvailableChambers = useCallback(() => {
    setState((prev) => ({
      ...prev,
      forgeChambers: prev.forgeChambers.map((c) => {
        const def = SF_FORGE_CHAMBERS.find((fc) => fc.id === c.id)
        if (!def || prev.level < def.unlockLevel) return c
        if (c.unlocked) return c
        return { ...c, unlocked: true, level: 1 }
      }),
    }))
  }, [])

  // ===========================================================================
  // Facility Construction & Upgrading
  // ===========================================================================

  const sfBuildFacility = useCallback((facilityId: string): boolean => {
    const def = SF_FACILITIES.find((f) => f.id === facilityId)
    if (!def) return false
    const s = stateRef.current
    if (s.level < def.unlockLevel) return false
    if (s.coins < def.buildCost) return false
    const existing = s.facilities.find((f) => f.id === facilityId)
    if (existing?.built) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - def.buildCost,
      totalCoinsSpent: prev.totalCoinsSpent + def.buildCost,
      facilities: prev.facilities.map((f) =>
        f.id === facilityId ? { ...f, built: true, level: 1 } : f
      ),
      totalFacilitiesBuilt: prev.totalFacilitiesBuilt + 1,
      xp: prev.xp + 25,
      totalXp: prev.totalXp + 25,
    }))
    return true
  }, [])

  const sfUpgradeFacility = useCallback((facilityId: string): boolean => {
    const def = SF_FACILITIES.find((f) => f.id === facilityId)
    if (!def) return false
    const s = stateRef.current
    const existing = s.facilities.find((f) => f.id === facilityId)
    if (!existing?.built) return false
    if (existing.level >= def.maxLevel) return false
    const cost = Math.floor(def.buildCost * Math.pow(1.8, existing.level))
    if (s.coins < cost) return false
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      totalCoinsSpent: prev.totalCoinsSpent + cost,
      facilities: prev.facilities.map((f) =>
        f.id === facilityId ? { ...f, level: f.level + 1 } : f
      ),
      totalFacilitiesUpgraded: prev.totalFacilitiesUpgraded + 1,
    }))
    return true
  }, [])

  const sfGetFacilityLevel = useCallback((facilityId: string): number => {
    return stateRef.current.facilities.find((f) => f.id === facilityId)?.level ?? 0
  }, [])

  const sfIsFacilityBuilt = useCallback((facilityId: string): boolean => {
    return stateRef.current.facilities.find((f) => f.id === facilityId)?.built ?? false
  }, [])

  const sfGetFacilityUpgradeCost = useCallback((facilityId: string): number => {
    const def = SF_FACILITIES.find((f) => f.id === facilityId)
    if (!def) return Infinity
    const existing = stateRef.current.facilities.find((f) => f.id === facilityId)
    return Math.floor(def.buildCost * Math.pow(1.8, existing?.level ?? 0))
  }, [])

  const sfGetTotalFacilityEnergy = useCallback((): number => {
    return stateRef.current.facilities.reduce((total, fs) => {
      if (!fs.built) return total
      const def = SF_FACILITIES.find((f) => f.id === fs.id)
      return total + (def?.energyPerTick ?? 0) * fs.level
    }, 0)
  }, [])

  const sfGetTotalFacilityCoins = useCallback((): number => {
    return stateRef.current.facilities.reduce((total, fs) => {
      if (!fs.built) return total
      const def = SF_FACILITIES.find((f) => f.id === fs.id)
      return total + (def?.coinBonus ?? 0) * fs.level
    }, 0)
  }, [])

  // ===========================================================================
  // Ability Management
  // ===========================================================================

  const sfUnlockAbility = useCallback((abilityId: string): boolean => {
    const def = SF_ABILITIES.find((a) => a.id === abilityId)
    if (!def) return false
    const s = stateRef.current
    if (s.level < def.unlockLevel) return false
    if (s.abilities.includes(abilityId)) return false
    setState((prev) => ({ ...prev, abilities: [...prev.abilities, abilityId] }))
    return true
  }, [])

  const sfHasAbility = useCallback((abilityId: string): boolean => {
    return stateRef.current.abilities.includes(abilityId)
  }, [])

  const sfUseAbility = useCallback((abilityId: string): boolean => {
    const def = SF_ABILITIES.find((a) => a.id === abilityId)
    if (!def) return false
    const s = stateRef.current
    if (!s.abilities.includes(abilityId)) return false
    if (s.energy < def.energyCost) return false
    setState((prev) => ({
      ...prev,
      energy: prev.energy - def.energyCost,
      totalEnergySpent: prev.totalEnergySpent + def.energyCost,
    }))
    return true
  }, [])

  // ===========================================================================
  // Solar Flare Event System
  // ===========================================================================

  const sfTriggerEvent = useCallback((eventId: string): boolean => {
    const def = SF_EVENTS.find((e) => e.id === eventId)
    if (!def) return false
    const s = stateRef.current
    if (s.level < def.unlockLevel) return false
    if (s.activeEvent) return false
    setState((prev) => ({
      ...prev,
      activeEvent: { id: eventId, active: true, startedAt: Date.now(), completionCount: prev.activeEvent?.completionCount ?? 0 },
    }))
    return true
  }, [])

  const sfCompleteEvent = useCallback((): { coins: number; xp: number; energy: number } | null => {
    const s = stateRef.current
    if (!s.activeEvent) return null
    const def = SF_EVENTS.find((e) => e.id === s.activeEvent.id)
    if (!def) return null
    const coins = def.coinReward
    const xp = def.xpReward
    const energy = def.energyReward
    setState((prev) => ({
      ...prev,
      coins: prev.coins + coins,
      totalCoinsEarned: prev.totalCoinsEarned + coins,
      xp: prev.xp + xp,
      totalXp: prev.totalXp + xp,
      energy: Math.min(prev.maxEnergy, prev.energy + energy),
      totalEnergyHarvested: prev.totalEnergyHarvested + energy,
      totalEventsCompleted: prev.totalEventsCompleted + 1,
      activeEvent: null,
    }))
    return { coins, xp, energy }
  }, [])

  const sfCancelEvent = useCallback((): boolean => {
    const s = stateRef.current
    if (!s.activeEvent) return false
    setState((prev) => ({ ...prev, activeEvent: null }))
    return true
  }, [])

  // ===========================================================================
  // Daily Solar Ignition Quest
  // ===========================================================================

  const sfGenerateDailyQuest = useCallback((): SFDailyQuestState | null => {
    const todayKey = sfGenerateDayKey(Date.now())
    const s = stateRef.current
    if (s.dailyQuest && s.dailyQuest.dateKey === todayKey) return s.dailyQuest
    const questPool = SF_DAILY_QUESTS.filter((q) => s.level >= 1)
    if (questPool.length === 0) return null
    const dayIndex = new Date().getDate() % questPool.length
    const selected = questPool[dayIndex]
    return { questId: selected.id, progress: 0, completed: false, dateKey: todayKey }
  }, [])

  const sfInitDailyQuest = useCallback(() => {
    const quest = sfGenerateDailyQuest()
    if (quest) {
      setState((prev) => ({ ...prev, dailyQuest: quest }))
    }
  }, [sfGenerateDailyQuest])

  const sfAdvanceQuest = useCallback((amount: number = 1) => {
    setState((prev) => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev
      const newProgress = Math.min(prev.dailyQuest.progress + amount, SF_DAILY_QUESTS.find((q) => q.id === prev.dailyQuest!.questId)?.targetValue ?? 100)
      const completed = newProgress >= (SF_DAILY_QUESTS.find((q) => q.id === prev.dailyQuest!.questId)?.targetValue ?? 100)
      return { ...prev, dailyQuest: { ...prev.dailyQuest!, progress: newProgress, completed } }
    })
  }, [])

  const sfClaimQuestReward = useCallback((): { coins: number; xp: number; energy: number } | null => {
    const s = stateRef.current
    if (!s.dailyQuest || !s.dailyQuest.completed) return null
    const def = SF_DAILY_QUESTS.find((q) => q.id === s.dailyQuest.questId)
    if (!def) return null
    setState((prev) => ({
      ...prev,
      coins: prev.coins + def.rewardCoins,
      totalCoinsEarned: prev.totalCoinsEarned + def.rewardCoins,
      xp: prev.xp + def.rewardXp,
      totalXp: prev.totalXp + def.rewardXp,
      energy: Math.min(prev.maxEnergy, prev.energy + def.energyBonus),
      totalEnergyHarvested: prev.totalEnergyHarvested + def.energyBonus,
      totalQuestsCompleted: prev.totalQuestsCompleted + 1,
      dailyQuest: { ...prev.dailyQuest!, completed: false },
    }))
    return { coins: def.rewardCoins, xp: def.rewardXp, energy: def.energyBonus }
  }, [])

  // ===========================================================================
  // Streak Management
  // ===========================================================================

  const sfUpdateStreak = useCallback(() => {
    const todayKey = sfGenerateDayKey(Date.now())
    setState((prev) => {
      if (prev.lastPlayDate === todayKey) return prev
      const yesterday = new Date(Date.now() - 86400000)
      const yesterdayKey = sfGenerateDayKey(yesterday.getTime())
      const newStreak = prev.lastPlayDate === yesterdayKey ? prev.streak + 1 : 1
      const newBest = Math.max(prev.bestStreak, newStreak)
      return { ...prev, streak: newStreak, bestStreak: newBest, lastPlayDate: todayKey }
    })
  }, [])

  // ===========================================================================
  // Achievement Checking
  // ===========================================================================

  const sfCheckAchievements = useCallback((): SFAchievementDef[] => {
    const s = stateRef.current
    const newlyUnlocked: SFAchievementDef[] = []
    setState((prev) => {
      const newAchievements = prev.achievements.map((a) => {
        if (a.unlocked) return a
        const def = SF_ACHIEVEMENTS.find((ad) => ad.id === a.id)
        if (!def) return a
        let current = 0
        if (def.conditionKey === 'totalMaterialsCollected') current = prev.totalMaterialsCollected
        else if (def.conditionKey === 'totalForged') current = prev.totalForged
        else if (def.conditionKey === 'totalAwakened') current = prev.totalAwakened
        else if (def.conditionKey === 'totalFacilitiesBuilt') current = prev.totalFacilitiesBuilt
        else if (def.conditionKey === 'totalEventsCompleted') current = prev.totalEventsCompleted
        else if (def.conditionKey === 'totalQuestsCompleted') current = prev.totalQuestsCompleted
        else if (def.conditionKey === 'bestStreak') current = prev.bestStreak
        else if (def.conditionKey === 'totalEnergyHarvested') current = prev.totalEnergyHarvested
        else if (def.conditionKey === 'level') current = prev.level
        if (current >= def.targetValue) {
          newlyUnlocked.push(def)
          return { ...a, unlocked: true, unlockedAt: Date.now() }
        }
        return a
      })
      const totalRewardXp = newlyUnlocked.reduce((sum, a) => sum + a.rewardXp, 0)
      const totalRewardCoins = newlyUnlocked.reduce((sum, a) => sum + a.rewardCoins, 0)
      return {
        ...prev,
        achievements: newAchievements,
        xp: prev.xp + totalRewardXp,
        totalXp: prev.totalXp + totalRewardXp,
        coins: prev.coins + totalRewardCoins,
        totalCoinsEarned: prev.totalCoinsEarned + totalRewardCoins,
      }
    })
    return newlyUnlocked
  }, [])

  // ===========================================================================
  // Query Helpers — Static Data Lookups
  // ===========================================================================

  const sfGetMaterialDef = useCallback((id: string): SFMaterialDef | undefined => {
    return SF_MATERIALS.find((m) => m.id === id)
  }, [])

  const sfGetCreationDef = useCallback((id: string): SFCreationDef | undefined => {
    return SF_CREATIONS.find((c) => c.id === id)
  }, [])

  const sfGetChamberDef = useCallback((id: string): SFForgeChamberDef | undefined => {
    return SF_FORGE_CHAMBERS.find((c) => c.id === id)
  }, [])

  const sfGetFacilityDef = useCallback((id: string): SFFacilityDef | undefined => {
    return SF_FACILITIES.find((f) => f.id === id)
  }, [])

  const sfGetAbilityDef = useCallback((id: string): SFAbilityDef | undefined => {
    return SF_ABILITIES.find((a) => a.id === id)
  }, [])

  const sfGetEventDef = useCallback((id: string): SFEventDef | undefined => {
    return SF_EVENTS.find((e) => e.id === id)
  }, [])

  const sfGetRarityDef = useCallback((rarity: SFRarity): SFRarityDef | undefined => {
    return SF_RARITIES.find((r) => r.key === rarity)
  }, [])

  const sfGetRarityColor = useCallback((rarity: SFRarity): string => {
    return SF_RARITIES.find((r) => r.key === rarity)?.color ?? '#FFFFFF'
  }, [])

  const sfGetRarityLabel = useCallback((rarity: SFRarity): string => {
    return SF_RARITIES.find((r) => r.key === rarity)?.label ?? 'Unknown'
  }, [])

  const sfGetAllMaterials = useCallback((): SFMaterialDef[] => SF_MATERIALS, [])
  const sfGetAllCreations = useCallback((): SFCreationDef[] => SF_CREATIONS, [])
  const sfGetAllForgeChambers = useCallback((): SFForgeChamberDef[] => SF_FORGE_CHAMBERS, [])
  const sfGetAllFacilities = useCallback((): SFFacilityDef[] => SF_FACILITIES, [])
  const sfGetAllAbilities = useCallback((): SFAbilityDef[] => SF_ABILITIES, [])
  const sfGetAllEvents = useCallback((): SFEventDef[] => SF_EVENTS, [])
  const sfGetAllTitles = useCallback((): SFTitleDef[] => SF_TITLES, [])
  const sfGetAllAchievements = useCallback((): SFAchievementDef[] => SF_ACHIEVEMENTS, [])
  const sfGetAllDailyQuests = useCallback((): SFDailyQuestDef[] => SF_DAILY_QUESTS, [])
  const sfGetAllRarities = useCallback((): SFRarityDef[] => SF_RARITIES, [])

  // ===========================================================================
  // Query Helpers — Filtered Views
  // ===========================================================================

  const sfGetCreationsByRarity = useCallback((rarity: SFRarity): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => c.rarity === rarity)
  }, [])

  const sfGetCreationsByType = useCallback((type: SFCreationType): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => c.type === type)
  }, [])

  const sfGetCreationsByLevel = useCallback((maxLevel: number): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => c.requiredLevel <= maxLevel)
  }, [])

  const sfGetMaterialsByRarity = useCallback((rarity: SFRarity): SFMaterialDef[] => {
    return SF_MATERIALS.filter((m) => m.rarity === rarity)
  }, [])

  const sfGetMaterialsByCategory = useCallback((category: SFMaterialCategory): SFMaterialDef[] => {
    return SF_MATERIALS.filter((m) => m.category === category)
  }, [])

  const sfGetFacilitiesByType = useCallback((type: SFFacilityType): SFFacilityDef[] => {
    return SF_FACILITIES.filter((f) => f.type === type)
  }, [])

  const sfGetAbilitiesByRarity = useCallback((rarity: SFRarity): SFAbilityDef[] => {
    return SF_ABILITIES.filter((a) => a.rarity === rarity)
  }, [])

  const sfGetAbilitiesByType = useCallback((type: 'ability' | 'enchantment'): SFAbilityDef[] => {
    return SF_ABILITIES.filter((a) => a.type === type)
  }, [])

  const sfGetUnlockedAchievementDefs = useCallback((): SFAchievementDef[] => {
    return SF_ACHIEVEMENTS.filter((a) => state.achievements.find((sa) => sa.id === a.id)?.unlocked)
  }, [state.achievements])

  const sfGetLockedAchievementDefs = useCallback((): SFAchievementDef[] => {
    return SF_ACHIEVEMENTS.filter((a) => !state.achievements.find((sa) => sa.id === a.id)?.unlocked)
  }, [state.achievements])

  const sfGetUnlockedChambers = useCallback((): SFForgeChamberState[] => {
    return state.forgeChambers.filter((c) => c.unlocked)
  }, [state.forgeChambers])

  const sfGetLockedChambers = useCallback((): SFForgeChamberState[] => {
    return state.forgeChambers.filter((c) => !c.unlocked)
  }, [state.forgeChambers])

  const sfGetBuiltFacilities = useCallback((): SFFacilityState[] => {
    return state.facilities.filter((f) => f.built)
  }, [state.facilities])

  const sfGetUnbuiltFacilities = useCallback((): SFFacilityState[] => {
    return state.facilities.filter((f) => !f.built)
  }, [state.facilities])

  const sfGetAvailableAbilities = useCallback((): SFAbilityDef[] => {
    return SF_ABILITIES.filter((a) => state.level >= a.unlockLevel)
  }, [state.level])

  const sfGetLockedAbilities = useCallback((): SFAbilityDef[] => {
    return SF_ABILITIES.filter((a) => state.level < a.unlockLevel)
  }, [state.level])

  const sfGetAvailableEvents = useCallback((): SFEventDef[] => {
    return SF_EVENTS.filter((e) => state.level >= e.unlockLevel)
  }, [state.level])

  const sfGetAvailableCreations = useCallback((): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => state.level >= c.requiredLevel)
  }, [state.level])

  const sfGetCraftableCreations = useCallback((): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => sfCanForge(c.id))
  }, [sfCanForge])

  const sfGetUncraftableCreations = useCallback((): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => !sfCanForge(c.id))
  }, [sfCanForge])

  // ===========================================================================
  // Query Helpers — Computed Stats
  // ===========================================================================

  const sfGetTotalCreationPower = useCallback((): number => {
    return state.creations.reduce((total, c) => {
      const def = SF_CREATIONS.find((cd) => cd.id === c.creationId)
      if (!def) return total
      const awakeningBonus = c.awakened ? 1 + c.awakenedLevel * 0.15 : 1
      return total + Math.floor(def.power * awakeningBonus)
    }, 0)
  }, [state.creations])

  const sfGetTotalSolarDamage = useCallback((): number => {
    return state.creations.reduce((total, c) => {
      const def = SF_CREATIONS.find((cd) => cd.id === c.creationId)
      if (!def) return total
      const awakeningBonus = c.awakened ? 1 + c.awakenedLevel * 0.15 : 1
      return total + Math.floor(def.bonusSolarDamage * awakeningBonus)
    }, 0)
  }, [state.creations])

  const sfGetTotalEnergyGeneration = useCallback((): number => {
    return state.creations.reduce((total, c) => {
      const def = SF_CREATIONS.find((cd) => cd.id === c.creationId)
      if (!def) return total
      const awakeningBonus = c.awakened ? 1 + c.awakenedLevel * 0.15 : 1
      return total + Math.floor(def.bonusEnergyGen * awakeningBonus)
    }, 0)
  }, [state.creations])

  const sfGetCreationCount = useCallback((): number => state.creations.length, [state.creations])
  const sfGetAwakenedCount = useCallback((): number => state.creations.filter((c) => c.awakened).length, [state.creations])
  const sfGetUnlockedChamberCount = useCallback((): number => state.forgeChambers.filter((c) => c.unlocked).length, [state.forgeChambers])
  const sfGetBuiltFacilityCount = useCallback((): number => state.facilities.filter((f) => f.built).length, [state.facilities])
  const sfGetUnlockedAbilityCount = useCallback((): number => state.abilities.length, [state.abilities])
  const sfGetUnlockedAchievementCount = useCallback((): number => state.achievements.filter((a) => a.unlocked).length, [state.achievements])

  const sfGetNextTitle = useCallback((): SFTitleDef | undefined => {
    const current = SF_TITLES.find((t) => t.name === state.title)
    if (!current) return SF_TITLES[0]
    const idx = SF_TITLES.indexOf(current)
    return SF_TITLES[idx + 1]
  }, [state.title])

  const sfGetCurrentTitleInfo = useCallback((): SFTitleDef | undefined => {
    return SF_TITLES.find((t) => t.name === state.title)
  }, [state.title])

  const sfGetMaterialTotalCount = useCallback((): number => {
    return Object.values(state.materials).reduce((sum, count) => sum + count, 0)
  }, [state.materials])

  const sfGetMaterialInventoryList = useCallback((): { materialId: string; amount: number; def: SFMaterialDef }[] => {
    return Object.entries(state.materials)
      .filter(([, amount]) => amount > 0)
      .map(([materialId, amount]) => {
        const def = SF_MATERIALS.find((m) => m.id === materialId)
        return { materialId, amount, def: def! }
      })
      .filter((item) => item.def !== undefined)
  }, [state.materials])

  const sfGetCreationCostMaterials = useCallback((creationId: string): { materialId: string; amount: number; have: number; sufficient: boolean }[] => {
    const def = SF_CREATIONS.find((c) => c.id === creationId)
    if (!def) return []
    return def.requiredMaterials.map((req) => ({
      materialId: req.materialId,
      amount: req.amount,
      have: stateRef.current.materials[req.materialId] ?? 0,
      sufficient: (stateRef.current.materials[req.materialId] ?? 0) >= req.amount,
    }))
  }, [])

  const sfHasCreation = useCallback((creationId: string): boolean => {
    return state.creations.some((c) => c.creationId === creationId)
  }, [state.creations])

  const sfGetCreationCountById = useCallback((creationId: string): number => {
    return state.creations.filter((c) => c.creationId === creationId).length
  }, [state.creations])

  // ===========================================================================
  // Completion Percentages
  // ===========================================================================

  const sfGetCollectionCompletionPercent = useCallback((): number => {
    const uniqueCreations = new Set(state.creations.map((c) => c.creationId)).size
    return SF_CREATIONS.length > 0 ? uniqueCreations / SF_CREATIONS.length : 0
  }, [state.creations])

  const sfGetMaterialCompletionPercent = useCallback((): number => {
    const ownedMaterials = Object.keys(state.materials).filter((k) => (state.materials[k] ?? 0) > 0).length
    return SF_MATERIALS.length > 0 ? ownedMaterials / SF_MATERIALS.length : 0
  }, [state.materials])

  const sfGetFacilityCompletionPercent = useCallback((): number => {
    const builtCount = state.facilities.filter((f) => f.built).length
    return SF_FACILITIES.length > 0 ? builtCount / SF_FACILITIES.length : 0
  }, [state.facilities])

  const sfGetChamberCompletionPercent = useCallback((): number => {
    const unlockedCount = state.forgeChambers.filter((c) => c.unlocked).length
    return SF_FORGE_CHAMBERS.length > 0 ? unlockedCount / SF_FORGE_CHAMBERS.length : 0
  }, [state.forgeChambers])

  const sfGetAbilityCompletionPercent = useCallback((): number => {
    return SF_ABILITIES.length > 0 ? state.abilities.length / SF_ABILITIES.length : 0
  }, [state.abilities])

  const sfGetAchievementCompletionPercent = useCallback((): number => {
    const unlockedCount = state.achievements.filter((a) => a.unlocked).length
    return SF_ACHIEVEMENTS.length > 0 ? unlockedCount / SF_ACHIEVEMENTS.length : 0
  }, [state.achievements])

  const sfGetOverallCompletionPercent = useCallback((): number => {
    const collection = sfGetCollectionCompletionPercent()
    const material = sfGetMaterialCompletionPercent()
    const facility = sfGetFacilityCompletionPercent()
    const chamber = sfGetChamberCompletionPercent()
    const ability = sfGetAbilityCompletionPercent()
    const achievement = sfGetAchievementCompletionPercent()
    return (collection + material + facility + chamber + ability + achievement) / 6
  }, [sfGetCollectionCompletionPercent, sfGetMaterialCompletionPercent, sfGetFacilityCompletionPercent, sfGetChamberCompletionPercent, sfGetAbilityCompletionPercent, sfGetAchievementCompletionPercent])

  // ===========================================================================
  // Sorted & Advanced Queries
  // ===========================================================================

  const sfGetCreationsSortedByPower = useCallback((): SFCreationDef[] => {
    return [...SF_CREATIONS].sort((a, b) => b.power - a.power)
  }, [])

  const sfGetCreationsSortedBySpeed = useCallback((): SFCreationDef[] => {
    return [...SF_CREATIONS].sort((a, b) => b.speed - a.speed)
  }, [])

  const sfGetMaterialsSortedByHarvestXp = useCallback((): SFMaterialDef[] => {
    return [...SF_MATERIALS].sort((a, b) => b.harvestXp - a.harvestXp)
  }, [])

  const sfGetFacilitiesSortedByEnergy = useCallback((): SFFacilityDef[] => {
    return [...SF_FACILITIES].sort((a, b) => b.energyPerTick - a.energyPerTick)
  }, [])

  const sfGetAbilitiesSortedByPower = useCallback((): SFAbilityDef[] => {
    return [...SF_ABILITIES].sort((a, b) => b.power - a.power)
  }, [])

  const sfGetCreationsAbovePower = useCallback((minPower: number): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => c.power >= minPower)
  }, [])

  const sfGetCreationsAboveLevel = useCallback((minLevel: number): SFCreationDef[] => {
    return SF_CREATIONS.filter((c) => c.requiredLevel >= minLevel)
  }, [])

  const sfGetMaterialsAboveRarity = useCallback((minRarity: SFRarity): SFMaterialDef[] => {
    const order: SFRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary']
    const minIndex = order.indexOf(minRarity)
    return SF_MATERIALS.filter((m) => order.indexOf(m.rarity) >= minIndex)
  }, [])

  const sfGetForgedCreationsSortedByDate = useCallback((): SFCreatedItem[] => {
    return [...state.creations].sort((a, b) => b.createdAt - a.createdAt)
  }, [state.creations])

  const sfGetRarestForgedCreation = useCallback((): SFCreationDef | undefined => {
    const order: SFRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common']
    for (const rarity of order) {
      const found = state.creations.find((c) => {
        const def = SF_CREATIONS.find((cd) => cd.id === c.creationId)
        return def?.rarity === rarity
      })
      if (found) return SF_CREATIONS.find((cd) => cd.id === found.creationId)
    }
    return undefined
  }, [state.creations])

  const sfGetMostPowerfulCreation = useCallback((): SFCreationDef | undefined => {
    let best: SFCreationDef | undefined
    let bestPower = 0
    for (const c of state.creations) {
      const def = SF_CREATIONS.find((cd) => cd.id === c.creationId)
      if (def && def.power > bestPower) {
        bestPower = def.power
        best = def
      }
    }
    return best
  }, [state.creations])

  // ===========================================================================
  // Reset
  // ===========================================================================

  const sfResetProgress = useCallback(() => {
    const fresh = sfCreateDefaultState()
    setState(fresh)
  }, [])

  // ===========================================================================
  // Return
  // ===========================================================================

  return {
    // Simple Getters
    sfGetLevel,
    sfGetXp,
    sfGetTotalXp,
    sfGetCoins,
    sfGetTotalCoinsEarned,
    sfGetTotalCoinsSpent,
    sfGetEnergy,
    sfGetMaxEnergy,
    sfGetMaterials,
    sfGetCreations,
    sfGetForgeChambers,
    sfGetFacilities,
    sfGetAbilities,
    sfGetAchievements,
    sfGetTitle,
    sfGetStreak,
    sfGetBestStreak,
    sfGetActiveChamber,
    sfGetTotalForged,
    sfGetTotalAwakened,
    sfGetTotalMaterialsCollected,
    sfGetTotalEnergyHarvested,
    sfGetTotalEnergySpent,
    sfGetTotalEventsCompleted,
    sfGetTotalQuestsCompleted,
    sfGetTotalFacilitiesBuilt,
    sfGetTotalFacilitiesUpgraded,
    sfGetDailyQuest,
    sfGetActiveEvent,
    sfGetForgeCountByRarity,
    sfGetState,
    sfGetTodayKey,
    sfGetXpRequired,
    sfGetXpProgress,
    sfGetOverallProgress,
    sfGetEnergyPercent,
    sfGetMaterialCount,
    // Level / XP / Coins
    sfAddXp,
    sfSetLevel,
    sfAddCoins,
    sfSpendCoins,
    sfCanAfford,
    // Energy
    sfAddEnergy,
    sfSpendEnergy,
    sfCanAffordEnergy,
    // Materials
    sfHasMaterial,
    sfAddMaterial,
    sfRemoveMaterial,
    sfHarvestMaterial,
    sfHarvestAllMaterials,
    // Creation Forging
    sfCanForge,
    sfForgeWeapon,
    sfForgeCreation,
    // Awakening & Training
    sfAwakenCreation,
    sfTrainCreation,
    // Forge Chamber Management
    sfUnlockChamber,
    sfUpgradeChamber,
    sfSetActiveChamber,
    sfGetChamberLevel,
    sfIsChamberUnlocked,
    sfGetUpgradeCost,
    sfUnlockAllAvailableChambers,
    // Facility Management
    sfBuildFacility,
    sfUpgradeFacility,
    sfGetFacilityLevel,
    sfIsFacilityBuilt,
    sfGetFacilityUpgradeCost,
    sfGetTotalFacilityEnergy,
    sfGetTotalFacilityCoins,
    // Abilities
    sfUnlockAbility,
    sfHasAbility,
    sfUseAbility,
    // Events
    sfTriggerEvent,
    sfCompleteEvent,
    sfCancelEvent,
    // Daily Quests
    sfInitDailyQuest,
    sfAdvanceQuest,
    sfClaimQuestReward,
    // Streak
    sfUpdateStreak,
    // Achievements
    sfCheckAchievements,
    // Static Data Lookups
    sfGetMaterialDef,
    sfGetCreationDef,
    sfGetChamberDef,
    sfGetFacilityDef,
    sfGetAbilityDef,
    sfGetEventDef,
    sfGetRarityDef,
    sfGetRarityColor,
    sfGetRarityLabel,
    sfGetAllMaterials,
    sfGetAllCreations,
    sfGetAllForgeChambers,
    sfGetAllFacilities,
    sfGetAllAbilities,
    sfGetAllEvents,
    sfGetAllTitles,
    sfGetAllAchievements,
    sfGetAllDailyQuests,
    sfGetAllRarities,
    // Filtered Views
    sfGetCreationsByRarity,
    sfGetCreationsByType,
    sfGetCreationsByLevel,
    sfGetMaterialsByRarity,
    sfGetMaterialsByCategory,
    sfGetFacilitiesByType,
    sfGetAbilitiesByRarity,
    sfGetAbilitiesByType,
    sfGetUnlockedAchievementDefs,
    sfGetLockedAchievementDefs,
    sfGetUnlockedChambers,
    sfGetLockedChambers,
    sfGetBuiltFacilities,
    sfGetUnbuiltFacilities,
    sfGetAvailableAbilities,
    sfGetLockedAbilities,
    sfGetAvailableEvents,
    sfGetAvailableCreations,
    sfGetCraftableCreations,
    sfGetUncraftableCreations,
    // Computed Stats
    sfGetTotalCreationPower,
    sfGetTotalSolarDamage,
    sfGetTotalEnergyGeneration,
    sfGetCreationCount,
    sfGetAwakenedCount,
    sfGetUnlockedChamberCount,
    sfGetBuiltFacilityCount,
    sfGetUnlockedAbilityCount,
    sfGetUnlockedAchievementCount,
    sfGetNextTitle,
    sfGetCurrentTitleInfo,
    sfGetMaterialTotalCount,
    sfGetMaterialInventoryList,
    sfGetCreationCostMaterials,
    sfHasCreation,
    sfGetCreationCountById,
    // Completion
    sfGetCollectionCompletionPercent,
    sfGetMaterialCompletionPercent,
    sfGetFacilityCompletionPercent,
    sfGetChamberCompletionPercent,
    sfGetAbilityCompletionPercent,
    sfGetAchievementCompletionPercent,
    sfGetOverallCompletionPercent,
    // Sorted & Advanced Queries
    sfGetCreationsSortedByPower,
    sfGetCreationsSortedBySpeed,
    sfGetMaterialsSortedByHarvestXp,
    sfGetFacilitiesSortedByEnergy,
    sfGetAbilitiesSortedByPower,
    sfGetCreationsAbovePower,
    sfGetCreationsAboveLevel,
    sfGetMaterialsAboveRarity,
    sfGetForgedCreationsSortedByDate,
    sfGetRarestForgedCreation,
    sfGetMostPowerfulCreation,
    // Reset
    sfResetProgress,
  }
}

// =============================================================================
// Module-level Solar Forge Tips
// =============================================================================

export const SF_FORGE_TIPS: string[] = [
  'Harvest materials during Solar Flare events for bonus yields.',
  'The Corona Chamber unlocks at level 5 with a harvesting bonus.',
  'Awakened creations gain 15% power per awakening level.',
  'Build Solar Collectors early for passive energy generation.',
  'Legendary creations require Sol\'s Heart, unlocked at level 46.',
  'Daily Solar Ignition quests reset every day — don\'t forget to claim!',
  'Plasma materials are essential for epic-tier beast creations.',
  'The Infinity Titan requires the rare Infinity Core material.',
  'Upgrade your facilities to boost energy and coin income.',
  'Maintain your daily streak for increasing rewards.',
  'Solar Deity title at level 50 grants +50% XP and +40% coins.',
  'Quantum Fiber is needed for many rare and epic creations.',
  'Dark Plasma Dragons are among the most powerful epic beasts.',
  'The Eclipse Vault only activates at level 38 but grants massive bonuses.',
  'Use abilities strategically — energy is a limited resource.',
]
