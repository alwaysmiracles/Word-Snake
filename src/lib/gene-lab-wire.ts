// ============================================================================
// Gene Lab System Wire Module — Word Snake Game
// Comprehensive gene extraction, splicing, mutation, and vault management.
// SSR-safe: no localStorage, window, document, setInterval, or addEventListener.
// All public functions use the `gn` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type GeneType =
  | "speed"
  | "growth"
  | "armor"
  | "vision"
  | "stealth"
  | "venom"
  | "regeneration"
  | "magnetic"
  | "elastic"
  | "psychic";

export type GeneTier = "fragment" | "strand" | "helix" | "chromosome" | "genome";

export type StationId =
  | "extraction"
  | "sequencing"
  | "splicing"
  | "incubation"
  | "mutation"
  | "synthesis"
  | "analyzer"
  | "vault";

export type TraitDominance = "dominant" | "recessive";

export type GeneRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface GeneDef {
  type: GeneType;
  label: string;
  description: string;
  baseEffect: number;
  rarity: GeneRarity;
  tier: GeneTier;
  purity: number;
  stability: number;
  dominance: TraitDominance;
  extractedAt: number;
  id: string;
}

export interface HybridRecipe {
  id: string;
  inputs: GeneType[];
  outputLabel: string;
  outputType: GeneType;
  outputDescription: string;
  outputEffect: number;
  outputRarity: GeneRarity;
  discovered: boolean;
}

export interface StationDef {
  id: StationId;
  label: string;
  description: string;
  unlockLevel: number;
  icon: string;
  active: boolean;
}

export interface MutationDef {
  id: string;
  label: string;
  description: string;
  effectType: "buff" | "debuff" | "neutral";
  powerRange: [number, number];
  riskMultiplier: number;
  cooldownRemaining: number;
}

export interface GeneAchievement {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  unlockedAt: number | null;
}

export interface DailyResearch {
  dateKey: string;
  topic: string;
  description: string;
  bonusXP: number;
  bonusGeneType: GeneType | null;
  completed: boolean;
  completedAt: number | null;
}

export interface EquippedSlot {
  slot: number;
  geneId: string | null;
}

