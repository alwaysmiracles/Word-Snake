// ============================================================================
// Mythology Quest Wire — SSR-Safe Game Module
// All exports prefixed with `my`. No browser APIs at module level.
// ============================================================================

// --- Rarity Tiers ---
export type Rarity = "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
export type QuestType = "Trial" | "Battle" | "Exploration" | "Riddle" | "LegendaryEncounter";

// --- Core Data Interfaces ---
export interface Pantheon {
  id: number;
  name: string;
  realm: string;
  description: string;
  color: string;
}

export interface Deity {
  id: number;
  pantheonId: number;
  name: string;
  title: string;
  rarity: Rarity;
  domain: string;
  lore: string;
  stats: { power: number; wisdom: number; grace: number };
  blessingEffect: string;
  blessingStat: string;
  blessingBonus: number;
  blessingDuration: number;
}

export interface Creature {
  id: number;
  pantheonId: number;
  name: string;
  type: string;
  rarity: Rarity;
  hp: number;
  attack: number;
  defense: number;
  ability: string;
  abilityDesc: string;
  evolveLevel: number;
}

export interface Weapon {
  id: number;
  pantheonId: number;
  name: string;
  rarity: Rarity;
  attack: number;
  speed: number;
  special: string;
  lore: string;
  upgradeCost: number;
}

export interface Artifact {
  id: number;
  pantheonId: number;
  name: string;
  rarity: Rarity;
  description: string;
  bonusType: string;
  bonusValue: number;
}

export interface Quest {
  id: number;
  pantheonId: number;
  name: string;
  type: QuestType;
  difficulty: number;
  description: string;
  objective: string;
  xpReward: number;
  goldReward: number;
  requiredLevel: number;
}

export interface SkillNode {
  id: number;
  branch: string;
  tier: number;
  name: string;
  description: string;
  maxLevel: number;
  effectPerLevel: number;
  requires: number | null;
}

export interface HeroClass {
  id: number;
  name: string;
  description: string;
  baseStats: { str: number; int: number; dex: number; vit: number };
  passiveAbility: string;
  passiveDesc: string;
}

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface LoreEntry {
  id: number;
  category: string;
  title: string;
  content: string;
  pantheonId: number;
  unlocked: boolean;
}

export interface Prophecy {
  id: number;
  text: string;
  type: "quest" | "warning" | "reward" | "challenge";
  pantheonId: number;
  difficulty: number;
  reward: string;
}

// --- State Interfaces ---
export interface BlessingData {
  deityId: number;
  stat: string;
  bonus: number;
  turnsRemaining: number;
}

export interface WeaponData {
  weaponId: number;
  level: number;
  bonusAttack: number;
}

export interface ArtifactData {
  artifactId: number;
  bonus: number;
}

export interface CreatureData {
  creatureId: number;
  nickname: string;
  level: number;
  xp: number;
  tamed: boolean;
}

export interface QuestProgress {
  questId: number;
  status: "available" | "active" | "completed" | "failed";
  progress: number;
  goal: number;
  startTime: number;
}

export interface BattleState {
  active: boolean;
  enemyId: number;
  enemyHp: number;
  enemyMaxHp: number;
  enemyAttack: number;
  enemyName: string;
  heroHp: number;
  heroMaxHp: number;
  turnCount: number;
  wordsTyped: string[];
  combo: number;
  score: number;
  result: "ongoing" | "won" | "lost" | "fled";
}

export interface DailyQuestData {
  questId: number;
  completed: boolean;
  bonusMultiplier: number;
  seed: string;
}

export interface MythologyQuestState {
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  heroClass: number;
  activePantheon: number;
  deityBlessings: BlessingData[];
  equippedWeapon: number;
  ownedWeapons: WeaponData[];
  artifacts: ArtifactData[];
  creatures: CreatureData[];
  questProgress: QuestProgress[];
  skillTree: Record<number, number>;
  allianceLevels: Record<string, number>;
  encyclopedia: Record<number, boolean>;
  dailyQuest: DailyQuestData | null;
  dailySeed: string;
  dailyCompleted: boolean;
  achievements: string[];
  totalQuestsCompleted: number;
  totalBattlesWon: number;
  totalCreaturesTamed: number;
  totalArtifactsCollected: number;
  totalWordsTyped: number;
  totalDamageDealt: number;
  currentBattle: BattleState | null;
  activeProphecy: Prophecy | null;
  createdAt: number;
  lastSave: number;
}

// ============================================================================
// STATIC DATA — Pantheons
// ============================================================================
const PANTHEONS: Pantheon[] = [
  { id: 0, name: "Greek", realm: "Olympus", description: "Home of the Olympian gods, where thunder echoes across marble halls.", color: "#FFD700" },
  { id: 1, name: "Norse", realm: "Asgard", description: "The shining realm of the Aesir, connected to Midgard by the Bifrost bridge.", color: "#87CEEB" },
  { id: 2, name: "Egyptian", realm: "Duat", description: "The treacherous underworld where Ra journeys each night.", color: "#DAA520" },
  { id: 3, name: "Japanese", realm: "Takamagahara", description: "The High Plain of Heaven, dwelling place of the kami.", color: "#FF69B4" },
  { id: 4, name: "Celtic", realm: "Tir na Nog", description: "The Land of Youth, a realm of eternal beauty beyond the western sea.", color: "#228B22" },
];

// ============================================================================
// STATIC DATA — Deities (30 total: 6 per pantheon)
// ============================================================================
const DEITIES: Deity[] = [
  // --- Greek (pantheonId: 0) ---
  { id: 0, pantheonId: 0, name: "Hermes", title: "Messenger of the Gods", rarity: "Common", domain: "Travel, Commerce, Thieves", lore: "Hermes flies between Mount Olympus and the mortal world delivering messages and guiding souls to the underworld.", stats: { power: 4, wisdom: 5, grace: 7 }, blessingEffect: "Agility Boost", blessingStat: "dex", blessingBonus: 3, blessingDuration: 5 },
  { id: 1, pantheonId: 0, name: "Dionysus", title: "God of Wine", rarity: "Common", domain: "Wine, Festivity, Theater", lore: "Dionysus roams the earth spreading joy and madness in equal measure.", stats: { power: 3, wisdom: 4, grace: 6 }, blessingEffect: "Vitality Surge", blessingStat: "vit", blessingBonus: 5, blessingDuration: 4 },
  { id: 2, pantheonId: 0, name: "Athena", title: "Goddess of Wisdom", rarity: "Rare", domain: "Wisdom, Warfare, Crafts", lore: "Born fully armored from Zeus's head, Athena embodies strategic warfare and rational thought.", stats: { power: 7, wisdom: 9, grace: 8 }, blessingEffect: "Wisdom Aura", blessingStat: "int", blessingBonus: 5, blessingDuration: 6 },
  { id: 3, pantheonId: 0, name: "Ares", title: "God of War", rarity: "Rare", domain: "War, Bloodshed, Courage", lore: "Ares revels in the chaos and fury of battle, feared by gods and mortals alike.", stats: { power: 9, wisdom: 3, grace: 4 }, blessingEffect: "Battle Fury", blessingStat: "str", blessingBonus: 7, blessingDuration: 4 },
  { id: 4, pantheonId: 0, name: "Poseidon", title: "God of the Sea", rarity: "Epic", domain: "Sea, Earthquakes, Horses", lore: "With his trident, Poseidon commands the oceans and can shatter the earth with a single strike.", stats: { power: 8, wisdom: 7, grace: 7 }, blessingEffect: "Tidal Force", blessingStat: "str", blessingBonus: 10, blessingDuration: 5 },
  { id: 5, pantheonId: 0, name: "Zeus", title: "King of the Gods", rarity: "Legendary", domain: "Sky, Thunder, Justice", lore: "Ruler of Mount Olympus, Zeus wields the thunderbolt and governs the laws of gods and men.", stats: { power: 10, wisdom: 8, grace: 9 }, blessingEffect: "Divine Thunder", blessingStat: "all", blessingBonus: 5, blessingDuration: 7 },
  // --- Norse (pantheonId: 1) ---
  { id: 6, pantheonId: 1, name: "Bragi", title: "God of Poetry", rarity: "Common", domain: "Poetry, Music, Eloquence", lore: "Bragi's words carry magical power, and his songs can soothe the wildest beast.", stats: { power: 3, wisdom: 6, grace: 7 }, blessingEffect: "Silver Tongue", blessingStat: "int", blessingBonus: 3, blessingDuration: 5 },
  { id: 7, pantheonId: 1, name: "Tyr", title: "God of Justice", rarity: "Common", domain: "Law, Heroic Glory", lore: "Tyr sacrificed his hand to bind Fenrir, embodying the ultimate warrior's honor.", stats: { power: 7, wisdom: 5, grace: 5 }, blessingEffect: "Righteous Strike", blessingStat: "str", blessingBonus: 4, blessingDuration: 5 },
  { id: 8, pantheonId: 1, name: "Freyja", title: "Goddess of Love", rarity: "Rare", domain: "Love, Fertility, War", lore: "Freyja rides in a chariot drawn by cats and commands the Valkyries alongside Odin.", stats: { power: 6, wisdom: 7, grace: 9 }, blessingEffect: "Valkyrie Grace", blessingStat: "dex", blessingBonus: 6, blessingDuration: 5 },
  { id: 9, pantheonId: 1, name: "Heimdall", title: "Guardian of Bifrost", rarity: "Rare", domain: "Vigilance, Light, Foresight", lore: "Heimdall stands eternal watch at the rainbow bridge, his senses sharp enough to hear grass grow.", stats: { power: 7, wisdom: 8, grace: 6 }, blessingEffect: "All-Seeing Eye", blessingStat: "int", blessingBonus: 5, blessingDuration: 6 },
  { id: 10, pantheonId: 1, name: "Thor", title: "God of Thunder", rarity: "Epic", domain: "Thunder, Strength, Protection", lore: "Thor's hammer Mjolnir strikes with the force of a thousand storms, protecting Asgard from all threats.", stats: { power: 10, wisdom: 4, grace: 5 }, blessingEffect: "Stormcaller", blessingStat: "str", blessingBonus: 12, blessingDuration: 4 },
  { id: 11, pantheonId: 1, name: "Odin", title: "Allfather", rarity: "Legendary", domain: "Wisdom, War, Death, Poetry", lore: "Odin sacrificed his eye for wisdom and hung from Yggdrasil to learn the secrets of the runes.", stats: { power: 8, wisdom: 10, grace: 8 }, blessingEffect: "Rune Power", blessingStat: "all", blessingBonus: 6, blessingDuration: 7 },
  // --- Egyptian (pantheonId: 2) ---
  { id: 12, pantheonId: 2, name: "Thoth", title: "Scribe of the Gods", rarity: "Common", domain: "Writing, Knowledge, Moon", lore: "Thoth invented hieroglyphs and records the judgment of the dead in the Hall of Truth.", stats: { power: 3, wisdom: 8, grace: 5 }, blessingEffect: "Hieroglyphic Insight", blessingStat: "int", blessingBonus: 4, blessingDuration: 6 },
  { id: 13, pantheonId: 2, name: "Bastet", title: "Goddess of Cats", rarity: "Common", domain: "Home, Fertility, Protection", lore: "Bastet protects the home and embodies the grace and ferocity of the sacred cat.", stats: { power: 5, wisdom: 5, grace: 7 }, blessingEffect: "Feline Agility", blessingStat: "dex", blessingBonus: 4, blessingDuration: 5 },
  { id: 14, pantheonId: 2, name: "Horus", title: "Sky God", rarity: "Rare", domain: "Sky, Kingship, Vengeance", lore: "Horus avenged his father Osiris and became the divine model of the pharaoh.", stats: { power: 8, wisdom: 6, grace: 6 }, blessingEffect: "Eye of Horus", blessingStat: "str", blessingBonus: 6, blessingDuration: 5 },
  { id: 15, pantheonId: 2, name: "Isis", title: "Goddess of Magic", rarity: "Rare", domain: "Magic, Healing, Motherhood", lore: "Isis is the most powerful sorceress in Egyptian myth, who even tricked Ra to gain his secret name.", stats: { power: 5, wisdom: 9, grace: 8 }, blessingEffect: "Arcane Renewal", blessingStat: "vit", blessingBonus: 7, blessingDuration: 6 },
  { id: 16, pantheonId: 2, name: "Anubis", title: "God of the Dead", rarity: "Epic", domain: "Death, Embalming, Afterlife", lore: "Anubis weighs the hearts of the dead against the feather of Ma'at in the Hall of Judgment.", stats: { power: 7, wisdom: 8, grace: 6 }, blessingEffect: "Soul Judgment", blessingStat: "all", blessingBonus: 4, blessingDuration: 6 },
  { id: 17, pantheonId: 2, name: "Ra", title: "Sun God", rarity: "Legendary", domain: "Sun, Creation, Kingship", lore: "Ra sails across the sky by day and battles Apophis in the underworld each night to ensure the sun rises again.", stats: { power: 9, wisdom: 9, grace: 8 }, blessingEffect: "Solar Radiance", blessingStat: "all", blessingBonus: 6, blessingDuration: 7 },
  // --- Japanese (pantheonId: 3) ---
  { id: 18, pantheonId: 3, name: "Inari", title: "Kami of Rice", rarity: "Common", domain: "Rice, Prosperity, Foxes", lore: "Inari's fox messengers travel between the worlds, bringing fortune to the faithful.", stats: { power: 4, wisdom: 6, grace: 6 }, blessingEffect: "Prosperity", blessingStat: "vit", blessingBonus: 4, blessingDuration: 5 },
  { id: 19, pantheonId: 3, name: "Susanoo", title: "Storm God", rarity: "Common", domain: "Sea, Storms, Winds", lore: "Susanoo's tempestuous nature brought storms, but he also slew the eight-headed serpent Orochi.", stats: { power: 8, wisdom: 3, grace: 5 }, blessingEffect: "Storm Surge", blessingStat: "str", blessingBonus: 5, blessingDuration: 4 },
  { id: 20, pantheonId: 3, name: "Tsukuyomi", title: "Moon God", rarity: "Rare", domain: "Moon, Night, Calm", lore: "Born from Izanagi's right eye, Tsukuyomi governs the tranquil realm of night.", stats: { power: 5, wisdom: 8, grace: 7 }, blessingEffect: "Moonlight Serenity", blessingStat: "int", blessingBonus: 5, blessingDuration: 6 },
  { id: 21, pantheonId: 3, name: "Hachiman", title: "God of War", rarity: "Rare", domain: "War, Archery, Divine Protection", lore: "Hachiman is the divine patron of warriors and the Minamoto clan, embodying disciplined combat.", stats: { power: 8, wisdom: 6, grace: 6 }, blessingEffect: "Warrior Focus", blessingStat: "dex", blessingBonus: 6, blessingDuration: 5 },
  { id: 22, pantheonId: 3, name: "Raijin", title: "God of Thunder", rarity: "Epic", domain: "Thunder, Lightning, Storms", lore: "Raijin drums on thunderclouds, creating the storms that nourish the Japanese islands.", stats: { power: 9, wisdom: 5, grace: 5 }, blessingEffect: "Thunder Drum", blessingStat: "str", blessingBonus: 10, blessingDuration: 5 },
  { id: 23, pantheonId: 3, name: "Amaterasu", title: "Sun Goddess", rarity: "Legendary", domain: "Sun, Universe, Harmony", lore: "Amaterasu is the ancestress of the Imperial family. Her light sustains all life in the world.", stats: { power: 7, wisdom: 9, grace: 10 }, blessingEffect: "Dawn's Grace", blessingStat: "all", blessingBonus: 5, blessingDuration: 8 },
  // --- Celtic (pantheonId: 4) ---
  { id: 24, pantheonId: 4, name: "Lugh", title: "Master of Skills", rarity: "Common", domain: "Skills, Arts, Sun", lore: "Lugh is the many-skilled god, master of every craft and art known to the Celts.", stats: { power: 5, wisdom: 6, grace: 6 }, blessingEffect: "Versatility", blessingStat: "dex", blessingBonus: 3, blessingDuration: 6 },
  { id: 25, pantheonId: 4, name: "Aengus", title: "God of Love", rarity: "Common", domain: "Love, Youth, Inspiration", lore: "Aengus inspires love and creativity, his kisses turning into birds that sing of eternal devotion.", stats: { power: 3, wisdom: 5, grace: 7 }, blessingEffect: "Enchanted Heart", blessingStat: "vit", blessingBonus: 4, blessingDuration: 5 },
  { id: 26, pantheonId: 4, name: "Morrigan", title: "Phantom Queen", rarity: "Rare", domain: "War, Fate, Death", lore: "The Morrigan appears as a crow on the battlefield, foretelling doom and deciding the fate of warriors.", stats: { power: 7, wisdom: 7, grace: 5 }, blessingEffect: "Crow Omen", blessingStat: "int", blessingBonus: 5, blessingDuration: 5 },
  { id: 27, pantheonId: 4, name: "Cernunnos", title: "Horned God", rarity: "Rare", domain: "Nature, Fertility, Wild", lore: "Cernunnos sits cross-legged between the animals of the forest, lord of all wild things.", stats: { power: 6, wisdom: 6, grace: 6 }, blessingEffect: "Wild Force", blessingStat: "str", blessingBonus: 6, blessingDuration: 5 },
  { id: 28, pantheonId: 4, name: "Manannan", title: "God of the Sea", rarity: "Epic", domain: "Sea, Weather, Navigation", lore: "Manannan mac Lir rides his wave-horse across the oceans, his cloak of mists hiding and revealing worlds.", stats: { power: 6, wisdom: 8, grace: 7 }, blessingEffect: "Mist Veil", blessingStat: "dex", blessingBonus: 8, blessingDuration: 6 },
  { id: 29, pantheonId: 4, name: "Danu", title: "Mother Goddess", rarity: "Legendary", domain: "Earth, Fertility, Wisdom", lore: "Danu is the primordial mother of the Tuatha De Danann, whose waters feed all life.", stats: { power: 7, wisdom: 10, grace: 9 }, blessingEffect: "Mother's Embrace", blessingStat: "all", blessingBonus: 6, blessingDuration: 8 },
];

