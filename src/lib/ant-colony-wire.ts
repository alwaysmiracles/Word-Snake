// =============================================================================
// Ant Colony Wire — SSR-safe module for colony management simulation
// All exports use the `ac` prefix. No React hooks. No browser APIs at top level.
// =============================================================================

// ---------------------------------------------------------------------------
// Type Definitions
// ---------------------------------------------------------------------------

export type RarityTier = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';

export type BiomeId = 'forest_floor' | 'rainforest_canopy' | 'desert_sands' | 'river_bank' | 'meadow' | 'rotting_log';

export type RoomId = 'queens_chamber' | 'nursery' | 'food_storage' | 'fungal_garden' | 'soldier_barracks' | 'mining_shaft';

export type RoleId = 'worker' | 'soldier' | 'scout' | 'nurse' | 'farmer' | 'miner' | 'builder' | 'royal_guard';

export type QueenStageName = 'Larva' | 'Pupa' | 'Young Queen' | 'Mature Queen' | 'Empress';

export type FoodType = 'leaf' | 'seed' | 'nectar' | 'insect' | 'fungus';

export type ResourceType = 'soil' | 'stone' | 'wood' | 'crystal' | 'resin';

export type TunnelCellType = 'empty' | 'dirt' | 'stone' | 'crystal_vein' | 'resin_deposit' | 'water' | 'dug';

export interface RoomDef {
  id: RoomId;
  name: string;
  description: string;
  unlockCost: number;
  unlockLevel: number;
  capacityBonus: number;
  effect: string;
  icon: string;
}

export interface BiomeDef {
  id: BiomeId;
  name: string;
  description: string;
  difficulty: number;
  dangerLevel: number;
  icon: string;
  lootTable: BiomeLoot[];
}

export interface BiomeLoot {
  foodType: FoodType;
  weight: number;
  minAmount: number;
  maxAmount: number;
  resourceType?: ResourceType;
}

export interface AntSpeciesDef {
  id: string;
  name: string;
  biome: BiomeId;
  rarity: RarityTier;
  description: string;
  strength: number;
  intelligence: number;
  speed: number;
  special: string;
  discoverXP: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  biome: BiomeId[];
  coinsReward: number;
  xpReward: number;
  description: string;
}

export interface RoleDef {
  id: RoleId;
  name: string;
  description: string;
  icon: string;
  efficiency: number;
  unlockLevel: number;
  moraleBoost: number;
}

export interface QueenStageDef {
  stage: number;
  name: QueenStageName;
  emoji: string;
  levelRequired: number;
  xpRequired: number;
  populationBonus: number;
  productionBonus: number;
  description: string;
}

export interface Room {
  id: RoomId;
  name: string;
  description: string;
  unlocked: boolean;
  level: number;
  icon: string;
}

export interface RoleInfo {
  id: RoleId;
  name: string;
  description: string;
  icon: string;
  assigned: number;
  efficiency: number;
  unlockLevel: number;
}

export interface TunnelCell {
  row: number;
  col: number;
  type: TunnelCellType;
  dug: boolean;
  hasResource: boolean;
  resourceType?: ResourceType;
  resourceAmount?: number;
  reinforced: boolean;
}

export interface AntSpecies {
  id: string;
  name: string;
  biome: BiomeId;
  rarity: RarityTier;
  description: string;
  strength: number;
  intelligence: number;
  speed: number;
  special: string;
  discovered: boolean;
  discoveredAt: number;
}

export interface Biome {
  id: BiomeId;
  name: string;
  description: string;
  difficulty: number;
  dangerLevel: number;
  icon: string;
  species: AntSpecies[];
  explored: boolean;
  expeditionsCompleted: number;
}

export interface FoodItem {
  type: FoodType;
  name: string;
  amount: number;
  nutrition: number;
  icon: string;
}

export interface ResourceItem {
  type: ResourceType;
  name: string;
  amount: number;
  icon: string;
}

export interface Enemy {
  id: string;
  name: string;
  type: string;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  biome: BiomeId[];
  coinsReward: number;
  xpReward: number;
  description: string;
  defeated: boolean;
  timesDefeated: number;
}

export interface BattleResult {
  victory: boolean;
  enemyName: string;
  enemyHp: number;
  playerDamage: number;
  soldiersLost: number;
  xpGained: number;
  coinsGained: number;
  loot: RewardItem[];
}

export interface ExpeditionResult {
  biome: BiomeId;
  biomeName: string;
  success: boolean;
  foodFound: RewardItem[];
  speciesFound: AntSpecies | null;
  enemiesEncountered: string[];
  xpGained: number;
  coinsGained: number;
  resourcesFound: RewardItem[];
}

export interface PheromoneTrail {
  id: string;
  name: string;
  from: string;
  to: string;
  level: number;
  maxLevel: number;
  efficiency: number;
  upgradeCost: number;
  active: boolean;
}

export interface DailyExpedition {
  biomeId: BiomeId;
  biomeName: string;
  completed: boolean;
  available: boolean;
  bonusMultiplier: number;
  daySeed: number;
}

export interface RewardItem {
  type: 'food' | 'resource' | 'coin' | 'xp' | 'species';
  id?: string;
  name: string;
  amount: number;
  rarity?: RarityTier;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: number;
  condition: string;
  reward: { coins: number; xp: number };
}

export interface RunHistoryEntry {
  timestamp: number;
  level: number;
  xpGained: number;
  coinsEarned: number;
  speciesDiscovered: string[];
  enemiesDefeated: string[];
  expeditionsCompleted: number;
}

export interface ColonyStats {
  totalXP: number;
  totalCoins: number;
  totalFoodCollected: number;
  totalResourcesMined: number;
  totalExpeditions: number;
  totalBattles: number;
  totalEnemiesDefeated: number;
  totalSpeciesDiscovered: number;
  totalTunnelsDug: number;
  totalRoomsUnlocked: number;
  totalDaysPlayed: number;
  totalAphidsFarmed: number;
  playtimeTicks: number;
}

export interface AntColonyState {
  level: number;
  xp: number;
  totalXP: number;
  coins: number;
  colonyName: string;
  queenStage: number;
  population: number;
  maxPopulation: number;
  rooms: Room[];
  tunnelGrid: TunnelCell[][];
  activeExpedition: ExpeditionResult | null;
  foodStorage: FoodItem[];
  resourceStorage: ResourceItem[];
  antRoles: Record<RoleId, number>;
  speciesDiscovered: string[];
  enemiesDefeated: string[];
  achievements: Achievement[];
  unlockedAchievements: string[];
  dailyExpedition: DailyExpedition;
  streak: number;
  bestStreak: number;
  lastDailyDate: string;
  runHistory: RunHistoryEntry[];
  stats: ColonyStats;
  pheromoneTrails: PheromoneTrail[];
  aphidCount: number;
  aphidLevel: number;
  honeydewStored: number;
  tick: number;
  initializedAt: number;
}

// ---------------------------------------------------------------------------
// Static Data — Queen Stages
// ---------------------------------------------------------------------------

export const AC_QUEEN_STAGES: QueenStageDef[] = [
  { stage: 0, name: 'Larva', emoji: '🥚', levelRequired: 1, xpRequired: 0, populationBonus: 0, productionBonus: 0, description: 'The colony begins with a single larva, full of potential but vulnerable.' },
  { stage: 1, name: 'Pupa', emoji: '🫘', levelRequired: 5, xpRequired: 500, populationBonus: 20, productionBonus: 0.1, description: 'The queen pupates and begins developing her egg-laying organs.' },
  { stage: 2, name: 'Young Queen', emoji: '👸', levelRequired: 15, xpRequired: 3000, populationBonus: 50, productionBonus: 0.25, description: 'The young queen begins producing eggs. The colony grows rapidly.' },
  { stage: 3, name: 'Mature Queen', emoji: '👑', levelRequired: 30, xpRequired: 15000, populationBonus: 100, productionBonus: 0.5, description: 'The mature queen commands a vast empire. Her pheromones reach every corner of the colony.' },
  { stage: 4, name: 'Empress', emoji: '🌟', levelRequired: 45, xpRequired: 50000, populationBonus: 200, productionBonus: 1.0, description: 'The legendary Empress rules over the greatest ant colony the world has ever seen.' },
];

// ---------------------------------------------------------------------------
// Static Data — Rooms
// ---------------------------------------------------------------------------

export const AC_ROOMS: RoomDef[] = [
  { id: 'queens_chamber', name: "Queen's Chamber", description: 'The heart of the colony where the queen resides and lays eggs.', unlockCost: 0, unlockLevel: 1, capacityBonus: 10, effect: 'Egg production +10%', icon: '🏰' },
  { id: 'nursery', name: 'Nursery', description: 'Warm chambers where larvae are tended by nurse ants until they pupate.', unlockCost: 100, unlockLevel: 3, capacityBonus: 20, effect: 'Growth speed +15%', icon: '🍼' },
  { id: 'food_storage', name: 'Food Storage', description: 'Climate-controlled granaries that preserve food for lean seasons.', unlockCost: 200, unlockLevel: 5, capacityBonus: 50, effect: 'Food preservation +20%', icon: '🫙' },
  { id: 'fungal_garden', name: 'Fungal Garden', description: 'Underground gardens where specialized fungi are cultivated for food.', unlockCost: 350, unlockLevel: 10, capacityBonus: 30, effect: 'Fungus food production +25%', icon: '🍄' },
  { id: 'soldier_barracks', name: 'Soldier Barracks', description: 'Training grounds where soldiers drill and prepare for battle.', unlockCost: 500, unlockLevel: 15, capacityBonus: 40, effect: 'Soldier attack +10%', icon: '⚔️' },
  { id: 'mining_shaft', name: 'Mining Shaft', description: 'Deep tunnels for extracting valuable resources from the earth.', unlockCost: 750, unlockLevel: 20, capacityBonus: 60, effect: 'Mining yield +20%', icon: '⛏️' },
];

// ---------------------------------------------------------------------------
// Static Data — Roles
// ---------------------------------------------------------------------------

export const AC_ROLES: RoleDef[] = [
  { id: 'worker', name: 'Worker', description: 'General-purpose ants that handle construction, foraging, and maintenance.', icon: '🐜', efficiency: 1.0, unlockLevel: 1, moraleBoost: 0 },
  { id: 'soldier', name: 'Soldier', description: 'Heavily-armored ants with powerful mandibles for defending the colony.', icon: '🛡️', efficiency: 0.8, unlockLevel: 3, moraleBoost: 5 },
  { id: 'scout', name: 'Scout', description: 'Fast, observant ants that explore new territory and find resources.', icon: '🔭', efficiency: 1.2, unlockLevel: 2, moraleBoost: 0 },
  { id: 'nurse', name: 'Nurse', description: 'Caregiver ants that tend to larvae, the queen, and injured colony members.', icon: '💉', efficiency: 0.7, unlockLevel: 4, moraleBoost: 10 },
  { id: 'farmer', name: 'Farmer', description: 'Agricultural specialists that cultivate fungus and tend aphid herds.', icon: '🌾', efficiency: 1.1, unlockLevel: 8, moraleBoost: 5 },
  { id: 'miner', name: 'Miner', description: 'Strong-jawed ants capable of excavating stone and extracting minerals.', icon: '⛏️', efficiency: 0.9, unlockLevel: 12, moraleBoost: 0 },
  { id: 'builder', name: 'Builder', description: 'Architect ants that design and reinforce tunnels and structures.', icon: '🏗️', efficiency: 1.3, unlockLevel: 16, moraleBoost: 5 },
  { id: 'royal_guard', name: 'Royal Guard', description: 'Elite soldiers sworn to protect the queen with their lives.', icon: '🎖️', efficiency: 0.6, unlockLevel: 25, moraleBoost: 20 },
];

