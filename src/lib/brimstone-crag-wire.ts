'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// =============================================================================
// Brimstone Crag (硫磺峭壁) — Sulfur Demon Summoning & Furnace Management Wire
// Summon sulfur demons, ignite furnaces, build crag structures, master brimstone
// abilities, collect legendary artifacts, and survive random crag events.
// =============================================================================

// =============================================================================
// Type Definitions
// =============================================================================

export type BrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BrDemonSpecies =
  | 'fire_imp'
  | 'ash_golem'
  | 'magma_hound'
  | 'sulfur_wyrm'
  | 'ember_wraith'
  | 'smoke_specter'
  | 'lava_titan';

export type BrAbilityType = 'offensive' | 'defensive' | 'utility' | 'summon';

export interface BrRarityDef {
  key: BrRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface BrColorTheme {
  sulfurYellow: string;
  lavaRed: string;
  ashGray: string;
  brimstoneOrange: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  danger: string;
  success: string;
  warning: string;
  info: string;
}

export interface BrDemonDef {
  id: string;
  name: string;
  species: BrDemonSpecies;
  rarity: BrRarity;
  description: string;
  emoji: string;
  power: number;
  summonCost: number;
  xpReward: number;
}

export interface BrFurnaceDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
}

export interface BrMaterialDef {
  id: string;
  name: string;
  rarity: BrRarity;
  description: string;
  emoji: string;
  smeltXp: number;
  stackSize: number;
}

export interface BrStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  buildCost: number;
  upgradeCost: number;
  bonusType: string;
  bonusPerLevel: number;
  requiredLevel: number;
}

export interface BrAbilityDef {
  id: string;
  name: string;
  type: BrAbilityType;
  power: number;
  cooldown: number;
  description: string;
  emoji: string;
  unlockLevel: number;
}

export interface BrAchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
}

export interface BrTitleDef {
  name: string;
  levelRequired: number;
  description: string;
}

export interface BrArtifactDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  rarity: BrRarity;
  bonusType: string;
  bonusValue: number;
  lore: string;
}

export interface BrCragEventDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  effectType: string;
  effectValue: number;
  duration: number;
}

export interface BrDemonState {
  owned: boolean;
  summonedAt: number | null;
  power: number;
  encounterCount: number;
}

export interface BrFurnaceState {
  ignited: boolean;
  level: number;
  resourcesSmelted: number;
  lastIgnitedAt: number | null;
}

export interface BrInventoryItem {
  materialId: string;
  amount: number;
}

export interface BrStructureState {
  built: boolean;
  level: number;
  builtAt: number | null;
}

export type BrEventType = 'positive' | 'negative' | 'neutral';

export type BrStructureBonusType =
  | 'sulfur_yield'
  | 'ash_yield'
  | 'demon_power'
  | 'alert_range'
  | 'furnace_speed'
  | 'attack_bonus'
  | 'defense'
  | 'heat_capacity'
  | 'combat_xp'
  | 'research_speed'
  | 'craft_quality'
  | 'herb_yield'
  | 'travel_speed'
  | 'knowledge_bonus'
  | 'recycle_rate'
  | 'trade_bonus'
  | 'heal_rate'
  | 'eruption_warning'
  | 'summon_power'
  | 'vision_range'
  | 'portal_power'
  | 'forge_power'
  | 'defense_bonus'
  | 'all_bonus'
  | 'ruler_power';

export type BrEventEffectType =
  | 'material_bonus'
  | 'encounter_rate'
  | 'speed_penalty'
  | 'furnace_boost'
  | 'structure_damage'
  | 'rare_demon_chance'
  | 'material_shower'
  | 'unlock_hidden'
  | 'heal_all'
  | 'obsidian_bonus'
  | 'demon_penalty'
  | 'sulfur_bonus';

export interface BrBrimstoneCragState {
  brDemons: Record<string, BrDemonState>;
  brFurnaces: Record<string, BrFurnaceState>;
  brStructures: Record<string, BrStructureState>;
  brInventory: BrInventoryItem[];
  brArtifacts: string[];
  brAchievements: string[];
  brTitle: string;
  brEvents: string[];
  brActiveEventId: string | null;
  brActiveEventEnd: number | null;
  brLevel: number;
  brXp: number;
  brCoins: number;
  brStats: {
    totalSummoned: number;
    totalSmelted: number;
    totalStructuresBuilt: number;
    totalArtifactsActivated: number;
    totalEventsSurvived: number;
    totalCoinsEarned: number;
    totalCoinsSpent: number;
    totalXpEarned: number;
    totalDemonPowerGained: number;
    totalAbilityUses: number;
  };
}

// =============================================================================
// Seeded PRNG
// =============================================================================

function brMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function brGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export const BR_MAX_LEVEL = 50;

function brXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= BR_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.12));
}

function brClampLevel(lvl: number): number {
  return Math.max(1, Math.min(BR_MAX_LEVEL, lvl));
}

// =============================================================================
// Constants (BR_ prefix) — Rarity & Color Theme
// =============================================================================

export const BR_RARITY_COMMON: BrRarity = 'common';
export const BR_RARITY_UNCOMMON: BrRarity = 'uncommon';
export const BR_RARITY_RARE: BrRarity = 'rare';
export const BR_RARITY_EPIC: BrRarity = 'epic';
export const BR_RARITY_LEGENDARY: BrRarity = 'legendary';

export const BR_RARITIES: BrRarityDef[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#FFD700', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#FF8C00', xpMultiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#FF4500', xpMultiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#DC143C', xpMultiplier: 7 },
];

export const BR_COLORS: BrColorTheme = {
  sulfurYellow: '#FFD700',
  lavaRed: '#FF4500',
  ashGray: '#696969',
  brimstoneOrange: '#FF8C00',
  background: '#1A0A00',
  surface: '#2D1500',
  text: '#FFF3E0',
  textMuted: '#8D6E63',
  danger: '#FF1744',
  success: '#00E676',
  warning: '#FFD600',
  info: '#448AFF',
};

export const BR_SPECIES: BrDemonSpecies[] = [
  'fire_imp',
  'ash_golem',
  'magma_hound',
  'sulfur_wyrm',
  'ember_wraith',
  'smoke_specter',
  'lava_titan',
];

// =============================================================================
// Constants: 35 Sulfur Demons (5 rarity tiers × 7 species)
// =============================================================================

export const BR_DEMONS: BrDemonDef[] = [
  // ---- Common (7) ----
  { id: 'fire_imp_ember', name: 'Ember Imp', species: 'fire_imp', rarity: 'common', description: 'A small mischievous imp wreathed in dying embers that follows travelers through the crag', emoji: '😈', power: 12, summonCost: 10, xpReward: 15 },
  { id: 'ash_golem_pebble', name: 'Pebble Golem', species: 'ash_golem', rarity: 'common', description: 'A crude golem formed from compacted volcanic ash, slow but incredibly sturdy', emoji: '🗿', power: 18, summonCost: 15, xpReward: 18 },
  { id: 'magma_hound_pup', name: 'Magma Pup', species: 'magma_hound', rarity: 'common', description: 'A young hound with paws of cooling lava that leaves scorched pawprints everywhere', emoji: '🐕', power: 14, summonCost: 12, xpReward: 16 },
  { id: 'sulfur_wyrm_wriggler', name: 'Sulfur Wriggler', species: 'sulfur_wyrm', rarity: 'common', description: 'A tiny burrowing worm that exudes toxic yellow gas as it tunnels', emoji: '🪱', power: 10, summonCost: 8, xpReward: 12 },
  { id: 'ember_wraith_flicker', name: 'Flicker Wraith', species: 'ember_wraith', rarity: 'common', description: 'A barely visible spirit that haunts dying campfires on the crag', emoji: '👻', power: 8, summonCost: 10, xpReward: 14 },
  { id: 'smoke_specter_haze', name: 'Haze Specter', species: 'smoke_specter', rarity: 'common', description: 'A wisp of volcanic smoke given malevolent consciousness', emoji: '💨', power: 9, summonCost: 10, xpReward: 13 },
  { id: 'lava_titan_shard', name: 'Titan Shard', species: 'lava_titan', rarity: 'common', description: 'A fragment of a greater titan, animated by residual geothermal energy', emoji: '☄️', power: 20, summonCost: 18, xpReward: 20 },
  // ---- Uncommon (7) ----
  { id: 'fire_imp_blaze', name: 'Blaze Imp', species: 'fire_imp', rarity: 'uncommon', description: 'An imp that commands a small sphere of living flame it uses as both weapon and light', emoji: '🔥', power: 30, summonCost: 40, xpReward: 35 },
  { id: 'ash_golem_cinder', name: 'Cinder Golem', species: 'ash_golem', rarity: 'uncommon', description: 'A larger golem with obsidian core embedded in compressed ash armor plating', emoji: '🗿', power: 38, summonCost: 50, xpReward: 40 },
  { id: 'magma_hound_fang', name: 'Magma Fang', species: 'magma_hound', rarity: 'uncommon', description: 'A fierce hunting hound with fangs that drip molten rock when agitated', emoji: '🐺', power: 34, summonCost: 45, xpReward: 38 },
  { id: 'sulfur_wyrm_acidic', name: 'Acidic Wyrm', species: 'sulfur_wyrm', rarity: 'uncommon', description: 'A burrowing wyrm that secretes corrosive sulfuric acid from its segmented body', emoji: '🐍', power: 28, summonCost: 35, xpReward: 32 },
  { id: 'ember_wraith_glow', name: 'Glow Wraith', species: 'ember_wraith', rarity: 'uncommon', description: 'A spirit that illuminates dark caverns with a warm orange luminescence', emoji: '👻', power: 24, summonCost: 30, xpReward: 30 },
  { id: 'smoke_specter_choking', name: 'Choking Specter', species: 'smoke_specter', rarity: 'uncommon', description: 'A specter whose suffocating smoke can choke the life from entire rooms', emoji: '🌫️', power: 32, summonCost: 42, xpReward: 36 },
  { id: 'lava_titan_crag', name: 'Crag Titan', species: 'lava_titan', rarity: 'uncommon', description: 'A walking chunk of volcanic rock that reshapes the terrain with each footstep', emoji: '🌋', power: 42, summonCost: 55, xpReward: 45 },
  // ---- Rare (7) ----
  { id: 'fire_imp_infernal', name: 'Infernal Imp', species: 'fire_imp', rarity: 'rare', description: 'An ancient imp that has grown to human size, wreathed in perpetual hellfire', emoji: '😈', power: 70, summonCost: 150, xpReward: 80 },
  { id: 'ash_golem_basalt', name: 'Basalt Sentinel', species: 'ash_golem', rarity: 'rare', description: 'A towering golem of polished basalt, nearly impervious to physical attacks', emoji: '🗿', power: 85, summonCost: 200, xpReward: 95 },
  { id: 'magma_hound_alpha', name: 'Alpha Hound', species: 'magma_hound', rarity: 'rare', description: 'The pack leader of magma hounds, its howl triggers minor volcanic eruptions', emoji: '🐕', power: 78, summonCost: 175, xpReward: 88 },
  { id: 'sulfur_wyrm_venom', name: 'Venom Wyrm', species: 'sulfur_wyrm', rarity: 'rare', description: 'A massive wyrm whose bite injects lethal sulfur venom that corrodes armor', emoji: '🐍', power: 65, summonCost: 130, xpReward: 72 },
  { id: 'ember_wraith_blaze', name: 'Blaze Wraith', species: 'ember_wraith', rarity: 'rare', description: 'A wraith of concentrated ember energy that ignites everything it touches', emoji: '👻', power: 60, summonCost: 120, xpReward: 68 },
  { id: 'smoke_specter_storm', name: 'Storm Specter', species: 'smoke_specter', rarity: 'rare', description: 'A specter that summons ash storms capable of burying entire settlements', emoji: '🌪️', power: 72, summonCost: 160, xpReward: 82 },
  { id: 'lava_titan_forge', name: 'Forge Titan', species: 'lava_titan', rarity: 'rare', description: 'A titan whose body functions as a living furnace, smelting ore inside itself', emoji: '🌋', power: 90, summonCost: 220, xpReward: 100 },
  // ---- Epic (7) ----
  { id: 'fire_imp_lord', name: 'Imp Lord Brimstone', species: 'fire_imp', rarity: 'epic', description: 'The undisputed king of all fire imps, commanding legions with a snap of his fingers', emoji: '👿', power: 160, summonCost: 600, xpReward: 180 },
  { id: 'ash_golem_colossus', name: 'Ash Colossus', species: 'ash_golem', rarity: 'epic', description: 'A mountain-sized golem of compressed volcanic ash, visible for miles across the crag', emoji: '🗿', power: 200, summonCost: 800, xpReward: 220 },
  { id: 'magma_hound_cerberus', name: 'Magma Cerberus', species: 'magma_hound', rarity: 'epic', description: 'A three-headed hound of molten rock that guards the deepest furnace chambers', emoji: '🐕', power: 180, summonCost: 700, xpReward: 200 },
  { id: 'sulfur_wyrm_jormungandr', name: 'Jormungandr Wyrm', species: 'sulfur_wyrm', rarity: 'epic', description: 'A world-serpent of sulfur that encircles the entire Brimstone Crag', emoji: '🐍', power: 170, summonCost: 650, xpReward: 190 },
  { id: 'ember_wraith_phoenix', name: 'Phoenix Wraith', species: 'ember_wraith', rarity: 'epic', description: 'A wraith that endlessly dies and reforms in cycles of ember and ash', emoji: '🔥', power: 150, summonCost: 550, xpReward: 170 },
  { id: 'smoke_specter_abyssal', name: 'Abyssal Specter', species: 'smoke_specter', rarity: 'epic', description: 'A being of pure volcanic smog that swallows light, sound, and hope itself', emoji: '🌫️', power: 175, summonCost: 680, xpReward: 195 },
  { id: 'lava_titan_primordial', name: 'Primordial Titan', species: 'lava_titan', rarity: 'epic', description: 'A titan from the first volcanic eruption on this world, older than civilization', emoji: '🌋', power: 210, summonCost: 850, xpReward: 230 },
  // ---- Legendary (7) ----
  { id: 'fire_imp_sulfurking', name: 'Sulfur King', species: 'fire_imp', rarity: 'legendary', description: 'The primordial imp born from the first sulfur deposit, ruler of all imp-kind for eternity', emoji: '👑', power: 500, summonCost: 3000, xpReward: 600 },
  { id: 'ash_golem_worldbreaker', name: 'Worldbreaker', species: 'ash_golem', rarity: 'legendary', description: 'A golem whose awakening caused the last caldera collapse, said to sleep beneath the deepest ash', emoji: '🗿', power: 600, summonCost: 4000, xpReward: 700 },
  { id: 'magma_hound_fenrir', name: 'Fenrir Hound', species: 'magma_hound', rarity: 'legendary', description: 'The mythical magma wolf destined to consume the sun during Ragnarok of the Crag', emoji: '🐺', power: 550, summonCost: 3500, xpReward: 650 },
  { id: 'sulfur_wyrm_leviathan', name: 'Sulfur Leviathan', species: 'sulfur_wyrm', rarity: 'legendary', description: 'A serpentine beast of living sulfur that poisons the very air for leagues around', emoji: '🐉', power: 520, summonCost: 3200, xpReward: 620 },
  { id: 'ember_wraith_solar', name: 'Solar Wraith', species: 'ember_wraith', rarity: 'legendary', description: 'A wraith of concentrated solar ember that burns brighter than the noon sun', emoji: '☀️', power: 480, summonCost: 2800, xpReward: 580 },
  { id: 'smoke_specter_void', name: 'Void Specter', species: 'smoke_specter', rarity: 'legendary', description: 'A specter from the space between worlds where volcanic smoke meets the void', emoji: '🕳️', power: 540, summonCost: 3400, xpReward: 640 },
  { id: 'lava_titan_igneous', name: 'Igneous Sovereign', species: 'lava_titan', rarity: 'legendary', description: 'The supreme titan of molten rock whose heartbeat causes every eruption on the crag', emoji: '🌋', power: 650, summonCost: 5000, xpReward: 750 },
];

