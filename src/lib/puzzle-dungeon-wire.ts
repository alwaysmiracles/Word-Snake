// ============================================================================
// Puzzle Dungeon (Roguelike) System — Wire Module for Word Snake
// ============================================================================
// SSR-safe wire: no localStorage / window / document / setInterval / addEventListener
// All public functions use `dg` prefix. 30–40 exports, 1000–1500 lines.
// ============================================================================

// ─── Types ───────────────────────────────────────────────────────────────────

export type DungeonThemeId =
  | "crystal_caverns"
  | "shadow_labyrinth"
  | "dragons_keep"
  | "sky_temple"
  | "abyss_of_words";

export type FloorType =
  | "word_puzzle"
  | "combat"
  | "treasure"
  | "trap"
  | "boss";

export type RarityTier =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export type LootCategory = "weapon" | "armor" | "potion" | "gold" | "key" | "map";

export type PuzzleSubtype = "anagram" | "fill_blank" | "word_search";

export interface DungeonDef {
  id: DungeonThemeId;
  name: string;
  description: string;
  icon: string;
  floors: number;
  color: string;
  monsterIds: string[];
  bossId: string;
}

export interface MonsterDef {
  id: string;
  dungeonId: DungeonThemeId;
  name: string;
  pun: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  isBoss: boolean;
  bossAbility?: string;
  bossPattern?: string[];
  lootTable: LootTableEntry[];
}

export interface LootTableEntry {
  rarity: RarityTier;
  category: LootCategory;
  weight: number;
  minAmount?: number;
  maxAmount?: number;
}

export interface LootItem {
  uid: string;
  name: string;
  description: string;
  rarity: RarityTier;
  category: LootCategory;
  level: number;
  value: number;
  equipped?: boolean;
}

export interface FloorState {
  floorNumber: number;
  floorType: FloorType;
  puzzle: FloorPuzzle | null;
  monster: MonsterInstance | null;
  lootDrops: LootItem[];
  cleared: boolean;
  enteredAt: number;
  clearedAt: number | null;
}

export interface FloorPuzzle {
  subtype: PuzzleSubtype;
  prompt: string;
  solution: string;
  hints: string[];
  timeLimit: number;
  difficulty: number;
}

export interface MonsterInstance {
  defId: string;
  currentHp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  isBoss: boolean;
  turnCount: number;
  statusEffects: string[];
}

export interface PlayerInstance {
  hp: number;
  maxHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  luck: number;
  gold: number;
  xp: number;
  level: number;
  inventory: LootItem[];
  equipment: {
    weapon: LootItem | null;
    armor: LootItem | null;
    accessory: LootItem | null;
  };
  potionPower: number;
  inventorySlots: number;
}

export interface RunState {
  runId: string;
  dungeonId: DungeonThemeId;
  startedAt: number;
  endedAt: number | null;
  floor: number;
  player: PlayerInstance;
  floors: FloorState[];
  monstersDefeated: number;
  goldEarned: number;
  lootFound: number;
  score: number;
  alive: boolean;
  isDaily: boolean;
}

export interface MetaUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  currentLevel: number;
  baseCost: number;
  costScale: number;
}

export interface RunRecord {
  runId: string;
  dungeonId: DungeonThemeId;
  floorReached: number;
  score: number;
  goldEarned: number;
  monstersDefeated: number;
  lootFound: number;
  startedAt: number;
  endedAt: number | null;
  survived: boolean;
  isDaily: boolean;
}

export interface DungeonStats {
  bestFloor: number;
  totalRuns: number;
  totalClears: number;
  totalMonstersDefeated: number;
  totalGoldEarned: number;
  totalLootFound: number;
  fastestClearMs: number | null;
  highestScore: number;
  bossDefeated: boolean;
}

