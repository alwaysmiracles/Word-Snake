// ============================================================================
// witch-coven-wire.ts — Witch Coven (女巫集会) Management Game Engine
// Pure logic & state management for potion brewing, spell casting, and sabbath
// gatherings. React ONLY in the default export hook.
// ============================================================================

// ─── Enums & Literal Types ─────────────────────────────────────────────────

export type WitchRole =
  | "high_priestess"
  | "herbalist"
  | "enchantress"
  | "oracle"
  | "necromancer"
  | "illusionist"
  | "elementalist"
  | "shadow_weaver";

export type IngredientRarity = "common" | "uncommon" | "rare" | "legendary" | "mythic";

export type MoonPhase =
  | "new_moon"
  | "waxing_crescent"
  | "first_quarter"
  | "waxing_gibbous"
  | "full_moon"
  | "waning_gibbous"
  | "last_quarter"
  | "waning_crescent";

export type CauldronTier = "iron" | "bronze" | "silver" | "gold" | "obsidian";

export type FamiliarType = "cat" | "raven" | "owl" | "toad" | "bat" | "spider";

export type FamiliarMood = "ecstatic" | "happy" | "content" | "restless" | "grumpy";

export type PotionCategory =
  | "healing"
  | "transformation"
  | "illusion"
  | "protection"
  | "cursed"
  | "wisdom"
  | "love"
  | "destruction";

export type SpellSchool =
  | "abjuration"
  | "conjuration"
  | "divination"
  | "enchantment"
  | "evocation"
  | "necromancy"
  | "transmutation"
  | "illusion";

export type RitualType =
  | "sabbath"
  | "esbat"
  | "initiation"
  | "binding"
  | "summoning"
  | "banishing"
  | "scrying"
  | "harvest";

export type BrewResultStatus = "success" | "failure" | "critical_success" | "explosion";

export type GardenPlotStatus = "empty" | "planted" | "growing" | "ready" | "withered";

export type AchievementTier = "bronze" | "silver" | "gold" | "platinum";

export type GatheringEventType =
  | "circle_dance"
  | "chanting"
  | "incense_burning"
  | "energy_channeling"
  | "trance_vision";

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface Ingredient {
  readonly id: string;
  readonly name: string;
  readonly rarity: IngredientRarity;
  readonly moonAffinity: MoonPhase[];
  readonly description: string;
}

export interface PotionRecipe {
  readonly id: string;
  readonly name: string;
  readonly category: PotionCategory;
  readonly ingredients: readonly Ingredient[];
  readonly brewTime: number; // seconds
  readonly difficulty: number; // 1-10
  readonly minCauldronTier: CauldronTier;
  readonly moonBonus: MoonPhase[];
  readonly effect: string;
  readonly xpReward: number;
  readonly goldReward: number;
}

export interface MagicalHerb {
  readonly id: string;
  readonly name: string;
  readonly growthTime: number; // seconds
  readonly moonBonus: MoonPhase[];
  readonly yieldRange: readonly [number, number];
  readonly potency: number; // 1-10
  readonly description: string;
}

export interface CauldronUpgrade {
  readonly tier: CauldronTier;
  readonly cost: number;
  readonly brewSpeedBonus: number; // percentage
  readonly successBonus: number; // percentage
  readonly maxSimultaneousBrews: number;
  readonly description: string;
}

export interface Spell {
  readonly id: string;
  readonly name: string;
  readonly school: SpellSchool;
  readonly manaCost: number;
  readonly castTime: number; // seconds
  readonly cooldown: number; // seconds
  readonly power: number; // 1-100
  readonly minLevel: number;
  readonly moonBonus: MoonPhase[];
  readonly description: string;
  readonly effect: string;
}

export interface Familiar {
  readonly type: FamiliarType;
  readonly name: string;
  readonly description: string;
  readonly bonusType: string;
  readonly baseBonus: number;
  readonly maxBond: number;
  readonly favoriteHerb: string;
}

export interface FamiliarBond {
  type: FamiliarType;
  bond: number;
  mood: FamiliarMood;
  lastFed: number; // timestamp
  abilities: string[];
}

export interface GardenPlot {
  herbId: string | null;
  status: GardenPlotStatus;
  plantedAt: number | null;
  yieldAmount: number;
  potencyBonus: number;
}

export interface BrewResult {
  potionId: string;
  status: BrewResultStatus;
  quality: number; // 1-100
  xpGained: number;
  goldGained: number;
  ingredientsUsed: string[];
  moonPhase: MoonPhase;
  timestamp: number;
}

export interface Achievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tier: AchievementTier;
  readonly requirement: string;
  readonly targetValue: number;
  readonly xpReward: number;
  readonly icon: string;
}

export interface Ritual {
  readonly type: RitualType;
  readonly name: string;
  readonly description: string;
  readonly minParticipants: number;
  readonly powerCost: number;
  readonly duration: number; // seconds
  readonly effect: string;
  readonly moonRequired: MoonPhase[];
  readonly xpReward: number;
}

export interface DailyChallenge {
  readonly id: string;
  readonly date: string; // ISO date string
  readonly potionId: string;
  readonly bonusMultiplier: number;
  readonly timeLimit: number; // seconds
  readonly specialIngredient: string | null;
  readonly reward: number;
}

export interface StreakData {
  current: number;
  best: number;
  lastDate: string | null;
  bonusMultiplier: number;
}

export interface WitchCovenState {
  witchName: string;
  role: WitchRole;
  level: number;
  xp: number;
  gold: number;
  mana: number;
  maxMana: number;
  reputation: number;
  cauldronTier: CauldronTier;
  familiarBond: FamiliarBond | null;
  gardenPlots: GardenPlot[];
  unlockedRecipes: string[];
  unlockedSpells: string[];
  unlockedAchievements: string[];
  brewHistory: BrewResult[];
  totalBrews: number;
  successfulBrews: number;
  totalSpellsCast: number;
  totalHerbsHarvested: number;
  totalRitualsPerformed: number;
  totalGoldEarned: number;
  streak: StreakData;
  currentBrewId: string | null;
  brewStartTime: number | null;
  activeSpellCooldowns: Record<string, number>;
  gatheringPower: number;
  inventory: Record<string, number>;
}

// ─── Constants: Witch Roles ────────────────────────────────────────────────

export const wcWitchRoles: readonly {
  readonly id: WitchRole;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly bonuses: Record<string, number>;
}[] = [
  {
    id: "high_priestess",
    name: "High Priestess",
    title: "大女祭司",
    description: "Leader of the coven, commanding the respect of all members. Excels in rituals and gathering power.",
    bonuses: { ritualPower: 25, gatheringPower: 20, reputation: 15, manaRegen: 10 },
  },
  {
    id: "herbalist",
    name: "Herbalist",
    title: "草药师",
    description: "Master of plants and potions. Herbs grow faster and yield more under her care.",
    bonuses: { herbGrowth: 30, herbYield: 25, brewSuccess: 15, potionQuality: 10 },
  },
  {
    id: "enchantress",
    name: "Enchantress",
    title: "附魔师",
    description: "Weaver of charms and enchantments. Spells gain additional potency and cost less mana.",
    bonuses: { spellPower: 25, manaCost: -20, enchantDuration: 30, brewSpeed: 10 },
  },
  {
    id: "oracle",
    name: "Oracle",
    title: "预言家",
    description: "Seer of past, present, and future. Gains bonus divination power and streak rewards.",
    bonuses: { divinationPower: 30, streakBonus: 25, xpBonus: 15, dailyBonus: 20 },
  },
  {
    id: "necromancer",
    name: "Necromancer",
    title: "死灵法师",
    description: "Speaker with the dead. Commands dark forces and gains power from the waning moon.",
    bonuses: { necroPower: 30, darkSpellPower: 25, deathResistance: 20, cursedPotion: 15 },
  },
  {
    id: "illusionist",
    name: "Illusionist",
    title: "幻术师",
    description: "Master of deception and mirages. Illusion spells are twice as potent under her guidance.",
    bonuses: { illusionPower: 30, brewSuccess: 15, goldBonus: 20, deception: 25 },
  },
  {
    id: "elementalist",
    name: "Elementalist",
    title: "元素师",
    description: "Commands fire, water, earth, and air. Elemental evocation spells gain massive bonuses.",
    bonuses: { elementalPower: 30, evocationPower: 20, potionQuality: 10, manaRegen: 15 },
  },
  {
    id: "shadow_weaver",
    name: "Shadow Weaver",
    title: "织影者",
    description: "Dances between light and darkness. Shadow magic and stealth are her domain.",
    bonuses: { shadowPower: 30, stealth: 25, brewSpeed: 15, curseResistance: 20 },
  },
] as const;

// ─── Constants: Ingredients ────────────────────────────────────────────────

export const wcIngredients: readonly Ingredient[] = [
  { id: "eye_of_newt", name: "Eye of Newt", rarity: "common", moonAffinity: ["full_moon"], description: "A staple of any witch's ingredient cabinet." },
  { id: "dragon_scale", name: "Dragon Scale", rarity: "legendary", moonAffinity: ["full_moon", "new_moon"], description: "Shed from ancient dragons during lunar eclipses." },
  { id: "bat_wing", name: "Bat Wing", rarity: "common", moonAffinity: ["waning_crescent"], description: "Collected under the cloak of darkness." },
  { id: "mandrake_root", name: "Mandrake Root", rarity: "uncommon", moonAffinity: ["full_moon"], description: "Screams when uprooted — handle with care." },
  { id: "wolfsbane", name: "Wolfsbane", rarity: "uncommon", moonAffinity: ["waning_gibbous"], description: "A powerful poison and medicine alike." },
  { id: "nightshade_berry", name: "Nightshade Berry", rarity: "rare", moonAffinity: ["new_moon"], description: "Deadly in large doses, transformative in small." },
  { id: "moonstone_dust", name: "Moonstone Dust", rarity: "rare", moonAffinity: ["full_moon", "waxing_gibbous"], description: "Ground from stones that have bathed in moonlight for centuries." },
  { id: "phoenix_feather", name: "Phoenix Feather", rarity: "mythic", moonAffinity: ["new_moon", "full_moon"], description: "Eternally burning, eternally regenerating." },
  { id: "unicorn_hair", name: "Unicorn Hair", rarity: "legendary", moonAffinity: ["waxing_crescent", "first_quarter"], description: "Pure white strands from a unicorn's mane." },
  { id: "toad_sweat", name: "Toad Sweat", rarity: "common", moonAffinity: ["waning_gibbous"], description: "Collected from enchanted toads at midnight." },
  { id: "mermaid_scale", name: "Mermaid Scale", rarity: "legendary", moonAffinity: ["full_moon"], description: "Shimmering scales that glow underwater." },
  { id: "raven_feather", name: "Raven Feather", rarity: "uncommon", moonAffinity: ["waning_crescent", "last_quarter"], description: "From a raven that has witnessed a death." },
  { id: "fairy_dust", name: "Fairy Dust", rarity: "rare", moonAffinity: ["waxing_gibbous", "full_moon"], description: "Fine glittering powder with unpredictable properties." },
  { id: "blood_moss", name: "Blood Moss", rarity: "uncommon", moonAffinity: ["new_moon", "waning_crescent"], description: "Grows in places where dark rituals were performed." },
  { id: "crystal_shard", name: "Crystal Shard", rarity: "uncommon", moonAffinity: ["first_quarter", "waxing_gibbous"], description: "Fractured from a larger enchanted crystal." },
  { id: "serpent_venom", name: "Serpent Venom", rarity: "rare", moonAffinity: ["waning_gibbous", "last_quarter"], description: "Harvested from basilisks and giant serpents." },
  { id: "witch_hazel", name: "Witch Hazel", rarity: "common", moonAffinity: ["last_quarter", "waning_crescent"], description: "A versatile herb used in many base potions." },
  { id: "ghost_essence", name: "Ghost Essence", rarity: "rare", moonAffinity: ["new_moon"], description: "Captured spirit energy from the recently departed." },
  { id: "starlight_dew", name: "Starlight Dew", rarity: "legendary", moonAffinity: ["full_moon", "waxing_gibbous"], description: "Collected at the intersection of moonlight and starlight." },
  { id: "hellfire_coal", name: "Hellfire Coal", rarity: "mythic", moonAffinity: ["new_moon"], description: "Embers from the deepest planes of the underworld." },
  { id: "silver_thread", name: "Silver Thread", rarity: "uncommon", moonAffinity: ["full_moon"], description: "Spun from moonlight by celestial spiders." },
  { id: "swamp_gas", name: "Swamp Gas", rarity: "common", moonAffinity: ["waning_crescent", "new_moon"], description: "Fluorescent gas from enchanted swamplands." },
  { id: "griffin_claw", name: "Griffin Claw", rarity: "legendary", moonAffinity: ["waxing_crescent"], description: "Sharp as steel and imbued with wind magic." },
  { id: "chimera_blood", name: "Chimera Blood", rarity: "mythic", moonAffinity: ["full_moon", "new_moon"], description: "A volatile substance of immense power." },
  { id: "willow_bark", name: "Willow Bark", rarity: "common", moonAffinity: ["waxing_gibbous"], description: "From weeping willows near magical springs." },
  { id: "amber_resin", name: "Amber Resin", rarity: "uncommon", moonAffinity: ["last_quarter"], description: "Fossilized tree sap with trapped ancient magic." },
] as const;

// ─── Constants: 30 Potion Recipes ─────────────────────────────────────────

