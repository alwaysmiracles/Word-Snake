import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Ink Dynasty (水墨王朝) — Wire Module
// A React hook-based module for the Word Snake game where players are master
// painters who bring ink creatures to life, collect rare brushes, and build
// painting studios across an ancient Chinese ink dynasty.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Type Definitions ────────────────────────────────────────────────────────

type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface InkSpirit {
  id: number;
  name: string;
  description: string;
  rarity: RarityTier;
  power: number;
  awakened: boolean;
  loyalty: number;
  element: string;
  quote: string;
  awakenedAt: number | null;
  paintCost: number;
}

interface Studio {
  id: number;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  bonusType: string;
  bonusValue: number;
  upgradeCost: number;
}

interface Material {
  id: number;
  name: string;
  description: string;
  quantity: number;
  maxQuantity: number;
  rarity: RarityTier;
  category: string;
  effect: string;
  effectValue: number;
}

interface Gallery {
  id: number;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  reputationBonus: number;
  paintings: number;
  maxPaintings: number;
  upgradeCost: number;
  theme: string;
}

interface Ability {
  id: number;
  name: string;
  description: string;
  cooldown: number;
  currentCooldown: number;
  unlocked: boolean;
  inkCost: number;
  powerMultiplier: number;
  element: string;
  tier: number;
}

interface Achievement {
  id: number;
  name: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  rewardType: string;
  rewardValue: number;
  icon: string;
  unlockedAt: number | null;
}

interface DailyMasterpiece {
  spiritId: number;
  challenge: string;
  reward: number;
  completed: boolean;
  expiresAt: number;
  bonusElement: string;
}

interface LogEntry {
  timestamp: number;
  message: string;
  type: 'awaken' | 'paint' | 'upgrade' | 'ability' | 'grind' | 'seal' | 'scroll' | 'exhibit' | 'inspire' | 'achievement' | 'title';
}

// ─── Constants (prefixed IX_) ───────────────────────────────────────────────

const IX_MAX_INK = 200;
const IX_MAX_INSPIRATION = 200;
const IX_SPIRIT_COUNT = 35;
const IX_STUDIO_COUNT = 8;
const IX_MATERIAL_COUNT = 30;
const IX_GALLERY_COUNT = 25;
const IX_ABILITY_COUNT = 22;
const IX_ACHIEVEMENT_COUNT = 18;
const IX_TITLE_COUNT = 8;
const IX_MAX_BRUSH_MASTERY = 10000;
const IX_MAX_GALLERY_LEVEL = 10;
const IX_MAX_REPUTATION = 10000;
const IX_BASE_AWAKEN_COST = 20;
const IX_BASE_PAINT_COST = 15;
const IX_BASE_UPGRADE_COST = 50;
const IX_INK_REGEN_RATE = 2;
const IX_INSPIRATION_REGEN_RATE = 1;
const IX_SEAL_POWER_BASE = 5;
const IX_SCROLL_POWER_BASE = 8;
const IX_DAILY_MASTERPIECE_DURATION = 86400000;

// Color theme
const IX_COLOR_BLACK = '#1A1A1A';
const IX_COLOR_WHITE = '#FAFAFA';
const IX_COLOR_INK_GRAY = '#757575';
const IX_COLOR_VERMILLION = '#D32F2F';
const IX_COLOR_GOLD = '#C8A951';

const IX_RARITY_ORDER: Record<RarityTier, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

const IX_RARITY_NAMES: Record<RarityTier, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

// ─── Catalog Data ────────────────────────────────────────────────────────────

interface SpiritTemplate {
  name: string;
  description: string;
  rarity: RarityTier;
  power: number;
  element: string;
  quote: string;
  paintCost: number;
}

const INK_SPIRIT_TEMPLATES: SpiritTemplate[] = [
  // Common (7)
  { name: 'Ink Fish', description: 'A graceful fish that swims through scroll rivers, leaving trails of black ink.', rarity: 'common', power: 10, element: 'water', quote: 'Flow like water, paint like wind.', paintCost: 10 },
  { name: 'Brush Hare', description: 'A swift hare whose fur forms the finest brush tips.', rarity: 'common', power: 12, element: 'earth', quote: 'Speed is the essence of every stroke.', paintCost: 10 },
  { name: 'Paper Crane', description: 'A crane folded from ancient rice paper, carrying messages across dynasties.', rarity: 'common', power: 8, element: 'wind', quote: 'Origami dreams take flight on ink-stained wings.', paintCost: 8 },
  { name: 'Stone Turtle', description: 'A turtle carved from river stone, guardian of ancient calligraphy.', rarity: 'common', power: 15, element: 'earth', quote: 'Patience grinds the finest ink.', paintCost: 12 },
  { name: 'Ink Moth', description: 'A moth drawn to the glow of freshly painted scrolls.', rarity: 'common', power: 9, element: 'wind', quote: 'Beauty dances at the edge of darkness.', paintCost: 8 },
  { name: 'Water Droplet Spirit', description: 'A sentient droplet that carries dissolved ink to far-off paintings.', rarity: 'common', power: 7, element: 'water', quote: 'Even the smallest drop creates ripples.', paintCost: 7 },
  { name: 'Grass Sprite', description: 'A tiny spirit living in the strokes of bamboo paintings.', rarity: 'common', power: 11, element: 'wood', quote: 'Between the lines, life takes root.', paintCost: 9 },
  // Uncommon (7)
  { name: 'Bamboo Spirit', description: 'An ancient spirit embodying resilience, dwelling in painted bamboo groves.', rarity: 'uncommon', power: 25, element: 'wood', quote: 'Bend but never break — the way of bamboo.', paintCost: 18 },
  { name: 'Plum Blossom Fairy', description: 'A delicate fairy who blooms in the harshest winters of the canvas.', rarity: 'uncommon', power: 28, element: 'wood', quote: 'From frost, the most beautiful petals emerge.', paintCost: 20 },
  { name: 'River Spirit', description: 'The living essence of a great river painted on an imperial scroll.', rarity: 'uncommon', power: 30, element: 'water', quote: 'The river remembers every stone it has touched.', paintCost: 22 },
  { name: 'Cloud Warrior', description: 'A warrior born from storm clouds, wielding a blade of condensed mist.', rarity: 'uncommon', power: 32, element: 'wind', quote: 'Strike like lightning, vanish like fog.', paintCost: 24 },
  { name: 'Ink Monkey', description: 'A mischievous monkey that steals brushes and creates chaotic art.', rarity: 'uncommon', power: 22, element: 'earth', quote: 'Chaos is the mother of creation.', paintCost: 16 },
  { name: 'Pine Guardian', description: 'A stoic guardian standing watch over winter mountain paintings.', rarity: 'uncommon', power: 35, element: 'wood', quote: 'A thousand winters cannot fell the rooted soul.', paintCost: 25 },
  { name: 'Lotus Dancer', description: 'A serene dancer who performs upon lotus pads of liquid ink.', rarity: 'uncommon', power: 26, element: 'water', quote: 'Rise from the mud, bloom in the light.', paintCost: 19 },
  // Rare (7)
  { name: 'Mountain Sage', description: 'A wise hermit who resides in the peaks of landscapes, dispensing artistic wisdom.', rarity: 'rare', power: 55, element: 'earth', quote: 'To paint a mountain, first become the mountain.', paintCost: 40 },
  { name: 'Dragon of Mist', description: 'A serpentine dragon woven from morning mist and gray ink washes.', rarity: 'rare', power: 60, element: 'water', quote: 'The mist conceals, but the dragon reveals.', paintCost: 45 },
  { name: 'Tiger of Ink', description: 'A fierce tiger prowling through the margins of ancient calligraphy.', rarity: 'rare', power: 65, element: 'earth', quote: 'Strength without control is but a smear.', paintCost: 48 },
  { name: 'Crane Hermit', description: 'An ancient crane that has watched empires rise and fall on painted silk.', rarity: 'rare', power: 50, element: 'wind', quote: 'Longevity is the art of graceful detachment.', paintCost: 38 },
  { name: 'Jade Phoenix', description: 'A phoenix reborn in green jade ink, symbolizing renewal and artistry.', rarity: 'rare', power: 58, element: 'wood', quote: 'From ashes of failed paintings, masterpieces rise.', paintCost: 42 },
  { name: 'Thunder Brush', description: 'A spirit that manifests as a brush crackling with storm energy.', rarity: 'rare', power: 62, element: 'wind', quote: 'Every great work begins with a single spark.', paintCost: 44 },
  { name: 'Frost Blossom', description: 'A flower that blooms in crystalline ice formations on winter scrolls.', rarity: 'rare', power: 52, element: 'water', quote: 'Cold refines what heat cannot create.', paintCost: 39 },
  // Epic (7)
  { name: 'Phoenix of Ink', description: 'A magnificent phoenix whose feathers are brush strokes of pure black and gold ink.', rarity: 'epic', power: 100, element: 'fire', quote: 'I am the fire that gives ink its soul.', paintCost: 80 },
  { name: 'Celestial Horse', description: 'A winged horse that gallops across the sky-painted ceilings of imperial halls.', rarity: 'epic', power: 95, element: 'wind', quote: 'No horizon can contain a painter\'s imagination.', paintCost: 75 },
  { name: 'Dragon King\'s Scroll', description: 'The Dragon King\'s personal scroll, containing the secrets of ocean painting.', rarity: 'epic', power: 110, element: 'water', quote: 'The deepest art lies beneath the surface.', paintCost: 90 },
  { name: 'Moonlit Scholar', description: 'A scholar who paints exclusively by moonlight, capturing dreams on paper.', rarity: 'epic', power: 88, element: 'wind', quote: 'Daylight reveals; moonlight transforms.', paintCost: 70 },
  { name: 'Storm Painter', description: 'A tempestuous artist who channels the fury of storms into explosive paintings.', rarity: 'epic', power: 105, element: 'wind', quote: 'Calm seas make poor sailors; calm ink makes poor art.', paintCost: 85 },
  { name: 'Jade Emperor\'s Carp', description: 'The legendary carp that leapt the Dragon Gate, transformed into pure ink art.', rarity: 'epic', power: 98, element: 'water', quote: 'The greatest transformation begins with a single leap.', paintCost: 78 },
  { name: 'Thousand-Armed Bodhisattva', description: 'A compassionate deity with a thousand arms, each holding a different brush.', rarity: 'epic', power: 115, element: 'fire', quote: 'Compassion is the ink of the soul.', paintCost: 95 },
  // Legendary (7)
  { name: 'Ink Dragon God', description: 'The primordial dragon born from the first drop of ink ever ground.', rarity: 'legendary', power: 200, element: 'water', quote: 'Before the world was, there was ink. Before ink, there was I.', paintCost: 200 },
  { name: 'Eternal Mountain Painter', description: 'A legendary painter whose mountain landscapes shift and change with the seasons.', rarity: 'legendary', power: 190, element: 'earth', quote: 'I do not paint mountains. I summon them.', paintCost: 180 },
  { name: 'Celestial Calligrapher', description: 'A being from the heavenly realm whose calligraphy contains actual magic.', rarity: 'legendary', power: 195, element: 'fire', quote: 'Each character I write becomes a law of nature.', paintCost: 185 },
  { name: 'Ancestor of All Ink', description: 'The origin spirit of ink itself, a shadowy figure of pure creative essence.', rarity: 'legendary', power: 250, element: 'water', quote: 'I am the darkness from which all beauty emerges.', paintCost: 250 },
  { name: 'Phoenix Empress of Colors', description: 'A sovereign ruler who commands not just ink but all colors of the spectrum.', rarity: 'legendary', power: 210, element: 'fire', quote: 'Black is the mother of ten thousand colors.', paintCost: 210 },
  { name: 'Void Brush Master', description: 'A master who paints with the void itself, creating art from nothingness.', rarity: 'legendary', power: 220, element: 'wind', quote: 'The greatest strokes are the ones you cannot see.', paintCost: 220 },
  { name: 'Dao of Ink Eternal', description: 'The ultimate embodiment of ink philosophy, existing in every stroke ever made.', rarity: 'legendary', power: 300, element: 'earth', quote: 'The Dao that can be painted is not the eternal Dao.', paintCost: 300 },
];

interface StudioTemplate {
  name: string;
  description: string;
  maxLevel: number;
  bonusType: string;
  baseBonusValue: number;
  baseUpgradeCost: number;
}

const STUDIO_TEMPLATES: StudioTemplate[] = [
  { name: 'Brush Forge', description: 'A sacred forge where the finest brushes are crafted from rare materials.', maxLevel: 10, bonusType: 'brushQuality', baseBonusValue: 5, baseUpgradeCost: 30 },
  { name: 'Rice Paper Workshop', description: 'Traditional workshop producing handmade rice paper of supreme quality.', maxLevel: 10, bonusType: 'paperQuality', baseBonusValue: 4, baseUpgradeCost: 25 },
  { name: 'Ink Grinding Room', description: 'A tranquil room dedicated to the art of grinding ink sticks into liquid perfection.', maxLevel: 10, bonusType: 'inkEfficiency', baseBonusValue: 6, baseUpgradeCost: 35 },
  { name: 'Seal Carving Studio', description: 'Where masters carve their personal seals into precious stones.', maxLevel: 10, bonusType: 'sealPower', baseBonusValue: 3, baseUpgradeCost: 40 },
  { name: 'Scroll Gallery', description: 'A grand hall displaying the dynasty\'s finest scroll paintings.', maxLevel: 10, bonusType: 'scrollCapacity', baseBonusValue: 5, baseUpgradeCost: 45 },
  { name: 'Meditation Garden', description: 'A serene garden where artists find inspiration and inner peace.', maxLevel: 10, bonusType: 'inspirationRegen', baseBonusValue: 7, baseUpgradeCost: 50 },
  { name: 'Binding Workshop', description: 'Where scattered pages are bound into magnificent albums and books.', maxLevel: 10, bonusType: 'bindingBonus', baseBonusValue: 4, baseUpgradeCost: 30 },
  { name: 'Imperial Atelier', description: 'The pinnacle studio, reserved for work destined for the imperial collection.', maxLevel: 10, bonusType: 'reputationBonus', baseBonusValue: 10, baseUpgradeCost: 100 },
];

