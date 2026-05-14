import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Starwood (星木森林) — Celestial Forest Wire Module
// An ancient enchanted forest where trees grow with starlight,
// creatures are made of cosmic energy, and players discover
// celestial woodcraft secrets while protecting the forest
// from dark corruption.
// ============================================================

// ============================================================
// Types
// ============================================================

type SwRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type SwCreatureBondLevel = 'stranger' | 'acquaintance' | 'friend' | 'companion' | 'soulbound';

type SwRegionWeather = 'starlit' | 'moonbeam' | 'nebula_haze' | 'aurora_glow' | 'comet_storm' | 'eclipse_shadow' | 'cosmic_calm' | 'void_turbulence';

type SwResourceCategory = 'sap' | 'bark' | 'pollen' | 'moss' | 'dust' | 'crystal' | 'gem' | 'thread' | 'ore' | 'ember' | 'resin' | 'silk' | 'essence' | 'pearl' | 'fiber' | 'leaf' | 'root' | 'dew';

type SwStructureCategory = 'habitat' | 'utility' | 'defense' | 'knowledge' | 'spiritual' | 'production';

type SwAbilitySchool = 'starlight' | 'moonbeam' | 'nebula' | 'aurora' | 'eclipse' | 'comet' | 'cosmic' | 'forest';

type SwDailyTaskType = 'befriend' | 'gather' | 'build' | 'purify' | 'explore' | 'ability';

type SwCraftingTier = 'basic' | 'refined' | 'masterwork' | 'celestial';

type SwForestEventType = 'meteor_shower' | 'nebula_bloom' | 'eclipse_passing' | 'aurora_storm' | 'cosmic_convergence' | 'dark_surge';

interface SwCreatureDef {
  id: string;
  name: string;
  rarity: SwRarity;
  regionId: string;
  description: string;
  emoji: string;
  starlightCost: number;
  moonEssenceCost: number;
  befriendChance: number;
  starPower: number;
  ability: string;
  bondThresholds: number[];
}

interface SwRegionDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockAtBefriended: number;
  baseCorruption: number;
  resourceIds: string[];
  creatureIds: string[];
  ambientGlow: string;
}

interface SwResourceDef {
  id: string;
  name: string;
  category: SwResourceCategory;
  rarity: SwRarity;
  regionId: string;
  description: string;
  emoji: string;
  gatherXp: number;
  starlightValue: number;
}

interface SwStructureDef {
  id: string;
  name: string;
  category: SwStructureCategory;
  description: string;
  emoji: string;
  maxLevel: number;
  baseCost: { starlight: number; moonEssence: number };
  costMultiplier: number;
  bonusType: string;
  bonusPerLevel: number;
}

interface SwAbilityDef {
  id: string;
  name: string;
  school: SwAbilitySchool;
  description: string;
  emoji: string;
  cooldown: number;
  cosmicEnergyCost: number;
  unlockAtTitleIndex: number;
  effect: string;
  power: number;
}

interface SwAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardStarlight: number;
  rewardMoonEssence: number;
  emoji: string;
}

interface SwTitleInfo {
  name: string;
  index: number;
  requiredBefriended: number;
  description: string;
}

interface SwColorTheme {
  starlightGold: string;
  deepForestGreen: string;
  cosmicPurple: string;
  moonbeamSilver: string;
  nebulaTeal: string;
}

interface SwCraftRecipeDef {
  id: string;
  name: string;
  tier: SwCraftingTier;
  description: string;
  emoji: string;
  ingredients: { resourceId: string; amount: number }[];
  resultResourceId: string;
  resultAmount: number;
  starlightCost: number;
  moonEssenceCost: number;
  cosmicEnergyCost: number;
  requiredTitleIndex: number;
}

interface SwForestEventDef {
  id: string;
  type: SwForestEventType;
  name: string;
  description: string;
  emoji: string;
  duration: number;
  bonuses: { type: string; value: number }[];
  requirements: { creaturesBefriended: number; titleIndex: number };
}

interface SwCreatureEncounter {
  creatureId: string;
  regionId: string;
  timestamp: number;
  outcome: 'befriended' | 'escaped' | 'visited' | 'fed';
}

interface SwForestEventState {
  active: boolean;
  eventId: string | null;
  startTime: number | null;
  endTime: number | null;
  bonusesApplied: boolean;
}

interface SwCraftingLog {
  recipeId: string;
  timestamp: number;
  success: boolean;
}

interface SwCreatureState {
  befriended: boolean;
  bondLevel: SwCreatureBondLevel;
  bondProgress: number;
  timesVisited: number;
  befriendedAt: number | null;
}

interface SwRegionState {
  discovered: boolean;
  corruptionLevel: number;
  purifyCount: number;
  totalGathered: number;
  timesVisited: number;
  discoveredAt: number | null;
}

interface SwResourceState {
  amount: number;
  totalGathered: number;
}

interface SwStructureState {
  level: number;
  built: boolean;
}

interface SwAbilityState {
  unlocked: boolean;
  cooldownEnd: number;
  totalUses: number;
}

interface SwAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

interface SwDailyTaskState {
  dayKey: string;
  taskType: SwDailyTaskType;
  description: string;
  progress: number;
  target: number;
  rewardStarlight: number;
  rewardMoonEssence: number;
  completed: boolean;
  claimed: boolean;
}

interface SwStarTreeRecord {
  id: string;
  plantedAt: number;
  regionId: string;
  growthStage: number;
  health: number;
  starlightGenerated: number;
}

interface SwAuroraEvent {
  active: boolean;
  startTime: number | null;
  endTime: number | null;
  bonusType: string;
  bonusMultiplier: number;
  totalSummoned: number;
}

interface SwTotals {
  creaturesBefriended: number;
  resourcesGathered: number;
  structuresBuilt: number;
  abilitiesUsed: number;
  corruptionPurified: number;
  starTreesPlanted: number;
  starsRead: number;
  aurorasSummoned: number;
  forestHeals: number;
  dailyTasksCompleted: number;
  regionsExplored: number;
}

interface SwStarwoodState {
  creatures: Record<string, SwCreatureState>;
  regions: Record<string, SwRegionState>;
  resources: Record<string, SwResourceState>;
  structures: Record<string, SwStructureState>;
  abilities: Record<string, SwAbilityState>;
  achievements: Record<string, SwAchievementState>;
  currentRegion: string;
  starlight: number;
  moonEssence: number;
  corruptionLevel: number;
  titleIndex: number;
  forestHealth: number;
  cosmicEnergy: number;
  dailyTask: SwDailyTaskState;
  starTrees: SwStarTreeRecord[];
  auroraEvent: SwAuroraEvent;
  forestEvent: SwForestEventState;
  encounterLog: SwCreatureEncounter[];
  craftingLog: SwCraftingLog[];
  totals: SwTotals;
  seed: number;
}

// ============================================================
// Module-Level Data Definitions (non-exported)
// ============================================================

const SW_CREATURES: SwCreatureDef[] = [
  // Common (7)
  { id: 'starling_fawn', name: 'Starling Fawn', rarity: 'common', regionId: 'starlight_canopy', description: 'A gentle fawn whose spots shimmer like distant stars, born when a falling star touches the forest floor', emoji: '🦌', starlightCost: 5, moonEssenceCost: 2, befriendChance: 0.7, starPower: 3, ability: 'Star Dust Trail', bondThresholds: [10, 30, 60, 100] },
  { id: 'glowfly_spirit', name: 'Glowfly Spirit', rarity: 'common', regionId: 'moonbeam_glade', description: 'Tiny spirits of pure light that dance through moonlit clearings, guiding lost travelers home', emoji: '✨', starlightCost: 5, moonEssenceCost: 3, befriendChance: 0.75, starPower: 2, ability: 'Glow Guidance', bondThresholds: [8, 25, 50, 90] },
  { id: 'moss_hare', name: 'Moss Hare', rarity: 'common', regionId: 'nebula_clearing', description: 'A swift hare covered in soft cosmic moss that allows it to blend perfectly with the forest floor', emoji: '🐇', starlightCost: 4, moonEssenceCost: 2, befriendChance: 0.8, starPower: 2, ability: 'Moss Camouflage', bondThresholds: [8, 22, 45, 80] },
  { id: 'rootling', name: 'Rootling', rarity: 'common', regionId: 'starlight_canopy', description: 'A small elemental being made from intertwined tree roots with glowing amber eyes', emoji: '🌱', starlightCost: 6, moonEssenceCost: 2, befriendChance: 0.7, starPower: 4, ability: 'Root Grasp', bondThresholds: [10, 28, 55, 95] },
  { id: 'bark_beetle', name: 'Bark Beetle', rarity: 'common', regionId: 'aurora_ridge', description: 'Hardworking beetles with shells of living bark that maintain the health of ancient trees', emoji: '🪲', starlightCost: 3, moonEssenceCost: 1, befriendChance: 0.85, starPower: 1, ability: 'Bark Repair', bondThresholds: [6, 18, 40, 70] },
  { id: 'thicket_finch', name: 'Thicket Finch', rarity: 'common', regionId: 'moonbeam_glade', description: 'Musical finches whose songs carry starlight harmonics that make flowers bloom', emoji: '🐦', starlightCost: 5, moonEssenceCost: 2, befriendChance: 0.75, starPower: 2, ability: 'Starlight Song', bondThresholds: [8, 24, 48, 85] },
  { id: 'fern_frog', name: 'Fern Frog', rarity: 'common', regionId: 'nebula_clearing', description: 'A frog with fern-patterned skin that can leap between dimensions of the forest', emoji: '🐸', starlightCost: 4, moonEssenceCost: 2, befriendChance: 0.78, starPower: 3, ability: 'Dimension Hop', bondThresholds: [9, 25, 50, 88] },
  // Uncommon (7)
  { id: 'nebula_fox', name: 'Nebula Fox', rarity: 'uncommon', regionId: 'nebula_clearing', description: 'A clever fox with fur that shifts through cosmic colors like a living nebula painting', emoji: '🦊', starlightCost: 12, moonEssenceCost: 8, befriendChance: 0.45, starPower: 8, ability: 'Nebula Illusion', bondThresholds: [15, 40, 75, 130] },
  { id: 'moonbeam_rabbit', name: 'Moonbeam Rabbit', rarity: 'uncommon', regionId: 'moonbeam_glade', description: 'A rabbit that runs along beams of moonlight, leaving silver trails across the forest', emoji: '🐰', starlightCost: 10, moonEssenceCost: 10, befriendChance: 0.5, starPower: 7, ability: 'Moonbeam Sprint', bondThresholds: [12, 35, 65, 115] },
  { id: 'crystal_squirrel', name: 'Crystal Squirrel', rarity: 'uncommon', regionId: 'aurora_ridge', description: 'A squirrel that hoards crystals instead of nuts, its tail a spray of refracted light', emoji: '🐿️', starlightCost: 12, moonEssenceCost: 7, befriendChance: 0.48, starPower: 9, ability: 'Crystal Scatter', bondThresholds: [14, 38, 70, 120] },
  { id: 'starlight_sparrow', name: 'Starlight Sparrow', rarity: 'uncommon', regionId: 'starlight_canopy', description: 'A sparrow that carries fragments of stars in its feathers, illuminating dark paths', emoji: '🐦', starlightCost: 10, moonEssenceCost: 8, befriendChance: 0.52, starPower: 7, ability: 'Star Fragment Drop', bondThresholds: [13, 36, 68, 118] },
  { id: 'dewdrop_deer', name: 'Dewdrop Deer', rarity: 'uncommon', regionId: 'moonbeam_glade', description: 'A deer whose antlers are made of crystallized morning dew that refracts moonlight', emoji: '🦌', starlightCost: 14, moonEssenceCost: 9, befriendChance: 0.42, starPower: 10, ability: 'Dewdrop Lens', bondThresholds: [16, 42, 78, 135] },
  { id: 'glimmer_moth', name: 'Glimmer Moth', rarity: 'uncommon', regionId: 'comet_trail', description: 'A large moth whose wings shimmer with patterns that foretell cosmic events', emoji: '🦋', starlightCost: 11, moonEssenceCost: 7, befriendChance: 0.5, starPower: 8, ability: 'Cosmic Divination', bondThresholds: [14, 37, 70, 122] },
  { id: 'luminous_newt', name: 'Luminous Newt', rarity: 'uncommon', regionId: 'eclipse_hollow', description: 'A newt that glows with inner starlight, capable of healing wounds with its touch', emoji: '🦎', starlightCost: 13, moonEssenceCost: 8, befriendChance: 0.46, starPower: 9, ability: 'Luminous Heal', bondThresholds: [15, 40, 74, 128] },
  // Rare (7)
  { id: 'cosmic_owl', name: 'Cosmic Owl', rarity: 'rare', regionId: 'starlight_canopy', description: 'An ancient owl with eyes containing entire galaxies, it sees all past and future', emoji: '🦉', starlightCost: 30, moonEssenceCost: 20, befriendChance: 0.25, starPower: 22, ability: 'Cosmic Vision', bondThresholds: [25, 60, 110, 180] },
  { id: 'aurora_wolf', name: 'Aurora Wolf', rarity: 'rare', regionId: 'aurora_ridge', description: 'A majestic wolf wreathed in northern lights that can phase through solid matter', emoji: '🐺', starlightCost: 35, moonEssenceCost: 22, befriendChance: 0.22, starPower: 25, ability: 'Aurora Phase', bondThresholds: [28, 65, 120, 195] },
  { id: 'comet_rabbit', name: 'Comet Rabbit', rarity: 'rare', regionId: 'comet_trail', description: 'A rabbit that rides comets through the sky, leaving trails of stardust behind it', emoji: '🐇', starlightCost: 28, moonEssenceCost: 18, befriendChance: 0.28, starPower: 20, ability: 'Comet Ride', bondThresholds: [22, 55, 100, 170] },
  { id: 'stardust_bear', name: 'Stardust Bear', rarity: 'rare', regionId: 'eclipse_hollow', description: 'A massive bear whose fur is made of condensed stardust, radiating warmth and protection', emoji: '🐻', starlightCost: 32, moonEssenceCost: 24, befriendChance: 0.2, starPower: 28, ability: 'Stardust Shield', bondThresholds: [30, 68, 125, 200] },
  { id: 'prism_butterfly', name: 'Prism Butterfly', rarity: 'rare', regionId: 'nebula_clearing', description: 'A butterfly whose wings are living prisms, splitting light into all colors of existence', emoji: '🦋', starlightCost: 28, moonEssenceCost: 20, befriendChance: 0.26, starPower: 21, ability: 'Prismatic Aura', bondThresholds: [24, 58, 108, 175] },
  { id: 'void_weasel', name: 'Void Weasel', rarity: 'rare', regionId: 'eclipse_hollow', description: 'A weasel that moves through the void between stars, appearing and disappearing at will', emoji: '🦡', starlightCost: 30, moonEssenceCost: 22, befriendChance: 0.23, starPower: 24, ability: 'Void Step', bondThresholds: [26, 62, 115, 188] },
  { id: 'twilight_badger', name: 'Twilight Badger', rarity: 'rare', regionId: 'moonbeam_glade', description: 'A badger that digs tunnels through the twilight dimension, connecting distant parts of the forest', emoji: '🦦', starlightCost: 26, moonEssenceCost: 19, befriendChance: 0.27, starPower: 20, ability: 'Twilight Tunnel', bondThresholds: [22, 54, 100, 168] },
  // Epic (7)
  { id: 'galaxy_stag', name: 'Galaxy Stag', rarity: 'epic', regionId: 'constellation_peak', description: 'The king of all celestial stags — its antlers hold entire spiral galaxies that slowly rotate', emoji: '🦌', starlightCost: 80, moonEssenceCost: 55, befriendChance: 0.1, starPower: 55, ability: 'Galaxy Formation', bondThresholds: [50, 120, 220, 360] },
  { id: 'eclipse_panther', name: 'Eclipse Panther', rarity: 'epic', regionId: 'eclipse_hollow', description: 'A panther made of living shadow that only appears during eclipses, commanding darkness itself', emoji: '🐈‍⬛', starlightCost: 85, moonEssenceCost: 60, befriendChance: 0.08, starPower: 60, ability: 'Total Eclipse', bondThresholds: [55, 130, 240, 390] },
  { id: 'constellation_eagle', name: 'Constellation Eagle', rarity: 'epic', regionId: 'constellation_peak', description: 'An eagle so vast it forms new constellations as it flies across the night sky', emoji: '🦅', starlightCost: 75, moonEssenceCost: 50, befriendChance: 0.12, starPower: 50, ability: 'Constellation Forge', bondThresholds: [45, 110, 200, 340] },
  { id: 'nova_lynx', name: 'Nova Lynx', rarity: 'epic', regionId: 'comet_trail', description: 'A lynx that triggers mini supernovas with each step, leaving blossoms of cosmic fire', emoji: '🐱', starlightCost: 78, moonEssenceCost: 52, befriendChance: 0.11, starPower: 52, ability: 'Nova Burst', bondThresholds: [48, 115, 210, 350] },
  { id: 'quasar_hawk', name: 'Quasar Hawk', rarity: 'epic', regionId: 'aurora_ridge', description: 'A hawk that channels quasar energy into devastating beams of focused starlight', emoji: '🦅', starlightCost: 82, moonEssenceCost: 58, befriendChance: 0.09, starPower: 58, ability: 'Quasar Beam', bondThresholds: [52, 125, 230, 375] },
  { id: 'pulsar_tiger', name: 'Pulsar Tiger', rarity: 'epic', regionId: 'nebula_clearing', description: 'A tiger with stripes that pulse with electromagnetic waves, disrupting all dark magic', emoji: '🐯', starlightCost: 76, moonEssenceCost: 53, befriendChance: 0.1, starPower: 54, ability: 'Pulsar Disruption', bondThresholds: [46, 112, 205, 345] },
  { id: 'supernova_elk', name: 'Supernova Elk', rarity: 'epic', regionId: 'constellation_peak', description: 'An elk whose antlers periodically erupt in controlled supernovas that purify corruption', emoji: '🫎', starlightCost: 88, moonEssenceCost: 62, befriendChance: 0.07, starPower: 65, ability: 'Supernova Purify', bondThresholds: [58, 135, 250, 410] },
  // Legendary (7)
  { id: 'celestial_phoenix', name: 'Celestial Phoenix', rarity: 'legendary', regionId: 'cosmos_heart', description: 'The immortal phoenix born from the first star — it dies and is reborn in cycles of cosmic renewal', emoji: '🔥', starlightCost: 200, moonEssenceCost: 150, befriendChance: 0.03, starPower: 120, ability: 'Cosmic Rebirth', bondThresholds: [100, 250, 450, 750] },
  { id: 'astral_dragon', name: 'Astral Dragon', rarity: 'legendary', regionId: 'cosmos_heart', description: 'A dragon that swims through the astral plane, its scales made of pure crystallized starlight', emoji: '🐉', starlightCost: 220, moonEssenceCost: 160, befriendChance: 0.025, starPower: 130, ability: 'Astral Breath', bondThresholds: [110, 270, 480, 800] },
  { id: 'cosmos_leviathan', name: 'Cosmos Leviathan', rarity: 'legendary', regionId: 'cosmos_heart', description: 'A serpentine creature that coils around entire constellations, keeper of cosmic balance', emoji: '🐍', starlightCost: 250, moonEssenceCost: 180, befriendChance: 0.02, starPower: 150, ability: 'Cosmic Coil', bondThresholds: [120, 300, 520, 880] },
  { id: 'nebula_unicorn', name: 'Nebula Unicorn', rarity: 'legendary', regionId: 'cosmos_heart', description: 'A unicorn woven from nebula dust whose horn channels the raw creative energy of the cosmos', emoji: '🦄', starlightCost: 210, moonEssenceCost: 155, befriendChance: 0.028, starPower: 125, ability: 'Nebula Creation', bondThresholds: [105, 260, 470, 780] },
  { id: 'starlight_colossus', name: 'Starlight Colossus', rarity: 'legendary', regionId: 'constellation_peak', description: 'A massive golem of solidified starlight that serves as the forest\'s ultimate guardian', emoji: '🗿', starlightCost: 240, moonEssenceCost: 170, befriendChance: 0.022, starPower: 140, ability: 'Starlight Fortress', bondThresholds: [115, 285, 500, 850] },
  { id: 'void_titan', name: 'Void Titan', rarity: 'legendary', regionId: 'eclipse_hollow', description: 'A being from beyond the void that chose to protect the forest from interdimensional threats', emoji: '👤', starlightCost: 260, moonEssenceCost: 190, befriendChance: 0.018, starPower: 155, ability: 'Void Domination', bondThresholds: [125, 310, 540, 920] },
  { id: 'aurora_sovereign', name: 'Aurora Sovereign', rarity: 'legendary', regionId: 'aurora_ridge', description: 'The ruler of all aurora phenomena, a being of pure dancing light that bridges worlds', emoji: '🌈', starlightCost: 230, moonEssenceCost: 165, befriendChance: 0.025, starPower: 135, ability: 'Aurora Dominion', bondThresholds: [108, 270, 480, 810] },
];