export const wcPotionRecipes: readonly PotionRecipe[] = [
  {
    id: "healing_salve", name: "Healing Salve", category: "healing",
    ingredients: [wcIngredients[0], wcIngredients[21]],
    brewTime: 60, difficulty: 1, minCauldronTier: "iron",
    moonBonus: ["waxing_crescent"], effect: "Restores 50 health points", xpReward: 10, goldReward: 5,
  },
  {
    id: "mana_elixir", name: "Mana Elixir", category: "wisdom",
    ingredients: [wcIngredients[6], wcIngredients[14]],
    brewTime: 90, difficulty: 2, minCauldronTier: "iron",
    moonBonus: ["full_moon"], effect: "Restores 30 mana points", xpReward: 15, goldReward: 8,
  },
  {
    id: "invisibility_brew", name: "Invisibility Brew", category: "illusion",
    ingredients: [wcIngredients[11], wcIngredients[18], wcIngredients[20]],
    brewTime: 180, difficulty: 5, minCauldronTier: "bronze",
    moonBonus: ["new_moon"], effect: "Invisible for 60 seconds", xpReward: 50, goldReward: 30,
  },
  {
    id: "fire_resistance", name: "Fire Resistance", category: "protection",
    ingredients: [wcIngredients[15], wcIngredients[19]],
    brewTime: 120, difficulty: 3, minCauldronTier: "iron",
    moonBonus: ["waning_gibbous"], effect: "Immune to fire for 120 seconds", xpReward: 25, goldReward: 15,
  },
  {
    id: "truth_serum", name: "Truth Serum", category: "wisdom",
    ingredients: [wcIngredients[5], wcIngredients[6], wcIngredients[14]],
    brewTime: 150, difficulty: 4, minCauldronTier: "bronze",
    moonBonus: ["first_quarter"], effect: "Target cannot lie for 300 seconds", xpReward: 40, goldReward: 25,
  },
  {
    id: "love_philter", name: "Love Philter", category: "love",
    ingredients: [wcIngredients[12], wcIngredients[6], wcIngredients[23]],
    brewTime: 120, difficulty: 3, minCauldronTier: "iron",
    moonBonus: ["waxing_gibbous", "full_moon"], effect: "Target feels deep affection for 600 seconds", xpReward: 30, goldReward: 20,
  },
  {
    id: "strength_tonic", name: "Strength Tonic", category: "transformation",
    ingredients: [wcIngredients[4], wcIngredients[1], wcIngredients[15]],
    brewTime: 200, difficulty: 6, minCauldronTier: "bronze",
    moonBonus: ["full_moon"], effect: "Doubles physical strength for 300 seconds", xpReward: 60, goldReward: 35,
  },
  {
    id: "shadow_cloak", name: "Shadow Cloak Elixir", category: "illusion",
    ingredients: [wcIngredients[11], wcIngredients[13], wcIngredients[17]],
    brewTime: 240, difficulty: 7, minCauldronTier: "silver",
    moonBonus: ["new_moon", "waning_crescent"], effect: "Meld into shadows for 120 seconds", xpReward: 75, goldReward: 50,
  },
  {
    id: "poison_fang", name: "Poison Fang Draught", category: "cursed",
    ingredients: [wcIngredients[15], wcIngredients[4], wcIngredients[20]],
    brewTime: 180, difficulty: 6, minCauldronTier: "bronze",
    moonBonus: ["waning_gibbous"], effect: "Deals 80 poison damage over time", xpReward: 55, goldReward: 40,
  },
  {
    id: "dragon_breath", name: "Dragon Breath Potion", category: "destruction",
    ingredients: [wcIngredients[1], wcIngredients[19], wcIngredients[21]],
    brewTime: 300, difficulty: 8, minCauldronTier: "gold",
    moonBonus: ["full_moon"], effect: "Unleash a torrent of dragon fire", xpReward: 100, goldReward: 80,
  },
  {
    id: "frost_shield", name: "Frost Shield", category: "protection",
    ingredients: [wcIngredients[17], wcIngredients[14], wcIngredients[6]],
    brewTime: 150, difficulty: 4, minCauldronTier: "bronze",
    moonBonus: ["waning_crescent", "last_quarter"], effect: "Ice barrier absorbs 200 damage", xpReward: 40, goldReward: 25,
  },
  {
    id: "berserker_brew", name: "Berserker Brew", category: "transformation",
    ingredients: [wcIngredients[20], wcIngredients[4], wcIngredients[13]],
    brewTime: 180, difficulty: 5, minCauldronTier: "bronze",
    moonBonus: ["waning_gibbous", "last_quarter"], effect: "Rage mode: +50% damage, -30% defense", xpReward: 50, goldReward: 30,
  },
  {
    id: "phoenix_tears", name: "Phoenix Tears", category: "healing",
    ingredients: [wcIngredients[7], wcIngredients[6], wcIngredients[12]],
    brewTime: 360, difficulty: 9, minCauldronTier: "gold",
    moonBonus: ["full_moon", "new_moon"], effect: "Full heal + 30 seconds invulnerability", xpReward: 120, goldReward: 100,
  },
  {
    id: "fortune_tea", name: "Fortune Tea", category: "wisdom",
    ingredients: [wcIngredients[12], wcIngredients[23], wcIngredients[24]],
    brewTime: 100, difficulty: 2, minCauldronTier: "iron",
    moonBonus: ["first_quarter", "waxing_gibbous"], effect: "+20% luck for 600 seconds", xpReward: 20, goldReward: 12,
  },
  {
    id: "nightmare_vial", name: "Nightmare Vial", category: "cursed",
    ingredients: [wcIngredients[17], wcIngredients[20], wcIngredients[5]],
    brewTime: 240, difficulty: 7, minCauldronTier: "silver",
    moonBonus: ["new_moon"], effect: "Target plagued by nightmares for 480 seconds", xpReward: 70, goldReward: 45,
  },
  {
    id: "mermaid_scales_elixir", name: "Mermaid's Grace", category: "transformation",
    ingredients: [wcIngredients[10], wcIngredients[18], wcIngredients[23]],
    brewTime: 300, difficulty: 8, minCauldronTier: "gold",
    moonBonus: ["full_moon"], effect: "Water breathing + swim speed for 600 seconds", xpReward: 90, goldReward: 65,
  },
  {
    id: "thunder_potion", name: "Thunderbolt Tincture", category: "destruction",
    ingredients: [wcIngredients[22], wcIngredients[14], wcIngredients[19]],
    brewTime: 220, difficulty: 7, minCauldronTier: "silver",
    moonBonus: ["full_moon", "waxing_gibbous"], effect: "Lightning strike dealing 150 damage", xpReward: 80, goldReward: 55,
  },
  {
    id: "ward_breaker", name: "Ward Breaker", category: "destruction",
    ingredients: [wcIngredients[19], wcIngredients[1], wcIngredients[24]],
    brewTime: 250, difficulty: 8, minCauldronTier: "silver",
    moonBonus: ["last_quarter", "waning_gibbous"], effect: "Dispels all magical wards in radius", xpReward: 85, goldReward: 60,
  },
  {
    id: "silver_veil", name: "Silver Veil", category: "protection",
    ingredients: [wcIngredients[20], wcIngredients[6], wcIngredients[11]],
    brewTime: 180, difficulty: 6, minCauldronTier: "bronze",
    moonBonus: ["full_moon"], effect: "Reflect 50% of spells for 300 seconds", xpReward: 65, goldReward: 40,
  },
  {
    id: "berserk_antidote", name: "Berserk Antidote", category: "healing",
    ingredients: [wcIngredients[23], wcIngredients[21], wcIngredients[14]],
    brewTime: 80, difficulty: 2, minCauldronTier: "iron",
    moonBonus: ["last_quarter"], effect: "Cures rage and confusion effects", xpReward: 15, goldReward: 10,
  },
  {
    id: "charm_fog", name: "Charm Fog", category: "illusion",
    ingredients: [wcIngredients[21], wcIngredients[12], wcIngredients[11]],
    brewTime: 160, difficulty: 5, minCauldronTier: "bronze",
    moonBonus: ["waxing_crescent", "first_quarter"], effect: "Creates charming mist in 20m radius", xpReward: 45, goldReward: 28,
  },
  {
    id: "undead_command", name: "Command Undead", category: "cursed",
    ingredients: [wcIngredients[17], wcIngredients[13], wcIngredients[9]],
    brewTime: 280, difficulty: 8, minCauldronTier: "gold",
    moonBonus: ["new_moon", "waning_crescent"], effect: "Control undead for 300 seconds", xpReward: 95, goldReward: 70,
  },
  {
    id: "giant_growth", name: "Giant Growth", category: "transformation",
    ingredients: [wcIngredients[3], wcIngredients[12], wcIngredients[4]],
    brewTime: 200, difficulty: 6, minCauldronTier: "silver",
    moonBonus: ["waxing_gibbous"], effect: "Grow to triple size for 180 seconds", xpReward: 60, goldReward: 38,
  },
  {
    id: "crystal_vision", name: "Crystal Vision", category: "wisdom",
    ingredients: [wcIngredients[14], wcIngredients[18], wcIngredients[12]],
    brewTime: 200, difficulty: 6, minCauldronTier: "silver",
    moonBonus: ["full_moon", "first_quarter"], effect: "See through all illusions for 600 seconds", xpReward: 65, goldReward: 42,
  },
  {
    id: "blood_pact", name: "Blood Pact Elixir", category: "cursed",
    ingredients: [wcIngredients[22], wcIngredients[13], wcIngredients[5]],
    brewTime: 320, difficulty: 9, minCauldronTier: "gold",
    moonBonus: ["new_moon"], effect: "Bind a soul contract — shared fate", xpReward: 110, goldReward: 85,
  },
  {
    id: "fairy_wine", name: "Fairy Wine", category: "love",
    ingredients: [wcIngredients[12], wcIngredients[23], wcIngredients[24]],
    brewTime: 110, difficulty: 3, minCauldronTier: "iron",
    moonBonus: ["waxing_gibbous", "full_moon"], effect: "Euphoria and merriment for 300 seconds", xpReward: 28, goldReward: 18,
  },
  {
    id: "stone_skin", name: "Stone Skin Salve", category: "protection",
    ingredients: [wcIngredients[1], wcIngredients[14], wcIngredients[3]],
    brewTime: 170, difficulty: 5, minCauldronTier: "bronze",
    moonBonus: ["waning_gibbous", "last_quarter"], effect: "+80 armor for 300 seconds", xpReward: 48, goldReward: 32,
  },
  {
    id: "wind_walker", name: "Wind Walker", category: "transformation",
    ingredients: [wcIngredients[22], wcIngredients[18], wcIngredients[8]],
    brewTime: 260, difficulty: 7, minCauldronTier: "silver",
    moonBonus: ["waxing_crescent", "waxing_gibbous"], effect: "Fly at great speed for 180 seconds", xpReward: 75, goldReward: 50,
  },
  {
    id: "plague_brew", name: "Plague Brew", category: "cursed",
    ingredients: [wcIngredients[20], wcIngredients[9], wcIngredients[4]],
    brewTime: 300, difficulty: 9, minCauldronTier: "gold",
    moonBonus: ["waning_gibbous", "new_moon"], effect: "Spreads plague — AoE damage over 600 seconds", xpReward: 110, goldReward: 90,
  },
  {
    id: "ambrosia", name: "Ambrosia of the Gods", category: "healing",
    ingredients: [wcIngredients[8], wcIngredients[7], wcIngredients[18], wcIngredients[6]],
    brewTime: 420, difficulty: 10, minCauldronTier: "obsidian",
    moonBonus: ["full_moon"], effect: "Full restore all stats + temporary invincibility", xpReward: 150, goldReward: 120,
  },
] as const;

// ─── Constants: 12 Magical Herbs ──────────────────────────────────────────

export const wcMagicalHerbs: readonly MagicalHerb[] = [
  { id: "moonbloom", name: "Moonbloom", growthTime: 300, moonBonus: ["full_moon"], yieldRange: [2, 5], potency: 7, description: "Glowing flowers that bloom only in moonlight." },
  { id: "shadowroot", name: "Shadowroot", growthTime: 360, moonBonus: ["new_moon"], yieldRange: [1, 3], potency: 8, description: "Dark roots that absorb shadow magic from the earth." },
  { id: "starpetal", name: "Starpetal", growthTime: 240, moonBonus: ["waxing_gibbous", "full_moon"], yieldRange: [3, 6], potency: 5, description: "Delicate petals that shimmer like distant stars." },
  { id: "bloodthorn", name: "Bloodthorn", growthTime: 420, moonBonus: ["waning_gibbous"], yieldRange: [1, 2], potency: 9, description: "Thorny vines that thirst for magical energy." },
  { id: "dreamweed", name: "Dreamweed", growthTime: 300, moonBonus: ["waning_crescent", "new_moon"], yieldRange: [2, 4], potency: 6, description: "Induces vivid prophetic dreams when consumed." },
  { id: "thunderleaf", name: "Thunderleaf", growthTime: 350, moonBonus: ["first_quarter"], yieldRange: [2, 5], potency: 7, description: "Crackles with static electricity when touched." },
  { id: "sageshroom", name: "Sageshroom", growthTime: 280, moonBonus: ["last_quarter"], yieldRange: [2, 4], potency: 6, description: "A mushroom that grants enhanced wisdom." },
  { id: "frostfern", name: "Frostfern", growthTime: 320, moonBonus: ["waning_crescent"], yieldRange: [2, 5], potency: 7, description: "Frozen fronds that never melt, even in summer." },
  { id: "sunblossom", name: "Sunblossom", growthTime: 200, moonBonus: ["waxing_crescent", "first_quarter"], yieldRange: [3, 7], potency: 4, description: "Radiates warmth and light like a small sun." },
  { id: "voidmoss", name: "Voidmoss", growthTime: 450, moonBonus: ["new_moon"], yieldRange: [1, 2], potency: 10, description: "Grows in the spaces between dimensions." },
  { id: "emberroot", name: "Emberroot", growthTime: 340, moonBonus: ["waning_gibbous", "last_quarter"], yieldRange: [2, 4], potency: 7, description: "Smolders eternally, never burning out." },
  { id: "spiritvein", name: "Spiritvein", growthTime: 380, moonBonus: ["full_moon", "new_moon"], yieldRange: [1, 3], potency: 9, description: "Channels spirits of the forest through its veins." },
] as const;