interface MaterialTemplate {
  name: string;
  description: string;
  maxQuantity: number;
  rarity: RarityTier;
  category: string;
  effect: string;
  effectValue: number;
}

const MATERIAL_TEMPLATES: MaterialTemplate[] = [
  { name: 'Dragon Hair Brush', description: 'Woven from the mane of a celestial dragon, this brush never frays.', maxQuantity: 5, rarity: 'legendary', category: 'brush', effect: 'awakenBonus', effectValue: 20 },
  { name: 'Phoenix Feather Pen', description: 'A pen made from a phoenix tail feather, igniting ink with creative fire.', maxQuantity: 5, rarity: 'epic', category: 'brush', effect: 'paintBonus', effectValue: 15 },
  { name: 'Five-Color Ink Stick', description: 'A single ink stick that produces five harmonious colors when ground.', maxQuantity: 10, rarity: 'rare', category: 'ink', effect: 'inspirationBonus', effectValue: 10 },
  { name: 'Xuan Paper', description: 'Premium rice paper from Jing County, perfect for absorbing ink.', maxQuantity: 50, rarity: 'common', category: 'paper', effect: 'paintBonus', effectValue: 3 },
  { name: 'Cinnabar Seal', description: 'A bright red seal paste used for authenticating artwork.', maxQuantity: 20, rarity: 'uncommon', category: 'seal', effect: 'sealPower', effectValue: 8 },
  { name: 'Pine Soot Ink', description: 'Traditional ink made from pine soot, rich and deep in tone.', maxQuantity: 50, rarity: 'common', category: 'ink', effect: 'inkBonus', effectValue: 5 },
  { name: 'Jade Handle Brush', description: 'A brush with a handle carved from green jade, cool to the touch.', maxQuantity: 10, rarity: 'rare', category: 'brush', effect: 'masteryBonus', effectValue: 12 },
  { name: 'Silver Tip Brush', description: 'Brush tips of pure silver that shimmer with each stroke.', maxQuantity: 8, rarity: 'rare', category: 'brush', effect: 'qualityBonus', effectValue: 10 },
  { name: 'Rice Straw Brush', description: 'A humble brush made from rice straw, beloved by folk artists.', maxQuantity: 30, rarity: 'common', category: 'brush', effect: 'paintBonus', effectValue: 2 },
  { name: 'Wolf Hair Brush', description: 'Stiff and precise, made from wolf guard hairs for sharp lines.', maxQuantity: 15, rarity: 'uncommon', category: 'brush', effect: 'precisionBonus', effectValue: 7 },
  { name: 'Goat Hair Brush', description: 'Soft and supple, perfect for flowing wash techniques.', maxQuantity: 15, rarity: 'uncommon', category: 'brush', effect: 'flowBonus', effectValue: 6 },
  { name: 'Ink Stone', description: 'A smooth stone for grinding ink, each one unique in texture.', maxQuantity: 20, rarity: 'common', category: 'tool', effect: 'inkBonus', effectValue: 3 },
  { name: 'Water Dropper', description: 'A small ceramic dropper for adding water to the ink stone.', maxQuantity: 25, rarity: 'common', category: 'tool', effect: 'efficiencyBonus', effectValue: 2 },
  { name: 'Seal Paste', description: 'Rich red paste used for stamping personal seals on artwork.', maxQuantity: 30, rarity: 'common', category: 'seal', effect: 'sealPower', effectValue: 3 },
  { name: 'Silk Thread', description: 'Fine silk thread for binding scrolls and mounting paintings.', maxQuantity: 40, rarity: 'common', category: 'material', effect: 'mountBonus', effectValue: 2 },
  { name: 'Bamboo Roller', description: 'Cylindrical bamboo rollers used to store and display scrolls.', maxQuantity: 20, rarity: 'uncommon', category: 'tool', effect: 'scrollCapacity', effectValue: 5 },
  { name: 'Ivory Knife', description: 'A precision knife for trimming paper and cutting seals.', maxQuantity: 10, rarity: 'rare', category: 'tool', effect: 'precisionBonus', effectValue: 8 },
  { name: 'Tortoise Shell Seal', description: 'A seal blank carved from tortoise shell, ancient and dignified.', maxQuantity: 8, rarity: 'rare', category: 'seal', effect: 'sealPower', effectValue: 12 },
  { name: 'Gold Leaf', description: 'Ultra-thin sheets of gold for gilding and accenting paintings.', maxQuantity: 5, rarity: 'epic', category: 'material', effect: 'reputationBonus', effectValue: 15 },
  { name: 'Vermilion Ink', description: 'A vivid red ink reserved for imperial decrees and important seals.', maxQuantity: 10, rarity: 'uncommon', category: 'ink', effect: 'sealPower', effectValue: 6 },
  { name: 'Indigo Pigment', description: 'A deep blue pigment derived from the indigo plant.', maxQuantity: 15, rarity: 'uncommon', category: 'ink', effect: 'varietyBonus', effectValue: 5 },
  { name: 'Mineral Green', description: 'A rich green pigment ground from malachite stone.', maxQuantity: 12, rarity: 'rare', category: 'ink', effect: 'varietyBonus', effectValue: 7 },
  { name: 'Azurite Blue', description: 'A brilliant blue pigment from ground azurite crystals.', maxQuantity: 12, rarity: 'rare', category: 'ink', effect: 'varietyBonus', effectValue: 7 },
  { name: 'Ocher Yellow', description: 'A warm earth-toned yellow pigment from natural clay.', maxQuantity: 15, rarity: 'common', category: 'ink', effect: 'varietyBonus', effectValue: 3 },
  { name: 'White Lead', description: 'A brilliant white pigment for highlights and clouds.', maxQuantity: 20, rarity: 'common', category: 'ink', effect: 'highlightBonus', effectValue: 2 },
  { name: 'Bone Ash', description: 'Fine white ash used in porcelain and as a painting ground.', maxQuantity: 20, rarity: 'common', category: 'material', effect: 'qualityBonus', effectValue: 2 },
  { name: 'Pine Resin', description: 'Sticky resin used to varnish and protect finished paintings.', maxQuantity: 15, rarity: 'uncommon', category: 'material', effect: 'preserveBonus', effectValue: 5 },
  { name: 'Rice Paste', description: 'A natural adhesive made from glutinous rice for mounting.', maxQuantity: 30, rarity: 'common', category: 'material', effect: 'mountBonus', effectValue: 2 },
  { name: 'Mulberry Bark Paper', description: 'Durable paper made from mulberry bark fibers.', maxQuantity: 40, rarity: 'common', category: 'paper', effect: 'paintBonus', effectValue: 2 },
  { name: 'Hemp Paper', description: 'Strong, rough-textured paper favored for bold calligraphy.', maxQuantity: 30, rarity: 'common', category: 'paper', effect: 'calligraphyBonus', effectValue: 3 },
  { name: 'Mica Powder', description: 'Shimmering mineral powder for adding sparkle to paintings.', maxQuantity: 10, rarity: 'rare', category: 'material', effect: 'qualityBonus', effectValue: 9 },
];

interface GalleryTemplate {
  name: string;
  description: string;
  maxLevel: number;
  baseReputation: number;
  baseMaxPaintings: number;
  baseUpgradeCost: number;
  theme: string;
}

const GALLERY_TEMPLATES: GalleryTemplate[] = [
  { name: 'Hall of Mountains', description: 'A soaring hall displaying mountain landscapes of breathtaking grandeur.', maxLevel: 10, baseReputation: 5, baseMaxPaintings: 5, baseUpgradeCost: 40, theme: 'mountain' },
  { name: 'Waterfall Gallery', description: 'The sound of painted waterfalls fills this cool, misty gallery space.', maxLevel: 10, baseReputation: 6, baseMaxPaintings: 5, baseUpgradeCost: 45, theme: 'water' },
  { name: 'Bamboo Pavilion', description: 'An open-air pavilion surrounded by living bamboo and ink paintings.', maxLevel: 10, baseReputation: 4, baseMaxPaintings: 4, baseUpgradeCost: 35, theme: 'bamboo' },
  { name: 'River Bend Hall', description: 'Paintings of meandering rivers and lakeside scenes adorn these walls.', maxLevel: 10, baseReputation: 5, baseMaxPaintings: 5, baseUpgradeCost: 40, theme: 'river' },
  { name: 'Misty Peak Gallery', description: 'High-altitude gallery where fog paintings seem to come alive.', maxLevel: 10, baseReputation: 7, baseMaxPaintings: 6, baseUpgradeCost: 50, theme: 'mist' },
  { name: 'Pine Forest Hall', description: 'Dark timbers and pine resin scent complement the forest paintings.', maxLevel: 10, baseReputation: 5, baseMaxPaintings: 5, baseUpgradeCost: 42, theme: 'forest' },
  { name: 'Moonlit Courtyard', description: 'An open courtyard where paintings glow under the silver moon.', maxLevel: 10, baseReputation: 8, baseMaxPaintings: 6, baseUpgradeCost: 55, theme: 'moon' },
  { name: 'Dragon Gate Gallery', description: 'The legendary gallery where the Dragon Gate painting resides.', maxLevel: 10, baseReputation: 10, baseMaxPaintings: 8, baseUpgradeCost: 70, theme: 'dragon' },
  { name: 'Phoenix Nest Hall', description: 'Warm and radiant, displaying paintings of fire and rebirth.', maxLevel: 10, baseReputation: 9, baseMaxPaintings: 7, baseUpgradeCost: 65, theme: 'fire' },
  { name: 'Celestial River Gallery', description: 'A gallery mirroring the Milky Way, filled with starlit landscapes.', maxLevel: 10, baseReputation: 12, baseMaxPaintings: 8, baseUpgradeCost: 80, theme: 'celestial' },
  { name: 'Ink Wash Pavilion', description: 'A minimalist space celebrating the beauty of monochrome ink wash.', maxLevel: 10, baseReputation: 6, baseMaxPaintings: 5, baseUpgradeCost: 48, theme: 'ink' },
  { name: 'Stone Garden Hall', description: 'Paintings of scholar\'s rocks and zen gardens in contemplative stillness.', maxLevel: 10, baseReputation: 5, baseMaxPaintings: 4, baseUpgradeCost: 38, theme: 'stone' },
  { name: 'Cherry Blossom Gallery', description: 'Delicate pink and white paintings fill this springtime gallery.', maxLevel: 10, baseReputation: 7, baseMaxPaintings: 6, baseUpgradeCost: 52, theme: 'blossom' },
  { name: 'Lotus Pond Hall', description: 'Serene paintings of lotus flowers floating on misty ponds.', maxLevel: 10, baseReputation: 6, baseMaxPaintings: 5, baseUpgradeCost: 44, theme: 'lotus' },
  { name: 'Snow Peak Gallery', description: 'A cool gallery displaying winter mountain scenes in white ink.', maxLevel: 10, baseReputation: 8, baseMaxPaintings: 6, baseUpgradeCost: 56, theme: 'snow' },
  { name: 'Autumn Maple Hall', description: 'Paintings ablaze with the red and gold of autumn forests.', maxLevel: 10, baseReputation: 7, baseMaxPaintings: 6, baseUpgradeCost: 50, theme: 'autumn' },
  { name: 'Spring Rain Gallery', description: 'Soft paintings capturing the gentle moods of spring rain showers.', maxLevel: 10, baseReputation: 6, baseMaxPaintings: 5, baseUpgradeCost: 46, theme: 'spring' },
  { name: 'Thunder Valley Hall', description: 'Dramatic paintings of lightning, storms, and raw natural power.', maxLevel: 10, baseReputation: 9, baseMaxPaintings: 7, baseUpgradeCost: 62, theme: 'thunder' },
  { name: 'Ocean Wave Gallery', description: 'The crash of painted waves seems to echo through this gallery.', maxLevel: 10, baseReputation: 8, baseMaxPaintings: 6, baseUpgradeCost: 58, theme: 'ocean' },
  { name: 'Desert Mirage Hall', description: 'Paintings of vast deserts and shimmering mirages under endless sky.', maxLevel: 10, baseReputation: 7, baseMaxPaintings: 5, baseUpgradeCost: 52, theme: 'desert' },
  { name: 'Jade Cave Gallery', description: 'A subterranean gallery with walls of painted jade and crystal.', maxLevel: 10, baseReputation: 10, baseMaxPaintings: 7, baseUpgradeCost: 72, theme: 'jade' },
  { name: 'Golden Dawn Hall', description: 'A gallery bathed in warm light, showing sunrise and dawn paintings.', maxLevel: 10, baseReputation: 8, baseMaxPaintings: 6, baseUpgradeCost: 55, theme: 'gold' },
  { name: 'Twilight Shadow Gallery', description: 'A dim gallery where paintings of dusk and shadows come alive.', maxLevel: 10, baseReputation: 9, baseMaxPaintings: 7, baseUpgradeCost: 64, theme: 'shadow' },
  { name: 'Starlight Observatory', description: 'A domed gallery showing celestial paintings under painted stars.', maxLevel: 10, baseReputation: 11, baseMaxPaintings: 8, baseUpgradeCost: 78, theme: 'star' },
  { name: 'Eternal Ink Hall', description: 'The final and greatest gallery, holding the dynasty\'s masterworks.', maxLevel: 10, baseReputation: 15, baseMaxPaintings: 10, baseUpgradeCost: 100, theme: 'eternal' },
];