// =============================================================================
// Constants: 8 Furnace Locations
// =============================================================================

export const BR_FURNACES: BrFurnaceDef[] = [
  { id: 'ember_forge', name: 'Ember Forge', description: 'A small forge at the crag entrance where apprentices learn to tame their first demon fire', emoji: '🔥', level: 1, resources: ['raw_sulfur', 'coal_slag'], capacity: 20, unlockLevel: 1 },
  { id: 'sulfur_pit', name: 'Sulfur Smelting Pit', description: 'An open pit where raw sulfur is refined into usable brimstone ingots', emoji: '⛏️', level: 2, resources: ['raw_sulfur', 'yellow_crystal'], capacity: 35, unlockLevel: 3 },
  { id: 'ash_kiln', name: 'Ash Calcination Kiln', description: 'A towering kiln that burns volcanic ash into refined ash compounds', emoji: '🏭', level: 3, resources: ['volcanic_ash', 'cinder_clay'], capacity: 50, unlockLevel: 6 },
  { id: 'magma_crucible', name: 'Magma Crucible', description: 'A crucible suspended over a lava flow, the hottest smelting station on the crag', emoji: '⚗️', level: 4, resources: ['magma_shard', 'obsidian_slag'], capacity: 70, unlockLevel: 10 },
  { id: 'brimstone_vault', name: 'Brimstone Vault Furnace', description: 'A sealed furnace deep in the crag where legendary materials are forged under immense pressure', emoji: '🏦', level: 5, resources: ['brimstone_ore', 'fire_opal'], capacity: 90, unlockLevel: 16 },
  { id: 'infernal_cauldron', name: 'Infernal Cauldron', description: 'A bubbling cauldron fed by underground magma rivers, capable of smelting demon cores', emoji: '🫕', level: 6, resources: ['demon_core', 'hellfire_ember'], capacity: 120, unlockLevel: 24 },
  { id: 'obsidian_foundry', name: 'Obsidian Foundry', description: 'The ancient foundry of the Titan-smiths where the hardest volcanic glass is shaped', emoji: '🏛️', level: 7, resources: ['pure_obsidian', 'titan_ember'], capacity: 150, unlockLevel: 33 },
  { id: 'world_forge', name: 'World Forge Core', description: 'The mythical forge at the very heart of the Brimstone Crag, said to have created the world', emoji: '🌍', level: 8, resources: ['primordial_slag', 'world_ember'], capacity: 200, unlockLevel: 42 },
];

// =============================================================================
// Constants: 30 Sulfur/Ash Materials
// =============================================================================

export const BR_MATERIALS: BrMaterialDef[] = [
  // Common (6)
  { id: 'raw_sulfur', name: 'Raw Sulfur', rarity: 'common', description: 'Crude yellow chunks of sulfur harvested from fumaroles on the crag surface', emoji: '🟡', smeltXp: 5, stackSize: 99 },
  { id: 'coal_slag', name: 'Coal Slag', rarity: 'common', description: 'Residue from burning coal in the lower furnaces, still warm to the touch', emoji: '⬛', smeltXp: 4, stackSize: 99 },
  { id: 'volcanic_ash', name: 'Volcanic Ash', rarity: 'common', description: 'Fine grey ash collected from recent eruptions, useful for basic crafting', emoji: '🌫️', smeltXp: 3, stackSize: 99 },
  { id: 'cinder_clay', name: 'Cinder Clay', rarity: 'common', description: 'Heat-hardened clay formed from compressed ash and magma runoff', emoji: '🧱', smeltXp: 5, stackSize: 99 },
  { id: 'pumice_stone', name: 'Pumice Stone', rarity: 'common', description: 'Lightweight volcanic rock riddled with air bubbles from escaping gas', emoji: '🪨', smeltXp: 4, stackSize: 99 },
  { id: 'fumarole_salt', name: 'Fumarole Salt', rarity: 'common', description: 'Crystalline salt deposits from volcanic gas vents, slightly acidic', emoji: '🧂', smeltXp: 6, stackSize: 99 },
  // Uncommon (6)
  { id: 'yellow_crystal', name: 'Sulfur Crystal', rarity: 'uncommon', description: 'Translucent yellow crystals that grow in sulfur-rich cave walls', emoji: '💎', smeltXp: 15, stackSize: 50 },
  { id: 'magma_shard', name: 'Magma Shard', rarity: 'uncommon', description: 'A shard of semi-solid magma that maintains its heat indefinitely', emoji: '🔶', smeltXp: 18, stackSize: 40 },
  { id: 'obsidian_slag', name: 'Obsidian Slag', rarity: 'uncommon', description: 'Impure volcanic glass with embedded mineral inclusions', emoji: '🖤', smeltXp: 16, stackSize: 40 },
  { id: 'fire_opal', name: 'Fire Opal', rarity: 'uncommon', description: 'An opalescent gemstone that flickers with internal flame patterns', emoji: '💠', smeltXp: 20, stackSize: 30 },
  { id: 'brimstone_dust', name: 'Brimstone Dust', rarity: 'uncommon', description: 'A fine powder of purified brimstone used in demon summoning rituals', emoji: '✨', smeltXp: 14, stackSize: 50 },
  { id: 'lava_thread', name: 'Lava Thread', rarity: 'uncommon', description: 'Thin filaments of cooled lava that flex like metallic wire', emoji: '🧵', smeltXp: 17, stackSize: 40 },
  // Rare (6)
  { id: 'brimstone_ore', name: 'Brimstone Ore', rarity: 'rare', description: 'Concentrated brimstone deposits found only in the deepest crag tunnels', emoji: '🟠', smeltXp: 40, stackSize: 20 },
  { id: 'demon_core', name: 'Demon Core', rarity: 'rare', description: 'The crystallized essence of a defeated demon, pulsing with dark energy', emoji: '💜', smeltXp: 45, stackSize: 15 },
  { id: 'hellfire_ember', name: 'Hellfire Ember', rarity: 'rare', description: 'An ember from the demon realm that burns hotter than any natural flame', emoji: '🔥', smeltXp: 50, stackSize: 15 },
  { id: 'pure_obsidian', name: 'Pure Obsidian', rarity: 'rare', description: 'Flawless volcanic glass without a single imperfection, razor-sharp edges', emoji: '🖤', smeltXp: 42, stackSize: 20 },
  { id: 'ash_pearl', name: 'Ash Pearl', rarity: 'rare', description: 'A pearl formed in the gills of sulfur wyrms over centuries', emoji: '⚪', smeltXp: 48, stackSize: 10 },
  { id: 'infernal_quartz', name: 'Infernal Quartz', rarity: 'rare', description: 'Quartz infused with infernal heat that crackles with electrical charge', emoji: '🔴', smeltXp: 44, stackSize: 15 },
  // Epic (6)
  { id: 'titan_ember', name: 'Titan Ember', rarity: 'epic', description: 'An ember from the heart of a lava titan, large as a boulder and burning eternally', emoji: '🌋', smeltXp: 100, stackSize: 5 },
  { id: 'sulfur_crown', name: 'Sulfur Crown Gem', rarity: 'epic', description: 'A crown-shaped gemstone of pure crystallized sulfur, radiating golden light', emoji: '👑', smeltXp: 110, stackSize: 5 },
  { id: 'primordial_slag', name: 'Primordial Slag', rarity: 'epic', description: 'Slag from the world\'s first volcanic eruption, saturated with creation energy', emoji: '🌍', smeltXp: 120, stackSize: 5 },
  { id: 'demon_heart_crystal', name: 'Demon Heart Crystal', rarity: 'epic', description: 'The crystallized heart of a legendary demon, still beating with dark fire', emoji: '❤️‍🔥', smeltXp: 130, stackSize: 3 },
  { id: 'void_ash', name: 'Void Ash', rarity: 'epic', description: 'Ash from volcanoes that erupted into the void between dimensions', emoji: '🌑', smeltXp: 115, stackSize: 5 },
  { id: 'solar_brimstone', name: 'Solar Brimstone', rarity: 'epic', description: 'Brimstone that has absorbed direct sunlight for millennia, glowing like a small sun', emoji: '☀️', smeltXp: 125, stackSize: 3 },
  // Legendary (6)
  { id: 'world_ember', name: 'World Ember', rarity: 'legendary', description: 'The ember that ignited the Brimstone Crag itself — said to contain the fire of creation', emoji: '🌍', smeltXp: 300, stackSize: 1 },
  { id: 'dragonfire_ingot', name: 'Dragonfire Ingot', rarity: 'legendary', description: 'An ingot forged from dragonfire and brimstone, harder than any known metal', emoji: '🐉', smeltXp: 350, stackSize: 1 },
  { id: 'sulfur_philosopher_stone', name: 'Sulfur Philosopher Stone', rarity: 'legendary', description: 'The legendary stone said to transmute all base matter into pure brimstone', emoji: '💎', smeltXp: 400, stackSize: 1 },
  { id: 'primordial_fire_seed', name: 'Primordial Fire Seed', rarity: 'legendary', description: 'A seed from the first fire ever to burn on this world, containing infinite heat', emoji: '🌱', smeltXp: 380, stackSize: 1 },
  { id: 'caldera_heart', name: 'Caldera Heart', rarity: 'legendary', description: 'The crystallized magma from the center of the world\'s largest caldera', emoji: '❤️', smeltXp: 420, stackSize: 1 },
  { id: 'eternal_brimstone', name: 'Eternal Brimstone', rarity: 'legendary', description: 'Brimstone that will never burn out — the most precious substance in the crag', emoji: '✨', smeltXp: 500, stackSize: 1 },
];

// =============================================================================
// Constants: 25 Crag Structures (upgradeable to level 10)
// =============================================================================

