// ─────────────────────────────────────────────────────────────────────────────
// Titan Workshop Wire Module — Colossal Crafting System
// "Where legends are forged and worlds are shaped by hammer and starlight."
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface BlueprintInstance {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  crafted: boolean;
  craftCount: number;
  upgraded: number;
  maxUpgrade: number;
  basePower: number;
  materials: Record<string, number>;
  forgeTime: number;
  discovered: boolean;
  activated: boolean;
}

interface HallInstance {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  expanded: boolean;
  capacity: number;
  bonusType: string;
  bonusValue: number;
  unlockCost: number;
}

interface ConstructionInstance {
  id: string;
  name: string;
  type: 'facility' | 'enchantment' | 'monument';
  level: number;
  maxLevel: number;
  built: boolean;
  active: boolean;
  output: number;
  cost: Record<string, number>;
  description: string;
}

interface FacilityInstance extends ConstructionInstance {
  type: 'facility';
  efficiency: number;
  fuelType: string;
  fuelRemaining: number;
}

interface EnchantmentInstance extends ConstructionInstance {
  type: 'enchantment';
  powerBonus: number;
  element: string;
}

interface ForgeEvent {
  id: string;
  name: string;
  description: string;
  active: boolean;
  duration: number;
  remaining: number;
  bonusType: string;
  bonusMultiplier: number;
}

interface TrainingSession {
  apprenticeId: string;
  skill: string;
  progress: number;
  maxProgress: number;
  active: boolean;
  startTime: number;
}

interface TitanWorkshopState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  blueprints: Record<string, BlueprintInstance>;
  halls: Record<string, HallInstance>;
  discoveries: string[];
  achievements: string[];
  currentTitle: number;
  inventory: Record<string, number>;
  dailyQuest: { completed: boolean; progress: number; target: number; type: string };
  dayStreak: number;
  constructions: Record<string, ConstructionInstance>;
  totalCrafted: number;
  totalUpgraded: number;
  totalGathered: number;
  totalEnchanted: number;
  totalFacilitiesBuilt: number;
  forgeEvents: ForgeEvent[];
  trainingSessions: TrainingSession[];
  masterRank: number;
  forgeHeat: number;
  maxForgeHeat: number;
  dailyRewardClaimed: boolean;
  lastLoginDate: string;
  legendaryCraftsCompleted: number;
  totalMaterialsRefined: number;
  totalAbilitiesUsed: number;
  eventParticipationCount: number;
  hallExpansionsTotal: number;
  rareDiscoveries: number;
  apprenticeCount: number;
  completedChallengeRuns: number;
  titanShards: number;
  primalEssence: number;
  cosmicDust: number;
  soulForgedItems: number;
  worldShaperProgress: number;
}

// ─── Data Constants ──────────────────────────────────────────────────────────

const TW_RARITY_COLORS: Record<Rarity, string> = {
  Common: '#9CA3AF',
  Uncommon: '#22C55E',
  Rare: '#3B82F6',
  Epic: '#A855F7',
  Legendary: '#F59E0B',
};

const TW_RARITY_MULTIPLIER: Record<Rarity, number> = {
  Common: 1,
  Uncommon: 1.5,
  Rare: 2.5,
  Epic: 4,
  Legendary: 7,
};

const TW_TITLES = [
  'Apprentice Smith',
  'Journeyman Forger',
  'Master Artisan',
  'Grand Architect',
  'Colossal Builder',
  'World Shaper',
  'Titan Forgemaster',
  'Titan Creator God',
];

const TW_BLUEPRINTS: Omit<BlueprintInstance, 'crafted' | 'craftCount' | 'upgraded' | 'discovered' | 'activated'>[] = [
  { id: 'colossal-sword', name: 'Colossal Sword', rarity: 'Common', description: 'A blade tall enough to cleave mountains in two.', basePower: 50, materials: { 'star-metal': 5, 'iron-ore': 20 }, forgeTime: 60, maxUpgrade: 5 },
  { id: 'titan-shield', name: 'Titan Shield', rarity: 'Common', description: 'A shield that can block the wrath of gods.', basePower: 45, materials: { 'dragon-bone': 3, 'iron-ore': 15 }, forgeTime: 55, maxUpgrade: 5 },
  { id: 'iron-bridge', name: 'Iron Bridge', rarity: 'Common', description: 'Spanning chasms with unyielding metal.', basePower: 30, materials: { 'iron-ore': 30, 'stone-slab': 10 }, forgeTime: 40, maxUpgrade: 4 },
  { id: 'stone-maul', name: 'Stone Maul', rarity: 'Common', description: 'Pulverize boulders with a single swing.', basePower: 40, materials: { 'stone-slab': 25, 'iron-ore': 10 }, forgeTime: 50, maxUpgrade: 5 },
  { id: 'bronze-helm', name: 'Bronze Helm', rarity: 'Common', description: 'A helmet forged from ancient bronze.', basePower: 25, materials: { 'bronze-ingot': 15, 'leather-strap': 5 }, forgeTime: 35, maxUpgrade: 4 },
  { id: 'world-bridge', name: 'World Bridge', rarity: 'Uncommon', description: 'Connects continents across the great sea.', basePower: 120, materials: { 'star-metal': 10, 'enchanted-wood': 8, 'dragon-bone': 5 }, forgeTime: 180, maxUpgrade: 6 },
  { id: 'sky-tower', name: 'Sky Tower', rarity: 'Uncommon', description: 'A tower reaching into the clouds themselves.', basePower: 150, materials: { 'frozen-lightning': 8, 'crystal-shard': 12, 'enchanted-wood': 10 }, forgeTime: 240, maxUpgrade: 6 },
  { id: 'flame-veil', name: 'Flame Veil', rarity: 'Uncommon', description: 'A cloak woven from living fire.', basePower: 100, materials: { 'phoenix-feather': 5, 'ember-core': 8, 'silk-thread': 10 }, forgeTime: 120, maxUpgrade: 5 },
  { id: 'thunder-mace', name: 'Thunder Mace', rarity: 'Uncommon', description: 'Each strike calls down a thunderbolt.', basePower: 130, materials: { 'frozen-lightning': 10, 'star-metal': 6, 'iron-ore': 15 }, forgeTime: 150, maxUpgrade: 6 },
  { id: 'tide-caller', name: 'Tide Caller', rarity: 'Uncommon', description: 'A trident commanding the ocean\'s fury.', basePower: 110, materials: { 'abyssal-pearl': 6, 'coral-shard': 12, 'star-metal': 4 }, forgeTime: 140, maxUpgrade: 5 },
  { id: 'mountain-mover', name: 'Mountain Mover', rarity: 'Rare', description: 'Shift entire mountain ranges with one push.', basePower: 300, materials: { 'titan-heart': 3, 'earth-crystal': 10, 'star-metal': 15 }, forgeTime: 480, maxUpgrade: 8 },
  { id: 'ocean-drainer', name: 'Ocean Drainer', rarity: 'Rare', description: 'Empty seas to reveal ancient treasures.', basePower: 280, materials: { 'abyssal-pearl': 10, 'levistone': 5, 'crystal-shard': 20 }, forgeTime: 420, maxUpgrade: 7 },
  { id: 'star-catcher', name: 'Star Catcher', rarity: 'Rare', description: 'A net woven from cosmic threads to snare stars.', basePower: 320, materials: { 'cosmic-thread': 8, 'prism-shard': 12, 'frozen-lightning': 10 }, forgeTime: 500, maxUpgrade: 8 },
  { id: 'time-forge', name: 'Time Forge', rarity: 'Rare', description: 'Forges items from moments stolen from time.', basePower: 350, materials: { 'crystallized-time': 6, 'star-metal': 12, 'titan-heart': 2 }, forgeTime: 540, maxUpgrade: 8 },
  { id: 'void-blade', name: 'Void Blade', rarity: 'Rare', description: 'A sword that cuts through the fabric of reality.', basePower: 340, materials: { 'void-essence': 8, 'shadow-steel': 15, 'dragon-bone': 6 }, forgeTime: 480, maxUpgrade: 7 },
  { id: 'wind-chariot', name: 'Wind Chariot', rarity: 'Rare', description: 'Ride the storms across continents.', basePower: 260, materials: { 'cloud-silk': 12, 'enchanted-wood': 15, 'frozen-lightning': 8 }, forgeTime: 400, maxUpgrade: 7 },
  { id: 'sun-crucible', name: 'Sun Crucible', rarity: 'Epic', description: 'A forge powered by a captured star.', basePower: 600, materials: { 'solar-core': 4, 'titan-heart': 5, 'crystallized-time': 8, 'star-metal': 20 }, forgeTime: 900, maxUpgrade: 10 },
  { id: 'moon-weaver', name: 'Moon Weaver', rarity: 'Epic', description: 'Weaves moonlight into tangible creations.', basePower: 580, materials: { 'moonstone': 6, 'cosmic-thread': 15, 'prism-shard': 12, 'silver-dust': 20 }, forgeTime: 850, maxUpgrade: 10 },
  { id: 'doom-hammer', name: 'Doom Hammer', rarity: 'Epic', description: 'When it strikes, the earth trembles.', basePower: 650, materials: { 'titan-heart': 6, 'dragon-bone': 15, 'shadow-steel': 20, 'ember-core': 10 }, forgeTime: 960, maxUpgrade: 10 },
  { id: 'world-tree-seed', name: 'World Tree Seed', rarity: 'Epic', description: 'Plant it and watch a forest grow in seconds.', basePower: 550, materials: { 'life-crystal': 5, 'enchanted-wood': 25, 'phoenix-feather': 8, 'earth-crystal': 15 }, forgeTime: 800, maxUpgrade: 9 },
  { id: 'soul-furnace', name: 'Soul Furnace', rarity: 'Epic', description: 'Burns spiritual energy to fuel creation.', basePower: 700, materials: { 'soul-ember': 8, 'void-essence': 6, 'titan-heart': 4, 'star-metal': 18 }, forgeTime: 1000, maxUpgrade: 10 },
  { id: 'creator-anvil', name: 'Creator Anvil', rarity: 'Epic', description: 'The anvil upon which worlds are hammered.', basePower: 720, materials: { 'titan-heart': 8, 'star-metal': 25, 'crystallized-time': 10, 'ancient-rune': 5 }, forgeTime: 1080, maxUpgrade: 10 },
  { id: 'omega-gauntlet', name: 'Omega Gauntlet', rarity: 'Legendary', description: 'Wield the power to reshape matter itself.', basePower: 1500, materials: { 'titan-heart': 12, 'solar-core': 6, 'soul-ember': 10, 'ancient-rune': 8, 'star-metal': 30 }, forgeTime: 2400, maxUpgrade: 15 },
  { id: 'eternal-crown', name: 'Eternal Crown', rarity: 'Legendary', description: 'Bestows mastery over all known elements.', basePower: 1600, materials: { 'crystallized-time': 15, 'solar-core': 8, 'moonstone': 10, 'ancient-rune': 6, 'cosmic-thread': 20 }, forgeTime: 2600, maxUpgrade: 15 },
  { id: 'dimension-key', name: 'Dimension Key', rarity: 'Legendary', description: 'Unlocks doors between all known dimensions.', basePower: 1700, materials: { 'void-essence': 15, 'crystallized-time': 12, 'titan-heart': 10, 'ancient-rune': 10, 'shadow-steel': 25 }, forgeTime: 2800, maxUpgrade: 15 },
  { id: 'genesis-hammer', name: 'Genesis Hammer', rarity: 'Legendary', description: 'With each strike, a new reality is born.', basePower: 2000, materials: { 'titan-heart': 15, 'solar-core': 10, 'crystallized-time': 15, 'ancient-rune': 12, 'star-metal': 35, 'soul-ember': 10 }, forgeTime: 3600, maxUpgrade: 20 },
  { id: 'world-sculptor', name: 'World Sculptor', rarity: 'Legendary', description: 'Shape continents like clay in your hands.', basePower: 1800, materials: { 'earth-crystal': 20, 'titan-heart': 12, 'life-crystal': 8, 'moonstone': 15, 'enchanted-wood': 30 }, forgeTime: 3000, maxUpgrade: 15 },
  { id: 'void-anchor', name: 'Void Anchor', rarity: 'Common', description: 'Stabilizes the workshop against dimensional shifts.', basePower: 20, materials: { 'shadow-steel': 5, 'stone-slab': 8 }, forgeTime: 30, maxUpgrade: 3 },
  { id: 'ember-lantern', name: 'Ember Lantern', rarity: 'Common', description: 'Lights the deepest forge tunnels.', basePower: 15, materials: { 'ember-core': 3, 'bronze-ingot': 5 }, forgeTime: 25, maxUpgrade: 3 },
  { id: 'quake-plate', name: 'Quake Plate', rarity: 'Uncommon', description: 'Armor plating that absorbs seismic impacts.', basePower: 90, materials: { 'earth-crystal': 8, 'dragon-bone': 5, 'iron-ore': 20 }, forgeTime: 100, maxUpgrade: 5 },
  { id: 'storm-bottle', name: 'Storm Bottle', rarity: 'Uncommon', description: 'Contains a miniature hurricane.', basePower: 95, materials: { 'frozen-lightning': 6, 'crystal-shard': 10, 'glass-flask': 5 }, forgeTime: 110, maxUpgrade: 5 },
  { id: 'golem-core', name: 'Golem Core', rarity: 'Rare', description: 'The heart of a massive stone guardian.', basePower: 250, materials: { 'earth-crystal': 12, 'titan-heart': 2, 'ancient-rune': 3, 'stone-slab': 20 }, forgeTime: 360, maxUpgrade: 7 },
  { id: 'prism-lens', name: 'Prism Lens', rarity: 'Epic', description: 'Focuses raw elemental energy into a beam.', basePower: 500, materials: { 'prism-shard': 15, 'cosmic-thread': 10, 'solar-core': 3, 'crystal-shard': 20 }, forgeTime: 700, maxUpgrade: 9 },
  { id: 'infinity-loop', name: 'Infinity Loop', rarity: 'Legendary', description: 'A ring with no beginning and no end. Eternal energy.', basePower: 1900, materials: { 'crystallized-time': 20, 'soul-ember': 15, 'titan-heart': 10, 'cosmic-thread': 25, 'ancient-rune': 12 }, forgeTime: 3200, maxUpgrade: 18 },
];

