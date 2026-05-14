// =============================================================================
// UFO Command Wire — Word Snake Game
// Alien Fleet Command & Space Exploration Module
// SSR-safe: no localStorage / window / document / setInterval / addEventListener / Math.random
// Uses seeded PRNG, React useState / useCallback / useRef
// =============================================================================

import { useState, useCallback, useRef } from 'react';

// =============================================================================
// SEEDED PRNG (Mulberry32)
// =============================================================================

function mulberry32(seed: number): () => number {
  return function (): number {
    let t = (seed += 0x6d2b79f5);
    t = ((t ^ (t >>> 15)) * (t | 1)) | 0;
    t = (t ^ (t >>> 7)) * (t | 61) | 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface UFOType {
  id: string;
  name: string;
  description: string;
  cost: number;
  tier: number;
  health: number;
  attack: number;
  defense: number;
  speed: number;
  cargo: number;
  special: string;
}

export interface AlienSpecies {
  id: string;
  name: string;
  homeworld: string;
  traits: string[];
  description: string;
  disposition: 'hostile' | 'neutral' | 'friendly' | 'mysterious';
  tradeGoods: string[];
}

export interface Planet {
  id: string;
  name: string;
  sector: string;
  type: string;
  description: string;
  resources: string[];
  danger: number;
  minLevel: number;
}

export interface Technology {
  id: string;
  name: string;
  category: string;
  description: string;
  cost: number;
  prerequisites: string[];
  effects: { stat: string; value: number }[];
}

export interface FleetFormation {
  id: string;
  name: string;
  description: string;
  attackMod: number;
  defenseMod: number;
  speedMod: number;
  minShips: number;
}

export interface AlienEncounter {
  id: string;
  name: string;
  description: string;
  type: 'combat' | 'diplomatic' | 'trade' | 'mystery' | 'distress';
  difficulty: number;
  xpReward: number;
  coinReward: number;
  minLevel: number;
}

export interface SpaceStation {
  id: string;
  name: string;
  location: string;
  description: string;
  services: ('repair' | 'upgrade' | 'trade' | 'recruit' | 'research')[];
  repairCost: number;
}

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  objectives: { type: string; target: number; label: string }[];
  xpReward: number;
  coinReward: number;
  minLevel: number;
}

export interface NPCData {
  id: string;
  name: string;
  species: string;
  role: string;
  location: string;
  greeting: string;
  questId: string | null;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  coinReward: number;
}

export interface TitleThreshold {
  level: number;
  title: string;
  perks: string[];
}

export interface PlayerUFO {
  ufoId: string;
  instanceId: string;
  level: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  speed: number;
  cargo: number;
  builtAt: number;
}

export interface SpeciesRelation {
  speciesId: string;
  relation: number;
  contacted: boolean;
  tradeUnlocked: boolean;
}

export interface PlanetState {
  planetId: string;
  explored: boolean;
  colonized: boolean;
  harvestCount: number;
  lastHarvest: number;
}

export interface EncounterLog {
  encounterId: string;
  completed: boolean;
  attempts: number;
  bestScore: number;
  lastAttempt: number;
}

export interface QuestState {
  questId: string;
  accepted: boolean;
  completed: boolean;
  progress: number;
  acceptedAt: number;
  completedAt: number;
}

export interface InventoryItem {
  itemId: string;
  name: string;
  quantity: number;
  type: 'resource' | 'weapon' | 'shield' | 'module' | 'artifact' | 'consumable';
  description: string;
}

export interface CrewMember {
  crewId: string;
  name: string;
  species: string;
  role: 'pilot' | 'engineer' | 'scientist' | 'warrior' | 'diplomat' | 'medic';
  skill: number;
  assignedTo: string | null;
}

export interface DailyTaskState {
  dayIndex: number;
  claimed: boolean;
  completed: boolean;
  progress: number;
  target: number;
}

export interface UFOCommandState {
  level: number;
  xp: number;
  coins: number;
  ufos: PlayerUFO[];
  activeUFOId: string | null;
  alienSpecies: SpeciesRelation[];
  planets: PlanetState[];
  technologies: string[];
  fleetUfoIds: string[];
  formationId: string;
  encounters: EncounterLog[];
  stationVisits: string[];
  quests: QuestState[];
  achievements: string[];
  streak: number;
  lastDailyDayIndex: number;
  dailyTask: DailyTaskState;
  inventory: InventoryItem[];
  crew: CrewMember[];
  totalXPEarned: number;
  totalCoinsEarned: number;
  totalCoinsSpent: number;
  totalEncountersCompleted: number;
  totalPlanetsExplored: number;
  totalSpeciesContacted: number;
  totalTechsResearched: number;
  totalUFOsBuilt: number;
  totalQuestsCompleted: number;
  totalHarvests: number;
  prngSeed: number;
  nextInstanceId: number;
  nextCrewId: number;
}

// =============================================================================
// CONSTANTS (12)
// =============================================================================

export const UF_MAX_LEVEL = 50;

export const UF_TITLE_THRESHOLDS: TitleThreshold[] = [
  { level: 1, title: 'Cadet', perks: ['Basic Scanner'] },
  { level: 5, title: 'Ensign', perks: ['Enhanced Scanner', 'Trade Access'] },
  { level: 10, title: 'Lieutenant', perks: ['Fleet Command', 'Advanced Repair'] },
  { level: 15, title: 'Commander', perks: ['Warp Signature', 'Diplomat Status'] },
  { level: 20, title: 'Captain', perks: ['Orbital Strike', 'Station Discount'] },
  { level: 30, title: 'Admiral', perks: ['Armada Bonus', 'Alliance Network'] },
  { level: 40, title: 'Fleet Marshal', perks: ['Galactic Authority', 'Legendary Ships'] },
  { level: 50, title: 'Galactic Overlord', perks: ['Omniscience', 'Supreme Command'] },
];

export const UF_UFOS: UFOType[] = [
  { id: 'scout-saucer', name: 'Scout Saucer', description: 'A nimble reconnaissance craft perfect for first contact missions.', cost: 100, tier: 1, health: 50, attack: 8, defense: 5, speed: 12, cargo: 10, special: 'stealth-scan' },
  { id: 'mothership', name: 'Mothership', description: 'Massive command vessel capable of carrying an entire fleet.', cost: 2500, tier: 4, health: 400, attack: 60, defense: 70, speed: 4, cargo: 200, special: 'fleet-link' },
  { id: 'stealth-cruiser', name: 'Stealth Cruiser', description: 'Nearly invisible to sensors. Ideal for espionage operations.', cost: 800, tier: 2, health: 120, attack: 25, defense: 15, speed: 9, cargo: 40, special: 'cloaking' },
  { id: 'war-dreadnought', name: 'War Dreadnought', description: 'Heavily armed capital ship that dominates any battlefield.', cost: 1800, tier: 3, health: 300, attack: 80, defense: 60, speed: 3, cargo: 80, special: 'barrage' },
  { id: 'cargo-hauler', name: 'Cargo Hauler', description: 'Massive storage capacity for trade routes and colonization.', cost: 400, tier: 1, health: 80, attack: 5, defense: 10, speed: 5, cargo: 300, special: 'auto-load' },
  { id: 'science-vessel', name: 'Science Vessel', description: 'Equipped with advanced labs for research and anomaly study.', cost: 600, tier: 2, health: 100, attack: 10, defense: 20, speed: 7, cargo: 60, special: 'research-bonus' },
  { id: 'interceptor', name: 'Interceptor', description: 'Fastest ship in the fleet. Outruns any known vessel.', cost: 500, tier: 2, health: 70, attack: 35, defense: 8, speed: 15, cargo: 15, special: 'afterburn' },
  { id: 'colony-ship', name: 'Colony Ship', description: 'Transports colonists and supplies to establish new settlements.', cost: 700, tier: 2, health: 150, attack: 5, defense: 25, speed: 4, cargo: 250, special: 'terraform' },
  { id: 'bomber', name: 'Plasma Bomber', description: 'Drops devastating plasma charges on planetary installations.', cost: 900, tier: 3, health: 130, attack: 70, defense: 20, speed: 6, cargo: 50, special: 'orbital-bombardment' },
  { id: 'explorer', name: 'Deep Space Explorer', description: 'Built for long-range expeditions into uncharted space.', cost: 1200, tier: 3, health: 200, attack: 20, defense: 40, speed: 8, cargo: 100, special: 'deep-scan' },
  { id: 'flagship', name: 'Admiral Flagship', description: 'Prestige command ship that inspires the entire fleet.', cost: 3000, tier: 4, health: 500, attack: 90, defense: 80, speed: 5, cargo: 150, special: 'morale-boost' },
  { id: 'phantom', name: 'Phantom Destroyer', description: 'Experimental ship that phases between dimensions.', cost: 2200, tier: 4, health: 280, attack: 75, defense: 50, speed: 11, cargo: 45, special: 'phase-shift' },
];

export const UF_SPECIES: AlienSpecies[] = [
  { id: 'zetans', name: 'Zetans', homeworld: 'Zeta Reticuli', traits: ['telepathic', 'ancient', 'wise'], description: 'An ancient race of telepathic beings from the Zeta Reticuli system.', disposition: 'mysterious', tradeGoods: ['crystal-shard', 'psionic-amp'] },
  { id: 'greys', name: 'Greys', homeworld: 'Orion Belt', traits: ['analytical', 'cautious', 'technological'], description: 'Small, large-eyed beings renowned for their technological prowess.', disposition: 'neutral', tradeGoods: ['nano-bots', 'data-core'] },
  { id: 'reptilians', name: 'Reptilians', homeworld: 'Alpha Draconis', traits: ['warlike', 'territorial', 'strong'], description: 'Fierce reptilian warriors who value strength above all else.', disposition: 'hostile', tradeGoods: ['plasma-cell', 'bio-armor'] },
  { id: 'nordics', name: 'Nordics', homeworld: 'Pleiades', traits: ['diplomatic', 'enlightened', 'beautiful'], description: 'Tall, human-like aliens dedicated to peace and galactic harmony.', disposition: 'friendly', tradeGoods: ['med-kit', 'diplomatic-seal'] },
  { id: 'arcturians', name: 'Arcturians', homeworld: 'Arcturus Prime', traits: ['spiritual', 'healing', 'ancient'], description: 'Masters of healing arts and spiritual energy manipulation.', disposition: 'friendly', tradeGoods: ['healing-crystal', 'spirit-stone'] },
  { id: 'annunaki', name: 'Annunaki', homeworld: 'Nibiru', traits: ['godlike', 'enigmatic', 'resourceful'], description: 'Legendary beings who shaped early civilizations across the galaxy.', disposition: 'mysterious', tradeGoods: ['ancient-artifact', 'gold-dust'] },
  { id: 'mantids', name: 'Mantids', homeworld: 'Cygnus IV', traits: ['hive-mind', 'efficient', 'adaptable'], description: 'Insectoid species operating as a collective consciousness.', disposition: 'neutral', tradeGoods: ['hive-gel', 'bio-circuit'] },
  { id: 'plaeidians', name: 'Plaeidians', homeworld: 'Alcyone', traits: ['explorers', 'creative', 'adventurous'], description: 'Bold explorers who map the furthest reaches of known space.', disposition: 'friendly', tradeGoods: ['star-map', 'warp-fuel'] },
];

export const UF_PLANETS: Planet[] = [
  { id: 'terra-nova', name: 'Terra Nova', sector: 'Sol', type: 'terrestrial', description: 'A lush Earth-like world rich with life and water.', resources: ['water', 'food', 'minerals'], danger: 1, minLevel: 1 },
  { id: 'kepler-442b', name: 'Kepler-442b', sector: 'Lyra', type: 'super-earth', description: 'A super-Earth with a thick atmosphere and magnetic storms.', resources: ['rare-earth', 'helium-3'], danger: 3, minLevel: 3 },
  { id: 'proxima-b', name: 'Proxima Centauri b', sector: 'Alpha Centauri', type: 'terrestrial', description: 'The closest known exoplanet, bathed in red dwarf light.', resources: ['iron', 'silicon'], danger: 2, minLevel: 2 },
  { id: 'trappist-1e', name: 'TRAPPIST-1e', sector: 'Aquarius', type: 'ocean-world', description: 'A water world with massive underground thermal vents.', resources: ['water', 'thermal-energy', 'bio-samples'], danger: 4, minLevel: 5 },
  { id: 'gliese-667c', name: 'Gliese 667Cc', sector: 'Scorpius', type: 'jungle', description: 'Dense alien jungles teeming with undiscovered organisms.', resources: ['bio-compounds', 'exotic-wood', 'spores'], danger: 5, minLevel: 6 },
  { id: 'hd-40307g', name: 'HD 40307g', sector: 'Pictor', type: 'super-earth', description: 'A massive world with crushing gravity and deep canyons.', resources: ['heavy-minerals', 'uranium', 'diamonds'], danger: 6, minLevel: 8 },
  { id: 'tau-ceti-f', name: 'Tau Ceti f', sector: 'Cetus', type: 'frozen', description: 'An ice world with frozen oceans and crystalline caves.', resources: ['ice-crystal', 'frozen-gas', 'cryo-mineral'], danger: 4, minLevel: 5 },
  { id: 'wolf-1061c', name: 'Wolf 1061c', sector: 'Ophiuchus', type: 'volcanic', description: 'A volatile world of active volcanoes and lava rivers.', resources: ['magma-core', 'obsidian', 'sulfur'], danger: 7, minLevel: 10 },
  { id: 'ross-128b', name: 'Ross 128 b', sector: 'Virgo', type: 'desert', description: 'A warm desert world with ancient alien ruins buried in sand.', resources: ['artifact-fragments', 'sand-glass', 'ancient-tech'], danger: 3, minLevel: 4 },
  { id: 'luyten-b', name: 'Luyten b', sector: 'Canis Major', type: 'terrestrial', description: 'A temperate world with vast grasslands and mild climate.', resources: ['food', 'carbon-fiber', 'textile-fiber'], danger: 2, minLevel: 3 },
  { id: 'kapteyn-b', name: 'Kapteyn b', sector: 'Pictor', type: 'ocean-world', description: 'An ancient ocean world orbiting one of the oldest stars.', resources: ['ancient-coral', 'deep-crystal', 'bioluminescent-dust'], danger: 5, minLevel: 7 },
  { id: 'teegarden-b', name: 'Teegarden b', sector: 'Aries', type: 'terrestrial', description: 'A tranquil world with a stable orbit and calm weather.', resources: ['food', 'minerals', 'water'], danger: 1, minLevel: 2 },
  { id: 'gj-357d', name: 'GJ 357 d', sector: 'Hydra', type: 'rocky', description: 'A rocky world with thin atmosphere and vast cavern systems.', resources: ['cave-crystals', 'tunnel-moss', 'stone-ore'], danger: 3, minLevel: 4 },
  { id: 'k2-18b', name: 'K2-18 b', sector: 'Leo', type: 'ocean-world', description: 'A world with water clouds and potential subsurface oceans.', resources: ['water-vapor', 'hyacinth-gas', 'aqua-gel'], danger: 4, minLevel: 6 },
  { id: 'toi-700d', name: 'TOI-700 d', sector: 'Doradus', type: 'terrestrial', description: 'A habitable-zone world with two small moons.', resources: ['lunar-minerals', 'soil-sample', 'tidal-energy'], danger: 2, minLevel: 3 },
  { id: 'kepler-1649c', name: 'Kepler-1649c', sector: 'Cygnus', type: 'terrestrial', description: 'One of the most Earth-like exoplanets ever discovered.', resources: ['organic-compound', 'minerals', 'water'], danger: 2, minLevel: 2 },
  { id: 'kepler-22b', name: 'Kepler-22b', sector: 'Cygnus', type: 'ocean-world', description: 'The first confirmed exoplanet in a habitable zone.', resources: ['water', 'coral-reef-sample', 'bioluminescence'], danger: 3, minLevel: 4 },
  { id: 'barnard-b', name: "Barnard's Star b", sector: 'Ophiuchus', type: 'frozen', description: 'A frigid world near a dim red dwarf with aurora displays.', resources: ['aurora-crystal', 'ice-mineral', 'magnetic-ore'], danger: 5, minLevel: 7 },
  { id: 'lhc-438b', name: 'LHS 438 b', sector: 'Eridanus', type: 'volcanic', description: 'A molten hellscape with rivers of liquid metal.', resources: ['liquid-metal', 'magma-crystal', 'fire-opal'], danger: 8, minLevel: 12 },
  { id: 'proxima-centauri-c', name: 'Proxima Centauri c', sector: 'Alpha Centauri', type: 'gas-giant', description: 'A massive gas giant with a ring system of stunning beauty.', resources: ['hydrogen-fuel', 'ring-ice', 'gas-crystal'], danger: 6, minLevel: 9 },
];

export const UF_TECHNOLOGIES: Technology[] = [
  { id: 'warp-drive', name: 'Warp Drive', category: 'propulsion', description: 'Enables faster-than-light travel between star systems.', cost: 500, prerequisites: [], effects: [{ stat: 'speed', value: 20 }] },
  { id: 'cloaking-device', name: 'Cloaking Device', category: 'defense', description: 'Renders your ship invisible to enemy sensors.', cost: 400, prerequisites: [], effects: [{ stat: 'defense', value: 15 }] },
  { id: 'plasma-cannon', name: 'Plasma Cannon', category: 'weapons', description: 'Fires devastating bolts of superheated plasma.', cost: 350, prerequisites: [], effects: [{ stat: 'attack', value: 25 }] },
  { id: 'shield-generator', name: 'Shield Generator', category: 'defense', description: 'Projects an energy barrier that absorbs incoming damage.', cost: 300, prerequisites: [], effects: [{ stat: 'defense', value: 20 }] },
  { id: 'terraforming', name: 'Terraforming', category: 'exploration', description: 'Transforms hostile planets into habitable worlds.', cost: 800, prerequisites: ['warp-drive'], effects: [{ stat: 'cargo', value: 30 }] },
  { id: 'quantum-comms', name: 'Quantum Communications', category: 'diplomacy', description: 'Instant communication across any distance in the galaxy.', cost: 250, prerequisites: [], effects: [{ stat: 'relation', value: 10 }] },
  { id: 'anti-gravity', name: 'Anti-Gravity Engine', category: 'propulsion', description: 'Reduces fuel consumption and increases maneuverability.', cost: 450, prerequisites: ['warp-drive'], effects: [{ stat: 'speed', value: 15 }] },
  { id: 'biometric-scanner', name: 'Biometric Scanner', category: 'science', description: 'Scans life forms and analyzes biological compositions.', cost: 200, prerequisites: [], effects: [{ stat: 'scan', value: 25 }] },
  { id: 'nanotech-repair', name: 'Nanotech Repair', category: 'engineering', description: 'Swarm of nanobots that automatically repair hull damage.', cost: 600, prerequisites: ['shield-generator'], effects: [{ stat: 'health', value: 30 }] },
  { id: 'dark-matter-reactor', name: 'Dark Matter Reactor', category: 'engineering', description: 'Harnessed dark matter for near-limitless energy.', cost: 1200, prerequisites: ['warp-drive', 'anti-gravity'], effects: [{ stat: 'attack', value: 15 }, { stat: 'defense', value: 15 }, { stat: 'speed', value: 10 }] },
  { id: 'mind-link', name: 'Telepathic Mind Link', category: 'diplomacy', description: 'Establishes direct mental communication with alien species.', cost: 700, prerequisites: ['quantum-comms'], effects: [{ stat: 'relation', value: 25 }] },
  { id: 'tractor-beam', name: 'Tractor Beam', category: 'utility', description: 'Captures and tows objects or smaller vessels.', cost: 350, prerequisites: [], effects: [{ stat: 'cargo', value: 50 }] },
  { id: 'hyper-shields', name: 'Hyper Shields', category: 'defense', description: 'Multi-layered shields that regenerate during combat.', cost: 900, prerequisites: ['shield-generator', 'nanotech-repair'], effects: [{ stat: 'defense', value: 35 }] },
  { id: 'phase-cannon', name: 'Phase Cannon', category: 'weapons', description: 'Fires projectiles that phase through physical matter.', cost: 1000, prerequisites: ['plasma-cannon', 'dark-matter-reactor'], effects: [{ stat: 'attack', value: 40 }] },
  { id: 'galactic-database', name: 'Galactic Database', category: 'science', description: 'Access to the collective knowledge of all known species.', cost: 1500, prerequisites: ['biometric-scanner', 'mind-link'], effects: [{ stat: 'scan', value: 50 }, { stat: 'relation', value: 15 }] },
];

export const UF_FLEET_FORMATIONS: FleetFormation[] = [
  { id: 'line-abreast', name: 'Line Abreast', description: 'Ships spread horizontally for maximum broadside coverage.', attackMod: 1.0, defenseMod: 1.0, speedMod: 1.0, minShips: 2 },
  { id: 'v-formation', name: 'V Formation', description: 'Classic attack formation focusing firepower forward.', attackMod: 1.3, defenseMod: 0.8, speedMod: 1.1, minShips: 3 },
  { id: 'sphere-defense', name: 'Sphere Defense', description: 'Ships surround the flagship in a protective sphere.', attackMod: 0.7, defenseMod: 1.5, speedMod: 0.8, minShips: 4 },
  { id: 'wedge-attack', name: 'Wge Attack', description: 'Aggressive wedge formation that pierces enemy lines.', attackMod: 1.5, defenseMod: 0.6, speedMod: 1.2, minShips: 3 },
  { id: 'echelon-right', name: 'Echelon Right', description: 'Diagonal formation with overlapping fields of fire.', attackMod: 1.2, defenseMod: 1.1, speedMod: 1.0, minShips: 2 },
  { id: 'scatter', name: 'Scatter Formation', description: 'Ships spread wide to cover maximum area for exploration.', attackMod: 0.5, defenseMod: 0.5, speedMod: 1.4, minShips: 1 },
  { id: 'hammer-and-anvil', name: 'Hammer and Anvil', description: 'Two groups flank the enemy from both sides.', attackMod: 1.4, defenseMod: 1.2, speedMod: 0.9, minShips: 4 },
  { id: 'phalanx', name: 'Phalanx Wall', description: 'Tight formation with interlocking shields.', attackMod: 0.9, defenseMod: 1.8, speedMod: 0.7, minShips: 3 },
];

export const UF_ENCOUNTERS: AlienEncounter[] = [
  { id: 'pirate-ambush', name: 'Pirate Ambush', description: 'Space pirates emerge from an asteroid field, weapons hot!', type: 'combat', difficulty: 2, xpReward: 30, coinReward: 20, minLevel: 1 },
  { id: 'distress-signal', name: 'Distress Signal', description: 'A faint distress signal from a damaged freighter.', type: 'distress', difficulty: 3, xpReward: 50, coinReward: 40, minLevel: 2 },
  { id: 'trade-caravan', name: 'Trade Caravan', description: 'A merchant fleet offers rare goods at discounted prices.', type: 'trade', difficulty: 1, xpReward: 15, coinReward: 60, minLevel: 1 },
  { id: 'reptilian-patrol', name: 'Reptilian Patrol', description: 'A Reptilian warship challenges your right to be in their territory.', type: 'combat', difficulty: 5, xpReward: 80, coinReward: 50, minLevel: 5 },
  { id: 'zetan-contact', name: 'Zetan First Contact', description: 'A shimmering Zetan vessel appears and attempts telepathic communication.', type: 'diplomatic', difficulty: 4, xpReward: 100, coinReward: 30, minLevel: 4 },
  { id: 'wormhole', name: 'Wormhole Anomaly', description: 'A mysterious wormhole opens, offering a shortcut to unknown space.', type: 'mystery', difficulty: 6, xpReward: 120, coinReward: 80, minLevel: 6 },
  { id: 'nordic-escort', name: 'Nordic Escort', description: 'A Nordic cruiser offers to escort you through dangerous territory.', type: 'diplomatic', difficulty: 3, xpReward: 60, coinReward: 25, minLevel: 3 },
  { id: 'asteroid-storm', name: 'Asteroid Storm', description: 'A massive field of asteroids threatens to crush your fleet.', type: 'combat', difficulty: 4, xpReward: 70, coinReward: 35, minLevel: 4 },
  { id: 'ancient-ruin', name: 'Ancient Ruins', description: 'Ruins of an ancient civilization floating in the void.', type: 'mystery', difficulty: 5, xpReward: 150, coinReward: 100, minLevel: 5 },
  { id: 'grey-experiment', name: 'Grey Experiment', description: 'The Greys want to run "tests" on your crew. Agree or resist?', type: 'trade', difficulty: 3, xpReward: 40, coinReward: 70, minLevel: 3 },
  { id: 'hive-swarm', name: 'Mantid Swarm', description: 'Thousands of Mantid fighters swarm from a nearby moon.', type: 'combat', difficulty: 7, xpReward: 130, coinReward: 60, minLevel: 8 },
  { id: 'diplomatic-summit', name: 'Diplomatic Summit', description: 'Leaders of multiple species gather for a peace conference.', type: 'diplomatic', difficulty: 8, xpReward: 200, coinReward: 150, minLevel: 10 },
  { id: 'ghost-ship', name: 'Ghost Ship', description: 'A derelict vessel drifts silently. Board it to investigate?', type: 'mystery', difficulty: 5, xpReward: 90, coinReward: 90, minLevel: 6 },
  { id: 'smuggler-cache', name: 'Smuggler Cache', description: 'You discover a hidden cache of valuable contraband.', type: 'trade', difficulty: 2, xpReward: 25, coinReward: 120, minLevel: 2 },
  { id: 'solar-flare', name: 'Solar Flare', description: 'A nearby star erupts with a massive coronal ejection!', type: 'combat', difficulty: 6, xpReward: 100, coinReward: 45, minLevel: 7 },
  { id: 'annunaki-artifact', name: 'Annunaki Artifact', description: 'An incredibly powerful artifact of Annunaki origin is detected.', type: 'mystery', difficulty: 9, xpReward: 250, coinReward: 200, minLevel: 12 },
  { id: 'rebel-faction', name: 'Rebel Faction', description: 'A group of defectors asks you to join their cause.', type: 'diplomatic', difficulty: 6, xpReward: 110, coinReward: 75, minLevel: 7 },
  { id: 'asteroid-mining', name: 'Asteroid Mining', description: 'A rich asteroid field with abundant resources to harvest.', type: 'trade', difficulty: 2, xpReward: 30, coinReward: 90, minLevel: 2 },
  { id: 'dimensional-rift', name: 'Dimensional Rift', description: 'Reality tears apart, revealing a parallel dimension briefly.', type: 'mystery', difficulty: 10, xpReward: 300, coinReward: 250, minLevel: 15 },
  { id: 'arcturian-healer', name: 'Arcturian Healer', description: 'An Arcturian vessel offers to heal your wounded crew members.', type: 'diplomatic', difficulty: 3, xpReward: 50, coinReward: 20, minLevel: 3 },
  { id: 'plaeidian-guide', name: 'Plaeidian Star Guide', description: 'A Plaeidian explorer shares star charts of a new sector.', type: 'trade', difficulty: 4, xpReward: 80, coinReward: 55, minLevel: 5 },
  { id: 'black-hole-edge', name: 'Black Hole Edge', description: 'Your ship is caught in the gravitational pull of a black hole!', type: 'combat', difficulty: 8, xpReward: 180, coinReward: 100, minLevel: 10 },
  { id: 'ancient-guardian', name: 'Ancient Guardian', description: 'A colossal automated defense satellite blocks your path.', type: 'combat', difficulty: 9, xpReward: 220, coinReward: 130, minLevel: 12 },
  { id: 'cultural-exchange', name: 'Cultural Exchange', description: 'Two species want to trade knowledge through your mediation.', type: 'diplomatic', difficulty: 7, xpReward: 160, coinReward: 110, minLevel: 9 },
  { id: 'rogue-ai', name: 'Rogue AI', description: 'An ancient artificial intelligence has gone mad and attacks all ships.', type: 'combat', difficulty: 10, xpReward: 350, coinReward: 200, minLevel: 15 },
];

export const UF_STATIONS: SpaceStation[] = [
  { id: 'sol-hub', name: 'Sol Station Alpha', location: 'Sol Sector', description: 'The primary hub of human space operations near Earth.', services: ['repair', 'upgrade', 'trade', 'recruit', 'research'], repairCost: 10 },
  { id: 'alpha-centauri-dock', name: 'Centauri Dock', location: 'Alpha Centauri', description: 'A bustling trade port at the edge of explored space.', services: ['repair', 'trade', 'recruit'], repairCost: 15 },
  { id: 'pleiades-outpost', name: 'Pleiades Outpost', location: 'Pleiades Sector', description: 'Nordic-run station specializing in diplomacy and crew training.', services: ['recruit', 'trade', 'research'], repairCost: 20 },
  { id: 'orion-foundry', name: 'Orion Foundry', location: 'Orion Belt', description: 'Industrial station where Grey engineers build advanced technology.', services: ['upgrade', 'research', 'repair'], repairCost: 25 },
  { id: 'draconis-fortress', name: 'Draconis Fortress', location: 'Alpha Draconis', description: 'Heavily armed Reptilian military installation.', services: ['repair', 'upgrade'], repairCost: 30 },
  { id: 'arcturus-sanctum', name: 'Arcturus Sanctum', location: 'Arcturus Prime', description: 'Peaceful healing station run by Arcturian masters.', services: ['repair', 'research', 'recruit'], repairCost: 35 },
  { id: 'deep-space-relay', name: 'Deep Space Relay', location: 'Uncharted Regions', description: 'Remote relay station at the frontier of known space.', services: ['repair', 'trade'], repairCost: 40 },
  { id: 'nexus-prime', name: 'Nexus Prime', location: 'Galactic Core', description: 'The greatest space station ever built, at the heart of the galaxy.', services: ['repair', 'upgrade', 'trade', 'recruit', 'research'], repairCost: 50 },
];

export const UF_QUESTS: QuestTemplate[] = [
  { id: 'patrol-sol', name: 'Sol Sector Patrol', description: 'Patrol the Sol sector and eliminate any pirate threats.', objectives: [{ type: 'encounter', target: 3, label: 'Complete 3 encounters' }], xpReward: 100, coinReward: 80, minLevel: 1 },
  { id: 'first-contact', name: 'First Contact Protocol', description: 'Establish communication with an alien species.', objectives: [{ type: 'contact', target: 1, label: 'Contact 1 species' }], xpReward: 150, coinReward: 100, minLevel: 3 },
  { id: 'explore-unknown', name: 'Explore the Unknown', description: 'Chart and explore uncharted planets.', objectives: [{ type: 'explore', target: 3, label: 'Explore 3 planets' }], xpReward: 200, coinReward: 150, minLevel: 4 },
  { id: 'tech-rush', name: 'Technology Rush', description: 'Research new technologies to advance your fleet.', objectives: [{ type: 'research', target: 2, label: 'Research 2 technologies' }], xpReward: 250, coinReward: 180, minLevel: 5 },
  { id: 'fleet-expansion', name: 'Fleet Expansion', description: 'Build a fleet of at least 3 ships.', objectives: [{ type: 'build', target: 3, label: 'Build 3 UFOs' }], xpReward: 300, coinReward: 200, minLevel: 6 },
  { id: 'diplomatic-mission', name: 'Diplomatic Mission', description: 'Improve relations with multiple alien species.', objectives: [{ type: 'improve-relations', target: 5, label: 'Improve relations 5 times' }], xpReward: 350, coinReward: 250, minLevel: 8 },
  { id: 'deep-expedition', name: 'Deep Space Expedition', description: 'Explore dangerous outer-sector planets.', objectives: [{ type: 'explore', target: 5, label: 'Explore 5 planets' }, { type: 'encounter', target: 5, label: 'Complete 5 encounters' }], xpReward: 500, coinReward: 400, minLevel: 10 },
  { id: 'galactic-war', name: 'Galactic War Campaign', description: 'Engage and defeat hostile forces across multiple sectors.', objectives: [{ type: 'encounter', target: 10, label: 'Complete 10 encounters' }], xpReward: 800, coinReward: 600, minLevel: 15 },
  { id: 'colonize-new-world', name: 'Colonize a New World', description: 'Establish a colony on an unexplored planet.', objectives: [{ type: 'colonize', target: 1, label: 'Colonize 1 planet' }], xpReward: 600, coinReward: 450, minLevel: 12 },
  { id: 'ancient-knowledge', name: 'Ancient Knowledge', description: 'Research the most advanced technologies.', objectives: [{ type: 'research', target: 4, label: 'Research 4 technologies' }], xpReward: 700, coinReward: 500, minLevel: 14 },
];

export const UF_NPCS: NPCData[] = [
  { id: 'commander-zara', name: 'Commander Zara', species: 'human', role: 'Fleet Commander', location: 'sol-hub', greeting: 'Welcome, Cadet. The galaxy needs brave explorers.', questId: 'patrol-sol' },
  { id: 'ambassador-lyra', name: 'Ambassador Lyra', species: 'nordics', role: 'Diplomat', location: 'pleiades-outpost', greeting: 'Peace be with you, traveler. Shall we discuss the path to harmony?', questId: 'first-contact' },
  { id: 'dr-glix', name: 'Dr. Glix', species: 'greys', role: 'Chief Scientist', location: 'orion-foundry', greeting: 'Fascinating. Your neural patterns are... inefficient. Let me help.', questId: 'tech-rush' },
  { id: 'warlord-zhark', name: 'Warlord Zhark', species: 'reptilians', role: 'Arena Master', location: 'draconis-fortress', greeting: 'You dare enter my domain? Prove your strength or leave!', questId: 'galactic-war' },
  { id: 'elder-orion', name: 'Elder Orion', species: 'arcturians', role: 'Healer', location: 'arcturus-sanctum', greeting: 'Your spirit carries wounds both seen and unseen. Let me tend to them.', questId: null },
  { id: 'explorer-nova', name: 'Explorer Nova', species: 'plaeidians', role: 'Pathfinder', location: 'deep-space-relay', greeting: 'I have mapped a thousand stars and still hunger for more. Join me?', questId: 'explore-unknown' },
  { id: 'queen-larva', name: 'Queen Larva', species: 'mantids', role: 'Hive Coordinator', location: 'nexus-prime', greeting: 'The collective welcomes the individual. Efficiency through unity.', questId: 'fleet-expansion' },
  { id: 'enigma', name: 'Enigma', species: 'zetans', role: 'Mystic Guide', location: 'nexus-prime', greeting: 'I sense great potential in your timeline. Or was it another? Let us see.', questId: 'ancient-knowledge' },
  { id: 'captain-rex', name: 'Captain Rex', species: 'human', role: 'Trade Baron', location: 'alpha-centauri-dock', greeting: 'Everything has a price. What do you have to offer?', questId: null },
  { id: 'sentinel-alpha', name: 'Sentinel Alpha', species: 'annunaki', role: 'Guardian', location: 'nexus-prime', greeting: 'I have watched civilizations rise and fall. You are... interesting.', questId: 'colonize-new-world' },
];

export const UF_ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-flight', name: 'First Flight', description: 'Build your very first UFO.', icon: '🛸', condition: 'totalUFOsBuilt >= 1', coinReward: 50 },
  { id: 'alien-friend', name: 'Alien Friend', description: 'Establish first contact with any alien species.', icon: '👽', condition: 'totalSpeciesContacted >= 1', coinReward: 100 },
  { id: 'pathfinder', name: 'Pathfinder', description: 'Explore 5 different planets.', icon: '🌍', condition: 'totalPlanetsExplored >= 5', coinReward: 150 },
  { id: 'tech-pioneer', name: 'Tech Pioneer', description: 'Research your first technology.', icon: '🔬', condition: 'totalTechsResearched >= 1', coinReward: 100 },
  { id: 'fleet-commander', name: 'Fleet Commander', description: 'Assemble a fleet of 5 or more ships.', icon: '🚀', condition: 'fleetSize >= 5', coinReward: 200 },
  { id: 'battle-hardened', name: 'Battle Hardened', description: 'Complete 10 alien encounters.', icon: '⚔️', condition: 'totalEncountersCompleted >= 10', coinReward: 250 },
  { id: 'diplomat', name: 'Master Diplomat', description: 'Contact all 8 alien species.', icon: '🤝', condition: 'totalSpeciesContacted >= 8', coinReward: 300 },
  { id: 'galactic-explorer', name: 'Galactic Explorer', description: 'Explore all 20 planets.', icon: '🌌', condition: 'totalPlanetsExplored >= 20', coinReward: 500 },
  { id: 'mad-scientist', name: 'Mad Scientist', description: 'Research 10 technologies.', icon: '🧪', condition: 'totalTechsResearched >= 10', coinReward: 400 },
  { id: 'wealthy-commander', name: 'Wealthy Commander', description: 'Accumulate 10,000 coins.', icon: '💰', condition: 'coins >= 10000', coinReward: 500 },
  { id: 'daily-devotee', name: 'Daily Devotee', description: 'Maintain a 7-day streak.', icon: '🔥', condition: 'streak >= 7', coinReward: 200 },
  { id: 'legendary-captain', name: 'Legendary Captain', description: 'Reach level 50.', icon: '⭐', condition: 'level >= 50', coinReward: 1000 },
  { id: 'quest-master', name: 'Quest Master', description: 'Complete 10 quests.', icon: '📜', condition: 'totalQuestsCompleted >= 10', coinReward: 300 },
  { id: 'harvest-king', name: 'Harvest King', description: 'Perform 50 planet harvests.', icon: '🌾', condition: 'totalHarvests >= 50', coinReward: 350 },
  { id: 'galactic-overlord', name: 'Galactic Overlord', description: 'Unlock all other achievements.', icon: '👑', condition: 'achievementCount >= 14', coinReward: 2000 },
];

