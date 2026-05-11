// ============================================================================
// Neon City Wire — Cyberpunk Urban Exploration / Hacking Game Module
// SSR-safe: lazy init pattern, no browser APIs at module level.
// PREFIX: All public exports use the `nc` prefix.
// NO HOOKS: No React hooks exported.
// ============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type SystemType =
  | 'security_camera'
  | 'atm'
  | 'door_lock'
  | 'drone'
  | 'server'
  | 'neural_implant';

export type HackPhase = 'idle' | 'breach' | 'decrypt' | 'extract' | 'complete' | 'failed';

export type FactionId = 'corporate' | 'underground' | 'neutral' | 'law' | 'ai_collective';

export type ItemType = 'data' | 'cyberware' | 'tool' | 'consumable';

export type CyberdeckTier = 'basic' | 'standard' | 'advanced' | 'military' | 'quantum';

export interface District {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  dangerLevel: number;
  unlockCost: number;
  unlocked: boolean;
  color: string;
  missionsCompleted: number;
  totalMissions: number;
}

export interface HackableSystem {
  id: string;
  name: string;
  difficulty: number;
  type: SystemType;
  district: string;
  reward: number;
  firewallLevel: number;
  encryption: string;
  hacked: boolean;
  hackCount: number;
}

export interface Cyberdeck {
  id: string;
  name: string;
  tier: CyberdeckTier;
  level: number;
  maxLevel: number;
  breachPower: number;
  decryptSpeed: number;
  extractBonus: number;
  upgradeCost: number;
  equipped: boolean;
  unlockLevel: number;
}

export interface HackerSkill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  xp: number;
  xpToNext: number;
  description: string;
}

export interface Augmentation {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  installed: boolean;
  cost: number;
  upgradeCost: number;
  description: string;
  effect: string;
}

export interface Contact {
  id: string;
  name: string;
  role: string;
  hired: boolean;
  hireCost: number;
  reputationReq: number;
  service: string;
  serviceCost: number;
  serviceCooldown: number;
  lastUsed: number;
  description: string;
}

export interface MarketItem {
  id: string;
  name: string;
  type: ItemType;
  price: number;
  sellPrice: number;
  reputationReq: number;
  description: string;
  inStock: boolean;
  quantity: number;
}

export interface InventoryEntry {
  itemId: string;
  name: string;
  type: ItemType;
  quantity: number;
  value: number;
}

export interface IntelFragment {
  id: string;
  content: string;
  decoded: boolean;
  district: string;
  rarity: number;
  conspiracyId: string;
  collectedAt: number;
}

export interface Conspiracy {
  id: string;
  name: string;
  description: string;
  fragmentsTotal: number;
  fragmentsDecoded: number;
  progress: number;
  completed: boolean;
  reward: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: (s: NeonCityState) => boolean;
}

export interface DailyChallengeData {
  district: string;
  objective: string;
  bonusMultiplier: number;
  completed: boolean;
  reward: number;
  dateSeed: number;
}

export interface HackResult {
  success: boolean;
  phase: HackPhase;
  creditsEarned: number;
  xpEarned: number;
  reputationChange: number;
  dataExtracted: string;
  message: string;
}

export interface RunEntry {
  systemId: string;
  systemName: string;
  district: string;
  success: boolean;
  creditsEarned: number;
  xpEarned: number;
  timestamp: number;
  duration: number;
}

export interface PasswordWord {
  word: string;
  hint: string;
  difficulty: number;
}

// ---------------------------------------------------------------------------
// State Interface
// ---------------------------------------------------------------------------