interface AbilityTemplate {
  name: string;
  description: string;
  cooldown: number;
  inkCost: number;
  powerMultiplier: number;
  element: string;
  tier: number;
}

const ABILITY_TEMPLATES: AbilityTemplate[] = [
  { name: 'Ink Wash Technique', description: 'Apply a broad ink wash that boosts all spirit loyalty by 10%.', cooldown: 3, inkCost: 15, powerMultiplier: 1.1, element: 'water', tier: 1 },
  { name: 'Brush Stroke Fury', description: 'Unleash a rapid series of brush strokes, doubling paint output for one session.', cooldown: 5, inkCost: 25, powerMultiplier: 2.0, element: 'earth', tier: 1 },
  { name: 'Seal of Power', description: 'Stamp your personal seal, boosting reputation gain by 20%.', cooldown: 4, inkCost: 20, powerMultiplier: 1.2, element: 'fire', tier: 1 },
  { name: 'Scroll Unfurl', description: 'Unfurl an ancient scroll that reveals a hidden painting technique.', cooldown: 6, inkCost: 30, powerMultiplier: 1.5, element: 'wind', tier: 2 },
  { name: 'Color Bleed', description: 'Allow colors to bleed and blend, creating unique hybrid paintings worth extra ink.', cooldown: 4, inkCost: 18, powerMultiplier: 1.3, element: 'water', tier: 2 },
  { name: 'Mist Veil', description: 'Shroud the gallery in mist, protecting reputation from decay for one cycle.', cooldown: 8, inkCost: 35, powerMultiplier: 1.0, element: 'wind', tier: 2 },
  { name: 'Mountain Call', description: 'Channel the stability of mountains, preventing ink loss for the next action.', cooldown: 5, inkCost: 22, powerMultiplier: 1.0, element: 'earth', tier: 2 },
  { name: 'River Flow', description: 'Invoke the endless flow of a great river, regenerating ink over time.', cooldown: 3, inkCost: 10, powerMultiplier: 1.0, element: 'water', tier: 1 },
  { name: 'Bamboo Defense', description: 'Draw upon bamboo resilience to halve the next spirit awakening cost.', cooldown: 7, inkCost: 28, powerMultiplier: 1.0, element: 'wood', tier: 3 },
  { name: 'Plum Blossom Strike', description: 'A precise strike that awakens a random common spirit for free.', cooldown: 10, inkCost: 40, powerMultiplier: 1.0, element: 'wood', tier: 3 },
  { name: 'Dragon\'s Breath Ink', description: 'Breathe life into ink with dragon fire, instantly completing a masterpiece.', cooldown: 12, inkCost: 50, powerMultiplier: 3.0, element: 'fire', tier: 4 },
  { name: 'Phoenix Feather Shield', description: 'Wrap the dynasty in phoenix feathers, granting double inspiration for a day.', cooldown: 10, inkCost: 45, powerMultiplier: 2.0, element: 'fire', tier: 4 },
  { name: 'Tiger\'s Roar Brush', description: 'Paint with tiger-like ferocity, boosting brush mastery gain by 50%.', cooldown: 6, inkCost: 30, powerMultiplier: 1.5, element: 'earth', tier: 3 },
  { name: 'Crane\'s Grace', description: 'Move with crane-like elegance, reducing all cooldowns by 1 turn.', cooldown: 8, inkCost: 35, powerMultiplier: 1.0, element: 'wind', tier: 4 },
  { name: 'Jade Armor', description: 'Harden your resolve like jade, making the next upgrade cost nothing.', cooldown: 15, inkCost: 60, powerMultiplier: 1.0, element: 'earth', tier: 5 },
  { name: 'Thunder Strike', description: 'Call down thunder to boost a random gallery by 2 levels instantly.', cooldown: 14, inkCost: 55, powerMultiplier: 2.0, element: 'wind', tier: 5 },
  { name: 'Frost Touch', description: 'Touch a spirit with frost, freezing its loyalty decay permanently.', cooldown: 9, inkCost: 32, powerMultiplier: 1.0, element: 'water', tier: 3 },
  { name: 'Ink Clone', description: 'Create a clone spirit of your strongest awakened ink spirit.', cooldown: 11, inkCost: 42, powerMultiplier: 1.8, element: 'water', tier: 4 },
  { name: 'Spirit Binding', description: 'Bind an awakened spirit permanently, maximizing its loyalty to 100.', cooldown: 13, inkCost: 48, powerMultiplier: 1.0, element: 'fire', tier: 5 },
  { name: 'Celestial Insight', description: 'Gain divine inspiration, revealing the optimal next action to take.', cooldown: 7, inkCost: 25, powerMultiplier: 1.0, element: 'wind', tier: 3 },
  { name: 'Void Escape', description: 'Slip into the void, resetting all cooldowns but losing some ink.', cooldown: 20, inkCost: 80, powerMultiplier: 1.0, element: 'wind', tier: 5 },
  { name: 'Dao Harmony', description: 'Achieve perfect harmony with the Dao, boosting all stats by 10% for a cycle.', cooldown: 25, inkCost: 100, powerMultiplier: 1.1, element: 'earth', tier: 5 },
];

interface AchievementTemplate {
  name: string;
  description: string;
  target: number;
  rewardType: string;
  rewardValue: number;
  icon: string;
}

const ACHIEVEMENT_TEMPLATES: AchievementTemplate[] = [
  { name: 'First Brush Stroke', description: 'Create your very first painting in the dynasty.', target: 1, rewardType: 'ink', rewardValue: 20, icon: '🖌️' },
  { name: 'Spirit Awakener', description: 'Awaken your first ink spirit from the scroll.', target: 1, rewardType: 'inspiration', rewardValue: 30, icon: '👁️' },
  { name: 'Studio Builder', description: 'Unlock your first painting studio.', target: 1, rewardType: 'ink', rewardValue: 15, icon: '🏗️' },
  { name: 'Ink Grinder', description: 'Grind ink 50 times to build a sufficient supply.', target: 50, rewardType: 'ink', rewardValue: 50, icon: '⚙️' },
  { name: 'Seal Carver', description: 'Carve 10 personal seals for authentication.', target: 10, rewardType: 'reputation', rewardValue: 100, icon: '🔖' },
  { name: 'Scroll Master', description: 'Mount 25 scrolls for the dynasty collection.', target: 25, rewardType: 'inspiration', rewardValue: 50, icon: '📜' },
  { name: 'Gallery Curator', description: 'Upgrade any gallery to its maximum level.', target: 10, rewardType: 'reputation', rewardValue: 200, icon: '🏛️' },
  { name: 'Ink Scholar', description: 'Collect at least 5 different ink/calligraphy materials.', target: 5, rewardType: 'ink', rewardValue: 30, icon: '📚' },
  { name: 'Master Painter', description: 'Create 100 paintings across all galleries.', target: 100, rewardType: 'brushMastery', rewardValue: 500, icon: '🎨' },
  { name: 'Spirit Collector', description: 'Awaken 10 different ink spirits.', target: 10, rewardType: 'inspiration', rewardValue: 100, icon: '🐉' },
  { name: 'Dynasty Founder', description: 'Unlock all 8 painting studios.', target: 8, rewardType: 'reputation', rewardValue: 500, icon: '🏯' },
  { name: 'Brush Virtuoso', description: 'Reach brush mastery level 5000.', target: 5000, rewardType: 'title', rewardValue: 1, icon: '✒️' },
  { name: 'Ink Legend', description: 'Awaken a legendary tier ink spirit.', target: 1, rewardType: 'ink', rewardValue: 100, icon: '🌟' },
  { name: 'Celestial Artist', description: 'Reach dynasty reputation of 5000.', target: 5000, rewardType: 'title', rewardValue: 1, icon: '⭐' },
  { name: 'Phoenix Bearer', description: 'Awaken the Phoenix of Ink spirit.', target: 1, rewardType: 'inspiration', rewardValue: 200, icon: '🔥' },
  { name: 'Dragon Tamer', description: 'Awaken the Ink Dragon God spirit.', target: 1, rewardType: 'ink', rewardValue: 200, icon: '🐲' },
  { name: 'Sage of Ink', description: 'Awaken all 7 legendary ink spirits.', target: 7, rewardType: 'title', rewardValue: 1, icon: '🧙' },
  { name: 'Eternal Dynasty', description: 'Complete all achievements and become a true dynasty master.', target: 17, rewardType: 'ink', rewardValue: 500, icon: '👑' },
];

const TITLE_NAMES = [
  'Ink Apprentice',
  'Brush Student',
  'Journeyman Painter',
  'Master Calligrapher',
  'Ink Scholar',
  'Studio Master',
  'Imperial Painter',
  'Sage of the Eternal Brush',
];

const TITLE_THRESHOLDS = [0, 100, 500, 1500, 3000, 5000, 7500, 10000];

// ─── The Main Hook ──────────────────────────────────────────────────────────