// =============================================================================
// XP / LEVEL UTILITIES
// =============================================================================

function ufGetXPForLevel(targetLevel: number): number {
  return Math.floor(100 * targetLevel * (1 + targetLevel * 0.15));
}

function ufGetTitleForLevel(level: number): TitleThreshold {
  let title = UF_TITLE_THRESHOLDS[0];
  for (let i = UF_TITLE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (level >= UF_TITLE_THRESHOLDS[i].level) {
      title = UF_TITLE_THRESHOLDS[i];
      break;
    }
  }
  return title;
}

// =============================================================================
// INITIAL STATE FACTORY
// =============================================================================

function createInitialState(seed: number = 42): UFOCommandState {
  return {
    level: 1,
    xp: 0,
    coins: 200,
    ufos: [],
    activeUFOId: null,
    alienSpecies: UF_SPECIES.map((s) => ({
      speciesId: s.id,
      relation: 0,
      contacted: false,
      tradeUnlocked: false,
    })),
    planets: UF_PLANETS.map((p) => ({
      planetId: p.id,
      explored: false,
      colonized: false,
      harvestCount: 0,
      lastHarvest: 0,
    })),
    technologies: [],
    fleetUfoIds: [],
    formationId: 'line-abreast',
    encounters: UF_ENCOUNTERS.map((e) => ({
      encounterId: e.id,
      completed: false,
      attempts: 0,
      bestScore: 0,
      lastAttempt: 0,
    })),
    stationVisits: [],
    quests: UF_QUESTS.map((q) => ({
      questId: q.id,
      accepted: false,
      completed: false,
      progress: 0,
      acceptedAt: 0,
      completedAt: 0,
    })),
    achievements: [],
    streak: 0,
    lastDailyDayIndex: -1,
    dailyTask: { dayIndex: 0, claimed: false, completed: false, progress: 0, target: 5 },
    inventory: [],
    crew: [],
    totalXPEarned: 0,
    totalCoinsEarned: 0,
    totalCoinsSpent: 0,
    totalEncountersCompleted: 0,
    totalPlanetsExplored: 0,
    totalSpeciesContacted: 0,
    totalTechsResearched: 0,
    totalUFOsBuilt: 0,
    totalQuestsCompleted: 0,
    totalHarvests: 0,
    prngSeed: seed,
    nextInstanceId: 1,
    nextCrewId: 1,
  };
}