// ---------------------------------------------------------------------------
// Static Data — Food Types
// ---------------------------------------------------------------------------

const FOOD_DEFS: { type: FoodType; name: string; nutrition: number; icon: string }[] = [
  { type: 'leaf', name: 'Leaf', nutrition: 3, icon: '🍃' },
  { type: 'seed', name: 'Seed', nutrition: 5, icon: '🌰' },
  { type: 'nectar', name: 'Nectar', nutrition: 8, icon: '🍯' },
  { type: 'insect', name: 'Insect', nutrition: 12, icon: '🪲' },
  { type: 'fungus', name: 'Fungus', nutrition: 6, icon: '🍄' },
];

const FOOD_MAP = Object.fromEntries(FOOD_DEFS.map(f => [f.type, f]));

// ---------------------------------------------------------------------------
// Static Data — Resource Types
// ---------------------------------------------------------------------------

const RESOURCE_DEFS: { type: ResourceType; name: string; icon: string }[] = [
  { type: 'soil', name: 'Soil', icon: '🟫' },
  { type: 'stone', name: 'Stone', icon: '🪨' },
  { type: 'wood', name: 'Wood', icon: '🪵' },
  { type: 'crystal', name: 'Crystal', icon: '💎' },
  { type: 'resin', name: 'Resin', icon: '🟡' },
];

const RESOURCE_MAP = Object.fromEntries(RESOURCE_DEFS.map(r => [r.type, r]));

// ---------------------------------------------------------------------------
// Static Data — Biomes (6)
// ---------------------------------------------------------------------------

export const AC_BIOMES: BiomeDef[] = [
  {
    id: 'forest_floor',
    name: 'Forest Floor',
    description: 'A rich, dark forest floor teeming with decomposing leaves, fallen branches, and hidden insects.',
    difficulty: 1,
    dangerLevel: 2,
    icon: '🌲',
    lootTable: [
      { foodType: 'leaf', weight: 40, minAmount: 3, maxAmount: 8 },
      { foodType: 'seed', weight: 25, minAmount: 1, maxAmount: 5 },
      { foodType: 'insect', weight: 20, minAmount: 1, maxAmount: 3 },
      { foodType: 'fungus', weight: 10, minAmount: 1, maxAmount: 4 },
      { foodType: 'nectar', weight: 5, minAmount: 1, maxAmount: 2 },
    ],
  },
  {
    id: 'rainforest_canopy',
    name: 'Rainforest Canopy',
    description: 'The dizzying heights of the rainforest canopy, where exotic insects and rare plants thrive among the branches.',
    difficulty: 3,
    dangerLevel: 4,
    icon: '🌴',
    lootTable: [
      { foodType: 'nectar', weight: 30, minAmount: 2, maxAmount: 6 },
      { foodType: 'leaf', weight: 25, minAmount: 2, maxAmount: 7 },
      { foodType: 'insect', weight: 25, minAmount: 2, maxAmount: 5 },
      { foodType: 'fungus', weight: 15, minAmount: 1, maxAmount: 3 },
      { foodType: 'seed', weight: 5, minAmount: 1, maxAmount: 2 },
    ],
  },
  {
    id: 'desert_sands',
    name: 'Desert Sands',
    description: 'Scorching desert dunes where only the hardiest ants survive. Rich in crystals but scarce in food.',
    difficulty: 4,
    dangerLevel: 5,
    icon: '🏜️',
    lootTable: [
      { foodType: 'seed', weight: 30, minAmount: 2, maxAmount: 6 },
      { foodType: 'insect', weight: 20, minAmount: 1, maxAmount: 3 },
      { foodType: 'leaf', weight: 10, minAmount: 1, maxAmount: 2 },
      { foodType: 'nectar', weight: 5, minAmount: 1, maxAmount: 1 },
      { foodType: 'fungus', weight: 5, minAmount: 1, maxAmount: 1 },
    ],
  },
  {
    id: 'river_bank',
    name: 'River Bank',
    description: 'The muddy banks of a rushing river, rich in organic material and aquatic insects.',
    difficulty: 2,
    dangerLevel: 3,
    icon: '🏞️',
    lootTable: [
      { foodType: 'insect', weight: 35, minAmount: 2, maxAmount: 6 },
      { foodType: 'leaf', weight: 25, minAmount: 3, maxAmount: 8 },
      { foodType: 'seed', weight: 15, minAmount: 1, maxAmount: 4 },
      { foodType: 'nectar', weight: 15, minAmount: 1, maxAmount: 3 },
      { foodType: 'fungus', weight: 10, minAmount: 1, maxAmount: 3 },
    ],
  },
  {
    id: 'meadow',
    name: 'Meadow',
    description: 'Vast open grasslands dotted with wildflowers. Rich in seeds and nectar but exposed to predators.',
    difficulty: 1,
    dangerLevel: 2,
    icon: '🌼',
    lootTable: [
      { foodType: 'seed', weight: 35, minAmount: 3, maxAmount: 10 },
      { foodType: 'nectar', weight: 30, minAmount: 2, maxAmount: 5 },
      { foodType: 'leaf', weight: 20, minAmount: 3, maxAmount: 7 },
      { foodType: 'insect', weight: 10, minAmount: 1, maxAmount: 2 },
      { foodType: 'fungus', weight: 5, minAmount: 1, maxAmount: 2 },
    ],
  },
  {
    id: 'rotting_log',
    name: 'Rotting Log',
    description: 'A decaying fallen log rich in fungus and wood-boring insects. Dark and damp, perfect for certain species.',
    difficulty: 2,
    dangerLevel: 3,
    icon: '🪵',
    lootTable: [
      { foodType: 'fungus', weight: 40, minAmount: 3, maxAmount: 8 },
      { foodType: 'insect', weight: 25, minAmount: 2, maxAmount: 5 },
      { foodType: 'leaf', weight: 15, minAmount: 1, maxAmount: 4 },
      { foodType: 'seed', weight: 10, minAmount: 1, maxAmount: 3 },
      { foodType: 'nectar', weight: 10, minAmount: 1, maxAmount: 2 },
    ],
  },
];

// ---------------------------------------------------------------------------
// Static Data — 40 Ant Species (8 per biome)
// ---------------------------------------------------------------------------

