import { useState } from 'react';

// ============================================================
// CONSTANTS
// ============================================================

const OG_STORAGE_KEY = 'oracle-guild-save';

// ============================================================
// ORACLE CLASS DEFINITIONS
// ============================================================

export type OracleClassName =
  | 'Apprentice Seer'
  | 'Novice Diviner'
  | 'Mystic Reader'
  | 'Crystal Gazer'
  | 'Star Whisperer'
  | 'Prophecy Keeper'
  | 'Vision Weaver'
  | 'Arcane Scribe'
  | 'Celestial Sage'
  | 'Celestial Oracle';

export interface OracleClassStats {
  intuition: number;
  wisdom: number;
  arcana: number;
  foresight: number;
  charisma: number;
}

export interface OracleClass {
  name: OracleClassName;
  tier: number;
  description: string;
  baseStats: OracleClassStats;
  divinationBonus: string;
  uniqueAbility: string;
  requiredLevel: number;
  requiredXp: number;
}

export const ORACLE_CLASSES: OracleClass[] = [
  {
    name: 'Apprentice Seer',
    tier: 1,
    description: 'A beginner who has just awakened their third eye. Basic divination skills and rudimentary foresight abilities.',
    baseStats: { intuition: 5, wisdom: 3, arcana: 2, foresight: 1, charisma: 4 },
    divinationBonus: '+5% accuracy on basic readings',
    uniqueAbility: 'Beginner\'s Luck: First reading each day has +10% accuracy',
    requiredLevel: 1,
    requiredXp: 0,
  },
  {
    name: 'Novice Diviner',
    tier: 2,
    description: 'Has begun to interpret the subtle signs of the universe. Can perform simple prophecies with moderate success.',
    baseStats: { intuition: 8, wisdom: 6, arcana: 4, foresight: 3, charisma: 6 },
    divinationBonus: '+10% accuracy on Tarot readings',
    uniqueAbility: 'Gut Feeling: Intuition checks gain +5 bonus',
    requiredLevel: 5,
    requiredXp: 500,
  },
  {
    name: 'Mystic Reader',
    tier: 3,
    description: 'Skilled in reading mystical signs and omens. Can interpret complex patterns in crystal balls and star charts.',
    baseStats: { intuition: 12, wisdom: 10, arcana: 8, foresight: 6, charisma: 8 },
    divinationBonus: '+15% accuracy on Crystal Gazing',
    uniqueAbility: 'Pattern Sight: Can reveal hidden patterns in readings',
    requiredLevel: 10,
    requiredXp: 2000,
  },
  {
    name: 'Crystal Gazer',
    tier: 4,
    description: 'A master of crystal-based divination. Can see through veils of time and space using enchanted crystals.',
    baseStats: { intuition: 16, wisdom: 14, arcana: 12, foresight: 10, charisma: 10 },
    divinationBonus: '+20% accuracy on all crystal methods',
    uniqueAbility: 'Crystal Resonance: Crystals charge 25% faster',
    requiredLevel: 15,
    requiredXp: 5000,
  },
  {
    name: 'Star Whisperer',
    tier: 5,
    description: 'Can hear the whispers of distant stars and translate celestial movements into prophecies.',
    baseStats: { intuition: 20, wisdom: 18, arcana: 16, foresight: 14, charisma: 12 },
    divinationBonus: '+25% accuracy on Star Charting and Astrology',
    uniqueAbility: 'Star Alignment: Bonus accuracy during celestial events',
    requiredLevel: 20,
    requiredXp: 10000,
  },
  {
    name: 'Prophecy Keeper',
    tier: 6,
    description: 'Guardian of ancient prophecies. Can store and recall past visions with perfect clarity.',
    baseStats: { intuition: 25, wisdom: 22, arcana: 20, foresight: 18, charisma: 15 },
    divinationBonus: '+30% accuracy on Dream Interpretation',
    uniqueAbility: 'Prophecy Vault: Can revisit any past reading',
    requiredLevel: 25,
    requiredXp: 18000,
  },
  {
    name: 'Vision Weaver',
    tier: 7,
    description: 'Can weave multiple visions together into cohesive prophecies. Masters of narrative divination.',
    baseStats: { intuition: 30, wisdom: 27, arcana: 25, foresight: 22, charisma: 18 },
    divinationBonus: '+35% accuracy on combined readings',
    uniqueAbility: 'Vision Tapestry: Combine 3 methods for bonus insight',
    requiredLevel: 30,
    requiredXp: 30000,
  },
  {
    name: 'Arcane Scribe',
    tier: 8,
    description: 'Records prophecies in enchanted scripts that gain power over time. Ancient knowledge flows through their quill.',
    baseStats: { intuition: 35, wisdom: 32, arcana: 30, foresight: 26, charisma: 22 },
    divinationBonus: '+40% accuracy on Scroll-based readings',
    uniqueAbility: 'Living Scroll: Written prophecies evolve and update',
    requiredLevel: 35,
    requiredXp: 50000,
  },
  {
    name: 'Celestial Sage',
    tier: 9,
    description: 'A sage of immense cosmic wisdom. Their prophecies shape the very fabric of reality.',
    baseStats: { intuition: 40, wisdom: 38, arcana: 36, foresight: 32, charisma: 28 },
    divinationBonus: '+45% accuracy on all methods',
    uniqueAbility: 'Cosmic Insight: See 3 possible futures for any prophecy',
    requiredLevel: 40,
    requiredXp: 80000,
  },
  {
    name: 'Celestial Oracle',
    tier: 10,
    description: 'The pinnacle of divination mastery. All-knowing, all-seeing. A living conduit between mortal and divine realms.',
    baseStats: { intuition: 50, wisdom: 48, arcana: 45, foresight: 40, charisma: 35 },
    divinationBonus: '+50% accuracy on all methods + bonus rewards',
    uniqueAbility: 'Divine Conduit: All readings gain ultimate insight level',
    requiredLevel: 50,
    requiredXp: 150000,
  },
];

// ============================================================
// GUILD HALL DEFINITIONS
// ============================================================

export type GuildHallName =
  | 'Vision Chamber'
  | 'Star Chart Room'
  | 'Crystal Ball Alcove'
  | 'Prophecy Vault'
  | 'Scroll Library'
  | 'Divination Pool'
  | 'Astral Observatory'
  | 'Council Chamber';

export interface GuildHall {
  name: GuildHallName;
  description: string;
  level: number;
  maxLevel: number;
  upgradeCost: { stardust: number; moonCrystals: number; celestialCoins: number };
  bonusPerLevel: string;
  currentBonus: number;
}

export interface GuildHallUpgradeCost {
  stardust: number;
  moonCrystals: number;
  celestialCoins: number;
}

export const GUILD_HALL_TEMPLATES: Omit<GuildHall, 'level' | 'currentBonus'>[] = [
  {
    name: 'Vision Chamber',
    description: 'The heart of the guild where oracles receive their most powerful visions. Enhanced ambient energy amplifies all divination.',
    maxLevel: 10,
    upgradeCost: { stardust: 100, moonCrystals: 20, celestialCoins: 50 },
    bonusPerLevel: '+5% vision clarity',
  },
  {
    name: 'Star Chart Room',
    description: 'A circular room with a domed ceiling painted with constellations. Star charts are automatically updated here.',
    maxLevel: 10,
    upgradeCost: { stardust: 150, moonCrystals: 30, celestialCoins: 60 },
    bonusPerLevel: '+5% star chart accuracy',
  },
  {
    name: 'Crystal Ball Alcove',
    description: 'A secluded alcove filled with crystal balls of various sizes and compositions. Ideal for crystal gazing.',
    maxLevel: 10,
    upgradeCost: { stardust: 120, moonCrystals: 40, celestialCoins: 55 },
    bonusPerLevel: '+5% crystal gazing power',
  },
  {
    name: 'Prophecy Vault',
    description: 'A reinforced chamber where the most important prophecies are stored and preserved for eternity.',
    maxLevel: 10,
    upgradeCost: { stardust: 200, moonCrystals: 50, celestialCoins: 80 },
    bonusPerLevel: '+10% prophecy storage capacity',
  },
  {
    name: 'Scroll Library',
    description: 'An extensive library of ancient scrolls containing divination knowledge, rituals, and forgotten prophecies.',
    maxLevel: 10,
    upgradeCost: { stardust: 80, moonCrystals: 15, celestialCoins: 40 },
    bonusPerLevel: '+3% method learning speed',
  },
  {
    name: 'Divination Pool',
    description: 'A mystical pool of enchanted water that reflects possible futures. Water divination reaches its full potential here.',
    maxLevel: 10,
    upgradeCost: { stardust: 130, moonCrystals: 35, celestialCoins: 65 },
    bonusPerLevel: '+5% water divination accuracy',
  },
  {
    name: 'Astral Observatory',
    description: 'A tower with a powerful enchanted telescope that can see into other dimensions and timelines.',
    maxLevel: 10,
    upgradeCost: { stardust: 250, moonCrystals: 60, celestialCoins: 100 },
    bonusPerLevel: '+8% astral event detection',
  },
  {
    name: 'Council Chamber',
    description: 'Where the guild council meets to discuss prophecies and guide the oracle\'s path. Boosts charisma and reputation.',
    maxLevel: 10,
    upgradeCost: { stardust: 180, moonCrystals: 45, celestialCoins: 75 },
    bonusPerLevel: '+5% client satisfaction bonus',
  },
];

// ============================================================
// DIVINATION METHOD DEFINITIONS
// ============================================================

export type DivinationMethodName =
  | 'Tarot Reading'
  | 'Crystal Gazing'
  | 'Star Charting'
  | 'Dream Interpretation'
  | 'Rune Casting'
  | 'Tea Leaf Reading'
  | 'Fire Scrying'
  | 'Water Divination'
  | 'Bone Throwing'
  | 'Aura Reading'
  | 'Palm Reading'
  | 'Astrology';

export interface DivinationMethod {
  name: DivinationMethodName;
  description: string;
  skillLevel: number;
  maxSkillLevel: number;
  xpPerUse: number;
  baseAccuracy: number;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Master';
  crystalAffinity: string;
  bestHall: GuildHallName;
}

export const DIVINATION_METHODS: DivinationMethod[] = [
  {
    name: 'Tarot Reading',
    description: 'Interpret the ancient tarot cards to reveal hidden truths and guide seekers on their path.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 15,
    baseAccuracy: 70,
    difficulty: 'Easy',
    crystalAffinity: 'Amethyst',
    bestHall: 'Vision Chamber',
  },
  {
    name: 'Crystal Gazing',
    description: 'Peer into enchanted crystal balls to see glimpses of past, present, and future.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 18,
    baseAccuracy: 65,
    difficulty: 'Medium',
    crystalAffinity: 'Clear Quartz',
    bestHall: 'Crystal Ball Alcove',
  },
  {
    name: 'Star Charting',
    description: 'Map the positions of celestial bodies to predict cosmic influences on mortal affairs.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 20,
    baseAccuracy: 60,
    difficulty: 'Medium',
    crystalAffinity: 'Star Sapphire',
    bestHall: 'Star Chart Room',
  },
  {
    name: 'Dream Interpretation',
    description: 'Enter the dreamscape to decode the symbolic messages hidden within sleeping visions.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 22,
    baseAccuracy: 55,
    difficulty: 'Hard',
    crystalAffinity: 'Moonstone',
    bestHall: 'Vision Chamber',
  },
  {
    name: 'Rune Casting',
    description: 'Cast ancient runic stones and interpret their patterns to divine the will of fate.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 17,
    baseAccuracy: 65,
    difficulty: 'Medium',
    crystalAffinity: 'Obsidian',
    bestHall: 'Prophecy Vault',
  },
  {
    name: 'Tea Leaf Reading',
    description: 'Interpret patterns formed by tea leaves in a cup to reveal near-future events.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 12,
    baseAccuracy: 60,
    difficulty: 'Easy',
    crystalAffinity: 'Jade',
    bestHall: 'Scroll Library',
  },
  {
    name: 'Fire Scrying',
    description: 'Gaze into sacred flames to see visions shaped by the element of transformation.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 25,
    baseAccuracy: 50,
    difficulty: 'Hard',
    crystalAffinity: 'Fire Opal',
    bestHall: 'Vision Chamber',
  },
  {
    name: 'Water Divination',
    description: 'Use enchanted water surfaces to mirror possible futures and hidden emotions.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 20,
    baseAccuracy: 58,
    difficulty: 'Medium',
    crystalAffinity: 'Aquamarine',
    bestHall: 'Divination Pool',
  },
  {
    name: 'Bone Throwing',
    description: 'Cast ritual bones and read the patterns they form to commune with ancestral spirits.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 23,
    baseAccuracy: 52,
    difficulty: 'Hard',
    crystalAffinity: 'Bone Quartz',
    bestHall: 'Prophecy Vault',
  },
  {
    name: 'Aura Reading',
    description: 'Perceive and interpret the colorful energy fields surrounding living beings.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 16,
    baseAccuracy: 68,
    difficulty: 'Easy',
    crystalAffinity: 'Rose Quartz',
    bestHall: 'Crystal Ball Alcove',
  },
  {
    name: 'Palm Reading',
    description: 'Study the lines, mounts, and shapes of a seeker\'s palm to reveal their destiny.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 14,
    baseAccuracy: 62,
    difficulty: 'Easy',
    crystalAffinity: 'Citrine',
    bestHall: 'Council Chamber',
  },
  {
    name: 'Astrology',
    description: 'Create detailed natal and transit charts to predict life events and personality traits.',
    skillLevel: 0,
    maxSkillLevel: 100,
    xpPerUse: 28,
    baseAccuracy: 48,
    difficulty: 'Master',
    crystalAffinity: 'Labradorite',
    bestHall: 'Astral Observatory',
  },
];

// ============================================================
// PROPHECY DEFINITIONS
// ============================================================

export type ProphecyDifficulty = 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
export type ProphecyStatus = 'locked' | 'active' | 'in_progress' | 'fulfilled' | 'failed' | 'expired';

export interface ProphecyReward {
  stardust: number;
  moonCrystals: number;
  prophecyScrolls: number;
  oracleEssence: number;
  celestialCoins: number;
  xp: number;
}

export interface Prophecy {
  id: string;
  title: string;
  description: string;
  difficulty: ProphecyDifficulty;
  status: ProphecyStatus;
  progress: number;
  requiredProgress: number;
  reward: ProphecyReward;
  timeLimit: number; // hours, 0 = no limit
  timeRemaining: number;
  divinationMethod: DivinationMethodName;
  minLevel: number;
  lore: string;
}

