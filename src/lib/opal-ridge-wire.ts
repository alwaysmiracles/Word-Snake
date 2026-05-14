import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Opal Ridge (蛋白石山脊) — Wire Module
//
// A luminous mountain ridge where opalescent creatures live
// among shimmering crystal peaks and prismatic caverns.
// Players hatch creatures, scale peaks, build structures,
// activate artifacts, face ridge events, and ascend titles.
//
// Storage key: opal-ridge-save
// Prefix: or / OR_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type OrRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type OrSpecies =
  | 'opal_dragon'
  | 'prism_fox'
  | 'crystal_eagle'
  | 'shimmer_stag'
  | 'iridescent_serpent'
  | 'luminous_moth'
  | 'aurora_wolf';

type OrAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type OrStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'crystalYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type OrMaterialCategory = 'crystal' | 'mineral' | 'stone' | 'light' | 'gem' | 'metal' | 'ether';

// ---- Creature Definitions ----

interface OrCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: OrSpecies;
  readonly rarity: OrRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface OrChamberDef {
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

interface OrMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: OrRarity;
  readonly value: number;
  readonly category: OrMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface OrStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: OrStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface OrAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: OrAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: OrRarity;
}

// ---- Achievement Definitions ----

interface OrAchievementDef {
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

interface OrTitleDef {
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

interface OrArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: OrRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface OrEventDef {
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

interface OrOwnedCreature {
  creatureId: string;
  instanceId: string;
  craftedAt: number;
  timesUsed: number;
  nickname: string;
}

interface OrChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface OrStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface OrArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface OrAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface OrAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface OrInventoryItem {
  materialId: string;
  count: number;
}

interface OrEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface OrStats {
  totalHatched: number;
  totalPeaksScaled: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface OrTitleProgress {
  current: OrTitleDef;
  next: OrTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: OR_ CONSTANTS
// ============================================================

const OR_SAVE_KEY = 'opal-ridge-save';
const OR_MAX_LEVEL = 50;
const OR_STARTING_COINS = 300;
const OR_STARTING_XP = 0;
const OR_XP_BASE = 100;
const OR_XP_SCALE = 1.5;
const OR_AUTO_SAVE_MS = 15000;
const OR_EVENT_DURATION_MS = 60000;
const OR_MAX_INVENTORY_ITEM = 999;
const OR_MAX_OWNED_CREATURES = 100;
const OR_COOLDOWN_TICK_MS = 1000;
const OR_SPECIES_COUNT = 7;
const OR_CREATURE_COUNT = 35;
const OR_CHAMBER_COUNT = 8;
const OR_MATERIAL_COUNT = 12;
const OR_STRUCTURE_COUNT = 8;
const OR_ABILITY_COUNT = 8;
const OR_ACHIEVEMENT_COUNT = 10;
const OR_TITLE_COUNT = 8;
const OR_ARTIFACT_COUNT = 6;
const OR_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const OR_OPAL_WHITE = '#F8F9F9';
const OR_PRISM_PINK = '#E8DAEF';
const OR_CRYSTAL_BLUE = '#AED6F1';
const OR_PEAK_GRAY = '#85929E';
const OR_SUNSET_ORANGE = '#F0B27A';
const OR_AURORA_GREEN = '#82E0AA';
const OR_DEEP_PURPLE = '#7D3C98';

const OR_RARITY_COLORS: Record<OrRarity, string> = {
  common: '#A0A090',
  uncommon: '#AED6F1',
  rare: '#E8DAEF',
  epic: '#F0B27A',
  legendary: '#82E0AA',
};

const OR_SPECIES_COLORS: Record<OrSpecies, string> = {
  opal_dragon: OR_OPAL_WHITE,
  prism_fox: OR_PRISM_PINK,
  crystal_eagle: OR_CRYSTAL_BLUE,
  shimmer_stag: OR_SUNSET_ORANGE,
  iridescent_serpent: OR_DEEP_PURPLE,
  luminous_moth: '#F9E79F',
  aurora_wolf: OR_AURORA_GREEN,
};

const OR_ALL_COLORS = [
  OR_OPAL_WHITE,
  OR_PRISM_PINK,
  OR_CRYSTAL_BLUE,
  OR_PEAK_GRAY,
  OR_SUNSET_ORANGE,
  OR_AURORA_GREEN,
  OR_DEEP_PURPLE,
];

// ============================================================
// SECTION 4: OR_SPECIES — 7 Species Types
// ============================================================

const OR_SPECIES: { id: OrSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'opal_dragon',
    name: 'Opal Dragon',
    description: 'Majestic dragons whose scales shift through every color of the spectrum like living opals.',
    lore: 'Opal Dragons were born when a bolt of aurora lightning struck a mountain of pure crystal at the dawn of time.',
    emoji: '🐉',
    color: OR_OPAL_WHITE,
  },
  {
    id: 'prism_fox',
    name: 'Prism Fox',
    description: 'Clever foxes with fur that refracts moonlight into dazzling rainbow trails.',
    lore: 'Prism Foxes are said to lead lost travelers home by following the path of their prismatic tail.',
    emoji: '🦊',
    color: OR_PRISM_PINK,
  },
  {
    id: 'crystal_eagle',
    name: 'Crystal Eagle',
    description: 'Soaring eagles with wings of transparent crystal that scatter sunlight like stained glass.',
    lore: 'Crystal Eagles nest at the highest peaks, building aeries from pure quartz and moonstone.',
    emoji: '🦅',
    color: OR_CRYSTAL_BLUE,
  },
  {
    id: 'shimmer_stag',
    name: 'Shimmer Stag',
    description: 'Graceful stags with antlers made of living opal, radiating warm prismatic light.',
    lore: 'The Shimmer Stag sheds its antlers each solstice, leaving behind pools of liquid opal.',
    emoji: '🦌',
    color: OR_SUNSET_ORANGE,
  },
  {
    id: 'iridescent_serpent',
    name: 'Iridescent Serpent',
    description: 'Ancient serpents that glide through crystal caverns, scales shimmering with oil-slick iridescence.',
    lore: 'Iridescent Serpents are the oldest creatures on the ridge, predating the mountains themselves.',
    emoji: '🐍',
    color: OR_DEEP_PURPLE,
  },
  {
    id: 'luminous_moth',
    name: 'Luminous Moth',
    description: 'Giant moths with wings that glow with captured starlight, illuminating dark caverns.',
    lore: 'Luminous Moths gather starlight on clear nights and release it when the ridge goes dark.',
    emoji: '🦋',
    color: '#F9E79F',
  },
  {
    id: 'aurora_wolf',
    name: 'Aurora Wolf',
    description: 'Wolf packs that run along the ridge under aurora-lit skies, fur crackling with northern lights.',
    lore: 'Aurora Wolves howl at the sky and the aurora answers, painting colors across the clouds.',
    emoji: '🐺',
    color: OR_AURORA_GREEN,
  },
];

// ============================================================
// SECTION 5: OR_CREATURES — 35 Creatures (5 tiers x 7 species)
// ============================================================

const OR_CREATURES: OrCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'opal_dragon_common', name: 'Opal Whelp', species: 'opal_dragon', rarity: 'common',
    description: 'A baby dragon with faintly iridescent scales just beginning to show color.',
    lore: 'Opal Whelps are born completely white and develop their full spectrum of colors by adulthood.',
    emoji: '🐉', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'prism_fox_common', name: 'Dusk Kit', species: 'prism_fox', rarity: 'common',
    description: 'A young fox cub with a single prismatic stripe down its back.',
    lore: 'Dusk Kits are most active at twilight when their stripe catches the last rays of sun.',
    emoji: '🦊', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'crystal_eagle_common', name: 'Fledgling Hawk', species: 'crystal_eagle', rarity: 'common',
    description: 'A young eagle with translucent feathers that glow faintly in sunlight.',
    lore: 'Fledgling Hawks cannot yet fly but their feathers already refract light beautifully.',
    emoji: '🦅', power: 9, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'shimmer_stag_common', name: 'Fawn of Light', species: 'shimmer_stag', rarity: 'common',
    description: 'A gentle fawn with tiny budding antlers that emit a soft warm glow.',
    lore: 'Fawns of Light are born during meteor showers, absorbing the falling star energy.',
    emoji: '🦌', power: 7, defense: 7, cost: 16, xpReward: 6,
  },
  {
    id: 'iridescent_serpent_common', name: 'Rainbow Worm', species: 'iridescent_serpent', rarity: 'common',
    description: 'A small serpentine creature with scales that shimmer between two or three colors.',
    lore: 'Rainbow Worms are harmless but beautiful, often kept as pets by ridge dwellers.',
    emoji: '🐍', power: 6, defense: 8, cost: 18, xpReward: 7,
  },
  {
    id: 'luminous_moth_common', name: 'Glow Pupa', species: 'luminous_moth', rarity: 'common',
    description: 'A cocoon that emits a steady soft glow, about to emerge as a luminous moth.',
    lore: 'Glow Pupae are placed at crossroads on the ridge to guide travelers at night.',
    emoji: '🦋', power: 5, defense: 5, cost: 14, xpReward: 6,
  },
  {
    id: 'aurora_wolf_common', name: 'Twilight Pup', species: 'aurora_wolf', rarity: 'common',
    description: 'A young wolf pup with faintly glowing fur that hints at future aurora power.',
    lore: 'Twilight Pups are born in litters of seven, one for each color of the aurora.',
    emoji: '🐺', power: 9, defense: 7, cost: 20, xpReward: 8,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'opal_dragon_uncommon', name: 'Pearl Drake', species: 'opal_dragon', rarity: 'uncommon',
    description: 'A juvenile dragon whose scales now shimmer with pearlescent blues and pinks.',
    lore: 'Pearl Drakes can breathe a mist that causes temporary color-blindness in predators.',
    emoji: '🐉', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'prism_fox_uncommon', name: 'Prism Runner', species: 'prism_fox', rarity: 'uncommon',
    description: 'A swift fox whose entire coat splits light into rainbow afterimages when running.',
    lore: 'Prism Runners are so fast they leave visible spectral trails that persist for seconds.',
    emoji: '🦊', power: 20, defense: 16, cost: 55, xpReward: 18,
  },
  {
    id: 'crystal_eagle_uncommon', name: 'Quartz Talon', species: 'crystal_eagle', rarity: 'uncommon',
    description: 'An eagle with quartz-reinforced talons that can grip the smoothest crystal surfaces.',
    lore: 'Quartz Talons perch on sheer cliff faces that no other creature can scale.',
    emoji: '🦅', power: 21, defense: 17, cost: 58, xpReward: 19,
  },
  {
    id: 'shimmer_stag_uncommon', name: 'Gilded Antler', species: 'shimmer_stag', rarity: 'uncommon',
    description: 'A young stag with antlers that gleam like burnished gold in the morning light.',
    lore: 'Gilded Antlers shed antlers that are prized for crafting luminous tools and weapons.',
    emoji: '🦌', power: 18, defense: 20, cost: 65, xpReward: 22,
  },
  {
    id: 'iridescent_serpent_uncommon', name: 'Oil-Slick Viper', species: 'iridescent_serpent', rarity: 'uncommon',
    description: 'A viper with scales that display the full spectrum of iridescent colors when threatened.',
    lore: 'Oil-Slick Vipers use their mesmerizing colors to hypnotize prey before striking.',
    emoji: '🐍', power: 19, defense: 15, cost: 50, xpReward: 17,
  },
  {
    id: 'luminous_moth_uncommon', name: 'Starlight Moth', species: 'luminous_moth', rarity: 'uncommon',
    description: 'A moth whose wings glow steadily with captured starlight, illuminating entire caverns.',
    lore: 'Starlight Moths release their stored light in pulses, creating a natural lighthouse effect.',
    emoji: '🦋', power: 15, defense: 14, cost: 48, xpReward: 16,
  },
  {
    id: 'aurora_wolf_uncommon', name: 'Aurora Scout', species: 'aurora_wolf', rarity: 'uncommon',
    description: 'A wolf with fur that crackles with green and purple aurora energy during patrols.',
    lore: 'Aurora Scouts can sense magnetic fields and navigate perfectly in any weather.',
    emoji: '🐺', power: 24, defense: 19, cost: 62, xpReward: 21,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'opal_dragon_rare', name: 'Fire Opal Wyrm', species: 'opal_dragon', rarity: 'rare',
    description: 'A fierce dragon radiating fiery opal light, scales blazing between orange and deep red.',
    lore: 'Fire Opal Wyrms are said to be born inside dying volcanoes, absorbing the last magma energy.',
    emoji: '🐉', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'prism_fox_rare', name: 'Diamond Fox', species: 'prism_fox', rarity: 'rare',
    description: 'A breathtaking fox with fur that refracts all light into perfect prismatic patterns.',
    lore: 'Diamond Foxes are invisible in direct sunlight — their fur blends perfectly with the spectrum.',
    emoji: '🦊', power: 38, defense: 30, cost: 180, xpReward: 45,
  },
  {
    id: 'crystal_eagle_rare', name: 'Sapphire Raptor', species: 'crystal_eagle', rarity: 'rare',
    description: 'A massive eagle with deep sapphire crystal feathers and eyes that pierce any darkness.',
    lore: 'Sapphire Raptors dive from the stratosphere, their crystal feathers cutting the air silently.',
    emoji: '🦅', power: 37, defense: 28, cost: 190, xpReward: 48,
  },
  {
    id: 'shimmer_stag_rare', name: 'Coronach Stag', species: 'shimmer_stag', rarity: 'rare',
    description: 'A majestic stag crowned with antlers shaped like miniature auroras, alive with light.',
    lore: 'The Coronach Stag appears only during the strongest auroras, leading a procession of light.',
    emoji: '🦌', power: 35, defense: 38, cost: 220, xpReward: 55,
  },
  {
    id: 'iridescent_serpent_rare', name: 'Chromatic Python', species: 'iridescent_serpent', rarity: 'rare',
    description: 'A massive python whose scales cycle through every color as it moves, mesmerizing prey.',
    lore: 'Chromatic Pythons are worshipped as living rainbows by the ridge inhabitants.',
    emoji: '🐍', power: 36, defense: 33, cost: 195, xpReward: 49,
  },
  {
    id: 'luminous_moth_rare', name: 'Comet Moth', species: 'luminous_moth', rarity: 'rare',
    description: 'A giant moth trailing comet-like streams of luminous dust across the night sky.',
    lore: 'Comet Moths are attracted to falling stars and often catch meteor dust in their wings.',
    emoji: '🦋', power: 32, defense: 27, cost: 175, xpReward: 44,
  },
  {
    id: 'aurora_wolf_rare', name: 'Boreas Alpha', species: 'aurora_wolf', rarity: 'rare',
    description: 'The alpha of an aurora wolf pack, its howl summoning visible waves of northern light.',
    lore: 'When the Boreas Alpha howls, the aurora visibly descends to meet the ridge.',
    emoji: '🐺', power: 42, defense: 36, cost: 250, xpReward: 60,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'opal_dragon_epic', name: 'Spectrum Emperor', species: 'opal_dragon', rarity: 'epic',
    description: 'An ancient dragon whose body displays the full visible spectrum in shifting waves of color.',
    lore: 'The Spectrum Emperor is so radiant that creatures evolve faster in its presence.',
    emoji: '🐉', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'prism_fox_epic', name: 'Prismatic Phantom', species: 'prism_fox', rarity: 'epic',
    description: 'A fox that exists simultaneously in multiple light wavelengths, nearly impossible to track.',
    lore: 'The Prismatic Phantom leaves no footprints — only afterimages of pure color that fade slowly.',
    emoji: '🦊', power: 65, defense: 55, cost: 750, xpReward: 110,
  },
  {
    id: 'crystal_eagle_epic', name: 'Diamond-Wing Lord', species: 'crystal_eagle', rarity: 'epic',
    description: 'A colossal eagle with wings of flawless diamond that blinds enemies with reflected light.',
    lore: 'Diamond-Wing Lords nest in the sun, plucking diamonds from solar flares to reinforce their wings.',
    emoji: '🦅', power: 68, defense: 58, cost: 780, xpReward: 115,
  },
  {
    id: 'shimmer_stag_epic', name: 'Aurora Monarch', species: 'shimmer_stag', rarity: 'epic',
    description: 'The king of all stags, its antlers forming a living aurora that warms the entire ridge.',
    lore: 'The Aurora Monarch\'s antlers can be seen from hundreds of miles away on clear nights.',
    emoji: '🦌', power: 62, defense: 65, cost: 850, xpReward: 130,
  },
  {
    id: 'iridescent_serpent_epic', name: 'Prism Ouroboros', species: 'iridescent_serpent', rarity: 'epic',
    description: 'A great serpent eating its own tail, its scales forming an infinite loop of prismatic energy.',
    lore: 'The Prism Ouroboros represents the eternal cycle of light on the ridge — birth, radiance, return.',
    emoji: '🐍', power: 64, defense: 60, cost: 820, xpReward: 125,
  },
  {
    id: 'luminous_moth_epic', name: 'Nebula Moth', species: 'luminous_moth', rarity: 'epic',
    description: 'A moth so luminous it resembles a miniature nebula, bathing surroundings in cosmic light.',
    lore: 'Nebula Moths carry fragments of actual nebulae in their wings, glowing with stellar energy.',
    emoji: '🦋', power: 58, defense: 52, cost: 740, xpReward: 108,
  },
  {
    id: 'aurora_wolf_epic', name: 'Polaris Warg', species: 'aurora_wolf', rarity: 'epic',
    description: 'A legendary wolf wrapped in a permanent aurora, eyes burning with the light of the North Star.',
    lore: 'Polaris Wargs can howl so powerfully that new auroras form in the sky above them.',
    emoji: '🐺', power: 72, defense: 62, cost: 900, xpReward: 140,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'opal_dragon_legendary', name: 'Eternal Opal Sovereign', species: 'opal_dragon', rarity: 'legendary',
    description: 'The first opal dragon, born when light itself crystallized into living form at the creation of the ridge.',
    lore: 'The Eternal Opal Sovereign has witnessed every sunrise and sunset since the mountains first rose.',
    emoji: '🐉', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'prism_fox_legendary', name: 'Rainbow Ancestor', species: 'prism_fox', rarity: 'legendary',
    description: 'The original fox whose prismatic fur created the first rainbow ever seen in the sky.',
    lore: 'The Rainbow Ancestor still runs across the ridge during storms, painting rainbows in its wake.',
    emoji: '🦊', power: 115, defense: 98, cost: 2800, xpReward: 280,
  },
  {
    id: 'crystal_eagle_legendary', name: 'Celestial Roc', species: 'crystal_eagle', rarity: 'legendary',
    description: 'A roc of pure crystal so vast it casts rainbow shadows across the entire ridge when it flies.',
    lore: 'The Celestial Roc nests on the moon and descends to the ridge only during eclipses.',
    emoji: '🦅', power: 118, defense: 100, cost: 3100, xpReward: 310,
  },
  {
    id: 'shimmer_stag_legendary', name: 'World-Antler Guardian', species: 'shimmer_stag', rarity: 'legendary',
    description: 'A stag whose antlers span the horizon, holding up the aurora like pillars of living light.',
    lore: 'The World-Antler Guardian\'s antlers are the source of all auroras visible from the ridge.',
    emoji: '🦌', power: 110, defense: 112, cost: 3200, xpReward: 320,
  },
  {
    id: 'iridescent_serpent_legendary', name: 'Chromatic World Serpent', species: 'iridescent_serpent', rarity: 'legendary',
    description: 'A world-spanning serpent whose body encircles the ridge, scales containing every color in existence.',
    lore: 'The Chromatic World Serpent sleeps curled around the base of the mountain, dreaming new colors into being.',
    emoji: '🐍', power: 108, defense: 95, cost: 2900, xpReward: 290,
  },
  {
    id: 'luminous_moth_legendary', name: 'Solar Moth', species: 'luminous_moth', rarity: 'legendary',
    description: 'A moth that flies into the sun each dawn and returns at dusk carrying pure solar light.',
    lore: 'The Solar Moth is the reason the ridge glows at night — it distributes captured sunlight across the peaks.',
    emoji: '🦋', power: 105, defense: 92, cost: 2700, xpReward: 270,
  },
  {
    id: 'aurora_wolf_legendary', name: 'Aurora Fenrir', species: 'aurora_wolf', rarity: 'legendary',
    description: 'The mythical wolf of the northern lights, whose fur IS the aurora given physical form.',
    lore: 'The Aurora Fenrir runs across the sky each night, and where its paws touch the earth, springs of liquid opal form.',
    emoji: '🐺', power: 125, defense: 110, cost: 3500, xpReward: 350,
  },
];

// ============================================================
// SECTION 6: OR_CHAMBERS — 8 Ridge Peaks / Caverns
// ============================================================

const OR_CHAMBERS: OrChamberDef[] = [
  {
    id: 'mossy_base', name: 'Mossy Base Camp', emoji: '⛺',
    description: 'A sheltered camp at the foot of Opal Ridge, where moss-covered boulders glow faintly at dusk.',
    lore: 'The Mossy Base Camp was established by the first ridge explorers who noticed the rocks glowing.',
    level: 1, resources: ['opal_shard', 'ridge_moss', 'pebble_crystal'], capacity: 10,
    unlockLevel: 1, ambientColor: OR_AURORA_GREEN, dangerLevel: 1,
  },
  {
    id: 'prism_gorge', name: 'Prism Gorge', emoji: '🌈',
    description: 'A narrow gorge where sunlight splits into rainbows through natural crystal formations.',
    lore: 'Prism Gorge contains the highest natural concentration of prismatic crystals on the ridge.',
    level: 3, resources: ['prismatic_dust', 'crystal_quartz', 'sunstone'], capacity: 15,
    unlockLevel: 3, ambientColor: OR_PRISM_PINK, dangerLevel: 2,
  },
  {
    id: 'echo_cavern', name: 'Echo Cavern', emoji: '🕳️',
    description: 'A vast underground cavern where every sound produces shimmering visual echoes in light.',
    lore: 'Echo Cavern was discovered when a climber\'s shout caused the walls to flash with color.',
    level: 5, resources: ['echo_gem', 'sonic_crystal', 'cavern_pearl'], capacity: 20,
    unlockLevel: 5, ambientColor: OR_CRYSTAL_BLUE, dangerLevel: 3,
  },
  {
    id: 'aurora_pass', name: 'Aurora Pass', emoji: '🏔️',
    description: 'A high mountain pass where the aurora descends so low you can walk through it.',
    lore: 'Aurora Pass is only accessible when the northern lights are active, creating a living tunnel of light.',
    level: 10, resources: ['aurora_fiber', 'polar_glass', 'ridge_ice'], capacity: 25,
    unlockLevel: 10, ambientColor: OR_AURORA_GREEN, dangerLevel: 4,
  },
  {
    id: 'opal_mine', name: 'Opal Mine', emoji: '⛏️',
    description: 'A deep mine filled with raw opals of every color, glowing like buried stars.',
    lore: 'The Opal Mine is the source of all opal on the ridge, replenished by geothermal crystal growth.',
    level: 15, resources: ['raw_opal', 'fire_opal', 'black_opal'], capacity: 30,
    unlockLevel: 15, ambientColor: OR_SUNSET_ORANGE, dangerLevel: 5,
  },
  {
    id: 'crystal_summit', name: 'Crystal Summit', emoji: '🔱',
    description: 'The highest peak of Opal Ridge, capped with a crown of pure crystal spires.',
    lore: 'Crystal Summit is where the first opal dragon was sighted, circling the peak at sunrise.',
    level: 20, resources: ['summit_shard', 'sky_crystal', 'cloud_opal'], capacity: 35,
    unlockLevel: 20, ambientColor: OR_OPAL_WHITE, dangerLevel: 6,
  },
  {
    id: 'prismatic_hollow', name: 'Prismatic Hollow', emoji: '💎',
    description: 'A hidden hollow deep within the ridge where all light becomes perfectly prismatic.',
    lore: 'The Prismatic Hollow was formed when a meteor of pure prism crystal struck the mountain millennia ago.',
    level: 30, resources: ['pure_prism', 'spectrum_core', 'light_essence'], capacity: 40,
    unlockLevel: 30, ambientColor: OR_DEEP_PURPLE, dangerLevel: 7,
  },
  {
    id: 'deep_shimmer_fault', name: 'Deep Shimmer Fault', emoji: '✨',
    description: 'The deepest rift in the ridge, where raw light energy leaks from cracks in reality.',
    lore: 'The Deep Shimmer Fault is where the boundary between the material world and the light realm is thinnest.',
    level: 40, resources: ['raw_light', 'void_opal', 'eternal_spark'], capacity: 50,
    unlockLevel: 40, ambientColor: OR_PEAK_GRAY, dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: OR_MATERIALS — 12 Materials
// ============================================================

const OR_MATERIALS: OrMaterialDef[] = [
  {
    id: 'opal_shard', name: 'Opal Shard', emoji: '💠', rarity: 'common', value: 5,
    category: 'crystal', craftBonus: 1,
    description: 'A fragment of raw opal that shimmers with faint rainbow reflections.',
    lore: 'Opal Shards are the most common material found on the ridge, scattered across every trail.',
  },
  {
    id: 'ridge_moss', name: 'Ridge Moss', emoji: '🌿', rarity: 'common', value: 4,
    category: 'stone', craftBonus: 1,
    description: 'Bioluminescent moss that grows on north-facing ridge rocks, glowing faintly green.',
    lore: 'Ridge Moss absorbs starlight and releases it slowly, keeping the base camp paths lit.',
  },
  {
    id: 'pebble_crystal', name: 'Pebble Crystal', emoji: '🪨', rarity: 'common', value: 3,
    category: 'stone', craftBonus: 1,
    description: 'Smooth, tumbled crystals found in ridge streams, faintly warm to the touch.',
    lore: 'Pebble Crystals are naturally polished by the glacier-fed streams of the ridge.',
  },
  {
    id: 'prismatic_dust', name: 'Prismatic Dust', emoji: '✨', rarity: 'uncommon', value: 15,
    category: 'light', craftBonus: 3,
    description: 'Fine dust that separates light into its component colors when disturbed.',
    lore: 'Prismatic Dust is collected from the air in Prism Gorge using fine crystal nets.',
  },
  {
    id: 'crystal_quartz', name: 'Crystal Quartz', emoji: '🔷', rarity: 'uncommon', value: 18,
    category: 'crystal', craftBonus: 4,
    description: 'Clear quartz crystals that amplify and focus light energy from the ridge.',
    lore: 'Crystal Quartz from the ridge is uniquely pure, containing no impurities from volcanic activity.',
  },
  {
    id: 'echo_gem', name: 'Echo Gem', emoji: '💎', rarity: 'uncommon', value: 20,
    category: 'gem', craftBonus: 4,
    description: 'A gem that stores sound vibrations and converts them into visible light pulses.',
    lore: 'Echo Gems from Echo Cavern contain the recorded sounds of every creature that has ever visited.',
  },
  {
    id: 'aurora_fiber', name: 'Aurora Fiber', emoji: '🧶', rarity: 'rare', value: 55,
    category: 'light', craftBonus: 7,
    description: 'Threads of solidified aurora light, soft as silk and warm to the touch.',
    lore: 'Aurora Fiber is woven into the finest garments on the ridge, glowing softly at night.',
  },
  {
    id: 'raw_opal', name: 'Raw Opal', emoji: '🔮', rarity: 'rare', value: 60,
    category: 'crystal', craftBonus: 8,
    description: 'Uncut opal stone pulsing with internal light that shifts between colors.',
    lore: 'Raw Opals are alive in a sense — they respond to the emotions of nearby creatures.',
  },
  {
    id: 'summit_shard', name: 'Summit Shard', emoji: '🏔️', rarity: 'rare', value: 65,
    category: 'crystal', craftBonus: 8,
    description: 'A crystal shard from the very peak of the ridge, containing concentrated summit energy.',
    lore: 'Summit Shards are harvested during lightning storms when the peak crystals fracture naturally.',
  },
  {
    id: 'pure_prism', name: 'Pure Prism', emoji: '🔺', rarity: 'epic', value: 180,
    category: 'gem', craftBonus: 14,
    description: 'A flawlessly cut prism of unknown origin that creates perfect rainbow spectrums from any light.',
    lore: 'Pure Prisms are found only in the Prismatic Hollow and cannot be artificially reproduced.',
  },
  {
    id: 'spectrum_core', name: 'Spectrum Core', emoji: '🌟', rarity: 'epic', value: 220,
    category: 'ether', craftBonus: 16,
    description: 'The crystallized heart of a prismatic reaction, containing all visible wavelengths.',
    lore: 'Spectrum Cores are the most powerful crafting material on the ridge, usable only by master artisans.',
  },
  {
    id: 'raw_light', name: 'Raw Light', emoji: '💡', rarity: 'legendary', value: 800,
    category: 'ether', craftBonus: 30,
    description: 'Solidified light from the deepest fault in the ridge, warm and impossibly bright.',
    lore: 'Raw Light is not technically a material — it is light itself given physical form by the fault.',
  },
];

// ============================================================
// SECTION 8: OR_STRUCTURES — 8 Structures
// ============================================================

const OR_STRUCTURES: OrStructureDef[] = [
  {
    id: 'hatchery', name: 'Crystal Hatchery', emoji: '🥚',
    description: 'A warm crystalline nest for hatching new opalescent creatures from eggs.',
    lore: 'The Crystal Hatchery uses concentrated ridge sunlight to incubate eggs at the perfect temperature.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'prism_tower', name: 'Prism Tower', emoji: '🗼',
    description: 'A tall tower of aligned prisms that focuses and amplifies ridge light for all creatures.',
    lore: 'The Prism Tower can be seen from every point on the ridge, acting as a beacon and power source.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'aurora_garden', name: 'Aurora Garden', emoji: '🌸',
    description: 'A garden where aurora-touched plants grow, providing herbs that boost creature XP.',
    lore: 'Aurora Gardens bloom year-round thanks to the constant flow of aurora energy from the pass.',
    baseCost: 60, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'xpBonus', bonusPerLevel: 2,
  },
  {
    id: 'opal_refinery', name: 'Opal Refinery', emoji: '🏭',
    description: 'Processes raw opals and ridge materials into refined crafting components.',
    lore: 'The Opal Refinery uses prismatic light to cut and polish materials to molecular perfection.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 5,
  },
  {
    id: 'crystal_bastion', name: 'Crystal Bastion', emoji: '🏰',
    description: 'A fortress of interlocking crystal walls that protects the ridge settlement from threats.',
    lore: 'The Crystal Bastion refracts all incoming attacks, dispersing their energy harmlessly as light.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'light_silo', name: 'Light Silo', emoji: '🗼',
    description: 'Stores excess ridge light for use during dark periods and winter storms.',
    lore: 'The Light Silo can power the entire ridge for three months on a full charge.',
    baseCost: 90, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'summit_observatory', name: 'Summit Observatory', emoji: '🔭',
    description: 'A high-altitude observatory that reveals hidden chambers and resources across the ridge.',
    lore: 'The Summit Observatory can see through clouds and rock using prismatic lens technology.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 4,
  },
  {
    id: 'spectrum_forge', name: 'Spectrum Forge', emoji: '🔨',
    description: 'A forge that uses concentrated spectrum energy to enhance creature abilities and artifacts.',
    lore: 'The Spectrum Forge was built inside the Prismatic Hollow, drawing power from the infinite light within.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 3,
  },
];

// ============================================================
// SECTION 9: OR_ABILITIES — 8 Abilities
// ============================================================

const OR_ABILITIES: OrAbilityDef[] = [
  {
    id: 'prismatic_breath', name: 'Prismatic Breath', category: 'offensive',
    description: 'Unleashes a beam of concentrated prismatic light that damages and confuses enemies.',
    lore: 'Prismatic Breath was the first ability developed by opal dragons, using their internal light.',
    emoji: '🌈', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'crystal_storm', name: 'Crystal Storm', category: 'offensive',
    description: 'Summons a storm of razor-sharp crystal shards from the sky, devastating a wide area.',
    lore: 'Crystal Storms occur naturally on the ridge during intense aurora activity.',
    emoji: '⚡', cooldown: 10000, power: 60, rarityRequired: 'rare',
  },
  {
    id: 'aurora_shield', name: 'Aurora Shield', category: 'defensive',
    description: 'Wraps all allies in a shield of aurora light that absorbs and reflects incoming damage.',
    lore: 'The Aurora Shield converts absorbed damage into healing energy for the creatures it protects.',
    emoji: '🛡️', cooldown: 8000, power: 40, rarityRequired: 'uncommon',
  },
  {
    id: 'opal_ward', name: 'Opal Ward', category: 'defensive',
    description: 'Encases a single creature in a cocoon of solid opal, making them temporarily invulnerable.',
    lore: 'Opal Wards are impenetrable but the enclosed creature cannot move or act while warded.',
    emoji: '💎', cooldown: 15000, power: 75, rarityRequired: 'epic',
  },
  {
    id: 'light_step', name: 'Light Step', category: 'utility',
    description: 'Transforms a creature into pure light for a few seconds, allowing instant repositioning.',
    lore: 'Light Step leaves a brief afterimage that can distract enemies.',
    emoji: '💫', cooldown: 4000, power: 15, rarityRequired: 'common',
  },
  {
    id: 'spectrum_sight', name: 'Spectrum Sight', category: 'utility',
    description: 'Reveals hidden resources, secret passages, and enemy weaknesses using full-spectrum vision.',
    lore: 'Spectrum Sight lets you see through any material by analyzing the light passing through it.',
    emoji: '👁️', cooldown: 6000, power: 20, rarityRequired: 'uncommon',
  },
  {
    id: 'summon_aurora', name: 'Summon Aurora', category: 'summon',
    description: 'Calls down a concentrated aurora that buffs all creatures and reveals hidden chambers.',
    lore: 'Summon Aurora creates a localized aurora that persists for several minutes, empowering everything it touches.',
    emoji: '🌌', cooldown: 20000, power: 50, rarityRequired: 'rare',
  },
  {
    id: 'call_eternal_opal', name: 'Call Eternal Opal', category: 'summon',
    description: 'Summons a fragment of the Eternal Opal Sovereign to fight alongside you temporarily.',
    lore: 'Call Eternal Opal channels the power of the ridge\'s first dragon, manifesting a spectral avatar.',
    emoji: '🐉', cooldown: 45000, power: 90, rarityRequired: 'legendary',
  },
];

// ============================================================
// SECTION 10: OR_ACHIEVEMENTS — 10 Achievements
// ============================================================

const OR_ACHIEVEMENTS: OrAchievementDef[] = [
  {
    id: 'or_ach_first_hatch', name: 'First Light', emoji: '🥚',
    description: 'Hatch your first opalescent creature and welcome it to the ridge.',
    conditionKey: 'totalHatched', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'or_ach_hatch_10', name: 'Ridge Keeper', emoji: '🏔️',
    description: 'Hatch 10 creatures and establish yourself as a keeper of the ridge.',
    conditionKey: 'totalHatched', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'or_ach_hatch_25', name: 'Opal Guardian', emoji: '💎',
    description: 'Hatch 25 creatures to prove your dedication to protecting the ridge.',
    conditionKey: 'totalHatched', targetValue: 25, rewardXp: 500, rewardCoins: 75,
  },
  {
    id: 'or_ach_peak_3', name: 'Peak Scaler', emoji: '🧗',
    description: 'Scale and explore 3 different ridge peaks and caverns.',
    conditionKey: 'totalPeaksScaled', targetValue: 3, rewardXp: 100, rewardCoins: 20,
  },
  {
    id: 'or_ach_peak_all', name: 'Ridge Master', emoji: '🗺️',
    description: 'Explore all 8 ridge peaks and caverns to complete the ridge map.',
    conditionKey: 'totalPeaksScaled', targetValue: 8, rewardXp: 1000, rewardCoins: 100,
  },
  {
    id: 'or_ach_build_5', name: 'Crystal Architect', emoji: '🏗️',
    description: 'Build 5 structures to establish a permanent ridge settlement.',
    conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXp: 300, rewardCoins: 40,
  },
  {
    id: 'or_ach_artifact_3', name: 'Relic Finder', emoji: '🏺',
    description: 'Activate 3 ancient ridge artifacts and unlock their hidden powers.',
    conditionKey: 'totalArtifacts', targetValue: 3, rewardXp: 500, rewardCoins: 60,
  },
  {
    id: 'or_ach_event_5', name: 'Storm Rider', emoji: '⛈️',
    description: 'Survive 5 ridge events without being overwhelmed.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'or_ach_level_25', name: 'Summit Aspirant', emoji: '📈',
    description: 'Reach level 25 and gain access to the deepest caverns of the ridge.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'or_ach_level_50', name: 'Ridge Sovereign', emoji: '👑',
    description: 'Reach the maximum level 50 and become the sovereign of Opal Ridge.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 150,
  },
];

// ============================================================
// SECTION 11: OR_TITLES — 8 Title Progression
// ============================================================

const OR_TITLES: OrTitleDef[] = [
  {
    id: 'title_ridge_wanderer', name: 'Ridge Wanderer', emoji: '🥾',
    description: 'A newcomer to Opal Ridge, taking first steps along its luminous trails.',
    lore: 'Every sovereign of the ridge began as a wanderer, gazing up at the crystal peaks with wonder.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_crystal_seeker', name: 'Crystal Seeker', emoji: '🔍',
    description: 'Learning to find and identify the many crystal formations scattered across the ridge.',
    lore: 'Crystal Seekers develop an eye for hidden gems that others walk right past.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_prism_walker', name: 'Prism Walker', emoji: '🌈',
    description: 'Skilled at navigating through prismatic zones where light bends and distorts.',
    lore: 'Prism Walkers see the world in spectrums that others cannot perceive.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_peak_scaler', name: 'Peak Scaler', emoji: '🧗',
    description: 'Bold climber who has scaled the lower peaks of Opal Ridge.',
    lore: 'Peak Scalers know every handhold and foothold on the crystal cliff faces.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_aurora_herald', name: 'Aurora Herald', emoji: '🌌',
    description: 'One who can interpret the aurora and predict ridge phenomena.',
    lore: 'Aurora Heralds read the northern lights like a language, foretelling what the ridge will do next.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_opal_crafter', name: 'Opal Crafter', emoji: '💎',
    description: 'Master artisan of opal and crystal, crafting legendary creatures and tools.',
    lore: 'Opal Crafters can shape raw opal into anything imaginable using only ridge light.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_crystal_sage', name: 'Crystal Sage', emoji: '🧙',
    description: 'A sage of ancient crystal lore, understanding the deepest secrets of the ridge.',
    lore: 'Crystal Sages meditate in the Prismatic Hollow, communing with the light itself.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_ridge_sovereign', name: 'Ridge Sovereign', emoji: '👑',
    description: 'The supreme ruler of Opal Ridge, master of all light and crystal.',
    lore: 'The Ridge Sovereign commands the Eternal Opal Sovereign and all creatures of the ridge.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: OR_ARTIFACTS — 6 Artifacts
// ============================================================

const OR_ARTIFACTS: OrArtifactDef[] = [
  {
    id: 'art_opal_compass', name: 'Opal Compass',
    description: 'A compass with an opal needle that always points toward the nearest hidden chamber.',
    lore: 'The Opal Compass was carved from a single flawless opal by the first Crystal Sage.',
    emoji: '🧭', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_prism_crown', name: 'Prism Crown',
    description: 'A crown of interlocking prisms that grants the wearer full-spectrum vision.',
    lore: 'The Prism Crown was worn by the ancient Ridge Sovereigns during ceremonial ascensions.',
    emoji: '👑', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_aurora_orb', name: 'Aurora Orb',
    description: 'A sphere of captured aurora light that pulses with living northern light energy.',
    lore: 'The Aurora Orb was created when a supremely powerful aurora descended and crystallized.',
    emoji: '🔮', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_crystal_scepter', name: 'Crystal Scepter',
    description: 'A scepter of pure crystal that channels ridge energy to enhance all creature abilities.',
    lore: 'The Crystal Scepter was formed from a single crystal that grew for ten thousand years.',
    emoji: '⚡', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_eternal_opal_heart', name: 'Eternal Opal Heart',
    description: 'The crystallized heart of the first opal dragon, containing infinite prismatic energy.',
    lore: 'The Eternal Opal Heart is said to beat once per century, and each beat creates a new aurora.',
    emoji: '💖', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_spectrum_key', name: 'Spectrum Key',
    description: 'A key made of pure light that can unlock any seal on the ridge, including the Deep Shimmer Fault.',
    lore: 'The Spectrum Key was forged at the moment of creation, when light first touched the ridge.',
    emoji: '🗝️', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: OR_EVENTS — 8 Random Ridge Events
// ============================================================

const OR_EVENTS: OrEventDef[] = [
  {
    id: 'or_evt_aurora_surge', name: 'Aurora Surge',
    description: 'A massive aurora surge cascades across the ridge, temporarily boosting all creature power.',
    lore: 'Aurora Surges occur when solar activity peaks, flooding the ridge with charged light particles.',
    emoji: '🌌', effectType: 'buff', duration: 30000, rewardXp: 40, rewardCoins: 20,
    rewardMaterialId: 'aurora_fiber', rewardMaterialCount: 3,
  },
  {
    id: 'or_evt_crystal_avalanche', name: 'Crystal Avalanche',
    description: 'Shimmering crystals cascade down the mountainside, blocking paths but revealing rare gems.',
    lore: 'Crystal Avalanches are both dangerous and rewarding — the revealed gems are always exceptional quality.',
    emoji: '⛰️', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 15,
    rewardMaterialId: 'crystal_quartz', rewardMaterialCount: 5,
  },
  {
    id: 'or_evt_prism_storm', name: 'Prism Storm',
    description: 'A violent storm of prismatic light fragments sweeps the ridge, blinding creatures.',
    lore: 'Prism Storms are terrifying — the light is so intense it can temporarily blind even opal dragons.',
    emoji: '⛈️', effectType: 'debuff', duration: 20000, rewardXp: 45, rewardCoins: 25,
    rewardMaterialId: 'prismatic_dust', rewardMaterialCount: 4,
  },
  {
    id: 'or_evt_opal_bloom', name: 'Opal Bloom',
    description: 'A rare phenomenon where opals rapidly grow from ridge rocks, enriching the area.',
    lore: 'Opal Blooms are celebrated as the most auspicious event on the ridge.',
    emoji: '🌸', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 30,
    rewardMaterialId: 'raw_opal', rewardMaterialCount: 5,
  },
  {
    id: 'or_evt_light_fault', name: 'Light Fault',
    description: 'A crack opens in the ridge releasing raw light energy, damaging structures but empowering creatures.',
    lore: 'Light Faults are windows into the light realm, dangerous but filled with raw creative energy.',
    emoji: '✨', effectType: 'special', duration: 15000, rewardXp: 70, rewardCoins: 10,
    rewardMaterialId: 'pure_prism', rewardMaterialCount: 1,
  },
  {
    id: 'or_evt_echo_waves', name: 'Echo Waves',
    description: 'Resonant sound waves from Echo Cavern ripple across the ridge, revealing hidden paths.',
    lore: 'Echo Waves vibrate through crystal formations, causing them to align and reveal secret passages.',
    emoji: '📣', effectType: 'buff', duration: 20000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'echo_gem', rewardMaterialCount: 3,
  },
  {
    id: 'or_evt_solar_flare', name: 'Solar Flare',
    description: 'A solar flare strikes the ridge, supercharging all light-based creatures and structures.',
    lore: 'Solar Flares are the most powerful natural events on the ridge, turning every crystal into a beacon.',
    emoji: '☀️', effectType: 'buff', duration: 25000, rewardXp: 55, rewardCoins: 20,
    rewardMaterialId: 'summit_shard', rewardMaterialCount: 4,
  },
  {
    id: 'or_evt_void_eclipse', name: 'Void Eclipse',
    description: 'The sun is momentarily eclipsed by a void shadow, plunging the ridge into supernatural darkness.',
    lore: 'Void Eclipses are feared by all ridge creatures — even the Eternal Opal Sovereign falls silent.',
    emoji: '🌑', effectType: 'debuff', duration: 10000, rewardXp: 80, rewardCoins: 5,
    rewardMaterialId: 'raw_light', rewardMaterialCount: 1,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function orGenerateInstanceId(): string {
  return `or_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function orPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function orCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function orCalculateLevelUp(needed: number, current: number, gained: number, setLevel: (fn: (prev: number) => number) => void): number {
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

export default function useOpalRidge() {
  // ---- Core State ----
  const [orLevel, setOrLevel] = useState(1);
  const [orXp, setOrXp] = useState(OR_STARTING_XP);
  const [orCoins, setOrCoins] = useState(OR_STARTING_COINS);
  const [orTotalXp, setOrTotalXp] = useState(0);
  const [orTotalCoins, setOrTotalCoins] = useState(0);

  // ---- Collection State ----
  const [orGuardians, setOrGuardians] = useState<OrOwnedCreature[]>([]);
  const [orInventory, setOrInventory] = useState<OrInventoryItem[]>([]);
  const [orStructures, setOrStructures] = useState<OrStructureRecord[]>([]);
  const [orArtifacts, setOrArtifacts] = useState<OrArtifactRecord[]>([]);
  const [orAbilities, setOrAbilities] = useState<OrAbilityRecord[]>([]);
  const [orAchievements, setOrAchievements] = useState<OrAchievementRecord[]>([]);
  const [orChambers, setOrChambers] = useState<OrChamberRecord[]>([]);
  const [orEventLog, setOrEventLog] = useState<OrEventLogEntry[]>([]);
  const [orActiveEvent, setOrActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [orCurrentTitle, setOrCurrentTitle] = useState('title_ridge_wanderer');

  // ---- Stats State ----
  const [orStats, setOrStats] = useState<OrStats>({
    totalHatched: 0,
    totalPeaksScaled: 0,
    totalStructuresBuilt: 0,
    totalArtifacts: 0,
    totalEvents: 0,
    totalCoins: 0,
    totalXp: 0,
  });

  // ---- Refs ----
  const initializedRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef({
    orLevel, orXp, orCoins, orTotalXp, orTotalCoins,
    orGuardians, orInventory, orStructures, orArtifacts,
    orAbilities, orAchievements, orChambers, orEventLog,
    orActiveEvent, orCurrentTitle, orStats,
  });

  useEffect(() => {
    stateRef.current = {
      orLevel, orXp, orCoins, orTotalXp, orTotalCoins,
      orGuardians, orInventory, orStructures, orArtifacts,
      orAbilities, orAchievements, orChambers, orEventLog,
      orActiveEvent, orCurrentTitle, orStats,
    };
  }, [orLevel, orXp, orCoins, orTotalXp, orTotalCoins,
    orGuardians, orInventory, orStructures, orArtifacts,
    orAbilities, orAchievements, orChambers, orEventLog,
    orActiveEvent, orCurrentTitle, orStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Load saved state from localStorage
    try {
      const saved = localStorage.getItem(OR_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.orLevel) setOrLevel(data.orLevel);
        if (data.orXp) setOrXp(data.orXp);
        if (data.orCoins) setOrCoins(data.orCoins);
        if (data.orTotalXp) setOrTotalXp(data.orTotalXp);
        if (data.orTotalCoins) setOrTotalCoins(data.orTotalCoins);
        if (data.orGuardians) setOrGuardians(data.orGuardians);
        if (data.orInventory) setOrInventory(data.orInventory);
        if (data.orStructures) setOrStructures(data.orStructures);
        if (data.orArtifacts) setOrArtifacts(data.orArtifacts);
        if (data.orAbilities) setOrAbilities(data.orAbilities);
        if (data.orAchievements) setOrAchievements(data.orAchievements);
        if (data.orChambers) setOrChambers(data.orChambers);
        if (data.orEventLog) setOrEventLog(data.orEventLog);
        if (data.orActiveEvent) setOrActiveEvent(data.orActiveEvent);
        if (data.orCurrentTitle) setOrCurrentTitle(data.orCurrentTitle);
        if (data.orStats) setOrStats(data.orStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    // Initialize from scratch
    setOrChambers(
      OR_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setOrAbilities(
      OR_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setOrAchievements(
      OR_ACHIEVEMENTS.map((a) => ({
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
          orLevel, orXp, orCoins, orTotalXp, orTotalCoins,
          orGuardians, orInventory, orStructures, orArtifacts,
          orAbilities, orAchievements, orChambers, orEventLog,
          orActiveEvent, orCurrentTitle, orStats,
        };
        localStorage.setItem(OR_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, OR_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [orLevel, orXp, orCoins, orTotalXp, orTotalCoins,
    orGuardians, orInventory, orStructures, orArtifacts,
    orAbilities, orAchievements, orChambers, orEventLog,
    orActiveEvent, orCurrentTitle, orStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!orActiveEvent) return;
    const evt = OR_EVENTS.find((e) => e.id === orActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setOrActiveEvent(null);
      setOrEventLog((prev) =>
        prev.map((e) => (e.eventId === orActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [orActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...OR_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => orLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === orCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setOrCurrentTitle(nextTitle.id);
    }
  }, [orLevel, orCurrentTitle]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(OR_XP_BASE * Math.pow(lvl, OR_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(orLevel + 1);
    return Math.max(0, needed - orXp);
  }, [orLevel, orXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(orLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((orXp / needed) * 100), 100);
  }, [orLevel, orXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): OrCreatureDef | undefined => {
    return OR_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): OrChamberDef | undefined => {
    return OR_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): OrMaterialDef | undefined => {
    return OR_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): OrStructureDef | undefined => {
    return OR_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): OrAbilityDef | undefined => {
    return OR_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): OrArtifactDef | undefined => {
    return OR_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): OrAchievementDef | undefined => {
    return OR_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): OrTitleDef | undefined => {
    return OR_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): OrEventDef | undefined => {
    return OR_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: OrRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: OrRarity): string => {
    return OR_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: OrSpecies): string => {
    return OR_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: hatchCreature
  // ============================================================

  const hatchCreature = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (orCoins < def.cost) return false;

    const newCreature: OrOwnedCreature = {
      creatureId: def.id,
      instanceId: orGenerateInstanceId(),
      craftedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setOrCoins((prev) => prev - def.cost);
    setOrGuardians((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = orCalculateLevelUp(
      xpForLevel(orLevel + 1),
      orXp,
      xpGained,
      setOrLevel,
    );
    setOrXp(overflow);
    setOrTotalXp((prev) => prev + xpGained);
    setOrTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setOrStats((prev) => ({ ...prev, totalHatched: prev.totalHatched + 1 }));
    return true;
  }, [orCoins, orLevel, orXp, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: scalePeak
  // ============================================================

  const scalePeak = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (orLevel < def.unlockLevel) return false;

    setOrChambers((prev) =>
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
    const bonusMat = orPickRandom(def.resources);
    if (bonusMat) {
      setOrInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat ? { ...i, count: i.count + 1 } : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setOrTotalXp((prev) => prev + 15);
    setOrTotalCoins((prev) => prev + 5);
    setOrStats((prev) => ({ ...prev, totalPeaksScaled: prev.totalPeaksScaled + 1 }));
    return true;
  }, [orLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = orStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = orCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (orCoins < cost) return false;

    setOrCoins((prev) => prev - cost);
    setOrStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setOrTotalXp((prev) => prev + 20);
    setOrStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [orCoins, orStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (orCoins < def.cost) return false;
    if (orArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setOrCoins((prev) => prev - def.cost);
    setOrArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setOrTotalXp((prev) => prev + 100);
    setOrStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [orCoins, orArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerRidgeEvent
  // ============================================================

  const triggerRidgeEvent = useCallback((): OrEventDef | null => {
    if (orActiveEvent) return null;
    const event = orPickRandom(OR_EVENTS);
    setOrActiveEvent(event.id);
    setOrEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setOrTotalXp((prev) => prev + event.rewardXp);
    setOrCoins((prev) => prev + event.rewardCoins);
    setOrTotalCoins((prev) => prev + event.rewardCoins);

    // Add event material reward to inventory
    if (event.rewardMaterialId) {
      setOrInventory((prev) => {
        const existing = prev.find((i) => i.materialId === event.rewardMaterialId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === event.rewardMaterialId
              ? { ...i, count: i.count + event.rewardMaterialCount }
              : i,
          );
        }
        return [...prev, { materialId: event.rewardMaterialId, count: event.rewardMaterialCount }];
      });
    }

    return event;
  }, [orActiveEvent]);

  // ============================================================
  // CORE ACTION: resetOpalRidge
  // ============================================================

  const resetOpalRidge = useCallback(() => {
    setOrLevel(1);
    setOrXp(0);
    setOrCoins(OR_STARTING_COINS);
    setOrTotalXp(0);
    setOrTotalCoins(0);
    setOrGuardians([]);
    setOrInventory([]);
    setOrStructures([]);
    setOrArtifacts([]);
    setOrAbilities(
      OR_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setOrAchievements(
      OR_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setOrChambers(
      OR_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setOrEventLog([]);
    setOrActiveEvent(null);
    setOrCurrentTitle('title_ridge_wanderer');
    setOrStats({
      totalHatched: 0, totalPeaksScaled: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(OR_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverCavern
  // ============================================================

  const discoverCavern = useCallback((chamberId: string): boolean => {
    return scalePeak(chamberId);
  }, [scalePeak]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setOrStats((currentStats) => {
      setOrAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalHatched: currentStats.totalHatched,
          totalPeaksScaled: currentStats.totalPeaksScaled,
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
            setOrTotalXp((xp) => xp + def.rewardXp);
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
    const record = orAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setOrAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setOrTotalXp((prev) => prev + 5);
    return true;
  }, [orAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const orTitleProgress = useMemo((): OrTitleProgress => {
    const sorted = [...OR_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === orCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === orCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((orLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [orLevel, orCurrentTitle]);

  const currentTitleInfo = useMemo(() => orTitleProgress.current, [orTitleProgress]);

  const nextTitleInfo = useMemo(() => orTitleProgress.next, [orTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    guardiansHatched: orGuardians.length,
    peaksExplored: orChambers.filter((c) => c.discovered).length,
    structuresBuilt: orStructures.length,
    artifactsActive: orArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: orAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: orAbilities.filter((a) => a.unlocked).length,
    totalXp: orTotalXp,
    totalCoins: orTotalCoins,
    currentLevel: orLevel,
    ownedSpeciesCount: new Set(orGuardians.map((g) => {
      const d = OR_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: orEventLog.length,
  }), [orGuardians, orChambers, orStructures, orArtifacts,
    orAchievements, orAbilities, orTotalXp, orTotalCoins, orLevel, orEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      OR_CREATURES.length +
      OR_CHAMBERS.length +
      OR_STRUCTURES.length +
      OR_ARTIFACTS.length +
      OR_ACHIEVEMENTS.length +
      OR_ABILITIES.length;
    const completed =
      orGuardians.length +
      orChambers.filter((c) => c.discovered).length +
      orStructures.length +
      orArtifacts.filter((a) => a.activated).length +
      orAchievements.filter((a) => a.unlocked).length +
      orAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((orGuardians.length / OR_CREATURES.length) * 100),
      chamberPercent: Math.round((orChambers.filter((c) => c.discovered).length / OR_CHAMBERS.length) * 100),
      structurePercent: Math.round((orStructures.length / OR_STRUCTURES.length) * 100),
      artifactPercent: Math.round((orArtifacts.filter((a) => a.activated).length / OR_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((orAchievements.filter((a) => a.unlocked).length / OR_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((orAbilities.filter((a) => a.unlocked).length / OR_ABILITIES.length) * 100),
    };
  }, [orGuardians, orChambers, orStructures, orArtifacts, orAchievements, orAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    orGuardians.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [orGuardians, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    orChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [orChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    orStructures.map((s) => ({
      ...s,
      def: getStructureDef(s.structureId),
      totalUpgrades: s.totalUpgrades,
      currentCost: orCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      nextUpgradeCost: orCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      bonusProvided: s.level * (getStructureDef(s.structureId)?.bonusPerLevel || 0),
    })),
  [orStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    orInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [orInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    orArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [orArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    orAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [orAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, typeof orGuardians> = {};
    for (const species of OR_SPECIES) {
      result[species.id] = orGuardians.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [orGuardians, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: OrRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, typeof orGuardians> = {};
    for (const r of rarities) {
      result[r] = orGuardians.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [orGuardians, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return OR_CREATURES.filter((c) => c.cost <= orCoins);
  }, [orCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalHatched: orStats.totalHatched,
      totalPeaksScaled: orStats.totalPeaksScaled,
      totalStructuresBuilt: orStats.totalStructuresBuilt,
      totalArtifacts: orStats.totalArtifacts,
      totalEvents: orStats.totalEvents,
      totalCoins: orStats.totalCoins,
      totalXp: orStats.totalXp,
    };
    return OR_ACHIEVEMENTS.filter(
      (a) =>
        !orAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [orStats, orAchievements]);

  const recentEventLog = useMemo(() => {
    return [...orEventLog].reverse().slice(0, 10);
  }, [orEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...orGuardians]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [orGuardians, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of orGuardians) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [orGuardians, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of orChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [orChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of orStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [orStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of orAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [orAbilities]);

  // ============================================================
  // RETURN — Pattern A: all constants directly on the API object
  // ============================================================

  return {
    // ---- Color Theme ----
    OR_OPAL_WHITE,
    OR_PRISM_PINK,
    OR_CRYSTAL_BLUE,
    OR_PEAK_GRAY,
    OR_SUNSET_ORANGE,
    OR_AURORA_GREEN,
    OR_DEEP_PURPLE,
    OR_RARITY_COLORS,
    OR_SPECIES_COLORS,
    OR_ALL_COLORS,

    // ---- Data Constants ----
    OR_SPECIES,
    OR_CREATURES,
    OR_CHAMBERS,
    OR_MATERIALS,
    OR_STRUCTURES,
    OR_ABILITIES,
    OR_ACHIEVEMENTS,
    OR_TITLES,
    OR_ARTIFACTS,
    OR_EVENTS,
    OR_MAX_LEVEL,
    OR_SAVE_KEY,
    OR_STARTING_COINS,
    OR_XP_BASE,
    OR_XP_SCALE,

    // ---- Core State ----
    orLevel,
    orXp,
    orCoins,
    orTotalXp,
    orTotalCoins,

    // ---- Collection State ----
    orGuardians,
    orInventory,
    orStructures,
    orArtifacts,
    orAbilities,
    orAchievements,
    orChambers,
    orEventLog,
    orActiveEvent,
    orCurrentTitle,
    orStats,

    // ---- Core Actions ----
    hatchCreature,
    scalePeak,
    buildStructure,
    activateArtifact,
    triggerRidgeEvent,
    resetOpalRidge,

    // ---- Extended Actions ----
    discoverCavern,
    checkAndClaimAchievements,
    useAbility,

    // ---- Computed: Title ----
    orTitleProgress,
    currentTitleInfo,
    nextTitleInfo,

    // ---- Computed: Stats ----
    statsSummary,
    completionStats,

    // ---- Enriched Data ----
    enrichedCreatures,
    enrichedChambers,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedAbilities,

    // ---- Computed Data ----
    creaturesByType,
    creaturesByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    creaturesByPower,
    topCreatures,
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