export const AC_SPECIES: AntSpeciesDef[] = [
  // ---- Forest Floor (8) ----
  { id: 'sp_ff_carpenter', name: 'Carpenter Ant', biome: 'forest_floor', rarity: 'Common', description: 'Large wood-boring ants that carve intricate tunnels through fallen timber.', strength: 6, intelligence: 5, speed: 4, special: 'Wood excavation bonus', discoverXP: 10 },
  { id: 'sp_ff_woodlouse', name: 'Woodlouse Hunter', biome: 'forest_floor', rarity: 'Common', description: 'Specialist predators of woodlice and small arthropods on the forest floor.', strength: 4, intelligence: 4, speed: 6, special: 'Insect food +10%', discoverXP: 10 },
  { id: 'sp_ff_leafcutter', name: 'Leafcutter Minor', biome: 'forest_floor', rarity: 'Common', description: 'Smaller caste of leafcutters that gather fresh leaves for the fungal gardens.', strength: 3, intelligence: 6, speed: 5, special: 'Leaf gathering +15%', discoverXP: 15 },
  { id: 'sp_ff_thorny', name: 'Thornback Ant', biome: 'forest_floor', rarity: 'Rare', description: 'Covered in sharp defensive spines that deter most predators.', strength: 7, intelligence: 3, speed: 3, special: 'Colony defense +20%', discoverXP: 50 },
  { id: 'sp_ff_pheromone', name: 'Pheromone Weaver', biome: 'forest_floor', rarity: 'Rare', description: 'Produces unusually complex pheromone signals for superior coordination.', strength: 3, intelligence: 9, speed: 4, special: 'Trail efficiency +25%', discoverXP: 60 },
  { id: 'sp_ff_mycelium', name: 'Mycelium Rider', biome: 'forest_floor', rarity: 'Epic', description: 'A symbiotic species that rides and cultivates underground fungal networks.', strength: 4, intelligence: 8, speed: 3, special: 'Fungus production +40%', discoverXP: 150 },
  { id: 'sp_ff_oakheart', name: 'Oakheart Guardian', biome: 'forest_floor', rarity: 'Legendary', description: 'Ancient ants living beneath thousand-year-old oaks, nearly invulnerable.', strength: 10, intelligence: 7, speed: 2, special: 'Room defense +50%', discoverXP: 400 },
  { id: 'sp_ff_verdant', name: 'Verdant Sovereign', biome: 'forest_floor', rarity: 'Mythic', description: 'A queen caste of immense size that commands entire forest ecosystems.', strength: 8, intelligence: 10, speed: 1, special: 'All production +30%', discoverXP: 1000 },

  // ---- Rainforest Canopy (8) ----
  { id: 'sp_rc_stalk-eyed', name: 'Stalk-Eyed Acrobat', biome: 'rainforest_canopy', rarity: 'Common', description: 'Ants with elongated eyestalks that give them exceptional depth perception for canopy navigation.', strength: 3, intelligence: 7, speed: 7, special: 'Scout range +20%', discoverXP: 15 },
  { id: 'sp_rc_dewdrop', name: 'Dewdrop Forager', biome: 'rainforest_canopy', rarity: 'Common', description: 'Collects morning dew and flower nectar in specialized crop chambers.', strength: 2, intelligence: 5, speed: 8, special: 'Nectar gathering +20%', discoverXP: 15 },
  { id: 'sp_rc_canopy_weaver', name: 'Canopy Weaver', biome: 'rainforest_canopy', rarity: 'Common', description: 'Builds elaborate silk bridges between branches for safe foraging routes.', strength: 4, intelligence: 8, speed: 5, special: 'Bridge building', discoverXP: 20 },
  { id: 'sp_rc_blossom', name: 'Blossom Guardian', biome: 'rainforest_canopy', rarity: 'Rare', description: 'Lives exclusively in rare orchid blooms, defending them from herbivores.', strength: 5, intelligence: 6, speed: 6, special: 'Rare species attraction', discoverXP: 55 },
  { id: 'sp_rc_venom_dart', name: 'Venom Dart Ant', biome: 'rainforest_canopy', rarity: 'Rare', description: 'Fires concentrated venom droplets at threats from the canopy above.', strength: 8, intelligence: 5, speed: 4, special: 'Battle damage +30%', discoverXP: 65 },
  { id: 'sp_rc_epiphyte', name: 'Epiphyte Symbiote', biome: 'rainforest_canopy', rarity: 'Epic', description: 'Nests in bromeliad tanks, creating mini-ecosystems high in the canopy.', strength: 5, intelligence: 9, speed: 4, special: 'Food storage +30%', discoverXP: 160 },
  { id: 'sp_rc_sun_crowned', name: 'Sun-Crowned Tyrant', biome: 'rainforest_canopy', rarity: 'Legendary', description: 'Golden-armored apex predators that hunt from above with devastating precision.', strength: 10, intelligence: 8, speed: 7, special: 'Expedition power +50%', discoverXP: 420 },
  { id: 'sp_rc_canopy_empress', name: 'Canopy Empress', biome: 'rainforest_canopy', rarity: 'Mythic', description: 'Rules an aerial colony of millions from a woven silk palace in the treetops.', strength: 9, intelligence: 10, speed: 6, special: 'Population limit +25%', discoverXP: 1100 },

  // ---- Desert Sands (8) ----
  { id: 'sp_ds_harvester', name: 'Desert Harvester', biome: 'desert_sands', rarity: 'Common', description: 'Tough ants that emerge at dawn and dusk to collect seeds before the heat peaks.', strength: 5, intelligence: 5, speed: 5, special: 'Seed gathering +25%', discoverXP: 15 },
  { id: 'sp_ds_sandswimmer', name: 'Sandswimmer', biome: 'desert_sands', rarity: 'Common', description: 'Moves through loose sand like water, avoiding the scorching surface temperatures.', strength: 4, intelligence: 6, speed: 7, special: 'Tunnel dig speed +20%', discoverXP: 15 },
  { id: 'sp_ds_heatshield', name: 'Heatshield Worker', biome: 'desert_sands', rarity: 'Common', description: 'Reflective silver exoskeleton deflects intense desert sunlight.', strength: 6, intelligence: 3, speed: 4, special: 'Desert survival bonus', discoverXP: 20 },
  { id: 'sp_ds_scorpion_hunter', name: 'Scorpion Hunter', biome: 'desert_sands', rarity: 'Rare', description: 'Pack hunters that coordinate to take down scorpions many times their size.', strength: 8, intelligence: 7, speed: 5, special: 'Battle XP +25%', discoverXP: 55 },
  { id: 'sp_ds_oasis_keeper', name: 'Oasis Keeper', biome: 'desert_sands', rarity: 'Rare', description: 'Guards and maintains hidden underground water sources beneath desert oases.', strength: 5, intelligence: 8, speed: 3, special: 'Water/food preservation +20%', discoverXP: 60 },
  { id: 'sp_ds_crystal_mandible', name: 'Crystal Mandible', biome: 'desert_sands', rarity: 'Epic', description: 'Mandibles are crystallized by mineral-rich desert sand, able to cut through stone.', strength: 9, intelligence: 5, speed: 4, special: 'Mining yield +40%', discoverXP: 155 },
  { id: 'sp_ds_dune_emperor', name: 'Dune Emperor', biome: 'desert_sands', rarity: 'Legendary', description: 'Massive ants that roam desert dunes, feared by every creature in the sands.', strength: 10, intelligence: 6, speed: 6, special: 'Army power +50%', discoverXP: 410 },
  { id: 'sp_ds_sphinx_guardian', name: 'Sphinx Guardian', biome: 'desert_sands', rarity: 'Mythic', description: 'Ancient sentinels that protect buried treasures and long-forgotten underground temples.', strength: 10, intelligence: 9, speed: 5, special: 'Crystal drops +50%', discoverXP: 1050 },

  // ---- River Bank (8) ----
  { id: 'sp_rb_mud_architect', name: 'Mud Architect', biome: 'river_bank', rarity: 'Common', description: 'Builds elaborate mud towers along riverbanks that survive seasonal floods.', strength: 5, intelligence: 7, speed: 4, special: 'Building speed +15%', discoverXP: 10 },
  { id: 'sp_rb_fisher', name: 'Fisher Ant', biome: 'river_bank', rarity: 'Common', description: 'Wades into shallow water to catch small aquatic insects and larvae.', strength: 4, intelligence: 6, speed: 6, special: 'Insect food +20%', discoverXP: 10 },
  { id: 'sp_rb_flood_survivor', name: 'Flood Survivor', biome: 'river_bank', rarity: 'Common', description: 'Can survive underwater for hours by trapping air bubbles in its body hairs.', strength: 3, intelligence: 5, speed: 7, special: 'Disaster resistance +20%', discoverXP: 15 },
  { id: 'sp_rb_reed_weaver', name: 'Reed Weaver', biome: 'river_bank', rarity: 'Rare', description: 'Weaves living reeds into floating rafts that serve as mobile colonies.', strength: 4, intelligence: 8, speed: 5, special: 'Mobile base capability', discoverXP: 50 },
  { id: 'sp_rb_rapid_rusher', name: 'Rapid Rusher', biome: 'river_bank', rarity: 'Rare', description: 'Uses river currents for rapid long-distance transport of food and resources.', strength: 3, intelligence: 6, speed: 10, special: 'Transport speed +30%', discoverXP: 55 },
  { id: 'sp_rb_clam_cracker', name: 'Clam Cracker', biome: 'river_bank', rarity: 'Epic', description: 'Coordinated teams crack open freshwater clams for their nutrient-rich meat.', strength: 7, intelligence: 9, speed: 3, special: 'Nutrition bonus +35%', discoverXP: 145 },
  { id: 'sp_rb_tidecaller', name: 'Tidecaller', biome: 'river_bank', rarity: 'Legendary', description: 'Mysterious ants whose pheromones can predict and influence water flow patterns.', strength: 6, intelligence: 10, speed: 5, special: 'Resource detection +50%', discoverXP: 400 },
  { id: 'sp_rb_river_queen', name: 'River Queen', biome: 'river_bank', rarity: 'Mythic', description: 'A queen whose colony spans both banks of the greatest river, connected by living bridges.', strength: 7, intelligence: 10, speed: 8, special: 'All biomes accessible', discoverXP: 1020 },

  // ---- Meadow (8) ----
  { id: 'sp_mw_common_garden', name: 'Garden Ant', biome: 'meadow', rarity: 'Common', description: 'The quintessential meadow ant, friendly and efficient at seed collection.', strength: 3, intelligence: 4, speed: 5, special: 'Seed gathering +10%', discoverXP: 5 },
  { id: 'sp_mw_pollen', name: 'Pollen Porter', biome: 'meadow', rarity: 'Common', description: 'Specialized hairy body collects and transports pollen between wildflowers.', strength: 2, intelligence: 5, speed: 7, special: 'Nectar gathering +15%', discoverXP: 10 },
  { id: 'sp_mw_turf_defender', name: 'Turf Defender', biome: 'meadow', rarity: 'Common', description: 'Aggressively patrols a small territory around the colony entrance.', strength: 5, intelligence: 3, speed: 4, special: 'Colony defense +10%', discoverXP: 10 },
  { id: 'sp_mw_dandelion', name: 'Dandelion Rider', biome: 'meadow', rarity: 'Rare', description: 'Hitches rides on dandelion seeds to colonize distant meadows.', strength: 2, intelligence: 8, speed: 9, special: 'Scout range +40%', discoverXP: 50 },
  { id: 'sp_mw_honey_thief', name: 'Honey Thief', biome: 'meadow', rarity: 'Rare', description: 'Expert at raiding bee hives for honey with minimal casualties.', strength: 6, intelligence: 7, speed: 6, special: 'Nectar yield +30%', discoverXP: 55 },
  { id: 'sp_mw_flower_knight', name: 'Flower Knight', biome: 'meadow', rarity: 'Epic', description: 'Armored in petal-like plates, these ants guard flowering territories fiercely.', strength: 8, intelligence: 6, speed: 5, special: 'Battle defense +35%', discoverXP: 150 },
  { id: 'sp_mw_meadow_king', name: 'Meadow King', biome: 'meadow', rarity: 'Legendary', description: 'Commands vast armies across meadow kingdoms visible from the highest hills.', strength: 9, intelligence: 8, speed: 6, special: 'Army size +50%', discoverXP: 390 },
  { id: 'sp_mw_sunlit_queen', name: 'Sunlit Queen', biome: 'meadow', rarity: 'Mythic', description: 'Her colony glows with golden light at dawn, and every flower bends toward her presence.', strength: 7, intelligence: 10, speed: 7, special: 'Colony XP bonus +40%', discoverXP: 980 },

  // ---- Rotting Log (8) ----
  { id: 'sp_rl_ambush', name: 'Ambush Predator', biome: 'rotting_log', rarity: 'Common', description: 'Lies perfectly still in dark crevices, striking passing insects with incredible speed.', strength: 7, intelligence: 4, speed: 8, special: 'Battle surprise +20%', discoverXP: 10 },
  { id: 'sp_rl_rot_cultivator', name: 'Rot Cultivator', biome: 'rotting_log', rarity: 'Common', description: 'Tends and accelerates decomposition of wood to cultivate fungal food gardens.', strength: 3, intelligence: 7, speed: 3, special: 'Fungus growth +20%', discoverXP: 15 },
  { id: 'sp_rl_tunnel_scout', name: 'Tunnel Scout', biome: 'rotting_log', rarity: 'Common', description: 'Navigates the complex maze of galleries inside rotting logs with perfect memory.', strength: 2, intelligence: 8, speed: 6, special: 'Tunnel vision +20%', discoverXP: 10 },
  { id: 'sp_rl_bark_mimic', name: 'Bark Mimic', biome: 'rotting_log', rarity: 'Rare', description: 'Exoskeleton perfectly matches rotting bark, making them nearly invisible.', strength: 4, intelligence: 7, speed: 5, special: 'Stealth +40%', discoverXP: 55 },
  { id: 'sp_rl_spore_carrier', name: 'Spore Carrier', biome: 'rotting_log', rarity: 'Rare', description: 'Distributes beneficial fungal spores throughout the colony for food cultivation.', strength: 3, intelligence: 9, speed: 4, special: 'Food variety +25%', discoverXP: 60 },
  { id: 'sp_rl_timber_lord', name: 'Timber Lord', biome: 'rotting_log', rarity: 'Epic', description: 'An ancient species that has lived in the same log for generations, growing to enormous size.', strength: 9, intelligence: 6, speed: 2, special: 'Colony HP +40%', discoverXP: 155 },
  { id: 'sp_rl_decay_weaver', name: 'Decay Weaver', biome: 'rotting_log', rarity: 'Legendary', description: 'Controls the decomposition process, turning dead wood into nutrient-rich colony foundations.', strength: 6, intelligence: 10, speed: 4, special: 'Resource conversion +50%', discoverXP: 405 },
  { id: 'sp_rl_ancient_heart', name: 'Ancient Heartwood', biome: 'rotting_log', rarity: 'Mythic', description: 'The oldest living ant colony on Earth, nested in a petrified tree for millennia.', strength: 8, intelligence: 10, speed: 3, special: 'Room capacity +50%', discoverXP: 990 },
];

// ---------------------------------------------------------------------------
// Static Data — 30 Enemies
// ---------------------------------------------------------------------------