// ============================================================================
// STATIC DATA — Mythological Creatures (25 total)
// ============================================================================
const CREATURES: Creature[] = [
  { id: 0, pantheonId: 0, name: "Dragon", type: "Wyrm", rarity: "Legendary", hp: 200, attack: 35, defense: 20, ability: "Dragon Breath", abilityDesc: "Deals massive fire damage to all enemies.", evolveLevel: 0 },
  { id: 1, pantheonId: 0, name: "Phoenix", type: "Avian", rarity: "Legendary", hp: 150, attack: 25, defense: 15, ability: "Rebirth Flame", abilityDesc: "Revives once upon defeat with half HP.", evolveLevel: 0 },
  { id: 2, pantheonId: 0, name: "Cerberus", type: "Beast", rarity: "Epic", hp: 120, attack: 20, defense: 18, ability: "Triple Bite", abilityDesc: "Attacks three times in one turn.", evolveLevel: 0 },
  { id: 3, pantheonId: 0, name: "Minotaur", type: "Beast", rarity: "Rare", hp: 100, attack: 22, defense: 15, ability: "Labyrinth Charge", abilityDesc: "Charges with unstoppable force, ignoring defense.", evolveLevel: 10 },
  { id: 4, pantheonId: 0, name: "Pegasus", type: "Avian", rarity: "Rare", hp: 80, attack: 15, defense: 12, ability: "Wind Gallop", abilityDesc: "Increases party speed for 3 turns.", evolveLevel: 10 },
  { id: 5, pantheonId: 0, name: "Chimera", type: "Chimera", rarity: "Epic", hp: 110, attack: 24, defense: 14, ability: "Tri-Element", abilityDesc: "Attacks with fire, ice, and lightning randomly.", evolveLevel: 0 },
  { id: 6, pantheonId: 1, name: "Fenrir", type: "Wolf", rarity: "Legendary", hp: 180, attack: 30, defense: 16, ability: "Devour", abilityDesc: "Instantly defeats enemies below 20% HP.", evolveLevel: 0 },
  { id: 7, pantheonId: 1, name: "Sleipnir", type: "Equine", rarity: "Epic", hp: 100, attack: 14, defense: 20, ability: "Eight-Legged Sprint", abilityDesc: "Grants extra turns in battle.", evolveLevel: 0 },
  { id: 8, pantheonId: 1, name: "Jormungandr", type: "Serpent", rarity: "Legendary", hp: 250, attack: 28, defense: 22, ability: "World Serpent Coils", abilityDesc: "Crushes enemies, reducing their defense over time.", evolveLevel: 0 },
  { id: 9, pantheonId: 1, name: "Huginn", type: "Avian", rarity: "Rare", hp: 60, attack: 10, defense: 8, ability: "Thought Scout", abilityDesc: "Reveals enemy weaknesses at battle start.", evolveLevel: 10 },
  { id: 10, pantheonId: 1, name: "Draugr", type: "Undead", rarity: "Common", hp: 70, attack: 16, defense: 10, ability: "Undead Resilience", abilityDesc: "Takes 25% less damage from all sources.", evolveLevel: 5 },
  { id: 11, pantheonId: 2, name: "Sphinx", type: "Chimera", rarity: "Epic", hp: 100, attack: 18, defense: 16, ability: "Riddle Bind", abilityDesc: "Stuns an enemy who fails to answer correctly.", evolveLevel: 0 },
  { id: 12, pantheonId: 2, name: "Ammit", type: "Beast", rarity: "Rare", hp: 90, attack: 20, defense: 14, ability: "Heart Devourer", abilityDesc: "Consumes a portion of enemy max HP.", evolveLevel: 10 },
  { id: 13, pantheonId: 2, name: "Uraeus", type: "Serpent", rarity: "Rare", hp: 75, attack: 18, defense: 10, ability: "Venom Strike", abilityDesc: "Poisons enemies for damage over time.", evolveLevel: 10 },
  { id: 14, pantheonId: 2, name: "Apopis", type: "Serpent", rarity: "Legendary", hp: 220, attack: 32, defense: 18, ability: "Chaos Eclipse", abilityDesc: "Plunges the battlefield into darkness, reducing enemy accuracy.", evolveLevel: 0 },
  { id: 15, pantheonId: 3, name: "Kitsune", type: "Spirit", rarity: "Epic", hp: 90, attack: 20, defense: 14, ability: "Fox Fire", abilityDesc: "Deals magical fire damage and can confuse enemies.", evolveLevel: 0 },
  { id: 16, pantheonId: 3, name: "Tengu", type: "Spirit", rarity: "Rare", hp: 85, attack: 22, defense: 12, ability: "Wind Slash", abilityDesc: "Swift air-based attack that never misses.", evolveLevel: 10 },
  { id: 17, pantheonId: 3, name: "Kappa", type: "Beast", rarity: "Common", hp: 70, attack: 14, defense: 16, ability: "Water Shield", abilityDesc: "Creates a protective water barrier.", evolveLevel: 5 },
  { id: 18, pantheonId: 3, name: "Baku", type: "Spirit", rarity: "Rare", hp: 80, attack: 12, defense: 18, ability: "Dream Eater", abilityDesc: "Consumes negative status effects from allies.", evolveLevel: 10 },
  { id: 19, pantheonId: 3, name: "Yamata no Orochi", type: "Serpent", rarity: "Legendary", hp: 300, attack: 35, defense: 20, ability: "Eight Head Assault", abilityDesc: "Attacks eight times, each with increasing damage.", evolveLevel: 0 },
  { id: 20, pantheonId: 4, name: "Banshee", type: "Spirit", rarity: "Rare", hp: 65, attack: 18, defense: 8, ability: "Death Wail", abilityDesc: "Reduces enemy attack by 30% for 3 turns.", evolveLevel: 10 },
  { id: 21, pantheonId: 4, name: " Each-uisge", type: "Beast", rarity: "Rare", hp: 95, attack: 20, defense: 12, ability: "Water Shape", abilityDesc: "Transforms and gains immunity to physical attacks.", evolveLevel: 10 },
  { id: 22, pantheonId: 4, name: "Aos Si", type: "Fey", rarity: "Epic", hp: 88, attack: 16, defense: 16, ability: "Fey Glamour", abilityDesc: "Creates illusions that confuse all enemies.", evolveLevel: 0 },
  { id: 23, pantheonId: 4, name: "Balor", type: "Giant", rarity: "Legendary", hp: 200, attack: 34, defense: 14, ability: "Evil Eye", abilityDesc: "One-Hit KO on enemies below 15% HP.", evolveLevel: 0 },
  { id: 24, pantheonId: 4, name: "Pooka", type: "Fey", rarity: "Common", hp: 60, attack: 12, defense: 10, ability: "Mischief", abilityDesc: "Randomly buffs or debuffs a target.", evolveLevel: 5 },
];

// ============================================================================
// STATIC DATA — Legendary Weapons (20 total)
// ============================================================================
const WEAPONS: Weapon[] = [
  { id: 0, pantheonId: 0, name: "Excalibur", rarity: "Legendary", attack: 45, speed: 8, special: "Holy Radiance", lore: "Sword of King Arthur, given by the Lady of the Lake. Its light disperses all darkness.", upgradeCost: 500 },
  { id: 1, pantheonId: 0, name: "Zeus's Thunderbolt", rarity: "Legendary", attack: 40, speed: 10, special: "Chain Lightning", lore: "Forged by the Cyclopes, this bolt carries the full fury of the storm god.", upgradeCost: 500 },
  { id: 2, pantheonId: 0, name: "Bow of Artemis", rarity: "Epic", attack: 30, speed: 12, special: "Silver Arrow", lore: "Artemis's bow never misses its mark. Each arrow gleams with moonlight.", upgradeCost: 350 },
  { id: 3, pantheonId: 0, name: "Aegis Shield", rarity: "Rare", attack: 15, speed: 6, special: "Divine Protection", lore: "Athena's shield, adorned with Medusa's head, turns enemies to stone.", upgradeCost: 200 },
  { id: 4, pantheonId: 1, name: "Mjolnir", rarity: "Legendary", attack: 48, speed: 7, special: "Thunder Strike", lore: "Thor's hammer returns to its wielder. Only the worthy may lift it.", upgradeCost: 500 },
  { id: 5, pantheonId: 1, name: "Gungnir", rarity: "Legendary", attack: 42, speed: 9, special: "Unerring Throw", lore: "Odin's spear always hits its target and cannot be blocked by any shield.", upgradeCost: 500 },
  { id: 6, pantheonId: 1, name: "Dainsleif", rarity: "Epic", attack: 32, speed: 8, special: "Doom Blade", lore: "King Hogni's cursed sword. Once drawn, it must claim a life before sheathing.", upgradeCost: 350 },
  { id: 7, pantheonId: 1, name: "Tyrfing", rarity: "Rare", attack: 25, speed: 7, special: "Cursed Edge", lore: "A dwarven-forged blade that brings misfortune but also great power.", upgradeCost: 200 },
  { id: 8, pantheonId: 2, name: "Khopesh of Horus", rarity: "Legendary", attack: 38, speed: 11, special: "Eye Strike", lore: "Blessed by Horus himself, this khopesh channels the power of the all-seeing eye.", upgradeCost: 500 },
  { id: 9, pantheonId: 2, name: "Was Scepter", rarity: "Epic", attack: 28, speed: 9, special: "Divine Authority", lore: "Symbol of pharaonic power. Commands the respect of gods and men.", upgradeCost: 350 },
  { id: 10, pantheonId: 2, name: "Ankh Blade", rarity: "Rare", attack: 22, speed: 8, special: "Life Drain", lore: "Forged in the shape of the ankh, this blade steals vitality from foes.", upgradeCost: 200 },
  { id: 11, pantheonId: 2, name: "Crook of Osiris", rarity: "Rare", attack: 18, speed: 6, special: "Resurrection", lore: "Osiris's crook can revive fallen allies once per battle.", upgradeCost: 200 },
  { id: 12, pantheonId: 3, name: "Kusanagi", rarity: "Legendary", attack: 40, speed: 12, special: "Wind Slice", lore: "Found in the tail of the Orochi, this blade controls the winds of creation.", upgradeCost: 500 },
  { id: 13, pantheonId: 3, name: "Ame-no-Murakumo", rarity: "Legendary", attack: 44, speed: 10, special: "Heavenly Cloud", lore: "The sword of the Gathering Clouds of Heaven, rival to Kusanagi in power.", upgradeCost: 500 },
  { id: 14, pantheonId: 3, name: "Totsuka-no-Tsurugi", rarity: "Epic", attack: 34, speed: 9, special: "Sealing Blade", lore: "Susanoo used this sword to slay Orochi and seal its remains.", upgradeCost: 350 },
  { id: 15, pantheonId: 3, name: "Magatama Wand", rarity: "Rare", attack: 20, speed: 8, special: "Spirit Channel", lore: "A comma-shaped jewel wand that amplifies spiritual power.", upgradeCost: 200 },
  { id: 16, pantheonId: 4, name: "Gae Bolg", rarity: "Legendary", attack: 46, speed: 11, special: "Barbed Spear", lore: "Cuchulainn's spear wounds that cannot heal. Once thrown, it strikes a hundred times.", upgradeCost: 500 },
  { id: 17, pantheonId: 4, name: "Fragarach", rarity: "Legendary", attack: 38, speed: 14, special: "Answerer", lore: "The Answerer forces truth from its targets and no lie can withstand its edge.", upgradeCost: 500 },
  { id: 18, pantheonId: 4, name: "Caladbolg", rarity: "Epic", attack: 30, speed: 10, special: "Rainbow Arc", lore: "Fergus mac Roich's two-handed sword creates a rainbow arc of devastation.", upgradeCost: 350 },
  { id: 19, pantheonId: 4, name: "Claíomh Solais", rarity: "Rare", attack: 24, speed: 9, special: "Blinding Light", lore: "The Sword of Light shines so brightly that none can gaze upon it.", upgradeCost: 200 },
];

