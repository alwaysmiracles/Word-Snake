// ============================================================================
// Zen Temple Wire — Peaceful Monastery Management and Meditation Game
// ============================================================================
// A comprehensive Zen Temple simulation featuring monk progression,
// temple room upgrades, meditation techniques, koans, tea ceremony,
// bonsai cultivation, visitors, seasonal events, and more.
// Only uses useState. All exported functions use `zt` prefix.
// Storage key: 'zen-temple-save'
// ============================================================================

import { useState } from 'react';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ZT_STORAGE_KEY = 'zen-temple-save';
const ZT_MAX_RANK = 50;
const ZT_MAX_ROOM_LEVEL = 10;
const ZT_MAX_BONSAI_STAGE = 5;
const ZT_MAX_MEDITATION_DEPTH = 10;
const ZT_MAX_KOAN_TIER = 4;

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type ZtMonkClass =
  | 'novice'
  | 'acolyte'
  | 'disciple'
  | 'adept'
  | 'scholar'
  | 'elder'
  | 'sage'
  | 'master'
  | 'grandmaster'
  | 'zen_master';

export type ZtSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export type ZtRoomId =
  | 'meditation_hall'
  | 'tea_garden'
  | 'script_library'
  | 'zen_garden'
  | 'bell_tower'
  | 'incense_room'
  | 'dojo'
  | 'enlightenment_chamber';

export type ZtResourceId = 'incense' | 'tea_leaves' | 'scrolls' | 'stone' | 'enlightenment';

export type ZtTeaType =
  | 'sencha'
  | 'matcha'
  | 'gyokuro'
  | 'hojicha'
  | 'genmaicha'
  | 'bancha'
  | 'kukicha'
  | 'shincha';

export type ZtBonsaiSpecies =
  | 'juniper'
  | 'pine'
  | 'maple'
  | 'cherry_blossom'
  | 'plum'
  | 'elm'
  | 'cedar'
  | 'cypress'
  | 'bamboo'
  | 'willow'
  | 'oak'
  | 'wisteria'
  | 'azalea'
  | 'ginkgo'
  | 'ficus';

export type ZtMeditationTechnique =
  | 'breath_counting'
  | 'walking_meditation'
  | 'koan_contemplation'
  | 'body_scan'
  | 'loving_kindness'
  | 'visualization'
  | 'mantra_chanting'
  | 'silent_illumination'
  | 'mindful_eating'
  | 'zen_archery'
  | 'calligraphy_focus'
  | 'nature_awareness';

export type ZtKoanTier = 1 | 2 | 3 | 4;

export type ZtAchievementId =
  | 'first_meditation'
  | 'ten_meditations'
  | 'fifty_meditations'
  | 'first_koan'
  | 'ten_koans'
  | 'all_koans'
  | 'first_tea'
  | 'tea_master'
  | 'first_bonsai'
  | 'bonsai_exhibition'
  | 'all_rooms_max'
  | 'rank_twenty'
  | 'rank_fifty'
  | 'thirty_day_streak'
  | 'enlightenment_100';

// ---------------------------------------------------------------------------
// Definition Interfaces
// ---------------------------------------------------------------------------

export interface ZtMonkClassDef {
  id: ZtMonkClass;
  name: string;
  description: string;
  requiredRank: number;
  statBonuses: ZtStats;
  meditationBonus: number;
  teaBonus: number;
  bonsaiBonus: number;
  icon: string;
  color: string;
}

export interface ZtStats {
  wisdom: number;
  serenity: number;
  focus: number;
  discipline: number;
  compassion: number;
}

export interface ZtRoomDef {
  id: ZtRoomId;
  name: string;
  description: string;
  baseBenefits: ZtStats;
  levelScaling: ZtStats;
  unlockRank: number;
  icon: string;
  color: string;
}

export interface ZtMeditationDef {
  id: ZtMeditationTechnique;
  name: string;
  description: string;
  baseXp: number;
  baseDuration: number;
  statFocus: keyof ZtStats;
  unlockRank: number;
  icon: string;
  depthMultiplier: number;
}

export interface ZtKoanDef {
  id: string;
  question: string;
  answer: string;
  tier: ZtKoanTier;
  enlightenmentReward: number;
  xpReward: number;
  unlockRank: number;
}

export interface ZtTeaDef {
  id: ZtTeaType;
  name: string;
  description: string;
  serenityBonus: number;
  focusBonus: number;
  preparationDifficulty: number;
  guestPreference: number;
  unlockRank: number;
  icon: string;
  color: string;
}

export interface ZtBonsaiDef {
  id: ZtBonsaiSpecies;
  name: string;
  description: string;
  growthRate: number;
  maxHealth: number;
  baseScore: number;
  unlockRank: number;
  preferredSeason: ZtSeason;
  icon: string;
  color: string;
}

export interface ZtVisitorDef {
  id: string;
  name: string;
  title: string;
  dialogue: string[];
  giftType: ZtResourceId | null;
  giftAmount: number;
  requestType: string;
  reward: { type: ZtResourceId; amount: number } | null;
  unlockRank: number;
  icon: string;
}

export interface ZtAchievementDef {
  id: ZtAchievementId;
  name: string;
  description: string;
  icon: string;
  target: number;
  rewardXp: number;
  rewardResource: ZtResourceId | null;
  rewardAmount: number;
}

export interface ZtSeasonEffect {
  season: ZtSeason;
  meditationMultiplier: number;
  gardenGrowthMultiplier: number;
  teaQualityMultiplier: number;
  visitorFrequency: number;
  resourceBonus: Partial<Record<ZtResourceId, number>>;
  icon: string;
  description: string;
}

export interface ZtBonsaiGrowthStage {
  stage: number;
  name: string;
  minProgress: number;
  icon: string;
  description: string;
}

// ---------------------------------------------------------------------------
// State Interfaces
// ---------------------------------------------------------------------------

export interface ZtRoomState {
  level: number;
  unlocked: boolean;
  totalUpgrades: number;
}

export interface ZtMeditationSession {
  technique: ZtMeditationTechnique;
  depth: number;
  totalCompleted: number;
  totalXpEarned: number;
  bestDepth: number;
}

export interface ZtKoanProgress {
  koanId: string;
  solved: boolean;
  attempts: number;
  solvedAt: string | null;
}

export interface ZtTeaCeremony {
  teaType: ZtTeaType;
  totalPrepared: number;
  totalServed: number;
  guestSatisfaction: number;
  bestScore: number;
}

export interface ZtBonsaiTree {
  species: ZtBonsaiSpecies;
  growthProgress: number;
  stage: number;
  health: number;
  pruningCount: number;
  wateringCount: number;
  lastWatered: string | null;
  exhibitionScore: number;
  exhibited: boolean;
}

export interface ZtVisitorState {
  visitorId: string;
  timesVisited: number;
  giftsGiven: number;
  requestsFulfilled: number;
  lastVisit: string | null;
}

export interface ZtAchievementState {
  unlocked: boolean;
  progress: number;
  unlockedAt: string | null;
}

export interface ZtDailyChallenge {
  date: string;
  completed: boolean;
  technique: ZtMeditationTechnique;
  targetDepth: number;
  bonusXp: number;
  bonusResources: Partial<Record<ZtResourceId, number>>;
}

export interface ZtStreakData {
  current: number;
  best: number;
  lastDate: string | null;
}

export interface ZtStatsTotals {
  totalMeditationMinutes: number;
  totalSessions: number;
  totalKoansSolved: number;
  totalTeaCeremonies: number;
  totalBonsaiActions: number;
  totalVisitorsGreeted: number;
  totalResourcesGathered: number;
  totalRoomUpgrades: number;
  totalEnlightenmentEarned: number;
}

export interface ZenTempleState {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  rank: number;
  monkClass: ZtMonkClass;
  stats: ZtStats;
  currentRoom: ZtRoomId;
  season: ZtSeason;
  resources: Record<ZtResourceId, number>;
  enlightenmentPoints: number;
  rooms: Record<ZtRoomId, ZtRoomState>;
  meditationSessions: Record<ZtMeditationTechnique, ZtMeditationSession>;
  koansSolved: string[];
  koanProgress: Record<string, ZtKoanProgress>;
  teaInventory: Record<ZtTeaType, number>;
  teaCeremonies: Record<ZtTeaType, ZtTeaCeremony>;
  teaGuestSatisfaction: number;
  bonsaiTrees: ZtBonsaiTree[];
  bonsaiSlots: number;
  currentVisitors: string[];
  visitorStates: Record<string, ZtVisitorState>;
  achievements: Record<ZtAchievementId, ZtAchievementState>;
  dailyChallenge: ZtDailyChallenge;
  streak: ZtStreakData;
  templeName: string;
  statsTotals: ZtStatsTotals;
  createdAt: string;
  lastPlayed: string;
}

// ---------------------------------------------------------------------------
// Monk Class Definitions (10 classes)
// ---------------------------------------------------------------------------

const ZT_MONK_CLASSES: ZtMonkClassDef[] = [
  {
    id: 'novice',
    name: 'Novice',
    description: 'A humble beginner on the path of Zen. Every great journey starts with a single step.',
    requiredRank: 1,
    statBonuses: { wisdom: 1, serenity: 1, focus: 1, discipline: 1, compassion: 1 },
    meditationBonus: 0,
    teaBonus: 0,
    bonsaiBonus: 0,
    icon: '🌱',
    color: '#8B9467',
  },
  {
    id: 'acolyte',
    name: 'Acolyte',
    description: 'Having learned the basics, the acolyte begins to understand the deeper teachings.',
    requiredRank: 5,
    statBonuses: { wisdom: 3, serenity: 2, focus: 2, discipline: 2, compassion: 2 },
    meditationBonus: 0.1,
    teaBonus: 0.05,
    bonsaiBonus: 0.05,
    icon: '🌿',
    color: '#6B8E23',
  },
  {
    id: 'disciple',
    name: 'Disciple',
    description: 'A devoted student who walks the path with increasing dedication and insight.',
    requiredRank: 10,
    statBonuses: { wisdom: 5, serenity: 4, focus: 4, discipline: 3, compassion: 3 },
    meditationBonus: 0.15,
    teaBonus: 0.1,
    bonsaiBonus: 0.1,
    icon: '🎋',
    color: '#556B2F',
  },
  {
    id: 'adept',
    name: 'Adept',
    description: 'Skilled in the ways of Zen, the adept commands meditation and discipline with grace.',
    requiredRank: 15,
    statBonuses: { wisdom: 8, serenity: 6, focus: 7, discipline: 5, compassion: 5 },
    meditationBonus: 0.2,
    teaBonus: 0.15,
    bonsaiBonus: 0.15,
    icon: '🏯',
    color: '#2E8B57',
  },
  {
    id: 'scholar',
    name: 'Scholar',
    description: 'A learned monk who studies ancient texts and seeks truth through knowledge.',
    requiredRank: 20,
    statBonuses: { wisdom: 12, serenity: 8, focus: 9, discipline: 7, compassion: 6 },
    meditationBonus: 0.25,
    teaBonus: 0.2,
    bonsaiBonus: 0.2,
    icon: '📜',
    color: '#4682B4',
  },
  {
    id: 'elder',
    name: 'Elder',
    description: 'Respected for wisdom and experience, the elder guides younger monks with patience.',
    requiredRank: 27,
    statBonuses: { wisdom: 16, serenity: 12, focus: 11, discipline: 10, compassion: 10 },
    meditationBonus: 0.3,
    teaBonus: 0.25,
    bonsaiBonus: 0.25,
    icon: '🧘',
    color: '#6A5ACD',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Possessing deep wisdom, the sage sees the interconnectedness of all things.',
    requiredRank: 33,
    statBonuses: { wisdom: 22, serenity: 16, focus: 14, discipline: 13, compassion: 14 },
    meditationBonus: 0.4,
    teaBonus: 0.3,
    bonsaiBonus: 0.3,
    icon: '🦉',
    color: '#483D8B',
  },
  {
    id: 'master',
    name: 'Master',
    description: 'A true master of Zen whose presence brings peace and clarity to the temple.',
    requiredRank: 38,
    statBonuses: { wisdom: 28, serenity: 22, focus: 18, discipline: 16, compassion: 18 },
    meditationBonus: 0.5,
    teaBonus: 0.4,
    bonsaiBonus: 0.4,
    icon: '⚔️',
    color: '#8B0000',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    description: 'The highest earthly rank, the grandmaster embodies Zen in every action and thought.',
    requiredRank: 44,
    statBonuses: { wisdom: 35, serenity: 28, focus: 24, discipline: 22, compassion: 24 },
    meditationBonus: 0.65,
    teaBonus: 0.5,
    bonsaiBonus: 0.5,
    icon: '🏔️',
    color: '#B8860B',
  },
  {
    id: 'zen_master',
    name: 'Zen Master',
    description: 'Having transcended all earthly ranks, the Zen Master exists in perfect harmony with the universe.',
    requiredRank: 50,
    statBonuses: { wisdom: 50, serenity: 40, focus: 35, discipline: 30, compassion: 35 },
    meditationBonus: 1.0,
    teaBonus: 0.75,
    bonsaiBonus: 0.75,
    icon: '☯️',
    color: '#FFD700',
  },
];

// ---------------------------------------------------------------------------
// Temple Room Definitions (8 rooms)
// ---------------------------------------------------------------------------