export const PROPHECY_TEMPLATES: Omit<Prophecy, 'status' | 'progress' | 'timeRemaining'>[] = [
  // Common prophecies (8)
  {
    id: 'prop-lost- travelers',
    title: 'The Lost Travelers',
    description: 'A caravan has lost its way in the Whispering Sands. Divine their safest route.',
    difficulty: 'Common',
    requiredProgress: 3,
    reward: { stardust: 50, moonCrystals: 5, prophecyScrolls: 1, oracleEssence: 10, celestialCoins: 25, xp: 100 },
    timeLimit: 24,
    divinationMethod: 'Star Charting',
    minLevel: 1,
    lore: 'The sands whisper of three paths, but only one leads to safety.',
  },
  {
    id: 'prop-missing- pet',
    title: 'The Missing Companion',
    description: 'A young girl\'s cat has vanished. Use your sight to find where it hides.',
    difficulty: 'Common',
    requiredProgress: 2,
    reward: { stardust: 40, moonCrystals: 4, prophecyScrolls: 1, oracleEssence: 8, celestialCoins: 20, xp: 80 },
    timeLimit: 12,
    divinationMethod: 'Crystal Gazing',
    minLevel: 1,
    lore: 'The crystal reveals a small warm shape beneath the old oak.',
  },
  {
    id: 'prop-coming-rain',
    title: 'The Coming Rain',
    description: 'Farmers need to know when the next great rain will arrive to save their crops.',
    difficulty: 'Common',
    requiredProgress: 1,
    reward: { stardust: 30, moonCrystals: 3, prophecyScrolls: 1, oracleEssence: 5, celestialCoins: 15, xp: 60 },
    timeLimit: 8,
    divinationMethod: 'Water Divination',
    minLevel: 1,
    lore: 'The pool ripples with the image of dark clouds gathering.',
  },
  {
    id: 'prop-true-heart',
    title: 'The True Heart',
    description: 'A merchant wants to know if their beloved\'s affections are genuine.',
    difficulty: 'Common',
    requiredProgress: 2,
    reward: { stardust: 45, moonCrystals: 5, prophecyScrolls: 1, oracleEssence: 8, celestialCoins: 22, xp: 90 },
    timeLimit: 12,
    divinationMethod: 'Aura Reading',
    minLevel: 1,
    lore: 'The aura around the beloved shines with warm golden light.',
  },
  {
    id: 'prop-lucky-coin',
    title: 'The Lucky Coin',
    description: 'A gambler seeks guidance on when fortune will smile upon them.',
    difficulty: 'Common',
    requiredProgress: 1,
    reward: { stardust: 35, moonCrystals: 4, prophecyScrolls: 1, oracleEssence: 6, celestialCoins: 18, xp: 70 },
    timeLimit: 6,
    divinationMethod: 'Tarot Reading',
    minLevel: 1,
    lore: 'The Fool card appears reversed — caution is advised.',
  },
  {
    id: 'prop-new-beginning',
    title: 'A New Beginning',
    description: 'A young man stands at a crossroads. Which path leads to prosperity?',
    difficulty: 'Common',
    requiredProgress: 2,
    reward: { stardust: 40, moonCrystals: 5, prophecyScrolls: 1, oracleEssence: 7, celestialCoins: 20, xp: 85 },
    timeLimit: 18,
    divinationMethod: 'Palm Reading',
    minLevel: 1,
    lore: 'The life line branches into three — the middle path shines brightest.',
  },
  {
    id: 'prop-hidden-treasure',
    title: 'The Hidden Treasure',
    description: 'An old map hints at buried treasure. The runes can reveal its true location.',
    difficulty: 'Common',
    requiredProgress: 3,
    reward: { stardust: 60, moonCrystals: 6, prophecyScrolls: 2, oracleEssence: 12, celestialCoins: 30, xp: 110 },
    timeLimit: 24,
    divinationMethod: 'Rune Casting',
    minLevel: 1,
    lore: 'The runes point to where the old river once flowed.',
  },
  {
    id: 'prop-village-feast',
    title: 'The Village Feast',
    description: 'The harvest festival approaches. Will the tea leaves promise abundance?',
    difficulty: 'Common',
    requiredProgress: 1,
    reward: { stardust: 30, moonCrystals: 3, prophecyScrolls: 1, oracleEssence: 5, celestialCoins: 15, xp: 55 },
    timeLimit: 6,
    divinationMethod: 'Tea Leaf Reading',
    minLevel: 1,
    lore: 'The leaves form the shape of a cornucopia — abundance awaits.',
  },
  // Uncommon prophecies (8)
  {
    id: 'prop-cursed-king',
    title: 'The Cursed King',
    description: 'A kingdom falls under a mysterious curse. The bones hold the key to breaking it.',
    difficulty: 'Uncommon',
    requiredProgress: 5,
    reward: { stardust: 150, moonCrystals: 20, prophecyScrolls: 5, oracleEssence: 30, celestialCoins: 75, xp: 300 },
    timeLimit: 48,
    divinationMethod: 'Bone Throwing',
    minLevel: 5,
    lore: 'The bones arrange themselves in the shape of a broken crown.',
  },
  {
    id: 'prop-shadow-assassin',
    title: 'The Shadow Assassin',
    description: 'A political figure is in danger. Divine the threat and the identity of the would-be killer.',
    difficulty: 'Uncommon',
    requiredProgress: 5,
    reward: { stardust: 180, moonCrystals: 25, prophecyScrolls: 5, oracleEssence: 35, celestialCoins: 80, xp: 350 },
    timeLimit: 36,
    divinationMethod: 'Dream Interpretation',
    minLevel: 5,
    lore: 'In the dream, a figure cloaked in shadow raises a dagger at dawn.',
  },
  {
    id: 'prop-phoenix-egg',
    title: 'The Phoenix Egg',
    description: 'A rare phoenix egg has been sighted. Fire scrying can reveal its exact location before it hatches.',
    difficulty: 'Uncommon',
    requiredProgress: 4,
    reward: { stardust: 160, moonCrystals: 22, prophecyScrolls: 4, oracleEssence: 32, celestialCoins: 78, xp: 320 },
    timeLimit: 24,
    divinationMethod: 'Fire Scrying',
    minLevel: 5,
    lore: 'The flames dance in the shape of a great bird rising from ashes.',
  },
  {
    id: 'prop-twin-prophets',
    title: 'The Twin Prophets',
    description: 'Two rival seers claim to prophecy the same event. Determine which vision is true.',
    difficulty: 'Uncommon',
    requiredProgress: 4,
    reward: { stardust: 140, moonCrystals: 18, prophecyScrolls: 4, oracleEssence: 28, celestialCoins: 70, xp: 280 },
    timeLimit: 36,
    divinationMethod: 'Crystal Gazing',
    minLevel: 5,
    lore: 'The crystal reveals two paths diverging — one glows with truth.',
  },
  {
    id: 'prop-eclipse-omen',
    title: 'The Eclipse Omen',
    description: 'A rare solar eclipse approaches. What does it portend for the realm?',
    difficulty: 'Uncommon',
    requiredProgress: 4,
    reward: { stardust: 170, moonCrystals: 20, prophecyScrolls: 5, oracleEssence: 30, celestialCoins: 76, xp: 310 },
    timeLimit: 48,
    divinationMethod: 'Astrology',
    minLevel: 8,
    lore: 'The eclipse alignment speaks of great change and renewal.',
  },
  {
    id: 'prop-lost-dynasty',
    title: 'The Lost Dynasty',
    description: 'Heirlooms of a forgotten dynasty have been unearthed. Discover the true heir.',
    difficulty: 'Uncommon',
    requiredProgress: 5,
    reward: { stardust: 165, moonCrystals: 22, prophecyScrolls: 4, oracleEssence: 33, celestialCoins: 80, xp: 330 },
    timeLimit: 48,
    divinationMethod: 'Star Charting',
    minLevel: 8,
    lore: 'The stars align to form the ancient royal crest.',
  },
  {
    id: 'prop-spirit-bound',
    title: 'The Spirit Bound',
    description: 'A restless spirit is trapped between worlds. What must be done to free it?',
    difficulty: 'Uncommon',
    requiredProgress: 4,
    reward: { stardust: 145, moonCrystals: 18, prophecyScrolls: 4, oracleEssence: 28, celestialCoins: 72, xp: 290 },
    timeLimit: 36,
    divinationMethod: 'Aura Reading',
    minLevel: 5,
    lore: 'A faint violet aura pulses where the spirit lingers.',
  },
  {
    id: 'prop-trade-winds',
    title: 'The Trade Winds',
    description: 'A merchant fleet awaits favorable winds. When should they set sail?',
    difficulty: 'Uncommon',
    requiredProgress: 3,
    reward: { stardust: 130, moonCrystals: 15, prophecyScrolls: 3, oracleEssence: 25, celestialCoins: 65, xp: 260 },
    timeLimit: 24,
    divinationMethod: 'Water Divination',
    minLevel: 5,
    lore: 'The pool shows ships sailing under a crescent moon.',
  },
  // Rare prophecies (8)
  {
    id: 'prop-dragon-waking',
    title: 'The Dragon Waking',
    description: 'An ancient dragon stirs beneath the mountain. Its awakening could reshape the world.',
    difficulty: 'Rare',
    requiredProgress: 8,
    reward: { stardust: 400, moonCrystals: 50, prophecyScrolls: 12, oracleEssence: 80, celestialCoins: 200, xp: 800 },
    timeLimit: 72,
    divinationMethod: 'Fire Scrying',
    minLevel: 15,
    lore: 'The flames burn hotter than ever before — the dragon breathes.',
  },
  {
    id: 'prop-fey-courts',
    title: 'The Fey Courts',
    description: 'The boundary between mortal and fey realms thins. Navigate the political intrigue of the fairy courts.',
    difficulty: 'Rare',
    requiredProgress: 8,
    reward: { stardust: 450, moonCrystals: 55, prophecyScrolls: 15, oracleEssence: 85, celestialCoins: 220, xp: 900 },
    timeLimit: 72,
    divinationMethod: 'Dream Interpretation',
    minLevel: 15,
    lore: 'In dreams, the fey queen offers a crown woven from starlight.',
  },
  {
    id: 'prop-time-rift',
    title: 'The Time Rift',
    description: 'A rift in time has opened. Events from the past bleed into the present. Seal it before reality unravels.',
    difficulty: 'Rare',
    requiredProgress: 10,
    reward: { stardust: 500, moonCrystals: 60, prophecyScrolls: 15, oracleEssence: 100, celestialCoins: 250, xp: 1000 },
    timeLimit: 96,
    divinationMethod: 'Astrology',
    minLevel: 20,
    lore: 'The celestial charts show time itself fracturing into shards.',
  },
  {
    id: 'prop-wandering-star',
    title: 'The Wandering Star',
    description: 'A new star has appeared in the sky. Its influence will change the fate of nations.',
    difficulty: 'Rare',
    requiredProgress: 7,
    reward: { stardust: 420, moonCrystals: 52, prophecyScrolls: 13, oracleEssence: 82, celestialCoins: 210, xp: 850 },
    timeLimit: 72,
    divinationMethod: 'Star Charting',
    minLevel: 15,
    lore: 'No existing star chart shows this celestial body — it is new.',
  },
  {
    id: 'prop-blood-moon-ritual',
    title: 'The Blood Moon Ritual',
    description: 'A dark cult plans a ritual during the next blood moon. Discover their plans and the ritual\'s purpose.',
    difficulty: 'Rare',
    requiredProgress: 8,
    reward: { stardust: 440, moonCrystals: 55, prophecyScrolls: 14, oracleEssence: 88, celestialCoins: 230, xp: 880 },
    timeLimit: 48,
    divinationMethod: 'Bone Throwing',
    minLevel: 18,
    lore: 'The bones spell out a name in an ancient, forbidden language.',
  },
  {
    id: 'prop-oracle-schism',
    title: 'The Oracle Schism',
    description: 'The oracle guilds have fractured into warring factions. Reveal the truth that can unite them.',
    difficulty: 'Rare',
    requiredProgress: 9,
    reward: { stardust: 460, moonCrystals: 58, prophecyScrolls: 14, oracleEssence: 90, celestialCoins: 240, xp: 920 },
    timeLimit: 96,
    divinationMethod: 'Rune Casting',
    minLevel: 18,
    lore: 'The elder rune glows with the word UNITY in the old tongue.',
  },
  {
    id: 'prop-void-whisper',
    title: 'The Void Whisper',
    description: 'Something from beyond the void is trying to communicate. What message does it carry?',
    difficulty: 'Rare',
    requiredProgress: 8,
    reward: { stardust: 480, moonCrystals: 56, prophecyScrolls: 15, oracleEssence: 95, celestialCoins: 235, xp: 950 },
    timeLimit: 72,
    divinationMethod: 'Crystal Gazing',
    minLevel: 20,
    lore: 'The crystal goes completely dark — then a single eye opens within.',
  },
  {
    id: 'prop-immortal-secret',
    title: 'The Immortal\'s Secret',
    description: 'An immortal being seeks death but cannot find it. Discover the key to their release.',
    difficulty: 'Rare',
    requiredProgress: 10,
    reward: { stardust: 520, moonCrystals: 65, prophecyScrolls: 18, oracleEssence: 105, celestialCoins: 260, xp: 1050 },
    timeLimit: 96,
    divinationMethod: 'Dream Interpretation',
    minLevel: 20,
    lore: 'In a recurring dream, a mirror shatters revealing infinite reflections.',
  },
  // Legendary prophecies (6)
  {
    id: 'prop-end-times',
    title: 'The End Times',
    description: 'All signs point to an apocalyptic convergence. Determine if this is truly the end or a new beginning.',
    difficulty: 'Legendary',
    requiredProgress: 15,
    reward: { stardust: 1500, moonCrystals: 200, prophecyScrolls: 50, oracleEssence: 300, celestialCoins: 750, xp: 3000 },
    timeLimit: 168,
    divinationMethod: 'Astrology',
    minLevel: 30,
    lore: 'Every celestial body aligns — an event that happens once in ten thousand years.',
  },
  {
    id: 'prop-god-sleeping',
    title: 'The Sleeping God',
    description: 'A god slumbers beneath the ocean. Its dreams shape reality. Discover what would happen if it wakes.',
    difficulty: 'Legendary',
    requiredProgress: 15,
    reward: { stardust: 1800, moonCrystals: 250, prophecyScrolls: 60, oracleEssence: 350, celestialCoins: 900, xp: 4000 },
    timeLimit: 168,
    divinationMethod: 'Water Divination',
    minLevel: 35,
    lore: 'The ocean itself rises and falls with the god\'s breathing.',
  },
  {
    id: 'prop-fate-weaver',
    title: 'The Fate Weaver',
    description: 'Someone has learned to weave the threads of fate itself. Find and stop them before they unravel destiny.',
    difficulty: 'Legendary',
    requiredProgress: 15,
    reward: { stardust: 2000, moonCrystals: 280, prophecyScrolls: 70, oracleEssence: 400, celestialCoins: 1000, xp: 5000 },
    timeLimit: 168,
    divinationMethod: 'Tarot Reading',
    minLevel: 40,
    lore: 'Every tarot reading shows the same card — a blank card that should not exist.',
  },
  {
    id: 'prop-infinity-mirror',
    title: 'The Infinity Mirror',
    description: 'A mirror has been found that shows not reflections, but other realities. What lies in the deepest reflection?',
    difficulty: 'Legendary',
    requiredProgress: 15,
    reward: { stardust: 1700, moonCrystals: 230, prophecyScrolls: 55, oracleEssence: 320, celestialCoins: 850, xp: 3500 },
    timeLimit: 168,
    divinationMethod: 'Crystal Gazing',
    minLevel: 35,
    lore: 'Each reflection shows a world slightly more perfect than the last.',
  },
  {
    id: 'prop-final-prophecy',
    title: 'The Final Prophecy',
    description: 'An ancient scroll speaks of one final prophecy that will end all prophecies. Interpret it before it is too late.',
    difficulty: 'Legendary',
    requiredProgress: 20,
    reward: { stardust: 2500, moonCrystals: 350, prophecyScrolls: 80, oracleEssence: 500, celestialCoins: 1200, xp: 6000 },
    timeLimit: 168,
    divinationMethod: 'Dream Interpretation',
    minLevel: 45,
    lore: 'The scroll\'s text shifts and changes — only a true oracle can read it.',
  },
  {
    id: 'prop-creation-spark',
    title: 'The Creation Spark',
    description: 'The original spark of creation still exists somewhere in the cosmos. Finding it grants ultimate knowledge.',
    difficulty: 'Legendary',
    requiredProgress: 20,
    reward: { stardust: 3000, moonCrystals: 400, prophecyScrolls: 100, oracleEssence: 600, celestialCoins: 1500, xp: 8000 },
    timeLimit: 168,
    divinationMethod: 'Fire Scrying',
    minLevel: 50,
    lore: 'The flame burns white-hot, then becomes cold, then becomes nothing and everything.',
  },
];