// ─── Constants: 5 Cauldron Upgrades ───────────────────────────────────────

export const wcCauldronUpgrades: readonly CauldronUpgrade[] = [
  {
    tier: "iron", cost: 0, brewSpeedBonus: 0, successBonus: 0, maxSimultaneousBrews: 1,
    description: "A basic iron cauldron — every witch starts here.",
  },
  {
    tier: "bronze", cost: 200, brewSpeedBonus: 15, successBonus: 10, maxSimultaneousBrews: 2,
    description: "Bronze construction allows more even heat distribution.",
  },
  {
    tier: "silver", cost: 600, brewSpeedBonus: 30, successBonus: 20, maxSimultaneousBrews: 2,
    description: "Silver amplifies lunar energies during brewing.",
  },
  {
    tier: "gold", cost: 1500, brewSpeedBonus: 50, successBonus: 35, maxSimultaneousBrews: 3,
    description: "Gilded with alchemical gold — the mark of a master brewer.",
  },
  {
    tier: "obsidian", cost: 4000, brewSpeedBonus: 75, successBonus: 50, maxSimultaneousBrews: 4,
    description: "Forged from volcanic glass — absorbs and channels raw magical power.",
  },
] as const;

// ─── Constants: 20 Spells ─────────────────────────────────────────────────

export const wcSpells: readonly Spell[] = [
  { id: "spark", name: "Spark", school: "evocation", manaCost: 5, castTime: 1, cooldown: 2, power: 10, minLevel: 1, moonBonus: ["full_moon"], description: "A small burst of flame.", effect: "Deals 10 fire damage" },
  { id: "frost_bite", name: "Frost Bite", school: "evocation", manaCost: 8, castTime: 2, cooldown: 4, power: 15, minLevel: 2, moonBonus: ["waning_crescent"], description: "A chilling touch that freezes.", effect: "Deals 15 ice damage + slow" },
  { id: "shield", name: "Arcane Shield", school: "abjuration", manaCost: 15, castTime: 2, cooldown: 10, power: 20, minLevel: 3, moonBonus: ["waxing_gibbous"], description: "A shimmering barrier of force.", effect: "Absorbs 50 damage" },
  { id: "hex", name: "Minor Hex", school: "enchantment", manaCost: 12, castTime: 3, cooldown: 8, power: 18, minLevel: 3, moonBonus: ["waning_gibbous"], description: "A curse that weakens the target.", effect: "-20% damage for 10s" },
  { id: "summon_fog", name: "Summon Fog", school: "conjuration", manaCost: 10, castTime: 3, cooldown: 15, power: 12, minLevel: 4, moonBonus: ["waning_crescent"], description: "Thick fog obscures vision.", effect: "Blinds enemies in 15m radius" },
  { id: "reveal", name: "Reveal Secrets", school: "divination", manaCost: 20, castTime: 5, cooldown: 30, power: 25, minLevel: 5, moonBonus: ["first_quarter"], description: "Uncovers hidden truths.", effect: "Reveal hidden items and traps" },
  { id: "drain_life", name: "Drain Life", school: "necromancy", manaCost: 25, castTime: 3, cooldown: 12, power: 30, minLevel: 6, moonBonus: ["new_moon"], description: "Steal life force from the living.", effect: "Deal 30 damage, heal self for 15" },
  { id: "mirror_image", name: "Mirror Image", school: "illusion", manaCost: 30, castTime: 2, cooldown: 20, power: 22, minLevel: 7, moonBonus: ["waxing_crescent"], description: "Create illusory duplicates.", effect: "3 decoys confuse enemies" },
  { id: "fireball", name: "Fireball", school: "evocation", manaCost: 35, castTime: 3, cooldown: 8, power: 45, minLevel: 8, moonBonus: ["full_moon"], description: "A massive sphere of flame.", effect: "AoE 45 fire damage in 10m" },
  { id: "raise_dead", name: "Raise Dead", school: "necromancy", manaCost: 50, castTime: 8, cooldown: 60, power: 55, minLevel: 10, moonBonus: ["new_moon"], description: "Animate a fallen creature.", effect: "Raise a skeletal minion" },
  { id: "blink", name: "Blink", school: "transmutation", manaCost: 20, castTime: 1, cooldown: 6, power: 15, minLevel: 5, moonBonus: ["last_quarter"], description: "Short-range teleportation.", effect: "Teleport 20m instantly" },
  { id: "charm_person", name: "Charm Person", school: "enchantment", manaCost: 18, castTime: 2, cooldown: 15, power: 28, minLevel: 6, moonBonus: ["waxing_gibbous"], description: "Make a humanoid friendly.", effect: "Target becomes ally for 30s" },
  { id: "counterspell", name: "Counterspell", school: "abjuration", manaCost: 40, castTime: 1, cooldown: 10, power: 50, minLevel: 9, moonBonus: ["full_moon"], description: "Interrupt a spell being cast.", effect: "Negate any spell below level 5" },
  { id: "scrying_eye", name: "Scrying Eye", school: "divination", manaCost: 25, castTime: 5, cooldown: 45, power: 30, minLevel: 8, moonBonus: ["first_quarter"], description: "Remote viewing through an eye.", effect: "See any location for 60s" },
  { id: "polymorph", name: "Polymorph", school: "transmutation", manaCost: 45, castTime: 4, cooldown: 30, power: 40, minLevel: 12, moonBonus: ["waxing_gibbous"], description: "Transform target into an animal.", effect: "Target becomes a sheep for 15s" },
  { id: "meteor_strike", name: "Meteor Strike", school: "evocation", manaCost: 80, castTime: 6, cooldown: 60, power: 80, minLevel: 18, moonBonus: ["full_moon"], description: "Call down a meteor from the sky.", effect: "Massive AoE 80 damage" },
  { id: "soul_trap", name: "Soul Trap", school: "necromancy", manaCost: 60, castTime: 5, cooldown: 45, power: 65, minLevel: 15, moonBonus: ["new_moon", "waning_crescent"], description: "Bind a soul to a gem.", effect: "Capture soul on death" },
  { id: "phantom_knight", name: "Phantom Knight", school: "conjuration", manaCost: 55, castTime: 4, cooldown: 40, power: 60, minLevel: 14, moonBonus: ["waning_gibbous"], description: "Summon a spectral warrior.", effect: "Knight fights for 60s" },
  { id: "time_warp", name: "Time Warp", school: "transmutation", manaCost: 70, castTime: 5, cooldown: 90, power: 75, minLevel: 20, moonBonus: ["full_moon", "new_moon"], description: "Slow time for everyone else.", effect: "All enemies slowed 50% for 10s" },
  { id: "apocalypse", name: "Apocalypse", school: "evocation", manaCost: 100, castTime: 10, cooldown: 300, power: 100, minLevel: 30, moonBonus: ["full_moon"], description: "Unleash devastating magical energy.", effect: "Catastrophic AoE 100 damage" },
] as const;

// ─── Constants: 6 Familiar Types ──────────────────────────────────────────

export const wcFamiliarTypes: readonly Familiar[] = [
  {
    type: "cat", name: "Shadowmaw", description: "A sleek black cat with glowing green eyes that sees through all illusions.",
    bonusType: "illusion_resistance", baseBonus: 15, maxBond: 100, favoriteHerb: "dreamweed",
  },
  {
    type: "raven", name: "Nevermore", description: "An ancient raven that whispers prophecies and gathers secrets from the wind.",
    bonusType: "divination_power", baseBonus: 20, maxBond: 100, favoriteHerb: "shadowroot",
  },
  {
    type: "owl", name: "Moonfeather", description: "A great horned owl with silver plumage that shines under moonlight.",
    bonusType: "night_vision", baseBonus: 15, maxBond: 100, favoriteHerb: "starpetal",
  },
  {
    type: "toad", name: "Grimble", description: "A warty toad of surprising wisdom, said to be a transformed prince.",
    bonusType: "brew_success", baseBonus: 10, maxBond: 100, favoriteHerb: "bloodthorn",
  },
  {
    type: "bat", name: "Whisperwing", description: "A fruit bat with enormous ears that can detect magical vibrations.",
    bonusType: "detection_range", baseBonus: 18, maxBond: 100, favoriteHerb: "voidmoss",
  },
  {
    type: "spider", name: "Silkweaver", description: "A large orb-weaver spider that spins magical webs of enchanted silk.",
    bonusType: "trap_power", baseBonus: 16, maxBond: 100, favoriteHerb: "moonbloom",
  },
] as const;

// ─── Constants: Moon Phases ───────────────────────────────────────────────

export const wcMoonPhases: readonly {
  readonly phase: MoonPhase;
  readonly name: string;
  readonly nameCN: string;
  readonly magicMultiplier: number;
  readonly description: string;
  readonly dominantSchool: SpellSchool;
}[] = [
  { phase: "new_moon", name: "New Moon", nameCN: "新月", magicMultiplier: 0.6, description: "Darkness reigns. Necromancy and dark arts are amplified.", dominantSchool: "necromancy" },
  { phase: "waxing_crescent", name: "Waxing Crescent", nameCN: "蛾眉月", magicMultiplier: 0.75, description: "New beginnings. Growth and creation magic flourishes.", dominantSchool: "transmutation" },
  { phase: "first_quarter", name: "First Quarter", nameCN: "上弦月", magicMultiplier: 0.85, description: "Decision and action. Divination clarity is highest.", dominantSchool: "divination" },
  { phase: "waxing_gibbous", name: "Waxing Gibbous", nameCN: "盈凸月", magicMultiplier: 1.0, description: "Approaching full power. Enchantment magic builds.", dominantSchool: "enchantment" },
  { phase: "full_moon", name: "Full Moon", nameCN: "满月", magicMultiplier: 1.5, description: "Peak magical energy. All spells at maximum potency.", dominantSchool: "evocation" },
  { phase: "waning_gibbous", name: "Waning Gibbous", nameCN: "亏凸月", magicMultiplier: 0.9, description: "Sharing wisdom. Teaching and brewing excel.", dominantSchool: "abjuration" },
  { phase: "last_quarter", name: "Last Quarter", nameCN: "下弦月", magicMultiplier: 0.8, description: "Release and forgiveness. Banishing is most potent.", dominantSchool: "conjuration" },
  { phase: "waning_crescent", name: "Waning Crescent", nameCN: "残月", magicMultiplier: 0.65, description: "Surrender to mystery. Illusion magic is amplified.", dominantSchool: "illusion" },
] as const;

// ─── Constants: 15 Achievements ───────────────────────────────────────────

export const wcAchievements: readonly Achievement[] = [
  { id: "first_brew", name: "First Brew", description: "Brew your very first potion.", tier: "bronze", requirement: "totalBrews", targetValue: 1, xpReward: 20, icon: "🧪" },
  { id: "apprentice_brewer", name: "Apprentice Brewer", description: "Brew 10 potions.", tier: "bronze", requirement: "totalBrews", targetValue: 10, xpReward: 50, icon: "⚗️" },
  { id: "master_brewer", name: "Master Brewer", description: "Brew 50 potions.", tier: "silver", requirement: "totalBrews", targetValue: 50, xpReward: 150, icon: "🏺" },
  { id: "legendary_alchemist", name: "Legendary Alchemist", description: "Brew 200 potions.", tier: "gold", requirement: "totalBrews", targetValue: 200, xpReward: 500, icon: "🏆" },
  { id: "herbalist_apprentice", name: "Herbalist Apprentice", description: "Harvest 20 herbs.", tier: "bronze", requirement: "totalHerbsHarvested", targetValue: 20, xpReward: 30, icon: "🌿" },
  { id: "green_thumb", name: "Green Thumb", description: "Harvest 100 herbs.", tier: "silver", requirement: "totalHerbsHarvested", targetValue: 100, xpReward: 100, icon: "🌱" },
  { id: "first_spell", name: "First Spell", description: "Cast your first spell.", tier: "bronze", requirement: "totalSpellsCast", targetValue: 1, xpReward: 15, icon: "✨" },
  { id: "spell_weaver", name: "Spell Weaver", description: "Cast 50 spells.", tier: "silver", requirement: "totalSpellsCast", targetValue: 50, xpReward: 120, icon: "🌟" },
  { id: "archmage", name: "Archmage", description: "Cast 200 spells.", tier: "gold", requirement: "totalSpellsCast", targetValue: 200, xpReward: 400, icon: "💫" },
  { id: "streak_3", name: "Consistent Coven", description: "Maintain a 3-day brew streak.", tier: "bronze", requirement: "streakBest", targetValue: 3, xpReward: 25, icon: "🔥" },
  { id: "streak_7", name: "Dedicated Witch", description: "Maintain a 7-day brew streak.", tier: "silver", requirement: "streakBest", targetValue: 7, xpReward: 75, icon: "⚡" },
  { id: "streak_30", name: "Eternal Flame", description: "Maintain a 30-day brew streak.", tier: "platinum", requirement: "streakBest", targetValue: 30, xpReward: 500, icon: "👑" },
  { id: "ritual_master", name: "Ritual Master", description: "Perform 20 rituals.", tier: "gold", requirement: "totalRitualsPerformed", targetValue: 20, xpReward: 200, icon: "🌙" },
  { id: "gold_hoarder", name: "Gold Hoarder", description: "Earn 5,000 gold total.", tier: "silver", requirement: "totalGoldEarned", targetValue: 5000, xpReward: 100, icon: "💰" },
  { id: "obsidian_cauldron", name: "Obsidian Mastery", description: "Upgrade to an obsidian cauldron.", tier: "platinum", requirement: "cauldronTier", targetValue: 1, xpReward: 1000, icon: "🖤" },
] as const;