const TW_HALLS: Omit<HallInstance, 'level' | 'expanded' | 'capacity'>[] = [
  { id: 'forge-beginnings', name: 'Forge of Beginnings', description: 'Where every titan starts their journey.', maxLevel: 10, bonusType: 'craftSpeed', bonusValue: 5, unlockCost: 0 },
  { id: 'hall-elements', name: 'Hall of Elements', description: 'Master the primal forces of nature.', maxLevel: 15, bonusType: 'elementPower', bonusValue: 8, unlockCost: 500 },
  { id: 'chamber-stars', name: 'Chamber of Stars', description: 'Gaze upon the cosmos for inspiration.', maxLevel: 15, bonusType: 'starYield', bonusValue: 10, unlockCost: 1500 },
  { id: 'vault-ancients', name: 'Vault of Ancients', description: 'Houses relics from forgotten ages.', maxLevel: 12, bonusType: 'discoveryChance', bonusValue: 6, unlockCost: 3000 },
  { id: 'pit-creation', name: 'Pit of Creation', description: 'Raw materials take new form here.', maxLevel: 20, bonusType: 'materialYield', bonusValue: 7, unlockCost: 5000 },
  { id: 'arena-tests', name: 'Arena of Tests', description: 'Prove your creations in combat.', maxLevel: 18, bonusType: 'combatBonus', bonusValue: 9, unlockCost: 8000 },
  { id: 'library-blueprints', name: 'Library of Blueprints', description: 'Contains every known blueprint.', maxLevel: 10, bonusType: 'researchSpeed', bonusValue: 12, unlockCost: 12000 },
  { id: 'throne-room', name: 'Throne Room', description: 'The seat of the Titan Creator.', maxLevel: 25, bonusType: 'allBonus', bonusValue: 15, unlockCost: 20000 },
];

const TW_MATERIALS: { id: string; name: string; rarity: Rarity; description: string; baseValue: number }[] = [
  { id: 'iron-ore', name: 'Iron Ore', rarity: 'Common', description: 'The backbone of all forging.', baseValue: 5 },
  { id: 'bronze-ingot', name: 'Bronze Ingot', rarity: 'Common', description: 'Ancient alloy of copper and tin.', baseValue: 8 },
  { id: 'stone-slab', name: 'Stone Slab', rarity: 'Common', description: 'Hewn from the roots of mountains.', baseValue: 4 },
  { id: 'leather-strap', name: 'Leather Strap', rarity: 'Common', description: 'Tough binding for grips and hilts.', baseValue: 3 },
  { id: 'glass-flask', name: 'Glass Flask', rarity: 'Common', description: 'Contains volatile elemental mixtures.', baseValue: 6 },
  { id: 'ember-core', name: 'Ember Core', rarity: 'Uncommon', description: 'The glowing heart of a dying fire.', baseValue: 15 },
  { id: 'enchanted-wood', name: 'Enchanted Wood', rarity: 'Uncommon', description: 'Wood that grows in magical forests.', baseValue: 18 },
  { id: 'silk-thread', name: 'Silk Thread', rarity: 'Uncommon', description: 'Spun by celestial spiders.', baseValue: 12 },
  { id: 'crystal-shard', name: 'Crystal Shard', rarity: 'Uncommon', description: 'Fractured from a greater geode.', baseValue: 20 },
  { id: 'coral-shard', name: 'Coral Shard', rarity: 'Uncommon', description: 'Harvested from living coral reefs.', baseValue: 16 },
  { id: 'star-metal', name: 'Star Metal', rarity: 'Rare', description: 'Fallen from the heavens in meteor storms.', baseValue: 50 },
  { id: 'dragon-bone', name: 'Dragon Bone', rarity: 'Rare', description: 'The unbreakable skeleton of an ancient wyrm.', baseValue: 55 },
  { id: 'frozen-lightning', name: 'Frozen Lightning', rarity: 'Rare', description: 'A bolt of lightning preserved in ice.', baseValue: 60 },
  { id: 'phoenix-feather', name: 'Phoenix Feather', rarity: 'Rare', description: 'Sheds during rebirth, burns with eternal flame.', baseValue: 65 },
  { id: 'abyssal-pearl', name: 'Abyssal Pearl', rarity: 'Rare', description: 'Formed in the crushing depths.', baseValue: 58 },
  { id: 'earth-crystal', name: 'Earth Crystal', rarity: 'Rare', description: 'Contains the memory of mountains.', baseValue: 52 },
  { id: 'shadow-steel', name: 'Shadow Steel', rarity: 'Rare', description: 'Forged in absolute darkness.', baseValue: 62 },
  { id: 'cloud-silk', name: 'Cloud Silk', rarity: 'Rare', description: 'Woven from condensed cloud matter.', baseValue: 48 },
  { id: 'titan-heart', name: 'Titan Heart', rarity: 'Epic', description: 'The crystallized life force of a titan.', baseValue: 200 },
  { id: 'crystallized-time', name: 'Crystallized Time', rarity: 'Epic', description: 'A moment frozen into solid form.', baseValue: 220 },
  { id: 'void-essence', name: 'Void Essence', rarity: 'Epic', description: 'The substance between dimensions.', baseValue: 210 },
  { id: 'cosmic-thread', name: 'Cosmic Thread', rarity: 'Epic', description: 'Spun from the fabric of spacetime.', baseValue: 230 },
  { id: 'prism-shard', name: 'Prism Shard', rarity: 'Epic', description: 'Refracts pure elemental energy.', baseValue: 195 },
  { id: 'soul-ember', name: 'Soul Ember', rarity: 'Epic', description: 'The last spark of a departed soul.', baseValue: 240 },
  { id: 'solar-core', name: 'Solar Core', rarity: 'Epic', description: 'A fragment of captured sunlight.', baseValue: 250 },
  { id: 'moonstone', name: 'Moonstone', rarity: 'Epic', description: 'Glows with reflected starlight.', baseValue: 205 },
  { id: 'ancient-rune', name: 'Ancient Rune', rarity: 'Epic', description: 'Inscribed by the first titans.', baseValue: 260 },
  { id: 'life-crystal', name: 'Life Crystal', rarity: 'Epic', description: 'Pulses with raw vital energy.', baseValue: 215 },
  { id: 'silver-dust', name: 'Silver Dust', rarity: 'Uncommon', description: 'Moonlight ground into fine powder.', baseValue: 14 },
  { id: 'levistone', name: 'Levistone', rarity: 'Rare', description: 'Defies gravity itself.', baseValue: 70 },
];

const TW_FACILITIES: { id: string; name: string; description: string; maxLevel: number; baseOutput: number; cost: Record<string, number>; fuelType: string }[] = [
  { id: 'elemental-furnace', name: 'Elemental Furnace', description: 'Smelts materials with elemental fire.', maxLevel: 10, baseOutput: 5, cost: { 'iron-ore': 30, 'ember-core': 5 }, fuelType: 'ember-core' },
  { id: 'star-anvil', name: 'Star Anvil', description: 'An anvil that shapes star metal.', maxLevel: 8, baseOutput: 8, cost: { 'star-metal': 10, 'iron-ore': 40 }, fuelType: 'star-metal' },
  { id: 'cosmic-grinder', name: 'Cosmic Grinder', description: 'Grinds materials into cosmic dust.', maxLevel: 12, baseOutput: 6, cost: { 'cosmic-thread': 5, 'crystal-shard': 20 }, fuelType: 'cosmic-thread' },
  { id: 'shadow-forge', name: 'Shadow Forge', description: 'Works in darkness to temper shadow steel.', maxLevel: 10, baseOutput: 7, cost: { 'shadow-steel': 8, 'stone-slab': 25 }, fuelType: 'shadow-steel' },
  { id: 'life-crucible', name: 'Life Crucible', description: 'Fuses organic and inorganic matter.', maxLevel: 8, baseOutput: 9, cost: { 'life-crystal': 3, 'enchanted-wood': 15 }, fuelType: 'life-crystal' },
  { id: 'time-press', name: 'Time Press', description: 'Compresses time into crystallized moments.', maxLevel: 6, baseOutput: 10, cost: { 'crystallized-time': 3, 'ancient-rune': 2 }, fuelType: 'crystallized-time' },
  { id: 'void-loom', name: 'Void Loom', description: 'Weaves void essence into usable thread.', maxLevel: 10, baseOutput: 8, cost: { 'void-essence': 5, 'cosmic-thread': 8 }, fuelType: 'void-essence' },
  { id: 'solar-foundry', name: 'Solar Foundry', description: 'Harnesses starlight for forging.', maxLevel: 8, baseOutput: 12, cost: { 'solar-core': 2, 'star-metal': 15 }, fuelType: 'solar-core' },
  { id: 'lunar-refinery', name: 'Lunar Refinery', description: 'Processes moonstone into silver dust.', maxLevel: 10, baseOutput: 7, cost: { 'moonstone': 4, 'silver-dust': 10 }, fuelType: 'moonstone' },
  { id: 'earth-kiln', name: 'Earth Kiln', description: 'Bakes earth crystals into hardened forms.', maxLevel: 12, baseOutput: 6, cost: { 'earth-crystal': 8, 'stone-slab': 30 }, fuelType: 'earth-crystal' },
  { id: 'storm-vat', name: 'Storm Vat', description: 'Bottles raw lightning from the sky.', maxLevel: 8, baseOutput: 9, cost: { 'frozen-lightning': 5, 'glass-flask': 15 }, fuelType: 'frozen-lightning' },
  { id: 'soul-cauldron', name: 'Soul Cauldron', description: 'Distills soul embers into enchantments.', maxLevel: 6, baseOutput: 11, cost: { 'soul-ember': 4, 'ancient-rune': 3 }, fuelType: 'soul-ember' },
  { id: 'dragon-sawmill', name: 'Dragon Sawmill', description: 'Dragon breath cuts enchanted wood to shape.', maxLevel: 10, baseOutput: 8, cost: { 'enchanted-wood': 12, 'dragon-bone': 3 }, fuelType: 'enchanted-wood' },
  { id: 'prism-array', name: 'Prism Array', description: 'Amplifies light into elemental beams.', maxLevel: 8, baseOutput: 10, cost: { 'prism-shard': 6, 'crystal-shard': 15 }, fuelType: 'prism-shard' },
  { id: 'ancient-inscriber', name: 'Ancient Inscriber', description: 'Transcribes ancient runes onto items.', maxLevel: 6, baseOutput: 13, cost: { 'ancient-rune': 3, 'shadow-steel': 8 }, fuelType: 'ancient-rune' },
  { id: 'phoenix-nest', name: 'Phoenix Nest', description: 'Collects fallen phoenix feathers.', maxLevel: 8, baseOutput: 7, cost: { 'phoenix-feather': 4, 'ember-core': 8 }, fuelType: 'phoenix-feather' },
  { id: 'levitation-press', name: 'Levitation Press', description: 'Shapes levistone into anti-gravity devices.', maxLevel: 6, baseOutput: 9, cost: { 'levistone': 3, 'cloud-silk': 8 }, fuelType: 'levistone' },
  { id: 'coral-lathe', name: 'Coral Lathe', description: 'Spins abyssal pearls into perfect spheres.', maxLevel: 8, baseOutput: 8, cost: { 'abyssal-pearl': 4, 'coral-shard': 10 }, fuelType: 'abyssal-pearl' },
  { id: 'silk-spinner', name: 'Silk Spinner', description: 'Spins silk thread and cloud silk into fabrics.', maxLevel: 10, baseOutput: 6, cost: { 'silk-thread': 8, 'cloud-silk': 6 }, fuelType: 'silk-thread' },
  { id: 'bronze-molder', name: 'Bronze Molder', description: 'Casts bronze into precise shapes.', maxLevel: 12, baseOutput: 4, cost: { 'bronze-ingot': 15, 'leather-strap': 8 }, fuelType: 'bronze-ingot' },
  { id: 'titan-assembler', name: 'Titan Assembler', description: 'Assembles titan hearts into colossal constructs.', maxLevel: 5, baseOutput: 20, cost: { 'titan-heart': 3, 'ancient-rune': 5 }, fuelType: 'titan-heart' },
  { id: 'void-condenser', name: 'Void Condenser', description: 'Condenses raw void into usable essence.', maxLevel: 7, baseOutput: 11, cost: { 'void-essence': 5, 'shadow-steel': 10 }, fuelType: 'void-essence' },
  { id: 'starlight-collector', name: 'Starlight Collector', description: 'Gathers starlight for the forge.', maxLevel: 10, baseOutput: 5, cost: { 'crystal-shard': 20, 'silver-dust': 10 }, fuelType: 'crystal-shard' },
  { id: 'world-forge', name: 'World Forge', description: 'The ultimate forge. Requires all elements.', maxLevel: 3, baseOutput: 50, cost: { 'titan-heart': 5, 'solar-core': 3, 'crystallized-time': 5, 'ancient-rune': 5 }, fuelType: 'titan-heart' },
  { id: 'abyssal-extractor', name: 'Abyssal Extractor', description: 'Dives deep for ocean treasures.', maxLevel: 8, baseOutput: 9, cost: { 'abyssal-pearl': 5, 'coral-shard': 15, 'levistone': 3 }, fuelType: 'abyssal-pearl' },
];

