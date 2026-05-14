import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ═══════════════════════════════════════════════════════════════════
// Venom Abyss — 毒液深渊 : Word Snake Game Wire Module
// Dark underground world of venomous creatures, toxic swamps,
// deadly alchemy, and serpent dominion.
// ═══════════════════════════════════════════════════════════════════

// ───────────────────────────────────────────────────────────────────
// VA_ EXPORTED CONSTANTS
// ───────────────────────────────────────────────────────────────────

export const VA_TOXIC_GREEN = '#39FF14';
export const VA_VENOM_PURPLE = '#7B2D8E';
export const VA_DARK_AMBER = '#FF8C00';
export const VA_SLIME_YELLOW = '#C5E17A';
export const VA_ABYSS_BLACK = '#0A0A0F';

export const VA_MAX_ENERGY = 100;
export const VA_MAX_TOXICITY = 100;
export const VA_MAX_CORRUPTION = 9999;
export const VA_MAX_INFAMY = 10000;
export const VA_NEST_MAX_LEVEL = 10;
export const VA_CREATURE_TIERS = 5;
export const VA_CREATURES_PER_TIER = 7;
export const VA_TOTAL_CREATURES = VA_CREATURE_TIERS * VA_CREATURES_PER_TIER;

export const VA_RARITY_NAMES = [
  'Common',
  'Unusual',
  'Rare',
  'Epic',
  'Legendary',
] as const;

export const VA_RARITY_COLORS = [
  '#78909C',
  '#26A69A',
  '#AB47BC',
  '#EF5350',
  '#FFD740',
] as const;

export const VA_RARITY_MULTIPLIERS = [1, 2, 5, 10, 25] as const;

export const VA_TITLES = [
  'Venom Novice',
  'Fang Apprentice',
  'Toxic Tamer',
  'Swamp Stalker',
  'Serpent Warlord',
  'Brew Master',
  'Abyss Monarch',
  'Abyss Overlord',
] as const;

export const VA_ZONE_NAMES = [
  'Toxic Swamp',
  'Serpent Den',
  'Acid Caverns',
  'Fungal Hollow',
  'Venom Gorge',
  'Blighted Wasteland',
  'Cursed Depths',
  'Abyssal Throne',
] as const;

// ───────────────────────────────────────────────────────────────────
// STATIC DATA DEFINITIONS
// ───────────────────────────────────────────────────────────────────

const RARITY_COMMON = 0;
const RARITY_UNUSUAL = 1;
const RARITY_RARE = 2;
const RARITY_EPIC = 3;
const RARITY_LEGENDARY = 4;

const ZONE_TOXIC_SWAMP = 0;
const ZONE_SERPENT_DEN = 1;
const ZONE_ACID_CAVERNS = 2;
const ZONE_FUNGAL_HOLLOW = 3;
const ZONE_VENOM_GORGE = 4;
const ZONE_BLIGHTED_WASTELAND = 5;
const ZONE_CURSED_DEPTHS = 6;
const ZONE_ABYSSAL_THRONE = 7;

// ── 35 Venom Creatures (5 tiers × 7 each) ──

interface VenomCreatureDef {
  id: number;
  name: string;
  rarity: number;
  zone: number;
  emoji: string;
  venomType: string;
  toxicity: number;
  speed: number;
  description: string;
  venomColor: string;
}

const VENOM_CREATURES: VenomCreatureDef[] = [
  // ── Common (Tier 0) ──
  { id: 1, name: 'Mud Adder', rarity: RARITY_COMMON, zone: ZONE_TOXIC_SWAMP, emoji: '🐍', venomType: 'Hemotoxin', toxicity: 10, speed: 12, description: 'A small swamp snake that secretes blood-thinning venom', venomColor: '#66BB6A' },
  { id: 2, name: 'Slime Toad', rarity: RARITY_COMMON, zone: ZONE_TOXIC_SWAMP, emoji: '🐸', venomType: 'Paralytic', toxicity: 8, speed: 5, description: 'A warty toad whose skin oozes numbing slime', venomColor: '#AED581' },
  { id: 3, name: 'Gloom Spider', rarity: RARITY_COMMON, zone: ZONE_SERPENT_DEN, emoji: '🕷️', venomType: 'Neurotoxin', toxicity: 11, speed: 18, description: 'A common cave spider with a mild neurotoxic bite', venomColor: '#78909C' },
  { id: 4, name: 'Bog Leech', rarity: RARITY_COMMON, zone: ZONE_TOXIC_SWAMP, emoji: '🪱', venomType: 'Anticoagulant', toxicity: 7, speed: 3, description: 'A segmented leech that prevents blood clotting', venomColor: '#8D6E63' },
  { id: 5, name: 'Rust Centipede', rarity: RARITY_COMMON, zone: ZONE_ACID_CAVERNS, emoji: '🐛', venomType: 'Cytotoxin', toxicity: 9, speed: 20, description: 'An iron-colored centipede with corrosive venom glands', venomColor: '#A1887F' },
  { id: 6, name: 'Dusk Wasp', rarity: RARITY_COMMON, zone: ZONE_FUNGAL_HOLLOW, emoji: '🪰', venomType: 'Apitoxin', toxicity: 12, speed: 25, description: 'A aggressive wasp that hunts in the twilight mushroom groves', venomColor: '#FFD54F' },
  { id: 7, name: 'Fen Scorpion', rarity: RARITY_COMMON, zone: ZONE_TOXIC_SWAMP, emoji: '🦂', venomType: 'Hemotoxin', toxicity: 13, speed: 8, description: 'A small scorpion lurking in swamp mud with burning venom', venomColor: '#BCAAA4' },
  // ── Unusual (Tier 1) ──
  { id: 8, name: 'Copper Viper', rarity: RARITY_UNUSUAL, zone: ZONE_SERPENT_DEN, emoji: '🐍', venomType: 'Neurotoxin', toxicity: 25, speed: 30, description: 'A swift viper with copper-patterned scales and potent nerve venom', venomColor: '#EF6C00' },
  { id: 9, name: 'Blight Beetle', rarity: RARITY_UNUSUAL, zone: ZONE_FUNGAL_HOLLOW, emoji: '🪲', venomType: 'Cytotoxin', toxicity: 28, speed: 10, description: 'A beetle that carries flesh-dissolving acid in its shell', venomColor: '#9E9D24' },
  { id: 10, name: 'Mire Jellyfish', rarity: RARITY_UNUSUAL, zone: ZONE_TOXIC_SWAMP, emoji: '🪼', venomType: 'Nematocyst', toxicity: 22, speed: 2, description: 'A translucent jellyfish drifting in swamp waters with stinging tentacles', venomColor: '#80DEEA' },
  { id: 11, name: 'Ash Moth', rarity: RARITY_UNUSUAL, zone: ZONE_ACID_CAVERNS, emoji: '🦋', venomType: 'Lepidopterin', toxicity: 20, speed: 22, description: 'A grey moth whose wing dust causes respiratory paralysis', venomColor: '#BDBDBD' },
  { id: 12, name: 'Fang Salamander', rarity: RARITY_UNUSUAL, zone: ZONE_VENOM_GORGE, emoji: '🦎', venomType: 'Tetrodotoxin', toxicity: 30, speed: 15, description: 'A brilliant salamander whose skin secretes pufferfish-grade toxin', venomColor: '#FF7043' },
  { id: 13, name: 'Needle Wasp', rarity: RARITY_UNUSUAL, zone: ZONE_FUNGAL_HOLLOW, emoji: '🐝', venomType: 'Apitoxin', toxicity: 27, speed: 35, description: 'An elongated wasp with a needle-like stinger full of concentrated venom', venomColor: '#FFCA28' },
  { id: 14, name: 'Ember Ant', rarity: RARITY_UNUSUAL, zone: ZONE_BLIGHTED_WASTELAND, emoji: '🐜', venomType: 'Formic Acid', toxicity: 24, speed: 28, description: 'A colony ant that sprays burning formic acid at threats', venomColor: '#FF8F00' },
  // ── Rare (Tier 2) ──
  { id: 15, name: 'Coral Snake King', rarity: RARITY_RARE, zone: ZONE_SERPENT_DEN, emoji: '🐍', venomType: 'Neurotoxin', toxicity: 60, speed: 40, description: 'A massive coral snake whose venom mimics the king cobra', venomColor: '#E53935' },
  { id: 16, name: 'Gorgon Tarantula', rarity: RARITY_RARE, zone: ZONE_FUNGAL_HOLLOW, emoji: '🕷️', venomType: 'Hemotoxin', toxicity: 65, speed: 15, description: 'A fist-sized tarantula that turns prey to liquid from the inside', venomColor: '#6A1B9A' },
  { id: 17, name: 'Acid Basilisk', rarity: RARITY_RARE, zone: ZONE_ACID_CAVERNS, emoji: '🦎', venomType: 'Acid', toxicity: 58, speed: 35, description: 'A reptilian horror that drips concentrated acid from its jaws', venomColor: '#76FF03' },
  { id: 18, name: 'Plague Rat', rarity: RARITY_RARE, zone: ZONE_BLIGHTED_WASTELAND, emoji: '🐀', venomType: 'Septic', toxicity: 55, speed: 45, description: 'A giant rat carrying multiply-resistant septic venom strains', venomColor: '#4E342E' },
  { id: 19, name: 'Shadow Mamba', rarity: RARITY_RARE, zone: ZONE_SERPENT_DEN, emoji: '🐍', venomType: 'Neurotoxin', toxicity: 70, speed: 55, description: 'A black mamba variant that strikes from total darkness', venomColor: '#212121' },
  { id: 20, name: 'Thorn Drake', rarity: RARITY_RARE, zone: ZONE_VENOM_GORGE, emoji: '🐉', venomType: 'Myotoxin', toxicity: 62, speed: 38, description: 'A small drake whose thorned tail injects muscle-destroying venom', venomColor: '#2E7D32' },
  { id: 21, name: 'Blight Frog', rarity: RARITY_RARE, zone: ZONE_FUNGAL_HOLLOW, emoji: '🐸', venomType: 'Batrachotoxin', toxicity: 72, speed: 6, description: 'A brilliantly colored frog with the deadliest toxin per gram known', venomColor: '#D50000' },
  // ── Epic (Tier 3) ──
  { id: 22, name: 'Venom Hydra', rarity: RARITY_EPIC, zone: ZONE_VENOM_GORGE, emoji: '🐉', venomType: 'Multi-venom', toxicity: 130, speed: 30, description: 'A multi-headed serpent whose each head produces a different deadly venom', venomColor: '#1B5E20' },
  { id: 23, name: 'Abyssal Widow', rarity: RARITY_EPIC, zone: ZONE_CURSED_DEPTHS, emoji: '🕷️', venomType: 'Latrotoxin', toxicity: 140, speed: 25, description: 'A gargantuan black widow dwelling in the deepest cursed caves', venomColor: '#1A1A2E' },
  { id: 24, name: 'Corrosion Wyrm', rarity: RARITY_EPIC, zone: ZONE_ACID_CAVERNS, emoji: '🪱', venomType: 'Supercritical Acid', toxicity: 135, speed: 12, description: 'A massive worm that melts solid rock with its acidic secretions', venomColor: '#00E676' },
  { id: 25, name: 'Nightmare Viper', rarity: RARITY_EPIC, zone: ZONE_CURSED_DEPTHS, emoji: '🐍', venomType: 'Oneirotoxin', toxicity: 128, speed: 50, description: 'A viper whose venom induces eternal nightmares and paralysis', venomColor: '#311B92' },
  { id: 26, name: 'Blight Colossus', rarity: RARITY_EPIC, zone: ZONE_BLIGHTED_WASTELAND, emoji: '🦗', toxicity: 145, speed: 20, description: 'A towering insectoid covered in poison glands that rain toxic spores', venomColor: '#33691E' },
  { id: 27, name: 'Fungal Stalker', rarity: RARITY_EPIC, zone: ZONE_FUNGAL_HOLLOW, emoji: '🍄', venomType: 'Amatoxin', toxicity: 138, speed: 18, description: 'A mobile fungal entity that parasitizes hosts with organ-destroying toxins', venomColor: '#FF6F00' },
  { id: 28, name: 'Serpent Matriarch', rarity: RARITY_EPIC, zone: ZONE_SERPENT_DEN, emoji: '👸', venomType: 'Royal Neurotoxin', toxicity: 150, speed: 42, description: 'The queen of the serpent den, commanding all lesser snakes with pheromonal venom', venomColor: '#880E4F' },
  // ── Legendary (Tier 4) ──
  { id: 29, name: 'Abyssal Serpent God', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '🐲', venomType: 'Primordial Venom', toxicity: 300, speed: 60, description: 'The ancient serpent deity whose venom birthed all poison in the abyss', venomColor: '#39FF14' },
  { id: 30, name: 'Void Weaver', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '🕸️', venomType: 'Void Toxin', toxicity: 280, speed: 35, description: 'A spider that spins webs between dimensions, its venom erasing existence', venomColor: '#7C4DFF' },
  { id: 31, name: 'Blight Primordial', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '☠️', venomType: 'Omni-blight', toxicity: 310, speed: 25, description: 'The original source of all blight, a living catastrophe of pure toxicity', venomColor: '#00C853' },
  { id: 32, name: 'Acid Leviathan', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '🌊', venomType: 'Universal Solvent', toxicity: 295, speed: 40, description: 'A titanic beast whose body is living acid that dissolves entire landscapes', venomColor: '#FFD740' },
  { id: 33, name: 'Venom Phoenix', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '🔥', venomType: 'Catalytic Venom', toxicity: 270, speed: 70, description: 'A phoenix reborn from venom ash, whose tears are the most potent antidote', venomColor: '#FF6D00' },
  { id: 34, name: 'Sovereign Mamba', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '👑', venomType: 'Sovereign Neurotoxin', toxicity: 320, speed: 65, description: 'The supreme predator of the abyss, one drop of its venom can fell a titan', venomColor: '#AA00FF' },
  { id: 35, name: 'Corruption Entity', rarity: RARITY_LEGENDARY, zone: ZONE_ABYSSAL_THRONE, emoji: '👁️', venomType: 'Entropy Venom', toxicity: 350, speed: 55, description: 'An otherworldly entity of pure corruption whose venom decays reality itself', venomColor: '#0A0A0F' },
];

