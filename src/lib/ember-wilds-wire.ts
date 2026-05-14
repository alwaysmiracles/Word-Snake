import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

// ============================================================
// Ember Wilds — Untamed Wilderness Survival Wire
// ============================================================

// ============================================================
// Types
// ============================================================

export type EwRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type EwCreatureHabitat = 'smoldering_plains' | 'cinder_forest' | 'lava_marshes' | 'ember_peaks' | 'scorched_canyon' | 'flame_meadow' | 'ash_wasteland' | 'inferno_heart';

export type EwExploreAction = 'scout' | 'track' | 'tame' | 'survive';

export type EwWildfireSeverity = 'smoke' | 'blaze' | 'inferno' | 'cataclysm';

export type EwOutpostType = 'watchtower' | 'forge' | 'greenhouse' | 'beast_pen' | 'armory' | 'smokehouse' | 'herbalist' | 'barracks' | 'trading_post' | 'fire_break' | 'lumber_mill' | 'crystal_lab' | 'beacon_tower' | 'medic_station' | 'ash_farm' | 'ore_refinery' | 'war_room' | 'skink_den' | 'magma_pump' | 'ancient_ruin' | 'water_well' | 'compost_yard' | 'rune_forge' | 'scout_camp' | 'thunder_trap';

export type EwSkillCategory = 'exploration' | 'combat' | 'crafting' | 'survival';

export interface EwCreatureDef {
  id: string;
  name: string;
  rarity: EwRarity;
  habitatId: EwCreatureHabitat;
  description: string;
  emoji: string;
  xpReward: number;
  tameChance: number;
  requiredLevel: number;
  bondLevel: number;
}

export interface EwZoneDef {
  id: EwCreatureHabitat;
  name: string;
  description: string;
  emoji: string;
  unlockLevel: number;
  baseGatherRate: number;
  creatureList: string[];
  resourceList: string[];
  wildfireVulnerability: number;
}

export interface EwResourceDef {
  id: string;
  name: string;
  rarity: EwRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  habitatId: string;
  stackSize: number;
  coinValue: number;
}

export interface EwOutpostDef {
  id: string;
  name: string;
  type: EwOutpostType;
  description: string;
  emoji: string;
  buildCost: { coins: number; resources: Record<string, number> };
  upgradeCost: { coins: number; resources: Record<string, number> };
  maxLevel: number;
  requiredLevel: number;
  bonusType: string;
  bonusValue: number;
}

export interface EwSkillDef {
  id: string;
  name: string;
  category: EwSkillCategory;
  description: string;
  emoji: string;
  unlockLevel: number;
  maxLevel: number;
  xpToNext: number;
  effectType: string;
  effectValue: number;
}

export interface EwAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardCoins: number;
  rewardXp: number;
  emoji: string;
}

export interface EwTitleInfo {
  name: string;
  levelRequired: number;
  description: string;
}

export interface EwRarityInfo {
  key: EwRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

export interface EwColorTheme {
  emberOrange: string;
  magmaRed: string;
  ashGray: string;
  coalBlack: string;
  flameYellow: string;
  smokeSilver: string;
}

export interface EwCreatureState {
  discovered: boolean;
  tamed: boolean;
  bondLevel: number;
  lastSeen: number | null;
  encounterCount: number;
}

export interface EwZoneState {
  discovered: boolean;
  level: number;
  gatherCount: number;
  patrolCount: number;
  creaturesFound: number;
  lastExplored: number | null;
  currentWildfire: EwWildfireSeverity | null;
  wildfireEndsAt: number | null;
}

export interface EwOutpostState {
  built: boolean;
  level: number;
  health: number;
  builtAt: number | null;
  lastUpgradedAt: number | null;
}

export interface EwSkillState {
  unlocked: boolean;
  level: number;
  xp: number;
  cooldownEnd: number;
}

export interface EwAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface EwDailyPatrolState {
  lastDate: string | null;
  streak: number;
  completed: boolean;
  questType: EwExploreAction | null;
  questProgress: number;
  questTarget: number;
  rewardClaimed: boolean;
}

export interface EwWildfireEvent {
  zoneId: string | null;
  severity: EwWildfireSeverity | null;
  startTime: number | null;
  endTime: number | null;
  rewardClaimed: boolean;
  progress: number;
  targetProgress: number;
}

export interface EwTotals {
  totalExplored: number;
  totalCreaturesTamed: number;
  totalResourcesGathered: number;
  totalOutpostsBuilt: number;
  totalWildfiresSurvived: number;
  totalBondLevelsGained: number;
  totalSkillsUsed: number;
  totalPatrolsCompleted: number;
  totalCoinsEarned: number;
}

export interface EmberWildsState {
  level: number;
  xp: number;
  coins: number;
  title: string;
  creatures: Record<string, EwCreatureState>;
  zones: Record<string, EwZoneState>;
  resources: Record<string, number>;
  outposts: Record<string, EwOutpostState>;
  skills: Record<string, EwSkillState>;
  achievements: Record<string, EwAchievementState>;
  dailyPatrol: EwDailyPatrolState;
  wildfireEvent: EwWildfireEvent;
  totals: EwTotals;
  seed: number;
}

// ============================================================
// Seeded PRNG
// ============================================================

function ewMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================
// Helper Functions
// ============================================================

export const EW_MAX_LEVEL = 50;

function ewXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= EW_MAX_LEVEL) return Infinity;
  return Math.floor(120 * level * (1 + level * 0.15));
}

function ewClampLevel(lvl: number): number {
  return Math.max(1, Math.min(EW_MAX_LEVEL, lvl));
}

function ewClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function ewGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function ewRarityMultiplier(r: EwRarity): number {
  const map: Record<EwRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5,
  };
  return map[r] ?? 1;
}

// ============================================================
// Constants
// ============================================================

export const EW_COLOR_THEME: EwColorTheme = {
  emberOrange: '#FF6600',
  magmaRed: '#B22222',
  ashGray: '#696969',
  coalBlack: '#1C1C1C',
  flameYellow: '#FFD700',
  smokeSilver: '#C0C0C0',
};

export const EW_RARITIES: EwRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 3 },
  { key: 'legendary', label: 'Legendary', color: '#FBBF24', xpMultiplier: 5 },
];

export const EW_TITLES: EwTitleInfo[] = [
  { name: 'Lost Wanderer', levelRequired: 1, description: 'A weary traveler who stumbled into the untamed ember wilds' },
  { name: 'Trailblazer', levelRequired: 5, description: 'You have learned to navigate the smoldering terrain with confidence' },
  { name: 'Ember Scout', levelRequired: 10, description: 'Your scouting skills are respected by outpost commanders across the wilds' },
  { name: 'Flame Tamer', levelRequired: 18, description: 'Wild creatures bow to your steady hand and patient spirit' },
  { name: 'Wildfire Warden', levelRequired: 25, description: 'You stand between civilization and the consuming flames' },
  { name: 'Ash Walker', levelRequired: 33, description: 'You stride through the aftermath of devastation without fear' },
  { name: 'Inferno Sentinel', levelRequired: 42, description: 'The greatest fires tremble at your approach — you are the wilds made manifest' },
  { name: 'Inferno Warden', levelRequired: 50, description: 'Supreme master of the Ember Wilds — the wilderness itself obeys your will' },
];

// ─── Zones (8 wilderness zones) ─────────────────────────────────────────

export const EW_ZONES: EwZoneDef[] = [
  {
    id: 'smoldering_plains',
    name: 'Smoldering Plains',
    description: 'Endless grasslands perpetually wreathed in low smoke, where ember foxes dart between burning tussocks',
    emoji: '🏜️',
    unlockLevel: 1,
    baseGatherRate: 0.72,
    creatureList: ['fire_salamander', 'ember_fox', 'scorch_hare', 'coal_beetle', 'spark_lizard'],
    resourceList: ['smoldering_herbs', 'coal_chunks', 'wild_berries', 'dry_tinder'],
    wildfireVulnerability: 0.4,
  },
  {
    id: 'cinder_forest',
    name: 'Cinder Forest',
    description: 'A forest of charred trees that still glow with inner fire, home to ancient ember wolves',
    emoji: '🌲',
    unlockLevel: 5,
    baseGatherRate: 0.65,
    creatureList: ['ember_wolf', 'ash_moth', 'cinder_sprite', 'bark_scorpion', 'ember_fox'],
    resourceList: ['ancient_wood', 'charcoal', 'cinder_moss', 'pine_ember'],
    wildfireVulnerability: 0.6,
  },
  {
    id: 'lava_marshes',
    name: 'Lava Marshes',
    description: 'Bubbling marshes where magma seeps through cracks in the earth, teeming with heat-resistant life',
    emoji: '🌋',
    unlockLevel: 10,
    baseGatherRate: 0.58,
    creatureList: ['magma_toad', 'ash_serpent', 'smoke_wraith', 'ember_fox', 'fire_salamander'],
    resourceList: ['fire_crystals', 'sulfur_lily', 'hot_spring_salts', 'obsidian_shards'],
    wildfireVulnerability: 0.2,
  },
  {
    id: 'ember_peaks',
    name: 'Ember Peaks',
    description: 'Towering volcanic mountains where magma bears roam and rare minerals gleam in the heat',
    emoji: '⛰️',
    unlockLevel: 15,
    baseGatherRate: 0.52,
    creatureList: ['magma_bear', 'phoenix_hawk', 'rock_golem', 'ember_wolf', 'spark_lizard'],
    resourceList: ['rare_minerals', 'volcanic_glass', 'fire_opals', 'stone_herb'],
    wildfireVulnerability: 0.3,
  },
  {
    id: 'scorched_canyon',
    name: 'Scorched Canyon',
    description: 'A deep canyon carved by ancient lava flows, where heat shimmers reveal hidden paths',
    emoji: '🏜️',
    unlockLevel: 20,
    baseGatherRate: 0.48,
    creatureList: ['ash_serpent', 'cinder_sprite', 'phoenix_hawk', 'fire_salamander', 'magma_toad'],
    resourceList: ['sulfur_lily', 'obsidian_shards', 'canyon_roots', 'rare_minerals'],
    wildfireVulnerability: 0.5,
  },
  {
    id: 'flame_meadow',
    name: 'Flame Meadow',
    description: 'A deceptively beautiful meadow of fire-resistant flowers that bloom in perpetual sunset hues',
    emoji: '🌻',
    unlockLevel: 28,
    baseGatherRate: 0.45,
    creatureList: ['ember_fox', 'phoenix_hawk', 'cinder_sprite', 'magma_bear', 'ash_moth'],
    resourceList: ['sunfire_blossom', 'honeydew_nectar', 'wild_berries', 'smoldering_herbs'],
    wildfireVulnerability: 0.7,
  },
  {
    id: 'ash_wasteland',
    name: 'Ash Wasteland',
    description: 'A vast expanse of grey ash where ancient embers still smolder beneath the surface',
    emoji: '🌫️',
    unlockLevel: 35,
    baseGatherRate: 0.42,
    creatureList: ['magma_bear', 'phoenix_hawk', 'magma_toad', 'ember_wolf', 'ash_serpent'],
    resourceList: ['ancient_wood', 'obsidian_shards', 'rare_minerals', 'fire_crystals'],
    wildfireVulnerability: 0.3,
  },
  {
    id: 'inferno_heart',
    name: 'Inferno Heart',
    description: 'The blazing core of the wilds — a living caldera where only the mightiest creatures dare to dwell',
    emoji: '🔥',
    unlockLevel: 45,
    baseGatherRate: 0.35,
    creatureList: ['inferno_dragon', 'phoenix_hawk', 'magma_bear', 'ember_wolf', 'ash_serpent'],
    resourceList: ['fire_crystals', 'rare_minerals', 'sunfire_blossom', 'ancient_wood'],
    wildfireVulnerability: 1.0,
  },
];

// ─── Creatures (35 wild creatures across 5 rarity tiers) ─────────────────