const ZT_ROOMS: ZtRoomDef[] = [
  {
    id: 'meditation_hall',
    name: 'Meditation Hall',
    description: 'The heart of the temple where monks gather for deep meditation and communal practice.',
    baseBenefits: { wisdom: 2, serenity: 3, focus: 2, discipline: 1, compassion: 1 },
    levelScaling: { wisdom: 2, serenity: 3, focus: 2, discipline: 1, compassion: 1 },
    unlockRank: 1,
    icon: '🧘',
    color: '#8B4513',
  },
  {
    id: 'tea_garden',
    name: 'Tea Garden',
    description: 'A serene garden where tea ceremonies are performed and guests are welcomed with harmony.',
    baseBenefits: { wisdom: 1, serenity: 3, focus: 1, discipline: 1, compassion: 3 },
    levelScaling: { wisdom: 1, serenity: 3, focus: 1, discipline: 1, compassion: 3 },
    unlockRank: 1,
    icon: '🍵',
    color: '#228B22',
  },
  {
    id: 'script_library',
    name: 'Script Library',
    description: 'An ancient library housing scrolls of wisdom, koans, and sacred teachings.',
    baseBenefits: { wisdom: 4, serenity: 1, focus: 2, discipline: 2, compassion: 0 },
    levelScaling: { wisdom: 4, serenity: 1, focus: 2, discipline: 2, compassion: 0 },
    unlockRank: 2,
    icon: '📚',
    color: '#8B6914',
  },
  {
    id: 'zen_garden',
    name: 'Zen Garden',
    description: 'A carefully raked sand garden with stones representing mountains and islands.',
    baseBenefits: { wisdom: 1, serenity: 4, focus: 1, discipline: 1, compassion: 2 },
    levelScaling: { wisdom: 1, serenity: 4, focus: 1, discipline: 1, compassion: 2 },
    unlockRank: 3,
    icon: '🎋',
    color: '#C2B280',
  },
  {
    id: 'bell_tower',
    name: 'Bell Tower',
    description: 'A towering structure housing the great temple bell whose sound purifies the mind.',
    baseBenefits: { wisdom: 2, serenity: 2, focus: 3, discipline: 2, compassion: 1 },
    levelScaling: { wisdom: 2, serenity: 2, focus: 3, discipline: 2, compassion: 1 },
    unlockRank: 5,
    icon: '🔔',
    color: '#B8860B',
  },
  {
    id: 'incense_room',
    name: 'Incense Room',
    description: 'A room dedicated to the preparation and burning of sacred incense blends.',
    baseBenefits: { wisdom: 1, serenity: 3, focus: 2, discipline: 3, compassion: 1 },
    levelScaling: { wisdom: 1, serenity: 3, focus: 2, discipline: 3, compassion: 1 },
    unlockRank: 7,
    icon: '🪔',
    color: '#D2691E',
  },
  {
    id: 'dojo',
    name: 'Dojo',
    description: 'A training hall where monks practice martial arts to discipline body and mind.',
    baseBenefits: { wisdom: 1, serenity: 1, focus: 3, discipline: 4, compassion: 1 },
    levelScaling: { wisdom: 1, serenity: 1, focus: 3, discipline: 4, compassion: 1 },
    unlockRank: 10,
    icon: '⚔️',
    color: '#A52A2A',
  },
  {
    id: 'enlightenment_chamber',
    name: 'Enlightenment Chamber',
    description: 'The most sacred room in the temple, reserved for monks nearing enlightenment.',
    baseBenefits: { wisdom: 3, serenity: 5, focus: 3, discipline: 3, compassion: 3 },
    levelScaling: { wisdom: 3, serenity: 5, focus: 3, discipline: 3, compassion: 3 },
    unlockRank: 15,
    icon: '✨',
    color: '#FFD700',
  },
];

// ---------------------------------------------------------------------------
// Meditation Technique Definitions (12 techniques)
// ---------------------------------------------------------------------------

const ZT_MEDITATION_TECHNIQUES: ZtMeditationDef[] = [
  {
    id: 'breath_counting',
    name: 'Breath Counting',
    description: 'The fundamental practice of counting each breath to anchor the mind in the present moment.',
    baseXp: 10,
    baseDuration: 5,
    statFocus: 'focus',
    unlockRank: 1,
    icon: '🌬️',
    depthMultiplier: 1.2,
  },
  {
    id: 'walking_meditation',
    name: 'Walking Meditation',
    description: 'Slow, mindful walking that cultivates awareness of each step and the ground beneath.',
    baseXp: 12,
    baseDuration: 10,
    statFocus: 'discipline',
    unlockRank: 1,
    icon: '🚶',
    depthMultiplier: 1.15,
  },
  {
    id: 'koan_contemplation',
    name: 'Koan Contemplation',
    description: 'Deep reflection on paradoxical riddles that transcend logical thought.',
    baseXp: 18,
    baseDuration: 15,
    statFocus: 'wisdom',
    unlockRank: 3,
    icon: '🤔',
    depthMultiplier: 1.3,
  },
  {
    id: 'body_scan',
    name: 'Body Scan',
    description: 'Systematic attention to each part of the body, releasing tension and finding stillness.',
    baseXp: 14,
    baseDuration: 12,
    statFocus: 'serenity',
    unlockRank: 2,
    icon: '🧍',
    depthMultiplier: 1.18,
  },
  {
    id: 'loving_kindness',
    name: 'Loving Kindness',
    description: 'Cultivating unconditional love and compassion for all sentient beings.',
    baseXp: 16,
    baseDuration: 10,
    statFocus: 'compassion',
    unlockRank: 2,
    icon: '💛',
    depthMultiplier: 1.25,
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'Creating vivid mental images of peaceful landscapes to calm and focus the mind.',
    baseXp: 15,
    baseDuration: 8,
    statFocus: 'wisdom',
    unlockRank: 4,
    icon: '🏔️',
    depthMultiplier: 1.22,
  },
  {
    id: 'mantra_chanting',
    name: 'Mantra Chanting',
    description: 'Repetition of sacred syllables to still the mind and open the heart.',
    baseXp: 13,
    baseDuration: 7,
    statFocus: 'focus',
    unlockRank: 5,
    icon: '📿',
    depthMultiplier: 1.2,
  },
  {
    id: 'silent_illumination',
    name: 'Silent Illumination',
    description: 'Just sitting in pure awareness without any object of meditation.',
    baseXp: 22,
    baseDuration: 20,
    statFocus: 'serenity',
    unlockRank: 8,
    icon: '🌑',
    depthMultiplier: 1.35,
  },
  {
    id: 'mindful_eating',
    name: 'Mindful Eating',
    description: 'Bringing full awareness to the act of eating, savoring each bite with gratitude.',
    baseXp: 11,
    baseDuration: 6,
    statFocus: 'compassion',
    unlockRank: 3,
    icon: '🍱',
    depthMultiplier: 1.12,
  },
  {
    id: 'zen_archery',
    name: 'Zen Archery',
    description: 'The art of shooting an arrow with complete mindfulness and no attachment to the result.',
    baseXp: 20,
    baseDuration: 15,
    statFocus: 'discipline',
    unlockRank: 10,
    icon: '🏹',
    depthMultiplier: 1.3,
  },
  {
    id: 'calligraphy_focus',
    name: 'Calligraphy Focus',
    description: 'Practicing the art of brush calligraphy as a moving meditation.',
    baseXp: 17,
    baseDuration: 12,
    statFocus: 'focus',
    unlockRank: 7,
    icon: '🖌️',
    depthMultiplier: 1.25,
  },
  {
    id: 'nature_awareness',
    name: 'Nature Awareness',
    description: 'Meditating outdoors, fully present to the sounds, sights, and sensations of nature.',
    baseXp: 19,
    baseDuration: 14,
    statFocus: 'serenity',
    unlockRank: 6,
    icon: '🌳',
    depthMultiplier: 1.28,
  },
];

// ---------------------------------------------------------------------------
// Zen Koan Definitions (30 koans across 4 tiers)
// ---------------------------------------------------------------------------

const ZT_KOANS: ZtKoanDef[] = [
  // Tier 1 — Beginner Koans (8)
  {
    id: 'two_hands_clapping',
    question: 'What is the sound of one hand clapping?',
    answer: 'The sound of silence itself, heard when the mind ceases to divide.',
    tier: 1,
    enlightenmentReward: 2,
    xpReward: 15,
    unlockRank: 1,
  },
  {
    id: 'empty_cup',
    question: 'A monk came to the master with a full cup. The master poured tea until it overflowed. What does this mean?',
    answer: 'You must empty your cup before it can be filled with new wisdom.',
    tier: 1,
    enlightenmentReward: 2,
    xpReward: 15,
    unlockRank: 1,
  },
  {
    id: 'pointing_moon',
    question: 'The finger points at the moon, but the fool looks at the finger. What is the moon?',
    answer: 'Truth itself, which cannot be grasped by merely pointing at it.',
    tier: 1,
    enlightenmentReward: 3,
    xpReward: 18,
    unlockRank: 2,
  },
  {
    id: 'oak_in_acorn',
    question: 'Where is the oak tree hidden in the acorn?',
    answer: 'It is not hidden. The acorn IS the oak tree in potential form.',
    tier: 1,
    enlightenmentReward: 2,
    xpReward: 15,
    unlockRank: 2,
  },
  {
    id: 'river_flow',
    question: 'Can you step into the same river twice?',
    answer: 'No, for the river is never the same, and neither are you.',
    tier: 1,
    enlightenmentReward: 3,
    xpReward: 18,
    unlockRank: 3,
  },
  {
    id: 'mirror_reflection',
    question: 'When the mirror reflects the face, which is real — the face or the reflection?',
    answer: 'Neither is more real than the other; both are expressions of the same emptiness.',
    tier: 1,
    enlightenmentReward: 2,
    xpReward: 15,
    unlockRank: 3,
  },
  {
    id: 'footprints_bird',
    question: 'A bird leaves no footprints in the sky. How does one live without leaving traces?',
    answer: 'By moving through life without attachment, like wind through empty space.',
    tier: 1,
    enlightenmentReward: 3,
    xpReward: 18,
    unlockRank: 4,
  },
  {
    id: 'mountain_silence',
    question: 'What does the mountain say when no one is listening?',
    answer: 'The mountain never stops speaking. It is the listener who must become silent.',
    tier: 1,
    enlightenmentReward: 3,
    xpReward: 20,
    unlockRank: 4,
  },
  // Tier 2 — Intermediate Koans (8)
  {
    id: 'bodhidharma_wall',
    question: 'Bodhidharma faced the wall for nine years. What did he see?',
    answer: 'He saw the wall that exists within every mind, and then he became the wall.',
    tier: 2,
    enlightenmentReward: 5,
    xpReward: 30,
    unlockRank: 8,
  },
  {
    id: 'muddy_road',
    question: 'Two monks carried a woman across a muddy road. The younger monk was troubled all day. Why?',
    answer: 'The elder monk set her down at the road. The younger monk still carries her in his mind.',
    tier: 2,
    enlightenmentReward: 5,
    xpReward: 30,
    unlockRank: 9,
  },
  {
    id: 'empty_boat',
    question: 'If an empty boat drifts and bumps your boat, you are not angry. Why?',
    answer: 'When you empty yourself of ego, no bump can disturb your peace.',
    tier: 2,
    enlightenmentReward: 6,
    xpReward: 35,
    unlockRank: 10,
  },
  {
    id: 'kill_buddha',
    question: 'If you meet the Buddha, kill him. What does this mean?',
    answer: 'Do not cling even to the concept of enlightenment. Truth lies beyond all concepts.',
    tier: 2,
    enlightenmentReward: 7,
    xpReward: 35,
    unlockRank: 11,
  },
  {
    id: 'not_mind',
    question: 'What is the Buddha nature? Show me your original face before your parents were born.',
    answer: 'It is the face you wear when you stop looking for it.',
    tier: 2,
    enlightenmentReward: 6,
    xpReward: 32,
    unlockRank: 12,
  },
  {
    id: 'everyday_mind',
    question: 'What is the way? The everyday mind is the way. How do I follow it?',
    answer: 'When you try to follow it, you are already separated from it.',
    tier: 2,
    enlightenmentReward: 7,
    xpReward: 38,
    unlockRank: 13,
  },
  {
    id: 'fire_log',
    question: 'When the fire goes out, where does the flame go?',
    answer: 'The flame does not go anywhere. It was never a fixed thing to begin with.',
    tier: 2,
    enlightenmentReward: 6,
    xpReward: 33,
    unlockRank: 14,
  },
  {
    id: 'without_words',
    question: 'Can you convey the deepest truth without a single word?',
    answer: 'By holding out a flower and smiling — as the Buddha did on Vulture Peak.',
    tier: 2,
    enlightenmentReward: 8,
    xpReward: 40,
    unlockRank: 15,
  },
  // Tier 3 — Advanced Koans (8)
  {
    id: 'mu',
    question: 'Does a dog have Buddha nature? Answer Mu (No/Nothing).',
    answer: 'Mu is not a denial. It is the sound of the great bell shattering all dualistic thinking.',
    tier: 3,
    enlightenmentReward: 12,
    xpReward: 60,
    unlockRank: 20,
  },
  {
    id: 'wash_bowl',
    question: 'A monk asked Joshu: I have just entered the monastery. Please teach me. Joshu said: Have you eaten your rice? Yes. Then wash your bowl. What is the teaching?',
    answer: 'The entire path of Zen is contained in the simple act of washing your bowl.',
    tier: 3,
    enlightenmentReward: 12,
    xpReward: 60,
    unlockRank: 22,
  },
  {
    id: 'great_death',
    question: 'What is the great death? What is the great life?',
    answer: 'To die to the self is the great death. To live fully in this moment is the great life.',
    tier: 3,
    enlightenmentReward: 14,
    xpReward: 65,
    unlockRank: 24,
  },
  {
    id: 'no_gate',
    question: 'The Gateless Gate has no gate. How does one pass through?',
    answer: 'You are already on the other side. The gate never existed except in your thinking.',
    tier: 3,
    enlightenmentReward: 13,
    xpReward: 62,
    unlockRank: 25,
  },
  {
    id: 'tiger_skin',
    question: 'A monk sat on a tiger skin and fed the tiger. Was he brave or foolish?',
    answer: 'One who has tamed the tiger of the mind fears neither tigers nor death.',
    tier: 3,
    enlightenmentReward: 15,
    xpReward: 68,
    unlockRank: 27,
  },
  {
    id: 'moon_water',
    question: 'The moon is reflected in a puddle. Which moon should you reach for?',
    answer: 'Reach for neither. The moon in the sky and the moon in the water are one and the same emptiness.',
    tier: 3,
    enlightenmentReward: 14,
    xpReward: 64,
    unlockRank: 28,
  },
  {
    id: 'snow_frost',
    question: 'When snow falls on a hot stove, what happens to the snow?',
    answer: 'Both snow and stove return to their original nature. There is no conflict in emptiness.',
    tier: 3,
    enlightenmentReward: 15,
    xpReward: 70,
    unlockRank: 30,
  },
  {
    id: 'great_way',
    question: 'On the great way, not one in ten thousand arrives. Why is the way so narrow?',
    answer: 'The way is infinitely wide. It is the mind that makes it narrow.',
    tier: 3,
    enlightenmentReward: 16,
    xpReward: 72,
    unlockRank: 32,
  },
  // Tier 4 — Master Koans (6)
  {
    id: 'original_self',
    question: 'Show me your original self before you were born, before the universe was formed.',
    answer: 'That which asks the question and that which answers are one and the same — the unborn self.',
    tier: 4,
    enlightenmentReward: 25,
    xpReward: 120,
    unlockRank: 35,
  },
  {
    id: 'emptiness_form',
    question: 'Form is emptiness, emptiness is form. What is the relationship?',
    answer: 'There is no relationship to understand. You ARE the form that is emptiness.',
    tier: 4,
    enlightenmentReward: 28,
    xpReward: 130,
    unlockRank: 38,
  },
  {
    id: 'thousand_rivers',
    question: 'A thousand rivers flow to the sea, yet the sea is never full. Why?',
    answer: 'Because the sea, like true wisdom, only exists in the act of receiving.',
    tier: 4,
    enlightenmentReward: 30,
    xpReward: 140,
    unlockRank: 40,
  },
  {
    id: 'timeless_now',
    question: 'If past, present, and future all exist simultaneously, where are you?',
    answer: 'I am here — not in time, but as time itself, before the first thought of past or future.',
    tier: 4,
    enlightenmentReward: 32,
    xpReward: 150,
    unlockRank: 42,
  },
  {
    id: 'ultimate_question',
    question: 'What is the question to which the answer is the question itself?',
    answer: 'The question of who is asking. When asked fully, it answers itself.',
    tier: 4,
    enlightenmentReward: 35,
    xpReward: 160,
    unlockRank: 45,
  },
  {
    id: 'sound_silence',
    question: 'What is the sound that is heard before all sounds and after all sounds have ceased?',
    answer: 'It is the sound of your own being — the Dharmakaya, ever present, never absent.',
    tier: 4,
    enlightenmentReward: 40,
    xpReward: 180,
    unlockRank: 48,
  },
];

