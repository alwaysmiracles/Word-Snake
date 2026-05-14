// =============================================================================
// jade-forest-wire.ts — Jade Forest (翡翠森林) Game Module
// A jade-themed forest management system for the Word Snake game. Cultivate
// ancient jade trees, bond with mystical forest creatures, harvest precious
// materials, and purify corruption from the sacred groves.
// =============================================================================

import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// =============================================================================
// Types & Interfaces
// =============================================================================

export type JFRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type JFTreeType = 'jade' | 'crystal' | 'ancient' | 'mystic' | 'petrified';
export type JFHabitat = 'canopy' | 'undergrowth' | 'water' | 'cave' | 'spirit' | 'root';
export type JFSeason = 'spring' | 'summer' | 'autumn' | 'winter';

export interface JFGroveDef {
  id: string;
  name: string;
  description: string;
  dangerLevel: number;
  unlockLevel: number;
  capacity: number;
}

export interface JFTreeDef {
  id: string;
  name: string;
  rarity: JFRarity;
  type: JFTreeType;
  growthTime: number;
  jadeYield: number;
  description: string;
}

export interface JFFaunaDef {
  id: string;
  name: string;
  rarity: JFRarity;
  habitat: JFHabitat;
  description: string;
  abilities: string[];
}

export interface JFMaterialDef {
  id: string;
  name: string;
  rarity: JFRarity;
  source: string;
  description: string;
  value: number;
}

export interface JFStructureDef {
  id: string;
  name: string;
  maxLevel: number;
  baseCost: number;
  description: string;
  bonusPerLevel: string;
}

export interface JFAbilityDef {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  power: number;
}

export interface JFAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardExp: number;
  rewardGold: number;
}

export interface JFTitleDef {
  id: string;
  name: string;
  levelRequired: number;
  description: string;
}

export interface JFArtifactDef {
  id: string;
  name: string;
  description: string;
  power: number;
  rarity: JFRarity;
  effects: string[];
}

export interface JFSeasonDef {
  id: string;
  name: string;
  description: string;
  modifier: number;
  bonuses: string[];
}

export interface JFGroveInstance {
  defId: string;
  corruption: number;
  explored: boolean;
  treesPlanted: number;
  lastWatered: number;
}

export interface JFTreeInstance {
  instanceId: string;
  defId: string;
  groveId: string;
  plantedAt: number;
  growthProgress: number;
  isMature: boolean;
  health: number;
  watered: boolean;
  fertilized: boolean;
}

export interface JFFaunaInstance {
  instanceId: string;
  defId: string;
  bondedAt: number;
  bondStrength: number;
  lastFed: number;
}

export interface JFStructureInstance {
  instanceId: string;
  defId: string;
  level: number;
  builtAt: number;
}

export interface JFState {
  plantedTrees: JFTreeInstance[];
  groves: JFGroveInstance[];
  bondedFauna: JFFaunaInstance[];
  materials: Record<string, number>;
  structures: JFStructureInstance[];
  artifacts: string[];
  achievements: string[];
  currentTitle: string;
  forestLevel: number;
  forestExp: number;
  gold: number;
  jadeEnergy: number;
  currentSeason: number;
  seasonDay: number;
  totalPlanted: number;
  totalHarvested: number;
  totalFaunaBonded: number;
  corruptionLevel: number;
  purificationProgress: number;
  activeGroveId: string | null;
}

export interface JFActions {
  jfPlantTree: (treeDefId: string, groveId: string) => boolean;
  jfHarvestTree: (treeInstanceId: string) => number;
  jfExploreGrove: (groveId: string) => boolean;
  jfClearCorruption: (groveId: string) => number;
  jfBondFauna: (faunaId: string) => boolean;
  jfReleaseFauna: (instanceId: string) => boolean;
  jfCollectMaterial: (materialId: string) => number;
  jfCraftArtifact: (artifactId: string) => boolean;
  jfBuildStructure: (structDefId: string) => boolean;
  jfUpgradeStructure: (structId: string) => boolean;
  jfAdvanceSeason: () => void;
  jfPurifyForest: (amount: number) => number;
  jfWaterTrees: (groveId: string) => boolean;
  jfFertilize: (groveId: string) => boolean;
  jfUnlockTitle: (titleId: string) => boolean;
  jfClaimAchievement: (achievementId: string) => boolean;
  jfBuySeed: (treeDefId: string) => boolean;
  jfTradeMaterial: (matA: string, matB: string) => boolean;
  jfActivateArtifact: (artifactId: string) => boolean;
  jfSacrificeJade: (amount: number) => number;
}

export type JFStore = JFState & JFActions;

// =============================================================================
// Color Constants
// =============================================================================

export const JF_COLOR_JADE: string = '#00A86B';
export const JF_COLOR_CRYSTAL: string = '#7FFFD4';
export const JF_COLOR_MOSS: string = '#4A7023';
export const JF_COLOR_BAMBOO: string = '#8DB600';
export const JF_COLOR_ANCIENT: string = '#2F4F4F';
export const JF_COLOR_PETRIFIED: string = '#C4A882';
export const JF_COLOR_SPIRIT: string = '#98FB98';
export const JF_COLOR_AUTUMN: string = '#FF8C00';

// =============================================================================
// JF_GROVES — 8 Jade Groves
// =============================================================================

export const JF_GROVES: JFGroveDef[] = [
  {
    id: 'grove_emerald_canopy',
    name: 'Emerald Canopy',
    description: 'A towering cathedral of jade-leafed trees whose emerald canopy filters sunlight into shimmering green patterns. The oldest trees here predate the forest itself, their roots intertwined with ancient ley lines.',
    dangerLevel: 1,
    unlockLevel: 1,
    capacity: 8,
  },
  {
    id: 'grove_crystal_thicket',
    name: 'Crystal Thicket',
    description: 'A dense thicket where crystalline saplings refract light into dazzling prisms. Walking through feels like traversing a living kaleidoscope, each step revealing new colors and patterns.',
    dangerLevel: 2,
    unlockLevel: 5,
    capacity: 10,
  },
  {
    id: 'grove_ancient_root',
    name: 'Ancient Root',
    description: 'The deepest part of the forest where colossal root systems form underground caverns. Ancient wisdom is etched into the bark of trees that have stood since the world was young.',
    dangerLevel: 3,
    unlockLevel: 10,
    capacity: 12,
  },
  {
    id: 'grove_moss_garden',
    name: 'Moss Garden',
    description: 'A serene garden floor carpeted in thirty-seven varieties of enchanted moss. Each variety hums at a different frequency, creating a symphony of natural resonance that soothes the soul.',
    dangerLevel: 1,
    unlockLevel: 3,
    capacity: 8,
  },
  {
    id: 'grove_bamboo_sanctum',
    name: 'Bamboo Sanctum',
    description: 'Tall jade bamboo stalks form natural corridors leading to hidden meditation clearings. The bamboo grows so fast you can hear it creak and pop, reaching toward the sky with audible determination.',
    dangerLevel: 2,
    unlockLevel: 8,
    capacity: 10,
  },
  {
    id: 'grove_jade_waterfall',
    name: 'Jade Waterfall',
    description: 'A magnificent waterfall of liquid jade cascading down petrified cliffs. The mist carries microscopic jade particles that settle on nearby flora, accelerating their growth and enhancing their mystical properties.',
    dangerLevel: 4,
    unlockLevel: 15,
    capacity: 12,
  },
  {
    id: 'grove_spirit_hollow',
    name: 'Spirit Hollow',
    description: 'A natural amphitheater where forest spirits congregate during twilight hours. The air shimmers with ethereal energy, and whispering voices of ancient guardians echo through the moss-draped stones.',
    dangerLevel: 5,
    unlockLevel: 25,
    capacity: 14,
  },
  {
    id: 'grove_petrified_grove',
    name: 'Petrified Grove',
    description: 'A grove of trees turned to living stone over millennia. Despite their petrified appearance, they still grow — imperceptibly slow, but undeniably alive. Their rings contain the geological history of the forest.',
    dangerLevel: 6,
    unlockLevel: 35,
    capacity: 16,
  },
];

// =============================================================================
// JF_TREES — 35 Jade Tree Species (7 per rarity tier)
// =============================================================================