export const BR_STRUCTURES: BrStructureDef[] = [
  { id: 'sulfur_mine', name: 'Sulfur Extraction Mine', description: 'Deep tunnels for harvesting raw sulfur from the crag walls', emoji: '⛏️', maxLevel: 10, buildCost: 100, upgradeCost: 60, bonusType: 'sulfur_yield', bonusPerLevel: 5, requiredLevel: 1 },
  { id: 'ash_quarry', name: 'Ash Quarry', description: 'An open-pit quarry for collecting volcanic ash and cinder clay', emoji: '🏚️', maxLevel: 10, buildCost: 80, upgradeCost: 50, bonusType: 'ash_yield', bonusPerLevel: 4, requiredLevel: 1 },
  { id: 'ember_barracks', name: 'Demon Barracks', description: 'Housing and training facilities for summoned sulfur demons', emoji: '🏰', maxLevel: 10, buildCost: 200, upgradeCost: 100, bonusType: 'demon_power', bonusPerLevel: 3, requiredLevel: 2 },
  { id: 'smoke_tower', name: 'Smoke Signal Tower', description: 'A tall tower for sending messages and detecting approaching threats via smoke patterns', emoji: '🗼', maxLevel: 10, buildCost: 120, upgradeCost: 70, bonusType: 'alert_range', bonusPerLevel: 5, requiredLevel: 2 },
  { id: 'lava_channel', name: 'Lava Irrigation Channel', description: 'Channels molten lava to power furnaces and heat structures across the crag', emoji: '🌊', maxLevel: 10, buildCost: 250, upgradeCost: 120, bonusType: 'furnace_speed', bonusPerLevel: 4, requiredLevel: 3 },
  { id: 'brimstone_armory', name: 'Brimstone Armory', description: 'Forges and stores weapons and armor made from brimstone alloys', emoji: '⚔️', maxLevel: 10, buildCost: 180, upgradeCost: 90, bonusType: 'attack_bonus', bonusPerLevel: 3, requiredLevel: 4 },
  { id: 'crag_wall', name: 'Crag Defense Wall', description: 'Massive walls of cooled lava protecting the inner crag from eruptions and invaders', emoji: '🧱', maxLevel: 10, buildCost: 150, upgradeCost: 80, bonusType: 'defense', bonusPerLevel: 5, requiredLevel: 3 },
  { id: 'heat_vault', name: 'Heat Storage Vault', description: 'Insulated chambers that store geothermal heat for later use', emoji: '🏦', maxLevel: 10, buildCost: 130, upgradeCost: 75, bonusType: 'heat_capacity', bonusPerLevel: 6, requiredLevel: 4 },
  { id: 'demon_arena', name: 'Demon Combat Arena', description: 'An arena where demons battle for dominance, increasing their power through combat', emoji: '🏟️', maxLevel: 10, buildCost: 300, upgradeCost: 150, bonusType: 'combat_xp', bonusPerLevel: 5, requiredLevel: 6 },
  { id: 'sulfur_lab', name: 'Sulfur Research Laboratory', description: 'Studies sulfur properties to develop new demon summoning techniques', emoji: '🔬', maxLevel: 10, buildCost: 220, upgradeCost: 110, bonusType: 'research_speed', bonusPerLevel: 4, requiredLevel: 5 },
  { id: 'obsidian_workshop', name: 'Obsidian Crafting Workshop', description: 'Shapes obsidian and volcanic glass into tools, weapons, and art', emoji: '🔧', maxLevel: 10, buildCost: 170, upgradeCost: 85, bonusType: 'craft_quality', bonusPerLevel: 3, requiredLevel: 5 },
  { id: 'ember_greenhouse', name: 'Ember Greenhouse', description: 'Grows sulfur-resistant plants and medicinal herbs using geothermal heat', emoji: '🌿', maxLevel: 10, buildCost: 140, upgradeCost: 70, bonusType: 'herb_yield', bonusPerLevel: 4, requiredLevel: 4 },
  { id: 'magma_bridge', name: 'Magma Suspension Bridge', description: 'A bridge spanning a lava chasm, connecting distant crag sectors', emoji: '🌉', maxLevel: 10, buildCost: 280, upgradeCost: 140, bonusType: 'travel_speed', bonusPerLevel: 5, requiredLevel: 7 },
  { id: 'infernal_library', name: 'Infernal Archive Library', description: 'Stores ancient scrolls and forbidden knowledge about demon summoning', emoji: '📚', maxLevel: 10, buildCost: 200, upgradeCost: 100, bonusType: 'knowledge_bonus', bonusPerLevel: 3, requiredLevel: 6 },
  { id: 'ash_crematorium', name: 'Ash Crematorium', description: 'Safely disposes of failed summoning materials and recycles the ash', emoji: '⚱️', maxLevel: 10, buildCost: 100, upgradeCost: 60, bonusType: 'recycle_rate', bonusPerLevel: 5, requiredLevel: 3 },
  { id: 'brimstone_market', name: 'Brimstone Trading Market', description: 'A bustling marketplace for trading sulfur, ash, and demon-related goods', emoji: '🏪', maxLevel: 10, buildCost: 160, upgradeCost: 80, bonusType: 'trade_bonus', bonusPerLevel: 4, requiredLevel: 5 },
  { id: 'volcanic_bath', name: 'Volcanic Hot Spring Bath', description: 'Healing baths fed by hot springs that restore demon energy and soothe wounds', emoji: '♨️', maxLevel: 10, buildCost: 150, upgradeCost: 75, bonusType: 'heal_rate', bonusPerLevel: 5, requiredLevel: 4 },
  { id: 'seismic_sensor', name: 'Seismic Sensor Array', description: 'Detects underground tremors to predict eruptions and demon migrations', emoji: '📡', maxLevel: 10, buildCost: 190, upgradeCost: 95, bonusType: 'eruption_warning', bonusPerLevel: 6, requiredLevel: 6 },
  { id: 'demon_shrine', name: 'Demon Worship Shrine', description: 'A shrine that amplifies summoning power through ancient rituals', emoji: '⛩️', maxLevel: 10, buildCost: 350, upgradeCost: 170, bonusType: 'summon_power', bonusPerLevel: 4, requiredLevel: 8 },
  { id: 'crag_observatory', name: 'Crag Summit Observatory', description: 'The highest point on the crag with a view of all volcanic activity in the region', emoji: '🔭', maxLevel: 10, buildCost: 210, upgradeCost: 105, bonusType: 'vision_range', bonusPerLevel: 5, requiredLevel: 7 },
  { id: 'infernal_portal', name: 'Infernal Portal Gate', description: 'A stabilized portal to the demon realm for high-level summoning rituals', emoji: '🌀', maxLevel: 10, buildCost: 500, upgradeCost: 250, bonusType: 'portal_power', bonusPerLevel: 6, requiredLevel: 12 },
  { id: 'titan_forge_hammer', name: 'Titan Forge Hammer Station', description: 'A massive forging station powered by a trapped titan\'s geothermal energy', emoji: '🔨', maxLevel: 10, buildCost: 400, upgradeCost: 200, bonusType: 'forge_power', bonusPerLevel: 7, requiredLevel: 10 },
  { id: 'lava_moat', name: 'Lava Defense Moat', description: 'A moat of molten lava encircling the inner crag, impassable to most threats', emoji: '🌋', maxLevel: 10, buildCost: 320, upgradeCost: 160, bonusType: 'defense_bonus', bonusPerLevel: 6, requiredLevel: 9 },
  { id: 'world_pillar', name: 'World Pillar Foundation', description: 'A pillar of ancient volcanic rock that supports the entire crag structure', emoji: '🏛️', maxLevel: 10, buildCost: 600, upgradeCost: 300, bonusType: 'all_bonus', bonusPerLevel: 3, requiredLevel: 15 },
  { id: 'caldera_throne', name: 'Caldera Throne Room', description: 'The ultimate seat of power at the heart of the Brimstone Crag caldera', emoji: '👑', maxLevel: 10, buildCost: 800, upgradeCost: 400, bonusType: 'ruler_power', bonusPerLevel: 8, requiredLevel: 20 },
];

// =============================================================================
// Constants: 22 Brimstone Abilities
// =============================================================================

export const BR_ABILITIES: BrAbilityDef[] = [
  // Offensive (6)
  { id: 'sulfur_burst', name: 'Sulfur Burst', type: 'offensive', power: 20, cooldown: 5000, description: 'Unleashes a cloud of burning sulfur that damages all nearby enemies', emoji: '💥', unlockLevel: 1 },
  { id: 'magma_lance', name: 'Magma Lance', type: 'offensive', power: 35, cooldown: 8000, description: 'Hurls a spear of concentrated magma that pierces through targets', emoji: '🔱', unlockLevel: 3 },
  { id: 'ash_storm', name: 'Ash Storm', type: 'offensive', power: 45, cooldown: 12000, description: 'Summons a blinding storm of volcanic ash that erodes enemy defenses', emoji: '🌪️', unlockLevel: 7 },
  { id: 'hellfire_beam', name: 'Hellfire Beam', type: 'offensive', power: 70, cooldown: 15000, description: 'Fires a devastating beam of hellfire that melts everything in its path', emoji: '⚡', unlockLevel: 12 },
  { id: 'brimstone_nova', name: 'Brimstone Nova', type: 'offensive', power: 100, cooldown: 20000, description: 'Detonates all accumulated brimstone energy in a catastrophic spherical blast', emoji: '☄️', unlockLevel: 20 },
  { id: 'volcanic_eruption', name: 'Volcanic Eruption', type: 'offensive', power: 150, cooldown: 30000, description: 'Triggers a localized volcanic eruption, the ultimate destructive ability', emoji: '🌋', unlockLevel: 30 },
  // Defensive (5)
  { id: 'ash_shield', name: 'Ash Shield', type: 'defensive', power: 15, cooldown: 6000, description: 'Raises a barrier of compressed volcanic ash that absorbs incoming damage', emoji: '🛡️', unlockLevel: 2 },
  { id: 'obsidian_barrier', name: 'Obsidian Barrier', type: 'defensive', power: 30, cooldown: 10000, description: 'Summons walls of volcanic glass that reflect projectile attacks', emoji: '💎', unlockLevel: 6 },
  { id: 'magma_armor', name: 'Magma Armor', type: 'defensive', power: 50, cooldown: 15000, description: 'Encases the user in flowing magma that hardens into protective armor on impact', emoji: '🛡️', unlockLevel: 10 },
  { id: 'infernal_fortress', name: 'Infernal Fortress', type: 'defensive', power: 80, cooldown: 25000, description: 'Creates an entire fortress of hardened lava around the user and allies', emoji: '🏰', unlockLevel: 18 },
  { id: 'titan_aegis', name: 'Titan Aegis', type: 'defensive', power: 120, cooldown: 35000, description: 'Channels the power of a lava titan to create an impenetrable shield', emoji: '🗿', unlockLevel: 28 },
  // Utility (6)
  { id: 'sulfur_vision', name: 'Sulfur Vision', type: 'utility', power: 10, cooldown: 4000, description: 'See through walls and detect sulfur deposits and hidden demons', emoji: '👁️', unlockLevel: 1 },
  { id: 'heat_dash', name: 'Heat Dash', type: 'utility', power: 15, cooldown: 3000, description: 'Propels yourself forward on a jet of superheated volcanic gas', emoji: '💨', unlockLevel: 4 },
  { id: 'ember_heal', name: 'Ember Restoration', type: 'utility', power: 25, cooldown: 8000, description: 'Channels ember energy to heal wounds and restore demon stamina', emoji: '💚', unlockLevel: 5 },
  { id: 'smoke_cloak', name: 'Smoke Cloak', type: 'utility', power: 20, cooldown: 6000, description: 'Wraps the user in concealing volcanic smoke, rendering them invisible', emoji: '🌫️', unlockLevel: 8 },
  { id: 'lava_teleport', name: 'Lava Teleport', type: 'utility', power: 30, cooldown: 12000, description: 'Merges into a lava flow and emerges at any other connected lava source', emoji: '🌀', unlockLevel: 14 },
  { id: 'time_cinder', name: 'Time Cinder', type: 'utility', power: 40, cooldown: 20000, description: 'Slows time in a localized area using ancient cinder magic', emoji: '⏳', unlockLevel: 22 },
  // Summon (5)
  { id: 'imp_swarm', name: 'Imp Swarm', type: 'summon', power: 25, cooldown: 10000, description: 'Summons a swarm of fire imps that overwhelm enemies with numbers', emoji: '😈', unlockLevel: 2 },
  { id: 'golem_rise', name: 'Golem Awakening', type: 'summon', power: 50, cooldown: 18000, description: 'Awakens an ash golem from the terrain to fight alongside you', emoji: '🗿', unlockLevel: 9 },
  { id: 'wyrm_call', name: 'Wyrm Call', type: 'summon', power: 75, cooldown: 25000, description: 'Calls a sulfur wyrm from deep underground to devastating effect', emoji: '🐍', unlockLevel: 15 },
  { id: 'wraith_circle', name: 'Wraith Summoning Circle', type: 'summon', power: 100, cooldown: 30000, description: 'Draws a brimstone circle that summons ember wraiths from the spirit realm', emoji: '👻', unlockLevel: 24 },
  { id: 'titan_awakening', name: 'Titan Awakening Ritual', type: 'summon', power: 200, cooldown: 60000, description: 'The ultimate summoning — awakens a primordial lava titan from its slumber', emoji: '🌋', unlockLevel: 35 },
];

// =============================================================================
// Constants: 18 Achievements
// =============================================================================

