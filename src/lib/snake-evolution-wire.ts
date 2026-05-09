// =============================================================================
// Snake Evolution System — Wire Module
// =============================================================================
// Comprehensive evolution, mutation, and DNA system for the Word Snake game.
// SSR-safe: no browser globals, no localStorage, no setInterval.
// All public functions use the `ev` prefix.
// =============================================================================

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

export type EvoPathId = "serpent" | "dragon" | "phoenix" | "ice" | "shadow";
export type EvoStage = "embryo" | "hatchling" | "evolved" | "apex";
export type MutationRarity = "common" | "uncommon" | "rare" | "legendary";
export type MutationEffect = "positive" | "negative" | "neutral";
export type DNAStrandId =
  | "alpha" | "beta" | "gamma" | "delta"
  | "epsilon" | "zeta" | "eta" | "theta"
  | "iota" | "omega";

export interface EvoAbility {
  id: string;
  path: EvoPathId;
  stage: EvoStage;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  active: boolean;
  effect: Record<string, number>;
}

export interface EvoStageData {
  stage: EvoStage;
  order: number;
  label: string;
  xpRequired: number;
  abilities: string[]; // ability ids
  visualTheme: string;
}

export interface EvoPath {
  id: EvoPathId;
  name: string;
  icon: string;
  color: string;
  description: string;
  focus: string;
  stages: EvoStageData[];
  stageProgress: Record<EvoStage, { xp: number; completed: boolean }>;
  currentStage: EvoStage;
  totalXP: number;
  completionPercent: number;
}

export interface Mutation {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: MutationRarity;
  effect: MutationEffect;
  effects: Record<string, number>;
  stability: number; // 0-100
  active: boolean;
  appliedAt: number | null;
  timesApplied: number;
}

export interface MutationSynergy {
  id: string;
  mutation1: string;
  mutation2: string;
  name: string;
  description: string;
  bonusEffects: Record<string, number>;
  icon: string;
}

export interface DNAStrandData {
  id: DNAStrandId;
  name: string;
  description: string;
  icon: string;
  collected: boolean;
  collectedAt: number | null;
  rarity: MutationRarity;
  bonus: Record<string, number>;
  fragmentCount: number;
  fragmentsNeeded: number;
  combined: boolean;
}

export interface EvoHistoryEntry {
  timestamp: number;
  action: "evolve" | "ability_unlock" | "ability_activate" | "mutation_apply" |
    "mutation_remove" | "path_change" | "dna_collect" | "dna_combine" | "reset";
  details: string;
  path?: EvoPathId;
  relatedId?: string;
}

export interface EvolutionState {
  currentPath: EvoPathId;
  paths: Record<EvoPathId, EvoPath>;
  abilities: Record<string, EvoAbility>;
  mutations: Record<string, Mutation>;
  synergies: Record<string, MutationSynergy>;
  dna: Record<DNAStrandId, DNAStrandData>;
  evolutionHistory: EvoHistoryEntry[];
  totalMutationsApplied: number;
  lastMutationRollTime: number;
  initializedAt: number;
}

// -----------------------------------------------------------------------------
// Constants — Stage XP Thresholds
// -----------------------------------------------------------------------------

const STAGE_XP: Record<EvoStage, number> = {
  embryo: 100,
  hatchling: 500,
  evolved: 2000,
  apex: 5000,
};

const STAGE_ORDER: EvoStage[] = ["embryo", "hatchling", "evolved", "apex"];

const STAGE_LABELS: Record<EvoStage, string> = {
  embryo: "Embryo",
  hatchling: "Hatchling",
  evolved: "Evolved",
  apex: "Apex",
};

const VISUAL_THEMES: Record<EvoPathId, Record<EvoStage, string>> = {
  serpent: {
    embryo: "Soft green glow",
    hatchling: "Bright emerald aura",
    evolved: "Pulsating vine pattern",
    apex: "Full bio-luminescent serpent scales",
  },
  dragon: {
    embryo: "Faint red ember",
    hatchling: "Smoldering orange outline",
    evolved: "Blazing crimson body",
    apex: "Infernal dragon flame aura",
  },
  phoenix: {
    embryo: "Tiny spark trail",
    hatchling: "Warm golden glow",
    evolved: "Burning orange wings",
    apex: "Radiant rebirth nova aura",
  },
  ice: {
    embryo: "Frost mist",
    hatchling: "Icy blue shimmer",
    evolved: "Crystalline ice armor",
    apex: "Absolute zero frozen domain",
  },
  shadow: {
    embryo: "Faint dark wisps",
    hatchling: "Purple shadow trail",
    evolved: "Void cloak shimmer",
    apex: "Full dark dimension overlay",
  },
};

// -----------------------------------------------------------------------------
// Constants — Path Definitions
// -----------------------------------------------------------------------------

interface PathDef {
  id: EvoPathId;
  name: string;
  icon: string;
  color: string;
  description: string;
  focus: string;
}

const PATH_DEFS: PathDef[] = [
  {
    id: "serpent",
    name: "Serpent Path",
    icon: "\u{1F40D}",
    color: "#22c55e",
    description: "Speed-focused evolution. Become the fastest snake on the board.",
    focus: "Speed & Agility",
  },
  {
    id: "dragon",
    name: "Dragon Path",
    icon: "\u{1F409}",
    color: "#ef4444",
    description: "Power-focused evolution. Unleash devastating abilities to dominate.",
    focus: "Power & Destruction",
  },
  {
    id: "phoenix",
    name: "Phoenix Path",
    icon: "\u{1F525}",
    color: "#f97316",
    description: "Rebirth-focused evolution. Rise from death stronger than before.",
    focus: "Rebirth & Resilience",
  },
  {
    id: "ice",
    name: "Ice Path",
    icon: "\u2744\uFE0F",
    color: "#3b82f6",
    description: "Freeze-focused evolution. Control the battlefield with ice powers.",
    focus: "Freeze & Control",
  },
  {
    id: "shadow",
    name: "Shadow Path",
    icon: "\u{1F311}",
    color: "#a855f7",
    description: "Stealth-focused evolution. Slip through the unseen and strike from darkness.",
    focus: "Stealth & Illusion",
  },
];

// -----------------------------------------------------------------------------
// Constants — Ability Definitions (60 total: 5 paths × 4 stages × 3 abilities)
// -----------------------------------------------------------------------------

interface AbilityDef {
  id: string;
  path: EvoPathId;
  stage: EvoStage;
  name: string;
  description: string;
  icon: string;
  effect: Record<string, number>;
}