export interface DailyDungeonState {
  date: string;
  dungeonId: DungeonThemeId;
  completed: boolean;
  modifiers: string[];
  bonusReward: LootItem | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DUNGEONS: DungeonDef[] = [
  {
    id: "crystal_caverns",
    name: "Crystal Caverns",
    description: "Gleaming passages filled with word crystals and ancient glyphs.",
    icon: "💎",
    floors: 10,
    color: "#7dd3fc",
    monsterIds: [
      "crystal_golem",
      "glyph_wyrm",
      "prism_mantis",
      "shard_walker",
      "echo_bat",
      "facet_spider",
    ],
    bossId: "the_lexicon_crystal",
  },
  {
    id: "shadow_labyrinth",
    name: "Shadow Labyrinth",
    description: "A twisting maze where words themselves become weapons.",
    icon: "🌑",
    floors: 10,
    color: "#a78bfa",
    monsterIds: [
      "ink_wraith",
      "page_turner",
      "blank_ghoul",
      "typo_demon",
      "fog_phantom",
      "lost_syllable",
    ],
    bossId: "the_oblivion_scribe",
  },
  {
    id: "dragons_keep",
    name: "Dragon's Keep",
    description: "An ancient fortress guarded by word-wielding dragons.",
    icon: "🐉",
    floors: 10,
    color: "#fb923c",
    monsterIds: [
      "rhyme_drake",
      "syntax_serpent",
      "vowel_wyvern",
      "consonant_golem",
      "spell_wyrm",
      "claw_scholar",
    ],
    bossId: "the_ancient_lexicon",
  },
  {
    id: "sky_temple",
    name: "Sky Temple",
    description: "Floating ruins where words hold the power of flight.",
    icon: "☁️",
    floors: 10,
    color: "#67e8f9",
    monsterIds: [
      "cloud_scribe",
      "wind_whisper",
      "storm_lexicon",
      "feather_quill",
      "zenith_spirit",
      "breeze_nymph",
    ],
    bossId: "the_celestial_author",
  },
  {
    id: "abyss_of_words",
    name: "Abyss of Words",
    description: "The deepest dungeon, where forgotten words hunger for meaning.",
    icon: "🕳️",
    floors: 10,
    color: "#f87171",
    monsterIds: [
      "void_stalker",
      "null_beast",
      "silence_wraith",
      "oblivion_crawler",
      "forgotten_tome",
      "entropy_golem",
    ],
    bossId: "the_unspeakable",
  },
];

const MONSTERS: MonsterDef[] = [
  // Crystal Caverns
  {
    id: "crystal_golem",
    dungeonId: "crystal_caverns",
    name: "Crystal Golem",
    pun: "It has a hard time with soft words.",
    hp: 30,
    attack: 5,
    defense: 8,
    speed: 2,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 40, minAmount: 5, maxAmount: 15 },
      { rarity: "common", category: "potion", weight: 30 },
    ],
  },
  {
    id: "glyph_wyrm",
    dungeonId: "crystal_caverns",
    name: "Glyph Wyrm",
    pun: "Always leaves its mark — on the dictionary.",
    hp: 40,
    attack: 7,
    defense: 5,
    speed: 4,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 35, minAmount: 8, maxAmount: 20 },
      { rarity: "uncommon", category: "weapon", weight: 15 },
    ],
  },
  {
    id: "prism_mantis",
    dungeonId: "crystal_caverns",
    name: "Prism Mantis",
    pun: "Refracts meaning into seven colors of confusion.",
    hp: 35,
    attack: 9,
    defense: 4,
    speed: 6,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "potion", weight: 30 },
      { rarity: "uncommon", category: "armor", weight: 10 },
    ],
  },
  {
    id: "shard_walker",
    dungeonId: "crystal_caverns",
    name: "Shard Walker",
    pun: "Broke off from a long sentence and never looked back.",
    hp: 50,
    attack: 6,
    defense: 10,
    speed: 3,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "gold", weight: 30, minAmount: 10, maxAmount: 25 },
      { rarity: "rare", category: "key", weight: 8 },
    ],
  },
  {
    id: "echo_bat",
    dungeonId: "crystal_caverns",
    name: "Echo Bat",
    pun: "Only repeats what you say — with spelling errors.",
    hp: 25,
    attack: 8,
    defense: 3,
    speed: 8,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 45, minAmount: 3, maxAmount: 12 },
      { rarity: "uncommon", category: "potion", weight: 15 },
    ],
  },
  {
    id: "facet_spider",
    dungeonId: "crystal_caverns",
    name: "Facet Spider",
    pun: "Webs of synonyms trap the unwary reader.",
    hp: 38,
    attack: 7,
    defense: 6,
    speed: 5,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "potion", weight: 25 },
      { rarity: "uncommon", category: "map", weight: 12 },
    ],
  },
  {
    id: "the_lexicon_crystal",
    dungeonId: "crystal_caverns",
    name: "The Lexicon Crystal",
    pun: "Contains every word — except the ones you need.",
    hp: 120,
    attack: 12,
    defense: 10,
    speed: 4,
    isBoss: true,
    bossAbility: "Reflect: mirrors your last word back as damage",
    bossPattern: ["attack", "defend", "reflect", "attack", "enchant", "attack"],
    lootTable: [
      { rarity: "epic", category: "weapon", weight: 25 },
      { rarity: "rare", category: "armor", weight: 20 },
      { rarity: "rare", category: "gold", weight: 30, minAmount: 50, maxAmount: 100 },
      { rarity: "legendary", category: "key", weight: 5 },
    ],
  },

  // Shadow Labyrinth
  {
    id: "ink_wraith",
    dungeonId: "shadow_labyrinth",
    name: "Ink Wraith",
    pun: "Haunts unfinished manuscripts at midnight.",
    hp: 35,
    attack: 8,
    defense: 4,
    speed: 7,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 40, minAmount: 8, maxAmount: 18 },
      { rarity: "uncommon", category: "potion", weight: 20 },
    ],
  },
  {
    id: "page_turner",
    dungeonId: "shadow_labyrinth",
    name: "Page Turner",
    pun: "Literally turns pages — violently.",
    hp: 45,
    attack: 6,
    defense: 7,
    speed: 5,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "potion", weight: 25 },
      { rarity: "uncommon", category: "armor", weight: 12 },
    ],
  },
  {
    id: "blank_ghoul",
    dungeonId: "shadow_labyrinth",
    name: "Blank Ghoul",
    pun: "Stares at you with the emptiness of a missing word.",
    hp: 40,
    attack: 10,
    defense: 3,
    speed: 6,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "weapon", weight: 18 },
      { rarity: "common", category: "gold", weight: 35, minAmount: 5, maxAmount: 20 },
    ],
  },
  {
    id: "typo_demon",
    dungeonId: "shadow_labyrinth",
    name: "Typo Demon",
    pun: "Corrupts every word it touches — literally.",
    hp: 30,
    attack: 11,
    defense: 2,
    speed: 9,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 50, minAmount: 6, maxAmount: 15 },
      { rarity: "uncommon", category: "potion", weight: 15 },
    ],
  },
  {
    id: "fog_phantom",
    dungeonId: "shadow_labyrinth",
    name: "Fog Phantom",
    pun: "Its presence is unclear — much like its grammar.",
    hp: 50,
    attack: 7,
    defense: 6,
    speed: 4,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "map", weight: 15 },
      { rarity: "common", category: "potion", weight: 30 },
    ],
  },
  {
    id: "lost_syllable",
    dungeonId: "shadow_labyrinth",
    name: "Lost Syllable",
    pun: "Can never finish a sentence. Always trails off...",
    hp: 28,
    attack: 9,
    defense: 5,
    speed: 7,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "gold", weight: 25, minAmount: 10, maxAmount: 22 },
      { rarity: "rare", category: "key", weight: 5 },
    ],
  },
  {
    id: "the_oblivion_scribe",
    dungeonId: "shadow_labyrinth",
    name: "The Oblivion Scribe",
    pun: "Writes you out of existence — one word at a time.",
    hp: 150,
    attack: 14,
    defense: 8,
    speed: 5,
    isBoss: true,
    bossAbility: "Erase: removes letters from your available pool",
    bossPattern: ["attack", "erase", "attack", "defend", "erase", "attack"],
    lootTable: [
      { rarity: "epic", category: "armor", weight: 20 },
      { rarity: "rare", category: "weapon", weight: 25 },
      { rarity: "legendary", category: "potion", weight: 8 },
      { rarity: "rare", category: "gold", weight: 30, minAmount: 60, maxAmount: 120 },
    ],
  },

  // Dragon's Keep
  {
    id: "rhyme_drake",
    dungeonId: "dragons_keep",
    name: "Rhyme Drake",
    pun: "Every attack comes with a matching couplet.",
    hp: 55,
    attack: 9,
    defense: 6,
    speed: 5,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 35, minAmount: 10, maxAmount: 25 },
      { rarity: "uncommon", category: "weapon", weight: 15 },
    ],
  },
  {
    id: "syntax_serpent",
    dungeonId: "dragons_keep",
    name: "Syntax Serpent",
    pun: "Strict grammar enforcement — or you get eaten.",
    hp: 48,
    attack: 10,
    defense: 7,
    speed: 6,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "armor", weight: 15 },
      { rarity: "common", category: "potion", weight: 25 },
    ],
  },
  {
    id: "vowel_wyvern",
    dungeonId: "dragons_keep",
    name: "Vowel Wyvern",
    pun: "Only attacks with A, E, I, O, U — and sometimes Y.",
    hp: 42,
    attack: 12,
    defense: 4,
    speed: 7,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 40, minAmount: 8, maxAmount: 20 },
      { rarity: "uncommon", category: "map", weight: 12 },
    ],
  },
  {
    id: "consonant_golem",
    dungeonId: "dragons_keep",
    name: "Consonant Golem",
    pun: "Tough, unyielding, and completely without vowels.",
    hp: 65,
    attack: 8,
    defense: 12,
    speed: 2,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "armor", weight: 18 },
      { rarity: "rare", category: "key", weight: 6 },
    ],
  },
  {
    id: "spell_wyrm",
    dungeonId: "dragons_keep",
    name: "Spell Wyrm",
    pun: "Knows every spell — but keeps misspelling them.",
    hp: 52,
    attack: 11,
    defense: 5,
    speed: 6,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "weapon", weight: 15 },
      { rarity: "common", category: "gold", weight: 35, minAmount: 12, maxAmount: 28 },
    ],
  },
  {
    id: "claw_scholar",
    dungeonId: "dragons_keep",
    name: "Claw Scholar",
    pun: "PhD in Applied Ripping-Things-Apart.",
    hp: 45,
    attack: 13,
    defense: 4,
    speed: 5,
    isBoss: false,
    lootTable: [
      { rarity: "rare", category: "potion", weight: 10 },
      { rarity: "uncommon", category: "gold", weight: 30, minAmount: 10, maxAmount: 22 },
    ],
  },
  {
    id: "the_ancient_lexicon",
    dungeonId: "dragons_keep",
    name: "The Ancient Lexicon",
    pun: "Every word in existence is under its copyright.",
    hp: 200,
    attack: 15,
    defense: 12,
    speed: 3,
    isBoss: true,
    bossAbility: "Dictionary Slam: deals damage based on word length you used",
    bossPattern: ["defend", "attack", "slam", "attack", "defend", "slam"],
    lootTable: [
      { rarity: "legendary", category: "weapon", weight: 12 },
      { rarity: "epic", category: "armor", weight: 20 },
      { rarity: "rare", category: "gold", weight: 25, minAmount: 80, maxAmount: 150 },
      { rarity: "epic", category: "potion", weight: 15 },
    ],
  },

  // Sky Temple
  {
    id: "cloud_scribe",
    dungeonId: "sky_temple",
    name: "Cloud Scribe",
    pun: "Writes in the sky but always gets erased by wind.",
    hp: 38,
    attack: 8,
    defense: 5,
    speed: 8,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 40, minAmount: 10, maxAmount: 22 },
      { rarity: "uncommon", category: "potion", weight: 15 },
    ],
  },
  {
    id: "wind_whisper",
    dungeonId: "sky_temple",
    name: "Wind Whisper",
    pun: "Speaks so softly you can only hear typos.",
    hp: 30,
    attack: 10,
    defense: 3,
    speed: 10,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "weapon", weight: 15 },
      { rarity: "common", category: "gold", weight: 35, minAmount: 8, maxAmount: 18 },
    ],
  },
  {
    id: "storm_lexicon",
    dungeonId: "sky_temple",
    name: "Storm Lexicon",
    pun: "A whirlwind of random words that makes no sense.",
    hp: 55,
    attack: 9,
    defense: 6,
    speed: 7,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "armor", weight: 15 },
      { rarity: "common", category: "potion", weight: 25 },
    ],
  },
  {
    id: "feather_quill",
    dungeonId: "sky_temple",
    name: "Feather Quill",
    pun: "Light as a feather, sharp as a... well, a quill.",
    hp: 32,
    attack: 12,
    defense: 2,
    speed: 9,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "map", weight: 12 },
      { rarity: "common", category: "gold", weight: 45, minAmount: 6, maxAmount: 16 },
    ],
  },
  {
    id: "zenith_spirit",
    dungeonId: "sky_temple",
    name: "Zenith Spirit",
    pun: "Reached the peak of vocabulary — and stayed there.",
    hp: 60,
    attack: 7,
    defense: 9,
    speed: 4,
    isBoss: false,
    lootTable: [
      { rarity: "rare", category: "key", weight: 8 },
      { rarity: "uncommon", category: "potion", weight: 18 },
    ],
  },
  {
    id: "breeze_nymph",
    dungeonId: "sky_temple",
    name: "Breeze Nymph",
    pun: "Gentle but will blow away your concentration.",
    hp: 28,
    attack: 8,
    defense: 3,
    speed: 11,
    isBoss: false,
    lootTable: [
      { rarity: "common", category: "gold", weight: 50, minAmount: 5, maxAmount: 14 },
      { rarity: "uncommon", category: "potion", weight: 12 },
    ],
  },
  {
    id: "the_celestial_author",
    dungeonId: "sky_temple",
    name: "The Celestial Author",
    pun: "Wrote the universe — now on book three of the trilogy.",
    hp: 180,
    attack: 13,
    defense: 9,
    speed: 6,
    isBoss: true,
    bossAbility: "Plot Twist: reverses the player's stat buffs",
    bossPattern: ["attack", "twist", "defend", "attack", "twist", "attack", "defend"],
    lootTable: [
      { rarity: "legendary", category: "armor", weight: 12 },
      { rarity: "epic", category: "weapon", weight: 18 },
      { rarity: "epic", category: "potion", weight: 15 },
      { rarity: "rare", category: "gold", weight: 25, minAmount: 70, maxAmount: 130 },
    ],
  },

  // Abyss of Words
  {
    id: "void_stalker",
    dungeonId: "abyss_of_words",
    name: "Void Stalker",
    pun: "Where words go when they're deleted forever.",
    hp: 60,
    attack: 12,
    defense: 5,
    speed: 7,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "gold", weight: 30, minAmount: 12, maxAmount: 28 },
      { rarity: "rare", category: "weapon", weight: 10 },
    ],
  },
  {
    id: "null_beast",
    dungeonId: "abyss_of_words",
    name: "Null Beast",
    pun: "The value of its vocabulary is literally null.",
    hp: 70,
    attack: 10,
    defense: 8,
    speed: 4,
    isBoss: false,
    lootTable: [
      { rarity: "uncommon", category: "armor", weight: 15 },
      { rarity: "common", category: "potion", weight: 25 },
    ],
  },
  {
    id: "silence_wraith",
    dungeonId: "abyss_of_words",
    name: "Silence Wraith",
    pun: "Its favorite word is '...' — and nothing else.",
    hp: 45,
    attack: 14,
    defense: 3,
    speed: 8,
    isBoss: false,
    lootTable: [
      { rarity: "rare", category: "potion", weight: 8 },
      { rarity: "uncommon", category: "gold", weight: 30, minAmount: 10, maxAmount: 25 },
    ],
  },
  {
    id: "oblivion_crawler",
    dungeonId: "abyss_of_words",
    name: "Oblivion Crawler",
    pun: "Crawls through forgotten paragraphs looking for scraps.",
    hp: 55,
    attack: 11,
    defense: 7,
    speed: 6,
    isBoss: false,
    lootTable: [
      { rarity: "rare", category: "key", weight: 8 },
      { rarity: "uncommon", category: "map", weight: 12 },
    ],
  },
  {
    id: "forgotten_tome",
    dungeonId: "abyss_of_words",
    name: "Forgotten Tome",
    pun: "Contains knowledge so old even Google doesn't have it.",
    hp: 80,
    attack: 9,
    defense: 10,
    speed: 3,
    isBoss: false,
    lootTable: [
      { rarity: "epic", category: "weapon", weight: 5 },
      { rarity: "uncommon", category: "armor", weight: 15 },
      { rarity: "common", category: "gold", weight: 30, minAmount: 15, maxAmount: 30 },
    ],
  },
  {
    id: "entropy_golem",
    dungeonId: "abyss_of_words",
    name: "Entropy Golem",
    pun: "Slowly jumbles every sentence into chaos.",
    hp: 75,
    attack: 13,
    defense: 9,
    speed: 2,
    isBoss: false,
    lootTable: [
      { rarity: "rare", category: "potion", weight: 10 },
      { rarity: "uncommon", category: "weapon", weight: 12 },
    ],
  },
  {
    id: "the_unspeakable",
    dungeonId: "abyss_of_words",
    name: "The Unspeakable",
    pun: "Its name cannot be pronounced — which is convenient.",
    hp: 250,
    attack: 16,
    defense: 11,
    speed: 5,
    isBoss: true,
    bossAbility: "Unspeak: silences the player for 2 turns",
    bossPattern: ["attack", "unspeak", "attack", "defend", "attack", "unspeak", "attack"],
    lootTable: [
      { rarity: "mythic", category: "weapon", weight: 5 },
      { rarity: "legendary", category: "armor", weight: 10 },
      { rarity: "epic", category: "potion", weight: 20 },
      { rarity: "legendary", category: "gold", weight: 20, minAmount: 100, maxAmount: 200 },
      { rarity: "epic", category: "key", weight: 12 },
    ],
  },
];

