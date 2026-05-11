// ============================================================================
// Robot Factory Wire — SSR-safe robot building & arena battle system
// All exports use `rb` prefix. No module-level side effects.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type PartType = "head" | "body" | "arms" | "legs" | "core" | "weapon";

type RobotClass =
  | "scout"
  | "tank"
  | "healer"
  | "sniper"
  | "assassin"
  | "guardian"
  | "berserker"
  | "commander";

type BattleAction = "attack" | "defend" | "ability" | "dodge" | "counter";

type BattlePhase = "idle" | "active" | "victory" | "defeat";

interface PartStats {
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
}

interface Part {
  id: string;
  name: string;
  type: PartType;
  rarity: Rarity;
  robotClass: RobotClass;
  stats: PartStats;
  enhancement: number;
  icon: string;
  description: string;
}

interface RobotStats {
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  critRate: number;
}

interface Robot {
  id: string;
  name: string;
  robotClass: RobotClass;
  parts: Record<PartType, Part | null>;
  stats: RobotStats;
  level: number;
  xp: number;
  wins: number;
  losses: number;
  icon: string;
}

interface Ability {
  id: string;
  name: string;
  robotClass: RobotClass;
  description: string;
  damage: number;
  healing: number;
  buffAttack: number;
  buffDefense: number;
  cooldown: number;
  currentCooldown: number;
  icon: string;
}

interface BattleLogEntry {
  round: number;
  actor: string;
  action: string;
  target: string;
  damage: number;
  healing: number;
  message: string;
}

interface BattleState {
  phase: BattlePhase;
  round: number;
  player: RobotStats & { name: string; icon: string; abilities: Ability[] };
  opponent: RobotStats & { name: string; icon: string; abilities: Ability[] };
  log: BattleLogEntry[];
  comboCount: number;
  playerDefending: boolean;
  opponentDefending: boolean;
  reward: { scrap: number; xp: number; blueprint: string | null };
}

interface WorkshopUpgrades {
  assemblySpeed: number;
  qualityBonus: number;
  scrapRecovery: number;
  blueprintChance: number;
}

interface FactoryData {
  level: number;
  xp: number;
  xpToNext: number;
  totalXp: number;
  workshopUpgrades: WorkshopUpgrades;
  unlockedPartIds: string[];
  robotsBuilt: number;
  battlesWon: number;
  battlesLost: number;
}

interface DailyData {
  date: string;
  blueprintId: string;
  challengeCompleted: boolean;
  challengeOpponentId: string;
  challengeRewards: { scrap: number; xp: number; blueprint: string | null };
  streak: number;
  longestStreak: number;
  lastBattleDate: string;
}

interface TournamentData {
  weekStart: string;
  day: number;
  wins: number;
  leaderboard: Array<{ name: string; wins: number; icon: string }>;
  rewardClaimed: boolean;
  reward: { scrap: number; blueprint: string | null };
}

interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  progress: number;
  target: number;
  unlocked: boolean;
}

