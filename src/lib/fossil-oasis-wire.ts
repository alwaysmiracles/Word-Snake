import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ============================================================
// Fossil Oasis Wire — 化石绿洲 (Fossil Oasis) Wire Module
// An ancient desert oasis where prehistoric creatures have been
// preserved as living fossils. Paleontologists excavate bones,
// hatch ancient eggs, and build research camps.
// Prefix: fo / FO_
// ============================================================

// ============================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================

export type FoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type FoSpecies =
  | 'saber_tooth'
  | 'triceratops_spirit'
  | 'pterosaur_ghost'
  | 'mammoth_walker'
  | 'ancient_fish'
  | 'dune_serpent'
  | 'crystal_scorpion';

export type FoAbilityCategory = 'excavation' | 'preservation' | 'revival' | 'exploration';

export type FoStructureBonusType =
  | 'dig_speed'
  | 'coin_bonus'
  | 'rare_chance'
  | 'xp_bonus'
  | 'storage_capacity'
  | 'fossil_preservation'
  | 'camp_morale'
  | 'research_speed';

export type FoMaterialCategory = 'mineral' | 'organic' | 'crystal' | 'relic' | 'biological';

export interface FoSpeciesDef {
  key: FoSpecies;
  name: string;
  description: string;
  emoji: string;
  basePower: number;
}

export interface FoCreatureDef {
  id: string;
  name: string;
  species: FoSpecies;
  rarity: FoRarity;
  description: string;
  emoji: string;
  power: number;
  excavationCost: number;
  xpReward: number;
  coinReward: number;
  requiredLevel: number;
}

export interface FoChamberDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  level: number;
  resources: string[];
  capacity: number;
  unlockLevel: number;
}

export interface FoMaterialDef {
  id: string;
  name: string;
  rarity: FoRarity;
  description: string;
  emoji: string;
  gatherXp: number;
  stackSize: number;
  coinValue: number;
  category: FoMaterialCategory;
  chamberId: string;
}

export interface FoStructureDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  maxLevel: number;
  requiredLevel: number;
  buildCost: number;
  upgradeCost: number;
  bonusType: FoStructureBonusType;
  bonusValue: number;
}

export interface FoAbilityDef {
  id: string;
  name: string;
  category: FoAbilityCategory;
  description: string;
  emoji: string;
  cooldownMs: number;
  power: number;
  unlockLevel: number;
}

export interface FoAchievementDef {
  id: string;
  name: string;
  description: string;
  conditionKey: string;
  targetValue: number;
  rewardXp: number;
  rewardCoins: number;
  emoji: string;
}

export interface FoTitleDef {
  name: string;
  levelRequired: number;
  description: string;
  emoji: string;
}

export interface FoArtifactDef {
  id: string;
  name: string;
  rarity: FoRarity;
  description: string;
  emoji: string;
  bonusType: string;
  bonusValue: number;
  unlockLevel: number;
}

export interface FoEventDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
  durationMs: number;
  rewardCoins: number;
  rewardXp: number;
  minLevel: number;
}

export interface FoRarityInfo {
  key: FoRarity;
  label: string;
  color: string;
  xpMultiplier: number;
}

// Runtime state types

export interface FoCreatureState {
  excavated: boolean;
  excavatedAt: number | null;
  preservationScore: number;
  encounterCount: number;
}

export interface FoChamberState {
  discovered: boolean;
  dugCount: number;
  lastDugAt: number | null;
  fossilsFound: number;
  depthLevel: number;
}

export interface FoStructureState {
  built: boolean;
  level: number;
  builtAt: number | null;
  lastUpgradedAt: number | null;
}

export interface FoAbilityState {
  unlocked: boolean;
  lastUsedAt: number | null;
  useCount: number;
}

