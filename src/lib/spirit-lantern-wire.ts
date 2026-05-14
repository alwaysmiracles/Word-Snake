import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Spirit Lantern Festival (万灵灯会) — Wire Module
// A mystical Chinese lantern festival where players collect spirit
// lanterns, befriend ghost spirits, and participate in traditional
// festival activities during the Ghost Month.
// ============================================================

// ============================================================
// Type Definitions
// ============================================================

type SpiritRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type RitualType =
  | 'incense_offering'
  | 'lantern_lighting'
  | 'spirit_summoning'
  | 'ancestor_prayer'
  | 'moonlight_meditation'
  | 'ghost_fire_dance'
  | 'river_release'
  | 'celestial_connection';

interface SpiritDefinition {
  id: number;
  name: string;
  nameZh: string;
  rarity: SpiritRarity;
  description: string;
  districtId: number;
  energyCost: number;
  moonlightReward: number;
  lanternPointsReward: number;
  favorReward: number;
  abilityId: number | null;
  lore: string;
}

interface Spirit {
  id: number;
  definition: SpiritDefinition;
  discovered: boolean;
  befriended: boolean;
  friendshipLevel: number;
  maxFriendship: number;
  encounters: number;
  lastEncounterDay: number;
}

interface DistrictDefinition {
  id: number;
  name: string;
  nameZh: string;
  description: string;
  requiredFestivalDay: number;
  spiritIds: number[];
  lanternIds: number[];
  stallIds: number[];
  ambientColor: string;
  unlockCost: number;
}

interface District {
  id: number;
  definition: DistrictDefinition;
  unlocked: boolean;
  visits: number;
  currentActivity: string | null;
  prosperityLevel: number;
}

interface LanternDefinition {
  id: number;
  name: string;
  nameZh: string;
  description: string;
  rarity: SpiritRarity;
  moonlightCost: number;
  energyBonus: number;
  favorBonus: number;
  color: string;
  glowColor: string;
}

interface Lantern {
  id: number;
  definition: LanternDefinition;
  collected: boolean;
  lit: boolean;
  count: number;
  timesLit: number;
}

interface StallDefinition {
  id: number;
  name: string;
  nameZh: string;
  description: string;
  districtId: number;
  maxLevel: number;
  baseUpgradeCost: number;
  energyPerLevel: number;
  moonlightPerLevel: number;
  lanternPointsPerLevel: number;
  specialEffect: string;
}

interface Stall {
  id: number;
  definition: StallDefinition;
  level: number;
  totalUpgrades: number;
  lastUpgradeDay: number;
}

interface AbilityDefinition {
  id: number;
  name: string;
  nameZh: string;
  description: string;
  spiritRarityRequired: SpiritRarity;
  energyCost: number;
  cooldown: number;
  moonlightGain: number;
  favorGain: number;
  lanternPointsGain: number;
  effectType: string;
  effectPower: number;
}

interface Ability {
  id: number;
  definition: AbilityDefinition;
  unlocked: boolean;
  timesUsed: number;
  lastUsedDay: number;
  cooldownRemaining: number;
}

interface AchievementDefinition {
  id: number;
  name: string;
  nameZh: string;
  description: string;
  icon: string;
  category: string;
  condition: string;
  rewardLanternPoints: number;
  rewardMoonlight: number;
}

interface Achievement {
  id: number;
  definition: AchievementDefinition;
  unlocked: boolean;
  unlockedDay: number;
}

interface TitleDefinition {
  id: number;
  nameMale: string;
  nameFemale: string;
  nameZh: string;
  requiredSpiritsBefriended: number;
  requiredLanterns: number;
  requiredFestivalDay: number;
  requiredAncestralFavor: number;
  color: string;
}

interface DailyRitual {
  type: RitualType;
  name: string;
  nameZh: string;
  description: string;
  energyCost: number;
  moonlightReward: number;
  lanternPointsReward: number;
  favorReward: number;
  energyReward: number;
  day: number;
  completed: boolean;
  stepsRequired: number;
  stepsCompleted: number;
}

interface RitualDefinition {
  type: RitualType;
  name: string;
  nameZh: string;
  description: string;
  baseEnergyCost: number;
  baseMoonlightReward: number;
  baseLanternPointsReward: number;
  baseFavorReward: number;
  baseEnergyReward: number;
  stepsRequired: number;
}

interface SpiritLanternStats {
  totalSpiritsBefriended: number;
  totalLanternsLit: number;
  totalStallUpgrades: number;
  totalAbilitiesUsed: number;
  totalRitualsCompleted: number;
  totalSkyLanternsReleased: number;
  totalAncestorVisits: number;
  totalIncenseOffered: number;
  totalMoonlightCollected: number;
  totalDistrictsVisited: number;
  totalFestivalDays: number;
}

interface SpiritLanternProgress {
  spiritsPercentage: number;
  lanternsPercentage: number;
  stallsPercentage: number;
  abilitiesPercentage: number;
  achievementsPercentage: number;
  districtsPercentage: number;
  overallPercentage: number;
}

// ============================================================
// SL_ Constants
// ============================================================

const SL_MAX_ENERGY = 200;
const SL_MAX_MOONLIGHT = 1000;
const SL_MAX_LANTERN_POINTS = 99999;
const SL_MAX_FAVOR = 500;
const SL_MAX_FRIENDSHIP = 100;
const SL_SPIRIT_COUNT = 35;
const SL_DISTRICT_COUNT = 8;
const SL_LANTERN_COUNT = 30;
const SL_STALL_COUNT = 25;
const SL_ABILITY_COUNT = 22;
const SL_ACHIEVEMENT_COUNT = 18;
const SL_TITLE_COUNT = 8;
const SL_MAX_FESTIVAL_DAY = 30;
const SL_ENERGY_REGEN_PER_DAY = 50;
const SL_MOONLIGHT_PER_HOUR = 5;
const SL_SKY_LANTERN_COST = 10;
const SL_SKY_LANTERN_ENERGY_COST = 5;
const SL_ANCESTOR_VISIT_COST = 15;
const SL_INCENSE_COST = 8;
const SL_INCENSE_ENERGY_COST = 3;
const SL_RITUAL_ENERGY_COST = 20;
const SL_TITLE_UNLOCK_CHECK_INTERVAL = 1;

// ============================================================
// Color Theme Constants
// ============================================================

const SL_COLOR_RED = '#FF1744';
const SL_COLOR_GOLD = '#FFD700';
const SL_COLOR_ORANGE = '#FF9100';
const SL_COLOR_PAPER_WHITE = '#FFF8E1';
const SL_COLOR_JADE_GREEN = '#00C853';
const SL_COLORS = [
  SL_COLOR_RED,
  SL_COLOR_GOLD,
  SL_COLOR_ORANGE,
  SL_COLOR_PAPER_WHITE,
  SL_COLOR_JADE_GREEN,
];

// ============================================================
// Spirit Definitions (35 spirits, 5 tiers of 7)
// ============================================================

