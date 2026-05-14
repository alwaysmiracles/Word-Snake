import { useState, useCallback, useMemo, useRef } from 'react';

// ─── Types & Interfaces ───────────────────────────────────────────────────────

type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

interface CoralDef {
  id: string;
  name: string;
  rarity: Rarity;
  xp: number;
  color: string;
  growthTime: number;
  description: string;
}

interface CoralInstance {
  defId: string;
  plantedAt: number;
  wateredAt: number;
  health: number;
  maturity: number;
  zoneId: string;
}

interface ZoneDef {
  id: string;
  name: string;
  depth: number;
  color: string;
  unlockLevel: number;
  pollution: number;
  description: string;
}

interface ZoneInstance {
  defId: string;
  unlocked: boolean;
  explored: boolean;
  pollution: number;
  coralSlots: number;
  structures: string[];
}

interface ResourceDef {
  id: string;
  name: string;
  rarity: Rarity;
  value: number;
  description: string;
}

interface StructureDef {
  id: string;
  name: string;
  maxLevel: number;
  baseCost: number;
  description: string;
}

interface StructureInstance {
  defId: string;
  level: number;
  zoneId: string;
  builtAt: number;
}

interface AbilityDef {
  id: string;
  name: string;
  cooldown: number;
  cost: number;
  description: string;
  unlockLevel: number;
}

interface CreatureDef {
  id: string;
  name: string;
  favor: number;
  maxFavor: number;
  description: string;
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
}

interface TitleDef {
  id: number;
  name: string;
  requiredLevel: number;
}

interface QuestDef {
  type: string;
  target: number;
  reward: number;
  description: string;
}

interface RecipeDef {
  id: string;
  name: string;
  ingredients: Record<string, number>;
  result: string;
  resultQty: number;
  xp: number;
}

interface CoralReefState {
  level: number;
  xp: number;
  maxXp: number;
  coins: number;
  corals: Record<string, CoralInstance>;
  zones: Record<string, ZoneInstance>;
  discoveries: string[];
  achievements: string[];
  currentTitle: number;
  inventory: Record<string, number>;
  dailyQuest: { completed: boolean; progress: number; target: number; type: string };
  dayStreak: number;
  totalCoralsPlanted: number;
  totalCoralsHarvested: number;
  totalZonesExplored: number;
  totalPollutionCleaned: number;
  totalCreaturesBefriended: number;
  totalResourcesCollected: number;
  totalStructuresBuilt: number;
  totalAbilitiesUsed: number;
  creatures: Record<string, { favor: number; lastFed: number }>;
  structures: Record<string, StructureInstance>;
  abilities: Record<string, { lastUsed: number; uses: number }>;
  recipes: string[];
  events: string[];
  eventTimer: number;
  lastDailyReset: number;
  selectedZone: string;
  selectedCoral: string;
  settings: { sfxEnabled: boolean; particlesEnabled: boolean; ambientSounds: boolean };
}

// ─── Color Constants ──────────────────────────────────────────────────────────

const CRL_COLORS = {
  primary: '#0D9488',
  secondary: '#06B6D4',
  accent: '#22D3EE',
  coralPink: '#F472B6',
  seaGreen: '#34D399',
  deepOcean: '#0C4A6E',
  abyssal: '#164E63',
  sand: '#FCD34D',
  foam: '#E0F2FE',
  pearl: '#F1F5F9',
  biolum: '#A78BFA',
};

// ─── Coral Definitions (35 species) ──────────────────────────────────────────

const CRL_CORALS: CoralDef[] = [
  { id: 'brain_coral', name: 'Brain Coral', rarity: 'Common', xp: 10, color: '#9CA3AF', growthTime: 300, description: 'A rounded coral with grooved surface resembling a brain.' },
  { id: 'mushroom_coral', name: 'Mushroom Coral', rarity: 'Common', xp: 10, color: '#D97706', growthTime: 280, description: 'Disc-shaped coral resembling an umbrella mushroom.' },
  { id: 'finger_coral', name: 'Finger Coral', rarity: 'Common', xp: 12, color: '#F59E0B', growthTime: 260, description: 'Cylindrical branches reaching upward like fingers.' },
  { id: 'star_coral', name: 'Star Coral', rarity: 'Common', xp: 12, color: '#EAB308', growthTime: 300, description: 'Formed in star-like patterns across the reef.' },
  { id: 'tube_coral', name: 'Tube Coral', rarity: 'Common', xp: 11, color: '#8B5CF6', growthTime: 290, description: 'Hollow tubular structures swaying in the current.' },
  { id: 'lettuce_coral', name: 'Lettuce Coral', rarity: 'Common', xp: 10, color: '#84CC16', growthTime: 310, description: 'Leafy plates that unfurl like sea lettuce.' },
  { id: 'flower_coral', name: 'Flower Coral', rarity: 'Uncommon', xp: 20, color: '#EC4899', growthTime: 450, description: 'Petals of polyps that bloom in vivid pink clusters.' },
  { id: 'fire_coral', name: 'Fire Coral', rarity: 'Uncommon', xp: 22, color: '#EF4444', growthTime: 500, description: 'Burns with fiery hues, can sting on contact.' },
  { id: 'blue_ridge', name: 'Blue Ridge Coral', rarity: 'Uncommon', xp: 25, color: '#3B82F6', growthTime: 480, description: 'A striking ridge of deep cerulean polyps.' },
  { id: 'staghorn_coral', name: 'Staghorn Coral', rarity: 'Uncommon', xp: 23, color: '#F97316', growthTime: 520, description: 'Branching antler-like colonies forming thickets.' },
  { id: 'elkhorn_coral', name: 'Elkhorn Coral', rarity: 'Uncommon', xp: 24, color: '#FDE68A', growthTime: 510, description: 'Broad flattened branches like moose antlers.' },
  { id: 'pillar_coral', name: 'Pillar Coral', rarity: 'Uncommon', xp: 21, color: '#A3A3A3', growthTime: 470, description: 'Grows in tall columns rising from the seabed.' },
  { id: 'cabbage_coral', name: 'Cabbage Coral', rarity: 'Uncommon', xp: 20, color: '#65A30D', growthTime: 460, description: 'Layered fronds resembling green cabbage heads.' },
  { id: 'table_coral', name: 'Table Coral', rarity: 'Rare', xp: 40, color: '#14B8A6', growthTime: 750, description: 'Broad flat plates creating tabletop structures.' },
  { id: 'sun_coral', name: 'Sun Coral', rarity: 'Rare', xp: 45, color: '#FB923C', growthTime: 800, description: 'Radiates golden-orange like a living sunrise.' },
  { id: 'moon_coral', name: 'Moon Coral', rarity: 'Rare', xp: 42, color: '#C4B5FD', growthTime: 780, description: 'Bioluminescent polyps glow under moonlight.' },
  { id: 'fox_coral', name: 'Fox Coral', rarity: 'Rare', xp: 38, color: '#FBBF24', growthTime: 720, description: 'Delicate translucent plates with flowing edges.' },
  { id: 'hammer_coral', name: 'Hammer Coral', rarity: 'Rare', xp: 44, color: '#86EFAC', growthTime: 770, description: 'Tentacle tips shaped like tiny anchors.' },
  { id: 'torch_coral', name: 'Torch Coral', rarity: 'Rare', xp: 43, color: '#FB7185', growthTime: 790, description: 'Sweeping tentacles that glow with inner fire.' },
  { id: 'frogspawn_coral', name: 'Frogspawn Coral', rarity: 'Rare', xp: 41, color: '#FCA5A5', growthTime: 740, description: 'Clustered polyps resembling a mass of eggs.' },
  { id: 'bubble_coral', name: 'Bubble Coral', rarity: 'Rare', xp: 39, color: '#67E8F9', growthTime: 730, description: 'Inflated vesicles resembling pearls on the reef.' },
  { id: 'duncan_coral', name: 'Duncan Coral', rarity: 'Rare', xp: 40, color: '#A5B4FC', growthTime: 760, description: 'Whispy green polyps emerging from a central stalk.' },
  { id: 'acanthastrea', name: 'Acanthastrea', rarity: 'Epic', xp: 75, color: '#E879F9', growthTime: 1200, description: 'A mesmerizing maze pattern in vivid fuchsia.' },
  { id: 'chalice_coral', name: 'Chalice Coral', rarity: 'Epic', xp: 80, color: '#2DD4BF', growthTime: 1300, description: 'A cup-like formation with rainbow encrusting.' },
  { id: 'scolymia', name: 'Scolymia', rarity: 'Epic', xp: 78, color: '#F0ABFC', growthTime: 1250, description: 'Single massive polyp with psychedelic patterns.' },
  { id: 'trachyphyllia', name: 'Trachyphyllia', rarity: 'Epic', xp: 76, color: '#4ADE80', growthTime: 1220, description: 'Wavy folds of neon green and metallic blue.' },
  { id: 'mycedium', name: 'Mycedium', rarity: 'Epic', xp: 77, color: '#38BDF8', growthTime: 1240, description: 'Eyeball coral with vivid blue-green centers.' },
  { id: 'cyphastrea', name: 'Cyphastrea', rarity: 'Epic', xp: 74, color: '#F472B6', growthTime: 1180, description: 'Sparkling encrusting coral with neon eyes.' },
  { id: 'ancient_brain', name: 'Ancient Brain Coral', rarity: 'Legendary', xp: 150, color: '#0D9488', growthTime: 2000, description: 'A millennia-old brain coral pulsing with wisdom.' },
  { id: 'dragon_breath', name: 'Dragon Breath Coral', rarity: 'Legendary', xp: 160, color: '#DC2626', growthTime: 2200, description: 'Belches bioluminescent fire into dark waters.' },
  { id: 'celestial_fan', name: 'Celestial Fan Coral', rarity: 'Legendary', xp: 155, color: '#7C3AED', growthTime: 2100, description: 'A vast sea fan shimmering with cosmic light.' },
  { id: 'abyssal_bloom', name: 'Abyssal Bloom Coral', rarity: 'Legendary', xp: 165, color: '#06B6D4', growthTime: 2300, description: 'Glowing flower from the deepest ocean trenches.' },
  { id: 'phoenix_branch', name: 'Phoenix Branch Coral', rarity: 'Legendary', xp: 170, color: '#F97316', growthTime: 2500, description: 'Regenerates from bleaching in brilliant flames.' },
  { id: 'kraken_garden', name: 'Kraken Garden Coral', rarity: 'Legendary', xp: 158, color: '#164E63', growthTime: 2400, description: 'Living coral tended by ancient kraken tentacles.' },
  { id: 'mermaid_tiara', name: 'Mermaid Tiara Coral', rarity: 'Legendary', xp: 162, color: '#F472B6', growthTime: 2350, description: 'Crown-shaped coral woven from mermaid magic.' },
];

// ─── Reef Zones (8) ───────────────────────────────────────────────────────────

const CRL_ZONES: ZoneDef[] = [
  { id: 'shallow_lagoon', name: 'Shallow Lagoon', depth: 5, color: '#22D3EE', unlockLevel: 1, pollution: 10, description: 'A sunlit tropical lagoon with warm shallow waters.' },
  { id: 'coral_garden', name: 'Coral Garden', depth: 15, color: '#34D399', unlockLevel: 3, pollution: 15, description: 'A vibrant garden of colorful corals and sea fans.' },
  { id: 'deep_reef', name: 'Deep Reef', depth: 30, color: '#0D9488', unlockLevel: 6, pollution: 25, description: 'A deeper reef wall teeming with mysterious life.' },
  { id: 'abyssal_shelf', name: 'Abyssal Shelf', depth: 60, color: '#164E63', unlockLevel: 10, pollution: 40, description: 'The dark edge of the continental shelf.' },
  { id: 'kelp_forest', name: 'Kelp Forest', depth: 20, color: '#65A30D', unlockLevel: 5, pollution: 20, description: 'Towering kelp sway in emerald underwater forests.' },
  { id: 'sea_grass_meadow', name: 'Sea Grass Meadow', depth: 8, color: '#84CC16', unlockLevel: 2, pollution: 12, description: 'Gentle meadows of swaying sea grass and sand.' },
  { id: 'volcanic_vent', name: 'Volcanic Vent', depth: 50, color: '#EF4444', unlockLevel: 8, pollution: 50, description: 'Superheated vents supporting extremophile life.' },
  { id: 'hidden_cave', name: 'Hidden Cave', depth: 40, color: '#A78BFA', unlockLevel: 12, pollution: 35, description: 'A secret underwater cave filled with bioluminescence.' },
];