// ─── Constants: Rituals ───────────────────────────────────────────────────

export const wcRituals: readonly Ritual[] = [
  { type: "sabbath", name: "Grand Sabbath", description: "The great gathering under the full moon for maximum power.", minParticipants: 4, powerCost: 100, duration: 3600, effect: "+50% magic power for 1 hour", moonRequired: ["full_moon"], xpReward: 100 },
  { type: "esbat", name: "Lunar Esbat", description: "Monthly lunar celebration to honor the moon's cycle.", minParticipants: 2, powerCost: 30, duration: 1800, effect: "+25% mana regeneration for 30 min", moonRequired: ["full_moon", "new_moon"], xpReward: 40 },
  { type: "initiation", name: "Initiation Rite", description: "Welcome a new witch into the coven.", minParticipants: 3, powerCost: 50, duration: 600, effect: "Unlock new coven abilities", moonRequired: ["waxing_crescent"], xpReward: 60 },
  { type: "binding", name: "Binding Circle", description: "Bind magical energies into a protective circle.", minParticipants: 2, powerCost: 40, duration: 1200, effect: "Create a warding circle for 20 min", moonRequired: ["waning_gibbous"], xpReward: 50 },
  { type: "summoning", name: "Summoning Ritual", description: "Call forth a spirit entity from beyond the veil.", minParticipants: 4, powerCost: 80, duration: 900, effect: "Summon a spirit familiar", moonRequired: ["new_moon"], xpReward: 80 },
  { type: "banishing", name: "Banishing Rite", description: "Drive away evil spirits and curses.", minParticipants: 3, powerCost: 60, duration: 600, effect: "Remove all curses in area", moonRequired: ["last_quarter", "waning_crescent"], xpReward: 55 },
  { type: "scrying", name: "Scrying Circle", description: "Peer into the future through a shared vision.", minParticipants: 2, powerCost: 35, duration: 480, effect: "Reveal next daily challenge early", moonRequired: ["first_quarter"], xpReward: 35 },
  { type: "harvest", name: "Harvest Moon Ritual", description: "Celebrate and amplify the garden's bounty.", minParticipants: 3, powerCost: 45, duration: 600, effect: "Double all herb yields for 30 min", moonRequired: ["waxing_gibbous", "full_moon"], xpReward: 65 },
] as const;

// ─── Utility: Moon Phase from Date ────────────────────────────────────────

const MOON_PHASE_ORDER: readonly MoonPhase[] = [
  "new_moon", "waxing_crescent", "first_quarter", "waxing_gibbous",
  "full_moon", "waning_gibbous", "last_quarter", "waning_crescent",
];

export function wcGetMoonPhaseFromDate(date: Date): MoonPhase {
  // Synodic month ≈ 29.53 days; reference full moon Jan 6, 2000
  const SYNODIC_PERIOD = 29.53058770576;
  const REFERENCE_FULL_MOON = new Date("2000-01-06T18:14:00Z");
  const daysSinceReference = (date.getTime() - REFERENCE_FULL_MOON.getTime()) / (1000 * 60 * 60 * 24);
  const moonAge = ((daysSinceReference % SYNODIC_PERIOD) + SYNODIC_PERIOD) % SYNODIC_PERIOD;
  const phaseIndex = Math.floor((moonAge / SYNODIC_PERIOD) * 8) % 8;
  return MOON_PHASE_ORDER[phaseIndex];
}

// ─── Utility: Random in Range ─────────────────────────────────────────────

function wcRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function wcRandomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

// ─── Pure Functions: XP & Leveling ────────────────────────────────────────

export function wcCalculateXpForLevel(level: number): number {
  // Quadratic scaling: level^2.5 * 10
  return Math.floor(Math.pow(level, 2.5) * 10);
}

