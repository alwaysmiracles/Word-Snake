import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Trade Vessel (贸易船) — Wire Module
//
// A legendary merchant galleon sailing across endless seas, where
// captains hire crew, discover uncharted islands, trade exotic
// goods, and brave ocean storms. Players recruit crew members,
// sail to distant ports, collect trade materials, upgrade ship
// structures, discover legendary artifacts, face random voyage
// events, and ascend through 8 titles of maritime mastery.
//
// Storage key: trade-vessel-save
// Prefix: tt / TT_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type TtRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type TtSpecies =
  | 'sea_captain'
  | 'merchant_sailor'
  | 'storm_mage'
  | 'treasure_diver'
  | 'kraken_tamer'
  | 'navigator_owl'
  | 'corsair_fox';

type TtAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type TtStructureBonusType =
  | 'hireDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'voyageBonus'
  | 'abilityBonus'
  | 'tradeQuality'
  | 'coinYield'
  | 'coinBonus'
  | 'healingBonus'
  | 'speedBonus'
  | 'energyBonus';

type TtMaterialCategory = 'spice' | 'fabric' | 'gem' | 'food' | 'metal' | 'wood' | 'potion';

// ---- Crew (Creature) Definitions ----

interface TtCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: TtSpecies;
  readonly rarity: TtRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Chamber (Port) Definitions ----

interface TtChamberDef {
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

interface TtMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: TtRarity;
  readonly value: number;
  readonly category: TtMaterialCategory;
  readonly tradeBonus: number;
}

// ---- Structure Definitions ----

interface TtStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: TtStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface TtAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: TtAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: TtRarity;
}

// ---- Achievement Definitions ----