// ---------------------------------------------------------------------------
// Tea Type Definitions (8 types)
// ---------------------------------------------------------------------------

const ZT_TEA_TYPES: ZtTeaDef[] = [
  {
    id: 'sencha',
    name: 'Sencha',
    description: 'The most popular Japanese green tea, steeped with care to bring out its sweet, grassy notes.',
    serenityBonus: 3,
    focusBonus: 2,
    preparationDifficulty: 1,
    guestPreference: 5,
    unlockRank: 1,
    icon: '🍃',
    color: '#7CCD7C',
  },
  {
    id: 'matcha',
    name: 'Matcha',
    description: 'Finely ground premium green tea powder whisked to a frothy perfection.',
    serenityBonus: 5,
    focusBonus: 4,
    preparationDifficulty: 3,
    guestPreference: 8,
    unlockRank: 3,
    icon: '🍵',
    color: '#4CAF50',
  },
  {
    id: 'gyokuro',
    name: 'Gyokuro',
    description: 'Shade-grown premium tea with a deep umami flavor and rich jade color.',
    serenityBonus: 8,
    focusBonus: 6,
    preparationDifficulty: 4,
    guestPreference: 9,
    unlockRank: 10,
    icon: '💎',
    color: '#2E8B57',
  },
  {
    id: 'hojicha',
    name: 'Hojicha',
    description: 'Roasted green tea with a warm, nutty flavor that soothes the evening soul.',
    serenityBonus: 6,
    focusBonus: 3,
    preparationDifficulty: 2,
    guestPreference: 6,
    unlockRank: 5,
    icon: '🌰',
    color: '#8B6914',
  },
  {
    id: 'genmaicha',
    name: 'Genmaicha',
    description: 'Green tea blended with roasted rice, offering a comforting, popcorn-like warmth.',
    serenityBonus: 4,
    focusBonus: 2,
    preparationDifficulty: 2,
    guestPreference: 7,
    unlockRank: 2,
    icon: '🌾',
    color: '#DAA520',
  },
  {
    id: 'bancha',
    name: 'Bancha',
    description: 'A humble, everyday tea harvested late in the season with a mild, earthy taste.',
    serenityBonus: 2,
    focusBonus: 1,
    preparationDifficulty: 1,
    guestPreference: 3,
    unlockRank: 1,
    icon: '🌿',
    color: '#8FBC8F',
  },
  {
    id: 'kukicha',
    name: 'Kukicha',
    description: 'Made from stems and twigs of the tea plant, with a sweet, creamy flavor.',
    serenityBonus: 4,
    focusBonus: 3,
    preparationDifficulty: 2,
    guestPreference: 5,
    unlockRank: 7,
    icon: '🎋',
    color: '#9ACD32',
  },
  {
    id: 'shincha',
    name: 'Shincha',
    description: 'The rare first flush of the year, prized for its vibrant freshness and sweetness.',
    serenityBonus: 10,
    focusBonus: 8,
    preparationDifficulty: 5,
    guestPreference: 10,
    unlockRank: 15,
    icon: '🌸',
    color: '#FFB7C5',
  },
];

// ---------------------------------------------------------------------------
// Bonsai Species Definitions (15 species)
// ---------------------------------------------------------------------------

const ZT_BONSAI_SPECIES: ZtBonsaiDef[] = [
  {
    id: 'juniper',
    name: 'Juniper',
    description: 'The most classic bonsai, symbolizing strength and resilience with its gnarled trunk.',
    growthRate: 1.0,
    maxHealth: 100,
    baseScore: 10,
    unlockRank: 1,
    preferredSeason: 'spring',
    icon: '🌲',
    color: '#2E8B57',
  },
  {
    id: 'pine',
    name: 'Japanese Black Pine',
    description: 'A majestic pine representing longevity and endurance in the bonsai tradition.',
    growthRate: 0.8,
    maxHealth: 120,
    baseScore: 15,
    unlockRank: 1,
    preferredSeason: 'winter',
    icon: '🌲',
    color: '#006400',
  },
  {
    id: 'maple',
    name: 'Japanese Maple',
    description: 'Famous for its stunning autumn foliage, the maple brings seasonal beauty to any collection.',
    growthRate: 1.1,
    maxHealth: 90,
    baseScore: 12,
    unlockRank: 3,
    preferredSeason: 'autumn',
    icon: '🍁',
    color: '#DC143C',
  },
  {
    id: 'cherry_blossom',
    name: 'Cherry Blossom',
    description: 'The beloved sakura, symbolizing the ephemeral beauty of life with its fleeting spring blooms.',
    growthRate: 1.2,
    maxHealth: 80,
    baseScore: 14,
    unlockRank: 5,
    preferredSeason: 'spring',
    icon: '🌸',
    color: '#FFB7C5',
  },
  {
    id: 'plum',
    name: 'Plum Blossom',
    description: 'Blooming bravely in winter, the plum represents perseverance and the arrival of spring.',
    growthRate: 0.9,
    maxHealth: 95,
    baseScore: 13,
    unlockRank: 7,
    preferredSeason: 'winter',
    icon: '🌺',
    color: '#FF69B4',
  },
  {
    id: 'elm',
    name: 'Chinese Elm',
    description: 'A hardy and forgiving tree, ideal for beginners learning the art of bonsai shaping.',
    growthRate: 1.3,
    maxHealth: 110,
    baseScore: 8,
    unlockRank: 1,
    preferredSeason: 'summer',
    icon: '🌳',
    color: '#3CB371',
  },
  {
    id: 'cedar',
    name: 'Cedar',
    description: 'An aromatic evergreen that grows slowly but develops magnificent character over decades.',
    growthRate: 0.6,
    maxHealth: 130,
    baseScore: 18,
    unlockRank: 10,
    preferredSeason: 'autumn',
    icon: '🏔️',
    color: '#556B2F',
  },
  {
    id: 'cypress',
    name: 'Bald Cypress',
    description: 'A unique deciduous conifer that develops beautiful buttressed roots when grown in wet conditions.',
    growthRate: 0.9,
    maxHealth: 100,
    baseScore: 16,
    unlockRank: 12,
    preferredSeason: 'summer',
    icon: '🌿',
    color: '#228B22',
  },
  {
    id: 'bamboo',
    name: 'Bamboo',
    description: 'Symbolizing flexibility and strength, bamboo grows in sections with graceful elegance.',
    growthRate: 1.5,
    maxHealth: 85,
    baseScore: 11,
    unlockRank: 2,
    preferredSeason: 'spring',
    icon: '🎋',
    color: '#9ACD32',
  },
  {
    id: 'willow',
    name: 'Weeping Willow',
    description: 'With its cascading branches, the willow creates a sense of peaceful contemplation.',
    growthRate: 1.4,
    maxHealth: 75,
    baseScore: 12,
    unlockRank: 4,
    preferredSeason: 'summer',
    icon: '🌿',
    color: '#8FBC8F',
  },
  {
    id: 'oak',
    name: 'Oak',
    description: 'A symbol of power and endurance, the oak develops massive trunks and distinctive lobed leaves.',
    growthRate: 0.7,
    maxHealth: 140,
    baseScore: 20,
    unlockRank: 15,
    preferredSeason: 'autumn',
    icon: '🌳',
    color: '#8B4513',
  },
  {
    id: 'wisteria',
    name: 'Wisteria',
    description: 'A breathtaking vine that produces cascading clusters of fragrant purple flowers in spring.',
    growthRate: 1.1,
    maxHealth: 90,
    baseScore: 17,
    unlockRank: 18,
    preferredSeason: 'spring',
    icon: '💜',
    color: '#9370DB',
  },
  {
    id: 'azalea',
    name: 'Satsuki Azalea',
    description: 'A flowering bonsai that produces masses of vivid blooms in late spring and early summer.',
    growthRate: 1.0,
    maxHealth: 85,
    baseScore: 14,
    unlockRank: 8,
    preferredSeason: 'summer',
    icon: '🌺',
    color: '#FF4500',
  },
  {
    id: 'ginkgo',
    name: 'Ginkgo',
    description: 'An ancient living fossil with distinctive fan-shaped leaves that turn brilliant gold in autumn.',
    growthRate: 0.8,
    maxHealth: 115,
    baseScore: 16,
    unlockRank: 20,
    preferredSeason: 'autumn',
    icon: '🍂',
    color: '#FFD700',
  },
  {
    id: 'ficus',
    name: 'Ficus Retusa',
    description: 'A tropical bonsai with beautiful aerial roots and glossy, dark green leaves.',
    growthRate: 1.2,
    maxHealth: 95,
    baseScore: 13,
    unlockRank: 6,
    preferredSeason: 'summer',
    icon: '🌿',
    color: '#006400',
  },
];

// ---------------------------------------------------------------------------
// Temple Visitor Definitions (20 NPCs)
// ---------------------------------------------------------------------------

