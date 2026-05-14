// ============================================================================
// Willow Lane Wire — 柳径 Wire
// SSR-safe: no localStorage / window / document / setInterval /
//   addEventListener / Math.random
// All exports use the `wl` / `WL_` prefix. Hook-based pattern.
// ============================================================================

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// ─── 1. Type Definitions ──────────────────────────────────────────────────────

type WlRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type WlSpecies =
  | 'spirit_fox'
  | 'willow_dryad'
  | 'pond_spirit'
  | 'moon_hare'
  | 'bamboo_nymph'
  | 'cloud_heron'
  | 'moss_turtle';

type WlAction = 'plant' | 'nurture' | 'shape' | 'dream' | 'float' | 'weave' | 'illuminate';

type WlAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type WlChamberId =
  | 'willow_entrance'
  | 'misty_pond'
  | 'moonlit_clearing'
  | 'bamboo_maze'
  | 'spirit_fox_den'
  | 'moss_grotto'
  | 'cloud_canopy'
  | 'elder_willow_sanctum';

type WlMaterialSource = 'forage' | 'creature_drop' | 'structure_output' | 'event_reward' | 'trade';

type WlEventFrequency = 'common' | 'uncommon' | 'rare' | 'legendary';

// ─── Def Interfaces ──────────────────────────────────────────────────────────

interface WlSpeciesDef {
  id: WlSpecies;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  color: string;
  affinity: WlAction;
}

interface WlCreatureDef {
  id: string;
  name: string;
  species: WlSpecies;
  rarity: WlRarity;
  description: string;
  lore: string;
  emoji: string;
  power: number;
  defense: number;
  cost: number;
  xpReward: number;
}

interface WlChamberDef {
  id: WlChamberId;
  name: string;
  description: string;
  lore: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
  ambientColor: string;
  dangerLevel: number;
}

interface WlMaterialDef {
  id: string;
  name: string;
  rarity: WlRarity;
  source: WlMaterialSource;
  description: string;
  emoji: string;
}

interface WlStructureDef {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  emoji: string;
  category: string;
}

interface WlAbilityDef {
  id: string;
  name: string;
  description: string;
  category: WlAbilityCategory;
  cooldown: number;
  power: number;
  cost: number;
  emoji: string;
}

interface WlAchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
  emoji: string;
}

interface WlTitleDef {
  id: number;
  name: string;
  requiredLevel: number;
  description: string;
}

interface WlArtifactDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  rarity: WlRarity;
  bonus: string;
  cost: number;
  emoji: string;
}

interface WlEventDef {
  id: string;
  name: string;
  description: string;
  lore: string;
  frequency: WlEventFrequency;
  duration: number;
  reward: string;
  requirement: string;
  emoji: string;
}

// ─── Runtime State Types ─────────────────────────────────────────────────────

interface WlBefriendedCreature {
  creatureId: string;
  befriendedAt: number;
  bondStrength: number;
  maxBondStrength: number;
}

interface WlOwnedStructure {
  structureId: string;
  level: number;
  builtAt: number;
}

interface WlMaterialInventory {
  materialId: string;
  quantity: number;
}

interface WlAchievementState {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface WlArtifactState {
  artifactId: string;
  acquired: boolean;
  acquiredAt: number | null;
  equipped: boolean;
}

interface WlEventState {
  eventId: string;
  active: boolean;
  startedAt: number | null;
  endsAt: number | null;
  completions: number;
}

interface WlAbilityState {
  abilityId: string;
  unlocked: boolean;
  unlockedAt: number | null;
  currentCooldown: number;
  uses: number;
}

interface WlChamberProgress {
  chamberId: WlChamberId;
  unlocked: boolean;
  visits: number;
  lastVisited: number | null;
  deepestPoint: number;
}

interface WlWillowLaneState {
  chambers: Record<string, WlChamberProgress>;
  creatures: Record<string, WlBefriendedCreature>;
  materials: Record<string, WlMaterialInventory>;
  structures: Record<string, WlOwnedStructure>;
  achievements: Record<string, WlAchievementState>;
  artifacts: Record<string, WlArtifactState>;
  events: Record<string, WlEventState>;
  abilities: Record<string, WlAbilityState>;
  currentTitle: number;
  laneLevel: number;
  laneXp: number;
  spiritCoins: number;
  harmony: number;
  totalVisits: number;
  totalBefriended: number;
  totalHarvested: number;
  totalPlanted: number;
  activeChamberId: string;
  selectedAction: WlAction;
  willowEssence: number;
}

// ─── 2. WL_ Constants ────────────────────────────────────────────────────────

const WL_SAVE_KEY = 'willow-lane-save';
const WL_MAX_LEVEL = 50;
const WL_STARTING_COINS = 150;
const WL_STARTING_XP = 0;
const WL_STARTING_HARMONY = 50;
const WL_MAX_HARMONY = 200;
const WL_MAX_WILLOW_ESSENCE = 500;
const WL_STARTING_WILLOW_ESSENCE = 0;
const WL_BOND_STRENGTH_BASE = 20;
const WL_BOND_STRENGTH_PER_LEVEL = 5;
const WL_COOLDOWN_REDUCTION_PER_LEVEL = 2;

// ─── 3. Color Theme Constants ────────────────────────────────────────────────

const WL_COLOR_WILLOW_GREEN = '#98FB98';
const WL_COLOR_POND_BLUE = '#4682B4';
const WL_COLOR_MOON_SILVER = '#C0C0C0';
const WL_COLOR_SPIRIT_WHITE = '#FFFAF0';
const WL_COLOR_BAMBOO_YELLOW = '#F0E68C';
const WL_COLOR_MOSS_GREEN = '#2E8B57';
const WL_COLOR_DUSK_PURPLE = '#9370DB';

const WL_COLOR_MAP: Record<string, string> = {
  spirit_fox: WL_COLOR_MOON_SILVER,
  willow_dryad: WL_COLOR_WILLOW_GREEN,
  pond_spirit: WL_COLOR_POND_BLUE,
  moon_hare: WL_COLOR_MOON_SILVER,
  bamboo_nymph: WL_COLOR_BAMBOO_YELLOW,
  cloud_heron: WL_COLOR_SPIRIT_WHITE,
  moss_turtle: WL_COLOR_MOSS_GREEN,
};

const WL_RARITY_COLORS: Record<WlRarity, string> = {
  common: '#A0A0A0',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FFD700',
};

// ─── 4. WL_SPECIES — 7 Species ──────────────────────────────────────────────

const WL_SPECIES: WlSpeciesDef[] = [
  {
    id: 'spirit_fox',
    name: 'Spirit Fox',
    description: 'Ethereal foxes that dance between the mortal realm and the spirit world, their tails trailing moonlight.',
    lore: 'Legend says the first spirit fox emerged from a fallen willow leaf during a lunar eclipse, carrying whispered secrets from the ancestors.',
    emoji: '🦊',
    color: WL_COLOR_MOON_SILVER,
    affinity: 'dream',
  },
  {
    id: 'willow_dryad',
    name: 'Willow Dryad',
    description: 'Gentle tree spirits born from ancient willows, protectors of the lane\'s sacred groves.',
    lore: 'Dryads do not age as mortals do — they grow rings of wisdom with each passing century, their songs carried on the wind.',
    emoji: '🌿',
    color: WL_COLOR_WILLOW_GREEN,
    affinity: 'nurture',
  },
  {
    id: 'pond_spirit',
    name: 'Pond Spirit',
    description: 'Serene water beings that dwell in the reflective pools scattered along the willow lane.',
    lore: 'Pond spirits can show travelers visions of both past and future in their still waters, but only those pure of heart.',
    emoji: '💧',
    color: WL_COLOR_POND_BLUE,
    affinity: 'float',
  },
  {
    id: 'moon_hare',
    name: 'Moon Hare',
    description: 'Swift lunar rabbits that hop between moonbeams, gathering stardust for the lane\'s enchanted flora.',
    lore: 'Ancient carvings depict the moon hare pounding mochi on the lunar surface, the very same recipe shared with the lane\'s baker spirits.',
    emoji: '🐰',
    color: WL_COLOR_MOON_SILVER,
    affinity: 'illuminate',
  },
  {
    id: 'bamboo_nymph',
    name: 'Bamboo Nymph',
    description: 'Playful forest sprites who weave through bamboo groves, crafting instruments from hollow stems.',
    lore: 'The songs of bamboo nymphs are said to mend broken hearts and heal ancient wounds, if one can find where they play.',
    emoji: '🎋',
    color: WL_COLOR_BAMBOO_YELLOW,
    affinity: 'weave',
  },
  {
    id: 'cloud_heron',
    name: 'Cloud Heron',
    description: 'Majestic wading birds that walk among the clouds, their feathers carrying the mist of the lane.',
    lore: 'When a cloud heron descends to earth, the fog that follows in its wake reveals hidden paths through the thickest groves.',
    emoji: '🪶',
    color: WL_COLOR_SPIRIT_WHITE,
    affinity: 'float',
  },
  {
    id: 'moss_turtle',
    name: 'Moss Turtle',
    description: 'Ancient, slow-moving guardians covered in centuries of moss, keepers of the lane\'s deepest secrets.',
    lore: 'The oldest moss turtle remembers the day the lane was first planted by the spirit ancestors, though it takes a full day to tell the tale.',
    emoji: '🐢',
    color: WL_COLOR_MOSS_GREEN,
    affinity: 'plant',
  },
];

// ─── 5. WL_CREATURES — 35 Creatures (5 Tiers × 7 Species) ──────────────────

const WL_CREATURES: WlCreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────────────────
  {
    id: 'ember_kit',
    name: 'Ember Kit',
    species: 'spirit_fox',
    rarity: 'common',
    description: 'A playful young fox pup with a faint warm glow in its fur, always chasing fireflies.',
    lore: 'Ember kits are born during the autumn equinox, when the willow leaves first catch fire in their golden transformation.',
    emoji: '🦊',
    power: 8,
    defense: 5,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'sapling_dryad',
    name: 'Sapling Dryad',
    species: 'willow_dryad',
    rarity: 'common',
    description: 'A young dryad barely taller than a shrub, learning to sing to the roots beneath her feet.',
    lore: 'Sapling dryads spend their first century listening before they ever utter a note of their own song.',
    emoji: '🌿',
    power: 6,
    defense: 10,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'dew_drop',
    name: 'Dew Drop',
    species: 'pond_spirit',
    rarity: 'common',
    description: 'A tiny water spirit that forms each morning from collected dew on lotus leaves.',
    lore: 'If you catch a dew drop spirit at sunrise, it will whisper tomorrow\'s weather before dissolving back into mist.',
    emoji: '💧',
    power: 5,
    defense: 7,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'dusk_leveret',
    name: 'Dusk Leveret',
    species: 'moon_hare',
    rarity: 'common',
    description: 'A small brown hare that becomes active only during the twilight hours between day and night.',
    lore: 'Dusk leverets carry fragments of twilight in their pouches, which they use to light the lane when moonlight fails.',
    emoji: '🐰',
    power: 9,
    defense: 4,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'reed_sprite',
    name: 'Reed Sprite',
    species: 'bamboo_nymph',
    rarity: 'common',
    description: 'A mischievous sprite that inhabits the reeds and bamboo shoots along the pond\'s edge.',
    lore: 'Reed sprites communicate through hollow bamboo tubes, creating an eerie but beautiful network of whispered messages.',
    emoji: '🎋',
    power: 7,
    defense: 6,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'fog_chick',
    name: 'Fog Chick',
    species: 'cloud_heron',
    rarity: 'common',
    description: 'A fluffy heron chick that generates small puffs of mist when it sneezes.',
    lore: 'Fog chicks are raised in cloud nests high above the lane, lowered by their parents each morning in baskets of woven mist.',
    emoji: '🪶',
    power: 6,
    defense: 8,
    cost: 10,
    xpReward: 5,
  },
  {
    id: 'pebble_shell',
    name: 'Pebble Shell',
    species: 'moss_turtle',
    rarity: 'common',
    description: 'A young turtle with a shell barely covered in its first fuzz of emerald moss.',
    lore: 'Pebble shells carry pebbles from their birth pool their entire lives, adding one new stone for each year survived.',
    emoji: '🐢',
    power: 5,
    defense: 12,
    cost: 10,
    xpReward: 5,
  },