// ─── Marine Resources (30) ────────────────────────────────────────────────────

const CRL_RESOURCES: ResourceDef[] = [
  { id: 'pearl', name: 'Pearl', rarity: 'Uncommon', value: 15, description: 'A luminous pearl from an oyster.' },
  { id: 'black_pearl', name: 'Black Pearl', rarity: 'Rare', value: 50, description: 'A rare dark pearl of great worth.' },
  { id: 'seashell', name: 'Seashell', rarity: 'Common', value: 3, description: 'A beautiful spiral seashell.' },
  { id: 'conch_shell', name: 'Conch Shell', rarity: 'Uncommon', value: 12, description: 'A large pink conch shell.' },
  { id: 'nautilus_shell', name: 'Nautilus Shell', rarity: 'Rare', value: 45, description: 'A chambered nautilus shell.' },
  { id: 'kelp_frond', name: 'Kelp Frond', rarity: 'Common', value: 2, description: 'A strip of fresh kelp.' },
  { id: 'seaweed', name: 'Seaweed', rarity: 'Common', value: 2, description: 'A strand of green seaweed.' },
  { id: 'plankton_sample', name: 'Plankton Sample', rarity: 'Common', value: 1, description: 'A vial of concentrated plankton.' },
  { id: 'coral_fragment', name: 'Coral Fragment', rarity: 'Uncommon', value: 10, description: 'A broken piece of living coral.' },
  { id: 'sea_glass', name: 'Sea Glass', rarity: 'Common', value: 4, description: 'Smooth tumbled glass from the ocean.' },
  { id: 'starfish', name: 'Starfish', rarity: 'Common', value: 3, description: 'A five-armed sea star.' },
  { id: 'sand_dollar', name: 'Sand Dollar', rarity: 'Uncommon', value: 8, description: 'A flat round echinoid test.' },
  { id: 'driftwood', name: 'Driftwood', rarity: 'Common', value: 1, description: 'Weathered wood washed by the tides.' },
  { id: 'sea_urchin', name: 'Sea Urchin', rarity: 'Uncommon', value: 7, description: 'A spiny purple urchin.' },
  { id: 'abalone_shell', name: 'Abalone Shell', rarity: 'Rare', value: 40, description: 'An iridescent abalone shell.' },
  { id: 'coral_skeleton', name: 'Coral Skeleton', rarity: 'Common', value: 2, description: 'White calcium carbonate remains.' },
  { id: 'ambergris', name: 'Ambergris', rarity: 'Legendary', value: 200, description: 'Extremely rare substance from whales.' },
  { id: 'sea_sponge', name: 'Sea Sponge', rarity: 'Common', value: 3, description: 'A natural filtering sponge.' },
  { id: 'jellyfish_glow', name: 'Jellyfish Glow', rarity: 'Uncommon', value: 14, description: 'Bioluminescent extract from jellyfish.' },
  { id: 'sea_horse', name: 'Sea Horse', rarity: 'Rare', value: 35, description: 'A tiny preserved seahorse specimen.' },
  { id: 'octopus_ink', name: 'Octopus Ink', rarity: 'Uncommon', value: 11, description: 'Dark ink from an octopus.' },
  { id: 'sea_cucumber', name: 'Sea Cucumber', rarity: 'Common', value: 2, description: 'A soft-bodied sea cucumber.' },
  { id: 'triton_shell', name: 'Triton Shell', rarity: 'Epic', value: 80, description: 'A massive horned triton shell.' },
  { id: 'coral_bud', name: 'Coral Bud', rarity: 'Uncommon', value: 9, description: 'A young coral ready for planting.' },
  { id: 'pearl_oyster', name: 'Pearl Oyster', rarity: 'Uncommon', value: 13, description: 'A living oyster with pearl potential.' },
  { id: 'biolum_algae', name: 'Bioluminescent Algae', rarity: 'Rare', value: 30, description: 'Glowing blue-green algae culture.' },
  { id: 'deep_crystal', name: 'Deep Crystal', rarity: 'Epic', value: 75, description: 'A crystal formed under ocean pressure.' },
  { id: 'coral_polyp', name: 'Coral Polyp', rarity: 'Common', value: 1, description: 'A single living coral polyp.' },
  { id: 'whalebone', name: 'Whalebone', rarity: 'Rare', value: 55, description: 'A piece of fossilized whale bone.' },
  { id: 'kraken_beak', name: 'Kraken Beak', rarity: 'Legendary', value: 180, description: 'A beak shed by a giant squid.' },
];

// ─── Reef Structures (25) ────────────────────────────────────────────────────

const CRL_STRUCTURES: StructureDef[] = [
  { id: 'nursery', name: 'Coral Nursery', maxLevel: 5, baseCost: 50, description: 'A protected area to grow young coral fragments.' },
  { id: 'cleaning_station', name: 'Cleaning Station', maxLevel: 5, baseCost: 60, description: 'A station where fish clean parasites off others.' },
  { id: 'spawning_ground', name: 'Spawning Ground', maxLevel: 5, baseCost: 80, description: 'A designated area for fish spawning.' },
  { id: 'feeding_reef', name: 'Feeding Reef', maxLevel: 5, baseCost: 40, description: 'A reef area rich in plankton for feeding.' },
  { id: 'rest_cove', name: 'Rest Cove', maxLevel: 5, baseCost: 30, description: 'A calm sheltered area for resting marine life.' },
  { id: 'pearl_bed', name: 'Pearl Bed', maxLevel: 5, baseCost: 100, description: 'An oyster bed that produces pearls.' },
  { id: 'kelp_farm', name: 'Kelp Farm', maxLevel: 5, baseCost: 45, description: 'Cultivated kelp for harvesting resources.' },
  { id: 'sea_grass_plot', name: 'Sea Grass Plot', maxLevel: 5, baseCost: 35, description: 'A plot of cultivated sea grass.' },
  { id: 'coral_lab', name: 'Coral Research Lab', maxLevel: 5, baseCost: 150, description: 'A laboratory for coral science and genetics.' },
  { id: 'tidal_generator', name: 'Tidal Generator', maxLevel: 5, baseCost: 200, description: 'Harnesses tidal energy for reef power.' },
  { id: 'pollution_filter', name: 'Pollution Filter', maxLevel: 5, baseCost: 120, description: 'Filters harmful pollutants from the water.' },
  { id: 'observation_deck', name: 'Observation Deck', maxLevel: 3, baseCost: 90, description: 'An underwater viewpoint for reef monitoring.' },
  { id: 'breeding_pool', name: 'Breeding Pool', maxLevel: 5, baseCost: 110, description: 'A safe pool for breeding rare marine species.' },
  { id: 'mineral_extractor', name: 'Mineral Extractor', maxLevel: 5, baseCost: 130, description: 'Extracts valuable minerals from reef rock.' },
  { id: 'sonar_tower', name: 'Sonar Tower', maxLevel: 3, baseCost: 160, description: 'Pulses sonar to detect new reef areas.' },
  { id: 'medic_reef', name: 'Medic Reef', maxLevel: 5, baseCost: 70, description: 'Produces medicinal compounds from corals.' },
  { id: 'treasure_vault', name: 'Treasure Vault', maxLevel: 3, baseCost: 250, description: 'Stores rare treasures found while diving.' },
  { id: 'water_purifier', name: 'Water Purifier', maxLevel: 5, baseCost: 85, description: 'Cleans and oxygenates the reef water.' },
  { id: 'bubble_blower', name: 'Bubble Blower', maxLevel: 5, baseCost: 55, description: 'Generates streams of oxygen bubbles.' },
  { id: 'coral_library', name: 'Coral Library', maxLevel: 3, baseCost: 180, description: 'An archive of coral species knowledge.' },
  { id: 'creature_sanctuary', name: 'Creature Sanctuary', maxLevel: 5, baseCost: 140, description: 'A protected habitat for rare creatures.' },
  { id: 'depth_elevator', name: 'Depth Elevator', maxLevel: 3, baseCost: 220, description: 'Quickly transports between depth zones.' },
  { id: 'coral_barrier', name: 'Coral Barrier', maxLevel: 5, baseCost: 95, description: 'A defensive wall of hardened coral.' },
  { id: 'light_well', name: 'Light Well', maxLevel: 5, baseCost: 75, description: 'Channels sunlight to deeper zones.' },
  { id: 'ancient_altar', name: 'Ancient Altar', maxLevel: 3, baseCost: 300, description: 'A mysterious altar of unknown ocean origin.' },
];

// ─── Diving Abilities (22) ────────────────────────────────────────────────────

const CRL_ABILITIES: AbilityDef[] = [
  { id: 'sonar_pulse', name: 'Sonar Pulse', cooldown: 30, cost: 5, description: 'Sends a sonar wave revealing nearby resources.', unlockLevel: 1 },
  { id: 'coral_heal', name: 'Coral Healing', cooldown: 60, cost: 10, description: 'Restores health to damaged corals in range.', unlockLevel: 2 },
  { id: 'tidal_wave', name: 'Tidal Wave', cooldown: 120, cost: 20, description: 'Summons a wave that cleans pollution in a zone.', unlockLevel: 4 },
  { id: 'depth_dive', name: 'Depth Dive', cooldown: 45, cost: 8, description: 'Quickly dives to explore a zone.', unlockLevel: 3 },
  { id: 'pearl_vision', name: 'Pearl Vision', cooldown: 90, cost: 15, description: 'Reveals hidden pearls in the current zone.', unlockLevel: 5 },
  { id: 'coral_bloom', name: 'Coral Bloom', cooldown: 180, cost: 25, description: 'Accelerates coral growth in the area.', unlockLevel: 7 },
  { id: 'current_rider', name: 'Current Rider', cooldown: 60, cost: 12, description: 'Rides ocean currents to move between zones fast.', unlockLevel: 3 },
  { id: 'bio_luminate', name: 'Bioluminescence', cooldown: 30, cost: 5, description: 'Lights up dark areas for better exploration.', unlockLevel: 1 },
  { id: 'whisper_shell', name: 'Whisper Shell', cooldown: 120, cost: 18, description: 'Communicates with marine creatures nearby.', unlockLevel: 6 },
  { id: 'reef_shield', name: 'Reef Shield', cooldown: 300, cost: 30, description: 'Creates a protective barrier around corals.', unlockLevel: 9 },
  { id: 'oxygen_burst', name: 'Oxygen Burst', cooldown: 45, cost: 7, description: 'Releases oxygen to boost coral health.', unlockLevel: 2 },
  { id: 'cleanse_rain', name: 'Cleanse Rain', cooldown: 150, cost: 22, description: 'Magical rain that dissolves ocean pollutants.', unlockLevel: 8 },
  { id: 'creature_call', name: 'Creature Call', cooldown: 90, cost: 14, description: 'Attracts friendly creatures to the reef.', unlockLevel: 5 },
  { id: 'mineral_sense', name: 'Mineral Sense', cooldown: 60, cost: 10, description: 'Detects valuable minerals in the seabed.', unlockLevel: 4 },
  { id: 'tidal_clock', name: 'Tidal Clock', cooldown: 200, cost: 20, description: 'Slows time to extend coral growth.', unlockLevel: 10 },
  { id: 'coral_song', name: 'Coral Song', cooldown: 240, cost: 28, description: 'A harmonic song that heals and grows all corals.', unlockLevel: 11 },
  { id: 'depth_pressure', name: 'Depth Pressure', cooldown: 90, cost: 16, description: 'Crushes pollution with deep-water pressure.', unlockLevel: 7 },
  { id: 'aqua_dash', name: 'Aqua Dash', cooldown: 20, cost: 4, description: 'A quick burst of swimming speed.', unlockLevel: 1 },
  { id: 'sea_storm', name: 'Sea Storm', cooldown: 300, cost: 35, description: 'Summons a cleansing storm over the reef.', unlockLevel: 12 },
  { id: 'polyp_merge', name: 'Polyp Merge', cooldown: 180, cost: 24, description: 'Merges coral polyps for hybrid species.', unlockLevel: 8 },
  { id: 'ancient_awaken', name: 'Ancient Awaken', cooldown: 600, cost: 50, description: 'Awakens ancient reef guardians for protection.', unlockLevel: 13 },
  { id: 'coral_transmute', name: 'Coral Transmute', cooldown: 120, cost: 15, description: 'Transforms common corals into rarer ones.', unlockLevel: 9 },
  { id: 'reef_resonance', name: 'Reef Resonance', cooldown: 360, cost: 40, description: 'Harmonizes the entire reef for massive XP boost.', unlockLevel: 14 },
];