interface TtAchievementDef {
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

interface TtTitleDef {
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

interface TtArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: TtRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface TtEventDef {
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

interface TtOwnedCreature {
  creatureId: string;
  instanceId: string;
  hiredAt: number;
  timesUsed: number;
  nickname: string;
}

interface TtChamberRecord {
  chamberId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface TtStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface TtArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface TtAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface TtAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface TtInventoryItem {
  materialId: string;
  count: number;
}

interface TtEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface TtStats {
  totalHired: number;
  totalVoyages: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface TtTitleProgress {
  current: TtTitleDef;
  next: TtTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: TT_ CONSTANTS
// ============================================================

const TT_SAVE_KEY = 'trade-vessel-save';
const TT_MAX_LEVEL = 50;
const TT_STARTING_COINS = 300;
const TT_STARTING_XP = 0;
const TT_XP_BASE = 100;
const TT_XP_SCALE = 1.5;
const TT_AUTO_SAVE_MS = 15000;
const TT_EVENT_DURATION_MS = 60000;
const TT_MAX_INVENTORY_ITEM = 999;
const TT_MAX_OWNED_CREATURES = 100;
const TT_COOLDOWN_TICK_MS = 1000;
const TT_SPECIES_COUNT = 7;
const TT_CREATURE_COUNT = 35;
const TT_CHAMBER_COUNT = 8;
const TT_MATERIAL_COUNT = 12;
const TT_STRUCTURE_COUNT = 8;
const TT_ABILITY_COUNT = 8;
const TT_ACHIEVEMENT_COUNT = 10;
const TT_TITLE_COUNT = 8;
const TT_ARTIFACT_COUNT = 6;
const TT_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const TT_OCEAN_BLUE = '#0077BE';
const TT_DECK_BROWN = '#8B4513';
const TT_SAIL_WHITE = '#FAFAFA';
const TT_GOLD_COIN = '#FFD700';
const TT_STORM_GRAY = '#708090';
const TT_CORAL_PINK = '#FF7F50';
const TT_DEEP_SEA = '#003366';

const TT_RARITY_COLORS: Record<TtRarity, string> = {
  common: '#A0A090',
  uncommon: '#0077BE',
  rare: '#9B59B6',
  epic: '#FF7F50',
  legendary: '#FFD700',
};

const TT_SPECIES_COLORS: Record<TtSpecies, string> = {
  sea_captain: TT_OCEAN_BLUE,
  merchant_sailor: TT_GOLD_COIN,
  storm_mage: TT_STORM_GRAY,
  treasure_diver: TT_CORAL_PINK,
  kraken_tamer: TT_DEEP_SEA,
  navigator_owl: '#8E44AD',
  corsair_fox: TT_DECK_BROWN,
};

const TT_ALL_COLORS = [
  TT_OCEAN_BLUE,
  TT_DECK_BROWN,
  TT_SAIL_WHITE,
  TT_GOLD_COIN,
  TT_STORM_GRAY,
  TT_CORAL_PINK,
  TT_DEEP_SEA,
];

// ============================================================
// SECTION 4: TT_SPECIES — 7 Crew Species
// ============================================================

const TT_SPECIES: { id: TtSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'sea_captain',
    name: 'Sea Captain',
    description: 'Veteran commanders who have navigated every ocean and command respect across all seas.',
    lore: 'Sea Captains are born with salt in their veins and starlight in their eyes, able to read currents like others read books.',
    emoji: '⚓',
    color: TT_OCEAN_BLUE,
  },
  {
    id: 'merchant_sailor',
    name: 'Merchant Sailor',
    description: 'Hardworking sailors who keep the trade routes flowing with cargo and coin.',
    lore: 'Merchant Sailors know every port\'s black market dealer by first name and can haggle down a dragon\'s price.',
    emoji: '🧭',
    color: TT_GOLD_COIN,
  },
  {
    id: 'storm_mage',
    name: 'Storm Mage',
    description: 'Mystical mages who command the fury of ocean storms and channel lightning through their sails.',
    lore: 'Storm Mages are trained on the Storm Reaches, where hurricanes are considered gentle weather.',
    emoji: '⚡',
    color: TT_STORM_GRAY,
  },
  {
    id: 'treasure_diver',
    name: 'Treasure Diver',
    description: 'Fearless deep-sea divers who plunge into wrecks and reefs to recover sunken wealth.',
    lore: 'Treasure Divers can hold their breath for over an hour using ancient pearl-gill enchantments.',
    emoji: '🤿',
    color: TT_CORAL_PINK,
  },
  {
    id: 'kraken_tamer',
    name: 'Kraken Tamer',
    description: 'Wild tamers who have forged bonds with the most fearsome creatures of the deep.',
    lore: 'Kraken Tamers communicate with sea monsters through bioluminescent patterns on their skin.',
    emoji: '🐙',
    color: TT_DEEP_SEA,
  },
  {
    id: 'navigator_owl',
    name: 'Navigator Owl',
    description: 'Mystical owls that perch atop masts, guiding ships through fog and darkness with unerring accuracy.',
    lore: 'Navigator Owls are descended from the Star Owls of the First Voyage, when ships sailed between constellations.',
    emoji: '🦉',
    color: '#8E44AD',
  },
  {
    id: 'corsair_fox',
    name: 'Corsair Fox',
    description: 'Cunning and swift fox pirates who excel at boarding, espionage, and smuggling contraband.',
    lore: 'Corsair Foxes are feared across every sea for their cunning — a single fox crew can empty a treasury overnight.',
    emoji: '🦊',
    color: TT_DECK_BROWN,
  },
];

// ============================================================
// SECTION 5: TT_CREATURES — 35 Crew Members (5 tiers x 7 species)
// ============================================================

const TT_CREATURES: TtCreatureDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'sea_captain_common', name: 'Deckhand Cadet', species: 'sea_captain', rarity: 'common',
    description: 'A young aspiring captain learning the ropes and dreaming of commanding their own vessel.',
    lore: 'Deckhand Cadets spend their first year scrubbing decks and memorizing every knot in the Sailor\'s Codex.',
    emoji: '⚓', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'merchant_sailor_common', name: 'Swab Seaman', species: 'merchant_sailor', rarity: 'common',
    description: 'A greenhorn sailor whose enthusiasm outweighs their experience on the open water.',
    lore: 'Swab Seamen often get seasick on their first voyage — the ones who return are the real sailors.',
    emoji: '🧭', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'storm_mage_common', name: 'Drizzle Apprentice', species: 'storm_mage', rarity: 'common',
    description: 'A novice storm mage who can summon nothing more threatening than a light drizzle.',
    lore: 'Drizzle Apprentices are mercilessly teased by their peers for turning every sea battle into a light shower.',
    emoji: '⚡', power: 7, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'treasure_diver_common', name: 'Shell Collector', species: 'treasure_diver', rarity: 'common',
    description: 'A beginner diver who scours shallow reefs for colorful shells and the occasional coin.',
    lore: 'Shell Collectors have found some of the rarest pearls in history entirely by accident.',
    emoji: '🤿', power: 9, defense: 12, cost: 16, xpReward: 6,
  },
  {
    id: 'kraken_tamer_common', name: 'Squid Whistler', species: 'kraken_tamer', rarity: 'common',
    description: 'A young tamer who can communicate with small squids and octopi through gentle whistling.',
    lore: 'Squid Whistlers spend months at sea building trust with cephalopods before attempting larger creatures.',
    emoji: '🐙', power: 6, defense: 7, cost: 15, xpReward: 6,
  },
  {
    id: 'navigator_owl_common', name: 'Harbinger Pullet', species: 'navigator_owl', rarity: 'common',
    description: 'A young owl barely fledged, with keen eyes but still learning the constellations.',
    lore: 'Harbinger Pullets often mistake lighthouses for stars, leading ships on unexpected detours.',
    emoji: '🦉', power: 7, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'corsair_fox_common', name: 'Dock Rat', species: 'corsair_fox', rarity: 'common',
    description: 'A quick-witted fox kit who survives on the docks by picking pockets and finding secrets.',
    lore: 'Dock Rats know every hidden passage in every port — information they trade for scraps of food.',
    emoji: '🦊', power: 8, defense: 7, cost: 17, xpReward: 7,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'sea_captain_uncommon', name: 'First Mate', species: 'sea_captain', rarity: 'uncommon',
    description: 'A reliable second-in-command who can steer the vessel through any crisis.',
    lore: 'First Mates are the backbone of any crew — they keep discipline when the captain loses their head.',
    emoji: '⚓', power: 22, defense: 18, cost: 60, xpReward: 20,
  },
  {
    id: 'merchant_sailor_uncommon', name: 'Trade Specialist', species: 'merchant_sailor', rarity: 'uncommon',
    description: 'A skilled negotiator who can turn a profit in even the most desolate trading posts.',
    lore: 'Trade Specialists once convinced a Kraken to trade three chests of gold for a barrel of pickled herring.',
    emoji: '🧭', power: 20, defense: 15, cost: 55, xpReward: 18,
  },
  {
    id: 'storm_mage_uncommon', name: 'Thunder Weaver', species: 'storm_mage', rarity: 'uncommon',
    description: 'A mage who can weave lightning into the ship\'s sails for burst propulsion.',
    lore: 'Thunder Weavers are so in tune with electrical energy that their hair stands on end before storms.',
    emoji: '⚡', power: 24, defense: 14, cost: 65, xpReward: 22,
  },
  {
    id: 'treasure_diver_uncommon', name: 'Reef Scanner', species: 'treasure_diver', rarity: 'uncommon',
    description: 'An experienced diver capable of exploring coral reefs and shallow shipwrecks.',
    lore: 'Reef Scanners have developed echolocation techniques that rival dolphins in accuracy.',
    emoji: '🤿', power: 18, defense: 24, cost: 50, xpReward: 16,
  },
  {
    id: 'kraken_tamer_uncommon', name: 'Eel Charmer', species: 'kraken_tamer', rarity: 'uncommon',
    description: 'A skilled tamer who commands electric eels to guard the ship and strike enemies.',
    lore: 'Eel Charmers wear specialized gloves woven from kelp fiber to handle their electrified companions.',
    emoji: '🐙', power: 16, defense: 22, cost: 50, xpReward: 17,
  },
  {
    id: 'navigator_owl_uncommon', name: 'Star Reader', species: 'navigator_owl', rarity: 'uncommon',
    description: 'An owl that can read stellar navigation charts and plot courses through unknown waters.',
    lore: 'Star Reader Owls see constellations invisible to human eyes — patterns that shift with the tides.',
    emoji: '🦉', power: 21, defense: 16, cost: 58, xpReward: 19,
  },
  {
    id: 'corsair_fox_uncommon', name: 'Sneak Runner', species: 'corsair_fox', rarity: 'uncommon',
    description: 'A nimble fox who excels at boarding enemy ships and slipping away undetected.',
    lore: 'Sneak Runners have been known to steal an entire cargo hold while the crew debates dinner plans.',
    emoji: '🦊', power: 19, defense: 17, cost: 55, xpReward: 18,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'sea_captain_rare', name: 'Storm Commander', species: 'sea_captain', rarity: 'rare',
    description: 'A battle-hardened captain who thrives in the chaos of ocean warfare.',
    lore: 'Storm Commanders have never lost a ship — though they\'ve sunk more than a few enemy vessels.',
    emoji: '⚓', power: 40, defense: 35, cost: 200, xpReward: 50,
  },
  {
    id: 'merchant_sailor_rare', name: 'Silk Road Admiral', species: 'merchant_sailor', rarity: 'rare',
    description: 'An admiral of trade who commands a fleet of merchant vessels across the seas.',
    lore: 'Silk Road Admirals have established trade routes that connect every known continent.',
    emoji: '🧭', power: 38, defense: 30, cost: 180, xpReward: 45,
  },
  {
    id: 'storm_mage_rare', name: 'Tempest Caller', species: 'storm_mage', rarity: 'rare',
    description: 'A powerful mage who can summon full tempests to devastate enemy fleets.',
    lore: 'Tempest Callers are banned from seven ports for accidentally destroying harbor districts.',
    emoji: '⚡', power: 42, defense: 28, cost: 220, xpReward: 55,
  },
  {
    id: 'treasure_diver_rare', name: 'Abyssal Seeker', species: 'treasure_diver', rarity: 'rare',
    description: 'A deep-sea explorer who ventures into the abyss to recover treasures from legendary wrecks.',
    lore: 'Abyssal Seekers have discovered more sunken cities than all land-based archaeologists combined.',
    emoji: '🤿', power: 35, defense: 42, cost: 190, xpReward: 48,
  },
  {
    id: 'kraken_tamer_rare', name: 'Leviathan Rider', species: 'kraken_tamer', rarity: 'rare',
    description: 'A fearless tamer who rides giant sea serpents into battle against hostile fleets.',
    lore: 'Leviathan Riders form bonds so deep with their mounts that they can feel each other\'s emotions across oceans.',
    emoji: '🐙', power: 32, defense: 38, cost: 200, xpReward: 50,
  },
  {
    id: 'navigator_owl_rare', name: 'Compass Sage', species: 'navigator_owl', rarity: 'rare',
    description: 'A legendary owl whose internal compass never fails, even in the most magical storms.',
    lore: 'Compass Sages can find north even at the bottom of the sea, guided by the planet\'s magnetic heart.',
    emoji: '🦉', power: 37, defense: 32, cost: 200, xpReward: 52,
  },
  {
    id: 'corsair_fox_rare', name: 'Shadow Captain', species: 'corsair_fox', rarity: 'rare',
    description: 'A phantom fox captain who strikes from the shadows and vanishes without a trace.',
    lore: 'Shadow Captains have never been captured — their ships are coated in enchanted pitch that absorbs all light.',
    emoji: '🦊', power: 36, defense: 34, cost: 195, xpReward: 49,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'sea_captain_epic', name: 'Admiral of the Abyss', species: 'sea_captain', rarity: 'epic',
    description: 'An admiral whose fleet has conquered the deepest trenches and most treacherous waters.',
    lore: 'The Admiral of the Abyss once sailed a galleon over an underwater volcano — and emerged victorious.',
    emoji: '⚓', power: 70, defense: 60, cost: 800, xpReward: 120,
  },
  {
    id: 'merchant_sailor_epic', name: 'Trade Monarch', species: 'merchant_sailor', rarity: 'epic',
    description: 'A ruler of commerce whose merchant empire spans every ocean and every port.',
    lore: 'The Trade Monarch\'s fleet is so vast that their ships create their own weather patterns from the wake.',
    emoji: '🧭', power: 68, defense: 52, cost: 750, xpReward: 110,
  },
  {
    id: 'storm_mage_epic', name: 'Hurricane Archmage', species: 'storm_mage', rarity: 'epic',
    description: 'An archmage of such power that entire fleets are sunk by their mere presence.',
    lore: 'Hurricane Archmages breathe storms — every exhale creates a cyclone, every whisper generates a gale.',
    emoji: '⚡', power: 72, defense: 50, cost: 850, xpReward: 130,
  },
  {
    id: 'treasure_diver_epic', name: 'Drowned King\'s Heir', species: 'treasure_diver', rarity: 'epic',
    description: 'A diver of royal bloodline who can breathe underwater and command the tides.',
    lore: 'The Drowned King\'s Heir is the last descendant of an underwater kingdom, carrying its oceanic power in their veins.',
    emoji: '🤿', power: 60, defense: 72, cost: 780, xpReward: 115,
  },
  {
    id: 'kraken_tamer_epic', name: 'Kraken Sovereign', species: 'kraken_tamer', rarity: 'epic',
    description: 'A tamer who has forged a blood pact with the Kraken Lord of the Deepest Trench.',
    lore: 'The Kraken Sovereign can summon the Lord of the Deep with a single bioluminescent flash.',
    emoji: '🐙', power: 62, defense: 58, cost: 780, xpReward: 115,
  },
  {
    id: 'navigator_owl_epic', name: 'Eternal Wayfinder', species: 'navigator_owl', rarity: 'epic',
    description: 'An immortal owl that has guided ships for a thousand years, knowing every ocean by heart.',
    lore: 'The Eternal Wayfinder existed before maps — its memory IS the first map ever drawn.',
    emoji: '🦉', power: 66, defense: 55, cost: 820, xpReward: 125,
  },
  {
    id: 'corsair_fox_epic', name: 'Phantom Admiral', species: 'corsair_fox', rarity: 'epic',
    description: 'A spectral fox admiral whose ghostly fleet appears from fog banks to claim prizes.',
    lore: 'The Phantom Admiral was betrayed and drowned centuries ago — but death only made their fleet deadlier.',
    emoji: '🦊', power: 64, defense: 60, cost: 800, xpReward: 120,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'sea_captain_legendary', name: 'Eternal Grand Admiral', species: 'sea_captain', rarity: 'legendary',
    description: 'The supreme commander of all seas, whose word is law from pole to pole.',
    lore: 'The Eternal Grand Admiral holds the Anchor of Worlds — a chain connecting every ocean into one vast waterway.',
    emoji: '⚓', power: 120, defense: 105, cost: 3000, xpReward: 300,
  },
  {
    id: 'merchant_sailor_legendary', name: 'Emperor of the Seven Seas', species: 'merchant_sailor', rarity: 'legendary',
    description: 'The merchant emperor whose trade network spans every known and unknown market.',
    lore: 'The Emperor of the Seven Seas once bought an entire island for a single exotic spice seed.',
    emoji: '🧭', power: 115, defense: 95, cost: 2800, xpReward: 280,
  },
  {
    id: 'storm_mage_legendary', name: 'Worldbreaker Tempest', species: 'storm_mage', rarity: 'legendary',
    description: 'A mage of apocalyptic power who can shatter continents with their storms.',
    lore: 'The Worldbreaker Tempest created the perpetual hurricane that guards the Edge of the World.',
    emoji: '⚡', power: 125, defense: 90, cost: 3200, xpReward: 320,
  },
  {
    id: 'treasure_diver_legendary', name: 'Lord of Sunken Crowns', species: 'treasure_diver', rarity: 'legendary',
    description: 'The guardian of all sunken treasure, ruler of the drowned kingdoms beneath the waves.',
    lore: 'The Lord of Sunken Crowns wears a crown forged from every legendary treasure ever lost at sea.',
    emoji: '🤿', power: 110, defense: 130, cost: 2900, xpReward: 290,
  },
  {
    id: 'kraken_tamer_legendary', name: 'Titan of the Deep', species: 'kraken_tamer', rarity: 'legendary',
    description: 'A being so attuned to sea monsters that the ocean itself obeys their command.',
    lore: 'The Titan of the Deep can summon every sea creature within a hundred leagues with a single thought.',
    emoji: '🐙', power: 108, defense: 110, cost: 3100, xpReward: 310,
  },
  {
    id: 'navigator_owl_legendary', name: 'Star-Chart Eternal', species: 'navigator_owl', rarity: 'legendary',
    description: 'The ancient owl whose wings span constellations, mapping the universe itself.',
    lore: 'The Star-Chart Eternal flies between dimensions, leaving trails of stardust that become new navigation routes.',
    emoji: '🦉', power: 112, defense: 100, cost: 2900, xpReward: 290,
  },
  {
    id: 'corsair_fox_legendary', name: 'The Immortal Corsair', species: 'corsair_fox', rarity: 'legendary',
    description: 'The undying fox pirate who has sailed every sea in every age, immortal and relentless.',
    lore: 'The Immortal Corsair cannot be killed, captured, or contained — they are the sea\'s own trickster spirit.',
    emoji: '🦊', power: 118, defense: 98, cost: 3500, xpReward: 350,
  },
];

// ============================================================
// SECTION 6: TT_CHAMBERS — 8 Port Destinations
// ============================================================

const TT_CHAMBERS: TtChamberDef[] = [
  {
    id: 'harbor_bay', name: 'Harbor Bay', emoji: '⚓',
    description: 'A bustling home port with friendly merchants and calm waters for resupply.',
    lore: 'Harbor Bay is the safest port in all the seas — its waters have never known a storm since the First Anchor was placed.',
    level: 1, resources: ['driftwood', 'sea_salt', 'sail_canvas'], capacity: 10,
    unlockLevel: 1, ambientColor: TT_OCEAN_BLUE, dangerLevel: 1,
  },
  {
    id: 'coral_market', name: 'Coral Market', emoji: '🐚',
    description: 'A vibrant underwater marketplace built inside a massive living coral reef.',
    lore: 'Coral Market was founded by mer-merchants who discovered that living coral could be shaped into shops.',
    level: 3, resources: ['coral_fragment', 'pearl_dust', 'silk_seaweed'], capacity: 15,
    unlockLevel: 3, ambientColor: TT_CORAL_PINK, dangerLevel: 2,
  },
  {
    id: 'storm_isle', name: 'Storm Isle', emoji: '⛈️',
    description: 'A perpetually storm-shrouded island where storm mages conduct their training rituals.',
    lore: 'Storm Isle is where the first Tempest Caller was born — the island itself generates the storms as a defense.',
    level: 5, resources: ['lightning_glass', 'storm_crystal', 'thunder_feather'], capacity: 20,
    unlockLevel: 5, ambientColor: TT_STORM_GRAY, dangerLevel: 3,
  },
  {
    id: 'kraken_deep', name: 'Kraken Deep', emoji: '🌊',
    description: 'A lightless trench where the Kraken Lord sleeps, guarded by monstrous deep-sea creatures.',
    lore: 'The Kraken Deep is so far below the surface that water pressure alone would crush any ordinary ship.',
    level: 10, resources: ['abyssal_ink', 'deep_pearl', 'trench_bone'], capacity: 25,
    unlockLevel: 10, ambientColor: TT_DEEP_SEA, dangerLevel: 4,
  },
  {
    id: 'merchant_peak', name: 'Merchant Peak', emoji: '🏔️',
    description: 'A mountainous island peak where the richest trade guilds hold their grand auctions.',
    lore: 'Merchant Peak\'s auction house has seen treasures exchanged that could buy entire kingdoms.',
    level: 15, resources: ['saffron_thread', 'jade_trinket', 'ambergris'], capacity: 30,
    unlockLevel: 15, ambientColor: TT_GOLD_COIN, dangerLevel: 5,
  },
  {
    id: 'treasure_cove', name: 'Treasure Cove', emoji: '💰',
    description: 'A hidden cove overflowing with shipwreck loot and legendary sunken treasures.',
    lore: 'Treasure Cove can only be found by following the bioluminescent trail of ancient navigator owls.',
    level: 20, resources: ['gold_doubloon', 'emerald_scale', 'cursed_coin'], capacity: 35,
    unlockLevel: 20, ambientColor: '#27AE60', dangerLevel: 6,
  },
  {
    id: 'fog_hollow', name: 'Fog Hollow', emoji: '🌫️',
    description: 'A mysterious fog-shrouded archipelago where ghost ships drift between the islands.',
    lore: 'Fog Hollow\'s fog is alive — it whispers secrets of sunken ships and guides the worthy to treasure.',
    level: 30, resources: ['spectral_mast', 'fog_crystal', 'phantom_silk'], capacity: 40,
    unlockLevel: 30, ambientColor: TT_STORM_GRAY, dangerLevel: 8,
  },
  {
    id: 'legendary_port', name: 'Legendary Port', emoji: '🏰',
    description: 'The fabled last port at the edge of the world, where the greatest captains gather.',
    lore: 'Legendary Port exists outside normal time — a ship that docks here may return to find decades have passed.',
    level: 40, resources: ['world_anchor', 'eternal_compass', 'tide_crown'], capacity: 50,
    unlockLevel: 40, ambientColor: '#FFD700', dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: TT_MATERIALS — 12 Trade Materials
// ============================================================

const TT_MATERIALS: TtMaterialDef[] = [
  // ── Common (3) ─────────────────────────────────────────────────
  {
    id: 'driftwood', name: 'Driftwood', emoji: '🪵', rarity: 'common', value: 5,
    category: 'wood', tradeBonus: 1,
    description: 'Weathered wood washed ashore from distant lands, still useful for ship repairs.',
    lore: 'Every piece of driftwood has a story — sailors read the grain like a map to trace its origin.',
  },
  {
    id: 'sea_salt', name: 'Sea Salt', emoji: '🧂', rarity: 'common', value: 4,
    category: 'food', tradeBonus: 1,
    description: 'Pure salt harvested from evaporated seawater, essential for preserving provisions.',
    lore: 'Sea Salt from the Open Waters is said to preserve not just food but memories.',
  },
  {
    id: 'sail_canvas', name: 'Sail Canvas', emoji: '🧶', rarity: 'common', value: 5,
    category: 'fabric', tradeBonus: 2,
    description: 'Sturdy canvas woven from sea hemp, the primary material for ship sails.',
    lore: 'The finest Sail Canvas is woven by blind weavers who feel the threads rather than see them.',
  },

  // ── Uncommon (3) ────────────────────────────────────────────────
  {
    id: 'coral_fragment', name: 'Coral Fragment', emoji: '🪸', rarity: 'uncommon', value: 15,
    category: 'gem', tradeBonus: 3,
    description: 'A chunk of living coral that pulses with vibrant colors and oceanic energy.',
    lore: 'Coral Fragments continue to grow after being harvested, slowly forming new reef structures on any surface.',
  },
  {
    id: 'pearl_dust', name: 'Pearl Dust', emoji: '✨', rarity: 'uncommon', value: 12,
    category: 'gem', tradeBonus: 2,
    description: 'Fine powder ground from freshwater pearls, used in potions and alchemy.',
    lore: 'Pearl Dust is the key ingredient in the brew that lets Treasure Divers breathe underwater.',
  },
  {
    id: 'silk_seaweed', name: 'Silk Seaweed', emoji: '🌿', rarity: 'uncommon', value: 14,
    category: 'fabric', tradeBonus: 3,
    description: 'An incredibly soft seaweed that can be woven into fabric stronger than steel.',
    lore: 'Silk Seaweed garments are worn by the richest sea merchants — they shimmer with an inner bioluminescence.',
  },

  // ── Rare (2) ──────────────────────────────────────────────────
  {
    id: 'lightning_glass', name: 'Lightning Glass', emoji: '⚡', rarity: 'rare', value: 50,
    category: 'gem', tradeBonus: 6,
    description: 'Glass formed when lightning strikes ocean sand, crackling with trapped electrical energy.',
    lore: 'Lightning Glass is used by Storm Mages to store electrical charges for their most powerful spells.',
  },
  {
    id: 'deep_pearl', name: 'Deep Pearl', emoji: '🔮', rarity: 'rare', value: 55,
    category: 'gem', tradeBonus: 7,
    description: 'A luminous pearl from the deepest ocean trenches, glowing with bioluminescent light.',
    lore: 'Deep Pearls are so rare that each one is given a name and recorded in the Treasure Diver\'s Great Ledger.',
  },

  // ── Epic (2) ─────────────────────────────────────────────────
  {
    id: 'gold_doubloon', name: 'Gold Doubloon', emoji: '🪙', rarity: 'epic', value: 150,
    category: 'metal', tradeBonus: 12,
    description: 'A solid gold coin from a legendary sunken treasure fleet, radiating ancient power.',
    lore: 'Gold Doubloons from the Lost Armada are worth ten times their weight in ordinary gold.',
  },
  {
    id: 'cursed_coin', name: 'Cursed Coin', emoji: '💀', rarity: 'epic', value: 160,
    category: 'metal', tradeBonus: 13,
    description: 'A coin imbued with a sea curse that grants immense power at a terrible price.',
    lore: 'Cursed Coins whisper the location of sunken treasure to their bearers — but demand payment in return.',
  },

  // ── Legendary (2) ────────────────────────────────────────────
  {
    id: 'world_anchor', name: 'World Anchor', emoji: '⚓', rarity: 'legendary', value: 600,
    category: 'metal', tradeBonus: 25,
    description: 'A fragment of the Anchor of Worlds, the chain that holds all oceans together.',
    lore: 'The World Anchor predates the oceans — it was forged before water existed to tether the seas to the earth.',
  },
  {
    id: 'tide_crown', name: 'Tide Crown', emoji: '👑', rarity: 'legendary', value: 700,
    category: 'gem', tradeBonus: 28,
    description: 'The crown of the Drowned King, granting dominion over every wave and current.',
    lore: 'Whoever wears the Tide Crown can part the seas with a thought and command every creature beneath the waves.',
  },
];

// ============================================================
// SECTION 8: TT_STRUCTURES — 8 Ship Structures (upgradeable to level 10)
// ============================================================

const TT_STRUCTURES: TtStructureDef[] = [
  {
    id: 'captain_cabin', name: 'Captain\'s Cabin', emoji: '🚪',
    description: 'A luxurious captain\'s quarters that boosts crew morale and leadership bonuses.',
    lore: 'The finest Captain\'s Cabins are paneled with driftwood from the mythical First Ship.',
    baseCost: 50, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'hireDiscount', bonusPerLevel: 2,
  },
  {
    id: 'cargo_hold', name: 'Cargo Hold', emoji: '📦',
    description: 'An expanded cargo bay for storing more trade goods and materials per voyage.',
    lore: 'The Cargo Hold of the Emperor of the Seven Seas was so vast it contained an entire indoor marketplace.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'capacityBonus', bonusPerLevel: 5,
  },
  {
    id: 'crow_nest', name: 'Crow\'s Nest', emoji: '🔭',
    description: 'An elevated observation platform that reveals distant ports and incoming threats.',
    lore: 'Crow\'s Nests enchanted by Navigator Owls can see through fog, storms, and even across time.',
    baseCost: 100, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'voyageBonus', bonusPerLevel: 5,
  },
  {
    id: 'ship_armory', name: 'Ship Armory', emoji: '⚔️',
    description: 'An onboard armory stocked with weapons and armor for the entire crew.',
    lore: 'The Ship Armory of the Immortal Corsair contains weapons forged from the bones of sea monsters.',
    baseCost: 70, costMultiplier: 1.4, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 3,
  },
  {
    id: 'galley_kitchen', name: 'Galley Kitchen', emoji: '🍲',
    description: 'A well-equipped ship kitchen that prepares feasts to heal and boost the crew.',
    lore: 'Galley Kitchens on legendary ships can prepare meals that restore youth and cure any sea sickness.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'healingBonus', bonusPerLevel: 4,
  },
  {
    id: 'anchor_forge', name: 'Anchor Forge', emoji: '🔨',
    description: 'A magical forge below deck for crafting ship upgrades and enchanted equipment.',
    lore: 'The Anchor Forge burns with deep-sea volcanic fire that never extinguishes, even underwater.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'tradeQuality', bonusPerLevel: 6,
  },
  {
    id: 'sail_loft', name: 'Sail Loft', emoji: '🧵',
    description: 'A specialized workshop for weaving enchanted sails that harness wind and storm energy.',
    lore: 'Sails woven in the Sail Loft can catch winds that don\'t exist, propelling ships against the current.',
    baseCost: 200, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'speedBonus', bonusPerLevel: 6,
  },
  {
    id: 'figurehead_shrine', name: 'Figurehead Shrine', emoji: '🗿',
    description: 'A shrine built into the ship\'s figurehead, granting divine protection and abilities.',
    lore: 'The Figurehead Shrine channels the power of the sea gods themselves, protecting the ship from any harm.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 5,
  },
];

// ============================================================
// SECTION 9: TT_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const TT_ABILITIES: TtAbilityDef[] = [
  // ── Offensive (2) ────────────────────────────────────────────────
  {
    id: 'cannon_barrage', name: 'Cannon Barrage', category: 'offensive',
    description: 'Unleashes a devastating volley of enchanted cannonballs that shatter enemy hulls.',
    lore: 'Cannon Barrage was invented by the Immortal Corsair, who loaded their cannons with cursed coins for extra punch.',
    emoji: '💣', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'kraken_strike', name: 'Kraken Strike', category: 'offensive',
    description: 'Summons a massive tentacle from the deep to crush and capsize enemy vessels.',
    lore: 'Kraken Strike channels the raw fury of the Kraken Lord through a temporary dimensional rift.',
    emoji: '🐙', cooldown: 12000, power: 80, rarityRequired: 'epic',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'reef_shield', name: 'Reef Shield', category: 'defensive',
    description: 'Raises a barrier of enchanted coral around the ship that absorbs incoming damage.',
    lore: 'Reef Shields grow thicker with each impact, converting absorbed damage into living coral armor.',
    emoji: '🪸', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'storm_veil', name: 'Storm Veil', category: 'defensive',
    description: 'Wraps the ship in a veil of storm clouds that deflects attacks and obscures vision.',
    lore: 'Storm Veils are so thick that enemy ships fire blindly, often hitting their own vessels.',
    emoji: '⛈️', cooldown: 15000, power: 70, rarityRequired: 'rare',
  },

  // ── Utility (2) ─────────────────────────────────────────────────
  {
    id: 'fair_wind', name: 'Fair Wind', category: 'utility',
    description: 'Summons a magical tailwind that doubles the ship\'s speed for a short duration.',
    lore: 'Fair Wind was the first spell ever cast by the original Star-Chart Eternal to guide the First Ship.',
    emoji: '🌬️', cooldown: 3000, power: 10, rarityRequired: 'common',
  },
  {
    id: 'tide_sense', name: 'Tide Sense', category: 'utility',
    description: 'Reads the ocean currents to reveal the safest and most profitable trade routes.',
    lore: 'Tide Sense lets the user feel every current in the ocean, from the gentlest stream to the mightiest gulf stream.',
    emoji: '🌊', cooldown: 10000, power: 20, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'dolphin_scout', name: 'Dolphin Scout', category: 'summon',
    description: 'Summons a pod of enchanted dolphins to scout ahead and report enemy positions.',
    lore: 'Dolphin Scouts communicate through complex songs that only Navigator Owls can translate.',
    emoji: '🐬', cooldown: 20000, power: 55, rarityRequired: 'rare',
  },
  {
    id: 'ghost_fleet', name: 'Ghost Fleet', category: 'summon',
    description: 'Calls spectral ships from the depths to fight alongside your vessel briefly.',
    lore: 'The Ghost Fleet consists of every ship that ever sank carrying a Cursed Coin — their crews bound to eternal service.',
    emoji: '👻', cooldown: 25000, power: 40, rarityRequired: 'uncommon',
  },
];

// ============================================================
// SECTION 10: TT_ACHIEVEMENTS — 10 Achievements
// ============================================================

const TT_ACHIEVEMENTS: TtAchievementDef[] = [
  {
    id: 'ach_first_hire', name: 'First Recruit', emoji: '🫡',
    description: 'Hire your first crew member and begin your legendary voyage.',
    conditionKey: 'totalHired', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_hire_10', name: 'Full Crew', emoji: '👷',
    description: 'Hire 10 crew members to fill your ship\'s essential positions.',
    conditionKey: 'totalHired', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_hire_25', name: 'Fleet Commander', emoji: '🏅',
    description: 'Hire 25 crew members and earn the rank of Fleet Commander.',
    conditionKey: 'totalHired', targetValue: 25, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_voyage_3', name: 'Port Hopper', emoji: '⛴️',
    description: 'Sail to 3 different ports and begin your trading network.',
    conditionKey: 'totalVoyages', targetValue: 3, rewardXp: 100, rewardCoins: 15,
  },
  {
    id: 'ach_voyage_all', name: 'World Traveler', emoji: '🗺️',
    description: 'Visit all 8 port destinations and complete your world map.',
    conditionKey: 'totalVoyages', targetValue: 8, rewardXp: 1000, rewardCoins: 50,
  },
  {
    id: 'ach_build_3', name: 'Shipwright', emoji: '🔨',
    description: 'Build 3 different ship structures to upgrade your vessel.',
    conditionKey: 'totalStructuresBuilt', targetValue: 3, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_artifact_1', name: 'Treasure Hunter', emoji: '💎',
    description: 'Activate your first legendary artifact and unlock its maritime power.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 300, rewardCoins: 30,
  },
  {
    id: 'ach_event_5', name: 'Storm Survivor', emoji: '🌊',
    description: 'Survive 5 random voyage events without losing your ship.',
    conditionKey: 'totalEvents', targetValue: 5, rewardXp: 300, rewardCoins: 20,
  },
  {
    id: 'ach_level_25', name: 'Seasoned Captain', emoji: '🧭',
    description: 'Reach captain level 25 and gain access to the most dangerous waters.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 800, rewardCoins: 50,
  },
  {
    id: 'ach_level_50', name: 'Grand Admiral', emoji: '👑',
    description: 'Reach the maximum captain level 50 and master every ocean.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 100,
  },
];

// ============================================================
// SECTION 11: TT_TITLES — 8 Title Progression
// ============================================================

const TT_TITLES: TtTitleDef[] = [
  {
    id: 'title_deckhand', name: 'Deckhand', emoji: '🪵',
    description: 'A lowly deckhand scrubbing boards and dreaming of the open sea.',
    lore: 'Every Grand Admiral once stood on deck as a nobody, scrubbing planks and gazing at the horizon.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_cabin_boy', name: 'Cabin Boy', emoji: '👧',
    description: 'A cabin boy learning the ropes and proving their worth to the crew.',
    lore: 'Cabin Boys who pay attention learn more in a week than sailors learn in a year.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_able_seaman', name: 'Able Seaman', emoji: '⚓',
    description: 'A competent sailor trusted with critical duties on the voyage.',
    lore: 'Able Seamen can splice any rope, tie any knot, and read any chart in any weather.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_boatswain', name: 'Boatswain', emoji: '📯',
    description: 'The boatswain who commands the deck crew and maintains the ship.',
    lore: 'Boatswains are the heart of the crew — their whistle commands more respect than the captain\'s voice.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_first_mate', name: 'First Mate', emoji: '🗡️',
    description: 'The trusted first mate who can captain the ship in the commander\'s absence.',
    lore: 'First Mates are chosen not for skill alone but for the absolute trust of the captain.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_captain', name: 'Captain', emoji: '🚢',
    description: 'A full captain commanding their own vessel across the open seas.',
    lore: 'Captains are recognized by every port authority — their ship\'s name is known across every ocean.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_commodore', name: 'Commodore', emoji: '🚢',
    description: 'A commodore commanding a squadron of vessels on critical missions.',
    lore: 'Commodores fly a special pennant — a golden anchor on a field of storm gray.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_grand_admiral', name: 'Grand Admiral', emoji: '👑',
    description: 'The supreme Grand Admiral, ruler of all fleets and master of every sea.',
    lore: 'The Grand Admiral holds the Tide Crown and the Anchor of Worlds — there is no port that denies them entry.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: TT_ARTIFACTS — 6 Artifacts
// ============================================================

const TT_ARTIFACTS: TtArtifactDef[] = [
  {
    id: 'art_everlasting_compass', name: 'Everlasting Compass',
    description: 'A compass that always points toward the nearest treasure, no matter how well hidden.',
    lore: 'The Everlasting Compass was forged by the first Navigator Owl from a fragment of the North Star.',
    emoji: '🧭', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_siren_shell', name: 'Siren Shell',
    description: 'A conch shell that when blown, calls favorable winds and calms turbulent seas.',
    lore: 'The Siren Shell was a gift from the Siren Queen to the first Sea Captain who earned her trust.',
    emoji: '🐚', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_storm_bottle', name: 'Bottled Storm',
    description: 'A glass bottle containing a miniature hurricane that can be unleashed on command.',
    lore: 'The Bottled Storm was captured by the Worldbreaker Tempest during a fit of creative inspiration.',
    emoji: '🧴', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_kraken_eye', name: 'Kraken Eye',
    description: 'The crystallized eye of an ancient kraken, granting sight through the deepest waters.',
    lore: 'The Kraken Eye sees everything in the ocean — past, present, and future shipwrecks alike.',
    emoji: '👁️', rarity: 'epic', powerBonus: 35, cost: 1800,
  },
  {
    id: 'art_world_anchor_fragment', name: 'World Anchor Fragment',
    description: 'A shard of the Anchor of Worlds, radiating power that stabilizes the seas around the ship.',
    lore: 'Each World Anchor Fragment was broken from the original anchor when the continents first drifted apart.',
    emoji: '⚓', rarity: 'legendary', powerBonus: 60, cost: 5000,
  },
  {
    id: 'art_tide_crown_shard', name: 'Tide Crown Shard',
    description: 'A fragment of the Drowned King\'s crown, pulsing with the power to command the tides.',
    lore: 'The Tide Crown was shattered into seven shards when the Drowned King fell — reuniting them grants absolute dominion.',
    emoji: '👑', rarity: 'legendary', powerBonus: 75, cost: 8000,
  },
];

// ============================================================
// SECTION 13: TT_EVENTS — 8 Random Voyage Events
// ============================================================

const TT_EVENTS: TtEventDef[] = [
  {
    id: 'evt_pirate_raid', name: 'Pirate Raid',
    description: 'A pirate fleet appears on the horizon, cannons loaded and ready to board.',
    lore: 'Pirate Raids are common in the trade lanes — only the fastest and best-armed ships survive.',
    emoji: '🏴‍☠️', effectType: 'debuff', duration: 30000, rewardXp: 40, rewardCoins: 10,
    rewardMaterialId: 'driftwood', rewardMaterialCount: 5,
  },
  {
    id: 'evt_whale_sighting', name: 'Whale Sighting',
    description: 'A pod of majestic whales surfaces alongside the ship, bringing good fortune.',
    lore: 'Whale Sightings are considered the best omen a sailor can receive — they bring calm seas and fair winds.',
    emoji: '🐋', effectType: 'buff', duration: 30000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'pearl_dust', rewardMaterialCount: 5,
  },
  {
    id: 'evt_storm_front', name: 'Storm Front',
    description: 'A massive storm front engulfs the ship with towering waves and blinding rain.',
    lore: 'Storm Fronts test every sailor\'s courage — those who survive earn a respect that lasts a lifetime.',
    emoji: '⛈️', effectType: 'buff', duration: 20000, rewardXp: 25, rewardCoins: 30,
    rewardMaterialId: 'lightning_glass', rewardMaterialCount: 6,
  },
  {
    id: 'evt_sunken_treasure', name: 'Sunken Treasure',
    description: 'A glint beneath the waves reveals a sunken chest overflowing with gold and gems.',
    lore: 'Sunken Treasures are protected by the ocean itself — only the worthy can retrieve them.',
    emoji: '💰', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 50,
    rewardMaterialId: 'gold_doubloon', rewardMaterialCount: 4,
  },
  {
    id: 'evt_mermaid_encounter', name: 'Mermaid Encounter',
    description: 'Merfolk rise from the depths, offering rare sea gifts in exchange for stories.',
    lore: 'Mermaid Encounters always end with the merfolk laughing — they find human stories endlessly amusing.',
    emoji: '🧜', effectType: 'buff', duration: 25000, rewardXp: 35, rewardCoins: 15,
    rewardMaterialId: 'coral_fragment', rewardMaterialCount: 3,
  },
  {
    id: 'evt_sea_monster', name: 'Sea Monster Attack',
    description: 'A colossal sea monster erupts from the deep, jaws wide enough to swallow the ship.',
    lore: 'Sea Monster Attacks are rare but devastating — the survivors\' tales grow more exaggerated with each retelling.',
    emoji: '🐉', effectType: 'debuff', duration: 20000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'trench_bone', rewardMaterialCount: 2,
  },
  {
    id: 'evt_ghost_ship', name: 'Ghost Ship',
    description: 'A spectral galleon materializes from the fog, its ghostly crew hailing your vessel.',
    lore: 'Ghost Ships carry messages from drowned sailors — sometimes warnings, sometimes treasures, always cryptic.',
    emoji: '👻', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 0,
    rewardMaterialId: 'spectral_mast', rewardMaterialCount: 2,
  },
  {
    id: 'evt_fog_bank', name: 'Dense Fog Bank',
    description: 'An unnatural fog envelops the ship, disorienting the crew and obscuring all landmarks.',
    lore: 'Fog Banks that appear without warning are said to be the breath of the Drowned King, searching for his lost crown.',
    emoji: '🌫️', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 25,
    rewardMaterialId: 'fog_crystal', rewardMaterialCount: 8,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function ttGenerateInstanceId(): string {
  return `tt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function ttPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function ttCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function ttCalculateLevelUp(needed: number, current: number, gained: number, setLevel: React.Dispatch<React.SetStateAction<number>>): number {
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

export default function useTradeVessel() {
  // ---- Core State ----
  const [ttLevel, setTtLevel] = useState(1);
  const [ttXp, setTtXp] = useState(TT_STARTING_XP);
  const [ttCoins, setTtCoins] = useState(TT_STARTING_COINS);
  const [ttTotalXp, setTtTotalXp] = useState(0);
  const [ttTotalCoins, setTtTotalCoins] = useState(0);

  // ---- Collection State ----
  const [ttCrew, setTtCrew] = useState<TtOwnedCreature[]>([]);
  const [ttInventory, setTtInventory] = useState<TtInventoryItem[]>([]);
  const [ttStructures, setTtStructures] = useState<TtStructureRecord[]>([]);
  const [ttArtifacts, setTtArtifacts] = useState<TtArtifactRecord[]>([]);
  const [ttAbilities, setTtAbilities] = useState<TtAbilityRecord[]>([]);
  const [ttAchievements, setTtAchievements] = useState<TtAchievementRecord[]>([]);
  const [ttChambers, setTtChambers] = useState<TtChamberRecord[]>([]);
  const [ttEventLog, setTtEventLog] = useState<TtEventLogEntry[]>([]);
  const [ttActiveEvent, setTtActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [ttCurrentTitle, setTtCurrentTitle] = useState('title_deckhand');

  // ---- Stats State ----
  const [ttStats, setTtStats] = useState<TtStats>({
    totalHired: 0,
    totalVoyages: 0,
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
    ttLevel, ttXp, ttTotalXp, ttTotalCoins, ttCrew, ttInventory,
    ttStructures, ttArtifacts, ttAbilities, ttAchievements,
    ttChambers, ttEventLog, ttActiveEvent, ttCurrentTitle, ttStats,
  });

  // ============================================================
  // STATE REF SYNC
  // ============================================================

  useEffect(() => {
    stateRef.current = {
      ttLevel, ttXp, ttTotalXp, ttTotalCoins, ttCrew, ttInventory,
      ttStructures, ttArtifacts, ttAbilities, ttAchievements,
      ttChambers, ttEventLog, ttActiveEvent, ttCurrentTitle, ttStats,
    };
  }, [ttLevel, ttXp, ttTotalXp, ttTotalCoins, ttCrew, ttInventory,
    ttStructures, ttArtifacts, ttAbilities, ttAchievements,
    ttChambers, ttEventLog, ttActiveEvent, ttCurrentTitle, ttStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(TT_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.ttLevel) setTtLevel(data.ttLevel);
        if (data.ttXp) setTtXp(data.ttXp);
        if (data.ttCoins) setTtCoins(data.ttCoins);
        if (data.ttTotalXp) setTtTotalXp(data.ttTotalXp);
        if (data.ttTotalCoins) setTtTotalCoins(data.ttTotalCoins);
        if (data.ttCrew) setTtCrew(data.ttCrew);
        if (data.ttInventory) setTtInventory(data.ttInventory);
        if (data.ttStructures) setTtStructures(data.ttStructures);
        if (data.ttArtifacts) setTtArtifacts(data.ttArtifacts);
        if (data.ttAbilities) setTtAbilities(data.ttAbilities);
        if (data.ttAchievements) setTtAchievements(data.ttAchievements);
        if (data.ttChambers) setTtChambers(data.ttChambers);
        if (data.ttEventLog) setTtEventLog(data.ttEventLog);
        if (data.ttActiveEvent) setTtActiveEvent(data.ttActiveEvent);
        if (data.ttCurrentTitle) setTtCurrentTitle(data.ttCurrentTitle);
        if (data.ttStats) setTtStats(data.ttStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setTtChambers(
      TT_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setTtAbilities(
      TT_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setTtAchievements(
      TT_ACHIEVEMENTS.map((a) => ({
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
          ttLevel, ttXp, ttCoins, ttTotalXp, ttTotalCoins,
          ttCrew, ttInventory, ttStructures, ttArtifacts,
          ttAbilities, ttAchievements, ttChambers, ttEventLog,
          ttActiveEvent, ttCurrentTitle, ttStats,
        };
        localStorage.setItem(TT_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, TT_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [ttLevel, ttXp, ttCoins, ttTotalXp, ttTotalCoins,
    ttCrew, ttInventory, ttStructures, ttArtifacts,
    ttAbilities, ttAchievements, ttChambers, ttEventLog,
    ttActiveEvent, ttCurrentTitle, ttStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!ttActiveEvent) return;
    const evt = TT_EVENTS.find((e) => e.id === ttActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setTtActiveEvent(null);
      setTtEventLog((prev) =>
        prev.map((e) => (e.eventId === ttActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [ttActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...TT_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => ttLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === ttCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setTtCurrentTitle(nextTitle.id);
    }
  }, [ttLevel, ttCurrentTitle]);

  // ============================================================
  // COMPUTED: ttMaxXp
  // ============================================================

  const ttMaxXp = useMemo(() => {
    return Math.floor(TT_XP_BASE * Math.pow(ttLevel + 1, TT_XP_SCALE));
  }, [ttLevel]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(TT_XP_BASE * Math.pow(lvl, TT_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(ttLevel + 1);
    return Math.max(0, needed - ttXp);
  }, [ttLevel, ttXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(ttLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((ttXp / needed) * 100), 100);
  }, [ttLevel, ttXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getCreatureDef = useCallback((id: string): TtCreatureDef | undefined => {
    return TT_CREATURES.find((c) => c.id === id);
  }, []);

  const getChamberDef = useCallback((id: string): TtChamberDef | undefined => {
    return TT_CHAMBERS.find((c) => c.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): TtMaterialDef | undefined => {
    return TT_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): TtStructureDef | undefined => {
    return TT_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): TtAbilityDef | undefined => {
    return TT_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): TtArtifactDef | undefined => {
    return TT_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): TtAchievementDef | undefined => {
    return TT_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): TtTitleDef | undefined => {
    return TT_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): TtEventDef | undefined => {
    return TT_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: TtRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: TtRarity): string => {
    return TT_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: TtSpecies): string => {
    return TT_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: hireCrew
  // ============================================================

  const hireCrew = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (ttCoins < def.cost) return false;
    if (ttCrew.length >= TT_MAX_OWNED_CREATURES) return false;

    const newCrew: TtOwnedCreature = {
      creatureId: def.id,
      instanceId: ttGenerateInstanceId(),
      hiredAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setTtCoins((prev) => prev - def.cost);
    setTtCrew((prev) => [...prev, newCrew]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = ttCalculateLevelUp(
      xpForLevel(ttLevel + 1),
      ttXp,
      xpGained,
      setTtLevel,
    );
    setTtXp(overflow);
    setTtTotalXp((prev) => prev + xpGained);
    setTtTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setTtStats((prev) => ({ ...prev, totalHired: prev.totalHired + 1 }));
    return true;
  }, [ttCoins, ttLevel, ttXp, ttCrew.length, getCreatureDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: sailToPort
  // ============================================================

  const sailToPort = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    if (ttLevel < def.unlockLevel) return false;

    setTtChambers((prev) =>
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

    const bonusMat = ttPickRandom(def.resources);
    if (bonusMat) {
      setTtInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat
              ? { ...i, count: Math.min(i.count + 1, TT_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setTtTotalXp((prev) => prev + 15);
    setTtTotalCoins((prev) => prev + 5);
    setTtStats((prev) => ({ ...prev, totalVoyages: prev.totalVoyages + 1 }));
    return true;
  }, [ttLevel, getChamberDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = ttStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = ttCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (ttCoins < cost) return false;

    setTtCoins((prev) => prev - cost);
    setTtStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setTtTotalXp((prev) => prev + 20);
    setTtStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [ttCoins, ttStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (ttCoins < def.cost) return false;
    if (ttArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setTtCoins((prev) => prev - def.cost);
    setTtArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setTtTotalXp((prev) => prev + 100);
    setTtStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [ttCoins, ttArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerVoyageEvent
  // ============================================================

  const triggerVoyageEvent = useCallback((): TtEventDef | null => {
    if (ttActiveEvent) return null;
    const event = ttPickRandom(TT_EVENTS);
    setTtActiveEvent(event.id);
    setTtEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setTtTotalXp((prev) => prev + event.rewardXp);
    setTtCoins((prev) => prev + event.rewardCoins);
    setTtTotalCoins((prev) => prev + event.rewardCoins);
    setTtStats((prev) => ({ ...prev, totalEvents: prev.totalEvents + 1 }));

    if (event.rewardMaterialId) {
      const matId: string = event.rewardMaterialId;
      const matCount: number = event.rewardMaterialCount;
      setTtInventory((prev) => {
        const existing = prev.find((i) => i.materialId === matId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === matId
              ? { ...i, count: Math.min(i.count + matCount, TT_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: matId, count: matCount }];
      });
    }

    return event;
  }, [ttActiveEvent]);

  // ============================================================
  // CORE ACTION: resetTradeVessel
  // ============================================================

  const resetTradeVessel = useCallback(() => {
    setTtLevel(1);
    setTtXp(0);
    setTtCoins(TT_STARTING_COINS);
    setTtTotalXp(0);
    setTtTotalCoins(0);
    setTtCrew([]);
    setTtInventory([]);
    setTtStructures([]);
    setTtArtifacts([]);
    setTtAbilities(
      TT_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setTtAchievements(
      TT_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setTtChambers(
      TT_CHAMBERS.map((c) => ({
        chamberId: c.id,
        discovered: c.unlockLevel <= 1,
        explorationPercent: c.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setTtEventLog([]);
    setTtActiveEvent(null);
    setTtCurrentTitle('title_deckhand');
    setTtStats({
      totalHired: 0, totalVoyages: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(TT_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverPort
  // ============================================================

  const discoverPort = useCallback((chamberId: string): boolean => {
    return sailToPort(chamberId);
  }, [sailToPort]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setTtStats((currentStats) => {
      setTtAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalHired: currentStats.totalHired,
          totalVoyages: currentStats.totalVoyages,
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
            setTtTotalXp((xp) => xp + def.rewardXp);
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
    const record = ttAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setTtAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setTtTotalXp((prev) => prev + 5);
    return true;
  }, [ttAbilities, getAbilityDef]);

  // ============================================================
  // EXTENDED ACTION: dismissCrewMember
  // ============================================================

  const dismissCrewMember = useCallback((instanceId: string): boolean => {
    const idx = ttCrew.findIndex((c) => c.instanceId === instanceId);
    if (idx === -1) return false;
    const member = ttCrew[idx];
    const def = getCreatureDef(member.creatureId);
    const refund = def ? Math.floor(def.cost * 0.3) : 0;

    setTtCrew((prev) => prev.filter((c) => c.instanceId !== instanceId));
    if (refund > 0) {
      setTtCoins((prev) => prev + refund);
    }
    return true;
  }, [ttCrew, getCreatureDef]);

  // ============================================================
  // EXTENDED ACTION: renameCrewMember
  // ============================================================

  const renameCrewMember = useCallback((instanceId: string, nickname: string): boolean => {
    const exists = ttCrew.find((c) => c.instanceId === instanceId);
    if (!exists) return false;
    setTtCrew((prev) =>
      prev.map((c) =>
        c.instanceId === instanceId ? { ...c, nickname } : c,
      ),
    );
    return true;
  }, [ttCrew]);

  // ============================================================
  // EXTENDED ACTION: tradeMaterial
  // ============================================================

  const tradeMaterial = useCallback((materialId: string, count: number): number => {
    if (count <= 0) return 0;
    const def = getMaterialDef(materialId);
    if (!def) return 0;
    const actualCount = Math.min(count, ttInventory.find((i) => i.materialId === materialId)?.count || 0);
    if (actualCount <= 0) return 0;

    const coinsEarned = def.value * actualCount;
    setTtInventory((prev) => {
      const existing = prev.find((i) => i.materialId === materialId);
      if (existing) {
        return prev.map((i) =>
          i.materialId === materialId
            ? { ...i, count: i.count - actualCount }
            : i,
        ).filter((i) => i.count > 0);
      }
      return prev;
    });
    setTtCoins((prev) => prev + coinsEarned);
    setTtTotalCoins((prev) => prev + coinsEarned);
    setTtTotalXp((prev) => prev + Math.floor(coinsEarned * 0.05));
    return coinsEarned;
  }, [ttInventory, getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: spendCoins
  // ============================================================

  const spendCoins = useCallback((amount: number): boolean => {
    if (amount <= 0 || ttCoins < amount) return false;
    setTtCoins((prev) => prev - amount);
    return true;
  }, [ttCoins]);

  // ============================================================
  // EXTENDED ACTION: grantCoins
  // ============================================================

  const grantCoins = useCallback((amount: number): void => {
    if (amount <= 0) return;
    setTtCoins((prev) => prev + amount);
    setTtTotalCoins((prev) => prev + amount);
  }, []);

  // ============================================================
  // EXTENDED ACTION: grantXp
  // ============================================================

  const grantXp = useCallback((amount: number): void => {
    if (amount <= 0) return;
    const overflow = ttCalculateLevelUp(
      xpForLevel(ttLevel + 1),
      ttXp,
      amount,
      setTtLevel,
    );
    setTtXp(overflow);
    setTtTotalXp((prev) => prev + amount);
  }, [ttLevel, ttXp, xpForLevel]);

  // ============================================================
  // EXTENDED ACTION: addMaterial
  // ============================================================

  const addMaterial = useCallback((materialId: string, count: number): boolean => {
    if (count <= 0) return false;
    const def = getMaterialDef(materialId);
    if (!def) return false;
    setTtInventory((prev) => {
      const existing = prev.find((i) => i.materialId === materialId);
      if (existing) {
        return prev.map((i) =>
          i.materialId === materialId
            ? { ...i, count: Math.min(i.count + count, TT_MAX_INVENTORY_ITEM) }
            : i,
        );
      }
      return [...prev, { materialId, count: Math.min(count, TT_MAX_INVENTORY_ITEM) }];
    });
    return true;
  }, [getMaterialDef]);

  // ============================================================
  // EXTENDED ACTION: removeMaterial
  // ============================================================

  const removeMaterial = useCallback((materialId: string, count: number): boolean => {
    if (count <= 0) return false;
    const current = ttInventory.find((i) => i.materialId === materialId);
    if (!current || current.count < count) return false;
    setTtInventory((prev) => {
      return prev
        .map((i) =>
          i.materialId === materialId
            ? { ...i, count: i.count - count }
            : i,
        )
        .filter((i) => i.count > 0);
    });
    return true;
  }, [ttInventory]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const ttTitleProgress = useMemo((): TtTitleProgress => {
    const sorted = [...TT_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === ttCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === ttCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((ttLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [ttLevel, ttCurrentTitle]);

  const currentTitleInfo = useMemo(() => ttTitleProgress.current, [ttTitleProgress]);

  const nextTitleInfo = useMemo(() => ttTitleProgress.next, [ttTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    crewHired: ttCrew.length,
    portsVisited: ttChambers.filter((c) => c.discovered).length,
    structuresBuilt: ttStructures.length,
    artifactsActive: ttArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: ttAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: ttAbilities.filter((a) => a.unlocked).length,
    totalXp: ttTotalXp,
    totalCoins: ttTotalCoins,
    currentLevel: ttLevel,
    ownedSpeciesCount: new Set(ttCrew.map((c) => {
      const d = TT_CREATURES.find((cr) => cr.id === c.creatureId);
      return d?.species || '';
    })).size,
    totalEvents: ttEventLog.length,
  }), [ttCrew, ttChambers, ttStructures, ttArtifacts,
    ttAchievements, ttAbilities, ttTotalXp, ttTotalCoins, ttLevel, ttEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      TT_CREATURES.length +
      TT_CHAMBERS.length +
      TT_STRUCTURES.length +
      TT_ARTIFACTS.length +
      TT_ACHIEVEMENTS.length +
      TT_ABILITIES.length;
    const completed =
      ttCrew.length +
      ttChambers.filter((c) => c.discovered).length +
      ttStructures.length +
      ttArtifacts.filter((a) => a.activated).length +
      ttAchievements.filter((a) => a.unlocked).length +
      ttAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      crewPercent: Math.round((ttCrew.length / TT_CREATURES.length) * 100),
      portPercent: Math.round((ttChambers.filter((c) => c.discovered).length / TT_CHAMBERS.length) * 100),
      structurePercent: Math.round((ttStructures.length / TT_STRUCTURES.length) * 100),
      artifactPercent: Math.round((ttArtifacts.filter((a) => a.activated).length / TT_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((ttAchievements.filter((a) => a.unlocked).length / TT_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((ttAbilities.filter((a) => a.unlocked).length / TT_ABILITIES.length) * 100),
    };
  }, [ttCrew, ttChambers, ttStructures, ttArtifacts, ttAchievements, ttAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedCrew = useMemo(() =>
    ttCrew.map((c) => ({
      ...c,
      def: getCreatureDef(c.creatureId),
    })),
  [ttCrew, getCreatureDef]);

  const enrichedChambers = useMemo(() =>
    ttChambers.map((c) => ({
      ...c,
      def: getChamberDef(c.chamberId),
    })),
  [ttChambers, getChamberDef]);

  const enrichedStructures = useMemo(() =>
    ttStructures.map((s) => {
      const sDef = getStructureDef(s.structureId);
      const baseCost = sDef?.baseCost || 0;
      const costMult = sDef?.costMultiplier || 1;
      const bonus = sDef?.bonusPerLevel || 0;
      return {
        ...s,
        def: sDef,
        totalUpgrades: s.totalUpgrades,
        currentCost: ttCalculateStructureCost(baseCost, costMult, s.level),
        nextUpgradeCost: ttCalculateStructureCost(baseCost, costMult, s.level),
        bonusProvided: s.level * bonus,
      };
    }),
  [ttStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    ttInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [ttInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    ttArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [ttArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    ttAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [ttAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const crewByType = useMemo(() => {
    const result: Record<string, TtOwnedCreature[]> = {};
    for (const species of TT_SPECIES) {
      result[species.id] = ttCrew.filter((c) => {
        const def = getCreatureDef(c.creatureId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [ttCrew, getCreatureDef]);

  const crewByRarity = useMemo(() => {
    const rarities: TtRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, TtOwnedCreature[]> = {};
    for (const r of rarities) {
      result[r] = ttCrew.filter((c) => {
        const def = getCreatureDef(c.creatureId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [ttCrew, getCreatureDef]);

  const availableCandidates = useMemo(() => {
    return TT_CREATURES.filter((c) => c.cost <= ttCoins);
  }, [ttCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalHired: ttStats.totalHired,
      totalVoyages: ttStats.totalVoyages,
      totalStructuresBuilt: ttStats.totalStructuresBuilt,
      totalArtifacts: ttStats.totalArtifacts,
      totalEvents: ttStats.totalEvents,
      totalCoins: ttStats.totalCoins,
      totalXp: ttStats.totalXp,
    };
    return TT_ACHIEVEMENTS.filter(
      (a) =>
        !ttAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [ttStats, ttAchievements]);

  const recentEventLog = useMemo(() => {
    return [...ttEventLog].reverse().slice(0, 10);
  }, [ttEventLog]);

  const crewByPower = useMemo(() => {
    return [...ttCrew]
      .map((c) => ({ ...c, def: getCreatureDef(c.creatureId) }))
      .filter((c) => c.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [ttCrew, getCreatureDef]);

  const topCrew = useMemo(() => {
    return crewByPower.slice(0, 10);
  }, [crewByPower]);

  const crewSpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of ttCrew) {
      const def = getCreatureDef(c.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [ttCrew, getCreatureDef]);

  const portExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of ttChambers) {
      map[c.chamberId] = c.explorationPercent;
    }
    return map;
  }, [ttChambers]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of ttStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [ttStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of ttAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [ttAbilities]);

  // ============================================================
  // ADDITIONAL COMPUTED: Fleet Power
  // ============================================================

  const totalFleetPower = useMemo(() => {
    let total = 0;
    for (const c of ttCrew) {
      const def = getCreatureDef(c.creatureId);
      if (def) {
        total += def.power + def.defense;
      }
    }
    return total;
  }, [ttCrew, getCreatureDef]);

  const averageCrewPower = useMemo(() => {
    if (ttCrew.length === 0) return 0;
    return Math.round(totalFleetPower / ttCrew.length);
  }, [totalFleetPower, ttCrew.length]);

  const totalInventoryValue = useMemo(() => {
    let total = 0;
    for (const item of ttInventory) {
      if (item.count <= 0) continue;
      const def = getMaterialDef(item.materialId);
      if (def) {
        total += def.value * item.count;
      }
    }
    return total;
  }, [ttInventory, getMaterialDef]);

  const inventoryItemCount = useMemo(() => {
    return ttInventory.reduce((sum, item) => sum + item.count, 0);
  }, [ttInventory]);

  const inventoryUniqueItems = useMemo(() => {
    return ttInventory.filter((i) => i.count > 0).length;
  }, [ttInventory]);

  const totalStructureBonus = useMemo(() => {
    let total = 0;
    for (const s of ttStructures) {
      const def = getStructureDef(s.structureId);
      if (def) {
        total += s.level * def.bonusPerLevel;
      }
    }
    return total;
  }, [ttStructures, getStructureDef]);

  const totalArtifactPower = useMemo(() => {
    let total = 0;
    for (const a of ttArtifacts) {
      if (a.activated) {
        const def = getArtifactDef(a.artifactId);
        if (def) {
          total += def.powerBonus;
        }
      }
    }
    return total;
  }, [ttArtifacts, getArtifactDef]);

  const undiscoveredPorts = useMemo(() => {
    return TT_CHAMBERS.filter(
      (c) => !ttChambers.find((r) => r.chamberId === c.id && r.discovered),
    );
  }, [ttChambers]);

  const reachablePorts = useMemo(() => {
    return TT_CHAMBERS.filter((c) => c.unlockLevel <= ttLevel);
  }, [ttLevel]);

  const unaffordableArtifacts = useMemo(() => {
    return TT_ARTIFACTS.filter(
      (a) => a.cost > ttCoins && !ttArtifacts.find((r) => r.artifactId === a.id && r.activated),
    );
  }, [ttCoins, ttArtifacts]);

  const affordableArtifacts = useMemo(() => {
    return TT_ARTIFACTS.filter(
      (a) => a.cost <= ttCoins && !ttArtifacts.find((r) => r.artifactId === a.id && r.activated),
    );
  }, [ttCoins, ttArtifacts]);

  const crewRarityBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    const rarities: TtRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    for (const r of rarities) {
      counts[r] = 0;
    }
    for (const c of ttCrew) {
      const def = getCreatureDef(c.creatureId);
      if (def) {
        counts[def.rarity] = (counts[def.rarity] || 0) + 1;
      }
    }
    return counts;
  }, [ttCrew, getCreatureDef]);

  const materialsByCategory = useMemo(() => {
    const result: Record<string, TtInventoryItem[]> = {};
    for (const item of ttInventory) {
      if (item.count <= 0) continue;
      const def = getMaterialDef(item.materialId);
      if (def) {
        if (!result[def.category]) result[def.category] = [];
        result[def.category].push(item);
      }
    }
    return result;
  }, [ttInventory, getMaterialDef]);

  const materialsByRarity = useMemo(() => {
    const rarities: TtRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, TtInventoryItem[]> = {};
    for (const r of rarities) {
      result[r] = [];
    }
    for (const item of ttInventory) {
      if (item.count <= 0) continue;
      const def = getMaterialDef(item.materialId);
      if (def) {
        result[def.rarity].push(item);
      }
    }
    return result;
  }, [ttInventory, getMaterialDef]);

  const eventFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of ttEventLog) {
      counts[entry.eventId] = (counts[entry.eventId] || 0) + 1;
    }
    return counts;
  }, [ttEventLog]);

  const isLevelMaxed = useMemo(() => {
    return ttLevel >= TT_MAX_LEVEL;
  }, [ttLevel]);

  const canAffordAnyCreature = useMemo(() => {
    return TT_CREATURES.some((c) => c.cost <= ttCoins);
  }, [ttCoins]);

  const highestRarityOwned = useMemo((): TtRarity => {
    const order: TtRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    let highest: TtRarity = 'common';
    for (const c of ttCrew) {
      const def = getCreatureDef(c.creatureId);
      if (def) {
        const idx = order.indexOf(def.rarity);
        const hIdx = order.indexOf(highest);
        if (idx > hIdx) highest = def.rarity;
      }
    }
    return highest;
  }, [ttCrew, getCreatureDef]);

  const legendaryCrewCount = useMemo(() => {
    return ttCrew.filter((c) => {
      const def = getCreatureDef(c.creatureId);
      return def?.rarity === 'legendary';
    }).length;
  }, [ttCrew, getCreatureDef]);

  const portsFullyExplored = useMemo(() => {
    return ttChambers.filter((c) => c.explorationPercent >= 100).length;
  }, [ttChambers]);

  const activeEventInfo = useMemo(() => {
    if (!ttActiveEvent) return null;
    return getEventDef(ttActiveEvent) || null;
  }, [ttActiveEvent, getEventDef]);

  // ============================================================
  // ADDITIONAL HELPERS
  // ============================================================

  const canHire = useCallback((creatureId: string): boolean => {
    const def = getCreatureDef(creatureId);
    if (!def) return false;
    if (ttCoins < def.cost) return false;
    if (ttCrew.length >= TT_MAX_OWNED_CREATURES) return false;
    return true;
  }, [ttCoins, ttCrew.length, getCreatureDef]);

  const canSailTo = useCallback((chamberId: string): boolean => {
    const def = getChamberDef(chamberId);
    if (!def) return false;
    return ttLevel >= def.unlockLevel;
  }, [ttLevel, getChamberDef]);

  const canBuild = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = ttStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;
    const cost = ttCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    return ttCoins >= cost;
  }, [ttCoins, ttStructures, getStructureDef]);

  const canActivateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (ttCoins < def.cost) return false;
    if (ttArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;
    return true;
  }, [ttCoins, ttArtifacts, getArtifactDef]);

  const getStructureUpgradeCost = useCallback((structureId: string): number => {
    const def = getStructureDef(structureId);
    if (!def) return 0;
    const existing = ttStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    return ttCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
  }, [ttStructures, getStructureDef]);

  const getMaterialCount = useCallback((materialId: string): number => {
    return ttInventory.find((i) => i.materialId === materialId)?.count || 0;
  }, [ttInventory]);

  const hasMaterial = useCallback((materialId: string, count: number): boolean => {
    return (ttInventory.find((i) => i.materialId === materialId)?.count || 0) >= count;
  }, [ttInventory]);

  const getCrewMember = useCallback((instanceId: string): TtOwnedCreature | undefined => {
    return ttCrew.find((c) => c.instanceId === instanceId);
  }, [ttCrew]);

  const getChamberRecord = useCallback((chamberId: string): TtChamberRecord | undefined => {
    return ttChambers.find((c) => c.chamberId === chamberId);
  }, [ttChambers]);

  const getStructureRecord = useCallback((structureId: string): TtStructureRecord | undefined => {
    return ttStructures.find((s) => s.structureId === structureId);
  }, [ttStructures]);

  const isCrewNicknameUnique = useCallback((instanceId: string, nickname: string): boolean => {
    if (!nickname) return true;
    return !ttCrew.some((c) => c.instanceId !== instanceId && c.nickname === nickname);
  }, [ttCrew]);

  const daysSinceLastVoyage = useCallback((chamberId: string): number => {
    const record = ttChambers.find((c) => c.chamberId === chamberId);
    if (!record || record.lastExplored === 0) return -1;
    return Math.floor((Date.now() - record.lastExplored) / (1000 * 60 * 60 * 24));
  }, [ttChambers]);

  const totalResourcesGathered = useMemo(() => {
    return ttChambers.reduce((sum, c) => sum + c.resourcesGathered, 0);
  }, [ttChambers]);

  const totalVisitsAllPorts = useMemo(() => {
    return ttChambers.reduce((sum, c) => sum + c.totalVisits, 0);
  }, [ttChambers]);

  const averageExplorationPercent = useMemo(() => {
    if (ttChambers.length === 0) return 0;
    const total = ttChambers.reduce((sum, c) => sum + c.explorationPercent, 0);
    return Math.round(total / ttChambers.length);
  }, [ttChambers]);

  const crewHiredToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const timestamp = todayStart.getTime();
    return ttCrew.filter((c) => c.hiredAt >= timestamp).length;
  }, [ttCrew]);

  const eventsToday = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const timestamp = todayStart.getTime();
    return ttEventLog.filter((e) => e.triggeredAt >= timestamp).length;
  }, [ttEventLog]);

  const mostVisitedPort = useMemo((): string | null => {
    if (ttChambers.length === 0) return null;
    let max = 0;
    let portId: string | null = null;
    for (const c of ttChambers) {
      if (c.totalVisits > max) {
        max = c.totalVisits;
        portId = c.chamberId;
      }
    }
    return portId;
  }, [ttChambers]);

  const mostHiredSpecies = useMemo((): string | null => {
    if (ttCrew.length === 0) return null;
    const counts: Record<string, number> = {};
    for (const c of ttCrew) {
      const def = getCreatureDef(c.creatureId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    let max = 0;
    let species: string | null = null;
    for (const [key, val] of Object.entries(counts)) {
      if (val > max) {
        max = val;
        species = key;
      }
    }
    return species;
  }, [ttCrew, getCreatureDef]);

  const netWorth = useMemo(() => {
    return ttCoins + totalInventoryValue + totalArtifactPower * 10;
  }, [ttCoins, totalInventoryValue, totalArtifactPower]);

  // ============================================================
  // RETURN
  // ============================================================

  return {
    // ---- Color Theme ----
    TT_OCEAN_BLUE,
    TT_DECK_BROWN,
    TT_SAIL_WHITE,
    TT_GOLD_COIN,
    TT_STORM_GRAY,
    TT_CORAL_PINK,
    TT_DEEP_SEA,
    TT_RARITY_COLORS,
    TT_SPECIES_COLORS,
    TT_ALL_COLORS,

    // ---- Data Constants ----
    TT_SPECIES,
    TT_CREATURES,
    TT_CHAMBERS,
    TT_MATERIALS,
    TT_STRUCTURES,
    TT_ABILITIES,
    TT_ACHIEVEMENTS,
    TT_TITLES,
    TT_ARTIFACTS,
    TT_EVENTS,
    TT_MAX_LEVEL,
    TT_SAVE_KEY,
    TT_XP_BASE,
    TT_XP_SCALE,

    // ---- State ----
    ttLevel,
    ttXp,
    ttMaxXp,
    ttCoins,
    ttTotalXp,
    ttTotalCoins,
    ttCrew,
    ttInventory,
    ttStructures,
    ttArtifacts,
    ttAbilities,
    ttAchievements,
    ttChambers,
    ttEventLog,
    ttActiveEvent,
    ttCurrentTitle,
    ttStats,

    // ---- Core Actions ----
    hireCrew,
    sailToPort,
    buildStructure,
    activateArtifact,
    triggerVoyageEvent,
    resetTradeVessel,

    // ---- Extended Actions ----
    discoverPort,
    checkAndClaimAchievements,
    useAbility,
    dismissCrewMember,
    renameCrewMember,
    tradeMaterial,
    spendCoins,
    grantCoins,
    grantXp,
    addMaterial,
    removeMaterial,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    ttTitleProgress,

    // ---- Stats ----
    statsSummary,
    completionStats,

    // ---- Enriched Data ----
    enrichedCrew,
    enrichedChambers,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedAbilities,

    // ---- Computed Data ----
    crewByType,
    crewByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    crewByPower,
    topCrew,
    crewSpeciesBreakdown,
    portExplorationMap,
    structureLevelSum,
    abilityUnlockMap,
    totalFleetPower,
    averageCrewPower,
    totalInventoryValue,
    inventoryItemCount,
    inventoryUniqueItems,
    totalStructureBonus,
    totalArtifactPower,
    undiscoveredPorts,
    reachablePorts,
    unaffordableArtifacts,
    affordableArtifacts,
    crewRarityBreakdown,
    materialsByCategory,
    materialsByRarity,
    eventFrequency,
    isLevelMaxed,
    canAffordAnyCreature,
    highestRarityOwned,
    legendaryCrewCount,
    portsFullyExplored,
    activeEventInfo,
    totalResourcesGathered,
    totalVisitsAllPorts,
    averageExplorationPercent,
    crewHiredToday,
    eventsToday,
    mostVisitedPort,
    mostHiredSpecies,
    netWorth,

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
    canHire,
    canSailTo,
    canBuild,
    canActivateArtifact,
    getStructureUpgradeCost,
    getMaterialCount,
    hasMaterial,
    getCrewMember,
    getChamberRecord,
    getStructureRecord,
    isCrewNicknameUnique,
    daysSinceLastVoyage,
  };
}