  // ── Uncommon (7) ──────────────────────────────────────────────────────────
  {
    id: 'mist_walker_fox',
    name: 'Mist Walker Fox',
    species: 'spirit_fox',
    rarity: 'uncommon',
    description: 'A fox wrapped in perpetual twilight mist, leaving no footprints wherever it treads.',
    lore: 'Mist walker foxes serve as guides for lost travelers, their nine tails forming a compass of shimmering light.',
    emoji: '🦊',
    power: 18,
    defense: 12,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'willow_songstress',
    name: 'Willow Songstress',
    species: 'willow_dryad',
    rarity: 'uncommon',
    description: 'A dryad whose voice can coax even the most stubborn roots to bloom in the dead of winter.',
    lore: 'The Songstress once sang for three days straight to heal a dying willow tree, her melody now echoing through every branch of the lane.',
    emoji: '🌿',
    power: 12,
    defense: 22,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'ripple_maiden',
    name: 'Ripple Maiden',
    species: 'pond_spirit',
    rarity: 'uncommon',
    description: 'A graceful pond spirit that appears in concentric ripples, each ring revealing a different memory.',
    lore: 'Travelers who befriend a ripple maiden gain the ability to recall memories long buried beneath the surface of their mind.',
    emoji: '💧',
    power: 14,
    defense: 16,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'silver_paw',
    name: 'Silver Paw',
    species: 'moon_hare',
    rarity: 'uncommon',
    description: 'A hare with luminous silver fur that seems to absorb and reflect moonlight simultaneously.',
    lore: 'Silver paws are born only during a supermoon, their fur carrying enough lunar energy to power the lane\'s lanterns for a year.',
    emoji: '🐰',
    power: 22,
    defense: 10,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'bamboo_flutist',
    name: 'Bamboo Flutist',
    species: 'bamboo_nymph',
    rarity: 'uncommon',
    description: 'A nymph of extraordinary musical talent whose melodies shape the growth of surrounding bamboo.',
    lore: 'The bamboo flutist can grow an entire grove overnight simply by playing the right combination of notes in the correct order.',
    emoji: '🎋',
    power: 16,
    defense: 14,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'dawn_sentry',
    name: 'Dawn Sentry',
    species: 'cloud_heron',
    rarity: 'uncommon',
    description: 'A vigilant heron that perches atop the tallest willows, announcing dawn with a resonant call.',
    lore: 'Dawn sentries never sleep, drawing energy directly from the first light of each new day across the entire horizon.',
    emoji: '🪶',
    power: 15,
    defense: 18,
    cost: 30,
    xpReward: 15,
  },
  {
    id: 'lichen_elder',
    name: 'Lichen Elder',
    species: 'moss_turtle',
    rarity: 'uncommon',
    description: 'An old turtle whose shell has become a complete ecosystem of lichen, tiny mushrooms, and wildflowers.',
    lore: 'Lichen elders host their own miniature gardens, and the rare herbs that grow only on their shells are prized by healers across the spirit realm.',
    emoji: '🐢',
    power: 10,
    defense: 28,
    cost: 30,
    xpReward: 15,
  },

  // ── Rare (7) ──────────────────────────────────────────────────────────────
  {
    id: 'celestial_kitsune',
    name: 'Celestial Kitsune',
    species: 'spirit_fox',
    rarity: 'rare',
    description: 'A three-tailed fox wreathed in starlight, capable of minor divination through fire-gazing.',
    lore: 'Celestial kitsune train for centuries to grow each additional tail, and at three tails they gain the power to read the fire of destiny.',
    emoji: '🦊',
    power: 35,
    defense: 22,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'ancient_barkguard',
    name: 'Ancient Barkguard',
    species: 'willow_dryad',
    rarity: 'rare',
    description: 'A massive dryad whose body has fused with an elder willow, becoming a living fortress.',
    lore: 'The Barkguard\'s consciousness spans both tree and spirit, feeling every insect that crawls upon its thousand-year-old bark.',
    emoji: '🌿',
    power: 25,
    defense: 45,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'moonpool_serpent',
    name: 'Moonpool Serpent',
    species: 'pond_spirit',
    rarity: 'rare',
    description: 'An elegant serpent made of pure water that dwells only in moonlit ponds.',
    lore: 'Moonpool serpents guard the deepest secrets of the lane, their waters holding answers to questions not yet asked.',
    emoji: '💧',
    power: 32,
    defense: 28,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'lunar_archivist',
    name: 'Lunar Archivist',
    species: 'moon_hare',
    rarity: 'rare',
    description: 'A scholarly hare that records history on moonbeams, weaving stories into the night sky.',
    lore: 'The Archivist\'s scrolls are visible only during a full moon, when the entire history of the lane is written across the heavens.',
    emoji: '🐰',
    power: 38,
    defense: 20,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'grove_whisperer',
    name: 'Grove Whisperer',
    species: 'bamboo_nymph',
    rarity: 'rare',
    description: 'A nymph who communes directly with the forest, translating the language of rustling leaves.',
    lore: 'The Grove Whisperer serves as mediator between all forest spirits, settling disputes that have raged for millennia with a single word.',
    emoji: '🎋',
    power: 28,
    defense: 32,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'stormcaller_heron',
    name: 'Stormcaller Heron',
    species: 'cloud_heron',
    rarity: 'rare',
    description: 'A great heron whose wings generate thunderclaps and whose eyes flash with distant lightning.',
    lore: 'Stormcaller herons migrate with the monsoons, their arrival signaling the change of seasons across the spirit realm.',
    emoji: '🪶',
    power: 36,
    defense: 25,
    cost: 80,
    xpReward: 35,
  },
  {
    id: 'stoneback_sage',
    name: 'Stoneback Sage',
    species: 'moss_turtle',
    rarity: 'rare',
    description: 'A venerable turtle whose shell is engraved with ancient runes that glow faintly at midnight.',
    lore: 'The Stoneback Sage teaches the young creatures of the lane, its slow pace belying a mind that processes thoughts across centuries.',
    emoji: '🐢',
    power: 20,
    defense: 50,
    cost: 80,
    xpReward: 35,
  },

  // ── Epic (7) ──────────────────────────────────────────────────────────────
  {
    id: 'nine_tailed_sovereign',
    name: 'Nine-Tailed Sovereign',
    species: 'spirit_fox',
    rarity: 'epic',
    description: 'A majestic nine-tailed fox that rules over the spirit realm from the moonlit throne of willows.',
    lore: 'The Sovereign is the last of the First Foxes, beings older than the lane itself, who planted the first willow seed with a brush of their tail.',
    emoji: '🦊',
    power: 65,
    defense: 40,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'heartwood_matriarch',
    name: 'Heartwood Matriarch',
    species: 'willow_dryad',
    rarity: 'epic',
    description: 'The mother of all dryads, a being so ancient she remembers the world before humans walked the lane.',
    lore: 'The Matriarch\'s roots extend beneath the entire lane, connecting every tree, every bush, every blade of grass into a single vast consciousness.',
    emoji: '🌿',
    power: 45,
    defense: 80,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'abyssal_mirror',
    name: 'Abyssal Mirror',
    species: 'pond_spirit',
    rarity: 'epic',
    description: 'A colossal pond spirit that serves as a mirror to other dimensions, revealing parallel versions of the lane.',
    lore: 'Gazing into the Abyssal Mirror shows not reflections but alternatives — every choice unmade, every path unforgotten, every moment preserved.',
    emoji: '💧',
    power: 55,
    defense: 60,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'jade_emperor_hare',
    name: 'Jade Emperor Hare',
    species: 'moon_hare',
    rarity: 'epic',
    description: 'The legendary hare who serves the Jade Emperor of the Moon, forging elixirs from stardust.',
    lore: 'The Jade Emperor Hare\'s mortar and pestle are made from fallen stars, and the elixirs produced grant temporary immortality to worthy travelers.',
    emoji: '🐰',
    power: 70,
    defense: 35,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'ancestral_piper',
    name: 'Ancestral Piper',
    species: 'bamboo_nymph',
    rarity: 'epic',
    description: 'The first bamboo nymph, whose pipe music shaped the very mountains and valleys of the spirit realm.',
    lore: 'It was the Ancestral Piper who carved the Willow Lane from solid rock using only a melody so beautiful that stone itself wept and parted.',
    emoji: '🎋',
    power: 50,
    defense: 65,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'sky_weaver',
    name: 'Sky Weaver',
    species: 'cloud_heron',
    rarity: 'epic',
    description: 'A titanic heron that nests in the highest cloud banks, weaving weather patterns with its vast wings.',
    lore: 'The Sky Weaver determines the weather across a thousand miles, each wingbeat sending ripples through the atmosphere that become tomorrow\'s clouds.',
    emoji: '🪶',
    power: 60,
    defense: 55,
    cost: 200,
    xpReward: 80,
  },
  {
    id: 'world_shell',
    name: 'World Shell',
    species: 'moss_turtle',
    rarity: 'epic',
    description: 'A turtle so enormous that entire ecosystems thrive on its shell — forests, rivers, and miniature villages.',
    lore: 'The World Shell carries the original blueprint of the lane upon its back, a living map written in moss and stone that predates all other records.',
    emoji: '🐢',
    power: 40,
    defense: 95,
    cost: 200,
    xpReward: 80,
  },

  // ── Legendary (7) ─────────────────────────────────────────────────────────
  {
    id: 'willow_kami',
    name: 'Willow Kami',
    species: 'spirit_fox',
    rarity: 'legendary',
    description: 'The supreme fox deity who embodies the lane itself — spirit, nature, and memory intertwined.',
    lore: 'The Willow Kami is not merely a fox but the living concept of the lane given form. To see it is to understand the true nature of all living things.',
    emoji: '🦊',
    power: 120,
    defense: 75,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'eternal_canopy',
    name: 'Eternal Canopy',
    species: 'willow_dryad',
    rarity: 'legendary',
    description: 'A dryad that has become one with the sky, her branches forming an endless canopy of golden leaves.',
    lore: 'The Eternal Canopy shelters the entire lane from storms, drought, and time itself. Under her leaves, seasons blend into an eternal gentle spring.',
    emoji: '🌿',
    power: 80,
    defense: 150,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'origin_spring',
    name: 'Origin Spring',
    species: 'pond_spirit',
    rarity: 'legendary',
    description: 'The primordial water spirit from which all ponds and rivers of the lane originally flowed.',
    lore: 'The Origin Spring existed before the lane, before the trees, before the land itself. It is said that life in the spirit realm began with a single drop from this spirit.',
    emoji: '💧',
    power: 100,
    defense: 110,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'harvest_moon_hare',
    name: 'Harvest Moon Hare',
    species: 'moon_hare',
    rarity: 'legendary',
    description: 'The mythical hare of the harvest moon who can bend time itself during the autumn festival.',
    lore: 'Once a year, the Harvest Moon Hare descends to the lane and freezes time for a single night, allowing all creatures to gather without fear of the dawn.',
    emoji: '🐰',
    power: 130,
    defense: 65,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'verdant_sovereign',
    name: 'Verdant Sovereign',
    species: 'bamboo_nymph',
    rarity: 'legendary',
    description: 'The king of all bamboo nymphs, whose throne is a bamboo forest that stretches beyond the horizon.',
    lore: 'The Verdant Sovereign\'s court is attended by ten thousand nymphs, each one playing a different instrument in a symphony that has continued without pause for a thousand years.',
    emoji: '🎋',
    power: 95,
    defense: 120,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'cloud_serpent_heron',
    name: 'Cloud Serpent Heron',
    species: 'cloud_heron',
    rarity: 'legendary',
    description: 'A heron of impossible size whose body transforms into a serpent when crossing from cloud to water.',
    lore: 'The Cloud Serpent Heron is both sky and river, its existence spanning two elements. Where it lands, the boundary between heaven and earth dissolves.',
    emoji: '🪶',
    power: 110,
    defense: 100,
    cost: 500,
    xpReward: 150,
  },
  {
    id: 'primordial_tortoise',
    name: 'Primordial Tortoise',
    species: 'moss_turtle',
    rarity: 'legendary',
    description: 'The oldest being in the lane, a turtle that has existed since the world was young and flat.',
    lore: 'The Primordial Tortoise carries the weight of the spirit realm upon its shell. It moves so slowly that its journeys take epochs, yet every step reshapes the landscape.',
    emoji: '🐢',
    power: 70,
    defense: 200,
    cost: 500,
    xpReward: 150,
  },
];