const ABILITY_DEFS: AbilityDef[] = [
  // === SERPENT PATH ===
  // Embryo
  { id: "ser_emb_1", path: "serpent", stage: "embryo", name: "Quick Slither", description: "Increases base movement speed by 10%.", icon: "\u26A1", effect: { speed: 0.1 } },
  { id: "ser_emb_2", path: "serpent", stage: "embryo", name: "Tight Turns", description: "Reduces turn radius, allowing sharper cornering.", icon: "\u{1F500}", effect: { turnSpeed: 0.15 } },
  { id: "ser_emb_3", path: "serpent", stage: "embryo", name: "Reflex Boost", description: "Slightly faster input response time.", icon: "\u{1F4AF}", effect: { reaction: 0.08 } },
  // Hatchling
  { id: "ser_hat_1", path: "serpent", stage: "hatchling", name: "Acceleration Surge", description: "Gain a burst of acceleration when changing direction.", icon: "\u{1F680}", effect: { acceleration: 0.2 } },
  { id: "ser_hat_2", path: "serpent", stage: "hatchling", name: "Flow State", description: "Maintaining a straight line builds speed momentum.", icon: "\u{1F300}", effect: { momentum: 0.15 } },
  { id: "ser_hat_3", path: "serpent", stage: "hatchling", name: "Wind Resistance", description: "Reduced speed penalty when moving against obstacles.", icon: "\u{1F32C}\uFE0F", effect: { dragReduction: 0.1 } },
  // Evolved
  { id: "ser_evo_1", path: "serpent", stage: "evolved", name: "Dash", description: "Activate a short-range speed dash on command.", icon: "\u{1F4A8}", effect: { dashSpeed: 0.5, dashCooldown: 5 } },
  { id: "ser_evo_2", path: "serpent", stage: "evolved", name: "Serpentine Weave", description: "Dodging obstacles grants temporary speed boost.", icon: "\u{1F40D}", effect: { dodgeSpeedBonus: 0.25 } },
  { id: "ser_evo_3", path: "serpent", stage: "evolved", name: "Hyperdrive", description: "Movement speed increases exponentially during streaks.", icon: "\u{1F6F8}", effect: { streakMultiplier: 0.3 } },
  // Apex
  { id: "ser_apx_1", path: "serpent", stage: "apex", name: "Lightning Strike", description: "Instantly traverse 3 tiles in the current direction.", icon: "\u26A1", effect: { teleportDist: 3, teleportCooldown: 8 } },
  { id: "ser_apx_2", path: "serpent", stage: "apex", name: "Time Warp", description: "Slows game time by 20% while maintaining normal speed.", icon: "\u231B", effect: { timeSlow: 0.2 } },
  { id: "ser_apx_3", path: "serpent", stage: "apex", name: "Ouroboros Loop", description: "Completing a full loop grants 2x speed for 10 seconds.", icon: "\u{1F300}", effect: { loopSpeed: 2.0, loopDuration: 10 } },

  // === DRAGON PATH ===
  // Embryo
  { id: "drg_emb_1", path: "dragon", stage: "embryo", name: "Score Fire", description: "Increases score multiplier by 5%.", icon: "\u{1F525}", effect: { scoreMultiplier: 0.05 } },
  { id: "drg_emb_2", path: "dragon", stage: "embryo", name: "Ember Core", description: "Small chance (5%) to double points on word completion.", icon: "\u{1F31F}", effect: { doubleChance: 0.05 } },
  { id: "drg_emb_3", path: "dragon", stage: "embryo", name: "Hard Scales", description: "Reduces collision damage penalty by 10%.", icon: "\u{1F9E1}", effect: { damageReduction: 0.1 } },
  // Hatchling
  { id: "drg_hat_1", path: "dragon", stage: "hatchling", name: "Fire Breath", description: "Burn through obstacles, destroying them for bonus points.", icon: "\u{1F525}", effect: { burnPower: 1, burnCooldown: 10 } },
  { id: "drg_hat_2", path: "dragon", stage: "hatchling", name: "Dragon Hoard", description: "Collecting power-ups also grants bonus score.", icon: "\u{1FAE6}", effect: { powerupScoreBonus: 0.5 } },
  { id: "drg_hat_3", path: "dragon", stage: "hatchling", name: "Intimidation", description: "Nearby enemies move slower in your presence.", icon: "\u{1F608}", effect: { enemySlow: 0.15 } },
  // Evolved
  { id: "drg_evo_1", path: "dragon", stage: "evolved", name: "Dragon Armor", description: "Survive one lethal collision per game.", icon: "\u{1F6E1}\uFE0F", effect: { armor: 1 } },
  { id: "drg_evo_2", path: "dragon", stage: "evolved", name: "Inferno Trail", description: "Leave a fire trail that burns enemies and obstacles.", icon: "\u{1F525}", effect: { trailDamage: 1, trailDuration: 3 } },
  { id: "drg_evo_3", path: "dragon", stage: "evolved", name: "Roar", description: "Clear all obstacles in a 3-tile radius.", icon: "\u{1F4AA}", effect: { roarRadius: 3, roarCooldown: 20 } },
  // Apex
  { id: "drg_apx_1", path: "dragon", stage: "apex", name: "Apex Fury", description: "Score multiplier increases with each word in a combo.", icon: "\u{1F4A2}", effect: { comboMultiplier: 0.1, maxStacks: 10 } },
  { id: "drg_apx_2", path: "dragon", stage: "apex", name: "Volcanic Eruption", description: "Destroy all obstacles on the board once per game.", icon: "\u{1F30B}", effect: { eruptionRadius: 999, eruptionCooldown: 999 } },
  { id: "drg_apx_3", path: "dragon", stage: "apex", name: "Dragon Ascension", description: "Upon reaching max combo, all scores are tripled for 15s.", icon: "\u{1F451}", effect: { ascensionMultiplier: 3.0, ascensionDuration: 15 } },

  // === PHOENIX PATH ===
  // Embryo
  { id: "phx_emb_1", path: "phoenix", stage: "embryo", name: "Warm Heart", description: "Gain 1 extra life per game.", icon: "\u2764\uFE0F", effect: { extraLives: 1 } },
  { id: "phx_emb_2", path: "phoenix", stage: "embryo", name: "Ember Glow", description: "Lights up nearby tiles, revealing hidden power-ups.", icon: "\u{1F506}", effect: { visionRadius: 2 } },
  { id: "phx_emb_3", path: "phoenix", stage: "embryo", name: "Ash Recovery", description: "Regenerate 1 segment after each death.", icon: "\u{1F9EC}", effect: { regenOnDeath: 1 } },
  // Hatchling
  { id: "phx_hat_1", path: "phoenix", stage: "hatchling", name: "Phoenix Revive", description: "Automatically revive once upon death with full length.", icon: "\u{1F525}", effect: { reviveCount: 1 } },
  { id: "phx_hat_2", path: "phoenix", stage: "hatchling", name: "Flame Trail", description: "Leave a flame trail that grants temporary score bonus to allies.", icon: "\u{1F525}", effect: { trailScoreBonus: 0.2, trailDuration: 4 } },
  { id: "phx_hat_3", path: "phoenix", stage: "hatchling", name: "Heat Shield", description: "Become immune to fire/heat-based obstacles for 5 seconds.", icon: "\u{1F6E1}\uFE0F", effect: { fireImmunity: 1, shieldDuration: 5 } },
  // Evolved
  { id: "phx_evo_1", path: "phoenix", stage: "evolved", name: "Rebirth Flame", description: "Upon death, explode in flames dealing damage to nearby enemies.", icon: "\u{1F4A5}", effect: { deathExplosionRadius: 4, deathExplosionDamage: 2 } },
  { id: "phx_evo_2", path: "phoenix", stage: "evolved", name: "Wings of Fire", description: "Gain temporary invincibility and speed boost on revive.", icon: "\u{1F986}", effect: { reviveSpeedBoost: 0.5, reviveInvincibility: 5 } },
  { id: "phx_evo_3", path: "phoenix", stage: "evolved", name: "Eternal Embers", description: "Passively regenerate 1 segment every 30 seconds.", icon: "\u{1F31F}", effect: { passiveRegen: 1, passiveRegenInterval: 30 } },
  // Apex
  { id: "phx_apx_1", path: "phoenix", stage: "apex", name: "Phoenix Rebirth", description: "Revive up to 3 times per game, each time stronger.", icon: "\u{1F525}", effect: { maxRevives: 3, reviveStrengthBonus: 0.25 } },
  { id: "phx_apx_2", path: "phoenix", stage: "apex", name: "Solar Flare", description: "Periodically release a damaging solar pulse.", icon: "\u2600\uFE0F", effect: { pulseRadius: 5, pulseDamage: 3, pulseInterval: 15 } },
  { id: "phx_apx_3", path: "phoenix", stage: "apex", name: "Immortal Ash", description: "Upon final death, leave a permanent score multiplier on the board.", icon: "\u{1FAA8}", effect: { immortalBonus: 1.5, immortalDuration: 30 } },

  // === ICE PATH ===
  // Embryo
  { id: "ice_emb_1", path: "ice", stage: "embryo", name: "Frost Touch", description: "Slow nearby enemies by 5%.", icon: "\u2744\uFE0F", effect: { enemySlow: 0.05 } },
  { id: "ice_emb_2", path: "ice", stage: "embryo", name: "Cold Blooded", description: "Reduce speed penalty from cold zones by 20%.", icon: "\u{1F9CA}", effect: { coldResistance: 0.2 } },
  { id: "ice_emb_3", path: "ice", stage: "embryo", name: "Ice Shards", description: "Small chance to freeze adjacent obstacles on collision.", icon: "\u{1F48E}", effect: { freezeChance: 0.1 } },
  // Hatchling
  { id: "ice_hat_1", path: "ice", stage: "hatchling", name: "Glacial Wall", description: "Create a temporary ice wall that blocks enemies.", icon: "\u{1F9F1}", effect: { wallDuration: 8, wallCooldown: 15 } },
  { id: "ice_hat_2", path: "ice", stage: "hatchling", name: "Frozen Path", description: "Frozen tiles slow enemies that cross them.", icon: "\u{1F0CF}", effect: { tileSlow: 0.3, tileDuration: 10 } },
  { id: "ice_hat_3", path: "ice", stage: "hatchling", name: "Crystallize", description: "Temporarily freeze yourself to become invulnerable.", icon: "\u{1F48E}", effect: { freezeSelfDuration: 3, freezeSelfCooldown: 20 } },
  // Evolved
  { id: "ice_evo_1", path: "ice", stage: "evolved", name: "Ice Shield", description: "Absorb up to 2 hits before the shield shatters.", icon: "\u{1F6E1}\uFE0F", effect: { shieldHits: 2, shieldRegen: 30 } },
  { id: "ice_evo_2", path: "ice", stage: "evolved", name: "Blizzard", description: "Create a blizzard zone that slows all enemies within range.", icon: "\u{1F32C}\uFE0F", effect: { blizzardRadius: 5, blizzardSlow: 0.5, blizzardDuration: 8 } },
  { id: "ice_evo_3", path: "ice", stage: "evolved", name: "Permafrost", description: "Frozen obstacles become permanent score multipliers.", icon: "\u{1F9CA}", effect: { frozenScoreBonus: 0.3 } },
  // Apex
  { id: "ice_apx_1", path: "ice", stage: "apex", name: "Absolute Zero", description: "Freeze all enemies on the board for 5 seconds.", icon: "\u2744\uFE0F", effect: { globalFreeze: 5, globalFreezeCooldown: 45 } },
  { id: "ice_apx_2", path: "ice", stage: "apex", name: "Ice Age", description: "The entire board slowly freezes over, creating tactical advantages.", icon: "\u{1F3D4}\uFE0F", effect: { freezeSpread: 1, freezeSpreadInterval: 3 } },
  { id: "ice_apx_3", path: "ice", stage: "apex", name: "Diamond Form", description: "Transform into diamond: immune to all damage for 8 seconds.", icon: "\u{1F48E}", effect: { diamondDuration: 8, diamondCooldown: 60 } },

  // === SHADOW PATH ===
  // Embryo
  { id: "shd_emb_1", path: "shadow", stage: "embryo", name: "Shadow Sneak", description: "Become 10% harder for enemies to detect.", icon: "\u{1F311}", effect: { detectionReduction: 0.1 } },
  { id: "shd_emb_2", path: "shadow", stage: "embryo", name: "Dark Vision", description: "Reveal hidden paths and secret tiles on the board.", icon: "\u{1F441}\uFE0F", effect: { revealRadius: 3 } },
  { id: "shd_emb_3", path: "shadow", stage: "embryo", name: "Night Stalker", description: "Move 5% faster in dark/shadowed areas.", icon: "\u{1F319}", effect: { darkSpeedBonus: 0.05 } },
  // Hatchling
  { id: "shd_hat_1", path: "shadow", stage: "hatchling", name: "Phase Shift", description: "Phase through walls once every 15 seconds.", icon: "\u{1F300}", effect: { phaseCooldown: 15, phaseDuration: 2 } },
  { id: "shd_hat_2", path: "shadow", stage: "hatchling", name: "Shadow Cloak", description: "Become invisible to enemies for 3 seconds.", icon: "\u{1F576}\uFE0F", effect: { invisibilityDuration: 3, cloakCooldown: 12 } },
  { id: "shd_hat_3", path: "shadow", stage: "hatchling", name: "Dark Harvest", description: "Invisible words grant double score when collected.", icon: "\u{1F311}", effect: { hiddenWordBonus: 1.0 } },
  // Evolved
  { id: "shd_evo_1", path: "shadow", stage: "evolved", name: "Void Walk", description: "Teleport to any shadow tile on the board.", icon: "\u{1F300}", effect: { teleportToShadow: 1, teleportCooldown: 20 } },
  { id: "shd_evo_2", path: "shadow", stage: "evolved", name: "Shadow Clone", description: "Create a decoy that attracts enemies for 8 seconds.", icon: "\u{1F464}", effect: { cloneDuration: 8, cloneCooldown: 25 } },
  { id: "shd_evo_3", path: "shadow", stage: "evolved", name: "Eclipse", description: "Darken a 5-tile radius, slowing enemies within.", icon: "\u{1F311}", effect: { eclipseRadius: 5, eclipseSlow: 0.4, eclipseDuration: 6 } },
  // Apex
  { id: "shd_apx_1", path: "shadow", stage: "apex", name: "Dimensional Rift", description: "Open a rift that teleports you to the safest tile.", icon: "\u{1F52E}", effect: { riftCooldown: 30, riftRange: 999 } },
  { id: "shd_apx_2", path: "shadow", stage: "apex", name: "Oblivion Shroud", description: "Permanently shadow 8 random tiles, granting continuous bonuses.", icon: "\u{1F311}", effect: { shroudTiles: 8, shroudBonus: 0.15 } },
  { id: "shd_apx_3", path: "shadow", stage: "apex", name: "Abyssal Form", description: "Become intangible: phase through everything for 6 seconds.", icon: "\u{1F30A}", effect: { intangibleDuration: 6, intangibleCooldown: 45 } },
];