const ZT_VISITORS: ZtVisitorDef[] = [
  {
    id: 'wandering_monk',
    name: 'Takeshi',
    title: 'Wandering Monk',
    dialogue: [
      'I have walked a thousand miles seeking the temple of inner peace.',
      'Every step is a meditation. Every breath is a prayer.',
      'May your path be as clear as the mountain stream.',
    ],
    giftType: 'incense',
    giftAmount: 3,
    requestType: 'meditation_guidance',
    reward: { type: 'enlightenment', amount: 5 },
    unlockRank: 1,
    icon: '🚶',
  },
  {
    id: 'tea_merchant',
    name: 'Haruki',
    title: 'Tea Merchant',
    dialogue: [
      'The finest tea leaves from Uji — they carry the essence of the misty hills.',
      'A cup of good tea is worth more than a thousand words of philosophy.',
      'I bring gifts of the leaf. Use them wisely in your ceremonies.',
    ],
    giftType: 'tea_leaves',
    giftAmount: 5,
    requestType: 'tea_purchase',
    reward: { type: 'scrolls', amount: 2 },
    unlockRank: 1,
    icon: '📦',
  },
  {
    id: 'calligrapher',
    name: 'Yuki',
    title: 'Master Calligrapher',
    dialogue: [
      'Each brushstroke is a meditation in motion.',
      'The empty space on the paper is as important as the ink.',
      'I offer you scrolls to record your temple wisdom.',
    ],
    giftType: 'scrolls',
    giftAmount: 2,
    requestType: 'calligraphy_lesson',
    reward: { type: 'enlightenment', amount: 3 },
    unlockRank: 3,
    icon: '🖌️',
  },
  {
    id: 'stone_mason',
    name: 'Kenji',
    title: 'Stone Mason',
    dialogue: [
      'From rough stone, I carve the perfect Zen garden rock.',
      'Patience is the greatest tool a mason can possess.',
      'I bring you stones for your garden and temple construction.',
    ],
    giftType: 'stone',
    giftAmount: 4,
    requestType: 'garden_repair',
    reward: { type: 'tea_leaves', amount: 3 },
    unlockRank: 3,
    icon: '🪨',
  },
  {
    id: 'old_scholar',
    name: 'Sensei Morimoto',
    title: 'Retired Scholar',
    dialogue: [
      'In my youth I sought knowledge. Now I seek only silence.',
      'The greatest lesson I ever learned was how to unlearn.',
      'I have brought you some scrolls of forgotten wisdom.',
    ],
    giftType: 'scrolls',
    giftAmount: 4,
    requestType: 'koan_discussion',
    reward: { type: 'enlightenment', amount: 8 },
    unlockRank: 5,
    icon: '👴',
  },
  {
    id: 'young_student',
    name: 'Akira',
    title: 'Eager Student',
    dialogue: [
      'I wish to learn the ways of Zen! Please teach me, Master.',
      'What must I do to find inner peace?',
      'Thank you for your guidance. I will meditate every day!',
    ],
    giftType: 'incense',
    giftAmount: 1,
    requestType: 'meditation_teaching',
    reward: { type: 'tea_leaves', amount: 2 },
    unlockRank: 2,
    icon: '👦',
  },
  {
    id: 'flower_vendor',
    name: 'Sakura',
    title: 'Flower Vendor',
    dialogue: [
      'Fresh lotus blossoms for the altar — their fragrance elevates the spirit.',
      'Every flower is a sermon on impermanence.',
      'Please accept these flowers for your temple.',
    ],
    giftType: 'incense',
    giftAmount: 2,
    requestType: 'altar_decoration',
    reward: { type: 'stone', amount: 2 },
    unlockRank: 2,
    icon: '💐',
  },
  {
    id: 'traveling_abbott',
    name: 'Abbot Chen',
    title: 'Traveling Abbot',
    dialogue: [
      'I visit temples across the land, sharing wisdom and learning from each.',
      'Your temple radiates a peaceful energy. Continue your noble work.',
      'Accept these sacred scrolls from my monastery.',
    ],
    giftType: 'scrolls',
    giftAmount: 6,
    requestType: 'wisdom_exchange',
    reward: { type: 'enlightenment', amount: 15 },
    unlockRank: 10,
    icon: '🧙',
  },
  {
    id: 'garden_designer',
    name: 'Mei Lin',
    title: 'Garden Designer',
    dialogue: [
      'A garden is not merely plants and stones — it is a living meditation.',
      'The arrangement of rocks in your garden tells a story of mountains and rivers.',
      'I bring stones to help create the perfect landscape.',
    ],
    giftType: 'stone',
    giftAmount: 5,
    requestType: 'garden_design',
    reward: { type: 'tea_leaves', amount: 4 },
    unlockRank: 5,
    icon: '🌳',
  },
  {
    id: 'incense_maker',
    name: 'Hiro',
    title: 'Incense Artisan',
    dialogue: [
      'Each stick of incense I make carries a specific intention.',
      'Sandalwood for clarity, cedar for grounding, lotus for purity.',
      'I bring you my finest incense blends for your temple rituals.',
    ],
    giftType: 'incense',
    giftAmount: 6,
    requestType: 'incense_recipe',
    reward: { type: 'scrolls', amount: 3 },
    unlockRank: 4,
    icon: '🪔',
  },
  {
    id: 'pilgrim',
    name: 'Daisuke',
    title: 'Temple Pilgrim',
    dialogue: [
      'I have visited one hundred temples on my pilgrimage.',
      'Each temple teaches something unique about the nature of mind.',
      'Here, I offer what I can to support your temple.',
    ],
    giftType: 'stone',
    giftAmount: 3,
    requestType: 'rest_request',
    reward: { type: 'enlightenment', amount: 5 },
    unlockRank: 4,
    icon: '🚶‍♂️',
  },
  {
    id: 'noblemans_daughter',
    name: 'Lady Hanako',
    title: 'Noblewoman',
    dialogue: [
      'My father sends his regards and these gifts for the temple.',
      'In the court, everyone talks. Here, finally, there is silence.',
      'I wish to learn the art of the tea ceremony.',
    ],
    giftType: 'tea_leaves',
    giftAmount: 8,
    requestType: 'tea_ceremony_request',
    reward: { type: 'enlightenment', amount: 10 },
    unlockRank: 8,
    icon: '👸',
  },
  {
    id: 'woodcutter',
    name: 'Goro',
    title: 'Mountain Woodcutter',
    dialogue: [
      'I fell trees in the morning and meditate in the evening.',
      'The rhythm of the axe is its own kind of zazen.',
      'I brought some fine wood for your temple repairs.',
    ],
    giftType: 'stone',
    giftAmount: 4,
    requestType: 'tool_sharpening',
    reward: { type: 'incense', amount: 3 },
    unlockRank: 3,
    icon: '🪓',
  },
  {
    id: 'musician',
    name: 'Rin',
    title: 'Shakuhachi Player',
    dialogue: [
      'The shakuhachi was once played by komuso monks as a form of meditation.',
      'Each note is a breath. Between the notes lies the silence.',
      'May my music bring peace to your temple.',
    ],
    giftType: 'incense',
    giftAmount: 2,
    requestType: 'performance_request',
    reward: { type: 'enlightenment', amount: 7 },
    unlockRank: 6,
    icon: '🎵',
  },
  {
    id: 'fisherman',
    name: 'Jiro',
    title: 'River Fisherman',
    dialogue: [
      'Fishing is meditation. You must be completely still and completely present.',
      'The river teaches patience and the impermanence of all things.',
      'I caught some fine fish for the temple kitchen today.',
    ],
    giftType: 'tea_leaves',
    giftAmount: 3,
    requestType: 'story_sharing',
    reward: { type: 'stone', amount: 2 },
    unlockRank: 2,
    icon: '🎣',
  },
  {
    id: 'samurai',
    name: 'Lord Takeda',
    title: 'Ronin Samurai',
    dialogue: [
      'I once fought in a hundred battles. Now I seek a different kind of victory.',
      'The truest sword is the one that remains in its sheath.',
      'I offer these resources to support the temple that saved my spirit.',
    ],
    giftType: 'scrolls',
    giftAmount: 5,
    requestType: 'meditation_instruction',
    reward: { type: 'enlightenment', amount: 12 },
    unlockRank: 12,
    icon: '⚔️',
  },
  {
    id: 'healer',
    name: 'Dr. Kato',
    title: 'Herbal Healer',
    dialogue: [
      'The body and mind are one. Heal one and the other follows.',
      'I bring herbs and remedies to strengthen the monks.',
      'Meditation is the greatest medicine, but a little tea helps too.',
    ],
    giftType: 'tea_leaves',
    giftAmount: 5,
    requestType: 'herbal_consultation',
    reward: { type: 'incense', amount: 4 },
    unlockRank: 7,
    icon: '💊',
  },
  {
    id: 'potter',
    name: 'Shin',
    title: 'Master Potter',
    dialogue: [
      'The art of pottery is like meditation — you must center the clay before you shape it.',
      'Each bowl I make carries a piece of my spirit within it.',
      'I bring tea bowls for your ceremonies.',
    ],
    giftType: 'stone',
    giftAmount: 3,
    requestType: 'bowl_order',
    reward: { type: 'tea_leaves', amount: 5 },
    unlockRank: 6,
    icon: '🏺',
  },
  {
    id: 'poet',
    name: 'Basho Junior',
    title: 'Haiku Poet',
    dialogue: [
      'An old silent pond / A frog jumps into the pond / Splash! Silence again.',
      'I seek haiku moments in your temple to compose new verses.',
      'Here is a scroll of my latest poems for your library.',
    ],
    giftType: 'scrolls',
    giftAmount: 3,
    requestType: 'poetry_reading',
    reward: { type: 'enlightenment', amount: 6 },
    unlockRank: 5,
    icon: '📝',
  },
  {
    id: 'enlightened_master',
    name: 'Roshi Tanaka',
    title: 'Enlightened Master',
    dialogue: [
      'I have been where you are going. The view from here is the same as from there.',
      'Enlightenment is not a destination — it is the realization that there is nowhere to go.',
      'Accept this gift of enlightenment, and share it freely with all who seek.',
    ],
    giftType: 'enlightenment',
    giftAmount: 10,
    requestType: 'final_teaching',
    reward: { type: 'enlightenment', amount: 25 },
    unlockRank: 20,
    icon: '☯️',
  },
];

// ---------------------------------------------------------------------------
// Achievement Definitions (15 achievements)
// ---------------------------------------------------------------------------

const ZT_ACHIEVEMENTS: ZtAchievementDef[] = [
  {
    id: 'first_meditation',
    name: 'First Steps',
    description: 'Complete your first meditation session.',
    icon: '🧘',
    target: 1,
    rewardXp: 20,
    rewardResource: 'incense',
    rewardAmount: 2,
  },
  {
    id: 'ten_meditations',
    name: 'Dedicated Practitioner',
    description: 'Complete 10 meditation sessions.',
    icon: '📿',
    target: 10,
    rewardXp: 80,
    rewardResource: 'tea_leaves',
    rewardAmount: 5,
  },
  {
    id: 'fifty_meditations',
    name: 'Zen Adept',
    description: 'Complete 50 meditation sessions.',
    icon: '🧘‍♂️',
    target: 50,
    rewardXp: 300,
    rewardResource: 'scrolls',
    rewardAmount: 10,
  },
  {
    id: 'first_koan',
    name: 'Riddle Awakened',
    description: 'Solve your first koan.',
    icon: '💭',
    target: 1,
    rewardXp: 30,
    rewardResource: 'enlightenment',
    rewardAmount: 5,
  },
  {
    id: 'ten_koans',
    name: 'Koan Scholar',
    description: 'Solve 10 koans.',
    icon: '🧠',
    target: 10,
    rewardXp: 200,
    rewardResource: 'enlightenment',
    rewardAmount: 20,
  },
  {
    id: 'all_koans',
    name: 'All Koans Transcended',
    description: 'Solve all 30 koans.',
    icon: '✨',
    target: 30,
    rewardXp: 1000,
    rewardResource: 'enlightenment',
    rewardAmount: 100,
  },
  {
    id: 'first_tea',
    name: 'Tea Ceremony Initiate',
    description: 'Perform your first tea ceremony.',
    icon: '🍵',
    target: 1,
    rewardXp: 15,
    rewardResource: 'tea_leaves',
    rewardAmount: 3,
  },
  {
    id: 'tea_master',
    name: 'Master of the Way of Tea',
    description: 'Perform 50 tea ceremonies total.',
    icon: '🏆',
    target: 50,
    rewardXp: 400,
    rewardResource: 'enlightenment',
    rewardAmount: 30,
  },
  {
    id: 'first_bonsai',
    name: 'First Bonsai',
    description: 'Plant your first bonsai tree.',
    icon: '🌱',
    target: 1,
    rewardXp: 25,
    rewardResource: 'stone',
    rewardAmount: 3,
  },
  {
    id: 'bonsai_exhibition',
    name: 'Exhibition Champion',
    description: 'Exhibit a bonsai tree with a score of 80 or higher.',
    icon: '🏅',
    target: 1,
    rewardXp: 200,
    rewardResource: 'enlightenment',
    rewardAmount: 15,
  },
  {
    id: 'all_rooms_max',
    name: 'Temple Grandeur',
    description: 'Upgrade all 8 temple rooms to maximum level.',
    icon: '🏯',
    target: 8,
    rewardXp: 800,
    rewardResource: 'enlightenment',
    rewardAmount: 50,
  },
  {
    id: 'rank_twenty',
    name: 'Rising Monk',
    description: 'Reach monk rank 20.',
    icon: '⬆️',
    target: 20,
    rewardXp: 250,
    rewardResource: 'scrolls',
    rewardAmount: 8,
  },
  {
    id: 'rank_fifty',
    name: 'Ultimate Ascension',
    description: 'Reach the maximum monk rank of 50.',
    icon: '🌟',
    target: 50,
    rewardXp: 2000,
    rewardResource: 'enlightenment',
    rewardAmount: 200,
  },
  {
    id: 'thirty_day_streak',
    name: 'Unwavering Devotion',
    description: 'Maintain a 30-day meditation streak.',
    icon: '🔥',
    target: 30,
    rewardXp: 500,
    rewardResource: 'enlightenment',
    rewardAmount: 40,
  },
  {
    id: 'enlightenment_100',
    name: 'Hundredfold Light',
    description: 'Accumulate 100 total enlightenment points.',
    icon: '💡',
    target: 100,
    rewardXp: 600,
    rewardResource: 'enlightenment',
    rewardAmount: 50,
  },
];

// ---------------------------------------------------------------------------
// Season Definitions (4 seasons)
// ---------------------------------------------------------------------------

