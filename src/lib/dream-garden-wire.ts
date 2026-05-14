import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Dream Garden (梦境花园) — Wire Module
//
// A surreal ethereal garden floating in the dreamscape, where
// dream weavers cultivate sentient flowers, harvest moonlight
// nectar, and battle nightmare creatures. Players cultivate
// bloomed creatures, explore dream zones, collect nectar materials,
// build garden structures, discover dream artifacts, face random
// garden events, and ascend through 8 dream titles.
//
// Storage key: dream-garden-save
// Prefix: dg / DG_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type DgRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type DgSpecies =
  | 'dream_weaver'
  | 'moonlit_fox'
  | 'slumber_dragon'
  | 'blossom_fairy'
  | 'nightmare_hound'
  | 'mist_walker'
  | 'star_seed';

type DgAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type DgStructureBonusType =
  | 'cultivateDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'bloomQuality'
  | 'nectarYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type DgMaterialCategory = 'nectar' | 'petal' | 'crystal' | 'organic' | 'essence' | 'mist' | 'starlight';

// ---- Creature Definitions ----

interface DgCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: DgSpecies;
  readonly rarity: DgRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface DgChamberDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly level: number;
  readonly resources: string[];
  readonly capacity: number;
  readonly unlockLevel: number;
  readonly ambientColor: string;
  readonly dangerLevel: number;
}

// ---- Material Definitions ----

interface DgMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: DgRarity;
  readonly value: number;
  readonly category: DgMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface DgStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: DgStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface DgAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: DgAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: DgRarity;
}

// ---- Achievement Definitions ----

interface DgAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly conditionKey: string;
  readonly targetValue: number;
  readonly rewardXp: number;
  readonly rewardCoins: number;
}

// ---- Title Definitions ----

interface DgTitleDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly requiredLevel: number;
  readonly coinBonus: number;
  readonly xpBonus: number;
}

// ---- Artifact Definitions ----

interface DgArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: DgRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface DgEventDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly effectType: 'buff' | 'debuff' | 'special';
  readonly duration: number;
  rewardXp: number;
  rewardCoins: number;
  rewardMaterialId: string | null;
  rewardMaterialCount: number;
}

// ---- Runtime State Types ----

interface DgOwnedCreature {
  creatureId: string;
  instanceId: string;
  craftedAt: number;
  timesUsed: number;
  nickname: string;
}

interface DgChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface DgStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface DgArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface DgAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface DgAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface DgInventoryItem {
  materialId: string;
  count: number;
}

