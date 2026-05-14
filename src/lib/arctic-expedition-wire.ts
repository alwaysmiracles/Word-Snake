// Arctic Expedition Wire Module — Polar Exploration for Word Snake
// Color theme: ice blue/white/silver (#BFDBFE, #F0F9FF, #E2E8F0)

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/* ──────────────────────── Types ──────────────────────── */

export type AERarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface AEPolarSpecimen {
  id: string;
  name: string;
  rarity: AERarity;
  scientificName: string;
  habitat: string;
  description: string;
  points: number;
  emoji: string;
}

export interface AEExpeditionZone {
  id: string;
  name: string;
  description: string;
  temperature: number;
  difficulty: number;
  requiredLevel: number;
  emoji: string;
  color: string;
}

export interface AESupply {
  id: string;
  name: string;
  description: string;
  quantity: number;
  maxQuantity: number;
  effect: string;
  emoji: string;
}

export interface AEBaseCampStructure {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  built: boolean;
  buildCost: number;
  effect: string;
  emoji: string;
}

export interface AESurvivalAbility {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  cooldown: number;
  emoji: string;
}

export interface AEAchievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  progress: number;
  target: number;
  points: number;
  emoji: string;
}

export interface AETitle {
  id: string;
  name: string;
  requirement: string;
  unlocked: boolean;
  bonusMultiplier: number;
}

export interface AEExplorationLog {
  id: string;
  timestamp: number;
  zoneId: string;
  event: string;
  specimensFound: string[];
  suppliesUsed: string[];
  xpEarned: number;
}

export interface AEAuroraEvent {
  id: string;
  name: string;
  description: string;
  color: string;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  xpBonus: number;
  duration: number;
  emoji: string;
}

export interface AEBlizzardEvent {
  id: string;
  name: string;
  severity: 'light' | 'moderate' | 'severe' | 'catastrophic';
  duration: number;
  temperatureDrop: number;
  visibility: number;
  survivalReward: number;
  emoji: string;
}

export interface AEDailyPatrol {
  id: string;
  day: number;
  completed: boolean;
  targetZone: string;
  tasks: string[];
  rewards: string[];
  bonusXp: number;
}

export interface AECaveSystem {
  id: string;
  name: string;
  depth: number;
  temperature: number;
  hazards: string[];
  treasures: string[];
  explored: boolean;
  emoji: string;
}

export interface AEWildlifeTrack {
  id: string;
  species: string;
  direction: string;
  freshness: 'fresh' | 'recent' | 'old' | 'ancient';
  distance: number;
  zoneId: string;
  timestamp: number;
}

export interface AEPhotoEntry {
  id: string;
  specimenId: string;
  zoneId: string;
  quality: number;
  timestamp: number;
  caption: string;
}

export interface ArcticExpeditionState {
  currentZone: string;
  temperature: number;
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  xp: number;
  level: number;
  expeditionDays: number;
  specimensDiscovered: Record<string, boolean>;
  specimensCount: number;
  supplies: Record<string, number>;
  campStructures: Record<string, AEBaseCampStructure>;
  abilities: Record<string, AESurvivalAbility>;
  achievements: Record<string, AEAchievement>;
  unlockedTitles: Record<string, boolean>;
  activeTitle: string;
  explorationLogs: AEExplorationLog[];
  auroraEvents: AEAuroraEvent[];
  activeAurora: string | null;
  blizzardActive: boolean;
  currentBlizzard: AEBlizzardEvent | null;
  dailyPatrols: AEDailyPatrol[];
  caveSystems: Record<string, AECaveSystem>;
  wildlifeTracks: AEWildlifeTrack[];
  photoAlbum: AEPhotoEntry[];
  campMorale: number;
  foodRations: number;
  fuelReserves: number;
  researchNotes: number;
  zoneProgress: Record<string, number>;
  totalWordsFound: number;
  polarTokens: number;
  expeditionRank: number;
  isOnExpedition: boolean;
  expeditionStartTime: number | null;
}

/* ──────────────────────── Data Constants (AE_ prefix) ──────────────────────── */