interface RobotFactoryState {
  factory: FactoryData;
  inventory: Part[];
  robots: Robot[];
  activeRobotId: string | null;
  battle: BattleState;
  battleHistory: Array<{
    opponent: string;
    result: "win" | "loss";
    rounds: number;
    scrap: number;
    date: string;
  }>;
  daily: DailyData;
  tournament: TournamentData;
  achievements: AchievementDef[];
  scrap: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RARITY_ORDER: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

const RARITY_COLORS: Record<Rarity, string> = {
  common: "#9CA3AF",
  uncommon: "#22C55E",
  rare: "#3B82F6",
  epic: "#A855F7",
  legendary: "#F97316",
};

const RARITY_SCRAP_VALUE: Record<Rarity, number> = {
  common: 5,
  uncommon: 15,
  rare: 40,
  epic: 100,
  legendary: 250,
};

const RARITY_MULT: Record<Rarity, number> = {
  common: 1,
  uncommon: 1.4,
  rare: 1.9,
  epic: 2.6,
  legendary: 3.5,
};

const PART_ICONS: Record<PartType, string> = {
  head: "🤖",
  body: "🦾",
  arms: "💪",
  legs: "🦿",
  core: "⚛️",
  weapon: "⚔️",
};

const CLASS_ICONS: Record<RobotClass, string> = {
  scout: "💨",
  tank: "🛡️",
  healer: "💚",
  sniper: "🎯",
  assassin: "🗡️",
  guardian: "⚖️",
  berserker: "🔥",
  commander: "👑",
};

const CLASS_LABELS: Record<RobotClass, string> = {
  scout: "Scout",
  tank: "Tank",
  healer: "Healer",
  sniper: "Sniper",
  assassin: "Assassin",
  guardian: "Guardian",
  berserker: "Berserker",
  commander: "Commander",
};

const CLASS_STAT_BONUS: Record<RobotClass, Partial<PartStats>> = {
  scout: { speed: 12, hp: -5 },
  tank: { defense: 15, hp: 20, speed: -8 },
  healer: { hp: 10, defense: 5 },
  sniper: { attack: 12, speed: 5, critRate: 8, defense: -8 },
  assassin: { attack: 8, speed: 8, critRate: 15, hp: -10 },
  guardian: { hp: 10, attack: 5, defense: 5, speed: 5 },
  berserker: { attack: 18, critRate: 5, defense: -10, hp: -5 },
  commander: { hp: 8, attack: 6, defense: 6, speed: 6, critRate: 4 },
};

const XP_PER_FACTORY_LEVEL = [0, 100, 150, 220, 310, 420, 550, 710, 900, 1120, 1380, 1680, 2030, 2430, 2890, 3420, 4030, 4730, 5540, 6470, 7540, 8770, 10180, 11800, 13650, 15760, 18170, 20920, 24050, 27610, 31650, 36220, 41370, 47160, 53660, 60940, 69080, 78170, 88300];

const MAX_INVENTORY = 100;
const MAX_ENHANCEMENT = 5;

// ---------------------------------------------------------------------------
// Part Definitions (80+ parts across 6 types × 15/15/15/15/10/15)
// ---------------------------------------------------------------------------

const PARTS_CATALOG: Part[] = [
  // ── HEAD (15) ──
  { id: "h01", name: "Visor Core", type: "head", rarity: "common", robotClass: "scout", stats: { hp: 10, attack: 2, defense: 3, speed: 5, critRate: 1 }, enhancement: 0, icon: "🤖", description: "Basic optical sensor head." },
  { id: "h02", name: "Iron Helm", type: "head", rarity: "common", robotClass: "tank", stats: { hp: 20, attack: 1, defense: 5, speed: 0, critRate: 0 }, enhancement: 0, icon: "🤖", description: "Heavy armor plating for the head." },
  { id: "h03", name: "Medi-Sensor", type: "head", rarity: "uncommon", robotClass: "healer", stats: { hp: 15, attack: 0, defense: 4, speed: 3, critRate: 2 }, enhancement: 0, icon: "🤖", description: "Biometric scanner for triage." },
  { id: "h04", name: "Eagle Eye", type: "head", rarity: "uncommon", robotClass: "sniper", stats: { hp: 8, attack: 5, defense: 1, speed: 4, critRate: 6 }, enhancement: 0, icon: "🤖", description: "Long-range targeting module." },
  { id: "h05", name: "Shadow Mask", type: "head", rarity: "rare", robotClass: "assassin", stats: { hp: 5, attack: 4, defense: 2, speed: 8, critRate: 10 }, enhancement: 0, icon: "🤖", description: "Stealth cloaking head unit." },
  { id: "h06", name: "Aegis Crown", type: "head", rarity: "rare", robotClass: "guardian", stats: { hp: 18, attack: 3, defense: 8, speed: 2, critRate: 1 }, enhancement: 0, icon: "🤖", description: "Balanced defensive crown." },
  { id: "h07", name: "Inferno Faceplate", type: "head", rarity: "epic", robotClass: "berserker", stats: { hp: 12, attack: 8, defense: 1, speed: 3, critRate: 7 }, enhancement: 0, icon: "🤖", description: "Intimidating flame-emblazoned face." },
  { id: "h08", name: "Tactical HUD", type: "head", rarity: "epic", robotClass: "commander", stats: { hp: 15, attack: 5, defense: 4, speed: 6, critRate: 3 }, enhancement: 0, icon: "🤖", description: "Enhanced command interface." },
  { id: "h09", name: "Chrono Lens", type: "head", rarity: "legendary", robotClass: "scout", stats: { hp: 15, attack: 5, defense: 4, speed: 14, critRate: 8 }, enhancement: 0, icon: "🤖", description: "Time-dilation targeting system." },
  { id: "h10", name: "Fortress Skull", type: "head", rarity: "legendary", robotClass: "tank", stats: { hp: 35, attack: 3, defense: 14, speed: -2, critRate: 1 }, enhancement: 0, icon: "🤖", description: "Impenetrable fortress head." },
  { id: "h11", name: "Life Matrix", type: "head", rarity: "rare", robotClass: "healer", stats: { hp: 22, attack: 0, defense: 6, speed: 4, critRate: 2 }, enhancement: 0, icon: "🤖", description: "Life-force redistribution array." },
  { id: "h12", name: "Phantom Visor", type: "head", rarity: "uncommon", robotClass: "assassin", stats: { hp: 8, attack: 3, defense: 2, speed: 7, critRate: 6 }, enhancement: 0, icon: "🤖", description: "Cloaked recon visor." },
  { id: "h13", name: "Sentinel Dome", type: "head", rarity: "common", robotClass: "guardian", stats: { hp: 14, attack: 2, defense: 5, speed: 2, critRate: 1 }, enhancement: 0, icon: "🤖", description: "All-purpose surveillance dome." },
  { id: "h14", name: "Berserker Halo", type: "head", rarity: "uncommon", robotClass: "berserker", stats: { hp: 10, attack: 6, defense: 1, speed: 3, critRate: 5 }, enhancement: 0, icon: "🤖", description: "Fury-channeling halo." },
  { id: "h15", name: "Warlord Crown", type: "head", rarity: "epic", robotClass: "commander", stats: { hp: 20, attack: 6, defense: 6, speed: 5, critRate: 4 }, enhancement: 0, icon: "🤖", description: "Inspires allies in battle." },

  // ── BODY (15) ──
  { id: "b01", name: "Frame Alpha", type: "body", rarity: "common", robotClass: "scout", stats: { hp: 15, attack: 2, defense: 3, speed: 4, critRate: 1 }, enhancement: 0, icon: "🦾", description: "Lightweight scout frame." },
  { id: "b02", name: "Bulk Armor", type: "body", rarity: "common", robotClass: "tank", stats: { hp: 30, attack: 1, defense: 8, speed: -2, critRate: 0 }, enhancement: 0, icon: "🦾", description: "Heavy plated body armor." },
  { id: "b03", name: "Medi-Chassis", type: "body", rarity: "uncommon", robotClass: "healer", stats: { hp: 20, attack: 1, defense: 5, speed: 2, critRate: 1 }, enhancement: 0, icon: "🦾", description: "Medical supply compartment body." },
  { id: "b04", name: "Slim Barrel", type: "body", rarity: "uncommon", robotClass: "sniper", stats: { hp: 12, attack: 6, defense: 2, speed: 3, critRate: 4 }, enhancement: 0, icon: "🦾", description: "Aerodynamic sniper body." },
  { id: "b05", name: "Shadow Hull", type: "body", rarity: "rare", robotClass: "assassin", stats: { hp: 10, attack: 5, defense: 3, speed: 8, critRate: 6 }, enhancement: 0, icon: "🦾", description: "Absorbs light and radar." },
  { id: "b06", name: "Bastion Plate", type: "body", rarity: "rare", robotClass: "guardian", stats: { hp: 25, attack: 3, defense: 10, speed: 0, critRate: 1 }, enhancement: 0, icon: "🦾", description: "Impervious guardian chassis." },
  { id: "b07", name: "Furnace Core Body", type: "body", rarity: "epic", robotClass: "berserker", stats: { hp: 18, attack: 10, defense: 2, speed: 2, critRate: 5 }, enhancement: 0, icon: "🦾", description: "Burns with internal fury." },
  { id: "b08", name: "Command Pod", type: "body", rarity: "epic", robotClass: "commander", stats: { hp: 22, attack: 5, defense: 6, speed: 4, critRate: 3 }, enhancement: 0, icon: "🦾", description: "Strategic command center." },
  { id: "b09", name: "Nanite Swarm", type: "body", rarity: "legendary", robotClass: "healer", stats: { hp: 28, attack: 2, defense: 8, speed: 6, critRate: 2 }, enhancement: 0, icon: "🦾", description: "Self-repairing nanite body." },
  { id: "b10", name: "Titan Fortress", type: "body", rarity: "legendary", robotClass: "tank", stats: { hp: 45, attack: 2, defense: 16, speed: -4, critRate: 0 }, enhancement: 0, icon: "🦾", description: "Ultimate immovable object." },
  { id: "b11", name: "Viper Frame", type: "body", rarity: "rare", robotClass: "scout", stats: { hp: 14, attack: 4, defense: 2, speed: 10, critRate: 3 }, enhancement: 0, icon: "🦾", description: "Extremely agile frame." },
  { id: "b12", name: "Reaper Shell", type: "body", rarity: "uncommon", robotClass: "assassin", stats: { hp: 12, attack: 4, defense: 3, speed: 6, critRate: 5 }, enhancement: 0, icon: "🦾", description: "Deathly silent hull." },
  { id: "b13", name: "Guardian Wall", type: "body", rarity: "common", robotClass: "guardian", stats: { hp: 20, attack: 2, defense: 7, speed: 1, critRate: 0 }, enhancement: 0, icon: "🦾", description: "Defensive barrier body." },
  { id: "b14", name: "Rage Vessel", type: "body", rarity: "uncommon", robotClass: "berserker", stats: { hp: 15, attack: 7, defense: 1, speed: 2, critRate: 4 }, enhancement: 0, icon: "🦾", description: "Contains volatile energy." },
  { id: "b15", name: "Overlord Shell", type: "body", rarity: "legendary", robotClass: "commander", stats: { hp: 32, attack: 8, defense: 10, speed: 5, critRate: 5 }, enhancement: 0, icon: "🦾", description: "Supreme command chassis." },

  // ── ARMS (15) ──
  { id: "a01", name: "Gripper", type: "arms", rarity: "common", robotClass: "scout", stats: { hp: 5, attack: 3, defense: 2, speed: 4, critRate: 1 }, enhancement: 0, icon: "💪", description: "Basic manipulator arms." },
  { id: "a02", name: "Shield Arm", type: "arms", rarity: "common", robotClass: "tank", stats: { hp: 8, attack: 1, defense: 6, speed: -1, critRate: 0 }, enhancement: 0, icon: "💪", description: "Integrated shield appendage." },
  { id: "a03", name: "Syringe Arm", type: "arms", rarity: "uncommon", robotClass: "healer", stats: { hp: 6, attack: 1, defense: 3, speed: 3, critRate: 1 }, enhancement: 0, icon: "💪", description: "Medical injection system." },
  { id: "a04", name: "Steady Grip", type: "arms", rarity: "uncommon", robotClass: "sniper", stats: { hp: 4, attack: 6, defense: 1, speed: 2, critRate: 5 }, enhancement: 0, icon: "💪", description: "Precision aiming stabilizers." },
  { id: "a05", name: "Shadow Blades", type: "arms", rarity: "rare", robotClass: "assassin", stats: { hp: 3, attack: 8, defense: 1, speed: 6, critRate: 10 }, enhancement: 0, icon: "💪", description: "Razor-sharp concealed blades." },
  { id: "a06", name: "Bracer Set", type: "arms", rarity: "rare", robotClass: "guardian", stats: { hp: 10, attack: 4, defense: 6, speed: 1, critRate: 1 }, enhancement: 0, icon: "💪", description: "Reinforced gauntlet pair." },
  { id: "a07", name: "Inferno Fists", type: "arms", rarity: "epic", robotClass: "berserker", stats: { hp: 6, attack: 12, defense: 2, speed: 2, critRate: 6 }, enhancement: 0, icon: "💪", description: "Fiery dual melee weapons." },
  { id: "a08", name: "Signal Arms", type: "arms", rarity: "epic", robotClass: "commander", stats: { hp: 8, attack: 5, defense: 4, speed: 3, critRate: 3 }, enhancement: 0, icon: "💪", description: "Tactical relay arrays." },
  { id: "a09", name: "Plasma Casters", type: "arms", rarity: "legendary", robotClass: "berserker", stats: { hp: 8, attack: 16, defense: 3, speed: 3, critRate: 8 }, enhancement: 0, icon: "💪", description: "Devastating plasma launchers." },
  { id: "a10", name: "Aegis Gauntlets", type: "arms", rarity: "legendary", robotClass: "tank", stats: { hp: 20, attack: 4, defense: 14, speed: -2, critRate: 1 }, enhancement: 0, icon: "💪", description: "Impervious guard gauntlets." },
  { id: "a11", name: "Quick Jab", type: "arms", rarity: "common", robotClass: "scout", stats: { hp: 4, attack: 4, defense: 1, speed: 6, critRate: 2 }, enhancement: 0, icon: "💪", description: "Rapid strike arms." },
  { id: "a12", name: "Venom Claws", type: "arms", rarity: "uncommon", robotClass: "assassin", stats: { hp: 4, attack: 6, defense: 1, speed: 5, critRate: 7 }, enhancement: 0, icon: "💪", description: "Toxic claw appendages." },
  { id: "a13", name: "Warden Arms", type: "arms", rarity: "common", robotClass: "guardian", stats: { hp: 8, attack: 3, defense: 5, speed: 1, critRate: 0 }, enhancement: 0, icon: "💪", description: "Reliable defensive arms." },
  { id: "a14", name: "Smash Fists", type: "arms", rarity: "uncommon", robotClass: "berserker", stats: { hp: 5, attack: 9, defense: 1, speed: 1, critRate: 4 }, enhancement: 0, icon: "💪", description: "Brutal melee smashers." },
  { id: "a15", name: "Medi-Beam", type: "arms", rarity: "rare", robotClass: "healer", stats: { hp: 8, attack: 0, defense: 4, speed: 4, critRate: 1 }, enhancement: 0, icon: "💪", description: "Projected healing beam." },

  // ── LEGS (15) ──
  { id: "l01", name: "Runner Servos", type: "legs", rarity: "common", robotClass: "scout", stats: { hp: 5, attack: 1, defense: 2, speed: 8, critRate: 1 }, enhancement: 0, icon: "🦿", description: "Fast bipedal runners." },
  { id: "l02", name: "Tread Base", type: "legs", rarity: "common", robotClass: "tank", stats: { hp: 15, attack: 0, defense: 6, speed: -3, critRate: 0 }, enhancement: 0, icon: "🦿", description: "Armored tank treads." },
  { id: "l03", name: "Hover Pad", type: "legs", rarity: "uncommon", robotClass: "healer", stats: { hp: 8, attack: 0, defense: 3, speed: 5, critRate: 1 }, enhancement: 0, icon: "🦿", description: "Anti-grav mobility system." },
  { id: "l04", name: "Tripod Mount", type: "legs", rarity: "uncommon", robotClass: "sniper", stats: { hp: 6, attack: 2, defense: 4, speed: 2, critRate: 3 }, enhancement: 0, icon: "🦿", description: "Stabilized sniper platform." },
  { id: "l05", name: "Silent Stride", type: "legs", rarity: "rare", robotClass: "assassin", stats: { hp: 4, attack: 2, defense: 2, speed: 10, critRate: 5 }, enhancement: 0, icon: "🦿", description: "Sound-absorbing leg units." },
  { id: "l06", name: "Fortress Stance", type: "legs", rarity: "rare", robotClass: "guardian", stats: { hp: 12, attack: 1, defense: 8, speed: 0, critRate: 0 }, enhancement: 0, icon: "🦿", description: "Anchored defensive legs." },
  { id: "l07", name: "Rocket Boots", type: "legs", rarity: "epic", robotClass: "berserker", stats: { hp: 6, attack: 4, defense: 2, speed: 8, critRate: 4 }, enhancement: 0, icon: "🦿", description: "Propulsion leg systems." },
  { id: "l08", name: "Command Platform", type: "legs", rarity: "epic", robotClass: "commander", stats: { hp: 10, attack: 2, defense: 5, speed: 4, critRate: 2 }, enhancement: 0, icon: "🦿", description: "Elevated tactical platform." },
  { id: "l09", name: "Phase Stride", type: "legs", rarity: "legendary", robotClass: "assassin", stats: { hp: 8, attack: 3, defense: 4, speed: 16, critRate: 8 }, enhancement: 0, icon: "🦿", description: "Teleportation leg modules." },
  { id: "l10", name: "Colossus Treads", type: "legs", rarity: "legendary", robotClass: "tank", stats: { hp: 25, attack: 1, defense: 14, speed: -5, critRate: 0 }, enhancement: 0, icon: "🦿", description: "Massive fortress treads." },
  { id: "l11", name: "Dash Pistons", type: "legs", rarity: "common", robotClass: "scout", stats: { hp: 4, attack: 1, defense: 1, speed: 10, critRate: 2 }, enhancement: 0, icon: "🦿", description: "Burst-speed pistons." },
  { id: "l12", name: "Healer Treads", type: "legs", rarity: "common", robotClass: "healer", stats: { hp: 10, attack: 0, defense: 3, speed: 2, critRate: 0 }, enhancement: 0, icon: "🦿", description: "Sturdy support legs." },
  { id: "l13", name: "Crouch Mount", type: "legs", rarity: "uncommon", robotClass: "sniper", stats: { hp: 8, attack: 3, defense: 5, speed: 1, critRate: 4 }, enhancement: 0, icon: "🦿", description: "Low-profile sniper mount." },
  { id: "l14", name: "War Stompers", type: "legs", rarity: "rare", robotClass: "berserker", stats: { hp: 8, attack: 6, defense: 3, speed: 4, critRate: 3 }, enhancement: 0, icon: "🦿", description: "Ground-shaking leg units." },
  { id: "l15", name: "Guardian Stride", type: "legs", rarity: "uncommon", robotClass: "guardian", stats: { hp: 10, attack: 1, defense: 6, speed: 2, critRate: 0 }, enhancement: 0, icon: "🦿", description: "Balanced defensive stride." },

  // ── CORE (10) ──
  { id: "c01", name: "Spark Core", type: "core", rarity: "common", robotClass: "scout", stats: { hp: 8, attack: 2, defense: 2, speed: 4, critRate: 1 }, enhancement: 0, icon: "⚛️", description: "Basic energy cell." },
  { id: "c02", name: "Iron Heart", type: "core", rarity: "common", robotClass: "tank", stats: { hp: 20, attack: 0, defense: 5, speed: -1, critRate: 0 }, enhancement: 0, icon: "⚛️", description: "Durable power source." },
  { id: "c03", name: "Life Crystal", type: "core", rarity: "uncommon", robotClass: "healer", stats: { hp: 15, attack: 0, defense: 3, speed: 2, critRate: 1 }, enhancement: 0, icon: "⚛️", description: "Regenerative energy matrix." },
  { id: "c04", name: "Precision CPU", type: "core", rarity: "uncommon", robotClass: "sniper", stats: { hp: 5, attack: 6, defense: 1, speed: 3, critRate: 6 }, enhancement: 0, icon: "⚛️", description: "High-accuracy processor." },
  { id: "c05", name: "Phantom Drive", type: "core", rarity: "rare", robotClass: "assassin", stats: { hp: 6, attack: 4, defense: 2, speed: 6, critRate: 8 }, enhancement: 0, icon: "⚛️", description: "Cloaking energy matrix." },
  { id: "c06", name: "Aegis Reactor", type: "core", rarity: "rare", robotClass: "guardian", stats: { hp: 15, attack: 2, defense: 8, speed: 2, critRate: 1 }, enhancement: 0, icon: "⚛️", description: "Shield-generating reactor." },
  { id: "c07", name: "Fury Furnace", type: "core", rarity: "epic", robotClass: "berserker", stats: { hp: 10, attack: 10, defense: 1, speed: 3, critRate: 6 }, enhancement: 0, icon: "⚛️", description: "Rage-powered furnace core." },
  { id: "c08", name: "Nexus Link", type: "core", rarity: "epic", robotClass: "commander", stats: { hp: 12, attack: 4, defense: 4, speed: 4, critRate: 3 }, enhancement: 0, icon: "⚛️", description: "Network command processor." },
  { id: "c09", name: "Infinity Engine", type: "core", rarity: "legendary", robotClass: "commander", stats: { hp: 20, attack: 8, defense: 8, speed: 8, critRate: 6 }, enhancement: 0, icon: "⚛️", description: "Boundless power source." },
  { id: "c10", name: "Void Crystal", type: "core", rarity: "legendary", robotClass: "assassin", stats: { hp: 10, attack: 8, defense: 4, speed: 10, critRate: 12 }, enhancement: 0, icon: "⚛️", description: "Harnesses void energy." },

  // ── WEAPON (15) ──
  { id: "w01", name: "Pistol", type: "weapon", rarity: "common", robotClass: "scout", stats: { hp: 0, attack: 5, defense: 0, speed: 2, critRate: 2 }, enhancement: 0, icon: "⚔️", description: "Standard sidearm." },
  { id: "w02", name: "Hammer", type: "weapon", rarity: "common", robotClass: "tank", stats: { hp: 2, attack: 6, defense: 4, speed: -2, critRate: 0 }, enhancement: 0, icon: "⚔️", description: "Heavy blunt weapon." },
  { id: "w03", name: "Healing Wand", type: "weapon", rarity: "uncommon", robotClass: "healer", stats: { hp: 5, attack: 2, defense: 2, speed: 2, critRate: 1 }, enhancement: 0, icon: "⚔️", description: "Channels healing energy." },
  { id: "w04", name: "Railgun", type: "weapon", rarity: "uncommon", robotClass: "sniper", stats: { hp: 0, attack: 8, defense: 0, speed: 1, critRate: 6 }, enhancement: 0, icon: "⚔️", description: "Long-range rail weapon." },
  { id: "w05", name: "Twin Daggers", type: "weapon", rarity: "rare", robotClass: "assassin", stats: { hp: 0, attack: 7, defense: 1, speed: 6, critRate: 12 }, enhancement: 0, icon: "⚔️", description: "Paired lethal daggers." },
  { id: "w06", name: "Bastion Sword", type: "weapon", rarity: "rare", robotClass: "guardian", stats: { hp: 4, attack: 6, defense: 6, speed: 0, critRate: 2 }, enhancement: 0, icon: "⚔️", description: "Balanced blade of justice." },
  { id: "w07", name: "Chain Axe", type: "weapon", rarity: "epic", robotClass: "berserker", stats: { hp: 0, attack: 14, defense: 0, speed: 1, critRate: 5 }, enhancement: 0, icon: "⚔️", description: "Devastating chain weapon." },
  { id: "w08", name: "Tactical Staff", type: "weapon", rarity: "epic", robotClass: "commander", stats: { hp: 4, attack: 6, defense: 4, speed: 3, critRate: 3 }, enhancement: 0, icon: "⚔️", description: "Buffs nearby allies." },
  { id: "w09", name: "Nova Cannon", type: "weapon", rarity: "legendary", robotClass: "berserker", stats: { hp: 0, attack: 20, defense: 0, speed: 2, critRate: 8 }, enhancement: 0, icon: "⚔️", description: "Obliterates everything." },
  { id: "w10", name: "Judgement Blade", type: "weapon", rarity: "legendary", robotClass: "guardian", stats: { hp: 6, attack: 12, defense: 10, speed: 2, critRate: 4 }, enhancement: 0, icon: "⚔️", description: "Ultimate guardian weapon." },
  { id: "w11", name: "SMG", type: "weapon", rarity: "common", robotClass: "scout", stats: { hp: 0, attack: 4, defense: 0, speed: 4, critRate: 3 }, enhancement: 0, icon: "⚔️", description: "Rapid-fire submachine gun." },
  { id: "w12", name: "Poison Shiv", type: "weapon", rarity: "uncommon", robotClass: "assassin", stats: { hp: 0, attack: 6, defense: 0, speed: 4, critRate: 8 }, enhancement: 0, icon: "⚔️", description: "Coated in lethal toxins." },
  { id: "w13", name: "Medi-Blaster", type: "weapon", rarity: "rare", robotClass: "healer", stats: { hp: 8, attack: 3, defense: 3, speed: 3, critRate: 1 }, enhancement: 0, icon: "⚔️", description: "Heals allies, harms foes." },
  { id: "w14", name: "Plasma Rifle", type: "weapon", rarity: "rare", robotClass: "sniper", stats: { hp: 0, attack: 10, defense: 1, speed: 2, critRate: 8 }, enhancement: 0, icon: "⚔️", description: "Charged plasma sniper." },
  { id: "w15", name: "War Banner", type: "weapon", rarity: "epic", robotClass: "commander", stats: { hp: 6, attack: 5, defense: 5, speed: 4, critRate: 3 }, enhancement: 0, icon: "⚔️", description: "Rallies all allies." },
];

// ---------------------------------------------------------------------------
// Abilities (3 per class = 24)
// ---------------------------------------------------------------------------

const CLASS_ABILITIES: Ability[] = [
  // Scout
  { id: "ab_s1", name: "Overdrive", robotClass: "scout", description: "Boost speed dramatically for one attack.", damage: 10, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "⚡" },
  { id: "ab_s2", name: "Hit & Run", robotClass: "scout", description: "Strike then dodge the next counter.", damage: 8, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 2, currentCooldown: 0, icon: "💨" },
  { id: "ab_s3", name: "Evasion Protocol", robotClass: "scout", description: "Dodge the next incoming attack.", damage: 0, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "🌀" },
  // Tank
  { id: "ab_t1", name: "Shield Wall", robotClass: "tank", description: "Block all damage this turn.", damage: 0, healing: 0, buffAttack: 0, buffDefense: 20, cooldown: 3, currentCooldown: 0, icon: "🧱" },
  { id: "ab_t2", name: "Rampage", robotClass: "tank", description: "Charge through with massive damage.", damage: 18, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "🐪" },
  { id: "ab_t3", name: "Iron Will", robotClass: "tank", description: "Recover HP and gain defense.", damage: 0, healing: 15, buffAttack: 0, buffDefense: 5, cooldown: 4, currentCooldown: 0, icon: "❤️‍🩹" },
  // Healer
  { id: "ab_h1", name: "Repair Burst", robotClass: "healer", description: "Restore significant HP.", damage: 0, healing: 25, buffAttack: 0, buffDefense: 0, cooldown: 2, currentCooldown: 0, icon: "💚" },
  { id: "ab_h2", name: "Nano Shield", robotClass: "healer", description: "Gain a shield that absorbs damage.", damage: 0, healing: 10, buffAttack: 0, buffDefense: 10, cooldown: 3, currentCooldown: 0, icon: "🛡️" },
  { id: "ab_h3", name: "Overcharge", robotClass: "healer", description: "Boost attack and speed temporarily.", damage: 0, healing: 0, buffAttack: 8, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "🔋" },
  // Sniper
  { id: "ab_n1", name: "Headshot", robotClass: "sniper", description: "Guaranteed critical hit for massive damage.", damage: 25, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "🎯" },
  { id: "ab_n2", name: "Suppressing Fire", robotClass: "sniper", description: "Damage and reduce enemy speed.", damage: 10, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "🔫" },
  { id: "ab_n3", name: "Spotter Drone", robotClass: "sniper", description: "Increase own crit rate for next attack.", damage: 0, healing: 0, buffAttack: 5, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "📡" },
  // Assassin
  { id: "ab_a1", name: "Backstab", robotClass: "assassin", description: "Devastating strike from stealth.", damage: 22, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "🗡️" },
  { id: "ab_a2", name: "Smoke Bomb", robotClass: "assassin", description: "Vanish and dodge next attack.", damage: 0, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "💨" },
  { id: "ab_a3", name: "Execute", robotClass: "assassin", description: "Massive damage to low-HP targets.", damage: 20, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "💀" },
  // Guardian
  { id: "ab_g1", name: "Holy Shield", robotClass: "guardian", description: "Create a powerful defensive barrier.", damage: 0, healing: 5, buffAttack: 0, buffDefense: 15, cooldown: 3, currentCooldown: 0, icon: "✨" },
  { id: "ab_g2", name: "Retribution", robotClass: "guardian", description: "Strike back after defending.", damage: 12, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "⚖️" },
  { id: "ab_g3", name: "Blessing", robotClass: "guardian", description: "Heal and boost all stats slightly.", damage: 0, healing: 12, buffAttack: 3, buffDefense: 3, cooldown: 4, currentCooldown: 0, icon: "👼" },
  // Berserker
  { id: "ab_be1", name: "Blood Rage", robotClass: "berserker", description: "Sacrifice HP for massive attack boost.", damage: 0, healing: -10, buffAttack: 15, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "🩸" },
  { id: "ab_be2", name: "Whirlwind", robotClass: "berserker", description: "Devastating area attack.", damage: 20, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 4, currentCooldown: 0, icon: "🌪️" },
  { id: "ab_be3", name: "War Cry", robotClass: "berserker", description: "Intimidate enemy, reducing their defense.", damage: 8, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "📢" },
  // Commander
  { id: "ab_co1", name: "Tactical Strike", robotClass: "commander", description: "Coordinated attack with bonus damage.", damage: 15, healing: 0, buffAttack: 0, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "📊" },
  { id: "ab_co2", name: "Rally", robotClass: "commander", description: "Boost attack and speed significantly.", damage: 0, healing: 0, buffAttack: 6, buffDefense: 0, cooldown: 3, currentCooldown: 0, icon: "📯" },
  { id: "ab_co3", name: "Fortify", robotClass: "commander", description: "Boost defense and recover HP.", damage: 0, healing: 10, buffAttack: 0, buffDefense: 8, cooldown: 4, currentCooldown: 0, icon: "🏰" },
];

// ---------------------------------------------------------------------------
// AI Opponents (20)
// ---------------------------------------------------------------------------

interface AIOpponent {
  id: string;
  name: string;
  robotClass: RobotClass;
  level: number;
  stats: RobotStats;
  icon: string;
}

const AI_OPPONENTS: AIOpponent[] = [
  { id: "ai01", name: "Scrap Drone", robotClass: "scout", level: 1, stats: { hp: 40, maxHp: 40, attack: 8, defense: 3, speed: 10, critRate: 5 }, icon: "🤖" },
  { id: "ai02", name: "Rusty Tank", robotClass: "tank", level: 2, stats: { hp: 80, maxHp: 80, attack: 6, defense: 10, speed: 2, critRate: 2 }, icon: "🛡️" },
  { id: "ai03", name: "Patchwork Bot", robotClass: "guardian", level: 3, stats: { hp: 60, maxHp: 60, attack: 7, defense: 7, speed: 5, critRate: 3 }, icon: "⚙️" },
  { id: "ai04", name: "Quickshot", robotClass: "sniper", level: 4, stats: { hp: 35, maxHp: 35, attack: 14, defense: 3, speed: 6, critRate: 10 }, icon: "🎯" },
  { id: "ai05", name: "Shadow Pawn", robotClass: "assassin", level: 5, stats: { hp: 30, maxHp: 30, attack: 12, defense: 4, speed: 14, critRate: 18 }, icon: "🗡️" },
  { id: "ai06", name: "Medic Unit", robotClass: "healer", level: 5, stats: { hp: 55, maxHp: 55, attack: 5, defense: 8, speed: 5, critRate: 2 }, icon: "💚" },
  { id: "ai07", name: "Rage Bot", robotClass: "berserker", level: 6, stats: { hp: 50, maxHp: 50, attack: 18, defense: 2, speed: 7, critRate: 10 }, icon: "🔥" },
  { id: "ai08", name: "Sergeant Rex", robotClass: "commander", level: 7, stats: { hp: 65, maxHp: 65, attack: 12, defense: 9, speed: 8, critRate: 6 }, icon: "👑" },
  { id: "ai09", name: "Phantom Striker", robotClass: "assassin", level: 8, stats: { hp: 45, maxHp: 45, attack: 18, defense: 5, speed: 16, critRate: 22 }, icon: "👤" },
  { id: "ai10", name: "Iron Golem", robotClass: "tank", level: 9, stats: { hp: 130, maxHp: 130, attack: 10, defense: 18, speed: 1, critRate: 2 }, icon: "🗿" },
  { id: "ai11", name: "Nova Healer", robotClass: "healer", level: 10, stats: { hp: 75, maxHp: 75, attack: 8, defense: 12, speed: 7, critRate: 4 }, icon: "🌟" },
  { id: "ai12", name: "Deathwhisper", robotClass: "sniper", level: 11, stats: { hp: 50, maxHp: 50, attack: 24, defense: 5, speed: 8, critRate: 16 }, icon: "💀" },
  { id: "ai13", name: "Fury Titan", robotClass: "berserker", level: 12, stats: { hp: 80, maxHp: 80, attack: 26, defense: 4, speed: 6, critRate: 14 }, icon: "💥" },
  { id: "ai14", name: "Warden Prime", robotClass: "guardian", level: 13, stats: { hp: 100, maxHp: 100, attack: 14, defense: 16, speed: 6, critRate: 5 }, icon: "🛡️" },
  { id: "ai15", name: "Ghost Runner", robotClass: "scout", level: 14, stats: { hp: 55, maxHp: 55, attack: 16, defense: 6, speed: 20, critRate: 15 }, icon: "👻" },
  { id: "ai16", name: "General Magnus", robotClass: "commander", level: 15, stats: { hp: 110, maxHp: 110, attack: 18, defense: 14, speed: 10, critRate: 8 }, icon: "⭐" },
  { id: "ai17", name: "Apex Hunter", robotClass: "assassin", level: 17, stats: { hp: 70, maxHp: 70, attack: 28, defense: 8, speed: 22, critRate: 25 }, icon: "🏁" },
  { id: "ai18", name: "Colossus X", robotClass: "tank", level: 18, stats: { hp: 180, maxHp: 180, attack: 15, defense: 22, speed: 2, critRate: 3 }, icon: "🏔️" },
  { id: "ai19", name: "Void Sniper", robotClass: "sniper", level: 19, stats: { hp: 65, maxHp: 65, attack: 32, defense: 8, speed: 10, critRate: 20 }, icon: "🌑" },
  { id: "ai20", name: "Omega Supreme", robotClass: "commander", level: 20, stats: { hp: 160, maxHp: 160, attack: 24, defense: 20, speed: 12, critRate: 12 }, icon: "🏆" },
];

// ---------------------------------------------------------------------------
// Robot name generator data
// ---------------------------------------------------------------------------

const NAME_PREFIXES = [
  "Axon", "Circuit", "Dynamo", "Flux", "Gear", "Helix", "Ion", "Jolt",
  "Krypton", "Lumen", "Magnus", "Nano", "Optic", "Pulse", "Quasar",
  "Radix", "Sigma", "Tensor", "Ultrix", "Vector", "Warp", "Xenon",
  "Zeta", "Blitz", "Crux", "Drift", "Echo", "Forge", "Glint",
];

const NAME_SUFFIXES = [
  "Prime", "X", "Zero", "Alpha", "Omega", "Nova", "Mk-II", "V3",
  "Bot", "Tron", "Core", "Edge", "Spark", "Blade", "Storm",
  "Fury", "Viper", "Titan", "Matrix", "Pulse", "Rex", "Max",
  "Strike", "Force", "Rise", "Bolt", "Wave", "Shard", "Dusk",
];

// ---------------------------------------------------------------------------
// Achievement definitions (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "ach_01", name: "First Build", description: "Build your first robot.", icon: "🔧", condition: "robotsBuilt >= 1", progress: 0, target: 1, unlocked: false },
  { id: "ach_02", name: "Factory Up", description: "Reach factory level 5.", icon: "🏭", condition: "factoryLevel >= 5", progress: 0, target: 5, unlocked: false },
  { id: "ach_03", name: "First Blood", description: "Win your first arena battle.", icon: "⚔️", condition: "battlesWon >= 1", progress: 0, target: 1, unlocked: false },
  { id: "ach_04", name: "Veteran", description: "Win 10 arena battles.", icon: "🏅", condition: "battlesWon >= 10", progress: 0, target: 10, unlocked: false },
  { id: "ach_05", name: "Champion", description: "Win 25 arena battles.", icon: "🏆", condition: "battlesWon >= 25", progress: 0, target: 25, unlocked: false },
  { id: "ach_06", name: "Hoarding Scrap", description: "Accumulate 500 scrap.", icon: "🔩", condition: "scrap >= 500", progress: 0, target: 500, unlocked: false },
  { id: "ach_07", name: "Enhancer", description: "Enhance a part to +3.", icon: "⬆️", condition: "maxEnhance >= 3", progress: 0, target: 3, unlocked: false },
  { id: "ach_08", name: "Fusion Master", description: "Fuse parts 5 times.", icon: "🔮", condition: "fuseCount >= 5", progress: 0, target: 5, unlocked: false },
  { id: "ach_09", name: "Army Builder", description: "Build 5 robots.", icon: "🤖", condition: "robotsBuilt >= 5", progress: 0, target: 5, unlocked: false },
  { id: "ach_10", name: "On a Streak", description: "Reach a 5-win streak.", icon: "🔥", condition: "streak >= 5", progress: 0, target: 5, unlocked: false },
  { id: "ach_11", name: "Unstoppable", description: "Reach a 10-win streak.", icon: "🌟", condition: "streak >= 10", progress: 0, target: 10, unlocked: false },
  { id: "ach_12", name: "Legendary", description: "Obtain a legendary part.", icon: "✨", condition: "hasLegendary >= 1", progress: 0, target: 1, unlocked: false },
  { id: "ach_13", name: "Factory Master", description: "Reach factory level 20.", icon: "🏗️", condition: "factoryLevel >= 20", progress: 0, target: 20, unlocked: false },
  { id: "ach_14", name: "Daily Devotee", description: "Complete 7 daily challenges.", icon: "📅", condition: "dailiesCompleted >= 7", progress: 0, target: 7, unlocked: false },
  { id: "ach_15", name: "Arena Legend", description: "Defeat Omega Supreme.", icon: "👑", condition: "defeatedOmega >= 1", progress: 0, target: 1, unlocked: false },
];

