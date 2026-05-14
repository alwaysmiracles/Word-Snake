// ============================================================================
// Fantasy Castle Wire — Castle Management RPG
// ============================================================================
// SSR-safe: no localStorage, no window/document, no setInterval.
// All exported functions use `fc` prefix, all constants use `FC_` prefix.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RarityTier = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";

export interface RoomDef {
  id: string;
  name: string;
  description: string;
  baseCost: Record<string, number>;
  maxLevel: number;
  perLevelBonus: string;
}

export interface ResourceDef {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface UnitDef {
  id: string;
  name: string;
  category: string;
  rarity: RarityTier;
  attack: number;
  defense: number;
  hp: number;
  cost: Record<string, number>;
  description: string;
}

export interface SpellDef {
  id: string;
  name: string;
  school: string;
  manaCost: number;
  power: number;
  description: string;
  rarity: RarityTier;
  unlockLevel: number;
}

export interface EnemyDef {
  id: string;
  name: string;
  type: string;
  attack: number;
  defense: number;
  hp: number;
  reward: Record<string, number>;
  xpReward: number;
  minLevel: number;
  description: string;
}

export interface QuestDef {
  id: string;
  name: string;
  description: string;
  objectives: string[];
  xpReward: number;
  coinReward: number;
  resourceReward: Record<string, number>;
  requiredLevel: number;
}

export interface AdvisorDef {
  id: string;
  name: string;
  title: string;
  bonusType: string;
  bonusValue: number;
  cost: number;
  description: string;
}

export interface AllianceDef {
  id: string;
  name: string;
  description: string;
  bonusType: string;
  bonusValue: number;
  upkeepCost: Record<string, number>;
  moraleEffect: number;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  condition: string;
  reward: number;
}

export interface EventDef {
  id: string;
  name: string;
  description: string;
  duration: number;
  effectType: string;
  effectValue: number;
  probability: number;
}

export interface RoomState {
  level: number;
}

export interface UnitInstance {
  defId: string;
  count: number;
}

export interface SpellState {
  defId: string;
  learned: boolean;
  castCount: number;
}

export interface QuestState {
  defId: string;
  started: boolean;
  completed: boolean;
  progress: number;
}

export interface AdvisorState {
  defId: string;
  hired: boolean;
}

export interface AllianceState {
  defId: string;
  formed: boolean;
  strength: number;
}

export interface DailyQuestData {
  questId: string;
  progress: number;
  target: number;
  completed: boolean;
  resetTimestamp: number;
}

export interface Stats {
  totalBattlesWon: number;
  totalBattlesLost: number;
  totalSpellsCast: number;
  totalResourcesGathered: number;
  totalUnitsRecruited: number;
  totalQuestsCompleted: number;
  totalGoldEarned: number;
  totalManaSpent: number;
  totalDaysPlayed: number;
  highestEnemyDefeated: number;
}

export interface RunHistory {
  id: string;
  timestamp: number;
  level: number;
  gold: number;
  battlesWon: number;
  duration: number;
}

export interface FantasyCastleState {
  level: number;
  xp: number;
  coins: number;
  kingdomName: string;
  kingdomTier: number;
  rooms: Record<string, RoomState>;
  resources: Record<string, number>;
  units: Record<string, UnitInstance>;
  spells: Record<string, SpellState>;
  enemiesDefeated: Record<string, number>;
  quests: Record<string, QuestState>;
  advisors: Record<string, AdvisorState>;
  alliances: Record<string, AllianceState>;
  wallHP: number;
  maxWallHP: number;
  towerLevel: number;
  moatLevel: number;
  dailyQuest: DailyQuestData | null;
  streak: number;
  bestStreak: number;
  achievements: Record<string, boolean>;
  stats: Stats;
  runHistory: RunHistory[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const FC_ROOMS: RoomDef[] = [
  {
    id: "throne_room",
    name: "Throne Room",
    description: "The seat of royal power. Upgrading increases XP gain from all activities.",
    baseCost: { gold: 200, stone: 100 },
    maxLevel: 50,
    perLevelBonus: "+5% XP gain",
  },
  {
    id: "grand_library",
    name: "Grand Library",
    description: "A vast repository of arcane knowledge. Boosts spell learning speed.",
    baseCost: { gold: 150, mana: 80 },
    maxLevel: 50,
    perLevelBonus: "+3% spell power",
  },
  {
    id: "alchemist_tower",
    name: "Alchemist Tower",
    description: "Where skilled alchemists transmute base materials into rare substances.",
    baseCost: { gold: 180, mana: 60, stone: 40 },
    maxLevel: 50,
    perLevelBonus: "+4% resource generation",
  },
  {
    id: "knights_hall",
    name: "Knight's Hall",
    description: "Training ground for the kingdom's finest warriors.",
    baseCost: { gold: 200, iron: 80 },
    maxLevel: 50,
    perLevelBonus: "+5% unit attack",
  },
  {
    id: "royal_garden",
    name: "Royal Garden",
    description: "Lush gardens that provide food and herbs for the kingdom.",
    baseCost: { gold: 100, stone: 60 },
    maxLevel: 50,
    perLevelBonus: "+6% food production",
  },
  {
    id: "dungeon",
    name: "Dungeon",
    description: "Deep prison for captured enemies. Generates intel and rewards.",
    baseCost: { gold: 250, stone: 150, iron: 50 },
    maxLevel: 50,
    perLevelBonus: "+3% enemy loot",
  },
  {
    id: "treasury",
    name: "Treasury",
    description: "Fortified vault for the kingdom's wealth. Protects from raids.",
    baseCost: { gold: 300, stone: 200, gems: 10 },
    maxLevel: 50,
    perLevelBonus: "+5% gold protection",
  },
  {
    id: "wizards_sanctum",
    name: "Wizard's Sanctum",
    description: "A mystical chamber where mages channel powerful arcane forces.",
    baseCost: { gold: 200, mana: 150, gems: 20 },
    maxLevel: 50,
    perLevelBonus: "+4% mana regeneration",
  },
];

export const FC_RESOURCES: ResourceDef[] = [
  { id: "gold", name: "Gold", description: "The universal currency of the realm.", icon: "🪙" },
  { id: "mana", name: "Mana", description: "Arcane energy used for spells and enchantments.", icon: "🔮" },
  { id: "stone", name: "Stone", description: "Building material for castle construction.", icon: "🪨" },
  { id: "food", name: "Food", description: "Sustains the army and population.", icon: "🍞" },
  { id: "iron", name: "Iron", description: "Forged into weapons and armor.", icon: "⚒️" },
  { id: "gems", name: "Gems", description: "Rare crystals with magical properties.", icon: "💎" },
];

export const FC_SPELL_SCHOOLS = [
  { id: "fire", name: "Fire", description: "Destructive flames that engulf enemies.", color: "#FF4500" },
  { id: "ice", name: "Ice", description: "Frost that freezes and slows foes.", color: "#00BFFF" },
  { id: "lightning", name: "Lightning", description: "Electrical bolts of devastating power.", color: "#FFD700" },
  { id: "nature", name: "Nature", description: "Healing and growth magic from the earth.", color: "#32CD32" },
  { id: "shadow", name: "Shadow", description: "Dark arts that corrupt and weaken.", color: "#8B008B" },
  { id: "holy", name: "Holy", description: "Divine light that purifies and protects.", color: "#FFFACD" },
];

export const FC_UNIT_CATEGORIES = [
  { id: "guards", name: "Guards", description: "Defenders of the castle walls." },
  { id: "mages", name: "Mages", description: "Wielders of arcane power." },
  { id: "workers", name: "Workers", description: "Builders and gatherers of resources." },
  { id: "siege", name: "Siege Engines", description: "Massive war machines for assaults." },
  { id: "diplomats", name: "Diplomats", description: "Negotiators and alliance builders." },
  { id: "heroes", name: "Heroes", description: "Legendary champions of renown." },
];

export const FC_UNITS: UnitDef[] = [
  // Guards (7)
  { id: "militia", name: "Militia", category: "guards", rarity: "Common", attack: 3, defense: 2, hp: 15, cost: { gold: 20, food: 10 }, description: "Basic citizen soldiers with simple weapons." },
  { id: "footman", name: "Footman", category: "guards", rarity: "Common", attack: 5, defense: 4, hp: 25, cost: { gold: 40, food: 15 }, description: "Trained infantry with shields." },
  { id: "spearman", name: "Spearman", category: "guards", rarity: "Uncommon", attack: 7, defense: 5, hp: 30, cost: { gold: 60, iron: 10, food: 20 }, description: "Polearm specialists effective vs cavalry." },
  { id: "shieldbearer", name: "Shieldbearer", category: "guards", rarity: "Uncommon", attack: 4, defense: 10, hp: 40, cost: { gold: 70, iron: 15 }, description: "Heavily armored defenders." },
  { id: "knight", name: "Knight", category: "guards", rarity: "Rare", attack: 12, defense: 10, hp: 60, cost: { gold: 150, iron: 40, food: 30 }, description: "Elite mounted warriors." },
  { id: "paladin", name: "Paladin", category: "guards", rarity: "Epic", attack: 15, defense: 14, hp: 80, cost: { gold: 300, iron: 60, gems: 5, food: 50 }, description: "Holy warriors imbued with divine power." },
  { id: "guardian_titan", name: "Guardian Titan", category: "guards", rarity: "Legendary", attack: 20, defense: 22, hp: 150, cost: { gold: 800, iron: 100, gems: 20, mana: 200 }, description: "Ancient constructs of immense power." },
  // Mages (7)
  { id: "apprentice", name: "Apprentice", category: "mages", rarity: "Common", attack: 5, defense: 1, hp: 12, cost: { gold: 30, mana: 20 }, description: "Novice spellcaster learning the basics." },
  { id: "fire_mage", name: "Fire Mage", category: "mages", rarity: "Common", attack: 10, defense: 2, hp: 18, cost: { gold: 60, mana: 40 }, description: "Specializes in fire magic." },
  { id: "frost_mage", name: "Frost Mage", category: "mages", rarity: "Uncommon", attack: 9, defense: 4, hp: 20, cost: { gold: 70, mana: 50 }, description: "Controls ice and cold." },
  { id: "storm_caster", name: "Storm Caster", category: "mages", rarity: "Uncommon", attack: 13, defense: 3, hp: 22, cost: { gold: 100, mana: 60 }, description: "Channels lightning and wind." },
  { id: "arcane_scholar", name: "Arcane Scholar", category: "mages", rarity: "Rare", attack: 18, defense: 6, hp: 35, cost: { gold: 200, mana: 100, gems: 3 }, description: "Master of pure arcane energy." },
  { id: "shadow_weaver", name: "Shadow Weaver", category: "mages", rarity: "Epic", attack: 24, defense: 5, hp: 40, cost: { gold: 400, mana: 150, gems: 8 }, description: "Wields forbidden shadow magic." },
  { id: "archmage", name: "Archmage", category: "mages", rarity: "Legendary", attack: 35, defense: 10, hp: 60, cost: { gold: 1000, mana: 300, gems: 25 }, description: "Supreme wizard of unrivaled power." },
  // Workers (7)
  { id: "peasant", name: "Peasant", category: "workers", rarity: "Common", attack: 1, defense: 1, hp: 10, cost: { gold: 10, food: 5 }, description: "Simple laborer for basic tasks." },
  { id: "miner", name: "Miner", category: "workers", rarity: "Common", attack: 2, defense: 2, hp: 15, cost: { gold: 25, food: 10 }, description: "Extracts stone and ore from the earth." },
  { id: "lumberjack", name: "Lumberjack", category: "workers", rarity: "Common", attack: 3, defense: 2, hp: 15, cost: { gold: 20, food: 10 }, description: "Harvests timber for construction." },
  { id: "blacksmith", name: "Blacksmith", category: "workers", rarity: "Uncommon", attack: 4, defense: 3, hp: 20, cost: { gold: 50, iron: 20, food: 15 }, description: "Forges weapons and tools." },
  { id: "alchemist_worker", name: "Alchemist", category: "workers", rarity: "Rare", attack: 3, defense: 3, hp: 25, cost: { gold: 120, mana: 50 }, description: "Creates potions and transmutes materials." },
  { id: "master_builder", name: "Master Builder", category: "workers", rarity: "Epic", attack: 2, defense: 8, hp: 30, cost: { gold: 300, stone: 100, iron: 50 }, description: "Constructs grand fortifications." },
  { id: "artifact_forger", name: "Artifact Forger", category: "workers", rarity: "Legendary", attack: 5, defense: 15, hp: 50, cost: { gold: 700, iron: 80, gems: 15, mana: 150 }, description: "Creates legendary magical items." },
  // Siege Engines (6)
  { id: "battering_ram", name: "Battering Ram", category: "siege", rarity: "Common", attack: 15, defense: 0, hp: 30, cost: { gold: 80, iron: 30, wood: 40 }, description: "Smashes through fortified gates." },
  { id: "catapult", name: "Catapult", category: "siege", rarity: "Uncommon", attack: 25, defense: 2, hp: 25, cost: { gold: 150, iron: 50, stone: 30 }, description: "Hurls boulders from great distance." },
  { id: "ballista", name: "Ballista", category: "siege", rarity: "Uncommon", attack: 20, defense: 3, hp: 35, cost: { gold: 120, iron: 60 }, description: "Giant crossbow firing heavy bolts." },
  { id: "trebuchet", name: "Trebuchet", category: "siege", rarity: "Rare", attack: 40, defense: 3, hp: 40, cost: { gold: 300, iron: 80, stone: 60 }, description: "Devastating long-range siege weapon." },
  { id: "cannon", name: "Cannon", category: "siege", rarity: "Epic", attack: 55, defense: 5, hp: 50, cost: { gold: 700, iron: 120, stone: 200 }, description: "Powerful gunpowder weapon." },
  { id: "war_golem", name: "War Golem", category: "siege", rarity: "Legendary", attack: 70, defense: 30, hp: 200, cost: { gold: 900, iron: 150, gems: 20, mana: 200 }, description: "Massive animated construct of war." },
  // Diplomats (6)
  { id: "envoy", name: "Envoy", category: "diplomats", rarity: "Common", attack: 0, defense: 2, hp: 15, cost: { gold: 30, food: 15 }, description: "Basic messenger and negotiator." },
  { id: "ambassador", name: "Ambassador", category: "diplomats", rarity: "Uncommon", attack: 0, defense: 3, hp: 20, cost: { gold: 80, food: 20 }, description: "Skilled representative to foreign courts." },
  { id: "emissary", name: "Emissary", category: "diplomats", rarity: "Rare", attack: 1, defense: 5, hp: 25, cost: { gold: 150, gems: 3 }, description: "Senior diplomat with trade expertise." },
  { id: "royal_orator", name: "Royal Orator", category: "diplomats", rarity: "Rare", attack: 0, defense: 4, hp: 20, cost: { gold: 180, gems: 5 }, description: "Inspires loyalty and boosts morale." },
  { id: "spymaster", name: "Spymaster", category: "diplomats", rarity: "Epic", attack: 5, defense: 3, hp: 30, cost: { gold: 350, gems: 10 }, description: "Master of espionage and intelligence." },
  { id: "grand_chancellor", name: "Grand Chancellor", category: "diplomats", rarity: "Legendary", attack: 2, defense: 10, hp: 50, cost: { gold: 800, gems: 20, mana: 100 }, description: "Ultimate diplomat with legendary influence." },
  // Heroes (7)
  { id: "squire", name: "Squire", category: "heroes", rarity: "Common", attack: 6, defense: 4, hp: 30, cost: { gold: 50, food: 20 }, description: "Young aspiring hero seeking glory." },
  { id: "ranger", name: "Ranger", category: "heroes", rarity: "Uncommon", attack: 10, defense: 5, hp: 35, cost: { gold: 100, food: 30, iron: 10 }, description: "Wilderness expert and tracker." },
  { id: "berserker", name: "Berserker", category: "heroes", rarity: "Uncommon", attack: 16, defense: 3, hp: 40, cost: { gold: 130, food: 40, iron: 15 }, description: "Fearsome warrior who fights with reckless fury." },
  { id: "warlock", name: "Warlock", category: "heroes", rarity: "Rare", attack: 20, defense: 6, hp: 45, cost: { gold: 250, mana: 80, gems: 3 }, description: "Dark magic user with forbidden powers." },
  { id: "dragon_rider", name: "Dragon Rider", category: "heroes", rarity: "Epic", attack: 30, defense: 12, hp: 70, cost: { gold: 500, mana: 150, gems: 12 }, description: "Soars into battle atop a mighty drake." },
  { id: "phoenix_knight", name: "Phoenix Knight", category: "heroes", rarity: "Epic", attack: 28, defense: 15, hp: 65, cost: { gold: 450, mana: 120, gems: 10 }, description: "Reborn in flames, stronger than before." },
  { id: "immortal_sovereign", name: "Immortal Sovereign", category: "heroes", rarity: "Legendary", attack: 40, defense: 20, hp: 120, cost: { gold: 1200, mana: 300, gems: 30, iron: 100 }, description: "An eternal ruler of unmatched power." },
];

export const FC_SPELLS: SpellDef[] = [
  // Fire (7)
  { id: "spark", name: "Spark", school: "fire", manaCost: 5, power: 8, description: "A small burst of flame.", rarity: "Common", unlockLevel: 1 },
  { id: "fireball", name: "Fireball", school: "fire", manaCost: 15, power: 25, description: "Classic explosive fire projectile.", rarity: "Common", unlockLevel: 3 },
  { id: "flame_wall", name: "Flame Wall", school: "fire", manaCost: 25, power: 35, description: "Creates a barrier of fire.", rarity: "Uncommon", unlockLevel: 8 },
  { id: "inferno", name: "Inferno", school: "fire", manaCost: 40, power: 55, description: "Engulfs an area in raging fire.", rarity: "Rare", unlockLevel: 15 },
  { id: "meteor_strike", name: "Meteor Strike", school: "fire", manaCost: 60, power: 80, description: "Calls down a burning meteor.", rarity: "Epic", unlockLevel: 25 },
  { id: "phoenix_blaze", name: "Phoenix Blaze", school: "fire", manaCost: 80, power: 100, description: "Legendary flames of rebirth.", rarity: "Epic", unlockLevel: 35 },
  { id: "armageddon", name: "Armageddon", school: "fire", manaCost: 120, power: 150, description: "Ultimate destruction by fire.", rarity: "Legendary", unlockLevel: 45 },
  // Ice (7)
  { id: "frost_touch", name: "Frost Touch", school: "ice", manaCost: 5, power: 7, description: "Chills a single target.", rarity: "Common", unlockLevel: 1 },
  { id: "ice_shard", name: "Ice Shard", school: "ice", manaCost: 12, power: 20, description: "Launches sharp ice crystals.", rarity: "Common", unlockLevel: 4 },
  { id: "blizzard", name: "Blizzard", school: "ice", manaCost: 30, power: 40, description: "A howling storm of ice and snow.", rarity: "Uncommon", unlockLevel: 10 },
  { id: "glacier_prison", name: "Glacier Prison", school: "ice", manaCost: 45, power: 55, description: "Encases enemies in solid ice.", rarity: "Rare", unlockLevel: 18 },
  { id: "absolute_zero", name: "Absolute Zero", school: "ice", manaCost: 65, power: 85, description: "Freezes everything in the vicinity.", rarity: "Epic", unlockLevel: 28 },
  { id: "ice_age", name: "Ice Age", school: "ice", manaCost: 90, power: 110, description: "Plunges the battlefield into deep freeze.", rarity: "Epic", unlockLevel: 38 },
  { id: "frozen_eternity", name: "Frozen Eternity", school: "ice", manaCost: 130, power: 160, description: "Time itself stops in ice.", rarity: "Legendary", unlockLevel: 48 },
  // Lightning (6)
  { id: "static_shock", name: "Static Shock", school: "lightning", manaCost: 6, power: 9, description: "A quick jolt of electricity.", rarity: "Common", unlockLevel: 2 },
  { id: "lightning_bolt", name: "Lightning Bolt", school: "lightning", manaCost: 18, power: 28, description: "A focused bolt of lightning.", rarity: "Common", unlockLevel: 5 },
  { id: "chain_lightning", name: "Chain Lightning", school: "lightning", manaCost: 35, power: 45, description: "Arcs between multiple targets.", rarity: "Uncommon", unlockLevel: 12 },
  { id: "thunderstorm", name: "Thunderstorm", school: "lightning", manaCost: 50, power: 65, description: "A devastating electrical storm.", rarity: "Rare", unlockLevel: 20 },
  { id: "tempest_wrath", name: "Tempest Wrath", school: "lightning", manaCost: 75, power: 95, description: "Channels the fury of the storm.", rarity: "Epic", unlockLevel: 32 },
  { id: "zeus_fury", name: "Zeus's Fury", school: "lightning", manaCost: 110, power: 140, description: "Divine thunder of the gods.", rarity: "Legendary", unlockLevel: 44 },
  // Nature (7)
  { id: "seedling", name: "Seedling", school: "nature", manaCost: 4, power: 5, description: "Grows a small healing plant.", rarity: "Common", unlockLevel: 1 },
  { id: "vine_lash", name: "Vine Lash", school: "nature", manaCost: 10, power: 15, description: "Whipping vines attack enemies.", rarity: "Common", unlockLevel: 3 },
  { id: "thorn_wall", name: "Thorn Wall", school: "nature", manaCost: 20, power: 25, description: "A barrier of razor-sharp thorns.", rarity: "Uncommon", unlockLevel: 9 },
  { id: "earthquake", name: "Earthquake", school: "nature", manaCost: 38, power: 50, description: "Shakes the ground violently.", rarity: "Rare", unlockLevel: 16 },
  { id: "nature_wrath", name: "Nature's Wrath", school: "nature", manaCost: 55, power: 75, description: "The land itself attacks foes.", rarity: "Epic", unlockLevel: 27 },
  { id: "world_tree", name: "World Tree", school: "nature", manaCost: 70, power: 90, description: "Channels the ancient forest's power.", rarity: "Epic", unlockLevel: 37 },
  { id: "genesis", name: "Genesis", school: "nature", manaCost: 100, power: 130, description: "Creates life from nothingness.", rarity: "Legendary", unlockLevel: 46 },
  // Shadow (6)
  { id: "darkness", name: "Darkness", school: "shadow", manaCost: 5, power: 6, description: "Plunges an area into shadow.", rarity: "Common", unlockLevel: 2 },
  { id: "shadow_bolt", name: "Shadow Bolt", school: "shadow", manaCost: 14, power: 22, description: "A bolt of pure dark energy.", rarity: "Common", unlockLevel: 6 },
  { id: "void_tentacle", name: "Void Tentacle", school: "shadow", manaCost: 28, power: 38, description: "Summons tendrils from the void.", rarity: "Uncommon", unlockLevel: 11 },
  { id: "soul_drain", name: "Soul Drain", school: "shadow", manaCost: 42, power: 55, description: "Steals life force from enemies.", rarity: "Rare", unlockLevel: 19 },
  { id: "abyssal_rift", name: "Abyssal Rift", school: "shadow", manaCost: 70, power: 90, description: "Opens a gateway to the abyss.", rarity: "Epic", unlockLevel: 30 },
  { id: "annihilation", name: "Annihilation", school: "shadow", manaCost: 125, power: 155, description: "Erases existence with void energy.", rarity: "Legendary", unlockLevel: 47 },
  // Holy (7)
  { id: "holy_light", name: "Holy Light", school: "holy", manaCost: 5, power: 6, description: "A beam of purifying light.", rarity: "Common", unlockLevel: 1 },
  { id: "smite", name: "Smite", school: "holy", manaCost: 13, power: 22, description: "Divine punishment from above.", rarity: "Common", unlockLevel: 4 },
  { id: "shield_of_faith", name: "Shield of Faith", school: "holy", manaCost: 20, power: 18, description: "Divine barrier protecting allies.", rarity: "Uncommon", unlockLevel: 7 },
  { id: "divine_judgment", name: "Divine Judgment", school: "holy", manaCost: 35, power: 50, description: "The gods pass judgment.", rarity: "Rare", unlockLevel: 14 },
  { id: "resurrection", name: "Resurrection", school: "holy", manaCost: 60, power: 70, description: "Revives fallen units to fight again.", rarity: "Epic", unlockLevel: 24 },
  { id: "seraphim_call", name: "Seraphim Call", school: "holy", manaCost: 85, power: 105, description: "Summons celestial warriors.", rarity: "Epic", unlockLevel: 36 },
  { id: "divine_ascension", name: "Divine Ascension", school: "holy", manaCost: 115, power: 145, description: "Transcends to god-like power.", rarity: "Legendary", unlockLevel: 49 },
];

export const FC_ENEMIES: EnemyDef[] = [
  // Dragons (5)
  { id: "whelp", name: "Dragon Whelp", type: "Dragon", attack: 10, defense: 5, hp: 40, reward: { gold: 30, gems: 1 }, xpReward: 15, minLevel: 1, description: "A young dragon just learning to breathe fire." },
  { id: "drake", name: "Fire Drake", type: "Dragon", attack: 25, defense: 15, hp: 80, reward: { gold: 80, iron: 10 }, xpReward: 40, minLevel: 5, description: "A fierce drake with scorching breath." },
  { id: "wyrm", name: "Earth Wyrm", type: "Dragon", attack: 35, defense: 25, hp: 150, reward: { gold: 150, stone: 30, gems: 3 }, xpReward: 80, minLevel: 12, description: "Ancient earth-dwelling dragon." },
  { id: "frost_dragon", name: "Frost Dragon", type: "Dragon", attack: 50, defense: 35, hp: 250, reward: { gold: 300, gems: 8, mana: 50 }, xpReward: 150, minLevel: 22, description: "A majestic dragon of ice and cold." },
  { id: "elder_dragon", name: "Elder Dragon", type: "Dragon", attack: 80, defense: 50, hp: 500, reward: { gold: 800, gems: 20, mana: 100 }, xpReward: 400, minLevel: 35, description: "The most ancient and powerful of all dragons." },
  // Undead (5)
  { id: "skeleton", name: "Skeleton Warrior", type: "Undead", attack: 5, defense: 3, hp: 20, reward: { gold: 10 }, xpReward: 8, minLevel: 1, description: "A mindless animated skeleton." },
  { id: "zombie", name: "Shambling Zombie", type: "Undead", attack: 4, defense: 6, hp: 35, reward: { gold: 12 }, xpReward: 10, minLevel: 2, description: "Slow but difficult to put down." },
  { id: "wraith", name: "Spectral Wraith", type: "Undead", attack: 18, defense: 5, hp: 45, reward: { gold: 40, mana: 15 }, xpReward: 30, minLevel: 7, description: "A ghostly being of pure malice." },
  { id: "death_knight", name: "Death Knight", type: "Undead", attack: 40, defense: 30, hp: 180, reward: { gold: 120, iron: 20, gems: 3 }, xpReward: 100, minLevel: 18, description: "A fallen champion raised by necromancy." },
  { id: "lich_king", name: "Lich King", type: "Undead", attack: 65, defense: 40, hp: 350, reward: { gold: 500, mana: 80, gems: 10 }, xpReward: 300, minLevel: 30, description: "An immortal undead sorcerer of terrible power." },
  // Demons (5)
  { id: "imp", name: "Lesser Imp", type: "Demon", attack: 8, defense: 2, hp: 18, reward: { gold: 15, mana: 5 }, xpReward: 10, minLevel: 1, description: "A tiny mischievous demon." },
  { id: "succubus", name: "Succubus", type: "Demon", attack: 22, defense: 10, hp: 60, reward: { gold: 60, mana: 20 }, xpReward: 35, minLevel: 8, description: "A charm-weaving demon of temptation." },
  { id: "hellhound", name: "Hellhound", type: "Demon", attack: 30, defense: 15, hp: 90, reward: { gold: 80, iron: 15 }, xpReward: 55, minLevel: 13, description: "A demonic beast of fire and fang." },
  { id: "pit_fiend", name: "Pit Fiend", type: "Demon", attack: 55, defense: 35, hp: 220, reward: { gold: 250, gems: 8, mana: 40 }, xpReward: 180, minLevel: 25, description: "A towering demon lord of the abyss." },
  { id: "arch_demon", name: "Arch Demon", type: "Demon", attack: 75, defense: 45, hp: 400, reward: { gold: 600, gems: 15, mana: 80 }, xpReward: 350, minLevel: 38, description: "Supreme commander of the demonic legions." },
  // Goblins (5)
  { id: "goblin_scout", name: "Goblin Scout", type: "Goblin", attack: 3, defense: 2, hp: 12, reward: { gold: 8, food: 5 }, xpReward: 5, minLevel: 1, description: "A quick and sneaky little green pest." },
  { id: "goblin_raider", name: "Goblin Raider", type: "Goblin", attack: 8, defense: 5, hp: 25, reward: { gold: 20, iron: 5 }, xpReward: 15, minLevel: 3, description: "A goblin with rusty weapons and bold ambition." },
  { id: "goblin_shaman", name: "Goblin Shaman", type: "Goblin", attack: 15, defense: 8, hp: 35, reward: { gold: 35, mana: 15 }, xpReward: 25, minLevel: 6, description: "A goblin who dabbles in crude magic." },
  { id: "hobgoblin_chief", name: "Hobgoblin Chief", type: "Goblin", attack: 25, defense: 18, hp: 70, reward: { gold: 70, iron: 15, food: 20 }, xpReward: 50, minLevel: 10, description: "Leader of a large goblin warband." },
  { id: "goblin_warlord", name: "Goblin Warlord", type: "Goblin", attack: 45, defense: 30, hp: 160, reward: { gold: 200, iron: 30, gems: 5 }, xpReward: 120, minLevel: 20, description: "A massive goblin who commands armies." },
  // Dark Elves (5)
  { id: "dark_elf_scout", name: "Dark Elf Scout", type: "Dark Elf", attack: 10, defense: 6, hp: 22, reward: { gold: 25, mana: 8 }, xpReward: 15, minLevel: 3, description: "Stealthy dark elf sent to spy on your kingdom." },
  { id: "dark_elf_archer", name: "Dark Elf Archer", type: "Dark Elf", attack: 18, defense: 8, hp: 35, reward: { gold: 45, iron: 10 }, xpReward: 30, minLevel: 8, description: "Deadly marksman of the dark elven realm." },
  { id: "dark_elf_mage", name: "Dark Elf Mage", type: "Dark Elf", attack: 25, defense: 12, hp: 45, reward: { gold: 65, mana: 30 }, xpReward: 45, minLevel: 13, description: "A practitioner of dark elven sorcery." },
  { id: "dark_elf_noble", name: "Dark Elf Noble", type: "Dark Elf", attack: 40, defense: 25, hp: 120, reward: { gold: 150, gems: 6, mana: 40 }, xpReward: 100, minLevel: 22, description: "A cunning aristocrat of the dark elf court." },
  { id: "dark_elf_matron", name: "Dark Elf Matron", type: "Dark Elf", attack: 60, defense: 35, hp: 280, reward: { gold: 400, gems: 12, mana: 60 }, xpReward: 250, minLevel: 33, description: "Supreme ruler of the dark elven civilization." },
  // Misc (5)
  { id: "troll", name: "Mountain Troll", type: "Beast", attack: 20, defense: 15, hp: 100, reward: { gold: 50, stone: 20, food: 15 }, xpReward: 40, minLevel: 6, description: "A huge regenerating troll from the mountains." },
  { id: "basilisk", name: "Basilisk", type: "Beast", attack: 30, defense: 20, hp: 80, reward: { gold: 80, gems: 3 }, xpReward: 55, minLevel: 10, description: "A serpentine creature with a petrifying gaze." },
  { id: "giant_spider", name: "Giant Spider", type: "Beast", attack: 22, defense: 12, hp: 65, reward: { gold: 40, food: 10 }, xpReward: 35, minLevel: 4, description: "A massive spider lurking in dark caves." },
  { id: "minotaur", name: "Minotaur", type: "Beast", attack: 35, defense: 20, hp: 130, reward: { gold: 100, iron: 15, food: 25 }, xpReward: 70, minLevel: 15, description: "A bull-headed brute from the labyrinth." },
  { id: "kraken", name: "Kraken", type: "Beast", attack: 70, defense: 40, hp: 450, reward: { gold: 700, gems: 18, mana: 60 }, xpReward: 380, minLevel: 40, description: "A legendary sea monster of immense power." },
];

export const FC_ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_blood", name: "First Blood", description: "Win your first battle.", condition: "totalBattlesWon >= 1", reward: 50 },
  { id: "dragon_slayer", name: "Dragon Slayer", description: "Defeat an Elder Dragon.", condition: "enemiesDefeated.elder_dragon >= 1", reward: 500 },
  { id: "master_builder", name: "Master Builder", description: "Upgrade all rooms to level 10.", condition: "allRoomsLevel10", reward: 300 },
  { id: "archmage_title", name: "Archmage", description: "Learn 30 different spells.", condition: "spellsLearned >= 30", reward: 400 },
  { id: "wealthy_king", name: "Wealthy King", description: "Accumulate 10,000 gold.", condition: "resources.gold >= 10000", reward: 200 },
  { id: "conqueror", name: "Conqueror", description: "Reach castle level 25.", condition: "level >= 25", reward: 350 },
  { id: "legendary_lord", name: "Legendary Lord", description: "Reach castle level 50.", condition: "level >= 50", reward: 1000 },
  { id: "alliance_master", name: "Alliance Master", description: "Form all 5 alliances.", condition: "alliancesFormed >= 5", reward: 300 },
  { id: "quest_completer", name: "Quest Master", description: "Complete 15 quests.", condition: "totalQuestsCompleted >= 15", reward: 250 },
  { id: "streak_master", name: "Streak Master", description: "Reach a daily streak of 7.", condition: "bestStreak >= 7", reward: 200 },
  { id: "army_commander", name: "Army Commander", description: "Recruit 100 total units.", condition: "totalUnitsRecruited >= 100", reward: 300 },
  { id: "mana_fountain", name: "Mana Fountain", description: "Accumulate 5,000 mana.", condition: "resources.mana >= 5000", reward: 200 },
  { id: "siege_master", name: "Siege Master", description: "Defeat 50 enemies total.", condition: "totalBattlesWon >= 50", reward: 400 },
  { id: "gem_collector", name: "Gem Collector", description: "Accumulate 500 gems.", condition: "resources.gems >= 500", reward: 350 },
  { id: "eternal_guardian", name: "Eternal Guardian", description: "Max out wall, tower, and moat.", condition: "defenseMaxed", reward: 500 },
];

export const FC_QUESTS: QuestDef[] = [
  { id: "q01", name: "Humble Beginnings", description: "Upgrade the Throne Room to level 3.", objectives: ["throne_room:3"], xpReward: 50, coinReward: 20, resourceReward: { gold: 100 }, requiredLevel: 1 },
  { id: "q02", name: "Learning the Arcane", description: "Learn your first 5 spells.", objectives: ["spellsLearned:5"], xpReward: 80, coinReward: 30, resourceReward: { mana: 50 }, requiredLevel: 2 },
  { id: "q03", name: "First Blood", description: "Defeat 3 enemies in battle.", objectives: ["totalBattlesWon:3"], xpReward: 60, coinReward: 25, resourceReward: { gold: 80, food: 30 }, requiredLevel: 2 },
  { id: "q04", name: "Gathering Forces", description: "Recruit 10 units of any type.", objectives: ["totalUnitsRecruited:10"], xpReward: 100, coinReward: 40, resourceReward: { gold: 150, iron: 20 }, requiredLevel: 3 },
  { id: "q05", name: "Fortify the Walls", description: "Upgrade wall HP to 500.", objectives: ["wallHP:500"], xpReward: 120, coinReward: 50, resourceReward: { stone: 100, iron: 50 }, requiredLevel: 4 },
  { id: "q06", name: "Garden of Plenty", description: "Upgrade the Royal Garden to level 5.", objectives: ["royal_garden:5"], xpReward: 90, coinReward: 35, resourceReward: { food: 200 }, requiredLevel: 5 },
  { id: "q07", name: "Dragon Hunt", description: "Defeat a Fire Drake.", objectives: ["enemiesDefeated.drake:1"], xpReward: 150, coinReward: 60, resourceReward: { gold: 200, gems: 2 }, requiredLevel: 5 },
  { id: "q08", name: "Library Expansion", description: "Upgrade the Grand Library to level 8.", objectives: ["grand_library:8"], xpReward: 130, coinReward: 55, resourceReward: { mana: 100, gold: 120 }, requiredLevel: 8 },
  { id: "q09", name: "Alchemical Discovery", description: "Upgrade the Alchemist Tower to level 6.", objectives: ["alchemist_tower:6"], xpReward: 110, coinReward: 45, resourceReward: { mana: 80, gold: 100 }, requiredLevel: 6 },
  { id: "q10", name: "Knight's Vigor", description: "Upgrade the Knight's Hall to level 7.", objectives: ["knights_hall:7"], xpReward: 140, coinReward: 55, resourceReward: { iron: 60, gold: 130 }, requiredLevel: 7 },
  { id: "q11", name: "Treasury Expansion", description: "Upgrade the Treasury to level 10.", objectives: ["treasury:10"], xpReward: 200, coinReward: 80, resourceReward: { gold: 500, gems: 5 }, requiredLevel: 10 },
  { id: "q12", name: "Diplomatic Ties", description: "Form 2 alliances.", objectives: ["alliancesFormed:2"], xpReward: 180, coinReward: 70, resourceReward: { gold: 200, gems: 3 }, requiredLevel: 10 },
  { id: "q13", name: "Undead Purge", description: "Defeat 5 Undead enemies.", objectives: ["typeDefeated.Undead:5"], xpReward: 200, coinReward: 80, resourceReward: { mana: 100, holy_power: 50 }, requiredLevel: 12 },
  { id: "q14", name: "Arcane Mastery", description: "Learn 15 spells.", objectives: ["spellsLearned:15"], xpReward: 250, coinReward: 100, resourceReward: { mana: 200, gems: 5 }, requiredLevel: 14 },
  { id: "q15", name: "Goblin Menace", description: "Defeat the Goblin Warlord.", objectives: ["enemiesDefeated.goblin_warlord:1"], xpReward: 220, coinReward: 90, resourceReward: { gold: 300, iron: 40 }, requiredLevel: 20 },
  { id: "q16", name: "Wizard's Ascent", description: "Upgrade the Wizard's Sanctum to level 15.", objectives: ["wizards_sanctum:15"], xpReward: 300, coinReward: 120, resourceReward: { mana: 300, gems: 10 }, requiredLevel: 18 },
  { id: "q17", name: "Demon Slayer", description: "Defeat 3 Demon-type enemies.", objectives: ["typeDefeated.Demon:3"], xpReward: 280, coinReward: 110, resourceReward: { gold: 350, mana: 100 }, requiredLevel: 22 },
  { id: "q18", name: "Impenetrable Fortress", description: "Max out towers and moat.", objectives: ["defenseMaxed:true"], xpReward: 400, coinReward: 150, resourceReward: { stone: 500, iron: 200 }, requiredLevel: 25 },
  { id: "q19", name: "Dark Elf Incursion", description: "Defeat the Dark Elf Matron.", objectives: ["enemiesDefeated.dark_elf_matron:1"], xpReward: 350, coinReward: 140, resourceReward: { gold: 500, gems: 15 }, requiredLevel: 33 },
  { id: "q20", name: "Elder Dragon Fall", description: "Defeat the Elder Dragon.", objectives: ["enemiesDefeated.elder_dragon:1"], xpReward: 500, coinReward: 200, resourceReward: { gold: 1000, gems: 25, mana: 200 }, requiredLevel: 35 },
];

export const FC_ADVISORS: AdvisorDef[] = [
  { id: "adv_general", name: "General Ironheart", title: "Master of Arms", bonusType: "unit_attack", bonusValue: 10, cost: 200, description: "A veteran commander who boosts all unit attack by 10%." },
  { id: "adv_scholar", name: "Elara Moonwhisper", title: "Arcane Scholar", bonusType: "spell_power", bonusValue: 12, cost: 250, description: "A brilliant mage who increases spell power by 12%." },
  { id: "adv_treasurer", name: "Goldthumb", title: "Royal Treasurer", bonusType: "gold_income", bonusValue: 15, cost: 300, description: "A shrewd financier who boosts gold income by 15%." },
  { id: "adv_architect", name: "Sir Buildstone", title: "Castle Architect", bonusType: "build_discount", bonusValue: 8, cost: 200, description: "An expert builder who reduces construction costs by 8%." },
  { id: "adv_herbalist", name: "Rose Thornfield", title: "Master Herbalist", bonusType: "food_production", bonusValue: 12, cost: 180, description: "A gifted botanist who boosts food production by 12%." },
  { id: "adv_diplomat", name: "Lord Velvetword", title: "Chief Diplomat", bonusType: "alliance_strength", bonusValue: 10, cost: 280, description: "A silver-tongued negotiator who strengthens alliances by 10%." },
  { id: "adv_spymaster", name: "Shadow Nyx", title: "Spymaster", bonusType: "enemy_loot", bonusValue: 10, cost: 350, description: "A master of espionage who increases enemy loot by 10%." },
  { id: "adv_chaplain", name: "Father Brightshield", title: "Royal Chaplain", bonusType: "wall_repair", bonusValue: 20, cost: 220, description: "A holy priest who improves wall repair efficiency by 20%." },
];

export const FC_EVENTS: EventDef[] = [
  { id: "evt_merchant_caravan", name: "Merchant Caravan", description: "Traveling merchants offer rare goods at discounted prices.", duration: 1, effectType: "shop_discount", effectValue: 25, probability: 0.15 },
  { id: "evt_goblin_raid", name: "Goblin Raid", description: "A horde of goblins attacks the castle walls!", duration: 1, effectType: "wall_damage", effectValue: 50, probability: 0.12 },
  { id: "evt_mana_surge", name: "Mana Surge", description: "A magical surge fills the land with arcane energy.", duration: 2, effectType: "mana_boost", effectValue: 50, probability: 0.10 },
  { id: "evt_bountiful_harvest", name: "Bountiful Harvest", description: "The fields yield an exceptional crop this season.", duration: 1, effectType: "food_boost", effectValue: 40, probability: 0.13 },
  { id: "evt_dragon_sighting", name: "Dragon Sighting", description: "A dragon is spotted near the kingdom. Beware!", duration: 1, effectType: "dragon_attack", effectValue: 80, probability: 0.06 },
  { id: "evt_festival", name: "Grand Festival", description: "The kingdom celebrates with a grand festival. Morale soars!", duration: 2, effectType: "xp_boost", effectValue: 30, probability: 0.10 },
  { id: "evt_mining_discovery", name: "Mining Discovery", description: "Miners discover a rich vein of gems!", duration: 1, effectType: "gem_bonus", effectValue: 30, probability: 0.08 },
  { id: "evt_plague", name: "Mysterious Plague", description: "A strange illness weakens the army.", duration: 2, effectType: "unit_debuff", effectValue: 15, probability: 0.07 },
];

export const FC_ALLIANCES: AllianceDef[] = [
  { id: "all_elfwood", name: "Kingdom of Elfwood", description: "Ancient elven realm with deep magical knowledge.", bonusType: "spell_power", bonusValue: 8, upkeepCost: { gold: 100, food: 50 }, moraleEffect: 5 },
  { id: "all_ironhold", name: "Ironhold Dwarves", description: "Stout dwarven miners and master smiths.", bonusType: "iron_production", bonusValue: 12, upkeepCost: { gold: 80, food: 60 }, moraleEffect: 3 },
  { id: "all_sunrise", name: "Duchy of Sunrise", description: "A prosperous human duchy of traders.", bonusType: "gold_income", bonusValue: 10, upkeepCost: { gold: 50, food: 40 }, moraleEffect: 4 },
  { id: "all_stormpeak", name: "Stormpeak Nomads", description: "Fierce nomadic warriors of the northern peaks.", bonusType: "unit_attack", bonusValue: 6, upkeepCost: { gold: 120, food: 80 }, moraleEffect: 2 },
  { id: "all_moonhaven", name: "Moonhaven Covenant", description: "A secretive order of healers and scholars.", bonusType: "mana_regen", bonusValue: 10, upkeepCost: { gold: 100, mana: 50 }, moraleEffect: 6 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const KINGDOM_TIERS = [
  { tier: 1, name: "Outpost", minLevel: 1 },
  { tier: 2, name: "Hamlet", minLevel: 5 },
  { tier: 3, name: "Village", minLevel: 10 },
  { tier: 4, name: "Town", minLevel: 15 },
  { tier: 5, name: "City", minLevel: 20 },
  { tier: 6, name: "Fortress", minLevel: 25 },
  { tier: 7, name: "Citadel", minLevel: 30 },
  { tier: 8, name: "Kingdom", minLevel: 35 },
  { tier: 9, name: "Empire", minLevel: 40 },
  { tier: 10, name: "Eternal Realm", minLevel: 45 },
];

function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function roomUpgradeCost(room: RoomDef, currentLevel: number): Record<string, number> {
  const cost: Record<string, number> = {};
  const multiplier = Math.pow(1.5, currentLevel);
  for (const [res, amount] of Object.entries(room.baseCost)) {
    cost[res] = Math.floor(amount * multiplier);
  }
  return cost;
}

function getDefenseRating(state: FantasyCastleState): number {
  return Math.floor(state.wallHP * 0.3 + state.towerLevel * 25 + state.moatLevel * 15);
}

function getTotalUnitPower(state: FantasyCastleState): number {
  let total = 0;
  for (const instance of Object.values(state.units)) {
    const def = FC_UNITS.find((u) => u.id === instance.defId);
    if (def) {
      total += (def.attack + def.defense + def.hp * 0.5) * instance.count;
    }
  }
  const hallLevel = state.rooms["knights_hall"]?.level ?? 1;
  const advisorBonus = fcGetAdvisorMultiplier(state, "unit_attack");
  return Math.floor(total * (1 + (hallLevel - 1) * 0.05) * advisorBonus);
}

function fcGetAdvisorMultiplier(state: FantasyCastleState, bonusType: string): number {
  let multiplier = 1;
  for (const aState of Object.values(state.advisors)) {
    if (!aState.hired) continue;
    const def = FC_ADVISORS.find((a) => a.id === aState.defId);
    if (def && def.bonusType === bonusType) {
      multiplier += def.bonusValue / 100;
    }
  }
  return multiplier;
}

function checkAchievements(state: FantasyCastleState): string[] {
  const newlyUnlocked: string[] = [];
  const allRoomsLevel10 = FC_ROOMS.every((r) => (state.rooms[r.id]?.level ?? 0) >= 10);
  const defenseMaxed = state.towerLevel >= 50 && state.moatLevel >= 50 && state.wallHP >= state.maxWallHP;
  const spellsLearned = Object.values(state.spells).filter((s) => s.learned).length;
  const alliancesFormed = Object.values(state.alliances).filter((a) => a.formed).length;

  for (const ach of FC_ACHIEVEMENTS) {
    if (state.achievements[ach.id]) continue;
    let met = false;
    if (ach.condition === "totalBattlesWon >= 1") met = state.stats.totalBattlesWon >= 1;
    else if (ach.condition === "enemiesDefeated.elder_dragon >= 1") met = (state.enemiesDefeated["elder_dragon"] ?? 0) >= 1;
    else if (ach.condition === "allRoomsLevel10") met = allRoomsLevel10;
    else if (ach.condition === "spellsLearned >= 30") met = spellsLearned >= 30;
    else if (ach.condition === "resources.gold >= 10000") met = (state.resources["gold"] ?? 0) >= 10000;
    else if (ach.condition === "level >= 25") met = state.level >= 25;
    else if (ach.condition === "level >= 50") met = state.level >= 50;
    else if (ach.condition === "alliancesFormed >= 5") met = alliancesFormed >= 5;
    else if (ach.condition === "totalQuestsCompleted >= 15") met = state.stats.totalQuestsCompleted >= 15;
    else if (ach.condition === "bestStreak >= 7") met = state.bestStreak >= 7;
    else if (ach.condition === "totalUnitsRecruited >= 100") met = state.stats.totalUnitsRecruited >= 100;
    else if (ach.condition === "resources.mana >= 5000") met = (state.resources["mana"] ?? 0) >= 5000;
    else if (ach.condition === "totalBattlesWon >= 50") met = state.stats.totalBattlesWon >= 50;
    else if (ach.condition === "resources.gems >= 500") met = (state.resources["gems"] ?? 0) >= 500;
    else if (ach.condition === "defenseMaxed") met = defenseMaxed;
    if (met) {
      state.achievements[ach.id] = true;
      state.coins += ach.reward;
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// State management (SSR-safe)
// ---------------------------------------------------------------------------

let state: FantasyCastleState | null = null;

function createInitialState(): FantasyCastleState {
  const rooms: Record<string, RoomState> = {};
  for (const room of FC_ROOMS) {
    rooms[room.id] = { level: 1 };
  }

  const resources: Record<string, number> = { gold: 500, mana: 100, stone: 200, food: 300, iron: 50, gems: 10 };

  const units: Record<string, UnitInstance> = {};
  for (const unit of FC_UNITS) {
    units[unit.id] = { defId: unit.id, count: 0 };
  }

  const spells: Record<string, SpellState> = {};
  for (const spell of FC_SPELLS) {
    spells[spell.id] = { defId: spell.id, learned: false, castCount: 0 };
  }

  const enemiesDefeated: Record<string, number> = {};

  const quests: Record<string, QuestState> = {};
  for (const quest of FC_QUESTS) {
    quests[quest.id] = { defId: quest.id, started: false, completed: false, progress: 0 };
  }

  const advisors: Record<string, AdvisorState> = {};
  for (const adv of FC_ADVISORS) {
    advisors[adv.id] = { defId: adv.id, hired: false };
  }

  const alliances: Record<string, AllianceState> = {};
  for (const all of FC_ALLIANCES) {
    alliances[all.id] = { defId: all.id, formed: false, strength: 0 };
  }

  const achievements: Record<string, boolean> = {};

  return {
    level: 1,
    xp: 0,
    coins: 0,
    kingdomName: "New Kingdom",
    kingdomTier: 1,
    rooms,
    resources,
    units,
    spells,
    enemiesDefeated,
    quests,
    advisors,
    alliances,
    wallHP: 200,
    maxWallHP: 1000,
    towerLevel: 1,
    moatLevel: 0,
    dailyQuest: null,
    streak: 0,
    bestStreak: 0,
    achievements,
    stats: {
      totalBattlesWon: 0,
      totalBattlesLost: 0,
      totalSpellsCast: 0,
      totalResourcesGathered: 0,
      totalUnitsRecruited: 0,
      totalQuestsCompleted: 0,
      totalGoldEarned: 0,
      totalManaSpent: 0,
      totalDaysPlayed: 1,
      highestEnemyDefeated: 0,
    },
    runHistory: [],
  };
}

function ensureInit(): FantasyCastleState {
  if (!state) {
    state = createInitialState();
  }
  return state;
}

// ---------------------------------------------------------------------------
// Exported: State access
// ---------------------------------------------------------------------------

export function fcGetState(): FantasyCastleState {
  return ensureInit();
}

export function fcIsInitialized(): boolean {
  return state !== null;
}

export function fcResetState(): FantasyCastleState {
  state = createInitialState();
  return state;
}

// ---------------------------------------------------------------------------
// Exported: Level & XP
// ---------------------------------------------------------------------------

export function fcGetLevel(): number {
  return ensureInit().level;
}

export function fcGetXp(): number {
  return ensureInit().xp;
}

export function fcGetXpToNextLevel(): number {
  return xpForLevel(ensureInit().level);
}

export function fcGetXpProgress(): number {
  const s = ensureInit();
  const needed = xpForLevel(s.level);
  return needed > 0 ? Math.min(s.xp / needed, 1) : 0;
}

export function fcAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  const throneBonus = 1 + ((s.rooms["throne_room"]?.level ?? 1) - 1) * 0.05;
  const actual = Math.floor(amount * throneBonus);
  s.xp += actual;
  let leveledUp = false;
  while (s.xp >= xpForLevel(s.level) && s.level < 50) {
    s.xp -= xpForLevel(s.level);
    s.level++;
    leveledUp = true;
    // Update kingdom tier
    for (let i = KINGDOM_TIERS.length - 1; i >= 0; i--) {
      if (s.level >= KINGDOM_TIERS[i].minLevel) {
        s.kingdomTier = KINGDOM_TIERS[i].tier;
        break;
      }
    }
  }
  if (s.level >= 50) s.xp = 0;
  return { leveledUp, newLevel: s.level };
}

// ---------------------------------------------------------------------------
// Exported: Kingdom
// ---------------------------------------------------------------------------

export function fcSetKingdomName(name: string): void {
  ensureInit().kingdomName = name;
}

export function fcGetKingdomName(): string {
  return ensureInit().kingdomName;
}

export function fcGetKingdomTier(): number {
  return ensureInit().kingdomTier;
}

export function fcGetKingdomTierName(): string {
  const tier = ensureInit().kingdomTier;
  const found = KINGDOM_TIERS.find((t) => t.tier === tier);
  return found ? found.name : "Unknown";
}

export function fcGetAllKingdomTiers(): { tier: number; name: string; minLevel: number }[] {
  return [...KINGDOM_TIERS];
}

// ---------------------------------------------------------------------------
// Exported: Resources
// ---------------------------------------------------------------------------

export function fcGetResources(): Record<string, number> {
  return { ...ensureInit().resources };
}

export function fcGetResource(id: string): number {
  return ensureInit().resources[id] ?? 0;
}

export function fcAddResource(id: string, amount: number): void {
  const s = ensureInit();
  if (!(id in s.resources)) return;
  s.resources[id] = Math.max(0, s.resources[id] + amount);
  if (amount > 0) s.stats.totalResourcesGathered += amount;
  if (id === "gold" && amount > 0) s.stats.totalGoldEarned += amount;
  checkAchievements(s);
}

export function fcSpendResource(id: string, amount: number): boolean {
  const s = ensureInit();
  if ((s.resources[id] ?? 0) < amount) return false;
  s.resources[id] -= amount;
  if (id === "mana") s.stats.totalManaSpent += amount;
  return true;
}

export function fcCanAfford(cost: Record<string, number>): boolean {
  const s = ensureInit();
  for (const [res, amount] of Object.entries(cost)) {
    if ((s.resources[res] ?? 0) < amount) return false;
  }
  return true;
}

export function fcSpendResources(cost: Record<string, number>): boolean {
  if (!fcCanAfford(cost)) return false;
  const s = ensureInit();
  for (const [res, amount] of Object.entries(cost)) {
    s.resources[res] -= amount;
    if (res === "mana") s.stats.totalManaSpent += amount;
  }
  return true;
}

export function fcGenerateResources(): Record<string, number> {
  const s = ensureInit();
  const generated: Record<string, number> = {};
  const gardenLevel = s.rooms["royal_garden"]?.level ?? 1;
  const alchemistLevel = s.rooms["alchemist_tower"]?.level ?? 1;
  const sanctumLevel = s.rooms["wizards_sanctum"]?.level ?? 1;
  const foodBonus = fcGetAdvisorMultiplier(s, "food_production");

  generated.food = Math.floor((10 + gardenLevel * 5) * foodBonus);
  generated.gold = Math.floor(15 + s.level * 2);
  generated.mana = Math.floor((5 + sanctumLevel * 3) + alchemistLevel * 1.5);
  generated.stone = Math.floor(5 + s.level);
  generated.iron = Math.floor(3 + s.level * 0.5);
  generated.gems = s.level >= 10 ? Math.floor(1 + (s.level - 10) * 0.2) : 0;

  for (const [res, amount] of Object.entries(generated)) {
    fcAddResource(res, amount);
  }
  return generated;
}

// ---------------------------------------------------------------------------
// Exported: Rooms
// ---------------------------------------------------------------------------

export function fcGetRooms(): Record<string, RoomState> {
  return { ...ensureInit().rooms };
}

export function fcGetRoomLevel(roomId: string): number {
  return ensureInit().rooms[roomId]?.level ?? 0;
}

export function fcGetRoomDef(roomId: string): RoomDef | undefined {
  return FC_ROOMS.find((r) => r.id === roomId);
}

export function fcUpgradeRoom(roomId: string): { success: boolean; newLevel: number } {
  const s = ensureInit();
  const roomDef = FC_ROOMS.find((r) => r.id === roomId);
  if (!roomDef) return { success: false, newLevel: 0 };
  const current = s.rooms[roomId]?.level ?? 0;
  if (current >= roomDef.maxLevel) return { success: false, newLevel: current };
  const cost = roomUpgradeCost(roomDef, current);
  // Architect discount
  const discount = 1 - fcGetAdvisorMultiplier(s, "build_discount") + 1;
  const discountedCost: Record<string, number> = {};
  for (const [res, amt] of Object.entries(cost)) {
    discountedCost[res] = Math.max(1, Math.floor(amt * Math.min(discount, 1)));
  }
  if (!fcCanAfford(discountedCost)) return { success: false, newLevel: current };
  fcSpendResources(discountedCost);
  if (!s.rooms[roomId]) s.rooms[roomId] = { level: 1 };
  s.rooms[roomId].level++;
  checkAchievements(s);
  return { success: true, newLevel: s.rooms[roomId].level };
}

// ---------------------------------------------------------------------------
// Exported: Units
// ---------------------------------------------------------------------------

export function fcGetUnits(): Record<string, UnitInstance> {
  return { ...ensureInit().units };
}

export function fcGetUnitCount(unitId: string): number {
  return ensureInit().units[unitId]?.count ?? 0;
}

export function fcGetTotalUnits(): number {
  let total = 0;
  for (const u of Object.values(ensureInit().units)) {
    total += u.count;
  }
  return total;
}

export function fcGetUnitPower(unitId: string): number {
  const s = ensureInit();
  const def = FC_UNITS.find((u) => u.id === unitId);
  if (!def) return 0;
  const hallLevel = s.rooms["knights_hall"]?.level ?? 1;
  const advisorBonus = fcGetAdvisorMultiplier(s, "unit_attack");
  const perUnit = (def.attack + def.defense + def.hp * 0.5) * (1 + (hallLevel - 1) * 0.05) * advisorBonus;
  return Math.floor(perUnit * (s.units[unitId]?.count ?? 0));
}

export function fcGetTotalArmyPower(): number {
  return getTotalUnitPower(ensureInit());
}

export function fcRecruitUnit(unitId: string, count: number): { success: boolean; recruited: number } {
  const s = ensureInit();
  const def = FC_UNITS.find((u) => u.id === unitId);
  if (!def || count <= 0) return { success: false, recruited: 0 };
  const totalCost: Record<string, number> = {};
  for (const [res, amount] of Object.entries(def.cost)) {
    totalCost[res] = amount * count;
  }
  if (!fcCanAfford(totalCost)) return { success: false, recruited: 0 };
  fcSpendResources(totalCost);
  if (!s.units[unitId]) s.units[unitId] = { defId: unitId, count: 0 };
  s.units[unitId].count += count;
  s.stats.totalUnitsRecruited += count;
  checkAchievements(s);
  return { success: true, recruited: count };
}

export function fcDismissUnit(unitId: string, count: number): boolean {
  const s = ensureInit();
  if ((s.units[unitId]?.count ?? 0) < count || count <= 0) return false;
  s.units[unitId].count -= count;
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Spells
// ---------------------------------------------------------------------------

export function fcGetSpells(): Record<string, SpellState> {
  return { ...ensureInit().spells };
}

export function fcGetLearnedSpells(): SpellDef[] {
  const s = ensureInit();
  return FC_SPELLS.filter((sp) => s.spells[sp.id]?.learned);
}

export function fcLearnSpell(spellId: string): { success: boolean; reason?: string } {
  const s = ensureInit();
  const def = FC_SPELLS.find((sp) => sp.id === spellId);
  if (!def) return { success: false, reason: "Spell not found" };
  if (s.level < def.unlockLevel) return { success: false, reason: `Requires level ${def.unlockLevel}` };
  if (s.spells[spellId]?.learned) return { success: false, reason: "Already learned" };
  if ((s.resources["mana"] ?? 0) < def.manaCost * 3)
    return { success: false, reason: "Not enough mana" };
  s.resources["mana"] -= def.manaCost * 3;
  s.stats.totalManaSpent += def.manaCost * 3;
  s.spells[spellId] = { defId: spellId, learned: true, castCount: 0 };
  checkAchievements(s);
  return { success: true };
}

export function fcCastSpell(spellId: string): { success: boolean; damage: number; reason?: string } {
  const s = ensureInit();
  const def = FC_SPELLS.find((sp) => sp.id === spellId);
  if (!def) return { success: false, damage: 0, reason: "Spell not found" };
  const spellState = s.spells[spellId];
  if (!spellState?.learned) return { success: false, damage: 0, reason: "Spell not learned" };
  if ((s.resources["mana"] ?? 0) < def.manaCost) return { success: false, damage: 0, reason: "Not enough mana" };
  s.resources["mana"] -= def.manaCost;
  s.stats.totalManaSpent += def.manaCost;
  spellState.castCount++;
  s.stats.totalSpellsCast++;
  const libraryBonus = 1 + ((s.rooms["grand_library"]?.level ?? 1) - 1) * 0.03;
  const advisorBonus = fcGetAdvisorMultiplier(s, "spell_power");
  const allianceBonus = getAllianceSpellBonus(s);
  const damage = Math.floor(def.power * libraryBonus * advisorBonus * allianceBonus);
  return { success: true, damage };
}

function getAllianceSpellBonus(s: FantasyCastleState): number {
  let bonus = 1;
  for (const aState of Object.values(s.alliances)) {
    if (!aState.formed) continue;
    const def = FC_ALLIANCES.find((a) => a.id === aState.defId);
    if (def && def.bonusType === "spell_power") {
      bonus += def.bonusValue / 100;
    }
  }
  return bonus;
}

// ---------------------------------------------------------------------------
// Exported: Enemies & Combat
// ---------------------------------------------------------------------------

export function fcGetEnemyById(enemyId: string): EnemyDef | undefined {
  return FC_ENEMIES.find((e) => e.id === enemyId);
}

export function fcGetEnemiesByLevel(maxLevel?: number): EnemyDef[] {
  const level = maxLevel ?? ensureInit().level;
  return FC_ENEMIES.filter((e) => e.minLevel <= level);
}

export function fcGetAvailableEnemyTypes(): string[] {
  const types: string[] = [];
  for (const e of FC_ENEMIES) {
    if (types.indexOf(e.type) === -1) types.push(e.type);
  }
  return types;
}

export function fcBattleEnemy(
  enemyId: string,
): { victory: boolean; damageDealt: number; damageTaken: number; rewards: Record<string, number>; xpGained: number } {
  const s = ensureInit();
  const enemy = FC_ENEMIES.find((e) => e.id === enemyId);
  if (!enemy)
    return { victory: false, damageDealt: 0, damageTaken: 0, rewards: {}, xpGained: 0 };

  const armyPower = getTotalUnitPower(s);
  const defense = getDefenseRating(s);
  const totalPower = armyPower + defense;

  // Combat calculation with randomness
  const attackRoll = totalPower * (0.8 + Math.random() * 0.4);
  const enemyPower = enemy.attack + enemy.defense + enemy.hp * 0.5;
  const defenseRoll = enemyPower * (0.8 + Math.random() * 0.4);

  const damageDealt = Math.max(1, Math.floor(attackRoll - defenseRoll * 0.5));
  const damageTaken = Math.max(0, Math.floor(defenseRoll * 0.3));

  const victory = attackRoll >= defenseRoll * 0.7;

  if (victory) {
    s.stats.totalBattlesWon++;
    s.enemiesDefeated[enemyId] = (s.enemiesDefeated[enemyId] ?? 0) + 1;
    if (enemy.hp > s.stats.highestEnemyDefeated) {
      s.stats.highestEnemyDefeated = enemy.hp;
    }
    // Loot bonus from dungeon + spymaster
    const dungeonBonus = 1 + ((s.rooms["dungeon"]?.level ?? 1) - 1) * 0.03;
    const spymasterBonus = fcGetAdvisorMultiplier(s, "enemy_loot");
    const rewards: Record<string, number> = {};
    for (const [res, amount] of Object.entries(enemy.reward)) {
      const gained = Math.floor(amount * dungeonBonus * spymasterBonus);
      rewards[res] = gained;
      fcAddResource(res, gained);
    }
    const xpGained = enemy.xpReward;
    fcAddXP(xpGained);
    checkAchievements(s);
    return { victory: true, damageDealt, damageTaken, rewards, xpGained };
  } else {
    s.stats.totalBattlesLost++;
    // Take wall damage
    s.wallHP = Math.max(0, s.wallHP - damageTaken);
    return { victory: false, damageDealt, damageTaken, rewards: {}, xpGained: 0 };
  }
}

// ---------------------------------------------------------------------------
// Exported: Defense
// ---------------------------------------------------------------------------

export function fcGetWallHP(): number {
  return ensureInit().wallHP;
}

export function fcGetMaxWallHP(): number {
  return ensureInit().maxWallHP;
}

export function fcRepairWall(amount: number): number {
  const s = ensureInit();
  const chaplainBonus = fcGetAdvisorMultiplier(s, "wall_repair");
  const actual = Math.floor(amount * chaplainBonus);
  const old = s.wallHP;
  s.wallHP = Math.min(s.maxWallHP, s.wallHP + actual);
  return s.wallHP - old;
}

export function fcUpgradeWall(): { success: boolean; newMax: number } {
  const s = ensureInit();
  const cost = { gold: Math.floor(200 * Math.pow(1.3, (s.maxWallHP - 1000) / 200)), stone: Math.floor(100 * Math.pow(1.3, (s.maxWallHP - 1000) / 200)) };
  if (!fcCanAfford(cost)) return { success: false, newMax: s.maxWallHP };
  fcSpendResources(cost);
  s.maxWallHP += 200;
  s.wallHP = s.maxWallHP;
  checkAchievements(s);
  return { success: true, newMax: s.maxWallHP };
}

export function fcGetTowerLevel(): number {
  return ensureInit().towerLevel;
}

export function fcUpgradeTower(): { success: boolean; newLevel: number } {
  const s = ensureInit();
  if (s.towerLevel >= 50) return { success: false, newLevel: s.towerLevel };
  const cost = { gold: Math.floor(150 * Math.pow(1.4, s.towerLevel)), iron: Math.floor(50 * Math.pow(1.4, s.towerLevel)) };
  if (!fcCanAfford(cost)) return { success: false, newLevel: s.towerLevel };
  fcSpendResources(cost);
  s.towerLevel++;
  checkAchievements(s);
  return { success: true, newLevel: s.towerLevel };
}

export function fcGetMoatLevel(): number {
  return ensureInit().moatLevel;
}

export function fcUpgradeMoat(): { success: boolean; newLevel: number } {
  const s = ensureInit();
  if (s.moatLevel >= 50) return { success: false, newLevel: s.moatLevel };
  const cost = { gold: Math.floor(100 * Math.pow(1.35, s.moatLevel)), stone: Math.floor(80 * Math.pow(1.35, s.moatLevel)) };
  if (!fcCanAfford(cost)) return { success: false, newLevel: s.moatLevel };
  fcSpendResources(cost);
  s.moatLevel++;
  checkAchievements(s);
  return { success: true, newLevel: s.moatLevel };
}

export function fcGetDefenseRating(): number {
  return getDefenseRating(ensureInit());
}

export function fcGetDefenseDetails(): { wallHP: number; maxWallHP: number; towerLevel: number; moatLevel: number; totalRating: number } {
  const s = ensureInit();
  return {
    wallHP: s.wallHP,
    maxWallHP: s.maxWallHP,
    towerLevel: s.towerLevel,
    moatLevel: s.moatLevel,
    totalRating: getDefenseRating(s),
  };
}

// ---------------------------------------------------------------------------
// Exported: Alliances
// ---------------------------------------------------------------------------

export function fcGetAlliances(): Record<string, AllianceState> {
  return { ...ensureInit().alliances };
}

export function fcGetAllianceDef(allianceId: string): AllianceDef | undefined {
  return FC_ALLIANCES.find((a) => a.id === allianceId);
}

export function fcFormAlliance(allianceId: string): { success: boolean; reason?: string } {
  const s = ensureInit();
  const def = FC_ALLIANCES.find((a) => a.id === allianceId);
  if (!def) return { success: false, reason: "Alliance not found" };
  if (s.alliances[allianceId]?.formed) return { success: false, reason: "Already formed" };
  if (!fcCanAfford(def.upkeepCost)) return { success: false, reason: "Cannot afford upkeep" };
  fcSpendResources(def.upkeepCost);
  const diplomatBonus = fcGetAdvisorMultiplier(s, "alliance_strength");
  s.alliances[allianceId] = { defId: allianceId, formed: true, strength: Math.floor(100 * diplomatBonus) };
  checkAchievements(s);
  return { success: true };
}

export function fcBreakAlliance(allianceId: string): boolean {
  const s = ensureInit();
  if (!s.alliances[allianceId]?.formed) return false;
  s.alliances[allianceId].formed = false;
  s.alliances[allianceId].strength = 0;
  return true;
}

export function fcGetAllianceBonus(bonusType: string): number {
  const s = ensureInit();
  let total = 0;
  for (const aState of Object.values(s.alliances)) {
    if (!aState.formed) continue;
    const def = FC_ALLIANCES.find((a) => a.id === aState.defId);
    if (def && def.bonusType === bonusType) {
      total += def.bonusValue;
    }
  }
  return total;
}

export function fcGetActiveAllianceCount(): number {
  return Object.values(ensureInit().alliances).filter((a) => a.formed).length;
}

// ---------------------------------------------------------------------------
// Exported: Quests
// ---------------------------------------------------------------------------

export function fcGetQuests(): Record<string, QuestState> {
  return { ...ensureInit().quests };
}

export function fcGetQuestDef(questId: string): QuestDef | undefined {
  return FC_QUESTS.find((q) => q.id === questId);
}

export function fcGetAvailableQuests(): QuestDef[] {
  const s = ensureInit();
  return FC_QUESTS.filter((q) => q.requiredLevel <= s.level && !s.quests[q.id]?.completed);
}

export function fcStartQuest(questId: string): { success: boolean; reason?: string } {
  const s = ensureInit();
  const def = FC_QUESTS.find((q) => q.id === questId);
  if (!def) return { success: false, reason: "Quest not found" };
  if (def.requiredLevel > s.level) return { success: false, reason: `Requires level ${def.requiredLevel}` };
  const qs = s.quests[questId];
  if (!qs) return { success: false, reason: "Quest data missing" };
  if (qs.completed) return { success: false, reason: "Already completed" };
  if (qs.started) return { success: false, reason: "Already started" };
  qs.started = true;
  qs.progress = 0;
  return { success: true };
}

export function fcCompleteQuest(questId: string): { success: boolean; xpGained: number; coinsGained: number; resourcesGained: Record<string, number>; reason?: string } {
  const s = ensureInit();
  const def = FC_QUESTS.find((q) => q.id === questId);
  if (!def) return { success: false, xpGained: 0, coinsGained: 0, resourcesGained: {} };
  const qs = s.quests[questId];
  if (!qs || !qs.started || qs.completed) return { success: false, xpGained: 0, coinsGained: 0, resourcesGained: {}, reason: "Quest not ready" };
  qs.completed = true;
  s.stats.totalQuestsCompleted++;
  fcAddXP(def.xpReward);
  s.coins += def.coinReward;
  const resourcesGained: Record<string, number> = {};
  for (const [res, amount] of Object.entries(def.resourceReward)) {
    fcAddResource(res, amount);
    resourcesGained[res] = amount;
  }
  checkAchievements(s);
  return { success: true, xpGained: def.xpReward, coinsGained: def.coinReward, resourcesGained };
}

export function fcUpdateQuestProgress(questId: string, progress: number): boolean {
  const s = ensureInit();
  const qs = s.quests[questId];
  if (!qs || !qs.started || qs.completed) return false;
  qs.progress = Math.max(qs.progress, progress);
  return true;
}

// ---------------------------------------------------------------------------
// Exported: Advisors
// ---------------------------------------------------------------------------

export function fcGetAdvisors(): Record<string, AdvisorState> {
  return { ...ensureInit().advisors };
}

export function fcGetAdvisorDef(advisorId: string): AdvisorDef | undefined {
  return FC_ADVISORS.find((a) => a.id === advisorId);
}

export function fcHireAdvisor(advisorId: string): { success: boolean; reason?: string } {
  const s = ensureInit();
  const def = FC_ADVISORS.find((a) => a.id === advisorId);
  if (!def) return { success: false, reason: "Advisor not found" };
  if (s.advisors[advisorId]?.hired) return { success: false, reason: "Already hired" };
  if (s.coins < def.cost) return { success: false, reason: "Not enough coins" };
  s.coins -= def.cost;
  s.advisors[advisorId].hired = true;
  return { success: true };
}

export function fcGetHiredAdvisors(): AdvisorDef[] {
  const s = ensureInit();
  return FC_ADVISORS.filter((a) => s.advisors[a.id]?.hired);
}

// ---------------------------------------------------------------------------
// Exported: Events
// ---------------------------------------------------------------------------

export function fcGetEventDefs(): EventDef[] {
  return [...FC_EVENTS];
}

export function fcRollEvent(): EventDef | null {
  const s = ensureInit();
  const roll = Math.random();
  let cumulative = 0;
  for (const event of FC_EVENTS) {
    cumulative += event.probability;
    if (roll < cumulative) return event;
  }
  return null;
}

export function fcProcessEvent(eventId: string): { effectType: string; effectValue: number; description: string } {
  const s = ensureInit();
  const def = FC_EVENTS.find((e) => e.id === eventId);
  if (!def) return { effectType: "none", effectValue: 0, description: "Unknown event" };

  switch (def.effectType) {
    case "mana_boost":
      fcAddResource("mana", Math.floor(s.resources["mana"] * def.effectValue / 100));
      break;
    case "food_boost":
      fcAddResource("food", Math.floor(def.effectValue * 10));
      break;
    case "gem_bonus":
      fcAddResource("gems", def.effectValue);
      break;
    case "xp_boost":
      fcAddXP(Math.floor(50 + s.level * 5));
      break;
    case "wall_damage":
      s.wallHP = Math.max(0, s.wallHP - def.effectValue);
      break;
    case "dragon_attack":
      s.wallHP = Math.max(0, s.wallHP - def.effectValue);
      break;
    case "unit_debuff":
      // Reduce a random unit count slightly
      for (const unitId of Object.keys(s.units)) {
        if (s.units[unitId].count > 0) {
          const lost = Math.max(1, Math.floor(s.units[unitId].count * def.effectValue / 200));
          s.units[unitId].count = Math.max(0, s.units[unitId].count - lost);
          break;
        }
      }
      break;
    case "shop_discount":
      // Temporary effect - tracked externally
      break;
  }
  return { effectType: def.effectType, effectValue: def.effectValue, description: def.description };
}

// ---------------------------------------------------------------------------
// Exported: Daily Quests, Streak, Coins
// ---------------------------------------------------------------------------

export function fcGenerateDailyQuest(): DailyQuestData {
  const s = ensureInit();
  const questPool = [
    { questId: "dq_battle", target: 3 + Math.floor(s.level / 5) },
    { questId: "dq_gather", target: 100 + s.level * 10 },
    { questId: "dq_recruit", target: 2 + Math.floor(s.level / 8) },
    { questId: "dq_spell", target: 2 + Math.floor(s.level / 10) },
    { questId: "dq_build", target: 1 },
  ];
  const chosen = questPool[Math.floor(Math.random() * questPool.length)];
  s.dailyQuest = {
    questId: chosen.questId,
    progress: 0,
    target: chosen.target,
    completed: false,
    resetTimestamp: Date.now() + 86400000,
  };
  return s.dailyQuest;
}

export function fcGetDailyQuest(): DailyQuestData | null {
  return ensureInit().dailyQuest;
}

export function fcUpdateDailyProgress(amount: number): { completed: boolean; coinsEarned: number } {
  const s = ensureInit();
  if (!s.dailyQuest || s.dailyQuest.completed) return { completed: false, coinsEarned: 0 };
  s.dailyQuest.progress = Math.min(s.dailyQuest.target, s.dailyQuest.progress + amount);
  if (s.dailyQuest.progress >= s.dailyQuest.target) {
    s.dailyQuest.completed = true;
    const coinsEarned = 10 + s.level * 2;
    s.coins += coinsEarned;
    return { completed: true, coinsEarned };
  }
  return { completed: false, coinsEarned: 0 };
}

export function fcClaimDailyStreak(): { streak: number; bestStreak: number; coinsEarned: number } {
  const s = ensureInit();
  s.streak++;
  if (s.streak > s.bestStreak) s.bestStreak = s.streak;
  const coinsEarned = s.streak * 5;
  s.coins += coinsEarned;
  checkAchievements(s);
  return { streak: s.streak, bestStreak: s.bestStreak, coinsEarned };
}

export function fcResetStreak(): void {
  ensureInit().streak = 0;
}

export function fcGetStreak(): { current: number; best: number } {
  const s = ensureInit();
  return { current: s.streak, best: s.bestStreak };
}

export function fcAddCoins(amount: number): void {
  ensureInit().coins += amount;
}

export function fcSpendCoins(amount: number): boolean {
  const s = ensureInit();
  if (s.coins < amount) return false;
  s.coins -= amount;
  return true;
}

export function fcGetCoins(): number {
  return ensureInit().coins;
}

// ---------------------------------------------------------------------------
// Exported: Achievements
// ---------------------------------------------------------------------------

export function fcGetAchievements(): Record<string, boolean> {
  return { ...ensureInit().achievements };
}

export function fcGetAchievementDef(achievementId: string): AchievementDef | undefined {
  return FC_ACHIEVEMENTS.find((a) => a.id === achievementId);
}

export function fcGetUnlockedAchievements(): AchievementDef[] {
  const s = ensureInit();
  return FC_ACHIEVEMENTS.filter((a) => s.achievements[a.id]);
}

export function fcGetLockedAchievements(): AchievementDef[] {
  const s = ensureInit();
  return FC_ACHIEVEMENTS.filter((a) => !s.achievements[a.id]);
}

export function fcGetAchievementProgress(): { id: string; name: string; unlocked: boolean; description: string }[] {
  const s = ensureInit();
  return FC_ACHIEVEMENTS.map((a) => ({
    id: a.id,
    name: a.name,
    unlocked: !!s.achievements[a.id],
    description: a.description,
  }));
}

// ---------------------------------------------------------------------------
// Exported: Stats & History
// ---------------------------------------------------------------------------

export function fcGetStats(): Stats {
  return { ...ensureInit().stats };
}

export function fcIncrementStat(stat: keyof Stats): void {
  const s = ensureInit();
  if (typeof s.stats[stat] === "number") {
    (s.stats[stat] as number)++;
  }
}

export function fcGetRunHistory(): RunHistory[] {
  return [...ensureInit().runHistory];
}

export function fcAddRunHistory(run: Omit<RunHistory, "id" | "timestamp">): void {
  const s = ensureInit();
  s.runHistory.push({
    ...run,
    id: `run_${s.runHistory.length + 1}`,
    timestamp: Date.now(),
  });
  if (s.runHistory.length > 50) s.runHistory.shift();
}

export function fcIncrementDaysPlayed(): void {
  ensureInit().stats.totalDaysPlayed++;
}

// ---------------------------------------------------------------------------
// Exported: Utility / Computed
// ---------------------------------------------------------------------------

export function fcGetCastlePower(): number {
  const s = ensureInit();
  const army = getTotalUnitPower(s);
  const defense = getDefenseRating(s);
  const spellPower = fcGetLearnedSpells().reduce((sum, sp) => sum + sp.power, 0);
  const alliancePower = fcGetActiveAllianceCount() * 50;
  return army + defense + spellPower + alliancePower;
}

export function fcGetResourceProduction(): Record<string, number> {
  const s = ensureInit();
  const gardenLevel = s.rooms["royal_garden"]?.level ?? 1;
  const alchemistLevel = s.rooms["alchemist_tower"]?.level ?? 1;
  const sanctumLevel = s.rooms["wizards_sanctum"]?.level ?? 1;
  const foodBonus = fcGetAdvisorMultiplier(s, "food_production");
  const goldBonus = fcGetAdvisorMultiplier(s, "gold_income") + (fcGetAllianceBonus("gold_income") / 100);
  const manaAlliance = 1 + fcGetAllianceBonus("mana_regen") / 100;

  return {
    food: Math.floor((10 + gardenLevel * 5) * foodBonus),
    gold: Math.floor((15 + s.level * 2) * goldBonus),
    mana: Math.floor((5 + sanctumLevel * 3 + alchemistLevel * 1.5) * manaAlliance),
    stone: Math.floor(5 + s.level),
    iron: Math.floor(3 + s.level * 0.5),
    gems: s.level >= 10 ? Math.floor(1 + (s.level - 10) * 0.2) : 0,
  };
}

export function fcGetUnitsByCategory(category: string): UnitDef[] {
  return FC_UNITS.filter((u) => u.category === category);
}

export function fcGetSpellsBySchool(school: string): SpellDef[] {
  return FC_SPELLS.filter((sp) => sp.school === school);
}

export function fcGetEnemiesByType(type: string): EnemyDef[] {
  return FC_ENEMIES.filter((e) => e.type === type);
}

export function fcGetBattlePreview(enemyId: string): { playerPower: number; enemyPower: number; winChance: number } {
  const s = ensureInit();
  const enemy = FC_ENEMIES.find((e) => e.id === enemyId);
  if (!enemy) return { playerPower: 0, enemyPower: 0, winChance: 0 };
  const playerPower = getTotalUnitPower(s) + getDefenseRating(s);
  const enemyPower = enemy.attack + enemy.defense + enemy.hp * 0.5;
  const winChance = Math.min(0.95, Math.max(0.05, playerPower / (playerPower + enemyPower)));
  return { playerPower, enemyPower, winChance };
}

export function fcGetRoomBonus(roomId: string, level?: number): { stat: string; value: number; description: string } {
  const def = FC_ROOMS.find((r) => r.id === roomId);
  if (!def) return { stat: "none", value: 0, description: "Unknown room" };
  const effectiveLevel = level ?? ensureInit().rooms[roomId]?.level ?? 1;
  let stat = "generic";
  let value = effectiveLevel;

  switch (roomId) {
    case "throne_room":
      stat = "xp_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.05;
      break;
    case "grand_library":
      stat = "spell_power_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.03;
      break;
    case "alchemist_tower":
      stat = "resource_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.04;
      break;
    case "knights_hall":
      stat = "unit_attack_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.05;
      break;
    case "royal_garden":
      stat = "food_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.06;
      break;
    case "dungeon":
      stat = "loot_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.03;
      break;
    case "treasury":
      stat = "gold_protection";
      value = 1 + (effectiveLevel - 1) * 0.05;
      break;
    case "wizards_sanctum":
      stat = "mana_regen_multiplier";
      value = 1 + (effectiveLevel - 1) * 0.04;
      break;
  }

  return { stat, value, description: def.perLevelBonus };
}

export function fcGetEnemiesDefeatedCount(): number {
  const s = ensureInit();
  return Object.values(s.enemiesDefeated).reduce((sum, count) => sum + count, 0);
}

export function fcGetTypeDefeatedCount(type: string): number {
  const s = ensureInit();
  const typeEnemies = FC_ENEMIES.filter((e) => e.type === type).map((e) => e.id);
  return typeEnemies.reduce((sum, id) => sum + (s.enemiesDefeated[id] ?? 0), 0);
}

export function fcGetSummary(): {
  level: number;
  kingdomName: string;
  kingdomTier: number;
  castlePower: number;
  totalUnits: number;
  spellsLearned: number;
  questsCompleted: number;
  activeAlliances: number;
  unlockedAchievements: number;
  totalAchievements: number;
  coins: number;
  streak: number;
} {
  const s = ensureInit();
  return {
    level: s.level,
    kingdomName: s.kingdomName,
    kingdomTier: s.kingdomTier,
    castlePower: fcGetCastlePower(),
    totalUnits: fcGetTotalUnits(),
    spellsLearned: fcGetLearnedSpells().length,
    questsCompleted: s.stats.totalQuestsCompleted,
    activeAlliances: fcGetActiveAllianceCount(),
    unlockedAchievements: fcGetUnlockedAchievements().length,
    totalAchievements: FC_ACHIEVEMENTS.length,
    coins: s.coins,
    streak: s.streak,
  };
}