const TW_ABILITIES: { id: string; name: string; description: string; cooldown: number; cost: number; element: string; power: number }[] = [
  { id: 'elemental-fusion', name: 'Elemental Fusion', description: 'Combine two elements into a superior material.', cooldown: 60, cost: 100, element: 'fire', power: 30 },
  { id: 'dimensional-shaping', name: 'Dimensional Shaping', description: 'Bend space to reshape materials.', cooldown: 90, cost: 200, element: 'void', power: 50 },
  { id: 'soul-binding', name: 'Soul Binding', description: 'Bind a soul ember to an item permanently.', cooldown: 120, cost: 300, element: 'soul', power: 70 },
  { id: 'time-acceleration', name: 'Time Acceleration', description: 'Speed up forging by manipulating time.', cooldown: 45, cost: 80, element: 'time', power: 25 },
  { id: 'star-calling', name: 'Star Calling', description: 'Summon a meteor shower of star metal.', cooldown: 180, cost: 500, element: 'star', power: 100 },
  { id: 'dragon-breath', name: 'Dragon Breath', description: 'Unleash dragon fire for smelting.', cooldown: 60, cost: 150, element: 'fire', power: 40 },
  { id: 'earth-shaping', name: 'Earth Shaping', description: 'Mold stone and crystal with bare hands.', cooldown: 50, cost: 90, element: 'earth', power: 35 },
  { id: 'void-tear', name: 'Void Tear', description: 'Rip a hole in reality to find rare materials.', cooldown: 300, cost: 800, element: 'void', power: 150 },
  { id: 'life-infusion', name: 'Life Infusion', description: 'Breathe life into inanimate objects.', cooldown: 120, cost: 250, element: 'life', power: 65 },
  { id: 'moon-blessing', name: 'Moon Blessing', description: 'Lunar energy enhances all materials.', cooldown: 80, cost: 120, element: 'moon', power: 45 },
  { id: 'storm-channeling', name: 'Storm Channeling', description: 'Direct lightning into your forge.', cooldown: 40, cost: 70, element: 'lightning', power: 20 },
  { id: 'prism-amplification', name: 'Prism Amplification', description: 'Amplify the power of any creation.', cooldown: 100, cost: 180, element: 'light', power: 55 },
  { id: 'titan-wrath', name: 'Titan Wrath', description: 'Channel the fury of ancient titans.', cooldown: 240, cost: 600, element: 'fire', power: 120 },
  { id: 'cosmic-weaving', name: 'Cosmic Weaving', description: 'Weave cosmic threads into reality.', cooldown: 150, cost: 350, element: 'star', power: 80 },
  { id: 'shadow-walking', name: 'Shadow Walking', description: 'Step through shadows to find hidden resources.', cooldown: 70, cost: 110, element: 'void', power: 38 },
  { id: 'ancient-recall', name: 'Ancient Recall', description: 'Remember lost techniques from the ancients.', cooldown: 200, cost: 450, element: 'time', power: 90 },
  { id: 'phoenix-rebirth', name: 'Phoenix Rebirth', description: 'Destroy and recreate an item at greater power.', cooldown: 180, cost: 400, element: 'fire', power: 85 },
  { id: 'ocean-communion', name: 'Ocean Communion', description: 'Draw power from the deep sea.', cooldown: 90, cost: 160, element: 'water', power: 48 },
  { id: 'mountain-anthem', name: 'Mountain Anthem', description: 'Sing the song of mountains for strength.', cooldown: 75, cost: 130, element: 'earth', power: 42 },
  { id: 'genesis-spark', name: 'Genesis Spark', description: 'The first spark of creation. Ultimate ability.', cooldown: 600, cost: 1500, element: 'all', power: 300 },
  { id: 'runecarving', name: 'Runecarving', description: 'Inscribe ancient runes into your creations.', cooldown: 110, cost: 200, element: 'earth', power: 52 },
  { id: 'nullification', name: 'Nullification', description: 'Remove all enchantments for raw materials.', cooldown: 30, cost: 50, element: 'void', power: 15 },
];

const TW_ACHIEVEMENTS = [
  { id: 'first-craft', name: 'First Strike', description: 'Craft your first item.', condition: (s: TitanWorkshopState) => s.totalCrafted >= 1 },
  { id: 'ten-crafts', name: 'Deca-Forger', description: 'Craft 10 items.', condition: (s: TitanWorkshopState) => s.totalCrafted >= 10 },
  { id: 'fifty-crafts', name: 'Production Line', description: 'Craft 50 items.', condition: (s: TitanWorkshopState) => s.totalCrafted >= 50 },
  { id: 'hundred-crafts', name: 'Colossal Output', description: 'Craft 100 items.', condition: (s: TitanWorkshopState) => s.totalCrafted >= 100 },
  { id: 'first-legendary', name: 'Legendary Smith', description: 'Craft your first legendary item.', condition: (s: TitanWorkshopState) => s.legendaryCraftsCompleted >= 1 },
  { id: 'five-legendaries', name: 'Myth-Maker', description: 'Craft 5 legendary items.', condition: (s: TitanWorkshopState) => s.legendaryCraftsCompleted >= 5 },
  { id: 'all-halls', name: 'Hall of Halls', description: 'Unlock all 8 workshop halls.', condition: (s: TitanWorkshopState) => Object.values(s.halls).filter(h => h.expanded).length >= 8 },
  { id: 'max-level', name: 'Titan Creator God', description: 'Reach the maximum workshop level.', condition: (s: TitanWorkshopState) => s.level >= 100 },
  { id: 'first-upgrade', name: 'Improvement', description: 'Upgrade your first crafted item.', condition: (s: TitanWorkshopState) => s.totalUpgraded >= 1 },
  { id: 'ten-upgrades', name: 'Refinement', description: 'Upgrade items 10 times.', condition: (s: TitanWorkshopState) => s.totalUpgraded >= 10 },
  { id: 'material-hoarder', name: 'Material Hoarder', description: 'Gather 500 materials total.', condition: (s: TitanWorkshopState) => s.totalGathered >= 500 },
  { id: 'refine-master', name: 'Refinement Master', description: 'Refine 100 materials.', condition: (s: TitanWorkshopState) => s.totalMaterialsRefined >= 100 },
  { id: 'streak-7', name: 'Week of Flames', description: 'Maintain a 7-day streak.', condition: (s: TitanWorkshopState) => s.dayStreak >= 7 },
  { id: 'streak-30', name: 'Month of Creation', description: 'Maintain a 30-day streak.', condition: (s: TitanWorkshopState) => s.dayStreak >= 30 },
  { id: 'enchant-master', name: 'Enchantment Master', description: 'Enchant 25 artifacts.', condition: (s: TitanWorkshopState) => s.totalEnchanted >= 25 },
  { id: 'event-veteran', name: 'Event Veteran', description: 'Participate in 10 forge events.', condition: (s: TitanWorkshopState) => s.eventParticipationCount >= 10 },
  { id: 'world-shaper', name: 'World Shaper', description: 'Complete the World Shaper journey.', condition: (s: TitanWorkshopState) => s.worldShaperProgress >= 100 },
  { id: 'soul-forger', name: 'Soul Forger', description: 'Forge 10 soul-bound items.', condition: (s: TitanWorkshopState) => s.soulForgedItems >= 10 },
];

const TW_DAILY_QUEST_TYPES = [
  { type: 'craft-items', description: 'Craft {target} items', target: [3, 5, 8, 10] },
  { type: 'gather-materials', description: 'Gather {target} materials', target: [10, 15, 20, 30] },
  { type: 'upgrade-items', description: 'Upgrade {target} items', target: [1, 2, 3, 5] },
  { type: 'use-abilities', description: 'Use {target} abilities', target: [3, 5, 7, 10] },
  { type: 'refine-materials', description: 'Refine {target} materials', target: [5, 8, 12, 15] },
];

const TW_FORGE_EVENTS: Omit<ForgeEvent, 'active' | 'remaining'>[] = [
  { id: 'elemental-surge', name: 'Elemental Surge', description: 'Elemental power surges through the forge!', duration: 300, bonusType: 'craftSpeed', bonusMultiplier: 2 },
  { id: 'starfall', name: 'Starfall', description: 'Stars rain down, granting star metal.', duration: 240, bonusType: 'materialYield', bonusMultiplier: 3 },
  { id: 'dimensional-rift', name: 'Dimensional Rift', description: 'A rift opens, revealing rare materials.', duration: 360, bonusType: 'discoveryChance', bonusMultiplier: 2.5 },
  { id: 'titan-wake', name: 'Titan Wake', description: 'The ancients stir, boosting all crafting.', duration: 480, bonusType: 'allBonus', bonusMultiplier: 1.5 },
  { id: 'void-storm', name: 'Void Storm', description: 'The void invades, offering shadow materials.', duration: 180, bonusType: 'voidYield', bonusMultiplier: 4 },
  { id: 'solar-flare', name: 'Solar Flare', description: 'Solar energy overloads all furnaces.', duration: 200, bonusType: 'furnaceOutput', bonusMultiplier: 2.5 },
];