export const AC_ENEMIES: EnemyDef[] = [
  // ---- Spiders (5) ----
  { id: 'en_wolf_spider', name: 'Wolf Spider', type: 'Spider', hp: 30, attack: 8, defense: 4, speed: 7, biome: ['forest_floor', 'meadow'], coinsReward: 15, xpReward: 25, description: 'Fast hunting spider that roams the ground chasing prey.' },
  { id: 'en_trapdoor', name: 'Trapdoor Spider', type: 'Spider', hp: 40, attack: 12, defense: 8, speed: 3, biome: ['forest_floor', 'rotting_log'], coinsReward: 25, xpReward: 40, description: 'Ambush predator lurking behind a hidden trapdoor.' },
  { id: 'en_orb_weaver', name: 'Orb Weaver', type: 'Spider', hp: 25, attack: 10, defense: 3, speed: 5, biome: ['meadow', 'river_bank'], coinsReward: 20, xpReward: 35, description: 'Builds intricate webs that can ensnare multiple ants at once.' },
  { id: 'en_tarantula', name: 'Tarantula', type: 'Spider', hp: 80, attack: 18, defense: 12, speed: 4, biome: ['desert_sands', 'forest_floor'], coinsReward: 60, xpReward: 100, description: 'Massive hairy spider with crushing fangs and urticating hairs.' },
  { id: 'en_black_widow', name: 'Black Widow', type: 'Spider', hp: 20, attack: 25, defense: 2, speed: 8, biome: ['rotting_log', 'desert_sands'], coinsReward: 50, xpReward: 80, description: 'Extremely venomous spider whose bite is lethal to many ant species.' },

  // ---- Beetles (5) ----
  { id: 'en_ground_beetle', name: 'Ground Beetle', type: 'Beetle', hp: 35, attack: 10, defense: 10, speed: 5, biome: ['forest_floor', 'meadow'], coinsReward: 18, xpReward: 30, description: 'Armored predatory beetle with powerful crushing mandibles.' },
  { id: 'en_stag_beetle', name: 'Stag Beetle', type: 'Beetle', hp: 50, attack: 15, defense: 15, speed: 3, biome: ['rotting_log', 'forest_floor'], coinsReward: 35, xpReward: 55, description: 'Enormous mandibles used in combat can snap ants in half.' },
  { id: 'en_bombardier', name: 'Bombardier Beetle', type: 'Beetle', hp: 28, attack: 20, defense: 6, speed: 6, biome: ['rotting_log', 'rainforest_canopy'], coinsReward: 40, xpReward: 65, description: 'Sprays boiling chemicals at attackers, devastating entire ant squads.' },
  { id: 'en_dung_beetle', name: 'Dung Beetle', type: 'Beetle', hp: 45, attack: 8, defense: 18, speed: 4, biome: ['meadow', 'desert_sands'], coinsReward: 15, xpReward: 25, description: 'Not aggressive but its armored body crushes anything in its path.' },
  { id: 'en_fire_beetle', name: 'Fire Beetle', type: 'Beetle', hp: 60, attack: 14, defense: 10, speed: 7, biome: ['desert_sands', 'rainforest_canopy'], coinsReward: 45, xpReward: 70, description: 'Iridescent beetle that can ignite its shell to burn attacking ants.' },

  // ---- Antlions (4) ----
  { id: 'en_antlion_larva', name: 'Antlion Larva', type: 'Antlion', hp: 35, attack: 15, defense: 5, speed: 2, biome: ['desert_sands', 'meadow'], coinsReward: 30, xpReward: 45, description: 'Lies at the bottom of conical pits waiting for ants to slide in.' },
  { id: 'en_antlion_adult', name: 'Antlion Adult', type: 'Antlion', hp: 25, attack: 12, defense: 3, speed: 9, biome: ['meadow', 'desert_sands'], coinsReward: 22, xpReward: 35, description: 'Delicate winged adult with voracious appetite for flying ants.' },
  { id: 'en_giant_antlion', name: 'Giant Antlion', type: 'Antlion', hp: 90, attack: 22, defense: 8, speed: 2, biome: ['desert_sands'], coinsReward: 70, xpReward: 120, description: 'An enormous antlion whose pit traps can swallow dozens of ants.' },
  { id: 'en_dune_trap', name: 'Dune Trap Lord', type: 'Antlion', hp: 120, attack: 28, defense: 15, speed: 1, biome: ['desert_sands'], coinsReward: 100, xpReward: 180, description: 'The apex antlion of the deep desert, commanding a network of mega-traps.' },

  // ---- Wasps (4) ----
  { id: 'en_paper_wasp', name: 'Paper Wasp', type: 'Wasp', hp: 20, attack: 16, defense: 2, speed: 9, biome: ['meadow', 'forest_floor'], coinsReward: 28, xpReward: 40, description: 'Aggressive territorial wasp that attacks any ant near its nest.' },
  { id: 'en_yellowjacket', name: 'Yellowjacket', type: 'Wasp', hp: 22, attack: 14, defense: 3, speed: 8, biome: ['meadow', 'river_bank'], coinsReward: 25, xpReward: 38, description: 'Fierce swarm hunter that can coordinate mass attacks on ant colonies.' },
  { id: 'en_hornet', name: 'Asian Giant Hornet', type: 'Wasp', hp: 55, attack: 30, defense: 8, speed: 7, biome: ['rainforest_canopy', 'forest_floor'], coinsReward: 65, xpReward: 110, description: 'The most feared insect predator — a single hornet can kill thousands of ants.' },
  { id: 'en_cuckoo_wasp', name: 'Cuckoo Wasp', type: 'Wasp', hp: 15, attack: 8, defense: 12, speed: 10, biome: ['rotting_log', 'forest_floor'], coinsReward: 35, xpReward: 50, description: 'Parasitic wasp that infiltrates ant colonies to lay eggs among the brood.' },

  // ---- Centipedes (4) ----
  { id: 'en_house_centipede', name: 'House Centipede', type: 'Centipede', hp: 30, attack: 14, defense: 4, speed: 10, biome: ['rotting_log', 'forest_floor'], coinsReward: 20, xpReward: 35, description: 'Lightning-fast predator that hunts ants in dark, damp environments.' },
  { id: 'en_soil_centipede', name: 'Soil Centipede', type: 'Centipede', hp: 40, attack: 12, defense: 8, speed: 7, biome: ['forest_floor', 'river_bank'], coinsReward: 25, xpReward: 42, description: 'Burrowing centipede that erupts from underground to grab passing ants.' },
  { id: 'en_giant_centipede', name: 'Giant Centipede', type: 'Centipede', hp: 70, attack: 20, defense: 10, speed: 8, biome: ['rainforest_canopy', 'rotting_log'], coinsReward: 55, xpReward: 90, description: 'Venomous tropical centipede over 30cm long with devastating grip.' },
  { id: 'en_stone_centipede', name: 'Stone Centipede', type: 'Centipede', hp: 100, attack: 24, defense: 18, speed: 5, biome: ['desert_sands', 'rotting_log'], coinsReward: 75, xpReward: 130, description: 'Ancient armored centipede with petrified exoskeleton segments.' },

  // ---- Other threats (8) ----
  { id: 'en_termite_king', name: 'Termite King', type: 'Termite', hp: 60, attack: 10, defense: 12, speed: 3, biome: ['forest_floor', 'rotting_log'], coinsReward: 40, xpReward: 60, description: 'The reproductive king of a rival termite colony competing for wood resources.' },
  { id: 'en_termite_soldier', name: 'Termite Soldier', type: 'Termite', hp: 35, attack: 14, defense: 14, speed: 4, biome: ['forest_floor', 'rotting_log'], coinsReward: 20, xpReward: 35, description: 'Chemical-spraying termite soldier with hardened head used as a battering ram.' },
  { id: 'en_praying_mantis', name: 'Praying Mantis', type: 'Mantis', hp: 45, attack: 22, defense: 6, speed: 8, biome: ['meadow', 'rainforest_canopy'], coinsReward: 35, xpReward: 55, description: 'Lightning-fast ambush predator with raptorial forelegs that grab and crush ants.' },
  { id: 'en_devils_coach', name: "Devil's Coach Horse", type: 'Beetle', hp: 38, attack: 16, defense: 8, speed: 6, biome: ['rotting_log', 'forest_floor'], coinsReward: 28, xpReward: 45, description: 'Aggressive rove beetle that sprays foul chemicals and fights with flexible abdomen.' },
  { id: 'en_assassin_bug', name: 'Assassin Bug', type: 'Bug', hp: 32, attack: 18, defense: 5, speed: 7, biome: ['rainforest_canopy', 'forest_floor'], coinsReward: 30, xpReward: 50, description: 'Pierces ants with a needle-like proboscis and dissolves them from the inside.' },
  { id: 'en_cave_cricket', name: 'Cave Cricket', type: 'Cricket', hp: 50, attack: 8, defense: 15, speed: 9, biome: ['rotting_log', 'river_bank'], coinsReward: 18, xpReward: 28, description: 'Enormous jumping cricket that accidentally crushes ants in its powerful leaps.' },
  { id: 'en_scared_lizard', name: 'Blue-Tailed Skink', type: 'Reptile', hp: 120, attack: 20, defense: 10, speed: 8, biome: ['meadow', 'desert_sands'], coinsReward: 80, xpReward: 100, description: 'Small lizard that raids ant colonies for a quick protein-rich meal.' },
  { id: 'en_pharaoh_ant_queen', name: 'Pharaoh Ant Queen', type: 'Ant', hp: 200, attack: 15, defense: 20, speed: 3, biome: ['desert_sands', 'forest_floor'], coinsReward: 150, xpReward: 250, description: 'Rival ant queen commanding a massive invasive colony. The ultimate test of strength.' },
];

// ---------------------------------------------------------------------------
// Static Data — Pheromone Trails (6)
// ---------------------------------------------------------------------------

const PHEROMONE_TRAIL_DEFS = [
  { id: 'trail_main', name: 'Main Forage Trail', from: 'Colony Entrance', to: 'Primary Food Source', maxLevel: 10, baseEfficiency: 1.0, baseUpgradeCost: 50 },
  { id: 'trail_water', name: 'Water Run', from: 'Colony Entrance', to: 'River Access', maxLevel: 8, baseEfficiency: 0.8, baseUpgradeCost: 40 },
  { id: 'trail_fungal', name: 'Fungal Route', from: 'Fungal Garden', to: 'Rotting Log', maxLevel: 6, baseEfficiency: 0.7, baseUpgradeCost: 60 },
  { id: 'trail_scout_east', name: 'Eastern Patrol', from: 'Colony Entrance', to: 'Eastern Frontier', maxLevel: 8, baseEfficiency: 0.9, baseUpgradeCost: 45 },
  { id: 'trail_scout_west', name: 'Western Patrol', from: 'Colony Entrance', to: 'Western Frontier', maxLevel: 8, baseEfficiency: 0.9, baseUpgradeCost: 45 },
  { id: 'trail_emergency', name: 'Emergency Escape', from: 'Queen Chamber', to: 'Surface Exit', maxLevel: 5, baseEfficiency: 1.2, baseUpgradeCost: 100 },
];

// ---------------------------------------------------------------------------
// Static Data — Achievements (15)
// ---------------------------------------------------------------------------

