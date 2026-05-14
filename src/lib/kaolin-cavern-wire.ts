import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Kaolin Cavern (高岭洞穴) — Wire Module
//
// An underground clay/crystal cave theme with ceramic creatures.
// Players craft clay creatures, explore cave chambers, collect
// materials, build structures, discover ancient artifacts,
// face random cave events, and ascend through 8 titles.
//
// Storage key: kaolin-cavern-save
// Prefix: ka / KA_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type KaRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type KaSpecies =
  | 'clay_golem'
  | 'crystal_serpent'
  | 'porcelain_fairy'
  | 'kaolin_beetle'
  | 'jade_spider'
  | 'terracotta_golem'
  | 'ceramic_dragon';

type KaAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type KaStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'crystalYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type KaMaterialCategory = 'clay' | 'crystal' | 'mineral' | 'stone' | 'liquid' | 'fire' | 'metal';

// ---- Creature Definitions ----

interface KaCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: KaSpecies;
  readonly rarity: KaRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface KaChamberDef {
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

interface KaMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: KaRarity;
  readonly value: number;
  readonly category: KaMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface KaStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: KaStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface KaAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: KaAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: KaRarity;
}

// ---- Achievement Definitions ----

interface KaAchievementDef {
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

interface KaTitleDef {
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

interface KaArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: KaRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface KaEventDef {
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

interface KaOwnedCreature {
  creatureId: string;
  instanceId: string;
  craftedAt: number;
  timesUsed: number;
  nickname: string;
}

interface KaChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface KaStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface KaArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface KaAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface KaAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface KaInventoryItem {
  materialId: string;
  count: number;
}

interface KaEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface KaStats {
  totalCrafted: number;
  totalCrystals: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface KaTitleProgress {
  current: KaTitleDef;
  next: KaTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: KA_ CONSTANTS
// ============================================================

const KA_SAVE_KEY = 'kaolin-cavern-save';
const KA_MAX_LEVEL = 50;
const KA_STARTING_COINS = 300;
const KA_STARTING_XP = 0;
const KA_XP_BASE = 80;
const KA_XP_SCALE = 1.35;
const KA_AUTO_SAVE_MS = 15000;
const KA_EVENT_DURATION_MS = 60000;
const KA_MAX_INVENTORY_ITEM = 999;
const KA_MAX_OWNED_CREATURES = 100;
const KA_COOLDOWN_TICK_MS = 1000;
const KA_SPECIES_COUNT = 7;
const KA_CREATURE_COUNT = 35;
const KA_CHAMBER_COUNT = 8;
const KA_MATERIAL_COUNT = 30;
const KA_STRUCTURE_COUNT = 25;
const KA_ABILITY_COUNT = 22;
const KA_ACHIEVEMENT_COUNT = 18;
const KA_TITLE_COUNT = 8;
const KA_ARTIFACT_COUNT = 6;
const KA_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const KA_CLAY_WHITE = '#F5F5F0';
const KA_CRYSTAL_BLUE = '#4FC3F7';
const KA_TERRACOTTA = '#E2725B';
const KA_JADE_GREEN = '#00A86B';
const KA_DARK_CAVE = '#1A1A2E';
const KA_SURFACE = '#2D2D44';

const KA_RARITY_COLORS: Record<KaRarity, string> = {
  common: '#A0A090',
  uncommon: '#4FC3F7',
  rare: '#AB47BC',
  epic: '#FF7043',
  legendary: '#FFD700',
};

const KA_SPECIES_COLORS: Record<KaSpecies, string> = {
  clay_golem: KA_CLAY_WHITE,
  crystal_serpent: KA_CRYSTAL_BLUE,
  porcelain_fairy: '#F8BBD0',
  kaolin_beetle: '#D7CCC8',
  jade_spider: KA_JADE_GREEN,
  terracotta_golem: KA_TERRACOTTA,
  ceramic_dragon: '#FF5722',
};

const KA_ALL_COLORS = [
  KA_CLAY_WHITE,
  KA_CRYSTAL_BLUE,
  KA_TERRACOTTA,
  KA_JADE_GREEN,
  KA_DARK_CAVE,
  KA_SURFACE,
];

// ============================================================
// SECTION 4: KA_SPECIES — 7 Species Types
// ============================================================

const KA_SPECIES: { id: KaSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'clay_golem',
    name: 'Clay Golem',
    description: 'Sturdy humanoid figures molded from raw cave clay, given life by ancient ceramic magic.',
    lore: 'The first clay golems were shaped by the Cavern\'s original inhabitants to guard the upper tunnels from surface intruders.',
    emoji: '🏺',
    color: KA_CLAY_WHITE,
  },
  {
    id: 'crystal_serpent',
    name: 'Crystal Serpent',
    description: 'Serpentine creatures with crystalline scales that refract light into dazzling prisms.',
    lore: 'Crystal serpents are born when quartz veins are infused with liquid crystal — a process that takes centuries.',
    emoji: '🐍',
    color: KA_CRYSTAL_BLUE,
  },
  {
    id: 'porcelain_fairy',
    name: 'Porcelain Fairy',
    description: 'Delicate winged beings crafted from fired porcelain, radiating ethereal light.',
    lore: 'According to legend, porcelain fairies are born in the kiln when the temperature reaches exactly 1300°C at midnight.',
    emoji: '🧚',
    color: '#F8BBD0',
  },
  {
    id: 'kaolin_beetle',
    name: 'Kaolin Beetle',
    description: 'Hard-shelled beetles armored in polished white kaolin clay found deep in the mines.',
    lore: 'Kaolin beetles use their shells to reflect light deeper into caves, guiding lost explorers to safety.',
    emoji: '🪲',
    color: '#D7CCC8',
  },
  {
    id: 'jade_spider',
    name: 'Jade Spider',
    description: 'Eight-legged weavers spinning shimmering webs from jade-green crystalline silk.',
    lore: 'Jade spider silk is among the strongest materials in the cavern, prized for crafting and armoring.',
    emoji: '🕷️',
    color: KA_JADE_GREEN,
  },
  {
    id: 'terracotta_golem',
    name: 'Terracotta Golem',
    description: 'Ancient warriors of baked terracotta, fierce and loyal, standing guard for millennia.',
    lore: 'An entire army of terracotta guardians was once discovered sleeping in the Clay Entry Hall, waiting for orders.',
    emoji: '🗿',
    color: KA_TERRACOTTA,
  },
  {
    id: 'ceramic_dragon',
    name: 'Ceramic Dragon',
    description: 'Majestic dragons of glazed ceramic with kiln-fire breath and shimmering wing membranes.',
    lore: 'The Ceramic Dragon is the apex predator of the Kaolin Cavern, born from the Eternal Kiln\'s first firing.',
    emoji: '🐉',
    color: '#FF5722',
  },
];

// ============================================================
// SECTION 5: KA_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const KA_CREATURES: KaCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'clay_golem_common', name: 'Mudling', species: 'clay_golem', rarity: 'common',
    description: 'A simple golem formed from wet cave clay. Obedient but fragile, ideal for beginners.',
    lore: 'Mudlings are the first creatures new crafters attempt. Their simplicity hides a quiet charm.',
    emoji: '🏺', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'crystal_serpent_common', name: 'Quartz Worm', species: 'crystal_serpent', rarity: 'common',
    description: 'A small serpentine creature with translucent quartz scales catching light.',
    lore: 'Quartz Worms are harmless but surprisingly beautiful, their scales acting as natural prisms.',
    emoji: '🐍', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'porcelain_fairy_common', name: 'Crackling Sprite', species: 'porcelain_fairy', rarity: 'common',
    description: 'A tiny fairy made from cracked porcelain with chipped wings and faded paint.',
    lore: 'Despite their worn appearance, Crackling Sprites carry ancient blessings within their cracks.',
    emoji: '🧚', power: 6, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'kaolin_beetle_common', name: 'Dust Scarab', species: 'kaolin_beetle', rarity: 'common',
    description: 'A humble beetle armored in raw kaolin dust, slow but steady.',
    lore: 'Dust Scarabs roll into perfect spheres when threatened, becoming near-impenetrable.',
    emoji: '🪲', power: 9, defense: 10, cost: 16, xpReward: 6,
  },
  {
    id: 'jade_spider_common', name: 'Jadeling', species: 'jade_spider', rarity: 'common',
    description: 'A small spider with pale green jade fangs and iridescent eyes.',
    lore: 'Jadelings weave tiny silk threads that glow in the dark, marking safe paths through the cave.',
    emoji: '🕷️', power: 7, defense: 7, cost: 20, xpReward: 8,
  },
  {
    id: 'terracotta_golem_common', name: 'Clay Soldier', species: 'terracotta_golem', rarity: 'common',
    description: 'A basic terracotta soldier, sun-baked and unglazed but unwaveringly loyal.',
    lore: 'Clay Soldiers stand at attention in the entry hall, silently greeting every visitor.',
    emoji: '🗿', power: 12, defense: 11, cost: 25, xpReward: 10,
  },
  {
    id: 'ceramic_dragon_common', name: 'Pottery Whelp', species: 'ceramic_dragon', rarity: 'common',
    description: 'A baby dragon shaped from kiln-fired earthenware, cute but clumsy.',
    lore: 'Pottery Whelps are drawn to warm kilns, often falling asleep in the embers.',
    emoji: '🐉', power: 11, defense: 9, cost: 28, xpReward: 11,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'clay_golem_uncommon', name: 'River Guardian', species: 'clay_golem', rarity: 'uncommon',
    description: 'A water-hardened clay golem that guards underground rivers and springs.',
    lore: 'River Guardians form naturally where cave water meets mineral-rich clay seams.',
    emoji: '🏺', power: 22, defense: 20, cost: 60, xpReward: 20,
  },
  {
    id: 'crystal_serpent_uncommon', name: 'Amethyst Coil', species: 'crystal_serpent', rarity: 'uncommon',
    description: 'A coiling serpent with deep purple amethyst scales radiating arcane energy.',
    lore: 'Amethyst Coils are said to dream in color, projecting their dreams onto nearby crystal walls.',
    emoji: '🐍', power: 20, defense: 18, cost: 55, xpReward: 18,
  },
  {
    id: 'porcelain_fairy_uncommon', name: 'Celadon Nymph', species: 'porcelain_fairy', rarity: 'uncommon',
    description: 'A fairy of jade-green celadon porcelain, ancient and elegantly crafted.',
    lore: 'Celadon Nymphs carry fragments of Song Dynasty kiln recipes in their delicate wings.',
    emoji: '🧚', power: 18, defense: 15, cost: 65, xpReward: 22,
  },
  {
    id: 'kaolin_beetle_uncommon', name: 'Kaolin Charger', species: 'kaolin_beetle', rarity: 'uncommon',
    description: 'A swift beetle with a polished kaolin shell that gleams white in torchlight.',
    lore: 'Kaolin Chargers can carry ten times their body weight in raw materials through the tunnels.',
    emoji: '🪲', power: 19, defense: 17, cost: 50, xpReward: 17,
  },
  {
    id: 'jade_spider_uncommon', name: 'Nephrite Weaver', species: 'jade_spider', rarity: 'uncommon',
    description: 'A weaver spider crafting strong webs from nephrite jade silk threads.',
    lore: 'Nephrite Weaver silk is so strong that a single thread can suspend a grown human.',
    emoji: '🕷️', power: 21, defense: 19, cost: 58, xpReward: 19,
  },
  {
    id: 'terracotta_golem_uncommon', name: 'Glazed Warrior', species: 'terracotta_golem', rarity: 'uncommon',
    description: 'A terracotta warrior protected by a beautiful green celadon glaze.',
    lore: 'The green glaze is not just decorative — it contains trace amounts of jade for extra durability.',
    emoji: '🗿', power: 24, defense: 22, cost: 70, xpReward: 24,
  },
  {
    id: 'ceramic_dragon_uncommon', name: 'Stoneware Drake', species: 'ceramic_dragon', rarity: 'uncommon',
    description: 'A young dragon of dense stoneware with salt-glazed scales and a smoky breath.',
    lore: 'Stoneware Drakes imprint their scales on cave walls as they squeeze through tight tunnels.',
    emoji: '🐉', power: 25, defense: 21, cost: 75, xpReward: 25,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'clay_golem_rare', name: 'Kaolin Titan', species: 'clay_golem', rarity: 'rare',
    description: 'A massive golem forged from pure white kaolin clay, near-indestructible and imposing.',
    lore: 'Kaolin Titans are so large they create their own microclimates in the cavern.',
    emoji: '🏺', power: 40, defense: 38, cost: 200, xpReward: 50,
  },
  {
    id: 'crystal_serpent_rare', name: 'Sapphire Viper', species: 'crystal_serpent', rarity: 'rare',
    description: 'A venomous serpent with deep blue sapphire crystal fangs and hypnotic gaze.',
    lore: 'The Sapphire Viper\'s venom is not lethal — it crystallizes victims in beautiful blue crystal.',
    emoji: '🐍', power: 38, defense: 32, cost: 180, xpReward: 45,
  },
  {
    id: 'porcelain_fairy_rare', name: 'Blue-and-White Sylph', species: 'porcelain_fairy', rarity: 'rare',
    description: 'A majestic fairy of Ming-dynasty blue-and-white porcelain with intricate patterns.',
    lore: 'Blue-and-White Sylphs are considered the pinnacle of porcelain fairy artistry.',
    emoji: '🧚', power: 35, defense: 30, cost: 220, xpReward: 55,
  },
  {
    id: 'kaolin_beetle_rare', name: 'Jade Carapace', species: 'kaolin_beetle', rarity: 'rare',
    description: 'A heavily armored beetle with overlapping jade-green ceramic plates.',
    lore: 'Jade Carapace beetles shed their shell once per season, leaving behind rare jade fragments.',
    emoji: '🪲', power: 37, defense: 36, cost: 190, xpReward: 48,
  },
  {
    id: 'jade_spider_rare', name: 'Emerald Spinner', species: 'jade_spider', rarity: 'rare',
    description: 'A brilliant emerald spider whose webs can trap shadow beasts from the void.',
    lore: 'Emerald Spinner webs are the only known material that can contain void energy.',
    emoji: '🕷️', power: 36, defense: 33, cost: 200, xpReward: 52,
  },
  {
    id: 'terracotta_golem_rare', name: 'Terracotta General', species: 'terracotta_golem', rarity: 'rare',
    description: 'A high-ranking general from an ancient terracotta army with painted armor.',
    lore: 'Terracotta Generals still carry the original battle plans inscribed on their inner walls.',
    emoji: '🗿', power: 42, defense: 40, cost: 250, xpReward: 60,
  },
  {
    id: 'ceramic_dragon_rare', name: 'Porcelain Wyrm', species: 'ceramic_dragon', rarity: 'rare',
    description: 'A sinuous dragon with iridescent porcelain scales and a kiln-fire core.',
    lore: 'Porcelain Wyrms can fire their scales as projectile weapons, regenerating them over weeks.',
    emoji: '🐉', power: 44, defense: 38, cost: 260, xpReward: 65,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'clay_golem_epic', name: 'Crystal Clay Colossus', species: 'clay_golem', rarity: 'epic',
    description: 'A towering colossus blending raw clay with embedded crystal formations, ancient and powerful.',
    lore: 'The Crystal Clay Colossus predates the cave itself, some say it created the tunnels.',
    emoji: '🏺', power: 70, defense: 65, cost: 800, xpReward: 120,
  },
  {
    id: 'crystal_serpent_epic', name: 'Diamond Asp', species: 'crystal_serpent', rarity: 'epic',
    description: 'A legendary serpent whose scales are pure diamond crystal, blindingly brilliant.',
    lore: 'The Diamond Asp is so rare that only three have ever been sighted in recorded history.',
    emoji: '🐍', power: 68, defense: 58, cost: 750, xpReward: 110,
  },
  {
    id: 'porcelain_fairy_epic', name: 'Imperial Kiln Angel', species: 'porcelain_fairy', rarity: 'epic',
    description: 'An angelic fairy fired in the imperial kiln with gold-trim porcelain wings.',
    lore: 'Imperial Kiln Angels are said to have descended from heaven, taking residence in the kiln.',
    emoji: '🧚', power: 65, defense: 55, cost: 850, xpReward: 130,
  },
  {
    id: 'kaolin_beetle_epic', name: 'Opal Scarab', species: 'kaolin_beetle', rarity: 'epic',
    description: 'A sacred scarab beetle with an opalescent shell that shifts between colors.',
    lore: 'Opal Scarabs are worshiped by cave dwellers as bringers of good fortune and rare materials.',
    emoji: '🪲', power: 67, defense: 62, cost: 780, xpReward: 115,
  },
  {
    id: 'jade_spider_epic', name: 'Jade Emperor Arachnid', species: 'jade_spider', rarity: 'epic',
    description: 'The emperor of all jade spiders, weaving fate itself into its shimmering silk.',
    lore: 'The Jade Emperor Arachnid\'s web spans entire chambers, connecting the cave\'s consciousness.',
    emoji: '🕷️', power: 64, defense: 60, cost: 820, xpReward: 125,
  },
  {
    id: 'terracotta_golem_epic', name: 'Terracotta Emperor', species: 'terracotta_golem', rarity: 'epic',
    description: 'The supreme commander of the terracotta army, radiating ancient authority.',
    lore: 'When the Terracotta Emperor speaks, every clay creature in the cavern falls silent and listens.',
    emoji: '🗿', power: 72, defense: 68, cost: 900, xpReward: 140,
  },
  {
    id: 'ceramic_dragon_epic', name: 'Celadon Leviathan', species: 'ceramic_dragon', rarity: 'epic',
    description: 'An enormous dragon of celadon ceramic with crackle-glaze breath and ancient wisdom.',
    lore: 'The Celadon Leviathan sleeps in the Porcelain Sanctum, dreaming of the surface world above.',
    emoji: '🐉', power: 75, defense: 70, cost: 950, xpReward: 150,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'clay_golem_legendary', name: 'Primordial Clay Avatar', species: 'clay_golem', rarity: 'legendary',
    description: 'An ancient being formed from the first clay that ever existed in the cavern.',
    lore: 'The Primordial Clay Avatar contains the memory of every creature ever shaped from cave earth.',
    emoji: '🏺', power: 120, defense: 110, cost: 3000, xpReward: 300,
  },
  {
    id: 'crystal_serpent_legendary', name: 'Abyssal Quartz Wyrm', species: 'crystal_serpent', rarity: 'legendary',
    description: 'A titanic serpent coiled in the deepest crystal chamber, older than the cave.',
    lore: 'The Abyssal Quartz Wyrm is so old it remembers when the cave was still part of the surface.',
    emoji: '🐍', power: 115, defense: 100, cost: 2800, xpReward: 280,
  },
  {
    id: 'porcelain_fairy_legendary', name: 'Celestial Porcelain Empress', species: 'porcelain_fairy', rarity: 'legendary',
    description: 'The empress of all porcelain fairies, wearing a crown of fired moon-dust porcelain.',
    lore: 'The Celestial Porcelain Empress can repair any broken porcelain with a single touch of her hand.',
    emoji: '🧚', power: 110, defense: 95, cost: 3200, xpReward: 320,
  },
  {
    id: 'kaolin_beetle_legendary', name: 'Kaolin Eternal Scarab', species: 'kaolin_beetle', rarity: 'legendary',
    description: 'An immortal scarab that carries the sun through the underground sky each day.',
    lore: 'The Kaolin Eternal Scarab has carried its burden since before memory, ensuring the cavern always has light.',
    emoji: '🪲', power: 112, defense: 105, cost: 2900, xpReward: 290,
  },
  {
    id: 'jade_spider_legendary', name: 'Jade Dimension Weaver', species: 'jade_spider', rarity: 'legendary',
    description: 'A cosmic spider spinning webs between dimensions using purest jade crystal.',
    lore: 'The Jade Dimension Weaver\'s web connects our world to parallel cave dimensions.',
    emoji: '🕷️', power: 108, defense: 98, cost: 3100, xpReward: 310,
  },
  {
    id: 'terracotta_golem_legendary', name: 'First Emperor Reborn', species: 'terracotta_golem', rarity: 'legendary',
    description: 'The legendary first emperor of the underground, reborn in terracotta glory.',
    lore: 'The First Emperor Reborn commands absolute loyalty from every terracotta creature that has ever existed.',
    emoji: '🗿', power: 125, defense: 115, cost: 3500, xpReward: 350,
  },
  {
    id: 'ceramic_dragon_legendary', name: 'Dragon of the Eternal Kiln', species: 'ceramic_dragon', rarity: 'legendary',
    description: 'The primordial ceramic dragon, born when the kiln first ignited eons ago.',
    lore: 'The Dragon of the Eternal Kiln is both the oldest and most powerful creature in the Kaolin Cavern.',
    emoji: '🐉', power: 130, defense: 120, cost: 4000, xpReward: 400,
  },
];

// ============================================================
// SECTION 6: KA_CHAMBERS — 8 Cave Chambers
// ============================================================

const KA_CHAMBERS: KaChamberDef[] = [
  {
    id: 'clay_entry', name: 'Clay Entry Hall', emoji: '🏚️',
    description: 'A wide cavern of smooth clay walls where new adventurers first descend into the underground.',
    lore: 'The Clay Entry Hall was carved by ancient hands and still bears their fingerprints in the walls.',
    level: 1, resources: ['raw_clay', 'cave_water', 'pebble_stone'], capacity: 10,
    unlockLevel: 1, ambientColor: KA_CLAY_WHITE, dangerLevel: 1,
  },
  {
    id: 'crystal_grotto', name: 'Crystal Grotto', emoji: '💎',
    description: 'Shimmering crystal formations line this breathtaking grotto, refracting all available light.',
    lore: 'The Crystal Grotto was discovered when a miner\'s lantern refracted through a thin cave wall.',
    level: 3, resources: ['quartz_shard', 'crystal_dust', 'calcite'], capacity: 15,
    unlockLevel: 3, ambientColor: KA_CRYSTAL_BLUE, dangerLevel: 2,
  },
  {
    id: 'kaolin_mine', name: 'Kaolin Mine', emoji: '⛏️',
    description: 'Rich veins of pure white kaolin clay stretch deep into the mountain\'s heart.',
    lore: 'The Kaolin Mine has produced the finest porcelain clay for over ten thousand years of continuous use.',
    level: 5, resources: ['kaolin_clay', 'feldspar', 'silica_sand'], capacity: 20,
    unlockLevel: 5, ambientColor: '#D7CCC8', dangerLevel: 3,
  },
  {
    id: 'jade_tunnel', name: 'Jade Tunnel', emoji: '🟢',
    description: 'Tunnels lined with glowing jade-green minerals pulse with ancient geomantic energy.',
    lore: 'Jade Tunnels were carved following natural jade veins, creating a luminous underground highway.',
    level: 10, resources: ['jade_fragment', 'nephrite', 'serpentine_stone'], capacity: 25,
    unlockLevel: 10, ambientColor: KA_JADE_GREEN, dangerLevel: 4,
  },
  {
    id: 'kiln_chamber', name: 'Ancient Kiln Chamber', emoji: '🔥',
    description: 'A massive ancient kiln still radiating residual heat from the last firing centuries ago.',
    lore: 'The Ancient Kiln Chamber was the original heart of ceramic creation in the cave, still warm to the touch.',
    level: 15, resources: ['kiln_shard', 'glaze_residue', 'fired_clay'], capacity: 30,
    unlockLevel: 15, ambientColor: KA_TERRACOTTA, dangerLevel: 5,
  },
  {
    id: 'terracotta_vault', name: 'Terracotta Vault', emoji: '🗿',
    description: 'A sealed vault containing an ancient terracotta army frozen in formation for eternity.',
    lore: 'The Terracotta Vault was sealed by the First Emperor to protect his army for future awakening.',
    level: 20, resources: ['terracotta_shard', 'ancient_glaze', 'bronze_inlay'], capacity: 35,
    unlockLevel: 20, ambientColor: '#CC5500', dangerLevel: 6,
  },
  {
    id: 'porcelain_sanctum', name: 'Porcelain Sanctum', emoji: '⛩️',
    description: 'The most sacred chamber where the finest porcelain was ever crafted by master artisans.',
    lore: 'Only those who have mastered all seven ceramic arts may enter the Porcelain Sanctum.',
    level: 30, resources: ['porcelain_dust', 'cobalt_oxide', 'gold_lustre'], capacity: 40,
    unlockLevel: 30, ambientColor: '#E8D5B7', dangerLevel: 7,
  },
  {
    id: 'abyssal_core', name: 'Abyssal Core', emoji: '🕳️',
    description: 'The deepest chamber, where raw earth energy crystallizes into legendary artifacts.',
    lore: 'The Abyssal Core is said to be the womb of the mountain itself, pulsing with life force.',
    level: 40, resources: ['abyssal_clay', 'void_crystal', 'primordial_fire'], capacity: 50,
    unlockLevel: 40, ambientColor: KA_DARK_CAVE, dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: KA_MATERIALS — 30 Materials (6 per tier)
// ============================================================

const KA_MATERIALS: KaMaterialDef[] = [
  // ── Common (6) ─────────────────────────────────────────────────
  {
    id: 'raw_clay', name: 'Raw Clay', emoji: '🟫', rarity: 'common', value: 5,
    category: 'clay', craftBonus: 1,
    description: 'Soft, malleable cave clay found near underground water sources.',
    lore: 'The most basic material in the cavern, raw clay is the foundation of all ceramic creation.',
  },
  {
    id: 'cave_water', name: 'Cave Water', emoji: '💧', rarity: 'common', value: 4,
    category: 'liquid', craftBonus: 1,
    description: 'Mineral-rich water dripping from cavern ceilings for thousands of years.',
    lore: 'Cave Water is naturally filtered through layers of rock and crystal, becoming incredibly pure.',
  },
  {
    id: 'pebble_stone', name: 'Pebble Stone', emoji: '🪨', rarity: 'common', value: 3,
    category: 'stone', craftBonus: 1,
    description: 'Smooth, rounded stones worn by underground streams over millennia.',
    lore: 'Pebble Stones are used as grinding tools and as decorative elements in basic clay work.',
  },
  {
    id: 'quartz_shard', name: 'Quartz Shard', emoji: '💠', rarity: 'common', value: 6,
    category: 'crystal', craftBonus: 2,
    description: 'A fragment of clear quartz with natural pointed tips and prismatic edges.',
    lore: 'Quartz Shards can cut through most cave materials, making them essential for crafting.',
  },
  {
    id: 'crystal_dust', name: 'Crystal Dust', emoji: '✨', rarity: 'common', value: 5,
    category: 'crystal', craftBonus: 2,
    description: 'Fine powder left behind by eroding crystal formations over centuries.',
    lore: 'Crystal Dust sprinkled on clay before firing creates beautiful sparkle effects.',
  },
  {
    id: 'calcite', name: 'Calcite', emoji: '⚪', rarity: 'common', value: 4,
    category: 'mineral', craftBonus: 1,
    description: 'A common cave mineral forming white crystalline deposits on chamber walls.',
    lore: 'Calcite formations are the cave\'s natural architecture, forming stalactites and stalagmites.',
  },

  // ── Uncommon (6) ────────────────────────────────────────────────
  {
    id: 'kaolin_clay', name: 'Kaolin Clay', emoji: '🤍', rarity: 'uncommon', value: 15,
    category: 'clay', craftBonus: 3,
    description: 'Premium white clay prized for its exceptional purity and plasticity.',
    lore: 'Kaolin Clay from this cave is considered the finest in the world for porcelain crafting.',
  },
  {
    id: 'feldspar', name: 'Feldspar', emoji: '🔶', rarity: 'uncommon', value: 12,
    category: 'mineral', craftBonus: 3,
    description: 'A key ingredient in ceramics, found in granite-rich cave walls.',
    lore: 'Feldspar acts as the flux that binds clay body and glaze together during firing.',
  },
  {
    id: 'silica_sand', name: 'Silica Sand', emoji: '⏳', rarity: 'uncommon', value: 14,
    category: 'stone', craftBonus: 2,
    description: 'Fine white sand used as a base material in glassmaking and glazes.',
    lore: 'Silica Sand from the kaolin mine is so pure it sparkles in direct torchlight.',
  },
  {
    id: 'jade_fragment', name: 'Jade Fragment', emoji: '💚', rarity: 'uncommon', value: 20,
    category: 'crystal', craftBonus: 4,
    description: 'A chip of green jade with an inner glow and natural energetic resonance.',
    lore: 'Jade Fragments are harvested from fallen spider webs in the Jade Tunnel.',
  },
  {
    id: 'nephrite', name: 'Nephrite', emoji: '🟩', rarity: 'uncommon', value: 18,
    category: 'crystal', craftBonus: 4,
    description: 'Tough, fibrous jade used in ancient carvings and amulet crafting.',
    lore: 'Nephrite was the preferred carving material of ancient cave artisans for its toughness.',
  },
  {
    id: 'serpentine_stone', name: 'Serpentine Stone', emoji: '🐍', rarity: 'uncommon', value: 16,
    category: 'mineral', craftBonus: 3,
    description: 'A green, waxy mineral resembling serpent skin with smooth texture.',
    lore: 'Serpentine Stone is believed to protect against snake venom and cave sickness.',
  },

  // ── Rare (6) ──────────────────────────────────────────────────
  {
    id: 'kiln_shard', name: 'Kiln Shard', emoji: '🔥', rarity: 'rare', value: 50,
    category: 'fire', craftBonus: 6,
    description: 'A fragment from an ancient kiln wall, still radiating gentle heat.',
    lore: 'Kiln Shards retain heat for decades and are used to jumpstart cold kilns.',
  },
  {
    id: 'glaze_residue', name: 'Glaze Residue', emoji: '🫧', rarity: 'rare', value: 55,
    category: 'clay', craftBonus: 7,
    description: 'Remnants of a long-lost ceramic glaze formula with unique chemical properties.',
    lore: 'Glaze Residue can reverse-engineer ancient glaze recipes when analyzed properly.',
  },
  {
    id: 'fired_clay', name: 'Fired Clay', emoji: '🧱', rarity: 'rare', value: 45,
    category: 'clay', craftBonus: 6,
    description: 'Clay permanently transformed by extreme heat into durable ceramic.',
    lore: 'Fired Clay is irreversible — once fired, it cannot be reshaped by water alone.',
  },
  {
    id: 'cobalt_oxide', name: 'Cobalt Oxide', emoji: '🔵', rarity: 'rare', value: 60,
    category: 'mineral', craftBonus: 7,
    description: 'The legendary blue pigment used in fine porcelain blue-and-white decoration.',
    lore: 'Cobalt Oxide was the most prized ceramic pigment, traded across the ancient world.',
  },
  {
    id: 'terracotta_shard', name: 'Terracotta Shard', emoji: '🟠', rarity: 'rare', value: 48,
    category: 'stone', craftBonus: 6,
    description: 'A piece of ancient terracotta with embedded mineral pigments still visible.',
    lore: 'Terracotta Shards reveal the color palette of ancient ceramic artisans when studied.',
  },
  {
    id: 'ancient_glaze', name: 'Ancient Glaze', emoji: '✨', rarity: 'rare', value: 65,
    category: 'clay', craftBonus: 8,
    description: 'A perfectly preserved sample of centuries-old ceramic glaze, still glossy.',
    lore: 'Ancient Glaze maintains its luster after thousands of years underground.',
  },

  // ── Epic (6) ─────────────────────────────────────────────────
  {
    id: 'porcelain_dust', name: 'Porcelain Dust', emoji: '🌸', rarity: 'epic', value: 150,
    category: 'clay', craftBonus: 12,
    description: 'Extremely fine powder from shattered imperial porcelain, shimmering with trapped light.',
    lore: 'Porcelain Dust is worth its weight in gold among surface porcelain collectors.',
  },
  {
    id: 'gold_lustre', name: 'Gold Lustre', emoji: '🟡', rarity: 'epic', value: 180,
    category: 'mineral', craftBonus: 14,
    description: 'A shimmering metallic glaze containing dissolved gold nanoparticles.',
    lore: 'Gold Lustre was the secret of imperial porcelain, creating the finest ceramics ever made.',
  },
  {
    id: 'bronze_inlay', name: 'Bronze Inlay', emoji: '🥉', rarity: 'epic', value: 160,
    category: 'metal', craftBonus: 10,
    description: 'Ancient bronze filigree meant for embedding into ceramics as decoration.',
    lore: 'Bronze Inlay details have survived intact while the ceramics around them crumbled.',
  },
  {
    id: 'void_crystal', name: 'Void Crystal', emoji: '🟣', rarity: 'epic', value: 200,
    category: 'crystal', craftBonus: 15,
    description: 'A crystal that absorbs all light, found only in the deepest abyssal chambers.',
    lore: 'Void Crystals pulse with an energy that exists between dimensions.',
  },
  {
    id: 'primordial_fire', name: 'Primordial Fire', emoji: '🔥', rarity: 'epic', value: 220,
    category: 'fire', craftBonus: 16,
    description: 'A captured ember from the first kiln, burning eternally without fuel.',
    lore: 'Primordial Fire was the spark that ignited all ceramic creation in the cave.',
  },
  {
    id: 'abyssal_clay', name: 'Abyssal Clay', emoji: '🖤', rarity: 'epic', value: 170,
    category: 'clay', craftBonus: 13,
    description: 'Clay from the deepest caves, infused with dark crystalline energy and void whispers.',
    lore: 'Abyssal Clay moves on its own at night, slowly reshaping chamber walls.',
  },

  // ── Legendary (6) ────────────────────────────────────────────
  {
    id: 'starlight_porcelain', name: 'Starlight Porcelain', emoji: '⭐', rarity: 'legendary', value: 600,
    category: 'clay', craftBonus: 25,
    description: 'Porcelain that glows with captured starlight, impossibly beautiful and rare.',
    lore: 'Starlight Porcelain can only be crafted during a full moon with crystal-clear skies above.',
  },
  {
    id: 'dragon_bone_jade', name: 'Dragon Bone Jade', emoji: '🦴', rarity: 'legendary', value: 700,
    category: 'crystal', craftBonus: 28,
    description: 'Jade crystallized around the fossilized bone of an ancient cave creature.',
    lore: 'Dragon Bone Jade is the hardest known form of jade, requiring dragon fire to shape.',
  },
  {
    id: 'eternal_kiln_core', name: 'Eternal Kiln Core', emoji: '☄️', rarity: 'legendary', value: 800,
    category: 'fire', craftBonus: 30,
    description: 'The heart of an ancient kiln that burns without fuel, created by the first crafters.',
    lore: 'The Eternal Kiln Core contains infinite fire, drawn from the earth\'s geothermal core.',
  },
  {
    id: 'mother_of_pearl_glaze', name: 'Mother of Pearl Glaze', emoji: '🫧', rarity: 'legendary', value: 650,
    category: 'clay', craftBonus: 26,
    description: 'An iridescent glaze mimicking mother of pearl, impossible to reproduce.',
    lore: 'Only one artisan has ever successfully applied Mother of Pearl Glaze, and the secret died with them.',
  },
  {
    id: 'time_crystal', name: 'Time Crystal', emoji: '⏰', rarity: 'legendary', value: 750,
    category: 'crystal', craftBonus: 28,
    description: 'A crystal that exists outside normal time, pulsing with temporal energy.',
    lore: 'Time Crystals cause nearby creatures to age differently — hours for some, years for others.',
  },
  {
    id: 'philosopher_clay', name: 'Philosopher Clay', emoji: '🔮', rarity: 'legendary', value: 900,
    category: 'clay', craftBonus: 32,
    description: 'Mythical clay said to transmute base materials into precious ceramics.',
    lore: 'Philosopher Clay is the legendary substance that transforms lead clay into gold porcelain.',
  },
];

// ============================================================
// SECTION 8: KA_STRUCTURES — 25 Structures (upgradeable to level 10)
// ============================================================

const KA_STRUCTURES: KaStructureDef[] = [
  // ── Crafting Structures (5) ────────────────────────────────────────
  {
    id: 'clay_workshop', name: 'Clay Workshop', emoji: '🏗️',
    description: 'A basic workshop for shaping raw clay into creature forms.',
    lore: 'Every master crafter in the Kaolin Cavern began at the Clay Workshop.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'crystal_forge', name: 'Crystal Forge', emoji: '🔨',
    description: 'Fuses crystal energy into creature armor and weapons for enhanced combat.',
    lore: 'The Crystal Forge harnesses piezoelectric energy from the cave walls.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'kiln_house', name: 'Kiln House', emoji: '🏠',
    description: 'An underground kiln for firing ceramic creatures to permanent hardness.',
    lore: 'The Kiln House controls temperature to within one degree of the ideal firing point.',
    baseCost: 60, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'xpBonus', bonusPerLevel: 2,
  },
  {
    id: 'kaolin_refinery', name: 'Kaolin Refinery', emoji: '🏭',
    description: 'Processes raw clay into premium kaolin for high-tier crafting.',
    lore: 'The Kaolin Refinery uses water-powered mills to achieve ultra-fine clay particles.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 5,
  },
  {
    id: 'porcelain_studio', name: 'Porcelain Studio', emoji: '🎨',
    description: 'A master studio for creating exquisite porcelain creatures with intricate designs.',
    lore: 'The Porcelain Studio is the most prestigious workshop, reserved for elite artisans.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'craftQuality', bonusPerLevel: 5,
  },

  // ── Defense Structures (5) ───────────────────────────────────────
  {
    id: 'jade_workshop', name: 'Jade Workshop', emoji: '💚',
    description: 'Polishes and enhances jade components for creature armor plating.',
    lore: 'Jade Workshop artisans spend decades mastering a single piece before selling it.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 3,
  },
  {
    id: 'terracotta_foundry', name: 'Terracotta Foundry', emoji: '🏺',
    description: 'Mass-produces terracotta guardians for cave defense and patrol.',
    lore: 'The Terracotta Foundry fires an army of guardians each lunar cycle.',
    baseCost: 130, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'storage_vault', name: 'Storage Vault', emoji: '🏛️',
    description: 'A secure underground vault for storing crafted creatures and rare materials.',
    lore: 'The Storage Vault uses crystal locks that only respond to the owner\'s biometric clay signature.',
    baseCost: 70, costMultiplier: 1.3, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'earthquake_sensor', name: 'Earthquake Sensor', emoji: '📡',
    description: 'Detects seismic activity to predict and prevent cave-in events.',
    lore: 'The Earthquake Sensor has predicted every major cave-in in the last century.',
    baseCost: 190, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 3,
  },
  {
    id: 'golem_assembly', name: 'Golem Assembly Line', emoji: '🤖',
    description: 'Automates the assembly of clay golem soldiers for mass production.',
    lore: 'The Golem Assembly Line can produce a basic clay golem in under three minutes.',
    baseCost: 280, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 5,
  },

  // ── Resource Structures (5) ──────────────────────────────────────
  {
    id: 'prospecting_post', name: 'Prospecting Post', emoji: '🔭',
    description: 'Scouts the cavern for hidden material deposits and new passages.',
    lore: 'Prospectors use crystal resonance to detect material veins through solid rock.',
    baseCost: 90, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 4,
  },
  {
    id: 'crystal_greenhouse', name: 'Crystal Greenhouse', emoji: '🌱',
    description: 'Grows artificial crystals accelerated by cave mineral deposits.',
    lore: 'The Crystal Greenhouse simulates deep-earth conditions to grow rare crystals faster.',
    baseCost: 110, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'crystalYield', bonusPerLevel: 6,
  },
  {
    id: 'spider_silk_farm', name: 'Spider Silk Farm', emoji: '🕸️',
    description: 'Harvests precious jade silk from domesticated jade spiders.',
    lore: 'Spider Silk Farms require gentle handling — jade spiders produce more silk when calm.',
    baseCost: 140, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 4,
  },
  {
    id: 'coin_mint', name: 'Coin Mint', emoji: '🪙',
    description: 'Mints coins from rare cave minerals and compressed clay.',
    lore: 'The Coin Mint presses ancient coins bearing the seal of the cave.',
    baseCost: 160, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'coinBonus', bonusPerLevel: 8,
  },
  {
    id: 'moonlight_well', name: 'Moonlight Well', emoji: '🌙',
    description: 'Collects moonlight filtering through cave cracks, converting it to energy.',
    lore: 'The Moonlight Well captures concentrated moonbeams at certain cave skylights.',
    baseCost: 240, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'energyBonus', bonusPerLevel: 6,
  },

  // ── Special Structures (5) ────────────────────────────────────────
  {
    id: 'glaze_laboratory', name: 'Glaze Laboratory', emoji: '🧪',
    description: 'Experiments with rare glazes to enhance creature abilities and effects.',
    lore: 'Glaze Laboratory experiments occasionally fail spectacularly, but the successes are legendary.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 3,
  },
  {
    id: 'dragon_nursery', name: 'Dragon Nursery', emoji: '🥚',
    description: 'Incubates ceramic dragon eggs to hatch powerful whelps for combat.',
    lore: 'The Dragon Nursery keeps eggs warm in volcanic nests until they hatch.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 5,
  },
  {
    id: 'fairy_garden', name: 'Fairy Garden', emoji: '🌸',
    description: 'A tranquil garden nurturing porcelain fairies to full potential.',
    lore: 'Porcelain fairies in the Fairy Garden grow stronger when surrounded by flowers.',
    baseCost: 170, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'healingBonus', bonusPerLevel: 3,
  },
  {
    id: 'artifact_shrine', name: 'Artifact Shrine', emoji: '⛩️',
    description: 'A sacred shrine that amplifies artifact power and unlocks hidden properties.',
    lore: 'The Artifact Shrine is the most ancient structure, predating even the first kiln.',
    baseCost: 300, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'artifactBonus', bonusPerLevel: 6,
  },
  {
    id: 'abyssal_lighthouse', name: 'Abyssal Lighthouse', emoji: '🔦',
    description: 'Illuminates the deepest chambers, revealing hidden paths and secret chambers.',
    lore: 'The Abyssal Lighthouse beam penetrates up to 500 meters of solid rock.',
    baseCost: 220, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: KA_ABILITIES — 22 Abilities
// ============================================================

const KA_ABILITIES: KaAbilityDef[] = [
  // ── Offensive (6) ────────────────────────────────────────────────
  {
    id: 'clay_cannon', name: 'Clay Cannon', category: 'offensive',
    description: 'Launches a high-pressure ball of compressed clay at enemies, dealing heavy damage.',
    lore: 'Clay Cannons were the primary weapon of ancient cave defenders against surface invaders.',
    emoji: '💥', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'crystal_shatter', name: 'Crystal Shatter', category: 'offensive',
    description: 'Detonates crystal shards in a devastating area explosion, damaging all nearby foes.',
    lore: 'Crystal Shatter is devastating but dangerous — friendly creatures can be caught in the blast.',
    emoji: '💎', cooldown: 8000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'dragon_breath', name: 'Dragon Breath', category: 'offensive',
    description: 'Unleashes a searing beam of kiln-fire from a ceramic dragon, melting armor.',
    lore: 'Dragon Breath is so hot it can melt through solid rock in seconds.',
    emoji: '🔥', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },
  {
    id: 'jade_storm', name: 'Jade Storm', category: 'offensive',
    description: 'Summons a whirlwind of razor-sharp jade fragments, shredding everything in range.',
    lore: 'Jade Storm was invented by the Jade Emperor Spider as a territorial display.',
    emoji: '🌪️', cooldown: 10000, power: 65, rarityRequired: 'rare',
  },
  {
    id: 'spider_ambush', name: 'Spider Ambush', category: 'offensive',
    description: 'Jade spiders coordinate a synchronized venom strike from multiple angles.',
    lore: 'Spider Ambush relies on pheromone coordination between spider colonies.',
    emoji: '🕷️', cooldown: 7000, power: 45, rarityRequired: 'uncommon',
  },
  {
    id: 'terracotta_charge', name: 'Terracotta Charge', category: 'offensive',
    description: 'A terracotta golem charges forward with unstoppable momentum, crushing obstacles.',
    lore: 'Terracotta Charges can knock down reinforced chamber doors.',
    emoji: '🗿', cooldown: 6000, power: 40, rarityRequired: 'uncommon',
  },

  // ── Defensive (5) ──────────────────────────────────────────────
  {
    id: 'clay_wall', name: 'Clay Wall', category: 'defensive',
    description: 'Raises a thick wall of compacted clay for protection against attacks.',
    lore: 'Clay Walls harden under pressure, becoming nearly as strong as stone.',
    emoji: '🧱', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'porcelain_shield', name: 'Porcelain Shield', category: 'defensive',
    description: 'Deploys a shimmering porcelain barrier that deflects all incoming damage types.',
    lore: 'Porcelain Shields resonate with impact energy, converting it into healing light.',
    emoji: '🛡️', cooldown: 10000, power: 50, rarityRequired: 'rare',
  },
  {
    id: 'crystal_armor', name: 'Crystal Armor', category: 'defensive',
    description: 'Encases all allies in protective crystal formations that absorb damage.',
    lore: 'Crystal Armor is transparent but denser than diamond — invisible protection.',
    emoji: '💠', cooldown: 15000, power: 70, rarityRequired: 'epic',
  },
  {
    id: 'golem_fortress', name: 'Golem Fortress', category: 'defensive',
    description: 'Clay golems interlock to form an impenetrable fortress wall.',
    lore: 'Golem Fortress mode requires at least 5 clay golems to activate.',
    emoji: '🏰', cooldown: 20000, power: 90, rarityRequired: 'legendary',
  },
  {
    id: 'jade_veil', name: 'Jade Veil', category: 'defensive',
    description: 'A web of jade-green energy absorbs incoming attacks and heals the weaver.',
    lore: 'The Jade Veil is the jade spider\'s ultimate defensive ability.',
    emoji: '🟢', cooldown: 12000, power: 60, rarityRequired: 'epic',
  },

  // ── Utility (6) ─────────────────────────────────────────────────
  {
    id: 'sonar_ping', name: 'Sonar Ping', category: 'utility',
    description: 'Emits a crystal sound wave to reveal hidden passages and secret chambers.',
    lore: 'Sonar Ping was invented by crystal miners who needed to see through solid rock.',
    emoji: '📡', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'fairy_light', name: 'Fairy Light', category: 'utility',
    description: 'Porcelain fairies illuminate the cavern, boosting exploration speed and XP gains.',
    lore: 'Fairy Light makes exploration 50% faster by revealing the shortest paths.',
    emoji: '🧚', cooldown: 5000, power: 15, rarityRequired: 'common',
  },
  {
    id: 'beetle_carry', name: 'Beetle Carry', category: 'utility',
    description: 'Kaolin beetles transport heavy materials across the cave system efficiently.',
    lore: 'Beetle Carry can move 200 kg of materials per trip through narrow tunnels.',
    emoji: '🪲', cooldown: 4000, power: 12, rarityRequired: 'common',
  },
  {
    id: 'crystal_resonance', name: 'Crystal Resonance', category: 'utility',
    description: 'Harmonizes crystal frequencies to reveal rare resource deposits on the map.',
    lore: 'Crystal Resonance causes nearby crystals to glow when a deposit is nearby.',
    emoji: '🔔', cooldown: 6000, power: 20, rarityRequired: 'uncommon',
  },
  {
    id: 'kiln_accelerate', name: 'Kiln Accelerate', category: 'utility',
    description: 'Temporarily boosts all crafting speeds across the cavern system.',
    lore: 'Kiln Accelerate draws extra heat from the earth to speed up all kilns simultaneously.',
    emoji: '🔥', cooldown: 30000, power: 25, rarityRequired: 'rare',
  },
  {
    id: 'void_step', name: 'Void Step', category: 'utility',
    description: 'Teleports a short distance through the void between chambers instantly.',
    lore: 'Void Step leaves a brief afterimage that startles hostile cave creatures.',
    emoji: '🌀', cooldown: 8000, power: 18, rarityRequired: 'rare',
  },

  // ── Summon (5) ────────────────────────────────────────────────
  {
    id: 'clay_summon', name: 'Clay Summon', category: 'summon',
    description: 'Temporarily conjures a basic clay golem from surrounding cave earth.',
    lore: 'Clay Summon draws clay from the walls, creating a golem that lasts one minute.',
    emoji: '🏺', cooldown: 20000, power: 40, rarityRequired: 'common',
  },
  {
    id: 'fairy_circle', name: 'Fairy Circle', category: 'summon',
    description: 'Summons a swarm of porcelain fairies to assist in crafting and healing.',
    lore: 'Fairy Circles only form where wildflowers grow underground.',
    emoji: '🧚', cooldown: 25000, power: 35, rarityRequired: 'uncommon',
  },
  {
    id: 'dragon_call', name: 'Dragon Call', category: 'summon',
    description: 'Calls a ceramic dragon whelp to join the party temporarily.',
    lore: 'Dragon Call can only be answered by a dragon that recognizes the caller.',
    emoji: '🐉', cooldown: 30000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'spider_horde', name: 'Spider Horde', category: 'summon',
    description: 'Releases hundreds of jade spiders from hidden nests throughout the cave.',
    lore: 'Spider Horde triggers a massive wave that overwhelms even the largest threats.',
    emoji: '🕷️', cooldown: 22000, power: 45, rarityRequired: 'uncommon',
  },
  {
    id: 'terracotta_army', name: 'Terracotta Army', category: 'summon',
    description: 'Awakens a squad of terracotta soldiers from the ancient vault.',
    lore: 'Terracotta Army awakens the vault army — a force of 7,000 soldiers.',
    emoji: '🗿', cooldown: 45000, power: 80, rarityRequired: 'legendary',
  },
];

// ============================================================
// SECTION 10: KA_ACHIEVEMENTS — 18 Achievements
// ============================================================

const KA_ACHIEVEMENTS: KaAchievementDef[] = [
  {
    id: 'ach_first_craft', name: 'First Firing', emoji: '🏺',
    description: 'Craft your first clay creature and feel the warmth of creation.',
    conditionKey: 'totalCrafted', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_craft_10', name: 'Apprentice Potter', emoji: '🔨',
    description: 'Craft 10 clay creatures total and establish your workshop reputation.',
    conditionKey: 'totalCrafted', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_craft_50', name: 'Master Craftsman', emoji: '🏅',
    description: 'Craft 50 clay creatures and earn the respect of the cavern elders.',
    conditionKey: 'totalCrafted', targetValue: 50, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_craft_100', name: 'Grand Artisan', emoji: '🏆',
    description: 'Craft 100 clay creatures to achieve legendary artisan status.',
    conditionKey: 'totalCrafted', targetValue: 100, rewardXp: 2000, rewardCoins: 200,
  },
  {
    id: 'ach_explore_3', name: 'Cave Diver', emoji: '🔦',
    description: 'Discover 3 different cave chambers in the underground.',
    conditionKey: 'totalCrystals', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_explore_5', name: 'Pathfinder', emoji: '🧭',
    description: 'Discover 5 different cave chambers and chart the cave system.',
    conditionKey: 'totalCrystals', targetValue: 5, rewardXp: 200, rewardCoins: 25,
  },
  {
    id: 'ach_explore_all', name: 'Cartographer', emoji: '🗺️',
    description: 'Explore all 8 cave chambers and complete the cave map.',
    conditionKey: 'totalCrystals', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_5', name: 'Builder', emoji: '🏗️',
    description: 'Build 5 different structures to establish your underground base.',
    conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_max_structure', name: 'Architect', emoji: '🏰',
    description: 'Upgrade any structure to the maximum level 10.',
    conditionKey: 'totalStructuresBuilt', targetValue: 50, rewardXp: 600, rewardCoins: 40,
  },
  {
    id: 'ach_rare_creature', name: 'Rare Find', emoji: '💎',
    description: 'Craft a rare or higher tier creature for the first time.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 250, rewardCoins: 25,
  },
  {
    id: 'ach_legendary_creature', name: 'Legend Forged', emoji: '⭐',
    description: 'Craft a legendary creature and etch your name in the Eternal Kiln.',
    conditionKey: 'totalArtifacts', targetValue: 5, rewardXp: 2000, rewardCoins: 100,
  },
  {
    id: 'ach_7_species', name: 'Complete Collection', emoji: '📋',
    description: 'Own at least one creature of every species across all rarities.',
    conditionKey: 'totalEvents', targetValue: 7, rewardXp: 500, rewardCoins: 50,
  },
  {
    id: 'ach_artifact_1', name: 'Artifact Hunter', emoji: '🏺',
    description: 'Activate your first ancient artifact and unlock its hidden power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Cave Survivor', emoji: '🌋',
    description: 'Survive 5 random cave events without being defeated.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_10', name: 'Apprentice Explorer', emoji: '📈',
    description: 'Reach explorer level 10 and prove your readiness for deeper caves.',
    conditionKey: 'totalXp', targetValue: 1000, rewardXp: 200, rewardCoins: 15,
  },
  {
    id: 'ach_level_25', name: 'Seasoned Spelunker', emoji: '🧗',
    description: 'Reach explorer level 25 and gain access to the deepest chambers.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Cavern Master', emoji: '👑',
    description: 'Reach the maximum explorer level 50 and master the entire cave.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: KA_TITLES — 8 Title Progression
// ============================================================

const KA_TITLES: KaTitleDef[] = [
  {
    id: 'title_clay_novice', name: 'Clay Novice', emoji: '🏺',
    description: 'A newcomer to the kaolin caverns, eager to learn the ancient art of ceramics.',
    lore: 'Every master was once a novice, shaping their first lump of clay with trembling hands.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_pit_apprentice', name: 'Pit Apprentice', emoji: '🔥',
    description: 'Learning to shape clay in the warm glow of the ancient kiln chambers.',
    lore: 'Pit Apprentices spend years mastering the feel of different clay bodies.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_kiln_tender', name: 'Kiln Tender', emoji: '🔥',
    description: 'Skilled at maintaining the ancient kilns that fire the cavern\'s creations.',
    lore: 'Kiln Tenders know the exact temperature for every type of ceramic firing.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_crystal_carver', name: 'Crystal Carver', emoji: '💎',
    description: 'Shapes raw crystal into beautiful and deadly creature augmentations.',
    lore: 'Crystal Carvers see patterns in rough crystal that others cannot perceive.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_jade_weaver', name: 'Jade Weaver', emoji: '💚',
    description: 'Master of jade-green silk and stone, weaving protection for all cave creatures.',
    lore: 'Jade Weavers can spin threads thin enough to pass through a needle\'s eye.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_terracotta_commander', name: 'Terracotta Commander', emoji: '🗿',
    description: 'Commands an army of terracotta guardians across the underground.',
    lore: 'Terracotta Commanders give orders that reverberate through the entire cave.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_porcelain_sage', name: 'Porcelain Sage', emoji: '🧚',
    description: 'A master of porcelain who understands the soul of clay itself.',
    lore: 'Porcelain Sages achieve a meditative state when shaping, creating perfect forms.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_cavern_dragon_lord', name: 'Cavern Dragon Lord', emoji: '🐉',
    description: 'The supreme ruler of the kaolin cavern, riding the Eternal Kiln Dragon.',
    lore: 'Only the Cavern Dragon Lord has tamed the Dragon of the Eternal Kiln.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: KA_ARTIFACTS — 6 Artifacts
// ============================================================

const KA_ARTIFACTS: KaArtifactDef[] = [
  {
    id: 'art_jade_compass', name: 'Jade Compass',
    description: 'An ancient compass carved from a single piece of nephrite jade, pointing to hidden chambers.',
    lore: 'The Jade Compass was found embedded in the skull of a jade spider elder. It spins toward the nearest unexplored chamber.',
    emoji: '🧭', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_porcelain_mask', name: 'Porcelain Mask',
    description: 'A ritual mask of white porcelain that reveals hidden creatures and cave spirits.',
    lore: 'The Porcelain Mask was worn by ancient diviners to see beyond the veil of solid rock.',
    emoji: '🎭', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_crystal_orb', name: 'Crystal Orb',
    description: 'A flawless crystal sphere that pulses with concentrated cavern energy.',
    lore: 'The Crystal Orb acts as a scrying tool, showing what happens in distant chambers.',
    emoji: '🔮', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_terracotta_tablet', name: 'Terracotta Tablet',
    description: 'An ancient tablet inscribed with forgotten ceramic recipes and secret techniques.',
    lore: 'The Terracotta Tablet contains recipes for legendary glazes and creature enhancements.',
    emoji: '📜', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_dragon_crown', name: 'Dragon Crown',
    description: 'A crown forged from the scales of the Eternal Kiln Dragon.',
    lore: 'The Dragon Crown grants its wearer telepathic control over ceramic dragons.',
    emoji: '👑', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_primordial_core', name: 'Primordial Core',
    description: 'The crystallized heart of the first clay ever shaped by human hands.',
    lore: 'The Primordial Core contains the original creative impulse of all ceramics.',
    emoji: '💎', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: KA_EVENTS — 8 Random Cave Events
// ============================================================

const KA_EVENTS: KaEventDef[] = [
  {
    id: 'evt_cave_in', name: 'Cave-In',
    description: 'The cavern shakes violently! Boulders fall from the ceiling, blocking passages and damaging structures.',
    lore: 'Cave-ins are terrifying but natural — they open new passages when the dust settles.',
    emoji: '🪨', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'fired_clay', rewardMaterialCount: 3,
  },
  {
    id: 'evt_crystal_surge', name: 'Crystal Surge',
    description: 'A burst of crystal energy sweeps through the chamber, empowering all creatures temporarily.',
    lore: 'Crystal Surges happen during seismic activity, when crystals release stored piezoelectric charge.',
    emoji: '💎', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'crystal_dust', rewardMaterialCount: 5,
  },
  {
    id: 'evt_underground_spring', name: 'Underground Spring',
    description: 'A new spring bursts from the walls, revealing fresh clay deposits.',
    lore: 'Underground Springs are considered lucky — they bring both water and kaolin clay.',
    emoji: '💧', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'raw_clay', rewardMaterialCount: 8,
  },
  {
    id: 'evt_ancient_echo', name: 'Ancient Echo',
    description: 'Voices from the past echo through the tunnels, granting forgotten knowledge.',
    lore: 'Ancient Echoes are believed to be the memories of long-departed artisans.',
    emoji: '📣', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 0,
    rewardMaterialId: 'ancient_glaze', rewardMaterialCount: 2,
  },
  {
    id: 'evt_magma_seep', name: 'Magma Seep',
    description: 'Hot magma seeps through cracks, damaging some structures but enriching others.',
    lore: 'Magma Seeps are dangerous but beneficial — they fire nearby clay to higher quality.',
    emoji: '🌋', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'kiln_shard', rewardMaterialCount: 4,
  },
  {
    id: 'evt_fairy_swarm', name: 'Fairy Swarm',
    description: 'A swarm of wild porcelain fairies descends, dropping rare materials.',
    lore: 'Fairy Swarms are celebrations — fairies dance when the cave is happy.',
    emoji: '🧚', effectType: 'buff', duration: 20000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'porcelain_dust', rewardMaterialCount: 3,
  },
  {
    id: 'evt_void_tremor', name: 'Void Tremor',
    description: 'The fabric of reality shudders as the void below pulses with energy.',
    lore: 'Void Tremors are the rarest and most dangerous cave event.',
    emoji: '🌀', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'void_crystal', rewardMaterialCount: 1,
  },
  {
    id: 'evt_dragon_roar', name: 'Dragon Roar',
    description: 'A distant dragon roar echoes through the cavern, exciting all creatures to action.',
    lore: 'Dragon Roars strengthen every creature in the cave for a short duration.',
    emoji: '🐉', effectType: 'buff', duration: 25000, rewardXp: 45, rewardCoins: 20,
    rewardMaterialId: 'fired_clay', rewardMaterialCount: 5,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function kaGenerateInstanceId(): string {
  return `ka_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function kaPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function kaCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function kaCalculateLevelUp(needed: number, current: number, gained: number, setLevel: (v: number) => void): number {
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

export default function useKaolinCavern() {
  // ---- Core State ----
  const [kaLevel, setKaLevel] = useState(1);
  const [kaXp, setKaXp] = useState(KA_STARTING_XP);
  const [kaCoins, setKaCoins] = useState(KA_STARTING_COINS);
  const [kaTotalXp, setKaTotalXp] = useState(0);
  const [kaTotalCoins, setKaTotalCoins] = useState(0);

  // ---- Collection State ----
  const [kaGolems, setKaGolems] = useState<KaOwnedCreature[]>([]);
  const [kaInventory, setKaInventory] = useState<KaInventoryItem[]>([]);
  const [kaStructures, setKaStructures] = useState<KaStructureRecord[]>([]);
  const [kaArtifacts, setKaArtifacts] = useState<KaArtifactRecord[]>([]);
  const [kaAbilities, setKaAbilities] = useState<KaAbilityRecord[]>([]);
  const [kaAchievements, setKaAchievements] = useState<KaAchievementRecord[]>([]);
  const [kaChambers, setKaChambers] = useState<KaChamberRecord[]>([]);
  const [kaEventLog, setKaEventLog] = useState<KaEventLogEntry[]>([]);
  const [kaActiveEvent, setKaActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [kaCurrentTitle, setKaCurrentTitle] = useState('title_clay_novice');

  // ---- Stats State ----
  const [kaStats, setKaStats] = useState<KaStats>({
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

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Load saved state from localStorage
    try {
      const saved = localStorage.getItem(KA_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.kaLevel) setKaLevel(data.kaLevel);
        if (data.kaXp) setKaXp(data.kaXp);
        if (data.kaCoins) setKaCoins(data.kaCoins);
        if (data.kaTotalXp) setKaTotalXp(data.kaTotalXp);
        if (data.kaTotalCoins) setKaTotalCoins(data.kaTotalCoins);
        if (data.kaGolems) setKaGolems(data.kaGolems);
        if (data.kaInventory) setKaInventory(data.kaInventory);
        if (data.kaStructures) setKaStructures(data.kaStructures);
        if (data.kaArtifacts) setKaArtifacts(data.kaArtifacts);
        if (data.kaAbilities) setKaAbilities(data.kaAbilities);
        if (data.kaAchievements) setKaAchievements(data.kaAchievements);
        if (data.kaChambers) setKaChambers(data.kaChambers);
        if (data.kaEventLog) setKaEventLog(data.kaEventLog);
        if (data.kaActiveEvent) setKaActiveEvent(data.kaActiveEvent);
        if (data.kaCurrentTitle) setKaCurrentTitle(data.kaCurrentTitle);
        if (data.kaStats) setKaStats(data.kaStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    // Initialize from scratch
    setKaChambers(
      KA_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setKaAbilities(
      KA_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setKaAchievements(
      KA_ACHIEVEMENTS.map((a) => ({
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
          kaLevel, kaXp, kaCoins, kaTotalXp, kaTotalCoins,
          kaGolems, kaInventory, kaStructures, kaArtifacts,
          kaAbilities, kaAchievements, kaChambers, kaEventLog,
          kaActiveEvent, kaCurrentTitle, kaStats,
        };
        localStorage.setItem(KA_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, KA_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [kaLevel, kaXp, kaCoins, kaTotalXp, kaTotalCoins,
    kaGolems, kaInventory, kaStructures, kaArtifacts,
    kaAbilities, kaAchievements, kaChambers, kaEventLog,
    kaActiveEvent, kaCurrentTitle, kaStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!kaActiveEvent) return;
    const evt = KA_EVENTS.find((e) => e.id === kaActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setKaActiveEvent(null);
      setKaEventLog((prev) =>
        prev.map((e) => (e.eventId === kaActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [kaActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...KA_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => kaLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === kaCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setKaCurrentTitle(nextTitle.id);
    }
  }, [kaLevel, kaCurrentTitle]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(KA_XP_BASE * Math.pow(lvl, KA_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(kaLevel + 1);
    return Math.max(0, needed - kaXp);
  }, [kaLevel, kaXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(kaLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((kaXp / needed) * 100), 100);
  }, [kaLevel, kaXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): KaCreatureDef | undefined => {
    return KA_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): KaChamberDef | undefined => {
    return KA_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): KaMaterialDef | undefined => {
    return KA_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): KaStructureDef | undefined => {
    return KA_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): KaAbilityDef | undefined => {
    return KA_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): KaArtifactDef | undefined => {
    return KA_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): KaAchievementDef | undefined => {
    return KA_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): KaTitleDef | undefined => {
    return KA_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): KaEventDef | undefined => {
    return KA_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: KaRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rarity': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: KaRarity): string => {
    return KA_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: KaSpecies): string => {
    return KA_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: craftCreature
  // ============================================================

  const craftCreature = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (kaCoins < def.cost) return false;

    const newCreature: KaOwnedCreature = {
      creatureId: def.id,
      instanceId: kaGenerateInstanceId(),
      craftedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setKaCoins((prev) => prev - def.cost);
    setKaGolems((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = kaCalculateLevelUp(
      xpForLevel(kaLevel + 1),
      kaXp,
      xpGained,
      setKaLevel,
    );
    setKaXp(overflow);
    setKaTotalXp((prev) => prev + xpGained);
    setKaTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setKaStats((prev) => ({ ...prev, totalCrafted: prev.totalCrafted + 1 }));
    return true;
  }, [kaCoins, kaLevel, kaXp, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreChamber
  // ============================================================

  const exploreChamber = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (kaLevel < def.unlockLevel) return false;

    setKaChambers((prev) =>
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

    // Add resources from chamber to inventory
    const bonusMat = kaPickRandom(def.resources);
    if (bonusMat) {
      setKaInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat ? { ...i, count: i.count + 1 } : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setKaTotalXp((prev) => prev + 15);
    setKaTotalCoins((prev) => prev + 5);
    setKaStats((prev) => ({ ...prev, totalCrystals: prev.totalCrystals + 1 }));
    return true;
  }, [kaLevel, getChamberDef, kaInventory]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = kaStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = kaCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (kaCoins < cost) return false;

    setKaCoins((prev) => prev - cost);
    setKaStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setKaTotalXp((prev) => prev + 20);
    setKaStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [kaCoins, kaStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (kaCoins < def.cost) return false;
    if (kaArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setKaCoins((prev) => prev - def.cost);
    setKaArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setKaTotalXp((prev) => prev + 100);
    setKaStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [kaCoins, kaArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerCaveEvent
  // ============================================================

  const triggerCaveEvent = useCallback((): KaEventDef | null => {
    if (kaActiveEvent) return null;
    const event = kaPickRandom(KA_EVENTS);
    setKaActiveEvent(event.id);
    setKaEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setKaTotalXp((prev) => prev + event.rewardXp);
    setKaCoins((prev) => prev + event.rewardCoins);
    setKaTotalCoins((prev) => prev + event.rewardCoins);

    // Add event material reward to inventory
    if (event.rewardMaterialId) {
      setKaInventory((prev) => {
        const existing = prev.find((i) => i.materialId === event.rewardMaterialId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === event.rewardMaterialId
              ? { ...i, count: i.count + event.rewardMaterialCount }
              : i,
          );
        }
        return [...prev, { materialId: event.rewardMaterialId, count: event.rewardMaterialCount }];
      });
    }

    return event;
  }, [kaActiveEvent, kaInventory]);

  // ============================================================
  // CORE ACTION: resetKaolinCavern
  // ============================================================

  const resetKaolinCavern = useCallback(() => {
    setKaLevel(1);
    setKaXp(0);
    setKaCoins(KA_STARTING_COINS);
    setKaTotalXp(0);
    setKaTotalCoins(0);
    setKaGolems([]);
    setKaInventory([]);
    setKaStructures([]);
    setKaArtifacts([]);
    setKaAbilities(
      KA_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setKaAchievements(
      KA_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setKaChambers(
      KA_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setKaEventLog([]);
    setKaActiveEvent(null);
    setKaCurrentTitle('title_clay_novice');
    setKaStats({
      totalCrafted: 0, totalCrystals: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(KA_SAVE_KEY); } catch { /* silent */ }
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
    setKaStats((currentStats) => {
      setKaAchievements((prev) => {
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
            setKaTotalXp((xp) => xp + def.rewardXp);
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
    const record = kaAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setKaAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setKaTotalXp((prev) => prev + 5);
    return true;
  }, [kaAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const kaTitleProgress = useMemo((): KaTitleProgress => {
    const sorted = [...KA_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === kaCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === kaCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((kaLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [kaLevel, kaCurrentTitle]);

  const currentTitleInfo = useMemo(() => kaTitleProgress.current, [kaTitleProgress]);

  const nextTitleInfo = useMemo(() => kaTitleProgress.next, [kaTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesCrafted: kaGolems.length,
    chambersExplored: kaChambers.filter((c) => c.discovered).length,
    structuresBuilt: kaStructures.length,
    artifactsActive: kaArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: kaAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: kaAbilities.filter((a) => a.unlocked).length,
    totalXp: kaTotalXp,
    totalCoins: kaTotalCoins,
    currentLevel: kaLevel,
    ownedSpeciesCount: new Set(kaGolems.map((g) => {
      const d = KA_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: kaEventLog.length,
  }), [kaGolems, kaChambers, kaStructures, kaArtifacts,
    kaAchievements, kaAbilities, kaTotalXp, kaTotalCoins, kaLevel, kaEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      KA_CREATURES.length +
      KA_CHAMBERS.length +
      KA_STRUCTURES.length +
      KA_ARTIFACTS.length +
      KA_ACHIEVEMENTS.length +
      KA_ABILITIES.length;
    const completed =
      kaGolems.length +
      kaChambers.filter((c) => c.discovered).length +
      kaStructures.length +
      kaArtifacts.filter((a) => a.activated).length +
      kaAchievements.filter((a) => a.unlocked).length +
      kaAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((kaGolems.length / KA_CREATURES.length) * 100),
      chamberPercent: Math.round((kaChambers.filter((c) => c.discovered).length / KA_CHAMBERS.length) * 100),
      structurePercent: Math.round((kaStructures.length / KA_STRUCTURES.length) * 100),
      artifactPercent: Math.round((kaArtifacts.filter((a) => a.activated).length / KA_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((kaAchievements.filter((a) => a.unlocked).length / KA_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((kaAbilities.filter((a) => a.unlocked).length / KA_ABILITIES.length) * 100),
    };
  }, [kaGolems, kaChambers, kaStructures, kaArtifacts, kaAchievements, kaAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    kaGolems.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [kaGolems, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    kaChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [kaChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    kaStructures.map((s) => ({
      ...s,
      def: getStructureDef(s.structureId),
      totalUpgrades: s.totalUpgrades,
      currentCost: kaCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      nextUpgradeCost: kaCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      bonusProvided: s.level * (getStructureDef(s.structureId)?.bonusPerLevel || 0),
    })),
  [kaStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    kaInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  );

  const enrichedArtifacts = useMemo(() =>
    kaArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [kaArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    kaAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [kaAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, typeof kaGolems> = {};
    for (const species of KA_SPECIES) {
      result[species.id] = kaGolems.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [kaGolems, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: KaRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, typeof kaGolems> = {};
    for (const r of rarities) {
      result[r] = kaGolems.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [kaGolems, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return KA_CREATURES.filter((c) => c.cost <= kaCoins);
  }, [kaCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalCrafted: kaStats.totalCrafted,
      totalCrystals: kaStats.totalCrystals,
      totalStructuresBuilt: kaStats.totalStructuresBuilt,
      totalArtifacts: kaStats.totalArtifacts,
      totalEvents: kaStats.totalEvents,
      totalCoins: kaStats.totalCoins,
      totalXp: kaStats.totalXp,
    };
    return KA_ACHIEVEMENTS.filter(
      (a) =>
        !kaAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [kaStats, kaAchievements]);

  const recentEventLog = useMemo(() => {
    return [...kaEventLog].reverse().slice(0, 10);
  }, [kaEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...kaGolems]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [kaGolems, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of kaGolems) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [kaGolems, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of kaChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [kaChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of kaStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [kaStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of kaAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [kaAbilities]);

  // ============================================================
  // RETURN — Pattern A: all constants directly on the API object
  // ============================================================

  return {
    // ---- Color Theme ----
    KA_CLAY_WHITE,
    KA_CRYSTAL_BLUE,
    KA_TERRACOTTA,
    KA_JADE_GREEN,
    KA_DARK_CAVE,
    KA_SURFACE,
    KA_RARITY_COLORS,
    KA_SPECIES_COLORS,

    // ---- Data Constants ----
    KA_SPECIES,
    KA_CREATURES,
    KA_CHAMBERS,
    KA_MATERIALS,
    KA_STRUCTURES,
    KA_ABILITIES,
    KA_ACHIEVEMENTS,
    KA_TITLES,
    KA_ARTIFACTS,
    KA_EVENTS,
    KA_MAX_LEVEL,
    KA_SAVE_KEY,
    KA_XP_BASE,
    KA_XP_SCALE,

    // ---- State ----
    kaLevel,
    kaXp,
    kaCoins,
    kaTotalXp,
    kaTotalCoins,
    kaGolems,
    kaInventory,
    kaStructures,
    kaArtifacts,
    kaAbilities,
    kaAchievements,
    kaChambers,
    kaEventLog,
    kaActiveEvent,
    kaCurrentTitle,
    kaStats,

    // ---- Core Actions ----
    craftCreature,
    exploreChamber,
    buildStructure,
    activateArtifact,
    triggerCaveEvent,
    resetKaolinCavern,

    // ---- Extended Actions ----
    discoverChamber,
    checkAndClaimAchievements,
    useAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    kaTitleProgress,

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
