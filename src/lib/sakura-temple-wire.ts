import { useState, useCallback, useMemo, useEffect } from 'react';

// ---------------------------------------------------------------------------
// Sakura Temple Wire — Cherry Blossom Temple Game System
// SSR-safe: no localStorage, window, document, setInterval, setTimeout
// All constants use SA_ prefix. Hook variable: saAPI
// ---------------------------------------------------------------------------

// ─── Types ────────────────────────────────────────────────────────────────

type SaRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type SaZone = 'cherry_garden' | 'meditation_hall' | 'shrine_archive' | 'bamboo_grove' | 'koi_pond' | 'tea_garden' | 'bell_tower' | 'sacred_spring';

type SaSeason = 'spring_bloom' | 'summer_festival' | 'autumn_moon' | 'winter_silence' | 'cherry_blossom_festival' | 'lantern_night' | 'moon_viewing' | 'new_year';

type SaMeditationState = 'calm' | 'focus' | 'enlightenment';

type SaMeditationType = 'breathing' | 'mantra' | 'visualization' | 'walking' | 'tea_ceremony' | 'incense' | 'flower_arrangement' | 'calligraphy';

type SaFortuneType = 'great_blessing' | 'middle_blessing' | 'small_blessing' | 'curse' | 'future_blessing';

type SaEventType = 'cherry_blossom_festival' | 'lantern_night' | 'moon_viewing' | 'tea_ceremony_festival' | 'dragon_spirit_day' | 'fox_wedding' | 'crane_dance' | 'temple_cleansing';

type SaOfferingCategory = 'incense' | 'flower' | 'food' | 'prayer' | 'spirit_item';

type SaDecoCategory = 'lantern' | 'torii_gate' | 'stone_path' | 'wind_chime' | 'bamboo_fence' | 'water_feature' | 'statue' | 'garden_element';

interface SaSpiritDef {
  id: string;
  name: string;
  rarity: SaRarity;
  emoji: string;
  zone: SaZone;
  description: string;
  power: number;
  harmonyBonus: number;
  coinBonus: number;
  xpBonus: number;
  levelReq: number;
}

interface SaZoneDef {
  id: SaZone;
  name: string;
  emoji: string;
  description: string;
  harmonyBonus: number;
  unlockLevel: number;
  spiritChance: number;
}

interface SaOfferingDef {
  id: string;
  name: string;
  category: SaOfferingCategory;
  emoji: string;
  blessing: number;
  cost: number;
  description: string;
  rarity: SaRarity;
}

interface SaDecorationDef {
  id: string;
  name: string;
  category: SaDecoCategory;
  emoji: string;
  harmonyBonus: number;
  beautyBonus: number;
  cost: number;
  unlockLevel: number;
  description: string;
}

interface SaSeasonDef {
  id: SaSeason;
  name: string;
  emoji: string;
  description: string;
  xpMult: number;
  coinMult: number;
  harmonyBonus: number;
  spiritChanceMult: number;
}

interface SaTitleDef {
  id: string;
  name: string;
  levelReq: number;
  harmonyReq: number;
  description: string;
}

interface SaAchievementDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  condition: string;
  target: number;
  reward: { coins: number; xp: number };
}

interface SaEventDef {
  id: SaEventType;
  name: string;
  emoji: string;
  description: string;
  duration: number;
  xpMult: number;
  coinMult: number;
  specialReward: string;
}

interface SaFortuneDef {
  id: SaFortuneType;
  name: string;
  emoji: string;
  description: string;
  xpBonus: number;
  coinBonus: number;
  luckDuration: number;
}

interface SaMeditationDef {
  id: SaMeditationType;
  name: string;
  emoji: string;
  description: string;
  baseFocus: number;
  baseCalm: number;
  enlightenmentChance: number;
}

interface SaSpiritRecord {
  spiritId: string;
  owned: boolean;
  count: number;
  bondLevel: number;
  lastFed: number;
}

interface SaMeditationSession {
  type: SaMeditationType;
  focus: number;
  calm: number;
  state: SaMeditationState;
  duration: number;
  completed: number;
  active: boolean;
}

interface SaPrayerRecord {
  offeringId: string;
  timestamp: number;
  blessing: number;
  fortune: SaFortuneType | null;
}

interface SaAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  progress: number;
  unlockedAt: number;
}

interface SaEventRecord {
  eventId: SaEventType;
  active: boolean;
  remainingTicks: number;
  completed: boolean;
  bonusClaimed: boolean;
}

interface SaDailyState {
  daySeed: number;
  shrineVisited: boolean;
  fortuneDrawn: boolean;
  fortuneType: SaFortuneType | null;
  offeringMade: boolean;
  meditationCompleted: boolean;
  streak: number;
  lastDay: number;
  dailyXp: number;
  dailyCoins: number;
}

interface SaTempleUpgrade {
  gardenLevel: number;
  hallLevel: number;
  shrineLevel: number;
  pondLevel: number;
  bellLevel: number;
  springLevel: number;
}

interface SaSakuraTempleState {
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  totalCoinsEarned: number;
  harmony: number;
  maxHarmony: number;
  titleId: string;
  currentZone: SaZone;
  currentSeason: SaSeason;
  spirits: SaSpiritRecord[];
  offerings: SaPrayerRecord[];
  unlockedOfferingIds: string[];
  ownedDecorationIds: string[];
  placedDecorationIds: string[];
  upgrades: SaTempleUpgrade;
  meditationSession: SaMeditationSession | null;
  meditationTotalTicks: number;
  meditationSessionsCompleted: number;
  currentFocus: number;
  currentCalm: number;
  highestEnlightenment: number;
  achievements: SaAchievementRecord[];
  daily: SaDailyState;
  events: SaEventRecord[];
  totalOfferingsMade: number;
  totalSpiritsCollected: number;
  totalMeditationMinutes: number;
  totalFortunesRead: number;
  totalDecorationsPlaced: number;
  blessingsReceived: number;
  templeReputation: number;
  petalCount: number;
  lanternsLit: number;
  bellRings: number;
  karma: number;
  seed: number;
}

// ---------------------------------------------------------------------------
// Constants — SA_ prefixed
// ---------------------------------------------------------------------------

export const SA_MAX_LEVEL = 50;
export const SA_XP_PER_LEVEL_BASE = 120;
export const SA_XP_PER_LEVEL_GROWTH = 95;
export const SA_MAX_HARMONY = 100;
export const SA_MAX_COINS = 99999;
export const SA_MAX_FOCUS = 100;
export const SA_MAX_CALM = 100;
export const SA_PETAL_CHANCE = 0.35;
export const SA_MEDITATION_FOCUS_RATE = 2;
export const SA_MEDITATION_CALM_RATE = 3;
export const SA_ENLIGHTENMENT_THRESHOLD = 80;
export const SA_OFFERING_BASE_BLESSING = 10;
export const SA_SHRINE_VISIT_XP = 30;
export const SA_DAILY_STREAK_BONUS = 5;
export const SA_SEASON_DURATION = 7;
export const SA_EVENT_DURATION = 5;
export const SA_BOND_MAX = 10;
export const SA_BOND_PER_FEED = 1;
export const SA_FORTUNE_COOLDOWN = 1;

export const SA_RARITIES: { id: SaRarity; name: string; color: string; mult: number }[] = [
  { id: 'common', name: 'Common', color: '#98FB98', mult: 1.0 },
  { id: 'uncommon', name: 'Uncommon', color: '#87CEEB', mult: 1.5 },
  { id: 'rare', name: 'Rare', color: '#FFB7C5', mult: 2.5 },
  { id: 'epic', name: 'Epic', color: '#FFD700', mult: 4.0 },
  { id: 'legendary', name: 'Legendary', color: '#DC143C', mult: 8.0 },
];

export const SA_ZONES: SaZoneDef[] = [
  { id: 'cherry_garden', name: 'Cherry Garden', emoji: '🌸', description: 'A serene garden filled with cherry blossom trees where petals drift in the breeze', harmonyBonus: 5, unlockLevel: 1, spiritChance: 0.25 },
  { id: 'meditation_hall', name: 'Meditation Hall', emoji: '🧘', description: 'A quiet hall for deep meditation and spiritual reflection', harmonyBonus: 8, unlockLevel: 1, spiritChance: 0.15 },
  { id: 'shrine_archive', name: 'Shrine Archive', emoji: '📜', description: 'Ancient scrolls and sacred texts preserved for generations', harmonyBonus: 3, unlockLevel: 5, spiritChance: 0.2 },
  { id: 'bamboo_grove', name: 'Bamboo Grove', emoji: '🎋', description: 'Towering bamboo sways gently, hiding spirits between the stalks', harmonyBonus: 6, unlockLevel: 3, spiritChance: 0.22 },
  { id: 'koi_pond', name: 'Koi Pond', emoji: '🐟', description: 'Sacred koi swim in crystal waters reflecting the temple', harmonyBonus: 7, unlockLevel: 2, spiritChance: 0.18 },
  { id: 'tea_garden', name: 'Tea Garden', emoji: '🍵', description: 'A traditional tea garden where ceremony brings inner peace', harmonyBonus: 9, unlockLevel: 8, spiritChance: 0.2 },
  { id: 'bell_tower', name: 'Bell Tower', emoji: '🔔', description: 'The great temple bell resonates across the mountain', harmonyBonus: 4, unlockLevel: 12, spiritChance: 0.16 },
  { id: 'sacred_spring', name: 'Sacred Spring', emoji: '⛲', description: 'A mystical spring said to grant visions to the worthy', harmonyBonus: 10, unlockLevel: 15, spiritChance: 0.3 },
];