const ACHIEVEMENT_DEFS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'ach_first_exp', name: 'First Steps', description: 'Complete your first expedition.', icon: '👣', condition: 'expeditions >= 1', reward: { coins: 50, xp: 100 } },
  { id: 'ach_level_10', name: 'Growing Colony', description: 'Reach colony level 10.', icon: '📈', condition: 'level >= 10', reward: { coins: 200, xp: 500 } },
  { id: 'ach_level_25', name: 'Thriving Settlement', description: 'Reach colony level 25.', icon: '🏘️', condition: 'level >= 25', reward: { coins: 500, xp: 1500 } },
  { id: 'ach_level_50', name: 'Ant Empire', description: 'Reach colony level 50.', icon: '🏛️', condition: 'level >= 50', reward: { coins: 2000, xp: 5000 } },
  { id: 'ach_5_species', name: 'Naturalist', description: 'Discover 5 different ant species.', icon: '🔬', condition: 'species >= 5', reward: { coins: 100, xp: 200 } },
  { id: 'ach_20_species', name: 'Expert Entomologist', description: 'Discover 20 different ant species.', icon: '🔎', condition: 'species >= 20', reward: { coins: 500, xp: 1000 } },
  { id: 'ach_40_species', name: 'Master Cataloger', description: 'Discover all 40 ant species.', icon: '📚', condition: 'species >= 40', reward: { coins: 2000, xp: 5000 } },
  { id: 'ach_rare_find', name: 'Rare Discovery', description: 'Discover your first rare or better species.', icon: '💎', condition: 'rareSpecies >= 1', reward: { coins: 150, xp: 300 } },
  { id: 'ach_mythic_find', name: 'Mythic Encounter', description: 'Discover a mythic species.', icon: '🌟', condition: 'mythicSpecies >= 1', reward: { coins: 1000, xp: 3000 } },
  { id: 'ach_streak_7', name: 'Dedicated Forager', description: 'Complete 7 daily expeditions in a row.', icon: '🔥', condition: 'streak >= 7', reward: { coins: 300, xp: 700 } },
  { id: 'ach_streak_30', name: 'Unstoppable Swarm', description: 'Complete 30 daily expeditions in a row.', icon: '⚡', condition: 'streak >= 30', reward: { coins: 1500, xp: 3000 } },
  { id: 'ach_10_enemies', name: 'Battle Hardened', description: 'Defeat 10 different enemy types.', icon: '⚔️', condition: 'enemiesDefeated >= 10', reward: { coins: 300, xp: 500 } },
  { id: 'ach_all_rooms', name: 'Underground Metropolis', description: 'Unlock all 6 colony rooms.', icon: '🏗️', condition: 'rooms >= 6', reward: { coins: 1000, xp: 2000 } },
  { id: 'ach_empress', name: 'Empress Ascension', description: 'Evolve the queen to Empress stage.', icon: '👑', condition: 'queenStage >= 4', reward: { coins: 3000, xp: 10000 } },
  { id: 'ach_tunnel_master', name: 'Master Architect', description: 'Dig at least 30 tunnel cells.', icon: '🕳️', condition: 'tunnels >= 30', reward: { coins: 400, xp: 800 } },
];

// ---------------------------------------------------------------------------
// Static Data — Hints (cycling tips)
// ---------------------------------------------------------------------------

const HINTS: string[] = [
  'Assign scouts to increase expedition success rates and find rare species.',
  'Farmers tend aphids automatically — check your honeydew reserves regularly!',
  'Upgrade pheromone trails to increase foraging efficiency and earn more resources.',
  'Soldiers are essential for battling tougher enemies at higher biome difficulties.',
  'The Mining Shaft room unlocks at level 20 and significantly boosts resource extraction.',
  'Daily expeditions give bonus rewards — keep your streak alive!',
  'Discovering rare species in dangerous biomes grants large XP bonuses.',
  'Royal Guards unlock at level 25 and provide a massive morale boost.',
  'Tunnel cells near crystal veins or resin deposits yield valuable resources.',
  'Balance your ant roles — too many soldiers and your colony will starve.',
  'The queen evolves through 5 stages, each granting powerful bonuses.',
  'Legendary and Mythic species can only be found on repeated biome expeditions.',
  'Builders reinforce tunnels, making them more resistant to enemy raids.',
  'Nurses increase population growth speed and heal wounded ants after battles.',
  'Aphid farming produces honeydew, a high-nutrition food source for the colony.',
  'The Soldier Barracks provide attack bonuses that stack with army size.',
  'Check biome difficulty before sending expeditions — send enough soldiers!',
  'Coins can be spent on room upgrades, trail improvements, and special abilities.',
  'Fungal Garden food production scales with the number of assigned farmers.',
  'Each biome has unique species — explore all six to complete your catalog!',
];

// ---------------------------------------------------------------------------
// Static Data — Biome Resource Drop Table
// ---------------------------------------------------------------------------

const BIOME_RESOURCE_DROPS: Record<BiomeId, { type: ResourceType; weight: number; minAmount: number; maxAmount: number }[]> = {
  forest_floor: [
    { type: 'wood', weight: 40, minAmount: 2, maxAmount: 6 },
    { type: 'soil', weight: 30, minAmount: 3, maxAmount: 8 },
    { type: 'resin', weight: 15, minAmount: 1, maxAmount: 2 },
    { type: 'crystal', weight: 5, minAmount: 0, maxAmount: 1 },
    { type: 'stone', weight: 10, minAmount: 1, maxAmount: 3 },
  ],
  rainforest_canopy: [
    { type: 'wood', weight: 35, minAmount: 2, maxAmount: 5 },
    { type: 'resin', weight: 30, minAmount: 2, maxAmount: 4 },
    { type: 'soil', weight: 15, minAmount: 2, maxAmount: 5 },
    { type: 'crystal', weight: 10, minAmount: 1, maxAmount: 2 },
    { type: 'stone', weight: 10, minAmount: 1, maxAmount: 2 },
  ],
  desert_sands: [
    { type: 'stone', weight: 30, minAmount: 2, maxAmount: 6 },
    { type: 'crystal', weight: 25, minAmount: 1, maxAmount: 3 },
    { type: 'soil', weight: 25, minAmount: 3, maxAmount: 8 },
    { type: 'resin', weight: 10, minAmount: 0, maxAmount: 1 },
    { type: 'wood', weight: 10, minAmount: 0, maxAmount: 1 },
  ],
  river_bank: [
    { type: 'soil', weight: 40, minAmount: 3, maxAmount: 8 },
    { type: 'stone', weight: 25, minAmount: 2, maxAmount: 5 },
    { type: 'wood', weight: 15, minAmount: 1, maxAmount: 3 },
    { type: 'resin', weight: 10, minAmount: 1, maxAmount: 2 },
    { type: 'crystal', weight: 10, minAmount: 0, maxAmount: 1 },
  ],
  meadow: [
    { type: 'soil', weight: 35, minAmount: 3, maxAmount: 7 },
    { type: 'wood', weight: 20, minAmount: 1, maxAmount: 4 },
    { type: 'stone', weight: 15, minAmount: 1, maxAmount: 3 },
    { type: 'resin', weight: 15, minAmount: 1, maxAmount: 2 },
    { type: 'crystal', weight: 5, minAmount: 0, maxAmount: 1 },
  ],
  rotting_log: [
    { type: 'wood', weight: 40, minAmount: 3, maxAmount: 8 },
    { type: 'soil', weight: 25, minAmount: 2, maxAmount: 6 },
    { type: 'resin', weight: 20, minAmount: 1, maxAmount: 3 },
    { type: 'stone', weight: 10, minAmount: 1, maxAmount: 2 },
    { type: 'crystal', weight: 5, minAmount: 0, maxAmount: 1 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.2, level - 1));
}

function weightedPick<T>(items: { item: T; weight: number }[]): T {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let roll = seededRandom(Date.now() + Math.random() * 10000) * totalWeight;
  for (const entry of items) {
    roll -= entry.weight;
    if (roll <= 0) return entry.item;
  }
  return items[items.length - 1].item;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(seededRandom(Date.now() + Math.random() * 9999) * arr.length)];
}

function getRaritySpeciesChance(rarity: RarityTier): number {
  switch (rarity) {
    case 'Common': return 0.50;
    case 'Rare': return 0.28;
    case 'Epic': return 0.14;
    case 'Legendary': return 0.06;
    case 'Mythic': return 0.02;
  }
}

function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

// ---------------------------------------------------------------------------
// State — lazy initialized, no browser API at module level
// ---------------------------------------------------------------------------

let state: AntColonyState | null = null;

function createInitialState(): AntColonyState {
  // Build initial tunnel grid (6 rows x 8 cols)
  const tunnelGrid: TunnelCell[][] = [];
  for (let row = 0; row < 6; row++) {
    const tunnelRow: TunnelCell[] = [];
    for (let col = 0; col < 8; col++) {
      const rng = seededRandom(hashCode(`tunnel_${row}_${col}`));
      let type: TunnelCellType = 'dirt';
      let hasResource = false;
      let resourceType: ResourceType | undefined;
      let resourceAmount: number | undefined;

      if (rng < 0.08) {
        type = 'stone';
        hasResource = true;
        resourceType = 'stone';
        resourceAmount = Math.floor(seededRandom(hashCode(`st_${row}_${col}`)) * 5) + 2;
      } else if (rng < 0.12) {
        type = 'crystal_vein';
        hasResource = true;
        resourceType = 'crystal';
        resourceAmount = Math.floor(seededRandom(hashCode(`cr_${row}_${col}`)) * 3) + 1;
      } else if (rng < 0.16) {
        type = 'resin_deposit';
        hasResource = true;
        resourceType = 'resin';
        resourceAmount = Math.floor(seededRandom(hashCode(`re_${row}_${col}`)) * 4) + 1;
      } else if (rng < 0.20) {
        type = 'water';
      }

      tunnelRow.push({
        row,
        col,
        type,
        dug: false,
        hasResource,
        resourceType,
        resourceAmount,
        reinforced: false,
      });
    }
    tunnelGrid.push(tunnelRow);
  }

  // Build initial rooms
  const rooms: Room[] = AC_ROOMS.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    unlocked: r.unlockLevel <= 1,
    level: r.unlockLevel <= 1 ? 1 : 0,
    icon: r.icon,
  }));

  // Build initial food storage
  const foodStorage: FoodItem[] = FOOD_DEFS.map((f) => ({
    type: f.type,
    name: f.name,
    amount: f.type === 'leaf' ? 10 : 0,
    nutrition: f.nutrition,
    icon: f.icon,
  }));

  // Build initial resource storage
  const resourceStorage: ResourceItem[] = RESOURCE_DEFS.map((r) => ({
    type: r.type,
    name: r.name,
    amount: r.type === 'soil' ? 5 : 0,
    icon: r.icon,
  }));

  // Build initial ant roles
  const antRoles: Record<RoleId, number> = {
    worker: 10,
    soldier: 3,
    scout: 2,
    nurse: 2,
    farmer: 0,
    miner: 0,
    builder: 0,
    royal_guard: 0,
  };

  // Build initial pheromone trails
  const pheromoneTrails: PheromoneTrail[] = PHEROMONE_TRAIL_DEFS.map((def) => ({
    id: def.id,
    name: def.name,
    from: def.from,
    to: def.to,
    level: 1,
    maxLevel: def.maxLevel,
    efficiency: def.baseEfficiency,
    upgradeCost: def.baseUpgradeCost,
    active: true,
  }));

  // Build initial achievements
  const achievements: Achievement[] = ACHIEVEMENT_DEFS.map((a) => ({
    ...a,
    unlocked: false,
    unlockedAt: 0,
  }));

  // Generate daily expedition
  const biomeIds: BiomeId[] = ['forest_floor', 'rainforest_canopy', 'desert_sands', 'river_bank', 'meadow', 'rotting_log'];
  const daySeed = hashCode(getTodayString());
  const dailyBiome = biomeIds[daySeed % biomeIds.length];
  const dailyBiomeDef = AC_BIOMES.find(b => b.id === dailyBiome)!;

  return {
    level: 1,
    xp: 0,
    totalXP: 0,
    coins: 50,
    colonyName: 'New Colony',
    queenStage: 0,
    population: 17,
    maxPopulation: 30,
    rooms,
    tunnelGrid,
    activeExpedition: null,
    foodStorage,
    resourceStorage,
    antRoles,
    speciesDiscovered: [],
    enemiesDefeated: [],
    achievements,
    unlockedAchievements: [],
    dailyExpedition: {
      biomeId: dailyBiome,
      biomeName: dailyBiomeDef.name,
      completed: false,
      available: true,
      bonusMultiplier: 1.5,
      daySeed,
    },
    streak: 0,
    bestStreak: 0,
    lastDailyDate: '',
    runHistory: [],
    stats: {
      totalXP: 0,
      totalCoins: 50,
      totalFoodCollected: 10,
      totalResourcesMined: 5,
      totalExpeditions: 0,
      totalBattles: 0,
      totalEnemiesDefeated: 0,
      totalSpeciesDiscovered: 0,
      totalTunnelsDug: 0,
      totalRoomsUnlocked: 1,
      totalDaysPlayed: 0,
      totalAphidsFarmed: 0,
      playtimeTicks: 0,
    },
    pheromoneTrails,
    aphidCount: 0,
    aphidLevel: 0,
    honeydewStored: 0,
    tick: 0,
    initializedAt: Date.now(),
  };
}