// ─── 6. WL_CHAMBERS — 8 Groves ──────────────────────────────────────────────

const WL_CHAMBERS: WlChamberDef[] = [
  {
    id: 'willow_entrance',
    name: 'Willow Entrance',
    description: 'The mossy gateway where ancient willows first bend to form a natural archway over the lane.',
    lore: 'Travelers who pass through the Willow Entrance leave behind all worldly burdens, carried away by the gentle breeze that always blows through its branches.',
    emoji: '🚪',
    level: 1,
    resources: ['willow_branch', 'spirit_dew'],
    capacity: 10,
    unlockLevel: 1,
    ambientColor: WL_COLOR_WILLOW_GREEN,
    dangerLevel: 1,
  },
  {
    id: 'misty_pond',
    name: 'Misty Pond',
    description: 'A serene pond perpetually wreathed in morning mist, home to reflective pond spirits.',
    lore: 'The Misty Pond never fully clears; its mist is not water vapor but condensed dreams of all who have walked the lane.',
    emoji: '🌊',
    level: 3,
    resources: ['spirit_dew', 'moonstone_shard', 'lotus_bloom'],
    capacity: 15,
    unlockLevel: 3,
    ambientColor: WL_COLOR_POND_BLUE,
    dangerLevel: 2,
  },
  {
    id: 'moonlit_clearing',
    name: 'Moonlit Clearing',
    description: 'A circular glade where moonlight concentrates into visible beams, attracting moon hares.',
    lore: 'During the full moon, the clearing becomes so bright that shadows cast by the willows appear in reverse, creating a mirror world on the ground.',
    emoji: '🌙',
    level: 6,
    resources: ['moonstone_shard', 'lunar_moss', 'silver_thread'],
    capacity: 20,
    unlockLevel: 6,
    ambientColor: WL_COLOR_MOON_SILVER,
    dangerLevel: 3,
  },
  {
    id: 'bamboo_maze',
    name: 'Bamboo Maze',
    description: 'A labyrinth of towering bamboo stalks that shifts its paths with the changing wind.',
    lore: 'No one has ever mapped the complete Bamboo Maze, for it rearranges itself each time a bamboo nymph plays a different tune.',
    emoji: '🎋',
    level: 10,
    resources: ['jade_bamboo', 'harmony_petal', 'silver_thread'],
    capacity: 25,
    unlockLevel: 10,
    ambientColor: WL_COLOR_BAMBOO_YELLOW,
    dangerLevel: 4,
  },
  {
    id: 'spirit_fox_den',
    name: 'Spirit Fox Den',
    description: 'A network of underground tunnels beneath the great willow, illuminated by foxfire.',
    lore: 'The den\'s tunnels connect to every chamber of the lane, allowing spirit foxes to travel between groves in the blink of an eye.',
    emoji: '🦊',
    level: 15,
    resources: ['foxfire_ember', 'spirit_dew', 'lunar_moss'],
    capacity: 30,
    unlockLevel: 15,
    ambientColor: WL_COLOR_MOON_SILVER,
    dangerLevel: 5,
  },
  {
    id: 'moss_grotto',
    name: 'Moss Grotto',
    description: 'A cavern dripping with ancient moss where the oldest moss turtles hold silent council.',
    lore: 'Time flows differently in the Moss Grotto. A single hour spent within equals a day outside, making it a sanctuary for those who need rest.',
    emoji: '🏔️',
    level: 22,
    resources: ['ancient_moss', 'jade_bamboo', 'lotus_bloom'],
    capacity: 35,
    unlockLevel: 22,
    ambientColor: WL_COLOR_MOSS_GREEN,
    dangerLevel: 6,
  },
  {
    id: 'cloud_canopy',
    name: 'Cloud Canopy',
    description: 'The uppermost reaches of the tallest willows, where cloud herons nest among the treetops.',
    lore: 'From the Cloud Canopy, one can see the entire lane stretching to the horizon, a river of green and silver winding through the spirit realm.',
    emoji: '☁️',
    level: 30,
    resources: ['cloud_feather', 'foxfire_ember', 'harmony_petal'],
    capacity: 40,
    unlockLevel: 30,
    ambientColor: WL_COLOR_SPIRIT_WHITE,
    dangerLevel: 7,
  },
  {
    id: 'elder_willow_sanctum',
    name: 'Elder Willow Sanctum',
    description: 'The sacred heart of the lane where the Elder Willow stands, the first and greatest of all spirit trees.',
    lore: 'The Elder Willow\'s roots pierce every layer of the spirit realm, from the deepest underground springs to the highest cloud banks above.',
    emoji: '🌳',
    level: 40,
    resources: ['elder_wood', 'ancient_moss', 'moonstone_shard', 'foxfire_ember', 'lotus_bloom'],
    capacity: 50,
    unlockLevel: 40,
    ambientColor: WL_COLOR_DUSK_PURPLE,
    dangerLevel: 8,
  },
];

// ─── 7. WL_MATERIALS — 12 Materials ─────────────────────────────────────────

const WL_MATERIALS: WlMaterialDef[] = [
  {
    id: 'willow_branch',
    name: 'Willow Branch',
    rarity: 'common',
    source: 'forage',
    description: 'A supple branch from a lane willow, useful for crafting wands and weaving baskets.',
    emoji: '🌿',
  },
  {
    id: 'spirit_dew',
    name: 'Spirit Dew',
    rarity: 'common',
    source: 'forage',
    description: 'Morning dew collected from spirit-touched leaves, a basic ingredient in healing salves.',
    emoji: '💧',
  },
  {
    id: 'lotus_bloom',
    name: 'Lotus Bloom',
    rarity: 'common',
    source: 'forage',
    description: 'A pristine lotus flower from the Misty Pond, symbolizing spiritual purity.',
    emoji: '🪷',
  },
  {
    id: 'lunar_moss',
    name: 'Lunar Moss',
    rarity: 'uncommon',
    source: 'forage',
    description: 'Moss that grows only in moonlight, glowing softly with absorbed lunar energy.',
    emoji: '🌙',
  },
  {
    id: 'silver_thread',
    name: 'Silver Thread',
    rarity: 'uncommon',
    source: 'creature_drop',
    description: 'Gossamer thread shed by moon hares during their midnight grooming rituals.',
    emoji: '✨',
  },
  {
    id: 'jade_bamboo',
    name: 'Jade Bamboo',
    rarity: 'uncommon',
    source: 'forage',
    description: 'Bamboo of unusual hardness and green translucence, favored by bamboo nymphs for instruments.',
    emoji: '🎋',
  },
  {
    id: 'foxfire_ember',
    name: 'Foxfire Ember',
    rarity: 'rare',
    source: 'creature_drop',
    description: 'A glowing ember from a spirit fox\'s tail, burning with cold blue flame.',
    emoji: '🔥',
  },
  {
    id: 'moonstone_shard',
    name: 'Moonstone Shard',
    rarity: 'rare',
    source: 'forage',
    description: 'A fragment of pure moonstone found only in the Moonlit Clearing during full moons.',
    emoji: '💎',
  },
  {
    id: 'ancient_moss',
    name: 'Ancient Moss',
    rarity: 'rare',
    source: 'creature_drop',
    description: 'Centuries-old moss harvested from moss turtle shells, containing potent restorative properties.',
    emoji: '🧫',
  },
  {
    id: 'cloud_feather',
    name: 'Cloud Feather',
    rarity: 'rare',
    source: 'creature_drop',
    description: 'A feather from a cloud heron that retains the lightness and moisture of high-altitude clouds.',
    emoji: '🪶',
  },
  {
    id: 'harmony_petal',
    name: 'Harmony Petal',
    rarity: 'epic',
    source: 'event_reward',
    description: 'A petal that exists in multiple colors simultaneously, a physical manifestation of cosmic harmony.',
    emoji: '🌸',
  },
  {
    id: 'elder_wood',
    name: 'Elder Wood',
    rarity: 'legendary',
    source: 'structure_output',
    description: 'A fragment of the Elder Willow\'s heartwood, pulsing with the life force of the entire lane.',
    emoji: '🪵',
  },
];

// ─── 8. WL_STRUCTURES — 8 Structures (Upgradeable to Level 10) ─────────────

const WL_STRUCTURES: WlStructureDef[] = [
  {
    id: 'spirit_garden',
    name: 'Spirit Garden',
    description: 'A enchanted garden that auto-generates spirit dew and harmony petals based on its level.',
    maxLevel: 10,
    baseCost: 50,
    emoji: '🌻',
    category: 'production',
  },
  {
    id: 'willow_bench',
    name: 'Willow Contemplation Bench',
    description: 'A bench carved from living willow that restores harmony faster and provides meditation bonuses.',
    maxLevel: 10,
    baseCost: 40,
    emoji: '🪑',
    category: 'utility',
  },
  {
    id: 'lantern_shrine',
    name: 'Lantern Shrine',
    description: 'A shrine of floating lanterns that illuminates dark chambers and reveals hidden creatures.',
    maxLevel: 10,
    baseCost: 60,
    emoji: '🏮',
    category: 'exploration',
  },
  {
    id: 'moss_wall',
    name: 'Living Moss Wall',
    description: 'A defensive barrier of dense moss that protects creatures and resources from danger.',
    maxLevel: 10,
    baseCost: 70,
    emoji: '🧱',
    category: 'defense',
  },
  {
    id: 'bamboo_observatory',
    name: 'Bamboo Observatory',
    description: 'A towering bamboo structure that grants view of distant chambers and incoming events.',
    maxLevel: 10,
    baseCost: 80,
    emoji: '🔭',
    category: 'exploration',
  },
  {
    id: 'moon_mirror_pool',
    name: 'Moon Mirror Pool',
    description: 'A reflective pool that duplicates certain resources and enhances creature bonding speed.',
    maxLevel: 10,
    baseCost: 100,
    emoji: '🪞',
    category: 'production',
  },
  {
    id: 'foxfire_forge',
    name: 'Foxfire Forge',
    description: 'A forge powered by foxfire that crafts powerful artifacts from rare materials.',
    maxLevel: 10,
    baseCost: 120,
    emoji: '⚒️',
    category: 'crafting',
  },
  {
    id: 'elder_shrine',
    name: 'Elder Willow Shrine',
    description: 'A sacred shrine to the Elder Willow that grants substantial bonuses to all lane activities.',
    maxLevel: 10,
    baseCost: 150,
    emoji: '⛩️',
    category: 'utility',
  },
];

// ─── 9. WL_ABILITIES — 8 Abilities (2 per Category) ────────────────────────

const WL_ABILITIES: WlAbilityDef[] = [
  // Offensive (2)
  {
    id: 'willow_whip',
    name: 'Willow Whip',
    description: 'Commands willow branches to lash out at threats, dealing nature damage to all nearby enemies.',
    category: 'offensive',
    cooldown: 20,
    power: 30,
    cost: 40,
    emoji: '🌿',
  },
  {
    id: 'foxfire_burst',
    name: 'Foxfire Burst',
    description: 'Unleashes a burst of cold blue foxfire that scorches foes with spirit energy.',
    category: 'offensive',
    cooldown: 30,
    power: 50,
    cost: 80,
    emoji: '🔥',
  },
  // Defensive (2)
  {
    id: 'moss_armor',
    name: 'Moss Armor',
    description: 'Encases the user in living moss that absorbs damage and slowly regenerates.',
    category: 'defensive',
    cooldown: 45,
    power: 35,
    cost: 50,
    emoji: '🛡️',
  },
  {
    id: 'moonlight_veil',
    name: 'Moonlight Veil',
    description: 'Wraps the user in a veil of moonlight that deflects attacks and renders them partially invisible.',
    category: 'defensive',
    cooldown: 60,
    power: 45,
    cost: 90,
    emoji: '🌙',
  },
  // Utility (2)
  {
    id: 'spirit_sight',
    name: 'Spirit Sight',
    description: 'Enhances perception to see hidden creatures, secret paths, and invisible materials.',
    category: 'utility',
    cooldown: 25,
    power: 15,
    cost: 30,
    emoji: '👁️',
  },
  {
    id: 'bamboo_step',
    name: 'Bamboo Step',
    description: 'Allows instantaneous travel between any two bamboo groves on the lane.',
    category: 'utility',
    cooldown: 40,
    power: 20,
    cost: 60,
    emoji: '🎋',
  },
  // Summon (2)
  {
    id: 'call_of_the_fox',
    name: 'Call of the Fox',
    description: 'Summons a pack of spirit foxes to assist in gathering resources and scouting chambers.',
    category: 'summon',
    cooldown: 50,
    power: 25,
    cost: 70,
    emoji: '🦊',
  },
  {
    id: 'heron_migration',
    name: 'Heron Migration',
    description: 'Calls a flock of cloud herons that create protective mist and reveal distant events.',
    category: 'summon',
    cooldown: 70,
    power: 40,
    cost: 100,
    emoji: '🪶',
  },
];