export const SA_SPIRITS: SaSpiritDef[] = [
  // Common (8)
  { id: 'petal_fox', name: 'Petal Fox', rarity: 'common', emoji: '🦊', zone: 'cherry_garden', description: 'A playful fox cub that dances in falling petals', power: 5, harmonyBonus: 2, coinBonus: 3, xpBonus: 2, levelReq: 1 },
  { id: 'lantern_tanuki', name: 'Lantern Tanuki', rarity: 'common', emoji: '🦝', zone: 'bell_tower', description: 'A chubby raccoon dog that carries a tiny lantern', power: 4, harmonyBonus: 3, coinBonus: 2, xpBonus: 1, levelReq: 1 },
  { id: 'moss_spirit', name: 'Moss Spirit', rarity: 'common', emoji: '🟢', zone: 'bamboo_grove', description: 'A gentle spirit made of soft green moss', power: 3, harmonyBonus: 4, coinBonus: 1, xpBonus: 2, levelReq: 1 },
  { id: 'koi_spirit', name: 'Koi Spirit', rarity: 'common', emoji: '🐠', zone: 'koi_pond', description: 'A shimmering fish spirit that glides through sacred waters', power: 4, harmonyBonus: 2, coinBonus: 4, xpBonus: 1, levelReq: 1 },
  { id: 'bamboo_whisper', name: 'Bamboo Whisper', rarity: 'common', emoji: '🎋', zone: 'bamboo_grove', description: 'The voice of bamboo leaves rustling in the wind', power: 3, harmonyBonus: 3, coinBonus: 2, xpBonus: 3, levelReq: 2 },
  { id: 'stone_frog', name: 'Stone Frog', rarity: 'common', emoji: '🐸', zone: 'tea_garden', description: 'A small stone frog that comes alive at dusk', power: 5, harmonyBonus: 2, coinBonus: 3, xpBonus: 2, levelReq: 1 },
  { id: 'wind_sparrow', name: 'Wind Sparrow', rarity: 'common', emoji: '🐦', zone: 'cherry_garden', description: 'A tiny bird that rides the spring breeze', power: 4, harmonyBonus: 3, coinBonus: 2, xpBonus: 2, levelReq: 1 },
  { id: 'dewdrop_fairy', name: 'Dewdrop Fairy', rarity: 'common', emoji: '💧', zone: 'sacred_spring', description: 'A tiny fairy born from morning dew on lotus leaves', power: 3, harmonyBonus: 4, coinBonus: 1, xpBonus: 3, levelReq: 2 },
  // Uncommon (7)
  { id: 'moon_rabbit', name: 'Moon Rabbit', rarity: 'uncommon', emoji: '🐰', zone: 'meditation_hall', description: 'A lunar rabbit that visits during moonlit meditations', power: 10, harmonyBonus: 5, coinBonus: 5, xpBonus: 4, levelReq: 5 },
  { id: 'cherry_crane', name: 'Cherry Crane', rarity: 'uncommon', emoji: '🦢', zone: 'cherry_garden', description: 'An elegant crane with feathers of pale pink petals', power: 12, harmonyBonus: 6, coinBonus: 4, xpBonus: 5, levelReq: 6 },
  { id: 'incense_smoke', name: 'Incense Smoke', rarity: 'uncommon', emoji: '💨', zone: 'shrine_archive', description: 'A sentient wisp of temple incense with ancient wisdom', power: 8, harmonyBonus: 7, coinBonus: 3, xpBonus: 6, levelReq: 7 },
  { id: 'tea_leaf_spirit', name: 'Tea Leaf Spirit', rarity: 'uncommon', emoji: '🍃', zone: 'tea_garden', description: 'A spirit that swirls in the steam of freshly brewed matcha', power: 9, harmonyBonus: 5, coinBonus: 6, xpBonus: 4, levelReq: 5 },
  { id: 'wind_chime_fairy', name: 'Wind Chime Fairy', rarity: 'uncommon', emoji: '🎐', zone: 'bell_tower', description: 'A fairy that lives inside temple wind chimes', power: 7, harmonyBonus: 8, coinBonus: 3, xpBonus: 5, levelReq: 8 },
  { id: 'lotus_guardian', name: 'Lotus Guardian', rarity: 'uncommon', emoji: '🪷', zone: 'koi_pond', description: 'A serene guardian that watches over the pond lotuses', power: 11, harmonyBonus: 6, coinBonus: 5, xpBonus: 4, levelReq: 6 },
  { id: 'scroll_scholar', name: 'Scroll Scholar', rarity: 'uncommon', emoji: '📜', zone: 'shrine_archive', description: 'An ancient spirit that studies forgotten texts', power: 10, harmonyBonus: 4, coinBonus: 7, xpBonus: 6, levelReq: 9 },
  // Rare (7)
  { id: 'dragon_spirit', name: 'Dragon Spirit', rarity: 'rare', emoji: '🐉', zone: 'sacred_spring', description: 'A small but mighty dragon born from the sacred spring', power: 20, harmonyBonus: 10, coinBonus: 10, xpBonus: 8, levelReq: 12 },
  { id: 'phoenix_chick', name: 'Phoenix Chick', rarity: 'rare', emoji: '🔥', zone: 'bell_tower', description: 'A baby phoenix that warms the temple with gentle flames', power: 18, harmonyBonus: 8, coinBonus: 12, xpBonus: 7, levelReq: 14 },
  { id: 'shadow_fox', name: 'Shadow Fox', rarity: 'rare', emoji: '🌑', zone: 'bamboo_grove', description: 'A mysterious fox that appears only at twilight', power: 16, harmonyBonus: 12, coinBonus: 8, xpBonus: 10, levelReq: 13 },
  { id: 'thunder_stork', name: 'Thunder Stork', rarity: 'rare', emoji: '⚡', zone: 'koi_pond', description: 'A great stork that brings spring rainstorms', power: 22, harmonyBonus: 7, coinBonus: 9, xpBonus: 12, levelReq: 15 },
  { id: 'crystal_carp', name: 'Crystal Carp', rarity: 'rare', emoji: '💎', zone: 'sacred_spring', description: 'A koi made entirely of living crystal', power: 15, harmonyBonus: 11, coinBonus: 15, xpBonus: 6, levelReq: 16 },
  { id: 'blossom_dragon', name: 'Blossom Dragon', rarity: 'rare', emoji: '🌺', zone: 'cherry_garden', description: 'A gentle dragon that causes cherry trees to bloom', power: 19, harmonyBonus: 9, coinBonus: 11, xpBonus: 9, levelReq: 14 },
  { id: 'zen_mantis', name: 'Zen Mantis', rarity: 'rare', emoji: '🦗', zone: 'meditation_hall', description: 'A perfectly still praying mantis deep in meditation', power: 14, harmonyBonus: 13, coinBonus: 7, xpBonus: 11, levelReq: 11 },
  // Epic (5)
  { id: 'nine_tailed_fox', name: 'Nine-Tailed Fox', rarity: 'epic', emoji: '🦊', zone: 'shrine_archive', description: 'A legendary kitsune with nine tails of golden fire', power: 35, harmonyBonus: 15, coinBonus: 20, xpBonus: 15, levelReq: 25 },
  { id: 'moonlight_heron', name: 'Moonlight Heron', rarity: 'epic', emoji: '🦅', zone: 'koi_pond', description: 'A silver heron that glows under the full moon', power: 30, harmonyBonus: 18, coinBonus: 18, xpBonus: 16, levelReq: 28 },
  { id: 'thunder_kami', name: 'Thunder Kami', rarity: 'epic', emoji: '⛈️', zone: 'bell_tower', description: 'A storm god that rings the temple bell with lightning', power: 40, harmonyBonus: 12, coinBonus: 25, xpBonus: 18, levelReq: 30 },
  { id: 'sakura_dryad', name: 'Sakura Dryad', rarity: 'epic', emoji: '🌸', zone: 'cherry_garden', description: 'A tree spirit who is the soul of the oldest cherry tree', power: 28, harmonyBonus: 20, coinBonus: 15, xpBonus: 20, levelReq: 27 },
  { id: 'void_dragon', name: 'Void Dragon', rarity: 'epic', emoji: '🌀', zone: 'sacred_spring', description: 'A dragon that exists between dimensions at the spring', power: 45, harmonyBonus: 14, coinBonus: 22, xpBonus: 22, levelReq: 32 },
  // Legendary (4)
  { id: 'celestial_phoenix', name: 'Celestial Phoenix', rarity: 'legendary', emoji: '✨', zone: 'bell_tower', description: 'The reborn phoenix that guards the temple for eternity', power: 80, harmonyBonus: 30, coinBonus: 50, xpBonus: 40, levelReq: 40 },
  { id: 'ancient_kami', name: 'Ancient Kami', rarity: 'legendary', emoji: '⛩️', zone: 'sacred_spring', description: 'The primordial spirit that founded the temple', power: 70, harmonyBonus: 35, coinBonus: 40, xpBonus: 35, levelReq: 45 },
  { id: 'dream_weaver', name: 'Dream Weaver', rarity: 'legendary', emoji: '🔮', zone: 'meditation_hall', description: 'A cosmic spider that weaves dreams during deep meditation', power: 75, harmonyBonus: 28, coinBonus: 45, xpBonus: 38, levelReq: 42 },
  { id: 'sakura_sovereign', name: 'Sakura Sovereign', rarity: 'legendary', emoji: '👑', zone: 'cherry_garden', description: 'The ruler of all cherry blossoms across the mortal realm', power: 90, harmonyBonus: 40, coinBonus: 60, xpBonus: 50, levelReq: 50 },
];

export const SA_OFFERINGS: SaOfferingDef[] = [
  // Incense (7)
  { id: 'sandalwood_incense', name: 'Sandalwood Incense', category: 'incense', emoji: '🪔', blessing: 10, cost: 5, description: 'A classic temple incense for purification', rarity: 'common' },
  { id: 'cherry_incense', name: 'Cherry Blossom Incense', category: 'incense', emoji: '🌸', blessing: 15, cost: 8, description: 'Fragrant incense made from dried cherry petals', rarity: 'common' },
  { id: 'lotus_incense', name: 'Lotus Incense', category: 'incense', emoji: '🪷', blessing: 20, cost: 12, description: 'Sacred lotus incense for deep meditation', rarity: 'uncommon' },
  { id: 'cedar_incense', name: 'Cedar Incense', category: 'incense', emoji: '🌲', blessing: 25, cost: 15, description: 'Strong purifying cedar from the sacred grove', rarity: 'uncommon' },
  { id: 'dragon_blood_incense', name: 'Dragon Blood Incense', category: 'incense', emoji: '🔥', blessing: 40, cost: 30, description: 'Rare crimson incense with legendary power', rarity: 'rare' },
  { id: 'celestial_incense', name: 'Celestial Incense', category: 'incense', emoji: '⭐', blessing: 60, cost: 50, description: 'Incense blended under a meteor shower', rarity: 'epic' },
  { id: 'void_incense', name: 'Void Incense', category: 'incense', emoji: '🌀', blessing: 100, cost: 100, description: 'Smoke that reveals hidden dimensions', rarity: 'legendary' },
  // Flowers (6)
  { id: 'cherry_bouquet', name: 'Cherry Bouquet', category: 'flower', emoji: '💐', blessing: 8, cost: 4, description: 'A simple bouquet of cherry blossoms', rarity: 'common' },
  { id: 'lotus_offering', name: 'Lotus Offering', category: 'flower', emoji: '🪷', blessing: 18, cost: 10, description: 'Perfect lotus flowers from the temple pond', rarity: 'uncommon' },
  { id: 'wisteria_cascade', name: 'Wisteria Cascade', category: 'flower', emoji: '💜', blessing: 30, cost: 20, description: 'Cascading purple wisteria in full bloom', rarity: 'rare' },
  { id: 'golden_chrysanthemum', name: 'Golden Chrysanthemum', category: 'flower', emoji: '🌼', blessing: 45, cost: 35, description: 'The imperial flower of the emperor', rarity: 'epic' },
  { id: 'ethereal_orchid', name: 'Ethereal Orchid', category: 'flower', emoji: '🪻', blessing: 70, cost: 60, description: 'A ghostly orchid that blooms between worlds', rarity: 'legendary' },
  { id: 'sacred_bamboo_sprout', name: 'Sacred Bamboo Sprout', category: 'flower', emoji: '🎍', blessing: 12, cost: 6, description: 'A rare bamboo sprout from the sacred grove', rarity: 'common' },
  // Food (6)
  { id: 'rice_cakes', name: 'Rice Cakes', category: 'food', emoji: '🍡', blessing: 8, cost: 3, description: 'Traditional mochi for the spirits', rarity: 'common' },
  { id: 'matcha_cookies', name: 'Matcha Cookies', category: 'food', emoji: '🍪', blessing: 14, cost: 7, description: 'Green tea cookies shaped like cherry blossoms', rarity: 'common' },
  { id: 'red_bean_soup', name: 'Red Bean Soup', category: 'food', emoji: '🥣', blessing: 22, cost: 14, description: 'Sweet azuki soup served at festivals', rarity: 'uncommon' },
  { id: 'sakura_mochi', name: 'Sakura Mochi', category: 'food', emoji: '🌸', blessing: 35, cost: 25, description: 'Pink mochi wrapped in cherry leaves', rarity: 'rare' },
  { id: 'dragon_fruit', name: 'Dragon Fruit', category: 'food', emoji: '🐉', blessing: 55, cost: 45, description: 'A mythical fruit that grants visions', rarity: 'epic' },
  { id: 'immortal_peach', name: 'Immortal Peach', category: 'food', emoji: '🍑', blessing: 90, cost: 80, description: 'A peach from the garden of the gods', rarity: 'legendary' },
  // Prayer (4)
  { id: 'paper_prayer', name: 'Paper Prayer', category: 'prayer', emoji: '📜', blessing: 10, cost: 2, description: 'A written prayer on washi paper', rarity: 'common' },
  { id: 'silk_prayer', name: 'Silk Prayer', category: 'prayer', emoji: '🎀', blessing: 20, cost: 10, description: 'A prayer flag woven from fine silk', rarity: 'uncommon' },
  { id: 'golden_prayer', name: 'Golden Prayer', category: 'prayer', emoji: '📜', blessing: 40, cost: 30, description: 'A prayer inscribed on golden leaf', rarity: 'rare' },
  { id: 'divine_prayer', name: 'Divine Prayer', category: 'prayer', emoji: '✨', blessing: 75, cost: 65, description: 'A prayer written in celestial script', rarity: 'epic' },
  // Spirit Items (3)
  { id: 'spirit_candle', name: 'Spirit Candle', category: 'spirit_item', emoji: '🕯️', blessing: 15, cost: 8, description: 'A candle that attracts friendly spirits', rarity: 'common' },
  { id: 'spirit_mirror', name: 'Spirit Mirror', category: 'spirit_item', emoji: '🪞', blessing: 50, cost: 40, description: 'A mirror that reveals spirit forms', rarity: 'rare' },
  { id: 'spirit_jade', name: 'Spirit Jade', category: 'spirit_item', emoji: '💚', blessing: 85, cost: 75, description: 'A jade pendant containing a trapped spirit', rarity: 'epic' },
];