// -----------------------------------------------------------------------------
// Constants — Mutation Definitions (20 mutations)
// -----------------------------------------------------------------------------

interface MutationDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: MutationRarity;
  effect: MutationEffect;
  effects: Record<string, number>;
  stability: number;
}

const MUTATION_DEFS: MutationDef[] = [
  { id: "mut_speed_boost", name: "Swift Scales", description: "Natural speed enhancement increases movement by 10%.", icon: "\u26A1", rarity: "common", effect: "positive", effects: { speed: 0.1 }, stability: 80 },
  { id: "mut_score_drain", name: "Score Leech", description: "A parasitic gene reduces all scores by 5%.", icon: "\u{1F4A8}", rarity: "common", effect: "negative", effects: { scoreMultiplier: -0.05 }, stability: 85 },
  { id: "mut_extra_life", name: "Heart Mutation", description: "An extra life organ grows, granting +1 life.", icon: "\u2764\uFE0F", rarity: "uncommon", effect: "positive", effects: { extraLives: 1 }, stability: 70 },
  { id: "mut_color_shift", name: "Chromatophore", description: "Body color shifts unpredictably. Purely cosmetic.", icon: "\u{1F3A8}", rarity: "common", effect: "neutral", effects: { cosmeticColorShift: 1 }, stability: 100 },
  { id: "mut_size_grow", name: "Gigantism", description: "Body segments grow 15% larger, harder to dodge.", icon: "\u{1F422}", rarity: "uncommon", effect: "negative", effects: { sizeMultiplier: 0.15 }, stability: 65 },
  { id: "mut_size_shrink", name: "Dwarfism", description: "Body segments shrink 10%, easier to navigate.", icon: "\u{1F539}", rarity: "uncommon", effect: "positive", effects: { sizeMultiplier: -0.1 }, stability: 65 },
  { id: "mut_xp_boost", name: "Rapid Learning", description: "Neural enhancement grants 20% more XP.", icon: "\u{1F9E0}", rarity: "uncommon", effect: "positive", effects: { xpMultiplier: 0.2 }, stability: 60 },
  { id: "mut_fragile", name: "Fragile Bones", description: "Structural weakness: -1 effective armor.", icon: "\u{1F9CA}", rarity: "uncommon", effect: "negative", effects: { armor: -1 }, stability: 55 },
  { id: "mut_magnet", name: "Food Magnet", description: "Attracts nearby food items within 2 tiles.", icon: "\u{1F9F2}", rarity: "rare", effect: "positive", effects: { magnetRadius: 2 }, stability: 50 },
  { id: "mut_slow_digest", name: "Slow Metabolism", description: "Food grants double growth but -8% speed.", icon: "\u{1F40D}", rarity: "rare", effect: "neutral", effects: { growthMultiplier: 2.0, speed: -0.08 }, stability: 45 },
  { id: "mut_regenerate", name: "Hyper-Regen", description: "Rapidly regenerate lost segments every 20 seconds.", icon: "\u{1F49A}", rarity: "rare", effect: "positive", effects: { passiveRegen: 1, passiveRegenInterval: 20 }, stability: 40 },
  { id: "mut_cursed", name: "Ancient Curse", description: "An ancient hex: -15% score but +20% speed.", icon: "\u{1F5B2}", rarity: "rare", effect: "neutral", effects: { scoreMultiplier: -0.15, speed: 0.2 }, stability: 35 },
  { id: "mut_lucky", name: "Golden Gene", description: "Increases rare item drop chance by 25%.", icon: "\u{1F340}", rarity: "rare", effect: "positive", effects: { luckBonus: 0.25 }, stability: 45 },
  { id: "mut_mirror", name: "Mirror Image", description: "Creates a harmless visual clone that confuses enemies.", icon: "\u{1FA9E}", rarity: "rare", effect: "positive", effects: { cloneConfuse: 1 }, stability: 40 },
  { id: "mut_venom", name: "Toxic Bite", description: "Biting enemies deals 1 bonus poison damage.", icon: "\u{1F489}", rarity: "legendary", effect: "positive", effects: { poisonDamage: 1 }, stability: 25 },
  { id: "mut_time_warp", name: "Temporal Flux", description: "Randomly speeds up or slows time by 10%.", icon: "\u231B", rarity: "legendary", effect: "neutral", effects: { timeWarp: 0.1 }, stability: 20 },
  { id: "mut_adaptive", name: "Adaptive Genome", description: "Automatically adapts: gains 5% to your weakest stat.", icon: "\u{1F9EC}", rarity: "legendary", effect: "positive", effects: { adaptiveBoost: 0.05 }, stability: 30 },
  { id: "mut_berserk", name: "Berserker Gene", description: "+30% speed and power, but -50% control.", icon: "\u{1F4A5}", rarity: "legendary", effect: "neutral", effects: { speed: 0.3, power: 0.3, control: -0.5 }, stability: 15 },
  { id: "mut_phantom", name: "Phantom Trait", description: "15% chance to phase through any obstacle.", icon: "\u{1F47B}", rarity: "legendary", effect: "positive", effects: { phaseChance: 0.15 }, stability: 25 },
  { id: "mut_entropy", name: "Entropy Decay", description: "Constantly loses 1 segment every 45 seconds.", icon: "\u{1F300}", rarity: "legendary", effect: "negative", effects: { decayRate: 1, decayInterval: 45 }, stability: 10 },
];