const SW_REGIONS: SwRegionDef[] = [
  { id: 'starlight_canopy', name: 'Starlight Canopy', description: 'The towering upper canopy where starlight first touches the forest, bathing ancient treetops in golden radiance', emoji: '🌳', unlockAtBefriended: 0, baseCorruption: 5, resourceIds: ['starlight_sap', 'starwood_log', 'stardust_fiber', 'starlight_resin'], creatureIds: ['starling_fawn', 'rootling', 'starlight_sparrow', 'cosmic_owl'], ambientGlow: '#FFD54F' },
  { id: 'moonbeam_glade', name: 'Moonbeam Glade', description: 'A serene clearing where moonbeams converge every night, creating pools of liquid silver light', emoji: '🌙', unlockAtBefriended: 0, baseCorruption: 3, resourceIds: ['moonbeam_bark', 'moonpetal', 'moonstone_pebble', 'moonbeam_silk'], creatureIds: ['glowfly_spirit', 'thicket_finch', 'moonbeam_rabbit', 'dewdrop_deer', 'twilight_badger'], ambientGlow: '#CFD8DC' },
  { id: 'nebula_clearing', name: 'Nebula Clearing', description: 'An open space where nebula clouds descend from the sky, filling the air with swirls of cosmic color', emoji: '🌌', unlockAtBefriended: 3, baseCorruption: 8, resourceIds: ['nebula_pollen', 'nebula_nectar', 'nebula_thread', 'nebula_gem'], creatureIds: ['moss_hare', 'fern_frog', 'nebula_fox', 'prism_butterfly', 'pulsar_tiger'], ambientGlow: '#6A1B9A' },
  { id: 'aurora_ridge', name: 'Aurora Ridge', description: 'A windswept ridge where auroras dance perpetually, painting the sky in ribbons of living light', emoji: '🏔️', unlockAtBefriended: 6, baseCorruption: 10, resourceIds: ['aurora_moss', 'aurora_crystal', 'aurora_leaf', 'aurora_pearl'], creatureIds: ['bark_beetle', 'crystal_squirrel', 'aurora_wolf', 'quasar_hawk', 'aurora_sovereign'], ambientGlow: '#00897B' },
  { id: 'comet_trail', name: 'Comet Trail', description: 'A scorched path through the forest where comets have repeatedly struck, leaving veins of cosmic ore', emoji: '☄️', unlockAtBefriended: 10, baseCorruption: 15, resourceIds: ['comet_dust', 'comet_ash', 'cosmic_seed', 'eclipse_ore'], creatureIds: ['glimmer_moth', 'comet_rabbit', 'nova_lynx'], ambientGlow: '#FF8F00' },
  { id: 'eclipse_hollow', name: 'Eclipse Hollow', description: 'A deep cavern where light is perpetually devoured — home to creatures that thrive in eternal twilight', emoji: '🌑', unlockAtBefriended: 15, baseCorruption: 20, resourceIds: ['eclipse_shard', 'eclipse_ember', 'eclipse_ore', 'star_root'], creatureIds: ['luminous_newt', 'void_weasel', 'stardust_bear', 'eclipse_panther', 'supernova_elk', 'void_titan'], ambientGlow: '#311B92' },
  { id: 'constellation_peak', name: 'Constellation Peak', description: 'The highest point in the forest where the stars seem close enough to touch, and constellations walk the earth', emoji: '⭐', unlockAtBefriended: 22, baseCorruption: 25, resourceIds: ['constellation_fragment', 'galaxy_dew', 'cosmic_bark'], creatureIds: ['galaxy_stag', 'constellation_eagle', 'supernova_elk', 'starlight_colossus'], ambientGlow: '#E1BEE7' },
  { id: 'cosmos_heart', name: 'Cosmos Heart', description: 'The sacred center of the Starwood where all cosmic energy converges — the source of all forest magic', emoji: '💫', unlockAtBefriended: 30, baseCorruption: 30, resourceIds: ['nebula_essence', 'aurora_sap', 'cosmic_bark', 'moon_dew'], creatureIds: ['celestial_phoenix', 'astral_dragon', 'cosmos_leviathan', 'nebula_unicorn'], ambientGlow: '#F48FB1' },
];

const SW_RESOURCES: SwResourceDef[] = [
  // Sap family (3)
  { id: 'starlight_sap', name: 'Starlight Sap', category: 'sap', rarity: 'common', regionId: 'starlight_canopy', description: 'Golden sap that flows from trees bathed in starlight, used in basic celestial crafting', emoji: '🫧', gatherXp: 5, starlightValue: 2 },
  { id: 'aurora_sap', name: 'Aurora Sap', category: 'sap', rarity: 'rare', regionId: 'aurora_ridge', description: 'Iridescent sap that shifts through aurora colors, used in advanced light manipulation', emoji: '🫗', gatherXp: 20, starlightValue: 12 },
  { id: 'nebula_essence', name: 'Nebula Essence', category: 'sap', rarity: 'legendary', regionId: 'cosmos_heart', description: 'The purest distillation of nebula energy, essence of creation itself', emoji: '🔮', gatherXp: 60, starlightValue: 45 },
  // Bark family (3)
  { id: 'moonbeam_bark', name: 'Moonbeam Bark', category: 'bark', rarity: 'common', regionId: 'moonbeam_glade', description: 'Silvery bark from moonbeam trees that provides protection against dark magic', emoji: '🪵', gatherXp: 5, starlightValue: 2 },
  { id: 'cosmic_bark', name: 'Cosmic Bark', category: 'bark', rarity: 'epic', regionId: 'cosmos_heart', description: 'Bark infused with deep cosmic energy, can be shaped into powerful artifacts', emoji: '🪨', gatherXp: 40, starlightValue: 30 },
  { id: 'starwood_log', name: 'Starwood Log', category: 'bark', rarity: 'uncommon', regionId: 'starlight_canopy', description: 'Logs from starwood trees that glow faintly, excellent for building celestial structures', emoji: '🪵', gatherXp: 10, starlightValue: 5 },
  // Pollen & Nectar (3)
  { id: 'nebula_pollen', name: 'Nebula Pollen', category: 'pollen', rarity: 'uncommon', regionId: 'nebula_clearing', description: 'Colorful pollen carried by nebula winds, used in potions that grant cosmic vision', emoji: '🌸', gatherXp: 12, starlightValue: 7 },
  { id: 'nebula_nectar', name: 'Nebula Nectar', category: 'pollen', rarity: 'rare', regionId: 'nebula_clearing', description: 'Sweet nectar collected from nebula-touched flowers, restores cosmic energy', emoji: '🍯', gatherXp: 22, starlightValue: 14 },
  { id: 'moonpetal', name: 'Moonpetal', category: 'pollen', rarity: 'common', regionId: 'moonbeam_glade', description: 'Luminous petals that fall under moonlight, a key ingredient in healing salves', emoji: '💮', gatherXp: 5, starlightValue: 2 },
  // Moss & Leaf (4)
  { id: 'aurora_moss', name: 'Aurora Moss', category: 'moss', rarity: 'uncommon', regionId: 'aurora_ridge', description: 'Soft moss that glows with aurora light, excellent for cushioning and healing', emoji: '🌿', gatherXp: 10, starlightValue: 6 },
  { id: 'aurora_leaf', name: 'Aurora Leaf', category: 'leaf', rarity: 'rare', regionId: 'aurora_ridge', description: 'A single leaf from an aurora tree that contains captured northern light energy', emoji: '🍃', gatherXp: 18, starlightValue: 12 },
  { id: 'star_moss', name: 'Star Moss', category: 'moss', rarity: 'common', regionId: 'starlight_canopy', description: 'Moss that sparkles with embedded star fragments, common on ancient tree trunks', emoji: '✨', gatherXp: 4, starlightValue: 1 },
  { id: 'star_root', name: 'Star Root', category: 'root', rarity: 'epic', regionId: 'eclipse_hollow', description: 'Deep roots from starwood trees that tap directly into cosmic energy veins', emoji: '🫚', gatherXp: 35, starlightValue: 25 },
  // Dust & Ash (4)
  { id: 'comet_dust', name: 'Comet Dust', category: 'dust', rarity: 'uncommon', regionId: 'comet_trail', description: 'Fine dust left behind by passing comets, used to enchant weapons and tools', emoji: '🌠', gatherXp: 12, starlightValue: 7 },
  { id: 'comet_ash', name: 'Comet Ash', category: 'ember', rarity: 'rare', regionId: 'comet_trail', description: 'Ash from burned comet material that smolders with celestial fire', emoji: '🔥', gatherXp: 20, starlightValue: 13 },
  { id: 'stardust_fiber', name: 'Stardust Fiber', category: 'fiber', rarity: 'common', regionId: 'starlight_canopy', description: 'Fibrous strands of stardust harvested from starweb formations in the canopy', emoji: '🕸️', gatherXp: 5, starlightValue: 2 },
  { id: 'eclipse_ember', name: 'Eclipse Ember', category: 'ember', rarity: 'epic', regionId: 'eclipse_hollow', description: 'Embers that burn without light, consuming shadow and corruption', emoji: '🕳️', gatherXp: 38, starlightValue: 28 },
  // Crystal & Gem (4)
  { id: 'eclipse_shard', name: 'Eclipse Shard', category: 'crystal', rarity: 'rare', regionId: 'eclipse_hollow', description: 'Dark crystals formed during eclipses that store anti-corruption energy', emoji: '💎', gatherXp: 22, starlightValue: 15 },
  { id: 'aurora_crystal', name: 'Aurora Crystal', category: 'crystal', rarity: 'rare', regionId: 'aurora_ridge', description: 'Crystals that refract aurora light into concentrated beams of purifying energy', emoji: '💠', gatherXp: 25, starlightValue: 16 },
  { id: 'nebula_gem', name: 'Nebula Gem', category: 'gem', rarity: 'epic', regionId: 'nebula_clearing', description: 'Gems formed from compressed nebula gas, containing swirling cosmic patterns', emoji: '💎', gatherXp: 42, starlightValue: 32 },
  { id: 'moonstone_pebble', name: 'Moonstone Pebble', category: 'ore', rarity: 'common', regionId: 'moonbeam_glade', description: 'Small moonstones scattered along moonbeam paths, absorbing lunar energy', emoji: '🪨', gatherXp: 4, starlightValue: 1 },
  // Special (5)
  { id: 'aurora_pearl', name: 'Aurora Pearl', category: 'pearl', rarity: 'epic', regionId: 'aurora_ridge', description: 'Rare pearls formed inside aurora clams that radiate protective aurora fields', emoji: '🫧', gatherXp: 40, starlightValue: 30 },
  { id: 'cosmic_seed', name: 'Cosmic Seed', category: 'resin', rarity: 'rare', regionId: 'comet_trail', description: 'Seeds from cosmic plants that grow into star trees when planted in fertile ground', emoji: '🌱', gatherXp: 18, starlightValue: 10 },
  { id: 'constellation_fragment', name: 'Constellation Fragment', category: 'ore', rarity: 'legendary', regionId: 'constellation_peak', description: 'Fragments of shattered constellations that fell to earth, holding immense star power', emoji: '⭐', gatherXp: 55, starlightValue: 42 },
  { id: 'galaxy_dew', name: 'Galaxy Dew', category: 'dew', rarity: 'epic', regionId: 'constellation_peak', description: 'Morning dew infused with galaxy light, the most potent healing substance known', emoji: '💧', gatherXp: 36, starlightValue: 26 },
  { id: 'moon_dew', name: 'Moon Dew', category: 'dew', rarity: 'rare', regionId: 'cosmos_heart', description: 'Rare dew that forms only when moonlight and starlight merge perfectly', emoji: '🌙', gatherXp: 20, starlightValue: 14 },
  // Thread & Silk (2)
  { id: 'nebula_thread', name: 'Nebula Thread', category: 'thread', rarity: 'uncommon', regionId: 'nebula_clearing', description: 'Fine threads spun from nebula silk, used to weave protective cloaks', emoji: '🧵', gatherXp: 11, starlightValue: 6 },
  { id: 'moonbeam_silk', name: 'Moonbeam Silk', category: 'silk', rarity: 'uncommon', regionId: 'moonbeam_glade', description: 'Silk harvested from moonbeam spiders, soft as moonlight and strong as steel', emoji: '🕸️', gatherXp: 10, starlightValue: 5 },
  // Resin & Ore (2)
  { id: 'starlight_resin', name: 'Starlight Resin', category: 'resin', rarity: 'uncommon', regionId: 'starlight_canopy', description: 'Golden resin from starwood trees that hardens into a starlight-infused amber', emoji: '🪵', gatherXp: 10, starlightValue: 6 },
  { id: 'eclipse_ore', name: 'Eclipse Ore', category: 'ore', rarity: 'rare', regionId: 'eclipse_hollow', description: 'Dark metallic ore found only in eclipse zones, used to forge anti-corruption weapons', emoji: '⛏️', gatherXp: 22, starlightValue: 14 },
];