function ensureInit(): AntColonyState {
  if (state) return state;
  state = createInitialState();
  return state;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function recalcPopulation(s: AntColonyState): void {
  const basePop = 30 + AC_QUEEN_STAGES[s.queenStage].populationBonus + s.level * 3;
  const roomBonus = s.rooms
    .filter(r => r.unlocked)
    .reduce((sum, r) => {
      const def = AC_ROOMS.find(rd => rd.id === r.id);
      return sum + (def ? def.capacityBonus * r.level : 0);
    }, 0);
  s.maxPopulation = basePop + roomBonus;
  if (s.population > s.maxPopulation) s.population = s.maxPopulation;
}

function checkQueenEvolution(s: AntColonyState): void {
  for (let i = AC_QUEEN_STAGES.length - 1; i >= 0; i--) {
    const stage = AC_QUEEN_STAGES[i];
    if (s.level >= stage.levelRequired && s.totalXP >= stage.xpRequired && s.queenStage < i) {
      s.queenStage = i;
      recalcPopulation(s);
      break;
    }
  }
}

function addXP(s: AntColonyState, amount: number): { leveledUp: boolean; newLevel: number } {
  s.xp += amount;
  s.totalXP += amount;
  s.stats.totalXP += amount;
  let leveledUp = false;
  let newLevel = s.level;
  while (s.level < 50 && s.xp >= xpForLevel(s.level)) {
    s.xp -= xpForLevel(s.level);
    s.level++;
    newLevel = s.level;
    leveledUp = true;
    recalcPopulation(s);
    checkQueenEvolution(s);
  }
  return { leveledUp, newLevel };
}

function getAssignedTotal(s: AntColonyState): number {
  return Object.values(s.antRoles).reduce((sum, count) => sum + count, 0);
}

function addStatRun(s: AntColonyState): void {
  if (s.runHistory.length > 50) {
    s.runHistory = s.runHistory.slice(-50);
  }
}

// ---------------------------------------------------------------------------
// EXPORTED FUNCTIONS
// ---------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// 1. State Management
// -----------------------------------------------------------------------------

/**
 * Retrieve the full ant colony state. Initializes on first call (SSR-safe).
 */
export function acGetState(): AntColonyState {
  return ensureInit();
}

/**
 * Reset the entire colony to its initial state.
 */
export function acResetState(): void {
  state = null;
}

// -----------------------------------------------------------------------------
// 2. Level & XP
// -----------------------------------------------------------------------------

/**
 * Get current colony level (1-50).
 */
export function acGetLevel(): number {
  return ensureInit().level;
}

/**
 * Add XP to the colony. Returns whether a level-up occurred.
 */
export function acAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  return addXP(s, amount);
}

/**
 * Get XP progress toward next level.
 */
export function acGetXPProgress(): { current: number; needed: number; percentage: number } {
  const s = ensureInit();
  if (s.level >= 50) return { current: s.xp, needed: 0, percentage: 100 };
  const needed = xpForLevel(s.level);
  return { current: s.xp, needed, percentage: Math.min(100, (s.xp / needed) * 100) };
}

// -----------------------------------------------------------------------------
// 3. Queen
// -----------------------------------------------------------------------------

/**
 * Get the current queen evolution stage info.
 */
export function acGetQueenStage(): { name: string; stage: number; emoji: string } {
  const s = ensureInit();
  const def = AC_QUEEN_STAGES[s.queenStage];
  return { name: def.name, stage: def.stage, emoji: def.emoji };
}

// -----------------------------------------------------------------------------
// 4. Population
// -----------------------------------------------------------------------------

/**
 * Get current ant population.
 */
export function acGetPopulation(): number {
  return ensureInit().population;
}

// -----------------------------------------------------------------------------
// 5. Colony Name
// -----------------------------------------------------------------------------

/**
 * Get the colony name.
 */
export function acGetColonyName(): string {
  return ensureInit().colonyName;
}

/**
 * Set the colony name.
 */
export function acSetColonyName(name: string): void {
  const s = ensureInit();
  s.colonyName = name.length > 0 ? name.slice(0, 40) : 'New Colony';
}

// -----------------------------------------------------------------------------
// 6. Rooms
// -----------------------------------------------------------------------------

/**
 * Get all colony rooms with their current status.
 */
export function acGetRooms(): Room[] {
  const s = ensureInit();
  return [...s.rooms];
}

/**
 * Unlock a room by ID. Returns success and cost deducted.
 */
export function acUnlockRoom(roomId: string): { success: boolean; cost: number } {
  const s = ensureInit();
  const roomDef = AC_ROOMS.find(r => r.id === roomId);
  if (!roomDef) return { success: false, cost: 0 };

  const existingRoom = s.rooms.find(r => r.id === roomId);
  if (!existingRoom || existingRoom.unlocked) return { success: false, cost: 0 };
  if (s.level < roomDef.unlockLevel) return { success: false, cost: 0 };
  if (s.coins < roomDef.unlockCost) return { success: false, cost: 0 };

  s.coins -= roomDef.unlockCost;
  existingRoom.unlocked = true;
  existingRoom.level = 1;
  recalcPopulation(s);
  return { success: true, cost: roomDef.unlockCost };
}

// -----------------------------------------------------------------------------
// 7. Ant Roles
// -----------------------------------------------------------------------------

/**
 * Get all ant roles with their current assignment counts.
 */
export function acGetAntRoles(): RoleInfo[] {
  const s = ensureInit();
  return AC_ROLES.map((def) => ({
    id: def.id,
    name: def.name,
    description: def.description,
    icon: def.icon,
    assigned: s.antRoles[def.id],
    efficiency: def.efficiency,
    unlockLevel: def.unlockLevel,
  }));
}

/**
 * Assign ants to a role. Returns success and remaining unassigned.
 */
export function acAssignAnts(roleId: string, count: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  const roleDef = AC_ROLES.find(r => r.id === roleId);
  if (!roleDef) return { success: false, remaining: getAssignedTotal(s) };
  if (s.level < roleDef.unlockLevel) return { success: false, remaining: getAssignedTotal(s) };
  if (count < 0) return { success: false, remaining: getAssignedTotal(s) };

  const totalAssigned = getAssignedTotal(s);
  const currentlyAssigned = s.antRoles[roleId as RoleId];
  const maxAdditional = s.population - totalAssigned + currentlyAssigned;
  const actualAdd = Math.min(count, maxAdditional);

  s.antRoles[roleId as RoleId] = currentlyAssigned + actualAdd;
  const newRemaining = s.population - getAssignedTotal(s);
  return { success: actualAdd > 0, remaining: Math.max(0, newRemaining) };
}

// -----------------------------------------------------------------------------
// 8. Tunnel Grid
// -----------------------------------------------------------------------------

/**
 * Get the 6x8 tunnel grid.
 */
export function acGetTunnelGrid(): TunnelCell[][] {
  return ensureInit().tunnelGrid;
}

/**
 * Dig a tunnel cell. Returns success and any resource found.
 */
export function acDigTunnel(row: number, col: number): { success: boolean; resource?: string } {
  const s = ensureInit();

  if (row < 0 || row >= 6 || col < 0 || col >= 8) return { success: false };
  const cell = s.tunnelGrid[row][col];
  if (cell.dug) return { success: false };
  if (cell.type === 'water') return { success: false };

  const miners = s.antRoles.miner;
  const digPower = 1 + miners * 0.2;

  // Check if stone type requires more miners
  if (cell.type === 'stone' && digPower < 2) return { success: false };

  cell.dug = true;
  s.stats.totalTunnelsDug++;

  let resource: string | undefined;
  if (cell.hasResource && cell.resourceType && cell.resourceAmount) {
    const resItem = s.resourceStorage.find(r => r.type === cell.resourceType);
    if (resItem) {
      const bonus = s.rooms.find(rm => rm.id === 'mining_shaft' && rm.unlocked) ? 1.2 : 1.0;
      const gained = Math.floor(cell.resourceAmount * bonus);
      resItem.amount += gained;
      s.stats.totalResourcesMined += gained;
      resource = `${cell.resourceType} x${gained}`;
    }
    cell.hasResource = false;
    cell.resourceAmount = 0;
  } else if (!cell.hasResource) {
    // Small chance to get soil from regular dirt
    if (cell.type === 'dirt') {
      const soilGain = Math.floor(seededRandom(Date.now() + row * 8 + col) * 3) + 1;
      const resItem = s.resourceStorage.find(r => r.type === 'soil');
      if (resItem) {
        resItem.amount += soilGain;
        s.stats.totalResourcesMined += soilGain;
        resource = `soil x${soilGain}`;
      }
    }
  }

  return { success: true, resource };
}

// -----------------------------------------------------------------------------
// 9. Biomes
// -----------------------------------------------------------------------------

/**
 * Get all biomes with their species and exploration status.
 */
export function acGetBiomes(): Biome[] {
  const s = ensureInit();
  return AC_BIOMES.map((def) => {
    const species = AC_SPECIES
      .filter(sp => sp.biome === def.id)
      .map(sp => ({
        id: sp.id,
        name: sp.name,
        biome: sp.biome,
        rarity: sp.rarity,
        description: sp.description,
        strength: sp.strength,
        intelligence: sp.intelligence,
        speed: sp.speed,
        special: sp.special,
        discovered: s.speciesDiscovered.includes(sp.id),
        discoveredAt: s.speciesDiscovered.includes(sp.id) ? Date.now() : 0,
      }));
    return {
      id: def.id,
      name: def.name,
      description: def.description,
      difficulty: def.difficulty,
      dangerLevel: def.dangerLevel,
      icon: def.icon,
      species,
      explored: s.stats.totalExpeditions > 0,
      expeditionsCompleted: 0,
    };
  });
}