// ============================================================
// TAROT CARD DEFINITIONS
// ============================================================

export type TarotCardName =
  | 'The Fool'
  | 'The Magician'
  | 'The High Priestess'
  | 'The Empress'
  | 'The Emperor'
  | 'The Hierophant'
  | 'The Lovers'
  | 'The Chariot'
  | 'Strength'
  | 'The Hermit'
  | 'Wheel of Fortune'
  | 'Justice'
  | 'The Hanged Man'
  | 'Death'
  | 'Temperance'
  | 'The Devil'
  | 'The Tower'
  | 'The Star'
  | 'The Moon'
  | 'The Sun'
  | 'Judgement'
  | 'The World';

export interface TarotCard {
  name: TarotCardName;
  number: number;
  upright: string;
  reversed: string;
  element: string;
  zodiac: string;
  power: number;
  combinationBonus: string;
}

export const TAROT_DECK: TarotCard[] = [
  {
    name: 'The Fool', number: 0,
    upright: 'New beginnings, innocence, spontaneity, free spirit',
    reversed: 'Recklessness, risk-taking, carelessness',
    element: 'Air', zodiac: 'Uranus', power: 5,
    combinationBonus: 'With The Magician: +20% new prophecy accuracy',
  },
  {
    name: 'The Magician', number: 1,
    upright: 'Manifestation, resourcefulness, power, inspired action',
    reversed: 'Manipulation, poor planning, untapped talents',
    element: 'Mercury', zodiac: 'Mercury', power: 8,
    combinationBonus: 'With The High Priestess: +15% arcana power',
  },
  {
    name: 'The High Priestess', number: 2,
    upright: 'Intuition, sacred knowledge, divine feminine, subconscious',
    reversed: 'Secrets, disconnected from intuition, withdrawal',
    element: 'Water', zodiac: 'Moon', power: 10,
    combinationBonus: 'With The Moon: +25% dream interpretation',
  },
  {
    name: 'The Empress', number: 3,
    upright: 'Femininity, beauty, nature, nurturing, abundance',
    reversed: 'Creative block, dependence, emptiness',
    element: 'Venus', zodiac: 'Venus', power: 7,
    combinationBonus: 'With The Emperor: +10% all resources gained',
  },
  {
    name: 'The Emperor', number: 4,
    upright: 'Authority, structure, control, fatherhood, stability',
    reversed: 'Tyranny, rigidity, coldness, domination',
    element: 'Fire', zodiac: 'Aries', power: 7,
    combinationBonus: 'With The Chariot: +20% guild hall upgrade speed',
  },
  {
    name: 'The Hierophant', number: 5,
    upright: 'Spiritual wisdom, tradition, conformity, morality',
    reversed: 'Personal beliefs, freedom, challenging status quo',
    element: 'Earth', zodiac: 'Taurus', power: 6,
    combinationBonus: 'With Justice: +15% prophecy fulfillment rate',
  },
  {
    name: 'The Lovers', number: 6,
    upright: 'Love, harmony, relationships, values alignment, choices',
    reversed: 'Self-love, disharmony, imbalance, misalignment',
    element: 'Air', zodiac: 'Gemini', power: 8,
    combinationBonus: 'With The Star: +20% client satisfaction',
  },
  {
    name: 'The Chariot', number: 7,
    upright: 'Control, willpower, success, determination, action',
    reversed: 'Self-discipline, opposition, lack of direction',
    element: 'Water', zodiac: 'Cancer', power: 7,
    combinationBonus: 'With Strength: +15% streak bonus multiplier',
  },
  {
    name: 'Strength', number: 8,
    upright: 'Inner strength, bravery, compassion, focus, self-control',
    reversed: 'Self-doubt, weakness, insecurity, raw emotion',
    element: 'Fire', zodiac: 'Leo', power: 6,
    combinationBonus: 'With The Sun: +10% stat upgrade effectiveness',
  },
  {
    name: 'The Hermit', number: 9,
    upright: 'Soul-searching, introspection, solitude, inner guidance',
    reversed: 'Isolation, loneliness, withdrawal, anti-social',
    element: 'Earth', zodiac: 'Virgo', power: 9,
    combinationBonus: 'With The World: +25% XP gain from solo readings',
  },
  {
    name: 'Wheel of Fortune', number: 10,
    upright: 'Good luck, karma, life cycles, destiny, turning point',
    reversed: 'Bad luck, resistance to change, breaking cycles',
    element: 'Fire', zodiac: 'Jupiter', power: 12,
    combinationBonus: 'With The Fool: +30% random event bonus',
  },
  {
    name: 'Justice', number: 11,
    upright: 'Justice, fairness, truth, cause and effect, law',
    reversed: 'Unfairness, lack of accountability, dishonesty',
    element: 'Air', zodiac: 'Libra', power: 8,
    combinationBonus: 'With The Hierophant: +20% achievement progress',
  },
  {
    name: 'The Hanged Man', number: 12,
    upright: 'Surrender, letting go, new perspectives, pause',
    reversed: 'Delays, resistance, stalling, indecision',
    element: 'Water', zodiac: 'Neptune', power: 7,
    combinationBonus: 'With Death: +15% prophecy time extension',
  },
  {
    name: 'Death', number: 13,
    upright: 'Endings, change, transformation, transition, rebirth',
    reversed: 'Resistance to change, inability to move on, stagnation',
    element: 'Water', zodiac: 'Scorpio', power: 10,
    combinationBonus: 'With The Tower: +20% legendary prophecy unlock chance',
  },
  {
    name: 'Temperance', number: 14,
    upright: 'Balance, moderation, patience, purpose, meaning',
    reversed: 'Imbalance, excess, self-healing, re-alignment',
    element: 'Fire', zodiac: 'Sagittarius', power: 6,
    combinationBonus: 'With The Star: +15% crystal charging speed',
  },
  {
    name: 'The Devil', number: 15,
    upright: 'Shadow self, attachment, addiction, restriction, sexuality',
    reversed: 'Releasing limiting beliefs, exploring dark thoughts, detachment',
    element: 'Earth', zodiac: 'Capricorn', power: 11,
    combinationBonus: 'With The Tower: +25% rare drop chance',
  },
  {
    name: 'The Tower', number: 16,
    upright: 'Sudden change, upheaval, chaos, revelation, awakening',
    reversed: 'Personal transformation, fear of change, averting disaster',
    element: 'Fire', zodiac: 'Mars', power: 13,
    combinationBonus: 'With The Fool: +30% breakthrough reading chance',
  },
  {
    name: 'The Star', number: 17,
    upright: 'Hope, faith, purpose, renewal, spirituality, inspiration',
    reversed: 'Lack of faith, despair, self-trust, disconnection',
    element: 'Air', zodiac: 'Aquarius', power: 10,
    combinationBonus: 'With The Moon: +20% astral event bonus',
  },
  {
    name: 'The Moon', number: 18,
    upright: 'Illusion, fear, anxiety, subconscious, intuition',
    reversed: 'Release of fear, repressed emotion, clarity',
    element: 'Water', zodiac: 'Pisces', power: 9,
    combinationBonus: 'With The High Priestess: +25% night reading bonus',
  },
  {
    name: 'The Sun', number: 19,
    upright: 'Positivity, fun, warmth, success, vitality, joy',
    reversed: 'Inner child, feeling down, overly optimistic',
    element: 'Fire', zodiac: 'Sun', power: 11,
    combinationBonus: 'With The World: +20% daily challenge reward',
  },
  {
    name: 'Judgement', number: 20,
    upright: 'Judgement, rebirth, inner calling, absolution',
    reversed: 'Self-doubt, inner critic, ignoring the call',
    element: 'Fire', zodiac: 'Pluto', power: 10,
    combinationBonus: 'With Justice: +20% client tip amount',
  },
  {
    name: 'The World', number: 21,
    upright: 'Completion, integration, accomplishment, travel',
    reversed: 'Seeking personal closure, shortcuts, delays',
    element: 'Earth', zodiac: 'Saturn', power: 14,
    combinationBonus: 'With The Magician: +25% all divination power',
  },
];

// ============================================================
// CLIENT DEFINITIONS
// ============================================================

export type ClientName =
  | 'Elder Miravel'
  | 'Captain Theron'
  | 'Lady Seraphina'
  | 'Merchant Boris'
  | 'Scholar Lysandra'
  | 'Blacksmith Gundar'
  | 'Healer Willow'
  | 'Bard Faelan'
  | 'Farmer Gideon'
  | 'General Kaelen'
  | 'Auntie Mabel'
  | 'Prince Dorian'
  | 'Sister Yara'
  | 'Pirate Captain Zara'
  | 'Alchemist Quinn'
  | 'Hunter Renna'
  | 'Judge Aldric'
  | 'Dancer Sable'
  | 'Hermit Oric'
  | 'Queen Isolde';

export interface Client {
  name: ClientName;
  title: string;
  description: string;
  preferredMethod: DivinationMethodName;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Master';
  baseTip: number;
  satisfactionRating: number;
  maxSatisfaction: number;
  visitsCount: number;
  isAvailable: boolean;
  lastVisitTime: number;
  specialRequest: string;
  personality: string;
}

export const CLIENT_TEMPLATES: Client[] = [
  {
    name: 'Elder Miravel', title: 'Village Elder',
    description: 'The wise elder of the nearby village seeks guidance for her community.',
    preferredMethod: 'Tea Leaf Reading', difficulty: 'Easy',
    baseTip: 15, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Wants to know about the village harvest this season.',
    personality: 'Patient and grateful, shares stories of old times.',
  },
  {
    name: 'Captain Theron', title: 'Harbor Captain',
    description: 'A weathered sea captain who trusts the stars to guide his fleet.',
    preferredMethod: 'Star Charting', difficulty: 'Medium',
    baseTip: 30, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Needs to know the safest route through the Storm Archipelago.',
    personality: 'Skeptical but fair, rewards accuracy generously.',
  },
  {
    name: 'Lady Seraphina', title: 'Noblewoman',
    description: 'A wealthy noblewoman seeking insight into her romantic future.',
    preferredMethod: 'Tarot Reading', difficulty: 'Easy',
    baseTip: 50, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Wants to know if her arranged marriage will bring happiness.',
    personality: 'Elegant but demanding, expects precise readings.',
  },
  {
    name: 'Merchant Boris', title: 'Trade Mogul',
    description: 'A shrewd merchant who wants to predict market trends.',
    preferredMethod: 'Palm Reading', difficulty: 'Medium',
    baseTip: 40, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Which trade route will be most profitable this quarter?',
    personality: 'Calculating and penny-pinching, tips based on profit made.',
  },
  {
    name: 'Scholar Lysandra', title: 'Arcane Researcher',
    description: 'A scholar researching the history of ancient prophecies.',
    preferredMethod: 'Rune Casting', difficulty: 'Hard',
    baseTip: 35, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Seeks the location of the Lost Codex of Prophecies.',
    personality: 'Intellectual and curious, shares knowledge in return.',
  },
  {
    name: 'Blacksmith Gundar', title: 'Master Blacksmith',
    description: 'A dwarf blacksmith who wants to know the fate of his forge.',
    preferredMethod: 'Fire Scrying', difficulty: 'Medium',
    baseTip: 25, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Will his legendary blade be completed before winter?',
    personality: 'Gruff but kindhearted, offers forged items as extra tips.',
  },
  {
    name: 'Healer Willow', title: 'Village Healer',
    description: 'A gentle healer seeking to understand the illnesses afflicting her patients.',
    preferredMethod: 'Aura Reading', difficulty: 'Easy',
    baseTip: 20, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What is causing the mysterious fever in the village children?',
    personality: 'Compassionate and humble, offers healing services in return.',
  },
  {
    name: 'Bard Faelan', title: 'Traveling Bard',
    description: 'A charismatic bard looking for inspiration for his next masterpiece.',
    preferredMethod: 'Dream Interpretation', difficulty: 'Medium',
    baseTip: 22, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What song will make him famous across all kingdoms?',
    personality: 'Flamboyant and dramatic, composes songs about his readings.',
  },
  {
    name: 'Farmer Gideon', title: 'Head Farmer',
    description: 'A practical farmer who needs weather predictions.',
    preferredMethod: 'Water Divination', difficulty: 'Easy',
    baseTip: 10, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'When should he plant the sacred silver corn?',
    personality: 'Down-to-earth and honest, brings fresh produce as gifts.',
  },
  {
    name: 'General Kaelen', title: 'Army Commander',
    description: 'A battle-hardened general seeking tactical advantages through prophecy.',
    preferredMethod: 'Bone Throwing', difficulty: 'Hard',
    baseTip: 60, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Should he attack at dawn or wait for the eclipse?',
    personality: 'Stoic and strategic, rewards military protection.',
  },
  {
    name: 'Auntie Mabel', title: 'Baker Extraordinaire',
    description: 'A cheerful baker who wants to know the secret to perfect pastries.',
    preferredMethod: 'Tea Leaf Reading', difficulty: 'Easy',
    baseTip: 12, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Will her new recipe win the Grand Baking Competition?',
    personality: 'Warm and nurturing, always brings fresh pastries.',
  },
  {
    name: 'Prince Dorian', title: 'Crown Prince',
    description: 'The heir to the throne seeking divine confirmation of his right to rule.',
    preferredMethod: 'Astrology', difficulty: 'Master',
    baseTip: 100, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Is he the chosen ruler foretold in the ancient prophecy?',
    personality: 'Noble but insecure, rewards handsomely for favorable readings.',
  },
  {
    name: 'Sister Yara', title: 'Temple Priestess',
    description: 'A devout priestess who wishes to deepen her connection to the divine.',
    preferredMethod: 'Crystal Gazing', difficulty: 'Medium',
    baseTip: 30, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Which deity watches over her temple?',
    personality: 'Pious and serene, offers blessings and temple access.',
  },
  {
    name: 'Pirate Captain Zara', title: 'Scourge of the Eastern Seas',
    description: 'A fierce pirate captain who uses prophecy to find buried treasure.',
    preferredMethod: 'Star Charting', difficulty: 'Hard',
    baseTip: 55, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Where is the legendary Treasure of the Abyssal King?',
    personality: 'Bold and untrustworthy, but pays in rare treasures.',
  },
  {
    name: 'Alchemist Quinn', title: 'Master Alchemist',
    description: 'An eccentric alchemist seeking the formula for the Philosopher\'s Stone.',
    preferredMethod: 'Fire Scrying', difficulty: 'Master',
    baseTip: 45, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What is the missing ingredient for transmutation?',
    personality: 'Mad and brilliant, pays in rare alchemical reagents.',
  },
  {
    name: 'Hunter Renna', title: 'Master Tracker',
    description: 'An elite hunter tracking a legendary beast through the enchanted forest.',
    preferredMethod: 'Rune Casting', difficulty: 'Medium',
    baseTip: 28, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Which path does the White Stag take during the full moon?',
    personality: 'Quiet and focused, shares rare animal pelts as tips.',
  },
  {
    name: 'Judge Aldric', title: 'High Court Judge',
    description: 'A stern judge who uses prophecy to determine the truth in difficult cases.',
    preferredMethod: 'Aura Reading', difficulty: 'Hard',
    baseTip: 50, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'Is the accused noble truly innocent of the murder?',
    personality: 'Strict and fair, values truth above all else.',
  },
  {
    name: 'Dancer Sable', title: 'Famous Performer',
    description: 'A renowned dancer who wants her performances to reach transcendent levels.',
    preferredMethod: 'Dream Interpretation', difficulty: 'Easy',
    baseTip: 35, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What does her recurring dream of flying signify?',
    personality: 'Graceful and artistic, offers private performances as thanks.',
  },
  {
    name: 'Hermit Oric', title: 'Mountain Recluse',
    description: 'A mysterious hermit who rarely descends from his mountain cave.',
    preferredMethod: 'Crystal Gazing', difficulty: 'Master',
    baseTip: 70, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What is the true nature of the crystal that speaks to him?',
    personality: 'Enigmatic and wise, shares ancient secrets.',
  },
  {
    name: 'Queen Isolde', title: 'Sovereign of the Silver Realm',
    description: 'The beloved queen of a prosperous realm seeking to ensure her kingdom\'s future.',
    preferredMethod: 'Astrology', difficulty: 'Master',
    baseTip: 120, satisfactionRating: 50, maxSatisfaction: 100,
    visitsCount: 0, isAvailable: true, lastVisitTime: 0,
    specialRequest: 'What does the future hold for her daughter and heir?',
    personality: 'Regal and wise, grants audience and royal favors.',
  },
];