export const BR_ACHIEVEMENTS: BrAchievementDef[] = [
  { id: 'br_first_summon', name: 'First Summoning', description: 'Summon your first sulfur demon', emoji: '😈', conditionKey: 'totalSummoned', targetValue: 1, rewardXp: 50 },
  { id: 'br_five_summons', name: 'Demon Collector', description: 'Summon 5 sulfur demons', emoji: '📦', conditionKey: 'totalSummoned', targetValue: 5, rewardXp: 100 },
  { id: 'br_ten_summons', name: 'Demon Lord', description: 'Summon 10 sulfur demons', emoji: '👑', conditionKey: 'totalSummoned', targetValue: 10, rewardXp: 200 },
  { id: 'br_twenty_summons', name: 'Sulfur Sovereign', description: 'Summon 20 sulfur demons', emoji: '🏰', conditionKey: 'totalSummoned', targetValue: 20, rewardXp: 500 },
  { id: 'br_first_smelt', name: 'First Smelt', description: 'Ignite your first furnace', emoji: '🔥', conditionKey: 'totalSmelted', targetValue: 1, rewardXp: 30 },
  { id: 'br_ten_smelts', name: 'Furnace Master', description: 'Smelt materials 10 times', emoji: '⚗️', conditionKey: 'totalSmelted', targetValue: 10, rewardXp: 150 },
  { id: 'br_fifty_smelts', name: 'Brimstone Alchemist', description: 'Smelt materials 50 times', emoji: '🧪', conditionKey: 'totalSmelted', targetValue: 50, rewardXp: 400 },
  { id: 'br_first_structure', name: 'Foundation Stone', description: 'Build your first crag structure', emoji: '🧱', conditionKey: 'structuresBuilt', targetValue: 1, rewardXp: 60 },
  { id: 'br_five_structures', name: 'Crag Architect', description: 'Build 5 crag structures', emoji: '🏛️', conditionKey: 'structuresBuilt', targetValue: 5, rewardXp: 200 },
  { id: 'br_first_artifact', name: 'Artifact Finder', description: 'Activate your first legendary artifact', emoji: '💎', conditionKey: 'artifactsActivated', targetValue: 1, rewardXp: 150 },
  { id: 'br_five_artifacts', name: 'Relic Keeper', description: 'Activate 5 legendary artifacts', emoji: '⛪', conditionKey: 'artifactsActivated', targetValue: 5, rewardXp: 500 },
  { id: 'br_first_event', name: 'Crag Survivor', description: 'Survive your first random crag event', emoji: '⚡', conditionKey: 'eventsSurvived', targetValue: 1, rewardXp: 80 },
  { id: 'br_ten_events', name: 'Event Veteran', description: 'Survive 10 random crag events', emoji: '🎖️', conditionKey: 'eventsSurvived', targetValue: 10, rewardXp: 350 },
  { id: 'br_all_common_demons', name: 'Common Horde', description: 'Collect all 7 common sulfur demons', emoji: '😈', conditionKey: 'commonDemonsCollected', targetValue: 7, rewardXp: 250 },
  { id: 'br_all_uncommon_demons', name: 'Uncommon Legion', description: 'Collect all 7 uncommon sulfur demons', emoji: '👿', conditionKey: 'uncommonDemonsCollected', targetValue: 7, rewardXp: 400 },
  { id: 'br_rare_demon', name: 'Rare Discovery', description: 'Collect any rare sulfur demon', emoji: '💜', conditionKey: 'rareDemonsCollected', targetValue: 1, rewardXp: 300 },
  { id: 'br_epic_demon', name: 'Epic Conquest', description: 'Collect any epic sulfur demon', emoji: '🔥', conditionKey: 'epicDemonsCollected', targetValue: 1, rewardXp: 600 },
  { id: 'br_legendary_demon', name: 'Legendary Summoning', description: 'Collect any legendary sulfur demon', emoji: '👑', conditionKey: 'legendaryDemonsCollected', targetValue: 1, rewardXp: 1000 },
];

// =============================================================================
// Constants: 8 Progression Titles
// =============================================================================

export const BR_TITLES: BrTitleDef[] = [
  { name: 'Ash Wanderer', levelRequired: 1, description: 'A lost traveler who has just discovered the sulfurous trails of the Brimstone Crag' },
  { name: 'Sulfur Apprentice', levelRequired: 5, description: 'You have learned the basics of sulfur harvesting and demon summoning' },
  { name: 'Furnace Tender', levelRequired: 10, description: 'Your furnaces burn steady and true, and demons answer your call' },
  { name: 'Crag Builder', levelRequired: 18, description: 'You have transformed a barren volcanic outcrop into a thriving demon outpost' },
  { name: 'Brimstone Warlock', levelRequired: 25, description: 'Your mastery of brimstone magic terrifies demons and impresses titan lords' },
  { name: 'Demon Commander', levelRequired: 33, description: 'Legions of sulfur demons march under your banner across the volcanic wasteland' },
  { name: 'Magma Sovereign', levelRequired: 42, description: 'You rule the Brimstone Crag with the power of a living volcano' },
  { name: 'Crag Emperor', levelRequired: 50, description: 'Supreme ruler of all Brimstone Crag — even the volcanoes bow to your will' },
];

// =============================================================================
// Constants: 15 Legendary Brimstone Artifacts
// =============================================================================

export const BR_ARTIFACTS: BrArtifactDef[] = [
  { id: 'sulfur_crown_of_ignis', name: 'Sulfur Crown of Ignis', description: 'A crown of crystallized sulfur that blazes with eternal flame', emoji: '👑', rarity: 'legendary', bonusType: 'summon_power', bonusValue: 25, lore: 'Forged by the first fire imp king from the purest sulfur ever mined' },
  { id: 'ash_blade_of_titans', name: 'Ash Blade of the Titans', description: 'A massive sword carved from a single piece of volcanic obsidian', emoji: '⚔️', rarity: 'legendary', bonusType: 'attack_bonus', bonusValue: 30, lore: 'The weapon of the last Titan general who fell defending the crag' },
  { id: 'obsidian_orb_of_foresight', name: 'Obsidian Orb of Foresight', description: 'A perfectly spherical obsidian orb that reveals the future in flame patterns', emoji: '🔮', rarity: 'epic', bonusType: 'vision_range', bonusValue: 20, lore: 'Created by ancient seers who gazed into the volcanic depths' },
  { id: 'magma_heart_amulet', name: 'Magma Heart Amulet', description: 'An amulet containing a perpetually beating heart of magma', emoji: '❤️‍🔥', rarity: 'legendary', bonusType: 'heal_rate', bonusValue: 35, lore: 'Extracted from the chest of a dying lava titan as a final gift' },
  { id: 'infernal_tome', name: 'Infernal Tome of Summoning', description: 'A grimoire bound in demon hide containing the true names of all demons', emoji: '📕', rarity: 'legendary', bonusType: 'summon_success', bonusValue: 20, lore: 'Written in brimstone ink by the first warlock to commune with demons' },
  { id: 'brimstone_ring', name: 'Brimstone Ring of Power', description: 'A ring of pure brimstone that glows with sulfurous energy', emoji: '💍', rarity: 'epic', bonusType: 'all_bonus', bonusValue: 10, lore: 'Fashioned from the first sulfur crystal ever discovered in the crag' },
  { id: 'volcanic_shield', name: 'Volcanic Aegis Shield', description: 'A shield of layered volcanic rock that absorbs and redirects heat', emoji: '🛡️', rarity: 'epic', bonusType: 'defense', bonusValue: 25, lore: 'Carried by the legendary Crag Guard who held the gates for forty days' },
  { id: 'ember_flute', name: 'Ember Flute of Command', description: 'A flute carved from an ember tree that controls fire elementals', emoji: '🎵', rarity: 'rare', bonusType: 'demon_power', bonusValue: 15, lore: 'Its melody can calm even the most enraged magma hound' },
  { id: 'ash_cloak', name: 'Cloak of Falling Ash', description: 'A cloak woven from perpetual volcanic ash that renders the wearer invisible', emoji: '🧥', rarity: 'epic', bonusType: 'stealth', bonusValue: 20, lore: 'Worn by the legendary ash assassins of the forgotten crag sects' },
  { id: 'sulfur_chalice', name: 'Sulfur Chalice of Rejuvenation', description: 'A golden chalice that converts any liquid into a healing sulfur elixir', emoji: '🏆', rarity: 'legendary', bonusType: 'heal_rate', bonusValue: 30, lore: 'Said to have caught the tears of the first dying volcano' },
  { id: 'lava_boots', name: 'Lava Walker Boots', description: 'Boots of titan leather that allow walking on molten lava unharmed', emoji: '👢', rarity: 'rare', bonusType: 'travel_speed', bonusValue: 18, lore: 'Crafted from the hide of a lava titan by the master cobbler of the crag' },
  { id: 'infernal_compass', name: 'Infernal Compass', description: 'A compass that points toward the nearest demon or sulfur deposit', emoji: '🧭', rarity: 'uncommon', bonusType: 'detection', bonusValue: 12, lore: 'Its needle is forged from a demon horn and always finds sulfur' },
  { id: 'crag_crystal', name: 'Heart of the Crag Crystal', description: 'A massive crystal that pulses with the geothermal heartbeat of the crag', emoji: '💎', rarity: 'legendary', bonusType: 'furnace_speed', bonusValue: 25, lore: 'The crystallized core of the Brimstone Crag itself' },
  { id: 'smoke_mask', name: 'Mask of the Smoke Wraith', description: 'A mask that allows breathing in any toxic or smoke-filled environment', emoji: '🎭', rarity: 'uncommon', bonusType: 'resist_ash', bonusValue: 15, lore: 'Taken from the face of a vanquished smoke specter' },
  { id: 'primordial_hammer', name: 'Primordial Forge Hammer', description: 'The hammer used by the Titan-smiths to forge the world\'s first weapons', emoji: '🔨', rarity: 'legendary', bonusType: 'craft_quality', bonusValue: 30, lore: 'Each strike with this hammer creates a miniature volcanic eruption' },
];

// =============================================================================
// Constants: 12 Random Crag Events
// =============================================================================

export const BR_EVENTS: BrCragEventDef[] = [
  { id: 'sulfur_eruption', name: 'Sulfur Geyser Eruption', description: 'A massive sulfur geyser erupts, showering the crag in yellow crystals', emoji: '⛲', effectType: 'material_bonus', effectValue: 50, duration: 60000 },
  { id: 'demon_migration', name: 'Wild Demon Migration', description: 'A horde of wild demons passes through the crag, dropping rare materials', emoji: '🐐', effectType: 'encounter_rate', effectValue: 30, duration: 120000 },
  { id: 'ash_storm', name: 'Volcanic Ash Storm', description: 'A massive ash storm blankets the crag, reducing visibility and slowing work', emoji: '🌪️', effectType: 'speed_penalty', effectValue: 25, duration: 45000 },
  { id: 'magma_surge', name: 'Magma Surge', description: 'Underground magma pressure spikes, boosting furnace output temporarily', emoji: '🌊', effectType: 'furnace_boost', effectValue: 40, duration: 90000 },
  { id: 'earthquake', name: 'Crag Earthquake', description: 'A deep tremor shakes the crag, damaging structures but revealing new deposits', emoji: '💥', effectType: 'structure_damage', effectValue: 15, duration: 30000 },
  { id: 'infernal_portal_opening', name: 'Infernal Portal Flare', description: 'A rift to the demon realm briefly opens, allowing rare demon sightings', emoji: '🌀', effectType: 'rare_demon_chance', effectValue: 50, duration: 60000 },
  { id: 'brimstone_rain', name: 'Brimstone Rain', description: 'A rain of burning brimstone falls from the sky, damaging demons but enriching soil', emoji: '🌧️', effectType: 'material_shower', effectValue: 35, duration: 75000 },
  { id: 'titan_awakening', name: 'Distant Titan Awakening', description: 'A titan stirs in its sleep, sending tremors that unlock hidden chambers', emoji: '🗿', effectType: 'unlock_hidden', effectValue: 20, duration: 30000 },
  { id: 'phoenix_ash_rebirth', name: 'Phoenix Ash Rebirth', description: 'Cooled ash spontaneously ignites, healing all demons and furnaces', emoji: '🔥', effectType: 'heal_all', effectValue: 50, duration: 15000 },
  { id: 'obsidian_surge', name: 'Obsidian Formation Surge', description: 'Rapid cooling creates massive obsidian deposits across the crag', emoji: '🖤', effectType: 'obsidian_bonus', effectValue: 60, duration: 90000 },
  { id: 'demon_rebellion', name: 'Minor Demon Rebellion', description: 'Some demons grow restless and refuse commands temporarily', emoji: '😈', effectType: 'demon_penalty', effectValue: 20, duration: 45000 },
  { id: 'sulfur_bloom', name: 'Sulfur Crystal Bloom', description: 'Thousands of sulfur crystals bloom simultaneously in the caverns', emoji: '💐', effectType: 'sulfur_bonus', effectValue: 70, duration: 120000 },
];

// =============================================================================
// Constants: Miscellaneous
// =============================================================================

export const BR_DEMON_COUNT = 35;
export const BR_FURNACE_COUNT = 8;
export const BR_MATERIAL_COUNT = 30;
export const BR_STRUCTURE_COUNT = 25;
export const BR_ABILITY_COUNT = 22;
export const BR_ACHIEVEMENT_COUNT = 18;
export const BR_TITLE_COUNT = 8;
export const BR_ARTIFACT_COUNT = 15;
export const BR_EVENT_COUNT = 12;
export const BR_MAX_STRUCTURE_LEVEL = 10;
export const BR_SUMMON_BASE_COST = 10;
export const BR_FURNACE_IGNITE_COST = 5;
export const BR_STRUCTURE_BUILD_COOLDOWN = 5000;
export const BR_ARTIFACT_ACTIVATE_COOLDOWN = 10000;

// =============================================================================
// Helper: Create Default State
// =============================================================================