// =============================================================================
// HOOK: useUFOCommand
// =============================================================================

export function useUFOCommand(seed: number = 42) {
  const [state, setState] = useState<UFOCommandState>(() => createInitialState(seed));
  const prngRef = useRef<number>(seed);

  // --- PRNG Advance ---
  const ufAdvancePRNG = useCallback((): number => {
    prngRef.current = ((prngRef.current + 1) * 16807 + 12345) & 0x7fffffff;
    return prngRef.current / 0x7fffffff;
  }, []);

  // --- PRNG Reset ---
  const ufResetPRNG = useCallback((newSeed: number) => {
    prngRef.current = newSeed;
    setState((prev) => ({ ...prev, prngSeed: newSeed }));
  }, []);

  // --- Core State ---
  const ufGetState = useCallback(() => state, [state]);

  const ufResetState = useCallback(() => {
    const fresh = createInitialState(seed);
    setState(fresh);
    prngRef.current = seed;
  }, [seed]);

  // --- Level & XP ---
  const ufGetLevel = useCallback(() => state.level, [state.level]);

  const ufGetTitle = useCallback(() => ufGetTitleForLevel(state.level), [state.level]);

  const ufGetProgress = useCallback(() => {
    const needed = ufGetXPForLevel(state.level);
    return Math.min(state.xp / needed, 1);
  }, [state.xp, state.level]);

  const ufGetXPForNextLevel = useCallback(() => ufGetXPForLevel(state.level), [state.level]);

  const ufAddXP = useCallback((amount: number) => {
    setState((prev) => {
      let xp = prev.xp + amount;
      let level = prev.level;
      let totalXPEarned = prev.totalXPEarned + amount;
      while (xp >= ufGetXPForLevel(level) && level < UF_MAX_LEVEL) {
        xp -= ufGetXPForLevel(level);
        level += 1;
      }
      if (level >= UF_MAX_LEVEL) {
        xp = 0;
        level = UF_MAX_LEVEL;
      }
      return { ...prev, xp, level, totalXPEarned };
    });
  }, []);

  const ufLevelUp = useCallback(() => {
    ufAddXP(ufGetXPForLevel(state.level));
  }, [ufAddXP, state.level]);

  // --- Coins ---
  const ufGetCoins = useCallback(() => state.coins, [state.coins]);

  const ufAddCoins = useCallback((amount: number) => {
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
    }));
  }, []);

  const ufSpendCoins = useCallback(
    (amount: number): boolean => {
      if (state.coins < amount) return false;
      setState((prev) => ({
        ...prev,
        coins: prev.coins - amount,
        totalCoinsSpent: prev.totalCoinsSpent + amount,
      }));
      return true;
    },
    [state.coins]
  );

  // --- UFOs ---
  const ufGetUFOs = useCallback(() => state.ufos, [state.ufos]);

  const ufGetActiveUFO = useCallback(() => {
    if (!state.activeUFOId) return null;
    return state.ufos.find((u) => u.instanceId === state.activeUFOId) ?? null;
  }, [state.ufos, state.activeUFOId]);

  const ufBuildUFO = useCallback(
    (ufoId: string): PlayerUFO | null => {
      const template = UF_UFOS.find((u) => u.id === ufoId);
      if (!template) return null;
      if (state.coins < template.cost) return null;
      const instanceId = `ufo-${state.nextInstanceId}`;
      const playerUFO: PlayerUFO = {
        ufoId: template.id,
        instanceId,
        level: 1,
        health: template.health,
        maxHealth: template.health,
        attack: template.attack,
        defense: template.defense,
        speed: template.speed,
        cargo: template.cargo,
        builtAt: Date.now ? Date.now() : 0,
      };
      setState((prev) => ({
        ...prev,
        ufos: [...prev.ufos, playerUFO],
        coins: prev.coins - template.cost,
        totalCoinsSpent: prev.totalCoinsSpent + template.cost,
        totalUFOsBuilt: prev.totalUFOsBuilt + 1,
        nextInstanceId: prev.nextInstanceId + 1,
        activeUFOId: prev.activeUFOId ?? instanceId,
        fleetUfoIds: prev.fleetUfoIds.length === 0 ? [instanceId] : prev.fleetUfoIds,
      }));
      return playerUFO;
    },
    [state.coins, state.nextInstanceId]
  );

  const ufUpgradeUFO = useCallback(
    (instanceId: string): boolean => {
      const ufo = state.ufos.find((u) => u.instanceId === instanceId);
      if (!ufo) return false;
      if (ufo.level >= 10) return false;
      const cost = Math.floor(100 * ufo.level * 1.5);
      if (state.coins < cost) return false;
      const template = UF_UFOS.find((t) => t.id === ufo.ufoId);
      if (!template) return false;
      const newLevel = ufo.level + 1;
      const multiplier = 1 + (newLevel - 1) * 0.15;
      setState((prev) => ({
        ...prev,
        ufos: prev.ufos.map((u) =>
          u.instanceId === instanceId
            ? {
                ...u,
                level: newLevel,
                maxHealth: Math.floor(template.health * multiplier),
                health: Math.floor(template.health * multiplier),
                attack: Math.floor(template.attack * multiplier),
                defense: Math.floor(template.defense * multiplier),
                speed: Math.floor(template.speed * (1 + (newLevel - 1) * 0.05)),
                cargo: Math.floor(template.cargo * (1 + (newLevel - 1) * 0.1)),
              }
            : u
        ),
        coins: prev.coins - cost,
        totalCoinsSpent: prev.totalCoinsSpent + cost,
      }));
      return true;
    },
    [state.ufos, state.coins]
  );

  const ufSetActiveUFO = useCallback((instanceId: string) => {
    setState((prev) => ({
      ...prev,
      activeUFOId: prev.ufos.some((u) => u.instanceId === instanceId) ? instanceId : prev.activeUFOId,
    }));
  }, []);

  const ufDestroyUFO = useCallback((instanceId: string) => {
    setState((prev) => ({
      ...prev,
      ufos: prev.ufos.filter((u) => u.instanceId !== instanceId),
      activeUFOId: prev.activeUFOId === instanceId ? (prev.ufos[0]?.instanceId ?? null) : prev.activeUFOId,
      fleetUfoIds: prev.fleetUfoIds.filter((id) => id !== instanceId),
    }));
  }, []);

  const ufGetShipStats = useCallback(
    (instanceId: string) => {
      const ufo = state.ufos.find((u) => u.instanceId === instanceId);
      if (!ufo) return null;
      const techBonus = state.technologies.reduce(
        (acc, techId) => {
          const tech = UF_TECHNOLOGIES.find((t) => t.id === techId);
          if (!tech) return acc;
          for (const eff of tech.effects) {
            if (eff.stat in acc) {
              (acc as Record<string, number>)[eff.stat] += eff.value;
            }
          }
          return acc;
        },
        { health: 0, attack: 0, defense: 0, speed: 0, cargo: 0 } as Record<string, number>
      );
      return {
        name: UF_UFOS.find((t) => t.id === ufo.ufoId)?.name ?? 'Unknown',
        level: ufo.level,
        health: ufo.health + (techBonus.health || 0),
        maxHealth: ufo.maxHealth + (techBonus.health || 0),
        attack: ufo.attack + (techBonus.attack || 0),
        defense: ufo.defense + (techBonus.defense || 0),
        speed: ufo.speed + (techBonus.speed || 0),
        cargo: ufo.cargo + (techBonus.cargo || 0),
      };
    },
    [state.ufos, state.technologies]
  );

  const ufGetShipCapabilities = useCallback(
    (instanceId: string) => {
      const ufo = state.ufos.find((u) => u.instanceId === instanceId);
      if (!ufo) return null;
      const template = UF_UFOS.find((t) => t.id === ufo.ufoId);
      if (!template) return null;
      const hasCloaking = state.technologies.includes('cloaking-device') || template.special === 'cloaking';
      const hasWarp = state.technologies.includes('warp-drive');
      const hasPhase = template.special === 'phase-shift';
      const canResearch = state.technologies.includes('biometric-scanner') || template.special === 'research-bonus';
      const canTerraform = state.technologies.includes('terraforming') || template.special === 'terraform';
      const canStealthScan = template.special === 'stealth-scan';
      const canAfterburn = template.special === 'afterburn';
      return { hasCloaking, hasWarp, hasPhase, canResearch, canTerraform, canStealthScan, canAfterburn, special: template.special };
    },
    [state.ufos, state.technologies]
  );

  // --- Alien Species ---
  const ufGetSpecies = useCallback(() => state.alienSpecies, [state.alienSpecies]);

  const ufContactSpecies = useCallback(
    (speciesId: string): boolean => {
      const species = state.alienSpecies.find((s) => s.speciesId === speciesId);
      if (!species || species.contacted) return false;
      setState((prev) => ({
        ...prev,
        alienSpecies: prev.alienSpecies.map((s) =>
          s.speciesId === speciesId ? { ...s, contacted: true, relation: 10 } : s
        ),
        totalSpeciesContacted: prev.totalSpeciesContacted + 1,
      }));
      return true;
    },
    [state.alienSpecies]
  );

  const ufGetSpeciesRelation = useCallback(
    (speciesId: string): number => {
      return state.alienSpecies.find((s) => s.speciesId === speciesId)?.relation ?? 0;
    },
    [state.alienSpecies]
  );

  const ufImproveRelation = useCallback((speciesId: string, amount: number = 5) => {
    setState((prev) => ({
      ...prev,
      alienSpecies: prev.alienSpecies.map((s) =>
        s.speciesId === speciesId
          ? { ...s, relation: Math.min(100, s.relation + amount), tradeUnlocked: s.relation + amount >= 30 ? true : s.tradeUnlocked }
          : s
      ),
    }));
  }, []);

  const ufGetDiplomacyStatus = useCallback(
    (speciesId: string): string => {
      const rel = state.alienSpecies.find((s) => s.speciesId === speciesId)?.relation ?? 0;
      const speciesDef = UF_SPECIES.find((s) => s.id === speciesId);
      if (!speciesDef) return 'unknown';
      if (!state.alienSpecies.find((s) => s.speciesId === speciesId)?.contacted) return 'unknown';
      if (rel >= 80) return 'allied';
      if (rel >= 50) return 'friendly';
      if (rel >= 30) return 'neutral';
      if (rel >= 10) return 'wary';
      return 'hostile';
    },
    [state.alienSpecies]
  );

  const ufTradeWithSpecies = useCallback(
    (speciesId: string): boolean => {
      const rel = state.alienSpecies.find((s) => s.speciesId === speciesId);
      if (!rel || !rel.contacted || !rel.tradeUnlocked) return false;
      const speciesDef = UF_SPECIES.find((s) => s.id === speciesId);
      if (!speciesDef) return false;
      const tradedGood = speciesDef.tradeGoods[Math.floor(ufAdvancePRNG() * speciesDef.tradeGoods.length)];
      const existing = state.inventory.find((i) => i.itemId === tradedGood);
      if (existing) {
        setState((prev) => ({
          ...prev,
          inventory: prev.inventory.map((i) => (i.itemId === tradedGood ? { ...i, quantity: i.quantity + 1 } : i)),
          coins: prev.coins - 20,
          totalCoinsSpent: prev.totalCoinsSpent + 20,
          alienSpecies: prev.alienSpecies.map((s) => (s.speciesId === speciesId ? { ...s, relation: Math.min(100, s.relation + 2) } : s)),
        }));
      } else {
        const newItem: InventoryItem = {
          itemId: tradedGood,
          name: tradedGood.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
          quantity: 1,
          type: 'resource',
          description: `A rare good traded with the ${speciesDef.name}.`,
        };
        setState((prev) => ({
          ...prev,
          inventory: [...prev.inventory, newItem],
          coins: prev.coins - 20,
          totalCoinsSpent: prev.totalCoinsSpent + 20,
          alienSpecies: prev.alienSpecies.map((s) => (s.speciesId === speciesId ? { ...s, relation: Math.min(100, s.relation + 2) } : s)),
        }));
      }
      return state.coins >= 20;
    },
    [state.alienSpecies, state.inventory, state.coins, ufAdvancePRNG]
  );

  // --- Planets ---
  const ufGetPlanets = useCallback(() => state.planets, [state.planets]);

  const ufExplorePlanet = useCallback(
    (planetId: string): { success: boolean; xpGained: number; coinsGained: number } => {
      const planetDef = UF_PLANETS.find((p) => p.id === planetId);
      const planetState = state.planets.find((p) => p.planetId === planetId);
      if (!planetDef || !planetState) return { success: false, xpGained: 0, coinsGained: 0 };
      if (state.level < planetDef.minLevel) return { success: false, xpGained: 0, coinsGained: 0 };
      const alreadyExplored = planetState.explored;
      const xpGained = alreadyExplored ? Math.floor(15 * planetDef.danger) : Math.floor(50 * planetDef.danger);
      const coinsGained = alreadyExplored ? Math.floor(10 * planetDef.danger) : Math.floor(30 * planetDef.danger);
      const wasNew = !alreadyExplored;
      setState((prev) => ({
        ...prev,
        planets: prev.planets.map((p) => (p.planetId === planetId ? { ...p, explored: true } : p)),
        xp: prev.xp + xpGained,
        coins: prev.coins + coinsGained,
        totalXPEarned: prev.totalXPEarned + xpGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        totalPlanetsExplored: wasNew ? prev.totalPlanetsExplored + 1 : prev.totalPlanetsExplored,
      }));
      return { success: true, xpGained, coinsGained };
    },
    [state.level, state.planets]
  );

  const ufColonizePlanet = useCallback(
    (planetId: string): boolean => {
      const planetDef = UF_PLANETS.find((p) => p.id === planetId);
      const planetState = state.planets.find((p) => p.planetId === planetId);
      if (!planetDef || !planetState) return false;
      if (!planetState.explored) return false;
      if (planetState.colonized) return false;
      if (state.level < planetDef.minLevel + 3) return false;
      if (state.coins < 500) return false;
      const hasTerraform = state.technologies.includes('terraforming');
      const finalCost = hasTerraform ? 250 : 500;
      if (state.coins < finalCost) return false;
      setState((prev) => ({
        ...prev,
        planets: prev.planets.map((p) => (p.planetId === planetId ? { ...p, colonized: true } : p)),
        coins: prev.coins - finalCost,
        totalCoinsSpent: prev.totalCoinsSpent + finalCost,
      }));
      return true;
    },
    [state.planets, state.level, state.coins, state.technologies]
  );

  const ufGetPlanetResources = useCallback(
    (planetId: string): string[] => {
      const planetState = state.planets.find((p) => p.planetId === planetId);
      if (!planetState?.explored) return [];
      return UF_PLANETS.find((p) => p.id === planetId)?.resources ?? [];
    },
    [state.planets]
  );

  const ufHarvestResources = useCallback(
    (planetId: string): { items: string[]; coinsGained: number } => {
      const planetDef = UF_PLANETS.find((p) => p.id === planetId);
      const planetState = state.planets.find((p) => p.planetId === planetId);
      if (!planetDef || !planetState || !planetState.explored) return { items: [], coinsGained: 0 };
      const coinsGained = Math.floor(20 + planetDef.danger * 10 + ufAdvancePRNG() * 30);
      const harvested = planetDef.resources.filter(() => ufAdvancePRNG() > 0.4);
      const newItems = harvested.map((r): InventoryItem => ({
        itemId: r,
        name: r.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '),
        quantity: 1,
        type: 'resource',
        description: `Harvested from ${planetDef.name}.`,
      }));
      setState((prev) => {
        const updatedInventory = [...prev.inventory];
        for (const item of newItems) {
          const existing = updatedInventory.find((i) => i.itemId === item.itemId);
          if (existing) {
            existing.quantity += 1;
          } else {
            updatedInventory.push({ ...item });
          }
        }
        return {
          ...prev,
          inventory: updatedInventory,
          coins: prev.coins + coinsGained,
          totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
          planets: prev.planets.map((p) =>
            p.planetId === planetId ? { ...p, harvestCount: p.harvestCount + 1, lastHarvest: Date.now ? Date.now() : 0 } : p
          ),
          totalHarvests: prev.totalHarvests + 1,
        };
      });
      return { items: harvested, coinsGained };
    },
    [state.planets, ufAdvancePRNG]
  );

  // --- Technologies ---
  const ufGetTechnologies = useCallback(() => state.technologies, [state.technologies]);

  const ufResearchTech = useCallback(
    (techId: string): boolean => {
      const techDef = UF_TECHNOLOGIES.find((t) => t.id === techId);
      if (!techDef) return false;
      if (state.technologies.includes(techId)) return false;
      if (state.level < 2) return false;
      for (const prereq of techDef.prerequisites) {
        if (!state.technologies.includes(prereq)) return false;
      }
      if (state.coins < techDef.cost) return false;
      setState((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techId],
        coins: prev.coins - techDef.cost,
        totalCoinsSpent: prev.totalCoinsSpent + techDef.cost,
        totalTechsResearched: prev.totalTechsResearched + 1,
      }));
      return true;
    },
    [state.technologies, state.level, state.coins]
  );

  const ufIsTechResearched = useCallback(
    (techId: string): boolean => state.technologies.includes(techId),
    [state.technologies]
  );

  const ufGetTechBonuses = useCallback(() => {
    const bonuses: Record<string, number> = { health: 0, attack: 0, defense: 0, speed: 0, cargo: 0, scan: 0, relation: 0 };
    for (const techId of state.technologies) {
      const tech = UF_TECHNOLOGIES.find((t) => t.id === techId);
      if (!tech) continue;
      for (const eff of tech.effects) {
        if (eff.stat in bonuses) {
          bonuses[eff.stat] += eff.value;
        }
      }
    }
    return bonuses;
  }, [state.technologies]);

  // --- Encounters ---
  const ufGetEncounters = useCallback(() => state.encounters, [state.encounters]);

  const ufGetAvailableEncounters = useCallback(() => {
    return UF_ENCOUNTERS.filter(
      (e) => e.minLevel <= state.level && state.encounters.find((l) => l.encounterId === e.id && l.completed)
    ).map((e) => {
      const log = state.encounters.find((l) => l.encounterId === e.id);
      return { ...e, completed: log?.completed ?? false, attempts: log?.attempts ?? 0, bestScore: log?.bestScore ?? 0 };
    });
  }, [state.level, state.encounters]);

  const ufEngageEncounter = useCallback(
    (encounterId: string, score: number): { success: boolean; xpGained: number; coinsGained: number } => {
      const encounterDef = UF_ENCOUNTERS.find((e) => e.id === encounterId);
      if (!encounterDef) return { success: false, xpGained: 0, coinsGained: 0 };
      if (state.level < encounterDef.minLevel) return { success: false, xpGained: 0, coinsGained: 0 };
      const threshold = encounterDef.difficulty * 10;
      const success = score >= threshold;
      const xpGained = success ? encounterDef.xpReward + Math.floor(score * 0.5) : Math.floor(encounterDef.xpReward * 0.2);
      const coinsGained = success ? encounterDef.coinReward + Math.floor(score * 0.3) : Math.floor(encounterDef.coinReward * 0.1);
      const log = state.encounters.find((l) => l.encounterId === encounterId);
      const wasCompleted = log?.completed ?? false;
      setState((prev) => ({
        ...prev,
        encounters: prev.encounters.map((l) =>
          l.encounterId === encounterId
            ? { ...l, attempts: l.attempts + 1, bestScore: Math.max(l.bestScore, score), completed: true, lastAttempt: Date.now ? Date.now() : 0 }
            : l
        ),
        xp: prev.xp + xpGained,
        coins: prev.coins + coinsGained,
        totalXPEarned: prev.totalXPEarned + xpGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        totalEncountersCompleted: !wasCompleted && success ? prev.totalEncountersCompleted + 1 : prev.totalEncountersCompleted,
      }));
      return { success, xpGained, coinsGained };
    },
    [state.level, state.encounters]
  );

  const ufFleeEncounter = useCallback(
    (encounterId: string): number => {
      const escaped = ufAdvancePRNG() > 0.4;
      const penalty = escaped ? 5 : 20;
      setState((prev) => ({
        ...prev,
        xp: Math.max(0, prev.xp - penalty),
        encounters: prev.encounters.map((l) =>
          l.encounterId === encounterId ? { ...l, attempts: l.attempts + 1 } : l
        ),
      }));
      return penalty;
    },
    [ufAdvancePRNG]
  );

  const ufGetEncounterResult = useCallback(
    (encounterId: string) => {
      return state.encounters.find((l) => l.encounterId === encounterId) ?? null;
    },
    [state.encounters]
  );

  // --- Space Stations ---
  const ufGetStations = useCallback(() => state.stationVisits, [state.stationVisits]);

  const ufGetStationData = useCallback((stationId: string) => UF_STATIONS.find((s) => s.id === stationId) ?? null, []);

  const ufDockAtStation = useCallback(
    (stationId: string): { docked: boolean; discount: number } => {
      const station = UF_STATIONS.find((s) => s.id === stationId);
      if (!station) return { docked: false, discount: 0 };
      const title = ufGetTitleForLevel(state.level);
      const discount = title.level >= 20 ? 0.2 : title.level >= 10 ? 0.1 : 0;
      setState((prev) => ({
        ...prev,
        stationVisits: prev.stationVisits.includes(stationId) ? prev.stationVisits : [...prev.stationVisits, stationId],
      }));
      return { docked: true, discount };
    },
    [state.level]
  );

  const ufTradeAtStation = useCallback(
    (stationId: string): InventoryItem | null => {
      const station = UF_STATIONS.find((s) => s.id === stationId);
      if (!station || !station.services.includes('trade')) return null;
      if (state.coins < 30) return null;
      const tradeItems = [
        { itemId: 'engine-part', name: 'Engine Part', type: 'module' as const, description: 'A useful ship component.' },
        { itemId: 'fuel-cell', name: 'Fuel Cell', type: 'consumable' as const, description: 'Powers your warp drive.' },
        { itemId: 'sensor-array', name: 'Sensor Array', type: 'module' as const, description: 'Enhances scanning range.' },
        { itemId: 'med-pack', name: 'Med Pack', type: 'consumable' as const, description: 'Heals crew members.' },
        { itemId: 'ammo-crate', name: 'Ammo Crate', type: 'consumable' as const, description: 'Restocks weapon systems.' },
        { itemId: 'shield-booster', name: 'Shield Booster', type: 'module' as const, description: 'Temporarily boosts shields.' },
      ];
      const itemTemplate = tradeItems[Math.floor(ufAdvancePRNG() * tradeItems.length)];
      const existing = state.inventory.find((i) => i.itemId === itemTemplate.itemId);
      if (existing) {
        setState((prev) => ({
          ...prev,
          inventory: prev.inventory.map((i) => (i.itemId === itemTemplate.itemId ? { ...i, quantity: i.quantity + 1 } : i)),
          coins: prev.coins - 30,
          totalCoinsSpent: prev.totalCoinsSpent + 30,
        }));
      } else {
        const newItem: InventoryItem = { ...itemTemplate, quantity: 1 };
        setState((prev) => ({
          ...prev,
          inventory: [...prev.inventory, newItem],
          coins: prev.coins - 30,
          totalCoinsSpent: prev.totalCoinsSpent + 30,
        }));
      }
      return { ...itemTemplate, quantity: 1 };
    },
    [state.coins, state.inventory, ufAdvancePRNG]
  );

  const ufRepairAtStation = useCallback(
    (stationId: string, instanceId: string): { repaired: boolean; cost: number } => {
      const station = UF_STATIONS.find((s) => s.id === stationId);
      if (!station || !station.services.includes('repair')) return { repaired: false, cost: 0 };
      const ufo = state.ufos.find((u) => u.instanceId === instanceId);
      if (!ufo || ufo.health >= ufo.maxHealth) return { repaired: false, cost: 0 };
      const damage = ufo.maxHealth - ufo.health;
      const cost = Math.floor(station.repairCost * (damage / ufo.maxHealth) * 3);
      const title = ufGetTitleForLevel(state.level);
      const finalCost = Math.floor(cost * (1 - (title.level >= 20 ? 0.2 : title.level >= 10 ? 0.1 : 0)));
      if (state.coins < finalCost) return { repaired: false, cost: finalCost };
      setState((prev) => ({
        ...prev,
        ufos: prev.ufos.map((u) => (u.instanceId === instanceId ? { ...u, health: u.maxHealth } : u)),
        coins: prev.coins - finalCost,
        totalCoinsSpent: prev.totalCoinsSpent + finalCost,
      }));
      return { repaired: true, cost: finalCost };
    },
    [state.ufos, state.coins, state.level]
  );

  const ufUpgradeAtStation = useCallback(
    (stationId: string, instanceId: string): boolean => {
      const station = UF_STATIONS.find((s) => s.id === stationId);
      if (!station || !station.services.includes('upgrade')) return false;
      return ufUpgradeUFO(instanceId);
    },
    [ufUpgradeUFO]
  );

  // --- Quests ---
  const ufGetQuests = useCallback(() => state.quests, [state.quests]);

  const ufGetAvailableQuests = useCallback(() => {
    return UF_QUESTS.filter((q) => q.minLevel <= state.level && !state.quests.find((s) => s.questId === q.id && s.completed));
  }, [state.level, state.quests]);

  const ufAcceptQuest = useCallback(
    (questId: string): boolean => {
      const questDef = UF_QUESTS.find((q) => q.id === questId);
      if (!questDef) return false;
      if (state.level < questDef.minLevel) return false;
      const questState = state.quests.find((q) => q.questId === questId);
      if (!questState || questState.accepted || questState.completed) return false;
      setState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) => (q.questId === questId ? { ...q, accepted: true, acceptedAt: Date.now ? Date.now() : 0, progress: 0 } : q)),
      }));
      return true;
    },
    [state.level, state.quests]
  );

  const ufCompleteQuest = useCallback(
    (questId: string): { success: boolean; xpGained: number; coinsGained: number } => {
      const questDef = UF_QUESTS.find((q) => q.id === questId);
      const questState = state.quests.find((q) => q.questId === questId);
      if (!questDef || !questState || !questState.accepted || questState.completed) return { success: false, xpGained: 0, coinsGained: 0 };
      const totalTarget = questDef.objectives.reduce((sum, o) => sum + o.target, 0);
      if (questState.progress < totalTarget) return { success: false, xpGained: 0, coinsGained: 0 };
      const wasCompleted = questState.completed;
      setState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) => (q.questId === questId ? { ...q, completed: true, completedAt: Date.now ? Date.now() : 0 } : q)),
        xp: prev.xp + questDef.xpReward,
        coins: prev.coins + questDef.coinReward,
        totalXPEarned: prev.totalXPEarned + questDef.xpReward,
        totalCoinsEarned: prev.totalCoinsEarned + questDef.coinReward,
        totalQuestsCompleted: !wasCompleted ? prev.totalQuestsCompleted + 1 : prev.totalQuestsCompleted,
      }));
      return { success: true, xpGained: questDef.xpReward, coinsGained: questDef.coinReward };
    },
    [state.quests]
  );

  const ufUpdateQuestProgress = useCallback(
    (objectiveType: string, amount: number = 1) => {
      setState((prev) => ({
        ...prev,
        quests: prev.quests.map((q) => {
          if (!q.accepted || q.completed) return q;
          const questDef = UF_QUESTS.find((qd) => qd.id === q.questId);
          if (!questDef) return q;
          const matchesObjective = questDef.objectives.some((o) => o.type === objectiveType);
          if (!matchesObjective) return q;
          const maxProgress = questDef.objectives.reduce((sum, o) => sum + o.target, 0);
          return { ...q, progress: Math.min(maxProgress, q.progress + amount) };
        }),
      }));
    },
    []
  );

  const ufGetQuestProgress = useCallback(
    (questId: string): { current: number; required: number; percent: number } => {
      const questState = state.quests.find((q) => q.questId === questId);
      const questDef = UF_QUESTS.find((q) => q.id === questId);
      if (!questState || !questDef) return { current: 0, required: 1, percent: 0 };
      const required = questDef.objectives.reduce((sum, o) => sum + o.target, 0);
      return { current: questState.progress, required, percent: required > 0 ? Math.min(100, (questState.progress / required) * 100) : 0 };
    },
    [state.quests]
  );

  // --- Achievements ---
  const ufGetAchievements = useCallback(() => state.achievements, [state.achievements]);

  const ufCheckAchievements = useCallback((): string[] => {
    const context: Record<string, number> = {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      totalUFOsBuilt: state.totalUFOsBuilt,
      totalSpeciesContacted: state.totalSpeciesContacted,
      totalPlanetsExplored: state.totalPlanetsExplored,
      totalTechsResearched: state.totalTechsResearched,
      totalEncountersCompleted: state.totalEncountersCompleted,
      totalQuestsCompleted: state.totalQuestsCompleted,
      totalHarvests: state.totalHarvests,
      fleetSize: state.fleetUfoIds.length,
      streak: state.streak,
      achievementCount: state.achievements.length,
    };
    const newlyUnlocked: string[] = [];
    for (const ach of UF_ACHIEVEMENTS) {
      if (state.achievements.includes(ach.id)) continue;
      try {
        const conditionMet = new Function('ctx', `return ctx.${ach.condition}`)(context);
        if (conditionMet) {
          newlyUnlocked.push(ach.id);
        }
      } catch {
        // skip malformed conditions
      }
    }
    if (newlyUnlocked.length > 0) {
      let totalCoinReward = 0;
      for (const id of newlyUnlocked) {
        const ach = UF_ACHIEVEMENTS.find((a) => a.id === id);
        if (ach) totalCoinReward += ach.coinReward;
      }
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...newlyUnlocked],
        coins: prev.coins + totalCoinReward,
        totalCoinsEarned: prev.totalCoinsEarned + totalCoinReward,
      }));
    }
    return newlyUnlocked;
  }, [state]);

  const ufUnlockAchievement = useCallback((achievementId: string): boolean => {
    if (state.achievements.includes(achievementId)) return false;
    const ach = UF_ACHIEVEMENTS.find((a) => a.id === achievementId);
    if (!ach) return false;
    setState((prev) => ({
      ...prev,
      achievements: [...prev.achievements, achievementId],
      coins: prev.coins + ach.coinReward,
      totalCoinsEarned: prev.totalCoinsEarned + ach.coinReward,
    }));
    return true;
  }, [state.achievements]);

  // --- Daily Tasks ---
  const ufGetDailyTask = useCallback(
    (dayIndex: number): DailyTaskState => {
      if (state.dailyTask.dayIndex !== dayIndex) {
        const rng = mulberry32(dayIndex * 7919 + 42);
        const taskTypes = [
          { label: 'Complete 5 encounters', target: 5 },
          { label: 'Explore 3 planets', target: 3 },
          { label: 'Harvest 4 times', target: 4 },
          { label: 'Complete 2 encounters', target: 2 },
          { label: 'Research 1 tech', target: 1 },
          { label: 'Trade at station', target: 3 },
          { label: 'Contact a species', target: 1 },
        ];
        const taskType = taskTypes[Math.floor(rng() * taskTypes.length)];
        return {
          dayIndex,
          claimed: false,
          completed: false,
          progress: 0,
          target: taskType.target,
        };
      }
      return state.dailyTask;
    },
    [state.dailyTask]
  );

  const ufUpdateDailyProgress = useCallback((amount: number = 1) => {
    setState((prev) => ({
      ...prev,
      dailyTask: {
        ...prev.dailyTask,
        progress: Math.min(prev.dailyTask.target, prev.dailyTask.progress + amount),
        completed: prev.dailyTask.progress + amount >= prev.dailyTask.target ? true : prev.dailyTask.completed,
      },
    }));
  }, []);

  const ufClaimDailyReward = useCallback(
    (dayIndex: number): { claimed: boolean; xpGained: number; coinsGained: number; streakBonus: number } => {
      const task = ufGetDailyTask(dayIndex);
      if (task.claimed || !task.completed) return { claimed: false, xpGained: 0, coinsGained: 0, streakBonus: 0 };
      const isNewDay = dayIndex !== state.lastDailyDayIndex;
      const expectedNextDay = state.lastDailyDayIndex + 1;
      const isConsecutive = isNewDay && dayIndex === expectedNextDay;
      const newStreak = isConsecutive ? state.streak + 1 : isNewDay ? 1 : state.streak;
      const streakBonus = Math.min(newStreak * 10, 100);
      const xpGained = 50 + streakBonus;
      const coinsGained = 80 + streakBonus;
      setState((prev) => ({
        ...prev,
        dailyTask: { ...prev.dailyTask, claimed: true },
        xp: prev.xp + xpGained,
        coins: prev.coins + coinsGained,
        totalXPEarned: prev.totalXPEarned + xpGained,
        totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
        streak: newStreak,
        lastDailyDayIndex: dayIndex,
      }));
      return { claimed: true, xpGained, coinsGained, streakBonus };
    },
    [ufGetDailyTask, state.lastDailyDayIndex, state.streak]
  );

  const ufGetStreak = useCallback(() => state.streak, [state.streak]);

  // --- Fleet ---
  const ufGetFleet = useCallback(() => state.fleetUfoIds, [state.fleetUfoIds]);

  const ufSetFormation = useCallback(
    (formationId: string): boolean => {
      const formation = UF_FLEET_FORMATIONS.find((f) => f.id === formationId);
      if (!formation) return false;
      if (state.fleetUfoIds.length < formation.minShips) return false;
      setState((prev) => ({ ...prev, formationId }));
      return true;
    },
    [state.fleetUfoIds.length]
  );

  const ufAddToFleet = useCallback(
    (instanceId: string): boolean => {
      if (!state.ufos.find((u) => u.instanceId === instanceId)) return false;
      if (state.fleetUfoIds.includes(instanceId)) return false;
      if (state.fleetUfoIds.length >= 12) return false;
      setState((prev) => ({ ...prev, fleetUfoIds: [...prev.fleetUfoIds, instanceId] }));
      return true;
    },
    [state.ufos, state.fleetUfoIds]
  );

  const ufRemoveFromFleet = useCallback((instanceId: string) => {
    setState((prev) => ({ ...prev, fleetUfoIds: prev.fleetUfoIds.filter((id) => id !== instanceId) }));
  }, []);

  const ufGetFormationBonus = useCallback(() => {
    const formation = UF_FLEET_FORMATIONS.find((f) => f.id === state.formationId);
    return formation
      ? { attackMod: formation.attackMod, defenseMod: formation.defenseMod, speedMod: formation.speedMod, name: formation.name }
      : { attackMod: 1, defenseMod: 1, speedMod: 1, name: 'None' };
  }, [state.formationId]);

  const ufGetFleetPower = useCallback(() => {
    const formation = ufGetFormationBonus();
    let totalAttack = 0;
    let totalDefense = 0;
    let totalSpeed = 0;
    for (const id of state.fleetUfoIds) {
      const ufo = state.ufos.find((u) => u.instanceId === id);
      if (!ufo) continue;
      totalAttack += ufo.attack;
      totalDefense += ufo.defense;
      totalSpeed += ufo.speed;
    }
    return {
      totalAttack: Math.floor(totalAttack * formation.attackMod),
      totalDefense: Math.floor(totalDefense * formation.defenseMod),
      totalSpeed: Math.floor(totalSpeed * formation.speedMod),
      shipCount: state.fleetUfoIds.length,
      formationName: formation.name,
    };
  }, [state.fleetUfoIds, state.ufos, ufGetFormationBonus]);

  // --- Inventory ---
  const ufGetInventory = useCallback(() => state.inventory, [state.inventory]);

  const ufAddItem = useCallback((item: InventoryItem) => {
    setState((prev) => {
      const existing = prev.inventory.find((i) => i.itemId === item.itemId);
      if (existing) {
        return { ...prev, inventory: prev.inventory.map((i) => (i.itemId === item.itemId ? { ...i, quantity: i.quantity + item.quantity } : i)) };
      }
      return { ...prev, inventory: [...prev.inventory, { ...item }] };
    });
  }, []);

  const ufUseItem = useCallback(
    (itemId: string): { used: boolean; effect: string } => {
      const item = state.inventory.find((i) => i.itemId === itemId);
      if (!item || item.quantity <= 0) return { used: false, effect: '' };
      let effect = '';
      switch (item.type) {
        case 'consumable':
          effect = 'Consumed item. Restored resources.';
          break;
        case 'module':
          effect = 'Module installed. Ship stats improved.';
          break;
        case 'weapon':
          effect = 'Weapon equipped. Attack power increased.';
          break;
        case 'shield':
          effect = 'Shield activated. Defense increased.';
          break;
        case 'artifact':
          effect = 'Artifact studied. Knowledge gained.';
          ufAddXP(25);
          break;
        default:
          effect = 'Item used.';
      }
      setState((prev) => ({
        ...prev,
        inventory: prev.inventory.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)).filter((i) => i.quantity > 0),
      }));
      return { used: true, effect };
    },
    [state.inventory, ufAddXP]
  );

  const ufRemoveItem = useCallback((itemId: string, quantity: number = 1) => {
    setState((prev) => ({
      ...prev,
      inventory: prev.inventory.map((i) => (i.itemId === itemId ? { ...i, quantity: i.quantity - quantity } : i)).filter((i) => i.quantity > 0),
    }));
  }, []);

  // --- Crew ---
  const ufGetCrewMembers = useCallback(() => state.crew, [state.crew]);

  const ufHireCrew = useCallback(
    (role: CrewMember['role']): CrewMember | null => {
      if (state.crew.length >= 20) return null;
      if (state.coins < 100) return null;
      const speciesPool = UF_SPECIES.filter((s) => s.disposition !== 'hostile');
      const species = speciesPool[Math.floor(ufAdvancePRNG() * speciesPool.length)];
      const names: Record<string, string[]> = {
        zetans: ['Vex', 'Orn', 'Kyl', 'Zyn', 'Thal'],
        greys: ['Xel', 'Fip', 'Gon', 'Bix', 'Wok'],
        reptilians: ['Zhark', 'Rexx', 'Krag', 'Thrall', 'Vorn'],
        nordics: ['Astrid', 'Sven', 'Freya', 'Bjorn', 'Sigrid'],
        arcturians: ['Lumina', 'Solace', 'Auren', 'Caelum', 'Eos'],
        annunaki: ['Marduk', 'Enki', 'Ishtar', 'Ninhur', 'Anu'],
        mantids: ['Chitter', 'Hive-7', 'Swarmer', 'Drone-3', 'Larva-9'],
        plaeidians: ['Nova', 'Cosmo', 'Stella', 'Orion', 'Lyra'],
      };
      const nameList = names[species.id] ?? ['Unknown'];
      const name = nameList[Math.floor(ufAdvancePRNG() * nameList.length)];
      const crewMember: CrewMember = {
        crewId: `crew-${state.nextCrewId}`,
        name,
        species: species.name,
        role,
        skill: 10 + Math.floor(ufAdvancePRNG() * 40),
        assignedTo: null,
      };
      setState((prev) => ({
        ...prev,
        crew: [...prev.crew, crewMember],
        coins: prev.coins - 100,
        totalCoinsSpent: prev.totalCoinsSpent + 100,
        nextCrewId: prev.nextCrewId + 1,
      }));
      return crewMember;
    },
    [state.crew.length, state.coins, state.nextCrewId, ufAdvancePRNG]
  );

  const ufDismissCrew = useCallback((crewId: string) => {
    setState((prev) => ({
      ...prev,
      crew: prev.crew.filter((c) => c.crewId !== crewId),
    }));
  }, []);

  const ufAssignCrew = useCallback((crewId: string, instanceId: string | null) => {
    setState((prev) => ({
      ...prev,
      crew: prev.crew.map((c) => (c.crewId === crewId ? { ...c, assignedTo: instanceId } : c)),
    }));
  }, []);

  const ufGetCrewBonus = useCallback(
    (instanceId: string): { attackBonus: number; defenseBonus: number; speedBonus: number; researchBonus: number } => {
      const assignedCrew = state.crew.filter((c) => c.assignedTo === instanceId);
      let attackBonus = 0;
      let defenseBonus = 0;
      let speedBonus = 0;
      let researchBonus = 0;
      for (const crew of assignedCrew) {
        const skillFactor = crew.skill / 50;
        switch (crew.role) {
          case 'warrior':
            attackBonus += Math.floor(10 * skillFactor);
            break;
          case 'engineer':
            defenseBonus += Math.floor(8 * skillFactor);
            speedBonus += Math.floor(3 * skillFactor);
            break;
          case 'pilot':
            speedBonus += Math.floor(12 * skillFactor);
            break;
          case 'scientist':
            researchBonus += Math.floor(15 * skillFactor);
            break;
          case 'diplomat':
            defenseBonus += Math.floor(5 * skillFactor);
            break;
          case 'medic':
            defenseBonus += Math.floor(7 * skillFactor);
            break;
        }
      }
      return { attackBonus, defenseBonus, speedBonus, researchBonus };
    },
    [state.crew]
  );

  // --- Stats & Info ---
  const ufGetStats = useCallback(() => {
    return {
      level: state.level,
      title: ufGetTitleForLevel(state.level).title,
      xp: state.xp,
      coins: state.coins,
      ufoCount: state.ufos.length,
      fleetSize: state.fleetUfoIds.length,
      speciesContacted: state.totalSpeciesContacted,
      planetsExplored: state.totalPlanetsExplored,
      techsResearched: state.totalTechsResearched,
      encountersCompleted: state.totalEncountersCompleted,
      questsCompleted: state.totalQuestsCompleted,
      achievementsUnlocked: state.achievements.length,
      crewSize: state.crew.length,
      streak: state.streak,
      totalXPEarned: state.totalXPEarned,
      totalCoinsEarned: state.totalCoinsEarned,
      totalCoinsSpent: state.totalCoinsSpent,
    };
  }, [state]);

  const ufCalculateRank = useCallback((): number => {
    const power = ufGetFleetPower().totalAttack + ufGetFleetPower().totalDefense;
    const techScore = state.technologies.length * 50;
    const exploreScore = state.totalPlanetsExplored * 30;
    const encounterScore = state.totalEncountersCompleted * 20;
    const speciesScore = state.totalSpeciesContacted * 40;
    return power + techScore + exploreScore + encounterScore + speciesScore + state.level * 100;
  }, [ufGetFleetPower, state.technologies.length, state.totalPlanetsExplored, state.totalEncountersCompleted, state.totalSpeciesContacted, state.level]);

  // --- Sector Scan ---
  const ufScanSector = useCallback(
    (sectorName: string): { planets: string[]; encounters: AlienEncounter[]; stations: string[] } => {
      const planets = UF_PLANETS.filter((p) => p.sector === sectorName).map((p) => p.name);
      const encounters = UF_ENCOUNTERS.filter((e) => e.minLevel <= state.level + 3).slice(0, 3);
      const stations = UF_STATIONS.filter((s) => s.location.includes(sectorName)).map((s) => s.name);
      return { planets, encounters, stations };
    },
    [state.level]
  );

  // --- Galaxy Map ---
  const ufGetGalaxyMap = useCallback(() => {
    const sectors: Record<string, { planets: string[]; dangerRange: [number, number]; unlocked: boolean }> = {};
    for (const planet of UF_PLANETS) {
      if (!sectors[planet.sector]) {
        sectors[planet.sector] = { planets: [], dangerRange: [99, 0], unlocked: false };
      }
      sectors[planet.sector].planets.push(planet.name);
      sectors[planet.sector].dangerRange[0] = Math.min(sectors[planet.sector].dangerRange[0], planet.danger);
      sectors[planet.sector].dangerRange[1] = Math.max(sectors[planet.sector].dangerRange[1], planet.danger);
    }
    for (const key of Object.keys(sectors)) {
      const minDanger = sectors[key].dangerRange[0];
      sectors[key].unlocked = state.level >= minDanger + 2;
    }
    return sectors;
  }, [state.level]);

  // --- NPCs ---
  const ufGetNPCData = useCallback((npcId: string) => UF_NPCS.find((n) => n.id === npcId) ?? null, []);

  const ufGetNPCsAtStation = useCallback(
    (stationId: string) => UF_NPCS.filter((n) => n.location === stationId),
    []
  );

  const ufTalkToNPC = useCallback((npcId: string): { greeting: string; hasQuest: boolean; questId: string | null } => {
    const npc = UF_NPCS.find((n) => n.id === npcId);
    if (!npc) return { greeting: '', hasQuest: false, questId: null };
    const hasQuest = npc.questId !== null && !state.quests.find((q) => q.questId === npc.questId && (q.accepted || q.completed));
    return { greeting: npc.greeting, hasQuest, questId: npc.questId };
  }, [state.quests]);

  // --- Utilities ---
  const ufGetSeed = useCallback(() => state.prngSeed, [state.prngSeed]);

  const ufSetSeed = useCallback(
    (newSeed: number) => {
      ufResetPRNG(newSeed);
    },
    [ufResetPRNG]
  );

  const ufExportState = useCallback((): string => {
    try {
      return JSON.stringify(state);
    } catch {
      return '{}';
    }
  }, [state]);

  const ufImportState = useCallback((json: string): boolean => {
    try {
      const parsed = JSON.parse(json) as Partial<UFOCommandState>;
      if (typeof parsed.level !== 'number') return false;
      setState((prev) => ({ ...prev, ...parsed }));
      return true;
    } catch {
      return false;
    }
  }, []);

  const ufGetColonyCount = useCallback(() => state.planets.filter((p) => p.colonized).length, [state.planets]);

  const ufGetTotalFleetCargo = useCallback(() => {
    return state.fleetUfoIds.reduce((total, id) => {
      const ufo = state.ufos.find((u) => u.instanceId === id);
      return total + (ufo?.cargo ?? 0);
    }, 0);
  }, [state.fleetUfoIds, state.ufos]);

  const ufGetEffectiveStats = useCallback(
    (instanceId: string) => {
      const base = ufGetShipStats(instanceId);
      const crewBonus = ufGetCrewBonus(instanceId);
      const formation = ufGetFormationBonus();
      if (!base) return null;
      const isInFleet = state.fleetUfoIds.includes(instanceId);
      return {
        ...base,
        health: base.health + (crewBonus.defenseBonus * 2),
        maxHealth: base.maxHealth + (crewBonus.defenseBonus * 2),
        attack: Math.floor(base.attack * (isInFleet ? formation.attackMod : 1)) + crewBonus.attackBonus,
        defense: Math.floor(base.defense * (isInFleet ? formation.defenseMod : 1)) + crewBonus.defenseBonus,
        speed: Math.floor(base.speed * (isInFleet ? formation.speedMod : 1)) + crewBonus.speedBonus,
        researchBonus: crewBonus.researchBonus,
      };
    },
    [ufGetShipStats, ufGetCrewBonus, ufGetFormationBonus, state.fleetUfoIds]
  );

  // --- Tech Tree ---
  const ufGetTechTree = useCallback((): { id: string; name: string; category: string; researched: boolean; available: boolean; cost: number; prerequisites: string[] }[] => {
    return UF_TECHNOLOGIES.map((tech) => ({
      id: tech.id,
      name: tech.name,
      category: tech.category,
      researched: state.technologies.includes(tech.id),
      available: tech.prerequisites.every((p) => state.technologies.includes(p)) && !state.technologies.includes(tech.id),
      cost: tech.cost,
      prerequisites: tech.prerequisites,
    }));
  }, [state.technologies]);

  // --- Species Summary ---
  const ufGetSpeciesSummary = useCallback((): { id: string; name: string; disposition: string; contacted: boolean; relation: number; tradeUnlocked: boolean; diplomacyStatus: string }[] => {
    return UF_SPECIES.map((sp) => {
      const rel = state.alienSpecies.find((s) => s.speciesId === sp.id);
      const relationValue = rel?.relation ?? 0;
      const contacted = rel?.contacted ?? false;
      const tradeUnlocked = rel?.tradeUnlocked ?? false;
      let diplomacyStatus = 'unknown';
      if (contacted) {
        if (relationValue >= 80) diplomacyStatus = 'allied';
        else if (relationValue >= 50) diplomacyStatus = 'friendly';
        else if (relationValue >= 30) diplomacyStatus = 'neutral';
        else if (relationValue >= 10) diplomacyStatus = 'wary';
        else diplomacyStatus = 'hostile';
      }
      return { id: sp.id, name: sp.name, disposition: sp.disposition, contacted, relation: relationValue, tradeUnlocked, diplomacyStatus };
    });
  }, [state.alienSpecies]);

  // --- Encounter History ---
  const ufGetEncounterHistory = useCallback((): { id: string; name: string; type: string; difficulty: number; completed: boolean; attempts: number; bestScore: number }[] => {
    return UF_ENCOUNTERS.map((enc) => {
      const log = state.encounters.find((l) => l.encounterId === enc.id);
      return {
        id: enc.id,
        name: enc.name,
        type: enc.type,
        difficulty: enc.difficulty,
        completed: log?.completed ?? false,
        attempts: log?.attempts ?? 0,
        bestScore: log?.bestScore ?? 0,
      };
    });
  }, [state.encounters]);

  // --- Ship Comparison ---
  const ufCompareShips = useCallback(
    (instanceIdA: string, instanceIdB: string): { shipA: ReturnType<typeof ufGetShipStats>; shipB: ReturnType<typeof ufGetShipStats>; winner: string } | null => {
      const statsA = ufGetShipStats(instanceIdA);
      const statsB = ufGetShipStats(instanceIdB);
      if (!statsA || !statsB) return null;
      const powerA = statsA.attack * 2 + statsA.defense * 1.5 + statsA.speed + statsA.health * 0.5;
      const powerB = statsB.attack * 2 + statsB.defense * 1.5 + statsB.speed + statsB.health * 0.5;
      const winner = powerA > powerB ? 'A' : powerB > powerA ? 'B' : 'tie';
      return { shipA: statsA, shipB: statsB, winner };
    },
    [ufGetShipStats]
  );

  // --- Combat Rating ---
  const ufGetCombatRating = useCallback((): { rating: string; score: number; maxPossible: number; percent: number } => {
    const fleetPower = ufGetFleetPower();
    const totalTechAttack = state.technologies.reduce((acc, id) => {
      const tech = UF_TECHNOLOGIES.find((t) => t.id === id);
      return acc + (tech?.effects.find((e) => e.stat === 'attack')?.value ?? 0);
    }, 0);
    const score = fleetPower.totalAttack + fleetPower.totalDefense + totalTechAttack + state.level * 10;
    const maxPossible = 5000;
    const percent = Math.min(100, (score / maxPossible) * 100);
    let rating = 'F';
    if (percent >= 90) rating = 'S';
    else if (percent >= 75) rating = 'A';
    else if (percent >= 60) rating = 'B';
    else if (percent >= 45) rating = 'C';
    else if (percent >= 30) rating = 'D';
    else if (percent >= 15) rating = 'E';
    return { rating, score, maxPossible, percent };
  }, [ufGetFleetPower, state.technologies, state.level]);

  // --- Battle Simulation ---
  const ufSimulateBattle = useCallback(
    (instanceId: string, enemyPower: number): { victory: boolean; remainingHealth: number; damageDealt: number; damageTaken: number } => {
      const stats = ufGetShipStats(instanceId);
      if (!stats) return { victory: false, remainingHealth: 0, damageDealt: 0, damageTaken: 0 };
      const myPower = stats.attack * 1.5 + stats.defense + stats.speed * 0.5;
      const healthPool = stats.maxHealth + stats.defense * 2;
      const enemyHealth = enemyPower * 8;
      const myDPS = stats.attack * (1 + stats.speed * 0.02);
      const enemyDPS = enemyPower * 1.2;
      const roundsToKillEnemy = Math.ceil(enemyHealth / Math.max(1, myDPS));
      const roundsToKillMe = Math.ceil(healthPool / Math.max(1, enemyDPS));
      const victory = roundsToKillEnemy <= roundsToKillMe;
      const damageDealt = Math.floor(myDPS * roundsToKillEnemy);
      const damageTaken = victory ? Math.floor(enemyDPS * roundsToKillEnemy) : healthPool;
      const remainingHealth = victory ? Math.max(0, healthPool - damageTaken) : 0;
      return { victory, remainingHealth, damageDealt, damageTaken };
    },
    [ufGetShipStats]
  );

  // --- Resource Summary ---
  const ufGetResourceSummary = useCallback((): { resourceId: string; name: string; quantity: number; type: string }[] => {
    const resourceMap: Record<string, { name: string; quantity: number; type: string }> = {};
    for (const item of state.inventory) {
      if (item.type === 'resource') {
        if (!resourceMap[item.itemId]) {
          resourceMap[item.itemId] = { name: item.name, quantity: 0, type: item.type };
        }
        resourceMap[item.itemId].quantity += item.quantity;
      }
    }
    return Object.entries(resourceMap).map(([id, data]) => ({ resourceId: id, ...data }));
  }, [state.inventory]);

  // --- Galaxy Stats ---
  const ufGetGalaxyStats = useCallback((): { totalSectors: number; exploredSectors: number; totalPlanets: number; exploredPlanets: number; colonizedPlanets: number; totalSpecies: number; contactedSpecies: number; alliedSpecies: number; totalStations: number; visitedStations: number } => {
    const sectors = new Set(UF_PLANETS.map((p) => p.sector));
    const exploredSectors = new Set(
      UF_PLANETS.filter((p) => state.planets.find((s) => s.planetId === p.id && s.explored)).map((p) => p.sector)
    );
    const exploredPlanets = state.planets.filter((p) => p.explored).length;
    const colonizedPlanets = state.planets.filter((p) => p.colonized).length;
    const contactedSpecies = state.alienSpecies.filter((s) => s.contacted).length;
    const alliedSpecies = state.alienSpecies.filter((s) => s.contacted && s.relation >= 80).length;
    return {
      totalSectors: sectors.size,
      exploredSectors: exploredSectors.size,
      totalPlanets: UF_PLANETS.length,
      exploredPlanets,
      colonizedPlanets,
      totalSpecies: UF_SPECIES.length,
      contactedSpecies,
      alliedSpecies,
      totalStations: UF_STATIONS.length,
      visitedStations: state.stationVisits.length,
    };
  }, [state.planets, state.alienSpecies, state.stationVisits]);

  // --- Next Recommended Action ---
  const ufGetNextRecommendedAction = useCallback((): { action: string; description: string; priority: number } => {
    const recommendations: { action: string; description: string; priority: number }[] = [];
    // If no ships, build one
    if (state.ufos.length === 0) {
      recommendations.push({ action: 'build-ufo', description: 'Build your first UFO to begin exploring the galaxy.', priority: 100 });
    }
    // If no active daily, suggest it
    if (!state.dailyTask.completed && !state.dailyTask.claimed) {
      recommendations.push({ action: 'daily-task', description: 'Complete your daily patrol task for bonus rewards.', priority: 90 });
    }
    // Suggest available quests
    const availableQuests = UF_QUESTS.filter((q) => q.minLevel <= state.level && !state.quests.find((s) => s.questId === q.id && s.completed));
    if (availableQuests.length > 0) {
      const unaccepted = availableQuests.filter((q) => !state.quests.find((s) => s.questId === q.id && s.accepted));
      if (unaccepted.length > 0) {
        recommendations.push({ action: 'accept-quest', description: `Accept the quest "${unaccepted[0].name}" for rewards.`, priority: 80 });
      }
    }
    // Suggest exploring unexplored planets
    const unexplored = UF_PLANETS.filter((p) => p.minLevel <= state.level && !state.planets.find((s) => s.planetId === p.id && s.explored));
    if (unexplored.length > 0) {
      recommendations.push({ action: 'explore-planet', description: `Explore ${unexplored[0].name} in the ${unexplored[0].sector} sector.`, priority: 70 });
    }
    // Suggest contacting species
    const uncontacted = UF_SPECIES.filter((s) => !state.alienSpecies.find((r) => r.speciesId === s.id && r.contacted));
    if (uncontacted.length > 0 && state.level >= 3) {
      recommendations.push({ action: 'contact-species', description: `Attempt first contact with the ${uncontacted[0].name}.`, priority: 65 });
    }
    // Suggest researching tech
    const availableTech = UF_TECHNOLOGIES.filter((t) => !state.technologies.includes(t.id) && t.prerequisites.every((p) => state.technologies.includes(p)) && t.cost <= state.coins);
    if (availableTech.length > 0) {
      recommendations.push({ action: 'research-tech', description: `Research "${availableTech[0].name}" to enhance your fleet.`, priority: 60 });
    }
    // Default
    if (recommendations.length === 0) {
      recommendations.push({ action: 'explore', description: 'Continue exploring the galaxy and engaging in encounters.', priority: 10 });
    }
    recommendations.sort((a, b) => b.priority - a.priority);
    return recommendations[0];
  }, [state.ufos.length, state.dailyTask, state.quests, state.level, state.planets, state.alienSpecies, state.technologies, state.coins]);

  // --- Patrol Report ---
  const ufGetPatrolReport = useCallback((): { encountersToday: number; successRate: number; averageScore: number; totalDamage: number; resourcesGained: number; mostDangerousSector: string } => {
    const completedEncounters = state.encounters.filter((e) => e.completed);
    const totalAttempts = state.encounters.reduce((sum, e) => sum + e.attempts, 0);
    const successRate = totalAttempts > 0 ? (completedEncounters.length / totalAttempts) * 100 : 0;
    const averageScore = completedEncounters.length > 0
      ? completedEncounters.reduce((sum, e) => sum + e.bestScore, 0) / completedEncounters.length
      : 0;
    // Calculate most dangerous sector based on completed encounters
    const sectorDanger: Record<string, number> = {};
    for (const encounter of UF_ENCOUNTERS) {
      const log = state.encounters.find((l) => l.encounterId === encounter.id && l.completed);
      if (log) {
        // Assign encounters to sectors based on difficulty
        const sector = encounter.difficulty >= 8 ? 'Deep Space' : encounter.difficulty >= 5 ? 'Outer Rim' : encounter.difficulty >= 3 ? 'Colonized Zone' : 'Core Systems';
        sectorDanger[sector] = (sectorDanger[sector] || 0) + encounter.difficulty;
      }
    }
    let mostDangerousSector = 'None';
    let maxDanger = 0;
    for (const [sector, danger] of Object.entries(sectorDanger)) {
      if (danger > maxDanger) {
        maxDanger = danger;
        mostDangerousSector = sector;
      }
    }
    return {
      encountersToday: completedEncounters.length,
      successRate: Math.round(successRate * 10) / 10,
      averageScore: Math.round(averageScore * 10) / 10,
      totalDamage: Math.floor(averageScore * 0.3),
      resourcesGained: state.totalHarvests * 15 + state.totalEncountersCompleted * 25,
      mostDangerousSector,
    };
  }, [state.encounters, state.totalHarvests, state.totalEncountersCompleted]);

  // --- Achievement Progress ---
  const ufGetAchievementProgress = useCallback((): { id: string; name: string; icon: string; unlocked: boolean; progress: number; target: number; percent: number; description: string; coinReward: number }[] => {
    const context: Record<string, number> = {
      level: state.level,
      xp: state.xp,
      coins: state.coins,
      totalUFOsBuilt: state.totalUFOsBuilt,
      totalSpeciesContacted: state.totalSpeciesContacted,
      totalPlanetsExplored: state.totalPlanetsExplored,
      totalTechsResearched: state.totalTechsResearched,
      totalEncountersCompleted: state.totalEncountersCompleted,
      totalQuestsCompleted: state.totalQuestsCompleted,
      totalHarvests: state.totalHarvests,
      fleetSize: state.fleetUfoIds.length,
      streak: state.streak,
      achievementCount: state.achievements.length,
    };
    return UF_ACHIEVEMENTS.map((ach) => {
      const unlocked = state.achievements.includes(ach.id);
      // Extract target from condition
      const match = ach.condition.match(/(\d+)/);
      const target = match ? parseInt(match[1], 10) : 1;
      // Extract current value
      const varMatch = ach.condition.match(/^([a-zA-Z]+)/);
      const varName = varMatch ? varMatch[1] : '';
      const current = context[varName] ?? 0;
      const progress = Math.min(current, target);
      const percent = target > 0 ? Math.min(100, (progress / target) * 100) : 0;
      return { id: ach.id, name: ach.name, icon: ach.icon, unlocked, progress, target, percent, description: ach.description, coinReward: ach.coinReward };
    });
  }, [state]);

  // =============================================================================
  // RETURN OBJECT
  // =============================================================================

  return {
    // Core
    ufGetState,
    ufResetState,
    ufGetSeed,
    ufSetSeed,
    ufExportState,
    ufImportState,
    // Level & XP
    ufGetLevel,
    ufGetTitle,
    ufGetProgress,
    ufGetXPForNextLevel,
    ufAddXP,
    ufLevelUp,
    // Coins
    ufGetCoins,
    ufAddCoins,
    ufSpendCoins,
    // UFOs
    ufGetUFOs,
    ufGetActiveUFO,
    ufBuildUFO,
    ufUpgradeUFO,
    ufSetActiveUFO,
    ufDestroyUFO,
    ufGetShipStats,
    ufGetShipCapabilities,
    // Alien Species
    ufGetSpecies,
    ufContactSpecies,
    ufGetSpeciesRelation,
    ufImproveRelation,
    ufGetDiplomacyStatus,
    ufTradeWithSpecies,
    // Planets
    ufGetPlanets,
    ufExplorePlanet,
    ufColonizePlanet,
    ufGetPlanetResources,
    ufHarvestResources,
    ufGetColonyCount,
    // Technologies
    ufGetTechnologies,
    ufResearchTech,
    ufIsTechResearched,
    ufGetTechBonuses,
    // Encounters
    ufGetEncounters,
    ufGetAvailableEncounters,
    ufEngageEncounter,
    ufFleeEncounter,
    ufGetEncounterResult,
    // Stations
    ufGetStations,
    ufGetStationData,
    ufDockAtStation,
    ufTradeAtStation,
    ufRepairAtStation,
    ufUpgradeAtStation,
    // Quests
    ufGetQuests,
    ufGetAvailableQuests,
    ufAcceptQuest,
    ufCompleteQuest,
    ufUpdateQuestProgress,
    ufGetQuestProgress,
    // Achievements
    ufGetAchievements,
    ufCheckAchievements,
    ufUnlockAchievement,
    // Daily
    ufGetDailyTask,
    ufUpdateDailyProgress,
    ufClaimDailyReward,
    ufGetStreak,
    // Fleet
    ufGetFleet,
    ufSetFormation,
    ufAddToFleet,
    ufRemoveFromFleet,
    ufGetFormationBonus,
    ufGetFleetPower,
    ufGetTotalFleetCargo,
    // Inventory
    ufGetInventory,
    ufAddItem,
    ufUseItem,
    ufRemoveItem,
    // Crew
    ufGetCrewMembers,
    ufHireCrew,
    ufDismissCrew,
    ufAssignCrew,
    ufGetCrewBonus,
    // Stats & Map
    ufGetStats,
    ufCalculateRank,
    ufScanSector,
    ufGetGalaxyMap,
    ufGetEffectiveStats,
    // Analysis
    ufGetTechTree,
    ufGetSpeciesSummary,
    ufGetEncounterHistory,
    ufCompareShips,
    ufGetCombatRating,
    ufSimulateBattle,
    ufGetResourceSummary,
    ufGetGalaxyStats,
    ufGetNextRecommendedAction,
    ufGetPatrolReport,
    ufGetAchievementProgress,
    // NPCs
    ufGetNPCData,
    ufGetNPCsAtStation,
    ufTalkToNPC,
    // PRNG
    ufAdvancePRNG,
    ufResetPRNG,
  };
}

export default useUFOCommand;
