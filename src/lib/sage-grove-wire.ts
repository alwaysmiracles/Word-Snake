// =============================================================================
// sage-grove-wire.ts — Sage Grove (智者树丛) Game Module
// An ancient wisdom-themed grove management system for the Word Snake game.
// Recruit legendary sages, collect wisdom scrolls, build sacred structures,
// discover powerful relics, and meditate to unlock ancient knowledge across
// seven paths of wisdom in eight sacred groves.
// =============================================================================

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type SGRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type SGPath =
  | 'philosophy'
  | 'astrology'
  | 'alchemy'
  | 'healing'
  | 'runecraft'
  | 'divination'
  | 'elementalism';

export interface SGSageDef {
  id: string;
  name: string;
  rarity: SGRarity;
  path: SGPath;
  wisdomPower: number;
  description: string;
}

export interface SGGroveDef {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  capacity: number;
  meditationBonus: number;
}

export interface SGScrollDef {
  id: string;
  name: string;
  rarity: SGRarity;
  path: SGPath | 'universal';
  wisdomGranted: number;
  description: string;
}

export interface SGStructureDef {
  id: string;
  name: string;
  category: string;
  maxLevel: number;
  baseCost: number;
  description: string;
  bonusPerLevel: string;
}

export interface SGAbilityDef {
  id: string;
  name: string;
  path: SGPath | 'universal';
  description: string;
  cooldown: number;
  power: number;
  requiredLevel: number;
}

export interface SGAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardExp: number;
  rewardWisdom: number;
}

export interface SGTitleDef {
  id: string;
  name: string;
  levelRequired: number;
  description: string;
}

export interface SGRelicDef {
  id: string;
  name: string;
  rarity: SGRarity;
  description: string;
  power: number;
  path: SGPath | 'universal';
  bonusType: string;
}

export interface SGEventDef {
  id: string;
  name: string;
  description: string;
  duration: number;
  rewardWisdom: number;
  rewardRelicChance: number;
  requiredLevel: number;
}

export interface SGSageInstance {
  instanceId: string;
  defId: string;
  groveId: string;
  recruitedAt: number;
  bondStrength: number;
  meditationsPerformed: number;
}

export interface SGStructureInstance {
  instanceId: string;
  defId: string;
  groveId: string;
  level: number;
  builtAt: number;
}

export interface SGScrollInstance {
  scrollId: string;
  collectedAt: number;
  studied: boolean;
  studiedAt: number | null;
}

export interface SGRelicInstance {
  relicId: string;
  foundAt: number;
  equipped: boolean;
  activationCount: number;
}

export interface SGEventInstance {
  eventId: string | null;
  startTime: number | null;
  endTime: number | null;
  progress: number;
  rewardClaimed: boolean;
}

export interface SGState {
  groves: { defId: string; unlocked: boolean; sanctity: number }[];
  recruitedSages: SGSageInstance[];
  collectedScrolls: SGScrollInstance[];
  structures: SGStructureInstance[];
  ownedRelics: SGRelicInstance[];
  unlockedAbilities: string[];
  achievements: string[];
  currentTitle: string;
  wisdomLevel: number;
  wisdomExp: number;
  wisdomPoints: number;
  totalMeditations: number;
  totalSagesRecruited: number;
  totalScrollsStudied: number;
  totalStructuresBuilt: number;
  totalRelicsFound: number;
  activeEvent: SGEventInstance;
  lastMeditationAt: number | null;
}

export interface SGActions {
  sgRecruitSage: (sageDefId: string, groveId: string) => boolean;
  sgCollectScroll: (scrollDefId: string) => boolean;
  sgStudyScroll: (scrollDefId: string) => number;
  sgBuildStructure: (structDefId: string, groveId: string) => boolean;
  sgUpgradeStructure: (instanceId: string) => boolean;
  sgMeditate: (sageInstanceId: string) => number;
  sgFindRelic: (relicDefId: string) => boolean;
  sgEquipRelic: (relicDefId: string) => boolean;
  sgUnequipRelic: (relicDefId: string) => boolean;
  sgUnlockAbility: (abilityDefId: string) => boolean;
  sgActivateAbility: (abilityDefId: string) => boolean;
  sgClaimAchievement: (achievementDefId: string) => boolean;
  sgSetTitle: (titleId: string) => boolean;
  sgUnlockGrove: (groveDefId: string) => boolean;
  sgPurifyGrove: (groveDefId: string, amount: number) => number;
  sgStartEvent: (eventDefId: string) => boolean;
  sgAdvanceEvent: (amount: number) => boolean;
  sgClaimEventReward: () => boolean;
}

export type SGStore = SGState & SGActions;

// =============================================================================
// Color Constants (8 colors)
// =============================================================================

export const SG_COLOR_SAGE_GREEN: string = '#87AE73';
export const SG_COLOR_PARCHMENT: string = '#F5F5DC';
export const SG_COLOR_WISDOM_GOLD: string = '#DAA520';
export const SG_COLOR_ANCIENT_OAK: string = '#8B4513';
export const SG_COLOR_MYSTIC_PURPLE: string = '#6A0DAD';
export const SG_COLOR_SKY_BLUE: string = '#87CEEB';
export const SG_COLOR_MOONSTONE_SILVER: string = '#C0C0C0';
export const SG_COLOR_EARTH_BROWN: string = '#5C4033';

// =============================================================================
// Synergy Tables
// =============================================================================

export const SG_PATH_LABELS: Record<SGPath, string> = {
  philosophy: 'Philosophy',
  astrology: 'Astrology',
  alchemy: 'Alchemy',
  healing: 'Healing',
  runecraft: 'Runecraft',
  divination: 'Divination',
  elementalism: 'Elementalism',
};

export const SG_RARITY_LABELS: Record<SGRarity, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const SG_PATH_GROVE_SYNERGY: Record<SGPath, string[]> = {
  philosophy: ['grove_whispering_canopy', 'grove_elder_oak_circle', 'grove_world_tree_shrine'],
  astrology: ['grove_stargazing_meadow', 'grove_celestial_pavilion', 'grove_world_tree_shrine'],
  alchemy: ['grove_herbal_garden', 'grove_crystal_cavern', 'grove_world_tree_shrine'],
  healing: ['grove_herbal_garden', 'grove_moss_grotto', 'grove_ancient_spring'],
  runecraft: ['grove_rune_stone_circle', 'grove_crystal_cavern', 'grove_world_tree_shrine'],
  divination: ['grove_mist_enclave', 'grove_stargazing_meadow', 'grove_celestial_pavilion'],
  elementalism: ['grove_crystal_cavern', 'grove_ancient_spring', 'grove_rune_stone_circle'],
};

export const SG_RARITY_MULTIPLIER: Record<SGRarity, number> = {
  common: 1,
  uncommon: 1.5,
  rare: 2.5,
  epic: 4,
  legendary: 7,
};

export const SG_RARITY_COLORS: Record<SGRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: '#FBBF24',
};

export const SG_PATH_COLORS: Record<SGPath, string> = {
  philosophy: '#DAA520',
  astrology: '#87CEEB',
  alchemy: '#FF6B35',
  healing: '#87AE73',
  runecraft: '#6A0DAD',
  divination: '#C0C0C0',
  elementalism: '#5C4033',
};

export const SG_PATH_ICONS: Record<SGPath, string> = {
  philosophy: '🧠',
  astrology: '🔭',
  alchemy: '⚗️',
  healing: '🌿',
  runecraft: 'ᚱ',
  divination: '🔮',
  elementalism: '🌀',
};

export const SG_RARITY_ORDER: SGRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export const SG_PATH_ORDER: SGPath[] = [
  'philosophy',
  'astrology',
  'alchemy',
  'healing',
  'runecraft',
  'divination',
  'elementalism',
];

export const SG_RECRUIT_COST_BASE: Record<SGRarity, number> = {
  common: 30,
  uncommon: 45,
  rare: 75,
  epic: 120,
  legendary: 210,
};

export const SG_SCROLL_STUDY_TIME: Record<SGRarity, number> = {
  common: 30,
  uncommon: 60,
  rare: 120,
  epic: 300,
  legendary: 600,
};

export const SG_ABILITY_UNLOCK_COST: Record<SGRarity, number> = {
  common: 25,
  uncommon: 38,
  rare: 63,
  epic: 100,
  legendary: 175,
};

export const SG_PATH_ABILITY_MAP: Record<SGPath, string[]> = {
  philosophy: ['ability_wisdom_bolt', 'ability_paradox_shield', 'ability_enlightenment_wave'],
  astrology: ['ability_starfall', 'ability_constellation_weave', 'ability_celestial_align'],
  alchemy: ['ability_elixir_brew', 'ability_transmute_burst', 'ability_philosopher_stone'],
  healing: ['ability_herbal_heal', 'ability_aura_mend', 'ability_world_heal'],
  runecraft: ['ability_rune_carve', 'ability_runic_chain', 'ability_runic_storm'],
  divination: ['ability_foresight', 'ability_prophecy', 'ability_fates_reveal'],
  elementalism: ['ability_elemental_bolt', 'ability_elemental_shield', 'ability_primal_convergence'],
};

export const SG_UNIVERSAL_ABILITIES: string[] = ['ability_grove_awakening'];

export const SG_STRUCTURE_CATEGORIES: { key: string; label: string; icon: string }[] = [
  { key: 'meditation', label: 'Meditation', icon: '🧘' },
  { key: 'library', label: 'Library', icon: '📚' },
  { key: 'garden', label: 'Garden', icon: '🌱' },
  { key: 'observatory', label: 'Observatory', icon: '🔭' },
  { key: 'special', label: 'Special', icon: '✨' },
];

// =============================================================================
// SG_GROVES — 8 Sacred Groves
// =============================================================================

export const SG_GROVES: SGGroveDef[] = [
  {
    id: 'grove_whispering_canopy',
    name: 'Whispering Canopy',
    description: 'A serene forest clearing where ancient trees murmur forgotten philosophical truths. Sages have gathered here for millennia to debate the nature of existence beneath gently swaying branches.',
    unlockLevel: 1,
    capacity: 6,
    meditationBonus: 1.0,
  },
  {
    id: 'grove_herbal_garden',
    name: 'Herbal Garden',
    description: 'A lush garden of medicinal and mystical herbs tended by healing sages since the dawn of civilization. Every plant here contains centuries of accumulated restorative power.',
    unlockLevel: 3,
    capacity: 7,
    meditationBonus: 1.1,
  },
  {
    id: 'grove_stargazing_meadow',
    name: 'Stargazing Meadow',
    description: 'An open meadow on a hilltop where astrologers chart the movements of celestial bodies. The stars here burn brighter than anywhere else, revealing cosmic patterns invisible elsewhere.',
    unlockLevel: 6,
    capacity: 7,
    meditationBonus: 1.15,
  },
  {
    id: 'grove_moss_grotto',
    name: 'Moss Grotto',
    description: 'A hidden cave draped in bioluminescent moss where healing waters pool in natural stone basins. The air here is thick with restorative mist that mends body and spirit.',
    unlockLevel: 10,
    capacity: 8,
    meditationBonus: 1.2,
  },
  {
    id: 'grove_rune_stone_circle',
    name: 'Rune Stone Circle',
    description: 'A ring of towering standing stones etched with ancient runes that glow with arcane power. Runecarvers come here to inscribe new symbols and decipher the oldest markings.',
    unlockLevel: 15,
    capacity: 8,
    meditationBonus: 1.25,
  },
  {
    id: 'grove_crystal_cavern',
    name: 'Crystal Cavern',
    description: 'A vast underground cavern filled with naturally growing crystals of every color. Alchemists and elementalists harness the raw magical energy flowing through these crystalline formations.',
    unlockLevel: 22,
    capacity: 9,
    meditationBonus: 1.3,
  },
  {
    id: 'grove_mist_enclave',
    name: 'Mist Enclave',
    description: 'A perpetually fog-shrouded valley where the veil between the mortal and spirit realms is thinnest. Diviners come here to receive prophecies and commune with otherworldly entities.',
    unlockLevel: 30,
    capacity: 10,
    meditationBonus: 1.4,
  },
  {
    id: 'grove_world_tree_shrine',
    name: 'World Tree Shrine',
    description: 'The most sacred grove, built around a sapling of the legendary World Tree. This nexus of all seven wisdom paths radiates power that amplifies meditation and unlocks the deepest secrets of the universe.',
    unlockLevel: 40,
    capacity: 12,
    meditationBonus: 1.6,
  },
];