interface DgEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface DgStats {
  totalCultivated: number;
  totalZonesExplored: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface DgTitleProgress {
  current: DgTitleDef;
  next: DgTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: DG_ CONSTANTS
// ============================================================

const DG_SAVE_KEY = 'dream-garden-save';
const DG_MAX_LEVEL = 50;
const DG_STARTING_COINS = 300;
const DG_STARTING_XP = 0;
const DG_XP_BASE = 100;
const DG_XP_SCALE = 1.5;
const DG_AUTO_SAVE_MS = 15000;
const DG_EVENT_DURATION_MS = 60000;
const DG_MAX_INVENTORY_ITEM = 999;
const DG_MAX_BLOOMED_CREATURES = 100;
const DG_COOLDOWN_TICK_MS = 1000;
const DG_SPECIES_COUNT = 7;
const DG_CREATURE_COUNT = 35;
const DG_CHAMBER_COUNT = 8;
const DG_MATERIAL_COUNT = 12;
const DG_STRUCTURE_COUNT = 8;
const DG_ABILITY_COUNT = 8;
const DG_ACHIEVEMENT_COUNT = 10;
const DG_TITLE_COUNT = 8;
const DG_ARTIFACT_COUNT = 6;
const DG_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const DG_DREAM_LAVENDER = '#B39DDB';
const DG_MOONLIGHT_SILVER = '#C0C0C0';
const DG_NIGHTMARE_RED = '#E53935';
const DG_BLOSSOM_PINK = '#F48FB1';
const DG_MIST_TEAL = '#4DB6AC';
const DG_STAR_SEED_GOLD = '#FFD54F';
const DG_SLUMBER_INDIGO = '#3949AB';

const DG_RARITY_COLORS: Record<DgRarity, string> = {
  common: '#A0A090',
  uncommon: '#4DB6AC',
  rare: '#B39DDB',
  epic: '#E53935',
  legendary: '#FFD54F',
};

const DG_SPECIES_COLORS: Record<DgSpecies, string> = {
  dream_weaver: DG_DREAM_LAVENDER,
  moonlit_fox: DG_MOONLIGHT_SILVER,
  slumber_dragon: DG_SLUMBER_INDIGO,
  blossom_fairy: DG_BLOSSOM_PINK,
  nightmare_hound: DG_NIGHTMARE_RED,
  mist_walker: DG_MIST_TEAL,
  star_seed: DG_STAR_SEED_GOLD,
};

const DG_ALL_COLORS = [
  DG_DREAM_LAVENDER,
  DG_MOONLIGHT_SILVER,
  DG_NIGHTMARE_RED,
  DG_BLOSSOM_PINK,
  DG_MIST_TEAL,
  DG_STAR_SEED_GOLD,
  DG_SLUMBER_INDIGO,
];

// ============================================================
// SECTION 4: DG_SPECIES — 7 Species Types
// ============================================================

const DG_SPECIES: { id: DgSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'dream_weaver',
    name: 'Dream Weaver',
    description: 'Ethereal beings who spin threads of raw dreamstuff into living tapestries of fantasy.',
    lore: 'Dream Weavers were born at the moment the first sentient being fell asleep, tasked with weaving the fabric of all dreams.',
    emoji: '🧶',
    color: DG_DREAM_LAVENDER,
  },
  {
    id: 'moonlit_fox',
    name: 'Moonlit Fox',
    description: 'Spectral foxes that run along beams of moonlight, carrying whispered secrets between sleeping minds.',
    lore: 'Moonlit Foxes only appear during the full moon, their silver fur glowing with borrowed lunar radiance.',
    emoji: '🦊',
    color: DG_MOONLIGHT_SILVER,
  },
  {
    id: 'slumber_dragon',
    name: 'Slumber Dragon',
    description: 'Ancient dragons that sleep for centuries beneath the garden, their dreams shaping the dreamscape.',
    lore: 'Slumber Dragons dream so deeply that entire dreamscapes are formed from a single one of their sleeping thoughts.',
    emoji: '🐉',
    color: DG_SLUMBER_INDIGO,
  },
  {
    id: 'blossom_fairy',
    name: 'Blossom Fairy',
    description: 'Tiny winged spirits born from fallen petals, tending to the garden\'s sentient flowers.',
    lore: 'Blossom Fairies are reborn each dawn from the dewdrops on the garden\'s most beautiful flowers.',
    emoji: '🧚',
    color: DG_BLOSSOM_PINK,
  },
  {
    id: 'nightmare_hound',
    name: 'Nightmare Hound',
    description: 'Terrifying shadow beasts that hunt stray nightmares, keeping the garden safe from dark intrusions.',
    lore: 'Nightmare Hounds are not evil — they are the garden\'s guardians, consuming fear to keep the dreamscape pure.',
    emoji: '🐺',
    color: DG_NIGHTMARE_RED,
  },
  {
    id: 'mist_walker',
    name: 'Mist Walker',
    description: 'Translucent beings formed from the garden\'s morning mist, drifting between dream zones unseen.',
    lore: 'Mist Walkers have no fixed form — they shift shape constantly, reflecting the dreams of whoever observes them.',
    emoji: '🌫️',
    color: DG_MIST_TEAL,
  },
  {
    id: 'star_seed',
    name: 'Star Seed',
    description: 'Luminous celestial entities that fell from the dreamscape sky as tiny points of living starlight.',
    lore: 'Star Seeds contain entire micro-dreams within their radiant cores, each one a universe waiting to bloom.',
    emoji: '⭐',
    color: DG_STAR_SEED_GOLD,
  },
];

// ============================================================
// SECTION 5: DG_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const DG_CREATURES: DgCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'dream_weaver_common', name: 'Threadling', species: 'dream_weaver', rarity: 'common',
    description: 'A tiny dream weaver just learning to spin its first threads of dreamstuff.',
    lore: 'Threadlings often tangle their own threads, creating small knots that manifest as forgotten dreams upon waking.',
    emoji: '🧶', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'moonlit_fox_common', name: 'Dusk Pup', species: 'moonlit_fox', rarity: 'common',
    description: 'A young fox cub whose fur shimmers with the faintest hint of moonlight.',
    lore: 'Dusk Pups are born blind but can see perfectly in dreams, guiding lost sleepers back to pleasant rest.',
    emoji: '🦊', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'slumber_dragon_common', name: 'Nap Hatchling', species: 'slumber_dragon', rarity: 'common',
    description: 'A baby dragon that yawns constantly, its tiny snores producing miniature cloud puffs.',
    lore: 'Nap Hatchlings sleep 23 hours a day, spending their single waking hour exploring in a drowsy haze.',
    emoji: '🐉', power: 7, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'blossom_fairy_common', name: 'Petal Sprout', species: 'blossom_fairy', rarity: 'common',
    description: 'A newly budded fairy no larger than a dewdrop, barely able to flutter its wings.',
    lore: 'Petal Sprouts are so light they ride on the breath of sleeping children, whispering lullabies.',
    emoji: '🧚', power: 9, defense: 12, cost: 16, xpReward: 6,
  },
  {
    id: 'nightmare_hound_common', name: 'Shadow Pup', species: 'nightmare_hound', rarity: 'common',
    description: 'A small dark-furred pup with glowing red eyes that yips at bad dreams.',
    lore: 'Shadow Pups are actually quite playful — their fearsome appearance is just nightmare camouflage.',
    emoji: '🐺', power: 6, defense: 7, cost: 15, xpReward: 6,
  },
  {
    id: 'mist_walker_common', name: 'Wisp Drift', species: 'mist_walker', rarity: 'common',
    description: 'A small puff of sentient mist that drifts aimlessly through the garden paths.',
    lore: 'Wisp Drifts often merge with morning fog, becoming indistinguishable from natural mist.',
    emoji: '🌫️', power: 7, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'star_seed_common', name: 'Spark Grain', species: 'star_seed', rarity: 'common',
    description: 'A tiny glowing speck of stardust that pulses with a gentle warm light.',
    lore: 'Spark Grains are the fragments of dead stars that drifted down from the dreamscape sky eons ago.',
    emoji: '⭐', power: 8, defense: 7, cost: 17, xpReward: 7,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'dream_weaver_uncommon', name: 'Veil Spinner', species: 'dream_weaver', rarity: 'uncommon',
    description: 'A skilled weaver that can spin veils of illusion to hide dream zones from intruders.',
    lore: 'Veil Spinners weave camouflage so perfect that even other dream creatures cannot penetrate their illusions.',
    emoji: '🧶', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'moonlit_fox_uncommon', name: 'Silver Runner', species: 'moonlit_fox', rarity: 'uncommon',
    description: 'A swift fox that runs on moonbeams, leaving trails of silver light in its wake.',
    lore: 'Silver Runners can cross between dreams in a single bound, carrying messages from one sleeping mind to another.',
    emoji: '🦊', power: 20, defense: 15, cost: 55, xpReward: 18,
  },
  {
    id: 'slumber_dragon_uncommon', name: 'Twilight Wyrmling', species: 'slumber_dragon', rarity: 'uncommon',
    description: 'A young dragon whose scales shimmer with the colors of the dusk sky.',
    lore: 'Twilight Wyrmlings guard the boundary between waking and sleeping, ensuring smooth transitions for all dreamers.',
    emoji: '🐉', power: 24, defense: 14, cost: 65, xpReward: 22,
  },
  {
    id: 'blossom_fairy_uncommon', name: 'Rose Flutter', species: 'blossom_fairy', rarity: 'uncommon',
    description: 'A graceful fairy with rose-petal wings that scatter healing pollen as it flies.',
    lore: 'Rose Flutter pollen can mend even the most troubled dreams, turning nightmares into pleasant reveries.',
    emoji: '🧚', power: 18, defense: 24, cost: 50, xpReward: 16,
  },
  {
    id: 'nightmare_hound_uncommon', name: 'Dusk Tracker', species: 'nightmare_hound', rarity: 'uncommon',
    description: 'A lean hound that can track nightmare creatures across the entire dreamscape by scent alone.',
    lore: 'Dusk Trackers never lose a trail — they can follow a nightmare\'s scent through layers of dreams.',
    emoji: '🐺', power: 16, defense: 22, cost: 50, xpReward: 17,
  },
  {
    id: 'mist_walker_uncommon', name: 'Fog Phantom', species: 'mist_walker', rarity: 'uncommon',
    description: 'A larger mist entity that can assume the approximate shape of any creature it observes.',
    lore: 'Fog Phantoms are masters of mimicry, though their copies always retain a telltale misty translucence.',
    emoji: '🌫️', power: 21, defense: 16, cost: 58, xpReward: 19,
  },
  {
    id: 'star_seed_uncommon', name: 'Glow Orb', species: 'star_seed', rarity: 'uncommon',
    description: 'A basketball-sized orb of concentrated starlight that illuminates dream zones with warm radiance.',
    lore: 'Glow Orbs are sometimes mistaken for moons by dreamers, their light so steady and pure.',
    emoji: '⭐', power: 19, defense: 17, cost: 55, xpReward: 18,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'dream_weaver_rare', name: 'Dream Loom', species: 'dream_weaver', rarity: 'rare',
    description: 'A master weaver operating a living loom that weaves entire dreamscapes from raw imagination.',
    lore: 'Dream Looms can create pocket dreamscapes — self-contained dream worlds that exist within a single night\'s sleep.',
    emoji: '🧶', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'moonlit_fox_rare', name: 'Eclipse Runner', species: 'moonlit_fox', rarity: 'rare',
    description: 'A legendary fox that runs between moon and shadow, existing in both states simultaneously.',
    lore: 'Eclipse Runners appear only during lunar eclipses, their twin tails weaving patterns in the darkened sky.',
    emoji: '🦊', power: 38, defense: 30, cost: 180, xpReward: 45,
  },
  {
    id: 'slumber_dragon_rare', name: 'Cloud Serpent', species: 'slumber_dragon', rarity: 'rare',
    description: 'A serpentine dragon that sleeps coiled within thunderheads, dreaming the weather into being.',
    lore: 'Cloud Serpents are responsible for the weather in dreams — sunny skies one moment, gentle rain the next.',
    emoji: '🐉', power: 42, defense: 28, cost: 220, xpReward: 55,
  },
  {
    id: 'blossom_fairy_rare', name: 'Bloom Guardian', species: 'blossom_fairy', rarity: 'rare',
    description: 'A powerful fairy that guards the garden\'s most precious sentient flowers with thorned magic.',
    lore: 'Bloom Guardians can awaken dormant flowers with a single touch, causing entire meadows to bloom instantly.',
    emoji: '🧚', power: 35, defense: 42, cost: 190, xpReward: 48,
  },
  {
    id: 'nightmare_hound_rare', name: 'Terror Howler', species: 'nightmare_hound', rarity: 'rare',
    description: 'A massive hound whose howl shatters nightmares into harmless dream fragments.',
    lore: 'Terror Howlers are feared by all nightmare creatures — their howl is the most powerful weapon in the dreamscape.',
    emoji: '🐺', power: 32, defense: 38, cost: 200, xpReward: 50,
  },
  {
    id: 'mist_walker_rare', name: 'Veil Wraith', species: 'mist_walker', rarity: 'rare',
    description: 'A powerful mist entity that can create walls of impenetrable fog to shield allies.',
    lore: 'Veil Wraiths once served as the garden\'s primary defense, before the Nightmare Hounds were cultivated.',
    emoji: '🌫️', power: 37, defense: 32, cost: 200, xpReward: 52,
  },
  {
    id: 'star_seed_rare', name: 'Constellation Heart', species: 'star_seed', rarity: 'rare',
    description: 'A radiant star entity that projects miniature constellations across the dreamscape ceiling.',
    lore: 'Constellation Hearts map the dreams of every sleeping being, connecting them through patterns of light.',
    emoji: '⭐', power: 36, defense: 34, cost: 195, xpReward: 49,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'dream_weaver_epic', name: 'Fate Tapestry', species: 'dream_weaver', rarity: 'epic',
    description: 'An ancient weaver whose tapestries depict the future, woven from the threads of destiny.',
    lore: 'The Fate Tapestry is said to be weaving the dream of the world itself — every thread a living soul.',
    emoji: '🧶', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'moonlit_fox_epic', name: 'Lunar Sovereign', species: 'moonlit_fox', rarity: 'epic',
    description: 'A nine-tailed fox of pure moonlight that commands the tides of every dreamer\'s sleep cycle.',
    lore: 'The Lunar Sovereign\'s nine tails each control a different phase of sleep, from light dozing to deepest REM.',
    emoji: '🦊', power: 68, defense: 52, cost: 750, xpReward: 110,
  },
  {
    id: 'slumber_dragon_epic', name: 'Dreamheart Wyrm', species: 'slumber_dragon', rarity: 'epic',
    description: 'A colossal dragon whose heartbeat creates the rhythm of every dream in existence.',
    lore: 'The Dreamheart Wyrm sleeps at the center of the dreamscape, each heartbeat sending waves of dream energy outward.',
    emoji: '🐉', power: 72, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'blossom_fairy_epic', name: 'Eternal Blossom Queen', species: 'blossom_fairy', rarity: 'epic',
    description: 'The queen of all blossom fairies, commanding an army of flower spirits across the garden.',
    lore: 'The Eternal Blossom Queen\'s crown is made of flowers that have never wilted, blooming since the first dream.',
    emoji: '🧚', power: 60, defense: 72, cost: 780, xpReward: 115,
  },
  {
    id: 'nightmare_hound_epic', name: 'Apex Shadow', species: 'nightmare_hound', rarity: 'epic',
    description: 'The largest nightmare hound ever cultivated, its shadow consuming all darkness in its path.',
    lore: 'The Apex Shadow does not hunt nightmares — it IS the nightmare that other nightmares fear.',
    emoji: '🐺', power: 62, defense: 58, cost: 780, xpReward: 115,
  },
  {
    id: 'mist_walker_epic', name: 'Storm Phantom', species: 'mist_walker', rarity: 'epic',
    description: 'A titanic mist entity that generates entire weather systems within the dreamscape.',
    lore: 'Storm Phantoms can blanket the entire garden in dense fog, creating temporary dream zones that exist for only one night.',
    emoji: '🌫️', power: 66, defense: 55, cost: 820, xpReward: 125,
  },
  {
    id: 'star_seed_epic', name: 'Nova Core', species: 'star_seed', rarity: 'epic',
    description: 'A brilliant stellar entity on the verge of supernova, radiating blinding dream energy.',
    lore: 'Nova Cores are extremely rare — when one finally goes supernova, it births an entirely new dreamscape.',
    emoji: '⭐', power: 64, defense: 60, cost: 800, xpReward: 120,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'dream_weaver_legendary', name: 'Dreamscape Architect', species: 'dream_weaver', rarity: 'legendary',
    description: 'The primordial weaver who created the entire dreamscape from a single infinite thread.',
    lore: 'The Dreamscape Architect is the oldest being in existence — it dreamed the universe into being before the first star ignited.',
    emoji: '🧶', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'moonlit_fox_legendary', name: 'Celestial Kitsune', species: 'moonlit_fox', rarity: 'legendary',
    description: 'A thousand-tailed fox made of pure starlight and moonbeams, spanning the entire night sky.',
    lore: 'The Celestial Kitsune\'s tails contain every dream ever dreamed — past, present, and those yet to come.',
    emoji: '🦊', power: 115, defense: 95, cost: 2800, xpReward: 280,
  },
  {
    id: 'slumber_dragon_legendary', name: 'Eternal Sleeper', species: 'slumber_dragon', rarity: 'legendary',
    description: 'The primordial dragon whose eternal dream IS the dreamscape itself — all dreams exist within it.',
    lore: 'If the Eternal Sleeper ever truly wakes, the entire dreamscape would vanish — and every dream would become reality.',
    emoji: '🐉', power: 125, defense: 90, cost: 3200, xpReward: 320,
  },
  {
    id: 'blossom_fairy_legendary', name: 'World Tree Dryad', species: 'blossom_fairy', rarity: 'legendary',
    description: 'A fairy of cosmic scale whose body IS the garden — every flower, every tree, every blade of dream-grass.',
    lore: 'The World Tree Dryad blooms and wilts with the cycle of ages, her flowers marking the passage of dream millennia.',
    emoji: '🧚', power: 110, defense: 130, cost: 2900, xpReward: 290,
  },
  {
    id: 'nightmare_hound_legendary', name: 'Void Hound', species: 'nightmare_hound', rarity: 'legendary',
    description: 'A hound born from the void between dreams, capable of consuming entire nightmare dimensions.',
    lore: 'The Void Hound guards the boundary where dreams end and nothing begins — it has never lost a chase.',
    emoji: '🐺', power: 108, defense: 110, cost: 3100, xpReward: 310,
  },
  {
    id: 'mist_walker_legendary', name: 'Dream Ocean', species: 'mist_walker', rarity: 'legendary',
    description: 'A mist entity of incomprehensible scale that forms the ocean upon which the dreamscape floats.',
    lore: 'The Dream Ocean separates the conscious mind from the deep subconscious — all dreams must cross its waters.',
    emoji: '🌫️', power: 112, defense: 100, cost: 2900, xpReward: 290,
  },
  {
    id: 'star_seed_legendary', name: 'Dreamsun', species: 'star_seed', rarity: 'legendary',
    description: 'The original star seed — a miniature sun that illuminates the entire dreamscape with eternal dawn light.',
    lore: 'The Dreamsun was the first thing ever dreamed — from its light, all other dreams grew like flowers reaching for warmth.',
    emoji: '⭐', power: 118, defense: 98, cost: 3500, xpReward: 350,
  },
];