const SW_STRUCTURES: SwStructureDef[] = [
  // Habitat (5)
  { id: 'star_tree_house', name: 'Star Tree House', category: 'habitat', description: 'A cozy dwelling built into the hollow of a giant starwood tree, glowing warmly from within', emoji: '🏠', maxLevel: 10, baseCost: { starlight: 20, moonEssence: 10 }, costMultiplier: 1.5, bonusType: 'cosmic_energy_regen', bonusPerLevel: 2 },
  { id: 'moonwell', name: 'Moonwell', category: 'habitat', description: 'A magical well that collects and purifies moonlight into drinkable moon essence', emoji: '⛲', maxLevel: 10, baseCost: { starlight: 15, moonEssence: 25 }, costMultiplier: 1.5, bonusType: 'moon_essence_regen', bonusPerLevel: 3 },
  { id: 'nebula_observatory', name: 'Nebula Observatory', category: 'habitat', description: 'A tower with a crystalline dome for observing nebulae and predicting cosmic events', emoji: '🔭', maxLevel: 10, baseCost: { starlight: 40, moonEssence: 30 }, costMultiplier: 1.6, bonusType: 'star_read_bonus', bonusPerLevel: 5 },
  { id: 'aurora_beacon', name: 'Aurora Beacon', category: 'habitat', description: 'A towering beacon that amplifies aurora energy across the entire forest region', emoji: '🗼', maxLevel: 10, baseCost: { starlight: 35, moonEssence: 35 }, costMultiplier: 1.6, bonusType: 'corruption_resistance', bonusPerLevel: 3 },
  { id: 'comet_stables', name: 'Comet Stables', category: 'habitat', description: 'Stables built from comet stone where celestial creatures rest and recover their energy', emoji: '蹄', maxLevel: 10, baseCost: { starlight: 30, moonEssence: 20 }, costMultiplier: 1.5, bonusType: 'creature_bond_bonus', bonusPerLevel: 4 },
  // Utility (5)
  { id: 'starwood_mill', name: 'Starwood Mill', category: 'utility', description: 'A mill powered by starlight that processes raw starwood into usable building materials', emoji: '🏭', maxLevel: 10, baseCost: { starlight: 25, moonEssence: 15 }, costMultiplier: 1.4, bonusType: 'resource_processing', bonusPerLevel: 5 },
  { id: 'moonpetal_apothecary', name: 'Moonpetal Apothecary', category: 'utility', description: 'A workshop for brewing potions and crafting remedies from forest resources', emoji: '⚗️', maxLevel: 10, baseCost: { starlight: 20, moonEssence: 25 }, costMultiplier: 1.5, bonusType: 'potion_power', bonusPerLevel: 6 },
  { id: 'star_root_cellar', name: 'Star Root Cellar', category: 'utility', description: 'An underground storage area where starlight resources stay fresh indefinitely', emoji: '🏴', maxLevel: 10, baseCost: { starlight: 15, moonEssence: 10 }, costMultiplier: 1.3, bonusType: 'storage_capacity', bonusPerLevel: 10 },
  { id: 'nebula_workshop', name: 'Nebula Workshop', category: 'utility', description: 'A workshop filled with nebula-powered tools for crafting cosmic equipment', emoji: '🔨', maxLevel: 10, baseCost: { starlight: 45, moonEssence: 35 }, costMultiplier: 1.6, bonusType: 'craft_bonus', bonusPerLevel: 5 },
  { id: 'nebula_loom', name: 'Nebula Loom', category: 'utility', description: 'A loom that weaves nebula thread into enchanted fabrics of incredible power', emoji: '🧵', maxLevel: 10, baseCost: { starlight: 35, moonEssence: 25 }, costMultiplier: 1.5, bonusType: 'fabric_quality', bonusPerLevel: 4 },
  // Defense (5)
  { id: 'eclipse_sanctum', name: 'Eclipse Sanctum', category: 'defense', description: 'A sanctum of eclipse energy that shields a region from corruption spread', emoji: '🛡️', maxLevel: 10, baseCost: { starlight: 50, moonEssence: 40 }, costMultiplier: 1.7, bonusType: 'corruption_reduction', bonusPerLevel: 5 },
  { id: 'aurora_watchtower', name: 'Aurora Watchtower', category: 'defense', description: 'A watchtower that uses aurora light to detect approaching corruption in advance', emoji: '🏰', maxLevel: 10, baseCost: { starlight: 40, moonEssence: 30 }, costMultiplier: 1.5, bonusType: 'early_warning', bonusPerLevel: 3 },
  { id: 'comet_lantern_post', name: 'Comet Lantern Post', category: 'defense', description: 'Lanterns fueled by comet fire that illuminate and purify dark forest paths', emoji: '🏮', maxLevel: 10, baseCost: { starlight: 20, moonEssence: 15 }, costMultiplier: 1.4, bonusType: 'path_illumination', bonusPerLevel: 4 },
  { id: 'aurora_armory', name: 'Aurora Armory', category: 'defense', description: 'An armory where aurora-forged weapons are stored and maintained for forest defense', emoji: '⚔️', maxLevel: 10, baseCost: { starlight: 45, moonEssence: 35 }, costMultiplier: 1.6, bonusType: 'weapon_power', bonusPerLevel: 5 },
  { id: 'eclipse_vault', name: 'Eclipse Vault', category: 'defense', description: 'A vault of pure eclipse energy that can store and contain dangerous corruption artifacts', emoji: '🏦', maxLevel: 10, baseCost: { starlight: 55, moonEssence: 45 }, costMultiplier: 1.7, bonusType: 'artifact_containment', bonusPerLevel: 4 },
  // Knowledge (5)
  { id: 'starlight_library', name: 'Starlight Library', category: 'knowledge', description: 'A vast library where books are made of starlight and contain cosmic knowledge', emoji: '📚', maxLevel: 10, baseCost: { starlight: 30, moonEssence: 20 }, costMultiplier: 1.5, bonusType: 'xp_bonus', bonusPerLevel: 5 },
  { id: 'nebula_archive', name: 'Nebula Archive', category: 'knowledge', description: 'An archive that stores memories and knowledge within nebula crystals', emoji: '🗄️', maxLevel: 10, baseCost: { starlight: 40, moonEssence: 30 }, costMultiplier: 1.6, bonusType: 'knowledge_access', bonusPerLevel: 4 },
  { id: 'moonstone_quarry', name: 'Moonstone Quarry', category: 'knowledge', description: 'A quarry of ancient moonstones inscribed with forgotten celestial runes', emoji: '⛏️', maxLevel: 10, baseCost: { starlight: 25, moonEssence: 15 }, costMultiplier: 1.4, bonusType: 'rune_power', bonusPerLevel: 3 },
  { id: 'constellation_shrine', name: 'Constellation Shrine', category: 'knowledge', description: 'A shrine aligned with constellations that reveals hidden cosmic truths', emoji: '⛩️', maxLevel: 10, baseCost: { starlight: 50, moonEssence: 35 }, costMultiplier: 1.6, bonusType: 'truth_revelation', bonusPerLevel: 5 },
  { id: 'cosmos_altar', name: 'Cosmos Altar', category: 'knowledge', description: 'The most sacred altar in the forest, directly connected to the heart of the cosmos', emoji: '🕯️', maxLevel: 10, baseCost: { starlight: 100, moonEssence: 80 }, costMultiplier: 1.8, bonusType: 'cosmic_connection', bonusPerLevel: 8 },
  // Spiritual (3)
  { id: 'moonbeam_garden', name: 'Moonbeam Garden', category: 'spiritual', description: 'A garden of moonbeam flowers that soothe the spirit and restore cosmic balance', emoji: '🌺', maxLevel: 10, baseCost: { starlight: 20, moonEssence: 30 }, costMultiplier: 1.5, bonusType: 'spirit_recovery', bonusPerLevel: 4 },
  { id: 'aurora_greenhouse', name: 'Aurora Greenhouse', category: 'spiritual', description: 'A greenhouse bathed in permanent aurora light where rare celestial plants thrive', emoji: '🏡', maxLevel: 10, baseCost: { starlight: 35, moonEssence: 25 }, costMultiplier: 1.5, bonusType: 'plant_growth', bonusPerLevel: 5 },
  { id: 'cosmos_heart_core', name: 'Cosmos Heart Core', category: 'spiritual', description: 'A crystalline core that channels the heart of the cosmos into the forest, empowering everything', emoji: '💎', maxLevel: 10, baseCost: { starlight: 150, moonEssence: 120 }, costMultiplier: 2.0, bonusType: 'all_bonuses', bonusPerLevel: 2 },
];