export default function useInkDynasty() {
  // ── State ────────────────────────────────────────────────────────────────
  const [inkSpirits, setInkSpirits] = useState<InkSpirit[]>([]);
  const [studios, setStudios] = useState<Studio[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [abilities, setAbilities] = useState<Ability[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentStudio, setCurrentStudio] = useState<number>(0);
  const [inkSupply, setInkSupply] = useState<number>(100);
  const [inspiration, setInspiration] = useState<number>(50);
  const [brushMastery, setBrushMastery] = useState<number>(0);
  const [paintingsCreated, setPaintingsCreated] = useState<number>(0);
  const [spiritsAwakened, setSpiritsAwakened] = useState<number>(0);
  const [titleIndex, setTitleIndex] = useState<number>(0);
  const [dynastyReputation, setDynastyReputation] = useState<number>(0);
  const [dailyMasterpiece, setDailyMasterpiece] = useState<DailyMasterpiece | null>(null);
  const [totalGrinds, setTotalGrinds] = useState<number>(0);
  const [totalSeals, setTotalSeals] = useState<number>(0);
  const [totalScrolls, setTotalScrolls] = useState<number>(0);
  const [totalExhibits, setTotalExhibits] = useState<number>(0);
  const [totalInspirations, setTotalInspirations] = useState<number>(0);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const stateRef = useRef({
    inkSpirits, studios, materials, galleries, abilities, achievements,
    currentStudio, inkSupply, inspiration, brushMastery, paintingsCreated,
    spiritsAwakened, titleIndex, dynastyReputation, dailyMasterpiece,
    totalGrinds, totalSeals, totalScrolls, totalExhibits, totalInspirations,
  });

  // Sync state to ref inside useEffect
  useEffect(() => {
    stateRef.current = {
      inkSpirits, studios, materials, galleries, abilities, achievements,
      currentStudio, inkSupply, inspiration, brushMastery, paintingsCreated,
      spiritsAwakened, titleIndex, dynastyReputation, dailyMasterpiece,
      totalGrinds, totalSeals, totalScrolls, totalExhibits, totalInspirations,
    };
  }, [inkSpirits, studios, materials, galleries, abilities, achievements,
    currentStudio, inkSupply, inspiration, brushMastery, paintingsCreated,
    spiritsAwakened, titleIndex, dynastyReputation, dailyMasterpiece,
    totalGrinds, totalSeals, totalScrolls, totalExhibits, totalInspirations]);

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Helper: add log entry ────────────────────────────────────────────────
  const appendLog = useCallback((message: string, type: LogEntry['type']) => {
    setLog(prev => [...prev.slice(-99), { timestamp: Date.now(), message, type }]);
  }, []);

  // ── Initialization ───────────────────────────────────────────────────────
  useEffect(() => {
    if (initialized) return;

    const initSpirits: InkSpirit[] = INK_SPIRIT_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      rarity: t.rarity,
      power: t.power,
      awakened: false,
      loyalty: 0,
      element: t.element,
      quote: t.quote,
      paintCost: t.paintCost,
      awakenedAt: null,
    }));

    const initStudios: Studio[] = STUDIO_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      level: 0,
      maxLevel: t.maxLevel,
      unlocked: i === 0,
      bonusType: t.bonusType,
      bonusValue: 0,
      upgradeCost: t.baseUpgradeCost,
    }));

    const initMaterials: Material[] = MATERIAL_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      quantity: 0,
      maxQuantity: t.maxQuantity,
      rarity: t.rarity,
      category: t.category,
      effect: t.effect,
      effectValue: t.effectValue,
    }));

    const initGalleries: Gallery[] = GALLERY_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      level: i === 0 ? 1 : 0,
      maxLevel: t.maxLevel,
      reputationBonus: i === 0 ? t.baseReputation : 0,
      paintings: 0,
      maxPaintings: i === 0 ? t.baseMaxPaintings : 0,
      upgradeCost: t.baseUpgradeCost,
      theme: t.theme,
    }));

    const initAbilities: Ability[] = ABILITY_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      cooldown: t.cooldown,
      currentCooldown: 0,
      unlocked: i < 3,
      inkCost: t.inkCost,
      powerMultiplier: t.powerMultiplier,
      element: t.element,
      tier: t.tier,
    }));

    const initAchievements: Achievement[] = ACHIEVEMENT_TEMPLATES.map((t, i) => ({
      id: i,
      name: t.name,
      description: t.description,
      target: t.target,
      progress: 0,
      completed: false,
      rewardType: t.rewardType,
      rewardValue: t.rewardValue,
      icon: t.icon,
      unlockedAt: null,
    }));

    setInkSpirits(initSpirits);
    setStudios(initStudios);
    setMaterials(initMaterials);
    setGalleries(initGalleries);
    setAbilities(initAbilities);
    setAchievements(initAchievements);
    setInitialized(true);

    appendLog('The Ink Dynasty awakens. Your journey as a master painter begins.', 'awaken');
  }, [initialized, appendLog]);

  // ── Daily Masterpiece Generator ──────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;

    const now = Date.now();
    const lastDM = dailyMasterpiece;
    if (lastDM && now < lastDM.expiresAt) return;

    const randomSpiritId = Math.floor(Math.random() * IX_SPIRIT_COUNT);
    const elements = ['water', 'fire', 'earth', 'wind', 'wood'];
    const bonusElement = elements[Math.floor(Math.random() * elements.length)];
    const challenges = [
      'Paint a landscape using only three brush strokes',
      'Capture the essence of moonlight on still water',
      'Create a spirit portrait from pure imagination',
      'Compose a calligraphy poem about the passage of time',
      'Paint the meeting of heaven and earth at dawn',
      'Depict the sound of wind through bamboo in ink',
      'Illustrate the legend of the Dragon Gate',
      'Paint a self-portrait as an ink spirit',
      'Create an abstract ink wash expressing joy',
      'Compose the character for "Eternity" in ten styles',
    ];

    setDailyMasterpiece({
      spiritId: randomSpiritId,
      challenge: challenges[Math.floor(Math.random() * challenges.length)],
      reward: 20 + Math.floor(Math.random() * 30),
      completed: false,
      expiresAt: now + IX_DAILY_MASTERPIECE_DURATION,
      bonusElement,
    });
  }, [initialized, dailyMasterpiece]);

  // ── Passive Regeneration Tick ────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) return;

    tickRef.current = setInterval(() => {
      setInkSupply(prev => Math.min(prev + IX_INK_REGEN_RATE, IX_MAX_INK));
      setInspiration(prev => Math.min(prev + IX_INSPIRATION_REGEN_RATE, IX_MAX_INSPIRATION));

      setAbilities(prev => prev.map(a => {
        if (a.currentCooldown > 0) {
          return { ...a, currentCooldown: a.currentCooldown - 1 };
        }
        return a;
      }));
    }, 5000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [initialized]);

  // ── Auto Title Calculation ───────────────────────────────────────────────
  useEffect(() => {
    let newIndex = 0;
    for (let i = TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
      if (dynastyReputation >= TITLE_THRESHOLDS[i]) {
        newIndex = i;
        break;
      }
    }
    if (newIndex !== titleIndex) {
      setTitleIndex(newIndex);
      appendLog(`Title advanced to: ${TITLE_NAMES[newIndex]}`, 'title');
    }
  }, [dynastyReputation, titleIndex, appendLog]);

  // ── Computed Values (useMemo) ────────────────────────────────────────────
  const awakenedSpirits = useMemo(() => {
    return inkSpirits.filter(s => s.awakened);
  }, [inkSpirits]);

  const activeStudio = useMemo(() => {
    return studios[currentStudio] || studios[0];
  }, [studios, currentStudio]);

  const totalGalleryReputation = useMemo(() => {
    return galleries.reduce((sum, g) => sum + g.reputationBonus, 0);
  }, [galleries]);

  const totalSpiritPower = useMemo(() => {
    return awakenedSpirits.reduce((sum, s) => sum + s.power * (1 + s.loyalty / 100), 0);
  }, [awakenedSpirits]);

  const unlockedAbilityCount = useMemo(() => {
    return abilities.filter(a => a.unlocked).length;
  }, [abilities]);

  const completedAchievementCount = useMemo(() => {
    return achievements.filter(a => a.completed).length;
  }, [achievements]);

  const collectedMaterialCount = useMemo(() => {
    return materials.filter(m => m.quantity > 0).length;
  }, [materials]);

  const highestGalleryLevel = useMemo(() => {
    return Math.max(0, ...galleries.map(g => g.level));
  }, [galleries]);

  const maxedGalleryCount = useMemo(() => {
    return galleries.filter(g => g.level >= g.maxLevel).length;
  }, [galleries]);

  const legendaryAwakenedCount = useMemo(() => {
    return inkSpirits.filter(s => s.awakened && s.rarity === 'legendary').length;
  }, [inkSpirits]);

  const rarestAwakenedRarity = useMemo(() => {
    const order: RarityTier[] = ['legendary', 'epic', 'rare', 'uncommon', 'common'];
    for (const r of order) {
      if (inkSpirits.some(s => s.awakened && s.rarity === r)) return r;
    }
    return 'common';
  }, [inkSpirits]);

  const availableMaterials = useMemo(() => {
    return materials.filter(m => m.quantity > 0);
  }, [materials]);

  const spiritRarityBreakdown = useMemo(() => {
    const counts: Record<RarityTier, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    awakenedSpirits.forEach(s => { counts[s.rarity]++; });
    return counts;
  }, [awakenedSpirits]);

  const studioSummary = useMemo(() => {
    return studios.map(s => ({
      id: s.id,
      name: s.name,
      level: s.level,
      unlocked: s.unlocked,
      bonusType: s.bonusType,
      bonusValue: s.bonusValue,
    }));
  }, [studios]);

  const galleryRankings = useMemo(() => {
    return [...galleries]
      .sort((a, b) => b.level - a.level)
      .map(g => ({
        id: g.id,
        name: g.name,
        level: g.level,
        paintings: g.paintings,
        reputationBonus: g.reputationBonus,
      }));
  }, [galleries]);

  // ── Action: Awaken Spirit ────────────────────────────────────────────────
  const awakenSpirit = useCallback((spiritId: number) => {
    setInkSpirits(prev => {
      const spirit = prev.find(s => s.id === spiritId);
      if (!spirit || spirit.awakened) return prev;

      const cost = spirit.paintCost;
      if (stateRef.current.inkSupply < cost) return prev;

      setInkSupply(p => Math.max(0, p - cost));
      setSpiritsAwakened(p => p + 1);
      setBrushMastery(p => Math.min(p + spirit.power, IX_MAX_BRUSH_MASTERY));

      const updated = prev.map(s =>
        s.id === spiritId
          ? { ...s, awakened: true, loyalty: 50, awakenedAt: Date.now() }
          : s
      );

      appendLog(`Spirit awakened: ${spirit.name} (${IX_RARITY_NAMES[spirit.rarity]})`, 'awaken');
      return updated;
    });
  }, [appendLog]);

  // ── Action: Paint Masterpiece ────────────────────────────────────────────
  const paintMasterpiece = useCallback((galleryId: number, spiritId: number | null) => {
    const currentInk = stateRef.current.inkSupply;
    const currentInsp = stateRef.current.inspiration;
    if (currentInk < IX_BASE_PAINT_COST || currentInsp < 10) return false;

    setInkSupply(p => Math.max(0, p - IX_BASE_PAINT_COST));
    setInspiration(p => Math.max(0, p - 10));
    setPaintingsCreated(p => p + 1);
    setBrushMastery(p => Math.min(p + 15, IX_MAX_BRUSH_MASTERY));

    const spiritBonus = spiritId !== null
      ? stateRef.current.inkSpirits.find(s => s.id === spiritId)
      : null;
    const repGain = 5 + (spiritBonus && spiritBonus.awakened ? Math.floor(spiritBonus.power / 10) : 0);

    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));
    setGalleries(prev => prev.map(g =>
      g.id === galleryId
        ? { ...g, paintings: Math.min(g.paintings + 1, g.maxPaintings) }
        : g
    ));

    if (spiritBonus && spiritBonus.awakened) {
      setInkSpirits(prev => prev.map(s =>
        s.id === spiritId ? { ...s, loyalty: Math.min(s.loyalty + 2, 100) } : s
      ));
    }

    const spiritName = spiritBonus ? spiritBonus.name : 'freehand';
    appendLog(`Masterpiece painted in gallery #${galleryId} using ${spiritName}: +${repGain} rep`, 'paint');
    return true;
  }, [appendLog]);

  // ── Action: Upgrade Gallery ──────────────────────────────────────────────
  const upgradeGallery = useCallback((galleryId: number) => {
    setGalleries(prev => {
      const gallery = prev.find(g => g.id === galleryId);
      if (!gallery || gallery.level >= gallery.maxLevel) return prev;

      const template = GALLERY_TEMPLATES[galleryId];
      const cost = Math.floor(template.baseUpgradeCost * (gallery.level + 1) * 1.5);

      if (stateRef.current.inkSupply < cost) return prev;

      setInkSupply(p => Math.max(0, p - cost));

      const newLevel = gallery.level + 1;
      const newRepBonus = Math.floor(template.baseReputation * newLevel * 1.2);
      const newMaxPaintings = template.baseMaxPaintings + Math.floor(newLevel * 2);

      const updated = prev.map(g =>
        g.id === galleryId
          ? {
              ...g,
              level: newLevel,
              reputationBonus: newRepBonus,
              maxPaintings: newMaxPaintings,
            }
          : g
      );

      appendLog(`Gallery upgraded: ${gallery.name} to level ${newLevel}`, 'upgrade');
      return updated;
    });
  }, [appendLog]);

  // ── Action: Activate Ability ─────────────────────────────────────────────
  const activateAbility = useCallback((abilityId: number) => {
    setAbilities(prev => {
      const ability = prev.find(a => a.id === abilityId);
      if (!ability || !ability.unlocked || ability.currentCooldown > 0) return prev;
      if (stateRef.current.inkSupply < ability.inkCost) return prev;

      setInkSupply(p => Math.max(0, p - ability.inkCost));

      const updated = prev.map(a =>
        a.id === abilityId
          ? { ...a, currentCooldown: a.cooldown }
          : a
      );

      appendLog(`Ability activated: ${ability.name} (${ability.element})`, 'ability');

      if (ability.name === 'River Flow') {
        setInkSupply(p => Math.min(p + 30, IX_MAX_INK));
        appendLog('River Flow restored 30 ink.', 'ability');
      }
      if (ability.name === 'Tiger\'s Roar Brush') {
        setBrushMastery(p => Math.min(p + 50, IX_MAX_BRUSH_MASTERY));
        appendLog('Tiger\'s Roar Brush added 50 brush mastery.', 'ability');
      }
      if (ability.name === 'Phoenix Feather Shield') {
        setInspiration(p => Math.min(p + 40, IX_MAX_INSPIRATION));
        appendLog('Phoenix Feather Shield doubled inspiration gain.', 'ability');
      }
      if (ability.name === 'Brush Stroke Fury') {
        setInkSupply(p => Math.min(p + 10, IX_MAX_INK));
        appendLog('Brush Stroke Fury: paint output doubled for this session.', 'ability');
      }

      return updated;
    });
  }, [appendLog]);

  // ── Action: Grind Ink ────────────────────────────────────────────────────
  const grindInk = useCallback(() => {
    if (stateRef.current.inspiration < 5) return false;

    setInspiration(p => Math.max(0, p - 5));

    const studioBonus = stateRef.current.studios.find(s => s.id === stateRef.current.currentStudio);
    const bonus = studioBonus && studioBonus.unlocked ? Math.floor(studioBonus.bonusValue * 1.2) : 0;
    const inkGain = 8 + bonus + Math.floor(Math.random() * 5);

    setInkSupply(p => Math.min(p + inkGain, IX_MAX_INK));
    setTotalGrinds(p => p + 1);
    setBrushMastery(p => Math.min(p + 2, IX_MAX_BRUSH_MASTERY));

    appendLog(`Ink ground: +${inkGain} ink (studio bonus: ${bonus})`, 'grind');
    return true;
  }, [appendLog]);

  // ── Action: Carve Seal ───────────────────────────────────────────────────
  const carveSeal = useCallback(() => {
    if (stateRef.current.inkSupply < 10) return false;

    setInkSupply(p => Math.max(0, p - 10));
    setTotalSeals(p => p + 1);
    setBrushMastery(p => Math.min(p + 8, IX_MAX_BRUSH_MASTERY));

    const repGain = 10 + Math.floor(Math.random() * 5);
    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));

    appendLog(`Seal carved: +${repGain} reputation`, 'seal');
    return true;
  }, [appendLog]);

  // ── Action: Mount Scroll ─────────────────────────────────────────────────
  const mountScroll = useCallback(() => {
    if (stateRef.current.inkSupply < 12 || stateRef.current.inspiration < 8) return false;

    setInkSupply(p => Math.max(0, p - 12));
    setInspiration(p => Math.max(0, p - 8));
    setTotalScrolls(p => p + 1);
    setBrushMastery(p => Math.min(p + 10, IX_MAX_BRUSH_MASTERY));
    setPaintingsCreated(p => p + 1);

    const repGain = 15 + Math.floor(Math.random() * 10);
    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));

    appendLog(`Scroll mounted: +${repGain} reputation`, 'scroll');
    return true;
  }, [appendLog]);

  // ── Action: Exhibit Painting ─────────────────────────────────────────────
  const exhibitPainting = useCallback((galleryId: number) => {
    const gallery = stateRef.current.galleries.find(g => g.id === galleryId);
    if (!gallery || gallery.paintings >= gallery.maxPaintings) return false;

    if (stateRef.current.inkSupply < 8) return false;

    setInkSupply(p => Math.max(0, p - 8));
    setTotalExhibits(p => p + 1);

    const repGain = gallery.reputationBonus + Math.floor(Math.random() * 5) + 3;
    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));
    setGalleries(prev => prev.map(g =>
      g.id === galleryId
        ? { ...g, paintings: Math.min(g.paintings + 1, g.maxPaintings) }
        : g
    ));

    appendLog(`Painting exhibited in ${gallery.name}: +${repGain} reputation`, 'exhibit');
    return true;
  }, [appendLog]);

  // ── Action: Inspire Muse ─────────────────────────────────────────────────
  const inspireMuse = useCallback(() => {
    if (stateRef.current.inspiration >= IX_MAX_INSPIRATION - 10) return false;

    const inspGain = 15 + Math.floor(Math.random() * 10);
    const studioBonus = stateRef.current.studios.find(s => s.id === stateRef.current.currentStudio);
    const meditationBonus = studioBonus && studioBonus.unlocked && studioBonus.bonusType === 'inspirationRegen'
      ? Math.floor(studioBonus.bonusValue * 1.5)
      : 0;

    setInspiration(p => Math.min(p + inspGain + meditationBonus, IX_MAX_INSPIRATION));
    setTotalInspirations(p => p + 1);

    appendLog(`Muse inspired: +${inspGain + meditationBonus} inspiration`, 'inspire');
    return true;
  }, [appendLog]);

  // ── Action: Select Studio ────────────────────────────────────────────────
  const selectStudio = useCallback((studioId: number) => {
    const studio = stateRef.current.studios.find(s => s.id === studioId);
    if (!studio || !studio.unlocked) return;

    setCurrentStudio(studioId);
    appendLog(`Studio selected: ${studio.name} (Lv.${studio.level})`, 'awaken');
  }, [appendLog]);

  // ── Action: Upgrade Studio ───────────────────────────────────────────────
  const upgradeStudio = useCallback((studioId: number) => {
    setStudios(prev => {
      const studio = prev.find(s => s.id === studioId);
      if (!studio || !studio.unlocked || studio.level >= studio.maxLevel) return prev;

      const template = STUDIO_TEMPLATES[studioId];
      const cost = Math.floor(template.baseUpgradeCost * (studio.level + 1) * 1.3);

      if (stateRef.current.inkSupply < cost) return prev;

      setInkSupply(p => Math.max(0, p - cost));

      const newLevel = studio.level + 1;
      const newBonus = Math.floor(template.baseBonusValue * newLevel * 1.1);

      const updated = prev.map(s =>
        s.id === studioId
          ? { ...s, level: newLevel, bonusValue: newBonus }
          : s
      );

      appendLog(`Studio upgraded: ${studio.name} to level ${newLevel} (+${newBonus} ${studio.bonusType})`, 'upgrade');
      return updated;
    });
  }, [appendLog]);

  // ── Action: Unlock Studio ────────────────────────────────────────────────
  const unlockStudio = useCallback((studioId: number) => {
    setStudios(prev => {
      const studio = prev.find(s => s.id === studioId);
      if (!studio || studio.unlocked) return prev;

      const unlockCost = 50 + studioId * 25;
      if (stateRef.current.dynastyReputation < unlockCost) return prev;

      setDynastyReputation(p => Math.max(0, p - unlockCost));

      const updated = prev.map(s =>
        s.id === studioId ? { ...s, unlocked: true, level: 1 } : s
      );

      appendLog(`Studio unlocked: ${studio.name} (-${unlockCost} reputation)`, 'upgrade');
      return updated;
    });
  }, [appendLog]);

  // ── Action: Unlock Ability ───────────────────────────────────────────────
  const unlockAbility = useCallback((abilityId: number) => {
    setAbilities(prev => {
      const ability = prev.find(a => a.id === abilityId);
      if (!ability || ability.unlocked) return prev;

      const unlockCost = 20 + ability.tier * 15;
      if (stateRef.current.brushMastery < unlockCost) return prev;

      setBrushMastery(p => Math.max(0, p - unlockCost));

      const updated = prev.map(a =>
        a.id === abilityId ? { ...a, unlocked: true } : a
      );

      appendLog(`Ability unlocked: ${ability.name} (-${unlockCost} mastery)`, 'ability');
      return updated;
    });
  }, [appendLog]);

  // ── Action: Add Material ─────────────────────────────────────────────────
  const addMaterial = useCallback((materialId: number, amount: number) => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      const newQty = Math.min(m.quantity + amount, m.maxQuantity);
      return { ...m, quantity: newQty };
    }));
    appendLog(`Material acquired: ${MATERIAL_TEMPLATES[materialId].name} x${amount}`, 'awaken');
  }, [appendLog]);

  // ── Action: Consume Material ─────────────────────────────────────────────
  const consumeMaterial = useCallback((materialId: number, amount: number): boolean => {
    let success = false;
    setMaterials(prev => prev.map(m => {
      if (m.id !== materialId) return m;
      if (m.quantity < amount) return m;
      success = true;
      return { ...m, quantity: m.quantity - amount };
    }));
    return success;
  }, []);

  // ── Action: Complete Daily Masterpiece ───────────────────────────────────
  const completeDailyMasterpiece = useCallback(() => {
    if (!stateRef.current.dailyMasterpiece || stateRef.current.dailyMasterpiece.completed) return false;

    setDailyMasterpiece(prev => prev ? { ...prev, completed: true } : null);
    const reward = stateRef.current.dailyMasterpiece.reward;
    setInkSupply(p => Math.min(p + reward, IX_MAX_INK));
    setInspiration(p => Math.min(p + Math.floor(reward / 2), IX_MAX_INSPIRATION));
    setBrushMastery(p => Math.min(p + reward, IX_MAX_BRUSH_MASTERY));

    appendLog(`Daily masterpiece completed! Reward: +${reward} ink, +${Math.floor(reward / 2)} inspiration`, 'paint');
    return true;
  }, [appendLog]);

  // ── Action: Boost Spirit Loyalty ─────────────────────────────────────────
  const boostSpiritLoyalty = useCallback((spiritId: number, amount: number) => {
    setInkSpirits(prev => prev.map(s => {
      if (s.id !== spiritId || !s.awakened) return s;
      return { ...s, loyalty: Math.min(s.loyalty + amount, 100) };
    }));
  }, []);

  // ── Achievement Checking ─────────────────────────────────────────────────
  const checkAchievements = useCallback(() => {
    const st = stateRef.current;

    const progressMap: Record<number, number> = {
      0: st.paintingsCreated,
      1: st.spiritsAwakened,
      2: st.studios.filter(s => s.unlocked).length,
      3: st.totalGrinds,
      4: st.totalSeals,
      5: st.totalScrolls,
      6: maxedGalleryCount,
      7: collectedMaterialCount,
      8: st.paintingsCreated,
      9: st.spiritsAwakened,
      10: st.studios.filter(s => s.unlocked).length,
      11: st.brushMastery,
      12: legendaryAwakenedCount,
      13: st.dynastyReputation,
      14: st.inkSpirits.find(s => s.name === 'Phoenix of Ink' && s.awakened) ? 1 : 0,
      15: st.inkSpirits.find(s => s.name === 'Ink Dragon God' && s.awakened) ? 1 : 0,
      16: legendaryAwakenedCount,
      17: completedAchievementCount,
    };

    setAchievements(prev => prev.map(a => {
      if (a.completed) return a;
      const newProgress = progressMap[a.id] ?? 0;
      if (newProgress >= a.target) {
        // Grant reward
        switch (a.rewardType) {
          case 'ink':
            setInkSupply(p => Math.min(p + a.rewardValue, IX_MAX_INK));
            break;
          case 'inspiration':
            setInspiration(p => Math.min(p + a.rewardValue, IX_MAX_INSPIRATION));
            break;
          case 'reputation':
            setDynastyReputation(p => Math.min(p + a.rewardValue, IX_MAX_REPUTATION));
            break;
          case 'brushMastery':
            setBrushMastery(p => Math.min(p + a.rewardValue, IX_MAX_BRUSH_MASTERY));
            break;
          case 'title':
            setTitleIndex(p => Math.min(p + a.rewardValue, IX_TITLE_COUNT - 1));
            break;
        }
        appendLog(`Achievement unlocked: ${a.name}`, 'achievement');
        return { ...a, progress: newProgress, completed: true, unlockedAt: Date.now() };
      }
      return { ...a, progress: newProgress };
    }));
  }, [maxedGalleryCount, collectedMaterialCount, legendaryAwakenedCount, completedAchievementCount, appendLog]);

  // ── Action: Get Title ────────────────────────────────────────────────────
  const getTitle = useCallback((): string => {
    return TITLE_NAMES[titleIndex];
  }, [titleIndex]);

  // ── Action: Get Progress Summary ─────────────────────────────────────────
  const getProgress = useCallback(() => {
    const st = stateRef.current;
    return {
      spiritProgress: {
        awakened: st.spiritsAwakened,
        total: IX_SPIRIT_COUNT,
        percentage: Math.floor((st.spiritsAwakened / IX_SPIRIT_COUNT) * 100),
      },
      studioProgress: {
        unlocked: st.studios.filter(s => s.unlocked).length,
        total: IX_STUDIO_COUNT,
        percentage: Math.floor((st.studios.filter(s => s.unlocked).length / IX_STUDIO_COUNT) * 100),
      },
      galleryProgress: {
        maxLevel: highestGalleryLevel,
        maxedGalleries: maxedGalleryCount,
        total: IX_GALLERY_COUNT,
      },
      materialProgress: {
        collected: collectedMaterialCount,
        total: IX_MATERIAL_COUNT,
        percentage: Math.floor((collectedMaterialCount / IX_MATERIAL_COUNT) * 100),
      },
      abilityProgress: {
        unlocked: unlockedAbilityCount,
        total: IX_ABILITY_COUNT,
        percentage: Math.floor((unlockedAbilityCount / IX_ABILITY_COUNT) * 100),
      },
      achievementProgress: {
        completed: completedAchievementCount,
        total: IX_ACHIEVEMENT_COUNT,
        percentage: Math.floor((completedAchievementCount / IX_ACHIEVEMENT_COUNT) * 100),
      },
      titleProgress: {
        currentIndex: titleIndex,
        title: TITLE_NAMES[titleIndex],
        nextTitle: titleIndex < IX_TITLE_COUNT - 1 ? TITLE_NAMES[titleIndex + 1] : null,
        nextThreshold: titleIndex < IX_TITLE_COUNT - 1 ? TITLE_THRESHOLDS[titleIndex + 1] : null,
        reputationToNext: titleIndex < IX_TITLE_COUNT - 1
          ? Math.max(0, TITLE_THRESHOLDS[titleIndex + 1] - st.dynastyReputation)
          : 0,
      },
      reputationProgress: {
        current: st.dynastyReputation,
        max: IX_MAX_REPUTATION,
        percentage: Math.floor((st.dynastyReputation / IX_MAX_REPUTATION) * 100),
      },
      masteryProgress: {
        current: st.brushMastery,
        max: IX_MAX_BRUSH_MASTERY,
        percentage: Math.floor((st.brushMastery / IX_MAX_BRUSH_MASTERY) * 100),
      },
    };
  }, [highestGalleryLevel, maxedGalleryCount, collectedMaterialCount, unlockedAbilityCount, completedAchievementCount, titleIndex]);

  // ── Action: Get Stats ────────────────────────────────────────────────────
  const getStats = useCallback(() => {
    const st = stateRef.current;
    return {
      inkSupply: st.inkSupply,
      inkMax: IX_MAX_INK,
      inspiration: st.inspiration,
      inspirationMax: IX_MAX_INSPIRATION,
      brushMastery: st.brushMastery,
      brushMasteryMax: IX_MAX_BRUSH_MASTERY,
      dynastyReputation: st.dynastyReputation,
      dynastyReputationMax: IX_MAX_REPUTATION,
      paintingsCreated: st.paintingsCreated,
      spiritsAwakened: st.spiritsAwakened,
      totalSpiritPower,
      totalGalleryReputation,
      title: TITLE_NAMES[titleIndex],
      titleIndex,
      activeStudioName: st.studios[st.currentStudio]?.name ?? 'None',
      currentStudioLevel: st.studios[st.currentStudio]?.level ?? 0,
      totalGrinds: st.totalGrinds,
      totalSeals: st.totalSeals,
      totalScrolls: st.totalScrolls,
      totalExhibits: st.totalExhibits,
      totalInspirations: st.totalInspirations,
      dailyMasterpieceCompleted: st.dailyMasterpiece?.completed ?? false,
      dailyMasterpieceReward: st.dailyMasterpiece?.reward ?? 0,
      rarestAwakenedRarity,
      spiritRarityBreakdown,
      completedAchievements: completedAchievementCount,
      totalAchievements: IX_ACHIEVEMENT_COUNT,
      unlockedAbilities: unlockedAbilityCount,
      totalAbilities: IX_ABILITY_COUNT,
    };
  }, [totalSpiritPower, totalGalleryReputation, titleIndex, rarestAwakenedRarity, spiritRarityBreakdown, completedAchievementCount, unlockedAbilityCount]);

  // ── Action: Get Spirit Details ───────────────────────────────────────────
  const getSpiritDetails = useCallback((spiritId: number): InkSpirit | null => {
    return inkSpirits.find(s => s.id === spiritId) ?? null;
  }, [inkSpirits]);

  // ── Action: Get Gallery Details ──────────────────────────────────────────
  const getGalleryDetails = useCallback((galleryId: number): Gallery | null => {
    return galleries.find(g => g.id === galleryId) ?? null;
  }, [galleries]);

  // ── Action: Get Studio Details ───────────────────────────────────────────
  const getStudioDetails = useCallback((studioId: number): Studio | null => {
    return studios.find(s => s.id === studioId) ?? null;
  }, [studios]);

  // ── Action: Get Ability Details ──────────────────────────────────────────
  const getAbilityDetails = useCallback((abilityId: number): Ability | null => {
    return abilities.find(a => a.id === abilityId) ?? null;
  }, [abilities]);

  // ── Action: Get Material Details ─────────────────────────────────────────
  const getMaterialDetails = useCallback((materialId: number): Material | null => {
    return materials.find(m => m.id === materialId) ?? null;
  }, [materials]);

  // ── Action: Get Achievement Details ──────────────────────────────────────
  const getAchievementDetails = useCallback((achievementId: number): Achievement | null => {
    return achievements.find(a => a.id === achievementId) ?? null;
  }, [achievements]);

  // ── Action: Get Spirits by Rarity ────────────────────────────────────────
  const getSpiritsByRarity = useCallback((rarity: RarityTier): InkSpirit[] => {
    return inkSpirits.filter(s => s.rarity === rarity);
  }, [inkSpirits]);

  // ── Action: Get Spirits by Element ───────────────────────────────────────
  const getSpiritsByElement = useCallback((element: string): InkSpirit[] => {
    return inkSpirits.filter(s => s.element === element);
  }, [inkSpirits]);

  // ── Action: Get Next Title ───────────────────────────────────────────────
  const getNextTitle = useCallback((): { name: string; threshold: number } | null => {
    if (titleIndex >= IX_TITLE_COUNT - 1) return null;
    return {
      name: TITLE_NAMES[titleIndex + 1],
      threshold: TITLE_THRESHOLDS[titleIndex + 1],
    };
  }, [titleIndex]);

  // ── Action: Get Color Theme ──────────────────────────────────────────────
  const getColorTheme = useCallback(() => ({
    black: IX_COLOR_BLACK,
    white: IX_COLOR_WHITE,
    inkGray: IX_COLOR_INK_GRAY,
    vermillion: IX_COLOR_VERMILLION,
    gold: IX_COLOR_GOLD,
  }), []);

  // ── Action: Get Gallery Upgrade Cost ─────────────────────────────────────
  const getGalleryUpgradeCost = useCallback((galleryId: number): number => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery) return 0;
    const template = GALLERY_TEMPLATES[galleryId];
    return Math.floor(template.baseUpgradeCost * (gallery.level + 1) * 1.5);
  }, [galleries]);

  // ── Action: Get Studio Upgrade Cost ──────────────────────────────────────
  const getStudioUpgradeCost = useCallback((studioId: number): number => {
    const studio = studios.find(s => s.id === studioId);
    if (!studio) return 0;
    const template = STUDIO_TEMPLATES[studioId];
    return Math.floor(template.baseUpgradeCost * (studio.level + 1) * 1.3);
  }, [studios]);

  // ── Action: Get Spirit Awaken Cost ───────────────────────────────────────
  const getSpiritAwakenCost = useCallback((spiritId: number): number => {
    const spirit = inkSpirits.find(s => s.id === spiritId);
    return spirit?.paintCost ?? 0;
  }, [inkSpirits]);

  // ── Action: Get Ability Unlock Cost ──────────────────────────────────────
  const getAbilityUnlockCost = useCallback((abilityId: number): number => {
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability) return 0;
    return 20 + ability.tier * 15;
  }, [abilities]);

  // ── Action: Get Studio Unlock Cost ───────────────────────────────────────
  const getStudioUnlockCost = useCallback((studioId: number): number => {
    return 50 + studioId * 25;
  }, []);

  // ── Action: Can Awaken Spirit ────────────────────────────────────────────
  const canAwakenSpirit = useCallback((spiritId: number): boolean => {
    const spirit = inkSpirits.find(s => s.id === spiritId);
    if (!spirit || spirit.awakened) return false;
    return inkSupply >= spirit.paintCost;
  }, [inkSpirits, inkSupply]);

  // ── Action: Can Upgrade Gallery ──────────────────────────────────────────
  const canUpgradeGallery = useCallback((galleryId: number): boolean => {
    const gallery = galleries.find(g => g.id === galleryId);
    if (!gallery || gallery.level >= gallery.maxLevel) return false;
    return inkSupply >= getGalleryUpgradeCost(galleryId);
  }, [galleries, inkSupply, getGalleryUpgradeCost]);

  // ── Action: Can Upgrade Studio ───────────────────────────────────────────
  const canUpgradeStudio = useCallback((studioId: number): boolean => {
    const studio = studios.find(s => s.id === studioId);
    if (!studio || !studio.unlocked || studio.level >= studio.maxLevel) return false;
    return inkSupply >= getStudioUpgradeCost(studioId);
  }, [studios, inkSupply, getStudioUpgradeCost]);

  // ── Action: Can Unlock Studio ────────────────────────────────────────────
  const canUnlockStudio = useCallback((studioId: number): boolean => {
    const studio = studios.find(s => s.id === studioId);
    if (!studio || studio.unlocked) return false;
    return dynastyReputation >= getStudioUnlockCost(studioId);
  }, [studios, dynastyReputation, getStudioUnlockCost]);

  // ── Action: Can Activate Ability ─────────────────────────────────────────
  const canActivateAbility = useCallback((abilityId: number): boolean => {
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability || !ability.unlocked || ability.currentCooldown > 0) return false;
    return inkSupply >= ability.inkCost;
  }, [abilities, inkSupply]);

  // ── Action: Can Unlock Ability ───────────────────────────────────────────
  const canUnlockAbility = useCallback((abilityId: number): boolean => {
    const ability = abilities.find(a => a.id === abilityId);
    if (!ability || ability.unlocked) return false;
    const cost = 20 + ability.tier * 15;
    return brushMastery >= cost;
  }, [abilities, brushMastery]);

  // ── Action: Can Paint ────────────────────────────────────────────────────
  const canPaint = useCallback((): boolean => {
    return inkSupply >= IX_BASE_PAINT_COST && inspiration >= 10;
  }, [inkSupply, inspiration]);

  // ── Action: Can Grind Ink ────────────────────────────────────────────────
  const canGrindInk = useCallback((): boolean => {
    return inspiration >= 5;
  }, [inspiration]);

  // ── Action: Can Carve Seal ───────────────────────────────────────────────
  const canCarveSeal = useCallback((): boolean => {
    return inkSupply >= 10;
  }, [inkSupply]);

  // ── Action: Can Mount Scroll ─────────────────────────────────────────────
  const canMountScroll = useCallback((): boolean => {
    return inkSupply >= 12 && inspiration >= 8;
  }, [inkSupply, inspiration]);

  // ── Action: Reset Dynasty (debug) ────────────────────────────────────────
  const resetDynasty = useCallback(() => {
    setInitialized(false);
    setInkSupply(100);
    setInspiration(50);
    setBrushMastery(0);
    setPaintingsCreated(0);
    setSpiritsAwakened(0);
    setTitleIndex(0);
    setDynastyReputation(0);
    setDailyMasterpiece(null);
    setTotalGrinds(0);
    setTotalSeals(0);
    setTotalScrolls(0);
    setTotalExhibits(0);
    setTotalInspirations(0);
    setLog([]);
    appendLog('The dynasty has been reset. A new era begins.', 'awaken');
  }, [appendLog]);

  // ── Action: Quick Paint (uses random awakened spirit) ────────────────────
  const quickPaint = useCallback((): boolean => {
    const st = stateRef.current;
    if (st.inkSupply < IX_BASE_PAINT_COST || st.inspiration < 10) return false;

    const awakened = st.inkSpirits.filter(s => s.awakened);
    if (awakened.length === 0) return false;

    const randomSpirit = awakened[Math.floor(Math.random() * awakened.length)];
    const unlockedGalleries = st.galleries.filter(g => g.level > 0 && g.paintings < g.maxPaintings);
    if (unlockedGalleries.length === 0) return false;

    const randomGallery = unlockedGalleries[Math.floor(Math.random() * unlockedGalleries.length)];
    return paintMasterpiece(randomGallery.id, randomSpirit.id);
  }, [paintMasterpiece]);

  // ── Action: Collect All Passive Bonuses ──────────────────────────────────
  const collectPassiveBonuses = useCallback(() => {
    const st = stateRef.current;
    let inkBonus = 0;
    let inspBonus = 0;
    let repBonus = 0;

    st.studios.forEach(s => {
      if (!s.unlocked || s.level === 0) return;
      switch (s.bonusType) {
        case 'inkEfficiency':
          inkBonus += s.bonusValue;
          break;
        case 'inspirationRegen':
          inspBonus += s.bonusValue;
          break;
        case 'reputationBonus':
          repBonus += s.bonusValue;
          break;
      }
    });

    if (inkBonus > 0) setInkSupply(p => Math.min(p + inkBonus, IX_MAX_INK));
    if (inspBonus > 0) setInspiration(p => Math.min(p + inspBonus, IX_MAX_INSPIRATION));
    if (repBonus > 0) setDynastyReputation(p => Math.min(p + repBonus, IX_MAX_REPUTATION));

    const total = inkBonus + inspBonus + repBonus;
    if (total > 0) {
      appendLog(`Passive bonuses collected: +${inkBonus} ink, +${inspBonus} inspiration, +${repBonus} reputation`, 'inspire');
    }
  }, [appendLog]);

  // ── Action: Get Optimal Next Action ──────────────────────────────────────
  const getOptimalNextAction = useCallback((): string => {
    const st = stateRef.current;
    const unawakened = st.inkSpirits.filter(s => !s.awakened);
    const affordableSpirits = unawakened.filter(s => s.paintCost <= st.inkSupply);

    if (affordableSpirits.length > 0) {
      const best = affordableSpirits.reduce((a, b) =>
        IX_RARITY_ORDER[b.rarity] > IX_RARITY_ORDER[a.rarity] ? b : a
      );
      return `Awaken ${best.name} (${IX_RARITY_NAMES[best.rarity]}) — costs ${best.paintCost} ink`;
    }

    if (st.inkSupply < 20) {
      if (st.inspiration >= 5) return 'Grind ink to replenish your supply';
      return 'Use Inspire Muse to gain more inspiration, then grind ink';
    }

    const unlockableStudios = st.studios.filter(
      s => !s.unlocked && st.dynastyReputation >= 50 + s.id * 25
    );
    if (unlockableStudios.length > 0) {
      return `Unlock ${unlockableStudios[0].name} studio`;
    }

    const upgradeableGalleries = st.galleries.filter(
      g => g.level > 0 && g.level < g.maxLevel
    );
    if (upgradeableGalleries.length > 0) {
      return `Upgrade ${upgradeableGalleries[0].name} gallery`;
    }

    if (st.inkSupply >= IX_BASE_PAINT_COST && st.inspiration >= 10) {
      return 'Paint a new masterpiece';
    }

    return 'Grind ink and build inspiration for future paintings';
  }, []);

  // ── Action: Get Rarest Unawakened Spirit ─────────────────────────────────
  const getRarestUnawakened = useCallback((): InkSpirit | null => {
    const unawakened = inkSpirits.filter(s => !s.awakened);
    if (unawakened.length === 0) return null;
    return unawakened.reduce((a, b) =>
      IX_RARITY_ORDER[b.rarity] > IX_RARITY_ORDER[a.rarity] ? b : a
    );
  }, [inkSpirits]);

  // ── Action: Get Weakest Awakened Spirit ──────────────────────────────────
  const getWeakestAwakened = useCallback((): InkSpirit | null => {
    if (awakenedSpirits.length === 0) return null;
    return awakenedSpirits.reduce((a, b) => (a.loyalty < b.loyalty ? a : b));
  }, [awakenedSpirits]);

  // ── Action: Batch Awaken (affordable spirits) ────────────────────────────
  const batchAwakenAffordable = useCallback((): number => {
    const st = stateRef.current;
    let count = 0;
    let remaining = st.inkSupply;

    const unawakened = [...st.inkSpirits]
      .filter(s => !s.awakened)
      .sort((a, b) => IX_RARITY_ORDER[b.rarity] - IX_RARITY_ORDER[a.rarity]);

    for (const spirit of unawakened) {
      if (remaining >= spirit.paintCost) {
        remaining -= spirit.paintCost;
        count++;
        setInkSpirits(prev => prev.map(s =>
          s.id === spirit.id
            ? { ...s, awakened: true, loyalty: 50, awakenedAt: Date.now() }
            : s
        ));
      }
    }

    if (count > 0) {
      setInkSupply(remaining);
      setSpiritsAwakened(p => p + count);
      appendLog(`Batch awakened ${count} spirit(s)`, 'awaken');
    }
    return count;
  }, [appendLog]);

  // ── Action: Get Materials by Category ────────────────────────────────────
  const getMaterialsByCategory = useCallback((category: string): Material[] => {
    return materials.filter(m => m.category === category);
  }, [materials]);

  // ── Action: Get Materials by Rarity ──────────────────────────────────────
  const getMaterialsByRarity = useCallback((rarity: RarityTier): Material[] => {
    return materials.filter(m => m.rarity === rarity);
  }, [materials]);

  // ── Action: Get Total Material Effect ────────────────────────────────────
  const getTotalMaterialEffect = useCallback((effectType: string): number => {
    return materials
      .filter(m => m.quantity > 0 && m.effect === effectType)
      .reduce((sum, m) => sum + m.effectValue * m.quantity, 0);
  }, [materials]);

  // ── Action: Get Galleries by Theme ───────────────────────────────────────
  const getGalleriesByTheme = useCallback((theme: string): Gallery[] => {
    return galleries.filter(g => g.theme === theme);
  }, [galleries]);

  // ── Action: Get Top N Galleries ──────────────────────────────────────────
  const getTopGalleries = useCallback((n: number): Gallery[] => {
    return [...galleries]
      .sort((a, b) => b.level - a.level)
      .slice(0, n);
  }, [galleries]);

  // ── Action: Get Abilities by Element ─────────────────────────────────────
  const getAbilitiesByElement = useCallback((element: string): Ability[] => {
    return abilities.filter(a => a.element === element);
  }, [abilities]);

  // ── Action: Get Abilities by Tier ────────────────────────────────────────
  const getAbilitiesByTier = useCallback((tier: number): Ability[] => {
    return abilities.filter(a => a.tier === tier);
  }, [abilities]);

  // ── Action: Get Ready Abilities ──────────────────────────────────────────
  const getReadyAbilities = useCallback((): Ability[] => {
    return abilities.filter(a => a.unlocked && a.currentCooldown === 0);
  }, [abilities]);

  // ── Action: Get Achievements by Status ───────────────────────────────────
  const getAchievementsByStatus = useCallback((completed: boolean): Achievement[] => {
    return achievements.filter(a => a.completed === completed);
  }, [achievements]);

  // ── Action: Get Recent Log ───────────────────────────────────────────────
  const getRecentLog = useCallback((count: number): LogEntry[] => {
    return log.slice(-count);
  }, [log]);

  // ── Action: Clear Log ────────────────────────────────────────────────────
  const clearLog = useCallback(() => {
    setLog([]);
  }, []);

  // ── Additional Computed Values ───────────────────────────────────────────
  const totalPaintingsInGalleries = useMemo(() => {
    return galleries.reduce((sum, g) => sum + g.paintings, 0);
  }, [galleries]);

  const totalMaxPaintings = useMemo(() => {
    return galleries.reduce((sum, g) => sum + g.maxPaintings, 0);
  }, [galleries]);

  const galleryFillRate = useMemo(() => {
    const total = totalMaxPaintings;
    if (total === 0) return 0;
    return Math.floor((totalPaintingsInGalleries / total) * 100);
  }, [totalPaintingsInGalleries, totalMaxPaintings]);

  const averageSpiritLoyalty = useMemo(() => {
    if (awakenedSpirits.length === 0) return 0;
    return Math.floor(awakenedSpirits.reduce((sum, s) => sum + s.loyalty, 0) / awakenedSpirits.length);
  }, [awakenedSpirits]);

  const strongestSpirit = useMemo(() => {
    if (awakenedSpirits.length === 0) return null;
    return awakenedSpirits.reduce((a, b) => a.power > b.power ? a : b);
  }, [awakenedSpirits]);

  const dominantElement = useMemo(() => {
    if (awakenedSpirits.length === 0) return 'none';
    const counts: Record<string, number> = {};
    awakenedSpirits.forEach(s => {
      counts[s.element] = (counts[s.element] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }, [awakenedSpirits]);

  const unlockedStudiosCount = useMemo(() => {
    return studios.filter(s => s.unlocked).length;
  }, [studios]);

  const activeGalleriesCount = useMemo(() => {
    return galleries.filter(g => g.level > 0).length;
  }, [galleries]);

  const elementBreakdown = useMemo(() => {
    const counts: Record<string, number> = { water: 0, fire: 0, earth: 0, wind: 0, wood: 0 };
    awakenedSpirits.forEach(s => {
      if (counts[s.element] !== undefined) counts[s.element]++;
    });
    return counts;
  }, [awakenedSpirits]);

  const inkSupplyPercentage = useMemo(() => {
    return Math.floor((inkSupply / IX_MAX_INK) * 100);
  }, [inkSupply]);

  const inspirationPercentage = useMemo(() => {
    return Math.floor((inspiration / IX_MAX_INSPIRATION) * 100);
  }, [inspiration]);

  const masteryPercentage = useMemo(() => {
    return Math.floor((brushMastery / IX_MAX_BRUSH_MASTERY) * 100);
  }, [brushMastery]);

  const reputationPercentage = useMemo(() => {
    return Math.floor((dynastyReputation / IX_MAX_REPUTATION) * 100);
  }, [dynastyReputation]);

  const dynasticScore = useMemo(() => {
    const spiritScore = awakenedSpirits.reduce((s, sp) => s + sp.power, 0);
    const galleryScore = galleries.reduce((s, g) => s + g.reputationBonus * g.level, 0);
    const studioScore = studios.filter(st => st.unlocked).reduce((s, st) => s + st.bonusValue, 0);
    const materialScore = materials.filter(m => m.quantity > 0).reduce((s, m) => s + m.effectValue, 0);
    return spiritScore + galleryScore * 10 + studioScore * 20 + materialScore * 5;
  }, [awakenedSpirits, galleries, studios, materials]);

  // ── Dynasty Event System ─────────────────────────────────────────────────
  const dynastyEvents = useMemo(() => {
    const events: string[] = [];

    if (spiritsAwakened === 0) {
      events.push('Begin your journey by awakening your first ink spirit.');
    }
    if (spiritsAwakened >= 5 && spiritsAwakened < 10) {
      events.push('Your growing spirit collection attracts the attention of the imperial court.');
    }
    if (spiritsAwakened >= 10) {
      events.push('The emperor sends a messenger: your spirit mastery is renowned across the land.');
    }
    if (brushMastery >= 1000 && brushMastery < 2000) {
      events.push('Master calligraphers seek your tutelage — your brush mastery grows.');
    }
    if (brushMastery >= 5000) {
      events.push('Your brush mastery echoes through the halls of the Imperial Atelier.');
    }
    if (dynastyReputation >= 1000 && dynastyReputation < 3000) {
      events.push('Merchants from distant provinces come to view your gallery exhibitions.');
    }
    if (dynastyReputation >= 5000) {
      events.push('The dynasty celebrates your name — a festival is held in your honor.');
    }
    if (legendaryAwakenedCount >= 1) {
      events.push('A legendary spirit walks among your collection — the world takes notice.');
    }
    if (legendaryAwakenedCount >= 4) {
      events.push('Four legendary spirits united — an omen of unprecedented artistic power.');
    }
    if (completedAchievementCount >= 10) {
      events.push('Ten achievements attained — the Imperial Archives record your deeds.');
    }
    if (paintingsCreated >= 50) {
      events.push('Fifty masterpieces adorn your galleries — a legacy in the making.');
    }
    if (titleIndex >= 5) {
      events.push('As a titled master, your influence shapes the future of ink artistry.');
    }
    if (maxedGalleryCount >= 3) {
      events.push('Three galleries reach their peak — visitors travel from afar to witness them.');
    }

    return events;
  }, [
    spiritsAwakened, brushMastery, dynastyReputation,
    legendaryAwakenedCount, completedAchievementCount,
    paintingsCreated, titleIndex, maxedGalleryCount,
  ]);

  // ── Action: Perform Imperial Ceremony ────────────────────────────────────
  const performCeremony = useCallback((): boolean => {
    if (stateRef.current.inkSupply < 30 || stateRef.current.inspiration < 20) return false;

    setInkSupply(p => Math.max(0, p - 30));
    setInspiration(p => Math.max(0, p - 20));

    const repGain = 25 + Math.floor(Math.random() * 15);
    const masteryGain = 20 + Math.floor(Math.random() * 10);

    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));
    setBrushMastery(p => Math.min(p + masteryGain, IX_MAX_BRUSH_MASTERY));

    // Boost all awakened spirit loyalty by 3
    setInkSpirits(prev => prev.map(s =>
      s.awakened ? { ...s, loyalty: Math.min(s.loyalty + 3, 100) } : s
    ));

    appendLog(`Imperial ceremony performed: +${repGain} reputation, +${masteryGain} mastery, all spirits +3 loyalty`, 'upgrade');
    return true;
  }, [appendLog]);

  // ── Action: Trade Materials for Ink ──────────────────────────────────────
  const tradeMaterialForInk = useCallback((materialId: number): boolean => {
    const mat = stateRef.current.materials.find(m => m.id === materialId);
    if (!mat || mat.quantity < 1) return false;

    const inkValue = Math.floor(mat.effectValue * 2 + mat.effectValue * (IX_RARITY_ORDER[mat.rarity] + 1));

    setMaterials(prev => prev.map(m =>
      m.id === materialId ? { ...m, quantity: m.quantity - 1 } : m
    ));
    setInkSupply(p => Math.min(p + inkValue, IX_MAX_INK));

    appendLog(`Traded ${mat.name} for ${inkValue} ink`, 'grind');
    return true;
  }, [appendLog]);

  // ── Action: Trade Materials for Inspiration ──────────────────────────────
  const tradeMaterialForInspiration = useCallback((materialId: number): boolean => {
    const mat = stateRef.current.materials.find(m => m.id === materialId);
    if (!mat || mat.quantity < 1) return false;

    const inspValue = Math.floor(mat.effectValue * 1.5 + 5 * (IX_RARITY_ORDER[mat.rarity] + 1));

    setMaterials(prev => prev.map(m =>
      m.id === materialId ? { ...m, quantity: m.quantity - 1 } : m
    ));
    setInspiration(p => Math.min(p + inspValue, IX_MAX_INSPIRATION));

    appendLog(`Traded ${mat.name} for ${inspValue} inspiration`, 'inspire');
    return true;
  }, [appendLog]);

  // ── Action: Meditate (deep inspiration gain) ─────────────────────────────
  const meditate = useCallback((): boolean => {
    if (stateRef.current.inspiration >= IX_MAX_INSPIRATION - 5) return false;

    const studioBonus = stateRef.current.studios.find(s => s.id === stateRef.current.currentStudio);
    const gardenBonus = studioBonus && studioBonus.unlocked && studioBonus.bonusType === 'inspirationRegen'
      ? studioBonus.bonusValue * 2
      : 0;

    const inspGain = 25 + gardenBonus + Math.floor(Math.random() * 10);
    const masteryGain = 5;

    setInspiration(p => Math.min(p + inspGain, IX_MAX_INSPIRATION));
    setBrushMastery(p => Math.min(p + masteryGain, IX_MAX_BRUSH_MASTERY));

    appendLog(`Deep meditation: +${inspGain} inspiration, +${masteryGain} mastery`, 'inspire');
    return true;
  }, [appendLog]);

  // ── Action: Calligraphy Practice ─────────────────────────────────────────
  const practiceCalligraphy = useCallback((): boolean => {
    if (stateRef.current.inkSupply < 5 || stateRef.current.inspiration < 3) return false;

    setInkSupply(p => Math.max(0, p - 5));
    setInspiration(p => Math.max(0, p - 3));

    const masteryGain = 3 + Math.floor(Math.random() * 4);
    setBrushMastery(p => Math.min(p + masteryGain, IX_MAX_BRUSH_MASTERY));

    const repChance = Math.random();
    if (repChance > 0.7) {
      const repGain = 2 + Math.floor(Math.random() * 3);
      setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));
      appendLog(`Calligraphy practice: +${masteryGain} mastery, +${repGain} reputation (excellent strokes!)`, 'paint');
    } else {
      appendLog(`Calligraphy practice: +${masteryGain} mastery`, 'paint');
    }
    return true;
  }, [appendLog]);

  // ── Action: Host Exhibition ──────────────────────────────────────────────
  const hostExhibition = useCallback((galleryId: number): boolean => {
    const gallery = stateRef.current.galleries.find(g => g.id === galleryId);
    if (!gallery || gallery.level < 3) return false;
    if (stateRef.current.inkSupply < 25 || stateRef.current.inspiration < 15) return false;

    setInkSupply(p => Math.max(0, p - 25));
    setInspiration(p => Math.max(0, p - 15));

    const repGain = gallery.reputationBonus * 2 + Math.floor(Math.random() * 20) + 10;
    setDynastyReputation(p => Math.min(p + repGain, IX_MAX_REPUTATION));

    setGalleries(prev => prev.map(g =>
      g.id === galleryId
        ? { ...g, paintings: Math.min(g.paintings + 3, g.maxPaintings) }
        : g
    ));

    appendLog(`Grand exhibition in ${gallery.name}: +${repGain} reputation, +3 paintings`, 'exhibit');
    return true;
  }, [appendLog]);

  // ── Action: Restore Spirit Loyalty (costs ink) ───────────────────────────
  const restoreSpiritLoyalty = useCallback((spiritId: number): boolean => {
    const spirit = stateRef.current.inkSpirits.find(s => s.id === spiritId);
    if (!spirit || !spirit.awakened || spirit.loyalty >= 100) return false;
    if (stateRef.current.inkSupply < 8) return false;

    setInkSupply(p => Math.max(0, p - 8));
    setInkSpirits(prev => prev.map(s =>
      s.id === spiritId ? { ...s, loyalty: Math.min(s.loyalty + 15, 100) } : s
    ));

    appendLog(`Restored ${spirit.name}'s loyalty: +15 (now ${Math.min(spirit.loyalty + 15, 100)})`, 'inspire');
    return true;
  }, [appendLog]);

  // ── Action: Get Dynasty Strength Rating ──────────────────────────────────
  const getDynastyStrengthRating = useCallback((): string => {
    const score = dynasticScore;
    if (score >= 10000) return 'Transcendent';
    if (score >= 5000) return 'Legendary';
    if (score >= 2000) return 'Epic';
    if (score >= 1000) return 'Rare';
    if (score >= 500) return 'Uncommon';
    if (score >= 100) return 'Common';
    return 'Novice';
  }, [dynasticScore]);

  // ── Action: Get Spirit Collection Completion ─────────────────────────────
  const getCollectionCompletion = useCallback(() => {
    const byRarity: Record<RarityTier, { total: number; awakened: number }> = {
      common: { total: 7, awakened: 0 },
      uncommon: { total: 7, awakened: 0 },
      rare: { total: 7, awakened: 0 },
      epic: { total: 7, awakened: 0 },
      legendary: { total: 7, awakened: 0 },
    };
    stateRef.current.inkSpirits.forEach(s => {
      if (s.awakened) byRarity[s.rarity].awakened++;
    });
    const totalAwakened = Object.values(byRarity).reduce((s, r) => s + r.awakened, 0);
    return {
      byRarity,
      totalAwakened,
      totalSpirits: IX_SPIRIT_COUNT,
      overallPercentage: Math.floor((totalAwakened / IX_SPIRIT_COUNT) * 100),
    };
  }, []);

  // ── Action: Get Full Dynasty Report ──────────────────────────────────────
  const getDynastyReport = useCallback(() => {
    const st = stateRef.current;
    return {
      overview: {
        title: TITLE_NAMES[titleIndex],
        reputation: st.dynastyReputation,
        mastery: st.brushMastery,
        strengthRating: getDynastyStrengthRating(),
        dynasticScore,
      },
      resources: {
        ink: st.inkSupply,
        inkMax: IX_MAX_INK,
        inspiration: st.inspiration,
        inspirationMax: IX_MAX_INSPIRATION,
      },
      spirits: {
        total: IX_SPIRIT_COUNT,
        awakened: st.spiritsAwakened,
        averageLoyalty: averageSpiritLoyalty,
        strongest: strongestSpirit?.name ?? 'None',
        dominantElement,
      },
      studios: {
        total: IX_STUDIO_COUNT,
        unlocked: unlockedStudiosCount,
        activeStudio: st.studios[st.currentStudio]?.name ?? 'None',
      },
      galleries: {
        total: IX_GALLERY_COUNT,
        active: activeGalleriesCount,
        totalPaintings: totalPaintingsInGalleries,
        maxPaintings: totalMaxPaintings,
        fillRate: galleryFillRate,
        highestLevel: highestGalleryLevel,
      },
      abilities: {
        total: IX_ABILITY_COUNT,
        unlocked: unlockedAbilityCount,
        ready: abilities.filter(a => a.unlocked && a.currentCooldown === 0).length,
      },
      achievements: {
        total: IX_ACHIEVEMENT_COUNT,
        completed: completedAchievementCount,
      },
      materials: {
        total: IX_MATERIAL_COUNT,
        collected: collectedMaterialCount,
      },
      activity: {
        totalPaintingsCreated: st.paintingsCreated,
        totalGrinds: st.totalGrinds,
        totalSeals: st.totalSeals,
        totalScrolls: st.totalScrolls,
        totalExhibits: st.totalExhibits,
        totalInspirations: st.totalInspirations,
      },
      events: dynastyEvents,
    };
  }, [
    titleIndex, getDynastyStrengthRating, dynasticScore,
    averageSpiritLoyalty, strongestSpirit, dominantElement,
    unlockedStudiosCount, activeGalleriesCount,
    totalPaintingsInGalleries, totalMaxPaintings, galleryFillRate,
    highestGalleryLevel, unlockedAbilityCount, abilities,
    completedAchievementCount, collectedMaterialCount,
    dynastyEvents,
  ]);

  // ── Action: Get Rarity Color ─────────────────────────────────────────────
  const getRarityColor = useCallback((rarity: RarityTier): string => {
    switch (rarity) {
      case 'common': return IX_COLOR_INK_GRAY;
      case 'uncommon': return '#4CAF50';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return IX_COLOR_GOLD;
    }
  }, []);

  // ── Action: Get Element Color ────────────────────────────────────────────
  const getElementColor = useCallback((element: string): string => {
    switch (element) {
      case 'water': return '#1565C0';
      case 'fire': return IX_COLOR_VERMILLION;
      case 'earth': return '#795548';
      case 'wind': return '#78909C';
      case 'wood': return '#2E7D32';
      default: return IX_COLOR_INK_GRAY;
    }
  }, []);

  // ── Action: Get Unlocked Gallery List ────────────────────────────────────
  const getUnlockedGalleries = useCallback((): Gallery[] => {
    return galleries.filter(g => g.level > 0);
  }, [galleries]);

  // ── Action: Get Available Spirit Slots ───────────────────────────────────
  const getAvailableSpiritSlots = useCallback((): number => {
    return IX_SPIRIT_COUNT - spiritsAwakened;
  }, [spiritsAwakened]);

  // ── Action: Quick Auto-Play Cycle ────────────────────────────────────────
  const autoPlayCycle = useCallback((): { actions: string[] } => {
    const actions: string[] = [];

    // Step 1: Inspire if needed
    if (stateRef.current.inspiration < 30) {
      inspireMuse();
      actions.push('inspire');
    }

    // Step 2: Grind ink if low
    if (stateRef.current.inkSupply < 40 && stateRef.current.inspiration >= 5) {
      grindInk();
      actions.push('grind');
    }

    // Step 3: Try to awaken if we can afford a spirit
    const unawakened = stateRef.current.inkSpirits.filter(s => !s.awakened);
    const affordable = unawakened.filter(s => s.paintCost <= stateRef.current.inkSupply);
    if (affordable.length > 0) {
      const best = affordable.reduce((a, b) =>
        IX_RARITY_ORDER[b.rarity] > IX_RARITY_ORDER[a.rarity] ? b : a
      );
      awakenSpirit(best.id);
      actions.push(`awaken:${best.name}`);
    }

    // Step 4: Paint if we have ink and inspiration
    if (stateRef.current.inkSupply >= IX_BASE_PAINT_COST && stateRef.current.inspiration >= 10) {
      const unlockedGals = stateRef.current.galleries.filter(g => g.level > 0 && g.paintings < g.maxPaintings);
      if (unlockedGals.length > 0) {
        const aw = stateRef.current.inkSpirits.filter(s => s.awakened);
        const spiritId = aw.length > 0 ? aw[0].id : null;
        paintMasterpiece(unlockedGals[0].id, spiritId);
        actions.push('paint');
      }
    }

    // Step 5: Check achievements
    checkAchievements();
    actions.push('check');

    return { actions };
  }, [inspireMuse, grindInk, awakenSpirit, paintMasterpiece, checkAchievements]);

  // ── Action: Spend Reputation for Bonus ───────────────────────────────────
  const spendReputationForBonus = useCallback((bonusType: 'ink' | 'inspiration' | 'mastery'): boolean => {
    const cost = 100;
    if (stateRef.current.dynastyReputation < cost) return false;

    setDynastyReputation(p => Math.max(0, p - cost));

    switch (bonusType) {
      case 'ink':
        setInkSupply(p => Math.min(p + 50, IX_MAX_INK));
        appendLog('Spent 100 reputation for +50 ink', 'grind');
        break;
      case 'inspiration':
        setInspiration(p => Math.min(p + 40, IX_MAX_INSPIRATION));
        appendLog('Spent 100 reputation for +40 inspiration', 'inspire');
        break;
      case 'mastery':
        setBrushMastery(p => Math.min(p + 100, IX_MAX_BRUSH_MASTERY));
        appendLog('Spent 100 reputation for +100 mastery', 'paint');
        break;
    }
    return true;
  }, [appendLog]);

  // ── Action: Get Time Until Daily Reset ───────────────────────────────────
  const getTimeUntilDailyReset = useCallback((): number => {
    if (!dailyMasterpiece) return 0;
    return Math.max(0, dailyMasterpiece.expiresAt - Date.now());
  }, [dailyMasterpiece]);

  // ── Action: Get Spirit Power Ranking ─────────────────────────────────────
  const getSpiritPowerRanking = useCallback((): { name: string; power: number; rarity: RarityTier; loyalty: number }[] => {
    return awakenedSpirits
      .map(s => ({ name: s.name, power: s.power, rarity: s.rarity, loyalty: s.loyalty }))
      .sort((a, b) => b.power - a.power);
  }, [awakenedSpirits]);

  // ── Action: Generate Dynasty Quote ───────────────────────────────────────
  const generateDynastyQuote = useCallback((): { quote: string; author: string } => {
    const quotes = [
      { quote: 'The brush must follow the heart, and the heart must follow the Dao.', author: 'Ancient Calligrapher' },
      { quote: 'In the space between strokes, the universe reveals itself.', author: 'Mountain Sage' },
      { quote: 'Black ink holds ten thousand colors within its depths.', author: 'Phoenix Empress' },
      { quote: 'A single drop of ink can flood the world with meaning.', author: 'Ancestor of All Ink' },
      { quote: 'To master the brush is to master oneself.', author: 'Ink Dragon God' },
      { quote: 'The finest paintings are those the brush paints itself.', author: 'Celestial Calligrapher' },
      { quote: 'Patience in grinding ink reveals patience in the soul.', author: 'Stone Turtle' },
      { quote: 'Every blank scroll is an invitation from infinity.', author: 'Void Brush Master' },
      { quote: 'The mountain does not care who paints it, yet it rewards all who try.', author: 'Eternal Mountain Painter' },
      { quote: 'Colors are the language that ink speaks when it dreams.', author: 'Dao of Ink Eternal' },
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }, []);

  // ── Return Everything ────────────────────────────────────────────────────
  return {
    // Constants
    IX_MAX_INK,
    IX_MAX_INSPIRATION,
    IX_SPIRIT_COUNT,
    IX_STUDIO_COUNT,
    IX_MATERIAL_COUNT,
    IX_GALLERY_COUNT,
    IX_ABILITY_COUNT,
    IX_ACHIEVEMENT_COUNT,
    IX_TITLE_COUNT,
    IX_MAX_BRUSH_MASTERY,
    IX_MAX_GALLERY_LEVEL,
    IX_MAX_REPUTATION,
    IX_BASE_AWAKEN_COST,
    IX_BASE_PAINT_COST,
    IX_BASE_UPGRADE_COST,
    IX_INK_REGEN_RATE,
    IX_INSPIRATION_REGEN_RATE,
    IX_SEAL_POWER_BASE,
    IX_SCROLL_POWER_BASE,

    // Color theme
    IX_COLOR_BLACK,
    IX_COLOR_WHITE,
    IX_COLOR_INK_GRAY,
    IX_COLOR_VERMILLION,
    IX_COLOR_GOLD,

    // State
    inkSpirits,
    studios,
    materials,
    galleries,
    abilities,
    achievements,
    currentStudio,
    inkSupply,
    inspiration,
    brushMastery,
    paintingsCreated,
    spiritsAwakened,
    titleIndex,
    dynastyReputation,
    dailyMasterpiece,
    totalGrinds,
    totalSeals,
    totalScrolls,
    totalExhibits,
    totalInspirations,
    initialized,
    log,

    // Computed
    awakenedSpirits,
    activeStudio,
    totalGalleryReputation,
    totalSpiritPower,
    unlockedAbilityCount,
    completedAchievementCount,
    collectedMaterialCount,
    highestGalleryLevel,
    maxedGalleryCount,
    legendaryAwakenedCount,
    rarestAwakenedRarity,
    availableMaterials,
    spiritRarityBreakdown,
    studioSummary,
    galleryRankings,

    // Actions
    awakenSpirit,
    paintMasterpiece,
    upgradeGallery,
    activateAbility,
    grindInk,
    carveSeal,
    mountScroll,
    exhibitPainting,
    inspireMuse,
    checkAchievements,
    selectStudio,
    upgradeStudio,
    unlockStudio,
    unlockAbility,
    addMaterial,
    consumeMaterial,
    completeDailyMasterpiece,
    boostSpiritLoyalty,
    getTitle,
    getProgress,
    getStats,
    getSpiritDetails,
    getGalleryDetails,
    getStudioDetails,
    getAbilityDetails,
    getMaterialDetails,
    getAchievementDetails,
    getSpiritsByRarity,
    getSpiritsByElement,
    getNextTitle,
    getColorTheme,
    getGalleryUpgradeCost,
    getStudioUpgradeCost,
    getSpiritAwakenCost,
    getAbilityUnlockCost,
    getStudioUnlockCost,
    canAwakenSpirit,
    canUpgradeGallery,
    canUpgradeStudio,
    canUnlockStudio,
    canActivateAbility,
    canUnlockAbility,
    canPaint,
    canGrindInk,
    canCarveSeal,
    canMountScroll,
    resetDynasty,
    quickPaint,
    collectPassiveBonuses,
    getOptimalNextAction,
    getRarestUnawakened,
    getWeakestAwakened,
    batchAwakenAffordable,
    getMaterialsByCategory,
    getMaterialsByRarity,
    getTotalMaterialEffect,
    getGalleriesByTheme,
    getTopGalleries,
    getAbilitiesByElement,
    getAbilitiesByTier,
    getReadyAbilities,
    getAchievementsByStatus,
    getRecentLog,
    clearLog,

    // Additional computed values
    totalPaintingsInGalleries,
    totalMaxPaintings,
    galleryFillRate,
    averageSpiritLoyalty,
    strongestSpirit,
    dominantElement,
    unlockedStudiosCount,
    activeGalleriesCount,
    elementBreakdown,
    inkSupplyPercentage,
    inspirationPercentage,
    masteryPercentage,
    reputationPercentage,
    dynasticScore,
    dynastyEvents,

    // Additional actions
    performCeremony,
    tradeMaterialForInk,
    tradeMaterialForInspiration,
    meditate,
    practiceCalligraphy,
    hostExhibition,
    restoreSpiritLoyalty,
    getDynastyStrengthRating,
    getCollectionCompletion,
    getDynastyReport,
    getRarityColor,
    getElementColor,
    getUnlockedGalleries,
    getAvailableSpiritSlots,
    autoPlayCycle,
    spendReputationForBonus,
    getTimeUntilDailyReset,
    getSpiritPowerRanking,
    generateDynastyQuote,
  };
}