// ─── 10. WL_ACHIEVEMENTS — 10 Achievements ──────────────────────────────────

const WL_ACHIEVEMENTS: WlAchievementDef[] = [
  {
    id: 'first_steps',
    name: 'First Steps on the Lane',
    description: 'Visit the Willow Entrance for the first time and begin your journey.',
    condition: 'totalVisits >= 1',
    reward: 25,
    emoji: '👣',
  },
  {
    id: 'fox_friend',
    name: 'Fox Friend',
    description: 'Befriend 5 different spirit foxes along the lane.',
    condition: 'foxCount >= 5',
    reward: 100,
    emoji: '🦊',
  },
  {
    id: 'green_thumb',
    name: 'Green Thumb',
    description: 'Plant seeds or nurture life 20 times across all chambers.',
    condition: 'totalPlanted >= 20',
    reward: 80,
    emoji: '🌱',
  },
  {
    id: 'chamber_explorer',
    name: 'Chamber Explorer',
    description: 'Unlock and visit all 8 groves of the Willow Lane.',
    condition: 'chambersUnlocked >= 8',
    reward: 300,
    emoji: '🗺️',
  },
  {
    id: 'harmony_master',
    name: 'Harmony Master',
    description: 'Reach maximum harmony (200) through peaceful actions and meditation.',
    condition: 'harmony >= 200',
    reward: 200,
    emoji: '☮️',
  },
  {
    id: 'artifact_collector',
    name: 'Artifact Collector',
    description: 'Acquire all 6 legendary artifacts of the lane.',
    condition: 'artifactsOwned >= 6',
    reward: 500,
    emoji: '🏺',
  },
  {
    id: 'lane_level_25',
    name: 'Lane Walker',
    description: 'Reach lane level 25 through exploration and befriending creatures.',
    condition: 'laneLevel >= 25',
    reward: 250,
    emoji: '⭐',
  },
  {
    id: 'structure_magnate',
    name: 'Structure Magnate',
    description: 'Build and fully upgrade all 8 structures to their maximum level.',
    condition: 'maxedStructures >= 8',
    reward: 600,
    emoji: '🏗️',
  },
  {
    id: 'creature_companion',
    name: 'Creature Companion',
    description: 'Befriend 20 different creatures across all species.',
    condition: 'totalBefriended >= 20',
    reward: 400,
    emoji: '🐾',
  },
  {
    id: 'lane_sage',
    name: 'Lane Sage',
    description: 'Reach the maximum lane level of 50 and complete the journey of the Willow Lane.',
    condition: 'laneLevel >= 50',
    reward: 1000,
    emoji: '🏆',
  },
];

// ─── 11. WL_TITLES — 8 Titles ───────────────────────────────────────────────

const WL_TITLES: WlTitleDef[] = [
  {
    id: 0,
    name: 'Wandering Leaf',
    requiredLevel: 1,
    description: 'A traveler who has just begun to walk the Willow Lane.',
  },
  {
    id: 1,
    name: 'Pond Wader',
    requiredLevel: 5,
    description: 'One who has waded into the Misty Pond and felt the spirit dew.',
  },
  {
    id: 2,
    name: 'Moonlight Seeker',
    requiredLevel: 10,
    description: 'A seeker drawn by the silver beams of the Moonlit Clearing.',
  },
  {
    id: 3,
    name: 'Bamboo Whisperer',
    requiredLevel: 18,
    description: 'One who has learned to listen to the bamboo\'s ancient songs.',
  },
  {
    id: 4,
    name: 'Fox Spirit Ally',
    requiredLevel: 25,
    description: 'A trusted friend of the spirit foxes, welcomed into their den.',
  },
  {
    id: 5,
    name: 'Moss Guardian',
    requiredLevel: 33,
    description: 'A protector of the ancient moss and all the slow wisdom it holds.',
  },
  {
    id: 6,
    name: 'Cloud Walker',
    requiredLevel: 42,
    description: 'One who has ascended to the Cloud Canopy and touched the sky.',
  },
  {
    id: 7,
    name: 'Elder\'s Chosen',
    requiredLevel: 50,
    description: 'The highest honor — chosen by the Elder Willow itself as guardian of the lane.',
  },
];

// ─── 12. WL_ARTIFACTS — 6 Artifacts ────────────────────────────────────────

const WL_ARTIFACTS: WlArtifactDef[] = [
  {
    id: 'willow_crown',
    name: 'Willow Crown',
    description: 'A living crown of woven willow branches that grants enhanced harmony regeneration.',
    lore: 'Crafted by the Heartwood Matriarch during the First Spring, the Willow Crown has been worn by every guardian of the lane.',
    rarity: 'rare',
    bonus: '+20% harmony regeneration',
    cost: 120,
    emoji: '👑',
  },
  {
    id: 'moonstone_pendant',
    name: 'Moonstone Pendant',
    description: 'A pendant holding a perfectly round moonstone that boosts creature bonding strength.',
    lore: 'The Moonstone Pendant catches moonlight during the day and releases it during the night, creating a perpetual glow around the wearer.',
    rarity: 'rare',
    bonus: '+15% bond strength gain',
    cost: 130,
    emoji: '📿',
  },
  {
    id: 'foxfire_lantern',
    name: 'Foxfire Lantern',
    description: 'A lantern fueled by foxfire embers that reveals hidden paths and secret chambers.',
    lore: 'The Foxfire Lantern was a gift from the Nine-Tailed Sovereign to the first human who showed kindness to a spirit fox pup.',
    rarity: 'epic',
    bonus: 'Reveal hidden chamber resources',
    cost: 250,
    emoji: '🏮',
  },
  {
    id: 'moss_turtle_shield',
    name: 'Moss Turtle Shield',
    description: 'A shield carved from an ancient moss turtle shell, providing immense defensive protection.',
    lore: 'The shell used for this shield came from a Stoneback Sage who willingly shed it after a thousand years of growth, knowing it would serve a greater purpose.',
    rarity: 'epic',
    bonus: '+30% creature defense',
    cost: 280,
    emoji: '🛡️',
  },
  {
    id: 'cloud_heron_wings',
    name: 'Cloud Heron Wings',
    description: 'Mystical wings woven from cloud heron feathers that grant the ability to float between chambers.',
    lore: 'The Cloud Heron Wings are not physical wings but an enchantment that makes the wearer as light as mist, allowing them to drift on the wind.',
    rarity: 'epic',
    bonus: 'Instant chamber travel',
    cost: 300,
    emoji: '🪶',
  },
  {
    id: 'elder_heart_core',
    name: 'Elder Heart Core',
    description: 'A crystallized fragment of the Elder Willow\'s heartwood containing primordial life energy.',
    lore: 'The Elder Heart Core is said to contain the essence of the first willow seed ever planted, making it the most sacred artifact on the lane.',
    rarity: 'legendary',
    bonus: '+50% all resource generation',
    cost: 500,
    emoji: '💎',
  },
];

// ─── 13. WL_EVENTS — 8 Events ──────────────────────────────────────────────