// ============================================================================
// STATIC DATA — Artifacts (40 total, 8 per pantheon)
// ============================================================================
const ARTIFACTS: Artifact[] = [
  { id: 0, pantheonId: 0, name: "Golden Fleece", rarity: "Legendary", description: "The fleece of the golden ram, symbol of kingship.", bonusType: "defense", bonusValue: 20 },
  { id: 1, pantheonId: 0, name: "Ambrosia Vial", rarity: "Epic", description: "Nectar of the gods that grants temporary invulnerability.", bonusType: "vitality", bonusValue: 15 },
  { id: 2, pantheonId: 0, name: "Oracle Scroll", rarity: "Epic", description: "Contains prophecies from the Oracle of Delphi.", bonusType: "wisdom", bonusValue: 12 },
  { id: 3, pantheonId: 0, name: "Medusa's Gaze Shard", rarity: "Rare", description: "A fragment of petrifying power.", bonusType: "attack", bonusValue: 10 },
  { id: 4, pantheonId: 0, name: "Icarus Feather", rarity: "Rare", description: "A feather from Icarus's wings, still warm from the sun.", bonusType: "speed", bonusValue: 8 },
  { id: 5, pantheonId: 0, name: "Olympian Laurel", rarity: "Common", description: "A wreath of victory from the Olympic games.", bonusType: "xp", bonusValue: 5 },
  { id: 6, pantheonId: 0, name: "Trojan Coin", rarity: "Common", description: "A coin from ancient Troy.", bonusType: "gold", bonusValue: 5 },
  { id: 7, pantheonId: 0, name: "Siren Shell", rarity: "Uncommon", description: "A conch that echoes with enchanting songs.", bonusType: "charm", bonusValue: 7 },
  { id: 8, pantheonId: 1, name: "Mjolnir Fragment", rarity: "Legendary", description: "A shard of Mjolnir containing residual thunder power.", bonusType: "attack", bonusValue: 20 },
  { id: 9, pantheonId: 1, name: "Yggdrasil Leaf", rarity: "Epic", description: "A leaf from the World Tree that never withers.", bonusType: "vitality", bonusValue: 15 },
  { id: 10, pantheonId: 1, name: "Runestone of Odin", rarity: "Epic", description: "Contains the secrets of the runic alphabet.", bonusType: "wisdom", bonusValue: 12 },
  { id: 11, pantheonId: 1, name: "Valkyrie Feather", rarity: "Rare", description: "Dropped by a Valkyrie choosing the slain.", bonusType: "defense", bonusValue: 10 },
  { id: 12, pantheonId: 1, name: "Dwarf Gold Ring", rarity: "Rare", description: "Crafted by master smiths of Svartalfheim.", bonusType: "gold", bonusValue: 8 },
  { id: 13, pantheonId: 1, name: "Frost Giant Bone", rarity: "Common", description: "A bone fragment from Jotunheim.", bonusType: "attack", bonusValue: 5 },
  { id: 14, pantheonId: 1, name: "Aesir Coin", rarity: "Common", description: "Currency used in the halls of Asgard.", bonusType: "gold", bonusValue: 5 },
  { id: 15, pantheonId: 1, name: "Elf Rune Chip", rarity: "Uncommon", description: "A small rune chip from Alfheim.", bonusType: "wisdom", bonusValue: 7 },
  { id: 16, pantheonId: 2, name: "Eye of Ra", rarity: "Legendary", description: "The all-seeing eye of the sun god.", bonusType: "attack", bonusValue: 20 },
  { id: 17, pantheonId: 2, name: "Book of the Dead", rarity: "Epic", description: "Contains spells for navigating the Duat.", bonusType: "wisdom", bonusValue: 15 },
  { id: 18, pantheonId: 2, name: "Scarab Amulet", rarity: "Epic", description: "A symbol of rebirth and transformation.", bonusType: "vitality", bonusValue: 12 },
  { id: 19, pantheonId: 2, name: "Canopic Jar", rarity: "Rare", description: "Used in mummification to preserve organs.", bonusType: "defense", bonusValue: 10 },
  { id: 20, pantheonId: 2, name: "Papyrus Scroll", rarity: "Rare", description: "Ancient Egyptian writing with hidden knowledge.", bonusType: "wisdom", bonusValue: 8 },
  { id: 21, pantheonId: 2, name: "Scarab Beetle Shell", rarity: "Common", description: "A common symbol of Khepri.", bonusType: "xp", bonusValue: 5 },
  { id: 22, pantheonId: 2, name: "Faience Bead", rarity: "Common", description: "Egyptian blue ceramic bead.", bonusType: "gold", bonusValue: 5 },
  { id: 23, pantheonId: 2, name: "Desert Glass", rarity: "Uncommon", description: "Glass formed by meteorite impacts in the desert.", bonusType: "charm", bonusValue: 7 },
  { id: 24, pantheonId: 3, name: "Imperial Regalia Mirror", rarity: "Legendary", description: "Yata no Kagami, one of the three sacred treasures.", bonusType: "wisdom", bonusValue: 20 },
  { id: 25, pantheonId: 3, name: "Jewel of Magatama", rarity: "Epic", description: "Yasakani no Magatama, representing benevolence.", bonusType: "vitality", bonusValue: 15 },
  { id: 26, pantheonId: 3, name: "Spirit Lantern", rarity: "Epic", description: "A lantern that guides spirits during Obon.", bonusType: "defense", bonusValue: 12 },
  { id: 27, pantheonId: 3, name: "Origami Crane", rarity: "Rare", description: "Folded with a wish for a thousand years of happiness.", bonusType: "xp", bonusValue: 10 },
  { id: 28, pantheonId: 3, name: "Inari Fox Mask", rarity: "Rare", description: "A ceremonial mask worn at Inari shrines.", bonusType: "charm", bonusValue: 8 },
  { id: 29, pantheonId: 3, name: "Temizu Bowl", rarity: "Common", description: "A purification bowl from a Shinto shrine.", bonusType: "vitality", bonusValue: 5 },
  { id: 30, pantheonId: 3, name: "Shimenawa Rope", rarity: "Common", description: "Sacred rope marking a purified space.", bonusType: "defense", bonusValue: 5 },
  { id: 31, pantheonId: 3, name: "Omamori Charm", rarity: "Uncommon", description: "A protective amulet from a shrine.", bonusType: "defense", bonusValue: 7 },
  { id: 32, pantheonId: 4, name: "Cauldron of Dagda", rarity: "Legendary", description: "An inexhaustible cauldron that feeds all who come.", bonusType: "vitality", bonusValue: 20 },
  { id: 33, pantheonId: 4, name: "Lia Fail", rarity: "Epic", description: "The Stone of Destiny that roars when a true king stands upon it.", bonusType: "wisdom", bonusValue: 15 },
  { id: 34, pantheonId: 4, name: "Silver Branch", rarity: "Epic", description: "A branch from the Otherworld that plays enchanting music.", bonusType: "charm", bonusValue: 12 },
  { id: 35, pantheonId: 4, name: "Clootie Rag", rarity: "Rare", description: "A rag tied to a sacred tree carrying wishes.", bonusType: "xp", bonusValue: 10 },
  { id: 36, pantheonId: 4, name: "Ogham Stone", rarity: "Rare", description: "Inscribed with ancient Celtic tree alphabet.", bonusType: "wisdom", bonusValue: 8 },
  { id: 37, pantheonId: 4, name: "Rowan Berry", rarity: "Common", description: "A berry from the sacred rowan tree.", bonusType: "defense", bonusValue: 5 },
  { id: 38, pantheonId: 4, name: "Brigid's Flame Ember", rarity: "Common", description: "An ember from the eternal flame of Brigid.", bonusType: "attack", bonusValue: 5 },
  { id: 39, pantheonId: 4, name: "Fairy Ring Mushroom", rarity: "Uncommon", description: "A mushroom from a fairy ring circle.", bonusType: "charm", bonusValue: 7 },
];