// ============================================================
// CRYSTAL DEFINITIONS
// ============================================================

export type CrystalName =
  | 'Amethyst'
  | 'Clear Quartz'
  | 'Star Sapphire'
  | 'Moonstone'
  | 'Obsidian'
  | 'Jade'
  | 'Fire Opal'
  | 'Aquamarine'
  | 'Bone Quartz'
  | 'Rose Quartz'
  | 'Citrine'
  | 'Labradorite'
  | 'Lapis Lazuli'
  | 'Black Tourmaline'
  | 'Celestite';

export interface Crystal {
  name: CrystalName;
  description: string;
  divinationPower: number;
  maxDivinationPower: number;
  currentCharge: number;
  maxCharge: number;
  cleansingRitual: string;
  chargingMethod: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  element: string;
  zodiacAffinity: string;
  owned: boolean;
  quantity: number;
  isClean: boolean;
  lastCleansed: number;
  lastCharged: number;
}

export const CRYSTAL_TEMPLATES: Omit<Crystal, 'currentCharge' | 'isClean' | 'lastCleansed' | 'lastCharged' | 'owned' | 'quantity'>[] = [
  {
    name: 'Amethyst',
    description: 'A purple crystal known for enhancing spiritual awareness and intuition. The most common oracle crystal.',
    divinationPower: 10, maxDivinationPower: 50, maxCharge: 100,
    cleansingRitual: 'Bathe in moonlight for one full night under the open sky.',
    chargingMethod: 'Place on a bed of sage leaves during meditation.',
    rarity: 'Common', element: 'Air', zodiacAffinity: 'Pisces',
  },
  {
    name: 'Clear Quartz',
    description: 'A versatile crystal that amplifies all forms of divination. The foundation of any oracle\'s toolkit.',
    divinationPower: 12, maxDivinationPower: 60, maxCharge: 100,
    cleansingRitual: 'Immerse in natural spring water at dawn for three consecutive mornings.',
    chargingMethod: 'Expose to sunlight for exactly one hour at noon.',
    rarity: 'Common', element: 'All', zodiacAffinity: 'All',
  },
  {
    name: 'Star Sapphire',
    description: 'A deep blue sapphire with a six-rayed star pattern that appears in light. Enhances celestial divination.',
    divinationPower: 18, maxDivinationPower: 90, maxCharge: 100,
    cleansingRitual: 'Place under a starry sky during a meteor shower.',
    chargingMethod: 'Align with the North Star and chant the Star Walker\'s prayer.',
    rarity: 'Rare', element: 'Air', zodiacAffinity: 'Gemini',
  },
  {
    name: 'Moonstone',
    description: 'A pearly, iridescent stone that changes with the phases of the moon. Essential for dream interpretation.',
    divinationPower: 15, maxDivinationPower: 75, maxCharge: 100,
    cleansingRitual: 'Wash in rainwater collected during a full moon.',
    chargingMethod: 'Place on a windowsill during the waxing moon for seven nights.',
    rarity: 'Uncommon', element: 'Water', zodiacAffinity: 'Cancer',
  },
  {
    name: 'Obsidian',
    description: 'A volcanic glass that reveals hidden truths. Used for protection and revealing deception.',
    divinationPower: 14, maxDivinationPower: 70, maxCharge: 100,
    cleansingRitual: 'Bury in volcanic soil or ash for one lunar cycle.',
    chargingMethod: 'Expose to the heat of a sacred fire while reciting protection incantations.',
    rarity: 'Uncommon', element: 'Fire', zodiacAffinity: 'Scorpio',
  },
  {
    name: 'Jade',
    description: 'A green stone of wisdom and harmony. Helps in reading the patterns of nature and tea leaves.',
    divinationPower: 13, maxDivinationPower: 65, maxCharge: 100,
    cleansingRitual: 'Polish with silk cloth dampened with morning dew.',
    chargingMethod: 'Place in a garden among growing plants during spring.',
    rarity: 'Common', element: 'Earth', zodiacAffinity: 'Taurus',
  },
  {
    name: 'Fire Opal',
    description: 'A brilliant orange opal with internal flashes of fire. Enhances all fire-based divination methods.',
    divinationPower: 17, maxDivinationPower: 85, maxCharge: 100,
    cleansingRitual: 'Pass through a candle flame without allowing it to touch the wick.',
    chargingMethod: 'Soak in dragon\'s breath smoke or forge fire for one hour.',
    rarity: 'Rare', element: 'Fire', zodiacAffinity: 'Aries',
  },
  {
    name: 'Aquamarine',
    description: 'A pale blue crystal of the sea. Unlocks the secrets hidden in water and waves.',
    divinationPower: 14, maxDivinationPower: 70, maxCharge: 100,
    cleansingRitual: 'Submerge in ocean water during high tide, then low tide.',
    chargingMethod: 'Place in a bowl of saltwater under moonlight for one night.',
    rarity: 'Uncommon', element: 'Water', zodiacAffinity: 'Aquarius',
  },
  {
    name: 'Bone Quartz',
    description: 'A white, porous crystal with patterns resembling bone. Channels ancestral spirits and ancient wisdom.',
    divinationPower: 16, maxDivinationPower: 80, maxCharge: 100,
    cleansingRitual: 'Anoint with sacred oils in a burial ground at midnight.',
    chargingMethod: 'Place on ancestral altar with offerings of incense and wine.',
    rarity: 'Rare', element: 'Earth', zodiacAffinity: 'Capricorn',
  },
  {
    name: 'Rose Quartz',
    description: 'A soft pink crystal of love and compassion. Reveals matters of the heart and emotional bonds.',
    divinationPower: 11, maxDivinationPower: 55, maxCharge: 100,
    cleansingRitual: 'Bathe in rose water infused with petals from a hundred roses.',
    chargingMethod: 'Surround with pink candles and rose petals during a love ritual.',
    rarity: 'Common', element: 'Water', zodiacAffinity: 'Libra',
  },
  {
    name: 'Citrine',
    description: 'A golden yellow crystal that radiates warmth and abundance. Reveals paths to prosperity.',
    divinationPower: 12, maxDivinationPower: 60, maxCharge: 100,
    cleansingRitual: 'Place in a bowl of golden honey under the sun for three hours.',
    chargingMethod: 'Expose to early morning sunlight while holding an intention of abundance.',
    rarity: 'Common', element: 'Fire', zodiacAffinity: 'Leo',
  },
  {
    name: 'Labradorite',
    description: 'A dark stone with iridescent flashes of blue, green, and gold. Bridges the material and spiritual worlds.',
    divinationPower: 19, maxDivinationPower: 95, maxCharge: 100,
    cleansingRitual: 'Pass through aurora light or place under the northern lights.',
    chargingMethod: 'Meditate with the stone while visualizing a bridge between worlds.',
    rarity: 'Rare', element: 'All', zodiacAffinity: 'Sagittarius',
  },
  {
    name: 'Lapis Lazuli',
    description: 'A deep blue stone flecked with gold. The stone of ancient kings and divine wisdom.',
    divinationPower: 16, maxDivinationPower: 80, maxCharge: 100,
    cleansingRitual: 'Immerse in sacred water from a temple spring overnight.',
    chargingMethod: 'Place alongside ancient scrolls or texts to absorb their wisdom.',
    rarity: 'Uncommon', element: 'Air', zodiacAffinity: 'Virgo',
  },
  {
    name: 'Black Tourmaline',
    description: 'A powerful protective stone that absorbs negative energy. Shields the oracle during dark readings.',
    divinationPower: 15, maxDivinationPower: 75, maxCharge: 100,
    cleansingRitual: 'Bury in salt for three days, then rinse in running water.',
    chargingMethod: 'Hold during a protective meditation, visualizing a shield of light.',
    rarity: 'Uncommon', element: 'Earth', zodiacAffinity: 'Capricorn',
  },
  {
    name: 'Celestite',
    description: 'A pale blue crystal of the angels. Connects to higher realms and celestial beings.',
    divinationPower: 20, maxDivinationPower: 100, maxCharge: 100,
    cleansingRitual: 'Place under the open sky during a clear night for one week.',
    chargingMethod: 'Use during prayer or meditation to connect with celestial guides.',
    rarity: 'Legendary', element: 'Air', zodiacAffinity: 'Pisces',
  },
];

// ============================================================
// ASTRAL EVENT DEFINITIONS
// ============================================================

export type AstralEventName =
  | 'Meteor Shower'
  | 'Solar Eclipse'
  | 'Lunar Eclipse'
  | 'Planetary Alignment'
  | 'Aurora Borealis'
  | 'Comet Passing'
  | 'Supermoon'
  | 'Celestial Conjunction';

export interface AstralEvent {
  name: AstralEventName;
  description: string;
  accuracyBonus: number;
  resourceBonus: number;
  duration: number; // hours
  cooldown: number; // hours until it can occur again
  isActive: boolean;
  timeRemaining: number;
  cooldownRemaining: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Legendary';
  divinationMethods: DivinationMethodName[];
  specialEffect: string;
}

export const ASTRAL_EVENT_TEMPLATES: Omit<AstralEvent, 'isActive' | 'timeRemaining' | 'cooldownRemaining'>[] = [
  {
    name: 'Meteor Shower',
    description: 'A shower of meteors lights up the night sky, bringing celestial energy to all readings.',
    accuracyBonus: 10, resourceBonus: 20, duration: 4, cooldown: 24,
    rarity: 'Common',
    divinationMethods: ['Star Charting', 'Astrology', 'Crystal Gazing'],
    specialEffect: 'Star Charting and Astrology gain double XP',
  },
  {
    name: 'Solar Eclipse',
    description: 'The sun is obscured by the moon, creating a powerful shadow that enhances dark divination.',
    accuracyBonus: 20, resourceBonus: 35, duration: 2, cooldown: 72,
    rarity: 'Rare',
    divinationMethods: ['Fire Scrying', 'Bone Throwing', 'Rune Casting'],
    specialEffect: 'Shadow-based readings gain triple accuracy',
  },
  {
    name: 'Lunar Eclipse',
    description: 'The earth\'s shadow falls across the moon, unlocking dream realms and hidden truths.',
    accuracyBonus: 15, resourceBonus: 30, duration: 3, cooldown: 48,
    rarity: 'Uncommon',
    divinationMethods: ['Dream Interpretation', 'Water Divination', 'Crystal Gazing'],
    specialEffect: 'Moonstone crystals charge to 100% instantly',
  },
  {
    name: 'Planetary Alignment',
    description: 'All major planets align in a rare cosmic configuration, amplifying all forms of divination.',
    accuracyBonus: 25, resourceBonus: 50, duration: 6, cooldown: 168,
    rarity: 'Legendary',
    divinationMethods: ['Astrology', 'Star Charting', 'Tarot Reading', 'Dream Interpretation', 'Crystal Gazing', 'Rune Casting'],
    specialEffect: 'All divination methods gain +15% accuracy bonus',
  },
  {
    name: 'Aurora Borealis',
    description: 'The northern lights dance across the sky, infusing the world with ethereal energy.',
    accuracyBonus: 12, resourceBonus: 25, duration: 5, cooldown: 36,
    rarity: 'Uncommon',
    divinationMethods: ['Crystal Gazing', 'Aura Reading', 'Tea Leaf Reading'],
    specialEffect: 'All crystals gain +10% divination power for duration',
  },
  {
    name: 'Comet Passing',
    description: 'A brilliant comet streaks across the heavens, bringing portents of great change.',
    accuracyBonus: 18, resourceBonus: 40, duration: 3, cooldown: 96,
    rarity: 'Rare',
    divinationMethods: ['Star Charting', 'Fire Scrying', 'Astrology'],
    specialEffect: 'Legendary prophecies have 10% higher chance of appearing',
  },
  {
    name: 'Supermoon',
    description: 'The moon appears larger and brighter than usual, amplifying water and emotional readings.',
    accuracyBonus: 15, resourceBonus: 28, duration: 8, cooldown: 48,
    rarity: 'Uncommon',
    divinationMethods: ['Water Divination', 'Dream Interpretation', 'Palm Reading'],
    specialEffect: 'Moonstone crystals gain double charge rate',
  },
  {
    name: 'Celestial Conjunction',
    description: 'Two or more celestial bodies appear to meet in the sky, creating a nexus of cosmic power.',
    accuracyBonus: 22, resourceBonus: 45, duration: 4, cooldown: 120,
    rarity: 'Rare',
    divinationMethods: ['Astrology', 'Star Charting', 'Rune Casting', 'Bone Throwing'],
    specialEffect: 'All prophecies in progress gain +1 progress automatically',
  },
];