export interface GeneLabState {
  labLevel: number;
  labXP: number;
  labXPToNext: number;
  stations: StationDef[];
  genes: GeneDef[];
  vault: string[];
  vaultMax: number;
  hybridRecipes: HybridRecipe[];
  mutations: MutationDef[];
  achievements: GeneAchievement[];
  dailyResearch: DailyResearch | null;
  researchStreak: number;
  lastResearchDate: string;
  equippedSlots: EquippedSlot[];
  totalExtractions: number;
  totalSplices: number;
  totalMutations: number;
  totalPurifications: number;
  dnaPoints: number;
  createdAt: number;
  lastUpdated: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GENE_TYPES: GeneType[] = [
  "speed", "growth", "armor", "vision", "stealth",
  "venom", "regeneration", "magnetic", "elastic", "psychic",
];

const GENE_LABELS: Record<GeneType, string> = {
  speed: "Speed Gene",
  growth: "Growth Gene",
  armor: "Armor Gene",
  vision: "Vision Gene",
  stealth: "Stealth Gene",
  venom: "Venom Gene",
  regeneration: "Regeneration Gene",
  magnetic: "Magnetic Gene",
  elastic: "Elastic Gene",
  psychic: "Psychic Gene",
};

const GENE_DESCRIPTIONS: Record<GeneType, string> = {
  speed: "Increases snake movement speed by a percentage.",
  growth: "Boosts snake length growth per food consumed.",
  armor: "Provides damage reduction from obstacles and hits.",
  vision: "Extends the visible grid area around the snake.",
  stealth: "Temporarily reduces aggro range of enemy entities.",
  venom: "Poisons consumed food, harming nearby rival snakes.",
  regeneration: "Slowly recovers lost body segments over time.",
  magnetic: "Attracts nearby food items toward the snake head.",
  elastic: "Allows the snake body to stretch through tight gaps.",
  psychic: "Grants brief foresight showing upcoming obstacle spawns.",
};

const GENE_BASE_EFFECTS: Record<GeneType, number> = {
  speed: 12,
  growth: 8,
  armor: 15,
  vision: 10,
  stealth: 7,
  venom: 9,
  regeneration: 6,
  magnetic: 11,
  elastic: 5,
  psychic: 8,
};

const GENE_RARITIES: Record<GeneType, GeneRarity> = {
  speed: "common",
  growth: "common",
  armor: "uncommon",
  vision: "uncommon",
  stealth: "rare",
  venom: "rare",
  regeneration: "epic",
  magnetic: "epic",
  elastic: "epic",
  psychic: "legendary",
};

const TIER_ORDER: GeneTier[] = ["fragment", "strand", "helix", "chromosome", "genome"];

const TIER_MULTIPLIER: Record<GeneTier, number> = {
  fragment: 1,
  strand: 1.5,
  helix: 2.2,
  chromosome: 3.5,
  genome: 5,
};

const RARITY_EXTRACTION_BASE: Record<GeneRarity, number> = {
  common: 85,
  uncommon: 60,
  rare: 40,
  epic: 22,
  legendary: 10,
};

const RARITY_SPICE_MOD: Record<GeneRarity, number> = {
  common: 1.0,
  uncommon: 0.9,
  rare: 0.75,
  epic: 0.55,
  legendary: 0.35,
};

const STATION_DEFS: Omit<StationDef, "active">[] = [
  { id: "extraction", label: "Extraction Lab", description: "Extract gene material from defeated monsters or special food items.", unlockLevel: 1, icon: "🧬" },
  { id: "sequencing", label: "Sequencing Station", description: "Sequence raw gene data to reveal hidden traits and potentials.", unlockLevel: 3, icon: "🔬" },
  { id: "splicing", label: "Splicing Bench", description: "Combine genes to create powerful hybrid gene variants.", unlockLevel: 5, icon: "🧪" },
  { id: "incubation", label: "Incubator", description: "Incubate gene samples to increase their tier and potency.", unlockLevel: 8, icon: "🫧" },
  { id: "mutation", label: "Mutation Chamber", description: "Induce controlled mutations to alter gene properties.", unlockLevel: 12, icon: "☢️" },
  { id: "synthesis", label: "Synthesis Engine", description: "Synthesize artificial gene fragments from raw DNA points.", unlockLevel: 18, icon: "⚙️" },
  { id: "analyzer", label: "Gene Analyzer", description: "Deep-analyze genes to discover purity, stability, and hidden traits.", unlockLevel: 25, icon: "📊" },
  { id: "vault", label: "Gene Vault", description: "Securely store your gene collection for later use and trading.", unlockLevel: 2, icon: "🏦" },
];

const HYBRID_RECIPES_RAW: Omit<HybridRecipe, "discovered">[] = [
  { id: "toxic_dash", inputs: ["speed", "venom"], outputLabel: "Toxic Dash", outputType: "venom", outputDescription: "Burst of speed that leaves a venom trail behind.", outputEffect: 18, outputRarity: "rare" },
  { id: "shield_magnet", inputs: ["armor", "magnetic"], outputLabel: "Shield Magnet", outputType: "armor", outputDescription: "Magnetic field that draws food and deflects obstacles.", outputEffect: 22, outputRarity: "epic" },
  { id: "swift_growth", inputs: ["speed", "growth"], outputLabel: "Swift Growth", outputType: "growth", outputDescription: "Rapid growth phase after consuming a food item.", outputEffect: 16, outputRarity: "uncommon" },
  { id: "regen_armor", inputs: ["regeneration", "armor"], outputLabel: "Regen Armor", outputType: "armor", outputDescription: "Armor that slowly repairs itself over time.", outputEffect: 20, outputRarity: "epic" },
  { id: "psychic_vision", inputs: ["psychic", "vision"], outputLabel: "Psychic Vision", outputType: "vision", outputDescription: "See through walls and predict obstacle spawns.", outputEffect: 24, outputRarity: "legendary" },
  { id: "elastic_stealth", inputs: ["elastic", "stealth"], outputLabel: "Elastic Stealth", outputType: "stealth", outputDescription: "Stretch body to squeeze through walls while invisible.", outputEffect: 19, outputRarity: "epic" },
  { id: "magnetic_venom", inputs: ["magnetic", "venom"], outputLabel: "Magnetic Venom", outputType: "venom", outputDescription: "Attract rivals into venom puddles on the field.", outputEffect: 21, outputRarity: "epic" },
  { id: "psychic_speed", inputs: ["psychic", "speed"], outputLabel: "Psychic Speed", outputType: "speed", outputDescription: "Precognitive reflexes grant temporary speed bursts.", outputEffect: 20, outputRarity: "rare" },
  { id: "growth_armor", inputs: ["growth", "armor"], outputLabel: "Iron Growth", outputType: "armor", outputDescription: "New body segments spawn with built-in armor plating.", outputEffect: 17, outputRarity: "rare" },
  { id: "stealth_vision", inputs: ["stealth", "vision"], outputLabel: "Shadow Sight", outputType: "vision", outputDescription: "See hidden paths while remaining undetected.", outputEffect: 15, outputRarity: "rare" },
  { id: "venom_regen", inputs: ["venom", "regeneration"], outputLabel: "Toxic Regen", outputType: "regeneration", outputDescription: "Regenerate health by absorbing venom from the environment.", outputEffect: 18, outputRarity: "epic" },
  { id: "elastic_growth", inputs: ["elastic", "growth"], outputLabel: "Rubber Form", outputType: "elastic", outputDescription: "Elastic body can expand to absorb extra food at once.", outputEffect: 14, outputRarity: "uncommon" },
  { id: "psychic_armor", inputs: ["psychic", "armor"], outputLabel: "Mind Shield", outputType: "armor", outputDescription: "Psychic barrier that deflects physical and energy attacks.", outputEffect: 23, outputRarity: "legendary" },
  { id: "magnetic_stealth", inputs: ["magnetic", "stealth"], outputLabel: "Phase Shift", outputType: "stealth", outputDescription: "Magnetic repulsion field grants brief intangibility.", outputEffect: 17, outputRarity: "rare" },
  { id: "regen_speed", inputs: ["regeneration", "speed"], outputLabel: "Healing Sprint", outputType: "speed", outputDescription: "Move fast while rapidly regenerating body segments.", outputEffect: 16, outputRarity: "rare" },
  { id: "vision_growth", inputs: ["vision", "growth"], outputLabel: "Forager's Eye", outputType: "vision", outputDescription: "Reveals food locations on the entire grid instantly.", outputEffect: 13, outputRarity: "uncommon" },
  { id: "elastic_venom", inputs: ["elastic", "venom"], outputLabel: "Toxic Stretch", outputType: "venom", outputDescription: "Stretch body to lay venom over a wide area.", outputEffect: 19, outputRarity: "epic" },
  { id: "psychic_regen", inputs: ["psychic", "regeneration"], outputLabel: "Mental Restore", outputType: "regeneration", outputDescription: "Psychic healing that restores segments at any distance.", outputEffect: 22, outputRarity: "legendary" },
  { id: "magnetic_growth", inputs: ["magnetic", "growth"], outputType: "growth", outputLabel: "Gravity Growth", outputDescription: "Attract food clusters to fuel massive growth spurts.", outputEffect: 15, outputRarity: "uncommon" },
  { id: "stealth_regen", inputs: ["stealth", "regeneration"], outputLabel: "Phantom Heal", outputType: "stealth", outputDescription: "Become invisible while healing, masking your location.", outputEffect: 17, outputRarity: "epic" },
];

const MUTATION_DEFS_RAW: Omit<MutationDef, "cooldownRemaining">[] = [
  { id: "hyper_speed", label: "Hyper Speed", description: "Temporarily doubles snake speed.", effectType: "buff", powerRange: [20, 50], riskMultiplier: 0.6 },
  { id: "iron_skin", label: "Iron Skin", description: "Increases armor effectiveness.", effectType: "buff", powerRange: [15, 40], riskMultiplier: 0.5 },
  { id: "eagle_eye", label: "Eagle Eye", description: "Massively extends vision range.", effectType: "buff", powerRange: [25, 60], riskMultiplier: 0.4 },
  { id: "toxic_blood", label: "Toxic Blood", description: "Venom passively damages nearby enemies.", effectType: "buff", powerRange: [10, 35], riskMultiplier: 0.7 },
  { id: "rapid_regen", label: "Rapid Regen", description: "Doubles regeneration rate temporarily.", effectType: "buff", powerRange: [20, 55], riskMultiplier: 0.5 },
  { id: "gravity_well", label: "Gravity Well", description: "Increases magnetic pull radius.", effectType: "buff", powerRange: [15, 45], riskMultiplier: 0.6 },
  { id: "elastic_form", label: "Elastic Form", description: "Body becomes more stretchable.", effectType: "buff", powerRange: [10, 30], riskMultiplier: 0.4 },
  { id: "mind_blitz", label: "Mind Blitz", description: "Psychic powers amplify briefly.", effectType: "buff", powerRange: [20, 50], riskMultiplier: 0.8 },
  { id: "stunted", label: "Stunted Growth", description: "Reduces growth per food item.", effectType: "debuff", powerRange: [-30, -10], riskMultiplier: 1.0 },
  { id: "sluggish", label: "Sluggish", description: "Temporarily reduces speed.", effectType: "debuff", powerRange: [-25, -8], riskMultiplier: 0.9 },
  { id: "fragile", label: "Fragile", description: "Reduces armor effectiveness.", effectType: "debuff", powerRange: [-20, -5], riskMultiplier: 1.1 },
  { id: "blurry", label: "Blurry Vision", description: "Shrinks visible area.", effectType: "debuff", powerRange: [-30, -10], riskMultiplier: 0.8 },
  { id: "paranoia", label: "Paranoia", description: "Stealth breaks randomly.", effectType: "debuff", powerRange: [-15, -5], riskMultiplier: 1.0 },
  { id: "gene_instability", label: "Gene Instability", description: "Random stat fluctuations.", effectType: "neutral", powerRange: [-20, 30], riskMultiplier: 1.5 },
  { id: "corruption", label: "Corruption", description: "Severe gene corruption requiring purification.", effectType: "debuff", powerRange: [-50, -20], riskMultiplier: 2.0 },
];

const ACHIEVEMENT_DEFS: Omit<GeneAchievement, "unlocked" | "unlockedAt">[] = [
  { id: "first_extraction", label: "First Extraction", description: "Extract your very first gene fragment." },
  { id: "gene_master", label: "Gene Master", description: "Collect at least one gene of every type." },
  { id: "splicing_expert", label: "Splicing Expert", description: "Successfully splice 10 hybrid genes." },
  { id: "mutation_pioneer", label: "Mutation Pioneer", description: "Induce your first artificial mutation." },
  { id: "pure_blood", label: "Pure Blood", description: "Own a gene with 100 purity score." },
  { id: "vault_full", label: "Vault Full", description: "Fill the Gene Vault to maximum capacity." },
  { id: "daily_devotee", label: "Daily Devotee", description: "Complete 7 consecutive daily research projects." },
  { id: "legendary_catch", label: "Legendary Catch", description: "Extract a legendary-tier gene." },
  { id: "genome_assembler", label: "Genome Assembler", description: "Combine fragments into a full Genome-tier gene." },
  { id: "stable_hand", label: "Stable Hand", description: "Maintain 5 genes above 90 stability simultaneously." },
  { id: "purifier", label: "Purifier", description: "Purify 10 corrupted or degraded genes." },
  { id: "lab_level_40", label: "Lab Ascended", description: "Reach Lab Level 40." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function dateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `gn_${ts}_${rand}`;
}

function determineDominance(rarity: GeneRarity): TraitDominance {
  if (rarity === "legendary" || rarity === "epic") return "dominant";
  if (rarity === "rare") return Math.random() > 0.4 ? "dominant" : "recessive";
  return Math.random() > 0.7 ? "dominant" : "recessive";
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

let state: GeneLabState | null = null;

function ensureInit(): GeneLabState {
  if (state) return state;

  const now = Date.now();
  const stations: StationDef[] = STATION_DEFS.map((s) => ({
    ...s,
    active: false,
  }));

  const hybridRecipes: HybridRecipe[] = HYBRID_RECIPES_RAW.map((r) => ({
    ...r,
    discovered: false,
  }));

  const mutations: MutationDef[] = MUTATION_DEFS_RAW.map((m) => ({
    ...m,
    cooldownRemaining: 0,
  }));

  const achievements: GeneAchievement[] = ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: null,
  }));

