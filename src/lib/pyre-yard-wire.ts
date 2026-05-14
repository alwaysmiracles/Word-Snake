'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// =============================================================================
// PYRE YARD (焰火院) — Blazing Forge Yard Wire Module
// Flame beings harness elemental fire across 7 species, 8 forge pits,
// 12 materials, 8 structures, 8 abilities, 10 achievements, 8 titles,
// 6 artifacts, and 8 volatile events.
// =============================================================================

// =============================================================================
// SECTION 1: TYPE DEFINITIONS
// =============================================================================

export type PyRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type PySpecies =
  | 'ember_sprite'
  | 'ash_golem'
  | 'flame_dancer'
  | 'magma_scorpion'
  | 'smoke_phantom'
  | 'inferno_dragon'
  | 'phoenix_chick';

export type PyAction =
  | 'ignite'
  | 'forge'
  | 'smelt'
  | 'summon'
  | 'sacrifice'
  | 'temper'
  | 'erupt';

export type PyAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'ultimate';

export type PyChamberId =
  | 'ember_hearth'
  | 'coal_crucible'
  | 'obsidian_anvil'
  | 'magma_cauldron'
  | 'smoke_foundry'
  | 'infernal_basin'
  | 'dragon_forge'
  | 'phoenix_pyre';

export type PyEventId =
  | 'wildfire'
  | 'ash_storm'
  | 'magma_surge'
  | 'inferno_festival'
  | 'phoenix_rebirth'
  | 'smoke_outbreak'
  | 'ember_rain'
  | 'forge_awakening';

export interface PySpeciesDef {
  key: PySpecies;
  label: string;
  description: string;
  color: string;
  xpMultiplier: number;
  encounterWeight: number;
  emoji: string;
}

export interface PyCreatureDef {
  id: string;
  name: string;
  species: PySpecies;
  rarity: PyRarity;
  description: string;
  lore: string;
  emoji: string;
  power: number;
  defense: number;
  cost: number;
  xpReward: number;
}

export interface PyCreatureState {
  id: string;
  name: string;
  species: PySpecies;
  rarity: PyRarity;
  description: string;
  lore: string;
  emoji: string;
  power: number;
  defense: number;
  cost: number;
  xpReward: number;
  discovered: boolean;
  captured: boolean;
  encounterCount: number;
  captureCount: number;
  lastSeen: number | null;
  level: number;
  xp: number;
}

export interface PyChamberDef {
  id: PyChamberId;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
  ambientColor: string;
  dangerLevel: number;
}

export interface PyChamberState {
  id: PyChamberId;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
  ambientColor: string;
  dangerLevel: number;
  unlocked: boolean;
  explored: boolean;
  visitsCount: number;
  firstVisitedAt: number | null;
}

export interface PyMaterialDef {
  id: string;
  name: string;
  rarity: PyRarity;
  description: string;
  value: number;
  emoji: string;
}

export interface PyStructureDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  maxLevel: number;
  buildCost: number;
  upgradeCost: number;
  effectType: string;
  effectPerLevel: number;
  unlockLevel: number;
}

export interface PyStructureState {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  maxLevel: number;
  buildCost: number;
  upgradeCost: number;
  effectType: string;
  effectPerLevel: number;
  unlockLevel: number;
  built: boolean;
  level: number;
  active: boolean;
  totalUpgrades: number;
  builtAt: number | null;
}

export interface PyAbilityDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  category: PyAbilityCategory;
  cooldownMs: number;
  unlockLevel: number;
  powerCost: number;
  effectType: string;
  effectValue: number;
}

export interface PyAbilityState {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  category: PyAbilityCategory;
  cooldownMs: number;
  unlockLevel: number;
  powerCost: number;
  effectType: string;
  effectValue: number;
  unlocked: boolean;
  lastUsed: number;
  totalUses: number;
}

export interface PyAchievementDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  rewardCoins: number;
  rewardTitle: string | null;
}

export interface PyAchievementState {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  rewardCoins: number;
  rewardTitle: string | null;
  unlocked: boolean;
  unlockedAt: number | null;
  progress: number;
}

export interface PyTitleDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  levelRequired: number;
  color: string;
  emoji: string;
}

export interface PyArtifactDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  rarity: PyRarity;
  effectType: string;
  effectValue: number;
  unlockCondition: string;
  passive: boolean;
}

export interface PyArtifactState {
  id: string;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  rarity: PyRarity;
  effectType: string;
  effectValue: number;
  unlockCondition: string;
  passive: boolean;
  discovered: boolean;
  equipped: boolean;
  discoveredAt: number | null;
}

export interface PyEventDef {
  id: PyEventId;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  durationMs: number;
  xpMultiplier: number;
  coinMultiplier: number;
  color: string;
  dangerLevel: number;
}

export interface PyEventState {
  id: PyEventId;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  durationMs: number;
  xpMultiplier: number;
  coinMultiplier: number;
  color: string;
  dangerLevel: number;
  active: boolean;
  timeRemaining: number;
  startedAt: number | null;
  timesTriggered: number;
}

export interface PyMaterialInventory {
  materialId: string;
  amount: number;
}

export interface PyDailyState {
  date: string;
  creaturesCaptured: number;
  materialsGathered: number;
  itemsForged: number;
  sacrificesMade: number;
  chambersVisited: number;
}

export interface PySessionLog {
  id: string;
  timestamp: number;
  action: PyAction;
  chamberId: PyChamberId | null;
  creatureId: string | null;
  result: 'success' | 'failure' | 'partial';
  xpGained: number;
  coinsGained: number;
  materialsGained: string[];
}

// =============================================================================
// SECTION 2: PY_ CONSTANTS (module-level helpers)
// =============================================================================