// ---------------------------------------------------------------------------
// Date-seeded PRNG (Mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function weekStartStr(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
}

function seededPick<T>(arr: T[], seed: number, index: number): T {
  const rng = mulberry32(seed + index * 9973);
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function generateRobotName(seed: number): string {
  const rng = mulberry32(seed);
  const prefix = NAME_PREFIXES[Math.floor(rng() * NAME_PREFIXES.length)];
  const suffix = NAME_SUFFIXES[Math.floor(rng() * NAME_SUFFIXES.length)];
  return `${prefix} ${suffix}`;
}

function generateId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ---------------------------------------------------------------------------
// State management (SSR-safe lazy init)
// ---------------------------------------------------------------------------

let state: RobotFactoryState | null = null;

function createInitialState(): RobotFactoryState {
  const today = todayStr();
  const weekStart = weekStartStr();
  const seed = dateSeed();
  const blueprint = seededPick(PARTS_CATALOG, seed, 0);
  const challengeOpponent = seededPick(AI_OPPONENTS, seed, 1);

  return {
    factory: {
      level: 1,
      xp: 0,
      xpToNext: XP_PER_FACTORY_LEVEL[1] ?? 100,
      totalXp: 0,
      workshopUpgrades: { assemblySpeed: 0, qualityBonus: 0, scrapRecovery: 0, blueprintChance: 0 },
      unlockedPartIds: PARTS_CATALOG.filter(p => p.rarity === "common").map(p => p.id),
      robotsBuilt: 0,
      battlesWon: 0,
      battlesLost: 0,
    },
    inventory: [],
    robots: [],
    activeRobotId: null,
    battle: createIdleBattle(),
    battleHistory: [],
    daily: {
      date: today,
      blueprintId: blueprint.id,
      challengeCompleted: false,
      challengeOpponentId: challengeOpponent.id,
      challengeRewards: { scrap: 50, xp: 80, blueprint: blueprint.id },
      streak: 0,
      longestStreak: 0,
      lastBattleDate: "",
    },
    tournament: {
      weekStart,
      day: 1,
      wins: 0,
      leaderboard: generateLeaderboard(seed),
      rewardClaimed: false,
      reward: { scrap: 200, blueprint: seededPick(PARTS_CATALOG.filter(p => p.rarity === "rare" || p.rarity === "epic"), seed, 5).id },
    },
    achievements: deepClone(ACHIEVEMENT_DEFS),
    scrap: 50,
  };
}

function generateLeaderboard(seed: number): Array<{ name: string; wins: number; icon: string }> {
  const rng = mulberry32(seed + 7777);
  const names = ["Steel Knight", "Cyber Wolf", "Neon Samurai", "Thunder Hawk", "Darkmatter", "Frost Giant", "Ember Fox", "Storm Rider", "Iron Dragon", "Void Walker"];
  return names.map(n => ({ name: n, wins: Math.floor(rng() * 15), icon: CLASS_ICONS[Object.keys(CLASS_ICONS)[Math.floor(rng() * 8)] as RobotClass] })).sort((a, b) => b.wins - a.wins);
}

function createIdleBattle(): BattleState {
  return {
    phase: "idle",
    round: 0,
    player: { name: "", hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, critRate: 0, icon: "", abilities: [] },
    opponent: { name: "", hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, critRate: 0, icon: "", abilities: [] },
    log: [],
    comboCount: 0,
    playerDefending: false,
    opponentDefending: false,
    reward: { scrap: 0, xp: 0, blueprint: null },
  };
}

function ensureInit(): RobotFactoryState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function computeRobotStats(robot: Robot): RobotStats {
  let hp = 0, attack = 0, defense = 0, speed = 0, critRate = 0;
  const types: PartType[] = ["head", "body", "arms", "legs", "core", "weapon"];
  const classCount: Record<string, number> = {};
  for (const type of types) {
    const part = robot.parts[type];
    if (part) {
      const enhMult = 1 + part.enhancement * 0.1;
      const rarMult = RARITY_MULT[part.rarity];
      hp += Math.round(part.stats.hp * rarMult * enhMult);
      attack += Math.round(part.stats.attack * rarMult * enhMult);
      defense += Math.round(part.stats.defense * rarMult * enhMult);
      speed += Math.round(part.stats.speed * rarMult * enhMult);
      critRate += Math.round(part.stats.critRate * rarMult * enhMult);
      classCount[part.robotClass] = (classCount[part.robotClass] || 0) + 1;
    }
  }
  // Determine dominant class
  let dominantClass = robot.robotClass;
  let maxCount = 0;
  for (const [cls, count] of Object.entries(classCount)) {
    if (count > maxCount) { maxCount = count; dominantClass = cls as RobotClass; }
  }
  robot.robotClass = dominantClass;
  // Apply class bonus if 3+ parts match
  if (maxCount >= 3) {
    const bonus = CLASS_STAT_BONUS[dominantClass];
    hp += bonus.hp ?? 0;
    attack += bonus.attack ?? 0;
    defense += bonus.defense ?? 0;
    speed += bonus.speed ?? 0;
    critRate += bonus.critRate ?? 0;
  }
  // Level scaling
  const levelMult = 1 + (robot.level - 1) * 0.05;
  return {
    hp: Math.max(10, Math.round(hp * levelMult)),
    maxHp: Math.max(10, Math.round(hp * levelMult)),
    attack: Math.max(1, Math.round(attack * levelMult)),
    defense: Math.max(0, Math.round(defense * levelMult)),
    speed: Math.max(1, Math.round(speed * levelMult)),
    critRate: clamp(critRate, 0, 80),
  };
}

function getClassAbilities(robotClass: RobotClass): Ability[] {
  return CLASS_ABILITIES.filter(a => a.robotClass === robotClass).map(a => deepClone(a));
}

function rollWinStreakBonus(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 7) return 2.5;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

function aiChooseAction(opponent: BattleState["opponent"], playerHp: number, opponentHp: number): { action: BattleAction; abilityId: string | null } {
  const availableAbilities = opponent.abilities.filter(a => a.currentCooldown === 0);
  const rng = Math.random();

  // Use ability 30% of time if available
  if (availableAbilities.length > 0 && rng < 0.3) {
    // Healer AI: prioritize healing when low
    if (opponent.abilities.some(a => a.healing > 0) && opponentHp < opponent.maxHp * 0.5) {
      const healAbility = availableAbilities.find(a => a.healing > 0);
      if (healAbility) return { action: "ability", abilityId: healAbility.id };
    }
    // Berserker AI: always prefer attack abilities
    const attackAbility = availableAbilities.find(a => a.damage > 10);
    if (attackAbility && rng < 0.5) return { action: "ability", abilityId: attackAbility.id };

    const randomAbility = availableAbilities[Math.floor(Math.random() * availableAbilities.length)];
    return { action: "ability", abilityId: randomAbility.id };
  }

  // Defend when low HP
  if (opponentHp < opponent.maxHp * 0.25 && Math.random() < 0.4) {
    return { action: "defend", abilityId: null };
  }

  // Default: attack
  return { action: "attack", abilityId: null };
}

function executeBattleAction(
  attacker: BattleState["player"] | BattleState["opponent"],
  defender: BattleState["player"] | BattleState["opponent"],
  isPlayer: boolean,
  action: BattleAction,
  abilityId: string | null,
  state: BattleState
): BattleLogEntry {
  const actorName = attacker.name;
  const targetName = defender.name;
  let damage = 0;
  let healing = 0;
  let message = "";

  if (action === "defend") {
    if (isPlayer) state.playerDefending = true;
    else state.opponentDefending = true;
    message = `${actorName} takes a defensive stance! 🛡️`;
    return { round: state.round, actor: actorName, action: "defend", target: "", damage: 0, healing: 0, message };
  }

  if (action === "ability" && abilityId) {
    const ability = attacker.abilities.find(a => a.id === abilityId);
    if (!ability) {
      // Fallback to attack
      action = "attack";
    } else {
      ability.currentCooldown = ability.cooldown;
      damage = ability.damage;
      healing = ability.healing;
      attacker.attack += ability.buffAttack;
      defender.defense = Math.max(0, defender.defense - (ability.buffAttack > 0 ? 0 : 0));
      if (ability.buffDefense > 0) {
        if (isPlayer) state.playerDefending = true;
        else state.opponentDefending = true;
      }
      message = `${actorName} uses ${ability.name}! ${ability.icon}`;
      if (healing > 0) {
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + healing);
        message += ` (+${healing} HP)`;
      }
      if (ability.buffAttack > 0) message += ` (+${ability.buffAttack} ATK)`;
      if (ability.buffDefense > 0) message += ` (+${ability.buffDefense} DEF)`;
      if (healing < 0) {
        attacker.hp = Math.max(1, attacker.hp + healing);
        message += ` (${healing} HP sacrifice)`;
      }
    }
  }

  if (action === "attack") {
    // Base damage calculation
    const isCrit = Math.random() * 100 < attacker.critRate;
    let rawDamage = Math.max(1, attacker.attack - defender.defense * 0.5);
    rawDamage *= (0.9 + Math.random() * 0.2); // ±10% variance
    if (isCrit) rawDamage *= 1.8;
    damage = Math.max(1, Math.round(rawDamage));

    // Defending reduces damage
    const isDefending = isPlayer ? state.opponentDefending : state.playerDefending;
    if (isDefending) {
      damage = Math.max(1, Math.round(damage * 0.4));
      message = `${targetName} blocks! `;
    }

    defender.hp = Math.max(0, defender.hp - damage);

    if (isCrit) {
      message = `💥 CRITICAL! ${actorName} strikes ${targetName} for ${damage} damage!`;
    } else {
      message = `${actorName} attacks ${targetName} for ${damage} damage!`;
    }

    // Combo tracking
    if (isPlayer) {
      state.comboCount++;
      if (state.comboCount > 1) {
        message += ` (Combo x${state.comboCount}🔥)`;
      }
    }
  }

  return { round: state.round, actor: actorName, action, target: targetName, damage, healing, message };
}