// =============================================================================
// SG_SAGES — 35 Ancient Sages (7 per rarity tier, 1 per path)
// =============================================================================

export const SG_SAGES: SGSageDef[] = [
  // ---- Common (7, one per path) ----
  {
    id: 'sage_common_philosophy',
    name: 'Elder Bramble',
    rarity: 'common',
    path: 'philosophy',
    wisdomPower: 8,
    description: 'A weathered philosopher who finds profound meaning in the simplest things. His teachings emphasize that true wisdom begins with admitting ignorance.',
  },
  {
    id: 'sage_common_astrology',
    name: 'Stargazer Lira',
    rarity: 'common',
    path: 'astrology',
    wisdomPower: 8,
    description: 'A patient sky-watcher who can predict the weather by reading cloud formations and star positions. She teaches that we are all made of starlight.',
  },
  {
    id: 'sage_common_alchemy',
    name: 'Apprentice Thorne',
    rarity: 'common',
    path: 'alchemy',
    wisdomPower: 7,
    description: 'A young alchemist with a knack for transmuting base metals into modest alloys. His enthusiasm for experimentation sometimes leads to unexpected discoveries.',
  },
  {
    id: 'sage_common_healing',
    name: 'Herbalist Wren',
    rarity: 'common',
    path: 'healing',
    wisdomPower: 9,
    description: 'A gentle healer who knows every medicinal plant within a day\'s walk. Her remedies are simple but remarkably effective, passed down through generations.',
  },
  {
    id: 'sage_common_runecraft',
    name: 'Scribe Oakhaven',
    rarity: 'common',
    path: 'runecraft',
    wisdomPower: 7,
    description: 'A meticulous rune scribe who can inscribe basic protective wards on stones and wood. His carvings glow faintly with stored defensive energy.',
  },
  {
    id: 'sage_common_divination',
    name: 'Seer Mossheart',
    rarity: 'common',
    path: 'divination',
    wisdomPower: 8,
    description: 'A hedge diviner who reads tea leaves, cloud shapes, and bird flight patterns to glean glimpses of the immediate future with surprising accuracy.',
  },
  {
    id: 'sage_common_elementalism',
    name: 'Spark Ashwood',
    rarity: 'common',
    path: 'elementalism',
    wisdomPower: 7,
    description: 'A novice elementalist who can kindle small flames and stir gentle breezes. She believes the elements speak to those who listen carefully.',
  },
  // ---- Uncommon (7, one per path) ----
  {
    id: 'sage_uncommon_philosophy',
    name: 'Scholar Halcyon',
    rarity: 'uncommon',
    path: 'philosophy',
    wisdomPower: 18,
    description: 'A renowned debater whose philosophical treatises have influenced entire kingdoms. He teaches that the unexamined life is not worth living, and examines everything relentlessly.',
  },
  {
    id: 'sage_uncommon_astrology',
    name: 'Astrologer Vesper',
    rarity: 'uncommon',
    path: 'astrology',
    wisdomPower: 20,
    description: 'A skilled celestial navigator who maps constellations and predicts eclipses months in advance. Her star charts are used by sailors and scholars across the land.',
  },
  {
    id: 'sage_uncommon_alchemy',
    name: 'Alchemist Quicksilver',
    rarity: 'uncommon',
    path: 'alchemy',
    wisdomPower: 17,
    description: 'A charismatic alchemist who has perfected the art of extracting essences from rare minerals. His elixirs enhance cognitive abilities and physical resilience.',
  },
  {
    id: 'sage_uncommon_healing',
    name: 'Mender Sylvana',
    rarity: 'uncommon',
    path: 'healing',
    wisdomPower: 19,
    description: 'A dedicated healer who can knit broken bones and cure virulent poisons using only natural remedies. Her reputation as a miracle worker draws patients from distant lands.',
  },
  {
    id: 'sage_uncommon_runecraft',
    name: 'Runesmith Gareth',
    rarity: 'uncommon',
    path: 'runecraft',
    wisdomPower: 18,
    description: 'A master runecarver whose inscribed weapons and armor carry potent enchantments. Each rune he carves is a small poem of power written in the language of creation.',
  },
  {
    id: 'sage_uncommon_divination',
    name: 'Oracle Nighthollow',
    rarity: 'uncommon',
    path: 'divination',
    wisdomPower: 20,
    description: 'A gifted oracle who sees prophetic visions in dreams and reflective surfaces. Her predictions, while sometimes cryptic, have never been proven wrong.',
  },
  {
    id: 'sage_uncommon_elementalism',
    name: 'Elementalist Cinderveil',
    rarity: 'uncommon',
    path: 'elementalism',
    wisdomPower: 17,
    description: 'A confident elementalist who commands fire and water with equal fluency. Her dual mastery of opposing elements represents perfect internal balance.',
  },
  // ---- Rare (7, one per path) ----
  {
    id: 'sage_rare_philosophy',
    name: 'Sage Athenel',
    rarity: 'rare',
    path: 'philosophy',
    wisdomPower: 40,
    description: 'An ascetic philosopher who has meditated in solitude for fifty years, achieving enlightenment through radical self-denial. His words carry weight that moves mountains.',
  },
  {
    id: 'sage_rare_astrology',
    name: 'Starweaver Cassiopeia',
    rarity: 'rare',
    path: 'astrology',
    wisdomPower: 42,
    description: 'A celestial mage who can draw power directly from starlight, weaving constellations into tangible magical threads that manipulate fate itself.',
  },
  {
    id: 'sage_rare_alchemy',
    name: 'Grand Alchemist Mordecai',
    rarity: 'rare',
    path: 'alchemy',
    wisdomPower: 38,
    description: 'A legendary alchemist who claims to have discovered the philosopher\'s stone but refuses to share its location, believing humanity is not yet ready.',
  },
  {
    id: 'sage_rare_healing',
    name: 'Lifeweaver Seraphina',
    rarity: 'rare',
    path: 'healing',
    wisdomPower: 41,
    description: 'A miraculous healer whose touch can regenerate lost limbs and reverse the effects of aging, albeit temporarily. She channels the life force of the earth itself.',
  },
  {
    id: 'sage_rare_runecraft',
    name: 'Rune Lord Thorgar',
    rarity: 'rare',
    path: 'runecraft',
    wisdomPower: 39,
    description: 'A warrior-scholar whose runic inscriptions can summon elemental storms and create impenetrable barriers. His runic language predates all known civilizations.',
  },
  {
    id: 'sage_rare_divination',
    name: 'Prophetess Lunara',
    rarity: 'rare',
    path: 'divination',
    wisdomPower: 43,
    description: 'A blind seer whose inner sight pierces the fabric of time itself. She perceives past, present, and future simultaneously, though she speaks of them all in riddles.',
  },
  {
    id: 'sage_rare_elementalism',
    name: 'Stormcaller Zephyros',
    rarity: 'rare',
    path: 'elementalism',
    wisdomPower: 40,
    description: 'A tempestuous elementalist who has tamed the primal fury of storms. Lightning obeys his command, and winds carry his voice across continents.',
  },
  // ---- Epic (7, one per path) ----
  {
    id: 'sage_epic_philosophy',
    name: 'Archon Sophos',
    rarity: 'epic',
    path: 'philosophy',
    wisdomPower: 90,
    description: 'An ancient being who embodies pure thought. Archon Sophos exists simultaneously in every library in the world, absorbing knowledge from every book ever written.',
  },
  {
    id: 'sage_epic_astrology',
    name: 'Celestial Arbiter Orion',
    rarity: 'epic',
    path: 'astrology',
    wisdomPower: 95,
    description: 'A being of living starlight who has walked among the constellations. Orion can rearrange stars to alter destiny and has personally named three nebulae.',
  },
  {
    id: 'sage_epic_alchemy',
    name: 'Transmuter Primus Aurelius',
    rarity: 'epic',
    path: 'alchemy',
    wisdomPower: 88,
    description: 'The supreme alchemist who has achieved the impossible: converting abstract concepts into physical substances. He bottles courage, distills wisdom, and crystallizes hope.',
  },
  {
    id: 'sage_epic_healing',
    name: 'Sacred Mender Yggdrasilla',
    rarity: 'epic',
    path: 'healing',
    wisdomPower: 92,
    description: 'A healer so powerful she can cure curses, lift enchantments, and restore life to recently fallen creatures. She draws her power directly from the World Tree\'s roots.',
  },
  {
    id: 'sage_epic_runecraft',
    name: 'Elder Runic Master Khazmar',
    rarity: 'epic',
    path: 'runecraft',
    wisdomPower: 87,
    description: 'The oldest runecrafter alive, whose original runes have become the foundation of all written magic. He can read the rune-code embedded in reality itself.',
  },
  {
    id: 'sage_epic_divination',
    name: 'Fatespinner Moirael',
    rarity: 'epic',
    path: 'divination',
    wisdomPower: 93,
    description: 'A weaver of destiny who sees all possible futures and gently nudges events toward the most beneficial outcome. She claims free will is her favorite illusion.',
  },
  {
    id: 'sage_epic_elementalism',
    name: 'Primordial Sage Terragaia',
    rarity: 'epic',
    path: 'elementalism',
    wisdomPower: 91,
    description: 'A being born from the collision of all four classical elements, Terragaia embodies the raw creative and destructive power of nature in perfect equilibrium.',
  },
  // ---- Legendary (7, one per path) ----
  {
    id: 'sage_legendary_philosophy',
    name: 'The Cosmic Thinker Aletheia',
    rarity: 'legendary',
    path: 'philosophy',
    wisdomPower: 200,
    description: 'A being who has contemplated the meaning of existence since before the universe began. Aletheia holds the answer to every question but speaks only in paradoxes that enlighten.',
  },
  {
    id: 'sage_legendary_astrology',
    name: 'Starforge Astraeus',
    rarity: 'legendary',
    path: 'astrology',
    wisdomPower: 220,
    description: 'The celestial blacksmith who forged the stars themselves. Astraeus can extinguish suns and ignite new ones, rewriting the cosmic map with each hammer strike.',
  },
  {
    id: 'sage_legendary_alchemy',
    name: 'The Philosopher Hermesia',
    rarity: 'legendary',
    path: 'alchemy',
    wisdomPower: 210,
    description: 'The immortal alchemist who discovered the true philosopher\'s stone and achieved perfect balance between all elements. She can transmute thought into reality.',
  },
  {
    id: 'sage_legendary_healing',
    name: 'World Healer Gaiantha',
    rarity: 'legendary',
    path: 'healing',
    wisdomPower: 215,
    description: 'A being whose mere presence heals all wounds and cures all ailments within a mile. Gaiantha is the living embodiment of the earth\'s regenerative will.',
  },
  {
    id: 'sage_legendary_runecraft',
    name: 'The First Scribe Odina',
    rarity: 'legendary',
    path: 'runecraft',
    wisdomPower: 205,
    description: 'The original runecrafter who invented the first rune at the dawn of creation. Odina\'s runes are embedded in the fabric of reality, maintaining the laws of physics.',
  },
  {
    id: 'sage_legendary_divination',
    name: 'Omniscient Seer Theia',
    rarity: 'legendary',
    path: 'divination',
    wisdomPower: 225,
    description: 'The all-seeing oracle who perceives every timeline simultaneously. Theia knows the beginning and end of all things and chooses to share only what mortals can bear.',
  },
  {
    id: 'sage_legendary_elementalism',
    name: 'Elemental Sovereign Pyronos',
    rarity: 'legendary',
    path: 'elementalism',
    wisdomPower: 218,
    description: 'The supreme master of all elements who commands fire, water, earth, and air as extensions of his own will. Pyronos once single-handedly prevented a planetary cataclysm.',
  },
];