// ============================================================
// SECTION 6: DG_CHAMBERS — 8 Dream Zones
// ============================================================

const DG_CHAMBERS: DgChamberDef[] = [
  {
    id: 'dewdrop_meadow', name: 'Dewdrop Meadow', emoji: '🌿',
    description: 'A gentle meadow covered in glistening dew where the simplest and sweetest dreams take root.',
    lore: 'Dewdrop Meadow was the first part of the Dream Garden to bloom, created from a child\'s very first dream.',
    level: 1, resources: ['dream_dew', 'lunar_petal', 'sleep_moss'], capacity: 10,
    unlockLevel: 1, ambientColor: DG_BLOSSOM_PINK, dangerLevel: 1,
  },
  {
    id: 'moonlit_grove', name: 'Moonlit Grove', emoji: '🌙',
    description: 'A serene grove bathed in perpetual moonlight where dream weavers gather to share visions.',
    lore: 'The Moonlit Grove\'s trees grow upside-down, their roots reaching toward the moon and their branches plunging into dream-soil.',
    level: 3, resources: ['moonbeam_shard', 'silver_leaf', 'night_bloom'], capacity: 15,
    unlockLevel: 3, ambientColor: DG_MOONLIGHT_SILVER, dangerLevel: 2,
  },
  {
    id: 'whispering_pond', name: 'Whispering Pond', emoji: '💧',
    description: 'A still pond whose surface reflects not the sky but the dreams of those who gaze into it.',
    lore: 'The Whispering Pond speaks in ripples — each ripple carries a whisper from a sleeping mind somewhere in the world.',
    level: 5, resources: ['dream_dew', 'moonbeam_shard', 'echo_droplet'], capacity: 20,
    unlockLevel: 5, ambientColor: DG_MIST_TEAL, dangerLevel: 3,
  },
  {
    id: 'starfall_clearing', name: 'Starfall Clearing', emoji: '✨',
    description: 'An open clearing where stars constantly fall from the dreamscape sky, planting new star seeds.',
    lore: 'Every star that falls in Starfall Clearing contains the beginning of a new dream — some grow, some fade.',
    level: 10, resources: ['starlight_dust', 'nova_fragment', 'dream_dew'], capacity: 25,
    unlockLevel: 10, ambientColor: DG_STAR_SEED_GOLD, dangerLevel: 4,
  },
  {
    id: 'nightshade_thicket', name: 'Nightshade Thicket', emoji: '🌑',
    description: 'A dark thicket where nightmare creatures lurk, their corrupted dreams twisting the flora.',
    lore: 'The Nightshade Thicket was once a beautiful garden — it was corrupted when the first nightmare invaded the dreamscape.',
    level: 15, resources: ['shadow_petal', 'dark_nectar', 'echo_droplet'], capacity: 30,
    unlockLevel: 15, ambientColor: DG_NIGHTMARE_RED, dangerLevel: 5,
  },
  {
    id: 'crystal_canopy', name: 'Crystal Canopy', emoji: '💠',
    description: 'A vast cathedral of crystalline dream-flowers that refract light into prismatic dream visions.',
    lore: 'The Crystal Canopy was grown from a single seed of pure imagination planted by the Dreamscape Architect.',
    level: 20, resources: ['dream_crystal', 'moonbeam_shard', 'silver_leaf'], capacity: 35,
    unlockLevel: 20, ambientColor: DG_DREAM_LAVENDER, dangerLevel: 6,
  },
  {
    id: 'slumber_depths', name: 'Slumber Depths', emoji: '🌀',
    description: 'The deepest layer of the dreamscape where time flows backwards and memories become tangible.',
    lore: 'In the Slumber Depths, forgotten memories take physical form — old toys, lost friends, childhood homes all drift like islands.',
    level: 30, resources: ['memory_shard', 'shadow_petal', 'dream_crystal'], capacity: 40,
    unlockLevel: 30, ambientColor: DG_SLUMBER_INDIGO, dangerLevel: 8,
  },
  {
    id: 'dream_heart', name: 'Dream Heart', emoji: '💜',
    description: 'The pulsing center of the entire Dream Garden, where the Eternal Sleeper\'s heartbeat resonates.',
    lore: 'The Dream Heart beats once per century — each beat sends a wave of pure dream energy that refreshes the entire garden.',
    level: 40, resources: ['eternal_nectar', 'dream_crystal', 'nova_fragment'], capacity: 50,
    unlockLevel: 40, ambientColor: '#9C27B0', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: DG_MATERIALS — 12 Materials
// ============================================================

const DG_MATERIALS: DgMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'dream_dew', name: 'Dream Dew', emoji: '💧', rarity: 'common', value: 5,
    category: 'nectar', craftBonus: 1,
    description: 'Glistening droplets of condensed dreamstuff collected from garden flowers at dawn.',
    lore: 'Dream Dew is the most fundamental resource in the garden — even the simplest creatures need it to bloom.',
  },
  {
    id: 'sleep_moss', name: 'Sleep Moss', emoji: '🌿', rarity: 'common', value: 4,
    category: 'organic', craftBonus: 1,
    description: 'Soft velvety moss that grows only where dreams are deepest and most peaceful.',
    lore: 'Sleep Moss is used as a cultivation base, providing nutrients that help dream creatures take root and grow.',
  },
  {
    id: 'lunar_petal', name: 'Lunar Petal', emoji: '🌸', rarity: 'common', value: 5,
    category: 'petal', craftBonus: 2,
    description: 'Silvery-white petals shed by moonflowers that bloom only in the palest moonlight.',
    lore: 'Lunar Petals are the primary ingredient in cultivation rituals, their silver essence binding dreamstuff together.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'moonbeam_shard', name: 'Moonbeam Shard', emoji: '🌙', rarity: 'uncommon', value: 15,
    category: 'crystal', craftBonus: 3,
    description: 'Crystallized moonlight that shattered when a beam struck the garden canopy.',
    lore: 'Moonbeam Shards retain the moon\'s gentle glow indefinitely, making them perfect lanterns for dark dream zones.',
  },
  {
    id: 'silver_leaf', name: 'Silver Leaf', emoji: '🍃', rarity: 'uncommon', value: 12,
    category: 'organic', craftBonus: 2,
    description: 'Leaves from the upside-down trees of the Moonlit Grove, metallic and shimmering.',
    lore: 'Silver Leaves can be folded into origami creatures that come alive within dreams, serving as scouts and messengers.',
  },
  {
    id: 'night_bloom', name: 'Night Bloom', emoji: '🌼', rarity: 'uncommon', value: 14,
    category: 'petal', craftBonus: 3,
    description: 'A flower that blooms only in total darkness, emitting a soft bioluminescent glow.',
    lore: 'Night Blooms are the garden\'s natural nightlights — they automatically open when any zone becomes too dark.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'echo_droplet', name: 'Echo Droplet', emoji: '🫧', rarity: 'rare', value: 50,
    category: 'essence', craftBonus: 6,
    description: 'A droplet from the Whispering Pond containing the captured echo of a forgotten dream.',
    lore: 'Echo Droplets can replay the dream they contain when touched to the forehead — a window into someone\'s deepest thoughts.',
  },
  {
    id: 'starlight_dust', name: 'Starlight Dust', emoji: '✨', rarity: 'rare', value: 55,
    category: 'starlight', craftBonus: 7,
    description: 'Fine dust shed by falling stars in the Starfall Clearing, warm to the touch.',
    lore: 'Starlight Dust is the garden\'s most versatile material — it can enhance any creature, structure, or ability.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'dream_crystal', name: 'Dream Crystal', emoji: '💎', rarity: 'epic', value: 150,
    category: 'crystal', craftBonus: 12,
    description: 'A crystal grown from pure concentrated dream energy, refracting visions of possible futures.',
    lore: 'Dream Crystals form naturally in the Crystal Canopy over millennia, each one containing a complete dreamscape within its facets.',
  },
  {
    id: 'nova_fragment', name: 'Nova Fragment', emoji: '💥', rarity: 'epic', value: 160,
    category: 'starlight', craftBonus: 13,
    description: 'A shard of a star seed that went supernova, still radiating explosive creative energy.',
    lore: 'Nova Fragments are extremely volatile — in the wrong hands they can create dreams so powerful they trap the dreamer forever.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'memory_shard', name: 'Memory Shard', emoji: '🧠', rarity: 'legendary', value: 600,
    category: 'essence', craftBonus: 25,
    description: 'A tangible fragment of a deeply forgotten memory, warm with the emotion of the original moment.',
    lore: 'Memory Shards are the rarest material in the garden — they can only be found in the Slumber Depths, and only by those who have forgotten something truly precious.',
  },
  {
    id: 'eternal_nectar', name: 'Eternal Nectar', emoji: '🍯', rarity: 'legendary', value: 700,
    category: 'nectar', craftBonus: 28,
    description: 'The nectar of immortality, harvested from the Dream Heart\'s eternal flowers that never wilt.',
    lore: 'Eternal Nectar grants any creature that consumes it a fraction of true immortality — their dream will never end.',
  },
];