// ---------------------------------------------------------------------------
// Daily system refresh
// ---------------------------------------------------------------------------

function refreshDailyIfNeeded(s: RobotFactoryState): void {
  const today = todayStr();
  if (s.daily.date !== today) {
    const wasYesterday = (() => {
      if (!s.daily.lastBattleDate) return false;
      const parts = s.daily.lastBattleDate.split("-").map(Number);
      const lastDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const now = new Date();
      const diffMs = now.getTime() - lastDate.getTime();
      return diffMs > 0 && diffMs < 2 * 86400000;
    })();

    if (!wasYesterday && s.daily.lastBattleDate) {
      s.daily.streak = 0;
    }

    const seed = dateSeed();
    const blueprint = seededPick(PARTS_CATALOG, seed, 0);
    const challengeOpponent = seededPick(AI_OPPONENTS, seed, 1);
    s.daily = {
      date: today,
      blueprintId: blueprint.id,
      challengeCompleted: false,
      challengeOpponentId: challengeOpponent.id,
      challengeRewards: { scrap: 50 + s.factory.level * 5, xp: 80 + s.factory.level * 3, blueprint: blueprint.id },
      streak: s.daily.streak,
      longestStreak: s.daily.longestStreak,
      lastBattleDate: s.daily.lastBattleDate,
    };
  }

  // Tournament refresh
  const ws = weekStartStr();
  if (s.tournament.weekStart !== ws) {
    const seed = dateSeed() + 333;
    s.tournament = {
      weekStart: ws,
      day: 1,
      wins: 0,
      leaderboard: generateLeaderboard(seed),
      rewardClaimed: false,
      reward: { scrap: 200 + s.factory.level * 20, blueprint: seededPick(PARTS_CATALOG.filter(p => p.rarity === "rare" || p.rarity === "epic"), seed, 5).id },
    };
  } else {
    // Update day
    const d = new Date();
    const dayOfWeek = d.getDay() === 0 ? 7 : d.getDay();
    s.tournament.day = dayOfWeek;
  }
}