// ── 8 Abyss Zones ──

interface AbyssZoneDef {
  id: number;
  name: string;
  corruptionRange: [number, number];
  requiredTitle: number;
  baseToxicityCost: number;
  description: string;
  ambientColor: string;
  bgGradient: string;
  creaturesAvailable: number[];
}

const ABYSS_ZONES: AbyssZoneDef[] = [
  {
    id: 0,
    name: 'Toxic Swamp',
    corruptionRange: [0, 200],
    requiredTitle: 0,
    baseToxicityCost: 5,
    description: 'A festering marsh of bubbling green sludge. Home to basic venomous creatures. Perfect for novices.',
    ambientColor: '#2E7D32',
    bgGradient: 'linear-gradient(180deg, #1B2631 0%, #1E3A2B 50%, #0D1F0D 100%)',
    creaturesAvailable: [1, 2, 4, 7],
  },
  {
    id: 1,
    name: 'Serpent Den',
    corruptionRange: [200, 500],
    requiredTitle: 0,
    baseToxicityCost: 10,
    description: 'A winding network of underground tunnels where serpents coil in vast numbers.',
    ambientColor: '#BF360C',
    bgGradient: 'linear-gradient(180deg, #1A1A2E 0%, #3E2723 50%, #1B0F0A 100%)',
    creaturesAvailable: [3, 8, 15, 19],
  },
  {
    id: 2,
    name: 'Acid Caverns',
    corruptionRange: [500, 800],
    requiredTitle: 1,
    baseToxicityCost: 15,
    description: 'Caverns carved by rivers of acid. The walls hiss and bubble with corrosive fumes.',
    ambientColor: '#76FF03',
    bgGradient: 'linear-gradient(180deg, #0D1F0D 0%, #1B3A00 50%, #0A0A0F 100%)',
    creaturesAvailable: [5, 11, 17, 24],
  },
  {
    id: 3,
    name: 'Fungal Hollow',
    corruptionRange: [800, 1500],
    requiredTitle: 2,
    baseToxicityCost: 25,
    description: 'A vast underground cavern illuminated by bioluminescent fungi. Spores fill the air.',
    ambientColor: '#6A1B9A',
    bgGradient: 'linear-gradient(180deg, #1A0033 0%, #2E0854 50%, #0A0A0F 100%)',
    creaturesAvailable: [6, 9, 13, 16, 21],
  },
  {
    id: 4,
    name: 'Venom Gorge',
    corruptionRange: [1500, 4000],
    requiredTitle: 3,
    baseToxicityCost: 35,
    description: 'A deep canyon where venom pools collect from every crack. The strongest creatures gather here.',
    ambientColor: '#880E4F',
    bgGradient: 'linear-gradient(180deg, #1A0A10 0%, #3E0A1A 50%, #0A0A0F 100%)',
    creaturesAvailable: [12, 20, 22, 28],
  },
  {
    id: 5,
    name: 'Blighted Wasteland',
    corruptionRange: [4000, 6000],
    requiredTitle: 4,
    baseToxicityCost: 45,
    description: 'A scorched wasteland where blight has consumed all life. Toxic storms rage constantly.',
    ambientColor: '#33691E',
    bgGradient: 'linear-gradient(180deg, #1A1A00 0%, #2B2B00 50%, #0A0A0F 100%)',
    creaturesAvailable: [14, 18, 26, 31],
  },
  {
    id: 6,
    name: 'Cursed Depths',
    corruptionRange: [6000, 9000],
    requiredTitle: 5,
    baseToxicityCost: 60,
    description: 'The deepest caves where ancient curses warp reality. Even the air is venomous.',
    ambientColor: '#0A0A0F',
    bgGradient: 'linear-gradient(180deg, #0A0A14 0%, #050508 50%, #000000 100%)',
    creaturesAvailable: [23, 25, 27, 30],
  },
  {
    id: 7,
    name: 'Abyssal Throne',
    corruptionRange: [9000, 9999],
    requiredTitle: 6,
    baseToxicityCost: 80,
    description: 'The heart of the abyss. Only legendary creatures of unfathomable power dwell here.',
    ambientColor: '#39FF14',
    bgGradient: 'linear-gradient(180deg, #0A0A0F 0%, #001A00 50%, #000000 100%)',
    creaturesAvailable: [29, 30, 31, 32, 33, 34, 35],
  },
];

// ── 30 Alchemy Ingredients ──

interface AlchemyIngredientDef {
  id: number;
  name: string;
  emoji: string;
  type: 'reagent' | 'catalyst' | 'solvent' | 'essence' | 'crystal' | 'organ';
  rarity: number;
  toxicityBonus: number;
  energyBonus: number;
  corruptionBonus: number;
  brewBonus: number;
  description: string;
  cost: number;
}

const ALCHEMY_INGREDIENTS: AlchemyIngredientDef[] = [
  { id: 1, name: 'Swamp Slime', emoji: '🧪', type: 'reagent', rarity: 0, toxicityBonus: 5, energyBonus: 0, corruptionBonus: 0, brewBonus: 0, description: 'Basic green slime scraped from swamp rocks', cost: 50 },
  { id: 2, name: 'Fang Extract', emoji: '🦷', type: 'organ', rarity: 0, toxicityBonus: 0, energyBonus: 5, corruptionBonus: 0, brewBonus: 0, description: 'Dried venom sacs from common snakes', cost: 60 },
  { id: 3, name: 'Blight Spore', emoji: '🍄', type: 'reagent', rarity: 0, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 50, brewBonus: 0, description: 'Spores harvested from blighted vegetation', cost: 45 },
  { id: 4, name: 'Acid Vial', emoji: '⚗️', type: 'solvent', rarity: 0, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 2, description: 'A small vial of refined acid from the caverns', cost: 55 },
  { id: 5, name: 'Toad Gland', emoji: '🐸', type: 'organ', rarity: 0, toxicityBonus: 3, energyBonus: 0, corruptionBonus: 0, brewBonus: 1, description: 'Paralytic gland extract from swamp toads', cost: 40 },
  { id: 6, name: 'Spider Silk', emoji: '🕸️', type: 'catalyst', rarity: 0, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 3, description: 'Venom-laced silk that enhances potion binding', cost: 70 },
  { id: 7, name: 'Viper Venom', emoji: '🐍', type: 'essence', rarity: 1, toxicityBonus: 12, energyBonus: 5, corruptionBonus: 100, brewBonus: 2, description: 'Concentrated venom from copper vipers', cost: 200 },
  { id: 8, name: 'Fungal Catalyst', emoji: '🧫', type: 'catalyst', rarity: 1, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 5, description: 'Bioluminescent fungus that accelerates reactions', cost: 180 },
  { id: 9, name: 'Blight Essence', emoji: '☠️', type: 'essence', rarity: 1, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 150, brewBonus: 3, description: 'Pure essence extracted from blight cores', cost: 160 },
  { id: 10, name: 'Corrosive Crystal', emoji: '💎', type: 'crystal', rarity: 1, toxicityBonus: 10, energyBonus: 0, corruptionBonus: 50, brewBonus: 0, description: 'Crystallized acid from deep cavern walls', cost: 220 },
  { id: 11, name: 'Necro Solvent', emoji: '🫗', type: 'solvent', rarity: 1, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 6, description: 'A dark solvent that preserves venom potency', cost: 190 },
  { id: 12, name: 'Chitin Powder', emoji: '🪲', type: 'reagent', rarity: 1, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 5, description: 'Ground beetle shell powder for potion thickening', cost: 210 },
  { id: 13, name: 'Mamba Neurotoxin', emoji: '💉', type: 'essence', rarity: 2, toxicityBonus: 25, energyBonus: 10, corruptionBonus: 500, brewBonus: 5, description: 'Pure neurotoxin from the shadow mamba', cost: 800 },
  { id: 14, name: 'Batrachotoxin', emoji: '🐸', type: 'essence', rarity: 2, toxicityBonus: 30, energyBonus: 0, corruptionBonus: 300, brewBonus: 4, description: 'The deadliest non-protein toxin, from blight frogs', cost: 750 },
  { id: 15, name: 'Void Catalyst', emoji: '🌀', type: 'catalyst', rarity: 2, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 12, description: 'A catalyst drawn from dimensional rifts in the deep', cost: 700 },
  { id: 16, name: 'Soul Crystal', emoji: '🔮', type: 'crystal', rarity: 2, toxicityBonus: 20, energyBonus: 5, corruptionBonus: 200, brewBonus: 0, description: 'Crystals that absorb the life force of venomous prey', cost: 850 },
  { id: 17, name: 'Primordial Acid', emoji: '🧪', type: 'solvent', rarity: 2, toxicityBonus: 15, energyBonus: 0, corruptionBonus: 400, brewBonus: 8, description: 'Acid so ancient it predates the caverns themselves', cost: 780 },
  { id: 18, name: 'Hydra Heart', emoji: '❤️‍🔥', type: 'organ', rarity: 2, toxicityBonus: 0, energyBonus: 20, corruptionBonus: 0, brewBonus: 10, description: 'A still-beating heart from a venom hydra', cost: 820 },
  { id: 19, name: 'Cursed Essence', emoji: '💀', type: 'essence', rarity: 3, toxicityBonus: 40, energyBonus: 20, corruptionBonus: 1000, brewBonus: 10, description: 'Liquid curse that amplifies venom to supernatural levels', cost: 3000 },
  { id: 20, name: 'Entropy Crystal', emoji: '💠', type: 'crystal', rarity: 3, toxicityBonus: 30, energyBonus: 0, corruptionBonus: 2000, brewBonus: 0, description: 'A crystal that accelerates decay in all organic matter', cost: 2800 },
  { id: 21, name: 'Void Spider Silk', emoji: '🕸️', type: 'catalyst', rarity: 3, toxicityBonus: 0, energyBonus: 15, corruptionBonus: 0, brewBonus: 20, description: 'Silk from the abyssal widow, stronger than steel and laced with venom', cost: 3200 },
  { id: 22, name: 'Nightmare Extract', emoji: '💭', type: 'essence', rarity: 3, toxicityBonus: 50, energyBonus: 0, corruptionBonus: 500, brewBonus: 15, description: 'Extracted from the dreams of victims of nightmare viper venom', cost: 2900 },
  { id: 23, name: 'Matriarch Gland', emoji: '👑', type: 'organ', rarity: 3, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 25, description: 'The venom gland of the serpent matriarch herself', cost: 3100 },
  { id: 24, name: 'Sovereign Solvent', emoji: '⚗️', type: 'solvent', rarity: 3, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 22, description: 'The ultimate solvent, capable of dissolving and recombining any venom', cost: 3300 },
  { id: 25, name: 'Primordial Venom', emoji: '🐲', type: 'essence', rarity: 4, toxicityBonus: 80, energyBonus: 30, corruptionBonus: 5000, brewBonus: 30, description: 'The original venom from the serpent god itself', cost: 10000 },
  { id: 26, name: 'Void Essence', emoji: '🕳️', type: 'essence', rarity: 4, toxicityBonus: 70, energyBonus: 0, corruptionBonus: 9999, brewBonus: 25, description: 'Essence of the void between worlds, where corruption is absolute', cost: 9500 },
  { id: 27, name: 'Entropy Catalyst', emoji: '⚛️', type: 'catalyst', rarity: 4, toxicityBonus: 0, energyBonus: 25, corruptionBonus: 0, brewBonus: 40, description: 'A catalyst that accelerates the heat death of anything it touches', cost: 11000 },
  { id: 28, name: 'Universal Acid', emoji: '💥', type: 'solvent', rarity: 4, toxicityBonus: 60, energyBonus: 20, corruptionBonus: 3000, brewBonus: 35, description: 'An acid that dissolves all known materials and magical barriers', cost: 9800 },
  { id: 29, name: 'Phoenix Tear', emoji: '💧', type: 'essence', rarity: 4, toxicityBonus: 0, energyBonus: 50, corruptionBonus: 0, brewBonus: 20, description: 'A single tear from the venom phoenix, the ultimate antidote base', cost: 10500 },
  { id: 30, name: 'Sovereign Crystal', emoji: '👑', type: 'crystal', rarity: 4, toxicityBonus: 0, energyBonus: 0, corruptionBonus: 0, brewBonus: 50, description: 'The crystallized power of the abyssal throne itself', cost: 12000 },
];