// ─── Default State Factory ───────────────────────────────────────────────────

function createDefaultBlueprints(): Record<string, BlueprintInstance> {
  const result: Record<string, BlueprintInstance> = {};
  for (const bp of TW_BLUEPRINTS) {
    result[bp.id] = { ...bp, crafted: false, craftCount: 0, upgraded: 0, discovered: false, activated: false };
  }
  return result;
}

function createDefaultHalls(): Record<string, HallInstance> {
  const result: Record<string, HallInstance> = {};
  for (const hall of TW_HALLS) {
    result[hall.id] = {
      ...hall,
      level: hall.id === 'forge-beginnings' ? 1 : 0,
      expanded: hall.id === 'forge-beginnings',
      capacity: hall.id === 'forge-beginnings' ? 5 : 0,
    };
  }
  return result;
}

function createDefaultConstructions(): Record<string, ConstructionInstance> {
  const result: Record<string, ConstructionInstance> = {};
  return result;
}

function createDefaultState(): TitanWorkshopState {
  return {
    level: 1,
    xp: 0,
    maxXp: 100,
    coins: 500,
    blueprints: createDefaultBlueprints(),
    halls: createDefaultHalls(),
    discoveries: [],
    achievements: [],
    currentTitle: 0,
    inventory: { 'iron-ore': 20, 'stone-slab': 15, 'bronze-ingot': 10, 'ember-core': 3 },
    dailyQuest: { completed: false, progress: 0, target: 3, type: 'craft-items' },
    dayStreak: 0,
    constructions: createDefaultConstructions(),
    totalCrafted: 0,
    totalUpgraded: 0,
    totalGathered: 0,
    totalEnchanted: 0,
    totalFacilitiesBuilt: 0,
    forgeEvents: [],
    trainingSessions: [],
    masterRank: 0,
    forgeHeat: 50,
    maxForgeHeat: 100,
    dailyRewardClaimed: false,
    lastLoginDate: '',
    legendaryCraftsCompleted: 0,
    totalMaterialsRefined: 0,
    totalAbilitiesUsed: 0,
    eventParticipationCount: 0,
    hallExpansionsTotal: 0,
    rareDiscoveries: 0,
    apprenticeCount: 0,
    completedChallengeRuns: 0,
    titanShards: 0,
    primalEssence: 0,
    cosmicDust: 0,
    soulForgedItems: 0,
    worldShaperProgress: 0,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function canAffordMaterials(inventory: Record<string, number>, cost: Record<string, number>): boolean {
  for (const [mat, amount] of Object.entries(cost)) {
    if ((inventory[mat] || 0) < amount) return false;
  }
  return true;
}

function deductMaterials(inventory: Record<string, number>, cost: Record<string, number>): Record<string, number> {
  const next = { ...inventory };
  for (const [mat, amount] of Object.entries(cost)) {
    next[mat] = Math.max(0, (next[mat] || 0) - amount);
  }
  return next;
}

function generateDailyQuest(): TitanWorkshopState['dailyQuest'] {
  const template = TW_DAILY_QUEST_TYPES[Math.floor(Math.random() * TW_DAILY_QUEST_TYPES.length)];
  const target = template.target[Math.floor(Math.random() * template.target.length)];
  return { completed: false, progress: 0, target, type: template.type };
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export default function useTitanWorkshop(initialState?: TitanWorkshopState) {
  const [state, setState] = useState<TitanWorkshopState>(() => {
    if (initialState) return initialState;
    return createDefaultState();
  });
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Core Accessors ────────────────────────────────────────────────────────

  const getLevel = useCallback(() => stateRef.current.level, []);
  const getXp = useCallback(() => stateRef.current.xp, []);
  const getMaxXp = useCallback(() => stateRef.current.maxXp, []);
  const getCoins = useCallback(() => stateRef.current.coins, []);
  const getForgeHeat = useCallback(() => stateRef.current.forgeHeat, []);
  const getMaxForgeHeat = useCallback(() => stateRef.current.maxForgeHeat, []);
  const getMasterRank = useCallback(() => stateRef.current.masterRank, []);
  const getDayStreak = useCallback(() => stateRef.current.dayStreak, []);
  const getTitanShards = useCallback(() => stateRef.current.titanShards, []);
  const getPrimalEssence = useCallback(() => stateRef.current.primalEssence, []);
  const getCosmicDust = useCallback(() => stateRef.current.cosmicDust, []);
  const getSoulForgedItems = useCallback(() => stateRef.current.soulForgedItems, []);
  const getWorldShaperProgress = useCallback(() => stateRef.current.worldShaperProgress, []);

  const getTitle = useCallback((): string => {
    return TW_TITLES[Math.min(stateRef.current.currentTitle, TW_TITLES.length - 1)];
  }, []);

  const getTitleIndex = useCallback((): number => stateRef.current.currentTitle, []);

  const getXpPercent = useCallback((): number => {
    const s = stateRef.current;
    return s.maxXp > 0 ? Math.floor((s.xp / s.maxXp) * 100) : 0;
  }, []);

  const getForgeHeatPercent = useCallback((): number => {
    const s = stateRef.current;
    return s.maxForgeHeat > 0 ? Math.floor((s.forgeHeat / s.maxForgeHeat) * 100) : 0;
  }, []);

  const getLevelTitle = useCallback((): string => {
    const lvl = stateRef.current.level;
    if (lvl >= 90) return 'Titan Creator God';
    if (lvl >= 70) return 'Titan Forgemaster';
    if (lvl >= 55) return 'World Shaper';
    if (lvl >= 40) return 'Colossal Builder';
    if (lvl >= 28) return 'Grand Architect';
    if (lvl >= 18) return 'Master Artisan';
    if (lvl >= 8) return 'Journeyman Forger';
    return 'Apprentice Smith';
  }, []);

  // ── Blueprint Accessors ───────────────────────────────────────────────────

  const getBlueprint = useCallback((id: string): BlueprintInstance | undefined => {
    return stateRef.current.blueprints[id];
  }, []);

  const getAllBlueprints = useCallback((): BlueprintInstance[] => {
    return Object.values(stateRef.current.blueprints);
  }, []);

  const getBlueprintsByRarity = useCallback((rarity: Rarity): BlueprintInstance[] => {
    return Object.values(stateRef.current.blueprints).filter(bp => bp.rarity === rarity);
  }, []);

  const getDiscoveredBlueprints = useCallback((): BlueprintInstance[] => {
    return Object.values(stateRef.current.blueprints).filter(bp => bp.discovered);
  }, []);

  const getCraftedBlueprints = useCallback((): BlueprintInstance[] => {
    return Object.values(stateRef.current.blueprints).filter(bp => bp.crafted);
  }, []);

  const getUndiscoveredBlueprints = useCallback((): BlueprintInstance[] => {
    return Object.values(stateRef.current.blueprints).filter(bp => !bp.discovered);
  }, []);

  const getBlueprintPower = useCallback((id: string): number => {
    const bp = stateRef.current.blueprints[id];
    if (!bp) return 0;
    const rarityMult = TW_RARITY_MULTIPLIER[bp.rarity];
    return Math.floor(bp.basePower * (1 + bp.upgraded * 0.25) * rarityMult);
  }, []);

  const getBlueprintCraftCost = useCallback((id: string): Record<string, number> => {
    const bp = stateRef.current.blueprints[id];
    if (!bp) return {};
    const mult = bp.craftCount > 0 ? 1 + bp.craftCount * 0.15 : 1;
    const result: Record<string, number> = {};
    for (const [mat, amt] of Object.entries(bp.materials)) {
      result[mat] = Math.ceil(amt * mult);
    }
    return result;
  }, []);

  const getUpgradeCost = useCallback((id: string): Record<string, number> => {
    const bp = stateRef.current.blueprints[id];
    if (!bp || bp.upgraded >= bp.maxUpgrade) return {};
    const lvl = bp.upgraded + 1;
    return { 'titan-shard': lvl * 2, 'ancient-rune': Math.ceil(lvl * 1.5) };
  }, []);

  // ── Hall Accessors ────────────────────────────────────────────────────────

  const getHall = useCallback((id: string): HallInstance | undefined => {
    return stateRef.current.halls[id];
  }, []);

  const getAllHalls = useCallback((): HallInstance[] => {
    return Object.values(stateRef.current.halls);
  }, []);

  const getUnlockedHalls = useCallback((): HallInstance[] => {
    return Object.values(stateRef.current.halls).filter(h => h.expanded);
  }, []);

  const getHallBonus = useCallback((hallId: string): number => {
    const hall = stateRef.current.halls[hallId];
    if (!hall || !hall.expanded) return 0;
    return hall.bonusValue * hall.level;
  }, []);

  const getTotalHallBonus = useCallback((bonusType: string): number => {
    return Object.values(stateRef.current.halls)
      .filter(h => h.expanded && (h.bonusType === bonusType || h.bonusType === 'allBonus'))
      .reduce((sum, h) => sum + h.bonusValue * h.level, 0);
  }, []);

  // ── Material Accessors ────────────────────────────────────────────────────

  const getMaterial = useCallback((id: string): number => {
    return stateRef.current.inventory[id] || 0;
  }, []);

  const getMaterialInfo = useCallback((id: string) => {
    return TW_MATERIALS.find(m => m.id === id);
  }, []);

  const getAllMaterials = useCallback(() => {
    return TW_MATERIALS;
  }, []);

  const getInventory = useCallback((): Record<string, number> => {
    return { ...stateRef.current.inventory };
  }, []);

  const getInventoryValue = useCallback((): number => {
    let total = 0;
    const inv = stateRef.current.inventory;
    for (const [matId, amount] of Object.entries(inv)) {
      const info = TW_MATERIALS.find(m => m.id === matId);
      if (info) total += info.baseValue * amount;
    }
    return total;
  }, []);

  const getMaterialsByRarity = useCallback((rarity: Rarity) => {
    return TW_MATERIALS.filter(m => m.rarity === rarity);
  }, []);

  // ── Construction / Facility Accessors ─────────────────────────────────────

  const getConstruction = useCallback((id: string): ConstructionInstance | undefined => {
    return stateRef.current.constructions[id];
  }, []);

  const getAllConstructions = useCallback((): ConstructionInstance[] => {
    return Object.values(stateRef.current.constructions);
  }, []);

  const getConstructionsByType = useCallback((type: string): ConstructionInstance[] => {
    return Object.values(stateRef.current.constructions).filter(c => c.type === type);
  }, []);

  const getActiveConstructions = useCallback((): ConstructionInstance[] => {
    return Object.values(stateRef.current.constructions).filter(c => c.active);
  }, []);

  const getConstructions = useCallback((): ConstructionInstance[] => {
    return Object.values(stateRef.current.constructions);
  }, []);

  const getFacilityInfo = useCallback((id: string) => {
    return TW_FACILITIES.find(f => f.id === id);
  }, []);

  const getAllFacilities = useCallback(() => {
    return TW_FACILITIES;
  }, []);

  // ── Ability Accessors ─────────────────────────────────────────────────────

  const getAbilityInfo = useCallback((id: string) => {
    return TW_ABILITIES.find(a => a.id === id);
  }, []);

  const getAllAbilities = useCallback(() => {
    return TW_ABILITIES;
  }, []);

  // ── Event Accessors ───────────────────────────────────────────────────────

  const getActiveEvents = useCallback((): ForgeEvent[] => {
    return stateRef.current.forgeEvents.filter(e => e.active);
  }, []);

  const getEventBonus = useCallback((bonusType: string): number => {
    return stateRef.current.forgeEvents
      .filter(e => e.active && e.bonusType === bonusType)
      .reduce((mult, e) => mult * e.bonusMultiplier, 1);
  }, []);

  // ── Quest Accessors ───────────────────────────────────────────────────────

  const getDailyQuest = useCallback(() => {
    return stateRef.current.dailyQuest;
  }, []);

  const getQuestProgressPercent = useCallback((): number => {
    const q = stateRef.current.dailyQuest;
    return q.target > 0 ? Math.floor((q.progress / q.target) * 100) : 0;
  }, []);

  // ── Achievement Accessors ─────────────────────────────────────────────────

  const getAchievements = useCallback(() => {
    return TW_ACHIEVEMENTS;
  }, []);

  const getUnlockedAchievements = useCallback((): string[] => {
    return stateRef.current.achievements;
  }, []);

  const getAchievementProgress = useCallback((id: string): { unlocked: boolean; progress: number } => {
    const ach = TW_ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return { unlocked: false, progress: 0 };
    return {
      unlocked: stateRef.current.achievements.includes(id),
      progress: 0,
    };
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const getStats = useCallback((): Record<string, number | string> => {
    const s = stateRef.current;
    return {
      level: s.level,
      xp: s.xp,
      maxXp: s.maxXp,
      coins: s.coins,
      title: TW_TITLES[s.currentTitle],
      totalCrafted: s.totalCrafted,
      totalUpgraded: s.totalUpgraded,
      totalGathered: s.totalGathered,
      totalEnchanted: s.totalEnchanted,
      totalFacilitiesBuilt: s.totalFacilitiesBuilt,
      dayStreak: s.dayStreak,
      masterRank: s.masterRank,
      forgeHeat: s.forgeHeat,
      legendaryCrafts: s.legendaryCraftsCompleted,
      materialsRefined: s.totalMaterialsRefined,
      abilitiesUsed: s.totalAbilitiesUsed,
      hallExpansions: s.hallExpansionsTotal,
      rareDiscoveries: s.rareDiscoveries,
      apprenticeCount: s.apprenticeCount,
      titanShards: s.titanShards,
      primalEssence: s.primalEssence,
      cosmicDust: s.cosmicDust,
      soulForgedItems: s.soulForgedItems,
      worldShaperProgress: s.worldShaperProgress,
    };
  }, []);

  // ── Title Accessors ───────────────────────────────────────────────────────

  const getAllTitles = useCallback(() => TW_TITLES, []);

  const getNextTitle = useCallback((): string | null => {
    const nextIdx = stateRef.current.currentTitle + 1;
    if (nextIdx < TW_TITLES.length) return TW_TITLES[nextIdx];
    return null;
  }, []);

  // ── Actions: XP & Leveling ────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newMaxXp = prev.maxXp;
      let newTitle = prev.currentTitle;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = xpForLevel(newLevel);
        const titleThresholds = [1, 8, 18, 28, 40, 55, 70, 90];
        for (let i = titleThresholds.length - 1; i >= 0; i--) {
          if (newLevel >= titleThresholds[i]) {
            newTitle = i;
            break;
          }
        }
      }

      return { ...prev, xp: newXp, level: newLevel, maxXp: newMaxXp, currentTitle: newTitle };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.coins >= amount) {
        success = true;
        return { ...prev, coins: prev.coins - amount };
      }
      return prev;
    });
    return success;
  }, []);

  // ── Actions: Blueprint Discovery ──────────────────────────────────────────

  const discoverBlueprint = useCallback((blueprintId: string): boolean => {
    let result = false;
    setState(prev => {
      const bp = prev.blueprints[blueprintId];
      if (!bp || bp.discovered) return prev;
      result = true;
      const newXp = bp.rarity === 'Legendary' ? 200 : bp.rarity === 'Epic' ? 100 : bp.rarity === 'Rare' ? 50 : bp.rarity === 'Uncommon' ? 25 : 10;
      const newCoins = bp.rarity === 'Legendary' ? 500 : bp.rarity === 'Epic' ? 200 : bp.rarity === 'Rare' ? 100 : 50;
      const newDiscoveries = [...prev.discoveries, blueprintId];
      const newRareDiscoveries = (bp.rarity === 'Epic' || bp.rarity === 'Legendary') ? prev.rareDiscoveries + 1 : prev.rareDiscoveries;
      return {
        ...prev,
        blueprints: { ...prev.blueprints, [blueprintId]: { ...bp, discovered: true } },
        discoveries: newDiscoveries,
        xp: prev.xp + newXp,
        maxXp: prev.maxXp,
        coins: prev.coins + newCoins,
        rareDiscoveries: newRareDiscoveries,
      };
    });
    return result;
  }, []);

  const activateBlueprint = useCallback((blueprintId: string): boolean => {
    let result = false;
    setState(prev => {
      const bp = prev.blueprints[blueprintId];
      if (!bp || !bp.discovered || bp.activated) return prev;
      result = true;
      return {
        ...prev,
        blueprints: { ...prev.blueprints, [blueprintId]: { ...bp, activated: true } },
        xp: prev.xp + 30,
        maxXp: prev.maxXp,
        coins: prev.coins + 75,
      };
    });
    return result;
  }, []);

  // ── Actions: Crafting ─────────────────────────────────────────────────────

  const craftItem = useCallback((blueprintId: string): boolean => {
    let result = false;
    setState(prev => {
      const bp = prev.blueprints[blueprintId];
      if (!bp || !bp.discovered) return prev;

      const mult = bp.craftCount > 0 ? 1 + bp.craftCount * 0.15 : 1;
      const cost: Record<string, number> = {};
      for (const [mat, amt] of Object.entries(bp.materials)) {
        cost[mat] = Math.ceil(amt * mult);
      }

      if (!canAffordMaterials(prev.inventory, cost)) return prev;

      result = true;
      const newInventory = deductMaterials(prev.inventory, cost);
      const isLegendary = bp.rarity === 'Legendary';
      const rarityXp = bp.rarity === 'Legendary' ? 150 : bp.rarity === 'Epic' ? 80 : bp.rarity === 'Rare' ? 40 : bp.rarity === 'Uncommon' ? 20 : 8;
      const rarityCoins = bp.rarity === 'Legendary' ? 300 : bp.rarity === 'Epic' ? 150 : bp.rarity === 'Rare' ? 75 : bp.rarity === 'Uncommon' ? 40 : 15;

      return {
        ...prev,
        blueprints: {
          ...prev.blueprints,
          [blueprintId]: { ...bp, crafted: true, craftCount: bp.craftCount + 1 },
        },
        inventory: newInventory,
        totalCrafted: prev.totalCrafted + 1,
        legendaryCraftsCompleted: isLegendary ? prev.legendaryCraftsCompleted + 1 : prev.legendaryCraftsCompleted,
        xp: prev.xp + rarityXp,
        maxXp: prev.maxXp,
        coins: prev.coins + rarityCoins,
        forgeHeat: Math.min(prev.maxForgeHeat, prev.forgeHeat + 5),
        titanShards: prev.titanShards + (isLegendary ? 3 : bp.rarity === 'Epic' ? 2 : bp.rarity === 'Rare' ? 1 : 0),
      };
    });
    if (result) {
      const q = stateRef.current.dailyQuest;
      if (q.type === 'craft-items' && !q.completed) {
        setState(prev => ({
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 },
        }));
      }
    }
    return result;
  }, []);

  const upgradeCraft = useCallback((blueprintId: string): boolean => {
    let result = false;
    setState(prev => {
      const bp = prev.blueprints[blueprintId];
      if (!bp || !bp.crafted || bp.upgraded >= bp.maxUpgrade) return prev;

      const lvl = bp.upgraded + 1;
      const cost = { 'titan-shard': lvl * 2, 'ancient-rune': Math.ceil(lvl * 1.5) };
      const coinCost = lvl * 100;

      if (prev.titanShards < cost['titan-shard'] || prev.coins < coinCost) return prev;

      result = true;
      return {
        ...prev,
        blueprints: { ...prev.blueprints, [blueprintId]: { ...bp, upgraded: bp.upgraded + 1 } },
        totalUpgraded: prev.totalUpgraded + 1,
        titanShards: prev.titanShards - cost['titan-shard'],
        coins: prev.coins - coinCost,
        xp: prev.xp + lvl * 15,
        maxXp: prev.maxXp,
        primalEssence: prev.primalEssence + Math.floor(lvl / 2),
      };
    });
    if (result) {
      const q = stateRef.current.dailyQuest;
      if (q.type === 'upgrade-items' && !q.completed) {
        setState(prev => ({
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 },
        }));
      }
    }
    return result;
  }, []);

  // ── Actions: Material Gathering ───────────────────────────────────────────

  const gatherMaterial = useCallback((materialId: string): number => {
    let amount = 0;
    setState(prev => {
      const info = TW_MATERIALS.find(m => m.id === materialId);
      if (!info) return prev;

      const hallBonus = prev.halls['pit-creation']?.expanded
        ? prev.halls['pit-creation'].bonusValue * prev.halls['pit-creation'].level
        : 0;
      const eventBonus = prev.forgeEvents
        .filter(e => e.active && e.bonusType === 'materialYield')
        .reduce((m, e) => m * e.bonusMultiplier, 1);

      let base = 1;
      if (info.rarity === 'Uncommon') base = 1;
      else if (info.rarity === 'Rare') base = 1;
      else if (info.rarity === 'Epic') base = 1;
      else if (info.rarity === 'Legendary') base = 1;

      const bonusPercent = (hallBonus + (prev.level * 0.5)) / 100;
      amount = Math.max(1, Math.floor(base * (1 + bonusPercent) * eventBonus));

      const rng = Math.random();
      const discoveryChance = 0.02 + (prev.halls['vault-ancients']?.expanded
        ? prev.halls['vault-ancients'].bonusValue * prev.halls['vault-ancients'].level / 100
        : 0);
      const eventDiscBonus = prev.forgeEvents
        .filter(e => e.active && e.bonusType === 'discoveryChance')
        .reduce((m, e) => m * e.bonusMultiplier, 1);

      if (rng < discoveryChance * eventDiscBonus) {
        const undiscovered = Object.values(prev.blueprints).filter(bp => !bp.discovered);
        if (undiscovered.length > 0) {
          const toDiscover = undiscovered[Math.floor(Math.random() * undiscovered.length)];
          prev = {
            ...prev,
            blueprints: {
              ...prev.blueprints,
              [toDiscover.id]: { ...toDiscover, discovered: true },
            },
            discoveries: [...prev.discoveries, toDiscover.id],
            rareDiscoveries: (toDiscover.rarity === 'Epic' || toDiscover.rarity === 'Legendary')
              ? prev.rareDiscoveries + 1
              : prev.rareDiscoveries,
          };
        }
      }

      return {
        ...prev,
        inventory: { ...prev.inventory, [materialId]: (prev.inventory[materialId] || 0) + amount },
        totalGathered: prev.totalGathered + amount,
        xp: prev.xp + 2,
        maxXp: prev.maxXp,
        coins: prev.coins + 3,
        worldShaperProgress: Math.min(100, prev.worldShaperProgress + 0.1),
      };
    });
    if (amount > 0) {
      const q = stateRef.current.dailyQuest;
      if (q.type === 'gather-materials' && !q.completed) {
        setState(prev => ({
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: prev.dailyQuest.progress + amount },
        }));
      }
    }
    return amount;
  }, []);

  const refineMaterial = useCallback((materialId: string): boolean => {
    let result = false;
    setState(prev => {
      const info = TW_MATERIALS.find(m => m.id === materialId);
      if (!info) return prev;
      const count = prev.inventory[materialId] || 0;
      if (count < 5) return prev;

      result = true;
      const refined = Math.floor(count / 5);
      const remainder = count % 5;

      const hallBonus = getTotalHallBonus('materialYield');
      const bonusRefined = Math.floor(refined * (1 + hallBonus / 100));
      const coinsGained = bonusRefined * info.baseValue;

      return {
        ...prev,
        inventory: { ...prev.inventory, [materialId]: remainder },
        totalMaterialsRefined: prev.totalMaterialsRefined + bonusRefined,
        coins: prev.coins + coinsGained,
        xp: prev.xp + bonusRefined * 3,
        maxXp: prev.maxXp,
        cosmicDust: prev.cosmicDust + Math.floor(bonusRefined / 3),
        primalEssence: prev.primalEssence + (info.rarity === 'Epic' || info.rarity === 'Legendary' ? 1 : 0),
      };
    });
    if (result) {
      const q = stateRef.current.dailyQuest;
      if (q.type === 'refine-materials' && !q.completed) {
        setState(prev => ({
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 },
        }));
      }
    }
    return result;
  }, []);

  // ── Actions: Hall Expansion ───────────────────────────────────────────────

  const expandHall = useCallback((hallId: string): boolean => {
    let result = false;
    setState(prev => {
      const hall = prev.halls[hallId];
      if (!hall) return prev;

      if (!hall.expanded) {
        if (prev.coins < hall.unlockCost) return prev;
        result = true;
        return {
          ...prev,
          halls: { ...prev.halls, [hallId]: { ...hall, expanded: true, level: 1, capacity: 5 } },
          coins: prev.coins - hall.unlockCost,
          xp: prev.xp + 50,
          maxXp: prev.maxXp,
          hallExpansionsTotal: prev.hallExpansionsTotal + 1,
        };
      }

      if (hall.level >= hall.maxLevel) return prev;
      const upgradeCost = hall.level * 200;
      if (prev.coins < upgradeCost) return prev;

      result = true;
      return {
        ...prev,
        halls: { ...prev.halls, [hallId]: { ...hall, level: hall.level + 1, capacity: hall.capacity + 3 } },
        coins: prev.coins - upgradeCost,
        xp: prev.xp + 20 + hall.level * 5,
        maxXp: prev.maxXp,
      };
    });
    return result;
  }, []);

  // ── Actions: Facility Building ────────────────────────────────────────────

  const buildFacility = useCallback((facilityId: string): boolean => {
    let result = false;
    setState(prev => {
      const info = TW_FACILITIES.find(f => f.id === facilityId);
      if (!info) return prev;
      if (prev.constructions[facilityId]) return prev;
      if (!canAffordMaterials(prev.inventory, info.cost)) return prev;

      result = true;
      const newInventory = deductMaterials(prev.inventory, info.cost);
      const facility: ConstructionInstance = {
        id: facilityId,
        name: info.name,
        type: 'facility',
        level: 1,
        maxLevel: info.maxLevel,
        built: true,
        active: true,
        output: info.baseOutput,
        cost: info.cost,
        description: info.description,
      };
      return {
        ...prev,
        constructions: { ...prev.constructions, [facilityId]: facility },
        inventory: newInventory,
        totalFacilitiesBuilt: prev.totalFacilitiesBuilt + 1,
        xp: prev.xp + 40,
        maxXp: prev.maxXp,
        coins: prev.coins + 25,
      };
    });
    return result;
  }, []);

  const upgradeFacility = useCallback((facilityId: string): boolean => {
    let result = false;
    setState(prev => {
      const facility = prev.constructions[facilityId];
      if (!facility || !facility.built || facility.level >= facility.maxLevel) return prev;
      const coinCost = facility.level * 150;
      if (prev.coins < coinCost) return prev;

      const info = TW_FACILITIES.find(f => f.id === facilityId);
      const baseOutput = info?.baseOutput || facility.output;
      const newOutput = Math.floor(baseOutput * (1 + (facility.level + 1) * 0.2));

      result = true;
      return {
        ...prev,
        constructions: { ...prev.constructions, [facilityId]: { ...facility, level: facility.level + 1, output: newOutput } },
        coins: prev.coins - coinCost,
        xp: prev.xp + 15 + facility.level * 8,
        maxXp: prev.maxXp,
      };
    });
    return result;
  }, []);

  const toggleFacility = useCallback((facilityId: string): boolean => {
    let result = false;
    setState(prev => {
      const facility = prev.constructions[facilityId];
      if (!facility || !facility.built) return prev;
      result = true;
      return {
        ...prev,
        constructions: { ...prev.constructions, [facilityId]: { ...facility, active: !facility.active } },
      };
    });
    return result;
  }, []);

  const demolishFacility = useCallback((facilityId: string): boolean => {
    let result = false;
    setState(prev => {
      const facility = prev.constructions[facilityId];
      if (!facility) return prev;
      result = true;
      const newConstructions = { ...prev.constructions };
      delete newConstructions[facilityId];
      const refundCoins = facility.level * 50;
      return { ...prev, constructions: newConstructions, coins: prev.coins + refundCoins };
    });
    return result;
  }, []);

  // ── Actions: Enchantment ──────────────────────────────────────────────────

  const enchantArtifact = useCallback((blueprintId: string): boolean => {
    let result = false;
    setState(prev => {
      const bp = prev.blueprints[blueprintId];
      if (!bp || !bp.crafted) return prev;
      const cost = { 'soul-ember': 1, 'primal-essence': 2 };
      if ((prev.inventory['soul-ember'] || 0) < cost['soul-ember'] || prev.primalEssence < cost['primal-essence']) return prev;

      result = true;
      const enchanted = Math.random() < 0.7 + prev.level * 0.005;
      const xpGain = enchanted ? 60 : 15;
      const coinGain = enchanted ? 100 : 20;
      const bonusUpgrades = enchanted ? 1 : 0;

      return {
        ...prev,
        blueprints: {
          ...prev.blueprints,
          [blueprintId]: {
            ...bp,
            upgraded: Math.min(bp.maxUpgrade, bp.upgraded + bonusUpgrades),
          },
        },
        inventory: { ...prev.inventory, 'soul-ember': Math.max(0, (prev.inventory['soul-ember'] || 0) - cost['soul-ember']) },
        primalEssence: prev.primalEssence - cost['primal-essence'],
        totalEnchanted: prev.totalEnchanted + 1,
        xp: prev.xp + xpGain,
        maxXp: prev.maxXp,
        coins: prev.coins + coinGain,
        soulForgedItems: enchanted ? prev.soulForgedItems + 1 : prev.soulForgedItems,
        cosmicDust: prev.cosmicDust + (enchanted ? 2 : 0),
      };
    });
    return result;
  }, []);

  // ── Actions: Crafting Abilities ───────────────────────────────────────────

  const castCraftingAbility = useCallback((abilityId: string): boolean => {
    let result = false;
    setState(prev => {
      const ability = TW_ABILITIES.find(a => a.id === abilityId);
      if (!ability) return prev;
      if (prev.coins < ability.cost) return prev;

      result = true;
      const newCoins = prev.coins - ability.cost;
      let newInventory = { ...prev.inventory };
      let xpGain = ability.power;
      let materialGain: Record<string, number> = {};
      let heatGain = 10;

      switch (ability.element) {
        case 'fire':
          materialGain['ember-core'] = Math.floor(ability.power / 10);
          materialGain['phoenix-feather'] = Math.random() < 0.2 ? 1 : 0;
          break;
        case 'void':
          materialGain['void-essence'] = Math.floor(ability.power / 25);
          materialGain['shadow-steel'] = Math.floor(ability.power / 15);
          break;
        case 'soul':
          materialGain['soul-ember'] = Math.floor(ability.power / 20);
          break;
        case 'time':
          materialGain['crystallized-time'] = Math.random() < 0.3 ? 1 : 0;
          xpGain *= 2;
          break;
        case 'star':
          materialGain['star-metal'] = Math.floor(ability.power / 15);
          materialGain['cosmic-thread'] = Math.floor(ability.power / 20);
          break;
        case 'earth':
          materialGain['earth-crystal'] = Math.floor(ability.power / 12);
          materialGain['stone-slab'] = Math.floor(ability.power / 5);
          break;
        case 'moon':
          materialGain['moonstone'] = Math.floor(ability.power / 22);
          materialGain['silver-dust'] = Math.floor(ability.power / 8);
          break;
        case 'lightning':
          materialGain['frozen-lightning'] = Math.floor(ability.power / 12);
          break;
        case 'life':
          materialGain['enchanted-wood'] = Math.floor(ability.power / 10);
          materialGain['life-crystal'] = Math.random() < 0.25 ? 1 : 0;
          break;
        case 'water':
          materialGain['abyssal-pearl'] = Math.floor(ability.power / 18);
          materialGain['coral-shard'] = Math.floor(ability.power / 10);
          break;
        case 'light':
          materialGain['prism-shard'] = Math.floor(ability.power / 15);
          materialGain['crystal-shard'] = Math.floor(ability.power / 8);
          break;
        case 'all':
          materialGain['titan-heart'] = Math.random() < 0.15 ? 1 : 0;
          materialGain['ancient-rune'] = Math.random() < 0.3 ? 1 : 0;
          materialGain['star-metal'] = Math.floor(ability.power / 20);
          materialGain['soul-ember'] = Math.floor(ability.power / 30);
          heatGain = 30;
          xpGain *= 3;
          break;
      }

      for (const [mat, amt] of Object.entries(materialGain)) {
        if (amt > 0) {
          newInventory[mat] = (newInventory[mat] || 0) + amt;
        }
      }

      return {
        ...prev,
        coins: newCoins,
        inventory: newInventory,
        xp: prev.xp + xpGain,
        maxXp: prev.maxXp,
        totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
        forgeHeat: Math.min(prev.maxForgeHeat, prev.forgeHeat + heatGain),
        worldShaperProgress: Math.min(100, prev.worldShaperProgress + 0.2),
      };
    });
    if (result) {
      const q = stateRef.current.dailyQuest;
      if (q.type === 'use-abilities' && !q.completed) {
        setState(prev => ({
          ...prev,
          dailyQuest: { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 },
        }));
      }
    }
    return result;
  }, []);

  // ── Actions: Daily Quest ──────────────────────────────────────────────────

  const completeDailyQuest = useCallback((): boolean => {
    let result = false;
    setState(prev => {
      const q = prev.dailyQuest;
      if (q.completed || q.progress < q.target) return prev;
      result = true;
      const rewardCoins = 100 + q.target * 50;
      const rewardXp = 30 + q.target * 20;
      return {
        ...prev,
        dailyQuest: { ...q, completed: true },
        coins: prev.coins + rewardCoins,
        xp: prev.xp + rewardXp,
        maxXp: prev.maxXp,
        dayStreak: prev.dayStreak + 1,
        titanShards: prev.titanShards + 1,
      };
    });
    return result;
  }, []);

  const newDailyQuest = useCallback(() => {
    setState(prev => ({
      ...prev,
      dailyQuest: generateDailyQuest(),
    }));
  }, []);

  // ── Actions: Forge Events ─────────────────────────────────────────────────

  const triggerForgeEvent = useCallback((eventId: string): boolean => {
    let result = false;
    setState(prev => {
      const template = TW_FORGE_EVENTS.find(e => e.id === eventId);
      if (!template) return prev;
      if (prev.forgeEvents.some(e => e.active && e.id === eventId)) return prev;

      result = true;
      const event: ForgeEvent = {
        ...template,
        active: true,
        remaining: template.duration,
      };
      return {
        ...prev,
        forgeEvents: [...prev.forgeEvents, event],
        eventParticipationCount: prev.eventParticipationCount + 1,
        xp: prev.xp + 20,
        maxXp: prev.maxXp,
      };
    });
    return result;
  }, []);

  const tickForgeEvents = useCallback((seconds: number) => {
    setState(prev => {
      const updatedEvents = prev.forgeEvents
        .map(e => e.active ? { ...e, remaining: Math.max(0, e.remaining - seconds) } : e)
        .map(e => e.active && e.remaining <= 0 ? { ...e, active: false } : e);
      const completedBonuses = prev.forgeEvents.filter(e => e.active && e.remaining <= 0);
      const bonusXp = completedBonuses.reduce((sum, e) => sum + Math.floor(e.duration / 10), 0);
      const bonusCoins = completedBonuses.length * 50;
      return { ...prev, forgeEvents: updatedEvents, xp: prev.xp + bonusXp, maxXp: prev.maxXp, coins: prev.coins + bonusCoins };
    });
  }, []);

  const endForgeEvent = useCallback((eventId: string): boolean => {
    let result = false;
    setState(prev => {
      const event = prev.forgeEvents.find(e => e.id === eventId);
      if (!event || !event.active) return prev;
      result = true;
      const bonusCoins = Math.floor(event.remaining * 0.5);
      return {
        ...prev,
        forgeEvents: prev.forgeEvents.map(e => e.id === eventId ? { ...e, active: false, remaining: 0 } : e),
        coins: prev.coins + bonusCoins,
        xp: prev.xp + 25,
        maxXp: prev.maxXp,
      };
    });
    return result;
  }, []);

  // ── Actions: Training / Apprentices ───────────────────────────────────────

  const hireApprentice = useCallback((): boolean => {
    let result = false;
    setState(prev => {
      if (prev.coins < 300) return prev;
      result = true;
      return {
        ...prev,
        apprenticeCount: prev.apprenticeCount + 1,
        coins: prev.coins - 300,
        xp: prev.xp + 10,
        maxXp: prev.maxXp,
      };
    });
    return result;
  }, []);

  const trainApprentice = useCallback((skill: string): boolean => {
    let result = false;
    setState(prev => {
      if (prev.apprenticeCount <= 0 || prev.coins < 50) return prev;
      result = true;
      return {
        ...prev,
        masterRank: prev.masterRank + 1,
        coins: prev.coins - 50,
        xp: prev.xp + 5,
        maxXp: prev.maxXp,
        forgeHeat: Math.min(prev.maxForgeHeat, prev.forgeHeat + 2),
      };
    });
    return result;
  }, []);

  // ── Actions: Forge Heat Management ────────────────────────────────────────

  const stokeForge = useCallback((): boolean => {
    let result = false;
    setState(prev => {
      if (prev.forgeHeat >= prev.maxForgeHeat) return prev;
      if ((prev.inventory['ember-core'] || 0) < 1) return prev;
      result = true;
      return {
        ...prev,
        forgeHeat: Math.min(prev.maxForgeHeat, prev.forgeHeat + 15),
        inventory: { ...prev.inventory, 'ember-core': prev.inventory['ember-core'] - 1 },
      };
    });
    return result;
  }, []);

  const coolForge = useCallback(() => {
    setState(prev => ({
      ...prev,
      forgeHeat: Math.max(0, prev.forgeHeat - 20),
    }));
  }, []);

  // ── Actions: Daily Reward & Login ─────────────────────────────────────────

  const claimDailyReward = useCallback((): boolean => {
    let result = false;
    setState(prev => {
      if (prev.dailyRewardClaimed) return prev;
      result = true;
      const streakBonus = 1 + prev.dayStreak * 0.1;
      const coinReward = Math.floor(100 * streakBonus);
      const xpReward = Math.floor(50 * streakBonus);
      return {
        ...prev,
        dailyRewardClaimed: true,
        coins: prev.coins + coinReward,
        xp: prev.xp + xpReward,
        maxXp: prev.maxXp,
        titanShards: prev.titanShards + 1,
        cosmicDust: prev.cosmicDust + Math.floor(streakBonus),
      };
    });
    return result;
  }, []);

  const checkDailyReset = useCallback((): boolean => {
    const today = getTodayString();
    if (stateRef.current.lastLoginDate !== today) {
      setState(prev => {
        const isConsecutive = prev.lastLoginDate === new Date(Date.now() - 86400000).toISOString().split('T')[0];
        return {
          ...prev,
          lastLoginDate: today,
          dailyRewardClaimed: false,
          dailyQuest: generateDailyQuest(),
          dayStreak: isConsecutive ? prev.dayStreak + 1 : 1,
          forgeHeat: Math.max(50, prev.forgeHeat - 10),
        };
      });
      return true;
    }
    return false;
  }, []);

  // ── Actions: Achievements ─────────────────────────────────────────────────

  const checkAchievements = useCallback((): string[] => {
    const newAchievements: string[] = [];
    setState(prev => {
      let updated = { ...prev };
      for (const ach of TW_ACHIEVEMENTS) {
        if (prev.achievements.includes(ach.id)) continue;
        if (ach.condition(prev)) {
          newAchievements.push(ach.id);
          updated.achievements = [...updated.achievements, ach.id];
          updated.coins = updated.coins + 200;
          updated.xp = updated.xp + 100;
          updated.titanShards = updated.titanShards + 2;
        }
      }
      updated.maxXp = updated.maxXp;
      return updated;
    });
    return newAchievements;
  }, []);

  // ── Actions: Challenge Runs ───────────────────────────────────────────────

  const startChallengeRun = useCallback((): boolean => {
    let result = false;
    setState(prev => {
      if (prev.coins < 200) return prev;
      result = true;
      return {
        ...prev,
        coins: prev.coins - 200,
        forgeHeat: prev.maxForgeHeat,
      };
    });
    return result;
  }, []);

  const completeChallengeRun = useCallback((success: boolean): boolean => {
    let result = false;
    setState(prev => {
      result = true;
      const xpGain = success ? 200 : 50;
      const coinGain = success ? 500 : 100;
      const shardGain = success ? 3 : 0;
      return {
        ...prev,
        completedChallengeRuns: prev.completedChallengeRuns + 1,
        xp: prev.xp + xpGain,
        maxXp: prev.maxXp,
        coins: prev.coins + coinGain,
        titanShards: prev.titanShards + shardGain,
        primalEssence: prev.primalEssence + (success ? 2 : 0),
        worldShaperProgress: Math.min(100, prev.worldShaperProgress + (success ? 2 : 0.5)),
      };
    });
    return result;
  }, []);

  // ── Actions: Trading ──────────────────────────────────────────────────────

  const tradeMaterials = useCallback((giveId: string, giveAmount: number, receiveId: string): number => {
    let received = 0;
    setState(prev => {
      if ((prev.inventory[giveId] || 0) < giveAmount) return prev;
      const giveInfo = TW_MATERIALS.find(m => m.id === giveId);
      const receiveInfo = TW_MATERIALS.find(m => m.id === receiveId);
      if (!giveInfo || !receiveInfo) return prev;

      const ratio = giveInfo.baseValue / receiveInfo.baseValue;
      received = Math.max(1, Math.floor(giveAmount * ratio * 0.8));

      return {
        ...prev,
        inventory: {
          ...prev.inventory,
          [giveId]: prev.inventory[giveId] - giveAmount,
          [receiveId]: (prev.inventory[receiveId] || 0) + received,
        },
        coins: Math.max(0, prev.coins - 10),
      };
    });
    return received;
  }, []);

  // ── Actions: World Shaper ─────────────────────────────────────────────────

  const advanceWorldShaper = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      worldShaperProgress: Math.min(100, prev.worldShaperProgress + amount),
    }));
  }, []);

  // ── Actions: Misc ─────────────────────────────────────────────────────────

  const addTitanShards = useCallback((amount: number) => {
    setState(prev => ({ ...prev, titanShards: prev.titanShards + amount }));
  }, []);

  const spendTitanShards = useCallback((amount: number): boolean => {
    let result = false;
    setState(prev => {
      if (prev.titanShards < amount) return prev;
      result = true;
      return { ...prev, titanShards: prev.titanShards - amount };
    });
    return result;
  }, []);

  const addPrimalEssence = useCallback((amount: number) => {
    setState(prev => ({ ...prev, primalEssence: prev.primalEssence + amount }));
  }, []);

  const addCosmicDust = useCallback((amount: number) => {
    setState(prev => ({ ...prev, cosmicDust: prev.cosmicDust + amount }));
  }, []);

  const setForgeHeat = useCallback((value: number) => {
    setState(prev => ({ ...prev, forgeHeat: Math.max(0, Math.min(prev.maxForgeHeat, value)) }));
  }, []);

  const addInventoryItem = useCallback((itemId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      inventory: { ...prev.inventory, [itemId]: (prev.inventory[itemId] || 0) + amount },
    }));
  }, []);

  const removeInventoryItem = useCallback((itemId: string, amount: number): boolean => {
    let result = false;
    setState(prev => {
      if ((prev.inventory[itemId] || 0) < amount) return prev;
      result = true;
      return {
        ...prev,
        inventory: { ...prev.inventory, [itemId]: prev.inventory[itemId] - amount },
      };
    });
    return result;
  }, []);

  const resetWorkshop = useCallback(() => {
    setState(createDefaultState());
  }, []);

  // ── Memoized Computed Values ──────────────────────────────────────────────

  const totalInventoryCount = useMemo((): number => {
    return Object.values(state.inventory).reduce((sum, count) => sum + count, 0);
  }, [state]);

  const discoveredCount = useMemo((): number => {
    return Object.values(state.blueprints).filter(bp => bp.discovered).length;
  }, [state]);

  const craftedCount = useMemo((): number => {
    return Object.values(state.blueprints).filter(bp => bp.crafted).length;
  }, [state]);

  const activatedCount = useMemo((): number => {
    return Object.values(state.blueprints).filter(bp => bp.activated).length;
  }, [state]);

  const unlockedHallsCount = useMemo((): number => {
    return Object.values(state.halls).filter(h => h.expanded).length;
  }, [state]);

  const facilityCount = useMemo((): number => {
    return Object.values(state.constructions).filter(c => c.built && c.type === 'facility').length;
  }, [state]);

  const totalBlueprintPower = useMemo((): number => {
    return Object.values(state.blueprints)
      .filter(bp => bp.crafted)
      .reduce((sum, bp) => sum + Math.floor(bp.basePower * (1 + bp.upgraded * 0.25) * TW_RARITY_MULTIPLIER[bp.rarity]), 0);
  }, [state]);

  const averageBlueprintLevel = useMemo((): number => {
    const crafted = Object.values(state.blueprints).filter(bp => bp.crafted);
    if (crafted.length === 0) return 0;
    return crafted.reduce((sum, bp) => sum + bp.upgraded, 0) / crafted.length;
  }, [state]);

  const topRarity = useMemo((): Rarity => {
    const crafted = state.blueprints;
    if (Object.values(crafted).some(bp => bp.crafted && bp.rarity === 'Legendary')) return 'Legendary';
    if (Object.values(crafted).some(bp => bp.crafted && bp.rarity === 'Epic')) return 'Epic';
    if (Object.values(crafted).some(bp => bp.crafted && bp.rarity === 'Rare')) return 'Rare';
    if (Object.values(crafted).some(bp => bp.crafted && bp.rarity === 'Uncommon')) return 'Uncommon';
    return 'Common';
  }, [state]);

  const forgeEfficiency = useMemo((): number => {
    const s = state;
    const hallBonus = Object.values(s.halls)
      .filter(h => h.expanded)
      .reduce((sum, h) => sum + h.bonusValue * h.level * 0.5, 0);
    const facilityBonus = Object.values(s.constructions)
      .filter(c => c.built && c.active)
      .reduce((sum, c) => sum + c.output * 0.3, 0);
    const heatBonus = (s.forgeHeat / s.maxForgeHeat) * 20;
    return Math.min(100, Math.floor(hallBonus + facilityBonus + heatBonus));
  }, [state]);

  const dailyQuestDescription = useMemo((): string => {
    const q = state.dailyQuest;
    const template = TW_DAILY_QUEST_TYPES.find(t => t.type === q.type);
    if (!template) return q.type;
    return template.description.replace('{target}', String(q.target));
  }, [state]);

  const masteryScore = useMemo((): number => {
    const s = state;
    const bpScore = Object.values(s.blueprints)
      .filter(bp => bp.crafted)
      .reduce((sum, bp) => sum + (bp.upgraded + 1) * TW_RARITY_MULTIPLIER[bp.rarity], 0);
    return Math.floor(bpScore + s.level * 10 + s.masterRank * 5 + s.hallExpansionsTotal * 20 + s.totalFacilitiesBuilt * 15 + s.eventParticipationCount * 8);
  }, [state]);

  const rarityDistribution = useMemo((): Record<Rarity, number> => {
    const dist: Record<Rarity, number> = { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
    for (const bp of Object.values(state.blueprints)) {
      if (bp.crafted) dist[bp.rarity]++;
    }
    return dist;
  }, [state]);

  // ── Color Theme Export ────────────────────────────────────────────────────

  const colorTheme = useMemo(() => ({
    primary: '#D97706',
    accent: '#F59E0B',
    highlight: '#FBBF24',
    forgeRed: '#DC2626',
    steelBlue: '#2563EB',
    bgDark: '#1C1917',
    bgMedium: '#292524',
    bgLight: '#44403C',
    rarityColors: TW_RARITY_COLORS,
  }), []);

  // ── Actions: Mass Operations ───────────────────────────────────────────

  const massGatherAll = useCallback((): Record<string, number> => {
    const gathered: Record<string, number> = {};
    setState(prev => {
      let updated = { ...prev };
      let newInventory = { ...prev.inventory };
      for (const mat of TW_MATERIALS) {
        const amount = gatherMaterial(mat.id);
        if (amount > 0) {
          gathered[mat.id] = (gathered[mat.id] || 0) + amount;
        }
      }
      return updated;
    });
    return gathered;
  }, []);

  const autoRefineAll = useCallback((): number => {
    let totalRefined = 0;
    setState(prev => {
      let newInventory = { ...prev.inventory };
      let coinsEarned = 0;
      let xpEarned = 0;
      let refinedCount = 0;
      let cosmicEarned = 0;
      let primalEarned = 0;

      for (const mat of TW_MATERIALS) {
        const count = newInventory[mat.id] || 0;
        const groups = Math.floor(count / 5);
        if (groups <= 0) continue;
        newInventory[mat.id] = count % 5;
        refinedCount += groups;
        coinsEarned += groups * mat.baseValue;
        xpEarned += groups * 3;
        cosmicEarned += Math.floor(groups / 3);
        if (mat.rarity === 'Epic' || mat.rarity === 'Legendary') primalEarned += 1;
      }

      totalRefined = refinedCount;
      return {
        ...prev,
        inventory: newInventory,
        totalMaterialsRefined: prev.totalMaterialsRefined + refinedCount,
        coins: prev.coins + coinsEarned,
        xp: prev.xp + xpEarned,
        maxXp: prev.maxXp,
        cosmicDust: prev.cosmicDust + cosmicEarned,
        primalEssence: prev.primalEssence + primalEarned,
      };
    });
    return totalRefined;
  }, []);

  const craftBestAffordable = useCallback((): string | null => {
    const s = stateRef.current;
    const discovered = Object.values(s.blueprints).filter(bp => bp.discovered);
    const sorted = [...discovered].sort((a, b) => b.basePower - a.basePower);
    for (const bp of sorted) {
      const cost = getBlueprintCraftCost(bp.id);
      if (canAffordMaterials(s.inventory, cost)) {
        const success = craftItem(bp.id);
        if (success) return bp.id;
      }
    }
    return null;
  }, []);

  // ── Actions: Forge Heat Auto Management ───────────────────────────────────

  const autoStokeForge = useCallback((): boolean => {
    let stoked = false;
    setState(prev => {
      if (prev.forgeHeat >= prev.maxForgeHeat * 0.8) return prev;
      const emberCount = prev.inventory['ember-core'] || 0;
      const needed = Math.min(3, emberCount);
      if (needed <= 0) return prev;
      stoked = true;
      return {
        ...prev,
        forgeHeat: Math.min(prev.maxForgeHeat, prev.forgeHeat + needed * 15),
        inventory: { ...prev.inventory, 'ember-core': emberCount - needed },
      };
    });
    return stoked;
  }, []);

  // ── Actions: Random Discovery ─────────────────────────────────────────────

  const randomDiscovery = useCallback((): string | null => {
    let discoveredId: string | null = null;
    setState(prev => {
      const undiscovered = Object.values(prev.blueprints).filter(bp => !bp.discovered);
      if (undiscovered.length === 0) return prev;

      const baseChance = 0.05 + prev.level * 0.002;
      const hallBonus = prev.halls['vault-ancients']?.expanded
        ? prev.halls['vault-ancients'].bonusValue * prev.halls['vault-ancients'].level / 100
        : 0;
      const eventBonus = prev.forgeEvents
        .filter(e => e.active && e.bonusType === 'discoveryChance')
        .reduce((m, e) => m * e.bonusMultiplier, 1);

      if (Math.random() < (baseChance + hallBonus) * eventBonus) {
        const bp = undiscovered[Math.floor(Math.random() * undiscovered.length)];
        discoveredId = bp.id;
        const xpReward = bp.rarity === 'Legendary' ? 200 : bp.rarity === 'Epic' ? 100 : bp.rarity === 'Rare' ? 50 : 25;
        return {
          ...prev,
          blueprints: { ...prev.blueprints, [bp.id]: { ...bp, discovered: true } },
          discoveries: [...prev.discoveries, bp.id],
          xp: prev.xp + xpReward,
          maxXp: prev.maxXp,
          coins: prev.coins + Math.floor(xpReward * 2.5),
          rareDiscoveries: (bp.rarity === 'Epic' || bp.rarity === 'Legendary')
            ? prev.rareDiscoveries + 1 : prev.rareDiscoveries,
        };
      }
      return prev;
    });
    return discoveredId;
  }, []);

  // ── Actions: Facility Output Collection ───────────────────────────────────

  const collectFacilityOutputs = useCallback((): Record<string, number> => {
    const outputs: Record<string, number> = {};
    setState(prev => {
      const newInventory = { ...prev.inventory };
      let totalXp = 0;
      let totalCoins = 0;

      for (const [id, facility] of Object.entries(prev.constructions)) {
        if (!facility.built || !facility.active || facility.type !== 'facility') continue;
        const info = TW_FACILITIES.find(f => f.id === id);
        if (!info) continue;

        const hasFuel = (newInventory[info.fuelType] || 0) >= 1;
        if (!hasFuel) continue;

        const output = Math.floor(facility.output * (prev.forgeHeat / prev.maxForgeHeat));
        newInventory[info.fuelType] = (newInventory[info.fuelType] || 0) - 1;
        newInventory[info.fuelType.replace('-', '_')] = newInventory[info.fuelType];
        const outputMaterial = info.fuelType;
        newInventory[outputMaterial] = (newInventory[outputMaterial] || 0) + output;
        outputs[id] = output;
        totalXp += 3;
        totalCoins += Math.floor(output * 2);
      }

      return {
        ...prev,
        inventory: newInventory,
        xp: prev.xp + totalXp,
        maxXp: prev.maxXp,
        coins: prev.coins + totalCoins,
      };
    });
    return outputs;
  }, []);

  // ── Actions: Quick Actions ────────────────────────────────────────────────

  const quickForge = useCallback((): { crafted: string; xpGained: number; coinsGained: number } | null => {
    const result = craftBestAffordable();
    if (!result) return null;
    const s = stateRef.current;
    return { crafted: result, xpGained: 0, coinsGained: 0 };
  }, []);

  const buyMaterialPack = useCallback((packId: string): boolean => {
    let result = false;
    const packs: Record<string, { cost: number; materials: Record<string, number> }> = {
      'starter': { cost: 100, materials: { 'iron-ore': 10, 'stone-slab': 8, 'ember-core': 2 } },
      'uncommon': { cost: 300, materials: { 'enchanted-wood': 5, 'crystal-shard': 5, 'ember-core': 3 } },
      'rare': { cost: 1000, materials: { 'star-metal': 3, 'frozen-lightning': 3, 'dragon-bone': 2 } },
      'epic': { cost: 3000, materials: { 'titan-heart': 1, 'crystallized-time': 1, 'void-essence': 2 } },
      'legendary': { cost: 8000, materials: { 'titan-heart': 2, 'ancient-rune': 2, 'solar-core': 1 } },
    };
    const pack = packs[packId];
    if (!pack) return false;

    setState(prev => {
      if (prev.coins < pack.cost) return prev;
      result = true;
      const newInventory = { ...prev.inventory };
      for (const [mat, amt] of Object.entries(pack.materials)) {
        newInventory[mat] = (newInventory[mat] || 0) + amt;
      }
      return { ...prev, coins: prev.coins - pack.cost, inventory: newInventory };
    });
    return result;
  }, []);

  const getMaterialPacks = useCallback(() => {
    return [
      { id: 'starter', name: 'Starter Pack', cost: 100, materials: { 'iron-ore': 10, 'stone-slab': 8, 'ember-core': 2 } },
      { id: 'uncommon', name: 'Uncommon Bundle', cost: 300, materials: { 'enchanted-wood': 5, 'crystal-shard': 5, 'ember-core': 3 } },
      { id: 'rare', name: 'Rare Collection', cost: 1000, materials: { 'star-metal': 3, 'frozen-lightning': 3, 'dragon-bone': 2 } },
      { id: 'epic', name: 'Epic Assortment', cost: 3000, materials: { 'titan-heart': 1, 'crystallized-time': 1, 'void-essence': 2 } },
      { id: 'legendary', name: 'Legendary Trove', cost: 8000, materials: { 'titan-heart': 2, 'ancient-rune': 2, 'solar-core': 1 } },
    ];
  }, []);

  const getForgeEventsList = useCallback(() => TW_FORGE_EVENTS, []);

  const getRarityColor = useCallback((rarity: Rarity): string => TW_RARITY_COLORS[rarity], []);

  const getRarityMultiplier = useCallback((rarity: Rarity): number => TW_RARITY_MULTIPLIER[rarity], []);

  // ── Return ────────────────────────────────────────────────────────────────

  return {
    // State
    state,

    // Core Accessors
    getLevel, getXp, getMaxXp, getCoins, getForgeHeat, getMaxForgeHeat,
    getMasterRank, getDayStreak, getTitanShards, getPrimalEssence, getCosmicDust,
    getSoulForgedItems, getWorldShaperProgress,
    getTitle, getTitleIndex, getXpPercent, getForgeHeatPercent, getLevelTitle,

    // Blueprint Accessors
    getBlueprint, getAllBlueprints, getBlueprintsByRarity,
    getDiscoveredBlueprints, getCraftedBlueprints, getUndiscoveredBlueprints,
    getBlueprintPower, getBlueprintCraftCost, getUpgradeCost,

    // Hall Accessors
    getHall, getAllHalls, getUnlockedHalls, getHallBonus, getTotalHallBonus,

    // Material Accessors
    getMaterial, getMaterialInfo, getAllMaterials, getInventory, getInventoryValue,
    getMaterialsByRarity,

    // Construction Accessors
    getConstruction, getAllConstructions, getConstructionsByType,
    getActiveConstructions, getConstructions, getFacilityInfo, getAllFacilities,

    // Ability Accessors
    getAbilityInfo, getAllAbilities,

    // Event Accessors
    getActiveEvents, getEventBonus,

    // Quest Accessors
    getDailyQuest, getQuestProgressPercent,

    // Achievement Accessors
    getAchievements, getUnlockedAchievements, getAchievementProgress,

    // Stats
    getStats,

    // Title Accessors
    getAllTitles, getNextTitle,

    // Actions: XP & Leveling
    addXp, addCoins, spendCoins,

    // Actions: Blueprint Discovery
    discoverBlueprint, activateBlueprint,

    // Actions: Crafting
    craftItem, upgradeCraft,

    // Actions: Material Gathering
    gatherMaterial, refineMaterial,

    // Actions: Hall Expansion
    expandHall,

    // Actions: Facility Building
    buildFacility, upgradeFacility, toggleFacility, demolishFacility,

    // Actions: Enchantment
    enchantArtifact,

    // Actions: Crafting Abilities
    castCraftingAbility,

    // Actions: Daily Quest
    completeDailyQuest, newDailyQuest,

    // Actions: Forge Events
    triggerForgeEvent, tickForgeEvents, endForgeEvent,

    // Actions: Training / Apprentices
    hireApprentice, trainApprentice,

    // Actions: Forge Heat
    stokeForge, coolForge,

    // Actions: Daily & Login
    claimDailyReward, checkDailyReset,

    // Actions: Achievements
    checkAchievements,

    // Actions: Challenge Runs
    startChallengeRun, completeChallengeRun,

    // Actions: Trading
    tradeMaterials,

    // Actions: World Shaper
    advanceWorldShaper,

    // Actions: Misc
    addTitanShards, spendTitanShards, addPrimalEssence, addCosmicDust,
    setForgeHeat, addInventoryItem, removeInventoryItem, resetWorkshop,

    // Actions: Mass Operations
    massGatherAll, autoRefineAll, craftBestAffordable,

    // Actions: Auto & Random
    autoStokeForge, randomDiscovery, collectFacilityOutputs,

    // Actions: Quick Actions
    quickForge, buyMaterialPack, getMaterialPacks,

    // Utility Accessors
    getForgeEventsList, getRarityColor, getRarityMultiplier,

    // Computed Values
    totalInventoryCount, discoveredCount, craftedCount, activatedCount,
    unlockedHallsCount, facilityCount, totalBlueprintPower,
    averageBlueprintLevel, topRarity, forgeEfficiency,
    dailyQuestDescription, masteryScore, rarityDistribution,

    // Theme
    colorTheme,
  };
}