const SW_ABILITIES: SwAbilityDef[] = [
  // Starlight school (3)
  { id: 'starlight_heal', name: 'Starlight Heal', school: 'starlight', description: 'Channel concentrated starlight to heal forest creatures and restore their cosmic energy', emoji: '✨', cooldown: 30, cosmicEnergyCost: 10, unlockAtTitleIndex: 0, effect: 'heal', power: 20 },
  { id: 'starfall', name: 'Starfall', school: 'starlight', description: 'Call down a rain of miniature stars that damage corruption nodes and purify the ground', emoji: '🌠', cooldown: 60, cosmicEnergyCost: 25, unlockAtTitleIndex: 2, effect: 'purify', power: 40 },
  { id: 'starwood_growth', name: 'Starwood Growth', school: 'starlight', description: 'Accelerate the growth of star trees and cosmic plants in the current region', emoji: '🌳', cooldown: 120, cosmicEnergyCost: 20, unlockAtTitleIndex: 4, effect: 'growth', power: 35 },
  // Moonbeam school (3)
  { id: 'moonbeam_shield', name: 'Moonbeam Shield', school: 'moonbeam', description: 'Create a barrier of woven moonbeams that protects creatures and structures from corruption', emoji: '🛡️', cooldown: 45, cosmicEnergyCost: 15, unlockAtTitleIndex: 0, effect: 'shield', power: 25 },
  { id: 'moonrise', name: 'Moonrise', school: 'moonbeam', description: 'Summon an eternal moonrise that bathes the forest in healing moonlight for a duration', emoji: '🌙', cooldown: 90, cosmicEnergyCost: 30, unlockAtTitleIndex: 3, effect: 'area_heal', power: 45 },
  { id: 'moonbeam_blessing', name: 'Moonbeam Blessing', school: 'moonbeam', description: 'Bless a creature or structure with moonbeam energy, granting enhanced abilities', emoji: '💎', cooldown: 60, cosmicEnergyCost: 20, unlockAtTitleIndex: 5, effect: 'buff', power: 30 },
  // Nebula school (3)
  { id: 'nebula_cloak', name: 'Nebula Cloak', school: 'nebula', description: 'Wrap yourself or a creature in a cloak of nebula gas, granting invisibility and speed', emoji: '🌫️', cooldown: 50, cosmicEnergyCost: 18, unlockAtTitleIndex: 1, effect: 'stealth', power: 28 },
  { id: 'nebula_surge', name: 'Nebula Surge', school: 'nebula', description: 'Release a wave of nebula energy that disorients enemies and reveals hidden paths', emoji: '🌊', cooldown: 75, cosmicEnergyCost: 28, unlockAtTitleIndex: 3, effect: 'reveal', power: 38 },
  { id: 'nebula_fusion', name: 'Nebula Fusion', school: 'nebula', description: 'Fuse nebula energy with forest resources to create powerful temporary artifacts', emoji: '🔮', cooldown: 180, cosmicEnergyCost: 50, unlockAtTitleIndex: 6, effect: 'craft', power: 60 },
  // Aurora school (3)
  { id: 'aurora_speed', name: 'Aurora Speed', school: 'aurora', description: 'Surround yourself with aurora light that grants incredible speed and agility', emoji: '💨', cooldown: 40, cosmicEnergyCost: 12, unlockAtTitleIndex: 1, effect: 'speed', power: 22 },
  { id: 'aurora_wing', name: 'Aurora Wing', school: 'aurora', description: 'Manifest wings of pure aurora light that allow flight across the forest canopy', emoji: '🪽', cooldown: 90, cosmicEnergyCost: 35, unlockAtTitleIndex: 4, effect: 'flight', power: 50 },
  { id: 'aurora_cleansing', name: 'Aurora Cleansing', school: 'aurora', description: 'Unleash a massive aurora wave that purifies all corruption in the current region', emoji: '🌈', cooldown: 300, cosmicEnergyCost: 60, unlockAtTitleIndex: 7, effect: 'mass_purify', power: 80 },
  // Eclipse school (3)
  { id: 'eclipse_shadow', name: 'Eclipse Shadow', school: 'eclipse', description: 'Command eclipse shadows to envelop and neutralize corruption entities', emoji: '🌑', cooldown: 55, cosmicEnergyCost: 22, unlockAtTitleIndex: 2, effect: 'neutralize', power: 32 },
  { id: 'eclipse_veil', name: 'Eclipse Veil', school: 'eclipse', description: 'Cast a veil of eclipse energy that separates a region from all corruption influence', emoji: '🎭', cooldown: 120, cosmicEnergyCost: 40, unlockAtTitleIndex: 5, effect: 'isolate', power: 55 },
  { id: 'eclipse_heart', name: 'Eclipse Heart', school: 'eclipse', description: 'Tap into the heart of eclipses to reverse corruption that has already taken root', emoji: '🖤', cooldown: 240, cosmicEnergyCost: 55, unlockAtTitleIndex: 6, effect: 'reverse', power: 70 },
  // Comet school (3)
  { id: 'comet_dash', name: 'Comet Dash', school: 'comet', description: 'Transform into a comet and dash across the forest at blinding speed, leaving a purifying trail', emoji: '☄️', cooldown: 35, cosmicEnergyCost: 14, unlockAtTitleIndex: 1, effect: 'dash', power: 20 },
  { id: 'comet_strike', name: 'Comet Strike', school: 'comet', description: 'Call down a comet strike on a target location, dealing massive damage to corruption', emoji: '💥', cooldown: 80, cosmicEnergyCost: 32, unlockAtTitleIndex: 4, effect: 'strike', power: 48 },
  { id: 'comet_trail', name: 'Comet Trail', school: 'comet', description: 'Leave a permanent trail of comet energy that passively purifies corruption over time', emoji: '🌟', cooldown: 200, cosmicEnergyCost: 45, unlockAtTitleIndex: 5, effect: 'trail', power: 40 },
  // Cosmic & Forest schools (4)
  { id: 'cosmic_sight', name: 'Cosmic Sight', school: 'cosmic', description: 'Perceive the cosmic energy flows of the entire forest, revealing hidden secrets', emoji: '👁️', cooldown: 60, cosmicEnergyCost: 20, unlockAtTitleIndex: 2, effect: 'vision', power: 30 },
  { id: 'cosmos_breath', name: 'Cosmos Breath', school: 'cosmic', description: 'Exhale the breath of the cosmos — pure creative energy that restores life to dead areas', emoji: '🌬️', cooldown: 360, cosmicEnergyCost: 70, unlockAtTitleIndex: 7, effect: 'restore', power: 90 },
  { id: 'forest_whisper', name: 'Forest Whisper', school: 'forest', description: 'Listen to the whispers of the ancient trees and learn their hidden knowledge', emoji: '🌿', cooldown: 45, cosmicEnergyCost: 10, unlockAtTitleIndex: 0, effect: 'wisdom', power: 15 },
  { id: 'constellation_map', name: 'Constellation Map', school: 'cosmic', description: 'Project a map of constellations onto the sky that guides you to resources and creatures', emoji: '🗺️', cooldown: 90, cosmicEnergyCost: 25, unlockAtTitleIndex: 3, effect: 'map', power: 35 },
];

const SW_ACHIEVEMENTS: SwAchievementDef[] = [
  { id: 'ach_first_light', name: 'First Light', description: 'Discover your first starwood creature and befriend it', conditionKey: 'creaturesBefriended', targetValue: 1, rewardStarlight: 10, rewardMoonEssence: 5, emoji: '✨' },
  { id: 'ach_forest_friend', name: 'Forest Friend', description: 'Befriend 5 different starwood creatures', conditionKey: 'creaturesBefriended', targetValue: 5, rewardStarlight: 30, rewardMoonEssence: 20, emoji: '🦊' },
  { id: 'ach_starry_bond', name: 'Starry Bond', description: 'Befriend 15 different starwood creatures', conditionKey: 'creaturesBefriended', targetValue: 15, rewardStarlight: 80, rewardMoonEssence: 50, emoji: '🌟' },
  { id: 'ach_creature_master', name: 'Creature Master', description: 'Befriend all 35 starwood creatures', conditionKey: 'creaturesBefriended', targetValue: 35, rewardStarlight: 300, rewardMoonEssence: 200, emoji: '👑' },
  { id: 'ach_region_explorer', name: 'Region Explorer', description: 'Discover and visit all 8 forest regions', conditionKey: 'regionsExplored', targetValue: 8, rewardStarlight: 50, rewardMoonEssence: 35, emoji: '🗺️' },
  { id: 'ach_resource_gatherer', name: 'Resource Gatherer', description: 'Collect a total of 100 resources from the forest', conditionKey: 'resourcesGathered', targetValue: 100, rewardStarlight: 25, rewardMoonEssence: 15, emoji: '📦' },
  { id: 'ach_master_gatherer', name: 'Master Gatherer', description: 'Collect a total of 500 resources from the forest', conditionKey: 'resourcesGathered', targetValue: 500, rewardStarlight: 100, rewardMoonEssence: 70, emoji: '💎' },
  { id: 'ach_builder', name: 'Master Builder', description: 'Build your first forest structure', conditionKey: 'structuresBuilt', targetValue: 1, rewardStarlight: 20, rewardMoonEssence: 10, emoji: '🔨' },
  { id: 'ach_architect', name: 'Grand Architect', description: 'Upgrade any structure to its maximum level of 10', conditionKey: 'structuresBuilt', targetValue: 10, rewardStarlight: 150, rewardMoonEssence: 100, emoji: '🏛️' },
  { id: 'ach_forest_healer', name: 'Forest Healer', description: 'Reduce overall forest corruption to zero', conditionKey: 'corruptionPurified', targetValue: 50, rewardStarlight: 80, rewardMoonEssence: 50, emoji: '💚' },
  { id: 'ach_star_reader', name: 'Star Reader', description: 'Use the Read Stars ability 10 times', conditionKey: 'starsRead', targetValue: 10, rewardStarlight: 40, rewardMoonEssence: 25, emoji: '🔭' },
  { id: 'ach_aurora_caller', name: 'Aurora Caller', description: 'Summon the Aurora 5 times', conditionKey: 'aurorasSummoned', targetValue: 5, rewardStarlight: 60, rewardMoonEssence: 40, emoji: '🌈' },
  { id: 'ach_tree_planter', name: 'Celestial Gardener', description: 'Plant 10 Star Trees across the forest', conditionKey: 'starTreesPlanted', targetValue: 10, rewardStarlight: 45, rewardMoonEssence: 30, emoji: '🌳' },
  { id: 'ach_ancient_guardian', name: 'Ancient Guardian', description: 'Reach the title of Celestial Guardian', conditionKey: 'titleLevel', targetValue: 7, rewardStarlight: 200, rewardMoonEssence: 150, emoji: '🛡️' },
  { id: 'ach_purifier', name: 'Corruption Purifier', description: 'Purify corruption from the forest 20 times', conditionKey: 'corruptionPurified', targetValue: 20, rewardStarlight: 50, rewardMoonEssence: 30, emoji: '🔥' },
  { id: 'ach_cosmic_scholar', name: 'Cosmic Scholar', description: 'Unlock and use all 22 forest abilities', conditionKey: 'abilitiesUsed', targetValue: 22, rewardStarlight: 120, rewardMoonEssence: 80, emoji: '📖' },
  { id: 'ach_daily_devotee', name: 'Daily Devotee', description: 'Complete 7 daily forest tasks', conditionKey: 'dailyTasksCompleted', targetValue: 7, rewardStarlight: 70, rewardMoonEssence: 45, emoji: '📅' },
  { id: 'ach_legend', name: 'Legend of Starwood', description: 'Complete all other achievements — become a true legend of the starwood forest', conditionKey: 'legendComplete', targetValue: 1, rewardStarlight: 500, rewardMoonEssence: 350, emoji: '🏅' },
];

const SW_TITLES: SwTitleInfo[] = [
  { name: 'Forest Wisp', index: 0, requiredBefriended: 0, description: 'A faint spark of awareness drifting through the enchanted forest, just beginning to sense its magic' },
  { name: 'Starlight Seeker', index: 1, requiredBefriended: 3, description: 'You follow the starlight deeper into the forest, drawn by its ancient promise of wonder' },
  { name: 'Moonbeam Ranger', index: 2, requiredBefriended: 7, description: 'You patrol the moonlit paths with confidence, protecting the forest under silver light' },
  { name: 'Nebula Warden', index: 3, requiredBefriended: 12, description: 'The swirling nebulae answer to your call as you guard the forest against cosmic threats' },
  { name: 'Aurora Sentinel', index: 4, requiredBefriended: 18, description: 'You stand watch beneath dancing auroras, the forest\'s first and last line of defense' },
  { name: 'Eclipse Mystic', index: 5, requiredBefriended: 24, description: 'You have mastered the secrets of eclipses, wielding both light and shadow as your tools' },
  { name: 'Constellation Sage', index: 6, requiredBefriended: 30, description: 'The constellations themselves share their wisdom with you — you are one with the stars' },
  { name: 'Celestial Guardian', index: 7, requiredBefriended: 35, description: 'The forest has chosen you as its eternal guardian — all cosmic energy flows through you' },
];

const SW_CRAFT_RECIPES: SwCraftRecipeDef[] = [
  { id: 'craft_starlight_salve', name: 'Starlight Salve', tier: 'basic', description: 'A basic healing salve made from starlight sap and moonpetals', emoji: '🧴', ingredients: [{ resourceId: 'starlight_sap', amount: 3 }, { resourceId: 'moonpetal', amount: 2 }], resultResourceId: 'starlight_sap', resultAmount: 1, starlightCost: 5, moonEssenceCost: 3, cosmicEnergyCost: 0, requiredTitleIndex: 0 },
  { id: 'craft_aurora_tonic', name: 'Aurora Tonic', tier: 'basic', description: 'A refreshing tonic that boosts cosmic energy regeneration', emoji: '🧪', ingredients: [{ resourceId: 'aurora_moss', amount: 2 }, { resourceId: 'aurora_leaf', amount: 1 }], resultResourceId: 'aurora_crystal', resultAmount: 1, starlightCost: 8, moonEssenceCost: 5, cosmicEnergyCost: 0, requiredTitleIndex: 0 },
  { id: 'craft_nebula_elixir', name: 'Nebula Elixir', tier: 'refined', description: 'A swirling elixir that grants temporary cosmic vision', emoji: '⚗️', ingredients: [{ resourceId: 'nebula_pollen', amount: 3 }, { resourceId: 'nebula_nectar', amount: 2 }], resultResourceId: 'nebula_gem', resultAmount: 1, starlightCost: 15, moonEssenceCost: 10, cosmicEnergyCost: 5, requiredTitleIndex: 1 },
  { id: 'craft_eclipse_antidote', name: 'Eclipse Antidote', tier: 'refined', description: 'A potent antidote that neutralizes corruption effects', emoji: '💊', ingredients: [{ resourceId: 'eclipse_shard', amount: 2 }, { resourceId: 'moonbeam_bark', amount: 3 }], resultResourceId: 'eclipse_ore', resultAmount: 1, starlightCost: 20, moonEssenceCost: 15, cosmicEnergyCost: 5, requiredTitleIndex: 2 },
  { id: 'craft_comet_infusion', name: 'Comet Infusion', tier: 'refined', description: 'Infuse a resource with comet energy for enhanced properties', emoji: '☄️', ingredients: [{ resourceId: 'comet_dust', amount: 4 }, { resourceId: 'comet_ash', amount: 2 }], resultResourceId: 'cosmic_seed', resultAmount: 1, starlightCost: 18, moonEssenceCost: 12, cosmicEnergyCost: 8, requiredTitleIndex: 2 },
  { id: 'craft_moonbeam_cloak', name: 'Moonbeam Cloak', tier: 'masterwork', description: 'A shimmering cloak woven from moonbeam silk that enhances stealth', emoji: '🧥', ingredients: [{ resourceId: 'moonbeam_silk', amount: 5 }, { resourceId: 'moonstone_pebble', amount: 3 }, { resourceId: 'nebula_thread', amount: 2 }], resultResourceId: 'moonbeam_silk', resultAmount: 2, starlightCost: 30, moonEssenceCost: 25, cosmicEnergyCost: 15, requiredTitleIndex: 3 },
  { id: 'craft_aurora_crown', name: 'Aurora Crown', tier: 'masterwork', description: 'A crown of crystallized aurora light that grants cosmic authority', emoji: '👑', ingredients: [{ resourceId: 'aurora_crystal', amount: 3 }, { resourceId: 'aurora_pearl', amount: 2 }, { resourceId: 'star_root', amount: 1 }], resultResourceId: 'aurora_pearl', resultAmount: 1, starlightCost: 40, moonEssenceCost: 30, cosmicEnergyCost: 20, requiredTitleIndex: 4 },
  { id: 'craft_constellation_map', name: 'Constellation Map', tier: 'masterwork', description: 'A living map that shows the position of every creature and resource', emoji: '🗺️', ingredients: [{ resourceId: 'constellation_fragment', amount: 2 }, { resourceId: 'galaxy_dew', amount: 3 }, { resourceId: 'nebula_thread', amount: 4 }], resultResourceId: 'constellation_fragment', resultAmount: 1, starlightCost: 50, moonEssenceCost: 40, cosmicEnergyCost: 25, requiredTitleIndex: 5 },
  { id: 'craft_cosmic_lens', name: 'Cosmic Lens', tier: 'celestial', description: 'A lens forged from cosmic energy that reveals hidden dimensions', emoji: '🔍', ingredients: [{ resourceId: 'nebula_gem', amount: 2 }, { resourceId: 'constellation_fragment', amount: 1 }, { resourceId: 'eclipse_ember', amount: 3 }], resultResourceId: 'nebula_essence', resultAmount: 1, starlightCost: 60, moonEssenceCost: 50, cosmicEnergyCost: 30, requiredTitleIndex: 6 },
  { id: 'raft_celestial_phial', name: 'Celestial Phial', tier: 'celestial', description: 'A phial containing pure celestial energy — the ultimate crafting achievement', emoji: '🫧', ingredients: [{ resourceId: 'nebula_essence', amount: 2 }, { resourceId: 'moon_dew', amount: 3 }, { resourceId: 'galaxy_dew', amount: 2 }, { resourceId: 'aurora_sap', amount: 1 }], resultResourceId: 'nebula_essence', resultAmount: 1, starlightCost: 80, moonEssenceCost: 70, cosmicEnergyCost: 40, requiredTitleIndex: 7 },
];