const ZT_SEASONS: ZtSeasonEffect[] = [
  {
    season: 'spring',
    meditationMultiplier: 1.1,
    gardenGrowthMultiplier: 1.3,
    teaQualityMultiplier: 1.1,
    visitorFrequency: 1.2,
    resourceBonus: { tea_leaves: 2, incense: 1 },
    icon: '🌸',
    description: 'Cherry blossoms bloom and new growth emerges everywhere.',
  },
  {
    season: 'summer',
    meditationMultiplier: 1.0,
    gardenGrowthMultiplier: 1.5,
    teaQualityMultiplier: 1.0,
    visitorFrequency: 1.0,
    resourceBonus: { tea_leaves: 3, stone: 1 },
    icon: '☀️',
    description: 'Long days and warm nights. Everything grows to fullness.',
  },
  {
    season: 'autumn',
    meditationMultiplier: 1.2,
    gardenGrowthMultiplier: 0.8,
    teaQualityMultiplier: 1.2,
    visitorFrequency: 0.9,
    resourceBonus: { incense: 3, scrolls: 2 },
    icon: '🍂',
    description: 'Leaves turn gold and crimson. A season of reflection and harvest.',
  },
  {
    season: 'winter',
    meditationMultiplier: 1.3,
    gardenGrowthMultiplier: 0.5,
    teaQualityMultiplier: 1.3,
    visitorFrequency: 0.7,
    resourceBonus: { scrolls: 3, stone: 2, enlightenment: 1 },
    icon: '❄️',
    description: 'Snow blankets the temple. The perfect season for deep meditation.',
  },
];

// ---------------------------------------------------------------------------
// Bonsai Growth Stage Definitions (5 stages)
// ---------------------------------------------------------------------------

