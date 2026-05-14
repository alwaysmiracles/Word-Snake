import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Tomb Blade (墓刃) — Wire Module
//
// An ancient underground necropolis where tomb guardians wield
// cursed blades forged from the bones of fallen pharaohs. Players
// awaken tomb creatures, enchant weapons, seal dark chambers,
// raid forgotten tombs, cast curses, forge legendary blades, and
// resurrect ancient guardians across 7 species and 8 tomb chambers.
//
// Storage key: tomb-blade-save
// Prefix: tb / TB_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type TbRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type TbSpecies =
  | 'bone_knight'
  | 'mummy_sage'
  | 'specter_assassin'
  | 'wraith_lord'
  | 'golem_guard'
  | 'scarab_swarm'
  | 'lich_queen';

type TbAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type TbStructureBonusType =
  | 'craftDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus'
  | 'craftQuality'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus'
  | 'soulYield';

type TbMaterialCategory = 'bone' | 'cloth' | 'soul' | 'organic' | 'metal' | 'shadow' | 'cursed';

// ---- Creature Definitions ----

interface TbCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: TbSpecies;
  readonly rarity: TbRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber Definitions ----

interface TbChamberDef {
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

interface TbMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: TbRarity;
  readonly value: number;
  readonly category: TbMaterialCategory;
  readonly craftBonus: number;
}

// ---- Structure Definitions ----

interface TbStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: TbStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface TbAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: TbAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: TbRarity;
}

// ---- Achievement Definitions ----

