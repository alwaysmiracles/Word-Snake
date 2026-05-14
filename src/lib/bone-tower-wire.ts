import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Bone Tower (白骨塔) — Wire Module
//
// A grim skeletal tower rising from a cursed battlefield, where
// necromancers command bone golems, harvest soul fragments, and
// unravel dark mysteries across ascending tower floors.
// Players raise undead creatures, ascend tower floors, collect
// bone materials, build necro structures, discover cursed artifacts,
// face random tower events, and ascend through 8 titles.
//
// Storage key: bone-tower-save
// Prefix: bo / BO_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type BoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type BoSpecies =
  | 'bone_golem'
  | 'skeleton_knight'
  | 'wraith_lord'
  | 'flesh_crawler'
  | 'skull_archer'
  | 'death_moth'
  | 'marrow_worm';

type BoAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type BoStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus'
  | 'soulYield';

type BoMaterialCategory = 'bone' | 'flesh' | 'soul' | 'organic' | 'mineral' | 'shadow' | 'cursed';

// ---- Creature Definitions ----

interface BoCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: BoSpecies;
  readonly rarity: BoRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface BoChamberDef {
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

interface BoMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: BoRarity;
  readonly value: number;
  readonly category: BoMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface BoStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: BoStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface BoAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: BoAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: BoRarity;
}

// ---- Achievement Definitions ----