const SW_FOREST_EVENTS: SwForestEventDef[] = [
  { id: 'event_meteor_shower', type: 'meteor_shower', name: 'Starwood Meteor Shower', description: 'A shower of cosmic meteors rains starlight across the forest, boosting all gathering yields', emoji: '🌠', duration: 600000, bonuses: [{ type: 'gather_yield', value: 2 }, { type: 'starlight_gain', value: 2 }], requirements: { creaturesBefriended: 2, titleIndex: 0 } },
  { id: 'event_nebula_bloom', type: 'nebula_bloom', name: 'Nebula Bloom Festival', description: 'Nebula clouds descend and flowers bloom everywhere, revealing hidden creatures', emoji: '🌸', duration: 900000, bonuses: [{ type: 'befriend_chance', value: 1.5 }, { type: 'bond_gain', value: 2 }], requirements: { creaturesBefriended: 5, titleIndex: 1 } },
  { id: 'event_eclipse_passing', type: 'eclipse_passing', name: 'Eclipse Passing', description: 'A rare eclipse darkens the forest — corruption weakens but dangerous creatures emerge', emoji: '🌑', duration: 300000, bonuses: [{ type: 'purify_power', value: 3 }, { type: 'corruption_reduction', value: 2 }], requirements: { creaturesBefriended: 10, titleIndex: 2 } },
  { id: 'event_aurora_storm', type: 'aurora_storm', name: 'Aurora Storm', description: 'A massive aurora storm sweeps through the forest, supercharging all abilities', emoji: '🌈', duration: 480000, bonuses: [{ type: 'ability_power', value: 2 }, { type: 'cosmic_energy_regen', value: 3 }], requirements: { creaturesBefriended: 15, titleIndex: 3 } },
  { id: 'event_cosmic_convergence', type: 'cosmic_convergence', name: 'Cosmic Convergence', description: 'All cosmic energies align in perfect harmony — the most powerful forest event', emoji: '💫', duration: 1200000, bonuses: [{ type: 'all_bonuses', value: 2 }, { type: 'legendary_chance', value: 2 }], requirements: { creaturesBefriended: 25, titleIndex: 5 } },
  { id: 'event_dark_surge', type: 'dark_surge', name: 'Dark Corruption Surge', description: 'A wave of dark energy surges through the forest — corruption spreads rapidly', emoji: '💀', duration: 600000, bonuses: [{ type: 'corruption_spread', value: 3 }, { type: 'starlight_drain', value: 2 }], requirements: { creaturesBefriended: 8, titleIndex: 1 } },
];

const SW_RARITIES: { key: SwRarity; label: string; color: string; multiplier: number }[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', multiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', multiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', multiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', multiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#FFD54F', multiplier: 7 },
];

// ============================================================
// Helper Functions (non-exported, module level)
// ============================================================

function swXpForRarity(rarity: SwRarity): number {
  const map: Record<SwRarity, number> = {
    common: 5, uncommon: 12, rare: 25, epic: 50, legendary: 100,
  };
  return map[rarity] ?? 5;
}

function swBefriendChanceModified(baseChance: number, titleIndex: number): number {
  const bonus = titleIndex * 0.02;
  return Math.min(0.95, baseChance + bonus);
}

function swClamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function swBondLevelFromProgress(progress: number, thresholds: number[]): SwCreatureBondLevel {
  if (progress >= thresholds[3]) return 'soulbound';
  if (progress >= thresholds[2]) return 'companion';
  if (progress >= thresholds[1]) return 'friend';
  if (progress >= thresholds[0]) return 'acquaintance';
  return 'stranger';
}

function swNextBondThreshold(progress: number, thresholds: number[]): number | null {
  for (let i = 0; i < thresholds.length; i++) {
    if (progress < thresholds[i]) return thresholds[i];
  }
  return null;
}

function swStructureUpgradeCost(base: { starlight: number; moonEssence: number }, multiplier: number, currentLevel: number): { starlight: number; moonEssence: number } {
  const m = Math.pow(multiplier, currentLevel);
  return {
    starlight: Math.floor(base.starlight * m),
    moonEssence: Math.floor(base.moonEssence * m),
  };
}