  const equippedSlots: EquippedSlot[] = [
    { slot: 0, geneId: null },
    { slot: 1, geneId: null },
    { slot: 2, geneId: null },
  ];

  state = {
    labLevel: 1,
    labXP: 0,
    labXPToNext: xpForLevel(1),
    stations,
    genes: [],
    vault: [],
    vaultMax: 50,
    hybridRecipes,
    mutations,
    achievements,
    dailyResearch: null,
    researchStreak: 0,
    lastResearchDate: "",
    equippedSlots,
    totalExtractions: 0,
    totalSplices: 0,
    totalMutations: 0,
    totalPurifications: 0,
    dnaPoints: 0,
    createdAt: now,
    lastUpdated: now,
  };

  return state;
}

// ---------------------------------------------------------------------------
// State Access
// ---------------------------------------------------------------------------

/** Returns the full gene lab state object. */
export function gnGetState(): GeneLabState {
  return ensureInit();
}

/** Resets all gene lab state to defaults. */
export function gnResetState(): void {
  state = null;
  ensureInit();
}

// ---------------------------------------------------------------------------
// Lab Level & XP
// ---------------------------------------------------------------------------

/** Returns lab level (1–40). */
export function gnGetLabLevel(): number {
  const s = ensureInit();
  return s.labLevel;
}

/** Returns the full lab info (level, XP, XP to next). */
export function gnGetLab(): { level: number; xp: number; xpToNext: number; percent: number } {
  const s = ensureInit();
  return {
    level: s.labLevel,
    xp: s.labXP,
    xpToNext: s.labXPToNext,
    percent: s.labXPToNext > 0 ? Math.min(100, (s.labXP / s.labXPToNext) * 100) : 100,
  };
}

/** Adds XP to the lab and handles level-ups (max level 40). */
export function gnAddLabXP(amount: number): { leveledUp: boolean; newLevel: number; xpGained: number } {
  const s = ensureInit();
  let gained = amount;
  let leveledUp = false;
  s.labXP += gained;

  while (s.labXP >= s.labXPToNext && s.labLevel < 40) {
    s.labXP -= s.labXPToNext;
    s.labLevel += 1;
    s.labXPToNext = xpForLevel(s.labLevel);
    leveledUp = true;
    // unlock new stations at level threshold
    for (const st of s.stations) {
      if (st.unlockLevel <= s.labLevel) {
        st.active = true;
      }
    }
  }

  // cap at max
  if (s.labLevel >= 40) {
    s.labXP = 0;
    s.labXPToNext = 0;
  }

  s.lastUpdated = Date.now();
  gnCheckAchievements();
  return { leveledUp, newLevel: s.labLevel, xpGained: gained };
}

// ---------------------------------------------------------------------------
// Stations
// ---------------------------------------------------------------------------

/** Returns all 8 lab stations with unlock status. */
export function gnGetStations(): StationDef[] {
  const s = ensureInit();
  return s.stations;
}

/** Checks whether a specific station is unlocked and active. */
export function gnIsStationUnlocked(stationId: StationId): boolean {
  const s = ensureInit();
  const station = s.stations.find((st) => st.id === stationId);
  return station ? station.active : false;
}