interface BoAchievementDef {
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

interface BoTitleDef {
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

interface BoArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: BoRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface BoEventDef {
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

interface BoOwnedCreature {
  creatureId: string;
  instanceId: string;
  raisedAt: number;
  timesUsed: number;
  nickname: string;
}

interface BoChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface BoStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface BoArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface BoAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface BoAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface BoInventoryItem {
  materialId: string;
  count: number;
}

interface BoEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface BoStats {
  totalRaised: number;
  totalFloorsCleared: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface BoTitleProgress {
  current: BoTitleDef;
  next: BoTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: BO_ CONSTANTS
// ============================================================

const BO_SAVE_KEY = 'bone-tower-save';
const BO_MAX_LEVEL = 50;
const BO_STARTING_COINS = 300;
const BO_STARTING_XP = 0;
const BO_XP_BASE = 100;
const BO_XP_SCALE = 1.5;
const BO_AUTO_SAVE_MS = 15000;
const BO_EVENT_DURATION_MS = 60000;
const BO_MAX_INVENTORY_ITEM = 999;
const BO_MAX_RAISED_CREATURES = 100;
const BO_COOLDOWN_TICK_MS = 1000;
const BO_SPECIES_COUNT = 7;
const BO_CREATURE_COUNT = 35;
const BO_CHAMBER_COUNT = 8;
const BO_MATERIAL_COUNT = 12;
const BO_STRUCTURE_COUNT = 8;
const BO_ABILITY_COUNT = 8;
const BO_ACHIEVEMENT_COUNT = 10;
const BO_TITLE_COUNT = 8;
const BO_ARTIFACT_COUNT = 6;
const BO_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const BO_BONE_WHITE = '#F5F5DC';
const BO_BLOOD_RED = '#8B0000';
const BO_SHADOW_PURPLE = '#4A0E4E';
const BO_SOUL_GREEN = '#00FF7F';
const BO_DARK_IRON = '#333333';
const BO_CURSED_GOLD = '#B8860B';
const BO_ASH_GRAY = '#808080';

const BO_RARITY_COLORS: Record<BoRarity, string> = {
  common: BO_ASH_GRAY,
  uncommon: BO_SOUL_GREEN,
  rare: BO_SHADOW_PURPLE,
  epic: BO_BLOOD_RED,
  legendary: BO_CURSED_GOLD,
};

const BO_SPECIES_COLORS: Record<BoSpecies, string> = {
  bone_golem: BO_BONE_WHITE,
  skeleton_knight: BO_ASH_GRAY,
  wraith_lord: BO_SHADOW_PURPLE,
  flesh_crawler: BO_BLOOD_RED,
  skull_archer: BO_DARK_IRON,
  death_moth: '#1A1A2E',
  marrow_worm: '#C4A35A',
};

const BO_ALL_COLORS = [
  BO_BONE_WHITE,
  BO_BLOOD_RED,
  BO_SHADOW_PURPLE,
  BO_SOUL_GREEN,
  BO_DARK_IRON,
  BO_CURSED_GOLD,
  BO_ASH_GRAY,
];

// ============================================================
// SECTION 4: BO_SPECIES — 7 Species Types
// ============================================================

const BO_SPECIES: { id: BoSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'bone_golem',
    name: 'Bone Golem',
    description: 'Massive constructs of fused skeletal remains, animated by raw necromantic will.',
    lore: 'Bone Golems were first created by the Necrolord Ashen during the Siege of Seven Graves, stitching together the fallen of every army.',
    emoji: '🦴',
    color: BO_BONE_WHITE,
  },
  {
    id: 'skeleton_knight',
    name: 'Skeleton Knight',
    description: 'Undead warriors clad in rusted armor, wielding cursed blades that thirst for battle.',
    lore: 'Skeleton Knights remember fragments of their former lives, fighting with a desperate fury born from unresolved regrets.',
    emoji: '⚔️',
    color: BO_ASH_GRAY,
  },
  {
    id: 'wraith_lord',
    name: 'Wraith Lord',
    description: 'Ethereal specters of immense power, commanding legions of lesser phantoms.',
    lore: 'Wraith Lords were once powerful sorcerers who traded their physical forms for eternal spectral existence within the tower.',
    emoji: '👻',
    color: BO_SHADOW_PURPLE,
  },
  {
    id: 'flesh_crawler',
    name: 'Flesh Crawler',
    description: 'Aberrant amalgamations of reanimated tissue that skitter across tower walls and ceilings.',
    lore: 'Flesh Crawlers are the failed experiments of the Flesh Architect, discarded in the lower pits but thriving in the darkness.',
    emoji: '🪱',
    color: BO_BLOOD_RED,
  },
  {
    id: 'skull_archer',
    name: 'Skull Archer',
    description: 'Floating skulls that launch bone-tipped arrows with supernatural precision.',
    lore: 'Skull Archers are the sentries of the tower, their empty eye sockets burning with necromantic targeting runes.',
    emoji: '💀',
    color: BO_DARK_IRON,
  },
  {
    id: 'death_moth',
    name: 'Death Moth',
    description: 'Eerie moths with skull-patterned wings that drain the life force of those they land upon.',
    lore: 'Death Moths are drawn to the scent of dying souls, their dust carrying memories of everyone they have ever claimed.',
    emoji: '🦋',
    color: '#1A1A2E',
  },
  {
    id: 'marrow_worm',
    name: 'Marrow Worm',
    description: 'Skeletal serpents that burrow through bones and stone, consuming marrow for sustenance.',
    lore: 'Marrow Worms are the oldest inhabitants of the Bone Tower, predating even the Necrolords who built it.',
    emoji: '🐍',
    color: '#C4A35A',
  },
];

// ============================================================
// SECTION 5: BO_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const BO_CREATURES: BoCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'bone_golem_common', name: 'Bone Shard', species: 'bone_golem', rarity: 'common',
    description: 'A small assembly of finger bones held together by flickering dark energy.',
    lore: 'Bone Shards are the simplest constructs, requiring only a handful of bones and a whisper of necromantic intent.',
    emoji: '🦴', power: 10, defense: 12, cost: 20, xpReward: 8,
  },
  {
    id: 'skeleton_knight_common', name: 'Rattle Guard', species: 'skeleton_knight', rarity: 'common',
    description: 'A basic skeleton warrior armed with a rusty sword and a chipped shield.',
    lore: 'Rattle Guards get their name from the distinctive rattling sound they make when marching in formation.',
    emoji: '⚔️', power: 8, defense: 7, cost: 18, xpReward: 7,
  },
  {
    id: 'wraith_lord_common', name: 'Faint Wisp', species: 'wraith_lord', rarity: 'common',
    description: 'A barely visible ghostly presence that flickers like a dying candle.',
    lore: 'Faint Wisps are the remnants of recently deceased souls not yet claimed by the tower.',
    emoji: '👻', power: 7, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'flesh_crawler_common', name: 'Gore Grub', species: 'flesh_crawler', rarity: 'common',
    description: 'A small mass of animated tissue that oozes across surfaces leaving a trail of slime.',
    lore: 'Gore Grubs are used by the Flesh Architect as living adhesive, their secret bonding dead tissue together.',
    emoji: '🪱', power: 6, defense: 8, cost: 16, xpReward: 6,
  },
  {
    id: 'skull_archer_common', name: 'Tooth Slinger', species: 'skull_archer', rarity: 'common',
    description: 'A tiny floating skull that spits sharpened teeth at its targets.',
    lore: 'Tooth Slingers are the alarm system of the lower floors, alerting other creatures to intruders.',
    emoji: '💀', power: 9, defense: 5, cost: 15, xpReward: 6,
  },
  {
    id: 'death_moth_common', name: 'Ash Flutter', species: 'death_moth', rarity: 'common',
    description: 'A small gray moth whose wings bear a faint skull-like pattern.',
    lore: 'Ash Flutters feed on the residual despair that clings to the tower walls like cobwebs.',
    emoji: '🦋', power: 7, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'marrow_worm_common', name: 'Bone Tick', species: 'marrow_worm', rarity: 'common',
    description: 'A tiny segmented worm that gnaws on bone fragments with razor-sharp mandibles.',
    lore: 'Bone Ticks are essential for preparing skeletons — they clean marrow from bones, making them lighter and stronger.',
    emoji: '🐍', power: 8, defense: 7, cost: 17, xpReward: 7,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'bone_golem_uncommon', name: 'Rib Cage Sentinel', species: 'bone_golem', rarity: 'uncommon',
    description: 'A humanoid construct built from rib cages and femurs, surprisingly agile.',
    lore: 'Rib Cage Sentinels house lesser spirits within their hollow frames, giving them rudimentary intelligence.',
    emoji: '🦴', power: 22, defense: 25, cost: 60, xpReward: 20,
  },
  {
    id: 'skeleton_knight_uncommon', name: 'Cursed Footman', species: 'skeleton_knight', rarity: 'uncommon',
    description: 'A skeleton warrior bearing a weapon still crackling with dark enchantments.',
    lore: 'Cursed Footmen are former soldiers whose weapons absorbed the death curses of their last battle.',
    emoji: '⚔️', power: 24, defense: 18, cost: 55, xpReward: 18,
  },
  {
    id: 'wraith_lord_uncommon', name: 'Gloom Shade', species: 'wraith_lord', rarity: 'uncommon',
    description: 'A shadowy apparition that can phase through walls and drain warmth from the living.',
    lore: 'Gloom Shades are the collective grief of an entire battlefield, compressed into a single spectral entity.',
    emoji: '👻', power: 20, defense: 15, cost: 65, xpReward: 22,
  },
  {
    id: 'flesh_crawler_uncommon', name: 'Sinew Strider', species: 'flesh_crawler', rarity: 'uncommon',
    description: 'A four-legged flesh construct that stalks corridors with predatory patience.',
    lore: 'Sinew Striders were designed as tower guardians, their multiple legs allowing them to traverse any surface.',
    emoji: '🪱', power: 21, defense: 22, cost: 50, xpReward: 16,
  },
  {
    id: 'skull_archer_uncommon', name: 'Bone Crossbower', species: 'skull_archer', rarity: 'uncommon',
    description: 'A skull fitted with a bone crossbow that fires necromantically-guided bolts.',
    lore: 'Bone Crossbowers never miss their target — their bolts home in on the warmth of living flesh.',
    emoji: '💀', power: 23, defense: 14, cost: 58, xpReward: 19,
  },
  {
    id: 'death_moth_uncommon', name: 'Dust Veiler', species: 'death_moth', rarity: 'uncommon',
    description: 'A moth whose wing dust creates localized zones of suffocating darkness.',
    lore: 'Dust Veilers are deployed in swarms to blind intruders, their dust absorbing all light within a 30-foot radius.',
    emoji: '🦋', power: 19, defense: 16, cost: 55, xpReward: 18,
  },
  {
    id: 'marrow_worm_uncommon', name: 'Calcium Borer', species: 'marrow_worm', rarity: 'uncommon',
    description: 'A thick segmented worm that can chew through solid bone and stone.',
    lore: 'Calcium Borers created the tower\'s underground tunnel network over centuries of slow, patient excavation.',
    emoji: '🐍', power: 18, defense: 20, cost: 50, xpReward: 17,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'bone_golem_rare', name: 'Ossuary Titan', species: 'bone_golem', rarity: 'rare',
    description: 'A towering golem of thousands of fused bones, standing three stories tall.',
    lore: 'Ossuary Titans are assembled from the bones of entire armies, their joints lubricated with graveyard soil.',
    emoji: '🦴', power: 42, defense: 48, cost: 200, xpReward: 50,
  },
  {
    id: 'skeleton_knight_rare', name: 'Dread Cavalier', species: 'skeleton_knight', rarity: 'rare',
    description: 'An elite skeleton warrior in ornate black armor wielding a cursed greatsword.',
    lore: 'Dread Cavaliers were the personal guard of the last living king to enter the Bone Tower — none ever left.',
    emoji: '⚔️', power: 45, defense: 35, cost: 180, xpReward: 45,
  },
  {
    id: 'wraith_lord_rare', name: 'Phantom Sovereign', species: 'wraith_lord', rarity: 'rare',
    description: 'A powerful spectral lord surrounded by a permanent aura of freezing despair.',
    lore: 'Phantom Sovereigns command the loyalty of every lesser ghost within a mile of the Bone Tower.',
    emoji: '👻', power: 40, defense: 30, cost: 220, xpReward: 55,
  },
  {
    id: 'flesh_crawler_rare', name: 'Carrion Weaver', species: 'flesh_crawler', rarity: 'rare',
    description: 'A massive multi-armed flesh creature that weaves walls of animated sinew.',
    lore: 'Carrion Weavers created the bone bridges connecting the tower\'s upper floors, spinning sinew like a grotesque spider.',
    emoji: '🪱', power: 35, defense: 40, cost: 190, xpReward: 48,
  },
  {
    id: 'skull_archer_rare', name: 'Deathmark Sniper', species: 'skull_archer', rarity: 'rare',
    description: 'A skull that fires bolts capable of piercing three targets simultaneously.',
    lore: 'Deathmark Snipers are decorated with the eye sockets of every target they have eliminated — dozens cover their surface.',
    emoji: '💀', power: 48, defense: 25, cost: 200, xpReward: 52,
  },
  {
    id: 'death_moth_rare', name: 'Soul Harvester', species: 'death_moth', rarity: 'rare',
    description: 'A large moth with wings that shimmer with trapped soul fragments.',
    lore: 'Soul Harvesters carry fragments of every soul they have touched, creating a mesmerizing spectral display in flight.',
    emoji: '🦋', power: 38, defense: 32, cost: 195, xpReward: 49,
  },
  {
    id: 'marrow_worm_rare', name: 'Grave Dredge', species: 'marrow_worm', rarity: 'rare',
    description: 'A massive burrowing worm that surfaces beneath enemies to swallow them whole.',
    lore: 'Grave Dredges are the reason the Bone Tower has no basement — they ate it, and the floor beneath, and the floor beneath that.',
    emoji: '🐍', power: 37, defense: 38, cost: 200, xpReward: 50,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'bone_golem_epic', name: 'Colossus of Remains', species: 'bone_golem', rarity: 'epic',
    description: 'A mountain-sized golem incorporating the skeletons of dragons, giants, and forgotten beasts.',
    lore: 'The Colossus of Remains is the Bone Tower made mobile — within its frame lie the bones of every creature that ever died within its walls.',
    emoji: '🦴', power: 75, defense: 85, cost: 800, xpReward: 120,
  },
  {
    id: 'skeleton_knight_epic', name: 'Lich Marshal', species: 'skeleton_knight', rarity: 'epic',
    description: 'An undead general whose strategic brilliance has only sharpened with centuries of undeath.',
    lore: 'Lich Marshals command entire skeletal armies through telepathic links embedded in their enchanted helmets.',
    emoji: '⚔️', power: 80, defense: 60, cost: 750, xpReward: 110,
  },
  {
    id: 'wraith_lord_epic', name: 'Spectral Tyrant', species: 'wraith_lord', rarity: 'epic',
    description: 'An ancient wraith of devastating power whose mere presence causes the living to age decades.',
    lore: 'Spectral Tyrants have existed since before the tower was built, drawn to the cursed ground by an irresistible hunger.',
    emoji: '👻', power: 85, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'flesh_crawler_epic', name: 'Abomination Core', species: 'flesh_crawler', rarity: 'epic',
    description: 'A grotesque hive-mind of countless flesh creatures merged into a single terrifying entity.',
    lore: 'The Abomination Core is the Flesh Architect\'s masterpiece — a living weapon that adapts to any threat by reshaping itself.',
    emoji: '🪱', power: 65, defense: 70, cost: 780, xpReward: 115,
  },
  {
    id: 'skull_archer_epic', name: 'Skull Throne', species: 'skull_archer', rarity: 'epic',
    description: 'A floating fortress of interconnected skulls that rains death from above.',
    lore: 'The Skull Throne is both weapon and sentry post, its constituent skulls taking turns scanning for intruders and firing.',
    emoji: '💀', power: 82, defense: 55, cost: 780, xpReward: 115,
  },
  {
    id: 'death_moth_epic', name: 'Nightmare Flutter', species: 'death_moth', rarity: 'epic',
    description: 'A giant moth whose wings cast living nightmares into the minds of all who see them.',
    lore: 'Nightmare Flutters are the guardians of sleep within the tower, putting intruders into eternal tormented rest.',
    emoji: '🦋', power: 70, defense: 58, cost: 800, xpReward: 120,
  },
  {
    id: 'marrow_worm_epic', name: 'Chthonic Devourer', species: 'marrow_worm', rarity: 'epic',
    description: 'A primordial worm whose body extends through every floor of the Bone Tower.',
    lore: 'The Chthonic Devourer IS the foundation of the Bone Tower — the tower was built around it to contain its appetite.',
    emoji: '🐍', power: 72, defense: 65, cost: 820, xpReward: 125,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'bone_golem_legendary', name: 'Everlasting Ossuary', species: 'bone_golem', rarity: 'legendary',
    description: 'An immortal bone construct that has survived every siege, earthquake, and curse in history.',
    lore: 'The Everlasting Ossuary was the first thing created when death first touched the world — it cannot be destroyed, only contained.',
    emoji: '🦴', power: 130, defense: 150, cost: 3000, xpReward: 300,
  },
  {
    id: 'skeleton_knight_legendary', name: 'Deathless Sovereign', species: 'skeleton_knight', rarity: 'legendary',
    description: 'The supreme undead commander whose tactical genius transcends mortal comprehension.',
    lore: 'The Deathless Sovereign once conquered an entire kingdom using only seven skeleton soldiers and perfect strategy.',
    emoji: '⚔️', power: 140, defense: 110, cost: 2800, xpReward: 280,
  },
  {
    id: 'wraith_lord_legendary', name: 'Eidolon of the Abyss', species: 'wraith_lord', rarity: 'legendary',
    description: 'A being of pure negative energy that exists between life and death, commanding both.',
    lore: 'The Eidolon of the Abyss predates the concept of death itself — it is the reason souls are drawn to the Bone Tower.',
    emoji: '👻', power: 150, defense: 95, cost: 3200, xpReward: 320,
  },
  {
    id: 'flesh_crawler_legendary', name: 'Primordial Flesh', species: 'flesh_crawler', rarity: 'legendary',
    description: 'An ancient organism of living tissue that adapts to any form and absorbs any attack.',
    lore: 'The Primordial Flesh is the original source of all flesh constructs — every Flesh Crawler is merely a fragment of its body.',
    emoji: '🪱', power: 120, defense: 130, cost: 2900, xpReward: 290,
  },
  {
    id: 'skull_archer_legendary', name: 'Legion of Skulls', species: 'skull_archer', rarity: 'legendary',
    description: 'A thousand skulls fused into a single consciousness, each one an expert marksman.',
    lore: 'The Legion of Skulls can target a thousand different enemies simultaneously, each skull firing a bolt of pure death.',
    emoji: '💀', power: 145, defense: 100, cost: 3100, xpReward: 310,
  },
  {
    id: 'death_moth_legendary', name: 'Eclipse Moth', species: 'death_moth', rarity: 'legendary',
    description: 'A moth so vast it blots out the moon, whose wingspan covers entire battlefields.',
    lore: 'The Eclipse Moth appears only when the boundary between life and death thins — its shadow alone can stop an army.',
    emoji: '🦋', power: 125, defense: 115, cost: 2900, xpReward: 290,
  },
  {
    id: 'marrow_worm_legendary', name: 'World Serpent of Bone', species: 'marrow_worm', rarity: 'legendary',
    description: 'A worm of infinite length that circles the tower endlessly, devouring the earth itself.',
    lore: 'The World Serpent of Bone is the Bone Tower\'s true master — every bone in the tower was first passed through its gullet.',
    emoji: '🐍', power: 135, defense: 140, cost: 3500, xpReward: 350,
  },
];

// ============================================================
// SECTION 6: BO_CHAMBERS — 8 Tower Floors
// ============================================================

const BO_CHAMBERS: BoChamberDef[] = [
  {
    id: 'burial_ground', name: 'Burial Ground', emoji: '⚰️',
    description: 'The cursed soil at the tower base where fallen warriors are drawn by dark gravity.',
    lore: 'The Burial Ground was once a peaceful cemetery until the Bone Tower erupted from the earth, shattering every grave.',
    level: 1, resources: ['bone_fragment', 'grave_dust', 'withered_root'], capacity: 10,
    unlockLevel: 1, ambientColor: BO_ASH_GRAY, dangerLevel: 1,
  },
  {
    id: 'bone_hoard', name: 'Bone Hoard', emoji: '🦴',
    description: 'A vast ossuary where countless bones are sorted and stacked by unseen hands.',
    lore: 'The Bone Hoard supplies raw material for every construct in the tower, sorted by the Marrow Worms into perfect piles.',
    level: 3, resources: ['bone_fragment', 'marrow_extract', 'cursed_ash'], capacity: 15,
    unlockLevel: 3, ambientColor: BO_BONE_WHITE, dangerLevel: 2,
  },
  {
    id: 'flesh_pits', name: 'Flesh Pits', emoji: '🩸',
    description: 'Deep pits filled with bubbling organic matter where flesh constructs are grown.',
    lore: 'The Flesh Pits smell of copper and decay — the Flesh Architect considers this perfume.',
    level: 5, resources: ['sinew_strand', 'blood_ichor', 'withered_root'], capacity: 20,
    unlockLevel: 5, ambientColor: BO_BLOOD_RED, dangerLevel: 3,
  },
  {
    id: 'ghost_gallery', name: 'Ghost Gallery', emoji: '👻',
    description: 'A labyrinth of mirrors that trap the reflections of the dead, creating ghostly echoes.',
    lore: 'The Ghost Gallery was designed to confuse intruders, but its mirrors developed a hunger for living reflections.',
    level: 10, resources: ['soul_shard', 'spectral_dust', 'cursed_ash'], capacity: 25,
    unlockLevel: 10, ambientColor: BO_SHADOW_PURPLE, dangerLevel: 4,
  },
  {
    id: 'marrow_chamber', name: 'Marrow Chamber', emoji: '🫧',
    description: 'The warm heart of the tower where golden marrow flows like an underground river.',
    lore: 'Marrow is the lifeblood of the Bone Tower — it fuels every construct, every curse, every dark ritual.',
    level: 15, resources: ['marrow_extract', 'necro_crystal', 'golden_bone'], capacity: 30,
    unlockLevel: 15, ambientColor: '#C4A35A', dangerLevel: 5,
  },
  {
    id: 'siege_armory', name: 'Siege Armory', emoji: '⚔️',
    description: 'An armory of cursed weapons and armor forged from the bones of legendary warriors.',
    lore: 'Every weapon in the Siege Armory remembers the last hand that wielded it, and hungers for new blood.',
    level: 20, resources: ['cursed_ash', 'spectral_dust', 'golden_bone'], capacity: 35,
    unlockLevel: 20, ambientColor: BO_DARK_IRON, dangerLevel: 6,
  },
  {
    id: 'throne_of_bones', name: 'Throne of Bones', emoji: '👑',
    description: 'A massive throne carved from the spine of a colossal beast, radiating dark authority.',
    lore: 'Whoever sits upon the Throne of Bones gains dominion over every creature in the tower — but at a terrible price.',
    level: 30, resources: ['soul_shard', 'necro_crystal', 'dragon_bone'], capacity: 40,
    unlockLevel: 30, ambientColor: BO_CURSED_GOLD, dangerLevel: 8,
  },
  {
    id: 'nexus_of_death', name: 'Nexus of Death', emoji: '💀',
    description: 'The apex of the Bone Tower where death itself can be commanded and redirected.',
    lore: 'The Nexus of Death is a hole in reality through which raw death energy pours, sustaining the tower forever.',
    level: 40, resources: ['dragon_bone', 'necro_crystal', 'soul_shard'], capacity: 50,
    unlockLevel: 40, ambientColor: '#1A1A2E', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: BO_MATERIALS — 12 Materials
// ============================================================

const BO_MATERIALS: BoMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'bone_fragment', name: 'Bone Fragment', emoji: '🦴', rarity: 'common', value: 5,
    category: 'bone', craftBonus: 1,
    description: 'A shard of ordinary bone, still carrying faint traces of necromantic residue.',
    lore: 'Bone Fragments are the most common material in the Bone Tower, found in every room and corridor.',
  },
  {
    id: 'grave_dust', name: 'Grave Dust', emoji: '🌫️', rarity: 'common', value: 4,
    category: 'shadow', craftBonus: 1,
    description: 'Fine gray dust gathered from the burial grounds, smelling of damp earth and old sorrow.',
    lore: 'Grave Dust is essential for basic necromantic rituals — it carries the memory of the dead.',
  },
  {
    id: 'withered_root', name: 'Withered Root', emoji: '🌿', rarity: 'common', value: 5,
    category: 'organic', craftBonus: 2,
    description: 'Dead roots from the cursed plants growing in the tower shadow, brittle but potent.',
    lore: 'Withered Roots are paradoxically more powerful alive — their death releases concentrated life energy.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'cursed_ash', name: 'Cursed Ash', emoji: '🔥', rarity: 'uncommon', value: 15,
    category: 'cursed', craftBonus: 3,
    description: 'Ash from burned cursed objects, still crackling with unstable dark energy.',
    lore: 'Cursed Ash is what remains when a curse is burned — the curse is not destroyed, only transformed.',
  },
  {
    id: 'sinew_strand', name: 'Sinew Strand', emoji: '🧵', rarity: 'uncommon', value: 12,
    category: 'flesh', craftBonus: 2,
    description: 'Tough strands of dried tendon used to bind bone constructs together.',
    lore: 'Sinew Strands from different species have different properties — giant sinew is strongest, human sinew is most flexible.',
  },
  {
    id: 'marrow_extract', name: 'Marrow Extract', emoji: '🫧', rarity: 'uncommon', value: 14,
    category: 'bone', craftBonus: 3,
    description: 'A golden syrup extracted from fresh bones, rich with concentrated necromantic power.',
    lore: 'Marrow Extract tastes like honey and death — necromancers consider it a delicacy.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'soul_shard', name: 'Soul Shard', emoji: '💎', rarity: 'rare', value: 50,
    category: 'soul', craftBonus: 6,
    description: 'A crystallized fragment of a trapped soul, glowing with inner emotional turmoil.',
    lore: 'Soul Shards are harvested from the Ghost Gallery mirrors, each one containing the final memory of its owner.',
  },
  {
    id: 'blood_ichor', name: 'Blood Ichor', emoji: '🩸', rarity: 'rare', value: 55,
    category: 'flesh', craftBonus: 7,
    description: 'Thick black blood from the Flesh Pits that moves on its own and whispers dark secrets.',
    lore: 'Blood Ichor is technically alive — it responds to the emotions of whoever handles it.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'spectral_dust', name: 'Spectral Dust', emoji: '✨', rarity: 'epic', value: 150,
    category: 'shadow', craftBonus: 12,
    description: 'Dust from the disintegrated form of a powerful wraith, shimmering with spectral light.',
    lore: 'Spectral Dust can make objects temporarily intangible — the military applications are terrifying.',
  },
  {
    id: 'necro_crystal', name: 'Necro Crystal', emoji: '🔮', rarity: 'epic', value: 160,
    category: 'mineral', craftBonus: 13,
    description: 'A dark crystal that absorbs life energy from nearby living creatures passively.',
    lore: 'Necro Crystals grow in the deepest chambers of the tower, fed by the constant stream of dying souls.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'dragon_bone', name: 'Dragon Bone', emoji: '🐉', rarity: 'legendary', value: 600,
    category: 'bone', craftBonus: 25,
    description: 'A bone from an ancient dragon, still radiating primordial draconic power.',
    lore: 'Dragon Bones are the rarest material in the Bone Tower — only three dragons have ever fallen within its walls.',
  },
  {
    id: 'golden_bone', name: 'Golden Bone', emoji: '⭐', rarity: 'legendary', value: 700,
    category: 'cursed', craftBonus: 28,
    description: 'A bone transmuted to pure gold by concentrated necromantic energy over centuries.',
    lore: 'Golden Bones are said to be the petrified fingers of the first necromancer, still twitching occasionally.',
  },
];

// ============================================================
// SECTION 8: BO_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const BO_STRUCTURES: BoStructureDef[] = [
  {
    id: 'bone_forge', name: 'Bone Forge', emoji: '🔨',
    description: 'A forge that reshapes bone and metal into weapons and construct components.',
    lore: 'The Bone Forge burns with cold blue necromantic fire that melts bone without destroying its structural properties.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'marrow_vat', name: 'Marrow Vat', emoji: '🫧',
    description: 'A bubbling vat that processes raw bones into refined marrow extract.',
    lore: 'The Marrow Vat was once a humble soup pot belonging to the tower\'s first necromancer.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'soul_well', name: 'Soul Well', emoji: '🕳️',
    description: 'A well that draws souls from the surrounding battlefield, converting them into usable energy.',
    lore: 'The Soul Well reaches deep into the underworld — the farther it extends, the more potent the souls it draws.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'crypt_vault', name: 'Crypt Vault', emoji: '🏦',
    description: 'A secure underground vault for storing rare materials and prized constructs.',
    lore: 'The Crypt Vault is guarded by bone golems who have stood motionless for centuries — they have never failed.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'flesh_wall', name: 'Flesh Wall', emoji: '🧱',
    description: 'A living wall of regenerated tissue that repairs itself after taking damage.',
    lore: 'Flesh Walls occasionally groan in pain when the wind blows — some say they still remember being alive.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'ghost_bell', name: 'Ghost Bell', emoji: '🔔',
    description: 'A spectral bell whose toll alerts all creatures in the tower to threats.',
    lore: 'The Ghost Bell was forged from the melted crown of a phantom king — its sound carries across all dimensions.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'soulYield', bonusPerLevel: 6,
  },
  {
    id: 'cursed_beacon', name: 'Cursed Beacon', emoji: '🔦',
    description: 'A beacon of dark energy that illuminates hidden passages and reveals invisible threats.',
    lore: 'The Cursed Beacon\'s light can be seen from the afterlife — ghosts use it to navigate back to the mortal world.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'coinBonus', bonusPerLevel: 6,
  },
  {
    id: 'death_altar', name: 'Death Altar', emoji: '💀',
    description: 'An altar where powerful necromantic rituals amplify construct abilities.',
    lore: 'The Death Altar is the oldest structure in the Bone Tower, predating the tower itself by millennia.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: BO_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const BO_ABILITIES: BoAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'bone_spear', name: 'Bone Spear', category: 'offensive',
    description: 'Launches a sharpened bone javelin that pierces through multiple enemies.',
    lore: 'Bone Spear was the first offensive spell developed by the tower\'s necromancers, perfected over centuries.',
    emoji: '🦴', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'death_grip', name: 'Death Grip', category: 'offensive',
    description: 'Spectral hands erupt from the ground, crushing the target with the force of a burial.',
    lore: 'Death Grip was invented by a necromancer who wanted to bury enemies alive without digging a grave.',
    emoji: '✊', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'bone_barrier', name: 'Bone Barrier', category: 'defensive',
    description: 'Raises a wall of interlocking bones to absorb incoming damage.',
    lore: 'Bone Barriers are assembled instantly from ambient bone dust, forming perfect architectural structures.',
    emoji: '🧱', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'wraith_shroud', name: 'Wraith Shroud', category: 'defensive',
    description: 'Wraps the caster in spectral energy that makes attacks pass through harmlessly.',
    lore: 'Wraith Shrouds were developed by Wraith Lords who grew tired of having their robes damaged in combat.',
    emoji: '👻', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'grave_sense', name: 'Grave Sense', category: 'utility',
    description: 'Senses the location of all dead and dying creatures within the tower.',
    lore: 'Grave Sense allows necromancers to find fresh materials before other scavengers do.',
    emoji: '👁️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'soul_siphon', name: 'Soul Siphon', category: 'utility',
    description: 'Drains a small amount of life energy from a target, converting it to usable power.',
    lore: 'Soul Siphon is the least destructive necromantic spell — it merely borrows a few years of life.',
    emoji: '💨', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'raise_skeleton', name: 'Raise Skeleton', category: 'summon',
    description: 'Raises a temporary skeleton warrior from nearby bone fragments to fight alongside you.',
    lore: 'Raise Skeleton was the spell that started it all — the spell that built the Bone Tower.',
    emoji: '💀', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'moth_swarm', name: 'Moth Swarm', category: 'summon',
    description: 'Summons a swarm of death moths that blind and drain enemies in a dense cloud.',
    lore: 'Moth Swarms are the tower\'s natural defense mechanism — they appear whenever the tower detects intruders.',
    emoji: '🦋', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: BO_ACHIEVEMENTS — 10 Achievements
// ============================================================

const BO_ACHIEVEMENTS: BoAchievementDef[] = [
  {
    id: 'ach_first_raise', name: 'First Awakening', emoji: '🔮',
    description: 'Raise your first bone creature and awaken the power of the Bone Tower.',
    conditionKey: 'totalRaised', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_raise_10', name: 'Bone Apprentice', emoji: '🔨',
    description: 'Raise 10 bone creatures and prove yourself as a capable necromancer.',
    conditionKey: 'totalRaised', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_raise_25', name: 'Necro Forgemaster', emoji: '🏅',
    description: 'Raise 25 bone creatures to earn the title of Necro Forgemaster.',
    conditionKey: 'totalRaised', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_floor_3', name: 'Tower Climber', emoji: '🔦',
    description: 'Discover 3 different tower floors and begin your ascent through the Bone Tower.',
    conditionKey: 'totalFloorsCleared', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_floor_all', name: 'Tower Conqueror', emoji: '🗺️',
    description: 'Ascend all 8 tower floors and reach the Nexus of Death.',
    conditionKey: 'totalFloorsCleared', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Dark Architect', emoji: '🏚️',
    description: 'Build 3 different tower structures to establish your dark fortress.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Curse Finder', emoji: '💎',
    description: 'Activate your first cursed artifact and unlock its dark power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Death Survivor', emoji: '☠️',
    description: 'Survive 5 random tower events without being consumed by the darkness.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Tower Veteran', emoji: '🧗',
    description: 'Reach necromancer level 25 and gain access to the throne room.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Tower Master', emoji: '👑',
    description: 'Reach the maximum necromancer level 50 and master the Bone Tower.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: BO_TITLES — 8 Title Progression
// ============================================================

const BO_TITLES: BoTitleDef[] = [
  {
    id: 'title_bone_novice', name: 'Bone Novice', emoji: '🦴',
    description: 'A newcomer to the Bone Tower, drawn by the dark whispers from the cursed battlefield.',
    lore: 'Every necromancer began as a Bone Novice, standing at the tower base, wondering what horrors await above.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_grave_digger', name: 'Grave Digger', emoji: '⚰️',
    description: 'An aspiring necromancer learning to harvest bones and awaken the dead.',
    lore: 'Grave Diggers know every bone in the human body by touch alone — a skill that proves invaluable in the dark.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_soul_harvester', name: 'Soul Harvester', emoji: '👻',
    description: 'A practitioner of soul magic who can trap and redirect spectral energy.',
    lore: 'Soul Harvesters walk the boundary between life and death, harvesting souls like a farmer harvests wheat.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_bone_necromancer', name: 'Bone Necromancer', emoji: '💀',
    description: 'A skilled necromancer capable of raising entire armies from the battlefield dead.',
    lore: 'Bone Necromancers can raise a skeleton in under three seconds — the current tower record is one second flat.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_flesh_architect', name: 'Flesh Architect', emoji: '🩸',
    description: 'A master of flesh manipulation who creates living constructs of horrifying beauty.',
    lore: 'Flesh Architects see beauty where others see horror — their creations are functional works of grotesque art.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_ghost_lord', name: 'Ghost Lord', emoji: '🗡️',
    description: 'A spectral sovereign commanding legions of wraiths and phantoms.',
    lore: 'Ghost Lords have transcended the need for physical bodies — they exist as pure will.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_death_commander', name: 'Death Commander', emoji: '⚔️',
    description: 'A general of the undead whose armies have never been defeated.',
    lore: 'Death Commanders do not fear death — they ARE death, walking among the living.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_tower_master', name: 'Tower Master', emoji: '👑',
    description: 'The supreme master of the Bone Tower, commanding death itself from the Nexus.',
    lore: 'The Tower Master sits upon the Throne of Bones and sees every death in the world — a burden no mortal was meant to carry.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: BO_ARTIFACTS — 6 Artifacts
// ============================================================

const BO_ARTIFACTS: BoArtifactDef[] = [
  {
    id: 'art_skull_of_ashes', name: 'Skull of Ashes',
    description: 'A charred skull that whispers the final words of everyone it has witnessed die.',
    lore: 'The Skull of Ashes contains the collective death rattles of ten thousand fallen warriors.',
    emoji: '💀', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_bone_crown', name: 'Bone Crown',
    description: 'A crown carved from the finger bones of a forgotten king, radiating dark authority.',
    lore: 'The Bone Crown was forged by the first Tower Master from the hands of the king who tried to destroy the tower.',
    emoji: '👑', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_wraith_cloak', name: 'Wraith Cloak',
    description: 'A cloak woven from spectral thread that renders the wearer nearly invisible.',
    lore: 'The Wraith Cloak was a wedding gift from a Wraith Lord to his mortal bride — she did not survive the wedding night.',
    emoji: '🧥', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_marrow_chalice', name: 'Marrow Chalice',
    description: 'A chalice carved from a single mammoth femur, overflowing with golden marrow.',
    lore: 'Drinking from the Marrow Chalice grants temporary omniscience — the side effects are permanent memory loss.',
    emoji: '🏆', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_death_crystal', name: 'Death Crystal',
    description: 'A flawless black crystal containing the trapped soul of an ancient death god.',
    lore: 'The Death Crystal hums at a frequency that causes plants to wilt and water to freeze within ten feet.',
    emoji: '🔮', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_everlasting_rib', name: 'Everlasting Rib',
    description: 'A rib from the Everlasting Ossuary, indestructible and pulsing with infinite dark energy.',
    lore: 'The Everlasting Rib is said to be the only bone that death cannot claim — it has been broken, burned, and dissolved, yet it always reforms.',
    emoji: '🦴', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: BO_EVENTS — 8 Random Tower Events
// ============================================================

const BO_EVENTS: BoEventDef[] = [
  {
    id: 'evt_bone_avalanche', name: 'Bone Avalanche',
    description: 'The Bone Hoard collapses, sending a cascade of skeletal remains crashing through the tower.',
    lore: 'Bone Avalanches are terrifying but useful — they expose rare bones buried deep within the piles.',
    emoji: '🦴', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'bone_fragment', rewardMaterialCount: 5,
  },
  {
    id: 'evt_soul_surge', name: 'Soul Surge',
    description: 'A wave of trapped souls floods through the tower, empowering all creatures temporarily.',
    lore: 'Soul Surges happen when the boundary between worlds thins, releasing thousands of souls simultaneously.',
    emoji: '👻', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'soul_shard', rewardMaterialCount: 5,
  },
  {
    id: 'evt_flesh_bloom', name: 'Flesh Bloom',
    description: 'The Flesh Pits overflow with rapidly multiplying organic matter, flooding lower floors.',
    lore: 'Flesh Blooms are the Flesh Architect\'s proudest moments — but even they struggle to control the growth.',
    emoji: '🩸', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'sinew_strand', rewardMaterialCount: 6,
  },
  {
    id: 'evt_ghost_eclipse', name: 'Ghost Eclipse',
    description: 'Thousands of ghosts simultaneously pass through the tower, blotting out all light.',
    lore: 'Ghost Eclipses occur when the moon aligns with the Nexus of Death, opening a direct channel to the afterlife.',
    emoji: '🌑', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'spectral_dust', rewardMaterialCount: 4,
  },
  {
    id: 'evt_marrow_geyser', name: 'Marrow Geyser',
    description: 'A geyser of golden marrow erupts from the Marrow Chamber, coating everything in sticky gold.',
    lore: 'Marrow Geysers are incredibly valuable but dangerous — the marrow is hot enough to dissolve bone.',
    emoji: '🫧', effectType: 'buff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'marrow_extract', rewardMaterialCount: 3,
  },
  {
    id: 'evt_whispers_of_dead', name: 'Whispers of the Dead',
    description: 'Ancient whispers echo through every corridor, revealing forgotten necromantic knowledge.',
    lore: 'The Whispers of the Dead are the voices of every necromancer who ever died in the Bone Tower — and there were many.',
    emoji: '📣', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'cursed_ash', rewardMaterialCount: 2,
  },
  {
    id: 'evt_dragon_bone_reveal', name: 'Dragon Bone Reveal',
    description: 'An ancient dragon skeleton partially materializes within the tower, shedding rare bone fragments.',
    lore: 'Dragon Bone Reveals are the Bone Tower\'s way of rewarding powerful necromancers with supreme materials.',
    emoji: '🐉', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'dragon_bone', rewardMaterialCount: 3,
  },
  {
    id: 'evt_tremor_of_death', name: 'Tremor of Death',
    description: 'The tower shakes violently as the Chthonic Devourer stirs beneath the foundation.',
    lore: 'Tremors of Death are the most feared events — the last major tremor destroyed three entire floors.',
    emoji: '🌋', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'grave_dust', rewardMaterialCount: 8,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function boGenerateInstanceId(): string {
  return `bo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function boPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function boCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function boCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useBoneTower() {
  // ---- Core State ----
  const [boLevel, setBoLevel] = useState(1);
  const [boXp, setBoXp] = useState(BO_STARTING_XP);
  const [boCoins, setBoCoins] = useState(BO_STARTING_COINS);
  const [boTotalXp, setBoTotalXp] = useState(0);
  const [boTotalCoins, setBoTotalCoins] = useState(0);

  // ---- Collection State ----
  const [boRaised, setBoRaised] = useState<BoOwnedCreature[]>([]);
  const [boInventory, setBoInventory] = useState<BoInventoryItem[]>([]);
  const [boStructures, setBoStructures] = useState<BoStructureRecord[]>([]);
  const [boArtifacts, setBoArtifacts] = useState<BoArtifactRecord[]>([]);
  const [boAbilities, setBoAbilities] = useState<BoAbilityRecord[]>([]);
  const [boAchievements, setBoAchievements] = useState<BoAchievementRecord[]>([]);
  const [boChambers, setBoChambers] = useState<BoChamberRecord[]>([]);
  const [boEventLog, setBoEventLog] = useState<BoEventLogEntry[]>([]);
  const [boActiveEvent, setBoActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [boCurrentTitle, setBoCurrentTitle] = useState('title_bone_novice');

  // ---- Stats State ----
  const [boStats, setBoStats] = useState<BoStats>({
    totalRaised: 0,
    totalFloorsCleared: 0,
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
    boLevel, boXp, boTotalXp, boTotalCoins, boRaised, boInventory,
    boStructures, boArtifacts, boAbilities, boAchievements,
    boChambers, boEventLog, boActiveEvent, boCurrentTitle, boStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      boLevel, boXp, boTotalXp, boTotalCoins, boRaised, boInventory,
      boStructures, boArtifacts, boAbilities, boAchievements,
      boChambers, boEventLog, boActiveEvent, boCurrentTitle, boStats,
    };
  }, [boLevel, boXp, boTotalXp, boTotalCoins, boRaised, boInventory,
    boStructures, boArtifacts, boAbilities, boAchievements,
    boChambers, boEventLog, boActiveEvent, boCurrentTitle, boStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(BO_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.boLevel) setBoLevel(data.boLevel);
        if (data.boXp) setBoXp(data.boXp);
        if (data.boCoins) setBoCoins(data.boCoins);
        if (data.boTotalXp) setBoTotalXp(data.boTotalXp);
        if (data.boTotalCoins) setBoTotalCoins(data.boTotalCoins);
        if (data.boRaised) setBoRaised(data.boRaised);
        if (data.boInventory) setBoInventory(data.boInventory);
        if (data.boStructures) setBoStructures(data.boStructures);
        if (data.boArtifacts) setBoArtifacts(data.boArtifacts);
        if (data.boAbilities) setBoAbilities(data.boAbilities);
        if (data.boAchievements) setBoAchievements(data.boAchievements);
        if (data.boChambers) setBoChambers(data.boChambers);
        if (data.boEventLog) setBoEventLog(data.boEventLog);
        if (data.boActiveEvent) setBoActiveEvent(data.boActiveEvent);
        if (data.boCurrentTitle) setBoCurrentTitle(data.boCurrentTitle);
        if (data.boStats) setBoStats(data.boStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setBoChambers(
      BO_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setBoAbilities(
      BO_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setBoAchievements(
      BO_ACHIEVEMENTS.map((a) => ({
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
          boLevel, boXp, boCoins, boTotalXp, boTotalCoins,
          boRaised, boInventory, boStructures, boArtifacts,
          boAbilities, boAchievements, boChambers, boEventLog,
          boActiveEvent, boCurrentTitle, boStats,
        };
        localStorage.setItem(BO_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, BO_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [boLevel, boXp, boCoins, boTotalXp, boTotalCoins,
    boRaised, boInventory, boStructures, boArtifacts,
    boAbilities, boAchievements, boChambers, boEventLog,
    boActiveEvent, boCurrentTitle, boStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!boActiveEvent) return;
    const evt = BO_EVENTS.find((e) => e.id === boActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setBoActiveEvent(null);
      setBoEventLog((prev) =>
        prev.map((e) => (e.eventId === boActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [boActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...BO_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => boLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === boCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setBoCurrentTitle(nextTitle.id);
    }
  }, [boLevel, boCurrentTitle]);

  // ============================================================
  // COMPUTED: boMaxXp
  // ============================================================

  const boMaxXp = useMemo(() => {
    return Math.floor(BO_XP_BASE * Math.pow(boLevel + 1, BO_XP_SCALE));
  }, [boLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(BO_XP_BASE * Math.pow(lvl, BO_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(boLevel + 1);
    return Math.max(0, needed - boXp);
  }, [boLevel, boXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(boLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((boXp / needed) * 100), 100);
  }, [boLevel, boXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): BoCreatureDef | undefined => {
    return BO_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): BoChamberDef | undefined => {
    return BO_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): BoMaterialDef | undefined => {
    return BO_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): BoStructureDef | undefined => {
    return BO_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): BoAbilityDef | undefined => {
    return BO_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): BoArtifactDef | undefined => {
    return BO_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): BoAchievementDef | undefined => {
    return BO_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): BoTitleDef | undefined => {
    return BO_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): BoEventDef | undefined => {
    return BO_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: BoRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: BoRarity): string => {
    return BO_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: BoSpecies): string => {
    return BO_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: raiseGolem
  // ============================================================

  const raiseGolem = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (boCoins < def.cost) return false;
    if (boRaised.length >= BO_MAX_RAISED_CREATURES) return false;

    const newCreature: BoOwnedCreature = {
      creatureId: def.id,
      instanceId: boGenerateInstanceId(),
      raisedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setBoCoins((prev) => prev - def.cost);
    setBoRaised((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = boCalculateLevelUp(
      xpForLevel(boLevel + 1),
      boXp,
      xpGained,
      setBoLevel,
    );
    setBoXp(overflow);
    setBoTotalXp((prev) => prev + xpGained);
    setBoTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setBoStats((prev) => ({ ...prev, totalRaised: prev.totalRaised + 1 }));
    return true;
  }, [boCoins, boLevel, boXp, boRaised.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: ascendFloor
  // ============================================================

  const ascendFloor = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (boLevel < def.unlockLevel) return false;

    setBoChambers((prev) =>
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

    const bonusMat = boPickRandom(def.resources);
    if (bonusMat) {
      setBoInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, BO_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setBoTotalXp((prev) => prev + 15);
    setBoTotalCoins((prev) => prev + 5);
    setBoStats((prev) => ({ ...prev, totalFloorsCleared: prev.totalFloorsCleared + 1 }));
    return true;
  }, [boLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = boStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = boCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (boCoins < cost) return false;

    setBoCoins((prev) => prev - cost);
    setBoStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setBoTotalXp((prev) => prev + 20);
    setBoStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [boCoins, boStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (boCoins < def.cost) return false;
    if (boArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setBoCoins((prev) => prev - def.cost);
    setBoArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setBoTotalXp((prev) => prev + 100);
    setBoStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [boCoins, boArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerTowerEvent
  // ============================================================

  const triggerTowerEvent = useCallback((): BoEventDef | null => {
    if (boActiveEvent) return null;
    const event = boPickRandom(BO_EVENTS);
    setBoActiveEvent(event.id);
    setBoEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setBoTotalXp((prev) => prev + event.rewardXp);
    setBoCoins((prev) => prev + event.rewardCoins);
    setBoTotalCoins((prev) => prev + event.rewardCoins);
    setBoStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setBoInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, BO_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    return event;
  }, [boActiveEvent]);

  // ============================================================
  // CORE ACTION: resetBoneTower
  // ============================================================

  const resetBoneTower = useCallback(() => {
    setBoLevel(1);
    setBoXp(0);
    setBoCoins(BO_STARTING_COINS);
    setBoTotalXp(0);
    setBoTotalCoins(0);
    setBoRaised([]);
    setBoInventory([]);
    setBoStructures([]);
    setBoArtifacts([]);
    setBoAbilities(
      BO_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setBoAchievements(
      BO_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setBoChambers(
      BO_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setBoEventLog([]);
    setBoActiveEvent(null);
    setBoCurrentTitle('title_bone_novice');
    setBoStats({
      totalRaised: 0, totalFloorsCleared: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(BO_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverFloor
  // ============================================================

  const discoverFloor = useCallback((chamberId: string): boolean => {
    return ascendFloor(chamberId);
  }, [ascendFloor]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setBoStats((currentStats) => {
      setBoAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalRaised: currentStats.totalRaised,
          totalFloorsCleared: currentStats.totalFloorsCleared,
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
            setBoTotalXp((xp) => xp + def.rewardXp);
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
    const record = boAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setBoAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setBoTotalXp((prev) => prev + 5);
    return true;
  }, [boAbilities, getAbilityDef]);

  // ============================================================
  // EXTENDED ACTION: dismissEvent
  // ============================================================

  const dismissEvent = useCallback((): boolean => {
    if (!boActiveEvent) return false;
    setBoActiveEvent(null);
    setBoEventLog((prev) =>
      prev.map((e) => (e.eventId === boActiveEvent ? { ...e, resolved: true } : e)),
    );
    return true;
  }, [boActiveEvent]);

  // ============================================================
  // EXTENDED ACTION: addMaterialToInventory
  // ============================================================

  const addMaterialToInventory = useCallback((materialId: string, count: number): boolean => {
    const def = getMaterialDef(materialId);
    if (!def) return false;

    setBoInventory((prev) => {
      const existing = prev.find((i) => i.materialId === materialId);
      if (existing) {
        return prev.map((i) =>
          i.materialId === materialId
            ? { ...i, count: Math.min(i.count + count, BO_MAX_INVENTORY_ITEM) }
            : i,
        );
      }
      return [...prev, { materialId, count: Math.min(count, BO_MAX_INVENTORY_ITEM) }];
    });
    return true;
  }, [getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: removeMaterialFromInventory
  // ============================================================

  const removeMaterialFromInventory = useCallback((materialId: string, count: number): boolean => {
    const item = boInventory.find((i) => i.materialId === materialId);
    if (!item || item.count < count) return false;

    setBoInventory((prev) =>
      prev.map((i) =>
        i.materialId === materialId
          ? { ...i, count: i.count - count }
          : i,
      ).filter((i) => i.count > 0),
    );
    return true;
  }, [boInventory]);

  // ============================================================
  // EXTENDED ACTION: renameCreature
  // ============================================================

  const renameCreature = useCallback((instanceId: string, nickname: string): boolean => {
    const creature = boRaised.find((c) => c.instanceId === instanceId);
    if (!creature) return false;

    setBoRaised((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, nickname } : c,
      ),
    );
    return true;
  }, [boRaised]);

  // ============================================================
  // EXTENDED ACTION: dismissCreature
  // ============================================================

  const dismissCreature = useCallback((instanceId: string): boolean => {
    const creature = boRaised.find((c) => c.instanceId === instanceId);
    if (!creature) return false;

    const def = getCreatureDef(creature.creatureId);
    const refund = def ? Math.floor(def.cost * 0.3) : 5;

    setBoRaised((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setBoCoins((prev) => prev + refund);
    return true;
  }, [boRaised, getCreatureDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const boTitleProgress = useMemo((): BoTitleProgress => {
    const sorted = [...BO_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === boCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === boCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((boLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [boLevel, boCurrentTitle]);

  const currentTitleInfo = useMemo(() => boTitleProgress.current, [boTitleProgress]);

  const nextTitleInfo = useMemo(() => boTitleProgress.next, [boTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesRaised: boRaised.length,
    floorsCleared: boChambers.filter((c) => c.discovered).length,
    structuresBuilt: boStructures.length,
    artifactsActive: boArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: boAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: boAbilities.filter((a) => a.unlocked).length,
    totalXp: boTotalXp,
    totalCoins: boTotalCoins,
    currentLevel: boLevel,
    ownedSpeciesCount: new Set(boRaised.map((g) => {
      const d = BO_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: boEventLog.length,
  }), [boRaised, boChambers, boStructures, boArtifacts,
    boAchievements, boAbilities, boTotalXp, boTotalCoins, boLevel, boEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      BO_CREATURES.length +
      BO_CHAMBERS.length +
      BO_STRUCTURES.length +
      BO_ARTIFACTS.length +
      BO_ACHIEVEMENTS.length +
      BO_ABILITIES.length;
    const completed =
      boRaised.length +
      boChambers.filter((c) => c.discovered).length +
      boStructures.length +
      boArtifacts.filter((a) => a.activated).length +
      boAchievements.filter((a) => a.unlocked).length +
      boAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((boRaised.length / BO_CREATURES.length) * 100),
      chamberPercent: Math.round((boChambers.filter((c) => c.discovered).length / BO_CHAMBERS.length) * 100),
      structurePercent: Math.round((boStructures.length / BO_STRUCTURES.length) * 100),
      artifactPercent: Math.round((boArtifacts.filter((a) => a.activated).length / BO_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((boAchievements.filter((a) => a.unlocked).length / BO_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((boAbilities.filter((a) => a.unlocked).length / BO_ABILITIES.length) * 100),
    };
  }, [boRaised, boChambers, boStructures, boArtifacts, boAchievements, boAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    boRaised.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [boRaised, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    boChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [boChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    boStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: boCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: boCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [boStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    boInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [boInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    boArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [boArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    boAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [boAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, BoOwnedCreature[]> = {};
    for (const species of BO_SPECIES) {
      result[species.id] = boRaised.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [boRaised, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: BoRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, BoOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = boRaised.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [boRaised, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return BO_CREATURES.filter((c) => c.cost <= boCoins);
  }, [boCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalRaised: boStats.totalRaised,
      totalFloorsCleared: boStats.totalFloorsCleared,
      totalStructuresBuilt: boStats.totalStructuresBuilt,
      totalArtifacts: boStats.totalArtifacts,
      totalEvents: boStats.totalEvents,
      totalCoins: boStats.totalCoins,
      totalXp: boStats.totalXp,
    };
    return BO_ACHIEVEMENTS.filter(
      (a) =>
        !boAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [boStats, boAchievements]);

  const recentEventLog = useMemo(() => {
    return [...boEventLog].reverse().slice(0, 10);
  }, [boEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...boRaised]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [boRaised, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of boRaised) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [boRaised, getCreatureDef]);

  const floorExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of boChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [boChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of boStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [boStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of boAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [boAbilities]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    BO_BONE_WHITE,
    BO_BLOOD_RED,
    BO_SHADOW_PURPLE,
    BO_SOUL_GREEN,
    BO_DARK_IRON,
    BO_CURSED_GOLD,
    BO_ASH_GRAY,
    BO_RARITY_COLORS,
    BO_SPECIES_COLORS,
    BO_ALL_COLORS,

    // ---- Data Constants ----
    BO_SPECIES,
    BO_CREATURES,
    BO_CHAMBERS,
    BO_MATERIALS,
    BO_STRUCTURES,
    BO_ABILITIES,
    BO_ACHIEVEMENTS,
    BO_TITLES,
    BO_ARTIFACTS,
    BO_EVENTS,
    BO_MAX_LEVEL,
    BO_SAVE_KEY,
    BO_XP_BASE,
    BO_XP_SCALE,

    // ---- State ----
    boLevel,
    boXp,
    boMaxXp,
    boCoins,
    boTotalXp,
    boTotalCoins,
    boRaised,
    boInventory,
    boStructures,
    boArtifacts,
    boAbilities,
    boAchievements,
    boChambers,
    boEventLog,
    boActiveEvent,
    boCurrentTitle,
    boStats,

    // ---- Core Actions ----
    raiseGolem,
    ascendFloor,
    buildStructure,
    activateArtifact,
    triggerTowerEvent,
    resetBoneTower,

    // ---- Extended Actions ----
    discoverFloor,
    checkAndClaimAchievements,
    useAbility,
    dismissEvent,
    addMaterialToInventory,
    removeMaterialFromInventory,
    renameCreature,
    dismissCreature,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    boTitleProgress,

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
    floorExplorationMap,
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