// ── 25 Nest Structures (upgradeable to Level 10) ──

interface NestStructureDef {
  id: number;
  name: string;
  emoji: string;
  category: 'habitat' | 'defense' | 'brewing' | 'research' | 'trap';
  baseEffect: number;
  effectPerLevel: number;
  description: string;
  baseCost: number;
  costMultiplier: number;
}

const NEST_STRUCTURES: NestStructureDef[] = [
  { id: 1, name: 'Mud Burrow', emoji: '🕳️', category: 'habitat', baseEffect: 2, effectPerLevel: 1, description: 'A simple burrow for housing small venomous creatures', baseCost: 30, costMultiplier: 1.5 },
  { id: 2, name: 'Venom Spire', emoji: '🏰', category: 'defense', baseEffect: 5, effectPerLevel: 3, description: 'A tower that sprays venom mist at intruders', baseCost: 80, costMultiplier: 1.6 },
  { id: 3, name: 'Slime Refinery', emoji: '🏭', category: 'brewing', baseEffect: 3, effectPerLevel: 2, description: 'Extracts usable venom compounds from raw slime', baseCost: 60, costMultiplier: 1.5 },
  { id: 4, name: 'Toxicology Lab', emoji: '🔬', category: 'research', baseEffect: 5, effectPerLevel: 3, description: 'Studies venom properties and creature behavior', baseCost: 100, costMultiplier: 1.7 },
  { id: 5, name: 'Poison Garden', emoji: '🌺', category: 'trap', baseEffect: 2, effectPerLevel: 1, description: 'A garden of venomous plants that deter invaders', baseCost: 40, costMultiplier: 1.4 },
  { id: 6, name: 'Serpent Pit', emoji: '🪕', category: 'habitat', baseEffect: 8, effectPerLevel: 4, description: 'A deep pit lined with venom-soaked straw for serpent housing', baseCost: 200, costMultiplier: 1.8 },
  { id: 7, name: 'Acid Moat', emoji: '🐊', category: 'defense', baseEffect: 10, effectPerLevel: 5, description: 'A moat of bubbling acid surrounding the nest', baseCost: 250, costMultiplier: 1.7 },
  { id: 8, name: 'Brew Cauldron', emoji: '🫕', category: 'brewing', baseEffect: 7, effectPerLevel: 3, description: 'A large cauldron for brewing potent venom mixtures', baseCost: 150, costMultiplier: 1.6 },
  { id: 9, name: 'Venom Archive', emoji: '📚', category: 'research', baseEffect: 8, effectPerLevel: 4, description: 'Stores knowledge of all discovered venom types', baseCost: 180, costMultiplier: 1.7 },
  { id: 10, name: 'Spore Field', emoji: '🍄', category: 'trap', baseEffect: 5, effectPerLevel: 3, description: 'A field of toxic mushrooms that release paralytic spores', baseCost: 120, costMultiplier: 1.5 },
  { id: 11, name: 'Hydra Nest', emoji: '🐉', category: 'habitat', baseEffect: 15, effectPerLevel: 8, description: 'A massive nest designed for housing multi-headed creatures', baseCost: 500, costMultiplier: 2.0 },
  { id: 12, name: 'Venom Wall', emoji: '🧱', category: 'defense', baseEffect: 20, effectPerLevel: 10, description: 'A wall constructed from venom-hardened resin', baseCost: 600, costMultiplier: 2.0 },
  { id: 13, name: 'Crystal Mine', emoji: '💎', category: 'brewing', baseEffect: 12, effectPerLevel: 6, description: 'Mines venom-infused crystals for alchemy', baseCost: 450, costMultiplier: 1.8 },
  { id: 14, name: 'Corruption Lab', emoji: '🧪', category: 'research', baseEffect: 15, effectPerLevel: 7, description: 'Experiments with corruption to create new venom strains', baseCost: 550, costMultiplier: 1.9 },
  { id: 15, name: 'Blight Grove', emoji: '🌳', category: 'trap', baseEffect: 10, effectPerLevel: 5, description: 'A grove of blight-infected trees that poison the ground', baseCost: 300, costMultiplier: 1.7 },
  { id: 16, name: 'Egg Incubator', emoji: '🥚', category: 'habitat', baseEffect: 25, effectPerLevel: 12, description: 'An incubator that hatches rare venomous eggs', baseCost: 1200, costMultiplier: 2.2 },
  { id: 17, name: 'Venom Shield', emoji: '🛡️', category: 'defense', baseEffect: 30, effectPerLevel: 15, description: 'A shield generator that projects a dome of toxic gas', baseCost: 1000, costMultiplier: 2.1 },
  { id: 18, name: 'Alchemical Forge', emoji: '🔨', category: 'brewing', baseEffect: 20, effectPerLevel: 10, description: 'Forges venom-infused weapons and tools', baseCost: 900, costMultiplier: 2.0 },
  { id: 19, name: 'Portal Chamber', emoji: '🌀', category: 'research', baseEffect: 25, effectPerLevel: 12, description: 'A chamber capable of opening portals to other abyss zones', baseCost: 1500, costMultiplier: 2.3 },
  { id: 20, name: 'Cursed Altar', emoji: '⚰️', category: 'trap', baseEffect: 15, effectPerLevel: 8, description: 'An altar that curses any creature that approaches', baseCost: 800, costMultiplier: 1.9 },
  { id: 21, name: 'Abyssal Throne Room', emoji: '👑', category: 'habitat', baseEffect: 40, effectPerLevel: 20, description: 'The central chamber of the nest, radiating primal venom energy', baseCost: 3000, costMultiplier: 2.5 },
  { id: 22, name: 'Blight Citadel', emoji: '🏰', category: 'defense', baseEffect: 50, effectPerLevel: 25, description: 'An impenetrable fortress of hardened blight and venom resin', baseCost: 5000, costMultiplier: 2.5 },
  { id: 23, name: 'Grand Brewery', emoji: '🍺', category: 'brewing', baseEffect: 35, effectPerLevel: 18, description: 'The ultimate brewing facility, capable of legendary elixirs', baseCost: 4000, costMultiplier: 2.4 },
  { id: 24, name: 'Forbidden Library', emoji: '📖', category: 'research', baseEffect: 45, effectPerLevel: 22, description: 'Contains the lost knowledge of ancient venom alchemists', baseCost: 6000, costMultiplier: 2.6 },
  { id: 25, name: 'Abyssal Gate', emoji: '🚪', category: 'trap', baseEffect: 30, effectPerLevel: 15, description: 'A gate that transports intruders to random abyss zones', baseCost: 3500, costMultiplier: 2.3 },
];

// ── 22 Venom Abilities ──

interface VenomAbilityDef {
  id: number;
  name: string;
  emoji: string;
  type: 'active' | 'passive';
  rarity: number;
  energyCost: number;
  cooldown: number;
  effect: string;
  description: string;
}

const VENOM_ABILITIES: VenomAbilityDef[] = [
  { id: 1, name: 'Toxic Spit', emoji: '🤮', type: 'active', rarity: 0, energyCost: 5, cooldown: 30, effect: 'damage', description: 'Spit a glob of venom at a target for minor damage' },
  { id: 2, name: 'Slime Trail', emoji: '🟢', type: 'active', rarity: 0, energyCost: 8, cooldown: 45, effect: 'slow', description: 'Leave a trail of slime that slows pursuers' },
  { id: 3, name: 'Fang Strike', emoji: '🐍', type: 'active', rarity: 0, energyCost: 10, cooldown: 60, effect: 'poison', description: 'Strike with venomous fangs, poisoning the target' },
  { id: 4, name: 'Venom Shield', emoji: '🛡️', type: 'active', rarity: 1, energyCost: 12, cooldown: 60, effect: 'protect', description: 'Coat yourself in hardened venom that absorbs damage' },
  { id: 5, name: 'Acid Splash', emoji: '💦', type: 'active', rarity: 1, energyCost: 15, cooldown: 90, effect: 'area_damage', description: 'Splash corrosive acid in all directions' },
  { id: 6, name: 'Antidote Brew', emoji: '⚗️', type: 'active', rarity: 1, energyCost: 20, cooldown: 120, effect: 'heal', description: 'Quickly brew a minor antidote to restore energy' },
  { id: 7, name: 'Toxic Immunity', emoji: '💉', type: 'passive', rarity: 0, energyCost: 0, cooldown: 0, effect: 'resist', description: 'Passively reduce damage from environmental toxins' },
  { id: 8, name: 'Venom Sense', emoji: '👁️', type: 'passive', rarity: 1, energyCost: 0, cooldown: 0, effect: 'awareness', description: 'Sense venomous creatures and traps in a wider radius' },
  { id: 9, name: 'Pheromone Lure', emoji: '🧲', type: 'passive', rarity: 1, energyCost: 0, cooldown: 0, effect: 'attract', description: 'Release pheromones that attract venomous creatures' },
  { id: 10, name: 'Corruption Resistance', emoji: '💚', type: 'passive', rarity: 2, energyCost: 0, cooldown: 0, effect: 'corruption_resist', description: 'Resist corruption accumulation naturally' },
  { id: 11, name: 'Snake Charm', emoji: '🎵', type: 'active', rarity: 2, energyCost: 25, cooldown: 180, effect: 'tame', description: 'Charm a venomous creature to temporarily ally with you' },
  { id: 12, name: 'Plague Cloud', emoji: '☁️', type: 'active', rarity: 2, energyCost: 30, cooldown: 300, effect: 'area_poison', description: 'Release a cloud of toxic plague that damages everything' },
  { id: 13, name: 'Fungal Bloom', emoji: '🍄', type: 'active', rarity: 2, energyCost: 15, cooldown: 90, effect: 'grow', description: 'Cause explosive fungal growth that heals and provides cover' },
  { id: 14, name: 'Energy Siphon', emoji: '🔋', type: 'passive', rarity: 2, energyCost: 0, cooldown: 0, effect: 'energy_save', description: 'Siphon trace energy from nearby venomous creatures' },
  { id: 15, name: 'Hydra Summon', emoji: '🐉', type: 'active', rarity: 3, energyCost: 40, cooldown: 600, effect: 'summon', description: 'Summon a venom hydra to fight alongside you' },
  { id: 16, name: 'Venom Web', emoji: '🕸️', type: 'active', rarity: 3, energyCost: 35, cooldown: 300, effect: 'restrain', description: 'Shoot venomous webbing that immobilizes targets' },
  { id: 17, name: 'Shadow Meld', emoji: '👻', type: 'active', rarity: 3, energyCost: 50, cooldown: 600, effect: 'stealth', description: 'Meld into the shadows, becoming nearly invisible' },
  { id: 18, name: 'Venom Aura', emoji: '☠️', type: 'passive', rarity: 3, energyCost: 0, cooldown: 0, effect: 'intimidate', description: 'A constant aura of venom that damages nearby enemies' },
  { id: 19, name: 'Primordial Command', emoji: '👑', type: 'active', rarity: 4, energyCost: 60, cooldown: 1200, effect: 'dominate', description: 'Command any venomous creature to obey your will' },
  { id: 20, name: 'Abyssal Eruption', emoji: '🌋', type: 'active', rarity: 4, energyCost: 55, cooldown: 900, effect: 'devastate', description: 'Trigger a volcanic eruption of pure venom from the abyss' },
  { id: 21, name: 'Venom Resurrection', emoji: '💫', type: 'active', rarity: 4, energyCost: 80, cooldown: 1800, effect: 'revive', description: 'Return from death using the primordial venom within' },
  { id: 22, name: 'Corruption Mastery', emoji: '💀', type: 'passive', rarity: 4, energyCost: 0, cooldown: 0, effect: 'all_boost', description: 'Your corruption strengthens all venom abilities' },
];

