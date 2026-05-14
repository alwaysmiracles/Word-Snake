import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Silk Dynasty (丝绸王朝) — Wire Module
// A React hook-based module for the Word Snake game where players are master
// silk weavers who command weaver spirits, tend silkworm creatures, and build
// legendary loom pavilions across a magnificent kimono dynasty.
//
// Theme: Royal crimson, silk white, jade green, gold thread, ink black,
//        imperial purple — a world of shimmering threads and ancient looms.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Type Definitions ────────────────────────────────────────────────────────

type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type AbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

interface Weaver {
  id: number;
  name: string;
  species: string;
  description: string;
  rarity: RarityTier;
  emoji: string;
  power: number;
  cost: number;
  xpReward: number;
  recruited: boolean;
  loyalty: number;
  recruitedAt: number | null;
}

interface Loom {
  id: number;
  name: string;
  description: string;
  emoji: string;
  level: number;
  resources: string;
  capacity: number;
  unlockLevel: number;
  unlocked: boolean;
  upgradeCost: number;
}

interface SilkMaterial {
  id: number;
  name: string;
  description: string;
  rarity: RarityTier;
  category: string;
  quantity: number;
  maxQuantity: number;
  effect: string;
  effectValue: number;
}

interface Structure {
  id: number;
  name: string;
  description: string;
  emoji: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  bonusType: string;
  bonusValue: number;
  upgradeCost: number;
}

interface SilkAbility {
  id: number;
  name: string;
  description: string;
  category: AbilityCategory;
  cooldown: number;
  currentCooldown: number;
  unlocked: boolean;
  silkCost: number;
  powerMultiplier: number;
  tier: number;
}

interface SilkAchievement {
  id: number;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  progress: number;
  completed: boolean;
  rewardXp: number;
  icon: string;
  unlockedAt: number | null;
}

interface DynastyTitle {
  name: string;
  threshold: number;
}

interface SilkArtifact {
  id: number;
  name: string;
  description: string;
  rarity: RarityTier;
  emoji: string;
  power: number;
  activated: boolean;
  activatedAt: number | null;
}

interface DynastyEvent {
  id: number;
  name: string;
  description: string;
  emoji: string;
  effectType: string;
  effectValue: number;
  duration: number;
  triggered: boolean;
  triggeredAt: number | null;
}

interface DailyChallenge {
  weaverId: number;
  challenge: string;
  reward: number;
  completed: boolean;
  expiresAt: number;
  bonusSpecies: string;
}

interface LogEntry {
  timestamp: number;
  message: string;
  type: 'weave' | 'spin' | 'build' | 'ability' | 'artifact' | 'event' | 'achievement' | 'title' | 'discover' | 'daily' | 'recruit' | 'trade';
}

// ─── Constants (prefixed SI_) ───────────────────────────────────────────────

const SI_SPECIES = [
  'silkworm_spirit',
  'silk_spider',
  'jade_weaver',
  'lotus_fairy',
  'thread_dragon',
  'brocade_phoenix',
  'kimono_fox',
] as const;

const SI_SPECIES_EMOJIS: Record<string, string> = {
  silkworm_spirit: '🐛',
  silk_spider: '🕸️',
  jade_weaver: '💚',
  lotus_fairy: '🪷',
  thread_dragon: '🐉',
  brocade_phoenix: '🔥',
  kimono_fox: '🦊',
};

const SI_SPECIES_LABELS: Record<string, string> = {
  silkworm_spirit: 'Silkworm Spirit',
  silk_spider: 'Silk Spider',
  jade_weaver: 'Jade Weaver',
  lotus_fairy: 'Lotus Fairy',
  thread_dragon: 'Thread Dragon',
  brocade_phoenix: 'Brocade Phoenix',
  kimono_fox: 'Kimono Fox',
};

const SI_MAX_SILK = 200;
const SI_MAX_XP = 10000;
const SI_MAX_COINS = 50000;
const SI_WEAVER_COUNT = 35;
const SI_LOOM_COUNT = 8;
const SI_MATERIAL_COUNT = 30;
const SI_STRUCTURE_COUNT = 25;
const SI_ABILITY_COUNT = 22;
const SI_ACHIEVEMENT_COUNT = 18;
const SI_TITLE_COUNT = 8;
const SI_ARTIFACT_COUNT = 6;
const SI_EVENT_COUNT = 8;
const SI_MAX_STRUCTURE_LEVEL = 10;
const SI_BASE_WEAVE_COST = 10;
const SI_BASE_SPIN_COST = 5;
const SI_BASE_BUILD_COST = 50;
const SI_SILK_REGEN_RATE = 2;
const SI_COIN_REGEN_RATE = 1;
const SI_EVENT_DURATION = 86400000;
const SI_DAILY_CHALLENGE_DURATION = 86400000;
const SI_TICK_INTERVAL = 1000;
const SI_ACHIEVEMENT_CHECK_INTERVAL = 5000;

// Color theme
const SI_COLOR_CRIMSON = '#DC143C';
const SI_COLOR_SILK_WHITE = '#FFF8F0';
const SI_COLOR_JADE_GREEN = '#00A86B';
const SI_COLOR_GOLD_THREAD = '#FFD700';
const SI_COLOR_INK_BLACK = '#1A1A2E';
const SI_COLOR_IMPERIAL_PURPLE = '#7B2D8E';

const SI_COLORS = [
  SI_COLOR_CRIMSON,
  SI_COLOR_SILK_WHITE,
  SI_COLOR_JADE_GREEN,
  SI_COLOR_GOLD_THREAD,
  SI_COLOR_INK_BLACK,
  SI_COLOR_IMPERIAL_PURPLE,
];

