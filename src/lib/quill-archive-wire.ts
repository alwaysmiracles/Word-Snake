import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Quill Archive (羽笔档案馆) — Wire Module
//
// An ancient magical library where enchanted quill creatures,
// ink spirits, and parchment golems guard forgotten knowledge
// across vast archive halls. Players bind scribes, study halls,
// build structures, activate artifacts, face archive events,
// and ascend through 8 titles.
//
// Storage key: quill-archive-save
// Prefix: qa / QA_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type QaRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type QaSpecies =
  | 'quill_phoenix'
  | 'ink_spirit'
  | 'parchment_golem'
  | 'scroll_dragon'
  | 'librarian_wraith'
  | 'book_wyrm'
  | 'cipher_fox';

type QaAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type QaStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'inkYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type QaMaterialCategory = 'ink' | 'parchment' | 'quill' | 'binding' | 'seal' | 'gem' | 'metal';

// ---- Creature Definitions ----

interface QaCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: QaSpecies;
  readonly rarity: QaRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface QaChamberDef {
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

interface QaMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: QaRarity;
  readonly value: number;
  readonly category: QaMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface QaStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: QaStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface QaAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: QaAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: QaRarity;
}

// ---- Achievement Definitions ----

interface QaAchievementDef {
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

interface QaTitleDef {
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

interface QaArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: QaRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface QaEventDef {
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

interface QaOwnedScribe {
  creatureId: string;
  instanceId: string;
  boundAt: number;
  timesUsed: number;
  nickname: string;
}

interface QaChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface QaStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface QaArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface QaAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface QaAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface QaInventoryItem {
  materialId: string;
  count: number;
}

interface QaEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface QaStats {
  totalBound: number;
  totalHalls: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface QaTitleProgress {
  current: QaTitleDef;
  next: QaTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: QA_ CONSTANTS
// ============================================================

const QA_SAVE_KEY = 'quill-archive-save';
const QA_MAX_LEVEL = 50;
const QA_STARTING_COINS = 300;
const QA_STARTING_XP = 0;
const QA_XP_BASE = 100;
const QA_XP_SCALE = 1.5;
const QA_AUTO_SAVE_MS = 15000;
const QA_EVENT_DURATION_MS = 60000;
const QA_MAX_INVENTORY_ITEM = 999;
const QA_MAX_OWNED_SCRIBES = 100;
const QA_COOLDOWN_TICK_MS = 1000;
const QA_SPECIES_COUNT = 7;
const QA_CREATURE_COUNT = 35;
const QA_CHAMBER_COUNT = 8;
const QA_MATERIAL_COUNT = 12;
const QA_STRUCTURE_COUNT = 8;
const QA_ABILITY_COUNT = 8;
const QA_ACHIEVEMENT_COUNT = 10;
const QA_TITLE_COUNT = 8;
const QA_ARTIFACT_COUNT = 6;
const QA_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const QA_PARCHMENT = '#F5E6CC';
const QA_INK_BLACK = '#2C3E50';
const QA_QUILL_GOLD = '#D4AC0D';
const QA_LEATHER_BROWN = '#6E2C00';
const QA_VELLUM = '#FDEBD0';
const QA_SEAL_RED = '#C0392B';
const QA_MARBLE = '#D5D8DC';

const QA_RARITY_COLORS: Record<QaRarity, string> = {
  common: '#A0A090',
  uncommon: '#4FC3F7',
  rare: '#AB47BC',
  epic: '#FF7043',
  legendary: '#FFD700',
};

const QA_SPECIES_COLORS: Record<QaSpecies, string> = {
  quill_phoenix: QA_QUILL_GOLD,
  ink_spirit: QA_INK_BLACK,
  parchment_golem: QA_PARCHMENT,
  scroll_dragon: QA_SEAL_RED,
  librarian_wraith: '#7D3C98',
  book_wyrm: QA_LEATHER_BROWN,
  cipher_fox: QA_MARBLE,
};

const QA_ALL_COLORS = [
  QA_PARCHMENT,
  QA_INK_BLACK,
  QA_QUILL_GOLD,
  QA_LEATHER_BROWN,
  QA_VELLUM,
  QA_SEAL_RED,
  QA_MARBLE,
];

// ============================================================
// SECTION 4: QA_SPECIES — 7 Species Types
// ============================================================

const QA_SPECIES: { id: QaSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'quill_phoenix',
    name: 'Quill Phoenix',
    description: 'Radiant birds born from enchanted quills that ignite with knowledge-fire when inspired.',
    lore: 'Quill Phoenixes rise from the ashes of burned scrolls, carrying the wisdom of every word ever written on them.',
    emoji: '🪶',
    color: QA_QUILL_GOLD,
  },
  {
    id: 'ink_spirit',
    name: 'Ink Spirit',
    description: 'Ethereal beings of liquid ink that flow between pages, rewriting reality with their touch.',
    lore: 'Ink Spirits are said to be the souls of forgotten authors, given form by the magic of the Archive.',
    emoji: '👻',
    color: QA_INK_BLACK,
  },
  {
    id: 'parchment_golem',
    name: 'Parchment Golem',
    description: 'Towering constructs of layered parchment, bound by ancient sealing wax and arcane stitches.',
    lore: 'Parchment Golems are the oldest guardians of the Archive, their pages containing every law ever recorded.',
    emoji: '📜',
    color: QA_PARCHMENT,
  },
  {
    id: 'scroll_dragon',
    name: 'Scroll Dragon',
    description: 'Serpentine dragons with bodies made of unfurling scrolls that breathe verses of power.',
    lore: 'Scroll Dragons guard the deepest vaults, their breath capable of rewriting the history recorded on their scales.',
    emoji: '🐉',
    color: QA_SEAL_RED,
  },
  {
    id: 'librarian_wraith',
    name: 'Librarian Wraith',
    description: 'Spectral scholars who drift through the archive, organizing knowledge with ghostly precision.',
    lore: 'Librarian Wraiths were once mortal archivists who chose to serve the Archive for eternity.',
    emoji: '🔮',
    color: '#7D3C98',
  },
  {
    id: 'book_wyrm',
    name: 'Book Wyrm',
    description: 'Worm-like creatures that burrow through bookshelves, devouring damaged tomes and leaving mended pages.',
    lore: 'Book Wyrms are the Archive\'s natural repair system — they consume decay and exude preservation magic.',
    emoji: '🐛',
    color: QA_LEATHER_BROWN,
  },
  {
    id: 'cipher_fox',
    name: 'Cipher Fox',
    description: 'Clever foxes with fur that shifts to display encrypted text, masters of hidden knowledge.',
    lore: 'Cipher Foxes can crack any code in the Archive, but they only share answers with those who ask wisely.',
    emoji: '🦊',
    color: QA_MARBLE,
  },
];

// ============================================================
// SECTION 5: QA_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const QA_CREATURES: QaCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'quill_phoenix_common', name: 'Featherling', species: 'quill_phoenix', rarity: 'common',
    description: 'A tiny phoenix chick with quill-like feathers that glow faintly when near books.',
    lore: 'Featherlings are the first companions of new archivists, drawn to the scent of fresh ink.',
    emoji: '🪶', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'ink_spirit_common', name: 'Droplet', species: 'ink_spirit', rarity: 'common',
    description: 'A small puddle of living ink that follows its binder, leaving tiny words in its wake.',
    lore: 'Droplets form when ink is spilled on magical parchment — the words come alive.',
    emoji: '👻', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'parchment_golem_common', name: 'Scroll Sentry', species: 'parchment_golem', rarity: 'common',
    description: 'A small humanoid of crumpled parchment standing guard at the archive entrance.',
    lore: 'Scroll Sentries are the first line of defense, their bodies inscribed with basic warding runes.',
    emoji: '📜', power: 12, defense: 10, cost: 22, xpReward: 9,
  },
  {
    id: 'scroll_dragon_common', name: 'Codex Wyrmling', species: 'scroll_dragon', rarity: 'common',
    description: 'A baby dragon curled around a single scroll, protective of its first treasure.',
    lore: 'Codex Wyrmlings imprint on the first scroll they see, guarding it with surprising ferocity.',
    emoji: '🐉', power: 9, defense: 7, cost: 20, xpReward: 8,
  },
  {
    id: 'librarian_wraith_common', name: 'Page Whisper', species: 'librarian_wraith', rarity: 'common',
    description: 'A faint spectral presence that turns pages and organizes shelves when no one is watching.',
    lore: 'Page Whispers are barely visible but always helpful — books find themselves in perfect order.',
    emoji: '🔮', power: 7, defense: 9, cost: 24, xpReward: 10,
  },
  {
    id: 'book_wyrm_common', name: 'Bookmark Larva', species: 'book_wyrm', rarity: 'common',
    description: 'A small segmented worm that tastes like old paper and curls up between book covers.',
    lore: 'Bookmark Larvae are beloved by archivists — they mark pages and repair torn ones as they feed.',
    emoji: '🐛', power: 6, defense: 11, cost: 16, xpReward: 6,
  },
  {
    id: 'cipher_fox_common', name: 'Inkling Kit', species: 'cipher_fox', rarity: 'common',
    description: 'A playful fox cub whose fur displays random letters, shifting as it moves.',
    lore: 'Inkling Kits love riddles and will only approach archivists who can solve simple word puzzles.',
    emoji: '🦊', power: 11, defense: 7, cost: 22, xpReward: 9,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'quill_phoenix_uncommon', name: 'Golden Quill', species: 'quill_phoenix', rarity: 'uncommon',
    description: 'A radiant bird whose feathers are enchanted writing instruments that never run dry.',
    lore: 'Golden Quills are sought by scribes across the world — their feathers write with pure inspiration.',
    emoji: '🪶', power: 22, defense: 20, cost: 60, xpReward: 20,
  },
  {
    id: 'ink_spirit_uncommon', name: 'Shadow Scribe', species: 'ink_spirit', rarity: 'uncommon',
    description: 'A dark humanoid figure made of flowing ink that can write messages on any surface.',
    lore: 'Shadow Scribes serve as personal secretaries, transcribing thoughts into elegant prose.',
    emoji: '👻', power: 20, defense: 18, cost: 55, xpReward: 18,
  },
  {
    id: 'parchment_golem_uncommon', name: 'Tome Guardian', species: 'parchment_golem', rarity: 'uncommon',
    description: 'A golem assembled from bound books, its body a walking library of protective wards.',
    lore: 'Tome Guardians carry an entire library of counter-spells within their parchment layers.',
    emoji: '📜', power: 24, defense: 22, cost: 65, xpReward: 22,
  },
  {
    id: 'scroll_dragon_uncommon', name: 'Charter Drake', species: 'scroll_dragon', rarity: 'uncommon',
    description: 'A young dragon with legal scrolls for scales that can draft binding contracts with its breath.',
    lore: 'Charter Drakes are employed by the Archive to enforce its ancient copyright laws.',
    emoji: '🐉', power: 21, defense: 17, cost: 58, xpReward: 19,
  },
  {
    id: 'librarian_wraith_uncommon', name: 'Shelf Phantom', species: 'librarian_wraith', rarity: 'uncommon',
    description: 'A more substantial wraith that can levitate entire shelves and reorganize entire wings.',
    lore: 'Shelf Phantoms are promoted from Page Whispers after cataloguing one million books.',
    emoji: '🔮', power: 18, defense: 19, cost: 50, xpReward: 17,
  },
  {
    id: 'book_wyrm_uncommon', name: 'Gilded Bookmark', species: 'book_wyrm', rarity: 'uncommon',
    description: 'A sleek wyrm with gold-edged scales that mends even the most ancient tomes.',
    lore: 'Gilded Bookmarks are the Archive\'s master restorers, capable of reversing centuries of decay.',
    emoji: '🐛', power: 19, defense: 21, cost: 52, xpReward: 18,
  },
  {
    id: 'cipher_fox_uncommon', name: 'Rune Fox', species: 'cipher_fox', rarity: 'uncommon',
    description: 'A fox with fur that displays complete magical runes and simple enchantments.',
    lore: 'Rune Foxes can encode any spell into their fur and release it as a flash of golden light.',
    emoji: '🦊', power: 23, defense: 16, cost: 62, xpReward: 21,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'quill_phoenix_rare', name: 'Inferno Quill', species: 'quill_phoenix', rarity: 'rare',
    description: 'A blazing phoenix that writes in fire, its words burning into reality with lasting power.',
    lore: 'Inferno Quills are born when an archivist burns a banned book — the knowledge becomes phoenix-fire.',
    emoji: '🪶', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'ink_spirit_rare', name: 'Obsidian Scribe', species: 'ink_spirit', rarity: 'rare',
    description: 'A towering ink being of deep obsidian darkness that commands lesser ink spirits.',
    lore: 'Obsidian Scribes can rewrite entire chapters of history, though the Archive forbids this.',
    emoji: '👻', power: 38, defense: 32, cost: 180, xpReward: 45,
  },
  {
    id: 'parchment_golem_rare', name: 'Codex Colossus', species: 'parchment_golem', rarity: 'rare',
    description: 'A massive golem of enchanted vellum inscribed with every ward ever devised.',
    lore: 'Codex Colossi require a thousand rare scrolls to construct and can shield an entire hall.',
    emoji: '📜', power: 42, defense: 40, cost: 220, xpReward: 55,
  },
  {
    id: 'scroll_dragon_rare', name: 'Archive Wyrm', species: 'scroll_dragon', rarity: 'rare',
    description: 'A dragon whose body is a continuous scroll of the Archive\'s founding charter.',
    lore: 'The Archive Wyrm is the legal enforcer of the archive, its words carrying the weight of law.',
    emoji: '🐉', power: 37, defense: 34, cost: 190, xpReward: 48,
  },
  {
    id: 'librarian_wraith_rare', name: 'Vault Specter', species: 'librarian_wraith', rarity: 'rare',
    description: 'A powerful wraith that can open any sealed vault with a single ghostly pass of its hand.',
    lore: 'Vault Specters know the location of every hidden chamber in the Archive.',
    emoji: '🔮', power: 35, defense: 36, cost: 195, xpReward: 49,
  },
  {
    id: 'book_wyrm_rare', name: 'Tome Serpent', species: 'book_wyrm', rarity: 'rare',
    description: 'A large wyrm that has consumed so many books it can recite any text from memory.',
    lore: 'Tome Serpents are living encyclopedias — ask them any question and they answer in verse.',
    emoji: '🐛', power: 36, defense: 33, cost: 185, xpReward: 46,
  },
  {
    id: 'cipher_fox_rare', name: 'Enigma Fox', species: 'cipher_fox', rarity: 'rare',
    description: 'A fox whose fur cycles through every cipher ever invented, cracking codes in real time.',
    lore: 'Enigma Foxes were bred by ancient spymasters and donated to the Archive after their service.',
    emoji: '🦊', power: 39, defense: 30, cost: 210, xpReward: 52,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'quill_phoenix_epic', name: 'Quill Phoenix Sovereign', species: 'quill_phoenix', rarity: 'epic',
    description: 'A magnificent phoenix whose tail feathers write prophecies that always come true.',
    lore: 'The Quill Phoenix Sovereign is the Archive\'s oracle — its prophecies are collected and sealed.',
    emoji: '🪶', power: 70, defense: 62, cost: 800, xpReward: 120,
  },
  {
    id: 'ink_spirit_epic', name: 'Void Ink Abomination', species: 'ink_spirit', rarity: 'epic',
    description: 'An ink spirit of incomprehensible depth, containing knowledge that drives mortals mad.',
    lore: 'The Void Ink Abomination is kept in a sealed wing — reading its surface text grants forbidden power.',
    emoji: '👻', power: 68, defense: 58, cost: 750, xpReward: 110,
  },
  {
    id: 'parchment_golem_epic', name: 'Eternal Archive Guardian', species: 'parchment_golem', rarity: 'epic',
    description: 'A golem of infinite pages, each layer inscribed with a different language and era.',
    lore: 'The Eternal Archive Guardian has been standing at the inner sanctum since the Archive was founded.',
    emoji: '📜', power: 72, defense: 68, cost: 850, xpReward: 130,
  },
  {
    id: 'scroll_dragon_epic', name: 'Apocalypse Scroll Dragon', species: 'scroll_dragon', rarity: 'epic',
    description: 'A dragon whose scroll-body contains the Archive\'s most dangerous texts and cursed scrolls.',
    lore: 'The Apocalypse Scroll Dragon breathes words of unmaking — even the floor cracks at its whisper.',
    emoji: '🐉', power: 75, defense: 60, cost: 780, xpReward: 115,
  },
  {
    id: 'librarian_wraith_epic', name: 'Grand Archivist Specter', species: 'librarian_wraith', rarity: 'epic',
    description: 'The ghost of the Archive\'s founder, still organizing knowledge after thousands of years.',
    lore: 'The Grand Archivist Specter knows every book in the Archive by heart and can retrieve any volume instantly.',
    emoji: '🔮', power: 65, defense: 65, cost: 820, xpReward: 125,
  },
  {
    id: 'book_wyrm_epic', name: 'Leviathan Bibliophage', species: 'book_wyrm', rarity: 'epic',
    description: 'A colossal wyrm that has consumed every damaged book in the Archive, healing them from within.',
    lore: 'The Leviathan Bibliophage\'s body glows with the light of ten million restored pages.',
    emoji: '🐛', power: 67, defense: 64, cost: 800, xpReward: 120,
  },
  {
    id: 'cipher_fox_epic', name: 'Cosmic Cipher Fox', species: 'cipher_fox', rarity: 'epic',
    description: 'A nine-tailed fox whose fur contains the cipher of creation itself, the source of all language.',
    lore: 'The Cosmic Cipher Fox can encode messages that transcend space and time.',
    emoji: '🦊', power: 64, defense: 60, cost: 830, xpReward: 122,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'quill_phoenix_legendary', name: 'Phoenix of the First Word', species: 'quill_phoenix', rarity: 'legendary',
    description: 'The original phoenix born when the first word was ever written, carrying all language in its fire.',
    lore: 'The Phoenix of the First Word predates writing itself — it was the inspiration for the alphabet.',
    emoji: '🪶', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'ink_spirit_legendary', name: 'Primordial Ink Entity', species: 'ink_spirit', rarity: 'legendary',
    description: 'An ink being from before time, containing the original manuscript of reality.',
    lore: 'The Primordial Ink Entity is the reason the Archive exists — it chose this place to rest.',
    emoji: '👻', power: 115, defense: 100, cost: 2800, xpReward: 280,
  },
  {
    id: 'parchment_golem_legendary', name: 'World-Parchment Titan', species: 'parchment_golem', rarity: 'legendary',
    description: 'A titan-sized golem whose body is a map of every world ever described in literature.',
    lore: 'The World-Parchment Titan can fold space by folding its body, creating portals between fictional worlds.',
    emoji: '📜', power: 125, defense: 115, cost: 3200, xpReward: 320,
  },
  {
    id: 'scroll_dragon_legendary', name: 'Dragon of the Infinite Scroll', species: 'scroll_dragon', rarity: 'legendary',
    description: 'A dragon whose scroll-body has no end, containing every story ever told and every story yet to come.',
    lore: 'The Dragon of the Infinite Scroll guards the final chamber where the last book will be written.',
    emoji: '🐉', power: 130, defense: 110, cost: 3500, xpReward: 350,
  },
  {
    id: 'librarian_wraith_legendary', name: 'Archon of All Libraries', species: 'librarian_wraith', rarity: 'legendary',
    description: 'The supreme ghostly overseer of every library in existence, across all worlds and all times.',
    lore: 'The Archon of All Libraries communicates only in silence — its presence fills the mind with knowledge.',
    emoji: '🔮', power: 110, defense: 108, cost: 2900, xpReward: 290,
  },
  {
    id: 'book_wyrm_legendary', name: 'Ouroboros of Knowledge', species: 'book_wyrm', rarity: 'legendary',
    description: 'A wyrm eating its own tail, the cycle of knowledge endlessly consuming and recreating itself.',
    lore: 'The Ouroboros of Knowledge is both the first and last book — its body is the spine of all literature.',
    emoji: '🐛', power: 112, defense: 112, cost: 3100, xpReward: 310,
  },
  {
    id: 'cipher_fox_legendary', name: 'Fox of the Omega Cipher', species: 'cipher_fox', rarity: 'legendary',
    description: 'A fox whose fur contains the final cipher that can decode the meaning of existence itself.',
    lore: 'The Fox of the Omega Cipher has never been fully read — every attempt reveals a deeper layer.',
    emoji: '🦊', power: 118, defense: 95, cost: 3000, xpReward: 300,
  },
];

// ============================================================
// SECTION 6: QA_CHAMBERS — 8 Archive Halls
// ============================================================

const QA_CHAMBERS: QaChamberDef[] = [
  {
    id: 'entrance_atrium', name: 'The Entrance Atrium', emoji: '🏛️',
    description: 'A grand hall of marble columns where new visitors first glimpse the Archive\'s vast collection.',
    lore: 'The Entrance Atrium was built by the original five archivists, their names carved into every column.',
    level: 1, resources: ['basic_quill', 'common_ink', 'blank_parchment'], capacity: 10,
    unlockLevel: 1, ambientColor: QA_MARBLE, dangerLevel: 1,
  },
  {
    id: 'forbidden_wing', name: 'The Forbidden Wing', emoji: '🚫',
    description: 'Books sealed behind velvet ropes contain knowledge too dangerous for untrained minds.',
    lore: 'The Forbidden Wing\'s books whisper to passersby, tempting them with forbidden secrets.',
    level: 5, resources: ['sealing_wax', 'forbidden_parchment', 'dark_ink'], capacity: 15,
    unlockLevel: 5, ambientColor: QA_SEAL_RED, dangerLevel: 3,
  },
  {
    id: 'hall_of_echoes', name: 'Hall of Echoes', emoji: '🔊',
    description: 'A cavernous hall where every spoken word repeats endlessly, preserving oral traditions.',
    lore: 'The Hall of Echoes records every conversation ever held within it — some echoes are millennia old.',
    level: 8, resources: ['echo_crystal', 'resonance_quill', 'whisper_ink'], capacity: 20,
    unlockLevel: 8, ambientColor: '#85929E', dangerLevel: 4,
  },
  {
    id: 'inkwell_vault', name: 'Inkwell Vault', emoji: ' Pour',
    description: 'A vault of enchanted inkwells containing every ink formulation ever devised by mortal or magic.',
    lore: 'The Inkwell Vault\'s floor is perpetually stained — even the air carries the scent of fresh ink.',
    level: 12, resources: ['enchanted_ink', 'pigment_dust', 'ink_bottle'], capacity: 25,
    unlockLevel: 12, ambientColor: QA_INK_BLACK, dangerLevel: 5,
  },
  {
    id: 'scroll_repository', name: 'The Scroll Repository', emoji: '📜',
    description: 'Miles of scroll shelves stretching into darkness, containing the Archive\'s oldest documents.',
    lore: 'Some scrolls in the Repository predate human civilization — they were written by earlier intelligences.',
    level: 18, resources: ['ancient_scroll', 'papyrus_shard', 'clay_tablet'], capacity: 30,
    unlockLevel: 18, ambientColor: QA_PARCHMENT, dangerLevel: 6,
  },
  {
    id: 'illuminated_sanctum', name: 'Illuminated Sanctum', emoji: '✨',
    description: 'A breathtaking hall where illuminated manuscripts float in golden light, pages turning slowly.',
    lore: 'The Illuminated Sanctum\'s floating manuscripts are alive — they choose who may read them.',
    level: 25, resources: ['gold_leaf', 'lapis_pigment', 'illumination_quill'], capacity: 35,
    unlockLevel: 25, ambientColor: QA_QUILL_GOLD, dangerLevel: 7,
  },
  {
    id: 'cipher labyrinth', name: 'The Cipher Labyrinth', emoji: '🔮',
    description: 'A shifting maze of coded walls where the path changes based on the reader\'s knowledge.',
    lore: 'The Cipher Labyrinth tests all who enter — only those who solve its riddles reach the center.',
    level: 35, resources: ['cipher_wheel', 'decoded_page', 'key_stone'], capacity: 40,
    unlockLevel: 35, ambientColor: '#7D3C98', dangerLevel: 8,
  },
  {
    id: 'omniscience_chamber', name: 'The Omniscience Chamber', emoji: '👁️',
    description: 'The deepest chamber where all knowledge converges into a single point of infinite comprehension.',
    lore: 'The Omniscience Chamber contains the Last Book — reading it grants understanding of everything.',
    level: 45, resources: ['omniscience_ink', 'infinity_quill', 'eternal_page'], capacity: 50,
    unlockLevel: 45, ambientColor: QA_LEATHER_BROWN, dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: QA_MATERIALS — 12 Materials
// ============================================================

const QA_MATERIALS: QaMaterialDef[] = [
  {
    id: 'basic_quill', name: 'Basic Quill', emoji: '🪶', rarity: 'common', value: 5,
    category: 'quill', craftBonus: 1,
    description: 'A standard goose-feather quill, reliable for everyday writing tasks.',
    lore: 'Basic Quills are the workhorse of the Archive — millions have been crafted over the centuries.',
  },
  {
    id: 'common_ink', name: 'Common Ink', emoji: '🖊️', rarity: 'common', value: 5,
    category: 'ink', craftBonus: 1,
    description: 'Standard black writing ink made from oak gall and iron sulfate.',
    lore: 'Common Ink is the foundation of all writing — without it, the Archive would be silent.',
  },
  {
    id: 'blank_parchment', name: 'Blank Parchment', emoji: '📄', rarity: 'common', value: 4,
    category: 'parchment', craftBonus: 1,
    description: 'A fresh sheet of animal-skin parchment, ready for writing or binding.',
    lore: 'Blank Parchment represents infinite possibility — every great work begins with an empty page.',
  },
  {
    id: 'enchanted_ink', name: 'Enchanted Ink', emoji: '✨', rarity: 'uncommon', value: 20,
    category: 'ink', craftBonus: 3,
    description: 'Ink infused with magical properties that makes written words slightly alive.',
    lore: 'Enchanted Ink was invented by the Archive\'s second archivist after a dream about talking letters.',
  },
  {
    id: 'ancient_parchment', name: 'Ancient Parchment', emoji: '📜', rarity: 'uncommon', value: 18,
    category: 'parchment', craftBonus: 3,
    description: 'A sheet of parchment from a thousand-year-old manuscript, still supple.',
    lore: 'Ancient Parchment carries the weight of history in every fiber, making it ideal for wards.',
  },
  {
    id: 'phoenix_feather', name: 'Phoenix Feather', emoji: '🪶', rarity: 'uncommon', value: 25,
    category: 'quill', craftBonus: 4,
    description: 'A feather from a quill phoenix, naturally enchanted and self-replenishing.',
    lore: 'Phoenix Feathers never dull and always have ink — the ultimate writing instrument.',
  },
  {
    id: 'sealing_wax', name: 'Sealing Wax', emoji: '🔴', rarity: 'rare', value: 50,
    category: 'seal', craftBonus: 6,
    description: 'Magical sealing wax that creates unbreakable bonds when melted with intent.',
    lore: 'Sealing Wax from the Archive can seal anything — doors, memories, even time itself.',
  },
  {
    id: 'gold_leaf', name: 'Gold Leaf', emoji: '🌟', rarity: 'rare', value: 60,
    category: 'metal', craftBonus: 7,
    description: 'Extremely thin sheets of gold used for illuminating manuscripts and gilded edges.',
    lore: 'Gold Leaf from the Archive is enchanted to never tarnish, preserving illuminated works forever.',
  },
  {
    id: 'echo_crystal', name: 'Echo Crystal', emoji: '💎', rarity: 'rare', value: 55,
    category: 'gem', craftBonus: 6,
    description: 'A crystal that stores and replays sounds, used to record oral histories.',
    lore: 'Echo Crystals from the Hall of Echoes contain voices from civilizations long extinct.',
  },
  {
    id: 'infinity_quill', name: 'Infinity Quill', emoji: '✒️', rarity: 'epic', value: 200,
    category: 'quill', craftBonus: 12,
    description: 'A quill that can write infinitely small, encoding entire libraries in a single page.',
    lore: 'The Infinity Quill was carved from the horn of the Dragon of the Infinite Scroll.',
  },
  {
    id: 'omniscience_ink', name: 'Omniscience Ink', emoji: '🖤', rarity: 'epic', value: 250,
    category: 'ink', craftBonus: 15,
    description: 'Ink of pure darkness that writes truths invisible to all but the intended reader.',
    lore: 'Omniscience Ink reveals what the writer truly knows, even things they did not consciously realize.',
  },
  {
    id: 'eternal_page', name: 'Eternal Page', emoji: '📑', rarity: 'legendary', value: 800,
    category: 'parchment', craftBonus: 25,
    description: 'A page that exists outside of time, preserving whatever is written upon it forever.',
    lore: 'Eternal Pages were created at the moment of the Archive\'s founding — only seven exist.',
  },
];

// ============================================================
// SECTION 8: QA_STRUCTURES — 8 Structures
// ============================================================

const QA_STRUCTURES: QaStructureDef[] = [
  {
    id: 'binding_station', name: 'Binding Station', emoji: '📚',
    description: 'A workstation for binding new scribes from raw materials and ancient templates.',
    lore: 'The Binding Station is where all new Archive creatures are first assembled.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'ink_press', name: 'Ink Press', emoji: '🖨️',
    description: 'A magical press that extracts enchanted ink from rare ingredients and spent scrolls.',
    lore: 'The Ink Press produces the Archive\'s most potent writing fluids under extreme magical pressure.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'inkYield', bonusPerLevel: 5,
  },
  {
    id: 'parchment_forge', name: 'Parchment Forge', emoji: '🔨',
    description: 'Forges new parchment from raw fibers using ancient preservation techniques.',
    lore: 'The Parchment Forge can turn even wood pulp into archive-quality writing surfaces.',
    baseCost: 60, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 4,
  },
  {
    id: 'reading_hall', name: 'Grand Reading Hall', emoji: '🏛️',
    description: 'A vast hall with thousands of reading desks, boosting XP gained from study.',
    lore: 'The Grand Reading Hall can accommodate every archivist simultaneously — its desks never fill.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'xpBonus', bonusPerLevel: 3,
  },
  {
    id: 'vault_door', name: 'Reinforced Vault Door', emoji: '🚪',
    description: 'Massive sealed doors protecting the Archive from intrusions and ink storms.',
    lore: 'Vault Doors are inscribed with every locking charm ever invented — none have ever been breached.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 5,
  },
  {
    id: 'quill_mint', name: 'Quill Mint', emoji: '🪙',
    description: 'Mints Archive Coins from compressed knowledge and enchanted sealing wax.',
    lore: 'Archive Coins are the currency of scholars — each coin contains the wisdom of a single book.',
    baseCost: 90, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'coinBonus', bonusPerLevel: 8,
  },
  {
    id: 'repair_workshop', name: 'Restoration Workshop', emoji: '🔧',
    description: 'Specialized workshop for repairing damaged scrolls and healing wounded scribes.',
    lore: 'The Restoration Workshop can reverse any damage to knowledge, physical or magical.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'healingBonus', bonusPerLevel: 4,
  },
  {
    id: 'cipher_engine', name: 'Cipher Engine', emoji: '⚙️',
    description: 'A mechanical-computational device that decodes ancient texts and discovers new abilities.',
    lore: 'The Cipher Engine was built by the first Cipher Fox and can crack any code given enough time.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 3,
  },
];

// ============================================================
// SECTION 9: QA_ABILITIES — 8 Abilities
// ============================================================

const QA_ABILITIES: QaAbilityDef[] = [
  {
    id: 'quill_barrage', name: 'Quill Barrage', category: 'offensive',
    description: 'Launches a storm of enchanted quills that pierce through ink shields and parchment armor.',
    lore: 'Quill Barrage was the signature attack of the first Quill Phoenix Sovereign.',
    emoji: '🪶', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'ink_tide', name: 'Ink Tide', category: 'offensive',
    description: 'Summons a wave of living ink that floods the area, drowning enemies in darkness.',
    lore: 'Ink Tide is feared even by Archive guardians — the ink does not distinguish friend from foe.',
    emoji: '🌊', cooldown: 10000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'parchment_barrier', name: 'Parchment Barrier', category: 'defensive',
    description: 'Raises walls of enchanted parchment that absorb incoming attacks and dissolve them into words.',
    lore: 'The Parchment Barrier turns all attacks into poetry — even destruction becomes art.',
    emoji: '🛡️', cooldown: 8000, power: 40, rarityRequired: 'common',
  },
  {
    id: 'scroll_shield', name: 'Scroll Shield', category: 'defensive',
    description: 'Wraps the user in a cocoon of protective scrolls that deflect magic and physical harm.',
    lore: 'The Scroll Shield contains counter-spells for every known form of attack.',
    emoji: '📜', cooldown: 12000, power: 65, rarityRequired: 'epic',
  },
  {
    id: 'decipher', name: 'Decipher', category: 'utility',
    description: 'Instantly decodes any encrypted text, revealing hidden passages and secret rooms.',
    lore: 'Decipher was the ability that allowed the first archivists to read the Archive\'s original charter.',
    emoji: '🔍', cooldown: 4000, power: 15, rarityRequired: 'common',
  },
  {
    id: 'recall_knowledge', name: 'Recall Knowledge', category: 'utility',
    description: 'Accesses the Archive\'s collective memory to find the perfect solution to any problem.',
    lore: 'Recall Knowledge draws on ten thousand years of accumulated wisdom from every archivist.',
    emoji: '🧠', cooldown: 15000, power: 25, rarityRequired: 'uncommon',
  },
  {
    id: 'summon_scribes', name: 'Summon Scribes', category: 'summon',
    description: 'Calls a squad of spectral scribes to assist in research, combat, or restoration.',
    lore: 'Summoned Scribes are temporary manifestations of the Archive\'s collective knowledge.',
    emoji: '👥', cooldown: 20000, power: 45, rarityRequired: 'rare',
  },
  {
    id: 'word_of_power', name: 'Word of Power', category: 'offensive',
    description: 'Utters a single primordial word that shatters reality in a localized area.',
    lore: 'The Word of Power is the first word ever spoken — using it risks unmaking the speaker.',
    emoji: '💬', cooldown: 30000, power: 80, rarityRequired: 'legendary',
  },
];

// ============================================================
// SECTION 10: QA_ACHIEVEMENTS — 10 Achievements
// ============================================================

const QA_ACHIEVEMENTS: QaAchievementDef[] = [
  {
    id: 'ach_first_binding', name: 'First Binding', emoji: '🪶',
    description: 'Bind your first scribe to the Archive and begin your journey.',
    conditionKey: 'totalBound', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_bind_10', name: 'Scribe Collector', emoji: '📚',
    description: 'Bind 10 scribes to the Archive and establish your scholarly reputation.',
    conditionKey: 'totalBound', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_bind_50', name: 'Master Archivist', emoji: '🏅',
    description: 'Bind 50 scribes, creating a formidable collection of arcane knowledge.',
    conditionKey: 'totalBound', targetValue: 50, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_explore_3', name: 'Hall Walker', emoji: '🔦',
    description: 'Discover 3 different archive halls in your exploration.',
    conditionKey: 'totalHalls', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_explore_all', name: 'Cartographer of Knowledge', emoji: '🗺️',
    description: 'Explore all 8 archive halls and complete the archive map.',
    conditionKey: 'totalHalls', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_5', name: 'Structure Scholar', emoji: '🏗️',
    description: 'Build 5 different structures to expand the Archive\'s facilities.',
    conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Artifact Curator', emoji: '🏺',
    description: 'Activate your first ancient artifact and unlock its hidden power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Archive Survivor', emoji: '📜',
    description: 'Survive 5 random archive events without losing any scribes.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Senior Librarian', emoji: '📈',
    description: 'Reach archivist level 25 and gain access to the deeper wings.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Keeper of the Archive', emoji: '👑',
    description: 'Reach the maximum archivist level 50 and become the Archive\'s supreme keeper.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: QA_TITLES — 8 Title Progression
// ============================================================

const QA_TITLES: QaTitleDef[] = [
  {
    id: 'title_page_novice', name: 'Page Novice', emoji: '📄',
    description: 'A newcomer to the Quill Archive, eager to learn the art of knowledge binding.',
    lore: 'Every great archivist began as a Page Novice, frightened by the Archive\'s infinite shelves.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_ink_apprentice', name: 'Ink Apprentice', emoji: '🖊️',
    description: 'Learning to work with enchanted inks and bind basic scribes.',
    lore: 'Ink Apprentices spend months mixing inks before they are trusted to bind their first scribe.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_scroll_keeper', name: 'Scroll Keeper', emoji: '📜',
    description: 'A trusted keeper responsible for maintaining and organizing scroll collections.',
    lore: 'Scroll Keepers know the location of every scroll in their assigned wing by heart.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_quill_scribe', name: 'Quill Scribe', emoji: '🪶',
    description: 'A skilled scribe capable of binding rare and powerful archive creatures.',
    lore: 'Quill Scribes are the backbone of the Archive, binding new guardians every day.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_codex_master', name: 'Codex Master', emoji: '📚',
    description: 'A master of codices and ancient texts, wielding deep knowledge of binding arts.',
    lore: 'Codex Masters can read any text in any language — even the language of pure magic.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_hall_guardian', name: 'Hall Guardian', emoji: '🛡️',
    description: 'Protector of an entire archive wing, commanding its creatures and defenses.',
    lore: 'Hall Guardians have defeated every threat that has ever breached their wing.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_grand_archivist', name: 'Grand Archivist', emoji: '🎓',
    description: 'One of the seven supreme archivists who oversee all operations of the Archive.',
    lore: 'Grand Archivists carry the Seven Seals of Knowledge, each weighing as much as a mountain.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_archive_sovereign', name: 'Archive Sovereign', emoji: '👑',
    description: 'The absolute ruler of the Quill Archive, master of all knowledge within its walls.',
    lore: 'The Archive Sovereign holds the Last Key — the only object that can lock or unlock the Omniscience Chamber.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: QA_ARTIFACTS — 6 Artifacts
// ============================================================

const QA_ARTIFACTS: QaArtifactDef[] = [
  {
    id: 'art_everfill_quill', name: 'Everfill Quill',
    description: 'A quill that never runs out of enchanted ink, writing in any language automatically.',
    lore: 'The Everfill Quill was carved from a feather shed by the Phoenix of the First Word itself.',
    emoji: '✒️', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_void_inkwell', name: 'Void Inkwell',
    description: 'An inkwell containing a drop of void essence that makes writing invisible to all but the writer.',
    lore: 'The Void Inkwell\'s ink exists between dimensions — it can only be read by those who know it is there.',
    emoji: '🖤', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_oracle_scroll', name: 'Oracle Scroll',
    description: 'A blank scroll that automatically writes predictions of future events when unrolled.',
    lore: 'The Oracle Scroll writes prophecies in shifting ink that changes as the future changes.',
    emoji: '📜', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_archive_key', name: 'Master Archive Key',
    description: 'A golden key that can unlock any sealed door, chest, or vault in the Archive.',
    lore: 'The Master Archive Key was forged in the Omniscience Chamber and carries a fragment of infinite knowledge.',
    emoji: '🔑', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_lexicon_tome', name: 'Lexicon of All Tongues',
    description: 'A massive tome containing every language ever spoken, past, present, and future.',
    lore: 'The Lexicon of All Tongues weighs nothing — its pages are pure thought, not paper.',
    emoji: '📖', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_quill_of_creation', name: 'Quill of Creation',
    description: 'The primordial quill used to write the universe into existence at the dawn of time.',
    lore: 'The Quill of Creation still hums with the power of the first sentence ever written.',
    emoji: '🪶', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: QA_EVENTS — 8 Random Archive Events
// ============================================================

const QA_EVENTS: QaEventDef[] = [
  {
    id: 'evt_ink_storm', name: 'Ink Storm',
    description: 'A violent storm of enchanted ink floods through the halls, damaging scrolls and confusing scribes.',
    lore: 'Ink Storms occur when too many words are erased simultaneously — the ink retaliates.',
    emoji: '🌊', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'enchanted_ink', rewardMaterialCount: 3,
  },
  {
    id: 'evt_scroll_avalanche', name: 'Scroll Avalanche',
    description: 'Thousands of scrolls cascade from toppling shelves, burying everything in parchment.',
    lore: 'Scroll Avalanches are the Archive\'s way of reorganizing — chaos precedes order.',
    emoji: '📜', effectType: 'debuff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'ancient_parchment', rewardMaterialCount: 4,
  },
  {
    id: 'evt_ink_fairy_swarm', name: 'Ink Fairy Swarm',
    description: 'Tiny ink fairies emerge from the walls, leaving trails of golden script that boosts morale.',
    lore: 'Ink Fairy Swarms are considered the Archive\'s highest blessing — they only appear when the Archive is happy.',
    emoji: '🧚', effectType: 'buff', duration: 20000, rewardXp: 30, rewardCoins: 25,
    rewardMaterialId: 'basic_quill', rewardMaterialCount: 6,
  },
  {
    id: 'evt_forgotten_voice', name: 'Forgotten Voice',
    description: 'A voice from a thousand-year-old recording echoes through the halls, granting lost knowledge.',
    lore: 'Forgotten Voices are the Archive speaking to itself — the building has a consciousness of its own.',
    emoji: '📢', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 0,
    rewardMaterialId: 'echo_crystal', rewardMaterialCount: 2,
  },
  {
    id: 'evt_page_turning', name: 'The Great Page Turning',
    description: 'Every book in the Archive simultaneously turns a page, releasing a wave of magical energy.',
    lore: 'The Great Page Turning happens once every century — the last one revealed the location of a hidden wing.',
    emoji: '📖', effectType: 'buff', duration: 30000, rewardXp: 50, rewardCoins: 20,
    rewardMaterialId: 'blank_parchment', rewardMaterialCount: 5,
  },
  {
    id: 'evt_wax_meltdown', name: 'Wax Meltdown',
    description: 'Sealing wax on all vaults softens from magical heat, temporarily weakening protections.',
    lore: 'Wax Meltdowns are dangerous — they briefly expose the Archive\'s most protected secrets.',
    emoji: '🔥', effectType: 'debuff', duration: 20000, rewardXp: 45, rewardCoins: 20,
    rewardMaterialId: 'sealing_wax', rewardMaterialCount: 4,
  },
  {
    id: 'evt_cipher_shift', name: 'Cipher Shift',
    description: 'All coded locks in the Archive randomly change, requiring immediate re-decryption.',
    lore: 'Cipher Shifts keep the Archive\'s defenses fresh — stale locks are the weakest link.',
    emoji: '🔐', effectType: 'special', duration: 10000, rewardXp: 55, rewardCoins: 0,
    rewardMaterialId: 'echo_crystal', rewardMaterialCount: 1,
  },
  {
    id: 'evt_dragon_roar', name: 'Scroll Dragon Roar',
    description: 'A distant scroll dragon roars through the halls, exciting all creatures to heightened awareness.',
    lore: 'Scroll Dragon Roars resonate with every scroll in the Archive, strengthening their protective enchantments.',
    emoji: '🐉', effectType: 'buff', duration: 25000, rewardXp: 40, rewardCoins: 25,
    rewardMaterialId: 'enchanted_ink', rewardMaterialCount: 3,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function qaGenerateInstanceId(): string {
  return `qa_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function qaPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function qaCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function qaCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useQuillArchive() {
  // ---- Core State ----
  const [qaLevel, setQaLevel] = useState(1);
  const [qaXp, setQaXp] = useState(QA_STARTING_XP);
  const [qaCoins, setQaCoins] = useState(QA_STARTING_COINS);
  const [qaTotalXp, setQaTotalXp] = useState(0);
  const [qaTotalCoins, setQaTotalCoins] = useState(0);

  // ---- Collection State ----
  const [qaScribes, setQaScribes] = useState<QaOwnedScribe[]>([]);
  const [qaInventory, setQaInventory] = useState<QaInventoryItem[]>([]);
  const [qaStructures, setQaStructures] = useState<QaStructureRecord[]>([]);
  const [qaArtifacts, setQaArtifacts] = useState<QaArtifactRecord[]>([]);
  const [qaAbilities, setQaAbilities] = useState<QaAbilityRecord[]>([]);
  const [qaAchievements, setQaAchievements] = useState<QaAchievementRecord[]>([]);
  const [qaChambers, setQaChambers] = useState<QaChamberRecord[]>([]);
  const [qaEventLog, setQaEventLog] = useState<QaEventLogEntry[]>([]);
  const [qaActiveEvent, setQaActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [qaCurrentTitle, setQaCurrentTitle] = useState('title_page_novice');

  // ---- Stats State ----
  const [qaStats, setQaStats] = useState<QaStats>({
    totalBound: 0,
    totalHalls: 0,
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
      const saved = localStorage.getItem(QA_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.qaLevel) setQaLevel(data.qaLevel);
        if (data.qaXp) setQaXp(data.qaXp);
        if (data.qaCoins) setQaCoins(data.qaCoins);
        if (data.qaTotalXp) setQaTotalXp(data.qaTotalXp);
        if (data.qaTotalCoins) setQaTotalCoins(data.qaTotalCoins);
        if (data.qaScribes) setQaScribes(data.qaScribes);
        if (data.qaInventory) setQaInventory(data.qaInventory);
        if (data.qaStructures) setQaStructures(data.qaStructures);
        if (data.qaArtifacts) setQaArtifacts(data.qaArtifacts);
        if (data.qaAbilities) setQaAbilities(data.qaAbilities);
        if (data.qaAchievements) setQaAchievements(data.qaAchievements);
        if (data.qaChambers) setQaChambers(data.qaChambers);
        if (data.qaEventLog) setQaEventLog(data.qaEventLog);
        if (data.qaActiveEvent) setQaActiveEvent(data.qaActiveEvent);
        if (data.qaCurrentTitle) setQaCurrentTitle(data.qaCurrentTitle);
        if (data.qaStats) setQaStats(data.qaStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    // Initialize from scratch
    setQaChambers(
      QA_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setQaAbilities(
      QA_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setQaAchievements(
      QA_ACHIEVEMENTS.map((a) => ({
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
          qaLevel, qaXp, qaCoins, qaTotalXp, qaTotalCoins,
          qaScribes, qaInventory, qaStructures, qaArtifacts,
          qaAbilities, qaAchievements, qaChambers, qaEventLog,
          qaActiveEvent, qaCurrentTitle, qaStats,
        };
        localStorage.setItem(QA_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, QA_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [qaLevel, qaXp, qaCoins, qaTotalXp, qaTotalCoins,
    qaScribes, qaInventory, qaStructures, qaArtifacts,
    qaAbilities, qaAchievements, qaChambers, qaEventLog,
    qaActiveEvent, qaCurrentTitle, qaStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!qaActiveEvent) return;
    const evt = QA_EVENTS.find((e) => e.id === qaActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setQaActiveEvent(null);
      setQaEventLog((prev) =>
        prev.map((e) => (e.eventId === qaActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [qaActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...QA_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => qaLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === qaCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setQaCurrentTitle(nextTitle.id);
    }
  }, [qaLevel, qaCurrentTitle]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(QA_XP_BASE * Math.pow(lvl, QA_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(qaLevel + 1);
    return Math.max(0, needed - qaXp);
  }, [qaLevel, qaXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(qaLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((qaXp / needed) * 100), 100);
  }, [qaLevel, qaXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): QaCreatureDef | undefined => {
    return QA_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): QaChamberDef | undefined => {
    return QA_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): QaMaterialDef | undefined => {
    return QA_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): QaStructureDef | undefined => {
    return QA_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): QaAbilityDef | undefined => {
    return QA_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): QaArtifactDef | undefined => {
    return QA_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): QaAchievementDef | undefined => {
    return QA_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): QaTitleDef | undefined => {
    return QA_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): QaEventDef | undefined => {
    return QA_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: QaRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: QaRarity): string => {
    return QA_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: QaSpecies): string => {
    return QA_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: bindScribe
  // ============================================================

  const bindScribe = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (qaCoins < def.cost) return false;

    const newScribe: QaOwnedScribe = {
      creatureId: def.id,
      instanceId: qaGenerateInstanceId(),
      boundAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setQaCoins((prev) => prev - def.cost);
    setQaScribes((prev) => [...prev, newScribe]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = qaCalculateLevelUp(
      xpForLevel(qaLevel + 1),
      qaXp,
      xpGained,
      setQaLevel,
    );
    setQaXp(overflow);
    setQaTotalXp((prev) => prev + xpGained);
    setQaTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setQaStats((prev) => ({ ...prev, totalBound: prev.totalBound + 1 }));
    return true;
  }, [qaCoins, qaLevel, qaXp, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: studyHall
  // ============================================================

  const studyHall = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (qaLevel < def.unlockLevel) return false;

    setQaChambers((prev) =>
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
    const bonusMat = qaPickRandom(def.resources);
    if (bonusMat) {
      setQaInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat ? { ...i, count: i.count + 1 } : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setQaTotalXp((prev) => prev + 15);
    setQaTotalCoins((prev) => prev + 5);
    setQaStats((prev) => ({ ...prev, totalHalls: prev.totalHalls + 1 }));
    return true;
  }, [qaLevel, getChamberDef, qaInventory]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = qaStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = qaCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (qaCoins < cost) return false;

    setQaCoins((prev) => prev - cost);
    setQaStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setQaTotalXp((prev) => prev + 20);
    setQaStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [qaCoins, qaStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (qaCoins < def.cost) return false;
    if (qaArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setQaCoins((prev) => prev - def.cost);
    setQaArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setQaTotalXp((prev) => prev + 100);
    setQaStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [qaCoins, qaArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerArchiveEvent
  // ============================================================

  const triggerArchiveEvent = useCallback((): QaEventDef | null => {
    if (qaActiveEvent) return null;
    const event = qaPickRandom(QA_EVENTS);
    setQaActiveEvent(event.id);
    setQaEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setQaTotalXp((prev) => prev + event.rewardXp);
    setQaCoins((prev) => prev + event.rewardCoins);
    setQaTotalCoins((prev) => prev + event.rewardCoins);

    // Add event material reward to inventory
    const matId = event.rewardMaterialId;
    if (matId) {
      setQaInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: i.count + event.rewardMaterialCount }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: event.rewardMaterialCount }];
      });
    }

    return event;
  }, [qaActiveEvent, qaInventory]);

  // ============================================================
  // CORE ACTION: resetQuillArchive
  // ============================================================

  const resetQuillArchive = useCallback(() => {
    setQaLevel(1);
    setQaXp(0);
    setQaCoins(QA_STARTING_COINS);
    setQaTotalXp(0);
    setQaTotalCoins(0);
    setQaScribes([]);
    setQaInventory([]);
    setQaStructures([]);
    setQaArtifacts([]);
    setQaAbilities(
      QA_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setQaAchievements(
      QA_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setQaChambers(
      QA_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setQaEventLog([]);
    setQaActiveEvent(null);
    setQaCurrentTitle('title_page_novice');
    setQaStats({
      totalBound: 0, totalHalls: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(QA_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverHall
  // ============================================================

  const discoverHall = useCallback((chamberId: string): boolean => {
    return studyHall(chamberId);
  }, [studyHall]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setQaStats((currentStats) => {
      setQaAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalBound: currentStats.totalBound,
          totalHalls: currentStats.totalHalls,
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
            setQaTotalXp((xp) => xp + def.rewardXp);
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
    const record = qaAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setQaAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setQaTotalXp((prev) => prev + 5);
    return true;
  }, [qaAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const qaTitleProgress = useMemo((): QaTitleProgress => {
    const sorted = [...QA_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === qaCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === qaCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((qaLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [qaLevel, qaCurrentTitle]);

  const currentTitleInfo = useMemo(() => qaTitleProgress.current, [qaTitleProgress]);

  const nextTitleInfo = useMemo(() => qaTitleProgress.next, [qaTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    scribesBound: qaScribes.length,
    hallsExplored: qaChambers.filter((c) => c.discovered).length,
    structuresBuilt: qaStructures.length,
    artifactsActive: qaArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: qaAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: qaAbilities.filter((a) => a.unlocked).length,
    totalXp: qaTotalXp,
    totalCoins: qaTotalCoins,
    currentLevel: qaLevel,
    ownedSpeciesCount: new Set(qaScribes.map((s) => {
      const d = QA_CREATURES.find((c) => c.id === s.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: qaEventLog.length,
  }), [qaScribes, qaChambers, qaStructures, qaArtifacts,
    qaAchievements, qaAbilities, qaTotalXp, qaTotalCoins, qaLevel, qaEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      QA_CREATURES.length +
      QA_CHAMBERS.length +
      QA_STRUCTURES.length +
      QA_ARTIFACTS.length +
      QA_ACHIEVEMENTS.length +
      QA_ABILITIES.length;
    const completed =
      qaScribes.length +
      qaChambers.filter((c) => c.discovered).length +
      qaStructures.length +
      qaArtifacts.filter((a) => a.activated).length +
      qaAchievements.filter((a) => a.unlocked).length +
      qaAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((qaScribes.length / QA_CREATURES.length) * 100),
      chamberPercent: Math.round((qaChambers.filter((c) => c.discovered).length / QA_CHAMBERS.length) * 100),
      structurePercent: Math.round((qaStructures.length / QA_STRUCTURES.length) * 100),
      artifactPercent: Math.round((qaArtifacts.filter((a) => a.activated).length / QA_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((qaAchievements.filter((a) => a.unlocked).length / QA_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((qaAbilities.filter((a) => a.unlocked).length / QA_ABILITIES.length) * 100),
    };
  }, [qaScribes, qaChambers, qaStructures, qaArtifacts, qaAchievements, qaAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedScribes = useMemo(() =>
    qaScribes.map((s) => ({
      ...s,
      def: getCreatureDef(s.creatureId),
    })),
  [qaScribes, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    qaChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [qaChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    qaStructures.map((s) => ({
      ...s,
      def: getStructureDef(s.structureId),
      totalUpgrades: s.totalUpgrades,
      currentCost: qaCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      nextUpgradeCost: qaCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      bonusProvided: s.level * (getStructureDef(s.structureId)?.bonusPerLevel || 0),
    })),
  [qaStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    qaInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [qaInventory, getMaterialDef]);


  const enrichedArtifacts = useMemo(() =>
    qaArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [qaArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    qaAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [qaAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const scribesByType = useMemo(() => {
    const result: Record<string, typeof qaScribes> = {};
    for (const species of QA_SPECIES) {
      result[species.id] = qaScribes.filter((s) => {
        const def = getCreatureDef(s.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [qaScribes, getCreatureDef]);

  const scribesByRarity = useMemo(() => {
    const rarities: QaRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, typeof qaScribes> = {};
    for (const r of rarities) {
      result[r] = qaScribes.filter((s) => {
        const def = getCreatureDef(s.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [qaScribes, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return QA_CREATURES.filter((c) => c.cost <= qaCoins);
  }, [qaCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalBound: qaStats.totalBound,
      totalHalls: qaStats.totalHalls,
      totalStructuresBuilt: qaStats.totalStructuresBuilt,
      totalArtifacts: qaStats.totalArtifacts,
      totalEvents: qaStats.totalEvents,
      totalCoins: qaStats.totalCoins,
      totalXp: qaStats.totalXp,
    };
    return QA_ACHIEVEMENTS.filter(
      (a) =>
        !qaAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [qaStats, qaAchievements]);

  const recentEventLog = useMemo(() => {
    return [...qaEventLog].reverse().slice(0, 10);
  }, [qaEventLog]);

  const scribesByPower = useMemo(() => {
    return [...qaScribes]
      .map((s) => ({ ...s, def: getCreatureDef(s.creatureId) }))
      .filter((s) => s.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [qaScribes, getCreatureDef]);

  const topScribes = useMemo(() => {
    return scribesByPower.slice(0, 10);
  }, [scribesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of qaScribes) {
      const def = getCreatureDef(s.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [qaScribes, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of qaChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [qaChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of qaStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [qaStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of qaAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [qaAbilities]);

  // ============================================================
  // RETURN — Pattern A: all constants directly on the API object
  // ============================================================

  return {
    // ---- Color Theme ----
    QA_PARCHMENT,
    QA_INK_BLACK,
    QA_QUILL_GOLD,
    QA_LEATHER_BROWN,
    QA_VELLUM,
    QA_SEAL_RED,
    QA_MARBLE,
    QA_RARITY_COLORS,
    QA_SPECIES_COLORS,

    // ---- Data Constants ----
    QA_SPECIES,
    QA_CREATURES,
    QA_CHAMBERS,
    QA_MATERIALS,
    QA_STRUCTURES,
    QA_ABILITIES,
    QA_ACHIEVEMENTS,
    QA_TITLES,
    QA_ARTIFACTS,
    QA_EVENTS,
    QA_MAX_LEVEL,
    QA_SAVE_KEY,
    QA_XP_BASE,
    QA_XP_SCALE,

    // ---- State ----
    qaLevel,
    qaXp,
    qaCoins,
    qaTotalXp,
    qaTotalCoins,
    qaScribes,
    qaInventory,
    qaStructures,
    qaArtifacts,
    qaAbilities,
    qaAchievements,
    qaChambers,
    qaEventLog,
    qaActiveEvent,
    qaCurrentTitle,
    qaStats,

    // ---- Core Actions ----
    bindScribe,
    studyHall,
    buildStructure,
    activateArtifact,
    triggerArchiveEvent,
    resetQuillArchive,

    // ---- Extended Actions ----
    discoverHall,
    checkAndClaimAchievements,
    useAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    qaTitleProgress,

    // ---- Stats ----
    statsSummary,
    completionStats,

    // ---- Enriched Data ----
    enrichedScribes,
    enrichedChambers,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedAbilities,

    // ---- Computed Data ----
    scribesByType,
    scribesByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    scribesByPower,
    topScribes,
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
