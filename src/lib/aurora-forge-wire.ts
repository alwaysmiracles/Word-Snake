import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Aurora Forge (极光锻造) — Wire Module
//
// A celestial forge built atop an aurora-lit mountain peak, where
// cosmic smiths craft stellar weapons from crystallized starlight
// and nebula dust. Players forge legendary weapons, explore celestial
// forge chambers, collect cosmic materials, build astral structures,
// discover ancient artifacts, face random forge events, and ascend
// through 8 titles of mastery.
//
// Storage key: aurora-forge-save
// Prefix: af / AF_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type AfRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type AfSpecies =
  | 'aurora_dragon'
  | 'starlight_phoenix'
  | 'nebula_golem'
  | 'crystal_titan'
  | 'cosmic_fox'
  | 'polar_bear_spirit'
  | 'void_spark';

type AfAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type AfStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'gemYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type AfMaterialCategory = 'starlight' | 'nebula' | 'crystal' | 'frost' | 'cosmic' | 'aurora' | 'ember';

// ---- Creature Definitions ----

interface AfCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: AfSpecies;
  readonly rarity: AfRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface AfChamberDef {
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

interface AfMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: AfRarity;
  readonly value: number;
  readonly category: AfMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface AfStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: AfStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface AfAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: AfAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: AfRarity;
}

// ---- Achievement Definitions ----