const SI_RARITY_ORDER: Record<RarityTier, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const SI_RARITY_NAMES: Record<RarityTier, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const SI_RARITY_COLORS: Record<RarityTier, string> = {
  common: '#9E9E9E',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

const SI_WEAVERS: string = 'Weavers';
const SI_LOOMS: string = 'Looms';
const SI_MATERIALS: string = 'Materials';

const SI_ABILITY_CATEGORIES: AbilityCategory[] = ['offensive', 'defensive', 'utility', 'summon'];
const SI_MATERIAL_CATEGORIES: string[] = ['fiber', 'fabric', 'dye', 'tool', 'creature', 'resource'];
const SI_LOG_MAX_ENTRIES = 100;

// ─── Catalog Data: Weaver Templates ────────────────────────────────────────

interface WeaverTemplate {
  name: string;
  species: string;
  description: string;
  rarity: RarityTier;
  emoji: string;
  power: number;
  cost: number;
  xpReward: number;
}

const WEAVER_TEMPLATES: WeaverTemplate[] = [
  // ── Common (7) ──
  {
    name: 'Silk Caterpillar',
    species: 'silkworm_spirit',
    description: 'A gentle spirit born from the first mulberry leaf of spring, spinning threads of pure white silk. Its cocoon glows faintly in moonlight, and the silk it produces is softer than clouds.',
    rarity: 'common', emoji: '🐛', power: 10, cost: 10, xpReward: 5,
  },
  {
    name: 'Cocoon Spinner',
    species: 'silkworm_spirit',
    description: 'A diligent worker that weaves protective cocoons imbued with soothing silk energy. Other creatures seek refuge in its cocoons during storms.',
    rarity: 'common', emoji: '🧶', power: 12, cost: 12, xpReward: 6,
  },
  {
    name: 'Gossamer Spider',
    species: 'silk_spider',
    description: 'A tiny spider that produces incredibly fine gossamer threads for delicate repairs. Its webs catch the morning dew and refract rainbow light.',
    rarity: 'common', emoji: '🕷️', power: 8, cost: 8, xpReward: 4,
  },
  {
    name: 'Jade Needle',
    species: 'jade_weaver',
    description: 'A small weaver spirit that uses a jade needle to stitch torn fabrics back together. Every stitch it makes is perfectly aligned and never unravels.',
    rarity: 'common', emoji: '🪡', power: 11, cost: 10, xpReward: 5,
  },
  {
    name: 'Lotus Sprout',
    species: 'lotus_fairy',
    description: 'A young fairy who weaves lotus fibers into soft, fragrant ribbons. Her ribbons carry the scent of spring water and fresh blossoms.',
    rarity: 'common', emoji: '🌱', power: 9, cost: 9, xpReward: 4,
  },
  {
    name: 'Thread Hatchling',
    species: 'thread_dragon',
    description: 'A baby dragon whose scales shimmer like spun gold thread. It cannot yet fly but leaves golden trails wherever it crawls.',
    rarity: 'common', emoji: '🥚', power: 13, cost: 12, xpReward: 6,
  },
  {
    name: 'Fox Kit',
    species: 'kimono_fox',
    description: 'A playful fox kit that already shows talent for designing kimono patterns. Its sketches in the dirt often become the most sought-after designs.',
    rarity: 'common', emoji: '🦊', power: 7, cost: 8, xpReward: 4,
  },
  // ── Uncommon (7) ──
  {
    name: 'Mulberry Sage',
    species: 'silkworm_spirit',
    description: 'An ancient silkworm who has lived through a hundred silk harvests and knows every thread pattern ever devised. Its silk carries the wisdom of centuries.',
    rarity: 'uncommon', emoji: '🐛', power: 25, cost: 20, xpReward: 12,
  },
  {
    name: 'Velvet Spinner',
    species: 'silk_spider',
    description: 'A spider that crafts velvet-textured silk with an impossibly soft sheen. Nobles pay fortunes for garments made from its silk alone.',
    rarity: 'uncommon', emoji: '🕸️', power: 28, cost: 22, xpReward: 14,
  },
  {
    name: 'Jade Loom Spirit',
    species: 'jade_weaver',
    description: 'A spirit that inhabits jade looms, guiding the hands of master weavers. Under its influence, every weave is flawless.',
    rarity: 'uncommon', emoji: '💚', power: 30, cost: 25, xpReward: 15,
  },
  {
    name: 'Lotus Dancer',
    species: 'lotus_fairy',
    description: 'A fairy who weaves while dancing upon lotus pads, creating patterns of living beauty that seem to move and breathe.',
    rarity: 'uncommon', emoji: '🪷', power: 26, cost: 21, xpReward: 13,
  },
  {
    name: 'Gold Thread Wyrm',
    species: 'thread_dragon',
    description: 'A serpentine dragon that trails gold thread behind it as it flies through the clouds. Its thread is worth more than its weight in gold.',
    rarity: 'uncommon', emoji: '🐉', power: 32, cost: 26, xpReward: 16,
  },
  {
    name: 'Kimono Apprentice',
    species: 'kimono_fox',
    description: 'A young fox who has learned the art of kimono dyeing from forest spirits. Her colors are unlike anything seen in mortal dye houses.',
    rarity: 'uncommon', emoji: '🧣', power: 24, cost: 19, xpReward: 12,
  },
  {
    name: 'Brocade Beetle',
    species: 'silk_spider',
    description: 'A shimmering beetle whose shell patterns inspire intricate brocade designs. Textile artists travel far to study its carapace.',
    rarity: 'uncommon', emoji: '🪲', power: 27, cost: 23, xpReward: 14,
  },
  // ── Rare (7) ──
  {
    name: 'Empress Moth',
    species: 'silkworm_spirit',
    description: 'A magnificent moth spirit whose wings are made of the finest imperial silk. When it spreads its wings, an aurora of silk thread fills the air.',
    rarity: 'rare', emoji: '🦋', power: 55, cost: 45, xpReward: 28,
  },
  {
    name: 'Celestial Spider Queen',
    species: 'silk_spider',
    description: 'A regal spider who spins silk that glows with starlight under the moon. Her web connects the mortal world to the celestial realm.',
    rarity: 'rare', emoji: '👑', power: 60, cost: 50, xpReward: 30,
  },
  {
    name: 'Jade Master Weaver',
    species: 'jade_weaver',
    description: 'A legendary weaver who can transform jade dust into shimmering silk thread. Garments made with this thread are said to grant longevity.',
    rarity: 'rare', emoji: '📿', power: 58, cost: 48, xpReward: 29,
  },
  {
    name: 'Lotus Empress',
    species: 'lotus_fairy',
    description: 'The queen of lotus fairies, her silk garments are said to heal any wound. A single thread from her loom can mend a broken heart.',
    rarity: 'rare', emoji: '🌸', power: 52, cost: 42, xpReward: 26,
  },
  {
    name: 'Storm Thread Dragon',
    species: 'thread_dragon',
    description: 'A dragon that weaves storms into silk, creating fabric that crackles with electricity. Wearing its silk grants protection from lightning.',
    rarity: 'rare', emoji: '⛈️', power: 65, cost: 55, xpReward: 32,
  },
  {
    name: 'Fox Dyer Master',
    species: 'kimono_fox',
    description: 'An ancient fox who has mastered every dyeing technique from a thousand dynasties. His kimono colors shift with the wearer\'s emotions.',
    rarity: 'rare', emoji: '🎨', power: 50, cost: 40, xpReward: 25,
  },
  {
    name: 'Silk Phoenix Chick',
    species: 'brocade_phoenix',
    description: 'A young phoenix whose first feathers are woven from pure brocade silk. Even as a chick, its presence warms the entire loom chamber.',
    rarity: 'rare', emoji: '🐤', power: 56, cost: 46, xpReward: 28,
  },
  // ── Epic (7) ──
  {
    name: 'Silk Emperor Worm',
    species: 'silkworm_spirit',
    description: 'The divine silkworm ancestor, said to have created the first thread of fate. Its silk binds the destinies of mortals and gods alike.',
    rarity: 'epic', emoji: '⭐', power: 100, cost: 85, xpReward: 50,
  },
  {
    name: 'Moonlight Weaver',
    species: 'silk_spider',
    description: 'A spider that only weaves under the full moon, creating silk of otherworldly luminescence. Its tapestries are windows into other dimensions.',
    rarity: 'epic', emoji: '🌙', power: 95, cost: 80, xpReward: 48,
  },
  {
    name: 'Jade Dynasty Artisan',
    species: 'jade_weaver',
    description: 'A master artisan whose silk tapestries are considered national treasures. Emperors have waged wars to possess a single piece.',
    rarity: 'epic', emoji: '🏯', power: 105, cost: 90, xpReward: 52,
  },
  {
    name: 'Lotus Sage',
    species: 'lotus_fairy',
    description: 'An enlightened fairy who weaves the fabric of dreams into wearable silk garments. Sleeping in her silk grants prophetic visions.',
    rarity: 'epic', emoji: '🧘', power: 88, cost: 75, xpReward: 45,
  },
  {
    name: 'Thread Dragon Lord',
    species: 'thread_dragon',
    description: 'The ruler of all thread dragons, commanding legions that weave the sky itself into magnificent banners of gold and crimson.',
    rarity: 'epic', emoji: '🐲', power: 110, cost: 95, xpReward: 55,
  },
  {
    name: 'Nine-Tail Couturier',
    species: 'kimono_fox',
    description: 'A fox with nine tails, each one a different color of enchanted silk. When all nine tails wave, a rainbow of silk floods the loom.',
    rarity: 'epic', emoji: '🦊', power: 98, cost: 82, xpReward: 49,
  },
  {
    name: 'Brocade Phoenix',
    species: 'brocade_phoenix',
    description: 'A resplendent phoenix whose feathers are living brocade, radiant with crimson and gold. Each molted feather becomes a masterwork tapestry.',
    rarity: 'epic', emoji: '🔥', power: 115, cost: 100, xpReward: 58,
  },
  // ── Legendary (7) ──
  {
    name: 'Silk God Serpent',
    species: 'silkworm_spirit',
    description: 'The primordial serpent of silk, whose body IS the Silk Road, stretching across continents. Its silk connects all civilizations.',
    rarity: 'legendary', emoji: '🐍', power: 200, cost: 200, xpReward: 100,
  },
  {
    name: 'Arachne of the East',
    species: 'silk_spider',
    description: 'The mother of all silk spiders, who once wove the fabric of reality itself. Her web spans the cosmos, shimmering with starlight.',
    rarity: 'legendary', emoji: '🕸️', power: 190, cost: 190, xpReward: 95,
  },
  {
    name: 'Jade Emperor Weaver',
    species: 'jade_weaver',
    description: 'The celestial weaver who stitches the heavens together, mending the Milky Way with threads of pure jade light.',
    rarity: 'legendary', emoji: '👑', power: 195, cost: 195, xpReward: 98,
  },
  {
    name: 'Lotus Origin Spirit',
    species: 'lotus_fairy',
    description: 'The first lotus fairy, born from a single petal that fell from paradise. Her silk garments bloom with eternal lotus flowers.',
    rarity: 'legendary', emoji: '✨', power: 210, cost: 210, xpReward: 105,
  },
  {
    name: 'Dragon Silk Ancestor',
    species: 'thread_dragon',
    description: 'The ancestor of all thread dragons, whose breath creates galaxies of golden thread spiraling through the void.',
    rarity: 'legendary', emoji: '🌟', power: 220, cost: 220, xpReward: 110,
  },
  {
    name: 'Kitsune Silk Empress',
    species: 'kimono_fox',
    description: 'The legendary fox empress whose kimono contains every pattern ever conceived. Shaking her kimono releases a storm of silk.',
    rarity: 'legendary', emoji: '🦊', power: 230, cost: 230, xpReward: 115,
  },
  {
    name: 'Phoenix of Eternal Brocade',
    species: 'brocade_phoenix',
    description: 'The immortal phoenix whose brocade feathers never fade, eternally reborn in silk and flame. Its tears weave themselves into cloth.',
    rarity: 'legendary', emoji: '🔥', power: 300, cost: 300, xpReward: 150,
  },
];

// ─── Catalog Data: Loom Templates ──────────────────────────────────────────

interface LoomTemplate {
  name: string;
  description: string;
  emoji: string;
  resources: string;
  capacity: number;
  unlockLevel: number;
  baseUpgradeCost: number;
}

const LOOM_TEMPLATES: LoomTemplate[] = [
  {
    name: 'Mulberry Pavilion',
    description: 'A simple pavilion surrounded by mulberry trees, the heart of every silk dynasty. Here the first threads are spun and the foundation of the empire is laid.',
    emoji: '🏯', resources: 'raw_silk', capacity: 20, unlockLevel: 1, baseUpgradeCost: 30,
  },
  {
    name: 'Crimson Loom Chamber',
    description: 'A crimson-walled chamber where warriors\' silk armor is woven with enchantments. The red walls pulse with protective energy during weaving.',
    emoji: '🪶', resources: 'crimson_thread', capacity: 25, unlockLevel: 3, baseUpgradeCost: 45,
  },
  {
    name: 'Jade Weaving Hall',
    description: 'A hall adorned with jade pillars where the finest ceremonial silk is produced. The jade resonates with each shuttle pass, improving quality.',
    emoji: '💚', resources: 'jade_silk', capacity: 30, unlockLevel: 5, baseUpgradeCost: 60,
  },
  {
    name: 'Gold Thread Sanctum',
    description: 'A golden sanctuary where precious gold-wrapped threads are spun for imperial garments. Only the most trusted weavers may enter.',
    emoji: '✨', resources: 'gold_thread', capacity: 35, unlockLevel: 8, baseUpgradeCost: 80,
  },
  {
    name: 'Lotus Dye Workshop',
    description: 'A fragrant workshop beside a lotus pond, specializing in natural silk dyes extracted from rare lotus varieties.',
    emoji: '🪷', resources: 'lotus_dye', capacity: 28, unlockLevel: 10, baseUpgradeCost: 55,
  },
  {
    name: 'Imperial Brocade Atelier',
    description: 'The most prestigious workshop in the dynasty, reserved for brocade of the highest order. Emperors commission garments only from this atelier.',
    emoji: '👑', resources: 'brocade_fabric', capacity: 40, unlockLevel: 15, baseUpgradeCost: 120,
  },
  {
    name: 'Phoenix Feather Studio',
    description: 'A mystical studio where phoenix feather silk is woven into legendary garments that never burn, never tear, and never fade.',
    emoji: '🔥', resources: 'phoenix_silk', capacity: 45, unlockLevel: 20, baseUpgradeCost: 150,
  },
  {
    name: 'Celestial Silk Observatory',
    description: 'An observatory at the peak of the dynasty where starlight is woven into cloth. On clear nights, the silk produced glows with cosmic light.',
    emoji: '🌌', resources: 'starlight_silk', capacity: 50, unlockLevel: 25, baseUpgradeCost: 200,
  },
];

// ─── Catalog Data: Material Templates ──────────────────────────────────────

interface MaterialTemplate {
  name: string;
  description: string;
  rarity: RarityTier;
  category: string;
  maxQuantity: number;
  effect: string;
  effectValue: number;
}

const MATERIAL_TEMPLATES: MaterialTemplate[] = [
  // Common (6)
  { name: 'Raw Mulberry Silk', description: 'Freshly harvested silk from domesticated silkworms, the foundation of all weaving. Soft, durable, and naturally lustrous.', rarity: 'common', category: 'fiber', maxQuantity: 50, effect: 'weaveBonus', effectValue: 3 },
  { name: 'Cotton Thread', description: 'Simple but reliable cotton thread for everyday weaving projects. While humble, it forms the backbone of many textile traditions.', rarity: 'common', category: 'fiber', maxQuantity: 60, effect: 'spinBonus', effectValue: 2 },
  { name: 'White Dye', description: 'A basic white dye made from rice ash, used to brighten silk fabrics and prepare them for more vibrant colors.', rarity: 'common', category: 'dye', maxQuantity: 40, effect: 'qualityBonus', effectValue: 2 },
  { name: 'Bamboo Loom Frame', description: 'A lightweight bamboo frame for setting up portable weaving looms. Essential for weavers who travel along the Silk Road.', rarity: 'common', category: 'tool', maxQuantity: 20, effect: 'capacityBonus', effectValue: 5 },
  { name: 'Silkworm Eggs', description: 'Fertile silkworm eggs ready to hatch into a new generation of silk producers. Handle with care — they are extremely delicate.', rarity: 'common', category: 'creature', maxQuantity: 30, effect: 'breedBonus', effectValue: 2 },
  { name: 'Mulberry Leaf Bundle', description: 'A bundle of fresh mulberry leaves, essential food for silkworms. The quality of leaves directly affects silk quality.', rarity: 'common', category: 'resource', maxQuantity: 80, effect: 'feedBonus', effectValue: 2 },
  // Uncommon (6)
  { name: 'Crimson Silk Thread', description: 'Deep crimson thread dyed with cochineal, reserved for noble garments and ceremonial robes of the highest rank.', rarity: 'uncommon', category: 'fiber', maxQuantity: 25, effect: 'weaveBonus', effectValue: 6 },
  { name: 'Indigo Fabric Bolt', description: 'A bolt of rich indigo-dyed fabric, prized for ceremonial kimonos. The deep blue color symbolizes the infinite sky.', rarity: 'uncommon', category: 'fabric', maxQuantity: 20, effect: 'coinBonus', effectValue: 8 },
  { name: 'Jade Powder', description: 'Finely ground jade powder mixed into silk for a subtle green shimmer. Said to bring good fortune to the wearer.', rarity: 'uncommon', category: 'dye', maxQuantity: 15, effect: 'qualityBonus', effectValue: 7 },
  { name: 'Silver Needle Set', description: 'A set of silver sewing needles of exceptional precision and durability. Each needle is inscribed with a protective rune.', rarity: 'uncommon', category: 'tool', maxQuantity: 10, effect: 'precisionBonus', effectValue: 5 },
  { name: 'Lotus Fiber', description: 'Delicate fiber extracted from lotus stems, incredibly rare and soft. Garments made from lotus fiber are lighter than air.', rarity: 'uncommon', category: 'fiber', maxQuantity: 18, effect: 'weaveBonus', effectValue: 8 },
  { name: 'Silk Moth Wings', description: 'Preserved wings of silk moths, used as decorative elements in haute couture. They shimmer with iridescent colors in sunlight.', rarity: 'uncommon', category: 'resource', maxQuantity: 15, effect: 'xpBonus', effectValue: 5 },
  // Rare (6)
  { name: 'Imperial Gold Thread', description: 'Thread wrapped in ultra-thin gold leaf, used only for the emperor\'s garments. A single spool costs more than a house.', rarity: 'rare', category: 'fiber', maxQuantity: 8, effect: 'coinBonus', effectValue: 15 },
  { name: 'Dragon Scale Silk', description: 'Silk woven with genuine dragon scale fragments, nearly indestructible. Armor made from this silk can turn aside blades.', rarity: 'rare', category: 'fabric', maxQuantity: 5, effect: 'defenseBonus', effectValue: 12 },
  { name: 'Phoenix Down', description: 'Incredibly soft down from phoenix feathers, the most luxurious insulation known. Blankets of phoenix down never grow cold.', rarity: 'rare', category: 'resource', maxQuantity: 6, effect: 'xpBonus', effectValue: 12 },
  { name: 'Jade Loom Shuttle', description: 'A loom shuttle carved from a single piece of jade, said to guide perfect weaving. It hums with ancient energy.', rarity: 'rare', category: 'tool', maxQuantity: 5, effect: 'weaveBonus', effectValue: 15 },
  { name: 'Moonlight Dye', description: 'A luminous dye that makes fabric glow softly in moonlight. Alchemists harvest it from moonbeams caught in crystal vials.', rarity: 'rare', category: 'dye', maxQuantity: 8, effect: 'qualityBonus', effectValue: 14 },
  { name: 'Brocade Pattern Scroll', description: 'An ancient scroll containing patterns for legendary brocade weaving. The patterns seem to shift when no one is looking.', rarity: 'rare', category: 'resource', maxQuantity: 6, effect: 'weaveBonus', effectValue: 18 },
  // Epic (6)
  { name: 'Starlight Silk', description: 'Silk that captures and reflects starlight, shimmering like the night sky. Each thread contains the light of a specific star.', rarity: 'epic', category: 'fiber', maxQuantity: 3, effect: 'xpBonus', effectValue: 25 },
  { name: 'Celestial Brocade', description: 'Brocade woven with threads from the heavens, fit for the gods themselves. It weighs nothing but protects against everything.', rarity: 'epic', category: 'fabric', maxQuantity: 3, effect: 'coinBonus', effectValue: 30 },
  { name: 'Dragon Heart Dye', description: 'A vivid crimson dye made with essence from a dragon\'s heart, never fades. Cloth dyed with it burns with an inner fire.', rarity: 'epic', category: 'dye', maxQuantity: 3, effect: 'qualityBonus', effectValue: 28 },
  { name: 'Nine-Tail Fox Fur', description: 'Luxurious fur from a nine-tailed fox, the rarest garment lining in existence. It changes color with the seasons.', rarity: 'epic', category: 'resource', maxQuantity: 2, effect: 'defenseBonus', effectValue: 25 },
  { name: 'Heavenly Needle', description: 'A needle of pure light that can stitch any fabric, even reality itself. Threads sewn with it glow faintly forever.', rarity: 'epic', category: 'tool', maxQuantity: 2, effect: 'weaveBonus', effectValue: 35 },
  { name: 'Lotus Crown Petal', description: 'A single petal from the legendary Lotus Crown, radiates pure silk energy. Holding it reveals hidden weaving patterns.', rarity: 'epic', category: 'resource', maxQuantity: 3, effect: 'xpBonus', effectValue: 22 },
  // Legendary (6)
  { name: 'Fabric of Fate', description: 'A scrap of the actual fabric of fate, woven by destiny itself. Garments incorporating it alter probability in the wearer\'s favor.', rarity: 'legendary', category: 'fabric', maxQuantity: 1, effect: 'coinBonus', effectValue: 50 },
  { name: 'Primordial Silk', description: 'Silk from the very first silkworm, containing the essence of creation. Threads from this silk can create new forms of life.', rarity: 'legendary', category: 'fiber', maxQuantity: 1, effect: 'weaveBonus', effectValue: 60 },
  { name: 'Void Dye', description: 'Dye extracted from the void between dimensions, renders fabric invisible at will. Be careful — it may render the wearer invisible too.', rarity: 'legendary', category: 'dye', maxQuantity: 1, effect: 'qualityBonus', effectValue: 55 },
  { name: 'Jade Emperor\'s Loom', description: 'The personal loom of the Jade Emperor, capable of weaving entire worlds. Its shuttle passes between dimensions.', rarity: 'legendary', category: 'tool', maxQuantity: 1, effect: 'weaveBonus', effectValue: 100 },
  { name: 'Phoenix Tears Silk', description: 'Silk imbued with phoenix tears, granting eternal regeneration to its wearer. Wounds close instantly when wrapped in it.', rarity: 'legendary', category: 'resource', maxQuantity: 1, effect: 'defenseBonus', effectValue: 50 },
  { name: 'Dragon Vein Thread', description: 'Thread pulled from the ley lines of the earth, pulsing with ancient power. It hums with the heartbeat of the world.', rarity: 'legendary', category: 'fiber', maxQuantity: 1, effect: 'xpBonus', effectValue: 45 },
];

// ─── Catalog Data: Structure Templates ─────────────────────────────────────

interface StructureTemplate {
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  bonusType: string;
  baseBonusValue: number;
  baseUpgradeCost: number;
}

const STRUCTURE_TEMPLATES: StructureTemplate[] = [
  { name: 'Mulberry Grove', description: 'A lush grove of mulberry trees providing endless leaves for silkworms. The trees here are centuries old and produce the sweetest leaves in the realm.', emoji: '🌳', maxLevel: 10, bonusType: 'feedRate', baseBonusValue: 5, baseUpgradeCost: 25 },
  { name: 'Silk Market Stall', description: 'A bustling market stall selling woven silk to travelers and nobles. Prices here are fair, and the quality speaks for itself.', emoji: '🏪', maxLevel: 10, bonusType: 'coinIncome', baseBonusValue: 4, baseUpgradeCost: 30 },
  { name: 'Dye House', description: 'A traditional dye house using natural ingredients to color silk fabrics. The vats here have been used for generations.', emoji: '🎨', maxLevel: 10, bonusType: 'dyeEfficiency', baseBonusValue: 3, baseUpgradeCost: 35 },
  { name: 'Weaver\'s Cottage', description: 'A cozy cottage where journeyman weavers practice their craft. The sound of looms fills the air from dawn to dusk.', emoji: '🏠', maxLevel: 10, bonusType: 'weaveSpeed', baseBonusValue: 4, baseUpgradeCost: 28 },
  { name: 'Spinning Wheel Tower', description: 'A tall tower housing the finest spinning wheels in the dynasty. The wheels never stop turning, powered by silk spirit energy.', emoji: '🗼', maxLevel: 10, bonusType: 'spinRate', baseBonusValue: 6, baseUpgradeCost: 40 },
  { name: 'Silk Vault', description: 'A secure underground vault for storing the dynasty\'s most precious silks. Protected by jade guardians and silk wards.', emoji: '🏦', maxLevel: 10, bonusType: 'storageCapacity', baseBonusValue: 8, baseUpgradeCost: 50 },
  { name: 'Embroidery Academy', description: 'An academy teaching the ancient art of silk embroidery to gifted students. Masters here can stitch entire landscapes.', emoji: '🎓', maxLevel: 10, bonusType: 'xpBonus', baseBonusValue: 5, baseUpgradeCost: 45 },
  { name: 'Kimono Atelier', description: 'A high-end atelier specializing in custom kimono design and tailoring. Each garment is a unique work of art.', emoji: '👘', maxLevel: 10, bonusType: 'qualityBonus', baseBonusValue: 7, baseUpgradeCost: 55 },
  { name: 'Loom Factory', description: 'A large factory producing looms of various sizes and complexities. Steam and silk energy power the machinery.', emoji: '🏭', maxLevel: 10, bonusType: 'productionRate', baseBonusValue: 6, baseUpgradeCost: 48 },
  { name: 'Lotus Reflection Pool', description: 'A serene pool where weavers meditate and find design inspiration. The lotus patterns on the water shift with the seasons.', emoji: '🏊', maxLevel: 10, bonusType: 'inspiration', baseBonusValue: 4, baseUpgradeCost: 35 },
  { name: 'Silkworm Nursery', description: 'A warm nursery for raising silkworms from eggs to cocoon stage. Temperature and humidity are carefully controlled.', emoji: '🐛', maxLevel: 10, bonusType: 'breedRate', baseBonusValue: 5, baseUpgradeCost: 38 },
  { name: 'Trade Post', description: 'A post along the Silk Road where goods are exchanged with distant lands. Merchants from a hundred nations pass through.', emoji: '🐫', maxLevel: 10, bonusType: 'tradeIncome', baseBonusValue: 7, baseUpgradeCost: 52 },
  { name: 'Jade Workshop', description: 'A workshop where jade is crafted into silk-making tools and accessories. The finest jade tools in the dynasty are made here.', emoji: '💎', maxLevel: 10, bonusType: 'toolQuality', baseBonusValue: 6, baseUpgradeCost: 42 },
  { name: 'Emperor\'s Wardrobe', description: 'The imperial wardrobe housing the finest garments ever woven in the dynasty. Guards watch over it day and night.', emoji: '👑', maxLevel: 10, bonusType: 'prestige', baseBonusValue: 10, baseUpgradeCost: 80 },
  { name: 'Silk Library', description: 'A vast library of weaving patterns, dye recipes, and textile knowledge. Scrolls here date back thousands of years.', emoji: '📚', maxLevel: 10, bonusType: 'knowledge', baseBonusValue: 5, baseUpgradeCost: 40 },
  { name: 'Phoenix Nest Roost', description: 'A roosting tower for phoenix weavers, their feathers enriching the silk. The warmth they provide speeds all weaving.', emoji: '🔥', maxLevel: 10, bonusType: 'rareFind', baseBonusValue: 8, baseUpgradeCost: 65 },
  { name: 'Dragon Silk Cave', description: 'A mysterious cave where dragon silk naturally grows on the walls. Harvesting it requires great courage and skill.', emoji: '🐉', maxLevel: 10, bonusType: 'dragonSilk', baseBonusValue: 9, baseUpgradeCost: 70 },
  { name: 'Fox Shrine', description: 'A sacred shrine honoring the fox spirits who taught humans to weave. Offerings of silk are left here during festivals.', emoji: '⛩️', maxLevel: 10, bonusType: 'luck', baseBonusValue: 6, baseUpgradeCost: 45 },
  { name: 'Star Thread Observatory', description: 'An observatory where starlight is harvested and spun into thread. On the clearest nights, entire galaxies are captured.', emoji: '⭐', maxLevel: 10, bonusType: 'starlightHarvest', baseBonusValue: 7, baseUpgradeCost: 58 },
  { name: 'Warrior Silk Armory', description: 'An armory producing silk armor of legendary protective quality. Warriors from across the land seek armor made here.', emoji: '🛡️', maxLevel: 10, bonusType: 'defense', baseBonusValue: 8, baseUpgradeCost: 62 },
  { name: 'Tea Ceremony Pavilion', description: 'A pavilion for hosting dignitaries, boosting reputation and trade. The tea here is brewed with lotus-scented water.', emoji: '🍵', maxLevel: 10, bonusType: 'diplomacy', baseBonusValue: 5, baseUpgradeCost: 38 },
  { name: 'Silk Road Gate', description: 'The grand gate marking the start of the Silk Road, boosting all trade. Caravans pass through it in an endless stream.', emoji: '🏮', maxLevel: 10, bonusType: 'globalTrade', baseBonusValue: 10, baseUpgradeCost: 90 },
  { name: 'Lotus Bridge', description: 'A beautiful arched bridge connecting the dynasty\'s districts across a lotus pond. It is a symbol of unity and craft.', emoji: '🌉', maxLevel: 10, bonusType: 'unity', baseBonusValue: 6, baseUpgradeCost: 42 },
  { name: 'Crimson Pagoda', description: 'A towering crimson pagoda that serves as the dynasty\'s symbol of power. Its silk banners fly in every wind.', emoji: '🏯', maxLevel: 10, bonusType: 'dynastyPower', baseBonusValue: 12, baseUpgradeCost: 100 },
];

// ─── Catalog Data: Ability Templates ───────────────────────────────────────

interface AbilityTemplate {
  name: string;
  description: string;
  category: AbilityCategory;
  cooldown: number;
  silkCost: number;
  powerMultiplier: number;
  tier: number;
}

const ABILITY_TEMPLATES: AbilityTemplate[] = [
  // Offensive (6)
  { name: 'Silk Razor Weave', description: 'Weave razor-sharp silk strands that slash through obstacles for double points. The strands dissolve after impact.', category: 'offensive', cooldown: 3000, silkCost: 15, powerMultiplier: 2.0, tier: 1 },
  { name: 'Thread Binding', description: 'Bind an enemy creature in unbreakable silk thread, immobilizing it completely. Lasts until the thread is cut.', category: 'offensive', cooldown: 5000, silkCost: 20, powerMultiplier: 1.5, tier: 1 },
  { name: 'Crimson Blade Silk', description: 'Forge a blade from crimson silk that deals devastating damage. The blade burns with ancestral fury.', category: 'offensive', cooldown: 8000, silkCost: 35, powerMultiplier: 2.5, tier: 2 },
  { name: 'Dragon Thread Barrage', description: 'Unleash a barrage of dragon thread needles at all opponents. Each needle homes in on its target.', category: 'offensive', cooldown: 10000, silkCost: 50, powerMultiplier: 3.0, tier: 3 },
  { name: 'Phoenix Flame Fabric', description: 'Ignite silk with phoenix fire, creating an area-of-effect blaze that engulfs all nearby enemies.', category: 'offensive', cooldown: 12000, silkCost: 60, powerMultiplier: 3.5, tier: 4 },
  { name: 'Fabric of Destruction', description: 'Unravel the fabric of reality in a small area, obliterating all enemies caught within the tear.', category: 'offensive', cooldown: 20000, silkCost: 100, powerMultiplier: 5.0, tier: 5 },
  // Defensive (5)
  { name: 'Silk Shield Wrap', description: 'Wrap yourself in layers of protective silk, reducing incoming damage by 30%. The shield shimmers with jade light.', category: 'defensive', cooldown: 4000, silkCost: 12, powerMultiplier: 1.3, tier: 1 },
  { name: 'Jade Silk Armor', description: 'Weave jade-infused silk armor that deflects attacks. The jade hardens on impact, becoming impenetrable.', category: 'defensive', cooldown: 7000, silkCost: 25, powerMultiplier: 1.8, tier: 2 },
  { name: 'Lotus Barrier', description: 'Create a barrier of lotus petals and silk that absorbs damage. Petals regenerate as they are destroyed.', category: 'defensive', cooldown: 9000, silkCost: 40, powerMultiplier: 2.0, tier: 3 },
  { name: 'Kimono of Invincibility', description: 'Don a legendary kimono that makes the wearer temporarily invincible. The kimono glows with divine protection.', category: 'defensive', cooldown: 15000, silkCost: 70, powerMultiplier: 3.0, tier: 4 },
  { name: 'Dragon Silk Fortress', description: 'Summon a fortress made entirely of dragon silk, protecting all allies within its walls.', category: 'defensive', cooldown: 25000, silkCost: 90, powerMultiplier: 2.5, tier: 5 },
  // Utility (6)
  { name: 'Quick Spin', description: 'Rapidly spin silk thread to regenerate resources faster. The spinning wheel hums with increased energy.', category: 'utility', cooldown: 2000, silkCost: 5, powerMultiplier: 1.2, tier: 1 },
  { name: 'Silk Path Finder', description: 'Release silk thread to reveal hidden paths and resources. The thread seeks out what is concealed.', category: 'utility', cooldown: 4000, silkCost: 10, powerMultiplier: 1.0, tier: 1 },
  { name: 'Golden Thread Boost', description: 'Weave gold thread into your current work, doubling XP gain for the next action.', category: 'utility', cooldown: 6000, silkCost: 20, powerMultiplier: 2.0, tier: 2 },
  { name: 'Fox Cunning', description: 'Channel fox spirit cleverness to reduce all costs by 30% temporarily. The fox spirit whispers strategies.', category: 'utility', cooldown: 10000, silkCost: 30, powerMultiplier: 1.0, tier: 3 },
  { name: 'Silk Road Trade', description: 'Open a temporary trade route that floods you with coins from distant merchants.', category: 'utility', cooldown: 15000, silkCost: 50, powerMultiplier: 1.5, tier: 4 },
  { name: 'Timeless Weave', description: 'Pause time briefly to make the perfect strategic decision. The world holds still while you think.', category: 'utility', cooldown: 18000, silkCost: 60, powerMultiplier: 1.0, tier: 5 },
  // Summon (5)
  { name: 'Call Silkworm Swarm', description: 'Summon a swarm of silkworms to produce a burst of raw silk. The swarm blankets the area in silk threads.', category: 'summon', cooldown: 5000, silkCost: 15, powerMultiplier: 1.5, tier: 1 },
  { name: 'Summon Jade Weaver', description: 'Summon a temporary jade weaver spirit to assist with crafting. The spirit works with supernatural precision.', category: 'summon', cooldown: 8000, silkCost: 25, powerMultiplier: 1.8, tier: 2 },
  { name: 'Lotus Fairy Dance', description: 'Summon lotus fairies who dance and boost all nearby loom output with their magical presence.', category: 'summon', cooldown: 10000, silkCost: 35, powerMultiplier: 2.0, tier: 3 },
  { name: 'Phoenix Brocade Summon', description: 'Summon a brocade phoenix to enhance the power of all abilities. Its presence radiates confidence.', category: 'summon', cooldown: 15000, silkCost: 55, powerMultiplier: 2.5, tier: 4 },
  { name: 'Dragon Silk Awakening', description: 'Awaken a thread dragon from its slumber to fight alongside you. The dragon unleashes golden thread fury.', category: 'summon', cooldown: 20000, silkCost: 80, powerMultiplier: 3.0, tier: 5 },
];

// ─── Catalog Data: Achievement Templates ───────────────────────────────────

interface AchievementTemplate {
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  icon: string;
}

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  { name: 'First Thread', description: 'Weave your very first silk fabric in the dynasty. Every great weaver starts with a single thread.', conditionKey: 'totalWoven', targetValue: 1, rewardXp: 20, icon: '🧵' },
  { name: 'Novice Spinner', description: 'Spin thread for the first time. The wheel turns, and your destiny begins to take shape.', conditionKey: 'totalSpun', targetValue: 1, rewardXp: 15, icon: '🫸' },
  { name: 'Foundation Stone', description: 'Build your first structure in the dynasty. A single building marks the beginning of an empire.', conditionKey: 'totalStructuresBuilt', targetValue: 1, rewardXp: 25, icon: '🏗️' },
  { name: 'Artifact Discoverer', description: 'Activate your first ancient artifact. The relics of past dynasties awaken at your touch.', conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 50, icon: '🏺' },
  { name: 'Event Witness', description: 'Witness your first dynasty random event. The spirits of the dynasty are stirring.', conditionKey: 'totalEvents', targetValue: 1, rewardXp: 10, icon: '📜' },
  { name: 'Loom Unlocker', description: 'Discover and unlock your first loom pavilion. The shuttle begins its eternal dance.', conditionKey: 'loomsUnlocked', targetValue: 1, rewardXp: 30, icon: '🔏' },
  { name: 'Silk Weaver Apprentice', description: 'Weave 50 silk fabrics across all looms. Your hands move with growing confidence and skill.', conditionKey: 'totalWoven', targetValue: 50, rewardXp: 100, icon: '🪡' },
  { name: 'Master Spinner', description: 'Spin thread 100 times. The spinning wheel has become an extension of your will.', conditionKey: 'totalSpun', targetValue: 100, rewardXp: 120, icon: '🧶' },
  { name: 'Dynasty Builder', description: 'Build 5 structures in the silk dynasty. The skyline of your empire grows ever grander.', conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXp: 80, icon: '🏯' },
  { name: 'Weaver Collector', description: 'Recruit 10 different weaver creatures. A diverse team of spirits serves your looms.', conditionKey: 'weaversRecruited', targetValue: 10, rewardXp: 150, icon: '🦋' },
  { name: 'Pavilion Master', description: 'Unlock all 8 loom pavilions. From mulberry to starlight, every weaving tradition is yours.', conditionKey: 'loomsUnlocked', targetValue: 8, rewardXp: 300, icon: '🏛️' },
  { name: 'Silk Tycoon', description: 'Accumulate 10,000 coins through silk trade. The merchants of the Silk Road know your name.', conditionKey: 'totalCoins', targetValue: 10000, rewardXp: 200, icon: '💰' },
  { name: 'Artifact Hunter', description: 'Activate 3 ancient artifacts. The ancient relics resonate with each other\'s power.', conditionKey: 'totalArtifacts', targetValue: 3, rewardXp: 250, icon: '🔍' },
  { name: 'Dynasty Elder', description: 'Reach level 20 in the silk dynasty. You have earned the respect of every weaver spirit.', conditionKey: 'level', targetValue: 20, rewardXp: 300, icon: '🧓' },
  { name: 'XP Master', description: 'Accumulate 5,000 total XP. Your experience spans countless weaving sessions.', conditionKey: 'totalXp', targetValue: 5000, rewardXp: 200, icon: '⭐' },
  { name: 'Event Veteran', description: 'Experience 10 random dynasty events. You have weathered every storm the dynasty offers.', conditionKey: 'totalEvents', targetValue: 10, rewardXp: 150, icon: '🎪' },
  { name: 'Legendary Weaver', description: 'Recruit a legendary-tier weaver creature. A being of immense power now serves your dynasty.', conditionKey: 'legendaryRecruited', targetValue: 1, rewardXp: 500, icon: '🌟' },
  { name: 'Silk Dynasty Eternal', description: 'Complete all other achievements to claim mastery of the dynasty. You are the Silk Dynasty incarnate.', conditionKey: 'achievementsCompleted', targetValue: 17, rewardXp: 1000, icon: '👑' },
];