export const EW_CREATURES: EwCreatureDef[] = [
  // Common (8)
  { id: 'fire_salamander', name: 'Fire Salamander', rarity: 'common', habitatId: 'smoldering_plains', description: 'A small amphibian that thrives in warm ash, its skin glowing with inner heat', emoji: '🦎', xpReward: 12, tameChance: 0.55, requiredLevel: 1, bondLevel: 1 },
  { id: 'ember_fox', name: 'Ember Fox', rarity: 'common', habitatId: 'smoldering_plains', description: 'A cunning fox with fur that shimmers like burning embers at dusk', emoji: '🦊', xpReward: 10, tameChance: 0.50, requiredLevel: 1, bondLevel: 1 },
  { id: 'scorch_hare', name: 'Scorch Hare', rarity: 'common', habitatId: 'smoldering_plains', description: 'A swift hare that leaves trails of steam as it bounds across hot terrain', emoji: '🐰', xpReward: 8, tameChance: 0.60, requiredLevel: 1, bondLevel: 1 },
  { id: 'coal_beetle', name: 'Coal Beetle', rarity: 'common', habitatId: 'smoldering_plains', description: 'A hard-shelled beetle that feeds on mineral deposits near hot springs', emoji: '🪲', xpReward: 6, tameChance: 0.65, requiredLevel: 1, bondLevel: 1 },
  { id: 'spark_lizard', name: 'Spark Lizard', rarity: 'common', habitatId: 'smoldering_plains', description: 'A tiny lizard that generates static sparks when threatened', emoji: '🦎', xpReward: 9, tameChance: 0.58, requiredLevel: 1, bondLevel: 1 },
  { id: 'ash_moth', name: 'Ash Moth', rarity: 'common', habitatId: 'cinder_forest', description: 'A grey moth whose wings scatter cooling ash in its wake', emoji: '🦋', xpReward: 8, tameChance: 0.55, requiredLevel: 3, bondLevel: 1 },
  { id: 'bark_scorpion', name: 'Bark Scorpion', rarity: 'common', habitatId: 'cinder_forest', description: 'A scorpion that hides beneath charred bark, its sting burning like a match', emoji: '🦂', xpReward: 10, tameChance: 0.45, requiredLevel: 3, bondLevel: 1 },
  { id: 'cinder_sprite', name: 'Cinder Sprite', rarity: 'common', habitatId: 'cinder_forest', description: 'A mischievous spirit born from dying campfires that plays tricks on travelers', emoji: '👻', xpReward: 11, tameChance: 0.48, requiredLevel: 5, bondLevel: 1 },
  // Uncommon (8)
  { id: 'ember_wolf', name: 'Ember Wolf', rarity: 'uncommon', habitatId: 'cinder_forest', description: 'A pack hunter with burning eyes and fur that crackles with latent heat', emoji: '🐺', xpReward: 28, tameChance: 0.32, requiredLevel: 5, bondLevel: 2 },
  { id: 'magma_toad', name: 'Magma Toad', rarity: 'uncommon', habitatId: 'lava_marshes', description: 'A bloated amphibian that swims through molten rock without harm', emoji: '🐸', xpReward: 25, tameChance: 0.35, requiredLevel: 8, bondLevel: 2 },
  { id: 'smoke_wraith', name: 'Smoke Wraith', rarity: 'uncommon', habitatId: 'lava_marshes', description: 'A semi-corporeal entity that drifts through volcanic vents', emoji: '💨', xpReward: 30, tameChance: 0.28, requiredLevel: 10, bondLevel: 2 },
  { id: 'flame_stag', name: 'Flame Stag', rarity: 'uncommon', habitatId: 'smoldering_plains', description: 'A majestic stag whose antlers burn with a steady, mesmerizing flame', emoji: '🦌', xpReward: 26, tameChance: 0.30, requiredLevel: 6, bondLevel: 2 },
  { id: 'heat_viper', name: 'Heat Viper', rarity: 'uncommon', habitatId: 'scorched_canyon', description: 'A venomous snake whose bite injects molten venom', emoji: '🐍', xpReward: 24, tameChance: 0.33, requiredLevel: 8, bondLevel: 2 },
  { id: 'ember_crab', name: 'Ember Crab', rarity: 'uncommon', habitatId: 'lava_marshes', description: 'A crustacean with a shell of cooled volcanic glass', emoji: '🦀', xpReward: 22, tameChance: 0.38, requiredLevel: 7, bondLevel: 2 },
  { id: 'fire_ant_colony', name: 'Fire Ant Colony', rarity: 'uncommon', habitatId: 'flame_meadow', description: 'A massive colony of fire ants that builds towering mounds in the ash', emoji: '🐜', xpReward: 20, tameChance: 0.36, requiredLevel: 6, bondLevel: 2 },
  { id: 'glow_scorpion', name: 'Glow Scorpion', rarity: 'uncommon', habitatId: 'scorched_canyon', description: 'A scorpion whose stinger glows with captured starlight', emoji: '✨', xpReward: 27, tameChance: 0.30, requiredLevel: 10, bondLevel: 2 },
  // Rare (8)
  { id: 'ash_serpent', name: 'Ash Serpent', rarity: 'rare', habitatId: 'scorched_canyon', description: 'A massive serpent that burrows through ash dunes, creating tunnels for smaller creatures', emoji: '🐍', xpReward: 60, tameChance: 0.18, requiredLevel: 15, bondLevel: 3 },
  { id: 'magma_bear', name: 'Magma Bear', rarity: 'rare', habitatId: 'ember_peaks', description: 'A colossal bear with a pelt of hardened magma plates that radiate intense heat', emoji: '🐻', xpReward: 65, tameChance: 0.15, requiredLevel: 18, bondLevel: 3 },
  { id: 'phoenix_hawk', name: 'Phoenix Hawk', rarity: 'rare', habitatId: 'ember_peaks', description: 'A hawk that can burst into flame and reform mid-flight, swooping through infernos', emoji: '🦅', xpReward: 58, tameChance: 0.17, requiredLevel: 15, bondLevel: 3 },
  { id: 'rock_golem', name: 'Rock Golem', rarity: 'rare', habitatId: 'ember_peaks', description: 'A lumbering construct of volcanic rock animated by ancient geothermal energy', emoji: '🗿', xpReward: 70, tameChance: 0.12, requiredLevel: 18, bondLevel: 3 },
  { id: 'flame_cheetah', name: 'Flame Cheetah', rarity: 'rare', habitatId: 'flame_meadow', description: 'The fastest creature in the wilds, leaving a streak of fire wherever it runs', emoji: '🐆', xpReward: 55, tameChance: 0.20, requiredLevel: 20, bondLevel: 3 },
  { id: 'cinder_owl', name: 'Cinder Owl', rarity: 'rare', habitatId: 'cinder_forest', description: 'An owl of remarkable intelligence that can see through smoke and flame', emoji: '🦉', xpReward: 50, tameChance: 0.22, requiredLevel: 15, bondLevel: 3 },
  { id: 'lava_newt', name: 'Lava Newt', rarity: 'rare', habitatId: 'lava_marshes', description: 'A brilliant orange newt that secretes a fireproof slime used in crafting', emoji: '🦎', xpReward: 48, tameChance: 0.22, requiredLevel: 15, bondLevel: 3 },
  { id: 'blaze_boar', name: 'Blaze Boar', rarity: 'rare', habitatId: 'ash_wasteland', description: 'A ferocious boar whose tusks glow white-hot when it charges', emoji: '🐗', xpReward: 62, tameChance: 0.16, requiredLevel: 18, bondLevel: 3 },
  // Epic (7)
  { id: 'volcanic_manticore', name: 'Volcanic Manticore', rarity: 'epic', habitatId: 'scorched_canyon', description: 'A terrifying chimera with a lion body, bat wings, and a scorpion tail that erupts lava', emoji: '🦁', xpReward: 140, tameChance: 0.08, requiredLevel: 30, bondLevel: 4 },
  { id: 'inferno_hydra', name: 'Inferno Hydra', rarity: 'epic', habitatId: 'ash_wasteland', description: 'A multi-headed serpent that regrows heads faster than they can be destroyed', emoji: '🐉', xpReward: 150, tameChance: 0.06, requiredLevel: 32, bondLevel: 4 },
  { id: 'ash_phoenix', name: 'Ash Phoenix', rarity: 'epic', habitatId: 'flame_meadow', description: 'A phoenix born from the ash of wildfire, less radiant than its flame kin but far more resilient', emoji: '🔥', xpReward: 130, tameChance: 0.09, requiredLevel: 28, bondLevel: 4 },
  { id: 'magma_titan', name: 'Magma Titan', rarity: 'epic', habitatId: 'ember_peaks', description: 'A towering humanoid formed entirely of flowing magma, awakened by deep tremors', emoji: '🌋', xpReward: 160, tameChance: 0.05, requiredLevel: 35, bondLevel: 4 },
  { id: 'smoke_dragon', name: 'Smoke Dragon', rarity: 'epic', habitatId: 'cinder_forest', description: 'A dragon that commands suffocating smoke clouds, blotting out the sun over vast areas', emoji: '🐲', xpReward: 135, tameChance: 0.07, requiredLevel: 30, bondLevel: 4 },
  { id: 'hellfire_griffin', name: 'Hellfire Griffin', rarity: 'epic', habitatId: 'inferno_heart', description: 'A griffin with feathers of black fire that burns hotter than any natural flame', emoji: '🦅', xpReward: 145, tameChance: 0.06, requiredLevel: 35, bondLevel: 4 },
  { id: 'earthquake_beetle', name: 'Earthquake Beetle', rarity: 'epic', habitatId: 'ash_wasteland', description: 'A beetle the size of a wagon whose footsteps trigger small earthquakes', emoji: '🪲', xpReward: 125, tameChance: 0.08, requiredLevel: 28, bondLevel: 4 },
  // Legendary (4)
  { id: 'inferno_dragon', name: 'Inferno Dragon', rarity: 'legendary', habitatId: 'inferno_heart', description: 'The supreme predator of the Ember Wilds — a dragon whose breath can melt mountains', emoji: '🐉', xpReward: 400, tameChance: 0.02, requiredLevel: 45, bondLevel: 5 },
  { id: 'primordial_phoenix', name: 'Primordial Phoenix', rarity: 'legendary', habitatId: 'inferno_heart', description: 'The original phoenix whose first fire created the Ember Wilds themselves', emoji: '🔥', xpReward: 380, tameChance: 0.03, requiredLevel: 45, bondLevel: 5 },
  { id: 'world_burner', name: 'World Burner', rarity: 'legendary', habitatId: 'inferno_heart', description: 'An ancient elemental that has destroyed and reshaped continents throughout history', emoji: '☄️', xpReward: 420, tameChance: 0.01, requiredLevel: 48, bondLevel: 5 },
  { id: 'ember_colossus', name: 'Ember Colossus', rarity: 'legendary', habitatId: 'inferno_heart', description: 'A being of pure ember energy that towers over the landscape like a walking volcano', emoji: '🏔️', xpReward: 450, tameChance: 0.01, requiredLevel: 50, bondLevel: 5 },
];

// ─── Resources (30 survival resources) ──────────────────────────────────