export function wcCalculateWitchLevel(totalXp: number): number {
  let level = 1;
  while (level < 50 && totalXp >= wcCalculateXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

export function wcLevelUpRewards(level: number): { maxMana: number; gold: number; unlocks: string[] } {
  const maxMana = 50 + level * 10;
  const gold = level * 5;
  const unlocks: string[] = [];

  if (level === 3) unlocks.push("spell:shield");
  if (level === 5) unlocks.push("spell:reveal");
  if (level === 8) unlocks.push("spell:fireball");
  if (level === 10) unlocks.push("spell:raise_dead");
  if (level === 12) unlocks.push("spell:polymorph");
  if (level === 15) unlocks.push("recipe:phoenix_tears");
  if (level === 18) unlocks.push("spell:meteor_strike");
  if (level === 20) unlocks.push("spell:time_warp");
  if (level === 25) unlocks.push("cauldron:gold");
  if (level === 30) unlocks.push("spell:apocalypse");
  if (level === 35) unlocks.push("recipe:ambrosia");
  if (level === 40) unlocks.push("cauldron:obsidian");
  if (level === 45) unlocks.push("ritual:summoning");
  if (level === 50) unlocks.push("achievement:obsidian_cauldron");

  return { maxMana, gold, unlocks };
}

// ─── Pure Functions: Moon Bonus ───────────────────────────────────────────

export function wcCalculateMoonBonus(currentPhase: MoonPhase, bonusPhases: readonly MoonPhase[]): number {
  if (bonusPhases.includes(currentPhase)) {
    const phaseData = wcMoonPhases.find(p => p.phase === currentPhase);
    return phaseData ? phaseData.magicMultiplier : 1.0;
  }
  return 1.0;
}

export function wcGetOptimalBrewPhase(recipe: PotionRecipe): MoonPhase[] {
  return [...recipe.moonBonus];
}

// ─── Pure Functions: Familiar ─────────────────────────────────────────────

export function wcGetFamiliarBonus(bond: FamiliarBond | null, bonusType: string): number {
  if (!bond) return 0;
  const familiar = wcFamiliarTypes.find(f => f.type === bond.type);
  if (!familiar || familiar.bonusType !== bonusType) return 0;
  const bondRatio = bond.bond / familiar.maxBond;
  return Math.floor(familiar.baseBonus * bondRatio);
}

export function wcGetFamiliarMood(bond: FamiliarBond): FamiliarMood {
  const bondRatio = bond.bond / 100;
  if (bondRatio >= 0.9) return "ecstatic";
  if (bondRatio >= 0.7) return "happy";
  if (bondRatio >= 0.5) return "content";
  if (bondRatio >= 0.3) return "restless";
  return "grumpy";
}

export function wcGetFamiliarAffinity(type: FamiliarType, herbId: string): number {
  const familiar = wcFamiliarTypes.find(f => f.type === type);
  if (!familiar) return 0;
  return familiar.favoriteHerb === herbId ? 50 : 0;
}

// ─── Pure Functions: Role Bonuses ─────────────────────────────────────────

export function wcGetRoleBonus(role: WitchRole, bonusKey: string): number {
  const roleData = wcWitchRoles.find(r => r.id === role);
  if (!roleData) return 0;
  return roleData.bonuses[bonusKey] ?? 0;
}

export function wcGetRoleDescription(role: WitchRole): string {
  return wcWitchRoles.find(r => r.id === role)?.description ?? "";
}

// ─── Pure Functions: Cauldron ─────────────────────────────────────────────

export function wcGetCauldronUpgrade(tier: CauldronTier): CauldronUpgrade {
  return wcCauldronUpgrades.find(c => c.tier === tier) ?? wcCauldronUpgrades[0];
}

export function wcCalculateBrewTime(baseTime: number, cauldronTier: CauldronTier): number {
  const upgrade = wcGetCauldronUpgrade(cauldronTier);
  const speedMultiplier = 1 - upgrade.brewSpeedBonus / 100;
  return Math.max(10, Math.floor(baseTime * speedMultiplier));
}

export function wcReduceBrewTime(baseTime: number, role: WitchRole, cauldronTier: CauldronTier, familiarBond: FamiliarBond | null): number {
  let adjusted = wcCalculateBrewTime(baseTime, cauldronTier);
  const enchantressBonus = wcGetRoleBonus(role, "brewSpeed");
  if (enchantressBonus > 0) {
    adjusted = Math.max(10, Math.floor(adjusted * (1 - enchantressBonus / 100)));
  }
  const familiarSpeedBonus = wcGetFamiliarBonus(familiarBond, "brew_speed");
  if (familiarSpeedBonus > 0) {
    adjusted = Math.max(10, Math.floor(adjusted * (1 - familiarSpeedBonus / 100)));
  }
  return adjusted;
}

// ─── Pure Functions: Brew Logic ───────────────────────────────────────────

export function wcCalculateBrewSuccess(
  recipe: PotionRecipe,
  cauldronTier: CauldronTier,
  role: WitchRole,
  level: number,
  moonPhase: MoonPhase,
  familiarBond: FamiliarBond | null,
): number {
  let base = 70;

  // Cauldron bonus
  const cauldron = wcGetCauldronUpgrade(cauldronTier);
  base += cauldron.successBonus;

  // Role bonus
  base += wcGetRoleBonus(role, "brewSuccess");

  // Level scaling (diminishing returns)
  base += Math.min(15, level * 0.3);

  // Moon bonus
  if (recipe.moonBonus.includes(moonPhase)) {
    base += 10;
  }

  // Familiar bonus
  const famBonus = wcGetFamiliarBonus(familiarBond, "brew_success");
  base += famBonus;

  // Difficulty penalty
  base -= recipe.difficulty * 2.5;

  return Math.max(5, Math.min(99, Math.floor(base)));
}

export function wcValidateIngredients(
  recipe: PotionRecipe,
  inventory: Record<string, number>,
): boolean {
  for (const ingredient of recipe.ingredients) {
    const count = inventory[ingredient.id] ?? 0;
    if (count < 1) return false;
  }
  return true;
}

export function wcCanBrewPotion(
  recipe: PotionRecipe,
  state: WitchCovenState,
): boolean {
  if (state.cauldronTier !== recipe.minCauldronTier) {
    const cauldronIndex = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
    const requiredIndex = wcCauldronUpgrades.findIndex(c => c.tier === recipe.minCauldronTier);
    if (cauldronIndex < requiredIndex) return false;
  }
  if (!wcValidateIngredients(recipe, state.inventory)) return false;
  if (state.currentBrewId !== null) return false;
  return true;
}

export function wcCalculateBrewCost(recipe: PotionRecipe): Record<string, number> {
  const cost: Record<string, number> = {};
  for (const ingredient of recipe.ingredients) {
    cost[ingredient.id] = (cost[ingredient.id] ?? 0) + 1;
  }
  return cost;
}

export function wcCalculateBrewQuality(
  baseSuccess: number,
  role: WitchRole,
  moonPhase: MoonPhase,
  recipe: PotionRecipe,
): number {
  let quality = baseSuccess;

  // Role bonus for potion quality
  quality += wcGetRoleBonus(role, "potionQuality");

  // Moon bonus for quality
  if (recipe.moonBonus.includes(moonPhase)) {
    quality += 15;
  }

  // Random variance ±15
  quality += wcRandomInt(-15, 15);

  return Math.max(1, Math.min(100, Math.floor(quality)));
}

export function wcBrewPotion(
  recipeId: string,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): { result: BrewResult; newState: WitchCovenState } | null {
  const recipe = wcPotionRecipes.find(r => r.id === recipeId);
  if (!recipe) return null;

  if (!wcCanBrewPotion(recipe, state)) return null;

  const successChance = wcCalculateBrewSuccess(
    recipe, state.cauldronTier, state.role, state.level, moonPhase, state.familiarBond,
  );

  const roll = wcRandomInt(1, 100);
  let status: BrewResultStatus;
  let quality: number;
  let xpGained: number;
  let goldGained: number;

  if (roll <= 5) {
    status = "critical_success";
    quality = Math.min(100, wcCalculateBrewQuality(successChance + 20, state.role, moonPhase, recipe));
    xpGained = Math.floor(recipe.xpReward * 2.0);
    goldGained = Math.floor(recipe.goldReward * 2.0);
  } else if (roll <= successChance) {
    status = "success";
    quality = wcCalculateBrewQuality(successChance, state.role, moonPhase, recipe);
    xpGained = recipe.xpReward;
    goldGained = recipe.goldReward;
  } else if (roll >= 97) {
    status = "explosion";
    quality = 0;
    xpGained = 2;
    goldGained = 0;
  } else {
    status = "failure";
    quality = Math.max(0, wcCalculateBrewQuality(successChance - 30, state.role, moonPhase, recipe));
    xpGained = Math.floor(recipe.xpReward * 0.2);
    goldGained = 0;
  }

  // Streak bonus
  const streakMultiplier = 1 + (state.streak.bonusMultiplier / 100);
  xpGained = Math.floor(xpGained * streakMultiplier);
  if (status === "success" || status === "critical_success") {
    goldGained = Math.floor(goldGained * streakMultiplier);
  }

  // Role XP bonus
  const xpBonus = 1 + wcGetRoleBonus(state.role, "xpBonus") / 100;
  xpGained = Math.floor(xpGained * xpBonus);

  const ingredientsUsed = recipe.ingredients.map(i => i.id);

  // Consume ingredients
  const newInventory = { ...state.inventory };
  for (const ing of recipe.ingredients) {
    newInventory[ing.id] = Math.max(0, (newInventory[ing.id] ?? 0) - 1);
  }

  const result: BrewResult = {
    potionId: recipe.id,
    status,
    quality,
    xpGained,
    goldGained,
    ingredientsUsed,
    moonPhase,
    timestamp: now,
  };

  const newBrewHistory = [...state.brewHistory, result].slice(-50);

  const newState: WitchCovenState = {
    ...state,
    xp: state.xp + xpGained,
    gold: state.gold + goldGained,
    inventory: newInventory,
    brewHistory: newBrewHistory,
    totalBrews: state.totalBrews + 1,
    successfulBrews: state.successfulBrews + (status === "success" || status === "critical_success" ? 1 : 0),
    totalGoldEarned: state.totalGoldEarned + goldGained,
    currentBrewId: null,
    brewStartTime: null,
  };

  return { result, newState };
}

// ─── Pure Functions: Spell Logic ──────────────────────────────────────────

export function wcCalculateSpellPower(
  spell: Spell,
  role: WitchRole,
  level: number,
  moonPhase: MoonPhase,
  familiarBond: FamiliarBond | null,
): number {
  let power = spell.power;

  // Level scaling
  power += Math.floor((level - spell.minLevel) * 1.5);

  // Role bonuses
  const spellSchool = spell.school;
  if (role === "enchantress") power += wcGetRoleBonus(role, "spellPower");
  if (role === "necromancer" && spellSchool === "necromancy") power += wcGetRoleBonus(role, "darkSpellPower");
  if (role === "illusionist" && spellSchool === "illusion") power += wcGetRoleBonus(role, "illusionPower");
  if (role === "elementalist" && spellSchool === "evocation") power += wcGetRoleBonus(role, "elementalPower") + wcGetRoleBonus(role, "evocationPower");
  if (role === "shadow_weaver" && spellSchool === "illusion") power += wcGetRoleBonus(role, "shadowPower");

  // Moon bonus
  if (spell.moonBonus.includes(moonPhase)) {
    power = Math.floor(power * wcCalculateMoonBonus(moonPhase, spell.moonBonus));
  }

  // Familiar bonus
  const famBonus = wcGetFamiliarBonus(familiarBond, "spell_power");
  power += famBonus;

  return Math.max(1, power);
}

export function wcCalculateManaCost(spell: Spell, role: WitchRole): number {
  let cost = spell.manaCost;
  const reduction = wcGetRoleBonus(role, "manaCost");
  if (reduction < 0) {
    cost = Math.max(1, Math.floor(cost * (1 + reduction / 100)));
  }
  return cost;
}

export function wcCanCastSpell(
  spellId: string,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): boolean {
  const spell = wcSpells.find(s => s.id === spellId);
  if (!spell) return false;
  if (state.level < spell.minLevel) return false;
  if (!state.unlockedSpells.includes(spellId)) return false;

  const manaCost = wcCalculateManaCost(spell, state.role);
  if (state.mana < manaCost) return false;

  const cooldownEnd = state.activeSpellCooldowns[spellId] ?? 0;
  if (now < cooldownEnd) return false;

  return true;
}

export function wcCastSpell(
  spellId: string,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): { power: number; newState: WitchCovenState } | null {
  const spell = wcSpells.find(s => s.id === spellId);
  if (!spell) return null;

  if (!wcCanCastSpell(spellId, state, moonPhase, now)) return null;

  const power = wcCalculateSpellPower(spell, state.role, state.level, moonPhase, state.familiarBond);
  const manaCost = wcCalculateManaCost(spell, state.role);

  const newCooldowns = { ...state.activeSpellCooldowns };
  newCooldowns[spellId] = now + spell.cooldown;

  // XP from casting
  const xpGained = Math.floor(power * 0.5);
  const xpBonus = 1 + wcGetRoleBonus(state.role, "xpBonus") / 100;

  const newState: WitchCovenState = {
    ...state,
    mana: state.mana - manaCost,
    xp: state.xp + Math.floor(xpGained * xpBonus),
    activeSpellCooldowns: newCooldowns,
    totalSpellsCast: state.totalSpellsCast + 1,
  };

  return { power, newState };
}

export function wcGetSpellSchool(spellId: string): SpellSchool | null {
  return wcSpells.find(s => s.id === spellId)?.school ?? null;
}

export function wcGetSpellEffect(spellId: string): string {
  return wcSpells.find(s => s.id === spellId)?.effect ?? "";
}

export function wcGetPotionEffect(potionId: string): string {
  return wcPotionRecipes.find(p => p.id === potionId)?.effect ?? "";
}

// ─── Pure Functions: Garden ───────────────────────────────────────────────

export function wcGetHerbGrowthTime(herbId: string, role: WitchRole, moonPhase: MoonPhase): number {
  const herb = wcMagicalHerbs.find(h => h.id === herbId);
  if (!herb) return 0;

  let growthTime = herb.growthTime;

  // Herbalist bonus
  const herbBonus = wcGetRoleBonus(role, "herbGrowth");
  if (herbBonus > 0) {
    growthTime = Math.floor(growthTime * (1 - herbBonus / 100));
  }

  // Moon bonus
  if (herb.moonBonus.includes(moonPhase)) {
    growthTime = Math.floor(growthTime * 0.7);
  }

  return Math.max(30, growthTime);
}

export function wcCalculateGardenYield(
  herbId: string,
  role: WitchRole,
  moonPhase: MoonPhase,
  familiarBond: FamiliarBond | null,
): number {
  const herb = wcMagicalHerbs.find(h => h.id === herbId);
  if (!herb) return 0;

  let [minYield, maxYield] = herb.yieldRange;

  // Herbalist bonus
  const herbYieldBonus = wcGetRoleBonus(role, "herbYield");
  if (herbYieldBonus > 0) {
    minYield = Math.floor(minYield * (1 + herbYieldBonus / 100));
    maxYield = Math.floor(maxYield * (1 + herbYieldBonus / 100));
  }

  // Moon bonus
  if (herb.moonBonus.includes(moonPhase)) {
    minYield += 1;
    maxYield += 2;
  }

  // Familiar affinity bonus
  if (familiarBond) {
    const affinity = wcGetFamiliarAffinity(familiarBond.type, herbId);
    if (affinity > 0) {
      maxYield += 1;
    }
  }

  return wcRandomInt(minYield, maxYield);
}

export function wcHarvestHerb(
  plotIndex: number,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): { herbId: string; yieldAmount: number; newState: WitchCovenState } | null {
  if (plotIndex < 0 || plotIndex >= state.gardenPlots.length) return null;

  const plot = state.gardenPlots[plotIndex];
  if (plot.status !== "ready" || !plot.herbId) return null;

  const herbId = plot.herbId;
  const yieldAmount = wcCalculateGardenYield(herbId, state.role, moonPhase, state.familiarBond);

  const newInventory = { ...state.inventory };
  newInventory[herbId] = (newInventory[herbId] ?? 0) + yieldAmount;

  const newPlots = [...state.gardenPlots];
  newPlots[plotIndex] = { herbId: null, status: "empty", plantedAt: null, yieldAmount: 0, potencyBonus: 0 };

  const newState: WitchCovenState = {
    ...state,
    gardenPlots: newPlots,
    inventory: newInventory,
    totalHerbsHarvested: state.totalHerbsHarvested + yieldAmount,
  };

  return { herbId, yieldAmount, newState };
}

export function wcPlantHerb(
  plotIndex: number,
  herbId: string,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): WitchCovenState | null {
  if (plotIndex < 0 || plotIndex >= state.gardenPlots.length) return null;

  const plot = state.gardenPlots[plotIndex];
  if (plot.status !== "empty") return null;

  const herb = wcMagicalHerbs.find(h => h.id === herbId);
  if (!herb) return null;

  const newPlots = [...state.gardenPlots];
  newPlots[plotIndex] = {
    herbId,
    status: "planted",
    plantedAt: now,
    yieldAmount: 0,
    potencyBonus: 0,
  };

  return { ...state, gardenPlots: newPlots };
}

export function wcUpdateGardenPlots(state: WitchCovenState, moonPhase: MoonPhase, now: number): WitchCovenState {
  let changed = false;
  const newPlots: GardenPlot[] = state.gardenPlots.map(plot => {
    if (!plot.herbId || !plot.plantedAt) return plot;
    if (plot.status === "ready" || plot.status === "withered") return plot;

    const growthTime = wcGetHerbGrowthTime(plot.herbId, state.role, moonPhase);
    const elapsed = now - plot.plantedAt;

    if (elapsed >= growthTime) {
      changed = true;
      return { ...plot, status: "ready" as const };
    }
    if (plot.status === "planted" && elapsed > growthTime * 0.2) {
      changed = true;
      return { ...plot, status: "growing" as const };
    }

    return plot;
  });

  return changed ? { ...state, gardenPlots: newPlots } : state;
}

// ─── Pure Functions: Familiar Bond ────────────────────────────────────────

export function wcFeedFamiliar(
  herbId: string,
  state: WitchCovenState,
  now: number,
): { bondGain: number; newState: WitchCovenState } | null {
  if (!state.familiarBond) return null;

  const familiar = wcFamiliarTypes.find(f => f.type === state.familiarBond!.type);
  if (!familiar) return null;

  if ((state.inventory[herbId] ?? 0) < 1) return null;

  const isFavorite = familiar.favoriteHerb === herbId;
  const bondGain = isFavorite ? 15 : 5;

  const newBond = Math.min(familiar.maxBond, state.familiarBond.bond + bondGain);
  const mood = wcGetFamiliarMood({ ...state.familiarBond, bond: newBond });

  const newInventory = { ...state.inventory };
  newInventory[herbId] = Math.max(0, (newInventory[herbId] ?? 0) - 1);

  // Unlock abilities at bond milestones
  const abilities = [...state.familiarBond.abilities];
  if (newBond >= 25 && !abilities.includes("sense_danger")) abilities.push("sense_danger");
  if (newBond >= 50 && !abilities.includes("fetch_ingredients")) abilities.push("fetch_ingredients");
  if (newBond >= 75 && !abilities.includes("warn_curses")) abilities.push("warn_curses");
  if (newBond >= 100 && !abilities.includes("ultimate_bond")) abilities.push("ultimate_bond");

  const newState: WitchCovenState = {
    ...state,
    familiarBond: { ...state.familiarBond, bond: newBond, mood, lastFed: now, abilities },
    inventory: newInventory,
  };

  return { bondGain, newState };
}

// ─── Pure Functions: Cauldron Upgrade ─────────────────────────────────────

export function wcUpgradeCauldron(state: WitchCovenState): WitchCovenState | null {
  const currentIndex = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
  if (currentIndex < 0 || currentIndex >= wcCauldronUpgrades.length - 1) return null;

  const nextUpgrade = wcCauldronUpgrades[currentIndex + 1];
  if (state.gold < nextUpgrade.cost) return null;

  return {
    ...state,
    cauldronTier: nextUpgrade.tier,
    gold: state.gold - nextUpgrade.cost,
  };
}

// ─── Pure Functions: Rituals ──────────────────────────────────────────────

export function wcCalculateRitualPower(
  ritual: Ritual,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  participantCount: number,
): number {
  let power = 50;

  // Base from gathering power
  power += state.gatheringPower;

  // Participant bonus
  const participantBonus = Math.floor((participantCount / ritual.minParticipants) * 30);
  power += Math.min(50, participantBonus);

  // Moon alignment
  if (ritual.moonRequired.includes(moonPhase)) {
    power += 25;
  }

  // Role bonus for ritual
  power += wcGetRoleBonus(state.role, "ritualPower");

  // Level contribution
  power += Math.floor(state.level * 0.5);

  // Familiar bonus
  if (state.familiarBond) {
    power += Math.floor(state.familiarBond.bond * 0.2);
  }

  return Math.max(10, Math.min(200, power));
}

export function wcCanPerformRitual(
  ritualType: RitualType,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  participantCount: number,
): boolean {
  const ritual = wcRituals.find(r => r.type === ritualType);
  if (!ritual) return false;
  if (participantCount < ritual.minParticipants) return false;
  if (state.gatheringPower < ritual.powerCost) return false;
  if (ritual.moonRequired.length > 0 && !ritual.moonRequired.includes(moonPhase)) return false;
  return true;
}

export function wcPerformRitual(
  ritualType: RitualType,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  participantCount: number,
  now: number,
): { ritualPower: number; newState: WitchCovenState } | null {
  const ritual = wcRituals.find(r => r.type === ritualType);
  if (!ritual) return null;

  if (!wcCanPerformRitual(ritualType, state, moonPhase, participantCount)) return null;

  const ritualPower = wcCalculateRitualPower(ritual, state, moonPhase, participantCount);

  const xpGained = Math.floor(ritual.xpReward * (ritualPower / 100));
  const xpBonus = 1 + wcGetRoleBonus(state.role, "xpBonus") / 100;

  const newState: WitchCovenState = {
    ...state,
    xp: state.xp + Math.floor(xpGained * xpBonus),
    gatheringPower: Math.max(0, state.gatheringPower - ritual.powerCost),
    reputation: state.reputation + Math.floor(ritualPower * 0.3),
    totalRitualsPerformed: state.totalRitualsPerformed + 1,
  };

  return { ritualPower, newState };
}

export function wcGetRitualEffect(ritualType: RitualType): string {
  return wcRituals.find(r => r.type === ritualType)?.effect ?? "";
}

// ─── Pure Functions: Coven & Gathering ────────────────────────────────────

export function wcCalculateCovenPower(state: WitchCovenState, moonPhase: MoonPhase): number {
  let power = state.gatheringPower;

  // Level contribution
  power += state.level * 2;

  // Reputation bonus
  power += Math.floor(state.reputation * 0.5);

  // Moon multiplier
  const moonData = wcMoonPhases.find(p => p.phase === moonPhase);
  if (moonData) {
    power = Math.floor(power * moonData.magicMultiplier);
  }

  // Familiar bond
  if (state.familiarBond) {
    power += Math.floor(state.familiarBond.bond * 0.3);
  }

  return Math.max(0, power);
}

export function wcCalculateGatheringBonus(
  eventType: GatheringEventType,
  participantCount: number,
  moonPhase: MoonPhase,
  state: WitchCovenState,
): number {
  let bonus = 0;

  switch (eventType) {
    case "circle_dance":
      bonus = participantCount * 5;
      break;
    case "chanting":
      bonus = participantCount * 3 + 10;
      break;
    case "incense_burning":
      bonus = 15;
      break;
    case "energy_channeling":
      bonus = participantCount * 7;
      break;
    case "trance_vision":
      bonus = 20 + state.level;
      break;
  }

  // Moon amplification
  if (moonPhase === "full_moon") bonus = Math.floor(bonus * 1.5);
  if (moonPhase === "new_moon") bonus = Math.floor(bonus * 1.3);

  // Role bonus
  bonus += wcGetRoleBonus(state.role, "gatheringPower");

  return bonus;
}

export function wcJoinGathering(
  eventType: GatheringEventType,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  participantCount: number,
): { gatheringPowerGained: number; newState: WitchCovenState } {
  const gained = wcCalculateGatheringBonus(eventType, participantCount, moonPhase, state);
  return {
    gatheringPowerGained: gained,
    newState: {
      ...state,
      gatheringPower: state.gatheringPower + gained,
      reputation: state.reputation + Math.floor(gained * 0.2),
    },
  };
}

// ─── Pure Functions: Achievements ─────────────────────────────────────────

export function wcCheckAchievements(state: WitchCovenState): string[] {
  const newAchievements: string[] = [];

  for (const achievement of wcAchievements) {
    if (state.unlockedAchievements.includes(achievement.id)) continue;

    let current: number;
    switch (achievement.requirement) {
      case "totalBrews":
        current = state.totalBrews;
        break;
      case "totalHerbsHarvested":
        current = state.totalHerbsHarvested;
        break;
      case "totalSpellsCast":
        current = state.totalSpellsCast;
        break;
      case "totalRitualsPerformed":
        current = state.totalRitualsPerformed;
        break;
      case "totalGoldEarned":
        current = state.totalGoldEarned;
        break;
      case "streakBest":
        current = state.streak.best;
        break;
      case "cauldronTier":
        current = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
        break;
      default:
        current = 0;
    }

    if (current >= achievement.targetValue) {
      newAchievements.push(achievement.id);
    }
  }

  return newAchievements;
}

export function wcGetAchievementProgress(achievementId: string, state: WitchCovenState): number {
  const achievement = wcAchievements.find(a => a.id === achievementId);
  if (!achievement) return 0;

  let current: number;
  switch (achievement.requirement) {
    case "totalBrews": current = state.totalBrews; break;
    case "totalHerbsHarvested": current = state.totalHerbsHarvested; break;
    case "totalSpellsCast": current = state.totalSpellsCast; break;
    case "totalRitualsPerformed": current = state.totalRitualsPerformed; break;
    case "totalGoldEarned": current = state.totalGoldEarned; break;
    case "streakBest": current = state.streak.best; break;
    case "cauldronTier": current = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier); break;
    default: current = 0;
  }

  return Math.min(100, Math.floor((current / achievement.targetValue) * 100));
}

export function wcGetNextAchievement(state: WitchCovenState): Achievement | null {
  for (const achievement of wcAchievements) {
    if (!state.unlockedAchievements.includes(achievement.id)) {
      return achievement;
    }
  }
  return null;
}

// ─── Pure Functions: Daily Challenge ──────────────────────────────────────

export function wcGenerateDailyChallenge(date: Date): DailyChallenge {
  const dateStr = date.toISOString().split("T")[0];

  // Deterministic selection based on date
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const recipeIndex = seed % wcPotionRecipes.length;
  const recipe = wcPotionRecipes[recipeIndex];

  const timeLimit = Math.max(60, recipe.brewTime * 2);
  const bonusMultiplier = 1.5 + (seed % 5) * 0.25;

  const specialIngredients = wcIngredients.filter(i => i.rarity === "rare" || i.rarity === "legendary");
  const specialIngredient = seed % 3 === 0 ? specialIngredients[seed % specialIngredients.length].id : null;

  const reward = Math.floor(recipe.goldReward * 3 * bonusMultiplier);

  return {
    id: `daily_${dateStr}`,
    date: dateStr,
    potionId: recipe.id,
    bonusMultiplier,
    timeLimit,
    specialIngredient,
    reward,
  };
}

export function wcCalculateStreakBonus(streak: number): number {
  if (streak <= 0) return 0;
  return Math.min(100, streak * 5);
}

export function wcUpdateStreak(state: WitchCovenState, todayStr: string): StreakData {
  const streak = { ...state.streak };

  if (streak.lastDate === todayStr) {
    return streak;
  }

  // Check if yesterday (consecutive)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (streak.lastDate === yesterdayStr) {
    streak.current += 1;
  } else if (streak.lastDate !== todayStr) {
    streak.current = 1;
  }

  streak.lastDate = todayStr;
  streak.best = Math.max(streak.best, streak.current);
  streak.bonusMultiplier = wcCalculateStreakBonus(streak.current);

  return streak;
}