// ── 18 Achievements ──

interface AchievementDef {
  id: number;
  name: string;
  emoji: string;
  description: string;
  conditionType: 'tame' | 'corruption' | 'zone' | 'nest' | 'creature_rarity' | 'brew' | 'craft' | 'title' | 'infamy';
  conditionValue: number;
  reward: { type: 'energy' | 'toxicity' | 'infamy' | 'title'; amount: number };
}

const ACHIEVEMENTS: AchievementDef[] = [
  { id: 1, name: 'First Fang', emoji: '🐍', description: 'Tame your first venomous creature', conditionType: 'tame', conditionValue: 1, reward: { type: 'energy', amount: 10 } },
  { id: 2, name: 'Swamp Collector', emoji: '🐸', description: 'Tame 5 different venomous creatures', conditionType: 'tame', conditionValue: 5, reward: { type: 'energy', amount: 20 } },
  { id: 3, name: 'Corruption Pioneer', emoji: '🕳️', description: 'Reach a corruption depth of 500', conditionType: 'corruption', conditionValue: 500, reward: { type: 'toxicity', amount: 15 } },
  { id: 4, name: 'Zone Explorer', emoji: '🗺️', description: 'Explore 3 different abyss zones', conditionType: 'zone', conditionValue: 3, reward: { type: 'infamy', amount: 50 } },
  { id: 5, name: 'Nest Builder', emoji: '🏗️', description: 'Build your first nest structure', conditionType: 'nest', conditionValue: 1, reward: { type: 'infamy', amount: 30 } },
  { id: 6, name: 'Rare Venom', emoji: '💎', description: 'Tame a rare tier creature', conditionType: 'creature_rarity', conditionValue: 2, reward: { type: 'energy', amount: 30 } },
  { id: 7, name: 'Master Brewer', emoji: '⚗️', description: 'Brew 10 venom potions', conditionType: 'brew', conditionValue: 10, reward: { type: 'infamy', amount: 100 } },
  { id: 8, name: 'Deep Corrupt', emoji: '💀', description: 'Reach a corruption depth of 4000', conditionType: 'corruption', conditionValue: 4000, reward: { type: 'toxicity', amount: 30 } },
  { id: 9, name: 'Epic Tame', emoji: '🌟', description: 'Tame an epic tier creature', conditionType: 'creature_rarity', conditionValue: 3, reward: { type: 'energy', amount: 50 } },
  { id: 10, name: 'Abyss Cartographer', emoji: '🌍', description: 'Explore all 8 abyss zones', conditionType: 'zone', conditionValue: 8, reward: { type: 'title', amount: 3 } },
  { id: 11, name: 'Nest Architect', emoji: '🏛️', description: 'Upgrade a nest structure to level 5', conditionType: 'nest', conditionValue: 5, reward: { type: 'infamy', amount: 200 } },
  { id: 12, name: 'Venom Half-Bestiary', emoji: '📖', description: 'Tame 18 different venomous creatures', conditionType: 'tame', conditionValue: 18, reward: { type: 'energy', amount: 50 } },
  { id: 13, name: 'Corruption Champion', emoji: '🏅', description: 'Reach a corruption depth of 9000', conditionType: 'corruption', conditionValue: 9000, reward: { type: 'toxicity', amount: 50 } },
  { id: 14, name: 'Legendary Tamer!', emoji: '👑', description: 'Tame a legendary tier creature', conditionType: 'creature_rarity', conditionValue: 4, reward: { type: 'title', amount: 4 } },
  { id: 15, name: 'Nest Metropolis', emoji: '🏙️', description: 'Build 10 nest structures', conditionType: 'nest', conditionValue: 10, reward: { type: 'infamy', amount: 500 } },
  { id: 16, name: 'Full Bestiary', emoji: '📚', description: 'Tame all 35 venomous creatures', conditionType: 'tame', conditionValue: 35, reward: { type: 'title', amount: 6 } },
  { id: 17, name: 'Abyss Guardian', emoji: '🛡️', description: 'Reach Abyss Overlord title', conditionType: 'title', conditionValue: 7, reward: { type: 'energy', amount: 100 } },
  { id: 18, name: 'Infamy Legend', emoji: '🏆', description: 'Accumulate 5000 infamy', conditionType: 'infamy', conditionValue: 5000, reward: { type: 'title', amount: 7 } },
];

// ── 8 Titles ──

const TITLE_THRESHOLDS = [
  { index: 0, name: VA_TITLES[0], minInfamy: 0, minCorruption: 0, minCreatures: 0 },
  { index: 1, name: VA_TITLES[1], minInfamy: 50, minCorruption: 200, minCreatures: 3 },
  { index: 2, name: VA_TITLES[2], minInfamy: 200, minCorruption: 500, minCreatures: 7 },
  { index: 3, name: VA_TITLES[3], minInfamy: 500, minCorruption: 1500, minCreatures: 12 },
  { index: 4, name: VA_TITLES[4], minInfamy: 1200, minCorruption: 4000, minCreatures: 18 },
  { index: 5, name: VA_TITLES[5], minInfamy: 2500, minCorruption: 6000, minCreatures: 24 },
  { index: 6, name: VA_TITLES[6], minInfamy: 5000, minCorruption: 9000, minCreatures: 30 },
  { index: 7, name: VA_TITLES[7], minInfamy: 8000, minCorruption: 9999, minCreatures: 35 },
];

// ───────────────────────────────────────────────────────────────────
// INTERNAL TYPES
// ───────────────────────────────────────────────────────────────────

interface TamedCreature {
  creatureId: number;
  count: number;
  firstTamedAt: number;
  lastTamedAt: number;
  released: number;
}

interface OwnedIngredient {
  ingredientId: number;
  equipped: boolean;
  durability: number;
  acquiredAt: number;
}

interface BuiltNest {
  nestId: number;
  level: number;
  builtAt: number;
  lastUpgradeAt: number;
}

interface UnlockedAbility {
  abilityId: number;
  unlockedAt: number;
  lastUsedAt: number;
  currentCooldown: number;
}

interface EarnedAchievement {
  achievementId: number;
  earnedAt: number;
  claimed: boolean;
}

interface DailyQuest {
  id: number;
  description: string;
  target: number;
  progress: number;
  rewardType: 'energy' | 'toxicity' | 'infamy';
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: number;
}

interface VenomAbyssState {
  creatures: TamedCreature[];
  zones: boolean[];
  ingredients: OwnedIngredient[];
  nests: BuiltNest[];
  abilities: UnlockedAbility[];
  achievements: EarnedAchievement[];
  currentZone: number;
  venomEnergy: number;
  toxicityLevel: number;
  corruptionReached: number;
  currentCorruption: number;
  creaturesCollected: number;
  totalTamed: number;
  totalReleased: number;
  totalBrewed: number;
  totalAntidotes: number;
  titleIndex: number;
  infamy: number;
  dailyQuest: DailyQuest | null;
  lastDailyReset: number;
  totalExpeditions: number;
  totalPlayTime: number;
  sessionStart: number;
}

// ───────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS (pure, no hooks, no "use" prefix)
// ───────────────────────────────────────────────────────────────────

function createInitialState(): VenomAbyssState {
  return {
    creatures: [],
    zones: [true, false, false, false, false, false, false, false],
    ingredients: [],
    nests: [],
    abilities: [],
    achievements: [],
    currentZone: 0,
    venomEnergy: VA_MAX_ENERGY,
    toxicityLevel: VA_MAX_TOXICITY,
    corruptionReached: 0,
    currentCorruption: 0,
    creaturesCollected: 0,
    totalTamed: 0,
    totalReleased: 0,
    totalBrewed: 0,
    totalAntidotes: 0,
    titleIndex: 0,
    infamy: 0,
    dailyQuest: null,
    lastDailyReset: 0,
    totalExpeditions: 0,
    totalPlayTime: 0,
    sessionStart: Date.now(),
  };
}

function getCreatureDef(id: number): VenomCreatureDef | undefined {
  return VENOM_CREATURES.find(c => c.id === id);
}

function getZoneDef(id: number): AbyssZoneDef | undefined {
  return ABYSS_ZONES.find(z => z.id === id);
}

function getIngredientDef(id: number): AlchemyIngredientDef | undefined {
  return ALCHEMY_INGREDIENTS.find(i => i.id === id);
}

function getNestDef(id: number): NestStructureDef | undefined {
  return NEST_STRUCTURES.find(n => n.id === id);
}

function getAbilityDef(id: number): VenomAbilityDef | undefined {
  return VENOM_ABILITIES.find(a => a.id === id);
}

function getAchievementDef(id: number): AchievementDef | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

function calculateCorruptionPressure(corruption: number): number {
  return Math.floor(corruption * 0.01);
}

function calculateZoneCorruptionRequirement(zoneId: number): number {
  const zone = getZoneDef(zoneId);
  return zone ? zone.corruptionRange[0] : 0;
}

function calculateNestCost(nestId: number, currentLevel: number): number {
  const def = getNestDef(nestId);
  if (!def) return Infinity;
  return Math.floor(def.baseCost * Math.pow(def.costMultiplier, currentLevel));
}

function calculateEnergyRegenRate(titleIndex: number): number {
  return 1 + titleIndex * 0.5;
}

function calculateToxicityDrainRate(corruption: number, titleIndex: number): number {
  const baseRate = 1 + Math.floor(corruption / 500) * 0.5;
  return Math.max(0.1, baseRate - titleIndex * 0.3);
}

