/**
 * quartz-craft-wire.ts
 *
 * Quartz Crafting (水晶工艺) — A crystal/gemstone crafting game where players
 * discover 12 crystal types, shape them in 6 forms, arrange a 5x5 crystal grid,
 * forge 8 jewelry types, harness moon phase enhancements, meditate with 5 singing
 * bowls, earn 15 achievements, and progress from level 1 to 50.
 *
 * NO React imports in named exports — ONLY in the default export hook.
 * NO localStorage / window / document / setInterval / setTimeout.
 * All named exports use the `qz` prefix.
 * No named functions starting with "use".
 * Default export: `export default function useQuartzCraft(initialState?)`
 * No `useMemo` / `useCallback` / `useRef` — just `useState`.
 * Interfaces use `readonly` for definition properties.
 * Local variables use `const`.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: TYPES
// ═══════════════════════════════════════════════════════════════════════════════

/** 12 crystal types in the game. */
export type QzCrystalType =
  | 'clear_quartz'
  | 'rose_quartz'
  | 'amethyst'
  | 'citrine'
  | 'smoky_quartz'
  | 'prasiolite'
  | 'rutilated_quartz'
  | 'tourmalinated_quartz'
  | 'herkimer_diamond'
  | 'phantom_quartz'
  | 'blue_quartz'
  | 'milky_quartz';

/** 6 crystal shapes. */
export type QzShape = 'natural_point' | 'tumbled_stone' | 'faceted_gem' | 'sphere' | 'pyramid' | 'heart';

/** 8 jewelry types. */
export type QzJewelryType =
  | 'pendant_necklace' | 'ring' | 'bracelet' | 'earrings'
  | 'crown_tiara' | 'amulet' | 'brooch' | 'anklet';

/** 8 moon phases. */
export type QzMoonPhase =
  | 'new_moon' | 'waxing_crescent' | 'first_quarter' | 'waxing_gibbous'
  | 'full_moon' | 'waning_gibbous' | 'last_quarter' | 'waning_crescent';

/** 5 singing bowl chakras. */
export type QzBowlChakra =
  | 'root' | 'sacral' | 'solar_plexus' | 'heart' | 'third_eye';

/** 15 achievement identifiers. */
export type QzAchievementId =
  | 'first_cut' | 'gem_collector' | 'master_cutter'
  | 'jewelry_artisan' | 'moon_child' | 'bowl_resonance'
  | 'grid_master' | 'crystal_sage' | 'quartz_lord'
  | 'rarest_find' | 'shape_shifter' | 'power_crafter'
  | 'enlightened' | 'harmony_grid' | 'lunar_master';

/** Meditation state during singing bowl sessions. */
export type QzMeditationState = 'idle' | 'breathing' | 'resonating' | 'peak' | 'completed';

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

/** Definition for one of the 12 crystal types. */
export interface QzCrystalDef {
  readonly id: QzCrystalType;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly glow: string;
  readonly element: 'earth' | 'water' | 'fire' | 'air' | 'aether';
  readonly chakra: string;
  readonly baseValue: number;
  readonly xpReward: number;
  readonly hardness: number;
  readonly clarity: number;
  readonly lore: string;
}

/** Definition for one of the 6 crystal shapes. */
export interface QzShapeDef {
  readonly id: QzShape;
  readonly name: string;
  readonly description: string;
  readonly difficulty: number;
  readonly valueMultiplier: number;
  readonly xpBonus: number;
  readonly minLevel: number;
}

/** Definition for one of the 8 jewelry types. */
export interface QzJewelryDef {
  readonly id: QzJewelryType;
  readonly name: string;
  readonly description: string;
  readonly slots: number;
  readonly basePower: number;
  readonly valueMultiplier: number;
  readonly minLevel: number;
}

/** Definition for one of the 8 moon phases. */
export interface QzMoonPhaseDef {
  readonly id: QzMoonPhase;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly xpMultiplier: number;
  readonly craftBonus: number;
  readonly discoveryBonus: number;
  readonly meditationBonus: number;
}

/** Definition for one of the 5 singing bowls. */
export interface QzBowlDef {
  readonly id: QzBowlChakra;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly frequency: number;
  readonly focusGain: number;
  readonly xpPerSession: number;
  readonly minLevel: number;
}

/** Definition for one of the 15 achievements. */
export interface QzAchievementDef {
  readonly id: QzAchievementId;
  readonly name: string;
  readonly description: string;
  readonly condition: string;
  readonly target: number;
  readonly rewardCoins: number;
  readonly rewardXp: number;
  readonly icon: string;
}

/** A single crystal instance in the player inventory. */
export interface QzInventoryCrystal {
  readonly instanceId: string;
  crystalType: QzCrystalType;
  shape: QzShape;
  quality: number;
  xpValue: number;
  coinValue: number;
  craftedAt: number;
}

/** A crafted jewelry item. */
export interface QzCraftedJewelry {
  readonly instanceId: string;
  jewelryType: QzJewelryType;
  crystals: string[];
  power: number;
  coinValue: number;
  craftedAt: number;
}

/** A cell in the 5x5 crystal grid. */
export interface QzGridCell {
  row: number;
  col: number;
  crystalType: QzCrystalType | null;
  shape: QzShape | null;
}

/** Meditation session state. */
export interface QzMeditationSession {
  bowlChakra: QzBowlChakra | null;
  state: QzMeditationState;
  focus: number;
  ticksRemaining: number;
  totalFocusGained: number;
}

/** Achievement progress record. */
export interface QzAchievementRecord {
  achievementId: QzAchievementId;
  unlocked: boolean;
  progress: number;
  unlockedAt: number;
}

/** Daily discovery state. */
export interface QzDailyState {
  daySeed: number;
  discoveriesMade: number;
  maxDiscoveries: number;
  bonusCrystalType: QzCrystalType | null;
  bonusActive: boolean;
  streak: number;
  lastDay: number;
}

/** Crafting statistics. */
export interface QzCraftStats {
  totalCrystalsCrafted: number;
  totalJewelryCrafted: number;
  totalGridPlacements: number;
  totalMeditationsCompleted: number;
  totalMoonPhasesUsed: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  highestQualityCraft: number;
  rarestCrystalFound: string;
  uniqueCrystalsCollected: number;
  uniqueShapesCrafted: number;
  uniqueJewelryCrafted: number;
  totalFullMoonsUsed: number;
}

/** The full game state. */
export interface QzQuartzCraftState {
  version: number;
  level: number;
  xp: number;
  totalXp: number;
  coins: number;
  inventory: QzInventoryCrystal[];
  craftedJewelry: QzCraftedJewelry[];
  grid: QzGridCell[];
  currentMoonPhase: QzMoonPhase;
  moonPhaseHistory: QzMoonPhase[];
  meditationSession: QzMeditationSession;
  achievements: QzAchievementRecord[];
  daily: QzDailyState;
  stats: QzCraftStats;
  totalCrystalsPerType: Record<QzCrystalType, number>;
  totalShapesPerType: Record<QzShape, number>;
  totalJewelryPerType: Record<QzJewelryType, number>;
}

/** Result of a crystal crafting action. */
export interface QzCraftResult {
  success: boolean;
  crystal: QzInventoryCrystal | null;
  xpGained: number;
  coinsGained: number;
  message: string;
  achievementsUnlocked: QzAchievementId[];
}

/** Result of a jewelry crafting action. */
export interface QzJewelryResult {
  success: boolean;
  jewelry: QzCraftedJewelry | null;
  xpGained: number;
  coinsGained: number;
  message: string;
  achievementsUnlocked: QzAchievementId[];
}

/** Result of a grid placement. */
export interface QzGridResult {
  success: boolean;
  harmonyBonus: number;
  message: string;
  achievementsUnlocked: QzAchievementId[];
}

/** Result of a singing bowl meditation. */
export interface QzMeditationResult {
  success: boolean;
  xpGained: number;
  focusGained: number;
  message: string;
  achievementsUnlocked: QzAchievementId[];
}