const UPGRADE_DEFS: MetaUpgrade[] = [
  {
    id: "max_hp",
    name: "Vitality",
    description: "Increases maximum HP by +10 per level.",
    icon: "❤️",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 50,
    costScale: 1.5,
  },
  {
    id: "attack",
    name: "Strength",
    description: "Increases base attack power by +2 per level.",
    icon: "⚔️",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 60,
    costScale: 1.6,
  },
  {
    id: "defense",
    name: "Fortitude",
    description: "Increases base defense by +2 per level.",
    icon: "🛡️",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 55,
    costScale: 1.5,
  },
  {
    id: "speed",
    name: "Agility",
    description: "Increases speed by +1 per level.",
    icon: "💨",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 45,
    costScale: 1.4,
  },
  {
    id: "luck",
    name: "Fortune",
    description: "Increases loot quality chance by +5% per level.",
    icon: "🍀",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 70,
    costScale: 1.7,
  },
  {
    id: "inventory",
    name: "Pack Rat",
    description: "Adds +2 inventory slots per level.",
    icon: "🎒",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 80,
    costScale: 1.8,
  },
  {
    id: "potion_power",
    name: "Alchemy",
    description: "Increases potion healing power by +15% per level.",
    icon: "🧪",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 65,
    costScale: 1.6,
  },
  {
    id: "xp_bonus",
    name: "Wisdom",
    description: "Increases XP gain by +10% per level.",
    icon: "📖",
    maxLevel: 10,
    currentLevel: 0,
    baseCost: 75,
    costScale: 1.7,
  },
];

const RARITY_ORDER: RarityTier[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
];

const RARITY_COLORS: Record<RarityTier, string> = {
  common: "#9ca3af",
  uncommon: "#22c55e",
  rare: "#3b82f6",
  epic: "#a855f7",
  legendary: "#f59e0b",
  mythic: "#ef4444",
};

const WEAPON_NAMES: Record<RarityTier, string[]> = {
  common: ["Dull Pencil", "Chewed Eraser", "Paper Clip Sword"],
  uncommon: ["Silver Quill", "Ink Blade", "Thesaurus Shiv"],
  rare: ["Dictionary Mace", "Grammar Lance", "Vocabulary Staff"],
  epic: ["Lexicon Greatsword", "Etymology Bow", "Synonym Crossbow"],
  legendary: ["The Word Smith's Hammer", "Omniscient Pen", "Tower of Babel"],
  mythic: ["The Original Word", "Universe Script", "Logos Prime"],
};

const ARMOR_NAMES: Record<RarityTier, string[]> = {
  common: ["Cardboard Shield", "Notebook Vest", "Paper Helmet"],
  uncommon: ["Parchment Cuirass", "Leather Dictionary", "Cloak of Literacy"],
  rare: ["Chain-mail of Chapters", "Grammar Guard Plate", "Tome Shield"],
  epic: ["Encyclopedia Aegis", "Thesaurus Warplate", "Library Fortress Armor"],
  legendary: ["Armor of the Author", "Bibliophile's Bulwark", "Oxford Defender"],
  mythic: ["The Unbreakable Dictionary", "Rosetta Shield", "Logos Barrier"],
};

const POTION_NAMES: Record<RarityTier, string[]> = {
  common: ["Minor Ink Tonic", "Weak Word Brew", "Basic Syllable Draft"],
  uncommon: ["Elixir of Clarity", "Potion of Rhyme", "Scroll Soup"],
  rare: ["Philter of Eloquence", "Brew of the Bard", "Essence of Etymology"],
  epic: ["Nectar of the Narrator", "Serum of Syntax", "Distilled Dictionary"],
  legendary: ["Ambrosia of Authors", "The Writer's Tears", "Muse's Blessing"],
  mythic: ["The Final Chapter", "Liquid Logos", "Dew of Creation"],
};

