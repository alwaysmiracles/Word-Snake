import { useState, useCallback } from 'react';

// ============================================================
// Seeded PRNG — mulberry32
// ============================================================

function mulberry32(seed: number): () => number {
  return function (): number {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function hmAdvanceRng(seed: number): { value: number; nextSeed: number } {
  const s = (seed + 0x6D2B79F5) >>> 0;
  let t = s;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return { value: ((t ^ t >>> 14) >>> 0) / 4294967296, nextSeed: s };
}

function hmRollInRange(seed: number, min: number, max: number): { value: number; nextSeed: number } {
  const r = hmAdvanceRng(seed);
  return { value: min + Math.floor(r.value * (max - min + 1)), nextSeed: r.nextSeed };
}

function hmPickRandom<T>(seed: number, arr: T[]): { item: T; nextSeed: number } {
  if (arr.length === 0) return { item: arr[0] as T, nextSeed: seed };
  const r = hmAdvanceRng(seed);
  const idx = Math.floor(r.value * arr.length);
  return { item: arr[idx], nextSeed: r.nextSeed };
}

// ============================================================
// Room Constants
// ============================================================

export const HM_ROOM_GRAND_HALL = 'grand_hall';
export const HM_ROOM_LIBRARY = 'library';
export const HM_ROOM_KITCHEN = 'kitchen';
export const HM_ROOM_BASEMENT = 'basement';
export const HM_ROOM_ATTIC = 'attic';
export const HM_ROOM_GARDEN = 'garden';
export const HM_ROOM_TOWER = 'tower';
export const HM_ROOM_SECRET_PASSAGE = 'secret_passage';

// ============================================================
// Rarity Constants
// ============================================================

export const HM_RARITY_COMMON = 'common';
export const HM_RARITY_UNCOMMON = 'uncommon';
export const HM_RARITY_RARE = 'rare';
export const HM_RARITY_EPIC = 'epic';
export const HM_RARITY_LEGENDARY = 'legendary';

// ============================================================
// Scare Level Constants
// ============================================================

export const HM_SCARE_NONE = 'none';
export const HM_SCARE_LOW = 'low';
export const HM_SCARE_MEDIUM = 'medium';
export const HM_SCARE_HIGH = 'high';
export const HM_SCARE_EXTREME = 'extreme';
export const HM_SCARE_NIGHTMARE = 'nightmare';

// ============================================================
// Ghost Constants (32 ghosts)
// ============================================================

export const HM_GHOST_POLTERGEIST = 'poltergeist';
export const HM_GHOST_BANSHEE = 'banshee';
export const HM_GHOST_SHADOW_WRAITH = 'shadow_wraith';
export const HM_GHOST_PHANTOM_BUTLER = 'phantom_butler';
export const HM_GHOST_HEADLESS_KNIGHT = 'headless_knight';
export const HM_GHOST_WHISPERING_CHILD = 'whispering_child';
export const HM_GHOST_CRYING_LADY = 'crying_lady';
export const HM_GHOST_SKELETON_CREW = 'skeleton_crew';
export const HM_GHOST_WAILING_WIDOW = 'wailing_widow';
export const HM_GHOST_GHOSTLY_GENTLEMAN = 'ghostly_gentleman';
export const HM_GHOST_SPECTRAL_CAT = 'spectral_cat';
export const HM_GHOST_HAUNTED_DOLL = 'haunted_doll';
export const HM_GHOST_SHADOW_STALKER = 'shadow_stalker';
export const HM_GHOST_SPIRIT_WOLF = 'spirit_wolf';
export const HM_GHOST_PHANTOM_MAID = 'phantom_maid';
export const HM_GHOST_BONE_COLLECTOR = 'bone_collector';
export const HM_GHOST_EERIE_ORGANIST = 'eerie_organist';
export const HM_GHOST_LOST_WANDERER = 'lost_wanderer';
export const HM_GHOST_DEMONIC_PORTRAIT = 'demonic_portrait';
export const HM_GHOST_FROZEN_PHANTOM = 'frozen_phantom';
export const HM_GHOST_SCREAMING_SKULL = 'screaming_skull';
export const HM_GHOST_MIRROR_SPIRIT = 'mirror_spirit';
export const HM_GHOST_ANCIENT_GUARDIAN = 'ancient_guardian';
export const HM_GHOST_FLICKERING_FLAME = 'flickering_flame';
export const HM_GHOST_PHANTOM_KNIGHT = 'phantom_knight';
export const HM_GHOST_GHOSTLY_GARDENER = 'ghostly_gardener';
export const HM_GHOST_SHADOW_WEAVER = 'shadow_weaver';
export const HM_GHOST_SOUL_HARVESTER = 'soul_harvester';
export const HM_GHOST_WANDERING_SAGE = 'wandering_sage';
export const HM_GHOST_PHANTOM_PIPER = 'phantom_piper';
export const HM_GHOST_GHOST_SHIP_CAPTAIN = 'ghost_ship_captain';
export const HM_GHOST_WHISPERING_WALLS = 'whispering_walls';

// ============================================================
// Haunted Object Constants (12 objects)
// ============================================================

export const HM_OBJECT_CURSED_MIRROR = 'cursed_mirror';
export const HM_OBJECT_POSSESSED_PORTRAIT = 'possessed_portrait';
export const HM_OBJECT_HAUNTED_PIANO = 'haunted_piano';
export const HM_OBJECT_GHOST_LANTERN = 'ghost_lantern';
export const HM_OBJECT_SPIRIT_CLOCK = 'spirit_clock';
export const HM_OBJECT_PHANTOM_CHESS_SET = 'phantom_chess_set';
export const HM_OBJECT_BEWITCHED_BOOK = 'bewitched_book';
export const HM_OBJECT_HAUNTED_MUSIC_BOX = 'haunted_music_box';
export const HM_OBJECT_CURSED_DOLL_HOUSE = 'cursed_doll_house';
export const HM_OBJECT_SPECTRAL_TELESCOPE = 'spectral_telescope';
export const HM_OBJECT_POSSESSED_CHANDELIER = 'possessed_chandelier';
export const HM_OBJECT_PHANTOM_GRAMOPHONE = 'phantom_gramophone';

// ============================================================
// Artifact Constants (26 artifacts)
// ============================================================

export const HM_ARTIFACT_SOUL_GEM = 'soul_gem';
export const HM_ARTIFACT_ECTOPLASM_VIAL = 'ectoplasm_vial';
export const HM_ARTIFACT_SPIRIT_CANDLE = 'spirit_candle';
export const HM_ARTIFACT_RUNE_STONE = 'rune_stone';
export const HM_ARTIFACT_PHANTOM_FEATHER = 'phantom_feather';
export const HM_ARTIFACT_GHOST_CRYSTAL = 'ghost_crystal';
export const HM_ARTIFACT_SHADOW_ESSENCE = 'shadow_essence';
export const HM_ARTIFACT_SPECTRAL_DUST = 'spectral_dust';
export const HM_ARTIFACT_BANSHEE_TEAR = 'banshee_tear';
export const HM_ARTIFACT_WRAITH_FRAGMENT = 'wraith_fragment';
export const HM_ARTIFACT_SPIRIT_ORB = 'spirit_orb';
export const HM_ARTIFACT_HAUNTED_COIN = 'haunted_coin';
export const HM_ARTIFACT_POLTERGEIST_RIBBON = 'poltergeist_ribbon';
export const HM_ARTIFACT_PHANTOM_INK = 'phantom_ink';
export const HM_ARTIFACT_SOUL_CANDLE = 'soul_candle';
export const HM_ARTIFACT_SPIRIT_BELL = 'spirit_bell';
export const HM_ARTIFACT_GHOST_KEY = 'ghost_key';
export const HM_ARTIFACT_EERIE_AMULET = 'eerie_amulet';
export const HM_ARTIFACT_SHADOW_CLOAK_FRAGMENT = 'shadow_cloak_fragment';
export const HM_ARTIFACT_SPECTRAL_LENS = 'spectral_lens';
export const HM_ARTIFACT_WISP_ESSENCE = 'wisp_essence';
export const HM_ARTIFACT_PHANTOM_THREAD = 'phantom_thread';
export const HM_ARTIFACT_SPIRIT_COMPASS = 'spirit_compass';
export const HM_ARTIFACT_HAUNTED_MAP_FRAGMENT = 'haunted_map_fragment';
export const HM_ARTIFACT_SOUL_CATCHER_NET = 'soul_catcher_net';
export const HM_ARTIFACT_GHOSTLY_GLOVES = 'ghostly_gloves';

// ============================================================
// Equipment Constants (4 items)
// ============================================================

export const HM_EQUIPMENT_EMF_READER = 'emf_reader';
export const HM_EQUIPMENT_SPIRIT_BOX = 'spirit_box';
export const HM_EQUIPMENT_THERMAL_CAMERA = 'thermal_camera';
export const HM_EQUIPMENT_OUIJA_BOARD = 'ouija_board';

// ============================================================
// Secret Passage Constants (8 passages)
// ============================================================

export const HM_PASSAGE_TRAPDOOR = 'trapdoor';
export const HM_PASSAGE_HIDDEN_STAIRS = 'hidden_stairs';
export const HM_PASSAGE_PANTRY_TUNNEL = 'pantry_tunnel';
export const HM_PASSAGE_UNDERGROUND = 'underground_tunnel';
export const HM_PASSAGE_ROOFTOP_HATCH = 'rooftop_hatch';
export const HM_PASSAGE_HEDGE_MAZE = 'hedge_maze';
export const HM_PASSAGE_SPIRAL_STAIRS = 'spiral_stairs';
export const HM_PASSAGE_REVOLVING_WALL = 'revolving_wall';

// ============================================================
// Puzzle Constants (8 puzzles)
// ============================================================

export const HM_PUZZLE_RIDDLE_OF_DOORS = 'riddle_of_doors';
export const HM_PUZZLE_BOOKSHELF_CODE = 'bookshelf_code';
export const HM_PUZZLE_PANTRY_RHYME = 'pantry_rhyme';
export const HM_PUZZLE_UNDERGROUND_MAZE = 'underground_maze';
export const HM_PUZZLE_ROOFTOP_SIGILS = 'rooftop_sigils';
export const HM_PUZZLE_CLOCK_MECHANISM = 'clock_mechanism';
export const HM_PUZZLE_HEDGE_LABYRINTH = 'hedge_labyrinth';
export const HM_PUZZLE_MIRROR_ALIGNMENT = 'mirror_alignment';

// ============================================================
// Quest Constants (10 quests)
// ============================================================

export const HM_QUEST_FIRST_CONTACT = 'first_contact';
export const HM_QUEST_GHOST_HUNTER = 'ghost_hunter';
export const HM_QUEST_ROOM_EXPLORER = 'room_explorer';
export const HM_QUEST_SECRET_SEEKER = 'secret_seeker';
export const HM_QUEST_ARTIFACT_COLLECTOR = 'artifact_collector';
export const HM_QUEST_SPIRIT_FRIEND = 'spirit_friend';
export const HM_QUEST_PUZZLE_MASTER = 'puzzle_master';
export const HM_QUEST_NPC_ALLY = 'npc_ally';
export const HM_QUEST_SEANCE_CIRCLE = 'seance_circle';
export const HM_QUEST_MIDNIGHT_PHANTOM = 'midnight_phantom';

// ============================================================
// NPC Constants (6 NPCs)
// ============================================================

export const HM_NPC_GHOST_HUNTER = 'ghost_hunter';
export const HM_NPC_MEDIUM = 'medium';
export const HM_NPC_HISTORIAN = 'historian';
export const HM_NPC_CARETAKER = 'caretaker';
export const HM_NPC_PARANORMAL_INVESTIGATOR = 'paranormal_investigator';
export const HM_NPC_LOST_SOUL = 'lost_soul';

// ============================================================
// Achievement Constants (15 achievements)
// ============================================================

export const HM_ACHIEVEMENT_FIRST_STEP = 'first_step';
export const HM_ACHIEVEMENT_GHOST_WHISPERER = 'ghost_whisperer';
export const HM_ACHIEVEMENT_SPIRIT_FRIEND = 'spirit_friend';
export const HM_ACHIEVEMENT_ROOM_RAIDER = 'room_raider';
export const HM_ACHIEVEMENT_FULL_TOUR = 'full_tour';
export const HM_ACHIEVEMENT_ARTIFACT_HOARDER = 'artifact_hoarder';
export const HM_ACHIEVEMENT_SECRET_FINDER = 'secret_finder';
export const HM_ACHIEVEMENT_PUZZLE_SOLVER = 'puzzle_solver';
export const HM_ACHIEVEMENT_QUEST_COMPLETER = 'quest_completer';
export const HM_ACHIEVEMENT_SOCIAL_GHOST = 'social_ghost';
export const HM_ACHIEVEMENT_SEANCE_MASTER = 'seance_master';
export const HM_ACHIEVEMENT_GHOST_COLLECTOR = 'ghost_collector';
export const HM_ACHIEVEMENT_LEVEL_10 = 'level_10';
export const HM_ACHIEVEMENT_LEVEL_25 = 'level_25';
export const HM_ACHIEVEMENT_PHANTOM_LORD = 'phantom_lord';

// ============================================================
// Title Constants (8 titles)
// ============================================================

export const HM_TITLE_VISITOR = 'Visitor';
export const HM_TITLE_CURIOUS_GUEST = 'Curious Guest';
export const HM_TITLE_SPIRIT_SEEKER = 'Spirit Seeker';
export const HM_TITLE_GHOST_HUNTER_TITLE = 'Ghost Hunter';
export const HM_TITLE_PHANTOM_APPRENTICE = 'Phantom Apprentice';
export const HM_TITLE_SOUL_TAMER = 'Soul Tamer';
export const HM_TITLE_SPIRIT_MASTER = 'Spirit Master';
export const HM_TITLE_PHANTOM_LORD = 'Phantom Lord';

// ============================================================
// Composite Constants — declared AFTER their dependencies
// ============================================================

export const HM_ALL_ROOMS: string[] = [
  HM_ROOM_GRAND_HALL, HM_ROOM_LIBRARY, HM_ROOM_KITCHEN, HM_ROOM_BASEMENT,
  HM_ROOM_ATTIC, HM_ROOM_GARDEN, HM_ROOM_TOWER, HM_ROOM_SECRET_PASSAGE,
];

export const HM_ALL_GHOSTS: string[] = [
  HM_GHOST_POLTERGEIST, HM_GHOST_BANSHEE, HM_GHOST_SHADOW_WRAITH, HM_GHOST_PHANTOM_BUTLER,
  HM_GHOST_HEADLESS_KNIGHT, HM_GHOST_WHISPERING_CHILD, HM_GHOST_CRYING_LADY, HM_GHOST_SKELETON_CREW,
  HM_GHOST_WAILING_WIDOW, HM_GHOST_GHOSTLY_GENTLEMAN, HM_GHOST_SPECTRAL_CAT, HM_GHOST_HAUNTED_DOLL,
  HM_GHOST_SHADOW_STALKER, HM_GHOST_SPIRIT_WOLF, HM_GHOST_PHANTOM_MAID, HM_GHOST_BONE_COLLECTOR,
  HM_GHOST_EERIE_ORGANIST, HM_GHOST_LOST_WANDERER, HM_GHOST_DEMONIC_PORTRAIT, HM_GHOST_FROZEN_PHANTOM,
  HM_GHOST_SCREAMING_SKULL, HM_GHOST_MIRROR_SPIRIT, HM_GHOST_ANCIENT_GUARDIAN, HM_GHOST_FLICKERING_FLAME,
  HM_GHOST_PHANTOM_KNIGHT, HM_GHOST_GHOSTLY_GARDENER, HM_GHOST_SHADOW_WEAVER, HM_GHOST_SOUL_HARVESTER,
  HM_GHOST_WANDERING_SAGE, HM_GHOST_PHANTOM_PIPER, HM_GHOST_GHOST_SHIP_CAPTAIN, HM_GHOST_WHISPERING_WALLS,
];

export const HM_ALL_RARITIES: string[] = [
  HM_RARITY_COMMON, HM_RARITY_UNCOMMON, HM_RARITY_RARE, HM_RARITY_EPIC, HM_RARITY_LEGENDARY,
];

export const HM_ALL_OBJECTS: string[] = [
  HM_OBJECT_CURSED_MIRROR, HM_OBJECT_POSSESSED_PORTRAIT, HM_OBJECT_HAUNTED_PIANO,
  HM_OBJECT_GHOST_LANTERN, HM_OBJECT_SPIRIT_CLOCK, HM_OBJECT_PHANTOM_CHESS_SET,
  HM_OBJECT_BEWITCHED_BOOK, HM_OBJECT_HAUNTED_MUSIC_BOX, HM_OBJECT_CURSED_DOLL_HOUSE,
  HM_OBJECT_SPECTRAL_TELESCOPE, HM_OBJECT_POSSESSED_CHANDELIER, HM_OBJECT_PHANTOM_GRAMOPHONE,
];

export const HM_ALL_ARTIFACTS: string[] = [
  HM_ARTIFACT_SOUL_GEM, HM_ARTIFACT_ECTOPLASM_VIAL, HM_ARTIFACT_SPIRIT_CANDLE,
  HM_ARTIFACT_RUNE_STONE, HM_ARTIFACT_PHANTOM_FEATHER, HM_ARTIFACT_GHOST_CRYSTAL,
  HM_ARTIFACT_SHADOW_ESSENCE, HM_ARTIFACT_SPECTRAL_DUST, HM_ARTIFACT_BANSHEE_TEAR,
  HM_ARTIFACT_WRAITH_FRAGMENT, HM_ARTIFACT_SPIRIT_ORB, HM_ARTIFACT_HAUNTED_COIN,
  HM_ARTIFACT_POLTERGEIST_RIBBON, HM_ARTIFACT_PHANTOM_INK, HM_ARTIFACT_SOUL_CANDLE,
  HM_ARTIFACT_SPIRIT_BELL, HM_ARTIFACT_GHOST_KEY, HM_ARTIFACT_EERIE_AMULET,
  HM_ARTIFACT_SHADOW_CLOAK_FRAGMENT, HM_ARTIFACT_SPECTRAL_LENS, HM_ARTIFACT_WISP_ESSENCE,
  HM_ARTIFACT_PHANTOM_THREAD, HM_ARTIFACT_SPIRIT_COMPASS, HM_ARTIFACT_HAUNTED_MAP_FRAGMENT,
  HM_ARTIFACT_SOUL_CATCHER_NET, HM_ARTIFACT_GHOSTLY_GLOVES,
];

export const HM_ALL_EQUIPMENT: string[] = [
  HM_EQUIPMENT_EMF_READER, HM_EQUIPMENT_SPIRIT_BOX,
  HM_EQUIPMENT_THERMAL_CAMERA, HM_EQUIPMENT_OUIJA_BOARD,
];

export const HM_ALL_PASSAGES: string[] = [
  HM_PASSAGE_TRAPDOOR, HM_PASSAGE_HIDDEN_STAIRS, HM_PASSAGE_PANTRY_TUNNEL,
  HM_PASSAGE_UNDERGROUND, HM_PASSAGE_ROOFTOP_HATCH, HM_PASSAGE_HEDGE_MAZE,
  HM_PASSAGE_SPIRAL_STAIRS, HM_PASSAGE_REVOLVING_WALL,
];

export const HM_ALL_PUZZLES: string[] = [
  HM_PUZZLE_RIDDLE_OF_DOORS, HM_PUZZLE_BOOKSHELF_CODE, HM_PUZZLE_PANTRY_RHYME,
  HM_PUZZLE_UNDERGROUND_MAZE, HM_PUZZLE_ROOFTOP_SIGILS, HM_PUZZLE_CLOCK_MECHANISM,
  HM_PUZZLE_HEDGE_LABYRINTH, HM_PUZZLE_MIRROR_ALIGNMENT,
];

export const HM_ALL_QUESTS: string[] = [
  HM_QUEST_FIRST_CONTACT, HM_QUEST_GHOST_HUNTER, HM_QUEST_ROOM_EXPLORER,
  HM_QUEST_SECRET_SEEKER, HM_QUEST_ARTIFACT_COLLECTOR, HM_QUEST_SPIRIT_FRIEND,
  HM_QUEST_PUZZLE_MASTER, HM_QUEST_NPC_ALLY, HM_QUEST_SEANCE_CIRCLE,
  HM_QUEST_MIDNIGHT_PHANTOM,
];

export const HM_ALL_NPCS: string[] = [
  HM_NPC_GHOST_HUNTER, HM_NPC_MEDIUM, HM_NPC_HISTORIAN,
  HM_NPC_CARETAKER, HM_NPC_PARANORMAL_INVESTIGATOR, HM_NPC_LOST_SOUL,
];

export const HM_ALL_ACHIEVEMENTS: string[] = [
  HM_ACHIEVEMENT_FIRST_STEP, HM_ACHIEVEMENT_GHOST_WHISPERER, HM_ACHIEVEMENT_SPIRIT_FRIEND,
  HM_ACHIEVEMENT_ROOM_RAIDER, HM_ACHIEVEMENT_FULL_TOUR, HM_ACHIEVEMENT_ARTIFACT_HOARDER,
  HM_ACHIEVEMENT_SECRET_FINDER, HM_ACHIEVEMENT_PUZZLE_SOLVER, HM_ACHIEVEMENT_QUEST_COMPLETER,
  HM_ACHIEVEMENT_SOCIAL_GHOST, HM_ACHIEVEMENT_SEANCE_MASTER, HM_ACHIEVEMENT_GHOST_COLLECTOR,
  HM_ACHIEVEMENT_LEVEL_10, HM_ACHIEVEMENT_LEVEL_25, HM_ACHIEVEMENT_PHANTOM_LORD,
];

export const HM_ALL_TITLES: string[] = [
  HM_TITLE_VISITOR, HM_TITLE_CURIOUS_GUEST, HM_TITLE_SPIRIT_SEEKER,
  HM_TITLE_GHOST_HUNTER_TITLE, HM_TITLE_PHANTOM_APPRENTICE, HM_TITLE_SOUL_TAMER,
  HM_TITLE_SPIRIT_MASTER, HM_TITLE_PHANTOM_LORD,
];

export const HM_ALL_SCARE_LEVELS: string[] = [
  HM_SCARE_NONE, HM_SCARE_LOW, HM_SCARE_MEDIUM, HM_SCARE_HIGH, HM_SCARE_EXTREME, HM_SCARE_NIGHTMARE,
];

// ============================================================
// Data Interfaces
// ============================================================

export interface HmGhostData {
  name: string;
  rarity: string;
  rooms: string[];
  captureDifficulty: number;
  befriendDifficulty: number;
  description: string;
  xpReward: number;
  artifactDrop: string;
}

export interface HmRoomData {
  name: string;
  description: string;
  baseScareLevel: number;
  baseParanormalActivity: number;
  ghostPool: string[];
  objects: string[];
  secrets: number;
  connectedRooms: string[];
}

export interface HmObjectData {
  name: string;
  description: string;
  room: string;
  effect: string;
  power: number;
  rarity: string;
}

export interface HmArtifactData {
  name: string;
  description: string;
  rarity: string;
  value: number;
}

export interface HmEquipmentData {
  name: string;
  description: string;
  maxDurability: number;
  cost: number;
  captureBonus: number;
  detectionBonus: number;
}

export interface HmQuestData {
  name: string;
  description: string;
  type: string;
  targetValue: number;
  xpReward: number;
  artifactReward: string;
  artifactRewardAmount: number;
}

export interface HmNPCData {
  name: string;
  description: string;
  quests: string[];
  personality: string;
  giftArtifact: string;
  friendshipBonus: number;
}

export interface HmAchievementData {
  name: string;
  description: string;
  checkFn: string;
}

export interface HmPassageData {
  name: string;
  description: string;
  fromRoom: string;
  toRoom: string;
  requiredLevel: number;
  associatedPuzzle: string;
}

export interface HmPuzzleData {
  name: string;
  description: string;
  passageId: string;
  difficulty: number;
  requiredArtifact: string;
  requiredAmount: number;
}

export interface HmTitleData {
  name: string;
  requiredLevel: number;
}

// ============================================================
// State Interfaces
// ============================================================

export interface HmRoomState {
  explored: boolean;
  scareLevel: number;
  paranormalActivity: number;
  secretsFound: number;
  totalSecrets: number;
  ghostActivity: number;
  visits: number;
}

export interface HmEquipmentState {
  owned: boolean;
  durability: number;
  maxDurability: number;
  level: number;
  xp: number;
}

export interface HmNpcRelation {
  met: boolean;
  friendship: number;
  maxFriendship: number;
  questsGiven: number;
}

export interface HmQuestProgress {
  currentValue: number;
  targetValue: number;
  accepted: boolean;
  completed: boolean;
  turnedIn: boolean;
}

export interface HmHauntedMansionState {
  rngSeed: number;
  level: number;
  experience: number;
  title: string;
  currentRoom: string;
  visitedRooms: string[];
  rooms: Record<string, HmRoomState>;
  capturedGhosts: string[];
  befriendedGhosts: string[];
  ghostEncounters: string[];
  collectedObjects: string[];
  activeObjectEffects: Record<string, number>;
  artifacts: Record<string, number>;
  equipment: Record<string, HmEquipmentState>;
  activeEquipment: string | null;
  quests: Record<string, HmQuestProgress>;
  npcs: Record<string, HmNpcRelation>;
  achievements: string[];
  discoveredPassages: string[];
  solvedPuzzles: string[];
  dailySeanceAvailable: boolean;
  midnightHauntingActive: boolean;
  seanceCount: number;
  totalGhostsCaptured: number;
  totalGhostsBefriended: number;
  totalRoomsExplored: number;
  totalPuzzlesSolved: number;
  totalSecretsFound: number;
  totalSeancesPerformed: number;
  totalArtifactsCollected: number;
  explorationLog: string[];
  midnightEventProgress: number;
  midnightEventStep: number;
}

// ============================================================
// Static Data — Ghost Data
// ============================================================

const HM_GHOST_DATA: Record<string, HmGhostData> = {
  [HM_GHOST_POLTERGEIST]: {
    name: 'Poltergeist', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_GRAND_HALL, HM_ROOM_KITCHEN],
    captureDifficulty: 20, befriendDifficulty: 35,
    description: 'A mischievous spirit that throws objects and rattles furniture.',
    xpReward: 50, artifactDrop: HM_ARTIFACT_POLTERGEIST_RIBBON,
  },
  [HM_GHOST_BANSHEE]: {
    name: 'Banshee', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_ATTIC, HM_ROOM_TOWER],
    captureDifficulty: 55, befriendDifficulty: 70,
    description: 'A wailing spirit whose cry foretells doom.',
    xpReward: 150, artifactDrop: HM_ARTIFACT_BANSHEE_TEAR,
  },
  [HM_GHOST_SHADOW_WRAITH]: {
    name: 'Shadow Wraith', rarity: HM_RARITY_EPIC,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_TOWER],
    captureDifficulty: 70, befriendDifficulty: 85,
    description: 'A formless entity of pure darkness that feeds on fear.',
    xpReward: 300, artifactDrop: HM_ARTIFACT_SHADOW_ESSENCE,
  },
  [HM_GHOST_PHANTOM_BUTLER]: {
    name: 'Phantom Butler', rarity: HM_RARITY_EPIC,
    rooms: [HM_ROOM_GRAND_HALL, HM_ROOM_LIBRARY],
    captureDifficulty: 65, befriendDifficulty: 50,
    description: 'An eternally dutiful servant who still tends to the mansion.',
    xpReward: 250, artifactDrop: HM_ARTIFACT_PHANTOM_INK,
  },
  [HM_GHOST_HEADLESS_KNIGHT]: {
    name: 'Headless Knight', rarity: HM_RARITY_EPIC,
    rooms: [HM_ROOM_TOWER, HM_ROOM_SECRET_PASSAGE],
    captureDifficulty: 72, befriendDifficulty: 88,
    description: 'A spectral warrior searching for its lost head.',
    xpReward: 320, artifactDrop: HM_ARTIFACT_EERIE_AMULET,
  },
  [HM_GHOST_WHISPERING_CHILD]: {
    name: 'Whispering Child', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_GARDEN, HM_ROOM_GRAND_HALL],
    captureDifficulty: 15, befriendDifficulty: 20,
    description: 'A gentle child spirit who whispers secrets of the mansion.',
    xpReward: 40, artifactDrop: HM_ARTIFACT_SPECTRAL_DUST,
  },
  [HM_GHOST_CRYING_LADY]: {
    name: 'Crying Lady', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_LIBRARY, HM_ROOM_ATTIC],
    captureDifficulty: 35, befriendDifficulty: 45,
    description: 'A sorrowful specter forever mourning her lost love.',
    xpReward: 80, artifactDrop: HM_ARTIFACT_SOUL_CANDLE,
  },
  [HM_GHOST_SKELETON_CREW]: {
    name: 'Skeleton Crew', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_KITCHEN],
    captureDifficulty: 25, befriendDifficulty: 40,
    description: 'A band of skeletal pirates who once sailed the ghost ship.',
    xpReward: 55, artifactDrop: HM_ARTIFACT_HAUNTED_COIN,
  },
  [HM_GHOST_WAILING_WIDOW]: {
    name: 'Wailing Widow', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_LIBRARY, HM_ROOM_GRAND_HALL],
    captureDifficulty: 38, befriendDifficulty: 50,
    description: 'Her mournful cries echo through the library halls.',
    xpReward: 90, artifactDrop: HM_ARTIFACT_SPIRIT_BELL,
  },
  [HM_GHOST_GHOSTLY_GENTLEMAN]: {
    name: 'Ghostly Gentleman', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_GRAND_HALL, HM_ROOM_LIBRARY],
    captureDifficulty: 40, befriendDifficulty: 30,
    description: 'A charming phantom who enjoys intellectual conversation.',
    xpReward: 85, artifactDrop: HM_ARTIFACT_PHANTOM_FEATHER,
  },
  [HM_GHOST_SPECTRAL_CAT]: {
    name: 'Spectral Cat', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_GARDEN, HM_ROOM_KITCHEN],
    captureDifficulty: 10, befriendDifficulty: 15,
    description: 'A translucent feline that phases through walls.',
    xpReward: 35, artifactDrop: HM_ARTIFACT_WISP_ESSENCE,
  },
  [HM_GHOST_HAUNTED_DOLL]: {
    name: 'Haunted Doll', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_ATTIC, HM_ROOM_SECRET_PASSAGE],
    captureDifficulty: 42, befriendDifficulty: 55,
    description: 'A porcelain doll possessed by a vengeful spirit.',
    xpReward: 95, artifactDrop: HM_ARTIFACT_PHANTOM_THREAD,
  },
  [HM_GHOST_SHADOW_STALKER]: {
    name: 'Shadow Stalker', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_SECRET_PASSAGE],
    captureDifficulty: 58, befriendDifficulty: 72,
    description: 'A predator that moves between shadows, hunting the unwary.',
    xpReward: 160, artifactDrop: HM_ARTIFACT_SHADOW_CLOAK_FRAGMENT,
  },
  [HM_GHOST_SPIRIT_WOLF]: {
    name: 'Spirit Wolf', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_GARDEN, HM_ROOM_BASEMENT],
    captureDifficulty: 52, befriendDifficulty: 60,
    description: 'A spectral wolf pack leader that guards the garden gate.',
    xpReward: 140, artifactDrop: HM_ARTIFACT_WISP_ESSENCE,
  },
  [HM_GHOST_PHANTOM_MAID]: {
    name: 'Phantom Maid', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_KITCHEN, HM_ROOM_GRAND_HALL],
    captureDifficulty: 30, befriendDifficulty: 25,
    description: 'A helpful spirit who keeps the kitchen spotless.',
    xpReward: 75, artifactDrop: HM_ARTIFACT_GHOSTLY_GLOVES,
  },
  [HM_GHOST_BONE_COLLECTOR]: {
    name: 'Bone Collector', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_TOWER],
    captureDifficulty: 44, befriendDifficulty: 58,
    description: 'A grim reaper figure that hoards bones of the departed.',
    xpReward: 100, artifactDrop: HM_ARTIFACT_WRAITH_FRAGMENT,
  },
  [HM_GHOST_EERIE_ORGANIST]: {
    name: 'Eerie Organist', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_GRAND_HALL, HM_ROOM_LIBRARY],
    captureDifficulty: 36, befriendDifficulty: 28,
    description: 'Plays haunting melodies on the mansion\'s pipe organ.',
    xpReward: 82, artifactDrop: HM_ARTIFACT_PHANTOM_INK,
  },
  [HM_GHOST_LOST_WANDERER]: {
    name: 'Lost Wanderer', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_BASEMENT],
    captureDifficulty: 33, befriendDifficulty: 38,
    description: 'A confused spirit trapped between worlds, seeking the way out.',
    xpReward: 70, artifactDrop: HM_ARTIFACT_SPIRIT_COMPASS,
  },
  [HM_GHOST_DEMONIC_PORTRAIT]: {
    name: 'Demonic Portrait', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_LIBRARY, HM_ROOM_TOWER],
    captureDifficulty: 60, befriendDifficulty: 75,
    description: 'A painting that comes alive, its eyes following you.',
    xpReward: 170, artifactDrop: HM_ARTIFACT_SPECTRAL_LENS,
  },
  [HM_GHOST_FROZEN_PHANTOM]: {
    name: 'Frozen Phantom', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_TOWER],
    captureDifficulty: 56, befriendDifficulty: 68,
    description: 'A spirit frozen in eternal winter, radiating cold.',
    xpReward: 155, artifactDrop: HM_ARTIFACT_GHOST_CRYSTAL,
  },
  [HM_GHOST_SCREAMING_SKULL]: {
    name: 'Screaming Skull', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_BASEMENT, HM_ROOM_SECRET_PASSAGE],
    captureDifficulty: 39, befriendDifficulty: 52,
    description: 'A disembodied skull that emits bone-chilling screams.',
    xpReward: 88, artifactDrop: HM_ARTIFACT_WRAITH_FRAGMENT,
  },
  [HM_GHOST_MIRROR_SPIRIT]: {
    name: 'Mirror Spirit', rarity: HM_RARITY_LEGENDARY,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_TOWER],
    captureDifficulty: 82, befriendDifficulty: 92,
    description: 'A reflection that gained sentience and escaped the mirror.',
    xpReward: 500, artifactDrop: HM_ARTIFACT_EERIE_AMULET,
  },
  [HM_GHOST_ANCIENT_GUARDIAN]: {
    name: 'Ancient Guardian', rarity: HM_RARITY_EPIC,
    rooms: [HM_ROOM_TOWER, HM_ROOM_SECRET_PASSAGE],
    captureDifficulty: 68, befriendDifficulty: 60,
    description: 'An ancient entity bound to protect the mansion\'s deepest secrets.',
    xpReward: 280, artifactDrop: HM_ARTIFACT_RUNE_STONE,
  },
  [HM_GHOST_FLICKERING_FLAME]: {
    name: 'Flickering Flame', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_KITCHEN, HM_ROOM_GRAND_HALL],
    captureDifficulty: 12, befriendDifficulty: 18,
    description: 'A harmless fire spirit that dances in candle flames.',
    xpReward: 30, artifactDrop: HM_ARTIFACT_WISP_ESSENCE,
  },
  [HM_GHOST_PHANTOM_KNIGHT]: {
    name: 'Phantom Knight', rarity: HM_RARITY_RARE,
    rooms: [HM_ROOM_TOWER, HM_ROOM_GRAND_HALL],
    captureDifficulty: 54, befriendDifficulty: 65,
    description: 'An armored specter that patrols the tower battlements.',
    xpReward: 145, artifactDrop: HM_ARTIFACT_EERIE_AMULET,
  },
  [HM_GHOST_GHOSTLY_GARDENER]: {
    name: 'Ghostly Gardener', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_GARDEN],
    captureDifficulty: 18, befriendDifficulty: 22,
    description: 'A spectral horticulturist who tends the haunted hedge maze.',
    xpReward: 45, artifactDrop: HM_ARTIFACT_PHANTOM_FEATHER,
  },
  [HM_GHOST_SHADOW_WEAVER]: {
    name: 'Shadow Weaver', rarity: HM_RARITY_LEGENDARY,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_TOWER],
    captureDifficulty: 85, befriendDifficulty: 95,
    description: 'A primordial entity that weaves reality from shadow threads.',
    xpReward: 550, artifactDrop: HM_ARTIFACT_SHADOW_CLOAK_FRAGMENT,
  },
  [HM_GHOST_SOUL_HARVESTER]: {
    name: 'Soul Harvester', rarity: HM_RARITY_LEGENDARY,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_TOWER],
    captureDifficulty: 88, befriendDifficulty: 96,
    description: 'An implacable force that collects wandering souls.',
    xpReward: 600, artifactDrop: HM_ARTIFACT_SOUL_GEM,
  },
  [HM_GHOST_WANDERING_SAGE]: {
    name: 'Wandering Sage', rarity: HM_RARITY_LEGENDARY,
    rooms: [HM_ROOM_LIBRARY, HM_ROOM_TOWER],
    captureDifficulty: 80, befriendDifficulty: 55,
    description: 'An ancient scholar who chose to remain as a spirit of knowledge.',
    xpReward: 450, artifactDrop: HM_ARTIFACT_GHOST_KEY,
  },
  [HM_GHOST_PHANTOM_PIPER]: {
    name: 'Phantom Piper', rarity: HM_RARITY_UNCOMMON,
    rooms: [HM_ROOM_GARDEN, HM_ROOM_ATTIC],
    captureDifficulty: 37, befriendDifficulty: 32,
    description: 'A spectral musician whose eerie tune leads spirits astray.',
    xpReward: 78, artifactDrop: HM_ARTIFACT_PHANTOM_THREAD,
  },
  [HM_GHOST_GHOST_SHIP_CAPTAIN]: {
    name: 'Ghost Ship Captain', rarity: HM_RARITY_EPIC,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_TOWER],
    captureDifficulty: 66, befriendDifficulty: 62,
    description: 'Commands a spectral vessel that sails through walls.',
    xpReward: 270, artifactDrop: HM_ARTIFACT_HAUNTED_MAP_FRAGMENT,
  },
  [HM_GHOST_WHISPERING_WALLS]: {
    name: 'Whispering Walls', rarity: HM_RARITY_COMMON,
    rooms: [HM_ROOM_SECRET_PASSAGE, HM_ROOM_BASEMENT],
    captureDifficulty: 22, befriendDifficulty: 30,
    description: 'The walls themselves speak, revealing hidden memories.',
    xpReward: 48, artifactDrop: HM_ARTIFACT_SPECTRAL_DUST,
  },
};