export const SA_DECORATIONS: SaDecorationDef[] = [
  // Lanterns (4)
  { id: 'stone_lantern', name: 'Stone Lantern', category: 'lantern', emoji: '🏮', harmonyBonus: 3, beautyBonus: 4, cost: 20, unlockLevel: 1, description: 'A traditional stone garden lantern' },
  { id: 'paper_lantern', name: 'Paper Lantern', category: 'lantern', emoji: '🏮', harmonyBonus: 5, beautyBonus: 6, cost: 35, unlockLevel: 5, description: 'Soft glowing paper lantern with cherry patterns' },
  { id: 'crystal_lantern', name: 'Crystal Lantern', category: 'lantern', emoji: '💎', harmonyBonus: 8, beautyBonus: 10, cost: 80, unlockLevel: 15, description: 'A prism lantern that casts rainbow light' },
  { id: 'spirit_lantern', name: 'Spirit Lantern', category: 'lantern', emoji: '👻', harmonyBonus: 12, beautyBonus: 14, cost: 150, unlockLevel: 25, description: 'An eternal flame fed by spirit energy' },
  // Torii Gates (3)
  { id: 'wooden_torii', name: 'Wooden Torii Gate', category: 'torii_gate', emoji: '⛩️', harmonyBonus: 4, beautyBonus: 5, cost: 30, unlockLevel: 3, description: 'A simple wooden gate marking sacred ground' },
  { id: 'vermillion_torii', name: 'Vermillion Torii Gate', category: 'torii_gate', emoji: '⛩️', harmonyBonus: 7, beautyBonus: 8, cost: 60, unlockLevel: 10, description: 'A bright red gate that wards evil spirits' },
  { id: 'golden_torii', name: 'Golden Torii Gate', category: 'torii_gate', emoji: '✨', harmonyBonus: 15, beautyBonus: 18, cost: 200, unlockLevel: 30, description: 'A magnificent golden gate to the divine' },
  // Stone Paths (3)
  { id: 'stepping_stones', name: 'Stepping Stones', category: 'stone_path', emoji: '🪨', harmonyBonus: 2, beautyBonus: 3, cost: 10, unlockLevel: 1, description: 'Natural stones for mindful walking' },
  { id: 'raked_gravel', name: 'Raked Gravel Path', category: 'stone_path', emoji: '⭕', harmonyBonus: 6, beautyBonus: 7, cost: 40, unlockLevel: 8, description: 'Meditative patterns raked in white gravel' },
  { id: 'mosaic_path', name: 'Mosaic Stone Path', category: 'stone_path', emoji: '🎨', harmonyBonus: 10, beautyBonus: 12, cost: 100, unlockLevel: 20, description: 'Intricate stone mosaic of cherry blossoms' },
  // Wind Chimes (3)
  { id: 'bamboo_chime', name: 'Bamboo Wind Chime', category: 'wind_chime', emoji: '🎐', harmonyBonus: 4, beautyBonus: 5, cost: 15, unlockLevel: 2, description: 'Gentle bamboo chimes in the breeze' },
  { id: 'glass_chime', name: 'Glass Wind Chime', category: 'wind_chime', emoji: '💠', harmonyBonus: 7, beautyBonus: 8, cost: 45, unlockLevel: 12, description: 'Delicate glass chimes with crystalline tones' },
  { id: 'celestial_chime', name: 'Celestial Wind Chime', category: 'wind_chime', emoji: '🌟', harmonyBonus: 13, beautyBonus: 15, cost: 130, unlockLevel: 28, description: 'Chimes that sound like temple bells' },
  // Bamboo Fence (2)
  { id: 'simple_fence', name: 'Simple Bamboo Fence', category: 'bamboo_fence', emoji: '🎋', harmonyBonus: 2, beautyBonus: 2, cost: 12, unlockLevel: 1, description: 'A basic bamboo boundary fence' },
  { id: 'living_fence', name: 'Living Bamboo Fence', category: 'bamboo_fence', emoji: '🌴', harmonyBonus: 8, beautyBonus: 9, cost: 70, unlockLevel: 18, description: 'A fence of living, growing bamboo' },
  // Water Features (2)
  { id: 'bamboo_fountain', name: 'Bamboo Fountain', category: 'water_feature', emoji: '⛲', harmonyBonus: 6, beautyBonus: 7, cost: 50, unlockLevel: 6, description: 'A shishi-odoshi bamboo water feature' },
  { id: 'lotus_fountain', name: 'Lotus Fountain', category: 'water_feature', emoji: '🪷', harmonyBonus: 11, beautyBonus: 13, cost: 120, unlockLevel: 22, description: 'An ornate fountain with floating lotuses' },
  // Statues (2)
  { id: 'buddha_statue', name: 'Buddha Statue', category: 'statue', emoji: '🙏', harmonyBonus: 9, beautyBonus: 10, cost: 90, unlockLevel: 14, description: 'A serene stone Buddha in meditation pose' },
  { id: 'dragon_statue', name: 'Dragon Statue', category: 'statue', emoji: '🐉', harmonyBonus: 14, beautyBonus: 16, cost: 180, unlockLevel: 32, description: 'A coiled dragon guardian of the temple' },
  // Garden Elements (2)
  { id: 'zen_garden', name: 'Mini Zen Garden', category: 'garden_element', emoji: '☯️', harmonyBonus: 5, beautyBonus: 6, cost: 25, unlockLevel: 4, description: 'A tabletop zen garden with sand and stones' },
  { id: 'cherry_tree', name: 'Cherry Blossom Tree', category: 'garden_element', emoji: '🌸', harmonyBonus: 16, beautyBonus: 20, cost: 250, unlockLevel: 35, description: 'A magnificent cherry tree in eternal bloom' },
];

export const SA_SEASONS: SaSeasonDef[] = [
  { id: 'spring_bloom', name: 'Spring Bloom', emoji: '🌸', description: 'Cherry blossoms fill the air with pink petals', xpMult: 1.0, coinMult: 1.0, harmonyBonus: 5, spiritChanceMult: 1.2 },
  { id: 'summer_festival', name: 'Summer Festival', emoji: '🎆', description: 'Fireworks light the sky as festivals fill the temple grounds', xpMult: 1.3, coinMult: 1.5, harmonyBonus: 10, spiritChanceMult: 1.0 },
  { id: 'autumn_moon', name: 'Autumn Moon', emoji: '🌙', description: 'Crimson leaves and harvest moon bring deep reflection', xpMult: 1.2, coinMult: 1.2, harmonyBonus: 8, spiritChanceMult: 1.1 },
  { id: 'winter_silence', name: 'Winter Silence', emoji: '❄️', description: 'Snow covers the temple in peaceful stillness', xpMult: 0.8, coinMult: 0.8, harmonyBonus: 15, spiritChanceMult: 0.8 },
  { id: 'cherry_blossom_festival', name: 'Cherry Blossom Festival', emoji: '🌸', description: 'The peak bloom draws visitors from across the land', xpMult: 1.5, coinMult: 2.0, harmonyBonus: 20, spiritChanceMult: 1.5 },
  { id: 'lantern_night', name: 'Lantern Night', emoji: '🏮', description: 'Thousands of lanterns illuminate the temple paths', xpMult: 1.2, coinMult: 1.3, harmonyBonus: 12, spiritChanceMult: 1.3 },
  { id: 'moon_viewing', name: 'Moon Viewing', emoji: '🌕', description: 'Tsukimi night — offerings to the harvest moon', xpMult: 1.1, coinMult: 1.1, harmonyBonus: 10, spiritChanceMult: 1.4 },
  { id: 'new_year', name: 'New Year', emoji: '🎎', description: 'Temple bells ring 108 times to cleanse the soul', xpMult: 2.0, coinMult: 2.5, harmonyBonus: 25, spiritChanceMult: 1.8 },
];

export const SA_TITLES: SaTitleDef[] = [
  { id: 'title_pilgrim', name: 'Pilgrim', levelReq: 1, harmonyReq: 0, description: 'A humble traveler who has come to the temple' },
  { id: 'title_acolyte', name: 'Temple Acolyte', levelReq: 5, harmonyReq: 15, description: 'An apprentice learning the ways of the temple' },
  { id: 'title_keeper', name: 'Temple Keeper', levelReq: 12, harmonyReq: 35, description: 'A dedicated guardian of temple traditions' },
  { id: 'title_guardian', name: 'Temple Guardian', levelReq: 20, harmonyReq: 55, description: 'A sworn protector of the sacred grounds' },
  { id: 'title_scholar', name: 'Cherry Blossom Scholar', levelReq: 28, harmonyReq: 70, description: 'One who has studied the wisdom of petals' },
  { id: 'title_sage', name: 'Cherry Blossom Sage', levelReq: 35, harmonyReq: 82, description: 'A master of temple lore and meditation' },
  { id: 'title_high_priest', name: 'High Priest', levelReq: 42, harmonyReq: 92, description: 'The spiritual leader of the temple community' },
  { id: 'title_divine_keeper', name: 'Divine Keeper', levelReq: 50, harmonyReq: 100, description: 'The chosen one who maintains the bridge to the divine' },
];