const PUZZLE_BANK: Record<PuzzleSubtype, { prompt: string; solution: string; hints: string[] }[]> = {
  anagram: [
    { prompt: "Rearrange: LISTEN", solution: "SILENT", hints: ["A state of quiet", "Anagram of LISTEN"] },
    { prompt: "Rearrange: EARTH", solution: "HEART", hints: ["Organ of love", "Anagram of EARTH"] },
    { prompt: "Rearrange: SAVE", solution: "VASE", hints: ["Flower holder", "Anagram of SAVE"] },
    { prompt: "Rearrange: TALES", solution: "STEAL", hints: ["To take without permission", "Anagram of TALES"] },
    { prompt: "Rearrange: BELOW", solution: "BOWEL", hints: ["Intestine part", "Anagram of BELOW"] },
    { prompt: "Rearrange: LEMON", solution: "MELON", hints: ["A large fruit", "Anagram of LEMON"] },
    { prompt: "Rearrange: CHEATER", solution: "TEACHER", hints: ["Educator", "Anagram of CHEATER"] },
    { prompt: "Rearrange: DUSTER", solution: "RUSTED", hints: ["Corroded", "Anagram of DUSTER"] },
    { prompt: "Rearrange: KNEEL", solution: "LEEK", hints: ["A type of onion", "Anagram of KNEEL"] },
    { prompt: "Rearrange: MEAT", solution: "TEAM", hints: ["Group working together", "Anagram of MEAT"] },
  ],
  fill_blank: [
    { prompt: "A word that means 'happy' starting with J: J___", solution: "JOYFUL", hints: ["Contains 'joy'", "6 letters"] },
    { prompt: "A word meaning 'fearless' starting with B: B___", solution: "BRAVE", hints: ["Contains 'rave'", "5 letters"] },
    { prompt: "Opposite of 'ancient': M___", solution: "MODERN", hints: ["Contains 'mode'", "6 letters"] },
    { prompt: "A synonym for 'smart' starting with C: C___", solution: "CLEVER", hints: ["Contains 'clever'", "6 letters"] },
    { prompt: "A large body of water: O___", solution: "OCEAN", hints: ["Contains 'o'", "5 letters"] },
    { prompt: "To make something better: I___", solution: "IMPROVE", hints: ["Contains 'prove'", "7 letters"] },
    { prompt: "The color of grass: G___", solution: "GREEN", hints: ["Contains 'reed'", "5 letters"] },
    { prompt: "A gentle wind: B___", solution: "BREEZE", hints: ["Contains 'reeze'", "6 letters"] },
    { prompt: "To move silently: S___", solution: "SNEAK", hints: ["Contains 'neak'", "5 letters"] },
    { prompt: "Very large in size: E___", solution: "ENORMOUS", hints: ["Contains 'norm'", "8 letters"] },
  ],
  word_search: [
    { prompt: "Find a 5-letter word in: RAINBOW", solution: "RAINBOW", hints: ["Full word", "Colors of the sky"] },
    { prompt: "Find a 5-letter word in: CASTLE", solution: "CASTLE", hints: ["Medieval building", "Full word"] },
    { prompt: "Find a 6-letter word in: PLANET", solution: "PLANET", hints: ["Celestial body", "Full word"] },
    { prompt: "Find a 4-letter word in: FLAME", solution: "FLAME", hints: ["Fire-related", "Full word"] },
    { prompt: "Find a 7-letter word in: DUNGEON", solution: "DUNGEON", hints: ["Dark underground place", "Full word"] },
    { prompt: "Find a 5-letter word in: CROWN", solution: "CROWN", hints: ["Royal headwear", "Full word"] },
    { prompt: "Find a 6-letter word in: SWORDS", solution: "SWORDS", hints: ["Bladed weapons", "Full word"] },
    { prompt: "Find a 5-letter word in: QUEST", solution: "QUEST", hints: ["An adventure mission", "Full word"] },
    { prompt: "Find a 8-letter word in: TREASURE", solution: "TREASURE", hints: ["Valuable items", "Full word"] },
    { prompt: "Find a 6-letter word in: PUZZLE", solution: "PUZZLE", hints: ["A brain teaser", "Full word"] },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function dgSeedRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function dgPickRandom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function dgMakeRange(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function dgGenerateUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function dgGetTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dgDateSeed(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function dgLootRarity(luck: number, rng: () => number): RarityTier {
  const roll = rng() * 100 + luck;
  if (roll >= 98) return "mythic";
  if (roll >= 93) return "legendary";
  if (roll >= 82) return "epic";
  if (roll >= 65) return "rare";
  if (roll >= 40) return "uncommon";
  return "common";
}

function dgLetterValue(letter: string): number {
  const c = letter.toUpperCase().charCodeAt(0);
  if (c < 65 || c > 90) return 0;
  return Math.min(10, Math.ceil((c - 64) / 2.6));
}

function dgWordDamage(word: string, baseAttack: number): number {
  let letterSum = 0;
  for (const ch of word) {
    letterSum += dgLetterValue(ch);
  }
  return word.length * letterSum + baseAttack;
}

// ─── State ───────────────────────────────────────────────────────────────────

interface DungeonWireState {
  currentRun: RunState | null;
  metaUpgrades: MetaUpgrade[];
  runHistory: RunRecord[];
  dungeonStats: Record<DungeonThemeId, DungeonStats>;
  dailyState: DailyDungeonState | null;
  totalGold: number;
  lastTimestamp: number;
}

let state: DungeonWireState | null = null;

function dgEnsureInit(): DungeonWireState {
  if (!state) {
    state = {
      currentRun: null,
      metaUpgrades: UPGRADE_DEFS.map((u) => ({ ...u })),
      runHistory: [],
      dungeonStats: {
        crystal_caverns: { bestFloor: 0, totalRuns: 0, totalClears: 0, totalMonstersDefeated: 0, totalGoldEarned: 0, totalLootFound: 0, fastestClearMs: null, highestScore: 0, bossDefeated: false },
        shadow_labyrinth: { bestFloor: 0, totalRuns: 0, totalClears: 0, totalMonstersDefeated: 0, totalGoldEarned: 0, totalLootFound: 0, fastestClearMs: null, highestScore: 0, bossDefeated: false },
        dragons_keep: { bestFloor: 0, totalRuns: 0, totalClears: 0, totalMonstersDefeated: 0, totalGoldEarned: 0, totalLootFound: 0, fastestClearMs: null, highestScore: 0, bossDefeated: false },
        sky_temple: { bestFloor: 0, totalRuns: 0, totalClears: 0, totalMonstersDefeated: 0, totalGoldEarned: 0, totalLootFound: 0, fastestClearMs: null, highestScore: 0, bossDefeated: false },
        abyss_of_words: { bestFloor: 0, totalRuns: 0, totalClears: 0, totalMonstersDefeated: 0, totalGoldEarned: 0, totalLootFound: 0, fastestClearMs: null, highestScore: 0, bossDefeated: false },
      },
      dailyState: null,
      totalGold: 0,
      lastTimestamp: Date.now(),
    };
  }
  return state;
}

function dgCreatePlayer(upgrades: MetaUpgrade[]): PlayerInstance {
  const lvl = (id: string) => upgrades.find((u) => u.id === id)!.currentLevel;
  return {
    hp: 50 + lvl("max_hp") * 10,
    maxHp: 50 + lvl("max_hp") * 10,
    baseAttack: 5 + lvl("attack") * 2,
    baseDefense: 3 + lvl("defense") * 2,
    baseSpeed: 3 + lvl("speed"),
    luck: lvl("luck") * 5,
    gold: 0,
    xp: 0,
    level: 1,
    inventory: [],
    equipment: { weapon: null, armor: null, accessory: null },
    potionPower: 1 + lvl("potion_power") * 0.15,
    inventorySlots: 20 + lvl("inventory") * 2,
  };
}

function dgGenerateFloorPuzzle(floorNumber: number, seed: number): FloorPuzzle {
  const rng = dgSeedRandom(seed + floorNumber * 137);
  const subtypes: PuzzleSubtype[] = ["anagram", "fill_blank", "word_search"];
  const subtype = dgPickRandom(subtypes, rng);
  const bank = PUZZLE_BANK[subtype];
  const entry = dgPickRandom(bank, rng);
  const difficulty = Math.min(10, Math.ceil(floorNumber / 2));
  const timeLimit = Math.max(30, 90 - floorNumber * 3);

  return {
    subtype,
    prompt: entry.prompt,
    solution: entry.solution,
    hints: entry.hints,
    timeLimit,
    difficulty,
  };
}

function dgGenerateMonster(dungeonId: DungeonThemeId, floorNumber: number, rng: () => number): MonsterDef {
  const dungeon = DUNGEONS.find((d) => d.id === dungeonId)!;
  const isBossFloor = floorNumber % 10 === 0;
  if (isBossFloor) {
    return MONSTERS.find((m) => m.id === dungeon.bossId)!;
  }
  // Scale monster stats with floor
  const monsterDef = { ...dgPickRandom(dungeon.monsterIds.map((id) => MONSTERS.find((m) => m.id === id)!), rng) };
  const scale = 1 + (floorNumber - 1) * 0.08;
  monsterDef.hp = Math.floor(monsterDef.hp * scale);
  monsterDef.attack = Math.floor(monsterDef.attack * scale);
  monsterDef.defense = Math.floor(monsterDef.defense * scale);
  return monsterDef;
}

function dgSpawnMonster(def: MonsterDef): MonsterInstance {
  return {
    defId: def.id,
    currentHp: def.hp,
    maxHp: def.hp,
    attack: def.attack,
    defense: def.defense,
    speed: def.speed,
    isBoss: def.isBoss,
    turnCount: 0,
    statusEffects: [],
  };
}

function dgGenerateLoot(monsterDef: MonsterDef, luck: number, floorNumber: number, rng: () => number): LootItem[] {
  const drops: LootItem[] = [];
  const totalWeight = monsterDef.lootTable.reduce((s, e) => s + e.weight, 0);

  for (const entry of monsterDef.lootTable) {
    const roll = rng() * totalWeight;
    if (roll < entry.weight) {
      const rarity = dgLootRarity(luck, rng);
      const adjustedRarity = RARITY_ORDER[Math.max(0, RARITY_ORDER.indexOf(rarity), RARITY_ORDER.indexOf(entry.rarity))];

      if (entry.category === "gold") {
        const amount = dgMakeRange(entry.minAmount ?? 5, entry.maxAmount ?? 15, rng) * (1 + Math.floor(floorNumber / 5));
        drops.push({
          uid: dgGenerateUid(),
          name: `${amount} Gold Coins`,
          description: `Shiny coins worth ${amount} gold.`,
          rarity: "common",
          category: "gold",
          level: floorNumber,
          value: amount,
        });
      } else if (entry.category === "key") {
        drops.push({
          uid: dgGenerateUid(),
          name: "Dungeon Key",
          description: "Opens a locked door on the next floor.",
          rarity: adjustedRarity,
          category: "key",
          level: floorNumber,
          value: 20 * (RARITY_ORDER.indexOf(adjustedRarity) + 1),
        });
      } else if (entry.category === "map") {
        drops.push({
          uid: dgGenerateUid(),
          name: "Floor Map",
          description: "Reveals the next floor's layout.",
          rarity: adjustedRarity,
          category: "map",
          level: floorNumber,
          value: 15 * (RARITY_ORDER.indexOf(adjustedRarity) + 1),
        });
      } else {
        const names = entry.category === "weapon" ? WEAPON_NAMES : entry.category === "armor" ? ARMOR_NAMES : POTION_NAMES;
        const name = dgPickRandom(names[adjustedRarity] || names.common, rng);
        drops.push({
          uid: dgGenerateUid(),
          name,
          description: `A ${adjustedRarity} ${entry.category} found on floor ${floorNumber}.`,
          rarity: adjustedRarity,
          category: entry.category,
          level: floorNumber,
          value: (RARITY_ORDER.indexOf(adjustedRarity) + 1) * 25 + floorNumber * 3,
        });
      }
    }
  }

  return drops;
}

function dgDetermineFloorType(floorNumber: number, seed: number): FloorType {
  if (floorNumber % 10 === 0) return "boss";
  const rng = dgSeedRandom(seed + floorNumber * 43);
  const roll = rng() * 100;
  if (roll < 30) return "word_puzzle";
  if (roll < 55) return "combat";
  if (roll < 75) return "treasure";
  return "trap";
}

function dgRecordRunResult(run: RunState): void {
  const s = dgEnsureInit();
  const stats = s.dungeonStats[run.dungeonId];
  stats.totalRuns++;
  stats.totalMonstersDefeated += run.monstersDefeated;
  stats.totalGoldEarned += run.goldEarned;
  stats.totalLootFound += run.lootFound;
  if (run.floor > stats.bestFloor) stats.bestFloor = run.floor;
  if (run.score > stats.highestScore) stats.highestScore = run.score;
  if (run.alive && run.floor >= 10 && run.endedAt) {
    stats.totalClears++;
    const clearTime = run.endedAt - run.startedAt;
    if (stats.fastestClearMs === null || clearTime < stats.fastestClearMs) {
      stats.fastestClearMs = clearTime;
    }
  }
  if (run.floor >= 10) {
    stats.bossDefeated = true;
  }
  s.totalGold += run.goldEarned;

  s.runHistory.unshift({
    runId: run.runId,
    dungeonId: run.dungeonId,
    floorReached: run.floor,
    score: run.score,
    goldEarned: run.goldEarned,
    monstersDefeated: run.monstersDefeated,
    lootFound: run.lootFound,
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    survived: run.alive,
    isDaily: run.isDaily,
  });

  if (s.runHistory.length > 50) {
    s.runHistory = s.runHistory.slice(0, 50);
  }
}

// ─── Public API: State Management ────────────────────────────────────────────

export function dgGetState(): DungeonWireState {
  return dgEnsureInit();
}

export function dgResetState(): void {
  state = null;
  dgEnsureInit();
}

// ─── Public API: Dungeon Info ────────────────────────────────────────────────

export function dgGetDungeons(): DungeonDef[] {
  return DUNGEONS.map((d) => ({ ...d }));
}

export function dgGetDungeon(id: DungeonThemeId): DungeonDef | null {
  const found = DUNGEONS.find((d) => d.id === id);
  return found ? { ...found } : null;
}

// ─── Public API: Run Management ──────────────────────────────────────────────

export function dgStartRun(dungeonId: DungeonThemeId): RunState {
  const s = dgEnsureInit();
  if (s.currentRun) {
    dgRecordRunResult(s.currentRun);
  }

  const player = dgCreatePlayer(s.metaUpgrades);
  const run: RunState = {
    runId: dgGenerateUid(),
    dungeonId,
    startedAt: Date.now(),
    endedAt: null,
    floor: 0,
    player,
    floors: [],
    monstersDefeated: 0,
    goldEarned: 0,
    lootFound: 0,
    score: 0,
    alive: true,
    isDaily: false,
  };

  s.currentRun = run;
  return run;
}

export function dgEndRun(): void {
  const s = dgEnsureInit();
  if (!s.currentRun) return;
  s.currentRun.endedAt = Date.now();
  s.currentRun.alive = false;
  dgRecordRunResult(s.currentRun);
  s.currentRun = null;
}

export function dgGetCurrentRun(): RunState | null {
  const s = dgEnsureInit();
  return s.currentRun ? { ...s.currentRun } : null;
}

// ─── Public API: Floor Management ────────────────────────────────────────────

export function dgGetCurrentFloor(): FloorState | null {
  const s = dgEnsureInit();
  if (!s.currentRun || s.currentRun.floors.length === 0) return null;
  const idx = s.currentRun.floors.length - 1;
  return { ...s.currentRun.floors[idx] };
}

export function dgEnterFloor(): FloorState {
  const s = dgEnsureInit();
  if (!s.currentRun) throw new Error("No active run");
  if (!s.currentRun.alive) throw new Error("Run is over");

  s.currentRun.floor += 1;
  const floorNumber = s.currentRun.floor;
  const seed = dgDateSeed(s.currentRun.runId);
  const floorType = dgDetermineFloorType(floorNumber, seed);
  const rng = dgSeedRandom(seed + floorNumber * 997);

  const puzzle =
    floorType === "word_puzzle"
      ? dgGenerateFloorPuzzle(floorNumber, seed + floorNumber)
      : null;

  let monster: MonsterInstance | null = null;
  let lootDrops: LootItem[] = [];

  if (floorType === "combat" || floorType === "boss") {
    const monsterDef = dgGenerateMonster(s.currentRun.dungeonId, floorNumber, rng);
    monster = dgSpawnMonster(monsterDef);
    lootDrops = dgGenerateLoot(monsterDef, s.currentRun.player.luck, floorNumber, rng);
  } else if (floorType === "treasure") {
    // Treasure floor: generate some loot
    for (let i = 0; i < 2 + Math.floor(floorNumber / 3); i++) {
      const rarity = dgLootRarity(s.currentRun.player.luck, rng);
      const cats: LootCategory[] = ["gold", "potion", "key", "map"];
      const cat = dgPickRandom(cats, rng);
      if (cat === "gold") {
        const amount = dgMakeRange(5, 30, rng) * (1 + Math.floor(floorNumber / 5));
        lootDrops.push({
          uid: dgGenerateUid(),
          name: `${amount} Gold Coins`,
          description: `Shiny coins worth ${amount} gold.`,
          rarity: "common",
          category: "gold",
          level: floorNumber,
          value: amount,
        });
      } else if (cat === "potion") {
        const name = dgPickRandom(POTION_NAMES[rarity] || POTION_NAMES.common, rng);
        lootDrops.push({
          uid: dgGenerateUid(),
          name,
          description: `A ${rarity} potion from floor ${floorNumber}.`,
          rarity,
          category: "potion",
          level: floorNumber,
          value: (RARITY_ORDER.indexOf(rarity) + 1) * 20 + floorNumber * 2,
        });
      } else {
        lootDrops.push({
          uid: dgGenerateUid(),
          name: cat === "key" ? "Dungeon Key" : "Floor Map",
          description: cat === "key" ? "Opens a locked door." : "Reveals the next floor.",
          rarity,
          category: cat,
          level: floorNumber,
          value: 15 * (RARITY_ORDER.indexOf(rarity) + 1),
        });
      }
    }
  }

  const floorState: FloorState = {
    floorNumber,
    floorType,
    puzzle,
    monster,
    lootDrops,
    cleared: false,
    enteredAt: Date.now(),
    clearedAt: null,
  };

  s.currentRun.floors.push(floorState);
  return { ...floorState };
}

export function dgClearFloor(): boolean {
  const s = dgEnsureInit();
  if (!s.currentRun) return false;
  const currentFloor = s.currentRun.floors[s.currentRun.floors.length - 1];
  if (!currentFloor || currentFloor.cleared) return false;

  currentFloor.cleared = true;
  currentFloor.clearedAt = Date.now();
  s.currentRun.score += currentFloor.floorNumber * 100;
  s.currentRun.player.xp += currentFloor.floorNumber * 15;

  // Level up check
  const xpNeeded = s.currentRun.player.level * 100;
  if (s.currentRun.player.xp >= xpNeeded) {
    s.currentRun.player.level += 1;
    s.currentRun.player.maxHp += 5;
    s.currentRun.player.hp = Math.min(s.currentRun.player.hp + 10, s.currentRun.player.maxHp);
    s.currentRun.player.baseAttack += 1;
  }

  return true;
}

export function dgGetFloorType(): FloorType | null {
  const floor = dgGetCurrentFloor();
  return floor ? floor.floorType : null;
}

export function dgGetFloorPuzzle(): FloorPuzzle | null {
  const floor = dgGetCurrentFloor();
  return floor?.puzzle ?? null;
}

// ─── Public API: Combat ──────────────────────────────────────────────────────

export function dgAttackMonster(word: string): { damage: number; monsterHp: number; monsterDefeated: boolean; bonus: string } {
  const s = dgEnsureInit();
  if (!s.currentRun) throw new Error("No active run");
  const floor = s.currentRun.floors[s.currentRun.floors.length - 1];
  if (!floor || !floor.monster || floor.cleared) {
    return { damage: 0, monsterHp: 0, monsterDefeated: false, bonus: "No active monster" };
  }

  const monster = floor.monster;
  const monsterDef = MONSTERS.find((m) => m.id === monster.defId)!;

  // Calculate damage: word length × letter value + base attack - monster defense
  const rawDamage = dgWordDamage(word, s.currentRun.player.baseAttack);
  const defense = monster.isBoss ? monsterDef.defense * 0.7 : monsterDef.defense;
  const damage = Math.max(1, Math.floor(rawDamage - defense));

  monster.currentHp = Math.max(0, monster.currentHp - damage);
  monster.turnCount += 1;

  let bonus = "";
  // Boss pattern check
  if (monster.isBoss && monsterDef.bossPattern) {
    const phase = monster.turnCount % monsterDef.bossPattern.length;
    const action = monsterDef.bossPattern[phase];
    if (action === "reflect" || action === "slam" || action === "twist" || action === "unspeak") {
      bonus = `Boss used ${action}!`;
      // Apply boss ability
      if (action === "slam" && word.length > 4) {
        const slamDmg = Math.floor(word.length * 1.5);
        s.currentRun.player.hp = Math.max(0, s.currentRun.player.hp - slamDmg);
        bonus = `Boss used Dictionary Slam! You took ${slamDmg} damage!`;
      }
      if (action === "unspeak") {
        monster.statusEffects.push("silenced_player_2");
        bonus = "Boss used Unspeak! Player silenced for 2 turns!";
      }
      if (action === "twist") {
        s.currentRun.player.baseAttack = Math.max(1, Math.floor(s.currentRun.player.baseAttack * 0.7));
        bonus = "Boss used Plot Twist! Attack reduced!";
      }
    }
  }

  // Regular monster attack
  if (!monster.isBoss || bonus === "") {
    const monsterDmg = Math.max(1, monsterDef.attack - s.currentRun.player.baseDefense);
    s.currentRun.player.hp = Math.max(0, s.currentRun.player.hp - monsterDmg);
    bonus = `Monster counterattacked for ${monsterDmg} damage.`;
  }

  const monsterDefeated = monster.currentHp <= 0;
  if (monsterDefeated) {
    s.currentRun.monstersDefeated += 1;
    s.currentRun.score += monster.isBoss ? 5000 : 500;
    // Auto-collect gold drops
    for (const drop of floor.lootDrops) {
      if (drop.category === "gold") {
        s.currentRun.player.gold += drop.value;
        s.currentRun.goldEarned += drop.value;
      }
    }
    dgClearFloor();
  }

  // Check death
  if (s.currentRun.player.hp <= 0) {
    s.currentRun.alive = false;
    s.currentRun.endedAt = Date.now();
    dgRecordRunResult(s.currentRun);
    s.currentRun = null;
  }

  return { damage, monsterHp: monster.currentHp, monsterDefeated, bonus };
}

export function dgTakeDamage(amount: number): number {
  const s = dgEnsureInit();
  if (!s.currentRun) return 0;
  const mitigated = Math.max(0, Math.floor(amount - s.currentRun.player.baseDefense * 0.5));
  s.currentRun.player.hp = Math.max(0, s.currentRun.player.hp - mitigated);
  if (s.currentRun.player.hp <= 0) {
    s.currentRun.alive = false;
    s.currentRun.endedAt = Date.now();
    dgRecordRunResult(s.currentRun);
    s.currentRun = null;
  }
  return mitigated;
}

export function dgHeal(amount: number): number {
  const s = dgEnsureInit();
  if (!s.currentRun) return 0;
  const effective = Math.floor(amount * s.currentRun.player.potionPower);
  const actual = Math.min(effective, s.currentRun.player.maxHp - s.currentRun.player.hp);
  s.currentRun.player.hp += actual;
  return actual;
}

// ─── Public API: Monster Info ────────────────────────────────────────────────

export function dgGetMonster(): MonsterInstance | null {
  const floor = dgGetCurrentFloor();
  return floor?.monster ? { ...floor.monster } : null;
}

function dgGetMonsterDef(id: string): MonsterDef | undefined {
  return MONSTERS.find((m) => m.id === id);
}

export function dgGetBoss(dungeonId: DungeonThemeId): MonsterDef | undefined {
  const dungeon = DUNGEONS.find((d) => d.id === dungeonId);
  if (!dungeon) return undefined;
  return MONSTERS.find((m) => m.id === dungeon.bossId);
}

// ─── Public API: Loot System ─────────────────────────────────────────────────

export function dgGetLoot(): LootItem[] {
  const floor = dgGetCurrentFloor();
  return floor?.lootDrops ? [...floor.lootDrops] : [];
}

export function dgPickupLoot(lootUid: string): LootItem | null {
  const s = dgEnsureInit();
  if (!s.currentRun) return null;
  const floor = s.currentRun.floors[s.currentRun.floors.length - 1];
  if (!floor) return null;

  const idx = floor.lootDrops.findIndex((l) => l.uid === lootUid);
  if (idx === -1) return null;

  const item = floor.lootDrops.splice(idx, 1)[0];

  if (item.category === "gold") {
    s.currentRun.player.gold += item.value;
    s.currentRun.goldEarned += item.value;
    s.currentRun.score += item.value;
    return item;
  }

  if (s.currentRun.player.inventory.length >= s.currentRun.player.inventorySlots) {
    // Put it back
    floor.lootDrops.splice(idx, 0, item);
    return null;
  }

  s.currentRun.player.inventory.push(item);
  s.currentRun.lootFound += 1;
  s.currentRun.score += item.value;
  return item;
}

export function dgEquipItem(itemUid: string): LootItem | null {
  const s = dgEnsureInit();
  if (!s.currentRun) return null;

  const invIdx = s.currentRun.player.inventory.findIndex((i) => i.uid === itemUid);
  if (invIdx === -1) return null;

  const item = s.currentRun.player.inventory[invIdx];
  if (item.category !== "weapon" && item.category !== "armor") return null;

  // Unequip current
  const slot = item.category as "weapon" | "armor";
  if (s.currentRun.player.equipment[slot]) {
    const old = s.currentRun.player.equipment[slot]!;
    old.equipped = false;
  }

  item.equipped = true;
  s.currentRun.player.equipment[slot] = item;

  // Recalculate stats
  const eq = s.currentRun.player.equipment;
  const baseAtk = 5 + s.metaUpgrades.find((u) => u.id === "attack")!.currentLevel * 2;
  const baseDef = 3 + s.metaUpgrades.find((u) => u.id === "defense")!.currentLevel * 2;
  s.currentRun.player.baseAttack = baseAtk + (eq.weapon ? RARITY_ORDER.indexOf(eq.weapon.rarity) + 1 : 0) * 2;
  s.currentRun.player.baseDefense = baseDef + (eq.armor ? RARITY_ORDER.indexOf(eq.armor.rarity) + 1 : 0) * 2;

  return item;
}

// ─── Public API: Inventory ───────────────────────────────────────────────────

export function dgGetInventory(): LootItem[] {
  const s = dgEnsureInit();
  if (!s.currentRun) return [];
  return [...s.currentRun.player.inventory];
}

export function dgDropItem(itemUid: string): boolean {
  const s = dgEnsureInit();
  if (!s.currentRun) return false;
  const idx = s.currentRun.player.inventory.findIndex((i) => i.uid === itemUid);
  if (idx === -1) return false;
  const item = s.currentRun.player.inventory[idx];
  if (item.equipped) {
    const slot = item.category as "weapon" | "armor";
    s.currentRun.player.equipment[slot] = null;
  }
  s.currentRun.player.inventory.splice(idx, 1);
  return true;
}

export function dgUsePotion(itemUid: string): { healed: number; effect: string } | null {
  const s = dgEnsureInit();
  if (!s.currentRun) return null;
  const idx = s.currentRun.player.inventory.findIndex((i) => i.uid === itemUid);
  if (idx === -1) return null;

  const item = s.currentRun.player.inventory[idx];
  if (item.category !== "potion") return null;

  const baseHeal = (RARITY_ORDER.indexOf(item.rarity) + 1) * 10 + item.level * 3;
  const healed = dgHeal(baseHeal);
  s.currentRun.player.inventory.splice(idx, 1);

  const effects: Record<RarityTier, string> = {
    common: "Restored a small amount of HP.",
    uncommon: "Restored HP and gained a slight defense boost.",
    rare: "Restored HP and gained a temporary attack boost.",
    epic: "Significant HP restore with attack and defense buffs.",
    legendary: "Massive heal! All stats temporarily boosted!",
    mythic: "Full heal! Overhealed with a shield effect!",
  };

  if (item.rarity === "mythic") {
    s.currentRun.player.hp = Math.min(
      s.currentRun.player.maxHp + 20,
      s.currentRun.player.hp + healed,
    );
  }

  return { healed, effect: effects[item.rarity] };
}

// ─── Public API: Meta-Upgrades ───────────────────────────────────────────────

export function dgGetUpgrades(): MetaUpgrade[] {
  const s = dgEnsureInit();
  return s.metaUpgrades.map((u) => ({ ...u }));
}

export function dgGetUpgradeCost(upgradeId: string): number {
  const s = dgEnsureInit();
  const upgrade = s.metaUpgrades.find((u) => u.id === upgradeId);
  if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return Infinity;
  return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScale, upgrade.currentLevel));
}

export function dgBuyUpgrade(upgradeId: string): { success: boolean; cost: number; newLevel: number } {
  const s = dgEnsureInit();
  const upgrade = s.metaUpgrades.find((u) => u.id === upgradeId);
  if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) {
    return { success: false, cost: 0, newLevel: upgrade?.currentLevel ?? 0 };
  }

  const cost = dgGetUpgradeCost(upgradeId);
  if (s.totalGold < cost) {
    return { success: false, cost, newLevel: upgrade.currentLevel };
  }

  s.totalGold -= cost;
  upgrade.currentLevel += 1;

  // If there's an active run, apply some upgrades mid-run
  if (s.currentRun) {
    if (upgradeId === "max_hp") {
      const increase = 10;
      s.currentRun.player.maxHp += increase;
      s.currentRun.player.hp += increase;
    } else if (upgradeId === "attack") {
      s.currentRun.player.baseAttack += 2;
    } else if (upgradeId === "defense") {
      s.currentRun.player.baseDefense += 2;
    } else if (upgradeId === "speed") {
      s.currentRun.player.baseSpeed += 1;
    } else if (upgradeId === "luck") {
      s.currentRun.player.luck += 5;
    } else if (upgradeId === "inventory") {
      s.currentRun.player.inventorySlots += 2;
    } else if (upgradeId === "potion_power") {
      s.currentRun.player.potionPower += 0.15;
    }
  }

  return { success: true, cost, newLevel: upgrade.currentLevel };
}

// ─── Public API: Player Info ─────────────────────────────────────────────────

export function dgGetPlayerStats(): {
  hp: number; maxHp: number; attack: number; defense: number;
  speed: number; luck: number; gold: number; xp: number; level: number;
  score: number; alive: boolean;
} | null {
  const s = dgEnsureInit();
  if (!s.currentRun) return null;
  const p = s.currentRun.player;
  return {
    hp: p.hp,
    maxHp: p.maxHp,
    attack: p.baseAttack,
    defense: p.baseDefense,
    speed: p.baseSpeed,
    luck: p.luck,
    gold: p.gold,
    xp: p.xp,
    level: p.level,
    score: s.currentRun.score,
    alive: s.currentRun.alive,
  };
}

function dgGetEquipment(): { weapon: LootItem | null; armor: LootItem | null; accessory: LootItem | null } | null {
  const s = dgEnsureInit();
  if (!s.currentRun) return null;
  const eq = s.currentRun.player.equipment;
  return {
    weapon: eq.weapon ? { ...eq.weapon } : null,
    armor: eq.armor ? { ...eq.armor } : null,
    accessory: eq.accessory ? { ...eq.accessory } : null,
  };
}

// ─── Public API: Statistics ──────────────────────────────────────────────────

export function dgGetRunStats(): {
  totalRuns: number; totalFloorsCleared: number; totalMonstersDefeated: number;
  totalGoldEarned: number; totalLootFound: number; highestScore: number;
  bossDefeatedCount: number;
} {
  const s = dgEnsureInit();
  const allStats = Object.values(s.dungeonStats);
  return {
    totalRuns: allStats.reduce((a, b) => a + b.totalRuns, 0),
    totalFloorsCleared: allStats.reduce((a, b) => a + b.bestFloor, 0),
    totalMonstersDefeated: allStats.reduce((a, b) => a + b.totalMonstersDefeated, 0),
    totalGoldEarned: s.totalGold,
    totalLootFound: allStats.reduce((a, b) => a + b.totalLootFound, 0),
    highestScore: Math.max(...allStats.map((b) => b.highestScore), 0),
    bossDefeatedCount: allStats.filter((b) => b.bossDefeated).length,
  };
}

export function dgGetDungeonStats(dungeonId: DungeonThemeId): DungeonStats {
  const s = dgEnsureInit();
  return { ...s.dungeonStats[dungeonId] };
}

export function dgGetBestRun(): RunRecord | null {
  const s = dgEnsureInit();
  if (s.runHistory.length === 0) return null;
  const best = [...s.runHistory].sort((a, b) => b.score - a.score)[0];
  return { ...best };
}

export function dgGetTotalGoldEarned(): number {
  const s = dgEnsureInit();
  return s.totalGold;
}

export function dgGetRunHistory(): RunRecord[] {
  const s = dgEnsureInit();
  return s.runHistory.slice(0, 10).map((r) => ({ ...r }));
}

// ─── Public API: Daily Dungeon ───────────────────────────────────────────────

export function dgGetDailyDungeon(): DailyDungeonState {
  const s = dgEnsureInit();
  const today = dgGetTodayString();

  if (s.dailyState && s.dailyState.date === today) {
    return { ...s.dailyState };
  }

  const seed = dgDateSeed(today);
  const rng = dgSeedRandom(seed);
  const dungeonIndex = Math.floor(rng() * DUNGEONS.length);
  const dungeon = DUNGEONS[dungeonIndex];

  const modifierPool = [
    "Double Gold",
    "Extra Loot",
    "Harder Monsters",
    "Speed Bonus",
    "Puzzle Expert",
    "No Healing",
    "Boss Rush",
    "Lucky Day",
  ];
  const modifiers: string[] = [];
  for (let i = 0; i < 2; i++) {
    const mod = dgPickRandom(modifierPool, rng);
    if (!modifiers.includes(mod)) modifiers.push(mod);
  }

  s.dailyState = {
    date: today,
    dungeonId: dungeon.id,
    completed: false,
    modifiers,
    bonusReward: {
      uid: dgGenerateUid(),
      name: "Daily Crystal",
      description: "A special reward for completing the daily dungeon.",
      rarity: "epic",
      category: "potion",
      level: 10,
      value: 500,
    },
  };

  return { ...s.dailyState };
}

function dgStartDailyRun(): RunState {
  const daily = dgGetDailyDungeon();
  if (daily.completed) throw new Error("Daily dungeon already completed today");
  const run = dgStartRun(daily.dungeonId);
  const s = dgEnsureInit();
  if (s.currentRun) {
    s.currentRun.isDaily = true;
  }
  return run;
}

export function dgCompleteDailyDungeon(): boolean {
  const s = dgEnsureInit();
  if (!s.currentRun || !s.currentRun.isDaily) return false;
  if (!s.dailyState) return false;

  s.dailyState.completed = true;
  dgEndRun();
  return true;
}

// ─── Public API: Floor Navigation ────────────────────────────────────────────

export function dgGetNextFloor(): { floorNumber: number; dungeonId: DungeonThemeId } | null {
  const s = dgEnsureInit();
  if (!s.currentRun || !s.currentRun.alive) return null;
  const dungeon = DUNGEONS.find((d) => d.id === s.currentRun!.dungeonId);
  if (!dungeon) return null;
  if (s.currentRun.floor >= dungeon.floors) return null;
  return { floorNumber: s.currentRun.floor + 1, dungeonId: s.currentRun.dungeonId };
}

export function dgGetFloorMap(): { current: number; total: number; floors: { num: number; type: FloorType; cleared: boolean }[] } {
  const s = dgEnsureInit();
  if (!s.currentRun) {
    return { current: 0, total: 10, floors: [] };
  }
  const dungeon = DUNGEONS.find((d) => d.id === s.currentRun!.dungeonId);
  const total = dungeon?.floors ?? 10;
  const current = s.currentRun.floor;

  const floors = s.currentRun.floors.map((f) => ({
    num: f.floorNumber,
    type: f.floorType,
    cleared: f.cleared,
  }));

  // Generate preview for upcoming floors
  const seed = dgDateSeed(s.currentRun.runId);
  for (let i = current + 1; i <= total; i++) {
    floors.push({
      num: i,
      type: dgDetermineFloorType(i, seed),
      cleared: false,
    });
  }

  return { current, total, floors };
}

// ─── Public API: UI Cards ────────────────────────────────────────────────────

export function dgGetDungeonCard(id: DungeonThemeId): {
  id: DungeonThemeId; name: string; description: string; icon: string;
  color: string; floors: number; bestFloor: number; bossDefeated: boolean;
  totalRuns: number; highestScore: number;
} | null {
  const def = DUNGEONS.find((d) => d.id === id);
  if (!def) return null;
  const stats = dgGetDungeonStats(id);
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    color: def.color,
    floors: def.floors,
    bestFloor: stats.bestFloor,
    bossDefeated: stats.bossDefeated,
    totalRuns: stats.totalRuns,
    highestScore: stats.highestScore,
  };
}