// =============================================================================
// SG_SCROLLS — 30 Wisdom Scrolls & Teachings
// =============================================================================

export const SG_SCROLLS: SGScrollDef[] = [
  // Philosophy scrolls (5)
  { id: 'scroll_phil_basics', name: 'Meditations on Stillness', rarity: 'common', path: 'philosophy', wisdomGranted: 10, description: 'A primer on achieving mental clarity through silent contemplation and breath control techniques.' },
  { id: 'scroll_phil_dialectic', name: 'The Dialectic Method', rarity: 'uncommon', path: 'philosophy', wisdomGranted: 25, description: 'An advanced treatise on structured debate and logical reasoning that sharpens the analytical mind.' },
  { id: 'scroll_phil_existence', name: 'Treatise on Existence', rarity: 'rare', path: 'philosophy', wisdomGranted: 50, description: 'A profound exploration of the nature of being, consciousness, and the meaning of a life well-lived.' },
  { id: 'scroll_phil_cosmos', name: 'The Cosmic Philosophy', rarity: 'epic', path: 'philosophy', wisdomGranted: 100, description: 'A mind-expanding work that connects philosophical inquiry to the fundamental structure of the universe.' },
  { id: 'scroll_phil_ultimate', name: 'The Final Truth', rarity: 'legendary', path: 'philosophy', wisdomGranted: 250, description: 'The last philosophical text one ever needs to read — it contains the singular insight that unlocks all others.' },
  // Astrology scrolls (5)
  { id: 'scroll_ast_constellations', name: 'Star Chart Primer', rarity: 'common', path: 'astrology', wisdomGranted: 10, description: 'Basic identification guide for the twelve major constellations and their seasonal movements.' },
  { id: 'scroll_ast_eclipses', name: 'Eclipse Prophecy', rarity: 'uncommon', path: 'astrology', wisdomGranted: 28, description: 'A detailed record of eclipse patterns and the cosmic events they portend across centuries.' },
  { id: 'scroll_ast_celestial', name: 'Celestial Mechanics', rarity: 'rare', path: 'astrology', wisdomGranted: 55, description: 'An advanced text on the mathematical relationships between planets, stars, and magical energy flows.' },
  { id: 'scroll_ast_nexus', name: 'Astral Nexus Codex', rarity: 'epic', path: 'astrology', wisdomGranted: 110, description: 'A codex describing the nexus points where stellar and planetary energies intersect with the mortal realm.' },
  { id: 'scroll_ast_cosmic', name: 'Cosmic Omniscience', rarity: 'legendary', path: 'astrology', wisdomGranted: 260, description: 'The ultimate astrological text that maps every star in existence and reveals the hidden architecture of the cosmos.' },
  // Alchemy scrolls (5)
  { id: 'scroll_alc_herbs', name: 'Herbal Compendium', rarity: 'common', path: 'alchemy', wisdomGranted: 8, description: 'A comprehensive guide to identifying and preparing common magical herbs for basic transmutations.' },
  { id: 'scroll_alc_elixirs', name: 'Elixir Recipes', rarity: 'uncommon', path: 'alchemy', wisdomGranted: 22, description: 'A collection of twenty-seven elixir recipes ranging from healing tonics to wisdom-enhancing draughts.' },
  { id: 'scroll_alc_transmutation', name: 'Art of Transmutation', rarity: 'rare', path: 'alchemy', wisdomGranted: 48, description: 'Master-class instructions on converting base materials into refined substances through controlled magical reactions.' },
  { id: 'scroll_alc_philosopher', name: 'Philosopher\'s Formula', rarity: 'epic', path: 'alchemy', wisdomGranted: 95, description: 'A fragmentary text containing partial instructions for creating the legendary philosopher\'s stone.' },
  { id: 'scroll_alc_perfection', name: 'The Perfect Equation', rarity: 'legendary', path: 'alchemy', wisdomGranted: 240, description: 'The complete alchemical equation that balances all elements perfectly, granting the power to reshape matter itself.' },
  // Healing scrolls (5)
  { id: 'scroll_heal_salves', name: 'Basic Salve Guide', rarity: 'common', path: 'healing', wisdomGranted: 12, description: 'Step-by-step instructions for preparing salves from common herbs that accelerate natural healing processes.' },
  { id: 'scroll_heal_auras', name: 'Aura Mending', rarity: 'uncommon', path: 'healing', wisdomGranted: 30, description: 'Teachings on perceiving and repairing damage to the body\'s natural energy field, the aura.' },
  { id: 'scroll_heal_restoration', name: 'Grand Restoration Art', rarity: 'rare', path: 'healing', wisdomGranted: 58, description: 'Advanced healing techniques that can reverse severe injuries and restore vitality to the critically wounded.' },
  { id: 'scroll_heal_resurrection', name: 'Threshold of Life', rarity: 'epic', path: 'healing', wisdomGranted: 105, description: 'Teachings that blur the line between healing and resurrection, pulling souls back from the very edge of death.' },
  { id: 'scroll_heal_worldheal', name: 'World Healing Psalm', rarity: 'legendary', path: 'healing', wisdomGranted: 270, description: 'A prayer of such profound healing power that chanting it can purify poisoned land and restore dying ecosystems.' },
  // Runecraft scrolls (4)
  { id: 'scroll_rune_basics', name: 'Rune Primer', rarity: 'common', path: 'runecraft', wisdomGranted: 9, description: 'An introduction to the twenty-four basic runes of power and their individual magical properties.' },
  { id: 'scroll_rune_combination', name: 'Rune Combination Theory', rarity: 'uncommon', path: 'runecraft', wisdomGranted: 26, description: 'A theoretical framework for combining multiple runes into compound enchantments of greater complexity and power.' },
  { id: 'scroll_rune_ancient', name: 'Ancient Runic Language', rarity: 'rare', path: 'runecraft', wisdomGranted: 52, description: 'A dictionary of pre-civilization runes whose meanings have been lost to time, each one more powerful than modern equivalents.' },
  { id: 'scroll_rune_reality', name: 'Reality Inscription', rarity: 'legendary', path: 'runecraft', wisdomGranted: 255, description: 'The ultimate runecraft text teaching how to carve runes directly into the fabric of reality, rewriting natural laws.' },
  // Divination scrolls (3)
  { id: 'scroll_div_omens', name: 'Reading Omens', rarity: 'common', path: 'divination', wisdomGranted: 11, description: 'A guide to interpreting natural signs — bird flight, cloud shapes, and the rustling of leaves — as prophetic omens.' },
  { id: 'scroll_div_dreams', name: 'Dream Interpretation', rarity: 'uncommon', path: 'divination', wisdomGranted: 29, description: 'A comprehensive manual on entering and interpreting the prophetic dreamscape that exists beyond normal sleep.' },
  { id: 'scroll_div_fates', name: 'The Book of Fates', rarity: 'epic', path: 'divination', wisdomGranted: 108, description: 'A book that writes itself, adding new prophecies as events unfold. Reading it grants glimpses of predetermined futures.' },
  // Elementalism scrolls (3)
  { id: 'scroll_elem_foundations', name: 'Elemental Foundations', rarity: 'common', path: 'elementalism', wisdomGranted: 8, description: 'Basic techniques for sensing and communing with the four classical elements in their natural forms.' },
  { id: 'scroll_elem_binding', name: 'Elemental Binding', rarity: 'uncommon', path: 'elementalism', wisdomGranted: 24, description: 'Instructions for binding elemental spirits into objects and using them as sources of sustained magical power.' },
  { id: 'scroll_elem_convergence', name: 'Elemental Convergence', rarity: 'rare', path: 'elementalism', wisdomGranted: 54, description: 'The closely guarded secret of merging all four elements simultaneously, creating a fifth element of pure creation.' },
];

// =============================================================================
// SG_STRUCTURES — 25 Grove Structures (upgradeable to level 10)
// =============================================================================