// ============================================================
// RESOURCE DEFINITIONS
// ============================================================

export type ResourceType = 'stardust' | 'moonCrystals' | 'prophecyScrolls' | 'oracleEssence' | 'celestialCoins';

export interface Resources {
  stardust: number;
  moonCrystals: number;
  prophecyScrolls: number;
  oracleEssence: number;
  celestialCoins: number;
}

export const RESOURCE_META: Record<ResourceType, { label: string; description: string; icon: string }> = {
  stardust: {
    label: 'Stardust',
    description: 'Glowing cosmic dust harvested from celestial events. Used for guild upgrades and rituals.',
    icon: '✨',
  },
  moonCrystals: {
    label: 'Moon Crystals',
    description: 'Crystallized moonlight that powers divination tools and enhances crystal collections.',
    icon: '🌙',
  },
  prophecyScrolls: {
    label: 'Prophecy Scrolls',
    description: 'Enchanted scrolls that record and preserve prophecies. Required for advanced readings.',
    icon: '📜',
  },
  oracleEssence: {
    label: 'Oracle Essence',
    description: 'The distilled essence of prophetic power. Used to upgrade oracle abilities and stats.',
    icon: '🔮',
  },
  celestialCoins: {
    label: 'Celestial Coins',
    description: 'Currency of the divine realms. Used to purchase rare items, crystals, and services.',
    icon: '🪙',
  },
};

// ============================================================
// ACHIEVEMENT DEFINITIONS
// ============================================================

export type AchievementId =
  | 'first-reading'
  | 'prophecy-fulfilled'
  | 'crystal-collector'
  | 'guild-master'
  | 'master-diviner'
  | 'daily-streak-7'
  | 'daily-streak-30'
  | 'client-satisfaction'
  | 'tarot-master'
  | 'astral-witness'
  | 'legendary-prophecy'
  | 'rank-50'
  | 'all-methods'
  | 'resource-hoarder'
  | 'perfectionist';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  isUnlocked: boolean;
  progress: number;
  requiredProgress: number;
  reward: { xp: number; celestialCoins: number; stardust: number };
  category: 'divination' | 'collection' | 'progression' | 'social' | 'special';
  icon: string;
}

export const ACHIEVEMENT_TEMPLATES: Omit<Achievement, 'isUnlocked' | 'progress'>[] = [
  {
    id: 'first-reading', title: 'First Sight',
    description: 'Complete your first divination reading.',
    requiredProgress: 1,
    reward: { xp: 50, celestialCoins: 10, stardust: 20 },
    category: 'divination', icon: '👁️',
  },
  {
    id: 'prophecy-fulfilled', title: 'Prophecy Fulfilled',
    description: 'Fulfill 10 prophecies successfully.',
    requiredProgress: 10,
    reward: { xp: 500, celestialCoins: 100, stardust: 200 },
    category: 'divination', icon: '📜',
  },
  {
    id: 'crystal-collector', title: 'Crystal Collector',
    description: 'Collect all 15 crystal types.',
    requiredProgress: 15,
    reward: { xp: 800, celestialCoins: 200, stardust: 300 },
    category: 'collection', icon: '💎',
  },
  {
    id: 'guild-master', title: 'Guild Master',
    description: 'Upgrade all guild halls to at least level 5.',
    requiredProgress: 8,
    reward: { xp: 1000, celestialCoins: 250, stardust: 500 },
    category: 'progression', icon: '🏰',
  },
  {
    id: 'master-diviner', title: 'Master Diviner',
    description: 'Reach skill level 50 in any divination method.',
    requiredProgress: 50,
    reward: { xp: 600, celestialCoins: 150, stardust: 250 },
    category: 'divination', icon: '🌟',
  },
  {
    id: 'daily-streak-7', title: 'Week of Visions',
    description: 'Maintain a daily prophecy streak of 7 days.',
    requiredProgress: 7,
    reward: { xp: 350, celestialCoins: 75, stardust: 150 },
    category: 'progression', icon: '📅',
  },
  {
    id: 'daily-streak-30', title: 'Moon of Prophecies',
    description: 'Maintain a daily prophecy streak of 30 days.',
    requiredProgress: 30,
    reward: { xp: 2000, celestialCoins: 500, stardust: 1000 },
    category: 'progression', icon: '🌕',
  },
  {
    id: 'client-satisfaction', title: 'Beloved Oracle',
    description: 'Reach maximum satisfaction with 5 different clients.',
    requiredProgress: 5,
    reward: { xp: 700, celestialCoins: 180, stardust: 350 },
    category: 'social', icon: '💝',
  },
  {
    id: 'tarot-master', title: 'Tarot Master',
    description: 'Draw and interpret all 22 Major Arcana cards.',
    requiredProgress: 22,
    reward: { xp: 900, celestialCoins: 220, stardust: 400 },
    category: 'divination', icon: '🃏',
  },
  {
    id: 'astral-witness', title: 'Celestial Witness',
    description: 'Witness all 8 types of astral events.',
    requiredProgress: 8,
    reward: { xp: 1200, celestialCoins: 300, stardust: 600 },
    category: 'special', icon: '🌠',
  },
  {
    id: 'legendary-prophecy', title: 'Legendary Seer',
    description: 'Fulfill a legendary difficulty prophecy.',
    requiredProgress: 1,
    reward: { xp: 3000, celestialCoins: 750, stardust: 1500 },
    category: 'divination', icon: '👑',
  },
  {
    id: 'rank-50', title: 'Celestial Oracle',
    description: 'Reach Oracle Rank 50.',
    requiredProgress: 1,
    reward: { xp: 5000, celestialCoins: 1000, stardust: 2000 },
    category: 'progression', icon: '⭐',
  },
  {
    id: 'all-methods', title: 'Divine Polymath',
    description: 'Reach at least skill level 10 in all 12 divination methods.',
    requiredProgress: 12,
    reward: { xp: 1500, celestialCoins: 400, stardust: 800 },
    category: 'divination', icon: '🔮',
  },
  {
    id: 'resource-hoarder', title: 'Cosmic Hoarder',
    description: 'Accumulate 10,000 of any single resource.',
    requiredProgress: 10000,
    reward: { xp: 1000, celestialCoins: 250, stardust: 500 },
    category: 'collection', icon: '💰',
  },
  {
    id: 'perfectionist', title: 'The Perfect Oracle',
    description: 'Achieve 100% accuracy on 50 readings.',
    requiredProgress: 50,
    reward: { xp: 2500, celestialCoins: 600, stardust: 1200 },
    category: 'special', icon: '🏆',
  },
];

// ============================================================
// RANK TITLES
// ============================================================

export const RANK_TITLES: string[] = [
  'Uninitiated', 'Neophyte', 'Seeker', 'Dreamer', 'Reader',
  'Interpreter', 'Visionary', 'Prophet', 'Seer', 'Oracle',
  'High Oracle', 'Grand Oracle', 'Elder Oracle', 'Master Oracle', 'Sage Oracle',
  'Arcane Oracle', 'Divine Oracle', 'Ethereal Oracle', 'Transcendent Oracle', 'Celestial Oracle',
  'Cosmic Oracle', 'Universal Oracle', 'Infinite Oracle', 'Eternal Oracle', 'Primordial Oracle',
  'Void Oracle', 'Star Oracle', 'Moon Oracle', 'Sun Oracle', 'Dawn Oracle',
  'Dusk Oracle', 'Twilight Oracle', 'Midnight Oracle', 'Aurora Oracle', 'Nebula Oracle',
  'Galaxy Oracle', 'Dimensional Oracle', 'Temporal Oracle', 'Astral Oracle', 'Spirit Oracle',
  'Soul Oracle', 'Fate Oracle', 'Destiny Oracle', 'Karmic Oracle', 'Omega Oracle',
  'Alpha Oracle', 'Supreme Oracle',
];

// ============================================================
// STATE INTERFACE
// ============================================================

export interface OracleGuildState {
  // Core progression
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;

  // Current location
  currentHall: GuildHallName;

  // Oracle class
  oracleClass: OracleClassName;
  stats: OracleClassStats;
  statPoints: number;

  // Guild halls
  guildHalls: Record<GuildHallName, number>;

  // Divination methods
  divinationMethods: Record<DivinationMethodName, number>;
  totalReadings: number;
  accurateReadings: number;

  // Prophecies
  prophecies: Record<string, Prophecy>;
  fulfilledProphecies: number;
  failedProphecies: number;

  // Tarot
  tarotDeck: Record<TarotCardName, { drawn: boolean; timesDrawn: number }>;
  currentReading: TarotCardName[];
  readingsCompleted: number;

  // Clients
  clients: Record<ClientName, Client>;
  totalClientsServed: number;
  totalTipsEarned: number;

  // Crystals
  crystals: Record<CrystalName, Crystal>;

  // Astral events
  astralEvents: Record<AstralEventName, AstralEvent>;
  eventsWitnessed: number;

  // Resources
  resources: Resources;

  // Achievements
  achievements: Record<AchievementId, Achievement>;

  // Daily prophecy
  dailyProphecyCompleted: boolean;
  dailyProphecyDate: string;
  currentDailyProphecy: string | null;
  streak: number;
  bestStreak: number;
  lastDailyDate: string;

  // Statistics
  totalPlayTime: number;
  lastSaveTime: number;
  createdAt: number;
}

// ============================================================
// DEFAULT STATE
// ============================================================

function createDefaultCrystals(): Record<CrystalName, Crystal> {
  const crystals: Record<string, Crystal> = {};
  for (const tmpl of CRYSTAL_TEMPLATES) {
    crystals[tmpl.name] = {
      ...tmpl,
      currentCharge: 50,
      isClean: true,
      lastCleansed: Date.now(),
      lastCharged: Date.now(),
      owned: tmpl.rarity === 'Common',
      quantity: tmpl.rarity === 'Common' ? 1 : 0,
    };
  }
  return crystals as Record<CrystalName, Crystal>;
}

function createDefaultGuildHalls(): Record<GuildHallName, number> {
  const halls: Record<string, number> = {};
  for (const tmpl of GUILD_HALL_TEMPLATES) {
    halls[tmpl.name] = 1;
  }
  return halls as Record<GuildHallName, number>;
}

function createDefaultDivinationMethods(): Record<DivinationMethodName, number> {
  const methods: Record<string, number> = {};
  for (const method of DIVINATION_METHODS) {
    methods[method.name] = 0;
  }
  return methods as Record<DivinationMethodName, number>;
}

function createDefaultTarotDeck(): Record<TarotCardName, { drawn: boolean; timesDrawn: number }> {
  const deck: Record<string, { drawn: boolean; timesDrawn: number }> = {};
  for (const card of TAROT_DECK) {
    deck[card.name] = { drawn: false, timesDrawn: 0 };
  }
  return deck as Record<TarotCardName, { drawn: boolean; timesDrawn: number }>;
}

function createDefaultClients(): Record<ClientName, Client> {
  const clients: Record<string, Client> = {};
  for (const tmpl of CLIENT_TEMPLATES) {
    clients[tmpl.name] = { ...tmpl };
  }
  return clients as Record<ClientName, Client>;
}

function createDefaultAstralEvents(): Record<AstralEventName, AstralEvent> {
  const events: Record<string, AstralEvent> = {};
  for (const tmpl of ASTRAL_EVENT_TEMPLATES) {
    events[tmpl.name] = {
      ...tmpl,
      isActive: false,
      timeRemaining: 0,
      cooldownRemaining: 0,
    };
  }
  return events as Record<AstralEventName, AstralEvent>;
}

function createDefaultAchievements(): Record<AchievementId, Achievement> {
  const achievements: Record<string, Achievement> = {};
  for (const tmpl of ACHIEVEMENT_TEMPLATES) {
    achievements[tmpl.id] = {
      ...tmpl,
      isUnlocked: false,
      progress: 0,
    };
  }
  return achievements as Record<AchievementId, Achievement>;
}

const defaultState: OracleGuildState = {
  level: 1,
  xp: 0,
  xpToNext: 100,
  totalXp: 0,
  currentHall: 'Vision Chamber',
  oracleClass: 'Apprentice Seer',
  stats: { intuition: 5, wisdom: 3, arcana: 2, foresight: 1, charisma: 4 },
  statPoints: 0,
  guildHalls: createDefaultGuildHalls(),
  divinationMethods: createDefaultDivinationMethods(),
  totalReadings: 0,
  accurateReadings: 0,
  prophecies: {},
  fulfilledProphecies: 0,
  failedProphecies: 0,
  tarotDeck: createDefaultTarotDeck(),
  currentReading: [],
  readingsCompleted: 0,
  clients: createDefaultClients(),
  totalClientsServed: 0,
  totalTipsEarned: 0,
  crystals: createDefaultCrystals(),
  astralEvents: createDefaultAstralEvents(),
  eventsWitnessed: 0,
  resources: {
    stardust: 100,
    moonCrystals: 10,
    prophecyScrolls: 5,
    oracleEssence: 20,
    celestialCoins: 50,
  },
  achievements: createDefaultAchievements(),
  dailyProphecyCompleted: false,
  dailyProphecyDate: '',
  currentDailyProphecy: null,
  streak: 0,
  bestStreak: 0,
  lastDailyDate: '',
  totalPlayTime: 0,
  lastSaveTime: Date.now(),
  createdAt: Date.now(),
};

// ============================================================
// SAVE / LOAD
// ============================================================