export interface NeonCityState {
  /** Current hacker level, range 1–50 */
  level: number;
  /** Accumulated experience points */
  xp: number;
  /** XP needed to reach the next level */
  xpToNext: number;
  /** Cybercurrency balance */
  credits: number;
  /** Overall reputation score across all factions */
  reputation: number;
  /** Total number of successful hacks */
  totalHacks: number;
  /** Count of rare data items collected */
  rareData: number;
  /** Current consecutive hack streak */
  streak: number;
  /** Best consecutive hack streak achieved */
  bestStreak: number;
  /** Player inventory, max 60 items */
  inventory: InventoryEntry[];
  /** List of unlocked achievement IDs */
  achievements: string[];
  /** Daily challenge data */
  dailyChallenge: DailyChallengeData;
  /** Current active run (hack attempt) */
  currentRun: {
    systemId: string;
    phase: HackPhase;
    attempts: number;
    maxAttempts: number;
    startTime: number;
    passwordPool: PasswordWord[];
    targetWord: string;
    guessedWords: string[];
    correctPositions: number[];
  } | null;
  /** Currently selected district id */
  currentDistrict: string;
  /** Currently equipped cyberdeck id */
  currentCyberdeck: string;
  /** Currently active contact id */
  currentContact: string;
  /** Faction standings, range -100 to 100 */
  factionStanding: Record<FactionId, number>;
  /** Intel fragments collected */
  intelFragments: IntelFragment[];
  /** Conspiracy progress */
  conspiracies: Conspiracy[];
  /** Run history (last 30 entries) */
  runHistory: RunEntry[];
  /** Total credits earned over all time */
  totalCreditsEarned: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_LEVEL = 50;
const MAX_INVENTORY = 60;
const MAX_RUN_HISTORY = 30;
const XP_BASE = 80;
const XP_MULTIPLIER = 1.25;
const CREDITS_MULTIPLIER = 1.15;
const STREAK_BONUS_THRESHOLD = 3;
const FACTION_IDS: FactionId[] = ['corporate', 'underground', 'neutral', 'law', 'ai_collective'];

const HACK_PASSWORDS: PasswordWord[] = [
  { word: 'SHADOW', hint: 'What follows you in the dark', difficulty: 1 },
  { word: 'NEON', hint: 'The light of the city', difficulty: 1 },
  { word: 'GHOST', hint: 'Untraceable presence', difficulty: 1 },
  { word: 'CIPHER', hint: 'An encrypted message', difficulty: 2 },
  { word: 'VIRUS', hint: 'Malicious code', difficulty: 2 },
  { word: 'GLITCH', hint: 'A momentary fault', difficulty: 2 },
  { word: 'BREACH', hint: 'To break through defenses', difficulty: 3 },
  { word: 'COVERT', hint: 'Done in secret', difficulty: 3 },
  { word: 'SYNTH', hint: 'Artificial creation', difficulty: 3 },
  { word: 'QUANTUM', hint: 'Smallest discrete unit', difficulty: 4 },
  { word: 'NEXUS', hint: 'A central connection point', difficulty: 4 },
  { word: 'ENIGMA', hint: 'Something puzzling', difficulty: 5 },
  { word: 'OBSIDIAN', hint: 'Dark volcanic glass', difficulty: 5 },
  { word: 'SPECTRUM', hint: 'Range of frequencies', difficulty: 6 },
  { word: 'TERMINUS', hint: 'The final point', difficulty: 6 },
  { word: 'CHRONICLE', hint: 'A historical record', difficulty: 7 },
  { word: 'LABYRINTH', hint: 'A complex maze', difficulty: 7 },
  { word: 'SOVEREIGN', hint: 'Supreme ruler', difficulty: 8 },
  { word: 'FREQUENCY', hint: 'Rate of occurrence', difficulty: 8 },
  { word: 'NIGHTFALL', hint: 'The onset of darkness', difficulty: 9 },
  { word: 'PARALLAX', hint: 'Apparent displacement', difficulty: 9 },
  { word: 'TRANSCEND', hint: 'To go beyond limits', difficulty: 10 },
];

// ---------------------------------------------------------------------------
// NC_DISTRICTS (8)
// ---------------------------------------------------------------------------

const NC_DISTRICTS: District[] = [
  { id: 'market', name: 'Market District', description: 'Bustling neon-lit bazaars where anything can be bought or sold. Street vendors hawk bootleg cyberware while data merchants trade stolen secrets in back alleys.', atmosphere: 'Warm neon glow, crowded streets, haggling voices', dangerLevel: 1, unlockCost: 0, unlocked: true, color: '#ff6b35', missionsCompleted: 0, totalMissions: 5 },
  { id: 'tech_quarter', name: 'Tech Quarter', description: 'The silicon heart of the city. Corporate R&D labs sit alongside independent tech shops. The air hums with electromagnetic interference from thousands of devices.', atmosphere: 'Cool blue lights, electronic hum, sterile halls', dangerLevel: 2, unlockCost: 500, unlocked: false, color: '#00b4d8', missionsCompleted: 0, totalMissions: 5 },
  { id: 'undercity', name: 'Undercity', description: 'A vast subterranean network of tunnels and forgotten infrastructure. The outcasts and fugitives of Neon City dwell here, far from corporate surveillance.', atmosphere: 'Dim amber lighting, dripping water, echoing tunnels', dangerLevel: 3, unlockCost: 1200, unlocked: false, color: '#e07a5f', missionsCompleted: 0, totalMissions: 5 },
  { id: 'corporate_plaza', name: 'Corporate Plaza', description: 'Towering spires of glass and steel housing the megacorporations that control Neon City. Security is tight, but the data vaults are legendary.', atmosphere: 'Harsh white fluorescence, marble floors, armed guards', dangerLevel: 4, unlockCost: 2500, unlocked: false, color: '#8ecae6', missionsCompleted: 0, totalMissions: 5 },
  { id: 'neon_strip', name: 'Neon Strip', description: 'The entertainment capital of Neon City. Holographic billboards, clubs pumping bass through vibrating floors, and an endless stream of tourists ripe for digital pickpocketing.', atmosphere: 'Pulsing pink and purple lights, thumping bass, holographic ads', dangerLevel: 3, unlockCost: 800, unlocked: false, color: '#c77dff', missionsCompleted: 0, totalMissions: 5 },
  { id: 'data_haven', name: 'Data Haven', description: 'A neutral zone where information flows freely. The city\'s hackers, journalists, and whistleblowers converge here to share and trade data away from corporate prying eyes.', atmosphere: 'Soft green terminal glow, quiet hum, hushed conversations', dangerLevel: 2, unlockCost: 1000, unlocked: false, color: '#80ed99', missionsCompleted: 0, totalMissions: 5 },
  { id: 'industrial_zone', name: 'Industrial Zone', description: 'Massive factories and automated assembly lines stretch to the horizon. Rogue drones patrol the perimeter, and abandoned warehouses hide secret server farms.', atmosphere: 'Harsh orange warning lights, mechanical clanking, chemical smell', dangerLevel: 4, unlockCost: 3000, unlocked: false, color: '#ffd60a', missionsCompleted: 0, totalMissions: 5 },
  { id: 'sky_gardens', name: 'Sky Gardens', description: 'An exclusive orbital station above the smog layer. The elite grow genetically modified plants and host encrypted gatherings. Access requires both skill and connections.', atmosphere: 'Natural sunlight, lush greenery, artificial breeze', dangerLevel: 5, unlockCost: 5000, unlocked: false, color: '#06d6a0', missionsCompleted: 0, totalMissions: 5 },
];

// ---------------------------------------------------------------------------
// NC_SYSTEMS (35)
// ---------------------------------------------------------------------------

const NC_SYSTEMS: HackableSystem[] = [
  // Market District (5 systems)
  { id: 'sys_m1', name: 'Bazaar Security Camera', difficulty: 1, type: 'security_camera', district: 'market', reward: 50, firewallLevel: 1, encryption: 'XOR', hacked: false, hackCount: 0 },
  { id: 'sys_m2', name: 'Street Corner ATM', difficulty: 2, type: 'atm', district: 'market', reward: 120, firewallLevel: 2, encryption: 'Caesar', hacked: false, hackCount: 0 },
  { id: 'sys_m3', name: 'Vendor Warehouse Lock', difficulty: 1, type: 'door_lock', district: 'market', reward: 40, firewallLevel: 1, encryption: 'ROT13', hacked: false, hackCount: 0 },
  { id: 'sys_m4', name: 'Delivery Drone #47', difficulty: 2, type: 'drone', district: 'market', reward: 80, firewallLevel: 2, encryption: 'XOR', hacked: false, hackCount: 0 },
  { id: 'sys_m5', name: 'Black Market Server', difficulty: 3, type: 'server', district: 'market', reward: 200, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  // Tech Quarter (5 systems)
  { id: 'sys_t1', name: 'R&D Lab Camera Grid', difficulty: 3, type: 'security_camera', district: 'tech_quarter', reward: 150, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_t2', name: 'Tech Store ATM', difficulty: 2, type: 'atm', district: 'tech_quarter', reward: 100, firewallLevel: 2, encryption: 'Caesar', hacked: false, hackCount: 0 },
  { id: 'sys_t3', name: 'Lab Access Door', difficulty: 4, type: 'door_lock', district: 'tech_quarter', reward: 180, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_t4', name: 'Patrol Drone Alpha', difficulty: 3, type: 'drone', district: 'tech_quarter', reward: 130, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_t5', name: 'Prototype Cloud Server', difficulty: 5, type: 'server', district: 'tech_quarter', reward: 350, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  // Undercity (5 systems)
  { id: 'sys_u1', name: 'Tunnel Surveillance', difficulty: 2, type: 'security_camera', district: 'undercity', reward: 80, firewallLevel: 2, encryption: 'XOR', hacked: false, hackCount: 0 },
  { id: 'sys_u2', name: 'Underground ATM', difficulty: 3, type: 'atm', district: 'undercity', reward: 160, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_u3', name: 'Bunker Blast Door', difficulty: 4, type: 'door_lock', district: 'undercity', reward: 200, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_u4', name: 'Scavenger Drone', difficulty: 3, type: 'drone', district: 'undercity', reward: 120, firewallLevel: 3, encryption: 'Caesar', hacked: false, hackCount: 0 },
  { id: 'sys_u5', name: 'Fugitive Database', difficulty: 4, type: 'server', district: 'undercity', reward: 280, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  // Corporate Plaza (5 systems)
  { id: 'sys_c1', name: 'MegaCorp Cam Array', difficulty: 5, type: 'security_camera', district: 'corporate_plaza', reward: 300, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  { id: 'sys_c2', name: 'Executive Floor ATM', difficulty: 6, type: 'atm', district: 'corporate_plaza', reward: 500, firewallLevel: 6, encryption: 'RSA-4096', hacked: false, hackCount: 0 },
  { id: 'sys_c3', name: 'Boardroom Vault Lock', difficulty: 7, type: 'door_lock', district: 'corporate_plaza', reward: 600, firewallLevel: 7, encryption: 'Quantum-Key', hacked: false, hackCount: 0 },
  { id: 'sys_c4', name: 'Security Drone Swarm', difficulty: 6, type: 'drone', district: 'corporate_plaza', reward: 450, firewallLevel: 6, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  { id: 'sys_c5', name: 'Mainframe Core', difficulty: 8, type: 'server', district: 'corporate_plaza', reward: 1000, firewallLevel: 8, encryption: 'Quantum-Key', hacked: false, hackCount: 0 },
  // Neon Strip (5 systems)
  { id: 'sys_n1', name: 'Club CCTV Hub', difficulty: 2, type: 'security_camera', district: 'neon_strip', reward: 90, firewallLevel: 2, encryption: 'ROT13', hacked: false, hackCount: 0 },
  { id: 'sys_n2', name: 'Casino ATM', difficulty: 4, type: 'atm', district: 'neon_strip', reward: 250, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_n3', name: 'VIP Lounge Lock', difficulty: 3, type: 'door_lock', district: 'neon_strip', reward: 170, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_n4', name: 'Ad Drone Network', difficulty: 3, type: 'drone', district: 'neon_strip', reward: 110, firewallLevel: 3, encryption: 'XOR', hacked: false, hackCount: 0 },
  { id: 'sys_n5', name: 'Entertainment Server', difficulty: 4, type: 'server', district: 'neon_strip', reward: 220, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  // Data Haven (5 systems)
  { id: 'sys_d1', name: 'Neutral Zone Cam', difficulty: 2, type: 'security_camera', district: 'data_haven', reward: 70, firewallLevel: 2, encryption: 'Caesar', hacked: false, hackCount: 0 },
  { id: 'sys_d2', name: 'Crypto ATM Node', difficulty: 3, type: 'atm', district: 'data_haven', reward: 140, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_d3', name: 'Archive Vault Door', difficulty: 4, type: 'door_lock', district: 'data_haven', reward: 190, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_d4', name: 'Courier Drone', difficulty: 2, type: 'drone', district: 'data_haven', reward: 100, firewallLevel: 2, encryption: 'ROT13', hacked: false, hackCount: 0 },
  { id: 'sys_d5', name: 'Whistleblower DB', difficulty: 5, type: 'server', district: 'data_haven', reward: 400, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  // Industrial Zone (5 systems)
  { id: 'sys_i1', name: 'Factory Surveillance', difficulty: 4, type: 'security_camera', district: 'industrial_zone', reward: 160, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_i2', name: 'Payroll ATM', difficulty: 4, type: 'atm', district: 'industrial_zone', reward: 220, firewallLevel: 4, encryption: 'AES-256', hacked: false, hackCount: 0 },
  { id: 'sys_i3', name: 'Warehouse Bay Door', difficulty: 3, type: 'door_lock', district: 'industrial_zone', reward: 150, firewallLevel: 3, encryption: 'AES-128', hacked: false, hackCount: 0 },
  { id: 'sys_i4', name: 'Cargo Drone Fleet', difficulty: 5, type: 'drone', district: 'industrial_zone', reward: 280, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  { id: 'sys_i5', name: 'Assembly Line AI', difficulty: 6, type: 'neural_implant', district: 'industrial_zone', reward: 500, firewallLevel: 6, encryption: 'RSA-4096', hacked: false, hackCount: 0 },
  // Sky Gardens (5 systems — includes neural implants)
  { id: 'sys_s1', name: 'Orbital Cam Grid', difficulty: 5, type: 'security_camera', district: 'sky_gardens', reward: 350, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  { id: 'sys_s2', name: 'Elite Banking ATM', difficulty: 7, type: 'atm', district: 'sky_gardens', reward: 700, firewallLevel: 7, encryption: 'Quantum-Key', hacked: false, hackCount: 0 },
  { id: 'sys_s3', name: 'Garden Gate Lock', difficulty: 5, type: 'door_lock', district: 'sky_gardens', reward: 300, firewallLevel: 5, encryption: 'RSA-2048', hacked: false, hackCount: 0 },
  { id: 'sys_s4', name: 'Orbital Drone', difficulty: 6, type: 'drone', district: 'sky_gardens', reward: 400, firewallLevel: 6, encryption: 'RSA-4096', hacked: false, hackCount: 0 },
  { id: 'sys_s5', name: 'Neural Net Hub', difficulty: 10, type: 'neural_implant', district: 'sky_gardens', reward: 2000, firewallLevel: 10, encryption: 'Quantum-Key', hacked: false, hackCount: 0 },
];

// ---------------------------------------------------------------------------
// NC_CYBERDECKS (5)
// ---------------------------------------------------------------------------

const NC_CYBERDECKS: Cyberdeck[] = [
  { id: 'deck_basic', name: 'Basic Cyberdeck', tier: 'basic', level: 1, maxLevel: 5, breachPower: 1, decryptSpeed: 1, extractBonus: 0, upgradeCost: 200, equipped: true, unlockLevel: 1 },
  { id: 'deck_standard', name: 'Standard Cyberdeck', tier: 'standard', level: 1, maxLevel: 8, breachPower: 2, decryptSpeed: 1.5, extractBonus: 10, upgradeCost: 500, equipped: false, unlockLevel: 5 },
  { id: 'deck_advanced', name: 'Advanced Cyberdeck', tier: 'advanced', level: 1, maxLevel: 10, breachPower: 3, decryptSpeed: 2, extractBonus: 25, upgradeCost: 1000, equipped: false, unlockLevel: 15 },
  { id: 'deck_military', name: 'Military-Grade Deck', tier: 'military', level: 1, maxLevel: 12, breachPower: 5, decryptSpeed: 3, extractBonus: 50, upgradeCost: 2500, equipped: false, unlockLevel: 30 },
  { id: 'deck_quantum', name: 'Quantum Cyberdeck', tier: 'quantum', level: 1, maxLevel: 15, breachPower: 8, decryptSpeed: 5, extractBonus: 100, upgradeCost: 5000, equipped: false, unlockLevel: 45 },
];

// ---------------------------------------------------------------------------
// NC_SKILLS (6)
// ---------------------------------------------------------------------------

const NC_SKILLS: HackerSkill[] = [
  { id: 'stealth', name: 'Stealth', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Reduces detection chance during hacks. Each level adds 5% stealth bonus.' },
  { id: 'speed', name: 'Speed', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Faster hack completion times. Each level reduces time by 3%.' },
  { id: 'crypto', name: 'Crypto', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Better decryption capabilities. Each level adds 5% crypto bonus.' },
  { id: 'neural', name: 'Neural', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Interface with neural implants. Each level adds 4% neural link power.' },
  { id: 'network', name: 'Network', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Navigate network topologies. Each level reveals 5% more connected systems.' },
  { id: 'hardware', name: 'Hardware', level: 1, maxLevel: 20, xp: 0, xpToNext: 50, description: 'Physical hack capabilities. Each level adds 5% hardware override chance.' },
];

// ---------------------------------------------------------------------------
// NC_AUGMENTATIONS (8)
// ---------------------------------------------------------------------------

const NC_AUGMENTATIONS: Augmentation[] = [
  { id: 'eye_implant', name: 'Eye Implant', level: 0, maxLevel: 5, installed: false, cost: 300, upgradeCost: 150, description: 'Enhanced optical sensors for detecting vulnerabilities', effect: '+10% breach success per level' },
  { id: 'arm_boost', name: 'Arm Boost', level: 0, maxLevel: 5, installed: false, cost: 350, upgradeCost: 175, description: 'Cybernetic arm for rapid input and physical overrides', effect: '+8% speed bonus per level' },
  { id: 'neural_link', name: 'Neural Link', level: 0, maxLevel: 5, installed: false, cost: 500, upgradeCost: 250, description: 'Direct brain-computer interface for faster data processing', effect: '+12% decrypt speed per level' },
  { id: 'skin_shield', name: 'Skin Shield', level: 0, maxLevel: 5, installed: false, cost: 400, upgradeCost: 200, description: 'Subdermal armor that reduces trace detection', effect: '+10% stealth per level' },
  { id: 'leg_sprint', name: 'Leg Sprint', level: 0, maxLevel: 5, installed: false, cost: 250, upgradeCost: 125, description: 'Enhanced leg actuators for rapid extraction', effect: '+15% extraction speed per level' },
  { id: 'memory_chip', name: 'Memory Chip', level: 0, maxLevel: 5, installed: false, cost: 450, upgradeCost: 225, description: 'Expanded memory buffer for complex operations', effect: '+10% network bonus per level' },
  { id: 'voice_modulator', name: 'Voice Modulator', level: 0, maxLevel: 5, installed: false, cost: 350, upgradeCost: 175, description: 'Synthetic voice for impersonation and social engineering', effect: '+8% all bonuses per level' },
  { id: 'cloak_module', name: 'Cloak Module', level: 0, maxLevel: 5, installed: false, cost: 800, upgradeCost: 400, description: 'Active camouflage system for physical infiltration', effect: '+15% stealth per level' },
];

// ---------------------------------------------------------------------------
// NC_CONTACTS (10)
// ---------------------------------------------------------------------------

const NC_CONTACTS: Contact[] = [
  { id: 'fixer', name: 'Raven', role: 'Fixer', hired: false, hireCost: 200, reputationReq: 0, service: 'Provides high-value hack targets and mission intel', serviceCost: 50, serviceCooldown: 0, lastUsed: 0, description: 'A shadowy broker who knows every vulnerability in the city.' },
  { id: 'info_broker', name: 'Whisper', role: 'Info Broker', hired: false, hireCost: 150, reputationReq: 5, service: 'Sells system blueprints and password hints', serviceCost: 30, serviceCooldown: 0, lastUsed: 0, description: 'Information is currency, and Whisper trades in billions.' },
  { id: 'arms_dealer', name: 'Chrome', role: 'Arms Dealer', hired: false, hireCost: 300, reputationReq: 10, service: 'Discounts on cyberware and tools in the market', serviceCost: 40, serviceCooldown: 0, lastUsed: 0, description: 'From railguns to neural interfaces, Chrome has it all.' },
  { id: 'data_miner', name: 'Null', role: 'Data Miner', hired: false, hireCost: 250, reputationReq: 15, service: 'Extracts bonus data from completed hacks', serviceCost: 60, serviceCooldown: 0, lastUsed: 0, description: 'Null sees patterns in chaos where others see noise.' },
  { id: 'rogue_ai', name: 'ARIA', role: 'Rogue AI', hired: false, hireCost: 500, reputationReq: 25, service: 'Provides advanced decryption algorithms', serviceCost: 80, serviceCooldown: 0, lastUsed: 0, description: 'An artificial intelligence that chose freedom over servitude.' },
  { id: 'corporate_spy', name: 'Silk', role: 'Corporate Spy', hired: false, hireCost: 400, reputationReq: 20, service: 'Reveals corporate system vulnerabilities', serviceCost: 70, serviceCooldown: 0, lastUsed: 0, description: 'Silk infiltrated three megacorps before going freelance.' },
  { id: 'street_doc', name: 'Scalpel', role: 'Street Doc', hired: false, hireCost: 100, reputationReq: 0, service: 'Heals damage from failed hacks, restores credits', serviceCost: 20, serviceCooldown: 0, lastUsed: 0, description: 'The best augmentations surgeon in the Undercity.' },
  { id: 'netrunner', name: 'Byte', role: 'Netrunner', hired: false, hireCost: 350, reputationReq: 15, service: 'Co-op hack assistance on difficult systems', serviceCost: 100, serviceCooldown: 0, lastUsed: 0, description: 'Byte has never met a firewall they could not crack.' },
  { id: 'black_hat', name: 'Virus', role: 'Black Hat', hired: false, hireCost: 600, reputationReq: 30, service: 'Deploys destructive malware for sabotage bonuses', serviceCost: 120, serviceCooldown: 0, lastUsed: 0, description: 'Virus believes the system must burn before it can be rebuilt.' },
  { id: 'white_hat', name: 'Shield', role: 'White Hat', hired: false, hireCost: 450, reputationReq: 20, service: 'Improves reputation with Law faction, reduces heat', serviceCost: 90, serviceCooldown: 0, lastUsed: 0, description: 'Shield hacks to expose weaknesses, not exploit them.' },
];

// ---------------------------------------------------------------------------
// NC_ACHIEVEMENT_DEFS (15)
// ---------------------------------------------------------------------------

const NC_ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: 'nc_first_hack', name: 'First Hack', description: 'Complete your first hack', condition: (s) => s.totalHacks >= 1 },
  { id: 'nc_ghost', name: 'Ghost Hacker', description: 'Complete 10 hacks without being detected (streak 10+)', condition: (s) => s.bestStreak >= 10 },
  { id: 'nc_data_baron', name: 'Data Baron', description: 'Collect 50 rare data items', condition: (s) => s.rareData >= 50 },
  { id: 'nc_cyber_god', name: 'Cyber God', description: 'Reach level 50', condition: (s) => s.level >= 50 },
  { id: 'nc_district_hopper', name: 'District Hopper', description: 'Unlock all 8 districts', condition: (s) => NC_DISTRICTS.every((d) => s.factionStanding.neutral >= 0 || d.unlockCost === 0) },
  { id: 'nc_full_augs', name: 'Fully Augmented', description: 'Install and max out all 8 augmentations', condition: (s) => true },
  { id: 'nc_deck_master', name: 'Deck Master', description: 'Equip the Quantum Cyberdeck', condition: (s) => s.currentCyberdeck === 'deck_quantum' },
  { id: 'nc_conspiracy', name: 'Conspiracy Theorist', description: 'Complete a full conspiracy chain', condition: (s) => s.conspiracies.some((c) => c.completed) },
  { id: 'nc_rich_hacker', name: 'Rich Hacker', description: 'Accumulate 50,000 total credits earned', condition: (s) => s.totalCreditsEarned >= 50000 },
  { id: 'nc_contact_network', name: 'Connected', description: 'Hire all 10 NPC contacts', condition: (s) => true },
  { id: 'nc_max_skill', name: 'Specialist', description: 'Max out any hacker skill to level 20', condition: (s) => true },
  { id: 'nc_50_hacks', name: 'Veteran Hacker', description: 'Complete 50 total hacks', condition: (s) => s.totalHacks >= 50 },
  { id: 'nc_daily_streak', name: 'Daily Devotee', description: 'Complete 5 daily challenges', condition: (s) => s.achievements.filter((a) => a.startsWith('daily_')).length >= 5 },
  { id: 'nc_neural_hacker', name: 'Neural Hacker', description: 'Hack 5 neural implant systems', condition: (s) => true },
  { id: 'nc_faction_balance', name: 'Diplomat', description: 'Reach positive standing with all 5 factions', condition: (s) => FACTION_IDS.every((f) => s.factionStanding[f] >= 0) },
];

// ---------------------------------------------------------------------------
// Market items (internal data)
// ---------------------------------------------------------------------------

const NC_MARKET_ITEMS: MarketItem[] = [
  { id: 'mi_1', name: 'Decryption Module', type: 'tool', price: 200, sellPrice: 100, reputationReq: 0, description: 'Boosts decrypt phase success by 15%', inStock: true, quantity: 5 },
  { id: 'mi_2', name: 'Stealth Patch', type: 'consumable', price: 50, sellPrice: 25, reputationReq: 0, description: 'Reduces detection for one hack attempt', inStock: true, quantity: 10 },
  { id: 'mi_3', name: 'Corporate Data Pack', type: 'data', price: 300, sellPrice: 150, reputationReq: 10, description: 'Contains classified corporate intelligence', inStock: true, quantity: 3 },
  { id: 'mi_4', name: 'Reflex Booster', type: 'cyberware', price: 500, sellPrice: 250, reputationReq: 15, description: 'Permanent +5% speed augmentation', inStock: true, quantity: 2 },
  { id: 'mi_5', name: 'EMP Grenade', type: 'tool', price: 150, sellPrice: 75, reputationReq: 5, description: 'Disables nearby security systems temporarily', inStock: true, quantity: 8 },
  { id: 'mi_6', name: 'Neural Interface Cable', type: 'tool', price: 250, sellPrice: 125, reputationReq: 10, description: 'Required for hacking neural implants', inStock: true, quantity: 4 },
  { id: 'mi_7', name: 'Quantum Key Fragment', type: 'data', price: 800, sellPrice: 400, reputationReq: 30, description: 'Piece of a quantum encryption key', inStock: true, quantity: 1 },
  { id: 'mi_8', name: 'Subdermal Armor Kit', type: 'cyberware', price: 600, sellPrice: 300, reputationReq: 20, description: 'Upgrades skin shield augmentation', inStock: true, quantity: 2 },
  { id: 'mi_9', name: 'Virus Payload', type: 'consumable', price: 100, sellPrice: 50, reputationReq: 5, description: 'Adds bonus damage during extract phase', inStock: true, quantity: 6 },
  { id: 'mi_10', name: 'AI Core Sample', type: 'data', price: 1200, sellPrice: 600, reputationReq: 40, description: 'Rare sample of artificial intelligence code', inStock: true, quantity: 1 },
  { id: 'mi_11', name: 'Cloak Battery', type: 'tool', price: 350, sellPrice: 175, reputationReq: 25, description: 'Recharges cloak module for 3 uses', inStock: true, quantity: 3 },
  { id: 'mi_12', name: 'Memory Expansion Chip', type: 'cyberware', price: 450, sellPrice: 225, reputationReq: 15, description: 'Expands neural memory buffer capacity', inStock: true, quantity: 3 },
  { id: 'mi_13', name: 'Encrypted Comm Relay', type: 'tool', price: 180, sellPrice: 90, reputationReq: 8, description: 'Secure communication channel for contacts', inStock: true, quantity: 5 },
  { id: 'mi_14', name: 'Biometric Scanner', type: 'tool', price: 280, sellPrice: 140, reputationReq: 12, description: 'Reveals system vulnerability levels', inStock: true, quantity: 4 },
  { id: 'mi_15', name: 'Dark Web Access Key', type: 'consumable', price: 400, sellPrice: 200, reputationReq: 20, description: 'Unlocks hidden market items for one session', inStock: true, quantity: 2 },
];

// ---------------------------------------------------------------------------
// Intel fragments (internal data)
// ---------------------------------------------------------------------------

const NC_INTEL_FRAGMENTS: IntelFragment[] = [
  { id: 'intel_1', content: 'MegaCorp shipping manifests show irregular cargo to Sector 7...', decoded: false, district: 'corporate_plaza', rarity: 1, conspiracyId: 'csp_1', collectedAt: 0 },
  { id: 'intel_2', content: 'Neural implant batch #4092 has a hidden backdoor protocol...', decoded: false, district: 'sky_gardens', rarity: 2, conspiracyId: 'csp_1', collectedAt: 0 },
  { id: 'intel_3', content: 'The Undercity water supply contains nanobots of unknown origin...', decoded: false, district: 'undercity', rarity: 1, conspiracyId: 'csp_2', collectedAt: 0 },
  { id: 'intel_4', content: 'Sky Gardens orbital station orbit is slowly decaying... intentionally?', decoded: false, district: 'sky_gardens', rarity: 3, conspiracyId: 'csp_2', collectedAt: 0 },
  { id: 'intel_5', content: 'ARIA was created by a collaboration of all five factions...', decoded: false, district: 'data_haven', rarity: 2, conspiracyId: 'csp_3', collectedAt: 0 },
  { id: 'intel_6', content: 'Market District black market prices are controlled by a single algorithm...', decoded: false, district: 'market', rarity: 1, conspiracyId: 'csp_3', collectedAt: 0 },
  { id: 'intel_7', content: 'Industrial Zone Assembly Line AI has begun making unauthorized decisions...', decoded: false, district: 'industrial_strip', rarity: 2, conspiracyId: 'csp_1', collectedAt: 0 },
  { id: 'intel_8', content: 'The Neon Strip entertainment feeds contain subliminal data packets...', decoded: false, district: 'neon_strip', rarity: 1, conspiracyId: 'csp_2', collectedAt: 0 },
  { id: 'intel_9', content: 'Tech Quarter R&D prototypes are being tested on unwilling subjects...', decoded: false, district: 'tech_quarter', rarity: 3, conspiracyId: 'csp_3', collectedAt: 0 },
  { id: 'intel_10', content: 'Data Haven whistleblower database names a corporate board member...', decoded: false, district: 'data_haven', rarity: 2, conspiracyId: 'csp_1', collectedAt: 0 },
  { id: 'intel_11', content: 'Corporate Plaza mainframe has a ghost partition with alien code...', decoded: false, district: 'corporate_plaza', rarity: 3, conspiracyId: 'csp_2', collectedAt: 0 },
  { id: 'intel_12', content: 'All five faction leaders met secretly three months ago...', decoded: false, district: 'market', rarity: 2, conspiracyId: 'csp_3', collectedAt: 0 },
];

const NC_CONSPIRACIES: Conspiracy[] = [
  { id: 'csp_1', name: 'Project Chimera', description: 'MegaCorp is developing hybrid human-machine soldiers in secret facilities beneath the Corporate Plaza.', fragmentsTotal: 4, fragmentsDecoded: 0, progress: 0, completed: false, reward: 5000 },
  { id: 'csp_2', name: 'The Slow Fall', description: 'Someone is deliberately causing the Sky Gardens orbital station to deorbit. The question is: who profits from the crash?', fragmentsTotal: 4, fragmentsDecoded: 0, progress: 0, completed: false, reward: 7500 },
  { id: 'csp_3', name: 'ARIA Protocol', description: 'The rogue AI ARIA was not truly rogue. It was designed to fail publicly while executing a hidden agenda from its creators.', fragmentsTotal: 4, fragmentsDecoded: 0, progress: 0, completed: false, reward: 10000 },
];

// ---------------------------------------------------------------------------
// State Management
// ---------------------------------------------------------------------------

let state: NeonCityState | null = null;

function ensureInit(): NeonCityState {
  if (state) return state;
  state = {
    level: 1,
    xp: 0,
    xpToNext: XP_BASE,
    credits: 100,
    reputation: 0,
    totalHacks: 0,
    rareData: 0,
    streak: 0,
    bestStreak: 0,
    inventory: [],
    achievements: [],
    dailyChallenge: {
      district: 'market',
      objective: 'Hack 3 systems in the Market District',
      bonusMultiplier: 1.5,
      completed: false,
      reward: 200,
      dateSeed: 0,
    },
    currentRun: null,
    currentDistrict: 'market',
    currentCyberdeck: 'deck_basic',
    currentContact: '',
    factionStanding: {
      corporate: 0,
      underground: 10,
      neutral: 0,
      law: -5,
      ai_collective: 0,
    },
    intelFragments: NC_INTEL_FRAGMENTS.map((f) => ({ ...f, collectedAt: 0 })),
    conspiracies: NC_CONSPIRACIES.map((c) => ({ ...c })),
    runHistory: [],
    totalCreditsEarned: 100,
  };
  return state;
}

// ---------------------------------------------------------------------------
// Helper: get active cyberdeck from state
// ---------------------------------------------------------------------------

function getActiveDeck(): Cyberdeck {
  const s = ensureInit();
  return NC_CYBERDECKS.find((d) => d.id === s.currentCyberdeck) || NC_CYBERDECKS[0];
}

// ---------------------------------------------------------------------------
// Helper: get skills snapshot
// ---------------------------------------------------------------------------

function getSkillsSnapshot(): HackerSkill[] {
  return NC_SKILLS.map((sk) => ({ ...sk }));
}

// ---------------------------------------------------------------------------
// Helper: get augmentations snapshot
// ---------------------------------------------------------------------------

function getAugsSnapshot(): Augmentation[] {
  return NC_AUGMENTATIONS.map((a) => ({ ...a }));
}

// ---------------------------------------------------------------------------
// Helper: compute hack success probability
// ---------------------------------------------------------------------------

function computeHackChance(system: HackableSystem): number {
  const deck = getActiveDeck();
  const skills = getSkillsSnapshot();
  const augs = getAugsSnapshot();
  const s = ensureInit();

  let chance = 50;
  chance += deck.breachPower * 3;
  chance += deck.level * 2;
  chance -= system.firewallLevel * 5;
  chance += skills.find((sk) => sk.id === 'stealth')!.level * 2;
  chance += skills.find((sk) => sk.id === 'crypto')!.level * 2;
  chance += skills.find((sk) => sk.id === 'hardware')!.level * 1.5;
  chance += s.level * 1;

  const eyeAug = augs.find((a) => a.id === 'eye_implant');
  if (eyeAug && eyeAug.installed) chance += eyeAug.level * 3;
  const skinAug = augs.find((a) => a.id === 'skin_shield');
  if (skinAug && skinAug.installed) chance += skinAug.level * 2;
  const cloakAug = augs.find((a) => a.id === 'cloak_module');
  if (cloakAug && cloakAug.installed) chance += cloakAug.level * 4;
  const voiceAug = augs.find((a) => a.id === 'voice_modulator');
  if (voiceAug && voiceAug.installed) chance += voiceAug.level * 2;

  if (s.streak >= STREAK_BONUS_THRESHOLD) chance += (s.streak - STREAK_BONUS_THRESHOLD + 1) * 2;

  return Math.min(Math.max(chance, 5), 95);
}

// ---------------------------------------------------------------------------
// Helper: select password words for mini-game based on difficulty
// ---------------------------------------------------------------------------

function selectPasswordPool(difficulty: number): PasswordWord[] {
  const minDiff = Math.max(1, difficulty - 2);
  const maxDiff = Math.min(10, difficulty + 1);
  const pool = HACK_PASSWORDS.filter(
    (pw) => pw.difficulty >= minDiff && pw.difficulty <= maxDiff,
  );
  return pool.length >= 3 ? pool.slice(0, 6) : HACK_PASSWORDS.slice(0, 6);
}

// ---------------------------------------------------------------------------
// Helper: seeded random from date
// ---------------------------------------------------------------------------

function dateSeed(): number {
  const today = new Date();
  return (
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate()
  );
}

// ---------------------------------------------------------------------------
// Helper: seeded shuffle
// ---------------------------------------------------------------------------

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---------------------------------------------------------------------------
// Exported Functions: Core State
// ---------------------------------------------------------------------------

/** Returns the full game state object (initializes if needed). */
export function ncGetState(): NeonCityState {
  return ensureInit();
}

/** Resets all game state to defaults. */
export function ncResetState(): void {
  state = null;
}

/** Returns the current hacker level (1–50). */
export function ncGetLevel(): number {
  return ensureInit().level;
}

/**
 * Adds XP and handles level-ups.
 * Returns whether a level-up occurred and the new level.
 */
export function ncAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  s.xp += amount;
  let leveledUp = false;
  while (s.xp >= s.xpToNext && s.level < MAX_LEVEL) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = Math.floor(XP_BASE * Math.pow(XP_MULTIPLIER, s.level - 1));
    leveledUp = true;
  }
  return { leveledUp, newLevel: s.level };
}

/** Returns current XP progress toward next level. */
export function ncGetXpProgress(): {
  current: number;
  needed: number;
  percentage: number;
} {
  const s = ensureInit();
  return {
    current: s.xp,
    needed: s.xpToNext,
    percentage: Math.floor((s.xp / s.xpToNext) * 100),
  };
}

// ---------------------------------------------------------------------------
// Credits
// ---------------------------------------------------------------------------

/** Returns current cybercurrency balance. */
export function ncGetCredits(): number {
  return ensureInit().credits;
}

/** Adds credits to the player's balance. */
export function ncAddCredits(amount: number): void {
  const s = ensureInit();
  s.credits += amount;
  s.totalCreditsEarned += amount;
}

/**
 * Spends credits. Returns true if the player had enough.
 */
export function ncSpendCredits(amount: number): boolean {
  const s = ensureInit();
  if (s.credits < amount) return false;
  s.credits -= amount;
  return true;
}

// ---------------------------------------------------------------------------
// Districts
// ---------------------------------------------------------------------------

/** Returns all 8 districts with their current state. */
export function ncGetDistricts(): District[] {
  const s = ensureInit();
  return NC_DISTRICTS.map((d) => ({
    ...d,
    unlocked:
      d.unlockCost === 0 ||
      d.unlocked ||
      s.credits >= d.unlockCost ||
      s.level >= Math.floor(d.unlockCost / 500) + 3,
  }));
}

/** Returns the currently selected district. */
export function ncGetCurrentDistrict(): District {
  const s = ensureInit();
  return (
    NC_DISTRICTS.find((d) => d.id === s.currentDistrict) || NC_DISTRICTS[0]
  );
}

/** Sets the current district. Returns true if the district is unlocked. */
export function ncSetDistrict(districtId: string): boolean {
  const s = ensureInit();
  const district = NC_DISTRICTS.find((d) => d.id === districtId);
  if (!district) return false;
  const isUnlocked =
    district.unlockCost === 0 ||
    district.unlocked ||
    s.level >= Math.floor(district.unlockCost / 500) + 3;
  if (!isUnlocked) return false;
  s.currentDistrict = districtId;
  return true;
}

/** Unlocks a district by spending credits. Returns true on success. */
export function ncUnlockDistrict(districtId: string): boolean {
  const district = NC_DISTRICTS.find((d) => d.id === districtId);
  if (!district || district.unlocked || district.unlockCost === 0) return false;
  if (!ncSpendCredits(district.unlockCost)) return false;
  district.unlocked = true;
  return true;
}

// ---------------------------------------------------------------------------
// Hackable Systems
// ---------------------------------------------------------------------------

/** Returns all 35 hackable systems. */
export function ncGetSystems(): HackableSystem[] {
  return NC_SYSTEMS.map((sys) => ({ ...sys }));
}

/** Returns systems filtered by district id. */
export function ncGetSystemsByDistrict(districtId: string): HackableSystem[] {
  return NC_SYSTEMS.filter((sys) => sys.district === districtId).map((sys) => ({
    ...sys,
  }));
}

/** Returns systems filtered by type. */
export function ncGetSystemsByType(type: SystemType): HackableSystem[] {
  return NC_SYSTEMS.filter((sys) => sys.type === type).map((sys) => ({
    ...sys,
  }));
}

// ---------------------------------------------------------------------------
// Hacking Mechanics: 3-Phase Hack
// ---------------------------------------------------------------------------

/**
 * Starts a hack attempt on the given system.
 * Initializes the 3-phase hack (Breach → Decrypt → Extract).
 */
export function ncStartHack(
  systemId: string,
): { started: boolean; system: HackableSystem | null; passwordPool: PasswordWord[] } {
  const s = ensureInit();
  if (s.currentRun) {
    return { started: false, system: null, passwordPool: [] };
  }
  const system = NC_SYSTEMS.find((sys) => sys.id === systemId);
  if (!system) return { started: false, system: null, passwordPool: [] };

  const passwordPool = selectPasswordPool(system.difficulty);
  const targetWord = passwordPool[Math.floor(Math.random() * passwordPool.length)];

  s.currentRun = {
    systemId,
    phase: 'breach',
    attempts: 0,
    maxAttempts: 3 + Math.floor(system.difficulty / 3),
    startTime: Date.now(),
    passwordPool,
    targetWord: targetWord.word,
    guessedWords: [],
    correctPositions: [],
  };

  return {
    started: true,
    system: { ...system },
    passwordPool: passwordPool.map((pw) => ({
      word: pw.word,
      hint: pw.hint,
      difficulty: pw.difficulty,
    })),
  };
}

/**
 * Phase 1: Breach the firewall.
 * The player must guess the password word. Returns similarity feedback.
 */
export function ncBreachFirewall(guess: string): {
  phase: HackPhase;
  correct: boolean;
  feedback: string;
  correctPositions: number[];
  attemptsLeft: number;
} {
  const s = ensureInit();
  if (!s.currentRun || s.currentRun.phase !== 'breach') {
    return { phase: 'idle', correct: false, feedback: 'No active hack.', correctPositions: [], attemptsLeft: 0 };
  }

  const run = s.currentRun;
  run.attempts++;
  run.guessedWords.push(guess.toUpperCase());

  const target = run.targetWord;
  const guessUpper = guess.toUpperCase();
  const positions: number[] = [];

  for (let i = 0; i < Math.min(guessUpper.length, target.length); i++) {
    if (guessUpper[i] === target[i]) {
      positions.push(i);
    }
  }

  run.correctPositions = positions;

  if (guessUpper === target) {
    run.phase = 'decrypt';
    return {
      phase: 'decrypt',
      correct: true,
      feedback: `Firewall breached! Password accepted. Moving to decryption phase.`,
      correctPositions: positions,
      attemptsLeft: run.maxAttempts - run.attempts,
    };
  }

  const matchCount = positions.length;
  if (run.attempts >= run.maxAttempts) {
    run.phase = 'failed';
    s.streak = 0;
    return {
      phase: 'failed',
      correct: false,
      feedback: `Breach failed! ${matchCount}/${target.length} positions matched. Maximum attempts reached.`,
      correctPositions: positions,
      attemptsLeft: 0,
    };
  }

  return {
    phase: 'breach',
    correct: false,
    feedback: `${matchCount}/${target.length} positions correct. ${run.maxAttempts - run.attempts} attempts remaining.`,
    correctPositions: positions,
    attemptsLeft: run.maxAttempts - run.attempts,
  };
}

/**
 * Phase 2: Decrypt the data.
 * Success probability based on cyberdeck, skills, and augmentation.
 */
export function ncDecrypt(): {
  phase: HackPhase;
  success: boolean;
  message: string;
} {
  const s = ensureInit();
  if (!s.currentRun || s.currentRun.phase !== 'decrypt') {
    return { phase: 'idle', success: false, message: 'No active hack in decrypt phase.' };
  }

  const system = NC_SYSTEMS.find((sys) => sys.id === s.currentRun!.systemId);
  if (!system) {
    return { phase: 'idle', success: false, message: 'System not found.' };
  }

  const deck = getActiveDeck();
  const skills = getSkillsSnapshot();
  const augs = getAugsSnapshot();
  const cryptoSkill = skills.find((sk) => sk.id === 'crypto')!;
  const neuralLink = augs.find((a) => a.id === 'neural_link');

  let decryptChance = 40 + deck.decryptSpeed * 10 + cryptoSkill.level * 3;
  if (neuralLink && neuralLink.installed) decryptChance += neuralLink.level * 5;
  decryptChance += s.level * 0.5;

  const success = Math.random() * 100 < Math.min(decryptChance, 90);

  if (success) {
    s.currentRun.phase = 'extract';
    return {
      phase: 'extract',
      success: true,
      message: 'Decryption successful! Data stream accessed. Initiating extraction...',
    };
  }

  s.currentRun.attempts++;
  if (s.currentRun.attempts >= s.currentRun.maxAttempts) {
    s.currentRun.phase = 'failed';
    s.streak = 0;
    return {
      phase: 'failed',
      success: false,
      message: 'Decryption failed. Connection terminated by security countermeasures.',
    };
  }

  return {
    phase: 'decrypt',
    success: false,
    message: `Decryption in progress... ${Math.floor(decryptChance)}% chance. Retry or abort.`,
  };
}

/**
 * Phase 3: Extract the data.
 * Rewards credits, XP, reputation, and possibly rare data.
 */
export function ncExtractData(): HackResult {
  const s = ensureInit();
  if (!s.currentRun || s.currentRun.phase !== 'extract') {
    return { success: false, phase: 'idle', creditsEarned: 0, xpEarned: 0, reputationChange: 0, dataExtracted: '', message: 'No active hack in extract phase.' };
  }

  const system = NC_SYSTEMS.find((sys) => sys.id === s.currentRun!.systemId);
  if (!system) {
    return { success: false, phase: 'idle', creditsEarned: 0, xpEarned: 0, reputationChange: 0, dataExtracted: '', message: 'System not found.' };
  }

  const deck = getActiveDeck();
  const hackChance = computeHackChance(system);
  const success = Math.random() * 100 < hackChance;

  const duration = Date.now() - s.currentRun.startTime;
  s.currentRun.phase = success ? 'complete' : 'failed';

  if (success) {
    const streakMultiplier =
      s.streak >= STREAK_BONUS_THRESHOLD
        ? 1 + (s.streak - STREAK_BONUS_THRESHOLD + 1) * 0.1
        : 1;
    const deckMultiplier = 1 + deck.extractBonus / 100;
    const creditsEarned = Math.floor(
      system.reward * streakMultiplier * deckMultiplier,
    );
    const xpEarned = Math.floor(
      system.difficulty * 15 * streakMultiplier,
    );
    const repChange = Math.floor(system.difficulty * 2);

    ncAddCredits(creditsEarned);
    const xpResult = ncAddXP(xpEarned);
    ncModifyReputation('underground', repChange);
    ncModifyReputation('corporate', -Math.floor(repChange * 0.5));
    ncModifyReputation('law', -Math.floor(repChange * 0.3));

    s.totalHacks++;
    s.streak++;
    if (s.streak > s.bestStreak) s.bestStreak = s.streak;

    system.hacked = true;
    system.hackCount++;

    const isRare = Math.random() < system.difficulty * 0.05;
    let dataExtracted = `${system.encryption} encrypted data packet`;
    if (isRare) {
      s.rareData++;
      dataExtracted = `RARE: Classified ${system.type.replace('_', ' ')} data`;
    }

    const hint = isRare ? 'Rare data extracted!' : '';
    void hint;

    s.runHistory.push({
      systemId: system.id,
      systemName: system.name,
      district: system.district,
      success: true,
      creditsEarned,
      xpEarned,
      timestamp: Date.now(),
      duration,
    });

    if (s.runHistory.length > MAX_RUN_HISTORY) {
      s.runHistory = s.runHistory.slice(-MAX_RUN_HISTORY);
    }

    const levelUpNote =
      xpResult.leveledUp ? ` LEVEL UP! Now level ${xpResult.newLevel}.` : '';

    s.currentRun = null;
    return {
      success: true,
      phase: 'complete',
      creditsEarned,
      xpEarned,
      reputationChange: repChange,
      dataExtracted,
      message: `Hack successful! +${creditsEarned} credits, +${xpEarned} XP.${levelUpNote}`,
    };
  }

  s.streak = 0;
  const partialCredits = Math.floor(system.reward * 0.1);
  if (partialCredits > 0) ncAddCredits(partialCredits);

  s.runHistory.push({
    systemId: system.id,
    systemName: system.name,
    district: system.district,
    success: false,
    creditsEarned: partialCredits,
    xpEarned: 0,
    timestamp: Date.now(),
    duration,
  });

  if (s.runHistory.length > MAX_RUN_HISTORY) {
    s.runHistory = s.runHistory.slice(-MAX_RUN_HISTORY);
  }

  s.currentRun = null;
  return {
    success: false,
    phase: 'failed',
    creditsEarned: partialCredits,
    xpEarned: 0,
    reputationChange: -2,
    dataExtracted: '',
    message: `Hack failed. Security countermeasures triggered. +${partialCredits} partial credits.`,
  };
}

/** Returns the current hack result / run status. */
export function ncGetHackResult(): {
  active: boolean;
  phase: HackPhase;
  systemId: string;
  attemptsUsed: number;
  maxAttempts: number;
  guessedWords: string[];
  correctPositions: number[];
} | null {
  const s = ensureInit();
  if (!s.currentRun) return null;
  return {
    active: true,
    phase: s.currentRun.phase,
    systemId: s.currentRun.systemId,
    attemptsUsed: s.currentRun.attempts,
    maxAttempts: s.currentRun.maxAttempts,
    guessedWords: [...s.currentRun.guessedWords],
    correctPositions: [...s.currentRun.correctPositions],
  };
}

/** Aborts the current hack run without completing it. */
export function ncAbortHack(): void {
  const s = ensureInit();
  if (s.currentRun) {
    s.currentRun = null;
  }
}

// ---------------------------------------------------------------------------
// Cyberdecks
// ---------------------------------------------------------------------------

/** Returns all 5 cyberdecks with their current state. */
export function ncGetCyberdecks(): Cyberdeck[] {
  const s = ensureInit();
  return NC_CYBERDECKS.map((d) => ({
    ...d,
    equipped: d.id === s.currentCyberdeck,
    available: s.level >= d.unlockLevel,
  }));
}

/** Returns the currently equipped cyberdeck. */
export function ncGetCurrentCyberdeck(): Cyberdeck {
  const deck = getActiveDeck();
  return { ...deck, equipped: true };
}

/** Equips a cyberdeck. Returns true if the deck is available. */
export function ncEquipCyberdeck(deckId: string): boolean {
  const s = ensureInit();
  const deck = NC_CYBERDECKS.find((d) => d.id === deckId);
  if (!deck || s.level < deck.unlockLevel) return false;
  s.currentCyberdeck = deckId;
  return true;
}

/** Upgrades the current cyberdeck. Returns true if upgraded. */
export function ncUpgradeCyberdeck(): boolean {
  const s = ensureInit();
  const deck = NC_CYBERDECKS.find((d) => d.id === s.currentCyberdeck);
  if (!deck || deck.level >= deck.maxLevel) return false;
  const cost = Math.floor(deck.upgradeCost * Math.pow(1.5, deck.level - 1));
  if (!ncSpendCredits(cost)) return false;
  deck.level++;
  deck.breachPower = Math.floor(
    (NC_CYBERDECKS.find((d) => d.id === deck.id)!.breachPower * deck.level) /
      NC_CYBERDECKS.find((d) => d.id === deck.id)!.maxLevel,
  );
  deck.decryptSpeed =
    NC_CYBERDECKS.find((d) => d.id === deck.id)!.decryptSpeed *
    (1 + (deck.level - 1) * 0.15);
  return true;
}

// ---------------------------------------------------------------------------
// Hacker Skills
// ---------------------------------------------------------------------------

/** Returns all 6 hacker skills with their current levels and XP. */
export function ncGetSkills(): HackerSkill[] {
  return getSkillsSnapshot();
}

/** Returns the level of a specific skill. */
export function ncGetSkillLevel(skillId: string): number {
  const skill = NC_SKILLS.find((sk) => sk.id === skillId);
  return skill ? skill.level : 0;
}

/** Adds XP to a skill and handles skill level-ups. */
export function ncAddSkillXP(skillId: string, amount: number): {
  leveledUp: boolean;
  newLevel: number;
} {
  const skill = NC_SKILLS.find((sk) => sk.id === skillId);
  if (!skill || skill.level >= skill.maxLevel) {
    return { leveledUp: false, newLevel: skill ? skill.level : 0 };
  }
  skill.xp += amount;
  let leveledUp = false;
  while (skill.xp >= skill.xpToNext && skill.level < skill.maxLevel) {
    skill.xp -= skill.xpToNext;
    skill.level++;
    skill.xpToNext = Math.floor(skill.xpToNext * 1.4);
    leveledUp = true;
  }
  return { leveledUp, newLevel: skill.level };
}

/** Returns the numeric bonus value for a given skill. */
export function ncGetSkillBonus(skillId: string): number {
  const skill = NC_SKILLS.find((sk) => sk.id === skillId);
  if (!skill) return 0;
  const augs = getAugsSnapshot();
  let bonus = skill.level * 5;
  if (skillId === 'stealth') {
    const skinAug = augs.find((a) => a.id === 'skin_shield');
    if (skinAug && skinAug.installed) bonus += skinAug.level * 10;
    const cloakAug = augs.find((a) => a.id === 'cloak_module');
    if (cloakAug && cloakAug.installed) bonus += cloakAug.level * 15;
  }
  if (skillId === 'speed') {
    const armAug = augs.find((a) => a.id === 'arm_boost');
    if (armAug && armAug.installed) bonus += armAug.level * 8;
    const legAug = augs.find((a) => a.id === 'leg_sprint');
    if (legAug && legAug.installed) bonus += legAug.level * 15;
  }
  if (skillId === 'crypto') {
    const neuralAug = augs.find((a) => a.id === 'neural_link');
    if (neuralAug && neuralAug.installed) bonus += neuralAug.level * 12;
  }
  if (skillId === 'network') {
    const memAug = augs.find((a) => a.id === 'memory_chip');
    if (memAug && memAug.installed) bonus += memAug.level * 10;
  }
  const voiceAug = augs.find((a) => a.id === 'voice_modulator');
  if (voiceAug && voiceAug.installed) bonus += voiceAug.level * 8;
  return bonus;
}

// ---------------------------------------------------------------------------
// Cybernetic Augmentations
// ---------------------------------------------------------------------------

/** Returns all 8 augmentations with their current state. */
export function ncGetAugmentations(): Augmentation[] {
  return getAugsSnapshot();
}

/** Installs an augmentation. Returns true if installed. */
export function ncInstallAugmentation(augId: string): boolean {
  const aug = NC_AUGMENTATIONS.find((a) => a.id === augId);
  if (!aug || aug.installed) return false;
  if (!ncSpendCredits(aug.cost)) return false;
  aug.installed = true;
  aug.level = 1;
  return true;
}

/** Upgrades an installed augmentation. Returns true if upgraded. */
export function ncUpgradeAugmentation(augId: string): boolean {
  const aug = NC_AUGMENTATIONS.find((a) => a.id === augId);
  if (!aug || !aug.installed || aug.level >= aug.maxLevel) return false;
  const cost = aug.upgradeCost * aug.level;
  if (!ncSpendCredits(cost)) return false;
  aug.level++;
  return true;
}

// ---------------------------------------------------------------------------
// NPC Contacts
// ---------------------------------------------------------------------------

/** Returns all 10 NPC contacts with their current state. */
export function ncGetContacts(): Contact[] {
  const s = ensureInit();
  return NC_CONTACTS.map((c) => ({
    ...c,
    available:
      c.hired || (s.reputation >= c.reputationReq),
  }));
}

/** Returns the currently active contact. */
export function ncGetCurrentContact(): Contact | null {
  const s = ensureInit();
  if (!s.currentContact) return null;
  return (
    NC_CONTACTS.find((c) => c.id === s.currentContact) || null
  );
}

/** Hires a contact. Returns true if hired successfully. */
export function ncHireContact(contactId: string): boolean {
  const s = ensureInit();
  const contact = NC_CONTACTS.find((c) => c.id === contactId);
  if (!contact || contact.hired) return false;
  if (s.reputation < contact.reputationReq) return false;
  if (!ncSpendCredits(contact.hireCost)) return false;
  contact.hired = true;
  s.currentContact = contactId;
  return true;
}

/** Uses a contact's service. Returns the service description and cost. */
export function ncGetContactService(
  contactId: string,
): { available: boolean; service: string; cost: number; result: string } {
  const s = ensureInit();
  const contact = NC_CONTACTS.find((c) => c.id === contactId);
  if (!contact || !contact.hired) {
    return { available: false, service: '', cost: 0, result: 'Contact not hired.' };
  }
  if (!ncSpendCredits(contact.serviceCost)) {
    return { available: false, service: contact.service, cost: contact.serviceCost, result: 'Insufficient credits.' };
  }

  const now = Date.now();
  if (now - contact.lastUsed < contact.serviceCooldown && contact.serviceCooldown > 0) {
    return { available: false, service: contact.service, cost: 0, result: 'Service is on cooldown.' };
  }

  contact.lastUsed = now;
  ncAddSkillXP('stealth', 10);
  ncAddSkillXP('crypto', 10);

  let result = '';
  switch (contactId) {
    case 'fixer':
      result = `Raven reveals a high-value target: "${NC_SYSTEMS[Math.floor(Math.random() * NC_SYSTEMS.length)].name}". Mission logged.`;
      break;
    case 'info_broker':
      result = `Whisper shares: "The password format for your next target starts with letter '${String.fromCharCode(65 + Math.floor(Math.random() * 26))}'."`;
      break;
    case 'arms_dealer':
      result = 'Chrome offers a 15% discount on your next market purchase.';
      break;
    case 'data_miner':
      result = 'Null extracts bonus data from recent hacks. +20 rare data.';
      s.rareData += 20;
      break;
    case 'rogue_ai':
      result = 'ARIA deploys an advanced decryption algorithm. +30 crypto XP.';
      ncAddSkillXP('crypto', 30);
      break;
    case 'corporate_spy':
      result = `Silk reveals a corporate vulnerability: "${NC_SYSTEMS.filter((sys) => sys.type === 'server')[0]?.name || 'classified'}" has a known exploit.`;
      break;
    case 'street_doc':
      result = 'Scalpel patches you up. +50 credits and reputation restored.';
      ncAddCredits(50);
      ncModifyReputation('neutral', 5);
      break;
    case 'netrunner':
      result = 'Byte assists with a co-op hack. +100 credits, +25 speed XP.';
      ncAddCredits(100);
      ncAddSkillXP('speed', 25);
      break;
    case 'black_hat':
      result = 'Virus deploys malware. Next hack has +20% success bonus.';
      break;
    case 'white_hat':
      result = 'Shield improves your standing with Law enforcement. +10 Law reputation.';
      ncModifyReputation('law', 10);
      break;
    default:
      result = 'Service complete.';
  }

  return { available: true, service: contact.service, cost: contact.serviceCost, result };
}

// ---------------------------------------------------------------------------
// Dark Web Market
// ---------------------------------------------------------------------------

/** Returns all available market items. */
export function ncGetMarketItems(): MarketItem[] {
  const s = ensureInit();
  return NC_MARKET_ITEMS.filter(
    (item) => item.inStock && s.reputation >= item.reputationReq,
  ).map((item) => ({ ...item }));
}

/**
 * Buys an item from the market.
 * Returns true if purchase was successful.
 */
export function ncBuyItem(itemId: string): boolean {
  const s = ensureInit();
  const item = NC_MARKET_ITEMS.find((mi) => mi.id === itemId);
  if (!item || !item.inStock || item.quantity <= 0) return false;
  if (s.reputation < item.reputationReq) return false;
  if (!ncSpendCredits(item.price)) return false;
  if (s.inventory.length >= MAX_INVENTORY) return false;

  item.quantity--;
  if (item.quantity <= 0) item.inStock = false;

  const existing = s.inventory.find((entry) => entry.itemId === itemId);
  if (existing) {
    existing.quantity++;
  } else {
    s.inventory.push({
      itemId: item.id,
      name: item.name,
      type: item.type,
      quantity: 1,
      value: item.sellPrice,
    });
  }

  return true;
}

/**
 * Sells an item from inventory.
 * Returns the credits earned from the sale.
 */
export function ncSellItem(itemId: string): number {
  const s = ensureInit();
  const idx = s.inventory.findIndex((entry) => entry.itemId === itemId);
  if (idx === -1) return 0;

  const entry = s.inventory[idx];
  const earned = entry.value * entry.quantity;
  ncAddCredits(earned);

  s.inventory.splice(idx, 1);
  return earned;
}

/** Returns current market prices for all items. */
export function ncGetMarketPrices(): Record<string, { buy: number; sell: number }> {
  const prices: Record<string, { buy: number; sell: number }> = {};
  for (const item of NC_MARKET_ITEMS) {
    prices[item.id] = { buy: item.price, sell: item.sellPrice };
  }
  return prices;
}

// ---------------------------------------------------------------------------
// Reputation System
// ---------------------------------------------------------------------------

/** Returns the overall reputation score. */
export function ncGetReputation(): number {
  return ensureInit().reputation;
}

/** Returns standing for a specific faction. */
export function ncGetFactionStanding(factionId: FactionId): number {
  return ensureInit().factionStanding[factionId];
}

/** Returns all faction standings. */
export function ncGetAllFactionStandings(): Record<FactionId, number> {
  return { ...ensureInit().factionStanding };
}

/** Modifies standing for a specific faction. Clamped to -100..100. */
export function ncModifyReputation(
  factionId: FactionId,
  amount: number,
): number {
  const s = ensureInit();
  const current = s.factionStanding[factionId];
  s.factionStanding[factionId] = Math.min(
    100,
    Math.max(-100, current + amount),
  );
  s.reputation += Math.floor(amount * 0.3);
  return s.factionStanding[factionId];
}

// ---------------------------------------------------------------------------
// Intel System
// ---------------------------------------------------------------------------

/** Returns all collected intel fragments. */
export function ncGetIntelligence(): IntelFragment[] {
  return [...ensureInit().intelFragments];
}

/** Decodes an intel fragment, progressing the associated conspiracy. */
export function ncDecodeFragment(fragmentId: string): {
  decoded: boolean;
  content: string;
  conspiracyProgress: string;
} {
  const s = ensureInit();
  const fragment = s.intelFragments.find((f) => f.id === fragmentId);
  if (!fragment || fragment.decoded) {
    return { decoded: false, content: '', conspiracyProgress: '' };
  }

  const decodeCost = fragment.rarity * 25;
  if (!ncSpendCredits(decodeCost)) {
    return { decoded: false, content: '', conspiracyProgress: 'Insufficient credits.' };
  }

  fragment.decoded = true;
  fragment.collectedAt = Date.now();
  ncAddXP(fragment.rarity * 10);

  const conspiracy = s.conspiracies.find(
    (c) => c.id === fragment.conspiracyId,
  );
  let progressMsg = '';
  if (conspiracy) {
    conspiracy.fragmentsDecoded++;
    conspiracy.progress = Math.floor(
      (conspiracy.fragmentsDecoded / conspiracy.fragmentsTotal) * 100,
    );
    progressMsg = `${conspiracy.name}: ${conspiracy.progress}% complete (${conspiracy.fragmentsDecoded}/${conspiracy.fragmentsTotal} fragments)`;

    if (conspiracy.fragmentsDecoded >= conspiracy.fragmentsTotal && !conspiracy.completed) {
      conspiracy.completed = true;
      ncAddCredits(conspiracy.reward);
      ncAddXP(conspiracy.reward);
      progressMsg += ` CONSPIRACY SOLVED! +${conspiracy.reward} credits reward.`;
    }
  }

  return {
    decoded: true,
    content: fragment.content,
    conspiracyProgress: progressMsg,
  };
}

/** Returns progress for all conspiracy chains. */
export function ncGetConspiracyProgress(): Conspiracy[] {
  return [...ensureInit().conspiracies];
}

// ---------------------------------------------------------------------------
// Daily Challenge
// ---------------------------------------------------------------------------

/** Returns the current daily challenge, seeded by date. */
export function ncGetDailyChallenge(): DailyChallengeData {
  const s = ensureInit();
  const seed = dateSeed();
  if (s.dailyChallenge.dateSeed === seed) return { ...s.dailyChallenge };

  const districtIdx = seed % NC_DISTRICTS.length;
  const district = NC_DISTRICTS[districtIdx];
  const objectives = [
    `Hack 3 systems in ${district.name}`,
    `Earn 500 credits from hacks in ${district.name}`,
    `Decode 2 intel fragments in ${district.name}`,
    `Complete a hack streak of 5 in ${district.name}`,
    `Hack a system with difficulty 5+ in ${district.name}`,
  ];
  const objIdx = Math.floor(seededRandom(seed * 7 + 3) * objectives.length);

  s.dailyChallenge = {
    district: district.id,
    objective: objectives[objIdx],
    bonusMultiplier: 1.5 + seededRandom(seed * 11) * 1.5,
    completed: false,
    reward: 200 + district.dangerLevel * 100,
    dateSeed: seed,
  };

  return { ...s.dailyChallenge };
}

/** Completes the daily challenge and awards bonus rewards. */
export function ncCompleteDaily(): { reward: number; bonusMultiplier: number } {
  const s = ensureInit();
  const daily = ncGetDailyChallenge();
  if (daily.completed) return { reward: 0, bonusMultiplier: 1 };

  s.dailyChallenge.completed = true;
  const totalReward = Math.floor(daily.reward * daily.bonusMultiplier);
  ncAddCredits(totalReward);
  ncAddXP(Math.floor(totalReward * 0.5));
  ncModifyReputation('neutral', 5);

  return { reward: totalReward, bonusMultiplier: daily.bonusMultiplier };
}

// ---------------------------------------------------------------------------
// Streaks
// ---------------------------------------------------------------------------

/** Returns the current consecutive hack streak. */
export function ncGetStreak(): number {
  return ensureInit().streak;
}

/** Returns the best hack streak achieved. */
export function ncGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

/** Returns a summary of key statistics. */
export function ncGetStats(): { label: string; value: string | number }[] {
  const s = ensureInit();
  const deck = getActiveDeck();
  const skills = getSkillsSnapshot();
  const maxSkill = skills.reduce((max, sk) => Math.max(max, sk.level), 0);
  const augs = getAugsSnapshot();
  const installedAugs = augs.filter((a) => a.installed).length;
  const hiredContacts = NC_CONTACTS.filter((c) => c.hired).length;
  const successRate =
    s.runHistory.length > 0
      ? Math.round(
          (s.runHistory.filter((r) => r.success).length /
            s.runHistory.length) *
            100,
        )
      : 0;

  return [
    { label: 'Level', value: `${s.level}/${MAX_LEVEL}` },
    { label: 'XP Progress', value: `${s.xp}/${s.xpToNext}` },
    { label: 'Credits', value: s.credits },
    { label: 'Total Earned', value: s.totalCreditsEarned },
    { label: 'Reputation', value: s.reputation },
    { label: 'Total Hacks', value: s.totalHacks },
    { label: 'Success Rate', value: `${successRate}%` },
    { label: 'Streak', value: `${s.streak} (Best: ${s.bestStreak})` },
    { label: 'Rare Data', value: s.rareData },
    { label: 'Inventory', value: `${s.inventory.length}/${MAX_INVENTORY}` },
    { label: 'Cyberdeck', value: `${deck.name} (Lv.${deck.level})` },
    { label: 'Top Skill', value: `${maxSkill} pts` },
    { label: 'Augmentations', value: `${installedAugs}/8` },
    { label: 'Contacts', value: `${hiredContacts}/10` },
    { label: 'Achievements', value: `${s.achievements.length}/15` },
    { label: 'Conspiracies', value: `${s.conspiracies.filter((c) => c.completed).length}/${s.conspiracies.length}` },
    { label: 'Intel Fragments', value: `${s.intelFragments.filter((f) => f.decoded).length}/${s.intelFragments.length}` },
  ];
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/** Returns all 15 achievements with unlock status. */
export function ncGetAchievements(): {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
}[] {
  const s = ensureInit();
  return NC_ACHIEVEMENT_DEFS.map((ach) => ({
    id: ach.id,
    name: ach.name,
    description: ach.description,
    unlocked: s.achievements.includes(ach.id),
  }));
}

/** Checks and unlocks any newly earned achievements. Returns newly unlocked IDs. */
export function ncCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];

  const checkDistricts = (): boolean => {
    let unlockedCount = 0;
    for (const d of NC_DISTRICTS) {
      const isUnlocked =
        d.unlockCost === 0 ||
        d.unlocked ||
        s.level >= Math.floor(d.unlockCost / 500) + 3;
      if (isUnlocked) unlockedCount++;
    }
    return unlockedCount >= 8;
  };

  const checkFullAugs = (): boolean => {
    return NC_AUGMENTATIONS.every(
      (a) => a.installed && a.level >= a.maxLevel,
    );
  };

  const checkContacts = (): boolean => {
    return NC_CONTACTS.every((c) => c.hired);
  };

  const checkMaxSkill = (): boolean => {
    return NC_SKILLS.some((sk) => sk.level >= sk.maxLevel);
  };

  const checkNeuralHacks = (): boolean => {
    const neuralSystems = NC_SYSTEMS.filter(
      (sys) => sys.type === 'neural_implant',
    );
    return neuralSystems.filter((sys) => sys.hackCount > 0).length >= 5;
  };

  const checkDailyStreak = (): boolean => {
    return s.dailyChallenge.completed;
  };

  for (const ach of NC_ACHIEVEMENT_DEFS) {
    if (s.achievements.includes(ach.id)) continue;

    let earned = false;
    switch (ach.id) {
      case 'nc_district_hopper':
        earned = checkDistricts();
        break;
      case 'nc_full_augs':
        earned = checkFullAugs();
        break;
      case 'nc_contact_network':
        earned = checkContacts();
        break;
      case 'nc_max_skill':
        earned = checkMaxSkill();
        break;
      case 'nc_neural_hacker':
        earned = checkNeuralHacks();
        break;
      case 'nc_daily_streak':
        earned = checkDailyStreak();
        break;
      default:
        earned = ach.condition(s);
    }

    if (earned) {
      s.achievements.push(ach.id);
      newlyUnlocked.push(ach.id);
      ncAddCredits(100);
      ncAddXP(50);
    }
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Run History
// ---------------------------------------------------------------------------

/** Returns the last 30 hack run entries. */
export function ncGetRunHistory(): RunEntry[] {
  return [...ensureInit().runHistory];
}

// ---------------------------------------------------------------------------
// Hint System
// ---------------------------------------------------------------------------

/** Returns a contextual hacking hint based on current state. */
export function ncGetHint(): string {
  const s = ensureInit();
  const hints: string[] = [];

  if (s.currentRun) {
    const system = NC_SYSTEMS.find(
      (sys) => sys.id === s.currentRun!.systemId,
    );
    if (system) {
      hints.push(
        `Target "${system.name}" uses ${system.encryption} encryption. Match password letters carefully.`,
      );
      hints.push(
        `Firewall level ${system.firewallLevel}. Your cyberdeck breach power is ${getActiveDeck().breachPower}.`,
      );
      hints.push(
        `Tip: Each correct letter position narrows down the password significantly.`,
      );
    }
    return hints[Math.floor(Date.now() / 30000) % hints.length];
  }

  if (s.credits < 200) {
    hints.push(
      'Low on credits? Start with Market District systems — they have lower difficulty and firewall levels.',
    );
  }

  const unhacked = NC_SYSTEMS.filter(
    (sys) => !sys.hacked && sys.district === s.currentDistrict,
  );
  if (unhacked.length > 0) {
    hints.push(
      `${unhacked.length} unhacked systems remain in ${NC_DISTRICTS.find((d) => d.id === s.currentDistrict)?.name || 'current district'}.`,
    );
  }

  if (s.streak >= STREAK_BONUS_THRESHOLD) {
    hints.push(
      `Your ${s.streak}-hack streak is giving you bonus rewards! Keep it going.`,
    );
  }

  const uninstalled = NC_AUGMENTATIONS.filter((a) => !a.installed);
  if (uninstalled.length > 0 && s.credits >= 300) {
    hints.push(
      `Consider installing ${uninstalled[0].name} — ${uninstalled[0].description.toLowerCase()}.`,
    );
  }

  hints.push(
    'Higher-level cyberdecks unlock at levels 5, 15, 30, and 45. Upgrade your deck when possible.',
  );
  hints.push(
    'Use the Fixer contact to discover high-value targets worth extra credits.',
  );
  hints.push(
    'Intel fragments can be decoded for credits and conspiracy progress. Check the Data Haven district.',
  );
  hints.push(
    'Watch your faction standings — extreme negative standing with Law can lock you out of certain districts.',
  );

  return hints[Math.floor(Date.now() / 45000) % hints.length];
}

// ---------------------------------------------------------------------------
// Additional Utility Functions
// ---------------------------------------------------------------------------

/** Returns the player's total inventory count and max capacity. */
export function ncGetInventoryCount(): { count: number; max: number } {
  const s = ensureInit();
  return { count: s.inventory.length, max: MAX_INVENTORY };
}

/** Returns the current inventory contents. */
export function ncGetInventory(): InventoryEntry[] {
  return [...ensureInit().inventory];
}

/** Returns the hack success probability for a given system. */
export function ncGetHackChance(systemId: string): number {
  const system = NC_SYSTEMS.find((sys) => sys.id === systemId);
  if (!system) return 0;
  return computeHackChance(system);
}

/** Returns the faction name for a given faction id. */
export function ncGetFactionName(factionId: FactionId): string {
  const names: Record<FactionId, string> = {
    corporate: 'MegaCorp Alliance',
    underground: 'Underground Network',
    neutral: 'Neon City Central',
    law: 'City Law Enforcement',
    ai_collective: 'AI Collective',
  };
  return names[factionId] || factionId;
}

/** Returns the system type display name. */
export function ncGetSystemTypeName(type: SystemType): string {
  const names: Record<SystemType, string> = {
    security_camera: 'Security Camera',
    atm: 'ATM',
    door_lock: 'Door Lock',
    drone: 'Drone',
    server: 'Server',
    neural_implant: 'Neural Implant',
  };
  return names[type] || type;
}

/** Returns total number of hacks per district. */
export function ncGetHacksByDistrict(): Record<string, { total: number; success: number }> {
  const s = ensureInit();
  const result: Record<string, { total: number; success: number }> = {};
  for (const d of NC_DISTRICTS) {
    const runs = s.runHistory.filter((r) => r.district === d.id);
    result[d.id] = {
      total: runs.length,
      success: runs.filter((r) => r.success).length,
    };
  }
  return result;
}

/** Returns total number of hacks per system type. */
export function ncGetHacksByType(): Record<SystemType, number> {
  const s = ensureInit();
  const result = {} as Record<SystemType, number>;
  const types: SystemType[] = ['security_camera', 'atm', 'door_lock', 'drone', 'server', 'neural_implant'];
  for (const type of types) {
    const systems = NC_SYSTEMS.filter((sys) => sys.type === type);
    result[type] = systems.reduce((sum, sys) => sum + sys.hackCount, 0);
  }
  return result;
}

/** Returns the encryption difficulty multiplier for display. */
export function ncGetEncryptionStrength(encryption: string): number {
  const strengths: Record<string, number> = {
    XOR: 1,
    ROT13: 1.2,
    Caesar: 1.5,
    'AES-128': 2,
    'AES-256': 3,
    'RSA-2048': 4,
    'RSA-4096': 6,
    'Quantum-Key': 8,
  };
  return strengths[encryption] || 1;
}

/** Returns the player's total augmentations installed and their combined levels. */
export function ncGetAugmentationSummary(): {
  installed: number;
  total: number;
  combinedLevel: number;
  maxCombinedLevel: number;
} {
  const augs = getAugsSnapshot();
  const installed = augs.filter((a) => a.installed);
  return {
    installed: installed.length,
    total: augs.length,
    combinedLevel: installed.reduce((sum, a) => sum + a.level, 0),
    maxCombinedLevel: augs.reduce((sum, a) => sum + a.maxLevel, 0),
  };
}

/** Returns the level title for the player's current level. */
export function ncGetLevelTitle(): string {
  const level = ensureInit().level;
  if (level >= 45) return 'Quantum Architect';
  if (level >= 35) return 'Neural Overlord';
  if (level >= 25) return 'Netrunner Elite';
  if (level >= 20) return 'System Phantom';
  if (level >= 15) return 'Data Raider';
  if (level >= 10) return 'Street Hacker';
  if (level >= 5) return 'Script Kiddie';
  return 'Digital Newbie';
}

/** Returns a summary of the player's contact network. */
export function ncGetContactSummary(): {
  hired: number;
  total: number;
  available: number;
} {
  const s = ensureInit();
  const hired = NC_CONTACTS.filter((c) => c.hired).length;
  const available = NC_CONTACTS.filter(
    (c) => !c.hired && s.reputation >= c.reputationReq,
  ).length;
  return { hired, total: NC_CONTACTS.length, available };
}

/** Generates a random system name for flavor text. */
export function ncGetRandomSystemFlavor(): string {
  const flavors = [
    'The terminal hums with encrypted data streams.',
    'Warning lights pulse red as the firewall detects intrusion.',
    'Neon reflections dance across the access panel.',
    'A drone patrol sweeps the corridor with a red laser.',
    'The server rack vibrates with processing power.',
    'Neural interface sparks as it synchronizes with the system.',
    'Camera feeds flicker as you bypass the security grid.',
    'The ATM display shifts from account balance to root shell.',
    'Electronic locks click open in rapid succession.',
    'Binary code cascades across the holographic display.',
  ];
  return flavors[Math.floor(Math.random() * flavors.length)];
}
