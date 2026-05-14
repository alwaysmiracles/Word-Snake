import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// Lost Civilization Wire — Ancient Ruins Exploration Module
// Color Theme: amber/sand/terracotta (#D97706, #D6D3D1, #C2410C)
// ============================================================================

// --- Type Definitions ---

type LCRarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
type LCExcavationStatus = 'unexplored' | 'in_progress' | 'excavated' | 'restored' | 'cursed';
type LCExplorationPhase = 'scouting' | 'digging' | 'analyzing' | 'restoring' | 'exhibiting';
type LCTrapType = 'pressure_plate' | 'poison_dart' | 'falling_rocks' | 'sand_trap' | 'cursed_seal' | 'ancient_mechanism';
type LCPuzzleType = 'glyph_sequence' | 'pattern_match' | 'rune_lock' | 'logic_gate' | 'memory_test' | 'cipher_decode';
type LCAbilityType = 'scan' | 'date' | 'decipher' | 'disarm' | 'restore' | 'exhibit' | 'research' | 'map';
type LCFacilityType = 'field' | 'lab' | 'museum' | 'restoration' | 'archive' | 'training' | 'storage' | 'exhibition';

export interface LCArtifact {
  id: string;
  name: string;
  description: string;
  rarity: LCRarityTier;
  zoneId: string;
  depth: number;
  ancientValue: number;
  restorationCost: number;
  loreText: string;
  cursed: boolean;
  curseEffect?: string;
  discoveredAt: number;
  restoredAt?: number;
}

export interface LCRuinZone {
  id: string;
  name: string;
  description: string;
  depth: number;
  threatLevel: number;
  artifactCount: number;
  trapsCount: number;
  puzzlesCount: number;
  explored: number;
  maxExplored: number;
  unlockCost: number;
  climate: string;
  hazards: string[];
}

export interface LCExcavationTool {
  id: string;
  name: string;
  description: string;
  tier: number;
  efficiency: number;
  durability: number;
  maxDurability: number;
  specialEffect?: string;
  cost: number;
  owned: boolean;
  equipped: boolean;
}

export interface LCResearchFacility {
  id: string;
  name: string;
  type: LCFacilityType;
  level: number;
  maxLevel: number;
  capacity: number;
  upgradeCost: number;
  activeProjects: number;
  unlocked: boolean;
  productivity: number;
}

export interface LCAbility {
  id: string;
  name: string;
  type: LCAbilityType;
  description: string;
  cooldown: number;
  currentCooldown: number;
  level: number;
  maxLevel: number;
  unlockLevel: number;
  unlocked: boolean;
  experience: number;
  experienceToNext: number;
}

export interface LCAchievement {
  id: string;
  name: string;
  description: string;
  condition: string;
  progress: number;
  target: number;
  completed: boolean;
  rewardCoins: number;
  rewardXP: number;
  unlockedAt?: number;
}