// ─── Catalog Data: Titles ──────────────────────────────────────────────────

const TITLE_NAMES = [
  'Silk Apprentice',
  'Thread Spinner',
  'Journeyman Weaver',
  'Master Artisan',
  'Silk Noble',
  'Dynasty Elder',
  'Imperial Weaver',
  'Silk Dynasty Sovereign',
];

const TITLE_THRESHOLDS = [0, 100, 500, 1500, 3000, 5000, 7500, 10000];

// ─── Catalog Data: Artifact Templates ──────────────────────────────────────
// Ancient relics from past dynasties, each holding immense power
// when activated by a worthy weaver. They resonate with the
// silk energy of the dynasty and grant unique bonuses.

interface ArtifactTemplate {
  name: string;
  description: string;
  rarity: RarityTier;
  emoji: string;
  power: number;
}

const ARTIFACT_TEMPLATES: ArtifactTemplate[] = [
  {
    name: 'Moonlight Silk Fan',
    description: 'An ancient fan woven from moonlight silk that grants visions of future patterns. When opened under a full moon, it reveals tomorrow\'s fashions.',
    rarity: 'rare', emoji: '🌙', power: 50,
  },
  {
    name: 'Jade Spindle of Ages',
    description: 'A spindle carved from eternal jade, said to spin time itself into thread. Silk spun on it carries memories of centuries past.',
    rarity: 'rare', emoji: '💚', power: 55,
  },
  {
    name: 'Crimson Emperor\'s Robe',
    description: 'The legendary robe of the first Silk Emperor, radiating dynastic power. Wearing it commands instant respect from all silk spirits.',
    rarity: 'epic', emoji: '👘', power: 100,
  },
  {
    name: 'Phoenix Feather Quill',
    description: 'A quill made from a phoenix feather that writes patterns in fire on silk. Designs drawn with it are self-repairing.',
    rarity: 'epic', emoji: '🪶', power: 110,
  },
  {
    name: 'Dragon Silk Tapestry',
    description: 'A living tapestry depicting the history of the silk dynasty. It updates itself in real-time, showing events as they unfold.',
    rarity: 'legendary', emoji: '🐉', power: 200,
  },
  {
    name: 'Lotus Crown of Eternity',
    description: 'A crown woven from eternal lotus silk, granting infinite weaving wisdom to its wearer. The lotus flowers on it never wilt.',
    rarity: 'legendary', emoji: '👑', power: 250,
  },
];