export const EW_RESOURCES: EwResourceDef[] = [
  // Common (8)
  { id: 'smoldering_herbs', name: 'Smoldering Herbs', rarity: 'common', description: 'Herbs that grow near warm vents, useful for basic healing poultices', emoji: '🌿', gatherXp: 8, habitatId: 'smoldering_plains', stackSize: 99, coinValue: 2 },
  { id: 'coal_chunks', name: 'Coal Chunks', rarity: 'common', description: 'Lumps of coal that still radiate warmth from ancient fires', emoji: '⬛', gatherXp: 6, habitatId: 'smoldering_plains', stackSize: 99, coinValue: 1 },
  { id: 'wild_berries', name: 'Wild Berries', rarity: 'common', description: 'Tart berries from flame-resistant bushes, a staple wilderness food', emoji: '🫐', gatherXp: 7, habitatId: 'smoldering_plains', stackSize: 99, coinValue: 1 },
  { id: 'dry_tinder', name: 'Dry Tinder', rarity: 'common', description: 'Extremely dry kindling perfect for starting campfires quickly', emoji: '🪵', gatherXp: 5, habitatId: 'smoldering_plains', stackSize: 99, coinValue: 1 },
  { id: 'charcoal', name: 'Charcoal', rarity: 'common', description: 'Burnt wood fragments used in crafting and outpost furnaces', emoji: '⬛', gatherXp: 7, habitatId: 'cinder_forest', stackSize: 99, coinValue: 2 },
  { id: 'cinder_moss', name: 'Cinder Moss', rarity: 'common', description: 'Soft grey moss that grows on charred bark, excellent for bedding', emoji: '🌿', gatherXp: 6, habitatId: 'cinder_forest', stackSize: 99, coinValue: 1 },
  { id: 'pine_ember', name: 'Pine Ember', rarity: 'common', description: 'Ember-coated pine cones that smolder for days when ignited', emoji: '🌲', gatherXp: 8, habitatId: 'cinder_forest', stackSize: 99, coinValue: 2 },
  { id: 'hot_spring_salts', name: 'Hot Spring Salts', rarity: 'common', description: 'Mineral salts harvested from geothermal pools with healing properties', emoji: '🧂', gatherXp: 9, habitatId: 'lava_marshes', stackSize: 99, coinValue: 3 },
  // Uncommon (8)
  { id: 'ancient_wood', name: 'Ancient Wood', rarity: 'uncommon', description: 'Petrified wood from trees that burned millennia ago, rich with magic', emoji: '🪵', gatherXp: 18, habitatId: 'cinder_forest', stackSize: 50, coinValue: 8 },
  { id: 'fire_crystals', name: 'Fire Crystals', rarity: 'uncommon', description: 'Crystals that pulse with inner fire, used to power outpost forges', emoji: '💎', gatherXp: 20, habitatId: 'lava_marshes', stackSize: 30, coinValue: 12 },
  { id: 'sulfur_lily', name: 'Sulfur Lily', rarity: 'uncommon', description: 'Yellow flowers that bloom near volcanic vents with potent alchemical uses', emoji: '🌼', gatherXp: 16, habitatId: 'lava_marshes', stackSize: 50, coinValue: 7 },
  { id: 'obsidian_shards', name: 'Obsidian Shards', rarity: 'uncommon', description: 'Sharp volcanic glass shards used for weapons and tools', emoji: '🗡️', gatherXp: 17, habitatId: 'scorched_canyon', stackSize: 40, coinValue: 10 },
  { id: 'stone_herb', name: 'Stone Herb', rarity: 'uncommon', description: 'A tough herb that grows in rocky crevices, used in fortifying potions', emoji: '🌱', gatherXp: 15, habitatId: 'ember_peaks', stackSize: 50, coinValue: 6 },
  { id: 'sunfire_blossom', name: 'Sunfire Blossom', rarity: 'uncommon', description: 'A radiant flower that captures and stores sunlight as usable energy', emoji: '🌺', gatherXp: 19, habitatId: 'flame_meadow', stackSize: 30, coinValue: 11 },
  { id: 'honeydew_nectar', name: 'Honeydew Nectar', rarity: 'uncommon', description: 'Golden nectar from fire-resistant bees, an excellent energy restorative', emoji: '🍯', gatherXp: 16, habitatId: 'flame_meadow', stackSize: 50, coinValue: 8 },
  { id: 'volcanic_glass', name: 'Volcanic Glass', rarity: 'uncommon', description: 'Translucent glass formed by rapid cooling of magma, prized by artisans', emoji: '🔮', gatherXp: 18, habitatId: 'ember_peaks', stackSize: 30, coinValue: 10 },
  // Rare (7)
  { id: 'rare_minerals', name: 'Rare Minerals', rarity: 'rare', description: 'Unusual mineral deposits found only in the deepest volcanic chambers', emoji: '💎', gatherXp: 40, habitatId: 'ember_peaks', stackSize: 20, coinValue: 30 },
  { id: 'fire_opals', name: 'Fire Opals', rarity: 'rare', description: 'Opalescent gemstones that glow with shifting fiery patterns', emoji: '💠', gatherXp: 45, habitatId: 'ember_peaks', stackSize: 15, coinValue: 40 },
  { id: 'canyon_roots', name: 'Canyon Roots', rarity: 'rare', description: 'Ancient roots that burrow through canyon walls, saturated with mineral-rich magma water', emoji: '🌿', gatherXp: 35, habitatId: 'scorched_canyon', stackSize: 20, coinValue: 25 },
  { id: 'magma_core', name: 'Magma Core', rarity: 'rare', description: 'A concentrated sphere of cooling magma that retains immense heat', emoji: '🔴', gatherXp: 42, habitatId: 'lava_marshes', stackSize: 10, coinValue: 35 },
  { id: 'infernal_ash', name: 'Infernal Ash', rarity: 'rare', description: 'Ash infused with dark fire magic, used in powerful enchantments', emoji: '🌫️', gatherXp: 38, habitatId: 'ash_wasteland', stackSize: 20, coinValue: 28 },
  { id: 'dragon_bone', name: 'Dragon Bone', rarity: 'rare', description: 'Fossilized bones from ancient dragons, incredibly durable and magically potent', emoji: '🦴', gatherXp: 50, habitatId: 'inferno_heart', stackSize: 10, coinValue: 45 },
  { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: 'rare', description: 'A single feather from a phoenix hawk that still radiates warmth centuries later', emoji: '🪶', gatherXp: 48, habitatId: 'inferno_heart', stackSize: 10, coinValue: 42 },
  // Epic (4)
  { id: 'primordial_ember', name: 'Primordial Ember', rarity: 'epic', description: 'An ember from the first fire that ever burned in the wilds, still burning after eons', emoji: '🔥', gatherXp: 100, habitatId: 'inferno_heart', stackSize: 5, coinValue: 120 },
  { id: 'world_tree_ash', name: 'World Tree Ash', rarity: 'epic', description: 'Ash from a world tree that once stood in the wilds before the first great wildfire', emoji: '🌍', gatherXp: 110, habitatId: 'ash_wasteland', stackSize: 5, coinValue: 150 },
  { id: 'void_fire_crystal', name: 'Void Fire Crystal', rarity: 'epic', description: 'A crystal that burns with black flame, drawing energy from the void itself', emoji: '💜', gatherXp: 95, habitatId: 'inferno_heart', stackSize: 5, coinValue: 130 },
  { id: 'timeless_resin', name: 'Timeless Resin', rarity: 'epic', description: 'Amber-like resin from trees that existed before time, preserving ancient fire spirits', emoji: '🟠', gatherXp: 105, habitatId: 'cinder_forest', stackSize: 5, coinValue: 140 },
  // Legendary (3)
  { id: 'heart_of_inferno', name: 'Heart of Inferno', rarity: 'legendary', description: 'The crystallized heart of the wilds\' fire — said to grant control over all flame', emoji: '❤️‍🔥', gatherXp: 300, habitatId: 'inferno_heart', stackSize: 1, coinValue: 500 },
  { id: 'dragon_heart_stone', name: 'Dragon Heart Stone', rarity: 'legendary', description: 'A gemstone formed from the petrified heart of an ancient dragon', emoji: '💚', gatherXp: 280, habitatId: 'inferno_heart', stackSize: 1, coinValue: 450 },
  { id: 'eternal_flame_essence', name: 'Eternal Flame Essence', rarity: 'legendary', description: 'Pure liquid fire that never extinguishes — the rarest substance in the wilds', emoji: '🔥', gatherXp: 350, habitatId: 'inferno_heart', stackSize: 1, coinValue: 600 },
];

// ─── Outpost Buildings (25) ────────────────────────────────────────────

