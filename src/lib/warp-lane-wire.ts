'use client'

import { useState } from 'react'

// ============================================================
// TYPES
// ============================================================

export type ShipId =
  | 'razor'
  | 'viper'
  | 'phantom'
  | 'comet'
  | 'nova'
  | 'eclipse'
  | 'pulsar'
  | 'quasar'
  | 'nebula'
  | 'void_runner'

export type TrackId =
  | 'alpha_corridor'
  | 'nebula_drift'
  | 'pulsar_run'
  | 'void_stretch'
  | 'quantum_leap'
  | 'dark_matter_slick'
  | 'light_speed_lane'
  | 'wormhole_loop'
  | 'cosmic_rift'
  | 'solar_flare'
  | 'gravity_well'
  | 'infinity_stretch'

export type ObstacleId =
  | 'asteroid_field'
  | 'energy_storm'
  | 'gravity_anomaly'
  | 'temporal_rift'
  | 'dark_zone'
  | 'ion_cloud'

export type PowerUpId =
  | 'speed_boost'
  | 'shield_regen'
  | 'energy_drain'
  | 'time_warp'
  | 'phase_shift'
  | 'warp_jump'
  | 'magnet'
  | 'emp_pulse'

export type ComponentId = 'engine' | 'thrusters' | 'shield_gen' | 'power_core' | 'hull'

export type RaceMode = 'sprint' | 'circuit' | 'time_trial' | 'elimination'

export interface ShipStats {
  speed: number
  handling: number
  boost: number
  shield: number
  energy: number
  mass: number
}

export interface ShipDefinition {
  id: ShipId
  name: string
  description: string
  baseStats: ShipStats
  unlockLevel: number
  cost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface TrackDefinition {
  id: TrackId
  name: string
  description: string
  difficulty: number
  length: number
  baseReward: number
  hazardDensity: number
  themeColor: string
}

export interface ObstacleDefinition {
  id: ObstacleId
  name: string
  description: string
  damage: number
  speedPenalty: number
  duration: number
  avoidanceDifficulty: number
}

export interface PowerUpDefinition {
  id: PowerUpId
  name: string
  description: string
  duration: number
  effectValue: number
  rarity: 'common' | 'rare' | 'epic'
}

export interface ShipComponent {
  id: ComponentId
  name: string
  description: string
  statAffected: keyof ShipStats
  level: number
  maxLevel: number
}

export interface AchievementDef {
  id: string
  name: string
  description: string
  condition: string
  reward: number
  icon: string
  category: 'racing' | 'combat' | 'exploration' | 'collection' | 'mastery'
}

export interface LeaderboardEntry {
  racerName: string
  shipId: ShipId
  trackId: TrackId
  mode: RaceMode
  score: number
  time: number
  date: string
}

export interface DailyChallenge {
  id: string
  trackId: TrackId
  mode: RaceMode
  objective: string
  targetValue: number
  reward: number
  date: string
  completed: boolean
  progress: number
}

export interface RaceResult {
  trackId: TrackId
  mode: RaceMode
  shipId: ShipId
  score: number
  time: number
  wordsTyped: number
  wordsPerMinute: number
  comboMax: number
  obstaclesHit: number
  powerUpsCollected: number
  position: number
  creditsEarned: number
  xpEarned: number
}

export interface WarpLaneState {
  racerLevel: number
  racerXP: number
  racerXPToNext: number
  credits: number
  selectedShip: ShipId
  unlockedShips: ShipId[]
  selectedTrack: TrackId
  selectedMode: RaceMode
  shipComponents: Record<ComponentId, number>
  shipPaint: string
  shipTrail: string
  totalRaces: number
  totalWins: number
  totalWordsTyped: number
  totalDistance: number
  bestCombo: number
  currentCombo: number
  comboMultiplier: number
  currentSpeed: number
  currentShieldHP: number
  currentEnergy: number
  boostActive: boolean
  boostTimer: number
  activePowerUps: PowerUpId[]
  powerUpTimers: Record<PowerUpId, number>
  raceInProgress: boolean
  raceTime: number
  raceDistance: number
  raceScore: number
  raceWordsTyped: number
  raceComboMax: number
  raceObstaclesHit: number
  racePowerUpsCollected: number
  activeObstacles: ObstacleId[]
  obstacleTimers: Record<ObstacleId, number>
  achievements: string[]
  leaderboard: LeaderboardEntry[]
  dailyChallenges: DailyChallenge[]
  lastDailyRefresh: string
  raceHistory: RaceResult[]
  settingsVolume: number
  settingsSFX: number
  settingsParticles: boolean
  settingsScreenShake: boolean
  settingsAutoBoost: boolean
  settingsDifficulty: 'easy' | 'normal' | 'hard' | 'insane'
  tutorialCompleted: boolean
  tutorialStep: number
  title: string
  shipFavorites: ShipId[]
  trackFavorites: TrackId[]
  mostPlayedTrack: TrackId | null
  mostUsedShip: ShipId | null
  currentWord: string
  typedLetters: string
  wordQueue: string[]
  racePositions: string[]
  eliminationLives: number
  timeTrialBestTimes: Record<TrackId, number>
  sprintBestScores: Record<TrackId, number>
  circuitBestLaps: Record<TrackId, number>
  totalCreditsEarned: number
  totalXPEarned: number
}

// ============================================================
// CONSTANTS
// ============================================================

const SHIPS: ShipDefinition[] = [
  {
    id: 'razor',
    name: 'Razor',
    description: 'A sleek interceptor built for pure speed. Thin hull cuts through space debris.',
    baseStats: { speed: 92, handling: 70, boost: 85, shield: 45, energy: 60, mass: 30 },
    unlockLevel: 1,
    cost: 0,
    rarity: 'common',
  },
  {
    id: 'viper',
    name: 'Viper',
    description: 'Agile and deadly. The Viper can weave through asteroid fields with ease.',
    baseStats: { speed: 78, handling: 95, boost: 75, shield: 50, energy: 65, mass: 35 },
    unlockLevel: 1,
    cost: 500,
    rarity: 'common',
  },
  {
    id: 'phantom',
    name: 'Phantom',
    description: 'Cloaked in dark matter resonance. Nearly invisible on sensors.',
    baseStats: { speed: 80, handling: 82, boost: 90, shield: 40, energy: 80, mass: 28 },
    unlockLevel: 5,
    cost: 1200,
    rarity: 'rare',
  },
  {
    id: 'comet',
    name: 'Comet',
    description: 'Trailblazer with a blazing energy tail. Built for extended sprints.',
    baseStats: { speed: 85, handling: 68, boost: 88, shield: 55, energy: 90, mass: 40 },
    unlockLevel: 8,
    cost: 1800,
    rarity: 'rare',
  },
  {
    id: 'nova',
    name: 'Nova',
    description: 'Explosive acceleration and devastating EMP capabilities.',
    baseStats: { speed: 75, handling: 72, boost: 95, shield: 60, energy: 55, mass: 50 },
    unlockLevel: 12,
    cost: 3000,
    rarity: 'epic',
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    description: 'Dark energy powered warship. Shield strength is unmatched.',
    baseStats: { speed: 65, handling: 60, boost: 70, shield: 98, energy: 85, mass: 70 },
    unlockLevel: 16,
    cost: 3500,
    rarity: 'epic',
  },
  {
    id: 'pulsar',
    name: 'Pulsar',
    description: 'Rhythmic energy pulses propel it in bursts of incredible speed.',
    baseStats: { speed: 88, handling: 75, boost: 92, shield: 50, energy: 70, mass: 38 },
    unlockLevel: 20,
    cost: 5000,
    rarity: 'epic',
  },
  {
    id: 'quasar',
    name: 'Quasar',
    description: 'The brightest ship in any fleet. Raw power radiates from its core.',
    baseStats: { speed: 95, handling: 65, boost: 85, shield: 48, energy: 95, mass: 42 },
    unlockLevel: 28,
    cost: 7500,
    rarity: 'legendary',
  },
  {
    id: 'nebula',
    name: 'Nebula',
    description: 'Swirls of cosmic gas form an adaptive energy shield around this beauty.',
    baseStats: { speed: 72, handling: 80, boost: 78, shield: 85, energy: 88, mass: 55 },
    unlockLevel: 35,
    cost: 10000,
    rarity: 'legendary',
  },
  {
    id: 'void_runner',
    name: 'Void Runner',
    description: 'Engineered at the edge of reality. defies conventional physics entirely.',
    baseStats: { speed: 90, handling: 90, boost: 90, shield: 70, energy: 90, mass: 25 },
    unlockLevel: 45,
    cost: 20000,
    rarity: 'legendary',
  },
]

const TRACKS: TrackDefinition[] = [
  {
    id: 'alpha_corridor',
    name: 'Alpha Corridor',
    description: 'The standard hyperspace route. A balanced track for all skill levels.',
    difficulty: 1,
    length: 1000,
    baseReward: 100,
    hazardDensity: 0.3,
    themeColor: '#4a9eff',
  },
  {
    id: 'nebula_drift',
    name: 'Nebula Drift',
    description: 'Navigate through shimmering gas clouds that reduce visibility.',
    difficulty: 2,
    length: 1200,
    baseReward: 150,
    hazardDensity: 0.35,
    themeColor: '#cc66ff',
  },
  {
    id: 'pulsar_run',
    name: 'Pulsar Run',
    description: 'Ride the shockwaves of a dying star. Intense energy fluctuations.',
    difficulty: 3,
    length: 800,
    baseReward: 180,
    hazardDensity: 0.5,
    themeColor: '#ff9900',
  },
  {
    id: 'void_stretch',
    name: 'Void Stretch',
    description: 'An endless expanse of nothing. Speed is the only defense here.',
    difficulty: 4,
    length: 1500,
    baseReward: 200,
    hazardDensity: 0.25,
    themeColor: '#1a0a2e',
  },
  {
    id: 'quantum_leap',
    name: 'Quantum Leap',
    description: 'Reality shifts at every turn. Track layout changes dynamically.',
    difficulty: 5,
    length: 1100,
    baseReward: 250,
    hazardDensity: 0.55,
    themeColor: '#00ffcc',
  },
  {
    id: 'dark_matter_slick',
    name: 'Dark Matter Slick',
    description: 'Invisible dark matter patches cause sudden deceleration.',
    difficulty: 5,
    length: 1300,
    baseReward: 280,
    hazardDensity: 0.6,
    themeColor: '#2d1b4e',
  },
  {
    id: 'light_speed_lane',
    name: 'Light Speed Lane',
    description: 'Pure speed track. Minimal obstacles, maximum velocity required.',
    difficulty: 6,
    length: 2000,
    baseReward: 300,
    hazardDensity: 0.2,
    themeColor: '#ffff00',
  },
  {
    id: 'wormhole_loop',
    name: 'Wormhole Loop',
    description: 'Loop through a stable wormhole. Gravity defying twists and turns.',
    difficulty: 7,
    length: 900,
    baseReward: 350,
    hazardDensity: 0.65,
    themeColor: '#ff00ff',
  },
  {
    id: 'cosmic_rift',
    name: 'Cosmic Rift',
    description: 'Race along the edge of a dimensional tear. Space itself is unstable.',
    difficulty: 8,
    length: 1400,
    baseReward: 400,
    hazardDensity: 0.7,
    themeColor: '#ff4444',
  },
  {
    id: 'solar_flare',
    name: 'Solar Flare',
    description: 'Surf a massive solar eruption. Heat damage is constant and severe.',
    difficulty: 9,
    length: 1100,
    baseReward: 450,
    hazardDensity: 0.75,
    themeColor: '#ff6600',
  },
  {
    id: 'gravity_well',
    name: 'Gravity Well',
    description: 'The most dangerous track. A black hole threatens to consume everything.',
    difficulty: 10,
    length: 1600,
    baseReward: 500,
    hazardDensity: 0.8,
    themeColor: '#000033',
  },
  {
    id: 'infinity_stretch',
    name: 'Infinity Stretch',
    description: 'The legendary endless lane. Only the best racers survive the full distance.',
    difficulty: 10,
    length: 2500,
    baseReward: 750,
    hazardDensity: 0.85,
    themeColor: '#ffffff',
  },
]

const OBSTACLES: ObstacleDefinition[] = [
  {
    id: 'asteroid_field',
    name: 'Asteroid Field',
    description: 'Dense cluster of space rocks requiring precise navigation.',
    damage: 15,
    speedPenalty: 0.2,
    duration: 3,
    avoidanceDifficulty: 3,
  },
  {
    id: 'energy_storm',
    name: 'Energy Storm',
    description: 'Electromagnetic interference disrupts ship systems.',
    damage: 20,
    speedPenalty: 0.3,
    duration: 4,
    avoidanceDifficulty: 5,
  },
  {
    id: 'gravity_anomaly',
    name: 'Gravity Anomaly',
    description: 'Sudden gravitational pull throws the ship off course.',
    damage: 25,
    speedPenalty: 0.25,
    duration: 5,
    avoidanceDifficulty: 7,
  },
  {
    id: 'temporal_rift',
    name: 'Temporal Rift',
    description: 'Time distortion slows everything to a crawl around the ship.',
    damage: 10,
    speedPenalty: 0.5,
    duration: 6,
    avoidanceDifficulty: 6,
  },
  {
    id: 'dark_zone',
    name: 'Dark Zone',
    description: 'An area devoid of all light and energy. Shields drain rapidly.',
    damage: 30,
    speedPenalty: 0.15,
    duration: 8,
    avoidanceDifficulty: 8,
  },
  {
    id: 'ion_cloud',
    name: 'Ion Cloud',
    description: 'Charged particle cloud that disables boost and energy systems.',
    damage: 18,
    speedPenalty: 0.35,
    duration: 5,
    avoidanceDifficulty: 4,
  },
]

const POWER_UPS: PowerUpDefinition[] = [
  {
    id: 'speed_boost',
    name: 'Speed Boost',
    description: 'Override engines to maximum output for a burst of raw speed.',
    duration: 5,
    effectValue: 1.5,
    rarity: 'common',
  },
  {
    id: 'shield_regen',
    name: 'Shield Regen',
    description: 'Activate emergency shield regeneration protocols.',
    duration: 8,
    effectValue: 30,
    rarity: 'common',
  },
  {
    id: 'energy_drain',
    name: 'Energy Drain',
    description: 'Siphon energy from nearby racers to fuel your own systems.',
    duration: 6,
    effectValue: 20,
    rarity: 'rare',
  },
  {
    id: 'time_warp',
    name: 'Time Warp',
    description: 'Bend local spacetime to slow everything except your ship.',
    duration: 4,
    effectValue: 0.5,
    rarity: 'rare',
  },
  {
    id: 'phase_shift',
    name: 'Phase Shift',
    description: 'Shift into a parallel dimension, passing through all obstacles.',
    duration: 3,
    effectValue: 1,
    rarity: 'epic',
  },
  {
    id: 'warp_jump',
    name: 'Warp Jump',
    description: 'Instantly teleport forward a significant distance.',
    duration: 0,
    effectValue: 200,
    rarity: 'epic',
  },
  {
    id: 'magnet',
    name: 'Magnet',
    description: 'Attract nearby power-ups and credits toward your ship.',
    duration: 10,
    effectValue: 1,
    rarity: 'rare',
  },
  {
    id: 'emp_pulse',
    name: 'EMP Pulse',
    description: 'Discharge a devastating electromagnetic pulse affecting all racers.',
    duration: 0,
    effectValue: 50,
    rarity: 'epic',
  },
]

const COMPONENTS: ShipComponent[] = [
  {
    id: 'engine',
    name: 'Engine',
    description: 'Primary propulsion system. Determines top speed.',
    statAffected: 'speed',
    level: 1,
    maxLevel: 10,
  },
  {
    id: 'thrusters',
    name: 'Thrusters',
    description: 'Maneuvering jets. Controls handling and agility.',
    statAffected: 'handling',
    level: 1,
    maxLevel: 10,
  },
  {
    id: 'shield_gen',
    name: 'Shield Generator',
    description: 'Defensive energy barrier. Protects against collisions.',
    statAffected: 'shield',
    level: 1,
    maxLevel: 10,
  },
  {
    id: 'power_core',
    name: 'Power Core',
    description: 'Energy reactor. Fuels boost and ship systems.',
    statAffected: 'energy',
    level: 1,
    maxLevel: 10,
  },
  {
    id: 'hull',
    name: 'Hull',
    description: 'Structural integrity frame. Reduces mass and damage taken.',
    statAffected: 'mass',
    level: 1,
    maxLevel: 10,
  },
]

const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_warp',
    name: 'First Warp',
    description: 'Complete your first warp lane race.',
    condition: 'totalRaces >= 1',
    reward: 100,
    icon: 'rocket',
    category: 'racing',
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach a typing speed of 80 WPM during a race.',
    condition: 'wpm >= 80',
    reward: 250,
    icon: 'zap',
    category: 'racing',
  },
  {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Achieve a combo streak of 25 or more words.',
    condition: 'combo >= 25',
    reward: 300,
    icon: 'crown',
    category: 'racing',
  },
  {
    id: 'void_survivor',
    name: 'Void Survivor',
    description: 'Complete the Gravity Well track without hitting any obstacles.',
    condition: 'track_perfect',
    reward: 500,
    icon: 'shield',
    category: 'racing',
  },
  {
    id: 'ship_collector',
    name: 'Ship Collector',
    description: 'Unlock 5 different ships.',
    condition: 'ships >= 5',
    reward: 400,
    icon: 'star',
    category: 'collection',
  },
  {
    id: 'full_fleet',
    name: 'Full Fleet',
    description: 'Unlock all 10 ships.',
    condition: 'ships >= 10',
    reward: 2000,
    icon: 'trophy',
    category: 'collection',
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate 1,000,000 credits total.',
    condition: 'totalCredits >= 1000000',
    reward: 5000,
    icon: 'coins',
    category: 'collection',
  },
  {
    id: 'track_master',
    name: 'Track Master',
    description: 'Complete races on all 12 warp lanes.',
    condition: 'tracks >= 12',
    reward: 600,
    icon: 'map',
    category: 'exploration',
  },
  {
    id: 'circuit_champion',
    name: 'Circuit Champion',
    description: 'Win 10 circuit races.',
    condition: 'circuit_wins >= 10',
    reward: 350,
    icon: 'target',
    category: 'racing',
  },
  {
    id: 'elimination_ace',
    name: 'Elimination Ace',
    description: 'Win an elimination race without losing a single life.',
    condition: 'perfect_elimination',
    reward: 450,
    icon: 'skull',
    category: 'combat',
  },
  {
    id: 'word_warrior',
    name: 'Word Warrior',
    description: 'Type a total of 10,000 words across all races.',
    condition: 'totalWords >= 10000',
    reward: 500,
    icon: 'type',
    category: 'mastery',
  },
  {
    id: 'max_level',
    name: 'Max Level',
    description: 'Reach racer rank 50.',
    condition: 'level >= 50',
    reward: 10000,
    icon: 'medal',
    category: 'mastery',
  },
  {
    id: 'daily_grind',
    name: 'Daily Grind',
    description: 'Complete 7 daily challenges.',
    condition: 'dailies >= 7',
    reward: 800,
    icon: 'calendar',
    category: 'mastery',
  },
  {
    id: 'powerup_fiend',
    name: 'Power-Up Fiend',
    description: 'Collect 100 power-ups across all races.',
    condition: 'powerups >= 100',
    reward: 350,
    icon: 'gift',
    category: 'exploration',
  },
  {
    id: 'turbo_legend',
    name: 'Turbo Legend',
    description: 'Complete a race with an average combo of 15+.',
    condition: 'avgCombo >= 15',
    reward: 600,
    icon: 'flame',
    category: 'mastery',
  },
]