const ZT_BONSAI_STAGES: ZtBonsaiGrowthStage[] = [
  {
    stage: 0,
    name: 'Seed',
    minProgress: 0,
    icon: '🫘',
    description: 'A tiny seed full of potential, waiting for the right conditions.',
  },
  {
    stage: 1,
    name: 'Sprout',
    minProgress: 20,
    icon: '🌱',
    description: 'The first tender shoot emerges, reaching toward the light.',
  },
  {
    stage: 2,
    name: 'Sapling',
    minProgress: 45,
    icon: '🌿',
    description: 'A young sapling begins to develop its characteristic shape.',
  },
  {
    stage: 3,
    name: 'Young Tree',
    minProgress: 70,
    icon: '🌳',
    description: 'The tree takes on a more defined form with visible branching.',
  },
  {
    stage: 4,
    name: 'Mature Bonsai',
    minProgress: 100,
    icon: '🏯',
    description: 'A fully mature bonsai tree, a living work of art.',
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

function ztCalcXpForRank(rank: number): number {
  return Math.floor(100 * Math.pow(1.25, rank - 1));
}

function ztCalcRoomUpgradeCost(roomId: ZtRoomId, currentLevel: number): Record<ZtResourceId, number> {
  const baseCosts: Record<ZtRoomId, Partial<Record<ZtResourceId, number>>> = {
    meditation_hall: { incense: 5, stone: 3, scrolls: 1 },
    tea_garden: { tea_leaves: 5, stone: 3, incense: 1 },
    script_library: { scrolls: 8, incense: 2, stone: 2 },
    zen_garden: { stone: 10, incense: 2, tea_leaves: 1 },
    bell_tower: { stone: 12, incense: 3, scrolls: 2 },
    incense_room: { incense: 10, scrolls: 3, stone: 2 },
    dojo: { stone: 15, incense: 5, scrolls: 3 },
    enlightenment_chamber: { scrolls: 15, incense: 10, stone: 5, enlightenment: 3, tea_leaves: 5 },
  };
  const base = baseCosts[roomId] ?? {};
  const cost: Record<ZtResourceId, number> = { incense: 0, tea_leaves: 0, scrolls: 0, stone: 0, enlightenment: 0 };
  for (const key of Object.keys(base) as ZtResourceId[]) {
    cost[key] = Math.floor((base[key] ?? 0) * Math.pow(1.5, currentLevel));
  }
  return cost;
}

function ztGetSeasonForDate(date: Date): ZtSeason {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function ztGetDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function ztCreateDefaultRoomState(roomId: ZtRoomId): ZtRoomState {
  const roomDef = ZT_ROOMS.find(r => r.id === roomId)!;
  return {
    level: 0,
    unlocked: roomDef.unlockRank <= 1,
    totalUpgrades: 0,
  };
}

function ztCreateDefaultMeditationSession(technique: ZtMeditationTechnique): ZtMeditationSession {
  return {
    technique,
    depth: 0,
    totalCompleted: 0,
    totalXpEarned: 0,
    bestDepth: 0,
  };
}

function ztCreateDefaultTeaCeremony(teaType: ZtTeaType): ZtTeaCeremony {
  return {
    teaType,
    totalPrepared: 0,
    totalServed: 0,
    guestSatisfaction: 0,
    bestScore: 0,
  };
}

function ztCreateDefaultAchievement(id: ZtAchievementId): ZtAchievementState {
  return {
    unlocked: false,
    progress: 0,
    unlockedAt: null,
  };
}

function ztCreateDefaultDailyChallenge(): ZtDailyChallenge {
  const techniques: ZtMeditationTechnique[] = [
    'breath_counting', 'walking_meditation', 'koan_contemplation', 'body_scan',
    'loving_kindness', 'visualization', 'mantra_chanting', 'silent_illumination',
  ];
  const randomIdx = Math.floor(Math.random() * techniques.length);
  return {
    date: ztGetDateString(),
    completed: false,
    technique: techniques[randomIdx],
    targetDepth: Math.min(3 + Math.floor(Math.random() * 3), ZT_MAX_MEDITATION_DEPTH),
    bonusXp: 25 + Math.floor(Math.random() * 25),
    bonusResources: { incense: 2, tea_leaves: 1 },
  };
}

function ztBuildInitialState(): ZenTempleState {
  const rooms: Record<ZtRoomId, ZtRoomState> = {} as Record<ZtRoomId, ZtRoomState>;
  for (const room of ZT_ROOMS) {
    rooms[room.id] = ztCreateDefaultRoomState(room.id);
  }

  const meditationSessions: Record<ZtMeditationTechnique, ZtMeditationSession> = {} as Record<ZtMeditationTechnique, ZtMeditationSession>;
  for (const tech of ZT_MEDITATION_TECHNIQUES) {
    meditationSessions[tech.id] = ztCreateDefaultMeditationSession(tech.id);
  }

  const koanProgress: Record<string, ZtKoanProgress> = {};
  for (const koan of ZT_KOANS) {
    koanProgress[koan.id] = { koanId: koan.id, solved: false, attempts: 0, solvedAt: null };
  }

  const teaInventory: Record<ZtTeaType, number> = {} as Record<ZtTeaType, number>;
  const teaCeremonies: Record<ZtTeaType, ZtTeaCeremony> = {} as Record<ZtTeaType, ZtTeaCeremony>;
  for (const tea of ZT_TEA_TYPES) {
    teaInventory[tea.id] = tea.id === 'bancha' || tea.id === 'sencha' ? 3 : 0;
    teaCeremonies[tea.id] = ztCreateDefaultTeaCeremony(tea.id);
  }

  const achievements: Record<ZtAchievementId, ZtAchievementState> = {} as Record<ZtAchievementId, ZtAchievementState>;
  for (const ach of ZT_ACHIEVEMENTS) {
    achievements[ach.id] = ztCreateDefaultAchievement(ach.id);
  }

  return {
    level: 1,
    xp: 0,
    xpToNext: ztCalcXpForRank(2),
    totalXp: 0,
    rank: 1,
    monkClass: 'novice',
    stats: { wisdom: 1, serenity: 1, focus: 1, discipline: 1, compassion: 1 },
    currentRoom: 'meditation_hall',
    season: ztGetSeasonForDate(new Date()),
    resources: { incense: 5, tea_leaves: 5, scrolls: 2, stone: 3, enlightenment: 0 },
    enlightenmentPoints: 0,
    rooms,
    meditationSessions,
    koansSolved: [],
    koanProgress,
    teaInventory,
    teaCeremonies,
    teaGuestSatisfaction: 0,
    bonsaiTrees: [],
    bonsaiSlots: 3,
    currentVisitors: [],
    visitorStates: {},
    achievements,
    dailyChallenge: ztCreateDefaultDailyChallenge(),
    streak: { current: 0, best: 0, lastDate: null },
    templeName: 'Temple of the Rising Sun',
    statsTotals: {
      totalMeditationMinutes: 0,
      totalSessions: 0,
      totalKoansSolved: 0,
      totalTeaCeremonies: 0,
      totalBonsaiActions: 0,
      totalVisitorsGreeted: 0,
      totalResourcesGathered: 0,
      totalRoomUpgrades: 0,
      totalEnlightenmentEarned: 0,
    },
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Persistence Functions
// ---------------------------------------------------------------------------

function loadState(): ZenTempleState {
  if (typeof window === 'undefined') return ztBuildInitialState();
  try {
    const saved = localStorage.getItem(ZT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as ZenTempleState;
      return { ...ztBuildInitialState(), ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return ztBuildInitialState();
}

function saveState(state: ZenTempleState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ZT_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore quota errors
  }
}

// ---------------------------------------------------------------------------
// Main Hook
// ---------------------------------------------------------------------------

export default function useZenTemple() {
  const [state, setState] = useState<ZenTempleState>(ztBuildInitialState);

  const update = (newState: ZenTempleState): void => {
    setState(newState);
    saveState(newState);
  };

  // =========================================================================
  // Level & XP Functions (8)
  // =========================================================================

  function ztGetLevel(): number {
    return state.level;
  }

  function ztGetXp(): number {
    return state.xp;
  }

  function ztGetXpToNext(): number {
    return state.xpToNext;
  }

  function ztGetTotalXp(): number {
    return state.totalXp;
  }

  function ztGetRank(): number {
    return state.rank;
  }

  function ztSetRank(rank: number): void {
    const clamped = Math.max(1, Math.min(ZT_MAX_RANK, rank));
    update({
      ...state,
      rank: clamped,
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztGetXpForRank(rank: number): number {
    return ztCalcXpForRank(rank);
  }

  function ztAddXp(amount: number): void {
    const newXp = state.xp + amount;
    const newTotalXp = state.totalXp + amount;
    let newLevel = state.level;
    let newRank = state.rank;
    const newXpToNext = ztCalcXpForRank(newRank + 1);

    while (newXp >= newXpToNext && newRank < ZT_MAX_RANK) {
      newRank++;
      newLevel = newRank;
      // Check monk class upgrades
    }

    const newState: ZenTempleState = {
      ...state,
      xp: newXp,
      totalXp: newTotalXp,
      level: newLevel,
      rank: newRank,
      xpToNext: ztCalcXpForRank(Math.min(newRank + 1, ZT_MAX_RANK)),
      lastPlayed: new Date().toISOString(),
    };

    // Unlock rooms based on new rank
    for (const room of ZT_ROOMS) {
      if (room.unlockRank <= newRank && !newState.rooms[room.id].unlocked) {
        newState.rooms = {
          ...newState.rooms,
          [room.id]: { ...newState.rooms[room.id], unlocked: true },
        };
      }
    }

    update(newState);
  }

  // =========================================================================
  // Monk Class Functions (7)
  // =========================================================================

  function ztGetMonkClass(): ZtMonkClass {
    return state.monkClass;
  }

  function ztGetMonkClassName(): string {
    const classDef = ZT_MONK_CLASSES.find(c => c.id === state.monkClass);
    return classDef ? classDef.name : 'Novice';
  }

  function ztGetMonkClasses(): ZtMonkClassDef[] {
    return ZT_MONK_CLASSES;
  }

  function ztGetAvailableMonkClasses(): ZtMonkClassDef[] {
    return ZT_MONK_CLASSES.filter(c => c.requiredRank <= state.rank);
  }

  function ztSetMonkClass(monkClass: ZtMonkClass): boolean {
    const classDef = ZT_MONK_CLASSES.find(c => c.id === monkClass);
    if (!classDef || classDef.requiredRank > state.rank) return false;
    update({
      ...state,
      monkClass,
      stats: {
        wisdom: 1 + classDef.statBonuses.wisdom,
        serenity: 1 + classDef.statBonuses.serenity,
        focus: 1 + classDef.statBonuses.focus,
        discipline: 1 + classDef.statBonuses.discipline,
        compassion: 1 + classDef.statBonuses.compassion,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztGetMonkClassMeditationBonus(): number {
    const classDef = ZT_MONK_CLASSES.find(c => c.id === state.monkClass);
    return classDef ? classDef.meditationBonus : 0;
  }

  function ztGetMonkClassTeaBonus(): number {
    const classDef = ZT_MONK_CLASSES.find(c => c.id === state.monkClass);
    return classDef ? classDef.teaBonus : 0;
  }

  // =========================================================================
  // Stats Functions (8)
  // =========================================================================

  function ztGetStats(): ZtStats {
    return { ...state.stats };
  }

  function ztGetWisdom(): number {
    return state.stats.wisdom;
  }

  function ztGetSerenity(): number {
    return state.stats.serenity;
  }

  function ztGetFocus(): number {
    return state.stats.focus;
  }

  function ztGetDiscipline(): number {
    return state.stats.discipline;
  }

  function ztGetCompassion(): number {
    return state.stats.compassion;
  }

  function ztAddStat(stat: keyof ZtStats, amount: number): void {
    update({
      ...state,
      stats: { ...state.stats, [stat]: state.stats[stat] + amount },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztGetTotalStatPoints(): number {
    const { wisdom, serenity, focus, discipline, compassion } = state.stats;
    return wisdom + serenity + focus + discipline + compassion;
  }

  // =========================================================================
  // Temple Room Functions (9)
  // =========================================================================

  function ztGetRooms(): ZtRoomDef[] {
    return ZT_ROOMS;
  }

  function ztGetCurrentRoom(): ZtRoomId {
    return state.currentRoom;
  }

  function ztSetCurrentRoom(roomId: ZtRoomId): void {
    update({ ...state, currentRoom: roomId, lastPlayed: new Date().toISOString() });
  }

  function ztGetRoomState(roomId: ZtRoomId): ZtRoomState {
    return state.rooms[roomId] || ztCreateDefaultRoomState(roomId);
  }

  function ztGetRoomLevel(roomId: ZtRoomId): number {
    return state.rooms[roomId]?.level ?? 0;
  }

  function ztIsRoomUnlocked(roomId: ZtRoomId): boolean {
    return state.rooms[roomId]?.unlocked ?? false;
  }

  function ztGetRoomUpgradeCost(roomId: ZtRoomId): Record<ZtResourceId, number> {
    const currentLevel = state.rooms[roomId]?.level ?? 0;
    return ztCalcRoomUpgradeCost(roomId, currentLevel);
  }

  function ztUpgradeRoom(roomId: ZtRoomId): boolean {
    const roomState = state.rooms[roomId];
    if (!roomState || !roomState.unlocked) return false;
    if (roomState.level >= ZT_MAX_ROOM_LEVEL) return false;

    const cost = ztCalcRoomUpgradeCost(roomId, roomState.level);
    // Check if we have enough resources
    for (const key of Object.keys(cost) as ZtResourceId[]) {
      if ((state.resources[key] ?? 0) < cost[key]) return false;
    }

    // Deduct resources
    const newResources = { ...state.resources };
    for (const key of Object.keys(cost) as ZtResourceId[]) {
      newResources[key] -= cost[key];
    }

    const roomDef = ZT_ROOMS.find(r => r.id === roomId);
    const newLevel = roomState.level + 1;

    // Add stat bonuses from room upgrade
    const newStats = { ...state.stats };
    if (roomDef) {
      newStats.wisdom += roomDef.levelScaling.wisdom;
      newStats.serenity += roomDef.levelScaling.serenity;
      newStats.focus += roomDef.levelScaling.focus;
      newStats.discipline += roomDef.levelScaling.discipline;
      newStats.compassion += roomDef.levelScaling.compassion;
    }

    update({
      ...state,
      resources: newResources,
      rooms: {
        ...state.rooms,
        [roomId]: {
          ...roomState,
          level: newLevel,
          totalUpgrades: roomState.totalUpgrades + 1,
        },
      },
      stats: newStats,
      statsTotals: {
        ...state.statsTotals,
        totalRoomUpgrades: state.statsTotals.totalRoomUpgrades + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztGetRoomBenefits(roomId: ZtRoomId): ZtStats {
    const roomDef = ZT_ROOMS.find(r => r.id === roomId);
    if (!roomDef) return { wisdom: 0, serenity: 0, focus: 0, discipline: 0, compassion: 0 };
    const level = state.rooms[roomId]?.level ?? 0;
    return {
      wisdom: roomDef.baseBenefits.wisdom + roomDef.levelScaling.wisdom * level,
      serenity: roomDef.baseBenefits.serenity + roomDef.levelScaling.serenity * level,
      focus: roomDef.baseBenefits.focus + roomDef.levelScaling.focus * level,
      discipline: roomDef.baseBenefits.discipline + roomDef.levelScaling.discipline * level,
      compassion: roomDef.baseBenefits.compassion + roomDef.levelScaling.compassion * level,
    };
  }

  // =========================================================================
  // Meditation Functions (8)
  // =========================================================================

  function ztGetMeditationTechniques(): ZtMeditationDef[] {
    return ZT_MEDITATION_TECHNIQUES;
  }

  function ztGetMeditationSession(technique: ZtMeditationTechnique): ZtMeditationSession {
    return state.meditationSessions[technique] || ztCreateDefaultMeditationSession(technique);
  }

  function ztCompleteMeditation(technique: ZtMeditationTechnique, depth?: number): { xp: number; stats: ZtStats } {
    const techDef = ZT_MEDITATION_TECHNIQUES.find(t => t.id === technique);
    if (!techDef) return { xp: 0, stats: { wisdom: 0, serenity: 0, focus: 0, discipline: 0, compassion: 0 } };

    const sessionDepth = depth ?? Math.min((state.meditationSessions[technique]?.depth ?? 0) + 1, ZT_MAX_MEDITATION_DEPTH);
    const classBonus = ztGetMonkClassMeditationBonus();
    const seasonEffect = ZT_SEASONS.find(s => s.season === state.season);
    const seasonMultiplier = seasonEffect?.meditationMultiplier ?? 1.0;
    const depthMultiplier = Math.pow(techDef.depthMultiplier, sessionDepth - 1);

    const totalXp = Math.floor(techDef.baseXp * depthMultiplier * (1 + classBonus) * seasonMultiplier);

    // Calculate stat gains
    const statGains: ZtStats = { wisdom: 0, serenity: 0, focus: 0, discipline: 0, compassion: 0 };
    const baseStatGain = Math.max(1, Math.floor(sessionDepth * 0.5));
    statGains[techDef.statFocus] = baseStatGain;
    // Small gains to other stats
    for (const stat of ['wisdom', 'serenity', 'focus', 'discipline', 'compassion'] as (keyof ZtStats)[]) {
      if (stat !== techDef.statFocus) {
        statGains[stat] = Math.floor(baseStatGain * 0.2);
      }
    }

    const newStats = { ...state.stats };
    for (const stat of ['wisdom', 'serenity', 'focus', 'discipline', 'compassion'] as (keyof ZtStats)[]) {
      newStats[stat] += statGains[stat];
    }

    const newSession = {
      ...state.meditationSessions[technique],
      depth: sessionDepth,
      totalCompleted: (state.meditationSessions[technique]?.totalCompleted ?? 0) + 1,
      totalXpEarned: (state.meditationSessions[technique]?.totalXpEarned ?? 0) + totalXp,
      bestDepth: Math.max(state.meditationSessions[technique]?.bestDepth ?? 0, sessionDepth),
    };

    update({
      ...state,
      xp: state.xp + totalXp,
      totalXp: state.totalXp + totalXp,
      stats: newStats,
      meditationSessions: { ...state.meditationSessions, [technique]: newSession },
      statsTotals: {
        ...state.statsTotals,
        totalMeditationMinutes: state.statsTotals.totalMeditationMinutes + techDef.baseDuration,
        totalSessions: state.statsTotals.totalSessions + 1,
      },
      lastPlayed: new Date().toISOString(),
    });

    return { xp: totalXp, stats: statGains };
  }

  function ztGetMeditationDepth(technique: ZtMeditationTechnique): number {
    return state.meditationSessions[technique]?.depth ?? 0;
  }

  function ztGetTotalSessions(): number {
    return state.statsTotals.totalSessions;
  }

  function ztGetBestDepth(technique: ZtMeditationTechnique): number {
    return state.meditationSessions[technique]?.bestDepth ?? 0;
  }

  function ztGetTotalMeditationMinutes(): number {
    return state.statsTotals.totalMeditationMinutes;
  }

  function ztIsTechniqueUnlocked(technique: ZtMeditationTechnique): boolean {
    const techDef = ZT_MEDITATION_TECHNIQUES.find(t => t.id === technique);
    return techDef ? techDef.unlockRank <= state.rank : false;
  }

  // =========================================================================
  // Koan Functions (8)
  // =========================================================================

  function ztGetKoans(): ZtKoanDef[] {
    return ZT_KOANS;
  }

  function ztGetKoanById(koanId: string): ZtKoanDef | undefined {
    return ZT_KOANS.find(k => k.id === koanId);
  }

  function ztGetKoansByTier(tier: ZtKoanTier): ZtKoanDef[] {
    return ZT_KOANS.filter(k => k.tier === tier);
  }

  function ztGetKoanProgress(koanId: string): ZtKoanProgress {
    return state.koanProgress[koanId] || { koanId, solved: false, attempts: 0, solvedAt: null };
  }

  function ztIsKoanSolved(koanId: string): boolean {
    return state.koansSolved.includes(koanId);
  }

  function ztAttemptKoan(koanId: string): void {
    update({
      ...state,
      koanProgress: {
        ...state.koanProgress,
        [koanId]: {
          ...state.koanProgress[koanId],
          koanId,
          attempts: (state.koanProgress[koanId]?.attempts ?? 0) + 1,
        },
      },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztSolveKoan(koanId: string): boolean {
    const koanDef = ZT_KOANS.find(k => k.id === koanId);
    if (!koanDef || state.koansSolved.includes(koanId)) return false;

    const newKoanProgress = {
      ...state.koanProgress,
      [koanId]: {
        ...state.koanProgress[koanId],
        koanId,
        solved: true,
        attempts: (state.koanProgress[koanId]?.attempts ?? 0) + 1,
        solvedAt: new Date().toISOString(),
      },
    };

    update({
      ...state,
      koansSolved: [...state.koansSolved, koanId],
      koanProgress: newKoanProgress,
      enlightenmentPoints: state.enlightenmentPoints + koanDef.enlightenmentReward,
      xp: state.xp + koanDef.xpReward,
      totalXp: state.totalXp + koanDef.xpReward,
      resources: {
        ...state.resources,
        enlightenment: state.resources.enlightenment + koanDef.enlightenmentReward,
      },
      statsTotals: {
        ...state.statsTotals,
        totalKoansSolved: state.statsTotals.totalKoansSolved + 1,
        totalEnlightenmentEarned: state.statsTotals.totalEnlightenmentEarned + koanDef.enlightenmentReward,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztGetKoansSolvedCount(): number {
    return state.koansSolved.length;
  }

  // =========================================================================
  // Tea Ceremony Functions (8)
  // =========================================================================

  function ztGetTeaTypes(): ZtTeaDef[] {
    return ZT_TEA_TYPES;
  }

  function ztGetTeaInventory(teaType: ZtTeaType): number {
    return state.teaInventory[teaType] ?? 0;
  }

  function ztGetAllTeaInventory(): Record<ZtTeaType, number> {
    return { ...state.teaInventory };
  }

  function ztAddTea(teaType: ZtTeaType, amount: number): void {
    update({
      ...state,
      teaInventory: {
        ...state.teaInventory,
        [teaType]: (state.teaInventory[teaType] ?? 0) + amount,
      },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztPrepareTea(teaType: ZtTeaType): boolean {
    if ((state.teaInventory[teaType] ?? 0) < 1) return false;

    const teaDef = ZT_TEA_TYPES.find(t => t.id === teaType);
    if (!teaDef) return false;

    const classBonus = ztGetMonkClassTeaBonus();
    const seasonEffect = ZT_SEASONS.find(s => s.season === state.season);
    const seasonMultiplier = seasonEffect?.teaQualityMultiplier ?? 1.0;

    const newStats = { ...state.stats };
    newStats.serenity += Math.floor(teaDef.serenityBonus * (1 + classBonus) * seasonMultiplier);
    newStats.focus += Math.floor(teaDef.focusBonus * (1 + classBonus) * seasonMultiplier);

    update({
      ...state,
      teaInventory: {
        ...state.teaInventory,
        [teaType]: state.teaInventory[teaType] - 1,
      },
      teaCeremonies: {
        ...state.teaCeremonies,
        [teaType]: {
          ...state.teaCeremonies[teaType],
          totalPrepared: state.teaCeremonies[teaType].totalPrepared + 1,
          totalServed: state.teaCeremonies[teaType].totalServed + 1,
        },
      },
      stats: newStats,
      statsTotals: {
        ...state.statsTotals,
        totalTeaCeremonies: state.statsTotals.totalTeaCeremonies + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztGetTeaCeremonyCount(): number {
    return state.statsTotals.totalTeaCeremonies;
  }

  function ztGetTeaGuestSatisfaction(): number {
    return state.teaGuestSatisfaction;
  }

  function ztServeTeaToGuest(teaType: ZtTeaType, visitorId: string): { satisfaction: number; xp: number } | null {
    if ((state.teaInventory[teaType] ?? 0) < 1) return null;

    const teaDef = ZT_TEA_TYPES.find(t => t.id === teaType);
    const visitorDef = ZT_VISITORS.find(v => v.id === visitorId);
    if (!teaDef || !visitorDef) return null;

    const classBonus = ztGetMonkClassTeaBonus();
    const seasonEffect = ZT_SEASONS.find(s => s.season === state.season);
    const seasonMultiplier = seasonEffect?.teaQualityMultiplier ?? 1.0;

    const satisfaction = Math.floor(
      (teaDef.guestPreference * 5 + teaDef.serenityBonus * 2) *
      (1 + classBonus) *
      seasonMultiplier *
      (1 + Math.random() * 0.3)
    );
    const xp = Math.floor(satisfaction * 1.5);

    update({
      ...state,
      teaInventory: {
        ...state.teaInventory,
        [teaType]: state.teaInventory[teaType] - 1,
      },
      teaCeremonies: {
        ...state.teaCeremonies,
        [teaType]: {
          ...state.teaCeremonies[teaType],
          totalServed: state.teaCeremonies[teaType].totalServed + 1,
          guestSatisfaction: Math.max(state.teaCeremonies[teaType].guestSatisfaction, satisfaction),
          bestScore: Math.max(state.teaCeremonies[teaType].bestScore, satisfaction),
        },
      },
      teaGuestSatisfaction: state.teaGuestSatisfaction + satisfaction,
      xp: state.xp + xp,
      totalXp: state.totalXp + xp,
      statsTotals: {
        ...state.statsTotals,
        totalTeaCeremonies: state.statsTotals.totalTeaCeremonies + 1,
      },
      lastPlayed: new Date().toISOString(),
    });

    return { satisfaction, xp };
  }

  // =========================================================================
  // Bonsai Functions (9)
  // =========================================================================

  function ztGetBonsaiSpecies(): ZtBonsaiDef[] {
    return ZT_BONSAI_SPECIES;
  }

  function ztGetBonsaiTrees(): ZtBonsaiTree[] {
    return state.bonsaiTrees;
  }

  function ztGetBonsaiStages(): ZtBonsaiGrowthStage[] {
    return ZT_BONSAI_STAGES;
  }

  function ztGetBonsaiSlots(): number {
    return state.bonsaiSlots;
  }

  function ztPlantBonsai(species: ZtBonsaiSpecies): boolean {
    if (state.bonsaiTrees.length >= state.bonsaiSlots) return false;

    const speciesDef = ZT_BONSAI_SPECIES.find(s => s.id === species);
    if (!speciesDef || speciesDef.unlockRank > state.rank) return false;

    const newTree: ZtBonsaiTree = {
      species,
      growthProgress: 0,
      stage: 0,
      health: speciesDef.maxHealth,
      pruningCount: 0,
      wateringCount: 0,
      lastWatered: null,
      exhibitionScore: 0,
      exhibited: false,
    };

    update({
      ...state,
      bonsaiTrees: [...state.bonsaiTrees, newTree],
      statsTotals: {
        ...state.statsTotals,
        totalBonsaiActions: state.statsTotals.totalBonsaiActions + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztWaterBonsai(treeIndex: number): boolean {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return false;

    const tree = state.bonsaiTrees[treeIndex];
    const speciesDef = ZT_BONSAI_SPECIES.find(s => s.id === tree.species);
    if (!speciesDef) return false;

    const seasonEffect = ZT_SEASONS.find(s => s.season === state.season);
    const seasonMultiplier = seasonEffect?.gardenGrowthMultiplier ?? 1.0;
    const preferredBonus = state.season === speciesDef.preferredSeason ? 1.3 : 1.0;

    const growthAmount = speciesDef.growthRate * 5 * seasonMultiplier * preferredBonus;
    const newProgress = Math.min(tree.growthProgress + growthAmount, 100);

    // Calculate stage
    let newStage = 0;
    for (const stage of ZT_BONSAI_STAGES) {
      if (newProgress >= stage.minProgress) {
        newStage = stage.stage;
      }
    }

    const newTrees = [...state.bonsaiTrees];
    newTrees[treeIndex] = {
      ...tree,
      growthProgress: newProgress,
      stage: newStage,
      health: Math.min(tree.health + 2, speciesDef.maxHealth),
      wateringCount: tree.wateringCount + 1,
      lastWatered: new Date().toISOString(),
    };

    update({
      ...state,
      bonsaiTrees: newTrees,
      statsTotals: {
        ...state.statsTotals,
        totalBonsaiActions: state.statsTotals.totalBonsaiActions + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztPruneBonsai(treeIndex: number): boolean {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return false;

    const tree = state.bonsaiTrees[treeIndex];
    if (tree.pruningCount >= 20) return false; // Max pruning limit

    const newTrees = [...state.bonsaiTrees];
    newTrees[treeIndex] = {
      ...tree,
      pruningCount: tree.pruningCount + 1,
      exhibitionScore: Math.min(tree.exhibitionScore + 3, 100),
    };

    update({
      ...state,
      bonsaiTrees: newTrees,
      statsTotals: {
        ...state.statsTotals,
        totalBonsaiActions: state.statsTotals.totalBonsaiActions + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztShapeBonsai(treeIndex: number): boolean {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return false;

    const tree = state.bonsaiTrees[treeIndex];
    if (tree.stage < 2) return false; // Must be at least sapling

    const speciesDef = ZT_BONSAI_SPECIES.find(s => s.id === tree.species);
    if (!speciesDef) return false;

    const scoreBonus = 5 + Math.floor(tree.stage * 2);
    const newTrees = [...state.bonsaiTrees];
    newTrees[treeIndex] = {
      ...tree,
      exhibitionScore: Math.min(tree.exhibitionScore + scoreBonus, 100),
    };

    update({
      ...state,
      bonsaiTrees: newTrees,
      statsTotals: {
        ...state.statsTotals,
        totalBonsaiActions: state.statsTotals.totalBonsaiActions + 1,
      },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztExhibitBonsai(treeIndex: number): { score: number; xp: number } | null {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return null;

    const tree = state.bonsaiTrees[treeIndex];
    if (tree.stage < 3) return null; // Must be at least Young Tree

    const speciesDef = ZT_BONSAI_SPECIES.find(s => s.id === tree.species);
    if (!speciesDef) return null;

    const healthBonus = Math.floor((tree.health / speciesDef.maxHealth) * 20);
    const stageBonus = tree.stage * 10;
    const pruneBonus = Math.min(tree.pruningCount * 2, 20);
    const totalScore = Math.min(speciesDef.baseScore + tree.exhibitionScore + healthBonus + stageBonus + pruneBonus, 100);
    const xp = Math.floor(totalScore * 2);

    const newTrees = [...state.bonsaiTrees];
    newTrees[treeIndex] = {
      ...tree,
      exhibitionScore: totalScore,
      exhibited: true,
    };

    update({
      ...state,
      bonsaiTrees: newTrees,
      xp: state.xp + xp,
      totalXp: state.totalXp + xp,
      lastPlayed: new Date().toISOString(),
    });

    return { score: totalScore, xp };
  }

  function ztRemoveBonsai(treeIndex: number): boolean {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return false;

    const newTrees = [...state.bonsaiTrees];
    newTrees.splice(treeIndex, 1);

    update({
      ...state,
      bonsaiTrees: newTrees,
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  // =========================================================================
  // Visitor Functions (7)
  // =========================================================================

  function ztGetVisitors(): ZtVisitorDef[] {
    return ZT_VISITORS;
  }

  function ztGetCurrentVisitors(): string[] {
    return state.currentVisitors;
  }

  function ztGetVisitorState(visitorId: string): ZtVisitorState {
    return state.visitorStates[visitorId] || {
      visitorId,
      timesVisited: 0,
      giftsGiven: 0,
      requestsFulfilled: 0,
      lastVisit: null,
    };
  }

  function ztGenerateVisitors(): string[] {
    const eligible = ZT_VISITORS.filter(v => v.unlockRank <= state.rank);
    const seasonEffect = ZT_SEASONS.find(s => s.season === state.season);
    const frequency = seasonEffect?.visitorFrequency ?? 1.0;
    const count = Math.max(1, Math.floor(Math.random() * 3 * frequency));

    const shuffled = [...eligible].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length)).map(v => v.id);

    update({
      ...state,
      currentVisitors: selected,
      lastPlayed: new Date().toISOString(),
    });
    return selected;
  }

  function ztGreetVisitor(visitorId: string): { gift: ZtResourceId | null; amount: number } | null {
    const visitorDef = ZT_VISITORS.find(v => v.id === visitorId);
    if (!visitorDef) return null;

    const visitorState = state.visitorStates[visitorId] || {
      visitorId,
      timesVisited: 0,
      giftsGiven: 0,
      requestsFulfilled: 0,
      lastVisit: null,
    };

    const newResources = { ...state.resources };
    if (visitorDef.giftType) {
      newResources[visitorDef.giftType] = (newResources[visitorDef.giftType] ?? 0) + visitorDef.giftAmount;
    }

    update({
      ...state,
      resources: newResources,
      visitorStates: {
        ...state.visitorStates,
        [visitorId]: {
          ...visitorState,
          timesVisited: visitorState.timesVisited + 1,
          giftsGiven: visitorState.giftsGiven + (visitorDef.giftType ? 1 : 0),
          lastVisit: new Date().toISOString(),
        },
      },
      statsTotals: {
        ...state.statsTotals,
        totalVisitorsGreeted: state.statsTotals.totalVisitorsGreeted + 1,
        totalResourcesGathered: state.statsTotals.totalResourcesGathered + (visitorDef.giftAmount || 0),
      },
      lastPlayed: new Date().toISOString(),
    });

    return { gift: visitorDef.giftType, amount: visitorDef.giftAmount };
  }

  function ztFulfillVisitorRequest(visitorId: string): { reward: ZtResourceId | null; amount: number; xp: number } | null {
    const visitorDef = ZT_VISITORS.find(v => v.id === visitorId);
    if (!visitorDef || !visitorDef.reward) return null;

    const visitorState = state.visitorStates[visitorId];
    if (!visitorState) return null;

    const newResources = { ...state.resources };
    newResources[visitorDef.reward.type] = (newResources[visitorDef.reward.type] ?? 0) + visitorDef.reward.amount;

    const xp = 15 + visitorDef.reward.amount * 3;

    update({
      ...state,
      resources: newResources,
      xp: state.xp + xp,
      totalXp: state.totalXp + xp,
      visitorStates: {
        ...state.visitorStates,
        [visitorId]: {
          ...visitorState,
          requestsFulfilled: visitorState.requestsFulfilled + 1,
        },
      },
      statsTotals: {
        ...state.statsTotals,
        totalResourcesGathered: state.statsTotals.totalResourcesGathered + visitorDef.reward.amount,
      },
      lastPlayed: new Date().toISOString(),
    });

    return { reward: visitorDef.reward.type, amount: visitorDef.reward.amount, xp };
  }

  function ztGetTotalVisitorsGreeted(): number {
    return state.statsTotals.totalVisitorsGreeted;
  }

  // =========================================================================
  // Seasonal Functions (6)
  // =========================================================================

  function ztGetSeason(): ZtSeason {
    return state.season;
  }

  function ztSetSeason(season: ZtSeason): void {
    update({ ...state, season, lastPlayed: new Date().toISOString() });
  }

  function ztGetSeasons(): ZtSeasonEffect[] {
    return ZT_SEASONS;
  }

  function ztGetSeasonEffect(): ZtSeasonEffect {
    const effect = ZT_SEASONS.find(s => s.season === state.season);
    return effect || ZT_SEASONS[0];
  }

  function ztGetMeditationMultiplier(): number {
    const effect = ZT_SEASONS.find(s => s.season === state.season);
    return effect?.meditationMultiplier ?? 1.0;
  }

  function ztGetGardenGrowthMultiplier(): number {
    const effect = ZT_SEASONS.find(s => s.season === state.season);
    return effect?.gardenGrowthMultiplier ?? 1.0;
  }

  // =========================================================================
  // Resource Functions (8)
  // =========================================================================

  function ztGetResources(): Record<ZtResourceId, number> {
    return { ...state.resources };
  }

  function ztGetResource(resource: ZtResourceId): number {
    return state.resources[resource] ?? 0;
  }

  function ztAddResource(resource: ZtResourceId, amount: number): void {
    update({
      ...state,
      resources: { ...state.resources, [resource]: (state.resources[resource] ?? 0) + amount },
      statsTotals: {
        ...state.statsTotals,
        totalResourcesGathered: state.statsTotals.totalResourcesGathered + Math.max(0, amount),
      },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztSpendResource(resource: ZtResourceId, amount: number): boolean {
    if ((state.resources[resource] ?? 0) < amount) return false;
    update({
      ...state,
      resources: { ...state.resources, [resource]: state.resources[resource] - amount },
      lastPlayed: new Date().toISOString(),
    });
    return true;
  }

  function ztGetEnlightenmentPoints(): number {
    return state.enlightenmentPoints;
  }

  function ztAddEnlightenmentPoints(amount: number): void {
    update({
      ...state,
      enlightenmentPoints: state.enlightenmentPoints + amount,
      resources: {
        ...state.resources,
        enlightenment: state.resources.enlightenment + amount,
      },
      statsTotals: {
        ...state.statsTotals,
        totalEnlightenmentEarned: state.statsTotals.totalEnlightenmentEarned + amount,
      },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztGatherSeasonalResources(): Record<ZtResourceId, number> {
    const effect = ZT_SEASONS.find(s => s.season === state.season);
    if (!effect) return { incense: 0, tea_leaves: 0, scrolls: 0, stone: 0, enlightenment: 0 };

    const gathered: Record<ZtResourceId, number> = { incense: 0, tea_leaves: 0, scrolls: 0, stone: 0, enlightenment: 0 };
    for (const [key, amount] of Object.entries(effect.resourceBonus)) {
      gathered[key as ZtResourceId] = amount;
    }

    const newResources = { ...state.resources };
    let totalGathered = 0;
    for (const [key, amount] of Object.entries(gathered)) {
      newResources[key as ZtResourceId] = (newResources[key as ZtResourceId] ?? 0) + amount;
      totalGathered += amount;
    }

    update({
      ...state,
      resources: newResources,
      statsTotals: {
        ...state.statsTotals,
        totalResourcesGathered: state.statsTotals.totalResourcesGathered + totalGathered,
      },
      lastPlayed: new Date().toISOString(),
    });

    return gathered;
  }

  function ztGetTotalResourcesGathered(): number {
    return state.statsTotals.totalResourcesGathered;
  }

  // =========================================================================
  // Achievement Functions (6)
  // =========================================================================

  function ztGetAchievements(): ZtAchievementDef[] {
    return ZT_ACHIEVEMENTS;
  }

  function ztGetAchievementState(achievementId: ZtAchievementId): ZtAchievementState {
    return state.achievements[achievementId] || ztCreateDefaultAchievement(achievementId);
  }

  function ztIsAchievementUnlocked(achievementId: ZtAchievementId): boolean {
    return state.achievements[achievementId]?.unlocked ?? false;
  }

  function ztUpdateAchievementProgress(achievementId: ZtAchievementId, progress: number): boolean {
    const achDef = ZT_ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achDef) return false;

    const current = state.achievements[achievementId];
    if (current?.unlocked) return false;

    const newProgress = Math.min(progress, achDef.target);
    const shouldUnlock = newProgress >= achDef.target;

    const newAchievements = {
      ...state.achievements,
      [achievementId]: {
        ...current,
        progress: newProgress,
        unlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date().toISOString() : null,
      },
    };

    if (shouldUnlock) {
      const newResources = { ...state.resources };
      if (achDef.rewardResource) {
        newResources[achDef.rewardResource] = (newResources[achDef.rewardResource] ?? 0) + achDef.rewardAmount;
      }

      update({
        ...state,
        achievements: newAchievements,
        xp: state.xp + achDef.rewardXp,
        totalXp: state.totalXp + achDef.rewardXp,
        resources: newResources,
        lastPlayed: new Date().toISOString(),
      });
      return true;
    }

    update({
      ...state,
      achievements: newAchievements,
      lastPlayed: new Date().toISOString(),
    });
    return false;
  }

  function ztGetUnlockedAchievementsCount(): number {
    return Object.values(state.achievements).filter(a => a.unlocked).length;
  }

  function ztGetAchievementsProgress(): Record<string, { progress: number; target: number; unlocked: boolean }> {
    const result: Record<string, { progress: number; target: number; unlocked: boolean }> = {};
    for (const ach of ZT_ACHIEVEMENTS) {
      const achState = state.achievements[ach.id];
      result[ach.id] = {
        progress: achState?.progress ?? 0,
        target: ach.target,
        unlocked: achState?.unlocked ?? false,
      };
    }
    return result;
  }

  // =========================================================================
  // Daily Challenge Functions (7)
  // =========================================================================

  function ztGetDailyChallenge(): ZtDailyChallenge {
    const today = ztGetDateString();
    if (state.dailyChallenge.date !== today) {
      const newChallenge = ztCreateDefaultDailyChallenge();
      const newState = { ...state, dailyChallenge: newChallenge };
      setState(newState);
      saveState(newState);
      return newChallenge;
    }
    return state.dailyChallenge;
  }

  function ztIsDailyChallengeCompleted(): boolean {
    const today = ztGetDateString();
    return state.dailyChallenge.date === today && state.dailyChallenge.completed;
  }

  function ztCompleteDailyChallenge(): { bonusXp: number; bonusResources: Partial<Record<ZtResourceId, number>> } | null {
    const today = ztGetDateString();
    if (state.dailyChallenge.date !== today || state.dailyChallenge.completed) return null;

    const challenge = state.dailyChallenge;
    const newResources = { ...state.resources };
    if (challenge.bonusResources) {
      for (const [key, amount] of Object.entries(challenge.bonusResources)) {
        newResources[key as ZtResourceId] = (newResources[key as ZtResourceId] ?? 0) + amount;
      }
    }

    update({
      ...state,
      dailyChallenge: { ...challenge, completed: true },
      xp: state.xp + challenge.bonusXp,
      totalXp: state.totalXp + challenge.bonusXp,
      resources: newResources,
      lastPlayed: new Date().toISOString(),
    });

    return { bonusXp: challenge.bonusXp, bonusResources: challenge.bonusResources };
  }

  // =========================================================================
  // Streak Functions (6)
  // =========================================================================

  function ztGetStreak(): ZtStreakData {
    return { ...state.streak };
  }

  function ztGetCurrentStreak(): number {
    return state.streak.current;
  }

  function ztGetBestStreak(): number {
    return state.streak.best;
  }

  function ztUpdateStreak(): void {
    const today = ztGetDateString();
    if (state.streak.lastDate === today) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    let newCurrent: number;
    if (state.streak.lastDate === yesterdayStr) {
      newCurrent = state.streak.current + 1;
    } else if (state.streak.lastDate === null) {
      newCurrent = 1;
    } else {
      newCurrent = 1; // Streak broken
    }

    const newBest = Math.max(state.streak.best, newCurrent);

    update({
      ...state,
      streak: { current: newCurrent, best: newBest, lastDate: today },
      lastPlayed: new Date().toISOString(),
    });
  }

  function ztGetStreakBonusMultiplier(): number {
    const streak = state.streak.current;
    if (streak >= 30) return 2.0;
    if (streak >= 21) return 1.75;
    if (streak >= 14) return 1.5;
    if (streak >= 7) return 1.25;
    if (streak >= 3) return 1.1;
    return 1.0;
  }

  // =========================================================================
  // Temple Name & Overview (4)
  // =========================================================================

  function ztGetTempleName(): string {
    return state.templeName;
  }

  function ztSetTempleName(name: string): void {
    update({ ...state, templeName: name, lastPlayed: new Date().toISOString() });
  }

  function ztGetStatsTotals(): ZtStatsTotals {
    return { ...state.statsTotals };
  }

  function ztGetOverview(): {
    level: number;
    rank: number;
    monkClass: string;
    season: string;
    sessions: number;
    koansSolved: number;
    achievements: number;
    streak: number;
    bonsaiCount: number;
    templeName: string;
  } {
    return {
      level: state.level,
      rank: state.rank,
      monkClass: ztGetMonkClassName(),
      season: state.season,
      sessions: state.statsTotals.totalSessions,
      koansSolved: state.statsTotals.totalKoansSolved,
      achievements: Object.values(state.achievements).filter(a => a.unlocked).length,
      streak: state.streak.current,
      bonsaiCount: state.bonsaiTrees.length,
      templeName: state.templeName,
    };
  }

  // =========================================================================
  // Reset & State Management (3)
  // =========================================================================

  function ztResetProgress(): void {
    const freshState = ztBuildInitialState();
    update(freshState);
  }

  function ztGetState(): ZenTempleState {
    return state;
  }

  function ztGetCreatedAt(): string {
    return state.createdAt;
  }

  // =========================================================================
  // Additional Utility Functions (9)
  // =========================================================================

  function ztGetBonsaiExhibitionScore(treeIndex: number): number {
    if (treeIndex < 0 || treeIndex >= state.bonsaiTrees.length) return 0;
    return state.bonsaiTrees[treeIndex].exhibitionScore;
  }

  function ztGetTotalBonsaiActions(): number {
    return state.statsTotals.totalBonsaiActions;
  }

  function ztIsTeaUnlocked(teaType: ZtTeaType): boolean {
    const teaDef = ZT_TEA_TYPES.find(t => t.id === teaType);
    return teaDef ? teaDef.unlockRank <= state.rank : false;
  }

  function ztIsBonsaiSpeciesUnlocked(species: ZtBonsaiSpecies): boolean {
    const speciesDef = ZT_BONSAI_SPECIES.find(s => s.id === species);
    return speciesDef ? speciesDef.unlockRank <= state.rank : false;
  }

  function ztIsVisitorUnlocked(visitorId: string): boolean {
    const visitorDef = ZT_VISITORS.find(v => v.id === visitorId);
    return visitorDef ? visitorDef.unlockRank <= state.rank : false;
  }

  function ztIsKoanUnlocked(koanId: string): boolean {
    const koanDef = ZT_KOANS.find(k => k.id === koanId);
    return koanDef ? koanDef.unlockRank <= state.rank : false;
  }

  function ztGetRoomDescription(roomId: ZtRoomId): string {
    const roomDef = ZT_ROOMS.find(r => r.id === roomId);
    return roomDef?.description ?? '';
  }

  function ztGetMonkBonsaiBonus(): number {
    const classDef = ZT_MONK_CLASSES.find(c => c.id === state.monkClass);
    return classDef ? classDef.bonsaiBonus : 0;
  }

  function ztGetTeaQualityMultiplier(): number {
    const effect = ZT_SEASONS.find(s => s.season === state.season);
    return effect?.teaQualityMultiplier ?? 1.0;
  }

  // =========================================================================
  // Return all exports
  // =========================================================================

  return {
    state,
    // Level & XP
    ztGetLevel,
    ztGetXp,
    ztGetXpToNext,
    ztGetTotalXp,
    ztGetRank,
    ztSetRank,
    ztGetXpForRank,
    ztAddXp,
    // Monk Class
    ztGetMonkClass,
    ztGetMonkClassName,
    ztGetMonkClasses,
    ztGetAvailableMonkClasses,
    ztSetMonkClass,
    ztGetMonkClassMeditationBonus,
    ztGetMonkClassTeaBonus,
    // Stats
    ztGetStats,
    ztGetWisdom,
    ztGetSerenity,
    ztGetFocus,
    ztGetDiscipline,
    ztGetCompassion,
    ztAddStat,
    ztGetTotalStatPoints,
    // Temple Rooms
    ztGetRooms,
    ztGetCurrentRoom,
    ztSetCurrentRoom,
    ztGetRoomState,
    ztGetRoomLevel,
    ztIsRoomUnlocked,
    ztGetRoomUpgradeCost,
    ztUpgradeRoom,
    ztGetRoomBenefits,
    // Meditation
    ztGetMeditationTechniques,
    ztGetMeditationSession,
    ztCompleteMeditation,
    ztGetMeditationDepth,
    ztGetTotalSessions,
    ztGetBestDepth,
    ztGetTotalMeditationMinutes,
    ztIsTechniqueUnlocked,
    // Koans
    ztGetKoans,
    ztGetKoanById,
    ztGetKoansByTier,
    ztGetKoanProgress,
    ztIsKoanSolved,
    ztAttemptKoan,
    ztSolveKoan,
    ztGetKoansSolvedCount,
    // Tea Ceremony
    ztGetTeaTypes,
    ztGetTeaInventory,
    ztGetAllTeaInventory,
    ztAddTea,
    ztPrepareTea,
    ztGetTeaCeremonyCount,
    ztGetTeaGuestSatisfaction,
    ztServeTeaToGuest,
    // Bonsai
    ztGetBonsaiSpecies,
    ztGetBonsaiTrees,
    ztGetBonsaiStages,
    ztGetBonsaiSlots,
    ztPlantBonsai,
    ztWaterBonsai,
    ztPruneBonsai,
    ztShapeBonsai,
    ztExhibitBonsai,
    ztRemoveBonsai,
    // Visitors
    ztGetVisitors,
    ztGetCurrentVisitors,
    ztGetVisitorState,
    ztGenerateVisitors,
    ztGreetVisitor,
    ztFulfillVisitorRequest,
    ztGetTotalVisitorsGreeted,
    // Seasons
    ztGetSeason,
    ztSetSeason,
    ztGetSeasons,
    ztGetSeasonEffect,
    ztGetMeditationMultiplier,
    ztGetGardenGrowthMultiplier,
    // Resources
    ztGetResources,
    ztGetResource,
    ztAddResource,
    ztSpendResource,
    ztGetEnlightenmentPoints,
    ztAddEnlightenmentPoints,
    ztGatherSeasonalResources,
    ztGetTotalResourcesGathered,
    // Achievements
    ztGetAchievements,
    ztGetAchievementState,
    ztIsAchievementUnlocked,
    ztUpdateAchievementProgress,
    ztGetUnlockedAchievementsCount,
    ztGetAchievementsProgress,
    // Daily Challenge
    ztGetDailyChallenge,
    ztIsDailyChallengeCompleted,
    ztCompleteDailyChallenge,
    // Streak
    ztGetStreak,
    ztGetCurrentStreak,
    ztGetBestStreak,
    ztUpdateStreak,
    ztGetStreakBonusMultiplier,
    // Temple Name & Overview
    ztGetTempleName,
    ztSetTempleName,
    ztGetStatsTotals,
    ztGetOverview,
    // Reset & State
    ztResetProgress,
    ztGetState,
    ztGetCreatedAt,
    // Utility
    ztGetBonsaiExhibitionScore,
    ztGetTotalBonsaiActions,
    ztIsTeaUnlocked,
    ztIsBonsaiSpeciesUnlocked,
    ztIsVisitorUnlocked,
    ztIsKoanUnlocked,
    ztGetRoomDescription,
    ztGetMonkBonsaiBonus,
    ztGetTeaQualityMultiplier,
  };
}

// ---------------------------------------------------------------------------
// Standalone exported functions (for use outside the hook)
// ---------------------------------------------------------------------------

export function ztCreateInitialState(): ZenTempleState {
  return ztBuildInitialState();
}

export function ztGetMonkClassList(): ZtMonkClassDef[] {
  return ZT_MONK_CLASSES;
}

export function ztGetRoomList(): ZtRoomDef[] {
  return ZT_ROOMS;
}

export function ztGetMeditationTechniqueList(): ZtMeditationDef[] {
  return ZT_MEDITATION_TECHNIQUES;
}

export function ztGetKoanList(): ZtKoanDef[] {
  return ZT_KOANS;
}

export function ztGetTeaTypeList(): ZtTeaDef[] {
  return ZT_TEA_TYPES;
}

export function ztGetBonsaiSpeciesList(): ZtBonsaiDef[] {
  return ZT_BONSAI_SPECIES;
}

export function ztGetVisitorList(): ZtVisitorDef[] {
  return ZT_VISITORS;
}

export function ztGetAchievementList(): ZtAchievementDef[] {
  return ZT_ACHIEVEMENTS;
}

export function ztGetSeasonList(): ZtSeasonEffect[] {
  return ZT_SEASONS;
}

export function ztGetBonsaiStageList(): ZtBonsaiGrowthStage[] {
  return ZT_BONSAI_STAGES;
}

export function ztGetMaxRank(): number {
  return ZT_MAX_RANK;
}

export function ztGetMaxRoomLevel(): number {
  return ZT_MAX_ROOM_LEVEL;
}

export function ztGetMaxBonsaiStage(): number {
  return ZT_MAX_BONSAI_STAGE;
}

export function ztGetMaxMeditationDepth(): number {
  return ZT_MAX_MEDITATION_DEPTH;
}

export function ztGetStorageKey(): string {
  return ZT_STORAGE_KEY;
}