// ---------------------------------------------------------------------------
// Gene Queries
// ---------------------------------------------------------------------------

/** Returns all collected genes. */
export function gnGetGenes(): GeneDef[] {
  return ensureInit().genes;
}

/** Returns a single gene by its unique ID. */
export function gnGetGene(id: string): GeneDef | null {
  const s = ensureInit();
  return s.genes.find((g) => g.id === id) ?? null;
}

/** Returns all genes matching a specific type. */
export function gnGetGeneByType(type: GeneType): GeneDef[] {
  const s = ensureInit();
  return s.genes.filter((g) => g.type === type);
}

/** Returns the total number of unique gene types collected. */
export function gnGetUniqueGeneTypesCount(): number {
  const s = ensureInit();
  const types = new Set(s.genes.map((g) => g.type));
  return types.size;
}

// ---------------------------------------------------------------------------
// Gene Extraction
// ---------------------------------------------------------------------------

/** Calculates the extraction success rate for a given gene type. */
export function gnGetExtractionRate(type: GeneType): number {
  const s = ensureInit();
  const baseRate = RARITY_EXTRACTION_BASE[GENE_RARITIES[type]];
  const labBonus = Math.min(25, s.labLevel * 0.5);
  return Math.min(98, baseRate + labBonus);
}

/** Attempts to extract a gene of the specified type. */
export function gnExtractGene(type: GeneType): {
  success: boolean;
  gene: GeneDef | null;
  extractionRate: number;
} {
  const s = ensureInit();
  const rate = gnGetExtractionRate(type);
  const roll = Math.random() * 100;

  if (roll > rate) {
    s.totalExtractions += 1;
    s.lastUpdated = Date.now();
    gnAddLabXP(5);
    gnCheckAchievements();
    return { success: false, gene: null, extractionRate: rate };
  }

  const tier: GeneTier = pickRandom(TIER_ORDER);
  const rarity = GENE_RARITIES[type];
  const dominance = determineDominance(rarity);
  const purity = Math.floor(Math.random() * 41) + 60;
  const stability = Math.floor(Math.random() * 31) + 70;

  const gene: GeneDef = {
    id: generateId(),
    type,
    label: GENE_LABELS[type],
    description: GENE_DESCRIPTIONS[type],
    baseEffect: Math.round(GENE_BASE_EFFECTS[type] * TIER_MULTIPLIER[tier]),
    rarity,
    tier,
    purity,
    stability,
    dominance,
    extractedAt: Date.now(),
  };

  s.genes.push(gene);
  s.totalExtractions += 1;
  s.lastUpdated = Date.now();
  gnAddLabXP(15);
  gnCheckAchievements();
  return { success: true, gene, extractionRate: rate };
}

/** Attempts to extract a random gene type (weighted by rarity). */
export function gnExtractRandom(): {
  success: boolean;
  gene: GeneDef | null;
  extractedType: GeneType;
  extractionRate: number;
} {
  const type = pickRandom(GENE_TYPES);
  const result = gnExtractGene(type);
  return { ...result, extractedType: type };
}

// ---------------------------------------------------------------------------
// Gene Splicing
// ---------------------------------------------------------------------------

/** Returns all 20 hybrid recipes. */
export function gnGetHybridRecipes(): HybridRecipe[] {
  return ensureInit().hybridRecipes;
}

/** Returns only the recipes that have been discovered so far. */
export function gnGetDiscoveredHybrids(): HybridRecipe[] {
  const s = ensureInit();
  return s.hybridRecipes.filter((r) => r.discovered);
}

/** Looks up the recipe for combining two gene types. */
export function gnGetSpliceResult(gene1: GeneType, gene2: GeneType): HybridRecipe | null {
  const s = ensureInit();
  const combo = [gene1, gene2].sort().join(",");
  for (const recipe of s.hybridRecipes) {
    const inputs = [...recipe.inputs].sort().join(",");
    if (inputs === combo) return recipe;
  }
  return null;
}