export function dgGetFloorCard(): {
  floorNumber: number; floorType: FloorType; floorTypeName: string;
  icon: string; cleared: boolean; hasMonster: boolean; hasPuzzle: boolean;
  lootCount: number; timeElapsed: number;
} | null {
  const floor = dgGetCurrentFloor();
  if (!floor) return null;

  const typeNames: Record<FloorType, string> = {
    word_puzzle: "Word Puzzle",
    combat: "Combat",
    treasure: "Treasure",
    trap: "Trap",
    boss: "Boss Fight",
  };
  const typeIcons: Record<FloorType, string> = {
    word_puzzle: "🧩",
    combat: "⚔️",
    treasure: "💰",
    trap: "⚡",
    boss: "👑",
  };

  return {
    floorNumber: floor.floorNumber,
    floorType: floor.floorType,
    floorTypeName: typeNames[floor.floorType],
    icon: typeIcons[floor.floorType],
    cleared: floor.cleared,
    hasMonster: floor.monster !== null,
    hasPuzzle: floor.puzzle !== null,
    lootCount: floor.lootDrops.length,
    timeElapsed: floor.clearedAt
      ? floor.clearedAt - floor.enteredAt
      : Date.now() - floor.enteredAt,
  };
}

export function dgGetMonsterCard(id: string): {
  id: string; name: string; pun: string; hp: number; attack: number;
  defense: number; speed: number; isBoss: boolean; bossAbility?: string;
  rarity: string; icon: string;
} | null {
  const def = MONSTERS.find((m) => m.id === id);
  if (!def) return null;
  const rarityLabel = def.isBoss
    ? (def.hp > 200 ? "Mythic" : def.hp > 150 ? "Legendary" : "Epic")
    : "Common";
  const icons: Record<string, string> = {
    crystal_caverns: "💎",
    shadow_labyrinth: "🌑",
    dragons_keep: "🐉",
    sky_temple: "☁️",
    abyss_of_words: "🕳️",
  };

  return {
    id: def.id,
    name: def.name,
    pun: def.pun,
    hp: def.hp,
    attack: def.attack,
    defense: def.defense,
    speed: def.speed,
    isBoss: def.isBoss,
    bossAbility: def.bossAbility,
    rarity: rarityLabel,
    icon: icons[def.dungeonId] || "👾",
  };
}