export const EW_OUTPOSTS: EwOutpostDef[] = [
  { id: 'watchtower_01', name: 'Flame Watchtower', type: 'watchtower', description: 'A tall stone tower that surveys the surrounding wilderness for threats', emoji: '🗼', buildCost: { coins: 200, resources: { ancient_wood: 10, coal_chunks: 20 } }, upgradeCost: { coins: 500, resources: { ancient_wood: 20, fire_crystals: 5 } }, maxLevel: 5, requiredLevel: 1, bonusType: 'scout_range', bonusValue: 15 },
  { id: 'forge_01', name: 'Ember Forge', type: 'forge', description: 'A forge powered by volcanic heat for crafting weapons and tools', emoji: '🔨', buildCost: { coins: 300, resources: { obsidian_shards: 10, coal_chunks: 30 } }, upgradeCost: { coins: 600, resources: { obsidian_shards: 20, fire_crystals: 8 } }, maxLevel: 5, requiredLevel: 3, bonusType: 'craft_speed', bonusValue: 20 },
  { id: 'greenhouse_01', name: 'Fireproof Greenhouse', type: 'greenhouse', description: 'A heat-resistant greenhouse for cultivating rare herbs and plants', emoji: '🏡', buildCost: { coins: 250, resources: { ancient_wood: 15, smoldering_herbs: 10 } }, upgradeCost: { coins: 500, resources: { ancient_wood: 25, sulfur_lily: 5 } }, maxLevel: 5, requiredLevel: 3, bonusType: 'herb_yield', bonusValue: 20 },
  { id: 'beast_pen_01', name: 'Creature Enclosure', type: 'beast_pen', description: 'A reinforced pen for housing and caring for tamed creatures', emoji: '🐾', buildCost: { coins: 350, resources: { ancient_wood: 20, obsidian_shards: 5 } }, upgradeCost: { coins: 700, resources: { ancient_wood: 30, rare_minerals: 5 } }, maxLevel: 5, requiredLevel: 5, bonusType: 'tame_bonus', bonusValue: 10 },
  { id: 'armory_01', name: 'Heatproof Armory', type: 'armory', description: 'Stores fire-resistant armor and weapons for wilderness expeditions', emoji: '🛡️', buildCost: { coins: 400, resources: { obsidian_shards: 15, coal_chunks: 25 } }, upgradeCost: { coins: 800, resources: { obsidian_shards: 25, fire_opals: 3 } }, maxLevel: 5, requiredLevel: 7, bonusType: 'defense', bonusValue: 25 },
  { id: 'smokehouse_01', name: 'Wild Smokehouse', type: 'smokehouse', description: 'Preserves food and materials using natural volcanic smoke', emoji: '🏚️', buildCost: { coins: 200, resources: { ancient_wood: 12, coal_chunks: 15 } }, upgradeCost: { coins: 450, resources: { ancient_wood: 20, charcoal: 15 } }, maxLevel: 5, requiredLevel: 2, bonusType: 'food_preservation', bonusValue: 15 },
  { id: 'herbalist_01', name: 'Ash Herbalist', type: 'herbalist', description: 'Workshop for processing raw herbs into potent medicines and potions', emoji: '🧪', buildCost: { coins: 280, resources: { smoldering_herbs: 20, cinder_moss: 10 } }, upgradeCost: { coins: 550, resources: { sunfire_blossom: 8, stone_herb: 10 } }, maxLevel: 5, requiredLevel: 5, bonusType: 'potion_power', bonusValue: 20 },
  { id: 'barracks_01', name: 'Ember Barracks', type: 'barracks', description: 'Housing for wilderness scouts and defenders, boosting patrol efficiency', emoji: '🏰', buildCost: { coins: 500, resources: { ancient_wood: 25, obsidian_shards: 15 } }, upgradeCost: { coins: 1000, resources: { ancient_wood: 40, rare_minerals: 8 } }, maxLevel: 5, requiredLevel: 10, bonusType: 'patrol_speed', bonusValue: 18 },
  { id: 'trading_post_01', name: 'Wildfire Trading Post', type: 'trading_post', description: 'A trading hub where travelers exchange goods and information', emoji: '🏪', buildCost: { coins: 350, resources: { ancient_wood: 18, coal_chunks: 10 } }, upgradeCost: { coins: 700, resources: { ancient_wood: 30, volcanic_glass: 5 } }, maxLevel: 5, requiredLevel: 8, bonusType: 'trade_bonus', bonusValue: 15 },
  { id: 'fire_break_01', name: 'Fire Break Trench', type: 'fire_break', description: 'A defensive trench that slows wildfire spread through your outpost', emoji: '🕳️', buildCost: { coins: 150, resources: { coal_chunks: 30, dry_tinder: 10 } }, upgradeCost: { coins: 400, resources: { obsidian_shards: 15, charcoal: 20 } }, maxLevel: 5, requiredLevel: 6, bonusType: 'fire_resistance', bonusValue: 25 },
  { id: 'lumber_mill_01', name: 'Charcoal Lumber Mill', type: 'lumber_mill', description: 'Processes fallen timber into charcoal and usable lumber', emoji: '🪓', buildCost: { coins: 300, resources: { ancient_wood: 15, coal_chunks: 20 } }, upgradeCost: { coins: 600, resources: { ancient_wood: 25, charcoal: 15 } }, maxLevel: 5, requiredLevel: 4, bonusType: 'wood_yield', bonusValue: 22 },
  { id: 'crystal_lab_01', name: 'Crystal Research Lab', type: 'crystal_lab', description: 'Studies fire crystals and volcanic minerals for advanced crafting', emoji: '🔬', buildCost: { coins: 600, resources: { fire_crystals: 15, volcanic_glass: 10 } }, upgradeCost: { coins: 1200, resources: { fire_crystals: 25, rare_minerals: 10 } }, maxLevel: 5, requiredLevel: 15, bonusType: 'crystal_power', bonusValue: 20 },
  { id: 'beacon_tower_01', name: 'Wildfire Beacon', type: 'beacon_tower', description: 'An early warning system that lights up when wildfire approaches', emoji: '🔔', buildCost: { coins: 250, resources: { ancient_wood: 12, fire_crystals: 5 } }, upgradeCost: { coins: 550, resources: { fire_crystals: 10, rare_minerals: 5 } }, maxLevel: 5, requiredLevel: 5, bonusType: 'warning_range', bonusValue: 20 },
  { id: 'medic_station_01', name: 'Burn Treatment Station', type: 'medic_station', description: 'A medical station equipped to treat burns and smoke inhalation', emoji: '🏥', buildCost: { coins: 350, resources: { smoldering_herbs: 15, hot_spring_salts: 10 } }, upgradeCost: { coins: 700, resources: { sunfire_blossom: 8, hot_spring_salts: 15 } }, maxLevel: 5, requiredLevel: 8, bonusType: 'heal_speed', bonusValue: 25 },
  { id: 'ash_farm_01', name: 'Ash Enrichment Farm', type: 'ash_farm', description: 'Farms that use volcanic ash as incredibly fertile soil for rare crops', emoji: '🌾', buildCost: { coins: 280, resources: { smoldering_herbs: 15, charcoal: 10 } }, upgradeCost: { coins: 560, resources: { infernal_ash: 5, sulfur_lily: 8 } }, maxLevel: 5, requiredLevel: 7, bonusType: 'crop_yield', bonusValue: 18 },
  { id: 'ore_refinery_01', name: 'Ore Refinery', type: 'ore_refinery', description: 'Refines raw volcanic ores into pure metals and rare alloys', emoji: '⚙️', buildCost: { coins: 500, resources: { obsidian_shards: 20, coal_chunks: 30 } }, upgradeCost: { coins: 1000, resources: { rare_minerals: 10, fire_crystals: 8 } }, maxLevel: 5, requiredLevel: 12, bonusType: 'refine_speed', bonusValue: 20 },
  { id: 'war_room_01', name: 'Command War Room', type: 'war_room', description: 'A strategic planning room with maps and models of the entire wilds', emoji: '🗺️', buildCost: { coins: 600, resources: { ancient_wood: 20, volcanic_glass: 10 } }, upgradeCost: { coins: 1200, resources: { rare_minerals: 8, fire_opals: 3 } }, maxLevel: 5, requiredLevel: 15, bonusType: 'strategy_bonus', bonusValue: 22 },
  { id: 'skink_den_01', name: 'Heat Skink Den', type: 'skink_den', description: 'A warm underground chamber that attracts and nurtures small fire lizards', emoji: '🦎', buildCost: { coins: 220, resources: { coal_chunks: 15, cinder_moss: 10 } }, upgradeCost: { coins: 480, resources: { dry_tinder: 20, fire_crystals: 5 } }, maxLevel: 5, requiredLevel: 3, bonusType: 'creature_spawn', bonusValue: 15 },
  { id: 'magma_pump_01', name: 'Magma Pump Station', type: 'magma_pump', description: 'Channels magma flow to power outpost machinery and defenses', emoji: '🔧', buildCost: { coins: 450, resources: { obsidian_shards: 15, fire_crystals: 10 } }, upgradeCost: { coins: 900, resources: { magma_core: 5, fire_crystals: 15 } }, maxLevel: 5, requiredLevel: 10, bonusType: 'power_output', bonusValue: 25 },
  { id: 'ancient_ruin_01', name: 'Restored Ancient Ruin', type: 'ancient_ruin', description: 'An ancient structure being restored, unlocking forgotten technologies', emoji: '🏛️', buildCost: { coins: 800, resources: { ancient_wood: 30, rare_minerals: 10 } }, upgradeCost: { coins: 1500, resources: { dragon_bone: 3, timeless_resin: 2 } }, maxLevel: 5, requiredLevel: 20, bonusType: 'ancient_knowledge', bonusValue: 30 },
  { id: 'water_well_01', name: 'Geothermal Well', type: 'water_well', description: 'Taps into underground hot springs for reliable water and heat supply', emoji: '💧', buildCost: { coins: 300, resources: { obsidian_shards: 10, coal_chunks: 15 } }, upgradeCost: { coins: 650, resources: { hot_spring_salts: 10, volcanic_glass: 5 } }, maxLevel: 5, requiredLevel: 4, bonusType: 'water_supply', bonusValue: 20 },
  { id: 'compost_yard_01', name: 'Volcanic Compost Yard', type: 'compost_yard', description: 'Creates nutrient-rich compost from ash and organic matter', emoji: '♻️', buildCost: { coins: 180, resources: { smoldering_herbs: 10, charcoal: 10 } }, upgradeCost: { coins: 400, resources: { smoldering_herbs: 20, sulfur_lily: 5 } }, maxLevel: 5, requiredLevel: 2, bonusType: 'compost_yield', bonusValue: 15 },
  { id: 'rune_forge_01', name: 'Elemental Rune Forge', type: 'rune_forge', description: 'Engraves magical runes onto weapons and armor using volcanic fire', emoji: '🪄', buildCost: { coins: 700, resources: { fire_crystals: 20, rare_minerals: 10 } }, upgradeCost: { coins: 1400, resources: { void_fire_crystal: 3, fire_opals: 5 } }, maxLevel: 5, requiredLevel: 18, bonusType: 'enchant_power', bonusValue: 28 },
  { id: 'scout_camp_01', name: 'Forward Scout Camp', type: 'scout_camp', description: 'A hidden camp used by scouts to monitor distant wilderness areas', emoji: '⛺', buildCost: { coins: 200, resources: { ancient_wood: 10, dry_tinder: 10 } }, upgradeCost: { coins: 450, resources: { ancient_wood: 18, charcoal: 12 } }, maxLevel: 5, requiredLevel: 2, bonusType: 'scout_stealth', bonusValue: 20 },
  { id: 'thunder_trap_01', name: 'Thunder Fire Trap', type: 'thunder_trap', description: 'A defensive trap that channels fire and lightning to deter intruders', emoji: '⚡', buildCost: { coins: 400, resources: { fire_crystals: 10, obsidian_shards: 12 } }, upgradeCost: { coins: 850, resources: { fire_crystals: 18, rare_minerals: 8 } }, maxLevel: 5, requiredLevel: 12, bonusType: 'trap_damage', bonusValue: 22 },
];

// ─── Skills (22 survival skills and abilities) ─────────────────────────

export const EW_SKILLS: EwSkillDef[] = [
  // Exploration (6)
  { id: 'pathfinder', name: 'Pathfinder', category: 'exploration', description: 'Reduces travel time between zones by finding hidden trails', emoji: '🧭', unlockLevel: 1, maxLevel: 10, xpToNext: 30, effectType: 'travel_speed', effectValue: 5 },
  { id: 'trackers_eye', name: "Tracker's Eye", category: 'exploration', description: 'Increases creature encounter rate in all zones', emoji: '👁️', unlockLevel: 3, maxLevel: 10, xpToNext: 35, effectType: 'encounter_rate', effectValue: 8 },
  { id: 'zone_sense', name: 'Zone Sense', category: 'exploration', description: 'Detects nearby resources and hidden areas more reliably', emoji: '🗺️', unlockLevel: 6, maxLevel: 10, xpToNext: 40, effectType: 'detection_range', effectValue: 10 },
  { id: 'wilderness_stealth', name: 'Wilderness Stealth', category: 'exploration', description: 'Move silently through dangerous zones to avoid hostile encounters', emoji: '🥷', unlockLevel: 10, maxLevel: 10, xpToNext: 45, effectType: 'stealth', effectValue: 12 },
  { id: 'ash_reading', name: 'Ash Reading', category: 'exploration', description: 'Interpret ash patterns to predict wildfire movements and creature migrations', emoji: '🌫️', unlockLevel: 15, maxLevel: 10, xpToNext: 50, effectType: 'prediction', effectValue: 15 },
  { id: 'sky_surveyor', name: 'Sky Surveyor', category: 'exploration', description: 'Climb high points to survey vast areas and mark points of interest', emoji: '🔭', unlockLevel: 20, maxLevel: 10, xpToNext: 55, effectType: 'survey_range', effectValue: 18 },
  // Combat (6)
  { id: 'ember_strike', name: 'Ember Strike', category: 'combat', description: 'Channel fire into your weapon for a burning melee attack', emoji: '⚔️', unlockLevel: 2, maxLevel: 10, xpToNext: 35, effectType: 'attack_power', effectValue: 10 },
  { id: 'fire_shield', name: 'Fire Shield', category: 'combat', description: 'Create a shield of flames that damages attackers on contact', emoji: '🛡️', unlockLevel: 5, maxLevel: 10, xpToNext: 40, effectType: 'defense', effectValue: 8 },
  { id: 'wildfire_burst', name: 'Wildfire Burst', category: 'combat', description: 'Unleash a devastating burst of fire in all directions', emoji: '💥', unlockLevel: 12, maxLevel: 10, xpToNext: 50, effectType: 'aoe_damage', effectValue: 20 },
  { id: 'magma_fist', name: 'Magma Fist', category: 'combat', description: 'Coat your fists in magma for devastating unarmed strikes', emoji: '👊', unlockLevel: 18, maxLevel: 10, xpToNext: 55, effectType: 'melee_power', effectValue: 15 },
  { id: 'dragon_breath', name: 'Dragon Breath', category: 'combat', description: 'Exhale a stream of fire inspired by the dragons of the wilds', emoji: '🐉', unlockLevel: 28, maxLevel: 10, xpToNext: 60, effectType: 'ranged_attack', effectValue: 25 },
  { id: 'inferno_stance', name: 'Inferno Stance', category: 'combat', description: 'Enter a battle trance that dramatically boosts all combat stats', emoji: '🔥', unlockLevel: 38, maxLevel: 10, xpToNext: 70, effectType: 'all_combat', effectValue: 12 },
  // Crafting (5)
  { id: 'resource_gathering', name: 'Resource Gathering', category: 'crafting', description: 'Gather resources more efficiently from all wilderness zones', emoji: '⛏️', unlockLevel: 1, maxLevel: 10, xpToNext: 25, effectType: 'gather_speed', effectValue: 8 },
  { id: 'ember_crafting', name: 'Ember Crafting', category: 'crafting', description: 'Craft superior items using fire-imbued materials', emoji: '🔨', unlockLevel: 8, maxLevel: 10, xpToNext: 45, effectType: 'craft_quality', effectValue: 10 },
  { id: 'potion_brewing', name: 'Wild Potion Brewing', category: 'crafting', description: 'Brew powerful potions from wilderness herbs and minerals', emoji: '🧪', unlockLevel: 12, maxLevel: 10, xpToNext: 50, effectType: 'potion_power', effectValue: 12 },
  { id: 'rune_enchanting', name: 'Rune Enchanting', category: 'crafting', description: 'Engrave ancient runes onto equipment for magical bonuses', emoji: '✨', unlockLevel: 22, maxLevel: 10, xpToNext: 60, effectType: 'enchant_bonus', effectValue: 15 },
  { id: 'master_forger', name: 'Master Forger', category: 'crafting', description: 'Forge legendary weapons and armor using the rarest materials', emoji: '⚒️', unlockLevel: 35, maxLevel: 10, xpToNext: 70, effectType: 'forge_power', effectValue: 20 },
  // Survival (5)
  { id: 'fire_starting', name: 'Fire Starting', category: 'survival', description: 'Start campfires in any conditions for warmth and cooking', emoji: '🔥', unlockLevel: 1, maxLevel: 10, xpToNext: 20, effectType: 'campfire_quality', effectValue: 5 },
  { id: 'wound_treatment', name: 'Wound Treatment', category: 'survival', description: 'Treat burns and injuries using wilderness herbs and first aid', emoji: '🩹', unlockLevel: 4, maxLevel: 10, xpToNext: 35, effectType: 'heal_power', effectValue: 8 },
  { id: 'heat_resistance', name: 'Heat Resistance', category: 'survival', description: 'Endure extreme temperatures that would incapacitate ordinary explorers', emoji: '🌡️', unlockLevel: 8, maxLevel: 10, xpToNext: 40, effectType: 'heat_tolerance', effectValue: 10 },
  { id: 'wildfire_dodging', name: 'Wildfire Dodging', category: 'survival', description: 'Move through active wildfire zones with reduced damage and risk', emoji: '💨', unlockLevel: 15, maxLevel: 10, xpToNext: 55, effectType: 'fire_damage_reduction', effectValue: 15 },
  { id: 'outpost_mastery', name: 'Outpost Mastery', category: 'survival', description: 'Maximize the efficiency and output of all outpost buildings', emoji: '🏗️', unlockLevel: 25, maxLevel: 10, xpToNext: 65, effectType: 'outpost_efficiency', effectValue: 12 },
];