export interface LCTitle {
  id: string;
  name: string;
  description: string;
  requiredAchievements: number;
  bonusMultiplier: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface LCTrap {
  id: string;
  type: LCTrapType;
  zoneId: string;
  difficulty: number;
  disarmed: boolean;
  disarmProgress: number;
  disarmCost: number;
}

export interface LCPuzzle {
  id: string;
  type: LCPuzzleType;
  zoneId: string;
  difficulty: number;
  solved: boolean;
  solveProgress: number;
  hintUsed: boolean;
  reward: number;
}

export interface LCCursedEvent {
  id: string;
  artifactId: string;
  description: string;
  severity: number;
  active: boolean;
  startedAt: number;
  duration: number;
  penalty: string;
}

export interface LCDailyQuest {
  id: string;
  day: number;
  description: string;
  target: number;
  progress: number;
  reward: number;
  completed: boolean;
  expiresAt: number;
}

export interface LCResearchPaper {
  id: string;
  title: string;
  topic: string;
  quality: number;
  status: 'draft' | 'submitted' | 'peer_review' | 'published' | 'rejected';
  citations: number;
  publishedAt?: number;
  rewardXP: number;
  rewardCoins: number;
}

export interface LCExhibition {
  id: string;
  name: string;
  theme: string;
  artifacts: string[];
  visitors: number;
  rating: number;
  revenue: number;
  active: boolean;
  startedAt?: number;
  duration: number;
}

export interface LostCivilizationState {
  coins: number;
  xp: number;
  level: number;
  currentZoneId: string;
  currentPhase: LCExplorationPhase;
  artifacts: LCArtifact[];
  zones: LCRuinZone[];
  tools: LCExcavationTool[];
  facilities: LCResearchFacility[];
  abilities: LCAbility[];
  achievements: LCAchievement[];
  titles: LCTitle[];
  activeTitleId: string;
  traps: LCTrap[];
  puzzles: LCPuzzle[];
  cursedEvents: LCCursedEvent[];
  dailyQuest: LCDailyQuest | null;
  researchPapers: LCResearchPaper[];
  exhibitions: LCExhibition[];
  totalExcavated: number;
  totalRestored: number;
  totalPuzzlesSolved: number;
  totalTrapsDisarmed: number;
  totalPapersPublished: number;
  totalExhibitionsHosted: number;
  explorationStreak: number;
  lastExcavationTime: number;
  AncientLanguageKnown: number;
  mapRevealPercent: number;
  shieldActive: boolean;
  shieldExpiry: number;
}

// --- Constants with LC_ prefix ---

const LC_AMBER = '#D97706';
const LC_SAND = '#D6D3D1';
const LC_TERRACOTTA = '#C2410C';
const LC_GOLD = '#F59E0B';
const LC_PARCHMENT = '#FEF3C7';
const LC_STONE = '#78716C';
const LC_DARK_SOIL = '#44403C';
const LC_JADE = '#059669';
const LC_OBSIDIAN = '#1C1917';

const LC_RARITY_COLORS: Record<LCRarityTier, string> = {
  common: '#9CA3AF',
  uncommon: '#10B981',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

const LC_RARITY_MULTIPLIERS: Record<LCRarityTier, number> = {
  common: 1,
  uncommon: 2,
  rare: 5,
  epic: 10,
  legendary: 25,
};

const LC_PHASE_COLORS: Record<LCExplorationPhase, string> = {
  scouting: LC_AMBER,
  digging: LC_TERRACOTTA,
  analyzing: LC_JADE,
  restoring: LC_GOLD,
  exhibiting: LC_PARCHMENT,
};

const LC_TIER_NAMES = ['Rusty', 'Standard', 'Premium', 'Masterwork', 'Relic-Grade'];

const LC_ARTIFACT_TEMPLATES: Omit<LCArtifact, 'id'>[] = [
  { name: 'Golden Mask of the Sun King', description: 'A radiant mask that gleams with inner light', rarity: 'legendary', zoneId: 'temple_sun', depth: 8, ancientValue: 5000, restorationCost: 2000, loreText: 'Forged during the first eclipse, it channels solar energy.', cursed: false, discoveredAt: 0 },
  { name: 'Crystal Skull of Prophecy', description: 'A translucent skull humming with psychic resonance', rarity: 'legendary', zoneId: 'pyramid_complex', depth: 9, ancientValue: 4500, restorationCost: 1800, loreText: 'The ancients used it to glimpse futures yet unwritten.', cursed: true, curseEffect: 'Reveals too much truth', discoveredAt: 0 },
  { name: 'Stone Tablet of Origins', description: 'A massive tablet covered in primordial glyphs', rarity: 'legendary', zoneId: 'underground_labyrinth', depth: 10, ancientValue: 6000, restorationCost: 2500, loreText: 'Contains the creation myth of a civilization older than recorded time.', cursed: false, discoveredAt: 0 },
  { name: 'Ancient Map of Lost Continents', description: 'A weathered map showing lands that no longer exist', rarity: 'epic', zoneId: 'forgotten_library', depth: 7, ancientValue: 3500, restorationCost: 1200, loreText: 'Cartographers spent lifetimes trying to verify its coordinates.', cursed: false, discoveredAt: 0 },
  { name: 'Royal Scepter of the Pharaohs', description: 'A gilded scepter topped with a lapis lazuli eye', rarity: 'epic', zoneId: 'royal_tomb', depth: 8, ancientValue: 3200, restorationCost: 1100, loreText: 'Whoever wields it commands the loyalty of the ancient dead.', cursed: true, curseEffect: 'Summons guardian spirits', discoveredAt: 0 },
  { name: 'Obsidian Mirror of Truth', description: 'A perfectly smooth mirror carved from volcanic glass', rarity: 'epic', zoneId: 'temple_sun', depth: 6, ancientValue: 2800, restorationCost: 1000, loreText: 'It reflects not your face, but your deepest intentions.', cursed: true, curseEffect: 'Paranoia when gazed upon', discoveredAt: 0 },
  { name: 'Jade Amulet of Eternity', description: 'A luminous jade pendant with infinite intricate carvings', rarity: 'epic', zoneId: 'sacred_garden', depth: 7, ancientValue: 3000, restorationCost: 1050, loreText: 'Each carving represents a different cycle of existence.', cursed: false, discoveredAt: 0 },
  { name: 'Bronze Compass of the Ancients', description: 'A compass that points toward hidden ruins worldwide', rarity: 'rare', zoneId: 'observatory_ruins', depth: 5, ancientValue: 1800, restorationCost: 600, loreText: 'Its needle follows ley lines invisible to modern instruments.', cursed: false, discoveredAt: 0 },
  { name: 'Ceremonial Dagger of Blood Moon', description: 'A curved blade that absorbs moonlight', rarity: 'rare', zoneId: 'colosseum_ruins', depth: 6, ancientValue: 1600, restorationCost: 550, loreText: 'Used in rituals that only occurred once every century.', cursed: true, curseEffect: 'Bleeds under full moon', discoveredAt: 0 },
  { name: 'Sunstone Navigation Crystal', description: 'A crystal that reveals true north through any fog', rarity: 'rare', zoneId: 'temple_sun', depth: 5, ancientValue: 1500, restorationCost: 500, loreText: 'Viking navigators may have used similar stones.', cursed: false, discoveredAt: 0 },
  { name: 'Papyrus Scroll of Healing', description: 'An ancient medical text with still-valid remedies', rarity: 'rare', zoneId: 'forgotten_library', depth: 4, ancientValue: 1400, restorationCost: 480, loreText: 'Modern pharmacology confirmed three of its prescriptions.', cursed: false, discoveredAt: 0 },
  { name: 'Terracotta Warrior Fragment', description: 'A piece of an ancient warrior statue, still warm', rarity: 'rare', zoneId: 'pyramid_complex', depth: 5, ancientValue: 1300, restorationCost: 450, loreText: 'Each warrior was unique, modeled after a real person.', cursed: false, discoveredAt: 0 },
  { name: 'Copper Water Basin', description: 'A basin that purifies any liquid poured within', rarity: 'rare', zoneId: 'sacred_garden', depth: 4, ancientValue: 1200, restorationCost: 420, loreText: 'The water it produces tastes impossibly pure.', cursed: false, discoveredAt: 0 },
  { name: 'Ivory Game Board', description: 'A sophisticated board game with unknown rules', rarity: 'uncommon', zoneId: 'royal_tomb', depth: 3, ancientValue: 700, restorationCost: 250, loreText: 'Pieces suggest a game of strategy involving celestial bodies.', cursed: false, discoveredAt: 0 },
  { name: 'Pottery Shards with Murals', description: 'Fragments showing a cataclysmic ancient event', rarity: 'uncommon', zoneId: 'colosseum_ruins', depth: 3, ancientValue: 650, restorationCost: 230, loreText: 'When assembled, they depict a city consumed by fire and water.', cursed: false, discoveredAt: 0 },
  { name: 'Bone Divination Set', description: 'Animal bones carved with fortune-telling symbols', rarity: 'uncommon', zoneId: 'underground_labyrinth', depth: 3, ancientValue: 600, restorationCost: 210, loreText: 'Oracle bones that predate Chinese civilization.', cursed: true, curseEffect: 'Whispers future regrets', discoveredAt: 0 },
  { name: 'Silver Lunar Pendant', description: 'A crescent moon pendant that glows at night', rarity: 'uncommon', zoneId: 'observatory_ruins', depth: 3, ancientValue: 580, restorationCost: 200, loreText: 'Astronomers wore these during midnight observations.', cursed: false, discoveredAt: 0 },
  { name: 'Woven Tapestry Fragment', description: 'A piece of fabric depicting an unknown language', rarity: 'uncommon', zoneId: 'forgotten_library', depth: 2, ancientValue: 550, restorationCost: 190, loreText: 'The weaving technique is unknown to modern textile experts.', cursed: false, discoveredAt: 0 },
  { name: 'Clay Sealing Stamp', description: 'A stamp used to authenticate royal decrees', rarity: 'uncommon', zoneId: 'royal_tomb', depth: 2, ancientValue: 520, restorationCost: 180, loreText: 'The imprint matches no known dynasty or empire.', cursed: false, discoveredAt: 0 },
  { name: 'Stone Pestle and Mortar', description: 'Tools used for grinding sacred herbs', rarity: 'uncommon', zoneId: 'sacred_garden', depth: 2, ancientValue: 480, restorationCost: 170, loreText: 'Residue analysis revealed compounds not found in nature today.', cursed: false, discoveredAt: 0 },
  { name: 'Copper Ring with Inscription', description: 'A ring bearing a name from a lost royal line', rarity: 'common', zoneId: 'temple_sun', depth: 1, ancientValue: 200, restorationCost: 80, loreText: 'The inscription reads: "One who dares to remember."', cursed: false, discoveredAt: 0 },
  { name: 'Crude Flint Knife', description: 'A simple but effective cutting tool', rarity: 'common', zoneId: 'pyramid_complex', depth: 1, ancientValue: 150, restorationCost: 60, loreText: 'Evidence of surprisingly advanced flint-knapping technique.', cursed: false, discoveredAt: 0 },
  { name: 'Fired Clay Bowl', description: 'A utilitarian bowl with painted geometric patterns', rarity: 'common', zoneId: 'colosseum_ruins', depth: 1, ancientValue: 180, restorationCost: 70, loreText: 'The paint contains minerals only found in a mountain range 3000km away.', cursed: false, discoveredAt: 0 },
  { name: 'Bone Needle', description: 'A delicate needle crafted from bird bone', rarity: 'common', zoneId: 'underground_labyrinth', depth: 1, ancientValue: 120, restorationCost: 50, loreText: 'The eye is too small for any known ancient thread.', cursed: false, discoveredAt: 0 },
  { name: 'Polished River Stone', description: 'A stone worn smooth by unknown hands', rarity: 'common', zoneId: 'sacred_garden', depth: 1, ancientValue: 100, restorationCost: 40, loreText: 'It fits perfectly in the palm, as if designed for meditation.', cursed: false, discoveredAt: 0 },
  { name: 'Broken Ceramic Figurine', description: 'Half of a human figurine with elaborate headdress', rarity: 'common', zoneId: 'forgotten_library', depth: 1, ancientValue: 130, restorationCost: 55, loreText: 'The headdress style matches no known ancient culture.', cursed: false, discoveredAt: 0 },
  { name: 'Rope Fragment', description: 'A preserved length of ancient rope fiber', rarity: 'common', zoneId: 'royal_tomb', depth: 1, ancientValue: 90, restorationCost: 35, loreText: 'The fiber comes from a plant species now extinct.', cursed: false, discoveredAt: 0 },
  { name: 'Obsidian Scraper', description: 'A volcanic glass tool for hide preparation', rarity: 'common', zoneId: 'observatory_ruins', depth: 1, ancientValue: 110, restorationCost: 45, loreText: 'Microscopic analysis reveals it was used on no known animal.', cursed: false, discoveredAt: 0 },
  { name: 'Painted Shell', description: 'A sea shell with intricate pigment patterns', rarity: 'common', zoneId: 'colosseum_ruins', depth: 2, ancientValue: 160, restorationCost: 65, loreText: 'The nearest ocean is 2000km from where it was found.', cursed: false, discoveredAt: 0 },
  { name: 'Lead Weight', description: 'A precisely calibrated weight for ancient scales', rarity: 'common', zoneId: 'temple_sun', depth: 2, ancientValue: 140, restorationCost: 55, loreText: 'Its weight matches a standard lost for millennia.', cursed: false, discoveredAt: 0 },
  { name: 'Gold Tribute Coin', description: 'A coin bearing the face of an unknown ruler', rarity: 'uncommon', zoneId: 'pyramid_complex', depth: 4, ancientValue: 750, restorationCost: 280, loreText: 'The metallurgy suggests it was made with impossible precision.', cursed: false, discoveredAt: 0 },
  { name: 'Emerald Scarab Amulet', description: 'A scarab carved from a single emerald crystal', rarity: 'rare', zoneId: 'underground_labyrinth', depth: 6, ancientValue: 2000, restorationCost: 700, loreText: 'The scarab species it depicts is unknown to entomology.', cursed: true, curseEffect: 'Attracts beetles', discoveredAt: 0 },
  { name: 'Star Chart on Leather', description: 'A star map showing constellations that no longer exist', rarity: 'epic', zoneId: 'observatory_ruins', depth: 7, ancientValue: 3800, restorationCost: 1300, loreText: 'Precession of equinoxes confirms its age at over 12000 years.', cursed: false, discoveredAt: 0 },
  { name: 'Singing Bowl of Resonance', description: 'A metal bowl that produces harmonic frequencies', rarity: 'rare', zoneId: 'sacred_garden', depth: 5, ancientValue: 1700, restorationCost: 580, loreText: 'Its resonant frequency matches the natural vibration of human bone.', cursed: false, discoveredAt: 0 },
  { name: 'Mummified Cat', description: 'A perfectly preserved cat in ceremonial wrappings', rarity: 'rare', zoneId: 'royal_tomb', depth: 5, ancientValue: 1500, restorationCost: 520, loreText: 'DNA analysis suggests it was a species that went extinct 5000 years ago.', cursed: false, discoveredAt: 0 },
  { name: 'Gilded Chariot Wheel', description: 'A ceremonial wheel inlaid with precious stones', rarity: 'epic', zoneId: 'colosseum_ruins', depth: 7, ancientValue: 3400, restorationCost: 1150, loreText: 'It was designed for a vehicle far too large for horses.', cursed: false, discoveredAt: 0 },
  { name: 'Pharaoh Death Mask Fragment', description: 'A piece of a death mask with unknown metallic composition', rarity: 'legendary', zoneId: 'royal_tomb', depth: 9, ancientValue: 5500, restorationCost: 2200, loreText: 'The metal contains an isotope not found on Earth.', cursed: true, curseEffect: 'Causes temporal displacement', discoveredAt: 0 },
  { name: 'Ley Line Keystone', description: 'A stone that anchors the convergence of ley lines', rarity: 'legendary', zoneId: 'underground_labyrinth', depth: 10, ancientValue: 7000, restorationCost: 3000, loreText: 'Moving it would shift the geomagnetic field of the entire region.', cursed: true, curseEffect: 'Reality distortion nearby', discoveredAt: 0 },
];

const LC_ZONE_TEMPLATES: Omit<LCRuinZone, 'id' | 'explored'>[] = [
  { name: 'Temple of Sun', description: 'A towering temple aligned to solar events, its golden stone walls still gleaming.', depth: 8, threatLevel: 3, artifactCount: 5, trapsCount: 4, puzzlesCount: 3, maxExplored: 100, unlockCost: 0, climate: 'Arid Desert', hazards: ['Heat exhaustion', 'Sandstorm', 'Sun glare'] },
  { name: 'Pyramid Complex', description: 'An interconnected network of pyramids with vast underground chambers.', depth: 9, threatLevel: 5, artifactCount: 6, trapsCount: 6, puzzlesCount: 4, maxExplored: 120, unlockCost: 500, climate: 'Desert Plateau', hazards: ['Collapsing passages', 'Poison gas', 'Scarab swarms'] },
  { name: 'Underground Labyrinth', description: 'A maze of tunnels stretching for miles beneath the earth.', depth: 10, threatLevel: 7, artifactCount: 5, trapsCount: 8, puzzlesCount: 5, maxExplored: 150, unlockCost: 1200, climate: 'Subterranean', hazards: ['Darkness', 'Underground river', 'Cave-ins', 'Ancient guardians'] },
  { name: 'Forgotten Library', description: 'A vast underground repository of knowledge from a lost age.', depth: 7, threatLevel: 4, artifactCount: 5, trapsCount: 3, puzzlesCount: 6, maxExplored: 100, unlockCost: 800, climate: 'Climate-controlled vault', hazards: ['Fragile texts', 'Ink mold', 'Collapsed shelves'] },
  { name: 'Sacred Garden', description: 'An overgrown garden with plants of unknown species and healing pools.', depth: 5, threatLevel: 2, artifactCount: 5, trapsCount: 2, puzzlesCount: 3, maxExplored: 80, unlockCost: 300, climate: 'Tropical enclosed', hazards: ['Toxic plants', 'Allergic pollen', 'Treacherous paths'] },
  { name: 'Royal Tomb', description: 'The final resting place of a forgotten dynasty, filled with treasures and curses.', depth: 9, threatLevel: 8, artifactCount: 6, trapsCount: 7, puzzlesCount: 4, maxExplored: 130, unlockCost: 1500, climate: 'Sealed tomb', hazards: ['Curses', 'Traps', 'Toxic air', 'Undead guardians'] },
  { name: 'Observatory Ruins', description: 'The remains of an astronomical observatory with precise instruments.', depth: 6, threatLevel: 3, artifactCount: 5, trapsCount: 3, puzzlesCount: 5, maxExplored: 90, unlockCost: 600, climate: 'Mountain peak', hazards: ['Thin air', 'Lightning', 'Unstable footing'] },
  { name: 'Colosseum Ruins', description: 'A massive arena where ancient games of strength and wit were held.', depth: 7, threatLevel: 5, artifactCount: 5, trapsCount: 5, puzzlesCount: 4, maxExplored: 100, unlockCost: 900, climate: 'Open air', hazards: ['Falling debris', 'Hidden pits', 'Echo traps'] },
];

const LC_ZONE_IDS = ['temple_sun', 'pyramid_complex', 'underground_labyrinth', 'forgotten_library', 'sacred_garden', 'royal_tomb', 'observatory_ruins', 'colosseum_ruins'];

const LC_TOOL_TEMPLATES: Omit<LCExcavationTool, 'id' | 'durability'>[] = [
  { name: 'Rusty Trowel', description: 'A basic trowel, worn from years of use.', tier: 1, efficiency: 1, maxDurability: 50, cost: 0, owned: true, equipped: true },
  { name: 'Soft Brush', description: 'A fine brush for delicate dusting work.', tier: 1, efficiency: 1.2, maxDurability: 60, cost: 50, owned: false, equipped: false },
  { name: 'Pickaxe', description: 'A sturdy pickaxe for breaking through hard soil.', tier: 2, efficiency: 2, maxDurability: 80, cost: 200, owned: false, equipped: false },
  { name: 'Hand Shovel', description: 'A compact shovel for quick excavation.', tier: 2, efficiency: 1.8, maxDurability: 70, cost: 150, owned: false, equipped: false },
  { name: 'Ground Penetrating Radar', description: 'Advanced radar for detecting buried structures.', tier: 3, efficiency: 3, maxDurability: 100, cost: 800, owned: false, equipped: false, specialEffect: 'Reveals hidden artifacts' },
  { name: 'X-Ray Scanner', description: 'A portable scanner for examining sealed chambers.', tier: 3, efficiency: 3.5, maxDurability: 90, cost: 1000, owned: false, equipped: false, specialEffect: 'Shows contents without opening' },
  { name: 'Carbon Dating Kit', description: 'Precisely dates organic materials.', tier: 3, efficiency: 2, maxDurability: 50, cost: 700, owned: false, equipped: false, specialEffect: 'Dates artifacts instantly' },
  { name: 'Chisel Set', description: 'Precision chisels for stone work and inscription reading.', tier: 2, efficiency: 2.5, maxDurability: 75, cost: 300, owned: false, equipped: false },
  { name: 'Ultrasonic Cleaner', description: 'Cleans artifacts using high-frequency vibrations.', tier: 4, efficiency: 4, maxDurability: 120, cost: 1500, owned: false, equipped: false, specialEffect: 'Automatic cleaning' },
  { name: 'Microscope Kit', description: 'Advanced microscopy for material analysis.', tier: 3, efficiency: 2.5, maxDurability: 60, cost: 900, owned: false, equipped: false },
  { name: 'Drone Explorer', description: 'A flying drone for mapping and reconnaissance.', tier: 4, efficiency: 5, maxDurability: 150, cost: 2500, owned: false, equipped: false, specialEffect: 'Maps entire rooms' },
  { name: 'Metal Detector', description: 'Detects metallic artifacts underground.', tier: 2, efficiency: 2.2, maxDurability: 70, cost: 250, owned: false, equipped: false, specialEffect: 'Finds metal artifacts' },
  { name: 'Diving Gear', description: 'For exploring submerged chambers and wells.', tier: 3, efficiency: 3, maxDurability: 100, cost: 600, owned: false, equipped: false },
  { name: 'Laser Scanner', description: '3D scanning for detailed artifact mapping.', tier: 4, efficiency: 4.5, maxDurability: 130, cost: 2000, owned: false, equipped: false, specialEffect: 'Creates 3D models' },
  { name: 'Chemical Analysis Kit', description: 'Analyzes composition of unknown substances.', tier: 3, efficiency: 2.8, maxDurability: 55, cost: 850, owned: false, equipped: false },
  { name: 'Remote Manipulator', description: 'A robotic arm for handling fragile artifacts.', tier: 4, efficiency: 3.5, maxDurability: 110, cost: 1800, owned: false, equipped: false, specialEffect: 'Zero damage handling' },
  { name: 'Seismic Sensor', description: 'Detects structural instability before collapse.', tier: 3, efficiency: 2, maxDurability: 80, cost: 750, owned: false, equipped: false, specialEffect: 'Prevents cave-ins' },
  { name: 'Portable Generator', description: 'Powers equipment in remote locations.', tier: 2, efficiency: 1.5, maxDurability: 200, cost: 400, owned: false, equipped: false },
  { name: 'Night Vision Goggles', description: 'See clearly in the darkest tombs.', tier: 3, efficiency: 3, maxDurability: 90, cost: 650, owned: false, equipped: false, specialEffect: 'Reveals hidden in darkness' },
  { name: 'Acoustic Resonator', description: 'Uses sound to detect hollow spaces and chambers.', tier: 4, efficiency: 4, maxDurability: 100, cost: 1200, owned: false, equipped: false, specialEffect: 'Finds hidden rooms' },
  { name: 'Vacuum Excavator', description: 'Removes soil without disturbing artifacts.', tier: 4, efficiency: 5, maxDurability: 140, cost: 2200, owned: false, equipped: false, specialEffect: 'Safe excavation' },
  { name: 'Digital Tablet', description: 'Records findings and cross-references databases.', tier: 2, efficiency: 2, maxDurability: 80, cost: 350, owned: false, equipped: false },
  { name: 'Protective Suit', description: 'Shields from environmental hazards.', tier: 3, efficiency: 1, maxDurability: 150, cost: 500, owned: false, equipped: false, specialEffect: 'Hazard immunity' },
  { name: 'Translation AI Module', description: 'Assists with deciphering ancient scripts.', tier: 4, efficiency: 4, maxDurability: 100, cost: 1800, owned: false, equipped: false, specialEffect: 'Auto-decipher 30%' },
  { name: 'Gravity Pulse Emitter', description: 'Detects anomalies in gravitational fields.', tier: 5, efficiency: 6, maxDurability: 200, cost: 5000, owned: false, equipped: false, specialEffect: 'Finds legendary artifacts' },
  { name: 'Temporal Scanner', description: 'Glimpses artifacts at their moment of creation.', tier: 5, efficiency: 7, maxDurability: 180, cost: 8000, owned: false, equipped: false, specialEffect: 'Reveals full lore' },
  { name: 'Nanite Repair Swarm', description: 'Microscopic robots that repair damaged artifacts.', tier: 5, efficiency: 8, maxDurability: 250, cost: 10000, owned: false, equipped: false, specialEffect: 'Instant restoration' },
  { name: 'Plasma Cutter', description: 'Precision cutting through any material.', tier: 4, efficiency: 4.5, maxDurability: 100, cost: 2000, owned: false, equipped: false },
  { name: 'Ancient Key Ring', description: 'A collection of keys that may fit forgotten locks.', tier: 3, efficiency: 2.5, maxDurability: 999, cost: 1000, owned: false, equipped: false, specialEffect: 'Opens sealed doors' },
  { name: 'Cursed Seal Breaker', description: 'Safely removes magical seals and wards.', tier: 5, efficiency: 5, maxDurability: 80, cost: 6000, owned: false, equipped: false, specialEffect: 'Neutralizes curses' },
];

const LC_FACILITY_TEMPLATES: Omit<LCResearchFacility, 'id'>[] = [
  { name: 'Field Camp Alpha', type: 'field', level: 1, maxLevel: 5, capacity: 10, upgradeCost: 200, activeProjects: 0, unlocked: true, productivity: 1 },
  { name: 'Analysis Laboratory', type: 'lab', level: 1, maxLevel: 5, capacity: 5, upgradeCost: 500, activeProjects: 0, unlocked: true, productivity: 1 },
  { name: 'Artifact Museum Wing', type: 'museum', level: 1, maxLevel: 5, capacity: 20, upgradeCost: 800, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Restoration Workshop', type: 'restoration', level: 1, maxLevel: 5, capacity: 8, upgradeCost: 600, activeProjects: 0, unlocked: true, productivity: 1 },
  { name: 'Ancient Archive', type: 'archive', level: 1, maxLevel: 5, capacity: 50, upgradeCost: 400, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Training Grounds', type: 'training', level: 1, maxLevel: 5, capacity: 15, upgradeCost: 350, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Secure Storage Vault', type: 'storage', level: 1, maxLevel: 5, capacity: 100, upgradeCost: 700, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Grand Exhibition Hall', type: 'exhibition', level: 1, maxLevel: 5, capacity: 30, upgradeCost: 1200, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Carbon Dating Facility', type: 'lab', level: 1, maxLevel: 3, capacity: 4, upgradeCost: 900, activeProjects: 0, unlocked: false, productivity: 1.2 },
  { name: 'Conservation Lab', type: 'restoration', level: 1, maxLevel: 3, capacity: 6, upgradeCost: 1000, activeProjects: 0, unlocked: false, productivity: 1.3 },
  { name: 'Digital Reconstruction Suite', type: 'lab', level: 1, maxLevel: 3, capacity: 3, upgradeCost: 1500, activeProjects: 0, unlocked: false, productivity: 1.5 },
  { name: 'Publishing Office', type: 'archive', level: 1, maxLevel: 3, capacity: 10, upgradeCost: 600, activeProjects: 0, unlocked: false, productivity: 1.1 },
  { name: 'Gift Shop & Café', type: 'exhibition', level: 1, maxLevel: 3, capacity: 50, upgradeCost: 400, activeProjects: 0, unlocked: false, productivity: 2 },
  { name: 'Mobile Excavation Unit', type: 'field', level: 1, maxLevel: 3, capacity: 8, upgradeCost: 1000, activeProjects: 0, unlocked: false, productivity: 1.4 },
  { name: 'Underwater Research Bay', type: 'lab', level: 1, maxLevel: 3, capacity: 5, upgradeCost: 2000, activeProjects: 0, unlocked: false, productivity: 1.6 },
  { name: 'Cursed Object Containment', type: 'storage', level: 1, maxLevel: 3, capacity: 15, upgradeCost: 1800, activeProjects: 0, unlocked: false, productivity: 1 },
  { name: 'Multimedia Presentation Room', type: 'exhibition', level: 1, maxLevel: 3, capacity: 100, upgradeCost: 700, activeProjects: 0, unlocked: false, productivity: 1.8 },
  { name: 'Peer Review Council', type: 'archive', level: 1, maxLevel: 3, capacity: 8, upgradeCost: 1100, activeProjects: 0, unlocked: false, productivity: 1.2 },
  { name: 'Advanced Materials Lab', type: 'lab', level: 1, maxLevel: 3, capacity: 4, upgradeCost: 2500, activeProjects: 0, unlocked: false, productivity: 2 },
  { name: 'Heritage Preservation Center', type: 'restoration', level: 1, maxLevel: 3, capacity: 10, upgradeCost: 1600, activeProjects: 0, unlocked: false, productivity: 1.5 },
  { name: 'International Liaison Office', type: 'archive', level: 1, maxLevel: 3, capacity: 6, upgradeCost: 800, activeProjects: 0, unlocked: false, productivity: 1.1 },
  { name: 'Virtual Reality Experience', type: 'exhibition', level: 1, maxLevel: 3, capacity: 40, upgradeCost: 3000, activeProjects: 0, unlocked: false, productivity: 2.5 },
  { name: 'Botanical Research Garden', type: 'field', level: 1, maxLevel: 3, capacity: 12, upgradeCost: 500, activeProjects: 0, unlocked: false, productivity: 1.3 },
  { name: 'Geological Survey Unit', type: 'field', level: 1, maxLevel: 3, capacity: 6, upgradeCost: 1200, activeProjects: 0, unlocked: false, productivity: 1.4 },
  { name: 'Artifact Authentication Wing', type: 'museum', level: 1, maxLevel: 3, capacity: 15, upgradeCost: 1400, activeProjects: 0, unlocked: false, productivity: 1.3 },
  { name: 'Educational Outreach Hub', type: 'training', level: 1, maxLevel: 3, capacity: 30, upgradeCost: 300, activeProjects: 0, unlocked: false, productivity: 1.6 },
];

const LC_ABILITY_TEMPLATES: Omit<LCAbility, 'id' | 'currentCooldown'>[] = [
  { name: 'Ground Scan', type: 'scan', description: 'Scan the ground for buried artifacts within range.', cooldown: 5, level: 1, maxLevel: 5, unlockLevel: 1, unlocked: true, experience: 0, experienceToNext: 100 },
  { name: 'Artifact Dating', type: 'date', description: 'Determine the age of any discovered artifact.', cooldown: 8, level: 1, maxLevel: 5, unlockLevel: 1, unlocked: true, experience: 0, experienceToNext: 100 },
  { name: 'Language Decipher', type: 'decipher', description: 'Decipher ancient text fragments to reveal lore.', cooldown: 10, level: 1, maxLevel: 5, unlockLevel: 2, unlocked: false, experience: 0, experienceToNext: 150 },
  { name: 'Trap Disarm', type: 'disarm', description: 'Safely disable ancient traps and mechanisms.', cooldown: 6, level: 1, maxLevel: 5, unlockLevel: 2, unlocked: false, experience: 0, experienceToNext: 150 },
  { name: 'Artifact Restoration', type: 'restore', description: 'Restore damaged artifacts to their original state.', cooldown: 15, level: 1, maxLevel: 5, unlockLevel: 3, unlocked: false, experience: 0, experienceToNext: 200 },
  { name: 'Curate Exhibition', type: 'exhibit', description: 'Organize artifacts into compelling exhibitions.', cooldown: 30, level: 1, maxLevel: 5, unlockLevel: 4, unlocked: false, experience: 0, experienceToNext: 250 },
  { name: 'Publish Research', type: 'research', description: 'Write and submit research papers to journals.', cooldown: 60, level: 1, maxLevel: 5, unlockLevel: 5, unlocked: false, experience: 0, experienceToNext: 300 },
  { name: 'Zone Mapping', type: 'map', description: 'Map unexplored sections of the current ruin zone.', cooldown: 20, level: 1, maxLevel: 5, unlockLevel: 1, unlocked: true, experience: 0, experienceToNext: 100 },
  { name: 'Deep Excavation', type: 'scan', description: 'Dig deeper than normal to find rare artifacts.', cooldown: 25, level: 1, maxLevel: 5, unlockLevel: 6, unlocked: false, experience: 0, experienceToNext: 350 },
  { name: 'Curse Ward', type: 'disarm', description: 'Protect yourself from artifact curses.', cooldown: 45, level: 1, maxLevel: 5, unlockLevel: 7, unlocked: false, experience: 0, experienceToNext: 400 },
  { name: 'Ancient Insight', type: 'decipher', description: 'Gain temporary supernatural understanding of ruins.', cooldown: 40, level: 1, maxLevel: 5, unlockLevel: 8, unlocked: false, experience: 0, experienceToNext: 450 },
  { name: 'Rapid Restoration', type: 'restore', description: 'Restore artifacts at twice the normal speed.', cooldown: 20, level: 1, maxLevel: 5, unlockLevel: 9, unlocked: false, experience: 0, experienceToNext: 500 },
  { name: 'Exhibition Mastery', type: 'exhibit', description: 'Create legendary exhibitions with maximum appeal.', cooldown: 50, level: 1, maxLevel: 5, unlockLevel: 10, unlocked: false, experience: 0, experienceToNext: 600 },
  { name: 'Lore Synthesis', type: 'research', description: 'Combine knowledge from multiple artifacts.', cooldown: 35, level: 1, maxLevel: 5, unlockLevel: 11, unlocked: false, experience: 0, experienceToNext: 650 },
  { name: 'Full Site Scan', type: 'map', description: 'Reveal the entire layout of any ruin zone.', cooldown: 60, level: 1, maxLevel: 5, unlockLevel: 12, unlocked: false, experience: 0, experienceToNext: 700 },
  { name: 'Material Analysis', type: 'date', description: 'Determine the exact composition of any artifact.', cooldown: 12, level: 1, maxLevel: 5, unlockLevel: 3, unlocked: false, experience: 0, experienceToNext: 200 },
  { name: 'Resonance Detection', type: 'scan', description: 'Find artifacts by their magical resonance signature.', cooldown: 30, level: 1, maxLevel: 5, unlockLevel: 5, unlocked: false, experience: 0, experienceToNext: 300 },
  { name: 'Trap Prediction', type: 'disarm', description: 'Predict trap locations before triggering them.', cooldown: 15, level: 1, maxLevel: 5, unlockLevel: 4, unlocked: false, experience: 0, experienceToNext: 250 },
  { name: 'Enchant Restoration', type: 'restore', description: 'Add magical preservation to restored artifacts.', cooldown: 30, level: 1, maxLevel: 5, unlockLevel: 13, unlocked: false, experience: 0, experienceToNext: 800 },
  { name: 'Scholarly Network', type: 'research', description: 'Access knowledge from archaeologists worldwide.', cooldown: 20, level: 1, maxLevel: 5, unlockLevel: 6, unlocked: false, experience: 0, experienceToNext: 350 },
  { name: 'Emergency Evacuation', type: 'disarm', description: 'Quickly escape from collapsing ruins.', cooldown: 120, level: 1, maxLevel: 3, unlockLevel: 14, unlocked: false, experience: 0, experienceToNext: 900 },
  { name: 'Master Deciphering', type: 'decipher', description: 'Instantly translate any ancient language.', cooldown: 15, level: 1, maxLevel: 5, unlockLevel: 15, unlocked: false, experience: 0, experienceToNext: 1000 },
];

const LC_ACHIEVEMENT_TEMPLATES: Omit<LCAchievement, 'id' | 'progress'>[] = [
  { name: 'First Find', description: 'Discover your first artifact.', condition: 'excavate_1', target: 1, completed: false, rewardCoins: 100, rewardXP: 50 },
  { name: 'Treasure Hunter', description: 'Discover 10 artifacts.', condition: 'excavate_10', target: 10, completed: false, rewardCoins: 500, rewardXP: 200 },
  { name: 'Hoarder of Antiquities', description: 'Discover 50 artifacts.', condition: 'excavate_50', target: 50, completed: false, rewardCoins: 2000, rewardXP: 1000 },
  { name: 'Master Restorer', description: 'Restore 25 artifacts to their former glory.', condition: 'restore_25', target: 25, completed: false, rewardCoins: 1500, rewardXP: 800 },
  { name: 'Puzzle Solver', description: 'Solve 15 ancient puzzles.', condition: 'puzzles_15', target: 15, completed: false, rewardCoins: 800, rewardXP: 400 },
  { name: 'Trap Expert', description: 'Disarm 20 ancient traps.', condition: 'traps_20', target: 20, completed: false, rewardCoins: 1000, rewardXP: 500 },
  { name: 'Published Scholar', description: 'Publish 5 research papers.', condition: 'publish_5', target: 5, completed: false, rewardCoins: 1200, rewardXP: 600 },
  { name: 'Exhibition Curator', description: 'Host 3 successful exhibitions.', condition: 'exhibit_3', target: 3, completed: false, rewardCoins: 1500, rewardXP: 700 },
  { name: 'Zone Pioneer', description: 'Explore all 8 ruin zones.', condition: 'zones_all', target: 8, completed: false, rewardCoins: 3000, rewardXP: 1500 },
  { name: 'Legendary Find', description: 'Discover a legendary-tier artifact.', condition: 'legendary_1', target: 1, completed: false, rewardCoins: 5000, rewardXP: 2500 },
  { name: 'Curse Breaker', description: 'Survive 5 cursed artifact events.', condition: 'curses_5', target: 5, completed: false, rewardCoins: 2000, rewardXP: 1000 },
  { name: 'Language Master', description: 'Learn 80% of the ancient language.', condition: 'language_80', target: 80, completed: false, rewardCoins: 2500, rewardXP: 1200 },
  { name: 'Cartographer', description: 'Reveal 100% of the world map.', condition: 'map_100', target: 100, completed: false, rewardCoins: 2000, rewardXP: 1000 },
  { name: 'Tool Collector', description: 'Own 20 different excavation tools.', condition: 'tools_20', target: 20, completed: false, rewardCoins: 1800, rewardXP: 900 },
  { name: 'Facility Mogul', description: 'Unlock and upgrade all research facilities.', condition: 'facilities_all', target: 25, completed: false, rewardCoins: 5000, rewardXP: 2500 },
  { name: 'Streak Master', description: 'Maintain a 7-day excavation streak.', condition: 'streak_7', target: 7, completed: false, rewardCoins: 1000, rewardXP: 500 },
  { name: 'Daily Devotee', description: 'Complete 30 daily excavation quests.', condition: 'dailies_30', target: 30, completed: false, rewardCoins: 1500, rewardXP: 750 },
  { name: 'Profitable Scholar', description: 'Earn 50000 coins from exhibitions.', condition: 'earn_50000', target: 50000, completed: false, rewardCoins: 3000, rewardXP: 1500 },
];

const LC_TITLE_TEMPLATES: Omit<LCTitle, 'id'>[] = [
  { name: 'Amateur Digger', description: 'Every great archaeologist starts somewhere.', requiredAchievements: 1, bonusMultiplier: 1.05, unlocked: false },
  { name: 'Field Researcher', description: 'You have proven your worth in the field.', requiredAchievements: 3, bonusMultiplier: 1.1, unlocked: false },
  { name: 'Site Supervisor', description: 'Leading excavations with confidence.', requiredAchievements: 5, bonusMultiplier: 1.15, unlocked: false },
  { name: 'Artifact Scholar', description: 'Your knowledge of antiquities is impressive.', requiredAchievements: 7, bonusMultiplier: 1.2, unlocked: false },
  { name: 'Senior Archaeologist', description: 'Respected by peers worldwide.', requiredAchievements: 10, bonusMultiplier: 1.3, unlocked: false },
  { name: 'Ruins Master', description: 'No ruin can hide its secrets from you.', requiredAchievements: 12, bonusMultiplier: 1.4, unlocked: false },
  { name: 'Relic Seeker', description: 'You pursue the rarest artifacts with unmatched dedication.', requiredAchievements: 15, bonusMultiplier: 1.5, unlocked: false },
  { name: 'Legendary Archaeologist', description: 'Your name will be remembered alongside the ancients.', requiredAchievements: 18, bonusMultiplier: 2.0, unlocked: false },
];

const LC_DAILY_QUEST_TEMPLATES: Omit<LCDailyQuest, 'id' | 'day' | 'progress' | 'completed' | 'expiresAt'>[] = [
  { description: 'Excavate 3 artifacts from any zone.', target: 3, reward: 300 },
  { description: 'Restore 2 artifacts to exhibition quality.', target: 2, reward: 400 },
  { description: 'Solve 2 ancient puzzles.', target: 2, reward: 350 },
  { description: 'Disarm 3 traps in a single zone.', target: 3, reward: 300 },
  { description: 'Use Ground Scan ability 5 times.', target: 5, reward: 200 },
  { description: 'Explore 30% of a new zone.', target: 30, reward: 500 },
  { description: 'Decipher 3 ancient inscriptions.', target: 3, reward: 400 },
  { description: 'Publish 1 research paper.', target: 1, reward: 600 },
  { description: 'Upgrade any facility by 1 level.', target: 1, reward: 450 },
  { description: 'Survive a cursed artifact event.', target: 1, reward: 500 },
];

const LC_XP_PER_LEVEL = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5000, 6500, 8000, 10000, 12500, 15000];

const LC_TRAP_TYPES: LCTrapType[] = ['pressure_plate', 'poison_dart', 'falling_rocks', 'sand_trap', 'cursed_seal', 'ancient_mechanism'];

const LC_PUZZLE_TYPES: LCPuzzleType[] = ['glyph_sequence', 'pattern_match', 'rune_lock', 'logic_gate', 'memory_test', 'cipher_decode'];

// --- Default State Factory ---

function createDefaultState(): LostCivilizationState {
  const artifacts: LCArtifact[] = LC_ARTIFACT_TEMPLATES.map((t, i) => ({
    ...t,
    id: `artifact_${i + 1}`,
  }));

  const zones: LCRuinZone[] = LC_ZONE_IDS.map((zid, i) => ({
    ...LC_ZONE_TEMPLATES[i],
    id: zid,
    explored: zid === 'temple_sun' ? 10 : 0,
  }));

  const tools: LCExcavationTool[] = LC_TOOL_TEMPLATES.map((t, i) => ({
    ...t,
    id: `tool_${i + 1}`,
    durability: t.maxDurability,
  }));

  const facilities: LCResearchFacility[] = LC_FACILITY_TEMPLATES.map((f, i) => ({
    ...f,
    id: `facility_${i + 1}`,
  }));

  const abilities: LCAbility[] = LC_ABILITY_TEMPLATES.map((a, i) => ({
    ...a,
    id: `ability_${i + 1}`,
    currentCooldown: 0,
  }));

  const achievements: LCAchievement[] = LC_ACHIEVEMENT_TEMPLATES.map((a, i) => ({
    ...a,
    id: `achievement_${i + 1}`,
    progress: 0,
  }));

  const titles: LCTitle[] = LC_TITLE_TEMPLATES.map((t, i) => ({
    ...t,
    id: `title_${i + 1}`,
  }));

  const traps: LCTrap[] = [];
  LC_ZONE_IDS.forEach((zid) => {
    const zone = zones.find((z) => z.id === zid);
    if (zone) {
      for (let i = 0; i < zone.trapsCount; i++) {
        traps.push({
          id: `trap_${zid}_${i + 1}`,
          type: LC_TRAP_TYPES[i % LC_TRAP_TYPES.length],
          zoneId: zid,
          difficulty: Math.floor(Math.random() * 10) + 1,
          disarmed: false,
          disarmProgress: 0,
          disarmCost: 50 + zone.threatLevel * 20,
        });
      }
    }
  });

  const puzzles: LCPuzzle[] = [];
  LC_ZONE_IDS.forEach((zid) => {
    const zone = zones.find((z) => z.id === zid);
    if (zone) {
      for (let i = 0; i < zone.puzzlesCount; i++) {
        puzzles.push({
          id: `puzzle_${zid}_${i + 1}`,
          type: LC_PUZZLE_TYPES[i % LC_PUZZLE_TYPES.length],
          zoneId: zid,
          difficulty: Math.floor(Math.random() * 10) + 1,
          solved: false,
          solveProgress: 0,
          hintUsed: false,
          reward: 100 + zone.depth * 50,
        });
      }
    }
  });

  return {
    coins: 1000,
    xp: 0,
    level: 1,
    currentZoneId: 'temple_sun',
    currentPhase: 'scouting',
    artifacts,
    zones,
    tools,
    facilities,
    abilities,
    achievements,
    titles,
    activeTitleId: '',
    traps,
    puzzles,
    cursedEvents: [],
    dailyQuest: null,
    researchPapers: [],
    exhibitions: [],
    totalExcavated: 0,
    totalRestored: 0,
    totalPuzzlesSolved: 0,
    totalTrapsDisarmed: 0,
    totalPapersPublished: 0,
    totalExhibitionsHosted: 0,
    explorationStreak: 0,
    lastExcavationTime: 0,
    AncientLanguageKnown: 0,
    mapRevealPercent: 5,
    shieldActive: false,
    shieldExpiry: 0,
  };
}

// ============================================================================
// Main Hook
// ============================================================================

export default function useLostCivilization(initialState?: LostCivilizationState) {
  const [state, setState] = useState<LostCivilizationState>(initialState ?? createDefaultState());
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // --- Computed Values ---

  const LC_THEME_COLORS = useMemo(() => ({
    amber: LC_AMBER,
    sand: LC_SAND,
    terracotta: LC_TERRACOTTA,
    gold: LC_GOLD,
    parchment: LC_PARCHMENT,
    stone: LC_STONE,
    darkSoil: LC_DARK_SOIL,
    jade: LC_JADE,
    obsidian: LC_OBSIDIAN,
  }), []);

  const currentZone = useMemo(() => {
    return state.zones.find((z) => z.id === state.currentZoneId) ?? state.zones[0];
  }, [state]);

  const availableArtifacts = useMemo(() => {
    return state.artifacts.filter((a) => a.discoveredAt === 0);
  }, [state]);

  const discoveredArtifacts = useMemo(() => {
    return state.artifacts.filter((a) => a.discoveredAt > 0);
  }, [state]);

  const restoredArtifacts = useMemo(() => {
    return state.artifacts.filter((a) => a.restoredAt !== undefined && a.restoredAt > 0);
  }, [state]);

  const cursedArtifacts = useMemo(() => {
    return state.artifacts.filter((a) => a.cursed);
  }, [state]);

  const activeCurses = useMemo(() => {
    return state.cursedEvents.filter((e) => e.active);
  }, [state]);

  const equippedTools = useMemo(() => {
    return state.tools.filter((t) => t.equipped);
  }, [state]);

  const ownedTools = useMemo(() => {
    return state.tools.filter((t) => t.owned);
  }, [state]);

  const unlockedFacilities = useMemo(() => {
    return state.facilities.filter((f) => f.unlocked);
  }, [state]);

  const lockedFacilities = useMemo(() => {
    return state.facilities.filter((f) => !f.unlocked);
  }, [state]);

  const unlockedAbilities = useMemo(() => {
    return state.abilities.filter((a) => a.unlocked);
  }, [state]);

  const readyAbilities = useMemo(() => {
    return state.abilities.filter((a) => a.unlocked && a.currentCooldown <= 0);
  }, [state]);

  const completedAchievements = useMemo(() => {
    return state.achievements.filter((a) => a.completed);
  }, [state]);

  const incompleteAchievements = useMemo(() => {
    return state.achievements.filter((a) => !a.completed);
  }, [state]);

  const unlockedTitles = useMemo(() => {
    return state.titles.filter((t) => t.unlocked);
  }, [state]);

  const activeTitle = useMemo(() => {
    if (!state.activeTitleId) return null;
    return state.titles.find((t) => t.id === state.activeTitleId) ?? null;
  }, [state]);

  const activeTitleMultiplier = useMemo(() => {
    if (!activeTitle) return 1;
    return activeTitle.bonusMultiplier;
  }, [activeTitle]);

  const zoneTraps = useMemo(() => {
    return state.traps.filter((t) => t.zoneId === state.currentZoneId);
  }, [state]);

  const undisarmedTraps = useMemo(() => {
    return zoneTraps.filter((t) => !t.disarmed);
  }, [zoneTraps]);

  const zonePuzzles = useMemo(() => {
    return state.puzzles.filter((p) => p.zoneId === state.currentZoneId);
  }, [state]);

  const unsolvedPuzzles = useMemo(() => {
    return zonePuzzles.filter((p) => !p.solved);
  }, [zonePuzzles]);

  const excavationEfficiency = useMemo(() => {
    let base = 1;
    equippedTools.forEach((t) => {
      base += t.efficiency * 0.2;
    });
    base *= activeTitleMultiplier;
    return Math.round(base * 100) / 100;
  }, [equippedTools, activeTitleMultiplier]);

  const totalArtifactsCount = useMemo(() => {
    return state.artifacts.length;
  }, [state]);

  const discoveryPercent = useMemo(() => {
    return Math.round((discoveredArtifacts.length / totalArtifactsCount) * 100);
  }, [discoveredArtifacts, totalArtifactsCount]);

  const restorationPercent = useMemo(() => {
    if (discoveredArtifacts.length === 0) return 0;
    return Math.round((restoredArtifacts.length / discoveredArtifacts.length) * 100);
  }, [discoveredArtifacts, restoredArtifacts]);

  const xpToNextLevel = useMemo(() => {
    if (state.level >= LC_XP_PER_LEVEL.length) return LC_XP_PER_LEVEL[LC_XP_PER_LEVEL.length - 1];
    return LC_XP_PER_LEVEL[state.level];
  }, [state]);

  const xpProgress = useMemo(() => {
    return xpToNextLevel > 0 ? Math.min(state.xp / xpToNextLevel, 1) : 1;
  }, [state, xpToNextLevel]);

  const isMaxLevel = useMemo(() => {
    return state.level >= LC_XP_PER_LEVEL.length;
  }, [state]);

  const explorationCompletion = useMemo(() => {
    if (!currentZone) return 0;
    return Math.round((currentZone.explored / currentZone.maxExplored) * 100);
  }, [currentZone]);

  const totalZoneCompletion = useMemo(() => {
    const total = state.zones.reduce((sum, z) => sum + z.explored, 0);
    const max = state.zones.reduce((sum, z) => sum + z.maxExplored, 0);
    return max > 0 ? Math.round((total / max) * 100) : 0;
  }, [state]);

  const unlockedZoneCount = useMemo(() => {
    return state.zones.filter((z) => z.explored > 0).length;
  }, [state]);

  const artifactsByRarity = useMemo(() => {
    const result: Record<LCRarityTier, LCArtifact[]> = { common: [], uncommon: [], rare: [], epic: [], legendary: [] };
    state.artifacts.forEach((a) => result[a.rarity].push(a));
    return result;
  }, [state]);

  const artifactsByZone = useMemo(() => {
    const result: Record<string, LCArtifact[]> = {};
    state.zones.forEach((z) => { result[z.id] = []; });
    state.artifacts.forEach((a) => {
      if (!result[a.zoneId]) result[a.zoneId] = [];
      result[a.zoneId].push(a);
    });
    return result;
  }, [state]);

  const facilitiesByType = useMemo(() => {
    const result: Record<LCFacilityType, LCResearchFacility[]> = { field: [], lab: [], museum: [], restoration: [], archive: [], training: [], storage: [], exhibition: [] };
    state.facilities.forEach((f) => result[f.type].push(f));
    return result;
  }, [state]);

  const abilitiesByType = useMemo(() => {
    const result: Record<LCAbilityType, LCAbility[]> = { scan: [], date: [], decipher: [], disarm: [], restore: [], exhibit: [], research: [], map: [] };
    state.abilities.forEach((a) => result[a.type].push(a));
    return result;
  }, [state]);

  const totalEarnedFromExhibitions = useMemo(() => {
    return state.exhibitions.reduce((sum, e) => sum + e.revenue, 0);
  }, [state]);

  const publishedPapers = useMemo(() => {
    return state.researchPapers.filter((p) => p.status === 'published');
  }, [state]);

  const isDailyQuestActive = useMemo(() => {
    return state.dailyQuest !== null && !state.dailyQuest.completed && state.dailyQuest.expiresAt > Date.now();
  }, [state]);

  const dailyQuestProgress = useMemo(() => {
    if (!state.dailyQuest) return 0;
    return Math.round((state.dailyQuest.progress / state.dailyQuest.target) * 100);
  }, [state]);

  const isShieldActive = useMemo(() => {
    return state.shieldActive && state.shieldExpiry > Date.now();
  }, [state]);

  const streakBonus = useMemo(() => {
    return 1 + Math.min(state.explorationStreak * 0.05, 0.5);
  }, [state]);

  const overallScore = useMemo(() => {
    return Math.floor(
      state.totalExcavated * 10 +
      state.totalRestored * 25 +
      state.totalPuzzlesSolved * 30 +
      state.totalTrapsDisarmed * 20 +
      state.totalPapersPublished * 50 +
      state.totalExhibitionsHosted * 100 +
      completedAchievements.length * 200 +
      state.level * 500
    );
  }, [state, completedAchievements]);

  // --- Core Actions ---

  const LC_excavateArtifact = useCallback(() => {
    setState((prev) => {
      const undisc = prev.artifacts.filter((a) => a.discoveredAt === 0 && a.zoneId === prev.currentZoneId);
      if (undisc.length === 0) return prev;
      const efficiency = excavationEfficiency;
      const deeper = Math.random() < efficiency * 0.3;
      const candidates = deeper ? undisc : undisc.filter((a) => a.depth <= 5);
      const pool = candidates.length > 0 ? candidates : undisc;
      const chosen = pool[Math.floor(Math.random() * pool.length)];
      const value = Math.floor(chosen.ancientValue * LC_RARITY_MULTIPLIERS[chosen.rarity] * streakBonus);
      const newArtifacts = prev.artifacts.map((a) =>
        a.id === chosen.id ? { ...a, discoveredAt: Date.now() } : a
      );
      const xpGain = Math.floor(value * 0.1);
      return {
        ...prev,
        artifacts: newArtifacts,
        coins: prev.coins + value,
        xp: prev.xp + xpGain,
        totalExcavated: prev.totalExcavated + 1,
        dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Excavate')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest,
      };
    });
  }, [excavationEfficiency, streakBonus]);

  const LC_restoreArtifact = useCallback((artifactId: string) => {
    setState((prev) => {
      const artifact = prev.artifacts.find((a) => a.id === artifactId);
      if (!artifact || artifact.discoveredAt === 0 || artifact.restoredAt) return prev;
      if (prev.coins < artifact.restorationCost) return prev;
      return {
        ...prev,
        coins: prev.coins - artifact.restorationCost,
        xp: prev.xp + Math.floor(artifact.restorationCost * 0.2),
        artifacts: prev.artifacts.map((a) =>
          a.id === artifactId ? { ...a, restoredAt: Date.now() } : a
        ),
        totalRestored: prev.totalRestored + 1,
        dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Restore')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest,
      };
    });
  }, []);

  const LC_setCurrentZone = useCallback((zoneId: string) => {
    setState((prev) => {
      const zone = prev.zones.find((z) => z.id === zoneId);
      if (!zone || zone.unlockCost > 0 && zone.explored === 0 && prev.coins < zone.unlockCost) return prev;
      const newCoins = zone.explored === 0 ? prev.coins - zone.unlockCost : prev.coins;
      return { ...prev, currentZoneId: zoneId, coins: newCoins };
    });
  }, []);

  const LC_setPhase = useCallback((phase: LCExplorationPhase) => {
    setState((prev) => ({ ...prev, currentPhase: phase }));
  }, []);

  const LC_exploreZone = useCallback((amount: number) => {
    setState((prev) => {
      const zone = prev.zones.find((z) => z.id === prev.currentZoneId);
      if (!zone) return prev;
      const newExplored = Math.min(zone.explored + amount, zone.maxExplored);
      const xpGain = Math.floor(amount * 2);
      return {
        ...prev,
        zones: prev.zones.map((z) =>
          z.id === prev.currentZoneId ? { ...z, explored: newExplored } : z
        ),
        xp: prev.xp + xpGain,
        mapRevealPercent: Math.min(prev.mapRevealPercent + amount * 0.1, 100),
      };
    });
  }, []);

  const LC_buyTool = useCallback((toolId: string) => {
    setState((prev) => {
      const tool = prev.tools.find((t) => t.id === toolId);
      if (!tool || tool.owned || prev.coins < tool.cost) return prev;
      return {
        ...prev,
        coins: prev.coins - tool.cost,
        tools: prev.tools.map((t) =>
          t.id === toolId ? { ...t, owned: true } : t
        ),
      };
    });
  }, []);

  const LC_equipTool = useCallback((toolId: string) => {
    setState((prev) => {
      return {
        ...prev,
        tools: prev.tools.map((t) =>
          t.id === toolId ? { ...t, equipped: !t.equipped } : t
        ),
      };
    });
  }, []);

  const LC_repairTool = useCallback((toolId: string) => {
    setState((prev) => {
      const tool = prev.tools.find((t) => t.id === toolId);
      if (!tool) return prev;
      const repairCost = Math.floor((tool.maxDurability - tool.durability) * 2);
      if (prev.coins < repairCost) return prev;
      return {
        ...prev,
        coins: prev.coins - repairCost,
        tools: prev.tools.map((t) =>
          t.id === toolId ? { ...t, durability: t.maxDurability } : t
        ),
      };
    });
  }, []);

  const LC_useTool = useCallback((toolId: string) => {
    setState((prev) => {
      const tool = prev.tools.find((t) => t.id === toolId);
      if (!tool || !tool.equipped || tool.durability <= 0) return prev;
      return {
        ...prev,
        tools: prev.tools.map((t) =>
          t.id === toolId ? { ...t, durability: Math.max(0, t.durability - 1) } : t
        ),
      };
    });
  }, []);

  const LC_upgradeFacility = useCallback((facilityId: string) => {
    setState((prev) => {
      const facility = prev.facilities.find((f) => f.id === facilityId);
      if (!facility || !facility.unlocked || facility.level >= facility.maxLevel) return prev;
      if (prev.coins < facility.upgradeCost) return prev;
      return {
        ...prev,
        coins: prev.coins - facility.upgradeCost,
        facilities: prev.facilities.map((f) =>
          f.id === facilityId
            ? { ...f, level: f.level + 1, upgradeCost: Math.floor(f.upgradeCost * 1.8), productivity: +(f.productivity * 1.3).toFixed(2) }
            : f
        ),
        dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Upgrade')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest,
      };
    });
  }, []);

  const LC_unlockFacility = useCallback((facilityId: string) => {
    setState((prev) => {
      const facility = prev.facilities.find((f) => f.id === facilityId);
      if (!facility || facility.unlocked) return prev;
      if (prev.coins < facility.upgradeCost) return prev;
      return {
        ...prev,
        coins: prev.coins - facility.upgradeCost,
        facilities: prev.facilities.map((f) =>
          f.id === facilityId ? { ...f, unlocked: true } : f
        ),
      };
    });
  }, []);

  const LC_useAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities.find((a) => a.id === abilityId);
      if (!ability || !ability.unlocked || ability.currentCooldown > 0) return prev;
      const xpGain = ability.level * 10;
      const newAbilities = prev.abilities.map((a) =>
        a.id === abilityId
          ? { ...a, currentCooldown: a.cooldown, experience: a.experience + xpGain }
          : a
      );
      let updated = { ...prev, abilities: newAbilities, xp: prev.xp + xpGain };
      if (ability.type === 'scan') {
        updated = { ...updated, mapRevealPercent: Math.min(prev.mapRevealPercent + 2, 100) };
      }
      if (ability.type === 'decipher') {
        updated = { ...updated, AncientLanguageKnown: Math.min(prev.AncientLanguageKnown + 3, 100) };
      }
      if (ability.type === 'map') {
        updated = { ...updated, mapRevealPercent: Math.min(prev.mapRevealPercent + 5, 100) };
      }
      if (ability.type === 'disarm') {
        updated = { ...updated, dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Disarm')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest };
      }
      return updated;
    });
  }, []);

  const LC_unlockAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities.find((a) => a.id === abilityId);
      if (!ability || ability.unlocked || prev.level < ability.unlockLevel) return prev;
      return {
        ...prev,
        abilities: prev.abilities.map((a) =>
          a.id === abilityId ? { ...a, unlocked: true } : a
        ),
      };
    });
  }, []);

  const LC_levelUpAbility = useCallback((abilityId: string) => {
    setState((prev) => {
      const ability = prev.abilities.find((a) => a.id === abilityId);
      if (!ability || !ability.unlocked || ability.level >= ability.maxLevel) return prev;
      if (ability.experience < ability.experienceToNext) return prev;
      return {
        ...prev,
        abilities: prev.abilities.map((a) =>
          a.id === abilityId
            ? { ...a, level: a.level + 1, experience: 0, experienceToNext: Math.floor(a.experienceToNext * 1.5) }
            : a
        ),
      };
    });
  }, []);

  const LC_disarmTrap = useCallback((trapId: string) => {
    setState((prev) => {
      const trap = prev.traps.find((t) => t.id === trapId);
      if (!trap || trap.disarmed) return prev;
      return {
        ...prev,
        coins: prev.coins + trap.disarmCost,
        xp: prev.xp + trap.difficulty * 15,
        traps: prev.traps.map((t) =>
          t.id === trapId ? { ...t, disarmed: true, disarmProgress: 100 } : t
        ),
        totalTrapsDisarmed: prev.totalTrapsDisarmed + 1,
      };
    });
  }, []);

  const LC_progressTrap = useCallback((trapId: string, amount: number) => {
    setState((prev) => {
      const trap = prev.traps.find((t) => t.id === trapId);
      if (!trap || trap.disarmed) return prev;
      const newProgress = Math.min(trap.disarmProgress + amount, 100);
      return {
        ...prev,
        traps: prev.traps.map((t) =>
          t.id === trapId ? { ...t, disarmProgress: newProgress, disarmed: newProgress >= 100 } : t
        ),
        totalTrapsDisarmed: prev.totalTrapsDisarmed + (newProgress >= 100 && trap.disarmProgress < 100 ? 1 : 0),
        xp: prev.xp + amount,
      };
    });
  }, []);

  const LC_solvePuzzle = useCallback((puzzleId: string) => {
    setState((prev) => {
      const puzzle = prev.puzzles.find((p) => p.id === puzzleId);
      if (!puzzle || puzzle.solved) return prev;
      return {
        ...prev,
        coins: prev.coins + puzzle.reward,
        xp: prev.xp + puzzle.difficulty * 20,
        puzzles: prev.puzzles.map((p) =>
          p.id === puzzleId ? { ...p, solved: true, solveProgress: 100 } : p
        ),
        totalPuzzlesSolved: prev.totalPuzzlesSolved + 1,
        dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Solve')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest,
      };
    });
  }, []);

  const LC_progressPuzzle = useCallback((puzzleId: string, amount: number) => {
    setState((prev) => {
      const puzzle = prev.puzzles.find((p) => p.id === puzzleId);
      if (!puzzle || puzzle.solved) return prev;
      const newProgress = Math.min(puzzle.solveProgress + amount, 100);
      return {
        ...prev,
        puzzles: prev.puzzles.map((p) =>
          p.id === puzzleId ? { ...p, solveProgress: newProgress } : p
        ),
        xp: prev.xp + Math.floor(amount * 0.5),
      };
    });
  }, []);

  const LC_useHintOnPuzzle = useCallback((puzzleId: string) => {
    setState((prev) => {
      const puzzle = prev.puzzles.find((p) => p.id === puzzleId);
      if (!puzzle || puzzle.solved || puzzle.hintUsed) return prev;
      if (prev.coins < 50) return prev;
      return {
        ...prev,
        coins: prev.coins - 50,
        puzzles: prev.puzzles.map((p) =>
          p.id === puzzleId ? { ...p, hintUsed: true, solveProgress: Math.min(p.solveProgress + 30, 100) } : p
        ),
      };
    });
  }, []);

  const LC_activateCurse = useCallback((artifactId: string) => {
    setState((prev) => {
      const artifact = prev.artifacts.find((a) => a.id === artifactId);
      if (!artifact || !artifact.cursed) return prev;
      if (prev.shieldActive && prev.shieldExpiry > Date.now()) return prev;
      const cursedEvent: LCCursedEvent = {
        id: `curse_${Date.now()}`,
        artifactId,
        description: artifact.curseEffect ?? 'Unknown curse activated!',
        severity: LC_RARITY_MULTIPLIERS[artifact.rarity],
        active: true,
        startedAt: Date.now(),
        duration: 3600000,
        penalty: 'Coins halved temporarily',
      };
      return {
        ...prev,
        cursedEvents: [...prev.cursedEvents, cursedEvent],
        coins: Math.floor(prev.coins * 0.5),
      };
    });
  }, []);

  const LC_resolveCurse = useCallback((cursedEventId: string) => {
    setState((prev) => {
      const cost = 500;
      if (prev.coins < cost) return prev;
      return {
        ...prev,
        coins: prev.coins - cost,
        cursedEvents: prev.cursedEvents.map((e) =>
          e.id === cursedEventId ? { ...e, active: false } : e
        ),
      };
    });
  }, []);

  const LC_purgeExpiredCurses = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      const updated = prev.cursedEvents.map((e) => {
        if (e.active && now - e.startedAt > e.duration) {
          return { ...e, active: false };
        }
        return e;
      });
      return { ...prev, cursedEvents: updated };
    });
  }, []);

  const LC_activateShield = useCallback((duration: number) => {
    setState((prev) => ({
      ...prev,
      shieldActive: true,
      shieldExpiry: Date.now() + duration,
    }));
  }, []);

  const LC_createResearchPaper = useCallback((title: string, topic: string) => {
    setState((prev) => {
      if (prev.coins < 200) return prev;
      const paper: LCResearchPaper = {
        id: `paper_${Date.now()}`,
        title,
        topic,
        quality: Math.floor(Math.random() * 50) + 50,
        status: 'draft',
        citations: 0,
        rewardXP: 300,
        rewardCoins: 500,
      };
      return {
        ...prev,
        coins: prev.coins - 200,
        researchPapers: [...prev.researchPapers, paper],
      };
    });
  }, []);

  const LC_submitPaper = useCallback((paperId: string) => {
    setState((prev) => ({
      ...prev,
      researchPapers: prev.researchPapers.map((p) =>
        p.id === paperId ? { ...p, status: 'submitted' as const } : p
      ),
    }));
  }, []);

  const LC_peerReviewPaper = useCallback((paperId: string) => {
    setState((prev) => ({
      ...prev,
      researchPapers: prev.researchPapers.map((p) =>
        p.id === paperId ? { ...p, status: 'peer_review' as const } : p
      ),
    }));
  }, []);

  const LC_publishPaper = useCallback((paperId: string) => {
    setState((prev) => {
      const paper = prev.researchPapers.find((p) => p.id === paperId);
      if (!paper) return prev;
      return {
        ...prev,
        coins: prev.coins + paper.rewardCoins,
        xp: prev.xp + paper.rewardXP,
        researchPapers: prev.researchPapers.map((p) =>
          p.id === paperId ? { ...p, status: 'published' as const, publishedAt: Date.now(), citations: Math.floor(Math.random() * 20) + 1 } : p
        ),
        totalPapersPublished: prev.totalPapersPublished + 1,
        dailyQuest: prev.dailyQuest && prev.dailyQuest.description.includes('Publish')
          ? { ...prev.dailyQuest, progress: prev.dailyQuest.progress + 1 }
          : prev.dailyQuest,
      };
    });
  }, []);

  const LC_rejectPaper = useCallback((paperId: string) => {
    setState((prev) => ({
      ...prev,
      researchPapers: prev.researchPapers.map((p) =>
        p.id === paperId ? { ...p, status: 'rejected' as const } : p
      ),
    }));
  }, []);

  const LC_addCitation = useCallback((paperId: string) => {
    setState((prev) => ({
      ...prev,
      researchPapers: prev.researchPapers.map((p) =>
        p.id === paperId ? { ...p, citations: p.citations + 1 } : p
      ),
    }));
  }, []);

  const LC_hostExhibition = useCallback((name: string, theme: string, artifactIds: string[], duration: number) => {
    setState((prev) => {
      const validIds = artifactIds.filter((id) => {
        const a = prev.artifacts.find((ar) => ar.id === id);
        return a && a.restoredAt;
      });
      if (validIds.length === 0) return prev;
      if (prev.coins < 300) return prev;
      const exhibition: LCExhibition = {
        id: `exhibit_${Date.now()}`,
        name,
        theme,
        artifacts: validIds,
        visitors: 0,
        rating: 0,
        revenue: 0,
        active: true,
        startedAt: Date.now(),
        duration,
      };
      return {
        ...prev,
        coins: prev.coins - 300,
        exhibitions: [...prev.exhibitions, exhibition],
        totalExhibitionsHosted: prev.totalExhibitionsHosted + 1,
      };
    });
  }, []);

  const LC_updateExhibitionVisitors = useCallback((exhibitionId: string, visitors: number) => {
    setState((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.map((e) =>
        e.id === exhibitionId ? { ...e, visitors: e.visitors + visitors } : e
      ),
    }));
  }, []);

  const LC_rateExhibition = useCallback((exhibitionId: string, rating: number) => {
    setState((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.map((e) =>
        e.id === exhibitionId ? { ...e, rating: Math.min(Math.max((e.rating + rating) / 2, 0), 5) } : e
      ),
    }));
  }, []);

  const LC_collectExhibitionRevenue = useCallback((exhibitionId: string) => {
    setState((prev) => {
      const exhibition = prev.exhibitions.find((e) => e.id === exhibitionId);
      if (!exhibition) return prev;
      const revenue = Math.floor(exhibition.visitors * exhibition.rating * 10);
      return {
        ...prev,
        coins: prev.coins + revenue,
        exhibitions: prev.exhibitions.map((e) =>
          e.id === exhibitionId ? { ...e, revenue: e.revenue + revenue, visitors: 0 } : e
        ),
      };
    });
  }, []);

  const LC_endExhibition = useCallback((exhibitionId: string) => {
    setState((prev) => ({
      ...prev,
      exhibitions: prev.exhibitions.map((e) =>
        e.id === exhibitionId ? { ...e, active: false } : e
      ),
    }));
  }, []);

  const LC_generateDailyQuest = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      if (prev.dailyQuest && prev.dailyQuest.expiresAt > now && !prev.dailyQuest.completed) return prev;
      const template = LC_DAILY_QUEST_TEMPLATES[Math.floor(Math.random() * LC_DAILY_QUEST_TEMPLATES.length)];
      const quest: LCDailyQuest = {
        id: `daily_${now}`,
        day: Math.floor(now / 86400000),
        ...template,
        progress: 0,
        completed: false,
        expiresAt: now + 86400000,
      };
      return { ...prev, dailyQuest: quest };
    });
  }, []);

  const LC_completeDailyQuest = useCallback(() => {
    setState((prev) => {
      if (!prev.dailyQuest || prev.dailyQuest.completed) return prev;
      if (prev.dailyQuest.progress < prev.dailyQuest.target) return prev;
      return {
        ...prev,
        coins: prev.coins + prev.dailyQuest.reward,
        xp: prev.xp + Math.floor(prev.dailyQuest.reward * 0.5),
        dailyQuest: { ...prev.dailyQuest, completed: true },
      };
    });
  }, []);

  const LC_updateStreak = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      const lastDay = Math.floor(prev.lastExcavationTime / 86400000);
      const today = Math.floor(now / 86400000);
      if (today === lastDay) return prev;
      const newStreak = today === lastDay + 1 ? prev.explorationStreak + 1 : 1;
      return {
        ...prev,
        explorationStreak: newStreak,
        lastExcavationTime: now,
      };
    });
  }, []);

  const LC_checkAchievement = useCallback((condition: string, increment: number) => {
    setState((prev) => {
      const achievement = prev.achievements.find((a) => a.condition === condition);
      if (!achievement || achievement.completed) return prev;
      const newProgress = Math.min(achievement.progress + increment, achievement.target);
      const completed = newProgress >= achievement.target;
      const newAchievements = prev.achievements.map((a) =>
        a.id === achievement.id
          ? { ...a, progress: newProgress, completed, unlockedAt: completed ? Date.now() : undefined }
          : a
      );
      if (completed) {
        return {
          ...prev,
          achievements: newAchievements,
          coins: prev.coins + achievement.rewardCoins,
          xp: prev.xp + achievement.rewardXP,
        };
      }
      return { ...prev, achievements: newAchievements };
    });
  }, []);

  const LC_checkTitleUnlock = useCallback(() => {
    setState((prev) => {
      const completedCount = prev.achievements.filter((a) => a.completed).length;
      let updatedTitles = prev.titles;
      let updated = prev;
      prev.titles.forEach((title) => {
        if (!title.unlocked && completedCount >= title.requiredAchievements) {
          updatedTitles = updatedTitles.map((t) =>
            t.id === title.id ? { ...t, unlocked: true, unlockedAt: Date.now() } : t
          );
        }
      });
      return { ...updated, titles: updatedTitles };
    });
  }, []);

  const LC_setActiveTitle = useCallback((titleId: string) => {
    setState((prev) => {
      const title = prev.titles.find((t) => t.id === titleId);
      if (!title || !title.unlocked) return prev;
      return { ...prev, activeTitleId: titleId };
    });
  }, []);

  const LC_checkLevelUp = useCallback(() => {
    setState((prev) => {
      if (prev.level >= LC_XP_PER_LEVEL.length) return prev;
      const needed = LC_XP_PER_LEVEL[prev.level];
      if (prev.xp < needed) return prev;
      return {
        ...prev,
        level: prev.level + 1,
        xp: prev.xp - needed,
      };
    });
  }, []);

  const LC_spendCoins = useCallback((amount: number) => {
    setState((prev) => {
      if (prev.coins < amount) return prev;
      return { ...prev, coins: prev.coins - amount };
    });
  }, []);

  const LC_earnCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + Math.floor(amount * activeTitleMultiplier),
    }));
  }, [activeTitleMultiplier]);

  const LC_addXP = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      xp: prev.xp + Math.floor(amount * activeTitleMultiplier),
    }));
  }, [activeTitleMultiplier]);

  const LC_tickCooldowns = useCallback(() => {
    setState((prev) => ({
      ...prev,
      abilities: prev.abilities.map((a) => ({
        ...a,
        currentCooldown: Math.max(0, a.currentCooldown - 1),
      })),
    }));
  }, []);

  const LC_tickExhibitions = useCallback(() => {
    setState((prev) => {
      const now = Date.now();
      return {
        ...prev,
        exhibitions: prev.exhibitions.map((e) => {
          if (!e.active || !e.startedAt) return e;
          if (now - e.startedAt > e.duration) {
            return { ...e, active: false };
          }
          return e;
        }),
      };
    });
  }, []);

  const LC_resetState = useCallback(() => {
    setState(createDefaultState());
  }, []);

  const LC_loadState = useCallback((newState: LostCivilizationState) => {
    setState(newState);
  }, []);

  // --- Query Functions ---

  const LC_getArtifactById = useCallback((id: string) => {
    return stateRef.current.artifacts.find((a) => a.id === id) ?? null;
  }, []);

  const LC_getZoneById = useCallback((id: string) => {
    return stateRef.current.zones.find((z) => z.id === id) ?? null;
  }, []);

  const LC_getToolById = useCallback((id: string) => {
    return stateRef.current.tools.find((t) => t.id === id) ?? null;
  }, []);

  const LC_getFacilityById = useCallback((id: string) => {
    return stateRef.current.facilities.find((f) => f.id === id) ?? null;
  }, []);

  const LC_getAbilityById = useCallback((id: string) => {
    return stateRef.current.abilities.find((a) => a.id === id) ?? null;
  }, []);

  const LC_getAchievementById = useCallback((id: string) => {
    return stateRef.current.achievements.find((a) => a.id === id) ?? null;
  }, []);

  const LC_getTitleById = useCallback((id: string) => {
    return stateRef.current.titles.find((t) => t.id === id) ?? null;
  }, []);

  const LC_getTrapById = useCallback((id: string) => {
    return stateRef.current.traps.find((t) => t.id === id) ?? null;
  }, []);

  const LC_getPuzzleById = useCallback((id: string) => {
    return stateRef.current.puzzles.find((p) => p.id === id) ?? null;
  }, []);

  const LC_getCursedEventById = useCallback((id: string) => {
    return stateRef.current.cursedEvents.find((e) => e.id === id) ?? null;
  }, []);

  const LC_getPaperById = useCallback((id: string) => {
    return stateRef.current.researchPapers.find((p) => p.id === id) ?? null;
  }, []);

  const LC_getExhibitionById = useCallback((id: string) => {
    return stateRef.current.exhibitions.find((e) => e.id === id) ?? null;
  }, []);

  const LC_getArtifactsByZone = useCallback((zoneId: string) => {
    return stateRef.current.artifacts.filter((a) => a.zoneId === zoneId);
  }, []);

  const LC_getArtifactsByRarity = useCallback((rarity: LCRarityTier) => {
    return stateRef.current.artifacts.filter((a) => a.rarity === rarity);
  }, []);

  const LC_getTrapsByZone = useCallback((zoneId: string) => {
    return stateRef.current.traps.filter((t) => t.zoneId === zoneId);
  }, []);

  const LC_getPuzzlesByZone = useCallback((zoneId: string) => {
    return stateRef.current.puzzles.filter((p) => p.zoneId === zoneId);
  }, []);

  const LC_getTrapsByType = useCallback((type: LCTrapType) => {
    return stateRef.current.traps.filter((t) => t.type === type);
  }, []);

  const LC_getPuzzlesByType = useCallback((type: LCPuzzleType) => {
    return stateRef.current.puzzles.filter((p) => p.type === type);
  }, []);

  const LC_getFacilitiesByType = useCallback((type: LCFacilityType) => {
    return stateRef.current.facilities.filter((f) => f.type === type);
  }, []);

  const LC_getAbilitiesByType = useCallback((type: LCAbilityType) => {
    return stateRef.current.abilities.filter((a) => a.type === type);
  }, []);

  const LC_getPapersByStatus = useCallback((status: LCResearchPaper['status']) => {
    return stateRef.current.researchPapers.filter((p) => p.status === status);
  }, []);

  const LC_getActiveExhibitions = useCallback(() => {
    return stateRef.current.exhibitions.filter((e) => e.active);
  }, []);

  const LC_getEndedExhibitions = useCallback(() => {
    return stateRef.current.exhibitions.filter((e) => !e.active);
  }, []);

  const LC_getToolTierName = useCallback((tier: number) => {
    return LC_TIER_NAMES[Math.min(tier - 1, LC_TIER_NAMES.length - 1)] ?? 'Unknown';
  }, []);

  const LC_getRarityColor = useCallback((rarity: LCRarityTier) => {
    return LC_RARITY_COLORS[rarity] ?? '#9CA3AF';
  }, []);

  const LC_getPhaseColor = useCallback((phase: LCExplorationPhase) => {
    return LC_PHASE_COLORS[phase] ?? LC_AMBER;
  }, []);

  const LC_getRarityMultiplier = useCallback((rarity: LCRarityTier) => {
    return LC_RARITY_MULTIPLIERS[rarity] ?? 1;
  }, []);

  const LC_canAfford = useCallback((cost: number) => {
    return stateRef.current.coins >= cost;
  }, []);

  const LC_canExcavate = useCallback(() => {
    const s = stateRef.current;
    return s.artifacts.some((a) => a.discoveredAt === 0 && a.zoneId === s.currentZoneId);
  }, []);

  const LC_canRestore = useCallback((artifactId: string) => {
    const s = stateRef.current;
    const artifact = s.artifacts.find((a) => a.id === artifactId);
    return !!artifact && artifact.discoveredAt > 0 && !artifact.restoredAt && s.coins >= artifact.restorationCost;
  }, []);

  const LC_canUseAbility = useCallback((abilityId: string) => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    return !!ability && ability.unlocked && ability.currentCooldown <= 0;
  }, []);

  const LC_canDisarmTrap = useCallback((trapId: string) => {
    return stateRef.current.traps.some((t) => t.id === trapId && !t.disarmed);
  }, []);

  const LC_canSolvePuzzle = useCallback((puzzleId: string) => {
    return stateRef.current.puzzles.some((p) => p.id === puzzleId && !p.solved);
  }, []);

  const LC_isArtifactCursed = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    return !!artifact && artifact.cursed;
  }, []);

  const LC_isArtifactRestored = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    return !!artifact && !!artifact.restoredAt;
  }, []);

  const LC_isArtifactDiscovered = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    return !!artifact && artifact.discoveredAt > 0;
  }, []);

  const LC_isZoneUnlocked = useCallback((zoneId: string) => {
    const zone = stateRef.current.zones.find((z) => z.id === zoneId);
    return !!zone && zone.explored > 0;
  }, []);

  const LC_isZoneFullyExplored = useCallback((zoneId: string) => {
    const zone = stateRef.current.zones.find((z) => z.id === zoneId);
    return !!zone && zone.explored >= zone.maxExplored;
  }, []);

  const LC_isFacilityMaxLevel = useCallback((facilityId: string) => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    return !!facility && facility.level >= facility.maxLevel;
  }, []);

  const LC_isAbilityMaxLevel = useCallback((abilityId: string) => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    return !!ability && ability.level >= ability.maxLevel;
  }, []);

  const LC_isAchievementCompleted = useCallback((achievementId: string) => {
    const achievement = stateRef.current.achievements.find((a) => a.id === achievementId);
    return !!achievement && achievement.completed;
  }, []);

  const LC_isTitleUnlocked = useCallback((titleId: string) => {
    const title = stateRef.current.titles.find((t) => t.id === titleId);
    return !!title && title.unlocked;
  }, []);

  const LC_isDailyQuestComplete = useCallback(() => {
    const q = stateRef.current.dailyQuest;
    return !!q && q.completed;
  }, []);

  const LC_isDailyQuestReadyToClaim = useCallback(() => {
    const q = stateRef.current.dailyQuest;
    return !!q && !q.completed && q.progress >= q.target;
  }, []);

  const LC_countArtifactsByRarity = useCallback((rarity: LCRarityTier) => {
    return stateRef.current.artifacts.filter((a) => a.rarity === rarity && a.discoveredAt > 0).length;
  }, []);

  const LC_countTrapsByZone = useCallback((zoneId: string) => {
    return stateRef.current.traps.filter((t) => t.zoneId === zoneId && !t.disarmed).length;
  }, []);

  const LC_countPuzzlesByZone = useCallback((zoneId: string) => {
    return stateRef.current.puzzles.filter((p) => p.zoneId === zoneId && !p.solved).length;
  }, []);

  const LC_countCursedActive = useCallback(() => {
    return stateRef.current.cursedEvents.filter((e) => e.active).length;
  }, []);

  const LC_getHighestRarityFound = useCallback((): LCRarityTier => {
    const rarities: LCRarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
    const found = stateRef.current.artifacts.filter((a) => a.discoveredAt > 0).map((a) => a.rarity);
    for (let i = rarities.length - 1; i >= 0; i--) {
      if (found.includes(rarities[i])) return rarities[i];
    }
    return 'common';
  }, []);

  const LC_getMostExploredZone = useCallback(() => {
    const zones = [...stateRef.current.zones].sort((a, b) => b.explored - a.explored);
    return zones[0] ?? null;
  }, []);

  const LC_getLeastExploredZone = useCallback(() => {
    const zones = [...stateRef.current.zones].sort((a, b) => a.explored - b.explored);
    return zones[0] ?? null;
  }, []);

  const LC_getMostValuableArtifact = useCallback(() => {
    const found = stateRef.current.artifacts.filter((a) => a.discoveredAt > 0);
    if (found.length === 0) return null;
    return found.reduce((best, a) => a.ancientValue > best.ancientValue ? a : best);
  }, []);

  const LC_getMostCitedPaper = useCallback(() => {
    const papers = stateRef.current.researchPapers;
    if (papers.length === 0) return null;
    return papers.reduce((best, p) => p.citations > best.citations ? p : best);
  }, []);

  const LC_getHighestRatedExhibition = useCallback(() => {
    const active = stateRef.current.exhibitions.filter((e) => e.active);
    if (active.length === 0) return null;
    return active.reduce((best, e) => e.rating > best.rating ? e : best);
  }, []);

  const LC_getZoneDangerLevel = useCallback((zoneId: string) => {
    const zone = stateRef.current.zones.find((z) => z.id === zoneId);
    return zone?.threatLevel ?? 0;
  }, []);

  const LC_getZoneClimate = useCallback((zoneId: string) => {
    const zone = stateRef.current.zones.find((z) => z.id === zoneId);
    return zone?.climate ?? 'Unknown';
  }, []);

  const LC_getZoneHazards = useCallback((zoneId: string) => {
    const zone = stateRef.current.zones.find((z) => z.id === zoneId);
    return zone?.hazards ?? [];
  }, []);

  const LC_getArtifactLore = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    return artifact?.loreText ?? 'No lore available.';
  }, []);

  const LC_getArtifactValue = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    if (!artifact) return 0;
    return Math.floor(artifact.ancientValue * LC_RARITY_MULTIPLIERS[artifact.rarity]);
  }, []);

  const LC_getRestorationCost = useCallback((artifactId: string) => {
    const artifact = stateRef.current.artifacts.find((a) => a.id === artifactId);
    return artifact?.restorationCost ?? 0;
  }, []);

  const LC_getToolEfficiency = useCallback((toolId: string) => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId);
    return tool?.efficiency ?? 0;
  }, []);

  const LC_getToolDurabilityPercent = useCallback((toolId: string) => {
    const tool = stateRef.current.tools.find((t) => t.id === toolId);
    if (!tool) return 0;
    return Math.round((tool.durability / tool.maxDurability) * 100);
  }, []);

  const LC_getFacilityProductivity = useCallback((facilityId: string) => {
    const facility = stateRef.current.facilities.find((f) => f.id === facilityId);
    return facility?.productivity ?? 0;
  }, []);

  const LC_getAbilityCooldownPercent = useCallback((abilityId: string) => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    if (!ability || ability.cooldown === 0) return 0;
    return Math.round((ability.currentCooldown / ability.cooldown) * 100);
  }, []);

  const LC_getAbilityExperiencePercent = useCallback((abilityId: string) => {
    const ability = stateRef.current.abilities.find((a) => a.id === abilityId);
    if (!ability) return 0;
    return Math.round((ability.experience / ability.experienceToNext) * 100);
  }, []);

  const LC_getAchievementProgressPercent = useCallback((achievementId: string) => {
    const achievement = stateRef.current.achievements.find((a) => a.id === achievementId);
    if (!achievement) return 0;
    return Math.round((achievement.progress / achievement.target) * 100);
  }, []);

  // --- Action Handlers for onClick (safe pattern) ---

  const LC_handleExcavate = useCallback(() => {
    if (LC_excavateArtifact) LC_excavateArtifact();
  }, [LC_excavateArtifact]);

  const LC_handleRestore = useCallback((artifactId: string) => {
    if (LC_restoreArtifact) LC_restoreArtifact(artifactId);
  }, [LC_restoreArtifact]);

  const LC_handleBuyTool = useCallback((toolId: string) => {
    if (LC_buyTool) LC_buyTool(toolId);
  }, [LC_buyTool]);

  const LC_handleEquipTool = useCallback((toolId: string) => {
    if (LC_equipTool) LC_equipTool(toolId);
  }, [LC_equipTool]);

  const LC_handleRepairTool = useCallback((toolId: string) => {
    if (LC_repairTool) LC_repairTool(toolId);
  }, [LC_repairTool]);

  const LC_handleUpgradeFacility = useCallback((facilityId: string) => {
    if (LC_upgradeFacility) LC_upgradeFacility(facilityId);
  }, [LC_upgradeFacility]);

  const LC_handleUnlockFacility = useCallback((facilityId: string) => {
    if (LC_unlockFacility) LC_unlockFacility(facilityId);
  }, [LC_unlockFacility]);

  const LC_handleUseAbility = useCallback((abilityId: string) => {
    if (LC_useAbility) LC_useAbility(abilityId);
  }, [LC_useAbility]);

  const LC_handleDisarmTrap = useCallback((trapId: string) => {
    if (LC_disarmTrap) LC_disarmTrap(trapId);
  }, [LC_disarmTrap]);

  const LC_handleSolvePuzzle = useCallback((puzzleId: string) => {
    if (LC_solvePuzzle) LC_solvePuzzle(puzzleId);
  }, [LC_solvePuzzle]);

  const LC_handleResolveCurse = useCallback((cursedEventId: string) => {
    if (LC_resolveCurse) LC_resolveCurse(cursedEventId);
  }, [LC_resolveCurse]);

  const LC_handleSetZone = useCallback((zoneId: string) => {
    if (LC_setCurrentZone) LC_setCurrentZone(zoneId);
  }, [LC_setCurrentZone]);

  const LC_handleSetPhase = useCallback((phase: LCExplorationPhase) => {
    if (LC_setPhase) LC_setPhase(phase);
  }, [LC_setPhase]);

  const LC_handleSetTitle = useCallback((titleId: string) => {
    if (LC_setActiveTitle) LC_setActiveTitle(titleId);
  }, [LC_setActiveTitle]);

  const LC_handlePublishPaper = useCallback((paperId: string) => {
    if (LC_publishPaper) LC_publishPaper(paperId);
  }, [LC_publishPaper]);

  const LC_handleCollectRevenue = useCallback((exhibitionId: string) => {
    if (LC_collectExhibitionRevenue) LC_collectExhibitionRevenue(exhibitionId);
  }, [LC_collectExhibitionRevenue]);

  const LC_handleCompleteDailyQuest = useCallback(() => {
    if (LC_completeDailyQuest) LC_completeDailyQuest();
  }, [LC_completeDailyQuest]);

  const LC_handleActivateShield = useCallback(() => {
    if (LC_activateShield) LC_activateShield(3600000);
  }, [LC_activateShield]);

  // --- Bulk / Batch Actions ---

  const LC_excavateMultiple = useCallback((count: number) => {
    for (let i = 0; i < count; i++) {
      if (LC_excavateArtifact) LC_excavateArtifact();
    }
  }, [LC_excavateArtifact]);

  const LC_disarmAllTrapsInZone = useCallback((zoneId: string) => {
    const traps = stateRef.current.traps.filter((t) => t.zoneId === zoneId && !t.disarmed);
    traps.forEach((trap) => {
      if (LC_disarmTrap) LC_disarmTrap(trap.id);
    });
  }, [LC_disarmTrap]);

  const LC_solveAllPuzzlesInZone = useCallback((zoneId: string) => {
    const puzzles = stateRef.current.puzzles.filter((p) => p.zoneId === zoneId && !p.solved);
    puzzles.forEach((puzzle) => {
      if (LC_solvePuzzle) LC_solvePuzzle(puzzle.id);
    });
  }, [LC_solvePuzzle]);

  const LC_restoreAllDiscovered = useCallback(() => {
    const artifacts = stateRef.current.artifacts.filter((a) => a.discoveredAt > 0 && !a.restoredAt);
    artifacts.forEach((artifact) => {
      if (LC_restoreArtifact) LC_restoreArtifact(artifact.id);
    });
  }, [LC_restoreArtifact]);

  const LC_tickAllCooldowns = useCallback((ticks: number) => {
    for (let i = 0; i < ticks; i++) {
      if (LC_tickCooldowns) LC_tickCooldowns();
    }
  }, [LC_tickCooldowns]);

  const LC_buyAllCheapTools = useCallback((maxCost: number) => {
    const tools = stateRef.current.tools.filter((t) => !t.owned && t.cost <= maxCost);
    tools.forEach((tool) => {
      if (LC_buyTool) LC_buyTool(tool.id);
    });
  }, [LC_buyTool]);

  const LC_equipBestTools = useCallback((maxEquipped: number) => {
    const owned = stateRef.current.tools.filter((t) => t.owned);
    const sorted = [...owned].sort((a, b) => b.efficiency - a.efficiency);
    sorted.slice(0, maxEquipped).forEach((tool) => {
      if (LC_equipTool) LC_equipTool(tool.id);
    });
  }, [LC_equipTool]);

  const LC_exploreAllZones = useCallback((amountPerZone: number) => {
    stateRef.current.zones.forEach((zone) => {
      if (LC_exploreZone) LC_exploreZone(amountPerZone);
    });
  }, [LC_exploreZone]);

  // --- Exported Constants (for reference) ---

  const LC_ALL_RARITIES: LCRarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const LC_ALL_PHASES: LCExplorationPhase[] = ['scouting', 'digging', 'analyzing', 'restoring', 'exhibiting'];
  const LC_ALL_TRAP_TYPES: LCTrapType[] = [...LC_TRAP_TYPES];
  const LC_ALL_PUZZLE_TYPES: LCPuzzleType[] = [...LC_PUZZLE_TYPES];
  const LC_ALL_ABILITY_TYPES: LCAbilityType[] = ['scan', 'date', 'decipher', 'disarm', 'restore', 'exhibit', 'research', 'map'];
  const LC_ALL_FACILITY_TYPES: LCFacilityType[] = ['field', 'lab', 'museum', 'restoration', 'archive', 'training', 'storage', 'exhibition'];
  const LC_TOTAL_ARTIFACT_TEMPLATES = LC_ARTIFACT_TEMPLATES.length;
  const LC_TOTAL_ZONE_TEMPLATES = LC_ZONE_TEMPLATES.length;
  const LC_TOTAL_TOOL_TEMPLATES = LC_TOOL_TEMPLATES.length;
  const LC_TOTAL_FACILITY_TEMPLATES = LC_FACILITY_TEMPLATES.length;
  const LC_TOTAL_ABILITY_TEMPLATES = LC_ABILITY_TEMPLATES.length;
  const LC_TOTAL_ACHIEVEMENT_TEMPLATES = LC_ACHIEVEMENT_TEMPLATES.length;
  const LC_TOTAL_TITLE_TEMPLATES = LC_TITLE_TEMPLATES.length;
  const LC_TOTAL_DAILY_QUEST_TEMPLATES = LC_DAILY_QUEST_TEMPLATES.length;
  const LC_MAX_LEVEL = LC_XP_PER_LEVEL.length;

  // --- Return all exports ---

  return {
    // State
    state,
    stateRef,

    // Theme
    LC_THEME_COLORS,
    LC_AMBER,
    LC_SAND,
    LC_TERRACOTTA,
    LC_GOLD,
    LC_PARCHMENT,
    LC_STONE,
    LC_DARK_SOIL,
    LC_JADE,
    LC_OBSIDIAN,

    // Computed
    currentZone,
    availableArtifacts,
    discoveredArtifacts,
    restoredArtifacts,
    cursedArtifacts,
    activeCurses,
    equippedTools,
    ownedTools,
    unlockedFacilities,
    lockedFacilities,
    unlockedAbilities,
    readyAbilities,
    completedAchievements,
    incompleteAchievements,
    unlockedTitles,
    activeTitle,
    activeTitleMultiplier,
    zoneTraps,
    undisarmedTraps,
    zonePuzzles,
    unsolvedPuzzles,
    excavationEfficiency,
    totalArtifactsCount,
    discoveryPercent,
    restorationPercent,
    xpToNextLevel,
    xpProgress,
    isMaxLevel,
    explorationCompletion,
    totalZoneCompletion,
    unlockedZoneCount,
    artifactsByRarity,
    artifactsByZone,
    facilitiesByType,
    abilitiesByType,
    totalEarnedFromExhibitions,
    publishedPapers,
    isDailyQuestActive,
    dailyQuestProgress,
    isShieldActive,
    streakBonus,
    overallScore,

    // Core Actions
    LC_excavateArtifact,
    LC_restoreArtifact,
    LC_setCurrentZone,
    LC_setPhase,
    LC_exploreZone,
    LC_buyTool,
    LC_equipTool,
    LC_repairTool,
    LC_useTool,
    LC_upgradeFacility,
    LC_unlockFacility,
    LC_useAbility,
    LC_unlockAbility,
    LC_levelUpAbility,
    LC_disarmTrap,
    LC_progressTrap,
    LC_solvePuzzle,
    LC_progressPuzzle,
    LC_useHintOnPuzzle,
    LC_activateCurse,
    LC_resolveCurse,
    LC_purgeExpiredCurses,
    LC_activateShield,
    LC_createResearchPaper,
    LC_submitPaper,
    LC_peerReviewPaper,
    LC_publishPaper,
    LC_rejectPaper,
    LC_addCitation,
    LC_hostExhibition,
    LC_updateExhibitionVisitors,
    LC_rateExhibition,
    LC_collectExhibitionRevenue,
    LC_endExhibition,
    LC_generateDailyQuest,
    LC_completeDailyQuest,
    LC_updateStreak,
    LC_checkAchievement,
    LC_checkTitleUnlock,
    LC_setActiveTitle,
    LC_checkLevelUp,
    LC_spendCoins,
    LC_earnCoins,
    LC_addXP,
    LC_tickCooldowns,
    LC_tickExhibitions,
    LC_resetState,
    LC_loadState,

    // Query Functions
    LC_getArtifactById,
    LC_getZoneById,
    LC_getToolById,
    LC_getFacilityById,
    LC_getAbilityById,
    LC_getAchievementById,
    LC_getTitleById,
    LC_getTrapById,
    LC_getPuzzleById,
    LC_getCursedEventById,
    LC_getPaperById,
    LC_getExhibitionById,
    LC_getArtifactsByZone,
    LC_getArtifactsByRarity,
    LC_getTrapsByZone,
    LC_getPuzzlesByZone,
    LC_getTrapsByType,
    LC_getPuzzlesByType,
    LC_getFacilitiesByType,
    LC_getAbilitiesByType,
    LC_getPapersByStatus,
    LC_getActiveExhibitions,
    LC_getEndedExhibitions,
    LC_getToolTierName,
    LC_getRarityColor,
    LC_getPhaseColor,
    LC_getRarityMultiplier,
    LC_canAfford,
    LC_canExcavate,
    LC_canRestore,
    LC_canUseAbility,
    LC_canDisarmTrap,
    LC_canSolvePuzzle,
    LC_isArtifactCursed,
    LC_isArtifactRestored,
    LC_isArtifactDiscovered,
    LC_isZoneUnlocked,
    LC_isZoneFullyExplored,
    LC_isFacilityMaxLevel,
    LC_isAbilityMaxLevel,
    LC_isAchievementCompleted,
    LC_isTitleUnlocked,
    LC_isDailyQuestComplete,
    LC_isDailyQuestReadyToClaim,
    LC_countArtifactsByRarity,
    LC_countTrapsByZone,
    LC_countPuzzlesByZone,
    LC_countCursedActive,
    LC_getHighestRarityFound,
    LC_getMostExploredZone,
    LC_getLeastExploredZone,
    LC_getMostValuableArtifact,
    LC_getMostCitedPaper,
    LC_getHighestRatedExhibition,
    LC_getZoneDangerLevel,
    LC_getZoneClimate,
    LC_getZoneHazards,
    LC_getArtifactLore,
    LC_getArtifactValue,
    LC_getRestorationCost,
    LC_getToolEfficiency,
    LC_getToolDurabilityPercent,
    LC_getFacilityProductivity,
    LC_getAbilityCooldownPercent,
    LC_getAbilityExperiencePercent,
    LC_getAchievementProgressPercent,

    // Action Handlers (onClick-safe)
    LC_handleExcavate,
    LC_handleRestore,
    LC_handleBuyTool,
    LC_handleEquipTool,
    LC_handleRepairTool,
    LC_handleUpgradeFacility,
    LC_handleUnlockFacility,
    LC_handleUseAbility,
    LC_handleDisarmTrap,
    LC_handleSolvePuzzle,
    LC_handleResolveCurse,
    LC_handleSetZone,
    LC_handleSetPhase,
    LC_handleSetTitle,
    LC_handlePublishPaper,
    LC_handleCollectRevenue,
    LC_handleCompleteDailyQuest,
    LC_handleActivateShield,

    // Bulk Actions
    LC_excavateMultiple,
    LC_disarmAllTrapsInZone,
    LC_solveAllPuzzlesInZone,
    LC_restoreAllDiscovered,
    LC_tickAllCooldowns,
    LC_buyAllCheapTools,
    LC_equipBestTools,
    LC_exploreAllZones,

    // Constants
    LC_ALL_RARITIES,
    LC_ALL_PHASES,
    LC_ALL_TRAP_TYPES,
    LC_ALL_PUZZLE_TYPES,
    LC_ALL_ABILITY_TYPES,
    LC_ALL_FACILITY_TYPES,
    LC_TOTAL_ARTIFACT_TEMPLATES,
    LC_TOTAL_ZONE_TEMPLATES,
    LC_TOTAL_TOOL_TEMPLATES,
    LC_TOTAL_FACILITY_TEMPLATES,
    LC_TOTAL_ABILITY_TEMPLATES,
    LC_TOTAL_ACHIEVEMENT_TEMPLATES,
    LC_TOTAL_TITLE_TEMPLATES,
    LC_TOTAL_DAILY_QUEST_TEMPLATES,
    LC_MAX_LEVEL,
  };
}