const SL_SPIRIT_DEFINITIONS: SpiritDefinition[] = [
  // ---- Common (1-7) ----
  { id: 1, name: 'Paper Lantern Spirit', nameZh: '纸灯灵', rarity: 'common',
    description: 'A gentle spirit born from a forgotten paper lantern.', districtId: 0,
    energyCost: 10, moonlightReward: 15, lanternPointsReward: 5, favorReward: 2,
    abilityId: null, lore: 'Once lit during a rainy Ghost Month, it was forgotten and gained a soul of its own.' },
  { id: 2, name: 'River Ghost', nameZh: '河童鬼', rarity: 'common',
    description: 'A playful water spirit that haunts the riverside during festivals.', districtId: 2,
    energyCost: 10, moonlightReward: 12, lanternPointsReward: 8, favorReward: 3,
    abilityId: null, lore: 'Legend says it was once a child who fell into the river during a lantern festival.' },
  { id: 3, name: 'Candle Flicker', nameZh: '烛火灵', rarity: 'common',
    description: 'A tiny flame spirit that dances atop ritual candles.', districtId: 6,
    energyCost: 8, moonlightReward: 10, lanternPointsReward: 6, favorReward: 2,
    abilityId: null, lore: 'No one remembers who first lit this candle, but it has burned for a thousand years.' },
  { id: 4, name: 'Ink Wash Spirit', nameZh: '水墨灵', rarity: 'common',
    description: 'A spirit that manifests from spilled ink on festival scrolls.', districtId: 1,
    energyCost: 12, moonlightReward: 14, lanternPointsReward: 7, favorReward: 2,
    abilityId: null, lore: 'A calligrapher\'s masterwork absorbed the sorrow of a hundred unfinished poems.' },
  { id: 5, name: 'Wind Chime Ghost', nameZh: '风铃鬼', rarity: 'common',
    description: 'A spirit that lives inside bamboo wind chimes.', districtId: 0,
    energyCost: 9, moonlightReward: 11, lanternPointsReward: 4, favorReward: 3,
    abilityId: null, lore: 'Its melodic chimes are said to ward off evil spirits during the Ghost Month.' },
  { id: 6, name: 'Willow Wisp', nameZh: '柳火灵', rarity: 'common',
    description: 'A soft green flame that hovers near willow trees at dusk.', districtId: 2,
    energyCost: 10, moonlightReward: 13, lanternPointsReward: 6, favorReward: 2,
    abilityId: null, lore: 'Ancient willow trees along the spirit river attract these gentle flames each Ghost Month.' },
  { id: 7, name: 'Stone Guardian Spirit', nameZh: '石守灵', rarity: 'common',
    description: 'A protective spirit that inhabits stone lion statues.', districtId: 3,
    energyCost: 11, moonlightReward: 12, lanternPointsReward: 5, favorReward: 4,
    abilityId: null, lore: 'Guardian of thresholds, it has stood watch over the Ancestor Shrine for centuries.' },

  // ---- Uncommon (8-14) ----
  { id: 8, name: 'Moon Rabbit Spirit', nameZh: '月兔灵', rarity: 'uncommon',
    description: 'A rabbit spirit that descends from the moon during Ghost Month.', districtId: 4,
    energyCost: 20, moonlightReward: 30, lanternPointsReward: 15, favorReward: 5,
    abilityId: 5, lore: 'It pounds moonlight into rice cakes on the lunar surface, but visits earth each Ghost Month.' },
  { id: 9, name: 'Lotus Dancer', nameZh: '莲花舞灵', rarity: 'uncommon',
    description: 'An elegant spirit that performs dances on blooming lotus flowers.', districtId: 2,
    energyCost: 22, moonlightReward: 28, lanternPointsReward: 12, favorReward: 6,
    abilityId: null, lore: 'She was once a temple dancer whose devotion transcended death itself.' },
  { id: 10, name: 'Firefly Ghost', nameZh: '萤火鬼', rarity: 'uncommon',
    description: 'A swarm of spirit fireflies that guide lost souls home.', districtId: 6,
    energyCost: 18, moonlightReward: 25, lanternPointsReward: 10, favorReward: 5,
    abilityId: null, lore: 'Each firefly carries a tiny fragment of a wandering soul seeking the afterlife.' },
  { id: 11, name: 'Bamboo Whisper', nameZh: '竹语灵', rarity: 'uncommon',
    description: 'A spirit that speaks through the rustling of bamboo leaves.', districtId: 6,
    energyCost: 20, moonlightReward: 26, lanternPointsReward: 14, favorReward: 4,
    abilityId: null, lore: 'It whispers the names of ancestors long forgotten, reminding the living to remember.' },
  { id: 12, name: 'Cloud Walker', nameZh: '云行灵', rarity: 'uncommon',
    description: 'A spirit that treads upon clouds, bringing rain and blessings.', districtId: 7,
    energyCost: 24, moonlightReward: 32, lanternPointsReward: 16, favorReward: 5,
    abilityId: null, lore: 'Once a cloud-riding immortal who chose to remain in the mortal realm out of compassion.' },
  { id: 13, name: 'Cherry Blossom Spirit', nameZh: '樱花灵', rarity: 'uncommon',
    description: 'A spirit that blooms with eternal cherry blossoms.', districtId: 6,
    energyCost: 19, moonlightReward: 24, lanternPointsReward: 13, favorReward: 6,
    abilityId: null, lore: 'Every blossom she releases carries a wish to the spirit realm.' },
  { id: 14, name: 'Ink Brush Ghost', nameZh: '画笔鬼', rarity: 'uncommon',
    description: 'A mischievous artist spirit that paints illusions on festival walls.', districtId: 1,
    energyCost: 21, moonlightReward: 27, lanternPointsReward: 11, favorReward: 5,
    abilityId: null, lore: 'His paintings are so vivid they come to life at midnight during the Ghost Month.' },

  // ---- Rare (15-21) ----
  { id: 15, name: 'Dragon Boat Ghost', nameZh: '龙船鬼', rarity: 'rare',
    description: 'A spectral dragon boat that races across the spirit river.', districtId: 2,
    energyCost: 35, moonlightReward: 50, lanternPointsReward: 25, favorReward: 10,
    abilityId: 16, lore: 'The ghostly crew of an ancient Dragon Boat race that never finished their final course.' },
  { id: 16, name: "Jade Emperor's Messenger", nameZh: '玉帝使者', rarity: 'rare',
    description: 'A celestial messenger sent by the Jade Emperor to oversee the festival.', districtId: 7,
    energyCost: 40, moonlightReward: 55, lanternPointsReward: 30, favorReward: 12,
    abilityId: 11, lore: 'Bearing imperial decrees, this spirit ensures the Ghost Month rituals are properly observed.' },
  { id: 17, name: 'Phoenix Flame Spirit', nameZh: '凤凰焰灵', rarity: 'rare',
    description: 'A magnificent spirit wreathed in phoenix flames of rebirth.', districtId: 7,
    energyCost: 38, moonlightReward: 52, lanternPointsReward: 28, favorReward: 11,
    abilityId: 17, lore: 'Born from the ashes of a phoenix that descended during a particularly auspicious Ghost Month.' },
  { id: 18, name: 'Tiger Spirit Warrior', nameZh: '虎灵武士', rarity: 'rare',
    description: 'A fierce guardian spirit in the form of a spectral tiger.', districtId: 3,
    energyCost: 36, moonlightReward: 48, lanternPointsReward: 26, favorReward: 10,
    abilityId: 19, lore: 'Protects the Ancestor Shrine from malevolent spirits with its celestial roar.' },
  { id: 19, name: 'Peony Fairy', nameZh: '牡丹仙子', rarity: 'rare',
    description: 'A graceful fairy spirit surrounded by blooming celestial peonies.', districtId: 6,
    energyCost: 34, moonlightReward: 45, lanternPointsReward: 22, favorReward: 13,
    abilityId: null, lore: 'The peonies she tends bloom only during Ghost Month, their fragrance connecting the living and dead.' },
  { id: 20, name: 'Thunder Drum Ghost', nameZh: '雷鼓鬼', rarity: 'rare',
    description: 'A booming spirit that beats spectral drums of thunder.', districtId: 5,
    energyCost: 37, moonlightReward: 50, lanternPointsReward: 24, favorReward: 9,
    abilityId: null, lore: 'Its thunderous drumbeats can be heard across all eight festival districts simultaneously.' },
  { id: 21, name: 'Silk Weaver Spirit', nameZh: '织锦灵', rarity: 'rare',
    description: 'A spirit that weaves moonlight into ethereal silk garments.', districtId: 1,
    energyCost: 33, moonlightReward: 46, lanternPointsReward: 20, favorReward: 12,
    abilityId: null, lore: 'The silk she weaves is visible only to those who have lost someone dear.' },

  // ---- Epic (22-28) ----
  { id: 22, name: 'Thousand-Year Fox Spirit', nameZh: '千年狐仙', rarity: 'epic',
    description: 'An ancient fox spirit that has gained wisdom over a millennium.', districtId: 5,
    energyCost: 60, moonlightReward: 80, lanternPointsReward: 45, favorReward: 20,
    abilityId: 18, lore: 'After a thousand years of cultivation, she has mastered the arts of illusion and transformation.' },
  { id: 23, name: "Dragon King's Daughter", nameZh: '龙王之女', rarity: 'epic',
    description: 'A royal water dragon princess from the Eastern Sea.', districtId: 2,
    energyCost: 65, moonlightReward: 90, lanternPointsReward: 50, favorReward: 22,
    abilityId: 16, lore: 'She presides over the River of Lights, blessing all lanterns released into the water.' },
  { id: 24, name: 'White Snake Spirit', nameZh: '白蛇灵', rarity: 'epic',
    description: 'A legendary serpent spirit of immense power and compassion.', districtId: 2,
    energyCost: 62, moonlightReward: 85, lanternPointsReward: 48, favorReward: 21,
    abilityId: 17, lore: 'Having walked among humans for centuries, she understands the boundary between worlds.' },
  { id: 25, name: 'Celestial Musician', nameZh: '天乐仙', rarity: 'epic',
    description: 'A divine musician whose melodies bridge the mortal and spirit realms.', districtId: 5,
    energyCost: 58, moonlightReward: 78, lanternPointsReward: 42, favorReward: 19,
    abilityId: 12, lore: 'His music can make spirits weep with joy or mortals glimpse the afterlife.' },
  { id: 26, name: 'Shadow Puppet Master', nameZh: '皮影大师', rarity: 'epic',
    description: 'A master of shadow puppetry whose creations take on a life of their own.', districtId: 5,
    energyCost: 55, moonlightReward: 75, lanternPointsReward: 40, favorReward: 18,
    abilityId: null, lore: 'Every shadow puppet he creates contains a fragment of a real spirit\'s story.' },
  { id: 27, name: 'Flame Phoenix Spirit', nameZh: '烈焰凤灵', rarity: 'epic',
    description: 'A primal phoenix spirit of pure elemental fire.', districtId: 7,
    energyCost: 63, moonlightReward: 88, lanternPointsReward: 47, favorReward: 20,
    abilityId: 17, lore: 'Older than the festival itself, this phoenix was the first spirit ever to befriend a human.' },
  { id: 28, name: "Jade Emperor's Cat", nameZh: '玉帝灵猫', rarity: 'epic',
    description: 'A mysterious cat spirit that serves the Jade Emperor in the celestial realm.', districtId: 7,
    energyCost: 56, moonlightReward: 76, lanternPointsReward: 41, favorReward: 17,
    abilityId: null, lore: 'It can see into all three realms simultaneously: mortal, spirit, and celestial.' },

  // ---- Legendary (29-35) ----
  { id: 29, name: "Spirit Emperor's Guard", nameZh: '灵帝近卫', rarity: 'legendary',
    description: 'An elite guardian of the Spirit Emperor, clad in spectral armor.', districtId: 7,
    energyCost: 100, moonlightReward: 150, lanternPointsReward: 80, favorReward: 40,
    abilityId: 22, lore: 'One of twelve elite guards who have protected the Spirit Emperor since the beginning of time.' },
  { id: 30, name: 'Celestial Dragon', nameZh: '天龙灵', rarity: 'legendary',
    description: 'A supreme dragon spirit that rules the celestial heavens.', districtId: 7,
    energyCost: 120, moonlightReward: 180, lanternPointsReward: 100, favorReward: 50,
    abilityId: 16, lore: 'The Celestial Dragon breathes starlight and its scales are made of pure moonbeams.' },
  { id: 31, name: 'Moon Goddess Spirit', nameZh: '月神灵', rarity: 'legendary',
    description: 'A fragment of the Moon Goddess herself, radiant and serene.', districtId: 4,
    energyCost: 110, moonlightReward: 200, lanternPointsReward: 90, favorReward: 55,
    abilityId: 5, lore: 'She descended from the moon to bless the Ghost Month with her eternal silver light.' },
  { id: 32, name: 'Ancestral Sage', nameZh: '先贤灵', rarity: 'legendary',
    description: 'The collective wisdom of a thousand generations of ancestors.', districtId: 3,
    energyCost: 105, moonlightReward: 160, lanternPointsReward: 85, favorReward: 60,
    abilityId: 3, lore: 'This spirit is not one ancestor but the merged wisdom of all who came before.' },
  { id: 33, name: 'Thousand-Hand Guanyin', nameZh: '千手观音', rarity: 'legendary',
    description: 'The Bodhisattva of Compassion in her thousand-armed form.', districtId: 3,
    energyCost: 130, moonlightReward: 200, lanternPointsReward: 110, favorReward: 65,
    abilityId: 19, lore: 'Each of her thousand hands holds a different tool to save suffering spirits.' },
  { id: 34, name: "Jade Emperor's Phoenix", nameZh: '玉帝凤灵', rarity: 'legendary',
    description: 'The personal phoenix companion of the Jade Emperor.', districtId: 7,
    energyCost: 115, moonlightReward: 170, lanternPointsReward: 95, favorReward: 45,
    abilityId: 17, lore: 'It sings a song at dawn that resurrects fallen spirits and grants them peace.' },
  { id: 35, name: 'Primordial Spirit', nameZh: '太初灵', rarity: 'legendary',
    description: 'The first spirit ever to exist, present at the creation of the world.', districtId: 7,
    energyCost: 150, moonlightReward: 250, lanternPointsReward: 150, favorReward: 80,
    abilityId: 22, lore: 'Before there was heaven or earth, there was this spirit. It remembers everything.' },
];

// ============================================================
// District Definitions (8 districts)
// ============================================================

const SL_DISTRICT_DEFINITIONS: DistrictDefinition[] = [
  { id: 0, name: 'Lantern Alley', nameZh: '灯笼巷',
    description: 'A narrow street lined with countless hanging lanterns of every shape and color.',
    requiredFestivalDay: 1, spiritIds: [1, 5, 11],
    lanternIds: [0, 1, 2, 3, 7, 8, 20, 29], stallIds: [0, 1, 5, 7, 9, 11, 17, 18],
    ambientColor: SL_COLOR_ORANGE, unlockCost: 0 },
  { id: 1, name: 'Spirit Market', nameZh: '灵市集',
    description: 'A bustling marketplace where spirits and mortals trade mystical wares.',
    requiredFestivalDay: 1, spiritIds: [4, 14, 21],
    lanternIds: [4, 9, 13, 18, 22, 23, 24, 25], stallIds: [2, 3, 4, 6, 10, 12, 13, 14],
    ambientColor: SL_COLOR_GOLD, unlockCost: 0 },
  { id: 2, name: 'River of Lights', nameZh: '万灯河',
    description: 'A shimmering river where thousands of lanterns float toward the spirit realm.',
    requiredFestivalDay: 3, spiritIds: [2, 6, 9, 15, 23, 24],
    lanternIds: [2, 5, 14, 19, 26, 28], stallIds: [8, 15, 20, 21, 24],
    ambientColor: '#4FC3F7', unlockCost: 50 },
  { id: 3, name: 'Ancestor Shrine', nameZh: '祖先神龛',
    description: 'A sacred shrine where families honor their ancestors with offerings and prayers.',
    requiredFestivalDay: 1, spiritIds: [7, 18, 32, 33],
    lanternIds: [6, 10, 16, 19, 25], stallIds: [3, 11, 19, 23],
    ambientColor: SL_COLOR_PAPER_WHITE, unlockCost: 0 },
  { id: 4, name: 'Moon Bridge', nameZh: '月桥',
    description: 'A crescent-shaped bridge where the moonlight is brightest during Ghost Month.',
    requiredFestivalDay: 5, spiritIds: [8, 31],
    lanternIds: [7, 21, 26, 27], stallIds: [21, 24],
    ambientColor: '#E1BEE7', unlockCost: 100 },
  { id: 5, name: 'Ghost Theater', nameZh: '鬼戏台',
    description: 'An open-air theater where spirits perform traditional operas and shadow plays.',
    requiredFestivalDay: 7, spiritIds: [20, 22, 25, 26],
    lanternIds: [1, 11, 15, 22, 29], stallIds: [6, 9, 14, 18],
    ambientColor: '#CE93D8', unlockCost: 150 },
  { id: 6, name: 'Incense Garden', nameZh: '香园',
    description: 'A tranquil garden filled with aromatic incense and blooming spirit flowers.',
    requiredFestivalDay: 2, spiritIds: [3, 10, 11, 13, 19],
    lanternIds: [2, 12, 17, 23, 27], stallIds: [4, 11, 16, 22],
    ambientColor: SL_COLOR_JADE_GREEN, unlockCost: 30 },
  { id: 7, name: 'Celestial Pavilion', nameZh: '天阁',
    description: 'A magnificent pavilion floating above the festival, home to the mightiest spirits.',
    requiredFestivalDay: 14, spiritIds: [12, 16, 17, 27, 28, 29, 30, 34, 35],
    lanternIds: [9, 21, 26, 28, 29], stallIds: [8, 23, 24],
    ambientColor: SL_COLOR_GOLD, unlockCost: 500 },
];

// ============================================================
// Lantern Definitions (30 lanterns)
// ============================================================