// ─── Pure Functions: Sort / Filter ────────────────────────────────────────

export type PotionSortKey = "name" | "difficulty" | "brewTime" | "xpReward" | "goldReward";
export type SortDirection = "asc" | "desc";

export function wcSortPotions(
  potions: readonly PotionRecipe[],
  sortKey: PotionSortKey,
  direction: SortDirection,
): PotionRecipe[] {
  const sorted = [...potions].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal);
    }
    return (aVal as number) - (bVal as number);
  });
  return direction === "desc" ? sorted.reverse() : sorted;
}

export function wcFilterSpells(
  spells: readonly Spell[],
  filters: { school?: SpellSchool; maxManaCost?: number; minLevel?: number },
): Spell[] {
  return spells.filter(spell => {
    if (filters.school && spell.school !== filters.school) return false;
    if (filters.maxManaCost !== undefined && spell.manaCost > filters.maxManaCost) return false;
    if (filters.minLevel !== undefined && spell.minLevel > filters.minLevel) return false;
    return true;
  });
}

export function wcGetRecommendedPotion(state: WitchCovenState, moonPhase: MoonPhase): PotionRecipe | null {
  const available = wcPotionRecipes.filter(recipe => {
    if (recipe.minCauldronTier !== state.cauldronTier) {
      const ci = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
      const ri = wcCauldronUpgrades.findIndex(c => c.tier === recipe.minCauldronTier);
      if (ci < ri) return false;
    }
    return true;
  });

  // Score each recipe
  let bestScore = -1;
  let bestRecipe: PotionRecipe | null = null;

  for (const recipe of available) {
    let score = 0;

    // Moon alignment bonus
    if (recipe.moonBonus.includes(moonPhase)) score += 30;

    // Ingredient availability
    const hasIngredients = wcValidateIngredients(recipe, state.inventory);
    if (hasIngredients) score += 40;

    // Difficulty appropriateness
    const diffDelta = Math.abs(recipe.difficulty - Math.floor(state.level / 5));
    score += Math.max(0, 20 - diffDelta * 5);

    // XP efficiency
    score += Math.floor(recipe.xpReward / recipe.brewTime * 10);

    // Category bonus based on role
    if (state.role === "herbalist" && recipe.category === "healing") score += 15;
    if (state.role === "enchantress" && recipe.category === "illusion") score += 15;
    if (state.role === "necromancer" && recipe.category === "cursed") score += 15;

    if (score > bestScore) {
      bestScore = score;
      bestRecipe = recipe;
    }
  }

  return bestRecipe;
}

// ─── Pure Functions: Formatting & Display ─────────────────────────────────

export function wcFormatPotionName(potionId: string): string {
  return wcPotionRecipes.find(p => p.id === potionId)?.name ?? potionId;
}

export function wcGetIngredientRarity(ingredientId: string): IngredientRarity {
  return wcIngredients.find(i => i.id === ingredientId)?.rarity ?? "common";
}

export function wcGetPotionCategory(potionId: string): PotionCategory | null {
  return wcPotionRecipes.find(p => p.id === potionId)?.category ?? null;
}

export function wcComparePotions(a: PotionRecipe, b: PotionRecipe): number {
  const aScore = a.xpReward + a.goldReward;
  const bScore = b.xpReward + b.goldReward;
  return aScore - bScore;
}

export function wcGetAvailableHerbs(inventory: Record<string, number>): { herbId: string; amount: number }[] {
  return wcMagicalHerbs
    .map(h => ({ herbId: h.id, amount: inventory[h.id] ?? 0 }))
    .filter(entry => entry.amount > 0);
}

export function wcGetRarityColor(rarity: IngredientRarity): string {
  switch (rarity) {
    case "common": return "#9CA3AF";
    case "uncommon": return "#34D399";
    case "rare": return "#60A5FA";
    case "legendary": return "#F59E0B";
    case "mythic": return "#A855F7";
  }
}

export function wcGetRarityLabel(rarity: IngredientRarity): string {
  switch (rarity) {
    case "common": return "Common";
    case "uncommon": return "Uncommon";
    case "rare": return "Rare";
    case "legendary": return "Legendary";
    case "mythic": return "Mythic";
  }
}

export function wcGetMoonPhaseName(phase: MoonPhase): string {
  return wcMoonPhases.find(p => p.phase === phase)?.name ?? phase;
}

export function wcGetMoonPhaseNameCN(phase: MoonPhase): string {
  return wcMoonPhases.find(p => p.phase === phase)?.nameCN ?? phase;
}

export function wcGetMoonMultiplier(phase: MoonPhase): number {
  return wcMoonPhases.find(p => p.phase === phase)?.magicMultiplier ?? 1.0;
}

export function wcGetCovenTitle(level: number): string {
  if (level >= 45) return "Supreme Crone";
  if (level >= 40) return "Grand Archmage";
  if (level >= 35) return "High Sorceress";
  if (level >= 30) return "Elder Witch";
  if (level >= 25) return "Master Witch";
  if (level >= 20) return "Adept Witch";
  if (level >= 15) return "Journeyman Witch";
  if (level >= 10) return "Apprentice Witch";
  if (level >= 5) return "Novice Witch";
  return "Initiate";
}

export function wcGetBrewStatusLabel(status: BrewResultStatus): string {
  switch (status) {
    case "success": return "✅ Success";
    case "failure": return "❌ Failed";
    case "critical_success": return "🌟 Critical!";
    case "explosion": return "💥 Explosion!";
  }
}

export function wcGetMoodEmoji(mood: FamiliarMood): string {
  switch (mood) {
    case "ecstatic": return "😻";
    case "happy": return "😺";
    case "content": return "😸";
    case "restless": return "🙀";
    case "grumpy": return "😾";
  }
}

export function wcGetSchoolColor(school: SpellSchool): string {
  switch (school) {
    case "abjuration": return "#FCD34D";
    case "conjuration": return "#6EE7B7";
    case "divination": return "#93C5FD";
    case "enchantment": return "#F9A8D4";
    case "evocation": return "#FCA5A5";
    case "necromancy": return "#A78BFA";
    case "transmutation": return "#67E8F9";
    case "illusion": return "#C4B5FD";
  }
}

export function wcGetSchoolLabel(school: SpellSchool): string {
  switch (school) {
    case "abjuration": return "Abjuration";
    case "conjuration": return "Conjuration";
    case "divination": return "Divination";
    case "enchantment": return "Enchantment";
    case "evocation": return "Evocation";
    case "necromancy": return "Necromancy";
    case "transmutation": return "Transmutation";
    case "illusion": return "Illusion";
  }
}

export function wcGetCategoryColor(category: PotionCategory): string {
  switch (category) {
    case "healing": return "#34D399";
    case "transformation": return "#60A5FA";
    case "illusion": return "#C4B5FD";
    case "protection": return "#FCD34D";
    case "cursed": return "#F87171";
    case "wisdom": return "#93C5FD";
    case "love": return "#F9A8D4";
    case "destruction": return "#FB923C";
  }
}

export function wcGetCategoryLabel(category: PotionCategory): string {
  switch (category) {
    case "healing": return "Healing";
    case "transformation": return "Transformation";
    case "illusion": return "Illusion";
    case "protection": return "Protection";
    case "cursed": return "Cursed";
    case "wisdom": return "Wisdom";
    case "love": return "Love";
    case "destruction": return "Destruction";
  }
}

export function wcGetTierLabel(tier: CauldronTier): string {
  switch (tier) {
    case "iron": return "Iron";
    case "bronze": return "Bronze";
    case "silver": return "Silver";
    case "gold": return "Gold";
    case "obsidian": return "Obsidian";
  }
}

export function wcGetTierColor(tier: CauldronTier): string {
  switch (tier) {
    case "iron": return "#9CA3AF";
    case "bronze": return "#D97706";
    case "silver": return "#C0C0C0";
    case "gold": return "#FFD700";
    case "obsidian": return "#1F2937";
  }
}