// ─── Catalog Data: Dynasty Event Templates ─────────────────────────────────
// Random events that periodically affect the dynasty, providing
// bonuses to resources, XP, or rare material drops. Each event
// lasts for one full dynasty day before naturally expiring.

interface EventTemplate {
  name: string;
  description: string;
  emoji: string;
  effectType: string;
  effectValue: number;
  duration: number;
}

const EVENT_TEMPLATES: EventTemplate[] = [
  { name: 'Silkworm Blessing', description: 'A swarm of blessed silkworms descends upon the dynasty, boosting silk production for all looms.', emoji: '🐛', effectType: 'silkBonus', effectValue: 50, duration: SI_EVENT_DURATION },
  { name: 'Jade Rain', description: 'A gentle rain of jade dust falls upon the dynasty, enhancing all silk quality temporarily.', emoji: '🌧️', effectType: 'qualityBonus', effectValue: 30, duration: SI_EVENT_DURATION },
  { name: 'Phoenix Migration', description: 'A flock of brocade phoenixes flies overhead, dropping precious feathers that can be woven into silk.', emoji: '🔥', effectType: 'featherDrop', effectValue: 20, duration: SI_EVENT_DURATION },
  { name: 'Fox Spirit Festival', description: 'Kitsune spirits celebrate throughout the dynasty, revealing hidden treasures and secret patterns.', emoji: '🦊', effectType: 'treasureReveal', effectValue: 25, duration: SI_EVENT_DURATION },
  { name: 'Silk Road Caravan', description: 'A great caravan arrives from the west along the Silk Road, bringing rare materials and coin bonuses.', emoji: '🐪', effectType: 'coinBonus', effectValue: 40, duration: SI_EVENT_DURATION },
  { name: 'Lotus Bloom Surge', description: 'An unprecedented lotus bloom fills all ponds, providing abundant lotus fiber for weaving.', emoji: '🪷', effectType: 'fiberBonus', effectValue: 35, duration: SI_EVENT_DURATION },
  { name: 'Dragon Awakening', description: 'Ancient thread dragons stir from their mountain slumber, boosting all weaver power temporarily.', emoji: '🐲', effectType: 'powerBonus', effectValue: 45, duration: SI_EVENT_DURATION },
  { name: 'Emperor\'s Inspection', description: 'The emperor sends inspectors to evaluate the dynasty, granting great XP but demanding quality.', emoji: '👑', effectType: 'xpBonus', effectValue: 60, duration: SI_EVENT_DURATION },
];