// ============================================================
// Static Data — Room Data
// ============================================================

const HM_ROOM_DATA: Record<string, HmRoomData> = {
  [HM_ROOM_GRAND_HALL]: {
    name: 'Grand Hall', baseScareLevel: 35, baseParanormalActivity: 40,
    description: 'A vast entrance hall with towering pillars and a cracked chandelier that sways on its own.',
    ghostPool: [HM_GHOST_POLTERGEIST, HM_GHOST_PHANTOM_BUTLER, HM_GHOST_GHOSTLY_GENTLEMAN,
      HM_GHOST_EERIE_ORGANIST, HM_GHOST_FLICKERING_FLAME, HM_GHOST_WHISPERING_CHILD],
    objects: [HM_OBJECT_POSSESSED_CHANDELIER, HM_OBJECT_PHANTOM_GRAMOPHONE],
    secrets: 3, connectedRooms: [HM_ROOM_LIBRARY, HM_ROOM_KITCHEN],
  },
  [HM_ROOM_LIBRARY]: {
    name: 'Library', baseScareLevel: 30, baseParanormalActivity: 45,
    description: 'Endless shelves of ancient tomes, some of which float off the shelves at night.',
    ghostPool: [HM_GHOST_CRYING_LADY, HM_GHOST_WAILING_WIDOW, HM_GHOST_GHOSTLY_GENTLEMAN,
      HM_GHOST_PHANTOM_BUTLER, HM_GHOST_EERIE_ORGANIST, HM_GHOST_DEMONIC_PORTRAIT, HM_GHOST_WANDERING_SAGE],
    objects: [HM_OBJECT_BEWITCHED_BOOK, HM_OBJECT_CURSED_MIRROR],
    secrets: 4, connectedRooms: [HM_ROOM_GRAND_HALL, HM_ROOM_ATTIC],
  },
  [HM_ROOM_KITCHEN]: {
    name: 'Kitchen', baseScareLevel: 20, baseParanormalActivity: 30,
    description: 'Pots stir themselves and knives float through the air in this haunted kitchen.',
    ghostPool: [HM_GHOST_POLTERGEIST, HM_GHOST_PHANTOM_MAID, HM_GHOST_SKELETON_CREW,
      HM_GHOST_FLICKERING_FLAME, HM_GHOST_SPECTRAL_CAT],
    objects: [HM_OBJECT_GHOST_LANTERN, HM_OBJECT_HAUNTED_MUSIC_BOX],
    secrets: 2, connectedRooms: [HM_ROOM_GRAND_HALL, HM_ROOM_BASEMENT],
  },
  [HM_ROOM_BASEMENT]: {
    name: 'Basement', baseScareLevel: 65, baseParanormalActivity: 70,
    description: 'A damp, dark cellar where strange glowing fungi light the walls.',
    ghostPool: [HM_GHOST_SHADOW_WRAITH, HM_GHOST_SKELETON_CREW, HM_GHOST_SHADOW_STALKER,
      HM_GHOST_BONE_COLLECTOR, HM_GHOST_FROZEN_PHANTOM, HM_GHOST_SCREAMING_SKULL,
      HM_GHOST_WHISPERING_WALLS, HM_GHOST_LOST_WANDERER],
    objects: [HM_OBJECT_SPIRIT_CLOCK, HM_OBJECT_CURSED_DOLL_HOUSE],
    secrets: 4, connectedRooms: [HM_ROOM_KITCHEN, HM_ROOM_TOWER],
  },
  [HM_ROOM_ATTIC]: {
    name: 'Attic', baseScareLevel: 55, baseParanormalActivity: 55,
    description: 'Cobweb-draped rafters filled with forgotten furniture and lost memories.',
    ghostPool: [HM_GHOST_BANSHEE, HM_GHOST_CRYING_LADY, HM_GHOST_HAUNTED_DOLL,
      HM_GHOST_PHANTOM_PIPER, HM_GHOST_WHISPERING_CHILD],
    objects: [HM_OBJECT_POSSESSED_PORTRAIT, HM_OBJECT_HAUNTED_MUSIC_BOX],
    secrets: 3, connectedRooms: [HM_ROOM_LIBRARY, HM_ROOM_GARDEN],
  },
  [HM_ROOM_GARDEN]: {
    name: 'Garden', baseScareLevel: 25, baseParanormalActivity: 25,
    description: 'An overgrown moonlit garden where ghostly flowers bloom in impossible colors.',
    ghostPool: [HM_GHOST_SPECTRAL_CAT, HM_GHOST_GHOSTLY_GARDENER, HM_GHOST_WHISPERING_CHILD,
      HM_GHOST_SPIRIT_WOLF, HM_GHOST_PHANTOM_PIPER, HM_GHOST_FLICKERING_FLAME],
    objects: [HM_OBJECT_PHANTOM_CHESS_SET, HM_OBJECT_SPECTRAL_TELESCOPE],
    secrets: 2, connectedRooms: [HM_ROOM_ATTIC, HM_ROOM_LIBRARY],
  },
  [HM_ROOM_TOWER]: {
    name: 'Tower', baseScareLevel: 80, baseParanormalActivity: 85,
    description: 'The highest point of the mansion, where the veil between worlds is thinnest.',
    ghostPool: [HM_GHOST_SHADOW_WRAITH, HM_GHOST_HEADLESS_KNIGHT, HM_GHOST_ANCIENT_GUARDIAN,
      HM_GHOST_FROZEN_PHANTOM, HM_GHOST_PHANTOM_KNIGHT, HM_GHOST_DEMONIC_PORTRAIT,
      HM_GHOST_MIRROR_SPIRIT, HM_GHOST_SHADOW_WEAVER, HM_GHOST_SOUL_HARVESTER,
      HM_GHOST_WANDERING_SAGE, HM_GHOST_GHOST_SHIP_CAPTAIN, HM_GHOST_BONE_COLLECTOR],
    objects: [HM_OBJECT_CURSED_MIRROR, HM_OBJECT_SPECTRAL_TELESCOPE],
    secrets: 5, connectedRooms: [HM_ROOM_BASEMENT, HM_ROOM_GRAND_HALL],
  },
  [HM_ROOM_SECRET_PASSAGE]: {
    name: 'Secret Passage', baseScareLevel: 90, baseParanormalActivity: 95,
    description: 'Hidden tunnels beneath the mansion where the most powerful spirits dwell.',
    ghostPool: [HM_GHOST_SHADOW_WRAITH, HM_GHOST_HEADLESS_KNIGHT, HM_GHOST_MIRROR_SPIRIT,
      HM_GHOST_SHADOW_WEAVER, HM_GHOST_SOUL_HARVESTER, HM_GHOST_GHOST_SHIP_CAPTAIN,
      HM_GHOST_HAUNTED_DOLL, HM_GHOST_SCREAMING_SKULL, HM_GHOST_WHISPERING_WALLS,
      HM_GHOST_LOST_WANDERER, HM_GHOST_SHADOW_STALKER, HM_GHOST_ANCIENT_GUARDIAN],
    objects: [HM_OBJECT_CURSED_DOLL_HOUSE, HM_OBJECT_POSSESSED_PORTRAIT],
    secrets: 5, connectedRooms: [HM_ROOM_KITCHEN],
  },
};