export function wcGetAchievementTierColor(tier: AchievementTier): string {
  switch (tier) {
    case "bronze": return "#CD7F32";
    case "silver": return "#C0C0C0";
    case "gold": return "#FFD700";
    case "platinum": return "#E5E4E2";
  }
}

export function wcGetDifficultyLabel(difficulty: number): string {
  if (difficulty <= 2) return "Easy";
  if (difficulty <= 4) return "Moderate";
  if (difficulty <= 6) return "Hard";
  if (difficulty <= 8) return "Expert";
  return "Master";
}

export function wcGetDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return "#34D399";
  if (difficulty <= 4) return "#FCD34D";
  if (difficulty <= 6) return "#FB923C";
  if (difficulty <= 8) return "#F87171";
  return "#A855F7";
}

// ─── Pure Functions: Mana ─────────────────────────────────────────────────

export function wcGetMaxMana(level: number, role: WitchRole): number {
  let base = 50 + level * 10;
  base += wcGetRoleBonus(role, "manaRegen");
  return base;
}

export function wcCalculateManaRegen(level: number, role: WitchRole, moonPhase: MoonPhase): number {
  let regen = 1 + Math.floor(level * 0.2);
  regen += Math.floor(wcGetRoleBonus(role, "manaRegen") * 0.1);

  if (moonPhase === "full_moon") regen = Math.floor(regen * 1.5);
  if (moonPhase === "new_moon") regen = Math.floor(regen * 0.7);

  return Math.max(1, regen);
}

// ─── Pure Functions: Initial State ────────────────────────────────────────

export function wcCreateDefaultGardenPlots(count: number): GardenPlot[] {
  return Array.from({ length: count }, () => ({
    herbId: null,
    status: "empty" as GardenPlotStatus,
    plantedAt: null,
    yieldAmount: 0,
    potencyBonus: 0,
  }));
}

export function wcInitializeState(overrides?: Partial<WitchCovenState>): WitchCovenState {
  const level = 1;
  return {
    witchName: "Morrigan",
    role: "herbalist",
    level,
    xp: 0,
    gold: 50,
    mana: wcGetMaxMana(level, "herbalist"),
    maxMana: wcGetMaxMana(level, "herbalist"),
    reputation: 0,
    cauldronTier: "iron",
    familiarBond: null,
    gardenPlots: wcCreateDefaultGardenPlots(6),
    unlockedRecipes: ["healing_salve", "mana_elixir", "fire_resistance", "fortune_tea", "berserk_antidote"],
    unlockedSpells: ["spark", "frost_bite"],
    unlockedAchievements: [],
    brewHistory: [],
    totalBrews: 0,
    successfulBrews: 0,
    totalSpellsCast: 0,
    totalHerbsHarvested: 0,
    totalRitualsPerformed: 0,
    totalGoldEarned: 0,
    streak: { current: 0, best: 0, lastDate: null, bonusMultiplier: 0 },
    currentBrewId: null,
    brewStartTime: null,
    activeSpellCooldowns: {},
    gatheringPower: 10,
    inventory: {
      eye_of_newt: 3,
      bat_wing: 2,
      toad_sweat: 2,
      witch_hazel: 2,
      swamp_gas: 1,
      willow_bark: 1,
    },
    ...overrides,
  };
}

// ─── Pure Functions: Validate Ritual Requirements ─────────────────────────

export function wcValidateRitualRequirements(
  ritualType: RitualType,
  state: WitchCovenState,
  moonPhase: MoonPhase,
  participantCount: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const ritual = wcRituals.find(r => r.type === ritualType);

  if (!ritual) {
    errors.push("Unknown ritual type.");
    return { valid: false, errors };
  }

  if (participantCount < ritual.minParticipants) {
    errors.push(`Need at least ${ritual.minParticipants} participants (have ${participantCount}).`);
  }

  if (state.gatheringPower < ritual.powerCost) {
    errors.push(`Need ${ritual.powerCost} gathering power (have ${state.gatheringPower}).`);
  }

  if (ritual.moonRequired.length > 0 && !ritual.moonRequired.includes(moonPhase)) {
    const requiredNames = ritual.moonRequired.map(p => wcGetMoonPhaseName(p)).join(", ");
    errors.push(`Ritual requires: ${requiredNames} (current: ${wcGetMoonPhaseName(moonPhase)}).`);
  }

  return { valid: errors.length === 0, errors };
}

// ─── Pure Functions: Start Brew ───────────────────────────────────────────

export function wcStartBrew(
  recipeId: string,
  state: WitchCovenState,
  now: number,
): WitchCovenState | null {
  const recipe = wcPotionRecipes.find(r => r.id === recipeId);
  if (!recipe) return null;
  if (!wcCanBrewPotion(recipe, state)) return null;

  // Consume ingredients at start
  const newInventory = { ...state.inventory };
  for (const ing of recipe.ingredients) {
    newInventory[ing.id] = Math.max(0, (newInventory[ing.id] ?? 0) - 1);
  }

  return {
    ...state,
    currentBrewId: recipeId,
    brewStartTime: now,
    inventory: newInventory,
  };
}

export function wcGetBrewProgress(
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): number | null {
  if (!state.currentBrewId || !state.brewStartTime) return null;

  const recipe = wcPotionRecipes.find(r => r.id === state.currentBrewId);
  if (!recipe) return null;

  const totalTime = wcReduceBrewTime(recipe.brewTime, state.role, state.cauldronTier, state.familiarBond);
  const elapsed = now - state.brewStartTime;
  return Math.min(100, Math.floor((elapsed / totalTime) * 100));
}

export function wcIsBrewComplete(
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): boolean {
  const progress = wcGetBrewProgress(state, moonPhase, now);
  return progress !== null && progress >= 100;
}

export function wcCompleteBrew(
  state: WitchCovenState,
  moonPhase: MoonPhase,
  now: number,
): { result: BrewResult; newState: WitchCovenState } | null {
  if (!wcIsBrewComplete(state, moonPhase, now)) return null;
  if (!state.currentBrewId) return null;

  return wcBrewPotion(state.currentBrewId, { ...state, currentBrewId: null, brewStartTime: null }, moonPhase, now);
}

// ─── Pure Functions: Recipe Unlock ────────────────────────────────────────

export function wcUnlockRecipe(recipeId: string, state: WitchCovenState): WitchCovenState {
  if (state.unlockedRecipes.includes(recipeId)) return state;
  return { ...state, unlockedRecipes: [...state.unlockedRecipes, recipeId] };
}

export function wcUnlockSpell(spellId: string, state: WitchCovenState): WitchCovenState {
  if (state.unlockedSpells.includes(spellId)) return state;
  return { ...state, unlockedSpells: [...state.unlockedSpells, spellId] };
}

// ─── Pure Functions: Familiar Bonding ─────────────────────────────────────

export function wcBondWithFamiliar(type: FamiliarType, state: WitchCovenState, now: number): WitchCovenState {
  if (state.familiarBond) return state;

  return {
    ...state,
    familiarBond: {
      type,
      bond: 10,
      mood: "content",
      lastFed: now,
      abilities: [],
    },
  };
}

// ─── Pure Functions: State Transitions ────────────────────────────────────

export function wcRegenMana(state: WitchCovenState, moonPhase: MoonPhase): WitchCovenState {
  const regenAmount = wcCalculateManaRegen(state.level, state.role, moonPhase);
  return {
    ...state,
    mana: Math.min(state.maxMana, state.mana + regenAmount),
  };
}

export function wcUpdateSpellCooldowns(state: WitchCovenState, now: number): WitchCovenState {
  const newCooldowns = { ...state.activeSpellCooldowns };
  let changed = false;

  for (const [spellId, cooldownEnd] of Object.entries(newCooldowns)) {
    if (now >= cooldownEnd) {
      delete newCooldowns[spellId];
      changed = true;
    }
  }

  return changed ? { ...state, activeSpellCooldowns: newCooldowns } : state;
}

export function wcGrantXp(state: WitchCovenState, amount: number): WitchCovenState {
  const xpBonus = 1 + wcGetRoleBonus(state.role, "xpBonus") / 100;
  const totalXp = Math.floor(amount * xpBonus);
  const newXp = state.xp + totalXp;
  const newLevel = wcCalculateWitchLevel(newXp);
  const newMaxMana = wcGetMaxMana(newLevel, state.role);

  return {
    ...state,
    xp: newXp,
    level: newLevel,
    maxMana: newMaxMana,
    mana: Math.min(state.mana, newMaxMana),
  };
}

export function wcGrantGold(state: WitchCovenState, amount: number): WitchCovenState {
  const goldBonus = 1 + wcGetRoleBonus(state.role, "goldBonus") / 100;
  const totalGold = Math.floor(amount * goldBonus);
  return {
    ...state,
    gold: state.gold + totalGold,
    totalGoldEarned: state.totalGoldEarned + totalGold,
  };
}

export function wcSpendGold(state: WitchCovenState, amount: number): WitchCovenState | null {
  if (state.gold < amount) return null;
  return { ...state, gold: state.gold - amount };
}

// ─── Pure Functions: Inventory ────────────────────────────────────────────

export function wcAddToInventory(state: WitchCovenState, ingredientId: string, amount: number): WitchCovenState {
  const newInventory = { ...state.inventory };
  newInventory[ingredientId] = (newInventory[ingredientId] ?? 0) + amount;
  return { ...state, inventory: newInventory };
}

export function wcGetInventoryCount(inventory: Record<string, number>, ingredientId: string): number {
  return inventory[ingredientId] ?? 0;
}

export function wcGetTotalInventoryValue(inventory: Record<string, number>): number {
  let total = 0;
  for (const [id, count] of Object.entries(inventory)) {
    const ingredient = wcIngredients.find(i => i.id === id);
    if (ingredient) {
      const rarityValue: Record<IngredientRarity, number> = {
        common: 1,
        uncommon: 3,
        rare: 8,
        legendary: 25,
        mythic: 50,
      };
      total += rarityValue[ingredient.rarity] * count;
    }
  }
  return total;
}

// ─── Pure Functions: Advanced Brew Analysis ───────────────────────────────

export function wcGetBrewSuccessRate(
  recipe: PotionRecipe,
  state: WitchCovenState,
  moonPhase: MoonPhase,
): number {
  return wcCalculateBrewSuccess(recipe, state.cauldronTier, state.role, state.level, moonPhase, state.familiarBond);
}

export function wcGetMostEfficientPotion(
  state: WitchCovenState,
  metric: "xp_per_second" | "gold_per_second" | "xp_per_gold",
): PotionRecipe | null {
  const brewable = wcPotionRecipes.filter(r => wcCanBrewPotion(r, state));
  if (brewable.length === 0) return null;

  let best: PotionRecipe | null = null;
  let bestValue = -Infinity;

  for (const recipe of brewable) {
    let value: number;
    const adjustedTime = wcReduceBrewTime(recipe.brewTime, state.role, state.cauldronTier, state.familiarBond);

    switch (metric) {
      case "xp_per_second":
        value = recipe.xpReward / adjustedTime;
        break;
      case "gold_per_second":
        value = recipe.goldReward / adjustedTime;
        break;
      case "xp_per_gold": {
        const cost = Object.values(wcCalculateBrewCost(recipe)).length;
        value = recipe.xpReward / Math.max(1, cost);
        break;
      }
    }

    if (value > bestValue) {
      bestValue = value;
      best = recipe;
    }
  }

  return best;
}

export function wcGetSpellCooldownRemaining(
  spellId: string,
  state: WitchCovenState,
  now: number,
): number {
  const cooldownEnd = state.activeSpellCooldowns[spellId] ?? 0;
  return Math.max(0, cooldownEnd - now);
}

export function wcGetUnlockedRecipesForCauldron(
  state: WitchCovenState,
): PotionRecipe[] {
  return wcPotionRecipes.filter(recipe => {
    if (!state.unlockedRecipes.includes(recipe.id)) return false;
    const ci = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
    const ri = wcCauldronUpgrades.findIndex(c => c.tier === recipe.minCauldronTier);
    return ci >= ri;
  });
}

export function wcGetLockedRecipes(state: WitchCovenState): PotionRecipe[] {
  return wcPotionRecipes.filter(recipe => !state.unlockedRecipes.includes(recipe.id));
}

export function wcGetLockedSpells(state: WitchCovenState): Spell[] {
  return wcSpells.filter(spell => !state.unlockedSpells.includes(spell.id));
}

export function wcGetAvailableSpellsForLevel(state: WitchCovenState): Spell[] {
  return wcSpells.filter(spell => spell.minLevel <= state.level);
}

export function wcCalculateOverallPower(state: WitchCovenState, moonPhase: MoonPhase): number {
  let power = 0;

  // Level contribution
  power += state.level * 10;

  // Cauldron tier
  const cauldronIdx = wcCauldronUpgrades.findIndex(c => c.tier === state.cauldronTier);
  power += (cauldronIdx + 1) * 15;

  // Familiar bond
  if (state.familiarBond) {
    power += state.familiarBond.bond;
  }

  // Gathering power
  power += state.gatheringPower;

  // Reputation
  power += Math.floor(state.reputation * 0.1);

  // Total stats
  power += Math.floor(state.totalBrews * 0.5);
  power += Math.floor(state.totalSpellsCast * 0.3);
  power += Math.floor(state.totalRitualsPerformed * 1.0);

  // Moon multiplier
  power = Math.floor(power * wcGetMoonMultiplier(moonPhase));

  return power;
}

export function wcGetGardenSummary(state: WitchCovenState, now: number): { empty: number; planted: number; growing: number; ready: number; withered: number } {
  const summary = { empty: 0, planted: 0, growing: 0, ready: 0, withered: 0 };
  for (const plot of state.gardenPlots) {
    summary[plot.status]++;
  }
  return summary;
}