// -----------------------------------------------------------------------------
// Constants — Synergy Definitions
// -----------------------------------------------------------------------------

const SYNERGY_DEFS: MutationSynergy[] = [
  { id: "syn_speed_venom", mutation1: "mut_speed_boost", mutation2: "mut_venom", name: "Toxic Velocity", description: "Speed-enhanced venom spreads further and deals increased damage.", bonusEffects: { poisonDamage: 1, speed: 0.05 }, icon: "\u{1F40D}" },
  { id: "syn_lucky_magnet", mutation1: "mut_lucky", mutation2: "mut_magnet", name: "Fortune Attractor", description: "Magnetic attraction now prioritizes rare items.", bonusEffects: { luckBonus: 0.15, magnetRadius: 1 }, icon: "\u{1F340}" },
  { id: "syn_regen_shrink", mutation1: "mut_regenerate", mutation2: "mut_size_shrink", name: "Micro-Healing", description: "Smaller size increases regen efficiency.", bonusEffects: { passiveRegenInterval: -5 }, icon: "\u{1F49A}" },
  { id: "syn_adaptive_berserk", mutation1: "mut_adaptive", mutation2: "mut_berserk", name: "Controlled Fury", description: "Adaptive genome reduces the control penalty of berserker.", bonusEffects: { control: 0.2, power: 0.1 }, icon: "\u{1F4A5}" },
  { id: "syn_phantom_mirror", mutation1: "mut_phantom", mutation2: "mut_mirror", name: "Spectral Army", description: "Mirror clones gain phasing abilities.", bonusEffects: { cloneConfuse: 1, phaseChance: 0.05 }, icon: "\u{1F47B}" },
  { id: "syn_xp_lucky", mutation1: "mut_xp_boost", mutation2: "mut_lucky", name: "Blessed Wisdom", description: "Lucky drops also grant bonus XP.", bonusEffects: { xpMultiplier: 0.1, luckBonus: 0.1 }, icon: "\u{1F9E0}" },
  { id: "syn_cursed_entropy", mutation1: "mut_cursed", mutation2: "mut_entropy", name: "Doom Spiral", description: "Curse and entropy amplify each other — high risk, high reward.", bonusEffects: { scoreMultiplier: -0.1, speed: 0.1 }, icon: "\u{1F5B2}" },
  { id: "syn_extra_fragile", mutation1: "mut_extra_life", mutation2: "mut_fragile", name: "Glass Cannon", description: "Extra life compensates for fragility — live dangerously.", bonusEffects: { extraLives: 1, armor: -0.5 }, icon: "\u{1F9CA}" },
  { id: "syn_speed_berserk", mutation1: "mut_speed_boost", mutation2: "mut_berserk", name: "Blitzkrieg", description: "Combined speed mutations create an unstoppable force.", bonusEffects: { speed: 0.15, power: 0.15 }, icon: "\u26A1" },
  { id: "syn_magnet_slow_digest", mutation1: "mut_magnet", mutation2: "mut_slow_digest", name: "Greedy Guts", description: "Magnet pulls food directly into enhanced metabolism.", bonusEffects: { magnetRadius: 1, growthMultiplier: 0.5 }, icon: "\u{1F9F2}" },
];

// -----------------------------------------------------------------------------
// Constants — DNA Strand Definitions (10 strands)
// -----------------------------------------------------------------------------

interface DNADef {
  id: DNAStrandId;
  name: string;
  description: string;
  icon: string;
  rarity: MutationRarity;
  bonus: Record<string, number>;
  fragmentsNeeded: number;
}

const DNA_DEFS: DNADef[] = [
  { id: "alpha", name: "Alpha Strand", description: "The primordial strand of speed. Enhances all movement abilities.", icon: "\u{1F300}", rarity: "common", bonus: { speed: 0.15, acceleration: 0.1 }, fragmentsNeeded: 3 },
  { id: "beta", name: "Beta Strand", description: "The strand of power. Boosts destructive capabilities.", icon: "\u{1F4AA}", rarity: "common", bonus: { scoreMultiplier: 0.1, power: 0.1 }, fragmentsNeeded: 3 },
  { id: "gamma", name: "Gamma Strand", description: "The strand of resilience. Improves defensive traits.", icon: "\u{1F6E1}\uFE0F", rarity: "uncommon", bonus: { armor: 1, damageReduction: 0.15 }, fragmentsNeeded: 4 },
  { id: "delta", name: "Delta Strand", description: "The strand of adaptation. Boosts XP gain and learning.", icon: "\u{1F9EC}", rarity: "uncommon", bonus: { xpMultiplier: 0.25 }, fragmentsNeeded: 4 },
  { id: "epsilon", name: "Epsilon Strand", description: "The strand of fortune. Enhances luck and rare drops.", icon: "\u{1F340}", rarity: "uncommon", bonus: { luckBonus: 0.3 }, fragmentsNeeded: 5 },
  { id: "zeta", name: "Zeta Strand", description: "The strand of regeneration. Improves healing and revival.", icon: "\u{1F49A}", rarity: "rare", bonus: { extraLives: 1, passiveRegen: 1, passiveRegenInterval: -5 }, fragmentsNeeded: 5 },
  { id: "eta", name: "Eta Strand", description: "The strand of frost. Enhances ice path abilities.", icon: "\u2744\uFE0F", rarity: "rare", bonus: { enemySlow: 0.1, blizzardRadius: 2 }, fragmentsNeeded: 6 },
  { id: "theta", name: "Theta Strand", description: "The strand of shadows. Enhances stealth and vision.", icon: "\u{1F311}", rarity: "rare", bonus: { detectionReduction: 0.15, revealRadius: 2 }, fragmentsNeeded: 6 },
  { id: "iota", name: "Iota Strand", description: "The strand of elements. Synergizes all elemental paths.", icon: "\u{1F52E}", rarity: "legendary", bonus: { elementalSynergy: 0.2, allPathBonus: 0.05 }, fragmentsNeeded: 8 },
  { id: "omega", name: "Omega Strand", description: "The ultimate strand. Master of all evolutionary paths.", icon: "\u{1F451}", rarity: "legendary", bonus: { allPathBonus: 0.15, xpMultiplier: 0.5, luckBonus: 0.25 }, fragmentsNeeded: 10 },
];