// -----------------------------------------------------------------------------
// 10. Expeditions
// -----------------------------------------------------------------------------

/**
 * Send an expedition to a biome. Returns expedition result.
 */
export function acGetExpedition(biomeId: string): ExpeditionResult {
  const s = ensureInit();
  const biomeDef = AC_BIOMES.find(b => b.id === biomeId);
  if (!biomeDef) {
    return {
      biome: biomeId as BiomeId,
      biomeName: 'Unknown',
      success: false,
      foodFound: [],
      speciesFound: null,
      enemiesEncountered: [],
      xpGained: 0,
      coinsGained: 0,
      resourcesFound: [],
    };
  }

  const soldiers = s.antRoles.soldier;
  const scouts = s.antRoles.scout;
  const workers = s.antRoles.worker;
  const totalExpeditionForce = soldiers + scouts + workers;

  if (totalExpeditionForce < 3) {
    return {
      biome: biomeId as BiomeId,
      biomeName: biomeDef.name,
      success: false,
      foodFound: [],
      speciesFound: null,
      enemiesEncountered: [],
      xpGained: 0,
      coinsGained: 0,
      resourcesFound: [],
    };
  }

  // Success calculation based on soldiers, scouts, and biome difficulty
  const successChance = clamp(0.4 + (soldiers * 0.05) + (scouts * 0.03) - (biomeDef.difficulty * 0.08), 0.1, 0.95);
  const success = seededRandom(Date.now() + s.tick * 7 + hashCode(biomeId)) < successChance;

  if (!success) {
    s.activeExpedition = {
      biome: biomeId as BiomeId,
      biomeName: biomeDef.name,
      success: false,
      foodFound: [],
      speciesFound: null,
      enemiesEncountered: ['Hostile creatures'],
      xpGained: 5,
      coinsGained: 0,
      resourcesFound: [],
    };
    s.stats.totalExpeditions++;
    addXP(s, 5);
    addStatRun(s);
    return s.activeExpedition;
  }

  // Gather food
  const foodFound: RewardItem[] = [];
  for (const loot of biomeDef.lootTable) {
    if (seededRandom(Date.now() + hashCode(loot.foodType + biomeId) + s.tick) < loot.weight / 100) {
      const amount = Math.floor(
        loot.minAmount +
        seededRandom(Date.now() + hashCode(`amt_${loot.foodType}_${s.tick}`)) * (loot.maxAmount - loot.minAmount + 1)
      );
      const foodItem = s.foodStorage.find(f => f.type === loot.foodType);
      if (foodItem && amount > 0) {
        foodItem.amount += amount;
        s.stats.totalFoodCollected += amount;
        foodFound.push({ type: 'food', id: loot.foodType, name: loot.foodType, amount });
      }
    }
  }

  // Gather resources
  const resourcesFound: RewardItem[] = [];
  const resDrops = BIOME_RESOURCE_DROPS[biomeId as BiomeId] || [];
  for (const drop of resDrops) {
    if (seededRandom(Date.now() + hashCode(drop.type + biomeId) + s.tick + 500) < drop.weight / 100) {
      const amount = Math.floor(
        drop.minAmount +
        seededRandom(Date.now() + hashCode(`ramt_${drop.type}_${s.tick}`)) * (drop.maxAmount - drop.minAmount + 1)
      );
      const resItem = s.resourceStorage.find(r => r.type === drop.type);
      if (resItem && amount > 0) {
        resItem.amount += amount;
        s.stats.totalResourcesMined += amount;
        resourcesFound.push({ type: 'resource', id: drop.type, name: drop.type, amount });
      }
    }
  }

  // Try to discover a species
  let speciesFound: AntSpecies | null = null;
  const biomeSpecies = AC_SPECIES.filter(sp => sp.biome === biomeId);
  const undiscovered = biomeSpecies.filter(sp => !s.speciesDiscovered.includes(sp.id));

  if (undiscovered.length > 0 && seededRandom(Date.now() + s.tick * 13 + hashCode(biomeId)) < 0.35 + (scouts * 0.02)) {
    // Pick species weighted by rarity
    const weighted = undiscovered.map(sp => ({
      item: sp,
      weight: getRaritySpeciesChance(sp.rarity),
    }));
    const found = weightedPick(weighted);
    s.speciesDiscovered.push(found.id);
    s.stats.totalSpeciesDiscovered++;

    speciesFound = {
      id: found.id,
      name: found.name,
      biome: found.biome,
      rarity: found.rarity,
      description: found.description,
      strength: found.strength,
      intelligence: found.intelligence,
      speed: found.speed,
      special: found.special,
      discovered: true,
      discoveredAt: Date.now(),
    };

    addXP(s, found.discoverXP);
  }

  // Enemy encounter check
  const enemiesEncountered: string[] = [];
  const biomeEnemies = AC_ENEMIES.filter(e => e.biome.includes(biomeId as BiomeId));
  if (biomeEnemies.length > 0 && seededRandom(Date.now() + s.tick * 19) < 0.3 + biomeDef.dangerLevel * 0.05) {
    const enemy = pickRandom(biomeEnemies);
    enemiesEncountered.push(enemy.name);
  }

  // Calculate rewards
  const baseXP = 15 + biomeDef.difficulty * 10 + workers * 2;
  const baseCoins = 5 + biomeDef.difficulty * 5;
  const xpGained = baseXP + (speciesFound ? speciesFound.rarity === 'Mythic' ? 500 : speciesFound.rarity === 'Legendary' ? 200 : speciesFound.rarity === 'Epic' ? 80 : 40 : 0);
  const coinsGained = baseCoins + (speciesFound ? speciesFound.rarity === 'Mythic' ? 100 : speciesFound.rarity === 'Legendary' ? 50 : 20 : 0);

  addXP(s, xpGained);
  s.coins += coinsGained;
  s.stats.totalCoins += coinsGained;
  s.stats.totalExpeditions++;

  const result: ExpeditionResult = {
    biome: biomeId as BiomeId,
    biomeName: biomeDef.name,
    success: true,
    foodFound,
    speciesFound,
    enemiesEncountered,
    xpGained,
    coinsGained,
    resourcesFound,
  };

  s.activeExpedition = result;
  addStatRun(s);
  return result;
}

// -----------------------------------------------------------------------------
// 11. Species
// -----------------------------------------------------------------------------

/**
 * Get all 40 ant species definitions.
 */
export function acGetSpecies(): AntSpecies[] {
  const s = ensureInit();
  return AC_SPECIES.map(sp => ({
    id: sp.id,
    name: sp.name,
    biome: sp.biome,
    rarity: sp.rarity,
    description: sp.description,
    strength: sp.strength,
    intelligence: sp.intelligence,
    speed: sp.speed,
    special: sp.special,
    discovered: s.speciesDiscovered.includes(sp.id),
    discoveredAt: s.speciesDiscovered.includes(sp.id) ? Date.now() : 0,
  }));
}

/**
 * Get species filtered by biome.
 */
export function acGetSpeciesByBiome(biomeId: string): AntSpecies[] {
  const s = ensureInit();
  return AC_SPECIES
    .filter(sp => sp.biome === biomeId)
    .map(sp => ({
      id: sp.id,
      name: sp.name,
      biome: sp.biome,
      rarity: sp.rarity,
      description: sp.description,
      strength: sp.strength,
      intelligence: sp.intelligence,
      speed: sp.speed,
      special: sp.special,
      discovered: s.speciesDiscovered.includes(sp.id),
      discoveredAt: s.speciesDiscovered.includes(sp.id) ? Date.now() : 0,
    }));
}

/**
 * Get only the species that have been discovered.
 */
export function acGetDiscoveredSpecies(): AntSpecies[] {
  const s = ensureInit();
  return AC_SPECIES
    .filter(sp => s.speciesDiscovered.includes(sp.id))
    .map(sp => ({
      id: sp.id,
      name: sp.name,
      biome: sp.biome,
      rarity: sp.rarity,
      description: sp.description,
      strength: sp.strength,
      intelligence: sp.intelligence,
      speed: sp.speed,
      special: sp.special,
      discovered: true,
      discoveredAt: Date.now(),
    }));
}

// -----------------------------------------------------------------------------
// 12. Food Storage
// -----------------------------------------------------------------------------

/**
 * Get current food storage inventory.
 */
export function acGetFoodStorage(): FoodItem[] {
  return [...ensureInit().foodStorage];
}

// -----------------------------------------------------------------------------
// 13. Resources
// -----------------------------------------------------------------------------

/**
 * Get current resource storage inventory.
 */
export function acGetResources(): ResourceItem[] {
  return [...ensureInit().resourceStorage];
}

// -----------------------------------------------------------------------------
// 14. Enemies
// -----------------------------------------------------------------------------

/**
 * Get all enemies with their defeat status.
 */
export function acGetEnemies(): Enemy[] {
  const s = ensureInit();
  return AC_ENEMIES.map(e => ({
    id: e.id,
    name: e.name,
    type: e.type,
    hp: e.hp,
    attack: e.attack,
    defense: e.defense,
    speed: e.speed,
    biome: e.biome,
    coinsReward: e.coinsReward,
    xpReward: e.xpReward,
    description: e.description,
    defeated: s.enemiesDefeated.includes(e.id),
    timesDefeated: s.enemiesDefeated.filter(id => id === e.id).length,
  }));
}

// -----------------------------------------------------------------------------
// 15. Battle
// -----------------------------------------------------------------------------

/**
 * Send soldiers to battle an enemy. Returns battle result.
 */