// ============================================================
// Static Data — Haunted Object Data
// ============================================================

const HM_OBJECT_DATA: Record<string, HmObjectData> = {
  [HM_OBJECT_CURSED_MIRROR]: {
    name: 'Cursed Mirror', room: HM_ROOM_LIBRARY,
    description: 'Shows your reflection with a ghostly double standing behind you.',
    effect: 'reveal_ghosts', power: 30, rarity: HM_RARITY_RARE,
  },
  [HM_OBJECT_POSSESSED_PORTRAIT]: {
    name: 'Possessed Portrait', room: HM_ROOM_ATTIC,
    description: 'The eyes follow you, and the painted figure sometimes changes expression.',
    effect: 'scare_resistance', power: 20, rarity: HM_RARITY_UNCOMMON,
  },
  [HM_OBJECT_HAUNTED_PIANO]: {
    name: 'Haunted Piano', room: HM_ROOM_GRAND_HALL,
    description: 'Plays ghostly melodies on its own, calming nearby spirits.',
    effect: 'befriend_bonus', power: 25, rarity: HM_RARITY_UNCOMMON,
  },
  [HM_OBJECT_GHOST_LANTERN]: {
    name: 'Ghost Lantern', room: HM_ROOM_KITCHEN,
    description: 'Emits an eerie green flame that reveals hidden passages.',
    effect: 'reveal_secrets', power: 20, rarity: HM_RARITY_COMMON,
  },
  [HM_OBJECT_SPIRIT_CLOCK]: {
    name: 'Spirit Clock', room: HM_ROOM_BASEMENT,
    description: 'Its hands move backwards, briefly slowing down hostile spirits.',
    effect: 'capture_bonus', power: 15, rarity: HM_RARITY_COMMON,
  },
  [HM_OBJECT_PHANTOM_CHESS_SET]: {
    name: 'Phantom Chess Set', room: HM_ROOM_GARDEN,
    description: 'Pieces move by themselves. Winning a game earns a spirit\'s favor.',
    effect: 'befriend_bonus', power: 20, rarity: HM_RARITY_UNCOMMON,
  },
  [HM_OBJECT_BEWITCHED_BOOK]: {
    name: 'Bewitched Book', room: HM_ROOM_LIBRARY,
    description: 'Contains knowledge of spirit trapping rituals and incantations.',
    effect: 'capture_bonus', power: 25, rarity: HM_RARITY_RARE,
  },
  [HM_OBJECT_HAUNTED_MUSIC_BOX]: {
    name: 'Haunted Music Box', room: HM_ROOM_KITCHEN,
    description: 'Its tinkling melody lulls aggressive ghosts into a peaceful trance.',
    effect: 'calm_ghosts', power: 15, rarity: HM_RARITY_COMMON,
  },
  [HM_OBJECT_CURSED_DOLL_HOUSE]: {
    name: 'Cursed Doll House', room: HM_ROOM_SECRET_PASSAGE,
    description: 'A miniature mansion replica. Strange things happen to those who peer inside.',
    effect: 'reveal_secrets', power: 35, rarity: HM_RARITY_EPIC,
  },
  [HM_OBJECT_SPECTRAL_TELESCOPE]: {
    name: 'Spectral Telescope', room: HM_ROOM_GARDEN,
    description: 'Allows you to see ghosts that are invisible to the naked eye.',
    effect: 'reveal_ghosts', power: 40, rarity: HM_RARITY_EPIC,
  },
  [HM_OBJECT_POSSESSED_CHANDELIER]: {
    name: 'Possessed Chandelier', room: HM_ROOM_GRAND_HALL,
    description: 'Its flickering light creates protective barriers against dark spirits.',
    effect: 'scare_resistance', power: 30, rarity: HM_RARITY_RARE,
  },
  [HM_OBJECT_PHANTOM_GRAMOPHONE]: {
    name: 'Phantom Gramophone', room: HM_ROOM_GRAND_HALL,
    description: 'Records and plays back ghostly voices and messages from beyond.',
    effect: 'reveal_ghosts', power: 20, rarity: HM_RARITY_UNCOMMON,
  },
};