export const SA_ACHIEVEMENTS: SaAchievementDef[] = [
  { id: 'sa_first_spirit', name: 'First Encounter', description: 'Collect your first temple spirit', emoji: '🦊', condition: 'spirits_collected', target: 1, reward: { coins: 20, xp: 30 } },
  { id: 'sa_ten_spirits', name: 'Spirit Whisperer', description: 'Collect 10 different spirits', emoji: '👻', condition: 'spirits_collected', target: 10, reward: { coins: 100, xp: 150 } },
  { id: 'sa_all_common', name: 'Common Collector', description: 'Collect all common spirits', emoji: '🟢', condition: 'common_spirits', target: 8, reward: { coins: 200, xp: 300 } },
  { id: 'sa_rare_find', name: 'Rare Discovery', description: 'Collect your first rare spirit', emoji: '💎', condition: 'rare_spirit', target: 1, reward: { coins: 150, xp: 200 } },
  { id: 'sa_epic_find', name: 'Epic Encounter', description: 'Collect your first epic spirit', emoji: '⚡', condition: 'epic_spirit', target: 1, reward: { coins: 300, xp: 400 } },
  { id: 'sa_legendary_find', name: 'Legendary Discovery', description: 'Collect your first legendary spirit', emoji: '👑', condition: 'legendary_spirit', target: 1, reward: { coins: 500, xp: 800 } },
  { id: 'sa_first_meditation', name: 'First Breath', description: 'Complete your first meditation session', emoji: '🧘', condition: 'meditations_completed', target: 1, reward: { coins: 15, xp: 25 } },
  { id: 'sa_twenty_meditations', name: 'Mindful Devotee', description: 'Complete 20 meditation sessions', emoji: '☯️', condition: 'meditations_completed', target: 20, reward: { coins: 200, xp: 250 } },
  { id: 'sa_enlightenment', name: 'Enlightened One', description: 'Reach the enlightenment meditation state', emoji: '✨', condition: 'enlightenment_reached', target: 1, reward: { coins: 400, xp: 500 } },
  { id: 'sa_first_offering', name: 'First Offering', description: 'Make your first offering at the altar', emoji: '🪔', condition: 'offerings_made', target: 1, reward: { coins: 10, xp: 20 } },
  { id: 'sa_fifty_offerings', name: 'Devoted Worshipper', description: 'Make 50 offerings at the altar', emoji: '🙏', condition: 'offerings_made', target: 50, reward: { coins: 300, xp: 400 } },
  { id: 'sa_harmony_50', name: 'Harmonious Heart', description: 'Reach harmony level 50', emoji: '💕', condition: 'harmony', target: 50, reward: { coins: 250, xp: 350 } },
  { id: 'sa_harmony_100', name: 'Perfect Harmony', description: 'Reach max harmony level 100', emoji: '🌸', condition: 'harmony', target: 100, reward: { coins: 1000, xp: 1500 } },
  { id: 'sa_level_10', name: 'Rising Acolyte', description: 'Reach temple level 10', emoji: '🏅', condition: 'level', target: 10, reward: { coins: 100, xp: 150 } },
  { id: 'sa_level_25', name: 'Temple Master', description: 'Reach temple level 25', emoji: '🏆', condition: 'level', target: 25, reward: { coins: 500, xp: 700 } },
  { id: 'sa_level_50', name: 'Divine Ascendant', description: 'Reach max temple level 50', emoji: '👑', condition: 'level', target: 50, reward: { coins: 2000, xp: 3000 } },
  { id: 'sa_daily_streak_7', name: 'Weekly Devotee', description: 'Maintain a 7-day shrine visit streak', emoji: '📅', condition: 'daily_streak', target: 7, reward: { coins: 150, xp: 200 } },
  { id: 'sa_daily_streak_30', name: 'Monthly Pilgrim', description: 'Maintain a 30-day shrine visit streak', emoji: '🗓️', condition: 'daily_streak', target: 30, reward: { coins: 1000, xp: 1200 } },
];

export const SA_EVENTS: SaEventDef[] = [
  { id: 'cherry_blossom_festival', name: 'Cherry Blossom Festival', emoji: '🌸', description: 'Peak bloom celebrations with music and dance', duration: 5, xpMult: 2.0, coinMult: 2.5, specialReward: 'Sakura Crown' },
  { id: 'lantern_night', name: 'Lantern Night', emoji: '🏮', description: 'All temple lanterns are lit in a stunning display', duration: 5, xpMult: 1.5, coinMult: 1.8, specialReward: 'Lantern Spirit Lantern' },
  { id: 'moon_viewing', name: 'Moon Viewing', emoji: '🌕', description: 'Tsukimi celebration under the harvest moon', duration: 5, xpMult: 1.3, coinMult: 1.5, specialReward: 'Moon Rabbit Whistle' },
  { id: 'tea_ceremony_festival', name: 'Tea Ceremony Festival', emoji: '🍵', description: 'Grand tea ceremony with masters from all temples', duration: 5, xpMult: 1.4, coinMult: 1.6, specialReward: 'Celestial Tea Set' },
  { id: 'dragon_spirit_day', name: 'Dragon Spirit Day', emoji: '🐉', description: 'Dragons visit the temple bringing great fortune', duration: 5, xpMult: 2.5, coinMult: 3.0, specialReward: 'Dragon Scale Amulet' },
  { id: 'fox_wedding', name: 'Fox Wedding', emoji: '🦊', description: 'Kitsune procession under sunlit rain', duration: 5, xpMult: 1.8, coinMult: 2.0, specialReward: 'Fox Mask' },
  { id: 'crane_dance', name: 'Crane Dance', emoji: '🦢', description: 'Sacred cranes perform their eternal mating dance', duration: 5, xpMult: 1.6, coinMult: 1.9, specialReward: 'Crane Feather Fan' },
  { id: 'temple_cleansing', name: 'Temple Cleansing', emoji: '🌊', description: 'Purification rituals restore temple harmony', duration: 5, xpMult: 1.2, coinMult: 1.0, specialReward: 'Purification Scroll' },
];

export const SA_FORTUNES: SaFortuneDef[] = [
  { id: 'great_blessing', name: 'Great Blessing', emoji: '🎊', description: 'The kami smile upon you with great fortune', xpBonus: 100, coinBonus: 200, luckDuration: 3 },
  { id: 'middle_blessing', name: 'Middle Blessing', emoji: '😊', description: 'Good fortune flows through your path', xpBonus: 50, coinBonus: 100, luckDuration: 2 },
  { id: 'small_blessing', name: 'Small Blessing', emoji: '🍀', description: 'A gentle wind of luck brushes past you', xpBonus: 20, coinBonus: 50, luckDuration: 1 },
  { id: 'curse', name: 'Minor Setback', emoji: '🌧️', description: 'The spirits test your resolve with a small trial', xpBonus: 5, coinBonus: 10, luckDuration: 0 },
  { id: 'future_blessing', name: 'Future Blessing', emoji: '🌅', description: 'Your next fortune will be greatly improved', xpBonus: 10, coinBonus: 25, luckDuration: 1 },
];

export const SA_MEDITATION_TYPES: SaMeditationDef[] = [
  { id: 'breathing', name: 'Breathing Meditation', emoji: '🌬️', description: 'Follow the rhythm of breath entering and leaving', baseFocus: 5, baseCalm: 8, enlightenmentChance: 0.05 },
  { id: 'mantra', name: 'Mantra Chanting', emoji: '📿', description: 'Repeat sacred syllables to focus the mind', baseFocus: 8, baseCalm: 5, enlightenmentChance: 0.08 },
  { id: 'visualization', name: 'Visualization', emoji: '🌌', description: 'Create inner landscapes of peace and beauty', baseFocus: 6, baseCalm: 7, enlightenmentChance: 0.1 },
  { id: 'walking', name: 'Walking Meditation', emoji: '🚶', description: 'Mindful steps through the temple garden', baseFocus: 4, baseCalm: 9, enlightenmentChance: 0.06 },
  { id: 'tea_ceremony', name: 'Tea Ceremony', emoji: '🍵', description: 'The art of preparing and serving matcha mindfully', baseFocus: 7, baseCalm: 6, enlightenmentChance: 0.07 },
  { id: 'incense', name: 'Incense Meditation', emoji: '🪔', description: 'Focus on the rising smoke of sacred incense', baseFocus: 9, baseCalm: 4, enlightenmentChance: 0.09 },
  { id: 'flower_arrangement', name: 'Ikebana', emoji: '💐', description: 'The meditative art of flower arrangement', baseFocus: 5, baseCalm: 8, enlightenmentChance: 0.06 },
  { id: 'calligraphy', name: 'Calligraphy', emoji: '🖌️', description: 'Express inner peace through brush strokes', baseFocus: 8, baseCalm: 5, enlightenmentChance: 0.08 },
];