// ─── Marine Creatures ─────────────────────────────────────────────────────────

const CRL_CREATURES: CreatureDef[] = [
  { id: 'clownfish', name: 'Clownfish', favor: 0, maxFavor: 100, description: 'A small orange fish that lives in anemones.' },
  { id: 'blue_tang', name: 'Blue Tang', favor: 0, maxFavor: 100, description: 'A vivid blue reef fish with a yellow tail.' },
  { id: 'parrotfish', name: 'Parrotfish', favor: 0, maxFavor: 120, description: 'A colorful fish that eats coral and makes sand.' },
  { id: 'angelfish', name: 'Angelfish', favor: 0, maxFavor: 110, description: 'A graceful flat-bodied fish with tall fins.' },
  { id: 'moray_eel', name: 'Moray Eel', favor: 0, maxFavor: 130, description: 'A sinuous eel that hides in reef crevices.' },
  { id: 'sea_turtle', name: 'Sea Turtle', favor: 0, maxFavor: 200, description: 'A wise ancient turtle grazing on sea grass.' },
  { id: 'dolphin', name: 'Dolphin', favor: 0, maxFavor: 250, description: 'A playful and intelligent ocean companion.' },
  { id: 'manta_ray', name: 'Manta Ray', favor: 0, maxFavor: 300, description: 'A gentle giant gliding through the deep.' },
  { id: 'octopus', name: 'Octopus', favor: 0, maxFavor: 200, description: 'A clever eight-armed problem solver.' },
  { id: 'seahorse', name: 'Seahorse', favor: 0, maxFavor: 80, description: 'A tiny curled-tail creature clinging to coral.' },
  { id: 'jellyfish', name: 'Moon Jellyfish', favor: 0, maxFavor: 90, description: 'A translucent drifting jelly with tentacles.' },
  { id: 'nurse_shark', name: 'Nurse Shark', favor: 0, maxFavor: 180, description: 'A docile bottom-dwelling shark.' },
  { id: 'grouper', name: 'Grouper', favor: 0, maxFavor: 150, description: 'A large stout fish that lurks near reefs.' },
  { id: 'lobster', name: 'Lobster', favor: 0, maxFavor: 120, description: 'A red-clawed crustacean of the reef.' },
  { id: 'whale', name: 'Humpback Whale', favor: 0, maxFavor: 500, description: 'A majestic whale that visits seasonally.' },
];

// ─── Achievements (18) ────────────────────────────────────────────────────────

const CRL_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_plant', name: 'First Roots', description: 'Plant your first coral.', condition: 'totalCoralsPlanted >= 1', reward: 20 },
  { id: 'green_thumb', name: 'Ocean Gardener', description: 'Plant 10 corals.', condition: 'totalCoralsPlanted >= 10', reward: 50 },
  { id: 'reef_master', name: 'Reef Architect', description: 'Plant 50 corals.', condition: 'totalCoralsPlanted >= 50', reward: 200 },
  { id: 'coral_empire', name: 'Coral Emperor', description: 'Plant 200 corals.', condition: 'totalCoralsPlanted >= 200', reward: 500 },
  { id: 'explorer', name: 'Deep Diver', description: 'Explore all 8 reef zones.', condition: 'totalZonesExplored >= 8', reward: 100 },
  { id: 'cleaner', name: 'Ocean Cleaner', description: 'Clean 50 pollution units.', condition: 'totalPollutionCleaned >= 50', reward: 80 },
  { id: 'eco_hero', name: 'Eco Hero', description: 'Clean 200 pollution units.', condition: 'totalPollutionCleaned >= 200', reward: 300 },
  { id: 'creature_friend', name: 'Creature Friend', description: 'Befriend 5 marine creatures.', condition: 'totalCreaturesBefriended >= 5', reward: 100 },
  { id: 'beast_master', name: 'Beast Master', description: 'Befriend all 15 creatures.', condition: 'totalCreaturesBefriended >= 15', reward: 400 },
  { id: 'harvester', name: 'Resource Gatherer', description: 'Collect 100 resources.', condition: 'totalResourcesCollected >= 100', reward: 60 },
  { id: 'master_collector', name: 'Master Collector', description: 'Collect 500 resources.', condition: 'totalResourcesCollected >= 500', reward: 250 },
  { id: 'builder', name: 'Reef Builder', description: 'Build 10 structures.', condition: 'totalStructuresBuilt >= 10', reward: 120 },
  { id: 'architect', name: 'Master Architect', description: 'Build 25 structures.', condition: 'totalStructuresBuilt >= 25', reward: 350 },
  { id: 'ability_user', name: 'Ability Wielder', description: 'Use abilities 50 times.', condition: 'totalAbilitiesUsed >= 50', reward: 80 },
  { id: 'rare_find', name: 'Rare Discovery', description: 'Discover a Legendary coral.', condition: 'discoveries includes legendary', reward: 150 },
  { id: 'streak_7', name: 'Weekly Warden', description: 'Maintain a 7-day streak.', condition: 'dayStreak >= 7', reward: 100 },
  { id: 'streak_30', name: 'Monthly Guardian', description: 'Maintain a 30-day streak.', condition: 'dayStreak >= 30', reward: 500 },
  { id: 'max_level', name: 'Apex Guardian', description: 'Reach level 15.', condition: 'level >= 15', reward: 1000 },
];

// ─── Titles (8) ───────────────────────────────────────────────────────────────

const CRL_TITLES: TitleDef[] = [
  { id: 0, name: 'Sand Collector', requiredLevel: 1 },
  { id: 1, name: 'Tide Walker', requiredLevel: 3 },
  { id: 2, name: 'Coral Tender', requiredLevel: 5 },
  { id: 3, name: 'Reef Explorer', requiredLevel: 7 },
  { id: 4, name: 'Ocean Steward', requiredLevel: 9 },
  { id: 5, name: 'Deep Diver', requiredLevel: 11 },
  { id: 6, name: 'Sea Guardian', requiredLevel: 13 },
  { id: 7, name: 'Guardian of the Deep', requiredLevel: 15 },
];

// ─── Daily Quest Definitions ──────────────────────────────────────────────────

const CRL_DAILY_QUESTS: QuestDef[] = [
  { type: 'plant', target: 3, reward: 30, description: 'Plant 3 corals in any zone.' },
  { type: 'clean', target: 10, reward: 25, description: 'Clean 10 units of pollution.' },
  { type: 'harvest', target: 5, reward: 20, description: 'Harvest 5 mature corals.' },
  { type: 'explore', target: 2, reward: 35, description: 'Explore 2 different zones.' },
  { type: 'befriend', target: 2, reward: 40, description: 'Befriend 2 marine creatures.' },
  { type: 'collect', target: 8, reward: 15, description: 'Collect 8 marine resources.' },
  { type: 'build', target: 1, reward: 30, description: 'Build or upgrade 1 structure.' },
  { type: 'ability', target: 3, reward: 20, description: 'Use 3 diving abilities.' },
];

// ─── Crafting Recipes (15) ────────────────────────────────────────────────────

const CRL_RECIPES: RecipeDef[] = [
  { id: 'coral_tonic', name: 'Coral Tonic', ingredients: { kelp_frond: 3, plankton_sample: 2 }, result: 'coral_tonic', resultQty: 1, xp: 15 },
  { id: 'pearl_polish', name: 'Pearl Polish', ingredients: { seashell: 2, sea_glass: 1 }, result: 'pearl_polish', resultQty: 1, xp: 10 },
  { id: 'reef_fertilizer', name: 'Reef Fertilizer', ingredients: { seaweed: 5, plankton_sample: 3 }, result: 'reef_fertilizer', resultQty: 1, xp: 20 },
  { id: 'pollution_absorber', name: 'Pollution Absorber', ingredients: { sea_sponge: 2, kelp_frond: 4 }, result: 'pollution_absorber', resultQty: 1, xp: 25 },
  { id: 'creature_treat', name: 'Creature Treat', ingredients: { plankton_sample: 5, kelp_frond: 2 }, result: 'creature_treat', resultQty: 3, xp: 12 },
  { id: 'depth_charm', name: 'Depth Charm', ingredients: { deep_crystal: 1, coral_fragment: 2 }, result: 'depth_charm', resultQty: 1, xp: 40 },
  { id: 'sonar_beacon', name: 'Sonar Beacon', ingredients: { nautilus_shell: 1, jellyfish_glow: 2 }, result: 'sonar_beacon', resultQty: 1, xp: 35 },
  { id: 'healing_salve', name: 'Healing Salve', ingredients: { sea_sponge: 3, octopus_ink: 1 }, result: 'healing_salve', resultQty: 2, xp: 18 },
  { id: 'coral_seed', name: 'Coral Seed', ingredients: { coral_polyp: 5, reef_fertilizer: 1 }, result: 'coral_bud', resultQty: 2, xp: 30 },
  { id: 'biolum_lamp', name: 'Biolum Lamp', ingredients: { biolum_algae: 2, sea_glass: 3 }, result: 'biolum_lamp', resultQty: 1, xp: 28 },
  { id: 'tidal_compass', name: 'Tidal Compass', ingredients: { sand_dollar: 2, conch_shell: 1 }, result: 'tidal_compass', resultQty: 1, xp: 22 },
  { id: 'ancient_key', name: 'Ancient Key', ingredients: { ambergris: 1, kraken_beak: 1 }, result: 'ancient_key', resultQty: 1, xp: 100 },
  { id: 'oxygen_canister', name: 'Oxygen Canister', ingredients: { kelp_frond: 4, sea_cucumber: 2 }, result: 'oxygen_canister', resultQty: 1, xp: 16 },
  { id: 'coral_armor', name: 'Coral Armor', ingredients: { coral_skeleton: 5, sea_urchin: 3 }, result: 'coral_armor', resultQty: 1, xp: 45 },
  { id: 'treasure_map', name: 'Treasure Map', ingredients: { driftwood: 2, octopus_ink: 1, sand_dollar: 1 }, result: 'treasure_map', resultQty: 1, xp: 50 },
];

// ─── Default State ────────────────────────────────────────────────────────────