// ============================================================================
// STATIC DATA — Quests (40 total, 8 per pantheon)
// ============================================================================
const QUESTS: Quest[] = [
  // --- Greek ---
  { id: 0, pantheonId: 0, name: "Olympian Trial", type: "Trial", difficulty: 1, description: "Solve the riddle of the Sphinx to enter Olympus.", objective: "Solve 5 word puzzles", xpReward: 50, goldReward: 30, requiredLevel: 1 },
  { id: 1, pantheonId: 0, name: "Satyr's Challenge", type: "Battle", difficulty: 2, description: "Defeat a mischievous satyr in a word duel.", objective: "Type 3 words of 5+ letters", xpReward: 80, goldReward: 50, requiredLevel: 3 },
  { id: 2, pantheonId: 0, name: "Labyrinth Quest", type: "Exploration", difficulty: 3, description: "Navigate the Labyrinth of Minos and find hidden mythological terms.", objective: "Find 6 hidden words", xpReward: 120, goldReward: 70, requiredLevel: 5 },
  { id: 3, pantheonId: 0, name: "Oracle's Riddle", type: "Riddle", difficulty: 4, description: "The Oracle of Delphi poses three cryptic riddles.", objective: "Answer 3 mythological riddles", xpReward: 150, goldReward: 90, requiredLevel: 8 },
  { id: 4, pantheonId: 0, name: "Battle of Marathon", type: "Battle", difficulty: 5, description: "Join the Greek warriors and fight with the power of words.", objective: "Defeat the Persian champion", xpReward: 200, goldReward: 120, requiredLevel: 10 },
  { id: 5, pantheonId: 0, name: "Herculean Trial", type: "Trial", difficulty: 6, description: "Complete a series of word challenges modeled after the Twelve Labors.", objective: "Complete 10 word trials", xpReward: 300, goldReward: 180, requiredLevel: 15 },
  { id: 6, pantheonId: 0, name: "Trojan War", type: "LegendaryEncounter", difficulty: 8, description: "Enter the legendary Trojan War and face Achilles himself.", objective: "Defeat Achilles in word combat", xpReward: 500, goldReward: 300, requiredLevel: 25 },
  { id: 7, pantheonId: 0, name: "Titan's Wrath", type: "LegendaryEncounter", difficulty: 10, description: "Face the unleashed Titan Kronos in the depths of Tartarus.", objective: "Survive 15 turns against Kronos", xpReward: 800, goldReward: 500, requiredLevel: 40 },
  // --- Norse ---
  { id: 8, pantheonId: 1, name: "Bifrost Crossing", type: "Exploration", difficulty: 1, description: "Cross the rainbow bridge by discovering runic words.", objective: "Find 5 runic words", xpReward: 50, goldReward: 30, requiredLevel: 1 },
  { id: 9, pantheonId: 1, name: "Valkyrie's Test", type: "Trial", difficulty: 2, description: "Prove your worthiness to the Valkyries through word trials.", objective: "Solve 4 word puzzles", xpReward: 80, goldReward: 50, requiredLevel: 3 },
  { id: 10, pantheonId: 1, name: "Jotunheim Raid", type: "Battle", difficulty: 3, description: "Battle frost giants using the power of ancient Norse words.", objective: "Defeat 2 frost giants", xpReward: 120, goldReward: 70, requiredLevel: 5 },
  { id: 11, pantheonId: 1, name: "Mimir's Well", type: "Riddle", difficulty: 4, description: "Drink from Mimir's well and answer his cosmic riddles.", objective: "Answer 4 wisdom riddles", xpReward: 150, goldReward: 90, requiredLevel: 8 },
  { id: 12, pantheonId: 1, name: "Rune Master", type: "Trial", difficulty: 5, description: "Learn and master the runes by completing Futhark challenges.", objective: "Master 8 rune challenges", xpReward: 200, goldReward: 120, requiredLevel: 10 },
  { id: 13, pantheonId: 1, name: "Valkyrie Tournament", type: "Battle", difficulty: 7, description: "Compete in Asgard's grand tournament of warriors.", objective: "Win 3 consecutive battles", xpReward: 350, goldReward: 200, requiredLevel: 20 },
  { id: 14, pantheonId: 1, name: "Ragnarok Prelude", type: "LegendaryEncounter", difficulty: 9, description: "Witness the signs of Ragnarok and face Surtr the fire giant.", objective: "Defeat Surtr", xpReward: 600, goldReward: 400, requiredLevel: 35 },
  { id: 15, pantheonId: 1, name: "Fenrir Unleashed", type: "LegendaryEncounter", difficulty: 10, description: "Face the great wolf Fenrir as the world trembles.", objective: "Survive and defeat Fenrir", xpReward: 800, goldReward: 500, requiredLevel: 40 },
  // --- Egyptian ---
  { id: 16, pantheonId: 2, name: "Pyramid Inscription", type: "Exploration", difficulty: 1, description: "Explore a pyramid and decipher ancient hieroglyphic words.", objective: "Decode 5 hieroglyphs", xpReward: 50, goldReward: 30, requiredLevel: 1 },
  { id: 17, pantheonId: 2, name: "Sphinx Challenge", type: "Trial", difficulty: 2, description: "Solve the Sphinx's word puzzles to pass through the desert.", objective: "Solve 4 puzzles", xpReward: 80, goldReward: 50, requiredLevel: 3 },
  { id: 18, pantheonId: 2, name: "Anubis Judgment", type: "Riddle", difficulty: 3, description: "Stand before Anubis and answer questions of life and death.", objective: "Answer 3 judgment riddles", xpReward: 120, goldReward: 70, requiredLevel: 5 },
  { id: 19, pantheonId: 2, name: "Nile Crocodile Hunt", type: "Battle", difficulty: 4, description: "Battle the sacred crocodiles of the Nile.", objective: "Defeat 3 crocodiles", xpReward: 150, goldReward: 90, requiredLevel: 8 },
  { id: 20, pantheonId: 2, name: "Book of the Dead", type: "Exploration", difficulty: 5, description: "Navigate through the spells of the Book of the Dead.", objective: "Find 7 hidden spell words", xpReward: 200, goldReward: 120, requiredLevel: 10 },
  { id: 21, pantheonId: 2, name: "Sun Boat Journey", type: "Trial", difficulty: 7, description: "Help Ra cross the Duat by repelling Apophis's servants.", objective: "Complete 8 night trials", xpReward: 350, goldReward: 200, requiredLevel: 20 },
  { id: 22, pantheonId: 2, name: "Apopis Assault", type: "LegendaryEncounter", difficulty: 9, description: "Face the serpent Apophis who threatens to devour the sun.", objective: "Defeat Apophis", xpReward: 600, goldReward: 400, requiredLevel: 35 },
  { id: 23, pantheonId: 2, name: "Osiris's Court", type: "LegendaryEncounter", difficulty: 10, description: "Stand trial in the Hall of Judgment before Osiris.", objective: "Pass the weighing of the heart", xpReward: 800, goldReward: 500, requiredLevel: 40 },
  // --- Japanese ---
  { id: 24, pantheonId: 3, name: "Shrine Words", type: "Exploration", difficulty: 1, description: "Discover sacred words hidden around a Shinto shrine.", objective: "Find 5 shrine words", xpReward: 50, goldReward: 30, requiredLevel: 1 },
  { id: 25, pantheonId: 3, name: "Kami Trial", type: "Trial", difficulty: 2, description: "Undergo purification trials at a sacred waterfall.", objective: "Complete 4 purification puzzles", xpReward: 80, goldReward: 50, requiredLevel: 3 },
  { id: 26, pantheonId: 3, name: "Yokai Battle", type: "Battle", difficulty: 3, description: "Face mischievous yokai in word combat.", objective: "Defeat 3 yokai", xpReward: 120, goldReward: 70, requiredLevel: 5 },
  { id: 27, pantheonId: 3, name: "Koan Meditation", type: "Riddle", difficulty: 4, description: "Meditate on Zen koans and find enlightenment through words.", objective: "Answer 4 koan riddles", xpReward: 150, goldReward: 90, requiredLevel: 8 },
  { id: 28, pantheonId: 3, name: "Bamboo Cutter", type: "Exploration", difficulty: 5, description: "Follow the tale of Princess Kaguya through word discovery.", objective: "Find 8 story words", xpReward: 200, goldReward: 120, requiredLevel: 10 },
  { id: 29, pantheonId: 3, name: "Tengu Challenge", type: "Battle", difficulty: 7, description: "Face the Great Tengu in a martial arts word duel.", objective: "Defeat the Great Tengu", xpReward: 350, goldReward: 200, requiredLevel: 20 },
  { id: 30, pantheonId: 3, name: "Orochi Slayer", type: "LegendaryEncounter", difficulty: 9, description: "Relive Susanoo's legendary battle against the eight-headed serpent.", objective: "Defeat Orochi", xpReward: 600, goldReward: 400, requiredLevel: 35 },
  { id: 31, pantheonId: 3, name: "Amaterasu's Return", type: "LegendaryEncounter", difficulty: 10, description: "Help bring Amaterasu out of her cave and restore light to the world.", objective: "Complete the celestial challenge", xpReward: 800, goldReward: 500, requiredLevel: 40 },
  // --- Celtic ---
  { id: 32, pantheonId: 4, name: "Fairy Ring", type: "Exploration", difficulty: 1, description: "Step into a fairy ring and discover words of power.", objective: "Find 5 fairy words", xpReward: 50, goldReward: 30, requiredLevel: 1 },
  { id: 33, pantheonId: 4, name: "Bard's Song", type: "Trial", difficulty: 2, description: "Complete the bard's unfinished verses with poetic words.", objective: "Complete 4 verse puzzles", xpReward: 80, goldReward: 50, requiredLevel: 3 },
  { id: 34, pantheonId: 4, name: "Sidhe Battle", type: "Battle", difficulty: 3, description: "Battle the fairy folk of the Sidhe mounds.", objective: "Defeat 3 fairy warriors", xpReward: 120, goldReward: 70, requiredLevel: 5 },
  { id: 35, pantheonId: 4, name: "Druid's Riddle", type: "Riddle", difficulty: 4, description: "Answer the ancient druid's nature-based riddles.", objective: "Answer 4 druid riddles", xpReward: 150, goldReward: 90, requiredLevel: 8 },
  { id: 36, pantheonId: 4, name: "Otherworld Journey", type: "Exploration", difficulty: 6, description: "Journey to Tir na Nog and discover its hidden lore.", objective: "Find 8 lore words", xpReward: 250, goldReward: 150, requiredLevel: 12 },
  { id: 37, pantheonId: 4, name: "Cattle Raid", type: "Battle", difficulty: 7, description: "Join the legendary cattle raid of Cooley.", objective: "Win 4 battles", xpReward: 350, goldReward: 200, requiredLevel: 20 },
  { id: 38, pantheonId: 4, name: "Morrigan's Call", type: "LegendaryEncounter", difficulty: 9, description: "Answer the Morrigan's call and face her champion.", objective: "Defeat the Morrigan's champion", xpReward: 600, goldReward: 400, requiredLevel: 35 },
  { id: 39, pantheonId: 4, name: "Red Branch Trial", type: "LegendaryEncounter", difficulty: 10, description: "Face the ultimate challenge of the Red Branch warriors.", objective: "Defeat Cuchulainn", xpReward: 800, goldReward: 500, requiredLevel: 40 },
];

// ============================================================================
// STATIC DATA — Hero Classes (8 total)
// ============================================================================
const HERO_CLASSES: HeroClass[] = [
  { id: 0, name: "Warrior", description: "Masters of melee combat with unmatched strength.", baseStats: { str: 10, int: 4, dex: 6, vit: 8 }, passiveAbility: "Battle Hardiness", passiveDesc: "Take 10% less damage in combat." },
  { id: 1, name: "Mage", description: "Wielders of arcane power who channel divine forces.", baseStats: { str: 3, int: 12, dex: 5, vit: 5 }, passiveAbility: "Arcane Amplifier", passiveDesc: "Spell damage increased by 15%." },
  { id: 2, name: "Paladin", description: "Holy warriors blessed by the gods themselves.", baseStats: { str: 7, int: 6, dex: 5, vit: 10 }, passiveAbility: "Divine Shield", passiveDesc: "Gain 5 HP regeneration each turn." },
  { id: 3, name: "Ranger", description: "Swift hunters who strike from a distance with precision.", baseStats: { str: 5, int: 5, dex: 11, vit: 6 }, passiveAbility: "Keen Eye", passiveDesc: "Chance to score critical hits with long words." },
  { id: 4, name: "Assassin", description: "Shadow stalkers who deliver lethal strikes.", baseStats: { str: 6, int: 4, dex: 12, vit: 4 }, passiveAbility: "Backstab", passiveDesc: "First attack in each battle deals double damage." },
  { id: 5, name: "Bard", description: "Performer-heroes whose songs inspire and disrupt.", baseStats: { str: 3, int: 8, dex: 7, vit: 6 }, passiveAbility: "Battle Song", passiveDesc: "All damage increased by 5% for each blessing active." },
  { id: 6, name: "Cleric", description: "Divine healers who channel the power of the gods.", baseStats: { str: 4, int: 9, dex: 4, vit: 9 }, passiveAbility: "Healing Light", passiveDesc: "Recover 3 HP after each word typed." },
  { id: 7, name: "Necromancer", description: "Dark scholars who command the forces of death.", baseStats: { str: 5, int: 10, dex: 4, vit: 7 }, passiveAbility: "Soul Harvest", passiveDesc: "Gain XP bonus when defeating enemies." },
];

// ============================================================================
// STATIC DATA — Skill Tree (30 skills, 5 branches, 6 each)
// ============================================================================
const SKILL_TREE: SkillNode[] = [
  // Combat branch
  { id: 0, branch: "Combat", tier: 1, name: "Power Strike", description: "Increase base attack power.", maxLevel: 5, effectPerLevel: 2, requires: null },
  { id: 1, branch: "Combat", tier: 2, name: "Weapon Mastery", description: "Gain bonus damage from equipped weapons.", maxLevel: 5, effectPerLevel: 3, requires: 0 },
  { id: 2, branch: "Combat", tier: 3, name: "Battle Rage", description: "Increase damage as HP decreases.", maxLevel: 5, effectPerLevel: 4, requires: 1 },
  { id: 3, branch: "Combat", tier: 4, name: "Critical Edge", description: "Improve critical hit chance.", maxLevel: 3, effectPerLevel: 5, requires: 2 },
  { id: 4, branch: "Combat", tier: 5, name: "Berserker Fury", description: "Unleash devastating attacks when below 30% HP.", maxLevel: 3, effectPerLevel: 8, requires: 3 },
  { id: 5, branch: "Combat", tier: 6, name: "Warlord", description: "Master of all combat arts. Massive damage boost.", maxLevel: 1, effectPerLevel: 15, requires: 4 },
  // Magic branch
  { id: 6, branch: "Magic", tier: 1, name: "Arcane Focus", description: "Increase intelligence-based damage.", maxLevel: 5, effectPerLevel: 2, requires: null },
  { id: 7, branch: "Magic", tier: 2, name: "Elemental Affinity", description: "Boost elemental word damage.", maxLevel: 5, effectPerLevel: 3, requires: 6 },
  { id: 8, branch: "Magic", tier: 3, name: "Spell Penetration", description: "Reduce enemy magic resistance.", maxLevel: 5, effectPerLevel: 3, requires: 7 },
  { id: 9, branch: "Magic", tier: 4, name: "Mana Surge", description: "Occasionally deal double spell damage.", maxLevel: 3, effectPerLevel: 5, requires: 8 },
  { id: 10, branch: "Magic", tier: 5, name: "Arcane Shield", description: "Absorb damage based on intelligence.", maxLevel: 3, effectPerLevel: 6, requires: 9 },
  { id: 11, branch: "Magic", tier: 6, name: "Archmage", description: "Supreme magical mastery. All spells empowered.", maxLevel: 1, effectPerLevel: 15, requires: 10 },
  // Wisdom branch
  { id: 12, branch: "Wisdom", tier: 1, name: "Quick Study", description: "Increase XP gained from all sources.", maxLevel: 5, effectPerLevel: 3, requires: null },
  { id: 13, branch: "Wisdom", tier: 2, name: "Word Lore", description: "Unlock bonus effects for longer words.", maxLevel: 5, effectPerLevel: 2, requires: 12 },
  { id: 14, branch: "Wisdom", tier: 3, name: "Divine Insight", description: "Chance to reveal hidden words.", maxLevel: 5, effectPerLevel: 3, requires: 13 },
  { id: 15, branch: "Wisdom", tier: 4, name: "Riddle Master", description: "Bonus rewards from riddle quests.", maxLevel: 3, effectPerLevel: 10, requires: 14 },
  { id: 16, branch: "Wisdom", tier: 5, name: "Sage's Knowledge", description: "Unlock encyclopedia entries faster.", maxLevel: 3, effectPerLevel: 5, requires: 15 },
  { id: 17, branch: "Wisdom", tier: 6, name: "Oracle", description: "See through all riddles instantly.", maxLevel: 1, effectPerLevel: 20, requires: 16 },
  // Stealth branch
  { id: 18, branch: "Stealth", tier: 1, name: "Shadow Step", description: "Increase dexterity and evasion.", maxLevel: 5, effectPerLevel: 2, requires: null },
  { id: 19, branch: "Stealth", tier: 2, name: "Ambush", description: "First word in battle deals bonus damage.", maxLevel: 5, effectPerLevel: 4, requires: 18 },
  { id: 20, branch: "Stealth", tier: 3, name: "Poison Words", description: "Longer words poison enemies.", maxLevel: 5, effectPerLevel: 2, requires: 19 },
  { id: 21, branch: "Stealth", tier: 4, name: "Vanish", description: "Chance to dodge enemy attacks.", maxLevel: 3, effectPerLevel: 5, requires: 20 },
  { id: 22, branch: "Stealth", tier: 5, name: "Death Mark", description: "Mark enemies for 20% bonus damage.", maxLevel: 3, effectPerLevel: 6, requires: 21 },
  { id: 23, branch: "Stealth", tier: 6, name: "Shadow Lord", description: "Ultimate stealth. Invisible first turn.", maxLevel: 1, effectPerLevel: 15, requires: 22 },
  // Divine branch
  { id: 24, branch: "Divine", tier: 1, name: "Faith", description: "Increase blessing duration.", maxLevel: 5, effectPerLevel: 1, requires: null },
  { id: 25, branch: "Divine", tier: 2, name: "Divine Favor", description: "Increase blessing effectiveness.", maxLevel: 5, effectPerLevel: 3, requires: 24 },
  { id: 26, branch: "Divine", tier: 3, name: "Prayer", description: "Recover HP when receiving blessings.", maxLevel: 5, effectPerLevel: 5, requires: 25 },
  { id: 27, branch: "Divine", tier: 4, name: "Holy Aura", description: "Passive resistance to all damage types.", maxLevel: 3, effectPerLevel: 3, requires: 26 },
  { id: 28, branch: "Divine", tier: 5, name: "Miracle", description: "Chance to survive a lethal blow once per battle.", maxLevel: 3, effectPerLevel: 5, requires: 27 },
  { id: 29, branch: "Divine", tier: 6, name: "Demigod", description: "Ascend to demigod status. All stats boosted.", maxLevel: 1, effectPerLevel: 10, requires: 28 },
];