export interface FoAchievementState {
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface FoArtifactState {
  activated: boolean;
  activatedAt: number | null;
  charges: number;
}

export interface FoInventoryItem {
  materialId: string;
  quantity: number;
}

export interface FoEventLogEntry {
  eventId: string;
  triggeredAt: number;
  rewardClaimed: boolean;
}

export interface FoStats {
  totalExcavated: number;
  totalDigs: number;
  totalStructuresBuilt: number;
  totalArtifacts: number;
  totalEvents: number;
  totalCoins: number;
  totalXp: number;
  rareFossilsFound: number;
  legendaryFossilsFound: number;
}

// ============================================================
// SECTION 2: FO_ CONSTANTS
// ============================================================

export const FO_SAVE_KEY = 'fossil-oasis-save';
export const FO_MAX_LEVEL = 50;
export const FO_XP_BASE = 100;
export const FO_XP_SCALE = 1.5;

// ─── Color Theme ─────────────────────────────────────────────────────────

export const FO_SAND = '#EDC9AF';
export const FO_AMBER = '#FFBF00';
export const FO_BONE = '#F5F5DC';
export const FO_DUNE = '#C2B280';
export const FO_OASIS_GREEN = '#4CAF50';
export const FO_SKY_BLUE = '#87CEEB';
export const FO_DESERT_RED = '#CD5C5C';

export const FO_RARITY_COLORS: Record<FoRarity, string> = {
  common: '#A0937D',
  uncommon: '#87AE73',
  rare: '#3A7BD5',
  epic: '#9B59B6',
  legendary: '#FFBF00',
};

export const FO_SPECIES_COLORS: Record<FoSpecies, string> = {
  saber_tooth: '#CD5C5C',
  triceratops_spirit: '#4CAF50',
  pterosaur_ghost: '#87CEEB',
  mammoth_walker: '#C2B280',
  ancient_fish: '#3A7BD5',
  dune_serpent: '#FFBF00',
  crystal_scorpion: '#9B59B6',
};

export const FO_COLOR_THEME = {
  sand: FO_SAND,
  amber: FO_AMBER,
  bone: FO_BONE,
  dune: FO_DUNE,
  oasisGreen: FO_OASIS_GREEN,
  skyBlue: FO_SKY_BLUE,
  desertRed: FO_DESERT_RED,
  background: '#1A1A0E',
  surface: '#2D2A1E',
  textPrimary: '#F5F5DC',
  textSecondary: '#C2B280',
};

// ─── Helper Functions ────────────────────────────────────────────────────

function foXpRequired(level: number): number {
  if (level <= 0) return 0;
  if (level >= FO_MAX_LEVEL) return Infinity;
  return Math.floor(FO_XP_BASE * Math.pow(level, FO_XP_SCALE));
}

function foClampLevel(lvl: number): number {
  return Math.max(1, Math.min(FO_MAX_LEVEL, lvl));
}

function foClampCoins(c: number): number {
  return Math.max(0, Math.floor(c));
}

function foRarityMultiplier(r: FoRarity): number {
  const map: Record<FoRarity, number> = {
    common: 1,
    uncommon: 1.5,
    rare: 2.5,
    epic: 4,
    legendary: 7,
  };
  return map[r] ?? 1;
}

function foMulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Species (7 fossil species) ──────────────────────────────────────────

export const FO_SPECIES: FoSpeciesDef[] = [
  { key: 'saber_tooth', name: 'Saber-Tooth Tiger', description: 'A fierce Pleistocene predator with elongated canine teeth that survived in the oasis through supernatural preservation', emoji: '🐯', basePower: 15 },
  { key: 'triceratops_spirit', name: 'Triceratops Spirit', description: 'The spectral remains of a Cretaceous horned dinosaur that roams the petrified gardens at dusk', emoji: '🦕', basePower: 20 },
  { key: 'pterosaur_ghost', name: 'Pterosaur Ghost', description: 'A translucent flying reptile that soars above the amber caverns, leaving trails of golden light', emoji: '🦅', basePower: 14 },
  { key: 'mammoth_walker', name: 'Mammoth Walker', description: 'A colossal frozen mammoth that thaws beneath the oasis, shuffling across the dunes with ancient purpose', emoji: '🐘', basePower: 25 },
  { key: 'ancient_fish', name: 'Ancient Fish', description: 'A living coelacanth-like fish preserved in the underground oasis pools since the Devonian period', emoji: '🐟', basePower: 10 },
  { key: 'dune_serpent', name: 'Dune Serpent', description: 'A massive prehistoric snake that burrows through desert sand, its scales gleaming like polished amber', emoji: '🐍', basePower: 18 },
  { key: 'crystal_scorpion', name: 'Crystal Scorpion', description: 'A scorpion whose exoskeleton has been entirely replaced by crystalline minerals over millions of years', emoji: '🦂', basePower: 22 },
];

// ─── Rarity Tiers ────────────────────────────────────────────────────────

export const FO_RARITIES: FoRarityInfo[] = [
  { key: 'common', label: 'Common', color: '#A0937D', xpMultiplier: 1 },
  { key: 'uncommon', label: 'Uncommon', color: '#87AE73', xpMultiplier: 1.5 },
  { key: 'rare', label: 'Rare', color: '#3A7BD5', xpMultiplier: 2.5 },
  { key: 'epic', label: 'Epic', color: '#9B59B6', xpMultiplier: 4 },
  { key: 'legendary', label: 'Legendary', color: '#FFBF00', xpMultiplier: 7 },
];

// ─── Titles (8 progression titles) ───────────────────────────────────────

export const FO_TITLES: FoTitleDef[] = [
  { name: 'Sand Sweeper', levelRequired: 1, description: 'A novice excavator learning the basics of fossil hunting in the desert oasis', emoji: '🧹' },
  { name: 'Bone Reader', levelRequired: 5, description: 'You can identify fossils by touch alone, reading millions of years of history in each fragment', emoji: '🦴' },
  { name: 'Chamber Explorer', levelRequired: 10, description: 'Your excavations have opened passages to chambers unseen for millennia', emoji: '🔦' },
  { name: 'Amber Scholar', levelRequired: 18, description: 'Your knowledge of preserved specimens rivals the ancient sages who first catalogued them', emoji: '🟡' },
  { name: 'Oasis Keeper', levelRequired: 25, description: 'You are entrusted with guarding the sacred oasis and its prehistoric inhabitants', emoji: '🏜️' },
  { name: 'Fossil Master', levelRequired: 33, description: 'Your excavation techniques are taught in every paleontology academy across the land', emoji: '🏆' },
  { name: 'Revival Sage', levelRequired: 42, description: 'You possess the ancient knowledge to breathe life back into the deepest fossils', emoji: '✨' },
  { name: 'Sovereign of the Oasis', levelRequired: 50, description: 'The Fossil Oasis itself bends to your will — master of all prehistoric life', emoji: '👑' },
];

// ─── Chambers (8 excavation sites) ───────────────────────────────────────

export const FO_CHAMBERS: FoChamberDef[] = [
  {
    id: 'bone_valley',
    name: 'Bone Valley',
    description: 'A vast sunken valley where thousands of fossilized bones protrude from the sand, forming eerie white ridges across the landscape',
    emoji: '🦴',
    level: 1,
    resources: ['rough_bone', 'sandstone_chip', 'dry_sediment', 'shell_fragment'],
    capacity: 20,
    unlockLevel: 1,
  },
  {
    id: 'amber_cavern',
    name: 'Amber Cavern',
    description: 'A glittering underground cavern where walls of ancient amber glow with trapped starlight and imprisoned prehistoric insects',
    emoji: '🟡',
    level: 5,
    resources: ['raw_amber', 'insect_resin', 'golden_nodule', 'honeycomb_fossil'],
    capacity: 25,
    unlockLevel: 5,
  },
  {
    id: 'petrified_garden',
    name: 'Petrified Garden',
    description: 'An ancient garden where every plant has turned to stone over millions of years, preserving perfect crystal replicas of prehistoric flora',
    emoji: '🌺',
    level: 10,
    resources: ['petrified_wood', 'stone_bloom', 'crystal_pollen', 'root_fossil'],
    capacity: 30,
    unlockLevel: 10,
  },
  {
    id: 'crystal_depths',
    name: 'Crystal Depths',
    description: 'Deep underground chambers where mineral-rich waters have transformed ancient remains into magnificent crystalline formations',
    emoji: '💎',
    level: 15,
    resources: ['quartz_crystal', 'mineral_vein', 'geode_fragment', 'prism_shard'],
    capacity: 35,
    unlockLevel: 15,
  },
  {
    id: 'tar_pit',
    name: 'Primordial Tar Pit',
    description: 'A bubbling tar pit that has preserved creatures intact for millions of years, each bubble releasing the scent of ancient earth',
    emoji: '⚫',
    level: 20,
    resources: ['tar_sample', 'preserved_hide', 'ancient_tooth', 'bone_marrow'],
    capacity: 40,
    unlockLevel: 20,
  },
  {
    id: 'frozen_cavern',
    name: 'Frozen Cavern',
    description: 'An impossibly cold cavern beneath the oasis where ice-age creatures remain frozen in perfect condition, awaiting revival',
    emoji: '🧊',
    level: 28,
    resources: ['permafrost_core', 'ice_age_hair', 'frozen_amber', 'glacial_crystal'],
    capacity: 45,
    unlockLevel: 28,
  },
  {
    id: 'ancient_nest',
    name: 'Ancient Nest',
    description: 'A vast nesting ground where prehistoric creatures once raised their young, fossilized eggs still intact within the warm sand',
    emoji: '🥚',
    level: 35,
    resources: ['fossilized_egg', 'nest_material', 'hatchling_bone', 'ancient_feather'],
    capacity: 50,
    unlockLevel: 35,
  },
  {
    id: 'oasis_heart',
    name: 'Heart of the Oasis',
    description: 'The deepest and most sacred chamber, where the source of the oasis flows upward from the earth, sustaining all prehistoric life',
    emoji: '💚',
    level: 45,
    resources: ['oasis_essence', 'primordial_water', 'life_crystal', 'eternal_bone'],
    capacity: 60,
    unlockLevel: 45,
  },
];

// ─── Creatures (35 fossils: 7 species × 5 rarity tiers) ──────────────────

export const FO_CREATURES: FoCreatureDef[] = [
  // Common (7)
  {
    id: 'saber_tooth_common',
    name: 'Juvenile Saber-Tooth',
    species: 'saber_tooth',
    rarity: 'common',
    description: 'A young saber-toothed cat whose fangs are just beginning to grow. Though small, its predatory instincts are already fully developed, and it can bring down prey twice its size with a single well-placed bite to the neck.',
    emoji: '🐯',
    power: 18,
    excavationCost: 50,
    xpReward: 12,
    coinReward: 15,
    requiredLevel: 1,
  },
  {
    id: 'triceratops_spirit_common',
    name: 'Frilled Hatchling',
    species: 'triceratops_spirit',
    rarity: 'common',
    description: 'A spectral triceratops hatchling whose translucent frill glows faintly in moonlight. It follows diggers around the bone valley, apparently curious about the strange creatures that have invaded its ancient home.',
    emoji: '🦕',
    power: 22,
    excavationCost: 60,
    xpReward: 14,
    coinReward: 18,
    requiredLevel: 1,
  },
  {
    id: 'pterosaur_ghost_common',
    name: 'Dawn Pterosaur',
    species: 'pterosaur_ghost',
    rarity: 'common',
    description: 'A small pterosaur ghost that appears only at sunrise, circling the amber cavern entrance before vanishing. Its wingspan is barely two feet, but its keen eyes can spot fossils buried ten feet underground.',
    emoji: '🦅',
    power: 14,
    excavationCost: 40,
    xpReward: 10,
    coinReward: 12,
    requiredLevel: 1,
  },
  {
    id: 'mammoth_walker_common',
    name: 'Baby Mammoth Calf',
    species: 'mammoth_walker',
    rarity: 'common',
    description: 'A frozen mammoth calf preserved so perfectly that its fur still feels soft to the touch. It was found curled up beside its mother in the frozen cavern, a heartbreaking tableau of the ice age.',
    emoji: '🐘',
    power: 20,
    excavationCost: 55,
    xpReward: 13,
    coinReward: 16,
    requiredLevel: 1,
  },
  {
    id: 'ancient_fish_common',
    name: 'Living Coelacanth',
    species: 'ancient_fish',
    rarity: 'common',
    description: 'A coelacanth that has survived unchanged for 400 million years in the underground oasis pools. Its lobed fins and armored scales are a living window into the Devonian period, and it regards visitors with ancient, unblinking eyes.',
    emoji: '🐟',
    power: 10,
    excavationCost: 35,
    xpReward: 9,
    coinReward: 10,
    requiredLevel: 1,
  },
  {
    id: 'dune_serpent_common',
    name: 'Sand Python',
    species: 'dune_serpent',
    rarity: 'common',
    description: 'A medium-sized prehistoric python with scales that shimmer like desert sand. It hunts by lying perfectly still beneath the dunes, waiting for prey to pass directly over its hidden jaws.',
    emoji: '🐍',
    power: 16,
    excavationCost: 45,
    xpReward: 11,
    coinReward: 14,
    requiredLevel: 1,
  },
  {
    id: 'crystal_scorpion_common',
    name: 'Quartz Scorpion',
    species: 'crystal_scorpion',
    rarity: 'common',
    description: 'A small scorpion whose exoskeleton has partially crystallized over millennia. Its sting is harmless but its pincers are sharp enough to cut through leather. Found commonly near geode deposits.',
    emoji: '🦂',
    power: 15,
    excavationCost: 42,
    xpReward: 10,
    coinReward: 13,
    requiredLevel: 1,
  },
  // Uncommon (7)
  {
    id: 'saber_tooth_uncommon',
    name: 'Amber-Trapped Smilodon',
    species: 'saber_tooth',
    rarity: 'uncommon',
    description: 'A fully grown Smilodon preserved in a massive block of tree amber. Its jaws are frozen mid-roar, and through the golden resin you can see every muscle fiber and vein in perfect detail.',
    emoji: '🐯',
    power: 35,
    excavationCost: 200,
    xpReward: 28,
    coinReward: 60,
    requiredLevel: 5,
  },
  {
    id: 'triceratops_spirit_uncommon',
    name: 'Horned Guardian',
    species: 'triceratops_spirit',
    rarity: 'uncommon',
    description: 'A spectral triceratops that manifests to protect the petrified garden from intruders. Its three horns glow with ghostly green light, and the ground trembles when it charges.',
    emoji: '🦕',
    power: 42,
    excavationCost: 250,
    xpReward: 32,
    coinReward: 75,
    requiredLevel: 6,
  },
  {
    id: 'pterosaur_ghost_uncommon',
    name: 'Sunset Rhamphorhynchus',
    species: 'pterosaur_ghost',
    rarity: 'uncommon',
    description: 'A long-tailed pterosaur ghost that appears during golden hour, its translucent body catching the last rays of sunlight and scattering them into rainbow prisms across the canyon walls.',
    emoji: '🦅',
    power: 30,
    excavationCost: 180,
    xpReward: 25,
    coinReward: 55,
    requiredLevel: 5,
  },
  {
    id: 'mammoth_walker_uncommon',
    name: 'Tusker Phantom',
    species: 'mammoth_walker',
    rarity: 'uncommon',
    description: 'A spectral mammoth that wanders the dunes at twilight. Its tusks curve like crescent moons, and wherever it walks, temporary patches of permafrost bloom beneath its feet.',
    emoji: '🐘',
    power: 38,
    excavationCost: 220,
    xpReward: 30,
    coinReward: 65,
    requiredLevel: 7,
  },
  {
    id: 'ancient_fish_uncommon',
    name: 'Armored Dunkleosteus',
    species: 'ancient_fish',
    rarity: 'uncommon',
    description: 'A massive armored fish from the Devonian period, its skull plates made of solid bone. It patrols the deeper oasis pools, crunching through crystal formations with its shearing jaw plates.',
    emoji: '🐟',
    power: 28,
    excavationCost: 170,
    xpReward: 23,
    coinReward: 50,
    requiredLevel: 5,
  },
  {
    id: 'dune_serpent_uncommon',
    name: 'G Titanoboa Hatchling',
    species: 'dune_serpent',
    rarity: 'uncommon',
    description: 'A young Titanoboa, the largest snake ever to have lived, that has somehow survived in the oasis sands. Even as a juvenile it is thicker than a man torso and twice as long.',
    emoji: '🐍',
    power: 33,
    excavationCost: 195,
    xpReward: 26,
    coinReward: 58,
    requiredLevel: 6,
  },
  {
    id: 'crystal_scorpion_uncommon',
    name: 'Amethyst Stinger',
    species: 'crystal_scorpion',
    rarity: 'uncommon',
    description: 'A scorpion whose exoskeleton has been entirely replaced by amethyst crystals. Its sting injects not venom but a shimmering purple liquid that crystallizes on contact with air.',
    emoji: '🦂',
    power: 32,
    excavationCost: 190,
    xpReward: 27,
    coinReward: 62,
    requiredLevel: 5,
  },
  // Rare (7)
  {
    id: 'saber_tooth_rare',
    name: 'Alpha Saber-Tooth King',
    species: 'saber_tooth',
    rarity: 'rare',
    description: 'The legendary alpha of all saber-toothed cats, a creature so powerful it could bring down a woolly rhinoceros single-handedly. Its fangs are eight inches long and serrated like steak knives.',
    emoji: '🐯',
    power: 72,
    excavationCost: 800,
    xpReward: 65,
    coinReward: 250,
    requiredLevel: 15,
  },
  {
    id: 'triceratops_spirit_rare',
    name: 'Ceratopsian Warlord',
    species: 'triceratops_spirit',
    rarity: 'rare',
    description: 'An enormous spectral triceratops spirit that manifests during thunderstorms. Its frill bears the glowing imprints of ancient battles, each scar telling the story of a T-Rex encounter survived.',
    emoji: '🦕',
    power: 85,
    excavationCost: 950,
    xpReward: 75,
    coinReward: 300,
    requiredLevel: 18,
  },
  {
    id: 'pterosaur_ghost_rare',
    name: 'Phantom Quetzalcoatlus',
    species: 'pterosaur_ghost',
    rarity: 'rare',
    description: 'The ghost of the largest flying creature ever known, with a wingspan of forty feet. When it flies overhead, its translucent wings cast prismatic shadows that reveal hidden fossils on the ground below.',
    emoji: '🦅',
    power: 68,
    excavationCost: 760,
    xpReward: 62,
    coinReward: 240,
    requiredLevel: 15,
  },
  {
    id: 'mammoth_walker_rare',
    name: 'Columbian Colossus',
    species: 'mammoth_walker',
    rarity: 'rare',
    description: 'A Columbian mammoth so massive that its skeleton alone fills an entire chamber. When it walks, each step leaves a crater in the sand and causes the oasis waters to ripple for miles.',
    emoji: '🐘',
    power: 90,
    excavationCost: 1000,
    xpReward: 80,
    coinReward: 320,
    requiredLevel: 20,
  },
  {
    id: 'ancient_fish_rare',
    name: 'Megalodon Jaw',
    species: 'ancient_fish',
    rarity: 'rare',
    description: 'Not a complete specimen but the lower jaw of a juvenile Megalodon, perfectly preserved in volcanic ash. The teeth alone are the size of adult human hands, and the bite force it represents could crush a car.',
    emoji: '🐟',
    power: 65,
    excavationCost: 720,
    xpReward: 58,
    coinReward: 220,
    requiredLevel: 15,
  },
  {
    id: 'dune_serpent_rare',
    name: 'Desert Basilisk',
    species: 'dune_serpent',
    rarity: 'rare',
    description: 'A prehistoric serpent whose gaze was said to petrify living creatures, turning them into the stone statues found throughout the oasis. Its scales contain genuine fossilized victims.',
    emoji: '🐍',
    power: 75,
    excavationCost: 850,
    xpReward: 68,
    coinReward: 270,
    requiredLevel: 18,
  },
  {
    id: 'crystal_scorpion_rare',
    name: 'Diamond Emperor',
    species: 'crystal_scorpion',
    rarity: 'rare',
    description: 'A scorpion emperor whose entire body has crystallized into diamond. It glows from within with captured prehistoric sunlight and its pincers can cut through any known material.',
    emoji: '🦂',
    power: 70,
    excavationCost: 780,
    xpReward: 64,
    coinReward: 260,
    requiredLevel: 16,
  },
  // Epic (7)
  {
    id: 'saber_tooth_epic',
    name: 'Apex Predator Reborn',
    species: 'saber_tooth',
    rarity: 'epic',
    description: 'A saber-toothed cat that has been fully revived through ancient oasis magic, its muscles rippling with supernatural strength. It hunts not for food but for the thrill of the chase, and no creature in the oasis can match its speed.',
    emoji: '🐯',
    power: 150,
    excavationCost: 3000,
    xpReward: 140,
    coinReward: 1200,
    requiredLevel: 30,
  },
  {
    id: 'triceratops_spirit_epic',
    name: 'Trinity Horn Leviathan',
    species: 'triceratops_spirit',
    rarity: 'epic',
    description: 'A triceratops spirit of impossible size whose three horns pierce the boundary between the living and fossil worlds. Its charge creates shockwaves that can unearth fossils from a hundred feet below the surface.',
    emoji: '🦕',
    power: 175,
    excavationCost: 3500,
    xpReward: 160,
    coinReward: 1400,
    requiredLevel: 32,
  },
  {
    id: 'pterosaur_ghost_epic',
    name: 'Sky Sovereign Specter',
    species: 'pterosaur_ghost',
    rarity: 'epic',
    description: 'The ghost of an azhdarchid pterosaur so large it could swallow a human whole. It patrols the skies above the oasis as an eternal guardian, its shadow alone enough to deter all but the bravest excavators.',
    emoji: '🦅',
    power: 142,
    excavationCost: 2900,
    xpReward: 135,
    coinReward: 1100,
    requiredLevel: 30,
  },
  {
    id: 'mammoth_walker_epic',
    name: 'Steppe Titan Awakened',
    species: 'mammoth_walker',
    rarity: 'epic',
    description: 'A steppe mammoth that has been thawed and revived by the oasis waters, emerging from millennia of ice with a furious trumpeting that echoes across the desert for miles. Its fur is thick as steel wire.',
    emoji: '🐘',
    power: 195,
    excavationCost: 3800,
    xpReward: 175,
    coinReward: 1500,
    requiredLevel: 35,
  },
  {
    id: 'ancient_fish_epic',
    name: 'Dunkleosteus Prime',
    species: 'ancient_fish',
    rarity: 'epic',
    description: 'The largest Dunkleosteus ever discovered, its armored head plate alone is six feet across. It rules the deepest oasis pools with absolute authority, and its bite can shear through iron.',
    emoji: '🐟',
    power: 138,
    excavationCost: 2800,
    xpReward: 130,
    coinReward: 1050,
    requiredLevel: 28,
  },
  {
    id: 'dune_serpent_epic',
    name: 'Sands of Ouroboros',
    species: 'dune_serpent',
    rarity: 'epic',
    description: 'A Titanoboa of mythic proportions that has achieved a form of immortality by consuming its own tail. It exists in a perpetual state of renewal, its scales constantly shedding and regenerating as new prehistoric organisms.',
    emoji: '🐍',
    power: 160,
    excavationCost: 3200,
    xpReward: 145,
    coinReward: 1300,
    requiredLevel: 30,
  },
  {
    id: 'crystal_scorpion_epic',
    name: 'Obsidian Deathstalker',
    species: 'crystal_scorpion',
    rarity: 'epic',
    description: 'A scorpion of nightmare proportions whose crystalline body is made of black obsidian. Its sting carries a neurotoxin so potent that it can induce visions of the prehistoric past in any creature it strikes.',
    emoji: '🦂',
    power: 165,
    excavationCost: 3400,
    xpReward: 150,
    coinReward: 1350,
    requiredLevel: 33,
  },
  // Legendary (7)
  {
    id: 'saber_tooth_legendary',
    name: 'Eternal Smilodon God',
    species: 'saber_tooth',
    rarity: 'legendary',
    description: 'The primordial saber-tooth from which all others descend, a being that existed before the concept of extinction. Its fangs are made of pure fossilized lightning, and its roar can shatter the fossil record itself, revealing truths about evolution that science cannot yet comprehend.',
    emoji: '🐯',
    power: 350,
    excavationCost: 12000,
    xpReward: 400,
    coinReward: 5000,
    requiredLevel: 45,
  },
  {
    id: 'triceratops_spirit_legendary',
    name: 'Architect of the Oasis',
    species: 'triceratops_spirit',
    rarity: 'legendary',
    description: 'The first triceratops, a creature so ancient that it witnessed the creation of the oasis itself. Legend says its horns pierced the desert floor, releasing the underground springs that sustain all prehistoric life in this sacred place.',
    emoji: '🦕',
    power: 400,
    excavationCost: 15000,
    xpReward: 450,
    coinReward: 6000,
    requiredLevel: 48,
  },
  {
    id: 'pterosaur_ghost_legendary',
    name: 'Wings of the Primordium',
    species: 'pterosaur_ghost',
    rarity: 'legendary',
    description: 'The first creature to ever take flight, a pterosaur so ancient it predates the dinosaurs themselves. Its wingspan blots out the desert sun, and the wind from a single beat of its wings can strip sand from an entire excavation site.',
    emoji: '🦅',
    power: 340,
    excavationCost: 13000,
    xpReward: 420,
    coinReward: 5500,
    requiredLevel: 45,
  },
  {
    id: 'mammoth_walker_legendary',
    name: 'Behemoth of the Deep Time',
    species: 'mammoth_walker',
    rarity: 'legendary',
    description: 'A mammoth that has existed for so long it remembers when the desert was an ocean. Its body contains fossilized memories of every geological era, and its heartbeat synchronizes with the slow pulse of the planet itself.',
    emoji: '🐘',
    power: 420,
    excavationCost: 16000,
    xpReward: 480,
    coinReward: 6500,
    requiredLevel: 50,
  },
  {
    id: 'ancient_fish_legendary',
    name: 'Leviathan of the Abyssal Pool',
    species: 'ancient_fish',
    rarity: 'legendary',
    description: 'A creature from the deepest part of the oasis pools, so ancient it may represent the missing link between fish and amphibians. Its scales contain the genetic memory of every species that has ever lived in water.',
    emoji: '🐟',
    power: 310,
    excavationCost: 11000,
    xpReward: 380,
    coinReward: 4800,
    requiredLevel: 45,
  },
  {
    id: 'dune_serpent_legendary',
    name: 'World Serpent Encircler',
    species: 'dune_serpent',
    rarity: 'legendary',
    description: 'A serpent so vast that it encircles the entire Fossil Oasis, its body buried deep beneath the desert sand. Its awakening causes earthquakes across the region and reveals buried chambers that have been sealed for millions of years.',
    emoji: '🐍',
    power: 380,
    excavationCost: 14000,
    xpReward: 440,
    coinReward: 5800,
    requiredLevel: 47,
  },
  {
    id: 'crystal_scorpion_legendary',
    name: 'Celestial Carapace Incarnate',
    species: 'crystal_scorpion',
    rarity: 'legendary',
    description: 'The original crystal scorpion whose body was the template from which all minerals in the oasis formed. Its crystalline exoskeleton contains every element known to science, and it is said to hold the secret of transforming living tissue into eternal crystal.',
    emoji: '🦂',
    power: 370,
    excavationCost: 13500,
    xpReward: 430,
    coinReward: 5600,
    requiredLevel: 46,
  },
];

// ─── Materials (12 materials across categories) ───────────────────────────

export const FO_MATERIALS: FoMaterialDef[] = [
  { id: 'rough_bone', name: 'Rough Bone Fragment', rarity: 'common', description: 'A fragment of fossilized bone found scattered across the desert surface', emoji: '🦴', gatherXp: 5, stackSize: 99, coinValue: 3, category: 'organic', chamberId: 'bone_valley' },
  { id: 'sandstone_chip', name: 'Sandstone Chip', rarity: 'common', description: 'A chip of layered sandstone containing tiny fossil impressions', emoji: '🪨', gatherXp: 5, stackSize: 99, coinValue: 2, category: 'mineral', chamberId: 'bone_valley' },
  { id: 'raw_amber', name: 'Raw Amber', rarity: 'common', description: 'Uncut amber with prehistoric insect inclusions', emoji: '🟠', gatherXp: 8, stackSize: 50, coinValue: 10, category: 'relic', chamberId: 'amber_cavern' },
  { id: 'petrified_wood', name: 'Petrified Wood', rarity: 'uncommon', description: 'Ancient wood turned to stone over millions of years, rings perfectly preserved', emoji: '🪵', gatherXp: 15, stackSize: 40, coinValue: 25, category: 'mineral', chamberId: 'petrified_garden' },
  { id: 'crystal_pollen', name: 'Crystal Pollen', rarity: 'uncommon', description: 'Prehistoric pollen crystallized into glittering golden dust', emoji: '✨', gatherXp: 18, stackSize: 30, coinValue: 30, category: 'crystal', chamberId: 'petrified_garden' },
  { id: 'quartz_crystal', name: 'Fossil Quartz', rarity: 'uncommon', description: 'A quartz crystal that formed around a fossilized organism', emoji: '💎', gatherXp: 20, stackSize: 25, coinValue: 35, category: 'crystal', chamberId: 'crystal_depths' },
  { id: 'tar_sample', name: 'Preserved Tar Sample', rarity: 'uncommon', description: 'Tar containing perfectly preserved ancient organic material', emoji: '⚫', gatherXp: 22, stackSize: 20, coinValue: 40, category: 'organic', chamberId: 'tar_pit' },
  { id: 'fossilized_egg', name: 'Fossilized Egg', rarity: 'rare', description: 'A dinosaur egg fossilized intact, embryos sometimes visible inside', emoji: '🥚', gatherXp: 50, stackSize: 10, coinValue: 100, category: 'biological', chamberId: 'ancient_nest' },
  { id: 'permafrost_core', name: 'Permafrost Core', rarity: 'rare', description: 'A cylinder of ancient permafrost containing preserved DNA samples', emoji: '🧊', gatherXp: 55, stackSize: 8, coinValue: 120, category: 'biological', chamberId: 'frozen_cavern' },
  { id: 'oasis_essence', name: 'Oasis Essence', rarity: 'epic', description: 'Liquid essence from the heart of the oasis that glows with primordial energy', emoji: '💧', gatherXp: 120, stackSize: 5, coinValue: 300, category: 'relic', chamberId: 'oasis_heart' },
  { id: 'ancient_tooth', name: 'Megalodon Tooth', rarity: 'rare', description: 'A tooth from a prehistoric mega-predator, serrated and razor-sharp', emoji: '🦷', gatherXp: 45, stackSize: 12, coinValue: 90, category: 'organic', chamberId: 'tar_pit' },
  { id: 'life_crystal', name: 'Life Crystal', rarity: 'legendary', description: 'A crystal that contains the raw life force of a prehistoric creature', emoji: '💚', gatherXp: 300, stackSize: 1, coinValue: 800, category: 'crystal', chamberId: 'oasis_heart' },
];

// ─── Structures (8 buildings, upgradeable) ────────────────────────────────

export const FO_STRUCTURES: FoStructureDef[] = [
  {
    id: 'excavation_tent',
    name: 'Excavation Tent',
    description: 'A large canvas tent providing shade and storage for digging equipment near the bone valley',
    emoji: '⛺',
    maxLevel: 10,
    requiredLevel: 1,
    buildCost: 100,
    upgradeCost: 50,
    bonusType: 'dig_speed',
    bonusValue: 8,
  },
  {
    id: 'research_lab',
    name: 'Fossil Research Lab',
    description: 'A well-equipped laboratory for analyzing and preserving fossil specimens',
    emoji: '🔬',
    maxLevel: 10,
    requiredLevel: 3,
    buildCost: 250,
    upgradeCost: 120,
    bonusType: 'research_speed',
    bonusValue: 12,
  },
  {
    id: 'preservation_chamber',
    name: 'Preservation Chamber',
    description: 'A climate-controlled vault that prevents fossil degradation and decay',
    emoji: '🏛️',
    maxLevel: 10,
    requiredLevel: 5,
    buildCost: 350,
    upgradeCost: 150,
    bonusType: 'fossil_preservation',
    bonusValue: 15,
  },
  {
    id: 'supply_depot',
    name: 'Desert Supply Depot',
    description: 'A fortified supply cache storing tools, food, and water for extended expeditions',
    emoji: '🏪',
    maxLevel: 10,
    requiredLevel: 2,
    buildCost: 150,
    upgradeCost: 75,
    bonusType: 'storage_capacity',
    bonusValue: 10,
  },
  {
    id: 'trading_post',
    name: 'Fossil Trading Post',
    description: 'A bustling market where paleontologists trade rare specimens and materials',
    emoji: '💰',
    maxLevel: 10,
    requiredLevel: 8,
    buildCost: 400,
    upgradeCost: 200,
    bonusType: 'coin_bonus',
    bonusValue: 14,
  },
  {
    id: 'recovery_station',
    name: 'Recovery Station',
    description: 'A medical and rest facility where excavators recover from long digs in the desert heat',
    emoji: '🏥',
    maxLevel: 10,
    requiredLevel: 6,
    buildCost: 300,
    upgradeCost: 140,
    bonusType: 'camp_morale',
    bonusValue: 12,
  },
  {
    id: 'deep_scanner',
    name: 'Ground-Penetrating Scanner',
    description: 'Advanced technology that reveals buried fossils and chambers before breaking ground',
    emoji: '📡',
    maxLevel: 10,
    requiredLevel: 12,
    buildCost: 600,
    upgradeCost: 300,
    bonusType: 'rare_chance',
    bonusValue: 18,
  },
  {
    id: 'ancient_shrine',
    name: 'Ancient Revival Shrine',
    description: 'A mysterious shrine built by an unknown civilization that amplifies the oasis revival energy',
    emoji: '⛩️',
    maxLevel: 10,
    requiredLevel: 20,
    buildCost: 1000,
    upgradeCost: 500,
    bonusType: 'xp_bonus',
    bonusValue: 20,
  },
];

// ─── Abilities (8 oasis abilities) ────────────────────────────────────────

export const FO_ABILITIES: FoAbilityDef[] = [
  {
    id: 'deep_scan',
    name: 'Deep Scan',
    category: 'excavation',
    description: 'Use sonic waves to detect buried fossils within a wide radius, revealing hidden specimens before digging',
    emoji: '📡',
    cooldownMs: 30000,
    power: 25,
    unlockLevel: 1,
  },
  {
    id: 'gentle_brush',
    name: 'Gentle Brush',
    category: 'preservation',
    description: 'Carefully clean fragile fossils with expert precision, increasing preservation score by a significant margin',
    emoji: '🖌️',
    cooldownMs: 20000,
    power: 30,
    unlockLevel: 3,
  },
  {
    id: 'revival_pulse',
    name: 'Revival Pulse',
    category: 'revival',
    description: 'Channel the oasis energy to partially revive a fossil creature, granting temporary life and movement',
    emoji: '💚',
    cooldownMs: 60000,
    power: 50,
    unlockLevel: 10,
  },
  {
    id: 'sand_shift',
    name: 'Sand Shift',
    category: 'exploration',
    description: 'Magically move large quantities of sand to reveal buried chambers and excavation sites',
    emoji: '🌪️',
    cooldownMs: 45000,
    power: 35,
    unlockLevel: 5,
  },
  {
    id: 'amber_sight',
    name: 'Amber Sight',
    category: 'exploration',
    description: 'See through amber and crystal formations to spot rare specimens hidden within the matrix',
    emoji: '🔍',
    cooldownMs: 25000,
    power: 28,
    unlockLevel: 8,
  },
  {
    id: 'bone_resonance',
    name: 'Bone Resonance',
    category: 'excavation',
    description: 'Strike the ground with a resonant frequency that causes loosely buried fossils to rise to the surface',
    emoji: '🦴',
    cooldownMs: 40000,
    power: 40,
    unlockLevel: 15,
  },
  {
    id: 'time_freeze',
    name: 'Time Freeze',
    category: 'preservation',
    description: 'Halt the decay process of a fossil specimen, locking it in perfect preservation for study',
    emoji: '⏸️',
    cooldownMs: 90000,
    power: 60,
    unlockLevel: 22,
  },
  {
    id: 'primordial_call',
    name: 'Primordial Call',
    category: 'revival',
    description: 'Emit a sound frequency that attracts prehistoric creatures from across the desert to your location',
    emoji: '📯',
    cooldownMs: 120000,
    power: 80,
    unlockLevel: 30,
  },
];

// ─── Achievements (10 achievements) ───────────────────────────────────────

export const FO_ACHIEVEMENTS: FoAchievementDef[] = [
  {
    id: 'ach_first_fossil',
    name: 'First Excavation',
    description: 'Excavate your very first fossil from the desert sands',
    conditionKey: 'totalExcavated',
    targetValue: 1,
    rewardXp: 50,
    rewardCoins: 100,
    emoji: '🦴',
  },
  {
    id: 'ach_bone_collector',
    name: 'Bone Collector',
    description: 'Excavate 10 different fossil specimens',
    conditionKey: 'totalExcavated',
    targetValue: 10,
    rewardXp: 200,
    rewardCoins: 500,
    emoji: '🏺',
  },
  {
    id: 'ach_rare_find',
    name: 'Rare Find',
    description: 'Discover a rare-tier fossil creature',
    conditionKey: 'rareFossilsFound',
    targetValue: 1,
    rewardXp: 300,
    rewardCoins: 800,
    emoji: '💎',
  },
  {
    id: 'ach_legendary_paleontologist',
    name: 'Legendary Paleontologist',
    description: 'Excavate a legendary fossil from the depths',
    conditionKey: 'legendaryFossilsFound',
    targetValue: 1,
    rewardXp: 1000,
    rewardCoins: 5000,
    emoji: '⭐',
  },
  {
    id: 'ach_site_master',
    name: 'Site Master',
    description: 'Discover and excavate in all 8 chambers',
    conditionKey: 'totalDigs',
    targetValue: 100,
    rewardXp: 500,
    rewardCoins: 2000,
    emoji: '🗺️',
  },
  {
    id: 'ach_builder',
    name: 'Camp Builder',
    description: 'Build and upgrade all 8 structures to at least level 5',
    conditionKey: 'totalStructuresBuilt',
    targetValue: 15,
    rewardXp: 400,
    rewardCoins: 1500,
    emoji: '🏗️',
  },
  {
    id: 'ach_artifact_hunter',
    name: 'Artifact Hunter',
    description: 'Activate 5 different ancient artifacts',
    conditionKey: 'totalArtifacts',
    targetValue: 5,
    rewardXp: 350,
    rewardCoins: 1200,
    emoji: '🏺',
  },
  {
    id: 'ach_desert_scholar',
    name: 'Desert Scholar',
    description: 'Accumulate 5000 total XP across all activities',
    conditionKey: 'totalXp',
    targetValue: 5000,
    rewardXp: 600,
    rewardCoins: 2500,
    emoji: '📜',
  },
  {
    id: 'ach_oasis_explorer',
    name: 'Oasis Explorer',
    description: 'Participate in 20 oasis events',
    conditionKey: 'totalEvents',
    targetValue: 20,
    rewardXp: 450,
    rewardCoins: 1800,
    emoji: '🏕️',
  },
  {
    id: 'ach_complete_collection',
    name: 'Complete Collection',
    description: 'Excavate all 35 fossil creatures',
    conditionKey: 'totalExcavated',
    targetValue: 35,
    rewardXp: 2000,
    rewardCoins: 10000,
    emoji: '🏆',
  },
];

// ─── Artifacts (6 ancient artifacts) ──────────────────────────────────────

export const FO_ARTIFACTS: FoArtifactDef[] = [
  {
    id: 'amber_heart',
    name: 'Heart of Amber',
    rarity: 'rare',
    description: 'A perfectly preserved amber stone containing the fossilized heart of an unknown creature that still beats once every century',
    emoji: '🟡',
    bonusType: 'preservation_boost',
    bonusValue: 20,
    unlockLevel: 10,
  },
  {
    id: 'primordial_map',
    name: 'Primordial Excavation Map',
    rarity: 'uncommon',
    description: 'A map etched into a stone tablet that reveals the locations of all major fossil deposits in the oasis region',
    emoji: '🗺️',
    bonusType: 'dig_speed',
    bonusValue: 15,
    unlockLevel: 5,
  },
  {
    id: 'time_sand_vial',
    name: 'Vial of Time Sand',
    rarity: 'epic',
    description: 'A small glass vial containing sand from the primordial desert that can reverse the aging of any fossil it touches',
    emoji: '⏳',
    bonusType: 'rare_chance',
    bonusValue: 25,
    unlockLevel: 20,
  },
  {
    id: 'ancient_chisel',
    name: 'Paleontologist Chisel of the Ancients',
    rarity: 'uncommon',
    description: 'A chisel crafted by an unknown prehistoric civilization, perfectly balanced for fossil extraction work',
    emoji: '🔨',
    bonusType: 'dig_speed',
    bonusValue: 18,
    unlockLevel: 8,
  },
  {
    id: 'life_gem',
    name: 'Gem of Living Fossils',
    rarity: 'epic',
    description: 'A gemstone that pulses with the same frequency as the oasis underground springs, granting temporary life to nearby fossils',
    emoji: '💚',
    bonusType: 'revival_boost',
    bonusValue: 30,
    unlockLevel: 25,
  },
  {
    id: 'oasis_crown',
    name: 'Crown of the Oasis Sovereign',
    rarity: 'legendary',
    description: 'A magnificent crown made from petrified wood, amber, and crystal scorpion carapace, granting absolute authority over all prehistoric creatures',
    emoji: '👑',
    bonusType: 'ultimate_power',
    bonusValue: 50,
    unlockLevel: 40,
  },
];

// ─── Events (8 random oasis events) ──────────────────────────────────────

export const FO_EVENTS: FoEventDef[] = [
  {
    id: 'sandstorm',
    name: 'Ancient Sandstorm',
    description: 'A massive sandstorm sweeps across the oasis, uncovering buried fossils but making excavation dangerous',
    emoji: '🌪️',
    durationMs: 60000,
    rewardCoins: 50,
    rewardXp: 40,
    minLevel: 1,
  },
  {
    id: 'oasis_surge',
    name: 'Oasis Water Surge',
    description: 'The underground springs surge with extra force, revealing new chambers and washing fossils to the surface',
    emoji: '🌊',
    durationMs: 90000,
    rewardCoins: 100,
    rewardXp: 80,
    minLevel: 5,
  },
  {
    id: 'amber_rain',
    name: 'Amber Rain',
    description: 'A bizarre meteorological event causes raw amber to fall from the sky like golden raindrops',
    emoji: '🟡',
    durationMs: 75000,
    rewardCoins: 150,
    rewardXp: 100,
    minLevel: 10,
  },
  {
    id: 'ghost_migration',
    name: 'Ghost Migration',
    description: 'Spectral prehistoric creatures migrate through the oasis, leaving behind rare fossil traces',
    emoji: '👻',
    durationMs: 80000,
    rewardCoins: 120,
    rewardXp: 90,
    minLevel: 8,
  },
  {
    id: 'earthquake',
    name: 'Deep Earthquake',
    description: 'An earthquake shakes the desert floor, collapsing some tunnels but revealing deeper fossil layers',
    emoji: '🌍',
    durationMs: 45000,
    rewardCoins: 75,
    rewardXp: 60,
    minLevel: 6,
  },
  {
    id: 'crystal_bloom',
    name: 'Crystal Bloom',
    description: 'Crystal formations throughout the oasis suddenly grow and bloom, producing valuable new materials',
    emoji: '💎',
    durationMs: 100000,
    rewardCoins: 200,
    rewardXp: 150,
    minLevel: 15,
  },
  {
    id: 'ancient_ritual',
    name: 'Ancient Ritual Site',
    description: 'The ruins of an ancient ritual site are exposed, containing mysterious artifacts and knowledge',
    emoji: '🏺',
    durationMs: 70000,
    rewardCoins: 180,
    rewardXp: 120,
    minLevel: 12,
  },
  {
    id: 'time_anomaly',
    name: 'Temporal Anomaly',
    description: 'A rare temporal disturbance causes modern objects to fossilize and ancient creatures to briefly appear',
    emoji: '⏰',
    durationMs: 50000,
    rewardCoins: 300,
    rewardXp: 200,
    minLevel: 25,
  },
];

// ============================================================
// SECTION 3: HOOK IMPLEMENTATION — useFossilOasis
// ============================================================

function createInitialCreatureState(): Record<string, FoCreatureState> {
  const map: Record<string, FoCreatureState> = {};
  for (const c of FO_CREATURES) {
    map[c.id] = { excavated: false, excavatedAt: null, preservationScore: 0, encounterCount: 0 };
  }
  return map;
}

function createInitialChamberState(): Record<string, FoChamberState> {
  const map: Record<string, FoChamberState> = {};
  for (const ch of FO_CHAMBERS) {
    map[ch.id] = { discovered: false, dugCount: 0, lastDugAt: null, fossilsFound: 0, depthLevel: 0 };
  }
  return map;
}

function createInitialStructureState(): Record<string, FoStructureState> {
  const map: Record<string, FoStructureState> = {};
  for (const s of FO_STRUCTURES) {
    map[s.id] = { built: false, level: 0, builtAt: null, lastUpgradedAt: null };
  }
  return map;
}

function createInitialAchievementState(): Record<string, FoAchievementState> {
  const map: Record<string, FoAchievementState> = {};
  for (const a of FO_ACHIEVEMENTS) {
    map[a.id] = { unlocked: false, unlockedAt: null };
  }
  return map;
}

function createInitialArtifactState(): Record<string, FoArtifactState> {
  const map: Record<string, FoArtifactState> = {};
  for (const ar of FO_ARTIFACTS) {
    map[ar.id] = { activated: false, activatedAt: null, charges: 3 };
  }
  return map;
}

function createInitialAbilityState(): Record<string, FoAbilityState> {
  const map: Record<string, FoAbilityState> = {};
  for (const ab of FO_ABILITIES) {
    map[ab.id] = { unlocked: false, lastUsedAt: null, useCount: 0 };
  }
  return map;
}

function createInitialStats(): FoStats {
  return {
    totalExcavated: 0,
    totalDigs: 0,
    totalStructuresBuilt: 0,
    totalArtifacts: 0,
    totalEvents: 0,
    totalCoins: 0,
    totalXp: 0,
    rareFossilsFound: 0,
    legendaryFossilsFound: 0,
  };
}

interface FoFullState {
  foLevel: number;
  foXp: number;
  foTotalXp: number;
  foTotalCoins: number;
  foFossils: Record<string, FoCreatureState>;
  foChambers: Record<string, FoChamberState>;
  foStructures: Record<string, FoStructureState>;
  foAchievements: Record<string, FoAchievementState>;
  foArtifacts: Record<string, FoArtifactState>;
  foAbilities: Record<string, FoAbilityState>;
  foInventory: FoInventoryItem[];
  foEventLog: FoEventLogEntry[];
  foStats: FoStats;
}

function loadPersistedState(): FoFullState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FO_SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FoFullState;
  } catch {
    return null;
  }
}