export const JF_TREES: JFTreeDef[] = [
  // ---- Common (7) ----
  {
    id: 'tree_green_jade_sapling',
    name: 'Green Jade Sapling',
    rarity: 'common',
    type: 'jade',
    growthTime: 120,
    jadeYield: 5,
    description: 'The most common jade tree, a humble sapling with leaves of soft green jade. Its sap is used in basic healing remedies and can be harvested multiple times per season.',
  },
  {
    id: 'tree_moss_draped_elder',
    name: 'Moss-Draped Elder',
    rarity: 'common',
    type: 'ancient',
    growthTime: 180,
    jadeYield: 8,
    description: 'An elder tree cloaked in a perpetual blanket of healing moss. Insects and small creatures make their homes in its generous canopy, creating a self-sustaining micro-ecosystem.',
  },
  {
    id: 'tree_crystal_bud_willow',
    name: 'Crystal Bud Willow',
    rarity: 'common',
    type: 'crystal',
    growthTime: 150,
    jadeYield: 6,
    description: 'A willow whose buds are tiny unopened crystals that chime softly in the breeze. When mature, the crystal buds bloom into prismatic flowers of remarkable clarity.',
  },
  {
    id: 'tree_bamboo_jade_reed',
    name: 'Bamboo Jade Reed',
    rarity: 'common',
    type: 'jade',
    growthTime: 90,
    jadeYield: 4,
    description: 'A fast-growing bamboo variant with jade-green segments. Each joint contains a small reservoir of jade nectar prized by forest creatures for its restorative properties.',
  },
  {
    id: 'tree_petrified_sprout',
    name: 'Petrified Sprout',
    rarity: 'common',
    type: 'petrified',
    growthTime: 240,
    jadeYield: 7,
    description: 'A young tree already beginning its slow transformation into living stone. Its bark has a granite-like texture, and its leaves feel cool and smooth like polished pebbles.',
  },
  {
    id: 'tree_mystic_hazel',
    name: 'Mystic Hazel',
    rarity: 'common',
    type: 'mystic',
    growthTime: 160,
    jadeYield: 6,
    description: 'A hazel tree whose nuts contain fragments of forgotten memories. Eating them grants brief flashes of insight into the forest\'s ancient past and its many secrets.',
  },
  {
    id: 'tree_creeper_ivy_jade',
    name: 'Jade Creeper Ivy',
    rarity: 'common',
    type: 'jade',
    growthTime: 100,
    jadeYield: 4,
    description: 'A vigorous ivy that climbs any surface with jade-tinted leaves. Its roots produce a weak adhesive used by forest creatures to repair their nests and dwellings.',
  },
  // ---- Uncommon (7) ----
  {
    id: 'tree_aquamarine_oak',
    name: 'Aquamarine Oak',
    rarity: 'uncommon',
    type: 'crystal',
    growthTime: 300,
    jadeYield: 15,
    description: 'A majestic oak whose heartwood contains veins of aquamarine crystal. Its acorns are crystalline spheres that glow with an inner blue-green light when the moon is full.',
  },
  {
    id: 'tree_ancient_mahogany',
    name: 'Ancient Mahogany',
    rarity: 'uncommon',
    type: 'ancient',
    growthTime: 360,
    jadeYield: 18,
    description: 'A massive mahogany whose wood has absorbed centuries of forest magic. Its rings glow faintly in the dark, each one a repository of knowledge from a different era.',
  },
  {
    id: 'tree_moss_heart_pine',
    name: 'Moss Heart Pine',
    rarity: 'uncommon',
    type: 'ancient',
    growthTime: 280,
    jadeYield: 14,
    description: 'A pine tree with a core of living moss that pumps healing essence through its trunk like a heartbeat. Standing near it induces a deep sense of calm and wellbeing.',
  },
  {
    id: 'tree_bamboo_echo',
    name: 'Echo Bamboo',
    rarity: 'uncommon',
    type: 'jade',
    growthTime: 200,
    jadeYield: 12,
    description: 'Bamboo that records and replays ambient sounds through its hollow segments. A grove of Echo Bamboo creates a haunting symphony of the forest\'s history.',
  },
  {
    id: 'tree_petrified_ironwood',
    name: 'Petrified Ironwood',
    rarity: 'uncommon',
    type: 'petrified',
    growthTime: 400,
    jadeYield: 16,
    description: 'A tree in mid-transformation to stone, with bark as hard as iron. Its wood is prized for crafting unbreakable tools and indestructible building materials.',
  },
  {
    id: 'tree_mystic_rowan',
    name: 'Mystic Rowan',
    rarity: 'uncommon',
    type: 'mystic',
    growthTime: 250,
    jadeYield: 13,
    description: 'A rowan tree that bears bright red berries of concentrated protective magic. Wearing a crown of its berries wards off corruption and malevolent spirits.',
  },
  {
    id: 'tree_crystal_maple',
    name: 'Crystal Maple',
    rarity: 'uncommon',
    type: 'crystal',
    growthTime: 320,
    jadeYield: 17,
    description: 'A maple whose leaves are thin crystal sheets that change color with the seasons. In autumn, they fall like glass rain, creating prismatic puddles on the forest floor.',
  },
  // ---- Rare (7) ----
  {
    id: 'tree_imperial_jade_cedar',
    name: 'Imperial Jade Cedar',
    rarity: 'rare',
    type: 'jade',
    growthTime: 600,
    jadeYield: 35,
    description: 'A towering cedar whose trunk is pure imperial jade of the deepest green. Its timber is worth more than gold, and a single ring can purify an entire grove of corruption.',
  },
  {
    id: 'tree_ghost_crystal_birch',
    name: 'Ghost Crystal Birch',
    rarity: 'rare',
    type: 'crystal',
    growthTime: 500,
    jadeYield: 30,
    description: 'A birch with bark of translucent crystal that reveals ghostly patterns within. On moonless nights, the patterns rearrange to form maps of hidden forest paths.',
  },
  {
    id: 'tree_world_root_ash',
    name: 'World Root Ash',
    rarity: 'rare',
    type: 'ancient',
    growthTime: 700,
    jadeYield: 40,
    description: 'An ash whose roots extend deep into the world\'s core. Its leaves tremble with seismic awareness, warning the forest of earthquakes, volcanic eruptions, and underground dangers.',
  },
  {
    id: 'tree_bamboo_dragon',
    name: 'Dragon Bamboo',
    rarity: 'rare',
    type: 'jade',
    growthTime: 450,
    jadeYield: 28,
    description: 'A bamboo species with scales like a dragon and jade-green segmented joints. When cut, it releases a roar that startles nearby creatures and echoes through the groves.',
  },
  {
    id: 'tree_petrified_fossil_oak',
    name: 'Fossil Oak',
    rarity: 'rare',
    type: 'petrified',
    growthTime: 800,
    jadeYield: 38,
    description: 'An oak preserved in amber-like stone for millions of years, yet somehow still alive. Its leaves are impressions in stone that photosynthesize through impossible geological processes.',
  },
  {
    id: 'tree_mystic_yew',
    name: 'Mystic Yew',
    rarity: 'rare',
    type: 'mystic',
    growthTime: 550,
    jadeYield: 32,
    description: 'A yew of legendary potency whose berries can extend life or end it, depending on preparation. Ancient druids planted these at the boundaries between the living world and the spirit realm.',
  },
  {
    id: 'tree_verdant_crystal_willow',
    name: 'Verdant Crystal Willow',
    rarity: 'rare',
    type: 'crystal',
    growthTime: 520,
    jadeYield: 33,
    description: 'A weeping willow whose trailing branches are chains of interlocking emerald crystals. Sitting beneath it during rainfall grants visions of possible futures.',
  },
  // ---- Epic (7) ----
  {
    id: 'tree_celestial_jade_magnolia',
    name: 'Celestial Jade Magnolia',
    rarity: 'epic',
    type: 'jade',
    growthTime: 1200,
    jadeYield: 75,
    description: 'A magnolia whose flowers bloom only during meteor showers, each petal containing a captured star. Its fragrance fills the entire forest with an otherworldly sweetness that heals all who breathe it.',
  },
  {
    id: 'tree_prismatic_crystal_sequoia',
    name: 'Prismatic Crystal Sequoia',
    rarity: 'epic',
    type: 'crystal',
    growthTime: 1500,
    jadeYield: 90,
    description: 'The tallest crystal tree in the forest, its trunk a column of rotating prisms that split light into rainbow beams. At noon on the summer solstice, it projects a spectrum across the entire grove.',
  },
  {
    id: 'tree_eternal_ancient_baobab',
    name: 'Eternal Ancient Baobab',
    rarity: 'epic',
    type: 'ancient',
    growthTime: 1800,
    jadeYield: 85,
    description: 'A baobab so old it has witnessed the birth and death of civilizations. Its hollow trunk contains a subterranean ecosystem complete with underground rivers and bioluminescent caves.',
  },
  {
    id: 'tree_bamboo_stormweaver',
    name: 'Stormweaver Bamboo',
    rarity: 'epic',
    type: 'jade',
    growthTime: 1000,
    jadeYield: 70,
    description: 'Bamboo that generates and controls electrical storms within its grove. Lightning strikes its tips and travels through its rhizome network, energizing the surrounding soil with nitrogen.',
  },
  {
    id: 'tree_petrified_titan_redwood',
    name: 'Titan Petrified Redwood',
    rarity: 'epic',
    type: 'petrified',
    growthTime: 2000,
    jadeYield: 100,
    description: 'A redwood transformed into a monolith of living granite over eons. Despite its stony exterior, it pulses with deep geological warmth, and creatures nest in its carved crevices.',
  },
  {
    id: 'tree_mystic_dreamwood',
    name: 'Mystic Dreamwood',
    rarity: 'epic',
    type: 'mystic',
    growthTime: 1300,
    jadeYield: 80,
    description: 'A tree that exists simultaneously in the physical world and the dream realm. Its wood is used to craft dream gates, and its sap induces prophetic visions when applied to the temples.',
  },
  {
    id: 'tree_ancient_verdant_yggdrasil',
    name: 'Verdant Yggdrasil Sapling',
    rarity: 'epic',
    type: 'ancient',
    growthTime: 2500,
    jadeYield: 110,
    description: 'A sapling descended from the legendary World Tree, containing a fraction of its cosmic power. Its roots connect to every grove in the Jade Forest through an invisible network.',
  },
  // ---- Legendary (7) ----
  {
    id: 'tree_dragon_heart_jade',
    name: 'Dragon Heart Jade',
    rarity: 'legendary',
    type: 'jade',
    growthTime: 5000,
    jadeYield: 250,
    description: 'A tree grown from the heart of an ancient jade dragon. Its trunk contains a crystallized dragon heart that beats once per century, sending a shockwave of pure jade energy through the forest.',
  },
  {
    id: 'tree_omni_crystal_worldtree',
    name: 'Omni-Crystal Arbor',
    rarity: 'legendary',
    type: 'crystal',
    growthTime: 6000,
    jadeYield: 300,
    description: 'The ultimate crystal tree, formed from every type of crystal in existence fused into a single organism. It resonates at a frequency that harmonizes all magical energies within range.',
  },
  {
    id: 'tree_primordial_ancient',
    name: 'Primordial Ancient',
    rarity: 'legendary',
    type: 'ancient',
    growthTime: 8000,
    jadeYield: 350,
    description: 'The oldest living organism in the Jade Forest, a tree that existed before the concept of forests itself. Its consciousness spans all of history, and its roots anchor reality itself.',
  },
  {
    id: 'tree_infinite_bamboo',
    name: 'Infinite Bamboo',
    rarity: 'legendary',
    type: 'jade',
    growthTime: 3000,
    jadeYield: 200,
    description: 'A bamboo that grows in all directions simultaneously, including through time. Its segments contain bottled moments from different eras, and cutting it releases temporal echoes.',
  },
  {
    id: 'tree_living_mountain_petrified',
    name: 'Living Mountain',
    rarity: 'legendary',
    type: 'petrified',
    growthTime: 10000,
    jadeYield: 400,
    description: 'A tree so thoroughly petrified it has become a small mountain. Its summit is a cloud-covered peak, and inside its stone trunk flow rivers of liquid jade that feed all groves below.',
  },
  {
    id: 'tree_void_mystic_elder',
    name: 'Void Mystic Elder',
    rarity: 'legendary',
    type: 'mystic',
    growthTime: 7000,
    jadeYield: 280,
    description: 'A mystic tree that draws power from the void between worlds. Its branches reach through dimensional barriers, bearing fruit that contains the essence of other realities.',
  },
  {
    id: 'tree_jade_emperor_sovereign',
    name: 'Jade Emperor Sovereign',
    rarity: 'legendary',
    type: 'jade',
    growthTime: 12000,
    jadeYield: 500,
    description: 'The supreme jade tree, rumored to be the physical incarnation of the Jade Emperor\'s will. Its leaves are coins of pure jade, and its shade grants absolute protection from corruption.',
  },
];

// =============================================================================
// JF_FAUNA — 35 Forest Creatures (7 per rarity tier)
// =============================================================================