// -----------------------------------------------------------------------------
// State Initialization (SSR-safe)
// -----------------------------------------------------------------------------

let state: EvolutionState | null = null;

function ensureInit(): EvolutionState {
  if (state) return state;

  const paths: Record<EvoPathId, EvoPath> = {} as Record<EvoPathId, EvoPath>;
  for (const def of PATH_DEFS) {
    const stages: EvoStageData[] = STAGE_ORDER.map((stage, idx) => ({
      stage,
      order: idx,
      label: STAGE_LABELS[stage],
      xpRequired: STAGE_XP[stage],
      abilities: ABILITY_DEFS
        .filter((a) => a.path === def.id && a.stage === stage)
        .map((a) => a.id),
      visualTheme: VISUAL_THEMES[def.id][stage],
    }));

    const stageProgress: Record<EvoStage, { xp: number; completed: boolean }> =
      {} as Record<EvoStage, { xp: number; completed: boolean }>;
    for (const stage of STAGE_ORDER) {
      stageProgress[stage] = { xp: 0, completed: false };
    }

    paths[def.id] = {
      id: def.id,
      name: def.name,
      icon: def.icon,
      color: def.color,
      description: def.description,
      focus: def.focus,
      stages,
      stageProgress,
      currentStage: "embryo",
      totalXP: 0,
      completionPercent: 0,
    };
  }

  const abilities: Record<string, EvoAbility> = {};
  for (const def of ABILITY_DEFS) {
    abilities[def.id] = {
      id: def.id,
      path: def.path,
      stage: def.stage,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked: false,
      active: false,
      effect: { ...def.effect },
    };
  }

  const mutations: Record<string, Mutation> = {};
  for (const def of MUTATION_DEFS) {
    mutations[def.id] = {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      rarity: def.rarity,
      effect: def.effect,
      effects: { ...def.effects },
      stability: def.stability,
      active: false,
      appliedAt: null,
      timesApplied: 0,
    };
  }

  const synergies: Record<string, MutationSynergy> = {};
  for (const syn of SYNERGY_DEFS) {
    synergies[syn.id] = { ...syn, bonusEffects: { ...syn.bonusEffects } };
  }

  const dna: Record<DNAStrandId, DNAStrandData> = {} as Record<DNAStrandId, DNAStrandData>;
  for (const def of DNA_DEFS) {
    dna[def.id] = {
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      collected: false,
      collectedAt: null,
      rarity: def.rarity,
      bonus: { ...def.bonus },
      fragmentCount: 0,
      fragmentsNeeded: def.fragmentsNeeded,
      combined: false,
    };
  }

  state = {
    currentPath: "serpent",
    paths,
    abilities,
    mutations,
    synergies,
    dna,
    evolutionHistory: [],
    totalMutationsApplied: 0,
    lastMutationRollTime: 0,
    initializedAt: Date.now(),
  };

  return state;
}

function addHistory(
  action: EvoHistoryEntry["action"],
  details: string,
  path?: EvoPathId,
  relatedId?: string,
): void {
  const s = ensureInit();
  s.evolutionHistory.push({
    timestamp: Date.now(),
    action,
    details,
    path,
    relatedId,
  });
  // Keep only the last 20 entries
  if (s.evolutionHistory.length > 20) {
    s.evolutionHistory = s.evolutionHistory.slice(-20);
  }
}

function getActiveMutationIds(): string[] {
  const s = ensureInit();
  return Object.values(s.mutations)
    .filter((m) => m.active)
    .map((m) => m.id);
}

function computePathCompletion(path: EvoPath): number {
  let totalXPNeeded = 0;
  let totalXPEarned = 0;
  for (const stage of STAGE_ORDER) {
    totalXPNeeded += STAGE_XP[stage];
    totalXPEarned += path.stageProgress[stage].xp;
  }
  return Math.min(1, totalXPEarned / totalXPNeeded);
}

// =============================================================================
// EXPORTED FUNCTIONS
// =============================================================================

// -----------------------------------------------------------------------------
// 1. State Management
// -----------------------------------------------------------------------------

/**
 * Retrieve the full evolution state. Initializes on first call (SSR-safe).
 */
export function evGetState(): EvolutionState {
  return ensureInit();
}

/**
 * Reset the entire evolution system to its initial state.
 */
export function evResetState(): void {
  state = null;
  ensureInit(); // re-initialize fresh state
  addHistory("reset", "Full evolution state reset.");
}

// -----------------------------------------------------------------------------
// 2. Evolution Paths
// -----------------------------------------------------------------------------

/**
 * Get all 5 evolution paths with their full stage and ability data.
 */
export function evGetEvolutionPaths(): EvoPath[] {
  const s = ensureInit();
  return Object.values(s.paths);
}

/**
 * Get the currently active evolution path.
 */
export function evGetCurrentPath(): EvoPath {
  const s = ensureInit();
  return s.paths[s.currentPath];
}

/**
 * Set the active evolution path. Returns the new path.
 */
export function evSetCurrentPath(path: EvoPathId): EvoPath {
  const s = ensureInit();
  if (!s.paths[path]) {
    throw new Error(`Invalid evolution path: ${path}`);
  }
  const oldPath = s.currentPath;
  s.currentPath = path;
  addHistory("path_change", `Changed path from ${oldPath} to ${path}.`, path);
  return s.paths[path];
}

// -----------------------------------------------------------------------------
// 3. Stage Progress & XP
// -----------------------------------------------------------------------------

/**
 * Get current stage progress for the active path.
 * Returns { currentStage, currentXP, xpRequired, progressPercent, canEvolve }.
 */
export function evGetStageProgress(): {
  currentStage: EvoStage;
  currentXP: number;
  xpRequired: number;
  progressPercent: number;
  canEvolve: boolean;
} {
  const s = ensureInit();
  const path = s.paths[s.currentPath];
  const stage = path.currentStage;
  const currentXP = path.stageProgress[stage].xp;
  const xpRequired = STAGE_XP[stage];
  const progressPercent = Math.min(1, currentXP / xpRequired);
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const canEvolve =
    progressPercent >= 1 && stageIndex < STAGE_ORDER.length - 1 && !path.stageProgress[stage].completed;

  return { currentStage: stage, currentXP, xpRequired, progressPercent, canEvolve };
}

/**
 * Add XP to the current path's current stage.
 * Returns updated stage progress.
 */
export function evAddXP(amount: number): ReturnType<typeof evGetStageProgress> {
  const s = ensureInit();
  const path = s.paths[s.currentPath];
  path.stageProgress[path.currentStage].xp += amount;
  path.totalXP += amount;
  path.completionPercent = computePathCompletion(path);
  return evGetStageProgress();
}

/**
 * Trigger evolution to the next stage if eligible.
 * Returns { success, newStage, unlockedAbilities } or { success: false, reason }.
 */
export function evEvolve():
  | { success: true; newStage: EvoStage; unlockedAbilities: EvoAbility[]; visualTheme: string }
  | { success: false; reason: string } {
  const s = ensureInit();
  const path = s.paths[s.currentPath];
  const progress = evGetStageProgress();

  if (!progress.canEvolve) {
    return {
      success: false,
      reason: progress.currentStage === "apex"
        ? "Already at Apex stage — cannot evolve further."
        : "Not enough XP to evolve. Keep playing!",
    };
  }

  path.stageProgress[path.currentStage].completed = true;
  const stageIndex = STAGE_ORDER.indexOf(path.currentStage);
  const newStage = STAGE_ORDER[stageIndex + 1];
  path.currentStage = newStage;

  // Auto-unlock abilities for the new stage
  const unlockedAbilities: EvoAbility[] = [];
  for (const abilityId of path.stages.find((st) => st.stage === newStage)?.abilities ?? []) {
    s.abilities[abilityId].unlocked = true;
    unlockedAbilities.push(s.abilities[abilityId]);
  }

  const visualTheme = VISUAL_THEMES[s.currentPath][newStage];
  addHistory("evolve", `Evolved to ${STAGE_LABELS[newStage]} stage on ${path.name}.`, s.currentPath);

  return { success: true, newStage, unlockedAbilities, visualTheme };
}

// -----------------------------------------------------------------------------
// 4. Abilities
// -----------------------------------------------------------------------------

/**
 * Get all abilities, optionally filtered by path and/or stage.
 */