/** Attempts to splice two genes together to create a hybrid. */
export function gnSpliceGenes(gene1Id: string, gene2Id: string): {
  success: boolean;
  result: GeneDef | null;
  recipe: HybridRecipe | null;
  mutation: boolean;
} {
  const s = ensureInit();
  const g1 = s.genes.find((g) => g.id === gene1Id);
  const g2 = s.genes.find((g) => g.id === gene2Id);
  if (!g1 || !g2) return { success: false, result: null, recipe: null, mutation: false };

  const recipe = gnGetSpliceResult(g1.type, g2.type);
  if (!recipe) return { success: false, result: null, recipe: null, mutation: false };

  const baseChance = 70;
  const labBonus = Math.min(20, s.labLevel * 0.4);
  const rarityMod = (RARITY_SPICE_MOD[g1.rarity] + RARITY_SPICE_MOD[g2.rarity]) / 2;
  const chance = Math.min(95, baseChance + labBonus) * rarityMod;
  const roll = Math.random() * 100;

  s.totalSplices += 1;

  if (roll > chance) {
    // Splice failed — possible mutation
    const mutationChance = 0.3;
    const mutated = Math.random() < mutationChance;
    recipe.discovered = true;
    s.lastUpdated = Date.now();
    gnAddLabXP(8);
    gnCheckAchievements();
    return { success: false, result: null, recipe, mutation: mutated };
  }

  // Success — produce hybrid gene
  recipe.discovered = true;
  const avgPurity = (g1.purity + g2.purity) / 2;
  const avgStability = (g1.stability + g2.stability) / 2;

  const hybridGene: GeneDef = {
    id: generateId(),
    type: recipe.outputType,
    label: recipe.outputLabel,
    description: recipe.outputDescription,
    baseEffect: recipe.outputEffect,
    rarity: recipe.outputRarity,
    tier: "helix",
    purity: Math.round(avgPurity * 0.85),
    stability: Math.round(avgStability * 0.8),
    dominance: recipe.outputRarity === "legendary" || recipe.outputRarity === "epic" ? "dominant" : "recessive",
    extractedAt: Date.now(),
  };

  s.genes.push(hybridGene);
  s.lastUpdated = Date.now();
  gnAddLabXP(30);
  gnCheckAchievements();
  return { success: true, result: hybridGene, recipe, mutation: false };
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** Returns all 15 available mutations. */
export function gnGetMutations(): MutationDef[] {
  return ensureInit().mutations;
}

/** Calculates the risk percentage for inducing a mutation at a given intensity. */
export function gnGetMutationRisk(intensity: number): {
  failureChance: number;
  corruptionChance: number;
  debuffChance: number;
  netRisk: number;
} {
  const baseFail = 5 + intensity * 4;
  const corruption = Math.max(0, intensity * 2 - 10);
  const debuff = 15 + intensity * 5;
  return {
    failureChance: Math.min(80, baseFail),
    corruptionChance: Math.min(40, corruption),
    debuffChance: Math.min(70, debuff),
    netRisk: Math.min(90, baseFail + corruption),
  };
}

/** Attempts to induce a mutation at the specified intensity (1–10). */
export function gnInduceMutation(mutationId: string, intensity: number): {
  success: boolean;
  mutation: MutationDef | null;
  applied: boolean;
  corrupted: boolean;
  powerApplied: number;
} {
  const s = ensureInit();
  const clamp = Math.max(1, Math.min(10, intensity));
  const mut = s.mutations.find((m) => m.id === mutationId);
  if (!mut) return { success: false, mutation: null, applied: false, corrupted: false, powerApplied: 0 };

  if (mut.cooldownRemaining > 0) return { success: false, mutation: mut, applied: false, corrupted: false, powerApplied: 0 };

  const risk = gnGetMutationRisk(clamp);
  const roll = Math.random() * 100;

  s.totalMutations += 1;

  if (roll < risk.corruptionChance) {
    mut.cooldownRemaining = 3;
    s.lastUpdated = Date.now();
    gnAddLabXP(5);
    return { success: false, mutation: mut, applied: false, corrupted: true, powerApplied: 0 };
  }

  if (roll < risk.netRisk) {
    mut.cooldownRemaining = 1;
    s.lastUpdated = Date.now();
    gnAddLabXP(10);
    return { success: false, mutation: mut, applied: false, corrupted: false, powerApplied: 0 };
  }

  const [min, max] = mut.powerRange;
  const powerApplied = Math.round(min + (max - min) * (clamp / 10));
  mut.cooldownRemaining = 5;
  s.lastUpdated = Date.now();
  gnAddLabXP(25);
  gnCheckAchievements();
  return { success: true, mutation: mut, applied: true, corrupted: false, powerApplied };
}

// ---------------------------------------------------------------------------
// Gene Vault
// ---------------------------------------------------------------------------

/** Returns the current vault contents (gene IDs). */
export function gnGetVault(): { geneIds: string[]; capacity: number; used: number } {
  const s = ensureInit();
  return { geneIds: s.vault, capacity: s.vaultMax, used: s.vault.length };
}

/** Returns the maximum vault capacity. */
export function gnGetVaultCapacity(): number {
  return ensureInit().vaultMax;
}

/** Stashes a gene into the vault by ID. */
export function gnStashGene(geneId: string): boolean {
  const s = ensureInit();
  if (s.vault.length >= s.vaultMax) return false;
  const exists = s.genes.find((g) => g.id === geneId);
  if (!exists) return false;
  if (s.vault.includes(geneId)) return false;
  s.vault.push(geneId);
  s.lastUpdated = Date.now();
  gnCheckAchievements();
  return true;
}

/** Removes a gene from the vault. */
export function gnUnstashGene(geneId: string): boolean {
  const s = ensureInit();
  const idx = s.vault.indexOf(geneId);
  if (idx === -1) return false;
  s.vault.splice(idx, 1);
  s.lastUpdated = Date.now();
  return true;
}

/** Trade 3 genes of one type for 1 of another type. */
export function gnTradeGenes(fromType: GeneType, toType: GeneType): boolean {
  const s = ensureInit();
  const available = s.genes.filter((g) => g.type === fromType && !s.vault.includes(g.id));
  if (available.length < 3) return false;

  // Remove 3 from genes
  for (let i = 0; i < 3; i++) {
    const gene = available[i];
    const idx = s.genes.findIndex((g) => g.id === gene.id);
    if (idx !== -1) s.genes.splice(idx, 1);
  }

  // Create the traded gene
  const tradedGene: GeneDef = {
    id: generateId(),
    type: toType,
    label: GENE_LABELS[toType],
    description: GENE_DESCRIPTIONS[toType],
    baseEffect: GENE_BASE_EFFECTS[toType],
    rarity: GENE_RARITIES[toType],
    tier: "fragment",
    purity: 70,
    stability: 80,
    dominance: "recessive",
    extractedAt: Date.now(),
  };
  s.genes.push(tradedGene);
  s.lastUpdated = Date.now();
  gnAddLabXP(20);
  return true;
}

/** Destroy a gene for raw DNA points based on its tier and rarity. */
export function gnDestroyGene(geneId: string): { destroyed: boolean; dnaGained: number } {
  const s = ensureInit();
  const idx = s.genes.findIndex((g) => g.id === geneId);
  if (idx === -1) return { destroyed: false, dnaGained: 0 };

  const gene = s.genes[idx];
  const tierPoints = TIER_MULTIPLIER[gene.tier] * 10;
  const rarityPoints: Record<GeneRarity, number> = { common: 5, uncommon: 12, rare: 25, epic: 50, legendary: 100 };
  const dnaGained = Math.round(tierPoints + rarityPoints[gene.rarity]);

  // remove from vault too
  const vaultIdx = s.vault.indexOf(geneId);
  if (vaultIdx !== -1) s.vault.splice(vaultIdx, 1);

  // unequip if equipped
  for (const slot of s.equippedSlots) {
    if (slot.geneId === geneId) slot.geneId = null;
  }

  s.genes.splice(idx, 1);
  s.dnaPoints += dnaGained;
  s.lastUpdated = Date.now();
  gnCheckAchievements();
  return { destroyed: true, dnaGained };
}

// ---------------------------------------------------------------------------
// Daily Gene Research
// ---------------------------------------------------------------------------

/** Generates and returns the daily research project (date-seeded). */
export function gnGetDailyResearch(): DailyResearch {
  const s = ensureInit();
  const today = dateKey();

  if (s.dailyResearch && s.dailyResearch.dateKey === today) {
    return s.dailyResearch;
  }

  // Seed based on date string
  let seed = 0;
  for (let i = 0; i < today.length; i++) {
    seed = (seed * 31 + today.charCodeAt(i)) | 0;
  }
  seed = Math.abs(seed);
  const rng = seededRandom(seed);

  const topics = [
    { topic: "Gene Purity Enhancement", desc: "Study methods to increase gene purity scores across all types." },
    { topic: "Stability Optimization", desc: "Research techniques to reduce gene degradation over time." },
    { topic: "Hybrid Splicing Theory", desc: "Explore new gene combination possibilities and hybrid recipes." },
    { topic: "Mutation Containment", desc: "Develop safer mutation protocols to reduce corruption risk." },
    { topic: "Rare Gene Detection", desc: "Improve extraction sensors to increase rare gene find rates." },
    { topic: "Vault Expansion Tech", desc: "Research structural enhancements for the Gene Vault." },
    { topic: "Dominance Manipulation", desc: "Study ways to convert recessive genes into dominant traits." },
  ];

  const idx = Math.floor(rng() * topics.length);
  const selected = topics[idx];
  const bonusXP = 40 + Math.floor(rng() * 60);
  const bonusType = rng() > 0.5 ? GENE_TYPES[Math.floor(rng() * GENE_TYPES.length)] : null;

  // check streak
  if (s.lastResearchDate !== "") {
    const yesterday = new Date(Date.now() - 86400000);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
    if (s.lastResearchDate === yKey) {
      s.researchStreak += 1;
    } else if (s.lastResearchDate !== today) {
      s.researchStreak = 0;
    }
  }

  s.dailyResearch = {
    dateKey: today,
    topic: selected.topic,
    description: selected.desc,
    bonusXP,
    bonusGeneType: bonusType,
    completed: false,
    completedAt: null,
  };

  s.lastUpdated = Date.now();
  return s.dailyResearch;
}

/** Completes the current daily research project for bonus XP and a gene fragment. */
export function gnCompleteDailyResearch(): {
  completed: boolean;
  xpGained: number;
  bonusGene: GeneDef | null;
  streak: number;
} {
  const s = ensureInit();
  const research = gnGetDailyResearch();
  if (research.completed) {
    return { completed: false, xpGained: 0, bonusGene: null, streak: s.researchStreak };
  }

  research.completed = true;
  research.completedAt = Date.now();
  s.lastResearchDate = research.dateKey;

  let bonusGene: GeneDef | null = null;
  if (research.bonusGeneType) {
    const type = research.bonusGeneType;
    bonusGene = {
      id: generateId(),
      type,
      label: GENE_LABELS[type],
      description: GENE_DESCRIPTIONS[type],
      baseEffect: GENE_BASE_EFFECTS[type],
      rarity: GENE_RARITIES[type],
      tier: "fragment",
      purity: 85,
      stability: 90,
      dominance: "dominant",
      extractedAt: Date.now(),
    };
    s.genes.push(bonusGene);
  }

  // streak bonus
  const streakBonus = s.researchStreak >= 14 ? 50 : s.researchStreak >= 7 ? 25 : s.researchStreak >= 3 ? 10 : 0;
  const totalXP = research.bonusXP + streakBonus;

  gnAddLabXP(totalXP);
  s.lastUpdated = Date.now();
  gnCheckAchievements();
  return { completed: true, xpGained: totalXP, bonusGene, streak: s.researchStreak };
}

/** Returns the current research streak count. */
export function gnGetResearchStreak(): number {
  return ensureInit().researchStreak;
}

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------

/** Returns all 12 gene achievements with unlock status. */
export function gnGetAchievements(): GeneAchievement[] {
  return ensureInit().achievements;
}

/** Checks and unlocks any newly earned achievements. Returns newly unlocked IDs. */
export function gnCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];
  const now = Date.now();

  const check = (id: string, condition: boolean) => {
    if (condition) {
      const ach = s.achievements.find((a) => a.id === id);
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = now;
        newlyUnlocked.push(id);
      }
    }
  };

  // First Extraction
  check("first_extraction", s.totalExtractions >= 1);

  // Gene Master — one of every type
  const typesCollected = new Set(s.genes.map((g) => g.type));
  check("gene_master", typesCollected.size >= GENE_TYPES.length);

  // Splicing Expert — 10 splices
  check("splicing_expert", s.totalSplices >= 10);

  // Mutation Pioneer
  check("mutation_pioneer", s.totalMutations >= 1);

  // Pure Blood — 100 purity
  check("pure_blood", s.genes.some((g) => g.purity >= 100));

  // Vault Full
  check("vault_full", s.vault.length >= s.vaultMax);

  // Daily Devotee — 7 streak
  check("daily_devotee", s.researchStreak >= 7);

  // Legendary Catch
  check("legendary_catch", s.genes.some((g) => g.rarity === "legendary"));

  // Genome Assembler
  check("genome_assembler", s.genes.some((g) => g.tier === "genome"));

  // Stable Hand — 5 genes above 90 stability
  const stableGenes = s.genes.filter((g) => g.stability >= 90);
  check("stable_hand", stableGenes.length >= 5);

  // Purifier — 10 purifications
  check("purifier", s.totalPurifications >= 10);

  // Lab Level 40
  check("lab_level_40", s.labLevel >= 40);

  if (newlyUnlocked.length > 0) {
    s.lastUpdated = now;
  }

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Gene Stats
// ---------------------------------------------------------------------------