function pyGenerateId(): string {
  return `py_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function pyGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function pyXpRequiredForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level >= 50) return Infinity;
  return Math.floor(100 * Math.pow(1.12, level) + level * 20);
}

function pyClampLevel(lvl: number): number {
  return Math.max(1, Math.min(50, lvl));
}

function pyRarityXpMultiplier(r: PyRarity): number {
  const map: Record<PyRarity, number> = {
    common: 1, uncommon: 1.5, rare: 2.5, epic: 4, legendary: 7,
  };
  return map[r] ?? 1;
}

function pyRarityColor(r: PyRarity): string {
  const map: Record<PyRarity, string> = {
    common: '#808080', uncommon: '#34D399', rare: '#60A5FA', epic: '#A78BFA', legendary: '#FFAB00',
  };
  return map[r] ?? '#808080';
}

function pyRandomChoice<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// =============================================================================
// SECTION 3: COLOR THEME CONSTANTS
// =============================================================================

export const PY_COLORS = {
  flameOrange: '#FF4500',
  emberRed: '#DC143C',
  ashGray: '#808080',
  forgeGold: '#FFD700',
  smokeWhite: '#F5F5F5',
  magmaBlack: '#1A0A00',
  pyrePurple: '#8B008B',
  background: '#1A0A00',
  surface: '#2D1810',
  text: '#FFF3E0',
  textMuted: '#A1887F',
  danger: '#FF1744',
  success: '#00E676',
  warning: '#FFD600',
  info: '#FF8A65',
  border: '#4E342E',
  cardBg: '#3E2723',
} as const;

// =============================================================================
// SECTION 4: PY_SPECIES — 7 Species
// =============================================================================

export const PY_SPECIES: PySpeciesDef[] = [
  {
    key: 'ember_sprite',
    label: 'Ember Sprite',
    description: 'Tiny flickering beings born from dying campfires, playful and curious',
    color: PY_COLORS.flameOrange,
    xpMultiplier: 1.0,
    encounterWeight: 35,
    emoji: '✨',
  },
  {
    key: 'ash_golem',
    label: 'Ash Golem',
    description: 'Hulking constructs of compressed volcanic ash, slow but immensely powerful',
    color: PY_COLORS.ashGray,
    xpMultiplier: 1.5,
    encounterWeight: 25,
    emoji: '🗿',
  },
  {
    key: 'flame_dancer',
    label: 'Flame Dancer',
    description: 'Graceful fire spirits that weave through the air in mesmerizing patterns',
    color: PY_COLORS.emberRed,
    xpMultiplier: 2.0,
    encounterWeight: 18,
    emoji: '💃',
  },
  {
    key: 'magma_scorpion',
    label: 'Magma Scorpion',
    description: 'Armored arachnids with stingers of molten glass and carapaces of cooled lava',
    color: PY_COLORS.magmaBlack,
    xpMultiplier: 2.5,
    encounterWeight: 12,
    emoji: '🦂',
  },
  {
    key: 'smoke_phantom',
    label: 'Smoke Phantom',
    description: 'Ethereal beings composed of dense volcanic smoke, neither fully alive nor dead',
    color: PY_COLORS.smokeWhite,
    xpMultiplier: 3.5,
    encounterWeight: 6,
    emoji: '👻',
  },
  {
    key: 'inferno_dragon',
    label: 'Inferno Dragon',
    description: 'Ancient wyrms that nest within the deepest forge pits, their breath creates weapons',
    color: PY_COLORS.pyrePurple,
    xpMultiplier: 5.0,
    encounterWeight: 3,
    emoji: '🐉',
  },
  {
    key: 'phoenix_chick',
    label: 'Phoenix Chick',
    description: 'Newborn phoenixes that glow with the light of creation and endless rebirth',
    color: PY_COLORS.forgeGold,
    xpMultiplier: 6.5,
    encounterWeight: 1,
    emoji: '🐥',
  },
];

// =============================================================================
// SECTION 5: PY_CREATURES — 35 Creatures (5 tiers × 7)
// =============================================================================

export const PY_CREATURES: PyCreatureDef[] = [
  // ---- Common (7) ----
  { id: 'spark_wisp', name: 'Spark Wisp', species: 'ember_sprite', rarity: 'common', description: 'A tiny flicker of living flame that drifts on thermal currents', lore: 'Born from the last ember of a dying hearth, spark wisps seek warmth and company.', emoji: '✨', power: 8, defense: 3, cost: 10, xpReward: 10 },
  { id: 'cinder_imp', name: 'Cinder Imp', species: 'ember_sprite', rarity: 'common', description: 'A mischievous imp that delights in starting small fires everywhere', lore: 'Cinder imps are the pranksters of the pyre yard, igniting coal piles for fun.', emoji: '😈', power: 10, defense: 5, cost: 12, xpReward: 12 },
  { id: 'glow_moth', name: 'Glow Moth', species: 'ember_sprite', rarity: 'common', description: 'A moth with wings of living flame that illuminates dark corridors', lore: 'Glow moths are drawn to the hottest forges, using their wings to fan flames.', emoji: '🦋', power: 6, defense: 4, cost: 8, xpReward: 8 },
  { id: 'coal_beetle', name: 'Coal Beetle', species: 'ember_sprite', rarity: 'common', description: 'A heavily armored beetle with a shell of compressed coal', lore: 'Coal beetles roll into perfect spheres when threatened, radiating heat.', emoji: '🪲', power: 12, defense: 15, cost: 14, xpReward: 11 },
  { id: 'ember_mouse', name: 'Ember Mouse', species: 'ember_sprite', rarity: 'common', description: 'A tiny rodent with fur of smoldering embers that never burns out', lore: 'Ember mice nest in warm ash beds, their nests glowing faintly at night.', emoji: '🐭', power: 5, defense: 2, cost: 6, xpReward: 7 },
  { id: 'fire_ant', name: 'Fire Ant', species: 'ember_sprite', rarity: 'common', description: 'Industrious ants that build colonies from heat-hardened clay', lore: 'Fire ant colonies are master architects, constructing elaborate clay towers.', emoji: '🐜', power: 4, defense: 6, cost: 8, xpReward: 9 },
  { id: 'blaze_fly', name: 'Blaze Fly', species: 'ember_sprite', rarity: 'common', description: 'A buzzing insect that leaves trails of sparks wherever it goes', lore: 'Blaze flies synchronize their flights to create beautiful firework displays.', emoji: '🪰', power: 7, defense: 3, cost: 9, xpReward: 10 },

  // ---- Uncommon (7) ----
  { id: 'slag_golem', name: 'Slag Golem', species: 'ash_golem', rarity: 'uncommon', description: 'A six-legged golem that drags itself across cooling slag fields', lore: 'Slag golems are the cleanup crew of the pyre yard, recycling waste into building blocks.', emoji: '🗿', power: 25, defense: 30, cost: 80, xpReward: 28 },
  { id: 'basalt_hound', name: 'Basalt Hound', species: 'ash_golem', rarity: 'uncommon', description: 'A fierce hound with a hide of interlocking basalt plates', lore: 'Basalt hounds patrol the outer chambers, their footprints cooling into glass.', emoji: '🐕', power: 30, defense: 22, cost: 90, xpReward: 32 },
  { id: 'ash_elemental', name: 'Ash Elemental', species: 'ash_golem', rarity: 'uncommon', description: 'A sentient column of swirling volcanic ash that reshapes at will', lore: 'Ash elementals are the memory of eruptions past, carrying the wisdom of ancient fires.', emoji: '🌪️', power: 28, defense: 18, cost: 85, xpReward: 30 },
  { id: 'cinder_wraith', name: 'Cinder Wraith', species: 'ash_golem', rarity: 'uncommon', description: 'A spectral guardian formed from the collective ashes of pyre rituals', lore: 'Cinder wraiths guard sacred forges, appearing only during the darkest ceremonies.', emoji: '👤', power: 22, defense: 25, cost: 75, xpReward: 26 },
  { id: 'clay_giant', name: 'Clay Giant', species: 'ash_golem', rarity: 'uncommon', description: 'A massive giant molded from infernal clay that hardens in fire', lore: 'Clay giants are shaped by master potters who imbue them with protective runes.', emoji: '🗿', power: 35, defense: 38, cost: 110, xpReward: 35 },
  { id: 'ember_fox', name: 'Ember Fox', species: 'ash_golem', rarity: 'uncommon', description: 'A clever fox with nine tails of living flame', lore: 'The ember fox is said to have stolen the secret of fire from the sun itself.', emoji: '🦊', power: 20, defense: 15, cost: 70, xpReward: 24 },
  { id: 'pumice_turtle', name: 'Pumice Turtle', species: 'ash_golem', rarity: 'uncommon', description: 'An ancient turtle with a shell of lightweight volcanic pumice', lore: 'Pumice turtles float on magma pools, basking in the intense heat for centuries.', emoji: '🐢', power: 18, defense: 35, cost: 95, xpReward: 27 },

  // ---- Rare (7) ----
  { id: 'lava_mantis', name: 'Lava Mantis', species: 'magma_scorpion', rarity: 'rare', description: 'A towering insect predator with scythe arms of molten obsidian', lore: 'Lava mantises are the apex hunters of the mid-depths, their strikes faster than thought.', emoji: '🦗', power: 55, defense: 28, cost: 300, xpReward: 65 },
  { id: 'magma_scorpion', name: 'Magma Scorpion King', species: 'magma_scorpion', rarity: 'rare', description: 'The king of all magma scorpions with a stinger of pure liquid fire', lore: 'Its venom can melt through any known material, and its carapace is harder than diamond.', emoji: '🦂', power: 65, defense: 45, cost: 380, xpReward: 75 },
  { id: 'crystal_spider', name: 'Crystal Spider', species: 'magma_scorpion', rarity: 'rare', description: 'A spider that weaves webs of molten crystal in forge pit corners', lore: 'Crystal spiders are master jewelers, their webs cooling into precious gemstones.', emoji: '🕷️', power: 50, defense: 35, cost: 280, xpReward: 60 },
  { id: 'obsidian_crab', name: 'Obsidian Crab', species: 'magma_scorpion', rarity: 'rare', description: 'A crab with a shell of perfect obsidian glass and claws of molten iron', lore: 'Obsidian crabs guard the deepest mineral veins, cutting intruders with glass claws.', emoji: '🦀', power: 48, defense: 52, cost: 350, xpReward: 62 },
  { id: 'fire_centipede', name: 'Fire Centipede', species: 'magma_scorpion', rarity: 'rare', description: 'A hundred-legged creature that leaves a trail of molten footprints', lore: 'Fire centipedes can squeeze through the tiniest cracks, emerging anywhere in the yard.', emoji: '🐛', power: 58, defense: 30, cost: 310, xpReward: 68 },
  { id: 'slag_worm', name: 'Slag Worm', species: 'magma_scorpion', rarity: 'rare', description: 'A massive segmented worm that burrows through cooling slag deposits', lore: 'Slag worms are living mining machines, their tunnels revealing rich mineral veins.', emoji: '🪱', power: 42, defense: 40, cost: 270, xpReward: 58 },
  { id: 'molten_beetle', name: 'Molten Beetle', species: 'magma_scorpion', rarity: 'rare', description: 'A beetle whose shell flows like liquid metal, reforming on impact', lore: 'Molten beetles absorb kinetic energy, redirecting force back at attackers as heat.', emoji: '🪲', power: 52, defense: 48, cost: 340, xpReward: 70 },

  // ---- Epic (7) ----
  { id: 'smoke_specter', name: 'Smoke Specter', species: 'smoke_phantom', rarity: 'epic', description: 'The vengeful spirit of a massive pyre eruption given spectral form', lore: 'It manifests as a towering figure of swirling gray smoke that drains the warmth of everything nearby.', emoji: '👻', power: 95, defense: 40, cost: 800, xpReward: 150 },
  { id: 'ash_banshee', name: 'Ash Banshee', species: 'smoke_phantom', rarity: 'epic', description: 'A wailing phantom whose scream fills the air with choking ash', lore: 'The ash banshee guards the boundary between the living forge and the ghostly beyond.', emoji: '😱', power: 88, defense: 35, cost: 750, xpReward: 140 },
  { id: 'haze_elemental', name: 'Haze Elemental', species: 'smoke_phantom', rarity: 'epic', description: 'A being of concentrated volcanic haze that blinds and disorients', lore: 'Haze elementals can fill entire chambers with impenetrable fog in seconds.', emoji: '🌫️', power: 82, defense: 55, cost: 820, xpReward: 145 },
  { id: 'shadow_smoke', name: 'Shadow Smoke', species: 'smoke_phantom', rarity: 'epic', description: 'A phantom that exists between smoke and shadow, attacking from nowhere', lore: 'Shadow smoke is the collective grief of every creature lost to the forge flames.', emoji: '🖤', power: 105, defense: 30, cost: 900, xpReward: 160 },
  { id: 'phantom_forger', name: 'Phantom Forger', species: 'smoke_phantom', rarity: 'epic', description: 'The ghost of a legendary blacksmith who perished in a forge accident', lore: 'The phantom forger still hammers at an invisible anvil, creating spectral weapons of smoke.', emoji: '⚒️', power: 90, defense: 50, cost: 860, xpReward: 155 },
  { id: 'mist_walker', name: 'Mist Walker', species: 'smoke_phantom', rarity: 'epic', description: 'A ghostly figure that strides through volcanic mist as if on solid ground', lore: 'Mist walkers carry the secrets of ancient forging techniques in their silent passage.', emoji: '🚶', power: 85, defense: 48, cost: 780, xpReward: 148 },
  { id: 'inferno_wraith', name: 'Inferno Wraith', species: 'smoke_phantom', rarity: 'epic', description: 'A spectral dragon wreathed in smoke and fire, neither alive nor dead', lore: 'The inferno wraith is the result of an inferno dragon that refused to die, persisting as pure rage.', emoji: '🐲', power: 110, defense: 45, cost: 950, xpReward: 165 },

  // ---- Legendary (7) ----
  { id: 'inferno_dragon', name: 'Inferno Dragon', species: 'inferno_dragon', rarity: 'legendary', description: 'An ancient dragon that nests within the Dragon Forge, its breath creates legendary weapons', lore: 'The Inferno Dragon has slept for ten thousand years, dreaming of the perfect blade it will one day forge.', emoji: '🐉', power: 200, defense: 120, cost: 3000, xpReward: 500 },
  { id: 'phoenix_queen', name: 'Phoenix Queen', species: 'phoenix_chick', rarity: 'legendary', description: 'The matriarch of all phoenixes, her song can reignite dead volcanoes', lore: 'She has died and been reborn a thousand times, each incarnation more radiant than the last.', emoji: '🔥', power: 180, defense: 100, cost: 2800, xpReward: 450 },
  { id: 'magma_titan', name: 'Magma Titan', species: 'ash_golem', rarity: 'legendary', description: 'A walking mountain of ember and obsidian, taller than the deepest forge pits', lore: 'The magma titan is the pyre yard itself given form — the spirit of every fire ever lit within.', emoji: '🏔️', power: 250, defense: 200, cost: 4000, xpReward: 600 },
  { id: 'smoke_sovereign', name: 'Smoke Sovereign', species: 'smoke_phantom', rarity: 'legendary', description: 'The ruler of all smoke and phantom kind, commanding legions of spectral beings', lore: 'The Smoke Sovereign exists in every wisp of smoke, watching through a billion eyes.', emoji: '👑', power: 220, defense: 150, cost: 3500, xpReward: 550 },
  { id: 'scorpion_emperor', name: 'Scorpion Emperor', species: 'magma_scorpion', rarity: 'legendary', description: 'The largest scorpion ever forged, its stinger can pierce the earth itself', lore: 'Legends say the Scorpion Emperor\'s sting created the first volcano when it struck the ground.', emoji: '🦂', power: 230, defense: 170, cost: 3600, xpReward: 560 },
  { id: 'eternal_phoenix', name: 'Eternal Phoenix', species: 'phoenix_chick', rarity: 'legendary', description: 'The original phoenix, born from the first fire ever created in the universe', lore: 'A single feather from the Eternal Phoenix contains enough energy to power the pyre yard for eternity.', emoji: '🦅', power: 190, defense: 130, cost: 3200, xpReward: 520 },
  { id: 'primordial_flame', name: 'Primordial Flame', species: 'flame_dancer', rarity: 'legendary', description: 'The embodiment of creation fire, the spark from which all life in the yard originated', lore: 'The Primordial Flame dances at the heart of the Phoenix Pyre, neither growing nor diminishing.', emoji: '🔆', power: 260, defense: 180, cost: 4500, xpReward: 700 },
];

// =============================================================================
// SECTION 6: PY_CHAMBERS — 8 Forge Pits
// =============================================================================

export const PY_CHAMBERS: PyChamberDef[] = [
  {
    id: 'ember_hearth',
    name: 'Ember Hearth',
    description: 'A warm, welcoming hearth where new flame beings first awaken',
    lore: 'The Ember Hearth is the birthplace of all pyre yard creatures. Every new ember finds its first warmth here.',
    emoji: '🔥',
    level: 1,
    resources: ['coal', 'ash_powder', 'ember_coal'],
    capacity: 5,
    unlockLevel: 1,
    ambientColor: '#FF6B35',
    dangerLevel: 1,
  },
  {
    id: 'coal_crucible',
    name: 'Coal Crucible',
    description: 'A bubbling crucible of molten coal that produces basic forging materials',
    lore: 'The Coal Crucible has burned without interruption since the yard was founded, its fire tended by generations of ash golems.',
    emoji: '⚗️',
    level: 2,
    resources: ['coal', 'ember_coal', 'fire_crystals'],
    capacity: 8,
    unlockLevel: 3,
    ambientColor: '#424242',
    dangerLevel: 2,
  },
  {
    id: 'obsidian_anvil',
    name: 'Obsidian Anvil',
    description: 'A massive anvil of polished obsidian where weapons and tools are forged',
    lore: 'The Obsidian Anvil was carved from a single massive obsidian formation by the first inferno dragons.',
    emoji: '🔨',
    level: 3,
    resources: ['obsidian_shards', 'molten_iron', 'flame_runes'],
    capacity: 10,
    unlockLevel: 7,
    ambientColor: '#1A1A2E',
    dangerLevel: 3,
  },
  {
    id: 'magma_cauldron',
    name: 'Magma Cauldron',
    description: 'A vast cauldron of liquid magma where rare materials are smelted',
    lore: 'The Magma Cauldron bubbles with the extracted essence of a thousand volcanoes, each bubble containing a different element.',
    emoji: '🫕',
    level: 4,
    resources: ['lava_essence', 'obsidian_shards', 'fire_crystals'],
    capacity: 12,
    unlockLevel: 12,
    ambientColor: '#FF4500',
    dangerLevel: 5,
  },
  {
    id: 'smoke_foundry',
    name: 'Smoke Foundry',
    description: 'A mysterious foundry where smoke is compressed into solid materials',
    lore: 'The Smoke Foundry operates on principles no mortal fully understands, transforming ephemeral smoke into tangible power.',
    emoji: '🏭',
    level: 5,
    resources: ['smoke_quartz', 'ash_powder', 'infernal_clay'],
    capacity: 14,
    unlockLevel: 18,
    ambientColor: '#9E9E9E',
    dangerLevel: 6,
  },
  {
    id: 'infernal_basin',
    name: 'Infernal Basin',
    description: 'A scorching basin of concentrated infernal fire used for tempering',
    lore: 'The Infernal Basin channels fire from the deepest pits of the underworld, its flames hotter than the surface of the sun.',
    emoji: '🌋',
    level: 6,
    resources: ['brimstone_dust', 'lava_essence', 'flame_runes'],
    capacity: 16,
    unlockLevel: 25,
    ambientColor: '#DC143C',
    dangerLevel: 7,
  },
  {
    id: 'dragon_forge',
    name: 'Dragon Forge',
    description: 'The sacred forge where inferno dragons create legendary artifacts',
    lore: 'Only the most powerful flame beings may approach the Dragon Forge. Its fires have created weapons that shaped history.',
    emoji: '🐲',
    level: 7,
    resources: ['molten_iron', 'brimstone_dust', 'fire_crystals'],
    capacity: 18,
    unlockLevel: 33,
    ambientColor: '#8B008B',
    dangerLevel: 9,
  },
  {
    id: 'phoenix_pyre',
    name: 'Phoenix Pyre',
    description: 'The ultimate forge pit where phoenixes are reborn and primordial flames burn',
    lore: 'The Phoenix Pyre is the heart of the pyre yard. Here, the Primordial Flame burns eternally, and every phoenix finds renewal.',
    emoji: '🔆',
    level: 8,
    resources: ['phoenix_feathers', 'lava_essence', 'fire_crystals', 'flame_runes'],
    capacity: 20,
    unlockLevel: 42,
    ambientColor: '#FFD700',
    dangerLevel: 10,
  },
];

// =============================================================================
// SECTION 7: PY_MATERIALS — 12 Materials
// =============================================================================

export const PY_MATERIALS: PyMaterialDef[] = [
  { id: 'coal', name: 'Coal', rarity: 'common', description: 'Basic volcanic coal, warm to the touch and essential for fueling hearths', value: 5, emoji: '⬛' },
  { id: 'ash_powder', name: 'Ash Powder', rarity: 'common', description: 'Fine gray powder left by extinguished flames, used in rituals and construction', value: 4, emoji: '⚪' },
  { id: 'ember_coal', name: 'Ember Coal', rarity: 'common', description: 'Coal that perpetually glows with inner warmth, never fully extinguishing', value: 8, emoji: '🟠' },
  { id: 'fire_crystals', name: 'Fire Crystals', rarity: 'uncommon', description: 'Crystals that contain trapped elemental fire, pulsing with orange light', value: 30, emoji: '🔶' },
  { id: 'obsidian_shards', name: 'Obsidian Shards', rarity: 'uncommon', description: 'Razor-sharp fragments of volcanic glass that cut at the molecular level', value: 35, emoji: '🖤' },
  { id: 'infernal_clay', name: 'Infernal Clay', rarity: 'uncommon', description: 'Heat-hardened clay infused with demonic energy, used for golem construction', value: 28, emoji: '🟤' },
  { id: 'smoke_quartz', name: 'Smoke Quartz', rarity: 'rare', description: 'Translucent quartz filled with swirling smoke-like inclusions, used in enchanting', value: 100, emoji: '🔲' },
  { id: 'molten_iron', name: 'Molten Iron', rarity: 'rare', description: 'Iron kept perpetually liquid by forge heat, the backbone of all construction', value: 120, emoji: '🫠' },
  { id: 'flame_runes', name: 'Flame Runes', rarity: 'rare', description: 'Ancient runes carved in obsidian that glow with fiery magical inscriptions', value: 150, emoji: '🔶' },
  { id: 'brimstone_dust', name: 'Brimstone Dust', rarity: 'epic', description: 'Powdered brimstone from the underworld, smelling of sulfur and ancient power', value: 400, emoji: '🟡' },
  { id: 'lava_essence', name: 'Lava Essence', rarity: 'epic', description: 'The concentrated lifeblood of magma flows, bottled in heat-proof containers', value: 500, emoji: '🔴' },
  { id: 'phoenix_feathers', name: 'Phoenix Feathers', rarity: 'legendary', description: 'Feathers shed by reborn phoenixes, radiating warmth and renewal energy', value: 2000, emoji: '🪶' },
];

// =============================================================================
// SECTION 8: PY_STRUCTURES — 8 Structures
// =============================================================================

export const PY_STRUCTURES: PyStructureDef[] = [
  {
    id: 'ember_storage', name: 'Ember Storage', description: 'A stone vault that stores gathered materials safely from fire damage',
    lore: 'The first structure built in any pyre yard, the Ember Storage keeps precious resources safe from stray sparks.', emoji: '🏪', maxLevel: 10, buildCost: 50, upgradeCost: 30, effectType: 'storage_capacity', effectPerLevel: 5, unlockLevel: 1,
  },
  {
    id: 'coal_hopper', name: 'Coal Hopper', description: 'An automated hopper that feeds coal into forges for continuous operation',
    lore: 'The Coal Hopper was invented by an enterprising ash golem who grew tired of carrying coal by hand.', emoji: '🏗️', maxLevel: 10, buildCost: 100, upgradeCost: 60, effectType: 'coal_production', effectPerLevel: 2, unlockLevel: 3,
  },
  {
    id: 'smoke_vent', name: 'Smoke Vent', description: 'A ventilation shaft that channels harmful smoke out of the working area',
    lore: 'Without Smoke Vents, the pyre yard would be uninhabitable within minutes. They are the unsung heroes of forge safety.', emoji: '💨', maxLevel: 10, buildCost: 80, upgradeCost: 45, effectType: 'smoke_reduction', effectPerLevel: 3, unlockLevel: 5,
  },
  {
    id: 'forge_bellows', name: 'Forge Bellows', description: 'Massive bellows that stoke forge fires to extreme temperatures',
    lore: 'The Forge Bellows are powered by the captured breath of inferno dragons, stored in enchanted leather.', emoji: '🌬️', maxLevel: 10, buildCost: 200, upgradeCost: 100, effectType: 'forge_speed', effectPerLevel: 4, unlockLevel: 8,
  },
  {
    id: 'crystal_crucible', name: 'Crystal Crucible', description: 'A specialized crucible for processing fire crystals into refined essence',
    lore: 'The Crystal Crucible can extract pure elemental fire from raw crystals, a process that requires extreme precision.', emoji: '⚗️', maxLevel: 10, buildCost: 300, upgradeCost: 150, effectType: 'crystal_refine', effectPerLevel: 3, unlockLevel: 12,
  },
  {
    id: 'tempering_anvil', name: 'Tempering Anvil', description: 'A reinforced anvil for tempering weapons and armor to legendary quality',
    lore: 'The Tempering Anvil rings with each strike, and the sound can be heard across the entire pyre yard.', emoji: '⚒️', maxLevel: 10, buildCost: 500, upgradeCost: 200, effectType: 'temper_quality', effectPerLevel: 5, unlockLevel: 18,
  },
  {
    id: 'ritual_pyre', name: 'Ritual Pyre', description: 'A ceremonial pyre for summoning powerful flame beings and performing sacrifices',
    lore: 'The Ritual Pyre burns with colored flames that change based on the offering. Phoenix feathers produce golden fire.', emoji: '🔥', maxLevel: 10, buildCost: 800, upgradeCost: 300, effectType: 'summon_power', effectPerLevel: 4, unlockLevel: 25,
  },
  {
    id: 'dragon_throne', name: 'Dragon Throne', description: 'A throne carved from obsidian where the inferno dragon bestows legendary boons',
    lore: 'Only those who have mastered every forge pit may sit upon the Dragon Throne and receive its ancient blessings.', emoji: '👑', maxLevel: 10, buildCost: 2000, upgradeCost: 500, effectType: 'all_bonus', effectPerLevel: 2, unlockLevel: 35,
  },
];

// =============================================================================
// SECTION 9: PY_ABILITIES — 8 Abilities (2 per category)
// =============================================================================

export const PY_ABILITIES: PyAbilityDef[] = [
  // Offensive (2)
  {
    id: 'fireball', name: 'Fireball', description: 'Launches a concentrated sphere of fire that explodes on impact',
    lore: 'The most basic offensive technique in the pyre yard, taught to every ember sprite on their first day.', emoji: '🔥', category: 'offensive', cooldownMs: 5000, unlockLevel: 1, powerCost: 10, effectType: 'damage', effectValue: 25,
  },
  {
    id: 'inferno_breath', name: 'Inferno Breath', description: 'Unleashes a devastating cone of superheated flame in a direction',
    lore: 'Mimicking the breath of the Inferno Dragon, this technique requires precise control of internal heat.', emoji: '🌋', category: 'offensive', cooldownMs: 15000, unlockLevel: 15, powerCost: 30, effectType: 'aoe_damage', effectValue: 60,
  },
  // Defensive (2)
  {
    id: 'flame_shield', name: 'Flame Shield', description: 'Wraps the caster in a protective barrier of swirling fire',
    lore: 'Flame Shields deflect physical attacks and burn anything that comes too close to the caster.', emoji: '🛡️', category: 'defensive', cooldownMs: 10000, unlockLevel: 3, powerCost: 15, effectType: 'shield', effectValue: 30,
  },
  {
    id: 'ash_armor', name: 'Ash Armor', description: 'Encases the caster in hardened volcanic ash that absorbs tremendous damage',
    lore: 'Ash Armor was developed by the ash golems, who have been perfecting defensive techniques for millennia.', emoji: '🪨', category: 'defensive', cooldownMs: 20000, unlockLevel: 20, powerCost: 35, effectType: 'armor', effectValue: 50,
  },
  // Utility (2)
  {
    id: 'ember_sight', name: 'Ember Sight', description: 'Enhances vision to see through smoke and detect hidden heat sources',
    lore: 'Ember Sight reveals the invisible — hidden creatures, secret passages, and buried treasure glow like embers.', emoji: '👁️', category: 'utility', cooldownMs: 8000, unlockLevel: 5, powerCost: 8, effectType: 'vision', effectValue: 20,
  },
  {
    id: 'smoke_dash', name: 'Smoke Dash', description: 'Transforms into smoke and dashes through obstacles to reappear elsewhere',
    lore: 'Smoke Dash is taught by the smoke phantoms, who move through walls as easily as air.', emoji: '💨', category: 'utility', cooldownMs: 12000, unlockLevel: 10, powerCost: 20, effectType: 'movement', effectValue: 35,
  },
  // Ultimate (2)
  {
    id: 'eruption', name: 'Eruption', description: 'Triggers a devastating volcanic eruption that damages everything in range',
    lore: 'Eruption channels the raw power of the magma beneath the pyre yard itself. Use with extreme caution.', emoji: '💥', category: 'ultimate', cooldownMs: 60000, unlockLevel: 30, powerCost: 80, effectType: 'catastrophe', effectValue: 120,
  },
  {
    id: 'phoenix_rebirth', name: 'Phoenix Rebirth', description: 'Sacrifices current power to fully restore health and boost all abilities',
    lore: 'The ultimate ability, granted only by the Phoenix Queen herself. It transcends death and returns stronger.', emoji: '🔆', category: 'ultimate', cooldownMs: 120000, unlockLevel: 40, powerCost: 50, effectType: 'rebirth', effectValue: 100,
  },
];

// =============================================================================
// SECTION 10: PY_ACHIEVEMENTS — 10 Achievements
// =============================================================================

export const PY_ACHIEVEMENTS: PyAchievementDef[] = [
  {
    id: 'first_ember', name: 'First Ember', description: 'Ignite your first flame in the Ember Hearth',
    lore: 'Every journey begins with a single spark.', emoji: '🔥', conditionKey: 'total_ignites', targetValue: 1, rewardXp: 20, rewardCoins: 10, rewardTitle: null,
  },
  {
    id: 'forge_apprentice', name: 'Forge Apprentice', description: 'Successfully forge 10 items in the pyre yard',
    lore: 'The master smiths once stood where you stand now.', emoji: '🔨', conditionKey: 'total_forges', targetValue: 10, rewardXp: 100, rewardCoins: 50, rewardTitle: null,
  },
  {
    id: 'chamber_explorer', name: 'Chamber Explorer', description: 'Visit all 8 forge pit chambers at least once',
    lore: 'Only the curious discover the deepest secrets of the pyre yard.', emoji: '🗺️', conditionKey: 'chambers_visited', targetValue: 8, rewardXp: 200, rewardCoins: 100, rewardTitle: null,
  },
  {
    id: 'creature_collector', name: 'Creature Collector', description: 'Capture 15 different flame beings for your collection',
    lore: 'A diverse collection of flame beings is the mark of a true pyre master.', emoji: '📦', conditionKey: 'creatures_captured', targetValue: 15, rewardXp: 300, rewardCoins: 150, rewardTitle: null,
  },
  {
    id: 'master_smelter', name: 'Master Smelter', description: 'Smelt 50 materials across all chambers',
    lore: 'The master smelter can extract value from even the most worthless slag.', emoji: '⚗️', conditionKey: 'total_smelts', targetValue: 50, rewardXp: 250, rewardCoins: 200, rewardTitle: 'Smelter Supreme',
  },
  {
    id: 'summoner supreme', name: 'Summoner Supreme', description: 'Successfully summon 20 flame beings through ritual',
    lore: 'The pyre responds to those who know the old chants and offerings.', emoji: '✨', conditionKey: 'total_summons', targetValue: 20, rewardXp: 400, rewardCoins: 250, rewardTitle: null,
  },
  {
    id: 'dragon_slayer', name: 'Dragon Slayer', description: 'Defeat an inferno dragon in the Dragon Forge',
    lore: 'Only legends face the Inferno Dragon and live to tell the tale.', emoji: '🐉', conditionKey: 'dragon_defeats', targetValue: 1, rewardXp: 500, rewardCoins: 300, rewardTitle: null,
  },
  {
    id: 'artifact_hunter', name: 'Artifact Hunter', description: 'Discover all 6 legendary artifacts hidden in the pyre yard',
    lore: 'The artifacts of the pyre yard contain the concentrated power of ancient eras.', emoji: '🏺', conditionKey: 'artifacts_found', targetValue: 6, rewardXp: 600, rewardCoins: 400, rewardTitle: 'Relic Keeper',
  },
  {
    id: 'phoenix_guardian', name: 'Phoenix Guardian', description: 'Reach the Phoenix Pyre and witness the Primordial Flame',
    lore: 'Those who gaze upon the Primordial Flame are forever changed.', emoji: '🦅', conditionKey: 'phoenix_pyre_reached', targetValue: 1, rewardXp: 800, rewardCoins: 500, rewardTitle: null,
  },
  {
    id: 'yard_master', name: 'Yard Master', description: 'Reach maximum level and master every aspect of the pyre yard',
    lore: 'The title of Yard Master is the highest honor in the flame community. You have earned it.', emoji: '👑', conditionKey: 'yard_level', targetValue: 50, rewardXp: 1000, rewardCoins: 1000, rewardTitle: 'Master of the Pyre',
  },
];

// =============================================================================
// SECTION 11: PY_TITLES — 8 Titles
// =============================================================================

export const PY_TITLES: PyTitleDef[] = [
  {
    id: 'spark_kindler', name: 'Spark Kindler', description: 'A newcomer who has just lit their first ember',
    lore: 'Every pyre master was once a spark kindler, staring into their first flame with wonder.', levelRequired: 1, color: PY_COLORS.flameOrange, emoji: '✨',
  },
  {
    id: 'coal_tender', name: 'Coal Tender', description: 'One who tends the coal fires and keeps the hearths burning',
    lore: 'The humble coal tender is the backbone of every forge, ensuring the fires never die.', levelRequired: 5, color: PY_COLORS.ashGray, emoji: '⬛',
  },
  {
    id: 'flame_weaver', name: 'Flame Weaver', description: 'A skilled artisan who shapes fire into tools and art',
    lore: 'Flame weavers can coax fire into any shape, from delicate threads to towering pillars.', levelRequired: 10, color: PY_COLORS.emberRed, emoji: '🔥',
  },
  {
    id: 'obsidian_smith', name: 'Obsidian Smith', description: 'A master smith who works with volcanic glass to create legendary items',
    lore: 'The Obsidian Smith\'s creations are said to last longer than the mountains themselves.', levelRequired: 18, color: PY_COLORS.magmaBlack, emoji: '🔨',
  },
  {
    id: 'smoke_whisperer', name: 'Smoke Whisperer', description: 'One who communicates with the smoke phantoms and learns their secrets',
    lore: 'The Smoke Whisperer hears voices in every wisp of smoke, carrying messages from beyond.', levelRequired: 25, color: PY_COLORS.smokeWhite, emoji: '👻',
  },
  {
    id: 'inferno_lord', name: 'Inferno Lord', description: 'A powerful ruler who commands infernal fire and demonic flame',
    lore: 'The Inferno Lord\'s presence causes all nearby flames to bow in reverence.', levelRequired: 33, color: PY_COLORS.pyrePurple, emoji: '🌋',
  },
  {
    id: 'dragon_warden', name: 'Dragon Warden', description: 'The guardian who watches over the Dragon Forge and its ancient inhabitant',
    lore: 'Only the Dragon Warden may approach the Inferno Dragon without being consumed.', levelRequired: 40, color: PY_COLORS.forgeGold, emoji: '🐲',
  },
  {
    id: 'pyre_sovereign', name: 'Pyre Sovereign', description: 'The absolute ruler of the entire pyre yard and all its flame beings',
    lore: 'The Pyre Sovereign holds the title that every flame being aspires to. Their word is fire law.', levelRequired: 50, color: '#FF2400', emoji: '👑',
  },
];

// =============================================================================
// SECTION 12: PY_ARTIFACTS — 6 Artifacts
// =============================================================================

export const PY_ARTIFACTS: PyArtifactDef[] = [
  {
    id: 'ember_crown', name: 'Ember Crown', description: 'A crown of perpetually burning embers that grants enhanced fire control',
    lore: 'Worn by the first Pyre Sovereign, the Ember Crown has passed through countless hands, each adding its own fire.', emoji: '👑', rarity: 'rare', effectType: 'power_boost', effectValue: 15, unlockCondition: 'Reach level 10', passive: true,
  },
  {
    id: 'obsidian_blade', name: 'Obsidian Blade', description: 'A sword forged from a single piece of perfect obsidian, sharper than thought',
    lore: 'The Obsidian Blade was forged during a solar eclipse by an unknown master smith. It cuts through reality itself.', emoji: '🗡️', rarity: 'epic', effectType: 'attack_boost', effectValue: 25, unlockCondition: 'Complete the Obsidian Anvil challenge', passive: true,
  },
  {
    id: 'phoenix_feather_cloak', name: 'Phoenix Feather Cloak', description: 'A cloak woven from phoenix feathers that grants immunity to fire damage',
    lore: 'The Phoenix Feather Cloak shimmers with golden light and grants the wearer the resilience of a phoenix.', emoji: '🧥', rarity: 'epic', effectType: 'fire_immunity', effectValue: 100, unlockCondition: 'Capture a Phoenix Chick', passive: true,
  },
  {
    id: 'magma_heart', name: 'Magma Heart', description: 'A crystallized piece of the earth\'s magma core that pulses with primal energy',
    lore: 'The Magma Heart beats in sync with the planet itself. Holding it, you feel the pulse of creation.', emoji: '💗', rarity: 'legendary', effectType: 'max_hp_boost', effectValue: 50, unlockCondition: 'Reach the Magma Cauldron', passive: true,
  },
  {
    id: 'smoke_mirror', name: 'Smoke Mirror', description: 'A mirror of condensed smoke that reveals hidden truths and secret passages',
    lore: 'The Smoke Mirror shows not what is, but what could be. Gaze into it at your own peril.', emoji: '🪞', rarity: 'rare', effectType: 'vision_boost', effectValue: 30, unlockCondition: 'Discover 3 Smoke Phantom creatures', passive: true,
  },
  {
    id: 'dragon_forge_hammer', name: 'Dragon Forge Hammer', description: 'The hammer used by the Inferno Dragon to create legendary weapons',
    lore: 'When the Dragon Forge Hammer strikes, the sound echoes through every forge in the world.', emoji: '🔨', rarity: 'legendary', effectType: 'forge_speed_boost', effectValue: 40, unlockCondition: 'Complete the Dragon Forge', passive: true,
  },
];

// =============================================================================
// SECTION 13: PY_EVENTS — 8 Events
// =============================================================================

export const PY_EVENTS: PyEventDef[] = [
  {
    id: 'wildfire', name: 'Wildfire', description: 'A raging wildfire sweeps through the pyre yard, increasing all creature encounters',
    lore: 'Wildfires are both destruction and renewal — they clear the old and make way for the new.', emoji: '🔥', durationMs: 60000, xpMultiplier: 1.5, coinMultiplier: 1.5, color: '#FF4500', dangerLevel: 5,
  },
  {
    id: 'ash_storm', name: 'Ash Storm', description: 'A thick blanket of volcanic ash obscures vision but doubles material drops',
    lore: 'Ash storms are when the earth remembers ancient eruptions, covering everything in gray memory.', emoji: '🌪️', durationMs: 45000, xpMultiplier: 1.2, coinMultiplier: 1.8, color: '#808080', dangerLevel: 4,
  },
  {
    id: 'magma_surge', name: 'Magma Surge', description: 'A surge of magma rises from below, flooding chambers with new resources',
    lore: 'Magma surges bring treasures from the deep — minerals, crystals, and sometimes ancient artifacts.', emoji: '🌊', durationMs: 75000, xpMultiplier: 1.3, coinMultiplier: 2.0, color: '#FF6347', dangerLevel: 6,
  },
  {
    id: 'inferno_festival', name: 'Inferno Festival', description: 'A celebration of fire with triple rewards and rare creature spawns',
    lore: 'During the Inferno Festival, every flame being in the yard joins in a grand dance of fire and light.', emoji: '🎉', durationMs: 90000, xpMultiplier: 3.0, coinMultiplier: 3.0, color: '#FFD700', dangerLevel: 2,
  },
  {
    id: 'phoenix_rebirth', name: 'Phoenix Rebirth', description: 'A phoenix dies and is reborn, granting massive XP to all nearby creatures',
    lore: 'The moment of a phoenix rebirth is the most powerful event in the pyre yard, filling all with renewed vigor.', emoji: '🦅', durationMs: 30000, xpMultiplier: 5.0, coinMultiplier: 1.0, color: '#FFAB00', dangerLevel: 1,
  },
  {
    id: 'smoke_outbreak', name: 'Smoke Outbreak', description: 'Dense smoke fills the chambers, spawning smoke phantoms everywhere',
    lore: 'Smoke outbreaks blur the line between the living and the spectral, as phantoms pour through from the beyond.', emoji: '🌫️', durationMs: 50000, xpMultiplier: 1.8, coinMultiplier: 1.3, color: '#9E9E9E', dangerLevel: 7,
  },
  {
    id: 'ember_rain', name: 'Ember Rain', description: 'A shower of glowing embers falls from above, boosting forge productivity',
    lore: 'Ember rain is considered a blessing from the flame gods, each ember carrying a spark of divine fire.', emoji: '🌧️', durationMs: 55000, xpMultiplier: 1.4, coinMultiplier: 1.6, color: '#FF8C00', dangerLevel: 3,
  },
  {
    id: 'forge_awakening', name: 'Forge Awakening', description: 'The ancient forges activate on their own, crafting items at incredible speed',
    lore: 'Forge Awakenings are rare events where the spirits of ancient smiths return to operate the forges.', emoji: '⚒️', durationMs: 40000, xpMultiplier: 2.0, coinMultiplier: 2.5, color: '#DC143C', dangerLevel: 3,
  },
];

// =============================================================================
// SECTION 14: INITIAL STATE FACTORIES
// =============================================================================

function pyCreateDailyState(): PyDailyState {
  return {
    date: pyGenerateDayKey(Date.now()),
    creaturesCaptured: 0,
    materialsGathered: 0,
    itemsForged: 0,
    sacrificesMade: 0,
    chambersVisited: 0,
  };
}

function pyCreateDefaultAchievements(): PyAchievementState[] {
  return PY_ACHIEVEMENTS.map((a) => ({
    id: a.id, name: a.name, description: a.description, lore: a.lore, emoji: a.emoji,
    conditionKey: a.conditionKey, targetValue: a.targetValue, rewardXp: a.rewardXp,
    rewardCoins: a.rewardCoins, rewardTitle: a.rewardTitle,
    unlocked: false, unlockedAt: null, progress: 0,
  }));
}

function pyCreateDefaultCreatures(): PyCreatureState[] {
  return PY_CREATURES.map((c) => ({
    ...c, discovered: false, captured: false, encounterCount: 0,
    captureCount: 0, lastSeen: null, level: 1, xp: 0,
  }));
}

function pyCreateDefaultChambers(): PyChamberState[] {
  return PY_CHAMBERS.map((ch) => ({
    ...ch, unlocked: ch.unlockLevel === 1, explored: false,
    visitsCount: 0, firstVisitedAt: null,
  }));
}

function pyCreateDefaultAbilities(): PyAbilityState[] {
  return PY_ABILITIES.map((ab) => ({
    ...ab, unlocked: ab.unlockLevel <= 1, lastUsed: 0, totalUses: 0,
  }));
}

function pyCreateDefaultStructures(): PyStructureState[] {
  return PY_STRUCTURES.map((s) => ({
    ...s, built: false, level: 0, active: false, totalUpgrades: 0, builtAt: null,
  }));
}

function pyCreateDefaultArtifacts(): PyArtifactState[] {
  return PY_ARTIFACTS.map((ar) => ({
    ...ar, discovered: false, equipped: false, discoveredAt: null,
  }));
}

function pyCreateDefaultEvents(): PyEventState[] {
  return PY_EVENTS.map((ev) => ({
    ...ev, active: false, timeRemaining: 0, startedAt: null, timesTriggered: 0,
  }));
}

// =============================================================================
// SECTION 15: MAIN HOOK — usePyreYard
// =============================================================================

export default function usePyreYard() {
  // ---------------------------------------------------------------------------
  // PY_ Constants (returned on API object)
  // ---------------------------------------------------------------------------
  const PY_MAX_LEVEL = 50;
  const PY_MAX_COINS = 999_999_999;
  const PY_BASE_XP_PER_LEVEL = 100;
  const PY_XP_SCALING_FACTOR = 1.12;
  const PY_DAILY_RESET_MS = 86_400_000;
  const PY_MAX_CAPTURED_CREATURES = 35;
  const PY_SAVE_KEY = 'pyre-yard-save';

  // ---------------------------------------------------------------------------
  // Core State (prefixed with py)
  // ---------------------------------------------------------------------------
  const [pyLevel, setPyLevel] = useState<number>(1);
  const [pyXp, setPyXp] = useState<number>(0);
  const [pyTotalXp, setPyTotalXp] = useState<number>(0);
  const [pyCoins, setPyCoins] = useState<number>(0);
  const [pyTotalCoinsEarned, setPyTotalCoinsEarned] = useState<number>(0);
  const [pyTotalCoinsSpent, setPyTotalCoinsSpent] = useState<number>(0);
  const [pyPower, setPyPower] = useState<number>(10);

  // ---------------------------------------------------------------------------
  // Creatures State
  // ---------------------------------------------------------------------------
  const [pyCreatures, setPyCreatures] = useState<PyCreatureState[]>(pyCreateDefaultCreatures);
  const [pyCapturedCount, setPyCapturedCount] = useState<number>(0);
  const [pyTotalCaptures, setPyTotalCaptures] = useState<number>(0);
  const [pyTotalEncounters, setPyTotalEncounters] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Chambers State
  // ---------------------------------------------------------------------------
  const [pyChambers, setPyChambers] = useState<PyChamberState[]>(pyCreateDefaultChambers);
  const [pyCurrentChamberId, setPyCurrentChamberId] = useState<PyChamberId>('ember_hearth');
  const [pyChambersVisited, setPyChambersVisited] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Materials State
  // ---------------------------------------------------------------------------
  const [pyInventory, setPyInventory] = useState<Record<string, number>>({});
  const [pyTotalGathered, setPyTotalGathered] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Structures State
  // ---------------------------------------------------------------------------
  const [pyStructures, setPyStructures] = useState<PyStructureState[]>(pyCreateDefaultStructures);
  const [pyTotalBuilt, setPyTotalBuilt] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Abilities State
  // ---------------------------------------------------------------------------
  const [pyAbilities, setPyAbilities] = useState<PyAbilityState[]>(pyCreateDefaultAbilities);

  // ---------------------------------------------------------------------------
  // Achievements State
  // ---------------------------------------------------------------------------
  const [pyAchievements, setPyAchievements] = useState<PyAchievementState[]>(pyCreateDefaultAchievements);

  // ---------------------------------------------------------------------------
  // Artifacts State
  // ---------------------------------------------------------------------------
  const [pyArtifacts, setPyArtifacts] = useState<PyArtifactState[]>(pyCreateDefaultArtifacts);

  // ---------------------------------------------------------------------------
  // Events State
  // ---------------------------------------------------------------------------
  const [pyEvents, setPyEvents] = useState<PyEventState[]>(pyCreateDefaultEvents);
  const [pyActiveEventId, setPyActiveEventId] = useState<PyEventId | null>(null);

  // ---------------------------------------------------------------------------
  // Session State
  // ---------------------------------------------------------------------------
  const [pySessionLog, setPySessionLog] = useState<PySessionLog[]>([]);
  const [pyDailyState, setPyDailyState] = useState<PyDailyState>(pyCreateDailyState);
  const [pyStreak, setPyStreak] = useState<number>(0);
  const [pyBestStreak, setPyBestStreak] = useState<number>(0);
  const [pyLastPlayDate, setPyLastPlayDate] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Stats
  // ---------------------------------------------------------------------------
  const [pyTotalIgnites, setPyTotalIgnites] = useState<number>(0);
  const [pyTotalForges, setPyTotalForges] = useState<number>(0);
  const [pyTotalSmelts, setPyTotalSmelts] = useState<number>(0);
  const [pyTotalSummons, setPyTotalSummons] = useState<number>(0);
  const [pyTotalSacrifices, setPyTotalSacrifices] = useState<number>(0);
  const [pyTotalTempers, setPyTotalTempers] = useState<number>(0);
  const [pyTotalEruptions, setPyTotalEruptions] = useState<number>(0);
  const [pyDragonDefeats, setPyDragonDefeats] = useState<number>(0);

  // ---------------------------------------------------------------------------
  // Refs
  // ---------------------------------------------------------------------------
  const stateRef = useRef({
    pyLevel, pyXp, pyTotalXp, pyCoins, pyTotalCoinsEarned, pyTotalCoinsSpent, pyPower,
    pyCapturedCount, pyTotalCaptures, pyTotalEncounters, pyChambersVisited,
    pyTotalGathered, pyTotalBuilt, pyTotalIgnites, pyTotalForges, pyTotalSmelts,
    pyTotalSummons, pyTotalSacrifices, pyTotalTempers, pyTotalEruptions, pyDragonDefeats,
  });

  const eventTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync refs to state in useEffect (NEVER during render)
  useEffect(() => {
    stateRef.current = {
      pyLevel, pyXp, pyTotalXp, pyCoins, pyTotalCoinsEarned, pyTotalCoinsSpent, pyPower,
      pyCapturedCount, pyTotalCaptures, pyTotalEncounters, pyChambersVisited,
      pyTotalGathered, pyTotalBuilt, pyTotalIgnites, pyTotalForges, pyTotalSmelts,
      pyTotalSummons, pyTotalSacrifices, pyTotalTempers, pyTotalEruptions, pyDragonDefeats,
    };
  }, [pyLevel, pyXp, pyTotalXp, pyCoins, pyTotalCoinsEarned, pyTotalCoinsSpent, pyPower,
    pyCapturedCount, pyTotalCaptures, pyTotalEncounters, pyChambersVisited,
    pyTotalGathered, pyTotalBuilt, pyTotalIgnites, pyTotalForges, pyTotalSmelts,
    pyTotalSummons, pyTotalSacrifices, pyTotalTempers, pyTotalEruptions, pyDragonDefeats]);

  // ---------------------------------------------------------------------------
  // Persistence
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      const saved = localStorage.getItem(PY_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.pyLevel) setPyLevel(data.pyLevel);
        if (data.pyXp) setPyXp(data.pyXp);
        if (data.pyTotalXp) setPyTotalXp(data.pyTotalXp);
        if (data.pyCoins) setPyCoins(data.pyCoins);
        if (data.pyTotalCoinsEarned) setPyTotalCoinsEarned(data.pyTotalCoinsEarned);
        if (data.pyTotalCoinsSpent) setPyTotalCoinsSpent(data.pyTotalCoinsSpent);
        if (data.pyPower) setPyPower(data.pyPower);
        if (data.pyCreatures) setPyCreatures(data.pyCreatures);
        if (data.pyChambers) setPyChambers(data.pyChambers);
        if (data.pyInventory) setPyInventory(data.pyInventory);
        if (data.pyStructures) setPyStructures(data.pyStructures);
        if (data.pyAbilities) setPyAbilities(data.pyAbilities);
        if (data.pyAchievements) setPyAchievements(data.pyAchievements);
        if (data.pyArtifacts) setPyArtifacts(data.pyArtifacts);
        if (data.pyEvents) setPyEvents(data.pyEvents);
        if (data.pyStreak) setPyStreak(data.pyStreak);
        if (data.pyBestStreak) setPyBestStreak(data.pyBestStreak);
        if (data.pyLastPlayDate) setPyLastPlayDate(data.pyLastPlayDate);
        if (data.pyDailyState) setPyDailyState(data.pyDailyState);
        if (data.pyCapturedCount) setPyCapturedCount(data.pyCapturedCount);
        if (data.pyTotalCaptures) setPyTotalCaptures(data.pyTotalCaptures);
        if (data.pyTotalEncounters) setPyTotalEncounters(data.pyTotalEncounters);
        if (data.pyChambersVisited) setPyChambersVisited(data.pyChambersVisited);
        if (data.pyTotalGathered) setPyTotalGathered(data.pyTotalGathered);
        if (data.pyTotalBuilt) setPyTotalBuilt(data.pyTotalBuilt);
        if (data.pyTotalIgnites) setPyTotalIgnites(data.pyTotalIgnites);
        if (data.pyTotalForges) setPyTotalForges(data.pyTotalForges);
        if (data.pyTotalSmelts) setPyTotalSmelts(data.pyTotalSmelts);
        if (data.pyTotalSummons) setPyTotalSummons(data.pyTotalSummons);
        if (data.pyTotalSacrifices) setPyTotalSacrifices(data.pyTotalSacrifices);
        if (data.pyTotalTempers) setPyTotalTempers(data.pyTotalTempers);
        if (data.pyTotalEruptions) setPyTotalEruptions(data.pyTotalEruptions);
        if (data.pyDragonDefeats) setPyDragonDefeats(data.pyDragonDefeats);
      }
    } catch { /* ignore parse errors */ }
  }, []);

  useEffect(() => {
    try {
      const data = {
        pyLevel, pyXp, pyTotalXp, pyCoins, pyTotalCoinsEarned, pyTotalCoinsSpent, pyPower,
        pyCreatures, pyChambers, pyInventory, pyStructures, pyAbilities, pyAchievements,
        pyArtifacts, pyEvents, pyStreak, pyBestStreak, pyLastPlayDate, pyDailyState,
        pyCapturedCount, pyTotalCaptures, pyTotalEncounters, pyChambersVisited,
        pyTotalGathered, pyTotalBuilt, pyTotalIgnites, pyTotalForges, pyTotalSmelts,
        pyTotalSummons, pyTotalSacrifices, pyTotalTempers, pyTotalEruptions, pyDragonDefeats,
      };
      localStorage.setItem(PY_SAVE_KEY, JSON.stringify(data));
    } catch { /* ignore storage errors */ }
  }, [pyLevel, pyXp, pyTotalXp, pyCoins, pyTotalCoinsEarned, pyTotalCoinsSpent, pyPower,
    pyCreatures, pyChambers, pyInventory, pyStructures, pyAbilities, pyAchievements,
    pyArtifacts, pyEvents, pyStreak, pyBestStreak, pyLastPlayDate, pyDailyState,
    pyCapturedCount, pyTotalCaptures, pyTotalEncounters, pyChambersVisited,
    pyTotalGathered, pyTotalBuilt, pyTotalIgnites, pyTotalForges, pyTotalSmelts,
    pyTotalSummons, pyTotalSacrifices, pyTotalTempers, pyTotalEruptions, pyDragonDefeats]);

  // ---------------------------------------------------------------------------
  // Daily Reset
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const todayKey = pyGenerateDayKey(Date.now());
    if (pyDailyState.date !== todayKey) {
      const yesterdayKey = pyGenerateDayKey(Date.now() - PY_DAILY_RESET_MS);
      if (pyLastPlayDate === yesterdayKey) {
        setPyStreak((s) => {
          const newStreak = s + 1;
          setPyBestStreak((b) => Math.max(b, newStreak));
          return newStreak;
        });
      } else if (pyLastPlayDate !== null && pyLastPlayDate !== todayKey) {
        setPyStreak(0);
      }
      setPyLastPlayDate(todayKey);
      setPyDailyState(pyCreateDailyState());
    }
  }, [pyDailyState.date, pyLastPlayDate]);

  // ---------------------------------------------------------------------------
  // Event Timer
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (pyActiveEventId) {
      if (eventTimerRef.current) clearInterval(eventTimerRef.current);
      eventTimerRef.current = setInterval(() => {
        setPyEvents((prev) => {
          const updated = prev.map((ev) => {
            if (ev.id !== pyActiveEventId || !ev.active) return ev;
            const newRemaining = ev.timeRemaining - 1000;
            if (newRemaining <= 0) {
              setPyActiveEventId(null);
              return { ...ev, active: false, timeRemaining: 0, startedAt: null, timesTriggered: ev.timesTriggered + 1 };
            }
            return { ...ev, timeRemaining: newRemaining };
          });
          return updated;
        });
      }, 1000);
    } else {
      if (eventTimerRef.current) {
        clearInterval(eventTimerRef.current);
        eventTimerRef.current = null;
      }
    }
    return () => {
      if (eventTimerRef.current) {
        clearInterval(eventTimerRef.current);
        eventTimerRef.current = null;
      }
    };
  }, [pyActiveEventId]);

  // ---------------------------------------------------------------------------
  // XP Table
  // ---------------------------------------------------------------------------
  const pyXpTable = useMemo(() => {
    const table: number[] = [];
    for (let i = 0; i <= PY_MAX_LEVEL; i++) {
      table.push(pyXpRequiredForLevel(i));
    }
    return table;
  }, [PY_MAX_LEVEL]);

  // =========================================================================
  // COMPUTED VALUES
  // =========================================================================

  const pyCurrentTitle = useMemo((): PyTitleDef => {
    let title = PY_TITLES[0];
    for (const t of PY_TITLES) {
      if (pyLevel >= t.levelRequired) title = t;
    }
    return title;
  }, [pyLevel]);

  const pyXpProgress = useMemo(() => {
    const needed = pyXpTable[pyLevel] ?? Infinity;
    return {
      current: pyXp,
      needed,
      percentage: needed === Infinity ? 100 : Math.min(100, (pyXp / needed) * 100),
    };
  }, [pyLevel, pyXp, pyXpTable]);

  const pyAvailableChambers = useMemo(() => {
    return pyChambers.filter((ch) => ch.unlocked);
  }, [pyChambers]);

  const pyCurrentChamber = useMemo((): PyChamberState => {
    return pyChambers.find((ch) => ch.id === pyCurrentChamberId) ?? pyChambers[0];
  }, [pyChambers, pyCurrentChamberId]);

  const pyCreaturesInChamber = useMemo(() => {
    const chamber = pyCurrentChamber;
    const resourceMap: Record<string, PySpecies[]> = {
      coal: ['ember_sprite', 'ash_golem'], ash_powder: ['ember_sprite', 'ash_golem'],
      ember_coal: ['ember_sprite'], fire_crystals: ['flame_dancer', 'magma_scorpion'],
      obsidian_shards: ['ash_golem', 'magma_scorpion'], molten_iron: ['ash_golem', 'magma_scorpion'],
      flame_runes: ['flame_dancer', 'inferno_dragon'], lava_essence: ['magma_scorpion', 'inferno_dragon', 'phoenix_chick'],
      infernal_clay: ['ash_golem', 'smoke_phantom'], smoke_quartz: ['smoke_phantom', 'flame_dancer'],
      brimstone_dust: ['inferno_dragon', 'smoke_phantom'], phoenix_feathers: ['phoenix_chick', 'flame_dancer'],
    };
    const speciesInChamber = new Set<string>();
    for (const res of chamber.resources) {
      const species = resourceMap[res] ?? [];
      species.forEach((s) => speciesInChamber.add(s));
    }
    return pyCreatures.filter((c) => speciesInChamber.has(c.species));
  }, [pyCreatures, pyCurrentChamber]);

  const pyUnlockedAbilities = useMemo(() => {
    return pyAbilities.filter((ab) => ab.unlocked);
  }, [pyAbilities]);

  const pyActiveEvent = useMemo((): PyEventState | null => {
    if (!pyActiveEventId) return null;
    return pyEvents.find((ev) => ev.id === pyActiveEventId && ev.active) ?? null;
  }, [pyEvents, pyActiveEventId]);

  const pyActiveMultiplier = useMemo(() => {
    if (!pyActiveEvent) return { xp: 1, coins: 1 };
    return { xp: pyActiveEvent.xpMultiplier, coins: pyActiveEvent.coinMultiplier };
  }, [pyActiveEvent]);

  const pyDiscoveredArtifacts = useMemo(() => {
    return pyArtifacts.filter((ar) => ar.discovered);
  }, [pyArtifacts]);

  const pyUnlockedAchievements = useMemo(() => {
    return pyAchievements.filter((a) => a.unlocked);
  }, [pyAchievements]);

  const pyEquippedArtifacts = useMemo(() => {
    return pyArtifacts.filter((ar) => ar.equipped);
  }, [pyArtifacts]);

  const pyTotalStructureBonus = useMemo(() => {
    let bonus = 0;
    for (const s of pyStructures) {
      if (s.built) bonus += s.effectPerLevel * s.level;
    }
    return bonus;
  }, [pyStructures]);

  const pyRarityCounts = useMemo(() => {
    const counts = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const c of pyCreatures) {
      if (c.discovered) counts[c.rarity]++;
    }
    return counts;
  }, [pyCreatures]);

  const pySpeciesCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sp of PY_SPECIES) {
      counts[sp.key] = pyCreatures.filter((c) => c.species === sp.key && c.discovered).length;
    }
    return counts;
  }, [pyCreatures]);

  // =========================================================================
  // ACTIONS
  // =========================================================================

  const pyAddXp = useCallback((amount: number) => {
    const multiplied = Math.floor(amount * pyActiveMultiplier.xp);
    setPyXp((prev) => prev + multiplied);
    setPyTotalXp((prev) => prev + multiplied);
  }, [pyActiveMultiplier]);

  const pyProcessLevelUp = useCallback(() => {
    setPyXp((prevXp) => {
      setPyLevel((prevLevel) => {
        let currentLevel = prevLevel;
        let currentXp = prevXp;
        while (currentLevel < PY_MAX_LEVEL) {
          const needed = pyXpRequiredForLevel(currentLevel);
          if (currentXp >= needed) {
            currentXp -= needed;
            currentLevel++;
          } else {
            break;
          }
        }
        // Unlock chambers based on new level
        if (currentLevel > prevLevel) {
          setPyChambers((prev) =>
            prev.map((ch) => (ch.unlockLevel <= currentLevel && !ch.unlocked ? { ...ch, unlocked: true } : ch))
          );
          // Unlock abilities
          setPyAbilities((prev) =>
            prev.map((ab) => (ab.unlockLevel <= currentLevel && !ab.unlocked ? { ...ab, unlocked: true } : ab))
          );
        }
        return currentLevel;
      });
      return prevXp; // XP is consumed inside setPyLevel
    });
  }, [PY_MAX_LEVEL]);

  const pyAddCoins = useCallback((amount: number) => {
    const multiplied = Math.floor(amount * pyActiveMultiplier.coins);
    setPyCoins((prev) => Math.min(PY_MAX_COINS, prev + multiplied));
    setPyTotalCoinsEarned((prev) => prev + multiplied);
  }, [pyActiveMultiplier]);

  const pySpendCoins = useCallback((amount: number): boolean => {
    if (pyCoins < amount) return false;
    setPyCoins((prev) => prev - amount);
    setPyTotalCoinsSpent((prev) => prev + amount);
    return true;
  }, [pyCoins]);

  const pyLogSession = useCallback((action: PyAction, chamberId: PyChamberId | null, creatureId: string | null, result: 'success' | 'failure' | 'partial', xpGained: number, coinsGained: number, materialsGained: string[] = []) => {
    const logEntry: PySessionLog = {
      id: pyGenerateId(), timestamp: Date.now(), action, chamberId, creatureId,
      result, xpGained, coinsGained, materialsGained,
    };
    setPySessionLog((prev) => [logEntry, ...prev].slice(0, 100));
  }, []);

  // --- Chamber Actions ---
  const pyEnterChamber = useCallback((chamberId: PyChamberId): boolean => {
    const chamber = pyChambers.find((ch) => ch.id === chamberId);
    if (!chamber || !chamber.unlocked) return false;
    setPyCurrentChamberId(chamberId);
    setPyChambers((prev) => prev.map((ch) =>
      ch.id === chamberId ? { ...ch, explored: true, visitsCount: ch.visitsCount + 1, firstVisitedAt: ch.firstVisitedAt ?? Date.now() } : ch
    ));
    setPyChambersVisited((prev) => prev + 1);
    setPyDailyState((prev) => ({ ...prev, chambersVisited: prev.chambersVisited + 1 }));
    pyAddXp(chamber.level * 5);
    return true;
  }, [pyChambers, pyAddXp]);

  // --- Creature Actions ---
  const pyEncounterCreature = useCallback((creatureId: string): PyCreatureState | null => {
    const creature = pyCreatures.find((c) => c.id === creatureId);
    if (!creature) return null;
    setPyCreatures((prev) => prev.map((c) =>
      c.id === creatureId ? { ...c, discovered: true, encounterCount: c.encounterCount + 1, lastSeen: Date.now() } : c
    ));
    setPyTotalEncounters((prev) => prev + 1);
    return creature;
  }, [pyCreatures]);

  const pyCaptureCreature = useCallback((creatureId: string): boolean => {
    const creature = pyCreatures.find((c) => c.id === creatureId);
    if (!creature || creature.captured) return false;
    const rarityMult = pyRarityXpMultiplier(creature.rarity);
    setPyCreatures((prev) => prev.map((c) =>
      c.id === creatureId ? { ...c, captured: true, captureCount: c.captureCount + 1 } : c
    ));
    setPyCapturedCount((prev) => prev + 1);
    setPyTotalCaptures((prev) => prev + 1);
    setPyDailyState((prev) => ({ ...prev, creaturesCaptured: prev.creaturesCaptured + 1 }));
    pyAddXp(Math.floor(creature.xpReward * rarityMult));
    pyAddCoins(Math.floor(creature.cost * rarityMult * 0.5));
    pyLogSession('summon', pyCurrentChamberId, creatureId, 'success', creature.xpReward, creature.cost);
    return true;
  }, [pyCreatures, pyAddXp, pyAddCoins, pyLogSession, pyCurrentChamberId]);

  // --- Material Actions ---
  const pyGatherMaterial = useCallback((materialId: string, amount: number = 1): boolean => {
    const material = PY_MATERIALS.find((m) => m.id === materialId);
    if (!material) return false;
    setPyInventory((prev) => ({ ...prev, [materialId]: (prev[materialId] ?? 0) + amount }));
    setPyTotalGathered((prev) => prev + amount);
    setPyDailyState((prev) => ({ ...prev, materialsGathered: prev.materialsGathered + amount }));
    pyAddXp(Math.floor(material.value * amount * 0.1));
    return true;
  }, [pyAddXp]);

  const pyHasMaterial = useCallback((materialId: string, amount: number): boolean => {
    return (pyInventory[materialId] ?? 0) >= amount;
  }, [pyInventory]);

  const pySpendMaterial = useCallback((materialId: string, amount: number): boolean => {
    if (!pyHasMaterial(materialId, amount)) return false;
    setPyInventory((prev) => ({ ...prev, [materialId]: (prev[materialId] ?? 0) - amount }));
    return true;
  }, [pyHasMaterial]);

  // --- Structure Actions ---
  const pyBuildStructure = useCallback((structureId: string): boolean => {
    const structure = pyStructures.find((s) => s.id === structureId);
    if (!structure || structure.built || structure.unlockLevel > pyLevel) return false;
    if (!pySpendCoins(structure.buildCost)) return false;
    setPyStructures((prev) => prev.map((s) =>
      s.id === structureId ? { ...s, built: true, level: 1, active: true, totalUpgrades: 0, builtAt: Date.now() } : s
    ));
    setPyTotalBuilt((prev) => prev + 1);
    return true;
  }, [pyStructures, pyLevel, pySpendCoins]);

  const pyUpgradeStructure = useCallback((structureId: string): boolean => {
    const structure = pyStructures.find((s) => s.id === structureId);
    if (!structure || !structure.built || structure.level >= structure.maxLevel) return false;
    const cost = Math.floor(structure.upgradeCost * Math.pow(1.5, structure.level));
    if (!pySpendCoins(cost)) return false;
    setPyStructures((prev) => prev.map((s) =>
      s.id === structureId ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 } : s
    ));
    pyAddXp(structure.level * 10);
    return true;
  }, [pyStructures, pySpendCoins, pyAddXp]);

  // --- Action: Ignite ---
  const pyIgnite = useCallback((): { success: boolean; xpGained: number; coinsGained: number } => {
    setPyTotalIgnites((prev) => prev + 1);
    const xpGained = Math.floor(15 + pyLevel * 2);
    const coinsGained = Math.floor(5 + pyLevel);
    pyAddXp(xpGained);
    pyAddCoins(coinsGained);
    pyLogSession('ignite', pyCurrentChamberId, null, 'success', xpGained, coinsGained);
    return { success: true, xpGained, coinsGained };
  }, [pyLevel, pyAddXp, pyAddCoins, pyLogSession, pyCurrentChamberId]);

  // --- Action: Forge ---
  const pyForge = useCallback((): { success: boolean; xpGained: number; coinsGained: number; material?: string } => {
    setPyTotalForges((prev) => prev + 1);
    const xpGained = Math.floor(20 + pyLevel * 3);
    const coinsGained = Math.floor(8 + pyLevel * 2);
    pyAddXp(xpGained);
    pyAddCoins(coinsGained);
    setPyDailyState((prev) => ({ ...prev, itemsForged: prev.itemsForged + 1 }));
    // Random material chance
    const material = pyRandomChoice(PY_MATERIALS.filter((m) => pyRarityXpMultiplier(m.rarity) <= 2.5));
    if (material && Math.random() < 0.3) {
      pyGatherMaterial(material.id);
      pyLogSession('forge', pyCurrentChamberId, null, 'success', xpGained, coinsGained, [material.id]);
      return { success: true, xpGained, coinsGained, material: material.id };
    }
    pyLogSession('forge', pyCurrentChamberId, null, 'success', xpGained, coinsGained);
    return { success: true, xpGained, coinsGained };
  }, [pyLevel, pyAddXp, pyAddCoins, pyGatherMaterial, pyLogSession, pyCurrentChamberId]);

  // --- Action: Smelt ---
  const pySmelt = useCallback((): { success: boolean; xpGained: number; material?: string } => {
    setPyTotalSmelts((prev) => prev + 1);
    const xpGained = Math.floor(18 + pyLevel * 2 + pyTotalStructureBonus * 0.5);
    pyAddXp(xpGained);
    const material = pyRandomChoice(PY_MATERIALS.filter((m) => m.rarity === 'common' || m.rarity === 'uncommon'));
    if (material) {
      pyGatherMaterial(material.id, 2);
      pyLogSession('smelt', pyCurrentChamberId, null, 'success', xpGained, 0, [material.id]);
      return { success: true, xpGained, material: material.id };
    }
    pyLogSession('smelt', pyCurrentChamberId, null, 'success', xpGained, 0);
    return { success: true, xpGained };
  }, [pyLevel, pyTotalStructureBonus, pyAddXp, pyGatherMaterial, pyLogSession, pyCurrentChamberId]);

  // --- Action: Summon ---
  const pySummon = useCallback((): { creature?: PyCreatureState; xpGained: number } => {
    setPyTotalSummons((prev) => prev + 1);
    const available = pyCreaturesInChamber.filter((c) => !c.captured);
    if (available.length === 0) {
      return { xpGained: 0 };
    }
    // Weighted random by species encounter weight
    const totalWeight = available.reduce((sum, c) => {
      const species = PY_SPECIES.find((sp) => sp.key === c.species);
      return sum + (species?.encounterWeight ?? 10);
    }, 0);
    let roll = Math.random() * totalWeight;
    let selected = available[0];
    for (const c of available) {
      const species = PY_SPECIES.find((sp) => sp.key === c.species);
      roll -= species?.encounterWeight ?? 10;
      if (roll <= 0) { selected = c; break; }
    }
    pyEncounterCreature(selected.id);
    const xpGained = Math.floor(selected.xpReward * pyRarityXpMultiplier(selected.rarity) * 0.5);
    pyAddXp(xpGained);
    pyLogSession('summon', pyCurrentChamberId, selected.id, 'partial', xpGained, 0);
    return { creature: selected, xpGained };
  }, [pyCreaturesInChamber, pyEncounterCreature, pyAddXp, pyLogSession, pyCurrentChamberId]);

  // --- Action: Sacrifice ---
  const pySacrifice = useCallback((creatureId: string): { success: boolean; xpGained: number; coinsGained: number } => {
    const creature = pyCreatures.find((c) => c.id === creatureId);
    if (!creature || !creature.captured) return { success: false, xpGained: 0, coinsGained: 0 };
    setPyTotalSacrifices((prev) => prev + 1);
    setPyDailyState((prev) => ({ ...prev, sacrificesMade: prev.sacrificesMade + 1 }));
    const rarityMult = pyRarityXpMultiplier(creature.rarity);
    const xpGained = Math.floor(creature.xpReward * rarityMult * 2);
    const coinsGained = Math.floor(creature.cost * rarityMult);
    pyAddXp(xpGained);
    pyAddCoins(coinsGained);
    setPyCreatures((prev) => prev.map((c) =>
      c.id === creatureId ? { ...c, captured: false, captureCount: c.captureCount - 1 } : c
    ));
    setPyCapturedCount((prev) => prev - 1);
    // Random phoenix feather chance
    if (Math.random() < 0.05) {
      pyGatherMaterial('phoenix_feathers', 1);
    }
    pyLogSession('sacrifice', pyCurrentChamberId, creatureId, 'success', xpGained, coinsGained);
    return { success: true, xpGained, coinsGained };
  }, [pyCreatures, pyAddXp, pyAddCoins, pyGatherMaterial, pyLogSession, pyCurrentChamberId]);

  // --- Action: Temper ---
  const pyTemper = useCallback((): { success: boolean; xpGained: number; powerGained: number } => {
    setPyTotalTempers((prev) => prev + 1);
    const powerGained = Math.floor(1 + pyLevel * 0.2 + pyTotalStructureBonus * 0.05);
    const xpGained = Math.floor(25 + pyLevel * 3);
    pyAddXp(xpGained);
    setPyPower((prev) => prev + powerGained);
    pyLogSession('temper', pyCurrentChamberId, null, 'success', xpGained, 0);
    return { success: true, xpGained, powerGained };
  }, [pyLevel, pyTotalStructureBonus, pyAddXp, pyLogSession, pyCurrentChamberId]);

  // --- Action: Erupt ---
  const pyErupt = useCallback((): { success: boolean; xpGained: number; creaturesEncountered: number; materialsFound: number } => {
    setPyTotalEruptions((prev) => prev + 1);
    const xpGained = Math.floor(50 + pyLevel * 5 + pyPower * 0.5);
    pyAddXp(xpGained);
    pyAddCoins(Math.floor(xpGained * 0.5));
    // Encounter random creatures
    let creaturesEncountered = 0;
    const encounterCount = Math.floor(2 + Math.random() * 4);
    for (let i = 0; i < encounterCount; i++) {
      const allUndiscovered = pyCreatures.filter((c) => !c.discovered);
      if (allUndiscovered.length > 0) {
        const target = pyRandomChoice(allUndiscovered);
        pyEncounterCreature(target.id);
        creaturesEncountered++;
      }
    }
    // Find materials
    const materialsFound = Math.floor(1 + Math.random() * 3);
    for (let i = 0; i < materialsFound; i++) {
      const mat = pyRandomChoice(PY_MATERIALS.filter((m) => pyRarityXpMultiplier(m.rarity) <= 2.5));
      if (mat) pyGatherMaterial(mat.id);
    }
    pyLogSession('erupt', pyCurrentChamberId, null, 'success', xpGained, Math.floor(xpGained * 0.5));
    return { success: true, xpGained, creaturesEncountered, materialsFound };
  }, [pyLevel, pyPower, pyCreatures, pyAddXp, pyAddCoins, pyEncounterCreature, pyGatherMaterial, pyLogSession, pyCurrentChamberId]);

  // --- Ability Actions ---
  const pyUseAbility = useCallback((abilityId: string): boolean => {
    const ability = pyAbilities.find((ab) => ab.id === abilityId);
    if (!ability || !ability.unlocked) return false;
    const now = Date.now();
    if (now - ability.lastUsed < ability.cooldownMs) return false;
    if (pyPower < ability.powerCost) return false;
    setPyPower((prev) => prev - ability.powerCost);
    setPyAbilities((prev) => prev.map((ab) =>
      ab.id === abilityId ? { ...ab, lastUsed: now, totalUses: ab.totalUses + 1 } : ab
    ));
    pyAddXp(Math.floor(ability.effectValue * 0.5));
    pyLogSession('ignite', pyCurrentChamberId, null, 'success', Math.floor(ability.effectValue * 0.5), 0);
    return true;
  }, [pyAbilities, pyPower, pyAddXp, pyLogSession, pyCurrentChamberId]);

  // --- Event Actions ---
  const pyTriggerEvent = useCallback((eventId: PyEventId): boolean => {
    const eventDef = PY_EVENTS.find((ev) => ev.id === eventId);
    if (!eventDef) return false;
    if (pyActiveEventId) return false;
    setPyEvents((prev) => prev.map((ev) =>
      ev.id === eventId ? { ...ev, active: true, timeRemaining: ev.durationMs, startedAt: Date.now() } : ev
    ));
    setPyActiveEventId(eventId);
    return true;
  }, [pyActiveEventId]);

  const pyEndEvent = useCallback(() => {
    if (!pyActiveEventId) return;
    setPyEvents((prev) => prev.map((ev) =>
      ev.id === pyActiveEventId ? { ...ev, active: false, timeRemaining: 0, startedAt: null, timesTriggered: ev.timesTriggered + 1 } : ev
    ));
    setPyActiveEventId(null);
  }, [pyActiveEventId]);

  const pyTriggerRandomEvent = useCallback((): PyEventDef | null => {
    if (pyActiveEventId) return null;
    const eligible = PY_EVENTS.filter((ev) => !pyEvents.find((pe) => pe.id === ev.id && pe.active));
    if (eligible.length === 0) return null;
    const event = pyRandomChoice(eligible);
    pyTriggerEvent(event.id);
    return event;
  }, [pyActiveEventId, pyEvents, pyTriggerEvent]);

  // --- Artifact Actions ---
  const pyDiscoverArtifact = useCallback((artifactId: string): boolean => {
    const artifact = pyArtifacts.find((ar) => ar.id === artifactId);
    if (!artifact || artifact.discovered) return false;
    setPyArtifacts((prev) => prev.map((ar) =>
      ar.id === artifactId ? { ...ar, discovered: true, discoveredAt: Date.now() } : ar
    ));
    pyAddXp(100);
    return true;
  }, [pyArtifacts, pyAddXp]);

  const pyEquipArtifact = useCallback((artifactId: string): boolean => {
    const artifact = pyArtifacts.find((ar) => ar.id === artifactId);
    if (!artifact || !artifact.discovered) return false;
    setPyArtifacts((prev) => prev.map((ar) =>
      ar.id === artifactId ? { ...ar, equipped: !ar.equipped } : ar
    ));
    return true;
  }, [pyArtifacts]);

  // --- Achievement Actions ---
  const pyCheckAchievements = useCallback((): PyAchievementState[] => {
    const tracker: Record<string, number> = {
      total_ignites: stateRef.current.pyTotalIgnites,
      total_forges: stateRef.current.pyTotalForges,
      chambers_visited: stateRef.current.pyChambersVisited,
      creatures_captured: stateRef.current.pyCapturedCount,
      total_smelts: stateRef.current.pyTotalSmelts,
      total_summons: stateRef.current.pyTotalSummons,
      dragon_defeats: stateRef.current.pyDragonDefeats,
      artifacts_found: pyArtifacts.filter((a) => a.discovered).length,
      phoenix_pyre_reached: pyChambers.find((ch) => ch.id === 'phoenix_pyre' && ch.explored) ? 1 : 0,
      yard_level: stateRef.current.pyLevel,
    };
    const newlyUnlocked: PyAchievementState[] = [];
    setPyAchievements((prev) => prev.map((a) => {
      if (a.unlocked) return a;
      const current = tracker[a.conditionKey] ?? 0;
      const progress = Math.min(current, a.targetValue);
      if (current >= a.targetValue) {
        const unlocked: PyAchievementState = { ...a, unlocked: true, unlockedAt: Date.now(), progress };
        newlyUnlocked.push(unlocked);
        pyAddXp(a.rewardXp);
        pyAddCoins(a.rewardCoins);
        return unlocked;
      }
      return { ...a, progress };
    }));
    return newlyUnlocked;
  }, [pyArtifacts, pyChambers, pyAddXp, pyAddCoins]);

  // =========================================================================
  // HELPERS
  // =========================================================================

  const pyGetCreatureById = useCallback((id: string): PyCreatureState | undefined => {
    return pyCreatures.find((c) => c.id === id);
  }, [pyCreatures]);

  const pyGetChamberById = useCallback((id: string): PyChamberState | undefined => {
    return pyChambers.find((ch) => ch.id === id);
  }, [pyChambers]);

  const pyGetMaterialById = useCallback((id: string): PyMaterialDef | undefined => {
    return PY_MATERIALS.find((m) => m.id === id);
  }, []);

  const pyGetSpeciesDef = useCallback((key: PySpecies): PySpeciesDef | undefined => {
    return PY_SPECIES.find((sp) => sp.key === key);
  }, []);

  const pyGetAbilityById = useCallback((id: string): PyAbilityState | undefined => {
    return pyAbilities.find((ab) => ab.id === id);
  }, [pyAbilities]);

  const pyGetStructureById = useCallback((id: string): PyStructureState | undefined => {
    return pyStructures.find((s) => s.id === id);
  }, [pyStructures]);

  const pyGetArtifactById = useCallback((id: string): PyArtifactState | undefined => {
    return pyArtifacts.find((ar) => ar.id === id);
  }, [pyArtifacts]);

  const pyCanBuildStructure = useCallback((structureId: string): boolean => {
    const structure = pyStructures.find((s) => s.id === structureId);
    if (!structure || structure.built || structure.unlockLevel > pyLevel) return false;
    return pyCoins >= structure.buildCost;
  }, [pyStructures, pyLevel, pyCoins]);

  const pyCanUpgradeStructure = useCallback((structureId: string): boolean => {
    const structure = pyStructures.find((s) => s.id === structureId);
    if (!structure || !structure.built || structure.level >= structure.maxLevel) return false;
    const cost = Math.floor(structure.upgradeCost * Math.pow(1.5, structure.level));
    return pyCoins >= cost;
  }, [pyStructures, pyCoins]);

  const pyCanUseAbility = useCallback((abilityId: string): boolean => {
    const ability = pyAbilities.find((ab) => ab.id === abilityId);
    if (!ability || !ability.unlocked) return false;
    const now = Date.now();
    if (now - ability.lastUsed < ability.cooldownMs) return false;
    return pyPower >= ability.powerCost;
  }, [pyAbilities, pyPower]);

  const pyResetSave = useCallback(() => {
    setPyLevel(1); setPyXp(0); setPyTotalXp(0); setPyCoins(0);
    setPyTotalCoinsEarned(0); setPyTotalCoinsSpent(0); setPyPower(10);
    setPyCreatures(pyCreateDefaultCreatures()); setPyCapturedCount(0);
    setPyTotalCaptures(0); setPyTotalEncounters(0);
    setPyChambers(pyCreateDefaultChambers()); setPyCurrentChamberId('ember_hearth');
    setPyChambersVisited(0); setPyInventory({}); setPyTotalGathered(0);
    setPyStructures(pyCreateDefaultStructures()); setPyTotalBuilt(0);
    setPyAbilities(pyCreateDefaultAbilities()); setPyAchievements(pyCreateDefaultAchievements());
    setPyArtifacts(pyCreateDefaultArtifacts()); setPyEvents(pyCreateDefaultEvents());
    setPyActiveEventId(null); setPySessionLog([]); setPyStreak(0);
    setPyBestStreak(0); setPyLastPlayDate(null);
    setPyTotalIgnites(0); setPyTotalForges(0); setPyTotalSmelts(0);
    setPyTotalSummons(0); setPyTotalSacrifices(0); setPyTotalTempers(0);
    setPyTotalEruptions(0); setPyDragonDefeats(0);
    localStorage.removeItem(PY_SAVE_KEY);
  }, []);

  const pyGetInventoryCount = useCallback((materialId: string): number => {
    return pyInventory[materialId] ?? 0;
  }, [pyInventory]);

  const pyGetTotalInventoryItems = useCallback((): number => {
    return Object.values(pyInventory).reduce((sum, count) => sum + count, 0);
  }, [pyInventory]);

  const pyIsAbilityOnCooldown = useCallback((abilityId: string): boolean => {
    const ability = pyAbilities.find((ab) => ab.id === abilityId);
    if (!ability) return false;
    return Date.now() - ability.lastUsed < ability.cooldownMs;
  }, [pyAbilities]);

  const pyGetAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const ability = pyAbilities.find((ab) => ab.id === abilityId);
    if (!ability) return 0;
    const remaining = ability.cooldownMs - (Date.now() - ability.lastUsed);
    return Math.max(0, remaining);
  }, [pyAbilities]);

  const pyGetCreaturesBySpecies = useCallback((species: PySpecies): PyCreatureState[] => {
    return pyCreatures.filter((c) => c.species === species);
  }, [pyCreatures]);

  const pyGetCreaturesByRarity = useCallback((rarity: PyRarity): PyCreatureState[] => {
    return pyCreatures.filter((c) => c.rarity === rarity);
  }, [pyCreatures]);

  const pyGetCapturedCreatures = useCallback((): PyCreatureState[] => {
    return pyCreatures.filter((c) => c.captured);
  }, [pyCreatures]);

  const pyGetDiscoveredCreatures = useCallback((): PyCreatureState[] => {
    return pyCreatures.filter((c) => c.discovered);
  }, [pyCreatures]);

  const pyGetDiscoveryProgress = useCallback((): { discovered: number; total: number; percentage: number } => {
    const discovered = pyCreatures.filter((c) => c.discovered).length;
    const total = pyCreatures.length;
    return { discovered, total, percentage: total > 0 ? (discovered / total) * 100 : 0 };
  }, [pyCreatures]);

  const pyGetCaptureProgress = useCallback((): { captured: number; total: number; percentage: number } => {
    const captured = pyCreatures.filter((c) => c.captured).length;
    const total = pyCreatures.length;
    return { captured, total, percentage: total > 0 ? (captured / total) * 100 : 0 };
  }, [pyCreatures]);

  // =========================================================================
  // COMBAT HELPERS
  // =========================================================================

  const pyCalculateBattleDamage = useCallback((attackerPower: number, defenderDefense: number): number => {
    const baseDamage = Math.max(1, attackerPower - defenderDefense * 0.5);
    const variance = 0.8 + Math.random() * 0.4; // 80% to 120%
    return Math.floor(baseDamage * variance);
  }, []);

  const pySimulateBattle = useCallback((attackerCreatureId: string, defenderCreatureId: string): { won: boolean; damageDealt: number; damageTaken: number; xpGained: number; coinsGained: number } => {
    const attacker = pyCreatures.find((c) => c.id === attackerCreatureId);
    const defender = pyCreatures.find((c) => c.id === defenderCreatureId);
    if (!attacker || !defender) {
      return { won: false, damageDealt: 0, damageTaken: 0, xpGained: 0, coinsGained: 0 };
    }
    const attackerPower = attacker.power + (attacker.level - 1) * 5;
    const defenderPower = defender.power + (defender.level - 1) * 5;
    const damageDealt = pyCalculateBattleDamage(attackerPower, defender.defense);
    const damageTaken = pyCalculateBattleDamage(defenderPower, attacker.defense);
    const won = attackerPower > defenderPower || (attackerPower === defenderPower && Math.random() > 0.5);
    const xpGained = won ? Math.floor(defender.xpReward * pyRarityXpMultiplier(defender.rarity)) : Math.floor(defender.xpReward * 0.2);
    const coinsGained = won ? Math.floor(defender.cost * pyRarityXpMultiplier(defender.rarity) * 0.3) : 0;
    if (won && defender.species === 'inferno_dragon') {
      setPyDragonDefeats((prev) => prev + 1);
    }
    pyAddXp(xpGained);
    pyAddCoins(coinsGained);
    pyLogSession('ignite', pyCurrentChamberId, defenderCreatureId, won ? 'success' : 'failure', xpGained, coinsGained);
    return { won, damageDealt, damageTaken, xpGained, coinsGained };
  }, [pyCreatures, pyCalculateBattleDamage, pyAddXp, pyAddCoins, pyLogSession, pyCurrentChamberId]);

  const pyGetBattleOdds = useCallback((attackerCreatureId: string, defenderCreatureId: string): { winChance: number; expectedDamage: number; expectedXp: number } => {
    const attacker = pyCreatures.find((c) => c.id === attackerCreatureId);
    const defender = pyCreatures.find((c) => c.id === defenderCreatureId);
    if (!attacker || !defender) return { winChance: 0, expectedDamage: 0, expectedXp: 0 };
    const attackerPower = attacker.power + (attacker.level - 1) * 5;
    const defenderPower = defender.power + (defender.level - 1) * 5;
    const winChance = Math.min(0.95, Math.max(0.05, attackerPower / (attackerPower + defenderPower)));
    const expectedDamage = Math.max(1, Math.floor(attackerPower - defender.defense * 0.4));
    const expectedXp = Math.floor(defender.xpReward * pyRarityXpMultiplier(defender.rarity) * winChance);
    return { winChance, expectedDamage, expectedXp };
  }, [pyCreatures]);

  const pyLevelUpCreature = useCallback((creatureId: string): boolean => {
    const creature = pyCreatures.find((c) => c.id === creatureId);
    if (!creature || !creature.captured) return false;
    const xpNeeded = Math.floor(50 * Math.pow(1.3, creature.level));
    if (creature.xp < xpNeeded) return false;
    setPyCreatures((prev) => prev.map((c) =>
      c.id === creatureId ? { ...c, level: c.level + 1, xp: c.xp - xpNeeded, power: c.power + 3, defense: c.defense + 2 } : c
    ));
    return true;
  }, [pyCreatures]);

  const pyAddCreatureXp = useCallback((creatureId: string, amount: number): void => {
    setPyCreatures((prev) => prev.map((c) =>
      c.id === creatureId ? { ...c, xp: c.xp + amount } : c
    ));
  }, []);

  // =========================================================================
  // RETURN: ALL constants + state + actions + computed values + helpers
  // =========================================================================
  return {
    // PY_ Constants
    PY_MAX_LEVEL,
    PY_MAX_COINS,
    PY_BASE_XP_PER_LEVEL,
    PY_XP_SCALING_FACTOR,
    PY_DAILY_RESET_MS,
    PY_MAX_CAPTURED_CREATURES,
    PY_SAVE_KEY,
    PY_COLORS,
    PY_SPECIES,
    PY_CREATURES,
    PY_CHAMBERS,
    PY_MATERIALS,
    PY_STRUCTURES,
    PY_ABILITIES,
    PY_ACHIEVEMENTS,
    PY_TITLES,
    PY_ARTIFACTS,
    PY_EVENTS,
    PY_XP_TABLE: pyXpTable,

    // State
    pyLevel,
    pyXp,
    pyTotalXp,
    pyCoins,
    pyTotalCoinsEarned,
    pyTotalCoinsSpent,
    pyPower,
    pyCreatures,
    pyCapturedCount,
    pyTotalCaptures,
    pyTotalEncounters,
    pyChambers,
    pyCurrentChamberId,
    pyChambersVisited,
    pyInventory,
    pyTotalGathered,
    pyStructures,
    pyTotalBuilt,
    pyAbilities,
    pyAchievements,
    pyArtifacts,
    pyEvents,
    pyActiveEventId,
    pySessionLog,
    pyDailyState,
    pyStreak,
    pyBestStreak,
    pyLastPlayDate,
    pyTotalIgnites,
    pyTotalForges,
    pyTotalSmelts,
    pyTotalSummons,
    pyTotalSacrifices,
    pyTotalTempers,
    pyTotalEruptions,
    pyDragonDefeats,

    // Computed Values
    pyCurrentTitle,
    pyXpProgress,
    pyAvailableChambers,
    pyCurrentChamber,
    pyCreaturesInChamber,
    pyUnlockedAbilities,
    pyActiveEvent,
    pyActiveMultiplier,
    pyDiscoveredArtifacts,
    pyUnlockedAchievements,
    pyEquippedArtifacts,
    pyTotalStructureBonus,
    pyRarityCounts,
    pySpeciesCounts,

    // Actions
    pyAddXp,
    pyProcessLevelUp,
    pyAddCoins,
    pySpendCoins,
    pyEnterChamber,
    pyEncounterCreature,
    pyCaptureCreature,
    pyGatherMaterial,
    pyHasMaterial,
    pySpendMaterial,
    pyBuildStructure,
    pyUpgradeStructure,
    pyIgnite,
    pyForge,
    pySmelt,
    pySummon,
    pySacrifice,
    pyTemper,
    pyErupt,
    pyUseAbility,
    pyTriggerEvent,
    pyEndEvent,
    pyTriggerRandomEvent,
    pyDiscoverArtifact,
    pyEquipArtifact,
    pyCheckAchievements,
    pyResetSave,

    // Helpers
    pyGetCreatureById,
    pyGetChamberById,
    pyGetMaterialById,
    pyGetSpeciesDef,
    pyGetAbilityById,
    pyGetStructureById,
    pyGetArtifactById,
    pyCanBuildStructure,
    pyCanUpgradeStructure,
    pyCanUseAbility,
    pyGetInventoryCount,
    pyGetTotalInventoryItems,
    pyIsAbilityOnCooldown,
    pyGetAbilityCooldownRemaining,
    pyGetCreaturesBySpecies,
    pyGetCreaturesByRarity,
    pyGetCapturedCreatures,
    pyGetDiscoveredCreatures,
    pyGetDiscoveryProgress,
    pyGetCaptureProgress,
    pyLogSession,

    // Combat Helpers
    pyCalculateBattleDamage,
    pySimulateBattle,
    pyGetBattleOdds,
    pyLevelUpCreature,
    pyAddCreatureXp,
  };
}
