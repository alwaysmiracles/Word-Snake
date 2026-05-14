import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Midnight Forge (暗夜锻造) — Wire Module
//
// A dark magical forge hidden beneath a moonless mountain, where
// shadow smiths craft weapons and armor from darksteel, obsidian,
// and starlight. Players forge shadow creatures, explore forge
// chambers, collect dark materials, build structures, discover
// ancient artifacts, face random forge events, and ascend through
// 8 titles from Apprentice to Grandmaster Shadow Smith.
//
// Storage key: midnight-forge-save
// Prefix: md / MD_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type MdRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type MdSpecies =
  | 'shadow_smith'
  | 'darksteel_golem'
  | 'starlight_elemental'
  | 'obsidian_dragon'
  | 'void_hammer'
  | 'nightforge_spider'
  | 'moon_demon';

type MdAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type MdStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'oreYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type MdMaterialCategory = 'ore' | 'gem' | 'crystal' | 'organic' | 'shadow' | 'starlight' | 'ember';

// ---- Creature Definitions ----

interface MdCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: MdSpecies;
  readonly rarity: MdRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface MdChamberDef {
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

interface MdMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: MdRarity;
  readonly value: number;
  readonly category: MdMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface MdStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: MdStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface MdAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: MdAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: MdRarity;
}

// ---- Achievement Definitions ----