function persistState(state: FoFullState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FO_SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

export default function useFossilOasis() {
  // ─── Persisted State Initialization ────────────────────────────────────
  const persisted = useMemo(() => loadPersistedState(), []);

  // ─── Core State ────────────────────────────────────────────────────────
  const [foLevel, setFoLevel] = useState<number>(persisted?.foLevel ?? 1);
  const [foXp, setFoXp] = useState<number>(persisted?.foXp ?? 0);
  const [foTotalXp, setFoTotalXp] = useState<number>(persisted?.foTotalXp ?? 0);
  const [foTotalCoins, setFoTotalCoins] = useState<number>(persisted?.foTotalCoins ?? 0);
  const [foFossils, setFoFossils] = useState<Record<string, FoCreatureState>>(
    persisted?.foFossils ?? createInitialCreatureState()
  );
  const [foChambers, setFoChambers] = useState<Record<string, FoChamberState>>(
    persisted?.foChambers ?? createInitialChamberState()
  );
  const [foStructures, setFoStructures] = useState<Record<string, FoStructureState>>(
    persisted?.foStructures ?? createInitialStructureState()
  );
  const [foAchievements, setFoAchievements] = useState<Record<string, FoAchievementState>>(
    persisted?.foAchievements ?? createInitialAchievementState()
  );
  const [foArtifacts, setFoArtifacts] = useState<Record<string, FoArtifactState>>(
    persisted?.foArtifacts ?? createInitialArtifactState()
  );
  const [foAbilities, setFoAbilities] = useState<Record<string, FoAbilityState>>(
    persisted?.foAbilities ?? createInitialAbilityState()
  );
  const [foInventory, setFoInventory] = useState<FoInventoryItem[]>(persisted?.foInventory ?? []);
  const [foEventLog, setFoEventLog] = useState<FoEventLogEntry[]>(persisted?.foEventLog ?? []);
  const [foStats, setFoStats] = useState<FoStats>(persisted?.foStats ?? createInitialStats());
  const [foActiveEvent, setFoActiveEvent] = useState<FoEventDef | null>(null);
  const [foSeed] = useState(() => Math.floor(Math.random() * 1000000));
  const rngRef = useRef(foMulberry32(foSeed));

  // ─── State Ref (for accessing latest state in callbacks) ───────────────
  const stateRef = useRef<FoFullState>({
    foLevel,
    foXp,
    foTotalXp,
    foTotalCoins,
    foFossils,
    foChambers,
    foStructures,
    foAchievements,
    foArtifacts,
    foAbilities,
    foInventory,
    foEventLog,
    foStats,
  });

  useEffect(() => {
    stateRef.current = {
      foLevel,
      foXp,
      foTotalXp,
      foTotalCoins,
      foFossils,
      foChambers,
      foStructures,
      foAchievements,
      foArtifacts,
      foAbilities,
      foInventory,
      foEventLog,
      foStats,
    };
  }, [foLevel, foXp, foTotalXp, foTotalCoins, foFossils, foChambers, foStructures, foAchievements, foArtifacts, foAbilities, foInventory, foEventLog, foStats]);

  // ─── Persistence ──────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => {
      persistState(stateRef.current);
    }, 500);
    return () => clearTimeout(timer);
  }, [foLevel, foXp, foTotalXp, foTotalCoins, foFossils, foChambers, foStructures, foAchievements, foArtifacts, foAbilities, foInventory, foEventLog, foStats]);

  // ─── Computed: foMaxXp ────────────────────────────────────────────────
  const foMaxXp = useMemo(() => foXpRequired(foLevel), [foLevel]);

  // ─── Computed: foCurrentTitle ─────────────────────────────────────────
  const foCurrentTitle = useMemo(() => {
    let current = FO_TITLES[0];
    for (const title of FO_TITLES) {
      if (foLevel >= title.levelRequired) current = title;
    }
    return current;
  }, [foLevel]);

  // ─── Internal helpers ──────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    const finalXp = Math.floor(amount);
    setFoXp(prev => {
      let xp = prev + finalXp;
      let lvl = stateRef.current.foLevel;
      let needed = foXpRequired(lvl);
      while (xp >= needed && lvl < FO_MAX_LEVEL) {
        xp -= needed;
        lvl++;
        needed = foXpRequired(lvl);
      }
      if (lvl > stateRef.current.foLevel) setFoLevel(foClampLevel(lvl));
      return lvl >= FO_MAX_LEVEL ? 0 : xp;
    });
    setFoTotalXp(prev => prev + finalXp);
    setFoStats(prev => ({ ...prev, totalXp: prev.totalXp + finalXp }));
  }, []);

  const addCoins = useCallback((amount: number) => {
    setFoTotalCoins(prev => prev + Math.max(0, Math.floor(amount)));
    setFoStats(prev => ({ ...prev, totalCoins: prev.totalCoins + Math.max(0, Math.floor(amount)) }));
  }, []);

  const addInventoryItem = useCallback((materialId: string, quantity: number) => {
    setFoInventory(prev => {
      const existing = prev.find(item => item.materialId === materialId);
      if (existing) {
        return prev.map(item =>
          item.materialId === materialId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { materialId, quantity }];
    });
  }, []);

  // ─── Core Actions ──────────────────────────────────────────────────────

  const excavateFossil = useCallback((creatureId: string): boolean => {
    const def = FO_CREATURES.find(c => c.id === creatureId);
    if (!def) return false;
    if (foLevel < def.requiredLevel) return false;

    const fossilState = foFossils[creatureId];
    if (fossilState?.excavated) return false;

    const cost = def.excavationCost;
    // Check if player can afford (we use totalCoins as a proxy for available funds)
    const success = rngRef.current() < 0.3 + foLevel * 0.01 + (def.rarity === 'legendary' ? -0.15 : 0) + (def.rarity === 'epic' ? -0.08 : 0);

    setFoFossils(prev => ({
      ...prev,
      [creatureId]: {
        ...prev[creatureId],
        encounterCount: prev[creatureId].encounterCount + 1,
      },
    }));

    if (!success) {
      addCoins(Math.floor(cost * 0.05));
      return false;
    }

    const now = Date.now();
    const preservationScore = 50 + Math.floor(rngRef.current() * 50);

    setFoFossils(prev => ({
      ...prev,
      [creatureId]: {
        excavated: true,
        excavatedAt: now,
        preservationScore,
        encounterCount: prev[creatureId].encounterCount + 1,
      },
    }));

    addXp(def.xpReward);
    addCoins(def.coinReward);
    setFoStats(prev => ({
      ...prev,
      totalExcavated: prev.totalExcavated + 1,
      rareFossilsFound: prev.rareFossilsFound + (def.rarity === 'rare' || def.rarity === 'epic' || def.rarity === 'legendary' ? 1 : 0),
      legendaryFossilsFound: prev.legendaryFossilsFound + (def.rarity === 'legendary' ? 1 : 0),
    }));

    // Random material drops on excavation
    const chamberMaterials = FO_MATERIALS.filter(m => {
      const chamber = FO_CHAMBERS.find(ch => ch.resources.includes(m.id));
      return chamber && chamber.unlockLevel <= foLevel;
    });
    if (chamberMaterials.length > 0) {
      const dropCount = Math.floor(rngRef.current() * 2) + 1;
      for (let i = 0; i < dropCount; i++) {
        const mat = chamberMaterials[Math.floor(rngRef.current() * chamberMaterials.length)];
        if (mat) {
          const qty = Math.floor(rngRef.current() * 3) + 1;
          addInventoryItem(mat.id, qty);
        }
      }
    }

    return true;
  }, [foLevel, foFossils, addXp, addCoins, addInventoryItem]);

  const digSite = useCallback((chamberId: string): boolean => {
    const def = FO_CHAMBERS.find(ch => ch.id === chamberId);
    if (!def) return false;
    if (foLevel < def.unlockLevel) return false;

    const chamberState = foChambers[chamberId];
    if (!chamberState) return false;

    const now = Date.now();
    const fossilsFound = Math.floor(rngRef.current() * 3) + 1;
    const depthGain = Math.floor(rngRef.current() * 2) + 1;

    setFoChambers(prev => ({
      ...prev,
      [chamberId]: {
        discovered: true,
        dugCount: prev[chamberId].dugCount + 1,
        lastDugAt: now,
        fossilsFound: prev[chamberId].fossilsFound + fossilsFound,
        depthLevel: Math.min(prev[chamberId].depthLevel + depthGain, def.capacity),
      },
    }));

    // XP from digging
    const baseXp = def.level * 10 + 5;
    addXp(baseXp);

    // Random material drops
    const materialsInChamber = FO_MATERIALS.filter(m => def.resources.includes(m.id));
    if (materialsInChamber.length > 0) {
      const dropCount = Math.floor(rngRef.current() * 3) + 1;
      for (let i = 0; i < dropCount; i++) {
        const mat = materialsInChamber[Math.floor(rngRef.current() * materialsInChamber.length)];
        if (mat) {
          const qty = Math.floor(rngRef.current() * 3) + 1;
          addInventoryItem(mat.id, qty);
          addXp(mat.gatherXp);
        }
      }
    }

    addCoins(Math.floor(rngRef.current() * 30) + 10);
    setFoStats(prev => ({ ...prev, totalDigs: prev.totalDigs + 1 }));

    return true;
  }, [foLevel, foChambers, addXp, addCoins, addInventoryItem]);

  const buildStructure = useCallback((structureId: string): boolean => {
    const def = FO_STRUCTURES.find(s => s.id === structureId);
    if (!def) return false;
    if (foLevel < def.requiredLevel) return false;

    const structureState = foStructures[structureId];
    if (!structureState) return false;

    const now = Date.now();

    if (!structureState.built) {
      // Build new
      const coinCost = def.buildCost;
      setFoStructures(prev => ({
        ...prev,
        [structureId]: { built: true, level: 1, builtAt: now, lastUpgradedAt: now },
      }));
      addXp(def.requiredLevel * 5 + 20);
      setFoStats(prev => ({ ...prev, totalStructuresBuilt: prev.totalStructuresBuilt + 1 }));
      return true;
    }

    // Upgrade existing
    if (structureState.level >= def.maxLevel) return false;
    const mult = structureState.level;
    const coinCost = Math.floor(def.upgradeCost * (1 + mult * 0.3));

    setFoStructures(prev => ({
      ...prev,
      [structureId]: { ...prev[structureId], level: prev[structureId].level + 1, lastUpgradedAt: now },
    }));
    addXp(def.requiredLevel * 3 + structureState.level * 10);
    return true;
  }, [foLevel, foStructures, addXp]);

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const def = FO_ARTIFACTS.find(a => a.id === artifactId);
    if (!def) return false;
    if (foLevel < def.unlockLevel) return false;

    const artifactState = foArtifacts[artifactId];
    if (!artifactState || artifactState.activated || artifactState.charges <= 0) return false;

    setFoArtifacts(prev => ({
      ...prev,
      [artifactId]: { ...prev[artifactId], activated: true, activatedAt: Date.now(), charges: prev[artifactId].charges - 1 },
    }));
    addXp(def.unlockLevel * 8 + 50);
    addCoins(def.unlockLevel * 20);
    setFoStats(prev => ({ ...prev, totalArtifacts: prev.totalArtifacts + 1 }));
    return true;
  }, [foLevel, foArtifacts, addXp, addCoins]);

  const triggerOasisEvent = useCallback((eventId?: string): FoEventDef | null => {
    const eligible = FO_EVENTS.filter(e => e.minLevel <= foLevel);
    if (eligible.length === 0) return null;

    const event = eventId
      ? FO_EVENTS.find(e => e.id === eventId && e.minLevel <= foLevel) ?? null
      : eligible[Math.floor(rngRef.current() * eligible.length)];

    if (!event) return null;

    const entry: FoEventLogEntry = {
      eventId: event.id,
      triggeredAt: Date.now(),
      rewardClaimed: false,
    };
    setFoEventLog(prev => [...prev.slice(-49), entry]);
    setFoActiveEvent(event);

    addCoins(event.rewardCoins);
    addXp(event.rewardXp);
    setFoStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));

    // Auto-clear active event after duration
    setTimeout(() => {
      setFoActiveEvent(prev => (prev?.id === event.id ? null : prev));
    }, event.durationMs);

    return event;
  }, [foLevel, addCoins, addXp]);

  const resetFossilOasis = useCallback(() => {
    setFoLevel(1);
    setFoXp(0);
    setFoTotalXp(0);
    setFoTotalCoins(0);
    setFoFossils(createInitialCreatureState());
    setFoChambers(createInitialChamberState());
    setFoStructures(createInitialStructureState());
    setFoAchievements(createInitialAchievementState());
    setFoArtifacts(createInitialArtifactState());
    setFoAbilities(createInitialAbilityState());
    setFoInventory([]);
    setFoEventLog([]);
    setFoActiveEvent(null);
    setFoStats(createInitialStats());
    rngRef.current = foMulberry32(Math.floor(Math.random() * 1000000));

    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(FO_SAVE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  // ─── Extended Actions ──────────────────────────────────────────────────

  const discoverSite = useCallback((chamberId: string): boolean => {
    const def = FO_CHAMBERS.find(ch => ch.id === chamberId);
    if (!def || foLevel < def.unlockLevel) return false;

    const state = foChambers[chamberId];
    if (state?.discovered) return false;

    setFoChambers(prev => ({
      ...prev,
      [chamberId]: { ...prev[chamberId], discovered: true },
    }));
    setFoStats(prev => ({ ...prev, totalDigs: prev.totalDigs + 1 }));
    addXp(def.level * 8);
    return true;
  }, [foLevel, foChambers, addXp]);

  const checkAndClaimAchievements = useCallback((): string[] => {
    const newlyUnlocked: string[] = [];

    setFoAchievements(prev => {
      const next = { ...prev };
      const stats = stateRef.current.foStats;
      for (const ach of FO_ACHIEVEMENTS) {
        if (next[ach.id].unlocked) continue;
        let current = 0;
        switch (ach.conditionKey) {
          case 'totalExcavated': current = stats.totalExcavated; break;
          case 'totalDigs': current = stats.totalDigs; break;
          case 'totalStructuresBuilt': current = stats.totalStructuresBuilt; break;
          case 'totalArtifacts': current = stats.totalArtifacts; break;
          case 'totalEvents': current = stats.totalEvents; break;
          case 'totalCoins': current = stats.totalCoins; break;
          case 'totalXp': current = stats.totalXp; break;
          case 'rareFossilsFound': current = stats.rareFossilsFound; break;
          case 'legendaryFossilsFound': current = stats.legendaryFossilsFound; break;
        }
        if (current >= ach.targetValue) {
          next[ach.id] = { unlocked: true, unlockedAt: Date.now() };
          newlyUnlocked.push(ach.id);
        }
      }
      return next;
    });

    // Grant rewards outside of setState to avoid stale closure
    for (const achId of newlyUnlocked) {
      const ach = FO_ACHIEVEMENTS.find(a => a.id === achId);
      if (ach) {
        addXp(ach.rewardXp);
        addCoins(ach.rewardCoins);
      }
    }

    return newlyUnlocked;
  }, [addXp, addCoins]);

  const useAbility = useCallback((abilityId: string): boolean => {
    const def = FO_ABILITIES.find(a => a.id === abilityId);
    if (!def) return false;
    if (foLevel < def.unlockLevel) return false;

    const abilityState = foAbilities[abilityId];
    if (!abilityState) return false;

    const now = Date.now();
    if (abilityState.lastUsedAt && now - abilityState.lastUsedAt < def.cooldownMs) return false;

    setFoAbilities(prev => ({
      ...prev,
      [abilityId]: {
        unlocked: true,
        lastUsedAt: now,
        useCount: prev[abilityId].useCount + 1,
      },
    }));
    addXp(Math.floor(def.power * 0.5) + 5);
    return true;
  }, [foLevel, foAbilities, addXp]);

  // ─── Auto-unlock abilities based on level ──────────────────────────────

  useEffect(() => {
    setFoAbilities(prev => {
      const next = { ...prev };
      let changed = false;
      for (const ab of FO_ABILITIES) {
        if (!next[ab.id].unlocked && foLevel >= ab.unlockLevel) {
          next[ab.id] = { ...next[ab.id], unlocked: true };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [foLevel]);

  // ─── Title System ──────────────────────────────────────────────────────

  const nextTitleInfo = useMemo(() => {
    const idx = FO_TITLES.findIndex(t => t.levelRequired > foLevel);
    return idx >= 0 ? FO_TITLES[idx] : null;
  }, [foLevel]);

  const titleProgress = useMemo(() => {
    if (!nextTitleInfo) return 1;
    const prevTitle = [...FO_TITLES].reverse().find(t => t.levelRequired <= foLevel) ?? FO_TITLES[0];
    const range = nextTitleInfo.levelRequired - prevTitle.levelRequired;
    const progress = foLevel - prevTitle.levelRequired;
    return range > 0 ? Math.min(1, progress / range) : 1;
  }, [foLevel, nextTitleInfo]);

  // ─── Stats Summary ────────────────────────────────────────────────────

  const statsSummary = useMemo(() => {
    const excavatedCount = Object.values(foFossils).filter(f => f.excavated).length;
    const discoveredCount = Object.values(foChambers).filter(ch => ch.discovered).length;
    const builtCount = Object.values(foStructures).filter(s => s.built).length;
    const activatedArtifacts = Object.values(foArtifacts).filter(a => a.activated).length;
    const unlockedAchievements = Object.values(foAchievements).filter(a => a.unlocked).length;

    return {
      excavatedCount,
      discoveredCount,
      builtCount,
      activatedArtifacts,
      unlockedAchievements,
      totalCreatures: FO_CREATURES.length,
      totalChambers: FO_CHAMBERS.length,
      totalStructures: FO_STRUCTURES.length,
      totalArtifacts: FO_ARTIFACTS.length,
      totalAchievements: FO_ACHIEVEMENTS.length,
    };
  }, [foFossils, foChambers, foStructures, foArtifacts, foAchievements]);

  const completionStats = useMemo(() => {
    const { excavatedCount, discoveredCount, builtCount, activatedArtifacts, unlockedAchievements } = statsSummary;
    const fossilPct = (excavatedCount / FO_CREATURES.length) * 100;
    const chamberPct = (discoveredCount / FO_CHAMBERS.length) * 100;
    const structurePct = (builtCount / FO_STRUCTURES.length) * 100;
    const artifactPct = (activatedArtifacts / FO_ARTIFACTS.length) * 100;
    const achievementPct = (unlockedAchievements / FO_ACHIEVEMENTS.length) * 100;
    const overallPct = (fossilPct + chamberPct + structurePct + artifactPct + achievementPct) / 5;
    return {
      fossilPct: Math.round(fossilPct),
      chamberPct: Math.round(chamberPct),
      structurePct: Math.round(structurePct),
      artifactPct: Math.round(artifactPct),
      achievementPct: Math.round(achievementPct),
      overallPct: Math.round(overallPct),
    };
  }, [statsSummary]);

  // ─── Enriched Data ────────────────────────────────────────────────────

  const enrichedCreatures = useMemo(() => {
    return FO_CREATURES.map(c => ({
      ...c,
      speciesDef: FO_SPECIES.find(s => s.key === c.species),
      state: foFossils[c.id] ?? { excavated: false, excavatedAt: null, preservationScore: 0, encounterCount: 0 },
      rarityInfo: FO_RARITIES.find(r => r.key === c.rarity),
    }));
  }, [foFossils]);

  const enrichedChambers = useMemo(() => {
    return FO_CHAMBERS.map(ch => ({
      ...ch,
      state: foChambers[ch.id] ?? { discovered: false, dugCount: 0, lastDugAt: null, fossilsFound: 0, depthLevel: 0 },
      materialsInChamber: FO_MATERIALS.filter(m => ch.resources.includes(m.id)),
      creaturesInChamber: FO_CREATURES.filter(c => c.requiredLevel <= foLevel && Math.abs(c.requiredLevel - ch.unlockLevel) <= 15),
    }));
  }, [foChambers, foLevel]);

  const enrichedStructures = useMemo(() => {
    return FO_STRUCTURES.map(s => ({
      ...s,
      state: foStructures[s.id] ?? { built: false, level: 0, builtAt: null, lastUpgradedAt: null },
      isMaxLevel: (foStructures[s.id]?.level ?? 0) >= s.maxLevel,
      currentBonus: (foStructures[s.id]?.level ?? 0) * s.bonusValue,
    }));
  }, [foStructures]);

  const enrichedInventory = useMemo(() => {
    return foInventory
      .filter(item => item.quantity > 0)
      .map(item => {
        const def = FO_MATERIALS.find(m => m.id === item.materialId);
        return def ? { ...def, quantity: item.quantity, rarityInfo: FO_RARITIES.find(r => r.key === def.rarity) } : null;
      })
      .filter(Boolean) as (FoMaterialDef & { quantity: number; rarityInfo: FoRarityInfo | undefined })[];
  }, [foInventory]);

  // ─── Computed Groupings ────────────────────────────────────────────────

  const creaturesBySpecies = useMemo(() => {
    const map: Record<string, typeof enrichedCreatures> = {};
    for (const c of enrichedCreatures) {
      if (!map[c.species]) map[c.species] = [];
      map[c.species].push(c);
    }
    return map;
  }, [enrichedCreatures]);

  const creaturesByRarity = useMemo(() => {
    const map: Record<FoRarity, typeof enrichedCreatures> = {
      common: [],
      uncommon: [],
      rare: [],
      epic: [],
      legendary: [],
    };
    for (const c of enrichedCreatures) {
      map[c.rarity].push(c);
    }
    return map;
  }, [enrichedCreatures]);

  const availableExcavations = useMemo(() => {
    return FO_CREATURES.filter(c => c.requiredLevel <= foLevel && !foFossils[c.id]?.excavated);
  }, [foLevel, foFossils]);

  const pendingAchievements = useMemo(() => {
    return FO_ACHIEVEMENTS.filter(ach => {
      if (foAchievements[ach.id]?.unlocked) return false;
      let current = 0;
      switch (ach.conditionKey) {
        case 'totalExcavated': current = foStats.totalExcavated; break;
        case 'totalDigs': current = foStats.totalDigs; break;
        case 'totalStructuresBuilt': current = foStats.totalStructuresBuilt; break;
        case 'totalArtifacts': current = foStats.totalArtifacts; break;
        case 'totalEvents': current = foStats.totalEvents; break;
        case 'totalCoins': current = foStats.totalCoins; break;
        case 'totalXp': current = foStats.totalXp; break;
        case 'rareFossilsFound': current = foStats.rareFossilsFound; break;
        case 'legendaryFossilsFound': current = foStats.legendaryFossilsFound; break;
      }
      return current >= ach.targetValue * 0.75;
    });
  }, [foAchievements, foStats]);

  const recentEventLog = useMemo(() => {
    return [...foEventLog].reverse().slice(0, 10).map(entry => {
      const def = FO_EVENTS.find(e => e.id === entry.eventId);
      return { ...entry, eventDef: def ?? null };
    });
  }, [foEventLog]);

  // ─── Helpers ──────────────────────────────────────────────────────────

  const getRarityColor = useCallback((rarity: FoRarity): string => {
    return FO_RARITY_COLORS[rarity] ?? '#A0937D';
  }, []);

  const getSpeciesColor = useCallback((species: FoSpecies): string => {
    return FO_SPECIES_COLORS[species] ?? '#A0937D';
  }, []);

  const getStructureBonus = useCallback((bonusType: FoStructureBonusType): number => {
    let total = 0;
    for (const s of FO_STRUCTURES) {
      const state = foStructures[s.id];
      if (state?.built && s.bonusType === bonusType) {
        total += state.level * s.bonusValue;
      }
    }
    return total;
  }, [foStructures]);

  const getExcavationSuccessRate = useCallback((rarity: FoRarity): number => {
    const base = 0.3 + foLevel * 0.01;
    const rarityMod = rarity === 'legendary' ? -0.15 : rarity === 'epic' ? -0.08 : 0;
    const structureBonus = getStructureBonus('dig_speed') * 0.002;
    return Math.min(0.95, Math.max(0.05, base + rarityMod + structureBonus));
  }, [foLevel, getStructureBonus]);

  const getArtifactBonus = useCallback((bonusType: string): number => {
    let total = 0;
    for (const a of FO_ARTIFACTS) {
      const state = foArtifacts[a.id];
      if (state?.activated && a.bonusType === bonusType) {
        total += a.bonusValue;
      }
    }
    return total;
  }, [foArtifacts]);

  // ─── Return (Pattern A — all constants directly on the API object) ─────

  return {
    // Constants
    FO_SPECIES,
    FO_RARITIES,
    FO_TITLES,
    FO_CHAMBERS,
    FO_CREATURES,
    FO_MATERIALS,
    FO_STRUCTURES,
    FO_ABILITIES,
    FO_ACHIEVEMENTS,
    FO_ARTIFACTS,
    FO_EVENTS,
    FO_COLOR_THEME,
    FO_RARITY_COLORS,
    FO_SPECIES_COLORS,
    FO_MAX_LEVEL,
    FO_XP_BASE,
    FO_XP_SCALE,
    FO_SAVE_KEY,

    // State
    foLevel,
    foXp,
    foMaxXp,
    foCurrentTitle,
    foTotalXp,
    foTotalCoins,
    foFossils,
    foChambers,
    foStructures,
    foArtifacts,
    foAbilities,
    foAchievements,
    foInventory,
    foEventLog,
    foActiveEvent,
    foStats,

    // Core Actions
    excavateFossil,
    digSite,
    buildStructure,
    activateArtifact,
    triggerOasisEvent,
    resetFossilOasis,

    // Extended Actions
    discoverSite,
    checkAndClaimAchievements,
    useAbility,

    // Title System
    nextTitleInfo,
    titleProgress,

    // Stats
    statsSummary,
    completionStats,

    // Enriched Data
    enrichedCreatures,
    enrichedChambers,
    enrichedStructures,
    enrichedInventory,

    // Computed Groupings
    creaturesBySpecies,
    creaturesByRarity,
    availableExcavations,
    pendingAchievements,
    recentEventLog,

    // Helpers
    getRarityColor,
    getSpeciesColor,
    getStructureBonus,
    getExcavationSuccessRate,
    getArtifactBonus,
  };
}