function createDefaultState(): CoralReefState {
  const initialZones: Record<string, ZoneInstance> = {};
  for (const zone of CRL_ZONES) {
    initialZones[zone.id] = {
      defId: zone.id,
      unlocked: zone.unlockLevel === 1,
      explored: false,
      pollution: zone.pollution,
      coralSlots: zone.unlockLevel === 1 ? 6 : 0,
      structures: [],
    };
  }

  return {
    level: 1,
    xp: 0,
    maxXp: 100,
    coins: 50,
    corals: {},
    zones: initialZones,
    discoveries: [],
    achievements: [],
    currentTitle: 0,
    inventory: { seashell: 3, kelp_frond: 2, plankton_sample: 5 },
    dailyQuest: { completed: false, progress: 0, target: 3, type: 'plant' },
    dayStreak: 0,
    totalCoralsPlanted: 0,
    totalCoralsHarvested: 0,
    totalZonesExplored: 0,
    totalPollutionCleaned: 0,
    totalCreaturesBefriended: 0,
    totalResourcesCollected: 0,
    totalStructuresBuilt: 0,
    totalAbilitiesUsed: 0,
    creatures: {},
    structures: {},
    abilities: {},
    recipes: ['coral_tonic', 'pearl_polish'],
    events: [],
    eventTimer: 0,
    lastDailyReset: Date.now(),
    selectedZone: 'shallow_lagoon',
    selectedCoral: '',
    settings: { sfxEnabled: true, particlesEnabled: true, ambientSounds: true },
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function xpForLevel(lvl: number): number {
  return Math.floor(80 * Math.pow(lvl, 1.4));
}

function rarityMultiplier(rarity: Rarity): number {
  switch (rarity) {
    case 'Common': return 1;
    case 'Uncommon': return 1.5;
    case 'Rare': return 2.5;
    case 'Epic': return 4;
    case 'Legendary': return 7;
    default: return 1;
  }
}

function getCoralDef(id: string): CoralDef | undefined {
  return CRL_CORALS.find(c => c.id === id);
}

function getZoneDef(id: string): ZoneDef | undefined {
  return CRL_ZONES.find(z => z.id === id);
}

function getResourceDef(id: string): ResourceDef | undefined {
  return CRL_RESOURCES.find(r => r.id === id);
}

function getStructureDef(id: string): StructureDef | undefined {
  return CRL_STRUCTURES.find(s => s.id === id);
}

function getAbilityDef(id: string): AbilityDef | undefined {
  return CRL_ABILITIES.find(a => a.id === id);
}

function getCreatureDef(id: string): CreatureDef | undefined {
  return CRL_CREATURES.find(c => c.id === id);
}

function getRecipeDef(id: string): RecipeDef | undefined {
  return CRL_RECIPES.find(r => r.id === id);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export default function useCoralReef(initialState?: CoralReefState) {
  const [state, setState] = useState<CoralReefState>(initialState ?? createDefaultState());
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Level & XP ────────────────────────────────────────────────────────────

  const getLevel = useCallback(() => {
    return stateRef.current.level;
  }, []);

  const getXp = useCallback(() => {
    return stateRef.current.xp;
  }, []);

  const getMaxXp = useCallback(() => {
    return stateRef.current.maxXp;
  }, []);

  const getXpProgress = useCallback(() => {
    const s = stateRef.current;
    if (s.maxXp <= 0) return 0;
    return Math.min(s.xp / s.maxXp, 1);
  }, []);

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      let newLevel = prev.level;
      let newXp = prev.xp + amount;
      let newMaxXp = prev.maxXp;
      let titleChanged = false;
      let newTitle = prev.currentTitle;

      while (newXp >= newMaxXp) {
        newXp -= newMaxXp;
        newLevel += 1;
        newMaxXp = xpForLevel(newLevel);
      }

      for (let i = CRL_TITLES.length - 1; i >= 0; i--) {
        if (newLevel >= CRL_TITLES[i].requiredLevel && i > newTitle) {
          newTitle = i;
          titleChanged = true;
          break;
        }
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        maxXp: newMaxXp,
        currentTitle: newTitle,
        coins: prev.coins + Math.floor(amount * 0.3),
      };
    });
  }, []);

  // ── Coins ─────────────────────────────────────────────────────────────────

  const getCoins = useCallback(() => {
    return stateRef.current.coins;
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({ ...prev, coins: prev.coins + amount }));
  }, []);

  const spendCoins = useCallback((amount: number): boolean => {
    let success = false;
    setState(prev => {
      if (prev.coins < amount) return prev;
      success = true;
      return { ...prev, coins: prev.coins - amount };
    });
    return success;
  }, []);

  // ── Titles ────────────────────────────────────────────────────────────────

  const getTitle = useCallback((): TitleDef => {
    return CRL_TITLES[stateRef.current.currentTitle] ?? CRL_TITLES[0];
  }, []);

  const getAllTitles = useCallback((): TitleDef[] => {
    return [...CRL_TITLES];
  }, []);

  const getCurrentTitleIndex = useCallback(() => {
    return stateRef.current.currentTitle;
  }, []);

  const selectTitle = useCallback((titleId: number) => {
    setState(prev => {
      const title = CRL_TITLES.find(t => t.id === titleId);
      if (!title || prev.level < title.requiredLevel) return prev;
      return { ...prev, currentTitle: titleId };
    });
  }, []);

  const isTitleUnlocked = useCallback((titleId: number) => {
    const title = CRL_TITLES.find(t => t.id === titleId);
    if (!title) return false;
    return stateRef.current.level >= title.requiredLevel;
  }, []);

  // ── Coral Definitions ─────────────────────────────────────────────────────

  const getCoralDefById = useCallback((id: string): CoralDef | undefined => {
    return getCoralDef(id);
  }, []);

  const getAllCoralDefs = useCallback((): CoralDef[] => {
    return [...CRL_CORALS];
  }, []);

  const getCoralsByRarity = useCallback((rarity: Rarity): CoralDef[] => {
    return CRL_CORALS.filter(c => c.rarity === rarity);
  }, []);

  const getCommonCorals = useCallback(() => getCoralsByRarity('Common'), [getCoralsByRarity]);
  const getUncommonCorals = useCallback(() => getCoralsByRarity('Uncommon'), [getCoralsByRarity]);
  const getRareCorals = useCallback(() => getCoralsByRarity('Rare'), [getCoralsByRarity]);
  const getEpicCorals = useCallback(() => getCoralsByRarity('Epic'), [getCoralsByRarity]);
  const getLegendaryCorals = useCallback(() => getCoralsByRarity('Legendary'), [getCoralsByRarity]);

  // ── Coral Instances ───────────────────────────────────────────────────────

  const getCoral = useCallback((id: string): CoralInstance | undefined => {
    return stateRef.current.corals[id];
  }, []);

  const getAllCorals = useCallback((): Record<string, CoralInstance> => {
    return { ...stateRef.current.corals };
  }, []);

  const getCoralsInZone = useCallback((zoneId: string): CoralInstance[] => {
    return Object.values(stateRef.current.corals).filter(c => c.zoneId === zoneId);
  }, []);

  const getCoralCount = useCallback((): number => {
    return Object.keys(stateRef.current.corals).length;
  }, []);

  const getCoralMaturity = useCallback((id: string): number => {
    const coral = stateRef.current.corals[id];
    const def = coral ? getCoralDef(coral.defId) : undefined;
    if (!coral || !def) return 0;
    const elapsed = (Date.now() - coral.plantedAt) / 1000;
    return Math.min(1, elapsed / def.growthTime);
  }, []);

  const isCoralMature = useCallback((id: string): boolean => {
    return getCoralMaturity(id) >= 1;
  }, [getCoralMaturity]);

  const isCoralHealthy = useCallback((id: string): boolean => {
    const coral = stateRef.current.corals[id];
    return coral ? coral.health > 30 : false;
  }, []);

  const getCoralHealth = useCallback((id: string): number => {
    const coral = stateRef.current.corals[id];
    return coral ? coral.health : 0;
  }, []);

  const getMatureCorals = useCallback((): CoralInstance[] => {
    const now = Date.now();
    return Object.values(stateRef.current.corals).filter(c => {
      const def = getCoralDef(c.defId);
      return def && (now - c.plantedAt) / 1000 >= def.growthTime;
    });
  }, []);

  // ── Coral Actions ─────────────────────────────────────────────────────────

  const plantCoral = useCallback((coralId: string, zoneId: string): boolean => {
    let planted = false;
    setState(prev => {
      const zone = prev.zones[zoneId];
      const def = getCoralDef(coralId);
      if (!zone || !zone.unlocked || !def) return prev;

      const coralsInZone = Object.values(prev.corals).filter(c => c.zoneId === zoneId).length;
      if (coralsInZone >= zone.coralSlots) return prev;

      if (prev.coins < def.xp) return prev;

      const instanceId = `${coralId}_${Date.now()}`;
      const newCoral: CoralInstance = {
        defId: coralId,
        plantedAt: Date.now(),
        wateredAt: Date.now(),
        health: 100,
        maturity: 0,
        zoneId,
      };

      const questProgress = prev.dailyQuest.type === 'plant'
        ? prev.dailyQuest.progress + 1
        : prev.dailyQuest.progress;

      planted = true;
      return {
        ...prev,
        coins: prev.coins - def.xp,
        corals: { ...prev.corals, [instanceId]: newCoral },
        totalCoralsPlanted: prev.totalCoralsPlanted + 1,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (planted) {
      addXp(5);
    }
    return planted;
  }, [addXp]);

  const waterCoral = useCallback((id: string): boolean => {
    let watered = false;
    setState(prev => {
      const coral = prev.corals[id];
      if (!coral) return prev;

      watered = true;
      return {
        ...prev,
        corals: {
          ...prev.corals,
          [id]: { ...coral, wateredAt: Date.now(), health: Math.min(100, coral.health + 10) },
        },
      };
    });
    if (watered) addXp(2);
    return watered;
  }, [addXp]);

  const harvestCoral = useCallback((id: string): boolean => {
    let harvested = false;
    setState(prev => {
      const coral = prev.corals[id];
      const def = coral ? getCoralDef(coral.defId) : undefined;
      if (!coral || !def) return prev;

      const elapsed = (Date.now() - coral.plantedAt) / 1000;
      if (elapsed < def.growthTime) return prev;

      const newInventory = { ...prev.inventory };
      const fragCount = Math.ceil(rarityMultiplier(def.rarity));
      newInventory['coral_fragment'] = (newInventory['coral_fragment'] ?? 0) + fragCount;

      const budChance = def.rarity === 'Rare' || def.rarity === 'Epic' || def.rarity === 'Legendary';
      if (budChance) {
        newInventory['coral_bud'] = (newInventory['coral_bud'] ?? 0) + 1;
      }

      const coinReward = Math.floor(def.xp * rarityMultiplier(def.rarity));

      const questProgress = prev.dailyQuest.type === 'harvest'
        ? prev.dailyQuest.progress + 1
        : prev.dailyQuest.progress;

      harvested = true;
      const { [id]: _, ...remainingCorals } = prev.corals;
      return {
        ...prev,
        corals: remainingCorals,
        inventory: newInventory,
        coins: prev.coins + coinReward,
        totalCoralsHarvested: prev.totalCoralsHarvested + 1,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (harvested) addXp(15);
    return harvested;
  }, [addXp]);

  const removeCoral = useCallback((id: string): boolean => {
    let removed = false;
    setState(prev => {
      if (!prev.corals[id]) return prev;
      removed = true;
      const { [id]: _, ...rest } = prev.corals;
      return { ...prev, corals: rest };
    });
    return removed;
  }, []);

  const healCoral = useCallback((id: string, amount: number): boolean => {
    let healed = false;
    setState(prev => {
      const coral = prev.corals[id];
      if (!coral || coral.health >= 100) return prev;
      healed = true;
      return {
        ...prev,
        corals: {
          ...prev.corals,
          [id]: { ...coral, health: Math.min(100, coral.health + amount) },
        },
      };
    });
    return healed;
  }, []);

  const damageCoral = useCallback((id: string, amount: number) => {
    setState(prev => {
      const coral = prev.corals[id];
      if (!coral) return prev;
      return {
        ...prev,
        corals: {
          ...prev.corals,
          [id]: { ...coral, health: Math.max(0, coral.health - amount) },
        },
      };
    });
  }, []);

  const discoverCoral = useCallback((coralId: string) => {
    setState(prev => {
      if (prev.discoveries.includes(coralId)) return prev;
      return { ...prev, discoveries: [...prev.discoveries, coralId] };
    });
    addXp(10);
  }, [addXp]);

  const getDiscoveries = useCallback((): string[] => {
    return [...stateRef.current.discoveries];
  }, []);

  const hasDiscovered = useCallback((coralId: string): boolean => {
    return stateRef.current.discoveries.includes(coralId);
  }, []);

  const getDiscoveryCount = useCallback((): number => {
    return stateRef.current.discoveries.length;
  }, []);

  // ── Zone Definitions ──────────────────────────────────────────────────────

  const getZoneDefById = useCallback((id: string): ZoneDef | undefined => {
    return getZoneDef(id);
  }, []);

  const getAllZoneDefs = useCallback((): ZoneDef[] => {
    return [...CRL_ZONES];
  }, []);

  // ── Zone Instances ────────────────────────────────────────────────────────

  const getZone = useCallback((id: string): ZoneInstance | undefined => {
    return stateRef.current.zones[id];
  }, []);

  const getAllZones = useCallback((): Record<string, ZoneInstance> => {
    return { ...stateRef.current.zones };
  }, []);

  const isZoneUnlocked = useCallback((zoneId: string): boolean => {
    const zone = stateRef.current.zones[zoneId];
    return zone ? zone.unlocked : false;
  }, []);

  const isZoneExplored = useCallback((zoneId: string): boolean => {
    const zone = stateRef.current.zones[zoneId];
    return zone ? zone.explored : false;
  }, []);

  const getZonePollution = useCallback((zoneId: string): number => {
    const zone = stateRef.current.zones[zoneId];
    return zone ? zone.pollution : 0;
  }, []);

  const getZoneCoralSlots = useCallback((zoneId: string): number => {
    const zone = stateRef.current.zones[zoneId];
    return zone ? zone.coralSlots : 0;
  }, []);

  const getUnlockedZones = useCallback((): ZoneInstance[] => {
    return Object.values(stateRef.current.zones).filter(z => z.unlocked);
  }, []);

  const getLockedZones = useCallback((): ZoneDef[] => {
    return CRL_ZONES.filter(z => !stateRef.current.zones[z.id]?.unlocked);
  }, []);

  const getExploredZoneCount = useCallback((): number => {
    return Object.values(stateRef.current.zones).filter(z => z.explored).length;
  }, []);

  const unlockZone = useCallback((zoneId: string): boolean => {
    let unlocked = false;
    setState(prev => {
      const def = getZoneDef(zoneId);
      const zone = prev.zones[zoneId];
      if (!def || !zone || zone.unlocked || prev.level < def.unlockLevel) return prev;

      unlocked = true;
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, unlocked: true, coralSlots: 6 },
        },
      };
    });
    if (unlocked) addXp(20);
    return unlocked;
  }, [addXp]);

  const exploreZone = useCallback((zoneId: string): boolean => {
    let explored = false;
    setState(prev => {
      const zone = prev.zones[zoneId];
      if (!zone || !zone.unlocked || zone.explored) return prev;

      const now = Date.now();
      const discoveries: string[] = [];
      const newInventory = { ...prev.inventory };

      const rarityRoll = Math.random();
      let targetRarity: Rarity = 'Common';
      if (rarityRoll > 0.98) targetRarity = 'Legendary';
      else if (rarityRoll > 0.92) targetRarity = 'Epic';
      else if (rarityRoll > 0.78) targetRarity = 'Rare';
      else if (rarityRoll > 0.55) targetRarity = 'Uncommon';

      const matchingCorals = CRL_CORALS.filter(c => c.rarity === targetRarity);
      if (matchingCorals.length > 0) {
        const found = matchingCorals[Math.floor(Math.random() * matchingCorals.length)];
        if (!prev.discoveries.includes(found.id)) {
          discoveries.push(found.id);
        }
      }

      const resourceRoll = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < resourceRoll; i++) {
        const rIdx = Math.floor(Math.random() * CRL_RESOURCES.length);
        const res = CRL_RESOURCES[rIdx];
        newInventory[res.id] = (newInventory[res.id] ?? 0) + 1;
      }

      const questProgress = prev.dailyQuest.type === 'explore'
        ? prev.dailyQuest.progress + 1
        : prev.dailyQuest.progress;

      explored = true;
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, explored: true },
        },
        discoveries: [...prev.discoveries, ...discoveries],
        inventory: newInventory,
        totalZonesExplored: prev.totalZonesExplored + 1,
        totalResourcesCollected: prev.totalResourcesCollected + resourceRoll,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (explored) addXp(30);
    return explored;
  }, [addXp]);

  const cleanPollution = useCallback((zoneId: string, amount?: number): number => {
    let cleaned = 0;
    setState(prev => {
      const zone = prev.zones[zoneId];
      if (!zone || !zone.unlocked || zone.pollution <= 0) { cleaned = 0; return prev; }

      const cleanAmount = amount ?? 5;
      const actualClean = Math.min(cleanAmount, zone.pollution);
      cleaned = actualClean;

      const questProgress = prev.dailyQuest.type === 'clean'
        ? prev.dailyQuest.progress + actualClean
        : prev.dailyQuest.progress;

      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, pollution: zone.pollution - actualClean },
        },
        totalPollutionCleaned: prev.totalPollutionCleaned + actualClean,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (cleaned > 0) addXp(Math.floor(cleaned * 2));
    return cleaned;
  }, [addXp]);

  const addPollution = useCallback((zoneId: string, amount: number) => {
    setState(prev => {
      const zone = prev.zones[zoneId];
      if (!zone) return prev;
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, pollution: Math.min(100, zone.pollution + amount) },
        },
      };
    });
  }, []);

  const expandZoneSlots = useCallback((zoneId: string, slots: number): boolean => {
    let expanded = false;
    setState(prev => {
      const zone = prev.zones[zoneId];
      if (!zone || !zone.unlocked) return prev;
      const cost = slots * 20;
      if (prev.coins < cost) return prev;
      expanded = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, coralSlots: zone.coralSlots + slots },
        },
      };
    });
    if (expanded) addXp(10);
    return expanded;
  }, [addXp]);

  const selectZone = useCallback((zoneId: string) => {
    setState(prev => ({ ...prev, selectedZone: zoneId }));
  }, []);

  const getSelectedZone = useCallback((): string => {
    return stateRef.current.selectedZone;
  }, []);

  // ── Resources ─────────────────────────────────────────────────────────────

  const getResourceDefById = useCallback((id: string): ResourceDef | undefined => {
    return getResourceDef(id);
  }, []);

  const getAllResourceDefs = useCallback((): ResourceDef[] => {
    return [...CRL_RESOURCES];
  }, []);

  const getResourceCount = useCallback((id: string): number => {
    return stateRef.current.inventory[id] ?? 0;
  }, []);

  const getInventory = useCallback((): Record<string, number> => {
    return { ...stateRef.current.inventory };
  }, []);

  const getInventorySize = useCallback((): number => {
    return Object.values(stateRef.current.inventory).reduce((sum, qty) => sum + qty, 0);
  }, []);

  const getInventoryItems = useCallback((): { id: string; qty: number; def?: ResourceDef }[] => {
    const inv = stateRef.current.inventory;
    return Object.entries(inv)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({ id, qty, def: getResourceDef(id) }));
  }, []);

  const collectResource = useCallback((resourceId: string, amount?: number): boolean => {
    let collected = false;
    setState(prev => {
      const qty = amount ?? 1;
      collected = true;
      const questProgress = prev.dailyQuest.type === 'collect'
        ? prev.dailyQuest.progress + qty
        : prev.dailyQuest.progress;

      return {
        ...prev,
        inventory: { ...prev.inventory, [resourceId]: (prev.inventory[resourceId] ?? 0) + qty },
        totalResourcesCollected: prev.totalResourcesCollected + qty,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (collected) addXp(3);
    return collected;
  }, [addXp]);

  const removeResource = useCallback((resourceId: string, amount: number): boolean => {
    let removed = false;
    setState(prev => {
      const current = prev.inventory[resourceId] ?? 0;
      if (current < amount) return prev;
      removed = true;
      const newInv = { ...prev.inventory };
      if (current === amount) {
        delete newInv[resourceId];
      } else {
        newInv[resourceId] = current - amount;
      }
      return { ...prev, inventory: newInv };
    });
    return removed;
  }, []);

  const hasResources = useCallback((requirements: Record<string, number>): boolean => {
    const inv = stateRef.current.inventory;
    for (const [id, qty] of Object.entries(requirements)) {
      if ((inv[id] ?? 0) < qty) return false;
    }
    return true;
  }, []);

  const spendResources = useCallback((requirements: Record<string, number>): boolean => {
    let spent = false;
    setState(prev => {
      const newInv = { ...prev.inventory };
      for (const [id, qty] of Object.entries(requirements)) {
        const current = newInv[id] ?? 0;
        if (current < qty) return prev;
        newInv[id] = current - qty;
        if (newInv[id] <= 0) delete newInv[id];
      }
      spent = true;
      return { ...prev, inventory: newInv };
    });
    return spent;
  }, []);

  // ── Creatures ─────────────────────────────────────────────────────────────

  const getCreatureDefById = useCallback((id: string): CreatureDef | undefined => {
    return getCreatureDef(id);
  }, []);

  const getAllCreatureDefs = useCallback((): CreatureDef[] => {
    return [...CRL_CREATURES];
  }, []);

  const getCreature = useCallback((id: string): { favor: number; lastFed: number } | undefined => {
    return stateRef.current.creatures[id];
  }, []);

  const getCreatureFavor = useCallback((id: string): number => {
    return stateRef.current.creatures[id]?.favor ?? 0;
  }, []);

  const getCreatureFavorPercent = useCallback((id: string): number => {
    const creature = stateRef.current.creatures[id];
    const def = getCreatureDef(id);
    if (!creature || !def) return 0;
    return Math.min(1, creature.favor / def.maxFavor);
  }, []);

  const getAllCreatures = useCallback((): Record<string, { favor: number; lastFed: number }> => {
    return { ...stateRef.current.creatures };
  }, []);

  const getBefriendedCreatures = useCallback((): string[] => {
    return Object.entries(stateRef.current.creatures)
      .filter(([, data]) => data.favor >= 50)
      .map(([id]) => id);
  }, []);

  const getBefriendedCreatureCount = useCallback((): number => {
    return getBefriendedCreatures().length;
  }, []);

  const befriendCreature = useCallback((creatureId: string): boolean => {
    let befriended = false;
    setState(prev => {
      const existing = prev.creatures[creatureId];
      if (existing && existing.favor >= 50) return prev;

      befriended = true;
      const newFavor = (existing?.favor ?? 0) + 25;
      const isNowBefriended = newFavor >= 50 && (!existing || existing.favor < 50);

      const questProgress = prev.dailyQuest.type === 'befriend'
        ? prev.dailyQuest.progress + (isNowBefriended ? 1 : 0)
        : prev.dailyQuest.progress;

      return {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { favor: newFavor, lastFed: Date.now() },
        },
        totalCreaturesBefriended: isNowBefriended
          ? prev.totalCreaturesBefriended + 1
          : prev.totalCreaturesBefriended,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (befriended) addXp(10);
    return befriended;
  }, [addXp]);

  const feedCreature = useCallback((creatureId: string): boolean => {
    let fed = false;
    setState(prev => {
      const def = getCreatureDef(creatureId);
      if (!def) return prev;

      const treatCount = prev.inventory['creature_treat'] ?? 0;
      if (treatCount < 1) return prev;

      const newFavor = Math.min(def.maxFavor, (prev.creatures[creatureId]?.favor ?? 0) + 15);
      fed = true;

      const newInv = { ...prev.inventory };
      newInv['creature_treat'] = treatCount - 1;
      if (newInv['creature_treat'] <= 0) delete newInv['creature_treat'];

      return {
        ...prev,
        creatures: {
          ...prev.creatures,
          [creatureId]: { favor: newFavor, lastFed: Date.now() },
        },
        inventory: newInv,
      };
    });
    if (fed) addXp(5);
    return fed;
  }, [addXp]);

  const maxFavorCreature = useCallback((creatureId: string): boolean => {
    const data = stateRef.current.creatures[creatureId];
    const def = getCreatureDef(creatureId);
    if (!data || !def) return false;
    return data.favor >= def.maxFavor;
  }, []);

  const getCreatureBonus = useCallback((): number => {
    const befriended = getBefriendedCreatures();
    return befriended.length * 5;
  }, [getBefriendedCreatures]);

  // ── Structures ────────────────────────────────────────────────────────────

  const getStructureDefById = useCallback((id: string): StructureDef | undefined => {
    return getStructureDef(id);
  }, []);

  const getAllStructureDefs = useCallback((): StructureDef[] => {
    return [...CRL_STRUCTURES];
  }, []);

  const getStructure = useCallback((id: string): StructureInstance | undefined => {
    return stateRef.current.structures[id];
  }, []);

  const getAllStructures = useCallback((): Record<string, StructureInstance> => {
    return { ...stateRef.current.structures };
  }, []);

  const getStructureLevel = useCallback((id: string): number => {
    return stateRef.current.structures[id]?.level ?? 0;
  }, []);

  const getStructuresInZone = useCallback((zoneId: string): StructureInstance[] => {
    return Object.values(stateRef.current.structures).filter(s => s.zoneId === zoneId);
  }, []);

  const getStructureCount = useCallback((): number => {
    return Object.keys(stateRef.current.structures).length;
  }, []);

  const buildStructure = useCallback((structureId: string, zoneId: string): boolean => {
    let built = false;
    setState(prev => {
      const def = getStructureDef(structureId);
      if (!def) return prev;

      if (prev.structures[structureId]) return prev;

      if (prev.coins < def.baseCost) return prev;

      const zone = prev.zones[zoneId];
      if (!zone || !zone.unlocked) return prev;

      built = true;
      const newInstance: StructureInstance = {
        defId: structureId,
        level: 1,
        zoneId,
        builtAt: Date.now(),
      };

      const questProgress = prev.dailyQuest.type === 'build'
        ? prev.dailyQuest.progress + 1
        : prev.dailyQuest.progress;

      return {
        ...prev,
        coins: prev.coins - def.baseCost,
        structures: { ...prev.structures, [structureId]: newInstance },
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, structures: [...zone.structures, structureId] },
        },
        totalStructuresBuilt: prev.totalStructuresBuilt + 1,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };
    });
    if (built) addXp(25);
    return built;
  }, [addXp]);

  const upgradeStructure = useCallback((structureId: string): boolean => {
    let upgraded = false;
    setState(prev => {
      const def = getStructureDef(structureId);
      const instance = prev.structures[structureId];
      if (!def || !instance) return prev;
      if (instance.level >= def.maxLevel) return prev;

      const cost = Math.floor(def.baseCost * Math.pow(1.8, instance.level - 1));
      if (prev.coins < cost) return prev;

      upgraded = true;
      return {
        ...prev,
        coins: prev.coins - cost,
        structures: {
          ...prev.structures,
          [structureId]: { ...instance, level: instance.level + 1 },
        },
      };
    });
    if (upgraded) addXp(15);
    return upgraded;
  }, [addXp]);

  const getUpgradeCost = useCallback((structureId: string): number => {
    const def = getStructureDef(structureId);
    const instance = stateRef.current.structures[structureId];
    if (!def || !instance) return 0;
    if (instance.level >= def.maxLevel) return 0;
    return Math.floor(def.baseCost * Math.pow(1.8, instance.level - 1));
  }, []);

  const demolishStructure = useCallback((structureId: string): boolean => {
    let demolished = false;
    setState(prev => {
      if (!prev.structures[structureId]) return prev;
      demolished = true;
      const instance = prev.structures[structureId];
      const zone = prev.zones[instance.zoneId];
      const refund = Math.floor((getStructureDef(structureId)?.baseCost ?? 0) * 0.3);

      const { [structureId]: _, ...remainingStructures } = prev.structures;

      return {
        ...prev,
        structures: remainingStructures,
        coins: prev.coins + refund,
        zones: zone
          ? {
              ...prev.zones,
              [instance.zoneId]: {
                ...zone,
                structures: zone.structures.filter(s => s !== structureId),
              },
            }
          : prev.zones,
      };
    });
    return demolished;
  }, []);

  // ── Abilities ─────────────────────────────────────────────────────────────

  const getAbilityDefById = useCallback((id: string): AbilityDef | undefined => {
    return getAbilityDef(id);
  }, []);

  const getAllAbilityDefs = useCallback((): AbilityDef[] => {
    return [...CRL_ABILITIES];
  }, []);

  const getUnlockedAbilityDefs = useCallback((): AbilityDef[] => {
    return CRL_ABILITIES.filter(a => stateRef.current.level >= a.unlockLevel);
  }, []);

  const getLockedAbilityDefs = useCallback((): AbilityDef[] => {
    return CRL_ABILITIES.filter(a => stateRef.current.level < a.unlockLevel);
  }, []);

  const isAbilityUnlocked = useCallback((abilityId: string): boolean => {
    const def = getAbilityDef(abilityId);
    if (!def) return false;
    return stateRef.current.level >= def.unlockLevel;
  }, []);

  const getAbilityCooldownRemaining = useCallback((abilityId: string): number => {
    const def = getAbilityDef(abilityId);
    const data = stateRef.current.abilities[abilityId];
    if (!def || !data) return 0;
    const elapsed = (Date.now() - data.lastUsed) / 1000;
    return Math.max(0, def.cooldown - elapsed);
  }, []);

  const isAbilityReady = useCallback((abilityId: string): boolean => {
    return getAbilityCooldownRemaining(abilityId) <= 0;
  }, [getAbilityCooldownRemaining]);

  const castAbility = useCallback((abilityId: string): boolean => {
    let cast = false;
    setState(prev => {
      const def = getAbilityDef(abilityId);
      if (!def) return prev;
      if (prev.level < def.unlockLevel) return prev;
      if (prev.coins < def.cost) return prev;

      const data = prev.abilities[abilityId];
      if (data) {
        const elapsed = (Date.now() - data.lastUsed) / 1000;
        if (elapsed < def.cooldown) return prev;
      }

      cast = true;

      const questProgress = prev.dailyQuest.type === 'ability'
        ? prev.dailyQuest.progress + 1
        : prev.dailyQuest.progress;

      const newState = {
        ...prev,
        coins: prev.coins - def.cost,
        abilities: {
          ...prev.abilities,
          [abilityId]: { lastUsed: Date.now(), uses: (data?.uses ?? 0) + 1 },
        },
        totalAbilitiesUsed: prev.totalAbilitiesUsed + 1,
        dailyQuest: { ...prev.dailyQuest, progress: questProgress },
      };

      // Apply ability effects
      switch (abilityId) {
        case 'coral_heal': {
          const updatedCorals = { ...newState.corals };
          for (const key of Object.keys(updatedCorals)) {
            updatedCorals[key] = {
              ...updatedCorals[key],
              health: Math.min(100, updatedCorals[key].health + 20),
            };
          }
          newState.corals = updatedCorals;
          break;
        }
        case 'tidal_wave': {
          const updatedZones = { ...newState.zones };
          const selZone = updatedZones[prev.selectedZone];
          if (selZone) {
            updatedZones[prev.selectedZone] = {
              ...selZone,
              pollution: Math.max(0, selZone.pollution - 15),
            };
            newState.zones = updatedZones;
          }
          break;
        }
        case 'coral_bloom': {
          const updatedCorals = { ...newState.corals };
          for (const key of Object.keys(updatedCorals)) {
            updatedCorals[key] = {
              ...updatedCorals[key],
              plantedAt: updatedCorals[key].plantedAt - 60000,
            };
          }
          newState.corals = updatedCorals;
          break;
        }
        case 'reef_shield': {
          const updatedCorals = { ...newState.corals };
          for (const key of Object.keys(updatedCorals)) {
            updatedCorals[key] = {
              ...updatedCorals[key],
              health: 100,
            };
          }
          newState.corals = updatedCorals;
          break;
        }
        case 'cleanse_rain': {
          const updatedZones = { ...newState.zones };
          for (const key of Object.keys(updatedZones)) {
            updatedZones[key] = {
              ...updatedZones[key],
              pollution: Math.max(0, updatedZones[key].pollution - 10),
            };
          }
          newState.zones = updatedZones;
          break;
        }
        case 'oxygen_burst': {
          const updatedCorals = { ...newState.corals };
          for (const key of Object.keys(updatedCorals)) {
            updatedCorals[key] = {
              ...updatedCorals[key],
              health: Math.min(100, updatedCorals[key].health + 15),
            };
          }
          newState.corals = updatedCorals;
          break;
        }
        case 'pearl_vision': {
          const newInv = { ...newState.inventory };
          const pearlChance = Math.random();
          if (pearlChance > 0.7) {
            newInv['pearl'] = (newInv['pearl'] ?? 0) + 1;
          } else if (pearlChance > 0.9) {
            newInv['black_pearl'] = (newInv['black_pearl'] ?? 0) + 1;
          }
          newState.inventory = newInv;
          break;
        }
        case 'mineral_sense': {
          const newInv = { ...newState.inventory };
          const mineralRoll = Math.floor(Math.random() * 3) + 1;
          newInv['sea_glass'] = (newInv['sea_glass'] ?? 0) + mineralRoll;
          newState.inventory = newInv;
          break;
        }
        case 'coral_transmute': {
          const commonCorals = Object.entries(newState.corals).filter(([key]) => {
            const def = getCoralDef(newState.corals[key].defId);
            return def && def.rarity === 'Common';
          });
          if (commonCorals.length >= 3) {
            const updatedCorals = { ...newState.corals };
            for (let i = 0; i < 3 && i < commonCorals.length; i++) {
              delete updatedCorals[commonCorals[i][0]];
            }
            const rareCorals = CRL_CORALS.filter(c => c.rarity === 'Rare');
            if (rareCorals.length > 0) {
              const chosen = rareCorals[Math.floor(Math.random() * rareCorals.length)];
              const instanceId = `${chosen.id}_${Date.now()}`;
              updatedCorals[instanceId] = {
                defId: chosen.id,
                plantedAt: Date.now(),
                wateredAt: Date.now(),
                health: 100,
                maturity: 0,
                zoneId: newState.selectedZone,
              };
            }
            newState.corals = updatedCorals;
          }
          break;
        }
        case 'reef_resonance': {
          return { ...newState, xp: newState.xp + 50 };
        }
        default:
          break;
      }

      return newState;
    });
    if (cast) addXp(8);
    return cast;
  }, [addXp]);

  const getAbilityUseCount = useCallback((abilityId: string): number => {
    return stateRef.current.abilities[abilityId]?.uses ?? 0;
  }, []);

  const getTotalAbilityUses = useCallback((): number => {
    return stateRef.current.totalAbilitiesUsed;
  }, []);

  // ── Crafting ──────────────────────────────────────────────────────────────

  const getRecipeDefById = useCallback((id: string): RecipeDef | undefined => {
    return getRecipeDef(id);
  }, []);

  const getAllRecipeDefs = useCallback((): RecipeDef[] => {
    return [...CRL_RECIPES];
  }, []);

  const getUnlockedRecipeDefs = useCallback((): RecipeDef[] => {
    return CRL_RECIPES.filter(r => stateRef.current.recipes.includes(r.id));
  }, []);

  const getLockedRecipeDefs = useCallback((): RecipeDef[] => {
    return CRL_RECIPES.filter(r => !stateRef.current.recipes.includes(r.id));
  }, []);

  const isRecipeUnlocked = useCallback((recipeId: string): boolean => {
    return stateRef.current.recipes.includes(recipeId);
  }, []);

  const unlockRecipe = useCallback((recipeId: string): boolean => {
    let unlocked = false;
    setState(prev => {
      if (prev.recipes.includes(recipeId)) return prev;
      unlocked = true;
      return { ...prev, recipes: [...prev.recipes, recipeId] };
    });
    return unlocked;
  }, []);

  const canCraft = useCallback((recipeId: string): boolean => {
    const def = getRecipeDef(recipeId);
    if (!def || !stateRef.current.recipes.includes(recipeId)) return false;
    return hasResources(def.ingredients);
  }, [hasResources]);

  const craftItem = useCallback((recipeId: string): boolean => {
    let crafted = false;
    setState(prev => {
      const def = getRecipeDef(recipeId);
      if (!def || !prev.recipes.includes(recipeId)) return prev;

      const newInv = { ...prev.inventory };
      for (const [id, qty] of Object.entries(def.ingredients)) {
        const current = newInv[id] ?? 0;
        if (current < qty) return prev;
        newInv[id] = current - qty;
        if (newInv[id] <= 0) delete newInv[id];
      }

      crafted = true;
      newInv[def.result] = (newInv[def.result] ?? 0) + def.resultQty;

      return { ...prev, inventory: newInv };
    });
    if (crafted) {
      const def = getRecipeDef(recipeId);
      if (def) addXp(def.xp);
    }
    return crafted;
  }, [addXp]);

  const getCraftableRecipes = useCallback((): RecipeDef[] => {
    return CRL_RECIPES.filter(r => {
      if (!stateRef.current.recipes.includes(r.id)) return false;
      const inv = stateRef.current.inventory;
      for (const [id, qty] of Object.entries(r.ingredients)) {
        if ((inv[id] ?? 0) < qty) return false;
      }
      return true;
    });
  }, []);

  // ── Achievements ──────────────────────────────────────────────────────────

  const getAllAchievementDefs = useCallback((): AchievementDef[] => {
    return [...CRL_ACHIEVEMENTS];
  }, []);

  const getAchievements = useCallback((): string[] => {
    return [...stateRef.current.achievements];
  }, []);

  const hasAchievement = useCallback((id: string): boolean => {
    return stateRef.current.achievements.includes(id);
  }, []);

  const getAchievementCount = useCallback((): number => {
    return stateRef.current.achievements.length;
  }, []);

  const checkAchievements = useCallback((): string[] => {
    const newAchievements: string[] = [];
    setState(prev => {
      const newlyUnlocked: string[] = [];

      for (const ach of CRL_ACHIEVEMENTS) {
        if (prev.achievements.includes(ach.id)) continue;

        let unlocked = false;
        switch (ach.id) {
          case 'first_plant':
            unlocked = prev.totalCoralsPlanted >= 1;
            break;
          case 'green_thumb':
            unlocked = prev.totalCoralsPlanted >= 10;
            break;
          case 'reef_master':
            unlocked = prev.totalCoralsPlanted >= 50;
            break;
          case 'coral_empire':
            unlocked = prev.totalCoralsPlanted >= 200;
            break;
          case 'explorer':
            unlocked = prev.totalZonesExplored >= 8;
            break;
          case 'cleaner':
            unlocked = prev.totalPollutionCleaned >= 50;
            break;
          case 'eco_hero':
            unlocked = prev.totalPollutionCleaned >= 200;
            break;
          case 'creature_friend':
            unlocked = prev.totalCreaturesBefriended >= 5;
            break;
          case 'beast_master':
            unlocked = prev.totalCreaturesBefriended >= 15;
            break;
          case 'harvester':
            unlocked = prev.totalResourcesCollected >= 100;
            break;
          case 'master_collector':
            unlocked = prev.totalResourcesCollected >= 500;
            break;
          case 'builder':
            unlocked = prev.totalStructuresBuilt >= 10;
            break;
          case 'architect':
            unlocked = prev.totalStructuresBuilt >= 25;
            break;
          case 'ability_user':
            unlocked = prev.totalAbilitiesUsed >= 50;
            break;
          case 'rare_find':
            unlocked = prev.discoveries.some(d => {
              const coralDef = getCoralDef(d);
              return coralDef && coralDef.rarity === 'Legendary';
            });
            break;
          case 'streak_7':
            unlocked = prev.dayStreak >= 7;
            break;
          case 'streak_30':
            unlocked = prev.dayStreak >= 30;
            break;
          case 'max_level':
            unlocked = prev.level >= 15;
            break;
        }

        if (unlocked) {
          newlyUnlocked.push(ach.id);
          newAchievements.push(ach.id);
        }
      }

      if (newlyUnlocked.length === 0) return prev;

      return {
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked],
        coins: prev.coins + newlyUnlocked.reduce((sum, id) => {
          const ach = CRL_ACHIEVEMENTS.find(a => a.id === id);
          return sum + (ach?.reward ?? 0);
        }, 0),
      };
    });
    for (const _ of newAchievements) {
      addXp(20);
    }
    return newAchievements;
  }, [addXp]);

  // ── Daily Quest ───────────────────────────────────────────────────────────

  const getDailyQuest = useCallback(() => {
    return { ...stateRef.current.dailyQuest };
  }, []);

  const getDailyQuestProgress = useCallback((): number => {
    return stateRef.current.dailyQuest.progress;
  }, []);

  const getDailyQuestTarget = useCallback((): number => {
    return stateRef.current.dailyQuest.target;
  }, []);

  const getDailyQuestPercent = useCallback((): number => {
    const q = stateRef.current.dailyQuest;
    if (q.target <= 0) return 0;
    return Math.min(1, q.progress / q.target);
  }, []);

  const isDailyQuestComplete = useCallback((): boolean => {
    const q = stateRef.current.dailyQuest;
    return q.completed || q.progress >= q.target;
  }, []);

  const completeDailyQuest = useCallback((): boolean => {
    let completed = false;
    setState(prev => {
      if (prev.dailyQuest.completed) return prev;
      if (prev.dailyQuest.progress < prev.dailyQuest.target) return prev;

      completed = true;
      const questDef = CRL_DAILY_QUESTS.find(q => q.type === prev.dailyQuest.type);
      const reward = questDef?.reward ?? 20;

      return {
        ...prev,
        dailyQuest: { ...prev.dailyQuest, completed: true },
        coins: prev.coins + reward,
      };
    });
    if (completed) addXp(15);
    return completed;
  }, [addXp]);

  const generateDailyQuest = useCallback(() => {
    setState(prev => {
      const idx = Math.floor(Math.random() * CRL_DAILY_QUESTS.length);
      const quest = CRL_DAILY_QUESTS[idx];
      return {
        ...prev,
        dailyQuest: {
          completed: false,
          progress: 0,
          target: quest.target,
          type: quest.type,
        },
        lastDailyReset: Date.now(),
        dayStreak: prev.dayStreak + 1,
      };
    });
  }, []);

  const resetDailyQuest = useCallback(() => {
    generateDailyQuest();
  }, [generateDailyQuest]);

  const getDayStreak = useCallback((): number => {
    return stateRef.current.dayStreak;
  }, []);

  const getLastDailyReset = useCallback((): number => {
    return stateRef.current.lastDailyReset;
  }, []);

  // ── Events (Pollution / Bleaching) ────────────────────────────────────────

  const getActiveEvents = useCallback((): string[] => {
    return [...stateRef.current.events];
  }, []);

  const getEventTimer = useCallback((): number => {
    return stateRef.current.eventTimer;
  }, []);

  const triggerBleachingEvent = useCallback((): boolean => {
    let triggered = false;
    setState(prev => {
      if (prev.events.includes('coral_bleaching')) return prev;
      triggered = true;

      const updatedCorals = { ...prev.corals };
      for (const key of Object.keys(updatedCorals)) {
        updatedCorals[key] = {
          ...updatedCorals[key],
          health: Math.max(10, updatedCorals[key].health - 30),
        };
      }

      const updatedZones = { ...prev.zones };
      for (const key of Object.keys(updatedZones)) {
        updatedZones[key] = {
          ...updatedZones[key],
          pollution: Math.min(100, updatedZones[key].pollution + 20),
        };
      }

      return {
        ...prev,
        corals: updatedCorals,
        zones: updatedZones,
        events: [...prev.events, 'coral_bleaching'],
        eventTimer: 300,
      };
    });
    return triggered;
  }, []);

  const triggerPollutionEvent = useCallback((zoneId: string): boolean => {
    let triggered = false;
    setState(prev => {
      const zone = prev.zones[zoneId];
      if (!zone) return prev;
      triggered = true;
      return {
        ...prev,
        zones: {
          ...prev.zones,
          [zoneId]: { ...zone, pollution: Math.min(100, zone.pollution + 25) },
        },
        events: [...prev.events, 'pollution_surge'],
        eventTimer: 180,
      };
    });
    return triggered;
  }, []);

  const resolveEvent = useCallback((eventId: string): boolean => {
    let resolved = false;
    setState(prev => {
      if (!prev.events.includes(eventId)) return prev;
      resolved = true;
      return {
        ...prev,
        events: prev.events.filter(e => e !== eventId),
        eventTimer: 0,
      };
    });
    if (resolved) addXp(30);
    return resolved;
  }, [addXp]);

  const resolveAllEvents = useCallback(() => {
    setState(prev => {
      if (prev.events.length === 0) return prev;
      return { ...prev, events: [], eventTimer: 0 };
    });
    addXp(50);
  }, [addXp]);

  const tickEventTimer = useCallback(() => {
    setState(prev => {
      if (prev.eventTimer <= 0 || prev.events.length === 0) return prev;
      const newTimer = prev.eventTimer - 1;
      if (newTimer <= 0) {
        return { ...prev, events: [], eventTimer: 0 };
      }
      return { ...prev, eventTimer: newTimer };
    });
  }, []);

  // ── Stats ─────────────────────────────────────────────────────────────────

  const getStats = useCallback((): Record<string, number> => {
    const s = stateRef.current;
    return {
      level: s.level,
      xp: s.xp,
      maxXp: s.maxXp,
      coins: s.coins,
      coralsPlanted: s.totalCoralsPlanted,
      coralsHarvested: s.totalCoralsHarvested,
      zonesExplored: s.totalZonesExplored,
      pollutionCleaned: s.totalPollutionCleaned,
      creaturesBefriended: s.totalCreaturesBefriended,
      resourcesCollected: s.totalResourcesCollected,
      structuresBuilt: s.totalStructuresBuilt,
      abilitiesUsed: s.totalAbilitiesUsed,
      discoveries: s.discoveries.length,
      achievements: s.achievements.length,
      activeCoralCount: Object.keys(s.corals).length,
      unlockedZones: Object.values(s.zones).filter(z => z.unlocked).length,
      totalInventory: Object.values(s.inventory).reduce((a, b) => a + b, 0),
      dayStreak: s.dayStreak,
      creatureBonus: Object.entries(s.creatures).filter(([, d]) => d.favor >= 50).length * 5,
    };
  }, []);

  const getTotalPollution = useCallback((): number => {
    return Object.values(stateRef.current.zones).reduce((sum, z) => sum + z.pollution, 0);
  }, []);

  const getReefHealth = useCallback((): number => {
    const corals = Object.values(stateRef.current.corals);
    if (corals.length === 0) return 100;
    const avgHealth = corals.reduce((sum, c) => sum + c.health, 0) / corals.length;
    const pollutionPenalty = getTotalPollution() * 0.2;
    return Math.max(0, Math.min(100, avgHealth - pollutionPenalty));
  }, [getTotalPollution]);

  // ── Selection ─────────────────────────────────────────────────────────────

  const selectCoral = useCallback((coralId: string) => {
    setState(prev => ({ ...prev, selectedCoral: coralId }));
  }, []);

  const getSelectedCoral = useCallback((): string => {
    return stateRef.current.selectedCoral;
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────

  const getSettings = useCallback(() => {
    return { ...stateRef.current.settings };
  }, []);

  const toggleSfx = useCallback(() => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, sfxEnabled: !prev.settings.sfxEnabled },
    }));
  }, []);

  const toggleParticles = useCallback(() => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, particlesEnabled: !prev.settings.particlesEnabled },
    }));
  }, []);

  const toggleAmbient = useCallback(() => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ambientSounds: !prev.settings.ambientSounds },
    }));
  }, []);

  // ── Color Theme ───────────────────────────────────────────────────────────

  const getColorTheme = useCallback(() => {
    return { ...CRL_COLORS };
  }, []);

  const getPrimaryColor = useCallback(() => CRL_COLORS.primary, []);
  const getSecondaryColor = useCallback(() => CRL_COLORS.secondary, []);
  const getAccentColor = useCallback(() => CRL_COLORS.accent, []);
  const getCoralPinkColor = useCallback(() => CRL_COLORS.coralPink, []);
  const getSeaGreenColor = useCallback(() => CRL_COLORS.seaGreen, []);
  const getDeepOceanColor = useCallback(() => CRL_COLORS.deepOcean, []);
  const getAbyssalColor = useCallback(() => CRL_COLORS.abyssal, []);
  const getSandColor = useCallback(() => CRL_COLORS.sand, []);
  const getFoamColor = useCallback(() => CRL_COLORS.foam, []);
  const getPearlColor = useCallback(() => CRL_COLORS.pearl, []);
  const getBiolumColor = useCallback(() => CRL_COLORS.biolum, []);

  // ── Quick Actions ─────────────────────────────────────────────────────────

  const waterAllCorals = useCallback((): number => {
    let count = 0;
    setState(prev => {
      const updatedCorals = { ...prev.corals };
      for (const key of Object.keys(updatedCorals)) {
        updatedCorals[key] = {
          ...updatedCorals[key],
          wateredAt: Date.now(),
          health: Math.min(100, updatedCorals[key].health + 5),
        };
        count++;
      }
      if (count === 0) return prev;
      return { ...prev, corals: updatedCorals };
    });
    if (count > 0) addXp(count);
    return count;
  }, [addXp]);

  const harvestAllMature = useCallback((): number => {
    let harvestedCount = 0;
    setState(prev => {
      const now = Date.now();
      const remainingCorals: Record<string, CoralInstance> = {};
      const newInventory = { ...prev.inventory };
      let coinReward = 0;

      for (const [key, coral] of Object.entries(prev.corals)) {
        const def = getCoralDef(coral.defId);
        if (!def) { remainingCorals[key] = coral; continue; }

        const elapsed = (now - coral.plantedAt) / 1000;
        if (elapsed >= def.growthTime) {
          const fragCount = Math.ceil(rarityMultiplier(def.rarity));
          newInventory['coral_fragment'] = (newInventory['coral_fragment'] ?? 0) + fragCount;
          coinReward += Math.floor(def.xp * rarityMultiplier(def.rarity));
          harvestedCount++;
        } else {
          remainingCorals[key] = coral;
        }
      }

      if (harvestedCount === 0) return prev;

      return {
        ...prev,
        corals: remainingCorals,
        inventory: newInventory,
        coins: prev.coins + coinReward,
        totalCoralsHarvested: prev.totalCoralsHarvested + harvestedCount,
      };
    });
    if (harvestedCount > 0) addXp(harvestedCount * 10);
    return harvestedCount;
  }, [addXp]);

  const cleanAllZones = useCallback((): number => {
    let totalCleaned = 0;
    setState(prev => {
      const updatedZones = { ...prev.zones };
      for (const key of Object.keys(updatedZones)) {
        const zone = updatedZones[key];
        if (zone.pollution > 0) {
          const cleaned = Math.min(5, zone.pollution);
          updatedZones[key] = { ...zone, pollution: zone.pollution - cleaned };
          totalCleaned += cleaned;
        }
      }
      if (totalCleaned === 0) return prev;
      return {
        ...prev,
        zones: updatedZones,
        totalPollutionCleaned: prev.totalPollutionCleaned + totalCleaned,
      };
    });
    if (totalCleaned > 0) addXp(totalCleaned);
    return totalCleaned;
  }, [addXp]);

  const healAllCorals = useCallback((): number => {
    let count = 0;
    setState(prev => {
      const updatedCorals = { ...prev.corals };
      for (const key of Object.keys(updatedCorals)) {
        if (updatedCorals[key].health < 100) {
          updatedCorals[key] = {
            ...updatedCorals[key],
            health: Math.min(100, updatedCorals[key].health + 25),
          };
          count++;
        }
      }
      if (count === 0) return prev;
      return { ...prev, corals: updatedCorals };
    });
    if (count > 0) addXp(count * 3);
    return count;
  }, [addXp]);

  const quickExplore = useCallback((): boolean => {
    const unexplored = Object.entries(stateRef.current.zones)
      .filter(([, z]) => z.unlocked && !z.explored);
    if (unexplored.length === 0) return false;
    return exploreZone(unexplored[0][0]);
  }, [exploreZone]);

  // ── Bulk Operations ───────────────────────────────────────────────────────

  const bulkPlantCorals = useCallback((coralId: string, zoneId: string, count: number): number => {
    let planted = 0;
    for (let i = 0; i < count; i++) {
      const success = plantCoral(coralId, zoneId);
      if (success) planted++;
      else break;
    }
    return planted;
  }, [plantCoral]);

  const bulkCollectResources = useCallback((resourceId: string, amount: number): number => {
    let collected = 0;
    for (let i = 0; i < amount; i++) {
      collectResource(resourceId, 1);
      collected++;
    }
    return collected;
  }, [collectResource]);

  const bulkFeedAllCreatures = useCallback((): number => {
    let fed = 0;
    const creatures = stateRef.current.creatures;
    for (const id of Object.keys(creatures)) {
      const success = feedCreature(id);
      if (success) fed++;
    }
    return fed;
  }, [feedCreature]);

  // ── Computed Values (useMemo) ─────────────────────────────────────────────

  const computedStats = useMemo(() => {
    const s = state;
    const coralCount = Object.keys(s.corals).length;
    const unlockedZones = Object.values(s.zones).filter(z => z.unlocked).length;
    const exploredZones = Object.values(s.zones).filter(z => z.explored).length;
    const totalPollution = Object.values(s.zones).reduce((sum, z) => sum + z.pollution, 0);
    const avgHealth = coralCount > 0
      ? Object.values(s.corals).reduce((sum, c) => sum + c.health, 0) / coralCount
      : 0;
    const inventorySize = Object.values(s.inventory).reduce((sum, qty) => sum + qty, 0);
    const befriended = Object.entries(s.creatures).filter(([, d]) => d.favor >= 50).length;

    return {
      level: s.level,
      xpPercent: s.maxXp > 0 ? s.xp / s.maxXp : 0,
      coins: s.coins,
      coralCount,
      unlockedZones,
      exploredZones,
      totalPollution,
      reefHealth: Math.max(0, Math.min(100, avgHealth - totalPollution * 0.2)),
      inventorySize,
      befriendedCreatures: befriended,
      achievementCount: s.achievements.length,
      discoveryCount: s.discoveries.length,
      dayStreak: s.dayStreak,
      creatureBonus: befriended * 5,
      structureCount: Object.keys(s.structures).length,
    };
  }, [state]);

  const zoneSummary = useMemo(() => {
    return CRL_ZONES.map(z => {
      const instance = state.zones[z.id];
      return {
        id: z.id,
        name: z.name,
        depth: z.depth,
        color: z.color,
        unlocked: instance?.unlocked ?? false,
        explored: instance?.explored ?? false,
        pollution: instance?.pollution ?? z.pollution,
        coralSlots: instance?.coralSlots ?? 0,
        coralCount: Object.values(state.corals).filter(c => c.zoneId === z.id).length,
        structureCount: instance?.structures.length ?? 0,
      };
    });
  }, [state]);

  const coralSummary = useMemo(() => {
    return Object.entries(state.corals).map(([id, c]) => {
      const def = getCoralDef(c.defId);
      const maturity = def ? Math.min(1, (Date.now() - c.plantedAt) / 1000 / def.growthTime) : 0;
      return {
        id,
        defId: c.defId,
        name: def?.name ?? 'Unknown',
        rarity: def?.rarity ?? 'Common',
        color: def?.color ?? '#9CA3AF',
        health: c.health,
        maturity,
        isMature: maturity >= 1,
        zoneId: c.zoneId,
      };
    });
  }, [state]);

  const rarityDistribution = useMemo(() => {
    const dist: Record<Rarity, number> = { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
    for (const coral of Object.values(state.corals)) {
      const def = getCoralDef(coral.defId);
      if (def) dist[def.rarity]++;
    }
    return dist;
  }, [state]);

  const topCreatures = useMemo(() => {
    return Object.entries(state.creatures)
      .map(([id, data]) => {
        const def = getCreatureDef(id);
        return { id, name: def?.name ?? 'Unknown', favor: data.favor, maxFavor: def?.maxFavor ?? 100 };
      })
      .sort((a, b) => b.favor - a.favor)
      .slice(0, 5);
  }, [state]);

  const activeQuestInfo = useMemo(() => {
    const q = state.dailyQuest;
    const questDef = CRL_DAILY_QUESTS.find(d => d.type === q.type);
    return {
      type: q.type,
      description: questDef?.description ?? 'Complete a task.',
      progress: q.progress,
      target: q.target,
      percent: q.target > 0 ? Math.min(1, q.progress / q.target) : 0,
      completed: q.completed,
      reward: questDef?.reward ?? 0,
    };
  }, [state]);

  // ── Export helpers ────────────────────────────────────────────────────────

  const getState = useCallback((): CoralReefState => {
    return { ...stateRef.current };
  }, []);

  const getRawState = useCallback((): CoralReefState => {
    return stateRef.current;
  }, []);

  const exportData = useCallback((): string => {
    return JSON.stringify(stateRef.current, null, 2);
  }, []);

  const importState = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as CoralReefState;
      if (parsed && typeof parsed.level === 'number') {
        setState(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  // ── Return all functions ──────────────────────────────────────────────────
  return {
    state,
    computedStats,
    zoneSummary,
    coralSummary,
    rarityDistribution,
    topCreatures,
    activeQuestInfo,
    // Level & XP
    getLevel,
    getXp,
    getMaxXp,
    getXpProgress,
    addXp,
    // Coins
    getCoins,
    addCoins,
    spendCoins,
    // Titles
    getTitle,
    getAllTitles,
    getCurrentTitleIndex,
    selectTitle,
    isTitleUnlocked,
    // Coral Definitions
    getCoralDefById,
    getAllCoralDefs,
    getCoralsByRarity,
    getCommonCorals,
    getUncommonCorals,
    getRareCorals,
    getEpicCorals,
    getLegendaryCorals,
    // Coral Instances
    getCoral,
    getAllCorals,
    getCoralsInZone,
    getCoralCount,
    getCoralMaturity,
    isCoralMature,
    isCoralHealthy,
    getCoralHealth,
    getMatureCorals,
    // Coral Actions
    plantCoral,
    waterCoral,
    harvestCoral,
    removeCoral,
    healCoral,
    damageCoral,
    discoverCoral,
    getDiscoveries,
    hasDiscovered,
    getDiscoveryCount,
    // Zone Definitions
    getZoneDefById,
    getAllZoneDefs,
    // Zone Instances
    getZone,
    getAllZones,
    isZoneUnlocked,
    isZoneExplored,
    getZonePollution,
    getZoneCoralSlots,
    getUnlockedZones,
    getLockedZones,
    getExploredZoneCount,
    unlockZone,
    exploreZone,
    cleanPollution,
    addPollution,
    expandZoneSlots,
    selectZone,
    getSelectedZone,
    // Resources
    getResourceDefById,
    getAllResourceDefs,
    getResourceCount,
    getInventory,
    getInventorySize,
    getInventoryItems,
    collectResource,
    removeResource,
    hasResources,
    spendResources,
    // Creatures
    getCreatureDefById,
    getAllCreatureDefs,
    getCreature,
    getCreatureFavor,
    getCreatureFavorPercent,
    getAllCreatures,
    getBefriendedCreatures,
    getBefriendedCreatureCount,
    befriendCreature,
    feedCreature,
    maxFavorCreature,
    getCreatureBonus,
    // Structures
    getStructureDefById,
    getAllStructureDefs,
    getStructure,
    getAllStructures,
    getStructureLevel,
    getStructuresInZone,
    getStructureCount,
    buildStructure,
    upgradeStructure,
    getUpgradeCost,
    demolishStructure,
    // Abilities
    getAbilityDefById,
    getAllAbilityDefs,
    getUnlockedAbilityDefs,
    getLockedAbilityDefs,
    isAbilityUnlocked,
    getAbilityCooldownRemaining,
    isAbilityReady,
    castAbility,
    getAbilityUseCount,
    getTotalAbilityUses,
    // Crafting
    getRecipeDefById,
    getAllRecipeDefs,
    getUnlockedRecipeDefs,
    getLockedRecipeDefs,
    isRecipeUnlocked,
    unlockRecipe,
    canCraft,
    craftItem,
    getCraftableRecipes,
    // Achievements
    getAllAchievementDefs,
    getAchievements,
    hasAchievement,
    getAchievementCount,
    checkAchievements,
    // Daily Quest
    getDailyQuest,
    getDailyQuestProgress,
    getDailyQuestTarget,
    getDailyQuestPercent,
    isDailyQuestComplete,
    completeDailyQuest,
    generateDailyQuest,
    resetDailyQuest,
    getDayStreak,
    getLastDailyReset,
    // Events
    getActiveEvents,
    getEventTimer,
    triggerBleachingEvent,
    triggerPollutionEvent,
    resolveEvent,
    resolveAllEvents,
    tickEventTimer,
    // Stats
    getStats,
    getTotalPollution,
    getReefHealth,
    // Selection
    selectCoral,
    getSelectedCoral,
    // Settings
    getSettings,
    toggleSfx,
    toggleParticles,
    toggleAmbient,
    // Color Theme
    getColorTheme,
    getPrimaryColor,
    getSecondaryColor,
    getAccentColor,
    getCoralPinkColor,
    getSeaGreenColor,
    getDeepOceanColor,
    getAbyssalColor,
    getSandColor,
    getFoamColor,
    getPearlColor,
    getBiolumColor,
    // Quick Actions
    waterAllCorals,
    harvestAllMature,
    cleanAllZones,
    healAllCorals,
    quickExplore,
    // Bulk Operations
    bulkPlantCorals,
    bulkCollectResources,
    bulkFeedAllCreatures,
    // Export / Import
    getState,
    getRawState,
    exportData,
    importState,
    resetState,
  };
}