interface MdAchievementDef {
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

interface MdTitleDef {
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

interface MdArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: MdRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface MdEventDef {
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

interface MdOwnedCreature {
  creatureId: string;
  instanceId: string;
  forgedAt: number;
  timesUsed: number;
  nickname: string;
}

interface MdChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface MdStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface MdArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface MdAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface MdAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface MdInventoryItem {
  materialId: string;
  count: number;
}

interface MdEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface MdStats {
  totalForged: number;
  totalExplored: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface MdTitleProgress {
  current: MdTitleDef;
  next: MdTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: MD_ CONSTANTS
// ============================================================

const MD_SAVE_KEY = 'midnight-forge-save';
const MD_MAX_LEVEL = 50;
const MD_STARTING_COINS = 300;
const MD_STARTING_XP = 0;
const MD_XP_BASE = 100;
const MD_XP_SCALE = 1.5;
const MD_AUTO_SAVE_MS = 15000;
const MD_EVENT_DURATION_MS = 60000;
const MD_MAX_INVENTORY_ITEM = 999;
const MD_MAX_OWNED_CREATURES = 100;
const MD_COOLDOWN_TICK_MS = 1000;
const MD_SPECIES_COUNT = 7;
const MD_CREATURE_COUNT = 35;
const MD_CHAMBER_COUNT = 8;
const MD_MATERIAL_COUNT = 12;
const MD_STRUCTURE_COUNT = 8;
const MD_ABILITY_COUNT = 8;
const MD_ACHIEVEMENT_COUNT = 10;
const MD_TITLE_COUNT = 8;
const MD_ARTIFACT_COUNT = 6;
const MD_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const MD_SHADOW_BLACK = '#1A1A2E';
const MD_DARKSTEEL = '#4A4A6A';
const MD_MOONLIGHT = '#C9D1FF';
const MD_EMBER = '#FF6B35';
const MD_STAR_GOLD = '#FFD700';
const MD_VOID_BLUE = '#0F3460';
const MD_CRIMSON_GLOW = '#E94560';

const MD_RARITY_COLORS: Record<MdRarity, string> = {
  common: '#8A8A9A',
  uncommon: '#5DADE2',
  rare: '#AB47BC',
  epic: '#E94560',
  legendary: '#FFD700',
};

const MD_SPECIES_COLORS: Record<MdSpecies, string> = {
  shadow_smith: MD_SHADOW_BLACK,
  darksteel_golem: MD_DARKSTEEL,
  starlight_elemental: MD_MOONLIGHT,
  obsidian_dragon: MD_CRIMSON_GLOW,
  void_hammer: MD_VOID_BLUE,
  nightforge_spider: MD_EMBER,
  moon_demon: MD_STAR_GOLD,
};

const MD_ALL_COLORS = [
  MD_SHADOW_BLACK,
  MD_DARKSTEEL,
  MD_MOONLIGHT,
  MD_EMBER,
  MD_STAR_GOLD,
  MD_VOID_BLUE,
  MD_CRIMSON_GLOW,
];

// ============================================================
// SECTION 4: MD_SPECIES — 7 Species Types
// ============================================================

const MD_SPECIES: { id: MdSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'shadow_smith',
    name: 'Shadow Smith',
    description: 'Spectral artisans that manipulate solidified shadow to craft weapons of pure darkness.',
    lore: 'Shadow Smiths were once mortal blacksmiths who sacrificed their eyesight to see in absolute darkness, becoming one with the void.',
    emoji: '👨‍🔧',
    color: MD_SHADOW_BLACK,
  },
  {
    id: 'darksteel_golem',
    name: 'Darksteel Golem',
    description: 'Colossal automatons forged from darksteel alloy, tireless guardians of the forge depths.',
    lore: 'Darksteel Golems were created by the First Shadow Smith to mine ore in the deepest chambers where no mortal could survive.',
    emoji: '🤖',
    color: MD_DARKSTEEL,
  },
  {
    id: 'starlight_elemental',
    name: 'Starlight Elemental',
    description: 'Beings of condensed starlight that illuminate the forge and fuel the crucibles with cosmic energy.',
    lore: 'Starlight Elementals descend from the sky on moonless nights, drawn to the forge by the resonance of hammer on anvil.',
    emoji: '✨',
    color: MD_MOONLIGHT,
  },
  {
    id: 'obsidian_dragon',
    name: 'Obsidian Dragon',
    description: 'Dragons born from volcanic obsidian with scales that reflect no light, rendering them invisible in darkness.',
    lore: 'Obsidian Dragons were bred by the Ancient Ones to serve as living furnaces, their internal heat exceeding that of any forge.',
    emoji: '🐉',
    color: MD_CRIMSON_GLOW,
  },
  {
    id: 'void_hammer',
    name: 'Void Hammer',
    description: 'Animate hammer constructs that float through the air, striking with the force of collapsing stars.',
    lore: 'Void Hammers were the primary tools of the First Shadow Smith, each containing a fragment of a dead star at its core.',
    emoji: '🔨',
    color: MD_VOID_BLUE,
  },
  {
    id: 'nightforge_spider',
    name: 'Nightforge Spider',
    description: 'Arachnids that spin webs of molten metal, weaving armor plating with supernatural precision.',
    lore: 'Nightforge Spiders learned metalworking by watching Shadow Smiths for millennia, eventually surpassing their teachers.',
    emoji: '🕷️',
    color: MD_EMBER,
  },
  {
    id: 'moon_demon',
    name: 'Moon Demon',
    description: 'Celestial beings corrupted by the forge\'s dark energy, radiating eerie pale moonlight.',
    lore: 'Moon Demons fell from the heavens when they tried to steal starlight from the forge, becoming bound to its shadow forever.',
    emoji: '🌙',
    color: MD_STAR_GOLD,
  },
];

// ============================================================
// SECTION 5: MD_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const MD_CREATURES: MdCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'shadow_smith_common', name: 'Dusk Apprentice', species: 'shadow_smith', rarity: 'common',
    description: 'A novice shadow smith learning to shape darkness into crude but functional tools.',
    lore: 'Dusk Apprentices train for decades before they can bend shadow into even the simplest dagger.',
    emoji: '👨‍🔧', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'darksteel_golem_common', name: 'Scrap Crawler', species: 'darksteel_golem', rarity: 'common',
    description: 'A small golem cobbled together from darksteel scraps, loyal but limited in capability.',
    lore: 'Scrap Crawlers were the very first golems created, assembled from broken weapons and leftover armor pieces.',
    emoji: '🤖', power: 9, defense: 12, cost: 18, xpReward: 7,
  },
  {
    id: 'starlight_elemental_common', name: 'Spark Wisp', species: 'starlight_elemental', rarity: 'common',
    description: 'A tiny mote of captured starlight that flickers and dances in the forge\'s heat.',
    lore: 'Spark Wisps are the souls of dying stars, preserved by the forge\'s dark energy for eternity.',
    emoji: '✨', power: 7, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'obsidian_dragon_common', name: 'Glass Hatchling', species: 'obsidian_dragon', rarity: 'common',
    description: 'A baby dragon with scales of glossy black obsidian, warm to the touch from internal fire.',
    lore: 'Glass Hatchlings are born in volcanic vents deep beneath the forge, their first breath cooling into obsidian droplets.',
    emoji: '🐉', power: 11, defense: 9, cost: 24, xpReward: 10,
  },
  {
    id: 'void_hammer_common', name: 'Echo Mallet', species: 'void_hammer', rarity: 'common',
    description: 'A small floating hammer that strikes with rhythmic precision, useful for basic forging.',
    lore: 'Echo Mallets replicate the sound of the First Shadow Smith\'s hammering, gaining power with each echo.',
    emoji: '🔨', power: 8, defense: 6, cost: 16, xpReward: 6,
  },
  {
    id: 'nightforge_spider_common', name: 'Wire Spider', species: 'nightforge_spider', rarity: 'common',
    description: 'A small spider that produces thin metal threads from its spinnerets, weaving crude mesh.',
    lore: 'Wire Spiders were originally ordinary cave spiders that absorbed darksteel particles from the forge\'s exhaust.',
    emoji: '🕷️', power: 6, defense: 7, cost: 15, xpReward: 6,
  },
  {
    id: 'moon_demon_common', name: 'Shade Imp', species: 'moon_demon', rarity: 'common',
    description: 'A mischievous minor demon wreathed in pale moonlight, drawn to the forge\'s glow.',
    lore: 'Shade Imps cannot survive in direct sunlight, making the midnight forge their natural habitat.',
    emoji: '🌙', power: 8, defense: 6, cost: 18, xpReward: 7,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'shadow_smith_uncommon', name: 'Shadow Artificer', species: 'shadow_smith', rarity: 'uncommon',
    description: 'A skilled smith who can forge weapons from solidified shadow that cut through any material.',
    lore: 'Shadow Artificers create weapons that exist partially in the void, making them impossible to parry.',
    emoji: '👨‍🔧', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'darksteel_golem_uncommon', name: 'Iron Sentinel', species: 'darksteel_golem', rarity: 'uncommon',
    description: 'A medium-sized golem with reinforced darksteel plating and a core of compressed ember.',
    lore: 'Iron Sentinels patrol the forge\'s outer chambers, destroying any intruders with devastating precision.',
    emoji: '🤖', power: 20, defense: 26, cost: 55, xpReward: 18,
  },
  {
    id: 'starlight_elemental_uncommon', name: 'Lumen Wraith', species: 'starlight_elemental', rarity: 'uncommon',
    description: 'A larger elemental that radiates steady starlight, capable of powering multiple forges.',
    lore: 'Lumen Wraiths can split themselves into multiple smaller wisps, illuminating an entire chamber simultaneously.',
    emoji: '✨', power: 18, defense: 14, cost: 65, xpReward: 22,
  },
  {
    id: 'obsidian_dragon_uncommon', name: 'Obsidian Drake', species: 'obsidian_dragon', rarity: 'uncommon',
    description: 'A juvenile dragon that breathes rivers of molten obsidian, sealing chambers with volcanic glass.',
    lore: 'Obsidian Drakes are used by Shadow Smiths to create obsidian seals that are virtually indestructible.',
    emoji: '🐉', power: 24, defense: 20, cost: 62, xpReward: 21,
  },
  {
    id: 'void_hammer_uncommon', name: 'Gravity Maul', species: 'void_hammer', rarity: 'uncommon',
    description: 'A heavy hammer that generates its own gravitational field, increasing impact force exponentially.',
    lore: 'Gravity Mauls contain a singularity at their core, the same force that forged the mountains above.',
    emoji: '🔨', power: 26, defense: 12, cost: 58, xpReward: 19,
  },
  {
    id: 'nightforge_spider_uncommon', name: 'Chain Weaver', species: 'nightforge_spider', rarity: 'uncommon',
    description: 'A spider that spins chains of linked darksteel rings, creating unbreakable nets.',
    lore: 'Chain Weavers produce metal so pure that their webs ring like bells when struck by wind.',
    emoji: '🕷️', power: 16, defense: 22, cost: 50, xpReward: 17,
  },
  {
    id: 'moon_demon_uncommon', name: 'Gloom Fiend', species: 'moon_demon', rarity: 'uncommon',
    description: 'A cunning demon that steals starlight and corrupts it into weapons of pale destruction.',
    lore: 'Gloom Fiends can extinguish any light source within fifty paces, surrounding themselves in perfect darkness.',
    emoji: '🌙', power: 21, defense: 16, cost: 55, xpReward: 18,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'shadow_smith_rare', name: 'Ebon Armorer', species: 'shadow_smith', rarity: 'rare',
    description: 'A master smith who crafts legendary armor that renders the wearer nearly invulnerable.',
    lore: 'Ebon Armorers only accept commissions from warriors who have proven themselves worthy in mortal combat.',
    emoji: '👨‍🔧', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'darksteel_golem_rare', name: 'Titan Crucible', species: 'darksteel_golem', rarity: 'rare',
    description: 'A massive golem that serves as a walking forge, its belly a roaring furnace of darksteel flames.',
    lore: 'Titan Crucibles were used in the ancient wars, smelting enemy weapons on the battlefield into new creations.',
    emoji: '🤖', power: 35, defense: 42, cost: 190, xpReward: 48,
  },
  {
    id: 'starlight_elemental_rare', name: 'Nova Spirit', species: 'starlight_elemental', rarity: 'rare',
    description: 'An elemental channeling the energy of a dying supernova, devastatingly powerful and beautiful.',
    lore: 'Nova Spirits appear only when a star dies within viewing distance of the forge, absorbing its final light.',
    emoji: '✨', power: 42, defense: 28, cost: 220, xpReward: 55,
  },
  {
    id: 'obsidian_dragon_rare', name: 'Volcanic Wyrm', species: 'obsidian_dragon', rarity: 'rare',
    description: 'A powerful dragon that swims through molten rock as easily as water, emerging covered in fresh obsidian.',
    lore: 'Volcanic Wyrms created the magma vents that power the forge, tunneling through the earth\'s crust for centuries.',
    emoji: '🐉', power: 38, defense: 32, cost: 200, xpReward: 52,
  },
  {
    id: 'void_hammer_rare', name: 'Singularity Smith', species: 'void_hammer', rarity: 'rare',
    description: 'A hammer construct housing a stable singularity, capable of forging matter from nothing.',
    lore: 'Singularity Smiths can create weapons from the vacuum itself, pulling atoms from the void and compressing them.',
    emoji: '🔨', power: 44, defense: 25, cost: 210, xpReward: 54,
  },
  {
    id: 'nightforge_spider_rare', name: 'Darksteel Matriarch', species: 'nightforge_spider', rarity: 'rare',
    description: 'An enormous spider whose web can support the weight of an entire forge chamber.',
    lore: 'Darksteel Matriarchs have been known to weave bridges spanning the deepest chasms of the mountain.',
    emoji: '🕷️', power: 32, defense: 38, cost: 195, xpReward: 49,
  },
  {
    id: 'moon_demon_rare', name: 'Eclipse Phantom', species: 'moon_demon', rarity: 'rare',
    description: 'A spectral demon that appears during eclipses, wielding a blade forged from stolen moonlight.',
    lore: 'Eclipse Phantoms are the ghosts of Moon Demons who tried to return to the heavens and were struck down.',
    emoji: '🌙', power: 37, defense: 30, cost: 200, xpReward: 50,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'shadow_smith_epic', name: 'Voidweaver Sovereign', species: 'shadow_smith', rarity: 'epic',
    description: 'The supreme shadow smith, capable of forging reality itself into weapons of devastating power.',
    lore: 'Voidweaver Sovereigns have touched the boundary between existence and void, returning with the ability to reshape both.',
    emoji: '👨‍🔧', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'darksteel_golem_epic', name: 'Colossus of the Deep', species: 'darksteel_golem', rarity: 'epic',
    description: 'A mountain-sized golem that guards the forge\'s deepest secrets, immovable and all-destroying.',
    lore: 'The Colossus of the Deep has not moved in a thousand years, yet no intruder has ever passed it.',
    emoji: '🤖', power: 62, defense: 75, cost: 780, xpReward: 115,
  },
  {
    id: 'starlight_elemental_epic', name: 'Pulsar Guardian', species: 'starlight_elemental', rarity: 'epic',
    description: 'An elemental fueled by pulsar energy, emitting rhythmic waves of devastating cosmic radiation.',
    lore: 'Pulsar Guardians keep time in the forge, their rhythmic pulses marking the seconds of eternity.',
    emoji: '✨', power: 72, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'obsidian_dragon_epic', name: 'Apocalypse Wyrm', species: 'obsidian_dragon', rarity: 'epic',
    description: 'An ancient dragon of catastrophic power whose breath can reduce mountains to glass.',
    lore: 'The Apocalypse Wyrm was the last creation of the First Shadow Smith, forged to serve as the forge\'s final guardian.',
    emoji: '🐉', power: 68, defense: 55, cost: 820, xpReward: 125,
  },
  {
    id: 'void_hammer_epic', name: 'Entropy Forge', species: 'void_hammer', rarity: 'epic',
    description: 'A hammer construct that channels the heat death of the universe into each devastating strike.',
    lore: 'Entropy Forges grow stronger with each use, absorbing a fraction of the energy they release.',
    emoji: '🔨', power: 74, defense: 48, cost: 860, xpReward: 132,
  },
  {
    id: 'nightforge_spider_epic', name: 'Voidweb Queen', species: 'nightforge_spider', rarity: 'epic',
    description: 'A monstrous spider whose webs extend through dimensions, trapping prey across the void.',
    lore: 'The Voidweb Queen\'s web touches every shadow in the mountain, connecting all darkness into a single network.',
    emoji: '🕷️', power: 60, defense: 65, cost: 780, xpReward: 115,
  },
  {
    id: 'moon_demon_epic', name: 'Blood Moon Archduke', species: 'moon_demon', rarity: 'epic',
    description: 'A demon lord who commands legions of lesser moon demons, radiating crimson moonlight that corrupts all it touches.',
    lore: 'The Blood Moon Archduke was once a celestial prince who sought forbidden knowledge in the forge\'s darkest depths.',
    emoji: '🌙', power: 66, defense: 58, cost: 800, xpReward: 120,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'shadow_smith_legendary', name: 'The First Shadow Smith', species: 'shadow_smith', rarity: 'legendary',
    description: 'The mythical creator of the Midnight Forge itself, a being of pure shadow and starlight.',
    lore: 'The First Shadow Smith existed before the mountain, before the darkness. They forged the forge from nothing.',
    emoji: '👨‍🔧', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'darksteel_golem_legendary', name: 'Eternium Colossus', species: 'darksteel_golem', rarity: 'legendary',
    description: 'The original golem, forged by the First Shadow Smith, containing the soul of a dead world.',
    lore: 'The Eternium Colossus has existed since before time began, its darksteel body hosting an entire ecosystem within.',
    emoji: '🤖', power: 110, defense: 135, cost: 2900, xpReward: 290,
  },
  {
    id: 'starlight_elemental_legendary', name: 'Supernova Archon', species: 'starlight_elemental', rarity: 'legendary',
    description: 'An elemental born from the death of the oldest star in existence, containing infinite cosmic power.',
    lore: 'The Supernova Archon chose to remain in the forge rather than return to the heavens, finding beauty in darkness.',
    emoji: '✨', power: 130, defense: 90, cost: 3200, xpReward: 320,
  },
  {
    id: 'obsidian_dragon_legendary', name: 'Dragon of the Eternal Night', species: 'obsidian_dragon', rarity: 'legendary',
    description: 'The primordial dragon whose scales formed the mountain around the forge, keeper of eternal darkness.',
    lore: 'The Dragon of the Eternal Night sleeps coiled around the forge, its heartbeat the rhythm of every hammer strike.',
    emoji: '🐉', power: 125, defense: 95, cost: 3100, xpReward: 310,
  },
  {
    id: 'void_hammer_legendary', name: 'Hammer of the Cosmos', species: 'void_hammer', rarity: 'legendary',
    description: 'The ultimate hammer construct, forged from the collapsed core of a dead universe.',
    lore: 'The Hammer of the Cosmos was the First Shadow Smith\'s final creation, containing the power to unmake creation.',
    emoji: '🔨', power: 135, defense: 85, cost: 3500, xpReward: 350,
  },
  {
    id: 'nightforge_spider_legendary', name: 'Weaver of All Shadows', species: 'nightforge_spider', rarity: 'legendary',
    description: 'The ancestral spider that taught the First Shadow Smith how to weave shadow into solid form.',
    lore: 'The Weaver of All Shadows predates the forge itself, spinning the darkness that became the mountain.',
    emoji: '🕷️', power: 115, defense: 110, cost: 3000, xpReward: 300,
  },
  {
    id: 'moon_demon_legendary', name: 'The Dark Moon Sovereign', species: 'moon_demon', rarity: 'legendary',
    description: 'The fallen king of all celestial beings, ruling the forge from his throne of corrupted starlight.',
    lore: 'The Dark Moon Sovereign traded his place among the stars to become the forge\'s eternal overlord.',
    emoji: '🌙', power: 118, defense: 100, cost: 3200, xpReward: 320,
  },
];

// ============================================================
// SECTION 6: MD_CHAMBERS — 8 Forge Chambers
// ============================================================

const MD_CHAMBERS: MdChamberDef[] = [
  {
    id: 'anvil_of_shadows', name: 'The Anvil of Shadows', emoji: '⚒️',
    description: 'The primary forging chamber where shadow smiths hammer weapons on anvils of pure darkness.',
    lore: 'The Anvil of Shadows was the first thing the First Shadow Smith created — from it, all else was born.',
    level: 1, resources: ['darksteel_ore', 'shadow_dust', 'ember_slag'], capacity: 10,
    unlockLevel: 1, ambientColor: MD_SHADOW_BLACK, dangerLevel: 1,
  },
  {
    id: 'starlight_crucible', name: 'Starlight Crucible', emoji: '⚡',
    description: 'A vast crucible chamber where captured starlight is refined into forge fuel.',
    lore: 'The Starlight Crucible was built to trap the last light of dying stars, converting it into raw forging energy.',
    level: 3, resources: ['moonlight_crystal', 'star_fragment', 'prism_dust'], capacity: 15,
    unlockLevel: 3, ambientColor: MD_MOONLIGHT, dangerLevel: 2,
  },
  {
    id: 'obsidian_vault', name: 'Obsidian Vault', emoji: '🏦',
    description: 'A treasury of volcanic obsidian where the forge\'s most valuable creations are stored.',
    lore: 'The Obsidian Vault\'s walls were carved by the Dragon of the Eternal Night itself, and cannot be breached by any force.',
    level: 5, resources: ['obsidian_shard', 'darksteel_ore', 'shadow_dust'], capacity: 20,
    unlockLevel: 5, ambientColor: '#2D2D3D', dangerLevel: 3,
  },
  {
    id: 'ember_pits', name: 'The Ember Pits', emoji: '🔥',
    description: 'Scorching pits of eternal flame where darksteel is smelted and tempered.',
    lore: 'The Ember Pits burn with the fury of the world\'s core, never extinguishing, never cooling.',
    level: 10, resources: ['void_ember', 'ember_slag', 'darksteel_ore'], capacity: 25,
    unlockLevel: 10, ambientColor: MD_EMBER, dangerLevel: 5,
  },
  {
    id: 'void_quarry', name: 'Void Quarry', emoji: '⛏️',
    description: 'A seemingly bottomless quarry where darksteel ore is mined from the boundary of reality.',
    lore: 'The Void Quarry extends into a pocket dimension where physics breaks down, allowing impossible materials to form.',
    level: 15, resources: ['darksteel_ore', 'void_ember', 'abyssal_iron'], capacity: 30,
    unlockLevel: 15, ambientColor: MD_VOID_BLUE, dangerLevel: 6,
  },
  {
    id: 'moon_sanctum', name: 'Moonlight Sanctum', emoji: '🌟',
    description: 'A serene chamber bathed in captured moonlight, used for enchanting weapons with celestial power.',
    lore: 'The Moonlight Sanctum is the only place in the forge where demons cannot enter, purified by eternal moonlight.',
    level: 20, resources: ['moonlight_crystal', 'star_fragment', 'prism_dust'], capacity: 35,
    unlockLevel: 20, ambientColor: MD_STAR_GOLD, dangerLevel: 4,
  },
  {
    id: 'crimson_forge', name: 'Crimson Forge', emoji: '❤️‍🔥',
    description: 'A dangerous chamber where weapons are quenched in blood-red flames of pure destructive energy.',
    lore: 'The Crimson Forge was the Blood Moon Archduke\'s gift to the forge, fueled by his corrupted celestial fire.',
    level: 30, resources: ['void_ember', 'shadow_heart', 'crimson_ingot'], capacity: 40,
    unlockLevel: 30, ambientColor: MD_CRIMSON_GLOW, dangerLevel: 8,
  },
  {
    id: 'heart_of_the_mountain', name: 'Heart of the Mountain', emoji: '💎',
    description: 'The legendary core chamber where the Dragon of the Eternal Night sleeps, radiating primordial power.',
    lore: 'The Heart of the Mountain beats like a living thing, its rhythm synchronizing with every hammer strike above.',
    level: 40, resources: ['dragon_scale', 'primordial_core', 'shadow_heart'], capacity: 50,
    unlockLevel: 40, ambientColor: '#FFD700', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: MD_MATERIALS — 12 Materials
// ============================================================

const MD_MATERIALS: MdMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'darksteel_ore', name: 'Darksteel Ore', emoji: '🪨', rarity: 'common', value: 5,
    category: 'ore', craftBonus: 1,
    description: 'Raw chunks of darksteel extracted from the Void Quarry, dark as midnight and cold as the void.',
    lore: 'Darksteel Ore absorbs all light that touches it, making mining operations proceed in absolute darkness.',
  },
  {
    id: 'shadow_dust', name: 'Shadow Dust', emoji: '🌫️', rarity: 'common', value: 4,
    category: 'shadow', craftBonus: 1,
    description: 'Fine particles of solidified shadow, gathered from the forge\'s deepest corners.',
    lore: 'Shadow Dust is the byproduct of every hammer strike on the Anvil of Shadows, accumulating over millennia.',
  },
  {
    id: 'ember_slag', name: 'Ember Slag', emoji: '🟠', rarity: 'common', value: 5,
    category: 'ember', craftBonus: 2,
    description: 'Cooled remnants of the Ember Pits, still warm to the touch and crackling with residual energy.',
    lore: 'Ember Slag is used as a base material for common weapons, providing a modest heat bonus to crafted items.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'obsidian_shard', name: 'Obsidian Shard', emoji: '🔷', rarity: 'uncommon', value: 15,
    category: 'ore', craftBonus: 3,
    description: 'A razor-sharp fragment of volcanic obsidian, perfect for blade edges and armor plating.',
    lore: 'Obsidian Shards from the forge are unlike any other — they are perpetually sharp and never dull.',
  },
  {
    id: 'moonlight_crystal', name: 'Moonlight Crystal', emoji: '🌙', rarity: 'uncommon', value: 14,
    category: 'crystal', craftBonus: 3,
    description: 'A crystal that stores moonlight, glowing with a soft pale luminescence even in total darkness.',
    lore: 'Moonlight Crystals form only during lunar eclipses when the forge is aligned with the moon\'s shadow.',
  },
  {
    id: 'star_fragment', name: 'Star Fragment', emoji: '⭐', rarity: 'uncommon', value: 16,
    category: 'starlight', craftBonus: 3,
    description: 'A small piece of a fallen star, still radiating warmth and faint cosmic energy.',
    lore: 'Star Fragments are the Starlight Crucible\'s primary fuel, each containing enough energy to power a forge for a year.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'void_ember', name: 'Void Ember', emoji: '🔴', rarity: 'rare', value: 50,
    category: 'ember', craftBonus: 6,
    description: 'An ember pulled from the void itself, burning with dark fire that consumes light instead of producing it.',
    lore: 'Void Embers are the rarest fuel source in the forge, capable of smelting materials that no ordinary flame can touch.',
  },
  {
    id: 'abyssal_iron', name: 'Abyssal Iron', emoji: '⚫', rarity: 'rare', value: 55,
    category: 'ore', craftBonus: 7,
    description: 'Iron forged under impossible pressure at the bottom of the Void Quarry, harder than diamond.',
    lore: 'Abyssal Iron was once ordinary iron that fell into the void and was compressed by the weight of nonexistence.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'crimson_ingot', name: 'Crimson Ingot', emoji: '🟥', rarity: 'epic', value: 150,
    category: 'ore', craftBonus: 12,
    description: 'An ingot of metal smelted in the Crimson Forge, glowing with an inner red flame that never dies.',
    lore: 'Crimson Ingots are quenched in the Blood Moon Archduke\'s corrupted light, gaining properties of both metal and magic.',
  },
  {
    id: 'shadow_heart', name: 'Shadow Heart', emoji: '🖤', rarity: 'epic', value: 160,
    category: 'shadow', craftBonus: 13,
    description: 'A crystallized heart of pure shadow energy, pulsing with the rhythm of the mountain itself.',
    lore: 'Shadow Hearts are found only in the Heart of the Mountain, growing like gems from the Dragon\'s dreaming breath.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'dragon_scale', name: 'Dragon Scale', emoji: '🐉', rarity: 'legendary', value: 600,
    category: 'organic', craftBonus: 25,
    description: 'A scale shed by the Dragon of the Eternal Night, containing the essence of primordial darkness.',
    lore: 'Dragon Scales are the most sought-after material in all of creation — a single scale can forge a weapon that slays gods.',
  },
  {
    id: 'primordial_core', name: 'Primordial Core', emoji: '💠', rarity: 'legendary', value: 700,
    category: 'starlight', craftBonus: 28,
    description: 'The condensed energy of the universe\'s birth, a sphere of pure creation force.',
    lore: 'The Primordial Core is said to be the seed from which the First Shadow Smith forged the forge itself.',
  },
];

// ============================================================
// SECTION 8: MD_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const MD_STRUCTURES: MdStructureDef[] = [
  {
    id: 'shadow_anvil', name: 'Shadow Anvil', emoji: '⚒️',
    description: 'An anvil forged from solidified shadow, essential for all basic weapon and armor crafting.',
    lore: 'The Shadow Anvil absorbs the force of every hammer strike, returning it as amplified shadow energy.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'darksteel_smelter', name: 'Darksteel Smelter', emoji: '🔥',
    description: 'A massive smelting furnace that processes raw darksteel ore into usable ingots.',
    lore: 'The Darksteel Smelter burns with void fire, hot enough to melt any known material in existence.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'crystal_refinery', name: 'Crystal Refinery', emoji: '🔮',
    description: 'A refinery that purifies raw crystals into concentrated starlight fuel for the forge.',
    lore: 'The Crystal Refinery was built by the Supernova Archon, who poured a fraction of its own energy into its foundation.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'obsidian_armory', name: 'Obsidian Armory', emoji: '🛡️',
    description: 'A fortified vault for storing forged weapons and armor, protected by obsidian barriers.',
    lore: 'The Obsidian Armory\'s walls were carved from a single block of obsidian, making it completely impervious to attack.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'void_furnace', name: 'Void Furnace', emoji: '🌋',
    description: 'A furnace that burns with the energy of collapsing voids, reaching temperatures beyond imagination.',
    lore: 'The Void Furnace was the Eternium Colossus\'s personal forge, capable of smelting materials that do not exist in this dimension.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'moonlight_beacon', name: 'Moonlight Beacon', emoji: '🔦',
    description: 'A beacon that captures and amplifies moonlight, providing free starlight energy to the forge.',
    lore: 'The Moonlight Beacon was the Dark Moon Sovereign\'s compromise — providing light to the forge that had imprisoned him.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'energyBonus', bonusPerLevel: 6,
  },
  {
    id: 'ember_harvester', name: 'Ember Harvester', emoji: '⚙️',
    description: 'An automated system that collects and stores embers from the Ember Pits for later use.',
    lore: 'The Ember Harvester was designed by the Weaver of All Shadows, its web-like collection system spanning the entire pit network.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'oreYield', bonusPerLevel: 6,
  },
  {
    id: 'forge_cannon', name: 'Forge Cannon', emoji: '💥',
    description: 'A devastating weapon that fires projectiles of superheated darksteel at devastating speeds.',
    lore: 'The Forge Cannon is the forge\'s last line of defense, capable of obliterating entire armies with a single shot.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: MD_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const MD_ABILITIES: MdAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'shadow_strike', name: 'Shadow Strike', category: 'offensive',
    description: 'Channels solidified shadow into a devastating blade that cuts through any defense.',
    lore: 'Shadow Strike was the first combat ability ever developed in the forge, created to test the sharpness of early weapons.',
    emoji: '🗡️', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'void_collapse', name: 'Void Collapse', category: 'offensive',
    description: 'Summons a localized void implosion that crushes all matter within its radius.',
    lore: 'Void Collapse recreates the moment of a star\'s death on a tiny scale, annihilating everything in its reach.',
    emoji: '🕳️', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'darksteel_barrier', name: 'Darksteel Barrier', category: 'defensive',
    description: 'Raises a wall of darksteel that absorbs incoming attacks and reflects shadow energy.',
    lore: 'Darksteel Barriers are standard forge defenses, reinforced by the constant hammering of nearby anvils.',
    emoji: '🧱', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'obsidian_aegis', name: 'Obsidian Aegis', category: 'defensive',
    description: 'Surrounds the user in a shell of enchanted obsidian that renders them invulnerable briefly.',
    lore: 'The Obsidian Aegis was developed by the Dragon of the Eternal Night to protect its eggs from cosmic threats.',
    emoji: '🛡️', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'shadow_sight', name: 'Shadow Sight', category: 'utility',
    description: 'Allows the user to see through solid matter by perceiving shadow outlines in the void.',
    lore: 'Shadow Sight was invented by the First Shadow Smith, who found it easier to navigate by darkness than by light.',
    emoji: '👁️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'ember_track', name: 'Ember Track', category: 'utility',
    description: 'Leaves a trail of burning embers that illuminates explored paths and reveals hidden chambers.',
    lore: 'Ember Track was the Voidweb Queen\'s gift to the forge, a trail of light spun from her silk and forge fire.',
    emoji: '🔥', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'golem_awaken', name: 'Golem Awaken', category: 'summon',
    description: 'Awakens a dormant darksteel golem to fight alongside you for a short duration.',
    lore: 'Golem Awaken triggers an ancient protocol embedded in every darksteel golem by the Eternium Colossus.',
    emoji: '🤖', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'spider_swarm', name: 'Spider Swarm', category: 'summon',
    description: 'Calls forth a swarm of Nightforge Spiders that overwhelm enemies with metallic webbing.',
    lore: 'Spider Swarms emerge from the walls themselves, the Voidweb Queen\'s children answering their mother\'s call.',
    emoji: '🕷️', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: MD_ACHIEVEMENTS — 10 Achievements
// ============================================================

const MD_ACHIEVEMENTS: MdAchievementDef[] = [
  {
    id: 'md_ach_first_forge', name: 'First Ember', emoji: '🔥',
    description: 'Forge your first shadow creature and ignite the flame of creation.',
    conditionKey: 'totalForged', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'md_ach_forge_10', name: 'Forge Apprentice', emoji: '🔨',
    description: 'Forge 10 shadow creatures and prove yourself as a capable shadow smith.',
    conditionKey: 'totalForged', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'md_ach_forge_25', name: 'Shadow Forgemaster', emoji: '🏅',
    description: 'Forge 25 shadow creatures to earn the title of Shadow Forgemaster.',
    conditionKey: 'totalForged', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'md_ach_explore_3', name: 'Chamber Explorer', emoji: '🔦',
    description: 'Discover 3 different forge chambers and begin mapping the depths.',
    conditionKey: 'totalExplored', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'md_ach_explore_all', name: 'Forge Cartographer', emoji: '🗺️',
    description: 'Explore all 8 forge chambers and complete the definitive map of the mountain.',
    conditionKey: 'totalExplored', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'md_ach_build_3', name: 'Structure Architect', emoji: '🏗️',
    description: 'Build 3 different forge structures to establish your underground workshop.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'md_ach_artifact_1', name: 'Relic Discoverer', emoji: '💎',
    description: 'Activate your first ancient forge artifact and unlock its hidden power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'md_ach_event_5', name: 'Forge Survivor', emoji: '🌋',
    description: 'Survive 5 random forge events without being defeated.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'md_ach_level_25', name: 'Mountain Veteran', emoji: '🧗',
    description: 'Reach forge level 25 and gain access to the deepest chambers.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'md_ach_level_50', name: 'Grandmaster Smith', emoji: '👑',
    description: 'Reach the maximum forge level 50 and master the entire Midnight Forge.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: MD_TITLES — 8 Title Progression
// ============================================================

const MD_TITLES: MdTitleDef[] = [
  {
    id: 'md_title_apprentice', name: 'Forge Apprentice', emoji: '🔨',
    description: 'A newcomer to the Midnight Forge, learning the basics of shadow smithing.',
    lore: 'Every grandmaster smith once stood before the Anvil of Shadows for the first time, trembling with anticipation.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'md_title_journeyman', name: 'Journeyman Smith', emoji: '⚒️',
    description: 'A rising smith who has mastered basic forging techniques and can craft common weapons.',
    lore: 'Journeymen spend years perfecting a single technique, knowing that mastery of one leads to mastery of all.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'md_title_dark_forger', name: 'Dark Forger', emoji: '🌑',
    description: 'A smith who has embraced the darkness and learned to forge weapons from solid shadow.',
    lore: 'Dark Forgers see the world differently — to them, shadow is the truest form of matter, and light merely its absence.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'md_title_ore_master', name: 'Ore Master', emoji: '⛏️',
    description: 'A master of materials who can identify, extract, and refine any ore from the mountain depths.',
    lore: 'Ore Masters can hear the song of metal within stone, extracting pure darksteel from the most impure rock.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'md_title_shadow_weaver', name: 'Shadow Weaver', emoji: '🕸️',
    description: 'An expert smith who can weave shadow and starlight together into legendary weapons.',
    lore: 'Shadow Weavers create weapons that exist in two dimensions simultaneously, striking from both the material world and the void.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'md_title_void_crafter', name: 'Void Crafter', emoji: '🌀',
    description: 'A legendary smith who has touched the void and returned with knowledge of creation itself.',
    lore: 'Void Crafters have seen the boundary where reality ends and nothing begins, gaining the power to shape both.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'md_title_eclipse_lord', name: 'Eclipse Lord', emoji: '🌗',
    description: 'A supreme smith who commands both shadow and starlight, ruling the forge with absolute authority.',
    lore: 'Eclipse Lords can trigger artificial eclipses within the mountain, plunging all chambers into supernatural darkness.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'md_title_grandmaster', name: 'Grandmaster Shadow Smith', emoji: '👑',
    description: 'The ultimate title, reserved for those who have fully mastered the Midnight Forge.',
    lore: 'Grandmaster Shadow Smiths are one with the forge — their heartbeat synchronizes with the Dragon\'s, their breath fuels the furnaces.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: MD_ARTIFACTS — 6 Artifacts
// ============================================================

const MD_ARTIFACTS: MdArtifactDef[] = [
  {
    id: 'md_art_shadow_tongs', name: 'Shadow Tongs',
    description: 'Tongs forged from living shadow that can grip and shape any material without direct contact.',
    lore: 'The Shadow Tongs were the First Shadow Smith\'s first tool, capable of manipulating matter through the void.',
    emoji: '🔧', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'md_art_starlight_lens', name: 'Starlight Lens',
    description: 'A lens ground from a single crystal of solid starlight that reveals hidden forge passages.',
    lore: 'The Starlight Lens shows the world as the Starlight Elementals see it — a tapestry of interconnected energy threads.',
    emoji: '🔍', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'md_art_dragon_hammer', name: 'Dragon\'s Hammer',
    description: 'A hammer carved from a Dragon of the Eternal Night\'s tooth, containing primordial fire.',
    lore: 'The Dragon\'s Hammer glows white-hot when danger is near, the dragon\'s rage transferring to whoever wields it.',
    emoji: '🔨', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'md_art_void_blueprint', name: 'Void Blueprint',
    description: 'A blueprint written in a language that exists between dimensions, detailing impossible creations.',
    lore: 'The Void Blueprint was found inside a dead star, its diagrams showing weapons that bend the laws of physics.',
    emoji: '📜', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'md_art_heart_shard', name: 'Heart of the Mountain Shard',
    description: 'A fragment of the mountain\'s living heart, pulsing with the forge\'s original creation energy.',
    lore: 'The Heart Shard contains the memory of the First Shadow Smith\'s first hammer strike, resonating with every blow.',
    emoji: '💎', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'md_art_eternal_anvil', name: 'Eternal Anvil Fragment',
    description: 'A piece of the Anvil of Shadows itself, containing the essence of the forge\'s founding act.',
    lore: 'The Eternal Anvil Fragment is the most powerful artifact in existence — it can forge weapons from concepts, not just materials.',
    emoji: '❤️‍🔥', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: MD_EVENTS — 8 Random Forge Events
// ============================================================

const MD_EVENTS: MdEventDef[] = [
  {
    id: 'md_evt_shadowquake', name: 'Shadowquake',
    description: 'A tremor of pure shadow energy shakes the forge, destabilizing chambers but revealing hidden veins.',
    lore: 'Shadowquakes occur when the Dragon of the Eternal Night shifts in its sleep, sending shockwaves through every shadow.',
    emoji: '🌋', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'shadow_dust', rewardMaterialCount: 5,
  },
  {
    id: 'md_evt_starfall', name: 'Starfall',
    description: 'A shower of star fragments rains through the mountain\'s vents, filling the forge with cosmic light.',
    lore: 'Starfalls are celebrated by the forge\'s inhabitants as the Starlight Elementals dance through the falling debris.',
    emoji: '🌠', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'star_fragment', rewardMaterialCount: 5,
  },
  {
    id: 'md_evt_ember_eruption', name: 'Ember Eruption',
    description: 'The Ember Pits surge with renewed intensity, flooding lower chambers with superheated air.',
    lore: 'Ember Eruptions are harnessed by clever smiths to super-charge their forging for a limited time.',
    emoji: '🔥', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'ember_slag', rewardMaterialCount: 6,
  },
  {
    id: 'md_evt_void_breach', name: 'Void Breach',
    description: 'A rift to the void opens in the quarry, releasing strange materials from beyond reality.',
    lore: 'Void Breaches are both terrifying and valuable — the materials that emerge cannot be found anywhere in the known universe.',
    emoji: '🌀', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'void_ember', rewardMaterialCount: 4,
  },
  {
    id: 'md_evt_moonlight_flood', name: 'Moonlight Flood',
    description: 'The Moonlight Sanctum overflows with captured moonlight, illuminating every corner of the forge.',
    lore: 'Moonlight Floods purify the forge, temporarily weakening all shadow creatures and strengthening starlight beings.',
    emoji: '🌕', effectType: 'buff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'moonlight_crystal', rewardMaterialCount: 3,
  },
  {
    id: 'md_evt_dragon_dream', name: 'Dragon\'s Dream',
    description: 'The Dragon of the Eternal Night dreams, causing reality to warp and shift within the mountain.',
    lore: 'Dragon\'s Dreams can last for hours or seconds depending on the Dragon\'s mood, reshaping chambers unpredictably.',
    emoji: '🐉', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'dragon_scale', rewardMaterialCount: 1,
  },
  {
    id: 'md_evt_shadow_storm', name: 'Shadow Storm',
    description: 'A hurricane of living shadow sweeps through the forge, buffeting everything with darkness.',
    lore: 'Shadow Storms are caused by the Voidweb Queen spinning new webs, the resulting vibrations creating wind from nothing.',
    emoji: '🌪️', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'shadow_dust', rewardMaterialCount: 8,
  },
  {
    id: 'md_evt_primordial_pulse', name: 'Primordial Pulse',
    description: 'The Heart of the Mountain releases a pulse of creation energy, supercharging all forge operations.',
    lore: 'Primordial Pulses are the heartbeat of the mountain made manifest, each one a reminder of the forge\'s cosmic origin.',
    emoji: '💫', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'primordial_core', rewardMaterialCount: 1,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function mdGenerateInstanceId(): string {
  return `md_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function mdPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function mdCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function mdCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useMidnightForge() {
  // ---- Core State ----
  const [mdLevel, setMdLevel] = useState(1);
  const [mdXp, setMdXp] = useState(MD_STARTING_XP);
  const [mdCoins, setMdCoins] = useState(MD_STARTING_COINS);
  const [mdTotalXp, setMdTotalXp] = useState(0);
  const [mdTotalCoins, setMdTotalCoins] = useState(0);

  // ---- Collection State ----
  const [mdForged, setMdForged] = useState<MdOwnedCreature[]>([]);
  const [mdInventory, setMdInventory] = useState<MdInventoryItem[]>([]);
  const [mdStructures, setMdStructures] = useState<MdStructureRecord[]>([]);
  const [mdArtifacts, setMdArtifacts] = useState<MdArtifactRecord[]>([]);
  const [mdAbilities, setMdAbilities] = useState<MdAbilityRecord[]>([]);
  const [mdAchievements, setMdAchievements] = useState<MdAchievementRecord[]>([]);
  const [mdChambers, setMdChambers] = useState<MdChamberRecord[]>([]);
  const [mdEventLog, setMdEventLog] = useState<MdEventLogEntry[]>([]);
  const [mdActiveEvent, setMdActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [mdCurrentTitle, setMdCurrentTitle] = useState('md_title_apprentice');

  // ---- Stats State ----
  const [mdStats, setMdStats] = useState<MdStats>({
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
    mdLevel, mdXp, mdTotalXp, mdTotalCoins, mdForged, mdInventory,
    mdStructures, mdArtifacts, mdAbilities, mdAchievements,
    mdChambers, mdEventLog, mdActiveEvent, mdCurrentTitle, mdStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      mdLevel, mdXp, mdTotalXp, mdTotalCoins, mdForged, mdInventory,
      mdStructures, mdArtifacts, mdAbilities, mdAchievements,
      mdChambers, mdEventLog, mdActiveEvent, mdCurrentTitle, mdStats,
    };
  }, [mdLevel, mdXp, mdTotalXp, mdTotalCoins, mdForged, mdInventory,
    mdStructures, mdArtifacts, mdAbilities, mdAchievements,
    mdChambers, mdEventLog, mdActiveEvent, mdCurrentTitle, mdStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(MD_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.mdLevel) setMdLevel(data.mdLevel);
        if (data.mdXp) setMdXp(data.mdXp);
        if (data.mdCoins) setMdCoins(data.mdCoins);
        if (data.mdTotalXp) setMdTotalXp(data.mdTotalXp);
        if (data.mdTotalCoins) setMdTotalCoins(data.mdTotalCoins);
        if (data.mdForged) setMdForged(data.mdForged);
        if (data.mdInventory) setMdInventory(data.mdInventory);
        if (data.mdStructures) setMdStructures(data.mdStructures);
        if (data.mdArtifacts) setMdArtifacts(data.mdArtifacts);
        if (data.mdAbilities) setMdAbilities(data.mdAbilities);
        if (data.mdAchievements) setMdAchievements(data.mdAchievements);
        if (data.mdChambers) setMdChambers(data.mdChambers);
        if (data.mdEventLog) setMdEventLog(data.mdEventLog);
        if (data.mdActiveEvent) setMdActiveEvent(data.mdActiveEvent);
        if (data.mdCurrentTitle) setMdCurrentTitle(data.mdCurrentTitle);
        if (data.mdStats) setMdStats(data.mdStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setMdChambers(
      MD_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setMdAbilities(
      MD_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setMdAchievements(
      MD_ACHIEVEMENTS.map((a) => ({
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
          mdLevel, mdXp, mdCoins, mdTotalXp, mdTotalCoins,
          mdForged, mdInventory, mdStructures, mdArtifacts,
          mdAbilities, mdAchievements, mdChambers, mdEventLog,
          mdActiveEvent, mdCurrentTitle, mdStats,
        };
        localStorage.setItem(MD_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, MD_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [mdLevel, mdXp, mdCoins, mdTotalXp, mdTotalCoins,
    mdForged, mdInventory, mdStructures, mdArtifacts,
    mdAbilities, mdAchievements, mdChambers, mdEventLog,
    mdActiveEvent, mdCurrentTitle, mdStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!mdActiveEvent) return;
    const evt = MD_EVENTS.find((e) => e.id === mdActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setMdActiveEvent(null);
      setMdEventLog((prev) =>
        prev.map((e) => (e.eventId === mdActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [mdActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...MD_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => mdLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === mdCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setMdCurrentTitle(nextTitle.id);
    }
  }, [mdLevel, mdCurrentTitle]);

  // ============================================================
  // COMPUTED: mdMaxXp
  // ============================================================

  const mdMaxXp = useMemo(() => {
    return Math.floor(MD_XP_BASE * Math.pow(mdLevel + 1, MD_XP_SCALE));
  }, [mdLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(MD_XP_BASE * Math.pow(lvl, MD_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(mdLevel + 1);
    return Math.max(0, needed - mdXp);
  }, [mdLevel, mdXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(mdLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((mdXp / needed) * 100), 100);
  }, [mdLevel, mdXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): MdCreatureDef | undefined => {
    return MD_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): MdChamberDef | undefined => {
    return MD_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): MdMaterialDef | undefined => {
    return MD_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): MdStructureDef | undefined => {
    return MD_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): MdAbilityDef | undefined => {
    return MD_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): MdArtifactDef | undefined => {
    return MD_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): MdAchievementDef | undefined => {
    return MD_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): MdTitleDef | undefined => {
    return MD_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): MdEventDef | undefined => {
    return MD_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: MdRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: MdRarity): string => {
    return MD_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: MdSpecies): string => {
    return MD_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: forgeWeapon
  // ============================================================

  const forgeWeapon = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (mdCoins < def.cost) return false;
    if (mdForged.length >= MD_MAX_OWNED_CREATURES) return false;

    const newCreature: MdOwnedCreature = {
      creatureId: def.id,
      instanceId: mdGenerateInstanceId(),
      forgedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setMdCoins((prev) => prev - def.cost);
    setMdForged((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = mdCalculateLevelUp(
      xpForLevel(mdLevel + 1),
      mdXp,
      xpGained,
      setMdLevel,
    );
    setMdXp(overflow);
    setMdTotalXp((prev) => prev + xpGained);
    setMdTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setMdStats((prev) => ({ ...prev, totalForged: prev.totalForged + 1 }));
    return true;
  }, [mdCoins, mdLevel, mdXp, mdForged.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreChamber
  // ============================================================

  const exploreChamber = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (mdLevel < def.unlockLevel) return false;

    setMdChambers((prev) =>
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

    const bonusMat = mdPickRandom(def.resources);
    if (bonusMat) {
      setMdInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, MD_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setMdTotalXp((prev) => prev + 15);
    setMdTotalCoins((prev) => prev + 5);
    setMdStats((prev) => ({ ...prev, totalExplored: prev.totalExplored + 1 }));
    return true;
  }, [mdLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = mdStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = mdCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (mdCoins < cost) return false;

    setMdCoins((prev) => prev - cost);
    setMdStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setMdTotalXp((prev) => prev + 20);
    setMdStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [mdCoins, mdStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (mdCoins < def.cost) return false;
    if (mdArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setMdCoins((prev) => prev - def.cost);
    setMdArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setMdTotalXp((prev) => prev + 100);
    setMdStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [mdCoins, mdArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerForgeEvent
  // ============================================================

  const triggerForgeEvent = useCallback((): MdEventDef | null => {
    if (mdActiveEvent) return null;
    const event = mdPickRandom(MD_EVENTS);
    setMdActiveEvent(event.id);
    setMdEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setMdTotalXp((prev) => prev + event.rewardXp);
    setMdCoins((prev) => prev + event.rewardCoins);
    setMdTotalCoins((prev) => prev + event.rewardCoins);

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setMdInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, MD_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    return event;
  }, [mdActiveEvent]);

  // ============================================================
  // CORE ACTION: resetMidnightForge
  // ============================================================

  const resetMidnightForge = useCallback(() => {
    setMdLevel(1);
    setMdXp(0);
    setMdCoins(MD_STARTING_COINS);
    setMdTotalXp(0);
    setMdTotalCoins(0);
    setMdForged([]);
    setMdInventory([]);
    setMdStructures([]);
    setMdArtifacts([]);
    setMdAbilities(
      MD_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setMdAchievements(
      MD_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setMdChambers(
      MD_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setMdEventLog([]);
    setMdActiveEvent(null);
    setMdCurrentTitle('md_title_apprentice');
    setMdStats({
      totalForged: 0, totalExplored: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(MD_SAVE_KEY); } catch { /* silent */ }
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
    setMdStats((currentStats) => {
      setMdAchievements((prev) => {
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
            setMdTotalXp((xp) => xp + def.rewardXp);
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
    const record = mdAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setMdAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setMdTotalXp((prev) => prev + 5);
    return true;
  }, [mdAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const mdTitleProgress = useMemo((): MdTitleProgress => {
    const sorted = [...MD_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === mdCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === mdCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((mdLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [mdLevel, mdCurrentTitle]);

  const currentTitleInfo = useMemo(() => mdTitleProgress.current, [mdTitleProgress]);

  const nextTitleInfo = useMemo(() => mdTitleProgress.next, [mdTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesForged: mdForged.length,
    chambersExplored: mdChambers.filter((c) => c.discovered).length,
    structuresBuilt: mdStructures.length,
    artifactsActive: mdArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: mdAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: mdAbilities.filter((a) => a.unlocked).length,
    totalXp: mdTotalXp,
    totalCoins: mdTotalCoins,
    currentLevel: mdLevel,
    ownedSpeciesCount: new Set(mdForged.map((f) => {
      const d = MD_CREATURES.find((c) => c.id === f.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: mdEventLog.length,
  }), [mdForged, mdChambers, mdStructures, mdArtifacts,
    mdAchievements, mdAbilities, mdTotalXp, mdTotalCoins, mdLevel, mdEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      MD_CREATURES.length +
      MD_CHAMBERS.length +
      MD_STRUCTURES.length +
      MD_ARTIFACTS.length +
      MD_ACHIEVEMENTS.length +
      MD_ABILITIES.length;
    const completed =
      mdForged.length +
      mdChambers.filter((c) => c.discovered).length +
      mdStructures.length +
      mdArtifacts.filter((a) => a.activated).length +
      mdAchievements.filter((a) => a.unlocked).length +
      mdAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((mdForged.length / MD_CREATURES.length) * 100),
      chamberPercent: Math.round((mdChambers.filter((c) => c.discovered).length / MD_CHAMBERS.length) * 100),
      structurePercent: Math.round((mdStructures.length / MD_STRUCTURES.length) * 100),
      artifactPercent: Math.round((mdArtifacts.filter((a) => a.activated).length / MD_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((mdAchievements.filter((a) => a.unlocked).length / MD_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((mdAbilities.filter((a) => a.unlocked).length / MD_ABILITIES.length) * 100),
    };
  }, [mdForged, mdChambers, mdStructures, mdArtifacts, mdAchievements, mdAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    mdForged.map((f) => ({
      ...f,
      def: getCreatureDef(f.creatureId),
    })),
  [mdForged, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    mdChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [mdChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    mdStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: mdCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: mdCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [mdStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    mdInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [mdInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    mdArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [mdArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    mdAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [mdAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, MdOwnedCreature[]> = {};
    for (const species of MD_SPECIES) {
      result[species.id] = mdForged.filter((f) => {
        const def = getCreatureDef(f.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [mdForged, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: MdRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, MdOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = mdForged.filter((f) => {
        const def = getCreatureDef(f.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [mdForged, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return MD_CREATURES.filter((c) => c.cost <= mdCoins);
  }, [mdCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalForged: mdStats.totalForged,
      totalExplored: mdStats.totalExplored,
      totalStructuresBuilt: mdStats.totalStructuresBuilt,
      totalArtifacts: mdStats.totalArtifacts,
      totalEvents: mdStats.totalEvents,
      totalCoins: mdStats.totalCoins,
      totalXp: mdStats.totalXp,
    };
    return MD_ACHIEVEMENTS.filter(
      (a) =>
        !mdAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [mdStats, mdAchievements]);

  const recentEventLog = useMemo(() => {
    return [...mdEventLog].reverse().slice(0, 10);
  }, [mdEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...mdForged]
      .map((f) => ({ ...f, def: getCreatureDef(f.creatureId) }))
      .filter((f) => f.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [mdForged, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of mdForged) {
      const def = getCreatureDef(f.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [mdForged, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of mdChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [mdChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of mdStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [mdStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of mdAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [mdAbilities]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    MD_SHADOW_BLACK,
    MD_DARKSTEEL,
    MD_MOONLIGHT,
    MD_EMBER,
    MD_STAR_GOLD,
    MD_VOID_BLUE,
    MD_CRIMSON_GLOW,
    MD_RARITY_COLORS,
    MD_SPECIES_COLORS,
    MD_ALL_COLORS,

    // ---- Data Constants ----
    MD_SPECIES,
    MD_CREATURES,
    MD_CHAMBERS,
    MD_MATERIALS,
    MD_STRUCTURES,
    MD_ABILITIES,
    MD_ACHIEVEMENTS,
    MD_TITLES,
    MD_ARTIFACTS,
    MD_EVENTS,
    MD_MAX_LEVEL,
    MD_SAVE_KEY,
    MD_XP_BASE,
    MD_XP_SCALE,

    // ---- State ----
    mdLevel,
    mdXp,
    mdMaxXp,
    mdCoins,
    mdTotalXp,
    mdTotalCoins,
    mdForged,
    mdInventory,
    mdStructures,
    mdArtifacts,
    mdAbilities,
    mdAchievements,
    mdChambers,
    mdEventLog,
    mdActiveEvent,
    mdCurrentTitle,
    mdStats,

    // ---- Core Actions ----
    forgeWeapon,
    exploreChamber,
    buildStructure,
    activateArtifact,
    triggerForgeEvent,
    resetMidnightForge,

    // ---- Extended Actions ----
    discoverChamber,
    checkAndClaimAchievements,
    useAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    mdTitleProgress,

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
