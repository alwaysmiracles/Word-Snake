import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Jasper Gorge (碧玉峡谷) — Wire Module
//
// A deep gemstone canyon carved by ancient rivers, filled with
// jasper crystals, canyon creatures, and hidden gem veins.
// Players craft gorge creatures, explore canyon chambers, collect
// gem materials, build structures, discover ancient artifacts,
// face random gorge events, and ascend through 8 titles.
//
// Storage key: jasper-gorge-save
// Prefix: jg / JG_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type JgRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type JgSpecies =
  | 'jasper_wyrm'
  | 'canyon_hawk'
  | 'crystal_mantis'
  | 'stone_golem'
  | 'gem_beetle'
  | 'river_serpent'
  | 'crag_lizard';

type JgAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type JgStructureBonusType =
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

type JgMaterialCategory = 'gem' | 'stone' | 'crystal' | 'organic' | 'mineral' | 'water' | 'fire';

// ---- Creature Definitions ----

interface JgCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: JgSpecies;
  readonly rarity: JgRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface JgChamberDef {
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

interface JgMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: JgRarity;
  readonly value: number;
  readonly category: JgMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface JgStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: JgStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface JgAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: JgAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: JgRarity;
}

// ---- Achievement Definitions ----

interface JgAchievementDef {
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

interface JgTitleDef {
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

interface JgArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: JgRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface JgEventDef {
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

interface JgOwnedCreature {
  creatureId: string;
  instanceId: string;
  craftedAt: number;
  timesUsed: number;
  nickname: string;
}

interface JgChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface JgStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface JgArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface JgAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface JgAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface JgInventoryItem {
  materialId: string;
  count: number;
}

interface JgEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface JgStats {
  totalCrafted: number;
  totalCrystals: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface JgTitleProgress {
  current: JgTitleDef;
  next: JgTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: JG_ CONSTANTS
// ============================================================

const JG_SAVE_KEY = 'jasper-gorge-save';
const JG_MAX_LEVEL = 50;
const JG_STARTING_COINS = 300;
const JG_STARTING_XP = 0;
const JG_XP_BASE = 100;
const JG_XP_SCALE = 1.5;
const JG_AUTO_SAVE_MS = 15000;
const JG_EVENT_DURATION_MS = 60000;
const JG_MAX_INVENTORY_ITEM = 999;
const JG_MAX_OWNED_CREATURES = 100;
const JG_COOLDOWN_TICK_MS = 1000;
const JG_SPECIES_COUNT = 7;
const JG_CREATURE_COUNT = 35;
const JG_CHAMBER_COUNT = 8;
const JG_MATERIAL_COUNT = 12;
const JG_STRUCTURE_COUNT = 8;
const JG_ABILITY_COUNT = 8;
const JG_ACHIEVEMENT_COUNT = 10;
const JG_TITLE_COUNT = 8;
const JG_ARTIFACT_COUNT = 6;
const JG_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const JG_CRIMSON = '#E74C3C';
const JG_AMBER = '#F39C12';
const JG_SAGE = '#27AE60';
const JG_DEEP = '#2C3E50';
const JG_JASPER = '#D4A574';
const JG_CRYSTAL_BLUE = '#5DADE2';
const JG_SURFACE = '#F7DC6F';

const JG_RARITY_COLORS: Record<JgRarity, string> = {
  common: '#A0A090',
  uncommon: '#5DADE2',
  rare: '#AB47BC',
  epic: '#E74C3C',
  legendary: '#FFD700',
};

const JG_SPECIES_COLORS: Record<JgSpecies, string> = {
  jasper_wyrm: JG_CRIMSON,
  canyon_hawk: JG_AMBER,
  crystal_mantis: JG_CRYSTAL_BLUE,
  stone_golem: JG_DEEP,
  gem_beetle: '#9B59B6',
  river_serpent: JG_SAGE,
  crag_lizard: JG_JASPER,
};

const JG_ALL_COLORS = [
  JG_CRIMSON,
  JG_AMBER,
  JG_SAGE,
  JG_DEEP,
  JG_JASPER,
  JG_CRYSTAL_BLUE,
  JG_SURFACE,
];

// ============================================================
// SECTION 4: JG_SPECIES — 7 Species Types
// ============================================================

const JG_SPECIES: { id: JgSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'jasper_wyrm',
    name: 'Jasper Wyrm',
    description: 'Serpentine dragons formed from living jasper stone, breathing gem dust and ancient fire.',
    lore: 'Jasper Wyrms were born when a meteor of pure jasper struck the gorge floor millennia ago, fracturing into sentient stone serpents.',
    emoji: '🐲',
    color: JG_CRIMSON,
  },
  {
    id: 'canyon_hawk',
    name: 'Canyon Hawk',
    description: 'Majestic raptors that ride the thermals between gorge walls with gemstone-tipped talons.',
    lore: 'Canyon Hawks nest in the highest crags, their talons naturally crystallizing from the mineral-rich updrafts.',
    emoji: '🦅',
    color: JG_AMBER,
  },
  {
    id: 'crystal_mantis',
    name: 'Crystal Mantis',
    description: 'Praying mantises with razor-sharp crystal blade arms that refract light into blinding arrays.',
    lore: 'Crystal Mantises evolved their blade arms to cut through solid stone, carving new passages through the gorge.',
    emoji: '🦗',
    color: JG_CRYSTAL_BLUE,
  },
  {
    id: 'stone_golem',
    name: 'Stone Golem',
    description: 'Massive humanoid figures animated from gorge bedrock, slow but virtually indestructible.',
    lore: 'Stone Golems are the oldest inhabitants of the gorge, formed when ancient earth magic saturated the cliff walls.',
    emoji: '🗿',
    color: JG_DEEP,
  },
  {
    id: 'gem_beetle',
    name: 'Gem Beetle',
    description: 'Hard-shelled beetles with iridescent gemstone carapaces that shift colors in the light.',
    lore: 'Gem Beetles graze on mineral deposits, their shells slowly absorbing and refracting the gorge\'s gemstone energies.',
    emoji: '🪲',
    color: '#9B59B6',
  },
  {
    id: 'river_serpent',
    name: 'River Serpent',
    description: 'Aquatic serpents dwelling in the underground rivers that flow through the gorge\'s depths.',
    lore: 'River Serpents navigate by sensing the electromagnetic fields of crystals embedded in the gorge walls.',
    emoji: '🐍',
    color: JG_SAGE,
  },
  {
    id: 'crag_lizard',
    name: 'Crag Lizard',
    description: 'Agile lizards perfectly adapted to vertical cliff faces, clinging to any surface with ease.',
    lore: 'Crag Lizards can run straight up the gorge walls, defying gravity with specialized micro-crystal toe pads.',
    emoji: '🦎',
    color: JG_JASPER,
  },
];

// ============================================================
// SECTION 5: JG_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const JG_CREATURES: JgCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'jasper_wyrm_common', name: 'Emberling', species: 'jasper_wyrm', rarity: 'common',
    description: 'A baby jasper wyrm barely the size of a forearm, radiating gentle warmth from its stone scales.',
    lore: 'Emberlings are born when jasper deposits are heated by underground magma streams.',
    emoji: '🐲', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'canyon_hawk_common', name: 'Cliff Chick', species: 'canyon_hawk', rarity: 'common',
    description: 'A young hawk fledgling learning to ride the gorge thermals for the first time.',
    lore: 'Cliff Chicks often fall into the gorge on their first flight attempt — the lucky ones are caught by updrafts.',
    emoji: '🦅', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'crystal_mantis_common', name: 'Shard Hatchling', species: 'crystal_mantis', rarity: 'common',
    description: 'A tiny mantis with crystalline arm buds just beginning to form their signature blades.',
    lore: 'Shard Hatchlings must consume quartz pebbles to grow their first crystal blades.',
    emoji: '🦗', power: 7, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'stone_golem_common', name: 'Pebble Guardian', species: 'stone_golem', rarity: 'common',
    description: 'A small golem formed from smooth gorge pebbles, steadfast and surprisingly strong.',
    lore: 'Pebble Guardians are the simplest golems, but their loyalty makes them invaluable companions.',
    emoji: '🗿', power: 9, defense: 12, cost: 16, xpReward: 6,
  },
  {
    id: 'gem_beetle_common', name: 'Dust Scarab', species: 'gem_beetle', rarity: 'common',
    description: 'A humble beetle with a dull carapace that shimmers faintly in direct sunlight.',
    lore: 'Dust Scarabs burrow through gorge sediment, filtering out tiny gem fragments for nourishment.',
    emoji: '🪲', power: 6, defense: 7, cost: 15, xpReward: 6,
  },
  {
    id: 'river_serpent_common', name: 'Stream Worm', species: 'river_serpent', rarity: 'common',
    description: 'A small aquatic serpent that swims through the shallow gorge streams.',
    lore: 'Stream Worms are harmless and often kept as pets by gorge fishermen for catching river fish.',
    emoji: '🐍', power: 7, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'crag_lizard_common', name: 'Rockling', species: 'crag_lizard', rarity: 'common',
    description: 'A tiny lizard that scurries along gorge walls with remarkable speed.',
    lore: 'Rocklings can cling to any surface, even completely smooth polished jasper walls.',
    emoji: '🦎', power: 8, defense: 7, cost: 17, xpReward: 7,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'jasper_wyrm_uncommon', name: 'Canyon Wyrm', species: 'jasper_wyrm', rarity: 'uncommon',
    description: 'A juvenile wyrm that has learned to breathe clouds of shimmering jasper dust.',
    lore: 'Canyon Wyrms mark their territory by leaving trails of crystallized jasper dust on cliff walls.',
    emoji: '🐲', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'canyon_hawk_uncommon', name: 'Gorge Talon', species: 'canyon_hawk', rarity: 'uncommon',
    description: 'A skilled hunter with gemstone-hard talons capable of piercing gorge stone.',
    lore: 'Gorge Talons dive at speeds exceeding 200 mph, their talons acting like diamond drill bits.',
    emoji: '🦅', power: 20, defense: 15, cost: 55, xpReward: 18,
  },
  {
    id: 'crystal_mantis_uncommon', name: 'Quartz Blade', species: 'crystal_mantis', rarity: 'uncommon',
    description: 'A mature mantis with fully formed quartz blade arms that can slice through rock.',
    lore: 'Quartz Blades duel for territory by clashing their crystal arms, creating showers of prismatic sparks.',
    emoji: '🦗', power: 24, defense: 14, cost: 65, xpReward: 22,
  },
  {
    id: 'stone_golem_uncommon', name: 'Rock Sentinel', species: 'stone_golem', rarity: 'uncommon',
    description: 'A towering golem of layered gorge stone, immune to most physical attacks.',
    lore: 'Rock Sentinels stand so still they are often mistaken for natural rock formations.',
    emoji: '🗿', power: 18, defense: 24, cost: 50, xpReward: 16,
  },
  {
    id: 'gem_beetle_uncommon', name: 'Agate Roller', species: 'gem_beetle', rarity: 'uncommon',
    description: 'A beetle with an agate shell that rolls into a near-impenetrable sphere when threatened.',
    lore: 'Agate Rollers can roll down gorge cliffs at incredible speed, using their shell as a battering ram.',
    emoji: '🪲', power: 16, defense: 22, cost: 50, xpReward: 17,
  },
  {
    id: 'river_serpent_uncommon', name: 'Rapids Viper', species: 'river_serpent', rarity: 'uncommon',
    description: 'A venomous water serpent that navigates the gorge\'s most turbulent rapids with ease.',
    lore: 'Rapids Viper venom causes crystallization in the bloodstream — a defense mechanism unique to gorge serpents.',
    emoji: '🐍', power: 21, defense: 16, cost: 58, xpReward: 19,
  },
  {
    id: 'crag_lizard_uncommon', name: 'Climber Drake', species: 'crag_lizard', rarity: 'uncommon',
    description: 'A larger lizard capable of scaling the tallest gorge walls in mere minutes.',
    lore: 'Climber Drakes leave crystalline footprints on the walls that glow in the dark, marking their climbing routes.',
    emoji: '🦎', power: 19, defense: 17, cost: 55, xpReward: 18,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'jasper_wyrm_rare', name: 'Jasper Drake', species: 'jasper_wyrm', rarity: 'rare',
    description: 'A formidable drake with scales of polished jasper and a breath of molten gemstone.',
    lore: 'Jasper Drakes are territorial and will defend their gem hoards against all intruders with devastating fury.',
    emoji: '🐲', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'canyon_hawk_rare', name: 'Storm Wing', species: 'canyon_hawk', rarity: 'rare',
    description: 'A hawk wrapped in perpetual storm clouds, summoning lightning with its wings.',
    lore: 'Storm Wings create thunderstorms by flying in tight circles through charged canyon thermals.',
    emoji: '🦅', power: 38, defense: 30, cost: 180, xpReward: 45,
  },
  {
    id: 'crystal_mantis_rare', name: 'Prism Stalker', species: 'crystal_mantis', rarity: 'rare',
    description: 'A stealthy predator that refracts light around itself to become nearly invisible.',
    lore: 'Prism Stalkers are so well-camouflaged that the only sign of their presence is the rainbow halo they project.',
    emoji: '🦗', power: 42, defense: 28, cost: 220, xpReward: 55,
  },
  {
    id: 'stone_golem_rare', name: 'Granite Titan', species: 'stone_golem', rarity: 'rare',
    description: 'A massive golem of solid granite that shakes the ground with every step.',
    lore: 'Granite Titans were once the foundation pillars of an ancient gorge-spanning bridge.',
    emoji: '🗿', power: 35, defense: 42, cost: 190, xpReward: 48,
  },
  {
    id: 'gem_beetle_rare', name: 'Ruby Carrier', species: 'gem_beetle', rarity: 'rare',
    description: 'A beetle with a ruby-red shell that glows with inner fire and tremendous resilience.',
    lore: 'Ruby Carriers are believed to be living furnaces, their internal temperature exceeding 800 degrees.',
    emoji: '🪲', power: 32, defense: 38, cost: 200, xpReward: 50,
  },
  {
    id: 'river_serpent_rare', name: 'Whirlpool Python', species: 'river_serpent', rarity: 'rare',
    description: 'A massive serpent that creates whirlpools to trap prey in the underground rivers.',
    lore: 'Whirlpool Pythons can drain entire underground lakes in hours when angered.',
    emoji: '🐍', power: 37, defense: 32, cost: 200, xpReward: 52,
  },
  {
    id: 'crag_lizard_rare', name: 'Summit Wyrm', species: 'crag_lizard', rarity: 'rare',
    description: 'A powerful lizard that has conquered the highest and most dangerous gorge peaks.',
    lore: 'Summit Wyrms bask in direct sunlight at the gorge rim, absorbing solar energy through their crystal scales.',
    emoji: '🦎', power: 36, defense: 34, cost: 195, xpReward: 49,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'jasper_wyrm_epic', name: 'Gemstone Leviathan', species: 'jasper_wyrm', rarity: 'epic',
    description: 'An enormous wyrm encrusted with countless gems, each scale a different precious stone.',
    lore: 'The Gemstone Leviathan is said to be the living embodiment of the gorge itself, every gem a memory of the canyon.',
    emoji: '🐲', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'canyon_hawk_epic', name: 'Crimson Raptor', species: 'canyon_hawk', rarity: 'epic',
    description: 'A legendary hawk wreathed in crimson fire, diving from the stratosphere to strike.',
    lore: 'Crimson Raptors only appear during gorge eclipses, when the moon turns blood red.',
    emoji: '🦅', power: 68, defense: 52, cost: 750, xpReward: 110,
  },
  {
    id: 'crystal_mantis_epic', name: 'Diamond Claw', species: 'crystal_mantis', rarity: 'epic',
    description: 'A terrifying mantis with diamond-tipped blades that can cut through any known material.',
    lore: 'Diamond Claw mantises have been known to slice through bedrock, creating new gorge passages overnight.',
    emoji: '🦗', power: 72, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'stone_golem_epic', name: 'Obsidian Colossus', species: 'stone_golem', rarity: 'epic',
    description: 'A towering colossus of volcanic obsidian, reflecting all light in its mirror-black surface.',
    lore: 'Obsidian Colossi were forged in ancient volcanic eruptions that once filled the gorge with molten lava.',
    emoji: '🗿', power: 60, defense: 72, cost: 780, xpReward: 115,
  },
  {
    id: 'gem_beetle_epic', name: 'Opal Chitin', species: 'gem_beetle', rarity: 'epic',
    description: 'A magnificent beetle with an opalescent shell that shifts through every color of the spectrum.',
    lore: 'Opal Chitin beetles are worshiped by gorge miners as living treasure maps — their shell patterns reveal nearby gems.',
    emoji: '🪲', power: 62, defense: 58, cost: 780, xpReward: 115,
  },
  {
    id: 'river_serpent_epic', name: 'Tsunami Basilisk', species: 'river_serpent', rarity: 'epic',
    description: 'A colossal serpent whose mere movement triggers underground tsunamis through the gorge rivers.',
    lore: 'Tsunami Basilisks sleep for centuries at a time, their dreams causing the underground rivers to shift course.',
    emoji: '🐍', power: 66, defense: 55, cost: 820, xpReward: 125,
  },
  {
    id: 'crag_lizard_epic', name: 'Lava Salamander', species: 'crag_lizard', rarity: 'epic',
    description: 'A salamander adapted to swim through lava flows deep in the volcanic gorge vents.',
    lore: 'Lava Salamanders cool themselves by diving into the underground river, creating massive steam explosions.',
    emoji: '🦎', power: 64, defense: 60, cost: 800, xpReward: 120,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'jasper_wyrm_legendary', name: 'Ancient Jasper Titan', species: 'jasper_wyrm', rarity: 'legendary',
    description: 'The primordial wyrm that carved the gorge itself with a single sweep of its tail.',
    lore: 'The Ancient Jasper Titan predates the gorge — it is the reason the gorge exists at all.',
    emoji: '🐲', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'canyon_hawk_legendary', name: 'Apex Sky King', species: 'canyon_hawk', rarity: 'legendary',
    description: 'The supreme ruler of all gorge skies, commanding storms and wind with absolute authority.',
    lore: 'The Apex Sky King has never landed — it sleeps while flying, circling the gorge eternally.',
    emoji: '🦅', power: 115, defense: 95, cost: 2800, xpReward: 280,
  },
  {
    id: 'crystal_mantis_legendary', name: 'Crystal Apex Predator', species: 'crystal_mantis', rarity: 'legendary',
    description: 'The ultimate crystal hunter, a mantis that refracts reality itself through its blades.',
    lore: 'The Crystal Apex Predator sees through every illusion, its blades cutting through deception as easily as stone.',
    emoji: '🦗', power: 125, defense: 90, cost: 3200, xpReward: 320,
  },
  {
    id: 'stone_golem_legendary', name: 'Primordial Stone Lord', species: 'stone_golem', rarity: 'legendary',
    description: 'An ancient being of pure earth elemental energy, older than the mountains themselves.',
    lore: 'The Primordial Stone Lord can reshape the gorge at will, moving entire cliff faces with a gesture.',
    emoji: '🗿', power: 110, defense: 130, cost: 2900, xpReward: 290,
  },
  {
    id: 'gem_beetle_legendary', name: 'Eternal Gem Guardian', species: 'gem_beetle', rarity: 'legendary',
    description: 'A colossal beetle encrusted with every known gemstone, radiating prismatic energy.',
    lore: 'The Eternal Gem Guardian guards the gorge\'s deepest treasure vault, where gems grow like flowers.',
    emoji: '🪲', power: 108, defense: 110, cost: 3100, xpReward: 310,
  },
  {
    id: 'river_serpent_legendary', name: 'Ancient River Leviathan', species: 'river_serpent', rarity: 'legendary',
    description: 'A titanic serpent that IS the underground river — miles long and centuries old.',
    lore: 'The Ancient River Leviathan\'s body forms the entire underground river system of the gorge.',
    emoji: '🐍', power: 112, defense: 100, cost: 2900, xpReward: 290,
  },
  {
    id: 'crag_lizard_legendary', name: 'Eternal Crag Warden', species: 'crag_lizard', rarity: 'legendary',
    description: 'The immortal guardian of every cliff face in the gorge, able to traverse any surface.',
    lore: 'The Eternal Crag Warden has watched over the gorge since before the first human set foot in its depths.',
    emoji: '🦎', power: 118, defense: 98, cost: 3500, xpReward: 350,
  },
];

// ============================================================
// SECTION 6: JG_CHAMBERS — 8 Gorge Chambers
// ============================================================

const JG_CHAMBERS: JgChamberDef[] = [
  {
    id: 'canyon_rim', name: 'Canyon Rim', emoji: '🌅',
    description: 'The sun-drenched top edge of the gorge with sweeping views of the surrounding desert.',
    lore: 'The Canyon Rim was once a flat plain until the Ancient Jasper Titan carved it open in a single day.',
    level: 1, resources: ['river_stone', 'canyon_clay', 'gorge_moss'], capacity: 10,
    unlockLevel: 1, ambientColor: JG_SURFACE, dangerLevel: 1,
  },
  {
    id: 'crystal_vein', name: 'Crystal Vein', emoji: '💎',
    description: 'A shimmering vein of crystals running through the gorge wall like a glittering highway.',
    lore: 'The Crystal Vein was discovered when lightning struck the gorge wall, revealing the crystal deposits beneath.',
    level: 3, resources: ['crystal_dust', 'jasper_shard', 'quartz_prism'], capacity: 15,
    unlockLevel: 3, ambientColor: JG_CRYSTAL_BLUE, dangerLevel: 2,
  },
  {
    id: 'jasper_nest', name: 'Jasper Nest', emoji: '🪺',
    description: 'The warm heart of jasper deposits where wyrm hatchlings are born in heated nests.',
    lore: 'Jasper Nests glow with inner warmth, heated by magma vents that flow beneath the nest floor.',
    level: 5, resources: ['jasper_shard', 'amber_nugget', 'agate_slice'], capacity: 20,
    unlockLevel: 5, ambientColor: JG_JASPER, dangerLevel: 3,
  },
  {
    id: 'underground_river', name: 'Underground River', emoji: '🌊',
    description: 'A vast subterranean river flowing through the gorge\'s depths, teeming with aquatic life.',
    lore: 'The Underground River is so deep that no light has ever reached its bottom.',
    level: 10, resources: ['river_stone', 'gorge_moss', 'amber_nugget'], capacity: 25,
    unlockLevel: 10, ambientColor: JG_SAGE, dangerLevel: 4,
  },
  {
    id: 'gem_pocket', name: 'Gem Pocket', emoji: '💍',
    description: 'A natural cavity in the gorge wall overflowing with raw gemstones of every color.',
    lore: 'The Gem Pocket is the richest mineral deposit in the gorge, replenished by underground crystal growth.',
    level: 15, resources: ['agate_slice', 'sapphire_chip', 'crystal_geode'], capacity: 30,
    unlockLevel: 15, ambientColor: '#9B59B6', dangerLevel: 5,
  },
  {
    id: 'stone_bridge', name: 'Ancient Stone Bridge', emoji: '🌉',
    description: 'A magnificent bridge of ancient carved stone spanning the widest section of the gorge.',
    lore: 'The Ancient Stone Bridge was built by the Primordial Stone Lord to connect the two sides of the gorge.',
    level: 20, resources: ['river_stone', 'jasper_shard', 'agate_slice'], capacity: 35,
    unlockLevel: 20, ambientColor: JG_DEEP, dangerLevel: 6,
  },
  {
    id: 'deep_chasm', name: 'Deep Chasm', emoji: '🕳️',
    description: 'The deepest, most treacherous part of the gorge where even light dares not venture.',
    lore: 'The Deep Chasm is said to extend all the way to the planet\'s core, where jasper is born from pure pressure.',
    level: 30, resources: ['ruby_crystal', 'emerald_cluster', 'crystal_dust'], capacity: 40,
    unlockLevel: 30, ambientColor: JG_CRIMSON, dangerLevel: 8,
  },
  {
    id: 'crystal_heart', name: 'Crystal Heart', emoji: '💠',
    description: 'The legendary crystal core at the gorge\'s very bottom, pulsing with ancient power.',
    lore: 'The Crystal Heart beats like a living organ, its pulse sending energy waves through every crystal in the gorge.',
    level: 40, resources: ['ruby_crystal', 'primordial_gem', 'opal_heart'], capacity: 50,
    unlockLevel: 40, ambientColor: '#FFD700', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: JG_MATERIALS — 12 Materials
// ============================================================

const JG_MATERIALS: JgMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'river_stone', name: 'River Stone', emoji: '🪨', rarity: 'common', value: 5,
    category: 'stone', craftBonus: 1,
    description: 'Smooth, water-worn stones from the underground riverbed, shaped by millennia of current.',
    lore: 'River Stones are the most common building material in the gorge, used for everything from walls to weapons.',
  },
  {
    id: 'canyon_clay', name: 'Canyon Clay', emoji: '🟫', rarity: 'common', value: 4,
    category: 'stone', craftBonus: 1,
    description: 'Red-brown clay found in layers between gorge rock formations.',
    lore: 'Canyon Clay is uniquely adhesive, making it perfect for repairing gorge structures and crafting golem bodies.',
  },
  {
    id: 'crystal_dust', name: 'Crystal Dust', emoji: '✨', rarity: 'common', value: 5,
    category: 'crystal', craftBonus: 2,
    description: 'Fine powder shed by gorge crystals, shimmering with residual energy.',
    lore: 'Crystal Dust is the raw material for most gorge creature crafting, providing the essential crystalline component.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'jasper_shard', name: 'Jasper Shard', emoji: '🔶', rarity: 'uncommon', value: 15,
    category: 'gem', craftBonus: 3,
    description: 'A fragment of raw jasper with beautiful banded patterns in red, brown, and yellow.',
    lore: 'Jasper Shards are the signature material of the gorge, found nowhere else in the world.',
  },
  {
    id: 'gorge_moss', name: 'Gorge Moss', emoji: '🌿', rarity: 'uncommon', value: 12,
    category: 'organic', craftBonus: 2,
    description: 'Luminous green moss growing on damp gorge walls, glowing faintly in darkness.',
    lore: 'Gorge Moss is used by gorge healers for its remarkable regenerative properties.',
  },
  {
    id: 'amber_nugget', name: 'Amber Nugget', emoji: '🟡', rarity: 'uncommon', value: 14,
    category: 'gem', craftBonus: 3,
    description: 'A chunk of ancient amber containing perfectly preserved prehistoric insect specimens.',
    lore: 'Amber Nuggets contain trapped life essence from millions of years ago, giving them unique magical properties.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'agate_slice', name: 'Agate Slice', emoji: '🟠', rarity: 'rare', value: 50,
    category: 'gem', craftBonus: 6,
    description: 'A precisely cut slice of banded agate revealing concentric rings of color.',
    lore: 'Agate Slices are used to amplify creature abilities, each ring representing a different power frequency.',
  },
  {
    id: 'sapphire_chip', name: 'Sapphire Chip', emoji: '🔵', rarity: 'rare', value: 55,
    category: 'crystal', craftBonus: 7,
    description: 'A small chip of deep blue sapphire found in the gem pocket walls.',
    lore: 'Sapphire Chips are so hard they can scratch any other material, including diamond.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'ruby_crystal', name: 'Ruby Crystal', emoji: '🔴', rarity: 'epic', value: 150,
    category: 'gem', craftBonus: 12,
    description: 'A flawless ruby crystal radiating deep crimson light and intense thermal energy.',
    lore: 'Ruby Crystals are the heart of the gorge\'s power — they grow hotter the deeper they are found.',
  },
  {
    id: 'emerald_cluster', name: 'Emerald Cluster', emoji: '💚', rarity: 'epic', value: 160,
    category: 'gem', craftBonus: 13,
    description: 'A cluster of raw emerald crystals growing in a radiant green formation.',
    lore: 'Emerald Clusters channel the gorge\'s earth energy, amplifying natural healing by a hundredfold.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'primordial_gem', name: 'Primordial Gem', emoji: '⭐', rarity: 'legendary', value: 600,
    category: 'gem', craftBonus: 25,
    description: 'A gem of pure primordial energy, older than the gorge itself, pulsing with creation force.',
    lore: 'The Primordial Gem is said to be a fragment of the meteor that created the gorge, still containing its cosmic power.',
  },
  {
    id: 'opal_heart', name: 'Opal Heart', emoji: '🌈', rarity: 'legendary', value: 700,
    category: 'gem', craftBonus: 28,
    description: 'A perfect opal displaying every color of the spectrum, shifting with every angle.',
    lore: 'The Opal Heart is the Crystal Heart\'s seed — planting it creates a new gorge crystal formation.',
  },
];

// ============================================================
// SECTION 8: JG_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const JG_STRUCTURES: JgStructureDef[] = [
  {
    id: 'jasper_quarry', name: 'Jasper Quarry', emoji: '⛏️',
    description: 'An open-pit mine carved into the gorge wall for extracting raw jasper and stone.',
    lore: 'The Jasper Quarry has been operating continuously since the gorge was first discovered by ancient miners.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'crystal_workshop', name: 'Crystal Workshop', emoji: '🔨',
    description: 'A gorge-side workshop for cutting, polishing, and assembling crystal components.',
    lore: 'The Crystal Workshop\'s diamond-tipped saws can cut through any known gem or crystal.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'canyon_bridge', name: 'Canyon Bridge', emoji: '🌉',
    description: 'A bridge spanning the gorge that unlocks new exploration paths and trade routes.',
    lore: 'Canyon Bridges sway gently in the wind but are reinforced with gorge crystal cables.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'gem_vault', name: 'Gem Vault', emoji: '🏦',
    description: 'A secure underground vault for storing precious gems and crafted creatures.',
    lore: 'The Gem Vault\'s walls are lined with crystal sensors that detect any unauthorized access.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'stone_fortress', name: 'Stone Fortress', emoji: '🏰',
    description: 'A defensive fortress built into the gorge walls for protection against threats.',
    lore: 'The Stone Fortress has withstood every gorge earthquake and invasion attempt in recorded history.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'river_dam', name: 'River Dam', emoji: '🚧',
    description: 'Controls the flow of the underground river, generating energy and preventing floods.',
    lore: 'The River Dam powers the entire gorge settlement with hydroelectric crystal energy.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'energyBonus', bonusPerLevel: 6,
  },
  {
    id: 'amber_beacon', name: 'Amber Beacon', emoji: '🔦',
    description: 'A lighthouse beacon of crystallized amber illuminating the deepest gorge chambers.',
    lore: 'The Amber Beacon\'s light can penetrate 300 meters of solid rock, revealing hidden passages.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'gemYield', bonusPerLevel: 6,
  },
  {
    id: 'crystal_cannon', name: 'Crystal Cannon', emoji: '💥',
    description: 'An ancient weapon that fires concentrated crystal beams across the gorge.',
    lore: 'The Crystal Cannon was the Stone Lord\'s greatest creation, capable of shattering entire cliff faces.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: JG_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const JG_ABILITIES: JgAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'crystal_blast', name: 'Crystal Blast', category: 'offensive',
    description: 'Fires a concentrated beam of crystal energy that shatters defenses on impact.',
    lore: 'Crystal Blast was the first ability ever discovered in the gorge, used by the Ancient Jasper Titan itself.',
    emoji: '💎', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'gorge_crush', name: 'Gorge Crush', category: 'offensive',
    description: 'Summons the weight of the entire gorge to crush a single target beneath falling stone.',
    lore: 'Gorge Crush channels the kinetic energy of the gorge walls into a devastating gravitational pulse.',
    emoji: '🏔️', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'stone_barrier', name: 'Stone Barrier', category: 'defensive',
    description: 'Raises a wall of gorge stone to block incoming attacks and projectiles.',
    lore: 'Stone Barriers are reinforced with crystal fibers, making them far stronger than natural rock.',
    emoji: '🧱', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'gem_shield', name: 'Gem Shield', category: 'defensive',
    description: 'Creates a shimmering shield of gemstone energy that absorbs all damage types.',
    lore: 'Gem Shields refract incoming attacks into harmless light, dissipating their energy harmlessly.',
    emoji: '🛡️', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'canyon_echo', name: 'Canyon Echo', category: 'utility',
    description: 'Sends a sonic pulse through the gorge to reveal hidden chambers and creatures.',
    lore: 'Canyon Echo was invented by Crag Lizards who navigate by listening to sound reflections off gorge walls.',
    emoji: '📣', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'river_vision', name: 'River Vision', category: 'utility',
    description: 'Views the gorge through the eyes of the underground river, revealing submerged secrets.',
    lore: 'River Vision lets the user see through water, rock, and crystal simultaneously.',
    emoji: '👁️', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'wyrm_call', name: 'Wyrm Call', category: 'summon',
    description: 'Calls a wild jasper wyrm to fight alongside you for a short duration.',
    lore: 'Wyrm Calls can only be answered by wyrms who recognize the caller\'s gemstone affinity.',
    emoji: '🐲', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'beetle_swarm', name: 'Beetle Swarm', category: 'summon',
    description: 'Releases a swarm of gem beetles that overwhelm enemies with sheer numbers.',
    lore: 'Beetle Swarms emerge from hidden nests throughout the gorge, responding to a crystal frequency signal.',
    emoji: '🪲', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: JG_ACHIEVEMENTS — 10 Achievements
// ============================================================

const JG_ACHIEVEMENTS: JgAchievementDef[] = [
  {
    id: 'ach_first_craft', name: 'First Spark', emoji: '🔮',
    description: 'Craft your first gorge creature and ignite the spark of creation.',
    conditionKey: 'totalCrafted', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_craft_10', name: 'Gorge Apprentice', emoji: '🔨',
    description: 'Craft 10 gorge creatures and establish yourself as a capable gorge crafter.',
    conditionKey: 'totalCrafted', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_craft_25', name: 'Gem Forgemaster', emoji: '🏅',
    description: 'Craft 25 gorge creatures to earn the title of Gem Forgemaster.',
    conditionKey: 'totalCrafted', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_explore_3', name: 'Canyon Diver', emoji: '🔦',
    description: 'Discover 3 different gorge chambers and begin mapping the canyon depths.',
    conditionKey: 'totalCrystals', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_explore_all', name: 'Gorge Cartographer', emoji: '🗺️',
    description: 'Explore all 8 gorge chambers and complete the definitive gorge map.',
    conditionKey: 'totalCrystals', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Bridge Builder', emoji: '🌉',
    description: 'Build 3 different gorge structures to establish your canyon outpost.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Gem Finder', emoji: '💎',
    description: 'Activate your first ancient gorge artifact and unlock its hidden power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Canyon Survivor', emoji: '🌋',
    description: 'Survive 5 random gorge events without being defeated.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Canyon Veteran', emoji: '🧗',
    description: 'Reach gorge explorer level 25 and gain access to the deepest chambers.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Gorge Master', emoji: '👑',
    description: 'Reach the maximum gorge explorer level 50 and master the entire gorge.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: JG_TITLES — 8 Title Progression
// ============================================================

const JG_TITLES: JgTitleDef[] = [
  {
    id: 'title_gorge_novice', name: 'Gorge Novice', emoji: '🪨',
    description: 'A newcomer to the Jasper Gorge, awestruck by its towering crystal walls.',
    lore: 'Every gorge master once stood at the canyon rim, looking down in wonder at the depths below.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_canyon_explorer', name: 'Canyon Explorer', emoji: '🧭',
    description: 'An adventurous soul descending into the gorge to discover its crystal secrets.',
    lore: 'Canyon Explorers learn to read the gorge walls like a book, finding hidden paths others miss.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_crystal_seeker', name: 'Crystal Seeker', emoji: '💎',
    description: 'A dedicated gem hunter following crystal veins deep into the gorge.',
    lore: 'Crystal Seekers can identify any gem by its resonance frequency alone.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_jasper_hunter', name: 'Jasper Hunter', emoji: '🔶',
    description: 'A skilled hunter tracking jasper wyrms through the canyon depths.',
    lore: 'Jasper Hunters wear cloaks of jasper shards that camouflage them against the gorge walls.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_gem_artisan', name: 'Gem Artisan', emoji: '💍',
    description: 'A master crafter who shapes raw gorge gems into powerful creatures and artifacts.',
    lore: 'Gem Artisans can cut a gem so precisely that it sings when struck.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_canyon_guardian', name: 'Canyon Guardian', emoji: '🛡️',
    description: 'A sworn protector of the gorge and all its crystal-dwelling inhabitants.',
    lore: 'Canyon Guardians have never once failed to defend the gorge from external threats.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_gorge_champion', name: 'Gorge Champion', emoji: '🏆',
    description: 'The champion of the gorge, having conquered every challenge the canyon offers.',
    lore: 'Gorge Champions carry a staff of fused jasper and crystal, symbol of their absolute mastery.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_gorge_master', name: 'Gorge Master', emoji: '🐉',
    description: 'The supreme master of the Jasper Gorge, one with the canyon and its ancient power.',
    lore: 'The Gorge Master hears the Crystal Heart beating in their chest, connected to the gorge for eternity.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: JG_ARTIFACTS — 6 Artifacts
// ============================================================

const JG_ARTIFACTS: JgArtifactDef[] = [
  {
    id: 'art_gorge_compass', name: 'Gorge Compass',
    description: 'An ancient compass carved from a single piece of red jasper, pointing toward hidden gem veins.',
    lore: 'The Gorge Compass was crafted by the first Canyon Guardian to navigate the gorge\'s treacherous depths.',
    emoji: '🧭', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_jasper_amulet', name: 'Jasper Amulet',
    description: 'An amulet of polished jasper that glows when danger approaches the wearer.',
    lore: 'The Jasper Amulet was found embedded in the skull of an Ancient Jasper Titan hatchling.',
    emoji: '📿', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_crystal_lens', name: 'Crystal Lens',
    description: 'A perfectly ground crystal lens that reveals invisible creatures and hidden gem deposits.',
    lore: 'The Crystal Lens was ground by the Crystal Apex Predator itself, using its diamond blades.',
    emoji: '🔍', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_ancient_map', name: 'Ancient Map Fragment',
    description: 'A fragment of a map showing the gorge as it existed thousands of years ago.',
    lore: 'The Ancient Map Fragment reveals chambers that no longer exist — or perhaps have not been discovered yet.',
    emoji: '📜', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_gem_of_deep', name: 'Gem of the Deep',
    description: 'A gem pulled from the Crystal Heart itself, pulsing with the gorge\'s primordial energy.',
    lore: 'The Gem of the Deep contains the memory of every creature that has ever lived in the gorge.',
    emoji: '💎', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_primordial_heart', name: 'Primordial Heart',
    description: 'The crystallized heart of the meteor that created the gorge, containing its cosmic power.',
    lore: 'The Primordial Heart is the most powerful artifact in the gorge — some say it IS the gorge.',
    emoji: '❤️‍🔥', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: JG_EVENTS — 8 Random Gorge Events
// ============================================================

const JG_EVENTS: JgEventDef[] = [
  {
    id: 'evt_rockslide', name: 'Rockslide',
    description: 'Boulders cascade down the gorge walls, blocking passages and revealing new crystal deposits.',
    lore: 'Rockslides are terrifying but often uncover rare gem veins hidden beneath the surface.',
    emoji: '🪨', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'river_stone', rewardMaterialCount: 5,
  },
  {
    id: 'evt_crystal_bloom', name: 'Crystal Bloom',
    description: 'A sudden burst of crystal growth erupts through the gorge walls, sparkling with energy.',
    lore: 'Crystal Blooms happen during geomagnetic storms when the gorge\'s crystal veins resonate in harmony.',
    emoji: '💎', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'crystal_dust', rewardMaterialCount: 5,
  },
  {
    id: 'evt_river_flood', name: 'River Flood',
    description: 'The underground river swells with rainwater, flooding lower chambers with mineral-rich water.',
    lore: 'River Floods deposit rare materials in the lower chambers as the waters recede.',
    emoji: '🌊', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'gorge_moss', rewardMaterialCount: 6,
  },
  {
    id: 'evt_gem_vein', name: 'Gem Vein Discovery',
    description: 'A new vein of precious gems is discovered in the gorge walls, glittering with opportunity.',
    lore: 'Gem Vein Discoveries are celebrated with gorge-wide festivals that last for three days.',
    emoji: '💍', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'jasper_shard', rewardMaterialCount: 4,
  },
  {
    id: 'evt_amber_glow', name: 'Amber Glow',
    description: 'The gorge fills with warm amber light as ancient amber deposits release trapped energy.',
    lore: 'Amber Glows warm the entire gorge, making even the deepest chambers feel like a summer afternoon.',
    emoji: '🟡', effectType: 'buff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'amber_nugget', rewardMaterialCount: 3,
  },
  {
    id: 'evt_ancient_echo', name: 'Ancient Echo',
    description: 'Whispers of ancient gorge dwellers echo through the chambers, revealing forgotten knowledge.',
    lore: 'Ancient Echoes carry the voices of the Primordial Stone Lord\'s builders from eons past.',
    emoji: '📣', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'agate_slice', rewardMaterialCount: 2,
  },
  {
    id: 'evt_wyrm_awakening', name: 'Wyrm Awakening',
    description: 'A sleeping jasper wyrm awakens deep in the gorge, sending tremors through the canyon.',
    lore: 'Wyrm Awakenings are rare events that reshape the gorge — and sometimes open entirely new chambers.',
    emoji: '🐲', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'jasper_shard', rewardMaterialCount: 3,
  },
  {
    id: 'evt_cavern_tremor', name: 'Cavern Tremor',
    description: 'A deep tremor shakes the gorge, shifting rock formations and revealing hidden crystals.',
    lore: 'Cavern Tremors are caused by the Crystal Heart\'s periodic energy pulses reverberating through the rock.',
    emoji: '🌋', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'crystal_dust', rewardMaterialCount: 8,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function jgGenerateInstanceId(): string {
  return `jg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function jgPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function jgCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function jgCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useJasperGorge() {
  // ---- Core State ----
  const [jgLevel, setJgLevel] = useState(1);
  const [jgXp, setJgXp] = useState(JG_STARTING_XP);
  const [jgCoins, setJgCoins] = useState(JG_STARTING_COINS);
  const [jgTotalXp, setJgTotalXp] = useState(0);
  const [jgTotalCoins, setJgTotalCoins] = useState(0);

  // ---- Collection State ----
  const [jgGolems, setJgGolems] = useState<JgOwnedCreature[]>([]);
  const [jgInventory, setJgInventory] = useState<JgInventoryItem[]>([]);
  const [jgStructures, setJgStructures] = useState<JgStructureRecord[]>([]);
  const [jgArtifacts, setJgArtifacts] = useState<JgArtifactRecord[]>([]);
  const [jgAbilities, setJgAbilities] = useState<JgAbilityRecord[]>([]);
  const [jgAchievements, setJgAchievements] = useState<JgAchievementRecord[]>([]);
  const [jgChambers, setJgChambers] = useState<JgChamberRecord[]>([]);
  const [jgEventLog, setJgEventLog] = useState<JgEventLogEntry[]>([]);
  const [jgActiveEvent, setJgActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [jgCurrentTitle, setJgCurrentTitle] = useState('title_gorge_novice');

  // ---- Stats State ----
  const [jgStats, setJgStats] = useState<JgStats>({
    totalCrafted: 0,
    totalCrystals: 0,
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
    jgLevel, jgXp, jgTotalXp, jgTotalCoins, jgGolems, jgInventory,
    jgStructures, jgArtifacts, jgAbilities, jgAchievements,
    jgChambers, jgEventLog, jgActiveEvent, jgCurrentTitle, jgStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      jgLevel, jgXp, jgTotalXp, jgTotalCoins, jgGolems, jgInventory,
      jgStructures, jgArtifacts, jgAbilities, jgAchievements,
      jgChambers, jgEventLog, jgActiveEvent, jgCurrentTitle, jgStats,
    };
  }, [jgLevel, jgXp, jgTotalXp, jgTotalCoins, jgGolems, jgInventory,
    jgStructures, jgArtifacts, jgAbilities, jgAchievements,
    jgChambers, jgEventLog, jgActiveEvent, jgCurrentTitle, jgStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(JG_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.jgLevel) setJgLevel(data.jgLevel);
        if (data.jgXp) setJgXp(data.jgXp);
        if (data.jgCoins) setJgCoins(data.jgCoins);
        if (data.jgTotalXp) setJgTotalXp(data.jgTotalXp);
        if (data.jgTotalCoins) setJgTotalCoins(data.jgTotalCoins);
        if (data.jgGolems) setJgGolems(data.jgGolems);
        if (data.jgInventory) setJgInventory(data.jgInventory);
        if (data.jgStructures) setJgStructures(data.jgStructures);
        if (data.jgArtifacts) setJgArtifacts(data.jgArtifacts);
        if (data.jgAbilities) setJgAbilities(data.jgAbilities);
        if (data.jgAchievements) setJgAchievements(data.jgAchievements);
        if (data.jgChambers) setJgChambers(data.jgChambers);
        if (data.jgEventLog) setJgEventLog(data.jgEventLog);
        if (data.jgActiveEvent) setJgActiveEvent(data.jgActiveEvent);
        if (data.jgCurrentTitle) setJgCurrentTitle(data.jgCurrentTitle);
        if (data.jgStats) setJgStats(data.jgStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setJgChambers(
      JG_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setJgAbilities(
      JG_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setJgAchievements(
      JG_ACHIEVEMENTS.map((a) => ({
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
          jgLevel, jgXp, jgCoins, jgTotalXp, jgTotalCoins,
          jgGolems, jgInventory, jgStructures, jgArtifacts,
          jgAbilities, jgAchievements, jgChambers, jgEventLog,
          jgActiveEvent, jgCurrentTitle, jgStats,
        };
        localStorage.setItem(JG_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, JG_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [jgLevel, jgXp, jgCoins, jgTotalXp, jgTotalCoins,
    jgGolems, jgInventory, jgStructures, jgArtifacts,
    jgAbilities, jgAchievements, jgChambers, jgEventLog,
    jgActiveEvent, jgCurrentTitle, jgStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!jgActiveEvent) return;
    const evt = JG_EVENTS.find((e) => e.id === jgActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setJgActiveEvent(null);
      setJgEventLog((prev) =>
        prev.map((e) => (e.eventId === jgActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [jgActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...JG_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => jgLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === jgCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setJgCurrentTitle(nextTitle.id);
    }
  }, [jgLevel, jgCurrentTitle]);

  // ============================================================
  // COMPUTED: jgMaxXp
  // ============================================================

  const jgMaxXp = useMemo(() => {
    return Math.floor(JG_XP_BASE * Math.pow(jgLevel + 1, JG_XP_SCALE));
  }, [jgLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(JG_XP_BASE * Math.pow(lvl, JG_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(jgLevel + 1);
    return Math.max(0, needed - jgXp);
  }, [jgLevel, jgXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(jgLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((jgXp / needed) * 100), 100);
  }, [jgLevel, jgXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): JgCreatureDef | undefined => {
    return JG_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): JgChamberDef | undefined => {
    return JG_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): JgMaterialDef | undefined => {
    return JG_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): JgStructureDef | undefined => {
    return JG_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): JgAbilityDef | undefined => {
    return JG_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): JgArtifactDef | undefined => {
    return JG_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): JgAchievementDef | undefined => {
    return JG_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): JgTitleDef | undefined => {
    return JG_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): JgEventDef | undefined => {
    return JG_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: JgRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: JgRarity): string => {
    return JG_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: JgSpecies): string => {
    return JG_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: craftCreature
  // ============================================================

  const craftCreature = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (jgCoins < def.cost) return false;
    if (jgGolems.length >= JG_MAX_OWNED_CREATURES) return false;

    const newCreature: JgOwnedCreature = {
      creatureId: def.id,
      instanceId: jgGenerateInstanceId(),
      craftedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setJgCoins((prev) => prev - def.cost);
    setJgGolems((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = jgCalculateLevelUp(
      xpForLevel(jgLevel + 1),
      jgXp,
      xpGained,
      setJgLevel,
    );
    setJgXp(overflow);
    setJgTotalXp((prev) => prev + xpGained);
    setJgTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setJgStats((prev) => ({ ...prev, totalCrafted: prev.totalCrafted + 1 }));
    return true;
  }, [jgCoins, jgLevel, jgXp, jgGolems.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreChamber
  // ============================================================

  const exploreChamber = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (jgLevel < def.unlockLevel) return false;

    setJgChambers((prev) =>
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

    const bonusMat = jgPickRandom(def.resources);
    if (bonusMat) {
      setJgInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, JG_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setJgTotalXp((prev) => prev + 15);
    setJgTotalCoins((prev) => prev + 5);
    setJgStats((prev) => ({ ...prev, totalCrystals: prev.totalCrystals + 1 }));
    return true;
  }, [jgLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = jgStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = jgCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (jgCoins < cost) return false;

    setJgCoins((prev) => prev - cost);
    setJgStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setJgTotalXp((prev) => prev + 20);
    setJgStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [jgCoins, jgStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (jgCoins < def.cost) return false;
    if (jgArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setJgCoins((prev) => prev - def.cost);
    setJgArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setJgTotalXp((prev) => prev + 100);
    setJgStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [jgCoins, jgArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerGorgeEvent
  // ============================================================

  const triggerGorgeEvent = useCallback((): JgEventDef | null => {
    if (jgActiveEvent) return null;
    const event = jgPickRandom(JG_EVENTS);
    setJgActiveEvent(event.id);
    setJgEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setJgTotalXp((prev) => prev + event.rewardXp);
    setJgCoins((prev) => prev + event.rewardCoins);
    setJgTotalCoins((prev) => prev + event.rewardCoins);

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setJgInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, JG_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    return event;
  }, [jgActiveEvent]);

  // ============================================================
  // CORE ACTION: resetJasperGorge
  // ============================================================

  const resetJasperGorge = useCallback(() => {
    setJgLevel(1);
    setJgXp(0);
    setJgCoins(JG_STARTING_COINS);
    setJgTotalXp(0);
    setJgTotalCoins(0);
    setJgGolems([]);
    setJgInventory([]);
    setJgStructures([]);
    setJgArtifacts([]);
    setJgAbilities(
      JG_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setJgAchievements(
      JG_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setJgChambers(
      JG_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setJgEventLog([]);
    setJgActiveEvent(null);
    setJgCurrentTitle('title_gorge_novice');
    setJgStats({
      totalCrafted: 0, totalCrystals: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(JG_SAVE_KEY); } catch { /* silent */ }
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
    setJgStats((currentStats) => {
      setJgAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalCrafted: currentStats.totalCrafted,
          totalCrystals: currentStats.totalCrystals,
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
            setJgTotalXp((xp) => xp + def.rewardXp);
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
    const record = jgAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setJgAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setJgTotalXp((prev) => prev + 5);
    return true;
  }, [jgAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const jgTitleProgress = useMemo((): JgTitleProgress => {
    const sorted = [...JG_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === jgCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === jgCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((jgLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [jgLevel, jgCurrentTitle]);

  const currentTitleInfo = useMemo(() => jgTitleProgress.current, [jgTitleProgress]);

  const nextTitleInfo = useMemo(() => jgTitleProgress.next, [jgTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesCrafted: jgGolems.length,
    chambersExplored: jgChambers.filter((c) => c.discovered).length,
    structuresBuilt: jgStructures.length,
    artifactsActive: jgArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: jgAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: jgAbilities.filter((a) => a.unlocked).length,
    totalXp: jgTotalXp,
    totalCoins: jgTotalCoins,
    currentLevel: jgLevel,
    ownedSpeciesCount: new Set(jgGolems.map((g) => {
      const d = JG_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: jgEventLog.length,
  }), [jgGolems, jgChambers, jgStructures, jgArtifacts,
    jgAchievements, jgAbilities, jgTotalXp, jgTotalCoins, jgLevel, jgEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      JG_CREATURES.length +
      JG_CHAMBERS.length +
      JG_STRUCTURES.length +
      JG_ARTIFACTS.length +
      JG_ACHIEVEMENTS.length +
      JG_ABILITIES.length;
    const completed =
      jgGolems.length +
      jgChambers.filter((c) => c.discovered).length +
      jgStructures.length +
      jgArtifacts.filter((a) => a.activated).length +
      jgAchievements.filter((a) => a.unlocked).length +
      jgAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((jgGolems.length / JG_CREATURES.length) * 100),
      chamberPercent: Math.round((jgChambers.filter((c) => c.discovered).length / JG_CHAMBERS.length) * 100),
      structurePercent: Math.round((jgStructures.length / JG_STRUCTURES.length) * 100),
      artifactPercent: Math.round((jgArtifacts.filter((a) => a.activated).length / JG_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((jgAchievements.filter((a) => a.unlocked).length / JG_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((jgAbilities.filter((a) => a.unlocked).length / JG_ABILITIES.length) * 100),
    };
  }, [jgGolems, jgChambers, jgStructures, jgArtifacts, jgAchievements, jgAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    jgGolems.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [jgGolems, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    jgChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [jgChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    jgStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: jgCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: jgCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [jgStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    jgInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [jgInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    jgArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [jgArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    jgAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [jgAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, JgOwnedCreature[]> = {};
    for (const species of JG_SPECIES) {
      result[species.id] = jgGolems.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [jgGolems, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: JgRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, JgOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = jgGolems.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [jgGolems, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return JG_CREATURES.filter((c) => c.cost <= jgCoins);
  }, [jgCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalCrafted: jgStats.totalCrafted,
      totalCrystals: jgStats.totalCrystals,
      totalStructuresBuilt: jgStats.totalStructuresBuilt,
      totalArtifacts: jgStats.totalArtifacts,
      totalEvents: jgStats.totalEvents,
      totalCoins: jgStats.totalCoins,
      totalXp: jgStats.totalXp,
    };
    return JG_ACHIEVEMENTS.filter(
      (a) =>
        !jgAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [jgStats, jgAchievements]);

  const recentEventLog = useMemo(() => {
    return [...jgEventLog].reverse().slice(0, 10);
  }, [jgEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...jgGolems]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [jgGolems, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of jgGolems) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [jgGolems, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of jgChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [jgChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of jgStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [jgStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of jgAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [jgAbilities]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    JG_CRIMSON,
    JG_AMBER,
    JG_SAGE,
    JG_DEEP,
    JG_JASPER,
    JG_CRYSTAL_BLUE,
    JG_SURFACE,
    JG_RARITY_COLORS,
    JG_SPECIES_COLORS,
    JG_ALL_COLORS,

    // ---- Data Constants ----
    JG_SPECIES,
    JG_CREATURES,
    JG_CHAMBERS,
    JG_MATERIALS,
    JG_STRUCTURES,
    JG_ABILITIES,
    JG_ACHIEVEMENTS,
    JG_TITLES,
    JG_ARTIFACTS,
    JG_EVENTS,
    JG_MAX_LEVEL,
    JG_SAVE_KEY,
    JG_XP_BASE,
    JG_XP_SCALE,

    // ---- State ----
    jgLevel,
    jgXp,
    jgMaxXp,
    jgCoins,
    jgTotalXp,
    jgTotalCoins,
    jgGolems,
    jgInventory,
    jgStructures,
    jgArtifacts,
    jgAbilities,
    jgAchievements,
    jgChambers,
    jgEventLog,
    jgActiveEvent,
    jgCurrentTitle,
    jgStats,

    // ---- Core Actions ----
    craftCreature,
    exploreChamber,
    buildStructure,
    activateArtifact,
    triggerGorgeEvent,
    resetJasperGorge,

    // ---- Extended Actions ----
    discoverChamber,
    checkAndClaimAchievements,
    useAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    jgTitleProgress,

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