// ---------------------------------------------------------------------------
// Achievement checking
// ---------------------------------------------------------------------------

function updateAchievements(s: RobotFactoryState): void {
  const a = s.achievements;
  a[0].progress = s.factory.robotsBuilt;
  a[0].unlocked = s.factory.robotsBuilt >= 1;
  a[1].progress = s.factory.level;
  a[1].unlocked = s.factory.level >= 5;
  a[2].progress = s.factory.battlesWon;
  a[2].unlocked = s.factory.battlesWon >= 1;
  a[3].progress = s.factory.battlesWon;
  a[3].unlocked = s.factory.battlesWon >= 10;
  a[4].progress = s.factory.battlesWon;
  a[4].unlocked = s.factory.battlesWon >= 25;
  a[5].progress = s.scrap;
  a[5].unlocked = s.scrap >= 500;
  const maxEnh = s.inventory.reduce((m, p) => Math.max(m, p.enhancement), 0);
  a[6].progress = maxEnh;
  a[6].unlocked = maxEnh >= 3;
  a[7].progress = 0; // Track fuse count elsewhere
  a[8].progress = s.factory.robotsBuilt;
  a[8].unlocked = s.factory.robotsBuilt >= 5;
  a[9].progress = s.daily.streak;
  a[9].unlocked = s.daily.streak >= 5;
  a[10].progress = s.daily.streak;
  a[10].unlocked = s.daily.streak >= 10;
  const hasLeg = s.inventory.some(p => p.rarity === "legendary") || s.robots.some(r => Object.values(r.parts).some(p => p && p.rarity === "legendary"));
  a[11].progress = hasLeg ? 1 : 0;
  a[11].unlocked = hasLeg;
  a[12].progress = s.factory.level;
  a[12].unlocked = s.factory.level >= 20;
  a[13].progress = 0; // Track dailies elsewhere
  const defOmega = s.battleHistory.some(h => h.opponent === "Omega Supreme" && h.result === "win");
  a[14].progress = defOmega ? 1 : 0;
  a[14].unlocked = defOmega;
}