// ─── Achievements (18) ─────────────────────────────────────────────────

export const EW_ACHIEVEMENTS: EwAchievementDef[] = [
  { id: 'ew_first_explore', name: 'First Steps', description: 'Discover your first wilderness zone', conditionKey: 'totalExplored', targetValue: 1, rewardCoins: 50, rewardXp: 30, emoji: '👣' },
  { id: 'ew_zone_master', name: 'Zone Master', description: 'Discover all 8 wilderness zones', conditionKey: 'totalExplored', targetValue: 8, rewardCoins: 300, rewardXp: 200, emoji: '🗺️' },
  { id: 'ew_first_tame', name: 'First Bond', description: 'Tame your first wild creature', conditionKey: 'totalCreaturesTamed', targetValue: 1, rewardCoins: 80, rewardXp: 50, emoji: '🐾' },
  { id: 'ew_creature_collector', name: 'Creature Collector', description: 'Tame 15 different wild creatures', conditionKey: 'totalCreaturesTamed', targetValue: 15, rewardCoins: 500, rewardXp: 400, emoji: '🦊' },
  { id: 'ew_beast_lord', name: 'Beast Lord', description: 'Tame all 35 wild creatures', conditionKey: 'totalCreaturesTamed', targetValue: 35, rewardCoins: 2000, rewardXp: 1500, emoji: '👑' },
  { id: 'ew_gather_100', name: 'Scavenger', description: 'Gather 100 resources total', conditionKey: 'totalResourcesGathered', targetValue: 100, rewardCoins: 150, rewardXp: 80, emoji: '⛏️' },
  { id: 'ew_gather_1000', name: 'Master Gatherer', description: 'Gather 1,000 resources total', conditionKey: 'totalResourcesGathered', targetValue: 1000, rewardCoins: 600, rewardXp: 350, emoji: '💎' },
  { id: 'ew_first_outpost', name: 'Homesteader', description: 'Build your first outpost', conditionKey: 'totalOutpostsBuilt', targetValue: 1, rewardCoins: 100, rewardXp: 60, emoji: '🏗️' },
  { id: 'ew_outpost_empire', name: 'Outpost Empire', description: 'Build 15 outposts', conditionKey: 'totalOutpostsBuilt', targetValue: 15, rewardCoins: 1500, rewardXp: 800, emoji: '🏰' },
  { id: 'ew_first_wildfire', name: 'Flame Tested', description: 'Survive your first wildfire event', conditionKey: 'totalWildfiresSurvived', targetValue: 1, rewardCoins: 200, rewardXp: 100, emoji: '🔥' },
  { id: 'ew_wildfire_veteran', name: 'Wildfire Veteran', description: 'Survive 10 wildfire events', conditionKey: 'totalWildfiresSurvived', targetValue: 10, rewardCoins: 800, rewardXp: 500, emoji: '🌋' },
  { id: 'ew_bond_master', name: 'Bond Master', description: 'Reach bond level 5 with any creature', conditionKey: 'totalBondLevelsGained', targetValue: 5, rewardCoins: 400, rewardXp: 250, emoji: '❤️' },
  { id: 'ew_skill_adept', name: 'Skill Adept', description: 'Unlock 10 different skills', conditionKey: 'totalSkillsUsed', targetValue: 10, rewardCoins: 350, rewardXp: 200, emoji: '📚' },
  { id: 'ew_patrol_5', name: 'Diligent Patrol', description: 'Complete 5 daily patrols', conditionKey: 'totalPatrolsCompleted', targetValue: 5, rewardCoins: 200, rewardXp: 120, emoji: '🚶' },
  { id: 'ew_patrol_50', name: 'Patrol Legend', description: 'Complete 50 daily patrols', conditionKey: 'totalPatrolsCompleted', targetValue: 50, rewardCoins: 1000, rewardXp: 600, emoji: '🏅' },
  { id: 'ew_rich_explorer', name: 'Rich Explorer', description: 'Earn 5,000 coins total', conditionKey: 'totalCoinsEarned', targetValue: 5000, rewardCoins: 0, rewardXp: 400, emoji: '💰' },
  { id: 'ew_level_25', name: 'Seasoned Survivor', description: 'Reach wilderness level 25', conditionKey: 'level', targetValue: 25, rewardCoins: 500, rewardXp: 300, emoji: '⭐' },
  { id: 'ew_level_50', name: 'Inferno Warden', description: 'Reach the maximum wilderness level 50', conditionKey: 'level', targetValue: 50, rewardCoins: 3000, rewardXp: 2000, emoji: '🏆' },
];

// ─── Daily Patrol Quests ───────────────────────────────────────────────

export const EW_PATROL_QUESTS: { type: EwExploreAction; name: string; description: string; target: number; rewardCoins: number; rewardXp: number; emoji: string }[] = [
  { type: 'scout', name: 'Zone Reconnaissance', description: 'Scout unexplored areas of the wilderness', target: 3, rewardCoins: 60, rewardXp: 35, emoji: '🔭' },
  { type: 'track', name: 'Creature Tracking', description: 'Track and observe wild creatures in their habitat', target: 4, rewardCoins: 70, rewardXp: 40, emoji: '🐾' },
  { type: 'tame', name: 'Taming Expedition', description: 'Attempt to tame wild creatures you encounter', target: 2, rewardCoins: 80, rewardXp: 45, emoji: '🦊' },
  { type: 'survive', name: 'Survival Challenge', description: 'Survive encounters in dangerous zones', target: 3, rewardCoins: 75, rewardXp: 42, emoji: '🔥' },
];

// ─── Wildfire Event Definitions ────────────────────────────────────────

export const EW_WILDFIRE_EVENTS = [
  { id: 'smoke_alert', name: 'Smoke Alert', description: 'Heavy smoke blankets the zone — visibility reduced but creatures are easier to find', emoji: '🌫️', severity: 'smoke' as const, duration: 1800000, rewardCoins: 50, rewardXp: 30, targetProgress: 3 },
  { id: 'brush_blaze', name: 'Brush Blaze', description: 'A fast-moving grass fire threatens to reshape the meadow', emoji: '🔥', severity: 'blaze' as const, duration: 2400000, rewardCoins: 80, rewardXp: 50, targetProgress: 5 },
  { id: 'forest_inferno', name: 'Forest Inferno', description: 'The cinder forest is ablaze — brave the flames to rescue trapped creatures', emoji: '🌋', severity: 'inferno' as const, duration: 3600000, rewardCoins: 150, rewardXp: 100, targetProgress: 8 },
  { id: 'cataclysm', name: 'Cataclysmic Eruption', description: 'A full volcanic eruption engulfs the zone in rivers of magma', emoji: '☄️', severity: 'cataclysm' as const, duration: 4800000, rewardCoins: 300, rewardXp: 200, targetProgress: 12 },
];

// ============================================================
// Initial State Factory
// ============================================================

function ewCreateInitialState(seed?: number): EmberWildsState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const creatures: Record<string, EwCreatureState> = {};
  for (const c of EW_CREATURES) {
    creatures[c.id] = { discovered: false, tamed: false, bondLevel: 0, lastSeen: null, encounterCount: 0 };
  }
  const zones: Record<string, EwZoneState> = {};
  for (const z of EW_ZONES) {
    zones[z.id] = {
      discovered: z.unlockLevel <= 1,
      level: 1,
      gatherCount: 0,
      patrolCount: 0,
      creaturesFound: 0,
      lastExplored: z.unlockLevel <= 1 ? Date.now() : null,
      currentWildfire: null,
      wildfireEndsAt: null,
    };
  }
  const outposts: Record<string, EwOutpostState> = {};
  for (const o of EW_OUTPOSTS) {
    outposts[o.id] = { built: false, level: 0, health: 0, builtAt: null, lastUpgradedAt: null };
  }
  const skills: Record<string, EwSkillState> = {};
  for (const s of EW_SKILLS) {
    skills[s.id] = { unlocked: s.unlockLevel <= 1, level: 1, xp: 0, cooldownEnd: 0 };
  }
  const achievements: Record<string, EwAchievementState> = {};
  for (const a of EW_ACHIEVEMENTS) {
    achievements[a.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    level: 1,
    xp: 0,
    coins: 150,
    title: 'Lost Wanderer',
    creatures,
    zones,
    resources: { smoldering_herbs: 5, coal_chunks: 8, dry_tinder: 4, wild_berries: 3 },
    outposts,
    skills,
    achievements,
    dailyPatrol: {
      lastDate: null,
      streak: 0,
      completed: false,
      questType: null,
      questProgress: 0,
      questTarget: 0,
      rewardClaimed: false,
    },
    wildfireEvent: {
      zoneId: null,
      severity: null,
      startTime: null,
      endTime: null,
      rewardClaimed: false,
      progress: 0,
      targetProgress: 0,
    },
    totals: {
      totalExplored: 0,
      totalCreaturesTamed: 0,
      totalResourcesGathered: 0,
      totalOutpostsBuilt: 0,
      totalWildfiresSurvived: 0,
      totalBondLevelsGained: 0,
      totalSkillsUsed: 0,
      totalPatrolsCompleted: 0,
      totalCoinsEarned: 0,
    },
    seed: effectiveSeed,
  };
}

// ============================================================
// Hook: useEmberWilds
// ============================================================