const SL_LANTERN_DEFINITIONS: LanternDefinition[] = [
  { id: 0, name: 'Paper Crane Lantern', nameZh: '纸鹤灯', description: 'A delicate crane folded from rice paper.',
    rarity: 'common', moonlightCost: 5, energyBonus: 5, favorBonus: 1, color: SL_COLOR_PAPER_WHITE, glowColor: '#FFE0B2' },
  { id: 1, name: 'Dragon Lantern', nameZh: '龙灯', description: 'A fierce dragon lantern with flowing silk tail.',
    rarity: 'epic', moonlightCost: 50, energyBonus: 30, favorBonus: 15, color: SL_COLOR_RED, glowColor: '#FF5252' },
  { id: 2, name: 'Lotus Lantern', nameZh: '莲花灯', description: 'A blooming lotus that floats on water.',
    rarity: 'uncommon', moonlightCost: 15, energyBonus: 10, favorBonus: 5, color: '#F48FB1', glowColor: '#F8BBD0' },
  { id: 3, name: 'Zodiac Lantern', nameZh: '生肖灯', description: 'Displays all twelve zodiac animals.',
    rarity: 'rare', moonlightCost: 35, energyBonus: 20, favorBonus: 10, color: SL_COLOR_GOLD, glowColor: '#FFECB3' },
  { id: 4, name: 'Koi Lantern', nameZh: '锦鲤灯', description: 'A swimming koi fish lantern bringing good fortune.',
    rarity: 'uncommon', moonlightCost: 18, energyBonus: 12, favorBonus: 6, color: '#FF7043', glowColor: '#FFAB91' },
  { id: 5, name: 'Butterfly Lantern', nameZh: '蝴蝶灯', description: 'Wings flutter gently in the ghostly breeze.',
    rarity: 'uncommon', moonlightCost: 14, energyBonus: 9, favorBonus: 5, color: '#BA68C8', glowColor: '#CE93D8' },
  { id: 6, name: 'Star Lantern', nameZh: '星灯', description: 'Contains captured starlight from the celestial realm.',
    rarity: 'rare', moonlightCost: 40, energyBonus: 25, favorBonus: 12, color: '#FFF176', glowColor: '#FFF59D' },
  { id: 7, name: 'Moon Lantern', nameZh: '月灯', description: 'Glows with the soft silver light of the full moon.',
    rarity: 'rare', moonlightCost: 38, energyBonus: 22, favorBonus: 11, color: '#E1BEE7', glowColor: '#F3E5F5' },
  { id: 8, name: 'Cloud Lantern', nameZh: '云灯', description: 'Shaped like a fluffy cloud, drifts in the night sky.',
    rarity: 'common', moonlightCost: 8, energyBonus: 6, favorBonus: 2, color: '#ECEFF1', glowColor: '#FAFAFA' },
  { id: 9, name: 'Phoenix Lantern', nameZh: '凤灯', description: 'A magnificent phoenix wreathed in golden flame.',
    rarity: 'legendary', moonlightCost: 100, energyBonus: 60, favorBonus: 30, color: SL_COLOR_GOLD, glowColor: '#FFD54F' },
  { id: 10, name: 'Tiger Lantern', nameZh: '虎灯', description: 'A fearsome tiger spirit lantern for protection.',
    rarity: 'rare', moonlightCost: 36, energyBonus: 21, favorBonus: 10, color: '#FF8A65', glowColor: '#FFAB91' },
  { id: 11, name: 'Rabbit Lantern', nameZh: '兔灯', description: 'An adorable rabbit lantern with long glowing ears.',
    rarity: 'common', moonlightCost: 6, energyBonus: 5, favorBonus: 2, color: '#F5F5F5', glowColor: '#EEEEEE' },
  { id: 12, name: 'Horse Lantern', nameZh: '马灯', description: 'A galloping horse lantern symbolizing success.',
    rarity: 'uncommon', moonlightCost: 16, energyBonus: 11, favorBonus: 5, color: '#A1887F', glowColor: '#BCAAA4' },
  { id: 13, name: 'Snake Lantern', nameZh: '蛇灯', description: 'A coiling serpent lantern with emerald scales.',
    rarity: 'uncommon', moonlightCost: 17, energyBonus: 10, favorBonus: 5, color: SL_COLOR_JADE_GREEN, glowColor: '#69F0AE' },
  { id: 14, name: 'Dragon Boat Lantern', nameZh: '龙船灯', description: 'A miniature dragon boat lantern for the river.',
    rarity: 'rare', moonlightCost: 42, energyBonus: 24, favorBonus: 13, color: '#42A5F5', glowColor: '#90CAF9' },
  { id: 15, name: 'Peony Lantern', nameZh: '牡丹灯', description: 'An exquisite peony lantern symbolizing wealth.',
    rarity: 'epic', moonlightCost: 55, energyBonus: 32, favorBonus: 16, color: '#EC407A', glowColor: '#F48FB1' },
  { id: 16, name: 'Cherry Blossom Lantern', nameZh: '樱花灯', description: 'Shedding eternal petals of soft pink light.',
    rarity: 'uncommon', moonlightCost: 20, energyBonus: 13, favorBonus: 7, color: '#F8BBD0', glowColor: '#FCE4EC' },
  { id: 17, name: 'Bamboo Lantern', nameZh: '竹灯', description: 'Crafted from ancient bamboo with calligraphy.',
    rarity: 'common', moonlightCost: 7, energyBonus: 6, favorBonus: 3, color: '#8D6E63', glowColor: '#A1887F' },
  { id: 18, name: 'Jade Lantern', nameZh: '玉灯', description: 'Carved from precious jade, glowing with inner light.',
    rarity: 'epic', moonlightCost: 60, energyBonus: 35, favorBonus: 18, color: SL_COLOR_JADE_GREEN, glowColor: '#B9F6CA' },
  { id: 19, name: 'Gold Ingot Lantern', nameZh: '金元宝灯', description: 'Shaped like a gold ingot for prosperity.',
    rarity: 'rare', moonlightCost: 32, energyBonus: 18, favorBonus: 9, color: SL_COLOR_GOLD, glowColor: '#FFE082' },
  { id: 20, name: 'Fan Lantern', nameZh: '扇灯', description: 'An elegant folding fan lantern with painted scene.',
    rarity: 'common', moonlightCost: 9, energyBonus: 7, favorBonus: 3, color: '#80CBC4', glowColor: '#B2DFDB' },
  { id: 21, name: 'Palace Lantern', nameZh: '宫灯', description: 'An ornate palace lantern fit for an emperor.',
    rarity: 'epic', moonlightCost: 65, energyBonus: 38, favorBonus: 20, color: SL_COLOR_RED, glowColor: '#EF5350' },
  { id: 22, name: 'Umbrella Lantern', nameZh: '伞灯', description: 'An oil-paper umbrella that glows from within.',
    rarity: 'uncommon', moonlightCost: 19, energyBonus: 12, favorBonus: 6, color: '#FF80AB', glowColor: '#FF4081' },
  { id: 23, name: 'Heart Lantern', nameZh: '心灯', description: 'A heart-shaped lantern pulsing with warmth.',
    rarity: 'common', moonlightCost: 8, energyBonus: 5, favorBonus: 4, color: SL_COLOR_RED, glowColor: '#EF9A9A' },
  { id: 24, name: 'Bell Lantern', nameZh: '铃灯', description: 'A lantern topped with a spirit bell that chimes.',
    rarity: 'uncommon', moonlightCost: 15, energyBonus: 10, favorBonus: 5, color: SL_COLOR_GOLD, glowColor: '#FFE082' },
  { id: 25, name: 'Teardrop Lantern', nameZh: '泪滴灯', description: 'A sorrowful lantern that glows with bluish tears.',
    rarity: 'rare', moonlightCost: 30, energyBonus: 18, favorBonus: 10, color: '#64B5F6', glowColor: '#90CAF9' },
  { id: 26, name: 'Spiral Lantern', nameZh: '螺旋灯', description: 'A lantern with spiraling patterns of light.',
    rarity: 'rare', moonlightCost: 34, energyBonus: 20, favorBonus: 11, color: '#7E57C2', glowColor: '#B39DDB' },
  { id: 27, name: 'Crystal Lantern', nameZh: '水晶灯', description: 'A prism-like lantern that splits light into rainbows.',
    rarity: 'epic', moonlightCost: 58, energyBonus: 34, favorBonus: 17, color: '#E0E0E0', glowColor: '#F5F5F5' },
  { id: 28, name: 'Rainbow Lantern', nameZh: '彩虹灯', description: 'Cycles through all colors of the spectrum.',
    rarity: 'epic', moonlightCost: 70, energyBonus: 40, favorBonus: 22, color: '#FF5722', glowColor: '#FF8A65' },
  { id: 29, name: 'Celestial Lantern', nameZh: '天灯', description: 'A sky lantern blessed by the gods themselves.',
    rarity: 'legendary', moonlightCost: 120, energyBonus: 70, favorBonus: 35, color: '#FFD700', glowColor: '#FFF9C4' },
];

// ============================================================
// Stall Definitions (25 stalls, upgradeable to level 10)
// ============================================================