export function evGetAbilities(filter?: { path?: EvoPathId; stage?: EvoStage; active?: boolean; unlocked?: boolean }): EvoAbility[] {
  const s = ensureInit();
  let result = Object.values(s.abilities);
  if (filter?.path) result = result.filter((a) => a.path === filter.path);
  if (filter?.stage) result = result.filter((a) => a.stage === filter.stage);
  if (filter?.active !== undefined) result = result.filter((a) => a.active === filter.active);
  if (filter?.unlocked !== undefined) result = result.filter((a) => a.unlocked === filter.unlocked);
  return result;
}

/**
 * Unlock a specific ability by ID. Returns the ability or throws if not eligible.
 */
export function evUnlockAbility(id: string): EvoAbility {
  const s = ensureInit();
  const ability = s.abilities[id];
  if (!ability) throw new Error(`Ability not found: ${id}`);
  if (ability.unlocked) return ability;

  // Check if the parent stage is unlocked
  const path = s.paths[ability.path];
  const stageIdx = STAGE_ORDER.indexOf(ability.stage);
  const currentIdx = STAGE_ORDER.indexOf(path.currentStage);
  if (stageIdx > currentIdx) {
    throw new Error(`Cannot unlock ${ability.name}: stage ${STAGE_LABELS[ability.stage]} not yet reached.`);
  }

  ability.unlocked = true;
  addHistory("ability_unlock", `Unlocked ability: ${ability.name}.`, ability.path, id);
  return ability;
}

/**
 * Activate an unlocked ability by ID. Returns the ability.
 */
export function evActivateAbility(id: string): EvoAbility {
  const s = ensureInit();
  const ability = s.abilities[id];
  if (!ability) throw new Error(`Ability not found: ${id}`);
  if (!ability.unlocked) throw new Error(`Ability ${ability.name} is not unlocked yet.`);
  ability.active = true;
  addHistory("ability_activate", `Activated ability: ${ability.name}.`, ability.path, id);
  return ability;
}

/**
 * Get available upgrades at a specific stage for the current path.
 */
export function evGetStageUpgrades(stage: EvoStage): EvoAbility[] {
  const s = ensureInit();
  const path = s.paths[s.currentPath];
  const stageData = path.stages.find((st) => st.stage === stage);
  if (!stageData) return [];
  return stageData.abilities
    .map((aid) => s.abilities[aid])
    .filter(Boolean);
}

// -----------------------------------------------------------------------------
// 5. Mutations
// -----------------------------------------------------------------------------

/**
 * Get all mutations, optionally filtered by active status or rarity.
 */
export function evGetMutations(filter?: { active?: boolean; rarity?: MutationRarity }): Mutation[] {
  const s = ensureInit();
  let result = Object.values(s.mutations);
  if (filter?.active !== undefined) result = result.filter((m) => m.active === filter.active);
  if (filter?.rarity) result = result.filter((m) => m.rarity === filter.rarity);
  return result;
}

/**
 * Roll a random mutation. Respects a minimum cooldown of 10 seconds between rolls.
 * Returns the rolled mutation (not yet applied).
 */
