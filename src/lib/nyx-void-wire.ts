import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Nyx Void (暗夜虚空) — Wire Module
//
// A cosmic void realm of eternal darkness, where void walkers,
// shadow entities, and astral beings dwell among the stars.
// Players summon void entities, explore cosmic zones, collect
// ethereal materials, build stellar structures, discover ancient
// artifacts, face random void events, and ascend through 8 titles.
//
// Storage key: nyx-void-save
// Prefix: nv / NV_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

type NvRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

type NvSpecies =
  | 'void_walker'
  | 'shadow_wraith'
  | 'astral_seraph'
  | 'dark_matter_beast'
  | 'star_weaver'
  | 'nebula_spirit'
  | 'eclipse_drake';

type NvAbilityCategory = 'offensive' | 'defensive' | 'utility' | 'summon';

type NvStructureBonusType =
  | 'summonDiscount'
  | 'powerBonus'
  | 'xpBonus'
  | 'materialBonus'
  | 'defenseBonus'
  | 'capacityBonus'
  | 'explorationBonus'
  | 'abilityBonus';

type NvMaterialCategory = 'void' | 'shadow' | 'astral' | 'nebula' | 'stellar' | 'dark' | 'eclipse';

// ---- Entity Definitions ----

interface NvEntityDef {
  readonly id: string;
  readonly name: string;
  readonly species: NvSpecies;
  readonly rarity: NvRarity;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly power: number;
  readonly defense: number;
  readonly cost: number;
  readonly xpReward: number;
}

// ---- Zone Definitions ----

interface NvZoneDef {
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

interface NvMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: NvRarity;
  readonly value: number;
  readonly category: NvMaterialCategory;
  readonly summonBonus: number;
}

// ---- Structure Definitions ----

interface NvStructureDef {
  readonly id: string;
  readonly name: string;
  readonly emoji: string;
  readonly description: string;
  readonly lore: string;
  readonly baseCost: number;
  readonly costMultiplier: number;
  readonly maxLevel: number;
  readonly bonusType: NvStructureBonusType;
  readonly bonusPerLevel: number;
}

// ---- Ability Definitions ----

interface NvAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: NvAbilityCategory;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly rarityRequired: NvRarity;
}

// ---- Achievement Definitions ----