function swGenerateDayKey(now: number): string {
  const d = new Date(now);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function swCreateDailyTask(dayKey: string): SwDailyTaskState {
  const hash = dayKey.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const taskTypes: SwDailyTaskType[] = ['befriend', 'gather', 'build', 'purify', 'explore', 'ability'];
  const typeIndex = Math.abs(hash) % taskTypes.length;
  const taskType = taskTypes[typeIndex];
  const descriptions: Record<SwDailyTaskType, string> = {
    befriend: 'Befriend a starwood creature today',
    gather: 'Gather 5 forest resources',
    build: 'Build or upgrade a structure',
    purify: 'Purify corruption from a region',
    explore: 'Explore a new forest region',
    ability: 'Use a forest ability 3 times',
  };
  const targets: Record<SwDailyTaskType, number> = {
    befriend: 1, gather: 5, build: 1, purify: 3, explore: 1, ability: 3,
  };
  return {
    dayKey,
    taskType,
    description: descriptions[taskType],
    progress: 0,
    target: targets[taskType],
    rewardStarlight: 15 + Math.abs(hash % 4) * 5,
    rewardMoonEssence: 10 + Math.abs((hash >> 4) % 3) * 5,
    completed: false,
    claimed: false,
  };
}

function swCraftRecipeTierLabel(tier: SwCraftingTier): string {
  const labels: Record<SwCraftingTier, string> = {
    basic: 'Basic',
    refined: 'Refined',
    masterwork: 'Masterwork',
    celestial: 'Celestial',
  };
  return labels[tier];
}

function swCraftRecipeTierColor(tier: SwCraftingTier): string {
  const colors: Record<SwCraftingTier, string> = {
    basic: '#9CA3AF',
    refined: '#34D399',
    masterwork: '#A78BFA',
    celestial: '#FFD54F',
  };
  return colors[tier];
}

function swForestEventTypeName(type: SwForestEventType): string {
  const names: Record<SwForestEventType, string> = {
    meteor_shower: 'Meteor Shower',
    nebula_bloom: 'Nebula Bloom',
    eclipse_passing: 'Eclipse Passing',
    aurora_storm: 'Aurora Storm',
    cosmic_convergence: 'Cosmic Convergence',
    dark_surge: 'Dark Surge',
  };
  return names[type];
}

function swCanCraftRecipe(recipe: SwCraftRecipeDef, resources: Record<string, SwResourceState>, starlight: number, moonEssence: number, cosmicEnergy: number, titleIndex: number): boolean {
  if (titleIndex < recipe.requiredTitleIndex) return false;
  if (starlight < recipe.starlightCost) return false;
  if (moonEssence < recipe.moonEssenceCost) return false;
  if (cosmicEnergy < recipe.cosmicEnergyCost) return false;
  for (const ing of recipe.ingredients) {
    const res = resources[ing.resourceId];
    if (!res || res.amount < ing.amount) return false;
  }
  return true;
}

function swCreateInitialState(seed?: number): SwStarwoodState {
  const effectiveSeed = seed ?? (Date.now() & 0x7fffffff);
  const now = Date.now();
  const dayKey = swGenerateDayKey(now);

  const creatures: Record<string, SwCreatureState> = {};
  for (const c of SW_CREATURES) {
    creatures[c.id] = {
      befriended: false,
      bondLevel: 'stranger',
      bondProgress: 0,
      timesVisited: 0,
      befriendedAt: null,
    };
  }

  const regions: Record<string, SwRegionState> = {};
  for (const r of SW_REGIONS) {
    regions[r.id] = {
      discovered: r.unlockAtBefriended === 0,
      corruptionLevel: r.baseCorruption,
      purifyCount: 0,
      totalGathered: 0,
      timesVisited: 0,
      discoveredAt: r.unlockAtBefriended === 0 ? now : null,
    };
  }

  const resources: Record<string, SwResourceState> = {};
  for (const r of SW_RESOURCES) {
    resources[r.id] = { amount: 0, totalGathered: 0 };
  }

  const structures: Record<string, SwStructureState> = {};
  for (const s of SW_STRUCTURES) {
    structures[s.id] = { level: 0, built: false };
  }

  const abilities: Record<string, SwAbilityState> = {};
  for (const a of SW_ABILITIES) {
    abilities[a.id] = { unlocked: a.unlockAtTitleIndex === 0, cooldownEnd: 0, totalUses: 0 };
  }

  const achievements: Record<string, SwAchievementState> = {};
  for (const a of SW_ACHIEVEMENTS) {
    achievements[a.id] = { unlocked: false, unlockedAt: null };
  }

  return {
    creatures,
    regions,
    resources,
    structures,
    abilities,
    achievements,
    currentRegion: 'starlight_canopy',
    starlight: 50,
    moonEssence: 30,
    corruptionLevel: 5,
    titleIndex: 0,
    forestHealth: 95,
    cosmicEnergy: 20,
    dailyTask: swCreateDailyTask(dayKey),
    starTrees: [],
    auroraEvent: {
      active: false,
      startTime: null,
      endTime: null,
      bonusType: 'none',
      bonusMultiplier: 1,
      totalSummoned: 0,
    },
    forestEvent: {
      active: false,
      eventId: null,
      startTime: null,
      endTime: null,
      bonusesApplied: false,
    },
    encounterLog: [],
    craftingLog: [],
    totals: {
      creaturesBefriended: 0,
      resourcesGathered: 0,
      structuresBuilt: 0,
      abilitiesUsed: 0,
      corruptionPurified: 0,
      starTreesPlanted: 0,
      starsRead: 0,
      aurorasSummoned: 0,
      forestHeals: 0,
      dailyTasksCompleted: 0,
      regionsExplored: 0,
    },
    seed: effectiveSeed,
  };
}

// ============================================================
// Main Hook
// ============================================================

export default function useStarwood() {
  const [state, setState] = useState<SwStarwoodState>(() => swCreateInitialState());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ---- SW_ Constants (returned from hook) ----
  const SW_MAX_STARLIGHT = 200;
  const SW_MAX_MOON_ESSENCE = 150;
  const SW_MAX_COSMIC_ENERGY = 100;
  const SW_CREATURE_COUNT = 35;
  const SW_REGION_COUNT = 8;
  const SW_RESOURCE_COUNT = 30;
  const SW_STRUCTURE_COUNT = 25;
  const SW_ABILITY_COUNT = 22;
  const SW_ACHIEVEMENT_COUNT = 18;
  const SW_TITLE_COUNT = 8;
  const SW_MAX_STRUCTURE_LEVEL = 10;
  const SW_MAX_FOREST_HEALTH = 100;
  const SW_MIN_CORRUPTION = 0;
  const SW_MAX_CORRUPTION = 100;
  const SW_STAR_TREE_GROWTH_STAGES = 5;
  const SW_CORRUPTION_PURIFY_AMOUNT = 5;

  const SW_COLOR_THEME: SwColorTheme = {
    starlightGold: '#FFD54F',
    deepForestGreen: '#1B5E20',
    cosmicPurple: '#6A1B9A',
    moonbeamSilver: '#CFD8DC',
    nebulaTeal: '#00897B',
  };

  // ---- Actions ----

  const refreshDailyTask = useCallback(() => {
    const now = Date.now();
    const dayKey = swGenerateDayKey(now);
    setState(prev => {
      if (prev.dailyTask.dayKey === dayKey) return prev;
      return {
        ...prev,
        dailyTask: swCreateDailyTask(dayKey),
      };
    });
  }, []);

  const befriendCreature = useCallback((creatureId: string): { success: boolean; message: string } => {
    const creatureDef = SW_CREATURES.find(c => c.id === creatureId);
    if (!creatureDef) return { success: false, message: 'Unknown creature' };

    return setState(prev => {
      const cState = prev.creatures[creatureId];
      if (!cState) return prev;

      if (cState.befriended) {
        return prev;
      }

      if (prev.starlight < creatureDef.starlightCost || prev.moonEssence < creatureDef.moonEssenceCost) {
        return prev;
      }

      const chance = swBefriendChanceModified(creatureDef.befriendChance, prev.titleIndex);
      const hash = ((prev.seed * 31 + creatureDef.id.charCodeAt(0) * 17 + prev.totals.creaturesBefriended * 7) & 0x7fffffff);
      const roll = (hash % 1000) / 1000;

      const newStarlight = prev.starlight - creatureDef.starlightCost;
      const newMoonEssence = prev.moonEssence - creatureDef.moonEssenceCost;

      if (roll < chance) {
        const newCreatures = { ...prev.creatures, [creatureId]: {
          befriended: true,
          bondLevel: 'acquaintance' as SwCreatureBondLevel,
          bondProgress: 1,
          timesVisited: cState.timesVisited + 1,
          befriendedAt: Date.now(),
        }};

        const newBefriended = prev.totals.creaturesBefriended + 1;
        const newTitleIndex = SW_TITLES.reduce((best, t) =>
          newBefriended >= t.requiredBefriended ? Math.max(best, t.index) : best, 0);

        // Check region unlocks
        const newRegions = { ...prev.regions };
        for (const region of SW_REGIONS) {
          if (!newRegions[region.id].discovered && newBefriended >= region.unlockAtBefriended) {
            newRegions[region.id] = { ...newRegions[region.id], discovered: true, discoveredAt: Date.now() };
          }
        }

        // Unlock abilities based on new title
        const newAbilities = { ...prev.abilities };
        for (const ability of SW_ABILITIES) {
          if (!newAbilities[ability.id].unlocked && newTitleIndex >= ability.unlockAtTitleIndex) {
            newAbilities[ability.id] = { ...newAbilities[ability.id], unlocked: true };
          }
        }

        return {
          ...prev,
          creatures: newCreatures,
          starlight: newStarlight,
          moonEssence: newMoonEssence,
          titleIndex: newTitleIndex,
          regions: newRegions,
          abilities: newAbilities,
          totals: { ...prev.totals, creaturesBefriended: newBefriended },
          seed: (prev.seed + 1) & 0x7fffffff,
        };
      }

      return {
        ...prev,
        starlight: newStarlight,
        moonEssence: newMoonEssence,
        creatures: { ...prev.creatures, [creatureId]: {
          ...cState,
          timesVisited: cState.timesVisited + 1,
        }},
        seed: (prev.seed + 1) & 0x7fffffff,
      };
    }) as unknown as { success: boolean; message: string };
  }, []);

  const tryBefriendCreature = useCallback((creatureId: string): { success: boolean; message: string; befriended: boolean } => {
    const creatureDef = SW_CREATURES.find(c => c.id === creatureId);
    if (!creatureDef) return { success: false, message: 'Unknown creature', befriended: false };

    const s = stateRef.current;
    const cState = s.creatures[creatureId];
    if (!cState) return { success: false, message: 'Creature not found', befriended: false };
    if (cState.befriended) return { success: true, message: `${creatureDef.name} is already your friend!`, befriended: false };
    if (s.starlight < creatureDef.starlightCost) return { success: false, message: `Not enough starlight (need ${creatureDef.starlightCost})`, befriended: false };
    if (s.moonEssence < creatureDef.moonEssenceCost) return { success: false, message: `Not enough moon essence (need ${creatureDef.moonEssenceCost})`, befriended: false };

    befriendCreature(creatureId);

    const afterState = stateRef.current;
    const wasBefriended = afterState.creatures[creatureId]?.befriended ?? false;
    if (wasBefriended) {
      return { success: true, message: `You befriended ${creatureDef.name}! 🎉`, befriended: true };
    }
    return { success: true, message: `${creatureDef.name} slipped away... try again!`, befriended: false };
  }, [befriendCreature]);

  const gatherResource = useCallback((resourceId: string, amount: number = 1): { success: boolean; message: string; gained: number } => {
    const resDef = SW_RESOURCES.find(r => r.id === resourceId);
    if (!resDef) return { success: false, message: 'Unknown resource', gained: 0 };

    const s = stateRef.current;
    if (!s.regions[resDef.regionId]?.discovered) {
      return { success: false, message: 'Region not discovered yet', gained: 0 };
    }

    const xpGain = resDef.gatherXp * amount;
    const starlightGain = resDef.starlightValue * amount;

    setState(prev => {
      const newResources = { ...prev.resources, [resourceId]: {
        amount: (prev.resources[resourceId]?.amount ?? 0) + amount,
        totalGathered: (prev.resources[resourceId]?.totalGathered ?? 0) + amount,
      }};
      const newRegions = { ...prev.regions, [resDef.regionId]: {
        ...prev.regions[resDef.regionId],
        totalGathered: prev.regions[resDef.regionId].totalGathered + amount,
      }};

      const dailyTask = prev.dailyTask;
      let newDailyTask = dailyTask;
      if (dailyTask.taskType === 'gather' && !dailyTask.completed) {
        const newProgress = dailyTask.progress + amount;
        const completed = newProgress >= dailyTask.target;
        newDailyTask = { ...dailyTask, progress: Math.min(newProgress, dailyTask.target), completed };
        if (completed) {
          return {
            ...prev,
            resources: newResources,
            regions: newRegions,
            starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + starlightGain),
            cosmicEnergy: Math.min(SW_MAX_COSMIC_ENERGY, prev.cosmicEnergy + Math.floor(amount / 3)),
            totals: { ...prev.totals, resourcesGathered: prev.totals.resourcesGathered + amount, dailyTasksCompleted: prev.totals.dailyTasksCompleted + 1 },
            dailyTask: { ...newDailyTask, completed: true },
          };
        }
      }

      return {
        ...prev,
        resources: newResources,
        regions: newRegions,
        starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + starlightGain),
        cosmicEnergy: Math.min(SW_MAX_COSMIC_ENERGY, prev.cosmicEnergy + Math.floor(amount / 3)),
        totals: { ...prev.totals, resourcesGathered: prev.totals.resourcesGathered + amount },
        dailyTask: newDailyTask,
      };
    });

    return { success: true, message: `Gathered ${amount}x ${resDef.name} (+${starlightGain} ✨)`, gained: amount };
  }, [SW_MAX_STARLIGHT, SW_MAX_COSMIC_ENERGY]);

  const upgradeStructure = useCallback((structureId: string): { success: boolean; message: string } => {
    const structDef = SW_STRUCTURES.find(s => s.id === structureId);
    if (!structDef) return { success: false, message: 'Unknown structure' };

    return setState(prev => {
      const sState = prev.structures[structureId];
      if (!sState) return prev;

      if (sState.level >= structDef.maxLevel) {
        return prev;
      }

      const cost = sState.built
        ? swStructureUpgradeCost(structDef.baseCost, structDef.costMultiplier, sState.level)
        : structDef.baseCost;

      if (prev.starlight < cost.starlight || prev.moonEssence < cost.moonEssence) {
        return prev;
      }

      const newLevel = sState.level + 1;
      const newStructures = { ...prev.structures, [structureId]: {
        level: newLevel,
        built: true,
      }};

      const isNewBuild = !sState.built;
      const newTotals = {
        ...prev.totals,
        structuresBuilt: isNewBuild ? prev.totals.structuresBuilt + 1 : prev.totals.structuresBuilt,
      };

      let newDailyTask = prev.dailyTask;
      if (prev.dailyTask.taskType === 'build' && !prev.dailyTask.completed && isNewBuild) {
        newDailyTask = { ...prev.dailyTask, progress: prev.dailyTask.progress + 1, completed: true };
      }

      return {
        ...prev,
        structures: newStructures,
        starlight: prev.starlight - cost.starlight,
        moonEssence: prev.moonEssence - cost.moonEssence,
        totals: newTotals,
        dailyTask: newDailyTask,
      };
    }) as unknown as { success: boolean; message: string };
  }, []);

  const activateAbility = useCallback((abilityId: string): { success: boolean; message: string } => {
    const abilityDef = SW_ABILITIES.find(a => a.id === abilityId);
    if (!abilityDef) return { success: false, message: 'Unknown ability' };

    return setState(prev => {
      const aState = prev.abilities[abilityId];
      if (!aState || !aState.unlocked) return prev;

      const now = Date.now();
      if (now < aState.cooldownEnd) return prev;

      if (prev.cosmicEnergy < abilityDef.cosmicEnergyCost) return prev;

      const newAbilities = { ...prev.abilities, [abilityId]: {
        ...aState,
        cooldownEnd: now + abilityDef.cooldown * 1000,
        totalUses: aState.totalUses + 1,
      }};

      let abilityCount = 0;
      for (const key of Object.keys(prev.abilities)) {
        if (prev.abilities[key].totalUses > 0) abilityCount++;
      }

      let newDailyTask = prev.dailyTask;
      if (prev.dailyTask.taskType === 'ability' && !prev.dailyTask.completed) {
        const newProgress = prev.dailyTask.progress + 1;
        const completed = newProgress >= prev.dailyTask.target;
        newDailyTask = { ...prev.dailyTask, progress: newProgress, completed };
      }

      let effectResult = { ...prev };
      if (abilityDef.effect === 'heal' || abilityDef.effect === 'area_heal') {
        effectResult.forestHealth = Math.min(SW_MAX_FOREST_HEALTH, prev.forestHealth + abilityDef.power);
        effectResult.totals = { ...effectResult.totals, forestHeals: prev.totals.forestHeals + 1 };
      }

      return {
        ...effectResult,
        abilities: newAbilities,
        cosmicEnergy: prev.cosmicEnergy - abilityDef.cosmicEnergyCost,
        totals: { ...effectResult.totals, abilitiesUsed: abilityCount },
        dailyTask: newDailyTask,
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MAX_FOREST_HEALTH]);

  const purifyCorruption = useCallback((regionId: string): { success: boolean; message: string } => {
    return setState(prev => {
      const rState = prev.regions[regionId];
      if (!rState || !rState.discovered) return prev;
      if (rState.corruptionLevel <= 0) return prev;

      const cost = Math.max(5, Math.floor(rState.corruptionLevel * 0.5));
      if (prev.starlight < cost) return prev;

      const newCorruption = Math.max(SW_MIN_CORRUPTION, rState.corruptionLevel - SW_CORRUPTION_PURIFY_AMOUNT);
      const newRegions = { ...prev.regions, [regionId]: {
        ...rState,
        corruptionLevel: newCorruption,
        purifyCount: rState.purifyCount + 1,
      }};

      const avgCorruption = Object.values(newRegions).reduce((sum, r) => sum + r.corruptionLevel, 0) / SW_REGION_COUNT;

      let newDailyTask = prev.dailyTask;
      if (prev.dailyTask.taskType === 'purify' && !prev.dailyTask.completed) {
        const newProgress = prev.dailyTask.progress + 1;
        const completed = newProgress >= prev.dailyTask.target;
        newDailyTask = { ...prev.dailyTask, progress: newProgress, completed };
      }

      return {
        ...prev,
        regions: newRegions,
        starlight: prev.starlight - cost,
        corruptionLevel: Math.round(avgCorruption),
        forestHealth: Math.min(SW_MAX_FOREST_HEALTH, prev.forestHealth + 2),
        totals: { ...prev.totals, corruptionPurified: prev.totals.corruptionPurified + 1 },
        dailyTask: newDailyTask,
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MIN_CORRUPTION, SW_MAX_FOREST_HEALTH, SW_CORRUPTION_PURIFY_AMOUNT, SW_REGION_COUNT]);

  const plantStarTree = useCallback((regionId: string): { success: boolean; message: string } => {
    return setState(prev => {
      const rState = prev.regions[regionId];
      if (!rState || !rState.discovered) return prev;
      if (prev.starlight < 20) return prev;

      const newTree: SwStarTreeRecord = {
        id: `st_${Date.now()}_${prev.totals.starTreesPlanted}`,
        plantedAt: Date.now(),
        regionId,
        growthStage: 0,
        health: 100,
        starlightGenerated: 0,
      };

      return {
        ...prev,
        starlight: prev.starlight - 20,
        starTrees: [...prev.starTrees, newTree],
        forestHealth: Math.min(SW_MAX_FOREST_HEALTH, prev.forestHealth + 1),
        totals: { ...prev.totals, starTreesPlanted: prev.totals.starTreesPlanted + 1 },
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MAX_FOREST_HEALTH]);

  const readStars = useCallback((): { success: boolean; message: string; insight: string } => {
    const insights = [
      'The stars reveal hidden creatures nearby...',
      'A constellation aligns — corruption weakens tonight.',
      'Starlight flows stronger toward the Aurora Ridge.',
      'The Cosmos Heart pulses with gathering energy.',
      'An ancient creature stirs in the Eclipse Hollow.',
      'The nebula clears — a rare resource glows nearby.',
      'Moonbeam paths converge at the Moonbeam Glade.',
      'A comet streaks across the sky — fortune favors the bold.',
      'The forest whispers of a legendary creature approaching.',
      'Starwood trees resonate with deep cosmic harmony tonight.',
    ];

    const s = stateRef.current;
    const index = (s.seed + s.totals.starsRead * 7) % insights.length;
    const insight = insights[index];

    setState(prev => ({
      ...prev,
      cosmicEnergy: Math.min(SW_MAX_COSMIC_ENERGY, prev.cosmicEnergy + 5),
      starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + 3),
      totals: { ...prev.totals, starsRead: prev.totals.starsRead + 1 },
      seed: (prev.seed + 1) & 0x7fffffff,
    }));

    return { success: true, message: 'The stars reveal their secrets...', insight };
  }, [SW_MAX_COSMIC_ENERGY, SW_MAX_STARLIGHT]);

  const summonAurora = useCallback((): { success: boolean; message: string } => {
    return setState(prev => {
      if (prev.cosmicEnergy < 30) return prev;

      const now = Date.now();
      const bonusTypes = ['starlight_boost', 'moon_essence_boost', 'corruption_shield', 'bond_bonus', 'gather_bonus'];
      const typeIndex = (prev.seed + prev.totals.aurorasSummoned) % bonusTypes.length;

      return {
        ...prev,
        cosmicEnergy: prev.cosmicEnergy - 30,
        auroraEvent: {
          active: true,
          startTime: now,
          endTime: now + 300000,
          bonusType: bonusTypes[typeIndex],
          bonusMultiplier: 2,
          totalSummoned: prev.totals.aurorasSummoned + 1,
        },
        totals: { ...prev.totals, aurorasSummoned: prev.totals.aurorasSummoned + 1 },
        forestHealth: Math.min(SW_MAX_FOREST_HEALTH, prev.forestHealth + 5),
        seed: (prev.seed + 1) & 0x7fffffff,
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MAX_FOREST_HEALTH]);

  const healForest = useCallback((amount: number = 10): { success: boolean; message: string } => {
    return setState(prev => {
      if (prev.moonEssence < 15) return prev;

      const healed = Math.min(amount, SW_MAX_FOREST_HEALTH - prev.forestHealth);
      if (healed <= 0) return prev;

      return {
        ...prev,
        moonEssence: prev.moonEssence - 15,
        forestHealth: prev.forestHealth + healed,
        totals: { ...prev.totals, forestHeals: prev.totals.forestHeals + 1 },
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MAX_FOREST_HEALTH]);

  const checkAchievements = useCallback((): string[] => {
    setState(prev => {
      const newlyUnlocked: string[] = [];
      const newAchievements = { ...prev.achievements };
      const now = Date.now();

      const totalsForCheck: Record<string, number> = {
        creaturesBefriended: prev.totals.creaturesBefriended,
        resourcesGathered: prev.totals.resourcesGathered,
        structuresBuilt: prev.totals.structuresBuilt,
        corruptionPurified: prev.totals.corruptionPurified,
        starsRead: prev.totals.starsRead,
        aurorasSummoned: prev.totals.aurorasSummoned,
        starTreesPlanted: prev.totals.starTreesPlanted,
        abilitiesUsed: prev.totals.abilitiesUsed,
        dailyTasksCompleted: prev.totals.dailyTasksCompleted,
        regionsExplored: prev.totals.regionsExplored,
        titleLevel: prev.titleIndex,
        legendComplete: 0,
      };

      const otherAchCount = SW_ACHIEVEMENTS.filter(a => a.id !== 'ach_legend').length;
      const unlockedCount = Object.entries(prev.achievements).filter(([k, a]) => a.unlocked && k !== 'ach_legend').length;
      totalsForCheck.legendComplete = unlockedCount >= otherAchCount ? 1 : 0;

      for (const achDef of SW_ACHIEVEMENTS) {
        const achState = newAchievements[achDef.id];
        if (!achState || achState.unlocked) continue;

        const currentValue = totalsForCheck[achDef.conditionKey] ?? 0;
        if (currentValue >= achDef.targetValue) {
          newAchievements[achDef.id] = { unlocked: true, unlockedAt: now };
          newlyUnlocked.push(achDef.id);
        }
      }

      if (newlyUnlocked.length === 0) return prev;

      let bonusStarlight = 0;
      let bonusMoonEssence = 0;
      for (const id of newlyUnlocked) {
        const achDef = SW_ACHIEVEMENTS.find(a => a.id === id);
        if (achDef) {
          bonusStarlight += achDef.rewardStarlight;
          bonusMoonEssence += achDef.rewardMoonEssence;
        }
      }

      return {
        ...prev,
        achievements: newAchievements,
        starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + bonusStarlight),
        moonEssence: Math.min(SW_MAX_MOON_ESSENCE, prev.moonEssence + bonusMoonEssence),
      };
    });
    return [];
  }, [SW_MAX_STARLIGHT, SW_MAX_MOON_ESSENCE]);

  const claimDailyReward = useCallback((): { success: boolean; message: string; starlight: number; moonEssence: number } => {
    return setState(prev => {
      if (!prev.dailyTask.completed || prev.dailyTask.claimed) return prev;

      return {
        ...prev,
        dailyTask: { ...prev.dailyTask, claimed: true },
        starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + prev.dailyTask.rewardStarlight),
        moonEssence: Math.min(SW_MAX_MOON_ESSENCE, prev.moonEssence + prev.dailyTask.rewardMoonEssence),
      };
    }) as unknown as { success: boolean; message: string; starlight: number; moonEssence: number };
  }, [SW_MAX_STARLIGHT, SW_MAX_MOON_ESSENCE]);

  const setCurrentRegion = useCallback((regionId: string) => {
    setState(prev => {
      const rState = prev.regions[regionId];
      if (!rState || !rState.discovered) return prev;

      let newRegionsExplored = prev.totals.regionsExplored;
      const newRegions = { ...prev.regions, [regionId]: {
        ...rState,
        timesVisited: rState.timesVisited + 1,
      }};

      if (rState.timesVisited === 0) {
        const explored = Object.values(newRegions).filter(r => r.timesVisited > 0).length;
        newRegionsExplored = explored;
      }

      let newDailyTask = prev.dailyTask;
      if (prev.dailyTask.taskType === 'explore' && !prev.dailyTask.completed && rState.timesVisited === 0) {
        newDailyTask = { ...prev.dailyTask, progress: prev.dailyTask.progress + 1, completed: true };
      }

      return {
        ...prev,
        currentRegion: regionId,
        regions: newRegions,
        totals: { ...prev.totals, regionsExplored: newRegionsExplored },
        dailyTask: newDailyTask,
      };
    });
  }, []);

  const visitCreature = useCallback((creatureId: string): { success: boolean; message: string } => {
    const creatureDef = SW_CREATURES.find(c => c.id === creatureId);
    if (!creatureDef) return { success: false, message: 'Unknown creature' };

    setState(prev => {
      const cState = prev.creatures[creatureId];
      if (!cState) return prev;

      if (!cState.befriended) {
        return {
          ...prev,
          creatures: { ...prev.creatures, [creatureId]: {
            ...cState,
            timesVisited: cState.timesVisited + 1,
          }},
          cosmicEnergy: Math.min(SW_MAX_COSMIC_ENERGY, prev.cosmicEnergy + 1),
        };
      }

      const newProgress = cState.bondProgress + 1;
      const newBondLevel = swBondLevelFromProgress(newProgress, creatureDef.bondThresholds);

      return {
        ...prev,
        creatures: { ...prev.creatures, [creatureId]: {
          ...cState,
          bondProgress: newProgress,
          bondLevel: newBondLevel,
          timesVisited: cState.timesVisited + 1,
        }},
        cosmicEnergy: Math.min(SW_MAX_COSMIC_ENERGY, prev.cosmicEnergy + 2),
        starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + 1),
      };
    });

    return { success: true, message: `Visited ${creatureDef.name}` };
  }, [SW_MAX_COSMIC_ENERGY, SW_MAX_STARLIGHT]);

  const feedCreature = useCallback((creatureId: string, resourceId: string): { success: boolean; message: string } => {
    const creatureDef = SW_CREATURES.find(c => c.id === creatureId);
    if (!creatureDef) return { success: false, message: 'Unknown creature' };

    return setState(prev => {
      const cState = prev.creatures[creatureId];
      if (!cState || !cState.befriended) return prev;

      const rState = prev.resources[resourceId];
      if (!rState || rState.amount < 1) return prev;

      const resDef = SW_RESOURCES.find(r => r.id === resourceId);
      const bondGain = resDef ? swXpForRarity(resDef.rarity) : 3;
      const newProgress = cState.bondProgress + bondGain;
      const newBondLevel = swBondLevelFromProgress(newProgress, creatureDef.bondThresholds);

      return {
        ...prev,
        creatures: { ...prev.creatures, [creatureId]: {
          ...cState,
          bondProgress: newProgress,
          bondLevel: newBondLevel,
        }},
        resources: { ...prev.resources, [resourceId]: {
          ...rState,
          amount: rState.amount - 1,
        }},
        starlight: Math.min(SW_MAX_STARLIGHT, prev.starlight + 2),
      };
    }) as unknown as { success: boolean; message: string };
  }, [SW_MAX_STARLIGHT]);

  // ---- Computed Values (useMemo) ----

  const titleInfo = useMemo((): SwTitleInfo => {
    return SW_TITLES[state.titleIndex] ?? SW_TITLES[0];
  }, [state]);

  const nextTitle = useMemo((): SwTitleInfo | null => {
    const next = SW_TITLES.find(t => t.index === state.titleIndex + 1);
    return next ?? null;
  }, [state]);

  const befriendedCount = useMemo((): number => {
    return state.totals.creaturesBefriended;
  }, [state]);

  const creaturesByRarity = useMemo((): Record<SwRarity, SwCreatureDef[]> => {
    const result: Record<SwRarity, SwCreatureDef[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    for (const c of SW_CREATURES) {
      result[c.rarity].push(c);
    }
    return result;
  }, []);

  const discoveredRegions = useMemo((): SwRegionDef[] => {
    return SW_REGIONS.filter(r => state.regions[r.id]?.discovered);
  }, [state]);

  const undiscoveredRegions = useMemo((): SwRegionDef[] => {
    return SW_REGIONS.filter(r => !state.regions[r.id]?.discovered);
  }, [state]);

  const currentRegionDef = useMemo((): SwRegionDef | null => {
    return SW_REGIONS.find(r => r.id === state.currentRegion) ?? null;
  }, [state]);

  const currentRegionCreatures = useMemo((): SwCreatureDef[] => {
    if (!currentRegionDef) return [];
    return SW_CREATURES.filter(c => currentRegionDef.creatureIds.includes(c.id));
  }, [currentRegionDef]);

  const currentRegionResources = useMemo((): SwResourceDef[] => {
    if (!currentRegionDef) return [];
    return SW_RESOURCES.filter(r => currentRegionDef.resourceIds.includes(r.id));
  }, [currentRegionDef]);

  const befriendedCreatures = useMemo((): SwCreatureDef[] => {
    return SW_CREATURES.filter(c => state.creatures[c.id]?.befriended);
  }, [state]);

  const unbefriendedCreatures = useMemo((): SwCreatureDef[] => {
    return SW_CREATURES.filter(c => !state.creatures[c.id]?.befriended);
  }, [state]);

  const unlockedAbilities = useMemo((): SwAbilityDef[] => {
    return SW_ABILITIES.filter(a => state.abilities[a.id]?.unlocked);
  }, [state]);

  const lockedAbilities = useMemo((): SwAbilityDef[] => {
    return SW_ABILITIES.filter(a => !state.abilities[a.id]?.unlocked);
  }, [state]);

  const activeAbilities = useMemo((): SwAbilityDef[] => {
    const now = Date.now();
    return SW_ABILITIES.filter(a => {
      const aState = state.abilities[a.id];
      return aState?.unlocked && now < aState.cooldownEnd;
    });
  }, [state]);

  const unlockedAchievements = useMemo((): SwAchievementDef[] => {
    return SW_ACHIEVEMENTS.filter(a => state.achievements[a.id]?.unlocked);
  }, [state]);

  const lockedAchievements = useMemo((): SwAchievementDef[] => {
    return SW_ACHIEVEMENTS.filter(a => !state.achievements[a.id]?.unlocked);
  }, [state]);

  const builtStructures = useMemo((): SwStructureDef[] => {
    return SW_STRUCTURES.filter(s => state.structures[s.id]?.built);
  }, [state]);

  const unbuiltStructures = useMemo((): SwStructureDef[] => {
    return SW_STRUCTURES.filter(s => !state.structures[s.id]?.built);
  }, [state]);

  const maxedStructures = useMemo((): SwStructureDef[] => {
    return SW_STRUCTURES.filter(s => {
      const sState = state.structures[s.id];
      return sState?.built && sState.level >= s.maxLevel;
    });
  }, [state]);

  const totalStructureBonus = useMemo((): Record<string, number> => {
    const bonus: Record<string, number> = {};
    for (const s of SW_STRUCTURES) {
      const sState = state.structures[s.id];
      if (sState?.built) {
        bonus[s.bonusType] = (bonus[s.bonusType] ?? 0) + s.bonusPerLevel * sState.level;
      }
    }
    return bonus;
  }, [state]);

  const isAuroraActive = useMemo((): boolean => {
    if (!state.auroraEvent.active || !state.auroraEvent.endTime) return false;
    return Date.now() < state.auroraEvent.endTime;
  }, [state]);

  const corruptionBreakdown = useMemo((): Record<string, number> => {
    const breakdown: Record<string, number> = {};
    for (const r of SW_REGIONS) {
      breakdown[r.id] = state.regions[r.id]?.corruptionLevel ?? 0;
    }
    return breakdown;
  }, [state]);

  const totalResourcesGathered = useMemo((): number => {
    return state.totals.resourcesGathered;
  }, [state]);

  const totalResourcesByCategory = useMemo((): Record<SwResourceCategory, number> => {
    const result: Record<SwResourceCategory, number> = {
      sap: 0, bark: 0, pollen: 0, moss: 0, dust: 0, crystal: 0,
      gem: 0, thread: 0, ore: 0, ember: 0, resin: 0, silk: 0,
      essence: 0, pearl: 0, fiber: 0, leaf: 0, root: 0, dew: 0,
    };
    for (const r of SW_RESOURCES) {
      const rState = state.resources[r.id];
      if (rState) {
        result[r.category] += rState.totalGathered;
      }
    }
    return result;
  }, [state]);

  const creatureBondSummary = useMemo((): Record<string, { level: SwCreatureBondLevel; progress: number; nextThreshold: number | null }> => {
    const summary: Record<string, { level: SwCreatureBondLevel; progress: number; nextThreshold: number | null }> = {};
    for (const c of SW_CREATURES) {
      const cState = state.creatures[c.id];
      if (cState && cState.befriended) {
        summary[c.id] = {
          level: cState.bondLevel,
          progress: cState.bondProgress,
          nextThreshold: swNextBondThreshold(cState.bondProgress, c.bondThresholds),
        };
      }
    }
    return summary;
  }, [state]);

  const legendAchievementProgress = useMemo((): number => {
    const otherCount = SW_ACHIEVEMENTS.filter(a => a.id !== 'ach_legend').length;
    const unlockedCount = Object.entries(state.achievements).filter(
      ([k, a]) => a.unlocked && k !== 'ach_legend'
    ).length;
    return otherCount > 0 ? unlockedCount / otherCount : 0;
  }, [state]);

  const forestCorruptionAvg = useMemo((): number => {
    const regions = Object.values(state.regions);
    if (regions.length === 0) return 0;
    const sum = regions.reduce((acc, r) => acc + r.corruptionLevel, 0);
    return Math.round((sum / regions.length) * 10) / 10;
  }, [state]);

  const titleProgress = useMemo((): { current: SwTitleInfo; next: SwTitleInfo | null; progress: number } => {
    const current = SW_TITLES[state.titleIndex] ?? SW_TITLES[0];
    const nextT = SW_TITLES.find(t => t.index === state.titleIndex + 1) ?? null;
    let progress = 1;
    if (nextT) {
      const prevThreshold = current.requiredBefriended;
      const nextThreshold = nextT.requiredBefriended;
      const range = nextThreshold - prevThreshold;
      progress = range > 0 ? swClamp((state.totals.creaturesBefriended - prevThreshold) / range, 0, 1) : 1;
    }
    return { current, next: nextT, progress };
  }, [state]);

  const getProgress = useCallback((): {
    overall: number;
    creatures: number;
    regions: number;
    structures: number;
    abilities: number;
    achievements: number;
    titleProgress: number;
  } => {
    const s = stateRef.current;
    return {
      overall: (
        (s.totals.creaturesBefriended / SW_CREATURE_COUNT) * 0.3 +
        (s.totals.regionsExplored / SW_REGION_COUNT) * 0.15 +
        (builtStructures.length / SW_STRUCTURE_COUNT) * 0.15 +
        (Object.values(s.abilities).filter(a => a.totalUses > 0).length / SW_ABILITY_COUNT) * 0.15 +
        (Object.values(s.achievements).filter(a => a.unlocked).length / SW_ACHIEVEMENT_COUNT) * 0.15 +
        (s.titleIndex / (SW_TITLE_COUNT - 1)) * 0.1
      ),
      creatures: s.totals.creaturesBefriended / SW_CREATURE_COUNT,
      regions: s.totals.regionsExplored / SW_REGION_COUNT,
      structures: builtStructures.length / SW_STRUCTURE_COUNT,
      abilities: Object.values(s.abilities).filter(a => a.totalUses > 0).length / SW_ABILITY_COUNT,
      achievements: Object.values(s.achievements).filter(a => a.unlocked).length / SW_ACHIEVEMENT_COUNT,
      titleProgress: s.titleIndex / (SW_TITLE_COUNT - 1),
    };
  }, [builtStructures.length]);

  const getStats = useCallback((): {
    title: string;
    titleIndex: number;
    befriended: number;
    totalCreatures: number;
    regionsExplored: number;
    totalRegions: number;
    resourcesGathered: number;
    structuresBuilt: number;
    abilitiesUsed: number;
    corruptionPurified: number;
    starTreesPlanted: number;
    starsRead: number;
    aurorasSummoned: number;
    forestHeals: number;
    dailyTasksCompleted: number;
    forestHealth: number;
    corruptionLevel: number;
    starlight: number;
    moonEssence: number;
    cosmicEnergy: number;
    playTime: number;
  } => {
    const s = stateRef.current;
    const title = SW_TITLES[s.titleIndex]?.name ?? 'Forest Wisp';
    return {
      title,
      titleIndex: s.titleIndex,
      befriended: s.totals.creaturesBefriended,
      totalCreatures: SW_CREATURE_COUNT,
      regionsExplored: s.totals.regionsExplored,
      totalRegions: SW_REGION_COUNT,
      resourcesGathered: s.totals.resourcesGathered,
      structuresBuilt: s.totals.structuresBuilt,
      abilitiesUsed: s.totals.abilitiesUsed,
      corruptionPurified: s.totals.corruptionPurified,
      starTreesPlanted: s.totals.starTreesPlanted,
      starsRead: s.totals.starsRead,
      aurorasSummoned: s.totals.aurorasSummoned,
      forestHeals: s.totals.forestHeals,
      dailyTasksCompleted: s.totals.dailyTasksCompleted,
      forestHealth: s.forestHealth,
      corruptionLevel: s.corruptionLevel,
      starlight: s.starlight,
      moonEssence: s.moonEssence,
      cosmicEnergy: s.cosmicEnergy,
      playTime: Date.now() - (Object.values(s.regions).find(r => r.discoveredAt)?.discoveredAt ?? Date.now()),
    };
  }, []);

  const getTitle = useCallback((): { name: string; index: number; description: string; next: SwTitleInfo | null } => {
    const s = stateRef.current;
    const current = SW_TITLES[s.titleIndex] ?? SW_TITLES[0];
    const next = SW_TITLES.find(t => t.index === s.titleIndex + 1) ?? null;
    return { name: current.name, index: current.index, description: current.description, next };
  }, []);

  const getCreatureInfo = useCallback((creatureId: string) => {
    const def = SW_CREATURES.find(c => c.id === creatureId);
    const cState = stateRef.current.creatures[creatureId];
    if (!def || !cState) return null;
    return {
      ...def,
      state: cState,
      canBefriend: !cState.befriended,
      canAfford: stateRef.current.starlight >= def.starlightCost && stateRef.current.moonEssence >= def.moonEssenceCost,
      bondLevel: cState.bondLevel,
      nextThreshold: swNextBondThreshold(cState.bondProgress, def.bondThresholds),
    };
  }, []);

  const getStructureInfo = useCallback((structureId: string) => {
    const def = SW_STRUCTURES.find(s => s.id === structureId);
    const sState = stateRef.current.structures[structureId];
    if (!def || !sState) return null;
    const cost = sState.built
      ? swStructureUpgradeCost(def.baseCost, def.costMultiplier, sState.level)
      : def.baseCost;
    return {
      ...def,
      state: sState,
      upgradeCost: cost,
      canAfford: stateRef.current.starlight >= cost.starlight && stateRef.current.moonEssence >= cost.moonEssence,
      isMaxLevel: sState.level >= def.maxLevel,
      totalBonus: sState.built ? def.bonusPerLevel * sState.level : 0,
    };
  }, []);

  const getAbilityInfo = useCallback((abilityId: string) => {
    const def = SW_ABILITIES.find(a => a.id === abilityId);
    const aState = stateRef.current.abilities[abilityId];
    if (!def || !aState) return null;
    const now = Date.now();
    return {
      ...def,
      state: aState,
      isOnCooldown: now < aState.cooldownEnd,
      remainingCooldown: Math.max(0, aState.cooldownEnd - now),
      canAfford: stateRef.current.cosmicEnergy >= def.cosmicEnergyCost,
    };
  }, []);

  const getResourceInfo = useCallback((resourceId: string) => {
    const def = SW_RESOURCES.find(r => r.id === resourceId);
    const rState = stateRef.current.resources[resourceId];
    if (!def || !rState) return null;
    return { ...def, state: rState };
  }, []);

  const getRegionInfo = useCallback((regionId: string) => {
    const def = SW_REGIONS.find(r => r.id === regionId);
    const rState = stateRef.current.regions[regionId];
    if (!def || !rState) return null;
    const creatures = SW_CREATURES.filter(c => def.creatureIds.includes(c.id));
    const resources = SW_RESOURCES.filter(r => def.resourceIds.includes(r.id));
    return { ...def, state: rState, creatures, resources };
  }, []);

  // ---- Crafting Actions ----

  const craftRecipe = useCallback((recipeId: string): { success: boolean; message: string } => {
    const recipe = SW_CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return { success: false, message: 'Unknown recipe' };

    return setState(prev => {
      if (!swCanCraftRecipe(recipe, prev.resources, prev.starlight, prev.moonEssence, prev.cosmicEnergy, prev.titleIndex)) {
        return prev;
      }

      const newResources = { ...prev.resources };
      for (const ing of recipe.ingredients) {
        const res = newResources[ing.resourceId];
        if (res) {
          newResources[ing.resourceId] = { ...res, amount: res.amount - ing.amount };
        }
      }
      const resultRes = newResources[recipe.resultResourceId];
      if (resultRes) {
        newResources[recipe.resultResourceId] = {
          ...resultRes,
          amount: resultRes.amount + recipe.resultAmount,
          totalGathered: resultRes.totalGathered + recipe.resultAmount,
        };
      }

      const newCraftingLog: SwCraftingLog[] = [
        ...prev.craftingLog,
        { recipeId, timestamp: Date.now(), success: true },
      ].slice(-100);

      return {
        ...prev,
        resources: newResources,
        starlight: prev.starlight - recipe.starlightCost,
        moonEssence: prev.moonEssence - recipe.moonEssenceCost,
        cosmicEnergy: prev.cosmicEnergy - recipe.cosmicEnergyCost,
        craftingLog: newCraftingLog,
      };
    }) as unknown as { success: boolean; message: string };
  }, []);

  const getRecipeInfo = useCallback((recipeId: string) => {
    const recipe = SW_CRAFT_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return null;
    const s = stateRef.current;
    const canCraft = swCanCraftRecipe(recipe, s.resources, s.starlight, s.moonEssence, s.cosmicEnergy, s.titleIndex);
    const ingredientDetails = recipe.ingredients.map(ing => {
      const resDef = SW_RESOURCES.find(r => r.id === ing.resourceId);
      const resState = s.resources[ing.resourceId];
      return {
        resource: resDef,
        required: ing.amount,
        owned: resState?.amount ?? 0,
        sufficient: (resState?.amount ?? 0) >= ing.amount,
      };
    });
    const resultDef = SW_RESOURCES.find(r => r.id === recipe.resultResourceId);
    return {
      ...recipe,
      canCraft,
      tierLabel: swCraftRecipeTierLabel(recipe.tier),
      tierColor: swCraftRecipeTierColor(recipe.tier),
      ingredientDetails,
      resultResource: resultDef,
    };
  }, []);

  // ---- Forest Event Actions ----

  const startForestEvent = useCallback((eventId: string): { success: boolean; message: string } => {
    const eventDef = SW_FOREST_EVENTS.find(e => e.id === eventId);
    if (!eventDef) return { success: false, message: 'Unknown event' };

    return setState(prev => {
      if (prev.forestEvent.active) return prev;
      if (prev.totals.creaturesBefriended < eventDef.requirements.creaturesBefriended) return prev;
      if (prev.titleIndex < eventDef.requirements.titleIndex) return prev;

      const now = Date.now();
      return {
        ...prev,
        forestEvent: {
          active: true,
          eventId,
          startTime: now,
          endTime: now + eventDef.duration,
          bonusesApplied: true,
        },
      };
    }) as unknown as { success: boolean; message: string };
  }, []);

  const endForestEvent = useCallback((): void => {
    setState(prev => {
      if (!prev.forestEvent.active) return prev;
      return {
        ...prev,
        forestEvent: {
          active: false,
          eventId: null,
          startTime: null,
          endTime: null,
          bonusesApplied: false,
        },
      };
    });
  }, []);

  const availableForestEvents = useMemo((): SwForestEventDef[] => {
    return SW_FOREST_EVENTS.filter(e =>
      state.totals.creaturesBefriended >= e.requirements.creaturesBefriended &&
      state.titleIndex >= e.requirements.titleIndex
    );
  }, [state]);

  const activeForestEvent = useMemo((): SwForestEventDef | null => {
    if (!state.forestEvent.active || !state.forestEvent.eventId) return null;
    return SW_FOREST_EVENTS.find(e => e.id === state.forestEvent.eventId) ?? null;
  }, [state]);

  // ---- Encounter Log ----

  const recentEncounters = useMemo((): SwCreatureEncounter[] => {
    return state.encounterLog.slice(-20);
  }, [state]);

  const craftingHistory = useMemo((): SwCraftingLog[] => {
    return state.craftingLog.slice(-20);
  }, [state]);

  const craftRecipesByTier = useMemo((): Record<SwCraftingTier, SwCraftRecipeDef[]> => {
    const result: Record<SwCraftingTier, SwCraftRecipeDef[]> = {
      basic: [], refined: [], masterwork: [], celestial: [],
    };
    for (const r of SW_CRAFT_RECIPES) {
      result[r.tier].push(r);
    }
    return result;
  }, []);

  const abilitiesBySchool = useMemo((): Record<SwAbilitySchool, SwAbilityDef[]> => {
    const result: Record<SwAbilitySchool, SwAbilityDef[]> = {
      starlight: [], moonbeam: [], nebula: [], aurora: [],
      eclipse: [], comet: [], cosmic: [], forest: [],
    };
    for (const a of SW_ABILITIES) {
      result[a.school].push(a);
    }
    return result;
  }, []);

  const structuresByCategory = useMemo((): Record<SwStructureCategory, SwStructureDef[]> => {
    const result: Record<SwStructureCategory, SwStructureDef[]> = {
      habitat: [], utility: [], defense: [], knowledge: [], spiritual: [], production: [],
    };
    for (const s of SW_STRUCTURES) {
      result[s.category].push(s);
    }
    return result;
  }, []);

  const totalStarPower = useMemo((): number => {
    let total = 0;
    for (const c of SW_CREATURES) {
      if (state.creatures[c.id]?.befriended) {
        total += c.starPower;
      }
    }
    return total;
  }, [state]);

  const corruptionDangerLevel = useMemo((): 'safe' | 'warning' | 'danger' | 'critical' => {
    if (state.corruptionLevel < 10) return 'safe';
    if (state.corruptionLevel < 30) return 'warning';
    if (state.corruptionLevel < 60) return 'danger';
    return 'critical';
  }, [state]);

  const mostPurifiedRegion = useMemo((): string | null => {
    let minCorruption = Infinity;
    let regionId: string | null = null;
    for (const r of SW_REGIONS) {
      const rState = state.regions[r.id];
      if (rState && rState.discovered && rState.corruptionLevel < minCorruption) {
        minCorruption = rState.corruptionLevel;
        regionId = r.id;
      }
    }
    return regionId;
  }, [state]);

  const mostCorruptedRegion = useMemo((): string | null => {
    let maxCorruption = -1;
    let regionId: string | null = null;
    for (const r of SW_REGIONS) {
      const rState = state.regions[r.id];
      if (rState && rState.discovered && rState.corruptionLevel > maxCorruption) {
        maxCorruption = rState.corruptionLevel;
        regionId = r.id;
      }
    }
    return regionId;
  }, [state]);

  const highestBondCreature = useMemo((): { id: string; name: string; progress: number; level: SwCreatureBondLevel } | null => {
    let best: { id: string; name: string; progress: number; level: SwCreatureBondLevel } | null = null;
    for (const c of SW_CREATURES) {
      const cState = state.creatures[c.id];
      if (cState?.befriended) {
        if (!best || cState.bondProgress > best.progress) {
          best = { id: c.id, name: c.name, progress: cState.bondProgress, level: cState.bondLevel };
        }
      }
    }
    return best;
  }, [state]);

  const cosmicEnergyPercent = useMemo((): number => {
    return Math.round((state.cosmicEnergy / SW_MAX_COSMIC_ENERGY) * 100);
  }, [state, SW_MAX_COSMIC_ENERGY]);

  const forestHealthPercent = useMemo((): number => {
    return Math.round((state.forestHealth / SW_MAX_FOREST_HEALTH) * 100);
  }, [state, SW_MAX_FOREST_HEALTH]);

  const starlightPercent = useMemo((): number => {
    return Math.round((state.starlight / SW_MAX_STARLIGHT) * 100);
  }, [state, SW_MAX_STARLIGHT]);

  const moonEssencePercent = useMemo((): number => {
    return Math.round((state.moonEssence / SW_MAX_MOON_ESSENCE) * 100);
  }, [state, SW_MAX_MOON_ESSENCE]);

  const canBefriendAny = useMemo((): boolean => {
    for (const c of SW_CREATURES) {
      const cState = state.creatures[c.id];
      if (cState && !cState.befriended && c.regionId === state.currentRegion) {
        const regionState = state.regions[c.regionId];
        if (regionState?.discovered && state.starlight >= c.starlightCost && state.moonEssence >= c.moonEssenceCost) {
          return true;
        }
      }
    }
    return false;
  }, [state]);

  const getNextCreatureToBefriend = useMemo((): SwCreatureDef | null => {
    for (const c of SW_CREATURES) {
      const cState = state.creatures[c.id];
      if (cState && !cState.befriended && c.regionId === state.currentRegion) {
        const regionState = state.regions[c.regionId];
        if (regionState?.discovered && state.starlight >= c.starlightCost && state.moonEssence >= c.moonEssenceCost) {
          return c;
        }
      }
    }
    return null;
  }, [state]);

  const resetState = useCallback(() => {
    setState(swCreateInitialState());
  }, []);

  const getStarTreesForRegion = useCallback((regionId: string): SwStarTreeRecord[] => {
    return stateRef.current.starTrees.filter(t => t.regionId === regionId);
  }, []);

  const getDailyTaskInfo = useCallback((): SwDailyTaskState => {
    return stateRef.current.dailyTask;
  }, []);

  // ---- Return ----

  return {
    // State
    state,
    creatures: state.creatures,
    regions: state.regions,
    resources: state.resources,
    structures: state.structures,
    abilities: state.abilities,
    achievements: state.achievements,
    currentRegion: state.currentRegion,
    starlight: state.starlight,
    moonEssence: state.moonEssence,
    corruptionLevel: state.corruptionLevel,
    creaturesBefriended: state.totals.creaturesBefriended,
    titleIndex: state.titleIndex,
    forestHealth: state.forestHealth,
    cosmicEnergy: state.cosmicEnergy,
    dailyForestTask: state.dailyTask,
    starTrees: state.starTrees,
    auroraEvent: state.auroraEvent,
    forestEvent: state.forestEvent,
    encounterLog: state.encounterLog,
    craftingLog: state.craftingLog,
    totals: state.totals,

    // Constants
    SW_MAX_STARLIGHT,
    SW_MAX_MOON_ESSENCE,
    SW_MAX_COSMIC_ENERGY,
    SW_CREATURE_COUNT,
    SW_REGION_COUNT,
    SW_RESOURCE_COUNT,
    SW_STRUCTURE_COUNT,
    SW_ABILITY_COUNT,
    SW_ACHIEVEMENT_COUNT,
    SW_TITLE_COUNT,
    SW_MAX_STRUCTURE_LEVEL,
    SW_MAX_FOREST_HEALTH,
    SW_MIN_CORRUPTION,
    SW_MAX_CORRUPTION,
    SW_STAR_TREE_GROWTH_STAGES,
    SW_CORRUPTION_PURIFY_AMOUNT,
    SW_COLOR_THEME,

    // Data (read-only references)
    creatureDefs: SW_CREATURES,
    regionDefs: SW_REGIONS,
    resourceDefs: SW_RESOURCES,
    structureDefs: SW_STRUCTURES,
    abilityDefs: SW_ABILITIES,
    achievementDefs: SW_ACHIEVEMENTS,
    titleDefs: SW_TITLES,
    rarityDefs: SW_RARITIES,
    craftRecipeDefs: SW_CRAFT_RECIPES,
    forestEventDefs: SW_FOREST_EVENTS,

    // Computed
    titleInfo,
    nextTitle,
    befriendedCount,
    creaturesByRarity,
    discoveredRegions,
    undiscoveredRegions,
    currentRegionDef,
    currentRegionCreatures,
    currentRegionResources,
    befriendedCreatures,
    unbefriendedCreatures,
    unlockedAbilities,
    lockedAbilities,
    activeAbilities,
    unlockedAchievements,
    lockedAchievements,
    builtStructures,
    unbuiltStructures,
    maxedStructures,
    totalStructureBonus,
    isAuroraActive,
    corruptionBreakdown,
    totalResourcesGathered,
    totalResourcesByCategory,
    creatureBondSummary,
    legendAchievementProgress,
    forestCorruptionAvg,
    titleProgress,
    availableForestEvents,
    activeForestEvent,
    recentEncounters,
    craftingHistory,
    craftRecipesByTier,
    abilitiesBySchool,
    structuresByCategory,
    totalStarPower,
    corruptionDangerLevel,
    mostPurifiedRegion,
    mostCorruptedRegion,
    highestBondCreature,
    cosmicEnergyPercent,
    forestHealthPercent,
    starlightPercent,
    moonEssencePercent,
    canBefriendAny,
    getNextCreatureToBefriend,

    // Actions
    refreshDailyTask,
    tryBefriendCreature,
    befriendCreature,
    gatherResource,
    upgradeStructure,
    activateAbility,
    purifyCorruption,
    plantStarTree,
    readStars,
    summonAurora,
    healForest,
    checkAchievements,
    claimDailyReward,
    setCurrentRegion,
    visitCreature,
    feedCreature,
    resetState,
    craftRecipe,
    startForestEvent,
    endForestEvent,

    // Info getters
    getProgress,
    getStats,
    getTitle,
    getCreatureInfo,
    getStructureInfo,
    getAbilityInfo,
    getResourceInfo,
    getRegionInfo,
    getStarTreesForRegion,
    getDailyTaskInfo,
    getRecipeInfo,
  };
}