export const JF_FAUNA: JFFaunaDef[] = [
  // ---- Common (7) ----
  {
    id: 'fauna_jade_squirrel',
    name: 'Jade Squirrel',
    rarity: 'common',
    habitat: 'canopy',
    description: 'A nimble squirrel with fur the color of polished jade. It hoards jade fragments in elaborate underground caches, sometimes uncovering buried treasures in the process.',
    abilities: ['Jade Sense', 'Quick Dig', 'Nut Shell Armor'],
  },
  {
    id: 'fauna_moss_beetle',
    name: 'Moss Beetle',
    rarity: 'common',
    habitat: 'undergrowth',
    description: 'A stout beetle covered in thick moss that camouflages it perfectly against the forest floor. It processes dead plant matter into rich fertilizer, essential for healthy soil.',
    abilities: ['Camouflage', 'Fertilize', 'Hard Shell'],
  },
  {
    id: 'fauna_crystal_frog',
    name: 'Crystal Frog',
    rarity: 'common',
    habitat: 'water',
    description: 'A translucent frog whose skin is a thin membrane of living crystal. Its croak produces a resonant chime that accelerates crystal growth in nearby trees.',
    abilities: ['Crystal Chime', 'Water Purity', 'Leap Strike'],
  },
  {
    id: 'fauna_bamboo_viper',
    name: 'Bamboo Viper',
    rarity: 'common',
    habitat: 'undergrowth',
    description: 'A slender green viper that nests inside bamboo stalks. Its venom is not lethal but induces vivid hallucinations of jade forests, used in shamanic rituals.',
    abilities: ['Bamboo Hide', 'Dream Venom', 'Constriction'],
  },
  {
    id: 'fauna_stone_ant',
    name: 'Stone Ant',
    rarity: 'common',
    habitat: 'root',
    description: 'Ants with exoskeletons of compressed stone that build elaborate underground cities. Their tunnels aerate the soil and channel groundwater to tree roots.',
    abilities: ['Stone Armor', 'Tunnel Network', 'Colony Strength'],
  },
  {
    id: 'fauna_leaf_moth',
    name: 'Leaf Moth',
    rarity: 'common',
    habitat: 'canopy',
    description: 'A large moth whose wings are indistinguishable from jade leaves. It pollinates jade trees by transferring crystalline pollen between groves on moonlit nights.',
    abilities: ['Leaf Mimicry', 'Crystal Pollen', 'Night Flight'],
  },
  {
    id: 'fauna_puddle_newt',
    name: 'Puddle Newt',
    rarity: 'common',
    habitat: 'water',
    description: 'A small newt that inhabits rainwater puddles. Its skin secretes a jade-tinted slime that heals minor wounds and purifies contaminated water sources.',
    abilities: ['Heal Slime', 'Puddle Hop', 'Water Sense'],
  },
  // ---- Uncommon (7) ----
  {
    id: 'fauna_jade_fox',
    name: 'Jade Fox',
    rarity: 'uncommon',
    habitat: 'undergrowth',
    description: 'A cunning fox with a coat that shimmers between green and gold. It is known to guide lost travelers to safety, but demands a jade offering in return.',
    abilities: ['Forest Guide', 'Jade Cloak', 'Cunning Strike'],
  },
  {
    id: 'fauna_crystal_deer',
    name: 'Crystal Deer',
    rarity: 'uncommon',
    habitat: 'canopy',
    description: 'A graceful deer whose antlers are branching crystal formations that change with the seasons. Shedding its antlers produces rare crystal shards scattered across the forest.',
    abilities: ['Crystal Antlers', 'Season Sense', 'Graceful Dodge'],
  },
  {
    id: 'fauna_moss_turtle',
    name: 'Moss Turtle',
    rarity: 'uncommon',
    habitat: 'water',
    description: 'A large turtle carrying a complete garden of moss and miniature flowers on its shell. Wherever it walks, new moss grows, creating paths of soft green carpet.',
    abilities: ['Living Garden', 'Shell Shield', 'Moss Trail'],
  },
  {
    id: 'fauna_bamboo_mantis',
    name: 'Bamboo Mantis',
    rarity: 'uncommon',
    habitat: 'undergrowth',
    description: 'A large praying mantis that stands perfectly still among bamboo stalks. Its forelimbs are sharp as jade blades, capable of cutting through corruption vines.',
    abilities: ['Bamboo Camouflage', 'Jade Blade', 'Precision Strike'],
  },
  {
    id: 'fauna_petrified_badger',
    name: 'Petrified Badger',
    rarity: 'uncommon',
    habitat: 'root',
    description: 'A badger with a hide of living stone that digs through the hardest rock. It unearths rare minerals and ancient fossils, bringing buried treasures to the surface.',
    abilities: ['Stone Dig', 'Mineral Sense', 'Tough Hide'],
  },
  {
    id: 'fauna_spirit_wren',
    name: 'Spirit Wren',
    rarity: 'uncommon',
    habitat: 'spirit',
    description: 'A small bird that flits between the material and spirit worlds. Its song bridges the two realms, allowing the living to hear messages from departed forest guardians.',
    abilities: '["Spirit Crossing", "Ghost Song", "Dimension Shift"]'.length
      ? ['Spirit Crossing', 'Ghost Song', 'Dimension Shift']
      : ['Spirit Crossing', 'Ghost Song'],
  },
  {
    id: 'fauna_cave_salamander',
    name: 'Cave Salamander',
    rarity: 'uncommon',
    habitat: 'cave',
    description: 'A bioluminescent salamander that illuminates underground caverns with a soft jade glow. It feeds on corruption crystals, converting them into harmless light.',
    abilities: ['Jade Glow', 'Corruption Eater', 'Cave Navigate'],
  },
  // ---- Rare (7) ----
  {
    id: 'fauna_jade_phoenix',
    name: 'Jade Phoenix',
    rarity: 'rare',
    habitat: 'canopy',
    description: 'A phoenix reborn in jade flame rather than fire. When it dies, it dissolves into a shower of jade fragments that fertilize the surrounding forest for years.',
    abilities: ['Jade Rebirth', 'Flame Purify', 'Swoop Attack'],
  },
  {
    id: 'fauna_crystal_serpent',
    name: 'Crystal Serpent',
    rarity: 'rare',
    habitat: 'cave',
    description: 'A massive serpent made of interlocking crystal scales. It slithers through underground crystal veins, reshaping them to create natural formations of breathtaking beauty.',
    abilities: ['Crystal Body', 'Vein Travel', 'Prismatic Gaze'],
  },
  {
    id: 'fauna_ancient_forest_bear',
    name: 'Ancient Forest Bear',
    rarity: 'rare',
    habitat: 'root',
    description: 'A bear of immense size and age, its fur interwoven with moss and ancient bark patterns. It is the guardian of the deepest root systems and can communicate with trees.',
    abilities: ['Root Speak', 'Ancient Strength', 'Forest Roar'],
  },
  {
    id: 'fauna_bamboo_dragon',
    name: 'Bamboo Dragon',
    rarity: 'rare',
    habitat: 'canopy',
    description: 'A small serpentine dragon that lives inside giant bamboo. It controls the growth of bamboo forests and can cause bamboo to grow or wither with a thought.',
    abilities: ['Bamboo Command', 'Wind Control', 'Serpentine Flight'],
  },
  {
    id: 'fauna_petrified_golem',
    name: 'Petrified Golem',
    rarity: 'rare',
    habitat: 'cave',
    description: 'A humanoid figure of living stone, animated by ancient earth magic. It patrols the deepest caves, protecting petrified trees from those who would harvest them prematurely.',
    abilities: ['Stone Body', 'Earth Shake', 'Petrify Gaze'],
  },
  {
    id: 'fauna_mystic_owl',
    name: 'Mystic Owl',
    rarity: 'rare',
    habitat: 'spirit',
    description: 'An owl with feathers that shimmer with arcane symbols. Its eyes see through all illusions and deceptions, and its hoots dispel dark magic in a wide radius.',
    abilities: ['True Sight', 'Arcane Hoot', 'Silent Flight'],
  },
  {
    id: 'fauna_spirit_stag',
    name: 'Spirit Stag',
    rarity: 'rare',
    habitat: 'spirit',
    description: 'A stag that exists primarily in the spirit world, visible only during twilight. Its antlers are branches of the spirit realm that bear fruit of pure emotional energy.',
    abilities: ['Spirit Walk', 'Emotion Harvest', 'Twilight Charge'],
  },
  // ---- Epic (7) ----
  {
    id: 'fauna_jade_dragon_whelp',
    name: 'Jade Dragon Whelp',
    rarity: 'epic',
    habitat: 'spirit',
    description: 'A young dragon of pure jade, still growing into its legendary power. Even as a whelp, its breath weapon can crystallize entire sections of corrupted forest, freezing corruption in amber.',
    abilities: ['Jade Breath', 'Crystal Scales', 'Ancient Wisdom'],
  },
  {
    id: 'fauna_crystal_titan',
    name: 'Crystal Titan',
    rarity: 'epic',
    habitat: 'cave',
    description: 'A being composed entirely of enormous crystals, standing thirty meters tall. It moves glacially slow, but each step causes crystal formations to erupt from the ground.',
    abilities: ['Titan Stomp', 'Crystal Storm', 'Prismatic Shield'],
  },
  {
    id: 'fauna_ancient_treant',
    name: 'Ancient Treant',
    rarity: 'epic',
    habitat: 'root',
    description: 'A sentient tree that has walked the forest for millennia. Its body is a living archive of forest history, and it can root itself to draw power from the deep earth.',
    abilities: ['Forest Walk', 'Deep Root', 'Living Archive'],
  },
  {
    id: 'fauna_bamboo_sovereign',
    name: 'Bamboo Sovereign',
    rarity: 'epic',
    habitat: 'canopy',
    description: 'The ruler of all bamboo in the Jade Forest, a towering bamboo entity that commands thousands of stalks simultaneously. Its court is a bamboo palace of impossible grandeur.',
    abilities: ['Bamboo Army', 'Sovereign Command', 'Wind Realm'],
  },
  {
    id: 'fauna_petrified_colossus',
    name: 'Petrified Colossus',
    rarity: 'epic',
    habitat: 'root',
    description: 'A mountain-sized golem of petrified wood that guards the boundary between the living forest and the petrified grove. Its footsteps are felt as earthquakes for miles.',
    abilities: ['Mountain Body', 'Epic Quake', 'Petrification Aura'],
  },
  {
    id: 'fauna_mystic_phenix',
    name: 'Mystic Phenix',
    rarity: 'epic',
    habitat: 'spirit',
    description: 'A phoenix that exists in multiple dimensions simultaneously. When it burns, it reforms from the combined essence of all its dimensional copies, each rebirth stronger than the last.',
    abilities: ['Dimension Burn', 'Multi-Form', 'Eternal Cycle'],
  },
  {
    id: 'fauna_spirit_guardian',
    name: 'Spirit Guardian',
    rarity: 'epic',
    habitat: 'spirit',
    description: 'The collective consciousness of thousands of departed forest spirits, united into a single protective entity. It manifests as a towering figure of swirling jade mist.',
    abilities: ['Spirit Army', 'Mist Form', 'Purify Aura'],
  },
  // ---- Legendary (7) ----
  {
    id: 'fauna_jade_emperor_dragon',
    name: 'Jade Emperor Dragon',
    rarity: 'legendary',
    habitat: 'spirit',
    description: 'The supreme dragon of the Jade Forest, a creature of immense power and ancient nobility. Its jade scales are harder than diamond, and its roar reshapes the landscape.',
    abilities: ['Emperor Roar', 'Jade Domain', 'Scale Shield', 'Dragon Sovereignty'],
  },
  {
    id: 'fauna_crystal_diamond_serpent',
    name: 'Diamond Crystal Serpent',
    rarity: 'legendary',
    habitat: 'cave',
    description: 'A serpent composed entirely of flawless diamond crystal that stretches for kilometers through underground caverns. Its body is a prism that refracts light from the surface into the deepest depths.',
    abilities: ['Diamond Body', 'Infinite Prism', 'Cavern Lord', 'Light Bending'],
  },
  {
    id: 'fauna_world_tree_guardian',
    name: 'World Tree Guardian',
    rarity: 'legendary',
    habitat: 'root',
    description: 'An immortal being born from the roots of the Primordial Ancient to protect the forest for all eternity. It has never been defeated and never will be.',
    abilities: ['Immortal Guard', 'Root Network', 'Forest Will', 'Eternal Vigil'],
  },
  {
    id: 'fauna_bamboo_ancestry_spirit',
    name: 'Bamboo Ancestry Spirit',
    rarity: 'legendary',
    habitat: 'canopy',
    description: 'The original spirit of bamboo, existing since the first stalk ever grew. It contains the genetic memory of every bamboo plant that has ever lived and can resurrect extinct species.',
    abilities: ['Ancestral Memory', 'Species Restore', 'Bamboo Genesis', 'Time Bamboo'],
  },
  {
    id: 'fauna_living_mountain',
    name: 'Living Mountain',
    rarity: 'legendary',
    habitat: 'root',
    description: 'A mountain that is also a creature, so massive its true form has never been fully observed. Forests grow on its back, rivers flow from its springs, and caves form its internal organs.',
    abilities: ['Mountain Form', 'Ecosystem', 'Tectonic Shift', 'Weather Control'],
  },
  {
    id: 'fauna_void_walker_stag',
    name: 'Void Walker Stag',
    rarity: 'legendary',
    habitat: 'spirit',
    description: 'A stag that walks between all dimensions simultaneously, visible in the Jade Forest only as a shimmering outline. Its antlers connect all realities, bridging worlds with each step.',
    abilities: ['Dimension Walk', 'Reality Bridge', 'Void Antlers', 'Omnipresence'],
  },
  {
    id: 'fauna_forest_soul_wyrm',
    name: 'Forest Soul Wyrm',
    rarity: 'legendary',
    habitat: 'spirit',
    description: 'The collective soul of the entire Jade Forest manifested as a colossal serpentine dragon of pure life energy. It is the forest, and the forest is it.',
    abilities: ['Forest Soul', 'Life Energy', 'Collective Mind', 'Ultimate Purify'],
  },
];

// =============================================================================
// JF_MATERIALS — 30 Forest Materials
// =============================================================================