/** Returns aggregated gene statistics. */
export function gnGetGeneStats(): {
  totalGenes: number;
  byType: Record<GeneType, number>;
  byRarity: Record<GeneRarity, number>;
  byTier: Record<GeneTier, number>;
  avgPurity: number;
  avgStability: number;
  dominantCount: number;
  recessiveCount: number;
} {
  const s = ensureInit();
  const genes = s.genes;

  const byType: Record<GeneType, number> = { speed: 0, growth: 0, armor: 0, vision: 0, stealth: 0, venom: 0, regeneration: 0, magnetic: 0, elastic: 0, psychic: 0 };
  const byRarity: Record<GeneRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
  const byTier: Record<GeneTier, number> = { fragment: 0, strand: 0, helix: 0, chromosome: 0, genome: 0 };
  let totalPurity = 0;
  let totalStability = 0;
  let dominant = 0;
  let recessive = 0;

  for (const g of genes) {
    byType[g.type]++;
    byRarity[g.rarity]++;
    byTier[g.tier]++;
    totalPurity += g.purity;
    totalStability += g.stability;
    if (g.dominance === "dominant") dominant++;
    else recessive++;
  }

  return {
    totalGenes: genes.length,
    byType,
    byRarity,
    byTier,
    avgPurity: genes.length > 0 ? Math.round(totalPurity / genes.length) : 0,
    avgStability: genes.length > 0 ? Math.round(totalStability / genes.length) : 0,
    dominantCount: dominant,
    recessiveCount: recessive,
  };
}

/** Returns the purity score of a specific gene. */
export function gnGetPurity(geneId: string): number {
  const s = ensureInit();
  const gene = s.genes.find((g) => g.id === geneId);
  return gene ? gene.purity : 0;
}

/** Returns the stability score of a specific gene. */
export function gnGetStability(geneId: string): number {
  const s = ensureInit();
  const gene = s.genes.find((g) => g.id === geneId);
  return gene ? gene.stability : 0;
}