interface TbAchievementDef {
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

interface TbTitleDef {
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

interface TbArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: TbRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface TbEventDef {
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

interface TbOwnedCreature {
  creatureId: string;
  instanceId: string;
  raisedAt: number;
  timesUsed: number;
  nickname: string;
}

interface TbChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface TbStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface TbArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface TbAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface TbAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface TbInventoryItem {
  materialId: string;
  count: number;
}

interface TbEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface TbStats {
  totalAwakened: number;
  totalChambersCleared: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface TbTitleProgress {
  current: TbTitleDef;
  next: TbTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: TB_ CONSTANTS
// ============================================================

const TB_SAVE_KEY = 'tomb-blade-save';
const TB_MAX_LEVEL = 50;
const TB_STARTING_COINS = 300;
const TB_STARTING_XP = 0;
const TB_XP_BASE = 100;
const TB_XP_SCALE = 1.5;
const TB_AUTO_SAVE_MS = 15000;
const TB_EVENT_DURATION_MS = 60000;
const TB_MAX_INVENTORY_ITEM = 999;
const TB_MAX_RAISED_CREATURES = 100;
const TB_COOLDOWN_TICK_MS = 1000;
const TB_SPECIES_COUNT = 7;
const TB_CREATURE_COUNT = 35;
const TB_CHAMBER_COUNT = 8;
const TB_MATERIAL_COUNT = 12;
const TB_STRUCTURE_COUNT = 8;
const TB_ABILITY_COUNT = 8;
const TB_ACHIEVEMENT_COUNT = 10;
const TB_TITLE_COUNT = 8;
const TB_ARTIFACT_COUNT = 6;
const TB_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const TB_BONE_WHITE = '#F5F5DC';
const TB_TOMB_GRAY = '#696969';
const TB_BLOOD_RED = '#8B0000';
const TB_GOLD = '#DAA520';
const TB_SHADOW_PURPLE = '#4B0082';
const TB_RUST_BROWN = '#8B4513';
const TB_CURSE_GREEN = '#006400';

const TB_RARITY_COLORS: Record<TbRarity, string> = {
  common: TB_TOMB_GRAY,
  uncommon: TB_CURSE_GREEN,
  rare: TB_SHADOW_PURPLE,
  epic: TB_BLOOD_RED,
  legendary: TB_GOLD,
};

const TB_SPECIES_COLORS: Record<TbSpecies, string> = {
  bone_knight: TB_BONE_WHITE,
  mummy_sage: TB_RUST_BROWN,
  specter_assassin: TB_SHADOW_PURPLE,
  wraith_lord: TB_TOMB_GRAY,
  golem_guard: TB_BLOOD_RED,
  scarab_swarm: TB_CURSE_GREEN,
  lich_queen: TB_GOLD,
};

const TB_ALL_COLORS = [
  TB_BONE_WHITE,
  TB_TOMB_GRAY,
  TB_BLOOD_RED,
  TB_GOLD,
  TB_SHADOW_PURPLE,
  TB_RUST_BROWN,
  TB_CURSE_GREEN,
];

// ============================================================
// SECTION 4: TB_SPECIES — 7 Species Types
// ============================================================

const TB_SPECIES: { id: TbSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'bone_knight',
    name: 'Bone Knight',
    description: 'Undead warriors encased in bone armor, wielding cursed blades forged from fallen comrades.',
    lore: 'Bone Knights are the eternal sentinels of the necropolis, each one bound to guard a specific tomb passage until the end of time.',
    emoji: '🗡️',
    color: TB_BONE_WHITE,
  },
  {
    id: 'mummy_sage',
    name: 'Mummy Sage',
    description: 'Ancient scholars preserved in linen wrappings, their minds sharpened by centuries of undeath.',
    lore: 'Mummy Sages were once advisors to pharaohs, their wisdom so valuable that death itself could not claim it.',
    emoji: '🧟',
    color: TB_RUST_BROWN,
  },
  {
    id: 'specter_assassin',
    name: 'Specter Assassin',
    description: 'Ghostly killers that phase through walls, striking with spectral blades of pure malice.',
    lore: 'Specter Assassins were the secret police of the ancient underworld, executing those who disturbed the tombs.',
    emoji: '👻',
    color: TB_SHADOW_PURPLE,
  },
  {
    id: 'wraith_lord',
    name: 'Wraith Lord',
    description: 'Powerful spectral overlords commanding legions of lesser spirits with iron will.',
    lore: 'Wraith Lords were warlords in life who refused to yield even to death, their rage sustaining them across millennia.',
    emoji: '💀',
    color: TB_TOMB_GRAY,
  },
  {
    id: 'golem_guard',
    name: 'Golem Guard',
    description: 'Hulking constructs of enchanted stone and bone, immune to pain and tireless in duty.',
    lore: 'Golem Guards were built by the first tomb architects, each one carved with protective runes that renew their power daily.',
    emoji: '🗿',
    color: TB_BLOOD_RED,
  },
  {
    id: 'scarab_swarm',
    name: 'Scarab Swarm',
    description: 'Thousands of enchanted beetles that act as a single hive mind, consuming all in their path.',
    lore: 'Scarab Swarms are considered the tomb\'s immune system, consuming intruders and converting their remains into tomb dust.',
    emoji: '🪲',
    color: TB_CURSE_GREEN,
  },
  {
    id: 'lich_queen',
    name: 'Lich Queen',
    description: 'Undead sorceresses of terrifying power whose magic has only grown stronger with death.',
    lore: 'Lich Queens rule over entire tomb complexes, their phylacteries hidden in chambers that no living soul has ever found.',
    emoji: '👑',
    color: TB_GOLD,
  },
];

// ============================================================
// SECTION 5: TB_CREATURES — 35 Creatures (5 tiers × 7 species)
// ============================================================

const TB_CREATURES: TbCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'bone_knight_common', name: 'Bone Recruit', species: 'bone_knight', rarity: 'common',
    description: 'A newly risen skeleton warrior clutching a chipped bone blade.',
    lore: 'Bone Recruits are the first to answer the tomb\'s call, stumbling from their graves with basic bone swords in hand.',
    emoji: '🗡️', power: 10, defense: 12, cost: 20, xpReward: 8,
  },
  {
    id: 'mummy_sage_common', name: 'Linen Scribe', species: 'mummy_sage', rarity: 'common',
    description: 'A humble mummified scribe carrying scrolls of ancient tomb knowledge.',
    lore: 'Linen Scribes recorded the names of every soul buried in the necropolis, a duty they continue in death.',
    emoji: '🧟', power: 7, defense: 9, cost: 18, xpReward: 7,
  },
  {
    id: 'specter_assassin_common', name: 'Faint Shade', species: 'specter_assassin', rarity: 'common',
    description: 'A barely visible wisp of a shadow that can barely hold a spectral dagger.',
    lore: 'Faint Shades are the remnants of executed tomb robbers, their desire for revenge giving them just enough form to exist.',
    emoji: '👻', power: 8, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'wraith_lord_common', name: 'Wisp Commander', species: 'wraith_lord', rarity: 'common',
    description: 'A minor wraith that commands a handful of confused spirit fragments.',
    lore: 'Wisp Commanders were sergeants in ancient armies, still barking orders at spectral soldiers only they can see.',
    emoji: '💀', power: 9, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'golem_guard_common', name: 'Rubble Sentinel', species: 'golem_guard', rarity: 'common',
    description: 'A crude golem assembled from loose tomb stones and held together by basic enchantments.',
    lore: 'Rubble Sentinels are the cheapest guardians to create — just pile stones high enough and speak the awakening word.',
    emoji: '🗿', power: 12, defense: 14, cost: 25, xpReward: 10,
  },
  {
    id: 'scarab_swarm_common', name: 'Dust Scarabs', species: 'scarab_swarm', rarity: 'common',
    description: 'A small cluster of enchanted scarabs that gnaw through anything organic.',
    lore: 'Dust Scarabs are used to clean bone surfaces before enchanting, their mandibles polished by centuries of use.',
    emoji: '🪲', power: 6, defense: 7, cost: 16, xpReward: 6,
  },
  {
    id: 'lich_queen_common', name: 'Spellbone Acolyte', species: 'lich_queen', rarity: 'common',
    description: 'An apprentice necromancer whose incomplete transformation left them half-lich.',
    lore: 'Spellbone Acolytes failed the final ritual of lichdom but gained enough power to be useful servants.',
    emoji: '👑', power: 8, defense: 6, cost: 24, xpReward: 10,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'bone_knight_uncommon', name: 'Cursed Cavalier', species: 'bone_knight', rarity: 'uncommon',
    description: 'A skeleton knight in rusted plate armor, its blade pulsing with dark enchantments.',
    lore: 'Cursed Cavaliers were nobles in life who pledged their eternal service to the tomb in exchange for power beyond death.',
    emoji: '🗡️', power: 22, defense: 24, cost: 60, xpReward: 20,
  },
  {
    id: 'mummy_sage_uncommon', name: 'Canopic Priest', species: 'mummy_sage', rarity: 'uncommon',
    description: 'A mummified priest who channels the spirits trapped within canopic jars.',
    lore: 'Canopic Priests guard the preserved organs of ancient rulers, using the souls within as a source of arcane power.',
    emoji: '🧟', power: 18, defense: 20, cost: 55, xpReward: 18,
  },
  {
    id: 'specter_assassin_uncommon', name: 'Phantom Cutpurse', species: 'specter_assassin', rarity: 'uncommon',
    description: 'A spectral thief whose dagger steals not gold, but years of life from its victims.',
    lore: 'Phantom Cutpurses perfected their craft over lifetimes of grave robbery, eventually becoming the very guardians they once evaded.',
    emoji: '👻', power: 24, defense: 14, cost: 65, xpReward: 22,
  },
  {
    id: 'wraith_lord_uncommon', name: 'Gloom Captain', species: 'wraith_lord', rarity: 'uncommon',
    description: 'A spectral officer whose booming voice can shatter stone and rout the living.',
    lore: 'Gloom Captains still lead formations of spectral soldiers through the tomb corridors at dawn, their war cries echoing forever.',
    emoji: '💀', power: 20, defense: 18, cost: 58, xpReward: 19,
  },
  {
    id: 'golem_guard_uncommon', name: 'Boneclad Titan', species: 'golem_guard', rarity: 'uncommon',
    description: 'A large golem reinforced with bone plating and inscribed with protective hieroglyphs.',
    lore: 'Boneclad Titans require a full skeleton woven into their stone frame, giving them a unsettling organic quality.',
    emoji: '🗿', power: 26, defense: 30, cost: 70, xpReward: 24,
  },
  {
    id: 'scarab_swarm_uncommon', name: 'Jade Beetle Hive', species: 'scarab_swarm', rarity: 'uncommon',
    description: 'A dense swarm of jade-colored scarabs that can dissolve metal with acidic secretions.',
    lore: 'Jade Beetle Hives were bred by tomb architects to consume the weapons of intruders, leaving them defenseless.',
    emoji: '🪲', power: 19, defense: 16, cost: 50, xpReward: 17,
  },
  {
    id: 'lich_queen_uncommon', name: 'Wrathweave Witch', species: 'lich_queen', rarity: 'uncommon',
    description: 'A sorceress whose mummified hands weave spells of corruption and decay.',
    lore: 'Wrathweave Witches were healers in life who discovered that the same knowledge could unmake flesh just as easily.',
    emoji: '👑', power: 23, defense: 15, cost: 62, xpReward: 21,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'bone_knight_rare', name: 'Blade of the Crypt', species: 'bone_knight', rarity: 'rare',
    description: 'An elite bone knight wielding a sword carved from a dragon\'s femur.',
    lore: 'Blades of the Crypt are chosen through a ritual trial — only one in a hundred bone knights survives the selection.',
    emoji: '🗡️', power: 42, defense: 45, cost: 200, xpReward: 50,
  },
  {
    id: 'mummy_sage_rare', name: 'Embalmer High Priest', species: 'mummy_sage', rarity: 'rare',
    description: 'A master embalmer whose preserved body radiates an aura of ancient authority.',
    lore: 'Embalmer High Priests know the secret of true immortality through preservation — their bodies have not decayed in three thousand years.',
    emoji: '🧟', power: 35, defense: 38, cost: 180, xpReward: 45,
  },
  {
    id: 'specter_assassin_rare', name: 'Shadow Reaper', species: 'specter_assassin', rarity: 'rare',
    description: 'A spectral executioner who appears only at the moment of death, claiming souls.',
    lore: 'Shadow Reapers are the tomb\'s ultimate punishment — they can find anyone who has ever disturbed a burial site.',
    emoji: '👻', power: 48, defense: 28, cost: 220, xpReward: 55,
  },
  {
    id: 'wraith_lord_rare', name: 'Barrow King', species: 'wraith_lord', rarity: 'rare',
    description: 'A spectral monarch whose throne room exists in a pocket dimension within the tomb.',
    lore: 'Barrow Kings carved their kingdoms from the spaces between life and death, ruling subjects who do not know they are dead.',
    emoji: '💀', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'golem_guard_rare', name: 'Pharaoh\'s Anvil', species: 'golem_guard', rarity: 'rare',
    description: 'A massive golem shaped like a sphinx, inscribed with the names of a hundred pharaohs.',
    lore: 'Pharaoh\'s Anvils are the most powerful golems in the necropolis, built from stone quarried in the afterlife itself.',
    emoji: '🗿', power: 38, defense: 48, cost: 210, xpReward: 52,
  },
  {
    id: 'scarab_swarm_rare', name: 'Obsidian Scarab Nest', species: 'scarab_swarm', rarity: 'rare',
    description: 'A writhing mass of obsidian-scaled scarabs that can eat through enchanted barriers.',
    lore: 'Obsidian Scarab Nests were created to breach the inner sanctum during tomb wars between rival necropolis cities.',
    emoji: '🪲', power: 36, defense: 32, cost: 190, xpReward: 48,
  },
  {
    id: 'lich_queen_rare', name: 'Crypt Sovereign', species: 'lich_queen', rarity: 'rare',
    description: 'A lich sorceress whose phylactery is embedded in the tomb walls, making her nearly unkillable.',
    lore: 'Crypt Sovereigns designed the tomb chambers they inhabit, embedding their souls into the very architecture.',
    emoji: '👑', power: 45, defense: 30, cost: 230, xpReward: 58,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'bone_knight_epic', name: 'Skullcleaver General', species: 'bone_knight', rarity: 'epic',
    description: 'A towering skeletal general whose bone blade has claimed ten thousand souls.',
    lore: 'The Skullcleaver General was the first creature ever awakened in the necropolis, present at its founding three thousand years ago.',
    emoji: '🗡️', power: 75, defense: 80, cost: 800, xpReward: 120,
  },
  {
    id: 'mummy_sage_epic', name: 'Oracle of the Dead', species: 'mummy_sage', rarity: 'epic',
    description: 'A mummified oracle who can see all past deaths and predict future ones.',
    lore: 'Oracles of the Dead speak only in prophecies of mortality — every prediction has come true without exception.',
    emoji: '🧟', power: 60, defense: 65, cost: 750, xpReward: 110,
  },
  {
    id: 'specter_assassin_epic', name: 'Void Stalker', species: 'specter_assassin', rarity: 'epic',
    description: 'A spectral predator from the space between dimensions, hunting souls across realities.',
    lore: 'Void Stalkers are so stealthy that their victims never know they have been killed — they simply stop existing.',
    emoji: '👻', power: 85, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'wraith_lord_epic', name: 'Spectral Emperor', species: 'wraith_lord', rarity: 'epic',
    description: 'An undead emperor whose spectral army numbers in the hundreds of thousands.',
    lore: 'The Spectral Emperor conquered the living world in three days; it took death three thousand years to conquer him.',
    emoji: '💀', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'golem_guard_epic', name: 'Ozymandias Sentinel', species: 'golem_guard', rarity: 'epic',
    description: 'A colossal golem bearing the face of a forgotten pharaoh, immune to all magic.',
    lore: 'The Ozymandias Sentinel was the last act of a dying civilization — a monument to hubris that outlasted its creators.',
    emoji: '🗿', power: 65, defense: 85, cost: 780, xpReward: 115,
  },
  {
    id: 'scarab_swarm_epic', name: 'Plague of Locusts', species: 'scarab_swarm', rarity: 'epic',
    description: 'A sky-darkening swarm of enchanted scarabs that devours entire armies in minutes.',
    lore: 'The Plague of Locusts is unleashed only as a last resort — once released, it cannot be recalled until everything organic is consumed.',
    emoji: '🪲', power: 72, defense: 55, cost: 820, xpReward: 125,
  },
  {
    id: 'lich_queen_epic', name: 'Dread Phylactery Mistress', species: 'lich_queen', rarity: 'epic',
    description: 'A lich queen who split her soul into seven phylacteries hidden across the tomb network.',
    lore: 'The Dread Phylactery Mistress cannot be permanently destroyed — each time she falls, another fragment restores her.',
    emoji: '👑', power: 80, defense: 55, cost: 900, xpReward: 140,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'bone_knight_legendary', name: 'Eternal Blade Sovereign', species: 'bone_knight', rarity: 'legendary',
    description: 'The supreme bone knight whose cursed blade contains the soul of an ancient god of war.',
    lore: 'The Eternal Blade Sovereign was the first being to forge a blade from pure death energy — the blade chose him as much as he chose it.',
    emoji: '🗡️', power: 130, defense: 140, cost: 3000, xpReward: 300,
  },
  {
    id: 'mummy_sage_legendary', name: 'Immortal Vizier', species: 'mummy_sage', rarity: 'legendary',
    description: 'A mummy who has achieved true immortality, possessing knowledge of every spell ever cast.',
    lore: 'The Immortal Vizier advised every pharaoh for three thousand years — most never realized their advisor was already dead.',
    emoji: '🧟', power: 110, defense: 120, cost: 2800, xpReward: 280,
  },
  {
    id: 'specter_assassin_legendary', name: 'Death\'s Silent Shadow', species: 'specter_assassin', rarity: 'legendary',
    description: 'A spectral entity that IS death\'s shadow, appearing whenever mortality itself is defied.',
    lore: 'Death\'s Silent Shadow has no origin and no end — it simply is, and all who see it understand that their time has come.',
    emoji: '👻', power: 150, defense: 90, cost: 3200, xpReward: 320,
  },
  {
    id: 'wraith_lord_legendary', name: 'Lord of the Abyssal Court', species: 'wraith_lord', rarity: 'legendary',
    description: 'The undisputed ruler of all spectral beings, whose word is law even in the afterlife.',
    lore: 'The Lord of the Abyssal Court negotiated a treaty with Death itself — the dead may serve, but they are never truly gone.',
    emoji: '💀', power: 140, defense: 115, cost: 3100, xpReward: 310,
  },
  {
    id: 'golem_guard_legendary', name: 'Tomb of Living Stone', species: 'golem_guard', rarity: 'legendary',
    description: 'A golem so vast it is a tomb within itself, containing entire burial chambers in its body.',
    lore: 'The Tomb of Living Stone was built by a thousand architects over a century — it is both guardian and graveyard.',
    emoji: '🗿', power: 120, defense: 160, cost: 3500, xpReward: 350,
  },
  {
    id: 'scarab_swarm_legendary', name: 'Heart of the Scarab God', species: 'scarab_swarm', rarity: 'legendary',
    description: 'The collective consciousness of every scarab ever enchanted in the necropolis, unified as one mind.',
    lore: 'The Heart of the Scarab God is the tomb\'s oldest inhabitant — older than the walls, older than the concept of burial itself.',
    emoji: '🪲', power: 125, defense: 110, cost: 2900, xpReward: 290,
  },
  {
    id: 'lich_queen_legendary', name: 'Eternal Necromatriarch', species: 'lich_queen', rarity: 'legendary',
    description: 'The original lich who discovered the secret of undeath, older than civilization itself.',
    lore: 'The Eternal Necromatriarch created death as a concept — not as punishment, but as preservation. Every lich descends from her ritual.',
    emoji: '👑', power: 145, defense: 125, cost: 3800, xpReward: 380,
  },
];

// ============================================================
// SECTION 6: TB_CHAMBERS — 8 Tomb Chambers
// ============================================================

const TB_CHAMBERS: TbChamberDef[] = [
  {
    id: 'outer_crypt', name: 'Outer Crypt', emoji: '⚰️',
    description: 'The crumbling entrance to the necropolis, where fresh graves still smell of earth and ceremony.',
    lore: 'The Outer Crypt was once a public burial ground before the necropolis expanded far below, swallowing the surface cemetery whole.',
    level: 1, resources: ['bone_fragments', 'tomb_dust', 'rusted_iron'], capacity: 10,
    unlockLevel: 1, ambientColor: TB_TOMB_GRAY, dangerLevel: 1,
  },
  {
    id: 'hall_of_blades', name: 'Hall of Blades', emoji: '⚔️',
    description: 'A vast armory where cursed weapons hang on the walls, some still dripping with spectral blood.',
    lore: 'The Hall of Blades contains every weapon ever used to defend the necropolis, each one hungering to be wielded again.',
    level: 3, resources: ['rusted_iron', 'shadow_steel', 'cursed_ink'], capacity: 15,
    unlockLevel: 3, ambientColor: TB_BLOOD_RED, dangerLevel: 2,
  },
  {
    id: 'wrapping_chamber', name: 'Wrapping Chamber', emoji: '🧵',
    description: 'The mummification workshop where ancient cloth and enchanted bandages are prepared.',
    lore: 'The Wrapping Chamber smells of natron and myrrh, its looms still weaving cloth from spectral thread.',
    level: 5, resources: ['ancient_cloth', 'mummy_wrappings', 'tomb_dust'], capacity: 20,
    unlockLevel: 5, ambientColor: TB_RUST_BROWN, dangerLevel: 3,
  },
  {
    id: 'scarab_catacombs', name: 'Scarab Catacombs', emoji: '🪲',
    description: 'Tunnels teeming with enchanted scarabs that scuttle endlessly through the dark.',
    lore: 'The Scarab Catacombs were dug by the scarabs themselves over centuries, creating a labyrinth that shifts daily.',
    level: 10, resources: ['scarab_shells', 'bone_fragments', 'tomb_dust'], capacity: 25,
    unlockLevel: 10, ambientColor: TB_CURSE_GREEN, dangerLevel: 4,
  },
  {
    id: 'soul_forge', name: 'Soul Forge', emoji: '🔨',
    description: 'A blazing forge where weapons are tempered with captured soul energy.',
    lore: 'The Soul Forge burns with the condensed agony of a thousand warriors — its flames are cold to the touch but burn the spirit.',
    level: 15, resources: ['soul_gems', 'shadow_steel', 'pharaoh_gold'], capacity: 30,
    unlockLevel: 15, ambientColor: TB_GOLD, dangerLevel: 5,
  },
  {
    id: 'phantom_vault', name: 'Phantom Vault', emoji: '👻',
    description: 'A treasury protected by spectral guardians, filled with cursed gold and stolen memories.',
    lore: 'The Phantom Vault contains the wealth of every pharaoh buried in the necropolis — and the memories they valued most.',
    level: 20, resources: ['soul_gems', 'pharaoh_gold', 'cursed_ink'], capacity: 35,
    unlockLevel: 20, ambientColor: TB_SHADOW_PURPLE, dangerLevel: 6,
  },
  {
    id: 'lich_sanctum', name: 'Lich Sanctum', emoji: '🔮',
    description: 'The private chambers of the lich queens, where reality bends to their will.',
    lore: 'The Lich Sanctum exists in multiple dimensions simultaneously — entering it requires accepting that you may not leave the same way.',
    level: 30, resources: ['lich_crystals', 'wraith_essence', 'cursed_ink'], capacity: 40,
    unlockLevel: 30, ambientColor: TB_GOLD, dangerLevel: 8,
  },
  {
    id: 'throne_of_shadows', name: 'Throne of Shadows', emoji: '🪑',
    description: 'The deepest chamber where the original tomb blade rests, pulsing with the power of death itself.',
    lore: 'The Throne of Shadows is where the first cursed blade was forged — sitting upon it grants dominion over all undead in the necropolis.',
    level: 40, resources: ['wraith_essence', 'lich_crystals', 'pharaoh_gold'], capacity: 50,
    unlockLevel: 40, ambientColor: '#1A0A2E', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: TB_MATERIALS — 12 Materials
// ============================================================

const TB_MATERIALS: TbMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'bone_fragments', name: 'Bone Fragments', emoji: '🦴', rarity: 'common', value: 5,
    category: 'bone', craftBonus: 1,
    description: 'Shards of bone scattered throughout the necropolis, still warm with residual necromantic energy.',
    lore: 'Bone Fragments are the building blocks of the tomb — every wall, every weapon, every creature started as a handful of these.',
  },
  {
    id: 'tomb_dust', name: 'Tomb Dust', emoji: '🌫️', rarity: 'common', value: 4,
    category: 'shadow', craftBonus: 1,
    description: 'Fine gray powder that accumulates in the tomb corridors, smelling of ancient preservation spices.',
    lore: 'Tomb Dust is essential for mummification rituals — it absorbs moisture and traps the soul within the body.',
  },
  {
    id: 'rusted_iron', name: 'Rusted Iron', emoji: '⛓️', rarity: 'common', value: 5,
    category: 'metal', craftBonus: 2,
    description: 'Corroded iron from ancient weapons and chains found throughout the burial chambers.',
    lore: 'Rusted Iron may look worthless, but when melted in the Soul Forge it produces weapons of surprising strength.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'ancient_cloth', name: 'Ancient Cloth', emoji: '🧵', rarity: 'uncommon', value: 12,
    category: 'cloth', craftBonus: 2,
    description: 'Linen fabric from the mummification era, still strong and faintly luminescent.',
    lore: 'Ancient Cloth is woven from flax grown on graves — each thread contains a whisper from the buried.',
  },
  {
    id: 'cursed_ink', name: 'Cursed Ink', emoji: '🖊️', rarity: 'uncommon', value: 14,
    category: 'cursed', craftBonus: 3,
    description: 'Dark ink brewed from shadow essence, used to inscribe protective hieroglyphs.',
    lore: 'Cursed Ink writes itself — give it a surface and it will trace the name of whoever last died nearby.',
  },
  {
    id: 'scarab_shells', name: 'Scarab Shells', emoji: '🪲', rarity: 'uncommon', value: 15,
    category: 'organic', craftBonus: 3,
    description: 'Discarded shells from enchanted scarabs, hard as steel and light as paper.',
    lore: 'Scarab Shells are used as natural armor plating — they absorb kinetic energy and redirect it as necromantic power.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'mummy_wrappings', name: 'Mummy Wrappings', emoji: '🪦', rarity: 'rare', value: 50,
    category: 'cloth', craftBonus: 6,
    description: 'Preserved linen bandages infused with centuries of dark preservation magic.',
    lore: 'Mummy Wrappings from a preserved pharaoh can heal any wound — but they demand a memory as payment.',
  },
  {
    id: 'soul_gems', name: 'Soul Gems', emoji: '💎', rarity: 'rare', value: 55,
    category: 'soul', craftBonus: 7,
    description: 'Crystallized soul energy that pulses with captured emotional intensity.',
    lore: 'Soul Gems are created when a soul is trapped in a moment of extreme emotion — joy, rage, terror, or love.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'wraith_essence', name: 'Wraith Essence', emoji: '🌀', rarity: 'epic', value: 150,
    category: 'shadow', craftBonus: 12,
    description: 'Concentrated spectral energy extracted from powerful wraiths, swirling with faces.',
    lore: 'Wraith Essence allows objects to exist partially in the spirit realm — weapons coated in it can harm ghosts.',
  },
  {
    id: 'lich_crystals', name: 'Lich Crystals', emoji: '💠', rarity: 'epic', value: 160,
    category: 'soul', craftBonus: 13,
    description: 'Crystals grown from the phylacteries of destroyed liches, containing fragments of their power.',
    lore: 'Lich Crystals are the most dangerous materials in the tomb — touching one with bare skin invites the lich\'s personality to replace your own.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'shadow_steel', name: 'Shadow Steel', emoji: '🗡️', rarity: 'legendary', value: 600,
    category: 'metal', craftBonus: 25,
    description: 'Metal forged from solidified shadow, harder than diamond and lighter than silk.',
    lore: 'Shadow Steel can only be created during a total eclipse within the deepest tomb chamber — the conditions occur once every century.',
  },
  {
    id: 'pharaoh_gold', name: 'Pharaoh Gold', emoji: '👑', rarity: 'legendary', value: 700,
    category: 'cursed', craftBonus: 28,
    description: 'Gold alloyed with necromantic energy in ancient royal forges, eternally warm to the touch.',
    lore: 'Pharaoh Gold is said to be the payment Death received for its services — spending it brings bad fortune to the living.',
  },
];

// ============================================================
// SECTION 8: TB_STRUCTURES — 8 Structures (upgradeable to level 10)
// ============================================================

const TB_STRUCTURES: TbStructureDef[] = [
  {
    id: 'blade_forge', name: 'Blade Forge', emoji: '🔨',
    description: 'A forge that tempers cursed blades from bone fragments and shadow essence.',
    lore: 'The Blade Forge burns with black flames that do not produce heat — instead, they freeze time around the blade being forged.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'craftDiscount', bonusPerLevel: 2,
  },
  {
    id: 'soul_well', name: 'Soul Well', emoji: '🕳️',
    description: 'A deep well that draws souls from the surrounding earth, converting them into usable energy.',
    lore: 'The Soul Well was dug by the first tomb architects, who struck a vein of pure soul energy seven hundred feet down.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'mummy_workshop', name: 'Mummy Workshop', emoji: '🧵',
    description: 'A workshop where mummy sages prepare enchanted wrappings and preservation materials.',
    lore: 'The Mummy Workshop smells of myrrh and despair — visitors often forget why they entered and leave days later.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 5,
  },
  {
    id: 'bone_armory', name: 'Bone Armory', emoji: '🏛️',
    description: 'An armory that stores and maintains all weapons and armor used by tomb guardians.',
    lore: 'The Bone Armory is guarded by a spectral quartermaster who issues weapons based on the warrior\'s death count.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'scarab_incubator', name: 'Scarab Incubator', emoji: '🪲',
    description: 'A warm chamber where enchanted scarabs breed and multiply under controlled conditions.',
    lore: 'The Scarab Incubator maintains the tomb\'s scarab population at exactly one million — it has not deviated by a single beetle in millennia.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 4,
  },
  {
    id: 'spirit_bell', name: 'Spirit Bell', emoji: '🔔',
    description: 'A massive bell cast from pharaoh gold whose toll calls all spectral beings to arms.',
    lore: 'The Spirit Bell was cast from the melted crowns of a hundred conquered kings — its ring can be heard from the afterlife.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'soulYield', bonusPerLevel: 6,
  },
  {
    id: 'tomb_beacon', name: 'Tomb Beacon', emoji: '🔦',
    description: 'A beacon of cursed light that reveals hidden passages and repels grave robbers.',
    lore: 'The Tomb Beacon\'s light shows the last moments of whoever is illuminated — most visitors prefer the darkness.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'coinBonus', bonusPerLevel: 6,
  },
  {
    id: 'curse_altar', name: 'Curse Altar', emoji: '💀',
    description: 'An altar where powerful curses are crafted and bestowed upon weapons and tomb guardians.',
    lore: 'The Curse Altar is stained with the blood of every tomb guardian who failed their duty — a permanent reminder of the cost of weakness.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: TB_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const TB_ABILITIES: TbAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'blade_storm', name: 'Blade Storm', category: 'offensive',
    description: 'Summons a whirlwind of spectral blades that shred everything in their path.',
    lore: 'Blade Storm was invented by the Eternal Blade Sovereign, who grew tired of enemies escaping his reach.',
    emoji: '🌪️', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'curse_strike', name: 'Curse Strike', category: 'offensive',
    description: 'A devastating melee attack that inflicts a withering curse on the target.',
    lore: 'Curse Strike was developed by Lich Queens as a punishment for tomb robbers — the curse prevents the wound from ever healing.',
    emoji: '⚡', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'bone_shield', name: 'Bone Shield', category: 'defensive',
    description: 'Conjures a shield of interlocking bones that absorbs incoming attacks.',
    lore: 'Bone Shields are assembled from the bones of fallen guardians, creating a wall that remembers how to fight.',
    emoji: '🛡️', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'mummy_bind', name: 'Mummy Bind', category: 'defensive',
    description: 'Enchanted bandages erupt from the ground, binding and immobilizing the target.',
    lore: 'Mummy Bind was created by ancient embalmers who needed to restrain restless corpses during the preservation process.',
    emoji: '🪢', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'tomb_sense', name: 'Tomb Sense', category: 'utility',
    description: 'Grants the ability to sense all living creatures within the tomb network.',
    lore: 'Tomb Sense allows guardians to feel the warmth of intruders like a heartbeat in the dark.',
    emoji: '👁️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'siphon_soul', name: 'Siphon Soul', category: 'utility',
    description: 'Drains life force from a target, converting it to necromantic energy for the caster.',
    lore: 'Siphon Soul is the gentlest offensive ability — it merely borrows a few decades of life, nothing permanent.',
    emoji: '💨', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'awaken_guardian', name: 'Awaken Guardian', category: 'summon',
    description: 'Awakens a dormant tomb guardian to fight alongside you for a limited time.',
    lore: 'Awaken Guardian was the first spell ever cast in the necropolis — it gave birth to the entire tomb guardian civilization.',
    emoji: '💀', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'scarab_summon', name: 'Scarab Summon', category: 'summon',
    description: 'Summons a swarm of scarabs that overwhelms enemies with sheer numbers.',
    lore: 'Scarab Summons are the necropolis\'s natural defense mechanism — the tomb itself calls the scarabs when intruders approach.',
    emoji: '🪲', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: TB_ACHIEVEMENTS — 10 Achievements
// ============================================================

const TB_ACHIEVEMENTS: TbAchievementDef[] = [
  {
    id: 'ach_first_awaken', name: 'First Awakening', emoji: '🗡️',
    description: 'Awaken your first tomb guardian and begin your service to the necropolis.',
    conditionKey: 'totalAwakened', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_awaken_10', name: 'Blade Apprentice', emoji: '⚔️',
    description: 'Awaken 10 tomb guardians and prove your dedication to the necropolis.',
    conditionKey: 'totalAwakened', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_awaken_25', name: 'Master Awakener', emoji: '🏅',
    description: 'Awaken 25 tomb guardians to earn the title of Master Awakener.',
    conditionKey: 'totalAwakened', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_chamber_3', name: 'Tomb Explorer', emoji: '🔦',
    description: 'Clear 3 tomb chambers and begin mapping the necropolis.',
    conditionKey: 'totalChambersCleared', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_chamber_all', name: 'Necropolis Conqueror', emoji: '🗺️',
    description: 'Clear all 8 tomb chambers and reach the Throne of Shadows.',
    conditionKey: 'totalChambersCleared', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Dark Architect', emoji: '🏚️',
    description: 'Build 3 different tomb structures to fortify the necropolis.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Relic Bearer', emoji: '💎',
    description: 'Activate your first tomb artifact and channel its ancient power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Curse Survivor', emoji: '☠️',
    description: 'Survive 5 random tomb events without being consumed by the darkness.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Tomb Veteran', emoji: '🧗',
    description: 'Reach guardian level 25 and gain access to the Lich Sanctum.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Necropolis Master', emoji: '👑',
    description: 'Reach the maximum guardian level 50 and master the tomb blade.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: TB_TITLES — 8 Title Progression
// ============================================================

const TB_TITLES: TbTitleDef[] = [
  {
    id: 'title_grave_initiate', name: 'Grave Initiate', emoji: '⚰️',
    description: 'A newcomer to the necropolis, drawn by whispers from beneath the earth.',
    lore: 'Every tomb guardian began as a Grave Initiate, standing at the crypt entrance, wondering what darkness awaits below.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_blade_apprentice', name: 'Blade Apprentice', emoji: '🗡️',
    description: 'An aspiring guardian learning to wield cursed blades forged in the Soul Forge.',
    lore: 'Blade Apprentices train with bone swords until they can cut through steel — only then are they given a true cursed blade.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_tomb_warden', name: 'Tomb Warden', emoji: '🛡️',
    description: 'A sworn protector of a tomb chamber, responsible for keeping the dead undisturbed.',
    lore: 'Tomb Wardens take an oath of eternal vigilance — their cursed blades will not rest until their charge is safe.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_cursed_blademaster', name: 'Cursed Blademaster', emoji: '⚔️',
    description: 'A warrior whose cursed blade has consumed a hundred souls, growing stronger with each.',
    lore: 'Cursed Blademasters can sense the fear of their enemies through their blades — the weapon feeds on terror.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_mummy_lord', name: 'Mummy Lord', emoji: '🧟',
    description: 'A master of preservation magic who commands the mummified armies of the necropolis.',
    lore: 'Mummy Lords have achieved perfect preservation — their bodies will endure until the sun burns out.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_shadow_reaper', name: 'Shadow Reaper', emoji: '👻',
    description: 'A spectral hunter who strikes from the shadows, claiming souls for the necropolis.',
    lore: 'Shadow Reapers move between shadows like stepping stones — to them, darkness is solid ground.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_phalanx_commander', name: 'Phalanx Commander', emoji: '🗿',
    description: 'A general commanding the combined forces of all tomb guardian species.',
    lore: 'Phalanx Commanders can coordinate every guardian species simultaneously — bone knights hold the line while scarabs swarm the flanks.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_tomb_blade_sovereign', name: 'Tomb Blade Sovereign', emoji: '👑',
    description: 'The supreme ruler of the necropolis, wielding the original tomb blade.',
    lore: 'The Tomb Blade Sovereign sits upon the Throne of Shadows and commands every creature in every tomb — a burden no mortal was meant to bear.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: TB_ARTIFACTS — 6 Artifacts
// ============================================================

const TB_ARTIFACTS: TbArtifactDef[] = [
  {
    id: 'art_blade_of_whispers', name: 'Blade of Whispers',
    description: 'A bone sword that whispers the battle strategies of every warrior it has killed.',
    lore: 'The Blade of Whispers has accumulated ten thousand years of combat knowledge — its wielder becomes an instant tactical genius.',
    emoji: '🗡️', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_pharaohs_crown', name: 'Pharaoh\'s Crown',
    description: 'A golden crown encrusted with lapis lazuli, radiating ancient royal authority.',
    lore: 'The Pharaoh\'s Crown was worn by seven successive pharaohs — each one added a gemstone representing a conquered kingdom.',
    emoji: '👑', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_shadow_cloak', name: 'Shadow Cloak',
    description: 'A cloak woven from solidified darkness that makes the wearer completely invisible.',
    lore: 'The Shadow Cloak was a gift from the Shadow Reaper to the first Tomb Warden — it has been passed down through generations of protectors.',
    emoji: '🧥', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_soul_crucible', name: 'Soul Crucible',
    description: 'A golden chalice that can capture and store soul energy for later use.',
    lore: 'The Soul Crucible was used in the original lich ritual — drinking from it grants temporary godhood at the cost of a fragment of humanity.',
    emoji: '🏆', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_lich_phylactery', name: 'Lich Phylactery',
    description: 'A crystal containing the trapped soul of an ancient lich, pulsing with forbidden knowledge.',
    lore: 'The Lich Phylactery is both the greatest prize and the greatest danger in the necropolis — its power is matched only by its corruption.',
    emoji: '🔮', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_original_tomb_blade', name: 'Original Tomb Blade',
    description: 'The first cursed blade ever forged, containing the essence of death itself.',
    lore: 'The Original Tomb Blade was forged before the concept of death existed — it CREATED death, and all other cursed blades are merely reflections of its power.',
    emoji: '⚔️', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: TB_EVENTS — 8 Random Tomb Events
// ============================================================

const TB_EVENTS: TbEventDef[] = [
  {
    id: 'evt_bone_collapse', name: 'Bone Collapse',
    description: 'A section of the bone walls crumbles, revealing a hidden cache of materials.',
    lore: 'Bone Collapses are terrifying but useful — they expose rare materials buried deep within the necropolis walls.',
    emoji: '🦴', effectType: 'buff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'bone_fragments', rewardMaterialCount: 5,
  },
  {
    id: 'evt_soul_surge', name: 'Soul Surge',
    description: 'A wave of trapped souls floods through the tomb corridors, empowering all guardians.',
    lore: 'Soul Surges occur when the boundary between worlds thins, releasing thousands of souls simultaneously into the necropolis.',
    emoji: '💎', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'soul_gems', rewardMaterialCount: 5,
  },
  {
    id: 'evt_wrapping_unravel', name: 'Wrapping Unravel',
    description: 'Ancient mummy wrappings come alive, snaking through corridors and ensnaring intruders.',
    lore: 'Wrapping Unravels happen when the preservation enchantments weaken — the wrappings seek new bodies to preserve.',
    emoji: '🧵', effectType: 'debuff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'ancient_cloth', rewardMaterialCount: 6,
  },
  {
    id: 'evt_scarab_migration', name: 'Scarab Migration',
    description: 'Millions of scarabs pour through the corridors in a single-minded migration to a new chamber.',
    lore: 'Scarab Migrations are both awe-inspiring and deadly — anything caught in their path is consumed and converted into tomb dust.',
    emoji: '🪲', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'scarab_shells', rewardMaterialCount: 4,
  },
  {
    id: 'evt_shadow_eclipse', name: 'Shadow Eclipse',
    description: 'Total darkness falls over the necropolis as shadows merge into a single overwhelming void.',
    lore: 'Shadow Eclipses occur when the Throne of Shadows resonates — during them, the dead can walk in perfect freedom.',
    emoji: '🌑', effectType: 'special', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'shadow_steel', rewardMaterialCount: 3,
  },
  {
    id: 'evt_whispers_of_pharaohs', name: 'Whispers of Pharaohs',
    description: 'The voices of buried pharaohs echo through every chamber, revealing ancient secrets.',
    lore: 'The Whispers of Pharaohs contain the combined knowledge of every ruler buried in the necropolis — understanding them requires centuries.',
    emoji: '📣', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'cursed_ink', rewardMaterialCount: 2,
  },
  {
    id: 'evt_phantom_bazaar', name: 'Phantom Bazaar',
    description: 'Spectral merchants appear, selling exotic materials from the afterlife\'s market.',
    lore: 'The Phantom Bazaar appears only when the tomb has been undisturbed for exactly one thousand days — its goods are otherworldly.',
    emoji: '🏪', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'pharaoh_gold', rewardMaterialCount: 3,
  },
  {
    id: 'evt_lich_resonance', name: 'Lich Resonance',
    description: 'The phylacteries of all lich queens vibrate in unison, releasing a wave of dark energy.',
    lore: 'Lich Resonances are the most powerful events — the last major resonance accidentally created a new species of tomb guardian.',
    emoji: '🔮', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'lich_crystals', rewardMaterialCount: 8,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function tbGenerateInstanceId(): string {
  return `tb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function tbPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function tbCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function tbCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useTombBlade() {
  // ---- Core State ----
  const [tbLevel, setTbLevel] = useState(1);
  const [tbXp, setTbXp] = useState(TB_STARTING_XP);
  const [tbCoins, setTbCoins] = useState(TB_STARTING_COINS);
  const [tbTotalXp, setTbTotalXp] = useState(0);
  const [tbTotalCoins, setTbTotalCoins] = useState(0);

  // ---- Collection State ----
  const [tbRaised, setTbRaised] = useState<TbOwnedCreature[]>([]);
  const [tbInventory, setTbInventory] = useState<TbInventoryItem[]>([]);
  const [tbStructures, setTbStructures] = useState<TbStructureRecord[]>([]);
  const [tbArtifacts, setTbArtifacts] = useState<TbArtifactRecord[]>([]);
  const [tbAbilities, setTbAbilities] = useState<TbAbilityRecord[]>([]);
  const [tbAchievements, setTbAchievements] = useState<TbAchievementRecord[]>([]);
  const [tbChambers, setTbChambers] = useState<TbChamberRecord[]>([]);
  const [tbEventLog, setTbEventLog] = useState<TbEventLogEntry[]>([]);
  const [tbActiveEvent, setTbActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [tbCurrentTitle, setTbCurrentTitle] = useState('title_grave_initiate');

  // ---- Stats State ----
  const [tbStats, setTbStats] = useState<TbStats>({
    totalAwakened: 0,
    totalChambersCleared: 0,
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
    tbLevel, tbXp, tbTotalXp, tbTotalCoins, tbRaised, tbInventory,
    tbStructures, tbArtifacts, tbAbilities, tbAchievements,
    tbChambers, tbEventLog, tbActiveEvent, tbCurrentTitle, tbStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      tbLevel, tbXp, tbTotalXp, tbTotalCoins, tbRaised, tbInventory,
      tbStructures, tbArtifacts, tbAbilities, tbAchievements,
      tbChambers, tbEventLog, tbActiveEvent, tbCurrentTitle, tbStats,
    };
  }, [tbLevel, tbXp, tbTotalXp, tbTotalCoins, tbRaised, tbInventory,
    tbStructures, tbArtifacts, tbAbilities, tbAchievements,
    tbChambers, tbEventLog, tbActiveEvent, tbCurrentTitle, tbStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(TB_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.tbLevel) setTbLevel(data.tbLevel);
        if (data.tbXp) setTbXp(data.tbXp);
        if (data.tbCoins) setTbCoins(data.tbCoins);
        if (data.tbTotalXp) setTbTotalXp(data.tbTotalXp);
        if (data.tbTotalCoins) setTbTotalCoins(data.tbTotalCoins);
        if (data.tbRaised) setTbRaised(data.tbRaised);
        if (data.tbInventory) setTbInventory(data.tbInventory);
        if (data.tbStructures) setTbStructures(data.tbStructures);
        if (data.tbArtifacts) setTbArtifacts(data.tbArtifacts);
        if (data.tbAbilities) setTbAbilities(data.tbAbilities);
        if (data.tbAchievements) setTbAchievements(data.tbAchievements);
        if (data.tbChambers) setTbChambers(data.tbChambers);
        if (data.tbEventLog) setTbEventLog(data.tbEventLog);
        if (data.tbActiveEvent) setTbActiveEvent(data.tbActiveEvent);
        if (data.tbCurrentTitle) setTbCurrentTitle(data.tbCurrentTitle);
        if (data.tbStats) setTbStats(data.tbStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setTbChambers(
      TB_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setTbAbilities(
      TB_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setTbAchievements(
      TB_ACHIEVEMENTS.map((a) => ({
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
          tbLevel, tbXp, tbCoins, tbTotalXp, tbTotalCoins,
          tbRaised, tbInventory, tbStructures, tbArtifacts,
          tbAbilities, tbAchievements, tbChambers, tbEventLog,
          tbActiveEvent, tbCurrentTitle, tbStats,
        };
        localStorage.setItem(TB_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, TB_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [tbLevel, tbXp, tbCoins, tbTotalXp, tbTotalCoins,
    tbRaised, tbInventory, tbStructures, tbArtifacts,
    tbAbilities, tbAchievements, tbChambers, tbEventLog,
    tbActiveEvent, tbCurrentTitle, tbStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!tbActiveEvent) return;
    const evt = TB_EVENTS.find((e) => e.id === tbActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setTbActiveEvent(null);
      setTbEventLog((prev) =>
        prev.map((e) => (e.eventId === tbActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [tbActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...TB_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => tbLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === tbCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setTbCurrentTitle(nextTitle.id);
    }
  }, [tbLevel, tbCurrentTitle]);

  // ============================================================
  // COMPUTED: tbMaxXp
  // ============================================================

  const tbMaxXp = useMemo(() => {
    return Math.floor(TB_XP_BASE * Math.pow(tbLevel + 1, TB_XP_SCALE));
  }, [tbLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(TB_XP_BASE * Math.pow(lvl, TB_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(tbLevel + 1);
    return Math.max(0, needed - tbXp);
  }, [tbLevel, tbXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(tbLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((tbXp / needed) * 100), 100);
  }, [tbLevel, tbXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): TbCreatureDef | undefined => {
    return TB_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): TbChamberDef | undefined => {
    return TB_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): TbMaterialDef | undefined => {
    return TB_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): TbStructureDef | undefined => {
    return TB_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): TbAbilityDef | undefined => {
    return TB_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): TbArtifactDef | undefined => {
    return TB_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): TbAchievementDef | undefined => {
    return TB_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): TbTitleDef | undefined => {
    return TB_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): TbEventDef | undefined => {
    return TB_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: TbRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: TbRarity): string => {
    return TB_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: TbSpecies): string => {
    return TB_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: awaken (raise a tomb guardian)
  // ============================================================

  const awaken = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (tbCoins < def.cost) return false;
    if (tbRaised.length >= TB_MAX_RAISED_CREATURES) return false;

    const newCreature: TbOwnedCreature = {
      creatureId: def.id,
      instanceId: tbGenerateInstanceId(),
      raisedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setTbCoins((prev) => prev - def.cost);
    setTbRaised((prev) => [...prev, newCreature]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = tbCalculateLevelUp(
      xpForLevel(tbLevel + 1),
      tbXp,
      xpGained,
      setTbLevel,
    );
    setTbXp(overflow);
    setTbTotalXp((prev) => prev + xpGained);
    setTbTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setTbStats((prev) => ({ ...prev, totalAwakened: prev.totalAwakened + 1 }));
    return true;
  }, [tbCoins, tbLevel, tbXp, tbRaised.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: raid (clear a tomb chamber)
  // ============================================================

  const raid = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (tbLevel < def.unlockLevel) return false;

    setTbChambers((prev) =>
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

    const bonusMat = tbPickRandom(def.resources);
    if (bonusMat) {
      setTbInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, TB_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setTbTotalXp((prev) => prev + 15);
    setTbTotalCoins((prev) => prev + 5);
    setTbStats((prev) => ({ ...prev, totalChambersCleared: prev.totalChambersCleared + 1 }));
    return true;
  }, [tbLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: forge_blade (build/upgrade a structure)
  // ============================================================

  const forgeBlade = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = tbStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = tbCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (tbCoins < cost) return false;

    setTbCoins((prev) => prev - cost);
    setTbStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setTbTotalXp((prev) => prev + 20);
    setTbStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [tbCoins, tbStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: enchant (activate an artifact)
  // ============================================================

  const enchant = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (tbCoins < def.cost) return false;
    if (tbArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setTbCoins((prev) => prev - def.cost);
    setTbArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setTbTotalXp((prev) => prev + 100);
    setTbStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [tbCoins, tbArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: curse (trigger a random tomb event)
  // ============================================================

  const curse = useCallback((): TbEventDef | null => {
    if (tbActiveEvent) return null;
    const event = tbPickRandom(TB_EVENTS);
    setTbActiveEvent(event.id);
    setTbEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setTbTotalXp((prev) => prev + event.rewardXp);
    setTbCoins((prev) => prev + event.rewardCoins);
    setTbTotalCoins((prev) => prev + event.rewardCoins);
    setTbStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setTbInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, TB_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    return event;
  }, [tbActiveEvent]);

  // ============================================================
  // CORE ACTION: seal (reset the necropolis)
  // ============================================================

  const seal = useCallback(() => {
    setTbLevel(1);
    setTbXp(0);
    setTbCoins(TB_STARTING_COINS);
    setTbTotalXp(0);
    setTbTotalCoins(0);
    setTbRaised([]);
    setTbInventory([]);
    setTbStructures([]);
    setTbArtifacts([]);
    setTbAbilities(
      TB_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setTbAchievements(
      TB_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setTbChambers(
      TB_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setTbEventLog([]);
    setTbActiveEvent(null);
    setTbCurrentTitle('title_grave_initiate');
    setTbStats({
      totalAwakened: 0, totalChambersCleared: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(TB_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // CORE ACTION: resurrect (discover a chamber, alias for raid)
  // ============================================================

  const resurrect = useCallback((chamberId: string): boolean => {
    return raid(chamberId);
  }, [raid]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setTbStats((currentStats) => {
      setTbAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalAwakened: currentStats.totalAwakened,
          totalChambersCleared: currentStats.totalChambersCleared,
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
            setTbTotalXp((xp) => xp + def.rewardXp);
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
    const record = tbAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setTbAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setTbTotalXp((prev) => prev + 5);
    return true;
  }, [tbAbilities, getAbilityDef]);

  // ============================================================
  // EXTENDED ACTION: dismissEvent
  // ============================================================

  const dismissEvent = useCallback((): boolean => {
    if (!tbActiveEvent) return false;
    setTbActiveEvent(null);
    setTbEventLog((prev) =>
      prev.map((e) => (e.eventId === tbActiveEvent ? { ...e, resolved: true } : e)),
    );
    return true;
  }, [tbActiveEvent]);

  // ============================================================
  // EXTENDED ACTION: addMaterialToInventory
  // ============================================================

  const addMaterialToInventory = useCallback((materialId: string, count: number): boolean => {
    const def = getMaterialDef(materialId);
    if (!def) return false;

    setTbInventory((prev) => {
      const existing = prev.find((i) => i.materialId === materialId);
      if (existing) {
        return prev.map((i) =>
          i.materialId === materialId
            ? { ...i, count: Math.min(i.count + count, TB_MAX_INVENTORY_ITEM) }
            : i,
        );
      }
      return [...prev, { materialId, count: Math.min(count, TB_MAX_INVENTORY_ITEM) }];
    });
    return true;
  }, [getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: removeMaterialFromInventory
  // ============================================================

  const removeMaterialFromInventory = useCallback((materialId: string, count: number): boolean => {
    const item = tbInventory.find((i) => i.materialId === materialId);
    if (!item || item.count < count) return false;

    setTbInventory((prev) =>
      prev.map((i) =>
        i.materialId === materialId
          ? { ...i, count: i.count - count }
          : i,
      ).filter((i) => i.count > 0),
    );
    return true;
  }, [tbInventory]);

  // ============================================================
  // EXTENDED ACTION: renameCreature
  // ============================================================

  const renameCreature = useCallback((instanceId: string, nickname: string): boolean => {
    const creature = tbRaised.find((c) => c.instanceId === instanceId);
    if (!creature) return false;

    setTbRaised((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, nickname } : c,
      ),
    );
    return true;
  }, [tbRaised]);

  // ============================================================
  // EXTENDED ACTION: dismissCreature
  // ============================================================

  const dismissCreature = useCallback((instanceId: string): boolean => {
    const creature = tbRaised.find((c) => c.instanceId === instanceId);
    if (!creature) return false;

    const def = getCreatureDef(creature.creatureId);
    const refund = def ? Math.floor(def.cost * 0.3) : 5;

    setTbRaised((prev) => prev.filter((c) => c.instanceId !== instanceId));
    setTbCoins((prev) => prev + refund);
    return true;
  }, [tbRaised, getCreatureDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const tbTitleProgress = useMemo((): TbTitleProgress => {
    const sorted = [...TB_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === tbCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === tbCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((tbLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [tbLevel, tbCurrentTitle]);

  const currentTitleInfo = useMemo(() => tbTitleProgress.current, [tbTitleProgress]);

  const nextTitleInfo = useMemo(() => tbTitleProgress.next, [tbTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    creaturesAwakened: tbRaised.length,
    chambersCleared: tbChambers.filter((c) => c.discovered).length,
    structuresBuilt: tbStructures.length,
    artifactsActive: tbArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: tbAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: tbAbilities.filter((a) => a.unlocked).length,
    totalXp: tbTotalXp,
    totalCoins: tbTotalCoins,
    currentLevel: tbLevel,
    ownedSpeciesCount: new Set(tbRaised.map((g) => {
      const d = TB_CREATURES.find((c) => c.id === g.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: tbEventLog.length,
  }), [tbRaised, tbChambers, tbStructures, tbArtifacts,
    tbAchievements, tbAbilities, tbTotalXp, tbTotalCoins, tbLevel, tbEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      TB_CREATURES.length +
      TB_CHAMBERS.length +
      TB_STRUCTURES.length +
      TB_ARTIFACTS.length +
      TB_ACHIEVEMENTS.length +
      TB_ABILITIES.length;
    const completed =
      tbRaised.length +
      tbChambers.filter((c) => c.discovered).length +
      tbStructures.length +
      tbArtifacts.filter((a) => a.activated).length +
      tbAchievements.filter((a) => a.unlocked).length +
      tbAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      creaturePercent: Math.round((tbRaised.length / TB_CREATURES.length) * 100),
      chamberPercent: Math.round((tbChambers.filter((c) => c.discovered).length / TB_CHAMBERS.length) * 100),
      structurePercent: Math.round((tbStructures.length / TB_STRUCTURES.length) * 100),
      artifactPercent: Math.round((tbArtifacts.filter((a) => a.activated).length / TB_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((tbAchievements.filter((a) => a.unlocked).length / TB_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((tbAbilities.filter((a) => a.unlocked).length / TB_ABILITIES.length) * 100),
    };
  }, [tbRaised, tbChambers, tbStructures, tbArtifacts, tbAchievements, tbAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCreatures = useMemo(() =>
    tbRaised.map((g) => ({
      ...g,
      def: getCreatureDef(g.creatureId),
    })),
  [tbRaised, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    tbChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [tbChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    tbStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: tbCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: tbCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [tbStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    tbInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [tbInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    tbArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [tbArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    tbAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [tbAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const creaturesByType = useMemo(() => {
    const result: Record<string, TbOwnedCreature[]> = {};
    for (const species of TB_SPECIES) {
      result[species.id] = tbRaised.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [tbRaised, getCreatureDef]);

  const creaturesByRarity = useMemo(() => {
    const rarities: TbRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, TbOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = tbRaised.filter((g) => {
        const def = getCreatureDef(g.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [tbRaised, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return TB_CREATURES.filter((c) => c.cost <= tbCoins);
  }, [tbCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalAwakened: tbStats.totalAwakened,
      totalChambersCleared: tbStats.totalChambersCleared,
      totalStructuresBuilt: tbStats.totalStructuresBuilt,
      totalArtifacts: tbStats.totalArtifacts,
      totalEvents: tbStats.totalEvents,
      totalCoins: tbStats.totalCoins,
      totalXp: tbStats.totalXp,
    };
    return TB_ACHIEVEMENTS.filter(
      (a) =>
        !tbAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [tbStats, tbAchievements]);

  const recentEventLog = useMemo(() => {
    return [...tbEventLog].reverse().slice(0, 10);
  }, [tbEventLog]);

  const creaturesByPower = useMemo(() => {
    return [...tbRaised]
      .map((g) => ({ ...g, def: getCreatureDef(g.creatureId) }))
      .filter((g) => g.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [tbRaised, getCreatureDef]);

  const topCreatures = useMemo(() => {
    return creaturesByPower.slice(0, 10);
  }, [creaturesByPower]);

  const creatureSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const g of tbRaised) {
      const def = getCreatureDef(g.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [tbRaised, getCreatureDef]);

  const chamberExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of tbChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [tbChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of tbStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [tbStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of tbAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [tbAbilities]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    TB_BONE_WHITE,
    TB_TOMB_GRAY,
    TB_BLOOD_RED,
    TB_GOLD,
    TB_SHADOW_PURPLE,
    TB_RUST_BROWN,
    TB_CURSE_GREEN,
    TB_RARITY_COLORS,
    TB_SPECIES_COLORS,
    TB_ALL_COLORS,

    // ---- Data Constants ----
    TB_SPECIES,
    TB_CREATURES,
    TB_CHAMBERS,
    TB_MATERIALS,
    TB_STRUCTURES,
    TB_ABILITIES,
    TB_ACHIEVEMENTS,
    TB_TITLES,
    TB_ARTIFACTS,
    TB_EVENTS,
    TB_MAX_LEVEL,
    TB_SAVE_KEY,
    TB_XP_BASE,
    TB_XP_SCALE,

    // ---- State ----
    tbLevel,
    tbXp,
    tbMaxXp,
    tbCoins,
    tbTotalXp,
    tbTotalCoins,
    tbRaised,
    tbInventory,
    tbStructures,
    tbArtifacts,
    tbAbilities,
    tbAchievements,
    tbChambers,
    tbEventLog,
    tbActiveEvent,
    tbCurrentTitle,
    tbStats,

    // ---- Core Actions ----
    awaken,
    enchant,
    seal,
    raid,
    curse,
    forgeBlade,
    resurrect,

    // ---- Extended Actions ----
    checkAndClaimAchievements,
    useAbility,
    dismissEvent,
    addMaterialToInventory,
    removeMaterialFromInventory,
    renameCreature,
    dismissCreature,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    tbTitleProgress,

    // ---- Stats ----
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
    xpForLevel,
    xpToNextLevel,
    levelProgressPercent,
  };
}