const SL_STALL_DEFINITIONS: StallDefinition[] = [
  { id: 0, name: 'Fortune Teller', nameZh: '算命摊', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 20, energyPerLevel: 2, moonlightPerLevel: 3, lanternPointsPerLevel: 1,
    description: 'A mysterious fortune teller who reads palms and bamboo sticks.', specialEffect: 'daily_fortune' },
  { id: 1, name: 'Calligraphy Booth', nameZh: '书法摊', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 15, energyPerLevel: 1, moonlightPerLevel: 2, lanternPointsPerLevel: 2,
    description: 'A master calligrapher creating beautiful spirit inscriptions.', specialEffect: 'spirit_charms' },
  { id: 2, name: 'Mooncake Stand', nameZh: '月饼摊', districtId: 1, maxLevel: 10,
    baseUpgradeCost: 18, energyPerLevel: 3, moonlightPerLevel: 1, lanternPointsPerLevel: 1,
    description: 'Selling traditional mooncakes with spirit-infused fillings.', specialEffect: 'energy_boost' },
  { id: 3, name: 'Spirit Tea House', nameZh: '灵茶馆', districtId: 3, maxLevel: 10,
    baseUpgradeCost: 25, energyPerLevel: 2, moonlightPerLevel: 4, lanternPointsPerLevel: 1,
    description: 'A serene tea house serving brews that connect the living and dead.', specialEffect: 'favor_boost' },
  { id: 4, name: 'Incense Shop', nameZh: '香烛店', districtId: 6, maxLevel: 10,
    baseUpgradeCost: 22, energyPerLevel: 1, moonlightPerLevel: 2, lanternPointsPerLevel: 2,
    description: 'Premium incense and candles for ancestor worship.', specialEffect: 'ancestral_favor' },
  { id: 5, name: 'Lantern Workshop', nameZh: '灯笼作坊', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 30, energyPerLevel: 2, moonlightPerLevel: 1, lanternPointsPerLevel: 3,
    description: 'Master craftsmen creating magnificent festival lanterns.', specialEffect: 'lantern_discount' },
  { id: 6, name: 'Puppet Theater', nameZh: '木偶戏台', districtId: 5, maxLevel: 10,
    baseUpgradeCost: 20, energyPerLevel: 1, moonlightPerLevel: 3, lanternPointsPerLevel: 2,
    description: 'Shadow puppet performances retelling ancient spirit tales.', specialEffect: 'entertainment' },
  { id: 7, name: 'Riddle Booth', nameZh: '灯谜摊', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 12, energyPerLevel: 2, moonlightPerLevel: 2, lanternPointsPerLevel: 2,
    description: 'Solve lantern riddles to win spirit prizes.', specialEffect: 'knowledge_boost' },
  { id: 8, name: 'Spirit Communication', nameZh: '通灵台', districtId: 2, maxLevel: 10,
    baseUpgradeCost: 35, energyPerLevel: 3, moonlightPerLevel: 5, lanternPointsPerLevel: 2,
    description: 'A medium offering communication with departed loved ones.', specialEffect: 'spirit_contact' },
  { id: 9, name: 'Paper Offering Shop', nameZh: '纸扎店', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 16, energyPerLevel: 1, moonlightPerLevel: 2, lanternPointsPerLevel: 2,
    description: 'Joss paper offerings and paper effigies for the spirit world.', specialEffect: 'favor_gain' },
  { id: 10, name: 'Musical Instrument Shop', nameZh: '乐器铺', districtId: 1, maxLevel: 10,
    baseUpgradeCost: 28, energyPerLevel: 2, moonlightPerLevel: 3, lanternPointsPerLevel: 2,
    description: 'Spirit instruments that produce ethereal melodies.', specialEffect: 'ability_boost' },
  { id: 11, name: 'Herbal Medicine Stall', nameZh: '草药摊', districtId: 6, maxLevel: 10,
    baseUpgradeCost: 20, energyPerLevel: 3, moonlightPerLevel: 1, lanternPointsPerLevel: 1,
    description: 'Ancient herbal remedies with spiritual healing properties.', specialEffect: 'energy_regen' },
  { id: 12, name: 'Fortune Cookie Stand', nameZh: '签饼摊', districtId: 1, maxLevel: 10,
    baseUpgradeCost: 10, energyPerLevel: 1, moonlightPerLevel: 2, lanternPointsPerLevel: 3,
    description: 'Spirit fortune cookies with prophetic messages inside.', specialEffect: 'random_reward' },
  { id: 13, name: 'Ghost Story Corner', nameZh: '鬼故事角', districtId: 5, maxLevel: 10,
    baseUpgradeCost: 14, energyPerLevel: 2, moonlightPerLevel: 3, lanternPointsPerLevel: 1,
    description: 'An elder telling spine-tingling tales of the supernatural.', specialEffect: 'moonlight_gain' },
  { id: 14, name: 'Meditation Pavilion', nameZh: '冥想亭', districtId: 5, maxLevel: 10,
    baseUpgradeCost: 24, energyPerLevel: 4, moonlightPerLevel: 2, lanternPointsPerLevel: 1,
    description: 'A quiet space for spiritual meditation and energy recovery.', specialEffect: 'energy_recovery' },
  { id: 15, name: 'Souvenir Shop', nameZh: '纪念品店', districtId: 2, maxLevel: 10,
    baseUpgradeCost: 15, energyPerLevel: 1, moonlightPerLevel: 1, lanternPointsPerLevel: 3,
    description: 'Festival souvenirs imbued with lingering spirit energy.', specialEffect: 'lantern_points' },
  { id: 16, name: 'Face Painting Booth', nameZh: '画脸摊', districtId: 6, maxLevel: 10,
    baseUpgradeCost: 12, energyPerLevel: 1, moonlightPerLevel: 2, lanternPointsPerLevel: 2,
    description: 'Traditional opera face painting for festival protection.', specialEffect: 'spirit_ward' },
  { id: 17, name: 'Sugar Painting Stand', nameZh: '糖画摊', districtId: 0, maxLevel: 10,
    baseUpgradeCost: 11, energyPerLevel: 2, moonlightPerLevel: 1, lanternPointsPerLevel: 3,
    description: 'Molten sugar art depicting zodiac animals and spirit figures.', specialEffect: 'sweetness_boost' },
  { id: 18, name: 'Shadow Puppet Shop', nameZh: '皮影铺', districtId: 5, maxLevel: 10,
    baseUpgradeCost: 26, energyPerLevel: 2, moonlightPerLevel: 3, lanternPointsPerLevel: 2,
    description: 'Handcrafted shadow puppets imbued with captured spirit essence.', specialEffect: 'ability_cooldown' },
  { id: 19, name: 'Ancestral Tablet Engraver', nameZh: '牌匾刻字', districtId: 3, maxLevel: 10,
    baseUpgradeCost: 32, energyPerLevel: 2, moonlightPerLevel: 4, lanternPointsPerLevel: 2,
    description: 'Engraves ancestral tablets with spirit-binding calligraphy.', specialEffect: 'ancestral_power' },
  { id: 20, name: 'Spirit Food Stall', nameZh: '灵食摊', districtId: 2, maxLevel: 10,
    baseUpgradeCost: 16, energyPerLevel: 3, moonlightPerLevel: 2, lanternPointsPerLevel: 1,
    description: 'Food offerings that spirits can consume during the festival.', specialEffect: 'spirit_satisfaction' },
  { id: 21, name: 'Moon Wine Tavern', nameZh: '月酒坊', districtId: 4, maxLevel: 10,
    baseUpgradeCost: 22, energyPerLevel: 3, moonlightPerLevel: 3, lanternPointsPerLevel: 2,
    description: 'Wine brewed from moonlight, favored by celestial spirits.', specialEffect: 'moonlight_boost' },
  { id: 22, name: 'Jade Carving Studio', nameZh: '玉雕坊', districtId: 6, maxLevel: 10,
    baseUpgradeCost: 40, energyPerLevel: 2, moonlightPerLevel: 4, lanternPointsPerLevel: 3,
    description: 'Master jade carvers creating spirit-infused amulets.', specialEffect: 'protection' },
  { id: 23, name: 'Talisman Workshop', nameZh: '符箓作坊', districtId: 3, maxLevel: 10,
    baseUpgradeCost: 38, energyPerLevel: 2, moonlightPerLevel: 5, lanternPointsPerLevel: 2,
    description: 'Paper talismans inscribed with powerful spirit-binding incantations.', specialEffect: 'spirit_binding' },
  { id: 24, name: 'Celestial Map Dealer', nameZh: '星图摊', districtId: 7, maxLevel: 10,
    baseUpgradeCost: 50, energyPerLevel: 3, moonlightPerLevel: 6, lanternPointsPerLevel: 4,
    description: 'Star maps showing the paths between mortal and celestial realms.', specialEffect: 'celestial_guidance' },
];

// ============================================================
// Ability Definitions (22 abilities)
// ============================================================

const SL_ABILITY_DEFINITIONS: AbilityDefinition[] = [
  { id: 1, name: 'Lantern Blessing', nameZh: '灯祝福', spiritRarityRequired: 'common',
    description: 'Bless a lantern to increase its glow and spirit attraction.',
    energyCost: 15, cooldown: 0, moonlightGain: 10, favorGain: 3, lanternPointsGain: 5,
    effectType: 'lantern_boost', effectPower: 20 },
  { id: 2, name: 'Spirit Communication', nameZh: '通灵术', spiritRarityRequired: 'uncommon',
    description: 'Temporarily bridge the gap between living and spirit worlds.',
    energyCost: 20, cooldown: 1, moonlightGain: 15, favorGain: 5, lanternPointsGain: 8,
    effectType: 'spirit_bridge', effectPower: 30 },
  { id: 3, name: 'Ancestral Guidance', nameZh: '先祖指引', spiritRarityRequired: 'legendary',
    description: 'Channel the wisdom of ancestors to reveal hidden spirits.',
    energyCost: 40, cooldown: 2, moonlightGain: 50, favorGain: 25, lanternPointsGain: 30,
    effectType: 'reveal_spirits', effectPower: 100 },
  { id: 4, name: 'Ghost Fire Dance', nameZh: '鬼火舞', spiritRarityRequired: 'rare',
    description: 'Perform an ethereal dance surrounded by ghostly flames.',
    energyCost: 30, cooldown: 1, moonlightGain: 25, favorGain: 10, lanternPointsGain: 15,
    effectType: 'entertainment', effectPower: 50 },
  { id: 5, name: 'Moonbeam Channeling', nameZh: '月光引导', spiritRarityRequired: 'uncommon',
    description: 'Channel concentrated moonlight to empower all festival lanterns.',
    energyCost: 25, cooldown: 1, moonlightGain: 40, favorGain: 8, lanternPointsGain: 20,
    effectType: 'moonlight_surge', effectPower: 60 },
  { id: 6, name: 'Incense Offering', nameZh: '上香', spiritRarityRequired: 'common',
    description: 'Offer premium incense to gain ancestral favor.',
    energyCost: 10, cooldown: 0, moonlightGain: 5, favorGain: 8, lanternPointsGain: 3,
    effectType: 'favor_gain', effectPower: 15 },
  { id: 7, name: 'River Crossing', nameZh: '渡河', spiritRarityRequired: 'rare',
    description: 'Guide lost spirits across the river to the afterlife.',
    energyCost: 35, cooldown: 2, moonlightGain: 30, favorGain: 15, lanternPointsGain: 18,
    effectType: 'spirit_release', effectPower: 45 },
  { id: 8, name: 'Shadow Walk', nameZh: '影步', spiritRarityRequired: 'epic',
    description: 'Phase through shadows to move instantly between districts.',
    energyCost: 45, cooldown: 3, moonlightGain: 20, favorGain: 10, lanternPointsGain: 12,
    effectType: 'teleport', effectPower: 70 },
  { id: 9, name: 'Fortune Reading', nameZh: '卜卦', spiritRarityRequired: 'uncommon',
    description: 'Cast spirit sticks to divine future festival events.',
    energyCost: 18, cooldown: 1, moonlightGain: 12, favorGain: 6, lanternPointsGain: 10,
    effectType: 'prediction', effectPower: 25 },
  { id: 10, name: 'Spirit Summoning', nameZh: '召灵', spiritRarityRequired: 'epic',
    description: 'Summon a random undiscovered spirit to your location.',
    energyCost: 55, cooldown: 3, moonlightGain: 15, favorGain: 12, lanternPointsGain: 20,
    effectType: 'summon', effectPower: 80 },
  { id: 11, name: 'Celestial Connection', nameZh: '天界连接', spiritRarityRequired: 'rare',
    description: 'Briefly connect with the celestial realm for powerful blessings.',
    energyCost: 50, cooldown: 2, moonlightGain: 60, favorGain: 20, lanternPointsGain: 25,
    effectType: 'celestial_blessing', effectPower: 90 },
  { id: 12, name: 'Festival Dance', nameZh: '节庆舞', spiritRarityRequired: 'epic',
    description: 'Perform a traditional festival dance that delights all spirits.',
    energyCost: 40, cooldown: 2, moonlightGain: 35, favorGain: 18, lanternPointsGain: 22,
    effectType: 'festival_boost', effectPower: 65 },
  { id: 13, name: 'Ancestor Calling', nameZh: '唤祖', spiritRarityRequired: 'rare',
    description: 'Call upon a specific ancestor for their unique blessing.',
    energyCost: 30, cooldown: 1, moonlightGain: 20, favorGain: 20, lanternPointsGain: 15,
    effectType: 'ancestor_blessing', effectPower: 55 },
  { id: 14, name: 'Ghost Purification', nameZh: '净灵', spiritRarityRequired: 'epic',
    description: 'Purify malevolent spirits, converting them into friendly ones.',
    energyCost: 60, cooldown: 3, moonlightGain: 25, favorGain: 15, lanternPointsGain: 30,
    effectType: 'purify', effectPower: 85 },
  { id: 15, name: "Moon Rabbit's Blessing", nameZh: '月兔祝福', spiritRarityRequired: 'uncommon',
    description: 'Receive a blessing from the Moon Rabbit for abundant rewards.',
    energyCost: 22, cooldown: 1, moonlightGain: 35, favorGain: 10, lanternPointsGain: 15,
    effectType: 'abundance', effectPower: 40 },
  { id: 16, name: "Dragon's Roar", nameZh: '龙啸', spiritRarityRequired: 'legendary',
    description: 'Unleash a dragon\'s roar that echoes across all districts.',
    energyCost: 80, cooldown: 5, moonlightGain: 100, favorGain: 40, lanternPointsGain: 50,
    effectType: 'district_boost', effectPower: 150 },
  { id: 17, name: 'Phoenix Rebirth', nameZh: '凤凰涅槃', spiritRarityRequired: 'legendary',
    description: 'Channel the phoenix\'s power to fully restore energy and gain bonus.',
    energyCost: 90, cooldown: 5, moonlightGain: 80, favorGain: 35, lanternPointsGain: 45,
    effectType: 'full_restore', effectPower: 200 },
  { id: 18, name: 'Thousand-Year Wisdom', nameZh: '千年智慧', spiritRarityRequired: 'epic',
    description: 'Tap into ancient knowledge to boost all festival activities.',
    energyCost: 50, cooldown: 2, moonlightGain: 40, favorGain: 25, lanternPointsGain: 35,
    effectType: 'all_boost', effectPower: 75 },
  { id: 19, name: 'Spirit Shield', nameZh: '灵盾', spiritRarityRequired: 'legendary',
    description: 'Create a protective barrier that shields against negative events.',
    energyCost: 70, cooldown: 4, moonlightGain: 30, favorGain: 20, lanternPointsGain: 25,
    effectType: 'protection', effectPower: 120 },
  { id: 20, name: 'Celestial Flight', nameZh: '天飞', spiritRarityRequired: 'epic',
    description: 'Take flight to the celestial realm and return with treasures.',
    energyCost: 65, cooldown: 4, moonlightGain: 70, favorGain: 30, lanternPointsGain: 40,
    effectType: 'celestial_reward', effectPower: 100 },
  { id: 21, name: 'Ancestral Wrath', nameZh: '先祖之怒', spiritRarityRequired: 'rare',
    description: 'Channel ancestral fury to ward off evil spirits en masse.',
    energyCost: 35, cooldown: 2, moonlightGain: 15, favorGain: 30, lanternPointsGain: 20,
    effectType: 'mass_ward', effectPower: 60 },
  { id: 22, name: "Spirit Emperor's Decree", nameZh: '灵帝诏令', spiritRarityRequired: 'legendary',
    description: 'Issue a decree from the Spirit Emperor for supreme festival power.',
    energyCost: 100, cooldown: 7, moonlightGain: 150, favorGain: 50, lanternPointsGain: 80,
    effectType: 'supreme_power', effectPower: 300 },
];

// ============================================================
// Achievement Definitions (18 achievements)
// ============================================================