export const SG_STRUCTURES: SGStructureDef[] = [
  // Meditation structures (6)
  { id: 'struct_meditation_circle', name: 'Meditation Circle', category: 'meditation', maxLevel: 10, baseCost: 50, description: 'A stone circle inscribed with calming runes that enhances meditation focus and wisdom gain for all sages in the grove.', bonusPerLevel: '+5% meditation speed' },
  { id: 'struct_zen_pavilion', name: 'Zen Pavilion', category: 'meditation', maxLevel: 10, baseCost: 80, description: 'An open-air wooden pavilion where sages meditate in perfect tranquility. Its design channels natural energy to deepen contemplation.', bonusPerLevel: '+3% wisdom per meditation' },
  { id: 'struct_silence_bell', name: 'Silence Bell Tower', category: 'meditation', maxLevel: 10, baseCost: 120, description: 'A tower housing a magical bell that, when rung, creates a sphere of absolute silence ideal for deep meditation.', bonusPerLevel: '+8% meditation duration' },
  { id: 'struct_chanting_hall', name: 'Chanting Hall', category: 'meditation', maxLevel: 10, baseCost: 150, description: 'A resonant hall where harmonic chanting amplifies collective wisdom and unlocks shared meditative experiences.', bonusPerLevel: '+4% group meditation bonus' },
  { id: 'struct_breathing_chamber', name: 'Breathing Chamber', category: 'meditation', maxLevel: 10, baseCost: 100, description: 'An airtight chamber filled with enchanted air that slows breathing and heart rate, extending meditative trance states.', bonusPerLevel: '+6% trance depth' },
  { id: 'struct_cosmic_observatory', name: 'Cosmic Observatory', category: 'meditation', maxLevel: 10, baseCost: 200, description: 'A domed observatory with a ceiling that displays real-time cosmic patterns, enabling starlit meditation sessions.', bonusPerLevel: '+5% cosmic wisdom bonus' },
  // Library structures (5)
  { id: 'struct_scroll_library', name: 'Scroll Library', category: 'library', maxLevel: 10, baseCost: 100, description: 'A curated collection of scrolls and texts that accelerates scroll study speed and increases wisdom gained from reading.', bonusPerLevel: '+5% study speed' },
  { id: 'struct_archive_vault', name: 'Archive Vault', category: 'library', maxLevel: 10, baseCost: 180, description: 'A secure underground vault protecting the rarest and most valuable wisdom scrolls from deterioration and theft.', bonusPerLevel: '+3% scroll preservation' },
  { id: 'struct_wisdom_fountain', name: 'Wisdom Fountain', category: 'library', maxLevel: 10, baseCost: 250, description: 'A fountain that flows with enchanted ink, allowing sages to copy and preserve scroll teachings indefinitely.', bonusPerLevel: '+4% copy quality' },
  { id: 'struct_rune_archive', name: 'Rune Archive', category: 'library', maxLevel: 10, baseCost: 220, description: 'Stone tablets inscribed with ancient rune texts that grant passive wisdom to any sage who studies within its walls.', bonusPerLevel: '+6% passive wisdom' },
  { id: 'struct_dream_repository', name: 'Dream Repository', category: 'library', maxLevel: 10, baseCost: 300, description: 'A crystal-enclosed space where prophetic dreams are captured, stored, and made accessible for divination study.', bonusPerLevel: '+5% dream clarity' },
  // Herb garden structures (5)
  { id: 'struct_herb_garden', name: 'Herb Garden', category: 'garden', maxLevel: 10, baseCost: 60, description: 'A carefully tended garden of medicinal and magical herbs that boosts healing sage abilities and alchemy output.', bonusPerLevel: '+5% herb quality' },
  { id: 'struct_alchemy_lab', name: 'Alchemy Laboratory', category: 'garden', maxLevel: 10, baseCost: 150, description: 'A well-equipped laboratory with crucibles, alembics, and enchanted burners for advanced alchemical research.', bonusPerLevel: '+4% transmutation success' },
  { id: 'struct_moonwell', name: 'Moonwell', category: 'garden', maxLevel: 10, baseCost: 200, description: 'A natural well that collects moonlight-infused water with potent restorative and purifying properties.', bonusPerLevel: '+6% restoration power' },
  { id: 'struct_elemental_greenhouse', name: 'Elemental Greenhouse', category: 'garden', maxLevel: 10, baseCost: 280, description: 'A greenhouse where each quadrant maintains a different elemental climate for growing exotic magical plants.', bonusPerLevel: '+5% rare herb yield' },
  { id: 'struct_spirit_pools', name: 'Spirit Pools', category: 'garden', maxLevel: 10, baseCost: 320, description: 'Sacred pools fed by underground springs where spirits congregate, granting visions to those who meditate nearby.', bonusPerLevel: '+7% vision frequency' },
  // Observatory structures (5)
  { id: 'struct_star_gazing_tower', name: 'Star-Gazing Tower', category: 'observatory', maxLevel: 10, baseCost: 160, description: 'A tall tower with an open ceiling for unobstructed celestial observation, enhancing astrology sage abilities.', bonusPerLevel: '+5% star reading accuracy' },
  { id: 'struct_orrery', name: 'Celestial Orrery', category: 'observatory', maxLevel: 10, baseCost: 250, description: 'An intricate mechanical model of the solar system that predicts planetary alignments and cosmic events.', bonusPerLevel: '+4% prediction range' },
  { id: 'struct_aether_lens', name: 'Aether Lens Array', category: 'observatory', maxLevel: 10, baseCost: 350, description: 'An array of enchanted lenses that can magnify distant celestial objects and reveal invisible astral phenomena.', bonusPerLevel: '+6% revelation bonus' },
  { id: 'struct_comet_tracker', name: 'Comet Tracking Station', category: 'observatory', maxLevel: 10, baseCost: 400, description: 'A specialized station for tracking comets and meteor showers that bring unique cosmic wisdom to the grove.', bonusPerLevel: '+8% comet wisdom bonus' },
  { id: 'struct_cosmic_gateway', name: 'Cosmic Gateway', category: 'observatory', maxLevel: 10, baseCost: 500, description: 'A portal frame that, at maximum power, can briefly open a window to observe distant galaxies and alien wisdom.', bonusPerLevel: '+10% cosmic insight' },
  // Special structures (4)
  { id: 'struct_relic_pedestal', name: 'Relic Pedestal', category: 'special', maxLevel: 10, baseCost: 200, description: 'A consecrated pedestal that amplifies the power of any relic placed upon it, increasing its passive bonuses.', bonusPerLevel: '+5% relic power' },
  { id: 'struct_wisdom_statue', name: 'Wisdom Statue', category: 'special', maxLevel: 10, baseCost: 300, description: 'A towering statue of an ancient sage that radiates passive wisdom to all grove residents who meditate in its shadow.', bonusPerLevel: '+3% passive wisdom to all sages' },
  { id: 'struct_ancient_bonfire', name: 'Ancient Bonfire', category: 'special', maxLevel: 10, baseCost: 150, description: 'An ever-burning bonfire fueled by enchanted wood that provides warmth, light, and a communal gathering point for sages.', bonusPerLevel: '+2% grove morale' },
  { id: 'struct_wisdom_tree', name: 'Wisdom Tree Sapling', category: 'special', maxLevel: 10, baseCost: 400, description: 'A magical sapling that grows with the grove\'s accumulated wisdom, eventually becoming a minor world tree with vast powers.', bonusPerLevel: '+7% total wisdom capacity' },
];

// =============================================================================
// SG_ABILITIES — 22 Sage Abilities
// =============================================================================

export const SG_ABILITIES: SGAbilityDef[] = [
  // Philosophy abilities (3)
  { id: 'ability_wisdom_bolt', name: 'Wisdom Bolt', path: 'philosophy', description: 'Launch a concentrated bolt of pure philosophical insight that stuns enemies with existential questions.', cooldown: 5, power: 20, requiredLevel: 3 },
  { id: 'ability_paradox_shield', name: 'Paradox Shield', path: 'philosophy', description: 'Create a shield of contradictory logic that confuses and deflects incoming attacks.', cooldown: 15, power: 35, requiredLevel: 10 },
  { id: 'ability_enlightenment_wave', name: 'Enlightenment Wave', path: 'philosophy', description: 'Emit a wave of profound understanding that pacifies all enemies in range and grants allies temporary wisdom.', cooldown: 30, power: 60, requiredLevel: 20 },
  // Astrology abilities (3)
  { id: 'ability_starfall', name: 'Starfall', path: 'astrology', description: 'Call down a shower of miniature stars that deal cosmic damage to all targets in the area.', cooldown: 8, power: 25, requiredLevel: 3 },
  { id: 'ability_constellation_weave', name: 'Constellation Weave', path: 'astrology', description: 'Project a constellation pattern that creates a zone of enhanced magical power for allies.', cooldown: 20, power: 40, requiredLevel: 12 },
  { id: 'ability_celestial_align', name: 'Celestial Alignment', path: 'astrology', description: 'Align the stars to temporarily rewrite fate, guaranteeing a critical success on the next action.', cooldown: 60, power: 80, requiredLevel: 25 },
  // Alchemy abilities (3)
  { id: 'ability_elixir_brew', name: 'Elixir Brew', path: 'alchemy', description: 'Rapidly brew a random beneficial elixir that grants a temporary stat boost to a chosen ally.', cooldown: 10, power: 22, requiredLevel: 3 },
  { id: 'ability_transmute_burst', name: 'Transmute Burst', path: 'alchemy', description: 'Convert all enemy projectiles and hazardous materials in range into harmless butterflies.', cooldown: 18, power: 45, requiredLevel: 11 },
  { id: 'ability_philosopher_stone', name: 'Philosopher\'s Touch', path: 'alchemy', description: 'Channel the power of the philosopher\'s stone to temporarily transmute the environment, creating gold from stone.', cooldown: 45, power: 70, requiredLevel: 22 },
  // Healing abilities (3)
  { id: 'ability_herbal_heal', name: 'Herbal Heal', path: 'healing', description: 'Apply a poultice of enchanted herbs that rapidly regenerates health over a short duration.', cooldown: 6, power: 18, requiredLevel: 2 },
  { id: 'ability_aura_mend', name: 'Aura Mend', path: 'healing', description: 'Release a pulse of healing energy that repairs the aura and restores vitality to all nearby allies.', cooldown: 16, power: 38, requiredLevel: 10 },
  { id: 'ability_world_heal', name: 'World Heal', path: 'healing', description: 'Channel the earth\'s regenerative power to fully restore all allies and mend the surrounding environment.', cooldown: 50, power: 75, requiredLevel: 24 },
  // Runecraft abilities (3)
  { id: 'ability_rune_carve', name: 'Rune Carving', path: 'runecraft', description: 'Inscribe a protective rune on the ground that creates a ward blocking enemy movement and projectiles.', cooldown: 7, power: 20, requiredLevel: 3 },
  { id: 'ability_runic_chain', name: 'Runic Chain', path: 'runecraft', description: 'Fire a chain of connected runes that links enemies together, sharing damage between them.', cooldown: 14, power: 42, requiredLevel: 12 },
  { id: 'ability_runic_storm', name: 'Runic Tempest', path: 'runecraft', description: 'Activate all nearby runes simultaneously, creating a devastating storm of overlapping magical effects.', cooldown: 40, power: 72, requiredLevel: 23 },
  // Divination abilities (3)
  { id: 'ability_foresight', name: 'Foresight', path: 'divination', description: 'Gain a brief glimpse of incoming danger, allowing perfect dodge of the next attack.', cooldown: 12, power: 15, requiredLevel: 4 },
  { id: 'ability_prophecy', name: 'Prophecy', path: 'divination', description: 'Utter a prophecy that comes true, dealing fate-based damage that cannot be blocked or resisted.', cooldown: 25, power: 50, requiredLevel: 14 },
  { id: 'ability_fates_reveal', name: 'Fate\'s Revelation', path: 'divination', description: 'Reveal all hidden enemies, traps, and secrets in a large area while exposing enemy weaknesses.', cooldown: 35, power: 65, requiredLevel: 26 },
  // Elementalism abilities (3)
  { id: 'ability_elemental_bolt', name: 'Elemental Bolt', path: 'elementalism', description: 'Fire a bolt of pure elemental energy that cycles through fire, water, earth, and air with each cast.', cooldown: 4, power: 18, requiredLevel: 2 },
  { id: 'ability_elemental_shield', name: 'Elemental Aegis', path: 'elementalism', description: 'Surround yourself with rotating elemental shields that absorb damage and reflect a portion back at attackers.', cooldown: 20, power: 44, requiredLevel: 11 },
  { id: 'ability_primal_convergence', name: 'Primal Convergence', path: 'elementalism', description: 'Merge all four elements into the fifth element of creation, unleashing a devastating wave of pure creative force.', cooldown: 55, power: 85, requiredLevel: 27 },
  // Universal abilities (1)
  { id: 'ability_grove_awakening', name: 'Grove Awakening', path: 'universal', description: 'Awaken the full power of your sacred grove, temporarily doubling all sage abilities and meditation gains.', cooldown: 120, power: 100, requiredLevel: 35 },
];

// =============================================================================
// SG_ACHIEVEMENTS — 18 Achievements
// =============================================================================