function brCreateDefaultState(): BrBrimstoneCragState {
  const demons: Record<string, BrDemonState> = {};
  for (const d of BR_DEMONS) {
    demons[d.id] = {
      owned: false,
      summonedAt: null,
      power: d.power,
      encounterCount: 0,
    };
  }

  const furnaces: Record<string, BrFurnaceState> = {};
  for (const f of BR_FURNACES) {
    furnaces[f.id] = {
      ignited: false,
      level: f.level,
      resourcesSmelted: 0,
      lastIgnitedAt: null,
    };
  }

  const structures: Record<string, BrStructureState> = {};
  for (const s of BR_STRUCTURES) {
    structures[s.id] = {
      built: false,
      level: 0,
      builtAt: null,
    };
  }

  return {
    brDemons: demons,
    brFurnaces: furnaces,
    brStructures: structures,
    brInventory: [],
    brArtifacts: [],
    brAchievements: [],
    brTitle: 'Ash Wanderer',
    brEvents: [],
    brActiveEventId: null,
    brActiveEventEnd: null,
    brLevel: 1,
    brXp: 0,
    brCoins: 100,
    brStats: {
      totalSummoned: 0,
      totalSmelted: 0,
      totalStructuresBuilt: 0,
      totalArtifactsActivated: 0,
      totalEventsSurvived: 0,
      totalCoinsEarned: 0,
      totalCoinsSpent: 0,
      totalXpEarned: 0,
      totalDemonPowerGained: 0,
      totalAbilityUses: 0,
    },
  };
}

// =============================================================================
// Helper: Compute XP Table
// =============================================================================

export const BR_XP_TABLE: number[] = [];
for (let i = 0; i <= BR_MAX_LEVEL; i++) {
  BR_XP_TABLE.push(brXpRequired(i));
}

// =============================================================================
// Main Hook — useBrimstoneCrag
// =============================================================================