function loadState(): OracleGuildState {
  try {
    const saved = localStorage.getItem(OG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as OracleGuildState;
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.warn('Oracle Guild: Failed to load state', e);
  }
  return { ...defaultState };
}

function saveState(state: OracleGuildState): void {
  try {
    localStorage.setItem(OG_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Oracle Guild: Failed to save state', e);
  }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateXpToNext(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function getRankForLevel(level: number): number {
  return Math.min(Math.max(level, 1), 50);
}

function getRankTitle(level: number): string {
  const idx = Math.min(Math.max(level - 1, 0), RANK_TITLES.length - 1);
  return RANK_TITLES[idx];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function calculateReadingAccuracy(
  methodName: DivinationMethodName,
  skillLevel: number,
  oracleClass: OracleClassName,
  hallLevel: number,
  activeEvent: AstralEvent | null,
  crystalPower: number,
): number {
  const method = DIVINATION_METHODS.find(m => m.name === methodName);
  if (!method) return 0;

  let accuracy = method.baseAccuracy + (skillLevel * 0.3);

  // Oracle class bonus
  const classIdx = ORACLE_CLASSES.findIndex(c => c.name === oracleClass);
  if (classIdx >= 0) {
    accuracy += classIdx * 2;
  }

  // Hall bonus
  accuracy += hallLevel * 2;

  // Astral event bonus
  if (activeEvent && activeEvent.isActive && activeEvent.divinationMethods.includes(methodName)) {
    accuracy += activeEvent.accuracyBonus;
  }

  // Crystal bonus
  accuracy += crystalPower * 0.1;

  return clamp(Math.floor(accuracy), 0, 100);
}

// ============================================================
// HOOK
// ============================================================

export default function useOracleGuild() {
  const [state, setState] = useState<OracleGuildState>(() => loadState());

  function updateState(partial: Partial<OracleGuildState>): void {
    setState(prev => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  }

  // ────────────────────────────────────────────────────────
  // LEVEL & XP
  // ────────────────────────────────────────────────────────

  function ogGetLevel(): number {
    return state.level;
  }

  function ogGetXp(): number {
    return state.xp;
  }

  function ogGetXpToNext(): number {
    return state.xpToNext;
  }

  function ogGetTotalXp(): number {
    return state.totalXp;
  }

  function ogAddXp(amount: number): void {
    let newLevel = state.level;
    let newXp = state.xp + amount;
    let newXpToNext = state.xpToNext;
    let newTotalXp = state.totalXp + amount;
    let newStatPoints = state.statPoints;

    while (newXp >= newXpToNext) {
      newXp -= newXpToNext;
      newLevel++;
      newXpToNext = calculateXpToNext(newLevel);
      newStatPoints += 2;
    }

    updateState({
      xp: newXp,
      level: newLevel,
      xpToNext: newXpToNext,
      totalXp: newTotalXp,
      statPoints: newStatPoints,
    });
  }

  function ogGetRank(): number {
    return getRankForLevel(state.level);
  }

  function ogGetRankTitle(): string {
    return getRankTitle(state.level);
  }

  // ────────────────────────────────────────────────────────
  // ORACLE CLASS
  // ────────────────────────────────────────────────────────

  function ogGetOracleClass(): OracleClassName {
    return state.oracleClass;
  }

  function ogSetOracleClass(className: OracleClassName): boolean {
    const classDef = ORACLE_CLASSES.find(c => c.name === className);
    if (!classDef) return false;
    if (state.level < classDef.requiredLevel) return false;
    if (state.totalXp < classDef.requiredXp) return false;

    updateState({
      oracleClass: className,
      stats: { ...classDef.baseStats },
    });
    return true;
  }

  function ogGetAvailableClasses(): OracleClassName[] {
    return ORACLE_CLASSES
      .filter(c => state.level >= c.requiredLevel && state.totalXp >= c.requiredXp)
      .map(c => c.name);
  }

  function ogGetAllClasses(): OracleClass[] {
    return ORACLE_CLASSES;
  }

  function ogGetClassInfo(className: OracleClassName): OracleClass | undefined {
    return ORACLE_CLASSES.find(c => c.name === className);
  }

  // ────────────────────────────────────────────────────────
  // STATS
  // ────────────────────────────────────────────────────────

  function ogGetStat(stat: keyof OracleClassStats): number {
    return state.stats[stat];
  }

  function ogGetAllStats(): OracleClassStats {
    return { ...state.stats };
  }

  function ogUpgradeStat(stat: keyof OracleClassStats): boolean {
    if (state.statPoints <= 0) return false;
    if (state.stats[stat] >= 100) return false;

    const newStats = { ...state.stats };
    newStats[stat] += 1;

    updateState({
      stats: newStats,
      statPoints: state.statPoints - 1,
    });
    return true;
  }

  function ogGetStatPoints(): number {
    return state.statPoints;
  }

  function ogGetTotalStatPoints(): number {
    return state.stats.intuition + state.stats.wisdom + state.stats.arcana + state.stats.foresight + state.stats.charisma;
  }

  // ────────────────────────────────────────────────────────
  // GUILD HALLS
  // ────────────────────────────────────────────────────────

  function ogGetCurrentHall(): GuildHallName {
    return state.currentHall;
  }

  function ogSetCurrentHall(hallName: GuildHallName): void {
    if (state.guildHalls[hallName] !== undefined) {
      updateState({ currentHall: hallName });
    }
  }

  function ogGetHallLevel(hallName: GuildHallName): number {
    return state.guildHalls[hallName] || 1;
  }

  function ogGetAllHalls(): Record<GuildHallName, number> {
    return { ...state.guildHalls };
  }

  function ogGetHallTemplate(hallName: GuildHallName) {
    return GUILD_HALL_TEMPLATES.find(h => h.name === hallName);
  }

  function ogGetHallUpgradeCost(hallName: GuildHallName): GuildHallUpgradeCost {
    const template = GUILD_HALL_TEMPLATES.find(h => h.name === hallName);
    if (!template) return { stardust: 0, moonCrystals: 0, celestialCoins: 0 };

    const currentLevel = state.guildHalls[hallName] || 1;
    const multiplier = Math.pow(1.5, currentLevel - 1);

    return {
      stardust: Math.floor(template.upgradeCost.stardust * multiplier),
      moonCrystals: Math.floor(template.upgradeCost.moonCrystals * multiplier),
      celestialCoins: Math.floor(template.upgradeCost.celestialCoins * multiplier),
    };
  }

  function ogUpgradeHall(hallName: GuildHallName): boolean {
    const template = GUILD_HALL_TEMPLATES.find(h => h.name === hallName);
    if (!template) return false;

    const currentLevel = state.guildHalls[hallName] || 1;
    if (currentLevel >= template.maxLevel) return false;

    const cost = ogGetHallUpgradeCost(hallName);
    if (state.resources.stardust < cost.stardust) return false;
    if (state.resources.moonCrystals < cost.moonCrystals) return false;
    if (state.resources.celestialCoins < cost.celestialCoins) return false;

    const newHalls = { ...state.guildHalls };
    newHalls[hallName] = currentLevel + 1;

    updateState({
      guildHalls: newHalls,
      resources: {
        ...state.resources,
        stardust: state.resources.stardust - cost.stardust,
        moonCrystals: state.resources.moonCrystals - cost.moonCrystals,
        celestialCoins: state.resources.celestialCoins - cost.celestialCoins,
      },
    });
    return true;
  }

  function ogGetHallBonus(hallName: GuildHallName): number {
    const level = state.guildHalls[hallName] || 1;
    return (level - 1) * 5;
  }

  // ────────────────────────────────────────────────────────
  // DIVINATION METHODS
  // ────────────────────────────────────────────────────────

  function ogGetDivinationMethodSkill(methodName: DivinationMethodName): number {
    return state.divinationMethods[methodName] || 0;
  }

  function ogGetAllDivinationSkills(): Record<DivinationMethodName, number> {
    return { ...state.divinationMethods };
  }

  function ogPracticeMethod(methodName: DivinationMethodName, success: boolean): void {
    const method = DIVINATION_METHODS.find(m => m.name === methodName);
    if (!method) return;

    const currentSkill = state.divinationMethods[methodName] || 0;
    const xpGain = success ? method.xpPerUse : Math.floor(method.xpPerUse * 0.3);
    const newSkill = Math.min(currentSkill + xpGain, method.maxSkillLevel);

    const newMethods = { ...state.divinationMethods };
    newMethods[methodName] = newSkill;

    const newTotalReadings = state.totalReadings + 1;
    const newAccurateReadings = success ? state.accurateReadings + 1 : state.accurateReadings;

    updateState({
      divinationMethods: newMethods,
      totalReadings: newTotalReadings,
      accurateReadings: newAccurateReadings,
    });

    // Check achievements
    if (newTotalReadings >= 1) {
      ogUpdateAchievementProgress('first-reading', 1);
    }
  }

  function ogGetMethodAccuracy(methodName: DivinationMethodName): number {
    const skillLevel = state.divinationMethods[methodName] || 0;
    const activeEvent = ogGetActiveEvent();
    const hallLevel = ogGetHallLevel(DIVINATION_METHODS.find(m => m.name === methodName)?.bestHall || 'Vision Chamber');
    const crystalPower = ogGetBestCrystalPower(methodName);

    return calculateReadingAccuracy(
      methodName,
      skillLevel,
      state.oracleClass,
      hallLevel,
      activeEvent,
      crystalPower,
    );
  }

  function ogGetBestMethod(): DivinationMethodName {
    let bestMethod: DivinationMethodName = 'Tarot Reading';
    let bestSkill = 0;

    for (const [name, skill] of Object.entries(state.divinationMethods)) {
      if (skill > bestSkill) {
        bestSkill = skill;
        bestMethod = name as DivinationMethodName;
      }
    }

    return bestMethod;
  }

  function ogGetMethodsAtLevel(minLevel: number): DivinationMethodName[] {
    return Object.entries(state.divinationMethods)
      .filter(([, skill]) => skill >= minLevel)
      .map(([name]) => name as DivinationMethodName);
  }

  function ogGetTotalReadings(): number {
    return state.totalReadings;
  }

  function ogGetAccuracyRate(): number {
    if (state.totalReadings === 0) return 0;
    return Math.floor((state.accurateReadings / state.totalReadings) * 100);
  }

  // ────────────────────────────────────────────────────────
  // PROPHECIES
  // ────────────────────────────────────────────────────────

  function ogGetProphecies(): Record<string, Prophecy> {
    return { ...state.prophecies };
  }

  function ogGetProphecy(id: string): Prophecy | undefined {
    return state.prophecies[id];
  }

  function ogGetActiveProphecies(): Prophecy[] {
    return Object.values(state.prophecies).filter(
      p => p.status === 'active' || p.status === 'in_progress'
    );
  }

  function ogGetFulfilledProphecies(): Prophecy[] {
    return Object.values(state.prophecies).filter(p => p.status === 'fulfilled');
  }

  function ogAcceptProphecy(id: string): boolean {
    const template = PROPHECY_TEMPLATES.find(p => p.id === id);
    if (!template) return false;
    if (state.level < template.minLevel) return false;
    if (state.prophecies[id]) return false;

    const prophecy: Prophecy = {
      ...template,
      status: 'active',
      progress: 0,
      timeRemaining: template.timeLimit,
    };

    const newProphecies = { ...state.prophecies };
    newProphecies[id] = prophecy;

    updateState({ prophecies: newProphecies });
    return true;
  }

  function ogAdvanceProphecy(id: string, amount: number): boolean {
    const prophecy = state.prophecies[id];
    if (!prophecy) return false;
    if (prophecy.status !== 'active' && prophecy.status !== 'in_progress') return false;

    const newProgress = Math.min(prophecy.progress + amount, prophecy.requiredProgress);
    const newStatus: ProphecyStatus = newProgress >= prophecy.requiredProgress ? 'in_progress' : 'in_progress';
    const statusToUse = newProgress >= prophecy.requiredProgress ? 'in_progress' : newStatus;

    const newProphecies = { ...state.prophecies };
    newProphecies[id] = {
      ...prophecy,
      progress: newProgress,
      status: statusToUse,
    };

    updateState({ prophecies: newProphecies });
    return true;
  }

  function ogCompleteProphecy(id: string): boolean {
    const prophecy = state.prophecies[id];
    if (!prophecy) return false;
    if (prophecy.status !== 'in_progress') return false;
    if (prophecy.progress < prophecy.requiredProgress) return false;

    const newProphecies = { ...state.prophecies };
    newProphecies[id] = { ...prophecy, status: 'fulfilled' };

    updateState({
      prophecies: newProphecies,
      fulfilledProphecies: state.fulfilledProphecies + 1,
      resources: {
        stardust: state.resources.stardust + prophecy.reward.stardust,
        moonCrystals: state.resources.moonCrystals + prophecy.reward.moonCrystals,
        prophecyScrolls: state.resources.prophecyScrolls + prophecy.reward.prophecyScrolls,
        oracleEssence: state.resources.oracleEssence + prophecy.reward.oracleEssence,
        celestialCoins: state.resources.celestialCoins + prophecy.reward.celestialCoins,
      },
    });

    ogAddXp(prophecy.reward.xp);

    if (prophecy.difficulty === 'Legendary') {
      ogUpdateAchievementProgress('legendary-prophecy', 1);
    }

    ogUpdateAchievementProgress('prophecy-fulfilled', 1);
    return true;
  }

  function ogFailProphecy(id: string): boolean {
    const prophecy = state.prophecies[id];
    if (!prophecy) return false;
    if (prophecy.status !== 'active' && prophecy.status !== 'in_progress') return false;

    const newProphecies = { ...state.prophecies };
    newProphecies[id] = { ...prophecy, status: 'failed' };

    updateState({
      prophecies: newProphecies,
      failedProphecies: state.failedProphecies + 1,
    });
    return true;
  }

  function ogGetProphecyProgress(id: string): number {
    const prophecy = state.prophecies[id];
    if (!prophecy) return 0;
    if (prophecy.requiredProgress === 0) return 100;
    return Math.floor((prophecy.progress / prophecy.requiredProgress) * 100);
  }

  function ogGetAvailableProphecies(): typeof PROPHECY_TEMPLATES {
    return PROPHECY_TEMPLATES.filter(t => {
      if (state.level < t.minLevel) return false;
      if (state.prophecies[t.id]) return false;
      const activeCount = Object.values(state.prophecies).filter(
        p => p.status === 'active' || p.status === 'in_progress'
      ).length;
      return activeCount < 5;
    });
  }

  function ogGetFulfilledProphecyCount(): number {
    return state.fulfilledProphecies;
  }

  function ogGetFailedProphecyCount(): number {
    return state.failedProphecies;
  }

  // ────────────────────────────────────────────────────────
  // TAROT
  // ────────────────────────────────────────────────────────

  function ogGetTarotDeck(): Record<TarotCardName, { drawn: boolean; timesDrawn: number }> {
    return { ...state.tarotDeck };
  }

  function ogGetTarotCard(cardName: TarotCardName): TarotCard | undefined {
    return TAROT_DECK.find(c => c.name === cardName);
  }

  function ogDrawTarot(): TarotCardName {
    const available = TAROT_DECK.filter(c => state.tarotDeck[c.name].timesDrawn < 10);
    const pool = available.length > 0 ? available : TAROT_DECK;

    const randomIndex = Math.floor(Math.random() * pool.length);
    const card = pool[randomIndex];

    const newDeck = { ...state.tarotDeck };
    newDeck[card.name] = {
      drawn: true,
      timesDrawn: state.tarotDeck[card.name].timesDrawn + 1,
    };

    const newReading = [...state.currentReading, card.name];

    updateState({
      tarotDeck: newDeck,
      currentReading: newReading,
    });

    // Check tarot master achievement
    const uniqueDrawn = Object.values(newDeck).filter(c => c.drawn).length;
    ogUpdateAchievementProgress('tarot-master', uniqueDrawn);

    return card.name;
  }

  function ogDrawMultipleTarot(count: number): TarotCardName[] {
    const cards: TarotCardName[] = [];
    for (let i = 0; i < count; i++) {
      cards.push(ogDrawTarot());
    }
    return cards;
  }

  function ogGetCurrentReading(): TarotCardName[] {
    return [...state.currentReading];
  }

  function ogClearReading(): void {
    updateState({ currentReading: [] });
  }

  function ogGetReadingInterpretation(): string {
    if (state.currentReading.length === 0) return 'Draw cards to begin your reading.';

    const interpretations: string[] = [];

    for (const cardName of state.currentReading) {
      const card = TAROT_DECK.find(c => c.name === cardName);
      if (!card) continue;

      const isReversed = Math.random() > 0.6;
      interpretations.push(
        `${card.name}${isReversed ? ' (Reversed)' : ''}: ${isReversed ? card.reversed : card.upright}`
      );
    }

    if (interpretations.length >= 2) {
      const firstCard = TAROT_DECK.find(c => c.name === state.currentReading[0]);
      const secondCard = TAROT_DECK.find(c => c.name === state.currentReading[1]);
      if (firstCard && secondCard) {
        interpretations.push(`\n✨ Combination Insight: ${firstCard.combinationBonus}`);
      }
    }

    return interpretations.join('\n');
  }

  function ogGetReadingsCompleted(): number {
    return state.readingsCompleted;
  }

  function ogCompleteReading(): void {
    updateState({
      currentReading: [],
      readingsCompleted: state.readingsCompleted + 1,
    });
  }

  function ogGetUniqueCardsDrawn(): number {
    return Object.values(state.tarotDeck).filter(c => c.drawn).length;
  }

  function ogGetTarotPower(): number {
    let totalPower = 0;
    for (const cardName of state.currentReading) {
      const card = TAROT_DECK.find(c => c.name === cardName);
      if (card) totalPower += card.power;
    }
    return totalPower;
  }

  // ────────────────────────────────────────────────────────
  // CLIENTS
  // ────────────────────────────────────────────────────────

  function ogGetClients(): Record<ClientName, Client> {
    return { ...state.clients };
  }

  function ogGetClient(clientName: ClientName): Client | undefined {
    return state.clients[clientName];
  }

  function ogGetAvailableClients(): Client[] {
    return Object.values(state.clients).filter(c => c.isAvailable);
  }

  function ogAcceptClient(clientName: ClientName): boolean {
    const client = state.clients[clientName];
    if (!client || !client.isAvailable) return false;

    const newClients = { ...state.clients };
    newClients[clientName] = {
      ...client,
      isAvailable: false,
      lastVisitTime: Date.now(),
      visitsCount: client.visitsCount + 1,
    };

    updateState({ clients: newClients });
    return true;
  }

  function ogCompleteClient(clientName: ClientName, accuracy: number): number {
    const client = state.clients[clientName];
    if (!client) return 0;

    const satisfactionChange = Math.floor((accuracy - 50) * 0.5);
    const newSatisfaction = clamp(client.satisfactionRating + satisfactionChange, 0, client.maxSatisfaction);
    const tipMultiplier = newSatisfaction / 100;
    const tip = Math.floor(client.baseTip * tipMultiplier * (1 + accuracy / 100));

    const newClients = { ...state.clients };
    newClients[clientName] = {
      ...client,
      satisfactionRating: newSatisfaction,
      isAvailable: true,
    };

    updateState({
      clients: newClients,
      totalClientsServed: state.totalClientsServed + 1,
      totalTipsEarned: state.totalTipsEarned + tip,
      resources: {
        ...state.resources,
        celestialCoins: state.resources.celestialCoins + tip,
      },
    });

    // Check client satisfaction achievement
    if (newSatisfaction >= 100) {
      const maxClients = Object.values(newClients).filter(c => c.satisfactionRating >= c.maxSatisfaction).length;
      ogUpdateAchievementProgress('client-satisfaction', maxClients);
    }

    return tip;
  }

  function ogRejectClient(clientName: ClientName): void {
    const client = state.clients[clientName];
    if (!client) return;

    const newClients = { ...state.clients };
    newClients[clientName] = {
      ...client,
      satisfactionRating: Math.max(0, client.satisfactionRating - 10),
      isAvailable: true,
    };

    updateState({ clients: newClients });
  }

  function ogGetClientSatisfaction(clientName: ClientName): number {
    return state.clients[clientName]?.satisfactionRating || 0;
  }

  function ogGetTotalTipsEarned(): number {
    return state.totalTipsEarned;
  }

  function ogGetTotalClientsServed(): number {
    return state.totalClientsServed;
  }

  function ogGetMaxSatisfactionClients(): ClientName[] {
    return Object.entries(state.clients)
      .filter(([, c]) => c.satisfactionRating >= c.maxSatisfaction)
      .map(([name]) => name as ClientName);
  }

  // ────────────────────────────────────────────────────────
  // CRYSTALS
  // ────────────────────────────────────────────────────────

  function ogGetCrystals(): Record<CrystalName, Crystal> {
    return { ...state.crystals };
  }

  function ogGetCrystal(crystalName: CrystalName): Crystal | undefined {
    return state.crystals[crystalName];
  }

  function ogGetOwnedCrystals(): Crystal[] {
    return Object.values(state.crystals).filter(c => c.owned && c.quantity > 0);
  }

  function ogAddCrystal(crystalName: CrystalName, quantity: number): void {
    const crystal = state.crystals[crystalName];
    if (!crystal) return;

    const newCrystals = { ...state.crystals };
    newCrystals[crystalName] = {
      ...crystal,
      owned: true,
      quantity: crystal.quantity + quantity,
    };

    updateState({ crystals: newCrystals });

    const uniqueOwned = Object.values(newCrystals).filter(c => c.owned).length;
    ogUpdateAchievementProgress('crystal-collector', uniqueOwned);
  }

  function ogCleanseCrystal(crystalName: CrystalName): boolean {
    const crystal = state.crystals[crystalName];
    if (!crystal || !crystal.owned) return false;

    const newCrystals = { ...state.crystals };
    newCrystals[crystalName] = {
      ...crystal,
      isClean: true,
      lastCleansed: Date.now(),
    };

    updateState({ crystals: newCrystals });
    return true;
  }

  function ogChargeCrystal(crystalName: CrystalName): boolean {
    const crystal = state.crystals[crystalName];
    if (!crystal || !crystal.owned) return false;

    const newCharge = Math.min(crystal.currentCharge + 25, crystal.maxCharge);

    const newCrystals = { ...state.crystals };
    newCrystals[crystalName] = {
      ...crystal,
      currentCharge: newCharge,
      lastCharged: Date.now(),
    };

    updateState({ crystals: newCrystals });
    return true;
  }

  function ogGetCrystalPower(crystalName: CrystalName): number {
    const crystal = state.crystals[crystalName];
    if (!crystal || !crystal.owned) return 0;

    const chargeRatio = crystal.currentCharge / crystal.maxCharge;
    const cleanlinessBonus = crystal.isClean ? 1.2 : 0.8;
    return Math.floor(crystal.divinationPower * chargeRatio * cleanlinessBonus);
  }

  function ogGetBestCrystalPower(methodName: DivinationMethodName): number {
    const method = DIVINATION_METHODS.find(m => m.name === methodName);
    if (!method) return 0;

    const affinityCrystal = state.crystals[method.crystalAffinity as CrystalName];
    if (affinityCrystal && affinityCrystal.owned) {
      return ogGetCrystalPower(method.crystalAffinity as CrystalName);
    }

    let bestPower = 0;
    for (const crystal of Object.values(state.crystals)) {
      if (crystal.owned) {
        const power = ogGetCrystalPower(crystal.name);
        if (power > bestPower) bestPower = power;
      }
    }

    return bestPower;
  }

  function ogGetCrystalCount(): number {
    return Object.values(state.crystals).filter(c => c.owned).length;
  }

  function ogIsCrystalClean(crystalName: CrystalName): boolean {
    return state.crystals[crystalName]?.isClean || false;
  }

  function ogGetCrystalCharge(crystalName: CrystalName): number {
    return state.crystals[crystalName]?.currentCharge || 0;
  }

  // ────────────────────────────────────────────────────────
  // ASTRAL EVENTS
  // ────────────────────────────────────────────────────────

  function ogGetAstralEvents(): Record<AstralEventName, AstralEvent> {
    return { ...state.astralEvents };
  }

  function ogGetActiveEvent(): AstralEvent | null {
    for (const event of Object.values(state.astralEvents)) {
      if (event.isActive) return event;
    }
    return null;
  }

  function ogGetEventBonus(methodName: DivinationMethodName): number {
    const activeEvent = ogGetActiveEvent();
    if (!activeEvent) return 0;
    if (!activeEvent.divinationMethods.includes(methodName)) return 0;
    return activeEvent.accuracyBonus;
  }

  function ogActivateEvent(eventName: AstralEventName): boolean {
    const event = state.astralEvents[eventName];
    if (!event) return false;
    if (event.isActive) return false;
    if (event.cooldownRemaining > 0) return false;

    const template = ASTRAL_EVENT_TEMPLATES.find(e => e.name === eventName);
    if (!template) return false;

    const newEvents = { ...state.astralEvents };
    newEvents[eventName] = {
      ...event,
      isActive: true,
      timeRemaining: template.duration,
    };

    const newEventsWitnessed = state.eventsWitnessed + 1;

    updateState({
      astralEvents: newEvents,
      eventsWitnessed: newEventsWitnessed,
    });

    ogUpdateAchievementProgress('astral-witness', newEventsWitnessed);
    return true;
  }

  function ogDeactivateEvent(eventName: AstralEventName): void {
    const event = state.astralEvents[eventName];
    if (!event || !event.isActive) return;

    const template = ASTRAL_EVENT_TEMPLATES.find(e => e.name === eventName);

    const newEvents = { ...state.astralEvents };
    newEvents[eventName] = {
      ...event,
      isActive: false,
      timeRemaining: 0,
      cooldownRemaining: template?.cooldown || 24,
    };

    updateState({ astralEvents: newEvents });
  }

  function ogGetEventsWitnessed(): number {
    return state.eventsWitnessed;
  }

  // ────────────────────────────────────────────────────────
  // RESOURCES
  // ────────────────────────────────────────────────────────

  function ogGetResources(): Resources {
    return { ...state.resources };
  }

  function ogGetResource(type: ResourceType): number {
    return state.resources[type];
  }

  function ogAddResource(type: ResourceType, amount: number): void {
    const newResources = { ...state.resources };
    newResources[type] = Math.max(0, newResources[type] + amount);
    updateState({ resources: newResources });

    // Check resource hoarder achievement
    if (newResources[type] >= 10000) {
      ogUpdateAchievementProgress('resource-hoarder', newResources[type]);
    }
  }

  function ogSpendResource(type: ResourceType, amount: number): boolean {
    if (state.resources[type] < amount) return false;

    const newResources = { ...state.resources };
    newResources[type] -= amount;
    updateState({ resources: newResources });
    return true;
  }

  function ogCanAfford(cost: Partial<Resources>): boolean {
    for (const [key, value] of Object.entries(cost)) {
      if (value !== undefined && state.resources[key as ResourceType] < value) {
        return false;
      }
    }
    return true;
  }

  function ogGetResourceMeta(type: ResourceType) {
    return RESOURCE_META[type];
  }

  function ogGetTotalResourceValue(): number {
    return (
      state.resources.stardust +
      state.resources.moonCrystals * 5 +
      state.resources.prophecyScrolls * 10 +
      state.resources.oracleEssence * 15 +
      state.resources.celestialCoins * 2
    );
  }

  // ────────────────────────────────────────────────────────
  // ACHIEVEMENTS
  // ────────────────────────────────────────────────────────

  function ogGetAchievements(): Record<AchievementId, Achievement> {
    return { ...state.achievements };
  }

  function ogGetAchievement(id: AchievementId): Achievement | undefined {
    return state.achievements[id];
  }

  function ogIsAchievementUnlocked(id: AchievementId): boolean {
    return state.achievements[id]?.isUnlocked || false;
  }

  function ogGetUnlockedAchievements(): Achievement[] {
    return Object.values(state.achievements).filter(a => a.isUnlocked);
  }

  function ogGetLockedAchievements(): Achievement[] {
    return Object.values(state.achievements).filter(a => !a.isUnlocked);
  }

  function ogGetAchievementProgress(id: AchievementId): number {
    const achievement = state.achievements[id];
    if (!achievement) return 0;
    if (achievement.requiredProgress === 0) return 100;
    return Math.floor((achievement.progress / achievement.requiredProgress) * 100);
  }

  function ogUpdateAchievementProgress(id: AchievementId, progress: number): boolean {
    const achievement = state.achievements[id];
    if (!achievement) return false;
    if (achievement.isUnlocked) return false;

    const newProgress = Math.max(achievement.progress, progress);

    if (newProgress >= achievement.requiredProgress) {
      const newAchievements = { ...state.achievements };
      newAchievements[id] = {
        ...achievement,
        progress: achievement.requiredProgress,
        isUnlocked: true,
      };

      updateState({
        achievements: newAchievements,
        resources: {
          ...state.resources,
          stardust: state.resources.stardust + achievement.reward.stardust,
          celestialCoins: state.resources.celestialCoins + achievement.reward.celestialCoins,
        },
      });

      ogAddXp(achievement.reward.xp);
      return true;
    }

    const newAchievements = { ...state.achievements };
    newAchievements[id] = { ...achievement, progress: newProgress };
    updateState({ achievements: newAchievements });
    return false;
  }

  function ogGetUnlockedCount(): number {
    return Object.values(state.achievements).filter(a => a.isUnlocked).length;
  }

  function ogGetTotalAchievementCount(): number {
    return Object.keys(state.achievements).length;
  }

  // ────────────────────────────────────────────────────────
  // DAILY PROPHECY
  // ────────────────────────────────────────────────────────

  function ogIsDailyComplete(): boolean {
    const today = getTodayString();
    return state.dailyProphecyDate === today && state.dailyProphecyCompleted;
  }

  function ogGetStreak(): number {
    const today = getTodayString();
    if (state.lastDailyDate !== today && state.lastDailyDate !== '') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (state.lastDailyDate !== yesterdayStr) {
        return 0;
      }
    }
    return state.streak;
  }

  function ogGetBestStreak(): number {
    return state.bestStreak;
  }

  function ogGetStreakBonus(): number {
    const streak = ogGetStreak();
    if (streak < 3) return 1.0;
    if (streak < 7) return 1.25;
    if (streak < 14) return 1.5;
    if (streak < 30) return 2.0;
    return 3.0;
  }

  function ogCompleteDailyProphecy(accuracy: number): { xpGained: number; resourcesGained: Resources } {
    const today = getTodayString();
    const isConsecutive = state.lastDailyDate === getYesterdayString();
    const newStreak = isConsecutive ? state.streak + 1 : 1;
    const bonus = newStreak < 3 ? 1.0 : newStreak < 7 ? 1.25 : newStreak < 14 ? 1.5 : newStreak < 30 ? 2.0 : 3.0;

    const baseXp = 50 + Math.floor(accuracy * 0.5);
    const xpGained = Math.floor(baseXp * bonus);

    const resourcesGained: Resources = {
      stardust: Math.floor(20 * bonus),
      moonCrystals: Math.floor(3 * bonus),
      prophecyScrolls: 1,
      oracleEssence: Math.floor(5 * bonus),
      celestialCoins: Math.floor(10 * bonus),
    };

    const newBestStreak = Math.max(newStreak, state.bestStreak);

    updateState({
      dailyProphecyCompleted: true,
      dailyProphecyDate: today,
      streak: newStreak,
      bestStreak: newBestStreak,
      lastDailyDate: today,
      resources: {
        stardust: state.resources.stardust + resourcesGained.stardust,
        moonCrystals: state.resources.moonCrystals + resourcesGained.moonCrystals,
        prophecyScrolls: state.resources.prophecyScrolls + resourcesGained.prophecyScrolls,
        oracleEssence: state.resources.oracleEssence + resourcesGained.oracleEssence,
        celestialCoins: state.resources.celestialCoins + resourcesGained.celestialCoins,
      },
    });

    ogAddXp(xpGained);

    if (newStreak >= 7) ogUpdateAchievementProgress('daily-streak-7', newStreak);
    if (newStreak >= 30) ogUpdateAchievementProgress('daily-streak-30', newStreak);

    return { xpGained, resourcesGained };
  }

  function getYesterdayString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  // ────────────────────────────────────────────────────────
  // STATISTICS & META
  // ────────────────────────────────────────────────────────

  function ogGetTotalPlayTime(): number {
    return state.totalPlayTime;
  }

  function ogGetLastSaveTime(): number {
    return state.lastSaveTime;
  }

  function ogGetCreatedAt(): number {
    return state.createdAt;
  }

  function ogGetDaysSinceCreation(): number {
    const now = new Date();
    const created = new Date(state.createdAt);
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  // ────────────────────────────────────────────────────────
  // RESET & EXPORT
  // ────────────────────────────────────────────────────────

  function ogResetState(): void {
    const fresh = { ...defaultState };
    setState(fresh);
    saveState(fresh);
  }

  function ogExportState(): string {
    return JSON.stringify(state, null, 2);
  }

  function ogImportState(json: string): boolean {
    try {
      const parsed = JSON.parse(json) as OracleGuildState;
      setState(parsed);
      saveState(parsed);
      return true;
    } catch (e) {
      console.warn('Oracle Guild: Failed to import state', e);
      return false;
    }
  }

  function ogForceSave(): void {
    saveState(state);
  }

  // ────────────────────────────────────────────────────────
  // UTILITY / COMPUTED
  // ────────────────────────────────────────────────────────

  function ogGetOverallPower(): number {
    const statTotal = state.stats.intuition + state.stats.wisdom + state.stats.arcana + state.stats.foresight + state.stats.charisma;
    const classBonus = ORACLE_CLASSES.findIndex(c => c.name === state.oracleClass) * 10;
    const hallBonus = Object.values(state.guildHalls).reduce((sum, level) => sum + level, 0);
    const crystalBonus = Object.values(state.crystals).filter(c => c.owned).length * 5;
    const methodBonus = Object.values(state.divinationMethods).reduce((sum, skill) => sum + Math.floor(skill / 10), 0);

    return statTotal + classBonus + hallBonus + crystalBonus + methodBonus;
  }

  function ogGetGuildReputation(): string {
    const power = ogGetOverallPower();
    if (power < 50) return 'Unknown';
    if (power < 100) return 'Locally Known';
    if (power < 200) return 'Regionally Respected';
    if (power < 350) return 'Kingdom Renowned';
    if (power < 500) return 'Continental Fame';
    if (power < 750) return 'World Famous';
    if (power < 1000) return 'Legendary';
    return 'Mythical';
  }

  function ogGetMasteryLevel(): string {
    const avgSkill = Object.values(state.divinationMethods).reduce((s, v) => s + v, 0) / 12;
    if (avgSkill < 10) return 'Novice';
    if (avgSkill < 25) return 'Apprentice';
    if (avgSkill < 50) return 'Adept';
    if (avgSkill < 75) return 'Expert';
    if (avgSkill < 90) return 'Master';
    return 'Grandmaster';
  }

  function ogGetOracleTitle(): string {
    return `${ogGetRankTitle()} ${state.oracleClass}`;
  }

  function ogGetFormattedTitle(): string {
    const rank = ogGetRankTitle();
    const cls = state.oracleClass;
    const reputation = ogGetGuildReputation();
    return `${cls} — Rank ${state.level} (${rank}) — ${reputation}`;
  }

  function ogGetDivinationInsightLevel(): number {
    const classBonus = ORACLE_CLASSES.findIndex(c => c.name === state.oracleClass) * 5;
    const statBonus = Math.floor((state.stats.intuition + state.stats.wisdom) / 4);
    const skillBonus = Math.floor(ogGetOverallPower() / 20);
    return classBonus + statBonus + skillBonus;
  }

  function ogGetBestHall(): { name: GuildHallName; level: number } {
    let best: { name: GuildHallName; level: number } = { name: 'Vision Chamber', level: 1 };
    for (const [name, level] of Object.entries(state.guildHalls)) {
      if (level > best.level) {
        best = { name: name as GuildHallName, level };
      }
    }
    return best;
  }

  function ogGetMostUsedMethod(): DivinationMethodName | null {
    const readingCounts: Record<string, number> = {};
    for (const method of DIVINATION_METHODS) {
      readingCounts[method.name] = Math.floor(state.divinationMethods[method.name] / method.xpPerUse);
    }

    let best: string | null = null;
    let bestCount = 0;
    for (const [name, count] of Object.entries(readingCounts)) {
      if (count > bestCount) {
        bestCount = count;
        best = name;
      }
    }
    return best as DivinationMethodName | null;
  }

  // ────────────────────────────────────────────────────────
  // ADDITIONAL GAMEPLAY
  // ────────────────────────────────────────────────────────

  function ogPerformDivination(methodName: DivinationMethodName): {
    success: boolean;
    accuracy: number;
    xpGained: number;
    resourcesGained: Resources;
    insight: string;
  } {
    const method = DIVINATION_METHODS.find(m => m.name === methodName);
    if (!method) {
      return { success: false, accuracy: 0, xpGained: 0, resourcesGained: { stardust: 0, moonCrystals: 0, prophecyScrolls: 0, oracleEssence: 0, celestialCoins: 0 }, insight: 'Unknown divination method.' };
    }

    const accuracy = ogGetMethodAccuracy(methodName);
    const roll = Math.random() * 100;
    const success = roll < accuracy;

    const baseXp = method.xpPerUse;
    const bonusMultiplier = ogGetStreakBonus();
    const xpGained = Math.floor(baseXp * (success ? 1 : 0.3) * bonusMultiplier);

    const baseStardust = success ? 10 : 2;
    const baseMoonCrystals = success ? 2 : 0;
    const resourcesGained: Resources = {
      stardust: Math.floor(baseStardust * bonusMultiplier),
      moonCrystals: Math.floor(baseMoonCrystals * bonusMultiplier),
      prophecyScrolls: 0,
      oracleEssence: success ? 3 : 0,
      celestialCoins: success ? 5 : 1,
    };

    const insights: Record<string, string[]> = {
      'Tarot Reading': [
        'The cards reveal a path shrouded in mist, yet a guiding light flickers ahead.',
        'The Major Arcana speak of transformation and rebirth.',
        'A surprising alliance is foretold in the near future.',
      ],
      'Crystal Gazing': [
        'The crystal shows a distant shore bathed in golden light.',
        'Shapes form within the crystal — a warning of impending change.',
        'The depths of the crystal reveal a forgotten truth.',
      ],
      'Star Charting': [
        'The stars align to reveal a favorable conjunction for new ventures.',
        'A distant star pulses with unusual brightness — an omen of great events.',
        'The constellations whisper of a journey across vast distances.',
      ],
      'Dream Interpretation': [
        'The recurring dream speaks of a locked door that is about to open.',
        'In the dreamscape, a bridge of light connects two separated realms.',
        'The dream symbols indicate a hidden talent waiting to be discovered.',
      ],
      'Rune Casting': [
        'The runes fall in the pattern of the Wanderer — change is imminent.',
        'An ancient rune glows with power, revealing a forgotten contract.',
        'The rune of Protection appears prominently — beware of false friends.',
      ],
      'Tea Leaf Reading': [
        'The leaves form the shape of a key — an important discovery awaits.',
        'A heart shape appears in the cup — love is on the horizon.',
        'The leaves settle in a spiral pattern — a cycle is completing.',
      ],
      'Fire Scrying': [
        'The flames dance high, revealing a figure cloaked in starlight.',
        'Deep within the fire, ancient symbols burn with renewed meaning.',
        'The fire shifts from orange to blue — a cold truth approaches.',
      ],
      'Water Divination': [
        'The pool ripples with images of a great ship on calm waters.',
        'A face forms in the water — someone from the past will return.',
        'The water turns mirror-smooth, reflecting a possible future.',
      ],
      'Bone Throwing': [
        'The bones arrange themselves in a perfect circle — completion is near.',
        'Ancestor spirits speak through the bones, warning of a betrayal.',
        'The bones point in four directions — a crossroads decision looms.',
      ],
      'Aura Reading': [
        'A brilliant golden aura surrounds the subject — success and joy.',
        'Shifting colors reveal inner conflict between desire and duty.',
        'A rare violet aura appears — great spiritual growth is possible.',
      ],
      'Palm Reading': [
        'The life line shows a long and fulfilling journey.',
        'A new line has appeared — unexpected fortune is coming.',
        'The heart line crosses the fate line — destiny and love intertwine.',
      ],
      'Astrology': [
        'The planetary alignment suggests a time of great opportunity.',
        'Mercury retrograde warns of communication challenges ahead.',
        'Jupiter\'s influence brings expansion and abundance to all endeavors.',
      ],
    };

    const methodInsights = insights[methodName] || ['The vision is unclear... try again.'];
    const insight = methodInsights[Math.floor(Math.random() * methodInsights.length)];

    ogPracticeMethod(methodName, success);
    ogAddXp(xpGained);

    const newResources = { ...state.resources };
    newResources.stardust += resourcesGained.stardust;
    newResources.moonCrystals += resourcesGained.moonCrystals;
    newResources.oracleEssence += resourcesGained.oracleEssence;
    newResources.celestialCoins += resourcesGained.celestialCoins;
    updateState({ resources: newResources });

    if (accuracy >= 100) {
      ogUpdateAchievementProgress('perfectionist', state.accurateReadings + 1);
    }

    return { success, accuracy, xpGained, resourcesGained, insight };
  }

  function ogGetSummary(): {
    level: number;
    rank: string;
    oracleClass: string;
    overallPower: number;
    reputation: string;
    totalReadings: number;
    accuracyRate: number;
    fulfilledProphecies: number;
    crystalsOwned: number;
    achievements: number;
    streak: number;
    totalClientsServed: number;
  } {
    return {
      level: state.level,
      rank: ogGetRankTitle(),
      oracleClass: state.oracleClass,
      overallPower: ogGetOverallPower(),
      reputation: ogGetGuildReputation(),
      totalReadings: state.totalReadings,
      accuracyRate: ogGetAccuracyRate(),
      fulfilledProphecies: state.fulfilledProphecies,
      crystalsOwned: ogGetCrystalCount(),
      achievements: ogGetUnlockedCount(),
      streak: ogGetStreak(),
      totalClientsServed: state.totalClientsServed,
    };
  }

  // ────────────────────────────────────────────────────────
  // RETURN ALL EXPORTED FUNCTIONS
  // ────────────────────────────────────────────────────────

  return {
    state,

    // Level & XP
    ogGetLevel,
    ogGetXp,
    ogGetXpToNext,
    ogGetTotalXp,
    ogAddXp,
    ogGetRank,
    ogGetRankTitle,

    // Oracle Class
    ogGetOracleClass,
    ogSetOracleClass,
    ogGetAvailableClasses,
    ogGetAllClasses,
    ogGetClassInfo,

    // Stats
    ogGetStat,
    ogGetAllStats,
    ogUpgradeStat,
    ogGetStatPoints,
    ogGetTotalStatPoints,

    // Guild Halls
    ogGetCurrentHall,
    ogSetCurrentHall,
    ogGetHallLevel,
    ogGetAllHalls,
    ogGetHallTemplate,
    ogGetHallUpgradeCost,
    ogUpgradeHall,
    ogGetHallBonus,

    // Divination Methods
    ogGetDivinationMethodSkill,
    ogGetAllDivinationSkills,
    ogPracticeMethod,
    ogGetMethodAccuracy,
    ogGetBestMethod,
    ogGetMethodsAtLevel,
    ogGetTotalReadings,
    ogGetAccuracyRate,

    // Prophecies
    ogGetProphecies,
    ogGetProphecy,
    ogGetActiveProphecies,
    ogGetFulfilledProphecies,
    ogAcceptProphecy,
    ogAdvanceProphecy,
    ogCompleteProphecy,
    ogFailProphecy,
    ogGetProphecyProgress,
    ogGetAvailableProphecies,
    ogGetFulfilledProphecyCount,
    ogGetFailedProphecyCount,

    // Tarot
    ogGetTarotDeck,
    ogGetTarotCard,
    ogDrawTarot,
    ogDrawMultipleTarot,
    ogGetCurrentReading,
    ogClearReading,
    ogGetReadingInterpretation,
    ogGetReadingsCompleted,
    ogCompleteReading,
    ogGetUniqueCardsDrawn,
    ogGetTarotPower,

    // Clients
    ogGetClients,
    ogGetClient,
    ogGetAvailableClients,
    ogAcceptClient,
    ogCompleteClient,
    ogRejectClient,
    ogGetClientSatisfaction,
    ogGetTotalTipsEarned,
    ogGetTotalClientsServed,
    ogGetMaxSatisfactionClients,

    // Crystals
    ogGetCrystals,
    ogGetCrystal,
    ogGetOwnedCrystals,
    ogAddCrystal,
    ogCleanseCrystal,
    ogChargeCrystal,
    ogGetCrystalPower,
    ogGetBestCrystalPower,
    ogGetCrystalCount,
    ogIsCrystalClean,
    ogGetCrystalCharge,

    // Astral Events
    ogGetAstralEvents,
    ogGetActiveEvent,
    ogGetEventBonus,
    ogActivateEvent,
    ogDeactivateEvent,
    ogGetEventsWitnessed,

    // Resources
    ogGetResources,
    ogGetResource,
    ogAddResource,
    ogSpendResource,
    ogCanAfford,
    ogGetResourceMeta,
    ogGetTotalResourceValue,

    // Achievements
    ogGetAchievements,
    ogGetAchievement,
    ogIsAchievementUnlocked,
    ogGetUnlockedAchievements,
    ogGetLockedAchievements,
    ogGetAchievementProgress,
    ogUpdateAchievementProgress,
    ogGetUnlockedCount,
    ogGetTotalAchievementCount,

    // Daily Prophecy
    ogIsDailyComplete,
    ogGetStreak,
    ogGetBestStreak,
    ogGetStreakBonus,
    ogCompleteDailyProphecy,

    // Statistics
    ogGetTotalPlayTime,
    ogGetLastSaveTime,
    ogGetCreatedAt,
    ogGetDaysSinceCreation,

    // Reset & Export
    ogResetState,
    ogExportState,
    ogImportState,
    ogForceSave,

    // Utility / Computed
    ogGetOverallPower,
    ogGetGuildReputation,
    ogGetMasteryLevel,
    ogGetOracleTitle,
    ogGetFormattedTitle,
    ogGetDivinationInsightLevel,
    ogGetBestHall,
    ogGetMostUsedMethod,

    // Gameplay
    ogPerformDivination,
    ogGetSummary,
  };
}