export const SG_ACHIEVEMENTS: SGAchievementDef[] = [
  { id: 'ach_first_sage', name: 'First Initiate', description: 'Recruit your first sage into the grove.', conditionKey: 'totalSagesRecruited', targetValue: 1, rewardExp: 50, rewardWisdom: 20 },
  { id: 'ach_five_sages', name: 'Gathering Wisdom', description: 'Have five sages studying simultaneously in your groves.', conditionKey: 'totalSagesRecruited', targetValue: 5, rewardExp: 150, rewardWisdom: 60 },
  { id: 'ach_ten_sages', name: 'Council of Sages', description: 'Assemble a council of ten sages from different paths.', conditionKey: 'totalSagesRecruited', targetValue: 10, rewardExp: 400, rewardWisdom: 150 },
  { id: 'ach_twentyfive_sages', name: 'Grand Conclave', description: 'Gather twenty-five sages under your banner.', conditionKey: 'totalSagesRecruited', targetValue: 25, rewardExp: 1000, rewardWisdom: 400 },
  { id: 'ach_first_scroll', name: 'Scholar\'s Beginning', description: 'Collect and study your first wisdom scroll.', conditionKey: 'totalScrollsStudied', targetValue: 1, rewardExp: 30, rewardWisdom: 15 },
  { id: 'ach_ten_scrolls', name: 'Scroll Master', description: 'Study ten different wisdom scrolls.', conditionKey: 'totalScrollsStudied', targetValue: 10, rewardExp: 300, rewardWisdom: 120 },
  { id: 'ach_all_common_scrolls', name: 'Foundation Complete', description: 'Study all common-tier wisdom scrolls.', conditionKey: 'commonScrollsStudied', targetValue: 8, rewardExp: 500, rewardWisdom: 200 },
  { id: 'ach_first_structure', name: 'Builder\'s Foundation', description: 'Build your first grove structure.', conditionKey: 'totalStructuresBuilt', targetValue: 1, rewardExp: 40, rewardWisdom: 25 },
  { id: 'ach_ten_structures', name: 'Architect of Wisdom', description: 'Build ten grove structures across your sacred grounds.', conditionKey: 'totalStructuresBuilt', targetValue: 10, rewardExp: 600, rewardWisdom: 250 },
  { id: 'ach_max_structure', name: 'Pinnacle Construction', description: 'Upgrade any structure to its maximum level.', conditionKey: 'maxStructureLevel', targetValue: 10, rewardExp: 800, rewardWisdom: 300 },
  { id: 'ach_first_relic', name: 'Relic Hunter', description: 'Discover your first ancient relic.', conditionKey: 'totalRelicsFound', targetValue: 1, rewardExp: 100, rewardWisdom: 50 },
  { id: 'ach_five_relics', name: 'Artifact Collector', description: 'Amass a collection of five ancient relics.', conditionKey: 'totalRelicsFound', targetValue: 5, rewardExp: 500, rewardWisdom: 200 },
  { id: 'ach_ten_relics', name: 'Relic Hoarder', description: 'Discover ten legendary relics of ancient wisdom.', conditionKey: 'totalRelicsFound', targetValue: 10, rewardExp: 1200, rewardWisdom: 500 },
  { id: 'ach_hundred_meditations', name: 'Meditative Mind', description: 'Complete one hundred meditation sessions with your sages.', conditionKey: 'totalMeditations', targetValue: 100, rewardExp: 500, rewardWisdom: 200 },
  { id: 'ach_all_paths', name: 'Seven Paths Walked', description: 'Recruit at least one sage from each of the seven wisdom paths.', conditionKey: 'uniquePathsRecruited', targetValue: 7, rewardExp: 700, rewardWisdom: 350 },
  { id: 'ach_all_groves', name: 'Grove Master', description: 'Unlock and sanctify all eight sacred groves.', conditionKey: 'grovesUnlocked', targetValue: 8, rewardExp: 1000, rewardWisdom: 400 },
  { id: 'ach_legendary_sage', name: 'Legend Recruiter', description: 'Successfully recruit a legendary sage to your grove.', conditionKey: 'legendarySagesRecruited', targetValue: 1, rewardExp: 1500, rewardWisdom: 600 },
  { id: 'ach_wisdom_level_50', name: 'Peak Enlightenment', description: 'Reach wisdom level 50, the pinnacle of mortal understanding.', conditionKey: 'wisdomLevel', targetValue: 50, rewardExp: 2000, rewardWisdom: 1000 },
];

// =============================================================================
// SG_TITLES — 8 Titles (Seeker → Omniscient Sage)
// =============================================================================

export const SG_TITLES: SGTitleDef[] = [
  { id: 'title_seeker', name: 'Seeker', levelRequired: 1, description: 'A curious soul beginning the journey toward wisdom in the sacred groves.' },
  { id: 'title_apprentice', name: 'Apprentice Sage', levelRequired: 5, description: 'An eager student who has learned the basic principles of meditation and study.' },
  { id: 'title_disciple', name: 'Disciple of Wisdom', levelRequired: 12, description: 'A dedicated learner who has mastered multiple fundamental teachings.' },
  { id: 'title_adept', name: 'Adept of the Grove', levelRequired: 20, description: 'A skilled practitioner capable of teaching others and performing advanced rituals.' },
  { id: 'title_mentor', name: 'Sage Mentor', levelRequired: 30, description: 'A respected teacher whose wisdom guides the next generation of seekers.' },
  { id: 'title_elder', name: 'Elder Sage', levelRequired: 38, description: 'An elder of profound wisdom whose counsel is sought by sages from distant lands.' },
  { id: 'title_ancient', name: 'Ancient Sage', levelRequired: 45, description: 'A sage of legendary stature whose knowledge spans centuries and multiple disciplines.' },
  { id: 'title_omniscient', name: 'Omniscient Sage', levelRequired: 50, description: 'The highest attainable title — one who has glimpsed the totality of all wisdom paths.' },
];

// =============================================================================
// SG_RELICS — 15 Legendary Relics
// =============================================================================

export const SG_RELICS: SGRelicDef[] = [
  { id: 'relic_wisdom_amulet', name: 'Amulet of Ancient Wisdom', rarity: 'uncommon', description: 'An amulet inscribed with a single word of power that enhances all meditation gains by a small amount.', power: 10, path: 'universal', bonusType: 'meditation_boost' },
  { id: 'relic_star_compass', name: 'Star Compass', rarity: 'uncommon', description: 'A compass that points toward celestial events rather than north, improving astrology sage abilities.', power: 12, path: 'astrology', bonusType: 'path_boost' },
  { id: 'relic_healing_crystal', name: 'Tears of the Earth', rarity: 'uncommon', description: 'Crystallized healing energy from deep underground that boosts all healing sage capabilities.', power: 11, path: 'healing', bonusType: 'path_boost' },
  { id: 'relic_alchemy_cauldron', name: 'Cauldron of Transmutation', rarity: 'rare', description: 'A self-stirring cauldron that improves the quality and speed of all alchemical processes.', power: 25, path: 'alchemy', bonusType: 'path_boost' },
  { id: 'relic_rune_hammer', name: 'Hammer of the First Scribe', rarity: 'rare', description: 'The original tool used to carve the first rune into reality. Runecraft sages gain immense power from it.', power: 28, path: 'runecraft', bonusType: 'path_boost' },
  { id: 'relic_oracle_eye', name: 'Eye of the Oracle', rarity: 'rare', description: 'A crystalline eye that grants visions of the near future, enhancing all divination abilities.', power: 26, path: 'divination', bonusType: 'path_boost' },
  { id: 'relic_elemental_core', name: 'Core of Balance', rarity: 'rare', description: 'A sphere containing all four elements in perfect equilibrium, boosting elementalism sage power.', power: 24, path: 'elementalism', bonusType: 'path_boost' },
  { id: 'relic_philosopher_mask', name: 'Mask of a Thousand Faces', rarity: 'rare', description: 'A mask that allows the wearer to perceive any argument from multiple perspectives simultaneously.', power: 27, path: 'philosophy', bonusType: 'path_boost' },
  { id: 'relic_scroll_of_ages', name: 'Scroll of the Ages', rarity: 'epic', description: 'A self-writing scroll that records the most important events of each era, granting immense wisdom on study.', power: 55, path: 'universal', bonusType: 'scroll_wisdom' },
  { id: 'relic_celestial_crown', name: 'Crown of Constellations', rarity: 'epic', description: 'A crown shaped like the twelve constellations that channels cosmic energy directly into the wearer\'s mind.', power: 58, path: 'astrology', bonusType: 'path_boost' },
  { id: 'relic_world_tree_bark', name: 'Bark of the World Tree', rarity: 'epic', description: 'A fragment of the World Tree\'s bark that pulses with the life force of all creation, boosting healing enormously.', power: 60, path: 'healing', bonusType: 'path_boost' },
  { id: 'relic_philosopher_stone', name: 'Philosopher\'s Stone Shard', rarity: 'epic', description: 'A genuine fragment of the philosopher\'s stone that radiates transformative energy, enhancing all alchemy.', power: 62, path: 'alchemy', bonusType: 'path_boost' },
  { id: 'relic_sage_orb', name: 'Orb of Total Recall', rarity: 'legendary', description: 'A perfect sphere of crystallized thought that stores and instantly retrieves any knowledge ever encountered.', power: 120, path: 'philosophy', bonusType: 'wisdom_cap' },
  { id: 'relic_fates_shears', name: 'Shears of Fate', rarity: 'legendary', description: 'The legendary tool used by the Fates to cut the threads of destiny. Grants control over probability itself.', power: 130, path: 'divination', bonusType: 'path_boost' },
  { id: 'relic_creation_seed', name: 'Seed of Creation', rarity: 'legendary', description: 'A seed containing the raw material of creation itself. In the right hands, it can birth new worlds.', power: 150, path: 'universal', bonusType: 'ultimate_power' },
];

// =============================================================================
// SG_EVENTS — 12 Grove Events
// =============================================================================

export const SG_EVENTS: SGEventDef[] = [
  { id: 'event_spirit_visitation', name: 'Spirit Visitation', description: 'Ancient spirits materialize in the grove, sharing forgotten wisdom with any sage who listens attentively.', duration: 300, rewardWisdom: 50, rewardRelicChance: 0.05, requiredLevel: 3 },
  { id: 'event_eclipse_meditation', name: 'Eclipse Meditation', description: 'A rare solar eclipse creates ideal conditions for meditation, dramatically increasing wisdom gains for its duration.', duration: 180, rewardWisdom: 80, rewardRelicChance: 0.03, requiredLevel: 5 },
  { id: 'event_ancient_awakening', name: 'Ancient Awakening', description: 'The ground trembles as a dormant power beneath the grove stirs, releasing waves of ancient energy.', duration: 600, rewardWisdom: 150, rewardRelicChance: 0.1, requiredLevel: 10 },
  { id: 'event_comet_shower', name: 'Comet Shower', description: 'A spectacular meteor shower fills the sky with cosmic debris, granting astrology sages immense power.', duration: 240, rewardWisdom: 100, rewardRelicChance: 0.07, requiredLevel: 8 },
  { id: 'event_herb_bloom', name: 'Grand Herb Bloom', description: 'All medicinal plants in the grove bloom simultaneously, producing a concentrated harvest of rare herbs.', duration: 360, rewardWisdom: 60, rewardRelicChance: 0.04, requiredLevel: 5 },
  { id: 'event_rune_discovery', name: 'Rune Discovery', description: 'A previously unknown set of runes is unearthed in the grove, containing power from a lost civilization.', duration: 480, rewardWisdom: 120, rewardRelicChance: 0.08, requiredLevel: 15 },
  { id: 'event_elemental_convergence', name: 'Elemental Convergence', description: 'All four elements surge simultaneously through the grove, creating rare fifth-element crystals.', duration: 300, rewardWisdom: 110, rewardRelicChance: 0.09, requiredLevel: 12 },
  { id: 'event_prophecy_fulfillment', name: 'Prophecy Fulfilled', description: 'A long-foretold prophecy comes to pass in the grove, unlocking hidden knowledge and ancient rewards.', duration: 420, rewardWisdom: 200, rewardRelicChance: 0.15, requiredLevel: 20 },
  { id: 'event_wisdom_rain', name: 'Wisdom Rain', description: 'A miraculous rain of golden droplets falls upon the grove, each drop containing a fragment of pure wisdom.', duration: 200, rewardWisdom: 90, rewardRelicChance: 0.06, requiredLevel: 7 },
  { id: 'event_ancient_sage_return', name: 'Ancient Sage Returns', description: 'The ghost of a legendary sage visits the grove to share one final teaching before departing forever.', duration: 500, rewardWisdom: 250, rewardRelicChance: 0.12, requiredLevel: 25 },
  { id: 'event_relic_surge', name: 'Relic Surge', description: 'The grove\'s magical energy peaks, revealing the location of multiple hidden relics within the sacred grounds.', duration: 360, rewardWisdom: 75, rewardRelicChance: 0.2, requiredLevel: 18 },
  { id: 'event_world_tree_pulse', name: 'World Tree Pulse', description: 'A pulse of energy from the World Tree reaches the grove, temporarily connecting it to all other groves in existence.', duration: 900, rewardWisdom: 300, rewardRelicChance: 0.18, requiredLevel: 35 },
];

// =============================================================================
// Constants & Limits
// =============================================================================

export const SG_MAX_LEVEL = 50;
export const SG_MAX_SAGES_PER_GROVE = 12;
export const SG_MAX_SCROLLS = 30;
export const SG_MEDITATION_BASE_TIME = 30;

// =============================================================================
// Helper Functions (hoisted with function declarations)
// =============================================================================

function sgCalcXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= SG_MAX_LEVEL) return Infinity;
  return Math.floor(80 * level * (1 + level * 0.15));
}

function sgClampLevel(lvl: number): number {
  return Math.max(1, Math.min(SG_MAX_LEVEL, lvl));
}