export function evRollMutation(): Mutation {
  const s = ensureInit();
  const now = Date.now();
  if (now - s.lastMutationRollTime < 10_000) {
    throw new Error("Mutation roll is on cooldown. Wait 10 seconds between rolls.");
  }
  s.lastMutationRollTime = now;

  const activeCount = getActiveMutationIds().length;
  if (activeCount >= 3) {
    throw new Error("Maximum 3 active mutations. Remove one before rolling again.");
  }

  // Weight by rarity: common 40%, uncommon 30%, rare 20%, legendary 10%
  const weights: Record<MutationRarity, number> = { common: 40, uncommon: 30, rare: 20, legendary: 10 };
  const pool: Mutation[] = [];
  for (const mut of Object.values(s.mutations)) {
    if (!mut.active) {
      const w = weights[mut.rarity];
      for (let i = 0; i < w; i++) pool.push(mut);
    }
  }

  if (pool.length === 0) throw new Error("No mutations available to roll.");
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

/**
 * Apply a mutation by ID. Marks it as active and tracks stats.
 */
export function evApplyMutation(id: string): Mutation {
  const s = ensureInit();
  const mutation = s.mutations[id];
  if (!mutation) throw new Error(`Mutation not found: ${id}`);

  const activeCount = getActiveMutationIds().length;
  if (mutation.active) return mutation;
  if (activeCount >= 3) {
    throw new Error("Maximum 3 active mutations. Remove one before applying.");
  }

  mutation.active = true;
  mutation.appliedAt = Date.now();
  mutation.timesApplied += 1;
  s.totalMutationsApplied += 1;

  addHistory("mutation_apply", `Applied mutation: ${mutation.name} (${mutation.rarity}).`, undefined, id);
  return mutation;
}

/**
 * Remove an active mutation by ID.
 */
export function evRemoveMutation(id: string): Mutation {
  const s = ensureInit();
  const mutation = s.mutations[id];
  if (!mutation) throw new Error(`Mutation not found: ${id}`);
  if (!mutation.active) return mutation;
  mutation.active = false;
  mutation.appliedAt = null;
  addHistory("mutation_remove", `Removed mutation: ${mutation.name}.`, undefined, id);
  return mutation;
}

/**
 * Calculate the overall mutation synergy score based on active mutation pairs.
 * Returns a number from 0-100 representing how well mutations work together.
 */
export function evGetMutationSynergy(): {
  score: number;
  activeSynergies: MutationSynergy[];
  bonusEffects: Record<string, number>;
} {
  const s = ensureInit();
  const activeIds = getActiveMutationIds();
  const activeSynergies: MutationSynergy[] = [];
  const bonusEffects: Record<string, number> = {};

  for (const syn of Object.values(s.synergies)) {
    if (activeIds.includes(syn.mutation1) && activeIds.includes(syn.mutation2)) {
      activeSynergies.push(syn);
      for (const [key, val] of Object.entries(syn.bonusEffects)) {
        bonusEffects[key] = (bonusEffects[key] ?? 0) + val;
      }
    }
  }

  // Base score from synergies
  let score = activeSynergies.length * 20;
  // Bonus from mutation compatibility (same rarity or complementary effects)
  const activeMuts = activeIds.map((id) => s.mutations[id]);
  for (let i = 0; i < activeMuts.length; i++) {
    for (let j = i + 1; j < activeMuts.length; j++) {
      const a = activeMuts[i];
      const b = activeMuts[j];
      // Matching rarity gives bonus
      if (a.rarity === b.rarity) score += 5;
      // Same effect type (both positive or both negative) gives small bonus
      if (a.effect === b.effect) score += 3;
      // Higher stability = higher score contribution
      score += Math.floor((a.stability + b.stability) / 40);
    }
  }

  score = Math.min(100, score);
  return { score, activeSynergies, bonusEffects };
}

/**
 * Check if two specific mutations have a defined synergy.
 */
export function evHasSynergy(mutation1: string, mutation2: string): boolean {
  const s = ensureInit();
  return Object.values(s.synergies).some(
    (syn) =>
      (syn.mutation1 === mutation1 && syn.mutation2 === mutation2) ||
      (syn.mutation1 === mutation2 && syn.mutation2 === mutation1),
  );
}

/**
 * Get the synergy description for a specific synergy ID.
 */
export function evGetSynergyDescription(synergyId: string): MutationSynergy | null {
  const s = ensureInit();
  return s.synergies[synergyId] ?? null;
}

/**
 * Get total number of mutations ever applied across all sessions.
 */
export function evGetTotalMutationsApplied(): number {
  const s = ensureInit();
  return s.totalMutationsApplied;
}

/**
 * Get the rarest mutation that has ever been applied (highest rarity).
 */
export function evGetRarestMutation(): Mutation | null {
  const s = ensureInit();
  const rarityOrder: MutationRarity[] = ["common", "uncommon", "rare", "legendary"];
  const applied = Object.values(s.mutations).filter((m) => m.timesApplied > 0);
  if (applied.length === 0) return null;
  applied.sort((a, b) => rarityOrder.indexOf(b.rarity) - rarityOrder.indexOf(a.rarity));
  return applied[0];
}

// -----------------------------------------------------------------------------
// 6. DNA System
// -----------------------------------------------------------------------------

/**
 * Get all DNA strands with their collection and combination status.
 */
export function evGetDNA(): DNAStrandData[] {
  const s = ensureInit();
  return Object.values(s.dna);
}

/**
 * Collect a DNA strand (first discovery) or add a fragment.
 * Returns the updated strand.
 */
export function evCollectDNA(id: DNAStrandId): DNAStrandData {
  const s = ensureInit();
  const strand = s.dna[id];
  if (!strand) throw new Error(`DNA strand not found: ${id}`);

  if (strand.combined) return strand;

  if (!strand.collected) {
    strand.collected = true;
    strand.collectedAt = Date.now();
    strand.fragmentCount = 1;
  } else {
    strand.fragmentCount += 1;
  }

  addHistory("dna_collect", `Collected ${strand.name} fragment (${strand.fragmentCount}/${strand.fragmentsNeeded}).`, undefined, id);
  return strand;
}

/**
 * Attempt to combine collected DNA fragments into a complete strand.
 * Requires fragmentCount >= fragmentsNeeded. Returns the strand if successful.
 */
export function evCombineDNA(id: DNAStrandId): DNAStrandData {
  const s = ensureInit();
  const strand = s.dna[id];
  if (!strand) throw new Error(`DNA strand not found: ${id}`);
  if (!strand.collected) throw new Error(`${strand.name} has not been collected yet.`);
  if (strand.combined) return strand;
  if (strand.fragmentCount < strand.fragmentsNeeded) {
    throw new Error(
      `Need ${strand.fragmentsNeeded - strand.fragmentCount} more fragments to combine ${strand.name}.`,
    );
  }

  strand.combined = true;
  addHistory("dna_combine", `Combined complete ${strand.name}! Bonuses unlocked.`, undefined, id);
  return strand;
}

// -----------------------------------------------------------------------------
// 7. History & Overview
// -----------------------------------------------------------------------------

/**
 * Get the last 20 evolution history entries, most recent first.
 */
export function evGetEvolutionHistory(): EvoHistoryEntry[] {
  const s = ensureInit();
  return [...s.evolutionHistory].reverse();
}

/**
 * Get a high-level overview of the evolution system state.
 */
export function evGetEvolutionOverview(): {
  currentPath: EvoPath;
  totalXP: number;
  globalCompletionPercent: number;
  unlockedAbilitiesCount: number;
  totalAbilitiesCount: number;
  activeMutations: number;
  totalDNACollected: number;
  totalDNACombined: number;
  synergyScore: number;
  evolutionCount: number;
  sessionAge: number;
} {
  const s = ensureInit();
  const currentPath = s.paths[s.currentPath];
  const allAbilities = Object.values(s.abilities);
  const unlockedCount = allAbilities.filter((a) => a.unlocked).length;
  const globalXP = Object.values(s.paths).reduce((sum, p) => sum + p.totalXP, 0);
  const globalMaxXP = 5 * STAGE_ORDER.reduce((sum, st) => sum + STAGE_XP[st], 0);
  const { score: synScore } = evGetMutationSynergy();
  const allDNA = Object.values(s.dna);
  const evoCount = s.evolutionHistory.filter((e) => e.action === "evolve").length;

  return {
    currentPath,
    totalXP: globalXP,
    globalCompletionPercent: Math.min(1, globalXP / globalMaxXP),
    unlockedAbilitiesCount: unlockedCount,
    totalAbilitiesCount: allAbilities.length,
    activeMutations: getActiveMutationIds().length,
    totalDNACollected: allDNA.filter((d) => d.collected).length,
    totalDNACombined: allDNA.filter((d) => d.combined).length,
    synergyScore: synScore,
    evolutionCount: evoCount,
    sessionAge: Date.now() - s.initializedAt,
  };
}

/**
 * Get the full evolution tree visualization data.
 * Returns a nested structure suitable for rendering a tree UI.
 */
export function evGetEvolutionTree(): {
  currentPath: EvoPathId;
  paths: Array<{
    id: EvoPathId;
    name: string;
    icon: string;
    color: string;
    stages: Array<{
      stage: EvoStage;
      label: string;
      xp: number;
      xpRequired: number;
      completed: boolean;
      isCurrent: boolean;
      abilities: Array<{
        id: string;
        name: string;
        icon: string;
        unlocked: boolean;
        active: boolean;
      }>;
      visualTheme: string;
    }>;
    completionPercent: number;
  }>;
  completedAbilities: number;
  totalAbilities: number;
} {
  const s = ensureInit();
  const allAbilities = Object.values(s.abilities);
  const completedAbilities = allAbilities.filter((a) => a.unlocked).length;

  const treePaths = PATH_DEFS.map((def) => {
    const path = s.paths[def.id];
    return {
      id: def.id,
      name: def.name,
      icon: def.icon,
      color: def.color,
      stages: STAGE_ORDER.map((stage) => {
        const stageData = path.stages.find((st) => st.stage === stage)!;
        const progress = path.stageProgress[stage];
        return {
          stage,
          label: stageData.label,
          xp: progress.xp,
          xpRequired: stageData.xpRequired,
          completed: progress.completed,
          isCurrent: path.currentStage === stage,
          abilities: stageData.abilities.map((aid) => {
            const ab = s.abilities[aid];
            return {
              id: ab.id,
              name: ab.name,
              icon: ab.icon,
              unlocked: ab.unlocked,
              active: ab.active,
            };
          }),
          visualTheme: stageData.visualTheme,
        };
      }),
      completionPercent: path.completionPercent,
    };
  });

  return {
    currentPath: s.currentPath,
    paths: treePaths,
    completedAbilities,
    totalAbilities: allAbilities.length,
  };
}

// -----------------------------------------------------------------------------
// 8. Dashboard
// -----------------------------------------------------------------------------

/**
 * Get the main evolution dashboard data — a comprehensive summary for UI rendering.
 */
export function evGetEvolutionDashboard(): {
  currentPath: EvoPath;
  stageProgress: ReturnType<typeof evGetStageProgress>;
  recentHistory: EvoHistoryEntry[];
  activeEffects: Record<string, number>;
  synergyInfo: ReturnType<typeof evGetMutationSynergy>;
  dnaStatus: { collected: number; combined: number; total: number };
  treeCompletion: number;
  funStats: {
    totalMutationsApplied: number;
    rarestMutation: string | null;
    sessionDuration: string;
    evolutionsThisSession: number;
  };
} {
  const overview = evGetEvolutionOverview();
  const stageProgress = evGetStageProgress();
  const activeEffects = evGetActiveEffects();
  const synergyInfo = evGetMutationSynergy();
  const rarest = evGetRarestMutation();
  const sessionSeconds = Math.floor(overview.sessionAge / 1000);

  return {
    currentPath: overview.currentPath,
    stageProgress,
    recentHistory: evGetEvolutionHistory().slice(0, 5),
    activeEffects,
    synergyInfo,
    dnaStatus: {
      collected: overview.totalDNACollected,
      combined: overview.totalDNACombined,
      total: 10,
    },
    treeCompletion: overview.globalCompletionPercent,
    funStats: {
      totalMutationsApplied: evGetTotalMutationsApplied(),
      rarestMutation: rarest?.name ?? null,
      sessionDuration: formatDuration(sessionSeconds),
      evolutionsThisSession: overview.evolutionCount,
    },
  };
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(" ");
}

// -----------------------------------------------------------------------------
// 9. Path Stats & Reset
// -----------------------------------------------------------------------------

/**
 * Get detailed stats for a specific evolution path.
 */
export function evGetPathStats(path: EvoPathId): {
  path: EvoPath;
  abilitiesUnlocked: number;
  abilitiesActive: number;
  totalAbilities: number;
  highestStage: EvoStage;
  stageBreakdown: Array<{ stage: EvoStage; label: string; xp: number; xpRequired: number; completed: boolean }>;
  isActive: boolean;
} {
  const s = ensureInit();
  const p = s.paths[path];
  if (!p) throw new Error(`Path not found: ${path}`);

  const pathAbilities = Object.values(s.abilities).filter((a) => a.path === path);
  const unlocked = pathAbilities.filter((a) => a.unlocked).length;
  const active = pathAbilities.filter((a) => a.active).length;
  const currentIdx = STAGE_ORDER.indexOf(p.currentStage);
  const highestStage = STAGE_ORDER[Math.min(currentIdx, STAGE_ORDER.length - 1)];

  const stageBreakdown = STAGE_ORDER.map((stage) => {
    const progress = p.stageProgress[stage];
    return {
      stage,
      label: STAGE_LABELS[stage],
      xp: progress.xp,
      xpRequired: STAGE_XP[stage],
      completed: progress.completed,
    };
  });

  return {
    path: p,
    abilitiesUnlocked: unlocked,
    abilitiesActive: active,
    totalAbilities: pathAbilities.length,
    highestStage,
    stageBreakdown,
    isActive: s.currentPath === path,
  };
}

/**
 * Reset a single evolution path to its initial state (respec).
 */
export function evResetPath(path: EvoPathId): void {
  const s = ensureInit();
  if (!s.paths[path]) throw new Error(`Path not found: ${path}`);

  // Reset stage progress
  for (const stage of STAGE_ORDER) {
    s.paths[path].stageProgress[stage] = { xp: 0, completed: false };
  }
  s.paths[path].currentStage = "embryo";
  s.paths[path].totalXP = 0;
  s.paths[path].completionPercent = 0;

  // Lock all abilities for this path
  for (const ability of Object.values(s.abilities)) {
    if (ability.path === path) {
      ability.unlocked = false;
      ability.active = false;
    }
  }

  addHistory("reset", `Reset path: ${s.paths[path].name}.`, path);
}

// -----------------------------------------------------------------------------
// 10. Active Effects
// -----------------------------------------------------------------------------

/**
 * Get all combined active effects from the current path abilities, mutations,
 * DNA, and synergies. Merges into a single effect map.
 */
export function evGetActiveEffects(): Record<string, number> {
  const s = ensureInit();
  const effects: Record<string, number> = {};

  // From active abilities on current path
  for (const ability of Object.values(s.abilities)) {
    if (ability.active && ability.path === s.currentPath) {
      for (const [key, val] of Object.entries(ability.effect)) {
        effects[key] = (effects[key] ?? 0) + val;
      }
    }
  }

  // From active mutations
  for (const mut of Object.values(s.mutations)) {
    if (mut.active) {
      for (const [key, val] of Object.entries(mut.effects)) {
        effects[key] = (effects[key] ?? 0) + val;
      }
    }
  }

  // From combined DNA
  for (const strand of Object.values(s.dna)) {
    if (strand.combined) {
      for (const [key, val] of Object.entries(strand.bonus)) {
        effects[key] = (effects[key] ?? 0) + val;
      }
    }
  }

  // From active synergies
  const { bonusEffects: synBonus } = evGetMutationSynergy();
  for (const [key, val] of Object.entries(synBonus)) {
    effects[key] = (effects[key] ?? 0) + val;
  }

  return effects;
}

// -----------------------------------------------------------------------------
// 11. UI Card Helpers
// -----------------------------------------------------------------------------

/**
 * Get a display-ready card for a specific evolution path.
 */
export function evGetPathCard(path: EvoPathId): {
  id: EvoPathId;
  name: string;
  icon: string;
  color: string;
  description: string;
  focus: string;
  currentStage: EvoStage;
  stageLabel: string;
  completionPercent: number;
  visualTheme: string;
  isActive: boolean;
  abilitiesCount: number;
  abilitiesUnlocked: number;
} {
  const s = ensureInit();
  const p = s.paths[path];
  const pathAbilities = ABILITY_DEFS.filter((a) => a.path === path);
  const unlocked = pathAbilities.filter((aid) => s.abilities[aid.id]?.unlocked).length;

  return {
    id: p.id,
    name: p.name,
    icon: p.icon,
    color: p.color,
    description: p.description,
    focus: p.focus,
    currentStage: p.currentStage,
    stageLabel: STAGE_LABELS[p.currentStage],
    completionPercent: p.completionPercent,
    visualTheme: VISUAL_THEMES[path][p.currentStage],
    isActive: s.currentPath === path,
    abilitiesCount: pathAbilities.length,
    abilitiesUnlocked: unlocked,
  };
}

/**
 * Get a display-ready card for a specific ability.
 */
export function evGetAbilityCard(id: string): {
  id: string;
  name: string;
  icon: string;
  description: string;
  path: EvoPathId;
  pathIcon: string;
  pathColor: string;
  stage: EvoStage;
  stageLabel: string;
  unlocked: boolean;
  active: boolean;
  effectSummary: string;
} {
  const s = ensureInit();
  const ability = s.abilities[id];
  if (!ability) throw new Error(`Ability not found: ${id}`);

  const pathDef = PATH_DEFS.find((p) => p.id === ability.path)!;

  const effectParts = Object.entries(ability.effect).map(([k, v]) => {
    const sign = v > 0 ? "+" : "";
    return `${k}: ${sign}${v}`;
  });

  return {
    id: ability.id,
    name: ability.name,
    icon: ability.icon,
    description: ability.description,
    path: ability.path,
    pathIcon: pathDef.icon,
    pathColor: pathDef.color,
    stage: ability.stage,
    stageLabel: STAGE_LABELS[ability.stage],
    unlocked: ability.unlocked,
    active: ability.active,
    effectSummary: effectParts.join(" | "),
  };
}

/**
 * Get a display-ready card for a specific mutation.
 */
export function evGetMutationCard(id: string): {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity: MutationRarity;
  rarityColor: string;
  effectType: MutationEffect;
  active: boolean;
  stability: number;
  stabilityLabel: string;
  timesApplied: number;
  synergyAvailable: boolean;
  effectSummary: string;
} {
  const s = ensureInit();
  const mutation = s.mutations[id];
  if (!mutation) throw new Error(`Mutation not found: ${id}`);

  const rarityColors: Record<MutationRarity, string> = {
    common: "#9ca3af",
    uncommon: "#22c55e",
    rare: "#3b82f6",
    legendary: "#f59e0b",
  };

  const stabilityLabel =
    mutation.stability >= 80 ? "Stable" :
    mutation.stability >= 60 ? "Moderate" :
    mutation.stability >= 40 ? "Unstable" :
    mutation.stability >= 20 ? "Volatile" : "Chaotic";

  const effectParts = Object.entries(mutation.effects).map(([k, v]) => {
    const sign = v > 0 ? "+" : "";
    return `${k}: ${sign}${v}`;
  });

  const hasSynergy = Object.values(s.synergies).some(
    (syn) => syn.mutation1 === id || syn.mutation2 === id,
  );

  return {
    id: mutation.id,
    name: mutation.name,
    icon: mutation.icon,
    description: mutation.description,
    rarity: mutation.rarity,
    rarityColor: rarityColors[mutation.rarity],
    effectType: mutation.effect,
    active: mutation.active,
    stability: mutation.stability,
    stabilityLabel,
    timesApplied: mutation.timesApplied,
    synergyAvailable: hasSynergy,
    effectSummary: effectParts.join(" | "),
  };
}

/**
 * Get a display-ready card for a specific DNA strand.
 */
export function evGetDNACard(id: DNAStrandId): {
  id: DNAStrandId;
  name: string;
  icon: string;
  description: string;
  rarity: MutationRarity;
  rarityColor: string;
  collected: boolean;
  collectedAt: number | null;
  fragmentCount: number;
  fragmentsNeeded: number;
  fragmentProgress: number;
  combined: boolean;
  bonusSummary: string;
} {
  const s = ensureInit();
  const strand = s.dna[id];
  if (!strand) throw new Error(`DNA strand not found: ${id}`);

  const rarityColors: Record<MutationRarity, string> = {
    common: "#9ca3af",
    uncommon: "#22c55e",
    rare: "#3b82f6",
    legendary: "#f59e0b",
  };

  const bonusParts = Object.entries(strand.bonus).map(([k, v]) => {
    const sign = v > 0 ? "+" : "";
    return `${k}: ${sign}${v}`;
  });

  return {
    id: strand.id,
    name: strand.name,
    icon: strand.icon,
    description: strand.description,
    rarity: strand.rarity,
    rarityColor: rarityColors[strand.rarity],
    collected: strand.collected,
    collectedAt: strand.collectedAt,
    fragmentCount: strand.fragmentCount,
    fragmentsNeeded: strand.fragmentsNeeded,
    fragmentProgress: strand.fragmentsNeeded > 0 ? strand.fragmentCount / strand.fragmentsNeeded : 0,
    combined: strand.combined,
    bonusSummary: bonusParts.join(" | "),
  };
}