const SL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: 1, name: 'First Light', nameZh: '初灯',
    description: 'Light your very first festival lantern.', icon: 'lantern_1',
    category: 'lanterns', condition: 'lanterns_lit >= 1', rewardLanternPoints: 20, rewardMoonlight: 30 },
  { id: 2, name: 'Spirit Friend', nameZh: '灵友',
    description: 'Befriend your first spirit companion.', icon: 'spirit_1',
    category: 'spirits', condition: 'spirits_befriended >= 1', rewardLanternPoints: 30, rewardMoonlight: 40 },
  { id: 3, name: 'Lantern Collector', nameZh: '灯匠',
    description: 'Collect 10 different types of lanterns.', icon: 'lantern_10',
    category: 'lanterns', condition: 'lanterns_collected >= 10', rewardLanternPoints: 50, rewardMoonlight: 60 },
  { id: 4, name: 'District Explorer', nameZh: '游历者',
    description: 'Visit every festival district at least once.', icon: 'districts',
    category: 'exploration', condition: 'districts_visited >= 8', rewardLanternPoints: 80, rewardMoonlight: 100 },
  { id: 5, name: 'Market Master', nameZh: '市集达人',
    description: 'Upgrade all stalls to at least level 3.', icon: 'stalls_3',
    category: 'economy', condition: 'all_stalls_level_3', rewardLanternPoints: 100, rewardMoonlight: 120 },
  { id: 6, name: 'Festival Veteran', nameZh: '节庆老兵',
    description: 'Participate in the festival for 7 days.', icon: 'day_7',
    category: 'progression', condition: 'festival_day >= 7', rewardLanternPoints: 60, rewardMoonlight: 80 },
  { id: 7, name: 'Ancestral Devotee', nameZh: '孝道之心',
    description: 'Visit the Ancestor Shrine 10 times.', icon: 'shrine_10',
    category: 'rituals', condition: 'ancestor_visits >= 10', rewardLanternPoints: 70, rewardMoonlight: 90 },
  { id: 8, name: 'Moonlight Gatherer', nameZh: '月光收集者',
    description: 'Accumulate a total of 500 moonlight.', icon: 'moonlight_500',
    category: 'resources', condition: 'total_moonlight >= 500', rewardLanternPoints: 55, rewardMoonlight: 75 },
  { id: 9, name: 'Spirit Whisperer', nameZh: '通灵师',
    description: 'Befriend 15 different spirit types.', icon: 'spirit_15',
    category: 'spirits', condition: 'spirits_befriended >= 15', rewardLanternPoints: 120, rewardMoonlight: 150 },
  { id: 10, name: 'Lantern Artisan', nameZh: '灯笼大师',
    description: 'Collect all 30 types of lanterns.', icon: 'lanterns_all',
    category: 'lanterns', condition: 'lanterns_collected >= 30', rewardLanternPoints: 200, rewardMoonlight: 250 },
  { id: 11, name: 'Ritual Master', nameZh: '仪式宗师',
    description: 'Complete 50 daily rituals.', icon: 'rituals_50',
    category: 'rituals', condition: 'rituals_completed >= 50', rewardLanternPoints: 150, rewardMoonlight: 180 },
  { id: 12, name: 'Sky Lantern Festival', nameZh: '天灯节',
    description: 'Release 100 sky lanterns into the night.', icon: 'sky_100',
    category: 'lanterns', condition: 'sky_lanterns >= 100', rewardLanternPoints: 130, rewardMoonlight: 160 },
  { id: 13, name: 'Ghost Theater Regular', nameZh: '鬼戏常客',
    description: 'Visit the Ghost Theater 20 times.', icon: 'theater_20',
    category: 'exploration', condition: 'theater_visits >= 20', rewardLanternPoints: 90, rewardMoonlight: 110 },
  { id: 14, name: 'Celestial Connection', nameZh: '通天之路',
    description: 'Unlock the Celestial Pavilion district.', icon: 'celestial',
    category: 'exploration', condition: 'celestial_unlocked', rewardLanternPoints: 160, rewardMoonlight: 200 },
  { id: 15, name: 'Spirit Emperor', nameZh: '灵帝',
    description: 'Achieve the highest festival title.', icon: 'emperor',
    category: 'progression', condition: 'title_max', rewardLanternPoints: 300, rewardMoonlight: 500 },
  { id: 16, name: 'Incense Master', nameZh: '香道大师',
    description: 'Offer incense 1,000 times total.', icon: 'incense_1k',
    category: 'rituals', condition: 'incense_total >= 1000', rewardLanternPoints: 180, rewardMoonlight: 220 },
  { id: 17, name: 'Jade Collector', nameZh: '玉器收藏家',
    description: 'Collect all jade-themed lanterns and stall items.', icon: 'jade',
    category: 'collection', condition: 'jade_collected', rewardLanternPoints: 140, rewardMoonlight: 170 },
  { id: 18, name: 'Legendary Befriender', nameZh: '传说之友',
    description: 'Befriend all 7 legendary spirits.', icon: 'legendary_all',
    category: 'spirits', condition: 'legendary_befriended >= 7', rewardLanternPoints: 500, rewardMoonlight: 500 },
];

// ============================================================
// Title Definitions (8 titles)
// ============================================================

const SL_TITLE_DEFINITIONS: TitleDefinition[] = [
  { id: 0, nameMale: 'Lantern Bearer', nameFemale: 'Lantern Bearer',
    nameZh: '提灯人', requiredSpiritsBefriended: 0, requiredLanterns: 0,
    requiredFestivalDay: 1, requiredAncestralFavor: 0, color: SL_COLOR_ORANGE },
  { id: 1, nameMale: 'Spirit Walker', nameFemale: 'Spirit Walker',
    nameZh: '灵行者', requiredSpiritsBefriended: 3, requiredLanterns: 5,
    requiredFestivalDay: 3, requiredAncestralFavor: 10, color: '#80DEEA' },
  { id: 2, nameMale: 'Festival Guest', nameFemale: 'Festival Guest',
    nameZh: '节庆宾客', requiredSpiritsBefriended: 7, requiredLanterns: 10,
    requiredFestivalDay: 5, requiredAncestralFavor: 25, color: SL_COLOR_JADE_GREEN },
  { id: 3, nameMale: 'Ghost Whisperer', nameFemale: 'Ghost Whisperer',
    nameZh: '通灵者', requiredSpiritsBefriended: 14, requiredLanterns: 18,
    requiredFestivalDay: 10, requiredAncestralFavor: 60, color: '#CE93D8' },
  { id: 4, nameMale: 'Moon Dancer', nameFemale: 'Moon Dancer',
    nameZh: '月舞者', requiredSpiritsBefriended: 20, requiredLanterns: 22,
    requiredFestivalDay: 15, requiredAncestralFavor: 100, color: '#E1BEE7' },
  { id: 5, nameMale: 'Ancestral Guardian', nameFemale: 'Ancestral Guardian',
    nameZh: '先祖守护者', requiredSpiritsBefriended: 25, requiredLanterns: 25,
    requiredFestivalDay: 20, requiredAncestralFavor: 200, color: SL_COLOR_GOLD },
  { id: 6, nameMale: 'Spirit Lord', nameFemale: 'Spirit Lady',
    nameZh: '灵主', requiredSpiritsBefriended: 30, requiredLanterns: 28,
    requiredFestivalDay: 25, requiredAncestralFavor: 350, color: SL_COLOR_RED },
  { id: 7, nameMale: 'Spirit Emperor', nameFemale: 'Spirit Empress',
    nameZh: '灵帝', requiredSpiritsBefriended: 35, requiredLanterns: 30,
    requiredFestivalDay: 30, requiredAncestralFavor: 500, color: '#FFD700' },
];

// ============================================================
// Ritual Definitions (8 ritual types)
// ============================================================

const SL_RITUAL_DEFINITIONS: RitualDefinition[] = [
  { type: 'incense_offering', name: 'Incense Offering', nameZh: '上香仪式',
    description: 'Burn premium incense to honor the ancestors and gain their favor.',
    baseEnergyCost: 15, baseMoonlightReward: 20, baseLanternPointsReward: 10,
    baseFavorReward: 8, baseEnergyReward: 10, stepsRequired: 3 },
  { type: 'lantern_lighting', name: 'Lantern Lighting Ceremony', nameZh: '点灯仪式',
    description: 'A solemn ceremony to light lanterns for wandering spirits.',
    baseEnergyCost: 20, baseMoonlightReward: 15, baseLanternPointsReward: 15,
    baseFavorReward: 6, baseEnergyReward: 8, stepsRequired: 4 },
  { type: 'spirit_summoning', name: 'Spirit Summoning Ritual', nameZh: '召灵仪式',
    description: 'Draw a summoning circle to attract nearby spirits.',
    baseEnergyCost: 30, baseMoonlightReward: 25, baseLanternPointsReward: 20,
    baseFavorReward: 10, baseEnergyReward: 5, stepsRequired: 5 },
  { type: 'ancestor_prayer', name: 'Ancestor Prayer', nameZh: '祭祖祈祷',
    description: 'Offer prayers and food to honor your lineage of ancestors.',
    baseEnergyCost: 18, baseMoonlightReward: 10, baseLanternPointsReward: 8,
    baseFavorReward: 15, baseEnergyReward: 12, stepsRequired: 3 },
  { type: 'moonlight_meditation', name: 'Moonlight Meditation', nameZh: '月光冥想',
    description: 'Meditate under the moon to absorb spiritual energy.',
    baseEnergyCost: 10, baseMoonlightReward: 40, baseLanternPointsReward: 5,
    baseFavorReward: 4, baseEnergyReward: 25, stepsRequired: 2 },
  { type: 'ghost_fire_dance', name: 'Ghost Fire Dance', nameZh: '鬼火舞仪',
    description: 'Dance among the ghost fires to earn great spirit favor.',
    baseEnergyCost: 25, baseMoonlightReward: 18, baseLanternPointsReward: 12,
    baseFavorReward: 12, baseEnergyReward: 5, stepsRequired: 4 },
  { type: 'river_release', name: 'River Lantern Release', nameZh: '放河灯',
    description: 'Release lanterns onto the spirit river for the departed.',
    baseEnergyCost: 22, baseMoonlightReward: 15, baseLanternPointsReward: 25,
    baseFavorReward: 10, baseEnergyReward: 8, stepsRequired: 3 },
  { type: 'celestial_connection', name: 'Celestial Connection', nameZh: '通天仪式',
    description: 'Perform the ultimate ritual to connect with the heavens.',
    baseEnergyCost: 50, baseMoonlightReward: 60, baseLanternPointsReward: 40,
    baseFavorReward: 25, baseEnergyReward: 30, stepsRequired: 6 },
];

// ============================================================
// Helper Functions (module-level, NOT exported)
// ============================================================

function slRarityOrder(rarity: SpiritRarity): number {
  switch (rarity) {
    case 'common': return 0;
    case 'uncommon': return 1;
    case 'rare': return 2;
    case 'epic': return 3;
    case 'legendary': return 4;
    default: return 0;
  }
}

function slRarityColor(rarity: SpiritRarity): string {
  switch (rarity) {
    case 'common': return '#B0BEC5';
    case 'uncommon': return SL_COLOR_JADE_GREEN;
    case 'rare': return '#42A5F5';
    case 'epic': return '#AB47BC';
    case 'legendary': return SL_COLOR_GOLD;
    default: return '#B0BEC5';
  }
}

function slUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * (1 + currentLevel * 0.5));
}

function slRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function slRandomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================
// Main Hook: useSpiritLantern
// ============================================================

