import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════════════════
// Phoenix Nest (凤凰巢穴) — Word Snake Wire Module
// ───────────────────────────────────────────────────────────────────────────────
// A sacred sanctuary where 35 phoenixes of 7 elemental lineages rest, hatch, and
// are reborn from their own ashes. Manage nests, gather feather materials, build
// nest structures, unlock abilities, collect artifacts, earn titles, and trigger
// cataclysmic nest events that reshape the flock.
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Color Theme Constants ────────────────────────────────────────────────────

const PX_COLOR_FIRE = '#FF4500';
const PX_COLOR_ICE = '#00BFFF';
const PX_COLOR_STORM = '#9370DB';
const PX_COLOR_COSMIC = '#FFD700';
const PX_COLOR_SHADOW = '#2F1B41';
const PX_COLOR_HOLY = '#FFFACD';
const PX_COLOR_VOID = '#0D0221';
const PX_COLOR_ASH = '#696969';
const PX_COLOR_EMBER = '#FF6347';
const PX_COLOR_FROST = '#E0FFFF';
const PX_COLOR_PLASMA = '#FF69B4';

// ─── Rarity Tier Constants ────────────────────────────────────────────────────

const PX_RARITY_COMMON = 'common';
const PX_RARITY_UNCOMMON = 'uncommon';
const PX_RARITY_RARE = 'rare';
const PX_RARITY_EPIC = 'epic';
const PX_RARITY_LEGENDARY = 'legendary';

const PX_RARITY_COLORS: Record<string, string> = {
  [PX_RARITY_COMMON]: '#9CA3AF',
  [PX_RARITY_UNCOMMON]: '#4ADE80',
  [PX_RARITY_RARE]: '#60A5FA',
  [PX_RARITY_EPIC]: '#C084FC',
  [PX_RARITY_LEGENDARY]: PX_COLOR_COSMIC,
};

const PX_RARITY_LABELS: Record<string, { en: string; zh: string }> = {
  [PX_RARITY_COMMON]: { en: 'Common', zh: '普通' },
  [PX_RARITY_UNCOMMON]: { en: 'Uncommon', zh: '优良' },
  [PX_RARITY_RARE]: { en: 'Rare', zh: '稀有' },
  [PX_RARITY_EPIC]: { en: 'Epic', zh: '史诗' },
  [PX_RARITY_LEGENDARY]: { en: 'Legendary', zh: '传说' },
};

const PX_RARITY_MULTIPLIER: Record<string, number> = {
  [PX_RARITY_COMMON]: 1,
  [PX_RARITY_UNCOMMON]: 2,
  [PX_RARITY_RARE]: 4,
  [PX_RARITY_EPIC]: 8,
  [PX_RARITY_LEGENDARY]: 16,
};

// ─── Phoenix Type Constants ──────────────────────────────────────────────────

const PX_TYPE_FIRE_PHOENIX = 'fire_phoenix';
const PX_TYPE_ICE_PHOENIX = 'ice_phoenix';
const PX_TYPE_STORM_PHOENIX = 'storm_phoenix';
const PX_TYPE_SHADOW_PHOENIX = 'shadow_phoenix';
const PX_TYPE_HOLY_PHOENIX = 'holy_phoenix';
const PX_TYPE_VOID_PHOENIX = 'void_phoenix';
const PX_TYPE_COSMIC_PHOENIX = 'cosmic_phoenix';

const PX_TYPE_COLORS: Record<string, string> = {
  [PX_TYPE_FIRE_PHOENIX]: PX_COLOR_FIRE,
  [PX_TYPE_ICE_PHOENIX]: PX_COLOR_ICE,
  [PX_TYPE_STORM_PHOENIX]: PX_COLOR_STORM,
  [PX_TYPE_SHADOW_PHOENIX]: PX_COLOR_SHADOW,
  [PX_TYPE_HOLY_PHOENIX]: PX_COLOR_HOLY,
  [PX_TYPE_VOID_PHOENIX]: PX_COLOR_VOID,
  [PX_TYPE_COSMIC_PHOENIX]: PX_COLOR_COSMIC,
};

const PX_TYPE_ICONS: Record<string, string> = {
  [PX_TYPE_FIRE_PHOENIX]: '🔥',
  [PX_TYPE_ICE_PHOENIX]: '❄️',
  [PX_TYPE_STORM_PHOENIX]: '⛈️',
  [PX_TYPE_SHADOW_PHOENIX]: '🌑',
  [PX_TYPE_HOLY_PHOENIX]: '✨',
  [PX_TYPE_VOID_PHOENIX]: '🌀',
  [PX_TYPE_COSMIC_PHOENIX]: '🌌',
};

// ─── Title Constants (8 progression titles) ───────────────────────────────────

const PX_TITLES = [
  { id: 'title_spark', name: 'Ash Spark', nameZh: '灰烬火星', minHatched: 0, icon: '🔥', description: 'A flicker of warmth among cold ashes — the beginning of all phoenix legends' },
  { id: 'title_flamekeeper', name: 'Flame Keeper', nameZh: '火焰守卫', minHatched: 5, icon: '🕯️', description: 'You have tended the eternal flame and earned the trust of the first phoenixes' },
  { id: 'title_nestguardian', name: 'Nest Guardian', nameZh: '巢穴守护者', minHatched: 12, icon: '🛡️', description: 'Guardian of the sacred nests, protecting every egg with unwavering vigilance' },
  { id: 'title_ashweaver', name: 'Ash Weaver', nameZh: '灰烬编织者', minHatched: 20, icon: '🌪️', description: 'You weave phoenix ash into powerful talismans and nest wards' },
  { id: 'title_rebornherald', name: 'Reborn Herald', nameZh: '重生先驱', minHatched: 28, icon: '🕊️', description: 'Herald of the rebirth cycle — you witness every resurrection with reverence' },
  { id: 'title_flamecrown', name: 'Lord of the Flame Crown', nameZh: '烈焰冠王', minHatched: 33, icon: '👑', description: 'The Flame Crown rests upon your brow, acknowledged by all phoenixes' },
  { id: 'title_eternalpyre', name: 'Eternal Pyre', nameZh: '永恒圣火', minHatched: 40, icon: '🌟', description: 'You have become one with the eternal pyre, unextinguishable and eternal' },
  { id: 'title_phoenixsovereign', name: 'Phoenix Sovereign', nameZh: '凤凰至尊', minHatched: 50, icon: '💎', description: 'Supreme ruler of all phoenix lineages — your will shapes the cycle of rebirth' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Interface Definitions
// ═══════════════════════════════════════════════════════════════════════════════

interface PhoenixDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  rarity: string;
  description: string;
  lore: string;
  icon: string;
  hatchChance: number;
  power: number;
  rebirthPower: number;
  requiredHatched: number;
}

interface NestDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  element: string;
  capacity: number;
  comfortBonus: number;
  icon: string;
  unlockHatched: number;
}

interface MaterialDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  description: string;
  icon: string;
  category: string;
  gatherXp: number;
  stackSize: number;
  value: number;
}

interface StructureDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  category: string;
  baseCost: number;
  costMultiplier: number;
  maxLevel: number;
  bonusType: string;
  bonusPerLevel: number;
}

interface AbilityDef {
  id: string;
  name: string;
  nameZh: string;
  type: string;
  power: number;
  cooldown: number;
  description: string;
  icon: string;
  category: string;
}

interface AchievementDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  condition: string;
  rewardXp: number;
  icon: string;
}

interface ArtifactDef {
  id: string;
  name: string;
  nameZh: string;
  rarity: string;
  description: string;
  lore: string;
  icon: string;
  bonusType: string;
  bonusValue: number;
}

interface NestEventDef {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  effectType: string;
  effectValue: number;
  icon: string;
  probability: number;
}

interface PhoenixState {
  hatched: boolean;
  rebirthCount: number;
  lastTended: number | null;
  bondLevel: number;
  encounterCount: number;
}

interface NestState {
  unlocked: boolean;
  tendCount: number;
  comfort: number;
  currentPhoenixIds: string[];
  lastTended: number | null;
}

interface InventoryItem {
  materialId: string;
  quantity: number;
}

interface StructureState {
  built: boolean;
  level: number;
}