/** Returns the total number of extractions performed. */
export function gnGetTotalExtractions(): number {
  return ensureInit().totalExtractions;
}

/** Returns the total number of splices performed. */
export function gnGetTotalSplices(): number {
  return ensureInit().totalSplices;
}

/** Returns the rarest gene in the collection (by tier, then rarity). */
export function gnGetRarestGene(): GeneDef | null {
  const s = ensureInit();
  if (s.genes.length === 0) return null;

  const rarityRank: Record<GeneRarity, number> = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
  const tierRank: Record<GeneTier, number> = { fragment: 0, strand: 1, helix: 2, chromosome: 3, genome: 4 };

  let rarest = s.genes[0];
  for (const g of s.genes) {
    const gScore = tierRank[g.tier] * 10 + rarityRank[g.rarity];
    const rScore = tierRank[rarest.tier] * 10 + rarityRank[rarest.rarity];
    if (gScore > rScore) rarest = g;
  }
  return rarest;
}

// ---------------------------------------------------------------------------
// Gene Equipment (3 slots)
// ---------------------------------------------------------------------------

/** Returns the currently equipped gene slots. */
export function gnGetEquippedGenes(): EquippedSlot[] {
  return ensureInit().equippedSlots;
}

/** Equips a gene into a specific slot (0, 1, or 2). */
export function gnEquipGene(geneId: string, slot: number): boolean {
  const s = ensureInit();
  if (slot < 0 || slot > 2) return false;
  const gene = s.genes.find((g) => g.id === geneId);
  if (!gene) return false;

  // don't allow equipping same gene in multiple slots
  for (const es of s.equippedSlots) {
    if (es.geneId === geneId) {
      // already equipped somewhere — move it
      es.geneId = null;
    }
  }

  s.equippedSlots[slot].geneId = geneId;
  s.lastUpdated = Date.now();
  return true;
}

/** Unequips the gene from a specific slot. */
export function gnUnequipGene(slot: number): boolean {
  const s = ensureInit();
  if (slot < 0 || slot > 2) return false;
  s.equippedSlots[slot].geneId = null;
  s.lastUpdated = Date.now();
  return true;
}

/** Returns aggregated active effects from equipped genes. */
export function gnGetActiveEffects(): {
  totalSpeedBonus: number;
  totalGrowthBonus: number;
  totalArmorBonus: number;
  totalVisionBonus: number;
  totalStealthBonus: number;
  totalVenomBonus: number;
  totalRegenBonus: number;
  totalMagneticBonus: number;
  totalElasticBonus: number;
  totalPsychicBonus: number;
} {
  const s = ensureInit();
  const effects = {
    totalSpeedBonus: 0,
    totalGrowthBonus: 0,
    totalArmorBonus: 0,
    totalVisionBonus: 0,
    totalStealthBonus: 0,
    totalVenomBonus: 0,
    totalRegenBonus: 0,
    totalMagneticBonus: 0,
    totalElasticBonus: 0,
    totalPsychicBonus: 0,
  };

  for (const slot of s.equippedSlots) {
    if (!slot.geneId) continue;
    const gene = s.genes.find((g) => g.id === slot.geneId);
    if (!gene) continue;

    const effect = gene.dominance === "dominant"
      ? gene.baseEffect
      : Math.round(gene.baseEffect * 0.6);

    const key = `total${gene.type.charAt(0).toUpperCase() + gene.type.slice(1)}Bonus` as keyof typeof effects;
    if (key in effects) {
      (effects[key] as number) += effect;
    }
  }

  return effects;
}

// ---------------------------------------------------------------------------
// Purification
// ---------------------------------------------------------------------------

/** Returns the DNA point cost to purify a corrupted gene. */
export function gnGetPurificationCost(geneId: string): number {
  const s = ensureInit();
  const gene = s.genes.find((g) => g.id === geneId);
  if (!gene) return 0;
  const baseCost = 20;
  const purityDeficit = 100 - gene.purity;
  const stabilityDeficit = 100 - gene.stability;
  return Math.round(baseCost + purityDeficit * 0.5 + stabilityDeficit * 0.3);
}

/** Purifies a gene, restoring purity and stability at DNA point cost. */
export function gnPurifyGene(geneId: string): {
  purified: boolean;
  dnaSpent: number;
  purityRestored: number;
  stabilityRestored: number;
} {
  const s = ensureInit();
  const gene = s.genes.find((g) => g.id === geneId);
  if (!gene) return { purified: false, dnaSpent: 0, purityRestored: 0, stabilityRestored: 0 };

  const cost = gnGetPurificationCost(geneId);
  if (s.dnaPoints < cost) return { purified: false, dnaSpent: 0, purityRestored: 0, stabilityRestored: 0 };

  const oldPurity = gene.purity;
  const oldStability = gene.stability;

  s.dnaPoints -= cost;
  gene.purity = Math.min(100, gene.purity + 25);
  gene.stability = Math.min(100, gene.stability + 20);
  s.totalPurifications += 1;
  s.lastUpdated = Date.now();

  gnCheckAchievements();
  return {
    purified: true,
    dnaSpent: cost,
    purityRestored: gene.purity - oldPurity,
    stabilityRestored: gene.stability - oldStability,
  };
}

// ---------------------------------------------------------------------------
// UI Helpers — Overview & Dashboard
// ---------------------------------------------------------------------------

/** Returns a high-level overview of the entire Gene Lab system. */
export function gnGetGeneLabOverview(): {
  labLevel: number;
  labXPPercent: number;
  stationCount: number;
  unlockedStations: number;
  geneCount: number;
  vaultUsed: number;
  vaultCapacity: number;
  hybridsDiscovered: number;
  totalHybrids: number;
  achievementCount: number;
  totalAchievements: number;
  researchStreak: number;
  dailyResearchCompleted: boolean;
  dnaPoints: number;
} {
  const s = ensureInit();
  const research = gnGetDailyResearch();
  return {
    labLevel: s.labLevel,
    labXPPercent: s.labXPToNext > 0 ? Math.round((s.labXP / s.labXPToNext) * 100) : 100,
    stationCount: s.stations.length,
    unlockedStations: s.stations.filter((st) => st.active).length,
    geneCount: s.genes.length,
    vaultUsed: s.vault.length,
    vaultCapacity: s.vaultMax,
    hybridsDiscovered: s.hybridRecipes.filter((r) => r.discovered).length,
    totalHybrids: s.hybridRecipes.length,
    achievementCount: s.achievements.filter((a) => a.unlocked).length,
    totalAchievements: s.achievements.length,
    researchStreak: s.researchStreak,
    dailyResearchCompleted: research.completed,
    dnaPoints: s.dnaPoints,
  };
}