const RACE_MODES: { id: RaceMode; name: string; description: string; icon: string }[] = [
  {
    id: 'sprint',
    name: 'Sprint',
    description: 'Race from start to finish as fast as possible. One lap, pure speed.',
    icon: 'zap',
  },
  {
    id: 'circuit',
    name: 'Circuit',
    description: 'Complete 3 laps around the track. Consistency is key.',
    icon: 'rotate-cw',
  },
  {
    id: 'time_trial',
    name: 'Time Trial',
    description: 'Race against the clock. Beat your best time on each track.',
    icon: 'clock',
  },
  {
    id: 'elimination',
    name: 'Elimination',
    description: 'Last place after each lap is eliminated. Survive to win.',
    icon: 'skull',
  },
]

const XP_TABLE: number[] = [
  0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200,
  4000, 4900, 5950, 7150, 8500, 10000, 11700, 13650, 15850, 18300,
  21000, 24000, 27300, 30950, 34950, 39300, 44050, 49200, 54800, 60850,
  67400, 74450, 82050, 90200, 98950, 108300, 118400, 129300, 141000, 153550,
  167000, 181400, 196800, 213250, 230800, 249500, 269400, 290550, 313000, 336850,
]

const COMPONENT_UPGRADE_COSTS: number[] = [
  0, 200, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500,
]

const DIFFICULTY_MULTIPLIERS: Record<string, number> = {
  easy: 0.7,
  normal: 1.0,
  hard: 1.4,
  insane: 2.0,
}

const RARITY_COLOR_MAP: Record<string, string> = {
  common: '#a0a0a0',
  rare: '#4a9eff',
  epic: '#cc66ff',
  legendary: '#ffaa00',
}

const RANK_TITLES: string[] = [
  'Cadet', 'Ensign', 'Navigator', 'Pilot', 'Hotshot',
  'Ace', 'Veteran', 'Commander', 'Captain', 'Admiral',
]

const WORD_POOL_EASY: string[] = [
  'warp', 'star', 'flux', 'beam', 'core', 'hive', 'void', 'drag', 'glow', 'dash',
  'zoom', 'blip', 'ring', 'wave', 'pulse', 'orb', 'arc', 'ion', 'dust', 'mist',
  'dawn', 'edge', 'rift', 'dash', 'bolt', 'zen', 'gem', 'pod', 'fly', 'hop',
  'jet', 'ray', 'sky', 'sun', 'ore', 'ink', 'ash', 'fog', 'dew', 'hue',
]

const WORD_POOL_MEDIUM: string[] = [
  'quantum', 'nebula', 'plasma', 'photon', 'quasar', 'cosmic', 'stellar',
  'hyper', 'neutron', 'proton', 'galaxy', 'eclipse', 'vortex', 'cipher',
  'matrix', 'vector', 'tensor', 'prism', 'neuron', 'helix', 'aurora',
  'zenith', 'vertex', 'fusion', 'photon', 'quartz', 'titan', 'omega',
  'alpha', 'sigma', 'delta', 'gamma', 'theta', 'kappa', 'lambda', 'omega',
  'zephyr', 'cipher', 'matrix', 'vector', 'nexus', 'aether', 'chaos',
]

const WORD_POOL_HARD: string[] = [
  'hyperspace', 'wormhole', 'antimatter', 'darkenergy', 'spacetime',
  'dimensional', 'singularity', 'gravitational', 'electromagnetic',
  'thermonuclear', 'interstellar', 'extragalactic', 'supercluster',
  'magnetosphere', 'photosphere', 'chromosphere', 'exosphere',
  'chronometric', 'tachyonbeam', 'quantumflux', 'plasmadrive',
  'neutrinojet', 'hyperthrust', 'warpfactor', 'voidshifter',
]

const WORD_POOL_INSANE: string[] = [
  'superluminalpropulsion', 'interdimensionalportal', 'electromagneticspectrum',
  'gravitationallensing', 'extradimensionalwarp', 'quantumentanglement',
  'thermodynamicalequilibrium', 'magnetohydrodynamics',
  'chromodynamicpotential', 'electroweaksymmetry', 'supersymmetrictheory',
  'multidimensionalbrane', 'baryogenesisprocess',
]

const PAINT_OPTIONS: string[] = [
  'Midnight Blue', 'Solar Gold', 'Plasma Red', 'Void Black', 'Nebula Purple',
  'Cosmic Teal', 'Starlight White', 'Asteroid Grey', 'Supernova Orange',
  'Quantum Green', 'Eclipse Dark', 'Prism Rainbow', 'Ghost Phantom', 'Lava Flow',
]

const TRAIL_OPTIONS: string[] = [
  'Classic', 'Fire', 'Ice', 'Electric', 'Smoke', 'Plasma',
  'Neon', 'Rainbow', 'Void', 'Solar Flare', 'Pixel', 'Hologram',
]

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateDailyChallengeId(): string {
  const now = new Date()
  const dateStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
  return `daily-${dateStr}`
}

function generateDailyChallenges(): DailyChallenge[] {
  const today = generateDailyChallengeId()
  const trackIds: TrackId[] = [
    'alpha_corridor', 'nebula_drift', 'pulsar_run', 'void_stretch',
    'quantum_leap', 'dark_matter_slick', 'light_speed_lane', 'wormhole_loop',
    'cosmic_rift', 'solar_flare', 'gravity_well', 'infinity_stretch',
  ]
  const modes: RaceMode[] = ['sprint', 'circuit', 'time_trial', 'elimination']
  const objectives = [
    { objective: 'Complete the race with 60+ WPM', target: 60 },
    { objective: 'Finish without hitting obstacles', target: 0 },
    { objective: 'Achieve a combo of 10 or more', target: 10 },
    { objective: 'Collect 5 power-ups in a single race', target: 5 },
    { objective: 'Score 5000 points or more', target: 5000 },
    { objective: 'Finish the race under 120 seconds', target: 120 },
    { objective: 'Type 100 words in a single race', target: 100 },
    { objective: 'Maintain an average combo of 8+', target: 8 },
  ]
  const seed = new Date().getDate() + new Date().getMonth() * 31
  const challenges: DailyChallenge[] = []
  for (let i = 0; i < 3; i++) {
    const trackIdx = (seed * (i + 1) * 7) % trackIds.length
    const modeIdx = (seed * (i + 1) * 3) % modes.length
    const objIdx = (seed * (i + 1) * 11) % objectives.length
    challenges.push({
      id: `${today}-${i}`,
      trackId: trackIds[trackIdx],
      mode: modes[modeIdx],
      objective: objectives[objIdx].objective,
      targetValue: objectives[objIdx].target,
      reward: (i + 1) * 200 + 100,
      date: today,
      completed: false,
      progress: 0,
    })
  }
  return challenges
}

function getWordForDifficulty(difficulty: string, combo: number): string {
  let pool: string[]
  if (combo >= 20) {
    pool = WORD_POOL_INSANE
  } else if (combo >= 12) {
    pool = WORD_POOL_HARD
  } else if (combo >= 5) {
    pool = WORD_POOL_MEDIUM
  } else {
    switch (difficulty) {
      case 'easy': pool = WORD_POOL_EASY; break
      case 'hard': pool = WORD_POOL_HARD; break
      case 'insane': pool = WORD_POOL_INSANE; break
      default: pool = WORD_POOL_MEDIUM; break
    }
  }
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}

function fillWordQueue(queue: string[], difficulty: string, combo: number, count: number): string[] {
  const newQueue = [...queue]
  for (let i = 0; i < count; i++) {
    newQueue.push(getWordForDifficulty(difficulty, combo))
  }
  return newQueue
}

function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function calculateCreditsEarned(baseReward: number, position: number, mode: RaceMode, difficulty: string): number {
  const diffMult = DIFFICULTY_MULTIPLIERS[difficulty] || 1
  const posMult = position === 1 ? 2.0 : position === 2 ? 1.5 : position === 3 ? 1.2 : 0.8
  const modeMult = mode === 'elimination' ? 1.3 : mode === 'circuit' ? 1.2 : mode === 'time_trial' ? 1.1 : 1.0
  return Math.floor(baseReward * diffMult * posMult * modeMult)
}

function calculateXPEarned(baseReward: number, wordsTyped: number, comboMax: number, mode: RaceMode): number {
  const wordXP = wordsTyped * 5
  const comboXP = comboMax * 10
  const modeMult = mode === 'elimination' ? 1.4 : mode === 'circuit' ? 1.2 : 1.0
  return Math.floor((baseReward * 0.5 + wordXP + comboXP) * modeMult)
}

function calculateScore(wordsTyped: number, comboMax: number, wpm: number, time: number, noHits: boolean): number {
  const wordScore = wordsTyped * 50
  const comboScore = comboMax * 100
  const wpmScore = wpm * 20
  const timeBonus = Math.max(0, Math.floor((300 - time) * 10))
  const perfectBonus = noHits ? 2000 : 0
  return wordScore + comboScore + wpmScore + timeBonus + perfectBonus
}