interface PhoenixNestState {
  pxPhoenixes: Record<string, PhoenixState>;
  pxNests: Record<string, NestState>;
  pxInventory: InventoryItem[];
  pxArtifacts: string[];
  pxAchievements: string[];
  pxTitle: string;
  pxEvents: string[];
  pxStats: {
    totalHatched: number;
    totalTended: number;
    totalRebirths: number;
    totalMaterialsGathered: number;
  };
  structureStates: Record<string, StructureState>;
  abilityCooldowns: Record<string, number>;
  eventLog: Array<{
    id: string;
    type: string;
    message: string;
    messageZh: string;
    timestamp: number;
  }>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Phoenixes (35: 5 rarity tiers × 7 types)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_PHOENIXES: PhoenixDef[] = [
  // ── Common (7) ──
  { id: 'px01', name: 'Ember Chick', nameZh: '余烬雏凤', type: PX_TYPE_FIRE_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A tiny phoenix chick that glows with a gentle ember warmth', lore: 'Said to hatch from the last embers of a dying campfire on winter nights', icon: '🐥', hatchChance: 0.65, power: 10, rebirthPower: 15, requiredHatched: 0 },
  { id: 'px02', name: 'Frostling', nameZh: '冰霜幼凤', type: PX_TYPE_ICE_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A fledgling phoenix whose feathers are etched with frost crystals', lore: 'Its tears freeze into perfect diamonds before hitting the ground', icon: '🧊', hatchChance: 0.62, power: 9, rebirthPower: 14, requiredHatched: 0 },
  { id: 'px03', name: 'Spark Wing', nameZh: '火花翼凤', type: PX_TYPE_STORM_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A small phoenix that crackles with static when excited', lore: 'Nomads use its feathers as natural compasses during thunderstorms', icon: '⚡', hatchChance: 0.58, power: 11, rebirthPower: 16, requiredHatched: 0 },
  { id: 'px04', name: 'Dusk Shade', nameZh: '暮影暗凤', type: PX_TYPE_SHADOW_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A dark-feathered phoenix that blends perfectly into twilight', lore: 'It can only be seen when it chooses to reveal itself', icon: '🌑', hatchChance: 0.55, power: 12, rebirthPower: 17, requiredHatched: 0 },
  { id: 'px05', name: 'Glimmer Chick', nameZh: '微光幼凤', type: PX_TYPE_HOLY_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A radiant chick that illuminates dark places with soft golden light', lore: 'Its feathers are warm to the touch and never cast shadows', icon: '✨', hatchChance: 0.60, power: 8, rebirthPower: 13, requiredHatched: 0 },
  { id: 'px06', name: 'Hollow Wisp', nameZh: '虚空残焰', type: PX_TYPE_VOID_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A barely visible phoenix that flickers between existence and void', lore: 'It exists in the space between heartbeats, born from the silence of dying stars', icon: '🌀', hatchChance: 0.50, power: 13, rebirthPower: 18, requiredHatched: 0 },
  { id: 'px07', name: 'Stardust Fledgling', nameZh: '星尘幼凤', type: PX_TYPE_COSMIC_PHOENIX, rarity: PX_RARITY_COMMON, description: 'A fledgling covered in shimmering cosmic dust that trails like a comet', lore: 'Where it walks, footprints of glowing nebula linger behind', icon: '🌌', hatchChance: 0.52, power: 14, rebirthPower: 19, requiredHatched: 0 },

  // ── Uncommon (7) ──
  { id: 'px08', name: 'Blaze Feathers', nameZh: '烈焰翎凤', type: PX_TYPE_FIRE_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A phoenix whose feathers burn with intense but controlled flame', lore: 'Its song can ignite hearths across an entire mountain village', icon: '🔥', hatchChance: 0.42, power: 25, rebirthPower: 35, requiredHatched: 5 },
  { id: 'px09', name: 'Glacial Plume', nameZh: '冰川翎凤', type: PX_TYPE_ICE_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A magnificent phoenix with feathers of living ice', lore: 'Entire lakes freeze solid when it takes flight overhead', icon: '❄️', hatchChance: 0.38, power: 22, rebirthPower: 32, requiredHatched: 5 },
  { id: 'px10', name: 'Thunder Crest', nameZh: '雷冠凤', type: PX_TYPE_STORM_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A crested phoenix whose crown crackles with captured lightning', lore: 'It perches on the highest peaks, absorbing thunder from passing storms', icon: '⛈️', hatchChance: 0.35, power: 28, rebirthPower: 38, requiredHatched: 5 },
  { id: 'px11', name: 'Nightveil', nameZh: '夜幕暗凤', type: PX_TYPE_SHADOW_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A phoenix wrapped in a veil of living darkness', lore: 'It feeds on secrets and forgotten memories, growing stronger with each', icon: '🌑', hatchChance: 0.33, power: 30, rebirthPower: 40, requiredHatched: 5 },
  { id: 'px12', name: 'Dawn Singer', nameZh: '黎明歌凤', type: PX_TYPE_HOLY_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A phoenix whose dawn-song heals all who hear it', lore: 'Its melody can cure ailments that no medicine can touch', icon: '✨', hatchChance: 0.40, power: 20, rebirthPower: 30, requiredHatched: 5 },
  { id: 'px13', name: 'Rift Strider', nameZh: '裂隙行者', type: PX_TYPE_VOID_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A phoenix that walks between dimensions through invisible rifts', lore: 'It hunts in the spaces between worlds where no other creature dares go', icon: '🌀', hatchChance: 0.28, power: 32, rebirthPower: 42, requiredHatched: 5 },
  { id: 'px14', name: 'Nebula Dancer', nameZh: '星云舞者', type: PX_TYPE_COSMIC_PHOENIX, rarity: PX_RARITY_UNCOMMON, description: 'A graceful phoenix that dances through cosmic nebulae', lore: 'Aurora borealis appears on Earth whenever it performs its mating dance', icon: '🌌', hatchChance: 0.30, power: 34, rebirthPower: 44, requiredHatched: 5 },

  // ── Rare (7) ──
  { id: 'px15', name: 'Inferno Regent', nameZh: '炼狱王凤', type: PX_TYPE_FIRE_PHOENIX, rarity: PX_RARITY_RARE, description: 'A regal phoenix wreathed in eternal inferno flames', lore: 'Its tears are molten gold, and its wingspan blots out the midday sun', icon: '🔥', hatchChance: 0.22, power: 55, rebirthPower: 75, requiredHatched: 12 },
  { id: 'px16', name: 'Crown of Frost', nameZh: '冰霜冠凤', type: PX_TYPE_ICE_PHOENIX, rarity: PX_RARITY_RARE, description: 'A king among ice phoenixes with a crystalline crown of eternal frost', lore: 'Its breath creates glaciers that persist for a thousand years', icon: '❄️', hatchChance: 0.20, power: 50, rebirthPower: 70, requiredHatched: 12 },
  { id: 'px17', name: 'Tempest Monarch', nameZh: '暴风君主', type: PX_TYPE_STORM_PHOENIX, rarity: PX_RARITY_RARE, description: 'A massive phoenix that commands the fury of tempests and hurricanes', lore: 'When it spreads its wings, cyclones form and entire coastlines flood', icon: '⛈️', hatchChance: 0.18, power: 58, rebirthPower: 78, requiredHatched: 12 },
  { id: 'px18', name: 'Eclipse Phantom', nameZh: '食月幻影', type: PX_TYPE_SHADOW_PHOENIX, rarity: PX_RARITY_RARE, description: 'A phantom phoenix that appears only during total eclipses', lore: 'It devours light and leaves a trail of absolute darkness wherever it flies', icon: '🌑', hatchChance: 0.16, power: 62, rebirthPower: 82, requiredHatched: 12 },
  { id: 'px19', name: 'Seraph of Light', nameZh: '炽天使光凤', type: PX_TYPE_HOLY_PHOENIX, rarity: PX_RARITY_RARE, description: 'A divine phoenix with six wings of pure holy radiance', lore: 'Its presence purifies corruption and can resurrect entire dead forests overnight', icon: '✨', hatchChance: 0.21, power: 48, rebirthPower: 68, requiredHatched: 12 },
  { id: 'px20', name: 'Abyss Gatekeeper', nameZh: '深渊守门人', type: PX_TYPE_VOID_PHOENIX, rarity: PX_RARITY_RARE, description: 'A terrifying phoenix that guards the threshold between reality and the abyss', lore: 'Looking into its eyes reveals the moment of your own death', icon: '🌀', hatchChance: 0.14, power: 65, rebirthPower: 85, requiredHatched: 12 },
  { id: 'px21', name: 'Supernova Herald', nameZh: '超新星先驱', type: PX_TYPE_COSMIC_PHOENIX, rarity: PX_RARITY_RARE, description: 'A phoenix born from the death of ancient supernovae', lore: 'Its rebirth creates new star systems in distant galaxies', icon: '🌌', hatchChance: 0.15, power: 68, rebirthPower: 88, requiredHatched: 12 },

  // ── Epic (7) ──
  { id: 'px22', name: 'Ashen God of Flames', nameZh: '灰烬火神', type: PX_TYPE_FIRE_PHOENIX, rarity: PX_RARITY_EPIC, description: 'An ancient god of fire incarnated as a blazing phoenix', lore: 'It was the first flame ever created — all fire in existence is its descendant', icon: '🔥', hatchChance: 0.10, power: 120, rebirthPower: 160, requiredHatched: 20 },
  { id: 'px23', name: 'Absolute Zero Empress', nameZh: '绝对零度女帝', type: PX_TYPE_ICE_PHOENIX, rarity: PX_RARITY_EPIC, description: 'An empress whose mere presence freezes molecules to a standstill', lore: 'She once froze an erupting volcano mid-eruption just to build her nest on it', icon: '❄️', hatchChance: 0.09, power: 115, rebirthPower: 155, requiredHatched: 20 },
  { id: 'px24', name: 'Worldquake Sovereign', nameZh: '天震君主', type: PX_TYPE_STORM_PHOENIX, rarity: PX_RARITY_EPIC, description: 'A sovereign whose storms can crack continents apart', lore: 'Its favorite perch is inside the eye of the greatest hurricane ever recorded', icon: '⛈️', hatchChance: 0.08, power: 130, rebirthPower: 170, requiredHatched: 20 },
  { id: 'px25', name: 'Oblivion Incarnate', nameZh: '湮灭化身', type: PX_TYPE_SHADOW_PHOENIX, rarity: PX_RARITY_EPIC, description: 'A phoenix that embodies the concept of oblivion itself', lore: 'It has erased entire civilizations by simply flying over them', icon: '🌑', hatchChance: 0.07, power: 135, rebirthPower: 175, requiredHatched: 20 },
  { id: 'px26', name: 'Archangel of Rebirth', nameZh: '重生大天使', type: PX_TYPE_HOLY_PHOENIX, rarity: PX_RARITY_EPIC, description: 'An archangel that chose phoenix form to guide the cycle of life', lore: 'It can resurrect the dead and reverse the flow of time for a single soul', icon: '✨', hatchChance: 0.10, power: 110, rebirthPower: 150, requiredHatched: 20 },
  { id: 'px27', name: 'Singularity Devourer', nameZh: '奇点吞噬者', type: PX_TYPE_VOID_PHOENIX, rarity: PX_RARITY_EPIC, description: 'A phoenix that feeds on singularities at the centers of black holes', lore: 'It is the only creature that can survive inside a black hole', icon: '🌀', hatchChance: 0.06, power: 140, rebirthPower: 180, requiredHatched: 20 },
  { id: 'px28', name: 'Cosmic Weaver', nameZh: '宇宙编织者', type: PX_TYPE_COSMIC_PHOENIX, rarity: PX_RARITY_EPIC, description: 'A phoenix that weaves the fabric of spacetime with its tail feathers', lore: 'Every galaxy in the universe is a nest it once abandoned', icon: '🌌', hatchChance: 0.08, power: 138, rebirthPower: 178, requiredHatched: 20 },

  // ── Legendary (7) ──
  { id: 'px29', name: 'Primordial Flame Origin', nameZh: '太初烈焰起源', type: PX_TYPE_FIRE_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The original fire phoenix — source of every flame in every world', lore: 'Before the universe existed, there was only this phoenix and its eternal flame', icon: '🔥', hatchChance: 0.03, power: 280, rebirthPower: 380, requiredHatched: 33 },
  { id: 'px30', name: 'Eternal Frost Zero', nameZh: '永恒冰霜零度', type: PX_TYPE_ICE_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The absolute endpoint of cold — where even molecular motion ceases', lore: 'It predates the universe and has been slowly freezing reality since before time began', icon: '❄️', hatchChance: 0.02, power: 270, rebirthPower: 370, requiredHatched: 33 },
  { id: 'px31', name: 'Omnistorm Calamity', nameZh: '万暴灾凤', type: PX_TYPE_STORM_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'A calamity given wings — every storm in history is but a feather it shed', lore: 'When it screams, the sky shatters and every weather system on Earth goes mad', icon: '⛈️', hatchChance: 0.02, power: 300, rebirthPower: 400, requiredHatched: 33 },
  { id: 'px32', name: 'Abyssal Endbringer', nameZh: '深渊末日使者', type: PX_TYPE_SHADOW_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The harbinger of the final darkness — the last thing the universe will ever see', lore: 'Its nest is the event horizon of a supermassive black hole at the edge of creation', icon: '🌑', hatchChance: 0.02, power: 310, rebirthPower: 410, requiredHatched: 33 },
  { id: 'px33', name: 'Divine Phoenix Throne', nameZh: '神圣凤凰王座', type: PX_TYPE_HOLY_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The divine throne of all phoenixes — the holiest creature in existence', lore: 'Gods bow before this phoenix; it created the concept of holiness itself', icon: '✨', hatchChance: 0.03, power: 260, rebirthPower: 360, requiredHatched: 33 },
  { id: 'px34', name: 'Void Primordial', nameZh: '虚空太初者', type: PX_TYPE_VOID_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The phoenix that existed before existence — born from the primordial void', lore: 'It created the void so that creation would have somewhere to exist', icon: '🌀', hatchChance: 0.02, power: 320, rebirthPower: 420, requiredHatched: 33 },
  { id: 'px35', name: 'Cosmic Phoenix Origin', nameZh: '宇宙凤凰起源', type: PX_TYPE_COSMIC_PHOENIX, rarity: PX_RARITY_LEGENDARY, description: 'The Origin Phoenix — the first living thing in the cosmos and the last', lore: 'Its ash will become the seed of the next universe when this one ends', icon: '🌌', hatchChance: 0.02, power: 350, rebirthPower: 450, requiredHatched: 33 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Nest Locations (8)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_NESTS: NestDef[] = [
  { id: 'nest01', name: 'Ember Cradle', nameZh: '余烬摇篮', description: 'A volcanic nest of smoldering obsidian where fire phoenix eggs incubate in natural lava', element: PX_TYPE_FIRE_PHOENIX, capacity: 6, comfortBonus: 15, icon: '🌋', unlockHatched: 0 },
  { id: 'nest02', name: 'Glacial Roost', nameZh: '冰川栖木', description: 'A crystalline roost carved into an eternal glacier, perfect for ice phoenix hatchlings', element: PX_TYPE_ICE_PHOENIX, capacity: 5, comfortBonus: 15, icon: '🏔️', unlockHatched: 3 },
  { id: 'nest03', name: 'Storm Spire', nameZh: '雷暴尖塔', description: 'A lightning-scarred spire at the peak of the highest mountain, crackling with energy', element: PX_TYPE_STORM_PHOENIX, capacity: 4, comfortBonus: 20, icon: '🗼', unlockHatched: 6 },
  { id: 'nest04', name: 'Shadow Hollow', nameZh: '暗影空穴', description: 'A cavern where no light reaches, enveloped in perpetual darkness and silence', element: PX_TYPE_SHADOW_PHOENIX, capacity: 4, comfortBonus: 20, icon: '🕳️', unlockHatched: 10 },
  { id: 'nest05', name: 'Sanctum of Light', nameZh: '光明圣所', description: 'A floating sanctuary bathed in eternal golden radiance and sacred hymns', element: PX_TYPE_HOLY_PHOENIX, capacity: 5, comfortBonus: 18, icon: '⛪', unlockHatched: 15 },
  { id: 'nest06', name: 'Void Threshold', nameZh: '虚空边界', description: 'The unstable edge between reality and the void, where space itself warps', element: PX_TYPE_VOID_PHOENIX, capacity: 3, comfortBonus: 25, icon: '🌀', unlockHatched: 20 },
  { id: 'nest07', name: 'Starbirth Nest', nameZh: '星辰诞巢', description: 'A nest floating among the stars, woven from cosmic filaments and nebula gas', element: PX_TYPE_COSMIC_PHOENIX, capacity: 3, comfortBonus: 25, icon: '🌌', unlockHatched: 25 },
  { id: 'nest08', name: 'Rebirth Nexus', nameZh: '重生枢纽', description: 'The sacred nexus where all phoenixes gather for the grand rebirth ceremony', element: 'all', capacity: 10, comfortBonus: 40, icon: '🔥', unlockHatched: 30 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Materials (30 feather/ash materials)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_MATERIALS: MaterialDef[] = [
  // Common (8)
  { id: 'mat01', name: 'Ember Down', nameZh: '余烬绒羽', rarity: PX_RARITY_COMMON, description: 'Soft down feathers from a common fire phoenix, still faintly warm', icon: '🪶', category: 'feather', gatherXp: 5, stackSize: 99, value: 2 },
  { id: 'mat02', name: 'Frost Quill', nameZh: '冰霜翎', rarity: PX_RARITY_COMMON, description: 'A translucent quill from an ice phoenix that never melts', icon: '🪶', category: 'feather', gatherXp: 5, stackSize: 99, value: 2 },
  { id: 'mat03', name: 'Static Plume', nameZh: '静电羽', rarity: PX_RARITY_COMMON, description: 'A feather crackling with static electricity from a storm phoenix', icon: '🪶', category: 'feather', gatherXp: 5, stackSize: 99, value: 2 },
  { id: 'mat04', name: 'Cool Ash', nameZh: '冷灰', rarity: PX_RARITY_COMMON, description: 'Standard phoenix ash gathered after a routine rebirth', icon: '💨', category: 'ash', gatherXp: 4, stackSize: 99, value: 1 },
  { id: 'mat05', name: 'Holy Mote', nameZh: '圣光微尘', rarity: PX_RARITY_COMMON, description: 'A tiny particle of holy light shed by a radiant phoenix', icon: '✨', category: 'feather', gatherXp: 5, stackSize: 99, value: 2 },
  { id: 'mat06', name: 'Twilight Feather', nameZh: '暮光羽', rarity: PX_RARITY_COMMON, description: 'A gray feather from a shadow phoenix that shimmers at dusk', icon: '🪶', category: 'feather', gatherXp: 4, stackSize: 99, value: 1 },
  { id: 'mat07', name: 'Void Dust', nameZh: '虚空尘', rarity: PX_RARITY_COMMON, description: 'Fine dust that appears when a void phoenix phases through matter', icon: '🌀', category: 'ash', gatherXp: 5, stackSize: 99, value: 2 },
  { id: 'mat08', name: 'Starlight Fluff', nameZh: '星光绒', rarity: PX_RARITY_COMMON, description: 'Soft cosmic fluff that glows faintly with stellar light', icon: '🌟', category: 'feather', gatherXp: 5, stackSize: 99, value: 2 },
  // Uncommon (8)
  { id: 'mat09', name: 'Blaze Pinion', nameZh: '烈焰飞羽', rarity: PX_RARITY_UNCOMMON, description: 'A burning pinion feather from a blaze phoenix, hot to the touch', icon: '🪶', category: 'feather', gatherXp: 18, stackSize: 50, value: 10 },
  { id: 'mat10', name: 'Glacial Shaft', nameZh: '冰川翎管', rarity: PX_RARITY_UNCOMMON, description: 'A reinforced ice quill sharp enough to cut steel', icon: '🪶', category: 'feather', gatherXp: 20, stackSize: 50, value: 12 },
  { id: 'mat11', name: 'Thunder Down', nameZh: '雷电绒', rarity: PX_RARITY_UNCOMMON, description: 'Down that generates small lightning arcs between strands', icon: '🪶', category: 'feather', gatherXp: 19, stackSize: 50, value: 11 },
  { id: 'mat12', name: 'Warm Ash Pile', nameZh: '暖灰堆', rarity: PX_RARITY_UNCOMMON, description: 'Ash that radiates comforting warmth and accelerates egg hatching', icon: '💨', category: 'ash', gatherXp: 16, stackSize: 50, value: 8 },
  { id: 'mat13', name: 'Shadow Silk', nameZh: '暗影丝', rarity: PX_RARITY_UNCOMMON, description: 'Silky threads harvested from a shadow phoenix that absorb light', icon: '🪶', category: 'feather', gatherXp: 22, stackSize: 40, value: 15 },
  { id: 'mat14', name: 'Golden Ember', nameZh: '金余烬', rarity: PX_RARITY_UNCOMMON, description: 'A glowing ember from a holy phoenix that purifies water on contact', icon: '🔥', category: 'ash', gatherXp: 20, stackSize: 40, value: 12 },
  { id: 'mat15', name: 'Rift Fragment', nameZh: '裂隙碎片', rarity: PX_RARITY_UNCOMMON, description: 'A shard of dimensional reality shed by a void phoenix', icon: '🌀', category: 'ash', gatherXp: 24, stackSize: 30, value: 18 },
  { id: 'mat16', name: 'Nebula Thread', nameZh: '星云丝线', rarity: PX_RARITY_UNCOMMON, description: 'A thread of cosmic nebula gas, tangible and glowing with colors', icon: '🌌', category: 'feather', gatherXp: 21, stackSize: 40, value: 14 },
  // Rare (7)
  { id: 'mat17', name: 'Inferno Crown Feather', nameZh: '炼狱冠羽', rarity: PX_RARITY_RARE, description: 'A crown feather from an Inferno Regent, burning with intense power', icon: '🪶', category: 'feather', gatherXp: 50, stackSize: 20, value: 40 },
  { id: 'mat18', name: 'Permafrost Talon', nameZh: '永冻爪羽', rarity: PX_RARITY_RARE, description: 'An icicle-like feather from a Crown of Frost phoenix', icon: '🪶', category: 'feather', gatherXp: 48, stackSize: 20, value: 38 },
  { id: 'mat19', name: 'Storm Core Shard', nameZh: '暴风核心碎片', rarity: PX_RARITY_RARE, description: 'A fragment of condensed storm energy from a Tempest Monarch', icon: '⚡', category: 'ash', gatherXp: 55, stackSize: 15, value: 45 },
  { id: 'mat20', name: 'Eclipse Essence', nameZh: '食月精华', rarity: PX_RARITY_RARE, description: 'Distilled darkness from an Eclipse Phantom, concentrated into liquid shadow', icon: '🌑', category: 'ash', gatherXp: 52, stackSize: 15, value: 42 },
  { id: 'mat21', name: 'Seraph Down', nameZh: '炽天使绒', rarity: PX_RARITY_RARE, description: 'Down from a six-winged Seraph of Light, radiating pure holiness', icon: '🪶', category: 'feather', gatherXp: 45, stackSize: 20, value: 35 },
  { id: 'mat22', name: 'Abyss Residue', nameZh: '深渊残渣', rarity: PX_RARITY_RARE, description: 'Residue left behind when an Abyss Gatekeeper opens a dimensional gate', icon: '🌀', category: 'ash', gatherXp: 58, stackSize: 10, value: 50 },
  { id: 'mat23', name: 'Supernova Fragment', nameZh: '超新星碎片', rarity: PX_RARITY_RARE, description: 'A fragment of a dying star carried by a Supernova Herald', icon: '🌌', category: 'ash', gatherXp: 60, stackSize: 10, value: 55 },
  // Epic (4)
  { id: 'mat24', name: 'Primordial Flame Essence', nameZh: '太初烈焰精华', rarity: PX_RARITY_EPIC, description: 'Liquid fire essence from the Ashen God of Flames itself', icon: '🔥', category: 'ash', gatherXp: 120, stackSize: 5, value: 150 },
  { id: 'mat25', name: 'Absolute Zero Crystal', nameZh: '绝对零度结晶', rarity: PX_RARITY_EPIC, description: 'A crystal colder than the coldest point in the universe', icon: '❄️', category: 'ash', gatherXp: 125, stackSize: 5, value: 160 },
  { id: 'mat26', name: 'Void Singularity Core', nameZh: '虚空奇点核心', rarity: PX_RARITY_EPIC, description: 'A compressed singularity from the heart of a Singularity Devourer', icon: '🌀', category: 'ash', gatherXp: 130, stackSize: 3, value: 180 },
  { id: 'mat27', name: 'Cosmic Thread of Fate', nameZh: '命运宇宙丝', rarity: PX_RARITY_EPIC, description: 'A thread of spacetime woven by the Cosmic Weaver itself', icon: '🌌', category: 'feather', gatherXp: 135, stackSize: 3, value: 200 },
  // Legendary (3)
  { id: 'mat28', name: 'Origin Flame Seed', nameZh: '起源火种', rarity: PX_RARITY_LEGENDARY, description: 'The seed of the very first flame, from the Primordial Flame Origin', icon: '🔥', category: 'ash', gatherXp: 350, stackSize: 1, value: 600 },
  { id: 'mat29', name: 'Cosmic Ash of Genesis', nameZh: '创世宇宙灰', rarity: PX_RARITY_LEGENDARY, description: 'Ash from the birth of the universe, carrying the memory of creation', icon: '💨', category: 'ash', gatherXp: 400, stackSize: 1, value: 700 },
  { id: 'mat30', name: 'Eternal Feather of Rebirth', nameZh: '永恒重生羽', rarity: PX_RARITY_LEGENDARY, description: 'The single most powerful feather in existence, granting true immortality', icon: '🪶', category: 'feather', gatherXp: 500, stackSize: 1, value: 1000 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Structures (25, upgradeable to level 10)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_STRUCTURES: StructureDef[] = [
  { id: 'str01', name: 'Ash Repository', nameZh: '灰烬仓库', description: 'Stores phoenix ash for rituals and construction', icon: '🏚️', category: 'storage', baseCost: 50, costMultiplier: 1.4, maxLevel: 10, bonusType: 'ash_capacity', bonusPerLevel: 20 },
  { id: 'str02', name: 'Incubation Chamber', nameZh: '孵化室', description: 'A warm chamber that accelerates egg incubation', icon: '🥚', category: 'production', baseCost: 80, costMultiplier: 1.5, maxLevel: 10, bonusType: 'hatch_speed', bonusPerLevel: 10 },
  { id: 'str03', name: 'Feather Forge', nameZh: '羽锻炉', description: 'Forges phoenix feathers into talismans and equipment', icon: '🔨', category: 'crafting', baseCost: 70, costMultiplier: 1.4, maxLevel: 10, bonusType: 'feather_quality', bonusPerLevel: 8 },
  { id: 'str04', name: 'Rebirth Altar', nameZh: '重生祭坛', description: 'A sacred altar where phoenixes perform their rebirth ceremony', icon: '⛩️', category: 'spiritual', baseCost: 100, costMultiplier: 1.5, maxLevel: 10, bonusType: 'rebirth_bonus', bonusPerLevel: 12 },
  { id: 'str05', name: 'Ash Furnace', nameZh: '灰烬炉', description: 'Burns phoenix ash to generate energy for the nest', icon: '🔥', category: 'production', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, bonusType: 'energy_output', bonusPerLevel: 15 },
  { id: 'str06', name: 'Crystal Roost', nameZh: '水晶栖架', description: 'A roost made of enchanted crystal that boosts phoenix comfort', icon: '💎', category: 'housing', baseCost: 120, costMultiplier: 1.5, maxLevel: 10, bonusType: 'comfort', bonusPerLevel: 10 },
  { id: 'str07', name: 'Storm Lure', nameZh: '风暴诱器', description: 'Attracts storm phoenixes with controlled lightning', icon: '⚡', category: 'special', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, bonusType: 'storm_attract', bonusPerLevel: 8 },
  { id: 'str08', name: 'Void Anchor', nameZh: '虚空锚点', description: 'Stabilizes dimensional rifts near the nest', icon: '🌀', category: 'defense', baseCost: 150, costMultiplier: 1.6, maxLevel: 10, bonusType: 'void_stability', bonusPerLevel: 12 },
  { id: 'str09', name: 'Holy Beacon', nameZh: '圣光信标', description: 'A beacon of holy light that guides lost phoenixes home', icon: '🔦', category: 'spiritual', baseCost: 110, costMultiplier: 1.5, maxLevel: 10, bonusType: 'holy_bonus', bonusPerLevel: 10 },
  { id: 'str10', name: 'Shadow Veil', nameZh: '暗影帷幕', description: 'A dark veil that protects the nest from detection', icon: '🌑', category: 'defense', baseCost: 140, costMultiplier: 1.5, maxLevel: 10, bonusType: 'stealth', bonusPerLevel: 14 },
  { id: 'str11', name: 'Cosmic Observatory', nameZh: '宇宙观象台', description: 'Studies the stars to predict cosmic phoenix migrations', icon: '🔭', category: 'research', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, bonusType: 'predict_accuracy', bonusPerLevel: 8 },
  { id: 'str12', name: 'Feather Museum', nameZh: '羽毛博物馆', description: 'Preserves and displays rare feathers from legendary phoenixes', icon: '🏛️', category: 'storage', baseCost: 180, costMultiplier: 1.6, maxLevel: 10, bonusType: 'feather_capacity', bonusPerLevel: 25 },
  { id: 'str13', name: 'Ember Bath', nameZh: '余烬浴池', description: 'A bath of warm embers where phoenixes rest and regenerate', icon: '♨️', category: 'housing', baseCost: 100, costMultiplier: 1.4, maxLevel: 10, bonusType: 'recovery_speed', bonusPerLevel: 12 },
  { id: 'str14', name: 'Nest Warden Tower', nameZh: '巢穴守望塔', description: 'A tower for wardens to watch over all nests', icon: '🗼', category: 'defense', baseCost: 160, costMultiplier: 1.6, maxLevel: 10, bonusType: 'ward_range', bonusPerLevel: 16 },
  { id: 'str15', name: 'Ash Garden', nameZh: '灰烬花园', description: 'A garden where phoenix ash fertilizes magical plants', icon: '🌿', category: 'production', baseCost: 90, costMultiplier: 1.4, maxLevel: 10, bonusType: 'ash_to_material', bonusPerLevel: 10 },
  { id: 'str16', name: 'Egg Vault', nameZh: '蛋库', description: 'A secure vault for storing valuable phoenix eggs', icon: '🏦', category: 'storage', baseCost: 170, costMultiplier: 1.6, maxLevel: 10, bonusType: 'egg_capacity', bonusPerLevel: 5 },
  { id: 'str17', name: 'Rebirth Amplifier', nameZh: '重生增幅器', description: 'Amplifies the power gained during a phoenix rebirth', icon: '🔬', category: 'production', baseCost: 220, costMultiplier: 1.7, maxLevel: 10, bonusType: 'rebirth_power', bonusPerLevel: 18 },
  { id: 'str18', name: 'Wanderer Lodge', nameZh: '流浪者旅舍', description: 'A lodge for visiting phoenix tenders and researchers', icon: '🏕️', category: 'economy', baseCost: 130, costMultiplier: 1.5, maxLevel: 10, bonusType: 'visitor_bonus', bonusPerLevel: 10 },
  { id: 'str19', name: 'Ash Alchemy Lab', nameZh: '灰烬炼金室', description: 'Transforms common ash into rare materials through alchemy', icon: '🧪', category: 'crafting', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, bonusType: 'alchemy_quality', bonusPerLevel: 14 },
  { id: 'str20', name: 'Phoenix Arena', nameZh: '凤凰竞技场', description: 'An arena where phoenixes compete and grow stronger', icon: '🏟️', category: 'special', baseCost: 250, costMultiplier: 1.8, maxLevel: 10, bonusType: 'combat_bonus', bonusPerLevel: 20 },
  { id: 'str21', name: 'Ember Pipeline', nameZh: '余烬管道', description: 'A network of pipes distributing ember energy across all nests', icon: '🔧', category: 'infrastructure', baseCost: 160, costMultiplier: 1.5, maxLevel: 10, bonusType: 'energy_distribution', bonusPerLevel: 12 },
  { id: 'str22', name: 'Oracle Chamber', nameZh: '神谕室', description: 'A mystical chamber that reveals hidden phoenix lore', icon: '🔮', category: 'research', baseCost: 280, costMultiplier: 1.8, maxLevel: 10, bonusType: 'lore_reveal', bonusPerLevel: 10 },
  { id: 'str23', name: 'Ash Cannon', nameZh: '灰烬大炮', description: 'A defensive cannon that fires compressed ash projectiles', icon: '💣', category: 'defense', baseCost: 200, costMultiplier: 1.7, maxLevel: 10, bonusType: 'defense_power', bonusPerLevel: 22 },
  { id: 'str24', name: 'Genesis Nest', nameZh: '创世巢', description: 'A sacred nest where the first phoenix was born, boosting all rebirths', icon: '🪹', category: 'spiritual', baseCost: 350, costMultiplier: 1.9, maxLevel: 10, bonusType: 'all_bonuses', bonusPerLevel: 5 },
  { id: 'str25', name: 'Phoenix Citadel', nameZh: '凤凰城堡', description: 'The ultimate nest structure — a citadel commanding all phoenix power', icon: '🏰', baseCost: 500, costMultiplier: 2.0, maxLevel: 10, bonusType: 'prestige', bonusPerLevel: 30 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Abilities (22)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_ABILITIES: AbilityDef[] = [
  { id: 'ab01', name: 'Ember Spark', nameZh: '余烬火花', type: 'hatch', power: 15, cooldown: 3, description: 'Boosts hatch chance by 15% for the next attempt', icon: '🔥', category: 'hatching' },
  { id: 'ab02', name: 'Frost Ward', nameZh: '冰霜结界', type: 'defense', power: 2, cooldown: 4, description: 'Protects nests from a random negative event for 2 turns', icon: '❄️', category: 'defense' },
  { id: 'ab03', name: 'Storm Call', nameZh: '风暴呼唤', type: 'gather', power: 30, cooldown: 5, description: 'Summons a storm that deposits rare materials into inventory', icon: '⛈️', category: 'gathering' },
  { id: 'ab04', name: 'Shadow Scout', nameZh: '暗影侦察', type: 'explore', power: 1, cooldown: 3, description: 'Reveals the location of a hidden nest', icon: '🌑', category: 'exploration' },
  { id: 'ab05', name: 'Holy Blessing', nameZh: '神圣祝福', type: 'hatch', power: 25, cooldown: 6, description: 'Blesses an egg, greatly increasing hatch chance', icon: '✨', category: 'hatching' },
  { id: 'ab06', name: 'Void Phase', nameZh: '虚空相位', type: 'utility', power: 1, cooldown: 4, description: 'Phases through obstacles to access restricted nest areas', icon: '🌀', category: 'utility' },
  { id: 'ab07', name: 'Cosmic Vision', nameZh: '宇宙视野', type: 'explore', power: 3, cooldown: 5, description: 'See all phoenix types and their rarity in every nest', icon: '🌌', category: 'exploration' },
  { id: 'ab08', name: 'Flame Sweep', nameZh: '烈焰横扫', type: 'combat', power: 40, cooldown: 5, description: 'Burns away obstacles and clears nest debris', icon: '🔥', category: 'special' },
  { id: 'ab09', name: 'Rapid Build', nameZh: '快速建造', type: 'build', power: 1, cooldown: 6, description: 'Instantly complete the next structure upgrade', icon: '🏗️', category: 'building' },
  { id: 'ab10', name: 'Ash Storm', nameZh: '灰烬风暴', type: 'gather', power: 50, cooldown: 7, description: 'A storm of phoenix ash that deposits massive material yields', icon: '💨', category: 'gathering' },
  { id: 'ab11', name: 'Phoenix Song', nameZh: '凤凰之歌', type: 'hatch', power: 20, cooldown: 5, description: 'A song that soothes eggs and increases hatch speed', icon: '🎵', category: 'hatching' },
  { id: 'ab12', name: 'Shadow Cloak', nameZh: '暗影斗篷', type: 'defense', power: 3, cooldown: 6, description: 'Hides all nests from detection for 3 turns', icon: '🌑', category: 'defense' },
  { id: 'ab13', name: 'Holy Rebirth', nameZh: '神圣重生', type: 'special', power: 100, cooldown: 10, description: 'Instantly triggers a rebirth for one phoenix', icon: '✨', category: 'special' },
  { id: 'ab14', name: 'Void Rift', nameZh: '虚空裂隙', type: 'gather', power: 60, cooldown: 8, description: 'Opens a rift to harvest materials from another dimension', icon: '🌀', category: 'gathering' },
  { id: 'ab15', name: 'Cosmic Forge', nameZh: '宇宙锻造', type: 'craft', power: 35, cooldown: 7, description: 'Uses cosmic energy to upgrade a structure by 2 levels instantly', icon: '🌌', category: 'building' },
  { id: 'ab16', name: 'Inferno Nest', nameZh: '炼狱之巢', type: 'combat', power: 70, cooldown: 8, description: 'Sets a nest ablaze with protective infernal fire', icon: '🔥', category: 'special' },
  { id: 'ab17', name: 'Glacial Shield', nameZh: '冰川护盾', type: 'defense', power: 50, cooldown: 8, description: 'Encases all nests in impenetrable ice for 2 turns', icon: '❄️', category: 'defense' },
  { id: 'ab18', name: 'Thunderbolt Hatch', nameZh: '雷电孵化', type: 'hatch', power: 40, cooldown: 9, description: 'Lightning accelerates hatching — guaranteed rare or above', icon: '⚡', category: 'hatching' },
  { id: 'ab19', name: 'Ash Alchemy', nameZh: '灰烬炼金', type: 'craft', power: 45, cooldown: 7, description: 'Transmutes common materials into rarer ones', icon: '🧪', category: 'gathering' },
  { id: 'ab20', name: 'Divine Revelation', nameZh: '神圣启示', type: 'explore', power: 1, cooldown: 12, description: 'Reveals the location of a hidden legendary artifact', icon: '📜', category: 'exploration' },
  { id: 'ab21', name: 'Eternal Flame', nameZh: '永恒圣火', type: 'special', power: 0, cooldown: 15, description: 'Ignites the eternal flame, resetting all cooldowns and boosting everything', icon: '🕯️', category: 'special' },
  { id: 'ab22', name: 'Genesis Awakening', nameZh: '创世觉醒', type: 'special', power: 200, cooldown: 20, description: 'The ultimate ability — awakens primordial power across all nests', icon: '💎', category: 'special' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Achievements (18)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'ach01', name: 'First Flame', nameZh: '第一缕火', description: 'Hatch your very first phoenix', condition: 'totalHatched >= 1', rewardXp: 50, icon: '🔥' },
  { id: 'ach02', name: 'Ash Collector', nameZh: '灰烬收集者', description: 'Gather 50 phoenix materials total', condition: 'totalMaterials >= 50', rewardXp: 100, icon: '💨' },
  { id: 'ach03', name: 'Nest Builder', nameZh: '筑巢者', description: 'Build 5 different structures', condition: 'structuresBuilt >= 5', rewardXp: 150, icon: '🏗️' },
  { id: 'ach04', name: 'Five Alight', nameZh: '五凤齐飞', description: 'Hatch 5 different phoenixes', condition: 'totalHatched >= 5', rewardXp: 200, icon: '🪶' },
  { id: 'ach05', name: 'Full Nest', nameZh: '满巢', description: 'Unlock all 8 nest locations', condition: 'nestsUnlocked >= 8', rewardXp: 300, icon: '🪹' },
  { id: 'ach06', name: 'Rebirth Witness', nameZh: '重生见证者', description: 'Witness your first phoenix rebirth', condition: 'totalRebirths >= 1', rewardXp: 250, icon: '🕊️' },
  { id: 'ach07', name: 'Elemental Balance', nameZh: '元素平衡', description: 'Hatch at least one phoenix of every type', condition: 'uniqueTypes >= 7', rewardXp: 400, icon: '⚖️' },
  { id: 'ach08', name: 'Rare Find', nameZh: '稀有发现', description: 'Hatch a rare or higher phoenix', condition: 'rareHatched >= 1', rewardXp: 300, icon: '💎' },
  { id: 'ach09', name: 'Master Builder', nameZh: '建造大师', description: 'Build and upgrade a structure to level 10', condition: 'maxStructureLevel >= 10', rewardXp: 500, icon: '🏰' },
  { id: 'ach10', name: 'Tender Heart', nameZh: '守护之心', description: 'Tend nests 100 times total', condition: 'totalTended >= 100', rewardXp: 350, icon: '💕' },
  { id: 'ach11', name: 'Material Hoarder', nameZh: '材料囤积者', description: 'Accumulate 200 total materials', condition: 'totalMaterials >= 200', rewardXp: 400, icon: '📦' },
  { id: 'ach12', name: 'Artifact Hunter', nameZh: '神器猎人', description: 'Activate 5 artifacts', condition: 'artifactsActivated >= 5', rewardXp: 450, icon: '🔮' },
  { id: 'ach13', name: 'Epic Discovery', nameZh: '史诗发现', description: 'Hatch an epic phoenix', condition: 'epicHatched >= 1', rewardXp: 600, icon: '⭐' },
  { id: 'ach14', name: 'Event Horizon', nameZh: '事件地平线', description: 'Trigger 5 different nest events', condition: 'eventsTriggered >= 5', rewardXp: 350, icon: '🌀' },
  { id: 'ach15', name: 'Rebirth Cycle', nameZh: '重生轮回', description: 'Witness 10 phoenix rebirths', condition: 'totalRebirths >= 10', rewardXp: 800, icon: '🔄' },
  { id: 'ach16', name: 'Legendary Born', nameZh: '传说降世', description: 'Hatch a legendary phoenix', condition: 'legendaryHatched >= 1', rewardXp: 1200, icon: '👑' },
  { id: 'ach17', name: 'Complete Flock', nameZh: '完整凤群', description: 'Hatch all 35 phoenix species', condition: 'totalHatched >= 35', rewardXp: 2000, icon: '🦚' },
  { id: 'ach18', name: 'Phoenix Sovereign', nameZh: '凤凰至尊', description: 'Earn the Phoenix Sovereign title', condition: 'titleIndex >= 7', rewardXp: 3000, icon: '💎' },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Artifacts (15)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_ARTIFACTS: ArtifactDef[] = [
  { id: 'art01', name: 'Ember Talisman', nameZh: '余烬护符', rarity: PX_RARITY_COMMON, description: 'A warm talisman that boosts fire phoenix hatch rates', lore: 'Forged from the first ember of a phoenix rebirth', icon: '🔮', bonusType: 'hatch_fire', bonusValue: 5 },
  { id: 'art02', name: 'Frost Pendant', nameZh: '冰霜吊坠', rarity: PX_RARITY_COMMON, description: 'A pendant of eternal ice that protects ice phoenix eggs', lore: 'Contains a drop of water from the first ice phoenix tears', icon: '📿', bonusType: 'hatch_ice', bonusValue: 5 },
  { id: 'art03', name: 'Storm Shard', nameZh: '暴风碎片', rarity: PX_RARITY_UNCOMMON, description: 'A shard of solidified lightning that crackles with energy', lore: 'Broken from the horn of an ancient Tempest Monarch', icon: '⚡', bonusType: 'hatch_storm', bonusValue: 8 },
  { id: 'art04', name: 'Shadow Mirror', nameZh: '暗影之镜', rarity: PX_RARITY_UNCOMMON, description: 'A mirror that reflects shadow energy, strengthening dark phoenixes', lore: 'The last reflection in this mirror is your own death', icon: '🪞', bonusType: 'hatch_shadow', bonusValue: 8 },
  { id: 'art05', name: 'Holy Reliquary', nameZh: '圣光圣物匣', rarity: PX_RARITY_UNCOMMON, description: 'A reliquary containing sacred light from the first dawn', lore: 'Opened only during the holiest ceremonies', icon: '⛪', bonusType: 'hatch_holy', bonusValue: 8 },
  { id: 'art06', name: 'Void Keystone', nameZh: '虚空拱心石', rarity: PX_RARITY_RARE, description: 'A keystone that stabilizes dimensional rifts around nests', lore: 'Without it, the void would swallow the nest whole', icon: '🌀', bonusType: 'hatch_void', bonusValue: 12 },
  { id: 'art07', name: 'Cosmic Prism', nameZh: '宇宙棱镜', rarity: PX_RARITY_RARE, description: 'A prism that refracts starlight into pure cosmic energy', lore: 'The colors it produces do not exist in the visible spectrum', icon: '🌈', bonusType: 'hatch_cosmic', bonusValue: 12 },
  { id: 'art08', name: 'Ash Crown', nameZh: '灰烬王冠', rarity: PX_RARITY_RARE, description: 'A crown woven from the ash of a thousand phoenix rebirths', lore: 'Each grain of ash contains the memory of a reborn life', icon: '👑', bonusType: 'rebirth_power', bonusValue: 10 },
  { id: 'art09', name: 'Feather of Origins', nameZh: '起源之羽', rarity: PX_RARITY_EPIC, description: 'A feather from the very first phoenix ever born', lore: 'It predates the universe and glows with creation energy', icon: '🪶', bonusType: 'all_hatch', bonusValue: 5 },
  { id: 'art10', name: 'Nest Heart Crystal', nameZh: '巢心水晶', rarity: PX_RARITY_EPIC, description: 'The crystallized heart of an ancient nest, pulsing with life', lore: 'It beats once per century, and each beat creates a new nest', icon: '💎', bonusType: 'nest_comfort', bonusValue: 20 },
  { id: 'art11', name: 'Rebirth Chalice', nameZh: '重生圣杯', rarity: PX_RARITY_EPIC, description: 'A chalice that catches phoenix tears during rebirth ceremonies', lore: 'Drinking from it grants temporary immunity to all elements', icon: '🍷', bonusType: 'rebirth_speed', bonusValue: 15 },
  { id: 'art12', name: 'Eternal Flame Lantern', nameZh: '永恒圣火灯', rarity: PX_RARITY_EPIC, description: 'A lantern containing a flame that will never go out', lore: 'It is the last remnant of the first fire ever created', icon: '🏮', bonusType: 'energy_output', bonusValue: 25 },
  { id: 'art13', name: 'Void Compass', nameZh: '虚空罗盘', rarity: PX_RARITY_LEGENDARY, description: 'A compass that points toward hidden nests in other dimensions', lore: 'Its needle is made from a thread of spacetime itself', icon: '🧭', bonusType: 'explore_bonus', bonusValue: 30 },
  { id: 'art14', name: 'Cosmic Egg', nameZh: '宇宙蛋', rarity: PX_RARITY_LEGENDARY, description: 'An egg containing a nascent universe, waiting to hatch', lore: 'If it hatches, a new reality will be born within the nest', icon: '🥚', bonusType: 'all_hatch', bonusValue: 10 },
  { id: 'art15', name: 'Phoenix Throne Fragment', nameZh: '凤凰王座碎片', rarity: PX_RARITY_LEGENDARY, description: 'A fragment of the Divine Phoenix Throne, radiating ultimate power', lore: 'Reuniting all fragments would grant godlike authority over all phoenixes', icon: '🪑', bonusType: 'all_bonuses', bonusValue: 15 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Nest Events (12)
// ═══════════════════════════════════════════════════════════════════════════════

const PX_EVENTS: NestEventDef[] = [
  { id: 'evt01', name: 'Ash Storm', nameZh: '灰烬风暴', description: 'A massive storm of phoenix ash engulfs all nests, depositing rich materials', effectType: 'bonus_materials', effectValue: 50, icon: '💨', probability: 0.15 },
  { id: 'evt02', name: 'Molt Season', nameZh: '换羽季', description: 'All phoenixes molt simultaneously, yielding abundant feathers', effectType: 'bonus_feathers', effectValue: 30, icon: '🪶', probability: 0.15 },
  { id: 'evt03', name: 'Wildfire Blaze', nameZh: '野火', description: 'A wildfire threatens the nests — must be defended', effectType: 'damage_nests', effectValue: -20, icon: '🔥', probability: 0.10 },
  { id: 'evt04', name: 'Celestial Alignment', nameZh: '天体排列', description: 'The stars align, boosting hatch chances for all eggs', effectType: 'boost_hatch', effectValue: 25, icon: '⭐', probability: 0.08 },
  { id: 'evt05', name: 'Void Intrusion', nameZh: '虚空入侵', description: 'Dimensional rifts open, threatening nest stability', effectType: 'damage_nests', effectValue: -15, icon: '🌀', probability: 0.10 },
  { id: 'evt06', name: 'Blessed Dawn', nameZh: '神圣黎明', description: 'A holy dawn illuminates all nests, boosting comfort and morale', effectType: 'boost_comfort', effectValue: 30, icon: '🌅', probability: 0.10 },
  { id: 'evt07', name: 'Egg Discovery', nameZh: '蛋之发现', description: 'A clutch of mysterious eggs is discovered near the nests', effectType: 'free_eggs', effectValue: 3, icon: '🥚', probability: 0.08 },
  { id: 'evt08', name: 'Rebirth Wave', nameZh: '重生浪潮', description: 'A wave of rebirth energy sweeps through, triggering mass rebirths', effectType: 'trigger_rebirths', effectValue: 2, icon: '🕊️', probability: 0.05 },
  { id: 'evt09', name: 'Frozen Cataclysm', nameZh: '冰冻灾变', description: 'An unnatural deep freeze threatens ice phoenix eggs', effectType: 'damage_nests', effectValue: -25, icon: '❄️', probability: 0.07 },
  { id: 'evt10', name: 'Cosmic Shower', nameZh: '宇宙星雨', description: 'A shower of cosmic stardust enriches all materials with cosmic energy', effectType: 'upgrade_materials', effectValue: 20, icon: '🌌', probability: 0.06 },
  { id: 'evt11', name: 'Shadow Eclipse', nameZh: '暗影蚀', description: 'A shadow eclipse darkens the nests, hiding some phoenixes temporarily', effectType: 'hide_phoenixes', effectValue: 3, icon: '🌑', probability: 0.06 },
  { id: 'evt12', name: 'Grand Rebirth Festival', nameZh: '大重生节', description: 'The grandest event — all nests celebrate with massive bonuses', effectType: 'festival_bonuses', effectValue: 50, icon: '🎉', probability: 0.02 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function pxGenerateLogId(): string {
  return `pxlog_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function pxCreateInitialState(): PhoenixNestState {
  const phoenixes: Record<string, PhoenixState> = {};
  for (const px of PX_PHOENIXES) {
    phoenixes[px.id] = {
      hatched: false,
      rebirthCount: 0,
      lastTended: null,
      bondLevel: 0,
      encounterCount: 0,
    };
  }
  const nests: Record<string, NestState> = {};
  for (const nest of PX_NESTS) {
    nests[nest.id] = {
      unlocked: nest.unlockHatched === 0,
      tendCount: 0,
      comfort: nest.unlockHatched === 0 ? 50 : 0,
      currentPhoenixIds: [],
      lastTended: null,
    };
  }
  const structures: Record<string, StructureState> = {};
  for (const str of PX_STRUCTURES) {
    structures[str.id] = { built: false, level: 0 };
  }
  return {
    pxPhoenixes: phoenixes,
    pxNests: nests,
    pxInventory: [],
    pxArtifacts: [],
    pxAchievements: [],
    pxTitle: PX_TITLES[0].id,
    pxEvents: [],
    pxStats: { totalHatched: 0, totalTended: 0, totalRebirths: 0, totalMaterialsGathered: 0 },
    structureStates: structures,
    abilityCooldowns: {},
    eventLog: [],
  };
}

function pxDetermineTitleIndex(totalHatched: number): number {
  let idx = 0;
  for (let i = 0; i < PX_TITLES.length; i++) {
    if (totalHatched >= PX_TITLES[i].minHatched) idx = i;
  }
  return idx;
}

function pxMatchCondition(condition: string, metrics: Record<string, number>): boolean {
  const match = condition.match(/^(\w+)\s*(>=|<=|==|>|<)\s*(\d+)$/);
  if (!match) return false;
  const [, key, op, val] = match;
  const m = metrics[key];
  if (m === undefined) return false;
  const v = parseInt(val, 10);
  if (op === '>=') return m >= v;
  if (op === '<=') return m <= v;
  if (op === '==') return m === v;
  if (op === '>') return m > v;
  if (op === '<') return m < v;
  return false;
}

function pxRollHatchChance(baseChance: number, artifacts: string[]): number {
  let bonus = 0;
  for (const artId of artifacts) {
    const art = PX_ARTIFACTS.find(a => a.id === artId);
    if (!art) continue;
    if (art.bonusType === 'all_hatch') bonus += art.bonusValue;
  }
  return Math.min(0.95, baseChance + bonus / 100);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export default function usePhoenixNest() {
  const [state, setState] = useState<PhoenixNestState>(pxCreateInitialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ─── Action: Hatch Phoenix ────────────────────────────────────────────────

  const hatchPhoenix = useCallback((phoenixId: string): { success: boolean; xpGained: number; message: string } => {
    let success = false;
    let xpGained = 0;
    let message = '';

    setState(prev => {
      const pxDef = PX_PHOENIXES.find(p => p.id === phoenixId);
      if (!pxDef) {
        message = 'Phoenix species not found';
        return prev;
      }

      const pxState = prev.pxPhoenixes[phoenixId];
      if (!pxState) {
        message = 'Phoenix state not found';
        return prev;
      }

      if (pxState.hatched) {
        message = `${pxDef.nameZh} is already hatched`;
        return prev;
      }

      if (prev.pxStats.totalHatched < pxDef.requiredHatched) {
        message = `Need ${pxDef.requiredHatched} hatched phoenixes to encounter ${pxDef.nameZh}`;
        return prev;
      }

      const effectiveChance = pxRollHatchChance(pxDef.hatchChance, prev.pxArtifacts);
      const roll = Math.random();

      if (roll < effectiveChance) {
        success = true;
        xpGained = pxDef.power * (PX_RARITY_MULTIPLIER[pxDef.rarity] ?? 1);
        const newTitleId = PX_TITLES[pxDetermineTitleIndex(prev.pxStats.totalHatched + 1)].id;
        const logEntry = {
          id: pxGenerateLogId(),
          type: 'hatch',
          message: `Successfully hatched ${pxDef.name}!`,
          messageZh: `成功孵化了${pxDef.nameZh}！`,
          timestamp: Date.now(),
        };
        message = `Hatched ${pxDef.nameZh}! +${xpGained} XP`;

        return {
          ...prev,
          pxPhoenixes: {
            ...prev.pxPhoenixes,
            [phoenixId]: {
              ...pxState,
              hatched: true,
              lastTended: Date.now(),
              bondLevel: 1,
              encounterCount: pxState.encounterCount + 1,
            },
          },
          pxStats: {
            ...prev.pxStats,
            totalHatched: prev.pxStats.totalHatched + 1,
          },
          pxTitle: newTitleId,
          eventLog: [...prev.eventLog.slice(-199), logEntry],
        };
      }

      message = `Failed to hatch ${pxDef.nameZh} (chance: ${Math.round(effectiveChance * 100)}%)`;
      return {
        ...prev,
        pxPhoenixes: {
          ...prev.pxPhoenixes,
          [phoenixId]: {
            ...pxState,
            encounterCount: pxState.encounterCount + 1,
          },
        },
        eventLog: [...prev.eventLog.slice(-199), {
          id: pxGenerateLogId(),
          type: 'hatch_fail',
          message: `Failed to hatch ${pxDef.name}`,
          messageZh: `未能孵化${pxDef.nameZh}`,
          timestamp: Date.now(),
        }],
      };
    });

    return { success, xpGained, message };
  }, []);

  // ─── Action: Tend Nest ────────────────────────────────────────────────────

  const tendNest = useCallback((nestId: string): { success: boolean; materialsGained: number; message: string } => {
    let success = false;
    let materialsGained = 0;
    let message = '';

    setState(prev => {
      const nestDef = PX_NESTS.find(n => n.id === nestId);
      if (!nestDef) {
        message = 'Nest not found';
        return prev;
      }

      const nestState = prev.pxNests[nestId];
      if (!nestState) {
        message = 'Nest state not found';
        return prev;
      }

      if (!nestState.unlocked) {
        message = `${nestDef.nameZh} is not unlocked yet`;
        return prev;
      }

      success = true;
      const newComfort = Math.min(100, nestState.comfort + 5);
      const materialCount = 1 + Math.floor(Math.random() * 3);
      materialsGained = materialCount;

      // Find a random material based on nest element
      const eligibleMats = PX_MATERIALS.filter(m => {
        if (nestDef.element === 'all') return true;
        if (nestDef.element === PX_TYPE_FIRE_PHOENIX && (m.category === 'ash' || m.name.includes('Ember') || m.name.includes('Blaze'))) return true;
        if (nestDef.element === PX_TYPE_ICE_PHOENIX && (m.category === 'feather' && m.name.includes('Frost') || m.name.includes('Glacial'))) return true;
        return m.category === 'ash' || m.category === 'feather';
      });

      const newInventory = [...prev.pxInventory];
      for (let i = 0; i < materialCount; i++) {
        const mat = eligibleMats[Math.floor(Math.random() * Math.max(1, eligibleMats.length))];
        const existing = newInventory.find(item => item.materialId === mat.id);
        if (existing) {
          existing.quantity = Math.min(mat.stackSize, existing.quantity + 1);
        } else {
          newInventory.push({ materialId: mat.id, quantity: 1 });
        }
      }

      const logEntry = {
        id: pxGenerateLogId(),
        type: 'tend',
        message: `Tended ${nestDef.name}, gained ${materialCount} materials`,
        messageZh: `照料了${nestDef.nameZh}，获得${materialCount}份材料`,
        timestamp: Date.now(),
      };
      message = `Tended ${nestDef.nameZh}! +${materialCount} materials`;

      return {
        ...prev,
        pxNests: {
          ...prev.pxNests,
          [nestId]: {
            ...nestState,
            tendCount: nestState.tendCount + 1,
            comfort: newComfort,
            lastTended: Date.now(),
          },
        },
        pxInventory: newInventory,
        pxStats: {
          ...prev.pxStats,
          totalTended: prev.pxStats.totalTended + 1,
          totalMaterialsGathered: prev.pxStats.totalMaterialsGathered + materialCount,
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, materialsGained, message };
  }, []);

  // ─── Action: Build Structure ──────────────────────────────────────────────

  const buildStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const strDef = PX_STRUCTURES.find(s => s.id === structureId);
      if (!strDef) {
        message = 'Structure not found';
        return prev;
      }

      const strState = prev.structureStates[structureId];
      if (!strState) {
        message = 'Structure state not found';
        return prev;
      }

      const nextLevel = strState.built ? strState.level + 1 : 1;
      if (nextLevel > strDef.maxLevel) {
        message = `${strDef.nameZh} is already at max level`;
        return prev;
      }

      const cost = strDef.built
        ? Math.floor(strDef.baseCost * Math.pow(strDef.costMultiplier, strState.level))
        : strDef.baseCost;

      // Check if enough ash materials to pay
      const totalAsh = prev.pxInventory
        .filter(item => {
          const mat = PX_MATERIALS.find(m => m.id === item.materialId);
          return mat && mat.category === 'ash';
        })
        .reduce((sum, item) => sum + item.quantity, 0);

      if (totalAsh < cost) {
        message = `Need ${cost} ash materials to build ${strDef.nameZh} (have ${totalAsh})`;
        return prev;
      }

      success = true;
      // Deduct ash materials
      let remaining = cost;
      const newInventory = [...prev.pxInventory];
      for (let i = newInventory.length - 1; i >= 0; i--) {
        if (remaining <= 0) break;
        const item = newInventory[i];
        const mat = PX_MATERIALS.find(m => m.id === item.materialId);
        if (!mat || mat.category !== 'ash') continue;
        const used = Math.min(item.quantity, remaining);
        item.quantity -= used;
        remaining -= used;
        if (item.quantity <= 0) {
          newInventory.splice(i, 1);
        }
      }

      const logEntry = {
        id: pxGenerateLogId(),
        type: 'build',
        message: `${strState.built ? 'Upgraded' : 'Built'} ${strDef.name} to level ${nextLevel}`,
        messageZh: `${strState.built ? '升级' : '建造'}了${strDef.nameZh}到${nextLevel}级`,
        timestamp: Date.now(),
      };
      message = `${strState.built ? 'Upgraded' : 'Built'} ${strDef.nameZh} to Lv.${nextLevel}!`;

      return {
        ...prev,
        structureStates: {
          ...prev.structureStates,
          [structureId]: { built: true, level: nextLevel },
        },
        pxInventory: newInventory.filter(item => item.quantity > 0),
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Action: Activate Artifact ────────────────────────────────────────────

  const activateArtifact = useCallback((artifactId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const artDef = PX_ARTIFACTS.find(a => a.id === artifactId);
      if (!artDef) {
        message = 'Artifact not found';
        return prev;
      }

      if (prev.pxArtifacts.includes(artifactId)) {
        message = `${artDef.nameZh} is already activated`;
        return prev;
      }

      // Check if enough rare/epic materials
      const rareMats = prev.pxInventory.filter(item => {
        const mat = PX_MATERIALS.find(m => m.id === item.materialId);
        return mat && (mat.rarity === PX_RARITY_RARE || mat.rarity === PX_RARITY_EPIC);
      });
      const totalRareValue = rareMats.reduce((sum, item) => {
        const mat = PX_MATERIALS.find(m => m.id === item.materialId);
        return sum + (mat ? mat.value * item.quantity : 0);
      }, 0);

      if (totalRareValue < artDef.bonusValue * 5) {
        message = `Need rare materials worth at least ${artDef.bonusValue * 5} to activate ${artDef.nameZh}`;
        return prev;
      }

      success = true;
      const logEntry = {
        id: pxGenerateLogId(),
        type: 'artifact',
        message: `Activated artifact: ${artDef.name}`,
        messageZh: `激活了神器：${artDef.nameZh}`,
        timestamp: Date.now(),
      };
      message = `Activated ${artDef.nameZh}!`;

      return {
        ...prev,
        pxArtifacts: [...prev.pxArtifacts, artifactId],
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Action: Trigger Nest Event ───────────────────────────────────────────

  const triggerNestEvent = useCallback((): { eventId: string; eventName: string; message: string } => {
    let eventId = '';
    let eventName = '';
    let message = '';

    setState(prev => {
      // Weighted random event selection
      const roll = Math.random();
      let cumulative = 0;
      let selected = PX_EVENTS[0];
      for (const evt of PX_EVENTS) {
        cumulative += evt.probability;
        if (roll < cumulative) {
          selected = evt;
          break;
        }
      }

      eventId = selected.id;
      eventName = selected.name;

      const newEvents = prev.pxEvents.includes(selected.id)
        ? prev.pxEvents
        : [...prev.pxEvents, selected.id];

      // Apply event effects
      let newState = { ...prev, pxEvents: newEvents };
      const logEntry = {
        id: pxGenerateLogId(),
        type: 'event',
        message: `Event: ${selected.name} — ${selected.description}`,
        messageZh: `事件：${selected.nameZh} — ${selected.description}`,
        timestamp: Date.now(),
      };

      if (selected.effectType === 'bonus_materials') {
        const mats = PX_MATERIALS.slice(0, Math.min(5, PX_MATERIALS.length));
        const newInventory = [...newState.pxInventory];
        for (const mat of mats) {
          const existing = newInventory.find(item => item.materialId === mat.id);
          if (existing) {
            existing.quantity = Math.min(mat.stackSize, existing.quantity + 2);
          } else {
            newInventory.push({ materialId: mat.id, quantity: 2 });
          }
        }
        newState.pxInventory = newInventory;
        newState.pxStats = { ...newState.pxStats, totalMaterialsGathered: newState.pxStats.totalMaterialsGathered + mats.length * 2 };
        message = `${selected.nameZh}: Gained bonus materials!`;
      } else if (selected.effectType === 'boost_hatch') {
        message = `${selected.nameZh}: Hatch chances boosted!`;
      } else if (selected.effectType === 'boost_comfort') {
        const updatedNests = { ...newState.pxNests };
        for (const nid of Object.keys(updatedNests)) {
          if (updatedNests[nid].unlocked) {
            updatedNests[nid] = { ...updatedNests[nid], comfort: Math.min(100, updatedNests[nid].comfort + selected.effectValue) };
          }
        }
        newState.pxNests = updatedNests;
        message = `${selected.nameZh}: All nest comfort increased!`;
      } else if (selected.effectType === 'damage_nests') {
        const updatedNests = { ...newState.pxNests };
        for (const nid of Object.keys(updatedNests)) {
          if (updatedNests[nid].unlocked) {
            updatedNests[nid] = { ...updatedNests[nid], comfort: Math.max(0, updatedNests[nid].comfort + selected.effectValue) };
          }
        }
        newState.pxNests = updatedNests;
        message = `${selected.nameZh}: Nests damaged! Comfort decreased.`;
      } else {
        message = `${selected.nameZh}: ${selected.description}`;
      }

      return {
        ...newState,
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { eventId, eventName, message };
  }, []);

  // ─── Action: Reset Phoenix Nest ───────────────────────────────────────────

  const resetPhoenixNest = useCallback((): void => {
    setState(pxCreateInitialState);
  }, []);

  // ─── Extended Action: Unlock Nest ─────────────────────────────────────────

  const unlockNest = useCallback((nestId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const nestDef = PX_NESTS.find(n => n.id === nestId);
      if (!nestDef) {
        message = 'Nest not found';
        return prev;
      }

      const nestState = prev.pxNests[nestId];
      if (!nestState) {
        message = 'Nest state not found';
        return prev;
      }

      if (nestState.unlocked) {
        message = `${nestDef.nameZh} is already unlocked`;
        return prev;
      }

      if (prev.pxStats.totalHatched < nestDef.unlockHatched) {
        message = `Need ${nestDef.unlockHatched} hatched phoenixes to unlock ${nestDef.nameZh}`;
        return prev;
      }

      success = true;
      const logEntry = {
        id: pxGenerateLogId(),
        type: 'unlock',
        message: `Unlocked nest: ${nestDef.name}`,
        messageZh: `解锁了巢穴：${nestDef.nameZh}`,
        timestamp: Date.now(),
      };
      message = `Unlocked ${nestDef.nameZh}!`;

      return {
        ...prev,
        pxNests: {
          ...prev.pxNests,
          [nestId]: {
            ...nestState,
            unlocked: true,
            comfort: 50,
          },
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Extended Action: Feed Phoenix (tend bond) ────────────────────────────

  const feedPhoenix = useCallback((phoenixId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const pxDef = PX_PHOENIXES.find(p => p.id === phoenixId);
      if (!pxDef) {
        message = 'Phoenix not found';
        return prev;
      }

      const pxState = prev.pxPhoenixes[phoenixId];
      if (!pxState || !pxState.hatched) {
        message = `${pxDef.nameZh} has not been hatched yet`;
        return prev;
      }

      const maxBond = 10 + (PX_RARITY_MULTIPLIER[pxDef.rarity] ?? 1) * 5;
      if (pxState.bondLevel >= maxBond) {
        message = `${pxDef.nameZh} is already at maximum bond level`;
        return prev;
      }

      success = true;
      const newBond = pxState.bondLevel + 1;
      const logEntry = {
        id: pxGenerateLogId(),
        type: 'feed',
        message: `Bonded with ${pxDef.name}, bond level ${newBond}`,
        messageZh: `与${pxDef.nameZh}建立了羁绊，等级${newBond}`,
        timestamp: Date.now(),
      };
      message = `Bonded with ${pxDef.nameZh}! Level ${newBond}`;

      return {
        ...prev,
        pxPhoenixes: {
          ...prev.pxPhoenixes,
          [phoenixId]: {
            ...pxState,
            bondLevel: newBond,
            lastTended: Date.now(),
          },
        },
        pxStats: {
          ...prev.pxStats,
          totalTended: prev.pxStats.totalTended + 1,
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Extended Action: Assign Phoenix to Nest ─────────────────────────────

  const assignPhoenixToNest = useCallback((phoenixId: string, nestId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const pxDef = PX_PHOENIXES.find(p => p.id === phoenixId);
      const nestDef = PX_NESTS.find(n => n.id === nestId);
      if (!pxDef || !nestDef) {
        message = 'Phoenix or nest not found';
        return prev;
      }

      const pxState = prev.pxPhoenixes[phoenixId];
      const nestState = prev.pxNests[nestId];
      if (!pxState || !nestState || !pxState.hatched || !nestState.unlocked) {
        message = 'Cannot assign — phoenix not hatched or nest not unlocked';
        return prev;
      }

      if (nestState.currentPhoenixIds.length >= nestDef.capacity) {
        message = `${nestDef.nameZh} is at full capacity`;
        return prev;
      }

      if (nestState.currentPhoenixIds.includes(phoenixId)) {
        message = `${pxDef.nameZh} is already in ${nestDef.nameZh}`;
        return prev;
      }

      success = true;
      // Remove from all other nests first
      const updatedNests = { ...prev.pxNests };
      for (const nid of Object.keys(updatedNests)) {
        if (updatedNests[nid].currentPhoenixIds.includes(phoenixId)) {
          updatedNests[nid] = {
            ...updatedNests[nid],
            currentPhoenixIds: updatedNests[nid].currentPhoenixIds.filter(id => id !== phoenixId),
          };
        }
      }
      updatedNests[nestId] = {
        ...updatedNests[nestId],
        currentPhoenixIds: [...updatedNests[nestId].currentPhoenixIds, phoenixId],
      };

      const logEntry = {
        id: pxGenerateLogId(),
        type: 'assign',
        message: `Assigned ${pxDef.name} to ${nestDef.name}`,
        messageZh: `将${pxDef.nameZh}分配到${nestDef.nameZh}`,
        timestamp: Date.now(),
      };
      message = `Assigned ${pxDef.nameZh} to ${nestDef.nameZh}!`;

      return {
        ...prev,
        pxNests: updatedNests,
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Extended Action: Gather Materials from Nest ──────────────────────────

  const gatherNestMaterials = useCallback((nestId: string): { success: boolean; materialsGained: number; message: string } => {
    let success = false;
    let materialsGained = 0;
    let message = '';

    setState(prev => {
      const nestDef = PX_NESTS.find(n => n.id === nestId);
      if (!nestDef) {
        message = 'Nest not found';
        return prev;
      }

      const nestState = prev.pxNests[nestId];
      if (!nestState || !nestState.unlocked) {
        message = `${nestDef.nameZh} is not unlocked`;
        return prev;
      }

      if (nestState.currentPhoenixIds.length === 0) {
        message = `${nestDef.nameZh} has no phoenixes assigned`;
        return prev;
      }

      success = true;
      const phoenixBonus = nestState.currentPhoenixIds.length;
      const count = 2 + Math.floor(Math.random() * 3) + phoenixBonus;
      materialsGained = count;

      // Gather materials based on assigned phoenix types
      const types = new Set(
        nestState.currentPhoenixIds.map(id => {
          const px = PX_PHOENIXES.find(p => p.id === id);
          return px?.type;
        }).filter(Boolean)
      );

      const eligibleMats = PX_MATERIALS.filter(m => {
        for (const t of types) {
          if (t === PX_TYPE_FIRE_PHOENIX && m.name.includes('Ember') || m.name.includes('Blaze') || m.name.includes('Flame')) return true;
          if (t === PX_TYPE_ICE_PHOENIX && (m.name.includes('Frost') || m.name.includes('Glacial') || m.name.includes('Ice'))) return true;
          if (t === PX_TYPE_STORM_PHOENIX && (m.name.includes('Thunder') || m.name.includes('Storm'))) return true;
          if (t === PX_TYPE_SHADOW_PHOENIX && (m.name.includes('Shadow') || m.name.includes('Eclipse'))) return true;
          if (t === PX_TYPE_HOLY_PHOENIX && (m.name.includes('Holy') || m.name.includes('Seraph') || m.name.includes('Golden'))) return true;
          if (t === PX_TYPE_VOID_PHOENIX && (m.name.includes('Void') || m.name.includes('Rift'))) return true;
          if (t === PX_TYPE_COSMIC_PHOENIX && (m.name.includes('Cosmic') || m.name.includes('Nebula') || m.name.includes('Supernova'))) return true;
        }
        return m.category === 'ash';
      });

      const newInventory = [...prev.pxInventory];
      for (let i = 0; i < count; i++) {
        const mat = eligibleMats[Math.floor(Math.random() * Math.max(1, eligibleMats.length))];
        const existing = newInventory.find(item => item.materialId === mat.id);
        if (existing) {
          existing.quantity = Math.min(mat.stackSize, existing.quantity + 1);
        } else {
          newInventory.push({ materialId: mat.id, quantity: 1 });
        }
      }

      message = `Gathered ${count} materials from ${nestDef.nameZh}!`;
      return {
        ...prev,
        pxNests: {
          ...prev.pxNests,
          [nestId]: {
            ...nestState,
            lastTended: Date.now(),
          },
        },
        pxInventory: newInventory,
        pxStats: {
          ...prev.pxStats,
          totalMaterialsGathered: prev.pxStats.totalMaterialsGathered + count,
        },
        eventLog: [...prev.eventLog.slice(-199), {
          id: pxGenerateLogId(),
          type: 'gather',
          message: `Gathered ${count} materials from ${nestDef.name}`,
          messageZh: `从${nestDef.nameZh}采集了${count}份材料`,
          timestamp: Date.now(),
        }],
      };
    });

    return { success, materialsGained, message };
  }, []);

  // ─── Extended Action: Trigger Rebirth ─────────────────────────────────────

  const triggerRebirth = useCallback((phoenixId: string): { success: boolean; powerGained: number; message: string } => {
    let success = false;
    let powerGained = 0;
    let message = '';

    setState(prev => {
      const pxDef = PX_PHOENIXES.find(p => p.id === phoenixId);
      if (!pxDef) {
        message = 'Phoenix not found';
        return prev;
      }

      const pxState = prev.pxPhoenixes[phoenixId];
      if (!pxState || !pxState.hatched) {
        message = `${pxDef.nameZh} has not been hatched`;
        return prev;
      }

      success = true;
      powerGained = pxDef.rebirthPower + pxState.rebirthCount * 10;
      const logEntry = {
        id: pxGenerateLogId(),
        type: 'rebirth',
        message: `${pxDef.name} has been reborn! Power +${powerGained}`,
        messageZh: `${pxDef.nameZh}已完成重生！力量 +${powerGained}`,
        timestamp: Date.now(),
      };
      message = `${pxDef.nameZh} reborn! +${powerGained} power`;

      return {
        ...prev,
        pxPhoenixes: {
          ...prev.pxPhoenixes,
          [phoenixId]: {
            ...pxState,
            rebirthCount: pxState.rebirthCount + 1,
            lastTended: Date.now(),
          },
        },
        pxStats: {
          ...prev.pxStats,
          totalRebirths: prev.pxStats.totalRebirths + 1,
        },
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, powerGained, message };
  }, []);

  // ─── Extended Action: Check and Claim Achievements ────────────────────────

  const checkAndClaimAchievements = useCallback(() => {
    setState(prev => {
      const metrics: Record<string, number> = {
        totalHatched: prev.pxStats.totalHatched,
        totalTended: prev.pxStats.totalTended,
        totalRebirths: prev.pxStats.totalRebirths,
        totalMaterials: prev.pxStats.totalMaterialsGathered,
        structuresBuilt: Object.values(prev.structureStates).filter(s => s.built).length,
        maxStructureLevel: Math.max(0, ...Object.values(prev.structureStates).map(s => s.level)),
        nestsUnlocked: Object.values(prev.pxNests).filter(n => n.unlocked).length,
        artifactsActivated: prev.pxArtifacts.length,
        eventsTriggered: prev.pxEvents.length,
        rareHatched: Object.entries(prev.pxPhoenixes).filter(([id, s]) => {
          if (!s.hatched) return false;
          const def = PX_PHOENIXES.find(p => p.id === id);
          return def && (def.rarity === PX_RARITY_RARE || def.rarity === PX_RARITY_EPIC || def.rarity === PX_RARITY_LEGENDARY);
        }).length,
        epicHatched: Object.entries(prev.pxPhoenixes).filter(([id, s]) => {
          if (!s.hatched) return false;
          const def = PX_PHOENIXES.find(p => p.id === id);
          return def && (def.rarity === PX_RARITY_EPIC || def.rarity === PX_RARITY_LEGENDARY);
        }).length,
        legendaryHatched: Object.entries(prev.pxPhoenixes).filter(([id, s]) => {
          if (!s.hatched) return false;
          const def = PX_PHOENIXES.find(p => p.id === id);
          return def && def.rarity === PX_RARITY_LEGENDARY;
        }).length,
        uniqueTypes: new Set(
          Object.entries(prev.pxPhoenixes)
            .filter(([, s]) => s.hatched)
            .map(([id]) => PX_PHOENIXES.find(p => p.id === id)?.type)
            .filter(Boolean)
        ).size,
        titleIndex: PX_TITLES.findIndex(t => t.id === prev.pxTitle),
      };

      const newAchs = PX_ACHIEVEMENTS
        .filter(ach => !prev.pxAchievements.includes(ach.id))
        .filter(ach => pxMatchCondition(ach.condition, metrics))
        .map(ach => ach.id);

      if (newAchs.length === 0) return prev;

      const logs = newAchs.map(achId => {
        const ach = PX_ACHIEVEMENTS.find(a => a.id === achId);
        return {
          id: pxGenerateLogId(),
          type: 'achievement' as const,
          message: `Achievement unlocked: ${ach?.name ?? achId}`,
          messageZh: `解锁成就：${ach?.nameZh ?? achId}`,
          timestamp: Date.now(),
        };
      });

      return {
        ...prev,
        pxAchievements: [...prev.pxAchievements, ...newAchs],
        eventLog: [...prev.eventLog.slice(-199), ...logs],
      };
    });
  }, []);

  // ─── Extended Action: Use Ability ─────────────────────────────────────────

  const useAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    let success = false;
    let message = '';

    setState(prev => {
      const abDef = PX_ABILITIES.find(a => a.id === abilityId);
      if (!abDef) {
        message = 'Ability not found';
        return prev;
      }

      const cooldownEnd = prev.abilityCooldowns[abilityId] ?? 0;
      if (Date.now() < cooldownEnd) {
        message = `${abDef.nameZh} is on cooldown`;
        return prev;
      }

      success = true;
      const newCooldowns = { ...prev.abilityCooldowns, [abilityId]: Date.now() + abDef.cooldown * 60000 };

      const logEntry = {
        id: pxGenerateLogId(),
        type: 'ability',
        message: `Used ability: ${abDef.name}`,
        messageZh: `使用了技能：${abDef.nameZh}`,
        timestamp: Date.now(),
      };
      message = `Used ${abDef.nameZh}!`;

      return {
        ...prev,
        abilityCooldowns: newCooldowns,
        eventLog: [...prev.eventLog.slice(-199), logEntry],
      };
    });

    return { success, message };
  }, []);

  // ─── Auto-check achievements after stat changes ───────────────────────────

  useEffect(() => {
    checkAndClaimAchievements();
  }, [state.pxStats, checkAndClaimAchievements]);

  // ─── Computed: Current Title Info ─────────────────────────────────────────

  const currentTitleInfo = useMemo(() => {
    const idx = PX_TITLES.findIndex(t => t.id === state.pxTitle);
    if (idx >= 0) return PX_TITLES[idx];
    return PX_TITLES[0];
  }, [state.pxTitle]);

  const nextTitleInfo = useMemo(() => {
    const currentIdx = PX_TITLES.findIndex(t => t.id === state.pxTitle);
    if (currentIdx < PX_TITLES.length - 1) {
      return PX_TITLES[currentIdx + 1];
    }
    return null;
  }, [state.pxTitle]);

  // ─── Computed: Stats Summary ──────────────────────────────────────────────

  const statsSummary = useMemo(() => {
    const hatchedCount = Object.values(state.pxPhoenixes).filter(p => p.hatched).length;
    const unlockedNests = Object.values(state.pxNests).filter(n => n.unlocked).length;
    const builtStructures = Object.values(state.structureStates).filter(s => s.built).length;
    const maxStructureLevel = Math.max(0, ...Object.values(state.structureStates).map(s => s.level));
    const totalInventoryItems = state.pxInventory.reduce((sum, item) => sum + item.quantity, 0);
    const maxBond = Math.max(0, ...Object.values(state.pxPhoenixes).map(p => p.bondLevel));
    const rareHatched = Object.entries(state.pxPhoenixes).filter(([id, p]) => {
      if (!p.hatched) return false;
      const def = PX_PHOENIXES.find(ph => ph.id === id);
      return def && (def.rarity === PX_RARITY_RARE || def.rarity === PX_RARITY_EPIC || def.rarity === PX_RARITY_LEGENDARY);
    }).length;
    const legendaryHatched = Object.entries(state.pxPhoenixes).filter(([id, p]) => {
      if (!p.hatched) return false;
      const def = PX_PHOENIXES.find(ph => ph.id === id);
      return def && def.rarity === PX_RARITY_LEGENDARY;
    }).length;
    const uniqueTypes = new Set(
      Object.entries(state.pxPhoenixes)
        .filter(([, s]) => s.hatched)
        .map(([id]) => PX_PHOENIXES.find(p => p.id === id)?.type)
        .filter(Boolean)
    ).size;
    const titleIndex = PX_TITLES.findIndex(t => t.id === state.pxTitle);

    return {
      totalHatched: state.pxStats.totalHatched,
      hatchedCount,
      unlockedNests,
      builtStructures,
      maxStructureLevel,
      totalInventoryItems,
      maxBond,
      rareHatched,
      legendaryHatched,
      totalTended: state.pxStats.totalTended,
      totalRebirths: state.pxStats.totalRebirths,
      totalMaterialsGathered: state.pxStats.totalMaterialsGathered,
      artifactsActivated: state.pxArtifacts.length,
      eventsTriggered: state.pxEvents.length,
      achievementsUnlocked: state.pxAchievements.length,
      achievementsTotal: PX_ACHIEVEMENTS.length,
      uniqueTypes,
      titleIndex,
      inventoryUnique: state.pxInventory.length,
    };
  }, [state]);

  // ─── Computed: Pending Achievements ───────────────────────────────────────

  const pendingAchievements = useMemo(() => {
    const metrics: Record<string, number> = {
      totalHatched: state.pxStats.totalHatched,
      totalTended: state.pxStats.totalTended,
      totalRebirths: state.pxStats.totalRebirths,
      totalMaterials: state.pxStats.totalMaterialsGathered,
      structuresBuilt: Object.values(state.structureStates).filter(s => s.built).length,
      maxStructureLevel: Math.max(0, ...Object.values(state.structureStates).map(s => s.level)),
      nestsUnlocked: Object.values(state.pxNests).filter(n => n.unlocked).length,
      artifactsActivated: state.pxArtifacts.length,
      eventsTriggered: state.pxEvents.length,
      rareHatched: Object.entries(state.pxPhoenixes).filter(([id, p]) => {
        if (!p.hatched) return false;
        const def = PX_PHOENIXES.find(ph => ph.id === id);
        return def && (def.rarity === PX_RARITY_RARE || def.rarity === PX_RARITY_EPIC || def.rarity === PX_RARITY_LEGENDARY);
      }).length,
      epicHatched: Object.entries(state.pxPhoenixes).filter(([id, p]) => {
        if (!p.hatched) return false;
        const def = PX_PHOENIXES.find(ph => ph.id === id);
        return def && (def.rarity === PX_RARITY_EPIC || def.rarity === PX_RARITY_LEGENDARY);
      }).length,
      legendaryHatched: Object.entries(state.pxPhoenixes).filter(([id, p]) => {
        if (!p.hatched) return false;
        const def = PX_PHOENIXES.find(ph => ph.id === id);
        return def && def.rarity === PX_RARITY_LEGENDARY;
      }).length,
      uniqueTypes: new Set(
        Object.entries(state.pxPhoenixes)
          .filter(([, s]) => s.hatched)
          .map(([id]) => PX_PHOENIXES.find(p => p.id === id)?.type)
          .filter(Boolean)
      ).size,
      titleIndex: PX_TITLES.findIndex(t => t.id === state.pxTitle),
    };

    return PX_ACHIEVEMENTS
      .filter(ach => !state.pxAchievements.includes(ach.id))
      .filter(ach => pxMatchCondition(ach.condition, metrics))
      .map(ach => ({
        ...ach,
        rarityColor: PX_RARITY_COLORS[PX_RARITY_COMMON],
      }));
  }, [state]);

  // ─── Computed: Enriched Phoenixes ─────────────────────────────────────────

  const enrichedPhoenixes = useMemo(() => {
    return PX_PHOENIXES.map(def => {
      const pxState = state.pxPhoenixes[def.id];
      return {
        ...def,
        hatched: pxState?.hatched ?? false,
        rebirthCount: pxState?.rebirthCount ?? 0,
        bondLevel: pxState?.bondLevel ?? 0,
        encounterCount: pxState?.encounterCount ?? 0,
        effectiveHatchChance: pxRollHatchChance(def.hatchChance, state.pxArtifacts),
        typeColor: PX_TYPE_COLORS[def.type] ?? '#888888',
        typeIcon: PX_TYPE_ICONS[def.type] ?? '🪶',
        rarityColor: PX_RARITY_COLORS[def.rarity] ?? '#888888',
      };
    });
  }, [state.pxPhoenixes, state.pxArtifacts]);

  // ─── Computed: Enriched Nests ─────────────────────────────────────────────

  const enrichedNests = useMemo(() => {
    return PX_NESTS.map(def => {
      const nestState = state.pxNests[def.id];
      return {
        ...def,
        unlocked: nestState?.unlocked ?? false,
        tendCount: nestState?.tendCount ?? 0,
        comfort: nestState?.comfort ?? 0,
        currentPhoenixIds: nestState?.currentPhoenixIds ?? [],
        elementColor: PX_TYPE_COLORS[def.element] ?? '#888888',
      };
    });
  }, [state.pxNests]);

  // ─── Computed: Enriched Structures ────────────────────────────────────────

  const enrichedStructures = useMemo(() => {
    return PX_STRUCTURES.map(def => {
      const strState = state.structureStates[def.id];
      return {
        ...def,
        built: strState?.built ?? false,
        level: strState?.level ?? 0,
        upgradeCost: def.built
          ? Math.floor(def.baseCost * Math.pow(def.costMultiplier, strState?.level ?? 0))
          : def.baseCost,
      };
    });
  }, [state.structureStates]);

  // ─── Computed: Enriched Inventory ─────────────────────────────────────────

  const enrichedInventory = useMemo(() => {
    return state.pxInventory.map(item => {
      const matDef = PX_MATERIALS.find(m => m.id === item.materialId);
      return {
        materialId: item.materialId,
        quantity: item.quantity,
        name: matDef?.name ?? 'Unknown',
        nameZh: matDef?.nameZh ?? '未知',
        icon: matDef?.icon ?? '❓',
        category: matDef?.category ?? 'unknown',
        rarity: matDef?.rarity ?? PX_RARITY_COMMON,
        rarityColor: PX_RARITY_COLORS[matDef?.rarity ?? PX_RARITY_COMMON] ?? '#888888',
        value: matDef?.value ?? 0,
      };
    });
  }, [state.pxInventory]);

  // ─── Computed: Enriched Artifacts ─────────────────────────────────────────

  const enrichedArtifacts = useMemo(() => {
    return PX_ARTIFACTS.map(art => ({
      ...art,
      activated: state.pxArtifacts.includes(art.id),
      rarityColor: PX_RARITY_COLORS[art.rarity] ?? '#888888',
    }));
  }, [state.pxArtifacts]);

  // ─── Computed: Phoenixes by Type ──────────────────────────────────────────

  const phoenixesByType = useMemo(() => {
    const map: Record<string, typeof enrichedPhoenixes> = {};
    for (const px of enrichedPhoenixes) {
      if (!map[px.type]) map[px.type] = [];
      map[px.type].push(px);
    }
    return map;
  }, [enrichedPhoenixes]);

  const phoenixesByRarity = useMemo(() => {
    const map: Record<string, typeof enrichedPhoenixes> = {};
    for (const px of enrichedPhoenixes) {
      if (!map[px.rarity]) map[px.rarity] = [];
      map[px.rarity].push(px);
    }
    return map;
  }, [enrichedPhoenixes]);

  // ─── Computed: Completion Stats ───────────────────────────────────────────

  const completionStats = useMemo(() => {
    return {
      phoenixes: Math.round((statsSummary.hatchedCount / PX_PHOENIXES.length) * 100),
      nests: Math.round((statsSummary.unlockedNests / PX_NESTS.length) * 100),
      artifacts: Math.round((statsSummary.artifactsActivated / PX_ARTIFACTS.length) * 100),
      achievements: Math.round((statsSummary.achievementsUnlocked / PX_ACHIEVEMENTS.length) * 100),
      events: Math.round((statsSummary.eventsTriggered / PX_EVENTS.length) * 100),
      overall: Math.round(
        (
          (statsSummary.hatchedCount / PX_PHOENIXES.length) +
          (statsSummary.unlockedNests / PX_NESTS.length) +
          (statsSummary.artifactsActivated / PX_ARTIFACTS.length) +
          (statsSummary.achievementsUnlocked / PX_ACHIEVEMENTS.length) +
          (statsSummary.eventsTriggered / PX_EVENTS.length)
        ) / 5 * 100
      ),
    };
  }, [statsSummary]);

  // ─── Computed: Recent Event Log ───────────────────────────────────────────

  const recentEventLog = useMemo(() => {
    return state.eventLog.slice(-20).reverse();
  }, [state.eventLog]);

  // ─── Computed: Title Progress ─────────────────────────────────────────────

  const titleProgress = useMemo(() => {
    const currentIdx = PX_TITLES.findIndex(t => t.id === state.pxTitle);
    if (currentIdx >= PX_TITLES.length - 1) {
      return { progress: 100, required: PX_TITLES[currentIdx]?.minHatched ?? 0, current: state.pxStats.totalHatched, isMax: true };
    }
    const next = PX_TITLES[currentIdx + 1];
    const prev = PX_TITLES[currentIdx];
    const range = (next?.minHatched ?? 1) - (prev?.minHatched ?? 0);
    const current = state.pxStats.totalHatched - (prev?.minHatched ?? 0);
    return { progress: Math.min(100, Math.round((current / Math.max(1, range)) * 100)), required: next?.minHatched ?? 0, current: state.pxStats.totalHatched, isMax: false };
  }, [state.pxTitle, state.pxStats.totalHatched]);

  // ─── Computed: Artifact Bonuses ───────────────────────────────────────────

  const artifactBonuses = useMemo(() => {
    const bonuses: Record<string, number> = {};
    for (const artId of state.pxArtifacts) {
      const art = PX_ARTIFACTS.find(a => a.id === artId);
      if (!art) continue;
      bonuses[art.bonusType] = (bonuses[art.bonusType] ?? 0) + art.bonusValue;
    }
    return bonuses;
  }, [state.pxArtifacts]);

  // ─── Computed: Structures by Category ──────────────────────────────────────

  const structuresByCategory = useMemo(() => {
    const map: Record<string, typeof enrichedStructures> = {};
    for (const str of enrichedStructures) {
      if (!map[str.category]) map[str.category] = [];
      map[str.category].push(str);
    }
    return map;
  }, [enrichedStructures]);

  // ─── Computed: Materials by Category ──────────────────────────────────────

  const materialsByCategory = useMemo(() => {
    const map: Record<string, MaterialDef[]> = {};
    for (const mat of PX_MATERIALS) {
      if (!map[mat.category]) map[mat.category] = [];
      map[mat.category].push(mat);
    }
    return map;
  }, []);

  // ─── Computed: Abilities by Category ──────────────────────────────────────

  const abilitiesByCategory = useMemo(() => {
    const map: Record<string, AbilityDef[]> = {};
    for (const ab of PX_ABILITIES) {
      if (!map[ab.category]) map[ab.category] = [];
      map[ab.category].push(ab);
    }
    return map;
  }, []);

  // ─── Computed: Inventory with Material Details ────────────────────────────

  const inventoryWithDetails = useMemo(() => {
    return state.pxInventory.map(item => {
      const matDef = PX_MATERIALS.find(m => m.id === item.materialId);
      return {
        materialId: item.materialId,
        quantity: item.quantity,
        name: matDef?.name ?? 'Unknown',
        nameZh: matDef?.nameZh ?? '未知',
        icon: matDef?.icon ?? '❓',
        category: matDef?.category ?? 'unknown',
        rarity: matDef?.rarity ?? PX_RARITY_COMMON,
        rarityColor: PX_RARITY_COLORS[matDef?.rarity ?? PX_RARITY_COMMON] ?? '#888888',
        value: matDef?.value ?? 0,
        totalValue: (matDef?.value ?? 0) * item.quantity,
      };
    });
  }, [state.pxInventory]);

  // ─── Computed: Total Inventory Value ──────────────────────────────────────

  const totalInventoryValue = useMemo(() => {
    return state.pxInventory.reduce((sum, item) => {
      const mat = PX_MATERIALS.find(m => m.id === item.materialId);
      return sum + (mat?.value ?? 0) * item.quantity;
    }, 0);
  }, [state.pxInventory]);

  // ─── Computed: Enriched Events ────────────────────────────────────────────

  const enrichedEvents = useMemo(() => {
    return PX_EVENTS.map(evt => ({
      ...evt,
      triggered: state.pxEvents.includes(evt.id),
    }));
  }, [state.pxEvents]);

  // ─── Computed: Top Rebirthed Phoenixes ────────────────────────────────────

  const topRebirthedPhoenixes = useMemo(() => {
    return Object.entries(state.pxPhoenixes)
      .filter(([, s]) => s.hatched && s.rebirthCount > 0)
      .map(([id, s]) => {
        const def = PX_PHOENIXES.find(p => p.id === id);
        return {
          id,
          name: def?.name ?? 'Unknown',
          nameZh: def?.nameZh ?? '未知',
          icon: def?.icon ?? '🪶',
          type: def?.type ?? '',
          typeColor: PX_TYPE_COLORS[def?.type ?? ''] ?? '#888888',
          rarityColor: PX_RARITY_COLORS[def?.rarity ?? PX_RARITY_COMMON] ?? '#888888',
          rebirthCount: s.rebirthCount,
          bondLevel: s.bondLevel,
          totalPower: (def?.rebirthPower ?? 0) * s.rebirthCount,
        };
      })
      .sort((a, b) => b.rebirthCount - a.rebirthCount)
      .slice(0, 10);
  }, [state.pxPhoenixes]);

  // ─── Computed: Nest Comfort Summary ───────────────────────────────────────

  const nestComfortSummary = useMemo(() => {
    const entries = Object.entries(state.pxNests)
      .filter(([, s]) => s.unlocked)
      .map(([id, s]) => {
        const def = PX_NESTS.find(n => n.id === id);
        return {
          nestId: id,
          name: def?.name ?? 'Unknown',
          nameZh: def?.nameZh ?? '未知',
          icon: def?.icon ?? '🪹',
          comfort: s.comfort,
          comfortBonus: def?.comfortBonus ?? 0,
          phoenixCount: s.currentPhoenixIds.length,
          capacity: def?.capacity ?? 0,
          tendCount: s.tendCount,
          elementColor: PX_TYPE_COLORS[def?.element ?? ''] ?? '#888888',
        };
      });
    const averageComfort = entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + e.comfort, 0) / entries.length)
      : 0;
    return { nests: entries, averageComfort };
  }, [state.pxNests]);

  // ─── Computed: Power Ranking ──────────────────────────────────────────────

  const powerRanking = useMemo(() => {
    return enrichedPhoenixes
      .filter(px => px.hatched)
      .map(px => ({
        id: px.id,
        name: px.name,
        nameZh: px.nameZh,
        icon: px.icon,
        type: px.type,
        typeColor: px.typeColor,
        rarityColor: px.rarityColor,
        basePower: px.power,
        rebirthBonus: px.rebirthCount * px.rebirthPower,
        bondBonus: px.bondLevel * 5,
        totalPower: px.power + px.rebirthCount * px.rebirthPower + px.bondLevel * 5,
      }))
      .sort((a, b) => b.totalPower - a.totalPower);
  }, [enrichedPhoenixes]);

  // ─── Computed: Events by Type ─────────────────────────────────────────────

  const eventsByEffectType = useMemo(() => {
    const map: Record<string, NestEventDef[]> = {};
    for (const evt of PX_EVENTS) {
      if (!map[evt.effectType]) map[evt.effectType] = [];
      map[evt.effectType].push(evt);
    }
    return map;
  }, []);

  // ─── Computed: Hatching Odds Table ────────────────────────────────────────

  const hatchingOddsTable = useMemo(() => {
    return PX_PHOENIXES.filter(px => {
      const pxState = state.pxPhoenixes[px.id];
      return pxState && !pxState.hatched && state.pxStats.totalHatched >= px.requiredHatched;
    }).map(px => ({
      id: px.id,
      name: px.name,
      nameZh: px.nameZh,
      type: px.type,
      typeColor: PX_TYPE_COLORS[px.type] ?? '#888888',
      typeIcon: PX_TYPE_ICONS[px.type] ?? '🪶',
      rarity: px.rarity,
      rarityColor: PX_RARITY_COLORS[px.rarity] ?? '#888888',
      baseChance: px.hatchChance,
      effectiveChance: pxRollHatchChance(px.hatchChance, state.pxArtifacts),
      encounterCount: state.pxPhoenixes[px.id]?.encounterCount ?? 0,
      power: px.power,
    })).sort((a, b) => b.effectiveChance - a.effectiveChance);
  }, [state.pxPhoenixes, state.pxStats.totalHatched, state.pxArtifacts]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RETURNED pxAPI
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    // ─── Raw State ───
    state,

    // ─── PX Constants (Pattern A: directly on API object) ───
    PX_PHOENIXES,
    PX_NESTS,
    PX_MATERIALS,
    PX_STRUCTURES,
    PX_ABILITIES,
    PX_ACHIEVEMENTS,
    PX_ARTIFACTS,
    PX_EVENTS,
    PX_TITLES,
    PX_TYPE_COLORS,
    PX_TYPE_ICONS,
    PX_RARITY_COLORS,
    PX_RARITY_LABELS,
    PX_RARITY_MULTIPLIER,
    PX_RARITY_COMMON,
    PX_RARITY_UNCOMMON,
    PX_RARITY_RARE,
    PX_RARITY_EPIC,
    PX_RARITY_LEGENDARY,
    PX_TYPE_FIRE_PHOENIX,
    PX_TYPE_ICE_PHOENIX,
    PX_TYPE_STORM_PHOENIX,
    PX_TYPE_SHADOW_PHOENIX,
    PX_TYPE_HOLY_PHOENIX,
    PX_TYPE_VOID_PHOENIX,
    PX_TYPE_COSMIC_PHOENIX,
    PX_COLOR_FIRE,
    PX_COLOR_ICE,
    PX_COLOR_STORM,
    PX_COLOR_COSMIC,
    PX_COLOR_SHADOW,
    PX_COLOR_HOLY,
    PX_COLOR_VOID,
    PX_COLOR_ASH,
    PX_COLOR_EMBER,
    PX_COLOR_FROST,
    PX_COLOR_PLASMA,

    // ─── Core Actions ───
    hatchPhoenix,
    tendNest,
    buildStructure,
    activateArtifact,
    triggerNestEvent,
    resetPhoenixNest,

    // ─── Extended Actions ───
    unlockNest,
    checkAndClaimAchievements,
    useAbility,
    feedPhoenix,
    assignPhoenixToNest,
    gatherNestMaterials,
    triggerRebirth,

    // ─── Title Info ───
    currentTitleInfo,
    nextTitleInfo,
    titleProgress,

    // ─── Stats ───
    statsSummary,
    completionStats,

    // ─── Enriched Data ───
    enrichedPhoenixes,
    enrichedNests,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedEvents,

    // ─── Grouped Data ───
    phoenixesByType,
    phoenixesByRarity,
    structuresByCategory,
    materialsByCategory,
    abilitiesByCategory,
    eventsByEffectType,

    // ─── Inventory Details ───
    inventoryWithDetails,
    totalInventoryValue,

    // ─── Bonuses ───
    artifactBonuses,

    // ─── Rankings & Analysis ───
    topRebirthedPhoenixes,
    nestComfortSummary,
    powerRanking,
    hatchingOddsTable,

    // ─── Log ───
    recentEventLog,

    // ─── Pending ───
    pendingAchievements,
  };
}