// ============================================================
// Static Data — Artifact Data
// ============================================================

const HM_ARTIFACT_DATA: Record<string, HmArtifactData> = {
  [HM_ARTIFACT_SOUL_GEM]: { name: 'Soul Gem', description: 'A crystallized fragment of pure soul energy.', rarity: HM_RARITY_LEGENDARY, value: 500 },
  [HM_ARTIFACT_ECTOPLASM_VIAL]: { name: 'Ectoplasm Vial', description: 'Ghostly residue collected from spirit manifestations.', rarity: HM_RARITY_COMMON, value: 20 },
  [HM_ARTIFACT_SPIRIT_CANDLE]: { name: 'Spirit Candle', description: 'Burns with ghostly blue flame, attracting spirits.', rarity: HM_RARITY_UNCOMMON, value: 50 },
  [HM_ARTIFACT_RUNE_STONE]: { name: 'Rune Stone', description: 'An ancient stone etched with protective runes.', rarity: HM_RARITY_RARE, value: 120 },
  [HM_ARTIFACT_PHANTOM_FEATHER]: { name: 'Phantom Feather', description: 'A feather from a ghostly bird that never lands.', rarity: HM_RARITY_UNCOMMON, value: 60 },
  [HM_ARTIFACT_GHOST_CRYSTAL]: { name: 'Ghost Crystal', description: 'A crystal that pulses with spectral energy.', rarity: HM_RARITY_RARE, value: 130 },
  [HM_ARTIFACT_SHADOW_ESSENCE]: { name: 'Shadow Essence', description: 'Concentrated darkness harvested from shadow beings.', rarity: HM_RARITY_EPIC, value: 250 },
  [HM_ARTIFACT_SPECTRAL_DUST]: { name: 'Spectral Dust', description: 'Fine shimmering dust left by passing spirits.', rarity: HM_RARITY_COMMON, value: 15 },
  [HM_ARTIFACT_BANSHEE_TEAR]: { name: 'Banshee Tear', description: 'A crystallized tear from a wailing banshee.', rarity: HM_RARITY_RARE, value: 140 },
  [HM_ARTIFACT_WRAITH_FRAGMENT]: { name: 'Wraith Fragment', description: 'A shard of a wraith\'s ethereal form.', rarity: HM_RARITY_UNCOMMON, value: 70 },
  [HM_ARTIFACT_SPIRIT_ORB]: { name: 'Spirit Orb', description: 'A glowing sphere containing a trapped whisper.', rarity: HM_RARITY_UNCOMMON, value: 55 },
  [HM_ARTIFACT_HAUNTED_COIN]: { name: 'Haunted Coin', description: 'Currency from the spirit realm that jingles on its own.', rarity: HM_RARITY_COMMON, value: 25 },
  [HM_ARTIFACT_POLTERGEIST_RIBBON]: { name: 'Poltergeist Ribbon', description: 'A ghostly ribbon that moves as if held by invisible hands.', rarity: HM_RARITY_COMMON, value: 30 },
  [HM_ARTIFACT_PHANTOM_INK]: { name: 'Phantom Ink', description: 'Ink that writes messages from spirits on its own.', rarity: HM_RARITY_UNCOMMON, value: 65 },
  [HM_ARTIFACT_SOUL_CANDLE]: { name: 'Soul Candle', description: 'A candle made from spectral wax, burns for eternity.', rarity: HM_RARITY_UNCOMMON, value: 75 },
  [HM_ARTIFACT_SPIRIT_BELL]: { name: 'Spirit Bell', description: 'Rings by itself when ghosts are near.', rarity: HM_RARITY_UNCOMMON, value: 60 },
  [HM_ARTIFACT_GHOST_KEY]: { name: 'Ghost Key', description: 'Opens doors that exist only in the spirit world.', rarity: HM_RARITY_LEGENDARY, value: 450 },
  [HM_ARTIFACT_EERIE_AMULET]: { name: 'Eerie Amulet', description: 'Protects the wearer from malevolent spirit influence.', rarity: HM_RARITY_EPIC, value: 200 },
  [HM_ARTIFACT_SHADOW_CLOAK_FRAGMENT]: { name: 'Shadow Cloak Fragment', description: 'A piece of a cloak woven from pure shadow.', rarity: HM_RARITY_EPIC, value: 220 },
  [HM_ARTIFACT_SPECTRAL_LENS]: { name: 'Spectral Lens', description: 'A lens that allows sight into the spirit realm.', rarity: HM_RARITY_RARE, value: 150 },
  [HM_ARTIFACT_WISP_ESSENCE]: { name: 'Wisp Essence', description: 'Bottled light from a will-o-wisp.', rarity: HM_RARITY_COMMON, value: 18 },
  [HM_ARTIFACT_PHANTOM_THREAD]: { name: 'Phantom Thread', description: 'An invisible thread that binds spirits to the mortal world.', rarity: HM_RARITY_UNCOMMON, value: 55 },
  [HM_ARTIFACT_SPIRIT_COMPASS]: { name: 'Spirit Compass', description: 'Points toward the nearest ghost instead of north.', rarity: HM_RARITY_RARE, value: 110 },
  [HM_ARTIFACT_HAUNTED_MAP_FRAGMENT]: { name: 'Haunted Map Fragment', description: 'A piece of a map that reveals secret passages.', rarity: HM_RARITY_EPIC, value: 230 },
  [HM_ARTIFACT_SOUL_CATCHER_NET]: { name: 'Soul Catcher Net', description: 'A spectral net designed to capture wayward spirits.', rarity: HM_RARITY_RARE, value: 160 },
  [HM_ARTIFACT_GHOSTLY_GLOVES]: { name: 'Ghostly Gloves', description: 'Allows the wearer to touch and interact with spirits.', rarity: HM_RARITY_UNCOMMON, value: 80 },
};

// ============================================================
// Static Data — Equipment Data
// ============================================================

const HM_EQUIPMENT_DATA: Record<string, HmEquipmentData> = {
  [HM_EQUIPMENT_EMF_READER]: {
    name: 'EMF Reader', description: 'Detects electromagnetic fluctuations caused by ghost activity.',
    maxDurability: 100, cost: 0, captureBonus: 5, detectionBonus: 20,
  },
  [HM_EQUIPMENT_SPIRIT_BOX]: {
    name: 'Spirit Box', description: 'Allows two-way communication with spirits.',
    maxDurability: 80, cost: 200, captureBonus: 10, detectionBonus: 15,
  },
  [HM_EQUIPMENT_THERMAL_CAMERA]: {
    name: 'Thermal Camera', description: 'Reveals cold spots and ghostly heat signatures.',
    maxDurability: 60, cost: 350, captureBonus: 8, detectionBonus: 25,
  },
  [HM_EQUIPMENT_OUIJA_BOARD]: {
    name: 'Ouija Board', description: 'A powerful tool for contacting and befriending spirits.',
    maxDurability: 40, cost: 500, captureBonus: 15, detectionBonus: 30,
  },
};

// ============================================================
// Static Data — Quest Data
// ============================================================

const HM_QUEST_DATA: Record<string, HmQuestData> = {
  [HM_QUEST_FIRST_CONTACT]: {
    name: 'First Contact', description: 'Encounter your first ghost in the mansion.',
    type: 'encounter', targetValue: 1, xpReward: 100,
    artifactReward: HM_ARTIFACT_ECTOPLASM_VIAL, artifactRewardAmount: 5,
  },
  [HM_QUEST_GHOST_HUNTER]: {
    name: 'Ghost Hunter', description: 'Capture 5 ghosts haunting the mansion.',
    type: 'capture', targetValue: 5, xpReward: 300,
    artifactReward: HM_ARTIFACT_SOUL_CATCHER_NET, artifactRewardAmount: 1,
  },
  [HM_QUEST_ROOM_EXPLORER]: {
    name: 'Room Explorer', description: 'Explore all 8 rooms of the mansion.',
    type: 'explore', targetValue: 8, xpReward: 500,
    artifactReward: HM_ARTIFACT_HAUNTED_MAP_FRAGMENT, artifactRewardAmount: 1,
  },
  [HM_QUEST_SECRET_SEEKER]: {
    name: 'Secret Seeker', description: 'Discover 5 secret passages hidden throughout the mansion.',
    type: 'passage', targetValue: 5, xpReward: 400,
    artifactReward: HM_ARTIFACT_SPIRIT_COMPASS, artifactRewardAmount: 1,
  },
  [HM_QUEST_ARTIFACT_COLLECTOR]: {
    name: 'Artifact Collector', description: 'Collect a total of 50 artifacts from your explorations.',
    type: 'artifact', targetValue: 50, xpReward: 600,
    artifactReward: HM_ARTIFACT_SOUL_GEM, artifactRewardAmount: 1,
  },
  [HM_QUEST_SPIRIT_FRIEND]: {
    name: 'Spirit Friend', description: 'Befriend 10 ghosts instead of capturing them.',
    type: 'befriend', targetValue: 10, xpReward: 500,
    artifactReward: HM_ARTIFACT_PHANTOM_FEATHER, artifactRewardAmount: 3,
  },
  [HM_QUEST_PUZZLE_MASTER]: {
    name: 'Puzzle Master', description: 'Solve 5 paranormal puzzles throughout the mansion.',
    type: 'puzzle', targetValue: 5, xpReward: 450,
    artifactReward: HM_ARTIFACT_RUNE_STONE, artifactRewardAmount: 2,
  },
  [HM_QUEST_NPC_ALLY]: {
    name: 'NPC Ally', description: 'Build maximum friendship with all 6 mansion NPCs.',
    type: 'npc_ally', targetValue: 6, xpReward: 700,
    artifactReward: HM_ARTIFACT_GHOST_KEY, artifactRewardAmount: 1,
  },
  [HM_QUEST_SEANCE_CIRCLE]: {
    name: 'Seance Circle', description: 'Perform 10 seance rituals to commune with spirits.',
    type: 'seance', targetValue: 10, xpReward: 400,
    artifactReward: HM_ARTIFACT_SPIRIT_CANDLE, artifactRewardAmount: 5,
  },
  [HM_QUEST_MIDNIGHT_PHANTOM]: {
    name: 'Midnight Phantom', description: 'Survive and complete the midnight haunting event.',
    type: 'midnight', targetValue: 1, xpReward: 1000,
    artifactReward: HM_ARTIFACT_EERIE_AMULET, artifactRewardAmount: 1,
  },
};

// ============================================================
// Static Data — NPC Data
// ============================================================

const HM_NPC_DATA: Record<string, HmNPCData> = {
  [HM_NPC_GHOST_HUNTER]: {
    name: 'Professor Thorne', personality: 'Gruff but knowledgeable, a veteran ghost hunter.',
    description: 'A seasoned paranormal investigator who has studied the mansion for decades.',
    quests: [HM_QUEST_FIRST_CONTACT, HM_QUEST_GHOST_HUNTER],
    giftArtifact: HM_ARTIFACT_SOUL_CATCHER_NET, friendshipBonus: 10,
  },
  [HM_NPC_MEDIUM]: {
    name: 'Madame Esmeralda', personality: 'Mysterious and ethereal, speaks in riddles.',
    description: 'A gifted medium who can communicate with any spirit in the mansion.',
    quests: [HM_QUEST_SPIRIT_FRIEND, HM_QUEST_SEANCE_CIRCLE],
    giftArtifact: HM_ARTIFACT_SPIRIT_CANDLE, friendshipBonus: 15,
  },
  [HM_NPC_HISTORIAN]: {
    name: 'Archivist Pemberton', personality: 'Eccentric and obsessive about mansion history.',
    description: 'The mansion\'s self-appointed historian who knows every secret.',
    quests: [HM_QUEST_ROOM_EXPLORER, HM_QUEST_SECRET_SEEKER],
    giftArtifact: HM_ARTIFACT_HAUNTED_MAP_FRAGMENT, friendshipBonus: 8,
  },
  [HM_NPC_CARETAKER]: {
    name: 'Old Silas', personality: 'Superstitious but kind, tends to the mansion grounds.',
    description: 'The elderly caretaker who has maintained the mansion for fifty years.',
    quests: [HM_QUEST_PUZZLE_MASTER, HM_QUEST_ARTIFACT_COLLECTOR],
    giftArtifact: HM_ARTIFACT_GHOSTLY_GLOVES, friendshipBonus: 12,
  },
  [HM_NPC_PARANORMAL_INVESTIGATOR]: {
    name: 'Dr. Vance', personality: 'Analytical and skeptical, relies on equipment.',
    description: 'A scientist who approaches the supernatural with methodical precision.',
    quests: [HM_QUEST_NPC_ALLY, HM_QUEST_MIDNIGHT_PHANTOM],
    giftArtifact: HM_ARTIFACT_SPECTRAL_LENS, friendshipBonus: 10,
  },
  [HM_NPC_LOST_SOUL]: {
    name: 'The Wanderer', personality: 'Sad and confused, a ghost who doesn\'t know they\'re dead.',
    description: 'A friendly spirit trapped in the mansion, seeking help to move on.',
    quests: [], giftArtifact: HM_ARTIFACT_SPIRIT_ORB, friendshipBonus: 20,
  },
};

// ============================================================
// Static Data — Passage Data
// ============================================================