export const JF_MATERIALS: JFMaterialDef[] = [
  // Common (10)
  { id: 'mat_jade_shard', name: 'Jade Shard', rarity: 'common', source: 'Jade Tree Harvest', description: 'A small fragment of raw jade chipped from tree bark during harvesting. The most basic material, used in countless recipes.', value: 5 },
  { id: 'mat_crystal_sap', name: 'Crystal Sap', rarity: 'common', source: 'Crystal Trees', description: 'Thick, syrupy sap that flows from crystal trees, glittering with trapped prismatic light. Essential for crafting crystal-based items.', value: 8 },
  { id: 'mat_moss_essence', name: 'Moss Essence', rarity: 'common', source: 'Moss Garden', description: 'A concentrated extract from enchanted moss, carrying the essence of growth and healing in every drop.', value: 6 },
  { id: 'mat_bamboo_fiber', name: 'Bamboo Fiber', rarity: 'common', source: 'Bamboo Sanctum', description: 'Strong yet flexible fibers harvested from jade bamboo, used in weaving, rope-making, and basic construction.', value: 4 },
  { id: 'mat_petrified_dust', name: 'Petrified Dust', rarity: 'common', source: 'Petrified Grove', description: 'Fine powder from grinding petrified wood, used as a strengthening additive in construction and alchemy.', value: 5 },
  { id: 'mat_forest_dew', name: 'Forest Dew', rarity: 'common', source: 'Morning Collection', description: 'Pure dew drops collected from jade leaves at dawn, containing concentrated life energy from the forest.', value: 3 },
  { id: 'mat_bark_moss', name: 'Bark Moss', rarity: 'common', source: 'Ancient Trees', description: 'Soft moss harvested from ancient tree bark, carrying memories and nutrients accumulated over centuries.', value: 4 },
  { id: 'mat_seed_pod', name: 'Jade Seed Pod', rarity: 'common', source: 'Tree Harvest', description: 'Protective pods containing jade tree seeds, each one a potential new beginning for the forest.', value: 7 },
  { id: 'mat_river_stone', name: 'River Stone', rarity: 'common', source: 'Jade Waterfall', description: 'Smooth stones polished by centuries of jade-infused waterfall water, warm to the touch and humming with earth magic.', value: 3 },
  { id: 'mat_fallen_leaf', name: 'Fallen Jade Leaf', rarity: 'common', source: 'Forest Floor', description: 'Jade leaves that have fallen from trees, retaining a fraction of their parent tree\'s magical properties.', value: 2 },
  // Uncommon (8)
  { id: 'mat_emerald_resin', name: 'Emerald Resin', rarity: 'uncommon', source: 'Ancient Trees', description: 'Deep green resin from the oldest jade trees, so concentrated it glows in the dark. A primary ingredient in artifact crafting.', value: 25 },
  { id: 'mat_crystal_bloom', name: 'Crystal Bloom', rarity: 'uncommon', source: 'Crystal Thicket', description: 'A fully opened crystal flower, its petals resonating with stored light energy. Blooms only under the full moon.', value: 30 },
  { id: 'mat_moss_crown', name: 'Moss Crown', rarity: 'uncommon', source: 'Moss Garden', description: 'A rare circular growth of moss that forms naturally on the heads of ancient statues. Grants enhanced nature affinity.', value: 28 },
  { id: 'mat_bamboo_core', name: 'Bamboo Core', rarity: 'uncommon', source: 'Bamboo Sanctum', description: 'The dense inner core of century-old bamboo, harder than steel and lighter than aluminum. Used in weapon and tool crafting.', value: 22 },
  { id: 'mat_petrified_heartwood', name: 'Petrified Heartwood', rarity: 'uncommon', source: 'Petrified Grove', description: 'The heartwood of a petrified tree, transformed into semiprecious stone while retaining its organic structure.', value: 35 },
  { id: 'mat_spirit_mist', name: 'Spirit Mist', rarity: 'uncommon', source: 'Spirit Hollow', description: 'Bottled mist from the Spirit Hollow, swirling with captured spirit energy. Used to open temporary portals to the spirit realm.', value: 20 },
  { id: 'mat_waterfall_essence', name: 'Waterfall Essence', rarity: 'uncommon', source: 'Jade Waterfall', description: 'Concentrated liquid jade from the base of the Jade Waterfall, carrying the purifying power of thousands of gallons of jade water.', value: 32 },
  { id: 'mat_ancient_bark', name: 'Ancient Bark', rarity: 'uncommon', source: 'Ancient Root', description: 'Bark from trees over a thousand years old, containing layers of accumulated forest magic and geological history.', value: 27 },
  // Rare (6)
  { id: 'mat_imperial_jade_gem', name: 'Imperial Jade Gem', rarity: 'rare', source: 'Imperial Trees', description: 'A flawless gem of imperial jade, the rarest and most valuable form of jade. Its green is so deep it appears black until light penetrates.', value: 100 },
  { id: 'mat_prismatic_shard', name: 'Prismatic Shard', rarity: 'rare', source: 'Crystal Trees', description: 'A fragment of pure crystal that splits light into perfect rainbow spectrums. The core component of crystal-based artifacts.', value: 120 },
  { id: 'mat_world_root_fragment', name: 'World Root Fragment', rarity: 'rare', source: 'Ancient Root', description: 'A piece of root from a tree connected to the world\'s ley lines. Humming with planetary energy, it vibrates at the earth\'s fundamental frequency.', value: 150 },
  { id: 'mat_living_amber', name: 'Living Amber', rarity: 'rare', source: 'Petrified Grove', description: 'Amber that is still alive, containing preserved ancient organisms that can be revived if properly treated. A window into prehistoric forest life.', value: 130 },
  { id: 'mat_dragon_scale_moss', name: 'Dragon Scale Moss', rarity: 'rare', source: 'Moss Garden', description: 'An ultra-rare moss that grows only where jade dragons have slept. Each scale-shaped cluster contains trace dragon essence.', value: 140 },
  { id: 'mat_storm_bamboo_node', name: 'Storm Bamboo Node', rarity: 'rare', source: 'Bamboo Sanctum', description: 'A bamboo joint containing captured lightning. The energy inside crackles and arcs, and when released, powers advanced machinery.', value: 110 },
  // Epic (4)
  { id: 'mat_celestial_jade_petal', name: 'Celestial Jade Petal', rarity: 'epic', source: 'Celestial Magnolia', description: 'A petal from the Celestial Jade Magnolia, containing the light of a captured star. It floats weightlessly and radiates warmth.', value: 400 },
  { id: 'mat_void_crystal_core', name: 'Void Crystal Core', rarity: 'epic', source: 'Crystal Titan', description: 'The heart of a crystal titan, a sphere of compressed void energy encased in unbreakable crystal. Powers legendary artifacts.', value: 500 },
  { id: 'mat_eternal_sap', name: 'Eternal Sap', rarity: 'epic', source: 'Eternal Ancient Baobab', description: 'Sap from a tree that has existed since the beginning of time. A single drop contains more life energy than a thousand regular jade trees.', value: 450 },
  { id: 'mat_primordial_bark', name: 'Primordial Bark', rarity: 'epic', source: 'Primordial Ancient', description: 'Bark from the oldest tree in existence, containing the raw material from which reality itself was constructed.', value: 550 },
  // Legendary (2)
  { id: 'mat_jade_emperor_tear', name: 'Jade Emperor Tear', rarity: 'legendary', source: 'Jade Emperor Dragon', description: 'A single tear shed by the Jade Emperor Dragon, containing a fraction of divine power. It can resurrect dead trees and purify any corruption.', value: 2000 },
  { id: 'mat_world_seed', name: 'World Seed', rarity: 'legendary', source: 'Jade Emperor Sovereign Tree', description: 'A seed from the Jade Emperor Sovereign Tree, containing the blueprint for an entirely new world. Its mere presence accelerates all growth.', value: 5000 },
];

// =============================================================================
// JF_STRUCTURES — 25 Upgradeable Forest Structures
// =============================================================================

export const JF_STRUCTURES: JFStructureDef[] = [
  { id: 'struct_jade_nursery', name: 'Jade Nursery', maxLevel: 10, baseCost: 50, description: 'A protected greenhouse where jade saplings are nurtured from seed to maturity with optimal conditions, shielding them from corruption and adverse weather.', bonusPerLevel: '+10% tree growth speed' },
  { id: 'struct_crystal_workshop', name: 'Crystal Workshop', maxLevel: 10, baseCost: 80, description: 'A workshop equipped with crystal-cutting tools and jade-polishing stations, essential for crafting artifacts and processing raw materials into refined goods.', bonusPerLevel: '+8% crafting success rate' },
  { id: 'struct_moss_sanctuary', name: 'Moss Sanctuary', maxLevel: 10, baseCost: 60, description: 'A peaceful sanctuary dedicated to the cultivation and study of moss varieties, providing healing benefits to all nearby trees and creatures.', bonusPerLevel: '+5 health regen for nearby trees' },
  { id: 'struct_bamboo_watchtower', name: 'Bamboo Watchtower', maxLevel: 10, baseCost: 70, description: 'A tall watchtower constructed from reinforced bamboo, providing an elevated vantage point to survey the entire forest and detect incoming corruption waves.', bonusPerLevel: '+15% corruption detection range' },
  { id: 'struct_waterfall_shrine', name: 'Waterfall Shrine', maxLevel: 10, baseCost: 100, description: 'A sacred shrine built at the base of the Jade Waterfall, harnessing the purifying power of liquid jade to cleanse corruption from the forest.', bonusPerLevel: '+12% purification efficiency' },
  { id: 'struct_ancient_archive', name: 'Ancient Archive', maxLevel: 10, baseCost: 120, description: 'A vast underground library carved into ancient roots, containing the accumulated knowledge of every druid who has ever tended the Jade Forest.', bonusPerLevel: '+10% experience gain' },
  { id: 'struct_spirit_altar', name: 'Spirit Altar', maxLevel: 10, baseCost: 150, description: 'An altar where offerings can be made to forest spirits, strengthening the bond between the material and spirit realms for mutual benefit.', bonusPerLevel: '+8% fauna bonding success rate' },
  { id: 'struct_petrified_quarry', name: 'Petrified Quarry', maxLevel: 10, baseCost: 90, description: 'A quarry that sustainably harvests petrified wood without harming living trees, providing rare materials for construction and crafting.', bonusPerLevel: '+2 petrified materials per harvest' },
  { id: 'struct_jade_refinery', name: 'Jade Refinery', maxLevel: 10, baseCost: 110, description: 'A refinery that processes raw jade fragments into refined jade gems of significantly higher quality and value.', bonusPerLevel: '+15% jade yield increase' },
  { id: 'struct_mystic_garden', name: 'Mystic Garden', maxLevel: 10, baseCost: 130, description: 'A garden where mystical plants are cultivated under enchanted conditions, producing rare ingredients unavailable elsewhere in the forest.', bonusPerLevel: '+1 rare material find per harvest' },
  { id: 'struct_bamboo_bridge', name: 'Bamboo Bridge', maxLevel: 10, baseCost: 65, description: 'A series of bamboo bridges spanning deep ravines and waterways, connecting previously isolated groves and expanding the accessible forest area.', bonusPerLevel: '+5% movement speed between groves' },
  { id: 'struct_crystal_lighthouse', name: 'Crystal Lighthouse', maxLevel: 10, baseCost: 140, description: 'A lighthouse of pure crystal that beams concentrated light into dark corners of the forest, revealing hidden paths and secret groves.', bonusPerLevel: '+10% exploration discovery rate' },
  { id: 'struct_moss_infirmary', name: 'Moss Infirmary', maxLevel: 10, baseCost: 75, description: 'A healing station where injured creatures and damaged trees are treated with advanced moss-based remedies and restorative jade applications.', bonusPerLevel: '+20% healing speed' },
  { id: 'struct_root_tunnel', name: 'Root Tunnel', maxLevel: 10, baseCost: 85, description: 'A network of tunnels carved through ancient root systems, providing safe underground travel between distant groves regardless of surface conditions.', bonusPerLevel: '+1 new tunnel connection per level' },
  { id: 'struct_jade_forge', name: 'Jade Forge', maxLevel: 10, baseCost: 160, description: 'A forge heated by concentrated jade energy, capable of smelting jade and crystal into tools, weapons, and structural components of remarkable quality.', bonusPerLevel: '+12% item quality improvement' },
  { id: 'struct_spirit_gateway', name: 'Spirit Gateway', maxLevel: 10, baseCost: 200, description: 'A permanent portal between the material world and the spirit realm, allowing regular communication and trade with forest spirits.', bonusPerLevel: '+5% spirit encounter rate' },
  { id: 'struct_ancient_observatory', name: 'Ancient Observatory', maxLevel: 10, baseCost: 170, description: 'An observatory built atop the tallest ancient tree, used to study celestial events and predict seasonal changes that affect the forest.', bonusPerLevel: '+8% seasonal bonus prediction accuracy' },
  { id: 'struct_petrified_fortress', name: 'Petrified Fortress', maxLevel: 10, baseCost: 250, description: 'A fortress of petrified wood defending the forest core against corruption. Its walls are as hard as granite and radiate anti-corruption energy.', bonusPerLevel: '+25 corruption defense per level' },
  { id: 'struct_bamboo_barracks', name: 'Bamboo Barracks', maxLevel: 10, baseCost: 95, description: 'A training ground where bonded fauna learn advanced abilities and form coordinated defense strategies against corruption incursions.', bonusPerLevel: '+10% fauna ability power' },
  { id: 'struct_crystal_vault', name: 'Crystal Vault', maxLevel: 10, baseCost: 180, description: 'A secure vault with walls of reinforced crystal for storing valuable jade gems, rare materials, and crafted artifacts under optimal preservation conditions.', bonusPerLevel: '+20% storage capacity' },
  { id: 'struct_jade_market', name: 'Jade Market', maxLevel: 10, baseCost: 100, description: 'A bustling marketplace where jade goods are traded with traveling merchants, forest spirits, and other collectors from distant lands.', bonusPerLevel: '+5% better trade prices' },
  { id: 'struct_moss_library', name: 'Moss Library', maxLevel: 10, baseCost: 135, description: 'A library where knowledge is encoded in living moss patterns that grow and evolve, containing dynamic information that updates with forest conditions.', bonusPerLevel: '+3 new recipes unlocked per level' },
  { id: 'struct_waterfall_mill', name: 'Waterfall Mill', maxLevel: 10, baseCost: 115, description: 'A mill powered by the Jade Waterfall that processes raw materials in bulk, significantly increasing production efficiency for all forest operations.', bonusPerLevel: '+10% all production speed' },
  { id: 'struct_spirit_council', name: 'Spirit Council Chamber', maxLevel: 10, baseCost: 220, description: 'A chamber where the spirits of the forest convene to discuss matters of importance. Their collective wisdom provides guidance and blessings.', bonusPerLevel: '+15% all spirit bonuses' },
  { id: 'struct_jade_palace', name: 'Jade Palace', maxLevel: 10, baseCost: 500, description: 'The ultimate structure — a palace of pure jade that serves as the seat of power for the Jade Forest. Every structure gains bonuses from its presence.', bonusPerLevel: '+3% bonus to all structures' },
];

// =============================================================================
// JF_ABILITIES — 22 Nature/Jade Abilities
// =============================================================================