function sgRarityMult(rarity: SGRarity): number {
  return SG_RARITY_MULTIPLIER[rarity] ?? 1;
}

function sgGenerateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function sgPathSynergyBonus(path: SGPath, groveDefId: string): number {
  const synergies = SG_PATH_GROVE_SYNERGY[path];
  if (!synergies) return 1.0;
  return synergies.includes(groveDefId) ? 1.25 : 1.0;
}

function sgCalcMeditationReward(wisdomLevel: number, path: SGPath, groveDefId: string): number {
  const groveDef = SG_GROVES.find((g) => g.id === groveDefId);
  const meditationBonus = groveDef?.meditationBonus ?? 1.0;
  const synergy = sgPathSynergyBonus(path, groveDefId);
  return Math.floor((10 + wisdomLevel * 2) * meditationBonus * synergy);
}

function sgCalcRecruitCost(sageDef: SGSageDef): number {
  return Math.floor(30 * sgRarityMult(sageDef.rarity));
}

function sgCalcStructureUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

function sgCountUniquePaths(recruitedSages: SGSageInstance[]): number {
  const paths = new Set<string>();
  for (const sage of recruitedSages) {
    const def = SG_SAGES.find((s) => s.id === sage.defId);
    if (def) paths.add(def.path);
  }
  return paths.size;
}

function sgCountLegendarySages(recruitedSages: SGSageInstance[]): number {
  let count = 0;
  for (const sage of recruitedSages) {
    const def = SG_SAGES.find((s) => s.id === sage.defId);
    if (def && def.rarity === 'legendary') count++;
  }
  return count;
}

function sgCountCommonScrollsStudied(scrolls: SGScrollInstance[]): number {
  let count = 0;
  for (const scroll of scrolls) {
    if (!scroll.studied) continue;
    const def = SG_SCROLLS.find((s) => s.id === scroll.scrollId);
    if (def && def.rarity === 'common') count++;
  }
  return count;
}

function sgGetMaxStructureLevel(structures: SGStructureInstance[]): number {
  let max = 0;
  for (const s of structures) {
    if (s.level > max) max = s.level;
  }
  return max;
}

function sgCalcTotalStructureBonus(structures: SGStructureInstance[], category: string): number {
  let total = 0;
  for (const s of structures) {
    const def = SG_STRUCTURES.find((sd) => sd.id === s.defId);
    if (def && def.category === category) {
      total += s.level;
    }
  }
  return total;
}

function sgCalcRelicBonusByPath(relics: SGRelicInstance[], path: SGPath | 'universal'): number {
  let total = 0;
  for (const r of relics) {
    if (!r.equipped) continue;
    const def = SG_RELICS.find((rd) => rd.id === r.relicId);
    if (def && (def.path === path || def.path === 'universal')) {
      total += def.power;
    }
  }
  return total;
}

function sgCalcAbilityPower(abilityDefId: string, wisdomLevel: number, relics: SGRelicInstance[]): number {
  const def = SG_ABILITIES.find((a) => a.id === abilityDefId);
  if (!def) return 0;
  const levelScale = 1 + wisdomLevel * 0.02;
  const relicBonus = 1 + sgCalcRelicBonusByPath(relics, def.path) * 0.01;
  return Math.floor(def.power * levelScale * relicBonus);
}

function sgCalcScrollStudyReward(scrollDefId: string, structures: SGStructureInstance[]): number {
  const def = SG_SCROLLS.find((s) => s.id === scrollDefId);
  if (!def) return 0;
  const libraryBonus = sgCalcTotalStructureBonus(structures, 'library');
  const multiplier = 1 + libraryBonus * 0.05;
  return Math.floor(def.wisdomGranted * multiplier);
}

function sgFindTopSages(sages: SGSageInstance[], count: number): SGSageInstance[] {
  return [...sages].sort((a, b) => b.bondStrength - a.bondStrength).slice(0, count);
}

function sgCountStructuresByCategory(structures: SGStructureInstance[], category: string): number {
  let count = 0;
  for (const s of structures) {
    const def = SG_STRUCTURES.find((sd) => sd.id === s.defId);
    if (def && def.category === category) count++;
  }
  return count;
}

function sgCalcGroveSanctityAverage(groves: { sanctity: number }[]): number {
  if (groves.length === 0) return 0;
  const total = groves.reduce((sum, g) => sum + g.sanctity, 0);
  return Math.round((total / groves.length) * 10) / 10;
}

function sgGetRarityCounts(sages: SGSageInstance[]): Record<SGRarity, number> {
  const counts: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  for (const sage of sages) {
    const def = SG_SAGES.find((s) => s.id === sage.defId);
    if (def) counts[def.rarity] = (counts[def.rarity] ?? 0) + 1;
  }
  return counts as Record<SGRarity, number>;
}

function sgIsEventExpired(activeEvent: SGEventInstance): boolean {
  if (activeEvent.endTime === null) return false;
  return Date.now() >= activeEvent.endTime;
}

function sgCalcNextLevelExp(wisdomLevel: number): number {
  return sgCalcXpRequired(wisdomLevel);
}

// =============================================================================
// Initial State
// =============================================================================

const SG_INITIAL_STATE: SGState = {
  groves: SG_GROVES.map((g) => ({
    defId: g.id,
    unlocked: g.unlockLevel <= 1,
    sanctity: g.unlockLevel <= 1 ? 100 : 0,
  })),
  recruitedSages: [],
  collectedScrolls: [],
  structures: [],
  ownedRelics: [],
  unlockedAbilities: [],
  achievements: [],
  currentTitle: 'title_seeker',
  wisdomLevel: 1,
  wisdomExp: 0,
  wisdomPoints: 0,
  totalMeditations: 0,
  totalSagesRecruited: 0,
  totalScrollsStudied: 0,
  totalStructuresBuilt: 0,
  totalRelicsFound: 0,
  activeEvent: {
    eventId: null,
    startTime: null,
    endTime: null,
    progress: 0,
    rewardClaimed: false,
  },
  lastMeditationAt: null,
};

// =============================================================================
// Zustand Store
// =============================================================================