const HM_PASSAGE_DATA: Record<string, HmPassageData> = {
  [HM_PASSAGE_TRAPDOOR]: {
    name: 'The Trapdoor', fromRoom: HM_ROOM_GRAND_HALL, toRoom: HM_ROOM_BASEMENT,
    description: 'A hidden trapdoor beneath the grand staircase.',
    requiredLevel: 5, associatedPuzzle: HM_PUZZLE_RIDDLE_OF_DOORS,
  },
  [HM_PASSAGE_HIDDEN_STAIRS]: {
    name: 'The Hidden Staircase', fromRoom: HM_ROOM_LIBRARY, toRoom: HM_ROOM_ATTIC,
    description: 'A bookshelf that swings open to reveal narrow stairs.',
    requiredLevel: 3, associatedPuzzle: HM_PUZZLE_BOOKSHELF_CODE,
  },
  [HM_PASSAGE_PANTRY_TUNNEL]: {
    name: 'The Pantry Tunnel', fromRoom: HM_ROOM_KITCHEN, toRoom: HM_ROOM_SECRET_PASSAGE,
    description: 'A narrow tunnel behind the pantry shelves.',
    requiredLevel: 8, associatedPuzzle: HM_PUZZLE_PANTRY_RHYME,
  },
  [HM_PASSAGE_UNDERGROUND]: {
    name: 'The Underground Tunnel', fromRoom: HM_ROOM_BASEMENT, toRoom: HM_ROOM_TOWER,
    description: 'An ancient tunnel connecting the foundations to the tower.',
    requiredLevel: 12, associatedPuzzle: HM_PUZZLE_UNDERGROUND_MAZE,
  },
  [HM_PASSAGE_ROOFTOP_HATCH]: {
    name: 'The Rooftop Hatch', fromRoom: HM_ROOM_ATTIC, toRoom: HM_ROOM_GARDEN,
    description: 'A hatch in the attic roof leading to the garden below.',
    requiredLevel: 4, associatedPuzzle: HM_PUZZLE_ROOFTOP_SIGILS,
  },
  [HM_PASSAGE_HEDGE_MAZE]: {
    name: 'The Hedge Maze Path', fromRoom: HM_ROOM_GARDEN, toRoom: HM_ROOM_LIBRARY,
    description: 'A hidden path through the hedge maze to a library window.',
    requiredLevel: 6, associatedPuzzle: HM_PUZZLE_HEDGE_LABYRINTH,
  },
  [HM_PASSAGE_SPIRAL_STAIRS]: {
    name: 'The Spiral Staircase', fromRoom: HM_ROOM_TOWER, toRoom: HM_ROOM_GRAND_HALL,
    description: 'A spiraling stone staircase hidden behind a tapestry.',
    requiredLevel: 10, associatedPuzzle: HM_PUZZLE_CLOCK_MECHANISM,
  },
  [HM_PASSAGE_REVOLVING_WALL]: {
    name: 'The Revolving Wall', fromRoom: HM_ROOM_SECRET_PASSAGE, toRoom: HM_ROOM_KITCHEN,
    description: 'A wall section that rotates to reveal a passage to the kitchen.',
    requiredLevel: 15, associatedPuzzle: HM_PUZZLE_MIRROR_ALIGNMENT,
  },
};

// ============================================================
// Static Data — Puzzle Data
// ============================================================

const HM_PUZZLE_DATA: Record<string, HmPuzzleData> = {
  [HM_PUZZLE_RIDDLE_OF_DOORS]: {
    name: 'Riddle of Doors', passageId: HM_PASSAGE_TRAPDOOR,
    description: 'Answer three spectral riddles to unlock the trapdoor.',
    difficulty: 30, requiredArtifact: HM_ARTIFACT_ECTOPLASM_VIAL, requiredAmount: 3,
  },
  [HM_PUZZLE_BOOKSHELF_CODE]: {
    name: 'Bookshelf Code', passageId: HM_PASSAGE_HIDDEN_STAIRS,
    description: 'Arrange the books in the correct order to reveal the hidden staircase.',
    difficulty: 25, requiredArtifact: HM_ARTIFACT_PHANTOM_INK, requiredAmount: 2,
  },
  [HM_PUZZLE_PANTRY_RHYME]: {
    name: 'Pantry Rhyme', passageId: HM_PASSAGE_PANTRY_TUNNEL,
    description: 'Complete a ghostly nursery rhyme to open the pantry tunnel.',
    difficulty: 20, requiredArtifact: HM_ARTIFACT_SPECTRAL_DUST, requiredAmount: 5,
  },
  [HM_PUZZLE_UNDERGROUND_MAZE]: {
    name: 'Underground Maze', passageId: HM_PASSAGE_UNDERGROUND,
    description: 'Navigate the pitch-black underground maze using only sound.',
    difficulty: 50, requiredArtifact: HM_ARTIFACT_SPIRIT_BELL, requiredAmount: 2,
  },
  [HM_PUZZLE_ROOFTOP_SIGILS]: {
    name: 'Rooftop Sigils', passageId: HM_PASSAGE_ROOFTOP_HATCH,
    description: 'Trace the correct arcane sigils on the attic ceiling to open the hatch.',
    difficulty: 35, requiredArtifact: HM_ARTIFACT_RUNE_STONE, requiredAmount: 2,
  },
  [HM_PUZZLE_CLOCK_MECHANISM]: {
    name: 'Clock Mechanism', passageId: HM_PASSAGE_SPIRAL_STAIRS,
    description: 'Set the ancient clock to the correct time to reveal the hidden stairs.',
    difficulty: 45, requiredArtifact: HM_ARTIFACT_SPIRIT_COMPASS, requiredAmount: 1,
  },
  [HM_PUZZLE_HEDGE_LABYRINTH]: {
    name: 'Hedge Labyrinth', passageId: HM_PASSAGE_HEDGE_MAZE,
    description: 'Find the center of the living hedge maze before it reshapes itself.',
    difficulty: 40, requiredArtifact: HM_ARTIFACT_PHANTOM_FEATHER, requiredAmount: 3,
  },
  [HM_PUZZLE_MIRROR_ALIGNMENT]: {
    name: 'Mirror Alignment', passageId: HM_PASSAGE_REVOLVING_WALL,
    description: 'Align three cursed mirrors to reflect light and open the revolving wall.',
    difficulty: 55, requiredArtifact: HM_ARTIFACT_GHOST_CRYSTAL, requiredAmount: 2,
  },
};

// ============================================================
// Static Data — Achievement Data
// ============================================================

const HM_ACHIEVEMENT_DATA: Record<string, HmAchievementData> = {
  [HM_ACHIEVEMENT_FIRST_STEP]: { name: 'First Step', description: 'Enter the Haunted Mansion.', checkFn: 'enter' },
  [HM_ACHIEVEMENT_GHOST_WHISPERER]: { name: 'Ghost Whisperer', description: 'Capture your first ghost.', checkFn: 'capture' },
  [HM_ACHIEVEMENT_SPIRIT_FRIEND]: { name: 'Spirit Friend', description: 'Befriend your first ghost.', checkFn: 'befriend' },
  [HM_ACHIEVEMENT_ROOM_RAIDER]: { name: 'Room Raider', description: 'Explore 3 different rooms.', checkFn: 'rooms3' },
  [HM_ACHIEVEMENT_FULL_TOUR]: { name: 'Full Tour', description: 'Explore all 8 rooms.', checkFn: 'rooms8' },
  [HM_ACHIEVEMENT_ARTIFACT_HOARDER]: { name: 'Artifact Hoarder', description: 'Collect 25 total artifacts.', checkFn: 'artifacts25' },
  [HM_ACHIEVEMENT_SECRET_FINDER]: { name: 'Secret Finder', description: 'Discover your first secret passage.', checkFn: 'passage1' },
  [HM_ACHIEVEMENT_PUZZLE_SOLVER]: { name: 'Puzzle Solver', description: 'Solve your first puzzle.', checkFn: 'puzzle1' },
  [HM_ACHIEVEMENT_QUEST_COMPLETER]: { name: 'Quest Completer', description: 'Complete your first quest.', checkFn: 'quest1' },
  [HM_ACHIEVEMENT_SOCIAL_GHOST]: { name: 'Social Ghost', description: 'Befriend all 6 mansion NPCs.', checkFn: 'npcs6' },
  [HM_ACHIEVEMENT_SEANCE_MASTER]: { name: 'Seance Master', description: 'Perform 5 seance rituals.', checkFn: 'seance5' },
  [HM_ACHIEVEMENT_GHOST_COLLECTOR]: { name: 'Ghost Collector', description: 'Capture 20 ghosts.', checkFn: 'capture20' },
  [HM_ACHIEVEMENT_LEVEL_10]: { name: 'Level 10', description: 'Reach level 10.', checkFn: 'level10' },
  [HM_ACHIEVEMENT_LEVEL_25]: { name: 'Level 25', description: 'Reach level 25.', checkFn: 'level25' },
  [HM_ACHIEVEMENT_PHANTOM_LORD]: { name: 'Phantom Lord', description: 'Reach the maximum level of 50.', checkFn: 'level50' },
};

// ============================================================
// Static Data — Title Data
// ============================================================

const HM_TITLE_DATA: HmTitleData[] = [
  { name: HM_TITLE_VISITOR, requiredLevel: 1 },
  { name: HM_TITLE_CURIOUS_GUEST, requiredLevel: 5 },
  { name: HM_TITLE_SPIRIT_SEEKER, requiredLevel: 10 },
  { name: HM_TITLE_GHOST_HUNTER_TITLE, requiredLevel: 15 },
  { name: HM_TITLE_PHANTOM_APPRENTICE, requiredLevel: 20 },
  { name: HM_TITLE_SOUL_TAMER, requiredLevel: 30 },
  { name: HM_TITLE_SPIRIT_MASTER, requiredLevel: 40 },
  { name: HM_TITLE_PHANTOM_LORD, requiredLevel: 50 },
];

// ============================================================
// Level / XP helpers
// ============================================================

function hmXpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

function hmCalculateLevel(totalXp: number): number {
  for (let lvl = 50; lvl >= 1; lvl--) {
    if (totalXp >= hmXpForLevel(lvl)) return lvl;
  }
  return 1;
}

function hmTitleForLevel(level: number): string {
  let title = HM_TITLE_VISITOR;
  for (let i = 0; i < HM_TITLE_DATA.length; i++) {
    if (level >= HM_TITLE_DATA[i].requiredLevel) {
      title = HM_TITLE_DATA[i].name;
    }
  }
  return title;
}

function hmScareLabel(scareLevel: number): string {
  if (scareLevel <= 10) return HM_SCARE_NONE;
  if (scareLevel <= 25) return HM_SCARE_LOW;
  if (scareLevel <= 50) return HM_SCARE_MEDIUM;
  if (scareLevel <= 70) return HM_SCARE_HIGH;
  if (scareLevel <= 90) return HM_SCARE_EXTREME;
  return HM_SCARE_NIGHTMARE;
}

// ============================================================
// Achievement checker — returns newly unlocked achievements
// ============================================================

function hmCheckAchievements(state: HmHauntedMansionState): string[] {
  const checks: Record<string, boolean> = {
    [HM_ACHIEVEMENT_FIRST_STEP]: state.visitedRooms.length >= 1,
    [HM_ACHIEVEMENT_GHOST_WHISPERER]: state.totalGhostsCaptured >= 1,
    [HM_ACHIEVEMENT_SPIRIT_FRIEND]: state.totalGhostsBefriended >= 1,
    [HM_ACHIEVEMENT_ROOM_RAIDER]: state.totalRoomsExplored >= 3,
    [HM_ACHIEVEMENT_FULL_TOUR]: state.totalRoomsExplored >= 8,
    [HM_ACHIEVEMENT_ARTIFACT_HOARDER]: state.totalArtifactsCollected >= 25,
    [HM_ACHIEVEMENT_SECRET_FINDER]: state.discoveredPassages.length >= 1,
    [HM_ACHIEVEMENT_PUZZLE_SOLVER]: state.totalPuzzlesSolved >= 1,
    [HM_ACHIEVEMENT_QUEST_COMPLETER]: Object.values(state.quests).some(q => q.turnedIn),
    [HM_ACHIEVEMENT_SOCIAL_GHOST]: Object.values(state.npcs).filter(n => n.met && n.friendship >= n.maxFriendship).length >= 6,
    [HM_ACHIEVEMENT_SEANCE_MASTER]: state.totalSeancesPerformed >= 5,
    [HM_ACHIEVEMENT_GHOST_COLLECTOR]: state.totalGhostsCaptured >= 20,
    [HM_ACHIEVEMENT_LEVEL_10]: state.level >= 10,
    [HM_ACHIEVEMENT_LEVEL_25]: state.level >= 25,
    [HM_ACHIEVEMENT_PHANTOM_LORD]: state.level >= 50,
  };
  const newlyUnlocked: string[] = [];
  for (const id of HM_ALL_ACHIEVEMENTS) {
    if (checks[id] && !state.achievements.includes(id)) {
      newlyUnlocked.push(id);
    }
  }
  return newlyUnlocked;
}

// ============================================================
// Quest progress updater
// ============================================================

function hmUpdateQuestProgress(quests: Record<string, HmQuestProgress>, type: string, amount: number): Record<string, HmQuestProgress> {
  const updated = { ...quests };
  for (const questId of Object.keys(updated)) {
    const q = updated[questId];
    if (!q.accepted || q.completed) continue;
    const data = HM_QUEST_DATA[questId];
    if (!data || data.type !== type) continue;
    const newVal = q.currentValue + amount;
    updated[questId] = {
      ...q,
      currentValue: Math.min(newVal, q.targetValue),
      completed: newVal >= q.targetValue,
    };
  }
  return updated;
}

// ============================================================
// Initial State Factory
// ============================================================

function createInitialState(seed?: number): HmHauntedMansionState {
  const rngSeed = seed !== undefined ? seed >>> 0 : 42;

  const rooms: Record<string, HmRoomState> = {};
  for (const roomId of HM_ALL_ROOMS) {
    const rd = HM_ROOM_DATA[roomId];
    rooms[roomId] = {
      explored: false,
      scareLevel: rd ? rd.baseScareLevel : 30,
      paranormalActivity: rd ? rd.baseParanormalActivity : 30,
      secretsFound: 0,
      totalSecrets: rd ? rd.secrets : 2,
      ghostActivity: 0,
      visits: 0,
    };
  }

  const artifacts: Record<string, number> = {};
  for (const artId of HM_ALL_ARTIFACTS) {
    artifacts[artId] = 0;
  }

  const equipment: Record<string, HmEquipmentState> = {};
  for (const eqId of HM_ALL_EQUIPMENT) {
    const ed = HM_EQUIPMENT_DATA[eqId];
    equipment[eqId] = {
      owned: eqId === HM_EQUIPMENT_EMF_READER,
      durability: ed ? ed.maxDurability : 100,
      maxDurability: ed ? ed.maxDurability : 100,
      level: 1,
      xp: 0,
    };
  }

  const quests: Record<string, HmQuestProgress> = {};
  for (const qId of HM_ALL_QUESTS) {
    const qd = HM_QUEST_DATA[qId];
    quests[qId] = {
      currentValue: 0,
      targetValue: qd ? qd.targetValue : 1,
      accepted: false,
      completed: false,
      turnedIn: false,
    };
  }

  const npcs: Record<string, HmNpcRelation> = {};
  for (const npcId of HM_ALL_NPCS) {
    npcs[npcId] = { met: false, friendship: 0, maxFriendship: 100, questsGiven: 0 };
  }

  return {
    rngSeed,
    level: 1,
    experience: 0,
    title: HM_TITLE_VISITOR,
    currentRoom: HM_ROOM_GRAND_HALL,
    visitedRooms: [HM_ROOM_GRAND_HALL],
    rooms,
    capturedGhosts: [],
    befriendedGhosts: [],
    ghostEncounters: [],
    collectedObjects: [],
    activeObjectEffects: {},
    artifacts,
    equipment,
    activeEquipment: HM_EQUIPMENT_EMF_READER,
    quests,
    npcs,
    achievements: [],
    discoveredPassages: [],
    solvedPuzzles: [],
    dailySeanceAvailable: true,
    midnightHauntingActive: false,
    seanceCount: 0,
    totalGhostsCaptured: 0,
    totalGhostsBefriended: 0,
    totalRoomsExplored: 0,
    totalPuzzlesSolved: 0,
    totalSecretsFound: 0,
    totalSeancesPerformed: 0,
    totalArtifactsCollected: 0,
    explorationLog: ['You step through the creaking front door of the Haunted Mansion...'],
    midnightEventProgress: 0,
    midnightEventStep: 0,
  };
}