export const JF_ABILITIES: JFAbilityDef[] = [
  { id: 'ability_jade_heal', name: 'Jade Heal', description: 'Channels jade energy to heal damaged trees and wounded creatures within a grove, restoring health and accelerating natural recovery processes.', cooldown: 5, power: 20 },
  { id: 'ability_crystal_shield', name: 'Crystal Shield', description: 'Raises a barrier of interlocking crystal shards around a grove, deflecting corruption and protecting all trees and creatures within its radius.', cooldown: 10, power: 30 },
  { id: 'ability_moss_bloom', name: 'Moss Bloom', description: 'Causes rapid moss growth across a wide area, fertilizing soil, healing damaged roots, and creating new habitats for beneficial insects and small creatures.', cooldown: 8, power: 25 },
  { id: 'ability_bamboo_barrage', name: 'Bamboo Barrage', description: 'Launches a volley of sharpened bamboo stalks that pierce corruption nodes, destroying them and preventing their spread to nearby trees.', cooldown: 6, power: 35 },
  { id: 'ability_petrify_ground', name: 'Petrify Ground', description: 'Transforms the ground beneath corruption into solid stone, sealing it away and preventing it from contaminating the soil or spreading to healthy areas.', cooldown: 15, power: 40 },
  { id: 'ability_spirit_call', name: 'Spirit Call', description: 'Summons friendly forest spirits to assist with purifying corruption, healing trees, and guiding lost creatures back to their habitats.', cooldown: 20, power: 45 },
  { id: 'ability_jade_rain', name: 'Jade Rain', description: 'Summons a rain of liquid jade that nourishes all trees in the forest simultaneously, boosting growth, health, and jade yield for a full season.', cooldown: 30, power: 60 },
  { id: 'ability_crystal_prism', name: 'Crystal Prism', description: 'Creates a massive crystal prism that focuses sunlight into concentrated beams, supercharging photosynthesis in all crystal-type trees within range.', cooldown: 12, power: 35 },
  { id: 'ability_ancient_awakening', name: 'Ancient Awakening', description: 'Awakens the dormant power of the oldest trees in the forest, granting them temporary sentience and the ability to actively defend against corruption.', cooldown: 45, power: 80 },
  { id: 'ability_mystic_vision', name: 'Mystic Vision', description: 'Grants the ability to see hidden corruption pathways, underground root networks, and spirit realm overlays on the physical forest for strategic planning.', cooldown: 8, power: 15 },
  { id: 'ability_waterfall_purify', name: 'Waterfall Purify', description: 'Redirects the purifying flow of the Jade Waterfall to a targeted area, washing away corruption and restoring jade energy to depleted zones.', cooldown: 25, power: 70 },
  { id: 'ability_bamboo_whisper', name: 'Bamboo Whisper', description: 'Communicates through the bamboo network to coordinate bonded fauna, alerting them to corruption threats and directing them to defend key locations.', cooldown: 10, power: 20 },
  { id: 'ability_petrified_wall', name: 'Petrified Wall', description: 'Raises an impenetrable wall of petrified wood to block corruption advancement, buying time for purification efforts in threatened groves.', cooldown: 18, power: 55 },
  { id: 'ability_spirit_walk', name: 'Spirit Walk', description: 'Allows temporary passage into the spirit realm to consult with ancient forest guardians and retrieve knowledge lost to the material world.', cooldown: 30, power: 50 },
  { id: 'ability_jade_eruption', name: 'Jade Eruption', description: 'Causes the ground to erupt with jade crystals in a massive area, simultaneously destroying corruption and creating new crystal growth nodes.', cooldown: 40, power: 90 },
  { id: 'ability_crystal_overgrowth', name: 'Crystal Overgrowth', description: 'Triggers explosive crystal growth that encases corruption in prismatic shells, neutralizing it and converting the trapped energy into beneficial crystal formations.', cooldown: 35, power: 75 },
  { id: 'ability_moss_domain', name: 'Moss Domain', description: 'Transforms a large area into a moss paradise where corruption cannot exist, healing is tripled, and all nature-type creatures gain enhanced abilities.', cooldown: 50, power: 85 },
  { id: 'ability_ancient_roots', name: 'Ancient Roots', description: 'Activates the deep root network connecting all ancient trees, creating a forest-wide communication and energy distribution system for unified defense.', cooldown: 60, power: 100 },
  { id: 'ability_bamboo_maze', name: 'Bamboo Maze', description: 'Grows an instant bamboo labyrinth that confuses corruption entities, trapping them in dead ends where they can be safely purified.', cooldown: 22, power: 45 },
  { id: 'ability_petrified_golem', name: 'Petrified Golem', description: 'Animates a nearby petrified tree into a loyal golem that patrols the forest, automatically engaging and destroying any corruption it encounters.', cooldown: 55, power: 95 },
  { id: 'ability_jade_emperor_blessing', name: 'Jade Emperor Blessing', description: 'Channel the power of the Jade Emperor to grant a massive temporary boost to all forest operations — growth, yield, defense, and purification.', cooldown: 120, power: 200 },
  { id: 'ability_forest_soul_union', name: 'Forest Soul Union', description: 'The ultimate ability — temporarily merges with the collective consciousness of the Jade Forest, gaining god-like power over all natural forces.', cooldown: 300, power: 500 },
];

// =============================================================================
// JF_ACHIEVEMENTS — 18 Achievements
// =============================================================================

export const JF_ACHIEVEMENTS: JFAchievementDef[] = [
  { id: 'ach_first_sprout', name: 'First Sprout', description: 'Plant your very first jade tree in any grove', conditionKey: 'totalPlanted', targetValue: 1, rewardExp: 20, rewardGold: 10 },
  { id: 'ach_green_thumb', name: 'Green Thumb', description: 'Successfully plant 25 jade trees across all groves', conditionKey: 'totalPlanted', targetValue: 25, rewardExp: 100, rewardGold: 50 },
  { id: 'ach_master_gardener', name: 'Master Gardener', description: 'Accumulate 100 total planted trees throughout your forest career', conditionKey: 'totalPlanted', targetValue: 100, rewardExp: 500, rewardGold: 200 },
  { id: 'ach_first_harvest', name: 'First Harvest', description: 'Harvest your first mature jade tree for its jade yield', conditionKey: 'totalHarvested', targetValue: 1, rewardExp: 15, rewardGold: 20 },
  { id: 'ach_jade_tycoon', name: 'Jade Tycoon', description: 'Harvest a total of 50 jade trees across all groves', conditionKey: 'totalHarvested', targetValue: 50, rewardExp: 300, rewardGold: 150 },
  { id: 'ach_explorer', name: 'Forest Explorer', description: 'Explore and discover all 8 jade groves', conditionKey: 'grovesExplored', targetValue: 8, rewardExp: 200, rewardGold: 100 },
  { id: 'ach_purifier', name: 'Corruption Purifier', description: 'Reduce overall forest corruption level below 10%', conditionKey: 'corruptionCleared', targetValue: 90, rewardExp: 400, rewardGold: 200 },
  { id: 'ach_fauna_friend', name: 'Fauna Friend', description: 'Bond with your first forest creature', conditionKey: 'totalFaunaBonded', targetValue: 1, rewardExp: 25, rewardGold: 15 },
  { id: 'ach_beast_master', name: 'Beast Master', description: 'Bond with 10 different forest creatures', conditionKey: 'totalFaunaBonded', targetValue: 10, rewardExp: 250, rewardGold: 120 },
  { id: 'ach_architect', name: 'Forest Architect', description: 'Build your first forest structure', conditionKey: 'structuresBuilt', targetValue: 1, rewardExp: 30, rewardGold: 25 },
  { id: 'ach_master_builder', name: 'Master Builder', description: 'Construct 10 different forest structures', conditionKey: 'structuresBuilt', targetValue: 10, rewardExp: 350, rewardGold: 175 },
  { id: 'ach_artifact_collector', name: 'Artifact Collector', description: 'Craft or collect 5 unique jade artifacts', conditionKey: 'artifactsCollected', targetValue: 5, rewardExp: 200, rewardGold: 100 },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', description: 'Accumulate 500 units of jade materials in your inventory', conditionKey: 'totalMaterials', targetValue: 500, rewardExp: 300, rewardGold: 150 },
  { id: 'ach_seasonal_sage', name: 'Seasonal Sage', description: 'Advance through all 4 seasons at least once', conditionKey: 'seasonsAdvanced', targetValue: 4, rewardExp: 150, rewardGold: 75 },
  { id: 'ach_forest_level_10', name: 'Rising Warden', description: 'Reach forest level 10', conditionKey: 'forestLevel', targetValue: 10, rewardExp: 100, rewardGold: 50 },
  { id: 'ach_forest_level_25', name: 'Grove Keeper', description: 'Reach forest level 25', conditionKey: 'forestLevel', targetValue: 25, rewardExp: 500, rewardGold: 250 },
  { id: 'ach_forest_level_50', name: 'Jade Monarch', description: 'Reach forest level 50', conditionKey: 'forestLevel', targetValue: 50, rewardExp: 2000, rewardGold: 1000 },
  { id: 'ach_pristine_forest', name: 'Pristine Forest', description: 'Reduce corruption level to 0% and maintain it for 30 days', conditionKey: 'corruptionCleared', targetValue: 100, rewardExp: 1000, rewardGold: 500 },
];

// =============================================================================
// JF_TITLES — 8 Titles (Seedling → Jade Monarch)
// =============================================================================

export const JF_TITLES: JFTitleDef[] = [
  { id: 'title_seedling', name: 'Seedling', levelRequired: 1, description: 'A newcomer to the Jade Forest, taking their first steps among the ancient jade trees with wide eyes and boundless curiosity.' },
  { id: 'title_sprout', name: 'Sprout', levelRequired: 5, description: 'You have planted your roots in the Jade Forest and begun to understand the whispers of the jade leaves rustling in the wind.' },
  { id: 'title_sapling', name: 'Sapling', levelRequired: 10, description: 'Growing stronger with each passing season, your knowledge of jade cultivation deepens and the creatures of the forest recognize your dedication.' },
  { id: 'title_grove_tender', name: 'Grove Tender', levelRequired: 18, description: 'A trusted keeper of the jade groves, skilled in nurturing jade trees, healing corruption, and maintaining the delicate balance of the forest.' },
  { id: 'title_forest_warden', name: 'Forest Warden', levelRequired: 28, description: 'A respected guardian of the Jade Forest, commanding bonded creatures, wielding jade abilities, and leading the defense against encroaching corruption.' },
  { id: 'title_jade_sage', name: 'Jade Sage', levelRequired: 38, description: 'A master of jade knowledge, your wisdom rivals that of the ancient trees. Forest spirits seek your counsel, and corruption flees before your presence.' },
  { id: 'title_ancient_guardian', name: 'Ancient Guardian', levelRequired: 48, description: 'One of the legendary protectors of the Jade Forest, your bond with the land is unbreakable. The trees themselves bend to your will, and the spirits bow in reverence.' },
  { id: 'title_jade_monarch', name: 'Jade Monarch', levelRequired: 50, description: 'The supreme ruler of the Jade Forest, chosen by the Jade Emperor Dragon itself. Your power is absolute, your wisdom infinite, and your forest eternal.' },
];

// =============================================================================
// JF_ARTIFACTS — 15 Jade Artifacts
// =============================================================================