export default function useSpiritLantern() {
  // ---- State Declarations ----
  const [spirits, setSpirits] = useState<Spirit[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [stalls, setStalls] = useState<Stall[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentDistrict, setCurrentDistrict] = useState<number>(0);
  const [spiritEnergy, setSpiritEnergy] = useState<number>(100);
  const [moonlight, setMoonlight] = useState<number>(50);
  const [lanternPoints, setLanternPoints] = useState<number>(0);
  const [ancestralFavor, setAncestralFavor] = useState<number>(0);
  const [spiritsBefriended, setSpiritsBefriended] = useState<number>(0);
  const [titleIndex, setTitleIndex] = useState<number>(0);
  const [festivalDay, setFestivalDay] = useState<number>(1);
  const [dailyRitual, setDailyRitual] = useState<DailyRitual | null>(null);

  // ---- Tracking State ----
  const [totalSpiritsBefriended, setTotalSpiritsBefriended] = useState<number>(0);
  const [totalLanternsLit, setTotalLanternsLit] = useState<number>(0);
  const [totalStallUpgrades, setTotalStallUpgrades] = useState<number>(0);
  const [totalAbilitiesUsed, setTotalAbilitiesUsed] = useState<number>(0);
  const [totalRitualsCompleted, setTotalRitualsCompleted] = useState<number>(0);
  const [totalSkyLanternsReleased, setTotalSkyLanternsReleased] = useState<number>(0);
  const [totalAncestorVisits, setTotalAncestorVisits] = useState<number>(0);
  const [totalIncenseOffered, setTotalIncenseOffered] = useState<number>(0);
  const [totalMoonlightCollected, setTotalMoonlightCollected] = useState<number>(0);
  const [totalDistrictsVisited, setTotalDistrictsVisited] = useState<number>(0);
  const [theaterVisitCount, setTheaterVisitCount] = useState<number>(0);

  // ---- Refs ----
  const stateRef = useRef<{ spirits: Spirit[]; lanterns: Lantern[]; stalls: Stall[];
    abilities: Ability[]; achievements: Achievement[]; districts: District[];
    currentDistrict: number; spiritEnergy: number; moonlight: number;
    lanternPoints: number; ancestralFavor: number; spiritsBefriended: number;
    titleIndex: number; festivalDay: number; dailyRitual: DailyRitual | null;
    totalSpiritsBefriended: number; totalLanternsLit: number;
    totalStallUpgrades: number; totalAbilitiesUsed: number;
    totalRitualsCompleted: number; totalSkyLanternsReleased: number;
    totalAncestorVisits: number; totalIncenseOffered: number;
    totalMoonlightCollected: number; totalDistrictsVisited: number;
    theaterVisitCount: number;
  } | null>(null);

  const initializedRef = useRef(false);

  // ---- Sync state to ref ----
  useEffect(() => {
    stateRef.current = {
      spirits, lanterns, stalls, abilities, achievements, districts,
      currentDistrict, spiritEnergy, moonlight, lanternPoints, ancestralFavor,
      spiritsBefriended, titleIndex, festivalDay, dailyRitual,
      totalSpiritsBefriended, totalLanternsLit, totalStallUpgrades,
      totalAbilitiesUsed, totalRitualsCompleted, totalSkyLanternsReleased,
      totalAncestorVisits, totalIncenseOffered, totalMoonlightCollected,
      totalDistrictsVisited, theaterVisitCount,
    };
  }, [spirits, lanterns, stalls, abilities, achievements, districts,
    currentDistrict, spiritEnergy, moonlight, lanternPoints, ancestralFavor,
    spiritsBefriended, titleIndex, festivalDay, dailyRitual,
    totalSpiritsBefriended, totalLanternsLit, totalStallUpgrades,
    totalAbilitiesUsed, totalRitualsCompleted, totalSkyLanternsReleased,
    totalAncestorVisits, totalIncenseOffered, totalMoonlightCollected,
    totalDistrictsVisited, theaterVisitCount]);

  // ---- Initialization Effect ----
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initSpirits: Spirit[] = SL_SPIRIT_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      discovered: false,
      befriended: false,
      friendshipLevel: 0,
      maxFriendship: SL_MAX_FRIENDSHIP,
      encounters: 0,
      lastEncounterDay: 0,
    }));

    const initDistricts: District[] = SL_DISTRICT_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      unlocked: def.unlockCost === 0,
      visits: 0,
      currentActivity: null,
      prosperityLevel: 0,
    }));

    const initLanterns: Lantern[] = SL_LANTERN_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      collected: false,
      lit: false,
      count: 0,
      timesLit: 0,
    }));

    const initStalls: Stall[] = SL_STALL_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      level: 1,
      totalUpgrades: 0,
      lastUpgradeDay: 1,
    }));

    const initAbilities: Ability[] = SL_ABILITY_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      unlocked: false,
      timesUsed: 0,
      lastUsedDay: 0,
      cooldownRemaining: 0,
    }));

    const initAchievements: Achievement[] = SL_ACHIEVEMENT_DEFINITIONS.map((def) => ({
      id: def.id,
      definition: def,
      unlocked: false,
      unlockedDay: 0,
    }));

    setSpirits(initSpirits);
    setDistricts(initDistricts);
    setLanterns(initLanterns);
    setStalls(initStalls);
    setAbilities(initAbilities);
    setAchievements(initAchievements);
  }, []);

  // ---- Generate Daily Ritual Effect ----
  useEffect(() => {
    if (!initializedRef.current) return;
    const def = slRandomPick(SL_RITUAL_DEFINITIONS);
    const dayMultiplier = 1 + (festivalDay * 0.1);
    const ritual: DailyRitual = {
      type: def.type,
      name: def.name,
      nameZh: def.nameZh,
      description: def.description,
      energyCost: Math.floor(def.baseEnergyCost * dayMultiplier),
      moonlightReward: Math.floor(def.baseMoonlightReward * dayMultiplier),
      lanternPointsReward: Math.floor(def.baseLanternPointsReward * dayMultiplier),
      favorReward: Math.floor(def.baseFavorReward * dayMultiplier),
      energyReward: Math.floor(def.baseEnergyReward * dayMultiplier),
      day: festivalDay,
      completed: false,
      stepsRequired: def.stepsRequired,
      stepsCompleted: 0,
    };
    setDailyRitual(ritual);
  }, [festivalDay]);

  // ---- Ability Unlock Effect ----
  useEffect(() => {
    const befriendedRarities = new Set<SpiritRarity>();
    spirits.forEach((s) => {
      if (s.befriended) {
        befriendedRarities.add(s.definition.rarity);
      }
    });

    setAbilities((prev) =>
      prev.map((ab) => {
        const required = ab.definition.spiritRarityRequired;
        const shouldUnlock = befriendedRarities.has(required);
        if (shouldUnlock && !ab.unlocked) {
          return { ...ab, unlocked: true };
        }
        return ab;
      })
    );
  }, [spirits]);

  // ---- Title Check Effect ----
  useEffect(() => {
    const befriendedCount = spirits.filter((s) => s.befriended).length;
    const collectedCount = lanterns.filter((l) => l.collected).length;
    const maxIndex = SL_TITLE_DEFINITIONS.findIndex(
      (t) =>
        befriendedCount >= t.requiredSpiritsBefriended &&
        collectedCount >= t.requiredLanterns &&
        festivalDay >= t.requiredFestivalDay &&
        ancestralFavor >= t.requiredAncestralFavor
    );
    if (maxIndex >= 0) {
      setTitleIndex(maxIndex);
    }
  }, [spirits, lanterns, festivalDay, ancestralFavor]);

  // ---- Energy Regen Effect ----
  useEffect(() => {
    if (!initializedRef.current) return;
    const timer = setInterval(() => {
      setSpiritEnergy((prev) => Math.min(SL_MAX_ENERGY, prev + 1));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // ============================================================
  // Computed Values (useMemo)
  // ============================================================

  const discoveredSpirits = useMemo((): Spirit[] => {
    return spirits.filter((s) => s.discovered);
  }, [spirits]);

  const befriendedSpirits = useMemo((): Spirit[] => {
    return spirits.filter((s) => s.befriended);
  }, [spirits]);

  const undiscoveredSpirits = useMemo((): Spirit[] => {
    return spirits.filter((s) => !s.discovered);
  }, [spirits]);

  const collectedLanterns = useMemo((): Lantern[] => {
    return lanterns.filter((l) => l.collected);
  }, [lanterns]);

  const litLanterns = useMemo((): Lantern[] => {
    return lanterns.filter((l) => l.lit);
  }, [lanterns]);

  const unlockedDistricts = useMemo((): District[] => {
    return districts.filter((d) => d.unlocked);
  }, [districts]);

  const unlockedAbilities = useMemo((): Ability[] => {
    return abilities.filter((a) => a.unlocked);
  }, [abilities]);

  const completedAchievements = useMemo((): Achievement[] => {
    return achievements.filter((a) => a.unlocked);
  }, [achievements]);

  const activeTitle = useMemo((): TitleDefinition => {
    return SL_TITLE_DEFINITIONS[titleIndex];
  }, [titleIndex]);

  const energyPercentage = useMemo((): number => {
    return (spiritEnergy / SL_MAX_ENERGY) * 100;
  }, [spiritEnergy]);

  const moonlightPercentage = useMemo((): number => {
    return (moonlight / SL_MAX_MOONLIGHT) * 100;
  }, [moonlight]);

  const currentDistrictData = useMemo((): District | null => {
    return districts.find((d) => d.id === currentDistrict) ?? null;
  }, [districts, currentDistrict]);

  const availableSpiritsInDistrict = useMemo((): Spirit[] => {
    if (!currentDistrictData) return [];
    return spirits.filter((s) =>
      currentDistrictData.definition.spiritIds.includes(s.id)
    );
  }, [currentDistrictData, spirits]);

  const availableLanternsInDistrict = useMemo((): Lantern[] => {
    if (!currentDistrictData) return [];
    return lanterns.filter((l) =>
      currentDistrictData.definition.lanternIds.includes(l.id)
    );
  }, [currentDistrictData, lanterns]);

  const availableStallsInDistrict = useMemo((): Stall[] => {
    if (!currentDistrictData) return [];
    return stalls.filter((s) =>
      currentDistrictData.definition.stallIds.includes(s.id)
    );
  }, [currentDistrictData, stalls]);

  const spiritRarityCounts = useMemo((): Record<SpiritRarity, { total: number; befriended: number }> => {
    const counts: Record<SpiritRarity, { total: number; befriended: number }> = {
      common: { total: 0, befriended: 0 },
      uncommon: { total: 0, befriended: 0 },
      rare: { total: 0, befriended: 0 },
      epic: { total: 0, befriended: 0 },
      legendary: { total: 0, befriended: 0 },
    };
    spirits.forEach((s) => {
      counts[s.definition.rarity].total++;
      if (s.befriended) {
        counts[s.definition.rarity].befriended++;
      }
    });
    return counts;
  }, [spirits]);

  const overallFestivalScore = useMemo((): number => {
    const spiritScore = (spiritsBefriended / SL_SPIRIT_COUNT) * 30;
    const lanternScore = (collectedLanterns.length / SL_LANTERN_COUNT) * 20;
    const districtScore = (unlockedDistricts.length / SL_DISTRICT_COUNT) * 15;
    const achievementScore = (completedAchievements.length / SL_ACHIEVEMENT_COUNT) * 15;
    const stallScore = (stalls.reduce((sum, s) => sum + s.level, 0) / (SL_STALL_COUNT * 10)) * 10;
    const abilityScore = (unlockedAbilities.length / SL_ABILITY_COUNT) * 10;
    return Math.floor(spiritScore + lanternScore + districtScore + achievementScore + stallScore + abilityScore);
  }, [spiritsBefriended, collectedLanterns, unlockedDistricts, completedAchievements, stalls, unlockedAbilities]);

  // ============================================================
  // Action Functions (useCallback)
  // ============================================================

  const befriendSpirit = useCallback((spiritId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const spirit = st.spirits.find((s) => s.id === spiritId);
    if (!spirit || !spirit.discovered || spirit.befriended) return false;
    if (st.spiritEnergy < spirit.definition.energyCost) return false;

    setSpiritEnergy((prev) => prev - spirit.definition.energyCost);
    setSpirits((prev) =>
      prev.map((s) =>
        s.id === spiritId
          ? { ...s, befriended: true, friendshipLevel: 10, encounters: s.encounters + 1 }
          : s
      )
    );
    setSpiritsBefriended((prev) => prev + 1);
    setTotalSpiritsBefriended((prev) => prev + 1);
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + spirit.definition.moonlightReward));
    setLanternPoints((prev) => prev + spirit.definition.lanternPointsReward);
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + spirit.definition.favorReward));
    return true;
  }, []);

  const discoverSpirit = useCallback((spiritId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const spirit = st.spirits.find((s) => s.id === spiritId);
    if (!spirit || spirit.discovered) return false;

    setSpirits((prev) =>
      prev.map((s) =>
        s.id === spiritId
          ? { ...s, discovered: true, encounters: s.encounters + 1, lastEncounterDay: st.festivalDay }
          : s
      )
    );
    return true;
  }, []);

  const encounterSpirit = useCallback((): Spirit | null => {
    const st = stateRef.current;
    if (!st) return null;
    const district = st.districts.find((d) => d.id === st.currentDistrict);
    if (!district || !district.unlocked) return null;

    const districtSpirits = st.spirits.filter((s) =>
      district.definition.spiritIds.includes(s.id)
    );

    const weighted: Spirit[] = [];
    districtSpirits.forEach((s) => {
      const weight = s.befriended ? 1 : s.discovered ? 3 : 5;
      for (let i = 0; i < weight; i++) {
        weighted.push(s);
      }
    });

    if (weighted.length === 0) return null;
    const chosen = slRandomPick(weighted);

    setSpirits((prev) =>
      prev.map((s) =>
        s.id === chosen.id
          ? {
              ...s,
              discovered: true,
              encounters: s.encounters + 1,
              lastEncounterDay: st.festivalDay,
              friendshipLevel: Math.min(SL_MAX_FRIENDSHIP, s.friendshipLevel + 1),
            }
          : s
      )
    );
    return chosen;
  }, []);

  const lightLantern = useCallback((lanternId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const lantern = st.lanterns.find((l) => l.id === lanternId);
    if (!lantern || !lantern.collected) return false;
    if (st.moonlight < lantern.definition.moonlightCost) return false;

    setMoonlight((prev) => prev - lantern.definition.moonlightCost);
    setSpiritEnergy((prev) =>
      Math.min(SL_MAX_ENERGY, prev + lantern.definition.energyBonus)
    );
    setAncestralFavor((prev) =>
      Math.min(SL_MAX_FAVOR, prev + lantern.definition.favorBonus)
    );
    setLanterns((prev) =>
      prev.map((l) =>
        l.id === lanternId
          ? { ...l, lit: true, timesLit: l.timesLit + 1 }
          : l
      )
    );
    setTotalLanternsLit((prev) => prev + 1);
    return true;
  }, []);

  const collectLantern = useCallback((lanternId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const lantern = st.lanterns.find((l) => l.id === lanternId);
    if (!lantern || lantern.collected) return false;
    if (st.lanternPoints < lantern.definition.moonlightCost * 2) return false;

    setLanternPoints((prev) => prev - lantern.definition.moonlightCost * 2);
    setLanterns((prev) =>
      prev.map((l) =>
        l.id === lanternId
          ? { ...l, collected: true, count: l.count + 1 }
          : l
      )
    );
    return true;
  }, []);

  const upgradeStall = useCallback((stallId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const stall = st.stalls.find((s) => s.id === stallId);
    if (!stall) return false;
    if (stall.level >= stall.definition.maxLevel) return false;

    const cost = slUpgradeCost(stall.definition.baseUpgradeCost, stall.level);
    if (st.lanternPoints < cost) return false;

    setLanternPoints((prev) => prev - cost);
    setStalls((prev) =>
      prev.map((s) =>
        s.id === stallId
          ? {
              ...s,
              level: s.level + 1,
              totalUpgrades: s.totalUpgrades + 1,
              lastUpgradeDay: st.festivalDay,
            }
          : s
      )
    );
    setTotalStallUpgrades((prev) => prev + 1);
    return true;
  }, []);

  const activateAbility = useCallback((abilityId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const ability = st.abilities.find((a) => a.id === abilityId);
    if (!ability || !ability.unlocked) return false;
    if (ability.cooldownRemaining > 0) return false;
    if (st.spiritEnergy < ability.definition.energyCost) return false;

    setSpiritEnergy((prev) => prev - ability.definition.energyCost);
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + ability.definition.moonlightGain));
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + ability.definition.favorGain));
    setLanternPoints((prev) => prev + ability.definition.lanternPointsGain);
    setAbilities((prev) =>
      prev.map((a) =>
        a.id === abilityId
          ? {
              ...a,
              timesUsed: a.timesUsed + 1,
              lastUsedDay: st.festivalDay,
              cooldownRemaining: a.definition.cooldown,
            }
          : a
      )
    );
    setTotalAbilitiesUsed((prev) => prev + 1);
    return true;
  }, []);

  const performRitual = useCallback((): boolean => {
    const st = stateRef.current;
    if (!st || !st.dailyRitual) return false;
    if (st.dailyRitual.completed) return false;
    if (st.spiritEnergy < st.dailyRitual.energyCost) return false;

    setSpiritEnergy((prev) => prev - st.dailyRitual!.energyCost);
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + st.dailyRitual!.moonlightReward));
    setLanternPoints((prev) => prev + st.dailyRitual!.lanternPointsReward);
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + st.dailyRitual!.favorReward));
    setSpiritEnergy((prev) => Math.min(SL_MAX_ENERGY, prev + st.dailyRitual!.energyReward));
    setDailyRitual((prev) =>
      prev
        ? {
            ...prev,
            stepsCompleted: prev.stepsCompleted + 1,
            completed: prev.stepsCompleted + 1 >= prev.stepsRequired,
          }
        : null
    );

    if (st.dailyRitual.stepsCompleted + 1 >= st.dailyRitual.stepsRequired) {
      setTotalRitualsCompleted((prev) => prev + 1);
    }
    return true;
  }, []);

  const releaseSkyLantern = useCallback((count: number = 1): number => {
    const st = stateRef.current;
    if (!st) return 0;
    const totalCost = SL_SKY_LANTERN_COST * count;
    const totalEnergyCost = SL_SKY_LANTERN_ENERGY_COST * count;
    if (st.lanternPoints < totalCost) return 0;
    if (st.spiritEnergy < totalEnergyCost) return 0;

    const released = Math.min(count, Math.floor(st.lanternPoints / SL_SKY_LANTERN_COST));
    if (released <= 0) return 0;

    const actualCost = SL_SKY_LANTERN_COST * released;
    const actualEnergyCost = SL_SKY_LANTERN_ENERGY_COST * released;
    setLanternPoints((prev) => prev - actualCost);
    setSpiritEnergy((prev) => prev - actualEnergyCost);
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + released * 5));
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + released * 2));
    setTotalSkyLanternsReleased((prev) => prev + released);
    return released;
  }, []);

  const visitAncestorShrine = useCallback((): number => {
    const st = stateRef.current;
    if (!st) return 0;
    if (st.spiritEnergy < SL_ANCESTOR_VISIT_COST) return 0;

    setSpiritEnergy((prev) => prev - SL_ANCESTOR_VISIT_COST);
    const favorGain = 10 + Math.floor(st.ancestralFavor * 0.1);
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + favorGain));
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + 5));
    setTotalAncestorVisits((prev) => prev + 1);
    return favorGain;
  }, []);

  const collectMoonlight = useCallback((amount: number = SL_MOONLIGHT_PER_HOUR): number => {
    const collected = Math.min(amount, SL_MAX_MOONLIGHT - moonlight);
    if (collected <= 0) return 0;

    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + collected));
    setTotalMoonlightCollected((prev) => prev + collected);
    return collected;
  }, [moonlight]);

  const offerIncense = useCallback((count: number = 1): number => {
    const st = stateRef.current;
    if (!st) return 0;
    const totalCost = SL_INCENSE_COST * count;
    const totalEnergyCost = SL_INCENSE_ENERGY_COST * count;
    if (st.lanternPoints < totalCost || st.spiritEnergy < totalEnergyCost) return 0;

    const offered = Math.min(count, Math.floor(st.lanternPoints / SL_INCENSE_COST));
    if (offered <= 0) return 0;

    const actualCost = SL_INCENSE_COST * offered;
    const actualEnergyCost = SL_INCENSE_ENERGY_COST * offered;
    setLanternPoints((prev) => prev - actualCost);
    setSpiritEnergy((prev) => prev - actualEnergyCost);
    const favorGain = offered * 5;
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + favorGain));
    setTotalIncenseOffered((prev) => prev + offered);
    return favorGain;
  }, []);

  const visitDistrict = useCallback((districtId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const district = st.districts.find((d) => d.id === districtId);
    if (!district) return false;

    if (!district.unlocked) {
      if (st.lanternPoints < district.definition.unlockCost) return false;
      setLanternPoints((prev) => prev - district.definition.unlockCost);
      setDistricts((prev) =>
        prev.map((d) => (d.id === districtId ? { ...d, unlocked: true } : d))
      );
    }

    setCurrentDistrict(districtId);
    setDistricts((prev) =>
      prev.map((d) =>
        d.id === districtId ? { ...d, visits: d.visits + 1 } : d
      )
    );

    if (districtId === 5) {
      setTheaterVisitCount((prev) => prev + 1);
    }

    if (!district.unlocked) {
      setTotalDistrictsVisited((prev) => prev + 1);
    }
    return true;
  }, []);

  const advanceFestivalDay = useCallback((): void => {
    setFestivalDay((prev) => Math.min(SL_MAX_FESTIVAL_DAY, prev + 1));
    setSpiritEnergy((prev) =>
      Math.min(SL_MAX_ENERGY, prev + SL_ENERGY_REGEN_PER_DAY)
    );

    setAbilities((prev) =>
      prev.map((a) => ({
        ...a,
        cooldownRemaining: Math.max(0, a.cooldownRemaining - 1),
      }))
    );
  }, []);

  const spendEnergy = useCallback((amount: number): boolean => {
    if (spiritEnergy < amount) return false;
    setSpiritEnergy((prev) => prev - amount);
    return true;
  }, [spiritEnergy]);

  const grantEnergy = useCallback((amount: number): void => {
    setSpiritEnergy((prev) => Math.min(SL_MAX_ENERGY, prev + amount));
  }, []);

  const grantMoonlight = useCallback((amount: number): void => {
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + amount));
    setTotalMoonlightCollected((prev) => prev + amount);
  }, []);

  const grantLanternPoints = useCallback((amount: number): void => {
    setLanternPoints((prev) => prev + amount);
  }, []);

  const grantFavor = useCallback((amount: number): void => {
    setAncestralFavor((prev) => Math.min(SL_MAX_FAVOR, prev + amount));
  }, []);

  // ============================================================
  // Achievement Checking
  // ============================================================

  const checkAchievements = useCallback((): Achievement[] => {
    const st = stateRef.current;
    if (!st) return [];
    const newlyUnlocked: Achievement[] = [];

    const conditions = new Map<string, boolean>();
    conditions.set('lanterns_lit >= 1', st.totalLanternsLit >= 1);
    conditions.set('spirits_befriended >= 1', st.totalSpiritsBefriended >= 1);
    conditions.set('lanterns_collected >= 10', st.lanterns.filter((l) => l.collected).length >= 10);
    conditions.set('districts_visited >= 8', st.districts.filter((d) => d.unlocked).length >= 8);
    conditions.set('all_stalls_level_3', st.stalls.every((s) => s.level >= 3));
    conditions.set('festival_day >= 7', st.festivalDay >= 7);
    conditions.set('ancestor_visits >= 10', st.totalAncestorVisits >= 10);
    conditions.set('total_moonlight >= 500', st.totalMoonlightCollected >= 500);
    conditions.set('spirits_befriended >= 15', st.totalSpiritsBefriended >= 15);
    conditions.set('lanterns_collected >= 30', st.lanterns.filter((l) => l.collected).length >= 30);
    conditions.set('rituals_completed >= 50', st.totalRitualsCompleted >= 50);
    conditions.set('sky_lanterns >= 100', st.totalSkyLanternsReleased >= 100);
    conditions.set('theater_visits >= 20', st.theaterVisitCount >= 20);
    conditions.set('celestial_unlocked', st.districts.find((d) => d.id === 7)?.unlocked ?? false);
    conditions.set('title_max', st.titleIndex >= SL_TITLE_COUNT - 1);
    conditions.set('incense_total >= 1000', st.totalIncenseOffered >= 1000);
    conditions.set('jade_collected', st.lanterns.some(
      (l) => l.collected && (l.definition.name.includes('Jade') || l.definition.id === 18)
    ));
    const legendaryBefriended = st.spirits.filter(
      (s) => s.befriended && s.definition.rarity === 'legendary'
    ).length;
    conditions.set('legendary_befriended >= 7', legendaryBefriended >= 7);

    setAchievements((prev) =>
      prev.map((a) => {
        if (a.unlocked) return a;
        const met = conditions.get(a.definition.condition) ?? false;
        if (met) {
          newlyUnlocked.push(a);
          setMoonlight((p) => Math.min(SL_MAX_MOONLIGHT, p + a.definition.rewardMoonlight));
          setLanternPoints((p) => p + a.definition.rewardLanternPoints);
          return { ...a, unlocked: true, unlockedDay: st.festivalDay };
        }
        return a;
      })
    );

    return newlyUnlocked;
  }, []);

  // ============================================================
  // Getter Functions
  // ============================================================

  const getTitle = useCallback((): TitleDefinition => {
    return SL_TITLE_DEFINITIONS[titleIndex];
  }, [titleIndex]);

  const getProgress = useCallback((): SpiritLanternProgress => {
    const st = stateRef.current;
    if (!st) {
      return {
        spiritsPercentage: 0,
        lanternsPercentage: 0,
        stallsPercentage: 0,
        abilitiesPercentage: 0,
        achievementsPercentage: 0,
        districtsPercentage: 0,
        overallPercentage: 0,
      };
    }

    const spiritsPct = (st.spirits.filter((s) => s.befriended).length / SL_SPIRIT_COUNT) * 100;
    const lanternsPct = (st.lanterns.filter((l) => l.collected).length / SL_LANTERN_COUNT) * 100;
    const stallsPct = (st.stalls.reduce((sum, s) => sum + s.level, 0) / (SL_STALL_COUNT * 10)) * 100;
    const abilitiesPct = (st.abilities.filter((a) => a.unlocked).length / SL_ABILITY_COUNT) * 100;
    const achievementsPct = (st.achievements.filter((a) => a.unlocked).length / SL_ACHIEVEMENT_COUNT) * 100;
    const districtsPct = (st.districts.filter((d) => d.unlocked).length / SL_DISTRICT_COUNT) * 100;

    const overallPct =
      (spiritsPct * 0.25 +
        lanternsPct * 0.2 +
        districtsPct * 0.15 +
        achievementsPct * 0.15 +
        stallsPct * 0.15 +
        abilitiesPct * 0.1);

    return {
      spiritsPercentage: Math.round(spiritsPct),
      lanternsPercentage: Math.round(lanternsPct),
      stallsPercentage: Math.round(stallsPct),
      abilitiesPercentage: Math.round(abilitiesPct),
      achievementsPercentage: Math.round(achievementsPct),
      districtsPercentage: Math.round(districtsPct),
      overallPercentage: Math.round(overallPct),
    };
  }, []);

  const getStats = useCallback((): SpiritLanternStats => {
    const st = stateRef.current;
    if (!st) {
      return {
        totalSpiritsBefriended: 0, totalLanternsLit: 0,
        totalStallUpgrades: 0, totalAbilitiesUsed: 0,
        totalRitualsCompleted: 0, totalSkyLanternsReleased: 0,
        totalAncestorVisits: 0, totalIncenseOffered: 0,
        totalMoonlightCollected: 0, totalDistrictsVisited: 0,
        totalFestivalDays: festivalDay,
      };
    }
    return {
      totalSpiritsBefriended: st.totalSpiritsBefriended,
      totalLanternsLit: st.totalLanternsLit,
      totalStallUpgrades: st.totalStallUpgrades,
      totalAbilitiesUsed: st.totalAbilitiesUsed,
      totalRitualsCompleted: st.totalRitualsCompleted,
      totalSkyLanternsReleased: st.totalSkyLanternsReleased,
      totalAncestorVisits: st.totalAncestorVisits,
      totalIncenseOffered: st.totalIncenseOffered,
      totalMoonlightCollected: st.totalMoonlightCollected,
      totalDistrictsVisited: st.totalDistrictsVisited,
      totalFestivalDays: st.festivalDay,
    };
  }, [festivalDay]);

  const getSpiritById = useCallback((id: number): Spirit | null => {
    return spirits.find((s) => s.id === id) ?? null;
  }, [spirits]);

  const getLanternById = useCallback((id: number): Lantern | null => {
    return lanterns.find((l) => l.id === id) ?? null;
  }, [lanterns]);

  const getStallById = useCallback((id: number): Stall | null => {
    return stalls.find((s) => s.id === id) ?? null;
  }, [stalls]);

  const getDistrictById = useCallback((id: number): District | null => {
    return districts.find((d) => d.id === id) ?? null;
  }, [districts]);

  const getAbilityById = useCallback((id: number): Ability | null => {
    return abilities.find((a) => a.id === id) ?? null;
  }, [abilities]);

  const getAchievementById = useCallback((id: number): Achievement | null => {
    return achievements.find((a) => a.id === id) ?? null;
  }, [achievements]);

  // ============================================================
  // Reset Function
  // ============================================================

  const resetFestival = useCallback((): void => {
    initializedRef.current = false;
    setSpirits([]);
    setDistricts([]);
    setLanterns([]);
    setStalls([]);
    setAbilities([]);
    setAchievements([]);
    setCurrentDistrict(0);
    setSpiritEnergy(100);
    setMoonlight(50);
    setLanternPoints(0);
    setAncestralFavor(0);
    setSpiritsBefriended(0);
    setTitleIndex(0);
    setFestivalDay(1);
    setDailyRitual(null);
    setTotalSpiritsBefriended(0);
    setTotalLanternsLit(0);
    setTotalStallUpgrades(0);
    setTotalAbilitiesUsed(0);
    setTotalRitualsCompleted(0);
    setTotalSkyLanternsReleased(0);
    setTotalAncestorVisits(0);
    setTotalIncenseOffered(0);
    setTotalMoonlightCollected(0);
    setTotalDistrictsVisited(0);
    setTheaterVisitCount(0);

    setTimeout(() => {
      initializedRef.current = true;
    }, 100);
  }, []);

  // ============================================================
  // Additional Action Functions
  // ============================================================

  const generateNewRitual = useCallback((): DailyRitual | null => {
    const def = slRandomPick(SL_RITUAL_DEFINITIONS);
    const dayMultiplier = 1 + (festivalDay * 0.1);
    const ritual: DailyRitual = {
      type: def.type,
      name: def.name,
      nameZh: def.nameZh,
      description: def.description,
      energyCost: Math.floor(def.baseEnergyCost * dayMultiplier),
      moonlightReward: Math.floor(def.baseMoonlightReward * dayMultiplier),
      lanternPointsReward: Math.floor(def.baseLanternPointsReward * dayMultiplier),
      favorReward: Math.floor(def.baseFavorReward * dayMultiplier),
      energyReward: Math.floor(def.baseEnergyReward * dayMultiplier),
      day: festivalDay,
      completed: false,
      stepsRequired: def.stepsRequired,
      stepsCompleted: 0,
    };
    setDailyRitual(ritual);
    return ritual;
  }, [festivalDay]);

  const extinguishLantern = useCallback((lanternId: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const lantern = st.lanterns.find((l) => l.id === lanternId);
    if (!lantern || !lantern.lit) return false;

    setLanterns((prev) =>
      prev.map((l) =>
        l.id === lanternId ? { ...l, lit: false } : l
      )
    );
    setMoonlight((prev) => Math.min(SL_MAX_MOONLIGHT, prev + Math.floor(lantern.definition.moonlightCost * 0.3)));
    return true;
  }, []);

  const boostFriendship = useCallback((spiritId: number, amount: number): boolean => {
    const st = stateRef.current;
    if (!st) return false;
    const spirit = st.spirits.find((s) => s.id === spiritId);
    if (!spirit || !spirit.befriended) return false;
    if (spirit.friendshipLevel >= SL_MAX_FRIENDSHIP) return false;

    const boosted = Math.min(SL_MAX_FRIENDSHIP, spirit.friendshipLevel + amount);
    setSpirits((prev) =>
      prev.map((s) =>
        s.id === spiritId ? { ...s, friendshipLevel: boosted } : s
      )
    );
    return true;
  }, []);

  const canAffordUpgrade = useCallback((stallId: number): { affordable: boolean; cost: number } => {
    const stall = stalls.find((s) => s.id === stallId);
    if (!stall || stall.level >= stall.definition.maxLevel) {
      return { affordable: false, cost: 0 };
    }
    const cost = slUpgradeCost(stall.definition.baseUpgradeCost, stall.level);
    return { affordable: lanternPoints >= cost, cost };
  }, [stalls, lanternPoints]);

  const canBefriend = useCallback((spiritId: number): boolean => {
    const spirit = spirits.find((s) => s.id === spiritId);
    if (!spirit || !spirit.discovered || spirit.befriended) return false;
    return spiritEnergy >= spirit.definition.energyCost;
  }, [spirits, spiritEnergy]);

  const canLight = useCallback((lanternId: number): boolean => {
    const lantern = lanterns.find((l) => l.id === lanternId);
    if (!lantern || !lantern.collected || lantern.lit) return false;
    return moonlight >= lantern.definition.moonlightCost;
  }, [lanterns, moonlight]);

  // ============================================================
  // Additional Computed Values
  // ============================================================

  const highestRarityBefriended = useMemo((): SpiritRarity => {
    let highest: SpiritRarity = 'common';
    const order: SpiritRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    for (const spirit of spirits) {
      if (spirit.befriended) {
        const idx = order.indexOf(spirit.definition.rarity);
        const hIdx = order.indexOf(highest);
        if (idx > hIdx) highest = spirit.definition.rarity;
      }
    }
    return highest;
  }, [spirits]);

  const mostVisitedDistrict = useMemo((): District | null => {
    if (districts.length === 0) return null;
    return districts.reduce((prev, curr) => (curr.visits > prev.visits ? curr : prev));
  }, [districts]);

  const totalStallLevels = useMemo((): number => {
    return stalls.reduce((sum, s) => sum + s.level, 0);
  }, [stalls]);

  const dailyRitualProgress = useMemo((): number => {
    if (!dailyRitual) return 0;
    return dailyRitual.stepsRequired > 0
      ? Math.floor((dailyRitual.stepsCompleted / dailyRitual.stepsRequired) * 100)
      : 0;
  }, [dailyRitual]);

  // ============================================================
  // Return Object
  // ============================================================

  return {
    // ---- Constants ----
    SL_MAX_ENERGY,
    SL_MAX_MOONLIGHT,
    SL_MAX_LANTERN_POINTS,
    SL_MAX_FAVOR,
    SL_MAX_FRIENDSHIP,
    SL_SPIRIT_COUNT,
    SL_DISTRICT_COUNT,
    SL_LANTERN_COUNT,
    SL_STALL_COUNT,
    SL_ABILITY_COUNT,
    SL_ACHIEVEMENT_COUNT,
    SL_TITLE_COUNT,
    SL_MAX_FESTIVAL_DAY,
    SL_ENERGY_REGEN_PER_DAY,
    SL_MOONLIGHT_PER_HOUR,
    SL_SKY_LANTERN_COST,
    SL_SKY_LANTERN_ENERGY_COST,
    SL_ANCESTOR_VISIT_COST,
    SL_INCENSE_COST,
    SL_INCENSE_ENERGY_COST,
    SL_RITUAL_ENERGY_COST,
    SL_TITLE_UNLOCK_CHECK_INTERVAL,
    SL_COLOR_RED,
    SL_COLOR_GOLD,
    SL_COLOR_ORANGE,
    SL_COLOR_PAPER_WHITE,
    SL_COLOR_JADE_GREEN,
    SL_COLORS,

    // ---- Static Data Access ----
    SL_SPIRIT_DEFINITIONS,
    SL_DISTRICT_DEFINITIONS,
    SL_LANTERN_DEFINITIONS,
    SL_STALL_DEFINITIONS,
    SL_ABILITY_DEFINITIONS,
    SL_ACHIEVEMENT_DEFINITIONS,
    SL_TITLE_DEFINITIONS,
    SL_RITUAL_DEFINITIONS,

    // ---- State ----
    spirits,
    districts,
    lanterns,
    stalls,
    abilities,
    achievements,
    currentDistrict,
    spiritEnergy,
    moonlight,
    lanternPoints,
    ancestralFavor,
    spiritsBefriended,
    titleIndex,
    festivalDay,
    dailyRitual,
    totalSpiritsBefriended,
    totalLanternsLit,
    totalStallUpgrades,
    totalAbilitiesUsed,
    totalRitualsCompleted,
    totalSkyLanternsReleased,
    totalAncestorVisits,
    totalIncenseOffered,
    totalMoonlightCollected,
    totalDistrictsVisited,
    theaterVisitCount,

    // ---- Setters ----
    setSpirits,
    setDistricts,
    setLanterns,
    setStalls,
    setAbilities,
    setAchievements,
    setCurrentDistrict,
    setSpiritEnergy,
    setMoonlight,
    setLanternPoints,
    setAncestralFavor,
    setSpiritsBefriended,
    setTitleIndex,
    setFestivalDay,
    setDailyRitual,

    // ---- Computed Values ----
    discoveredSpirits,
    befriendedSpirits,
    undiscoveredSpirits,
    collectedLanterns,
    litLanterns,
    unlockedDistricts,
    unlockedAbilities,
    completedAchievements,
    activeTitle,
    energyPercentage,
    moonlightPercentage,
    currentDistrictData,
    availableSpiritsInDistrict,
    availableLanternsInDistrict,
    availableStallsInDistrict,
    spiritRarityCounts,
    overallFestivalScore,

    // ---- Action Functions ----
    befriendSpirit,
    discoverSpirit,
    encounterSpirit,
    lightLantern,
    collectLantern,
    upgradeStall,
    activateAbility,
    performRitual,
    releaseSkyLantern,
    visitAncestorShrine,
    collectMoonlight,
    offerIncense,
    visitDistrict,
    advanceFestivalDay,
    spendEnergy,
    grantEnergy,
    grantMoonlight,
    grantLanternPoints,
    grantFavor,
    checkAchievements,
    getTitle,
    getProgress,
    getStats,
    getSpiritById,
    getLanternById,
    getStallById,
    getDistrictById,
    getAbilityById,
    getAchievementById,
    resetFestival,
    generateNewRitual,
    extinguishLantern,
    boostFriendship,
    canAffordUpgrade,
    canBefriend,
    canLight,

    // ---- Additional Computed Values ----
    highestRarityBefriended,
    mostVisitedDistrict,
    totalStallLevels,
    dailyRitualProgress,

    // ---- Helper Functions ----
    slRarityOrder,
    slRarityColor,
    slUpgradeCost,
    slClamp,
  };
}