function dgGetLootCard(lootUid: string): {
  uid: string; name: string; description: string; rarity: RarityTier;
  category: LootCategory; level: number; value: number; color: string;
  icon: string;
} | null {
  const floor = dgGetCurrentFloor();
  if (!floor) {
    // Check inventory
    const s = dgEnsureInit();
    if (!s.currentRun) return null;
    const item = s.currentRun.player.inventory.find((i) => i.uid === lootUid);
    if (!item) return null;
    const icons: Record<LootCategory, string> = {
      weapon: "⚔️", armor: "🛡️", potion: "🧪", gold: "🪙", key: "🔑", map: "🗺️",
    };
    return { ...item, color: RARITY_COLORS[item.rarity], icon: icons[item.category] };
  }

  const item = floor.lootDrops.find((l) => l.uid === lootUid);
  if (!item) return null;
  const icons: Record<LootCategory, string> = {
    weapon: "⚔️", armor: "🛡️", potion: "🧪", gold: "🪙", key: "🔑", map: "🗺️",
  };
  return { ...item, color: RARITY_COLORS[item.rarity], icon: icons[item.category] };
}

// ─── Public API: UI Dashboard Helpers ────────────────────────────────────────

export function dgGetDungeonOverview(): {
  totalDungeons: number; totalFloors: number; completedBosses: number;
  totalMonsters: number; averageFloor: number; totalPlayTime: number;
} {
  const s = dgEnsureInit();
  const allStats = Object.values(s.dungeonStats);
  const totalRuns = allStats.reduce((a, b) => a + b.totalRuns, 0);

  return {
    totalDungeons: DUNGEONS.length,
    totalFloors: DUNGEONS.reduce((a, d) => a + d.floors, 0),
    completedBosses: allStats.filter((b) => b.bossDefeated).length,
    totalMonsters: MONSTERS.filter((m) => !m.isBoss).length,
    averageFloor: totalRuns > 0 ? Math.floor(allStats.reduce((a, b) => a + b.bestFloor, 0) / DUNGEONS.length) : 0,
    totalPlayTime: s.runHistory.reduce((a, r) => {
      const end = r.endedAt ?? Date.now();
      return a + (end - r.startedAt);
    }, 0),
  };
}

export function dgGetDungeonDashboard(): {
  currentRun: RunState | null;
  playerStats: ReturnType<typeof dgGetPlayerStats>;
  floorCard: ReturnType<typeof dgGetFloorCard>;
  nextFloor: ReturnType<typeof dgGetNextFloor>;
  dailyInfo: DailyDungeonState;
  overallStats: ReturnType<typeof dgGetRunStats>;
  upgrades: MetaUpgrade[];
  recentRuns: RunRecord[];
} {
  return {
    currentRun: dgGetCurrentRun(),
    playerStats: dgGetPlayerStats(),
    floorCard: dgGetFloorCard(),
    nextFloor: dgGetNextFloor(),
    dailyInfo: dgGetDailyDungeon(),
    overallStats: dgGetRunStats(),
    upgrades: dgGetUpgrades(),
    recentRuns: dgGetRunHistory(),
  };
}