// ============================================================================
// STATIC DATA — Achievements (15 total)
// ============================================================================
const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first_blessing", name: "First Blessing", description: "Receive your first deity blessing.", icon: "✨", condition: "blessing_count >= 1" },
  { id: "level_10", name: "Rising Hero", description: "Reach hero level 10.", icon: "⬆️", condition: "level >= 10" },
  { id: "level_30", name: "Legendary Hero", description: "Reach hero level 30.", icon: "🌟", condition: "level >= 30" },
  { id: "level_60", name: "Mythic Ascendant", description: "Reach the maximum hero level 60.", icon: "👑", condition: "level >= 60" },
  { id: "pantheon_master", name: "Pantheon Master", description: "Complete all quests in any pantheon.", icon: "🏛️", condition: "pantheon_complete" },
  { id: "legendary_collector", name: "Legendary Collector", description: "Collect 5 legendary items.", icon: "💎", condition: "legendary_count >= 5" },
  { id: "creature_tamer", name: "Creature Tamer", description: "Tame 10 mythological creatures.", icon: "🐾", condition: "creatures_tamed >= 10" },
  { id: "word_scholar", name: "Word Scholar", description: "Type 1,000 words in battle.", icon: "📚", condition: "total_words >= 1000" },
  { id: "battlemaster", name: "Battlemaster", description: "Win 50 battles.", icon: "⚔️", condition: "battles_won >= 50" },
  { id: "explorer", name: "Realm Explorer", description: "Visit all 5 mythological realms.", icon: "🗺️", condition: "realms_visited >= 5" },
  { id: "encyclopedia_master", name: "Lore Master", description: "Unlock 30 encyclopedia entries.", icon: "📖", condition: "lore_unlocked >= 30" },
  { id: "prophecy_fulfiller", name: "Fate Weaver", description: "Fulfill 10 prophecies.", icon: "🔮", condition: "prophecies_fulfilled >= 10" },
  { id: "daily_devotee", name: "Daily Devotee", description: "Complete 7 daily quests.", icon: "📅", condition: "dailies_completed >= 7" },
  { id: "alliance_builder", name: "Alliance Architect", description: "Max alliance level with any deity.", icon: "🤝", condition: "max_alliance >= 10" },
  { id: "weapon_master", name: "Weapon Master", description: "Equip and upgrade 10 weapons.", icon: "🗡️", condition: "weapons_upgraded >= 10" },
];

// ============================================================================
// STATIC DATA — Prophecies (10 templates)
// ============================================================================
const PROPHECIES: Prophecy[] = [
  { id: 0, text: "When the silver moon aligns with the golden sun, a trial of wisdom shall open in Olympus.", type: "quest", pantheonId: 0, difficulty: 5, reward: "50 XP, Oracle Scroll" },
  { id: 1, text: "Beware the serpent beneath the waves; its coils tighten when heroes grow bold.", type: "warning", pantheonId: 1, difficulty: 7, reward: "Damage shield" },
  { id: 2, text: "The scarab of dawn carries fortune to those who walk the path of Ra.", type: "reward", pantheonId: 2, difficulty: 1, reward: "Scarab Amulet" },
  { id: 3, text: "In the garden of the kami, a cherry blossom falls for every word of truth spoken.", type: "challenge", pantheonId: 3, difficulty: 4, reward: "100 XP" },
  { id: 4, text: "The fairy queen offers a bargain: solve her riddle, and the Otherworld opens to you.", type: "quest", pantheonId: 4, difficulty: 6, reward: "Silver Branch" },
  { id: 5, text: "A storm of words approaches from the north; only the well-prepared shall endure.", type: "warning", pantheonId: 1, difficulty: 8, reward: "100 XP, Dwarf Gold Ring" },
  { id: 6, text: "The phoenix rises from ashes, and so too shall your power when you face defeat.", type: "reward", pantheonId: 0, difficulty: 1, reward: "HP Restore" },
  { id: 7, text: "Deep beneath the pyramids, the Book of the Dead whispers secrets of immortality.", type: "challenge", pantheonId: 2, difficulty: 9, reward: "Book of the Dead" },
  { id: 8, text: "The tengu laughs in the mountain mist, challenging mortals to a duel of wits.", type: "quest", pantheonId: 3, difficulty: 5, reward: "75 XP, Inari Fox Mask" },
  { id: 9, text: "When the last leaf falls from the World Tree, the final battle shall begin.", type: "warning", pantheonId: 4, difficulty: 10, reward: "500 XP" },
];

// ============================================================================
// STATIC DATA — Lore / Encyclopedia (40 entries, 8 per pantheon)
// ============================================================================
const LORE_ENTRIES: LoreEntry[] = [
  { id: 0, category: "creation", title: "The Chaos of Origins", content: "Before time, there was Chaos — the vast, formless void from which all things emerged. Gaea (Earth) and Uranus (Sky) were born from Chaos, beginning the Greek cosmogony.", pantheonId: 0, unlocked: false },
  { id: 1, category: "deity", title: "Zeus's Rise to Power", content: "Zeus overthrew his father Cronus by forcing him to regurgitate his siblings, then led the Olympians in a ten-year war against the Titans, establishing his reign on Mount Olympus.", pantheonId: 0, unlocked: false },
  { id: 2, category: "hero", title: "The Twelve Labors of Heracles", content: "Heracles performed twelve impossible tasks as penance: slaying the Nemean Lion, capturing the Cerberus, obtaining the Golden Fleece, and more.", pantheonId: 0, unlocked: false },
  { id: 3, category: "creature", title: "The Minotaur's Labyrinth", content: "Born from Queen Pasiphae and a divine bull, the Minotaur was imprisoned in Daedalus's Labyrinth on Crete, fed with Athenian tributes until slain by Theseus.", pantheonId: 0, unlocked: false },
  { id: 4, category: "artifact", title: "Pandora's Box", content: "Pandora, the first woman, opened a jar (later mistranslated as a box) releasing all evils into the world. Only Hope remained inside.", pantheonId: 0, unlocked: false },
  { id: 5, category: "realm", title: "The Underworld", content: "Ruled by Hades, the Greek Underworld contained the Asphodel Meadows, Elysium for heroes, and Tartarus for the wicked. The river Styx separated the living from the dead.", pantheonId: 0, unlocked: false },
  { id: 6, category: "war", title: "The Trojan War", content: "Sparked by the Judgment of Paris and the abduction of Helen, the ten-year Trojan War involved the greatest Greek heroes and ended with the stratagem of the wooden horse.", pantheonId: 0, unlocked: false },
  { id: 7, category: "prophecy", title: "The Oracle of Delphi", content: "The Oracle at Delphi was the mouthpiece of Apollo, delivering prophecies that shaped the course of Greek history. Her cryptic words were interpreted by priests.", pantheonId: 0, unlocked: false },
  // Norse
  { id: 8, category: "creation", title: "Ymir and the World Tree", content: "Ymir, the primordial giant, was slain by Odin and his brothers. From Ymir's body they created Midgard, and the great ash Yggdrasil holds all nine worlds together.", pantheonId: 1, unlocked: false },
  { id: 9, category: "deity", title: "Odin's Quest for Wisdom", content: "Odin sacrificed his eye at Mimir's well and hung himself from Yggdrasil for nine days to learn the secrets of the runes, gaining unmatched wisdom.", pantheonId: 1, unlocked: false },
  { id: 10, category: "hero", title: "The Saga of Sigurd", content: "Sigurd slew the dragon Fafnir, tasted the dragon's blood to understand birds, and won the cursed treasure of the Nibelungs, fulfilling a tragic prophecy.", pantheonId: 1, unlocked: false },
  { id: 11, category: "creature", title: "Fenrir the Great Wolf", content: "Fenrir, son of Loki, grew so large that the gods bound him with the magical ribbon Gleipnir. At Ragnarok, he will swallow Odin whole.", pantheonId: 1, unlocked: false },
  { id: 12, category: "artifact", title: "Mjolnir's Forging", content: "The dwarven brothers Sindri and Brokkr forged Mjolnir in their furnace. Loki interfered, causing the hammer's handle to be slightly too short.", pantheonId: 1, unlocked: false },
  { id: 13, category: "realm", title: "The Nine Worlds", content: "Connected by Yggdrasil, the nine worlds include Asgard (gods), Midgard (humans), Jotunheim (giants), Helheim (dead), Alfheim (elves), and more.", pantheonId: 1, unlocked: false },
  { id: 14, category: "war", title: "Ragnarok", content: "The prophesied end of the world: gods battle giants, Fenrir devours Odin, Thor falls to Jormungandr, and the world is reborn from flood waters.", pantheonId: 1, unlocked: false },
  { id: 15, category: "prophecy", title: "The Norns", content: "Three women — Urd (Past), Verdandi (Present), and Skuld (Future) — weave the fates of gods and men at the base of Yggdrasil.", pantheonId: 1, unlocked: false },
  // Egyptian
  { id: 16, category: "creation", title: "The Heliopolitan Ennead", content: "Atum created himself from the primordial waters of Nun, then produced Shu and Tefnut, beginning the Ennead — the nine great gods of Heliopolis.", pantheonId: 2, unlocked: false },
  { id: 17, category: "deity", title: "Osiris and the Afterlife", content: "Osiris, murdered and dismembered by Set, was reassembled by Isis and became lord of the Duat, judging the dead in the Hall of Truth.", pantheonId: 2, unlocked: false },
  { id: 18, category: "hero", title: "The Tale of Sinuhe", content: "Sinuhe, an official of the court, fled Egypt after the pharaoh's assassination and lived among Asiatics before returning home to a triumphant reception.", pantheonId: 2, unlocked: false },
  { id: 19, category: "creature", title: "The Sphinx of Giza", content: "The Great Sphinx guards the Giza plateau, a lion with a human head. In myth, sphinxes posed deadly riddles to travelers.", pantheonId: 2, unlocked: false },
  { id: 20, category: "artifact", title: "The Canopic Jars", content: "Four jars — Imsety (liver), Hapy (lungs), Duamutef (stomach), Qebehsenuef (intestines) — preserved organs for the afterlife journey.", pantheonId: 2, unlocked: false },
  { id: 21, category: "realm", title: "The Duat", content: "The Egyptian underworld was a dangerous realm through which Ra sailed each night, facing demons and the serpent Apophis before dawn.", pantheonId: 2, unlocked: false },
  { id: 22, category: "war", title: "The Contendings of Horus and Set", content: "Horus and Set battled for 80 years over the throne of Egypt. Horus ultimately triumphed, restoring order under Ma'at.", pantheonId: 2, unlocked: false },
  { id: 23, category: "prophecy", title: "The Book of Thoth", content: "Said to contain all knowledge of the universe, reading the Book of Thoth grants immense power but drives the reader mad.", pantheonId: 2, unlocked: false },
  // Japanese
  { id: 24, category: "creation", title: "Izanagi and Izanami", content: "The divine couple Izanagi and Izanami stirred the primordial ocean with a jeweled spear, creating the Japanese islands and numerous kami.", pantheonId: 3, unlocked: false },
  { id: 25, category: "deity", title: "Amaterasu and the Heavenly Cave", content: "Amaterasu hid in a cave after Susanoo's rampage, plunging the world into darkness. She was lured out by a mirror and dance, restoring light.", pantheonId: 3, unlocked: false },
  { id: 26, category: "hero", title: "Yamato Takeru", content: "Prince Yamato Takeru possessed the sword Kusanagi and performed legendary feats across Japan before ascending to become a kami.", pantheonId: 3, unlocked: false },
  { id: 27, category: "creature", title: "The Eight-Headed Orochi", content: "Susanoo slew the eight-headed serpent Orochi, finding the sword Kusanagi in its tail and saving the maiden Kushinadahime.", pantheonId: 3, unlocked: false },
  { id: 28, category: "artifact", title: "The Three Sacred Treasures", content: "The Imperial Regalia of Japan: the mirror Yata no Kagami, the sword Kusanagi, and the jewel Yasakani no Magatama.", pantheonId: 3, unlocked: false },
  { id: 29, category: "realm", title: "Takamagahara", content: "The High Plain of Heaven, home to the kami and connected to earth by the Ama-no-Hashidate bridge.", pantheonId: 3, unlocked: false },
  { id: 30, category: "war", title: "The Tale of the Heike", content: "The Genpei War between the Minamoto and Taira clans, culminating in the fall of the Taira and the rise of the first shogunate.", pantheonId: 3, unlocked: false },
  { id: 31, category: "prophecy", title: "Omikuji Fortune", content: "Fortune slips at Shinto shrines range from great blessing (daikichi) to great curse (daikyo), guiding the faithful through life's uncertainties.", pantheonId: 3, unlocked: false },
  // Celtic
  { id: 32, category: "creation", title: "The Song of Amergin", content: "The Milesian poet Amergin sang the land of Ireland into being upon arrival, declaring himself the wind, the wave, and the stag.", pantheonId: 4, unlocked: false },
  { id: 33, category: "deity", title: "The Tuatha De Danann", content: "The Tribe of Danu were divine beings who ruled Ireland before the Milesians, later retreating to the Sidhe mounds and becoming the fairy folk.", pantheonId: 4, unlocked: false },
  { id: 34, category: "hero", title: "Cuchulainn's Warp Spasm", content: "The hero Cuchulainn could enter a terrifying battle frenzy, his body contorting as he single-handedly defended Ulster against Connacht's armies.", pantheonId: 4, unlocked: false },
  { id: 35, category: "creature", title: "The Each-uisge", content: "The Scottish water horse takes the form of a beautiful pony but drags riders into lochs to devour them.", pantheonId: 4, unlocked: false },
  { id: 36, category: "artifact", title: "The Cauldron of Dagda", content: "The Dagda's magic cauldron was inexhaustible — no one left it hungry — and could even revive the dead.", pantheonId: 4, unlocked: false },
  { id: 37, category: "realm", title: "Tir na Nog", content: "The Land of Youth, where time stands still, food is always abundant, and sorrow is unknown. Reached by traveling beyond the western sea.", pantheonId: 4, unlocked: false },
  { id: 38, category: "war", title: "The Cattle Raid of Cooley", content: "Queen Medb of Connacht invaded Ulster to steal the Brown Bull of Cooley, opposed only by the teenage hero Cuchulainn.", pantheonId: 4, unlocked: false },
  { id: 39, category: "prophecy", title: "The Prophecy of the Bard", content: "Celtic bards could see the future in their verses. Their satires could raise blisters on a king's face and their praise poems could heal wounds.", pantheonId: 4, unlocked: false },
];