export const useSGStore = create<SGStore>()(
  persist(
    (set, get) => ({
      ...SG_INITIAL_STATE,

      // =====================================================================
      // Sage Recruitment
      // =====================================================================

      sgRecruitSage: (sageDefId: string, groveId: string) => {
        const s = get();
        const sageDef = SG_SAGES.find((sd) => sd.id === sageDefId);
        const groveState = s.groves.find((g) => g.defId === groveId);
        const groveDef = SG_GROVES.find((g) => g.id === groveId);
        if (!sageDef || !groveState || !groveDef) return false;
        if (!groveState.unlocked) return false;

        const sagesInGrove = s.recruitedSages.filter((rs) => rs.groveId === groveId).length;
        if (sagesInGrove >= SG_MAX_SAGES_PER_GROVE) return false;

        const cost = sgCalcRecruitCost(sageDef);
        if (s.wisdomPoints < cost) return false;

        const newInstance: SGSageInstance = {
          instanceId: sgGenerateId('sage'),
          defId: sageDefId,
          groveId,
          recruitedAt: Date.now(),
          bondStrength: 0,
          meditationsPerformed: 0,
        };

        set((prev) => ({
          recruitedSages: [...prev.recruitedSages, newInstance],
          wisdomPoints: prev.wisdomPoints - cost,
          totalSagesRecruited: prev.totalSagesRecruited + 1,
        }));
        return true;
      },

      // =====================================================================
      // Scroll Collection & Study
      // =====================================================================

      sgCollectScroll: (scrollDefId: string) => {
        const s = get();
        if (s.collectedScrolls.find((sc) => sc.scrollId === scrollDefId)) return false;
        const def = SG_SCROLLS.find((sc) => sc.id === scrollDefId);
        if (!def) return false;

        const newInstance: SGScrollInstance = {
          scrollId: scrollDefId,
          collectedAt: Date.now(),
          studied: false,
          studiedAt: null,
        };

        set((prev) => ({
          collectedScrolls: [...prev.collectedScrolls, newInstance],
        }));
        return true;
      },

      sgStudyScroll: (scrollDefId: string) => {
        const s = get();
        const scrollInst = s.collectedScrolls.find((sc) => sc.scrollId === scrollDefId);
        if (!scrollInst || scrollInst.studied) return 0;
        const def = SG_SCROLLS.find((sc) => sc.id === scrollDefId);
        if (!def) return 0;

        const wisdomGained = def.wisdomGranted;

        set((prev) => ({
          collectedScrolls: prev.collectedScrolls.map((sc) =>
            sc.scrollId === scrollDefId
              ? { ...sc, studied: true, studiedAt: Date.now() }
              : sc
          ),
          wisdomExp: prev.wisdomExp + wisdomGained,
          wisdomPoints: prev.wisdomPoints + Math.floor(wisdomGained * 0.5),
          totalScrollsStudied: prev.totalScrollsStudied + 1,
        }));
        return wisdomGained;
      },

      // =====================================================================
      // Structure Building & Upgrading
      // =====================================================================

      sgBuildStructure: (structDefId: string, groveId: string) => {
        const s = get();
        const structDef = SG_STRUCTURES.find((sd) => sd.id === structDefId);
        const groveState = s.groves.find((g) => g.defId === groveId);
        if (!structDef || !groveState || !groveState.unlocked) return false;
        if (s.wisdomPoints < structDef.baseCost) return false;

        const newInstance: SGStructureInstance = {
          instanceId: sgGenerateId('struct'),
          defId: structDefId,
          groveId,
          level: 1,
          builtAt: Date.now(),
        };

        set((prev) => ({
          structures: [...prev.structures, newInstance],
          wisdomPoints: prev.wisdomPoints - structDef.baseCost,
          totalStructuresBuilt: prev.totalStructuresBuilt + 1,
        }));
        return true;
      },

      sgUpgradeStructure: (instanceId: string) => {
        const s = get();
        const structInst = s.structures.find((si) => si.instanceId === instanceId);
        if (!structInst) return false;
        const structDef = SG_STRUCTURES.find((sd) => sd.id === structInst.defId);
        if (!structDef || structInst.level >= structDef.maxLevel) return false;

        const cost = sgCalcStructureUpgradeCost(structDef.baseCost, structInst.level);
        if (s.wisdomPoints < cost) return false;

        set((prev) => ({
          structures: prev.structures.map((si) =>
            si.instanceId === instanceId
              ? { ...si, level: si.level + 1 }
              : si
          ),
          wisdomPoints: prev.wisdomPoints - cost,
        }));
        return true;
      },

      // =====================================================================
      // Meditation
      // =====================================================================

      sgMeditate: (sageInstanceId: string) => {
        const s = get();
        const sageInst = s.recruitedSages.find((rs) => rs.instanceId === sageInstanceId);
        if (!sageInst) return 0;
        const sageDef = SG_SAGES.find((sd) => sd.id === sageInst.defId);
        if (!sageDef) return 0;

        const reward = sgCalcMeditationReward(s.wisdomLevel, sageDef.path, sageInst.groveId);
        const totalReward = reward + Math.floor(sageDef.wisdomPower * 0.1);

        set((prev) => ({
          wisdomExp: prev.wisdomExp + totalReward,
          wisdomPoints: prev.wisdomPoints + Math.floor(totalReward * 0.3),
          totalMeditations: prev.totalMeditations + 1,
          lastMeditationAt: Date.now(),
          recruitedSages: prev.recruitedSages.map((rs) =>
            rs.instanceId === sageInstanceId
              ? {
                  ...rs,
                  meditationsPerformed: rs.meditationsPerformed + 1,
                  bondStrength: Math.min(100, rs.bondStrength + 2),
                }
              : rs
          ),
        }));
        return totalReward;
      },

      // =====================================================================
      // Relics
      // =====================================================================

      sgFindRelic: (relicDefId: string) => {
        const s = get();
        if (s.ownedRelics.find((r) => r.relicId === relicDefId)) return false;
        const def = SG_RELICS.find((r) => r.id === relicDefId);
        if (!def) return false;

        const newInstance: SGRelicInstance = {
          relicId: relicDefId,
          foundAt: Date.now(),
          equipped: false,
          activationCount: 0,
        };

        set((prev) => ({
          ownedRelics: [...prev.ownedRelics, newInstance],
          totalRelicsFound: prev.totalRelicsFound + 1,
        }));
        return true;
      },

      sgEquipRelic: (relicDefId: string) => {
        const s = get();
        const relic = s.ownedRelics.find((r) => r.relicId === relicDefId);
        if (!relic) return false;

        set((prev) => ({
          ownedRelics: prev.ownedRelics.map((r) =>
            r.relicId === relicDefId ? { ...r, equipped: true } : r
          ),
        }));
        return true;
      },

      sgUnequipRelic: (relicDefId: string) => {
        const s = get();
        const relic = s.ownedRelics.find((r) => r.relicId === relicDefId);
        if (!relic) return false;

        set((prev) => ({
          ownedRelics: prev.ownedRelics.map((r) =>
            r.relicId === relicDefId ? { ...r, equipped: false } : r
          ),
        }));
        return true;
      },

      // =====================================================================
      // Abilities
      // =====================================================================

      sgUnlockAbility: (abilityDefId: string) => {
        const s = get();
        if (s.unlockedAbilities.includes(abilityDefId)) return false;
        const def = SG_ABILITIES.find((a) => a.id === abilityDefId);
        if (!def || s.wisdomLevel < def.requiredLevel) return false;

        const cost = Math.floor(50 * sgRarityMult(def.path === 'universal' ? 'rare' : 'uncommon'));
        if (s.wisdomPoints < cost) return false;

        set((prev) => ({
          unlockedAbilities: [...prev.unlockedAbilities, abilityDefId],
          wisdomPoints: prev.wisdomPoints - cost,
        }));
        return true;
      },

      sgActivateAbility: (abilityDefId: string) => {
        const s = get();
        if (!s.unlockedAbilities.includes(abilityDefId)) return false;
        const def = SG_ABILITIES.find((a) => a.id === abilityDefId);
        if (!def) return false;

        set((prev) => ({
          wisdomExp: prev.wisdomExp + Math.floor(def.power * 0.5),
        }));
        return true;
      },

      // =====================================================================
      // Achievements
      // =====================================================================

      sgClaimAchievement: (achievementDefId: string) => {
        const s = get();
        if (s.achievements.includes(achievementDefId)) return false;
        const def = SG_ACHIEVEMENTS.find((a) => a.id === achievementDefId);
        if (!def) return false;

        let met = false;
        switch (def.conditionKey) {
          case 'totalSagesRecruited': met = s.totalSagesRecruited >= def.targetValue; break;
          case 'totalScrollsStudied': met = s.totalScrollsStudied >= def.targetValue; break;
          case 'commonScrollsStudied': met = sgCountCommonScrollsStudied(s.collectedScrolls) >= def.targetValue; break;
          case 'totalStructuresBuilt': met = s.totalStructuresBuilt >= def.targetValue; break;
          case 'maxStructureLevel': met = sgGetMaxStructureLevel(s.structures) >= def.targetValue; break;
          case 'totalRelicsFound': met = s.totalRelicsFound >= def.targetValue; break;
          case 'totalMeditations': met = s.totalMeditations >= def.targetValue; break;
          case 'uniquePathsRecruited': met = sgCountUniquePaths(s.recruitedSages) >= def.targetValue; break;
          case 'grovesUnlocked': met = s.groves.filter((g) => g.unlocked).length >= def.targetValue; break;
          case 'legendarySagesRecruited': met = sgCountLegendarySages(s.recruitedSages) >= def.targetValue; break;
          case 'wisdomLevel': met = s.wisdomLevel >= def.targetValue; break;
          default: met = false;
        }
        if (!met) return false;

        set((prev) => ({
          achievements: [...prev.achievements, achievementDefId],
          wisdomExp: prev.wisdomExp + def.rewardExp,
          wisdomPoints: prev.wisdomPoints + def.rewardWisdom,
        }));
        return true;
      },

      // =====================================================================
      // Titles
      // =====================================================================

      sgSetTitle: (titleId: string) => {
        const s = get();
        const def = SG_TITLES.find((t) => t.id === titleId);
        if (!def || s.wisdomLevel < def.levelRequired) return false;

        set((prev) => ({
          currentTitle: titleId,
        }));
        return true;
      },

      // =====================================================================
      // Grove Management
      // =====================================================================

      sgUnlockGrove: (groveDefId: string) => {
        const s = get();
        const groveState = s.groves.find((g) => g.defId === groveDefId);
        const groveDef = SG_GROVES.find((g) => g.id === groveDefId);
        if (!groveState || !groveDef || groveState.unlocked) return false;
        if (s.wisdomLevel < groveDef.unlockLevel) return false;

        set((prev) => ({
          groves: prev.groves.map((g) =>
            g.defId === groveDefId
              ? { ...g, unlocked: true, sanctity: 50 }
              : g
          ),
        }));
        return true;
      },

      sgPurifyGrove: (groveDefId: string, amount: number) => {
        const s = get();
        const groveState = s.groves.find((g) => g.defId === groveDefId);
        if (!groveState || !groveState.unlocked) return 0;

        const purified = Math.min(amount, 100 - groveState.sanctity);

        set((prev) => ({
          groves: prev.groves.map((g) =>
            g.defId === groveDefId
              ? { ...g, sanctity: Math.min(100, g.sanctity + purified) }
              : g
          ),
        }));
        return purified;
      },

      // =====================================================================
      // Events
      // =====================================================================

      sgStartEvent: (eventDefId: string) => {
        const s = get();
        if (s.activeEvent.eventId !== null) return false;
        const def = SG_EVENTS.find((e) => e.id === eventDefId);
        if (!def || s.wisdomLevel < def.requiredLevel) return false;

        const now = Date.now();
        set((prev) => ({
          activeEvent: {
            eventId: eventDefId,
            startTime: now,
            endTime: now + def.duration * 1000,
            progress: 0,
            rewardClaimed: false,
          },
        }));
        return true;
      },

      sgAdvanceEvent: (amount: number) => {
        const s = get();
        if (s.activeEvent.eventId === null) return false;
        const def = SG_EVENTS.find((e) => e.id === s.activeEvent.eventId);
        if (!def) return false;

        const newProgress = Math.min(s.activeEvent.progress + amount, 100);

        set((prev) => ({
          activeEvent: { ...prev.activeEvent, progress: newProgress },
        }));
        return newProgress >= 100;
      },

      sgClaimEventReward: () => {
        const s = get();
        if (s.activeEvent.eventId === null || s.activeEvent.rewardClaimed) return false;
        if (s.activeEvent.progress < 100) return false;
        const def = SG_EVENTS.find((e) => e.id === s.activeEvent.eventId);
        if (!def) return false;

        set((prev) => ({
          activeEvent: {
            eventId: null,
            startTime: null,
            endTime: null,
            progress: 0,
            rewardClaimed: false,
          },
          wisdomExp: prev.wisdomExp + def.rewardWisdom,
          wisdomPoints: prev.wisdomPoints + Math.floor(def.rewardWisdom * 0.3),
        }));
        return true;
      },
    }),
    {
      name: 'sage-grove-wire',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// =============================================================================
// Default Hook — useSageGrove()
// =============================================================================

export default function useSageGrove() {
  const store = useSGStore();

  // ---- Getter: sgGetRecruitedSages ----

  const sgGetRecruitedSages = useMemo(() => {
    return store.recruitedSages.map((sage) => {
      const def = SG_SAGES.find((s) => s.id === sage.defId);
      const grove = SG_GROVES.find((g) => g.id === sage.groveId);
      return { sage, def: def ?? null, grove: grove ?? null };
    });
  }, [store]);

  // ---- Getter: sgGetGroveStatus ----

  const sgGetGroveStatus = useMemo(() => {
    return store.groves.map((grove) => {
      const def = SG_GROVES.find((g) => g.id === grove.defId);
      const sageCount = store.recruitedSages.filter((s) => s.groveId === grove.defId).length;
      const structCount = store.structures.filter((s) => s.groveId === grove.defId).length;
      return {
        grove,
        def: def ?? null,
        sageCount,
        structCount,
        isFull: def ? sageCount >= SG_MAX_SAGES_PER_GROVE : false,
      };
    });
  }, [store]);

  // ---- Getter: sgGetCollectedScrolls ----

  const sgGetCollectedScrolls = useMemo(() => {
    return store.collectedScrolls.map((scroll) => {
      const def = SG_SCROLLS.find((s) => s.id === scroll.scrollId);
      return { scroll, def: def ?? null };
    });
  }, [store]);

  // ---- Getter: sgGetStructureInventory ----

  const sgGetStructureInventory = useMemo(() => {
    return store.structures.map((struct) => {
      const def = SG_STRUCTURES.find((s) => s.id === struct.defId);
      return { struct, def: def ?? null };
    });
  }, [store]);

  // ---- Getter: sgGetUnlockedAbilities ----

  const sgGetUnlockedAbilities = useMemo(() => {
    return store.unlockedAbilities.map((abilityId) => {
      const def = SG_ABILITIES.find((a) => a.id === abilityId);
      return { def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [store]);

  // ---- Getter: sgGetEarnedAchievements ----

  const sgGetEarnedAchievements = useMemo(() => {
    return store.achievements.map((achId) => {
      const def = SG_ACHIEVEMENTS.find((a) => a.id === achId);
      return { def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [store]);

  // ---- Getter: sgGetTitleProgress ----

  const sgGetTitleProgress = useMemo(() => {
    const currentDef = SG_TITLES.find((t) => t.id === store.currentTitle);
    const nextDef = SG_TITLES.find((t) => t.levelRequired > store.wisdomLevel);
    return {
      current: currentDef ?? null,
      next: nextDef ?? null,
      levelProgress: store.wisdomExp,
      levelTillNext: sgCalcXpRequired(store.wisdomLevel),
      percentToNext: sgCalcXpRequired(store.wisdomLevel) > 0
        ? Math.min(100, Math.round((store.wisdomExp / sgCalcXpRequired(store.wisdomLevel)) * 100))
        : 100,
    };
  }, [store]);

  // ---- Getter: sgGetOwnedRelics ----

  const sgGetOwnedRelics = useMemo(() => {
    return store.ownedRelics.map((relic) => {
      const def = SG_RELICS.find((r) => r.id === relic.relicId);
      return { relic, def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [store]);

  // ---- Getter: sgGetActiveEvent ----

  const sgGetActiveEvent = useMemo(() => {
    if (store.activeEvent.eventId === null) return null;
    const def = SG_EVENTS.find((e) => e.id === store.activeEvent.eventId);
    if (!def) return null;
    const now = Date.now();
    const endTime = store.activeEvent.endTime ?? 0;
    const timeRemaining = Math.max(0, endTime - now);
    return {
      ...def,
      progress: store.activeEvent.progress,
      rewardClaimed: store.activeEvent.rewardClaimed,
      timeRemaining,
      isExpired: timeRemaining <= 0,
      startTime: store.activeEvent.startTime,
    };
  }, [store]);

  // ---- Getter: sgGetMeditationStats ----

  const sgGetMeditationStats = useMemo(() => {
    const totalBond = store.recruitedSages.reduce((sum, s) => sum + s.bondStrength, 0);
    const avgBond = store.recruitedSages.length > 0 ? totalBond / store.recruitedSages.length : 0;
    return {
      totalMeditations: store.totalMeditations,
      totalSagesRecruited: store.totalSagesRecruited,
      averageBond: Math.round(avgBond * 10) / 10,
      uniquePaths: sgCountUniquePaths(store.recruitedSages),
      lastMeditationAt: store.lastMeditationAt,
    };
  }, [store]);

  // ---- Getter: sgGetAvailableSages ----

  const sgGetAvailableSages = useMemo(() => {
    const ownedIds = new Set(store.recruitedSages.map((s) => s.defId));
    return SG_SAGES.filter((def) => !ownedIds.has(def.id)).map((def) => {
      const cost = sgCalcRecruitCost(def);
      return { def, cost, canAfford: store.wisdomPoints >= cost };
    });
  }, [store]);

  // ---- Getter: sgGetAvailableScrolls ----

  const sgGetAvailableScrolls = useMemo(() => {
    const ownedIds = new Set(store.collectedScrolls.map((s) => s.scrollId));
    return SG_SCROLLS.filter((def) => !ownedIds.has(def.id));
  }, [store]);

  // ---- Getter: sgGetCraftableRelics ----

  const sgGetCraftableRelics = useMemo(() => {
    return SG_RELICS.filter((def) => !store.ownedRelics.find((r) => r.relicId === def.id)).map((def) => ({
      def,
      owned: false,
    }));
  }, [store]);

  // ---- Getter: sgGetUnlockableAbilities ----

  const sgGetUnlockableAbilities = useMemo(() => {
    return SG_ABILITIES.filter((def) => !store.unlockedAbilities.includes(def.id)).map((def) => ({
      def,
      meetsLevelReq: store.wisdomLevel >= def.requiredLevel,
    }));
  }, [store]);

  // ---- Getter: sgGetClaimableAchievements ----

  const sgGetClaimableAchievements = useMemo(() => {
    return SG_ACHIEVEMENTS.filter((def) => !store.achievements.includes(def.id)).map((def) => {
      let met = false;
      switch (def.conditionKey) {
        case 'totalSagesRecruited': met = store.totalSagesRecruited >= def.targetValue; break;
        case 'totalScrollsStudied': met = store.totalScrollsStudied >= def.targetValue; break;
        case 'commonScrollsStudied': met = sgCountCommonScrollsStudied(store.collectedScrolls) >= def.targetValue; break;
        case 'totalStructuresBuilt': met = store.totalStructuresBuilt >= def.targetValue; break;
        case 'maxStructureLevel': met = sgGetMaxStructureLevel(store.structures) >= def.targetValue; break;
        case 'totalRelicsFound': met = store.totalRelicsFound >= def.targetValue; break;
        case 'totalMeditations': met = store.totalMeditations >= def.targetValue; break;
        case 'uniquePathsRecruited': met = sgCountUniquePaths(store.recruitedSages) >= def.targetValue; break;
        case 'grovesUnlocked': met = store.groves.filter((g) => g.unlocked).length >= def.targetValue; break;
        case 'legendarySagesRecruited': met = sgCountLegendarySages(store.recruitedSages) >= def.targetValue; break;
        case 'wisdomLevel': met = store.wisdomLevel >= def.targetValue; break;
        default: met = false;
      }
      return { def, met };
    });
  }, [store]);

  // ---- Getter: sgGetPathDistribution ----

  const sgGetPathDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const pathKey of Object.keys(SG_PATH_LABELS)) {
      dist[pathKey] = 0;
    }
    for (const sage of store.recruitedSages) {
      const def = SG_SAGES.find((s) => s.id === sage.defId);
      if (def) {
        dist[def.path] = (dist[def.path] ?? 0) + 1;
      }
    }
    return dist;
  }, [store]);

  // ---- Getter: sgGetRarityBreakdown ----

  const sgGetRarityBreakdown = useMemo(() => {
    return sgGetRarityCounts(store.recruitedSages);
  }, [store]);

  // ---- Getter: sgGetStructureSummary ----

  const sgGetStructureSummary = useMemo(() => {
    return SG_STRUCTURE_CATEGORIES.map((cat) => ({
      category: cat,
      count: sgCountStructuresByCategory(store.structures, cat.key),
      totalBonus: sgCalcTotalStructureBonus(store.structures, cat.key),
    }));
  }, [store]);

  // ---- Getter: sgGetTopSages ----

  const sgGetTopBondedSages = useMemo(() => {
    const topInstances = sgFindTopSages(store.recruitedSages, 5);
    return topInstances.map((sage) => {
      const def = SG_SAGES.find((s) => s.id === sage.defId);
      return { sage, def: def ?? null };
    });
  }, [store]);

  // ---- Getter: sgGetWisdomOverview ----

  const sgGetWisdomOverview = useMemo(() => {
    const sanctityAvg = sgCalcGroveSanctityAverage(store.groves);
    const medBonus = store.structures.reduce((sum, si) => {
      const def = SG_STRUCTURES.find((sd) => sd.id === si.defId);
      return sum + (def?.category === 'meditation' ? si.level : 0);
    }, 0);
    const totalScrollWisdom = store.collectedScrolls.reduce((sum, sc) => {
      if (!sc.studied) return sum;
      const def = SG_SCROLLS.find((s) => s.id === sc.scrollId);
      return sum + (def?.wisdomGranted ?? 0);
    }, 0);
    return {
      wisdomLevel: store.wisdomLevel,
      wisdomExp: store.wisdomExp,
      wisdomPoints: store.wisdomPoints,
      xpToNextLevel: sgCalcXpRequired(store.wisdomLevel),
      percentToNext: sgCalcXpRequired(store.wisdomLevel) > 0
        ? Math.min(100, Math.round((store.wisdomExp / sgCalcXpRequired(store.wisdomLevel)) * 100))
        : 100,
      averageGroveSanctity: sanctityAvg,
      totalMeditationBonus: medBonus,
      totalScrollWisdomEarned: totalScrollWisdom,
      totalSagesRecruited: store.totalSagesRecruited,
      uniquePaths: sgCountUniquePaths(store.recruitedSages),
    };
  }, [store]);

  // ---- Getter: sgGetRelicPowerSummary ----

  const sgGetRelicPowerSummary = useMemo(() => {
    const equippedRelics = store.ownedRelics.filter((r) => r.equipped);
    const totalPower = equippedRelics.reduce((sum, r) => {
      const def = SG_RELICS.find((rd) => rd.id === r.relicId);
      return sum + (def?.power ?? 0);
    }, 0);
    return {
      totalOwned: store.ownedRelics.length,
      totalEquipped: equippedRelics.length,
      totalEquippedPower: totalPower,
      bonusByPath: SG_PATH_ORDER.reduce((acc, path) => {
        acc[path] = sgCalcRelicBonusByPath(store.ownedRelics, path);
        return acc;
      }, {} as Record<SGPath, number>),
    };
  }, [store]);

  // ---- Getter: sgGetGroveSanctityStatus ----

  const sgGetGroveSanctityStatus = useMemo(() => {
    return store.groves.map((grove) => {
      const def = SG_GROVES.find((g) => g.id === grove.defId);
      return {
        groveId: grove.defId,
        name: def?.name ?? 'Unknown',
        sanctity: grove.sanctity,
        unlocked: grove.unlocked,
        needsPurification: grove.unlocked && grove.sanctity < 100,
      };
    });
  }, [store]);

  // ---- Getter: sgGetEquippedRelicDetails ----

  const sgGetEquippedRelicDetails = useMemo(() => {
    return store.ownedRelics
      .filter((r) => r.equipped)
      .map((relic) => {
        const def = SG_RELICS.find((rd) => rd.id === relic.relicId);
        return {
          relic,
          def: def ?? null,
          effectivePower: def
            ? sgCalcAbilityPower('ability_grove_awakening', store.wisdomLevel, [relic])
            : 0,
        };
      })
      .filter((entry) => entry.def !== null);
  }, [store]);

  // ---- Return the sgAPI object ----

  return {
    // ---- Constants ----
    SG_GROVES,
    SG_SAGES,
    SG_SCROLLS,
    SG_STRUCTURES,
    SG_ABILITIES,
    SG_ACHIEVEMENTS,
    SG_TITLES,
    SG_RELICS,
    SG_EVENTS,
    SG_PATH_LABELS,
    SG_RARITY_LABELS,
    SG_PATH_GROVE_SYNERGY,
    SG_RARITY_MULTIPLIER,
    SG_MAX_LEVEL,
    SG_MAX_SAGES_PER_GROVE,
    SG_MAX_SCROLLS,
    SG_MEDITATION_BASE_TIME,
    SG_COLOR_SAGE_GREEN,
    SG_COLOR_PARCHMENT,
    SG_COLOR_WISDOM_GOLD,
    SG_COLOR_ANCIENT_OAK,
    SG_COLOR_MYSTIC_PURPLE,
    SG_COLOR_SKY_BLUE,
    SG_COLOR_MOONSTONE_SILVER,
    SG_COLOR_EARTH_BROWN,
    SG_RARITY_COLORS,
    SG_PATH_COLORS,
    SG_PATH_ICONS,
    SG_RARITY_ORDER,
    SG_PATH_ORDER,
    SG_RECRUIT_COST_BASE,
    SG_SCROLL_STUDY_TIME,
    SG_ABILITY_UNLOCK_COST,
    SG_PATH_ABILITY_MAP,
    SG_UNIVERSAL_ABILITIES,
    SG_STRUCTURE_CATEGORIES,

    // ---- State ----
    groves: store.groves,
    recruitedSages: store.recruitedSages,
    collectedScrolls: store.collectedScrolls,
    structures: store.structures,
    ownedRelics: store.ownedRelics,
    unlockedAbilities: store.unlockedAbilities,
    achievements: store.achievements,
    currentTitle: store.currentTitle,
    wisdomLevel: store.wisdomLevel,
    wisdomExp: store.wisdomExp,
    wisdomPoints: store.wisdomPoints,
    totalMeditations: store.totalMeditations,
    totalSagesRecruited: store.totalSagesRecruited,
    totalScrollsStudied: store.totalScrollsStudied,
    totalStructuresBuilt: store.totalStructuresBuilt,
    totalRelicsFound: store.totalRelicsFound,
    activeEvent: store.activeEvent,
    lastMeditationAt: store.lastMeditationAt,

    // ---- Actions ----
    sgRecruitSage: store.sgRecruitSage,
    sgCollectScroll: store.sgCollectScroll,
    sgStudyScroll: store.sgStudyScroll,
    sgBuildStructure: store.sgBuildStructure,
    sgUpgradeStructure: store.sgUpgradeStructure,
    sgMeditate: store.sgMeditate,
    sgFindRelic: store.sgFindRelic,
    sgEquipRelic: store.sgEquipRelic,
    sgUnequipRelic: store.sgUnequipRelic,
    sgUnlockAbility: store.sgUnlockAbility,
    sgActivateAbility: store.sgActivateAbility,
    sgClaimAchievement: store.sgClaimAchievement,
    sgSetTitle: store.sgSetTitle,
    sgUnlockGrove: store.sgUnlockGrove,
    sgPurifyGrove: store.sgPurifyGrove,
    sgStartEvent: store.sgStartEvent,
    sgAdvanceEvent: store.sgAdvanceEvent,
    sgClaimEventReward: store.sgClaimEventReward,

    // ---- Computed Getters ----
    sgGetRecruitedSages,
    sgGetGroveStatus,
    sgGetCollectedScrolls,
    sgGetStructureInventory,
    sgGetUnlockedAbilities,
    sgGetEarnedAchievements,
    sgGetTitleProgress,
    sgGetOwnedRelics,
    sgGetActiveEvent,
    sgGetMeditationStats,
    sgGetAvailableSages,
    sgGetAvailableScrolls,
    sgGetCraftableRelics,
    sgGetUnlockableAbilities,
    sgGetClaimableAchievements,
    sgGetPathDistribution,
    sgGetRarityBreakdown,
    sgGetStructureSummary,
    sgGetTopBondedSages,
    sgGetWisdomOverview,
    sgGetRelicPowerSummary,
    sgGetGroveSanctityStatus,
    sgGetEquippedRelicDetails,
  };
}