// ─── Daily Challenges ──────────────────────────────────────────────────────

const DAILY_CHALLENGES = [
  'Weave a crimson kimono using only raw mulberry silk',
  'Spin thread until the moon rises to its highest point',
  'Recruit a silk spider and complete three weaves',
  'Build a new structure while a dynasty event is active',
  'Use three different abilities in a single session',
  'Discover a pavilion above level 10',
  'Complete five weaves at the Jade Weaving Hall',
  'Activate an artifact during a Phoenix Migration event',
  'Weave silk worth 100 coins in a single session',
  'Recruit a weaver from each of the seven species',
];

const SI_CHALLENGE_COUNT = DAILY_CHALLENGES.length;

// ─── The Main Hook ──────────────────────────────────────────────────────────

export default function useSilkDynasty() {
  // ── State ────────────────────────────────────────────────────────────────
  const [siWeavers, setSiWeavers] = useState<Weaver[]>([]);
  const [siLooms, setSiLooms] = useState<Loom[]>([]);
  const [siMaterials, setSiMaterials] = useState<SilkMaterial[]>([]);
  const [siStructures, setSiStructures] = useState<Structure[]>([]);
  const [siAbilities, setSiAbilities] = useState<SilkAbility[]>([]);
  const [siAchievements, setSiAchievements] = useState<SilkAchievement[]>([]);
  const [siArtifacts, setSiArtifacts] = useState<SilkArtifact[]>([]);
  const [siEvents, setSiEvents] = useState<DynastyEvent[]>([]);
  const [siDailyChallenge, setSiDailyChallenge] = useState<DailyChallenge | null>(null);
  const [siLevel, setSiLevel] = useState<number>(1);
  const [siXp, setSiXp] = useState<number>(0);
  const [siCoins, setSiCoins] = useState<number>(100);
  const [siSilk, setSiSilk] = useState<number>(50);
  const [siTitleIndex, setSiTitleIndex] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  const [siStats, setSiStats] = useState({
    totalWoven: 0,
    totalSpun: 0,
    totalStructuresBuilt: 0,
    totalArtifacts: 0,
    totalEvents: 0,
    totalCoins: 0,
    totalXp: 0,
  });

  // ── Refs ─────────────────────────────────────────────────────────────────
  const stateRef = useRef({
    siWeavers, siLooms, siMaterials, siStructures, siAbilities,
    siAchievements, siArtifacts, siEvents, siDailyChallenge,
    siLevel, siXp, siCoins, siSilk, siTitleIndex, siStats,
  });

  useEffect(() => {
    stateRef.current = {
      siWeavers, siLooms, siMaterials, siStructures, siAbilities,
      siAchievements, siArtifacts, siEvents, siDailyChallenge,
      siLevel, siXp, siCoins, siSilk, siTitleIndex, siStats,
    };
  }, [siWeavers, siLooms, siMaterials, siStructures, siAbilities,
    siAchievements, siArtifacts, siEvents, siDailyChallenge,
    siLevel, siXp, siCoins, siSilk, siTitleIndex, siStats]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helper: add log entry ────────────────────────────────────────────────
  const appendLog = useCallback((message: string, type: LogEntry['type']) => {
    setLog(prev => [...prev.slice(-99), { timestamp: Date.now(), message, type }]);
  }, []);

  // ── Initialization ───────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized) return;

    const initWeavers: Weaver[] = WEAVER_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      species: t.species,
      description: t.description,
      rarity: t.rarity,
      emoji: t.emoji,
      power: t.power,
      cost: t.cost,
      xpReward: t.xpReward,
      recruited: false,
      loyalty: 0,
      recruitedAt: null,
    }));

    const initLooms: Loom[] = LOOM_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      emoji: t.emoji,
      level: i === 0 ? 1 : 0,
      resources: t.resources,
      capacity: t.capacity,
      unlockLevel: t.unlockLevel,
      unlocked: i === 0,
      upgradeCost: t.baseUpgradeCost,
    }));

    const initMaterials: SilkMaterial[] = MATERIAL_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      rarity: t.rarity,
      category: t.category,
      quantity: 0,
      maxQuantity: t.maxQuantity,
      effect: t.effect,
      effectValue: t.effectValue,
    }));

    const initStructures: Structure[] = STRUCTURE_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      emoji: t.emoji,
      level: i === 0 ? 1 : 0,
      maxLevel: t.maxLevel,
      unlocked: i === 0,
      bonusType: t.bonusType,
      bonusValue: i === 0 ? t.baseBonusValue : 0,
      upgradeCost: t.baseUpgradeCost,
    }));

    const initAbilities: SilkAbility[] = ABILITY_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      category: t.category,
      cooldown: t.cooldown,
      currentCooldown: 0,
      unlocked: i < 3,
      silkCost: t.silkCost,
      powerMultiplier: t.powerMultiplier,
      tier: t.tier,
    }));

    const initAchievements: SilkAchievement[] = ACHIEVEMENT_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      conditionKey: t.conditionKey,
      targetValue: t.targetValue,
      progress: 0,
      completed: false,
      rewardXp: t.rewardXp,
      icon: t.icon,
      unlockedAt: null,
    }));

    const initArtifacts: SilkArtifact[] = ARTIFACT_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      rarity: t.rarity,
      emoji: t.emoji,
      power: t.power,
      activated: false,
      activatedAt: null,
    }));

    const initEvents: DynastyEvent[] = EVENT_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      emoji: t.emoji,
      effectType: t.effectType,
      effectValue: t.effectValue,
      duration: t.duration,
      triggered: false,
      triggeredAt: null,
    }));

    setSiWeavers(initWeavers);
    setSiLooms(initLooms);
    setSiMaterials(initMaterials);
    setSiStructures(initStructures);
    setSiAbilities(initAbilities);
    setSiAchievements(initAchievements);
    setSiArtifacts(initArtifacts);
    setSiEvents(initEvents);
    setInitialized(true);

    appendLog('The Silk Dynasty awakens. Your journey as a master weaver begins.', 'weave');
  }, [initialized, appendLog]);

  // ── Tick: resource regen + cooldown reduction ────────────────────────────
  useEffect(() => {
    if (!initialized) return;

    tickRef.current = setInterval(() => {
      setSiSilk(prev => Math.min(prev + SI_SILK_REGEN_RATE, SI_MAX_SILK));
      setSiCoins(prev => Math.min(prev + SI_COIN_REGEN_RATE, SI_MAX_COINS));

      setSiAbilities(prev => prev.map(a => {
        if (a.currentCooldown <= 0) return a;
        return { ...a, currentCooldown: Math.max(0, a.currentCooldown - SI_TICK_INTERVAL) };
      }));

      setSiEvents(prev => prev.map(e => {
        if (!e.triggered || !e.triggeredAt) return e;
        if (Date.now() - e.triggeredAt > e.duration) {
          return { ...e, triggered: false, triggeredAt: null };
        }
        return e;
      }));
    }, SI_TICK_INTERVAL);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [initialized]);

  // ── Daily Challenge Generator ────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;

    const now = Date.now();
    const lastDC = siDailyChallenge;
    if (lastDC && now < lastDC.expiresAt) return;

    const randomWeaverId = Math.floor(Math.random() * SI_WEAVER_COUNT);
    const bonusSpecies = SI_SPECIES[Math.floor(Math.random() * SI_SPECIES.length)];

    setSiDailyChallenge({
      weaverId: randomWeaverId,
      challenge: DAILY_CHALLENGES[Math.floor(Math.random() * DAILY_CHALLENGES.length)],
      reward: 50 + siLevel * 10,
      completed: false,
      expiresAt: now + SI_DAILY_CHALLENGE_DURATION,
      bonusSpecies,
    });
  }, [initialized, siDailyChallenge, siLevel]);

  // ── Helper: update stats ─────────────────────────────────────────────────
  const updateStat = useCallback((key: keyof typeof siStats, amount: number) => {
    setSiStats(prev => ({ ...prev, [key]: prev[key] + amount }));
  }, []);

  // ── Helper: add XP with level-up check ───────────────────────────────────
  const addXp = useCallback((amount: number) => {
    setSiXp(prev => {
      let newXp = prev + amount;
      setSiLevel(lv => {
        let newLv = lv;
        while (newXp >= newLv * 100) {
          newXp -= newLv * 100;
          newLv++;
        }
        return newLv;
      });
      return newXp;
    });
    updateStat('totalXp', amount);
  }, [updateStat]);

  // ── Core Action: weaveSilk ───────────────────────────────────────────────
  const weaveSilk = useCallback((loomId: number) => {
    const loom = stateRef.current.siLooms[loomId];
    if (!loom || !loom.unlocked || loom.level <= 0) return;
    if (stateRef.current.siSilk < SI_BASE_WEAVE_COST) return;

    setSiSilk(prev => prev - SI_BASE_WEAVE_COST);
    setSiCoins(prev => Math.min(prev + loom.level * 5, SI_MAX_COINS));
    updateStat('totalCoins', loom.level * 5);
    addXp(loom.level * 3);
    updateStat('totalWoven', 1);
    appendLog(`Wove silk at ${loom.name} (Lv.${loom.level}). +${loom.level * 5} coins, +${loom.level * 3} XP.`, 'weave');
  }, [addXp, updateStat, appendLog]);

  // ── Core Action: spinThread ──────────────────────────────────────────────
  const spinThread = useCallback(() => {
    if (stateRef.current.siSilk < SI_BASE_SPIN_COST) return;

    setSiSilk(prev => prev - SI_BASE_SPIN_COST);
    addXp(8);
    updateStat('totalSpun', 1);

    // Grant a random common material
    const commonMaterials = stateRef.current.siMaterials.filter(m => m.rarity === 'common');
    if (commonMaterials.length > 0) {
      const mat = commonMaterials[Math.floor(Math.random() * commonMaterials.length)];
      if (mat.quantity < mat.maxQuantity) {
        setSiMaterials(prev => prev.map(m =>
          m.id === mat.id ? { ...m, quantity: Math.min(m.quantity + 1, m.maxQuantity) } : m
        ));
      }
    }

    appendLog('Spun a fresh batch of silk thread. +1 random material.', 'spin');
  }, [addXp, updateStat, appendLog]);

  // ── Core Action: buildStructure ──────────────────────────────────────────
  const buildStructure = useCallback((structureId: number) => {
    const structure = stateRef.current.siStructures[structureId];
    if (!structure) return;

    if (!structure.unlocked) {
      if (stateRef.current.siCoins < structure.upgradeCost) return;
      setSiCoins(prev => prev - structure.upgradeCost);
      setSiStructures(prev => prev.map((s, i) =>
        i === structureId ? { ...s, unlocked: true, level: 1, bonusValue: STRUCTURE_TEMPLATES[i].baseBonusValue } : s
      ));
      updateStat('totalStructuresBuilt', 1);
      appendLog(`Built ${structure.name} for the first time!`, 'build');
    } else {
      if (structure.level >= structure.maxLevel) return;
      const cost = Math.floor(structure.upgradeCost * (1 + structure.level * 0.5));
      if (stateRef.current.siCoins < cost) return;
      setSiCoins(prev => prev - cost);
      setSiStructures(prev => prev.map((s, i) =>
        i === structureId ? {
          ...s,
          level: s.level + 1,
          bonusValue: s.bonusValue + Math.floor(STRUCTURE_TEMPLATES[i].baseBonusValue * 0.2),
          upgradeCost: Math.floor(s.upgradeCost * 1.3),
        } : s
      ));
      appendLog(`Upgraded ${structure.name} to Lv.${structure.level + 1}.`, 'build');
    }
    addXp(20);
  }, [addXp, updateStat, appendLog]);

  // ── Core Action: activateArtifact ────────────────────────────────────────
  const activateArtifact = useCallback((artifactId: number) => {
    const artifact = stateRef.current.siArtifacts[artifactId];
    if (!artifact || artifact.activated) return;

    setSiArtifacts(prev => prev.map((a, i) =>
      i === artifactId ? { ...a, activated: true, activatedAt: Date.now() } : a
    ));
    addXp(artifact.power);
    updateStat('totalArtifacts', 1);
    appendLog(`Activated the ancient artifact: ${artifact.emoji} ${artifact.name}! +${artifact.power} XP.`, 'artifact');
  }, [addXp, updateStat, appendLog]);

  // ── Core Action: triggerDynastyEvent ─────────────────────────────────────
  const triggerDynastyEvent = useCallback(() => {
    const available = stateRef.current.siEvents.filter(e => !e.triggered);
    if (available.length === 0) return;

    const randomEvent = available[Math.floor(Math.random() * available.length)];

    setSiEvents(prev => prev.map((e, i) =>
      e.id === randomEvent.id ? { ...e, triggered: true, triggeredAt: Date.now() } : e
    ));

    // Apply event effects
    switch (randomEvent.effectType) {
      case 'coinBonus':
      case 'silkBonus':
      case 'featherDrop':
      case 'fiberBonus': {
        const amount = randomEvent.effectValue;
        if (randomEvent.effectType === 'coinBonus') {
          setSiCoins(prev => Math.min(prev + amount, SI_MAX_COINS));
          updateStat('totalCoins', amount);
        } else {
          setSiSilk(prev => Math.min(prev + amount, SI_MAX_SILK));
        }
        break;
      }
      case 'xpBonus': {
        addXp(randomEvent.effectValue);
        break;
      }
      case 'qualityBonus':
      case 'powerBonus':
      case 'treasureReveal': {
        // Grant random uncommon+ material
        const rareMats = stateRef.current.siMaterials.filter(m =>
          SI_RARITY_ORDER[m.rarity] >= SI_RARITY_ORDER['uncommon']
        );
        if (rareMats.length > 0) {
          const mat = rareMats[Math.floor(Math.random() * rareMats.length)];
          setSiMaterials(prev => prev.map(m =>
            m.id === mat.id ? { ...m, quantity: Math.min(m.quantity + 1, m.maxQuantity) } : m
          ));
        }
        break;
      }
    }

    updateStat('totalEvents', 1);
    appendLog(`Dynasty event: ${randomEvent.emoji} ${randomEvent.name} — ${randomEvent.description}`, 'event');
  }, [addXp, updateStat, appendLog]);

  // ── Core Action: resetSilkDynasty ────────────────────────────────────────
  const resetSilkDynasty = useCallback(() => {
    setInitialized(false);
    setLog([]);
    appendLog('The Silk Dynasty has been reset. A new era begins.', 'weave');
  }, [appendLog]);

  // ── Extended: discoverPavilion ───────────────────────────────────────────
  const discoverPavilion = useCallback((loomId: number) => {
    const loom = stateRef.current.siLooms[loomId];
    if (!loom || loom.unlocked) return;
    if (stateRef.current.siLevel < loom.unlockLevel) return;

    setSiLooms(prev => prev.map((l, i) =>
      i === loomId ? { ...l, unlocked: true, level: 1 } : l
    ));
    addXp(50);
    appendLog(`Discovered the ${loom.emoji} ${loom.name}! +50 XP.`, 'discover');
  }, [addXp, appendLog]);

  // ── Extended: checkAndClaimAchievements ──────────────────────────────────
  const checkAndClaimAchievements = useCallback(() => {
    const statMap: Record<string, number> = {
      totalWoven: stateRef.current.siStats.totalWoven,
      totalSpun: stateRef.current.siStats.totalSpun,
      totalStructuresBuilt: stateRef.current.siStats.totalStructuresBuilt,
      totalArtifacts: stateRef.current.siStats.totalArtifacts,
      totalEvents: stateRef.current.siStats.totalEvents,
      totalCoins: stateRef.current.siStats.totalCoins,
      totalXp: stateRef.current.siStats.totalXp,
      loomsUnlocked: stateRef.current.siLooms.filter(l => l.unlocked).length,
      weaversRecruited: stateRef.current.siWeavers.filter(w => w.recruited).length,
      legendaryRecruited: stateRef.current.siWeavers.filter(w => w.recruited && w.rarity === 'legendary').length,
      level: stateRef.current.siLevel,
      achievementsCompleted: stateRef.current.siAchievements.filter(a => a.completed).length,
    };

    let totalRewardXp = 0;
    setSiAchievements(prev => prev.map(a => {
      if (a.completed) return a;
      const val = statMap[a.conditionKey] ?? 0;
      const newProgress = Math.min(val, a.targetValue);
      if (newProgress >= a.targetValue) {
        totalRewardXp += a.rewardXp;
        return { ...a, progress: newProgress, completed: true, unlockedAt: Date.now() };
      }
      return { ...a, progress: newProgress };
    }));

    if (totalRewardXp > 0) {
      addXp(totalRewardXp);
      appendLog(`Claimed achievements! +${totalRewardXp} total XP.`, 'achievement');
    }
  }, [addXp, appendLog]);

  // ── Extended: useAbility ─────────────────────────────────────────────────
  const useAbility = useCallback((abilityId: number) => {
    const ability = stateRef.current.siAbilities[abilityId];
    if (!ability || !ability.unlocked) return;
    if (ability.currentCooldown > 0) return;
    if (stateRef.current.siSilk < ability.silkCost) return;

    setSiSilk(prev => prev - ability.silkCost);
    setSiAbilities(prev => prev.map((a, i) =>
      i === abilityId ? { ...a, currentCooldown: a.cooldown } : a
    ));

    const xpGain = Math.floor(ability.powerMultiplier * 10);
    addXp(xpGain);
    appendLog(`Used ability: ${ability.name} (${ability.category}). -${ability.silkCost} silk, +${xpGain} XP.`, 'ability');
  }, [addXp, appendLog]);

  // ── Helper: recruitWeaver ────────────────────────────────────────────────
  const recruitWeaver = useCallback((weaverId: number) => {
    const weaver = stateRef.current.siWeavers[weaverId];
    if (!weaver || weaver.recruited) return;
    if (stateRef.current.siCoins < weaver.cost) return;

    setSiCoins(prev => prev - weaver.cost);
    setSiWeavers(prev => prev.map((w, i) =>
      i === weaverId ? { ...w, recruited: true, loyalty: 50, recruitedAt: Date.now() } : w
    ));
    addXp(weaver.xpReward);
    appendLog(`Recruited ${weaver.emoji} ${weaver.name} (${weaver.species})! -${weaver.cost} coins, +${weaver.xpReward} XP.`, 'recruit');
  }, [addXp, appendLog]);

  // ── Helper: upgradeLoom ──────────────────────────────────────────────────
  const upgradeLoom = useCallback((loomId: number) => {
    const loom = stateRef.current.siLooms[loomId];
    if (!loom || !loom.unlocked) return;
    if (stateRef.current.siCoins < loom.upgradeCost) return;

    setSiCoins(prev => prev - loom.upgradeCost);
    setSiLooms(prev => prev.map((l, i) =>
      i === loomId ? {
        ...l,
        level: l.level + 1,
        capacity: l.capacity + 5,
        upgradeCost: Math.floor(l.upgradeCost * 1.4),
      } : l
    ));
    addXp(15);
    appendLog(`Upgraded ${loom.emoji} ${loom.name} to Lv.${loom.level + 1}.`, 'build');
  }, [addXp, appendLog]);

  // ── Helper: tradeMaterial ────────────────────────────────────────────────
  const tradeMaterial = useCallback((materialId: number, amount: number) => {
    const material = stateRef.current.siMaterials[materialId];
    if (!material || material.quantity < amount) return;

    const coinGain = Math.floor(amount * material.effectValue * 0.5);
    setSiMaterials(prev => prev.map(m =>
      m.id === materialId ? { ...m, quantity: m.quantity - amount } : m
    ));
    setSiCoins(prev => Math.min(prev + coinGain, SI_MAX_COINS));
    updateStat('totalCoins', coinGain);
    appendLog(`Traded ${amount}x ${material.name} for ${coinGain} coins.`, 'trade');
  }, [updateStat, appendLog]);

  // ── Helper: boostLoyalty ────────────────────────────────────────────────
  const boostLoyalty = useCallback((weaverId: number) => {
    const weaver = stateRef.current.siWeavers[weaverId];
    if (!weaver || !weaver.recruited) return;

    setSiWeavers(prev => prev.map((w, i) =>
      i === weaverId ? { ...w, loyalty: Math.min(w.loyalty + 10, 100) } : w
    ));
  }, []);

  // ── Title System ─────────────────────────────────────────────────────────
  const currentTitleInfo = useMemo(() => ({
    name: TITLE_NAMES[siTitleIndex],
    threshold: TITLE_THRESHOLDS[siTitleIndex],
    index: siTitleIndex,
  }), [siTitleIndex]);

  const nextTitleInfo = useMemo(() => {
    if (siTitleIndex >= TITLE_THRESHOLDS.length - 1) return null;
    return {
      name: TITLE_NAMES[siTitleIndex + 1],
      threshold: TITLE_THRESHOLDS[siTitleIndex + 1],
      index: siTitleIndex + 1,
    };
  }, [siTitleIndex]);

  const titleProgress = useMemo(() => {
    if (siTitleIndex >= TITLE_THRESHOLDS.length - 1) return 100;
    const currentThreshold = TITLE_THRESHOLDS[siTitleIndex];
    const nextThreshold = TITLE_THRESHOLDS[siTitleIndex + 1];
    const xpTotal = siStats.totalXp;
    if (xpTotal >= nextThreshold) return 100;
    return Math.floor(((xpTotal - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  }, [siTitleIndex, siStats.totalXp]);

  // Auto title-upgrade
  useEffect(() => {
    for (let i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (siStats.totalXp >= TITLE_THRESHOLDS[i] && siTitleIndex < i) {
        setSiTitleIndex(i);
        appendLog(`Title promoted to: ${TITLE_NAMES[i]}!`, 'title');
        break;
      }
    }
  }, [siStats.totalXp, siTitleIndex, appendLog]);

  // ── Stats: statsSummary ──────────────────────────────────────────────────
  const statsSummary = useMemo(() => ({
    ...siStats,
    level: siLevel,
    xp: siXp,
    coins: siCoins,
    silk: siSilk,
    title: TITLE_NAMES[siTitleIndex],
    weaversRecruited: siWeavers.filter(w => w.recruited).length,
    loomsUnlocked: siLooms.filter(l => l.unlocked).length,
    structuresUnlocked: siStructures.filter(s => s.unlocked).length,
    abilitiesUnlocked: siAbilities.filter(a => a.unlocked).length,
    artifactsActivated: siArtifacts.filter(a => a.activated).length,
  }), [siStats, siLevel, siXp, siCoins, siSilk, siTitleIndex, siWeavers, siLooms, siStructures, siAbilities, siArtifacts]);

  // ── Stats: completionStats ───────────────────────────────────────────────
  const completionStats = useMemo(() => {
    const weaversCompleted = siWeavers.filter(w => w.recruited).length;
    const loomsCompleted = siLooms.filter(l => l.unlocked).length;
    const achievementsCompleted = siAchievements.filter(a => a.completed).length;
    const artifactsCompleted = siArtifacts.filter(a => a.activated).length;
    const structuresUnlocked = siStructures.filter(s => s.unlocked).length;

    return {
      weaversRecruited: weaversCompleted,
      weaversTotal: SI_WEAVER_COUNT,
      weaversPercent: Math.floor((weaversCompleted / SI_WEAVER_COUNT) * 100),
      loomsUnlocked: loomsCompleted,
      loomsTotal: SI_LOOM_COUNT,
      loomsPercent: Math.floor((loomsCompleted / SI_LOOM_COUNT) * 100),
      achievementsCompleted,
      achievementsTotal: SI_ACHIEVEMENT_COUNT,
      achievementsPercent: Math.floor((achievementsCompleted / SI_ACHIEVEMENT_COUNT) * 100),
      artifactsActivated: artifactsCompleted,
      artifactsTotal: SI_ARTIFACT_COUNT,
      artifactsPercent: Math.floor((artifactsCompleted / SI_ARTIFACT_COUNT) * 100),
      structuresUnlocked,
      structuresTotal: SI_STRUCTURE_COUNT,
      structuresPercent: Math.floor((structuresUnlocked / SI_STRUCTURE_COUNT) * 100),
      overallPercent: Math.floor((
        (weaversCompleted / SI_WEAVER_COUNT) +
        (loomsCompleted / SI_LOOM_COUNT) +
        (achievementsCompleted / SI_ACHIEVEMENT_COUNT) +
        (artifactsCompleted / SI_ARTIFACT_COUNT)
      ) / 4 * 100),
    };
  }, [siWeavers, siLooms, siAchievements, siArtifacts, siStructures]);

  // ── Enriched: enrichedWeavers ────────────────────────────────────────────
  const enrichedWeavers = useMemo(() =>
    siWeavers.map(w => ({
      ...w,
      speciesEmoji: SI_SPECIES_EMOJIS[w.species] ?? '❓',
      speciesLabel: SI_SPECIES_LABELS[w.species] ?? w.species,
      rarityLabel: SI_RARITY_NAMES[w.rarity],
      rarityColor: SI_RARITY_COLORS[w.rarity],
      canRecruit: !w.recruited && siCoins >= w.cost,
      isMaxLoyalty: w.loyalty >= 100,
    })),
  [siWeavers, siCoins]);

  // ── Enriched: enrichedLooms ──────────────────────────────────────────────
  const enrichedLooms = useMemo(() =>
    siLooms.map(l => ({
      ...l,
      canDiscover: !l.unlocked && siLevel >= l.unlockLevel,
      canUpgrade: l.unlocked && siCoins >= l.upgradeCost,
      levelPercent: l.level > 0 ? Math.floor((l.level / 10) * 100) : 0,
      isMaxLevel: l.level >= 10,
    })),
  [siLooms, siLevel, siCoins]);

  // ── Enriched: enrichedStructures ─────────────────────────────────────────
  const enrichedStructures = useMemo(() =>
    siStructures.map(s => {
      const upgradeCost = Math.floor(s.upgradeCost * (1 + s.level * 0.5));
      return {
        ...s,
        canBuild: !s.unlocked && siCoins >= s.upgradeCost,
        canUpgrade: s.unlocked && s.level < s.maxLevel && siCoins >= upgradeCost,
        levelPercent: Math.floor((s.level / s.maxLevel) * 100),
        isMaxLevel: s.level >= s.maxLevel,
        currentUpgradeCost: s.unlocked ? upgradeCost : s.upgradeCost,
      };
    }),
  [siStructures, siCoins]);

  // ── Enriched: enrichedInventory ──────────────────────────────────────────
  const enrichedInventory = useMemo(() =>
    siMaterials.map(m => ({
      ...m,
      rarityLabel: SI_RARITY_NAMES[m.rarity],
      rarityColor: SI_RARITY_COLORS[m.rarity],
      quantityPercent: m.maxQuantity > 0 ? Math.floor((m.quantity / m.maxQuantity) * 100) : 0,
      isFull: m.quantity >= m.maxQuantity,
      isEmpty: m.quantity === 0,
    })),
  [siMaterials]);

  // ── Computed: weaversByType ──────────────────────────────────────────────
  const weaversByType = useMemo(() => {
    const grouped: Record<string, Weaver[]> = {};
    for (const species of SI_SPECIES) {
      grouped[species] = siWeavers.filter(w => w.species === species);
    }
    return grouped;
  }, [siWeavers]);

  // ── Computed: weaversByRarity ────────────────────────────────────────────
  const weaversByRarity = useMemo(() => {
    const grouped: Record<RarityTier, Weaver[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    siWeavers.forEach(w => grouped[w.rarity].push(w));
    return grouped;
  }, [siWeavers]);

  // ── Computed: availableCandidates ────────────────────────────────────────
  const availableCandidates = useMemo(() =>
    siWeavers
      .filter(w => !w.recruited && siCoins >= w.cost)
      .sort((a, b) => SI_RARITY_ORDER[b.rarity] - SI_RARITY_ORDER[a.rarity]),
  [siWeavers, siCoins]);

  // ── Computed: pendingAchievements ────────────────────────────────────────
  const pendingAchievements = useMemo(() =>
    siAchievements.filter(a => !a.completed && a.progress >= a.targetValue),
  [siAchievements]);

  // ── Computed: recentEventLog ─────────────────────────────────────────────
  const recentEventLog = useMemo(() =>
    log.filter(l => l.type === 'event').slice(-10),
  [log]);

  // ── Computed: activeEvents ───────────────────────────────────────────────
  const activeEvents = useMemo(() =>
    siEvents.filter(e => e.triggered && e.triggeredAt !== null),
  [siEvents]);

  // ── Computed: materialsByCategory ────────────────────────────────────────
  const materialsByCategory = useMemo(() => {
    const grouped: Record<string, SilkMaterial[]> = {};
    siMaterials.forEach(m => {
      if (!grouped[m.category]) grouped[m.category] = [];
      grouped[m.category].push(m);
    });
    return grouped;
  }, [siMaterials]);

  // ── Computed: materialsByRarity ──────────────────────────────────────────
  const materialsByRarity = useMemo(() => {
    const grouped: Record<RarityTier, SilkMaterial[]> = {
      common: [], uncommon: [], rare: [], epic: [], legendary: [],
    };
    siMaterials.forEach(m => grouped[m.rarity].push(m));
    return grouped;
  }, [siMaterials]);

  // ── Computed: abilitiesByCategory ────────────────────────────────────────
  const abilitiesByCategory = useMemo(() => {
    const grouped: Record<AbilityCategory, SilkAbility[]> = {
      offensive: [], defensive: [], utility: [], summon: [],
    };
    siAbilities.forEach(a => grouped[a.category].push(a));
    return grouped;
  }, [siAbilities]);

  // ── Computed: recruitedWeavers ───────────────────────────────────────────
  const recruitedWeavers = useMemo(() =>
    siWeavers.filter(w => w.recruited),
  [siWeavers]);

  // ── Computed: totalWeaverPower ──────────────────────────────────────────
  const totalWeaverPower = useMemo(() =>
    recruitedWeavers.reduce((sum, w) => sum + w.power, 0),
  [recruitedWeavers]);

  // ── Computed: silkPercent ────────────────────────────────────────────────
  const silkPercent = useMemo(() =>
    Math.floor((siSilk / SI_MAX_SILK) * 100),
  [siSilk]);

  // ── Computed: coinsPercent ───────────────────────────────────────────────
  const coinsPercent = useMemo(() =>
    Math.floor((siCoins / SI_MAX_COINS) * 100),
  [siCoins]);

  // ── Computed: xpToNextLevel ─────────────────────────────────────────────
  const xpToNextLevel = useMemo(() => {
    const needed = siLevel * 100;
    return { current: siXp, needed, percent: Math.floor((siXp / needed) * 100) };
  }, [siXp, siLevel]);

  // ── Computed: avgWeaverLoyalty ──────────────────────────────────────────
  const avgWeaverLoyalty = useMemo(() => {
    const recruited = siWeavers.filter(w => w.recruited);
    if (recruited.length === 0) return 0;
    return Math.floor(recruited.reduce((s, w) => s + w.loyalty, 0) / recruited.length);
  }, [siWeavers]);

  // ── Computed: totalStructureBonus ──────────────────────────────────────
  const totalStructureBonus = useMemo(() =>
    siStructures.reduce((sum, s) => sum + s.bonusValue, 0),
  [siStructures]);

  // ── Computed: maxAbilityTier ───────────────────────────────────────────
  const maxAbilityTier = useMemo(() =>
    Math.max(...siAbilities.filter(a => a.unlocked).map(a => a.tier), 0),
  [siAbilities]);

  // ── Computed: totalMaterialValue ───────────────────────────────────────
  const totalMaterialValue = useMemo(() =>
    siMaterials.reduce((sum, m) => sum + m.quantity * m.effectValue, 0),
  [siMaterials]);

  // ── Computed: rarestRecruitedWeaver ────────────────────────────────────
  const rarestRecruitedWeaver = useMemo(() => {
    const recruited = siWeavers.filter(w => w.recruited);
    if (recruited.length === 0) return null;
    return recruited.sort((a, b) => SI_RARITY_ORDER[b.rarity] - SI_RARITY_ORDER[a.rarity])[0];
  }, [siWeavers]);

  // ── Computed: unlockedStructureCount ────────────────────────────────────
  const unlockedStructureCount = useMemo(() =>
    siStructures.filter(s => s.unlocked).length,
  [siStructures]);

  // ── Computed: maxLevelStructure ─────────────────────────────────────────
  const maxLevelStructure = useMemo(() => {
    const unlocked = siStructures.filter(s => s.unlocked);
    if (unlocked.length === 0) return null;
    return unlocked.sort((a, b) => b.level - a.level)[0];
  }, [siStructures]);

  // ── Computed: weaverSpeciesSummary ──────────────────────────────────────
  const weaverSpeciesSummary = useMemo(() => {
    const summary: Record<string, { total: number; recruited: number; totalPower: number }> = {};
    for (const species of SI_SPECIES) {
      const all = siWeavers.filter(w => w.species === species);
      summary[species] = {
        total: all.length,
        recruited: all.filter(w => w.recruited).length,
        totalPower: all.filter(w => w.recruited).reduce((s, w) => s + w.power, 0),
      };
    }
    return summary;
  }, [siWeavers]);

  // ── Computed: completedDailyChallenge ───────────────────────────────────
  const completedDailyChallenge = useMemo(() =>
    siDailyChallenge?.completed ?? false,
  [siDailyChallenge]);

  // ── Computed: dailyChallengeWeaver ──────────────────────────────────────
  const dailyChallengeWeaver = useMemo(() => {
    if (!siDailyChallenge) return null;
    return siWeavers[siDailyChallenge.weaverId] ?? null;
  }, [siDailyChallenge, siWeavers]);

  // ── Extended: completeDailyChallenge ───────────────────────────────────
  const completeDailyChallenge = useCallback(() => {
    if (!siDailyChallenge || siDailyChallenge.completed) return;

    setSiDailyChallenge(prev => prev ? { ...prev, completed: true } : null);
    const reward = siDailyChallenge.reward;
    addXp(reward);
    setSiCoins(prev => Math.min(prev + reward, SI_MAX_COINS));
    updateStat('totalCoins', reward);
    appendLog(`Completed daily challenge: ${siDailyChallenge.challenge}! +${reward} XP +${reward} coins.`, 'daily');
  }, [siDailyChallenge, addXp, updateStat, appendLog]);

  // ── Extended: unlockAbility ─────────────────────────────────────────────
  const unlockAbility = useCallback((abilityId: number) => {
    const ability = stateRef.current.siAbilities[abilityId];
    if (!ability || ability.unlocked) return;
    if (stateRef.current.siCoins < ability.silkCost * 3) return;

    const cost = ability.silkCost * 3;
    setSiCoins(prev => prev - cost);
    setSiAbilities(prev => prev.map((a, i) =>
      i === abilityId ? { ...a, unlocked: true } : a
    ));
    appendLog(`Unlocked ability: ${ability.name} (-${cost} coins).`, 'ability');
  }, [appendLog]);

  // ── Extended: feedSilkworms ──────────────────────────────────────────────
  const feedSilkworms = useCallback(() => {
    if (stateRef.current.siSilk < 5) return;

    setSiSilk(prev => prev - 5);
    setSiCoins(prev => Math.min(prev + 3, SI_MAX_COINS));
    updateStat('totalCoins', 3);

    // Boost loyalty of all recruited silkworm_spirit weavers
    setSiWeavers(prev => prev.map(w =>
      w.species === 'silkworm_spirit' && w.recruited
        ? { ...w, loyalty: Math.min(w.loyalty + 2, 100) }
        : w
    ));
    appendLog('Fed silkworms fresh mulberry leaves. +3 coins, silkworm loyalty boosted.', 'spin');
  }, [updateStat, appendLog]);

  // ── Extended: randomRecruit ─────────────────────────────────────────────
  const randomRecruit = useCallback(() => {
    const unrecruited = stateRef.current.siWeavers.filter(w => !w.recruited);
    if (unrecruited.length === 0) return;

    // Weight toward lower rarities
    const weights = unrecruited.map(w => {
      switch (w.rarity) {
        case 'common': return 50;
        case 'uncommon': return 25;
        case 'rare': return 12;
        case 'epic': return 5;
        case 'legendary': return 1;
      }
    });
    const totalWeight = weights.reduce((s, w) => s + w, 0);
    let roll = Math.random() * totalWeight;
    let chosenIndex = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { chosenIndex = i; break; }
    }

    recruitWeaver(unrecruited[chosenIndex].id);
  }, [recruitWeaver]);

  // ── Auto-check achievements periodically ─────────────────────────────────
  useEffect(() => {
    if (!initialized) return;
    const interval = setInterval(() => {
      checkAndClaimAchievements();
    }, SI_ACHIEVEMENT_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [initialized, checkAndClaimAchievements]);

  // ─── Return: Pattern A — all constants + state + actions + computed ──────
  return {
    // ── Constants ──
    SI_SPECIES,
    SI_SPECIES_EMOJIS,
    SI_SPECIES_LABELS,
    SI_MAX_SILK,
    SI_MAX_XP,
    SI_MAX_COINS,
    SI_WEAVER_COUNT,
    SI_LOOM_COUNT,
    SI_MATERIAL_COUNT,
    SI_STRUCTURE_COUNT,
    SI_ABILITY_COUNT,
    SI_ACHIEVEMENT_COUNT,
    SI_TITLE_COUNT,
    SI_ARTIFACT_COUNT,
    SI_EVENT_COUNT,
    SI_MAX_STRUCTURE_LEVEL,
    SI_BASE_WEAVE_COST,
    SI_BASE_SPIN_COST,
    SI_BASE_BUILD_COST,
    SI_SILK_REGEN_RATE,
    SI_COIN_REGEN_RATE,
    SI_EVENT_DURATION,
    SI_DAILY_CHALLENGE_DURATION,
    SI_TICK_INTERVAL,
    SI_ACHIEVEMENT_CHECK_INTERVAL,
    SI_CHALLENGE_COUNT,
    SI_COLOR_CRIMSON,
    SI_COLOR_SILK_WHITE,
    SI_COLOR_JADE_GREEN,
    SI_COLOR_GOLD_THREAD,
    SI_COLOR_INK_BLACK,
    SI_COLOR_IMPERIAL_PURPLE,
    SI_COLORS,
    SI_RARITY_ORDER,
    SI_RARITY_NAMES,
    SI_RARITY_COLORS,
    SI_WEAVERS,
    SI_LOOMS,
    SI_MATERIALS,
    SI_ABILITY_CATEGORIES,
    SI_MATERIAL_CATEGORIES,
    SI_LOG_MAX_ENTRIES,

    // ── State ──
    siWeavers,
    siLooms,
    siMaterials,
    siStructures,
    siAbilities,
    siAchievements,
    siArtifacts,
    siEvents,
    siDailyChallenge,
    siLevel,
    siXp,
    siCoins,
    siSilk,
    siTitleIndex,
    siStats,
    initialized,
    log,

    // ── Core Actions ──
    weaveSilk,
    spinThread,
    buildStructure,
    activateArtifact,
    triggerDynastyEvent,
    resetSilkDynasty,

    // ── Extended Actions ──
    discoverPavilion,
    checkAndClaimAchievements,
    useAbility,
    recruitWeaver,
    upgradeLoom,
    tradeMaterial,
    boostLoyalty,
    completeDailyChallenge,
    unlockAbility,
    feedSilkworms,
    randomRecruit,

    // ── Title System ──
    TITLE_NAMES,
    TITLE_THRESHOLDS,
    currentTitleInfo,
    nextTitleInfo,
    titleProgress,

    // ── Stats ──
    statsSummary,
    completionStats,

    // ── Enriched Data ──
    enrichedWeavers,
    enrichedLooms,
    enrichedStructures,
    enrichedInventory,

    // ── Computed ──
    weaversByType,
    weaversByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    activeEvents,
    materialsByCategory,
    materialsByRarity,
    abilitiesByCategory,
    recruitedWeavers,
    totalWeaverPower,
    silkPercent,
    coinsPercent,
    xpToNextLevel,
    avgWeaverLoyalty,
    totalStructureBonus,
    maxAbilityTier,
    totalMaterialValue,
    rarestRecruitedWeaver,
    unlockedStructureCount,
    maxLevelStructure,
    weaverSpeciesSummary,
    completedDailyChallenge,
    dailyChallengeWeaver,
  };
}