function pickRandomCreatureForZone(zoneId: number): VenomCreatureDef | undefined {
  const zone = getZoneDef(zoneId);
  if (!zone || zone.creaturesAvailable.length === 0) return undefined;
  const pool = zone.creaturesAvailable
    .map(cid => getCreatureDef(cid))
    .filter((c): c is VenomCreatureDef => c !== undefined);
  if (pool.length === 0) return undefined;
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateDailyQuest(): DailyQuest {
  const tasks = [
    { description: 'Tame {target} creatures', targetRange: [3, 8], rewardType: 'energy' as const, rewardRange: [10, 30] },
    { description: 'Descend to corruption {target}', targetRange: [300, 2000], rewardType: 'toxicity' as const, rewardRange: [10, 25] },
    { description: 'Explore {target} different zones', targetRange: [1, 3], rewardType: 'infamy' as const, rewardRange: [20, 60] },
    { description: 'Upgrade {target} nest structures', targetRange: [1, 3], rewardType: 'energy' as const, rewardRange: [15, 35] },
    { description: 'Brew {target} venom potions', targetRange: [2, 5], rewardType: 'infamy' as const, rewardRange: [30, 80] },
  ];
  const template = tasks[Math.floor(Math.random() * tasks.length)];
  const target = template.targetRange[0] + Math.floor(Math.random() * (template.targetRange[1] - template.targetRange[0] + 1));
  const rewardAmount = template.rewardRange[0] + Math.floor(Math.random() * (template.rewardRange[1] - template.rewardRange[0] + 1));
  const desc = template.description.replace('{target}', String(target));
  const now = Date.now();
  return {
    id: now,
    description: desc,
    target,
    progress: 0,
    rewardType: template.rewardType,
    rewardAmount,
    completed: false,
    claimed: false,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };
}

function computeTitleIndex(
  infamy: number,
  maxCorruption: number,
  uniqueCreatures: number,
  currentTitle: number,
): number {
  let bestIndex = 0;
  for (let i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
    const t = TITLE_THRESHOLDS[i];
    if (infamy >= t.minInfamy && maxCorruption >= t.minCorruption && uniqueCreatures >= t.minCreatures) {
      bestIndex = i;
      break;
    }
  }
  return Math.max(currentTitle, bestIndex);
}

// ───────────────────────────────────────────────────────────────────
// MAIN HOOK
// ───────────────────────────────────────────────────────────────────

export default function useVenomAbyss() {
  const [state, setState] = useState<VenomAbyssState>(createInitialState);
  const stateRef = useRef(state);

  // Keep ref in sync with state (read stateRef in callbacks/effects, never in useMemo)
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Energy regeneration timer
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const regenRate = calculateEnergyRegenRate(prev.titleIndex);
        const newEnergy = Math.min(VA_MAX_ENERGY, prev.venomEnergy + regenRate * 0.1);
        const newToxicity = Math.max(0, prev.toxicityLevel - calculateToxicityDrainRate(prev.currentCorruption, prev.titleIndex) * 0.05);
        const newPressure = calculateCorruptionPressure(prev.currentCorruption);
        const newPlayTime = prev.totalPlayTime + 0.1;
        return {
          ...prev,
          venomEnergy: newEnergy,
          toxicityLevel: newToxicity,
          currentCorruption: prev.currentCorruption,
          corruptionReached: prev.corruptionReached,
          totalPlayTime: newPlayTime,
        };
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Daily quest reset
  useEffect(() => {
    const now = Date.now();
    setState(prev => {
      const lastReset = prev.lastDailyReset;
      const hoursSinceReset = (now - lastReset) / (1000 * 60 * 60);
      if (hoursSinceReset >= 24 || prev.dailyQuest === null) {
        return {
          ...prev,
          dailyQuest: generateDailyQuest(),
          lastDailyReset: now,
        };
      }
      return prev;
    });
  }, []);

  // ── MEMOIZED COMPUTED VALUES (never read stateRef here) ──

  const creatureCatalog = useMemo(() => VENOM_CREATURES, []);

  const zoneCatalog = useMemo(() => ABYSS_ZONES, []);

  const ingredientCatalog = useMemo(() => ALCHEMY_INGREDIENTS, []);

  const nestCatalog = useMemo(() => NEST_STRUCTURES, []);

  const abilityCatalog = useMemo(() => VENOM_ABILITIES, []);

  const achievementCatalog = useMemo(() => ACHIEVEMENTS, []);

  const titleCatalog = useMemo(() => TITLE_THRESHOLDS, []);

  const equippedIngredients = useMemo(() => {
    return state.ingredients.filter(i => i.equipped);
  }, [state.ingredients]);

  const totalIngredientBonuses = useMemo(() => {
    const bonuses = { toxicity: 0, energy: 0, corruption: 0, brew: 0 };
    for (const item of equippedIngredients) {
      const def = getIngredientDef(item.ingredientId);
      if (def) {
        bonuses.toxicity += def.toxicityBonus;
        bonuses.energy += def.energyBonus;
        bonuses.corruption += def.corruptionBonus;
        bonuses.brew += def.brewBonus;
      }
    }
    return bonuses;
  }, [equippedIngredients]);

  const creatureCollectionSummary = useMemo(() => {
    const byRarity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    let maxRarity = 0;
    for (const entry of state.creatures) {
      const def = getCreatureDef(entry.creatureId);
      if (def) {
        byRarity[def.rarity] = (byRarity[def.rarity] || 0) + entry.count;
        if (def.rarity > maxRarity) maxRarity = def.rarity;
      }
    }
    return { byRarity, maxRarity, totalEntries: state.creatures.length };
  }, [state.creatures]);

  const exploredZoneCount = useMemo(() => {
    return state.zones.filter(Boolean).length;
  }, [state.zones]);

  const activeAbilityIds = useMemo(() => {
    return state.abilities.map(a => a.abilityId);
  }, [state.abilities]);

  const maxNestLevel = useMemo(() => {
    if (state.nests.length === 0) return 0;
    return Math.max(...state.nests.map(n => n.level));
  }, [state.nests]);

  const nestCount = useMemo(() => {
    return state.nests.length;
  }, [state.nests]);

  const highestRareTamed = useMemo(() => {
    return creatureCollectionSummary.maxRarity;
  }, [creatureCollectionSummary]);

  const isTitleMax = useMemo(() => {
    return state.titleIndex >= VA_TITLES.length - 1;
  }, [state.titleIndex]);

  const effectiveMaxCorruption = useMemo(() => {
    return VA_MAX_CORRUPTION + totalIngredientBonuses.corruption;
  }, [totalIngredientBonuses]);

  const effectiveMaxToxicity = useMemo(() => {
    return VA_MAX_TOXICITY + totalIngredientBonuses.toxicity;
  }, [totalIngredientBonuses]);

  const effectiveMaxEnergy = useMemo(() => {
    return VA_MAX_ENERGY + totalIngredientBonuses.energy;
  }, [totalIngredientBonuses]);

  const currentZoneDef = useMemo(() => {
    return ABYSS_ZONES[state.currentZone] ?? ABYSS_ZONES[0];
  }, [state.currentZone]);

  const nextTitleDef = useMemo(() => {
    const nextIdx = state.titleIndex + 1;
    if (nextIdx >= TITLE_THRESHOLDS.length) return null;
    return TITLE_THRESHOLDS[nextIdx];
  }, [state.titleIndex]);

  const zonesUnlocked = useMemo(() => {
    return state.zones;
  }, [state.zones]);

  const achievementsProgress = useMemo(() => {
    const progress: Array<{ def: AchievementDef; earned: boolean; progress: number; target: number }> = [];
    for (const aDef of ACHIEVEMENTS) {
      const earned = state.achievements.some(ea => ea.achievementId === aDef.id);
      let currentProgress = 0;
      let target = aDef.conditionValue;
      switch (aDef.conditionType) {
        case 'tame':
          currentProgress = state.creaturesCollected;
          break;
        case 'corruption':
          currentProgress = state.corruptionReached;
          break;
        case 'zone':
          currentProgress = exploredZoneCount;
          break;
        case 'nest':
          currentProgress = Math.max(nestCount, maxNestLevel >= 5 ? 5 : maxNestLevel);
          break;
        case 'creature_rarity':
          currentProgress = highestRareTamed;
          break;
        case 'brew':
          currentProgress = state.totalBrewed;
          break;
        case 'craft':
          currentProgress = state.totalAntidotes;
          break;
        case 'explore':
          currentProgress = state.totalExpeditions;
          break;
        case 'title':
          currentProgress = state.titleIndex;
          break;
        case 'infamy':
          currentProgress = state.infamy;
          break;
      }
      progress.push({ def: aDef, earned, progress: currentProgress, target });
    }
    return progress;
  }, [state, exploredZoneCount, nestCount, maxNestLevel, highestRareTamed]);

  // ── CALLBACKS ──

  const tameCreature = useCallback((creatureId: number | null): boolean => {
    const targetCreature = creatureId !== null
      ? getCreatureDef(creatureId)
      : pickRandomCreatureForZone(stateRef.current.currentZone);

    if (!targetCreature) return false;

    const energyCost = 5 + targetCreature.rarity * 3;
    if (stateRef.current.venomEnergy < energyCost) return false;

    setState(prev => {
      const existing = prev.creatures.find(c => c.creatureId === targetCreature.id);
      const now = Date.now();
      let updatedCreatures: TamedCreature[];
      let newUniqueCount = prev.creaturesCollected;

      if (existing) {
        updatedCreatures = prev.creatures.map(c =>
          c.creatureId === targetCreature.id
            ? { ...c, count: c.count + 1, lastTamedAt: now }
            : c,
        );
      } else {
        updatedCreatures = [
          ...prev.creatures,
          { creatureId: targetCreature.id, count: 1, firstTamedAt: now, lastTamedAt: now, released: 0 },
        ];
        newUniqueCount += 1;
      }

      const newInfamy = prev.infamy + VA_RARITY_MULTIPLIERS[targetCreature.rarity] * 2;
      const newEnergy = Math.max(0, prev.venomEnergy - energyCost);

      const newDailyQuest = prev.dailyQuest && !prev.dailyQuest.completed
        ? {
            ...prev.dailyQuest,
            progress: prev.dailyQuest.description.includes('Tame')
              ? prev.dailyQuest.progress + 1
              : prev.dailyQuest.progress,
            completed: prev.dailyQuest.description.includes('Tame')
              && prev.dailyQuest.progress + 1 >= prev.dailyQuest.target,
          }
        : prev.dailyQuest;

      const newTitleIndex = computeTitleIndex(newInfamy, prev.corruptionReached, newUniqueCount, prev.titleIndex);

      return {
        ...prev,
        creatures: updatedCreatures,
        creaturesCollected: newUniqueCount,
        totalTamed: prev.totalTamed + 1,
        infamy: newInfamy,
        venomEnergy: newEnergy,
        titleIndex: newTitleIndex,
        dailyQuest: newDailyTask,
      };
    });
    return true;
  }, []);

  const exploreZone = useCallback((zoneId: number): boolean => {
    if (zoneId < 0 || zoneId >= ABYSS_ZONES.length) return false;
    const zone = ABYSS_ZONES[zoneId];
    const titleReq = TITLE_THRESHOLDS[zone.requiredTitle];
    if (stateRef.current.titleIndex < zone.requiredTitle && !(titleReq.minInfamy <= stateRef.current.infamy)) {
      return false;
    }
    const corruptionReq = calculateZoneCorruptionRequirement(zoneId);
    if (stateRef.current.corruptionReached < corruptionReq && zone.requiredTitle > 0) return false;

    const energyCost = zone.baseToxicityCost;
    if (stateRef.current.venomEnergy < energyCost) return false;

    setState(prev => {
      const updatedZones = [...prev.zones];
      updatedZones[zoneId] = true;
      const toxicityCost = Math.floor(zone.baseToxicityCost * (1 - prev.titleIndex * 0.05));
      return {
        ...prev,
        zones: updatedZones,
        currentZone: zoneId,
        currentCorruption: zone.corruptionRange[0],
        venomEnergy: Math.max(0, prev.venomEnergy - energyCost),
        toxicityLevel: Math.max(0, prev.toxicityLevel - toxicityCost),
        totalExpeditions: prev.totalExpeditions + 1,
        dailyQuest: prev.dailyQuest && !prev.dailyQuest.completed
          && prev.dailyQuest.description.includes('Explore')
          ? {
              ...prev.dailyQuest,
              progress: prev.dailyQuest.progress + 1,
              completed: prev.dailyQuest.progress + 1 >= prev.dailyQuest.target,
            }
          : prev.dailyQuest,
      };
    });
    return true;
  }, []);

  const upgradeNest = useCallback((nestId: number): boolean => {
    const def = getNestDef(nestId);
    if (!def) return false;

    const current = stateRef.current.nests.find(n => n.nestId === nestId);
    const currentLevel = current ? current.level : 0;
    if (currentLevel >= VA_NEST_MAX_LEVEL) return false;

    const cost = calculateNestCost(nestId, currentLevel);
    if (stateRef.current.infamy < cost) return false;
    if (stateRef.current.venomEnergy < 10) return false;

    setState(prev => {
      const now = Date.now();
      let updatedNests: BuiltNest[];
      if (current) {
        updatedNests = prev.nests.map(n =>
          n.nestId === nestId
            ? { ...n, level: n.level + 1, lastUpgradeAt: now }
            : n,
        );
      } else {
        updatedNests = [
          ...prev.nests,
          { nestId, level: 1, builtAt: now, lastUpgradeAt: now },
        ];
      }

      const newDailyTask = prev.dailyQuest && !prev.dailyQuest.completed
        && prev.dailyQuest.description.includes('Upgrade')
        ? {
            ...prev.dailyQuest,
            progress: prev.dailyQuest.progress + 1,
            completed: prev.dailyQuest.progress + 1 >= prev.dailyQuest.target,
          }
        : prev.dailyQuest;

      const newTitleIndex = computeTitleIndex(
        prev.infamy - cost,
        prev.corruptionReached,
        prev.creaturesCollected,
        prev.titleIndex,
      );

      return {
        ...prev,
        nests: updatedNests,
        infamy: prev.infamy - cost,
        venomEnergy: Math.max(0, prev.venomEnergy - 10),
        titleIndex: newTitleIndex,
        dailyQuest: newDailyTask,
      };
    });
    return true;
  }, []);

  const activateAbility = useCallback((abilityId: number): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;

    const owned = stateRef.current.abilities.find(a => a.abilityId === abilityId);
    if (!owned) return false;
    if (owned.currentCooldown > 0) return false;
    if (def.type === 'active' && stateRef.current.venomEnergy < def.energyCost) return false;

    setState(prev => {
      const now = Date.now();
      const updatedAbilities = prev.abilities.map(a =>
        a.abilityId === abilityId
          ? { ...a, lastUsedAt: now, currentCooldown: def.cooldown }
          : a,
      );
      const energyDeduction = def.type === 'active' ? def.energyCost : 0;
      return {
        ...prev,
        abilities: updatedAbilities,
        venomEnergy: Math.max(0, prev.venomEnergy - energyDeduction),
      };
    });
    return true;
  }, []);

  const descendDeeper = useCallback((units: number = 100): boolean => {
    if (units <= 0) return false;
    if (stateRef.current.venomEnergy < 2) return false;
    if (stateRef.current.toxicityLevel <= 5) return false;

    setState(prev => {
      const newCorruption = Math.min(
        VA_MAX_CORRUPTION + totalIngredientBonuses.corruption,
        prev.currentCorruption + units,
      );
      const newPressure = calculateCorruptionPressure(newCorruption);
      const toxicityDrain = Math.floor(units * 0.05 * (1 + newPressure * 0.001));
      const newCorruptionReached = Math.max(prev.corruptionReached, newCorruption);

      const newDailyTask = prev.dailyQuest && !prev.dailyQuest.completed
        && prev.dailyQuest.description.includes('corruption')
        ? {
            ...prev.dailyQuest,
            progress: Math.max(prev.dailyQuest.progress, newCorruption),
            completed: newCorruption >= prev.dailyQuest.target,
          }
        : prev.dailyQuest;

      const newTitleIndex = computeTitleIndex(prev.infamy, newCorruptionReached, prev.creaturesCollected, prev.titleIndex);

      return {
        ...prev,
        currentCorruption: newCorruption,
        corruptionReached: newCorruptionReached,
        toxicityLevel: Math.max(0, prev.toxicityLevel - toxicityDrain),
        venomEnergy: Math.max(0, prev.venomEnergy - 2),
        titleIndex: newTitleIndex,
        dailyQuest: newDailyTask,
      };
    });
    return true;
  }, [totalIngredientBonuses]);

  const ascendShallow = useCallback((units: number = 100): boolean => {
    if (units <= 0) return false;

    setState(prev => {
      const newCorruption = Math.max(0, prev.currentCorruption - units);
      const toxicityRecover = Math.floor(units * 0.03);
      return {
        ...prev,
        currentCorruption: newCorruption,
        toxicityLevel: Math.min(effectiveMaxToxicity, prev.toxicityLevel + toxicityRecover),
      };
    });
    return true;
  }, [effectiveMaxToxicity]);

  const buildNest = useCallback((nestId: number): boolean => {
    const def = getNestDef(nestId);
    if (!def) return false;
    const existing = stateRef.current.nests.find(n => n.nestId === nestId);
    if (existing) return false;

    const cost = def.baseCost;
    if (stateRef.current.infamy < cost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        nests: [
          ...prev.nests,
          { nestId, level: 1, builtAt: now, lastUpgradeAt: now },
        ],
        infamy: prev.infamy - cost,
      };
    });
    return true;
  }, []);

  const brewVenom = useCallback((brewType: 'energy' | 'toxicity' | 'corruption'): boolean => {
    const costs: Record<string, number> = { energy: 30, toxicity: 30, corruption: 50 };
    const cost = costs[brewType] || 999;

    if (stateRef.current.infamy < cost) return false;

    setState(prev => {
      switch (brewType) {
        case 'energy':
          return { ...prev, venomEnergy: Math.min(effectiveMaxEnergy, prev.venomEnergy + 25), infamy: prev.infamy - cost, totalBrewed: prev.totalBrewed + 1 };
        case 'toxicity':
          return { ...prev, toxicityLevel: Math.min(effectiveMaxToxicity, prev.toxicityLevel + 30), infamy: prev.infamy - cost, totalBrewed: prev.totalBrewed + 1 };
        case 'corruption':
          return { ...prev, corruptionReached: Math.min(VA_MAX_CORRUPTION, prev.corruptionReached + 500), infamy: prev.infamy - cost, totalBrewed: prev.totalBrewed + 1 };
        default:
          return prev;
      }
    });
    return true;
  }, [effectiveMaxEnergy, effectiveMaxToxicity]);

  const craftAntidote = useCallback((creatureId: number): boolean => {
    const entry = stateRef.current.creatures.find(c => c.creatureId === creatureId);
    if (!entry || entry.count <= entry.released) return false;

    setState(prev => {
      const def = getCreatureDef(creatureId);
      const infamyReward = def ? def.toxicity : 5;
      const updatedCreatures = prev.creatures.map(c =>
        c.creatureId === creatureId ? { ...c, released: c.released + 1 } : c,
      );
      const newInfamy = prev.infamy + infamyReward;
      const toxicityRestore = def ? Math.floor(def.toxicity * 0.5) : 5;

      const newDailyTask = prev.dailyQuest && !prev.dailyQuest.completed
        && prev.dailyQuest.description.includes('Brew')
        ? {
            ...prev.dailyQuest,
            progress: prev.dailyQuest.progress + 1,
            completed: prev.dailyQuest.progress + 1 >= prev.dailyQuest.target,
          }
        : prev.dailyQuest;

      return {
        ...prev,
        creatures: updatedCreatures,
        infamy: newInfamy,
        totalReleased: prev.totalReleased + 1,
        totalAntidotes: prev.totalAntidotes + 1,
        toxicityLevel: Math.min(effectiveMaxToxicity, prev.toxicityLevel + toxicityRestore),
        dailyQuest: newDailyTask,
      };
    });
    return true;
  }, [effectiveMaxToxicity]);

  const checkAchievements = useCallback((): number[] => {
    const newAchievementIds: number[] = [];
    setState(prev => {
      const earnedIds = new Set(prev.achievements.map(a => a.achievementId));
      const now = Date.now();
      const newEarned: EarnedAchievement[] = [];

      for (const aDef of ACHIEVEMENTS) {
        if (earnedIds.has(aDef.id)) continue;
        let conditionMet = false;

        switch (aDef.conditionType) {
          case 'tame':
            conditionMet = prev.creaturesCollected >= aDef.conditionValue;
            break;
          case 'corruption':
            conditionMet = prev.corruptionReached >= aDef.conditionValue;
            break;
          case 'zone': {
            const exploredCount = prev.zones.filter(Boolean).length;
            conditionMet = exploredCount >= aDef.conditionValue;
            break;
          }
          case 'nest': {
            const maxLv = prev.nests.length > 0 ? Math.max(...prev.nests.map(n => n.level)) : 0;
            conditionMet = maxLv >= aDef.conditionValue || prev.nests.length >= aDef.conditionValue;
            break;
          }
          case 'creature_rarity': {
            let maxRarity = 0;
            for (const c of prev.creatures) {
              const cDef = getCreatureDef(c.creatureId);
              if (cDef && cDef.rarity > maxRarity) maxRarity = cDef.rarity;
            }
            conditionMet = maxRarity >= aDef.conditionValue;
            break;
          }
          case 'brew':
            conditionMet = prev.totalBrewed >= aDef.conditionValue;
            break;
          case 'craft':
            conditionMet = prev.totalAntidotes >= aDef.conditionValue;
            break;
          case 'explore':
            conditionMet = prev.totalExpeditions >= aDef.conditionValue;
            break;
          case 'title':
            conditionMet = prev.titleIndex >= aDef.conditionValue;
            break;
          case 'infamy':
            conditionMet = prev.infamy >= aDef.conditionValue;
            break;
        }

        if (conditionMet) {
          newAchievementIds.push(aDef.id);
          newEarned.push({ achievementId: aDef.id, earnedAt: now, claimed: false });
        }
      }

      if (newEarned.length === 0) return prev;

      let updatedTitle = prev.titleIndex;
      for (const ea of newEarned) {
        const aDef = getAchievementDef(ea.achievementId);
        if (aDef && aDef.reward.type === 'title') {
          updatedTitle = Math.min(VA_TITLES.length - 1, Math.max(updatedTitle, aDef.reward.amount));
        }
      }

      return {
        ...prev,
        achievements: [...prev.achievements, ...newEarned],
        titleIndex: updatedTitle,
      };
    });
    return newAchievementIds;
  }, []);

  const claimAchievementReward = useCallback((achievementId: number): boolean => {
    const earned = stateRef.current.achievements.find(a => a.achievementId === achievementId);
    if (!earned || earned.claimed) return false;

    const def = getAchievementDef(achievementId);
    if (!def) return false;

    setState(prev => {
      const updatedAchievements = prev.achievements.map(a =>
        a.achievementId === achievementId ? { ...a, claimed: true } : a,
      );

      let updatedEnergy = prev.venomEnergy;
      let updatedToxicity = prev.toxicityLevel;
      let updatedInfamy = prev.infamy;
      let updatedTitle = prev.titleIndex;

      switch (def.reward.type) {
        case 'energy':
          updatedEnergy = Math.min(effectiveMaxEnergy, updatedEnergy + def.reward.amount);
          break;
        case 'toxicity':
          updatedToxicity = Math.min(effectiveMaxToxicity, updatedToxicity + def.reward.amount);
          break;
        case 'infamy':
          updatedInfamy += def.reward.amount;
          break;
        case 'title':
          updatedTitle = Math.min(VA_TITLES.length - 1, Math.max(updatedTitle, def.reward.amount));
          break;
      }

      const newTitleIndex = computeTitleIndex(updatedInfamy, prev.corruptionReached, prev.creaturesCollected, updatedTitle);

      return {
        ...prev,
        achievements: updatedAchievements,
        venomEnergy: updatedEnergy,
        toxicityLevel: updatedToxicity,
        infamy: updatedInfamy,
        titleIndex: newTitleIndex,
      };
    });
    return true;
  }, [effectiveMaxEnergy, effectiveMaxToxicity]);

  const claimDailyQuest = useCallback((): boolean => {
    const task = stateRef.current.dailyQuest;
    if (!task || !task.completed || task.claimed) return false;

    setState(prev => {
      if (!prev.dailyQuest || !prev.dailyQuest.completed || prev.dailyQuest.claimed) return prev;

      const updatedTask = { ...prev.dailyQuest, claimed: true };
      let updatedEnergy = prev.venomEnergy;
      let updatedToxicity = prev.toxicityLevel;
      let updatedInfamy = prev.infamy;

      switch (prev.dailyQuest.rewardType) {
        case 'energy':
          updatedEnergy = Math.min(VA_MAX_ENERGY, updatedEnergy + prev.dailyQuest.rewardAmount);
          break;
        case 'toxicity':
          updatedToxicity = Math.min(VA_MAX_TOXICITY, updatedToxicity + prev.dailyQuest.rewardAmount);
          break;
        case 'infamy':
          updatedInfamy += prev.dailyQuest.rewardAmount;
          break;
      }

      return {
        ...prev,
        dailyQuest: updatedTask,
        venomEnergy: updatedEnergy,
        toxicityLevel: updatedToxicity,
        infamy: updatedInfamy,
      };
    });
    return true;
  }, []);

  const acquireIngredient = useCallback((ingredientId: number): boolean => {
    const def = getIngredientDef(ingredientId);
    if (!def) return false;
    if (stateRef.current.ingredients.some(i => i.ingredientId === ingredientId)) return false;
    if (stateRef.current.infamy < def.cost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        ingredients: [
          ...prev.ingredients,
          { ingredientId, equipped: false, durability: 100, acquiredAt: now },
        ],
        infamy: prev.infamy - def.cost,
      };
    });
    return true;
  }, []);

  const toggleIngredient = useCallback((ingredientId: number): boolean => {
    const def = getIngredientDef(ingredientId);
    if (!def) return false;
    if (!stateRef.current.ingredients.some(i => i.ingredientId === ingredientId)) return false;

    setState(prev => {
      return {
        ...prev,
        ingredients: prev.ingredients.map(i =>
          i.ingredientId === ingredientId ? { ...i, equipped: !i.equipped } : i,
        ),
      };
    });
    return true;
  }, []);

  const unlockAbility = useCallback((abilityId: number): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;
    if (stateRef.current.abilities.some(a => a.abilityId === abilityId)) return false;

    const unlockCost = (def.rarity + 1) * 100;
    if (stateRef.current.infamy < unlockCost) return false;

    setState(prev => {
      const now = Date.now();
      return {
        ...prev,
        abilities: [
          ...prev.abilities,
          { abilityId, unlockedAt: now, lastUsedAt: 0, currentCooldown: 0 },
        ],
        infamy: prev.infamy - unlockCost,
      };
    });
    return true;
  }, []);

  const getTitle = useCallback((): string => {
    return VA_TITLES[stateRef.current.titleIndex] ?? VA_TITLES[0];
  }, []);

  const getProgress = useCallback((): {
    creaturesPercent: number;
    zonesPercent: number;
    achievementsPercent: number;
    corruptionPercent: number;
    infamyPercent: number;
    overallPercent: number;
  } => {
    const s = stateRef.current;
    const creaturesPercent = Math.min(100, (s.creaturesCollected / VA_TOTAL_CREATURES) * 100);
    const zonesPercent = Math.min(100, (exploredZoneCount / ABYSS_ZONES.length) * 100);
    const achievementsPercent = Math.min(100, (s.achievements.length / ACHIEVEMENTS.length) * 100);
    const corruptionPercent = Math.min(100, (s.corruptionReached / VA_MAX_CORRUPTION) * 100);
    const infamyPercent = Math.min(100, (s.infamy / VA_MAX_INFAMY) * 100);
    const overallPercent = (creaturesPercent + zonesPercent + achievementsPercent + corruptionPercent + infamyPercent) / 5;
    return {
      creaturesPercent,
      zonesPercent,
      achievementsPercent,
      corruptionPercent,
      infamyPercent,
      overallPercent,
    };
  }, [exploredZoneCount]);

  const getStats = useCallback((): {
    totalCreatures: number;
    uniqueCreatures: number;
    totalTamed: number;
    totalReleased: number;
    zonesExplored: number;
    totalZones: number;
    ingredientsOwned: number;
    ingredientsEquipped: number;
    nestsBuilt: number;
    maxNestLevel: number;
    abilitiesUnlocked: number;
    achievementsEarned: number;
    totalAchievements: number;
    corruptionReached: number;
    maxPossibleCorruption: number;
    infamy: number;
    title: string;
    titleIndex: number;
    totalExpeditions: number;
    totalBrewed: number;
    totalAntidotes: number;
    playTimeMinutes: number;
    currentEnergy: number;
    currentToxicity: number;
    currentCorruption: number;
  } => {
    const s = stateRef.current;
    return {
      totalCreatures: VA_TOTAL_CREATURES,
      uniqueCreatures: s.creaturesCollected,
      totalTamed: s.totalTamed,
      totalReleased: s.totalReleased,
      zonesExplored: exploredZoneCount,
      totalZones: ABYSS_ZONES.length,
      ingredientsOwned: s.ingredients.length,
      ingredientsEquipped: s.ingredients.filter(i => i.equipped).length,
      nestsBuilt: s.nests.length,
      maxNestLevel: maxNestLevel,
      abilitiesUnlocked: s.abilities.length,
      achievementsEarned: s.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
      corruptionReached: s.corruptionReached,
      maxPossibleCorruption: VA_MAX_CORRUPTION,
      infamy: s.infamy,
      title: VA_TITLES[s.titleIndex],
      titleIndex: s.titleIndex,
      totalExpeditions: s.totalExpeditions,
      totalBrewed: s.totalBrewed,
      totalAntidotes: s.totalAntidotes,
      playTimeMinutes: Math.floor(s.totalPlayTime / 60),
      currentEnergy: Math.floor(s.venomEnergy),
      currentToxicity: Math.floor(s.toxicityLevel),
      currentCorruption: s.currentCorruption,
    };
  }, [exploredZoneCount, maxNestLevel]);

  const resetState = useCallback(() => {
    setState(createInitialState());
  }, []);

  const restoreToxicity = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      toxicityLevel: Math.min(effectiveMaxToxicity, prev.toxicityLevel + amount),
    }));
  }, [effectiveMaxToxicity]);

  const restoreEnergy = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      venomEnergy: Math.min(effectiveMaxEnergy, prev.venomEnergy + amount),
    }));
  }, [effectiveMaxEnergy]);

  const addInfamy = useCallback((amount: number) => {
    setState(prev => {
      const newInfamy = prev.infamy + amount;
      const newTitleIndex = computeTitleIndex(newInfamy, prev.corruptionReached, prev.creaturesCollected, prev.titleIndex);
      return { ...prev, infamy: newInfamy, titleIndex: newTitleIndex };
    });
  }, []);

  const getCreatureInfo = useCallback((creatureId: number): {
    def: VenomCreatureDef | undefined;
    tamed: boolean;
    count: number;
    released: number;
  } => {
    const def = getCreatureDef(creatureId);
    const entry = stateRef.current.creatures.find(c => c.creatureId === creatureId);
    return {
      def,
      tamed: !!entry,
      count: entry?.count ?? 0,
      released: entry?.released ?? 0,
    };
  }, []);

  const getNestInfo = useCallback((nestId: number): {
    def: NestStructureDef | undefined;
    built: boolean;
    level: number;
    upgradeCost: number;
    currentEffect: number;
    maxLevel: boolean;
  } => {
    const def = getNestDef(nestId);
    const entry = stateRef.current.nests.find(n => n.nestId === nestId);
    const level = entry?.level ?? 0;
    const maxLevel = level >= VA_NEST_MAX_LEVEL;
    return {
      def,
      built: !!entry,
      level,
      upgradeCost: maxLevel ? Infinity : calculateNestCost(nestId, level),
      currentEffect: def ? def.baseEffect + def.effectPerLevel * level : 0,
      maxLevel,
    };
  }, []);

  const getZoneInfo = useCallback((zoneId: number): {
    def: AbyssZoneDef | undefined;
    explored: boolean;
    unlocked: boolean;
    accessible: boolean;
  } => {
    const def = getZoneDef(zoneId);
    if (!def) return { def: undefined, explored: false, unlocked: false, accessible: false };
    const s = stateRef.current;
    const explored = s.zones[zoneId] ?? false;
    const titleMet = s.titleIndex >= def.requiredTitle;
    const corruptionMet = s.corruptionReached >= def.corruptionRange[0] || def.requiredTitle === 0;
    return {
      def,
      explored,
      unlocked: titleMet,
      accessible: titleMet && (corruptionMet || def.requiredTitle === 0),
    };
  }, []);

  const getIngredientInfo = useCallback((ingredientId: number): {
    def: AlchemyIngredientDef | undefined;
    owned: boolean;
    equipped: boolean;
    durability: number;
  } => {
    const def = getIngredientDef(ingredientId);
    const entry = stateRef.current.ingredients.find(i => i.ingredientId === ingredientId);
    return {
      def,
      owned: !!entry,
      equipped: entry?.equipped ?? false,
      durability: entry?.durability ?? 0,
    };
  }, []);

  const getAbilityInfo = useCallback((abilityId: number): {
    def: VenomAbilityDef | undefined;
    unlocked: boolean;
    onCooldown: boolean;
    cooldownRemaining: number;
  } => {
    const def = getAbilityDef(abilityId);
    const entry = stateRef.current.abilities.find(a => a.abilityId === abilityId);
    return {
      def,
      unlocked: !!entry,
      onCooldown: (entry?.currentCooldown ?? 0) > 0,
      cooldownRemaining: entry?.currentCooldown ?? 0,
    };
  }, []);

  // ── ADDITIONAL MEMOIZED COMPUTED VALUES ──

  const environmentalEffects = useMemo(() => {
    const corruption = state.currentCorruption;
    const zone = ABYSS_ZONES[state.currentZone];
    const effects: Array<{
      name: string;
      emoji: string;
      intensity: number;
      description: string;
    }> = [];

    if (corruption >= 800) {
      effects.push({
        name: 'Toxic Haze',
        emoji: '🌫️',
        intensity: Math.min(1, (corruption - 800) / 1200),
        description: 'Thick toxic fog obscures vision and irritates the lungs.',
      });
    }
    if (corruption >= 1500) {
      effects.push({
        name: 'Corruption Pressure',
        emoji: '💀',
        intensity: Math.min(1, (corruption - 1500) / 5000),
        description: 'The weight of corruption slows movement and drains vitality.',
      });
    }
    if (corruption >= 4000) {
      effects.push({
        name: 'Blight Radiation',
        emoji: '☢️',
        intensity: Math.min(1, (corruption - 4000) / 2000),
        description: 'Radioactive blight emanates from the ground, damaging all life.',
      });
    }
    if (corruption >= 6000) {
      effects.push({
        name: 'Cursed Aura',
        emoji: '👁️',
        intensity: Math.min(1, (corruption - 6000) / 3000),
        description: 'Ancient curses swirl in the air, disrupting abilities.',
      });
    }
    if (corruption >= 9000) {
      effects.push({
        name: 'Abyssal Power',
        emoji: '⚡',
        intensity: Math.min(1, (corruption - 9000) / 999),
        description: 'The raw power of the abyss enhances all venom abilities.',
      });
    }
    if (zone && zone.id === ZONE_BLIGHTED_WASTELAND) {
      effects.push({
        name: 'Blight Storm',
        emoji: '🌪️',
        intensity: 0.7,
        description: 'Toxic storms sweep across the wasteland unpredictably.',
      });
    }
    if (zone && zone.id === ZONE_ACID_CAVERNS) {
      effects.push({
        name: 'Acid Drip',
        emoji: '💧',
        intensity: 0.5,
        description: 'Corrosive acid drips from the cavern ceiling constantly.',
      });
    }
    if (zone && zone.id === ZONE_FUNGAL_HOLLOW) {
      effects.push({
        name: 'Spore Cloud',
        emoji: '🍄',
        intensity: 0.4,
        description: 'Toxic spores fill the air, causing mild hallucinations.',
      });
    }
    if (state.venomEnergy < 20) {
      effects.push({
        name: 'Exhaustion',
        emoji: '😰',
        intensity: 1 - state.venomEnergy / 20,
        description: 'Low venom energy. Actions cost more and yield less.',
      });
    }
    if (state.toxicityLevel < 15) {
      effects.push({
        name: 'Toxicity Warning',
        emoji: '⚠️',
        intensity: 1 - state.toxicityLevel / 15,
        description: 'Toxicity critically low! Ascend to the surface immediately.',
      });
    }

    return effects;
  }, [state.currentCorruption, state.currentZone, state.venomEnergy, state.toxicityLevel]);

  const creatureToxicityRanking = useMemo(() => {
    const ranking = state.creatures
      .map(entry => {
        const def = getCreatureDef(entry.creatureId);
        if (!def) return null;
        return {
          creatureId: entry.creatureId,
          name: def.name,
          emoji: def.emoji,
          rarity: def.rarity,
          venomType: def.venomType,
          totalToxicity: def.toxicity * entry.count * VA_RARITY_MULTIPLIERS[def.rarity],
          count: entry.count,
          released: entry.released,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => b.totalToxicity - a.totalToxicity);
    return ranking;
  }, [state.creatures]);

  const nestDomainStats = useMemo(() => {
    const stats = {
      habitatLevel: 0,
      defenseLevel: 0,
      brewingLevel: 0,
      researchLevel: 0,
      trapLevel: 0,
      totalLevel: 0,
      categoryCounts: { habitat: 0, defense: 0, brewing: 0, research: 0, trap: 0 },
    };
    for (const built of state.nests) {
      const def = getNestDef(built.nestId);
      if (!def) continue;
      stats.categoryCounts[def.category]++;
      switch (def.category) {
        case 'habitat': stats.habitatLevel += built.level; break;
        case 'defense': stats.defenseLevel += built.level; break;
        case 'brewing': stats.brewingLevel += built.level; break;
        case 'research': stats.researchLevel += built.level; break;
        case 'trap': stats.trapLevel += built.level; break;
      }
      stats.totalLevel += built.level;
    }
    return stats;
  }, [state.nests]);

  const ingredientRaritySummary = useMemo(() => {
    const byRarity: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };
    for (const ing of state.ingredients) {
      const def = getIngredientDef(ing.ingredientId);
      if (def) byRarity[def.rarity]++;
    }
    return byRarity;
  }, [state.ingredients]);

  const abilityPowerSummary = useMemo(() => {
    const activeAbilities = state.abilities.filter(a => {
      const def = getAbilityDef(a.abilityId);
      return def && def.type === 'active';
    });
    const passiveAbilities = state.abilities.filter(a => {
      const def = getAbilityDef(a.abilityId);
      return def && def.type === 'passive';
    });
    const onCooldown = state.abilities.filter(a => a.currentCooldown > 0);
    return {
      totalUnlocked: state.abilities.length,
      activeCount: activeAbilities.length,
      passiveCount: passiveAbilities.length,
      onCooldownCount: onCooldown.length,
      cooldownList: onCooldown.map(a => {
        const def = getAbilityDef(a.abilityId);
        return { abilityId: a.abilityId, name: def?.name ?? '', remaining: a.currentCooldown };
      }),
    };
  }, [state.abilities]);

  const corruptionZoneProgress = useMemo(() => {
    const corruption = state.corruptionReached;
    const progress: Array<{
      zoneId: number;
      zoneName: string;
      minCorruption: number;
      maxCorruption: number;
      explored: boolean;
      corruptionProgress: number;
    }> = [];
    for (const zone of ABYSS_ZONES) {
      const explored = state.zones[zone.id] ?? false;
      const [minC, maxC] = zone.corruptionRange;
      const corrProgress = Math.min(1, Math.max(0, (corruption - minC) / (maxC - minC)));
      progress.push({
        zoneId: zone.id,
        zoneName: zone.name,
        minCorruption: minC,
        maxCorruption: maxC,
        explored,
        corruptionProgress: corrProgress,
      });
    }
    return progress;
  }, [state.corruptionReached, state.zones]);

  const titleProgressDetails = useMemo(() => {
    const next = nextTitleDef;
    if (!next) {
      return { maxTitleReached: true, infamyProgress: 100, corruptionProgress: 100, creatureProgress: 100 };
    }
    const current = TITLE_THRESHOLDS[state.titleIndex];
    const infamyRange = next.minInfamy - current.minInfamy;
    const corruptionRange = next.minCorruption - current.minCorruption;
    const creatureRange = next.minCreatures - current.minCreatures;
    return {
      maxTitleReached: false,
      infamyProgress: infamyRange > 0 ? Math.min(100, ((state.infamy - current.minInfamy) / infamyRange) * 100) : 100,
      corruptionProgress: corruptionRange > 0 ? Math.min(100, ((state.corruptionReached - current.minCorruption) / corruptionRange) * 100) : 100,
      creatureProgress: creatureRange > 0 ? Math.min(100, ((state.creaturesCollected - current.minCreatures) / creatureRange) * 100) : 100,
    };
  }, [state.titleIndex, state.infamy, state.corruptionReached, state.creaturesCollected, nextTitleDef]);

  const dailyQuestStatus = useMemo(() => {
    if (!state.dailyQuest) return null;
    const task = state.dailyQuest;
    const now = Date.now();
    const timeRemaining = Math.max(0, task.expiresAt - now);
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const progressPercent = task.target > 0 ? Math.min(100, (task.progress / task.target) * 100) : 0;
    return {
      ...task,
      timeRemaining,
      hoursRemaining,
      minutesRemaining,
      progressPercent,
      expired: now > task.expiresAt,
    };
  }, [state.dailyQuest]);

  // ── VENOM RECIPES DATA ──

  const venomRecipes = useMemo(() => {
    return [
      { id: 1, name: 'Swamp Draught', emoji: '🧪', type: 'energy', potency: 15, cost: 20, description: 'A basic energy restorative brewed from swamp slime', ingredients: ['Swamp Slime', 'Fang Extract'] },
      { id: 2, name: 'Antidote Tonic', emoji: '💊', type: 'toxicity', potency: 20, cost: 25, description: 'Restores toxicity tolerance with neutralizing agents', ingredients: ['Toad Gland', 'Spider Silk'] },
      { id: 3, name: 'Corruption Serum', emoji: '💉', type: 'corruption', potency: 300, cost: 40, description: 'Boosts corruption resistance for deeper descent', ingredients: ['Blight Spore', 'Acid Vial'] },
      { id: 4, name: 'Infamy Elixir', emoji: '☠️', type: 'energy', potency: 50, cost: 80, description: 'A potent brew that channels the power of infamy', ingredients: ['Viper Venom', 'Chitin Powder'] },
      { id: 5, name: 'Venom Concentrate', emoji: '🐍', type: 'toxicity', potency: 50, cost: 90, description: 'Ultra-concentrated venom essence for massive toxicity boost', ingredients: ['Mamba Neurotoxin', 'Necro Solvent'] },
      { id: 6, name: 'Void Descent Pill', emoji: '🕳️', type: 'corruption', potency: 1000, cost: 150, description: 'Compresses your form to withstand extreme corruption', ingredients: ['Void Catalyst', 'Cursed Essence'] },
      { id: 7, name: 'Blight Vision Drops', emoji: '👁️', type: 'energy', potency: 60, cost: 200, description: 'See through blight and corruption to find hidden creatures', ingredients: ['Blight Essence', 'Soul Crystal'] },
      { id: 8, name: 'Hydra Brew', emoji: '🐉', type: 'toxicity', potency: 80, cost: 180, description: 'Brewed from hydra essence, grants massive toxicity', ingredients: ['Hydra Heart', 'Fungal Catalyst'] },
      { id: 9, name: 'Entropy Elixir', emoji: '⚛️', type: 'energy', potency: 80, cost: 300, description: 'Channel entropy itself into raw venom energy', ingredients: ['Entropy Crystal', 'Primordial Acid'] },
      { id: 10, name: 'Abyssal Crown Brew', emoji: '👑', type: 'corruption', potency: 5000, cost: 500, description: 'The ultimate corruption brew, fit for the Abyss Overlord', ingredients: ['Primordial Venom', 'Sovereign Crystal'] },
    ];
  }, []);

  const getCreatureSynergyScore = useCallback((creatureIds: number[]): number => {
    if (creatureIds.length < 2) return 0;
    let synergyScore = 0;
    const defs = creatureIds.map(cid => getCreatureDef(cid)).filter((d): d is VenomCreatureDef => d !== undefined);
    for (let i = 0; i < defs.length; i++) {
      for (let j = i + 1; j < defs.length; j++) {
        if (defs[i].zone === defs[j].zone) synergyScore += 5;
        if (defs[i].rarity === defs[j].rarity) synergyScore += 3;
        if (defs[i].venomType === defs[j].venomType) synergyScore += 4;
        if (defs[i].venomColor === defs[j].venomColor) synergyScore += 2;
      }
    }
    return synergyScore;
  }, []);

  const getBestCreatureForZone = useCallback((zoneId: number): VenomCreatureDef | undefined => {
    const zone = getZoneDef(zoneId);
    if (!zone) return undefined;
    let best: VenomCreatureDef | undefined;
    let bestScore = -1;
    for (const cid of zone.creaturesAvailable) {
      const def = getCreatureDef(cid);
      if (!def) continue;
      const score = def.toxicity * VA_RARITY_MULTIPLIERS[def.rarity];
      if (score > bestScore) {
        bestScore = score;
        best = def;
      }
    }
    return best;
  }, []);

  const getRarestUntamed = useCallback((): VenomCreatureDef | undefined => {
    const tamedIds = new Set(stateRef.current.creatures.map(c => c.creatureId));
    for (let rarity = RARITY_LEGENDARY; rarity >= RARITY_COMMON; rarity--) {
      const untamed = VENOM_CREATURES.find(c => c.rarity === rarity && !tamedIds.has(c.id));
      if (untamed) return untamed;
    }
    return undefined;
  }, []);

  const getCollectionCompletionBonus = useCallback((): {
    rarityBonuses: Array<{ rarity: string; collected: number; total: number; bonusApplied: boolean }>;
    totalBonusToxicity: number;
  } => {
    const s = stateRef.current;
    const tamedIds = new Set(s.creatures.map(c => c.creatureId));
    const rarityBonuses = VA_RARITY_NAMES.map((name, idx) => {
      const total = VENOM_CREATURES.filter(c => c.rarity === idx).length;
      const collected = VENOM_CREATURES.filter(c => c.rarity === idx && tamedIds.has(c.id)).length;
      return { rarity: name, collected, total, bonusApplied: collected === total };
    });
    const totalBonusToxicity = rarityBonuses
      .filter(b => b.bonusApplied)
      .reduce((sum, _, idx) => sum + (idx + 1) * 50, 0);
    return { rarityBonuses, totalBonusToxicity };
  }, []);

  const getBestVenomCombination = useCallback((): Array<{
    creatureId: number;
    name: string;
    emoji: string;
    rarity: number;
    toxicity: number;
    synergyPartners: string[];
  }> => {
    const s = stateRef.current;
    const tamedEntries = s.creatures.filter(c => c.count > 0);
    if (tamedEntries.length < 2) return [];

    const results = tamedEntries.map(entry => {
      const def = getCreatureDef(entry.creatureId);
      if (!def) return null;
      return {
        creatureId: entry.creatureId,
        name: def.name,
        emoji: def.emoji,
        rarity: def.rarity,
        toxicity: def.toxicity * entry.count,
        synergyPartners: [] as string[],
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results.length; j++) {
        if (i === j) continue;
        const defI = getCreatureDef(results[i].creatureId);
        const defJ = getCreatureDef(results[j].creatureId);
        if (!defI || !defJ) continue;
        if (defI.venomType === defJ.venomType) {
          results[i].synergyPartners.push(defJ.name);
        }
      }
    }

    return results.sort((a, b) => b.synergyPartners.length - a.synergyPartners.length);
  }, []);

  const getNestUpgradePath = useCallback((nestId: number): Array<{
    level: number;
    cost: number;
    effect: number;
    cumulativeCost: number;
  }> => {
    const def = getNestDef(nestId);
    if (!def) return [];
    const path: Array<{ level: number; cost: number; effect: number; cumulativeCost: number }> = [];
    let cumulative = 0;
    for (let lvl = 1; lvl <= VA_NEST_MAX_LEVEL; lvl++) {
      const cost = calculateNestCost(nestId, lvl - 1);
      cumulative += cost;
      path.push({
        level: lvl,
        cost,
        effect: def.baseEffect + def.effectPerLevel * lvl,
        cumulativeCost: cumulative,
      });
    }
    return path;
  }, []);

  const getCreatureTypeDistribution = useCallback((): Record<string, number> => {
    const s = stateRef.current;
    const distribution: Record<string, number> = {};
    for (const entry of s.creatures) {
      const def = getCreatureDef(entry.creatureId);
      if (def) {
        distribution[def.venomType] = (distribution[def.venomType] || 0) + entry.count;
      }
    }
    return distribution;
  }, []);

  const getZoneCreatureCounts = useCallback((): Record<string, number> => {
    const s = stateRef.current;
    const counts: Record<string, number> = {};
    for (const entry of s.creatures) {
      const def = getCreatureDef(entry.creatureId);
      if (def) {
        const zone = ABYSS_ZONES[def.zone];
        if (zone) {
          counts[zone.name] = (counts[zone.name] || 0) + entry.count;
        }
      }
    }
    return counts;
  }, []);

  const getTopVenomTypes = useCallback((): Array<{ venomType: string; totalToxicity: number; creatureCount: number }> => {
    const s = stateRef.current;
    const typeMap: Record<string, { totalToxicity: number; creatureCount: number }> = {};
    for (const entry of s.creatures) {
      const def = getCreatureDef(entry.creatureId);
      if (!def) continue;
      if (!typeMap[def.venomType]) {
        typeMap[def.venomType] = { totalToxicity: 0, creatureCount: 0 };
      }
      typeMap[def.venomType].totalToxicity += def.toxicity * entry.count;
      typeMap[def.venomType].creatureCount += entry.count;
    }
    return Object.entries(typeMap)
      .map(([venomType, data]) => ({ venomType, ...data }))
      .sort((a, b) => b.totalToxicity - a.totalToxicity);
  }, []);

  // ── RETURN API ──

  return {
    // Raw state
    ...state,

    // Catalogs
    creatureCatalog,
    zoneCatalog,
    ingredientCatalog,
    nestCatalog,
    abilityCatalog,
    achievementCatalog,
    titleCatalog,

    // Computed values
    equippedIngredients,
    totalIngredientBonuses,
    creatureCollectionSummary,
    exploredZoneCount,
    activeAbilityIds,
    maxNestLevel,
    nestCount,
    highestRareTamed,
    isTitleMax,
    effectiveMaxCorruption,
    effectiveMaxToxicity,
    effectiveMaxEnergy,
    currentZoneDef,
    nextTitleDef,
    zonesUnlocked,
    achievementsProgress,
    environmentalEffects,
    creatureToxicityRanking,
    nestDomainStats,
    ingredientRaritySummary,
    abilityPowerSummary,
    corruptionZoneProgress,
    titleProgressDetails,
    dailyQuestStatus,
    venomRecipes,

    // Actions
    tameCreature,
    exploreZone,
    upgradeNest,
    activateAbility,
    descendDeeper,
    ascendShallow,
    buildNest,
    brewVenom,
    craftAntidote,
    checkAchievements,
    claimAchievementReward,
    claimDailyQuest,
    acquireIngredient,
    toggleIngredient,
    unlockAbility,
    resetState,

    // Restore
    restoreToxicity,
    restoreEnergy,
    addInfamy,

    // Info getters
    getTitle,
    getProgress,
    getStats,
    getCreatureInfo,
    getNestInfo,
    getZoneInfo,
    getIngredientInfo,
    getAbilityInfo,

    // Advanced queries
    getCreatureSynergyScore,
    getBestCreatureForZone,
    getRarestUntamed,
    getCollectionCompletionBonus,
    getBestVenomCombination,
    getNestUpgradePath,
    getCreatureTypeDistribution,
    getZoneCreatureCounts,
    getTopVenomTypes,
  };
}