// ============================================================================
// EXPORTED FUNCTIONS
// ============================================================================

// ── State ──

export function rbGetState(): RobotFactoryState {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  updateAchievements(s);
  return deepClone(s);
}

export function rbResetState(): void {
  state = null;
}

// ── Factory ──

export function rbGetFactory(): FactoryData {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  return deepClone(s.factory);
}

export function rbGetFactoryLevel(): number {
  return ensureInit().factory.level;
}

export function rbAddFactoryXP(amount: number): FactoryData {
  const s = ensureInit();
  s.factory.xp += amount;
  s.factory.totalXp += amount;
  while (s.factory.level < 40 && s.factory.xp >= s.factory.xpToNext) {
    s.factory.xp -= s.factory.xpToNext;
    s.factory.level++;
    s.factory.xpToNext = XP_PER_FACTORY_LEVEL[s.factory.level] ?? 99999;
    // Unlock parts at milestones
    const unlockThresholds: Record<number, Rarity> = {
      3: "uncommon", 6: "uncommon", 10: "rare", 15: "rare", 20: "epic",
      25: "epic", 30: "legendary", 35: "legendary", 40: "legendary",
    };
    const unlockRarity = unlockThresholds[s.factory.level];
    if (unlockRarity) {
      const newParts = PARTS_CATALOG.filter(p => p.rarity === unlockRarity && !s.factory.unlockedPartIds.includes(p.id));
      if (newParts.length > 0) {
        const part = newParts[Math.floor(Math.random() * newParts.length)];
        s.factory.unlockedPartIds.push(part.id);
      }
    }
  }
  updateAchievements(s);
  return deepClone(s.factory);
}

export function rbGetWorkshopUpgrades(): WorkshopUpgrades {
  return deepClone(ensureInit().factory.workshopUpgrades);
}

export function rbUpgradeWorkshop(upgrade: keyof WorkshopUpgrades): WorkshopUpgrades {
  const s = ensureInit();
  const costs: Record<keyof WorkshopUpgrades, number> = {
    assemblySpeed: 30,
    qualityBonus: 50,
    scrapRecovery: 40,
    blueprintChance: 60,
  };
  const maxLevels: Record<keyof WorkshopUpgrades, number> = {
    assemblySpeed: 10,
    qualityBonus: 10,
    scrapRecovery: 10,
    blueprintChance: 5,
  };
  const cost = costs[upgrade] * (s.factory.workshopUpgrades[upgrade] + 1);
  if (s.scrap >= cost && s.factory.workshopUpgrades[upgrade] < maxLevels[upgrade]) {
    s.scrap -= cost;
    s.factory.workshopUpgrades[upgrade]++;
  }
  updateAchievements(s);
  return deepClone(s.factory.workshopUpgrades);
}

export function rbGetAssemblySpeed(): number {
  const s = ensureInit();
  return 1 + s.factory.workshopUpgrades.assemblySpeed * 0.1;
}

export function rbGetQualityBonus(): number {
  const s = ensureInit();
  return s.factory.workshopUpgrades.qualityBonus * 5; // +5% per level
}

// ── Parts ──

export function rbGetAllParts(): Part[] {
  return deepClone(PARTS_CATALOG);
}

export function rbGetPart(partId: string): Part | null {
  const part = PARTS_CATALOG.find(p => p.id === partId);
  return part ? deepClone(part) : null;
}

export function rbGetPartsByType(type: PartType): Part[] {
  return deepClone(PARTS_CATALOG.filter(p => p.type === type));
}

export function rbGetPartsByRarity(rarity: Rarity): Part[] {
  return deepClone(PARTS_CATALOG.filter(p => p.rarity === rarity));
}

export function rbGetPartStats(partId: string): PartStats | null {
  const part = PARTS_CATALOG.find(p => p.id === partId);
  return part ? deepClone(part.stats) : null;
}

export function rbGetInventory(): Part[] {
  return deepClone(ensureInit().inventory);
}

export function rbAddPart(partId: string): Part | null {
  const s = ensureInit();
  if (s.inventory.length >= MAX_INVENTORY) return null;
  const template = PARTS_CATALOG.find(p => p.id === partId);
  if (!template) return null;
  const part: Part = deepClone(template);
  part.id = generateId() + "_" + partId; // Unique instance id
  s.inventory.push(part);
  return deepClone(part);
}

export function rbRemovePart(instanceId: string): boolean {
  const s = ensureInit();
  const idx = s.inventory.findIndex(p => p.id === instanceId);
  if (idx === -1) return false;
  s.inventory.splice(idx, 1);
  return true;
}

export function rbGetInventoryCount(): number {
  return ensureInit().inventory.length;
}

// ── Building ──

export function rbBuildRobot(partIds: Record<PartType, string | null>): Robot | null {
  const s = ensureInit();
  // Validate all 6 part slots filled
  const types: PartType[] = ["head", "body", "arms", "legs", "core", "weapon"];
  const parts: Record<string, Part | null> = {};
  for (const type of types) {
    const pid = partIds[type];
    if (!pid) return null;
    const idx = s.inventory.findIndex(p => p.id === pid);
    if (idx === -1) return null;
    parts[type] = deepClone(s.inventory[idx]);
    s.inventory.splice(idx, 1);
  }

  // Determine initial class from most common part class
  const classCount: Record<string, number> = {};
  for (const type of types) {
    const p = parts[type];
    if (p) classCount[p.robotClass] = (classCount[p.robotClass] || 0) + 1;
  }
  let dominantClass: RobotClass = "scout";
  let maxCount = 0;
  for (const [cls, count] of Object.entries(classCount)) {
    if (count > maxCount) { maxCount = count; dominantClass = cls as RobotClass; }
  }

  const robot: Robot = {
    id: generateId(),
    name: generateRobotName(Date.now()),
    robotClass: dominantClass,
    parts: parts as Record<PartType, Part | null>,
    stats: { hp: 0, maxHp: 0, attack: 0, defense: 0, speed: 0, critRate: 0 },
    level: 1,
    xp: 0,
    wins: 0,
    losses: 0,
    icon: CLASS_ICONS[dominantClass],
  };
  robot.stats = computeRobotStats(robot);
  s.robots.push(robot);
  s.activeRobotId = robot.id;
  s.factory.robotsBuilt++;
  updateAchievements(s);
  return deepClone(robot);
}

export function rbSetName(robotId: string, name: string): boolean {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  if (!robot) return false;
  robot.name = name.trim() || generateRobotName(Date.now());
  return true;
}

export function rbGetRobot(robotId: string): Robot | null {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  return robot ? deepClone(robot) : null;
}

export function rbGetRobots(): Robot[] {
  return deepClone(ensureInit().robots);
}

export function rbGetRobotStats(robotId: string): RobotStats | null {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  if (!robot) return null;
  robot.stats = computeRobotStats(robot);
  return deepClone(robot.stats);
}

export function rbGetClassBonus(robotId: string): { active: boolean; bonus: Partial<PartStats>; robotClass: RobotClass } | null {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  if (!robot) return null;
  const types: PartType[] = ["head", "body", "arms", "legs", "core", "weapon"];
  const classCount: Record<string, number> = {};
  for (const type of types) {
    const p = robot.parts[type];
    if (p) classCount[p.robotClass] = (classCount[p.robotClass] || 0) + 1;
  }
  let dominantClass = robot.robotClass;
  let maxCount = 0;
  for (const [cls, count] of Object.entries(classCount)) {
    if (count > maxCount) { maxCount = count; dominantClass = cls as RobotClass; }
  }
  return {
    active: maxCount >= 3,
    bonus: CLASS_STAT_BONUS[dominantClass],
    robotClass: dominantClass,
  };
}

export function rbSetPart(robotId: string, partType: PartType, instanceId: string): boolean {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  if (!robot) return false;
  const invIdx = s.inventory.findIndex(p => p.id === instanceId);
  if (invIdx === -1) return false;
  const newPart = deepClone(s.inventory[invIdx]);
  if (newPart.type !== partType) return false;
  // Return old part to inventory
  const oldPart = robot.parts[partType];
  if (oldPart) s.inventory.push(oldPart);
  // Remove new part from inventory and equip
  s.inventory.splice(invIdx, 1);
  robot.parts[partType] = newPart;
  robot.stats = computeRobotStats(robot);
  robot.icon = CLASS_ICONS[robot.robotClass];
  return true;
}

// ── Arena ──

export function rbGetOpponents(): AIOpponent[] {
  return deepClone(AI_OPPONENTS);
}

export function rbStartBattle(robotId: string, opponentId: string): BattleState | null {
  const s = ensureInit();
  const robot = s.robots.find(r => r.id === robotId);
  if (!robot) return null;
  const opponent = AI_OPPONENTS.find(o => o.id === opponentId);
  if (!opponent) return null;

  robot.stats = computeRobotStats(robot);
  const abilities = getClassAbilities(robot.robotClass);
  const opponentAbilities = getClassAbilities(opponent.robotClass);

  s.battle = {
    phase: "active",
    round: 1,
    player: {
      name: robot.name,
      hp: robot.stats.hp,
      maxHp: robot.stats.maxHp,
      attack: robot.stats.attack,
      defense: robot.stats.defense,
      speed: robot.stats.speed,
      critRate: robot.stats.critRate,
      icon: robot.icon,
      abilities,
    },
    opponent: {
      name: opponent.name,
      hp: opponent.stats.hp,
      maxHp: opponent.stats.maxHp,
      attack: opponent.stats.attack,
      defense: opponent.stats.defense,
      speed: opponent.stats.speed,
      critRate: opponent.stats.critRate,
      icon: opponent.icon,
      abilities: opponentAbilities,
    },
    log: [{ round: 1, actor: "System", action: "start", target: "", damage: 0, healing: 0, message: `⚔️ Battle begins! ${robot.name} vs ${opponent.name}!` }],
    comboCount: 0,
    playerDefending: false,
    opponentDefending: false,
    reward: { scrap: 10 + opponent.level * 5, xp: 20 + opponent.level * 5, blueprint: Math.random() < 0.2 ? PARTS_CATALOG[Math.floor(Math.random() * PARTS_CATALOG.length)].id : null },
  };

  return deepClone(s.battle);
}

export function rbAttack(): BattleState {
  const s = ensureInit();
  if (s.battle.phase !== "active") return deepClone(s.battle);
  s.playerDefending = false;

  const entry = executeBattleAction(s.battle.player, s.battle.opponent, true, "attack", null, s.battle);
  s.battle.log.push(entry);

  if (s.battle.opponent.hp <= 0) {
    finishBattle(s, "victory");
    return deepClone(s.battle);
  }

  // AI turn
  s.opponentDefending = false;
  const aiDecision = aiChooseAction(s.battle.opponent, s.battle.player.hp, s.battle.opponent.hp);
  const aiEntry = executeBattleAction(s.battle.opponent, s.battle.player, false, aiDecision.action, aiDecision.abilityId, s.battle);
  s.battle.log.push(aiEntry);

  if (s.battle.player.hp <= 0) {
    finishBattle(s, "defeat");
    return deepClone(s.battle);
  }

  // Tick cooldowns
  tickCooldowns(s);
  s.battle.round++;
  return deepClone(s.battle);
}