interface NvAchievementDef {
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

interface NvTitleDef {
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

interface NvArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly emoji: string;
  readonly rarity: NvRarity;
  readonly powerBonus: number;
  readonly cost: number;
}

// ---- Event Definitions ----

interface NvEventDef {
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

interface NvOwnedEntity {
  entityId: string;
  instanceId: string;
  summonedAt: number;
  timesUsed: number;
  nickname: string;
}

interface NvZoneRecord {
  zoneId: string;
  discovered: boolean;
  explorationPercent: number;
  lastExplored: number;
  totalVisits: number;
  resourcesGathered: number;
}

interface NvStructureRecord {
  structureId: string;
  level: number;
  builtAt: number;
  totalUpgrades: number;
}

interface NvArtifactRecord {
  artifactId: string;
  activated: boolean;
  activatedAt: number;
  timesUsed: number;
}

interface NvAbilityRecord {
  abilityId: string;
  unlocked: boolean;
  lastUsedAt: number;
  timesUsed: number;
  currentCooldownEnd: number;
}

interface NvAchievementRecord {
  achievementId: string;
  unlocked: boolean;
  unlockedAt: number;
}

interface NvInventoryItem {
  materialId: string;
  count: number;
}

interface NvEventLogEntry {
  eventId: string;
  triggeredAt: number;
  resolved: boolean;
  rewardGained: number;
}

interface NvStats {
  totalSummoned: number;
  totalZonesExplored: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
}

interface NvTitleProgress {
  current: NvTitleDef;
  next: NvTitleDef | null;
  percent: number;
}

// ============================================================
// SECTION 2: NV_ CONSTANTS
// ============================================================

const NV_SAVE_KEY = 'nyx-void-save';
const NV_MAX_LEVEL = 50;
const NV_STARTING_COINS = 300;
const NV_STARTING_XP = 0;
const NV_XP_BASE = 100;
const NV_XP_SCALE = 1.5;
const NV_AUTO_SAVE_MS = 15000;
const NV_EVENT_DURATION_MS = 60000;
const NV_MAX_INVENTORY_ITEM = 999;
const NV_MAX_OWNED_ENTITIES = 100;
const NV_COOLDOWN_TICK_MS = 1000;
const NV_SPECIES_COUNT = 7;
const NV_ENTITY_COUNT = 35;
const NV_ZONE_COUNT = 8;
const NV_MATERIAL_COUNT = 12;
const NV_STRUCTURE_COUNT = 8;
const NV_ABILITY_COUNT = 8;
const NV_ACHIEVEMENT_COUNT = 10;
const NV_TITLE_COUNT = 8;
const NV_ARTIFACT_COUNT = 6;
const NV_EVENT_COUNT = 8;

// ============================================================
// SECTION 3: COLOR THEME CONSTANTS
// ============================================================

const NV_VOID_PURPLE = '#6C3483';
const NV_STARLIGHT = '#F4ECF7';
const NV_SHADOW_BLACK = '#1B2631';
const NV_COSMIC_BLUE = '#1A5276';
const NV_NEBULA_PINK = '#C39BD3';
const NV_ASTRAL_GOLD = '#F7DC6F';
const NV_DARK_RED = '#922B21';

const NV_RARITY_COLORS: Record<NvRarity, string> = {
  common: '#7F8C8D',
  uncommon: '#5DADE2',
  rare: '#AF7AC5',
  epic: '#E74C3C',
  legendary: '#F1C40F',
};

const NV_SPECIES_COLORS: Record<NvSpecies, string> = {
  void_walker: NV_VOID_PURPLE,
  shadow_wraith: NV_SHADOW_BLACK,
  astral_seraph: NV_STARLIGHT,
  dark_matter_beast: NV_COSMIC_BLUE,
  star_weaver: NV_ASTRAL_GOLD,
  nebula_spirit: NV_NEBULA_PINK,
  eclipse_drake: NV_DARK_RED,
};

const NV_ALL_COLORS = [
  NV_VOID_PURPLE,
  NV_STARLIGHT,
  NV_SHADOW_BLACK,
  NV_COSMIC_BLUE,
  NV_NEBULA_PINK,
  NV_ASTRAL_GOLD,
  NV_DARK_RED,
];

// ============================================================
// SECTION 4: NV_SPECIES — 7 Void Species
// ============================================================

const NV_SPECIES: { id: NvSpecies; name: string; description: string; lore: string; emoji: string; color: string }[] = [
  {
    id: 'void_walker',
    name: 'Void Walker',
    description: 'Ethereal humanoid beings that traverse the spaces between stars, born from pure void energy.',
    lore: 'Void Walkers are the first children of Nyx, formed in the instant the universe forgot to fill the space between galaxies. They drift between dimensions, neither fully alive nor dead.',
    emoji: '🚶',
    color: NV_VOID_PURPLE,
  },
  {
    id: 'shadow_wraith',
    name: 'Shadow Wraith',
    description: 'Spectral entities composed of condensed darkness, feeding on the absence of light.',
    lore: 'Shadow Wraiths were once the shadows of ancient gods, cast into the void when their masters fell. Now they haunt the eternal darkness, seeking new forms to attach to.',
    emoji: '👻',
    color: NV_SHADOW_BLACK,
  },
  {
    id: 'astral_seraph',
    name: 'Astral Seraph',
    description: 'Radiant celestial beings of pure starlight, serving as guardians of the cosmic order.',
    lore: 'Astral Seraphs are the last remnants of the First Light — the original illumination that existed before the first star was born. They glow with a gentle, ethereal luminescence.',
    emoji: '👼',
    color: NV_STARLIGHT,
  },
  {
    id: 'dark_matter_beast',
    name: 'Dark Matter Beast',
    description: 'Massive invisible creatures of dark matter, detectable only by their gravitational pull.',
    lore: 'Dark Matter Beasts comprise 85% of all life in the void, yet remain unseen. Only void walkers can sense their presence, feeling the subtle warping of space around them.',
    emoji: '🐉',
    color: NV_COSMIC_BLUE,
  },
  {
    id: 'star_weaver',
    name: 'Star Weaver',
    description: 'Cosmic spiders spinning webs of stellar energy that connect distant star systems.',
    lore: 'Star Weavers create the invisible threads that hold galaxies together. Their silk is made of pure stellar plasma, and a single strand can span light-years.',
    emoji: '🕸️',
    color: NV_ASTRAL_GOLD,
  },
  {
    id: 'nebula_spirit',
    name: 'Nebula Spirit',
    description: 'Gaseous sentient beings drifting through stellar nurseries, born from dying stars.',
    lore: 'Nebula Spirits are the souls of supernovae, the explosive deaths of massive stars. In their gaseous forms, they seed new star systems with the heavy elements needed for life.',
    emoji: '🌌',
    color: NV_NEBULA_PINK,
  },
  {
    id: 'eclipse_drake',
    name: 'Eclipse Drake',
    description: 'Draconic entities that feed on celestial alignments, growing in power during eclipses.',
    lore: 'Eclipse Drakes are drawn to cosmic events — solar eclipses, planetary alignments, and black hole formations. They absorb the gravitational energy of these events, growing more powerful each time.',
    emoji: '🌑',
    color: NV_DARK_RED,
  },
];

// ============================================================
// SECTION 5: NV_ENTITIES — 35 Entities (5 tiers x 7 species)
// ============================================================

const NV_ENTITIES: NvEntityDef[] = [
  // ── Common (7) ──────────────────────────────────────────────────
  {
    id: 'void_walker_common', name: 'Voidling', species: 'void_walker', rarity: 'common',
    description: 'A small, flickering humanoid shape formed from wisps of void energy. Simple but loyal.',
    lore: 'Voidlings are the simplest form of void life, barely more than a thought given form. They follow their summoner with childlike devotion.',
    emoji: '🚶', power: 10, defense: 8, cost: 20, xpReward: 8,
  },
  {
    id: 'shadow_wraith_common', name: 'Shade', species: 'shadow_wraith', rarity: 'common',
    description: 'A basic shadow entity, barely more than a dark smear on the fabric of reality.',
    lore: 'Shades are the weakest shadow wraiths, born from the shadows of mundane objects. Despite their simplicity, they never forget a face.',
    emoji: '👻', power: 8, defense: 6, cost: 18, xpReward: 7,
  },
  {
    id: 'astral_seraph_common', name: 'Spark Cherub', species: 'astral_seraph', rarity: 'common',
    description: 'A tiny angelic being radiating faint starlight, barely visible in the void.',
    lore: 'Spark Cherubs are newborn seraphs, their wings still forming from coalescing light. They sing in frequencies only void walkers can hear.',
    emoji: '👼', power: 6, defense: 5, cost: 22, xpReward: 9,
  },
  {
    id: 'dark_matter_beast_common', name: 'Grav Pup', species: 'dark_matter_beast', rarity: 'common',
    description: 'A small invisible creature detectable only by the subtle pull it exerts on nearby objects.',
    lore: 'Grav Pups are dark matter puppies — invisible, playful, and capable of warping local gravity just enough to make objects float.',
    emoji: '🐉', power: 9, defense: 10, cost: 16, xpReward: 6,
  },
  {
    id: 'star_weaver_common', name: 'Dust Spinner', species: 'star_weaver', rarity: 'common',
    description: 'A tiny cosmic spider weaving webs from interstellar dust and cosmic rays.',
    lore: 'Dust Spinners create gossamer webs that catch passing particles of light, creating beautiful but ephemeral patterns in the void.',
    emoji: '🕸️', power: 7, defense: 7, cost: 20, xpReward: 8,
  },
  {
    id: 'nebula_spirit_common', name: 'Gas Wisp', species: 'nebula_spirit', rarity: 'common',
    description: 'A faint wisp of colorful nebula gas, drifting aimlessly through the cosmic void.',
    lore: 'Gas Wisps are the youngest nebula spirits, barely more than a cloud of ionized hydrogen with the faintest spark of consciousness.',
    emoji: '🌌', power: 5, defense: 12, cost: 19, xpReward: 7,
  },
  {
    id: 'eclipse_drake_common', name: 'Twilight Whelp', species: 'eclipse_drake', rarity: 'common',
    description: 'A small drake with scales that darken when exposed to starlight.',
    lore: 'Twilight Whelps are born during minor cosmic alignments. Their scales absorb light rather than reflect it, making them appear as silhouettes.',
    emoji: '🌑', power: 11, defense: 9, cost: 25, xpReward: 10,
  },

  // ── Uncommon (7) ───────────────────────────────────────────────
  {
    id: 'void_walker_uncommon', name: 'Void Strider', species: 'void_walker', rarity: 'uncommon',
    description: 'A tall, graceful void entity that strides between dimensions with ease.',
    lore: 'Void Striders have mastered the art of dimensional walking, able to step through the barriers between realities as easily as one walks through a doorway.',
    emoji: '🚶', power: 22, defense: 20, cost: 60, xpReward: 20,
  },
  {
    id: 'shadow_wraith_uncommon', name: 'Dusk Phantom', species: 'shadow_wraith', rarity: 'uncommon',
    description: 'A shadowy figure that moves between patches of darkness, leaving frost in its wake.',
    lore: 'Dusk Phantoms feed on the twilight between day and night, growing stronger during the liminal hours. Their touch freezes molecular motion.',
    emoji: '👻', power: 20, defense: 18, cost: 55, xpReward: 18,
  },
  {
    id: 'astral_seraph_uncommon', name: 'Starling Sentinel', species: 'astral_seraph', rarity: 'uncommon',
    description: 'A winged seraph emitting pulsing starlight, capable of illuminating entire void zones.',
    lore: 'Starling Sentinels guard the borders of known space, their radiant wings serving as beacons for lost travelers in the void.',
    emoji: '👼', power: 18, defense: 15, cost: 65, xpReward: 22,
  },
  {
    id: 'dark_matter_beast_uncommon', name: 'Gravity Hound', species: 'dark_matter_beast', rarity: 'uncommon',
    description: 'An invisible hound that warps gravity in its vicinity, pinning enemies to the ground.',
    lore: 'Gravity Hounds hunt by sensing the gravitational signatures of living beings. Once locked on, nothing can escape their invisible grip.',
    emoji: '🐉', power: 24, defense: 22, cost: 58, xpReward: 19,
  },
  {
    id: 'star_weaver_uncommon', name: 'Photon Weaver', species: 'star_weaver', rarity: 'uncommon',
    description: 'A luminous spider weaving webs of captured photon threads from distant stars.',
    lore: 'Photon Weavers create webs of pure light that can trap both physical and ethereal entities. Their silk conducts stellar energy along its strands.',
    emoji: '🕸️', power: 19, defense: 17, cost: 50, xpReward: 17,
  },
  {
    id: 'nebula_spirit_uncommon', name: 'Plasma Drifter', species: 'nebula_spirit', rarity: 'uncommon',
    description: 'A sentient cloud of plasma drifting through stellar nurseries, radiating colorful light.',
    lore: 'Plasma Drifters are the guardians of stellar nurseries, ensuring that new stars form correctly. Their colorful displays signal approval or alarm.',
    emoji: '🌌', power: 16, defense: 21, cost: 52, xpReward: 18,
  },
  {
    id: 'eclipse_drake_uncommon', name: 'Umbra Drake', species: 'eclipse_drake', rarity: 'uncommon',
    description: 'A drake whose shadow extends for miles, consuming all light in its path.',
    lore: 'Umbra Drakes project an anti-light field that cancels all electromagnetic radiation. Standing in their shadow is like being at the edge of a black hole.',
    emoji: '🌑', power: 25, defense: 21, cost: 70, xpReward: 24,
  },

  // ── Rare (7) ───────────────────────────────────────────────────
  {
    id: 'void_walker_rare', name: 'Dimensional Stalker', species: 'void_walker', rarity: 'rare',
    description: 'A towering void entity that hunts across dimensions, unseen and unstoppable.',
    lore: 'Dimensional Stalkers can perceive all realities simultaneously and choose which to manifest in. Their attacks come from directions that do not exist.',
    emoji: '🚶', power: 40, defense: 38, cost: 200, xpReward: 50,
  },
  {
    id: 'shadow_wraith_rare', name: 'Nightmare Specter', species: 'shadow_wraith', rarity: 'rare',
    description: 'A terrifying wraith that materializes from the nightmares of sleeping void entities.',
    lore: 'Nightmare Specters feed on fear itself. They are not truly alive — they are the absence of courage given form.',
    emoji: '👻', power: 38, defense: 32, cost: 180, xpReward: 45,
  },
  {
    id: 'astral_seraph_rare', name: 'Nova Herald', species: 'astral_seraph', rarity: 'rare',
    description: 'A blazing seraph that heralds the birth of new stars, radiating blinding light.',
    lore: 'Nova Heralds appear moments before a star is born, their radiant announcement visible across parsecs. To witness one is to witness creation itself.',
    emoji: '👼', power: 35, defense: 30, cost: 220, xpReward: 55,
  },
  {
    id: 'dark_matter_beast_rare', name: 'Void Behemoth', species: 'dark_matter_beast', rarity: 'rare',
    description: 'A massive invisible creature whose gravitational field warps the fabric of spacetime.',
    lore: 'Void Behemoths are so massive they create their own gravitational wells. Time slows in their presence, and space curves around them.',
    emoji: '🐉', power: 42, defense: 40, cost: 210, xpReward: 52,
  },
  {
    id: 'star_weaver_rare', name: 'Constellation Spinner', species: 'star_weaver', rarity: 'rare',
    description: 'A magnificent cosmic spider weaving constellations into existence with each web.',
    lore: 'Constellation Spinners are responsible for the patterns we see in the night sky. Each web they create becomes a new constellation.',
    emoji: '🕸️', power: 36, defense: 33, cost: 190, xpReward: 48,
  },
  {
    id: 'nebula_spirit_rare', name: 'Supernova Ghost', species: 'nebula_spirit', rarity: 'rare',
    description: 'The spirit of a massive star that died in a spectacular supernova explosion.',
    lore: 'Supernova Ghosts carry the memory of their stellar death within them. When they speak, the sound is the echo of an explosion from millions of years ago.',
    emoji: '🌌', power: 33, defense: 35, cost: 195, xpReward: 49,
  },
  {
    id: 'eclipse_drake_rare', name: 'Corona Drake', species: 'eclipse_drake', rarity: 'rare',
    description: 'A drake wreathed in stellar corona, feeding on the outer atmospheres of dying stars.',
    lore: 'Corona Drakes circle dying stars like vultures, absorbing the superheated plasma of stellar coronas. Their breath is a stream of ionized gas.',
    emoji: '🌑', power: 44, defense: 38, cost: 250, xpReward: 60,
  },

  // ── Epic (7) ───────────────────────────────────────────────────
  {
    id: 'void_walker_epic', name: 'Void Sovereign', species: 'void_walker', rarity: 'epic',
    description: 'A regal void entity commanding legions of lesser void beings, master of dimensional gates.',
    lore: 'Void Sovereigns have existed since before the Big Bang. They remember the nothingness that preceded everything and can return any being to that primordial state.',
    emoji: '🚶', power: 70, defense: 65, cost: 800, xpReward: 120,
  },
  {
    id: 'shadow_wraith_epic', name: 'Abyssal Lich', species: 'shadow_wraith', rarity: 'epic',
    description: 'An ancient shadow lord who has transcended mortality, existing as pure living darkness.',
    lore: 'Abyssal Liches were once mortal sorcerers who willingly merged with the void. Their consciousness now spans the space between galaxies.',
    emoji: '👻', power: 68, defense: 58, cost: 750, xpReward: 110,
  },
  {
    id: 'astral_seraph_epic', name: 'Archon of Light', species: 'astral_seraph', rarity: 'epic',
    description: 'A supreme celestial being radiating light that can purify corruption and void taint.',
    lore: 'Archons of Light are the highest order of astral seraphs, charged with maintaining the balance between light and dark in the cosmos.',
    emoji: '👼', power: 65, defense: 55, cost: 850, xpReward: 130,
  },
  {
    id: 'dark_matter_beast_epic', name: 'Singularity Titan', species: 'dark_matter_beast', rarity: 'epic',
    description: 'A colossal dark matter entity harboring a micro-singularity at its core.',
    lore: 'Singularity Titans carry the seeds of black holes within them. If one were ever to be destroyed, the resulting explosion would birth a new stellar black hole.',
    emoji: '🐉', power: 72, defense: 68, cost: 820, xpReward: 125,
  },
  {
    id: 'star_weaver_epic', name: 'Galaxy Weaver', species: 'star_weaver', rarity: 'epic',
    description: 'A cosmic spider of immense scale whose web spans an entire galaxy, holding its stars in place.',
    lore: 'Galaxy Weavers are responsible for the spiral structure of galaxies. Their webs channel gravitational energy to maintain galactic cohesion.',
    emoji: '🕸️', power: 64, defense: 60, cost: 780, xpReward: 115,
  },
  {
    id: 'nebula_spirit_epic', name: 'Pulsar Anomaly', species: 'nebula_spirit', rarity: 'epic',
    description: 'A pulsating nebula spirit channeling the rhythmic energy of a neutron star.',
    lore: 'Pulsar Anomalies pulse with the regularity of atomic clocks, their energy waves rippling through the void and disturbing all nearby entities.',
    emoji: '🌌', power: 67, defense: 62, cost: 800, xpReward: 122,
  },
  {
    id: 'eclipse_drake_epic', name: 'Oblivion Wyrm', species: 'eclipse_drake', rarity: 'epic',
    description: 'A drake of apocalyptic power that can temporarily extinguish the light of entire star systems.',
    lore: 'Oblivion Wyrms are feared by all void entities. When one spreads its wings, an entire sector of space goes dark. Even void walkers retreat from their presence.',
    emoji: '🌑', power: 75, defense: 70, cost: 950, xpReward: 150,
  },

  // ── Legendary (7) ──────────────────────────────────────────────
  {
    id: 'void_walker_legendary', name: 'Primordial Void Incarnate', species: 'void_walker', rarity: 'legendary',
    description: 'The embodiment of the primordial void itself, older than the concept of existence.',
    lore: 'The Primordial Void Incarnate IS the space between atoms, the gap between thoughts, the silence between heartbeats. It does not exist — it IS the absence of existence.',
    emoji: '🚶', power: 120, defense: 110, cost: 3000, xpReward: 300,
  },
  {
    id: 'shadow_wraith_legendary', name: 'Eternal Night Sovereign', species: 'shadow_wraith', rarity: 'legendary',
    description: 'The ruler of all shadows across all dimensions, whose darkness predates the first light.',
    lore: 'The Eternal Night Sovereign was there when the first photon was emitted — and tried to consume it. Their battle with light has continued for thirteen billion years.',
    emoji: '👻', power: 115, defense: 100, cost: 2800, xpReward: 280,
  },
  {
    id: 'astral_seraph_legendary', name: 'Celestial Empress of First Light', species: 'astral_seraph', rarity: 'legendary',
    description: 'The original source of all light in the universe, a being of infinite radiance.',
    lore: 'The Celestial Empress of First Light emitted the first photon that ever existed. Every star, every glow, every illumination traces back to her singular act of creation.',
    emoji: '👼', power: 110, defense: 95, cost: 3200, xpReward: 320,
  },
  {
    id: 'dark_matter_beast_legendary', name: 'Cosmic Leviathan', species: 'dark_matter_beast', rarity: 'legendary',
    description: 'A being of pure dark matter the size of a solar system, invisible but omnipresent.',
    lore: 'The Cosmic Leviathan accounts for a measurable percentage of the universe\'s dark matter. Galaxies orbit around it without ever knowing it exists.',
    emoji: '🐉', power: 125, defense: 118, cost: 3400, xpReward: 340,
  },
  {
    id: 'star_weaver_legendary', name: 'Weaver of the Cosmic Tapestry', species: 'star_weaver', rarity: 'legendary',
    description: 'The architect of the cosmic web, spinning the threads that connect all galaxies.',
    lore: 'The Weaver of the Cosmic Tapestry has been weaving since before the first galaxy formed. Their masterwork — the cosmic web — will not be completed for another hundred billion years.',
    emoji: '🕸️', power: 108, defense: 98, cost: 2900, xpReward: 290,
  },
  {
    id: 'nebula_spirit_legendary', name: 'Genesis Nebula Consciousness', species: 'nebula_spirit', rarity: 'legendary',
    description: 'A sentient nebula that seeds life across the universe, the mother of all star systems.',
    lore: 'The Genesis Nebula Consciousness has birthed more star systems than there are grains of sand on every Earth-like planet combined. It dreams in colors that do not exist.',
    emoji: '🌌', power: 112, defense: 105, cost: 3100, xpReward: 310,
  },
  {
    id: 'eclipse_drake_legendary', name: 'Nyx, the Eternal Eclipse', species: 'eclipse_drake', rarity: 'legendary',
    description: 'The primordial drake whose permanent eclipse once shrouded the universe in darkness.',
    lore: 'Nyx, the Eternal Eclipse, is the namesake of this void realm. According to legend, she chose to share her darkness with the cosmos, creating the void so that light would have meaning.',
    emoji: '🌑', power: 130, defense: 120, cost: 4000, xpReward: 400,
  },
];

// ============================================================
// SECTION 6: NV_ZONES — 8 Void Zones
// ============================================================

const NV_ZONES: NvZoneDef[] = [
  {
    id: 'abyssal_rift', name: 'The Abyssal Rift', emoji: '🕳️',
    description: 'A deep crack in the fabric of spacetime where raw void energy seeps through into reality.',
    lore: 'The Abyssal Rift was torn open during the first war between light and dark. It has never fully healed, and void energy continues to leak through its edges.',
    level: 1, resources: ['void_essence', 'shadow_crystal', 'obsidian_shard'], capacity: 10,
    unlockLevel: 1, ambientColor: NV_VOID_PURPLE, dangerLevel: 1,
  },
  {
    id: 'starless_expanse', name: 'Starless Expanse', emoji: '⚫',
    description: 'A vast region of space devoid of all light, where even photons fear to tread.',
    lore: 'The Starless Expanse is where the first shadow was cast. Light bends around it, creating a zone of perfect darkness that extends in all directions.',
    level: 3, resources: ['shadow_crystal', 'null_stone', 'obsidian_shard'], capacity: 15,
    unlockLevel: 3, ambientColor: NV_SHADOW_BLACK, dangerLevel: 2,
  },
  {
    id: 'nebula_depths', name: 'Nebula Depths', emoji: '🌌',
    description: 'The heart of a dying nebula where colorful gases swirl in hypnotic cosmic patterns.',
    lore: 'The Nebula Depths are the most beautiful zone in the void — and the most deceptive. Their beauty masks deadly radiation storms and gravitational eddies.',
    level: 8, resources: ['nebula_gas', 'cosmic_ember', 'astral_dust'], capacity: 20,
    unlockLevel: 8, ambientColor: NV_NEBULA_PINK, dangerLevel: 3,
  },
  {
    id: 'dark_matter_core', name: 'Dark Matter Core', emoji: '🔵',
    description: 'A dense concentration of dark matter that warps space and time around it.',
    lore: 'The Dark Matter Core is invisible but its effects are not. Clocks run slower here, distances contract, and the path between two points bends in unexpected ways.',
    level: 14, resources: ['dark_matter_fragment', 'null_stone', 'void_essence'], capacity: 25,
    unlockLevel: 14, ambientColor: NV_COSMIC_BLUE, dangerLevel: 4,
  },
  {
    id: 'astral_sanctum', name: 'Astral Sanctum', emoji: '✨',
    description: 'A hidden sanctuary of pure starlight, protected by ancient astral seraphs.',
    lore: 'The Astral Sanctum is the last refuge of light in the void. Ancient seraphs maintain a perpetual glow here, keeping the darkness at bay through sheer will.',
    level: 20, resources: ['astral_dust', 'starlight_shard', 'cosmic_ember'], capacity: 30,
    unlockLevel: 20, ambientColor: NV_STARLIGHT, dangerLevel: 5,
  },
  {
    id: 'shadow_gate', name: 'Shadow Gate', emoji: '🚪',
    description: 'A massive portal between the material universe and the void, guarded by shadow wraiths.',
    lore: 'The Shadow Gate is the boundary between what is real and what is not. Only those who have embraced the darkness can pass through without losing their minds.',
    level: 28, resources: ['shadow_crystal', 'void_tendril', 'eclipse_shard'], capacity: 35,
    unlockLevel: 28, ambientColor: '#2C3E50', dangerLevel: 6,
  },
  {
    id: 'stellar_forge', name: 'The Stellar Forge', emoji: '⭐',
    description: 'A cosmic crucible where new stars are born from compressed matter and energy.',
    lore: 'The Stellar Forge is where the raw materials of the universe are compressed until nuclear fusion begins. The heat here is beyond comprehension, yet void entities can endure it.',
    level: 36, resources: ['starlight_shard', 'cosmic_ember', 'twilight_resin'], capacity: 40,
    unlockLevel: 36, ambientColor: NV_ASTRAL_GOLD, dangerLevel: 7,
  },
  {
    id: 'eclipse_throne', name: 'Eclipse Throne', emoji: '👑',
    description: 'The seat of Nyx herself, where eternal darkness and cosmic power converge.',
    lore: 'The Eclipse Throne sits at the exact center of the void, equidistant from every point in the universe. Time does not pass here. Only those Nyx has chosen may approach.',
    level: 45, resources: ['eclipse_shard', 'twilight_resin', 'dark_matter_fragment'], capacity: 50,
    unlockLevel: 45, ambientColor: NV_DARK_RED, dangerLevel: 9,
  },
];

// ============================================================
// SECTION 7: NV_MATERIALS — 12 Materials
// ============================================================

const NV_MATERIALS: NvMaterialDef[] = [
  // ── Common (4) ─────────────────────────────────────────────────
  {
    id: 'void_essence', name: 'Void Essence', emoji: '🟣', rarity: 'common', value: 5,
    category: 'void', summonBonus: 1,
    description: 'A vial of raw void energy, shimmering with dark purple luminescence.',
    lore: 'Void Essence is the most basic resource of the void, seeping from cracks in reality. It can be used to summon simple entities or power minor devices.',
  },
  {
    id: 'shadow_crystal', name: 'Shadow Crystal', emoji: '🖤', rarity: 'common', value: 6,
    category: 'shadow', summonBonus: 2,
    description: 'A crystal formed from solidified darkness, cold to the touch and impossibly dark.',
    lore: 'Shadow Crystals form when absolute darkness crystallizes under extreme cosmic pressure. They absorb all light that touches them.',
  },
  {
    id: 'obsidian_shard', name: 'Obsidian Shard', emoji: '⬛', rarity: 'common', value: 4,
    category: 'void', summonBonus: 1,
    description: 'A shard of void obsidian, sharper than any metal known to mortal science.',
    lore: 'Void Obsidian is forged in the hearts of dying stars, then quenched in absolute zero. Its edge is a single molecule thick.',
  },
  {
    id: 'null_stone', name: 'Null Stone', emoji: '⚪', rarity: 'common', value: 5,
    category: 'void', summonBonus: 1,
    description: 'A peculiar stone that absorbs all forms of energy, leaving a zone of perfect calm.',
    lore: 'Null Stones are used by void walkers to create safe zones in the chaotic void. Within their influence, all magical and physical forces are neutralized.',
  },

  // ── Uncommon (4) ───────────────────────────────────────────────
  {
    id: 'astral_dust', name: 'Astral Dust', emoji: '✨', rarity: 'uncommon', value: 18,
    category: 'astral', summonBonus: 4,
    description: 'Fine luminous dust shed by astral seraphs during flight through the cosmos.',
    lore: 'Astral Dust glows with a soft inner light and is highly prized for summoning celestial entities. A pinch can illuminate a chamber for years.',
  },
  {
    id: 'nebula_gas', name: 'Nebula Gas', emoji: '🌫️', rarity: 'uncommon', value: 15,
    category: 'nebula', summonBonus: 3,
    description: 'Compressed gas harvested from stellar nurseries, shimmering with prismatic colors.',
    lore: 'Nebula Gas is the raw material of star formation. When compressed and heated, it can trigger nuclear fusion in microscopic quantities.',
  },
  {
    id: 'starlight_shard', name: 'Starlight Shard', emoji: '💛', rarity: 'uncommon', value: 20,
    category: 'stellar', summonBonus: 5,
    description: 'A fragment of concentrated starlight, warm and humming with cosmic energy.',
    lore: 'Starlight Shards are harvested by Star Weavers from the webs they spin between stars. Each shard contains the light of a specific star.',
  },
  {
    id: 'cosmic_ember', name: 'Cosmic Ember', emoji: '🔥', rarity: 'uncommon', value: 16,
    category: 'stellar', summonBonus: 3,
    description: 'A glowing ember from the birth of a star, radiating warmth and creative energy.',
    lore: 'Cosmic Embers are the leftover energy from stellar ignition. They never cool — maintaining a constant temperature of ten million degrees.',
  },

  // ── Rare (2) ───────────────────────────────────────────────────
  {
    id: 'dark_matter_fragment', name: 'Dark Matter Fragment', emoji: '💠', rarity: 'rare', value: 60,
    category: 'dark', summonBonus: 8,
    description: 'A piece of solidified dark matter, invisible to the naked eye but tangible to the touch.',
    lore: 'Dark Matter Fragments can only be detected by their gravitational pull. They are essential for summoning Dark Matter Beasts, who require dark matter to sustain their forms.',
  },
  {
    id: 'void_tendril', name: 'Void Tendril', emoji: '🐙', rarity: 'rare', value: 55,
    category: 'void', summonBonus: 7,
    description: 'A living tendril of void energy that writhes and grasps at anything nearby.',
    lore: 'Void Tendrils are the nervous system of the void itself. They sense vibrations across dimensions and can reach into parallel realities.',
  },

  // ── Epic (1) ───────────────────────────────────────────────────
  {
    id: 'eclipse_shard', name: 'Eclipse Shard', emoji: '🌑', rarity: 'epic', value: 180,
    category: 'eclipse', summonBonus: 15,
    description: 'A fragment of solidified eclipse energy, radiating an aura of absolute darkness.',
    lore: 'Eclipse Shards form during perfect cosmic alignments when the void intersects with reality. They are the most powerful summoning catalysts known.',
  },

  // ── Legendary (1) ──────────────────────────────────────────────
  {
    id: 'twilight_resin', name: 'Twilight Resin', emoji: '🔮', rarity: 'legendary', value: 500,
    category: 'eclipse', summonBonus: 25,
    description: 'Amber-like resin formed at the exact boundary between light and darkness, between existence and void.',
    lore: 'Twilight Resin is the rarest substance in the universe. It forms only at the precise instant when a star dies and a void is born — a moment that lasts less than a picosecond.',
  },
];

// ============================================================
// SECTION 8: NV_STRUCTURES — 8 Structures (upgradeable)
// ============================================================

const NV_STRUCTURES: NvStructureDef[] = [
  {
    id: 'void_beacon', name: 'Void Beacon', emoji: '🗼',
    description: 'A pulsing beacon of void energy that attracts void entities and marks territory in the darkness.',
    lore: 'Void Beacons are the first structures any void explorer builds. They serve as lighthouses in the eternal darkness, guiding allies and warning of danger.',
    baseCost: 50, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 4,
  },
  {
    id: 'shadow_altar', name: 'Shadow Altar', emoji: '⛩️',
    description: 'An altar of living shadow where entities can be summoned and empowered with dark energy.',
    lore: 'The Shadow Altar draws power from the ambient darkness of the void, converting it into energy that can strengthen summoned entities and reduce summoning costs.',
    baseCost: 80, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'summonDiscount', bonusPerLevel: 3,
  },
  {
    id: 'astral_observatory', name: 'Astral Observatory', emoji: '🔭',
    description: 'A crystalline dome that reveals hidden zones and distant cosmic events across the void.',
    lore: 'The Astral Observatory focuses starlight through void crystals, creating a lens that can see across light-years and into parallel dimensions.',
    baseCost: 100, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'explorationBonus', bonusPerLevel: 6,
  },
  {
    id: 'nebula_forge', name: 'Nebula Forge', emoji: '🔨',
    description: 'A cosmic forge fueled by nebula gas, capable of crafting powerful void artifacts.',
    lore: 'The Nebula Forge burns at temperatures that would vaporize any material known to science. Only void-reinforced structures can contain its fire.',
    baseCost: 120, costMultiplier: 1.5, maxLevel: 10,
    bonusType: 'powerBonus', bonusPerLevel: 4,
  },
  {
    id: 'dark_matter_reactor', name: 'Dark Matter Reactor', emoji: '⚛️',
    description: 'A reactor that harnesses dark matter annihilation to generate immense void power.',
    lore: 'The Dark Matter Reactor converts dark matter into pure energy at near-perfect efficiency. A single gram of dark matter can power the reactor for centuries.',
    baseCost: 150, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'xpBonus', bonusPerLevel: 5,
  },
  {
    id: 'starlight_spire', name: 'Starlight Spire', emoji: '🗼',
    description: 'A towering spire that collects and focuses starlight into beams of pure cosmic energy.',
    lore: 'The Starlight Spire gathers light from every visible star, focusing it into a single devastating beam. It can pierce the void itself, opening temporary pathways.',
    baseCost: 180, costMultiplier: 1.6, maxLevel: 10,
    bonusType: 'defenseBonus', bonusPerLevel: 5,
  },
  {
    id: 'eclipse_gate', name: 'Eclipse Gate', emoji: '🚪',
    description: 'A massive portal that opens during cosmic alignments, granting access to hidden void zones.',
    lore: 'The Eclipse Gate only activates during celestial alignments. When open, it provides instant access to the most dangerous and rewarding zones in the void.',
    baseCost: 250, costMultiplier: 1.7, maxLevel: 10,
    bonusType: 'materialBonus', bonusPerLevel: 8,
  },
  {
    id: 'void_nexus_core', name: 'Void Nexus Core', emoji: '💎',
    description: 'The heart of all void operations, amplifying every structure and entity within range.',
    lore: 'The Void Nexus Core is the most important structure in any void domain. It creates a resonance field that enhances every other structure and entity connected to it.',
    baseCost: 400, costMultiplier: 1.8, maxLevel: 10,
    bonusType: 'abilityBonus', bonusPerLevel: 6,
  },
];

// ============================================================
// SECTION 9: NV_ABILITIES — 8 Abilities (2 per category)
// ============================================================

const NV_ABILITIES: NvAbilityDef[] = [
  // ── Offensive (2) ──────────────────────────────────────────────
  {
    id: 'void_strike', name: 'Void Strike', category: 'offensive',
    description: 'Channels void energy into a devastating strike that tears through dimensional barriers to hit the target.',
    lore: 'Void Strike originates from the space between dimensions, bypassing all physical defenses. Nothing can block an attack that comes from outside reality.',
    emoji: '💥', cooldown: 5000, power: 30, rarityRequired: 'common',
  },
  {
    id: 'shadow_blast', name: 'Shadow Blast', category: 'offensive',
    description: 'Unleashes a wave of condensed shadow energy that engulfs enemies in absolute darkness.',
    lore: 'Shadow Blast creates a sphere of darkness so complete that targets lose all sensory perception. They are frozen in a void of nothingness.',
    emoji: '🌑', cooldown: 10000, power: 65, rarityRequired: 'rare',
  },

  // ── Defensive (2) ──────────────────────────────────────────────
  {
    id: 'nebula_shield', name: 'Nebula Shield', category: 'defensive',
    description: 'Surrounds allies in a protective nebula cloud that absorbs incoming damage.',
    lore: 'Nebula Shields are made of compressed nebula gas so dense that projectiles slow to a crawl and energy attacks are scattered by electromagnetic interference.',
    emoji: '🛡️', cooldown: 8000, power: 35, rarityRequired: 'common',
  },
  {
    id: 'dark_matter_barrier', name: 'Dark Matter Barrier', category: 'defensive',
    description: 'Creates an invisible barrier of dark matter that warps space around protected allies.',
    lore: 'The Dark Matter Barrier bends space itself, causing attacks to curve away from their targets. Projectiles follow impossible trajectories and miss entirely.',
    emoji: '💠', cooldown: 15000, power: 70, rarityRequired: 'epic',
  },

  // ── Utility (2) ────────────────────────────────────────────────
  {
    id: 'starlight_vision', name: 'Starlight Vision', category: 'utility',
    description: 'Enhances perception by channeling starlight, revealing hidden resources and secret void zones.',
    lore: 'Starlight Vision allows the user to see through the darkness of the void, perceiving things that are hidden, invisible, or exist in parallel dimensions.',
    emoji: '👁️', cooldown: 4000, power: 15, rarityRequired: 'common',
  },
  {
    id: 'eclipse_phase', name: 'Eclipse Phase', category: 'utility',
    description: 'Temporarily phases the user out of sync with reality, becoming intangible and invisible.',
    lore: 'Eclipse Phase shifts the user partially into the void, making them ghost-like. They can pass through solid matter and cannot be harmed by physical means.',
    emoji: '🌀', cooldown: 12000, power: 25, rarityRequired: 'rare',
  },

  // ── Summon (2) ────────────────────────────────────────────────
  {
    id: 'void_walker_summon', name: 'Void Walker Summon', category: 'summon',
    description: 'Temporarily summons a void walker from the dimensional rift to assist in exploration.',
    lore: 'Void Walker Summon tears a small hole in the fabric of reality, through which a willing void walker steps. The portal closes behind them after a short duration.',
    emoji: '🚶', cooldown: 20000, power: 40, rarityRequired: 'common',
  },
  {
    id: 'astral_seraph_call', name: 'Astral Seraph Call', category: 'summon',
    description: 'Calls upon the power of an astral seraph, summoning divine light to heal and empower allies.',
    lore: 'Astral Seraph Call sends a signal across the cosmos that only seraphs can hear. The nearest seraph descends in a cascade of starlight to answer the call.',
    emoji: '👼', cooldown: 30000, power: 60, rarityRequired: 'rare',
  },
];

// ============================================================
// SECTION 10: NV_ACHIEVEMENTS — 10 Achievements
// ============================================================

const NV_ACHIEVEMENTS: NvAchievementDef[] = [
  {
    id: 'ach_first_summon', name: 'First Contact', emoji: '🚶',
    description: 'Summon your first void entity and establish your presence in the Nyx Void.',
    conditionKey: 'totalSummoned', targetValue: 1, rewardXp: 50, rewardCoins: 10,
  },
  {
    id: 'ach_summon_10', name: 'Void Tamer', emoji: '👻',
    description: 'Summon 10 void entities and prove your mastery over the dimensional arts.',
    conditionKey: 'totalSummoned', targetValue: 10, rewardXp: 200, rewardCoins: 30,
  },
  {
    id: 'ach_summon_50', name: 'Lord of the Void', emoji: '👑',
    description: 'Summon 50 void entities and command a formidable army of darkness.',
    conditionKey: 'totalSummoned', targetValue: 50, rewardXp: 800, rewardCoins: 100,
  },
  {
    id: 'ach_explore_5', name: 'Void Navigator', emoji: '🧭',
    description: 'Discover 5 different void zones and chart the pathways of eternal darkness.',
    conditionKey: 'totalZonesExplored', targetValue: 5, rewardXp: 300, rewardCoins: 25,
  },
  {
    id: 'ach_explore_all', name: 'Cartographer of Nothingness', emoji: '🗺️',
    description: 'Explore all 8 void zones and complete the map of the Nyx Void realm.',
    conditionKey: 'totalZonesExplored', targetValue: 8, rewardXp: 1500, rewardCoins: 80,
  },
  {
    id: 'ach_build_5', name: 'Void Architect', emoji: '🏗️',
    description: 'Build 5 different void structures and establish your domain in the darkness.',
    conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXp: 400, rewardCoins: 40,
  },
  {
    id: 'ach_legendary_entity', name: 'Mythic Summoner', emoji: '⭐',
    description: 'Summon a legendary entity and command the most powerful beings in the void.',
    conditionKey: 'totalArtifacts', targetValue: 1, rewardXp: 1000, rewardCoins: 60,
  },
  {
    id: 'ach_7_species', name: 'Complete Menagerie', emoji: '📋',
    description: 'Own at least one entity of every species across all void domains.',
    conditionKey: 'totalEvents', targetValue: 7, rewardXp: 600, rewardCoins: 50,
  },
  {
    id: 'ach_level_25', name: 'Herald of Nyx', emoji: '📈',
    description: 'Reach level 25 and be recognized as a true herald of the void.',
    conditionKey: 'totalXp', targetValue: 5000, rewardXp: 500, rewardCoins: 40,
  },
  {
    id: 'ach_level_50', name: 'Nyx Incarnate', emoji: '🌑',
    description: 'Reach the maximum level 50 and become one with the eternal void.',
    conditionKey: 'totalXp', targetValue: 20000, rewardXp: 3000, rewardCoins: 150,
  },
];

// ============================================================
// SECTION 11: NV_TITLES — 8 Title Progression
// ============================================================

const NV_TITLES: NvTitleDef[] = [
  {
    id: 'title_void_initiate', name: 'Void Initiate', emoji: '🚶',
    description: 'A newcomer to the Nyx Void, taking their first steps into eternal darkness.',
    lore: 'Every void master began as an initiate, their eyes adjusting to a darkness deeper than any they had known.',
    requiredLevel: 1, coinBonus: 0, xpBonus: 0,
  },
  {
    id: 'title_shadow_acolyte', name: 'Shadow Acolyte', emoji: '👻',
    description: 'An apprentice of shadow magic, learning to command the darkness.',
    lore: 'Shadow Acolytes spend years learning to see without light, to hear without air, and to exist without existence.',
    requiredLevel: 5, coinBonus: 5, xpBonus: 3,
  },
  {
    id: 'title_nebula_walker', name: 'Nebula Walker', emoji: '🌌',
    description: 'One who traverses the colorful nebula depths, learning the secrets of stellar birth.',
    lore: 'Nebula Walkers are among the most beautiful sight in the void, trailing clouds of colorful gas wherever they go.',
    requiredLevel: 10, coinBonus: 10, xpBonus: 5,
  },
  {
    id: 'title_astral_seeker', name: 'Astral Seeker', emoji: '✨',
    description: 'A seeker of cosmic truth, following the starlight to hidden realms.',
    lore: 'Astral Seekers follow the oldest light in the universe — photons that have traveled for billions of years — seeking their source.',
    requiredLevel: 18, coinBonus: 20, xpBonus: 10,
  },
  {
    id: 'title_dark_channeler', name: 'Dark Matter Channeler', emoji: '⚫',
    description: 'One who channels the invisible power of dark matter to shape the fabric of reality.',
    lore: 'Dark Matter Channelers can feel the 85% of the universe that remains unseen. They shape it, bend it, and wield it as a weapon.',
    requiredLevel: 25, coinBonus: 35, xpBonus: 15,
  },
  {
    id: 'title_eclipse_herald', name: 'Eclipse Herald', emoji: '🌑',
    description: 'A herald of cosmic eclipses, announcing the coming of great celestial events.',
    lore: 'Eclipse Heralds are chosen by the alignment of planets. They carry the authority of the cosmos itself.',
    requiredLevel: 33, coinBonus: 50, xpBonus: 22,
  },
  {
    id: 'title_void_sovereign', name: 'Void Sovereign', emoji: '👑',
    description: 'A ruler of a vast domain within the Nyx Void, commanding legions of entities.',
    lore: 'Void Sovereigns have carved out territories in the nothingness, building empires where nothing should exist.',
    requiredLevel: 42, coinBonus: 75, xpBonus: 30,
  },
  {
    id: 'title_nyx_avatar', name: 'Nyx Avatar', emoji: '🌑',
    description: 'The supreme manifestation of Nyx herself, the living embodiment of eternal night.',
    lore: 'Nyx Avatars are so rare that only one has ever existed. They ARE the void — and the void is them.',
    requiredLevel: 50, coinBonus: 100, xpBonus: 40,
  },
];

// ============================================================
// SECTION 12: NV_ARTIFACTS — 6 Artifacts
// ============================================================

const NV_ARTIFACTS: NvArtifactDef[] = [
  {
    id: 'art_void_compass', name: 'Void Compass',
    description: 'A compass that points toward the nearest concentration of void energy, glowing purple in the darkness.',
    lore: 'The Void Compass was crafted by the first Void Walker from a shard of absolute nothingness. Its needle points toward entropy itself.',
    emoji: '🧭', rarity: 'rare', powerBonus: 15, cost: 500,
  },
  {
    id: 'art_shadow_mask', name: 'Mask of Endless Night',
    description: 'A mask carved from solid shadow that grants the wearer the ability to see in total darkness.',
    lore: 'The Mask of Endless Night was worn by the original Shadow Wraith king. When removed, the wearer realizes they have forgotten what light looks like.',
    emoji: '🎭', rarity: 'rare', powerBonus: 18, cost: 600,
  },
  {
    id: 'art_astral_orb', name: 'Orb of Astral Sight',
    description: 'A crystalline orb containing a captured star, pulsing with celestial energy and prophetic visions.',
    lore: 'The Orb of Astral Sight contains a real dwarf star, compressed to the size of a marble. Its light can illuminate any truth.',
    emoji: '🔮', rarity: 'epic', powerBonus: 30, cost: 1500,
  },
  {
    id: 'art_dark_matter_core', name: 'Contained Singularity',
    description: 'A micro black hole suspended in a void energy field, radiating immense gravitational power.',
    lore: 'The Contained Singularity is the most dangerous artifact in the void. If its containment field fails, it will consume everything within a light-year.',
    emoji: '⚫', rarity: 'epic', powerBonus: 40, cost: 2000,
  },
  {
    id: 'art_eclipse_crown', name: 'Crown of the Eternal Eclipse',
    description: 'A crown forged from solidified eclipse energy, granting dominion over celestial alignments.',
    lore: 'The Crown of the Eternal Eclipse was worn by Nyx herself in the age before ages. It grants the wearer the power to dim stars and darken suns.',
    emoji: '👑', rarity: 'legendary', powerBonus: 65, cost: 5000,
  },
  {
    id: 'art_nyx_heart', name: 'Heart of Nyx',
    description: 'The crystallized heart of the void itself, containing the primordial nothingness from which all things emerged.',
    lore: 'The Heart of Nyx is not an artifact — it is the void made manifest. To hold it is to hold the space between atoms, the silence between thoughts, the darkness between stars.',
    emoji: '💜', rarity: 'legendary', powerBonus: 80, cost: 8000,
  },
];

// ============================================================
// SECTION 13: NV_EVENTS — 8 Random Void Events
// ============================================================

const NV_EVENTS: NvEventDef[] = [
  {
    id: 'evt_void_surge', name: 'Void Surge',
    description: 'A massive surge of void energy sweeps through the domain, temporarily empowering all entities.',
    lore: 'Void Surges are caused by dimensional instability — when the barriers between realities thin, void energy floods through like a cosmic tsunami.',
    emoji: '🌊', effectType: 'buff', duration: 30000, rewardXp: 40, rewardCoins: 15,
    rewardMaterialId: 'void_essence', rewardMaterialCount: 5,
  },
  {
    id: 'evt_shadow_storm', name: 'Shadow Storm',
    description: 'A whirlwind of living shadows descends, obscuring vision and draining entity power.',
    lore: 'Shadow Storms are the weather of the void. Unlike material storms, they carry darkness instead of rain, and silence instead of thunder.',
    emoji: '🌪️', effectType: 'debuff', duration: 25000, rewardXp: 50, rewardCoins: 10,
    rewardMaterialId: 'shadow_crystal', rewardMaterialCount: 4,
  },
  {
    id: 'evt_starbirth', name: 'Starbirth',
    description: 'A new star ignites nearby, flooding the void with creative energy and radiant warmth.',
    lore: 'Starbirth events are rare and beautiful. A new star\'s first light provides a burst of creative energy that empowers all void structures.',
    emoji: '⭐', effectType: 'buff', duration: 30000, rewardXp: 35, rewardCoins: 25,
    rewardMaterialId: 'cosmic_ember', rewardMaterialCount: 3,
  },
  {
    id: 'evt_dark_matter_wave', name: 'Dark Matter Wave',
    description: 'An invisible wave of dark matter passes through, warping gravity and disorienting all entities.',
    lore: 'Dark Matter Waves are invisible but their effects are profound. Gravity fluctuates wildly, objects float, and the fabric of space stretches like rubber.',
    emoji: '🌊', effectType: 'debuff', duration: 20000, rewardXp: 45, rewardCoins: 15,
    rewardMaterialId: 'dark_matter_fragment', rewardMaterialCount: 2,
  },
  {
    id: 'evt_nebula_bloom', name: 'Nebula Bloom',
    description: 'A nearby nebula suddenly expands, releasing a shower of colorful gas and precious materials.',
    lore: 'Nebula Blooms are celebrations of cosmic fertility. The expanding gases carry rare elements forged in the hearts of dying stars.',
    emoji: '🌸', effectType: 'buff', duration: 20000, rewardXp: 30, rewardCoins: 20,
    rewardMaterialId: 'nebula_gas', rewardMaterialCount: 6,
  },
  {
    id: 'evt_dimensional_rift', name: 'Dimensional Rift',
    description: 'A rift tears open between dimensions, releasing strange entities and exotic materials.',
    lore: 'Dimensional Rifts are windows into parallel voids. Sometimes, entities from other realities slip through, carrying materials unknown in our dimension.',
    emoji: '🌀', effectType: 'special', duration: 15000, rewardXp: 60, rewardCoins: 0,
    rewardMaterialId: 'void_tendril', rewardMaterialCount: 2,
  },
  {
    id: 'evt_eclipse_passing', name: 'Eclipse Passing',
    description: 'A cosmic eclipse passes over the domain, granting temporary access to eclipse energies.',
    lore: 'Eclipse Passings are sacred moments in the void. The alignment of celestial bodies creates a brief window where eclipse energy flows freely.',
    emoji: '🌑', effectType: 'special', duration: 10000, rewardXp: 80, rewardCoins: 30,
    rewardMaterialId: 'eclipse_shard', rewardMaterialCount: 1,
  },
  {
    id: 'evt_void_whisper', name: 'Void Whisper',
    description: 'Ancient voices echo from the void, granting forbidden knowledge and insight.',
    lore: 'Void Whispers are the memories of dead civilizations, transmitted across the void through quantum entanglement. Those who listen gain wisdom — and madness.',
    emoji: '👻', effectType: 'special', duration: 20000, rewardXp: 55, rewardCoins: 5,
    rewardMaterialId: 'null_stone', rewardMaterialCount: 3,
  },
];

// ============================================================
// SECTION 14: HELPER FUNCTIONS
// ============================================================

function nvGenerateInstanceId(): string {
  return `nv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function nvPickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nvCalculateStructureCost(base: number, multiplier: number, level: number): number {
  return Math.floor(base * Math.pow(multiplier, level));
}

function nvCalculateLevelUp(needed: number, current: number, gained: number, setLevel: (v: number | ((prev: number) => number)) => void): number {
  const after = current + gained;
  if (after >= needed) {
    const overflow = after - needed;
    setLevel((prev) => prev + 1);
    return overflow;
  }
  return after;
}

// ============================================================
// SECTION 15: HOOK IMPLEMENTATION
// ============================================================

export default function useNyxVoid() {
  // ---- Core State ----
  const [nvLevel, setNvLevel] = useState(1);
  const [nvXp, setNvXp] = useState(NV_STARTING_XP);
  const [nvCoins, setNvCoins] = useState(NV_STARTING_COINS);
  const [nvTotalXp, setNvTotalXp] = useState(0);
  const [nvTotalCoins, setNvTotalCoins] = useState(0);

  // ---- Collection State ----
  const [nvEntities, setNvEntities] = useState<NvOwnedEntity[]>([]);
  const [nvInventory, setNvInventory] = useState<NvInventoryItem[]>([]);
  const [nvStructures, setNvStructures] = useState<NvStructureRecord[]>([]);
  const [nvArtifacts, setNvArtifacts] = useState<NvArtifactRecord[]>([]);
  const [nvAbilities, setNvAbilities] = useState<NvAbilityRecord[]>([]);
  const [nvAchievements, setNvAchievements] = useState<NvAchievementRecord[]>([]);
  const [nvZones, setNvZones] = useState<NvZoneRecord[]>([]);
  const [nvEventLog, setNvEventLog] = useState<NvEventLogEntry[]>([]);
  const [nvActiveEvent, setNvActiveEvent] = useState<string | null>(null);

  // ---- Title State ----
  const [nvCurrentTitle, setNvCurrentTitle] = useState('title_void_initiate');

  // ---- Stats State ----
  const [nvStats, setNvStats] = useState<NvStats>({
    totalSummoned: 0,
    totalZonesExplored: 0,
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
    nvLevel, nvXp, nvCoins, nvTotalXp, nvTotalCoins,
    nvEntities, nvInventory, nvStructures, nvArtifacts,
    nvAbilities, nvAchievements, nvZones, nvEventLog,
    nvActiveEvent, nvCurrentTitle, nvStats,
  });

  useEffect(() => {
    stateRef.current = {
      nvLevel, nvXp, nvCoins, nvTotalXp, nvTotalCoins,
      nvEntities, nvInventory, nvStructures, nvArtifacts,
      nvAbilities, nvAchievements, nvZones, nvEventLog,
      nvActiveEvent, nvCurrentTitle, nvStats,
    };
  }, [nvLevel, nvXp, nvCoins, nvTotalXp, nvTotalCoins,
    nvEntities, nvInventory, nvStructures, nvArtifacts,
    nvAbilities, nvAchievements, nvZones, nvEventLog,
    nvActiveEvent, nvCurrentTitle, nvStats]);

  // ============================================================
  // INITIALIZATION EFFECT
  // ============================================================

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      const saved = localStorage.getItem(NV_SAVE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.nvLevel) setNvLevel(data.nvLevel);
        if (data.nvXp) setNvXp(data.nvXp);
        if (data.nvCoins) setNvCoins(data.nvCoins);
        if (data.nvTotalXp) setNvTotalXp(data.nvTotalXp);
        if (data.nvTotalCoins) setNvTotalCoins(data.nvTotalCoins);
        if (data.nvEntities) setNvEntities(data.nvEntities);
        if (data.nvInventory) setNvInventory(data.nvInventory);
        if (data.nvStructures) setNvStructures(data.nvStructures);
        if (data.nvArtifacts) setNvArtifacts(data.nvArtifacts);
        if (data.nvAbilities) setNvAbilities(data.nvAbilities);
        if (data.nvAchievements) setNvAchievements(data.nvAchievements);
        if (data.nvZones) setNvZones(data.nvZones);
        if (data.nvEventLog) setNvEventLog(data.nvEventLog);
        if (data.nvActiveEvent) setNvActiveEvent(data.nvActiveEvent);
        if (data.nvCurrentTitle) setNvCurrentTitle(data.nvCurrentTitle);
        if (data.nvStats) setNvStats(data.nvStats);
        return;
      }
    } catch { /* corrupted data — start fresh */ }

    setNvZones(
      NV_ZONES.map((z) => ({
        zoneId: z.id,
        discovered: z.unlockLevel <= 1,
        explorationPercent: z.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setNvAbilities(
      NV_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setNvAchievements(
      NV_ACHIEVEMENTS.map((a) => ({
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
          nvLevel, nvXp, nvCoins, nvTotalXp, nvTotalCoins,
          nvEntities, nvInventory, nvStructures, nvArtifacts,
          nvAbilities, nvAchievements, nvZones, nvEventLog,
          nvActiveEvent, nvCurrentTitle, nvStats,
        };
        localStorage.setItem(NV_SAVE_KEY, JSON.stringify(saveData));
      } catch { /* storage full or unavailable */ }
    }, NV_AUTO_SAVE_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearInterval(autoSaveTimerRef.current);
        autoSaveTimerRef.current = null;
      }
    };
  }, [nvLevel, nvXp, nvCoins, nvTotalXp, nvTotalCoins,
    nvEntities, nvInventory, nvStructures, nvArtifacts,
    nvAbilities, nvAchievements, nvZones, nvEventLog,
    nvActiveEvent, nvCurrentTitle, nvStats]);

  // ============================================================
  // ACTIVE EVENT TIMER
  // ============================================================

  useEffect(() => {
    if (!nvActiveEvent) return;
    const evt = NV_EVENTS.find((e) => e.id === nvActiveEvent);
    if (!evt) return;

    const timer = setTimeout(() => {
      setNvActiveEvent(null);
      setNvEventLog((prev) =>
        prev.map((e) => (e.eventId === nvActiveEvent ? { ...e, resolved: true } : e)),
      );
    }, evt.duration);

    return () => clearTimeout(timer);
  }, [nvActiveEvent]);

  // ============================================================
  // TITLE PROGRESSION EFFECT
  // ============================================================

  useEffect(() => {
    const sorted = [...NV_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const highestEligible = sorted.filter((t) => nvLevel >= t.requiredLevel);
    if (highestEligible.length === 0) return;

    const currentTitle = sorted.find((t) => t.id === nvCurrentTitle);
    const currentIdx = currentTitle ? sorted.findIndex((t) => t.id === currentTitle.id) : -1;
    if (currentIdx < highestEligible.length - 1) {
      const nextTitle = highestEligible[highestEligible.length - 1];
      setNvCurrentTitle(nextTitle.id);
    }
  }, [nvLevel, nvCurrentTitle]);

  // ============================================================
  // HELPER: XP Calculation
  // ============================================================

  const xpForLevel = useCallback((lvl: number): number => {
    return Math.floor(NV_XP_BASE * Math.pow(lvl, NV_XP_SCALE));
  }, []);

  const xpToNextLevel = useCallback((): number => {
    const needed = xpForLevel(nvLevel + 1);
    return Math.max(0, needed - nvXp);
  }, [nvLevel, nvXp, xpForLevel]);

  const levelProgressPercent = useCallback((): number => {
    const needed = xpForLevel(nvLevel + 1);
    if (needed <= 0) return 100;
    return Math.min(Math.round((nvXp / needed) * 100), 100);
  }, [nvLevel, nvXp, xpForLevel]);

  // ============================================================
  // HELPERS: Lookups
  // ============================================================

  const getEntityDef = useCallback((id: string): NvEntityDef | undefined => {
    return NV_ENTITIES.find((e) => e.id === id);
  }, []);

  const getZoneDef = useCallback((id: string): NvZoneDef | undefined => {
    return NV_ZONES.find((z) => z.id === id);
  }, []);

  const getMaterialDef = useCallback((id: string): NvMaterialDef | undefined => {
    return NV_MATERIALS.find((m) => m.id === id);
  }, []);

  const getStructureDef = useCallback((id: string): NvStructureDef | undefined => {
    return NV_STRUCTURES.find((s) => s.id === id);
  }, []);

  const getAbilityDef = useCallback((id: string): NvAbilityDef | undefined => {
    return NV_ABILITIES.find((a) => a.id === id);
  }, []);

  const getArtifactDef = useCallback((id: string): NvArtifactDef | undefined => {
    return NV_ARTIFACTS.find((a) => a.id === id);
  }, []);

  const getAchievementDef = useCallback((id: string): NvAchievementDef | undefined => {
    return NV_ACHIEVEMENTS.find((a) => a.id === id);
  }, []);

  const getTitleDef = useCallback((id: string): NvTitleDef | undefined => {
    return NV_TITLES.find((t) => t.id === id);
  }, []);

  const getEventDef = useCallback((id: string): NvEventDef | undefined => {
    return NV_EVENTS.find((e) => e.id === id);
  }, []);

  const rarityMultiplier = useCallback((rarity: NvRarity): number => {
    switch (rarity) {
      case 'common': return 1;
      case 'uncommon': return 1.5;
      case 'rare': return 2.5;
      case 'epic': return 4;
      case 'legendary': return 7;
      default: return 1;
    }
  }, []);

  const rarityColor = useCallback((rarity: NvRarity): string => {
    return NV_RARITY_COLORS[rarity] || '#888888';
  }, []);

  const speciesColor = useCallback((species: NvSpecies): string => {
    return NV_SPECIES_COLORS[species] || '#888888';
  }, []);

  // ============================================================
  // CORE ACTION: summonEntity
  // ============================================================

  const summonEntity = useCallback((entityId: string): boolean => {
    const def = getEntityDef(entityId);
    if (!def) return false;
    if (nvCoins < def.cost) return false;

    const newEntity: NvOwnedEntity = {
      entityId: def.id,
      instanceId: nvGenerateInstanceId(),
      summonedAt: Date.now(),
      timesUsed: 0,
      nickname: '',
    };

    setNvCoins((prev) => prev - def.cost);
    setNvEntities((prev) => [...prev, newEntity]);

    const xpGained = Math.floor(def.xpReward * rarityMultiplier(def.rarity));
    const overflow = nvCalculateLevelUp(
      xpForLevel(nvLevel + 1),
      nvXp,
      xpGained,
      setNvLevel,
    );
    setNvXp(overflow);
    setNvTotalXp((prev) => prev + xpGained);
    setNvTotalCoins((prev) => prev + Math.floor(def.cost * 0.1));
    setNvStats((prev) => ({ ...prev, totalSummoned: prev.totalSummoned + 1 }));
    return true;
  }, [nvCoins, nvLevel, nvXp, getEntityDef, xpForLevel, rarityMultiplier]);

  // ============================================================
  // CORE ACTION: exploreVoid
  // ============================================================

  const exploreVoid = useCallback((zoneId: string): boolean => {
    const def = getZoneDef(zoneId);
    if (!def) return false;
    if (nvLevel < def.unlockLevel) return false;

    setNvZones((prev) =>
      prev.map((z) =>
        z.zoneId === zoneId
          ? {
              ...z,
              discovered: true,
              explorationPercent: Math.min(z.explorationPercent + 25, 100),
              lastExplored: Date.now(),
              totalVisits: z.totalVisits + 1,
              resourcesGathered: z.resourcesGathered + Math.floor(Math.random() * 3) + 1,
            }
          : z,
      ),
    );

    const bonusMat = nvPickRandom(def.resources);
    if (bonusMat) {
      setNvInventory((prev) => {
        const existing = prev.find((i) => i.materialId === bonusMat);
        if (existing) {
          return prev.map((i) =>
            i.materialId === bonusMat ? { ...i, count: Math.min(i.count + 1, NV_MAX_INVENTORY_ITEM) } : i,
          );
        }
        return [...prev, { materialId: bonusMat, count: 1 }];
      });
    }

    setNvTotalXp((prev) => prev + 15);
    setNvTotalCoins((prev) => prev + 5);
    setNvStats((prev) => ({ ...prev, totalZonesExplored: prev.totalZonesExplored + 1 }));
    return true;
  }, [nvLevel, getZoneDef]);

  // ============================================================
  // CORE ACTION: buildStructure
  // ============================================================

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = getStructureDef(structureId);
    if (!def) return false;
    const existing = nvStructures.find((s) => s.structureId === structureId);
    const currentLvl = existing ? existing.level : 0;
    if (currentLvl >= def.maxLevel) return false;

    const cost = nvCalculateStructureCost(def.baseCost, def.costMultiplier, currentLvl);
    if (nvCoins < cost) return false;

    setNvCoins((prev) => prev - cost);
    setNvStructures((prev) => {
      if (prev.find((s) => s.structureId === structureId)) {
        return prev.map((s) =>
          s.structureId === structureId
            ? { ...s, level: s.level + 1, totalUpgrades: s.totalUpgrades + 1 }
            : s,
        );
      }
      return [...prev, { structureId, level: 1, builtAt: Date.now(), totalUpgrades: 0 }];
    });

    setNvTotalXp((prev) => prev + 20);
    setNvStats((prev) => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
    return true;
  }, [nvCoins, nvStructures, getStructureDef]);

  // ============================================================
  // CORE ACTION: activateArtifact
  // ============================================================

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = getArtifactDef(artifactId);
    if (!def) return false;
    if (nvCoins < def.cost) return false;
    if (nvArtifacts.find((a) => a.artifactId === artifactId)?.activated) return false;

    setNvCoins((prev) => prev - def.cost);
    setNvArtifacts((prev) => {
      if (prev.find((a) => a.artifactId === artifactId)) {
        return prev.map((a) =>
          a.artifactId === artifactId
            ? { ...a, activated: true, activatedAt: Date.now(), timesUsed: a.timesUsed + 1 }
            : a,
        );
      }
      return [...prev, { artifactId, activated: true, activatedAt: Date.now(), timesUsed: 0 }];
    });
    setNvTotalXp((prev) => prev + 100);
    setNvStats((prev) => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [nvCoins, nvArtifacts, getArtifactDef]);

  // ============================================================
  // CORE ACTION: triggerVoidEvent
  // ============================================================

  const triggerVoidEvent = useCallback((): NvEventDef | null => {
    if (nvActiveEvent) return null;
    const event = nvPickRandom(NV_EVENTS);
    setNvActiveEvent(event.id);
    setNvEventLog((prev) => [
      ...prev,
      { eventId: event.id, triggeredAt: Date.now(), resolved: false, rewardGained: 0 },
    ]);

    setNvTotalXp((prev) => prev + event.rewardXp);
    setNvCoins((prev) => prev + event.rewardCoins);
    setNvTotalCoins((prev) => prev + event.rewardCoins);

    if (event.rewardMaterialId) {
      setNvInventory((prev) => {
        const existing = prev.find((i) => i.materialId === event.rewardMaterialId);
        if (existing) {
          return prev.map((i) =>
            i.materialId === event.rewardMaterialId
              ? { ...i, count: Math.min(i.count + event.rewardMaterialCount, NV_MAX_INVENTORY_ITEM) }
              : i,
          );
        }
        return [...prev, { materialId: event.rewardMaterialId, count: event.rewardMaterialCount }];
      });
    }

    return event;
  }, [nvActiveEvent]);

  // ============================================================
  // CORE ACTION: resetNyxVoid
  // ============================================================

  const resetNyxVoid = useCallback(() => {
    setNvLevel(1);
    setNvXp(0);
    setNvCoins(NV_STARTING_COINS);
    setNvTotalXp(0);
    setNvTotalCoins(0);
    setNvEntities([]);
    setNvInventory([]);
    setNvStructures([]);
    setNvArtifacts([]);
    setNvAbilities(
      NV_ABILITIES.map((a) => ({
        abilityId: a.id,
        unlocked: a.rarityRequired === 'common',
        lastUsedAt: 0,
        timesUsed: 0,
        currentCooldownEnd: 0,
      })),
    );
    setNvAchievements(
      NV_ACHIEVEMENTS.map((a) => ({ achievementId: a.id, unlocked: false, unlockedAt: 0 })),
    );
    setNvZones(
      NV_ZONES.map((z) => ({
        zoneId: z.id,
        discovered: z.unlockLevel <= 1,
        explorationPercent: z.unlockLevel <= 1 ? 25 : 0,
        lastExplored: 0,
        totalVisits: 0,
        resourcesGathered: 0,
      })),
    );
    setNvEventLog([]);
    setNvActiveEvent(null);
    setNvCurrentTitle('title_void_initiate');
    setNvStats({
      totalSummoned: 0, totalZonesExplored: 0, totalStructuresBuilt: 0,
      totalArtifacts: 0, totalEvents: 0, totalCoins: 0, totalXp: 0,
    });
    initializedRef.current = false;
    try { localStorage.removeItem(NV_SAVE_KEY); } catch { /* silent */ }
  }, []);

  // ============================================================
  // EXTENDED ACTION: discoverZone
  // ============================================================

  const discoverZone = useCallback((zoneId: string): boolean => {
    return exploreVoid(zoneId);
  }, [exploreVoid]);

  // ============================================================
  // EXTENDED ACTION: checkAndClaimAchievements
  // ============================================================

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];
    setNvStats((currentStats) => {
      setNvAchievements((prev) => {
        const conditions: Record<string, number> = {
          totalSummoned: currentStats.totalSummoned,
          totalZonesExplored: currentStats.totalZonesExplored,
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
            setNvTotalXp((xp) => xp + def.rewardXp);
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
    const record = nvAbilities.find((a) => a.abilityId === abilityId);
    if (!record?.unlocked) return false;

    const now = Date.now();
    if (record.currentCooldownEnd > now) return false;

    setNvAbilities((prev) =>
      prev.map((a) =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, timesUsed: a.timesUsed + 1, currentCooldownEnd: now + def.cooldown }
          : a,
      ),
    );
    setNvTotalXp((prev) => prev + 5);
    return true;
  }, [nvAbilities, getAbilityDef]);

  // ============================================================
  // TITLE SYSTEM COMPUTED
  // ============================================================

  const nvTitleProgress = useMemo((): NvTitleProgress => {
    const sorted = [...NV_TITLES].sort((a, b) => a.requiredLevel - b.requiredLevel);
    const current = sorted.find((t) => t.id === nvCurrentTitle) || sorted[0];
    const nextIdx = sorted.findIndex((t) => t.id === nvCurrentTitle) + 1;
    const next = nextIdx < sorted.length ? sorted[nextIdx] : null;
    const percent = next
      ? ((nvLevel - current.requiredLevel) / (next.requiredLevel - current.requiredLevel)) * 100
      : 100;
    return { current, next, percent: Math.min(Math.max(percent, 0), 100) };
  }, [nvLevel, nvCurrentTitle]);

  const currentTitleInfo = useMemo(() => nvTitleProgress.current, [nvTitleProgress]);

  const nextTitleInfo = useMemo(() => nvTitleProgress.next, [nvTitleProgress]);

  // ============================================================
  // STATS COMPUTED
  // ============================================================

  const statsSummary = useMemo(() => ({
    entitiesSummoned: nvEntities.length,
    zonesExplored: nvZones.filter((z) => z.discovered).length,
    structuresBuilt: nvStructures.length,
    artifactsActive: nvArtifacts.filter((a) => a.activated).length,
    achievementsUnlocked: nvAchievements.filter((a) => a.unlocked).length,
    abilitiesUnlocked: nvAbilities.filter((a) => a.unlocked).length,
    totalXp: nvTotalXp,
    totalCoins: nvTotalCoins,
    currentLevel: nvLevel,
    ownedSpeciesCount: new Set(nvEntities.map((e) => {
      const d = NV_ENTITIES.find((c) => c.id === e.entityId);
      return d?.species || '';
    })).size,
    totalEvents: nvEventLog.length,
  }), [nvEntities, nvZones, nvStructures, nvArtifacts,
    nvAchievements, nvAbilities, nvTotalXp, nvTotalCoins, nvLevel, nvEventLog]);

  const completionStats = useMemo(() => {
    const totalPossible =
      NV_ENTITIES.length +
      NV_ZONES.length +
      NV_STRUCTURES.length +
      NV_ARTIFACTS.length +
      NV_ACHIEVEMENTS.length +
      NV_ABILITIES.length;
    const completed =
      nvEntities.length +
      nvZones.filter((z) => z.discovered).length +
      nvStructures.length +
      nvArtifacts.filter((a) => a.activated).length +
      nvAchievements.filter((a) => a.unlocked).length +
      nvAbilities.filter((a) => a.unlocked).length;
    return {
      totalPossible,
      completed,
      percent: totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0,
      entityPercent: Math.round((nvEntities.length / NV_ENTITIES.length) * 100),
      zonePercent: Math.round((nvZones.filter((z) => z.discovered).length / NV_ZONES.length) * 100),
      structurePercent: Math.round((nvStructures.length / NV_STRUCTURES.length) * 100),
      artifactPercent: Math.round((nvArtifacts.filter((a) => a.activated).length / NV_ARTIFACTS.length) * 100),
      achievementPercent: Math.round((nvAchievements.filter((a) => a.unlocked).length / NV_ACHIEVEMENTS.length) * 100),
      abilityPercent: Math.round((nvAbilities.filter((a) => a.unlocked).length / NV_ABILITIES.length) * 100),
    };
  }, [nvEntities, nvZones, nvStructures, nvArtifacts, nvAchievements, nvAbilities]);

  // ============================================================
  // ENRICHED DATA
  // ============================================================

  const enrichedEntities = useMemo(() =>
    nvEntities.map((e) => ({
      ...e,
      def: getEntityDef(e.entityId),
    })),
  [nvEntities, getEntityDef]);

  const enrichedZones = useMemo(() =>
    nvZones.map((z) => ({
      ...z,
      def: getZoneDef(z.zoneId),
    })),
  [nvZones, getZoneDef]);

  const enrichedStructures = useMemo(() =>
    nvStructures.map((s) => ({
      ...s,
      def: getStructureDef(s.structureId),
      totalUpgrades: s.totalUpgrades,
      currentCost: nvCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      nextUpgradeCost: nvCalculateStructureCost(
        getStructureDef(s.structureId)?.baseCost || 0,
        getStructureDef(s.structureId)?.costMultiplier || 1,
        s.level,
      ),
      bonusProvided: s.level * (getStructureDef(s.structureId)?.bonusPerLevel || 0),
    })),
  [nvStructures, getStructureDef]);

  const enrichedInventory = useMemo(() =>
    nvInventory
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        def: getMaterialDef(item.materialId),
        totalValue: (getMaterialDef(item.materialId)?.value || 0) * item.count,
      })),
  [nvInventory, getMaterialDef]);

  const enrichedArtifacts = useMemo(() =>
    nvArtifacts.map((a) => ({
      ...a,
      def: getArtifactDef(a.artifactId),
    })),
  [nvArtifacts, getArtifactDef]);

  const enrichedAbilities = useMemo(() =>
    nvAbilities.map((a) => ({
      ...a,
      def: getAbilityDef(a.abilityId),
      isOnCooldown: a.currentCooldownEnd > Date.now(),
      cooldownRemaining: Math.max(0, a.currentCooldownEnd - Date.now()),
    })),
  [nvAbilities, getAbilityDef]);

  // ============================================================
  // COMPUTED DATA
  // ============================================================

  const entitiesBySpecies = useMemo(() => {
    const result: Record<string, typeof nvEntities> = {};
    for (const species of NV_SPECIES) {
      result[species.id] = nvEntities.filter((e) => {
        const def = getEntityDef(e.entityId);
        return def?.species === species.id;
      });
    }
    return result;
  }, [nvEntities, getEntityDef]);

  const entitiesByRarity = useMemo(() => {
    const rarities: NvRarity[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const result: Record<string, typeof nvEntities> = {};
    for (const r of rarities) {
      result[r] = nvEntities.filter((e) => {
        const def = getEntityDef(e.entityId);
        return def?.rarity === r;
      });
    }
    return result;
  }, [nvEntities, getEntityDef]);

  const availableCandidates = useMemo(() => {
    return NV_ENTITIES.filter((e) => e.cost <= nvCoins);
  }, [nvCoins]);

  const pendingAchievements = useMemo(() => {
    const conditions: Record<string, number> = {
      totalSummoned: nvStats.totalSummoned,
      totalZonesExplored: nvStats.totalZonesExplored,
      totalStructuresBuilt: nvStats.totalStructuresBuilt,
      totalArtifacts: nvStats.totalArtifacts,
      totalEvents: nvStats.totalEvents,
      totalCoins: nvStats.totalCoins,
      totalXp: nvStats.totalXp,
    };
    return NV_ACHIEVEMENTS.filter(
      (a) =>
        !nvAchievements.find((ach) => ach.achievementId === a.id)?.unlocked &&
        conditions[a.conditionKey] >= a.targetValue,
    );
  }, [nvStats, nvAchievements]);

  const recentEventLog = useMemo(() => {
    return [...nvEventLog].reverse().slice(0, 10);
  }, [nvEventLog]);

  const entitiesByPower = useMemo(() => {
    return [...nvEntities]
      .map((e) => ({ ...e, def: getEntityDef(e.entityId) }))
      .filter((e) => e.def !== undefined)
      .sort((a, b) => (b.def?.power || 0) - (a.def?.power || 0));
  }, [nvEntities, getEntityDef]);

  const topEntities = useMemo(() => {
    return entitiesByPower.slice(0, 10);
  }, [entitiesByPower]);

  const entitySpeciesBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of nvEntities) {
      const def = getEntityDef(e.entityId);
      if (def) {
        counts[def.species] = (counts[def.species] || 0) + 1;
      }
    }
    return counts;
  }, [nvEntities, getEntityDef]);

  const zoneExplorationMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const z of nvZones) {
      map[z.zoneId] = z.explorationPercent;
    }
    return map;
  }, [nvZones]);

  const structureLevelSum = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const s of nvStructures) {
      counts[s.level] = (counts[s.level] || 0) + 1;
    }
    return counts;
  }, [nvStructures]);

  const abilityUnlockMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const a of nvAbilities) {
      map[a.abilityId] = a.unlocked;
    }
    return map;
  }, [nvAbilities]);

  // ============================================================
  // RETURN — Pattern A: all constants directly on the API object
  // ============================================================

  return {
    // ---- Color Theme ----
    NV_VOID_PURPLE,
    NV_STARLIGHT,
    NV_SHADOW_BLACK,
    NV_COSMIC_BLUE,
    NV_NEBULA_PINK,
    NV_ASTRAL_GOLD,
    NV_DARK_RED,
    NV_RARITY_COLORS,
    NV_SPECIES_COLORS,
    NV_ALL_COLORS,

    // ---- Data Constants ----
    NV_SPECIES,
    NV_ENTITIES,
    NV_ZONES,
    NV_MATERIALS,
    NV_STRUCTURES,
    NV_ABILITIES,
    NV_ACHIEVEMENTS,
    NV_TITLES,
    NV_ARTIFACTS,
    NV_EVENTS,
    NV_MAX_LEVEL,
    NV_SAVE_KEY,
    NV_XP_BASE,
    NV_XP_SCALE,

    // ---- State ----
    nvLevel,
    nvXp,
    nvCoins,
    nvTotalXp,
    nvTotalCoins,
    nvEntities,
    nvInventory,
    nvStructures,
    nvArtifacts,
    nvAbilities,
    nvAchievements,
    nvZones,
    nvEventLog,
    nvActiveEvent,
    nvCurrentTitle,
    nvStats,

    // ---- Core Actions ----
    summonEntity,
    exploreVoid,
    buildStructure,
    activateArtifact,
    triggerVoidEvent,
    resetNyxVoid,

    // ---- Extended Actions ----
    discoverZone,
    checkAndClaimAchievements,
    useAbility,

    // ---- Title System ----
    currentTitleInfo,
    nextTitleInfo,
    nvTitleProgress,

    // ---- Stats ----
    statsSummary,
    completionStats,

    // ---- Enriched Data ----
    enrichedEntities,
    enrichedZones,
    enrichedStructures,
    enrichedInventory,
    enrichedArtifacts,
    enrichedAbilities,

    // ---- Computed Data ----
    entitiesBySpecies,
    entitiesByRarity,
    availableCandidates,
    pendingAchievements,
    recentEventLog,
    entitiesByPower,
    topEntities,
    entitySpeciesBreakdown,
    zoneExplorationMap,
    structureLevelSum,
    abilityUnlockMap,

    // ---- Helpers ----
    xpForLevel,
    xpToNextLevel,
    levelProgressPercent,
    getEntityDef,
    getZoneDef,
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