const WL_EVENTS: WlEventDef[] = [
  {
    id: 'spirit_festival',
    name: 'Spirit Lantern Festival',
    description: 'Hundreds of floating lanterns illuminate the lane, doubling creature encounter rates.',
    lore: 'The Spirit Lantern Festival commemorates the night the first spirit fox appeared on the lane, its nine tails ablaze with welcome.',
    frequency: 'common',
    duration: 30,
    reward: 'foxfire_ember',
    requirement: 'laneLevel >= 3',
    emoji: '🏮',
  },
  {
    id: 'lotus_bloom_night',
    name: 'Lotus Bloom Night',
    description: 'All lotus flowers along the Misty Pond bloom simultaneously, yielding bonus lotus blooms.',
    lore: 'Lotus Bloom Night occurs when the pond spirits sing in perfect unison, their voices causing every lotus seed in the pond to germinate at once.',
    frequency: 'common',
    duration: 20,
    reward: 'lotus_bloom',
    requirement: 'laneLevel >= 5',
    emoji: '🪷',
  },
  {
    id: 'harvest_moon',
    name: 'Harvest Moon Rising',
    description: 'The harvest moon empowers moon hares, granting double XP from all activities.',
    lore: 'During the Harvest Moon Rising, even the smallest dusk leveret can channel the power of the Jade Emperor Hare itself.',
    frequency: 'uncommon',
    duration: 45,
    reward: 'moonstone_shard',
    requirement: 'laneLevel >= 10',
    emoji: '🌕',
  },
  {
    id: 'bamboo_concert',
    name: 'Grand Bamboo Concert',
    description: 'All bamboo nymphs gather to perform, generating harmony petals and unlocking secrets.',
    lore: 'The Grand Bamboo Concert is held once every hundred years, and its final chord always reveals something new about the lane.',
    frequency: 'uncommon',
    duration: 25,
    reward: 'harmony_petal',
    requirement: 'laneLevel >= 15',
    emoji: '🎵',
  },
  {
    id: 'foxfire_eclipse',
    name: 'Foxfire Eclipse',
    description: 'A rare eclipse where foxfire burns brighter than ever, revealing legendary creature paths.',
    lore: 'The last Foxfire Eclipse coincided with the appearance of the Willow Kami, who walked the entire lane in the span of a single heartbeat.',
    frequency: 'rare',
    duration: 15,
    reward: 'foxfire_ember',
    requirement: 'laneLevel >= 25',
    emoji: '🌑',
  },
  {
    id: 'ancient_moss_awakening',
    name: 'Ancient Moss Awakening',
    description: 'Dormant moss across the lane awakens, providing massive resource bonuses for a limited time.',
    lore: 'The Ancient Moss Awakening happens when the Primordial Tortoise stirs in its sleep, sending waves of life through every moss fiber in the lane.',
    frequency: 'rare',
    duration: 35,
    reward: 'ancient_moss',
    requirement: 'laneLevel >= 30',
    emoji: '🌱',
  },
  {
    id: 'elder_willow_dreaming',
    name: 'Elder Willow Dreaming',
    description: 'The Elder Willow enters a deep dream state, granting visions of powerful artifacts.',
    lore: 'When the Elder Willow dreams, the entire lane dreams with it. Creatures sleepwalk, willows whisper prophecies, and the very air shimmers with visions.',
    frequency: 'rare',
    duration: 40,
    reward: 'elder_wood',
    requirement: 'laneLevel >= 38',
    emoji: '💭',
  },
  {
    id: 'convergence_of_spirits',
    name: 'Convergence of Spirits',
    description: 'All spirit beings converge at the lane\'s center, enabling befriending of legendary creatures.',
    lore: 'The Convergence of Spirits is the rarest event, occurring only when all seven species gather willingly at the Elder Willow Sanctum.',
    frequency: 'legendary',
    duration: 60,
    reward: 'elder_wood',
    requirement: 'laneLevel >= 45',
    emoji: '✨',
  },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

function wlXpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function wlRarityMultiplier(rarity: WlRarity): number {
  switch (rarity) {
    case 'common': return 1;
    case 'uncommon': return 1.5;
    case 'rare': return 2.5;
    case 'epic': return 4;
    case 'legendary': return 8;
  }
}

function wlStructureUpgradeCost(baseCost: number, currentLevel: number): number {
  return Math.floor(baseCost * Math.pow(1.5, currentLevel));
}

function wlHarmonyRegenRate(level: number, structureLevels: Record<string, number>): number {
  let rate = 1;
  if (structureLevels['willow_bench']) rate += structureLevels['willow_bench'] * 0.5;
  if (structureLevels['elder_shrine']) rate += structureLevels['elder_shrine'] * 1;
  rate += Math.floor(level / 5) * 0.2;
  return rate;
}

function wlCoinForXp(xp: number): number {
  return Math.floor(xp * 0.5);
}

function wlCreateDefaultState(): WlWillowLaneState {
  const chambers: Record<string, WlChamberProgress> = {};
  for (const chamber of WL_CHAMBERS) {
    chambers[chamber.id] = {
      chamberId: chamber.id,
      unlocked: chamber.unlockLevel === 1,
      visits: 0,
      lastVisited: null,
      deepestPoint: 0,
    };
  }

  const achievements: Record<string, WlAchievementState> = {};
  for (const ach of WL_ACHIEVEMENTS) {
    achievements[ach.id] = {
      achievementId: ach.id,
      unlocked: false,
      unlockedAt: null,
    };
  }

  const artifacts: Record<string, WlArtifactState> = {};
  for (const art of WL_ARTIFACTS) {
    artifacts[art.id] = {
      artifactId: art.id,
      acquired: false,
      acquiredAt: null,
      equipped: false,
    };
  }

  const events: Record<string, WlEventState> = {};
  for (const evt of WL_EVENTS) {
    events[evt.id] = {
      eventId: evt.id,
      active: false,
      startedAt: null,
      endsAt: null,
      completions: 0,
    };
  }

  const abilities: Record<string, WlAbilityState> = {};
  for (const ability of WL_ABILITIES) {
    abilities[ability.id] = {
      abilityId: ability.id,
      unlocked: false,
      unlockedAt: null,
      currentCooldown: 0,
      uses: 0,
    };
  }

  return {
    chambers,
    creatures: {},
    materials: {
      willow_branch: { materialId: 'willow_branch', quantity: 5 },
      spirit_dew: { materialId: 'spirit_dew', quantity: 3 },
    },
    structures: {},
    achievements,
    artifacts,
    events,
    abilities,
    currentTitle: 0,
    laneLevel: 1,
    laneXp: WL_STARTING_XP,
    spiritCoins: WL_STARTING_COINS,
    harmony: WL_STARTING_HARMONY,
    totalVisits: 0,
    totalBefriended: 0,
    totalHarvested: 0,
    totalPlanted: 0,
    activeChamberId: 'willow_entrance',
    selectedAction: 'plant',
    willowEssence: WL_STARTING_WILLOW_ESSENCE,
  };
}

// ─── 14. Main Hook ──────────────────────────────────────────────────────────

export default function useWillowLane(initialState?: WlWillowLaneState) {
  const [state, setState] = useState<WlWillowLaneState>(initialState ?? wlCreateDefaultState());
  const stateRef = useRef(state);

  // stateRef sync via useEffect — NOT during render
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const wlAddXp = useCallback((amount: number) => {
    setState(prev => {
      let newLevel = prev.laneLevel;
      let newXp = prev.laneXp + amount;
      let maxXp = wlXpForLevel(prev.laneLevel);
      let newTitle = prev.currentTitle;

      while (newXp >= maxXp && newLevel < WL_MAX_LEVEL) {
        newXp -= maxXp;
        newLevel += 1;
        maxXp = wlXpForLevel(newLevel);
      }
      if (newXp >= maxXp) newXp = maxXp;

      for (let i = WL_TITLES.length - 1; i >= 0; i--) {
        if (newLevel >= WL_TITLES[i].requiredLevel && i > newTitle) {
          newTitle = i;
          break;
        }
      }

      // Auto-unlock chambers when level requirements are met
      const newChambers = { ...prev.chambers };
      for (const chamber of WL_CHAMBERS) {
        if (newLevel >= chamber.unlockLevel && !newChambers[chamber.id].unlocked) {
          newChambers[chamber.id] = { ...newChambers[chamber.id], unlocked: true };
        }
      }

      return {
        ...prev,
        chambers: newChambers,
        laneLevel: newLevel,
        laneXp: newXp,
        currentTitle: newTitle,
        spiritCoins: prev.spiritCoins + wlCoinForXp(amount),
        willowEssence: Math.min(WL_MAX_WILLOW_ESSENCE, prev.willowEssence + Math.floor(amount * 0.3)),
      };
    });
  }, []);

  const wlVisitChamber = useCallback((chamberId: string): boolean => {
    let success = false;
    setState(prev => {
      const chamberProgress = prev.chambers[chamberId];
      const chamberDef = WL_CHAMBERS.find(c => c.id === chamberId);
      if (!chamberProgress || !chamberDef) return prev;
      if (!chamberProgress.unlocked) return prev;
      if (prev.harmony < 5) return prev;

      success = true;
      return {
        ...prev,
        activeChamberId: chamberId,
        harmony: Math.max(0, prev.harmony - 5),
        totalVisits: prev.totalVisits + 1,
        chambers: {
          ...prev.chambers,
          [chamberId]: {
            ...chamberProgress,
            visits: chamberProgress.visits + 1,
            lastVisited: Date.now(),
          },
        },
      };
    });
    if (success) wlAddXp(10);
    return success;
  }, [wlAddXp]);

  const wlBefriendCreature = useCallback((creatureId: string): boolean => {
    let success = false;
    setState(prev => {
      const creatureDef = WL_CREATURES.find(c => c.id === creatureId);
      if (!creatureDef) return prev;
      if (prev.creatures[creatureId]) return prev;
      if (prev.spiritCoins < creatureDef.cost) return prev;

      success = true;
      return {
        ...prev,
        spiritCoins: prev.spiritCoins - creatureDef.cost,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            creatureId,
            befriendedAt: Date.now(),
            bondStrength: WL_BOND_STRENGTH_BASE,
            maxBondStrength: WL_BOND_STRENGTH_BASE + WL_BOND_STRENGTH_PER_LEVEL * prev.laneLevel,
          },
        },
        totalBefriended: prev.totalBefriended + 1,
      };
    });
    if (success) wlAddXp(15);
    return success;
  }, [wlAddXp]);

  const wlStrengthenBond = useCallback((creatureId: string): boolean => {
    let success = false;
    setState(prev => {
      const bonded = prev.creatures[creatureId];
      if (!bonded) return prev;
      if (bonded.bondStrength >= bonded.maxBondStrength) return prev;
      if (prev.harmony < 10) return prev;

      success = true;
      return {
        ...prev,
        harmony: prev.harmony - 10,
        creatures: {
          ...prev.creatures,
          [creatureId]: {
            ...bonded,
            bondStrength: Math.min(bonded.maxBondStrength, bonded.bondStrength + 5),
          },
        },
      };
    });
    if (success) wlAddXp(5);
    return success;
  }, [wlAddXp]);

  const wlReleaseCreature = useCallback((creatureId: string): boolean => {
    let success = false;
    setState(prev => {
      if (!prev.creatures[creatureId]) return prev;
      success = true;
      const next = { ...prev.creatures };
      delete next[creatureId];
      return { ...prev, creatures: next };
    });
    return success;
  }, []);

  const wlHarvestMaterial = useCallback((materialId: string): boolean => {
    let success = false;
    setState(prev => {
      const matDef = WL_MATERIALS.find(m => m.id === materialId);
      if (!matDef) return prev;

      const existing = prev.materials[materialId];
      success = true;
      return {
        ...prev,
        materials: {
          ...prev.materials,
          [materialId]: {
            materialId,
            quantity: (existing ? existing.quantity : 0) + 1,
          },
        },
        totalHarvested: prev.totalHarvested + 1,
      };
    });
    if (success) wlAddXp(3);
    return success;
  }, [wlAddXp]);

  const wlPlantAction = useCallback((): boolean => {
    let success = false;
    setState(prev => {
      if (prev.harmony < 3) return prev;
      success = true;
      return {
        ...prev,
        harmony: Math.max(0, prev.harmony - 3),
        totalPlanted: prev.totalPlanted + 1,
        willowEssence: Math.min(WL_MAX_WILLOW_ESSENCE, prev.willowEssence + 2),
      };
    });
    if (success) wlAddXp(4);
    return success;
  }, [wlAddXp]);

  const wlBuildStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState(prev => {
      const structDef = WL_STRUCTURES.find(s => s.id === structureId);
      if (!structDef) return prev;
      if (prev.structures[structureId]) return prev;
      if (prev.spiritCoins < structDef.baseCost) return prev;

      success = true;
      return {
        ...prev,
        spiritCoins: prev.spiritCoins - structDef.baseCost,
        structures: {
          ...prev.structures,
          [structureId]: {
            structureId,
            level: 1,
            builtAt: Date.now(),
          },
        },
      };
    });
    if (success) wlAddXp(20);
    return success;
  }, [wlAddXp]);

  const wlUpgradeStructure = useCallback((structureId: string): boolean => {
    let success = false;
    setState(prev => {
      const structDef = WL_STRUCTURES.find(s => s.id === structureId);
      const owned = prev.structures[structureId];
      if (!structDef || !owned) return prev;
      if (owned.level >= structDef.maxLevel) return prev;

      const cost = wlStructureUpgradeCost(structDef.baseCost, owned.level);
      if (prev.spiritCoins < cost) return prev;

      success = true;
      return {
        ...prev,
        spiritCoins: prev.spiritCoins - cost,
        structures: {
          ...prev.structures,
          [structureId]: { ...owned, level: owned.level + 1 },
        },
      };
    });
    if (success) wlAddXp(25);
    return success;
  }, [wlAddXp]);

  const wlUnlockAbility = useCallback((abilityId: string): boolean => {
    let success = false;
    setState(prev => {
      const abilityDef = WL_ABILITIES.find(a => a.id === abilityId);
      if (!abilityDef) return prev;
      const abilityState = prev.abilities[abilityId];
      if (!abilityState || abilityState.unlocked) return prev;
      if (prev.spiritCoins < abilityDef.cost) return prev;

      success = true;
      return {
        ...prev,
        spiritCoins: prev.spiritCoins - abilityDef.cost,
        abilities: {
          ...prev.abilities,
          [abilityId]: {
            ...abilityState,
            unlocked: true,
            unlockedAt: Date.now(),
          },
        },
      };
    });
    if (success) wlAddXp(30);
    return success;
  }, [wlAddXp]);

  const wlUseAbility = useCallback((abilityId: string): boolean => {
    let success = false;
    setState(prev => {
      const abilityDef = WL_ABILITIES.find(a => a.id === abilityId);
      const abilityState = prev.abilities[abilityId];
      if (!abilityDef || !abilityState) return prev;
      if (!abilityState.unlocked) return prev;
      if (abilityState.currentCooldown > 0) return prev;
      if (prev.harmony < 15) return prev;

      success = true;
      const effectiveCooldown = Math.max(1, abilityDef.cooldown - WL_COOLDOWN_REDUCTION_PER_LEVEL * prev.laneLevel);
      return {
        ...prev,
        harmony: prev.harmony - 15,
        abilities: {
          ...prev.abilities,
          [abilityId]: {
            ...abilityState,
            currentCooldown: effectiveCooldown,
            uses: abilityState.uses + 1,
          },
        },
      };
    });
    if (success) wlAddXp(20);
    return success;
  }, [wlAddXp]);

  const wlAcquireArtifact = useCallback((artifactId: string): boolean => {
    let success = false;
    setState(prev => {
      const artifactDef = WL_ARTIFACTS.find(a => a.id === artifactId);
      const artifactState = prev.artifacts[artifactId];
      if (!artifactDef || !artifactState) return prev;
      if (artifactState.acquired) return prev;
      if (prev.spiritCoins < artifactDef.cost) return prev;

      success = true;
      return {
        ...prev,
        spiritCoins: prev.spiritCoins - artifactDef.cost,
        artifacts: {
          ...prev.artifacts,
          [artifactId]: {
            ...artifactState,
            acquired: true,
            acquiredAt: Date.now(),
          },
        },
      };
    });
    if (success) wlAddXp(40);
    return success;
  }, [wlAddXp]);

  const wlEquipArtifact = useCallback((artifactId: string): boolean => {
    let success = false;
    setState(prev => {
      const artifactState = prev.artifacts[artifactId];
      if (!artifactState || !artifactState.acquired) return prev;

      success = true;
      const newArtifacts = { ...prev.artifacts };
      // Unequip all others first
      for (const key of Object.keys(newArtifacts)) {
        newArtifacts[key] = { ...newArtifacts[key], equipped: false };
      }
      newArtifacts[artifactId] = { ...newArtifacts[artifactId], equipped: true };

      return { ...prev, artifacts: newArtifacts };
    });
    return success;
  }, []);

  const wlStartEvent = useCallback((eventId: string): boolean => {
    let success = false;
    setState(prev => {
      const eventDef = WL_EVENTS.find(e => e.id === eventId);
      const eventState = prev.events[eventId];
      if (!eventDef || !eventState) return prev;
      if (eventState.active) return prev;
      if (prev.laneLevel < parseInt(eventDef.requirement.replace('laneLevel >= ', ''))) return prev;

      success = true;
      return {
        ...prev,
        events: {
          ...prev.events,
          [eventId]: {
            ...eventState,
            active: true,
            startedAt: Date.now(),
            endsAt: Date.now() + eventDef.duration * 60000,
          },
        },
      };
    });
    return success;
  }, []);

  const wlCompleteEvent = useCallback((eventId: string): boolean => {
    let success = false;
    setState(prev => {
      const eventDef = WL_EVENTS.find(e => e.id === eventId);
      const eventState = prev.events[eventId];
      if (!eventDef || !eventState) return prev;
      if (!eventState.active) return prev;

      success = true;
      const rewardMatId = eventDef.reward;
      const existingRewardMat = prev.materials[rewardMatId];

      return {
        ...prev,
        events: {
          ...prev.events,
          [eventId]: {
            ...eventState,
            active: false,
            startedAt: null,
            endsAt: null,
            completions: eventState.completions + 1,
          },
        },
        materials: {
          ...prev.materials,
          [rewardMatId]: {
            materialId: rewardMatId,
            quantity: (existingRewardMat ? existingRewardMat.quantity : 0) + 3,
          },
        },
      };
    });
    if (success) wlAddXp(35);
    return success;
  }, [wlAddXp]);

  const wlSelectAction = useCallback((action: WlAction): void => {
    setState(prev => ({ ...prev, selectedAction: action }));
  }, []);

  const wlClaimAchievement = useCallback((achievementId: string): boolean => {
    let success = false;
    let rewardAmount = 0;
    setState(prev => {
      const achState = prev.achievements[achievementId];
      const achDef = WL_ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achState || !achDef) return prev;
      if (achState.unlocked) return prev;

      success = true;
      rewardAmount = achDef.reward;
      return {
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: {
            ...achState,
            unlocked: true,
            unlockedAt: Date.now(),
          },
        },
        spiritCoins: prev.spiritCoins + achDef.reward,
      };
    });
    if (success) wlAddXp(rewardAmount);
    return success;
  }, [wlAddXp]);

  const wlUnlockTitle = useCallback((titleId: number): boolean => {
    let success = false;
    setState(prev => {
      const title = WL_TITLES.find(t => t.id === titleId);
      if (!title) return prev;
      if (prev.laneLevel < title.requiredLevel) return prev;

      success = true;
      return { ...prev, currentTitle: titleId };
    });
    return success;
  }, []);

  const wlRestoreHarmony = useCallback((amount: number): void => {
    setState(prev => {
      return { ...prev, harmony: Math.min(WL_MAX_HARMONY, prev.harmony + amount) };
    });
  }, []);

  const wlSpendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.spiritCoins < amount) return prev;
      success = true;
      return { ...prev, spiritCoins: prev.spiritCoins - amount };
    });
    return success;
  }, []);

  const wlSetActiveChamber = useCallback((chamberId: string): void => {
    setState(prev => ({ ...prev, activeChamberId: chamberId }));
  }, []);

  const wlTradeMaterial = useCallback((giveId: string, giveQty: number, receiveId: string, receiveQty: number): boolean => {
    let success = false;
    setState(prev => {
      const giveMat = prev.materials[giveId];
      const recDef = WL_MATERIALS.find(m => m.id === receiveId);
      if (!giveMat) return prev;
      if (giveMat.quantity < giveQty) return prev;
      if (!recDef) return prev;

      success = true;
      const newGiveQty = giveMat.quantity - giveQty;
      const newMaterials = { ...prev.materials };
      if (newGiveQty <= 0) {
        delete newMaterials[giveId];
      } else {
        newMaterials[giveId] = { ...giveMat, quantity: newGiveQty };
      }

      const existingReceive = newMaterials[receiveId];
      if (existingReceive) {
        newMaterials[receiveId] = { ...existingReceive, quantity: existingReceive.quantity + receiveQty };
      } else {
        newMaterials[receiveId] = { materialId: receiveId, quantity: receiveQty };
      }

      return { ...prev, materials: newMaterials };
    });
    return success;
  }, []);

  // ── Getters (useMemo [state]) ─────────────────────────────────────────────

  const wlGetChamberDetails = useMemo(() => {
    return WL_CHAMBERS.map(chamber => {
      const chamberState = state.chambers[chamber.id];
      return {
        ...chamber,
        unlocked: chamberState?.unlocked ?? false,
        visits: chamberState?.visits ?? 0,
        lastVisited: chamberState?.lastVisited ?? null,
        deepestPoint: chamberState?.deepestPoint ?? 0,
      };
    });
  }, [state]);

  const wlGetCreatureList = useMemo(() => {
    const list: Array<{
      def: WlCreatureDef;
      befriended: boolean;
      befriendedAt: number | null;
      bondStrength: number;
      maxBondStrength: number;
    }> = [];
    for (const creatureDef of WL_CREATURES) {
      const befriended = state.creatures[creatureDef.id];
      list.push({
        def: creatureDef,
        befriended: !!befriended,
        befriendedAt: befriended?.befriendedAt ?? null,
        bondStrength: befriended?.bondStrength ?? 0,
        maxBondStrength: befriended?.maxBondStrength ?? creatureDef.defense * 2,
      });
    }
    return list;
  }, [state]);

  const wlGetMaterialInventory = useMemo(() => {
    const inventory: Array<{ def: WlMaterialDef; quantity: number }> = [];
    for (const matDef of WL_MATERIALS) {
      const owned = state.materials[matDef.id];
      inventory.push({
        def: matDef,
        quantity: owned?.quantity ?? 0,
      });
    }
    return inventory;
  }, [state]);

  const wlGetStructureList = useMemo(() => {
    const list: Array<{
      def: WlStructureDef;
      owned: boolean;
      level: number;
      builtAt: number | null;
      upgradeCost: number;
    }> = [];
    for (const structDef of WL_STRUCTURES) {
      const owned = state.structures[structDef.id];
      list.push({
        def: structDef,
        owned: !!owned,
        level: owned?.level ?? 0,
        builtAt: owned?.builtAt ?? null,
        upgradeCost: owned
          ? wlStructureUpgradeCost(structDef.baseCost, owned.level)
          : structDef.baseCost,
      });
    }
    return list;
  }, [state]);

  const wlGetAbilityList = useMemo(() => {
    const list: Array<{
      def: WlAbilityDef;
      unlocked: boolean;
      unlockedAt: number | null;
      currentCooldown: number;
      uses: number;
    }> = [];
    for (const abilityDef of WL_ABILITIES) {
      const abilityState = state.abilities[abilityDef.id];
      list.push({
        def: abilityDef,
        unlocked: abilityState?.unlocked ?? false,
        unlockedAt: abilityState?.unlockedAt ?? null,
        currentCooldown: abilityState?.currentCooldown ?? 0,
        uses: abilityState?.uses ?? 0,
      });
    }
    return list;
  }, [state]);

  const wlGetArtifactList = useMemo(() => {
    const list: Array<{
      def: WlArtifactDef;
      acquired: boolean;
      acquiredAt: number | null;
      equipped: boolean;
    }> = [];
    for (const artifactDef of WL_ARTIFACTS) {
      const artifactState = state.artifacts[artifactDef.id];
      list.push({
        def: artifactDef,
        acquired: artifactState?.acquired ?? false,
        acquiredAt: artifactState?.acquiredAt ?? null,
        equipped: artifactState?.equipped ?? false,
      });
    }
    return list;
  }, [state]);

  const wlGetEventList = useMemo(() => {
    const list: Array<{
      def: WlEventDef;
      active: boolean;
      startedAt: number | null;
      endsAt: number | null;
      completions: number;
    }> = [];
    for (const eventDef of WL_EVENTS) {
      const eventState = state.events[eventDef.id];
      list.push({
        def: eventDef,
        active: eventState?.active ?? false,
        startedAt: eventState?.startedAt ?? null,
        endsAt: eventState?.endsAt ?? null,
        completions: eventState?.completions ?? 0,
      });
    }
    return list;
  }, [state]);

  const wlGetTotalPower = useMemo(() => {
    const befriendedCount = Object.keys(state.creatures).length;
    const structureLevels = Object.values(state.structures).reduce((sum, s) => sum + s.level, 0);
    const creaturePower = Object.entries(state.creatures).reduce((sum, [id, bonded]) => {
      const def = WL_CREATURES.find(c => c.id === id);
      if (!def) return sum;
      return sum + def.power + def.defense;
    }, 0);
    const artifactBonus = Object.values(state.artifacts).filter(a => a.equipped).length * 15;
    return befriendedCount * 2 + structureLevels * 3 + Math.floor(creaturePower / 5) + artifactBonus + state.laneLevel;
  }, [state]);

  const wlGetLevelProgress = useMemo(() => {
    const maxXp = wlXpForLevel(state.laneLevel);
    return {
      current: state.laneXp,
      max: maxXp,
      progress: maxXp > 0 ? Math.min(1, state.laneXp / maxXp) : 1,
      percentage: maxXp > 0 ? Math.min(100, Math.floor((state.laneXp / maxXp) * 100)) : 100,
    };
  }, [state]);

  const wlGetHarmonyProgress = useMemo(() => {
    return {
      current: state.harmony,
      max: WL_MAX_HARMONY,
      progress: Math.min(1, state.harmony / WL_MAX_HARMONY),
      percentage: Math.min(100, Math.floor((state.harmony / WL_MAX_HARMONY) * 100)),
    };
  }, [state]);

  const wlGetWillowEssenceProgress = useMemo(() => {
    return {
      current: state.willowEssence,
      max: WL_MAX_WILLOW_ESSENCE,
      progress: Math.min(1, state.willowEssence / WL_MAX_WILLOW_ESSENCE),
      percentage: Math.min(100, Math.floor((state.willowEssence / WL_MAX_WILLOW_ESSENCE) * 100)),
    };
  }, [state]);

  const wlGetActiveChamber = useMemo(() => {
    const chamberDef = WL_CHAMBERS.find(c => c.id === state.activeChamberId);
    const chamberState = state.chambers[state.activeChamberId];
    return {
      def: chamberDef ?? WL_CHAMBERS[0],
      state: chamberState ?? { unlocked: false, visits: 0, lastVisited: null, deepestPoint: 0 },
    };
  }, [state]);

  const wlGetHarmonyRegen = useMemo(() => {
    const structureLevels: Record<string, number> = {};
    for (const [id, owned] of Object.entries(state.structures)) {
      structureLevels[id] = owned.level;
    }
    const rate = wlHarmonyRegenRate(state.laneLevel, structureLevels);
    return {
      base: 1,
      structureBonus: rate - 1 - Math.floor(state.laneLevel / 5) * 0.2,
      levelBonus: Math.floor(state.laneLevel / 5) * 0.2,
      total: rate,
      max: WL_MAX_HARMONY,
      current: state.harmony,
    };
  }, [state]);

  const wlGetCurrentTitle = useMemo(() => {
    return WL_TITLES.find(t => t.id === state.currentTitle) ?? WL_TITLES[0];
  }, [state]);

  const wlGetTitleProgress = useMemo(() => {
    return WL_TITLES.map(title => ({
      ...title,
      unlocked: state.laneLevel >= title.requiredLevel,
      active: state.currentTitle === title.id,
    }));
  }, [state]);

  const wlGetUnlockedAchievements = useMemo(() => {
    const unlocked: Array<{ def: WlAchievementDef; state: WlAchievementState }> = [];
    for (const achDef of WL_ACHIEVEMENTS) {
      const achState = state.achievements[achDef.id];
      if (achState && achState.unlocked) {
        unlocked.push({ def: achDef, state: achState });
      }
    }
    return unlocked;
  }, [state]);

  // Equipped artifact (React Compiler auto-memoizes)
  let wlGetEquippedArtifact: { def: typeof WL_ARTIFACTS[number]; state: { equipped: boolean } } | null = null;
  for (const [artId, artState] of Object.entries(state.artifacts)) {
    if (artState.equipped) {
      const artDef = WL_ARTIFACTS.find(a => a.id === artId);
      if (artDef) { wlGetEquippedArtifact = { def: artDef, state: artState }; break; }
    }
  }

  const wlGetActiveEvents = useMemo(() => {
    const active: Array<{ def: WlEventDef; startedAt: number; endsAt: number }> = [];
    for (const [evtId, evtState] of Object.entries(state.events)) {
      if (evtState.active && evtState.startedAt && evtState.endsAt) {
        const evtDef = WL_EVENTS.find(e => e.id === evtId);
        if (evtDef) {
          active.push({ def: evtDef, startedAt: evtState.startedAt, endsAt: evtState.endsAt });
        }
      }
    }
    return active;
  }, [state]);

  const wlGetSpeciesSummary = useMemo(() => {
    const speciesMap: Record<WlSpecies, { total: number; befriended: number; names: string[] }> = {
      spirit_fox: { total: 0, befriended: 0, names: [] },
      willow_dryad: { total: 0, befriended: 0, names: [] },
      pond_spirit: { total: 0, befriended: 0, names: [] },
      moon_hare: { total: 0, befriended: 0, names: [] },
      bamboo_nymph: { total: 0, befriended: 0, names: [] },
      cloud_heron: { total: 0, befriended: 0, names: [] },
      moss_turtle: { total: 0, befriended: 0, names: [] },
    };
    for (const creature of WL_CREATURES) {
      speciesMap[creature.species].total += 1;
      speciesMap[creature.species].names.push(creature.name);
      if (state.creatures[creature.id]) {
        speciesMap[creature.species].befriended += 1;
      }
    }
    return speciesMap;
  }, [state]);

  const wlGetRaritySummary = useMemo(() => {
    const byRarity: Record<WlRarity, { total: number; befriended: number }> = {
      common: { total: 0, befriended: 0 },
      uncommon: { total: 0, befriended: 0 },
      rare: { total: 0, befriended: 0 },
      epic: { total: 0, befriended: 0 },
      legendary: { total: 0, befriended: 0 },
    };
    for (const creature of WL_CREATURES) {
      byRarity[creature.rarity].total += 1;
      if (state.creatures[creature.id]) {
        byRarity[creature.rarity].befriended += 1;
      }
    }
    return byRarity;
  }, [state]);

  // Next title (React Compiler auto-memoizes)
  let wlGetNextTitle: { title: typeof WL_TITLES[number]; currentLevel: number; neededLevel: number; levelsAway: number };
  { let found = false;
    for (let i = 0; i < WL_TITLES.length; i++) {
      if (state.laneLevel < WL_TITLES[i].requiredLevel) {
        wlGetNextTitle = {
          title: WL_TITLES[i],
          currentLevel: state.laneLevel,
          neededLevel: WL_TITLES[i].requiredLevel,
          levelsAway: WL_TITLES[i].requiredLevel - state.laneLevel,
        };
        found = true;
        break;
      }
    }
    if (!found) {
      wlGetNextTitle = {
        title: WL_TITLES[WL_TITLES.length - 1],
        currentLevel: state.laneLevel,
        neededLevel: WL_TITLES[WL_TITLES.length - 1].requiredLevel,
        levelsAway: 0,
      };
    }
  }

  const wlGetCompletionStats = useMemo(() => {
    const totalCreatures = WL_CREATURES.length;
    const befriendedCreatures = Object.keys(state.creatures).length;
    const totalStructures = WL_STRUCTURES.length;
    const builtStructures = Object.keys(state.structures).length;
    const maxedStructures = Object.values(state.structures).filter(
      s => {
        const def = WL_STRUCTURES.find(d => d.id === s.structureId);
        return def && s.level >= def.maxLevel;
      },
    ).length;
    const totalArtifacts = WL_ARTIFACTS.length;
    const acquiredArtifacts = Object.values(state.artifacts).filter(a => a.acquired).length;
    const totalAbilities = WL_ABILITIES.length;
    const unlockedAbilities = Object.values(state.abilities).filter(a => a.unlocked).length;
    const totalChambers = WL_CHAMBERS.length;
    const visitedChambers = Object.values(state.chambers).filter(c => c.visits > 0).length;
    const totalAchievements = WL_ACHIEVEMENTS.length;
    const unlockedAchievements = Object.values(state.achievements).filter(a => a.unlocked).length;

    return {
      creatures: { total: totalCreatures, completed: befriendedCreatures, percentage: Math.floor((befriendedCreatures / totalCreatures) * 100) },
      structures: { total: totalStructures, completed: builtStructures, percentage: Math.floor((builtStructures / totalStructures) * 100) },
      maxedStructures,
      artifacts: { total: totalArtifacts, completed: acquiredArtifacts, percentage: Math.floor((acquiredArtifacts / totalArtifacts) * 100) },
      abilities: { total: totalAbilities, completed: unlockedAbilities, percentage: Math.floor((unlockedAbilities / totalAbilities) * 100) },
      chambers: { total: totalChambers, completed: visitedChambers, percentage: Math.floor((visitedChambers / totalChambers) * 100) },
      achievements: { total: totalAchievements, completed: unlockedAchievements, percentage: Math.floor((unlockedAchievements / totalAchievements) * 100) },
      overall: {
        total: totalCreatures + totalStructures + totalArtifacts + totalAbilities + totalChambers + totalAchievements,
        completed: befriendedCreatures + builtStructures + acquiredArtifacts + unlockedAbilities + visitedChambers + unlockedAchievements,
      },
    };
  }, [state]);

  const wlGetTopCreatures = useMemo(() => {
    const entries = Object.entries(state.creatures).map(([id, bonded]) => {
      const def = WL_CREATURES.find(c => c.id === id);
      if (!def) return null;
      return { def, bonded, totalPower: def.power + def.defense + bonded.bondStrength };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    entries.sort((a, b) => b.totalPower - a.totalPower);
    return entries.slice(0, 5);
  }, [state]);

  const wlGetWealthSummary = useMemo(() => {
    const materialValue = Object.entries(state.materials).reduce((sum, [matId, inv]) => {
      const def = WL_MATERIALS.find(m => m.id === matId);
      if (!def) return sum;
      return sum + inv.quantity * wlRarityMultiplier(def.rarity) * 8;
    }, 0);
    const structureValue = Object.entries(state.structures).reduce((sum, [structId, owned]) => {
      const def = WL_STRUCTURES.find(s => s.id === structId);
      if (!def) return sum;
      return sum + def.baseCost * owned.level;
    }, 0);
    const artifactValue = Object.entries(state.artifacts).filter(([, a]) => a.acquired).reduce((sum, [artId]) => {
      const def = WL_ARTIFACTS.find(a => a.id === artId);
      if (!def) return sum;
      return sum + def.cost;
    }, 0);
    return {
      spiritCoins: state.spiritCoins,
      materialValue,
      structureValue,
      artifactValue,
      estimatedNetWorth: state.spiritCoins + materialValue + structureValue + artifactValue,
    };
  }, [state]);

  const wlGetSummary = useMemo(() => {
    const uniqueCreatures = Object.keys(state.creatures).length;
    const uniqueStructures = Object.keys(state.structures).length;
    const chambersUnlocked = Object.values(state.chambers).filter(c => c.unlocked).length;
    const artifactsOwned = Object.values(state.artifacts).filter(a => a.acquired).length;
    const abilitiesUnlocked = Object.values(state.abilities).filter(a => a.unlocked).length;
    const foxCount = Object.values(state.creatures).filter(id => {
      const def = WL_CREATURES.find(c => c.id === id.creatureId);
      return def?.species === 'spirit_fox';
    }).length;
    const maxedStructures = Object.values(state.structures).filter(s => {
      const def = WL_STRUCTURES.find(d => d.id === s.structureId);
      return def && s.level >= def.maxLevel;
    }).length;
    const totalMaterials = Object.values(state.materials).reduce((sum, m) => sum + m.quantity, 0);

    return {
      laneLevel: state.laneLevel,
      currentTitle: wlGetCurrentTitle,
      spiritCoins: state.spiritCoins,
      harmony: state.harmony,
      willowEssence: state.willowEssence,
      totalPower: wlGetTotalPower,
      uniqueCreatures,
      uniqueStructures,
      chambersUnlocked,
      artifactsOwned,
      abilitiesUnlocked,
      foxCount,
      maxedStructures,
      totalVisits: state.totalVisits,
      totalBefriended: state.totalBefriended,
      totalHarvested: state.totalHarvested,
      totalPlanted: state.totalPlanted,
      totalMaterials,
      selectedAction: state.selectedAction,
      levelProgress: wlGetLevelProgress,
      harmonyProgress: wlGetHarmonyProgress,
      willowEssenceProgress: wlGetWillowEssenceProgress,
      harmonyRegen: wlGetHarmonyRegen,
      activeChamber: wlGetActiveChamber,
      activeEvents: wlGetActiveEvents,
      equippedArtifact: wlGetEquippedArtifact,
      completionStats: wlGetCompletionStats,
    };
  }, [
    state, wlGetCurrentTitle, wlGetTotalPower, wlGetLevelProgress,
    wlGetHarmonyProgress, wlGetWillowEssenceProgress, wlGetHarmonyRegen,
    wlGetActiveChamber, wlGetActiveEvents, wlGetEquippedArtifact, wlGetCompletionStats,
  ]);

  // ── Accessors (useCallback) ────────────────────────────────────────────────

  const wlGetState = useCallback((): Readonly<WlWillowLaneState> => stateRef.current, []);
  const wlGetLevel = useCallback((): number => stateRef.current.laneLevel, []);
  const wlGetXp = useCallback((): number => stateRef.current.laneXp, []);
  const wlGetCoins = useCallback((): number => stateRef.current.spiritCoins, []);
  const wlGetHarmony = useCallback((): number => stateRef.current.harmony, []);
  const wlGetWillowEssence = useCallback((): number => stateRef.current.willowEssence, []);
  const wlGetTotalVisits = useCallback((): number => stateRef.current.totalVisits, []);
  const wlGetTotalBefriended = useCallback((): number => stateRef.current.totalBefriended, []);
  const wlGetTotalHarvested = useCallback((): number => stateRef.current.totalHarvested, []);
  const wlGetTotalPlanted = useCallback((): number => stateRef.current.totalPlanted, []);

  // ── Raw Data Accessors ─────────────────────────────────────────────────────

  const wlGetAllSpecies = useCallback((): WlSpeciesDef[] => [...WL_SPECIES], []);
  const wlGetAllCreatures = useCallback((): WlCreatureDef[] => [...WL_CREATURES], []);
  const wlGetAllChambers = useCallback((): WlChamberDef[] => [...WL_CHAMBERS], []);
  const wlGetAllMaterials = useCallback((): WlMaterialDef[] => [...WL_MATERIALS], []);
  const wlGetAllStructures = useCallback((): WlStructureDef[] => [...WL_STRUCTURES], []);
  const wlGetAllAbilities = useCallback((): WlAbilityDef[] => [...WL_ABILITIES], []);
  const wlGetAllAchievements = useCallback((): WlAchievementDef[] => [...WL_ACHIEVEMENTS], []);
  const wlGetAllTitles = useCallback((): WlTitleDef[] => [...WL_TITLES], []);
  const wlGetAllArtifacts = useCallback((): WlArtifactDef[] => [...WL_ARTIFACTS], []);
  const wlGetAllEvents = useCallback((): WlEventDef[] => [...WL_EVENTS], []);

  // ── Lookup Accessors ──────────────────────────────────────────────────────

  const wlGetSpeciesById = useCallback((id: WlSpecies): WlSpeciesDef | undefined => WL_SPECIES.find(s => s.id === id), []);
  const wlGetCreatureById = useCallback((id: string): WlCreatureDef | undefined => WL_CREATURES.find(c => c.id === id), []);
  const wlGetChamberById = useCallback((id: string): WlChamberDef | undefined => WL_CHAMBERS.find(c => c.id === id), []);
  const wlGetMaterialById = useCallback((id: string): WlMaterialDef | undefined => WL_MATERIALS.find(m => m.id === id), []);
  const wlGetStructureById = useCallback((id: string): WlStructureDef | undefined => WL_STRUCTURES.find(s => s.id === id), []);
  const wlGetAbilityById = useCallback((id: string): WlAbilityDef | undefined => WL_ABILITIES.find(a => a.id === id), []);
  const wlGetAchievementById = useCallback((id: string): WlAchievementDef | undefined => WL_ACHIEVEMENTS.find(a => a.id === id), []);
  const wlGetArtifactById = useCallback((id: string): WlArtifactDef | undefined => WL_ARTIFACTS.find(a => a.id === id), []);
  const wlGetEventById = useCallback((id: string): WlEventDef | undefined => WL_EVENTS.find(e => e.id === id), []);

  // ── Filtered Accessors ────────────────────────────────────────────────────

  const wlGetCreaturesBySpecies = useCallback((species: WlSpecies): WlCreatureDef[] => WL_CREATURES.filter(c => c.species === species), []);
  const wlGetCreaturesByRarity = useCallback((rarity: WlRarity): WlCreatureDef[] => WL_CREATURES.filter(c => c.rarity === rarity), []);
  const wlGetMaterialsByRarity = useCallback((rarity: WlRarity): WlMaterialDef[] => WL_MATERIALS.filter(m => m.rarity === rarity), []);
  const wlGetMaterialsBySource = useCallback((source: WlMaterialSource): WlMaterialDef[] => WL_MATERIALS.filter(m => m.source === source), []);
  const wlGetAbilitiesByCategory = useCallback((category: WlAbilityCategory): WlAbilityDef[] => WL_ABILITIES.filter(a => a.category === category), []);
  const wlGetArtifactsByRarity = useCallback((rarity: WlRarity): WlArtifactDef[] => WL_ARTIFACTS.filter(a => a.rarity === rarity), []);
  const wlGetEventsByFrequency = useCallback((frequency: WlEventFrequency): WlEventDef[] => WL_EVENTS.filter(e => e.frequency === frequency), []);
  const wlGetStructuresByCategory = useCallback((category: string): WlStructureDef[] => WL_STRUCTURES.filter(s => s.category === category), []);
  const wlGetUnlockedChambers = useCallback((): WlChamberDef[] => {
    const s = stateRef.current;
    return WL_CHAMBERS.filter(c => s.chambers[c.id]?.unlocked ?? false);
  }, []);
  const wlGetLockedChambers = useCallback((): WlChamberDef[] => {
    const s = stateRef.current;
    return WL_CHAMBERS.filter(c => !(s.chambers[c.id]?.unlocked ?? false));
  }, []);

  // ── Boolean Checks ────────────────────────────────────────────────────────

  const wlIsChamberUnlocked = useCallback((chamberId: string): boolean => stateRef.current.chambers[chamberId]?.unlocked ?? false, []);
  const wlIsCreatureBefriended = useCallback((creatureId: string): boolean => !!stateRef.current.creatures[creatureId], []);
  const wlIsStructureBuilt = useCallback((structureId: string): boolean => !!stateRef.current.structures[structureId], []);
  const wlIsAbilityUnlocked = useCallback((abilityId: string): boolean => stateRef.current.abilities[abilityId]?.unlocked ?? false, []);
  const wlIsArtifactAcquired = useCallback((artifactId: string): boolean => stateRef.current.artifacts[artifactId]?.acquired ?? false, []);
  const wlIsArtifactEquipped = useCallback((artifactId: string): boolean => stateRef.current.artifacts[artifactId]?.equipped ?? false, []);
  const wlIsEventActive = useCallback((eventId: string): boolean => stateRef.current.events[eventId]?.active ?? false, []);
  const wlIsAchievementUnlocked = useCallback((achievementId: string): boolean => stateRef.current.achievements[achievementId]?.unlocked ?? false, []);
  const wlCanAfford = useCallback((cost: number): boolean => stateRef.current.spiritCoins >= cost, []);
  const wlCanVisitChamber = useCallback((chamberId: string): boolean => {
    const s = stateRef.current;
    return (s.chambers[chamberId]?.unlocked ?? false) && s.harmony >= 5;
  }, []);

  // ── Quantity Accessors ────────────────────────────────────────────────────

  const wlGetMaterialCount = useCallback((materialId: string): number => stateRef.current.materials[materialId]?.quantity ?? 0, []);
  const wlGetStructureLevel = useCallback((structureId: string): number => stateRef.current.structures[structureId]?.level ?? 0, []);
  const wlGetBondStrength = useCallback((creatureId: string): number => stateRef.current.creatures[creatureId]?.bondStrength ?? 0, []);
  const wlGetEventCompletions = useCallback((eventId: string): number => stateRef.current.events[eventId]?.completions ?? 0, []);

  // ── Creature Helpers ──────────────────────────────────────────────────────

  const wlGetCreaturePower = useCallback((creatureId: string): number => {
    const def = WL_CREATURES.find(c => c.id === creatureId);
    if (!def) return 0;
    return def.power + def.defense;
  }, []);

  const wlGetCreatureTotalPower = useCallback((creatureId: string): number => {
    const def = WL_CREATURES.find(c => c.id === creatureId);
    const bonded = stateRef.current.creatures[creatureId];
    if (!def) return 0;
    return def.power + def.defense + (bonded?.bondStrength ?? 0);
  }, []);

  const wlGetTopCreatureByPower = useCallback((): WlCreatureDef | undefined => {
    const entries = Object.keys(stateRef.current.creatures);
    if (entries.length === 0) return undefined;
    let bestId = entries[0];
    let bestPower = 0;
    for (const id of entries) {
      const power = wlGetCreatureTotalPower(id);
      if (power > bestPower) {
        bestPower = power;
        bestId = id;
      }
    }
    return WL_CREATURES.find(c => c.id === bestId);
  }, [wlGetCreatureTotalPower]);

  const wlGetSpeciesColor = useCallback((species: WlSpecies): string => WL_COLOR_MAP[species] ?? WL_COLOR_WILLOW_GREEN, []);

  // ── Extended Filters ──────────────────────────────────────────────────────

  const wlGetOffensiveCreatures = useCallback((): WlCreatureDef[] => WL_CREATURES.filter(c => c.power > c.defense), []);
  const wlGetDefensiveCreatures = useCallback((): WlCreatureDef[] => WL_CREATURES.filter(c => c.defense > c.power), []);
  const wlGetLegendaryCreatures = useCallback((): WlCreatureDef[] => WL_CREATURES.filter(c => c.rarity === 'legendary'), []);
  const wlGetForageableMaterials = useCallback((): WlMaterialDef[] => WL_MATERIALS.filter(m => m.source === 'forage'), []);
  const wlGetCreatureDropMaterials = useCallback((): WlMaterialDef[] => WL_MATERIALS.filter(m => m.source === 'creature_drop'), []);

  // ── Reset ──────────────────────────────────────────────────────────────────

  const wlReset = useCallback((): void => {
    setState(wlCreateDefaultState());
  }, []);

  // ── Return API ─────────────────────────────────────────────────────────────

  const wlAPI = {
    // Constants
    WL_SAVE_KEY,
    WL_MAX_LEVEL,
    WL_STARTING_COINS,
    WL_COLOR_WILLOW_GREEN,
    WL_COLOR_POND_BLUE,
    WL_COLOR_MOON_SILVER,
    WL_COLOR_SPIRIT_WHITE,
    WL_COLOR_BAMBOO_YELLOW,
    WL_COLOR_MOSS_GREEN,
    WL_COLOR_DUSK_PURPLE,
    WL_RARITY_COLORS,

    // State accessors
    wlGetState,
    wlGetLevel,
    wlGetXp,
    wlGetCoins,
    wlGetHarmony,
    wlGetWillowEssence,
    wlGetTotalVisits,
    wlGetTotalBefriended,
    wlGetTotalHarvested,
    wlGetTotalPlanted,

    // Actions
    wlAddXp,
    wlVisitChamber,
    wlBefriendCreature,
    wlStrengthenBond,
    wlReleaseCreature,
    wlHarvestMaterial,
    wlPlantAction,
    wlBuildStructure,
    wlUpgradeStructure,
    wlUnlockAbility,
    wlUseAbility,
    wlAcquireArtifact,
    wlEquipArtifact,
    wlStartEvent,
    wlCompleteEvent,
    wlSelectAction,
    wlClaimAchievement,
    wlUnlockTitle,
    wlRestoreHarmony,
    wlSpendCoins,
    wlSetActiveChamber,
    wlTradeMaterial,
    wlReset,

    // Getters (useMemo)
    wlGetChamberDetails,
    wlGetCreatureList,
    wlGetMaterialInventory,
    wlGetStructureList,
    wlGetAbilityList,
    wlGetArtifactList,
    wlGetEventList,
    wlGetTotalPower,
    wlGetLevelProgress,
    wlGetHarmonyProgress,
    wlGetWillowEssenceProgress,
    wlGetActiveChamber,
    wlGetHarmonyRegen,
    wlGetCurrentTitle,
    wlGetTitleProgress,
    wlGetUnlockedAchievements,
    wlGetEquippedArtifact,
    wlGetActiveEvents,
    wlGetSpeciesSummary,
    wlGetRaritySummary,
    wlGetNextTitle,
    wlGetCompletionStats,
    wlGetTopCreatures,
    wlGetWealthSummary,
    wlGetSummary,

    // Raw data accessors
    wlGetAllSpecies,
    wlGetAllCreatures,
    wlGetAllChambers,
    wlGetAllMaterials,
    wlGetAllStructures,
    wlGetAllAbilities,
    wlGetAllAchievements,
    wlGetAllTitles,
    wlGetAllArtifacts,
    wlGetAllEvents,

    // Lookup accessors
    wlGetSpeciesById,
    wlGetCreatureById,
    wlGetChamberById,
    wlGetMaterialById,
    wlGetStructureById,
    wlGetAbilityById,
    wlGetAchievementById,
    wlGetArtifactById,
    wlGetEventById,

    // Filtered accessors
    wlGetCreaturesBySpecies,
    wlGetCreaturesByRarity,
    wlGetMaterialsByRarity,
    wlGetMaterialsBySource,
    wlGetAbilitiesByCategory,
    wlGetArtifactsByRarity,
    wlGetEventsByFrequency,
    wlGetStructuresByCategory,
    wlGetUnlockedChambers,
    wlGetLockedChambers,

    // Boolean checks
    wlIsChamberUnlocked,
    wlIsCreatureBefriended,
    wlIsStructureBuilt,
    wlIsAbilityUnlocked,
    wlIsArtifactAcquired,
    wlIsArtifactEquipped,
    wlIsEventActive,
    wlIsAchievementUnlocked,
    wlCanAfford,
    wlCanVisitChamber,

    // Quantity accessors
    wlGetMaterialCount,
    wlGetStructureLevel,
    wlGetBondStrength,
    wlGetEventCompletions,

    // Creature helpers
    wlGetCreaturePower,
    wlGetCreatureTotalPower,
    wlGetTopCreatureByPower,
    wlGetSpeciesColor,

    // Extended filters
    wlGetOffensiveCreatures,
    wlGetDefensiveCreatures,
    wlGetLegendaryCreatures,
    wlGetForageableMaterials,
    wlGetCreatureDropMaterials,
  };

  return wlAPI;
}