export function rbDefend(): BattleState {
  const s = ensureInit();
  if (s.battle.phase !== "active") return deepClone(s.battle);

  const entry = executeBattleAction(s.battle.player, s.battle.opponent, true, "defend", null, s.battle);
  s.battle.log.push(entry);
  s.battle.comboCount = 0;

  // AI turn
  s.opponentDefending = false;
  const aiDecision = aiChooseAction(s.battle.opponent, s.battle.player.hp, s.battle.opponent.hp);
  const aiEntry = executeBattleAction(s.battle.opponent, s.battle.player, false, aiDecision.action, aiDecision.abilityId, s.battle);
  s.battle.log.push(aiEntry);

  if (s.battle.player.hp <= 0) {
    finishBattle(s, "defeat");
    return deepClone(s.battle);
  }

  tickCooldowns(s);
  s.battle.round++;
  return deepClone(s.battle);
}

export function rbUseAbility(abilityId: string): BattleState {
  const s = ensureInit();
  if (s.battle.phase !== "active") return deepClone(s.battle);

  const ability = s.battle.player.abilities.find(a => a.id === abilityId);
  if (!ability || ability.currentCooldown > 0) return deepClone(s.battle);

  s.playerDefending = false;
  const entry = executeBattleAction(s.battle.player, s.battle.opponent, true, "ability", abilityId, s.battle);
  s.battle.log.push(entry);

  // Handle abilities that deal damage
  if (entry.damage > 0 && s.battle.opponent.hp <= 0) {
    finishBattle(s, "victory");
    return deepClone(s.battle);
  }

  // AI turn
  s.opponentDefending = false;
  const aiDecision = aiChooseAction(s.battle.opponent, s.battle.player.hp, s.battle.opponent.hp);
  const aiEntry = executeBattleAction(s.battle.opponent, s.battle.player, false, aiDecision.action, aiDecision.abilityId, s.battle);
  s.battle.log.push(aiEntry);

  if (s.battle.player.hp <= 0) {
    finishBattle(s, "defeat");
    return deepClone(s.battle);
  }

  tickCooldowns(s);
  s.battle.round++;
  return deepClone(s.battle);
}

export function rbGetBattleState(): BattleState {
  return deepClone(ensureInit().battle);
}

export function rbGetBattleLog(): BattleLogEntry[] {
  return deepClone(ensureInit().battle.log);
}

export function rbEndBattle(): BattleState {
  const s = ensureInit();
  if (s.battle.phase === "active") {
    finishBattle(s, "defeat");
  }
  return deepClone(s.battle);
}

export function rbGetBattleHistory(): Array<{ opponent: string; result: "win" | "loss"; rounds: number; scrap: number; date: string }> {
  return deepClone(ensureInit().battleHistory);
}

export function rbGetWinStreak(): { current: number; longest: number } {
  const s = ensureInit();
  return { current: s.daily.streak, longest: s.daily.longestStreak };
}

// ── Daily ──

export function rbGetDailyBlueprint(): Part | null {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  const template = PARTS_CATALOG.find(p => p.id === s.daily.blueprintId);
  return template ? deepClone(template) : null;
}

export function rbGetDailyChallenge(): { opponent: AIOpponent | null; completed: boolean; rewards: { scrap: number; xp: number; blueprint: string | null } } {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  const opponent = AI_OPPONENTS.find(o => o.id === s.daily.challengeOpponentId) ?? null;
  return {
    opponent: opponent ? deepClone(opponent) : null,
    completed: s.daily.challengeCompleted,
    rewards: deepClone(s.daily.challengeRewards),
  };
}

export function rbCompleteDailyChallenge(): { success: boolean; rewards: { scrap: number; xp: number; blueprint: string | null } } {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  if (s.daily.challengeCompleted) return { success: false, rewards: { scrap: 0, xp: 0, blueprint: null } };
  s.daily.challengeCompleted = true;
  s.scrap += s.daily.challengeRewards.scrap;
  rbAddFactoryXP(s.daily.challengeRewards.xp);
  if (s.daily.challengeRewards.blueprint) {
    rbAddPart(s.daily.challengeRewards.blueprint);
  }
  // Track daily completion for achievement
  const achIdx = s.achievements.findIndex(a => a.id === "ach_14");
  if (achIdx >= 0) s.achievements[achIdx].progress++;
  return { success: true, rewards: deepClone(s.daily.challengeRewards) };
}

export function rbGetTournament(): TournamentData {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  return deepClone(s.tournament);
}

export function rbGetTournamentProgress(): { day: number; wins: number; totalDays: number; leaderboard: Array<{ name: string; wins: number; icon: string }> } {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  return {
    day: s.tournament.day,
    wins: s.tournament.wins,
    totalDays: 7,
    leaderboard: deepClone(s.tournament.leaderboard),
  };
}

// ── Scrap ──

export function rbDismantlePart(instanceId: string): { scrap: number; success: boolean } {
  const s = ensureInit();
  const idx = s.inventory.findIndex(p => p.id === instanceId);
  if (idx === -1) return { scrap: 0, success: false };
  const part = s.inventory[idx];
  const recoveryMult = 1 + s.factory.workshopUpgrades.scrapRecovery * 0.15;
  const scrapGain = Math.round(RARITY_SCRAP_VALUE[part.rarity] * recoveryMult * (1 + part.enhancement * 0.2));
  s.scrap += scrapGain;
  s.inventory.splice(idx, 1);
  return { scrap: scrapGain, success: true };
}

export function rbGetScrapCount(): number {
  return ensureInit().scrap;
}

export function rbSpendScrap(amount: number): boolean {
  const s = ensureInit();
  if (s.scrap < amount) return false;
  s.scrap -= amount;
  return true;
}

export function rbForgeCost(partId: string): number {
  const part = PARTS_CATALOG.find(p => p.id === partId);
  if (!part) return Infinity;
  return Math.round(RARITY_SCRAP_VALUE[part.rarity] * 3);
}

export function rbForgePart(partId: string): Part | null {
  const s = ensureInit();
  if (s.inventory.length >= MAX_INVENTORY) return null;
  const template = PARTS_CATALOG.find(p => p.id === partId);
  if (!template) return null;
  if (!s.factory.unlockedPartIds.includes(partId)) return null;
  const cost = rbForgeCost(partId);
  if (s.scrap < cost) return null;
  s.scrap -= cost;
  return rbAddPart(partId);
}

export function rbEnhanceCost(currentLevel: number, rarity: Rarity): number {
  return Math.round((10 + currentLevel * 8) * RARITY_MULT[rarity]);
}

export function rbEnhancePart(instanceId: string): { success: boolean; newLevel: number; cost: number } {
  const s = ensureInit();
  const part = s.inventory.find(p => p.id === instanceId);
  if (!part || part.enhancement >= MAX_ENHANCEMENT) return { success: false, newLevel: part?.enhancement ?? 0, cost: 0 };
  const cost = rbEnhanceCost(part.enhancement, part.rarity);
  if (s.scrap < cost) return { success: false, newLevel: part.enhancement, cost };
  s.scrap -= cost;
  part.enhancement++;
  // Also update on equipped robots
  for (const robot of s.robots) {
    for (const type of ["head", "body", "arms", "legs", "core", "weapon"] as PartType[]) {
      if (robot.parts[type]?.id === instanceId) {
        robot.parts[type]!.enhancement = part.enhancement;
        robot.stats = computeRobotStats(robot);
      }
    }
  }
  updateAchievements(s);
  return { success: true, newLevel: part.enhancement, cost };
}

export function rbFuseCost(rarity: Rarity): number {
  return Math.round(RARITY_SCRAP_VALUE[rarity] * 5 * RARITY_MULT[rarity]);
}

export function rbFuseParts(instanceIds: string[]): { success: boolean; newPart: Part | null; cost: number } {
  const s = ensureInit();
  if (s.inventory.length >= MAX_INVENTORY) return { success: false, newPart: null, cost: 0 };
  if (instanceIds.length !== 3) return { success: false, newPart: null, cost: 0 };

  const parts = instanceIds.map(id => s.inventory.find(p => p.id === id)).filter((p): p is Part => p !== undefined);
  if (parts.length !== 3) return { success: false, newPart: null, cost: 0 };

  const firstRarity = parts[0].rarity;
  if (!parts.every(p => p.rarity === firstRarity)) return { success: false, newPart: null, cost: 0 };
  if (RARITY_ORDER.indexOf(firstRarity) >= RARITY_ORDER.length - 1) return { success: false, newPart: null, cost: 0 };

  const cost = rbFuseCost(firstRarity);
  if (s.scrap < cost) return { success: false, newPart: null, cost };

  const nextRarity = RARITY_ORDER[RARITY_ORDER.indexOf(firstRarity) + 1];
  // Find a random part of next rarity of same type
  const candidates = PARTS_CATALOG.filter(p => p.rarity === nextRarity && p.type === parts[0].type);
  if (candidates.length === 0) return { success: false, newPart: null, cost: 0 };

  s.scrap -= cost;
  // Remove the 3 parts
  for (const id of instanceIds) {
    const idx = s.inventory.findIndex(p => p.id === id);
    if (idx >= 0) s.inventory.splice(idx, 1);
  }
  // Create the new part
  const template = candidates[Math.floor(Math.random() * candidates.length)];
  const newPart: Part = deepClone(template);
  newPart.id = generateId() + "_" + newPart.id;
  s.inventory.push(newPart);

  // Track fusion count for achievement
  const achIdx = s.achievements.findIndex(a => a.id === "ach_08");
  if (achIdx >= 0) s.achievements[achIdx].progress++;

  return { success: true, newPart: deepClone(newPart), cost };
}

// ── UI Helpers ──

export function rbGetStatsGrid(): Array<{ label: string; value: number | string; icon: string; color: string }> {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  return [
    { label: "Factory Level", value: s.factory.level, icon: "🏭", color: "#F59E0B" },
    { label: "Robots Built", value: s.factory.robotsBuilt, icon: "🤖", color: "#3B82F6" },
    { label: "Arena Wins", value: s.factory.battlesWon, icon: "⚔️", color: "#22C55E" },
    { label: "Scrap", value: s.scrap, icon: "🔩", color: "#A855F7" },
  ];
}

export function rbGetPartCard(part: Part): {
  name: string;
  type: string;
  rarity: string;
  rarityColor: string;
  stats: PartStats;
  enhancement: number;
  icon: string;
  description: string;
  robotClass: string;
  classIcon: string;
} {
  return {
    name: part.name,
    type: part.type.charAt(0).toUpperCase() + part.type.slice(1),
    rarity: part.rarity.charAt(0).toUpperCase() + part.rarity.slice(1),
    rarityColor: RARITY_COLORS[part.rarity],
    stats: deepClone(part.stats),
    enhancement: part.enhancement,
    icon: PART_ICONS[part.type],
    description: part.description,
    robotClass: CLASS_LABELS[part.robotClass],
    classIcon: CLASS_ICONS[part.robotClass],
  };
}