export const JF_ARTIFACTS: JFArtifactDef[] = [
  { id: 'artifact_jade_amulet', name: 'Jade Amulet', description: 'A pendant of polished imperial jade that pulses with the heartbeat of the forest, enhancing the wearer\'s connection to all living things.', power: 15, rarity: 'common', effects: ['+5% tree growth speed', '+3 jade energy per harvest'] },
  { id: 'artifact_crystal_prism_staff', name: 'Crystal Prism Staff', description: 'A staff topped with a rotating crystal prism that focuses sunlight into beams of concentrated growth energy for targeted tree acceleration.', power: 25, rarity: 'uncommon', effects: ['+10% crystal tree yield', 'Reveals hidden corruption'] },
  { id: 'artifact_moss_healing_ring', name: 'Moss Healing Ring', description: 'A ring woven from living moss that never dries, continuously emitting a gentle healing aura that repairs damaged trees and soothes injured creatures.', power: 20, rarity: 'common', effects: ['+5 health regen per tick', '+8% fauna bonding speed'] },
  { id: 'artifact_bamboo_war_fan', name: 'Bamboo War Fan', description: 'An elegant fan made of jade bamboo ribs and spirit silk, capable of generating powerful wind gusts that scatter corruption spores.', power: 30, rarity: 'uncommon', effects: ['+15% corruption clear speed', 'Wind damage to corruption nodes'] },
  { id: 'artifact_petrified_shield', name: 'Petrified Shield', description: 'A shield carved from the heartwood of the oldest petrified tree, its surface bearing the fossilized face of an ancient guardian.', power: 35, rarity: 'rare', effects: ['+20% corruption defense', 'Blocks 1 corruption wave per season'] },
  { id: 'artifact_ancient_root_crown', name: 'Ancient Root Crown', description: 'A crown of intertwined ancient roots that connects the wearer to the deep root network, granting awareness of everything happening underground.', power: 50, rarity: 'rare', effects: ['+25% underground corruption detection', '+10% all ancient tree bonuses'] },
  { id: 'artifact_mystic_orb', name: 'Mystic Forest Orb', description: 'A sphere of compressed mystic energy that shows the forest as a living map, highlighting areas of concern and opportunities for growth.', power: 40, rarity: 'rare', effects: ['Forest-wide awareness', '+12% exploration bonus'] },
  { id: 'artifact_waterfall_pendant', name: 'Waterfall Pendant', description: 'A vial of liquid jade from the Jade Waterfall set in a crystal bezel, its contents constantly flowing in an impossible miniature waterfall.', power: 45, rarity: 'rare', effects: ['+15% purification power', '+5 jade energy per season'] },
  { id: 'artifact_spirit_lantern', name: 'Spirit Lantern', description: 'A lantern fueled by spirit essence that illuminates both the material and spirit realms simultaneously, revealing hidden entities and paths.', power: 55, rarity: 'epic', effects: ['Spirit realm visibility', '+20% spirit encounter rate', '+10% fauna bonding'] },
  { id: 'artifact_jade_emperor_seal', name: 'Jade Emperor Seal', description: 'A seal bearing the mark of the Jade Emperor, granting authority over all lesser creatures and the ability to command jade elementals.', power: 70, rarity: 'epic', effects: ['+30% all jade yields', 'Command jade elementals', '+15% ability power'] },
  { id: 'artifact_crystal_heart', name: 'Crystal Heart', description: 'A massive crystal shaped like a heart that beats with pure energy, pumping jade essence through the entire forest network.', power: 80, rarity: 'epic', effects: ['+25% forest-wide growth', '+20% health for all trees', 'Auto-heals corruption'] },
  { id: 'artifact_world_root_scepter', name: 'World Root Scepter', description: 'A scepter carved from a fragment of the World Root, channeling the power of the planet itself through the wielder.', power: 90, rarity: 'epic', effects: ['+35% ancient tree power', 'Earth magic amplification', '+10% all structure bonuses'] },
  { id: 'artifact_dragon_jade_armor', name: 'Dragon Jade Armor', description: 'Armor forged from the shed scales of the Jade Emperor Dragon, each scale containing a fragment of draconic power.', power: 100, rarity: 'legendary', effects: ['+50% corruption immunity', 'Dragon aura protection', '+25% all stats'] },
  { id: 'artifact_eternal_moss_cloak', name: 'Eternal Moss Cloak', description: 'A cloak of living moss that has existed since the first forest, regenerating from any damage and providing unparalleled stealth in natural environments.', power: 85, rarity: 'legendary', effects: ['Perfect natural camouflage', 'Unlimited moss supply', '+30% creature bonding'] },
  { id: 'artifact_jade_emperor_crown', name: 'Jade Emperor Crown', description: 'The crown of the Jade Emperor himself, granting supreme authority over the entire Jade Forest and all its inhabitants, spirits, and elementals.', power: 200, rarity: 'legendary', effects: ['Supreme forest authority', '+50% all bonuses', 'Season control', 'Legendary creature attraction'] },
];

// =============================================================================
// JF_SEASONS — 4 Seasonal Effects
// =============================================================================

export const JF_SEASONS: JFSeasonDef[] = [
  {
    id: 'season_spring_bloom',
    name: 'Spring Bloom',
    description: 'The Jade Forest erupts in a symphony of new growth. Jade saplings burst from the soil, crystal buds begin to open, and the air is thick with the scent of moss and renewal. All growth rates are enhanced, and new life emerges from every corner.',
    modifier: 1.3,
    bonuses: ['+30% tree growth speed', '+20% material collection', 'Double moss essence drops', '+10% fauna bonding chance'],
  },
  {
    id: 'season_summer_growth',
    name: 'Summer Growth',
    description: 'The peak of jade energy, when the forest reaches its maximum vitality. Trees tower at their highest, crystal formations refract brilliant sunlight, and the Jade Waterfall flows at full force with purified jade liquid.',
    modifier: 1.5,
    bonuses: ['+50% jade yield from harvest', '+25% jade energy regeneration', 'Crystal trees bloom fully', '+15% ability power'],
  },
  {
    id: 'season_autumn_harvest',
    name: 'Autumn Harvest',
    description: 'A golden season of abundance when mature jade trees release their treasures. Crystal leaves fall like prismatic rain, and the forest floor becomes a carpet of jade fragments waiting to be collected.',
    modifier: 1.2,
    bonuses: ['+40% harvest quantity', '+30% gold from trades', 'Rare material find chance doubled', '+20% artifact crafting success'],
  },
  {
    id: 'season_winter_dormancy',
    name: 'Winter Dormancy',
    description: 'The forest rests under a blanket of jade-tinted snow. Growth slows but does not stop, and the quiet season allows for deep reflection, structure maintenance, and corruption hunting in the dormant groves.',
    modifier: 0.7,
    bonuses: ['+50% corruption detection', 'Structure upgrades cost 20% less', '+25% purification efficiency', 'Spirit realm connections strengthen'],
  },
];

// =============================================================================
// JF_MAX_LEVEL & Helpers
// =============================================================================

export const JF_MAX_LEVEL = 50;

function jfXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= JF_MAX_LEVEL) return Infinity;
  return Math.floor(100 * level * (1 + level * 0.15));
}

function jfClampLevel(lvl: number): number {
  return Math.max(1, Math.min(JF_MAX_LEVEL, lvl));
}