export const SA_QUOTES: string[] = [
  'The temple bell sounds, and all the cherry blossoms fall.',
  'In the garden of the heart, even weeds can bloom.',
  'A single petal on still water — the whole world reflects.',
  'The fox crosses the torii gate at dawn, carrying blessings.',
  'Sit beneath the cherry tree; its blossoms teach impermanence.',
  'The bamboo bends but does not break — find your bamboo nature.',
  'Wind through wind chimes: the temple speaks in tones of peace.',
  'Each lantern lit is a wish sent to the sky.',
  'The koi swims upstream not from stubbornness but from knowing the source.',
  'Moss grows where time forgets to hurry.',
  'A cup of tea is a universe in miniature.',
  'The path of petals leads to the heart of the temple.',
  'Rain on the shrine roof — the song of ten thousand ancestors.',
  'Between breaths, the garden reveals its secrets.',
  'The stone lantern glows not for itself but for travelers.',
  'Enlightenment is not a destination but the quality of each step.',
  'When the cherry blossoms fall, the temple grows more beautiful.',
  'The crane stands still because it knows the fish will come.',
  'In winter silence, the temple bell is the loudest sound.',
  'Offer your worries to the smoke; let them drift away.',
  'A thousand paper prayers — each one a universe of hope.',
  'The dragon sleeps in the sacred spring, dreaming of flowers.',
  'Walk the stone path slowly; it was laid by patient hands.',
  'The moon reflected in the pond is the same moon your ancestors saw.',
  'Tea is bitter, yet the moment is sweet.',
  'Fallen petals are not lost; they become the earth of new blossoms.',
  'The wind chime has no voice; the wind gives it one.',
  'A single incense stick can fill a thousand rooms with peace.',
  'The fox does not chase the rabbit; the rabbit runs toward the fox.',
  'Sit long enough and the garden will meditate you.',
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function saXpForLevel(level: number): number {
  return SA_XP_PER_LEVEL_BASE + (level - 1) * SA_XP_PER_LEVEL_GROWTH;
}

function saClamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

function saRarityMult(rarity: SaRarity): number {
  const found = SA_RARITIES.find(r => r.id === rarity);
  return found ? found.mult : 1.0;
}

function saSeededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function saCreateDaily(seed: number): SaDailyState {
  return {
    daySeed: seed,
    shrineVisited: false,
    fortuneDrawn: false,
    fortuneType: null,
    offeringMade: false,
    meditationCompleted: false,
    streak: 0,
    lastDay: 0,
    dailyXp: 0,
    dailyCoins: 0,
  };
}

function saCreateInitialState(seed?: number): SaSakuraTempleState {
  const s = seed ?? 42;
  return {
    level: 1,
    xp: 0,
    totalXp: 0,
    coins: 50,
    totalCoinsEarned: 50,
    harmony: 0,
    maxHarmony: 0,
    titleId: 'title_pilgrim',
    currentZone: 'cherry_garden',
    currentSeason: 'spring_bloom',
    spirits: SA_SPIRITS.map(sp => ({
      spiritId: sp.id,
      owned: false,
      count: 0,
      bondLevel: 0,
      lastFed: 0,
    })),
    offerings: [],
    unlockedOfferingIds: SA_OFFERINGS.filter(o => o.rarity === 'common').map(o => o.id),
    ownedDecorationIds: [],
    placedDecorationIds: [],
    upgrades: { gardenLevel: 1, hallLevel: 1, shrineLevel: 1, pondLevel: 1, bellLevel: 1, springLevel: 1 },
    meditationSession: null,
    meditationTotalTicks: 0,
    meditationSessionsCompleted: 0,
    currentFocus: 50,
    currentCalm: 50,
    highestEnlightenment: 0,
    achievements: SA_ACHIEVEMENTS.map(a => ({
      achievementId: a.id,
      unlocked: false,
      progress: 0,
      unlockedAt: 0,
    })),
    daily: saCreateDaily(s),
    events: SA_EVENTS.map(e => ({
      eventId: e.id,
      active: false,
      remainingTicks: 0,
      completed: false,
      bonusClaimed: false,
    })),
    totalOfferingsMade: 0,
    totalSpiritsCollected: 0,
    totalMeditationMinutes: 0,
    totalFortunesRead: 0,
    totalDecorationsPlaced: 0,
    blessingsReceived: 0,
    templeReputation: 0,
    petalCount: 0,
    lanternsLit: 0,
    bellRings: 0,
    karma: 0,
    seed: s,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useSakuraTemple(initialSeed?: number) {
  const [state, setState] = useState<SaSakuraTempleState>(() => saCreateInitialState(initialSeed));

  const stateRef = { current: state };
  useEffect(() => { stateRef.current = state; }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Core State Accessors                                               */
  /* ------------------------------------------------------------------ */

  const saGetState = useCallback(() => state, [state]);

  const saGetLevel = useCallback(() => state.level, [state]);

  const saGetXp = useCallback(() => state.xp, [state]);

  const saGetXpToNext = useCallback(() => saXpForLevel(state.level), [state]);

  const saGetTotalXp = useCallback(() => state.totalXp, [state]);

  const saGetCoins = useCallback(() => state.coins, [state]);

  const saGetTotalCoinsEarned = useCallback(() => state.totalCoinsEarned, [state]);

  const saGetHarmony = useCallback(() => state.harmony, [state]);

  const saGetMaxHarmony = useCallback(() => state.maxHarmony, [state]);

  const saGetTitle = useCallback(() => SA_TITLES.find(t => t.id === state.titleId) ?? null, [state]);

  const saGetCurrentZone = useCallback(() => SA_ZONES.find(z => z.id === state.currentZone) ?? null, [state]);

  const saGetCurrentSeason = useCallback(() => SA_SEASONS.find(s => s.id === state.currentSeason) ?? null, [state]);

  const saGetFocus = useCallback(() => state.currentFocus, [state]);

  const saGetCalm = useCallback(() => state.currentCalm, [state]);

  const saGetKarma = useCallback(() => state.karma, [state]);

  const saGetPetalCount = useCallback(() => state.petalCount, [state]);

  const saGetLanternsLit = useCallback(() => state.lanternsLit, [state]);

  const saGetBellRings = useCallback(() => state.bellRings, [state]);

  const saGetTempleReputation = useCallback(() => state.templeReputation, [state]);

  const saGetSeed = useCallback(() => state.seed, [state]);

  /* ------------------------------------------------------------------ */
  /*  XP & Leveling                                                      */
  /* ------------------------------------------------------------------ */

  const saAddXp = useCallback(
    (amount: number) => {
      const season = SA_SEASONS.find(s => s.id === state.currentSeason);
      const mult = season ? season.xpMult : 1.0;
      const activeEvent = state.events.find(e => e.active);
      const eventMult = activeEvent ? (SA_EVENTS.find(ev => ev.id === activeEvent.eventId)?.xpMult ?? 1.0) : 1.0;
      const totalMult = mult * eventMult;
      const actualGain = Math.floor(amount * totalMult);
      setState(prev => {
        let newXp = prev.xp + actualGain;
        let newLevel = prev.level;
        let newTotalXp = prev.totalXp + actualGain;
        while (newXp >= saXpForLevel(newLevel) && newLevel < SA_MAX_LEVEL) {
          newXp -= saXpForLevel(newLevel);
          newLevel += 1;
        }
        const newCoins = saClamp(prev.coins + Math.floor(newLevel * 2 * eventMult), 0, SA_MAX_COINS);
        return { ...prev, xp: newXp, level: newLevel, totalXp: newTotalXp, coins: newCoins };
      });
    },
    [state],
  );

  const saAddCoins = useCallback(
    (amount: number) => {
      setState(prev => {
        const newCoins = saClamp(prev.coins + amount, 0, SA_MAX_COINS);
        const newTotal = prev.totalCoinsEarned + Math.max(0, amount);
        return { ...prev, coins: newCoins, totalCoinsEarned: newTotal };
      });
    },
    [state],
  );

  const saSpendCoins = useCallback(
    (amount: number) => {
      if (state.coins < amount) return false;
      setState(prev => ({ ...prev, coins: prev.coins - amount }));
      return true;
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Harmony                                                            */
  /* ------------------------------------------------------------------ */

  const saAddHarmony = useCallback(
    (amount: number) => {
      setState(prev => {
        const newHarmony = saClamp(prev.harmony + amount, 0, SA_MAX_HARMONY);
        const newMax = Math.max(prev.maxHarmony, newHarmony);
        return { ...prev, harmony: newHarmony, maxHarmony: newMax };
      });
    },
    [state],
  );

  const saGetHarmonyPercentage = useCallback(() => {
    return Math.floor((state.harmony / SA_MAX_HARMONY) * 100);
  }, [state]);

  const saGetTotalHarmonyFromDecorations = useCallback(() => {
    return state.placedDecorationIds.reduce((sum, id) => {
      const deco = SA_DECORATIONS.find(d => d.id === id);
      return sum + (deco ? deco.harmonyBonus : 0);
    }, 0);
  }, [state]);

  const saGetTotalBeautyFromDecorations = useCallback(() => {
    return state.placedDecorationIds.reduce((sum, id) => {
      const deco = SA_DECORATIONS.find(d => d.id === id);
      return sum + (deco ? deco.beautyBonus : 0);
    }, 0);
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Titles                                                             */
  /* ------------------------------------------------------------------ */

  const saGetAvailableTitles = useCallback(() => {
    return SA_TITLES.filter(t => state.level >= t.levelReq && state.harmony >= t.harmonyReq);
  }, [state]);

  const saSetTitle = useCallback(
    (titleId: string) => {
      const title = SA_TITLES.find(t => t.id === titleId);
      if (!title) return;
      if (state.level < title.levelReq || state.harmony < title.harmonyReq) return;
      setState(prev => ({ ...prev, titleId }));
    },
    [state],
  );

  const saGetBestTitle = useCallback(() => {
    const available = SA_TITLES.filter(t => state.level >= t.levelReq && state.harmony >= t.harmonyReq);
    return available.length > 0 ? available[available.length - 1] : SA_TITLES[0];
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Zones                                                              */
  /* ------------------------------------------------------------------ */

  const saTravelToZone = useCallback(
    (zoneId: SaZone) => {
      const zone = SA_ZONES.find(z => z.id === zoneId);
      if (!zone) return;
      if (state.level < zone.unlockLevel) return;
      setState(prev => ({ ...prev, currentZone: zoneId }));
    },
    [state],
  );

  const saGetUnlockedZones = useCallback(() => {
    return SA_ZONES.filter(z => state.level >= z.unlockLevel);
  }, [state]);

  const saGetLockedZones = useCallback(() => {
    return SA_ZONES.filter(z => state.level < z.unlockLevel);
  }, [state]);

  const saIsZoneUnlocked = useCallback(
    (zoneId: SaZone) => {
      const zone = SA_ZONES.find(z => z.id === zoneId);
      return zone ? state.level >= zone.unlockLevel : false;
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Seasons                                                            */
  /* ------------------------------------------------------------------ */

  const saSetSeason = useCallback(
    (seasonId: SaSeason) => {
      const season = SA_SEASONS.find(s => s.id === seasonId);
      if (!season) return;
      setState(prev => ({ ...prev, currentSeason: seasonId }));
    },
    [state],
  );

  const saGetAllSeasons = useCallback(() => SA_SEASONS, [state]);

  const saGetSeasonXpMult = useCallback(() => {
    const season = SA_SEASONS.find(s => s.id === state.currentSeason);
    return season ? season.xpMult : 1.0;
  }, [state]);

  const saGetSeasonCoinMult = useCallback(() => {
    const season = SA_SEASONS.find(s => s.id === state.currentSeason);
    return season ? season.coinMult : 1.0;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Spirits                                                            */
  /* ------------------------------------------------------------------ */

  const saGetSpirit = useCallback(
    (spiritId: string) => state.spirits.find(s => s.spiritId === spiritId) ?? null,
    [state],
  );

  const saGetSpiritDef = useCallback(
    (spiritId: string) => SA_SPIRITS.find(s => s.id === spiritId) ?? null,
    [state],
  );

  const saGetOwnedSpirits = useCallback(() => {
    return state.spirits.filter(s => s.owned).map(s => ({
      record: s,
      def: SA_SPIRITS.find(sp => sp.id === s.spiritId),
    })).filter(item => item.def !== undefined);
  }, [state]);

  const saGetSpiritsByRarity = useCallback(
    (rarity: SaRarity) => {
      return state.spirits.filter(s => {
        const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
        return def && def.rarity === rarity;
      });
    },
    [state],
  );

  const saGetSpiritsByZone = useCallback(
    (zoneId: SaZone) => {
      return SA_SPIRITS.filter(s => s.zone === zoneId);
    },
    [state],
  );

  const saCollectSpirit = useCallback(
    (spiritId: string) => {
      const def = SA_SPIRITS.find(s => s.id === spiritId);
      if (!def) return;
      if (state.level < def.levelReq) return;
      setState(prev => {
        const newSpirits = prev.spirits.map(s => {
          if (s.spiritId !== spiritId) return s;
          return { ...s, owned: true, count: s.count + 1 };
        });
        const totalCollected = prev.totalSpiritsCollected + 1;
        const harmonyGain = Math.floor(def.harmonyBonus * saRarityMult(def.rarity));
        const coinGain = Math.floor(def.coinBonus * saRarityMult(def.rarity));
        const xpGain = Math.floor(def.xpBonus * saRarityMult(def.rarity));
        return {
          ...prev,
          spirits: newSpirits,
          totalSpiritsCollected: totalCollected,
          harmony: saClamp(prev.harmony + harmonyGain, 0, SA_MAX_HARMONY),
          maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + harmonyGain, 0, SA_MAX_HARMONY)),
          coins: saClamp(prev.coins + coinGain, 0, SA_MAX_COINS),
          totalCoinsEarned: prev.totalCoinsEarned + coinGain,
          petalCount: prev.petalCount + (def.rarity === 'legendary' ? 10 : def.rarity === 'epic' ? 5 : def.rarity === 'rare' ? 3 : def.rarity === 'uncommon' ? 2 : 1),
          xp: prev.xp + xpGain,
          totalXp: prev.totalXp + xpGain,
        };
      });
    },
    [state],
  );

  const saFeedSpirit = useCallback(
    (spiritId: string) => {
      const record = state.spirits.find(s => s.spiritId === spiritId);
      if (!record || !record.owned) return;
      if (record.bondLevel >= SA_BOND_MAX) return;
      setState(prev => ({
        ...prev,
        spirits: prev.spirits.map(s => {
          if (s.spiritId !== spiritId) return s;
          return { ...s, bondLevel: Math.min(s.bondLevel + SA_BOND_PER_FEED, SA_BOND_MAX) };
        }),
        harmony: saClamp(prev.harmony + 2, 0, SA_MAX_HARMONY),
      }));
    },
    [state],
  );

  const saGetSpiritBondLevel = useCallback(
    (spiritId: string) => {
      const record = state.spirits.find(s => s.spiritId === spiritId);
      return record ? record.bondLevel : 0;
    },
    [state],
  );

  const saGetTotalSpiritsOwned = useCallback(() => state.spirits.filter(s => s.owned).length, [state]);

  const saGetSpiritsCollectedCount = useCallback(() => state.totalSpiritsCollected, [state]);

  const saGetRandomSpiritForZone = useCallback(
    (zoneId: SaZone) => {
      const zoneSpirits = SA_SPIRITS.filter(s => s.zone === zoneId && s.levelReq <= state.level);
      if (zoneSpirits.length === 0) return null;
      const zoneDef = SA_ZONES.find(z => z.id === zoneId);
      const baseChance = zoneDef ? zoneDef.spiritChance : 0.2;
      const season = SA_SEASONS.find(s => s.id === state.currentSeason);
      const seasonMult = season ? season.spiritChanceMult : 1.0;
      const chance = baseChance * seasonMult;
      const roll = saSeededRandom(state.seed + state.totalSpiritsCollected + Date.now());
      if (roll > chance) return null;
      const rng = saSeededRandom(state.seed + Date.now());
      return zoneSpirits[Math.floor(rng * zoneSpirits.length)] ?? null;
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Offerings & Prayers                                                */
  /* ------------------------------------------------------------------ */

  const saGetOffering = useCallback(
    (offeringId: string) => SA_OFFERINGS.find(o => o.id === offeringId) ?? null,
    [state],
  );

  const saGetAllOfferings = useCallback(() => SA_OFFERINGS, [state]);

  const saGetUnlockedOfferings = useCallback(() => {
    return SA_OFFERINGS.filter(o => state.unlockedOfferingIds.includes(o.id));
  }, [state]);

  const saGetLockedOfferings = useCallback(() => {
    return SA_OFFERINGS.filter(o => !state.unlockedOfferingIds.includes(o.id));
  }, [state]);

  const saUnlockOffering = useCallback(
    (offeringId: string) => {
      const offering = SA_OFFERINGS.find(o => o.id === offeringId);
      if (!offering) return;
      if (state.unlockedOfferingIds.includes(offeringId)) return;
      if (state.coins < offering.cost) return;
      setState(prev => ({
        ...prev,
        coins: prev.coins - offering.cost,
        unlockedOfferingIds: [...prev.unlockedOfferingIds, offeringId],
      }));
    },
    [state],
  );

  const saMakeOffering = useCallback(
    (offeringId: string) => {
      const offering = SA_OFFERINGS.find(o => o.id === offeringId);
      if (!offering) return null;
      if (!state.unlockedOfferingIds.includes(offeringId)) return null;
      const blessingAmount = offering.blessing + Math.floor(state.harmony * 0.1);
      const rng = saSeededRandom(state.seed + state.totalOfferingsMade + Date.now());
      let fortune: SaFortuneType | null = null;
      if (rng < 0.15) {
        const fortuneRoll = saSeededRandom(state.seed + state.totalOfferingsMade * 3 + Date.now());
        if (fortuneRoll < 0.05) fortune = 'great_blessing';
        else if (fortuneRoll < 0.2) fortune = 'middle_blessing';
        else if (fortuneRoll < 0.55) fortune = 'small_blessing';
        else if (fortuneRoll < 0.85) fortune = 'curse';
        else fortune = 'future_blessing';
      }
      const newPrayer: SaPrayerRecord = {
        offeringId,
        timestamp: Date.now(),
        blessing: blessingAmount,
        fortune,
      };
      const fortuneDef = fortune ? SA_FORTUNES.find(f => f.id === fortune) : null;
      const xpGain = blessingAmount * 2 + (fortuneDef ? fortuneDef.xpBonus : 0);
      const coinGain = Math.floor(blessingAmount * 0.5) + (fortuneDef ? fortuneDef.coinBonus : 0);
      setState(prev => ({
        ...prev,
        offerings: [...prev.offerings, newPrayer],
        totalOfferingsMade: prev.totalOfferingsMade + 1,
        blessingsReceived: prev.blessingsReceived + blessingAmount,
        harmony: saClamp(prev.harmony + Math.floor(blessingAmount * 0.3), 0, SA_MAX_HARMONY),
        maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + Math.floor(blessingAmount * 0.3), 0, SA_MAX_HARMONY)),
        xp: prev.xp + xpGain,
        totalXp: prev.totalXp + xpGain,
        coins: saClamp(prev.coins + coinGain, 0, SA_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + coinGain,
        karma: prev.karma + (fortune === 'great_blessing' ? 10 : fortune === 'middle_blessing' ? 5 : fortune === 'small_blessing' ? 2 : fortune === 'curse' ? -1 : 1),
        daily: { ...prev.daily, offeringMade: true },
      }));
      return { prayer: newPrayer, xpGain, coinGain, fortune };
    },
    [state],
  );

  const saGetOfferingsHistory = useCallback(() => state.offerings, [state]);

  const saGetTotalOfferings = useCallback(() => state.totalOfferingsMade, [state]);

  const saGetBlessingsReceived = useCallback(() => state.blessingsReceived, [state]);

  const saGetRecentOfferings = useCallback(
    (count: number) => state.offerings.slice(-count),
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Decorations                                                        */
  /* ------------------------------------------------------------------ */

  const saGetDecoration = useCallback(
    (decoId: string) => SA_DECORATIONS.find(d => d.id === decoId) ?? null,
    [state],
  );

  const saGetAllDecorations = useCallback(() => SA_DECORATIONS, [state]);

  const saGetOwnedDecorations = useCallback(() => {
    return SA_DECORATIONS.filter(d => state.ownedDecorationIds.includes(d.id));
  }, [state]);

  const saGetPlacedDecorations = useCallback(() => {
    return SA_DECORATIONS.filter(d => state.placedDecorationIds.includes(d.id));
  }, [state]);

  const saBuyDecoration = useCallback(
    (decoId: string) => {
      const deco = SA_DECORATIONS.find(d => d.id === decoId);
      if (!deco) return false;
      if (state.level < deco.unlockLevel) return false;
      if (state.coins < deco.cost) return false;
      if (state.ownedDecorationIds.includes(decoId)) return false;
      setState(prev => ({
        ...prev,
        coins: prev.coins - deco.cost,
        ownedDecorationIds: [...prev.ownedDecorationIds, decoId],
      }));
      return true;
    },
    [state],
  );

  const saPlaceDecoration = useCallback(
    (decoId: string) => {
      if (!state.ownedDecorationIds.includes(decoId)) return;
      if (state.placedDecorationIds.includes(decoId)) return;
      setState(prev => ({
        ...prev,
        placedDecorationIds: [...prev.placedDecorationIds, decoId],
        totalDecorationsPlaced: prev.totalDecorationsPlaced + 1,
        harmony: saClamp(prev.harmony + 3, 0, SA_MAX_HARMONY),
        maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + 3, 0, SA_MAX_HARMONY)),
      }));
    },
    [state],
  );

  const saRemoveDecoration = useCallback(
    (decoId: string) => {
      setState(prev => ({
        ...prev,
        placedDecorationIds: prev.placedDecorationIds.filter(id => id !== decoId),
      }));
    },
    [state],
  );

  const saGetAvailableDecorations = useCallback(() => {
    return SA_DECORATIONS.filter(d => state.level >= d.unlockLevel);
  }, [state]);

  const saGetDecorationsByCategory = useCallback(
    (category: SaDecoCategory) => {
      return SA_DECORATIONS.filter(d => d.category === category && state.ownedDecorationIds.includes(d.id));
    },
    [state],
  );

  const saGetTotalDecorationsPlaced = useCallback(() => state.totalDecorationsPlaced, [state]);

  /* ------------------------------------------------------------------ */
  /*  Meditation                                                         */
  /* ------------------------------------------------------------------ */

  const saStartMeditation = useCallback(
    (typeId: SaMeditationType) => {
      const def = SA_MEDITATION_TYPES.find(m => m.id === typeId);
      if (!def) return;
      if (state.meditationSession && state.meditationSession.active) return;
      setState(prev => ({
        ...prev,
        meditationSession: {
          type: typeId,
          focus: prev.currentFocus,
          calm: prev.currentCalm,
          state: 'calm',
          duration: 60,
          completed: 0,
          active: true,
        },
      }));
    },
    [state],
  );

  const saTickMeditation = useCallback(
    () => {
      if (!state.meditationSession || !state.meditationSession.active) return;
      setState(prev => {
        const session = prev.meditationSession;
        if (!session || !session.active) return prev;
        const def = SA_MEDITATION_TYPES.find(m => m.id === session.type);
        const focusGain = def ? def.baseFocus : SA_MEDITATION_FOCUS_RATE;
        const calmGain = def ? def.baseCalm : SA_MEDITATION_CALM_RATE;
        const newFocus = saClamp(session.focus + focusGain, 0, SA_MAX_FOCUS);
        const newCalm = saClamp(session.calm + calmGain, 0, SA_MAX_CALM);
        const newCompleted = session.completed + 1;
        let meditationState: SaMeditationState = 'calm';
        if (newFocus >= 70 && newCalm >= 70) {
          const enlightenChance = def ? def.enlightenmentChance : 0.05;
          const roll = saSeededRandom(prev.seed + newCompleted + Date.now());
          if (roll < enlightenChance) meditationState = 'enlightenment';
          else meditationState = 'focus';
        } else if (newFocus >= 50 || newCalm >= 50) {
          meditationState = 'focus';
        }
        const isComplete = newCompleted >= session.duration;
        const newSession = { ...session, focus: newFocus, calm: newCalm, state: meditationState, completed: newCompleted, active: !isComplete };
        const xpGain = Math.floor((newFocus + newCalm) * 0.5);
        const enlightenBonus = meditationState === 'enlightenment' ? 50 : 0;
        const harmonyGain = meditationState === 'enlightenment' ? 5 : meditationState === 'focus' ? 2 : 1;
        return {
          ...prev,
          meditationSession: isComplete ? null : newSession,
          meditationTotalTicks: prev.meditationTotalTicks + 1,
          meditationSessionsCompleted: prev.meditationSessionsCompleted + (isComplete ? 1 : 0),
          totalMeditationMinutes: prev.totalMeditationMinutes + 1,
          currentFocus: isComplete ? saClamp(newFocus, 0, SA_MAX_FOCUS) : prev.currentFocus,
          currentCalm: isComplete ? saClamp(newCalm, 0, SA_MAX_CALM) : prev.currentCalm,
          highestEnlightenment: Math.max(prev.highestEnlightenment, newFocus + newCalm),
          xp: prev.xp + xpGain + enlightenBonus,
          totalXp: prev.totalXp + xpGain + enlightenBonus,
          harmony: saClamp(prev.harmony + harmonyGain, 0, SA_MAX_HARMONY),
          maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + harmonyGain, 0, SA_MAX_HARMONY)),
          daily: isComplete ? { ...prev.daily, meditationCompleted: true } : prev.daily,
        };
      });
    },
    [state],
  );

  const saStopMeditation = useCallback(() => {
    if (!state.meditationSession) return;
    setState(prev => ({
      ...prev,
      meditationSession: null,
      currentFocus: saClamp(prev.meditationSession?.focus ?? prev.currentFocus, 0, SA_MAX_FOCUS),
      currentCalm: saClamp(prev.meditationSession?.calm ?? prev.currentCalm, 0, SA_MAX_CALM),
    }));
  }, [state]);

  const saGetMeditationSession = useCallback(() => state.meditationSession, [state]);

  const saGetMeditationType = useCallback(
    (typeId: SaMeditationType) => SA_MEDITATION_TYPES.find(m => m.id === typeId) ?? null,
    [state],
  );

  const saGetAllMeditationTypes = useCallback(() => SA_MEDITATION_TYPES, [state]);

  const saGetTotalMeditationTicks = useCallback(() => state.meditationTotalTicks, [state]);

  const saGetMeditationSessionsCompleted = useCallback(() => state.meditationSessionsCompleted, [state]);

  const saGetTotalMeditationMinutes = useCallback(() => state.totalMeditationMinutes, [state]);

  const saGetHighestEnlightenment = useCallback(() => state.highestEnlightenment, [state]);

  const saGetCurrentMeditationState = useCallback((): SaMeditationState => {
    if (!state.meditationSession) return 'calm';
    return state.meditationSession.state;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Fortune                                                            */
  /* ------------------------------------------------------------------ */

  const saDrawFortune = useCallback(() => {
    if (state.daily.fortuneDrawn) return null;
    const rng = saSeededRandom(state.seed + state.daily.daySeed + 777);
    const roll = rng;
    let fortuneType: SaFortuneType;
    if (roll < 0.05) fortuneType = 'great_blessing';
    else if (roll < 0.2) fortuneType = 'middle_blessing';
    else if (roll < 0.55) fortuneType = 'small_blessing';
    else if (roll < 0.8) fortuneType = 'curse';
    else fortuneType = 'future_blessing';
    const fortune = SA_FORTUNES.find(f => f.id === fortuneType);
    const xpGain = fortune ? fortune.xpBonus : 10;
    const coinGain = fortune ? fortune.coinBonus : 20;
    setState(prev => ({
      ...prev,
      daily: { ...prev.daily, fortuneDrawn: true, fortuneType },
      totalFortunesRead: prev.totalFortunesRead + 1,
      xp: prev.xp + xpGain,
      totalXp: prev.totalXp + xpGain,
      coins: saClamp(prev.coins + coinGain, 0, SA_MAX_COINS),
      totalCoinsEarned: prev.totalCoinsEarned + coinGain,
      karma: prev.karma + (fortuneType === 'great_blessing' ? 5 : fortuneType === 'curse' ? -2 : 1),
    }));
    return { fortuneType, xpGain, coinGain, fortune };
  }, [state]);

  const saGetTodayFortune = useCallback(() => {
    if (!state.daily.fortuneType) return null;
    return SA_FORTUNES.find(f => f.id === state.daily.fortuneType) ?? null;
  }, [state]);

  const saGetFortune = useCallback(
    (fortuneId: SaFortuneType) => SA_FORTUNES.find(f => f.id === fortuneId) ?? null,
    [state],
  );

  const saGetAllFortunes = useCallback(() => SA_FORTUNES, [state]);

  const saGetTotalFortunesRead = useCallback(() => state.totalFortunesRead, [state]);

  /* ------------------------------------------------------------------ */
  /*  Daily Shrine Visit                                                 */
  /* ------------------------------------------------------------------ */

  const saVisitShrine = useCallback(() => {
    if (state.daily.shrineVisited) return;
    setState(prev => ({
      ...prev,
      daily: { ...prev.daily, shrineVisited: true },
      xp: prev.xp + SA_SHRINE_VISIT_XP,
      totalXp: prev.totalXp + SA_SHRINE_VISIT_XP,
      harmony: saClamp(prev.harmony + 2, 0, SA_MAX_HARMONY),
      maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + 2, 0, SA_MAX_HARMONY)),
      karma: prev.karma + 1,
      lanternsLit: prev.lanternsLit + 1,
    }));
  }, [state]);

  const saGetShrineVisited = useCallback(() => state.daily.shrineVisited, [state]);

  const saGetDailyStreak = useCallback(() => state.daily.streak, [state]);

  const saGetDailyComplete = useCallback(() => {
    return state.daily.shrineVisited && state.daily.meditationCompleted && state.daily.offeringMade;
  }, [state]);

  const saAdvanceDaily = useCallback(
    (newDaySeed: number) => {
      const wasComplete = state.daily.shrineVisited;
      const newStreak = wasComplete ? state.daily.streak + 1 : 0;
      const streakBonus = newStreak * SA_DAILY_STREAK_BONUS;
      setState(prev => ({
        ...prev,
        daily: {
          daySeed: newDaySeed,
          shrineVisited: false,
          fortuneDrawn: false,
          fortuneType: null,
          offeringMade: false,
          meditationCompleted: false,
          streak: newStreak,
          lastDay: newDaySeed,
          dailyXp: 0,
          dailyCoins: 0,
        },
        coins: saClamp(prev.coins + streakBonus, 0, SA_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + streakBonus,
        karma: prev.karma + (newStreak > 0 ? 1 : 0),
      }));
    },
    [state],
  );

  const saGetDailyState = useCallback(() => state.daily, [state]);

  /* ------------------------------------------------------------------ */
  /*  Temple Upgrades                                                    */
  /* ------------------------------------------------------------------ */

  const saGetUpgrades = useCallback(() => state.upgrades, [state]);

  const saGetUpgradeCost = useCallback(
    (key: keyof SaTempleUpgrade) => {
      const currentLevel = state.upgrades[key];
      return 50 + currentLevel * 30 + Math.floor(currentLevel * currentLevel * 5);
    },
    [state],
  );

  const saUpgradeTemple = useCallback(
    (key: keyof SaTempleUpgrade) => {
      const cost = saGetUpgradeCost(key);
      if (state.coins < cost) return false;
      if (state.upgrades[key] >= 10) return false;
      setState(prev => ({
        ...prev,
        coins: prev.coins - cost,
        upgrades: { ...prev.upgrades, [key]: prev.upgrades[key] + 1 },
        harmony: saClamp(prev.harmony + 3, 0, SA_MAX_HARMONY),
        maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + 3, 0, SA_MAX_HARMONY)),
        templeReputation: prev.templeReputation + 5,
      }));
      return true;
    },
    [state, saGetUpgradeCost],
  );

  const saGetUpgradeLevel = useCallback(
    (key: keyof SaTempleUpgrade) => state.upgrades[key],
    [state],
  );

  const saGetTotalUpgradeLevels = useCallback(() => {
    const u = state.upgrades;
    return u.gardenLevel + u.hallLevel + u.shrineLevel + u.pondLevel + u.bellLevel + u.springLevel;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Events                                                             */
  /* ------------------------------------------------------------------ */

  const saGetEvents = useCallback(() => state.events, [state]);

  const saGetActiveEvents = useCallback(() => {
    return state.events.filter(e => e.active);
  }, [state]);

  const saGetEvent = useCallback(
    (eventId: SaEventType) => SA_EVENTS.find(e => e.id === eventId) ?? null,
    [state],
  );

  const saGetAllEvents = useCallback(() => SA_EVENTS, [state]);

  const saStartEvent = useCallback(
    (eventId: SaEventType) => {
      const eventDef = SA_EVENTS.find(e => e.id === eventId);
      if (!eventDef) return;
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => {
          if (e.eventId !== eventId) return e;
          return { ...e, active: true, remainingTicks: eventDef.duration, completed: false, bonusClaimed: false };
        }),
      }));
    },
    [state],
  );

  const saTickEvent = useCallback(() => {
    setState(prev => ({
      ...prev,
      events: prev.events.map(e => {
        if (!e.active) return e;
        const newRemaining = e.remainingTicks - 1;
        if (newRemaining <= 0) {
          return { ...e, active: false, remainingTicks: 0, completed: true };
        }
        return { ...e, remainingTicks: newRemaining };
      }),
    }));
  }, [state]);

  const saClaimEventBonus = useCallback(
    (eventId: SaEventType) => {
      setState(prev => ({
        ...prev,
        events: prev.events.map(e => {
          if (e.eventId !== eventId) return e;
          return { ...e, bonusClaimed: true };
        }),
        coins: saClamp(prev.coins + 100, 0, SA_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + 100,
        xp: prev.xp + 200,
        totalXp: prev.totalXp + 200,
      }));
    },
    [state],
  );

  const saGetEventXpMult = useCallback(() => {
    const activeEvents = state.events.filter(e => e.active);
    if (activeEvents.length === 0) return 1.0;
    let mult = 1.0;
    for (const ae of activeEvents) {
      const ed = SA_EVENTS.find(e => e.id === ae.eventId);
      if (ed) mult *= ed.xpMult;
    }
    return mult;
  }, [state]);

  const saGetEventCoinMult = useCallback(() => {
    const activeEvents = state.events.filter(e => e.active);
    if (activeEvents.length === 0) return 1.0;
    let mult = 1.0;
    for (const ae of activeEvents) {
      const ed = SA_EVENTS.find(e => e.id === ae.eventId);
      if (ed) mult *= ed.coinMult;
    }
    return mult;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Bell Ringing & Lanterns                                            */
  /* ------------------------------------------------------------------ */

  const saRingBell = useCallback(() => {
    setState(prev => ({
      ...prev,
      bellRings: prev.bellRings + 1,
      harmony: saClamp(prev.harmony + 1, 0, SA_MAX_HARMONY),
      maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + 1, 0, SA_MAX_HARMONY)),
      karma: prev.karma + 1,
    }));
  }, [state]);

  const saLightLantern = useCallback(() => {
    setState(prev => ({
      ...prev,
      lanternsLit: prev.lanternsLit + 1,
      coins: saClamp(prev.coins - 1, 0, SA_MAX_COINS),
      harmony: saClamp(prev.harmony + 1, 0, SA_MAX_HARMONY),
      maxHarmony: Math.max(prev.maxHarmony, saClamp(prev.harmony + 1, 0, SA_MAX_HARMONY)),
    }));
  }, [state]);

  const saCollectPetals = useCallback(
    (count: number) => {
      setState(prev => ({
        ...prev,
        petalCount: prev.petalCount + count,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Achievements                                                       */
  /* ------------------------------------------------------------------ */

  const saGetAchievements = useCallback(() => state.achievements, [state]);

  const saGetAchievement = useCallback(
    (achievementId: string) => state.achievements.find(a => a.achievementId === achievementId) ?? null,
    [state],
  );

  const saGetAllAchievementDefs = useCallback(() => SA_ACHIEVEMENTS, [state]);

  const saGetUnlockedAchievements = useCallback(() => {
    return state.achievements
      .filter(a => a.unlocked)
      .map(a => ({ record: a, def: SA_ACHIEVEMENTS.find(d => d.id === a.achievementId) }))
      .filter(item => item.def !== undefined);
  }, [state]);

  const saGetAchievementProgress = useCallback(
    (condition: string) => {
      switch (condition) {
        case 'spirits_collected': return state.totalSpiritsCollected;
        case 'common_spirits': return state.spirits.filter(s => {
          const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
          return def && def.rarity === 'common' && s.owned;
        }).length;
        case 'rare_spirit': return state.spirits.filter(s => {
          const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
          return def && def.rarity === 'rare' && s.owned;
        }).length;
        case 'epic_spirit': return state.spirits.filter(s => {
          const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
          return def && def.rarity === 'epic' && s.owned;
        }).length;
        case 'legendary_spirit': return state.spirits.filter(s => {
          const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
          return def && def.rarity === 'legendary' && s.owned;
        }).length;
        case 'meditations_completed': return state.meditationSessionsCompleted;
        case 'enlightenment_reached': return state.highestEnlightenment >= SA_ENLIGHTENMENT_THRESHOLD * 2 ? 1 : 0;
        case 'offerings_made': return state.totalOfferingsMade;
        case 'harmony': return state.harmony;
        case 'level': return state.level;
        case 'daily_streak': return state.daily.streak;
        default: return 0;
      }
    },
    [state],
  );

  const saCheckAchievements = useCallback(() => {
    setState(prev => {
      let changed = false;
      const newAchievements = prev.achievements.map(a => {
        if (a.unlocked) return a;
        const def = SA_ACHIEVEMENTS.find(d => d.id === a.achievementId);
        if (!def) return a;
        let progress = 0;
        switch (def.condition) {
          case 'spirits_collected': progress = prev.totalSpiritsCollected; break;
          case 'common_spirits': progress = prev.spirits.filter(s => {
            const sd = SA_SPIRITS.find(sp => sp.id === s.spiritId);
            return sd && sd.rarity === 'common' && s.owned;
          }).length; break;
          case 'rare_spirit': progress = prev.spirits.filter(s => {
            const sd = SA_SPIRITS.find(sp => sp.id === s.spiritId);
            return sd && sd.rarity === 'rare' && s.owned;
          }).length; break;
          case 'epic_spirit': progress = prev.spirits.filter(s => {
            const sd = SA_SPIRITS.find(sp => sp.id === s.spiritId);
            return sd && sd.rarity === 'epic' && s.owned;
          }).length; break;
          case 'legendary_spirit': progress = prev.spirits.filter(s => {
            const sd = SA_SPIRITS.find(sp => sp.id === s.spiritId);
            return sd && sd.rarity === 'legendary' && s.owned;
          }).length; break;
          case 'meditations_completed': progress = prev.meditationSessionsCompleted; break;
          case 'enlightenment_reached': progress = prev.highestEnlightenment >= SA_ENLIGHTENMENT_THRESHOLD * 2 ? 1 : 0; break;
          case 'offerings_made': progress = prev.totalOfferingsMade; break;
          case 'harmony': progress = prev.harmony; break;
          case 'level': progress = prev.level; break;
          case 'daily_streak': progress = prev.daily.streak; break;
        }
        if (progress >= def.target) {
          changed = true;
          return { ...a, unlocked: true, progress: def.target, unlockedAt: Date.now() };
        }
        return { ...a, progress };
      });
      if (!changed) return prev;
      let bonusXp = 0;
      let bonusCoins = 0;
      for (const a of newAchievements) {
        if (a.unlocked) {
          const def = SA_ACHIEVEMENTS.find(d => d.id === a.achievementId);
          if (def && a.unlockedAt === Date.now()) {
            bonusXp += def.reward.xp;
            bonusCoins += def.reward.coins;
          }
        }
      }
      return {
        ...prev,
        achievements: newAchievements,
        xp: prev.xp + bonusXp,
        totalXp: prev.totalXp + bonusXp,
        coins: saClamp(prev.coins + bonusCoins, 0, SA_MAX_COINS),
        totalCoinsEarned: prev.totalCoinsEarned + bonusCoins,
      };
    });
  }, [state]);

  const saGetAchievementCount = useCallback(() => state.achievements.filter(a => a.unlocked).length, [state]);

  const saGetTotalAchievementCount = useCallback(() => SA_ACHIEVEMENTS.length, [state]);

  /* ------------------------------------------------------------------ */
  /*  Quotes                                                             */
  /* ------------------------------------------------------------------ */

  const saGetRandomQuote = useCallback(() => {
    const idx = Math.floor(saSeededRandom(state.seed + Date.now()) * SA_QUOTES.length);
    return SA_QUOTES[idx % SA_QUOTES.length];
  }, [state]);

  const saGetQuoteByIndex = useCallback(
    (index: number) => SA_QUOTES[index % SA_QUOTES.length],
    [state],
  );

  const saGetAllQuotes = useCallback(() => SA_QUOTES, [state]);

  /* ------------------------------------------------------------------ */
  /*  Computed Values                                                    */
  /* ------------------------------------------------------------------ */

  const saGetOverallStats = useMemo(() => ({
    level: state.level,
    xp: state.xp,
    xpToNext: saXpForLevel(state.level),
    totalXp: state.totalXp,
    coins: state.coins,
    harmony: state.harmony,
    maxHarmony: state.maxHarmony,
    spiritsOwned: state.spirits.filter(s => s.owned).length,
    totalSpirits: SA_SPIRITS.length,
    offeringsMade: state.totalOfferingsMade,
    meditationsCompleted: state.meditationSessionsCompleted,
    dailyStreak: state.daily.streak,
    achievementsUnlocked: state.achievements.filter(a => a.unlocked).length,
    totalAchievements: SA_ACHIEVEMENTS.length,
    petalCount: state.petalCount,
    karma: state.karma,
    templeReputation: state.templeReputation,
  }), [state]);

  const saGetCollectionProgress = useMemo(() => {
    const byRarity: Record<SaRarity, { owned: number; total: number }> = {
      common: { owned: 0, total: 0 },
      uncommon: { owned: 0, total: 0 },
      rare: { owned: 0, total: 0 },
      epic: { owned: 0, total: 0 },
      legendary: { owned: 0, total: 0 },
    };
    for (const sp of SA_SPIRITS) {
      byRarity[sp.rarity].total += 1;
      const record = state.spirits.find(s => s.spiritId === sp.id);
      if (record && record.owned) byRarity[sp.rarity].owned += 1;
    }
    return byRarity;
  }, [state]);

  const saGetZoneCompletion = useMemo(() => {
    return SA_ZONES.map(z => {
      const zoneSpirits = SA_SPIRITS.filter(s => s.zone === z.id);
      const owned = zoneSpirits.filter(sp => {
        const record = state.spirits.find(s => s.spiritId === sp.id);
        return record && record.owned;
      }).length;
      return { zone: z, total: zoneSpirits.length, owned, unlocked: state.level >= z.unlockLevel };
    });
  }, [state]);

  const saGetActiveXpMult = useMemo(() => {
    const season = SA_SEASONS.find(s => s.id === state.currentSeason);
    const seasonMult = season ? season.xpMult : 1.0;
    const activeEvent = state.events.find(e => e.active);
    let eventMult = 1.0;
    if (activeEvent) {
      const ed = SA_EVENTS.find(e => e.id === activeEvent.eventId);
      if (ed) eventMult = ed.xpMult;
    }
    return seasonMult * eventMult;
  }, [state]);

  const saGetActiveCoinMult = useMemo(() => {
    const season = SA_SEASONS.find(s => s.id === state.currentSeason);
    const seasonMult = season ? season.coinMult : 1.0;
    const activeEvent = state.events.find(e => e.active);
    let eventMult = 1.0;
    if (activeEvent) {
      const ed = SA_EVENTS.find(e => e.id === activeEvent.eventId);
      if (ed) eventMult = ed.coinMult;
    }
    return seasonMult * eventMult;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Reset                                                              */
  /* ------------------------------------------------------------------ */

  const saReset = useCallback(
    (newSeed?: number) => {
      setState(saCreateInitialState(newSeed ?? state.seed));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Karma & Reputation                                                 */
  /* ------------------------------------------------------------------ */

  const saAddKarma = useCallback(
    (amount: number) => {
      setState(prev => ({
        ...prev,
        karma: prev.karma + amount,
      }));
    },
    [state],
  );

  const saAddReputation = useCallback(
    (amount: number) => {
      setState(prev => ({
        ...prev,
        templeReputation: prev.templeReputation + amount,
      }));
    },
    [state],
  );

  /* ------------------------------------------------------------------ */
  /*  Level Progress Bar                                                 */
  /* ------------------------------------------------------------------ */

  const saGetLevelProgress = useMemo(() => {
    const xpNeeded = saXpForLevel(state.level);
    return { current: state.xp, needed: xpNeeded, percentage: Math.floor((state.xp / xpNeeded) * 100) };
  }, [state]);

  const saGetNextTitle = useMemo(() => {
    const nextTitle = SA_TITLES.find(t => state.level < t.levelReq || state.harmony < t.harmonyReq);
    if (!nextTitle) return null;
    const levelProgress = Math.min(state.level / nextTitle.levelReq, 1.0) * 100;
    const harmonyProgress = Math.min(state.harmony / nextTitle.harmonyReq, 1.0) * 100;
    return { title: nextTitle, levelProgress, harmonyProgress };
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Spirit Power Score                                                 */
  /* ------------------------------------------------------------------ */

  const saGetSpiritPowerScore = useMemo(() => {
    let totalPower = 0;
    for (const s of state.spirits) {
      if (!s.owned) continue;
      const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
      if (def) {
        totalPower += def.power * (1 + s.bondLevel * 0.1);
      }
    }
    return Math.floor(totalPower);
  }, [state]);

  const saGetHarmonyFromSpirits = useMemo(() => {
    let total = 0;
    for (const s of state.spirits) {
      if (!s.owned) continue;
      const def = SA_SPIRITS.find(sp => sp.id === s.spiritId);
      if (def) total += def.harmonyBonus;
    }
    return total;
  }, [state]);

  /* ------------------------------------------------------------------ */
  /*  Temple Serenity Score                                              */
  /* ------------------------------------------------------------------ */

  const saGetTempleSerenity = useMemo(() => {
    const decoHarmony = state.placedDecorationIds.reduce((sum, id) => {
      const d = SA_DECORATIONS.find(dd => dd.id === id);
      return sum + (d ? d.harmonyBonus : 0);
    }, 0);
    const spiritHarmony = saGetHarmonyFromSpirits;
    const upgradeBonus = state.upgrades.gardenLevel + state.upgrades.hallLevel + state.upgrades.shrineLevel + state.upgrades.pondLevel + state.upgrades.bellLevel + state.upgrades.springLevel;
    const season = SA_SEASONS.find(s => s.id === state.currentSeason);
    const seasonBonus = season ? season.harmonyBonus : 0;
    const base = state.harmony;
    const total = base + decoHarmony + spiritHarmony + upgradeBonus * 2 + seasonBonus;
    return { total, base, decoHarmony, spiritHarmony, upgradeBonus, seasonBonus };
  }, [state, saGetHarmonyFromSpirits]);

  /* ------------------------------------------------------------------ */
  /*  Return                                                             */
  /* ------------------------------------------------------------------ */

  return {
    // Core State
    saGetState,
    saGetLevel,
    saGetXp,
    saGetXpToNext,
    saGetTotalXp,
    saGetCoins,
    saGetTotalCoinsEarned,
    saGetHarmony,
    saGetMaxHarmony,
    saGetTitle,
    saGetCurrentZone,
    saGetCurrentSeason,
    saGetFocus,
    saGetCalm,
    saGetKarma,
    saGetPetalCount,
    saGetLanternsLit,
    saGetBellRings,
    saGetTempleReputation,
    saGetSeed,
    // XP & Leveling
    saAddXp,
    saAddCoins,
    saSpendCoins,
    // Harmony
    saAddHarmony,
    saGetHarmonyPercentage,
    saGetTotalHarmonyFromDecorations,
    saGetTotalBeautyFromDecorations,
    // Titles
    saGetAvailableTitles,
    saSetTitle,
    saGetBestTitle,
    // Zones
    saTravelToZone,
    saGetUnlockedZones,
    saGetLockedZones,
    saIsZoneUnlocked,
    // Seasons
    saSetSeason,
    saGetAllSeasons,
    saGetSeasonXpMult,
    saGetSeasonCoinMult,
    // Spirits
    saGetSpirit,
    saGetSpiritDef,
    saGetOwnedSpirits,
    saGetSpiritsByRarity,
    saGetSpiritsByZone,
    saCollectSpirit,
    saFeedSpirit,
    saGetSpiritBondLevel,
    saGetTotalSpiritsOwned,
    saGetSpiritsCollectedCount,
    saGetRandomSpiritForZone,
    // Offerings & Prayers
    saGetOffering,
    saGetAllOfferings,
    saGetUnlockedOfferings,
    saGetLockedOfferings,
    saUnlockOffering,
    saMakeOffering,
    saGetOfferingsHistory,
    saGetTotalOfferings,
    saGetBlessingsReceived,
    saGetRecentOfferings,
    // Decorations
    saGetDecoration,
    saGetAllDecorations,
    saGetOwnedDecorations,
    saGetPlacedDecorations,
    saBuyDecoration,
    saPlaceDecoration,
    saRemoveDecoration,
    saGetAvailableDecorations,
    saGetDecorationsByCategory,
    saGetTotalDecorationsPlaced,
    // Meditation
    saStartMeditation,
    saTickMeditation,
    saStopMeditation,
    saGetMeditationSession,
    saGetMeditationType,
    saGetAllMeditationTypes,
    saGetTotalMeditationTicks,
    saGetMeditationSessionsCompleted,
    saGetTotalMeditationMinutes,
    saGetHighestEnlightenment,
    saGetCurrentMeditationState,
    // Fortune
    saDrawFortune,
    saGetTodayFortune,
    saGetFortune,
    saGetAllFortunes,
    saGetTotalFortunesRead,
    // Daily Shrine
    saVisitShrine,
    saGetShrineVisited,
    saGetDailyStreak,
    saGetDailyComplete,
    saAdvanceDaily,
    saGetDailyState,
    // Upgrades
    saGetUpgrades,
    saGetUpgradeCost,
    saUpgradeTemple,
    saGetUpgradeLevel,
    saGetTotalUpgradeLevels,
    // Events
    saGetEvents,
    saGetActiveEvents,
    saGetEvent,
    saGetAllEvents,
    saStartEvent,
    saTickEvent,
    saClaimEventBonus,
    saGetEventXpMult,
    saGetEventCoinMult,
    // Bell & Lanterns
    saRingBell,
    saLightLantern,
    saCollectPetals,
    // Achievements
    saGetAchievements,
    saGetAchievement,
    saGetAllAchievementDefs,
    saGetUnlockedAchievements,
    saGetAchievementProgress,
    saCheckAchievements,
    saGetAchievementCount,
    saGetTotalAchievementCount,
    // Quotes
    saGetRandomQuote,
    saGetQuoteByIndex,
    saGetAllQuotes,
    // Computed
    saGetOverallStats,
    saGetCollectionProgress,
    saGetZoneCompletion,
    saGetActiveXpMult,
    saGetActiveCoinMult,
    saGetLevelProgress,
    saGetNextTitle,
    saGetSpiritPowerScore,
    saGetTempleSerenity,
    // Karma & Reputation
    saAddKarma,
    saAddReputation,
    // Reset
    saReset,
  };
}