function getShipEffectiveStats(ship: ShipDefinition, components: Record<ComponentId, number>): ShipStats {
  const stats = { ...ship.baseStats }
  for (const comp of COMPONENTS) {
    const level = components[comp.id] || 1
    const bonus = (level - 1) * 3
    const statKey = comp.statAffected
    if (statKey === 'mass') {
      stats[statKey] = Math.max(10, stats[statKey] - bonus)
    } else {
      stats[statKey] = Math.min(100, stats[statKey] + bonus)
    }
  }
  return stats
}

function generateFakeLeaderboard(trackId: TrackId, mode: RaceMode, count: number): LeaderboardEntry[] {
  const names = [
    'StarBlazer', 'VoidWalker', 'NebulaX', 'PulseRider', 'CosmicAce',
    'WarpKing', 'LightRacer', 'DarkPilot', 'FlameDrift', 'IronHawk',
    'HyperNova', 'QuantumJ', 'GravityG', 'SolarMax', 'AstroV',
    'NovaBurst', 'TitanRun', 'Eclipse9', 'ZenithP', 'OmegaR',
  ]
  const ships: ShipId[] = [
    'razor', 'viper', 'phantom', 'comet', 'nova',
    'eclipse', 'pulsar', 'quasar', 'nebula', 'void_runner',
  ]
  const entries: LeaderboardEntry[] = []
  for (let i = 0; i < count; i++) {
    const nameIdx = (trackId.length * 3 + mode.length * 7 + i * 13) % names.length
    const shipIdx = (trackId.length * 5 + mode.length * 11 + i * 17) % ships.length
    entries.push({
      racerName: names[nameIdx],
      shipId: ships[shipIdx],
      trackId,
      mode,
      score: Math.floor(8000 - i * 500 + Math.random() * 200),
      time: Math.floor(60 + i * 8 + Math.random() * 5),
      date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
    })
  }
  return entries.sort((a, b) => b.score - a.score)
}

function getDefaultState(): WarpLaneState {
  return {
    racerLevel: 1,
    racerXP: 0,
    racerXPToNext: 100,
    credits: 1000,
    selectedShip: 'razor',
    unlockedShips: ['razor'],
    selectedTrack: 'alpha_corridor',
    selectedMode: 'sprint',
    shipComponents: {
      engine: 1,
      thrusters: 1,
      shield_gen: 1,
      power_core: 1,
      hull: 1,
    },
    shipPaint: 'Midnight Blue',
    shipTrail: 'Classic',
    totalRaces: 0,
    totalWins: 0,
    totalWordsTyped: 0,
    totalDistance: 0,
    bestCombo: 0,
    currentCombo: 0,
    comboMultiplier: 1.0,
    currentSpeed: 0,
    currentShieldHP: 100,
    currentEnergy: 100,
    boostActive: false,
    boostTimer: 0,
    activePowerUps: [],
    powerUpTimers: {
      speed_boost: 0,
      shield_regen: 0,
      energy_drain: 0,
      time_warp: 0,
      phase_shift: 0,
      warp_jump: 0,
      magnet: 0,
      emp_pulse: 0,
    },
    raceInProgress: false,
    raceTime: 0,
    raceDistance: 0,
    raceScore: 0,
    raceWordsTyped: 0,
    raceComboMax: 0,
    raceObstaclesHit: 0,
    racePowerUpsCollected: 0,
    activeObstacles: [],
    obstacleTimers: {
      asteroid_field: 0,
      energy_storm: 0,
      gravity_anomaly: 0,
      temporal_rift: 0,
      dark_zone: 0,
      ion_cloud: 0,
    },
    achievements: [],
    leaderboard: [],
    dailyChallenges: generateDailyChallenges(),
    lastDailyRefresh: new Date().toISOString().split('T')[0],
    raceHistory: [],
    settingsVolume: 70,
    settingsSFX: 80,
    settingsParticles: true,
    settingsScreenShake: true,
    settingsAutoBoost: false,
    settingsDifficulty: 'normal',
    tutorialCompleted: false,
    tutorialStep: 0,
    title: 'Cadet',
    shipFavorites: ['razor'],
    trackFavorites: ['alpha_corridor'],
    mostPlayedTrack: null,
    mostUsedShip: null,
    currentWord: '',
    typedLetters: '',
    wordQueue: [],
    racePositions: ['You', 'Rival-1', 'Rival-2', 'Rival-3', 'Rival-4'],
    eliminationLives: 3,
    timeTrialBestTimes: {} as Record<TrackId, number>,
    sprintBestScores: {} as Record<TrackId, number>,
    circuitBestLaps: {} as Record<TrackId, number>,
    totalCreditsEarned: 1000,
    totalXPEarned: 0,
  }
}

// ============================================================
// MAIN HOOK
// ============================================================