/** Result of a daily discovery. */
export interface QzDiscoveryResult {
  success: boolean;
  crystal: QzInventoryCrystal | null;
  xpGained: number;
  message: string;
  achievementsUnlocked: QzAchievementId[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const QZ_VERSION = 3;
export const QZ_MAX_LEVEL = 50;
export const QZ_INITIAL_COINS = 100;
export const QZ_INITIAL_XP = 0;
export const QZ_GRID_SIZE = 5;
export const QZ_MAX_INVENTORY = 200;
export const QZ_MAX_JEWELRY = 50;
export const QZ_DAILY_MAX_DISCOVERIES = 5;
export const QZ_MEDITATION_TICKS = 6;
export const QZ_MAX_FOCUS = 100;

/** XP table for levels 1-50 (index 0 unused, index 1 = xp for level 1, etc.). */
export const QZ_XP_TABLE: readonly number[] = Array.from(
  { length: QZ_MAX_LEVEL + 1 },
  (_, i) => (i === 0 ? 0 : Math.floor(80 * Math.pow(1.14, i) + i * 25)),
);

/** 12 Crystal Definitions. */
export const QZ_CRYSTALS: readonly QzCrystalDef[] = [
  {
    id: 'clear_quartz',
    name: 'Clear Quartz',
    description: 'The master healer crystal, amplifying energy and thought. Prized for its versatility and pure clarity.',
    color: '#F0F0F5',
    glow: '#E0E0EA',
    element: 'aether',
    chakra: 'Crown',
    baseValue: 15,
    xpReward: 10,
    hardness: 7,
    clarity: 95,
    lore: 'Ancient civilizations believed clear quartz was petrified ice that would never melt.',
  },
  {
    id: 'rose_quartz',
    name: 'Rose Quartz',
    description: 'The stone of unconditional love and infinite peace. Its gentle pink essence restores trust and harmony.',
    color: '#F48FB1',
    glow: '#F8BBD0',
    element: 'water',
    chakra: 'Heart',
    baseValue: 20,
    xpReward: 12,
    hardness: 7,
    clarity: 70,
    lore: 'Legend says Eros gifted rose quartz to humans so they might know the love of the gods.',
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    description: 'A powerful and protective stone with high spiritual vibration. It guards against psychic attack.',
    color: '#9C27B0',
    glow: '#CE93D8',
    element: 'air',
    chakra: 'Third Eye',
    baseValue: 30,
    xpReward: 15,
    hardness: 7,
    clarity: 85,
    lore: 'The Greeks named amethyst "amethystos" meaning "not intoxicated," believing it prevented drunkenness.',
  },
  {
    id: 'citrine',
    name: 'Citrine',
    description: 'A joyful crystal carrying the power of the sun. It energizes and recharges, attracting abundance.',
    color: '#FFB300',
    glow: '#FFE082',
    element: 'fire',
    chakra: 'Solar Plexus',
    baseValue: 25,
    xpReward: 14,
    hardness: 7,
    clarity: 80,
    lore: 'Merchants once kept citrine in their cash boxes to attract wealth and prosperity.',
  },
  {
    id: 'smoky_quartz',
    name: 'Smoky Quartz',
    description: 'A grounding and protective stone that absorbs negative energy and transforms it into positive flow.',
    color: '#5D4037',
    glow: '#8D6E63',
    element: 'earth',
    chakra: 'Root',
    baseValue: 18,
    xpReward: 11,
    hardness: 7,
    clarity: 60,
    lore: 'Scottish Highlanders carried smoky quartz as a talisman against the evil eye.',
  },
  {
    id: 'prasiolite',
    name: 'Prasiolite',
    description: 'Green amethyst, the stone of spiritual growth. It opens the heart to divine compassion and love.',
    color: '#66BB6A',
    glow: '#A5D6A7',
    element: 'earth',
    chakra: 'Heart',
    baseValue: 35,
    xpReward: 16,
    hardness: 7,
    clarity: 82,
    lore: 'Natural prasiolite is so rare that most on the market is heat-treated amethyst.',
  },
  {
    id: 'rutilated_quartz',
    name: 'Rutilated Quartz',
    description: 'Clear quartz laced with golden rutile needles that act as spiritual antennas, accelerating manifestation.',
    color: '#FFD54F',
    glow: '#FFF9C4',
    element: 'fire',
    chakra: 'Solar Plexus',
    baseValue: 40,
    xpReward: 18,
    hardness: 7,
    clarity: 65,
    lore: 'The golden threads inside were called "Venus hair" by ancient Roman naturalists.',
  },
  {
    id: 'tourmalinated_quartz',
    name: 'Tourmalinated Quartz',
    description: 'Clear quartz crossed with black tourmaline needles, combining the amplifying power of quartz with protection.',
    color: '#37474F',
    glow: '#607D8B',
    element: 'earth',
    chakra: 'Root',
    baseValue: 38,
    xpReward: 17,
    hardness: 7,
    clarity: 55,
    lore: 'Shamans used tourmalinated quartz to create protective shields during spirit journeys.',
  },
  {
    id: 'herkimer_diamond',
    name: 'Herkimer Diamond',
    description: 'Double-terminated quartz of extraordinary brilliance found only in Herkimer County, New York.',
    color: '#E3F2FD',
    glow: '#BBDEFB',
    element: 'aether',
    chakra: 'Crown',
    baseValue: 80,
    xpReward: 35,
    hardness: 7.5,
    clarity: 99,
    lore: 'Herkimer diamonds are five hundred million years old, formed in cavities of dolostone.',
  },
  {
    id: 'phantom_quartz',
    name: 'Phantom Quartz',
    description: 'A quartz crystal containing ghost-like inclusions of earlier growth stages, a portal to past lives.',
    color: '#B39DDB',
    glow: '#D1C4E9',
    element: 'aether',
    chakra: 'Third Eye',
    baseValue: 55,
    xpReward: 25,
    hardness: 7,
    clarity: 50,
    lore: 'Each phantom layer represents a chapter in the crystal million-year growth history.',
  },
  {
    id: 'blue_quartz',
    name: 'Blue Quartz',
    description: 'A serene sky-blue crystal that calms the mind and facilitates clear communication from the heart.',
    color: '#42A5F5',
    glow: '#90CAF9',
    element: 'water',
    chakra: 'Throat',
    baseValue: 32,
    xpReward: 15,
    hardness: 7,
    clarity: 72,
    lore: 'Singing bowls made from blue quartz produce tones said to align all seven chakras simultaneously.',
  },
  {
    id: 'milky_quartz',
    name: 'Milky Quartz',
    description: 'The most common variety of quartz, its milky translucence holds gentle, nurturing feminine energy.',
    color: '#EFEBE9',
    glow: '#F5F5F5',
    element: 'earth',
    chakra: 'Crown',
    baseValue: 10,
    xpReward: 8,
    hardness: 7,
    clarity: 35,
    lore: 'Milky quartz makes up roughly twelve percent of the Earth crust by volume.',
  },
];

/** 6 Shape Definitions. */
export const QZ_SHAPES: readonly QzShapeDef[] = [
  {
    id: 'natural_point',
    name: 'Natural Point',
    description: 'A raw, uncut crystal in its natural termination form. Each one is unique.',
    difficulty: 1,
    valueMultiplier: 1.0,
    xpBonus: 0,
    minLevel: 1,
  },
  {
    id: 'tumbled_stone',
    name: 'Tumbled Stone',
    description: 'Smooth, polished stones tumbled for weeks in grit until they gleam.',
    difficulty: 1,
    valueMultiplier: 1.2,
    xpBonus: 3,
    minLevel: 1,
  },
  {
    id: 'faceted_gem',
    name: 'Faceted Gem',
    description: 'Precision-cut with dozens of facets to maximize internal light refraction.',
    difficulty: 3,
    valueMultiplier: 2.0,
    xpBonus: 10,
    minLevel: 5,
  },
  {
    id: 'sphere',
    name: 'Sphere',
    description: 'Perfectly round crystal spheres that emit energy evenly in all directions.',
    difficulty: 4,
    valueMultiplier: 2.5,
    xpBonus: 15,
    minLevel: 10,
  },
  {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'Four-sided crystal pyramids that focus energy through their apex.',
    difficulty: 5,
    valueMultiplier: 3.0,
    xpBonus: 20,
    minLevel: 18,
  },
  {
    id: 'heart',
    name: 'Heart',
    description: 'A crystal lovingly carved into a heart shape, the pinnacle of lapidary art.',
    difficulty: 6,
    valueMultiplier: 3.5,
    xpBonus: 25,
    minLevel: 25,
  },
];

/** 8 Jewelry Definitions. */
export const QZ_JEWELRY: readonly QzJewelryDef[] = [
  {
    id: 'pendant_necklace',
    name: 'Pendant Necklace',
    description: 'A crystal pendant hung from a silver chain, resting near the heart chakra.',
    slots: 1,
    basePower: 10,
    valueMultiplier: 3.0,
    minLevel: 3,
  },
  {
    id: 'ring',
    name: 'Ring',
    description: 'A crystal set into a band of precious metal, channeling energy through the fingers.',
    slots: 1,
    basePower: 8,
    valueMultiplier: 2.5,
    minLevel: 1,
  },
  {
    id: 'bracelet',
    name: 'Bracelet',
    description: 'Crystal beads strung on an elastic cord, worn on the wrist for constant energy flow.',
    slots: 2,
    basePower: 15,
    valueMultiplier: 4.0,
    minLevel: 8,
  },
  {
    id: 'earrings',
    name: 'Earrings',
    description: 'Paired crystal drops that frame the face and balance the hemispheres of the brain.',
    slots: 2,
    basePower: 12,
    valueMultiplier: 3.5,
    minLevel: 5,
  },
  {
    id: 'crown_tiara',
    name: 'Crown Tiara',
    description: 'A regal crown of crystals worn above the crown chakra for divine connection.',
    slots: 3,
    basePower: 30,
    valueMultiplier: 8.0,
    minLevel: 30,
  },
  {
    id: 'amulet',
    name: 'Amulet',
    description: 'A crystal encased in a protective metal frame, worn as a shield against negativity.',
    slots: 1,
    basePower: 20,
    valueMultiplier: 4.5,
    minLevel: 12,
  },
  {
    id: 'brooch',
    name: 'Brooch',
    description: 'An ornate crystal brooch pinned to clothing, radiating energy outward from the chest.',
    slots: 1,
    basePower: 14,
    valueMultiplier: 3.8,
    minLevel: 7,
  },
  {
    id: 'anklet',
    name: 'Anklet',
    description: 'Delicate crystal chain worn at the ankle, grounding spiritual energy into the earth.',
    slots: 1,
    basePower: 10,
    valueMultiplier: 2.8,
    minLevel: 4,
  },
];

/** 8 Moon Phase Definitions. */
export const QZ_MOON_PHASES: readonly QzMoonPhaseDef[] = [
  {
    id: 'new_moon',
    name: 'New Moon',
    emoji: '🌑',
    description: 'The dark moon signals new beginnings. Set intentions for fresh crystal work.',
    xpMultiplier: 0.8,
    craftBonus: 0,
    discoveryBonus: 1.5,
    meditationBonus: 1.3,
  },
  {
    id: 'waxing_crescent',
    name: 'Waxing Crescent',
    emoji: '🌒',
    description: 'The first sliver of light grows. Crystal energy builds toward manifestation.',
    xpMultiplier: 0.9,
    craftBonus: 0.05,
    discoveryBonus: 1.3,
    meditationBonus: 1.1,
  },
  {
    id: 'first_quarter',
    name: 'First Quarter',
    emoji: '🌓',
    description: 'Half the moon illuminated. A time for decisive action and crystal refinement.',
    xpMultiplier: 1.0,
    craftBonus: 0.1,
    discoveryBonus: 1.0,
    meditationBonus: 1.0,
  },
  {
    id: 'waxing_gibbous',
    name: 'Waxing Gibbous',
    emoji: '🌔',
    description: 'Nearly full, the moon charges crystals with anticipation and refinement energy.',
    xpMultiplier: 1.1,
    craftBonus: 0.15,
    discoveryBonus: 0.9,
    meditationBonus: 1.0,
  },
  {
    id: 'full_moon',
    name: 'Full Moon',
    emoji: '🌕',
    description: 'Peak lunar power. Crystals charged under the full moon reach maximum potential.',
    xpMultiplier: 1.5,
    craftBonus: 0.3,
    discoveryBonus: 0.7,
    meditationBonus: 2.0,
  },
  {
    id: 'waning_gibbous',
    name: 'Waning Gibbous',
    emoji: '🌖',
    description: 'The moon begins to dim. A time for gratitude and sharing crystal gifts.',
    xpMultiplier: 1.1,
    craftBonus: 0.15,
    discoveryBonus: 0.9,
    meditationBonus: 1.1,
  },
  {
    id: 'last_quarter',
    name: 'Last Quarter',
    emoji: '🌗',
    description: 'Half light fades. Release negative energy through crystal cleansing rituals.',
    xpMultiplier: 1.0,
    craftBonus: 0.1,
    discoveryBonus: 1.0,
    meditationBonus: 1.2,
  },
  {
    id: 'waning_crescent',
    name: 'Waning Crescent',
    emoji: '🌘',
    description: 'The final sliver before darkness. Deep meditation and surrender to crystal wisdom.',
    xpMultiplier: 0.9,
    craftBonus: 0.05,
    discoveryBonus: 1.2,
    meditationBonus: 1.5,
  },
];

/** 5 Singing Bowl Definitions. */
export const QZ_BOWLS: readonly QzBowlDef[] = [
  {
    id: 'root',
    name: 'Root Chakra Bowl',
    emoji: '🔴',
    description: 'A deep C-note bowl that grounds your energy and connects you to the earth.',
    frequency: 256,
    focusGain: 8,
    xpPerSession: 20,
    minLevel: 1,
  },
  {
    id: 'sacral',
    name: 'Sacral Chakra Bowl',
    emoji: '🟠',
    description: 'A warm D-note bowl that awakens creativity and emotional fluidity.',
    frequency: 288,
    focusGain: 10,
    xpPerSession: 25,
    minLevel: 5,
  },
  {
    id: 'solar_plexus',
    name: 'Solar Plexus Bowl',
    emoji: '🟡',
    description: 'A bright E-note bowl that empowers confidence and personal will.',
    frequency: 320,
    focusGain: 12,
    xpPerSession: 30,
    minLevel: 12,
  },
  {
    id: 'heart',
    name: 'Heart Chakra Bowl',
    emoji: '💚',
    description: 'A gentle F-note bowl that opens the heart to compassion and healing love.',
    frequency: 341,
    focusGain: 15,
    xpPerSession: 40,
    minLevel: 20,
  },
  {
    id: 'third_eye',
    name: 'Third Eye Bowl',
    emoji: '💜',
    description: 'An ethereal A-note bowl that awakens intuition and spiritual vision.',
    frequency: 426,
    focusGain: 20,
    xpPerSession: 55,
    minLevel: 35,
  },
];

/** 15 Achievement Definitions. */
export const QZ_ACHIEVEMENTS: readonly QzAchievementDef[] = [
  { id: 'first_cut', name: 'First Cut', description: 'Craft your first crystal', condition: 'crystals_crafted', target: 1, rewardCoins: 25, rewardXp: 30, icon: '💎' },
  { id: 'gem_collector', name: 'Gem Collector', description: 'Collect 50 crystals in your inventory', condition: 'inventory_count', target: 50, rewardCoins: 200, rewardXp: 300, icon: '📦' },
  { id: 'master_cutter', name: 'Master Cutter', description: 'Craft all 6 shapes of any single crystal type', condition: 'shapes_per_crystal', target: 6, rewardCoins: 300, rewardXp: 400, icon: '🔪' },
  { id: 'jewelry_artisan', name: 'Jewelry Artisan', description: 'Craft your first piece of jewelry', condition: 'jewelry_crafted', target: 1, rewardCoins: 50, rewardXp: 60, icon: '💍' },
  { id: 'moon_child', name: 'Moon Child', description: 'Craft crystals during all 8 moon phases', condition: 'moon_phases_used', target: 8, rewardCoins: 500, rewardXp: 600, icon: '🌙' },
  { id: 'bowl_resonance', name: 'Bowl Resonance', description: 'Complete meditation with all 5 singing bowls', condition: 'bowls_used', target: 5, rewardCoins: 400, rewardXp: 500, icon: '🔔' },
  { id: 'grid_master', name: 'Grid Master', description: 'Fill all 25 cells of the crystal grid', condition: 'grid_filled', target: 25, rewardCoins: 350, rewardXp: 450, icon: '⬜' },
  { id: 'crystal_sage', name: 'Crystal Sage', description: 'Reach level 25', condition: 'level', target: 25, rewardCoins: 250, rewardXp: 500, icon: '🧙' },
  { id: 'quartz_lord', name: 'Quartz Lord', description: 'Reach level 50', condition: 'level', target: 50, rewardCoins: 1000, rewardXp: 2000, icon: '👑' },
  { id: 'rarest_find', name: 'Rarest Find', description: 'Discover a Herkimer Diamond', condition: 'herkimer_found', target: 1, rewardCoins: 150, rewardXp: 200, icon: '⭐' },
  { id: 'shape_shifter', name: 'Shape Shifter', description: 'Craft 10 of each shape type', condition: 'per_shape_count', target: 10, rewardCoins: 600, rewardXp: 700, icon: '🔄' },
  { id: 'power_crafter', name: 'Power Crafter', description: 'Craft 100 jewelry items total', condition: 'total_jewelry', target: 100, rewardCoins: 800, rewardXp: 1000, icon: '⚒️' },
  { id: 'enlightened', name: 'Enlightened', description: 'Complete 50 singing bowl meditations', condition: 'meditations_completed', target: 50, rewardCoins: 700, rewardXp: 900, icon: '✨' },
  { id: 'harmony_grid', name: 'Harmony Grid', description: 'Create a grid with 5 crystals of the same element', condition: 'element_harmony', target: 5, rewardCoins: 500, rewardXp: 650, icon: '☯️' },
  { id: 'lunar_master', name: 'Lunar Master', description: 'Craft 5 items during a Full Moon', condition: 'full_moon_crafts', target: 5, rewardCoins: 400, rewardXp: 550, icon: '🌕' },
];

/** Level titles from 1-50. */
export const QZ_LEVEL_TITLES: readonly string[] = [
  '',
  'Stone Seeker',
  'Crystal Novice',
  'Crystal Novice',
  'Crystal Novice',
  'Crystal Novice',
  'Gem Apprentice',
  'Gem Apprentice',
  'Gem Apprentice',
  'Gem Apprentice',
  'Gem Apprentice',
  'Lapidary Adept',
  'Lapidary Adept',
  'Lapidary Adept',
  'Lapidary Adept',
  'Lapidary Adept',
  'Facet Artisan',
  'Facet Artisan',
  'Facet Artisan',
  'Facet Artisan',
  'Facet Artisan',
  'Crystal Weaver',
  'Crystal Weaver',
  'Crystal Weaver',
  'Crystal Weaver',
  'Crystal Weaver',
  'Moon Forger',
  'Moon Forger',
  'Moon Forger',
  'Moon Forger',
  'Moon Forger',
  'Grid Keeper',
  'Grid Keeper',
  'Grid Keeper',
  'Grid Keeper',
  'Grid Keeper',
  'Resonance Master',
  'Resonance Master',
  'Resonance Master',
  'Resonance Master',
  'Resonance Master',
  'Bowl Harmonizer',
  'Bowl Harmonizer',
  'Bowl Harmonizer',
  'Bowl Harmonizer',
  'Bowl Harmonizer',
  'Quartz Sovereign',
  'Quartz Sovereign',
  'Quartz Sovereign',
  'Quartz Sovereign',
  'Quartz Sovereign',
];

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: INTERNAL HELPERS (no prefix — private to module)
// ═══════════════════════════════════════════════════════════════════════════════

function qzInternalGenerateId(): string {
  return `qz_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function qzInternalClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function qzInternalSeededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function qzInternalXpForLevel(level: number): number {
  if (level <= 0) return 0;
  if (level > QZ_MAX_LEVEL) return Infinity;
  return QZ_XP_TABLE[level] ?? Infinity;
}

function qzInternalLevelFromXp(totalXp: number): number {
  let level = 1;
  let remaining = totalXp;
  while (level < QZ_MAX_LEVEL) {
    const needed = qzInternalXpForLevel(level);
    if (remaining < needed) break;
    remaining -= needed;
    level++;
  }
  return level;
}

function qzInternalCreateEmptyGrid(): QzGridCell[] {
  const cells: QzGridCell[] = [];
  for (let r = 0; r < QZ_GRID_SIZE; r++) {
    for (let c = 0; c < QZ_GRID_SIZE; c++) {
      cells.push({ row: r, col: c, crystalType: null, shape: null });
    }
  }
  return cells;
}

function qzInternalCreateCrystalCountMap(): Record<QzCrystalType, number> {
  const map = {} as Record<QzCrystalType, number>;
  for (const crystal of QZ_CRYSTALS) {
    map[crystal.id] = 0;
  }
  return map;
}

function qzInternalCreateShapeCountMap(): Record<QzShape, number> {
  const map = {} as Record<QzShape, number>;
  for (const shape of QZ_SHAPES) {
    map[shape.id] = 0;
  }
  return map;
}

function qzInternalCreateJewelryCountMap(): Record<QzJewelryType, number> {
  const map = {} as Record<QzJewelryType, number>;
  for (const jw of QZ_JEWELRY) {
    map[jw.id] = 0;
  }
  return map;
}

function qzInternalCreateAchievements(): QzAchievementRecord[] {
  return QZ_ACHIEVEMENTS.map(a => ({
    achievementId: a.id,
    unlocked: false,
    progress: 0,
    unlockedAt: 0,
  }));
}

function qzInternalCreateEmptyMeditation(): QzMeditationSession {
  return {
    bowlChakra: null,
    state: 'idle',
    focus: 0,
    ticksRemaining: 0,
    totalFocusGained: 0,
  };
}

function qzInternalCreateDaily(seed: number): QzDailyState {
  const rand = qzInternalSeededRandom(seed);
  const bonusIndex = Math.floor(rand * QZ_CRYSTALS.length);
  return {
    daySeed: seed,
    discoveriesMade: 0,
    maxDiscoveries: QZ_DAILY_MAX_DISCOVERIES,
    bonusCrystalType: QZ_CRYSTALS[bonusIndex].id,
    bonusActive: true,
    streak: 0,
    lastDay: 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: EXPORTED UTILITY FUNCTIONS (qz prefix)
// ═══════════════════════════════════════════════════════════════════════════════

/** Get the XP required for a given level. */
export function qzGetXpForLevel(level: number): number {
  return qzInternalXpForLevel(level);
}

/** Get the level title for a given level. */
export function qzGetLevelTitle(level: number): string {
  const clamped = qzInternalClamp(level, 0, QZ_LEVEL_TITLES.length - 1);
  return QZ_LEVEL_TITLES[clamped] ?? 'Unknown';
}

/** Find a crystal definition by ID. */
export function qzFindCrystal(id: QzCrystalType): QzCrystalDef | undefined {
  return QZ_CRYSTALS.find(c => c.id === id);
}

/** Find a shape definition by ID. */
export function qzFindShape(id: QzShape): QzShapeDef | undefined {
  return QZ_SHAPES.find(s => s.id === id);
}

/** Find a jewelry definition by ID. */
export function qzFindJewelry(id: QzJewelryType): QzJewelryDef | undefined {
  return QZ_JEWELRY.find(j => j.id === id);
}

/** Find a moon phase definition by ID. */
export function qzFindMoonPhase(id: QzMoonPhase): QzMoonPhaseDef | undefined {
  return QZ_MOON_PHASES.find(m => m.id === id);
}

/** Find a singing bowl definition by ID. */
export function qzFindBowl(id: QzBowlChakra): QzBowlDef | undefined {
  return QZ_BOWLS.find(b => b.id === id);
}

/** Find an achievement definition by ID. */
export function qzFindAchievement(id: QzAchievementId): QzAchievementDef | undefined {
  return QZ_ACHIEVEMENTS.find(a => a.id === id);
}

/** Compute the value of a crystal given type and shape. */
export function qzComputeCrystalValue(crystalType: QzCrystalType, shape: QzShape): number {
  const crystal = qzFindCrystal(crystalType);
  const shapeDef = qzFindShape(shape);
  if (!crystal || !shapeDef) return 0;
  return Math.floor(crystal.baseValue * shapeDef.valueMultiplier);
}

/** Compute the XP reward for crafting a crystal. */
export function qzComputeCrystalXp(crystalType: QzCrystalType, shape: QzShape): number {
  const crystal = qzFindCrystal(crystalType);
  const shapeDef = qzFindShape(shape);
  if (!crystal || !shapeDef) return 0;
  return crystal.xpReward + shapeDef.xpBonus;
}

/** Compute the moon phase multiplier for XP. */
export function qzGetMoonXpMultiplier(phase: QzMoonPhase): number {
  const def = qzFindMoonPhase(phase);
  return def ? def.xpMultiplier : 1.0;
}

/** Compute the moon phase craft bonus (0-0.3). */
export function qzGetMoonCraftBonus(phase: QzMoonPhase): number {
  const def = qzFindMoonPhase(phase);
  return def ? def.craftBonus : 0;
}

/** Compute meditation XP with moon bonus. */
export function qzComputeMeditationXp(bowlChakra: QzBowlChakra, moonPhase: QzMoonPhase): number {
  const bowl = qzFindBowl(bowlChakra);
  const phase = qzFindMoonPhase(moonPhase);
  if (!bowl || !phase) return 0;
  return Math.floor(bowl.xpPerSession * phase.meditationBonus);
}

/** Check if a shape is unlocked at a given level. */
export function qzIsShapeUnlocked(shape: QzShape, level: number): boolean {
  const def = qzFindShape(shape);
  return def ? level >= def.minLevel : false;
}

/** Check if jewelry is unlocked at a given level. */
export function qzIsJewelryUnlocked(jewelryType: QzJewelryType, level: number): boolean {
  const def = qzFindJewelry(jewelryType);
  return def ? level >= def.minLevel : false;
}

/** Check if a singing bowl is unlocked at a given level. */
export function qzIsBowlUnlocked(bowlChakra: QzBowlChakra, level: number): boolean {
  const def = qzFindBowl(bowlChakra);
  return def ? level >= def.minLevel : false;
}

/** Compute harmony bonus for grid placement based on adjacent elements. */
export function qzComputeGridHarmony(
  grid: QzGridCell[],
  row: number,
  col: number,
  crystalType: QzCrystalType,
): number {
  const crystal = qzFindCrystal(crystalType);
  if (!crystal) return 0;

  const neighbors: { dr: number; dc: number }[] = [
    { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 },
  ];

  let harmony = 0;
  for (const n of neighbors) {
    const nr = row + n.dr;
    const nc = col + n.dc;
    if (nr < 0 || nr >= QZ_GRID_SIZE || nc < 0 || nc >= QZ_GRID_SIZE) continue;
    const neighbor = grid.find(c => c.row === nr && c.col === nc);
    if (!neighbor || !neighbor.crystalType) continue;
    const neighborCrystal = qzFindCrystal(neighbor.crystalType);
    if (!neighborCrystal) continue;
    if (neighborCrystal.element === crystal.element) harmony += 2;
    if (neighborCrystal.chakra === crystal.chakra) harmony += 1;
  }
  return harmony;
}

/** Compute jewelry power from selected crystal instance IDs. */
export function qzComputeJewelryPower(
  jewelryType: QzJewelryType,
  crystalInstances: QzInventoryCrystal[],
): number {
  const jwDef = qzFindJewelry(jewelryType);
  if (!jwDef) return 0;
  let totalPower = jwDef.basePower;
  for (const inst of crystalInstances) {
    const crystal = qzFindCrystal(inst.crystalType);
    if (crystal) {
      totalPower += Math.floor(crystal.baseValue * 0.5 * (inst.quality / 100));
    }
  }
  return totalPower;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 6: STATE CREATION (exported with qz prefix)
// ═══════════════════════════════════════════════════════════════════════════════

/** Create the initial game state. */
export function qzCreateInitialState(seed?: number): QzQuartzCraftState {
  const s = seed ?? 42;
  return {
    version: QZ_VERSION,
    level: 1,
    xp: QZ_INITIAL_XP,
    totalXp: QZ_INITIAL_XP,
    coins: QZ_INITIAL_COINS,
    inventory: [],
    craftedJewelry: [],
    grid: qzInternalCreateEmptyGrid(),
    currentMoonPhase: 'first_quarter',
    moonPhaseHistory: [],
    meditationSession: qzInternalCreateEmptyMeditation(),
    achievements: qzInternalCreateAchievements(),
    daily: qzInternalCreateDaily(s),
    stats: {
      totalCrystalsCrafted: 0,
      totalJewelryCrafted: 0,
      totalGridPlacements: 0,
      totalMeditationsCompleted: 0,
      totalMoonPhasesUsed: 0,
      totalCoinsEarned: QZ_INITIAL_COINS,
      totalCoinsSpent: 0,
      highestQualityCraft: 0,
      rarestCrystalFound: '',
      uniqueCrystalsCollected: 0,
      uniqueShapesCrafted: 0,
      uniqueJewelryCrafted: 0,
      totalFullMoonsUsed: 0,
    },
    totalCrystalsPerType: qzInternalCreateCrystalCountMap(),
    totalShapesPerType: qzInternalCreateShapeCountMap(),
    totalJewelryPerType: qzInternalCreateJewelryCountMap(),
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 7: REDUCER LOGIC (pure functions, exported with qz prefix)
// ═══════════════════════════════════════════════════════════════════════════════

/** Apply XP and return the updated state fields (level, xp, totalXp). */
export function qzApplyXp(
  state: QzQuartzCraftState,
  rawXp: number,
  moonPhase: QzMoonPhase,
): { level: number; xp: number; totalXp: number; actualXp: number } {
  const phaseDef = qzFindMoonPhase(moonPhase);
  const multiplier = phaseDef ? phaseDef.xpMultiplier : 1.0;
  const actualXp = Math.floor(rawXp * multiplier);
  const newTotal = state.totalXp + actualXp;
  const newLevel = qzInternalLevelFromXp(newTotal);
  return {
    level: newLevel,
    xp: newTotal - QZ_XP_TABLE.slice(1, newLevel).reduce((a, b) => a + b, 0),
    totalXp: newTotal,
    actualXp,
  };
}

/** Check achievements against the current state, returning newly unlocked IDs. */
export function qzCheckAchievements(
  state: QzQuartzCraftState,
): QzAchievementId[] {
  const newlyUnlocked: QzAchievementId[] = [];
  const a = state.achievements;

  const progressMap: Record<string, number> = {
    crystals_crafted: state.stats.totalCrystalsCrafted,
    inventory_count: state.inventory.length,
    jewelry_crafted: state.stats.totalJewelryCrafted,
    moon_phases_used: new Set(state.moonPhaseHistory).size,
    bowls_used: QZ_BOWLS.filter(
      b => state.stats.totalMeditationsCompleted > 0 && state.level >= b.minLevel,
    ).length,
    grid_filled: state.grid.filter(c => c.crystalType !== null).length,
    level: state.level,
    herkimer_found: state.totalCrystalsPerType['herkimer_diamond'],
    total_jewelry: state.stats.totalJewelryCrafted,
    meditations_completed: state.stats.totalMeditationsCompleted,
    full_moon_crafts: state.stats.totalFullMoonsUsed,
    shapes_per_crystal: 0,
    per_shape_count: 0,
    element_harmony: 0,
  };

  // Compute shapes_per_crystal: max shapes for any single crystal type
  for (const crystal of QZ_CRYSTALS) {
    let shapeCount = 0;
    for (const shape of QZ_SHAPES) {
      const has = state.inventory.some(
        inv => inv.crystalType === crystal.id && inv.shape === shape.id,
      );
      if (has) shapeCount++;
    }
    if (shapeCount > progressMap['shapes_per_crystal']) {
      progressMap['shapes_per_crystal'] = shapeCount;
    }
  }

  // Compute per_shape_count: min shapes crafted per shape type
  let minShapeCount = Infinity;
  for (const shape of QZ_SHAPES) {
    const count = state.totalShapesPerType[shape.id] ?? 0;
    if (count < minShapeCount) minShapeCount = count;
  }
  progressMap['per_shape_count'] = minShapeCount === Infinity ? 0 : minShapeCount;

  // Compute element_harmony: max same-element crystals in the grid
  const elementCounts: Record<string, number> = {};
  for (const cell of state.grid) {
    if (!cell.crystalType) continue;
    const crystal = qzFindCrystal(cell.crystalType);
    if (crystal) {
      elementCounts[crystal.element] = (elementCounts[crystal.element] ?? 0) + 1;
    }
  }
  progressMap['element_harmony'] = Math.max(0, ...Object.values(elementCounts));

  let records = a;
  for (let i = 0; i < records.length; i++) {
    if (records[i].unlocked) continue;
    const def = QZ_ACHIEVEMENTS[i];
    if (!def) continue;
    const current = progressMap[def.condition] ?? 0;
    records = records.map((rec, idx) => {
      if (idx !== i) return rec;
      return { ...rec, progress: current };
    });
    if (current >= def.target) {
      records = records.map((rec, idx) => {
        if (idx !== i) return rec;
        return { ...rec, unlocked: true, unlockedAt: Date.now() };
      });
      newlyUnlocked.push(def.id);
    }
  }

  return newlyUnlocked;
}

/** Process crafting a crystal — returns full next state. */
export function qzCraftCrystalReducer(
  state: QzQuartzCraftState,
  crystalType: QzCrystalType,
  shape: QzShape,
): { state: QzQuartzCraftState; result: QzCraftResult } {
  const shapeDef = qzFindShape(shape);
  if (!shapeDef || state.level < shapeDef.minLevel) {
    return {
      state,
      result: { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'Shape not unlocked at your level.', achievementsUnlocked: [] },
    };
  }

  if (state.inventory.length >= QZ_MAX_INVENTORY) {
    return {
      state,
      result: { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'Inventory is full. Sell or use crystals first.', achievementsUnlocked: [] },
    };
  }

  const crystalDef = qzFindCrystal(crystalType);
  if (!crystalDef) {
    return {
      state,
      result: { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: 'Unknown crystal type.', achievementsUnlocked: [] },
    };
  }

  const moonBonus = qzGetMoonCraftBonus(state.currentMoonPhase);
  const quality = qzInternalClamp(
    Math.floor(50 + crystalDef.clarity * 0.3 + Math.random() * 20 + moonBonus * 100),
    10,
    100,
  );

  const rawXp = qzComputeCrystalXp(crystalType, shape);
  const xpResult = qzApplyXp(state, rawXp, state.currentMoonPhase);
  const coinValue = Math.floor(qzComputeCrystalValue(crystalType, shape) * (quality / 100));

  const newInstance: QzInventoryCrystal = {
    instanceId: qzInternalGenerateId(),
    crystalType,
    shape,
    quality,
    xpValue: xpResult.actualXp,
    coinValue,
    craftedAt: Date.now(),
  };

  const moonHistory = state.moonPhaseHistory.includes(state.currentMoonPhase)
    ? state.moonPhaseHistory
    : [...state.moonPhaseHistory, state.currentMoonPhase];

  const totalFullMoons = state.currentMoonPhase === 'full_moon'
    ? state.stats.totalFullMoonsUsed + 1
    : state.stats.totalFullMoonsUsed;

  const uniqueCrystals = new Set(state.inventory.map(i => i.crystalType));
  uniqueCrystals.add(crystalType);

  const uniqueShapes = new Set(state.inventory.map(i => i.shape));
  uniqueShapes.add(shape);

  const nextState: QzQuartzCraftState = {
    ...state,
    level: xpResult.level,
    xp: xpResult.xp,
    totalXp: xpResult.totalXp,
    coins: state.coins,
    inventory: [...state.inventory, newInstance],
    moonPhaseHistory: moonHistory,
    totalCrystalsPerType: {
      ...state.totalCrystalsPerType,
      [crystalType]: (state.totalCrystalsPerType[crystalType] ?? 0) + 1,
    },
    totalShapesPerType: {
      ...state.totalShapesPerType,
      [shape]: (state.totalShapesPerType[shape] ?? 0) + 1,
    },
    stats: {
      ...state.stats,
      totalCrystalsCrafted: state.stats.totalCrystalsCrafted + 1,
      totalMoonPhasesUsed: moonHistory.length,
      highestQualityCraft: Math.max(state.stats.highestQualityCraft, quality),
      rarestCrystalFound: crystalDef.baseValue > (qzFindCrystal(state.stats.rarestCrystalFound as QzCrystalType)?.baseValue ?? 0)
        ? crystalType
        : state.stats.rarestCrystalFound,
      uniqueCrystalsCollected: uniqueCrystals.size,
      uniqueShapesCrafted: uniqueShapes.size,
      totalFullMoonsUsed: totalFullMoons,
    },
  };

  const achievementsUnlocked = qzCheckAchievements(nextState);
  const finalState = qzApplyAchievementRewards(nextState, achievementsUnlocked);

  return {
    state: finalState,
    result: {
      success: true,
      crystal: newInstance,
      xpGained: xpResult.actualXp,
      coinsGained: 0,
      message: `Crafted a ${crystalDef.name} ${shapeDef.name} (quality ${quality}).`,
      achievementsUnlocked,
    },
  };
}

/** Process crafting jewelry — returns full next state. */
export function qzCraftJewelryReducer(
  state: QzQuartzCraftState,
  jewelryType: QzJewelryType,
  crystalInstanceIds: string[],
): { state: QzQuartzCraftState; result: QzJewelryResult } {
  const jwDef = qzFindJewelry(jewelryType);
  if (!jwDef || state.level < jwDef.minLevel) {
    return {
      state,
      result: { success: false, jewelry: null, xpGained: 0, coinsGained: 0, message: 'Jewelry type not unlocked at your level.', achievementsUnlocked: [] },
    };
  }

  if (crystalInstanceIds.length !== jwDef.slots) {
    return {
      state,
      result: { success: false, jewelry: null, xpGained: 0, coinsGained: 0, message: `This jewelry requires exactly ${jwDef.slots} crystal(s).`, achievementsUnlocked: [] },
    };
  }

  if (state.craftedJewelry.length >= QZ_MAX_JEWELRY) {
    return {
      state,
      result: { success: false, jewelry: null, xpGained: 0, coinsGained: 0, message: 'Jewelry box is full.', achievementsUnlocked: [] },
    };
  }

  const crystals = crystalInstanceIds
    .map(id => state.inventory.find(i => i.instanceId === id))
    .filter((c): c is QzInventoryCrystal => c !== undefined);

  if (crystals.length !== jwDef.slots) {
    return {
      state,
      result: { success: false, jewelry: null, xpGained: 0, coinsGained: 0, message: 'One or more crystal instances not found in inventory.', achievementsUnlocked: [] },
    };
  }

  const power = qzComputeJewelryPower(jewelryType, crystals);
  const rawXp = 20 + power;
  const xpResult = qzApplyXp(state, rawXp, state.currentMoonPhase);
  const coinValue = Math.floor(power * jwDef.valueMultiplier);

  const newInstance: QzCraftedJewelry = {
    instanceId: qzInternalGenerateId(),
    jewelryType,
    crystals: crystalInstanceIds,
    power,
    coinValue,
    craftedAt: Date.now(),
  };

  const remainingInventory = state.inventory.filter(
    i => !crystalInstanceIds.includes(i.instanceId),
  );

  const uniqueJewelry = new Set(state.craftedJewelry.map(j => j.jewelryType));
  uniqueJewelry.add(jewelryType);

  const nextState: QzQuartzCraftState = {
    ...state,
    level: xpResult.level,
    xp: xpResult.xp,
    totalXp: xpResult.totalXp,
    coins: state.coins + Math.floor(coinValue * 0.5),
    inventory: remainingInventory,
    craftedJewelry: [...state.craftedJewelry, newInstance],
    totalJewelryPerType: {
      ...state.totalJewelryPerType,
      [jewelryType]: (state.totalJewelryPerType[jewelryType] ?? 0) + 1,
    },
    stats: {
      ...state.stats,
      totalJewelryCrafted: state.stats.totalJewelryCrafted + 1,
      totalCoinsEarned: state.stats.totalCoinsEarned + Math.floor(coinValue * 0.5),
      uniqueJewelryCrafted: uniqueJewelry.size,
    },
  };

  const achievementsUnlocked = qzCheckAchievements(nextState);
  const finalState = qzApplyAchievementRewards(nextState, achievementsUnlocked);

  return {
    state: finalState,
    result: {
      success: true,
      jewelry: newInstance,
      xpGained: xpResult.actualXp,
      coinsGained: Math.floor(coinValue * 0.5),
      message: `Forged a ${jwDef.name} with power ${power}!`,
      achievementsUnlocked,
    },
  };
}

/** Process grid placement — returns full next state. */
export function qzPlaceGridCrystalReducer(
  state: QzQuartzCraftState,
  row: number,
  col: number,
  crystalType: QzCrystalType,
  shape: QzShape,
): { state: QzQuartzCraftState; result: QzGridResult } {
  if (row < 0 || row >= QZ_GRID_SIZE || col < 0 || col >= QZ_GRID_SIZE) {
    return {
      state,
      result: { success: false, harmonyBonus: 0, message: 'Grid position out of bounds.', achievementsUnlocked: [] },
    };
  }

  const existingIndex = state.grid.findIndex(c => c.row === row && c.col === col);
  if (existingIndex === -1) {
    return {
      state,
      result: { success: false, harmonyBonus: 0, message: 'Grid cell not found.', achievementsUnlocked: [] },
    };
  }

  const harmony = qzComputeGridHarmony(state.grid, row, col, crystalType);
  const newGrid = state.grid.map((cell, idx) => {
    if (idx !== existingIndex) return cell;
    return { ...cell, crystalType, shape };
  });

  const nextState: QzQuartzCraftState = {
    ...state,
    grid: newGrid,
    stats: {
      ...state.stats,
      totalGridPlacements: state.stats.totalGridPlacements + 1,
    },
  };

  const achievementsUnlocked = qzCheckAchievements(nextState);
  const finalState = qzApplyAchievementRewards(nextState, achievementsUnlocked);

  return {
    state: finalState,
    result: {
      success: true,
      harmonyBonus: harmony,
      message: harmony > 0
        ? `Placed crystal with harmony bonus +${harmony}!`
        : 'Crystal placed on the grid.',
      achievementsUnlocked,
    },
  };
}

/** Process singing bowl meditation tick — returns full next state. */
export function qzTickMeditationReducer(
  state: QzQuartzCraftState,
): QzQuartzCraftState {
  const session = state.meditationSession;
  if (!session.bowlChakra || session.ticksRemaining <= 0) return state;

  const bowl = qzFindBowl(session.bowlChakra);
  if (!bowl) return state;

  const newTicks = session.ticksRemaining - 1;
  const newFocus = qzInternalClamp(session.focus + bowl.focusGain, 0, QZ_MAX_FOCUS);

  const isComplete = newTicks <= 0;
  const medState: QzMeditationState = isComplete ? 'completed' : newFocus >= 80 ? 'peak' : 'resonating';
  const newSession: QzMeditationSession = {
    bowlChakra: session.bowlChakra,
    state: medState,
    focus: newFocus,
    ticksRemaining: newTicks,
    totalFocusGained: session.totalFocusGained + bowl.focusGain,
  };

  if (!isComplete) {
    return { ...state, meditationSession: newSession };
  }

  const meditationXp = qzComputeMeditationXp(session.bowlChakra, state.currentMoonPhase);
  const xpResult = qzApplyXp(state, meditationXp, state.currentMoonPhase);

  const nextState: QzQuartzCraftState = {
    ...state,
    level: xpResult.level,
    xp: xpResult.xp,
    totalXp: xpResult.totalXp,
    meditationSession: newSession,
    stats: {
      ...state.stats,
      totalMeditationsCompleted: state.stats.totalMeditationsCompleted + 1,
    },
  };

  const achievementsUnlocked = qzCheckAchievements(nextState);
  return qzApplyAchievementRewards(nextState, achievementsUnlocked);
}

/** Start a singing bowl meditation session. */
export function qzStartMeditationReducer(
  state: QzQuartzCraftState,
  bowlChakra: QzBowlChakra,
): { state: QzQuartzCraftState; result: QzMeditationResult } {
  const bowl = qzFindBowl(bowlChakra);
  if (!bowl || state.level < bowl.minLevel) {
    return {
      state,
      result: { success: false, xpGained: 0, focusGained: 0, message: 'Bowl not unlocked at your level.', achievementsUnlocked: [] },
    };
  }

  if (state.meditationSession.state !== 'idle' && state.meditationSession.state !== 'completed') {
    return {
      state,
      result: { success: false, xpGained: 0, focusGained: 0, message: 'Meditation already in progress.', achievementsUnlocked: [] },
    };
  }

  const newState: QzQuartzCraftState = {
    ...state,
    meditationSession: {
      bowlChakra,
      state: 'breathing',
      focus: 0,
      ticksRemaining: QZ_MEDITATION_TICKS,
      totalFocusGained: 0,
    },
  };

  return {
    state: newState,
    result: {
      success: true,
      xpGained: 0,
      focusGained: 0,
      message: `Began meditating with the ${bowl.name}. ${QZ_MEDITATION_TICKS} breaths remain.`,
      achievementsUnlocked: [],
    },
  };
}

/** Process a daily discovery. */
export function qzDiscoverDailyReducer(
  state: QzQuartzCraftState,
): { state: QzQuartzCraftState; result: QzDiscoveryResult } {
  const daily = state.daily;
  if (daily.discoveriesMade >= daily.maxDiscoveries) {
    return {
      state,
      result: { success: false, crystal: null, xpGained: 0, message: 'Daily discovery limit reached. Come back tomorrow!', achievementsUnlocked: [] },
    };
  }

  const phaseDef = qzFindMoonPhase(state.currentMoonPhase);
  const discoveryBonus = phaseDef ? phaseDef.discoveryBonus : 1.0;

  const rand = Math.random();
  const bonus = daily.bonusActive && daily.bonusCrystalType
    ? QZ_CRYSTALS.findIndex(c => c.id === daily.bonusCrystalType)
    : -1;

  let crystalIndex: number;
  if (rand < 0.08 * discoveryBonus) {
    crystalIndex = 8; // herkimer_diamond
  } else if (rand < 0.2 * discoveryBonus) {
    crystalIndex = Math.floor(Math.random() * 4) + 6; // rarer types
  } else if (bonus >= 0 && rand < 0.4) {
    crystalIndex = bonus;
  } else {
    crystalIndex = Math.floor(Math.random() * 6); // common types
  }

  crystalIndex = qzInternalClamp(crystalIndex, 0, QZ_CRYSTALS.length - 1);
  const discoveredCrystal = QZ_CRYSTALS[crystalIndex];
  const discoveredShape = QZ_SHAPES[Math.floor(Math.random() * 2)]; // random from first 2

  const quality = qzInternalClamp(
    Math.floor(40 + Math.random() * 40 + discoveredCrystal.clarity * 0.2),
    10,
    100,
  );

  const rawXp = discoveredCrystal.xpReward + discoveredShape.xpBonus;
  const xpResult = qzApplyXp(state, rawXp, state.currentMoonPhase);

  const newInstance: QzInventoryCrystal = {
    instanceId: qzInternalGenerateId(),
    crystalType: discoveredCrystal.id,
    shape: discoveredShape.id,
    quality,
    xpValue: xpResult.actualXp,
    coinValue: Math.floor(discoveredCrystal.baseValue * discoveredShape.valueMultiplier * (quality / 100)),
    craftedAt: Date.now(),
  };

  const uniqueCrystals = new Set(state.inventory.map(i => i.crystalType));
  uniqueCrystals.add(discoveredCrystal.id);

  const nextState: QzQuartzCraftState = {
    ...state,
    level: xpResult.level,
    xp: xpResult.xp,
    totalXp: xpResult.totalXp,
    inventory: [...state.inventory, newInstance],
    daily: { ...daily, discoveriesMade: daily.discoveriesMade + 1 },
    totalCrystalsPerType: {
      ...state.totalCrystalsPerType,
      [discoveredCrystal.id]: (state.totalCrystalsPerType[discoveredCrystal.id] ?? 0) + 1,
    },
    stats: {
      ...state.stats,
      totalCrystalsCrafted: state.stats.totalCrystalsCrafted + 1,
      rarestCrystalFound: discoveredCrystal.baseValue > (qzFindCrystal(state.stats.rarestCrystalFound as QzCrystalType)?.baseValue ?? 0)
        ? discoveredCrystal.id
        : state.stats.rarestCrystalFound,
      uniqueCrystalsCollected: uniqueCrystals.size,
    },
  };

  const achievementsUnlocked = qzCheckAchievements(nextState);
  const finalState = qzApplyAchievementRewards(nextState, achievementsUnlocked);

  return {
    state: finalState,
    result: {
      success: true,
      crystal: newInstance,
      xpGained: xpResult.actualXp,
      message: daily.bonusActive && discoveredCrystal.id === daily.bonusCrystalType
        ? `Bonus discovery! Found a ${discoveredCrystal.name}!`
        : `Discovered a ${discoveredCrystal.name} ${discoveredShape.name}!`,
      achievementsUnlocked,
    },
  };
}

/** Set the moon phase manually. */
export function qzSetMoonPhaseReducer(
  state: QzQuartzCraftState,
  phase: QzMoonPhase,
): QzQuartzCraftState {
  const history = state.moonPhaseHistory.includes(phase)
    ? state.moonPhaseHistory
    : [...state.moonPhaseHistory, phase];

  return {
    ...state,
    currentMoonPhase: phase,
    moonPhaseHistory: history,
    stats: {
      ...state.stats,
      totalMoonPhasesUsed: history.length,
    },
  };
}

/** Clear the crystal grid. */
export function qzClearGridReducer(state: QzQuartzCraftState): QzQuartzCraftState {
  return {
    ...state,
    grid: qzInternalCreateEmptyGrid(),
  };
}

/** Reset the daily discovery state for a new day. */
export function qzResetDailyReducer(state: QzQuartzCraftState, seed: number): QzQuartzCraftState {
  const lastDay = state.daily.lastDay;
  const newDay = seed;
  const streak = (newDay - lastDay === 1) ? state.daily.streak + 1 : 1;

  return {
    ...state,
    daily: {
      ...qzInternalCreateDaily(seed),
      streak,
      lastDay: newDay,
    },
  };
}

/** Apply achievement rewards (coins + xp) to state. */
export function qzApplyAchievementRewards(
  state: QzQuartzCraftState,
  unlockedIds: QzAchievementId[],
): QzQuartzCraftState {
  let totalCoins = 0;
  let totalXp = 0;
  for (const id of unlockedIds) {
    const def = qzFindAchievement(id);
    if (def) {
      totalCoins += def.rewardCoins;
      totalXp += def.rewardXp;
    }
  }
  if (totalXp === 0 && totalCoins === 0) return state;

  const xpResult = qzApplyXp(state, totalXp, state.currentMoonPhase);
  return {
    ...state,
    level: xpResult.level,
    xp: xpResult.xp,
    totalXp: xpResult.totalXp,
    coins: state.coins + totalCoins,
    stats: {
      ...state.stats,
      totalCoinsEarned: state.stats.totalCoinsEarned + totalCoins,
    },
  };
}

/** Sell a crystal from inventory by instance ID. */
export function qzSellCrystalReducer(
  state: QzQuartzCraftState,
  instanceId: string,
): { state: QzQuartzCraftState; sold: boolean; coins: number } {
  const crystal = state.inventory.find(i => i.instanceId === instanceId);
  if (!crystal) return { state, sold: false, coins: 0 };

  return {
    state: {
      ...state,
      coins: state.coins + crystal.coinValue,
      inventory: state.inventory.filter(i => i.instanceId !== instanceId),
      stats: {
        ...state.stats,
        totalCoinsEarned: state.stats.totalCoinsEarned + crystal.coinValue,
      },
    },
    sold: true,
    coins: crystal.coinValue,
  };
}

/** Sell a jewelry item by instance ID. */
export function qzSellJewelryReducer(
  state: QzQuartzCraftState,
  instanceId: string,
): { state: QzQuartzCraftState; sold: boolean; coins: number } {
  const jewelry = state.craftedJewelry.find(j => j.instanceId === instanceId);
  if (!jewelry) return { state, sold: false, coins: 0 };

  return {
    state: {
      ...state,
      coins: state.coins + jewelry.coinValue,
      craftedJewelry: state.craftedJewelry.filter(j => j.instanceId !== instanceId),
      stats: {
        ...state.stats,
        totalCoinsEarned: state.stats.totalCoinsEarned + jewelry.coinValue,
      },
    },
    sold: true,
    coins: jewelry.coinValue,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 8: REACT HOOK (default export only — React import here)
// ═══════════════════════════════════════════════════════════════════════════════

import { useState } from 'react';

export default function useQuartzCraft(initialState?: QzQuartzCraftState) {
  const [state, setState] = useState<QzQuartzCraftState>(
    initialState ?? qzCreateInitialState(),
  );

  const craftCrystal = (crystalType: QzCrystalType, shape: QzShape): QzCraftResult => {
    let result: QzCraftResult = { success: false, crystal: null, xpGained: 0, coinsGained: 0, message: '', achievementsUnlocked: [] };
    setState(prev => {
      const outcome = qzCraftCrystalReducer(prev, crystalType, shape);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  };

  const craftJewelry = (jewelryType: QzJewelryType, crystalInstanceIds: string[]): QzJewelryResult => {
    let result: QzJewelryResult = { success: false, jewelry: null, xpGained: 0, coinsGained: 0, message: '', achievementsUnlocked: [] };
    setState(prev => {
      const outcome = qzCraftJewelryReducer(prev, jewelryType, crystalInstanceIds);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  };

  const placeGridCrystal = (row: number, col: number, crystalType: QzCrystalType, shape: QzShape): QzGridResult => {
    let result: QzGridResult = { success: false, harmonyBonus: 0, message: '', achievementsUnlocked: [] };
    setState(prev => {
      const outcome = qzPlaceGridCrystalReducer(prev, row, col, crystalType, shape);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  };

  const clearGrid = () => {
    setState(prev => qzClearGridReducer(prev));
  };

  const startMeditation = (bowlChakra: QzBowlChakra): QzMeditationResult => {
    let result: QzMeditationResult = { success: false, xpGained: 0, focusGained: 0, message: '', achievementsUnlocked: [] };
    setState(prev => {
      const outcome = qzStartMeditationReducer(prev, bowlChakra);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  };

  const tickMeditation = () => {
    setState(prev => qzTickMeditationReducer(prev));
  };

  const dailyDiscovery = (): QzDiscoveryResult => {
    let result: QzDiscoveryResult = { success: false, crystal: null, xpGained: 0, message: '', achievementsUnlocked: [] };
    setState(prev => {
      const outcome = qzDiscoverDailyReducer(prev);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  };

  const setMoonPhase = (phase: QzMoonPhase) => {
    setState(prev => qzSetMoonPhaseReducer(prev, phase));
  };

  const resetDaily = (seed: number) => {
    setState(prev => qzResetDailyReducer(prev, seed));
  };

  const sellCrystal = (instanceId: string): { sold: boolean; coins: number } => {
    let outcome: { sold: boolean; coins: number } = { sold: false, coins: 0 };
    setState(prev => {
      const res = qzSellCrystalReducer(prev, instanceId);
      outcome = { sold: res.sold, coins: res.coins };
      return res.state;
    });
    return outcome;
  };

  const sellJewelryItem = (instanceId: string): { sold: boolean; coins: number } => {
    let outcome: { sold: boolean; coins: number } = { sold: false, coins: 0 };
    setState(prev => {
      const res = qzSellJewelryReducer(prev, instanceId);
      outcome = { sold: res.sold, coins: res.coins };
      return res.state;
    });
    return outcome;
  };

  return {
    ...state,
    craftCrystal,
    craftJewelry,
    placeGridCrystal,
    clearGrid,
    startMeditation,
    tickMeditation,
    dailyDiscovery,
    setMoonPhase,
    resetDaily,
    sellCrystal,
    sellJewelryItem,
  };
}