// ============================================================================
// STATE MANAGEMENT — SSR-safe lazy initialization
// ============================================================================
let state: MythologyQuestState | null = null;
let dailiesCompletedCount = 0;
let propheciesFulfilledCount = 0;

function ensureInit(): MythologyQuestState {
  if (state) return state;
  state = createFreshState();
  return state;
}

function createFreshState(): MythologyQuestState {
  const initialSkills: Record<number, number> = {};
  for (let i = 0; i < SKILL_TREE.length; i++) initialSkills[i] = 0;
  return {
    level: 1,
    xp: 0,
    xpToNext: 100,
    gold: 50,
    heroClass: 0,
    activePantheon: 0,
    deityBlessings: [],
    equippedWeapon: -1,
    ownedWeapons: [],
    artifacts: [],
    creatures: [],
    questProgress: [],
    skillTree: initialSkills,
    allianceLevels: {},
    encyclopedia: {},
    dailyQuest: null,
    dailySeed: getTodaySeed(),
    dailyCompleted: false,
    achievements: [],
    totalQuestsCompleted: 0,
    totalBattlesWon: 0,
    totalCreaturesTamed: 0,
    totalArtifactsCollected: 0,
    totalWordsTyped: 0,
    totalDamageDealt: 0,
    currentBattle: null,
    activeProphecy: null,
    createdAt: Date.now(),
    lastSave: Date.now(),
  };
}

// --- Date-based seed for daily quests ---
function getTodaySeed(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

// --- Simple seeded random ---
function seededRandom(seed: string): () => number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 13), 0x45d9f3b);
    h = (h ^= h >>> 16) >>> 0;
    return (h & 0x7fffffff) / 0x7fffffff;
  };
}

// ============================================================================
// EXPORTED FUNCTIONS — State Management
// ============================================================================
export function myGetState(): MythologyQuestState {
  return ensureInit();
}

export function myResetState(): void {
  state = null;
  dailiesCompletedCount = 0;
  propheciesFulfilledCount = 0;
}

export function myImportState(data: MythologyQuestState): void {
  state = { ...data };
}

export function myExportState(): MythologyQuestState | null {
  return state ? { ...state } : null;
}

// ============================================================================
// EXPORTED FUNCTIONS — Hero
// ============================================================================
export function myGetHeroClasses(): HeroClass[] {
  return HERO_CLASSES;
}

export function myGetHeroClass(): HeroClass {
  const s = ensureInit();
  return HERO_CLASSES[s.heroClass] ?? HERO_CLASSES[0];
}

export function mySetHeroClass(classId: number): boolean {
  const s = ensureInit();
  if (classId < 0 || classId >= HERO_CLASSES.length) return false;
  s.heroClass = classId;
  return true;
}

export function myGetHeroStats(): { str: number; int: number; dex: number; vit: number; maxHp: number; attack: number } {
  const s = ensureInit();
  const cls = HERO_CLASSES[s.heroClass];
  const levelMult = 1 + (s.level - 1) * 0.12;

  let str = Math.floor(cls.baseStats.str * levelMult);
  let int = Math.floor(cls.baseStats.int * levelMult);
  let dex = Math.floor(cls.baseStats.dex * levelMult);
  let vit = Math.floor(cls.baseStats.vit * levelMult);

  // Apply blessings
  for (const b of s.deityBlessings) {
    if (b.turnsRemaining > 0) {
      switch (b.stat) {
        case "str": str += b.bonus; break;
        case "int": int += b.bonus; break;
        case "dex": dex += b.bonus; break;
        case "vit": vit += b.bonus; break;
        case "all": str += b.bonus; int += b.bonus; dex += b.bonus; vit += b.bonus; break;
      }
    }
  }

  // Apply weapon bonus
  if (s.equippedWeapon >= 0) {
    const wpn = s.ownedWeapons.find(w => w.weaponId === s.equippedWeapon);
    if (wpn) {
      const base = WEAPONS[s.equippedWeapon];
      str += Math.floor((base.attack + wpn.bonusAttack) * 0.5);
    }
  }

  // Apply skill bonuses
  const combatBonus = myGetSkillEffect(0) + myGetSkillEffect(1);
  const magicBonus = myGetSkillEffect(6);
  const stealthBonus = myGetSkillEffect(18);
  const divineBonus = myGetSkillEffect(29);
  str += combatBonus + stealthBonus;
  int += magicBonus + divineBonus;
  dex += stealthBonus + Math.floor(divineBonus / 2);
  vit += divineBonus;

  // Artifact bonuses
  for (const art of s.artifacts) {
    const def = ARTIFACTS[art.artifactId];
    switch (def.bonusType) {
      case "attack": str += art.bonus; break;
      case "defense": vit += art.bonus; break;
      case "vitality": vit += art.bonus; break;
      case "wisdom": int += art.bonus; break;
    }
  }

  const maxHp = 50 + vit * 5;
  const attack = 5 + str * 2 + int;

  return { str, int, dex, vit, maxHp, attack };
}

export function myGetLevel(): number {
  return ensureInit().level;
}

export function myAddXP(amount: number): { leveledUp: boolean; newLevel: number } {
  const s = ensureInit();
  const wisdomBonus = 1 + myGetSkillEffect(12) / 100;
  const xpGain = Math.floor(amount * wisdomBonus);
  s.xp += xpGain;
  let leveledUp = false;

  while (s.xp >= s.xpToNext && s.level < 60) {
    s.xp -= s.xpToNext;
    s.level++;
    s.xpToNext = Math.floor(100 * Math.pow(1.25, s.level - 1));
    leveledUp = true;
  }

  if (s.level >= 60) s.xp = 0;
  return { leveledUp, newLevel: s.level };
}

export function myGetGold(): number {
  return ensureInit().gold;
}

export function myAddGold(amount: number): void {
  const s = ensureInit();
  s.gold += amount;
}

// ============================================================================
// EXPORTED FUNCTIONS — Pantheon
// ============================================================================
export function myGetPantheons(): Pantheon[] {
  return PANTHEONS;
}

export function mySetActivePantheon(pantheonId: number): boolean {
  const s = ensureInit();
  if (pantheonId < 0 || pantheonId >= PANTHEONS.length) return false;
  s.activePantheon = pantheonId;
  return true;
}

export function myGetActivePantheon(): Pantheon {
  return PANTHEONS[ensureInit().activePantheon];
}

export function myGetPantheonDeities(pantheonId: number): Deity[] {
  return DEITIES.filter(d => d.pantheonId === pantheonId);
}

export function myGetPantheonCreatures(pantheonId: number): Creature[] {
  return CREATURES.filter(c => c.pantheonId === pantheonId);
}

// ============================================================================
// EXPORTED FUNCTIONS — Deity & Blessings
// ============================================================================
export function myGetDeities(): Deity[] {
  return DEITIES;
}

export function myGetDeityInfo(deityId: number): Deity | null {
  return DEITIES[deityId] ?? null;
}

export function myRequestBlessing(deityId: number): BlessingData | null {
  const s = ensureInit();
  const deity = DEITIES[deityId];
  if (!deity) return null;

  const faithBonus = 1 + myGetSkillEffect(24);
  const favorBonus = 1 + myGetSkillEffect(25) / 20;

  const blessing: BlessingData = {
    deityId,
    stat: deity.blessingStat,
    bonus: Math.floor(deity.blessingBonus * favorBonus),
    turnsRemaining: deity.blessingDuration + Math.floor(myGetSkillEffect(24)),
  };

  // Remove existing blessing from same deity
  s.deityBlessings = s.deityBlessings.filter(b => b.deityId !== deityId);
  s.deityBlessings.push(blessing);

  // Increase alliance
  const key = `deity_${deityId}`;
  s.allianceLevels[key] = (s.allianceLevels[key] ?? 0) + 1;

  // Prayer skill: recover HP
  const prayerHeal = myGetSkillEffect(26) * 5;
  if (prayerHeal > 0 && s.currentBattle) {
    s.currentBattle.heroHp = Math.min(s.currentBattle.heroMaxHp, s.currentBattle.heroHp + prayerHeal);
  }

  return blessing;
}

export function myGetActiveBlessings(): BlessingData[] {
  return ensureInit().deityBlessings.filter(b => b.turnsRemaining > 0);
}

export function myDecayBlessings(): BlessingData[] {
  const s = ensureInit();
  const expired: BlessingData[] = [];
  const remaining: BlessingData[] = [];
  for (const b of s.deityBlessings) {
    b.turnsRemaining--;
    if (b.turnsRemaining <= 0) expired.push(b);
    else remaining.push(b);
  }
  s.deityBlessings = remaining;
  return expired;
}

// ============================================================================
// EXPORTED FUNCTIONS — Quests
// ============================================================================
export function myGetQuests(pantheonId?: number): Quest[] {
  if (pantheonId !== undefined) return QUESTS.filter(q => q.pantheonId === pantheonId);
  return QUESTS;
}

export function myGetAvailableQuests(): Quest[] {
  const s = ensureInit();
  return QUESTS.filter(q => {
    if (s.level < q.requiredLevel) return false;
    const progress = s.questProgress.find(p => p.questId === q.id);
    return !progress || progress.status === "available" || progress.status === "failed";
  });
}

export function myStartQuest(questId: number): QuestProgress | null {
  const s = ensureInit();
  const quest = QUESTS[questId];
  if (!quest) return null;
  if (s.level < quest.requiredLevel) return null;

  const existing = s.questProgress.find(p => p.questId === questId);
  if (existing && existing.status === "active") return existing;
  if (existing && existing.status === "completed") return null;

  const progress: QuestProgress = {
    questId,
    status: "active",
    progress: 0,
    goal: quest.difficulty * 3 + 2,
    startTime: Date.now(),
  };

  // Remove old entry if exists
  s.questProgress = s.questProgress.filter(p => p.questId !== questId);
  s.questProgress.push(progress);
  return progress;
}

export function myAdvanceQuest(questId: number, amount?: number): QuestProgress | null {
  const s = ensureInit();
  const progress = s.questProgress.find(p => p.questId === questId && p.status === "active");
  if (!progress) return null;

  progress.progress += amount ?? 1;
  if (progress.progress >= progress.goal) {
    progress.status = "completed";
    const quest = QUESTS[questId];
    if (quest) {
      myAddXP(quest.xpReward);
      myAddGold(quest.goldReward);
      s.totalQuestsCompleted++;
    }
  }
  return progress;
}

export function myCompleteQuest(questId: number): { success: boolean; xpReward: number; goldReward: number } {
  const s = ensureInit();
  const progress = s.questProgress.find(p => p.questId === questId);
  if (!progress || progress.status !== "active") return { success: false, xpReward: 0, goldReward: 0 };

  progress.status = "completed";
  progress.progress = progress.goal;
  const quest = QUESTS[questId];
  if (!quest) return { success: true, xpReward: 0, goldReward: 0 };

  myAddXP(quest.xpReward);
  myAddGold(quest.goldReward);
  s.totalQuestsCompleted++;

  return { success: true, xpReward: quest.xpReward, goldReward: quest.goldReward };
}

export function myGetQuestRewards(questId: number): { xpReward: number; goldReward: number } | null {
  const quest = QUESTS[questId];
  if (!quest) return null;
  return { xpReward: quest.xpReward, goldReward: quest.goldReward };
}

export function myGetQuestProgress(): QuestProgress[] {
  return ensureInit().questProgress;
}

// ============================================================================
// EXPORTED FUNCTIONS — Combat / Battle
// ============================================================================
export function myStartBattle(enemyId: number): BattleState | null {
  const s = ensureInit();
  const creature = CREATURES[enemyId];
  if (!creature) return null;

  const stats = myGetHeroStats();
  const battle: BattleState = {
    active: true,
    enemyId,
    enemyHp: creature.hp + (creature.level ?? 1) * 10,
    enemyMaxHp: creature.hp + (creature.level ?? 1) * 10,
    enemyAttack: creature.attack,
    enemyName: creature.name,
    heroHp: stats.maxHp,
    heroMaxHp: stats.maxHp,
    turnCount: 0,
    wordsTyped: [],
    combo: 0,
    score: 0,
    result: "ongoing",
  };

  s.currentBattle = battle;
  return battle;
}