export function wcGetBrewStatsSummary(state: WitchCovenState): { totalBrews: number; successRate: number; avgQuality: number; favoritePotion: string } {
  const totalBrews = state.brewHistory.length;
  const successfulBrews = state.brewHistory.filter(b => b.status === "success" || b.status === "critical_success").length;
  const successRate = totalBrews > 0 ? Math.floor((successfulBrews / totalBrews) * 100) : 0;

  const qualitySum = state.brewHistory.reduce((sum, b) => sum + b.quality, 0);
  const avgQuality = totalBrews > 0 ? Math.floor(qualitySum / totalBrews) : 0;

  // Find favorite potion
  const potionCounts: Record<string, number> = {};
  for (const brew of state.brewHistory) {
    potionCounts[brew.potionId] = (potionCounts[brew.potionId] ?? 0) + 1;
  }
  let favoritePotion = "none";
  let maxCount = 0;
  for (const [id, count] of Object.entries(potionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoritePotion = id;
    }
  }

  return { totalBrews, successRate, avgQuality, favoritePotion };
}

// ─── Counter for exports (must be 60+) ────────────────────────────────────
// Types: ~20
// Constants: wcWitchRoles, wcIngredients, wcPotionRecipes, wcMagicalHerbs,
//   wcCauldronUpgrades, wcSpells, wcFamiliarTypes, wcMoonPhases, wcAchievements, wcRituals = 10
// Functions: wcGetMoonPhaseFromDate, wcCalculateXpForLevel, wcCalculateWitchLevel,
//   wcLevelUpRewards, wcCalculateMoonBonus, wcGetOptimalBrewPhase, wcGetFamiliarBonus,
//   wcGetFamiliarMood, wcGetFamiliarAffinity, wcGetRoleBonus, wcGetRoleDescription,
//   wcGetCauldronUpgrade, wcCalculateBrewTime, wcReduceBrewTime, wcCalculateBrewSuccess,
//   wcValidateIngredients, wcCanBrewPotion, wcCalculateBrewCost, wcCalculateBrewQuality,
//   wcBrewPotion, wcCalculateSpellPower, wcCalculateManaCost, wcCanCastSpell,
//   wcCastSpell, wcGetSpellSchool, wcGetSpellEffect, wcGetPotionEffect,
//   wcGetHerbGrowthTime, wcCalculateGardenYield, wcHarvestHerb, wcPlantHerb,
//   wcUpdateGardenPlots, wcFeedFamiliar, wcUpgradeCauldron, wcCalculateRitualPower,
//   wcCanPerformRitual, wcPerformRitual, wcGetRitualEffect, wcCalculateCovenPower,
//   wcCalculateGatheringBonus, wcJoinGathering, wcCheckAchievements, wcGetAchievementProgress,
//   wcGetNextAchievement, wcGenerateDailyChallenge, wcCalculateStreakBonus, wcUpdateStreak,
//   wcSortPotions, wcFilterSpells, wcGetRecommendedPotion, wcFormatPotionName,
//   wcGetIngredientRarity, wcGetPotionCategory, wcComparePotions, wcGetAvailableHerbs,
//   wcGetRarityColor, wcGetRarityLabel, wcGetMoonPhaseName, wcGetMoonPhaseNameCN,
//   wcGetMoonMultiplier, wcGetCovenTitle, wcGetBrewStatusLabel, wcGetMoodEmoji,
//   wcGetSchoolColor, wcGetSchoolLabel, wcGetCategoryColor, wcGetCategoryLabel,
//   wcGetTierLabel, wcGetTierColor, wcGetAchievementTierColor, wcGetDifficultyLabel,
//   wcGetDifficultyColor, wcGetMaxMana, wcCalculateManaRegen, wcCreateDefaultGardenPlots,
//   wcInitializeState, wcValidateRitualRequirements, wcStartBrew, wcGetBrewProgress,
//   wcIsBrewComplete, wcCompleteBrew, wcUnlockRecipe, wcUnlockSpell, wcBondWithFamiliar,
//   wcRegenMana, wcUpdateSpellCooldowns, wcGrantXp, wcGrantGold, wcSpendGold,
//   wcAddToInventory, wcGetInventoryCount, wcGetTotalInventoryValue,
//   wcGetBrewSuccessRate, wcGetMostEfficientPotion, wcGetSpellCooldownRemaining,
//   wcGetUnlockedRecipesForCauldron, wcGetLockedRecipes, wcGetLockedSpells,
//   wcGetAvailableSpellsForLevel, wcCalculateOverallPower, wcGetGardenSummary,
//   wcGetBrewStatsSummary = ~100 functions
// Total: well over 60 named exports + default export hook

// ─── Default Export: React Hook ───────────────────────────────────────────
// REACT imports ONLY here. No React in any named export above this line.

import { useState, useCallback, useRef, useEffect } from "react";

interface WitchCovenActions {
  readonly state: WitchCovenState;
  readonly moonPhase: MoonPhase;
  readonly brew: (recipeId: string) => BrewResult | null;
  readonly startBrew: (recipeId: string) => boolean;
  readonly completeBrew: () => BrewResult | null;
  readonly castSpell: (spellId: string) => number | null;
  readonly harvestHerb: (plotIndex: number) => { herbId: string; yieldAmount: number } | null;
  readonly plantHerb: (plotIndex: number, herbId: string) => boolean;
  readonly feedFamiliar: (herbId: string) => number | null;
  readonly upgradeCauldron: () => boolean;
  readonly performRitual: (ritualType: RitualType, participants: number) => number | null;
  readonly joinGathering: (eventType: GatheringEventType, participants: number) => number;
  readonly unlockRecipe: (recipeId: string) => void;
  readonly unlockSpell: (spellId: string) => void;
  readonly bondWithFamiliar: (type: FamiliarType) => void;
  readonly regenMana: () => void;
  readonly grantXp: (amount: number) => void;
  readonly grantGold: (amount: number) => void;
  readonly addToInventory: (ingredientId: string, amount: number) => void;
  readonly updateGarden: () => void;
  readonly updateCooldowns: () => void;
  readonly updateStreak: () => void;
  readonly newAchievements: string[];
}

export default function useWitchCoven(initialState?: WitchCovenState): WitchCovenActions {
  const [state, setState] = useState<WitchCovenState>(
    () => wcInitializeState(initialState),
  );
  const [newAchievements, setNewAchievements] = useState<string[]>([]);
  const lastAchievementCheckRef = useRef<string[]>([]);

  const nowRef = useRef(Date.now());
  const now = nowRef.current;
  const moonPhase = wcGetMoonPhaseFromDate(new Date(now));

  const checkAndGrantAchievements = useCallback((currentState: WitchCovenState): WitchCovenState => {
    const unlocked = wcCheckAchievements(currentState);
    if (unlocked.length > 0) {
      let updated = { ...currentState };
      let totalXp = 0;
      for (const id of unlocked) {
        if (!updated.unlockedAchievements.includes(id)) {
          const achievement = wcAchievements.find(a => a.id === id);
          if (achievement) {
            totalXp += achievement.xpReward;
            updated = { ...updated, unlockedAchievements: [...updated.unlockedAchievements, id] };
          }
        }
      }
      if (totalXp > 0) {
        updated = { ...updated, xp: updated.xp + totalXp };
        updated = { ...updated, level: wcCalculateWitchLevel(updated.xp) };
      }
      // Only report truly new ones
      const fresh = unlocked.filter(id => !lastAchievementCheckRef.current.includes(id));
      if (fresh.length > 0) {
        lastAchievementCheckRef.current = [...lastAchievementCheckRef.current, ...fresh];
        setNewAchievements(fresh);
      }
      return updated;
    }
    return currentState;
  }, []);

  const brew = useCallback((recipeId: string): BrewResult | null => {
    const result = wcBrewPotion(recipeId, state, moonPhase, Date.now());
    if (result) {
      const checked = checkAndGrantAchievements(result.newState);
      setState(checked);
    }
    return result?.result ?? null;
  }, [state, moonPhase, checkAndGrantAchievements]);

  const startBrewAction = useCallback((recipeId: string): boolean => {
    const result = wcStartBrew(recipeId, state, Date.now());
    if (result) {
      setState(result);
      return true;
    }
    return false;
  }, [state]);

  const completeBrewAction = useCallback((): BrewResult | null => {
    const result = wcCompleteBrew(state, moonPhase, Date.now());
    if (result) {
      const checked = checkAndGrantAchievements(result.newState);
      setState(checked);
      return result.result;
    }
    return null;
  }, [state, moonPhase, checkAndGrantAchievements]);

  const castSpellAction = useCallback((spellId: string): number | null => {
    const result = wcCastSpell(spellId, state, moonPhase, Date.now());
    if (result) {
      const checked = checkAndGrantAchievements(result.newState);
      setState(checked);
      return result.power;
    }
    return null;
  }, [state, moonPhase, checkAndGrantAchievements]);

  const harvestHerbAction = useCallback((plotIndex: number): { herbId: string; yieldAmount: number } | null => {
    const result = wcHarvestHerb(plotIndex, state, moonPhase, Date.now());
    if (result) {
      const checked = checkAndGrantAchievements(result.newState);
      setState(checked);
      return { herbId: result.herbId, yieldAmount: result.yieldAmount };
    }
    return null;
  }, [state, moonPhase, checkAndGrantAchievements]);

  const plantHerbAction = useCallback((plotIndex: number, herbId: string): boolean => {
    const result = wcPlantHerb(plotIndex, herbId, state, moonPhase, Date.now());
    if (result) {
      setState(result);
      return true;
    }
    return false;
  }, [state, moonPhase]);

  const feedFamiliarAction = useCallback((herbId: string): number | null => {
    const result = wcFeedFamiliar(herbId, state, Date.now());
    if (result) {
      setState(result.newState);
      return result.bondGain;
    }
    return null;
  }, [state]);

  const upgradeCauldronAction = useCallback((): boolean => {
    const result = wcUpgradeCauldron(state);
    if (result) {
      const checked = checkAndGrantAchievements(result);
      setState(checked);
      return true;
    }
    return false;
  }, [state, checkAndGrantAchievements]);

  const performRitualAction = useCallback((ritualType: RitualType, participants: number): number | null => {
    const result = wcPerformRitual(ritualType, state, moonPhase, participants, Date.now());
    if (result) {
      const checked = checkAndGrantAchievements(result.newState);
      setState(checked);
      return result.ritualPower;
    }
    return null;
  }, [state, moonPhase, checkAndGrantAchievements]);

  const joinGatheringAction = useCallback((eventType: GatheringEventType, participants: number): number => {
    const { gatheringPowerGained, newState } = wcJoinGathering(eventType, state, moonPhase, participants);
    setState(newState);
    return gatheringPowerGained;
  }, [state, moonPhase]);

  const unlockRecipeAction = useCallback((recipeId: string) => {
    setState(prev => wcUnlockRecipe(recipeId, prev));
  }, []);

  const unlockSpellAction = useCallback((spellId: string) => {
    setState(prev => wcUnlockSpell(spellId, prev));
  }, []);

  const bondWithFamiliarAction = useCallback((type: FamiliarType) => {
    setState(prev => wcBondWithFamiliar(type, prev, Date.now()));
  }, []);

  const regenManaAction = useCallback(() => {
    setState(prev => wcRegenMana(prev, moonPhase));
  }, [moonPhase]);

  const grantXpAction = useCallback((amount: number) => {
    setState(prev => {
      const updated = wcGrantXp(prev, amount);
      return checkAndGrantAchievements(updated);
    });
  }, [checkAndGrantAchievements]);

  const grantGoldAction = useCallback((amount: number) => {
    setState(prev => {
      const updated = wcGrantGold(prev, amount);
      return checkAndGrantAchievements(updated);
    });
  }, [checkAndGrantAchievements]);

  const addToInventoryAction = useCallback((ingredientId: string, amount: number) => {
    setState(prev => wcAddToInventory(prev, ingredientId, amount));
  }, []);

  const updateGardenAction = useCallback(() => {
    setState(prev => wcUpdateGardenPlots(prev, moonPhase, Date.now()));
  }, [moonPhase]);

  const updateCooldownsAction = useCallback(() => {
    setState(prev => wcUpdateSpellCooldowns(prev, Date.now()));
  }, []);

  const updateStreakAction = useCallback(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    setState(prev => ({ ...prev, streak: wcUpdateStreak(prev, todayStr) }));
  }, []);

  // Auto-update on mount for garden and cooldowns
  useEffect(() => {
    updateGardenAction();
    updateCooldownsAction();
    updateStreakAction();
  }, [updateGardenAction, updateCooldownsAction, updateStreakAction]);

  return {
    state,
    moonPhase,
    brew,
    startBrew: startBrewAction,
    completeBrew: completeBrewAction,
    castSpell: castSpellAction,
    harvestHerb: harvestHerbAction,
    plantHerb: plantHerbAction,
    feedFamiliar: feedFamiliarAction,
    upgradeCauldron: upgradeCauldronAction,
    performRitual: performRitualAction,
    joinGathering: joinGatheringAction,
    unlockRecipe: unlockRecipeAction,
    unlockSpell: unlockSpellAction,
    bondWithFamiliar: bondWithFamiliarAction,
    regenMana: regenManaAction,
    grantXp: grantXpAction,
    grantGold: grantGoldAction,
    addToInventory: addToInventoryAction,
    updateGarden: updateGardenAction,
    updateCooldowns: updateCooldownsAction,
    updateStreak: updateStreakAction,
    newAchievements,
  };
}
