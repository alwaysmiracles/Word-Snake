// =============================================================================
// Skill Tree Wire — Word Snake Game
// =============================================================================
// Standalone functions for managing a 4-branch skill tree with localStorage
// persistence. 32 skills (8 per branch), each with 3 upgrade levels.
// Storage key: ws_skill_tree_wire
// =============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkillEffect {
  scoreMultiplier: number;
  speedBonus: number;
  comboBonus: number;
  shieldDuration: number;
  extraLives: number;
  timeSlow: number;
  hintCount: number;
  xpBoost: number;
  coinBoost: number;
  wordPowerBonus: number;
  chainBonus: number;
  accuracyBonus: number;
  damageReduction: number;
  energySaving: number;
  dropChanceBonus: number;
}

export interface Skill {
  id: string;
  branchId: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  maxLevel: number;
  unlocked: boolean;
  active: boolean;
  prerequisites: string[];
  costs: number[];
  effects: SkillEffect[];
}

export interface Branch {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  skills: Skill[];
}

export interface BuildPreset {
  id: string;
  name: string;
  activeSkills: string[];
  timestamp: number;
}

export interface SkillTreeState {
  skillPoints: number;
  totalEarned: number;
  totalSpent: number;
  skills: Record<string, { level: number; unlocked: boolean; active: boolean }>;
  activeSlotsMax: number;
  gems: number;
  presets: BuildPreset[];
  initialized: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = "ws_skill_tree_wire";

const MAX_ACTIVE_SLOTS = 6;

const RESPEC_BASE_COST = 50;

// ---------------------------------------------------------------------------
// Default Skill Definitions (blueprint, not state)
// ---------------------------------------------------------------------------

interface SkillBlueprint {
  id: string;
  branchId: string;
  name: string;
  description: string;
  icon: string;
  maxLevel: number;
  prerequisites: string[];
  costs: number[];
  effects: SkillEffect[];
}

const SKILL_BLUEPRINTS: SkillBlueprint[] = [
  // ─── OFFENSE BRANCH ──────────────────────────────────────────────────────
  {
    id: "off_quick_strike",
    branchId: "offense",
    name: "Quick Strike",
    description: "Boost your snake's movement speed to collect words faster.",
    icon: "⚡",
    maxLevel: 3,
    prerequisites: [],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0.08, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0.16, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0.25, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_score_surge",
    branchId: "offense",
    name: "Score Surge",
    description: "Increase the base score multiplier for every word collected.",
    icon: "🔥",
    maxLevel: 3,
    prerequisites: ["off_quick_strike"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0.1, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.2, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.35, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_combo_frenzy",
    branchId: "offense",
    name: "Combo Frenzy",
    description: "Amplify the bonus earned from consecutive word combos.",
    icon: "💥",
    maxLevel: 3,
    prerequisites: ["off_quick_strike"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0.15, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0.3, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0.5, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_swift_words",
    branchId: "offense",
    name: "Swift Words",
    description: "Words appear and register faster, reducing input delay.",
    icon: "💨",
    maxLevel: 3,
    prerequisites: ["off_score_surge"],
    costs: [1, 2, 4],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0.05, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0.1, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.1, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0.15, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.15, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_critical_score",
    branchId: "offense",
    name: "Critical Score",
    description: "Chance to deal a critical score hit worth double points.",
    icon: "🎯",
    maxLevel: 3,
    prerequisites: ["off_combo_frenzy"],
    costs: [2, 3, 4],
    effects: [
      { scoreMultiplier: 0.15, speedBonus: 0, comboBonus: 0.1, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.25, speedBonus: 0, comboBonus: 0.15, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.4, speedBonus: 0, comboBonus: 0.25, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_chain_lightning",
    branchId: "offense",
    name: "Chain Lightning",
    description: "Chained words grant escalating score bonuses.",
    icon: "🔗",
    maxLevel: 3,
    prerequisites: ["off_swift_words", "off_score_surge"],
    costs: [2, 3, 5],
    effects: [
      { scoreMultiplier: 0.1, speedBonus: 0, comboBonus: 0.05, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.2, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.15, speedBonus: 0, comboBonus: 0.1, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.35, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.2, speedBonus: 0, comboBonus: 0.15, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.5, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_adrenaline_rush",
    branchId: "offense",
    name: "Adrenaline Rush",
    description: "Periodically enter a burst mode with massive speed and score gains.",
    icon: "🚀",
    maxLevel: 3,
    prerequisites: ["off_critical_score", "off_combo_frenzy"],
    costs: [3, 4, 5],
    effects: [
      { scoreMultiplier: 0.2, speedBonus: 0.15, comboBonus: 0.1, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.1, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.35, speedBonus: 0.25, comboBonus: 0.2, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.15, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.5, speedBonus: 0.35, comboBonus: 0.3, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.25, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "off_word_storm",
    branchId: "offense",
    name: "Word Storm",
    description: "The ultimate offensive skill — unleash a devastating score multiplier.",
    icon: "🌪️",
    maxLevel: 3,
    prerequisites: ["off_chain_lightning", "off_adrenaline_rush"],
    costs: [4, 5, 6],
    effects: [
      { scoreMultiplier: 0.3, speedBonus: 0.1, comboBonus: 0.2, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.05, coinBoost: 0.1, wordPowerBonus: 0.1, chainBonus: 0.3, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.5, speedBonus: 0.15, comboBonus: 0.35, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0.15, wordPowerBonus: 0.15, chainBonus: 0.45, accuracyBonus: 0.08, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.75, speedBonus: 0.2, comboBonus: 0.5, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.15, coinBoost: 0.2, wordPowerBonus: 0.2, chainBonus: 0.65, accuracyBonus: 0.1, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.05 },
    ],
  },

  // ─── DEFENSE BRANCH ─────────────────────────────────────────────────────
  {
    id: "def_shield_wall",
    branchId: "defense",
    name: "Shield Wall",
    description: "Extend the duration of protective shields.",
    icon: "🛡️",
    maxLevel: 3,
    prerequisites: [],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 2, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 4, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 6, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_extra_life",
    branchId: "defense",
    name: "Extra Life",
    description: "Gain an additional life each round.",
    icon: "❤️",
    maxLevel: 3,
    prerequisites: ["def_shield_wall"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 1, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 2, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 3, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_time_warp",
    branchId: "defense",
    name: "Time Warp",
    description: "Slow down obstacles and hazards temporarily.",
    icon: "⏳",
    maxLevel: 3,
    prerequisites: ["def_shield_wall"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0.1, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0.2, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0.35, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_iron_hide",
    branchId: "defense",
    name: "Iron Hide",
    description: "Reduce damage taken from obstacles and collisions.",
    icon: "🪨",
    maxLevel: 3,
    prerequisites: ["def_extra_life"],
    costs: [1, 2, 4],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.1, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.2, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.35, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_phoenix_feather",
    branchId: "defense",
    name: "Phoenix Feather",
    description: "Auto-revive once per round after losing all lives.",
    icon: "🪶",
    maxLevel: 3,
    prerequisites: ["def_time_warp"],
    costs: [2, 3, 4],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 1, extraLives: 1, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.05, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 2, extraLives: 1, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.1, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 3, extraLives: 2, timeSlow: 0.05, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.15, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_barrier_mastery",
    branchId: "defense",
    name: "Barrier Mastery",
    description: "Shields become stronger and recharge faster.",
    icon: "🏰",
    maxLevel: 3,
    prerequisites: ["def_iron_hide", "def_extra_life"],
    costs: [2, 3, 5],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 3, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.15, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 5, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.25, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 8, extraLives: 1, timeSlow: 0.05, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.35, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "def_time_dilation",
    branchId: "defense",
    name: "Time Dilation",
    description: "Power-up durations are significantly extended.",
    icon: "🕰️",
    maxLevel: 3,
    prerequisites: ["def_phoenix_feather", "def_time_warp"],
    costs: [3, 4, 5],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 2, extraLives: 0, timeSlow: 0.15, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.1, energySaving: 0.05, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 3, extraLives: 1, timeSlow: 0.25, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.15, energySaving: 0.1, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 5, extraLives: 1, timeSlow: 0.4, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.2, energySaving: 0.15, dropChanceBonus: 0.05 },
    ],
  },
  {
    id: "def_fortitude",
    branchId: "defense",
    name: "Fortitude",
    description: "The ultimate defensive skill — near-invulnerability for short periods.",
    icon: "🏔️",
    maxLevel: 3,
    prerequisites: ["def_barrier_mastery", "def_time_dilation"],
    costs: [4, 5, 6],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 5, extraLives: 2, timeSlow: 0.1, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.25, energySaving: 0.05, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0.05, speedBonus: 0, comboBonus: 0, shieldDuration: 8, extraLives: 3, timeSlow: 0.15, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0.35, energySaving: 0.1, dropChanceBonus: 0.08 },
      { scoreMultiplier: 0.1, speedBonus: 0, comboBonus: 0.05, shieldDuration: 12, extraLives: 4, timeSlow: 0.2, hintCount: 0, xpBoost: 0.05, coinBoost: 0.05, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.05, damageReduction: 0.5, energySaving: 0.15, dropChanceBonus: 0.1 },
    ],
  },

  // ─── UTILITY BRANCH ─────────────────────────────────────────────────────
  {
    id: "util_word_hint",
    branchId: "utility",
    name: "Word Hint",
    description: "Receive free word hints during gameplay.",
    icon: "💡",
    maxLevel: 3,
    prerequisites: [],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 1, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 2, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 3, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "util_xp_boost",
    branchId: "utility",
    name: "XP Boost",
    description: "Earn bonus experience points from all activities.",
    icon: "✨",
    maxLevel: 3,
    prerequisites: ["util_word_hint"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.2, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.35, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "util_lucky_star",
    branchId: "utility",
    name: "Lucky Star",
    description: "Increase drop rates for power-ups and collectibles.",
    icon: "🍀",
    maxLevel: 3,
    prerequisites: ["util_word_hint"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.1 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.2 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.35 },
    ],
  },
  {
    id: "util_path_finder",
    branchId: "utility",
    name: "Path Finder",
    description: "Reveal upcoming words and obstacle positions.",
    icon: "🗺️",
    maxLevel: 3,
    prerequisites: ["util_xp_boost"],
    costs: [1, 2, 4],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0.03, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 1, xpBoost: 0.05, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0.05, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 2, xpBoost: 0.1, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.08, damageReduction: 0, energySaving: 0.03, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0, speedBonus: 0.08, comboBonus: 0.05, shieldDuration: 0, extraLives: 0, timeSlow: 0.03, hintCount: 3, xpBoost: 0.15, coinBoost: 0.05, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.12, damageReduction: 0, energySaving: 0.05, dropChanceBonus: 0.1 },
    ],
  },
  {
    id: "util_gold_rush",
    branchId: "utility",
    name: "Gold Rush",
    description: "Earn bonus coins for every word and action.",
    icon: "💰",
    maxLevel: 3,
    prerequisites: ["util_lucky_star"],
    costs: [2, 3, 4],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0.15, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0.3, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.1 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.05, coinBoost: 0.5, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0.05, dropChanceBonus: 0.15 },
    ],
  },
  {
    id: "util_energy_saver",
    branchId: "utility",
    name: "Energy Saver",
    description: "Reduce energy drain, allowing longer play sessions.",
    icon: "🔋",
    maxLevel: 3,
    prerequisites: ["util_path_finder", "util_xp_boost"],
    costs: [2, 3, 5],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0.1, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.15, coinBoost: 0.05, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0.2, dropChanceBonus: 0.08 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 1, timeSlow: 0.03, hintCount: 1, xpBoost: 0.2, coinBoost: 0.08, wordPowerBonus: 0, chainBonus: 0.05, accuracyBonus: 0.08, damageReduction: 0.03, energySaving: 0.3, dropChanceBonus: 0.12 },
    ],
  },
  {
    id: "util_scout_eye",
    branchId: "utility",
    name: "Scout Eye",
    description: "Preview obstacle patterns and dangerous zones.",
    icon: "🔭",
    maxLevel: 3,
    prerequisites: ["util_gold_rush", "util_lucky_star"],
    costs: [3, 4, 5],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0.03, comboBonus: 0, shieldDuration: 1, extraLives: 0, timeSlow: 0.05, hintCount: 1, xpBoost: 0.05, coinBoost: 0.1, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0.08, damageReduction: 0.05, energySaving: 0.05, dropChanceBonus: 0.1 },
      { scoreMultiplier: 0, speedBonus: 0.05, comboBonus: 0.03, shieldDuration: 2, extraLives: 0, timeSlow: 0.1, hintCount: 2, xpBoost: 0.1, coinBoost: 0.15, wordPowerBonus: 0, chainBonus: 0.05, accuracyBonus: 0.12, damageReduction: 0.08, energySaving: 0.08, dropChanceBonus: 0.15 },
      { scoreMultiplier: 0.05, speedBonus: 0.08, comboBonus: 0.05, shieldDuration: 3, extraLives: 1, timeSlow: 0.15, hintCount: 3, xpBoost: 0.15, coinBoost: 0.2, wordPowerBonus: 0.05, chainBonus: 0.08, accuracyBonus: 0.15, damageReduction: 0.1, energySaving: 0.12, dropChanceBonus: 0.2 },
    ],
  },
  {
    id: "util_treasure_hunter",
    branchId: "utility",
    name: "Treasure Hunter",
    description: "The ultimate utility skill — find rare rewards and hidden bonuses.",
    icon: "👑",
    maxLevel: 3,
    prerequisites: ["util_energy_saver", "util_scout_eye"],
    costs: [4, 5, 6],
    effects: [
      { scoreMultiplier: 0.05, speedBonus: 0.05, comboBonus: 0.05, shieldDuration: 1, extraLives: 1, timeSlow: 0.05, hintCount: 2, xpBoost: 0.15, coinBoost: 0.2, wordPowerBonus: 0.05, chainBonus: 0.05, accuracyBonus: 0.1, damageReduction: 0.05, energySaving: 0.1, dropChanceBonus: 0.2 },
      { scoreMultiplier: 0.1, speedBonus: 0.08, comboBonus: 0.1, shieldDuration: 2, extraLives: 1, timeSlow: 0.1, hintCount: 3, xpBoost: 0.25, coinBoost: 0.3, wordPowerBonus: 0.08, chainBonus: 0.08, accuracyBonus: 0.12, damageReduction: 0.08, energySaving: 0.15, dropChanceBonus: 0.3 },
      { scoreMultiplier: 0.15, speedBonus: 0.12, comboBonus: 0.15, shieldDuration: 3, extraLives: 2, timeSlow: 0.15, hintCount: 4, xpBoost: 0.35, coinBoost: 0.45, wordPowerBonus: 0.12, chainBonus: 0.12, accuracyBonus: 0.15, damageReduction: 0.12, energySaving: 0.2, dropChanceBonus: 0.4 },
    ],
  },

  // ─── MASTERY BRANCH ─────────────────────────────────────────────────────
  {
    id: "mst_word_power",
    branchId: "mastery",
    name: "Word Power",
    description: "Longer words grant increasingly powerful bonuses.",
    icon: "📖",
    maxLevel: 3,
    prerequisites: [],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0.1, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0.2, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0.35, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "mst_score_multiplier",
    branchId: "mastery",
    name: "Score Multiplier",
    description: "A global score multiplier applied to all points earned.",
    icon: "✖️",
    maxLevel: 3,
    prerequisites: ["mst_word_power"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0.15, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.3, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.5, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
    ],
  },
  {
    id: "mst_chain_master",
    branchId: "mastery",
    name: "Chain Master",
    description: "Word chains of increasing length yield multiplied rewards.",
    icon: "🔗",
    maxLevel: 3,
    prerequisites: ["mst_word_power"],
    costs: [1, 2, 3],
    effects: [
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0.1, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.15, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0, speedBonus: 0, comboBonus: 0.15, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0, wordPowerBonus: 0, chainBonus: 0.3, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.05, speedBonus: 0, comboBonus: 0.2, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0, coinBoost: 0.05, wordPowerBonus: 0.05, chainBonus: 0.5, accuracyBonus: 0, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.05 },
    ],
  },
  {
    id: "mst_precision",
    branchId: "mastery",
    name: "Precision",
    description: "Higher accuracy yields increasingly valuable score bonuses.",
    icon: "🎯",
    maxLevel: 3,
    prerequisites: ["mst_score_multiplier"],
    costs: [1, 2, 4],
    effects: [
      { scoreMultiplier: 0.1, speedBonus: 0, comboBonus: 0, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.05, coinBoost: 0, wordPowerBonus: 0.05, chainBonus: 0, accuracyBonus: 0.15, damageReduction: 0, energySaving: 0, dropChanceBonus: 0 },
      { scoreMultiplier: 0.15, speedBonus: 0, comboBonus: 0.05, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0.05, wordPowerBonus: 0.08, chainBonus: 0.05, accuracyBonus: 0.25, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.03 },
      { scoreMultiplier: 0.2, speedBonus: 0.03, comboBonus: 0.08, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.15, coinBoost: 0.08, wordPowerBonus: 0.12, chainBonus: 0.08, accuracyBonus: 0.4, damageReduction: 0.03, energySaving: 0.03, dropChanceBonus: 0.05 },
    ],
  },
  {
    id: "mst_vocabulary_sage",
    branchId: "mastery",
    name: "Vocabulary Sage",
    description: "Using rare or difficult words grants substantial bonuses.",
    icon: "🧠",
    maxLevel: 3,
    prerequisites: ["mst_chain_master"],
    costs: [2, 3, 4],
    effects: [
      { scoreMultiplier: 0.1, speedBonus: 0, comboBonus: 0.05, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0.05, wordPowerBonus: 0.15, chainBonus: 0.1, accuracyBonus: 0.05, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0.15, speedBonus: 0.03, comboBonus: 0.08, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 1, xpBoost: 0.15, coinBoost: 0.1, wordPowerBonus: 0.25, chainBonus: 0.15, accuracyBonus: 0.08, damageReduction: 0, energySaving: 0.03, dropChanceBonus: 0.08 },
      { scoreMultiplier: 0.25, speedBonus: 0.05, comboBonus: 0.12, shieldDuration: 0, extraLives: 1, timeSlow: 0.03, hintCount: 1, xpBoost: 0.2, coinBoost: 0.15, wordPowerBonus: 0.35, chainBonus: 0.2, accuracyBonus: 0.12, damageReduction: 0.03, energySaving: 0.05, dropChanceBonus: 0.12 },
    ],
  },
  {
    id: "mst_perfect_chain",
    branchId: "mastery",
    name: "Perfect Chain",
    description: "Flawless consecutive words without errors trigger massive bonuses.",
    icon: "💎",
    maxLevel: 3,
    prerequisites: ["mst_precision", "mst_score_multiplier"],
    costs: [2, 3, 5],
    effects: [
      { scoreMultiplier: 0.2, speedBonus: 0.05, comboBonus: 0.15, shieldDuration: 0, extraLives: 0, timeSlow: 0, hintCount: 0, xpBoost: 0.1, coinBoost: 0.08, wordPowerBonus: 0.1, chainBonus: 0.25, accuracyBonus: 0.2, damageReduction: 0, energySaving: 0, dropChanceBonus: 0.05 },
      { scoreMultiplier: 0.3, speedBonus: 0.08, comboBonus: 0.25, shieldDuration: 1, extraLives: 0, timeSlow: 0.03, hintCount: 0, xpBoost: 0.15, coinBoost: 0.12, wordPowerBonus: 0.15, chainBonus: 0.4, accuracyBonus: 0.3, damageReduction: 0.03, energySaving: 0.03, dropChanceBonus: 0.08 },
      { scoreMultiplier: 0.45, speedBonus: 0.12, comboBonus: 0.35, shieldDuration: 2, extraLives: 1, timeSlow: 0.05, hintCount: 1, xpBoost: 0.2, coinBoost: 0.18, wordPowerBonus: 0.22, chainBonus: 0.55, accuracyBonus: 0.4, damageReduction: 0.05, energySaving: 0.05, dropChanceBonus: 0.12 },
    ],
  },
  {
    id: "mst_grand_master",
    branchId: "mastery",
    name: "Grand Master",
    description: "A slight increase to all skill bonuses — the mark of a true master.",
    icon: "🏅",
    maxLevel: 3,
    prerequisites: ["mst_vocabulary_sage", "mst_chain_master"],
    costs: [3, 4, 5],
    effects: [
      { scoreMultiplier: 0.15, speedBonus: 0.08, comboBonus: 0.1, shieldDuration: 1, extraLives: 1, timeSlow: 0.05, hintCount: 1, xpBoost: 0.12, coinBoost: 0.1, wordPowerBonus: 0.1, chainBonus: 0.12, accuracyBonus: 0.12, damageReduction: 0.08, energySaving: 0.08, dropChanceBonus: 0.08 },
      { scoreMultiplier: 0.25, speedBonus: 0.12, comboBonus: 0.18, shieldDuration: 2, extraLives: 1, timeSlow: 0.08, hintCount: 2, xpBoost: 0.2, coinBoost: 0.15, wordPowerBonus: 0.18, chainBonus: 0.2, accuracyBonus: 0.18, damageReduction: 0.12, energySaving: 0.12, dropChanceBonus: 0.12 },
      { scoreMultiplier: 0.4, speedBonus: 0.18, comboBonus: 0.25, shieldDuration: 3, extraLives: 2, timeSlow: 0.12, hintCount: 2, xpBoost: 0.28, coinBoost: 0.22, wordPowerBonus: 0.25, chainBonus: 0.28, accuracyBonus: 0.25, damageReduction: 0.18, energySaving: 0.18, dropChanceBonus: 0.18 },
    ],
  },
  {
    id: "mst_transcendence",
    branchId: "mastery",
    name: "Transcendence",
    description: "The ultimate mastery skill — transcend mortal limits and achieve peak performance.",
    icon: "🌟",
    maxLevel: 3,
    prerequisites: ["mst_perfect_chain", "mst_grand_master"],
    costs: [4, 5, 6],
    effects: [
      { scoreMultiplier: 0.3, speedBonus: 0.12, comboBonus: 0.2, shieldDuration: 2, extraLives: 2, timeSlow: 0.08, hintCount: 2, xpBoost: 0.2, coinBoost: 0.18, wordPowerBonus: 0.18, chainBonus: 0.25, accuracyBonus: 0.2, damageReduction: 0.12, energySaving: 0.1, dropChanceBonus: 0.15 },
      { scoreMultiplier: 0.5, speedBonus: 0.18, comboBonus: 0.3, shieldDuration: 3, extraLives: 3, timeSlow: 0.12, hintCount: 3, xpBoost: 0.3, coinBoost: 0.25, wordPowerBonus: 0.28, chainBonus: 0.35, accuracyBonus: 0.28, damageReduction: 0.18, energySaving: 0.15, dropChanceBonus: 0.22 },
      { scoreMultiplier: 0.75, speedBonus: 0.25, comboBonus: 0.45, shieldDuration: 5, extraLives: 4, timeSlow: 0.18, hintCount: 4, xpBoost: 0.4, coinBoost: 0.35, wordPowerBonus: 0.38, chainBonus: 0.5, accuracyBonus: 0.35, damageReduction: 0.25, energySaving: 0.2, dropChanceBonus: 0.3 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Branch Definitions
// ---------------------------------------------------------------------------

const BRANCH_DEFINITIONS: Omit<Branch, "skills">[] = [
  {
    id: "offense",
    name: "Offense",
    icon: "⚔️",
    color: "#FF4444",
    description:
      "Boost your speed, scores, and combo chains to dominate the board.",
  },
  {
    id: "defense",
    name: "Defense",
    icon: "🛡️",
    color: "#4488FF",
    description:
      "Protect yourself with shields, extra lives, and time manipulation.",
  },
  {
    id: "utility",
    name: "Utility",
    icon: "🔧",
    color: "#44CC44",
    description:
      "Gain hints, bonus XP, better drops, and improved resource efficiency.",
  },
  {
    id: "mastery",
    name: "Mastery",
    icon: "👑",
    color: "#FFAA00",
    description:
      "Achieve perfection with word power, multipliers, and transcendent bonuses.",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyEffect(): SkillEffect {
  return {
    scoreMultiplier: 0,
    speedBonus: 0,
    comboBonus: 0,
    shieldDuration: 0,
    extraLives: 0,
    timeSlow: 0,
    hintCount: 0,
    xpBoost: 0,
    coinBoost: 0,
    wordPowerBonus: 0,
    chainBonus: 0,
    accuracyBonus: 0,
    damageReduction: 0,
    energySaving: 0,
    dropChanceBonus: 0,
  };
}

function addEffects(a: SkillEffect, b: SkillEffect): SkillEffect {
  const result = emptyEffect();
  (Object.keys(result) as (keyof SkillEffect)[]).forEach((key) => {
    result[key] = (a[key] ?? 0) + (b[key] ?? 0);
  });
  return result;
}

function loadState(): SkillTreeState {
  if (typeof globalThis.window === "undefined") {
    return defaultState();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as SkillTreeState;
    return parsed;
  } catch {
    return defaultState();
  }
}

function saveState(state: SkillTreeState): void {
  if (typeof globalThis.window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable — silently fail
  }
}

function defaultState(): SkillTreeState {
  const skills: Record<string, { level: number; unlocked: boolean; active: boolean }> = {};
  for (const bp of SKILL_BLUEPRINTS) {
    skills[bp.id] = { level: 0, unlocked: false, active: false };
  }
  return {
    skillPoints: 0,
    totalEarned: 0,
    totalSpent: 0,
    skills,
    activeSlotsMax: MAX_ACTIVE_SLOTS,
    gems: 0,
    presets: [],
    initialized: true,
  };
}

function findBlueprint(skillId: string): SkillBlueprint | undefined {
  return SKILL_BLUEPRINTS.find((bp) => bp.id === skillId);
}

// ---------------------------------------------------------------------------
// Exported Functions
// ---------------------------------------------------------------------------

/**
 * Initialize the skill tree with default state.
 * Safe to call multiple times — only writes if not already initialized.
 */
export function initSkillTree(): SkillTreeState {
  if (typeof globalThis.window === "undefined") return defaultState();
  const existing = loadState();
  if (existing.initialized) return existing;
  const fresh = defaultState();
  saveState(fresh);
  return fresh;
}

/**
 * Get the full skill tree data including all branches and their skills
 * with current unlock/level/active state from persistence.
 */
export function getSkillTree(): { branches: Branch[]; state: SkillTreeState } {
  const state = loadState();
  const branches = buildBranches(state);
  return { branches, state };
}

/**
 * Get all 4 branches with their populated skills.
 */
export function getBranches(): Branch[] {
  const state = loadState();
  return buildBranches(state);
}

/**
 * Get all skills belonging to a specific branch.
 */
export function getBranchSkills(branchId: string): Skill[] {
  const state = loadState();
  const branchBlueprints = SKILL_BLUEPRINTS.filter(
    (bp) => bp.branchId === branchId
  );
  return branchBlueprints.map((bp) => hydrateSkill(bp, state));
}

/**
 * Get full details of a single skill by ID.
 */
export function getSkill(skillId: string): Skill | null {
  const bp = findBlueprint(skillId);
  if (!bp) return null;
  const state = loadState();
  return hydrateSkill(bp, state);
}

/**
 * Get the status of a skill: locked, unlocked, and current level info.
 */
export function getSkillStatus(skillId: string): {
  locked: boolean;
  unlocked: boolean;
  level: number;
  maxLevel: number;
  canUpgrade: boolean;
  prerequisitesMet: boolean;
} {
  const bp = findBlueprint(skillId);
  if (!bp) {
    return {
      locked: true,
      unlocked: false,
      level: 0,
      maxLevel: 0,
      canUpgrade: false,
      prerequisitesMet: false,
    };
  }
  const state = loadState();
  const entry = state.skills[skillId];
  const level = entry?.level ?? 0;
  const unlocked = entry?.unlocked ?? false;
  const prereqsMet = checkPrerequisites(skillId, state);
  const canUpgrade =
    unlocked && level < bp.maxLevel && state.skillPoints >= bp.costs[level];
  return {
    locked: !unlocked,
    unlocked,
    level,
    maxLevel: bp.maxLevel,
    canUpgrade,
    prerequisitesMet: prereqsMet,
  };
}

/**
 * Check whether all prerequisites for a skill are met.
 */
export function canUnlock(skillId: string): boolean {
  const bp = findBlueprint(skillId);
  if (!bp) return false;
  const state = loadState();
  return checkPrerequisites(skillId, state);
}

/**
 * Spend skill points to unlock a skill (set it to level 1).
 * Returns true on success, false if prerequisites not met or insufficient points.
 */
export function unlockSkill(skillId: string): boolean {
  const bp = findBlueprint(skillId);
  if (!bp) return false;

  const state = loadState();
  const entry = state.skills[skillId];
  if (!entry || entry.unlocked) return false;

  // Check prerequisites
  if (!checkPrerequisites(skillId, state)) return false;

  // Check points
  const cost = bp.costs[0];
  if (state.skillPoints < cost) return false;

  // Unlock at level 1
  entry.level = 1;
  entry.unlocked = true;
  state.skillPoints -= cost;
  state.totalSpent += cost;
  saveState(state);
  return true;
}

/**
 * Upgrade an already-unlocked skill to the next level.
 * Returns true on success.
 */
export function upgradeSkill(skillId: string): boolean {
  const bp = findBlueprint(skillId);
  if (!bp) return false;

  const state = loadState();
  const entry = state.skills[skillId];
  if (!entry || !entry.unlocked) return false;
  if (entry.level >= bp.maxLevel) return false;

  const nextLevel = entry.level;
  const cost = bp.costs[nextLevel];
  if (state.skillPoints < cost) return false;

  entry.level = nextLevel + 1;
  state.skillPoints -= cost;
  state.totalSpent += cost;
  saveState(state);
  return true;
}

/**
 * Get the current available (unspent) skill points.
 */
export function getSkillPoints(): number {
  return loadState().skillPoints;
}

/**
 * Award skill points (typically called on level-up).
 */
export function addSkillPoints(amount: number): number {
  const state = loadState();
  state.skillPoints += amount;
  state.totalEarned += amount;
  saveState(state);
  return state.skillPoints;
}

/**
 * Deduct skill points. Returns the new balance.
 * Will not go below zero.
 */
export function spendSkillPoints(amount: number): number {
  const state = loadState();
  state.skillPoints = Math.max(0, state.skillPoints - amount);
  saveState(state);
  return state.skillPoints;
}

/**
 * Get the total skill points that have been spent in the tree.
 */
export function getTotalSpent(): number {
  return loadState().totalSpent;
}

/**
 * Get the list of currently active (equipped) skill IDs.
 */
export function getActiveSkills(): string[] {
  const state = loadState();
  return Object.entries(state.skills)
    .filter(([, entry]) => entry.active)
    .map(([id]) => id);
}

/**
 * Toggle a skill as active/inactive in the current build.
 * Returns true if toggled on, false if toggled off, null on failure.
 */
export function toggleActiveSkill(skillId: string): boolean | null {
  const bp = findBlueprint(skillId);
  if (!bp) return null;

  const state = loadState();
  const entry = state.skills[skillId];
  if (!entry || !entry.unlocked) return null;

  if (entry.active) {
    // Deactivate
    entry.active = false;
    saveState(state);
    return false;
  }

  // Check slot limit
  const currentActive = Object.values(state.skills).filter(
    (e) => e.active
  ).length;
  if (currentActive >= state.activeSlotsMax) return null;

  entry.active = true;
  saveState(state);
  return true;
}

/**
 * Get the total number of active skill slots available.
 */
export function getActiveSlots(): number {
  return loadState().activeSlotsMax;
}

/**
 * Get the number of active skill slots currently in use.
 */
export function getActiveSlotsUsed(): number {
  const state = loadState();
  return Object.values(state.skills).filter((e) => e.active).length;
}

/**
 * Refund ALL skill points — reset the entire tree to zero.
 * Returns the number of points refunded.
 */
export function refundAll(): number {
  const state = loadState();
  let refunded = 0;

  for (const bp of SKILL_BLUEPRINTS) {
    const entry = state.skills[bp.id];
    if (!entry) continue;
    for (let lvl = 0; lvl < entry.level; lvl++) {
      refunded += bp.costs[lvl];
    }
    entry.level = 0;
    entry.unlocked = false;
    entry.active = false;
  }

  state.skillPoints += refunded;
  state.totalSpent = 0;
  saveState(state);
  return refunded;
}

/**
 * Refund all points spent in a single branch.
 * Skills that lose prerequisites due to this are also deactivated.
 * Returns the number of points refunded.
 */
export function refundBranch(branchId: string): number {
  const state = loadState();
  let refunded = 0;
  const branchSkills = SKILL_BLUEPRINTS.filter(
    (bp) => bp.branchId === branchId
  );

  // Refund from deepest skills first to handle cascading
  const sorted = [...branchSkills].reverse();

  for (const bp of sorted) {
    const entry = state.skills[bp.id];
    if (!entry) continue;
    for (let lvl = 0; lvl < entry.level; lvl++) {
      refunded += bp.costs[lvl];
    }
    entry.level = 0;
    entry.unlocked = false;
    entry.active = false;
  }

  state.skillPoints += refunded;
  // Recalculate totalSpent
  recalcTotalSpent(state);
  saveState(state);
  return refunded;
}

/**
 * Get the gem cost to perform a full respec.
 */
export function getRespecCost(): number {
  return RESPEC_BASE_COST;
}

/**
 * Check whether the player can afford to respec.
 */
export function canRespec(): boolean {
  const state = loadState();
  return state.gems >= RESPEC_BASE_COST;
}

/**
 * Get all saved build presets.
 */
export function getBuildPresets(): BuildPreset[] {
  return loadState().presets;
}

/**
 * Save the current active skill selection as a named preset.
 * Returns the saved preset, or null if limit reached (max 3).
 */
export function saveBuildPreset(name: string): BuildPreset | null {
  const state = loadState();
  if (state.presets.length >= 3) return null;

  const activeSkills = Object.entries(state.skills)
    .filter(([, entry]) => entry.active)
    .map(([id]) => id);

  const preset: BuildPreset = {
    id: `preset_${Date.now()}`,
    name,
    activeSkills,
    timestamp: Date.now(),
  };

  state.presets.push(preset);
  saveState(state);
  return preset;
}

/**
 * Load a saved build preset — sets active skills to match the preset.
 * Returns true on success.
 */
export function loadBuildPreset(presetId: string): boolean {
  const state = loadState();
  const preset = state.presets.find((p) => p.id === presetId);
  if (!preset) return false;

  // Deactivate all current skills
  for (const key of Object.keys(state.skills)) {
    state.skills[key].active = false;
  }

  // Activate skills from preset (only if unlocked)
  for (const skillId of preset.activeSkills) {
    const entry = state.skills[skillId];
    if (entry && entry.unlocked) {
      entry.active = true;
    }
  }

  saveState(state);
  return true;
}

/**
 * Delete a saved build preset by ID.
 * Returns true if deleted, false if not found.
 */
export function deleteBuildPreset(presetId: string): boolean {
  const state = loadState();
  const idx = state.presets.findIndex((p) => p.id === presetId);
  if (idx === -1) return false;

  state.presets.splice(idx, 1);
  saveState(state);
  return true;
}

/**
 * Calculate the combined effects of all currently active skills.
 */
export function getSkillEffects(): SkillEffect {
  const state = loadState();
  const combined = emptyEffect();

  for (const [skillId, entry] of Object.entries(state.skills)) {
    if (!entry.active || entry.level === 0) continue;
    const bp = findBlueprint(skillId);
    if (!bp) continue;

    const effect = bp.effects[entry.level - 1];
    if (effect) {
      const summed = addEffects(combined, effect);
      Object.assign(combined, summed);
    }
  }

  return combined;
}

/**
 * Get the total score multiplier from all active skills.
 */
export function getBonusScoreMultiplier(): number {
  return getSkillEffects().scoreMultiplier;
}

/**
 * Get the total speed bonus from all active skills.
 */
export function getBonusSpeed(): number {
  return getSkillEffects().speedBonus;
}

/**
 * Get the total extra lives from all active skills.
 */
export function getBonusLives(): number {
  return getSkillEffects().extraLives;
}

/**
 * Get stats summary of the skill tree.
 */
export function getSkillTreeStats(): {
  totalSkills: number;
  totalUnlocked: number;
  totalMastered: number;
  totalLevels: number;
  maxTotalLevels: number;
  pointsSpent: number;
  pointsAvailable: number;
  activeCount: number;
  maxActiveSlots: number;
  branchProgress: Record<string, number>;
} {
  const state = loadState();
  let totalUnlocked = 0;
  let totalMastered = 0;
  let totalLevels = 0;
  let maxTotalLevels = 0;
  const branchProgress: Record<string, number> = {};
  const branchMaxLevels: Record<string, number> = {};

  for (const bp of SKILL_BLUEPRINTS) {
    maxTotalLevels += bp.maxLevel;
    branchMaxLevels[bp.branchId] =
      (branchMaxLevels[bp.branchId] ?? 0) + bp.maxLevel;

    const entry = state.skills[bp.id];
    if (entry && entry.unlocked) {
      totalUnlocked++;
      totalLevels += entry.level;
      if (entry.level >= bp.maxLevel) totalMastered++;
      branchProgress[bp.branchId] =
        (branchProgress[bp.branchId] ?? 0) + entry.level;
    }
  }

  // Convert branch progress to percentages
  const branchPct: Record<string, number> = {};
  for (const branchId of Object.keys(branchProgress)) {
    branchPct[branchId] =
      branchMaxLevels[branchId] > 0
        ? branchProgress[branchId] / branchMaxLevels[branchId]
        : 0;
  }

  return {
    totalSkills: SKILL_BLUEPRINTS.length,
    totalUnlocked,
    totalMastered,
    totalLevels,
    maxTotalLevels,
    pointsSpent: state.totalSpent,
    pointsAvailable: state.skillPoints,
    activeCount: Object.values(state.skills).filter((e) => e.active).length,
    maxActiveSlots: state.activeSlotsMax,
    branchProgress: branchPct,
  };
}

/**
 * Get a single payload with everything needed to render the skill tree panel.
 */
export function getSkillTreeOverview(): {
  branches: Branch[];
  state: SkillTreeState;
  stats: ReturnType<typeof getSkillTreeStats>;
  effects: SkillEffect;
  activeSkills: string[];
} {
  return {
    branches: getBranches(),
    state: loadState(),
    stats: getSkillTreeStats(),
    effects: getSkillEffects(),
    activeSkills: getActiveSkills(),
  };
}

/**
 * Get a branch overview card with progress information.
 */
export function getBranchCard(branchId: string): {
  branch: Branch | null;
  progress: number;
  unlockedCount: number;
  masteredCount: number;
  totalSkills: number;
  pointsSpentInBranch: number;
} | null {
  const def = BRANCH_DEFINITIONS.find((b) => b.id === branchId);
  if (!def) return null;

  const state = loadState();
  const skills = getBranchSkills(branchId);
  const branchBps = SKILL_BLUEPRINTS.filter((bp) => bp.branchId === branchId);

  let unlockedCount = 0;
  let masteredCount = 0;
  let totalLevels = 0;
  let maxLevels = 0;
  let pointsSpentInBranch = 0;

  for (const bp of branchBps) {
    maxLevels += bp.maxLevel;
    const entry = state.skills[bp.id];
    if (entry && entry.unlocked) {
      unlockedCount++;
      totalLevels += entry.level;
      if (entry.level >= bp.maxLevel) masteredCount++;
      for (let i = 0; i < entry.level; i++) {
        pointsSpentInBranch += bp.costs[i];
      }
    }
  }

  return {
    branch: { ...def, skills },
    progress: maxLevels > 0 ? totalLevels / maxLevels : 0,
    unlockedCount,
    masteredCount,
    totalSkills: branchBps.length,
    pointsSpentInBranch,
  };
}

/**
 * Get skill node data optimized for rendering a tree graph.
 * Includes position hints and connection info.
 */
export function getSkillNode(skillId: string): {
  skill: Skill | null;
  position: { row: number; col: number };
  connections: { parent: string[]; children: string[] };
} | null {
  const bp = findBlueprint(skillId);
  if (!bp) return null;

  const state = loadState();
  const skill = hydrateSkill(bp, state);
  const branchSkills = SKILL_BLUEPRINTS.filter(
    (s) => s.branchId === bp.branchId
  );

  // Determine row by depth in the prerequisite tree
  const row = getSkillDepth(skillId, branchSkills);
  const siblings = branchSkills.filter(
    (s) => getSkillDepth(s.id, branchSkills) === row
  );
  const col = siblings.indexOf(bp);

  // Find children (skills that list this as a prerequisite)
  const children = branchSkills
    .filter((s) => s.prerequisites.includes(skillId))
    .map((s) => s.id);

  return {
    skill,
    position: { row, col },
    connections: {
      parent: bp.prerequisites,
      children,
    },
  };
}

/**
 * Get a summary of the active build's combined effects.
 */
export function getActiveBuildSummary(): {
  activeSkills: Skill[];
  combinedEffects: SkillEffect;
  scoreMultiplier: number;
  speedBonus: number;
  extraLives: number;
  totalSlots: number;
  usedSlots: number;
  remainingSlots: number;
} {
  const effects = getSkillEffects();
  const activeIds = getActiveSkills();
  const activeSkills = activeIds
    .map((id) => getSkill(id))
    .filter((s): s is Skill => s !== null);

  return {
    activeSkills,
    combinedEffects: effects,
    scoreMultiplier: effects.scoreMultiplier,
    speedBonus: effects.speedBonus,
    extraLives: effects.extraLives,
    totalSlots: getActiveSlots(),
    usedSlots: getActiveSlotsUsed(),
    remainingSlots: getActiveSlots() - getActiveSlotsUsed(),
  };
}

/**
 * Get recommended skills to unlock next based on play style heuristics.
 * Suggests the most impactful affordable skills.
 */
export function getRecommendations(): {
  skillId: string;
  reason: string;
  priority: "high" | "medium" | "low";
}[] {
  const state = loadState();
  const recommendations: {
    skillId: string;
    reason: string;
    priority: "high" | "medium" | "low";
  }[] = [];

  // Heuristic: recommend root skills of any branch not yet started
  for (const branchDef of BRANCH_DEFINITIONS) {
    const rootSkill = SKILL_BLUEPRINTS.find(
      (bp) => bp.branchId === branchDef.id && bp.prerequisites.length === 0
    );
    if (!rootSkill) continue;
    const entry = state.skills[rootSkill.id];
    if (entry && !entry.unlocked && state.skillPoints >= rootSkill.costs[0]) {
      recommendations.push({
        skillId: rootSkill.id,
        reason: `Start the ${branchDef.name} branch for ${branchDef.description.toLowerCase().slice(0, -1)}.`,
        priority: "high",
      });
    }
  }

  // Heuristic: recommend upgrades to already-unlocked skills
  for (const bp of SKILL_BLUEPRINTS) {
    const entry = state.skills[bp.id];
    if (!entry || !entry.unlocked) continue;
    if (entry.level >= bp.maxLevel) continue;
    const nextCost = bp.costs[entry.level];
    if (state.skillPoints >= nextCost) {
      const isTopTier = bp.prerequisites.length >= 2;
      recommendations.push({
        skillId: bp.id,
        reason: isTopTier
          ? `Upgrade ${bp.name} — it's a high-tier skill with powerful effects.`
          : `Upgrade ${bp.name} to level ${entry.level + 1} for improved bonuses.`,
        priority: isTopTier ? "high" : "medium",
      });
    }
  }

  // Heuristic: recommend unlockable next-tier skills
  for (const bp of SKILL_BLUEPRINTS) {
    const entry = state.skills[bp.id];
    if (entry && entry.unlocked) continue;
    if (!checkPrerequisites(bp.id, state)) continue;
    if (state.skillPoints >= bp.costs[0]) {
      // Already recommended as root? Skip
      if (bp.prerequisites.length === 0) continue;
      recommendations.push({
        skillId: bp.id,
        reason: `${bp.name} is now available to unlock and builds on your current skills.`,
        priority: "medium",
      });
    }
  }

  // Sort: high → medium → low, then by cost ascending
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    const costA = findBlueprint(a.skillId)?.costs[0] ?? Infinity;
    const costB = findBlueprint(b.skillId)?.costs[0] ?? Infinity;
    return costA - costB;
  });

  return recommendations.slice(0, 8);
}

/**
 * Get the overall mastery progress of the skill tree as a percentage (0-1).
 */
export function getMasteryProgress(): number {
  const stats = getSkillTreeStats();
  if (stats.maxTotalLevels === 0) return 0;
  return stats.totalLevels / stats.maxTotalLevels;
}

// ---------------------------------------------------------------------------
// Internal Helpers
// ---------------------------------------------------------------------------

function buildBranches(state: SkillTreeState): Branch[] {
  return BRANCH_DEFINITIONS.map((def) => {
    const branchBps = SKILL_BLUEPRINTS.filter(
      (bp) => bp.branchId === def.id
    );
    const skills = branchBps.map((bp) => hydrateSkill(bp, state));
    return { ...def, skills };
  });
}

function hydrateSkill(bp: SkillBlueprint, state: SkillTreeState): Skill {
  const entry = state.skills[bp.id] ?? {
    level: 0,
    unlocked: false,
    active: false,
  };
  return {
    id: bp.id,
    branchId: bp.branchId,
    name: bp.name,
    description: bp.description,
    icon: bp.icon,
    level: entry.level,
    maxLevel: bp.maxLevel,
    unlocked: entry.unlocked,
    active: entry.active,
    prerequisites: [...bp.prerequisites],
    costs: [...bp.costs],
    effects: bp.effects.map((e) => ({ ...e })),
  };
}

function checkPrerequisites(skillId: string, state: SkillTreeState): boolean {
  const bp = findBlueprint(skillId);
  if (!bp) return false;
  for (const prereqId of bp.prerequisites) {
    const prereqEntry = state.skills[prereqId];
    if (!prereqEntry || !prereqEntry.unlocked) return false;
  }
  return true;
}

function recalcTotalSpent(state: SkillTreeState): void {
  let total = 0;
  for (const bp of SKILL_BLUEPRINTS) {
    const entry = state.skills[bp.id];
    if (!entry) continue;
    for (let i = 0; i < entry.level; i++) {
      total += bp.costs[i];
    }
  }
  state.totalSpent = total;
}

function getSkillDepth(
  skillId: string,
  branchSkills: SkillBlueprint[]
): number {
  const bp = branchSkills.find((s) => s.id === skillId);
  if (!bp || bp.prerequisites.length === 0) return 0;
  let maxParentDepth = 0;
  for (const parentId of bp.prerequisites) {
    const d = getSkillDepth(parentId, branchSkills);
    if (d > maxParentDepth) maxParentDepth = d;
  }
  return maxParentDepth + 1;
}