// ============================================================
// The Hook
// ============================================================

export default function useHauntedMansion(initialSeed?: number) {
  const [state, setState] = useState<HmHauntedMansionState>(
    (): HmHauntedMansionState => createInitialState(initialSeed),
  );

  // ----------------------------------------------------------
  // Plain read-only functions (close over state, no useCallback)
  // ----------------------------------------------------------

  function hmGetState(): HmHauntedMansionState {
    return state;
  }

  function hmGetLevel(): number {
    return state.level;
  }

  function hmGetExperience(): number {
    return state.experience;
  }

  function hmGetXpForNextLevel(): number {
    if (state.level >= 50) return 0;
    return hmXpForLevel(state.level + 1);
  }

  function hmGetTitle(): string {
    return state.title;
  }

  function hmGetScareLevel(roomId?: string): string {
    const room = roomId || state.currentRoom;
    const rs = state.rooms[room];
    if (!rs) return HM_SCARE_NONE;
    return hmScareLabel(rs.scareLevel);
  }

  function hmGetParanormalActivity(roomId?: string): number {
    const room = roomId || state.currentRoom;
    const rs = state.rooms[room];
    if (!rs) return 0;
    return rs.paranormalActivity;
  }

  function hmGetRoomInfo(roomId: string): HmRoomData | null {
    return HM_ROOM_DATA[roomId] || null;
  }

  function hmGetGhostInfo(ghostId: string): HmGhostData | null {
    return HM_GHOST_DATA[ghostId] || null;
  }

  function hmGetObjectInfo(objectId: string): HmObjectData | null {
    return HM_OBJECT_DATA[objectId] || null;
  }

  function hmGetArtifactInfo(artifactId: string): HmArtifactData | null {
    return HM_ARTIFACT_DATA[artifactId] || null;
  }

  function hmGetEquipmentInfo(equipmentId?: string): HmEquipmentData | null {
    const id = equipmentId || state.activeEquipment;
    if (!id) return null;
    return HM_EQUIPMENT_DATA[id] || null;
  }

  function hmGetQuestInfo(questId: string): { data: HmQuestData | null; progress: HmQuestProgress | null } {
    return { data: HM_QUEST_DATA[questId] || null, progress: state.quests[questId] || null };
  }

  function hmGetAvailableQuests(): string[] {
    return Object.keys(state.quests).filter(
      (qId) => !state.quests[qId].accepted && !state.quests[qId].turnedIn,
    );
  }

  function hmGetNPCInfo(npcId: string): { data: HmNPCData | null; relation: HmNpcRelation | null } {
    return { data: HM_NPC_DATA[npcId] || null, relation: state.npcs[npcId] || null };
  }

  function hmGetDiscoveredPassages(): string[] {
    return [...state.discoveredPassages];
  }

  function hmGetActiveGhosts(): string[] {
    const rd = HM_ROOM_DATA[state.currentRoom];
    if (!rd) return [];
    return rd.ghostPool.filter(
      (g) => !state.capturedGhosts.includes(g) && !state.befriendedGhosts.includes(g),
    );
  }

  function hmGetAchievements(): string[] {
    return [...state.achievements];
  }

  function hmCheckAchievement(achievementId: string): boolean {
    return state.achievements.includes(achievementId);
  }

  function hmIsMidnightActive(): boolean {
    return state.midnightHauntingActive;
  }

  function hmGetSeanceAvailable(): boolean {
    return state.dailySeanceAvailable;
  }

  function hmGetExplorationLog(): string[] {
    return [...state.explorationLog];
  }

  // ----------------------------------------------------------
  // useCallback — state-mutating actions
  // ----------------------------------------------------------

  const hmExploreRoom = useCallback((): void => {
    setState((prev) => {
      const roomId = prev.currentRoom;
      const rd = HM_ROOM_DATA[roomId];
      if (!rd) return prev;

      const roomState = prev.rooms[roomId];
      const wasExplored = roomState.explored;
      let seed = prev.rngSeed;
      const logEntries: string[] = [];

      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;
      const r2 = hmAdvanceRng(seed); seed = r2.nextSeed;
      const r3 = hmAdvanceRng(seed); seed = r3.nextSeed;
      const r4 = hmAdvanceRng(seed); seed = r4.nextSeed;
      const r5 = hmAdvanceRng(seed); seed = r5.nextSeed;
      const r6 = hmAdvanceRng(seed); seed = r6.nextSeed;

      let xpGain = 15 + Math.floor(roomState.scareLevel / 10);
      let ghostEncountered: string | null = null;
      let artifactFound: string | null = null;
      let artifactAmount = 0;
      let secretDiscovered = false;
      let objectFound: string | null = null;
      let scareChange = 0;
      let activityChange = 0;

      const detectionMod = prev.activeEquipment
        ? (HM_EQUIPMENT_DATA[prev.activeEquipment]?.detectionBonus || 0)
        : 0;

      const encounterChance = 0.25 + (roomState.paranormalActivity / 200) + (detectionMod / 200);
      if (r1.value < encounterChance) {
        const available = rd.ghostPool.filter(
          (g) => !prev.capturedGhosts.includes(g) && !prev.befriendedGhosts.includes(g) && !prev.ghostEncounters.includes(g),
        );
        if (available.length > 0) {
          const pick = hmPickRandom(seed, available);
          ghostEncountered = pick.item;
          seed = pick.nextSeed;
          logEntries.push(`A chilling presence... ${HM_GHOST_DATA[ghostEncountered]?.name || 'Unknown ghost'} appears!`);
        }
      }

      if (r2.value < 0.2) {
        const rArtifact = hmPickRandom(seed, HM_ALL_ARTIFACTS);
        artifactFound = rArtifact.item;
        seed = rArtifact.nextSeed;
        const amountRoll = hmRollInRange(seed, 1, 3);
        artifactAmount = amountRoll.value;
        seed = amountRoll.nextSeed;
        logEntries.push(`Found ${artifactAmount}x ${HM_ARTIFACT_DATA[artifactFound]?.name || 'mysterious artifact'}!`);
      }

      if (!roomState.explored) {
        xpGain += 50;
        logEntries.push(`You explore ${rd.name} for the first time.`);
      }

      if (r3.value < 0.35 && roomState.secretsFound < roomState.totalSecrets) {
        secretDiscovered = true;
        logEntries.push(`You discovered a hidden secret in ${rd.name}!`);
      }

      if (r4.value < 0.25) {
        const uncollected = rd.objects.filter((o) => !prev.collectedObjects.includes(o));
        if (uncollected.length > 0) {
          const objPick = hmPickRandom(seed, uncollected);
          objectFound = objPick.item;
          seed = objPick.nextSeed;
          logEntries.push(`Found haunted object: ${HM_OBJECT_DATA[objectFound]?.name || 'Unknown object'}!`);
        }
      }

      if (r5.value < 0.3) {
        scareChange = Math.floor(r6.value * 15) + 5;
        activityChange = Math.floor(r6.value * 20) + 5;
        logEntries.push(`The room grows darker... paranormal activity intensifies!`);
      }

      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);
      const newRooms = { ...prev.rooms, [roomId]: {
        ...roomState,
        explored: true,
        scareLevel: Math.min(100, roomState.scareLevel + scareChange),
        paranormalActivity: Math.min(100, roomState.paranormalActivity + activityChange),
        secretsFound: roomState.secretsFound + (secretDiscovered ? 1 : 0),
        ghostActivity: Math.min(100, roomState.ghostActivity + (ghostEncountered ? 10 : 0)),
        visits: roomState.visits + 1,
      }};

      const newArtifacts = { ...prev.artifacts };
      if (artifactFound) {
        newArtifacts[artifactFound] = (newArtifacts[artifactFound] || 0) + artifactAmount;
      }

      const newGhostEncounters = ghostEncountered && !prev.ghostEncounters.includes(ghostEncountered)
        ? [...prev.ghostEncounters, ghostEncountered]
        : prev.ghostEncounters;

      const newCollectedObjects = objectFound && !prev.collectedObjects.includes(objectFound)
        ? [...prev.collectedObjects, objectFound]
        : prev.collectedObjects;

      const newVisitedRooms = !prev.visitedRooms.includes(roomId)
        ? [...prev.visitedRooms, roomId]
        : prev.visitedRooms;

      const newAchievements = hmCheckAchievements({
        ...prev,
        rooms: newRooms,
        visitedRooms: newVisitedRooms,
        level: newLevel,
        totalRoomsExplored: prev.totalRoomsExplored + (wasExplored ? 0 : 1),
        totalSecretsFound: prev.totalSecretsFound + (secretDiscovered ? 1 : 0),
        totalArtifactsCollected: prev.totalArtifactsCollected + artifactAmount,
        artifacts: newArtifacts,
        ghostEncounters: newGhostEncounters,
      });

      const newQuests = hmUpdateQuestProgress(
        { ...prev.quests, [HM_QUEST_FIRST_CONTACT]: {
          ...prev.quests[HM_QUEST_FIRST_CONTACT],
          currentValue: prev.quests[HM_QUEST_FIRST_CONTACT].accepted
            ? prev.quests[HM_QUEST_FIRST_CONTACT].currentValue + (ghostEncountered ? 1 : 0)
            : prev.quests[HM_QUEST_FIRST_CONTACT].currentValue,
          completed: prev.quests[HM_QUEST_FIRST_CONTACT].accepted
            && prev.quests[HM_QUEST_FIRST_CONTACT].currentValue + (ghostEncountered ? 1 : 0) >= 1,
        }},
        'explore',
        wasExplored ? 0 : 1,
      );
      const updatedQuests = hmUpdateQuestProgress(
        { ...newQuests, [HM_QUEST_ARTIFACT_COLLECTOR]: {
          ...newQuests[HM_QUEST_ARTIFACT_COLLECTOR],
          currentValue: newQuests[HM_QUEST_ARTIFACT_COLLECTOR].accepted
            ? newQuests[HM_QUEST_ARTIFACT_COLLECTOR].currentValue + artifactAmount
            : newQuests[HM_QUEST_ARTIFACT_COLLECTOR].currentValue,
          completed: newQuests[HM_QUEST_ARTIFACT_COLLECTOR].accepted
            && newQuests[HM_QUEST_ARTIFACT_COLLECTOR].currentValue + artifactAmount >= 50,
        }},
        'artifact',
        artifactAmount,
      );

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        rooms: newRooms,
        artifacts: newArtifacts,
        ghostEncounters: newGhostEncounters,
        collectedObjects: newCollectedObjects,
        visitedRooms: newVisitedRooms,
        achievements: [...prev.achievements, ...newAchievements],
        quests: updatedQuests,
        totalRoomsExplored: prev.totalRoomsExplored + (wasExplored ? 0 : 1),
        totalSecretsFound: prev.totalSecretsFound + (secretDiscovered ? 1 : 0),
        totalArtifactsCollected: prev.totalArtifactsCollected + artifactAmount,
        explorationLog: [...prev.explorationLog, ...logEntries],
      };
    });
  }, [state]);

  const hmMoveToRoom = useCallback((roomId: string): void => {
    setState((prev) => {
      if (!HM_ROOM_DATA[roomId]) return prev;
      const rd = HM_ROOM_DATA[prev.currentRoom];
      if (!rd) return prev;
      const connected = [...rd.connectedRooms, ...prev.discoveredPassages
        .map((p) => HM_PASSAGE_DATA[p])
        .filter((p): p is HmPassageData => !!p)
        .filter((p) => p.fromRoom === prev.currentRoom || p.toRoom === prev.currentRoom)
        .map((p) => p.fromRoom === prev.currentRoom ? p.toRoom : p.fromRoom),
      ];
      const isConnected = connected.includes(roomId) || rd.connectedRooms.includes(roomId);
      if (!isConnected && roomId !== prev.currentRoom) return prev;

      const newVisited = prev.visitedRooms.includes(roomId)
        ? prev.visitedRooms
        : [...prev.visitedRooms, roomId];

      const newAchievements = hmCheckAchievements({ ...prev, visitedRooms: newVisited });

      return {
        ...prev,
        currentRoom: roomId,
        visitedRooms: newVisited,
        achievements: [...prev.achievements, ...newAchievements],
        explorationLog: [...prev.explorationLog, `Moved to ${HM_ROOM_DATA[roomId]?.name || roomId}.`],
      };
    });
  }, [state]);

  const hmCaptureGhost = useCallback((ghostId: string): void => {
    setState((prev) => {
      const gd = HM_GHOST_DATA[ghostId];
      if (!gd) return prev;
      if (!prev.ghostEncounters.includes(ghostId)) return prev;
      if (prev.capturedGhosts.includes(ghostId) || prev.befriendedGhosts.includes(ghostId)) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;

      const equipBonus = prev.activeEquipment
        ? (HM_EQUIPMENT_DATA[prev.activeEquipment]?.captureBonus || 0) : 0;
      const objectBonus = prev.collectedObjects.reduce((sum, oid) => {
        const od = HM_OBJECT_DATA[oid];
        return sum + (od?.effect === 'capture_bonus' ? od.power : 0);
      }, 0);
      const successChance = Math.min(95, (100 - gd.captureDifficulty) + equipBonus + objectBonus + (prev.level * 0.5));
      const success = r1.value * 100 < successChance;

      if (!success) {
        const newEquipment = { ...prev.equipment };
        if (prev.activeEquipment) {
          const eq = newEquipment[prev.activeEquipment];
          if (eq) {
            newEquipment[prev.activeEquipment] = {
              ...eq,
              durability: Math.max(0, eq.durability - 10),
            };
          }
        }
        return {
          ...prev,
          rngSeed: seed,
          equipment: newEquipment,
          explorationLog: [...prev.explorationLog, `Failed to capture ${gd.name}! The ghost escapes.`],
        };
      }

      const newCaptured = [...prev.capturedGhosts, ghostId];
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[gd.artifactDrop] = (newArtifacts[gd.artifactDrop] || 0) + 1;
      const totalArt = prev.totalArtifactsCollected + 1;

      const newLevel = hmCalculateLevel(prev.experience + gd.xpReward);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        capturedGhosts: newCaptured,
        totalGhostsCaptured: prev.totalGhostsCaptured + 1,
        level: newLevel,
        totalArtifactsCollected: totalArt,
        artifacts: newArtifacts,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'capture', 1);
      newQuests = hmUpdateQuestProgress(newQuests, 'artifact', 1);

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + gd.xpReward,
        title: newTitle,
        capturedGhosts: newCaptured,
        artifacts: newArtifacts,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        totalGhostsCaptured: prev.totalGhostsCaptured + 1,
        totalArtifactsCollected: totalArt,
        explorationLog: [
          ...prev.explorationLog,
          `Successfully captured ${gd.name}! (+${gd.xpReward} XP, found ${HM_ARTIFACT_DATA[gd.artifactDrop]?.name || 'artifact'})`,
        ],
      };
    });
  }, [state]);

  const hmBefriendGhost = useCallback((ghostId: string): void => {
    setState((prev) => {
      const gd = HM_GHOST_DATA[ghostId];
      if (!gd) return prev;
      if (!prev.ghostEncounters.includes(ghostId)) return prev;
      if (prev.capturedGhosts.includes(ghostId) || prev.befriendedGhosts.includes(ghostId)) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;

      const npcBonus = Object.values(prev.npcs).reduce(
        (sum, n) => sum + Math.floor(n.friendship * (HM_NPC_DATA[Object.keys(prev.npcs)[Object.values(prev.npcs).indexOf(n)]]?.friendshipBonus || 0) / 100),
        0,
      );
      const objectBonus = prev.collectedObjects.reduce((sum, oid) => {
        const od = HM_OBJECT_DATA[oid];
        return sum + (od?.effect === 'befriend_bonus' ? od.power : 0);
      }, 0);
      const successChance = Math.min(90, (100 - gd.befriendDifficulty) + npcBonus + objectBonus + (prev.level * 0.4));
      const success = r1.value * 100 < successChance;

      if (!success) {
        return {
          ...prev,
          rngSeed: seed,
          explorationLog: [...prev.explorationLog, `${gd.name} rejects your friendship attempt and vanishes.`],
        };
      }

      const xpBonus = Math.floor(gd.xpReward * 1.5);
      const newBefriended = [...prev.befriendedGhosts, ghostId];
      const newArtifacts = { ...prev.artifacts };
      newArtifacts[gd.artifactDrop] = (newArtifacts[gd.artifactDrop] || 0) + 2;
      const totalArt = prev.totalArtifactsCollected + 2;

      const newLevel = hmCalculateLevel(prev.experience + xpBonus);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        befriendedGhosts: newBefriended,
        totalGhostsBefriended: prev.totalGhostsBefriended + 1,
        level: newLevel,
        totalArtifactsCollected: totalArt,
        artifacts: newArtifacts,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'befriend', 1);
      newQuests = hmUpdateQuestProgress(newQuests, 'artifact', 2);

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpBonus,
        title: newTitle,
        befriendedGhosts: newBefriended,
        artifacts: newArtifacts,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        totalGhostsBefriended: prev.totalGhostsBefriended + 1,
        totalArtifactsCollected: totalArt,
        explorationLog: [
          ...prev.explorationLog,
          `Befriended ${gd.name}! The ghost now trusts you. (+${xpBonus} XP)`,
        ],
      };
    });
  }, [state]);

  const hmCollectObject = useCallback((objectId: string): void => {
    setState((prev) => {
      const od = HM_OBJECT_DATA[objectId];
      if (!od) return prev;
      if (prev.collectedObjects.includes(objectId)) return prev;

      const newCollected = [...prev.collectedObjects, objectId];
      const newEffects = { ...prev.activeObjectEffects, [objectId]: od.power };
      const xpGain = 25;

      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);

      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        collectedObjects: newCollected,
        activeObjectEffects: newEffects,
        explorationLog: [...prev.explorationLog, `Collected ${od.name}: ${od.description}`],
      };
    });
  }, [state]);

  const hmUseObject = useCallback((objectId: string): void => {
    setState((prev) => {
      if (!prev.collectedObjects.includes(objectId)) return prev;
      const od = HM_OBJECT_DATA[objectId];
      if (!od) return prev;

      const logMap: Record<string, string> = {
        reveal_ghosts: `${od.name} glows, revealing hidden ghost signatures around you.`,
        scare_resistance: `${od.name} creates a protective aura, reducing the room's fear.`,
        befriend_bonus: `${od.name} emits a warm light that makes spirits more receptive.`,
        capture_bonus: `${od.name} crackles with energy, enhancing your capture ability.`,
        reveal_secrets: `${od.name} illuminates hidden corners of the room.`,
        calm_ghosts: `${od.name} plays a soothing tone that calms restless spirits.`,
      };

      const message = logMap[od.effect] || `You use the ${od.name}.`;

      const roomUpdate = { ...prev.rooms, [prev.currentRoom]: {
        ...(prev.rooms[prev.currentRoom] || prev.rooms[HM_ROOM_GRAND_HALL]),
        scareLevel: od.effect === 'scare_resistance'
          ? Math.max(0, (prev.rooms[prev.currentRoom] || prev.rooms[HM_ROOM_GRAND_HALL]).scareLevel - 10)
          : (prev.rooms[prev.currentRoom] || prev.rooms[HM_ROOM_GRAND_HALL]).scareLevel,
        paranormalActivity: od.effect === 'calm_ghosts'
          ? Math.max(0, (prev.rooms[prev.currentRoom] || prev.rooms[HM_ROOM_GRAND_HALL]).paranormalActivity - 8)
          : (prev.rooms[prev.currentRoom] || prev.rooms[HM_ROOM_GRAND_HALL]).paranormalActivity,
      }};

      return {
        ...prev,
        rooms: roomUpdate,
        explorationLog: [...prev.explorationLog, message],
      };
    });
  }, [state]);

  const hmCollectArtifact = useCallback((artifactId: string, amount: number): void => {
    setState((prev) => {
      if (!HM_ARTIFACT_DATA[artifactId]) return prev;
      if (amount <= 0) return prev;

      const newArtifacts = { ...prev.artifacts, [artifactId]: (prev.artifacts[artifactId] || 0) + amount };
      const xpGain = Math.floor(amount * 5);

      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);
      const newTotalArt = prev.totalArtifactsCollected + amount;

      const newAchievements = hmCheckAchievements({
        ...prev,
        level: newLevel,
        totalArtifactsCollected: newTotalArt,
        artifacts: newArtifacts,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'artifact', amount);

      return {
        ...prev,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        artifacts: newArtifacts,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        totalArtifactsCollected: newTotalArt,
        explorationLog: [
          ...prev.explorationLog,
          `Collected ${amount}x ${HM_ARTIFACT_DATA[artifactId]?.name || artifactId}.`,
        ],
      };
    });
  }, [state]);

  const hmBuyEquipment = useCallback((equipmentId: string): void => {
    setState((prev) => {
      const ed = HM_EQUIPMENT_DATA[equipmentId];
      if (!ed) return prev;
      if (prev.equipment[equipmentId]?.owned) return prev;

      const coinCost = ed.cost;
      const coins = prev.artifacts[HM_ARTIFACT_HAUNTED_COIN] || 0;
      if (coins < coinCost) return prev;

      const newArtifacts = { ...prev.artifacts, [HM_ARTIFACT_HAUNTED_COIN]: coins - coinCost };
      const newEquipment = { ...prev.equipment, [equipmentId]: {
        owned: true,
        durability: ed.maxDurability,
        maxDurability: ed.maxDurability,
        level: 1,
        xp: 0,
      }};

      return {
        ...prev,
        artifacts: newArtifacts,
        equipment: newEquipment,
        explorationLog: [...prev.explorationLog, `Purchased ${ed.name} for ${coinCost} Haunted Coins!`],
      };
    });
  }, [state]);

  const hmEquipItem = useCallback((equipmentId: string): void => {
    setState((prev) => {
      if (!prev.equipment[equipmentId]?.owned) return prev;
      if (prev.equipment[equipmentId]?.durability <= 0) return prev;

      return {
        ...prev,
        activeEquipment: equipmentId,
        explorationLog: [
          ...prev.explorationLog,
          `Equipped ${HM_EQUIPMENT_DATA[equipmentId]?.name || equipmentId}.`,
        ],
      };
    });
  }, [state]);

  const hmUnequipItem = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      activeEquipment: null,
      explorationLog: [...prev.explorationLog, 'Unequipped current item.'],
    }));
  }, [state]);

  const hmUpgradeEquipment = useCallback((equipmentId: string): void => {
    setState((prev) => {
      const eq = prev.equipment[equipmentId];
      if (!eq || !eq.owned) return prev;
      const ed = HM_EQUIPMENT_DATA[equipmentId];
      if (!ed) return prev;

      const xpNeeded = eq.level * 100;
      if (eq.xp < xpNeeded) return prev;
      if (eq.level >= 10) return prev;

      const newEquipment = { ...prev.equipment, [equipmentId]: {
        ...eq,
        level: eq.level + 1,
        xp: eq.xp - xpNeeded,
        maxDurability: ed.maxDurability + (eq.level * 10),
        durability: Math.min(eq.durability + 20, ed.maxDurability + (eq.level * 10)),
      }};

      return {
        ...prev,
        equipment: newEquipment,
        explorationLog: [
          ...prev.explorationLog,
          `Upgraded ${ed.name} to level ${eq.level + 1}!`,
        ],
      };
    });
  }, [state]);

  const hmAcceptQuest = useCallback((questId: string): void => {
    setState((prev) => {
      const q = prev.quests[questId];
      const qd = HM_QUEST_DATA[questId];
      if (!q || !qd) return prev;
      if (q.accepted || q.turnedIn) return prev;

      return {
        ...prev,
        quests: { ...prev.quests, [questId]: { ...q, accepted: true, currentValue: q.currentValue } },
        explorationLog: [...prev.explorationLog, `Accepted quest: ${qd.name}`],
      };
    });
  }, [state]);

  const hmCompleteQuest = useCallback((questId: string): void => {
    setState((prev) => {
      const q = prev.quests[questId];
      const qd = HM_QUEST_DATA[questId];
      if (!q || !qd) return prev;
      if (!q.accepted || !q.completed || q.turnedIn) return prev;

      const newArtifacts = { ...prev.artifacts };
      if (qd.artifactReward) {
        newArtifacts[qd.artifactReward] = (newArtifacts[qd.artifactReward] || 0) + qd.artifactRewardAmount;
      }

      const totalArt = prev.totalArtifactsCollected + qd.artifactRewardAmount;
      const newLevel = hmCalculateLevel(prev.experience + qd.xpReward);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        quests: { ...prev.quests, [questId]: { ...q, turnedIn: true } },
        level: newLevel,
        totalArtifactsCollected: totalArt,
        artifacts: newArtifacts,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'artifact', qd.artifactRewardAmount);
      newQuests[questId] = { ...q, turnedIn: true };

      return {
        ...prev,
        rngSeed: prev.rngSeed,
        level: newLevel,
        experience: prev.experience + qd.xpReward,
        title: newTitle,
        quests: newQuests,
        artifacts: newArtifacts,
        achievements: [...prev.achievements, ...newAchievements],
        totalArtifactsCollected: totalArt,
        explorationLog: [
          ...prev.explorationLog,
          `Completed quest "${qd.name}"! +${qd.xpReward} XP, +${qd.artifactRewardAmount}x ${HM_ARTIFACT_DATA[qd.artifactReward]?.name || 'artifact'}`,
        ],
      };
    });
  }, [state]);

  const hmTalkToNPC = useCallback((npcId: string): void => {
    setState((prev) => {
      const nd = HM_NPC_DATA[npcId];
      if (!nd) return prev;
      const rel = prev.npcs[npcId];
      if (!rel) return prev;

      const friendshipGain = 10 + Math.floor(prev.level / 5);
      const newFriendship = Math.min(rel.maxFriendship, rel.friendship + friendshipGain);
      const wasMet = rel.met;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;

      const giftChance = 0.15 + (newFriendship / 500);
      let artifactGift: string | null = null;
      if (r1.value < giftChance && nd.giftArtifact) {
        artifactGift = nd.giftArtifact;
      }

      const newNpcs = { ...prev.npcs, [npcId]: {
        ...rel,
        met: true,
        friendship: newFriendship,
        questsGiven: rel.questsGiven,
      }};

      const newArtifacts = { ...prev.artifacts };
      if (artifactGift) {
        newArtifacts[artifactGift] = (newArtifacts[artifactGift] || 0) + 1;
      }

      const totalArt = prev.totalArtifactsCollected + (artifactGift ? 1 : 0);
      const newLevel = hmCalculateLevel(prev.experience + 20);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        npcs: newNpcs,
        level: newLevel,
        totalArtifactsCollected: totalArt,
        artifacts: newArtifacts,
      });

      const logMsg = wasMet
        ? `Spoke with ${nd.name}. Friendship: ${newFriendship}/${rel.maxFriendship}. ${artifactGift ? `They gifted you a ${HM_ARTIFACT_DATA[artifactGift]?.name || 'gift'}!` : ''}`
        : `Met ${nd.name} for the first time! "${nd.personality}"`;

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + 20,
        title: newTitle,
        npcs: newNpcs,
        artifacts: newArtifacts,
        achievements: [...prev.achievements, ...newAchievements],
        totalArtifactsCollected: totalArt,
        explorationLog: [...prev.explorationLog, logMsg],
      };
    });
  }, [state]);

  const hmDiscoverSecretPassage = useCallback((passageId: string): void => {
    setState((prev) => {
      const pd = HM_PASSAGE_DATA[passageId];
      if (!pd) return prev;
      if (prev.discoveredPassages.includes(passageId)) return prev;
      if (prev.level < pd.requiredLevel) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;

      const detectBonus = prev.activeEquipment
        ? (HM_EQUIPMENT_DATA[prev.activeEquipment]?.detectionBonus || 0) : 0;
      const objectBonus = prev.collectedObjects.reduce((sum, oid) => {
        const od = HM_OBJECT_DATA[oid];
        return sum + (od?.effect === 'reveal_secrets' ? od.power : 0);
      }, 0);
      const discoverChance = Math.min(95, 40 + detectBonus + objectBonus + (prev.level - pd.requiredLevel) * 3);
      const success = r1.value * 100 < discoverChance;

      if (!success) {
        return {
          ...prev,
          rngSeed: seed,
          explorationLog: [...prev.explorationLog, `You sense something hidden near ${pd.fromRoom} but cannot find it.`],
        };
      }

      const xpGain = 100 + pd.requiredLevel * 10;
      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        discoveredPassages: [...prev.discoveredPassages, passageId],
        level: newLevel,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'passage', 1);

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        discoveredPassages: [...prev.discoveredPassages, passageId],
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        explorationLog: [
          ...prev.explorationLog,
          `Discovered secret passage: ${pd.name}! Connects ${HM_ROOM_DATA[pd.fromRoom]?.name || pd.fromRoom} to ${HM_ROOM_DATA[pd.toRoom]?.name || pd.toRoom}. (+${xpGain} XP)`,
        ],
      };
    });
  }, [state]);

  const hmSolvePuzzle = useCallback((puzzleId: string): void => {
    setState((prev) => {
      const pd = HM_PUZZLE_DATA[puzzleId];
      if (!pd) return prev;
      if (prev.solvedPuzzles.includes(puzzleId)) return prev;

      const hasArtifacts = (prev.artifacts[pd.requiredArtifact] || 0) >= pd.requiredAmount;
      if (!hasArtifacts) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;

      const levelBonus = Math.floor(prev.level / 3);
      const successChance = Math.min(95, (100 - pd.difficulty) + levelBonus);
      const success = r1.value * 100 < successChance;

      if (!success) {
        const newArtifacts = { ...prev.artifacts, [pd.requiredArtifact]: Math.max(0, (prev.artifacts[pd.requiredArtifact] || 0) - 1) };
        return {
          ...prev,
          rngSeed: seed,
          artifacts: newArtifacts,
          explorationLog: [...prev.explorationLog, `Failed to solve ${pd.name}! Lost 1 ${HM_ARTIFACT_DATA[pd.requiredArtifact]?.name || 'artifact'}.`],
        };
      }

      const newArtifacts = { ...prev.artifacts, [pd.requiredArtifact]: Math.max(0, (prev.artifacts[pd.requiredArtifact] || 0) - pd.requiredAmount) };
      const newSolved = [...prev.solvedPuzzles, puzzleId];
      const xpGain = 150 + pd.difficulty * 5;
      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        solvedPuzzles: newSolved,
        level: newLevel,
        totalPuzzlesSolved: prev.totalPuzzlesSolved + 1,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'puzzle', 1);

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        artifacts: newArtifacts,
        solvedPuzzles: newSolved,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        totalPuzzlesSolved: prev.totalPuzzlesSolved + 1,
        explorationLog: [
          ...prev.explorationLog,
          `Solved ${pd.name}! The passage to ${HM_ROOM_DATA[HM_PASSAGE_DATA[pd.passageId]?.toRoom || '']?.name || 'unknown'} is now accessible. (+${xpGain} XP)`,
        ],
      };
    });
  }, [state]);

  const hmPerformSeance = useCallback((): void => {
    setState((prev) => {
      if (!prev.dailySeanceAvailable) return prev;
      if ((prev.artifacts[HM_ARTIFACT_SPIRIT_CANDLE] || 0) < 2) return prev;
      if ((prev.artifacts[HM_ARTIFACT_SOUL_GEM] || 0) < 1) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;
      const r2 = hmAdvanceRng(seed); seed = r2.nextSeed;
      const r3 = hmAdvanceRng(seed); seed = r3.nextSeed;
      const r4 = hmAdvanceRng(seed); seed = r4.nextSeed;

      const newArtifacts = { ...prev.artifacts };
      newArtifacts[HM_ARTIFACT_SPIRIT_CANDLE] = Math.max(0, (newArtifacts[HM_ARTIFACT_SPIRIT_CANDLE] || 0) - 2);
      newArtifacts[HM_ARTIFACT_SOUL_GEM] = Math.max(0, (newArtifacts[HM_ARTIFACT_SOUL_GEM] || 0) - 1);

      const logEntries: string[] = ['The candles flicker as you begin the seance ritual...'];

      if (r1.value < 0.5) {
        logEntries.push('Spirits respond! The room fills with ethereal whispers.');
        const rareRoll = hmPickRandom(seed, HM_ALL_GHOSTS.filter((g) => {
          const rarity = HM_GHOST_DATA[g]?.rarity;
          return rarity === HM_RARITY_RARE || rarity === HM_RARITY_EPIC || rarity === HM_RARITY_LEGENDARY;
        }));
        const rareGhost = rareRoll.item;
        seed = rareRoll.nextSeed;
        if (rareGhost && !prev.ghostEncounters.includes(rareGhost)) {
          logEntries.push(`A rare spirit appears: ${HM_GHOST_DATA[rareGhost]?.name || 'Unknown'}!`);
          logEntries.push(`(You can now attempt to capture or befriend this ghost.)`);
        }
      } else {
        logEntries.push('The spirits remain silent. The candles burn low.');
      }

      let artifactBonus: string | null = null;
      if (r2.value < 0.3) {
        const artRoll = hmPickRandom(seed, [HM_ARTIFACT_ECTOPLASM_VIAL, HM_ARTIFACT_SPECTRAL_DUST, HM_ARTIFACT_SPIRIT_ORB, HM_ARTIFACT_BANSHEE_TEAR]);
        artifactBonus = artRoll.item;
        seed = artRoll.nextSeed;
        newArtifacts[artifactBonus] = (newArtifacts[artifactBonus] || 0) + 3;
        logEntries.push(`The spirits leave behind 3x ${HM_ARTIFACT_DATA[artifactBonus]?.name || 'artifact'}.`);
      }

      const roomsCopy = { ...prev.rooms };
      const roomIds = Object.keys(roomsCopy);
      for (const rid of roomIds) {
        roomsCopy[rid] = { ...roomsCopy[rid], paranormalActivity: Math.min(100, roomsCopy[rid].paranormalActivity + 5) };
      }

      if (r3.value < 0.2) {
        logEntries.push('A mysterious message from beyond: "Beware the Tower at midnight..."');
      }

      const xpGain = 75;
      const newSeanceCount = prev.seanceCount + 1;
      const totalSeances = prev.totalSeancesPerformed + 1;
      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);

      const newAchievements = hmCheckAchievements({
        ...prev,
        totalSeancesPerformed: totalSeances,
        level: newLevel,
      });

      let newQuests = hmUpdateQuestProgress(prev.quests, 'seance', 1);
      newQuests = hmUpdateQuestProgress(
        { ...newQuests, [HM_QUEST_FIRST_CONTACT]: {
          ...newQuests[HM_QUEST_FIRST_CONTACT],
          currentValue: newQuests[HM_QUEST_FIRST_CONTACT].currentValue + (r1.value < 0.5 ? 1 : 0),
          completed: newQuests[HM_QUEST_FIRST_CONTACT].accepted && newQuests[HM_QUEST_FIRST_CONTACT].currentValue + (r1.value < 0.5 ? 1 : 0) >= 1,
        }},
        'artifact',
        artifactBonus ? 3 : 0,
      );

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        dailySeanceAvailable: false,
        seanceCount: newSeanceCount,
        artifacts: newArtifacts,
        rooms: roomsCopy,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        totalSeancesPerformed: totalSeances,
        totalArtifactsCollected: prev.totalArtifactsCollected + (artifactBonus ? 3 : 0),
        explorationLog: [...prev.explorationLog, ...logEntries],
      };
    });
  }, [state]);

  const hmStartMidnightHaunting = useCallback((): void => {
    setState((prev) => {
      if (prev.midnightHauntingActive) return prev;
      if (prev.level < 10) return prev;

      const logEntries: string[] = [
        'The clock strikes midnight... the mansion transforms!',
        'Shadows lengthen, doors slam, and ghostly figures materialize everywhere.',
        'Survive the haunting to earn legendary rewards!',
      ];

      const roomsCopy = { ...prev.rooms };
      for (const rid of Object.keys(roomsCopy)) {
        roomsCopy[rid] = {
          ...roomsCopy[rid],
          scareLevel: Math.min(100, roomsCopy[rid].scareLevel + 30),
          paranormalActivity: Math.min(100, roomsCopy[rid].paranormalActivity + 40),
          ghostActivity: Math.min(100, roomsCopy[rid].ghostActivity + 50),
        };
      }

      return {
        ...prev,
        midnightHauntingActive: true,
        midnightEventProgress: 0,
        midnightEventStep: 1,
        rooms: roomsCopy,
        explorationLog: [...prev.explorationLog, ...logEntries],
      };
    });
  }, [state]);

  const hmAdvanceMidnightEvent = useCallback((): void => {
    setState((prev) => {
      if (!prev.midnightHauntingActive) return prev;
      if (prev.midnightEventStep >= 5) return prev;

      let seed = prev.rngSeed;
      const r1 = hmAdvanceRng(seed); seed = r1.nextSeed;
      const r2 = hmAdvanceRng(seed); seed = r2.nextSeed;

      const step = prev.midnightEventStep + 1;
      const progressGain = 20;
      const newProgress = Math.min(100, prev.midnightEventProgress + progressGain);
      const logEntries: string[] = [];

      const stepDescriptions: Record<number, string> = {
        1: 'Shadow figures dance across the walls as the temperature drops...',
        2: 'Ghostly wails echo from every room. Something powerful is awakening!',
        3: 'The mansion shakes. Ancient runes glow on the floor of the Grand Hall.',
        4: 'A massive spectral entity materializes in the center of the mansion!',
        5: 'The entity acknowledges your courage and fades away, leaving gifts behind.',
      };

      logEntries.push(stepDescriptions[step] || 'The haunting continues...');

      let artifactGain: string | null = null;
      let artifactAmount = 0;
      if (r1.value < 0.4) {
        const rareArts = [HM_ARTIFACT_SOUL_GEM, HM_ARTIFACT_EERIE_AMULET, HM_ARTIFACT_SHADOW_ESSENCE, HM_ARTIFACT_GHOST_KEY];
        const pick = hmPickRandom(seed, rareArts);
        artifactGain = pick.item;
        seed = pick.nextSeed;
        const amtRoll = hmRollInRange(seed, 1, 3);
        artifactAmount = amtRoll.value;
        seed = amtRoll.nextSeed;
        logEntries.push(`Found ${artifactAmount}x ${HM_ARTIFACT_DATA[artifactGain]?.name || 'rare artifact'}!`);
      }

      let ghostEncounter: string | null = null;
      if (r2.value < 0.35 && step < 5) {
        const epicLegends = HM_ALL_GHOSTS.filter((g) => {
          const rarity = HM_GHOST_DATA[g]?.rarity;
          return rarity === HM_RARITY_EPIC || rarity === HM_RARITY_LEGENDARY;
        });
        const gPick = hmPickRandom(seed, epicLegends);
        ghostEncounter = gPick.item;
        seed = gPick.nextSeed;
        if (ghostEncounter && !prev.ghostEncounters.includes(ghostEncounter)) {
          logEntries.push(`A powerful spirit emerges: ${HM_GHOST_DATA[ghostEncounter]?.name || 'Unknown'}!`);
        }
      }

      const newArtifacts = { ...prev.artifacts };
      if (artifactGain) {
        newArtifacts[artifactGain] = (newArtifacts[artifactGain] || 0) + artifactAmount;
      }

      const newGhostEncounters = ghostEncounter && !prev.ghostEncounters.includes(ghostEncounter)
        ? [...prev.ghostEncounters, ghostEncounter]
        : prev.ghostEncounters;

      const xpGain = 100 * step;
      const newLevel = hmCalculateLevel(prev.experience + xpGain);
      const newTitle = hmTitleForLevel(newLevel);

      const isComplete = step >= 5;
      let newQuests = prev.quests;
      if (isComplete) {
        newQuests = hmUpdateQuestProgress(prev.quests, 'midnight', 1);
      }

      const newAchievements = hmCheckAchievements({
        ...prev,
        level: newLevel,
        totalArtifactsCollected: prev.totalArtifactsCollected + artifactAmount,
        artifacts: newArtifacts,
        ghostEncounters: newGhostEncounters,
      });

      let finalQuests = newQuests;
      if (isComplete) {
        const qKey = HM_QUEST_FIRST_CONTACT;
        if (ghostEncounter && prev.quests[qKey]?.accepted) {
          finalQuests = {
            ...finalQuests,
            [qKey]: {
              ...finalQuests[qKey],
              currentValue: finalQuests[qKey].currentValue + 1,
              completed: finalQuests[qKey].currentValue + 1 >= 1,
            },
          };
        }
      }

      return {
        ...prev,
        rngSeed: seed,
        level: newLevel,
        experience: prev.experience + xpGain,
        title: newTitle,
        midnightEventStep: step,
        midnightEventProgress: newProgress,
        midnightHauntingActive: !isComplete,
        artifacts: newArtifacts,
        ghostEncounters: newGhostEncounters,
        achievements: [...prev.achievements, ...newAchievements],
        quests: finalQuests,
        totalArtifactsCollected: prev.totalArtifactsCollected + artifactAmount,
        explorationLog: [...prev.explorationLog, ...logEntries],
      };
    });
  }, [state]);

  const hmResetDaily = useCallback((): void => {
    setState((prev) => ({
      ...prev,
      dailySeanceAvailable: true,
      explorationLog: [...prev.explorationLog, 'Daily activities have been reset.'],
    }));
  }, [state]);

  const hmGiveNpcGift = useCallback((npcId: string, artifactId: string, amount: number): void => {
    setState((prev) => {
      const nd = HM_NPC_DATA[npcId];
      const rel = prev.npcs[npcId];
      if (!nd || !rel) return prev;
      if (!rel.met) return prev;
      if ((prev.artifacts[artifactId] || 0) < amount || amount <= 0) return prev;

      const ad = HM_ARTIFACT_DATA[artifactId];
      const rarityValue: Record<string, number> = {
        [HM_RARITY_COMMON]: 5,
        [HM_RARITY_UNCOMMON]: 10,
        [HM_RARITY_RARE]: 20,
        [HM_RARITY_EPIC]: 35,
        [HM_RARITY_LEGENDARY]: 50,
      };
      const friendshipGain = (rarityValue[ad?.rarity || HM_RARITY_COMMON] || 5) * amount;
      const newFriendship = Math.min(rel.maxFriendship, rel.friendship + friendshipGain);

      const newArtifacts = { ...prev.artifacts, [artifactId]: (prev.artifacts[artifactId] || 0) - amount };
      const newNpcs = { ...prev.npcs, [npcId]: { ...rel, friendship: newFriendship } };

      const maxedOut = newFriendship >= rel.maxFriendship;
      const newAchievements = maxedOut
        ? hmCheckAchievements({ ...prev, npcs: newNpcs })
        : [];

      let newQuests = prev.quests;
      const maxedCount = Object.values(newNpcs).filter((n) => n.met && n.friendship >= n.maxFriendship).length;
      if (maxedCount > Object.values(prev.npcs).filter((n) => n.met && n.friendship >= n.maxFriendship).length) {
        newQuests = hmUpdateQuestProgress(prev.quests, 'npc_ally', 0);
      }

      return {
        ...prev,
        artifacts: newArtifacts,
        npcs: newNpcs,
        achievements: [...prev.achievements, ...newAchievements],
        quests: newQuests,
        explorationLog: [
          ...prev.explorationLog,
          `Gave ${amount}x ${ad?.name || artifactId} to ${nd.name}. Friendship: ${newFriendship}/${rel.maxFriendship}.${maxedOut ? ' Maximum friendship reached!' : ''}`,
        ],
      };
    });
  }, [state]);

  const hmAddEquipmentXp = useCallback((equipmentId: string, xp: number): void => {
    setState((prev) => {
      const eq = prev.equipment[equipmentId];
      if (!eq || !eq.owned) return prev;

      const newEquipment = { ...prev.equipment, [equipmentId]: { ...eq, xp: eq.xp + xp } };
      return { ...prev, equipment: newEquipment };
    });
  }, [state]);

  const hmRepairEquipment = useCallback((equipmentId: string): void => {
    setState((prev) => {
      const eq = prev.equipment[equipmentId];
      if (!eq || !eq.owned) return prev;
      const cost = Math.ceil((eq.maxDurability - eq.durability) / 2);
      const coins = prev.artifacts[HM_ARTIFACT_HAUNTED_COIN] || 0;
      if (coins < cost) return prev;

      const newEquipment = { ...prev.equipment, [equipmentId]: { ...eq, durability: eq.maxDurability } };
      const newArtifacts = { ...prev.artifacts, [HM_ARTIFACT_HAUNTED_COIN]: coins - cost };

      return {
        ...prev,
        equipment: newEquipment,
        artifacts: newArtifacts,
        explorationLog: [
          ...prev.explorationLog,
          `Repaired ${HM_EQUIPMENT_DATA[equipmentId]?.name || equipmentId} for ${cost} Haunted Coins.`,
        ],
      };
    });
  }, [state]);

  // ----------------------------------------------------------
  // Return the full API surface
  // ----------------------------------------------------------

  return {
    // State access
    hmGetState,

    // Level / XP
    hmGetLevel,
    hmGetExperience,
    hmGetXpForNextLevel,
    hmGetTitle,

    // Room
    hmExploreRoom,
    hmMoveToRoom,
    hmGetRoomInfo,
    hmGetScareLevel,
    hmGetParanormalActivity,
    hmGetActiveGhosts,

    // Ghosts
    hmCaptureGhost,
    hmBefriendGhost,
    hmGetGhostInfo,

    // Objects
    hmCollectObject,
    hmUseObject,
    hmGetObjectInfo,

    // Artifacts
    hmCollectArtifact,
    hmGetArtifactInfo,

    // Equipment
    hmBuyEquipment,
    hmEquipItem,
    hmUnequipItem,
    hmUpgradeEquipment,
    hmRepairEquipment,
    hmAddEquipmentXp,
    hmGetEquipmentInfo,

    // Quests
    hmAcceptQuest,
    hmCompleteQuest,
    hmGetQuestInfo,
    hmGetAvailableQuests,

    // NPCs
    hmTalkToNPC,
    hmGiveNpcGift,
    hmGetNPCInfo,

    // Secrets & Puzzles
    hmDiscoverSecretPassage,
    hmSolvePuzzle,
    hmGetDiscoveredPassages,

    // Daily / Events
    hmPerformSeance,
    hmStartMidnightHaunting,
    hmAdvanceMidnightEvent,
    hmResetDaily,
    hmGetSeanceAvailable,
    hmIsMidnightActive,

    // Achievements
    hmCheckAchievement,
    hmGetAchievements,

    // Log
    hmGetExplorationLog,
  };
}