export default function useEmberWilds(initialSeed?: number) {
  const [state, setState] = useState<EmberWildsState>(() => ewCreateInitialState(initialSeed));
  const prngRef = useRef<() => number>(ewMulberry32(state.seed));
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- Core State ----

  const ewGetState = useCallback((): Readonly<EmberWildsState> => {
    return Object.freeze({ ...state });
  }, [state]);

  const ewResetState = useCallback((newSeed?: number) => {
    const s = ewCreateInitialState(newSeed);
    prngRef.current = ewMulberry32(s.seed);
    setState(s);
  }, []);

  const ewGetLevel = useCallback((): number => {
    return state.level;
  }, [state.level]);

  const ewGetXp = useCallback((): number => {
    return state.xp;
  }, [state.xp]);

  const ewGetXPTillNext = useCallback((): number => {
    return ewXpRequired(state.level);
  }, [state.level]);

  const ewAddXp = useCallback((amount: number): EmberWildsState => {
    let next = state;
    setState((prev) => {
      let lvl = prev.level;
      let xp = prev.xp + Math.floor(amount);
      while (lvl < EW_MAX_LEVEL && xp >= ewXpRequired(lvl)) {
        xp -= ewXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EW_MAX_LEVEL) xp = 0;
      next = { ...prev, level: ewClampLevel(lvl), xp };
      return next;
    });
    return next;
  }, [state]);

  // ---- Coins ----

  const ewGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const ewAddCoins = useCallback((amount: number): EmberWildsState => {
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: ewClampCoins(prev.coins + amount), totals: { ...prev.totals, totalCoinsEarned: prev.totals.totalCoinsEarned + Math.max(0, amount) } };
      return next;
    });
    return next;
  }, [state]);

  const ewSpendCoins = useCallback((amount: number): { success: boolean; state: EmberWildsState } => {
    if (state.coins < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = { ...prev, coins: ewClampCoins(prev.coins - amount) };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewCanAfford = useCallback((amount: number): boolean => {
    return state.coins >= amount;
  }, [state.coins]);

  // ---- Title ----

  const ewGetTitle = useCallback((): EwTitleInfo => {
    let current = EW_TITLES[0];
    for (const t of EW_TITLES) {
      if (state.level >= t.levelRequired) current = t;
    }
    return current;
  }, [state.level]);

  const ewGetAllTitles = useCallback((): EwTitleInfo[] => {
    return [...EW_TITLES];
  }, []);

  const ewGetNextTitle = useCallback((): EwTitleInfo | null => {
    for (const t of EW_TITLES) {
      if (state.level < t.levelRequired) return t;
    }
    return null;
  }, [state.level]);

  // ---- Progress ----

  const ewGetProgress = useCallback((): number => {
    const needed = ewXpRequired(state.level);
    if (needed === Infinity) return 1;
    if (needed <= 0) return 0;
    return Math.min(1, state.xp / needed);
  }, [state.xp, state.level]);

  const ewGetOverallProgress = useCallback((): number => {
    return state.level / EW_MAX_LEVEL;
  }, [state.level]);

  // ---- Creatures ----

  const ewGetCreatures = useCallback((): EwCreatureDef[] => {
    return [...EW_CREATURES];
  }, []);

  const ewGetCreatureById = useCallback((id: string): EwCreatureDef | null => {
    return EW_CREATURES.find((c) => c.id === id) ?? null;
  }, []);

  const ewGetDiscoveredCreatures = useCallback((): EwCreatureDef[] => {
    return EW_CREATURES.filter((c) => state.creatures[c.id]?.discovered);
  }, [state.creatures]);

  const ewGetCreatureByRarity = useCallback((rarity: EwRarity): EwCreatureDef[] => {
    return EW_CREATURES.filter((c) => c.rarity === rarity);
  }, []);

  const ewGetTamedCreatures = useCallback((): EwCreatureDef[] => {
    return EW_CREATURES.filter((c) => state.creatures[c.id]?.tamed);
  }, [state.creatures]);

  const ewDiscoverCreature = useCallback((creatureId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      const existing = prev.creatures[creatureId];
      if (!existing) return prev;
      const wasNew = !existing.discovered;
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...existing,
            discovered: true,
            encounterCount: existing.encounterCount + 1,
            lastSeen: Date.now(),
          },
        },
      };
      if (wasNew) {
        const zoneState = prev.zones[def.habitatId];
        if (zoneState) {
          next = {
            ...next,
            zones: {
              ...next.zones,
              [def.habitatId]: { ...zoneState, creaturesFound: zoneState.creaturesFound + 1 },
            },
          };
        }
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewIsCreatureDiscovered = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.discovered ?? false;
  }, [state.creatures]);

  const ewIsCreatureTamed = useCallback((creatureId: string): boolean => {
    return state.creatures[creatureId]?.tamed ?? false;
  }, [state.creatures]);

  const ewGetCreatureBondLevel = useCallback((creatureId: string): number => {
    return state.creatures[creatureId]?.bondLevel ?? 0;
  }, [state.creatures]);

  const ewGetCreatureEncounterCount = useCallback((creatureId: string): number => {
    return state.creatures[creatureId]?.encounterCount ?? 0;
  }, [state.creatures]);

  const ewTameCreature = useCallback((creatureId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.discovered) return { success: false, state };
    if (creatureState.tamed) return { success: false, state };

    const rng = prngRef.current();
    const outpostBonus = Object.entries(state.outposts)
      .filter(([, o]) => o.built)
      .reduce((sum, [oId, o]) => {
        const oDef = EW_OUTPOSTS.find((d) => d.id === oId);
        return sum + (oDef?.bonusType === 'tame_bonus' ? oDef.bonusValue * o.level : 0);
      }, 0);
    const chance = def.tameChance + outpostBonus * 0.005;

    if (rng > chance) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...prev.creatures[creatureId],
            tamed: true,
            bondLevel: 1,
          },
        },
        totals: {
          ...prev.totals,
          totalCreaturesTamed: prev.totals.totalCreaturesTamed + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewBondWithCreature = useCallback((creatureId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_CREATURES.find((c) => c.id === creatureId);
    if (!def) return { success: false, state };
    const creatureState = state.creatures[creatureId];
    if (!creatureState || !creatureState.tamed) return { success: false, state };
    if (creatureState.bondLevel >= 5) return { success: false, state };

    const rng = prngRef.current();
    const bondCost = 50 * creatureState.bondLevel;
    if (state.coins < bondCost) return { success: false, state };
    if (rng > 0.7 + creatureState.bondLevel * 0.05) return { success: false, state };

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins - bondCost),
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...prev.creatures[creatureId],
            bondLevel: prev.creatures[creatureId].bondLevel + 1,
          },
        },
        totals: {
          ...prev.totals,
          totalBondLevelsGained: prev.totals.totalBondLevelsGained + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetCreatureDiscoveryCount = useCallback((): number => {
    return Object.values(state.creatures).filter((c) => c.discovered).length;
  }, [state.creatures]);

  const ewGetCreatureTameCount = useCallback((): number => {
    return Object.values(state.creatures).filter((c) => c.tamed).length;
  }, [state.creatures]);

  // ---- Zones ----

  const ewGetZones = useCallback((): EwZoneDef[] => {
    return [...EW_ZONES];
  }, []);

  const ewGetZoneById = useCallback((id: string): EwZoneDef | null => {
    return EW_ZONES.find((z) => z.id === id) ?? null;
  }, []);

  const ewExploreZone = useCallback((zoneId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    let next = state;
    setState((prev) => {
      const zoneState = prev.zones[zoneId];
      if (!zoneState) return prev;
      const wasNew = !zoneState.discovered;
      next = {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: {
            ...zoneState,
            discovered: true,
            lastExplored: Date.now(),
          },
        },
        totals: {
          ...prev.totals,
          totalExplored: prev.totals.totalExplored + (wasNew ? 1 : 0),
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewIsZoneDiscovered = useCallback((zoneId: string): boolean => {
    return state.zones[zoneId]?.discovered ?? false;
  }, [state.zones]);

  const ewGetZoneLevel = useCallback((zoneId: string): number => {
    return state.zones[zoneId]?.level ?? 0;
  }, [state.zones]);

  const ewUpgradeZone = useCallback((zoneId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_ZONES.find((z) => z.id === zoneId);
    if (!def) return { success: false, state };
    const zoneState = state.zones[zoneId];
    if (!zoneState || !zoneState.discovered) return { success: false, state };
    const cost = 100 * (zoneState.level + 1);
    if (state.coins < cost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins - cost),
        zones: {
          ...prev.zones,
          [zoneId]: { ...prev.zones[zoneId], level: prev.zones[zoneId].level + 1 },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetDiscoveredZones = useCallback((): EwZoneDef[] => {
    return EW_ZONES.filter((z) => state.zones[z.id]?.discovered);
  }, [state.zones]);

  const ewGetUndiscoveredZones = useCallback((): EwZoneDef[] => {
    return EW_ZONES.filter((z) => !(state.zones[z.id]?.discovered));
  }, [state.zones]);

  const ewGetZoneGatherCount = useCallback((zoneId: string): number => {
    return state.zones[zoneId]?.gatherCount ?? 0;
  }, [state.zones]);

  const ewGetZoneCreaturesFound = useCallback((zoneId: string): number => {
    return state.zones[zoneId]?.creaturesFound ?? 0;
  }, [state.zones]);

  const ewGetZoneWildfire = useCallback((zoneId: string): EwWildfireSeverity | null => {
    return state.zones[zoneId]?.currentWildfire ?? null;
  }, [state.zones]);

  const ewGetZoneInfo = useCallback((zoneId: string): { def: EwZoneDef | null; state: EwZoneState | null } => {
    const def = EW_ZONES.find((z) => z.id === zoneId) ?? null;
    const zState = state.zones[zoneId] ?? null;
    return { def, state: zState };
  }, [state.zones]);

  // ---- Resources ----

  const ewGetResources = useCallback((): EwResourceDef[] => {
    return [...EW_RESOURCES];
  }, []);

  const ewGetResourceById = useCallback((id: string): EwResourceDef | null => {
    return EW_RESOURCES.find((r) => r.id === id) ?? null;
  }, []);

  const ewGetResourceCount = useCallback((resourceId: string): number => {
    return state.resources[resourceId] ?? 0;
  }, [state.resources]);

  const ewGetAllResourceCounts = useCallback((): Record<string, number> => {
    return { ...state.resources };
  }, [state.resources]);

  const ewGetResourcesByRarity = useCallback((rarity: EwRarity): EwResourceDef[] => {
    return EW_RESOURCES.filter((r) => r.rarity === rarity);
  }, []);

  const ewGetTotalResourcesGathered = useCallback((): number => {
    return state.totals.totalResourcesGathered;
  }, [state.totals]);

  const ewGatherResource = useCallback((resourceId: string, zoneId: string): { success: boolean; amount: number; state: EmberWildsState } => {
    const def = EW_RESOURCES.find((r) => r.id === resourceId);
    if (!def) return { success: false, amount: 0, state };
    const zoneDef = EW_ZONES.find((z) => z.id === zoneId);
    if (!zoneDef) return { success: false, amount: 0, state };
    if (!zoneDef.resourceList.includes(resourceId)) return { success: false, amount: 0, state };
    if (!state.zones[zoneId]?.discovered) return { success: false, amount: 0, state };

    const rng = prngRef.current();
    const zoneLevelBonus = (state.zones[zoneId]?.level ?? 1) * 0.05;
    const gatherChance = zoneDef.baseGatherRate + zoneLevelBonus;
    if (rng > gatherChance) return { success: false, amount: 0, state };

    const gatherAmount = 1 + Math.floor(rng * 3);
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        resources: {
          ...prev.resources,
          [resourceId]: (prev.resources[resourceId] ?? 0) + gatherAmount,
        },
        zones: {
          ...prev.zones,
          [zoneId]: { ...prev.zones[zoneId], gatherCount: prev.zones[zoneId].gatherCount + 1 },
        },
        totals: {
          ...prev.totals,
          totalResourcesGathered: prev.totals.totalResourcesGathered + gatherAmount,
        },
      };
      return next;
    });
    return { success: true, amount: gatherAmount, state: next };
  }, [state]);

  const ewConsumeResource = useCallback((resourceId: string, amount: number): { success: boolean; state: EmberWildsState } => {
    if ((state.resources[resourceId] ?? 0) < amount) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        resources: {
          ...prev.resources,
          [resourceId]: Math.max(0, (prev.resources[resourceId] ?? 0) - amount),
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetResourceInfo = useCallback((resourceId: string): { def: EwResourceDef | null; count: number } => {
    const def = EW_RESOURCES.find((r) => r.id === resourceId) ?? null;
    const count = state.resources[resourceId] ?? 0;
    return { def, count };
  }, [state.resources]);

  // ---- Outposts ----

  const ewGetOutposts = useCallback((): EwOutpostDef[] => {
    return [...EW_OUTPOSTS];
  }, []);

  const ewGetOutpostById = useCallback((id: string): EwOutpostDef | null => {
    return EW_OUTPOSTS.find((o) => o.id === id) ?? null;
  }, []);

  const ewGetBuiltOutposts = useCallback((): EwOutpostDef[] => {
    return EW_OUTPOSTS.filter((o) => state.outposts[o.id]?.built);
  }, [state.outposts]);

  const ewIsOutpostBuilt = useCallback((outpostId: string): boolean => {
    return state.outposts[outpostId]?.built ?? false;
  }, [state.outposts]);

  const ewGetOutpostLevel = useCallback((outpostId: string): number => {
    return state.outposts[outpostId]?.level ?? 0;
  }, [state.outposts]);

  const ewGetOutpostHealth = useCallback((outpostId: string): number => {
    return state.outposts[outpostId]?.health ?? 0;
  }, [state.outposts]);

  const ewCanBuildOutpost = useCallback((outpostId: string): { canBuild: boolean; reason: string } => {
    const def = EW_OUTPOSTS.find((o) => o.id === outpostId);
    if (!def) return { canBuild: false, reason: 'Outpost not found' };
    if (state.outposts[outpostId]?.built) return { canBuild: false, reason: 'Already built' };
    if (state.level < def.requiredLevel) return { canBuild: false, reason: 'Insufficient level' };
    if (state.coins < def.buildCost.coins) return { canBuild: false, reason: 'Insufficient coins' };
    for (const [resId, amount] of Object.entries(def.buildCost.resources)) {
      if ((state.resources[resId] ?? 0) < amount) return { canBuild: false, reason: `Insufficient ${resId}` };
    }
    return { canBuild: true, reason: '' };
  }, [state]);

  const ewBuildOutpost = useCallback((outpostId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_OUTPOSTS.find((o) => o.id === outpostId);
    if (!def) return { success: false, state };
    if (state.outposts[outpostId]?.built) return { success: false, state };
    if (state.level < def.requiredLevel) return { success: false, state };
    if (state.coins < def.buildCost.coins) return { success: false, state };
    for (const [resId, amount] of Object.entries(def.buildCost.resources)) {
      if ((state.resources[resId] ?? 0) < amount) return { success: false, state };
    }
    let next = state;
    setState((prev) => {
      const newResources = { ...prev.resources };
      for (const [resId, amount] of Object.entries(def.buildCost.resources)) {
        newResources[resId] = Math.max(0, (newResources[resId] ?? 0) - amount);
      }
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins - def.buildCost.coins),
        resources: newResources,
        outposts: {
          ...prev.outposts,
          [outpostId]: { built: true, level: 1, health: 100, builtAt: Date.now(), lastUpgradedAt: Date.now() },
        },
        totals: {
          ...prev.totals,
          totalOutpostsBuilt: prev.totals.totalOutpostsBuilt + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewCanUpgradeOutpost = useCallback((outpostId: string): { canUpgrade: boolean; reason: string } => {
    const def = EW_OUTPOSTS.find((o) => o.id === outpostId);
    if (!def) return { canUpgrade: false, reason: 'Outpost not found' };
    const oState = state.outposts[outpostId];
    if (!oState || !oState.built) return { canUpgrade: false, reason: 'Outpost not built' };
    if (oState.level >= def.maxLevel) return { canUpgrade: false, reason: 'Already at max level' };
    if (state.coins < def.upgradeCost.coins) return { canUpgrade: false, reason: 'Insufficient coins' };
    for (const [resId, amount] of Object.entries(def.upgradeCost.resources)) {
      if ((state.resources[resId] ?? 0) < amount) return { canUpgrade: false, reason: `Insufficient ${resId}` };
    }
    return { canUpgrade: true, reason: '' };
  }, [state]);

  const ewUpgradeOutpost = useCallback((outpostId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_OUTPOSTS.find((o) => o.id === outpostId);
    if (!def) return { success: false, state };
    const oState = state.outposts[outpostId];
    if (!oState || !oState.built) return { success: false, state };
    if (oState.level >= def.maxLevel) return { success: false, state };
    if (state.coins < def.upgradeCost.coins) return { success: false, state };
    for (const [resId, amount] of Object.entries(def.upgradeCost.resources)) {
      if ((state.resources[resId] ?? 0) < amount) return { success: false, state };
    }
    let next = state;
    setState((prev) => {
      const newResources = { ...prev.resources };
      for (const [resId, amount] of Object.entries(def.upgradeCost.resources)) {
        newResources[resId] = Math.max(0, (newResources[resId] ?? 0) - amount);
      }
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins - def.upgradeCost.coins),
        resources: newResources,
        outposts: {
          ...prev.outposts,
          [outpostId]: { ...prev.outposts[outpostId], level: prev.outposts[outpostId].level + 1, health: 100, lastUpgradedAt: Date.now() },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewRepairOutpost = useCallback((outpostId: string): { success: boolean; state: EmberWildsState } => {
    const oState = state.outposts[outpostId];
    if (!oState || !oState.built) return { success: false, state };
    if (oState.health >= 100) return { success: false, state };
    const repairCost = Math.ceil((100 - oState.health) * 0.5);
    if (state.coins < repairCost) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins - repairCost),
        outposts: {
          ...prev.outposts,
          [outpostId]: { ...prev.outposts[outpostId], health: 100 },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewDamageOutpost = useCallback((outpostId: string, damage: number): { success: boolean; state: EmberWildsState } => {
    const oState = state.outposts[outpostId];
    if (!oState || !oState.built) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        outposts: {
          ...prev.outposts,
          [outpostId]: { ...prev.outposts[outpostId], health: Math.max(0, prev.outposts[outpostId].health - damage) },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetOutpostInfo = useCallback((outpostId: string): { def: EwOutpostDef | null; state: EwOutpostState | null } => {
    const def = EW_OUTPOSTS.find((o) => o.id === outpostId) ?? null;
    const oState = state.outposts[outpostId] ?? null;
    return { def, state: oState };
  }, [state.outposts]);

  // ---- Skills ----

  const ewGetSkills = useCallback((): EwSkillDef[] => {
    return [...EW_SKILLS];
  }, []);

  const ewGetSkillById = useCallback((id: string): EwSkillDef | null => {
    return EW_SKILLS.find((s) => s.id === id) ?? null;
  }, []);

  const ewIsSkillUnlocked = useCallback((skillId: string): boolean => {
    return state.skills[skillId]?.unlocked ?? false;
  }, [state.skills]);

  const ewGetSkillLevel = useCallback((skillId: string): number => {
    return state.skills[skillId]?.level ?? 0;
  }, [state.skills]);

  const ewGetSkillXp = useCallback((skillId: string): number => {
    return state.skills[skillId]?.xp ?? 0;
  }, [state.skills]);

  const ewGetSkillsByCategory = useCallback((category: EwSkillCategory): EwSkillDef[] => {
    return EW_SKILLS.filter((s) => s.category === category);
  }, []);

  const ewGetUnlockedSkills = useCallback((): EwSkillDef[] => {
    return EW_SKILLS.filter((s) => state.skills[s.id]?.unlocked);
  }, [state.skills]);

  const ewUnlockSkill = useCallback((skillId: string): { success: boolean; state: EmberWildsState } => {
    const def = EW_SKILLS.find((s) => s.id === skillId);
    if (!def) return { success: false, state };
    if (state.level < def.unlockLevel) return { success: false, state };
    if (state.skills[skillId]?.unlocked) return { success: false, state };
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        skills: {
          ...prev.skills,
          [skillId]: { unlocked: true, level: 1, xp: 0, cooldownEnd: 0 },
        },
        totals: {
          ...prev.totals,
          totalSkillsUsed: prev.totals.totalSkillsUsed + 1,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewUseSkill = useCallback((skillId: string): { success: boolean; xpGained: number; state: EmberWildsState } => {
    const def = EW_SKILLS.find((s) => s.id === skillId);
    if (!def) return { success: false, xpGained: 0, state };
    const skillState = state.skills[skillId];
    if (!skillState || !skillState.unlocked) return { success: false, xpGained: 0, state };

    const now = Date.now();
    if (now < skillState.cooldownEnd) return { success: false, xpGained: 0, state };

    const xpGained = def.xpToNext;
    let next = state;
    setState((prev) => {
      const s = prev.skills[skillId];
      if (!s) return prev;
      let newLevel = s.level;
      let newXp = s.xp + xpGained;
      if (newXp >= def.xpToNext && newLevel < def.maxLevel) {
        newXp = newXp - def.xpToNext;
        newLevel += 1;
      }
      if (newLevel >= def.maxLevel) {
        newXp = 0;
        newLevel = def.maxLevel;
      }
      next = {
        ...prev,
        skills: {
          ...prev.skills,
          [skillId]: { ...s, level: newLevel, xp: newXp, cooldownEnd: now + 3000 },
        },
      };
      return next;
    });
    return { success: true, xpGained, state: next };
  }, [state]);

  const ewGetSkillCooldown = useCallback((skillId: string): number => {
    const skillState = state.skills[skillId];
    if (!skillState) return 0;
    const remaining = skillState.cooldownEnd - Date.now();
    return Math.max(0, remaining);
  }, [state.skills]);

  const ewGetSkillInfo = useCallback((skillId: string): { def: EwSkillDef | null; state: EwSkillState | null } => {
    const def = EW_SKILLS.find((s) => s.id === skillId) ?? null;
    const sState = state.skills[skillId] ?? null;
    return { def, state: sState };
  }, [state.skills]);

  // ---- Daily Patrol ----

  const ewGetDailyPatrol = useCallback((): EwDailyPatrolState => {
    return { ...state.dailyPatrol };
  }, [state.dailyPatrol]);

  const ewStartDailyPatrol = useCallback((): { success: boolean; state: EmberWildsState } => {
    const today = ewGenerateDayKey(Date.now());
    if (state.dailyPatrol.lastDate === today) return { success: false, state };

    const questIndex = Math.floor(prngRef.current() * EW_PATROL_QUESTS.length);
    const quest = EW_PATROL_QUESTS[questIndex];
    const streakReset = state.dailyPatrol.lastDate !== null;
    const yesterday = new Date(Date.now() - 86400000);
    const yesterdayKey = ewGenerateDayKey(yesterday.getTime());
    const newStreak = (state.dailyPatrol.lastDate === yesterdayKey) ? state.dailyPatrol.streak + 1 : 1;

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        dailyPatrol: {
          lastDate: today,
          streak: newStreak,
          completed: false,
          questType: quest.type,
          questProgress: 0,
          questTarget: quest.target,
          rewardClaimed: false,
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewUpdatePatrolProgress = useCallback((amount: number): { success: boolean; state: EmberWildsState } => {
    if (state.dailyPatrol.completed) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newProgress = Math.min(prev.dailyPatrol.questTarget, prev.dailyPatrol.questProgress + amount);
      const completed = newProgress >= prev.dailyPatrol.questTarget;
      next = {
        ...prev,
        dailyPatrol: {
          ...prev.dailyPatrol,
          questProgress: newProgress,
          completed,
        },
        totals: {
          ...prev.totals,
          totalPatrolsCompleted: prev.totals.totalPatrolsCompleted + (completed && !prev.dailyPatrol.completed ? 1 : 0),
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetPatrolStreak = useCallback((): number => {
    return state.dailyPatrol.streak;
  }, [state.dailyPatrol]);

  const ewGetPatrolQuest = useCallback((): { type: EwExploreAction | null; name: string; description: string; target: number; progress: number } | null => {
    if (!state.dailyPatrol.questType) return null;
    const quest = EW_PATROL_QUESTS.find((q) => q.type === state.dailyPatrol.questType);
    if (!quest) return null;
    return {
      type: quest.type,
      name: quest.name,
      description: quest.description,
      target: quest.target,
      progress: state.dailyPatrol.questProgress,
    };
  }, [state.dailyPatrol]);

  const ewIsPatrolComplete = useCallback((): boolean => {
    return state.dailyPatrol.completed;
  }, [state.dailyPatrol]);

  const ewClaimPatrolReward = useCallback((): { success: boolean; coins: number; xp: number; state: EmberWildsState } => {
    if (!state.dailyPatrol.completed) return { success: false, coins: 0, xp: 0, state };
    if (state.dailyPatrol.rewardClaimed) return { success: false, coins: 0, xp: 0, state };
    const quest = EW_PATROL_QUESTS.find((q) => q.type === state.dailyPatrol.questType);
    if (!quest) return { success: false, coins: 0, xp: 0, state };

    const streakBonus = Math.floor(state.dailyPatrol.streak * 0.1 * quest.rewardCoins);
    const rewardCoins = quest.rewardCoins + streakBonus;
    const rewardXp = quest.rewardXp + Math.floor(state.dailyPatrol.streak * 0.1 * quest.rewardXp);

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins + rewardCoins),
        xp: prev.xp + rewardXp,
        dailyPatrol: { ...prev.dailyPatrol, rewardClaimed: true },
        totals: {
          ...prev.totals,
          totalCoinsEarned: prev.totals.totalCoinsEarned + rewardCoins,
        },
      };
      let lvl = next.level;
      let xp = next.xp;
      while (lvl < EW_MAX_LEVEL && xp >= ewXpRequired(lvl)) {
        xp -= ewXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EW_MAX_LEVEL) xp = 0;
      next = { ...next, level: ewClampLevel(lvl), xp };
      return next;
    });
    return { success: true, coins: rewardCoins, xp: rewardXp, state: next };
  }, [state]);

  // ---- Wildfire Events ----

  const ewGetWildfireEvent = useCallback((): EwWildfireEvent => {
    return { ...state.wildfireEvent };
  }, [state.wildfireEvent]);

  const ewIsWildfireActive = useCallback((): boolean => {
    return state.wildfireEvent.zoneId !== null && state.wildfireEvent.endTime !== null && Date.now() < state.wildfireEvent.endTime;
  }, [state.wildfireEvent]);

  const ewStartWildfire = useCallback((zoneId: string): { success: boolean; state: EmberWildsState } => {
    const zoneDef = EW_ZONES.find((z) => z.id === zoneId);
    if (!zoneDef) return { success: false, state };
    if (!state.zones[zoneId]?.discovered) return { success: false, state };
    if (state.wildfireEvent.zoneId !== null) return { success: false, state };

    const eventIndex = Math.floor(prngRef.current() * EW_WILDFIRE_EVENTS.length);
    const event = EW_WILDFIRE_EVENTS[eventIndex];
    const now = Date.now();

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        wildfireEvent: {
          zoneId,
          severity: event.severity,
          startTime: now,
          endTime: now + event.duration,
          rewardClaimed: false,
          progress: 0,
          targetProgress: event.targetProgress,
        },
        zones: {
          ...prev.zones,
          [zoneId]: { ...prev.zones[zoneId], currentWildfire: event.severity, wildfireEndsAt: now + event.duration },
        },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewUpdateWildfireProgress = useCallback((amount: number): { success: boolean; state: EmberWildsState } => {
    if (!state.wildfireEvent.zoneId) return { success: false, state };
    if (state.wildfireEvent.rewardClaimed) return { success: false, state };
    let next = state;
    setState((prev) => {
      const newProgress = Math.min(prev.wildfireEvent.targetProgress, prev.wildfireEvent.progress + amount);
      next = {
        ...prev,
        wildfireEvent: { ...prev.wildfireEvent, progress: newProgress },
      };
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewClaimWildfireReward = useCallback((): { success: boolean; coins: number; xp: number; state: EmberWildsState } => {
    if (state.wildfireEvent.rewardClaimed) return { success: false, coins: 0, xp: 0, state };
    if (state.wildfireEvent.progress < state.wildfireEvent.targetProgress) return { success: false, coins: 0, xp: 0, state };

    const severity = state.wildfireEvent.severity;
    let rewardCoins = 50;
    let rewardXp = 30;
    if (severity === 'blaze') { rewardCoins = 80; rewardXp = 50; }
    else if (severity === 'inferno') { rewardCoins = 150; rewardXp = 100; }
    else if (severity === 'cataclysm') { rewardCoins = 300; rewardXp = 200; }

    const zoneId = state.wildfireEvent.zoneId;

    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        coins: ewClampCoins(prev.coins + rewardCoins),
        xp: prev.xp + rewardXp,
        wildfireEvent: { ...prev.wildfireEvent, rewardClaimed: true },
        totals: {
          ...prev.totals,
          totalWildfiresSurvived: prev.totals.totalWildfiresSurvived + 1,
          totalCoinsEarned: prev.totals.totalCoinsEarned + rewardCoins,
        },
      };
      if (zoneId) {
        next = {
          ...next,
          zones: {
            ...next.zones,
            [zoneId]: { ...next.zones[zoneId], currentWildfire: null, wildfireEndsAt: null },
          },
        };
      }
      let lvl = next.level;
      let xp = next.xp;
      while (lvl < EW_MAX_LEVEL && xp >= ewXpRequired(lvl)) {
        xp -= ewXpRequired(lvl);
        lvl += 1;
      }
      if (lvl >= EW_MAX_LEVEL) xp = 0;
      next = { ...next, level: ewClampLevel(lvl), xp };
      return next;
    });
    return { success: true, coins: rewardCoins, xp: rewardXp, state: next };
  }, [state]);

  const ewEndWildfire = useCallback((): { success: boolean; state: EmberWildsState } => {
    if (!state.wildfireEvent.zoneId) return { success: false, state };
    const zoneId = state.wildfireEvent.zoneId;
    let next = state;
    setState((prev) => {
      next = {
        ...prev,
        wildfireEvent: {
          zoneId: null,
          severity: null,
          startTime: null,
          endTime: null,
          rewardClaimed: false,
          progress: 0,
          targetProgress: 0,
        },
      };
      if (zoneId) {
        next = {
          ...next,
          zones: {
            ...next.zones,
            [zoneId]: { ...next.zones[zoneId], currentWildfire: null, wildfireEndsAt: null },
          },
        };
      }
      return next;
    });
    return { success: true, state: next };
  }, [state]);

  const ewGetWildfireSeverityMultiplier = useCallback((severity: EwWildfireSeverity | null): number => {
    if (severity === 'smoke') return 1.2;
    if (severity === 'blaze') return 1.5;
    if (severity === 'inferno') return 2.0;
    if (severity === 'cataclysm') return 3.0;
    return 1.0;
  }, []);

  // ---- Achievements ----

  const ewGetAchievements = useCallback((): EwAchievementDef[] => {
    return [...EW_ACHIEVEMENTS];
  }, []);

  const ewGetAchievementById = useCallback((id: string): EwAchievementDef | null => {
    return EW_ACHIEVEMENTS.find((a) => a.id === id) ?? null;
  }, []);

  const ewIsAchievementUnlocked = useCallback((achievementId: string): boolean => {
    return state.achievements[achievementId]?.unlocked ?? false;
  }, [state.achievements]);

  const ewGetUnlockedAchievements = useCallback((): EwAchievementDef[] => {
    return EW_ACHIEVEMENTS.filter((a) => state.achievements[a.id]?.unlocked);
  }, [state.achievements]);

  const ewGetAchievementUnlockCount = useCallback((): number => {
    return Object.values(state.achievements).filter((a) => a.unlocked).length;
  }, [state.achievements]);

  const ewGetAchievementUnlockDate = useCallback((achievementId: string): number | null => {
    return state.achievements[achievementId]?.unlockedAt ?? null;
  }, [state.achievements]);

  const ewGetAchievementInfo = useCallback((achievementId: string): { def: EwAchievementDef | null; state: EwAchievementState | null } => {
    const def = EW_ACHIEVEMENTS.find((a) => a.id === achievementId) ?? null;
    const aState = state.achievements[achievementId] ?? null;
    return { def, state: aState };
  }, [state.achievements]);

  // ---- Achievement Auto-Check ----

  useEffect(() => {
    const s = stateRef.current;
    const totalsMap: Record<string, number> = {
      totalExplored: s.totals.totalExplored,
      totalCreaturesTamed: s.totals.totalCreaturesTamed,
      totalResourcesGathered: s.totals.totalResourcesGathered,
      totalOutpostsBuilt: s.totals.totalOutpostsBuilt,
      totalWildfiresSurvived: s.totals.totalWildfiresSurvived,
      totalBondLevelsGained: s.totals.totalBondLevelsGained,
      totalSkillsUsed: s.totals.totalSkillsUsed,
      totalPatrolsCompleted: s.totals.totalPatrolsCompleted,
      totalCoinsEarned: s.totals.totalCoinsEarned,
      level: s.level,
    };
    let changed = false;
    const newAchievements = { ...s.achievements };
    for (const ach of EW_ACHIEVEMENTS) {
      const achState = newAchievements[ach.id];
      if (achState && !achState.unlocked) {
        const value = totalsMap[ach.conditionKey] ?? 0;
        if (value >= ach.targetValue) {
          newAchievements[ach.id] = { ...achState, unlocked: true, unlockedAt: Date.now() };
          changed = true;
        }
      }
    }
    if (changed) {
      setState((prev) => ({ ...prev, achievements: newAchievements }));
    }
  }, [state.totals, state.level]);

  // ---- Color Theme ----

  const ewGetColorTheme = useCallback((): EwColorTheme => {
    return { ...EW_COLOR_THEME };
  }, []);

  // ---- Rarity Info ----

  const ewGetRarityInfo = useCallback((rarity: EwRarity): EwRarityInfo | null => {
    return EW_RARITIES.find((r) => r.key === rarity) ?? null;
  }, []);

  const ewGetAllRarities = useCallback((): EwRarityInfo[] => {
    return [...EW_RARITIES];
  }, []);

  // ---- Random Helpers ----

  const ewRandomInt = useCallback((min: number, max: number): number => {
    return min + Math.floor(prngRef.current() * (max - min + 1));
  }, []);

  const ewGetSeed = useCallback((): number => {
    return state.seed;
  }, [state.seed]);

  const ewSetSeed = useCallback((seed: number): void => {
    prngRef.current = ewMulberry32(seed);
    setState((prev) => ({ ...prev, seed }));
  }, []);

  // ---- Totals ----

  const ewGetTotals = useCallback((): Readonly<EwTotals> => {
    return Object.freeze({ ...state.totals });
  }, [state.totals]);

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // State
    ewGetState,
    ewResetState,

    // Level / XP
    ewGetLevel,
    ewGetXp,
    ewGetXPTillNext,
    ewAddXp,

    // Coins
    ewGetCoins,
    ewAddCoins,
    ewSpendCoins,
    ewCanAfford,

    // Title
    ewGetTitle,
    ewGetAllTitles,
    ewGetNextTitle,

    // Progress
    ewGetProgress,
    ewGetOverallProgress,

    // Creatures
    ewGetCreatures,
    ewGetCreatureById,
    ewGetDiscoveredCreatures,
    ewGetCreatureByRarity,
    ewGetTamedCreatures,
    ewDiscoverCreature,
    ewIsCreatureDiscovered,
    ewIsCreatureTamed,
    ewGetCreatureBondLevel,
    ewGetCreatureEncounterCount,
    ewTameCreature,
    ewBondWithCreature,
    ewGetCreatureDiscoveryCount,
    ewGetCreatureTameCount,

    // Zones
    ewGetZones,
    ewGetZoneById,
    ewExploreZone,
    ewIsZoneDiscovered,
    ewGetZoneLevel,
    ewUpgradeZone,
    ewGetDiscoveredZones,
    ewGetUndiscoveredZones,
    ewGetZoneGatherCount,
    ewGetZoneCreaturesFound,
    ewGetZoneWildfire,
    ewGetZoneInfo,

    // Resources
    ewGetResources,
    ewGetResourceById,
    ewGetResourceCount,
    ewGetAllResourceCounts,
    ewGetResourcesByRarity,
    ewGetTotalResourcesGathered,
    ewGatherResource,
    ewConsumeResource,
    ewGetResourceInfo,

    // Outposts
    ewGetOutposts,
    ewGetOutpostById,
    ewGetBuiltOutposts,
    ewIsOutpostBuilt,
    ewGetOutpostLevel,
    ewGetOutpostHealth,
    ewCanBuildOutpost,
    ewBuildOutpost,
    ewCanUpgradeOutpost,
    ewUpgradeOutpost,
    ewRepairOutpost,
    ewDamageOutpost,
    ewGetOutpostInfo,

    // Skills
    ewGetSkills,
    ewGetSkillById,
    ewIsSkillUnlocked,
    ewGetSkillLevel,
    ewGetSkillXp,
    ewGetSkillsByCategory,
    ewGetUnlockedSkills,
    ewUnlockSkill,
    ewUseSkill,
    ewGetSkillCooldown,
    ewGetSkillInfo,

    // Daily Patrol
    ewGetDailyPatrol,
    ewStartDailyPatrol,
    ewUpdatePatrolProgress,
    ewGetPatrolStreak,
    ewGetPatrolQuest,
    ewIsPatrolComplete,
    ewClaimPatrolReward,

    // Wildfire Events
    ewGetWildfireEvent,
    ewIsWildfireActive,
    ewStartWildfire,
    ewUpdateWildfireProgress,
    ewClaimWildfireReward,
    ewEndWildfire,
    ewGetWildfireSeverityMultiplier,

    // Achievements
    ewGetAchievements,
    ewGetAchievementById,
    ewIsAchievementUnlocked,
    ewGetUnlockedAchievements,
    ewGetAchievementUnlockCount,
    ewGetAchievementUnlockDate,
    ewGetAchievementInfo,

    // Color Theme
    ewGetColorTheme,

    // Rarity Info
    ewGetRarityInfo,
    ewGetAllRarities,

    // Random Helpers
    ewRandomInt,
    ewGetSeed,
    ewSetSeed,

    // Totals
    ewGetTotals,
  };
}