export function acBattleEnemy(enemyId: string): BattleResult {
  const s = ensureInit();
  const enemyDef = AC_ENEMIES.find(e => e.id === enemyId);
  if (!enemyDef) {
    return {
      victory: false,
      enemyName: 'Unknown',
      enemyHp: 0,
      playerDamage: 0,
      soldiersLost: 0,
      xpGained: 0,
      coinsGained: 0,
      loot: [],
    };
  }

  const soldiers = s.antRoles.soldier;
  const royalGuards = s.antRoles.royal_guard;
  const totalArmy = soldiers + royalGuards;

  if (totalArmy < 1) {
    return {
      victory: false,
      enemyName: enemyDef.name,
      enemyHp: enemyDef.hp,
      playerDamage: 0,
      soldiersLost: 0,
      xpGained: 0,
      coinsGained: 0,
      loot: [],
    };
  }

  // Calculate battle power
  const barracksBonus = s.rooms.find(r => r.id === 'soldier_barracks' && r.unlocked) ? 1.1 : 1.0;
  const queenBonus = 1 + AC_QUEEN_STAGES[s.queenStage].productionBonus * 0.3;
  const scoutIntelBonus = 1 + s.antRoles.scout * 0.01;
  const playerAttack = (soldiers * 5 + royalGuards * 12) * barracksBonus * queenBonus * scoutIntelBonus;
  const playerDefense = (soldiers * 3 + royalGuards * 8) * barracksBonus;
  const playerHP = totalArmy * 10;

  // Simulate rounds
  let enemyHP = enemyDef.hp;
  let playerHPLeft = playerHP;
  let rounds = 0;
  const maxRounds = 20;

  while (enemyHP > 0 && playerHPLeft > 0 && rounds < maxRounds) {
    // Player attacks
    const playerDmg = Math.max(1, playerAttack - enemyDef.defense * 0.5);
    enemyHP -= playerDmg;

    // Enemy attacks
    if (enemyHP > 0) {
      const enemyDmg = Math.max(1, enemyDef.attack - playerDefense * 0.3);
      playerHPLeft -= enemyDmg;
    }
    rounds++;
  }

  const victory = enemyHP <= 0;
  const playerDamage = playerHP - Math.max(0, playerHPLeft);
  const soldiersLost = victory
    ? Math.floor((playerDamage / playerHP) * totalArmy * 0.5)
    : Math.floor(totalArmy * 0.7);

  // Apply losses
  let lostFromSoldiers = Math.min(soldiers, soldiersLost);
  let lostFromGuards = Math.min(royalGuards, soldiersLost - lostFromSoldiers);
  s.antRoles.soldier = Math.max(0, soldiers - lostFromSoldiers);
  s.antRoles.royal_guard = Math.max(0, royalGuards - lostFromGuards);

  let xpGained = 0;
  let coinsGained = 0;
  const loot: RewardItem[] = [];

  if (victory) {
    s.enemiesDefeated.push(enemyDef.id);
    s.stats.totalEnemiesDefeated++;

    xpGained = enemyDef.xpReward;
    coinsGained = enemyDef.coinsReward;

    // Random food drop from defeated enemy
    const foodDrop = FOOD_DEFS[Math.floor(seededRandom(Date.now() + hashCode(enemyId)) * FOOD_DEFS.length)];
    const foodAmount = Math.floor(seededRandom(Date.now() + hashCode(`food_${enemyId}`)) * 3) + 1;
    const foodItem = s.foodStorage.find(f => f.type === foodDrop.type);
    if (foodItem) {
      foodItem.amount += foodAmount;
      loot.push({ type: 'food', id: foodDrop.type, name: foodDrop.name, amount: foodAmount });
    }

    // Rare resource drop
    if (seededRandom(Date.now() + hashCode(`res_${enemyId}`)) < 0.25) {
      const resDrop = RESOURCE_DEFS[Math.floor(seededRandom(Date.now() + hashCode(`rd_${enemyId}`)) * RESOURCE_DEFS.length)];
      const resAmount = Math.floor(seededRandom(Date.now() + hashCode(`ra_${enemyId}`)) * 2) + 1;
      const resItem = s.resourceStorage.find(r => r.type === resDrop.type);
      if (resItem) {
        resItem.amount += resAmount;
        loot.push({ type: 'resource', id: resDrop.type, name: resDrop.name, amount: resAmount });
      }
    }

    addXP(s, xpGained);
    s.coins += coinsGained;
    s.stats.totalCoins += coinsGained;
    s.stats.totalBattles++;
  }

  return {
    victory,
    enemyName: enemyDef.name,
    enemyHp: Math.max(0, Math.floor(enemyHP)),
    playerDamage: Math.floor(playerDamage),
    soldiersLost,
    xpGained,
    coinsGained,
    loot,
  };
}

// -----------------------------------------------------------------------------
// 16. Pheromone Trails
// -----------------------------------------------------------------------------

/**
 * Get all pheromone trails.
 */
export function acGetPheromoneTrails(): PheromoneTrail[] {
  return [...ensureInit().pheromoneTrails];
}

/**
 * Upgrade a pheromone trail by ID. Returns success and new efficiency bonus.
 */
export function acUpgradeTrail(trailId: string): { success: boolean; bonus: number } {
  const s = ensureInit();
  const trail = s.pheromoneTrails.find(t => t.id === trailId);
  if (!trail) return { success: false, bonus: 0 };
  if (trail.level >= trail.maxLevel) return { success: false, bonus: 0 };
  if (s.coins < trail.upgradeCost) return { success: false, bonus: 0 };

  s.coins -= trail.upgradeCost;
  trail.level++;
  trail.efficiency = trail.level * 1.15;
  trail.upgradeCost = Math.floor(trail.upgradeCost * 1.5);

  return { success: true, bonus: trail.efficiency };
}

// -----------------------------------------------------------------------------
// 17. Daily Expedition
// -----------------------------------------------------------------------------

/**
 * Get the current daily expedition info.
 */
export function acGetDailyExpedition(): DailyExpedition {
  const s = ensureInit();

  // Check if the daily should reset
  const today = getTodayString();
  if (s.lastDailyDate !== today) {
    // Reset daily
    s.dailyExpedition.completed = false;
    s.dailyExpedition.available = true;
  }

  return { ...s.dailyExpedition };
}

/**
 * Complete the daily expedition. Returns success and rewards.
 */
export function acCompleteDailyExpedition(): { success: boolean; rewards: RewardItem[] } {
  const s = ensureInit();
  const today = getTodayString();

  // Check if already completed today
  if (s.dailyExpedition.completed && s.lastDailyDate === today) {
    return { success: false, rewards: [] };
  }

  // If it's a new day, reset the streak logic
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (s.lastDailyDate !== yesterdayStr && s.lastDailyDate !== today) {
    // Streak broken
    s.streak = 0;
  }

  // Run the daily expedition
  const result = acGetExpedition(s.dailyExpedition.biomeId);

  // Apply daily bonus multiplier
  const bonusXP = Math.floor(result.xpGained * (s.dailyExpedition.bonusMultiplier - 1));
  const bonusCoins = Math.floor(result.coinsGained * (s.dailyExpedition.bonusMultiplier - 1));

  if (bonusXP > 0) addXP(s, bonusXP);
  if (bonusCoins > 0) {
    s.coins += bonusCoins;
    s.stats.totalCoins += bonusCoins;
  }

  // Build rewards list
  const rewards: RewardItem[] = [];
  rewards.push(...result.foodFound);
  rewards.push(...result.resourcesFound);
  if (bonusXP > 0) rewards.push({ type: 'xp', name: 'Bonus XP', amount: bonusXP });
  if (bonusCoins > 0) rewards.push({ type: 'coin', name: 'Bonus Coins', amount: bonusCoins });
  if (result.speciesFound) {
    rewards.push({
      type: 'species',
      id: result.speciesFound.id,
      name: result.speciesFound.name,
      amount: 1,
      rarity: result.speciesFound.rarity,
    });
  }

  // Update streak
  s.streak++;
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  s.dailyExpedition.completed = true;
  s.lastDailyDate = today;
  s.stats.totalDaysPlayed++;

  return { success: true, rewards };
}

// -----------------------------------------------------------------------------
// 18. Streak
// -----------------------------------------------------------------------------

/**
 * Get current daily streak.
 */
export function acGetStreak(): number {
  const s = ensureInit();
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  if (s.lastDailyDate !== today && s.lastDailyDate !== yesterdayStr) {
    return 0; // Streak expired
  }
  return s.streak;
}

/**
 * Get best streak ever achieved.
 */
export function acGetBestStreak(): number {
  return ensureInit().bestStreak;
}

// -----------------------------------------------------------------------------
// 19. Coins
// -----------------------------------------------------------------------------

/**
 * Get current coin balance.
 */
export function acGetCoins(): number {
  return ensureInit().coins;
}

/**
 * Spend coins. Returns success and remaining balance.
 */
export function acSpendCoins(amount: number): { success: boolean; remaining: number } {
  const s = ensureInit();
  if (amount <= 0 || s.coins < amount) return { success: false, remaining: s.coins };
  s.coins -= amount;
  return { success: true, remaining: s.coins };
}

// -----------------------------------------------------------------------------
// 20. Stats
// -----------------------------------------------------------------------------

/**
 * Get comprehensive colony statistics.
 */
export function acGetStats(): ColonyStats {
  return { ...ensureInit().stats };
}

// -----------------------------------------------------------------------------
// 21. Achievements
// -----------------------------------------------------------------------------

/**
 * Get all achievements with their unlock status.
 */
export function acGetAchievements(): Achievement[] {
  return [...ensureInit().achievements];
}

/**
 * Check and unlock any achievements whose conditions are now met.
 */
export function acCheckAchievements(): Achievement[] {
  const s = ensureInit();
  const newlyUnlocked: Achievement[] = [];

  const speciesCount = s.speciesDiscovered.length;
  const rareSpecies = AC_SPECIES.filter(sp => s.speciesDiscovered.includes(sp.id) && ['Rare', 'Epic', 'Legendary', 'Mythic'].includes(sp.rarity)).length;
  const mythicSpecies = AC_SPECIES.filter(sp => s.speciesDiscovered.includes(sp.id) && sp.rarity === 'Mythic').length;
  const uniqueEnemiesDefeated = new Set(s.enemiesDefeated).size;
  const unlockedRooms = s.rooms.filter(r => r.unlocked).length;
  const tunnelsDug = s.tunnelGrid.flat().filter(c => c.dug).length;

  for (const ach of s.achievements) {
    if (ach.unlocked) continue;

    let shouldUnlock = false;
    switch (ach.id) {
      case 'ach_first_exp': shouldUnlock = s.stats.totalExpeditions >= 1; break;
      case 'ach_level_10': shouldUnlock = s.level >= 10; break;
      case 'ach_level_25': shouldUnlock = s.level >= 25; break;
      case 'ach_level_50': shouldUnlock = s.level >= 50; break;
      case 'ach_5_species': shouldUnlock = speciesCount >= 5; break;
      case 'ach_20_species': shouldUnlock = speciesCount >= 20; break;
      case 'ach_40_species': shouldUnlock = speciesCount >= 40; break;
      case 'ach_rare_find': shouldUnlock = rareSpecies >= 1; break;
      case 'ach_mythic_find': shouldUnlock = mythicSpecies >= 1; break;
      case 'ach_streak_7': shouldUnlock = s.streak >= 7; break;
      case 'ach_streak_30': shouldUnlock = s.streak >= 30; break;
      case 'ach_10_enemies': shouldUnlock = uniqueEnemiesDefeated >= 10; break;
      case 'ach_all_rooms': shouldUnlock = unlockedRooms >= 6; break;
      case 'ach_empress': shouldUnlock = s.queenStage >= 4; break;
      case 'ach_tunnel_master': shouldUnlock = tunnelsDug >= 30; break;
    }

    if (shouldUnlock) {
      ach.unlocked = true;
      ach.unlockedAt = Date.now();
      if (!s.unlockedAchievements.includes(ach.id)) {
        s.unlockedAchievements.push(ach.id);
      }
      s.coins += ach.reward.coins;
      s.stats.totalCoins += ach.reward.coins;
      addXP(s, ach.reward.xp);
      newlyUnlocked.push(ach);
    }
  }

  return newlyUnlocked;
}

/**
 * Get all unlocked achievements.
 */
export function acGetUnlockedAchievements(): Achievement[] {
  const s = ensureInit();
  return s.achievements.filter(a => a.unlocked);
}

/**
 * Check if a specific achievement is unlocked.
 */
export function acIsAchievementUnlocked(id: string): boolean {
  const s = ensureInit();
  return s.achievements.some(a => a.id === id && a.unlocked);
}

// -----------------------------------------------------------------------------
// 22. Hints
// -----------------------------------------------------------------------------

/**
 * Get a contextual gameplay hint.
 */
export function acGetHint(): string {
  const s = ensureInit();
  const idx = Math.floor(seededRandom(Date.now() + s.tick * 3) * HINTS.length);
  return HINTS[idx];
}

// =============================================================================
// END OF FILE
// =============================================================================