function jfRarityMultiplier(r: JFRarity): number {
  const map: Record<JFRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

function jfGenerateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function jfStructureCost(def: JFStructureDef, currentLevel: number): number {
  return Math.floor(def.baseCost * Math.pow(1.5, currentLevel));
}

// =============================================================================
// JF_INITIAL_STATE
// =============================================================================

const JF_INITIAL_STATE: JFState = {
  plantedTrees: [],
  groves: JF_GROVES.map((g) => ({
    defId: g.id,
    corruption: g.id === 'grove_emerald_canopy' ? 0 : 20 + Math.floor(Math.random() * 30),
    explored: g.id === 'grove_emerald_canopy',
    treesPlanted: 0,
    lastWatered: 0,
  })),
  bondedFauna: [],
  materials: {
    mat_jade_shard: 10,
    mat_crystal_sap: 5,
    mat_moss_essence: 5,
  },
  structures: [],
  artifacts: [],
  achievements: [],
  currentTitle: 'title_seedling',
  forestLevel: 1,
  forestExp: 0,
  gold: 100,
  jadeEnergy: 50,
  currentSeason: 0,
  seasonDay: 1,
  totalPlanted: 0,
  totalHarvested: 0,
  totalFaunaBonded: 0,
  corruptionLevel: 25,
  purificationProgress: 0,
  activeGroveId: 'grove_emerald_canopy',
};

// =============================================================================
// Zustand Store
// =============================================================================

export const useJFStore = create<JFStore>()(
  persist(
    (set, get) => ({
      ...JF_INITIAL_STATE,

      // =====================================================================
      // Tree Planting & Harvesting
      // =====================================================================

      jfPlantTree: (treeDefId: string, groveId: string) => {
        const s = get();
        const treeDef = JF_TREES.find((t) => t.id === treeDefId);
        const groveDef = JF_GROVES.find((g) => g.id === groveId);
        if (!treeDef || !groveDef) return false;

        const grove = s.groves.find((g) => g.defId === groveId);
        if (!grove || !grove.explored) return false;

        const treesInGrove = s.plantedTrees.filter((t) => t.groveId === groveId).length;
        if (treesInGrove >= groveDef.capacity) return false;

        const seedCost = Math.floor(5 * jfRarityMultiplier(treeDef.rarity));
        if (s.gold < seedCost) return false;

        const newInstance: JFTreeInstance = {
          instanceId: jfGenerateId('tree'),
          defId: treeDefId,
          groveId,
          plantedAt: Date.now(),
          growthProgress: 0,
          isMature: false,
          health: 100,
          watered: false,
          fertilized: false,
        };

        set((prev) => ({
          plantedTrees: [...prev.plantedTrees, newInstance],
          gold: prev.gold - seedCost,
          totalPlanted: prev.totalPlanted + 1,
          groves: prev.groves.map((g) =>
            g.defId === groveId ? { ...g, treesPlanted: g.treesPlanted + 1 } : g
          ),
        }));
        return true;
      },

      jfHarvestTree: (treeInstanceId: string) => {
        const s = get();
        const treeInst = s.plantedTrees.find((t) => t.instanceId === treeInstanceId);
        if (!treeInst || !treeInst.isMature) return 0;

        const treeDef = JF_TREES.find((t) => t.id === treeInst.defId);
        if (!treeDef) return 0;

        const seasonMultiplier = JF_SEASONS[s.currentSeason].modifier;
        const baseYield = treeDef.jadeYield;
        const totalYield = Math.floor(baseYield * seasonMultiplier);

        const nurseryBonus = s.structures
          .filter((inst) => inst.defId === 'struct_jade_nursery')
          .reduce((sum, inst) => sum + inst.level * 0.1, 0);

        const finalYield = Math.floor(totalYield * (1 + nurseryBonus));

        set((prev) => ({
          plantedTrees: prev.plantedTrees.filter((t) => t.instanceId !== treeInstanceId),
          jadeEnergy: prev.jadeEnergy + finalYield,
          totalHarvested: prev.totalHarvested + 1,
          forestExp: prev.forestExp + Math.floor(10 * jfRarityMultiplier(treeDef.rarity)),
          materials: {
            ...prev.materials,
            mat_jade_shard: (prev.materials['mat_jade_shard'] ?? 0) + Math.floor(finalYield * 0.5),
            mat_seed_pod: (prev.materials['mat_seed_pod'] ?? 0) + 1,
          },
        }));

        const newState = get();
        const exp = newState.forestExp;
        const lvl = newState.forestLevel;
        if (exp >= jfXpRequired(lvl) && lvl < JF_MAX_LEVEL) {
          set((prev) => {
            let newLvl = prev.forestLevel;
            let remaining = prev.forestExp;
            while (newLvl < JF_MAX_LEVEL && remaining >= jfXpRequired(newLvl)) {
              remaining -= jfXpRequired(newLvl);
              newLvl += 1;
            }
            if (newLvl >= JF_MAX_LEVEL) remaining = 0;
            return { forestLevel: jfClampLevel(newLvl), forestExp: remaining };
          });
        }

        return finalYield;
      },

      // =====================================================================
      // Grove Exploration & Corruption
      // =====================================================================

      jfExploreGrove: (groveId: string) => {
        const s = get();
        const groveDef = JF_GROVES.find((g) => g.id === groveId);
        if (!groveDef || s.forestLevel < groveDef.unlockLevel) return false;

        const grove = s.groves.find((g) => g.defId === groveId);
        if (!grove || grove.explored) return false;

        const energyCost = groveDef.dangerLevel * 10;
        if (s.jadeEnergy < energyCost) return false;

        set((prev) => ({
          groves: prev.groves.map((g) =>
            g.defId === groveId ? { ...g, explored: true } : g
          ),
          jadeEnergy: prev.jadeEnergy - energyCost,
          forestExp: prev.forestExp + groveDef.dangerLevel * 15,
          gold: prev.gold + groveDef.dangerLevel * 20,
          materials: {
            ...prev.materials,
            mat_jade_shard: (prev.materials['mat_jade_shard'] ?? 0) + groveDef.dangerLevel * 3,
            mat_forest_dew: (prev.materials['mat_forest_dew'] ?? 0) + groveDef.dangerLevel * 2,
          },
        }));
        return true;
      },

      jfClearCorruption: (groveId: string) => {
        const s = get();
        const grove = s.groves.find((g) => g.defId === groveId);
        if (!grove || grove.corruption <= 0) return 0;

        const clearAmount = 5 + s.structures
          .filter((inst) => inst.defId === 'struct_waterfall_shrine')
          .reduce((sum, inst) => sum + inst.level * 2, 0);

        const seasonBonus = s.currentSeason === 3 ? 0.25 : 0;
        const totalClear = Math.floor(clearAmount * (1 + seasonBonus));

        set((prev) => {
          const newCorruption = Math.max(0, prev.groves
            .find((g) => g.defId === groveId)?.corruption ?? 0) - totalClear;
          const avgCorruption = prev.groves
            .map((g) => g.defId === groveId ? newCorruption : g.corruption)
            .reduce((a, b) => a + b, 0) / prev.groves.length;
          return {
            groves: prev.groves.map((g) =>
              g.defId === groveId ? { ...g, corruption: newCorruption } : g
            ),
            corruptionLevel: Math.round(avgCorruption),
            purificationProgress: prev.purificationProgress + totalClear,
            jadeEnergy: prev.jadeEnergy + Math.floor(totalClear * 0.5),
          };
        });
        return totalClear;
      },

      // =====================================================================
      // Fauna Bonding
      // =====================================================================

      jfBondFauna: (faunaId: string) => {
        const s = get();
        const faunaDef = JF_FAUNA.find((f) => f.id === faunaId);
        if (!faunaDef) return false;

        const bondCost = Math.floor(20 * jfRarityMultiplier(faunaDef.rarity));
        if (s.jadeEnergy < bondCost) return false;

        const alreadyBonded = s.bondedFauna.some((f) => f.defId === faunaId);
        if (alreadyBonded) return false;

        const newBond: JFFaunaInstance = {
          instanceId: jfGenerateId('fauna'),
          defId: faunaId,
          bondedAt: Date.now(),
          bondStrength: 1,
          lastFed: Date.now(),
        };

        set((prev) => ({
          bondedFauna: [...prev.bondedFauna, newBond],
          jadeEnergy: prev.jadeEnergy - bondCost,
          totalFaunaBonded: prev.totalFaunaBonded + 1,
          forestExp: prev.forestExp + Math.floor(20 * jfRarityMultiplier(faunaDef.rarity)),
        }));
        return true;
      },

      jfReleaseFauna: (instanceId: string) => {
        const s = get();
        const bonded = s.bondedFauna.find((f) => f.instanceId === instanceId);
        if (!bonded) return false;

        const faunaDef = JF_FAUNA.find((f) => f.id === bonded.defId);
        const refund = faunaDef ? Math.floor(10 * jfRarityMultiplier(faunaDef.rarity)) : 5;

        set((prev) => ({
          bondedFauna: prev.bondedFauna.filter((f) => f.instanceId !== instanceId),
          jadeEnergy: prev.jadeEnergy + refund,
        }));
        return true;
      },

      // =====================================================================
      // Materials & Artifacts
      // =====================================================================

      jfCollectMaterial: (materialId: string) => {
        const s = get();
        const matDef = JF_MATERIALS.find((m) => m.id === materialId);
        if (!matDef) return 0;

        const baseAmount = Math.floor(3 * jfRarityMultiplier(matDef.rarity));
        const seasonBonus = s.currentSeason === 2 ? 2 : 0;
        const totalAmount = baseAmount + seasonBonus;

        set((prev) => ({
          materials: {
            ...prev.materials,
            [materialId]: (prev.materials[materialId] ?? 0) + totalAmount,
          },
          forestExp: prev.forestExp + Math.floor(5 * jfRarityMultiplier(matDef.rarity)),
        }));
        return totalAmount;
      },

      jfCraftArtifact: (artifactId: string) => {
        const s = get();
        const artifactDef = JF_ARTIFACTS.find((a) => a.id === artifactId);
        if (!artifactDef) return false;

        if (s.artifacts.includes(artifactId)) return false;

        const jadeCost = Math.floor(artifactDef.power * jfRarityMultiplier(artifactDef.rarity));
        if (s.jadeEnergy < jadeCost) return false;

        set((prev) => ({
          artifacts: [...prev.artifacts, artifactId],
          jadeEnergy: prev.jadeEnergy - jadeCost,
          forestExp: prev.forestExp + Math.floor(artifactDef.power * 2),
          gold: prev.gold + Math.floor(artifactDef.power * 5),
        }));
        return true;
      },

      // =====================================================================
      // Structures
      // =====================================================================

      jfBuildStructure: (structDefId: string) => {
        const s = get();
        const structDef = JF_STRUCTURES.find((d) => d.id === structDefId);
        if (!structDef) return false;

        const alreadyBuilt = s.structures.some((inst) => inst.defId === structDefId);
        if (alreadyBuilt) return false;

        if (s.gold < structDef.baseCost) return false;

        const newInst: JFStructureInstance = {
          instanceId: jfGenerateId('struct'),
          defId: structDefId,
          level: 1,
          builtAt: Date.now(),
        };

        set((prev) => ({
          structures: [...prev.structures, newInst],
          gold: prev.gold - structDef.baseCost,
          forestExp: prev.forestExp + 50,
        }));
        return true;
      },

      jfUpgradeStructure: (structId: string) => {
        const s = get();
        const inst = s.structures.find((i) => i.instanceId === structId);
        if (!inst) return false;

        const def = JF_STRUCTURES.find((d) => d.id === inst.defId);
        if (!def) return false;

        if (inst.level >= def.maxLevel) return false;

        const cost = jfStructureCost(def, inst.level);
        if (s.gold < cost) return false;

        set((prev) => ({
          structures: prev.structures.map((i) =>
            i.instanceId === structId ? { ...i, level: i.level + 1 } : i
          ),
          gold: prev.gold - cost,
          forestExp: prev.forestExp + 30,
        }));
        return true;
      },

      // =====================================================================
      // Seasons & Purification
      // =====================================================================

      jfAdvanceSeason: () => {
        set((prev) => {
          const nextSeason = (prev.currentSeason + 1) % 4;
          return {
            currentSeason: nextSeason,
            seasonDay: 1,
            jadeEnergy: prev.jadeEnergy + 25,
            forestExp: prev.forestExp + 20,
            plantedTrees: prev.plantedTrees.map((tree) => {
              const treeDef = JF_TREES.find((d) => d.id === tree.defId);
              if (!treeDef) return tree;
              const growthRate = 10 * JF_SEASONS[nextSeason].modifier;
              const newProgress = Math.min(100, tree.growthProgress + growthRate);
              return {
                ...tree,
                growthProgress: newProgress,
                isMature: newProgress >= 100 || tree.isMature,
                health: Math.min(100, tree.health + (nextSeason === 0 ? 5 : 0)),
                watered: false,
                fertilized: false,
              };
            }),
          };
        });
      },

      jfPurifyForest: (amount: number) => {
        const s = get();
        if (s.jadeEnergy < amount) return 0;

        const purificationPerEnergy = 0.5;
        const totalPurified = Math.floor(amount * purificationPerEnergy);

        set((prev) => {
          const newGroves = prev.groves.map((g) => ({
            ...g,
            corruption: Math.max(0, g.corruption - totalPurified / prev.groves.length),
          }));
          const avgCorruption = newGroves.reduce((sum, g) => sum + g.corruption, 0) / newGroves.length;
          return {
            groves: newGroves,
            jadeEnergy: prev.jadeEnergy - amount,
            corruptionLevel: Math.round(avgCorruption),
            purificationProgress: prev.purificationProgress + totalPurified,
          };
        });
        return totalPurified;
      },

      // =====================================================================
      // Watering & Fertilizing
      // =====================================================================

      jfWaterTrees: (groveId: string) => {
        const s = get();
        const grove = s.groves.find((g) => g.defId === groveId);
        if (!grove) return false;

        const energyCost = 5;
        if (s.jadeEnergy < energyCost) return false;

        set((prev) => ({
          jadeEnergy: prev.jadeEnergy - energyCost,
          plantedTrees: prev.plantedTrees.map((tree) =>
            tree.groveId === groveId
              ? { ...tree, watered: true, growthProgress: Math.min(100, tree.growthProgress + 5) }
              : tree
          ),
          groves: prev.groves.map((g) =>
            g.defId === groveId ? { ...g, lastWatered: Date.now() } : g
          ),
        }));
        return true;
      },

      jfFertilize: (groveId: string) => {
        const s = get();
        const grove = s.groves.find((g) => g.defId === groveId);
        if (!grove) return false;

        const hasMossEssence = (s.materials['mat_moss_essence'] ?? 0) >= 3;
        if (!hasMossEssence) return false;

        set((prev) => ({
          materials: {
            ...prev.materials,
            mat_moss_essence: (prev.materials['mat_moss_essence'] ?? 0) - 3,
          },
          plantedTrees: prev.plantedTrees.map((tree) =>
            tree.groveId === groveId
              ? { ...tree, fertilized: true, growthProgress: Math.min(100, tree.growthProgress + 15) }
              : tree
          ),
        }));
        return true;
      },

      // =====================================================================
      // Titles & Achievements
      // =====================================================================

      jfUnlockTitle: (titleId: string) => {
        const s = get();
        const titleDef = JF_TITLES.find((t) => t.id === titleId);
        if (!titleDef) return false;
        if (s.forestLevel < titleDef.levelRequired) return false;

        set({ currentTitle: titleId });
        return true;
      },

      jfClaimAchievement: (achievementId: string) => {
        const s = get();
        const achDef = JF_ACHIEVEMENTS.find((a) => a.id === achievementId);
        if (!achDef) return false;
        if (s.achievements.includes(achievementId)) return false;

        let conditionMet = false;
        switch (achDef.conditionKey) {
          case 'totalPlanted': conditionMet = s.totalPlanted >= achDef.targetValue; break;
          case 'totalHarvested': conditionMet = s.totalHarvested >= achDef.targetValue; break;
          case 'grovesExplored': conditionMet = s.groves.filter((g) => g.explored).length >= achDef.targetValue; break;
          case 'corruptionCleared': conditionMet = (100 - s.corruptionLevel) >= achDef.targetValue; break;
          case 'totalFaunaBonded': conditionMet = s.totalFaunaBonded >= achDef.targetValue; break;
          case 'structuresBuilt': conditionMet = s.structures.length >= achDef.targetValue; break;
          case 'artifactsCollected': conditionMet = s.artifacts.length >= achDef.targetValue; break;
          case 'totalMaterials': conditionMet = Object.values(s.materials).reduce((a, b) => a + b, 0) >= achDef.targetValue; break;
          case 'seasonsAdvanced': conditionMet = true; break;
          case 'forestLevel': conditionMet = s.forestLevel >= achDef.targetValue; break;
          default: conditionMet = false;
        }

        if (!conditionMet) return false;

        set((prev) => ({
          achievements: [...prev.achievements, achievementId],
          gold: prev.gold + achDef.rewardGold,
          forestExp: prev.forestExp + achDef.rewardExp,
        }));
        return true;
      },

      // =====================================================================
      // Trading & Seeds
      // =====================================================================

      jfBuySeed: (treeDefId: string) => {
        const s = get();
        const treeDef = JF_TREES.find((t) => t.id === treeDefId);
        if (!treeDef) return false;

        const cost = Math.floor(10 * jfRarityMultiplier(treeDef.rarity));
        if (s.gold < cost) return false;

        set((prev) => ({
          gold: prev.gold - cost,
          materials: {
            ...prev.materials,
            mat_seed_pod: (prev.materials['mat_seed_pod'] ?? 0) + 1,
          },
        }));
        return true;
      },

      jfTradeMaterial: (matA: string, matB: string) => {
        const s = get();
        const defA = JF_MATERIALS.find((m) => m.id === matA);
        const defB = JF_MATERIALS.find((m) => m.id === matB);
        if (!defA || !defB) return false;
        if (matA === matB) return false;

        const amountA = Math.max(1, Math.floor(5 * jfRarityMultiplier(defA.rarity)));
        if ((s.materials[matA] ?? 0) < amountA) return false;

        const amountB = Math.max(1, Math.floor(3 * jfRarityMultiplier(defB.rarity)));

        set((prev) => ({
          materials: {
            ...prev.materials,
            [matA]: (prev.materials[matA] ?? 0) - amountA,
            [matB]: (prev.materials[matB] ?? 0) + amountB,
          },
        }));
        return true;
      },

      // =====================================================================
      // Artifact Activation & Jade Sacrifice
      // =====================================================================

      jfActivateArtifact: (artifactId: string) => {
        const s = get();
        if (!s.artifacts.includes(artifactId)) return false;

        const artifactDef = JF_ARTIFACTS.find((a) => a.id === artifactId);
        if (!artifactDef) return false;

        set((prev) => ({
          jadeEnergy: prev.jadeEnergy + Math.floor(artifactDef.power * 0.3),
          forestExp: prev.forestExp + 10,
        }));
        return true;
      },

      jfSacrificeJade: (amount: number) => {
        const s = get();
        if (s.jadeEnergy < amount) return 0;

        const expGain = Math.floor(amount * 0.8);
        const goldGain = Math.floor(amount * 0.5);
        const purificationGain = Math.floor(amount * 0.2);

        set((prev) => {
          const newExp = prev.forestExp + expGain;
          let newLevel = prev.forestLevel;
          let remaining = newExp;
          while (newLevel < JF_MAX_LEVEL && remaining >= jfXpRequired(newLevel)) {
            remaining -= jfXpRequired(newLevel);
            newLevel += 1;
          }
          if (newLevel >= JF_MAX_LEVEL) remaining = 0;

          return {
            jadeEnergy: prev.jadeEnergy - amount,
            forestExp: remaining,
            forestLevel: jfClampLevel(newLevel),
            gold: prev.gold + goldGain,
            purificationProgress: prev.purificationProgress + purificationGain,
          };
        });
        return expGain;
      },
    }),
    {
      name: 'jade-forest-storage',
      partialize: (state) => ({
        plantedTrees: state.plantedTrees,
        groves: state.groves,
        bondedFauna: state.bondedFauna,
        materials: state.materials,
        structures: state.structures,
        artifacts: state.artifacts,
        achievements: state.achievements,
        currentTitle: state.currentTitle,
        forestLevel: state.forestLevel,
        forestExp: state.forestExp,
        gold: state.gold,
        jadeEnergy: state.jadeEnergy,
        currentSeason: state.currentSeason,
        seasonDay: state.seasonDay,
        totalPlanted: state.totalPlanted,
        totalHarvested: state.totalHarvested,
        totalFaunaBonded: state.totalFaunaBonded,
        corruptionLevel: state.corruptionLevel,
        purificationProgress: state.purificationProgress,
        activeGroveId: state.activeGroveId,
      }),
    }
  )
);

// =============================================================================
// Default Hook — useJadeForest()
// =============================================================================

export default function useJadeForest() {
  const state = useJFStore();

  // ---- Getter: jfGetPlantedTrees ----

  const jfGetPlantedTrees = useMemo(() => {
    return state.plantedTrees.map((tree) => {
      const def = JF_TREES.find((t) => t.id === tree.defId);
      const grove = JF_GROVES.find((g) => g.id === tree.groveId);
      return { tree, def: def ?? null, grove: grove ?? null };
    });
  }, [state]);

  // ---- Getter: jfGetGroveStatus ----

  const jfGetGroveStatus = useMemo(() => {
    return state.groves.map((grove) => {
      const def = JF_GROVES.find((g) => g.id === grove.defId);
      const treeCount = state.plantedTrees.filter((t) => t.groveId === grove.defId).length;
      const matureCount = state.plantedTrees.filter((t) => t.groveId === grove.defId && t.isMature).length;
      return {
        grove,
        def: def ?? null,
        treeCount,
        matureCount,
        isFull: def ? treeCount >= def.capacity : false,
      };
    });
  }, [state]);

  // ---- Getter: jfGetForestHealth ----

  const jfGetForestHealth = useMemo(() => {
    const totalTrees = state.plantedTrees.length;
    if (totalTrees === 0) return 100;
    const avgHealth = state.plantedTrees.reduce((sum, t) => sum + t.health, 0) / totalTrees;
    const corruptionPenalty = state.corruptionLevel * 0.5;
    return Math.max(0, Math.min(100, Math.round(avgHealth - corruptionPenalty)));
  }, [state]);

  // ---- Getter: jfGetMaterialInventory ----

  const jfGetMaterialInventory = useMemo(() => {
    return JF_MATERIALS.map((mat) => ({
      def: mat,
      quantity: state.materials[mat.id] ?? 0,
      totalValue: (state.materials[mat.id] ?? 0) * mat.value,
    })).filter((entry) => entry.quantity > 0);
  }, [state.materials]);

  // ---- Getter: jfGetOwnedArtifacts ----

  const jfGetOwnedArtifacts = useMemo(() => {
    return state.artifacts.map((id) => {
      const def = JF_ARTIFACTS.find((a) => a.id === id);
      return { def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [state.artifacts]);

  // ---- Getter: jfGetBondedFauna ----

  const jfGetBondedFauna = useMemo(() => {
    return state.bondedFauna.map((bond) => {
      const def = JF_FAUNA.find((f) => f.id === bond.defId);
      return { bond, def: def ?? null };
    }).filter((entry) => entry.def !== null);
  }, [state.bondedFauna]);

  // ---- Getter: jfGetAvailableStructures ----

  const jfGetAvailableStructures = useMemo(() => {
    const builtIds = new Set(state.structures.map((inst) => inst.defId));
    return JF_STRUCTURES
      .filter((def) => !builtIds.has(def.id))
      .map((def) => ({
        def,
        canAfford: state.gold >= def.baseCost,
      }));
  }, [state.structures, state.gold]);

  // ---- Getter: jfGetTotalJadeYield ----

  const jfGetTotalJadeYield = useMemo(() => {
    const matureTrees = state.plantedTrees.filter((t) => t.isMature);
    const seasonMult = JF_SEASONS[state.currentSeason].modifier;
    const nurseryBonus = state.structures
      .filter((inst) => inst.defId === 'struct_jade_nursery')
      .reduce((sum, inst) => sum + inst.level * 0.1, 0);
    const totalBase = matureTrees.reduce((sum, tree) => {
      const def = JF_TREES.find((d) => d.id === tree.defId);
      return sum + (def?.jadeYield ?? 0);
    }, 0);
    return Math.floor(totalBase * seasonMult * (1 + nurseryBonus));
  }, [state.plantedTrees, state.currentSeason, state.structures]);

  // ---- Getter: jfGetSeasonBonus ----

  const jfGetSeasonBonus = useMemo(() => {
    return JF_SEASONS[state.currentSeason];
  }, [state.currentSeason]);

  // ---- Getter: jfGetCorruptionLevel ----

  const jfGetCorruptionLevel = useMemo(() => {
    return {
      overall: state.corruptionLevel,
      groves: state.groves.map((g) => {
        const def = JF_GROVES.find((d) => d.id === g.defId);
        return { groveId: g.defId, name: def?.name ?? 'Unknown', corruption: g.corruption };
      }),
    };
  }, [state.corruptionLevel, state.groves]);

  // ---- Getter: jfGetNextTitle ----

  const jfGetNextTitle = useMemo(() => {
    const currentIdx = JF_TITLES.findIndex((t) => t.id === state.currentTitle);
    if (currentIdx >= JF_TITLES.length - 1) return null;
    return JF_TITLES[currentIdx + 1] ?? null;
  }, [state.currentTitle]);

  // ---- Getter: jfGetRaritySummary ----

  const jfGetRaritySummary = useMemo(() => {
    const trees: Record<JFRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const fauna: Record<JFRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const materials: Record<JFRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    const artifacts: Record<JFRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };

    for (const tree of state.plantedTrees) {
      const def = JF_TREES.find((d) => d.id === tree.defId);
      if (def) trees[def.rarity] += 1;
    }
    for (const bond of state.bondedFauna) {
      const def = JF_FAUNA.find((d) => d.id === bond.defId);
      if (def) fauna[def.rarity] += 1;
    }
    for (const [matId, qty] of Object.entries(state.materials)) {
      if (qty > 0) {
        const def = JF_MATERIALS.find((d) => d.id === matId);
        if (def) materials[def.rarity] += qty;
      }
    }
    for (const artId of state.artifacts) {
      const def = JF_ARTIFACTS.find((d) => d.id === artId);
      if (def) artifacts[def.rarity] += 1;
    }

    return { trees, fauna, materials, artifacts };
  }, [state]);

  // ---- Getter: jfGetUnlockedAchievements ----

  const jfGetUnlockedAchievements = useMemo(() => {
    return JF_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id)).map((a) => {
      let met = false;
      switch (a.conditionKey) {
        case 'totalPlanted': met = state.totalPlanted >= a.targetValue; break;
        case 'totalHarvested': met = state.totalHarvested >= a.targetValue; break;
        case 'grovesExplored': met = state.groves.filter((g) => g.explored).length >= a.targetValue; break;
        case 'corruptionCleared': met = (100 - state.corruptionLevel) >= a.targetValue; break;
        case 'totalFaunaBonded': met = state.totalFaunaBonded >= a.targetValue; break;
        case 'structuresBuilt': met = state.structures.length >= a.targetValue; break;
        case 'artifactsCollected': met = state.artifacts.length >= a.targetValue; break;
        case 'totalMaterials': met = Object.values(state.materials).reduce((a, b) => a + b, 0) >= a.targetValue; break;
        case 'seasonsAdvanced': met = true; break;
        case 'forestLevel': met = state.forestLevel >= a.targetValue; break;
        default: met = false;
      }
      return { def: a, met, unlocked: true };
    });
  }, [state]);

  // ---- Getter: jfGetTitleProgress ----

  const jfGetTitleProgress = useMemo(() => {
    const current = JF_TITLES.find((t) => t.id === state.currentTitle);
    const next = jfGetNextTitle;
    return {
      current,
      next,
      levelProgress: state.forestExp,
      levelTillNext: jfXpRequired(state.forestLevel),
      percentToNext: jfXpRequired(state.forestLevel) > 0
        ? Math.min(100, Math.round((state.forestExp / jfXpRequired(state.forestLevel)) * 100))
        : 100,
    };
  }, [state.currentTitle, state.forestLevel, state.forestExp]);

  // ---- Getter: jfGetCraftableArtifacts ----

  const jfGetCraftableArtifacts = useMemo(() => {
    return JF_ARTIFACTS.filter((a) => !state.artifacts.includes(a.id)).map((a) => {
      const jadeCost = Math.floor(a.power * jfRarityMultiplier(a.rarity));
      return { def: a, canAfford: state.jadeEnergy >= jadeCost, cost: jadeCost };
    });
  }, [state.artifacts, state.jadeEnergy]);

  // ---- Getter: jfGetActiveSeason ----

  const jfGetActiveSeason = useMemo(() => {
    const season = JF_SEASONS[state.currentSeason];
    return {
      ...season,
      day: state.seasonDay,
      index: state.currentSeason,
    };
  }, [state.currentSeason, state.seasonDay]);

  // ---- Return the jfAPI object ----

  return {
    // ---- Constants ----
    JF_GROVES,
    JF_TREES,
    JF_FAUNA,
    JF_MATERIALS,
    JF_STRUCTURES,
    JF_ABILITIES,
    JF_ACHIEVEMENTS,
    JF_TITLES,
    JF_ARTIFACTS,
    JF_SEASONS,
    JF_COLOR_JADE,
    JF_COLOR_CRYSTAL,
    JF_COLOR_MOSS,
    JF_COLOR_BAMBOO,
    JF_COLOR_ANCIENT,
    JF_COLOR_PETRIFIED,
    JF_COLOR_SPIRIT,
    JF_COLOR_AUTUMN,
    JF_MAX_LEVEL,

    // ---- State ----
    plantedTrees: state.plantedTrees,
    groves: state.groves,
    bondedFauna: state.bondedFauna,
    materials: state.materials,
    structures: state.structures,
    artifacts: state.artifacts,
    achievements: state.achievements,
    currentTitle: state.currentTitle,
    forestLevel: state.forestLevel,
    forestExp: state.forestExp,
    gold: state.gold,
    jadeEnergy: state.jadeEnergy,
    currentSeason: state.currentSeason,
    seasonDay: state.seasonDay,
    totalPlanted: state.totalPlanted,
    totalHarvested: state.totalHarvested,
    totalFaunaBonded: state.totalFaunaBonded,
    corruptionLevel: state.corruptionLevel,
    purificationProgress: state.purificationProgress,
    activeGroveId: state.activeGroveId,

    // ---- Actions ----
    jfPlantTree: state.jfPlantTree,
    jfHarvestTree: state.jfHarvestTree,
    jfExploreGrove: state.jfExploreGrove,
    jfClearCorruption: state.jfClearCorruption,
    jfBondFauna: state.jfBondFauna,
    jfReleaseFauna: state.jfReleaseFauna,
    jfCollectMaterial: state.jfCollectMaterial,
    jfCraftArtifact: state.jfCraftArtifact,
    jfBuildStructure: state.jfBuildStructure,
    jfUpgradeStructure: state.jfUpgradeStructure,
    jfAdvanceSeason: state.jfAdvanceSeason,
    jfPurifyForest: state.jfPurifyForest,
    jfWaterTrees: state.jfWaterTrees,
    jfFertilize: state.jfFertilize,
    jfUnlockTitle: state.jfUnlockTitle,
    jfClaimAchievement: state.jfClaimAchievement,
    jfBuySeed: state.jfBuySeed,
    jfTradeMaterial: state.jfTradeMaterial,
    jfActivateArtifact: state.jfActivateArtifact,
    jfSacrificeJade: state.jfSacrificeJade,

    // ---- Getters ----
    jfGetPlantedTrees,
    jfGetGroveStatus,
    jfGetForestHealth,
    jfGetMaterialInventory,
    jfGetOwnedArtifacts,
    jfGetBondedFauna,
    jfGetAvailableStructures,
    jfGetTotalJadeYield,
    jfGetSeasonBonus,
    jfGetCorruptionLevel,
    jfGetNextTitle,
    jfGetRaritySummary,
    jfGetUnlockedAchievements,
    jfGetTitleProgress,
    jfGetCraftableArtifacts,
    jfGetActiveSeason,
  };
}