interface AfAchievementDef {
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

interface AfTitleDef {
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

interface AfArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: AfRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface AfEventDef {
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

interface AfOwnedCreature {
  creatureId: string;
  instanceId: string;
  craftedAt: number;
  timesUsed: number;
  nickname: string;
}

interface AfChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface AfStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface AfArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface AfAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface AfAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface AfInventoryItem {
  materialId: string;
  count: number;
}

interface AfEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface AfStats {
  totalForged: number;
  totalExplored: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface AfTitleProgress {
  current: AfTitleDef;
  next: AfTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: AF_ CONSTANTS
// ============================================================

const AF_SAVE_KEY = 'aurora-forge-save';
const AF_MAX_LEVEL = 50;
const AF_STARTING_COINS = 350;
const AF_STARTING_XP = 0;
const AF_XP_BASE = 100;
const AF_XP_SCALE = 1.5;
const AF_AUTO_SAVE_MS = 15000;
const AF_EVENT_DURATION_MS = 60000;
const AF_MAX_INVENTORY_ITEM = 999;
const AF_MAX_OWNED_CREATURES = 100;
const AF_COOLDOWN_TICK_MS = 1000;
const AF_SPECIES_COUNT = 7;
const AF_CREATURE_COUNT = 35;
const AF_CHAMBER_COUNT = 8;
const AF_MATERIAL_COUNT = 12;
const AF_STRUCTURE_COUNT = 8;
const AF_ABILITY_COUNT = 8;
const AF_ACHIEVEMENT_COUNT = 10;
const AF_TITLE_COUNT = 8;
const AF_ARTIFACT_COUNT = 6;
const AF_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const AF_AURORA_GREEN = '#00FF87';
const AF_STARLIGHT_BLUE = '#87CEEB';
const AF_NEBULA_PURPLE = '#9B59B6';
const AF_COSMIC_GOLD = '#FFD700';
const AF_FROST_WHITE = '#F0F8FF';
const AF_VOID_DEEP = '#2C3E50';
const AF_EMBER_ORANGE = '#FF6B35';

const AF_RARITY_COLORS: Record<AfRarity, string> = {
  common: '#A8D8B9',
  uncommon: '#87CEEB',
  rare: '#9B59B6',
  epic: '#FF6B35',
  legendary: '#FFD700',
};

const AF_SPECIES_COLORS: Record<AfSpecies, string> = {
  aurora_dragon: AF_AURORA_GREEN,
  starlight_phoenix: AF_COSMIC_GOLD,
  nebula_golem: AF_NEBULA_PURPLE,
  crystal_titan: AF_STARLIGHT_BLUE,
  cosmic_fox: AF_EMBER_ORANGE,
  polar_bear_spirit: AF_FROST_WHITE,
  void_spark: AF_VOID_DEEP,
};

const AF_ALL_COLORS = [
  AF_AURORA_GREEN,
  AF_STARLIGHT_BLUE,
  AF_NEBULA_PURPLE,
  AF_COSMIC_GOLD,
  AF_FROST_WHITE,
  AF_VOID_DEEP,
  AF_EMBER_ORANGE,
];

// ============================================================
// SECTION 4: AF_SPECIES — 7 Species Types
// ============================================================

const AF_SPECIES: { id: AfSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'aurora_dragon',
    name: 'Aurora Dragon',
    description: 'Majestic dragons whose scales shimmer with the colors of the northern lights, breathing aurora fire.',
    lore: 'Aurora Dragons were born when the first cosmic forge was ignited at the mountain peak, their scales absorbing the radiance of a thousand auroras.',
    emoji: '🐉',
    color: AF_AURORA_GREEN,
  },
  {
    id: 'starlight_phoenix',
    name: 'Starlight Phoenix',
    description: 'Resplendent phoenixes reborn from crystallized starlight, radiating warmth and healing energy.',
    lore: 'Starlight Phoenixes die each dawn, their bodies dissolving into stardust, only to be reborn from the first starlight of dusk.',
    emoji: '🔥',
    color: AF_COSMIC_GOLD,
  },
  {
    id: 'nebula_golem',
    name: 'Nebula Golem',
    description: 'Colossal golems formed from compressed nebula gas and cosmic dust, shifting with swirling colors.',
    lore: 'Nebula Golems drift between the stars for millennia before descending to the mountain forge, drawn by its celestial heat.',
    emoji: '🗿',
    color: AF_NEBULA_PURPLE,
  },
  {
    id: 'crystal_titan',
    name: 'Crystal Titan',
    description: 'Towerine beings of pure crystallized starlight, each facet reflecting a different corner of the cosmos.',
    lore: 'Crystal Titans are the oldest inhabitants of the celestial forge, said to have been the first creations of the cosmic smiths.',
    emoji: '💎',
    color: AF_STARLIGHT_BLUE,
  },
  {
    id: 'cosmic_fox',
    name: 'Cosmic Fox',
    description: 'Cunning foxes with fur that shimmers like a galaxy, trailing stardust wherever they bound.',
    lore: 'Cosmic Foxes can step between dimensions through their tails, each tail a gateway to a different star system.',
    emoji: '🦊',
    color: AF_EMBER_ORANGE,
  },
  {
    id: 'polar_bear_spirit',
    name: 'Polar Bear Spirit',
    description: 'Ghostly bears of frost and aurora energy, embodying the raw power of the frozen mountain peak.',
    lore: 'Polar Bear Spirits guard the forge entrance, their breath crystallizing the air itself into dazzling aurora patterns.',
    emoji: '🐻‍❄️',
    color: AF_FROST_WHITE,
  },
  {
    id: 'void_spark',
    name: 'Void Spark',
    description: 'Enigmatic beings of compressed void energy, tiny but containing the power of collapsed stars.',
    lore: 'Void Sparks are born when stars die near the forge, their remnants compressed by the mountain\'s cosmic gravity into sentient energy.',
    emoji: '⚡',
    color: AF_VOID_DEEP,
  },
];

// ============================================================
// SECTION 5: AF_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const AF_CREATURES: AfCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'aurora_dragon_common', name: 'Aurora Wisp', species: 'aurora_dragon', rarity: 'common',
    description: 'A tiny dragon hatchling whose scales flicker with faint green and purple aurora light.',
    lore: 'Aurora Wisps are the first sign of new life at the forge, their hatching coinciding with intense aurora storms.',
    emoji: '🐉', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'starlight_phoenix_common', name: 'Ember Chick', species: 'starlight_phoenix', rarity: 'common',
    description: 'A small phoenix fledgling with soft golden feathers that glow faintly in the dark.',
    lore: 'Ember Chicks must consume concentrated starlight to survive their first cycle of rebirth.',
    emoji: '🔥', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'nebula_golem_common', name: 'Dust Mote', species: 'nebula_golem', rarity: 'common',
    description: 'A small floating mass of cosmic dust and faint nebula gas, barely held together.',
    lore: 'Dust Motes are the remnants of failed forging attempts, given life by residual cosmic energy.',
    emoji: '🗿', power: 7, defense: 9, cost: 22, xpReward: 9,
  },
  {
    id: 'crystal_titan_common', name: 'Shardling', species: 'crystal_titan', rarity: 'common',
    description: 'A small crystal humanoid with rough facets that scatter light in every direction.',
    lore: 'Shardlings are the youngest Crystal Titans, their facets still unpolished and full of cosmic imperfections.',
    emoji: '💎', power: 9, defense: 12, cost: 16, xpReward: 6,
  },
  {
    id: 'cosmic_fox_common', name: 'Stardust Pup', species: 'cosmic_fox', rarity: 'common',
    description: 'A playful fox kit with fur that sparkles like a sprinkle of stars across the night sky.',
    lore: 'Stardust Pups are born in litters of seven, one for each color of the aurora spectrum.',
    emoji: '🦊', power: 8, defense: 7, cost: 15, xpReward: 7,
  },
  {
    id: 'polar_bear_spirit_common', name: 'Frost Cub', species: 'polar_bear_spirit', rarity: 'common',
    description: 'A small ghostly bear cub made of frost mist and faint aurora light.',
    lore: 'Frost Cubs play in the snowdrifts around the forge, leaving trails of ice crystals behind them.',
    emoji: '🐻‍❄️', power: 11, defense: 10, cost: 20, xpReward: 8,
  },
  {
    id: 'void_spark_common', name: 'Dark Ember', species: 'void_spark', rarity: 'common',
    description: 'A tiny sphere of compressed void energy that flickers with barely contained cosmic power.',
    lore: 'Dark Embers are dangerous to touch but invaluable for forging — their energy fuels the celestial forge itself.',
    emoji: '⚡', power: 12, defense: 5, cost: 25, xpReward: 10,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'aurora_dragon_uncommon', name: 'Veil Drake', species: 'aurora_dragon', rarity: 'uncommon',
    description: 'A juvenile dragon with a cloak of aurora light that it uses to mesmerize prey.',
    lore: 'Veil Drakes hunt by projecting aurora patterns that hypnotize their targets into walking willingly into the forge flames.',
    emoji: '🐉', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'starlight_phoenix_uncommon', name: 'Dawn Phoenix', species: 'starlight_phoenix', rarity: 'uncommon',
    description: 'A phoenix whose rebirth heralds the dawn, its golden flames outshining the rising sun.',
    lore: 'Dawn Phoenixes are sacred to the forge — their tears become liquid starlight used to temper the finest weapons.',
    emoji: '🔥', power: 20, defense: 15, cost: 55, xpReward: 18,
  },
  {
    id: 'nebula_golem_uncommon', name: 'Cloud Giant', species: 'nebula_golem', rarity: 'uncommon',
    description: 'A towering golem of swirling nebula clouds, each swirl a different cosmic color.',
    lore: 'Cloud Giants absorb stellar radiation through their nebula bodies, converting it into raw forging energy.',
    emoji: '🗿', power: 18, defense: 24, cost: 65, xpReward: 22,
  },
  {
    id: 'crystal_titan_uncommon', name: 'Prism Sentinel', species: 'crystal_titan', rarity: 'uncommon',
    description: 'A polished crystal guardian that refracts starlight into blinding protective barriers.',
    lore: 'Prism Sentinels stand guard at the forge entrance, their crystal bodies projecting aurora shields.',
    emoji: '💎', power: 19, defense: 22, cost: 50, xpReward: 16,
  },
  {
    id: 'cosmic_fox_uncommon', name: 'Nebula Runner', species: 'cosmic_fox', rarity: 'uncommon',
    description: 'A swift fox that runs along aurora curtains as if they were solid ground.',
    lore: 'Nebula Runners deliver messages between star systems, sprinting across the aurora bridge network.',
    emoji: '🦊', power: 24, defense: 14, cost: 58, xpReward: 19,
  },
  {
    id: 'polar_bear_spirit_uncommon', name: 'Glacier Phantom', species: 'polar_bear_spirit', rarity: 'uncommon',
    description: 'A spectral bear that phases through solid ice, reforming from frost on the other side.',
    lore: 'Glacier Phantoms are the guardians of the frozen passages leading to the forge\'s inner chambers.',
    emoji: '🐻‍❄️', power: 21, defense: 20, cost: 55, xpReward: 17,
  },
  {
    id: 'void_spark_uncommon', name: 'Null Pulse', species: 'void_spark', rarity: 'uncommon',
    description: 'An unstable void entity that pulses with waves of gravitational distortion.',
    lore: 'Null Pulses orbit the forge like electrons around a nucleus, their gravity helping compress raw materials.',
    emoji: '⚡', power: 26, defense: 12, cost: 62, xpReward: 21,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'aurora_dragon_rare', name: 'Curtain Wyrm', species: 'aurora_dragon', rarity: 'rare',
    description: 'A magnificent dragon whose wings span the entire aurora curtain, painting the sky with light.',
    lore: 'Curtain Wyrms are so large that ancient civilizations mistook them for the aurora itself.',
    emoji: '🐉', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'starlight_phoenix_rare', name: 'Nova Phoenix', species: 'starlight_phoenix', rarity: 'rare',
    description: 'A brilliant phoenix that dies in a miniature supernova, reborn from the cosmic aftermath.',
    lore: 'Nova Phoenixes are the forge\'s ultimate recyclers — their death explosions compress scattered stardust back into usable material.',
    emoji: '🔥', power: 38, defense: 30, cost: 180, xpReward: 45,
  },
  {
    id: 'nebula_golem_rare', name: 'Orion Colossus', species: 'nebula_golem', rarity: 'rare',
    description: 'A massive golem shaped like the constellation Orion, blazing with stellar fire.',
    lore: 'The Orion Colossus walks among the stars themselves, its footsteps creating new nebula formations.',
    emoji: '🗿', power: 35, defense: 42, cost: 220, xpReward: 55,
  },
  {
    id: 'crystal_titan_rare', name: 'Astral Shard', species: 'crystal_titan', rarity: 'rare',
    description: 'A crystal titan infused with astral energy, its facets opening windows to other dimensions.',
    lore: 'Astral Shards can trap light from parallel universes within their crystal bodies, creating weapons that never dull.',
    emoji: '💎', power: 42, defense: 32, cost: 195, xpReward: 49,
  },
  {
    id: 'cosmic_fox_rare', name: 'Galaxy Kitsune', species: 'cosmic_fox', rarity: 'rare',
    description: 'A nine-tailed fox with each tail containing a miniature spiral galaxy.',
    lore: 'Galaxy Kitsunes are revered as cosmic librarians, each galaxy-tail containing the memories of a dead civilization.',
    emoji: '🦊', power: 37, defense: 28, cost: 200, xpReward: 50,
  },
  {
    id: 'polar_bear_spirit_rare', name: 'Permafrost Warden', species: 'polar_bear_spirit', rarity: 'rare',
    description: 'An enormous spectral bear that commands the eternal permafrost of the mountain peak.',
    lore: 'Permafrost Wardens can freeze time itself in a small radius, preserving moments of beauty within ice crystals.',
    emoji: '🐻‍❄️', power: 36, defense: 40, cost: 190, xpReward: 48,
  },
  {
    id: 'void_spark_rare', name: 'Gravity Core', species: 'void_spark', rarity: 'rare',
    description: 'A dense sphere of void energy that warps spacetime around it in visible distortion waves.',
    lore: 'Gravity Cores are the forge\'s most dangerous tools — a single uncontrolled one could collapse the entire mountain.',
    emoji: '⚡', power: 45, defense: 25, cost: 210, xpReward: 52,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'aurora_dragon_epic', name: 'Borealis Emperor', species: 'aurora_dragon', rarity: 'epic',
    description: 'The supreme aurora dragon whose breath creates permanent aurora curtains across entire hemispheres.',
    lore: 'The Borealis Emperor is the mountain\'s oldest resident, having watched over the forge since before humanity existed.',
    emoji: '🐉', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'starlight_phoenix_epic', name: 'Supernova Herald', species: 'starlight_phoenix', rarity: 'epic',
    description: 'A phoenix of terrifying power whose death triggers a localized supernova, reshaping reality.',
    lore: 'Supernova Heralds choose when and where to die — their rebirth creates new star systems from the debris.',
    emoji: '🔥', power: 68, defense: 55, cost: 750, xpReward: 110,
  },
  {
    id: 'nebula_golem_epic', name: 'Void Nebula Titan', species: 'nebula_golem', rarity: 'epic',
    description: 'A titan-sized golem composed of the densest nebula material in the observable universe.',
    lore: 'Void Nebula Titans were once entire nebulae, compressed into humanoid form by the forge\'s immense cosmic pressure.',
    emoji: '🗿', power: 62, defense: 72, cost: 850, xpReward: 130,
  },
  {
    id: 'crystal_titan_epic', name: 'Infinity Prism', species: 'crystal_titan', rarity: 'epic',
    description: 'A crystal titan of infinite facets, each one reflecting a different timeline simultaneously.',
    lore: 'Infinity Prisms can see every possible future through their facets, making them omniscient observers of the cosmos.',
    emoji: '💎', power: 72, defense: 58, cost: 780, xpReward: 115,
  },
  {
    id: 'cosmic_fox_epic', name: 'Quasar Trickster', species: 'cosmic_fox', rarity: 'epic',
    description: 'A fox woven from quasar energy, so bright it outshines entire galaxies when enraged.',
    lore: 'Quasar Tricksters play pranks on black holes, redirecting their accretion disks just for amusement.',
    emoji: '🦊', power: 75, defense: 50, cost: 820, xpReward: 125,
  },
  {
    id: 'polar_bear_spirit_epic', name: 'Eternal Glacier Lord', species: 'polar_bear_spirit', rarity: 'epic',
    description: 'A colossal spectral bear whose body spans the entire polar ice cap, commanding all frost in existence.',
    lore: 'The Eternal Glacier Lord slumbers beneath the mountain, its body forming the permafrost foundation of the forge.',
    emoji: '🐻‍❄️', power: 65, defense: 70, cost: 780, xpReward: 115,
  },
  {
    id: 'void_spark_epic', name: 'Singularity Spark', species: 'void_spark', rarity: 'epic',
    description: 'A contained singularity in the form of a spark, warping reality itself within its radius.',
    lore: 'Singularity Sparks are the forge\'s greatest achievement — a controlled black hole small enough to hold in your palm.',
    emoji: '⚡', power: 80, defense: 45, cost: 800, xpReward: 120,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'aurora_dragon_legendary', name: 'Primordial Aurora Sovereign', species: 'aurora_dragon', rarity: 'legendary',
    description: 'The first aurora dragon, whose scales contain the original cosmic forge fire within each one.',
    lore: 'The Primordial Aurora Sovereign breathed the first aurora into existence and has maintained the sky\'s light show ever since.',
    emoji: '🐉', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'starlight_phoenix_legendary', name: 'Eternal Starfire Phoenix', species: 'starlight_phoenix', rarity: 'legendary',
    description: 'The phoenix that embodies the birth and death of stars, eternal and infinitely powerful.',
    lore: 'The Eternal Starfire Phoenix has died and been reborn more times than there are stars in the universe.',
    emoji: '🔥', power: 118, defense: 100, cost: 2800, xpReward: 280,
  },
  {
    id: 'nebula_golem_legendary', name: 'Cosmic Genesis Colossus', species: 'nebula_golem', rarity: 'legendary',
    description: 'A golem formed from the primordial nebula that birthed the forge\'s solar system.',
    lore: 'The Cosmic Genesis Colossus contains the raw material from which every planet, moon, and asteroid in the system was formed.',
    emoji: '🗿', power: 110, defense: 130, cost: 3200, xpReward: 320,
  },
  {
    id: 'crystal_titan_legendary', name: 'Universal Mirror', species: 'crystal_titan', rarity: 'legendary',
    description: 'A crystal titan whose infinite facets reflect every point in the universe simultaneously.',
    lore: 'The Universal Mirror shows you not just every timeline, but every possible version of yourself across the multiverse.',
    emoji: '💎', power: 125, defense: 95, cost: 3100, xpReward: 310,
  },
  {
    id: 'cosmic_fox_legendary', name: 'Infinite Tailed Celestial', species: 'cosmic_fox', rarity: 'legendary',
    description: 'A fox with infinite tails, each one a gateway to a different dimension of reality.',
    lore: 'The Infinite Tailed Celestial is said to exist in every dimension simultaneously, playing an eternal game of cosmic hide and seek with itself.',
    emoji: '🦊', power: 115, defense: 98, cost: 2900, xpReward: 290,
  },
  {
    id: 'polar_bear_spirit_legendary', name: 'Absolute Zero Guardian', species: 'polar_bear_spirit', rarity: 'legendary',
    description: 'The spirit of absolute zero itself, a bear whose presence freezes molecular motion entirely.',
    lore: 'The Absolute Zero Guardian was there at the heat death of the universe, the cold from which all new universes are born.',
    emoji: '🐻‍❄️', power: 108, defense: 120, cost: 3500, xpReward: 350,
  },
  {
    id: 'void_spark_legendary', name: 'Omega Singularity', species: 'void_spark', rarity: 'legendary',
    description: 'The ultimate void spark containing the energy of the big bang compressed into a single point.',
    lore: 'The Omega Singularity is both the beginning and end of all things — to forge with it is to create or destroy universes.',
    emoji: '⚡', power: 130, defense: 88, cost: 3000, xpReward: 300,
  },
];

// ============================================================
// SECTION 6: AF_CHAMBERS — 8 Celestial Forge Chambers
// ============================================================

const AF_CHAMBERS: AfChamberDef[] = [
  {
    id: 'aurora_anvil', name: 'Aurora Anvil', emoji: '🔨',
    description: 'The primary forging platform where raw starlight is hammered into solid celestial metal.',
    lore: 'The Aurora Anvil was the first structure built on the mountain, forged from a fallen aurora curtain frozen in time.',
    level: 1, resources: ['aurora_dust', 'starlight_shard', 'frost_crystal'], capacity: 10,
    unlockLevel: 1, ambientColor: AF_AURORA_GREEN, dangerLevel: 1,
  },
  {
    id: 'nebula_crucible', name: 'Nebula Crucible', emoji: '🏺',
    description: 'A swirling vat of compressed nebula gas where cosmic materials are melted and blended.',
    lore: 'The Nebula Crucible was carved from a dormant volcano, its lava replaced by swirling purple nebula essence.',
    level: 3, resources: ['nebula_dust', 'aurora_dust', 'cosmic_ember'], capacity: 15,
    unlockLevel: 3, ambientColor: AF_NEBULA_PURPLE, dangerLevel: 2,
  },
  {
    id: 'starlight_quench', name: 'Starlight Quench Pool', emoji: '🌊',
    description: 'A pool of liquid starlight where hot forged weapons are quenched to perfect hardness.',
    lore: 'The Starlight Quench Pool was created when a star collapsed and its liquid core pooled on the mountain peak.',
    level: 5, resources: ['starlight_shard', 'frost_crystal', 'aurora_dust'], capacity: 20,
    unlockLevel: 5, ambientColor: AF_STARLIGHT_BLUE, dangerLevel: 3,
  },
  {
    id: 'crystal_vault', name: 'Crystal Vault', emoji: '🏦',
    description: 'A vast underground vault of natural crystals that amplify and store cosmic energy.',
    lore: 'The Crystal Vault grows deeper every year as new crystals form from the forge\'s ambient energy leakage.',
    level: 10, resources: ['frost_crystal', 'void_essence', 'nebula_dust'], capacity: 25,
    unlockLevel: 10, ambientColor: AF_COSMIC_GOLD, dangerLevel: 4,
  },
  {
    id: 'void_forge', name: 'Void Forge', emoji: '🕳️',
    description: 'A forge powered by controlled void energy, capable of forging weapons from nothingness.',
    lore: 'The Void Forge was created by the Omega Singularity itself, its anvil hovering in a pocket of compressed void.',
    level: 15, resources: ['void_essence', 'cosmic_ember', 'nebula_dust'], capacity: 30,
    unlockLevel: 15, ambientColor: AF_VOID_DEEP, dangerLevel: 5,
  },
  {
    id: 'polar_workshop', name: 'Polar Workshop', emoji: '🧊',
    description: 'A frozen workshop where frost magic is woven into weapons for enhanced durability.',
    lore: 'The Polar Workshop is kept at absolute zero by the Eternal Glacier Lord, slowing time itself for perfect craftsmanship.',
    level: 20, resources: ['frost_crystal', 'aurora_dust', 'starlight_shard'], capacity: 35,
    unlockLevel: 20, ambientColor: AF_FROST_WHITE, dangerLevel: 6,
  },
  {
    id: 'ember_furnace', name: 'Ember Furnace', emoji: '🌋',
    description: 'A cosmic furnace burning with the condensed fire of a thousand dying stars.',
    lore: 'The Ember Furnace reaches temperatures hotter than a supernova core, capable of forging metals unknown to physics.',
    level: 30, resources: ['cosmic_ember', 'void_essence', 'nebula_dust'], capacity: 40,
    unlockLevel: 30, ambientColor: AF_EMBER_ORANGE, dangerLevel: 8,
  },
  {
    id: 'genesis_anvil', name: 'Genesis Anvil', emoji: '✨',
    description: 'The legendary forge at the mountain\'s very peak where creation itself can be reshaped.',
    lore: 'The Genesis Anvil is where the Primordial Aurora Sovereign first struck the cosmic hammer, creating the aurora and all life on the mountain.',
    level: 40, resources: ['primordial_core', 'aurora_dust', 'void_essence'], capacity: 50,
    unlockLevel: 40, ambientColor: '#FFD700', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: AF_MATERIALS — 12 Materials
// ============================================================

const AF_MATERIALS: AfMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'aurora_dust', name: 'Aurora Dust', emoji: '✨', rarity: 'common', value: 5,
    category: 'aurora', craftBonus: 1,
    description: 'Fine particles shed by aurora curtains, shimmering with residual electromagnetic energy.',
    lore: 'Aurora Dust is the most abundant resource at the forge, settling on every surface like magical snow.',
  },
  {
    id: 'starlight_shard', name: 'Starlight Shard', emoji: '⭐', rarity: 'common', value: 5,
    category: 'starlight', craftBonus: 2,
    description: 'A crystallized fragment of starlight, cool to the touch and humming with stellar energy.',
    lore: 'Starlight Shards are harvested from the Starlight Quench Pool, where liquid starlight naturally crystallizes.',
  },
  {
    id: 'frost_crystal', name: 'Frost Crystal', emoji: '❄️', rarity: 'common', value: 4,
    category: 'frost', craftBonus: 1,
    description: 'Ice crystals formed from the mountain\'s eternal frost, containing trapped aurora light.',
    lore: 'Frost Crystals are used to cool overheated forge tools, their cold lasting far longer than natural ice.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'nebula_dust', name: 'Nebula Dust', emoji: '🔮', rarity: 'uncommon', value: 15,
    category: 'nebula', craftBonus: 3,
    description: 'Cosmic dust harvested from passing nebula formations, swirling with purple and blue gas.',
    lore: 'Nebula Dust is collected in special magnetic jars that prevent it from dissipating into the atmosphere.',
  },
  {
    id: 'cosmic_ember', name: 'Cosmic Ember', emoji: '🔥', rarity: 'uncommon', value: 14,
    category: 'ember', craftBonus: 3,
    description: 'A fragment of stellar fire that burns without fuel, radiating warmth and forging energy.',
    lore: 'Cosmic Embers are the forge\'s primary fuel source, each one containing the energy output of a small star.',
  },
  {
    id: 'void_essence', name: 'Void Essence', emoji: '⚫', rarity: 'uncommon', value: 16,
    category: 'cosmic', craftBonus: 4,
    description: 'Drops of compressed void energy that warp gravity and distort light around them.',
    lore: 'Void Essence is extracted from the Void Forge using special magnetic tongs that prevent it from being absorbed.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'aurora_crystal', name: 'Aurora Crystal', emoji: '💎', rarity: 'rare', value: 50,
    category: 'aurora', craftBonus: 6,
    description: 'A large crystal that cycles through every aurora color, pulsing with raw electromagnetic power.',
    lore: 'Aurora Crystals are formed when aurora curtains collapse under their own weight, compressing light into solid form.',
  },
  {
    id: 'stellar_ingot', name: 'Stellar Ingot', emoji: '🟡', rarity: 'rare', value: 55,
    category: 'starlight', craftBonus: 7,
    description: 'A bar of metal forged from pure starlight, impossibly light yet harder than diamond.',
    lore: 'Stellar Ingots are the base material for the forge\'s finest weapons, each one requiring a full aurora cycle to create.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'nebula_core', name: 'Nebula Core', emoji: '🟣', rarity: 'epic', value: 150,
    category: 'nebula', craftBonus: 12,
    description: 'The compressed heart of a nebula, containing enough matter to form a thousand star systems.',
    lore: 'Nebula Cores are extraordinarily rare — only one has ever been found inside a dying star that was cut open by the forge.',
  },
  {
    id: 'void_ingot', name: 'Void Ingot', emoji: '⬛', rarity: 'epic', value: 160,
    category: 'cosmic', craftBonus: 13,
    description: 'Metal forged from nothingness, harder than any known material and heavier than a neutron star.',
    lore: 'Void Ingots are so dense they must be stored in special gravity-nullifying containers to prevent the forge from collapsing.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'primordial_core', name: 'Primordial Core', emoji: '🌟', rarity: 'legendary', value: 600,
    category: 'cosmic', craftBonus: 25,
    description: 'A sphere of primordial cosmic energy from the birth of the universe itself.',
    lore: 'The Primordial Core contains the original creative force of the big bang — to wield it is to become a creator.',
  },
  {
    id: 'aurora_heart', name: 'Aurora Heart', emoji: '💚', rarity: 'legendary', value: 700,
    category: 'aurora', craftBonus: 28,
    description: 'The living heart of the aurora itself, beating with electromagnetic rhythm across the sky.',
    lore: 'The Aurora Heart was given to the forge by the Primordial Aurora Sovereign as a gift of trust and eternal partnership.',
  },
];

// ============================================================
// SECTION 8: AF_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const AF_STRUCTURES: AfStructureDef[] = [
  {
    id: 'aurora_collector', name: 'Aurora Collector', emoji: '🌐',
    description: 'A massive antenna array that captures aurora energy and converts it into usable forging power.',
    lore: 'The Aurora Collector was designed by the first cosmic smiths to harness the mountain\'s most abundant energy source.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'energyBonus', bonusPerLevel: 6,
  },
  {
    id: 'starlight_refinery', name: 'Starlight Refinery', emoji: '🏭',
    description: 'A crystalline refinery that purifies raw starlight into concentrated forging fuel.',
    lore: 'The Starlight Refinery processes a thousand gallons of liquid starlight per day, enough to forge three legendary weapons.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'craftQuality', bonusPerLevel: 3,
  },
  {
    id: 'nebula_silo', name: 'Nebula Silo', emoji: '🏗️',
    description: 'A pressurized silo that stores harvested nebula gas for use in the Nebula Crucible.',
    lore: 'The Nebula Silo can store enough nebula material to run the forge for a decade without resupply.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'crystal_armory', name: 'Crystal Armory', emoji: '⚔️',
    description: 'A fortress armory built from enchanted crystal that enhances every stored weapon.',
    lore: 'Weapons stored in the Crystal Armory grow stronger over time, absorbing ambient cosmic energy from the crystal walls.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'frost_bastion', name: 'Frost Bastion', emoji: '🏰',
    description: 'A defensive fortress of eternal ice that protects the forge from cosmic threats.',
    lore: 'The Frost Bastion\'s walls repair themselves instantly from the mountain\'s perpetual frost, making it truly indestructible.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'void_accelerator', name: 'Void Accelerator', emoji: '🌀',
    description: 'A ring of void energy that accelerates forging speed by warping local time.',
    lore: 'The Void Accelerator makes time flow faster inside the forge while remaining normal outside, allowing centuries of forging in minutes.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'speedBonus', bonusPerLevel: 5,
  },
  {
    id: 'aurora_bridge', name: 'Aurora Bridge', emoji: '🌈',
    description: 'A bridge of solidified aurora light connecting the forge to distant celestial resources.',
    lore: 'The Aurora Bridge extends across the sky like a rainbow, allowing forge workers to reach passing comets and asteroids.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'genesis_lighthouse', name: 'Genesis Lighthouse', emoji: '🗼',
    description: 'A beacon of pure creation energy that guides cosmic materials to the forge from across the galaxy.',
    lore: 'The Genesis Lighthouse can be seen from any point in the galaxy, its light calling worthy materials to the forge like moths to a flame.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 6,
  },
];

// ============================================================
// SECTION 9: AF_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const AF_ABILITIES: AfAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'aurora_breath', name: 'Aurora Breath', category: 'offensive',
    description: 'Unleashes a devastating stream of aurora fire that melts any material and blinds enemies.',
    lore: 'Aurora Breath is the signature attack of the Primordial Aurora Sovereign, taught only to the most trusted cosmic smiths.',
    emoji: '🐉', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'nova_strike', name: 'Nova Strike', category: 'offensive',
    description: 'Channels the energy of a dying star into a single devastating hammer blow.',
    lore: 'Nova Strike was invented when the Eternal Starfire Phoenix briefly died during a forging session, creating the technique by accident.',
    emoji: '💥', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'aurora_shield', name: 'Aurora Shield', category: 'defensive',
    description: 'Conjures a shield of woven aurora light that absorbs and redirects incoming energy.',
    lore: 'Aurora Shields shimmer with living light, adapting their frequency to perfectly counter any incoming attack type.',
    emoji: '🛡️', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'void_barrier', name: 'Void Barrier', category: 'defensive',
    description: 'Creates a pocket of void space that swallows attacks before they reach the forge.',
    lore: 'Void Barriers are terrifying to observe — attacks vanish into absolute nothingness, leaving no trace.',
    emoji: '🕳️', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'starlight_scan', name: 'Starlight Scan', category: 'utility',
    description: 'Reveals hidden materials, chambers, and creature weaknesses using concentrated starlight.',
    lore: 'Starlight Scan illuminates the molecular structure of any material, showing cosmic smiths exactly where to strike.',
    emoji: '👁️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'nebula_compass', name: 'Nebula Compass', category: 'utility',
    description: 'Senses cosmic energy signatures across vast distances, guiding the forge toward rare materials.',
    lore: 'The Nebula Compass can detect a single grain of primordial dust from across an entire galaxy.',
    emoji: '🧭', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'dragon_call', name: 'Dragon Call', category: 'summon',
    description: 'Summons an Aurora Dragon to fight alongside the forge, breathing aurora fire on enemies.',
    lore: 'Dragon Calls resonate at the same frequency as the aurora itself, impossible for any dragon to ignore.',
    emoji: '🐲', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'void_horde', name: 'Void Horde', category: 'summon',
    description: 'Releases a swarm of void sparks that devour enemy defenses with gravitational hunger.',
    lore: 'Void Hordes behave like a school of cosmic piranhas, stripping away matter layer by layer until nothing remains.',
    emoji: '⚡', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: AF_ACHIEVEMENTS — 10 Achievements
// ============================================================

const AF_ACHIEVEMENTS: AfAchievementDef[] = [
  {
    id: 'ach_first_forge', name: 'First Spark', emoji: '✨',
    description: 'Forge your first stellar weapon and ignite the flame of cosmic creation.',
    conditionKey: 'totalForged', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_forge_10', name: 'Apprentice Smith', emoji: '🔨',
    description: 'Forge 10 stellar weapons and prove your worth at the Aurora Anvil.',
    conditionKey: 'totalForged', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_forge_25', name: 'Celestial Forgemaster', emoji: '🏅',
    description: 'Forge 25 stellar weapons to earn the title of Celestial Forgemaster.',
    conditionKey: 'totalForged', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_explore_3', name: 'Chamber Pioneer', emoji: '🔦',
    description: 'Discover 3 celestial forge chambers and begin mapping the mountain\'s depths.',
    conditionKey: 'totalExplored', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_explore_all', name: 'Forge Cartographer', emoji: '🗺️',
    description: 'Explore all 8 celestial forge chambers and complete the definitive mountain map.',
    conditionKey: 'totalExplored', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Structure Architect', emoji: '🏗️',
    description: 'Build 3 different forge structures to establish your mountain outpost.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Artifact Seeker', emoji: '💎',
    description: 'Activate your first ancient celestial artifact and unlock its cosmic power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Cosmic Survivor', emoji: '🌋',
    description: 'Survive 5 random forge events without being defeated by the mountain\'s dangers.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Aurora Veteran', emoji: '🏔️',
    description: 'Reach forge master level 25 and gain access to the deepest forge chambers.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Forge Sovereign', emoji: '👑',
    description: 'Reach the maximum forge master level 50 and become the supreme ruler of the forge.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: AF_TITLES — 8 Title Progression
// ============================================================

const AF_TITLES: AfTitleDef[] = [
  {
    id: 'title_forge_novice', name: 'Forge Novice', emoji: '🪨',
    description: 'A newcomer to the Aurora Forge, awestruck by the celestial flames dancing atop the mountain.',
    lore: 'Every forge master once stood at the mountain base, looking up at the aurora-lit peak in wonder.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_ember_tender', name: 'Ember Tender', emoji: '🔥',
    description: 'A diligent apprentice learning to tend the cosmic flames that power the celestial forge.',
    lore: 'Ember Tenders must memorize the color of every star\'s fire, for each burns at a different temperature.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_starlight_smith', name: 'Starlight Smith', emoji: '⭐',
    description: 'A skilled smith who can shape raw starlight into solid, usable forging material.',
    lore: 'Starlight Smiths can catch a falling star and hammer it into a weapon before it hits the ground.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_nebula_crafter', name: 'Nebula Crafter', emoji: '🔮',
    description: 'An expert crafter who works with volatile nebula materials to forge legendary weapons.',
    lore: 'Nebula Crafters wear special suits that filter out the most dangerous cosmic radiation from their materials.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_aurora_forger', name: 'Aurora Forger', emoji: '⚔️',
    description: 'A master forger who wields aurora energy as naturally as breathing, crafting weapons of living light.',
    lore: 'Aurora Forgers can see the aurora spectrum invisible to mortal eyes, selecting the perfect frequency for each weapon.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_cosmic_artificer', name: 'Cosmic Artificer', emoji: '🔩',
    description: 'A legendary artificer capable of forging weapons from raw cosmic energy and void matter.',
    lore: 'Cosmic Artificers have forged weapons for gods and titans alike, their creations lasting billions of years.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_celestial_sovereign', name: 'Celestial Sovereign', emoji: '🏆',
    description: 'The supreme ruler of the forge, commanding both creation and destruction from the mountain peak.',
    lore: 'Celestial Sovereigns can reshape reality with a single hammer strike, their authority absolute.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_eternal_forge_lord', name: 'Eternal Forge Lord', emoji: '🐉',
    description: 'The immortal master of the Aurora Forge, one with the mountain and the cosmos itself.',
    lore: 'The Eternal Forge Lord hears the heartbeat of every star in the universe through the Genesis Anvil.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: AF_ARTIFACTS — 6 Artifacts
// ============================================================

const AF_ARTIFACTS: AfArtifactDef[] = [
  {
    id: 'art_aurora_hammer', name: 'Aurora Hammer',
    description: 'A hammer that glows with every color of the aurora, each strike releasing a wave of electromagnetic energy.',
    lore: 'The Aurora Hammer was the first tool ever created at the forge, wielded by the Primordial Aurora Sovereign to build the mountain itself.',
    emoji: '🔨', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_starlight_lens', name: 'Starlight Focusing Lens',
    description: 'A perfectly ground lens of solid starlight that concentrates cosmic energy into a single devastating point.',
    lore: 'The Starlight Focusing Lens can ignite a dying star back to life by focusing the ambient light of distant galaxies.',
    emoji: '🔍', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_nebula_core_shard', name: 'Nebula Core Shard',
    description: 'A fragment of a nebula core containing enough matter to create a small moon.',
    lore: 'Nebula Core Shards are so dense they have their own gravitational field, pulling nearby materials toward them.',
    emoji: '🔮', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_void_anvil', name: 'Void Anvil Fragment',
    description: 'A piece of the original void forge anvil, containing captured nothingness within its structure.',
    lore: 'Weapons forged on a Void Anvil Fragment are lighter than air yet cut through any known material effortlessly.',
    emoji: '🕳️', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_primordial_spark', name: 'Primordial Spark',
    description: 'A spark from the original cosmic forge fire, containing the creative energy of the universe\'s birth.',
    lore: 'The Primordial Spark has been carefully preserved since the dawn of time, passed down through generations of forge lords.',
    emoji: '⚡', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_aurora_crown', name: 'Aurora Crown',
    description: 'A crown of living aurora energy that grants its wearer dominion over electromagnetic forces.',
    lore: 'The Aurora Crown is the symbol of the Eternal Forge Lord — to wear it is to command the sky itself.',
    emoji: '👑', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: AF_EVENTS — 8 Random Forge Events
// ============================================================

const AF_EVENTS: AfEventDef[] = [
  {
    id: 'evt_aurora_storm', name: 'Aurora Storm',
    description: 'A massive aurora storm engulfs the mountain peak, flooding the forge with excess electromagnetic energy.',
    lore: 'Aurora Storms are both blessing and curse — they supercharge the forge but can overload sensitive equipment.',
    emoji: '🌈', effectType: 'buff', duration: 30000, rewardXp: 40, rewardCoins: 15,
    rewardMaterialId: 'aurora_dust', rewardMaterialCount: 5,
  },
  {
    id: 'evt_starfall', name: 'Starfall',
    description: 'A shower of falling stars bombards the mountain, depositing raw starlight everywhere.',
    lore: 'Starfalls are the forge\'s most productive natural events, each star providing enough material for a weapon.',
    emoji: '🌠', effectType: 'buff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'starlight_shard', rewardMaterialCount: 6,
  },
  {
    id: 'evt_nebula_drift', name: 'Nebula Drift',
    description: 'A passing nebula deposits clouds of cosmic gas across the forge, enriching the atmosphere.',
    lore: 'Nebula Drifts turn the sky purple and pink, making the forge look like it\'s floating inside a living painting.',
    emoji: '🌀', effectType: 'buff', duration: 20000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'nebula_dust', rewardMaterialCount: 5,
  },
  {
    id: 'evt_void_leak', name: 'Void Leak',
    description: 'A crack in reality leaks void energy into the forge, warping local spacetime.',
    lore: 'Void Leaks are extremely dangerous — anything that falls into the crack ceases to exist in any timeline.',
    emoji: '🕳️', effectType: 'debuff', duration: 15000, rewardXp: 60, rewardCoins: 10,
    rewardMaterialId: 'void_essence', rewardMaterialCount: 4,
  },
  {
    id: 'evt_frost_quake', name: 'Frost Quake',
    description: 'The permafrost beneath the forge shifts violently, cracking ice and releasing trapped ancient energy.',
    lore: 'Frost Quakes occur when the Eternal Glacier Lord stirs in its sleep beneath the mountain.',
    emoji: '🧊', effectType: 'debuff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'frost_crystal', rewardMaterialCount: 7,
  },
  {
    id: 'evt_cosmic_alignment', name: 'Cosmic Alignment',
    description: 'The stars align perfectly above the forge, creating a beam of concentrated cosmic energy.',
    lore: 'Cosmic Alignments happen once every thousand years, amplifying the forge\'s power a hundredfold.',
    emoji: '🌟', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 50,
    rewardMaterialId: 'aurora_crystal', rewardMaterialCount: 2,
  },
  {
    id: 'evt_ember_eruption', name: 'Ember Eruption',
    description: 'The Ember Furnace erupts, spewing cosmic embers across the mountain in a spectacular display.',
    lore: 'Ember Eruptions light up the sky like a second sun, visible from planets in neighboring star systems.',
    emoji: '🌋', effectType: 'special', duration: 10000, rewardXp: 70, rewardCoins: 30,
    rewardMaterialId: 'cosmic_ember', rewardMaterialCount: 8,
  },
  {
    id: 'evt_dragon_awakening', name: 'Dragon Awakening',
    description: 'An ancient aurora dragon awakens from its slumber within the mountain core, shaking the peak.',
    lore: 'Dragon Awakenings are heralded by the sky turning entirely green as the dragon\'s aurora aura expands to cover the horizon.',
    emoji: '🐲', effectType: 'special', duration: 10000, rewardXp: 90, rewardCoins: 40,
    rewardMaterialId: 'stellar_ingot', rewardMaterialCount: 2,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function afGenerateInstanceId(): string {
  return `af_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function afPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function afCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function afCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useAuroraForge() {
  // ---- Core State ----
  const [afLevel, setAfLevel] = useState(1);
  const [afXp, setAfXp] = useState(AF_STARTING_XP);
  const [afCoins, setAfCoins] = useState(AF_STARTING_COINS);
  const [afTotalXp, setAfTotalXp] = useState(0);
  const [afTotalCoins, setAfTotalCoins] = useState(0);

  // ---- Collection State ----
  const [afForged, setAfForged] = useState<AfOwnedCreature[]>([]);
  const [afInventory, setAfInventory] = useState<AfInventoryItem[]>([]);
  const [afStructures, setAfStructures] = useState<AfStructureRecord[]>([]);
  const [afArtifacts, setAfArtifacts] = useState<AfArtifactRecord[]>([]);
  const [afAbilities, setAfAbilities] = useState<AfAbilityRecord[]>([]);
  const [afAchievements, setAfAchievements] = useState<AfAchievementRecord[]>([]);
  const [afChambers, setAfChambers] = useState<AfChamberRecord[]>([]);
  const [afEventLog, setAfEventLog] = useState<AfEventLogEntry[]>([]);
  const [afActiveEvent, setAfActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [afCurrentTitle, setAfCurrentTitle] = useState('title_forge_novice');

  // ---- Stats State ----
  const [afStats, setAfStats] = useState<AfStats>({
    totalForged: 0,
    totalExplored: 0,
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
    afLevel, afXp, afTotalXp, afTotalCoins, afForged, afInventory,
    afStructures, afArtifacts, afAbilities, afAchievements,
    afChambers, afEventLog, afActiveEvent, afCurrentTitle, afStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      afLevel, afXp, afTotalXp, afTotalCoins, afForged, afInventory,
      afStructures, afArtifacts, afAbilities, afAchievements,
      afChambers, afEventLog, afActiveEvent, afCurrentTitle, afStats,
    };
  }, [afLevel, afXp, afTotalXp, afTotalCoins, afForged, afInventory,
    afStructures, afArtifacts, afAbilities, afAchievements,
    afChambers, afEventLog, afActiveEvent, afCurrentTitle, afStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(AF_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.afLevel) setAfLevel(data.afLevel);
        if (data.afXp) setAfXp(data.afXp);
        if (data.afCoins) setAfCoins(data.afCoins);
        if (data.afTotalXp) setAfTotalXp(data.afTotalXp);
        if (data.afTotalCoins) setAfTotalCoins(data.afTotalCoins);
        if (data.afForged) setAfForged(data.afForged);
        if (data.afInventory) setAfInventory(data.afInventory);
        if (data.afStructures) setAfStructures(data.afStructures);
        if (data.afArtifacts) setAfArtifacts(data.afArtifacts);
        if (data.afAbilities) setAfAbilities(data.afAbilities);
        if (data.afAchievements) setAfAchievements(data.afAchievements);
        if (data.afChambers) setAfChambers(data.afChambers);
        if (data.afEventLog) setAfEventLog(data.afEventLog);
        if (data.afActiveEvent) setAfActiveEvent(data.afActiveEvent);
        if (data.afCurrentTitle) setAfCurrentTitle(data.afCurrentTitle);
        if (data.afStats) setAfStats(data.afStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setAfChambers(
      AF_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setAfAbilities(
      AF_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setAfAchievements(
      AF_ACHIEVEMENTS.map((a) => ({
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
          afLevel, afXp, afCoins, afTotalXp, afTotalCoins,
          afForged, afInventory, afStructures, afArtifacts,
          afAbilities, afAchievements, afChambers, afEventLog,
          afActiveEvent, afCurrentTitle, afStats,
        };
        localStorage.setItem(AF_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, AF_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [afLevel, afXp, afCoins, afTotalXp, afTotalCoins,
    afForged, afInventory, afStructures, afArtifacts,
    afAbilities, afAchievements, afChambers, afEventLog,
    afActiveEvent, afCurrentTitle, afStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!afActiveEvent) return;
    const evt = AF_EVENTS.find((e) => e.id === afActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setAfActiveEvent(null);
      setAfEventLog((prev) =>
        prev.map((e) => (e.eventId === afActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [afActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...AF_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => afLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === afCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setAfCurrentTitle(nextTitle.id);
    }
  }, [afLevel, afCurrentTitle]);

  // ============================================================
  // COMPUTED: afMaxXp
  // ============================================================

  const afMaxXp = useMemo(() => {
    return Math.floor(AF_XP_BASE * Math.pow(afLevel + 1, AF_XP_SCALE));
  }, [afLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(AF_XP_BASE * Math.pow(lvl, AF_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(afLevel + 1);
    return Math.max(0, needed - afXp);
  }, [afLevel, afXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(afLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((afXp / needed) * 100), 100);
  }, [afLevel, afXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): AfCreatureDef | undefined => {
    return AF_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): AfChamberDef | undefined => {
    return AF_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): AfMaterialDef | undefined => {
    return AF_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): AfStructureDef | undefined => {
    return AF_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): AfAbilityDef | undefined => {
    return AF_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): AfArtifactDef | undefined => {
    return AF_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): AfAchievementDef | undefined => {
    return AF_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): AfTitleDef | undefined => {
    return AF_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): AfEventDef | undefined => {
    return AF_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: AfRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: AfRarity): string => {
    return AF_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: AfSpecies): string => {
    return AF_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: forgeWeapon
  // ============================================================

  const forgeWeapon = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (afCoins < def.cost) return false;
    if (afForged.length >= AF_MAX_OWNED_CREATURES) return false;

    const newCreature: AfOwnedCreature = {
      creatureId: def.id,
      instanceId: afGenerateInstanceId(),
      craftedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setAfCoins((prev) => prev - def.cost);
    setAfForged((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = afCalculateLevelUp(
      xpForLevel(afLevel + 1),
      afXp,
      xpGained,
      setAfLevel,
    );
    setAfXp(overflow);
    setAfTotalXp((prev) => prev + xpGained);
    setAfTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setAfStats((prev) => ({ ...prev, totalForged: prev.totalForged + 1 }));
    return true;
  }, [afCoins, afLevel, afXp, afForged.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreChamber
  // ============================================================

  const exploreChamber = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (afLevel < def.unlockLevel) return false;

    setAfChambers((prev) =>
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

    const bonusMat = afPickRandom(def.resources);
    if (bonusMat) {
      setAfInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, AF_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setAfTotalXp((prev) => prev + 15);
    setAfTotalCoins((prev) => prev + 5);
    setAfStats((prev) => ({ ...prev, totalExplored: prev.totalExplored + 1 }));
    return true;
  }, [afLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = afStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = afCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (afCoins < cost) return false;

    setAfCoins((prev) => prev - cost);
    setAfStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setAfTotalXp((prev) => prev + 20);
    setAfStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [afCoins, afStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (afCoins < def.cost) return false;
    if (afArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setAfCoins((prev) => prev - def.cost);
    setAfArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setAfTotalXp((prev) => prev + 100);
    setAfStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [afCoins, afArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerForgeEvent
  // ============================================================

  const triggerForgeEvent = useCallback((): AfEventDef | null => {
    if (afActiveEvent) return null;
    const event = afPickRandom(AF_EVENTS);
    setAfActiveEvent(event.id);
    setAfEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setAfTotalXp((prev) => prev + event.rewardXp);
    setAfCoins((prev) => prev + event.rewardCoins);
    setAfTotalCoins((prev) => prev + event.rewardCoins);

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setAfInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, AF_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    setAfStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    return event;
  }, [afActiveEvent]);

  // ============================================================
  // CORE ACTION: resetAuroraForge
  // ============================================================

  const resetAuroraForge = useCallback(() => {
    setAfLevel(1);
    setAfXp(0);
    setAfCoins(AF_STARTING_COINS);
    setAfTotalXp(0);
    setAfTotalCoins(0);
    setAfForged([]);
    setAfInventory([]);
    setAfStructures([]);
    setAfArtifacts([]);
    setAfAbilities(
      AF_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setAfAchievements(
      AF_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setAfChambers(
      AF_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setAfEventLog([]);
    setAfActiveEvent(null);
    setAfCurrentTitle('title_forge_novice');
    setAfStats({
      totalForged: 0, totalExplored: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(AF_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverChamber
  // ============================================================

  const discoverChamber = useCallback((chamberId: string): boolean => {
    return exploreChamber(chamberId);
  }, [exploreChamber]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setAfStats((currentStats) => {
      setAfAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalForged: currentStats.totalForged,
          totalExplored: currentStats.totalExplored,
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
            setAfTotalXp((xp) => xp + def.rewardXp);
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
    const record = afAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setAfAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setAfTotalXp((prev) => prev + 5);
    return true;
  }, [afAbilities, getAbilityDef]);

  // ============================================================
  // EXTENDED ACTION: renameCreature
  // ============================================================

  const renameCreature = useCallback((instanceId: string, nickname: string): boolean => {
    const exists = afForged.find((c) => c.instanceId === instanceId);
    if (!exists) return false;

    setAfForged((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, nickname } : c,
      ),
    );
    return true;
  }, [afForged]);

  // ============================================================
  // EXTENDED ACTION: removeCreature
  // ============================================================

  const removeCreature = useCallback((instanceId: string): boolean => {
    const exists = afForged.find((c) => c.instanceId === instanceId);
    if (!exists) return false;

    const def = getCreatureDef(exists.creatureId);
    const refundValue = def ? Math.floor(def.cost * 0.3) : 0;

    setAfForged((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setAfCoins((prev) => prev + refundValue);
    return true;
  }, [afForged, getCreatureDef]);

  // ============================================================
  // EXTENDED ACTION: useMaterial
  // ============================================================

  const useMaterial = useCallback((materialId: string, count: number): boolean => {
    const item = afInventory.find((i) => i.materialId === materialId);
    if (!item || item.count < count) return false;

    setAfInventory((prev) =>
      prev.map((i) =>
        i.materialId === materialId
          ? { ...i, count: i.count - count }
          : i,
      ).filter((i) => i.count > 0),
    );
    return true;
  }, [afInventory]);

  // ============================================================
  // EXTENDED ACTION: sellMaterial
  // ============================================================

  const sellMaterial = useCallback((materialId: string, count: number): number => {
    const item = afInventory.find((i) => i.materialId === materialId);
    if (!item || item.count < count) return 0;

    const def = getMaterialDef(materialId);
    if (!def) return 0;

    const sellCount = Math.min(count, item.count);
    const coinsEarned = Math.floor(def.value * sellCount * 0.5);

    setAfInventory((prev) =>
      prev.map((i) =>
        i.materialId === materialId
          ? { ...i, count: i.count - sellCount }
          : i,
      ).filter((i) => i.count > 0),
    );
    setAfCoins((prev) => prev + coinsEarned);
    setAfTotalCoins((prev) => prev + coinsEarned);
    return coinsEarned;
  }, [afInventory, getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: upgradeStructure
  // ============================================================

  const upgradeStructure = useCallback((structureId: string): boolean => {
    return buildStructure(structureId);
  }, [buildStructure]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const afTitleProgress = useMemo((): AfTitleProgress => {
    const sorted = [...AF_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === afCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === afCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((afLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [afLevel, afCurrentTitle]);

  const currentTitleInfo = useMemo(() => afTitleProgress.current, [afTitleProgress]);

  const nextTitleInfo = useMemo(() => afTitleProgress.next, [afTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesForged: afForged.length,
    chambersExplored: afChambers.filter((c) => c.discovered).length,
    structuresBuilt: afStructures.length,
    artifactsActive: afArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: afAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: afAbilities.filter((a) => a.unlocked).length,
    totalXp: afTotalXp,
    totalCoins: afTotalCoins,
    currentLevel: afLevel,
    ownedSpeciesCount: new Set(afForged.map((f) => {
      const d = AF_CREATURES.find((c) => c.id === f.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: afEventLog.length,
    inventoryItems: afInventory.filter((i) => i.count > 0).length,
    averageCreaturePower: afForged.length > 0
      ? Math.round(
          afForged.reduce((sum, f) => {
            const d = AF_CREATURES.find((c) => c.id === f.creatureId);
            return sum + (d?.power || 0);
          }, 0) / afForged.length,
        )
      : 0,
    averageCreatureDefense: afForged.length > 0
      ? Math.round(
          afForged.reduce((sum, f) => {
            const d = AF_CREATURES.find((c) => c.id === f.creatureId);
            return sum + (d?.defense || 0);
          }, 0) / afForged.length,
        )
      : 0,
  }), [afForged, afChambers, afStructures, afArtifacts,
    afAchievements, afAbilities, afTotalXp, afTotalCoins, afLevel, afEventLog, afInventory]);

  const completionStats = useMemo(() => {
    const totalPossible =
      AF_CREATURES.length +
      AF_CHAMBERS.length +
      AF_STRUCTURES.length +
      AF_ARTIFACTS.length +
      AF_ACHIEVEMENTS.length +
      AF_ABILITIES.length;
    const completed =
      afForged.length +
      afChambers.filter((c) => c.discovered).length +
      afStructures.length +
      afArtifacts.filter((a) => a.activated).length +
      afAchievements.filter((a) => a.unlocked).length +
      afAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((afForged.length / AF_CREATURES.length) * 100),
      chamberPercent: Math.round((afChambers.filter((c) => c.discovered).length / AF_CHAMBERS.length) * 100),
      structurePercent: Math.round((afStructures.length / AF_STRUCTURES.length) * 100),
      artifactPercent: Math.round((afArtifacts.filter((a) => a.activated).length / AF_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((afAchievements.filter((a) => a.unlocked).length / AF_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((afAbilities.filter((a) => a.unlocked).length / AF_ABILITIES.length) * 100),
    };
  }, [afForged, afChambers, afStructures, afArtifacts, afAchievements, afAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    afForged.map((f) => ({
      ...f,
      def: getCreatureDef(f.creatureId),
    })),
  [afForged, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    afChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [afChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    afStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: afCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: afCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [afStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    afInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [afInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    afArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [afArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    afAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [afAbilities, getAbilityDef]);

  const enrichedEvents = useMemo(() =>
    afEventLog.map((e) => ({
      ...e,
      def: getEventDef(e.eventId),
    })),
  [afEventLog, getEventDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesBySpecies = useMemo(() => {
    const result: Record<string, AfOwnedCreature[]> = {};
    for (const species of AF_SPECIES) {
      result[species.id] = afForged.filter((f) => {
        const def = getCreatureDef(f.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [afForged, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: AfRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, AfOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = afForged.filter((f) => {
        const def = getCreatureDef(f.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [afForged, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return AF_CREATURES.filter((c) => c.cost <= afCoins);
  }, [afCoins]);

  const affordableByRarity = useMemo(() => {
    const rarities: AfRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, AfCreatureDef[]> = {};
    for (const r of rarities) {
      result[r] = AF_CREATURES.filter((c) => c.rarity === r && c.cost <= afCoins);
    }
    return result;
  }, [afCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalForged: afStats.totalForged,
      totalExplored: afStats.totalExplored,
      totalStructuresBuilt: afStats.totalStructuresBuilt,
      totalArtifacts: afStats.totalArtifacts,
      totalEvents: afStats.totalEvents,
      totalCoins: afStats.totalCoins,
      totalXp: afStats.totalXp,
    };
    return AF_ACHIEVEMENTS.filter(
      (a) =>
        !afAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [afStats, afAchievements]);

  const recentEventLog = useMemo(() => {
    return [...afEventLog].reverse().slice(0, 10);
  }, [afEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...afForged]
      .map((f) => ({ ...f, def: getCreatureDef(f.creatureId) }))
      .filter((f) => f.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [afForged, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of afForged) {
      const def = getCreatureDef(f.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [afForged, getCreatureDef]);

  const creatureRarityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of afForged) {
      const def = getCreatureDef(f.creatureId);
      if (def) {
        counts[def.rarity] = (counts[def.rarity] || 0) + 1;
      }
    }
    return counts;
  }, [afForged, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of afChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [afChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of afStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [afStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of afAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [afAbilities]);

  const totalInventoryValue = useMemo(() => {
    return afInventory.reduce((sum, item) => {
      const def = getMaterialDef(item.materialId);
      return sum + (def?.value || 0) * item.count;
    }, 0);
  }, [afInventory, getMaterialDef]);

  const totalCreaturePower = useMemo(() => {
    return afForged.reduce((sum, f) => {
      const def = getCreatureDef(f.creatureId);
      return sum + (def?.power || 0);
    }, 0);
  }, [afForged, getCreatureDef]);

  const totalCreatureDefense = useMemo(() => {
    return afForged.reduce((sum, f) => {
      const def = getCreatureDef(f.creatureId);
      return sum + (def?.defense || 0);
    }, 0);
  }, [afForged, getCreatureDef]);

  const unlockableChambers = useMemo(() => {
    return AF_CHAMBERS.filter((c) => c.unlockLevel <= afLevel);
  }, [afLevel]);

  const lockedChambers = useMemo(() => {
    return AF_CHAMBERS.filter((c) => c.unlockLevel > afLevel);
  }, [afLevel]);

  const fullyExploredChambers = useMemo(() => {
    return afChambers.filter((c) => c.explorationPercent >= 100).length;
  }, [afChambers]);

  const mostVisitedChamber = useMemo(() => {
    if (afChambers.length === 0) return null;
    const sorted = [...afChambers].sort((a, b) => b.totalVisits - a.totalVisits);
    const top = sorted[0];
    if (top.totalVisits === 0) return null;
    return { chamberId: top.chamberId, def: getChamberDef(top.chamberId), visits: top.totalVisits };
  }, [afChambers, getChamberDef]);

  const mostForgedSpecies = useMemo(() => {
    const counts = creatureSpeciesBreakdown;
    let maxSpecies = '';
    let maxCount = 0;
    for (const [species, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        maxSpecies = species;
      }
    }
    if (!maxSpecies) return null;
    return { species: maxSpecies, count: maxCount, def: AF_SPECIES.find((s) => s.id === maxSpecies) };
  }, [creatureSpeciesBreakdown]);

  const rarestOwnedCreature = useMemo(() => {
    const rarityOrder: AfRarity[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    for (const rarity of rarityOrder) {
      const found = afForged.find((f) => {
        const def = getCreatureDef(f.creatureId);
        return def?.rarity === rarity;
      });
      if (found) {
        return { ...found, def: getCreatureDef(found.creatureId) };
      }
    }
    return null;
  }, [afForged, getCreatureDef]);

  const forgeEfficiency = useMemo(() => {
    if (afStats.totalForged === 0) return 0;
    const totalPower = afForged.reduce((sum, f) => {
      const def = getCreatureDef(f.creatureId);
      return sum + (def?.power || 0) + (def?.defense || 0);
    }, 0);
    return Math.round(totalPower / afStats.totalForged);
  }, [afForged, afStats.totalForged, getCreatureDef]);

  const activeEventInfo = useMemo(() => {
    if (!afActiveEvent) return null;
    const def = getEventDef(afActiveEvent);
    if (!def) return null;
    const logEntry = afEventLog.find((e) => e.eventId === afActiveEvent && !e.resolved);
    return {
      ...def,
      triggeredAt: logEntry?.triggeredAt || Date.now(),
      isBuff: def.effectType === 'buff',
      isDebuff: def.effectType === 'debuff',
      isSpecial: def.effectType === 'special',
    };
  }, [afActiveEvent, afEventLog, getEventDef]);

  const levelTier = useMemo((): 'early' | 'mid' | 'late' | 'max' => {
    if (afLevel >= AF_MAX_LEVEL) return 'max';
    if (afLevel >= 33) return 'late';
    if (afLevel >= 15) return 'mid';
    return 'early';
  }, [afLevel]);

  const sessionsPlayed = useMemo(() => {
    return Math.max(1, Math.floor(afStats.totalXp / 500) + 1);
  }, [afStats.totalXp]);

  const materialsByCategory = useMemo(() => {
    const result: Record<string, AfInventoryItem[]> = {};
    for (const item of afInventory.filter((i) => i.count > 0)) {
      const def = getMaterialDef(item.materialId);
      if (def) {
        if (!result[def.category]) result[def.category] = [];
        result[def.category].push(item);
      }
    }
    return result;
  }, [afInventory, getMaterialDef]);

  const materialsByRarity = useMemo(() => {
    const rarities: AfRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, AfInventoryItem[]> = {};
    for (const r of rarities) {
      result[r] = afInventory.filter((item) => {
        if (item.count <= 0) return false;
        const def = getMaterialDef(item.materialId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [afInventory, getMaterialDef]);

  const structureCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const s of AF_STRUCTURES) {
      const existing = afStructures.find((rec) => rec.structureId === s.id);
      const currentLvl = existing ? existing.level : 0;
      if (currentLvl >= s.maxLevel) {
        costs[s.id] = -1; // maxed
      } else {
        costs[s.id] = afCalculateStructureCost(s.baseCost, s.costMultiplier, currentLvl);
      }
    }
    return costs;
  }, [afStructures]);

  const artifactCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    for (const a of AF_ARTIFACTS) {
      costs[a.id] = a.cost;
    }
    return costs;
  }, []);

  const isLevelMaxed = useMemo(() => {
    return afLevel >= AF_MAX_LEVEL;
  }, [afLevel]);

  const coinIncomeRate = useMemo(() => {
    return Math.floor(afLevel * 2.5 + (currentTitleInfo?.coinBonus || 0));
  }, [afLevel, currentTitleInfo]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    AF_AURORA_GREEN,
    AF_STARLIGHT_BLUE,
    AF_NEBULA_PURPLE,
    AF_COSMIC_GOLD,
    AF_FROST_WHITE,
    AF_VOID_DEEP,
    AF_EMBER_ORANGE,
    AF_RARITY_COLORS,
    AF_SPECIES_COLORS,
    AF_ALL_COLORS,

    // ---- Data Constants ----
    AF_SPECIES,
    AF_CREATURES,
    AF_CHAMBERS,
    AF_MATERIALS,
    AF_STRUCTURES,
    AF_ABILITIES,
    AF_ACHIEVEMENTS,
    AF_TITLES,
    AF_ARTIFACTS,
    AF_EVENTS,
    AF_MAX_LEVEL,
    AF_SAVE_KEY,
    AF_XP_BASE,
    AF_XP_SCALE,

    // ---- State ----
    afLevel,
    afXp,
    afMaxXp,
    afCoins,
    afTotalXp,
    afTotalCoins,
    afForged,
    afInventory,
    afStructures,
    afArtifacts,
    afAbilities,
    afAchievements,
    afChambers,
    afEventLog,
    afActiveEvent,
    afCurrentTitle,
    afStats,

    // ---- Core Actions ----
    forgeWeapon,
    exploreChamber,
    buildStructure,
    activateArtifact,
    triggerForgeEvent,
    resetAuroraForge,

    // ---- Extended Actions ----
    discoverChamber,
    checkAndClaimAchievements,
    useAbility,
    renameCreature,
    removeCreature,
    useMaterial,
    sellMaterial,
    upgradeStructure,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    afTitleProgress,

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
    enrichedEvents,

    // ---- Computed Data ----
    creaturesBySpecies,
    creaturesByRarity,
    availableCandidates,
    affordableByRarity,
    pendingAchievements,
    recentEventLog,
    creaturesByPower,
    topCreatures,
    creatureSpeciesBreakdown,
    creatureRarityBreakdown,
    chamberExplorationMap,
    structureLevelSum,
    abilityUnlockMap,
    totalInventoryValue,
    totalCreaturePower,
    totalCreatureDefense,
    unlockableChambers,
    lockedChambers,
    fullyExploredChambers,
    mostVisitedChamber,
    mostForgedSpecies,
    rarestOwnedCreature,
    forgeEfficiency,
    activeEventInfo,
    levelTier,
    sessionsPlayed,
    materialsByCategory,
    materialsByRarity,
    structureCosts,
    artifactCosts,
    isLevelMaxed,
    coinIncomeRate,

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
  };
}