export function myPerformAttack(word: string): BattleState | null {
  const s = ensureInit();
  const battle = s.currentBattle;
  if (!battle || !battle.active || battle.result !== "ongoing") return null;

  battle.turnCount++;
  battle.wordsTyped.push(word);
  s.totalWordsTyped++;

  const stats = myGetHeroStats();
  const wordLength = word.length;

  // Base damage: word length * attack multiplier
  let damage = wordLength * 2 + Math.floor(stats.attack * 0.3);

  // Longer word bonus (4+ letters give scaling bonus)
  if (wordLength >= 4) damage += (wordLength - 3) * 3;

  // Combo bonus
  if (wordLength >= 5) {
    battle.combo++;
    damage += battle.combo * 2;
  } else {
    battle.combo = Math.max(0, battle.combo - 1);
  }

  // Mythological word bonus
  const mythWords = ["olympus", "valhalla", "thor", "zeus", "odin", "ra", "isis", "amaterasu", "cerberus", "mjolnir", "fenrir", "excalibur", "gungnir", "kusanagi", "dagda", "ragnarok", "duat", "asgard", "takamagahara", "hecatoncheires"];
  if (mythWords.includes(word.toLowerCase())) {
    damage = Math.floor(damage * 1.8);
  }

  // Crit chance for Rangers
  if (HERO_CLASSES[s.heroClass].name === "Ranger" && wordLength >= 7) {
    damage = Math.floor(damage * 1.5);
  }

  // Assassin backstab
  if (HERO_CLASSES[s.heroClass].name === "Assassin" && battle.turnCount === 1) {
    damage *= 2;
  }

  // Battle Rage skill: more damage at low HP
  const battleRageBonus = myGetSkillEffect(2);
  const hpPercent = battle.heroHp / battle.heroMaxHp;
  if (hpPercent < 0.5) {
    damage += Math.floor(battleRageBonus * (1 - hpPercent) * 2);
  }

  // Bard battle song
  if (HERO_CLASSES[s.heroClass].name === "Bard") {
    const blessingCount = s.deityBlessings.filter(b => b.turnsRemaining > 0).length;
    damage = Math.floor(damage * (1 + blessingCount * 0.05));
  }

  // Necromancer soul harvest XP bonus
  if (HERO_CLASSES[s.heroClass].name === "Necromancer") {
    damage = Math.floor(damage * 1.1);
  }

  // Cleric healing
  if (HERO_CLASSES[s.heroClass].name === "Cleric") {
    battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + 3);
  }

  // Apply poison from stealth skill
  const poisonBonus = myGetSkillEffect(20);
  if (poisonBonus > 0 && wordLength >= 6) {
    battle.enemyHp -= Math.floor(poisonBonus * 1.5);
  }

  // Apply damage
  battle.enemyHp -= damage;
  battle.score += damage;
  s.totalDamageDealt += damage;

  // Check if enemy is defeated
  if (battle.enemyHp <= 0) {
    battle.enemyHp = 0;
    battle.result = "won";
    battle.active = false;
    s.totalBattlesWon++;
    myAddXP(Math.floor(battle.score / 2));
    myAddGold(Math.floor(battle.score / 3));
    return battle;
  }

  // Enemy counter-attack
  const enemyDamage = Math.floor(battle.enemyAttack * (0.8 + Math.random() * 0.4));

  // Warrior passive: 10% damage reduction
  let finalEnemyDamage = enemyDamage;
  if (HERO_CLASSES[s.heroClass].name === "Warrior") {
    finalEnemyDamage = Math.floor(finalEnemyDamage * 0.9);
  }

  // Paladin passive: regen
  if (HERO_CLASSES[s.heroClass].name === "Paladin") {
    battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + 5);
  }

  // Holy aura
  const holyAura = myGetSkillEffect(27);
  finalEnemyDamage = Math.max(1, finalEnemyDamage - holyAura);

  // Miracle skill: survive lethal blow once
  const miracleLevel = myGetSkillEffect(28);
  if (battle.heroHp - finalEnemyDamage <= 0 && miracleLevel > 0 && battle.turnCount <= 3) {
    battle.heroHp = 1;
  } else {
    battle.heroHp -= finalEnemyDamage;
  }

  if (battle.heroHp <= 0) {
    battle.heroHp = 0;
    battle.result = "lost";
    battle.active = false;
  }

  myDecayBlessings();
  return battle;
}

export function myUseSkill(skillId: number): BattleState | null {
  const s = ensureInit();
  const battle = s.currentBattle;
  if (!battle || !battle.active || battle.result !== "ongoing") return null;

  const skill = SKILL_TREE[skillId];
  if (!skill) return null;
  const level = s.skillTree[skillId];
  if (level <= 0) return null;

  switch (skill.name) {
    case "Berserker Fury": {
      if (battle.heroHp / battle.heroMaxHp < 0.3) {
        const bonus = level * skill.effectPerLevel;
        battle.enemyHp -= bonus;
        battle.score += bonus;
        s.totalDamageDealt += bonus;
      }
      break;
    }
    case "Arcane Shield": {
      const shield = level * skill.effectPerLevel;
      battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + shield);
      break;
    }
    case "Vanish": {
      if (battle.turnCount <= 2) {
        const dodgeChance = level * skill.effectPerLevel;
        if (dodgeChance > 0) battle.heroHp = Math.min(battle.heroMaxHp, battle.heroHp + level * 10);
      }
      break;
    }
    case "Death Mark": {
      battle.enemyHp -= level * skill.effectPerLevel;
      battle.score += level * skill.effectPerLevel;
      break;
    }
    default:
      break;
  }

  if (battle.enemyHp <= 0) {
    battle.enemyHp = 0;
    battle.result = "won";
    battle.active = false;
    s.totalBattlesWon++;
    myAddXP(Math.floor(battle.score / 2));
    myAddGold(Math.floor(battle.score / 3));
  }

  return battle;
}

export function myCheckBattleResult(): "ongoing" | "won" | "lost" | "fled" | null {
  const battle = ensureInit().currentBattle;
  return battle ? battle.result : null;
}

export function myGetBattleStatus(): BattleState | null {
  return ensureInit().currentBattle;
}

export function myFleeBattle(): boolean {
  const s = ensureInit();
  if (!s.currentBattle || !s.currentBattle.active) return false;
  s.currentBattle.result = "fled";
  s.currentBattle.active = false;
  return true;
}

// ============================================================================
// EXPORTED FUNCTIONS — Creatures
// ============================================================================
export function myGetCreatures(pantheonId?: number): Creature[] {
  if (pantheonId !== undefined) return CREATURES.filter(c => c.pantheonId === pantheonId);
  return CREATURES;
}

export function myTameCreature(creatureId: number, nickname?: string): CreatureData | null {
  const s = ensureInit();
  const creature = CREATURES[creatureId];
  if (!creature) return null;
  if (s.creatures.find(c => c.creatureId === creatureId)) return null;

  const data: CreatureData = {
    creatureId,
    nickname: nickname ?? creature.name,
    level: 1,
    xp: 0,
    tamed: true,
  };
  s.creatures.push(data);
  s.totalCreaturesTamed++;

  // Unlock encyclopedia entry for this creature
  const loreIdx = LORE_ENTRIES.findIndex(e => e.category === "creature" && e.pantheonId === creature.pantheonId);
  if (loreIdx >= 0) {
    s.encyclopedia[loreIdx] = true;
  }

  return data;
}

export function myGetCreatureAbility(creatureId: number): { name: string; description: string } | null {
  const creature = CREATURES[creatureId];
  if (!creature) return null;
  return { name: creature.ability, description: creature.abilityDesc };
}

export function myEvolveCreature(creatureId: number): CreatureData | null {
  const s = ensureInit();
  const data = s.creatures.find(c => c.creatureId === creatureId);
  if (!data) return null;

  const base = CREATURES[creatureId];
  if (base.evolveLevel > data.level) return null;

  data.level++;
  data.xp = 0;
  return data;
}

export function myGetTamedCreatures(): CreatureData[] {
  return ensureInit().creatures;
}

// ============================================================================
// EXPORTED FUNCTIONS — Weapons
// ============================================================================
export function myGetWeapons(pantheonId?: number): Weapon[] {
  if (pantheonId !== undefined) return WEAPONS.filter(w => w.pantheonId === pantheonId);
  return WEAPONS;
}

export function myEquipWeapon(weaponId: number): boolean {
  const s = ensureInit();
  if (!WEAPONS[weaponId]) return false;
  if (!s.ownedWeapons.find(w => w.weaponId === weaponId)) return false;
  s.equippedWeapon = weaponId;
  return true;
}

export function myGetEquippedWeapon(): Weapon | null {
  const s = ensureInit();
  if (s.equippedWeapon < 0) return null;
  return WEAPONS[s.equippedWeapon] ?? null;
}

export function myUpgradeWeapon(weaponId: number): WeaponData | null {
  const s = ensureInit();
  const data = s.ownedWeapons.find(w => w.weaponId === weaponId);
  if (!data) return null;

  const base = WEAPONS[weaponId];
  const cost = Math.floor(base.upgradeCost * (1 + data.level * 0.5));
  if (s.gold < cost) return null;

  s.gold -= cost;
  data.level++;
  data.bonusAttack += Math.floor(base.attack * 0.1);
  return data;
}

export function myGetWeaponStats(weaponId: number): { attack: number; speed: number; special: string } | null {
  const s = ensureInit();
  const base = WEAPONS[weaponId];
  if (!base) return null;

  const data = s.ownedWeapons.find(w => w.weaponId === weaponId);
  return {
    attack: base.attack + (data?.bonusAttack ?? 0),
    speed: base.speed,
    special: base.special,
  };
}

export function myAddWeapon(weaponId: number): WeaponData | null {
  const s = ensureInit();
  if (!WEAPONS[weaponId]) return null;
  if (s.ownedWeapons.find(w => w.weaponId === weaponId)) return null;

  const data: WeaponData = { weaponId, level: 1, bonusAttack: 0 };
  s.ownedWeapons.push(data);
  return data;
}

export function myGetOwnedWeapons(): WeaponData[] {
  return ensureInit().ownedWeapons;
}

// ============================================================================
// EXPORTED FUNCTIONS — Artifacts
// ============================================================================
export function myGetArtifacts(pantheonId?: number): Artifact[] {
  if (pantheonId !== undefined) return ARTIFACTS.filter(a => a.pantheonId === pantheonId);
  return ARTIFACTS;
}

export function myCollectArtifact(artifactId: number): ArtifactData | null {
  const s = ensureInit();
  if (!ARTIFACTS[artifactId]) return null;
  if (s.artifacts.find(a => a.artifactId === artifactId)) return null;

  const base = ARTIFACTS[artifactId];
  const data: ArtifactData = { artifactId, bonus: base.bonusValue };
  s.artifacts.push(data);
  s.totalArtifactsCollected++;
  return data;
}

export function mySetArtifact(artifactId: number, bonus: number): ArtifactData | null {
  const s = ensureInit();
  let data = s.artifacts.find(a => a.artifactId === artifactId);
  if (!data) {
    if (!ARTIFACTS[artifactId]) return null;
    data = { artifactId, bonus };
    s.artifacts.push(data);
    s.totalArtifactsCollected++;
  } else {
    data.bonus = bonus;
  }
  return data;
}

export function myGetArtifactBonus(artifactId: number): number {
  const s = ensureInit();
  const data = s.artifacts.find(a => a.artifactId === artifactId);
  return data?.bonus ?? 0;
}

export function myGetCollectedArtifacts(): ArtifactData[] {
  return ensureInit().artifacts;
}

export function myGetTotalArtifactBonus(): Record<string, number> {
  const s = ensureInit();
  const totals: Record<string, number> = {};
  for (const art of s.artifacts) {
    const def = ARTIFACTS[art.artifactId];
    totals[def.bonusType] = (totals[def.bonusType] ?? 0) + art.bonus;
  }
  return totals;
}

// ============================================================================
// EXPORTED FUNCTIONS — Skill Tree
// ============================================================================
export function myGetSkillTree(branch?: string): SkillNode[] {
  if (branch) return SKILL_TREE.filter(s => s.branch === branch);
  return SKILL_TREE;
}

export function myUnlockSkill(skillId: number, points: number): boolean {
  const s = ensureInit();
  const skill = SKILL_TREE[skillId];
  if (!skill) return false;

  const currentLevel = s.skillTree[skillId] ?? 0;
  if (currentLevel >= skill.maxLevel) return false;

  // Check prerequisites
  if (skill.requires !== null) {
    const reqLevel = s.skillTree[skill.requires] ?? 0;
    if (reqLevel < 1) return false;
  }

  const actualPoints = Math.min(points, skill.maxLevel - currentLevel);
  if (actualPoints <= 0) return false;

  s.skillTree[skillId] = currentLevel + actualPoints;
  return true;
}

export function myGetSkillEffect(skillId: number): number {
  const s = ensureInit();
  const skill = SKILL_TREE[skillId];
  if (!skill) return 0;
  const level = s.skillTree[skillId] ?? 0;
  return level * skill.effectPerLevel;
}

export function myResetSkills(): Record<number, number> {
  const s = ensureInit();
  const current = { ...s.skillTree };
  for (const key of Object.keys(s.skillTree)) {
    s.skillTree[Number(key)] = 0;
  }
  return current;
}

export function myGetUnlockedSkills(): Record<number, number> {
  return { ...ensureInit().skillTree };
}

// ============================================================================
// EXPORTED FUNCTIONS — Alliance
// ============================================================================
export function myGetAllianceLevel(key: string): number {
  return ensureInit().allianceLevels[key] ?? 0;
}

export function myIncreaseAlliance(key: string, amount?: number): number {
  const s = ensureInit();
  s.allianceLevels[key] = (s.allianceLevels[key] ?? 0) + (amount ?? 1);
  return s.allianceLevels[key];
}

export function myGetAllianceBonus(key: string): { attack: number; wisdom: number; gold: number } {
  const level = myGetAllianceLevel(key);
  return {
    attack: Math.floor(level * 1.5),
    wisdom: Math.floor(level * 1.0),
    gold: Math.floor(level * 2.0),
  };
}

export function myGetAllianceLevels(): Record<string, number> {
  return { ...ensureInit().allianceLevels };
}