export default function useWarpLane() {
  const [state, setState] = useState<WarpLaneState>(() => {
    try {
      const saved = localStorage.getItem('warp-lane-save')
      if (saved) {
        const parsed = JSON.parse(saved)
        const defaults = getDefaultState()
        return { ...defaults, ...parsed }
      }
    } catch {
      // Fall through to default
    }
    return getDefaultState()
  })

  useState(() => {
    try {
      localStorage.setItem('warp-lane-save', JSON.stringify(state))
    } catch {
      // Storage full or unavailable
    }
  })

  // ==========================================================
  // SHIP FUNCTIONS
  // ==========================================================

  function wlGetShip(id: ShipId): ShipDefinition | undefined {
    return SHIPS.find((s) => s.id === id)
  }

  function wlGetAllShips(): ShipDefinition[] {
    return [...SHIPS]
  }

  function wlGetSelectedShip(): ShipDefinition | undefined {
    return SHIPS.find((s) => s.id === state.selectedShip)
  }

  function wlSelectShip(id: ShipId): void {
    if (state.unlockedShips.includes(id)) {
      setState((prev) => ({ ...prev, selectedShip: id }))
    }
  }

  function wlUnlockShip(id: ShipId): boolean {
    const ship = SHIPS.find((s) => s.id === id)
    if (!ship) return false
    if (state.unlockedShips.includes(id)) return false
    if (state.racerLevel < ship.unlockLevel) return false
    if (state.credits < ship.cost) return false
    setState((prev) => ({
      ...prev,
      credits: prev.credits - ship.cost,
      unlockedShips: [...prev.unlockedShips, id],
    }))
    return true
  }

  function wlIsShipUnlocked(id: ShipId): boolean {
    return state.unlockedShips.includes(id)
  }

  function wlCanUnlockShip(id: ShipId): boolean {
    const ship = SHIPS.find((s) => s.id === id)
    if (!ship) return false
    if (state.unlockedShips.includes(id)) return false
    return state.racerLevel >= ship.unlockLevel && state.credits >= ship.cost
  }

  function wlGetShipCount(): number {
    return state.unlockedShips.length
  }

  function wlGetShipStats(id: ShipId): ShipStats {
    const ship = SHIPS.find((s) => s.id === id)
    if (!ship) return { speed: 0, handling: 0, boost: 0, shield: 0, energy: 0, mass: 50 }
    return getShipEffectiveStats(ship, state.shipComponents)
  }

  function wlGetSelectedShipStats(): ShipStats {
    return wlGetShipStats(state.selectedShip)
  }

  function wlGetShipBaseStats(id: ShipId): ShipStats | undefined {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? { ...ship.baseStats } : undefined
  }

  function wlCompareShips(id1: ShipId, id2: ShipId): { ship1: ShipStats; ship2: ShipStats } | null {
    const s1 = SHIPS.find((s) => s.id === id1)
    const s2 = SHIPS.find((s) => s.id === id2)
    if (!s1 || !s2) return null
    return {
      ship1: getShipEffectiveStats(s1, state.shipComponents),
      ship2: getShipEffectiveStats(s2, state.shipComponents),
    }
  }

  function wlGetShipRarity(id: ShipId): string {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? ship.rarity : 'common'
  }

  function wlGetShipRarityColor(id: ShipId): string {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? RARITY_COLOR_MAP[ship.rarity] : RARITY_COLOR_MAP['common']
  }

  function wlGetShipCost(id: ShipId): number {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? ship.cost : 0
  }

  function wlGetShipUnlockLevel(id: ShipId): number {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? ship.unlockLevel : 99
  }

  function wlToggleShipFavorite(id: ShipId): void {
    setState((prev) => {
      if (prev.shipFavorites.includes(id)) {
        return { ...prev, shipFavorites: prev.shipFavorites.filter((s) => s !== id) }
      }
      return { ...prev, shipFavorites: [...prev.shipFavorites, id] }
    })
  }

  function wlIsShipFavorite(id: ShipId): boolean {
    return state.shipFavorites.includes(id)
  }

  function wlGetShipFavorites(): ShipId[] {
    return [...state.shipFavorites]
  }

  function wlGetShipDescription(id: ShipId): string {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? ship.description : ''
  }

  function wlGetShipName(id: ShipId): string {
    const ship = SHIPS.find((s) => s.id === id)
    return ship ? ship.name : 'Unknown'
  }

  // ==========================================================
  // TRACK / LANE FUNCTIONS
  // ==========================================================

  function wlGetTrack(id: TrackId): TrackDefinition | undefined {
    return TRACKS.find((t) => t.id === id)
  }

  function wlGetAllTracks(): TrackDefinition[] {
    return [...TRACKS]
  }

  function wlGetSelectedTrack(): TrackDefinition | undefined {
    return TRACKS.find((t) => t.id === state.selectedTrack)
  }

  function wlSelectTrack(id: TrackId): void {
    setState((prev) => ({ ...prev, selectedTrack: id }))
  }

  function wlGetTrackDifficulty(id: TrackId): number {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.difficulty : 1
  }

  function wlGetTrackLength(id: TrackId): number {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.length : 1000
  }

  function wlGetTrackReward(id: TrackId): number {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.baseReward : 100
  }

  function wlGetTrackHazardDensity(id: TrackId): number {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.hazardDensity : 0.3
  }

  function wlGetTrackThemeColor(id: TrackId): string {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.themeColor : '#4a9eff'
  }

  function wlGetTrackName(id: TrackId): string {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.name : 'Unknown'
  }

  function wlGetTrackDescription(id: TrackId): string {
    const track = TRACKS.find((t) => t.id === id)
    return track ? track.description : ''
  }

  function wlGetTrackCount(): number {
    return TRACKS.length
  }

  function wlToggleTrackFavorite(id: TrackId): void {
    setState((prev) => {
      if (prev.trackFavorites.includes(id)) {
        return { ...prev, trackFavorites: prev.trackFavorites.filter((t) => t !== id) }
      }
      return { ...prev, trackFavorites: [...prev.trackFavorites, id] }
    })
  }

  function wlIsTrackFavorite(id: TrackId): boolean {
    return state.trackFavorites.includes(id)
  }

  function wlGetTrackFavorites(): TrackId[] {
    return [...state.trackFavorites]
  }

  function wlGetTracksByDifficulty(min: number, max: number): TrackDefinition[] {
    return TRACKS.filter((t) => t.difficulty >= min && t.difficulty <= max)
  }

  function wlGetTracksSortedByDifficulty(): TrackDefinition[] {
    return [...TRACKS].sort((a, b) => a.difficulty - b.difficulty)
  }

  function wlGetTracksSortedByReward(): TrackDefinition[] {
    return [...TRACKS].sort((a, b) => b.baseReward - a.baseReward)
  }

  function wlGetRacedTrackCount(): number {
    return state.raceHistory.filter(
      (r, i, arr) => arr.findIndex((x) => x.trackId === r.trackId) === i
    ).length
  }

  function wlHasRacedOnTrack(id: TrackId): boolean {
    return state.raceHistory.some((r) => r.trackId === id)
  }

  // ==========================================================
  // RACE MODE FUNCTIONS
  // ==========================================================

  function wlGetAllModes(): typeof RACE_MODES {
    return [...RACE_MODES]
  }

  function wlGetSelectedMode(): RaceMode {
    return state.selectedMode
  }

  function wlSelectMode(mode: RaceMode): void {
    setState((prev) => ({ ...prev, selectedMode: mode }))
  }

  function wlGetModeName(mode: RaceMode): string {
    const found = RACE_MODES.find((m) => m.id === mode)
    return found ? found.name : 'Unknown'
  }

  function wlGetModeDescription(mode: RaceMode): string {
    const found = RACE_MODES.find((m) => m.id === mode)
    return found ? found.description : ''
  }

  function wlGetModeIcon(mode: RaceMode): string {
    const found = RACE_MODES.find((m) => m.id === mode)
    return found ? found.icon : 'zap'
  }

  function wlIsModeActive(mode: RaceMode): boolean {
    return state.selectedMode === mode
  }

  // ==========================================================
  // OBSTACLE FUNCTIONS
  // ==========================================================

  function wlGetObstacle(id: ObstacleId): ObstacleDefinition | undefined {
    return OBSTACLES.find((o) => o.id === id)
  }

  function wlGetAllObstacles(): ObstacleDefinition[] {
    return [...OBSTACLES]
  }

  function wlGetObstacleName(id: ObstacleId): string {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.name : 'Unknown'
  }

  function wlGetObstacleDamage(id: ObstacleId): number {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.damage : 0
  }

  function wlGetObstacleSpeedPenalty(id: ObstacleId): number {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.speedPenalty : 0
  }

  function wlGetObstacleDuration(id: ObstacleId): number {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.duration : 0
  }

  function wlGetObstacleAvoidanceDifficulty(id: ObstacleId): number {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.avoidanceDifficulty : 1
  }

  function wlGetObstacleDescription(id: ObstacleId): string {
    const obs = OBSTACLES.find((o) => o.id === id)
    return obs ? obs.description : ''
  }

  function wlGetActiveObstacles(): ObstacleId[] {
    return [...state.activeObstacles]
  }

  function wlGetObstacleTimer(id: ObstacleId): number {
    return state.obstacleTimers[id] || 0
  }

  function wlActivateObstacle(id: ObstacleId): void {
    const obs = OBSTACLES.find((o) => o.id === id)
    if (!obs) return
    setState((prev) => ({
      ...prev,
      activeObstacles: prev.activeObstacles.includes(id)
        ? prev.activeObstacles
        : [...prev.activeObstacles, id],
      obstacleTimers: { ...prev.obstacleTimers, [id]: obs.duration },
      raceObstaclesHit: prev.raceObstaclesHit + 1,
      currentCombo: 0,
      comboMultiplier: 1.0,
      currentShieldHP: Math.max(0, prev.currentShieldHP - obs.damage),
      currentSpeed: Math.max(0, prev.currentSpeed * (1 - obs.speedPenalty)),
    }))
  }

  function wlDeactivateObstacle(id: ObstacleId): void {
    setState((prev) => ({
      ...prev,
      activeObstacles: prev.activeObstacles.filter((o) => o !== id),
      obstacleTimers: { ...prev.obstacleTimers, [id]: 0 },
    }))
  }

  function wlHasActiveObstacle(id: ObstacleId): boolean {
    return state.activeObstacles.includes(id)
  }

  function wlGetObstacleCount(): number {
    return state.activeObstacles.length
  }

  function wlGetMostDangerousObstacle(): ObstacleId {
    let maxDamage = 0
    let result: ObstacleId = 'asteroid_field'
    for (const id of state.activeObstacles) {
      const obs = OBSTACLES.find((o) => o.id === id)
      if (obs && obs.damage > maxDamage) {
        maxDamage = obs.damage
        result = id
      }
    }
    return result
  }

  function wlClearAllObstacles(): void {
    setState((prev) => ({
      ...prev,
      activeObstacles: [],
      obstacleTimers: {
        asteroid_field: 0,
        energy_storm: 0,
        gravity_anomaly: 0,
        temporal_rift: 0,
        dark_zone: 0,
        ion_cloud: 0,
      },
    }))
  }

  // ==========================================================
  // POWER-UP FUNCTIONS
  // ==========================================================

  function wlGetPowerUp(id: PowerUpId): PowerUpDefinition | undefined {
    return POWER_UPS.find((p) => p.id === id)
  }

  function wlGetAllPowerUps(): PowerUpDefinition[] {
    return [...POWER_UPS]
  }

  function wlGetPowerUpName(id: PowerUpId): string {
    const pu = POWER_UPS.find((p) => p.id === id)
    return pu ? pu.name : 'Unknown'
  }

  function wlGetPowerUpDescription(id: PowerUpId): string {
    const pu = POWER_UPS.find((p) => p.id === id)
    return pu ? pu.description : ''
  }

  function wlGetPowerUpDuration(id: PowerUpId): number {
    const pu = POWER_UPS.find((p) => p.id === id)
    return pu ? pu.duration : 0
  }

  function wlGetPowerUpEffectValue(id: PowerUpId): number {
    const pu = POWER_UPS.find((p) => p.id === id)
    return pu ? pu.effectValue : 0
  }

  function wlGetPowerUpRarity(id: PowerUpId): string {
    const pu = POWER_UPS.find((p) => p.id === id)
    return pu ? pu.rarity : 'common'
  }

  function wlGetActivePowerUps(): PowerUpId[] {
    return [...state.activePowerUps]
  }

  function wlGetPowerUpTimer(id: PowerUpId): number {
    return state.powerUpTimers[id] || 0
  }

  function wlActivatePowerUp(id: PowerUpId): void {
    const pu = POWER_UPS.find((p) => p.id === id)
    if (!pu) return
    setState((prev) => {
      const newTimers = { ...prev.powerUpTimers }
      const newActive = prev.activePowerUps.includes(id)
        ? prev.activePowerUps
        : [...prev.activePowerUps, id]
      newTimers[id] = pu.duration
      let newSpeed = prev.currentSpeed
      let newShield = prev.currentShieldHP
      let newEnergy = prev.currentEnergy
      let newDistance = prev.raceDistance
      switch (id) {
        case 'speed_boost':
          newSpeed = Math.min(200, prev.currentSpeed * pu.effectValue)
          break
        case 'shield_regen':
          newShield = Math.min(100, prev.currentShieldHP + pu.effectValue)
          break
        case 'energy_drain':
          newEnergy = Math.min(100, prev.currentEnergy + pu.effectValue)
          break
        case 'time_warp':
          newSpeed = Math.min(200, prev.currentSpeed * (2 - pu.effectValue))
          break
        case 'warp_jump':
          newDistance = prev.raceDistance + pu.effectValue
          newActive.splice(newActive.indexOf('warp_jump'), 1)
          newTimers[id] = 0
          break
        case 'emp_pulse':
          newActive.splice(newActive.indexOf('emp_pulse'), 1)
          newTimers[id] = 0
          break
        default:
          break
      }
      return {
        ...prev,
        activePowerUps: newActive,
        powerUpTimers: newTimers,
        currentSpeed: newSpeed,
        currentShieldHP: newShield,
        currentEnergy: newEnergy,
        raceDistance: newDistance,
        racePowerUpsCollected: prev.racePowerUpsCollected + 1,
      }
    })
  }

  function wlDeactivatePowerUp(id: PowerUpId): void {
    setState((prev) => ({
      ...prev,
      activePowerUps: prev.activePowerUps.filter((p) => p !== id),
      powerUpTimers: { ...prev.powerUpTimers, [id]: 0 },
    }))
  }

  function wlHasPowerUp(id: PowerUpId): boolean {
    return state.activePowerUps.includes(id)
  }

  function wlGetActivePowerUpCount(): number {
    return state.activePowerUps.length
  }

  function wlClearAllPowerUps(): void {
    setState((prev) => ({
      ...prev,
      activePowerUps: [],
      powerUpTimers: {
        speed_boost: 0,
        shield_regen: 0,
        energy_drain: 0,
        time_warp: 0,
        phase_shift: 0,
        warp_jump: 0,
        magnet: 0,
        emp_pulse: 0,
      },
    }))
  }

  function wlGetPowerUpsByRarity(rarity: 'common' | 'rare' | 'epic'): PowerUpDefinition[] {
    return POWER_UPS.filter((p) => p.rarity === rarity)
  }

  function wlGetRandomPowerUp(): PowerUpId {
    const idx = Math.floor(Math.random() * POWER_UPS.length)
    return POWER_UPS[idx].id
  }

  // ==========================================================
  // COMPONENT / UPGRADE FUNCTIONS
  // ==========================================================

  function wlGetComponent(id: ComponentId): ShipComponent | undefined {
    const comp = COMPONENTS.find((c) => c.id === id)
    if (!comp) return undefined
    return { ...comp, level: state.shipComponents[id] || 1 }
  }

  function wlGetAllComponents(): ShipComponent[] {
    return COMPONENTS.map((c) => ({ ...c, level: state.shipComponents[c.id] || 1 }))
  }

  function wlGetComponentName(id: ComponentId): string {
    const comp = COMPONENTS.find((c) => c.id === id)
    return comp ? comp.name : 'Unknown'
  }

  function wlGetComponentDescription(id: ComponentId): string {
    const comp = COMPONENTS.find((c) => c.id === id)
    return comp ? comp.description : ''
  }

  function wlGetComponentLevel(id: ComponentId): number {
    return state.shipComponents[id] || 1
  }

  function wlGetComponentMaxLevel(): number {
    return 10
  }

  function wlGetComponentStat(id: ComponentId): keyof ShipStats {
    const comp = COMPONENTS.find((c) => c.id === id)
    return comp ? comp.statAffected : 'speed'
  }

  function wlGetComponentUpgradeCost(id: ComponentId): number {
    const currentLevel = state.shipComponents[id] || 1
    if (currentLevel >= 10) return 0
    return COMPONENT_UPGRADE_COSTS[currentLevel]
  }

  function wlCanUpgradeComponent(id: ComponentId): boolean {
    const currentLevel = state.shipComponents[id] || 1
    if (currentLevel >= 10) return false
    const cost = COMPONENT_UPGRADE_COSTS[currentLevel]
    return state.credits >= cost
  }

  function wlUpgradeComponent(id: ComponentId): boolean {
    const currentLevel = state.shipComponents[id] || 1
    if (currentLevel >= 10) return false
    const cost = COMPONENT_UPGRADE_COSTS[currentLevel]
    if (state.credits < cost) return false
    setState((prev) => ({
      ...prev,
      credits: prev.credits - cost,
      shipComponents: { ...prev.shipComponents, [id]: prev.shipComponents[id] + 1 },
    }))
    return true
  }

  function wlGetComponentStatBonus(id: ComponentId): number {
    const level = state.shipComponents[id] || 1
    return (level - 1) * 3
  }

  function wlGetComponentProgress(id: ComponentId): number {
    const level = state.shipComponents[id] || 1
    return Math.floor((level / 10) * 100)
  }

  function wlGetTotalUpgradeCost(id: ComponentId): number {
    const currentLevel = state.shipComponents[id] || 1
    let total = 0
    for (let i = currentLevel; i < 10; i++) {
      total += COMPONENT_UPGRADE_COSTS[i]
    }
    return total
  }

  function wlMaxUpgradeComponent(id: ComponentId): boolean {
    const currentLevel = state.shipComponents[id] || 1
    let totalCost = 0
    for (let i = currentLevel; i < 10; i++) {
      totalCost += COMPONENT_UPGRADE_COSTS[i]
    }
    if (state.credits < totalCost) return false
    setState((prev) => ({
      ...prev,
      credits: prev.credits - totalCost,
      shipComponents: { ...prev.shipComponents, [id]: 10 },
    }))
    return true
  }

  function wlGetShipTotalStatBonus(): number {
    let total = 0
    for (const comp of COMPONENTS) {
      total += (state.shipComponents[comp.id] || 1 - 1) * 3
    }
    return total
  }

  function wlGetComponentCount(): number {
    return COMPONENTS.length
  }

  // ==========================================================
  // RACER LEVEL / XP / RANK FUNCTIONS
  // ==========================================================

  function wlGetLevel(): number {
    return state.racerLevel
  }

  function wlGetXP(): number {
    return state.racerXP
  }

  function wlGetXPToNext(): number {
    return state.racerXPToNext
  }

  function wlGetXPProgress(): number {
    if (state.racerXPToNext === 0) return 100
    return Math.floor((state.racerXP / state.racerXPToNext) * 100)
  }

  function wlAddXP(amount: number): void {
    setState((prev) => {
      let newXP = prev.racerXP + amount
      let newLevel = prev.racerLevel
      let newXPToNext = prev.racerXPToNext
      while (newLevel < 50 && newXP >= newXPToNext) {
        newXP -= newXPToNext
        newLevel += 1
        newXPToNext = newLevel < 50 ? (XP_TABLE[newLevel] || 100) : 0
      }
      if (newLevel >= 50) {
        newXP = 0
        newXPToNext = 0
      }
      const titleIdx = Math.min(Math.floor(newLevel / 5), RANK_TITLES.length - 1)
      return {
        ...prev,
        racerLevel: newLevel,
        racerXP: newXP,
        racerXPToNext: newXPToNext,
        title: RANK_TITLES[titleIdx],
        totalXPEarned: prev.totalXPEarned + amount,
      }
    })
  }

  function wlGetTitle(): string {
    return state.title
  }

  function wlGetTitleForLevel(level: number): string {
    const idx = Math.min(Math.floor(level / 5), RANK_TITLES.length - 1)
    return RANK_TITLES[idx]
  }

  function wlGetMaxLevel(): number {
    return 50
  }

  function wlIsMaxLevel(): boolean {
    return state.racerLevel >= 50
  }

  function wlGetXPForLevel(level: number): number {
    if (level <= 0) return 0
    if (level >= 50) return 0
    return XP_TABLE[level] || 100
  }

  function wlGetTotalXPForLevel(level: number): number {
    let total = 0
    for (let i = 1; i < level && i < 50; i++) {
      total += XP_TABLE[i] || 100
    }
    return total
  }

  // ==========================================================
  // CREDITS FUNCTIONS
  // ==========================================================

  function wlGetCredits(): number {
    return state.credits
  }

  function wlAddCredits(amount: number): void {
    setState((prev) => ({
      ...prev,
      credits: prev.credits + amount,
      totalCreditsEarned: prev.totalCreditsEarned + amount,
    }))
  }

  function wlSpendCredits(amount: number): boolean {
    if (state.credits < amount) return false
    setState((prev) => ({ ...prev, credits: prev.credits - amount }))
    return true
  }

  function wlCanAfford(amount: number): boolean {
    return state.credits >= amount
  }

  function wlGetTotalCreditsEarned(): number {
    return state.totalCreditsEarned
  }

  function wlFormatCredits(amount: number): string {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`
    }
    return amount.toString()
  }

  // ==========================================================
  // RACE MECHANICS - WORD TYPING
  // ==========================================================

  function wlGetCurrentWord(): string {
    return state.currentWord
  }

  function wlGetTypedLetters(): string {
    return state.typedLetters
  }

  function wlGetWordQueue(): string[] {
    return [...state.wordQueue]
  }

  function wlTypeLetter(letter: string): void {
    if (!state.raceInProgress) return
    setState((prev) => {
      const expected = prev.currentWord[prev.typedLetters.length]
      if (letter === expected) {
        const newTyped = prev.typedLetters + letter
        const wordComplete = newTyped === prev.currentWord
        if (wordComplete) {
          return wlCompleteWordInternal(prev)
        }
        return { ...prev, typedLetters: newTyped }
      }
      return {
        ...prev,
        currentCombo: 0,
        comboMultiplier: 1.0,
      }
    })
  }

  function wlCompleteWordInternal(prev: WarpLaneState): WarpLaneState {
    const newCombo = prev.currentCombo + 1
    const newComboMult = 1 + Math.floor(newCombo / 5) * 0.1
    const wordScore = Math.floor(50 * newComboMult)
    const stats = wlGetShipStats(prev.selectedShip)
    const speedGain = (stats.speed / 100) * 2
    const newDistance = prev.raceDistance + 10 + speedGain
    const newQueue = [...prev.wordQueue]
    let newCurrentWord = ''
    if (newQueue.length > 0) {
      newCurrentWord = newQueue.shift() || ''
    } else {
      const filled = fillWordQueue([], prev.settingsDifficulty, newCombo, 5)
      newCurrentWord = filled[0]
      newQueue.push(...filled.slice(1))
    }
    const newComboMax = Math.max(prev.raceComboMax, newCombo)
    const newBestCombo = Math.max(prev.bestCombo, newCombo)
    return {
      ...prev,
      currentWord: newCurrentWord,
      typedLetters: '',
      wordQueue: newQueue,
      currentCombo: newCombo,
      comboMultiplier: newComboMult,
      raceScore: prev.raceScore + wordScore,
      raceWordsTyped: prev.raceWordsTyped + 1,
      raceComboMax: newComboMax,
      bestCombo: newBestCombo,
      raceDistance: newDistance,
      currentSpeed: Math.min(200, 50 + speedGain + (newComboMult - 1) * 10),
    }
  }

  function wlStartRace(): void {
    const firstWords = fillWordQueue([], state.settingsDifficulty, 0, 6)
    setState((prev) => ({
      ...prev,
      raceInProgress: true,
      raceTime: 0,
      raceDistance: 0,
      raceScore: 0,
      raceWordsTyped: 0,
      raceComboMax: 0,
      raceObstaclesHit: 0,
      racePowerUpsCollected: 0,
      currentCombo: 0,
      comboMultiplier: 1.0,
      currentSpeed: 0,
      currentShieldHP: 100,
      currentEnergy: 100,
      boostActive: false,
      boostTimer: 0,
      activePowerUps: [],
      powerUpTimers: {
        speed_boost: 0,
        shield_regen: 0,
        energy_drain: 0,
        time_warp: 0,
        phase_shift: 0,
        warp_jump: 0,
        magnet: 0,
        emp_pulse: 0,
      },
      activeObstacles: [],
      obstacleTimers: {
        asteroid_field: 0,
        energy_storm: 0,
        gravity_anomaly: 0,
        temporal_rift: 0,
        dark_zone: 0,
        ion_cloud: 0,
      },
      currentWord: firstWords[0],
      typedLetters: '',
      wordQueue: firstWords.slice(1),
      racePositions: ['You', 'Rival-1', 'Rival-2', 'Rival-3', 'Rival-4'],
      eliminationLives: 3,
    }))
  }

  function wlFinishRace(): RaceResult | null {
    if (!state.raceInProgress) return null
    const track = TRACKS.find((t) => t.id === state.selectedTrack)
    if (!track) return null
    const wpm = state.raceTime > 0 ? Math.floor((state.raceWordsTyped / state.raceTime) * 60) : 0
    const noHits = state.raceObstaclesHit === 0
    const finalScore = calculateScore(
      state.raceWordsTyped,
      state.raceComboMax,
      wpm,
      state.raceTime,
      noHits
    )
    const position = 1
    const creditsEarned = calculateCreditsEarned(
      track.baseReward,
      position,
      state.selectedMode,
      state.settingsDifficulty
    )
    const xpEarned = calculateXPEarned(
      track.baseReward,
      state.raceWordsTyped,
      state.raceComboMax,
      state.selectedMode
    )
    const result: RaceResult = {
      trackId: state.selectedTrack,
      mode: state.selectedMode,
      shipId: state.selectedShip,
      score: finalScore,
      time: state.raceTime,
      wordsTyped: state.raceWordsTyped,
      wordsPerMinute: wpm,
      comboMax: state.raceComboMax,
      obstaclesHit: state.raceObstaclesHit,
      powerUpsCollected: state.racePowerUpsCollected,
      position,
      creditsEarned,
      xpEarned,
    }
    setState((prev) => {
      const newHistory = [...prev.raceHistory, result]
      let newTimeTrialBest = { ...prev.timeTrialBestTimes }
      let newSprintBest = { ...prev.sprintBestScores }
      let newCircuitBest = { ...prev.circuitBestLaps }
      if (state.selectedMode === 'time_trial') {
        const existing = newTimeTrialBest[state.selectedTrack]
        if (!existing || state.raceTime < existing) {
          newTimeTrialBest = { ...newTimeTrialBest, [state.selectedTrack]: state.raceTime }
        }
      }
      if (state.selectedMode === 'sprint') {
        const existing = newSprintBest[state.selectedTrack]
        if (!existing || finalScore > existing) {
          newSprintBest = { ...newSprintBest, [state.selectedTrack]: finalScore }
        }
      }
      if (state.selectedMode === 'circuit') {
        const existing = newCircuitBest[state.selectedTrack]
        if (!existing || state.raceDistance > existing) {
          newCircuitBest = { ...newCircuitBest, [state.selectedTrack]: state.raceDistance }
        }
      }
      return {
        ...prev,
        raceInProgress: false,
        totalRaces: prev.totalRaces + 1,
        totalWins: prev.totalWins + 1,
        totalWordsTyped: prev.totalWordsTyped + state.raceWordsTyped,
        totalDistance: prev.totalDistance + state.raceDistance,
        credits: prev.credits + creditsEarned,
        totalCreditsEarned: prev.totalCreditsEarned + creditsEarned,
        racerXP: prev.racerXP + xpEarned,
        totalXPEarned: prev.totalXPEarned + xpEarned,
        raceHistory: newHistory,
        timeTrialBestTimes: newTimeTrialBest,
        sprintBestScores: newSprintBest,
        circuitBestLaps: newCircuitBest,
        mostPlayedTrack: wlUpdateMostPlayed(prev, state.selectedTrack),
        mostUsedShip: state.selectedShip,
      }
    })
    return result
  }

  function wlUpdateMostPlayed(prev: WarpLaneState, trackId: TrackId): TrackId {
    if (!prev.mostPlayedTrack) return trackId
    const currentCount = prev.raceHistory.filter((r) => r.trackId === prev.mostPlayedTrack).length
    const newCount = prev.raceHistory.filter((r) => r.trackId === trackId).length + 1
    return newCount > currentCount ? trackId : prev.mostPlayedTrack
  }

  function wlAbortRace(): void {
    setState((prev) => ({
      ...prev,
      raceInProgress: false,
    }))
  }

  function wlIsRaceInProgress(): boolean {
    return state.raceInProgress
  }

  function wlGetRaceTime(): number {
    return state.raceTime
  }

  function wlIncrementRaceTime(): void {
    setState((prev) => ({ ...prev, raceTime: prev.raceTime + 1 }))
  }

  function wlGetRaceDistance(): number {
    return state.raceDistance
  }

  function wlGetRaceProgress(): number {
    const track = TRACKS.find((t) => t.id === state.selectedTrack)
    if (!track) return 0
    return Math.min(100, Math.floor((state.raceDistance / track.length) * 100))
  }

  function wlGetRaceScore(): number {
    return state.raceScore
  }

  function wlGetRaceWordsTyped(): number {
    return state.raceWordsTyped
  }

  function wlGetRaceWPM(): number {
    if (state.raceTime <= 0) return 0
    return Math.floor((state.raceWordsTyped / state.raceTime) * 60)
  }

  function wlGetRaceComboMax(): number {
    return state.raceComboMax
  }

  function wlGetRaceObstaclesHit(): number {
    return state.raceObstaclesHit
  }

  function wlGetRacePowerUpsCollected(): number {
    return state.racePowerUpsCollected
  }

  // ==========================================================
  // COMBO & BOOST FUNCTIONS
  // ==========================================================

  function wlGetCurrentCombo(): number {
    return state.currentCombo
  }

  function wlGetComboMultiplier(): number {
    return state.comboMultiplier
  }

  function wlGetBestCombo(): number {
    return state.bestCombo
  }

  function wlResetCombo(): void {
    setState((prev) => ({
      ...prev,
      currentCombo: 0,
      comboMultiplier: 1.0,
    }))
  }

  function wlGetComboTier(): string {
    if (state.currentCombo >= 25) return 'Legendary'
    if (state.currentCombo >= 20) return 'Master'
    if (state.currentCombo >= 15) return 'Elite'
    if (state.currentCombo >= 10) return 'Expert'
    if (state.currentCombo >= 5) return 'Skilled'
    if (state.currentCombo >= 3) return 'Warm'
    return 'Cold'
  }

  function wlGetComboColor(): string {
    if (state.currentCombo >= 25) return '#ff0000'
    if (state.currentCombo >= 20) return '#ff6600'
    if (state.currentCombo >= 15) return '#ffaa00'
    if (state.currentCombo >= 10) return '#ffff00'
    if (state.currentCombo >= 5) return '#00ff00'
    if (state.currentCombo >= 3) return '#00ccff'
    return '#ffffff'
  }

  function wlGetComboNextThreshold(): number {
    if (state.currentCombo < 3) return 3
    if (state.currentCombo < 5) return 5
    if (state.currentCombo < 10) return 10
    if (state.currentCombo < 15) return 15
    if (state.currentCombo < 20) return 20
    if (state.currentCombo < 25) return 25
    return 30
  }

  function wlGetComboToNextTier(): number {
    return wlGetComboNextThreshold() - state.currentCombo
  }

  function wlIsBoostActive(): boolean {
    return state.boostActive
  }

  function wlActivateBoost(): void {
    if (state.currentEnergy < 20) return
    setState((prev) => ({
      ...prev,
      boostActive: true,
      boostTimer: 5,
      currentEnergy: prev.currentEnergy - 20,
      currentSpeed: Math.min(200, prev.currentSpeed * 1.5),
    }))
  }

  function wlDeactivateBoost(): void {
    setState((prev) => ({
      ...prev,
      boostActive: false,
      boostTimer: 0,
    }))
  }

  function wlGetBoostTimer(): number {
    return state.boostTimer
  }

  function wlDecrementBoostTimer(): void {
    setState((prev) => {
      if (prev.boostTimer <= 0) return prev
      const newTimer = prev.boostTimer - 1
      if (newTimer <= 0) {
        return {
          ...prev,
          boostActive: false,
          boostTimer: 0,
        }
      }
      return { ...prev, boostTimer: newTimer }
    })
  }

  // ==========================================================
  // SHIELD & ENERGY FUNCTIONS
  // ==========================================================

  function wlGetShieldHP(): number {
    return state.currentShieldHP
  }

  function wlGetMaxShieldHP(): number {
    return 100
  }

  function wlGetShieldPercentage(): number {
    return state.currentShieldHP
  }

  function wlDamageShield(amount: number): void {
    setState((prev) => ({
      ...prev,
      currentShieldHP: Math.max(0, prev.currentShieldHP - amount),
    }))
  }

  function wlRepairShield(amount: number): void {
    setState((prev) => ({
      ...prev,
      currentShieldHP: Math.min(100, prev.currentShieldHP + amount),
    }))
  }

  function wlIsShieldFull(): boolean {
    return state.currentShieldHP >= 100
  }

  function wlIsShieldBroken(): boolean {
    return state.currentShieldHP <= 0
  }

  function wlGetEnergy(): number {
    return state.currentEnergy
  }

  function wlGetMaxEnergy(): number {
    return 100
  }

  function wlGetEnergyPercentage(): number {
    return state.currentEnergy
  }

  function wlConsumeEnergy(amount: number): boolean {
    if (state.currentEnergy < amount) return false
    setState((prev) => ({
      ...prev,
      currentEnergy: prev.currentEnergy - amount,
    }))
    return true
  }

  function wlRechargeEnergy(amount: number): void {
    setState((prev) => ({
      ...prev,
      currentEnergy: Math.min(100, prev.currentEnergy + amount),
    }))
  }

  function wlIsEnergyFull(): boolean {
    return state.currentEnergy >= 100
  }

  function wlIsEnergyEmpty(): boolean {
    return state.currentEnergy <= 0
  }

  function wlGetSpeed(): number {
    return state.currentSpeed
  }

  function wlGetMaxSpeed(): number {
    return 200
  }

  function wlGetSpeedPercentage(): number {
    return Math.floor((state.currentSpeed / 200) * 100)
  }

  // ==========================================================
  // RACE HISTORY & STATISTICS
  // ==========================================================

  function wlGetRaceHistory(): RaceResult[] {
    return [...state.raceHistory]
  }

  function wlGetRaceCount(): number {
    return state.totalRaces
  }

  function wlGetWinCount(): number {
    return state.totalWins
  }

  function wlGetWinRate(): number {
    if (state.totalRaces === 0) return 0
    return Math.floor((state.totalWins / state.totalRaces) * 100)
  }

  function wlGetTotalWordsTyped(): number {
    return state.totalWordsTyped
  }

  function wlGetTotalDistance(): number {
    return state.totalDistance
  }

  function wlGetFormattedDistance(): string {
    if (state.totalDistance >= 1000000) {
      return `${(state.totalDistance / 1000000).toFixed(1)}M LY`
    }
    if (state.totalDistance >= 1000) {
      return `${(state.totalDistance / 1000).toFixed(1)}K LY`
    }
    return `${state.totalDistance} LY`
  }

  function wlGetLastRace(): RaceResult | null {
    if (state.raceHistory.length === 0) return null
    return state.raceHistory[state.raceHistory.length - 1]
  }

  function wlGetBestScore(): number {
    if (state.raceHistory.length === 0) return 0
    return Math.max(...state.raceHistory.map((r) => r.score))
  }

  function wlGetBestWPM(): number {
    if (state.raceHistory.length === 0) return 0
    return Math.max(...state.raceHistory.map((r) => r.wordsPerMinute))
  }

  function wlGetBestCombo(): number {
    if (state.raceHistory.length === 0) return state.bestCombo
    const historyBest = Math.max(...state.raceHistory.map((r) => r.comboMax))
    return Math.max(state.bestCombo, historyBest)
  }

  function wlGetAverageWPM(): number {
    if (state.raceHistory.length === 0) return 0
    const total = state.raceHistory.reduce((sum, r) => sum + r.wordsPerMinute, 0)
    return Math.floor(total / state.raceHistory.length)
  }

  function wlGetAverageScore(): number {
    if (state.raceHistory.length === 0) return 0
    const total = state.raceHistory.reduce((sum, r) => sum + r.score, 0)
    return Math.floor(total / state.raceHistory.length)
  }

  function wlGetRacesByMode(mode: RaceMode): RaceResult[] {
    return state.raceHistory.filter((r) => r.mode === mode)
  }

  function wlGetRacesByTrack(trackId: TrackId): RaceResult[] {
    return state.raceHistory.filter((r) => r.trackId === trackId)
  }

  function wlGetRaceCountByMode(mode: RaceMode): number {
    return state.raceHistory.filter((r) => r.mode === mode).length
  }

  function wlGetRaceCountByTrack(trackId: TrackId): number {
    return state.raceHistory.filter((r) => r.trackId === trackId).length
  }

  function wlGetMostPlayedTrack(): TrackId | null {
    return state.mostPlayedTrack
  }

  function wlGetMostUsedShip(): ShipId | null {
    return state.mostUsedShip
  }

  function wlGetRecentRaces(count: number): RaceResult[] {
    return state.raceHistory.slice(-count).reverse()
  }

  function wlClearRaceHistory(): void {
    setState((prev) => ({ ...prev, raceHistory: [] }))
  }

  // ==========================================================
  // BEST TIMES / SCORES
  // ==========================================================

  function wlGetTimeTrialBest(trackId: TrackId): number | null {
    return state.timeTrialBestTimes[trackId] ?? null
  }

  function wlGetSprintBest(trackId: TrackId): number | null {
    return state.sprintBestScores[trackId] ?? null
  }

  function wlGetCircuitBest(trackId: TrackId): number | null {
    return state.circuitBestLaps[trackId] ?? null
  }

  function wlGetAllTimeTrialBests(): Record<TrackId, number> {
    return { ...state.timeTrialBestTimes }
  }

  function wlGetAllSprintBests(): Record<TrackId, number> {
    return { ...state.sprintBestScores }
  }

  function wlGetAllCircuitBests(): Record<TrackId, number> {
    return { ...state.circuitBestLaps }
  }

  function wlGetBestTimeForTrack(trackId: TrackId): number | null {
    return state.timeTrialBestTimes[trackId] ?? null
  }

  function wlGetBestScoreForTrack(trackId: TrackId): number | null {
    return state.sprintBestScores[trackId] ?? null
  }

  function wlFormatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }
    return `${secs}s`
  }

  // ==========================================================
  // ELIMINATION MODE FUNCTIONS
  // ==========================================================

  function wlGetEliminationLives(): number {
    return state.eliminationLives
  }

  function wlLoseEliminationLife(): void {
    setState((prev) => ({
      ...prev,
      eliminationLives: Math.max(0, prev.eliminationLives - 1),
    }))
  }

  function wlIsEliminated(): boolean {
    return state.eliminationLives <= 0
  }

  function wlGetRacePositions(): string[] {
    return [...state.racePositions]
  }

  function wlGetPlayerPosition(): number {
    return state.racePositions.indexOf('You') + 1
  }

  function wlShufflePositions(): void {
    setState((prev) => {
      const youIdx = prev.racePositions.indexOf('You')
      const newPositions = prev.racePositions.filter((p) => p !== 'You')
      for (let i = newPositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = newPositions[i]
        newPositions[i] = newPositions[j]
        newPositions[j] = temp
      }
      const insertIdx = Math.floor(Math.random() * (newPositions.length + 1))
      newPositions.splice(insertIdx, 0, 'You')
      return { ...prev, racePositions: newPositions }
    })
  }

  // ==========================================================
  // ACHIEVEMENT FUNCTIONS
  // ==========================================================

  function wlGetAchievements(): AchievementDef[] {
    return ACHIEVEMENTS
  }

  function wlGetUnlockedAchievements(): string[] {
    return [...state.achievements]
  }

  function wlIsAchievementUnlocked(id: string): boolean {
    return state.achievements.includes(id)
  }

  function wlGetAchievementById(id: string): AchievementDef | undefined {
    return ACHIEVEMENTS.find((a) => a.id === id)
  }

  function wlGetAchievementName(id: string): string {
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    return ach ? ach.name : 'Unknown'
  }

  function wlGetAchievementDescription(id: string): string {
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    return ach ? ach.description : ''
  }

  function wlGetAchievementReward(id: string): number {
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    return ach ? ach.reward : 0
  }

  function wlGetAchievementIcon(id: string): string {
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    return ach ? ach.icon : 'star'
  }

  function wlGetAchievementCategory(id: string): string {
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    return ach ? ach.category : 'mastery'
  }

  function wlUnlockAchievement(id: string): boolean {
    if (state.achievements.includes(id)) return false
    const ach = ACHIEVEMENTS.find((a) => a.id === id)
    if (!ach) return false
    setState((prev) => ({
      ...prev,
      achievements: [...prev.achievements, id],
      credits: prev.credits + ach.reward,
      totalCreditsEarned: prev.totalCreditsEarned + ach.reward,
    }))
    return true
  }

  function wlGetAchievementCount(): number {
    return state.achievements.length
  }

  function wlGetTotalAchievementCount(): number {
    return ACHIEVEMENTS.length
  }

  function wlGetAchievementProgress(): number {
    return Math.floor((state.achievements.length / ACHIEVEMENTS.length) * 100)
  }

  function wlGetAchievementsByCategory(category: string): AchievementDef[] {
    return ACHIEVEMENTS.filter((a) => a.category === category)
  }

  function wlGetAchievementCategories(): string[] {
    return ['racing', 'combat', 'exploration', 'collection', 'mastery']
  }

  // ==========================================================
  // LEADERBOARD FUNCTIONS
  // ==========================================================

  function wlGetLeaderboard(): LeaderboardEntry[] {
    return [...state.leaderboard]
  }

  function wlGetLeaderboardForTrack(trackId: TrackId, mode: RaceMode): LeaderboardEntry[] {
    const trackLB = state.leaderboard.filter((e) => e.trackId === trackId && e.mode === mode)
    const fakeLB = generateFakeLeaderboard(trackId, mode, 10)
    return [...trackLB, ...fakeLB].sort((a, b) => b.score - a.score)
  }

  function wlGetPlayerRank(trackId: TrackId, mode: RaceMode): number {
    const lb = wlGetLeaderboardForTrack(trackId, mode)
    const playerEntry = lb.find((e) => e.racerName === 'You')
    if (!playerEntry) return lb.length + 1
    return lb.indexOf(playerEntry) + 1
  }

  function wlGetPlayerBestScore(trackId: TrackId, mode: RaceMode): number {
    const entries = state.raceHistory.filter(
      (r) => r.trackId === trackId && r.mode === mode
    )
    if (entries.length === 0) return 0
    return Math.max(...entries.map((e) => e.score))
  }

  function wlAddLeaderboardEntry(entry: LeaderboardEntry): void {
    setState((prev) => ({
      ...prev,
      leaderboard: [...prev.leaderboard, entry].sort((a, b) => b.score - a.score),
    }))
  }

  function wlClearLeaderboard(): void {
    setState((prev) => ({ ...prev, leaderboard: [] }))
  }

  function wlGetTopN(trackId: TrackId, mode: RaceMode, n: number): LeaderboardEntry[] {
    return wlGetLeaderboardForTrack(trackId, mode).slice(0, n)
  }

  function wlGetGlobalLeaderboard(): LeaderboardEntry[] {
    const allFake: LeaderboardEntry[] = []
    for (const track of TRACKS) {
      for (const mode of RACE_MODES) {
        const entries = generateFakeLeaderboard(track.id, mode.id, 3)
        allFake.push(...entries)
      }
    }
    return allFake.sort((a, b) => b.score - a.score).slice(0, 20)
  }

  // ==========================================================
  // DAILY CHALLENGE FUNCTIONS
  // ==========================================================

  function wlGetDailyChallenges(): DailyChallenge[] {
    return [...state.dailyChallenges]
  }

  function wlRefreshDailyChallenges(): void {
    const today = new Date().toISOString().split('T')[0]
    if (state.lastDailyRefresh === today) return
    setState((prev) => ({
      ...prev,
      dailyChallenges: generateDailyChallenges(),
      lastDailyRefresh: today,
    }))
  }

  function wlNeedsDailyRefresh(): boolean {
    const today = new Date().toISOString().split('T')[0]
    return state.lastDailyRefresh !== today
  }

  function wlCompleteDailyChallenge(id: string): boolean {
    const challenge = state.dailyChallenges.find((c) => c.id === id)
    if (!challenge || challenge.completed) return false
    setState((prev) => ({
      ...prev,
      dailyChallenges: prev.dailyChallenges.map((c) =>
        c.id === id ? { ...c, completed: true, progress: c.targetValue } : c
      ),
      credits: prev.credits + challenge.reward,
      totalCreditsEarned: prev.totalCreditsEarned + challenge.reward,
    }))
    return true
  }

  function wlUpdateDailyProgress(id: string, value: number): void {
    setState((prev) => ({
      ...prev,
      dailyChallenges: prev.dailyChallenges.map((c) =>
        c.id === id ? { ...c, progress: Math.min(c.targetValue, c.progress + value) } : c
      ),
    }))
  }

  function wlIsDailyChallengeCompleted(id: string): boolean {
    const challenge = state.dailyChallenges.find((c) => c.id === id)
    return challenge ? challenge.completed : false
  }

  function wlGetDailyChallengeProgress(id: string): number {
    const challenge = state.dailyChallenges.find((c) => c.id === id)
    return challenge ? challenge.progress : 0
  }

  function wlGetDailyChallengeTarget(id: string): number {
    const challenge = state.dailyChallenges.find((c) => c.id === id)
    return challenge ? challenge.targetValue : 0
  }

  function wlGetDailyChallengeReward(id: string): number {
    const challenge = state.dailyChallenges.find((c) => c.id === id)
    return challenge ? challenge.reward : 0
  }

  function wlGetCompletedDailyCount(): number {
    return state.dailyChallenges.filter((c) => c.completed).length
  }

  function wlGetTotalDailyReward(): number {
    return state.dailyChallenges.reduce((sum, c) => sum + c.reward, 0)
  }

  function wlGetUnclaimedDailyReward(): number {
    return state.dailyChallenges
      .filter((c) => !c.completed)
      .reduce((sum, c) => sum + c.reward, 0)
  }

  // ==========================================================
  // CUSTOMIZATION FUNCTIONS
  // ==========================================================

  function wlGetPaintOptions(): string[] {
    return [...PAINT_OPTIONS]
  }

  function wlGetTrailOptions(): string[] {
    return [...TRAIL_OPTIONS]
  }

  function wlGetShipPaint(): string {
    return state.shipPaint
  }

  function wlSetShipPaint(paint: string): void {
    setState((prev) => ({ ...prev, shipPaint: paint }))
  }

  function wlGetShipTrail(): string {
    return state.shipTrail
  }

  function wlSetShipTrail(trail: string): void {
    setState((prev) => ({ ...prev, shipTrail: trail }))
  }

  // ==========================================================
  // SETTINGS FUNCTIONS
  // ==========================================================

  function wlGetVolume(): number {
    return state.settingsVolume
  }

  function wlSetVolume(level: number): void {
    setState((prev) => ({
      ...prev,
      settingsVolume: clampValue(level, 0, 100),
    }))
  }

  function wlGetSFXVolume(): number {
    return state.settingsSFX
  }

  function wlSetSFXVolume(level: number): void {
    setState((prev) => ({
      ...prev,
      settingsSFX: clampValue(level, 0, 100),
    }))
  }

  function wlIsParticlesEnabled(): boolean {
    return state.settingsParticles
  }

  function wlToggleParticles(): void {
    setState((prev) => ({
      ...prev,
      settingsParticles: !prev.settingsParticles,
    }))
  }

  function wlIsScreenShakeEnabled(): boolean {
    return state.settingsScreenShake
  }

  function wlToggleScreenShake(): void {
    setState((prev) => ({
      ...prev,
      settingsScreenShake: !prev.settingsScreenShake,
    }))
  }

  function wlIsAutoBoostEnabled(): boolean {
    return state.settingsAutoBoost
  }

  function wlToggleAutoBoost(): void {
    setState((prev) => ({
      ...prev,
      settingsAutoBoost: !prev.settingsAutoBoost,
    }))
  }

  function wlGetDifficulty(): string {
    return state.settingsDifficulty
  }

  function wlSetDifficulty(diff: 'easy' | 'normal' | 'hard' | 'insane'): void {
    setState((prev) => ({ ...prev, settingsDifficulty: diff }))
  }

  function wlGetDifficultyMultiplier(): number {
    return DIFFICULTY_MULTIPLIERS[state.settingsDifficulty] || 1
  }

  // ==========================================================
  // TUTORIAL FUNCTIONS
  // ==========================================================

  function wlIsTutorialCompleted(): boolean {
    return state.tutorialCompleted
  }

  function wlGetTutorialStep(): number {
    return state.tutorialStep
  }

  function wlSetTutorialStep(step: number): void {
    setState((prev) => ({
      ...prev,
      tutorialStep: step,
    }))
  }

  function wlAdvanceTutorial(): void {
    setState((prev) => ({
      ...prev,
      tutorialStep: prev.tutorialStep + 1,
    }))
  }

  function wlCompleteTutorial(): void {
    setState((prev) => ({
      ...prev,
      tutorialCompleted: true,
      tutorialStep: 0,
    }))
  }

  function wlGetTotalTutorialSteps(): number {
    return 8
  }

  function wlGetTutorialProgress(): number {
    return Math.floor((state.tutorialStep / wlGetTotalTutorialSteps()) * 100)
  }

  function wlResetTutorial(): void {
    setState((prev) => ({
      ...prev,
      tutorialCompleted: false,
      tutorialStep: 0,
    }))
  }

  // ==========================================================
  // DIFFICULTY / MISC FUNCTIONS
  // ==========================================================

  function wlGetDifficultyName(): string {
    const names: Record<string, string> = {
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      insane: 'Insane',
    }
    return names[state.settingsDifficulty] || 'Normal'
  }

  function wlGetDifficultyColor(): string {
    const colors: Record<string, string> = {
      easy: '#00ff00',
      normal: '#ffff00',
      hard: '#ff6600',
      insane: '#ff0000',
    }
    return colors[state.settingsDifficulty] || '#ffff00'
  }

  function wlGetRarityColor(rarity: string): string {
    return RARITY_COLOR_MAP[rarity] || '#a0a0a0'
  }

  function wlGetRarityName(rarity: string): string {
    const names: Record<string, string> = {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    }
    return names[rarity] || 'Common'
  }

  function wlGetTotalPowerUpCount(): number {
    return POWER_UPS.length
  }

  function wlGetTotalObstacleCount(): number {
    return OBSTACLES.length
  }

  function wlGetTotalAchievementCount(): number {
    return ACHIEVEMENTS.length
  }

  function wlGetTotalShipCount(): number {
    return SHIPS.length
  }

  function wlGetTotalTrackCount(): number {
    return TRACKS.length
  }

  function wlGetTotalModeCount(): number {
    return RACE_MODES.length
  }

  function wlGetTotalComponentCount(): number {
    return COMPONENTS.length
  }

  function wlGetWordPoolSize(): number {
    return WORD_POOL_EASY.length + WORD_POOL_MEDIUM.length + WORD_POOL_HARD.length + WORD_POOL_INSANE.length
  }

  // ==========================================================
  // RESET / DATA MANAGEMENT
  // ==========================================================

  function wlResetAllData(): void {
    const defaults = getDefaultState()
    setState(defaults)
    try {
      localStorage.removeItem('warp-lane-save')
    } catch {
      // Ignore storage errors
    }
  }

  function wlExportData(): string {
    try {
      return JSON.stringify(state, null, 2)
    } catch {
      return '{}'
    }
  }

  function wlImportData(json: string): boolean {
    try {
      const parsed = JSON.parse(json)
      const defaults = getDefaultState()
      setState({ ...defaults, ...parsed })
      return true
    } catch {
      return false
    }
  }

  function wlClearSave(): void {
    setState(getDefaultState())
    try {
      localStorage.removeItem('warp-lane-save')
    } catch {
      // Ignore storage errors
    }
  }

  // ==========================================================
  // TIMER TICK (for active effects)
  // ==========================================================

  function wlTickTimers(): void {
    if (!state.raceInProgress) return
    setState((prev) => {
      const newPUTimers = { ...prev.powerUpTimers }
      const newActivePU: PowerUpId[] = []
      for (const id of prev.activePowerUps) {
        newPUTimers[id] = Math.max(0, (newPUTimers[id] || 0) - 1)
        if (newPUTimers[id] > 0) {
          newActivePU.push(id)
        }
      }
      const newOTimers = { ...prev.obstacleTimers }
      const newActiveObs: ObstacleId[] = []
      for (const id of prev.activeObstacles) {
        newOTimers[id] = Math.max(0, (newOTimers[id] || 0) - 1)
        if (newOTimers[id] > 0) {
          newActiveObs.push(id)
        }
      }
      let newShield = prev.currentShieldHP
      const hasDarkZone = newActiveObs.includes('dark_zone')
      if (hasDarkZone) {
        newShield = Math.max(0, newShield - 2)
      }
      let newEnergy = prev.currentEnergy
      const hasIonCloud = newActiveObs.includes('ion_cloud')
      if (hasIonCloud) {
        newEnergy = Math.max(0, newEnergy - 3)
      }
      let newBoostTimer = prev.boostTimer
      let newBoostActive = prev.boostActive
      if (prev.boostTimer > 0) {
        newBoostTimer = prev.boostTimer - 1
        if (newBoostTimer <= 0) {
          newBoostActive = false
        }
      }
      return {
        ...prev,
        raceTime: prev.raceTime + 1,
        activePowerUps: newActivePU,
        powerUpTimers: newPUTimers,
        activeObstacles: newActiveObs,
        obstacleTimers: newOTimers,
        currentShieldHP: newShield,
        currentEnergy: newEnergy,
        boostTimer: newBoostTimer,
        boostActive: newBoostActive,
      }
    })
  }

  // ==========================================================
  // SHIP SELECTION HELPERS
  // ==========================================================

  function wlGetShipsByRarity(rarity: string): ShipDefinition[] {
    return SHIPS.filter((s) => s.rarity === rarity)
  }

  function wlGetShipsByUnlockStatus(unlocked: boolean): ShipDefinition[] {
    if (unlocked) {
      return SHIPS.filter((s) => state.unlockedShips.includes(s.id))
    }
    return SHIPS.filter((s) => !state.unlockedShips.includes(s.id))
  }

  function wlGetShipsSortedBySpeed(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => b.baseStats.speed - a.baseStats.speed)
  }

  function wlGetShipsSortedByHandling(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => b.baseStats.handling - a.baseStats.handling)
  }

  function wlGetShipsSortedByBoost(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => b.baseStats.boost - a.baseStats.boost)
  }

  function wlGetShipsSortedByShield(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => b.baseStats.shield - a.baseStats.shield)
  }

  function wlGetShipsSortedByEnergy(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => b.baseStats.energy - a.baseStats.energy)
  }

  function wlGetShipsSortedByMass(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => a.baseStats.mass - b.baseStats.mass)
  }

  function wlGetFastestShip(): ShipId {
    let maxSpeed = 0
    let result: ShipId = 'razor'
    for (const ship of SHIPS) {
      if (ship.baseStats.speed > maxSpeed) {
        maxSpeed = ship.baseStats.speed
        result = ship.id
      }
    }
    return result
  }

  function wlGetMostAgileShip(): ShipId {
    let maxHandling = 0
    let result: ShipId = 'razor'
    for (const ship of SHIPS) {
      if (ship.baseStats.handling > maxHandling) {
        maxHandling = ship.baseStats.handling
        result = ship.id
      }
    }
    return result
  }

  function wlGetMostTankyShip(): ShipId {
    let maxShield = 0
    let result: ShipId = 'razor'
    for (const ship of SHIPS) {
      if (ship.baseStats.shield > maxShield) {
        maxShield = ship.baseStats.shield
        result = ship.id
      }
    }
    return result
  }

  function wlGetShipOverallScore(id: ShipId): number {
    const ship = SHIPS.find((s) => s.id === id)
    if (!ship) return 0
    const stats = getShipEffectiveStats(ship, state.shipComponents)
    return Math.floor(
      (stats.speed + stats.handling + stats.boost + stats.shield + stats.energy + (100 - stats.mass)) / 6
    )
  }

  function wlGetShipsSortedByOverall(): ShipDefinition[] {
    return [...SHIPS].sort((a, b) => {
      const scoreA = wlGetShipOverallScore(a.id)
      const scoreB = wlGetShipOverallScore(b.id)
      return scoreB - scoreA
    })
  }

  function wlGetShipStatBar(id: ShipId, stat: keyof ShipStats): number {
    const stats = wlGetShipStats(id)
    return stats[stat]
  }

  function wlGetShipStatLabel(stat: keyof ShipStats): string {
    const labels: Record<string, string> = {
      speed: 'Speed',
      handling: 'Handling',
      boost: 'Boost',
      shield: 'Shield',
      energy: 'Energy',
      mass: 'Mass',
    }
    return labels[stat] || stat
  }

  // ==========================================================
  // RACE PREPARATION HELPERS
  // ==========================================================

  function wlGetRaceSetup(): {
    ship: ShipDefinition | undefined
    track: TrackDefinition | undefined
    mode: RaceMode
    difficulty: string
  } {
    return {
      ship: wlGetSelectedShip(),
      track: wlGetSelectedTrack(),
      mode: state.selectedMode,
      difficulty: state.settingsDifficulty,
    }
  }

  function wlCanStartRace(): boolean {
    return !state.raceInProgress
  }

  function wlIsTrackAccessible(trackId: TrackId): boolean {
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track) return false
    if (track.difficulty <= 5) return true
    if (track.difficulty <= 8) return state.racerLevel >= 10
    return state.racerLevel >= 20
  }

  function wlGetLockedTrackReason(trackId: TrackId): string {
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track) return 'Track not found'
    if (track.difficulty <= 5) return ''
    if (track.difficulty <= 8 && state.racerLevel < 10) {
      return `Reach Racer Level 10 to access this track`
    }
    if (state.racerLevel < 20) {
      return `Reach Racer Level 20 to access this track`
    }
    return ''
  }

  function wlGetEstimatedRaceTime(trackId: TrackId): string {
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track) return '~60s'
    const avgWPM = wlGetAverageWPM() || 30
    const wordTime = track.length / 10 / avgWPM * 60
    const obstacles = Math.floor(track.hazardDensity * 5 * 3)
    return `~${Math.floor(wordTime + obstacles)}s`
  }

  function wlGetRecommendedShips(trackId: TrackId): ShipId[] {
    const track = TRACKS.find((t) => t.id === trackId)
    if (!track) return ['razor']
    if (track.hazardDensity > 0.6) {
      return state.unlockedShips.includes('eclipse') ? ['eclipse', 'nebula', 'viper'] : ['razor']
    }
    if (track.length > 1500) {
      return state.unlockedShips.includes('comet') ? ['comet', 'quasar', 'pulsar'] : ['razor']
    }
    if (track.difficulty < 4) {
      return ['razor', 'viper', 'phantom']
    }
    return state.unlockedShips.includes('void_runner') ? ['void_runner', 'quasar', 'phantom'] : ['razor']
  }

  // ==========================================================
  // STATS SUMMARY
  // ==========================================================

  function wlGetStatsSummary(): {
    totalRaces: number
    totalWins: number
    winRate: number
    totalWords: number
    totalDistance: string
    bestScore: number
    bestWPM: number
    bestCombo: number
    avgWPM: number
    avgScore: number
    level: number
    credits: string
    achievements: number
    totalAchievements: number
  } {
    return {
      totalRaces: state.totalRaces,
      totalWins: state.totalWins,
      winRate: wlGetWinRate(),
      totalWords: state.totalWordsTyped,
      totalDistance: wlGetFormattedDistance(),
      bestScore: wlGetBestScore(),
      bestWPM: wlGetBestWPM(),
      bestCombo: wlGetBestCombo(),
      avgWPM: wlGetAverageWPM(),
      avgScore: wlGetAverageScore(),
      level: state.racerLevel,
      credits: wlFormatCredits(state.credits),
      achievements: state.achievements.length,
      totalAchievements: ACHIEVEMENTS.length,
    }
  }

  function wlGetPlayTimeMinutes(): number {
    const totalRaceTime = state.raceHistory.reduce((sum, r) => sum + r.time, 0)
    return Math.floor(totalRaceTime / 60)
  }

  function wlGetPlayTimeFormatted(): string {
    const minutes = wlGetPlayTimeMinutes()
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  function wlGetRacesPerSession(): number {
    if (state.raceHistory.length === 0) return 0
    const firstDate = state.raceHistory[0].date
    const lastDate = state.raceHistory[state.raceHistory.length - 1].date
    const days = Math.max(1, Math.floor(
      (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / 86400000
    ))
    return Math.floor(state.raceHistory.length / days)
  }

  function wlGetFavoriteMode(): RaceMode {
    const counts: Record<string, number> = {
      sprint: 0,
      circuit: 0,
      time_trial: 0,
      elimination: 0,
    }
    for (const race of state.raceHistory) {
      counts[race.mode] = (counts[race.mode] || 0) + 1
    }
    let maxMode: RaceMode = 'sprint'
    let maxCount = 0
    for (const [mode, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        maxMode = mode as RaceMode
      }
    }
    return maxMode
  }

  // ==========================================================
  // TYPING ACCURACY & MISC
  // ==========================================================

  function wlGetTypingAccuracy(): number {
    if (state.raceWordsTyped === 0) return 100
    const accuracy = Math.max(50, 100 - (state.raceObstaclesHit * 5))
    return accuracy
  }

  function wlGetLetterProgress(): number {
    if (!state.currentWord || state.currentWord.length === 0) return 0
    return Math.floor((state.typedLetters.length / state.currentWord.length) * 100)
  }

  function wlGetRemainingLetters(): string {
    if (!state.currentWord) return ''
    return state.currentWord.slice(state.typedLetters.length)
  }

  function wlGetMistypedLetter(): string | null {
    if (!state.currentWord || state.typedLetters.length >= state.currentWord.length) return null
    return state.currentWord[state.typedLetters.length]
  }

  function wlIsTypingCorrect(): boolean {
    if (!state.currentWord || state.typedLetters.length === 0) return true
    const expected = state.currentWord.slice(0, state.typedLetters.length)
    return expected === state.typedLetters
  }

  function wlGetWordProgress(): { word: string; typed: string; remaining: string; percent: number } {
    return {
      word: state.currentWord,
      typed: state.typedLetters,
      remaining: wlGetRemainingLetters(),
      percent: wlGetLetterProgress(),
    }
  }

  // ==========================================================
  // RANDOM EVENT HELPERS
  // ==========================================================

  function wlRandomObstacleEvent(): ObstacleId | null {
    const roll = Math.random()
    const track = TRACKS.find((t) => t.id === state.selectedTrack)
    const density = track ? track.hazardDensity : 0.3
    if (roll > density) return null
    const idx = Math.floor(Math.random() * OBSTACLES.length)
    return OBSTACLES[idx].id
  }

  function wlRandomPowerUpSpawn(): PowerUpId | null {
    const roll = Math.random()
    if (roll > 0.3) return null
    const weights = POWER_UPS.map((p) =>
      p.rarity === 'common' ? 40 : p.rarity === 'rare' ? 30 : 10
    )
    const totalWeight = weights.reduce((sum, w) => sum + w, 0)
    let r = Math.random() * totalWeight
    for (let i = 0; i < POWER_UPS.length; i++) {
      r -= weights[i]
      if (r <= 0) return POWER_UPS[i].id
    }
    return POWER_UPS[0].id
  }

  function wlProcessRandomEvent(): { obstacle: ObstacleId | null; powerUp: PowerUpId | null } {
    const obstacle = wlRandomObstacleEvent()
    const powerUp = wlRandomPowerUpSpawn()
    if (obstacle) {
      wlActivateObstacle(obstacle)
    }
    if (powerUp) {
      wlActivatePowerUp(powerUp)
    }
    return { obstacle, powerUp }
  }

  // ==========================================================
  // COMPUTED DERIVED STATE
  // ==========================================================

  function wlGetShipPowerLevel(): string {
    const totalBonus = wlGetShipTotalStatBonus()
    if (totalBonus >= 120) return 'S'
    if (totalBonus >= 90) return 'A'
    if (totalBonus >= 60) return 'B'
    if (totalBonus >= 30) return 'C'
    return 'D'
  }

  function wlGetShipPowerColor(): string {
    const level = wlGetShipPowerLevel()
    const colors: Record<string, string> = {
      S: '#ff0000',
      A: '#ff6600',
      B: '#ffff00',
      C: '#00ff00',
      D: '#00ccff',
    }
    return colors[level] || '#ffffff'
  }

  function wlGetRacerProfile(): {
    name: string
    level: number
    title: string
    credits: number
    races: number
    wins: number
    ships: number
    achievements: number
    favoriteShip: ShipId | null
    favoriteTrack: TrackId | null
  } {
    return {
      name: 'Racer',
      level: state.racerLevel,
      title: state.title,
      credits: state.credits,
      races: state.totalRaces,
      wins: state.totalWins,
      ships: state.unlockedShips.length,
      achievements: state.achievements.length,
      favoriteShip: state.mostUsedShip,
      favoriteTrack: state.mostPlayedTrack,
    }
  }

  function wlGetCompletionPercentage(): number {
    const shipProgress = (state.unlockedShips.length / SHIPS.length) * 25
    const trackProgress = (wlGetRacedTrackCount() / TRACKS.length) * 25
    const achievementProgress = (state.achievements.length / ACHIEVEMENTS.length) * 25
    const levelProgress = (state.racerLevel / 50) * 25
    return Math.floor(shipProgress + trackProgress + achievementProgress + levelProgress)
  }

  function wlGetGameCompletionGrade(): string {
    const pct = wlGetCompletionPercentage()
    if (pct >= 90) return 'S+'
    if (pct >= 80) return 'S'
    if (pct >= 70) return 'A'
    if (pct >= 60) return 'B'
    if (pct >= 40) return 'C'
    if (pct >= 20) return 'D'
    return 'F'
  }

  function wlGetTimeUntilDailyRefresh(): string {
    const now = new Date()
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const diff = tomorrow.getTime() - now.getTime()
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m`
  }

  // ==========================================================
  // ENERGY REGEN (passive per tick)
  // ==========================================================

  function wlPassiveEnergyRegen(): void {
    if (!state.raceInProgress) return
    const ship = SHIPS.find((s) => s.id === state.selectedShip)
    if (!ship) return
    const regenRate = ship.baseStats.energy / 200
    setState((prev) => ({
      ...prev,
      currentEnergy: Math.min(100, prev.currentEnergy + regenRate),
    }))
  }

  function wlPassiveShieldRegen(): void {
    if (!state.raceInProgress) return
    if (state.activeObstacles.length > 0) return
    setState((prev) => ({
      ...prev,
      currentShieldHP: Math.min(100, prev.currentShieldHP + 0.5),
    }))
  }

  // ==========================================================
  // CIRCUIT MODE HELPERS
  // ==========================================================

  function wlGetCircuitLap(): number {
    const track = TRACKS.find((t) => t.id === state.selectedTrack)
    if (!track) return 1
    const laps = Math.floor(state.raceDistance / track.length) + 1
    return Math.min(3, laps)
  }

  function wlGetTotalLaps(): number {
    if (state.selectedMode === 'circuit') return 3
    return 1
  }

  function wlGetCurrentLap(): number {
    if (state.selectedMode !== 'circuit') return 1
    return wlGetCircuitLap()
  }

  function wlIsLapComplete(): boolean {
    if (state.selectedMode !== 'circuit') return false
    const track = TRACKS.find((t) => t.id === state.selectedTrack)
    if (!track) return false
    return state.raceDistance > 0 && state.raceDistance % track.length < 5
  }

  function wlIsCircuitComplete(): boolean {
    if (state.selectedMode !== 'circuit') return false
    return wlGetCurrentLap() >= 3
  }

  // ==========================================================
  // WORD GENERATION HELPERS
  // ==========================================================

  function wlRefillWordQueue(): void {
    setState((prev) => {
      const queue = fillWordQueue(prev.wordQueue, prev.settingsDifficulty, prev.currentCombo, 5)
      return { ...prev, wordQueue: queue }
    })
  }

  function wlGetWordDifficulty(word: string): 'easy' | 'medium' | 'hard' | 'insane' {
    if (word.length <= 4) return 'easy'
    if (word.length <= 7) return 'medium'
    if (word.length <= 12) return 'hard'
    return 'insane'
  }

  function wlGetWordScore(word: string): number {
    const len = word.length
    return len * 10
  }

  // ==========================================================
  // RETURN ALL STATE AND FUNCTIONS
  // ==========================================================

  return {
    // State
    ...state,
    // Ship functions
    wlGetShip,
    wlGetAllShips,
    wlGetSelectedShip,
    wlSelectShip,
    wlUnlockShip,
    wlIsShipUnlocked,
    wlCanUnlockShip,
    wlGetShipCount,
    wlGetShipStats,
    wlGetSelectedShipStats,
    wlGetShipBaseStats,
    wlCompareShips,
    wlGetShipRarity,
    wlGetShipRarityColor,
    wlGetShipCost,
    wlGetShipUnlockLevel,
    wlToggleShipFavorite,
    wlIsShipFavorite,
    wlGetShipFavorites,
    wlGetShipDescription,
    wlGetShipName,
    // Track functions
    wlGetTrack,
    wlGetAllTracks,
    wlGetSelectedTrack,
    wlSelectTrack,
    wlGetTrackDifficulty,
    wlGetTrackLength,
    wlGetTrackReward,
    wlGetTrackHazardDensity,
    wlGetTrackThemeColor,
    wlGetTrackName,
    wlGetTrackDescription,
    wlGetTrackCount,
    wlToggleTrackFavorite,
    wlIsTrackFavorite,
    wlGetTrackFavorites,
    wlGetTracksByDifficulty,
    wlGetTracksSortedByDifficulty,
    wlGetTracksSortedByReward,
    wlGetRacedTrackCount,
    wlHasRacedOnTrack,
    // Race mode functions
    wlGetAllModes,
    wlGetSelectedMode,
    wlSelectMode,
    wlGetModeName,
    wlGetModeDescription,
    wlGetModeIcon,
    wlIsModeActive,
    // Obstacle functions
    wlGetObstacle,
    wlGetAllObstacles,
    wlGetObstacleName,
    wlGetObstacleDamage,
    wlGetObstacleSpeedPenalty,
    wlGetObstacleDuration,
    wlGetObstacleAvoidanceDifficulty,
    wlGetObstacleDescription,
    wlGetActiveObstacles,
    wlGetObstacleTimer,
    wlActivateObstacle,
    wlDeactivateObstacle,
    wlHasActiveObstacle,
    wlGetObstacleCount,
    wlGetMostDangerousObstacle,
    wlClearAllObstacles,
    // Power-up functions
    wlGetPowerUp,
    wlGetAllPowerUps,
    wlGetPowerUpName,
    wlGetPowerUpDescription,
    wlGetPowerUpDuration,
    wlGetPowerUpEffectValue,
    wlGetPowerUpRarity,
    wlGetActivePowerUps,
    wlGetPowerUpTimer,
    wlActivatePowerUp,
    wlDeactivatePowerUp,
    wlHasPowerUp,
    wlGetActivePowerUpCount,
    wlClearAllPowerUps,
    wlGetPowerUpsByRarity,
    wlGetRandomPowerUp,
    // Component functions
    wlGetComponent,
    wlGetAllComponents,
    wlGetComponentName,
    wlGetComponentDescription,
    wlGetComponentLevel,
    wlGetComponentMaxLevel,
    wlGetComponentStat,
    wlGetComponentUpgradeCost,
    wlCanUpgradeComponent,
    wlUpgradeComponent,
    wlGetComponentStatBonus,
    wlGetComponentProgress,
    wlGetTotalUpgradeCost,
    wlMaxUpgradeComponent,
    wlGetShipTotalStatBonus,
    wlGetComponentCount,
    // Level/XP/Rank functions
    wlGetLevel,
    wlGetXP,
    wlGetXPToNext,
    wlGetXPProgress,
    wlAddXP,
    wlGetTitle,
    wlGetTitleForLevel,
    wlGetMaxLevel,
    wlIsMaxLevel,
    wlGetXPForLevel,
    wlGetTotalXPForLevel,
    // Credits functions
    wlGetCredits,
    wlAddCredits,
    wlSpendCredits,
    wlCanAfford,
    wlGetTotalCreditsEarned,
    wlFormatCredits,
    // Race mechanics
    wlGetCurrentWord,
    wlGetTypedLetters,
    wlGetWordQueue,
    wlTypeLetter,
    wlStartRace,
    wlFinishRace,
    wlAbortRace,
    wlIsRaceInProgress,
    wlGetRaceTime,
    wlIncrementRaceTime,
    wlGetRaceDistance,
    wlGetRaceProgress,
    wlGetRaceScore,
    wlGetRaceWordsTyped,
    wlGetRaceWPM,
    wlGetRaceComboMax,
    wlGetRaceObstaclesHit,
    wlGetRacePowerUpsCollected,
    // Combo & Boost
    wlGetCurrentCombo,
    wlGetComboMultiplier,
    wlGetBestCombo,
    wlResetCombo,
    wlGetComboTier,
    wlGetComboColor,
    wlGetComboNextThreshold,
    wlGetComboToNextTier,
    wlIsBoostActive,
    wlActivateBoost,
    wlDeactivateBoost,
    wlGetBoostTimer,
    wlDecrementBoostTimer,
    // Shield & Energy
    wlGetShieldHP,
    wlGetMaxShieldHP,
    wlGetShieldPercentage,
    wlDamageShield,
    wlRepairShield,
    wlIsShieldFull,
    wlIsShieldBroken,
    wlGetEnergy,
    wlGetMaxEnergy,
    wlGetEnergyPercentage,
    wlConsumeEnergy,
    wlRechargeEnergy,
    wlIsEnergyFull,
    wlIsEnergyEmpty,
    wlGetSpeed,
    wlGetMaxSpeed,
    wlGetSpeedPercentage,
    // Race history & stats
    wlGetRaceHistory,
    wlGetRaceCount,
    wlGetWinCount,
    wlGetWinRate,
    wlGetTotalWordsTyped,
    wlGetTotalDistance,
    wlGetFormattedDistance,
    wlGetLastRace,
    wlGetBestScore,
    wlGetBestWPM,
    wlGetBestCombo,
    wlGetAverageWPM,
    wlGetAverageScore,
    wlGetRacesByMode,
    wlGetRacesByTrack,
    wlGetRaceCountByMode,
    wlGetRaceCountByTrack,
    wlGetMostPlayedTrack,
    wlGetMostUsedShip,
    wlGetRecentRaces,
    wlClearRaceHistory,
    // Best times/scores
    wlGetTimeTrialBest,
    wlGetSprintBest,
    wlGetCircuitBest,
    wlGetAllTimeTrialBests,
    wlGetAllSprintBests,
    wlGetAllCircuitBests,
    wlGetBestTimeForTrack,
    wlGetBestScoreForTrack,
    wlFormatTime,
    // Elimination
    wlGetEliminationLives,
    wlLoseEliminationLife,
    wlIsEliminated,
    wlGetRacePositions,
    wlGetPlayerPosition,
    wlShufflePositions,
    // Achievements
    wlGetAchievements,
    wlGetUnlockedAchievements,
    wlIsAchievementUnlocked,
    wlGetAchievementById,
    wlGetAchievementName,
    wlGetAchievementDescription,
    wlGetAchievementReward,
    wlGetAchievementIcon,
    wlGetAchievementCategory,
    wlUnlockAchievement,
    wlGetAchievementCount,
    wlGetTotalAchievementCount,
    wlGetAchievementProgress,
    wlGetAchievementsByCategory,
    wlGetAchievementCategories,
    // Leaderboard
    wlGetLeaderboard,
    wlGetLeaderboardForTrack,
    wlGetPlayerRank,
    wlGetPlayerBestScore,
    wlAddLeaderboardEntry,
    wlClearLeaderboard,
    wlGetTopN,
    wlGetGlobalLeaderboard,
    // Daily challenges
    wlGetDailyChallenges,
    wlRefreshDailyChallenges,
    wlNeedsDailyRefresh,
    wlCompleteDailyChallenge,
    wlUpdateDailyProgress,
    wlIsDailyChallengeCompleted,
    wlGetDailyChallengeProgress,
    wlGetDailyChallengeTarget,
    wlGetDailyChallengeReward,
    wlGetCompletedDailyCount,
    wlGetTotalDailyReward,
    wlGetUnclaimedDailyReward,
    // Customization
    wlGetPaintOptions,
    wlGetTrailOptions,
    wlGetShipPaint,
    wlSetShipPaint,
    wlGetShipTrail,
    wlSetShipTrail,
    // Settings
    wlGetVolume,
    wlSetVolume,
    wlGetSFXVolume,
    wlSetSFXVolume,
    wlIsParticlesEnabled,
    wlToggleParticles,
    wlIsScreenShakeEnabled,
    wlToggleScreenShake,
    wlIsAutoBoostEnabled,
    wlToggleAutoBoost,
    wlGetDifficulty,
    wlSetDifficulty,
    wlGetDifficultyMultiplier,
    // Tutorial
    wlIsTutorialCompleted,
    wlGetTutorialStep,
    wlSetTutorialStep,
    wlAdvanceTutorial,
    wlCompleteTutorial,
    wlGetTotalTutorialSteps,
    wlGetTutorialProgress,
    wlResetTutorial,
    // Difficulty/misc
    wlGetDifficultyName,
    wlGetDifficultyColor,
    wlGetRarityColor,
    wlGetRarityName,
    wlGetTotalPowerUpCount,
    wlGetTotalObstacleCount,
    wlGetTotalAchievementCount,
    wlGetTotalShipCount,
    wlGetTotalTrackCount,
    wlGetTotalModeCount,
    wlGetTotalComponentCount,
    wlGetWordPoolSize,
    // Reset/data management
    wlResetAllData,
    wlExportData,
    wlImportData,
    wlClearSave,
    // Timer tick
    wlTickTimers,
    // Ship selection helpers
    wlGetShipsByRarity,
    wlGetShipsByUnlockStatus,
    wlGetShipsSortedBySpeed,
    wlGetShipsSortedByHandling,
    wlGetShipsSortedByBoost,
    wlGetShipsSortedByShield,
    wlGetShipsSortedByEnergy,
    wlGetShipsSortedByMass,
    wlGetFastestShip,
    wlGetMostAgileShip,
    wlGetMostTankyShip,
    wlGetShipOverallScore,
    wlGetShipsSortedByOverall,
    wlGetShipStatBar,
    wlGetShipStatLabel,
    // Race preparation
    wlGetRaceSetup,
    wlCanStartRace,
    wlIsTrackAccessible,
    wlGetLockedTrackReason,
    wlGetEstimatedRaceTime,
    wlGetRecommendedShips,
    // Stats summary
    wlGetStatsSummary,
    wlGetPlayTimeMinutes,
    wlGetPlayTimeFormatted,
    wlGetRacesPerSession,
    wlGetFavoriteMode,
    // Typing accuracy/misc
    wlGetTypingAccuracy,
    wlGetLetterProgress,
    wlGetRemainingLetters,
    wlGetMistypedLetter,
    wlIsTypingCorrect,
    wlGetWordProgress,
    // Random events
    wlRandomObstacleEvent,
    wlRandomPowerUpSpawn,
    wlProcessRandomEvent,
    // Computed derived state
    wlGetShipPowerLevel,
    wlGetShipPowerColor,
    wlGetRacerProfile,
    wlGetCompletionPercentage,
    wlGetGameCompletionGrade,
    wlGetTimeUntilDailyRefresh,
    // Passive regen
    wlPassiveEnergyRegen,
    wlPassiveShieldRegen,
    // Circuit helpers
    wlGetCircuitLap,
    wlGetTotalLaps,
    wlGetCurrentLap,
    wlIsLapComplete,
    wlIsCircuitComplete,
    // Word generation
    wlRefillWordQueue,
    wlGetWordDifficulty,
    wlGetWordScore,
  }
}