export const AE_RARITY_COLORS: Record<AERarity, string> = {
  common: '#BFDBFE',
  uncommon: '#60A5FA',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

export const AE_RARITY_POINTS: Record<AERarity, number> = {
  common: 10,
  uncommon: 25,
  rare: 50,
  epic: 100,
  legendary: 250,
};

export const AE_THEME = {
  primary: '#BFDBFE',
  secondary: '#F0F9FF',
  tertiary: '#E2E8F0',
  accent: '#93C5FD',
  text: '#1E3A5F',
  danger: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  ice: '#DBEAFE',
  frost: '#E0F2FE',
  snow: '#F8FAFC',
  silver: '#C0C0C0',
};

export const AE_SPECIMENS: AEPolarSpecimen[] = [
  { id: 'arctic_fox', name: 'Arctic Fox', rarity: 'common', scientificName: 'Vulpes lagopus', habitat: 'Frozen Tundra', description: 'A small white fox that blends perfectly with the snow.', points: 10, emoji: '🦊' },
  { id: 'snow_bunting', name: 'Snow Bunting', rarity: 'common', scientificName: 'Plectrophenax nivalis', habitat: 'Frozen Tundra', description: 'A hardy songbird that thrives in the coldest temperatures.', points: 10, emoji: '🐦' },
  { id: 'lemming', name: 'Collared Lemming', rarity: 'common', scientificName: 'Dicrostonyx groenlandicus', habitat: 'Permafrost Plains', description: 'A small rodent with thick fur and tiny ears.', points: 10, emoji: '🐹' },
  { id: 'ptarmigan', name: 'Rock Ptarmigan', rarity: 'common', scientificName: 'Lagopus muta', habitat: 'Polar Peak', description: 'A bird that changes plumage with the seasons.', points: 10, emoji: '🐓' },
  { id: 'arctic_hare', name: 'Arctic Hare', rarity: 'common', scientificName: 'Lepus arcticus', habitat: 'Frozen Tundra', description: 'A large hare with pure white winter fur.', points: 10, emoji: '🐇' },
  { id: 'seal', name: 'Ringed Seal', rarity: 'common', scientificName: 'Pusa hispida', habitat: 'Iceberg Field', description: 'The smallest and most common Arctic seal.', points: 10, emoji: '🦭' },
  { id: 'snowy_owl', name: 'Snowy Owl', rarity: 'uncommon', scientificName: 'Bubo scandiacus', habitat: 'Frozen Tundra', description: 'A majestic white owl with piercing yellow eyes.', points: 25, emoji: '🦉' },
  { id: 'polar_bear', name: 'Polar Bear', rarity: 'uncommon', scientificName: 'Ursus maritimus', habitat: 'Iceberg Field', description: 'The apex predator of the Arctic, built for the ice.', points: 25, emoji: '🐻‍❄️' },
  { id: 'caribou', name: 'Caribou', rarity: 'uncommon', scientificName: 'Rangifer tarandus', habitat: 'Permafrost Plains', description: 'A large reindeer that migrates vast distances.', points: 25, emoji: '🦌' },
  { id: 'musk_ox', name: 'Musk Ox', rarity: 'uncommon', scientificName: 'Ovibos moschatus', habitat: 'Frozen Tundra', description: 'A massive bovine with a shaggy coat.', points: 25, emoji: '🐂' },
  { id: 'walrus', name: 'Walrus', rarity: 'uncommon', scientificName: 'Odobenus rosmarus', habitat: 'Iceberg Field', description: 'A large marine mammal with iconic tusks.', points: 25, emoji: '🦛' },
  { id: 'beluga_whale', name: 'Beluga Whale', rarity: 'uncommon', scientificName: 'Delphinapterus leucas', habitat: 'North Pole', description: 'Known as the canary of the sea for its songs.', points: 25, emoji: '🐳' },
  { id: 'narwhal', name: 'Narwhal', rarity: 'rare', scientificName: 'Monodon monoceros', habitat: 'North Pole', description: 'The unicorn of the sea with a spiraled tusk.', points: 50, emoji: '🦄' },
  { id: 'arctic_wolf', name: 'Arctic Wolf', rarity: 'rare', scientificName: 'Canis lupus arctos', habitat: 'Polar Peak', description: 'A white wolf that hunts in the harshest conditions.', points: 50, emoji: '🐺' },
  { id: 'bowhead_whale', name: 'Bowhead Whale', rarity: 'rare', scientificName: 'Balaena mysticetus', habitat: 'North Pole', description: 'The longest-living mammal, surviving over 200 years.', points: 50, emoji: '🐋' },
  { id: 'arctic_char', name: 'Arctic Char', rarity: 'rare', scientificName: 'Salvelinus alpinus', habitat: 'Glacier Cave', description: 'A cold-water fish with vivid spawning colors.', points: 50, emoji: '🐟' },
  { id: 'wolverine', name: 'Wolverine', rarity: 'rare', scientificName: 'Gulo gulo', habitat: 'Polar Peak', description: 'A fierce and solitary predator of the far north.', points: 50, emoji: '🦡' },
  { id: 'snow_goose', name: 'Snow Goose', rarity: 'rare', scientificName: 'Anser caerulescens', habitat: 'Aurora Valley', description: 'A migratory goose that breeds in the Arctic.', points: 50, emoji: '🪿' },
  { id: 'ice_worm', name: 'Ice Worm', rarity: 'epic', scientificName: 'Mesenchytraeus solifugus', habitat: 'Glacier Cave', description: 'A mysterious worm that thrives inside glaciers.', points: 100, emoji: '🪱' },
  { id: 'crystal_moth', name: 'Crystal Moth', rarity: 'epic', scientificName: 'Crystallopteryx polaris', habitat: 'Glacier Cave', description: 'A luminous moth with translucent crystal wings.', points: 100, emoji: '🦋' },
  { id: 'aurora_fish', name: 'Aurora Fish', rarity: 'epic', scientificName: 'Aurorapiscis spectrális', habitat: 'Aurora Valley', description: 'A bioluminescent fish that reflects aurora colors.', points: 100, emoji: '🐠' },
  { id: 'frost_wyrm', name: 'Frost Wyrm', rarity: 'epic', scientificName: 'Glacialisserpens magnificus', habitat: 'Polar Peak', description: 'A serpentine creature found only in glacial crevasses.', points: 100, emoji: '🐉' },
  { id: 'phantom_seal', name: 'Phantom Seal', rarity: 'epic', scientificName: 'Phocina spectrus', habitat: 'North Pole', description: 'A nearly invisible seal that haunts the ice.', points: 100, emoji: '👻' },
  { id: 'permafrost_beetle', name: 'Permafrost Beetle', rarity: 'epic', scientificName: 'Cryopterus antiquus', habitat: 'Permafrost Plains', description: 'An ancient beetle preserved for millennia in permafrost.', points: 100, emoji: '🪲' },
  { id: 'starlight_penguin', name: 'Starlight Penguin', rarity: 'epic', scientificName: 'Aptenodytes stellaris', habitat: 'Iceberg Field', description: 'A penguin-like bird that navigates by starlight.', points: 100, emoji: '🐧' },
  { id: 'frost_elemental', name: 'Frost Elemental', rarity: 'legendary', scientificName: 'Elementum glacialis', habitat: 'Polar Peak', description: 'A living being of pure ice and wind energy.', points: 250, emoji: '❄️' },
  { id: 'aurora_spirit', name: 'Aurora Spirit', rarity: 'legendary', scientificName: 'Spiritus borealis', habitat: 'Aurora Valley', description: 'An ethereal being born from the northern lights.', points: 250, emoji: '🌌' },
  { id: 'ancient_ice_golem', name: 'Ancient Ice Golem', rarity: 'legendary', scientificName: 'Golemus glaciei antiquus', habitat: 'Glacier Cave', description: 'A massive construct of ancient crystalline ice.', points: 250, emoji: '🗿' },
  { id: 'polar_phoenix', name: 'Polar Phoenix', rarity: 'legendary', scientificName: 'Phoenixus glacius', habitat: 'North Pole', description: 'A mythical bird reborn from the coldest blizzards.', points: 250, emoji: '🔥' },
  { id: 'permafrost_dragon', name: 'Permafrost Dragon', rarity: 'legendary', scientificName: 'Draco permafrostis', habitat: 'Permafrost Plains', description: 'An ancient dragon slumbering beneath the frozen earth.', points: 250, emoji: '🐲' },
  { id: 'cryocrystal_serpent', name: 'Cryocrystal Serpent', rarity: 'legendary', scientificName: 'Serpens cryocrystallus', habitat: 'Glacier Cave', description: 'A serpent made entirely of cryogenic crystals.', points: 250, emoji: '🐍' },
  { id: 'north_star_entity', name: 'North Star Entity', rarity: 'legendary', scientificName: 'Stellus borealis primus', habitat: 'North Pole', description: 'A celestial being that dwells at the true North Pole.', points: 250, emoji: '⭐' },
  { id: 'ice_queen_spider', name: 'Ice Queen Spider', rarity: 'legendary', scientificName: 'Araneus reginae glaciei', habitat: 'Polar Peak', description: 'A majestic spider that spins webs of pure frost.', points: 250, emoji: '🕷️' },
  { id: 'glacier_whale', name: 'Glacier Whale', rarity: 'legendary', scientificName: 'Balaenoptera glacialis', habitat: 'North Pole', description: 'A colossal whale that swims through solid ice.', points: 250, emoji: '🐋' },
  { id: 'frostfire_butterfly', name: 'Frostfire Butterfly', rarity: 'legendary', scientificName: 'Papilio frostiflammas', habitat: 'Aurora Valley', description: 'A butterfly with wings of alternating ice and flame.', points: 250, emoji: '🦋' },
];

export const AE_ZONES: AEExpeditionZone[] = [
  { id: 'frozen_tundra', name: 'Frozen Tundra', description: 'Vast icy plains stretching to the horizon.', temperature: -15, difficulty: 1, requiredLevel: 1, emoji: '🏔️', color: '#BFDBFE' },
  { id: 'ice_sheet', name: 'Ice Sheet', description: 'A massive expanse of floating sea ice.', temperature: -25, difficulty: 2, requiredLevel: 3, emoji: '🧊', color: '#93C5FD' },
  { id: 'polar_peak', name: 'Polar Peak', description: 'A towering mountain of pure ice and stone.', temperature: -35, difficulty: 3, requiredLevel: 5, emoji: '⛰️', color: '#60A5FA' },
  { id: 'glacier_cave', name: 'Glacier Cave', description: 'Crystal-blue caverns carved by ancient ice.', temperature: -20, difficulty: 4, requiredLevel: 8, emoji: '🫧', color: '#3B82F6' },
  { id: 'aurora_valley', name: 'Aurora Valley', description: 'A sheltered valley where auroras dance nightly.', temperature: -10, difficulty: 3, requiredLevel: 6, emoji: '🌌', color: '#8B5CF6' },
  { id: 'permafrost_plains', name: 'Permafrost Plains', description: 'Ground frozen solid for thousands of years.', temperature: -18, difficulty: 2, requiredLevel: 4, emoji: '🏜️', color: '#E2E8F0' },
  { id: 'iceberg_field', name: 'Iceberg Field', description: 'A treacherous maze of floating ice towers.', temperature: -22, difficulty: 4, requiredLevel: 7, emoji: '🧊', color: '#F0F9FF' },
  { id: 'north_pole', name: 'North Pole', description: 'The ultimate destination of every polar explorer.', temperature: -40, difficulty: 5, requiredLevel: 10, emoji: '🌍', color: '#F59E0B' },
];

export const AE_SUPPLIES: Omit<AESupply, 'quantity'>[] = [
  { id: 'thermal_suit', name: 'Thermal Suit', description: 'Insulated suit providing warmth in extreme cold.', maxQuantity: 3, effect: '+20 temperature resistance', emoji: '🧥' },
  { id: 'ice_axe', name: 'Ice Axe', description: 'Essential tool for climbing ice walls.', maxQuantity: 2, effect: '+15 climbing ability', emoji: '⛏️' },
  { id: 'snowshoes', name: 'Snowshoes', description: 'Prevents sinking in deep snow.', maxQuantity: 2, effect: '+10 movement speed', emoji: '🥾' },
  { id: 'dog_sled', name: 'Dog Sled', description: 'Fast travel across frozen terrain.', maxQuantity: 1, effect: '+30 travel speed', emoji: '🛷' },
  { id: 'igloo_kit', name: 'Igloo Kit', description: 'Emergency shelter construction set.', maxQuantity: 3, effect: '+25 shelter bonus', emoji: '🏗️' },
  { id: 'rations', name: 'Food Rations', description: 'High-calorie expedition meals.', maxQuantity: 20, effect: '+15 stamina recovery', emoji: '🍖' },
  { id: 'hot_cocoa', name: 'Hot Cocoa Pack', description: 'Warming beverage for morale.', maxQuantity: 10, effect: '+10 morale, +5 warmth', emoji: '☕' },
  { id: 'flares', name: 'Signal Flares', description: 'Emergency signaling device.', maxQuantity: 5, effect: 'Summon rescue team', emoji: '🔴' },
  { id: 'first_aid', name: 'First Aid Kit', description: 'Medical supplies for injuries.', maxQuantity: 5, effect: '+30 health recovery', emoji: '🩹' },
  { id: 'gps_device', name: 'GPS Device', description: 'Satellite navigation tool.', maxQuantity: 1, effect: 'Reveal zone map', emoji: '📡' },
  { id: 'headlamp', name: 'Headlamp', description: 'Powerful LED light source.', maxQuantity: 2, effect: '+20 visibility in caves', emoji: '🔦' },
  { id: 'rope', name: 'Climbing Rope', description: '50m of reinforced climbing rope.', maxQuantity: 3, effect: 'Access vertical areas', emoji: '🪢' },
  { id: 'tent', name: 'Expedition Tent', description: 'Four-season polar tent.', maxQuantity: 2, effect: '+20 shelter quality', emoji: '⛺' },
  { id: 'sleeping_bag', name: 'Sleeping Bag', description: 'Rated to -40°C comfort.', maxQuantity: 3, effect: '+15 health regen at camp', emoji: '🛏️' },
  { id: 'portable_stove', name: 'Portable Stove', description: 'Compact stove for cooking and warmth.', maxQuantity: 1, effect: '+10 cooking, +5 warmth', emoji: '🔥' },
  { id: 'camera', name: 'Wildlife Camera', description: 'Telephoto lens for specimen photography.', maxQuantity: 1, effect: '+25 photo quality', emoji: '📷' },
  { id: 'binoculars', name: 'Binoculars', description: 'Long-range wildlife spotting scope.', maxQuantity: 1, effect: '+30 tracking range', emoji: '🔭' },
  { id: 'notebook', name: 'Research Notebook', description: 'Waterproof notebook for field notes.', maxQuantity: 5, effect: '+10 research XP per entry', emoji: '📓' },
  { id: 'ice_chisel', name: 'Ice Chisel', description: 'Tool for collecting ice core samples.', maxQuantity: 2, effect: '+15 ice excavation', emoji: '🔧' },
  { id: 'snow_shovel', name: 'Snow Shovel', description: 'Essential for clearing paths.', maxQuantity: 2, effect: '+20 pathfinding', emoji: '🪣' },
  { id: 'fuel_canister', name: 'Fuel Canister', description: 'Emergency fuel for heating.', maxQuantity: 5, effect: '+20 heating capacity', emoji: '🛢️' },
  { id: 'windbreaker', name: 'Windbreaker', description: 'Protection against polar winds.', maxQuantity: 2, effect: '+15 wind resistance', emoji: '🧣' },
  { id: 'gloves', name: 'Insulated Gloves', description: 'Thermal gloves for dexterity.', maxQuantity: 3, effect: '+10 manipulation speed', emoji: '🧤' },
  { id: 'radio', name: 'Radio Transmitter', description: 'Long-range communication device.', maxQuantity: 1, effect: '+50 communication range', emoji: '📻' },
  { id: 'compass', name: 'Compass', description: 'Reliable magnetic navigation.', maxQuantity: 1, effect: '+15 navigation accuracy', emoji: '🧭' },
  { id: 'fish_hook', name: 'Fishing Kit', description: 'Ice fishing equipment.', maxQuantity: 2, effect: '+20 fishing ability', emoji: '🎣' },
  { id: 'magnifying_glass', name: 'Magnifying Glass', description: 'For examining tiny specimens.', maxQuantity: 1, effect: '+15 specimen analysis', emoji: '🔍' },
  { id: 'syrup', name: 'Maple Syrup', description: 'High-energy survival food.', maxQuantity: 10, effect: '+20 stamina burst', emoji: '🍯' },
  { id: 'sunglasses', name: 'Snow Goggles', description: 'Prevents snow blindness.', maxQuantity: 2, effect: '+25 eye protection', emoji: '🕶️' },
  { id: 'satellite_phone', name: 'Satellite Phone', description: 'Emergency communication from anywhere.', maxQuantity: 1, effect: 'Global communication access', emoji: '📱' },
];

export const AE_BASE_CAMP_STRUCTURES: Omit<AEBaseCampStructure, 'built' | 'level'>[] = [
  { id: 'research_tent', name: 'Research Tent', description: 'Central hub for specimen analysis.', maxLevel: 5, buildCost: 50, effect: '+10% research XP', emoji: '⛺' },
  { id: 'weather_station', name: 'Weather Station', description: 'Monitors blizzards and auroras.', maxLevel: 5, buildCost: 75, effect: 'Forecast blizzards early', emoji: '🌬️' },
  { id: 'supply_depot', name: 'Supply Depot', description: 'Stores expedition supplies securely.', maxLevel: 5, buildCost: 60, effect: '+20 supply storage', emoji: '📦' },
  { id: 'medical_bay', name: 'Medical Bay', description: 'Treats injuries and restores health.', maxLevel: 5, buildCost: 80, effect: '+15% health recovery', emoji: '🏥' },
  { id: 'communication_tower', name: 'Communication Tower', description: 'Maintains contact with base.', maxLevel: 3, buildCost: 100, effect: '+50% comms range', emoji: '🗼' },
  { id: 'fuel_store', name: 'Fuel Storage', description: 'Stores heating fuel safely.', maxLevel: 4, buildCost: 55, effect: '+25 heating capacity', emoji: '🛢️' },
  { id: 'dog_kennel', name: 'Dog Kennel', description: 'Houses and trains sled dogs.', maxLevel: 4, buildCost: 70, effect: '+20% sled speed', emoji: '🐕' },
  { id: 'ice_lab', name: 'Ice Laboratory', description: 'Analyzes ice core samples.', maxLevel: 5, buildCost: 120, effect: '+15% specimen analysis', emoji: '🔬' },
  { id: 'mess_hall', name: 'Mess Hall', description: 'Boosts morale with hot meals.', maxLevel: 4, buildCost: 65, effect: '+10 morale per meal', emoji: '🍲' },
  { id: 'observation_deck', name: 'Observation Deck', description: 'Watchtower for aurora observation.', maxLevel: 3, buildCost: 90, effect: '+20% aurora visibility', emoji: '🔭' },
  { id: 'workshop', name: 'Workshop', description: 'Crafts and repairs equipment.', maxLevel: 5, buildCost: 85, effect: '+10% equipment durability', emoji: '🔧' },
  { id: 'greenhouse', name: 'Polar Greenhouse', description: 'Grows fresh food under UV lamps.', maxLevel: 3, buildCost: 110, effect: '+5 food rations/day', emoji: '🌱' },
  { id: 'armory', name: 'Equipment Armory', description: 'Stores specialized polar gear.', maxLevel: 4, buildCost: 95, effect: '+15% equipment effectiveness', emoji: '🛡️' },
  { id: 'library', name: 'Expedition Library', description: 'Reference materials and maps.', maxLevel: 3, buildCost: 70, effect: '+10% discovery chance', emoji: '📚' },
  { id: 'hot_spring', name: 'Hot Spring Bath', description: 'Natural geothermal hot spring.', maxLevel: 3, buildCost: 130, effect: '+30 morale, +20 health', emoji: '♨️' },
  { id: 'helipad', name: 'Helipad', description: 'Emergency evacuation landing zone.', maxLevel: 2, buildCost: 150, effect: 'Fast evacuation access', emoji: '🚁' },
  { id: 'power_generator', name: 'Power Generator', description: 'Provides electricity to all structures.', maxLevel: 5, buildCost: 100, effect: '+20% all structure efficiency', emoji: '⚡' },
  { id: 'specimen_vault', name: 'Specimen Vault', description: 'Climate-controlled specimen storage.', maxLevel: 5, buildCost: 90, effect: '+15% specimen preservation', emoji: '🏛️' },
  { id: 'radar_dish', name: 'Radar Dish', description: 'Detects incoming weather events.', maxLevel: 3, buildCost: 110, effect: 'Advanced storm warning', emoji: '📡' },
  { id: 'trading_post', name: 'Trading Post', description: 'Exchange goods with passing explorers.', maxLevel: 4, buildCost: 80, effect: '+10% supply trade value', emoji: '🏪' },
  { id: 'training_ground', name: 'Training Ground', description: 'Improve survival abilities.', maxLevel: 5, buildCost: 85, effect: '+10% ability XP gain', emoji: '🏋️' },
  { id: 'sauna', name: 'Polar Sauna', description: 'Therapeutic heat therapy.', maxLevel: 3, buildCost: 75, effect: '+25 health regen, +15 morale', emoji: '🧖' },
  { id: 'ice_sculpture', name: 'Ice Sculpture Garden', description: 'Beautiful art from glacial ice.', maxLevel: 3, buildCost: 60, effect: '+20 camp morale (permanent)', emoji: '🎨' },
  { id: 'landing_strip', name: 'Ice Landing Strip', description: 'For supply plane deliveries.', maxLevel: 2, buildCost: 140, effect: '+supply deliveries per week', emoji: '✈️' },
  { id: 'security_post', name: 'Security Post', description: 'Protects camp from wildlife threats.', maxLevel: 4, buildCost: 95, effect: '-30% wildlife encounter danger', emoji: '🔒' },
];

export const AE_SURVIVAL_ABILITIES: Omit<AESurvivalAbility, 'unlocked' | 'level'>[] = [
  { id: 'ice_fishing', name: 'Ice Fishing', description: 'Catch fish through holes in the ice.', maxLevel: 5, cooldown: 300, emoji: '🎣' },
  { id: 'shelter_building', name: 'Shelter Building', description: 'Construct emergency shelters from snow.', maxLevel: 5, cooldown: 600, emoji: '🏗️' },
  { id: 'aurora_reading', name: 'Aurora Reading', description: 'Predict weather from aurora patterns.', maxLevel: 5, cooldown: 900, emoji: '🌌' },
  { id: 'track_reading', name: 'Track Reading', description: 'Identify wildlife from footprints.', maxLevel: 5, cooldown: 120, emoji: '🐾' },
  { id: 'fire_starting', name: 'Fire Starting', description: 'Start fires in extreme cold conditions.', maxLevel: 5, cooldown: 240, emoji: '🔥' },
  { id: 'ice_climbing', name: 'Ice Climbing', description: 'Scale vertical ice walls safely.', maxLevel: 5, cooldown: 180, emoji: '🧗' },
  { id: 'snow_crafting', name: 'Snow Crafting', description: 'Create tools and structures from snow.', maxLevel: 5, cooldown: 300, emoji: '❄️' },
  { id: 'navigation', name: 'Polar Navigation', description: 'Navigate using stars and landmarks.', maxLevel: 5, cooldown: 0, emoji: '🧭' },
  { id: 'first_aid_polar', name: 'Polar First Aid', description: 'Treat frostbite and hypothermia.', maxLevel: 5, cooldown: 480, emoji: '🩹' },
  { id: 'blizzard_survival', name: 'Blizzard Survival', description: 'Endure extreme blizzard conditions.', maxLevel: 5, cooldown: 1200, emoji: '🌬️' },
  { id: 'wildlife_taming', name: 'Wildlife Taming', description: 'Calm and approach dangerous animals.', maxLevel: 5, cooldown: 600, emoji: '🦊' },
  { id: 'ice_swimming', name: 'Ice Swimming', description: 'Survive brief swims in freezing water.', maxLevel: 3, cooldown: 900, emoji: '🏊' },
  { id: 'crevasse_rescue', name: 'Crevasse Rescue', description: 'Rescue companions from ice crevasses.', maxLevel: 4, cooldown: 600, emoji: '🪢' },
  { id: 'foraging', name: 'Polar Foraging', description: 'Find edible plants beneath the snow.', maxLevel: 4, cooldown: 300, emoji: '🌿' },
  { id: 'signal_making', name: 'Signal Making', description: 'Create visible signals for rescue.', maxLevel: 3, cooldown: 480, emoji: '🔴' },
  { id: 'knot_tying', name: 'Knot Tying', description: 'Tie essential knots for expeditions.', maxLevel: 4, cooldown: 60, emoji: '🪢' },
  { id: 'weather_forecasting', name: 'Weather Forecasting', description: 'Predict upcoming weather changes.', maxLevel: 5, cooldown: 600, emoji: '⛅' },
  { id: 'stealth_movement', name: 'Stealth Movement', description: 'Move silently across snow.', maxLevel: 4, cooldown: 180, emoji: '🤫' },
  { id: 'ice_carving', name: 'Ice Carving', description: 'Create useful objects from ice.', maxLevel: 3, cooldown: 300, emoji: '🗿' },
  { id: 'team_leadership', name: 'Team Leadership', description: 'Boost team morale and coordination.', maxLevel: 5, cooldown: 0, emoji: '👑' },
  { id: 'specimen_handling', name: 'Specimen Handling', description: 'Safely capture and document specimens.', maxLevel: 5, cooldown: 120, emoji: '📋' },
  { id: 'avalanche_detection', name: 'Avalanche Detection', description: 'Sense impending avalanches.', maxLevel: 4, cooldown: 300, emoji: '🏔️' },
];

export const AE_ACHIEVEMENTS: Omit<AEAchievement, 'unlocked' | 'progress'>[] = [
  { id: 'first_steps', name: 'First Steps', description: 'Begin your first Arctic expedition.', target: 1, points: 10, emoji: '👣' },
  { id: 'cold_blooded', name: 'Cold Blooded', description: 'Survive 3 blizzards in a row.', target: 3, points: 50, emoji: '🥶' },
  { id: 'specimen_collector', name: 'Specimen Collector', description: 'Discover 10 different polar specimens.', target: 10, points: 75, emoji: '🔬' },
  { id: 'master_explorer', name: 'Master Explorer', description: 'Complete exploration of all 8 zones.', target: 8, points: 100, emoji: '🗺️' },
  { id: 'aurora_watcher', name: 'Aurora Watcher', description: 'Observe 5 different aurora events.', target: 5, points: 60, emoji: '🌌' },
  { id: 'camp_builder', name: 'Camp Builder', description: 'Build 15 base camp structures.', target: 15, points: 80, emoji: '🏗️' },
  { id: 'survival_expert', name: 'Survival Expert', description: 'Unlock 15 survival abilities.', target: 15, points: 90, emoji: '🛡️' },
  { id: 'wildlife_photographer', name: 'Wildlife Photographer', description: 'Take 20 specimen photos.', target: 20, points: 70, emoji: '📷' },
  { id: 'polar_pioneer', name: 'Polar Pioneer', description: 'Reach the North Pole.', target: 1, points: 150, emoji: '🌍' },
  { id: 'deep_caver', name: 'Deep Caver', description: 'Explore all glacier cave systems.', target: 5, points: 85, emoji: '🫧' },
  { id: 'word_hunter_ice', name: 'Ice Word Hunter', description: 'Find 100 words during expeditions.', target: 100, points: 60, emoji: '📝' },
  { id: 'supply_hoarder', name: 'Supply Master', description: 'Collect every type of supply at least once.', target: 30, points: 65, emoji: '📦' },
  { id: 'blizzard_survivor', name: 'Blizzard Survivor', description: 'Survive a catastrophic blizzard.', target: 1, points: 120, emoji: '🌪️' },
  { id: 'legendary_finder', name: 'Legendary Finder', description: 'Discover a legendary specimen.', target: 1, points: 200, emoji: '⭐' },
  { id: 'full_collection', name: 'Complete Collection', description: 'Discover all 35 polar specimens.', target: 35, points: 500, emoji: '🏆' },
  { id: 'daily_dedication', name: 'Daily Dedication', description: 'Complete 7 daily patrols in a row.', target: 7, points: 80, emoji: '📅' },
  { id: 'camp_maximizer', name: 'Camp Maximizer', description: 'Upgrade any structure to max level.', target: 1, points: 60, emoji: '⬆️' },
  { id: 'temperature_extremes', name: 'Temperature Extremes', description: 'Survive at -40°C for 5 minutes.', target: 5, points: 100, emoji: '🌡️' },
];

export const AE_TITLES: Omit<AETitle, 'unlocked'>[] = [
  { id: 'fresh_explorer', name: 'Fresh Explorer', requirement: 'Begin first expedition', bonusMultiplier: 1.0 },
  { id: 'frost_walker', name: 'Frost Walker', requirement: 'Complete 5 expeditions', bonusMultiplier: 1.1 },
  { id: 'ice_nomad', name: 'Ice Nomad', requirement: 'Discover 10 specimens', bonusMultiplier: 1.2 },
  { id: 'glacial_ranger', name: 'Glacial Ranger', requirement: 'Unlock 10 abilities', bonusMultiplier: 1.3 },
  { id: 'aurora_seeker', name: 'Aurora Seeker', requirement: 'Observe 10 aurora events', bonusMultiplier: 1.4 },
  { id: 'polar_veteran', name: 'Polar Veteran', requirement: 'Survive 10 blizzards', bonusMultiplier: 1.5 },
  { id: 'arctic_sage', name: 'Arctic Sage', requirement: 'Reach level 15', bonusMultiplier: 1.7 },
  { id: 'legendary_commander', name: 'Legendary Polar Commander', requirement: 'Complete all achievements', bonusMultiplier: 2.0 },
];

export const AE_AURORA_EVENTS: AEAuroraEvent[] = [
  { id: 'gentle_curtain', name: 'Gentle Curtain', description: 'Soft green waves ripple across the sky.', color: '#10B981', intensity: 'low', xpBonus: 10, duration: 600, emoji: '🟢' },
  { id: 'blue_veil', name: 'Blue Veil', description: 'Ethereal blue light cascades downward.', color: '#3B82F6', intensity: 'medium', xpBonus: 25, duration: 900, emoji: '🔵' },
  { id: 'purple_crown', name: 'Purple Crown', description: 'Vibrant purple arcs form a crown shape.', color: '#8B5CF6', intensity: 'medium', xpBonus: 30, duration: 800, emoji: '🟣' },
  { id: 'red_serpent', name: 'Red Serpent', description: 'Rare red aurora snakes across the heavens.', color: '#EF4444', intensity: 'high', xpBonus: 50, duration: 500, emoji: '🔴' },
  { id: 'rainbow_burst', name: 'Rainbow Burst', description: 'All colors dance simultaneously in a spectacular display.', color: '#F59E0B', intensity: 'high', xpBonus: 75, duration: 400, emoji: '🌈' },
  { id: 'white_flash', name: 'White Flash', description: 'A blinding white aurora illuminates everything.', color: '#F8FAFC', intensity: 'extreme', xpBonus: 100, duration: 300, emoji: '⚪' },
  { id: 'emerald_storm', name: 'Emerald Storm', description: 'Fierce green aurora resembling a cosmic storm.', color: '#059669', intensity: 'high', xpBonus: 60, duration: 450, emoji: '💚' },
  { id: 'diamond_dust', name: 'Diamond Dust Aurora', description: 'Sparkling aurora with crystalline shimmer.', color: '#BFDBFE', intensity: 'extreme', xpBonus: 150, duration: 250, emoji: '💎' },
];

export const AE_BLIZZARD_EVENTS: AEBlizzardEvent[] = [
  { id: 'light_dusting', name: 'Light Dusting', severity: 'light', duration: 120, temperatureDrop: 5, visibility: 80, survivalReward: 10, emoji: '🌨️' },
  { id: 'whiteout', name: 'Whiteout', severity: 'moderate', duration: 300, temperatureDrop: 10, visibility: 50, survivalReward: 25, emoji: '🌬️' },
  { id: 'howling_tempest', name: 'Howling Tempest', severity: 'severe', duration: 600, temperatureDrop: 20, visibility: 20, survivalReward: 50, emoji: '🌪️' },
  { id: 'ice_apocalypse', name: 'Ice Apocalypse', severity: 'catastrophic', duration: 900, temperatureDrop: 35, visibility: 5, survivalReward: 150, emoji: '☠️' },
];

export const AE_CAVE_SYSTEMS: Omit<AECaveSystem, 'explored'>[] = [
  { id: 'crystal_grotto', name: 'Crystal Grotto', depth: 50, temperature: -15, hazards: ['slippery floors', 'falling icicles'], treasures: ['crystal_moth', 'ice gems'], emoji: '💎' },
  { id: 'frozen_labyrinth', name: 'Frozen Labyrinth', depth: 120, temperature: -22, hazards: ['getting lost', 'thin ice'], treasures: ['ancient artifacts', 'rare minerals'], emoji: '🔮' },
  { id: 'echo_chamber', name: 'Echo Chamber', depth: 80, temperature: -18, hazards: ['sound disorientation', 'weak ice bridges'], treasures: ['aurora_fish fossils', 'echo crystals'], emoji: '📢' },
  { id: 'diamond_cavern', name: 'Diamond Cavern', depth: 200, temperature: -30, hazards: ['extreme cold', 'glacial shifts'], treasures: ['diamond deposits', 'cryocrystal_serpent'], emoji: '💠' },
  { id: 'permafrost_depths', name: 'Permafrost Depths', depth: 150, temperature: -25, hazards: ['methane pockets', 'unstable ground'], treasures: ['permafrost_beetle', 'ancient fossils'], emoji: '🕳️' },
];

export const AE_LEVEL_XP_TABLE: Record<number, number> = {
  1: 0, 2: 100, 3: 250, 4: 500, 5: 800, 6: 1200, 7: 1700, 8: 2300, 9: 3000, 10: 4000,
  11: 5200, 12: 6500, 13: 8000, 14: 9700, 15: 11500, 16: 13500, 17: 15700, 18: 18100, 19: 20700, 20: 23500,
};

export const AE_WEATHER_CONDITIONS = [
  { id: 'clear_sky', name: 'Clear Arctic Sky', description: 'Crisp, clear visibility under the polar sun.', temperatureMod: 0, visibilityMod: 0, emoji: '☀️' },
  { id: 'overcast', name: 'Overcast', description: 'Grey clouds blanket the horizon.', temperatureMod: -2, visibilityMod: -10, emoji: '☁️' },
  { id: 'light_snow', name: 'Light Snowfall', description: 'Gentle snow flurries drift through the air.', temperatureMod: -3, visibilityMod: -15, emoji: '🌨️' },
  { id: 'heavy_snow', name: 'Heavy Snowfall', description: 'Thick snow reduces visibility significantly.', temperatureMod: -5, visibilityMod: -30, emoji: '❄️' },
  { id: 'freezing_fog', name: 'Freezing Fog', description: 'Dense, icy fog coats everything in frost.', temperatureMod: -4, visibilityMod: -40, emoji: '🌫️' },
  { id: 'ice_storm', name: 'Ice Storm', description: 'Freezing rain turns to ice on contact.', temperatureMod: -8, visibilityMod: -25, emoji: '🌧️' },
  { id: 'diamond_dust_weather', name: 'Diamond Dust', description: 'Tiny ice crystals sparkle in the sunlight.', temperatureMod: -6, visibilityMod: 10, emoji: '✨' },
  { id: 'sun_dog', name: 'Sun Dog', description: 'Bright spots flank the sun in a halo.', temperatureMod: -1, visibilityMod: 0, emoji: '🌤️' },
  { id: 'fata_morgana', name: 'Fata Morgana', description: 'Mirages distort the polar landscape.', temperatureMod: 0, visibilityMod: -20, emoji: '🌀' },
  { id: 'polar_night', name: 'Polar Night', description: 'Complete darkness with only starlight.', temperatureMod: -10, visibilityMod: -50, emoji: '🌑' },
] as const;

export const AE_EMERGENCY_EVENTS = [
  { id: 'thin_ice', name: 'Thin Ice!', description: 'The ice beneath you starts to crack.', healthDamage: 20, staminaCost: 15, escapeCost: 10, emoji: '⚠️' },
  { id: 'polar_bear_encounter', name: 'Polar Bear!', description: 'A polar bear blocks your path.', healthDamage: 30, staminaCost: 10, escapeCost: 20, emoji: '🐻' },
  { id: 'crevasse', name: 'Crevasse!', description: 'A hidden crevasse opens in the ice.', healthDamage: 25, staminaCost: 20, escapeCost: 15, emoji: '🕳️' },
  { id: 'avalanche', name: 'Avalanche!', description: 'Snow cascades down the mountainside.', healthDamage: 40, staminaCost: 25, escapeCost: 30, emoji: '🏔️' },
  { id: 'frostbite', name: 'Frostbite Warning', description: 'Exposed skin begins to freeze.', healthDamage: 15, staminaCost: 5, escapeCost: 5, emoji: '🥶' },
  { id: 'whiteout_storm', name: 'Whiteout!', description: 'Zero visibility, disorientation imminent.', healthDamage: 10, staminaCost: 30, escapeCost: 25, emoji: '💨' },
] as const;

/* ──────────────────────── Default State ──────────────────────── */

const AE_DEFAULT_SUPPLIES: Record<string, number> = {};
AE_SUPPLIES.forEach((s) => { AE_DEFAULT_SUPPLIES[s.id] = 0; });
AE_DEFAULT_SUPPLIES.rations = 5;
AE_DEFAULT_SUPPLIES.hot_cocoa = 3;
AE_DEFAULT_SUPPLIES.first_aid = 1;

const AE_DEFAULT_CAMP: Record<string, AEBaseCampStructure> = {};
AE_BASE_CAMP_STRUCTURES.forEach((s) => {
  AE_DEFAULT_CAMP[s.id] = { ...s, level: 0, built: false };
});

const AE_DEFAULT_ABILITIES: Record<string, AESurvivalAbility> = {};
AE_SURVIVAL_ABILITIES.forEach((a) => {
  AE_DEFAULT_ABILITIES[a.id] = { ...a, unlocked: false, level: 0 };
});
AE_DEFAULT_ABILITIES.ice_fishing.unlocked = true;
AE_DEFAULT_ABILITIES.navigation.unlocked = true;

const AE_DEFAULT_ACHIEVEMENTS: Record<string, AEAchievement> = {};
AE_ACHIEVEMENTS.forEach((a) => {
  AE_DEFAULT_ACHIEVEMENTS[a.id] = { ...a, unlocked: false, progress: 0 };
});

const AE_DEFAULT_CAVES: Record<string, AECaveSystem> = {};
AE_CAVE_SYSTEMS.forEach((c) => {
  AE_DEFAULT_CAVES[c.id] = { ...c, explored: false };
});

const AE_INITIAL_STATE: ArcticExpeditionState = {
  currentZone: 'frozen_tundra',
  temperature: -15,
  health: 100,
  maxHealth: 100,
  stamina: 100,
  maxStamina: 100,
  xp: 0,
  level: 1,
  expeditionDays: 1,
  specimensDiscovered: {},
  specimensCount: 0,
  supplies: { ...AE_DEFAULT_SUPPLIES },
  campStructures: { ...AE_DEFAULT_CAMP },
  abilities: { ...AE_DEFAULT_ABILITIES },
  achievements: { ...AE_DEFAULT_ACHIEVEMENTS },
  unlockedTitles: { fresh_explorer: true },
  activeTitle: 'fresh_explorer',
  explorationLogs: [],
  auroraEvents: [...AE_AURORA_EVENTS],
  activeAurora: null,
  blizzardActive: false,
  currentBlizzard: null,
  dailyPatrols: [],
  caveSystems: { ...AE_DEFAULT_CAVES },
  wildlifeTracks: [],
  photoAlbum: [],
  campMorale: 75,
  foodRations: 5,
  fuelReserves: 3,
  researchNotes: 0,
  zoneProgress: {
    frozen_tundra: 0, ice_sheet: 0, polar_peak: 0, glacier_cave: 0,
    aurora_valley: 0, permafrost_plains: 0, iceberg_field: 0, north_pole: 0,
  },
  totalWordsFound: 0,
  polarTokens: 0,
  expeditionRank: 0,
  isOnExpedition: false,
  expeditionStartTime: null,
};

/* ──────────────────────── Utility ──────────────────────── */

function AE_randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function AE_randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function AE_generateId(): string {
  return `ae_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function AE_levelForXp(xp: number): number {
  let lvl = 1;
  for (const [l, req] of Object.entries(AE_LEVEL_XP_TABLE)) {
    if (xp >= req) lvl = parseInt(l, 10);
    else break;
  }
  return lvl;
}

function AE_xpForNextLevel(level: number): number {
  return AE_LEVEL_XP_TABLE[level + 1] ?? (level * 2500 + 1000);
}

function AE_xpProgressPercent(xp: number, level: number): number {
  const currentReq = AE_LEVEL_XP_TABLE[level] ?? 0;
  const nextReq = AE_LEVEL_XP_TABLE[level + 1] ?? (level * 2500 + 1000);
  if (nextReq === currentReq) return 100;
  return Math.min(100, Math.round(((xp - currentReq) / (nextReq - currentReq)) * 100));
}

/* ──────────────────────── Hook ──────────────────────── */

export default function useArcticExpedition(initialState?: ArcticExpeditionState) {
  const [state, setState] = useState<ArcticExpeditionState>(initialState ?? AE_INITIAL_STATE);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  /* ──────── Core State ──────── */

  const getAEState = useCallback(() => stateRef.current, []);

  const resetAEState = useCallback(() => {
    setState({ ...AE_INITIAL_STATE });
  }, []);

  const getAEInitialState = useCallback((): ArcticExpeditionState => {
    return { ...AE_INITIAL_STATE };
  }, []);

  /* ──────── Zone ──────── */

  const getAECurrentZone = useCallback(() => {
    const s = stateRef.current;
    return AE_ZONES.find((z) => z.id === s.currentZone) ?? AE_ZONES[0];
  }, []);

  const setAECurrentZone = useCallback((zoneId: string) => {
    setState((prev) => {
      const zone = AE_ZONES.find((z) => z.id === zoneId);
      if (!zone) return prev;
      return { ...prev, currentZone: zoneId, temperature: zone.temperature };
    });
  }, []);

  const getAEAvailableZones = useCallback(() => {
    const s = stateRef.current;
    return AE_ZONES.filter((z) => s.level >= z.requiredLevel);
  }, []);

  const getAEAllZones = useCallback(() => AE_ZONES, []);

  const getAEZoneById = useCallback((zoneId: string) => {
    return AE_ZONES.find((z) => z.id === zoneId) ?? null;
  }, []);

  const getAEZoneProgress = useCallback((zoneId: string) => {
    return stateRef.current.zoneProgress[zoneId] ?? 0;
  }, []);

  const advanceAEZoneProgress = useCallback((zoneId: string, amount: number) => {
    setState((prev) => ({
      ...prev,
      zoneProgress: { ...prev.zoneProgress, [zoneId]: Math.min(100, (prev.zoneProgress[zoneId] ?? 0) + amount) },
    }));
  }, []);

  const isAEZoneComplete = useCallback((zoneId: string) => {
    return (stateRef.current.zoneProgress[zoneId] ?? 0) >= 100;
  }, []);

  const getAEZoneExplorationPercent = useCallback((zoneId: string) => {
    return Math.min(100, stateRef.current.zoneProgress[zoneId] ?? 0);
  }, []);

  /* ──────── Temperature ──────── */

  const getAETemperature = useCallback(() => stateRef.current.temperature, []);

  const setAETemperature = useCallback((temp: number) => {
    setState((prev) => ({ ...prev, temperature: temp }));
  }, []);

  const adjustAETemperature = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, temperature: prev.temperature + delta }));
  }, []);

  const getAETemperatureStatus = useCallback(() => {
    const s = stateRef.current;
    if (s.temperature >= -10) return { label: 'Mild', color: '#10B981', icon: '🌤️' };
    if (s.temperature >= -20) return { label: 'Cold', color: '#3B82F6', icon: '❄️' };
    if (s.temperature >= -30) return { label: 'Freezing', color: '#6366F1', icon: '🥶' };
    if (s.temperature >= -40) return { label: 'Extreme', color: '#8B5CF6', icon: '⚠️' };
    return { label: 'Lethal', color: '#EF4444', icon: '☠️' };
  }, []);

  const applyAETemperatureDamage = useCallback(() => {
    const s = stateRef.current;
    if (s.temperature < -30) {
      const dmg = Math.abs(s.temperature + 30) * 0.5;
      setState((prev) => ({ ...prev, health: Math.max(0, prev.health - dmg) }));
    }
  }, []);

  /* ──────── Health & Stamina ──────── */

  const getAEHealth = useCallback(() => stateRef.current.health, []);
  const getAEMaxHealth = useCallback(() => stateRef.current.maxHealth, []);
  const getAEStamina = useCallback(() => stateRef.current.stamina, []);
  const getAEMaxStamina = useCallback(() => stateRef.current.maxStamina, []);

  const setAEHealth = useCallback((health: number) => {
    setState((prev) => ({ ...prev, health: Math.max(0, Math.min(prev.maxHealth, health)) }));
  }, []);

  const setAEStamina = useCallback((stamina: number) => {
    setState((prev) => ({ ...prev, stamina: Math.max(0, Math.min(prev.maxStamina, stamina)) }));
  }, []);

  const healAEHealth = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, health: Math.min(prev.maxHealth, prev.health + amount) }));
  }, []);

  const damageAEHealth = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, health: Math.max(0, prev.health - amount) }));
  }, []);

  const restoreAEStamina = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, stamina: Math.min(prev.maxStamina, prev.stamina + amount) }));
  }, []);

  const consumeAEStamina = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, stamina: Math.max(0, prev.stamina - amount) }));
  }, []);

  const getAEHealthPercent = useCallback(() => {
    const s = stateRef.current;
    return Math.round((s.health / s.maxHealth) * 100);
  }, []);

  const getAEStaminaPercent = useCallback(() => {
    const s = stateRef.current;
    return Math.round((s.stamina / s.maxStamina) * 100);
  }, []);

  const restAtAECamp = useCallback(() => {
    setState((prev) => ({
      ...prev,
      health: prev.maxHealth,
      stamina: prev.maxStamina,
      campMorale: Math.min(100, prev.campMorale + 10),
    }));
  }, []);

  /* ──────── XP & Level ──────── */

  const getAEXp = useCallback(() => stateRef.current.xp, []);
  const getAELevel = useCallback(() => stateRef.current.level, []);

  const addAEXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = AE_levelForXp(newXp);
      return { ...prev, xp: newXp, level: newLevel };
    });
  }, []);

  const getAEXpForNextLevel = useCallback(() => {
    return AE_xpForNextLevel(stateRef.current.level);
  }, []);

  const getAEXpProgressPercent = useCallback(() => {
    const s = stateRef.current;
    return AE_xpProgressPercent(s.xp, s.level);
  }, []);

  const getAELevelTable = useCallback(() => AE_LEVEL_XP_TABLE, []);

  /* ──────── Expedition ──────── */

  const startAEExpedition = useCallback(() => {
    setState((prev) => ({ ...prev, isOnExpedition: true, expeditionStartTime: Date.now() }));
  }, []);

  const endAEExpedition = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOnExpedition: false,
      expeditionStartTime: null,
      expeditionDays: prev.expeditionDays + 1,
    }));
  }, []);

  const getAEIsOnExpedition = useCallback(() => stateRef.current.isOnExpedition, []);

  const getAEExpeditionDays = useCallback(() => stateRef.current.expeditionDays, []);

  const getAEExpeditionDuration = useCallback(() => {
    const s = stateRef.current;
    if (!s.expeditionStartTime) return 0;
    return Math.floor((Date.now() - s.expeditionStartTime) / 1000);
  }, []);

  const advanceAEDay = useCallback(() => {
    setState((prev) => ({ ...prev, expeditionDays: prev.expeditionDays + 1 }));
  }, []);

  /* ──────── Specimens ──────── */

  const getAESpecimenById = useCallback((specimenId: string) => {
    return AE_SPECIMENS.find((sp) => sp.id === specimenId) ?? null;
  }, []);

  const getAEAllSpecimens = useCallback(() => AE_SPECIMENS, []);

  const getAEDiscoveredSpecimens = useCallback(() => {
    const s = stateRef.current;
    return AE_SPECIMENS.filter((sp) => s.specimensDiscovered[sp.id]);
  }, []);

  const getAEUndiscoveredSpecimens = useCallback(() => {
    const s = stateRef.current;
    return AE_SPECIMENS.filter((sp) => !s.specimensDiscovered[sp.id]);
  }, []);

  const isAESpecimenDiscovered = useCallback((specimenId: string) => {
    return !!stateRef.current.specimensDiscovered[specimenId];
  }, []);

  const getAESpecimensCount = useCallback(() => stateRef.current.specimensCount, []);

  const getAEDiscoveryPercent = useCallback(() => {
    return Math.round((stateRef.current.specimensCount / AE_SPECIMENS.length) * 100);
  }, []);

  const discoverAESpecimen = useCallback((specimenId: string) => {
    setState((prev) => {
      if (prev.specimensDiscovered[specimenId]) return prev;
      const specimen = AE_SPECIMENS.find((sp) => sp.id === specimenId);
      if (!specimen) return prev;
      return {
        ...prev,
        specimensDiscovered: { ...prev.specimensDiscovered, [specimenId]: true },
        specimensCount: prev.specimensCount + 1,
        xp: prev.xp + specimen.points,
        polarTokens: prev.polarTokens + specimen.points,
      };
    });
  }, []);

  const getAESpecimensByRarity = useCallback((rarity: AERarity) => {
    return AE_SPECIMENS.filter((sp) => sp.rarity === rarity);
  }, []);

  const getAESpecimensByZone = useCallback((zoneId: string) => {
    return AE_SPECIMENS.filter((sp) => sp.habitat === AE_ZONES.find((z) => z.id === zoneId)?.name);
  }, []);

  /* ──────── Supplies ──────── */

  const getAESupplyById = useCallback((supplyId: string) => {
    return AE_SUPPLIES.find((su) => su.id === supplyId) ?? null;
  }, []);

  const getAEAllSupplies = useCallback(() => AE_SUPPLIES, []);

  const getAESupplyQuantity = useCallback((supplyId: string) => {
    return stateRef.current.supplies[supplyId] ?? 0;
  }, []);

  const getAESuppliesList = useCallback(() => {
    const s = stateRef.current;
    return AE_SUPPLIES.map((su) => ({
      ...su,
      quantity: s.supplies[su.id] ?? 0,
    }));
  }, []);

  const addAESupply = useCallback((supplyId: string, amount: number) => {
    setState((prev) => {
      const supply = AE_SUPPLIES.find((su) => su.id === supplyId);
      if (!supply) return prev;
      const current = prev.supplies[supplyId] ?? 0;
      const newQty = Math.min(supply.maxQuantity, current + amount);
      return { ...prev, supplies: { ...prev.supplies, [supplyId]: newQty } };
    });
  }, []);

  const useAESupply = useCallback((supplyId: string, amount: number) => {
    setState((prev) => {
      const current = prev.supplies[supplyId] ?? 0;
      if (current < amount) return prev;
      return { ...prev, supplies: { ...prev.supplies, [supplyId]: current - amount } };
    });
  }, []);

  const hasAESupply = useCallback((supplyId: string, amount: number) => {
    return (stateRef.current.supplies[supplyId] ?? 0) >= amount;
  }, []);

  const getAESupplyCount = useCallback(() => {
    const s = stateRef.current;
    return AE_SUPPLIES.filter((su) => (s.supplies[su.id] ?? 0) > 0).length;
  }, []);

  const getAESupplyCategories = useCallback(() => {
    const categories: Record<string, string[]> = {
      'Clothing': ['thermal_suit', 'windbreaker', 'gloves', 'sunglasses'],
      'Tools': ['ice_axe', 'snowshoes', 'rope', 'snow_shovel', 'ice_chisel'],
      'Food & Drink': ['rations', 'hot_cocoa', 'syrup'],
      'Shelter': ['igloo_kit', 'tent', 'sleeping_bag'],
      'Navigation': ['gps_device', 'compass', 'radio', 'satellite_phone'],
      'Light': ['headlamp', 'flares'],
      'Medical': ['first_aid'],
      'Research': ['camera', 'binoculars', 'notebook', 'magnifying_glass'],
      'Heat': ['portable_stove', 'fuel_canister'],
      'Special': ['dog_sled', 'fish_hook'],
    };
    return categories;
  }, []);

  /* ──────── Base Camp ──────── */

  const getAECampStructureById = useCallback((structureId: string) => {
    return stateRef.current.campStructures[structureId] ?? null;
  }, []);

  const getAEAllCampStructures = useCallback(() => {
    const s = stateRef.current;
    return AE_BASE_CAMP_STRUCTURES.map((st) => s.campStructures[st.id] ?? { ...st, level: 0, built: false });
  }, []);

  const getAEBuiltStructures = useCallback(() => {
    const s = stateRef.current;
    return AE_BASE_CAMP_STRUCTURES
      .map((st) => s.campStructures[st.id])
      .filter((st): st is AEBaseCampStructure => st !== undefined && st.built);
  }, []);

  const getAEBuiltCount = useCallback(() => {
    const s = stateRef.current;
    return Object.values(s.campStructures).filter((st) => st.built).length;
  }, []);

  const buildAECampStructure = useCallback((structureId: string) => {
    setState((prev) => {
      const struct = prev.campStructures[structureId];
      if (!struct || struct.built) return prev;
      if (prev.polarTokens < struct.buildCost) return prev;
      return {
        ...prev,
        polarTokens: prev.polarTokens - struct.buildCost,
        campStructures: { ...prev.campStructures, [structureId]: { ...struct, built: true, level: 1 } },
      };
    });
  }, []);

  const upgradeAECampStructure = useCallback((structureId: string) => {
    setState((prev) => {
      const struct = prev.campStructures[structureId];
      if (!struct || !struct.built || struct.level >= struct.maxLevel) return prev;
      const cost = struct.level * 30;
      if (prev.polarTokens < cost) return prev;
      return {
        ...prev,
        polarTokens: prev.polarTokens - cost,
        campStructures: { ...prev.campStructures, [structureId]: { ...struct, level: struct.level + 1 } },
      };
    });
  }, []);

  const getAECampMorale = useCallback(() => stateRef.current.campMorale, []);

  const adjustAECampMorale = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, campMorale: Math.max(0, Math.min(100, prev.campMorale + delta)) }));
  }, []);

  const setAECampMorale = useCallback((morale: number) => {
    setState((prev) => ({ ...prev, campMorale: Math.max(0, Math.min(100, morale)) }));
  }, []);

  const getAECampEfficiency = useCallback(() => {
    const s = stateRef.current;
    const builtStructs = Object.values(s.campStructures).filter((st) => st.built);
    if (builtStructs.length === 0) return 1.0;
    const avgLevel = builtStructs.reduce((sum, st) => sum + st.level, 0) / builtStructs.length;
    return 1.0 + avgLevel * 0.1;
  }, []);

  /* ──────── Abilities ──────── */

  const getAEAbilityById = useCallback((abilityId: string) => {
    return stateRef.current.abilities[abilityId] ?? null;
  }, []);

  const getAEAllAbilities = useCallback(() => {
    const s = stateRef.current;
    return AE_SURVIVAL_ABILITIES.map((ab) => s.abilities[ab.id] ?? { ...ab, unlocked: false, level: 0 });
  }, []);

  const getAEUnlockedAbilities = useCallback(() => {
    const s = stateRef.current;
    return AE_SURVIVAL_ABILITIES
      .map((ab) => s.abilities[ab.id])
      .filter((ab): ab is AESurvivalAbility => ab !== undefined && ab.unlocked);
  }, []);

  const isAEAbilityUnlocked = useCallback((abilityId: string) => {
    return !!stateRef.current.abilities[abilityId]?.unlocked;
  }, []);

  const unlockAEAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability || ability.unlocked) return prev;
      if (prev.polarTokens < 50) return prev;
      return {
        ...prev,
        polarTokens: prev.polarTokens - 50,
        abilities: { ...prev.abilities, [abilityId]: { ...ability, unlocked: true, level: 1 } },
      };
    });
  }, []);

  const upgradeAEAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability || !ability.unlocked || ability.level >= ability.maxLevel) return prev;
      const cost = ability.level * 40;
      if (prev.polarTokens < cost) return prev;
      return {
        ...prev,
        polarTokens: prev.polarTokens - cost,
        abilities: { ...prev.abilities, [abilityId]: { ...ability, level: ability.level + 1 } },
      };
    });
  }, []);

  const getAEAbilityCount = useCallback(() => {
    const s = stateRef.current;
    return Object.values(s.abilities).filter((ab) => ab.unlocked).length;
  }, []);

  const useAEAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities[abilityId];
      if (!ability || !ability.unlocked) return prev;
      return {
        ...prev,
        stamina: Math.max(0, prev.stamina - 15),
      };
    });
  }, []);

  /* ──────── Achievements ──────── */

  const getAEAchievementById = useCallback((achievementId: string) => {
    return stateRef.current.achievements[achievementId] ?? null;
  }, []);

  const getAEAllAchievements = useCallback(() => {
    const s = stateRef.current;
    return AE_ACHIEVEMENTS.map((ac) => s.achievements[ac.id] ?? { ...ac, unlocked: false, progress: 0 });
  }, []);

  const getAEUnlockedAchievements = useCallback(() => {
    const s = stateRef.current;
    return AE_ACHIEVEMENTS
      .map((ac) => s.achievements[ac.id])
      .filter((ac): ac is AEAchievement => ac !== undefined && ac.unlocked);
  }, []);

  const getAELockedAchievements = useCallback(() => {
    const s = stateRef.current;
    return AE_ACHIEVEMENTS
      .map((ac) => s.achievements[ac.id])
      .filter((ac): ac is AEAchievement => ac !== undefined && !ac.unlocked);
  }, []);

  const isAEAchievementUnlocked = useCallback((achievementId: string) => {
    return !!stateRef.current.achievements[achievementId]?.unlocked;
  }, []);

  const advanceAEAchievement = useCallback((achievementId: string, amount: number) => {
    setState((prev) => {
      const achievement = prev.achievements[achievementId];
      if (!achievement || achievement.unlocked) return prev;
      const newProgress = Math.min(achievement.target, achievement.progress + amount);
      const newUnlocked = newProgress >= achievement.target;
      return {
        ...prev,
        achievements: {
          ...prev.achievements,
          [achievementId]: { ...achievement, progress: newProgress, unlocked: newUnlocked },
        },
        xp: newUnlocked ? prev.xp + achievement.points : prev.xp,
        polarTokens: newUnlocked ? prev.polarTokens + achievement.points : prev.polarTokens,
      };
    });
  }, []);

  const getAEAchievementCount = useCallback(() => {
    const s = stateRef.current;
    return Object.values(s.achievements).filter((ac) => ac.unlocked).length;
  }, []);

  const getAEAchievementPoints = useCallback(() => {
    const s = stateRef.current;
    return Object.values(s.achievements).reduce((sum, ac) => sum + (ac.unlocked ? ac.points : 0), 0);
  }, []);

  /* ──────── Titles ──────── */

  const getAEAllTitles = useCallback(() => AE_TITLES, []);

  const getAEActiveTitle = useCallback(() => {
    const s = stateRef.current;
    return AE_TITLES.find((t) => t.id === s.activeTitle) ?? AE_TITLES[0];
  }, []);

  const getAEUnlockedTitles = useCallback(() => {
    const s = stateRef.current;
    return AE_TITLES.filter((t) => s.unlockedTitles[t.id]);
  }, []);

  const isAETitleUnlocked = useCallback((titleId: string) => {
    return !!stateRef.current.unlockedTitles[titleId];
  }, []);

  const setAEActiveTitle = useCallback((titleId: string) => {
    setState((prev) => {
      if (!prev.unlockedTitles[titleId]) return prev;
      return { ...prev, activeTitle: titleId };
    });
  }, []);

  const unlockAETitle = useCallback((titleId: string) => {
    setState((prev) => {
      if (prev.unlockedTitles[titleId]) return prev;
      return { ...prev, unlockedTitles: { ...prev.unlockedTitles, [titleId]: true } };
    });
  }, []);

  const getAETitleBonus = useCallback(() => {
    const s = stateRef.current;
    const title = AE_TITLES.find((t) => t.id === s.activeTitle);
    return title?.bonusMultiplier ?? 1.0;
  }, []);

  /* ──────── Aurora Events ──────── */

  const getAEAllAuroraEvents = useCallback(() => AE_AURORA_EVENTS, []);

  const getAEActiveAurora = useCallback(() => {
    const s = stateRef.current;
    if (!s.activeAurora) return null;
    return AE_AURORA_EVENTS.find((ev) => ev.id === s.activeAurora) ?? null;
  }, []);

  const triggerAEAurora = useCallback(() => {
    const aurora = AE_randomFrom(AE_AURORA_EVENTS);
    setState((prev) => ({ ...prev, activeAurora: aurora.id }));
  }, []);

  const dismissAEAurora = useCallback(() => {
    setState((prev) => ({ ...prev, activeAurora: null }));
  }, []);

  const getAEAuroraXpBonus = useCallback(() => {
    const s = stateRef.current;
    if (!s.activeAurora) return 0;
    const aurora = AE_AURORA_EVENTS.find((ev) => ev.id === s.activeAurora);
    return aurora?.xpBonus ?? 0;
  }, []);

  const observeAEAurora = useCallback(() => {
    setState((prev) => {
      if (!prev.activeAurora) return prev;
      const aurora = AE_AURORA_EVENTS.find((ev) => ev.id === prev.activeAurora);
      return {
        ...prev,
        xp: prev.xp + (aurora?.xpBonus ?? 0),
        researchNotes: prev.researchNotes + 2,
        activeAurora: null,
      };
    });
  }, []);

  /* ──────── Blizzard Events ──────── */

  const getAEAllBlizzardEvents = useCallback(() => AE_BLIZZARD_EVENTS, []);

  const getAEIsBlizzardActive = useCallback(() => stateRef.current.blizzardActive, []);

  const getAECurrentBlizzard = useCallback(() => stateRef.current.currentBlizzard, []);

  const triggerAEBlizzard = useCallback(() => {
    const blizzard = AE_randomFrom(AE_BLIZZARD_EVENTS);
    setState((prev) => ({
      ...prev,
      blizzardActive: true,
      currentBlizzard: blizzard,
      temperature: prev.temperature - blizzard.temperatureDrop,
    }));
  }, []);

  const endAEBlizzard = useCallback(() => {
    setState((prev) => ({
      ...prev,
      blizzardActive: false,
      currentBlizzard: null,
      polarTokens: prev.polarTokens + (prev.currentBlizzard?.survivalReward ?? 0),
    }));
  }, []);

  const surviveAEBlizzard = useCallback(() => {
    const s = stateRef.current;
    if (!s.blizzardActive || !s.currentBlizzard) return;
    setState((prev) => ({
      ...prev,
      blizzardActive: false,
      currentBlizzard: null,
      polarTokens: prev.polarTokens + (prev.currentBlizzard?.survivalReward ?? 0),
      xp: prev.xp + (prev.currentBlizzard?.survivalReward ?? 0),
      health: Math.max(10, prev.health - 15),
    }));
  }, []);

  /* ──────── Cave Systems ──────── */

  const getAEAllCaveSystems = useCallback(() => {
    const s = stateRef.current;
    return AE_CAVE_SYSTEMS.map((c) => s.caveSystems[c.id] ?? { ...c, explored: false });
  }, []);

  const getAECaveById = useCallback((caveId: string) => {
    return stateRef.current.caveSystems[caveId] ?? null;
  }, []);

  const isAECaveExplored = useCallback((caveId: string) => {
    return !!stateRef.current.caveSystems[caveId]?.explored;
  }, []);

  const exploreAECave = useCallback((caveId: string) => {
    setState((prev) => {
      const cave = prev.caveSystems[caveId];
      if (!cave || cave.explored) return prev;
      return {
        ...prev,
        caveSystems: { ...prev.caveSystems, [caveId]: { ...cave, explored: true } },
        xp: prev.xp + 75,
        researchNotes: prev.researchNotes + 5,
        stamina: Math.max(0, prev.stamina - 30),
      };
    });
  }, []);

  const getAECaveExploreCount = useCallback(() => {
    const s = stateRef.current;
    return Object.values(s.caveSystems).filter((c) => c.explored).length;
  }, []);

  /* ──────── Wildlife Tracking ──────── */

  const getAEWildlifeTracks = useCallback(() => stateRef.current.wildlifeTracks, []);

  const addAEWildlifeTrack = useCallback((track: Omit<AEWildlifeTrack, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      wildlifeTracks: [...prev.wildlifeTracks, { ...track, id: AE_generateId(), timestamp: Date.now() }],
    }));
  }, []);

  const clearAEWildlifeTracks = useCallback(() => {
    setState((prev) => ({ ...prev, wildlifeTracks: [] }));
  }, []);

  const getAETrackCount = useCallback(() => stateRef.current.wildlifeTracks.length, []);

  const getAEFreshestTrack = useCallback(() => {
    const tracks = stateRef.current.wildlifeTracks;
    if (tracks.length === 0) return null;
    return tracks.reduce((best, t) => (t.timestamp > best.timestamp ? t : best));
  }, []);

  /* ──────── Photo Album ──────── */

  const getAEPhotoAlbum = useCallback(() => stateRef.current.photoAlbum, []);

  const addAEPhoto = useCallback((photo: Omit<AEPhotoEntry, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      photoAlbum: [...prev.photoAlbum, { ...photo, id: AE_generateId(), timestamp: Date.now() }],
      xp: prev.xp + Math.round(photo.quality * 0.5),
    }));
  }, []);

  const getAEPhotoCount = useCallback(() => stateRef.current.photoAlbum.length, []);

  const getAEBestPhoto = useCallback(() => {
    const photos = stateRef.current.photoAlbum;
    if (photos.length === 0) return null;
    return photos.reduce((best, p) => (p.quality > best.quality ? p : best));
  }, []);

  const getAEPhotosByZone = useCallback((zoneId: string) => {
    return stateRef.current.photoAlbum.filter((p) => p.zoneId === zoneId);
  }, []);

  const clearAEPhotoAlbum = useCallback(() => {
    setState((prev) => ({ ...prev, photoAlbum: [] }));
  }, []);

  /* ──────── Exploration Logs ──────── */

  const getAEExplorationLogs = useCallback(() => stateRef.current.explorationLogs, []);

  const addAEExplorationLog = useCallback((log: Omit<AEExplorationLog, 'id' | 'timestamp'>) => {
    setState((prev) => ({
      ...prev,
      explorationLogs: [...prev.explorationLogs, { ...log, id: AE_generateId(), timestamp: Date.now() }],
    }));
  }, []);

  const getAERecentLogs = useCallback((count: number) => {
    const logs = stateRef.current.explorationLogs;
    return logs.slice(-count).reverse();
  }, []);

  const getAELogsByZone = useCallback((zoneId: string) => {
    return stateRef.current.explorationLogs.filter((l) => l.zoneId === zoneId);
  }, []);

  const clearAEExplorationLogs = useCallback(() => {
    setState((prev) => ({ ...prev, explorationLogs: [] }));
  }, []);

  /* ──────── Daily Patrol ──────── */

  const getAEDailyPatrols = useCallback(() => stateRef.current.dailyPatrols, []);

  const getAETodayPatrol = useCallback(() => {
    const s = stateRef.current;
    return s.dailyPatrols.find((p) => p.day === s.expeditionDays) ?? null;
  }, []);

  const generateAEDailyPatrol = useCallback(() => {
    const s = stateRef.current;
    const zone = AE_randomFrom(AE_ZONES.filter((z) => s.level >= z.requiredLevel));
    const tasks = ['Track wildlife', 'Collect ice samples', 'Set up observation post', 'Photograph specimens', 'Check camp perimeter'];
    const selectedTasks = tasks.sort(() => Math.random() - 0.5).slice(0, 3);
    const rewards = ['+25 XP', '+15 polar tokens', '+1 supply crate', '+10 research notes'];
    const selectedRewards = rewards.sort(() => Math.random() - 0.5).slice(0, 2);
    const patrol: AEDailyPatrol = {
      id: AE_generateId(),
      day: s.expeditionDays,
      completed: false,
      targetZone: zone.id,
      tasks: selectedTasks,
      rewards: selectedRewards,
      bonusXp: AE_randomInt(20, 60),
    };
    setState((prev) => ({
      ...prev,
      dailyPatrols: [...prev.dailyPatrols, patrol],
    }));
    return patrol;
  }, []);

  const completeAEDailyPatrol = useCallback(() => {
    setState((prev) => {
      const todayPatrol = prev.dailyPatrols.find((p) => p.day === prev.expeditionDays);
      if (!todayPatrol || todayPatrol.completed) return prev;
      return {
        ...prev,
        dailyPatrols: prev.dailyPatrols.map((p) => (p.id === todayPatrol.id ? { ...p, completed: true } : p)),
        xp: prev.xp + todayPatrol.bonusXp,
        polarTokens: prev.polarTokens + 20,
      };
    });
  }, []);

  const getAECompletedPatrols = useCallback(() => {
    return stateRef.current.dailyPatrols.filter((p) => p.completed).length;
  }, []);

  /* ──────── Polar Tokens & Resources ──────── */

  const getAEPolarTokens = useCallback(() => stateRef.current.polarTokens, []);

  const addAEPolarTokens = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, polarTokens: prev.polarTokens + amount }));
  }, []);

  const spendAEPolarTokens = useCallback((amount: number) => {
    setState((prev) => {
      if (prev.polarTokens < amount) return prev;
      return { ...prev, polarTokens: prev.polarTokens - amount };
    });
  }, []);

  const hasAEPolarTokens = useCallback((amount: number) => {
    return stateRef.current.polarTokens >= amount;
  }, []);

  const getAEFoodRations = useCallback(() => stateRef.current.foodRations, []);

  const adjustAEFoodRations = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, foodRations: Math.max(0, prev.foodRations + delta) }));
  }, []);

  const getAEFuelReserves = useCallback(() => stateRef.current.fuelReserves, []);

  const adjustAEFuelReserves = useCallback((delta: number) => {
    setState((prev) => ({ ...prev, fuelReserves: Math.max(0, prev.fuelReserves + delta) }));
  }, []);

  const getAEResearchNotes = useCallback(() => stateRef.current.researchNotes, []);

  const addAEResearchNotes = useCallback((amount: number) => {
    setState((prev) => ({ ...prev, researchNotes: prev.researchNotes + amount }));
  }, []);

  /* ──────── Words Integration ──────── */

  const getAETotalWordsFound = useCallback(() => stateRef.current.totalWordsFound, []);

  const incrementAEWordsFound = useCallback((count?: number) => {
    setState((prev) => ({
      ...prev,
      totalWordsFound: prev.totalWordsFound + (count ?? 1),
      xp: prev.xp + (count ?? 1) * 5,
    }));
  }, []);

  const onAEWordFound = useCallback(() => {
    setState((prev) => ({
      ...prev,
      totalWordsFound: prev.totalWordsFound + 1,
      xp: prev.xp + 5,
      stamina: Math.max(0, prev.stamina - 2),
    }));
    advanceAEAchievement('word_hunter_ice', 1);
  }, [advanceAEAchievement]);

  /* ──────── Expedition Rank ──────── */

  const getAEExpeditionRank = useCallback(() => stateRef.current.expeditionRank, []);

  const setAEExpeditionRank = useCallback((rank: number) => {
    setState((prev) => ({ ...prev, expeditionRank: rank }));
  }, []);

  const calculateAERank = useCallback(() => {
    const s = stateRef.current;
    const score =
      s.level * 100 +
      s.specimensCount * 50 +
      Object.values(s.achievements).filter((a) => a.unlocked).length * 75 +
      Object.values(s.abilities).filter((a) => a.unlocked).length * 30 +
      Object.values(s.campStructures).filter((st) => st.built).length * 40 +
      s.totalWordsFound * 2;
    const rank = Math.floor(score / 500);
    setState((prev) => ({ ...prev, expeditionRank: rank }));
    return rank;
  }, []);

  const getAERankTitle = useCallback(() => {
    const rank = stateRef.current.expeditionRank;
    if (rank >= 100) return 'Polar Legend';
    if (rank >= 75) return 'Master Explorer';
    if (rank >= 50) return 'Veteran Adventurer';
    if (rank >= 25) return 'Skilled Navigator';
    if (rank >= 10) return 'Trailblazer';
    return 'Novice Explorer';
  }, []);

  /* ──────── Composite / Derived ──────── */

  const getAESummary = useCallback(() => {
    const s = stateRef.current;
    return {
      level: s.level,
      xp: s.xp,
      health: s.health,
      stamina: s.stamina,
      specimens: s.specimensCount,
      tokens: s.polarTokens,
      zone: s.currentZone,
      morale: s.campMorale,
      rank: s.expeditionRank,
      days: s.expeditionDays,
      wordsFound: s.totalWordsFound,
    };
  }, []);

  const getAEExpeditionStatus = useCallback(() => {
    const s = stateRef.current;
    if (s.health <= 0) return { status: 'incapacitated', color: '#EF4444', label: 'Incapacitated' };
    if (s.blizzardActive) return { status: 'blizzard', color: '#8B5CF6', label: 'Blizzard!' };
    if (s.activeAurora) return { status: 'aurora', color: '#10B981', label: 'Aurora Active' };
    if (s.stamina <= 20) return { status: 'exhausted', color: '#F59E0B', label: 'Exhausted' };
    if (s.isOnExpedition) return { status: 'exploring', color: '#3B82F6', label: 'Exploring' };
    return { status: 'idle', color: '#E2E8F0', label: 'At Base Camp' };
  }, []);

  const getAEDashboardStats = useCallback(() => {
    const s = stateRef.current;
    const builtCount = Object.values(s.campStructures).filter((st) => st.built).length;
    const unlockedAbilities = Object.values(s.abilities).filter((ab) => ab.unlocked).length;
    const unlockedAchievements = Object.values(s.achievements).filter((ac) => ac.unlocked).length;
    const exploredCaves = Object.values(s.caveSystems).filter((c) => c.explored).length;
    return {
      totalSpecimens: AE_SPECIMENS.length,
      discoveredSpecimens: s.specimensCount,
      discoveryPercent: Math.round((s.specimensCount / AE_SPECIMENS.length) * 100),
      totalZones: AE_ZONES.length,
      exploredZones: Object.values(s.zoneProgress).filter((p) => p >= 100).length,
      builtStructures: builtCount,
      totalStructures: AE_BASE_CAMP_STRUCTURES.length,
      unlockedAbilities,
      totalAbilities: AE_SURVIVAL_ABILITIES.length,
      unlockedAchievements,
      totalAchievements: AE_ACHIEVEMENTS.length,
      exploredCaves,
      totalCaves: AE_CAVE_SYSTEMS.length,
      photoCount: s.photoAlbum.length,
      totalWords: s.totalWordsFound,
      patrolCount: s.dailyPatrols.filter((p) => p.completed).length,
      polarTokens: s.polarTokens,
    };
  }, []);

  const getAEStatsForSave = useCallback((): ArcticExpeditionState => {
    return { ...stateRef.current };
  }, []);

  /* ──────── Memos ──────── */

  const getAESpecimenCompletionByRarity = useMemo(() => {
    const s = state;
    const result: Record<AERarity, { found: number; total: number }> = {
      common: { found: 0, total: 0 },
      uncommon: { found: 0, total: 0 },
      rare: { found: 0, total: 0 },
      epic: { found: 0, total: 0 },
      legendary: { found: 0, total: 0 },
    };
    AE_SPECIMENS.forEach((sp) => {
      result[sp.rarity].total += 1;
      if (s.specimensDiscovered[sp.id]) {
        result[sp.rarity].found += 1;
      }
    });
    return result;
  }, [state]);

  const getAERarityDistribution = useMemo(() => {
    const s = state;
    return AE_SPECIMENS.filter((sp) => s.specimensDiscovered[sp.id]).map((sp) => sp.rarity);
  }, [state]);

  const getAEActiveEffects = useMemo(() => {
    const s = state;
    const effects: string[] = [];
    if (s.blizzardActive) effects.push('blizzard');
    if (s.activeAurora) effects.push('aurora');
    if (s.health < s.maxHealth * 0.3) effects.push('injured');
    if (s.stamina < s.maxStamina * 0.2) effects.push('exhausted');
    if (s.campMorale > 90) effects.push('high_morale');
    if (s.campMorale < 30) effects.push('low_morale');
    if (s.temperature < -35) effects.push('extreme_cold');
    return effects;
  }, [state]);

  const getAEZoneAccessList = useMemo(() => {
    return AE_ZONES.map((z) => ({
      ...z,
      accessible: state.level >= z.requiredLevel,
      progress: state.zoneProgress[z.id] ?? 0,
    }));
  }, [state]);

  const getAESupplyInventoryList = useMemo(() => {
    return AE_SUPPLIES.map((su) => ({
      ...su,
      quantity: state.supplies[su.id] ?? 0,
      isEmpty: (state.supplies[su.id] ?? 0) === 0,
      isFull: (state.supplies[su.id] ?? 0) >= su.maxQuantity,
    }));
  }, [state]);

  const getAECampOverview = useMemo(() => {
    const structures = Object.values(state.campStructures);
    const built = structures.filter((st) => st.built);
    const totalLevels = built.reduce((sum, st) => sum + st.level, 0);
    return {
      totalStructures: AE_BASE_CAMP_STRUCTURES.length,
      builtCount: built.length,
      totalLevels,
      avgLevel: built.length > 0 ? Math.round(totalLevels / built.length * 10) / 10 : 0,
      morale: state.campMorale,
    };
  }, [state]);

  const getAERankOverview = useMemo(() => {
    const s = state;
    const score =
      s.level * 100 +
      s.specimensCount * 50 +
      Object.values(s.achievements).filter((a) => a.unlocked).length * 75 +
      Object.values(s.abilities).filter((a) => a.unlocked).length * 30 +
      Object.values(s.campStructures).filter((st) => st.built).length * 40 +
      s.totalWordsFound * 2;
    const rank = Math.floor(score / 500);
    let title = 'Novice Explorer';
    if (rank >= 100) title = 'Polar Legend';
    else if (rank >= 75) title = 'Master Explorer';
    else if (rank >= 50) title = 'Veteran Adventurer';
    else if (rank >= 25) title = 'Skilled Navigator';
    else if (rank >= 10) title = 'Trailblazer';
    return { score, rank, title };
  }, [state]);

  const getAETodayOverview = useMemo(() => {
    const s = state;
    const todayPatrol = s.dailyPatrols.find((p) => p.day === s.expeditionDays);
    return {
      day: s.expeditionDays,
      zone: s.currentZone,
      temperature: s.temperature,
      health: s.health,
      stamina: s.stamina,
      morale: s.campMorale,
      auroraActive: !!s.activeAurora,
      blizzardActive: s.blizzardActive,
      patrolAvailable: !todayPatrol?.completed,
      wordsToday: s.totalWordsFound,
      specimensToday: s.specimensCount,
    };
  }, [state]);

  /* ──────── Weather & Emergency ──────── */

  const getAEWeatherConditions = useCallback(() => AE_WEATHER_CONDITIONS, []);

  const getAECurrentWeather = useCallback(() => {
    const s = stateRef.current;
    if (s.blizzardActive) {
      return { id: 'blizzard', name: 'Blizzard', description: 'A fierce blizzard rages.', temperatureMod: -15, visibilityMod: -60, emoji: '🌬️' };
    }
    if (s.activeAurora) {
      return { id: 'aurora_night', name: 'Aurora Night', description: 'Northern lights dance above.', temperatureMod: -5, visibilityMod: 20, emoji: '🌌' };
    }
    return { id: 'clear_sky', name: 'Clear Arctic Sky', description: 'Crisp, clear visibility.', temperatureMod: 0, visibilityMod: 0, emoji: '☀️' };
  }, []);

  const setAECurrentWeather = useCallback((weatherId: string) => {
    const weather = (AE_WEATHER_CONDITIONS as readonly unknown[]).find((w: unknown) => (w as { id: string }).id === weatherId);
    if (!weather) return;
    const w = weather as { temperatureMod: number };
    setState((prev) => ({
      ...prev,
      temperature: prev.temperature + w.temperatureMod,
    }));
  }, []);

  const getAEEmergencyEvents = useCallback(() => AE_EMERGENCY_EVENTS, []);

  const triggerAEEmergencyEvent = useCallback(() => {
    const idx = AE_randomInt(0, AE_EMERGENCY_EVENTS.length - 1);
    const event = AE_EMERGENCY_EVENTS[idx];
    setState((prev) => ({
      ...prev,
      health: Math.max(0, prev.health - event.healthDamage),
      stamina: Math.max(0, prev.stamina - event.staminaCost),
    }));
    return event;
  }, []);

  const resolveAEEmergencyEvent = useCallback((success: boolean) => {
    if (success) {
      setState((prev) => ({
        ...prev,
        xp: prev.xp + 15,
        polarTokens: prev.polarTokens + 10,
        campMorale: Math.min(100, prev.campMorale + 5),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        health: Math.max(0, prev.health - 10),
        stamina: Math.max(0, prev.stamina - 20),
        campMorale: Math.max(0, prev.campMorale - 10),
      }));
    }
  }, []);

  const getAEEmergencyCount = useCallback(() => {
    const s = stateRef.current;
    const logCount = s.explorationLogs.filter((l) => l.event.includes('emergency')).length;
    return logCount;
  }, []);

  /* ──────── Fishing & Foraging ──────── */

  const performAEIceFishing = useCallback(() => {
    const s = stateRef.current;
    if (s.stamina < 10) return null;
    const fishSpecies = ['Arctic Char', 'Lake Trout', 'Whitefish', 'Cod', 'Smelt'];
    const caught = AE_randomFrom(fishSpecies);
    const xpGain = AE_randomInt(8, 20);
    setState((prev) => ({
      ...prev,
      stamina: Math.max(0, prev.stamina - 10),
      foodRations: prev.foodRations + 2,
      xp: prev.xp + xpGain,
      researchNotes: prev.researchNotes + 1,
    }));
    return { species: caught, xp: xpGain };
  }, []);

  const performAEForaging = useCallback(() => {
    const s = stateRef.current;
    if (s.stamina < 8) return null;
    const forageItems = ['Arctic Berry', 'Lichen', 'Frozen Root', 'Pine Needle Tea', 'Cloud Berry'];
    const found = AE_randomFrom(forageItems);
    const xpGain = AE_randomInt(5, 12);
    setState((prev) => ({
      ...prev,
      stamina: Math.max(0, prev.stamina - 8),
      foodRations: prev.foodRations + 1,
      xp: prev.xp + xpGain,
    }));
    return { item: found, xp: xpGain };
  }, []);

  const getAEFishCaught = useCallback(() => {
    return AE_randomInt(0, 8);
  }, []);

  const getAEForageItems = useCallback(() => {
    return ['Arctic Berry', 'Lichen', 'Frozen Root', 'Pine Needle Tea', 'Cloud Berry', 'Crowberry', 'Bilberry'];
  }, []);

  const getAESurvivalStats = useCallback(() => {
    const s = stateRef.current;
    return {
      fishCatchCount: Math.floor(s.foodRations / 2),
      forageCount: s.researchNotes,
      shelterBuilt: Object.values(s.campStructures).filter((st) => st.built).length,
      blizzardsSurvived: s.explorationLogs.filter((l) => l.event.includes('blizzard')).length,
      daysSurvived: s.expeditionDays,
      totalDistance: s.expeditionDays * 15,
    };
  }, []);

  /* ──────── Camp Actions ──────── */

  const cookAEMeal = useCallback(() => {
    const s = stateRef.current;
    if (s.foodRations < 1) return false;
    setState((prev) => ({
      ...prev,
      foodRations: Math.max(0, prev.foodRations - 1),
      stamina: Math.min(prev.maxStamina, prev.stamina + 25),
      health: Math.min(prev.maxHealth, prev.health + 10),
      campMorale: Math.min(100, prev.campMorale + 5),
      xp: prev.xp + 5,
    }));
    return true;
  }, []);

  const repairAECampEquipment = useCallback(() => {
    setState((prev) => ({
      ...prev,
      polarTokens: Math.max(0, prev.polarTokens - 15),
      xp: prev.xp + 10,
    }));
  }, []);

  const fortifyAECampPerimeter = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stamina: Math.max(0, prev.stamina - 20),
      campMorale: Math.min(100, prev.campMorale + 8),
      xp: prev.xp + 15,
    }));
  }, []);

  const getAECampActionsRemaining = useCallback(() => {
    const s = stateRef.current;
    return Math.floor(s.stamina / 20);
  }, []);

  const resetAECampActions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stamina: prev.maxStamina,
    }));
  }, []);

  return {
    /* Core */
    getAEState,
    resetAEState,
    getAEInitialState,
    getAESummary,
    getAEStatsForSave,

    /* Zone */
    getAECurrentZone,
    setAECurrentZone,
    getAEAvailableZones,
    getAEAllZones,
    getAEZoneById,
    getAEZoneProgress,
    advanceAEZoneProgress,
    isAEZoneComplete,
    getAEZoneExplorationPercent,
    getAEZoneAccessList,

    /* Temperature */
    getAETemperature,
    setAETemperature,
    adjustAETemperature,
    getAETemperatureStatus,
    applyAETemperatureDamage,

    /* Health & Stamina */
    getAEHealth,
    getAEMaxHealth,
    getAEStamina,
    getAEMaxStamina,
    setAEHealth,
    setAEStamina,
    healAEHealth,
    damageAEHealth,
    restoreAEStamina,
    consumeAEStamina,
    getAEHealthPercent,
    getAEStaminaPercent,
    restAtAECamp,

    /* XP & Level */
    getAEXp,
    getAELevel,
    addAEXp,
    getAEXpForNextLevel,
    getAEXpProgressPercent,
    getAELevelTable,

    /* Expedition */
    startAEExpedition,
    endAEExpedition,
    getAEIsOnExpedition,
    getAEExpeditionDays,
    getAEExpeditionDuration,
    advanceAEDay,
    getAEExpeditionStatus,

    /* Specimens */
    getAESpecimenById,
    getAEAllSpecimens,
    getAEDiscoveredSpecimens,
    getAEUndiscoveredSpecimens,
    isAESpecimenDiscovered,
    getAESpecimensCount,
    getAEDiscoveryPercent,
    discoverAESpecimen,
    getAESpecimensByRarity,
    getAESpecimensByZone,
    getAESpecimenCompletionByRarity,
    getAERarityDistribution,

    /* Supplies */
    getAESupplyById,
    getAEAllSupplies,
    getAESupplyQuantity,
    getAESuppliesList,
    addAESupply,
    useAESupply,
    hasAESupply,
    getAESupplyCount,
    getAESupplyCategories,
    getAESupplyInventoryList,

    /* Base Camp */
    getAECampStructureById,
    getAEAllCampStructures,
    getAEBuiltStructures,
    getAEBuiltCount,
    buildAECampStructure,
    upgradeAECampStructure,
    getAECampMorale,
    adjustAECampMorale,
    setAECampMorale,
    getAECampEfficiency,
    getAECampOverview,

    /* Abilities */
    getAEAbilityById,
    getAEAllAbilities,
    getAEUnlockedAbilities,
    isAEAbilityUnlocked,
    unlockAEAbility,
    upgradeAEAbility,
    getAEAbilityCount,
    useAEAbility,

    /* Achievements */
    getAEAchievementById,
    getAEAllAchievements,
    getAEUnlockedAchievements,
    getAELockedAchievements,
    isAEAchievementUnlocked,
    advanceAEAchievement,
    getAEAchievementCount,
    getAEAchievementPoints,

    /* Titles */
    getAEAllTitles,
    getAEActiveTitle,
    getAEUnlockedTitles,
    isAETitleUnlocked,
    setAEActiveTitle,
    unlockAETitle,
    getAETitleBonus,

    /* Aurora Events */
    getAEAllAuroraEvents,
    getAEActiveAurora,
    triggerAEAurora,
    dismissAEAurora,
    getAEAuroraXpBonus,
    observeAEAurora,

    /* Blizzard Events */
    getAEAllBlizzardEvents,
    getAEIsBlizzardActive,
    getAECurrentBlizzard,
    triggerAEBlizzard,
    endAEBlizzard,
    surviveAEBlizzard,

    /* Cave Systems */
    getAEAllCaveSystems,
    getAECaveById,
    isAECaveExplored,
    exploreAECave,
    getAECaveExploreCount,

    /* Wildlife Tracking */
    getAEWildlifeTracks,
    addAEWildlifeTrack,
    clearAEWildlifeTracks,
    getAETrackCount,
    getAEFreshestTrack,

    /* Photo Album */
    getAEPhotoAlbum,
    addAEPhoto,
    getAEPhotoCount,
    getAEBestPhoto,
    getAEPhotosByZone,
    clearAEPhotoAlbum,

    /* Exploration Logs */
    getAEExplorationLogs,
    addAEExplorationLog,
    getAERecentLogs,
    getAELogsByZone,
    clearAEExplorationLogs,

    /* Daily Patrol */
    getAEDailyPatrols,
    getAETodayPatrol,
    generateAEDailyPatrol,
    completeAEDailyPatrol,
    getAECompletedPatrols,

    /* Resources */
    getAEPolarTokens,
    addAEPolarTokens,
    spendAEPolarTokens,
    hasAEPolarTokens,
    getAEFoodRations,
    adjustAEFoodRations,
    getAEFuelReserves,
    adjustAEFuelReserves,
    getAEResearchNotes,
    addAEResearchNotes,

    /* Words Integration */
    getAETotalWordsFound,
    incrementAEWordsFound,
    onAEWordFound,

    /* Rank */
    getAEExpeditionRank,
    setAEExpeditionRank,
    calculateAERank,
    getAERankTitle,
    getAERankOverview,

    /* Weather & Emergency */
    getAEWeatherConditions,
    getAECurrentWeather,
    setAECurrentWeather,
    getAEEmergencyEvents,
    triggerAEEmergencyEvent,
    resolveAEEmergencyEvent,
    getAEEmergencyCount,

    /* Fishing & Foraging */
    performAEIceFishing,
    performAEForaging,
    getAEFishCaught,
    getAEForageItems,
    getAESurvivalStats,

    /* Camp Actions */
    cookAEMeal,
    repairAECampEquipment,
    fortifyAECampPerimeter,
    getAECampActionsRemaining,
    resetAECampActions,

    /* Composite / Dashboard */
    getAEDashboardStats,
    getAEActiveEffects,
    getAETodayOverview,
  };
}