export function rbGetRobotCard(robot: Robot): {
  name: string;
  robotClass: string;
  classIcon: string;
  level: number;
  stats: RobotStats;
  parts: Record<PartType, Part | null>;
  icon: string;
  wins: number;
  losses: number;
  winRate: string;
} {
  const total = robot.wins + robot.losses;
  const winRate = total > 0 ? `${Math.round((robot.wins / total) * 100)}%` : "N/A";
  return {
    name: robot.name,
    robotClass: CLASS_LABELS[robot.robotClass],
    classIcon: robot.icon,
    level: robot.level,
    stats: deepClone(robot.stats),
    parts: deepClone(robot.parts),
    icon: robot.icon,
    wins: robot.wins,
    losses: robot.losses,
    winRate,
  };
}

export function rbGetOpponentCard(opponent: AIOpponent): {
  name: string;
  level: number;
  robotClass: string;
  classIcon: string;
  stats: RobotStats;
  icon: string;
  difficulty: string;
  difficultyColor: string;
} {
  let difficulty: string;
  let difficultyColor: string;
  if (opponent.level <= 5) { difficulty = "Easy"; difficultyColor = "#22C55E"; }
  else if (opponent.level <= 10) { difficulty = "Medium"; difficultyColor = "#F59E0B"; }
  else if (opponent.level <= 15) { difficulty = "Hard"; difficultyColor = "#EF4444"; }
  else { difficulty = "Extreme"; difficultyColor = "#A855F7"; }
  return {
    name: opponent.name,
    level: opponent.level,
    robotClass: CLASS_LABELS[opponent.robotClass],
    classIcon: CLASS_ICONS[opponent.robotClass],
    stats: deepClone(opponent.stats),
    icon: opponent.icon,
    difficulty,
    difficultyColor,
  };
}

export function rbGetBattleCard(battle: BattleState): {
  player: { name: string; hp: number; maxHp: number; icon: string; hpPercent: number };
  opponent: { name: string; hp: number; maxHp: number; icon: string; hpPercent: number };
  round: number;
  phase: string;
  phaseIcon: string;
  combo: number;
  log: BattleLogEntry[];
  abilities: Array<{ id: string; name: string; icon: string; cooldown: number; ready: boolean }>;
  actions: Array<{ id: string; label: string; icon: string; disabled: boolean }>;
} {
  const playerHpPct = battle.player.maxHp > 0 ? Math.round((battle.player.hp / battle.player.maxHp) * 100) : 0;
  const opponentHpPct = battle.opponent.maxHp > 0 ? Math.round((battle.opponent.hp / battle.opponent.maxHp) * 100) : 0;
  const phaseIcons: Record<string, string> = { idle: "💤", active: "⚔️", victory: "🏆", defeat: "💀" };
  const isActive = battle.phase === "active";
  return {
    player: { name: battle.player.name, hp: battle.player.hp, maxHp: battle.player.maxHp, icon: battle.player.icon, hpPercent: playerHpPct },
    opponent: { name: battle.opponent.name, hp: battle.opponent.hp, maxHp: battle.opponent.maxHp, icon: battle.opponent.icon, hpPercent: opponentHpPct },
    round: battle.round,
    phase: battle.phase,
    phaseIcon: phaseIcons[battle.phase] ?? "❓",
    combo: battle.comboCount,
    log: deepClone(battle.log),
    abilities: battle.player.abilities.map(a => ({
      id: a.id, name: a.name, icon: a.icon, cooldown: a.currentCooldown, ready: a.currentCooldown === 0,
    })),
    actions: [
      { id: "attack", label: "Attack", icon: "⚔️", disabled: !isActive },
      { id: "defend", label: "Defend", icon: "🛡️", disabled: !isActive },
      { id: "ability", label: "Ability", icon: "✨", disabled: !isActive || battle.player.abilities.every(a => a.currentCooldown > 0) },
    ],
  };
}

export function rbGetDailyCard(): {
  blueprint: { part: Part | null; icon: string };
  challenge: { opponent: AIOpponent | null; completed: boolean; rewards: { scrap: number; xp: number } };
  streak: { current: number; longest: number; milestone: string };
  tournament: { day: number; wins: number; position: number; totalDays: number };
} {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  const bp = PARTS_CATALOG.find(p => p.id === s.daily.blueprintId) ?? null;
  const opp = AI_OPPONENTS.find(o => o.id === s.daily.challengeOpponentId) ?? null;
  let milestone = "Keep battling!";
  if (s.daily.streak >= 10) milestone = "🔥 On fire!";
  else if (s.daily.streak >= 7) milestone = "⚡ Hot streak!";
  else if (s.daily.streak >= 5) milestone = "🌟 Nice streak!";
  else if (s.daily.streak >= 3) milestone = "✨ Building momentum!";
  const position = [...s.tournament.leaderboard, { name: "You", wins: s.tournament.wins, icon: "👤" }]
    .sort((a, b) => b.wins - a.wins)
    .findIndex(e => e.name === "You") + 1;
  return {
    blueprint: { part: bp ? deepClone(bp) : null, icon: "📐" },
    challenge: { opponent: opp ? deepClone(opp) : null, completed: s.daily.challengeCompleted, rewards: { scrap: s.daily.challengeRewards.scrap, xp: s.daily.challengeRewards.xp } },
    streak: { current: s.daily.streak, longest: s.daily.longestStreak, milestone },
    tournament: { day: s.tournament.day, wins: s.tournament.wins, position, totalDays: 7 },
  };
}

export function rbGetAchievements(): Array<{
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  percent: number;
  unlocked: boolean;
}> {
  const s = ensureInit();
  updateAchievements(s);
  return s.achievements.map(a => ({
    ...deepClone(a),
    percent: a.target > 0 ? Math.min(100, Math.round((a.progress / a.target) * 100)) : 0,
  }));
}

export function rbCheckAchievements(): Array<{ id: string; name: string; icon: string; newlyUnlocked: boolean }> {
  const s = ensureInit();
  const prev = deepClone(s.achievements);
  updateAchievements(s);
  return s.achievements.map((a, i) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    newlyUnlocked: a.unlocked && !prev[i].unlocked,
  }));
}

export function rbGetFactoryOverview(): {
  factory: FactoryData;
  robotCount: number;
  partCount: number;
  scrap: number;
  winRate: string;
  streak: { current: number; longest: number };
  achievementsUnlocked: number;
  achievementsTotal: number;
  tournamentDay: number;
  tournamentPosition: number;
} {
  const s = ensureInit();
  refreshDailyIfNeeded(s);
  updateAchievements(s);
  const total = s.factory.battlesWon + s.factory.battlesLost;
  const winRate = total > 0 ? `${Math.round((s.factory.battlesWon / total) * 100)}%` : "N/A";
  const unlockedAch = s.achievements.filter(a => a.unlocked).length;
  const position = [...s.tournament.leaderboard, { name: "You", wins: s.tournament.wins, icon: "👤" }]
    .sort((a, b) => b.wins - a.wins)
    .findIndex(e => e.name === "You") + 1;
  return {
    factory: deepClone(s.factory),
    robotCount: s.robots.length,
    partCount: s.inventory.length,
    scrap: s.scrap,
    winRate,
    streak: { current: s.daily.streak, longest: s.daily.longestStreak },
    achievementsUnlocked: unlockedAch,
    achievementsTotal: s.achievements.length,
    tournamentDay: s.tournament.day,
    tournamentPosition: position,
  };
}

export function rbGetFactoryDashboard(): {
  statsGrid: ReturnType<typeof rbGetStatsGrid>;
  activeRobot: Robot | null;
  recentBattles: Array<{ opponent: string; result: string; rounds: number; icon: string }>;
  dailyInfo: ReturnType<typeof rbGetDailyCard>;
  quickActions: Array<{ id: string; label: string; icon: string; available: boolean }>;
} {
  const s = ensureInit();
  const activeRobot = s.robots.find(r => r.id === s.activeRobotId) ?? null;
  const recentBattles = s.battleHistory.slice(-5).reverse().map(b => ({
    opponent: b.opponent,
    result: b.result === "win" ? "🏆 Win" : "💀 Loss",
    rounds: b.rounds,
    icon: b.result === "win" ? "✅" : "❌",
  }));
  return {
    statsGrid: rbGetStatsGrid(),
    activeRobot: activeRobot ? deepClone(activeRobot) : null,
    recentBattles,
    dailyInfo: rbGetDailyCard(),
    quickActions: [
      { id: "build", label: "Build Robot", icon: "🔧", available: s.inventory.length >= 6 },
      { id: "battle", label: "Enter Arena", icon: "⚔️", available: s.robots.length > 0 && s.battle.phase === "idle" },
      { id: "forge", label: "Forge Part", icon: "🔨", available: s.scrap >= 15 },
      { id: "daily", label: "Daily Challenge", icon: "📅", available: !s.daily.challengeCompleted },
      { id: "enhance", label: "Enhance Part", icon: "⬆️", available: s.inventory.some(p => p.enhancement < MAX_ENHANCEMENT && s.scrap >= rbEnhanceCost(p.enhancement, p.rarity)) },
      { id: "fuse", label: "Fuse Parts", icon: "🔮", available: s.inventory.length >= 3 },
    ],
  };
}

// ---------------------------------------------------------------------------
// Internal battle finish
// ---------------------------------------------------------------------------

function finishBattle(s: RobotFactoryState, result: "victory" | "defeat"): void {
  s.battle.phase = result;
  const isWin = result === "victory";
  const streakMult = isWin ? rollWinStreakBonus(s.daily.streak + 1) : 1;

  if (isWin) {
    s.factory.battlesWon++;
    s.daily.streak++;
    if (s.daily.streak > s.daily.longestStreak) s.daily.longestStreak = s.daily.streak;
    s.tournament.wins++;
    const scrapReward = Math.round(s.battle.reward.scrap * streakMult);
    s.scrap += scrapReward;
    s.battle.reward.scrap = scrapReward;
    rbAddFactoryXP(s.battle.reward.xp);
    if (s.battle.reward.blueprint) rbAddPart(s.battle.reward.blueprint);
    s.battle.log.push({
      round: s.battle.round, actor: "System", action: "result",
      target: "", damage: 0, healing: 0,
      message: `🏆 Victory! +${scrapReward} scrap, +${s.battle.reward.xp} XP${streakMult > 1 ? ` (x${streakMult} streak bonus!)` : ""}`,
    });
  } else {
    s.factory.battlesLost++;
    s.daily.streak = 0;
    s.battle.log.push({
      round: s.battle.round, actor: "System", action: "result",
      target: "", damage: 0, healing: 0,
      message: `💀 Defeat! Streak reset. Keep building and try again!`,
    });
  }

  s.daily.lastBattleDate = todayStr();
  s.battleHistory.push({
    opponent: s.battle.opponent.name,
    result: isWin ? "win" : "loss",
    rounds: s.battle.round,
    scrap: isWin ? s.battle.reward.scrap : 0,
    date: todayStr(),
  });

  // Update active robot wins/losses
  if (s.activeRobotId) {
    const robot = s.robots.find(r => r.id === s.activeRobotId);
    if (robot) {
      if (isWin) { robot.wins++; robot.xp += s.battle.reward.xp; }
      else { robot.losses++; }
    }
  }

  updateAchievements(s);
}

function tickCooldowns(s: RobotFactoryState): void {
  for (const ability of s.battle.player.abilities) {
    if (ability.currentCooldown > 0) ability.currentCooldown--;
  }
  for (const ability of s.battle.opponent.abilities) {
    if (ability.currentCooldown > 0) ability.currentCooldown--;
  }
}