// ============================================================================
// EXPORTED FUNCTIONS — Encyclopedia
// ============================================================================
export function myGetEncyclopedia(pantheonId?: number): LoreEntry[] {
  const s = ensureInit();
  return LORE_ENTRIES.filter(e => {
    const matchesPantheon = pantheonId !== undefined ? e.pantheonId === pantheonId : true;
    return matchesPantheon && (s.encyclopedia[e.id] ?? false);
  });
}

export function myGetAllLoreEntries(pantheonId?: number): LoreEntry[] {
  if (pantheonId !== undefined) return LORE_ENTRIES.filter(e => e.pantheonId === pantheonId);
  return LORE_ENTRIES;
}

export function myDiscoverEntry(entryId: number): boolean {
  const s = ensureInit();
  if (entryId < 0 || entryId >= LORE_ENTRIES.length) return false;
  const wasUnlocked = s.encyclopedia[entryId] ?? false;
  s.encyclopedia[entryId] = true;
  myAddXP(20);
  return !wasUnlocked;
}

export function myGetLoreDetails(entryId: number): LoreEntry | null {
  const entry = LORE_ENTRIES[entryId];
  if (!entry) return null;
  return { ...entry, unlocked: ensureInit().encyclopedia[entryId] ?? false };
}

export function myGetEncyclopediaProgress(): { unlocked: number; total: number; byPantheon: Record<number, { unlocked: number; total: number }> } {
  const s = ensureInit();
  let unlocked = 0;
  const byPantheon: Record<number, { unlocked: number; total: number }> = {};

  for (let p = 0; p < PANTHEONS.length; p++) {
    byPantheon[p] = { unlocked: 0, total: 0 };
  }

  for (const entry of LORE_ENTRIES) {
    byPantheon[entry.pantheonId].total++;
    if (s.encyclopedia[entry.id]) {
      unlocked++;
      byPantheon[entry.pantheonId].unlocked++;
    }
  }

  return { unlocked, total: LORE_ENTRIES.length, byPantheon };
}

// ============================================================================
// EXPORTED FUNCTIONS — Daily Quest
// ============================================================================
export function myGetDailyQuest(): DailyQuestData {
  const s = ensureInit();
  const todaySeed = getTodaySeed();

  if (s.dailySeed !== todaySeed) {
    s.dailySeed = todaySeed;
    s.dailyCompleted = false;
    const rng = seededRandom(todaySeed);
    const questIndex = Math.floor(rng() * QUESTS.length);
    s.dailyQuest = {
      questId: QUESTS[questIndex].id,
      completed: false,
      bonusMultiplier: 1.5 + Math.floor(rng() * 3) * 0.25,
      seed: todaySeed,
    };
  }

  return s.dailyQuest ?? {
    questId: 0,
    completed: false,
    bonusMultiplier: 1.5,
    seed: todaySeed,
  };
}

export function myCompleteDaily(): { xpReward: number; goldReward: number } {
  const s = ensureInit();
  const daily = myGetDailyQuest();

  if (daily.completed) return { xpReward: 0, goldReward: 0 };

  const quest = QUESTS[daily.questId];
  if (!quest) return { xpReward: 0, goldReward: 0 };

  const xp = Math.floor(quest.xpReward * daily.bonusMultiplier);
  const gold = Math.floor(quest.goldReward * daily.bonusMultiplier);

  myAddXP(xp);
  myAddGold(gold);

  daily.completed = true;
  s.dailyCompleted = true;
  dailiesCompletedCount++;

  return { xpReward: xp, goldReward: gold };
}

export function myCheckDailyReset(): boolean {
  const s = ensureInit();
  return s.dailySeed !== getTodaySeed();
}

// ============================================================================
// EXPORTED FUNCTIONS — Prophecy
// ============================================================================
export function myGetProphecy(): Prophecy | null {
  const s = ensureInit();
  if (s.activeProphecy) return s.activeProphecy;

  const rng = seededRandom(`${getTodaySeed()}-prophecy-${s.totalQuestsCompleted}`);
  const idx = Math.floor(rng() * PROPHECIES.length);
  s.activeProphecy = { ...PROPHECIES[idx] };
  return s.activeProphecy;
}

export function myFulfillProphecy(): { success: boolean; reward: string } {
  const s = ensureInit();
  if (!s.activeProphecy) return { success: false, reward: "" };

  const reward = s.activeProphecy.reward;
  const type = s.activeProphecy.type;

  switch (type) {
    case "reward": {
      const bonusXP = s.activeProphecy.difficulty * 20;
      myAddXP(bonusXP);
      propheciesFulfilledCount++;
      s.activeProphecy = null;
      return { success: true, reward: `${reward} (+${bonusXP} XP)` };
    }
    case "quest": {
      const quest = QUESTS.find(q => q.pantheonId === s.activeProphecy?.pantheonId && q.difficulty === s.activeProphecy?.difficulty);
      if (quest) {
        myStartQuest(quest.id);
        propheciesFulfilledCount++;
        s.activeProphecy = null;
        return { success: true, reward: `Quest unlocked: ${quest.name}` };
      }
      break;
    }
    case "warning": {
      const shieldXP = 30;
      myAddXP(shieldXP);
      propheciesFulfilledCount++;
      s.activeProphecy = null;
      return { success: true, reward: `Warning heeded (+${shieldXP} XP)` };
    }
    case "challenge": {
      const challengeXP = s.activeProphecy.difficulty * 25;
      myAddXP(challengeXP);
      myAddGold(s.activeProphecy.difficulty * 15);
      propheciesFulfilledCount++;
      s.activeProphecy = null;
      return { success: true, reward: `Challenge overcome (+${challengeXP} XP)` };
    }
  }

  return { success: false, reward: "" };
}

export function myGetProphecyReward(): string | null {
  return ensureInit().activeProphecy?.reward ?? null;
}

export function myDismissProphecy(): void {
  ensureInit().activeProphecy = null;
}

// ============================================================================
// EXPORTED FUNCTIONS — Achievements
// ============================================================================
export function myGetAchievements(): AchievementDef[] {
  return ACHIEVEMENTS;
}

export function myCheckAchievements(): string[] {
  const s = ensureInit();
  const newlyUnlocked: string[] = [];

  const checks: Record<string, boolean> = {
    first_blessing: s.deityBlessings.length >= 1 || s.totalQuestsCompleted > 0,
    level_10: s.level >= 10,
    level_30: s.level >= 30,
    level_60: s.level >= 60,
    word_scholar: s.totalWordsTyped >= 1000,
    battlemaster: s.totalBattlesWon >= 50,
    creature_tamer: s.totalCreaturesTamed >= 10,
    daily_devotee: dailiesCompletedCount >= 7,
    prophecy_fulfiller: propheciesFulfilledCount >= 10,
  };

  // Pantheon master: check if all quests in any pantheon are completed
  let pantheonComplete = false;
  for (let p = 0; p < PANTHEONS.length; p++) {
    const pQuests = QUESTS.filter(q => q.pantheonId === p);
    const allDone = pQuests.every(q => {
      const prog = s.questProgress.find(pr => pr.questId === q.id);
      return prog && prog.status === "completed";
    });
    if (allDone && pQuests.length > 0) pantheonComplete = true;
  }
  checks.pantheon_master = pantheonComplete;

  // Legendary collector
  const legendaryCount = s.artifacts.filter(a => ARTIFACTS[a.artifactId]?.rarity === "Legendary").length
    + s.ownedWeapons.filter(w => WEAPONS[w.weaponId]?.rarity === "Legendary").length;
  checks.legendary_collector = legendaryCount >= 5;

  // Explorer: visited all 5 pantheons (set active pantheon for each)
  const visitedPantheons = new Set<number>();
  visitedPantheons.add(s.activePantheon);
  // Simulate visited based on completed quests
  for (const prog of s.questProgress) {
    const quest = QUESTS[prog.questId];
    if (quest) visitedPantheons.add(quest.pantheonId);
  }
  checks.explorer = visitedPantheons.size >= 5;

  // Encyclopedia master
  const loreCount = Object.values(s.encyclopedia).filter(Boolean).length;
  checks.encyclopedia_master = loreCount >= 30;

  // Alliance builder
  const maxAlliance = Math.max(0, ...Object.values(s.allianceLevels));
  checks.alliance_builder = maxAlliance >= 10;

  // Weapon master
  const weaponsUpgraded = s.ownedWeapons.filter(w => w.level > 1).length;
  checks.weapon_master = weaponsUpgraded >= 10;

  for (const ach of ACHIEVEMENTS) {
    if (checks[ach.id] && !s.achievements.includes(ach.id)) {
      s.achievements.push(ach.id);
      newlyUnlocked.push(ach.id);
      myAddXP(50);
    }
  }

  return newlyUnlocked;
}

export function myIsAchievementUnlocked(achievementId: string): boolean {
  return ensureInit().achievements.includes(achievementId);
}

export function myGetUnlockedAchievements(): string[] {
  return [...ensureInit().achievements];
}

// ============================================================================
// EXPORTED FUNCTIONS — Stats & Summary
// ============================================================================
export function myGetQuestStats(): { totalCompleted: number; byPantheon: Record<number, number>; byType: Record<string, number> } {
  const s = ensureInit();
  const byPantheon: Record<number, number> = {};
  const byType: Record<string, number> = {};

  for (const prog of s.questProgress) {
    if (prog.status === "completed") {
      const quest = QUESTS[prog.questId];
      if (quest) {
        byPantheon[quest.pantheonId] = (byPantheon[quest.pantheonId] ?? 0) + 1;
        byType[quest.type] = (byType[quest.type] ?? 0) + 1;
      }
    }
  }

  return { totalCompleted: s.totalQuestsCompleted, byPantheon, byType };
}

export function myGetBattlesWon(): number {
  return ensureInit().totalBattlesWon;
}

export function myGetCreaturesTamed(): number {
  return ensureInit().totalCreaturesTamed;
}

export function myGetTotalArtifacts(): number {
  return ensureInit().totalArtifactsCollected;
}

export function myGetTotalWordsTyped(): number {
  return ensureInit().totalWordsTyped;
}

export function myGetTotalDamageDealt(): number {
  return ensureInit().totalDamageDealt;
}

export function myGetDailiesCompletedCount(): number {
  return dailiesCompletedCount;
}

export function myGetPropheciesFulfilledCount(): number {
  return propheciesFulfilledCount;
}

// ============================================================================
// EXPORTED FUNCTIONS — Utility & Lookup
// ============================================================================
export function myGetRarityColor(rarity: Rarity): string {
  const colors: Record<Rarity, string> = {
    Common: "#9CA3AF",
    Uncommon: "#34D399",
    Rare: "#60A5FA",
    Epic: "#A78BFA",
    Legendary: "#FBBF24",
  };
  return colors[rarity] ?? "#FFFFFF";
}

export function myGetRarityMultiplier(rarity: Rarity): number {
  const mults: Record<Rarity, number> = { Common: 1, Uncommon: 1.5, Rare: 2, Epic: 3, Legendary: 5 };
  return mults[rarity] ?? 1;
}

export function myCalculateWordDamage(word: string, heroStats: ReturnType<typeof myGetHeroStats>, combo: number): number {
  const len = word.length;
  let damage = len * 2 + Math.floor(heroStats.attack * 0.3);
  if (len >= 4) damage += (len - 3) * 3;
  damage += combo * 2;

  const mythWords = ["zeus", "thor", "odin", "ra", "isis", "cerberus", "fenrir", "excalibur", "mjolnir", "olympus", "asgard", "ragnarok", "amaterasu", "gungnir", "kusanagi"];
  if (mythWords.includes(word.toLowerCase())) damage = Math.floor(damage * 1.8);

  return damage;
}

export function myGetPantheonRealm(pantheonId: number): string {
  return PANTHEONS[pantheonId]?.realm ?? "Unknown";
}

export function myGetRegionInfo(realm: string): { regions: string[]; description: string } {
  const realms: Record<string, { regions: string[]; description: string }> = {
    Olympus: { regions: ["Mount Olympus", "Elysian Fields", "Tartarus", "Styx Shores", "Arcadian Meadows"], description: "The mountain home of the Greek gods, soaring above the clouds." },
    Asgard: { regions: ["Valhalla", "Gladsheim", "Bifrost Bridge", "Idavoll Plain", "Vingolf Hall"], description: "The shining realm of the Norse gods, connected by the rainbow bridge." },
    Duat: { regions: ["Hall of Truth", "Field of Reeds", "Lake of Fire", "Osiris's Court", "Seven Gates"], description: "The Egyptian underworld where souls journey after death." },
    Takamagahara: { regions: ["Celestial Palace", "Ame-no-Ukihashi", "Izanami's Garden", "Moonlit Grove", "Dragon Palace"], description: "The High Plain of Heaven in Japanese mythology." },
    "Tir na Nog": { regions: ["Silver Forest", "Crystal Lake", "Fairy Mound", "Endless Meadow", "Twilight Shore"], description: "The Celtic Land of Youth, beyond the western horizon." },
  };
  return realms[realm] ?? { regions: ["Unknown"], description: "A mysterious uncharted realm." };
}

export function myGetXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

export function myGetProgressPercentage(): number {
  const s = ensureInit();
  if (s.xpToNext <= 0) return 100;
  return Math.min(100, Math.floor((s.xp / s.xpToNext) * 100));
}

export function myGetGameSummary(): {
  hero: { class: string; level: number; xpPercent: number };
  pantheon: string;
  blessings: number;
  weapons: number;
  artifacts: number;
  creatures: number;
  quests: number;
  battles: number;
  achievements: number;
  encyclopedia: number;
} {
  const s = ensureInit();
  return {
    hero: { class: HERO_CLASSES[s.heroClass].name, level: s.level, xpPercent: myGetProgressPercentage() },
    pantheon: PANTHEONS[s.activePantheon].name,
    blessings: s.deityBlessings.filter(b => b.turnsRemaining > 0).length,
    weapons: s.ownedWeapons.length,
    artifacts: s.artifacts.length,
    creatures: s.creatures.length,
    quests: s.totalQuestsCompleted,
    battles: s.totalBattlesWon,
    achievements: s.achievements.length,
    encyclopedia: Object.values(s.encyclopedia).filter(Boolean).length,
  };
}