export default function useBrimstoneCrag() {
  // ---------------------------------------------------------------------------
  // State with localStorage persistence
  // ---------------------------------------------------------------------------

  const [state, setState] = useState<BrBrimstoneCragState>(() => {
    if (typeof window === 'undefined') return brCreateDefaultState();
    try {
      const saved = localStorage.getItem('brimstone-crag-save');
      if (saved) {
        const parsed = JSON.parse(saved);
        const fresh = brCreateDefaultState();
        return {
          ...fresh,
          ...parsed,
          brDemons: parsed.brDemons ?? fresh.brDemons,
          brFurnaces: parsed.brFurnaces ?? fresh.brFurnaces,
          brStructures: parsed.brStructures ?? fresh.brStructures,
          brInventory: parsed.brInventory ?? fresh.brInventory,
          brArtifacts: parsed.brArtifacts ?? fresh.brArtifacts,
          brAchievements: parsed.brAchievements ?? fresh.brAchievements,
          brTitle: parsed.brTitle ?? fresh.brTitle,
          brEvents: parsed.brEvents ?? fresh.brEvents,
          brActiveEventId: parsed.brActiveEventId ?? fresh.brActiveEventId,
          brActiveEventEnd: parsed.brActiveEventEnd ?? fresh.brActiveEventEnd,
          brLevel: parsed.brLevel ?? fresh.brLevel,
          brXp: parsed.brXp ?? fresh.brXp,
          brCoins: parsed.brCoins ?? fresh.brCoins,
          brStats: {
            ...fresh.brStats,
            ...(parsed.brStats ?? {}),
          },
        };
      }
    } catch {
      // ignore parse errors
    }
    return brCreateDefaultState();
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const prngRef = useRef(brMulberry32(42));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('brimstone-crag-save', JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  // ---------------------------------------------------------------------------
  // Memoized derived data (use `state` parameter in deps, not stateRef.current)
  // ---------------------------------------------------------------------------

  const brOwnedDemons = useMemo(() => {
    return BR_DEMONS.filter((d) => state.brDemons[d.id]?.owned);
  }, [state.brDemons]);

  const brOwnedDemonsByRarity = useMemo(() => {
    const map: Record<BrRarity, BrDemonDef[]> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };
    for (const d of brOwnedDemons) {
      map[d.rarity].push(d);
    }
    return map;
  }, [brOwnedDemons]);

  const brOwnedDemonsBySpecies = useMemo(() => {
    const map: Record<BrDemonSpecies, BrDemonDef[]> = {
      fire_imp: [],
      ash_golem: [],
      magma_hound: [],
      sulfur_wyrm: [],
      ember_wraith: [],
      smoke_specter: [],
      lava_titan: [],
    };
    for (const d of brOwnedDemons) {
      map[d.species].push(d);
    }
    return map;
  }, [brOwnedDemons]);

  const brUnownedDemons = useMemo(() => {
    return BR_DEMONS.filter((d) => !state.brDemons[d.id]?.owned);
  }, [state.brDemons]);

  const brIgnitedFurnaces = useMemo(() => {
    return BR_FURNACES.filter((f) => state.brFurnaces[f.id]?.ignited);
  }, [state.brFurnaces]);

  const brUnignitedFurnaces = useMemo(() => {
    return BR_FURNACES.filter((f) => !state.brFurnaces[f.id]?.ignited);
  }, [state.brFurnaces]);

  const brBuiltStructures = useMemo(() => {
    return BR_STRUCTURES.filter((s) => state.brStructures[s.id]?.built);
  }, [state.brStructures]);

  const brActivatedArtifacts = useMemo(() => {
    return BR_ARTIFACTS.filter((a) => state.brArtifacts.includes(a.id));
  }, [state.brArtifacts]);

  const brUnactivatedArtifacts = useMemo(() => {
    return BR_ARTIFACTS.filter((a) => !state.brArtifacts.includes(a.id));
  }, [state.brArtifacts]);

  const brUnlockedAchievements = useMemo(() => {
    return BR_ACHIEVEMENTS.filter((a) => state.brAchievements.includes(a.id));
  }, [state.brAchievements]);

  const brLockedAchievements = useMemo(() => {
    return BR_ACHIEVEMENTS.filter((a) => !state.brAchievements.includes(a.id));
  }, [state.brAchievements]);

  const brTotalPower = useMemo(() => {
    let total = 0;
    for (const d of brOwnedDemons) {
      const ds = state.brDemons[d.id];
      if (ds) {
        total += ds.power;
      }
    }
    const structureBonus = brBuiltStructures.reduce((sum, s) => {
      const ss = state.brStructures[s.id];
      if (!ss) return sum;
      if (s.bonusType === 'demon_power') {
        return sum + s.bonusPerLevel * ss.level;
      }
      return sum;
    }, 0);
    const artifactBonus = brActivatedArtifacts.reduce((sum, a) => {
      if (a.bonusType === 'demon_power') {
        return sum + a.bonusValue;
      }
      return sum;
    }, 0);
    return total + structureBonus + artifactBonus;
  }, [brOwnedDemons, brBuiltStructures, brActivatedArtifacts, state.brDemons, state.brStructures]);

  const brOverallProgress = useMemo(() => {
    const total = BR_DEMON_COUNT + BR_FURNACE_COUNT + BR_STRUCTURE_COUNT + BR_ARTIFACT_COUNT + BR_ACHIEVEMENT_COUNT;
    const collected = brOwnedDemons.length + brIgnitedFurnaces.length + brBuiltStructures.length + brActivatedArtifacts.length + brUnlockedAchievements.length;
    if (total <= 0) return 0;
    return Math.min(1, collected / total);
  }, [brOwnedDemons, brIgnitedFurnaces, brBuiltStructures, brActivatedArtifacts, brUnlockedAchievements]);

  const brDemonCollectionRate = useMemo(() => {
    if (BR_DEMON_COUNT <= 0) return 0;
    return brOwnedDemons.length / BR_DEMON_COUNT;
  }, [brOwnedDemons]);

  const brFurnaceCompletionRate = useMemo(() => {
    if (BR_FURNACE_COUNT <= 0) return 0;
    return brIgnitedFurnaces.length / BR_FURNACE_COUNT;
  }, [brIgnitedFurnaces]);

  const brStructureCompletionRate = useMemo(() => {
    if (BR_STRUCTURE_COUNT <= 0) return 0;
    return brBuiltStructures.length / BR_STRUCTURE_COUNT;
  }, [brBuiltStructures]);

  const brArtifactCollectionRate = useMemo(() => {
    if (BR_ARTIFACT_COUNT <= 0) return 0;
    return brActivatedArtifacts.length / BR_ARTIFACT_COUNT;
  }, [brActivatedArtifacts]);

  const brAchievementCompletionRate = useMemo(() => {
    if (BR_ACHIEVEMENT_COUNT <= 0) return 0;
    return brUnlockedAchievements.length / BR_ACHIEVEMENT_COUNT;
  }, [brUnlockedAchievements]);

  const brAverageStructureLevel = useMemo(() => {
    if (brBuiltStructures.length === 0) return 0;
    const totalLevels = brBuiltStructures.reduce((sum, s) => {
      const ss = state.brStructures[s.id];
      return sum + (ss?.level ?? 0);
    }, 0);
    return totalLevels / brBuiltStructures.length;
  }, [brBuiltStructures, state.brStructures]);

  const brTotalStructureBonus = useMemo(() => {
    return brBuiltStructures.reduce((sum, s) => {
      const ss = state.brStructures[s.id];
      if (!ss) return sum;
      return sum + s.bonusPerLevel * ss.level;
    }, 0);
  }, [brBuiltStructures, state.brStructures]);

  const brTotalArtifactBonus = useMemo(() => {
    return brActivatedArtifacts.reduce((sum, a) => {
      return sum + a.bonusValue;
    }, 0);
  }, [brActivatedArtifacts]);

  const brActiveEvent = useMemo((): BrCragEventDef | null => {
    if (!state.brActiveEventId) return null;
    if (state.brActiveEventEnd !== null && Date.now() > state.brActiveEventEnd) return null;
    return BR_EVENTS.find((e) => e.id === state.brActiveEventId) ?? null;
  }, [state.brActiveEventId, state.brActiveEventEnd]);

  const brIsEventActive = useMemo(() => {
    if (!state.brActiveEventId) return false;
    if (state.brActiveEventEnd === null) return false;
    return Date.now() <= state.brActiveEventEnd;
  }, [state.brActiveEventId, state.brActiveEventEnd]);

  const brInventoryTotalItems = useMemo(() => {
    return state.brInventory.reduce((sum, item) => sum + item.amount, 0);
  }, [state.brInventory]);

  const brInventoryUniqueItems = useMemo(() => {
    return state.brInventory.length;
  }, [state.brInventory]);

  const brTotalFurnaceOutput = useMemo(() => {
    return brIgnitedFurnaces.reduce((sum, f) => {
      const fs = state.brFurnaces[f.id];
      return sum + (fs?.level ?? f.level);
    }, 0);
  }, [brIgnitedFurnaces, state.brFurnaces]);

  const brRarityDistribution = useMemo(() => {
    const dist: Record<BrRarity, number> = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    };
    for (const d of brOwnedDemons) {
      dist[d.rarity] += 1;
    }
    return dist;
  }, [brOwnedDemons]);

  const brSpeciesCompletion = useMemo(() => {
    const completion: Record<BrDemonSpecies, { owned: number; total: number }> = {
      fire_imp: { owned: 0, total: 0 },
      ash_golem: { owned: 0, total: 0 },
      magma_hound: { owned: 0, total: 0 },
      sulfur_wyrm: { owned: 0, total: 0 },
      ember_wraith: { owned: 0, total: 0 },
      smoke_specter: { owned: 0, total: 0 },
      lava_titan: { owned: 0, total: 0 },
    };
    for (const d of BR_DEMONS) {
      completion[d.species].total += 1;
      if (state.brDemons[d.id]?.owned) {
        completion[d.species].owned += 1;
      }
    }
    return completion;
  }, [state.brDemons]);

  // ---------------------------------------------------------------------------
  // Action: Summon Demon
  // ---------------------------------------------------------------------------

  const summonDemon = useCallback((id: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_DEMONS.find((d) => d.id === id);
    if (!def) return { success: false, state };
    if (state.brDemons[id]?.owned) return { success: false, state };

    let next = state;
    setState((prev) => {
      const xpGain = def.xpReward;
      const nextXp = prev.brXp + xpGain;
      const nextLevel = brClampLevel(prev.brLevel);
      let leveledUp = false;

      next = {
        ...prev,
        brDemons: {
          ...prev.brDemons,
          [id]: {
            owned: true,
            summonedAt: Date.now(),
            power: def.power,
            encounterCount: (prev.brDemons[id]?.encounterCount ?? 0) + 1,
          },
        },
        brXp: nextXp,
        brStats: {
          ...prev.brStats,
          totalSummoned: prev.brStats.totalSummoned + 1,
          totalXpEarned: prev.brStats.totalXpEarned + xpGain,
          totalDemonPowerGained: prev.brStats.totalDemonPowerGained + def.power,
        },
      };

      // Check level up
      const needed = brXpRequired(nextLevel);
      if (nextXp >= needed) {
        next = { ...next, brLevel: brClampLevel(nextLevel + 1), brXp: nextXp - needed };
        leveledUp = true;
      }

      // Auto-title upgrade
      if (leveledUp) {
        const bestTitle = [...BR_TITLES].reverse().find((t) => next.brLevel >= t.levelRequired);
        if (bestTitle) {
          next = { ...next, brTitle: bestTitle.name };
        }
      }

      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Ignite Furnace
  // ---------------------------------------------------------------------------

  const igniteFurnace = useCallback((id: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_FURNACES.find((f) => f.id === id);
    if (!def) return { success: false, state };

    let next = state;
    setState((prev) => {
      const furnace = prev.brFurnaces[id];
      if (!furnace) return prev;
      const xpGain = 5 * furnace.level;
      next = {
        ...prev,
        brFurnaces: {
          ...prev.brFurnaces,
          [id]: {
            ...furnace,
            ignited: true,
            lastIgnitedAt: Date.now(),
            resourcesSmelted: furnace.resourcesSmelted + 1,
          },
        },
        brXp: prev.brXp + xpGain,
        brStats: {
          ...prev.brStats,
          totalSmelted: prev.brStats.totalSmelted + 1,
          totalXpEarned: prev.brStats.totalXpEarned + xpGain,
        },
      };

      const needed = brXpRequired(next.brLevel);
      if (next.brXp >= needed && next.brLevel < BR_MAX_LEVEL) {
        next = { ...next, brLevel: brClampLevel(next.brLevel + 1), brXp: next.brXp - needed };
        const bestTitle = [...BR_TITLES].reverse().find((t) => next.brLevel >= t.levelRequired);
        if (bestTitle) next = { ...next, brTitle: bestTitle.name };
      }

      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Build Structure
  // ---------------------------------------------------------------------------

  const buildStructure = useCallback((id: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_STRUCTURES.find((s) => s.id === id);
    if (!def) return { success: false, state };

    const existing = state.brStructures[id];
    if (existing?.built && existing.level >= def.maxLevel) return { success: false, state };

    const isUpgrade = existing?.built === true;
    const cost = isUpgrade ? def.upgradeCost : def.buildCost;
    if (state.brCoins < cost) return { success: false, state };

    let next = state;
    setState((prev) => {
      const structs = prev.brStructures;
      const current = structs[id];
      const newLevel = current?.built ? current.level + 1 : 1;
      if (newLevel > def.maxLevel) return prev;

      const actualCost = current?.built ? def.upgradeCost : def.buildCost;
      if (prev.brCoins < actualCost) return prev;

      const isBuild = !current?.built;
      next = {
        ...prev,
        brCoins: prev.brCoins - actualCost,
        brStructures: {
          ...structs,
          [id]: {
            built: true,
            level: newLevel,
            builtAt: current?.builtAt ?? Date.now(),
          },
        },
        brStats: {
          ...prev.brStats,
          totalCoinsSpent: prev.brStats.totalCoinsSpent + actualCost,
          ...(isBuild ? { totalStructuresBuilt: prev.brStats.totalStructuresBuilt + 1 } : {}),
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Activate Artifact
  // ---------------------------------------------------------------------------

  const activateArtifact = useCallback((id: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_ARTIFACTS.find((a) => a.id === id);
    if (!def) return { success: false, state };
    if (state.brArtifacts.includes(id)) return { success: false, state };

    let next = state;
    setState((prev) => {
      if (prev.brArtifacts.includes(id)) return prev;
      next = {
        ...prev,
        brArtifacts: [...prev.brArtifacts, id],
        brStats: {
          ...prev.brStats,
          totalArtifactsActivated: prev.brStats.totalArtifactsActivated + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Trigger Crag Event
  // ---------------------------------------------------------------------------

  const triggerCragEvent = useCallback((): { success: boolean; event: BrCragEventDef | null; state: BrBrimstoneCragState } => {
    const rng = prngRef.current();
    const eventIndex = Math.floor(rng * BR_EVENTS.length);
    const event = BR_EVENTS[eventIndex];
    const now = Date.now();

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        brEvents: [...prev.brEvents, event.id],
        brActiveEventId: event.id,
        brActiveEventEnd: now + event.duration,
        brStats: {
          ...prev.brStats,
          totalEventsSurvived: prev.brStats.totalEventsSurvived + 1,
        },
      };

      // Positive events grant coins
      if (event.effectType === 'material_bonus' || event.effectType === 'sulfur_bonus') {
        const coinReward = Math.floor(event.effectValue * 0.5);
        next = {
          ...next,
          brCoins: next.brCoins + coinReward,
          brStats: { ...next.brStats, totalCoinsEarned: next.brStats.totalCoinsEarned + coinReward },
        };
      }

      return next;
    });
    return { success: true, event, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Reset
  // ---------------------------------------------------------------------------

  const resetBrimstoneCrag = useCallback(() => {
    const fresh = brCreateDefaultState();
    setState(fresh);
  }, []);

  // ---------------------------------------------------------------------------
  // Action: Add XP
  // ---------------------------------------------------------------------------

  const brAddXp = useCallback((amount: number): { success: boolean; leveledUp: boolean; state: BrBrimstoneCragState } => {
    if (amount <= 0) return { success: false, leveledUp: false, state };

    let leveledUp = false;
    let next = state;
    setState((prev) => {
      let newLevel = prev.brLevel;
      let newXp = prev.brXp + amount;

      const needed = brXpRequired(newLevel);
      if (newXp >= needed && newLevel < BR_MAX_LEVEL) {
        newXp -= needed;
        newLevel = brClampLevel(newLevel + 1);
        leveledUp = true;
      }

      const nextState = {
        ...prev,
        brLevel: newLevel,
        brXp: newXp,
        brStats: { ...prev.brStats, totalXpEarned: prev.brStats.totalXpEarned + amount },
      };

      if (leveledUp) {
        const bestTitle = [...BR_TITLES].reverse().find((t) => newLevel >= t.levelRequired);
        if (bestTitle) {
          return { ...nextState, brTitle: bestTitle.name };
        }
      }

      next = nextState;
      return nextState;
    });
    return { success: true, leveledUp, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Add Coins
  // ---------------------------------------------------------------------------

  const brAddCoins = useCallback((amount: number): { success: boolean; state: BrBrimstoneCragState } => {
    if (amount <= 0) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        brCoins: prev.brCoins + amount,
        brStats: { ...prev.brStats, totalCoinsEarned: prev.brStats.totalCoinsEarned + amount },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Spend Coins
  // ---------------------------------------------------------------------------

  const brSpendCoins = useCallback((amount: number): { success: boolean; state: BrBrimstoneCragState } => {
    if (amount <= 0) return { success: false, state };
    if (state.brCoins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        brCoins: prev.brCoins - amount,
        brStats: { ...prev.brStats, totalCoinsSpent: prev.brStats.totalCoinsSpent + amount },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Add Inventory Item
  // ---------------------------------------------------------------------------

  const brAddInventoryItem = useCallback((materialId: string, amount: number): { success: boolean; state: BrBrimstoneCragState } => {
    if (amount <= 0) return { success: false, state };
    const matDef = BR_MATERIALS.find((m) => m.id === materialId);
    if (!matDef) return { success: false, state };

    let next = state;
    setState((prev) => {
      const existing = prev.brInventory.find((i) => i.materialId === materialId);
      let newInventory: BrInventoryItem[];
      if (existing) {
        const cappedAmount = Math.min(existing.amount + amount, matDef.stackSize);
        newInventory = prev.brInventory.map((i) =>
          i.materialId === materialId ? { ...i, amount: cappedAmount } : i,
        );
      } else {
        const cappedAmount = Math.min(amount, matDef.stackSize);
        newInventory = [...prev.brInventory, { materialId, amount: cappedAmount }];
      }
      next = { ...prev, brInventory: newInventory };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Remove Inventory Item
  // ---------------------------------------------------------------------------

  const brRemoveInventoryItem = useCallback((materialId: string, amount: number): { success: boolean; state: BrBrimstoneCragState } => {
    if (amount <= 0) return { success: false, state };
    const existing = state.brInventory.find((i) => i.materialId === materialId);
    if (!existing || existing.amount < amount) return { success: false, state };

    let next = state;
    setState((prev) => {
      const remaining = existing.amount - amount;
      let newInventory: BrInventoryItem[];
      if (remaining <= 0) {
        newInventory = prev.brInventory.filter((i) => i.materialId !== materialId);
      } else {
        newInventory = prev.brInventory.map((i) =>
          i.materialId === materialId ? { ...i, amount: remaining } : i,
        );
      }
      next = { ...prev, brInventory: newInventory };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Boost Demon Power
  // ---------------------------------------------------------------------------

  const brBoostDemonPower = useCallback((id: string, bonusPower: number): { success: boolean; state: BrBrimstoneCragState } => {
    if (bonusPower <= 0) return { success: false, state };
    const demonState = state.brDemons[id];
    if (!demonState || !demonState.owned) return { success: false, state };

    let next = state;
    setState((prev) => {
      const ds = prev.brDemons[id];
      if (!ds) return prev;
      next = {
        ...prev,
        brDemons: {
          ...prev.brDemons,
          [id]: { ...ds, power: ds.power + bonusPower },
        },
        brStats: {
          ...prev.brStats,
          totalDemonPowerGained: prev.brStats.totalDemonPowerGained + bonusPower,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Dismiss Event
  // ---------------------------------------------------------------------------

  const brDismissEvent = useCallback((): { success: boolean; state: BrBrimstoneCragState } => {
    if (!state.brActiveEventId) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        brActiveEventId: null,
        brActiveEventEnd: null,
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Upgrade Furnace
  // ---------------------------------------------------------------------------

  const brUpgradeFurnace = useCallback((id: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_FURNACES.find((f) => f.id === id);
    if (!def) return { success: false, state };
    const fs = state.brFurnaces[id];
    if (!fs) return { success: false, state };

    const upgradeCost = def.level * 50;
    if (state.brCoins < upgradeCost) return { success: false, state };

    let next = state;
    setState((prev) => {
      const furnace = prev.brFurnaces[id];
      if (!furnace) return prev;
      next = {
        ...prev,
        brCoins: prev.brCoins - upgradeCost,
        brFurnaces: {
          ...prev.brFurnaces,
          [id]: { ...furnace, level: furnace.level + 1 },
        },
        brStats: { ...prev.brStats, totalCoinsSpent: prev.brStats.totalCoinsSpent + upgradeCost },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Use Ability (track usage count)
  // ---------------------------------------------------------------------------

  const brUseAbility = useCallback((abilityId: string): { success: boolean; state: BrBrimstoneCragState } => {
    const def = BR_ABILITIES.find((a) => a.id === abilityId);
    if (!def) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        brStats: {
          ...prev.brStats,
          totalAbilityUses: prev.brStats.totalAbilityUses + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Action: Set Title
  // ---------------------------------------------------------------------------

  const brSetTitle = useCallback((name: string): { success: boolean; state: BrBrimstoneCragState } => {
    const titleDef = BR_TITLES.find((t) => t.name === name);
    if (!titleDef) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = { ...prev, brTitle: name };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Core State
  // ---------------------------------------------------------------------------

  const brGetState = useCallback((): Readonly<BrBrimstoneCragState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const brGetLevel = useCallback((): number => {
    return state.brLevel;
  }, [state.brLevel]);

  const brGetXp = useCallback((): number => {
    return state.brXp;
  }, [state.brXp]);

  const brGetCoins = useCallback((): number => {
    return state.brCoins;
  }, [state.brCoins]);

  const brGetTitle = useCallback((): string => {
    return state.brTitle;
  }, [state.brTitle]);

  const brGetTotalStats = useCallback((): Readonly<typeof state.brStats> => {
    return Object.freeze({ ...state.brStats });
  }, [state.brStats]);

  const brGetXpRequired = useCallback((): number => {
    return brXpRequired(state.brLevel);
  }, [state.brLevel]);

  const brGetXpProgress = useCallback((): number => {
    const needed = brXpRequired(state.brLevel);
    if (needed <= 0 || needed === Infinity) return 1;
    return Math.min(1, state.brXp / needed);
  }, [state.brLevel, state.brXp]);

  const brCanAfford = useCallback((cost: number): boolean => {
    return state.brCoins >= cost;
  }, [state.brCoins]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Demons
  // ---------------------------------------------------------------------------

  const brGetDemonById = useCallback((id: string): BrDemonDef | null => {
    return BR_DEMONS.find((d) => d.id === id) ?? null;
  }, []);

  const brGetDemonState = useCallback((id: string): BrDemonState | null => {
    return state.brDemons[id] ?? null;
  }, [state.brDemons]);

  const brIsDemonOwned = useCallback((id: string): boolean => {
    return state.brDemons[id]?.owned ?? false;
  }, [state.brDemons]);

  const brGetDemonsByRarity = useCallback((rarity: BrRarity): BrDemonDef[] => {
    return BR_DEMONS.filter((d) => d.rarity === rarity);
  }, []);

  const brGetDemonsBySpecies = useCallback((species: BrDemonSpecies): BrDemonDef[] => {
    return BR_DEMONS.filter((d) => d.species === species);
  }, []);

  const brGetSpeciesCount = useCallback((): number => {
    return BR_SPECIES.length;
  }, []);

  const brGetSummonCost = useCallback((id: string): number => {
    const def = BR_DEMONS.find((d) => d.id === id);
    if (!def) return 0;
    const structureDiscount = brBuiltStructures.reduce((sum, s) => {
      const ss = state.brStructures[s.id];
      if (!ss || s.bonusType !== 'summon_power') return sum;
      return sum + s.bonusPerLevel * ss.level;
    }, 0);
    const artifactDiscount = brActivatedArtifacts.reduce((sum, a) => {
      if (a.bonusType === 'summon_power' || a.bonusType === 'summon_success') {
        return sum + a.bonusValue;
      }
      return sum;
    }, 0);
    const discount = Math.floor((structureDiscount + artifactDiscount) * 0.01);
    return Math.max(1, def.summonCost - discount);
  }, [brBuiltStructures, brActivatedArtifacts, state.brStructures]);

  const brGetDemonPower = useCallback((id: string): number => {
    return state.brDemons[id]?.power ?? 0;
  }, [state.brDemons]);

  const brGetDemonEncounterCount = useCallback((id: string): number => {
    return state.brDemons[id]?.encounterCount ?? 0;
  }, [state.brDemons]);

  const brGetDemonSummonTime = useCallback((id: string): number | null => {
    return state.brDemons[id]?.summonedAt ?? null;
  }, [state.brDemons]);

  const brGetHighestPowerDemon = useCallback((): BrDemonDef | null => {
    let highest: BrDemonDef | null = null;
    let highestPower = 0;
    for (const d of brOwnedDemons) {
      const ds = state.brDemons[d.id];
      if (ds && ds.power > highestPower) {
        highestPower = ds.power;
        highest = d;
      }
    }
    return highest;
  }, [brOwnedDemons, state.brDemons]);

  const brGetNewestDemon = useCallback((): BrDemonDef | null => {
    let newest: BrDemonDef | null = null;
    let newestTime = 0;
    for (const d of brOwnedDemons) {
      const ds = state.brDemons[d.id];
      if (ds?.summonedAt && ds.summonedAt > newestTime) {
        newestTime = ds.summonedAt;
        newest = d;
      }
    }
    return newest;
  }, [brOwnedDemons, state.brDemons]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Furnaces
  // ---------------------------------------------------------------------------

  const brGetFurnaceById = useCallback((id: string): BrFurnaceDef | null => {
    return BR_FURNACES.find((f) => f.id === id) ?? null;
  }, []);

  const brGetFurnaceState = useCallback((id: string): BrFurnaceState | null => {
    return state.brFurnaces[id] ?? null;
  }, [state.brFurnaces]);

  const brIsFurnaceIgnited = useCallback((id: string): boolean => {
    return state.brFurnaces[id]?.ignited ?? false;
  }, [state.brFurnaces]);

  const brGetFurnaceCapacity = useCallback((id: string): number => {
    const def = BR_FURNACES.find((f) => f.id === id);
    if (!def) return 0;
    const furnaceState = state.brFurnaces[id];
    if (!furnaceState) return def.capacity;
    return def.capacity + (furnaceState.level - def.level) * 10;
  }, [state.brFurnaces]);

  const brGetFurnaceOutput = useCallback((id: string): number => {
    const def = BR_FURNACES.find((f) => f.id === id);
    if (!def) return 0;
    const furnaceState = state.brFurnaces[id];
    if (!furnaceState) return def.level;
    return furnaceState.level;
  }, [state.brFurnaces]);

  const brGetFurnaceSmeltCount = useCallback((id: string): number => {
    return state.brFurnaces[id]?.resourcesSmelted ?? 0;
  }, [state.brFurnaces]);

  const brGetFurnaceLastIgnited = useCallback((id: string): number | null => {
    return state.brFurnaces[id]?.lastIgnitedAt ?? null;
  }, [state.brFurnaces]);

  const brGetHighestOutputFurnace = useCallback((): BrFurnaceDef | null => {
    let highest: BrFurnaceDef | null = null;
    let highestOutput = 0;
    for (const f of BR_FURNACES) {
      const output = brGetFurnaceOutput(f.id);
      if (output > highestOutput) {
        highestOutput = output;
        highest = f;
      }
    }
    return highest;
  }, [brGetFurnaceOutput]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Materials & Inventory
  // ---------------------------------------------------------------------------

  const brGetMaterialById = useCallback((id: string): BrMaterialDef | null => {
    return BR_MATERIALS.find((m) => m.id === id) ?? null;
  }, []);

  const brGetInventoryItem = useCallback((materialId: string): BrInventoryItem | undefined => {
    return state.brInventory.find((item) => item.materialId === materialId);
  }, [state.brInventory]);

  const brGetInventoryCount = useCallback((materialId: string): number => {
    return state.brInventory.find((item) => item.materialId === materialId)?.amount ?? 0;
  }, [state.brInventory]);

  const brGetMaterialsByRarity = useCallback((rarity: BrRarity): BrMaterialDef[] => {
    return BR_MATERIALS.filter((m) => m.rarity === rarity);
  }, []);

  const brHasMaterial = useCallback((materialId: string, amount: number): boolean => {
    return brGetInventoryCount(materialId) >= amount;
  }, [brGetInventoryCount]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Structures
  // ---------------------------------------------------------------------------

  const brGetStructureById = useCallback((id: string): BrStructureDef | null => {
    return BR_STRUCTURES.find((s) => s.id === id) ?? null;
  }, []);

  const brGetStructureState = useCallback((id: string): BrStructureState | null => {
    return state.brStructures[id] ?? null;
  }, [state.brStructures]);

  const brIsStructureBuilt = useCallback((id: string): boolean => {
    return state.brStructures[id]?.built ?? false;
  }, [state.brStructures]);

  const brGetStructureLevel = useCallback((id: string): number => {
    return state.brStructures[id]?.level ?? 0;
  }, [state.brStructures]);

  const brGetStructuresByBonusType = useCallback((bonusType: string): BrStructureDef[] => {
    return BR_STRUCTURES.filter((s) => s.bonusType === bonusType);
  }, []);

  const brGetUnbuiltStructures = useCallback((): BrStructureDef[] => {
    return BR_STRUCTURES.filter((s) => !(state.brStructures[s.id]?.built));
  }, [state.brStructures]);

  const brGetMaxLevelStructures = useCallback((): BrStructureDef[] => {
    return BR_STRUCTURES.filter((s) => {
      const ss = state.brStructures[s.id];
      return ss?.built && ss.level >= s.maxLevel;
    });
  }, [state.brStructures]);

  const brGetStructureBuiltTime = useCallback((id: string): number | null => {
    return state.brStructures[id]?.builtAt ?? null;
  }, [state.brStructures]);

  const brCanBuildStructure = useCallback((id: string): { canBuild: boolean; reason: string } => {
    const def = BR_STRUCTURES.find((s) => s.id === id);
    if (!def) return { canBuild: false, reason: 'Structure not found' };
    const existing = state.brStructures[id];
    if (existing?.built && existing.level >= def.maxLevel) return { canBuild: false, reason: 'Already at max level' };
    const cost = existing?.built ? def.upgradeCost : def.buildCost;
    if (state.brCoins < cost) return { canBuild: false, reason: 'Insufficient coins' };
    return { canBuild: true, reason: '' };
  }, [state.brStructures, state.brCoins]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Abilities
  // ---------------------------------------------------------------------------

  const brGetAbilityById = useCallback((id: string): BrAbilityDef | null => {
    return BR_ABILITIES.find((a) => a.id === id) ?? null;
  }, []);

  const brGetAbilitiesByType = useCallback((type: BrAbilityType): BrAbilityDef[] => {
    return BR_ABILITIES.filter((a) => a.type === type);
  }, []);

  const brGetAvailableAbilities = useCallback((playerLevel: number): BrAbilityDef[] => {
    return BR_ABILITIES.filter((a) => playerLevel >= a.unlockLevel);
  }, []);

  const brGetLockedAbilities = useCallback((playerLevel: number): BrAbilityDef[] => {
    return BR_ABILITIES.filter((a) => playerLevel < a.unlockLevel);
  }, []);

  const brGetAbilityPowerRange = useCallback((type: BrAbilityType): { min: number; max: number } => {
    const abilities = BR_ABILITIES.filter((a) => a.type === type);
    if (abilities.length === 0) return { min: 0, max: 0 };
    return {
      min: Math.min(...abilities.map((a) => a.power)),
      max: Math.max(...abilities.map((a) => a.power)),
    };
  }, []);

  const brGetMostPowerfulAbility = useCallback((type: BrAbilityType): BrAbilityDef | null => {
    const abilities = BR_ABILITIES.filter((a) => a.type === type);
    if (abilities.length === 0) return null;
    return abilities.reduce((best, a) => (a.power > best.power ? a : best), abilities[0]);
  }, []);

  // ---------------------------------------------------------------------------
  // Getter Functions — Artifacts
  // ---------------------------------------------------------------------------

  const brIsArtifactActivated = useCallback((id: string): boolean => {
    return state.brArtifacts.includes(id);
  }, [state.brArtifacts]);

  const brGetArtifactsByRarity = useCallback((rarity: BrRarity): BrArtifactDef[] => {
    return BR_ARTIFACTS.filter((a) => a.rarity === rarity);
  }, []);

  const brGetArtifactById = useCallback((id: string): BrArtifactDef | null => {
    return BR_ARTIFACTS.find((a) => a.id === id) ?? null;
  }, []);

  const brGetArtifactBonus = useCallback((bonusType: string): number => {
    return brActivatedArtifacts
      .filter((a) => a.bonusType === bonusType)
      .reduce((sum, a) => sum + a.bonusValue, 0);
  }, [brActivatedArtifacts]);

  const brGetMostPowerfulArtifact = useCallback((): BrArtifactDef | null => {
    if (brActivatedArtifacts.length === 0) return null;
    return brActivatedArtifacts.reduce((best, a) => (a.bonusValue > best.bonusValue ? a : best), brActivatedArtifacts[0]);
  }, [brActivatedArtifacts]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Achievements
  // ---------------------------------------------------------------------------

  const brIsAchievementUnlocked = useCallback((id: string): boolean => {
    return state.brAchievements.includes(id);
  }, [state.brAchievements]);

  const brGetAchievementById = useCallback((id: string): BrAchievementDef | null => {
    return BR_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  }, []);

  const brGetAchievementProgress = useCallback((id: string): { current: number; target: number } | null => {
    const def = BR_ACHIEVEMENTS.find((a) => a.id === id);
    if (!def) return null;
    const s = state.brStats;
    const structs = state.brStructures;
    const map: Record<string, number> = {
      totalSummoned: s.totalSummoned,
      totalSmelted: s.totalSmelted,
      structuresBuilt: Object.values(structs).filter((st) => st.built).length,
      artifactsActivated: state.brArtifacts.length,
      eventsSurvived: state.brEvents.length,
      commonDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'common' && state.brDemons[d.id]?.owned).length,
      uncommonDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'uncommon' && state.brDemons[d.id]?.owned).length,
      rareDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'rare' && state.brDemons[d.id]?.owned).length,
      epicDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'epic' && state.brDemons[d.id]?.owned).length,
      legendaryDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'legendary' && state.brDemons[d.id]?.owned).length,
    };
    return { current: map[def.conditionKey] ?? 0, target: def.targetValue };
  }, [state.brStats, state.brStructures, state.brArtifacts, state.brEvents, state.brDemons]);

  const brGetTotalAchievementXp = useCallback((): number => {
    return brUnlockedAchievements.reduce((sum, a) => sum + a.rewardXp, 0);
  }, [brUnlockedAchievements]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Events
  // ---------------------------------------------------------------------------

  const brGetEventById = useCallback((id: string): BrCragEventDef | null => {
    return BR_EVENTS.find((e) => e.id === id) ?? null;
  }, []);

  const brGetRandomEvent = useCallback((): BrCragEventDef | null => {
    const rng = prngRef.current();
    const index = Math.floor(rng * BR_EVENTS.length);
    return BR_EVENTS[index] ?? null;
  }, []);

  const brGetEventHistory = useCallback((): string[] => {
    return [...state.brEvents];
  }, [state.brEvents]);

  const brGetEventHistoryCount = useCallback((): number => {
    return state.brEvents.length;
  }, [state.brEvents]);

  const brGetPositiveEvents = useCallback((): BrCragEventDef[] => {
    return BR_EVENTS.filter((e) => e.effectType === 'material_bonus' || e.effectType === 'furnace_boost' || e.effectType === 'sulfur_bonus' || e.effectType === 'heal_all' || e.effectType === 'obsidian_bonus' || e.effectType === 'material_shower' || e.effectType === 'unlock_hidden' || e.effectType === 'rare_demon_chance');
  }, []);

  const brGetNegativeEvents = useCallback((): BrCragEventDef[] => {
    return BR_EVENTS.filter((e) => e.effectType === 'speed_penalty' || e.effectType === 'structure_damage' || e.effectType === 'demon_penalty');
  }, []);

  // ---------------------------------------------------------------------------
  // Getter Functions — Titles
  // ---------------------------------------------------------------------------

  const brGetCurrentTitle = useCallback((): BrTitleDef => {
    let current = BR_TITLES[0];
    for (const t of BR_TITLES) {
      if (state.brTitle === t.name) {
        return t;
      }
    }
    return current;
  }, [state.brTitle]);

  const brGetNextTitle = useCallback((): BrTitleDef | null => {
    const currentIndex = BR_TITLES.findIndex((t) => t.name === state.brTitle);
    if (currentIndex >= 0 && currentIndex < BR_TITLES.length - 1) {
      return BR_TITLES[currentIndex + 1];
    }
    return null;
  }, [state.brTitle]);

  const brGetAllTitles = useCallback((): BrTitleDef[] => {
    return [...BR_TITLES];
  }, []);

  const brIsTitleUnlocked = useCallback((name: string): boolean => {
    const def = BR_TITLES.find((t) => t.name === name);
    if (!def) return false;
    return state.brLevel >= def.levelRequired;
  }, [state.brLevel]);

  // ---------------------------------------------------------------------------
  // Getter Functions — Utility
  // ---------------------------------------------------------------------------

  const brGetColorTheme = useCallback((): BrColorTheme => {
    return { ...BR_COLORS };
  }, []);

  const brGetRarityInfo = useCallback((rarity: BrRarity): BrRarityDef | null => {
    return BR_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const brGetAllRarities = useCallback((): BrRarityDef[] => {
    return [...BR_RARITIES];
  }, []);

  const brGetRarityColor = useCallback((rarity: BrRarity): string => {
    const info = BR_RARITIES.find((r) => r.key === rarity);
    return info?.color ?? '#9CA3AF';
  }, []);

  const brGetRarityMultiplier = useCallback((rarity: BrRarity): number => {
    const info = BR_RARITIES.find((r) => r.key === rarity);
    return info?.xpMultiplier ?? 1;
  }, []);

  const brGetDayKey = useCallback((): string => {
    return brGenerateDayKey(Date.now());
  }, []);

  const brRandomInt = useCallback((min: number, max: number): number => {
    const rng = prngRef.current();
    return min + Math.floor(rng * (max - min + 1));
  }, []);

  const brGetStructureBuildCost = useCallback((id: string): number => {
    const def = BR_STRUCTURES.find((s) => s.id === id);
    if (!def) return 0;
    const existing = state.brStructures[id];
    return existing?.built ? def.upgradeCost : def.buildCost;
  }, [state.brStructures]);

  const brGetFurnaceUpgradeCost = useCallback((id: string): number => {
    const def = BR_FURNACES.find((f) => f.id === id);
    if (!def) return 0;
    return def.level * 50;
  }, []);

  // ---------------------------------------------------------------------------
  // Achievement Auto-Check
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const s = stateRef.current;
    const totalsMap: Record<string, number> = {
      totalSummoned: s.brStats.totalSummoned,
      totalSmelted: s.brStats.totalSmelted,
      structuresBuilt: Object.values(s.brStructures).filter((st) => st.built).length,
      artifactsActivated: s.brArtifacts.length,
      eventsSurvived: s.brEvents.length,
      commonDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'common' && s.brDemons[d.id]?.owned).length,
      uncommonDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'uncommon' && s.brDemons[d.id]?.owned).length,
      rareDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'rare' && s.brDemons[d.id]?.owned).length,
      epicDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'epic' && s.brDemons[d.id]?.owned).length,
      legendaryDemonsCollected: BR_DEMONS.filter((d) => d.rarity === 'legendary' && s.brDemons[d.id]?.owned).length,
    };

    let changed = false;
    const newAchievements = [...s.brAchievements];
    for (const ach of BR_ACHIEVEMENTS) {
      if (newAchievements.includes(ach.id)) continue;
      const value = totalsMap[ach.conditionKey] ?? 0;
      if (value >= ach.targetValue) {
        newAchievements.push(ach.id);
        changed = true;
      }
    }

    if (changed) {
      setState((prev) => ({
        ...prev,
        brAchievements: newAchievements,
      }));
    }
  }, [state.brStats, state.brStructures, state.brArtifacts, state.brEvents, state.brDemons]);

  // ---------------------------------------------------------------------------
  // Return API Object (Pattern A: constants directly on brAPI)
  // ---------------------------------------------------------------------------

  const brAPI = useMemo(() => ({
    // ── State ──
    brGetState,
    brGetLevel,
    brGetXp,
    brGetCoins,
    brGetTitle,
    brGetTotalStats,
    brGetXpRequired,
    brGetXpProgress,
    brCanAfford,
    brGetDayKey,

    // ── Color Theme ──
    BR_COLORS,
    BR_RARITY_COMMON,
    BR_RARITY_UNCOMMON,
    BR_RARITY_RARE,
    BR_RARITY_EPIC,
    BR_RARITY_LEGENDARY,
    BR_RARITIES,
    BR_SPECIES,

    // ── Counts ──
    BR_DEMON_COUNT,
    BR_FURNACE_COUNT,
    BR_MATERIAL_COUNT,
    BR_STRUCTURE_COUNT,
    BR_ABILITY_COUNT,
    BR_ACHIEVEMENT_COUNT,
    BR_TITLE_COUNT,
    BR_ARTIFACT_COUNT,
    BR_EVENT_COUNT,
    BR_MAX_STRUCTURE_LEVEL,
    BR_SUMMON_BASE_COST,
    BR_FURNACE_IGNITE_COST,
    BR_STRUCTURE_BUILD_COOLDOWN,
    BR_ARTIFACT_ACTIVATE_COOLDOWN,
    BR_MAX_LEVEL,
    BR_XP_TABLE,

    // ── Static Data ──
    BR_DEMONS,
    BR_FURNACES,
    BR_MATERIALS,
    BR_STRUCTURES,
    BR_ABILITIES,
    BR_ACHIEVEMENTS,
    BR_TITLES,
    BR_ARTIFACTS,
    BR_EVENTS,

    // ── Derived Data ──
    brOwnedDemons,
    brUnownedDemons,
    brOwnedDemonsByRarity,
    brOwnedDemonsBySpecies,
    brIgnitedFurnaces,
    brUnignitedFurnaces,
    brBuiltStructures,
    brActivatedArtifacts,
    brUnactivatedArtifacts,
    brUnlockedAchievements,
    brLockedAchievements,
    brTotalPower,
    brOverallProgress,
    brDemonCollectionRate,
    brFurnaceCompletionRate,
    brStructureCompletionRate,
    brArtifactCollectionRate,
    brAchievementCompletionRate,
    brAverageStructureLevel,
    brTotalStructureBonus,
    brTotalArtifactBonus,
    brActiveEvent,
    brIsEventActive,
    brInventoryTotalItems,
    brInventoryUniqueItems,
    brTotalFurnaceOutput,
    brRarityDistribution,
    brSpeciesCompletion,

    // ── Actions ──
    summonDemon,
    igniteFurnace,
    buildStructure,
    activateArtifact,
    triggerCragEvent,
    resetBrimstoneCrag,
    brAddXp,
    brAddCoins,
    brSpendCoins,
    brAddInventoryItem,
    brRemoveInventoryItem,
    brBoostDemonPower,
    brDismissEvent,
    brUpgradeFurnace,
    brUseAbility,
    brSetTitle,

    // ── Demon Getters ──
    brGetDemonById,
    brGetDemonState,
    brIsDemonOwned,
    brGetDemonsByRarity,
    brGetDemonsBySpecies,
    brGetSpeciesCount,
    brGetSummonCost,
    brGetDemonPower,
    brGetDemonEncounterCount,
    brGetDemonSummonTime,
    brGetHighestPowerDemon,
    brGetNewestDemon,

    // ── Furnace Getters ──
    brGetFurnaceById,
    brGetFurnaceState,
    brIsFurnaceIgnited,
    brGetFurnaceCapacity,
    brGetFurnaceOutput,
    brGetFurnaceSmeltCount,
    brGetFurnaceLastIgnited,
    brGetHighestOutputFurnace,
    brGetFurnaceUpgradeCost,

    // ── Material Getters ──
    brGetMaterialById,
    brGetInventoryItem,
    brGetInventoryCount,
    brGetMaterialsByRarity,
    brHasMaterial,

    // ── Structure Getters ──
    brGetStructureById,
    brGetStructureState,
    brIsStructureBuilt,
    brGetStructureLevel,
    brGetStructuresByBonusType,
    brGetUnbuiltStructures,
    brGetMaxLevelStructures,
    brGetStructureBuiltTime,
    brCanBuildStructure,
    brGetStructureBuildCost,

    // ── Ability Getters ──
    brGetAbilityById,
    brGetAbilitiesByType,
    brGetAvailableAbilities,
    brGetLockedAbilities,
    brGetAbilityPowerRange,
    brGetMostPowerfulAbility,

    // ── Artifact Getters ──
    brIsArtifactActivated,
    brGetArtifactsByRarity,
    brGetArtifactById,
    brGetArtifactBonus,
    brGetMostPowerfulArtifact,

    // ── Achievement Getters ──
    brIsAchievementUnlocked,
    brGetAchievementById,
    brGetAchievementProgress,
    brGetTotalAchievementXp,

    // ── Event Getters ──
    brGetEventById,
    brGetRandomEvent,
    brGetEventHistory,
    brGetEventHistoryCount,
    brGetPositiveEvents,
    brGetNegativeEvents,

    // ── Title Getters ──
    brGetCurrentTitle,
    brGetNextTitle,
    brGetAllTitles,
    brIsTitleUnlocked,

    // ── Utility ──
    brGetColorTheme,
    brGetRarityInfo,
    brGetAllRarities,
    brGetRarityColor,
    brGetRarityMultiplier,
    brRandomInt,
  }), [
    brGetState,
    brGetLevel,
    brGetXp,
    brGetCoins,
    brGetTitle,
    brGetTotalStats,
    brGetXpRequired,
    brGetXpProgress,
    brCanAfford,
    brGetDayKey,
    BR_COLORS,
    BR_RARITY_COMMON,
    BR_RARITY_UNCOMMON,
    BR_RARITY_RARE,
    BR_RARITY_EPIC,
    BR_RARITY_LEGENDARY,
    BR_RARITIES,
    BR_SPECIES,
    BR_DEMON_COUNT,
    BR_FURNACE_COUNT,
    BR_MATERIAL_COUNT,
    BR_STRUCTURE_COUNT,
    BR_ABILITY_COUNT,
    BR_ACHIEVEMENT_COUNT,
    BR_TITLE_COUNT,
    BR_ARTIFACT_COUNT,
    BR_EVENT_COUNT,
    BR_MAX_STRUCTURE_LEVEL,
    BR_SUMMON_BASE_COST,
    BR_FURNACE_IGNITE_COST,
    BR_STRUCTURE_BUILD_COOLDOWN,
    BR_ARTIFACT_ACTIVATE_COOLDOWN,
    BR_MAX_LEVEL,
    BR_XP_TABLE,
    BR_DEMONS,
    BR_FURNACES,
    BR_MATERIALS,
    BR_STRUCTURES,
    BR_ABILITIES,
    BR_ACHIEVEMENTS,
    BR_TITLES,
    BR_ARTIFACTS,
    BR_EVENTS,
    brOwnedDemons,
    brUnownedDemons,
    brOwnedDemonsByRarity,
    brOwnedDemonsBySpecies,
    brIgnitedFurnaces,
    brUnignitedFurnaces,
    brBuiltStructures,
    brActivatedArtifacts,
    brUnactivatedArtifacts,
    brUnlockedAchievements,
    brLockedAchievements,
    brTotalPower,
    brOverallProgress,
    brDemonCollectionRate,
    brFurnaceCompletionRate,
    brStructureCompletionRate,
    brArtifactCollectionRate,
    brAchievementCompletionRate,
    brAverageStructureLevel,
    brTotalStructureBonus,
    brTotalArtifactBonus,
    brActiveEvent,
    brIsEventActive,
    brInventoryTotalItems,
    brInventoryUniqueItems,
    brTotalFurnaceOutput,
    brRarityDistribution,
    brSpeciesCompletion,
    summonDemon,
    igniteFurnace,
    buildStructure,
    activateArtifact,
    triggerCragEvent,
    resetBrimstoneCrag,
    brAddXp,
    brAddCoins,
    brSpendCoins,
    brAddInventoryItem,
    brRemoveInventoryItem,
    brBoostDemonPower,
    brDismissEvent,
    brUpgradeFurnace,
    brUseAbility,
    brSetTitle,
    brGetDemonById,
    brGetDemonState,
    brIsDemonOwned,
    brGetDemonsByRarity,
    brGetDemonsBySpecies,
    brGetSpeciesCount,
    brGetSummonCost,
    brGetDemonPower,
    brGetDemonEncounterCount,
    brGetDemonSummonTime,
    brGetHighestPowerDemon,
    brGetNewestDemon,
    brGetFurnaceById,
    brGetFurnaceState,
    brIsFurnaceIgnited,
    brGetFurnaceCapacity,
    brGetFurnaceOutput,
    brGetFurnaceSmeltCount,
    brGetFurnaceLastIgnited,
    brGetHighestOutputFurnace,
    brGetFurnaceUpgradeCost,
    brGetMaterialById,
    brGetInventoryItem,
    brGetInventoryCount,
    brGetMaterialsByRarity,
    brHasMaterial,
    brGetStructureById,
    brGetStructureState,
    brIsStructureBuilt,
    brGetStructureLevel,
    brGetStructuresByBonusType,
    brGetUnbuiltStructures,
    brGetMaxLevelStructures,
    brGetStructureBuiltTime,
    brCanBuildStructure,
    brGetStructureBuildCost,
    brGetAbilityById,
    brGetAbilitiesByType,
    brGetAvailableAbilities,
    brGetLockedAbilities,
    brGetAbilityPowerRange,
    brGetMostPowerfulAbility,
    brIsArtifactActivated,
    brGetArtifactsByRarity,
    brGetArtifactById,
    brGetArtifactBonus,
    brGetMostPowerfulArtifact,
    brIsAchievementUnlocked,
    brGetAchievementById,
    brGetAchievementProgress,
    brGetTotalAchievementXp,
    brGetEventById,
    brGetRandomEvent,
    brGetEventHistory,
    brGetEventHistoryCount,
    brGetPositiveEvents,
    brGetNegativeEvents,
    brGetCurrentTitle,
    brGetNextTitle,
    brGetAllTitles,
    brIsTitleUnlocked,
    brGetColorTheme,
    brGetRarityInfo,
    brGetAllRarities,
    brGetRarityColor,
    brGetRarityMultiplier,
    brRandomInt,
  ]);

  return brAPI;
}