// ============================================================
// SECTION 8: DG_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const DG_STRUCTURES: DgStructureDef[] = [
  {
    id: 'dream_greenhouse', name: 'Dream Greenhouse', emoji: '🏡',
    description: 'A crystalline greenhouse where dream flowers are cultivated and nurtured to full bloom.',
    lore: 'The Dream Greenhouse was the first structure built in the garden, its walls made of frozen moonbeams and woven dreamstuff.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'cultivateDiscount', bonusPerLevel: 2,
  },
  {
    id: 'nectar_distillery', name: 'Nectar Distillery', emoji: '⚗️',
    description: 'An alchemical still that processes raw dream materials into potent cultivation reagents.',
    lore: 'The Nectar Distillery runs on pure imagination — the more vivid the distiller\'s daydreams, the better the output.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'moonlight_bridge', name: 'Moonlight Bridge', emoji: '🌉',
    description: 'A shimmering bridge of solidified moonlight connecting distant dream zones.',
    lore: 'Moonlight Bridges exist only because someone is dreaming them — if all dreamers forget, the bridge dissolves.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'dream_vault', name: 'Dream Vault', emoji: '🏦',
    description: 'A secure vault protected by layers of lucid dream barriers for storing precious artifacts.',
    lore: 'The Dream Vault\'s locks can only be opened by someone who is fully aware they are dreaming.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'blossom_bastion', name: 'Blossom Bastion', emoji: '🏰',
    description: 'A living fortress made of thorned vines and hardened dream-petal walls.',
    lore: 'The Blossom Bastion grows stronger with every nightmare it repels, its thorns becoming sharper and its walls thicker.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'starlight_lantern', name: 'Starlight Lantern', emoji: '🏮',
    description: 'A colossal lantern fueled by star seeds that illuminates the entire garden permanently.',
    lore: 'The Starlight Lantern\'s flame was lit by the Dreamsun itself and has never been extinguished since.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'energyBonus', bonusPerLevel: 6,
  },
  {
    id: 'moonbeam_observatory', name: 'Moonbeam Observatory', emoji: '🔭',
    description: 'An observatory that peers through the dreamscape ceiling into the realm of waking stars.',
    lore: 'From the Moonbeam Observatory, dream weavers can observe the sleeping world and gather inspiration for new dreams.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'nectarYield', bonusPerLevel: 6,
  },
  {
    id: 'dreamweaver_forge', name: 'Dreamweaver Forge', emoji: '🔨',
    description: 'A forge that shapes raw dreamstuff into powerful artifacts and enhanced cultivation tools.',
    lore: 'The Dreamweaver Forge burns with cold fire — it hardens dreams into reality by removing all uncertainty.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: DG_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const DG_ABILITIES: DgAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'lunar_strike', name: 'Lunar Strike', category: 'offensive',
    description: 'Channels concentrated moonlight into a devastating beam that burns away nightmare corruption.',
    lore: 'Lunar Strike was the first offensive ability ever developed, created by the Dreamscape Architect to defend the garden.',
    emoji: '🌙', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'dream_shatter', name: 'Dream Shatter', category: 'offensive',
    description: 'Shatters an enemy\'s dream form by disrupting the dreamstuff that holds them together.',
    lore: 'Dream Shatter is dangerous even to the user — it requires complete lucidity to avoid shattering your own dream self.',
    emoji: '💥', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'petal_barrier', name: 'Petal Barrier', category: 'defensive',
    description: 'Summons a swirling wall of enchanted petals that absorbs incoming nightmare energy.',
    lore: 'Petal Barriers smell of every flower that has ever bloomed in the garden — the scent alone can calm any nightmare.',
    emoji: '🌸', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'mist_shroud', name: 'Mist Shroud', category: 'defensive',
    description: 'Wraps the user in a thick shroud of protective dream mist that hides them from all threats.',
    lore: 'Mist Shrouds are so effective that users often forget they exist, becoming part of the mist themselves.',
    emoji: '🌫️', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'dream_sight', name: 'Dream Sight', category: 'utility',
    description: 'Enhances perception to see through dream illusions and reveal hidden dream zones.',
    lore: 'Dream Sight was discovered when a Mist Walker accidentally looked at its own reflection and saw its true form.',
    emoji: '👁️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'memory_recall', name: 'Memory Recall', category: 'utility',
    description: 'Recovers forgotten dream memories from the Slumber Depths, restoring lost knowledge.',
    lore: 'Memory Recall can retrieve any dream ever forgotten — but the memories return with all their original emotional intensity.',
    emoji: '🧠', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'fairy_swarm', name: 'Fairy Swarm', category: 'summon',
    description: 'Calls a swarm of blossom fairies to overwhelm enemies with healing pollen and blinding sparkle.',
    lore: 'Fairy Swarms are the garden\'s natural response to nightmare incursions — they appear instinctively when danger threatens.',
    emoji: '🧚', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'hound_pack', name: 'Hound Pack', category: 'summon',
    description: 'Summons a pack of nightmare hounds to hunt down and devour any nightmare creatures in range.',
    lore: 'Hound Packs communicate through howls that resonate across the entire dreamscape, coordinating their hunt telepathically.',
    emoji: '🐺', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: DG_ACHIEVEMENTS — 10 Achievements
// ============================================================

const DG_ACHIEVEMENTS: DgAchievementDef[] = [
  {
    id: 'ach_first_bloom', name: 'First Bloom', emoji: '🌱',
    description: 'Cultivate your first dream creature and witness the miracle of dream-birth.',
    conditionKey: 'totalCultivated', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_bloom_10', name: 'Garden Tender', emoji: '🌻',
    description: 'Cultivate 10 dream creatures and establish yourself as a capable garden tender.',
    conditionKey: 'totalCultivated', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_bloom_25', name: 'Dream Florist', emoji: '💐',
    description: 'Cultivate 25 dream creatures and earn the title of master Dream Florist.',
    conditionKey: 'totalCultivated', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_explore_3', name: 'Dream Walker', emoji: '🌙',
    description: 'Discover 3 different dream zones and begin mapping the garden\'s hidden paths.',
    conditionKey: 'totalZonesExplored', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_explore_all', name: 'Garden Cartographer', emoji: '🗺️',
    description: 'Explore all 8 dream zones and complete the definitive garden map.',
    conditionKey: 'totalZonesExplored', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Garden Architect', emoji: '🏗️',
    description: 'Build 3 different garden structures to establish your dream outpost.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Dream Relic Finder', emoji: '💎',
    description: 'Activate your first dream artifact and unlock its hidden power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Dream Survivor', emoji: '🌀',
    description: 'Survive 5 random garden events without being consumed by nightmares.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Dream Veteran', emoji: '🧚',
    description: 'Reach garden tender level 25 and gain access to the deepest dream zones.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Dream Garden Master', emoji: '👑',
    description: 'Reach the maximum garden tender level 50 and master the entire dreamscape.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: DG_TITLES — 8 Title Progression
// ============================================================

const DG_TITLES: DgTitleDef[] = [
  {
    id: 'title_garden_sprout', name: 'Garden Sprout', emoji: '🌱',
    description: 'A newcomer to the Dream Garden, marveling at the ethereal beauty of the dreamscape.',
    lore: 'Every dream master once stood at the garden\'s edge, wondering if the flowers were real or just another layer of dream.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_dream_wanderer', name: 'Dream Wanderer', emoji: '🧭',
    description: 'An adventurous soul wandering through the garden\'s moonlit paths, discovering hidden dream zones.',
    lore: 'Dream Wanderers learn to read the garden\'s flowers like a map, following bloom patterns to find secret zones.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_petal_cultivator', name: 'Petal Cultivator', emoji: '🌸',
    description: 'A dedicated cultivator who nurtures dream flowers from seed to full sentient bloom.',
    lore: 'Petal Cultivators sing to their flowers every night, their lullabies shaping the creatures that emerge from the blooms.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_moonlight_weaver', name: 'Moonlight Weaver', emoji: '🌙',
    description: 'A skilled weaver who spins moonlight into tools and structures for the garden.',
    lore: 'Moonlight Weavers work only at night, their fingers tracing patterns in moonbeams that solidify into garden structures.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_dreamwarden', name: 'Dreamwarden', emoji: '🛡️',
    description: 'A guardian of the garden who stands vigil against nightmare incursions from the dark.',
    lore: 'Dreamwardens never sleep — they are always awake within the dream, watching for the first signs of corruption.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_nightmare_tamer', name: 'Nightmare Tamer', emoji: '🐺',
    description: 'A brave soul who has learned to command nightmare creatures instead of fearing them.',
    lore: 'Nightmare Tamers understand that nightmares are just dreams that got lost — and every lost dream wants to be found.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_starseed_harvester', name: 'Starseed Harvester', emoji: '⭐',
    description: 'A celestial gardener who harvests falling stars to plant new dream zones.',
    lore: 'Starseed Harvesters climb to the highest point of the dreamscape each dawn to catch falling stars in enchanted nets.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_dream_garden_master', name: 'Dream Garden Master', emoji: '👑',
    description: 'The supreme master of the Dream Garden, one with the dreamscape and all its infinite possibilities.',
    lore: 'The Dream Garden Master hears the Eternal Sleeper\'s heartbeat in their chest, connected to every dream ever dreamed.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: DG_ARTIFACTS — 6 Artifacts
// ============================================================

const DG_ARTIFACTS: DgArtifactDef[] = [
  {
    id: 'art_moonstone_pendant', name: 'Moonstone Pendant',
    description: 'A pendant of polished moonstone that glows brighter during deep sleep phases.',
    lore: 'The Moonstone Pendant was crafted by the first Moonlight Weaver from a piece of the garden\'s original moonbeam.',
    emoji: '📿', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_dream_catcher', name: 'Dream Catcher',
    description: 'An intricate web of dream threads that captures stray nightmares and converts them into energy.',
    lore: 'This Dream Catcher was woven by the Dreamscape Architect\'s own hands — every thread is a century old.',
    emoji: '🕸️', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_sleeping_mirror', name: 'Sleeping Mirror',
    description: 'A mirror that reflects the dreamer\'s true self, revealing hidden potential and latent abilities.',
    lore: 'The Sleeping Mirror shows not what you are, but what you could become within the dream — for better or worse.',
    emoji: '🪞', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_eternal_hourglass', name: 'Eternal Hourglass',
    description: 'An hourglass that flows backwards, reversing time within a small area of the dreamscape.',
    lore: 'The Eternal Hourglass contains sand made from ground-up Memory Shards — each grain is a forgotten second.',
    emoji: '⏳', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_dreamheart_shard', name: 'Dreamheart Shard',
    description: 'A fragment of the Dream Heart itself, pulsing with the rhythm of all sleeping beings.',
    lore: 'The Dreamheart Shard was broken off during the garden\'s creation — reuniting it with the Heart would grant ultimate power.',
    emoji: '💜', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_architects_spindle', name: 'Architect\'s Spindle',
    description: 'The original spindle used by the Dreamscape Architect to weave the dreamscape into existence.',
    lore: 'The Architect\'s Spindle still contains enough dreamstuff to create an entirely new universe — if one knows how to use it.',
    emoji: '🧵', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: DG_EVENTS — 8 Random Garden Events
// ============================================================

const DG_EVENTS: DgEventDef[] = [
  {
    id: 'evt_nightmare_surge', name: 'Nightmare Surge',
    description: 'A wave of nightmares floods in from the void, threatening to corrupt the garden\'s outer zones.',
    lore: 'Nightmare Surges occur when too many dreamers in the waking world experience nightmares simultaneously.',
    emoji: '🌑', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'shadow_petal', rewardMaterialCount: 5,
  },
  {
    id: 'evt_lunar_eclipse', name: 'Lunar Eclipse',
    description: 'A dream eclipse darkens the garden, awakening dormant creatures and revealing hidden paths.',
    lore: 'Lunar Eclipses in the dreamscape are the opposite of waking eclipses — instead of darkness hiding things, it reveals them.',
    emoji: '🌑', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'dream_dew', rewardMaterialCount: 5,
  },
  {
    id: 'evt_star_rain', name: 'Star Rain',
    description: 'A shower of star seeds falls across the garden, planting new growth everywhere they land.',
    lore: 'Star Rains are celebrated with garden-wide festivals — every falling star is a potential new dream waiting to bloom.',
    emoji: '✨', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'starlight_dust', rewardMaterialCount: 6,
  },
  {
    id: 'evt_dream_bloom', name: 'Grand Dream Bloom',
    description: 'Every flower in the garden blooms simultaneously, releasing waves of healing dream energy.',
    lore: 'Grand Dream Blooms happen once per dream century — the nectar released can cure even the deepest nightmare corruption.',
    emoji: '🌺', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'moonbeam_shard', rewardMaterialCount: 4,
  },
  {
    id: 'evt_memory_storm', name: 'Memory Storm',
    description: 'A storm of floating memories sweeps through the garden, each one a fragment of a sleeping mind.',
    lore: 'Memory Storms are both beautiful and overwhelming — walking through one you experience thousands of lives in seconds.',
    emoji: '🧠', effectType: 'buff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'echo_droplet', rewardMaterialCount: 3,
  },
  {
    id: 'evt_mist_invasion', name: 'Mist Invasion',
    description: 'The Dream Ocean\'s mist rises and floods the lower garden zones, creating temporary new areas.',
    lore: 'Mist Inversions are the garden\'s way of expanding — each one adds new territory that may or may not persist.',
    emoji: '🌫️', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'silver_leaf', rewardMaterialCount: 2,
  },
  {
    id: 'evt_dragon_dream', name: 'Dragon Dream',
    description: 'The Eternal Sleeper stirs in its ancient slumber, its dream reshaping the garden.',
    lore: 'When the Eternal Sleeper dreams of fire, volcanoes bloom. When it dreams of water, oceans form. Today, it dreams of change.',
    emoji: '🐉', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'dream_crystal', rewardMaterialCount: 3,
  },
  {
    id: 'evt_heart_pulse', name: 'Heart Pulse',
    description: 'The Dream Heart beats, sending a shockwave of pure dream energy through the entire garden.',
    lore: 'Heart Pulses refresh every creature and structure in the garden, temporarily boosting their power to maximum.',
    emoji: '💜', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'dream_dew', rewardMaterialCount: 8,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function dgGenerateInstanceId(): string {
  return `dg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function dgPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function dgCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function dgCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
  const after = current + gained;
  if (after >= needed) {
    const overflow = after - needed;
    setLevel((v) => v + 1);
    return overflow;
  }
  return after;
}

// ============================================================
// SECTION 15: HOOK IMPLEMENTATION
// ============================================================

export default function useDreamGarden() {
  // ---- Core State ----
  const [dgLevel, setDgLevel] = useState(1);
  const [dgXp, setDgXp] = useState(DG_STARTING_XP);
  const [dgCoins, setDgCoins] = useState(DG_STARTING_COINS);
  const [dgTotalXp, setDgTotalXp] = useState(0);
  const [dgTotalCoins, setDgTotalCoins] = useState(0);

  // ---- Collection State ----
  const [dgBloomed, setDgBloomed] = useState<DgOwnedCreature[]>([]);
  const [dgInventory, setDgInventory] = useState<DgInventoryItem[]>([]);
  const [dgStructures, setDgStructures] = useState<DgStructureRecord[]>([]);
  const [dgArtifacts, setDgArtifacts] = useState<DgArtifactRecord[]>([]);
  const [dgAbilities, setDgAbilities] = useState<DgAbilityRecord[]>([]);
  const [dgAchievements, setDgAchievements] = useState<DgAchievementRecord[]>([]);
  const [dgChambers, setDgChambers] = useState<DgChamberRecord[]>([]);
  const [dgEventLog, setDgEventLog] = useState<DgEventLogEntry[]>([]);
  const [dgActiveEvent, setDgActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [dgCurrentTitle, setDgCurrentTitle] = useState('title_garden_sprout');

  // ---- Stats State ----
  const [dgStats, setDgStats] = useState<DgStats>({
    totalCultivated: 0,
    totalZonesExplored: 0,
    totalStructuresBuilt: 0,
    totalArtifacts: 0,
    totalEvents: 0,
    totalCoins: 0,
    totalXp: 0,
  });

  // ---- Refs ----
  const initializedRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef({
    dgLevel, dgXp, dgTotalXp, dgTotalCoins, dgBloomed, dgInventory,
    dgStructures, dgArtifacts, dgAbilities, dgAchievements,
    dgChambers, dgEventLog, dgActiveEvent, dgCurrentTitle, dgStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      dgLevel, dgXp, dgTotalXp, dgTotalCoins, dgBloomed, dgInventory,
      dgStructures, dgArtifacts, dgAbilities, dgAchievements,
      dgChambers, dgEventLog, dgActiveEvent, dgCurrentTitle, dgStats,
    };
  }, [dgLevel, dgXp, dgTotalXp, dgTotalCoins, dgBloomed, dgInventory,
    dgStructures, dgArtifacts, dgAbilities, dgAchievements,
    dgChambers, dgEventLog, dgActiveEvent, dgCurrentTitle, dgStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(DG_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.dgLevel) setDgLevel(data.dgLevel);
        if (data.dgXp) setDgXp(data.dgXp);
        if (data.dgCoins) setDgCoins(data.dgCoins);
        if (data.dgTotalXp) setDgTotalXp(data.dgTotalXp);
        if (data.dgTotalCoins) setDgTotalCoins(data.dgTotalCoins);
        if (data.dgBloomed) setDgBloomed(data.dgBloomed);
        if (data.dgInventory) setDgInventory(data.dgInventory);
        if (data.dgStructures) setDgStructures(data.dgStructures);
        if (data.dgArtifacts) setDgArtifacts(data.dgArtifacts);
        if (data.dgAbilities) setDgAbilities(data.dgAbilities);
        if (data.dgAchievements) setDgAchievements(data.dgAchievements);
        if (data.dgChambers) setDgChambers(data.dgChambers);
        if (data.dgEventLog) setDgEventLog(data.dgEventLog);
        if (data.dgActiveEvent) setDgActiveEvent(data.dgActiveEvent);
        if (data.dgCurrentTitle) setDgCurrentTitle(data.dgCurrentTitle);
        if (data.dgStats) setDgStats(data.dgStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setDgChambers(
      DG_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setDgAbilities(
      DG_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setDgAchievements(
      DG_ACHIEVEMENTS.map((a) => ({
        achievementId: a.id,
        unlocked: false,
        unlockedAt: 0,
      })),
    );
  }, []);

  // ============================================================
  // AUTO-SAVE EFFECT
  // ============================================================

  useEffect(() => {
    if (!initializedRef.current) return;
    autoSaveTimerRef.current = setInterval(() => {
      try {
        const saveData = {
          dgLevel, dgXp, dgCoins, dgTotalXp, dgTotalCoins,
          dgBloomed, dgInventory, dgStructures, dgArtifacts,
          dgAbilities, dgAchievements, dgChambers, dgEventLog,
          dgActiveEvent, dgCurrentTitle, dgStats,
        };
        localStorage.setItem(DG_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, DG_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [dgLevel, dgXp, dgCoins, dgTotalXp, dgTotalCoins,
    dgBloomed, dgInventory, dgStructures, dgArtifacts,
    dgAbilities, dgAchievements, dgChambers, dgEventLog,
    dgActiveEvent, dgCurrentTitle, dgStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!dgActiveEvent) return;
    const evt = DG_EVENTS.find((e) => e.id === dgActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setDgActiveEvent(null);
      setDgEventLog((prev) =>
        prev.map((e) => (e.eventId === dgActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [dgActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...DG_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => dgLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === dgCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setDgCurrentTitle(nextTitle.id);
    }
  }, [dgLevel, dgCurrentTitle]);

  // ============================================================
  // COMPUTED: dgMaxXp
  // ============================================================

  const dgMaxXp = useMemo(() => {
    return Math.floor(DG_XP_BASE * Math.pow(dgLevel + 1, DG_XP_SCALE));
  }, [dgLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(DG_XP_BASE * Math.pow(lvl, DG_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(dgLevel + 1);
    return Math.max(0, needed - dgXp);
  }, [dgLevel, dgXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(dgLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((dgXp / needed) * 100), 100);
  }, [dgLevel, dgXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): DgCreatureDef | undefined => {
    return DG_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): DgChamberDef | undefined => {
    return DG_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): DgMaterialDef | undefined => {
    return DG_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): DgStructureDef | undefined => {
    return DG_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): DgAbilityDef | undefined => {
    return DG_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): DgArtifactDef | undefined => {
    return DG_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): DgAchievementDef | undefined => {
    return DG_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): DgTitleDef | undefined => {
    return DG_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): DgEventDef | undefined => {
    return DG_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: DgRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: DgRarity): string => {
    return DG_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: DgSpecies): string => {
    return DG_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: cultivateFlower
  // ============================================================

  const cultivateFlower = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (dgCoins < def.cost) return false;
    if (dgBloomed.length >= DG_MAX_BLOOMED_CREATURES) return false;

    const newCreature: DgOwnedCreature = {
      creatureId: def.id,
      instanceId: dgGenerateInstanceId(),
      craftedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setDgCoins((prev) => prev - def.cost);
    setDgBloomed((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = dgCalculateLevelUp(
      xpForLevel(dgLevel + 1),
      dgXp,
      xpGained,
      setDgLevel,
    );
    setDgXp(overflow);
    setDgTotalXp((prev) => prev + xpGained);
    setDgTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setDgStats((prev) => ({ ...prev, totalCultivated: prev.totalCultivated + 1 }));
    return true;
  }, [dgCoins, dgLevel, dgXp, dgBloomed.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreZone
  // ============================================================

  const exploreZone = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (dgLevel < def.unlockLevel) return false;

    setDgChambers((prev) =>
      prev.map((c) =>
        c.chamberId === chamberId
          ? {
              ...c,
              discovered: true,
              explorationPercent: Math.min(c.explorationPercent + 25, 100),
              lastExplored: Date.now(),
              totalVisits: c.totalVisits + 1,
              resourcesGathered: c.resourcesGathered + Math.floor(Math.random() * 3) + 1,
            }
          : c,
      ),
    );

    const bonusMat = dgPickRandom(def.resources);
    if (bonusMat) {
      setDgInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, DG_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setDgTotalXp((prev) => prev + 15);
    setDgTotalCoins((prev) => prev + 5);
    setDgStats((prev) => ({ ...prev, totalZonesExplored: prev.totalZonesExplored + 1 }));
    return true;
  }, [dgLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = dgStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = dgCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (dgCoins < cost) return false;

    setDgCoins((prev) => prev - cost);
    setDgStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setDgTotalXp((prev) => prev + 20);
    setDgStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [dgCoins, dgStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (dgCoins < def.cost) return false;
    if (dgArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setDgCoins((prev) => prev - def.cost);
    setDgArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setDgTotalXp((prev) => prev + 100);
    setDgStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [dgCoins, dgArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerGardenEvent
  // ============================================================

  const triggerGardenEvent = useCallback((): DgEventDef | null => {
    if (dgActiveEvent) return null;
    const event = dgPickRandom(DG_EVENTS);
    setDgActiveEvent(event.id);
    setDgEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setDgTotalXp((prev) => prev + event.rewardXp);
    setDgCoins((prev) => prev + event.rewardCoins);
    setDgTotalCoins((prev) => prev + event.rewardCoins);

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setDgInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, DG_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    setDgStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    return event;
  }, [dgActiveEvent]);

  // ============================================================
  // CORE ACTION: resetDreamGarden
  // ============================================================

  const resetDreamGarden = useCallback(() => {
    setDgLevel(1);
    setDgXp(0);
    setDgCoins(DG_STARTING_COINS);
    setDgTotalXp(0);
    setDgTotalCoins(0);
    setDgBloomed([]);
    setDgInventory([]);
    setDgStructures([]);
    setDgArtifacts([]);
    setDgAbilities(
      DG_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setDgAchievements(
      DG_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setDgChambers(
      DG_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setDgEventLog([]);
    setDgActiveEvent(null);
    setDgCurrentTitle('title_garden_sprout');
    setDgStats({
      totalCultivated: 0, totalZonesExplored: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(DG_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverZone
  // ============================================================

  const discoverZone = useCallback((chamberId: string): boolean => {
    return exploreZone(chamberId);
  }, [exploreZone]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setDgStats((currentStats) => {
      setDgAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalCultivated: currentStats.totalCultivated,
          totalZonesExplored: currentStats.totalZonesExplored,
          totalStructuresBuilt: currentStats.totalStructuresBuilt,
          totalArtifacts: currentStats.totalArtifacts,
          totalEvents: currentStats.totalEvents,
          totalCoins: currentStats.totalCoins,
          totalXp: currentStats.totalXp,
        };
        return prev.map((ach) => {
          if (ach.unlocked) return ach;
          const def = getAchievementDef(ach.achievementId);
          if (def && conditions[def.conditionKey] >= def.targetValue) {
            newlyUnlocked.push(ach.achievementId);
            setDgTotalXp((xp) => xp + def.rewardXp);
            return { ...ach, unlocked: true, unlockedAt: Date.now() };
          }
          return ach;
        });
      });
      return currentStats;
    });
    return newlyUnlocked;
  }, [getAchievementDef]);

  // ============================================================
  // EXTENDED ACTION: useAbility
  // ============================================================

  const useAbility = useCallback((abilityId: string): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;
    const record = dgAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setDgAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setDgTotalXp((prev) => prev + 5);
    return true;
  }, [dgAbilities, getAbilityDef]);

  // ============================================================
  // EXTENDED ACTION: nicknameCreature
  // ============================================================

  const nicknameCreature = useCallback((instanceId: string, nickname: string): boolean => {
    const record = dgBloomed.find((c) => c.instanceId === instanceId);
    if (!record) return false;
    setDgBloomed((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, nickname } : c,
      ),
    );
    return true;
  }, [dgBloomed]);

  // ============================================================
  // EXTENDED ACTION: removeCreature
  // ============================================================

  const removeCreature = useCallback((instanceId: string): boolean => {
    const record = dgBloomed.find((c) => c.instanceId === instanceId);
    if (!record) return false;

    const def = getCreatureDef(record.creatureId);
    const refundAmount = def ? Math.floor(def.cost * 0.5) : 0;

    setDgBloomed((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setDgCoins((prev) => prev + refundAmount);
    return true;
  }, [dgBloomed, getCreatureDef]);

  // ============================================================
  // EXTENDED ACTION: harvestMaterial
  // ============================================================

  const harvestMaterial = useCallback((materialId: string): number => {
    const item = dgInventory.find((i) => i.materialId === materialId);
    if (!item || item.count <= 0) return 0;

    const def = getMaterialDef(materialId);
    if (!def) return 0;

    const harvestCount = Math.min(item.count, 10);
    const totalValue = harvestCount * def.value;

    setDgInventory((prev) =>
      prev.map((i) =>
        i.materialId === materialId
          ? { ...i, count: i.count - harvestCount }
          : i,
      ).filter((i) => i.count > 0),
    );
    setDgCoins((prev) => prev + totalValue);
    setDgTotalCoins((prev) => prev + totalValue);
    return totalValue;
  }, [dgInventory, getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: upgradeAbility
  // ============================================================

  const unlockAbility = useCallback((abilityId: string): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;
    const record = dgAbilities.find((a) => a.abilityId === abilityId);
    if (!record || record.unlocked) return false;
    if (dgLevel < 5) return false;

    setDgAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId ? { ...a, unlocked: true } : a,
      ),
    );
    setDgTotalXp((prev) => prev + 25);
    return true;
  }, [dgLevel, dgAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const dgTitleProgress = useMemo((): DgTitleProgress => {
    const sorted = [...DG_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === dgCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === dgCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((dgLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [dgLevel, dgCurrentTitle]);

  const currentTitleInfo = useMemo(() => dgTitleProgress.current, [dgTitleProgress]);

  const nextTitleInfo = useMemo(() => dgTitleProgress.next, [dgTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesCultivated: dgBloomed.length,
    zonesExplored: dgChambers.filter((c) => c.discovered).length,
    structuresBuilt: dgStructures.length,
    artifactsActive: dgArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: dgAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: dgAbilities.filter((a) => a.unlocked).length,
    totalXp: dgTotalXp,
    totalCoins: dgTotalCoins,
    currentLevel: dgLevel,
    ownedSpeciesCount: new Set(dgBloomed.map((g) => {
      const d = DG_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: dgEventLog.length,
  }), [dgBloomed, dgChambers, dgStructures, dgArtifacts,
    dgAchievements, dgAbilities, dgTotalXp, dgTotalCoins, dgLevel, dgEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      DG_CREATURES.length +
      DG_CHAMBERS.length +
      DG_STRUCTURES.length +
      DG_ARTIFACTS.length +
      DG_ACHIEVEMENTS.length +
      DG_ABILITIES.length;
    const completed =
      dgBloomed.length +
      dgChambers.filter((c) => c.discovered).length +
      dgStructures.length +
      dgArtifacts.filter((a) => a.activated).length +
      dgAchievements.filter((a) => a.unlocked).length +
      dgAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((dgBloomed.length / DG_CREATURES.length) * 100),
      chamberPercent: Math.round((dgChambers.filter((c) => c.discovered).length / DG_CHAMBERS.length) * 100),
      structurePercent: Math.round((dgStructures.length / DG_STRUCTURES.length) * 100),
      artifactPercent: Math.round((dgArtifacts.filter((a) => a.activated).length / DG_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((dgAchievements.filter((a) => a.unlocked).length / DG_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((dgAbilities.filter((a) => a.unlocked).length / DG_ABILITIES.length) * 100),
    };
  }, [dgBloomed, dgChambers, dgStructures, dgArtifacts, dgAchievements, dgAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    dgBloomed.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [dgBloomed, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    dgChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [dgChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    dgStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: dgCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: dgCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [dgStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    dgInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [dgInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    dgArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [dgArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    dgAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [dgAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, DgOwnedCreature[]> = {};
    for (const species of DG_SPECIES) {
      result[species.id] = dgBloomed.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [dgBloomed, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: DgRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, DgOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = dgBloomed.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [dgBloomed, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return DG_CREATURES.filter((c) => c.cost <= dgCoins);
  }, [dgCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalCultivated: dgStats.totalCultivated,
      totalZonesExplored: dgStats.totalZonesExplored,
      totalStructuresBuilt: dgStats.totalStructuresBuilt,
      totalArtifacts: dgStats.totalArtifacts,
      totalEvents: dgStats.totalEvents,
      totalCoins: dgStats.totalCoins,
      totalXp: dgStats.totalXp,
    };
    return DG_ACHIEVEMENTS.filter(
      (a) =>
        !dgAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [dgStats, dgAchievements]);

  const recentEventLog = useMemo(() => {
    return [...dgEventLog].reverse().slice(0, 10);
  }, [dgEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...dgBloomed]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [dgBloomed, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of dgBloomed) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [dgBloomed, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of dgChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [dgChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of dgStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [dgStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of dgAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [dgAbilities]);

  // ============================================================
  // ADDITIONAL COMPUTED: Rarity Breakdown
  // ============================================================

  const inventoryByRarity = useMemo(() => {
    const rarities: DgRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, DgInventoryItem[]> = {};
    for (const r of rarities) {
      result[r] = dgInventory.filter((item) => {
        const def = getMaterialDef(item.materialId);
        return def?.rarity === r && item.count > 0;
      });
    }
    return result;
  }, [dgInventory, getMaterialDef]);

  const totalInventoryValue = useMemo(() => {
    return dgInventory.reduce((sum, item) => {
      const def = getMaterialDef(item.materialId);
      return sum + (def?.value || 0) * item.count;
    }, 0);
  }, [dgInventory, getMaterialDef]);

  const unlockedZoneCount = useMemo(() => {
    return DG_CHAMBERS.filter((c) => dgLevel >= c.unlockLevel).length;
  }, [dgLevel]);

  const activeEventInfo = useMemo((): DgEventDef | null => {
    if (!dgActiveEvent) return null;
    return DG_EVENTS.find((e) => e.id === dgActiveEvent) || null;
  }, [dgActiveEvent]);

  const creaturesBySpeciesCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const species of DG_SPECIES) {
      counts[species.id] = dgBloomed.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      }).length;
    }
    return counts;
  }, [dgBloomed, getCreatureDef]);

  const averageCreaturePower = useMemo(() => {
    if (dgBloomed.length === 0) return 0;
    let totalPower = 0;
    for (const g of dgBloomed) {
      const def = getCreatureDef(g.creatureId);
      totalPower += def?.power || 0;
    }
    return Math.round(totalPower / dgBloomed.length);
  }, [dgBloomed, getCreatureDef]);

  const totalCreaturePower = useMemo(() => {
    let totalPower = 0;
    let totalDefense = 0;
    for (const g of dgBloomed) {
      const def = getCreatureDef(g.creatureId);
      totalPower += def?.power || 0;
      totalDefense += def?.defense || 0;
    }
    return { power: totalPower, defense: totalDefense, combined: totalPower + totalDefense };
  }, [dgBloomed, getCreatureDef]);

  const structureBonusTotal = useMemo(() => {
    let total = 0;
    for (const s of dgStructures) {
      const def = getStructureDef(s.structureId);
      total += (def?.bonusPerLevel || 0) * s.level;
    }
    return total;
  }, [dgStructures, getStructureDef]);

  const artifactPowerTotal = useMemo(() => {
    let total = 0;
    for (const a of dgArtifacts) {
      if (!a.activated) continue;
      const def = getArtifactDef(a.artifactId);
      total += def?.powerBonus || 0;
    }
    return total;
  }, [dgArtifacts, getArtifactDef]);

  const gardenPowerRating = useMemo(() => {
    const creaturePower = totalCreaturePower.combined;
    const structureBonus = structureBonusTotal * 10;
    const artifactPower = artifactPowerTotal * 5;
    const titleBonus = (currentTitleInfo?.coinBonus || 0) * 20;
    return creaturePower + structureBonus + artifactPower + titleBonus;
  }, [totalCreaturePower, structureBonusTotal, artifactPowerTotal, currentTitleInfo]);

  const recentBloomed = useMemo(() => {
    return [...dgBloomed]
      .sort((a, b) => b.craftedAt - a.craftedAt)
      .slice(0, 5)
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }));
  }, [dgBloomed, getCreatureDef]);

  const mostUsedCreature = useMemo((): DgOwnedCreature | null => {
    if (dgBloomed.length === 0) return null;
    const sorted = [...dgBloomed].sort((a, b) => b.timesUsed - a.timesUsed);
    return sorted[0] || null;
  }, [dgBloomed]);

  const mostExploredZone = useMemo((): DgChamberRecord | null => {
    if (dgChambers.length === 0) return null;
    const sorted = [...dgChambers].sort((a, b) => b.explorationPercent - a.explorationPercent);
    return sorted[0] || null;
  }, [dgChambers]);

  const highestStructure = useMemo((): DgStructureRecord | null => {
    if (dgStructures.length === 0) return null;
    const sorted = [...dgStructures].sort((a, b) => b.level - a.level);
    return sorted[0] || null;
  }, [dgStructures]);

  const legendaryCreatures = useMemo(() => {
    return dgBloomed.filter((g) => {
      const def = getCreatureDef(g.creatureId);
      return def?.rarity === 'legendary';
    });
  }, [dgBloomed, getCreatureDef]);

  const epicCreatures = useMemo(() => {
    return dgBloomed.filter((g) => {
      const def = getCreatureDef(g.creatureId);
      return def?.rarity === 'epic';
    });
  }, [dgBloomed, getCreatureDef]);

  // ============================================================
  // ADDITIONAL HELPERS
  // ============================================================

  const canAffordCreature = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    return dgCoins >= def.cost && dgBloomed.length < DG_MAX_BLOOMED_CREATURES;
  }, [dgCoins, dgBloomed.length, getCreatureDef]);

  const canAffordStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = dgStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;
    const cost = dgCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    return dgCoins >= cost;
  }, [dgCoins, dgStructures, getStructureDef]);

  const canAffordArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (dgArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;
    return dgCoins >= def.cost;
  }, [dgCoins, dgArtifacts, getArtifactDef]);

  const getStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = getStructureDef(structureId);
    if (!def) return Infinity;
    const existing = dgStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    return dgCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
  }, [dgStructures, getStructureDef]);

  const getMaterialCount = useCallback((materialId: string): number => {
    const item = dgInventory.find((i) => i.materialId === materialId);
    return item?.count || 0;
  }, [dgInventory]);

  const hasDiscoveredZone = useCallback((chamberId: string): boolean => {
    return dgChambers.find((c) => c.chamberId === chamberId)?.discovered || false;
  }, [dgChambers]);

  const isAbilityOnCooldown = useCallback((abilityId: string): boolean => {
    const record = dgAbilities.find((a) => a.abilityId === abilityId);
    if (!record) return false;
    return record.currentCooldownEnd > Date.now();
  }, [dgAbilities]);

  const getCreaturePowerRating = useCallback((instanceId: string): number => {
    const creature = dgBloomed.find((c) => c.instanceId === instanceId);
    if (!creature) return 0;
    const def = getCreatureDef(creature.creatureId);
    if (!def) return 0;
    return (def.power + def.defense) * (1 + creature.timesUsed * 0.01);
  }, [dgBloomed, getCreatureDef]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    DG_DREAM_LAVENDER,
    DG_MOONLIGHT_SILVER,
    DG_NIGHTMARE_RED,
    DG_BLOSSOM_PINK,
    DG_MIST_TEAL,
    DG_STAR_SEED_GOLD,
    DG_SLUMBER_INDIGO,
    DG_RARITY_COLORS,
    DG_SPECIES_COLORS,
    DG_ALL_COLORS,

    // ---- Data Constants ----
    DG_SPECIES,
    DG_CREATURES,
    DG_CHAMBERS,
    DG_MATERIALS,
    DG_STRUCTURES,
    DG_ABILITIES,
    DG_ACHIEVEMENTS,
    DG_TITLES,
    DG_ARTIFACTS,
    DG_EVENTS,
    DG_MAX_LEVEL,
    DG_SAVE_KEY,
    DG_XP_BASE,
    DG_XP_SCALE,

    // ---- State ----
    dgLevel,
    dgXp,
    dgMaxXp,
    dgCoins,
    dgTotalXp,
    dgTotalCoins,
    dgBloomed,
    dgInventory,
    dgStructures,
    dgArtifacts,
    dgAbilities,
    dgAchievements,
    dgChambers,
    dgEventLog,
    dgActiveEvent,
    dgCurrentTitle,
    dgStats,

    // ---- Core Actions ----
    cultivateFlower,
    exploreZone,
    buildStructure,
    activateArtifact,
    triggerGardenEvent,
    resetDreamGarden,

    // ---- Extended Actions ----
    discoverZone,
    checkAndClaimAchievements,
    useAbility,
    nicknameCreature,
    removeCreature,
    harvestMaterial,
    unlockAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    dgTitleProgress,

    // ---- Stats ----
    statsSummary,
    completionStats,

    // ---- Enriched Data ----
    enrichedCreatures,
    enrichedChambers,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedAbilities,

    // ---- Computed Data ----
    creaturesByType,
    creaturesByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    creaturesByPower,
    topCreatures,
    creatureSpeciesBreakdown,
    chamberExplorationMap,
    structureLevelSum,
    abilityUnlockMap,
    inventoryByRarity,
    totalInventoryValue,
    unlockedZoneCount,
    activeEventInfo,
    creaturesBySpeciesCount,
    averageCreaturePower,
    totalCreaturePower,
    structureBonusTotal,
    artifactPowerTotal,
    gardenPowerRating,
    recentBloomed,
    mostUsedCreature,
    mostExploredZone,
    highestStructure,
    legendaryCreatures,
    epicCreatures,

    // ---- Helpers ----
    xpForLevel,
    xpToNextLevel,
    levelProgressPercent,
    getCreatureDef,
    getChamberDef,
    getMaterialDef,
    getStructureDef,
    getAbilityDef,
    getArtifactDef,
    getAchievementDef,
    getTitleDef,
    getEventDef,
    rarityMultiplier,
    rarityColor,
    speciesColor,
    canAffordCreature,
    canAffordStructure,
    canAffordArtifact,
    getStructureUpgradeCost,
    getMaterialCount,
    hasDiscoveredZone,
    isAbilityOnCooldown,
    getCreaturePowerRating,
  };
}