/** Returns a detailed lab dashboard for the main Gene Lab screen. */
export function gnGetLabDashboard(): {
  lab: ReturnType<typeof gnGetLab>;
  stations: StationDef[];
  geneStats: ReturnType<typeof gnGetGeneStats>;
  recentGenes: GeneDef[];
  activeEffects: ReturnType<typeof gnGetActiveEffects>;
  equippedSlots: EquippedSlot[];
  dailyResearch: DailyResearch | null;
  recentAchievements: GeneAchievement[];
  vaultSummary: ReturnType<typeof gnGetVault>;
} {
  const s = ensureInit();
  const recentGenes = [...s.genes].sort((a, b) => b.extractedAt - a.extractedAt).slice(0, 5);
  const recentAch = s.achievements
    .filter((a) => a.unlocked && a.unlockedAt !== null)
    .sort((a, b) => (b.unlockedAt ?? 0) - (a.unlockedAt ?? 0))
    .slice(0, 5);

  return {
    lab: gnGetLab(),
    stations: s.stations,
    geneStats: gnGetGeneStats(),
    recentGenes,
    activeEffects: gnGetActiveEffects(),
    equippedSlots: s.equippedSlots,
    dailyResearch: gnGetDailyResearch(),
    recentAchievements: recentAch,
    vaultSummary: gnGetVault(),
  };
}

// ---------------------------------------------------------------------------
// UI Cards
// ---------------------------------------------------------------------------

/** Returns a formatted card view for a single gene. */
export function gnGetGeneCard(id: string): {
  id: string;
  label: string;
  type: GeneType;
  tier: GeneTier;
  rarity: GeneRarity;
  effect: number;
  purity: number;
  stability: number;
  dominance: TraitDominance;
  description: string;
  extractedAt: number;
  equipped: boolean;
  inVault: boolean;
} | null {
  const s = ensureInit();
  const gene = s.genes.find((g) => g.id === id);
  if (!gene) return null;

  return {
    id: gene.id,
    label: gene.label,
    type: gene.type,
    tier: gene.tier,
    rarity: gene.rarity,
    effect: gene.baseEffect,
    purity: gene.purity,
    stability: gene.stability,
    dominance: gene.dominance,
    description: gene.description,
    extractedAt: gene.extractedAt,
    equipped: s.equippedSlots.some((sl) => sl.geneId === id),
    inVault: s.vault.includes(id),
  };
}

/** Returns a formatted card view for a lab station. */
export function gnGetStationCard(id: StationId): {
  id: StationId;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockLevel: number;
  labLevel: number;
  progressToUnlock: number;
} | null {
  const s = ensureInit();
  const station = s.stations.find((st) => st.id === id);
  if (!station) return null;

  const progressToUnlock = s.labLevel >= station.unlockLevel
    ? 100
    : Math.round((s.labLevel / station.unlockLevel) * 100);

  return {
    id: station.id,
    label: station.label,
    description: station.description,
    icon: station.icon,
    unlocked: station.active,
    unlockLevel: station.unlockLevel,
    labLevel: s.labLevel,
    progressToUnlock,
  };
}

/** Returns a formatted card view for a hybrid recipe. */
export function gnGetHybridCard(id: string): {
  id: string;
  label: string;
  inputs: GeneType[];
  outputType: GeneType;
  outputDescription: string;
  outputEffect: number;
  outputRarity: GeneRarity;
  discovered: boolean;
  inputLabels: string[];
  inputRarities: GeneRarity[];
} | null {
  const s = ensureInit();
  const recipe = s.hybridRecipes.find((r) => r.id === id);
  if (!recipe) return null;

  return {
    id: recipe.id,
    label: recipe.outputLabel,
    inputs: recipe.inputs,
    outputType: recipe.outputType,
    outputDescription: recipe.outputDescription,
    outputEffect: recipe.outputEffect,
    outputRarity: recipe.outputRarity,
    discovered: recipe.discovered,
    inputLabels: recipe.inputs.map((t) => GENE_LABELS[t]),
    inputRarities: recipe.inputs.map((t) => GENE_RARITIES[t]),
  };
}

// ---------------------------------------------------------------------------
// DNA Points
// ---------------------------------------------------------------------------

/** Returns the current raw DNA points balance. */
export function gnGetDNAPoints(): number {
  return ensureInit().dnaPoints;
}

// ---------------------------------------------------------------------------
// Gene Portfolio & Rarity Distribution
// ---------------------------------------------------------------------------

/** Returns the gene portfolio breakdown by rarity. */
export function gnGetGenePortfolio(): {
  common: GeneDef[];
  uncommon: GeneDef[];
  rare: GeneDef[];
  epic: GeneDef[];
  legendary: GeneDef[];
  rarityDistribution: Record<GeneRarity, number>;
} {
  const s = ensureInit();
  const common = s.genes.filter((g) => g.rarity === "common");
  const uncommon = s.genes.filter((g) => g.rarity === "uncommon");
  const rare = s.genes.filter((g) => g.rarity === "rare");
  const epic = s.genes.filter((g) => g.rarity === "epic");
  const legendary = s.genes.filter((g) => g.rarity === "legendary");

  const total = s.genes.length || 1;
  return {
    common,
    uncommon,
    rare,
    epic,
    legendary,
    rarityDistribution: {
      common: Math.round((common.length / total) * 100),
      uncommon: Math.round((uncommon.length / total) * 100),
      rare: Math.round((rare.length / total) * 100),
      epic: Math.round((epic.length / total) * 100),
      legendary: Math.round((legendary.length / total) * 100),
    },
  };
}

// ---------------------------------------------------------------------------
// Stability Decay Simulation (call periodically from game loop)
// ---------------------------------------------------------------------------

/** Applies time-based stability decay to all genes. Returns number of genes affected. */
export function gnApplyStabilityDecay(): number {
  const s = ensureInit();
  let affected = 0;

  for (const gene of s.genes) {
    // equipped genes decay slower, vault genes decay faster
    const isEquipped = s.equippedSlots.some((sl) => sl.geneId === gene.id);
    const isInVault = s.vault.includes(gene.id);

    let decay = 0.2;
    if (isEquipped) decay = 0.05;
    if (isInVault) decay = 0.1;
    // recessive genes are slightly less stable
    if (gene.dominance === "recessive") decay *= 1.3;

    if (gene.stability > 10) {
      gene.stability = Math.max(5, Math.round((gene.stability - decay) * 100) / 100);
      affected++;
    }
  }

  if (affected > 0) s.lastUpdated = Date.now();
  return affected;
}
