// ============================================================================
// occult-circle-wire.ts — Occult Circle (Dark Magic Coven) Game Feature Module
// Pure logic & state management for dark rituals, spell casting, familiars,
// tarot divination, spirit contact, forbidden tomes, knowledge tree, and daily
// dark rituals. React ONLY in the default export hook. Only useState.
// ============================================================================

import { useState } from "react";

// ============================================================================
// Literal Types
// ============================================================================

export type OccRitualCircle =
  | "circle_of_shadow"
  | "circle_of_blood"
  | "circle_of_bone"
  | "circle_of_ash"
  | "circle_of_void"
  | "circle_of_thorns"
  | "circle_of_eclipse"
  | "circle_of_abyss";

export type OccSpellSchool =
  | "necromancy"
  | "demonology"
  | "hex_weaving"
  | "soul_binding"
  | "void_channeling"
  | "blood_magic"
  | "curse_craft"
  | "shadow_mastery";

export type OccPotionRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary";

export type OccFamiliarType =
  | "raven"
  | "cat"
  | "owl"
  | "bat"
  | "toad"
  | "snake"
  | "spider"
  | "wolf";

export type OccFamiliarBondLevel =
  | "stranger"
  | "acquaintance"
  | "companion"
  | "partner"
  | "soulbound";

export type OccTarotCard =
  | "the_fool"
  | "the_magician"
  | "the_high_priestess"
  | "the_empress"
  | "the_emperor"
  | "the_hierophant"
  | "the_lovers"
  | "the_chariot"
  | "strength"
  | "the_hermit"
  | "wheel_of_fortune"
  | "justice"
  | "the_hanged_man"
  | "death"
  | "temperance"
  | "the_devil"
  | "the_tower"
  | "the_star"
  | "the_moon"
  | "the_sun"
  | "judgement"
  | "the_world";

export type OccSpiritRealm =
  | "astral_plane"
  | "ethereal_void"
  | "shadow_realm"
  | "dreamscape"
  | "netherworld"
  | "limbo";

export type OccKnowledgeBranch =
  | "forbidden_lore"
  | "demonology"
  | "necromancy"
  | "ritual_mastery"
  | "astral_projection";

export type OccTomePower =
  | "minor"
  | "moderate"
  | "major"
  | "transcendent";

export type OccAchievementTier =
  | "bronze"
  | "silver"
  | "gold"
  | "obsidian";

export type OccDivinationOutcome =
  | "great_blessing"
  | "minor_blessing"
  | "neutral"
  | "minor_curse"
  | "great_curse";

export type OccRitualStatus =
  | "preparing"
  | "chanting"
  | "empowering"
  | "culminating"
  | "completed"
  | "failed";

export type OccDailyRitualPhase =
  | "dawn_invocation"
  | "midnight_summoning"
  | "eclipse_communion"
  | "void_meditation";

// ============================================================================
// Interfaces
// ============================================================================

export interface OccRitualCircleData {
  readonly id: OccRitualCircle;
  readonly name: string;
  readonly description: string;
  readonly unlockLevel: number;
  readonly darkPowerBonus: number;
  readonly spellPotencyBonus: number;
  readonly spiritAffinity: number;
  readonly requiredIngredients: string[];
  readonly riskLevel: number;
  readonly baseXP: number;
}

export interface OccSpellData {
  readonly id: string;
  readonly name: string;
  readonly school: OccSpellSchool;
  readonly manaCost: number;
  readonly cooldown: number;
  readonly power: number;
  readonly minMastery: number;
  readonly requiredCircle: OccRitualCircle | null;
  readonly description: string;
  readonly effect: string;
  readonly darkPowerCost: number;
  readonly forbiddenTomeRequired: string | null;
}

export interface OccPotionIngredientData {
  readonly id: string;
  readonly name: string;
  readonly rarity: OccPotionRarity;
  readonly description: string;
  readonly gatherTime: number;
  readonly darkPowerYield: number;
  readonly spellBoost: number;
  readonly familiarBonus: OccFamiliarType | null;
  readonly canBeBought: boolean;
  readonly baseCost: number;
}

export interface OccFamiliarData {
  readonly type: OccFamiliarType;
  readonly name: string;
  readonly description: string;
  readonly bonusType: string;
  readonly baseBonus: number;
  readonly maxBond: number;
  readonly unlockMastery: number;
  readonly preferredCircle: OccRitualCircle;
  readonly specialAbility: string;
}

export interface OccFamiliarState {
  type: OccFamiliarType;
  bond: number;
  bondLevel: OccFamiliarBondLevel;
  isSummoned: boolean;
  feedCount: number;
  lastFedTimestamp: number;
  ritualAssists: number;
}

export interface OccTarotCardData {
  readonly id: OccTarotCard;
  readonly name: string;
  readonly number: number;
  readonly element: string;
  readonly uprightMeaning: string;
  readonly reversedMeaning: string;
  readonly darkInterpretation: string;
  readonly divinationPower: number;
  readonly spiritConnection: number;
  readonly lore: string;
}

export interface OccTarotReading {
  cards: OccTarotCard[];
  isReversed: boolean[];
  outcome: OccDivinationOutcome;
  interpretation: string;
  timestamp: number;
  darkPowerGained: number;
}

export interface OccSpiritData {
  readonly id: string;
  readonly name: string;
  readonly realm: OccSpiritRealm;
  readonly power: number;
  readonly dangerLevel: number;
  readonly description: string;
  readonly knowledgeOffered: string[];
  readonly offeringRequired: string[];
  readonly contactDifficulty: number;
  readonly minMastery: number;
  readonly rewards: OccSpiritReward;
}

export interface OccSpiritReward {
  darkPower: number;
  xp: number;
  spellUnlock: string | null;
  ingredientBonus: string | null;
  knowledgeNodeUnlock: string | null;
}

export interface OccSpiritContactState {
  spiritId: string;
  isContacting: boolean;
  progress: number;
  targetProgress: number;
  offeringsGiven: string[];
  contactSuccessful: boolean | null;
  lastContactTimestamp: number;
  totalContacts: number;
}

export interface OccKnowledgeNodeData {
  readonly id: string;
  readonly name: string;
  readonly branch: OccKnowledgeBranch;
  readonly description: string;
  readonly unlockCost: number;
  readonly prerequisiteNodes: string[];
  readonly darkPowerBonus: number;
  readonly spellBonus: number;
  readonly spiritBonus: number;
  readonly ritualBonus: number;
  readonly tier: number;
}

export interface OccKnowledgeTreeState {
  unlockedNodes: string[];
  totalInvested: number;
  branchProgress: Record<OccKnowledgeBranch, number>;
}

export interface OccForbiddenTomeData {
  readonly id: string;
  readonly name: string;
  readonly power: OccTomePower;
  readonly description: string;
  readonly pagesLearned: number;
  readonly totalPages: number;
  readonly darkKnowledgePer: number;
  readonly corruptionRisk: number;
  readonly spellsContained: string[];
  readonly unlockMastery: number;
  readonly lore: string;
}

export interface OccForbiddenTomeState {
  id: string;
  isOwned: boolean;
  pagesStudied: number;
  isStudying: boolean;
  studyProgress: number;
  lastStudyTimestamp: number;
  corruptionLevel: number;
}

export interface OccAchievementData {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly tier: OccAchievementTier;
  readonly requirement: string;
  readonly targetValue: number;
  readonly xpReward: number;
  readonly darkPowerReward: number;
  readonly icon: string;
}

export interface OccDailyRitualData {
  readonly phase: OccDailyRitualPhase;
  readonly name: string;
  readonly description: string;
  readonly duration: number;
  readonly requiredMastery: number;
  readonly darkPowerReward: number;
  readonly xpReward: number;
  readonly ingredientReward: string | null;
  readonly specialEffect: string;
  readonly bonusCircle: OccRitualCircle | null;
}

export interface OccDailyRitualState {
  isActive: boolean;
  phase: OccDailyRitualPhase | null;
  progress: number;
  targetProgress: number;
  startTime: number | null;
  lastCompletedDate: string | null;
  completedToday: boolean;
  totalCompleted: number;
  streakDays: number;
  bestStreak: number;
}

export interface OccRitualCastState {
  circleId: OccRitualCircle | null;
  status: OccRitualStatus | null;
  progress: number;
  targetProgress: number;
  activeSpell: string | null;
  startTime: number | null;
  participants: string[];
  darkPowerConsumed: number;
  darkPowerGenerated: number;
}

export interface OccInventoryState {
  ingredients: Record<string, number>;
  darkPowerCrystals: number;
  soulFragments: number;
  voidEssence: number;
  bloodVials: number;
  boneDust: number;
  ashResidue: number;
}

export interface OccOccultCircleState {
  playerName: string;
  ritualMastery: number;
  ritualMasteryXP: number;
  darkPower: number;
  totalDarkPowerEarned: number;
  totalRitualsPerformed: number;
  totalSpellsCast: number;
  totalSpiritsContacted: number;
  totalTarotReadings: number;
  totalAchievementsUnlocked: number;
  totalTomesStudied: number;
  totalDailyRitualsCompleted: number;
  unlockedCircles: OccRitualCircle[];
  activeCircle: OccRitualCircle | null;
  unlockedSpells: string[];
  activeSpells: string[];
  spellCooldowns: Record<string, number>;
  familiarState: OccFamiliarState | null;
  unlockedFamiliars: OccFamiliarType[];
  tarotReading: OccTarotReading | null;
  tarotReadingsHistory: OccTarotReading[];
  spiritContacts: Record<string, OccSpiritContactState>;
  knowledgeTree: OccKnowledgeTreeState;
  forbiddenTomes: Record<string, OccForbiddenTomeState>;
  achievements: string[];
  dailyRitual: OccDailyRitualState;
  ritualCast: OccRitualCastState;
  inventory: OccInventoryState;
  corruptionLevel: number;
  currentDay: number;
}

// ============================================================================
// Constants: 8 Ritual Circles
// ============================================================================

export const OCC_RITUAL_CIRCLES: readonly OccRitualCircleData[] = [
  {
    id: "circle_of_shadow",
    name: "Circle of Shadow",
    description:
      "The foundational circle of darkness, woven from living shadow. New initiates take their first steps into the occult here, learning to manipulate the essence of shadow.",
    unlockLevel: 1,
    darkPowerBonus: 5,
    spellPotencyBonus: 3,
    spiritAffinity: 2,
    requiredIngredients: ["shadow_dust", "void_ember"],
    riskLevel: 1,
    baseXP: 10,
  },
  {
    id: "circle_of_blood",
    name: "Circle of Blood",
    description:
      "A crimson ring powered by life force. Blood magic flows through the carved sigils, granting tremendous power at great personal cost.",
    unlockLevel: 5,
    darkPowerBonus: 12,
    spellPotencyBonus: 8,
    spiritAffinity: 5,
    requiredIngredients: ["blood_vial", "crimson_salt"],
    riskLevel: 3,
    baseXP: 25,
  },
  {
    id: "circle_of_bone",
    name: "Circle of Bone",
    description:
      "Assembled from the remains of ancient creatures. Necromantic energy pulses through the ossified archways, bridging the living and the dead.",
    unlockLevel: 10,
    darkPowerBonus: 18,
    spellPotencyBonus: 12,
    spiritAffinity: 10,
    requiredIngredients: ["bone_fragment", "grave_dust"],
    riskLevel: 4,
    baseXP: 40,
  },
  {
    id: "circle_of_ash",
    name: "Circle of Ash",
    description:
      "Drawn in the cremated remains of burned tomes and extinguished candles. Ash represents transformation — destruction that seeds new creation.",
    unlockLevel: 15,
    darkPowerBonus: 22,
    spellPotencyBonus: 15,
    spiritAffinity: 8,
    requiredIngredients: ["sacred_ash", "ember_coal"],
    riskLevel: 5,
    baseXP: 55,
  },
  {
    id: "circle_of_void",
    name: "Circle of Void",
    description:
      "A ring of nothingness that exists between dimensions. The void consumes all magical energy within its boundary, amplifying it beyond normal limits.",
    unlockLevel: 20,
    darkPowerBonus: 30,
    spellPotencyBonus: 20,
    spiritAffinity: 15,
    requiredIngredients: ["void_crystal", "null_shard"],
    riskLevel: 6,
    baseXP: 70,
  },
  {
    id: "circle_of_thorns",
    name: "Circle of Thorns",
    description:
      "Living briars form a protective barrier infused with curse energy. Those who enter are marked by the thorns and cannot leave until the ritual completes.",
    unlockLevel: 25,
    darkPowerBonus: 35,
    spellPotencyBonus: 25,
    spiritAffinity: 18,
    requiredIngredients: ["thorn_briar", "curse_vine"],
    riskLevel: 7,
    baseXP: 85,
  },
  {
    id: "circle_of_eclipse",
    name: "Circle of Eclipse",
    description:
      "Only active during celestial alignments, this circle channels the raw power of eclipsed light. The rarest and most potent of all ritual circles.",
    unlockLevel: 35,
    darkPowerBonus: 45,
    spellPotencyBonus: 35,
    spiritAffinity: 25,
    requiredIngredients: ["eclipse_shard", "obsidian_dust"],
    riskLevel: 8,
    baseXP: 120,
  },
  {
    id: "circle_of_abyss",
    name: "Circle of Abyss",
    description:
      "The ultimate circle that peers into the deepest abyss of existence. Mastery of this circle grants dominion over the boundary between reality and oblivion.",
    unlockLevel: 45,
    darkPowerBonus: 60,
    spellPotencyBonus: 45,
    spiritAffinity: 35,
    requiredIngredients: ["abyss_heart", "entropy_stone"],
    riskLevel: 10,
    baseXP: 200,
  },
];

// ============================================================================
// Constants: 12 Dark Spells
// ============================================================================

export const OCC_DARK_SPELLS: readonly OccSpellData[] = [
  {
    id: "shadow_bolt",
    name: "Shadow Bolt",
    school: "shadow_mastery",
    manaCost: 5,
    cooldown: 2,
    power: 15,
    minMastery: 1,
    requiredCircle: null,
    description: "A bolt of concentrated shadow energy that strikes the target.",
    effect: "Deals 15 shadow damage",
    darkPowerCost: 2,
    forbiddenTomeRequired: null,
  },
  {
    id: "life_drain",
    name: "Life Drain",
    school: "blood_magic",
    manaCost: 10,
    cooldown: 5,
    power: 25,
    minMastery: 3,
    requiredCircle: "circle_of_blood",
    description: "Siphons the life force from a target to replenish your own.",
    effect: "Deal 25 damage, heal self for 12",
    darkPowerCost: 5,
    forbiddenTomeRequired: null,
  },
  {
    id: "bone_surge",
    name: "Bone Surge",
    school: "necromancy",
    manaCost: 15,
    cooldown: 8,
    power: 35,
    minMastery: 5,
    requiredCircle: "circle_of_bone",
    description: "Raises skeletal fragments from the earth to impale enemies.",
    effect: "AoE 35 necrotic damage in 8m radius",
    darkPowerCost: 8,
    forbiddenTomeRequired: null,
  },
  {
    id: "soul_bind",
    name: "Soul Bind",
    school: "soul_binding",
    manaCost: 20,
    cooldown: 15,
    power: 40,
    minMastery: 8,
    requiredCircle: null,
    description: "Binds a fragment of the target's soul, weakening their resolve.",
    effect: "Reduce target power by 20% for 15s",
    darkPowerCost: 10,
    forbiddenTomeRequired: "tome_of_soul_binding",
  },
  {
    id: "void_rift",
    name: "Void Rift",
    school: "void_channeling",
    manaCost: 30,
    cooldown: 20,
    power: 55,
    minMastery: 12,
    requiredCircle: "circle_of_void",
    description: "Tears open a rift to the void, pulling enemies into nothingness.",
    effect: "Pull enemies to center, deal 55 void damage",
    darkPowerCost: 15,
    forbiddenTomeRequired: null,
  },
  {
    id: "hex_of_venom",
    name: "Hex of Venom",
    school: "curse_craft",
    manaCost: 12,
    cooldown: 6,
    power: 20,
    minMastery: 4,
    requiredCircle: null,
    description: "Curses the target with supernatural venom that corrodes from within.",
    effect: "20 poison damage over 10s, reduces healing by 50%",
    darkPowerCost: 6,
    forbiddenTomeRequired: null,
  },
  {
    id: "demon_summon",
    name: "Demon Summon",
    school: "demonology",
    manaCost: 50,
    cooldown: 60,
    power: 70,
    minMastery: 15,
    requiredCircle: "circle_of_shadow",
    description: "Summons a lesser demon from the nether planes to fight alongside you.",
    effect: "Summon a demon ally for 30s with 70 power",
    darkPowerCost: 25,
    forbiddenTomeRequired: "tome_of_demonology",
  },
  {
    id: "ash_storm",
    name: "Ash Storm",
    school: "hex_weaving",
    manaCost: 25,
    cooldown: 12,
    power: 45,
    minMastery: 10,
    requiredCircle: "circle_of_ash",
    description: "Conjures a devastating storm of burning ash that obscures and burns.",
    effect: "AoE 45 damage + blind enemies for 8s",
    darkPowerCost: 12,
    forbiddenTomeRequired: null,
  },
  {
    id: "eclipse_ray",
    name: "Eclipse Ray",
    school: "shadow_mastery",
    manaCost: 40,
    cooldown: 25,
    power: 65,
    minMastery: 20,
    requiredCircle: "circle_of_eclipse",
    description: "Channels the power of a celestial eclipse into a devastating beam of dark light.",
    effect: "Line beam dealing 65 damage, pierces all targets",
    darkPowerCost: 20,
    forbiddenTomeRequired: "tome_of_eclipses",
  },
  {
    id: "curse_of_ages",
    name: "Curse of Ages",
    school: "curse_craft",
    manaCost: 35,
    cooldown: 30,
    power: 50,
    minMastery: 18,
    requiredCircle: "circle_of_thorns",
    description: "A curse that ages the target decades in an instant, withering their body.",
    effect: "Reduce all target stats by 30% for 20s",
    darkPowerCost: 18,
    forbiddenTomeRequired: null,
  },
  {
    id: "abyssal_gateway",
    name: "Abyssal Gateway",
    school: "void_channeling",
    manaCost: 80,
    cooldown: 120,
    power: 100,
    minMastery: 30,
    requiredCircle: "circle_of_abyss",
    description: "Opens a gateway to the abyss itself, unleashing its horrors upon the world.",
    effect: "Massive AoE 100 damage + fear all enemies for 10s",
    darkPowerCost: 40,
    forbiddenTomeRequired: "tome_of_the_abyss",
  },
  {
    id: "blood_pact",
    name: "Blood Pact",
    school: "blood_magic",
    manaCost: 60,
    cooldown: 45,
    power: 85,
    minMastery: 25,
    requiredCircle: "circle_of_blood",
    description: "Forms an unbreakable pact written in blood that shares damage between allies.",
    effect: "All damage split between up to 3 targets for 20s",
    darkPowerCost: 30,
    forbiddenTomeRequired: "tome_of_blood",
  },
];

// ============================================================================
// Constants: 10 Potion Ingredients
// ============================================================================

export const OCC_POTION_INGREDIENTS: readonly OccPotionIngredientData[] = [
  {
    id: "shadow_dust",
    name: "Shadow Dust",
    rarity: "common",
    description: "Fine particles of condensed shadow gathered from darkened corners.",
    gatherTime: 30,
    darkPowerYield: 2,
    spellBoost: 1,
    familiarBonus: "cat",
    canBeBought: true,
    baseCost: 5,
  },
  {
    id: "void_ember",
    name: "Void Ember",
    rarity: "common",
    description: "A smoldering coal from the edge of the void that never fully extinguishes.",
    gatherTime: 45,
    darkPowerYield: 3,
    spellBoost: 2,
    familiarBonus: "bat",
    canBeBought: true,
    baseCost: 8,
  },
  {
    id: "blood_vial",
    name: "Vial of Blood",
    rarity: "uncommon",
    description: "Fresh blood infused with dark resonance, collected under a waning moon.",
    gatherTime: 60,
    darkPowerYield: 5,
    spellBoost: 3,
    familiarBonus: "snake",
    canBeBought: true,
    baseCost: 15,
  },
  {
    id: "crimson_salt",
    name: "Crimson Salt",
    rarity: "uncommon",
    description: "Salt crystals tinged red with iron from the underworld.",
    gatherTime: 50,
    darkPowerYield: 4,
    spellBoost: 2,
    familiarBonus: "toad",
    canBeBought: true,
    baseCost: 12,
  },
  {
    id: "bone_fragment",
    name: "Bone Fragment",
    rarity: "rare",
    description: "A shard of bone from a creature that walked between life and death.",
    gatherTime: 90,
    darkPowerYield: 8,
    spellBoost: 5,
    familiarBonus: "wolf",
    canBeBought: true,
    baseCost: 30,
  },
  {
    id: "grave_dust",
    name: "Grave Dust",
    rarity: "uncommon",
    description: "Dust from the threshold of a tomb where the veil is thinnest.",
    gatherTime: 70,
    darkPowerYield: 6,
    spellBoost: 4,
    familiarBonus: "raven",
    canBeBought: true,
    baseCost: 18,
  },
  {
    id: "sacred_ash",
    name: "Sacred Ash",
    rarity: "rare",
    description: "Ash from burned texts of forbidden knowledge, still humming with power.",
    gatherTime: 100,
    darkPowerYield: 10,
    spellBoost: 6,
    familiarBonus: "owl",
    canBeBought: true,
    baseCost: 35,
  },
  {
    id: "void_crystal",
    name: "Void Crystal",
    rarity: "epic",
    description: "A crystallized fragment of pure void energy, impossibly cold to the touch.",
    gatherTime: 150,
    darkPowerYield: 15,
    spellBoost: 10,
    familiarBonus: "spider",
    canBeBought: false,
    baseCost: 80,
  },
  {
    id: "eclipse_shard",
    name: "Eclipse Shard",
    rarity: "epic",
    description: "A fragment of solidified eclipse light, darker than the deepest night.",
    gatherTime: 200,
    darkPowerYield: 20,
    spellBoost: 14,
    familiarBonus: null,
    canBeBought: false,
    baseCost: 120,
  },
  {
    id: "abyss_heart",
    name: "Heart of the Abyss",
    rarity: "legendary",
    description: "The crystallized core of abyssal energy, pulsing with malevolent life.",
    gatherTime: 300,
    darkPowerYield: 35,
    spellBoost: 25,
    familiarBonus: null,
    canBeBought: false,
    baseCost: 300,
  },
];

// ============================================================================
// Constants: 8 Familiars
// ============================================================================

export const OCC_FAMILIARS: readonly OccFamiliarData[] = [
  {
    type: "raven",
    name: "Morrigan's Herald",
    description:
      "A sleek black raven with eyes like twin eclipses. It whispers secrets of the dead and carries messages across the veil between worlds.",
    bonusType: "divination_power",
    baseBonus: 15,
    maxBond: 100,
    unlockMastery: 1,
    preferredCircle: "circle_of_shadow",
    specialAbility: "Death Omen — reveals nearby danger before it strikes",
  },
  {
    type: "cat",
    name: "Shadowmaw",
    description:
      "A black cat that phases between dimensions. Its nine lives grant it knowledge of death, and its gaze pierces all illusions.",
    bonusType: "stealth_and_shadow",
    baseBonus: 12,
    maxBond: 100,
    unlockMastery: 1,
    preferredCircle: "circle_of_shadow",
    specialAbility: "Shadow Step — allows instant short-range teleportation",
  },
  {
    type: "owl",
    name: "Nightgaze",
    description:
      "A great horned owl with feathers of silver and obsidian. It sees all that is hidden and remembers every secret ever whispered in darkness.",
    bonusType: "wisdom_and_detection",
    baseBonus: 14,
    maxBond: 100,
    unlockMastery: 3,
    preferredCircle: "circle_of_bone",
    specialAbility: "True Sight — reveals all invisible and hidden entities",
  },
  {
    type: "bat",
    name: "Whisperwing",
    description:
      "A massive bat with wings spanning six feet, emitting ultrasonic frequencies that resonate with dark magic and shatter wards.",
    bonusType: "ward_disruption",
    baseBonus: 10,
    maxBond: 100,
    unlockMastery: 3,
    preferredCircle: "circle_of_void",
    specialAbility: "Ultrasonic Screech — breaks magical barriers and silences spells",
  },
  {
    type: "toad",
    name: "Grimble",
    description:
      "An ancient warty toad said to be a transformed sorcerer from centuries past. Its croak carries hex energy and its skin secretes potion reagents.",
    bonusType: "potion_quality",
    baseBonus: 8,
    maxBond: 100,
    unlockMastery: 5,
    preferredCircle: "circle_of_blood",
    specialAbility: "Toxin Skin — produces random potion ingredients periodically",
  },
  {
    type: "snake",
    name: "Ouroboros Spawn",
    description:
      "A serpent that endlessly devours its own tail, symbolizing the infinite cycle of destruction and creation in dark magic.",
    bonusType: "life_cycle_manipulation",
    baseBonus: 13,
    maxBond: 100,
    unlockMastery: 8,
    preferredCircle: "circle_of_blood",
    specialAbility: "Eternal Coil — grants slow health regeneration during rituals",
  },
  {
    type: "spider",
    name: "Silkweaver",
    description:
      "A large orb-weaver spider that spins webs of enchanted shadow silk. Its venom induces prophetic visions in those it bites.",
    bonusType: "trap_and_binding",
    baseBonus: 11,
    maxBond: 100,
    unlockMastery: 5,
    preferredCircle: "circle_of_thorns",
    specialAbility: "Web of Fate — ensnares enemies and reveals their destiny",
  },
  {
    type: "wolf",
    name: "Dire Shadowfang",
    description:
      "A spectral wolf that hunts across the boundary between the physical and spirit realms. Its howl raises the dead.",
    bonusType: "pack_mastery",
    baseBonus: 16,
    maxBond: 100,
    unlockMastery: 10,
    preferredCircle: "circle_of_bone",
    specialAbility: "Death Howl — summons skeletal wolf companions for a short time",
  },
];

// ============================================================================
// Constants: 22 Major Arcana Tarot Cards
// ============================================================================

export const OCC_TAROT_CARDS: readonly OccTarotCardData[] = [
  {
    id: "the_fool",
    name: "The Fool",
    number: 0,
    element: "Air",
    uprightMeaning: "New beginnings, innocence, spontaneity, free spirit",
    reversedMeaning: "Recklessness, risk-taking, naivety, foolishness",
    darkInterpretation: "The first step into darkness — abandon all caution",
    divinationPower: 5,
    spiritConnection: 3,
    lore: "The Fool stands at the precipice of the abyss, about to step into the unknown. In dark readings, this card signifies the beginning of a dangerous journey into forbidden knowledge.",
  },
  {
    id: "the_magician",
    name: "The Magician",
    number: 1,
    element: "Mercury",
    uprightMeaning: "Manifestation, resourcefulness, power, inspired action",
    reversedMeaning: "Manipulation, poor planning, untapped talents",
    darkInterpretation: "Raw magical power at your command — use it wisely or be consumed",
    divinationPower: 8,
    spiritConnection: 5,
    lore: "The Magician channels forces from beyond the veil, one hand raised to the heavens and one pointing to the abyss. His power is limited only by his will.",
  },
  {
    id: "the_high_priestess",
    name: "The High Priestess",
    number: 2,
    element: "Moon",
    uprightMeaning: "Intuition, sacred knowledge, divine feminine, subconscious",
    reversedMeaning: "Secrets, disconnected from intuition, withdrawal",
    darkInterpretation: "Hidden knowledge stirs in the depths — listen to the whispers",
    divinationPower: 10,
    spiritConnection: 8,
    lore: "Guardian of the veil between worlds, the High Priestess sits before the pillars of light and darkness. She holds the key to all forbidden secrets.",
  },
  {
    id: "the_empress",
    name: "The Empress",
    number: 3,
    element: "Venus",
    uprightMeaning: "Femininity, beauty, nature, nurturing, abundance",
    reversedMeaning: "Creative block, dependence, emptiness, smothering",
    darkInterpretation: "The dark mother nurtures all things — even those that should not exist",
    divinationPower: 7,
    spiritConnection: 6,
    lore: "The Empress rules over the wild, untamed forces of nature, including the dark growths that flourish in cursed soil and the monstrous things born from corrupt wombs.",
  },
  {
    id: "the_emperor",
    name: "The Emperor",
    number: 4,
    element: "Aries",
    uprightMeaning: "Authority, structure, control, fatherhood, stability",
    reversedMeaning: "Tyranny, rigidity, coldness, domination",
    darkInterpretation: "Iron rule over the forces of darkness — command or be commanded",
    divinationPower: 9,
    spiritConnection: 4,
    lore: "The Emperor sits upon a throne of black stone, commanding the armies of the underworld with an iron fist. His law is absolute in the shadow realm.",
  },
  {
    id: "the_hierophant",
    name: "The Hierophant",
    number: 5,
    element: "Taurus",
    uprightMeaning: "Spiritual wisdom, tradition, conformity, morality",
    reversedMeaning: "Personal beliefs, freedom, challenging status quo",
    darkInterpretation: "Forbidden doctrine — the teachings that the world was not meant to know",
    divinationPower: 8,
    spiritConnection: 7,
    lore: "The dark Hierophant teaches the forbidden rituals and the hidden names of demons. Those who study under him gain power but lose their sanity.",
  },
  {
    id: "the_lovers",
    name: "The Lovers",
    number: 6,
    element: "Gemini",
    uprightMeaning: "Love, harmony, relationships, values alignment, choices",
    reversedMeaning: "Self-love, disharmony, imbalance, misalignment",
    darkInterpretation: "A blood pact or dark binding — love twisted into chains",
    divinationPower: 6,
    spiritConnection: 9,
    lore: "The Lovers stand beneath a tree of forbidden fruit, bound by chains of shadow. This card represents dark pacts, soul bindings, and love corrupted by magic.",
  },
  {
    id: "the_chariot",
    name: "The Chariot",
    number: 7,
    element: "Cancer",
    uprightMeaning: "Control, willpower, success, determination, action",
    reversedMeaning: "Self-discipline, opposition, lack of direction",
    darkInterpretation: "The war machine of darkness rides forth — unstoppable force",
    divinationPower: 8,
    spiritConnection: 3,
    lore: "The Chariot is drawn by two shadow beasts, one of light and one of darkness. The rider must master both to control the vehicle of destruction.",
  },
  {
    id: "strength",
    name: "Strength",
    number: 8,
    element: "Leo",
    uprightMeaning: "Inner strength, bravery, compassion, focus, self-control",
    reversedMeaning: "Self-doubt, weakness, insecurity, raw emotion",
    darkInterpretation: "The strength to face the abyss without losing your mind",
    divinationPower: 7,
    spiritConnection: 5,
    lore: "A figure tames a lion made of pure shadow using only their will. True strength in the occult comes not from force but from mastering the darkness within.",
  },
  {
    id: "the_hermit",
    name: "The Hermit",
    number: 9,
    element: "Virgo",
    uprightMeaning: "Soul-searching, introspection, solitude, inner guidance",
    reversedMeaning: "Isolation, loneliness, withdrawal, anti-social",
    darkInterpretation: "Solitude in darkness breeds the most terrible revelations",
    divinationPower: 12,
    spiritConnection: 10,
    lore: "The Hermit has spent centuries alone in the void, cataloging every dark secret of existence. His lantern reveals truths that would drive lesser minds to madness.",
  },
  {
    id: "wheel_of_fortune",
    name: "Wheel of Fortune",
    number: 10,
    element: "Jupiter",
    uprightMeaning: "Good luck, karma, life cycles, destiny, turning point",
    reversedMeaning: "Bad luck, resistance to change, breaking cycles",
    darkInterpretation: "The wheel turns — empires of darkness rise and fall eternally",
    divinationPower: 10,
    spiritConnection: 6,
    lore: "The great wheel of fate is spun by shadowy hands. When it turns in your favor, even the impossible becomes possible. When it turns against you, nothing can save you.",
  },
  {
    id: "justice",
    name: "Justice",
    number: 11,
    element: "Libra",
    uprightMeaning: "Justice, fairness, truth, cause and effect, law",
    reversedMeaning: "Unfairness, lack of accountability, dishonesty",
    darkInterpretation: "The scales of the underworld measure souls — heavier than a feather means damnation",
    divinationPower: 9,
    spiritConnection: 7,
    lore: "Justice in the occult world is swift and merciless. The dark judge weighs every soul, and the penalty for dark deeds is paid in the currency of suffering.",
  },
  {
    id: "the_hanged_man",
    name: "The Hanged Man",
    number: 12,
    element: "Neptune",
    uprightMeaning: "Surrender, letting go, new perspectives, pause",
    reversedMeaning: "Delays, resistance, stalling, indecision",
    darkInterpretation: "Suspended between worlds — sacrifice brings forbidden enlightenment",
    divinationPower: 11,
    spiritConnection: 8,
    lore: "The Hanged Man hangs upside down from the world tree, seeing reality from an inverted perspective. This voluntary sacrifice grants visions of the inverted truth.",
  },
  {
    id: "death",
    name: "Death",
    number: 13,
    element: "Scorpio",
    uprightMeaning: "Endings, change, transformation, transition",
    reversedMeaning: "Resistance to change, inability to move on, stagnation",
    darkInterpretation: "Death is not the end — it is the door to ultimate dark power",
    divinationPower: 15,
    spiritConnection: 12,
    lore: "The grim reaper of the tarot is the most feared and revered card. In dark readings, it does not foretell death but promises transformation through destruction of the old self.",
  },
  {
    id: "temperance",
    name: "Temperance",
    number: 14,
    element: "Sagittarius",
    uprightMeaning: "Balance, moderation, patience, purpose, meaning",
    reversedMeaning: "Imbalance, excess, self-healing, realignment",
    darkInterpretation: "The delicate balance between power and corruption — tip too far and be lost",
    divinationPower: 8,
    spiritConnection: 6,
    lore: "The angel of Temperance pours between two chalices — one of light and one of absolute darkness. The mixture is the elixir of forbidden knowledge.",
  },
  {
    id: "the_devil",
    name: "The Devil",
    number: 15,
    element: "Capricorn",
    uprightMeaning: "Shadow self, attachment, addiction, restriction, sexuality",
    reversedMeaning: "Releasing limiting beliefs, exploring dark thoughts, detachment",
    darkInterpretation: "The lord of darkness offers everything — for a price you cannot imagine",
    divinationPower: 14,
    spiritConnection: 11,
    lore: "The Devil sits upon his throne of bones, flanked by two chained souls. In the occult, this card represents temptation, binding pacts, and the intoxicating allure of absolute power.",
  },
  {
    id: "the_tower",
    name: "The Tower",
    number: 16,
    element: "Mars",
    uprightMeaning: "Sudden change, upheaval, chaos, revelation, awakening",
    reversedMeaning: "Personal transformation, fear of change, averting disaster",
    darkInterpretation: "The old order crumbles — from the ruins, a darker power rises",
    divinationPower: 13,
    spiritConnection: 5,
    lore: "Lightning strikes the tower of the old world, shattering it completely. The occultist understands that destruction is the necessary prelude to rebuilding in darkness.",
  },
  {
    id: "the_star",
    name: "The Star",
    number: 17,
    element: "Aquarius",
    uprightMeaning: "Hope, faith, purpose, renewal, spirituality, inspiration",
    reversedMeaning: "Lack of faith, despair, self-trust, disconnection",
    darkInterpretation: "A distant dark star guides those who walk the forbidden path",
    divinationPower: 9,
    spiritConnection: 10,
    lore: "The dark star burns cold and black, visible only to those initiated into the deepest mysteries. It is said to mark the location of the ultimate forbidden library.",
  },
  {
    id: "the_moon",
    name: "The Moon",
    number: 18,
    element: "Pisces",
    uprightMeaning: "Illusion, fear, anxiety, subconscious, intuition",
    reversedMeaning: "Release of fear, repressed emotion, inner confusion",
    darkInterpretation: "Under the blood moon, all dark spells gain terrible potency",
    divinationPower: 12,
    spiritConnection: 9,
    lore: "The Moon card is the occultist's most powerful ally. Under its light, the veil thins, spirits grow restless, and the boundaries between worlds dissolve into mist.",
  },
  {
    id: "the_sun",
    name: "The Sun",
    number: 19,
    element: "Sun",
    uprightMeaning: "Positivity, fun, warmth, success, vitality, joy",
    reversedMeaning: "Inner child, feeling down, overly optimistic",
    darkInterpretation: "The black sun — an inverted light that reveals only the darkest truths",
    divinationPower: 10,
    spiritConnection: 4,
    lore: "The Black Sun is the antithesis of life-giving light. It is the sun of the underworld, whose rays bring not warmth but the cold clarity of absolute truth about the nature of existence.",
  },
  {
    id: "judgement",
    name: "Judgement",
    number: 20,
    element: "Pluto",
    uprightMeaning: "Judgement, rebirth, inner calling, absolution",
    reversedMeaning: "Self-doubt, inner critic, ignoring the call",
    darkInterpretation: "The dead rise to answer for their sins — and to serve the dark master",
    divinationPower: 14,
    spiritConnection: 11,
    lore: "The angel of Judgement blows the horn that awakens the dead from their graves. In dark readings, this card promises the power to command the dead, but warns of the final judgement that awaits all who dabble in necromancy.",
  },
  {
    id: "the_world",
    name: "The World",
    number: 21,
    element: "Saturn",
    uprightMeaning: "Completion, integration, accomplishment, travel",
    reversedMeaning: "Seeking personal closure, shortcuts, delays",
    darkInterpretation: "The final circle closes — mastery over all dark forces is achieved",
    divinationPower: 16,
    spiritConnection: 13,
    lore: "The World represents the completion of the great work of darkness. The occultist who draws this card has transcended mortality and stands at the center of all worlds, master of light and shadow alike.",
  },
];

// ============================================================================
// Constants: 15 Spirits to Contact
// ============================================================================

export const OCC_SPIRITS: readonly OccSpiritData[] = [
  {
    id: "whispering_shade",
    name: "Whispering Shade",
    realm: "shadow_realm",
    power: 10,
    dangerLevel: 1,
    description: "A faint apparition that carries fragments of forgotten conversations from the dead.",
    knowledgeOffered: ["basic_shadow_reading", "spirit_listening"],
    offeringRequired: ["shadow_dust"],
    contactDifficulty: 5,
    minMastery: 1,
    rewards: { darkPower: 5, xp: 10, spellUnlock: null, ingredientBonus: "shadow_dust", knowledgeNodeUnlock: "spirit_whisper" },
  },
  {
    id: "blood_courtier",
    name: "Blood Courtier",
    realm: "netherworld",
    power: 25,
    dangerLevel: 3,
    description: "A spectral noble from the court of blood who trades in secrets and life force.",
    knowledgeOffered: ["blood_bargaining", "life_force_manipulation"],
    offeringRequired: ["blood_vial", "crimson_salt"],
    contactDifficulty: 15,
    minMastery: 5,
    rewards: { darkPower: 15, xp: 30, spellUnlock: "life_drain", ingredientBonus: "blood_vial", knowledgeNodeUnlock: "blood_bargain" },
  },
  {
    id: "bone_singer",
    name: "Bone Singer",
    realm: "ethereal_void",
    power: 35,
    dangerLevel: 4,
    description: "An ancient entity that sings to the bones of the dead, making them dance to its melody.",
    knowledgeOffered: ["necromantic_songs", "skeletal_animation"],
    offeringRequired: ["bone_fragment", "grave_dust"],
    contactDifficulty: 25,
    minMastery: 8,
    rewards: { darkPower: 25, xp: 50, spellUnlock: "bone_surge", ingredientBonus: "bone_fragment", knowledgeNodeUnlock: "bone_chorus" },
  },
  {
    id: "void_watcher",
    name: "Void Watcher",
    realm: "astral_plane",
    power: 45,
    dangerLevel: 5,
    description: "A being that exists at the edge of the void, observing all of reality through tears in space.",
    knowledgeOffered: ["void_gazing", "dimensional_weakness"],
    offeringRequired: ["void_crystal", "shadow_dust"],
    contactDifficulty: 35,
    minMastery: 12,
    rewards: { darkPower: 35, xp: 75, spellUnlock: "void_rift", ingredientBonus: "void_crystal", knowledgeNodeUnlock: "void_perception" },
  },
  {
    id: "ash_wraith",
    name: "Ash Wraith",
    realm: "shadow_realm",
    power: 30,
    dangerLevel: 4,
    description: "A being formed entirely from the ash of burned libraries and destroyed grimoires.",
    knowledgeOffered: ["lost_knowledge", "ash_transmutation"],
    offeringRequired: ["sacred_ash", "ember_coal"],
    contactDifficulty: 20,
    minMastery: 10,
    rewards: { darkPower: 20, xp: 45, spellUnlock: "ash_storm", ingredientBonus: "sacred_ash", knowledgeNodeUnlock: "ash_mastery" },
  },
  {
    id: "thorn_mother",
    name: "Thorn Mother",
    realm: "dreamscape",
    power: 40,
    dangerLevel: 5,
    description: "A primordial nature spirit twisted by dark magic into a being of living thorns and curse vines.",
    knowledgeOffered: ["curse_weaving", "thorn_binding"],
    offeringRequired: ["thorn_briar", "curse_vine"],
    contactDifficulty: 30,
    minMastery: 12,
    rewards: { darkPower: 30, xp: 60, spellUnlock: "hex_of_venom", ingredientBonus: null, knowledgeNodeUnlock: "curse_weave" },
  },
  {
    id: "eclipse_phantom",
    name: "Eclipse Phantom",
    realm: "astral_plane",
    power: 60,
    dangerLevel: 7,
    description: "A phantom that appears only during eclipses, carrying fragments of eclipsed celestial power.",
    knowledgeOffered: ["eclipse_channeling", "dark_astronomy"],
    offeringRequired: ["eclipse_shard"],
    contactDifficulty: 45,
    minMastery: 20,
    rewards: { darkPower: 50, xp: 100, spellUnlock: "eclipse_ray", ingredientBonus: "eclipse_shard", knowledgeNodeUnlock: "eclipse_mastery" },
  },
  {
    id: "abyss_herald",
    name: "Abyss Herald",
    realm: "ethereal_void",
    power: 75,
    dangerLevel: 8,
    description: "A messenger from the deepest abyss who speaks in riddles that reveal terrible truths.",
    knowledgeOffered: ["abyssal_secrets", "reality_fracture"],
    offeringRequired: ["abyss_heart", "null_shard"],
    contactDifficulty: 55,
    minMastery: 30,
    rewards: { darkPower: 65, xp: 150, spellUnlock: "abyssal_gateway", ingredientBonus: "abyss_heart", knowledgeNodeUnlock: "abyss_knowledge" },
  },
  {
    id: "dream_eater",
    name: "Dream Eater",
    realm: "dreamscape",
    power: 20,
    dangerLevel: 3,
    description: "A creature that feeds on nightmares, growing stronger with each dream it consumes.",
    knowledgeOffered: ["dream_invasion", "nightmare_extraction"],
    offeringRequired: ["shadow_dust", "blood_vial"],
    contactDifficulty: 12,
    minMastery: 5,
    rewards: { darkPower: 10, xp: 25, spellUnlock: null, ingredientBonus: null, knowledgeNodeUnlock: "dream_walking" },
  },
  {
    id: "limbo_keeper",
    name: "Limbo Keeper",
    realm: "limbo",
    power: 50,
    dangerLevel: 6,
    description: "The guardian of the space between life and death, where lost souls wander for eternity.",
    knowledgeOffered: ["soul_navigation", "limbo_traversal"],
    offeringRequired: ["blood_vial", "void_crystal"],
    contactDifficulty: 40,
    minMastery: 15,
    rewards: { darkPower: 40, xp: 80, spellUnlock: "soul_bind", ingredientBonus: null, knowledgeNodeUnlock: "soul_navigation" },
  },
  {
    id: "flame_specter",
    name: "Flame Specter",
    realm: "netherworld",
    power: 55,
    dangerLevel: 6,
    description: "A burning spirit from the deepest layers of the netherworld, wreathed in cold black flames.",
    knowledgeOffered: ["dark_pyromancy", "flame_binding"],
    offeringRequired: ["ember_coal", "sacred_ash"],
    contactDifficulty: 38,
    minMastery: 15,
    rewards: { darkPower: 35, xp: 70, spellUnlock: null, ingredientBonus: "ember_coal", knowledgeNodeUnlock: "dark_flame" },
  },
  {
    id: "shadow_doppelganger",
    name: "Shadow Doppelganger",
    realm: "shadow_realm",
    power: 65,
    dangerLevel: 7,
    description: "A being that takes the form of your deepest fears, appearing as your exact dark reflection.",
    knowledgeOffered: ["shadow_mimicry", "fear_confrontation"],
    offeringRequired: ["void_crystal", "eclipse_shard"],
    contactDifficulty: 50,
    minMastery: 25,
    rewards: { darkPower: 55, xp: 120, spellUnlock: null, ingredientBonus: null, knowledgeNodeUnlock: "shadow_self" },
  },
  {
    id: "void_serpent",
    name: "Void Serpent",
    realm: "ethereal_void",
    power: 80,
    dangerLevel: 9,
    description: "A massive serpent that coils through the void, devouring dimensions and leaving nothingness in its wake.",
    knowledgeOffered: ["void_travel", "dimensional_destruction"],
    offeringRequired: ["abyss_heart", "null_shard", "void_crystal"],
    contactDifficulty: 60,
    minMastery: 35,
    rewards: { darkPower: 70, xp: 180, spellUnlock: null, ingredientBonus: "null_shard", knowledgeNodeUnlock: "void_consuming" },
  },
  {
    id: "crimson_oracle",
    name: "Crimson Oracle",
    realm: "netherworld",
    power: 70,
    dangerLevel: 7,
    description: "An ancient seer bathed in rivers of blood who can see all possible futures, including the darkest timelines.",
    knowledgeOffered: ["blood_divination", "timeline_manipulation"],
    offeringRequired: ["blood_vial", "crimson_salt", "bone_fragment"],
    contactDifficulty: 48,
    minMastery: 22,
    rewards: { darkPower: 50, xp: 110, spellUnlock: "blood_pact", ingredientBonus: "crimson_salt", knowledgeNodeUnlock: "blood_prophecy" },
  },
  {
    id: "entropy_wraith",
    name: "Entropy Wraith",
    realm: "limbo",
    power: 90,
    dangerLevel: 10,
    description: "The embodiment of entropy itself, a being of pure decay that exists to unravel all of creation.",
    knowledgeOffered: ["entropy_control", "unraveling"],
    offeringRequired: ["abyss_heart", "eclipse_shard", "sacred_ash"],
    contactDifficulty: 70,
    minMastery: 40,
    rewards: { darkPower: 90, xp: 250, spellUnlock: null, ingredientBonus: "abyss_heart", knowledgeNodeUnlock: "entropy_prime" },
  },
];

// ============================================================================
// Constants: 20 Knowledge Tree Nodes
// ============================================================================

export const OCC_KNOWLEDGE_NODES: readonly OccKnowledgeNodeData[] = [
  {
    id: "spirit_whisper",
    name: "Spirit Whisper",
    branch: "astral_projection",
    description: "Learn to hear the faint whispers of spirits lingering in the world.",
    unlockCost: 10,
    prerequisiteNodes: [],
    darkPowerBonus: 2,
    spellBonus: 1,
    spiritBonus: 5,
    ritualBonus: 0,
    tier: 1,
  },
  {
    id: "basic_shadow_reading",
    name: "Basic Shadow Reading",
    branch: "forbidden_lore",
    description: "Interpret the shapes and movements of shadows to divine meaning.",
    unlockCost: 15,
    prerequisiteNodes: [],
    darkPowerBonus: 3,
    spellBonus: 2,
    spiritBonus: 0,
    ritualBonus: 1,
    tier: 1,
  },
  {
    id: "blood_bargain",
    name: "Blood Bargain",
    branch: "demonology",
    description: "Understand the fundamentals of blood-based magical contracts and pacts.",
    unlockCost: 20,
    prerequisiteNodes: [],
    darkPowerBonus: 4,
    spellBonus: 2,
    spiritBonus: 2,
    ritualBonus: 2,
    tier: 1,
  },
  {
    id: "skeletal_animation",
    name: "Skeletal Animation",
    branch: "necromancy",
    description: "Animate the bones of the deceased to serve as your undead minions.",
    unlockCost: 25,
    prerequisiteNodes: [],
    darkPowerBonus: 5,
    spellBonus: 3,
    spiritBonus: 3,
    ritualBonus: 1,
    tier: 1,
  },
  {
    id: "ritual_fundamentals",
    name: "Ritual Fundamentals",
    branch: "ritual_mastery",
    description: "Master the basic principles of ritual circle construction and activation.",
    unlockCost: 10,
    prerequisiteNodes: [],
    darkPowerBonus: 2,
    spellBonus: 1,
    spiritBonus: 1,
    ritualBonus: 5,
    tier: 1,
  },
  {
    id: "dream_walking",
    name: "Dream Walking",
    branch: "astral_projection",
    description: "Project your consciousness into the dreamscape to explore the sleeping minds of others.",
    unlockCost: 40,
    prerequisiteNodes: ["spirit_whisper"],
    darkPowerBonus: 5,
    spellBonus: 3,
    spiritBonus: 10,
    ritualBonus: 2,
    tier: 2,
  },
  {
    id: "void_perception",
    name: "Void Perception",
    branch: "forbidden_lore",
    description: "Develop senses that can perceive the void and its entities without going mad.",
    unlockCost: 50,
    prerequisiteNodes: ["basic_shadow_reading"],
    darkPowerBonus: 8,
    spellBonus: 5,
    spiritBonus: 5,
    ritualBonus: 3,
    tier: 2,
  },
  {
    id: "demon_summoning",
    name: "Demon Summoning",
    branch: "demonology",
    description: "Learn the true names and sigils needed to summon lesser demons from the nether planes.",
    unlockCost: 60,
    prerequisiteNodes: ["blood_bargain"],
    darkPowerBonus: 10,
    spellBonus: 8,
    spiritBonus: 5,
    ritualBonus: 5,
    tier: 2,
  },
  {
    id: "bone_chorus",
    name: "Bone Chorus",
    branch: "necromancy",
    description: "Command multiple skeletal servants simultaneously, each responding to a different musical frequency.",
    unlockCost: 55,
    prerequisiteNodes: ["skeletal_animation"],
    darkPowerBonus: 8,
    spellBonus: 6,
    spiritBonus: 8,
    ritualBonus: 3,
    tier: 2,
  },
  {
    id: "advanced_rituals",
    name: "Advanced Ritual Circles",
    branch: "ritual_mastery",
    description: "Construct and activate complex multi-element ritual circles with enhanced power.",
    unlockCost: 45,
    prerequisiteNodes: ["ritual_fundamentals"],
    darkPowerBonus: 6,
    spellBonus: 4,
    spiritBonus: 3,
    ritualBonus: 12,
    tier: 2,
  },
  {
    id: "ash_mastery",
    name: "Ash Mastery",
    branch: "forbidden_lore",
    description: "Transmute ash into various forms, each with different magical properties.",
    unlockCost: 70,
    prerequisiteNodes: ["void_perception"],
    darkPowerBonus: 12,
    spellBonus: 8,
    spiritBonus: 5,
    ritualBonus: 5,
    tier: 3,
  },
  {
    id: "curse_weave",
    name: "Curse Weaving",
    branch: "demonology",
    description: "Weave complex multi-layered curses that are nearly impossible to break.",
    unlockCost: 80,
    prerequisiteNodes: ["demon_summoning"],
    darkPowerBonus: 14,
    spellBonus: 10,
    spiritBonus: 6,
    ritualBonus: 6,
    tier: 3,
  },
  {
    id: "dark_flame",
    name: "Dark Flame",
    branch: "necromancy",
    description: "Command the cold black flames of the underworld that burn the soul instead of the body.",
    unlockCost: 75,
    prerequisiteNodes: ["bone_chorus"],
    darkPowerBonus: 12,
    spellBonus: 10,
    spiritBonus: 8,
    ritualBonus: 4,
    tier: 3,
  },
  {
    id: "soul_navigation",
    name: "Soul Navigation",
    branch: "astral_projection",
    description: "Navigate the space between life and death, guiding souls to their destinations.",
    unlockCost: 65,
    prerequisiteNodes: ["dream_walking"],
    darkPowerBonus: 10,
    spellBonus: 6,
    spiritBonus: 15,
    ritualBonus: 5,
    tier: 3,
  },
  {
    id: "eclipse_mastery",
    name: "Eclipse Mastery",
    branch: "ritual_mastery",
    description: "Harness the power of celestial alignments to supercharge rituals beyond normal limits.",
    unlockCost: 90,
    prerequisiteNodes: ["advanced_rituals"],
    darkPowerBonus: 15,
    spellBonus: 8,
    spiritBonus: 8,
    ritualBonus: 18,
    tier: 3,
  },
  {
    id: "abyss_knowledge",
    name: "Abyssal Knowledge",
    branch: "forbidden_lore",
    description: "Access the terrifying knowledge stored at the bottom of the abyss without losing your mind.",
    unlockCost: 120,
    prerequisiteNodes: ["ash_mastery"],
    darkPowerBonus: 20,
    spellBonus: 12,
    spiritBonus: 10,
    ritualBonus: 8,
    tier: 4,
  },
  {
    id: "blood_prophecy",
    name: "Blood Prophecy",
    branch: "demonology",
    description: "Read the future in patterns of spilled blood and alter fate through blood sacrifice.",
    unlockCost: 110,
    prerequisiteNodes: ["curse_weave"],
    darkPowerBonus: 18,
    spellBonus: 12,
    spiritBonus: 8,
    ritualBonus: 10,
    tier: 4,
  },
  {
    id: "shadow_self",
    name: "The Shadow Self",
    branch: "astral_projection",
    description: "Confront and merge with your own shadow, gaining its power and knowledge.",
    unlockCost: 100,
    prerequisiteNodes: ["soul_navigation"],
    darkPowerBonus: 18,
    spellBonus: 10,
    spiritBonus: 12,
    ritualBonus: 8,
    tier: 4,
  },
  {
    id: "void_consuming",
    name: "Void Consumption",
    branch: "necromancy",
    description: "Feed on void energy to sustain yourself, reducing the need for food and sleep.",
    unlockCost: 130,
    prerequisiteNodes: ["dark_flame"],
    darkPowerBonus: 22,
    spellBonus: 14,
    spiritBonus: 10,
    ritualBonus: 6,
    tier: 4,
  },
  {
    id: "entropy_prime",
    name: "Entropy Prime",
    branch: "forbidden_lore",
    description: "The ultimate forbidden knowledge — understanding and controlling the fundamental decay of all things.",
    unlockCost: 200,
    prerequisiteNodes: ["abyss_knowledge", "blood_prophecy"],
    darkPowerBonus: 35,
    spellBonus: 20,
    spiritBonus: 15,
    ritualBonus: 15,
    tier: 5,
  },
];

// ============================================================================
// Constants: 6 Forbidden Tomes
// ============================================================================

export const OCC_FORBIDDEN_TOMES: readonly OccForbiddenTomeData[] = [
  {
    id: "tome_of_soul_binding",
    name: "Tome of Soul Binding",
    power: "minor",
    description: "A thin volume bound in pale leather that details the art of binding souls to objects and locations.",
    pagesLearned: 0,
    totalPages: 50,
    darkKnowledgePer: 2,
    corruptionRisk: 1,
    spellsContained: ["soul_bind"],
    unlockMastery: 5,
    lore: "Written by the Heretic Aldric during the Age of Purges, this tome was thought destroyed but was preserved by a secret order of soul binders who used it to create an army of bound guardians.",
  },
  {
    id: "tome_of_demonology",
    name: "Grimoire of the Demon Lord",
    power: "moderate",
    description: "A heavy tome inscribed with the true names of one hundred demons and their summoning sigils.",
    pagesLearned: 0,
    totalPages: 100,
    darkKnowledgePer: 3,
    corruptionRisk: 2,
    spellsContained: ["demon_summon"],
    unlockMastery: 12,
    lore: "Dictated by the demon lord Vex'tharion to the mad sorceress Morvana, this grimoire contains power that comes at the cost of the reader's sanity with every page turned.",
  },
  {
    id: "tome_of_blood",
    name: "Codex Sanguis",
    power: "major",
    description: "A blood-soaked codex that details every blood magic ritual known to exist, including the forbidden Blood Pact Eternal.",
    pagesLearned: 0,
    totalPages: 150,
    darkKnowledgePer: 4,
    corruptionRisk: 3,
    spellsContained: ["blood_pact", "life_drain"],
    unlockMastery: 20,
    lore: "The Codex Sanguis was written in the blood of its author, the vampire sorcerer Lord Crimsonveil. Each page carries a portion of his will, slowly subverting the reader's mind.",
  },
  {
    id: "tome_of_eclipses",
    name: "Liber Eclipse",
    power: "major",
    description: "An astronomical treatise that reveals the dark secrets hidden within celestial eclipses and alignments.",
    pagesLearned: 0,
    totalPages: 120,
    darkKnowledgePer: 4,
    corruptionRisk: 3,
    spellsContained: ["eclipse_ray"],
    unlockMastery: 22,
    lore: "Compiled by the Order of the Obscured Sun over centuries, the Liber Eclipse predicts every celestial alignment for the next thousand years and provides rituals for each one.",
  },
  {
    id: "tome_of_the_abyss",
    name: "Codex Abyssus",
    power: "transcendent",
    description: "The most dangerous tome in existence — reading it allows you to comprehend the true nature of the abyss.",
    pagesLearned: 0,
    totalPages: 200,
    darkKnowledgePer: 5,
    corruptionRisk: 5,
    spellsContained: ["abyssal_gateway", "void_rift"],
    unlockMastery: 35,
    lore: "No one knows who wrote the Codex Abyssus. Some say it wrote itself. Those who have read it in its entirety have either transcended mortality or been consumed by the void entirely.",
  },
  {
    id: "tome_of_forbidden_names",
    name: "Book of Forbidden Names",
    power: "transcendent",
    description: "Contains the true names of every entity that exists, has existed, or will exist — mortal, divine, and otherwise.",
    pagesLearned: 0,
    totalPages: 250,
    darkKnowledgePer: 6,
    corruptionRisk: 5,
    spellsContained: ["abyssal_gateway", "eclipse_ray", "blood_pact"],
    unlockMastery: 40,
    lore: "The Book of Forbidden Names is said to predate creation itself. It exists in all dimensions simultaneously, and reading a true name from its pages gives absolute power over the named entity — at the cost of a piece of your own identity.",
  },
];

// ============================================================================
// Constants: 15 Achievements
// ============================================================================

export const OCC_ACHIEVEMENTS: readonly OccAchievementData[] = [
  {
    id: "first_ritual",
    name: "First Rite",
    description: "Complete your very first dark ritual.",
    tier: "bronze",
    requirement: "totalRitualsPerformed",
    targetValue: 1,
    xpReward: 20,
    darkPowerReward: 5,
    icon: "🌑",
  },
  {
    id: "ritual_apprentice",
    name: "Ritual Apprentice",
    description: "Complete 10 dark rituals.",
    tier: "bronze",
    requirement: "totalRitualsPerformed",
    targetValue: 10,
    xpReward: 60,
    darkPowerReward: 15,
    icon: "🕯️",
  },
  {
    id: "dark_adept",
    name: "Dark Adept",
    description: "Complete 50 dark rituals.",
    tier: "silver",
    requirement: "totalRitualsPerformed",
    targetValue: 50,
    xpReward: 200,
    darkPowerReward: 50,
    icon: "✨",
  },
  {
    id: "master_of_rites",
    name: "Master of Rites",
    description: "Complete 200 dark rituals.",
    tier: "gold",
    requirement: "totalRitualsPerformed",
    targetValue: 200,
    xpReward: 800,
    darkPowerReward: 200,
    icon: "👑",
  },
  {
    id: "spellcaster_initiate",
    name: "Spellcaster Initiate",
    description: "Cast your first dark spell.",
    tier: "bronze",
    requirement: "totalSpellsCast",
    targetValue: 1,
    xpReward: 15,
    darkPowerReward: 3,
    icon: "⚡",
  },
  {
    id: "spell_weaver",
    name: "Spell Weaver",
    description: "Cast 30 dark spells.",
    tier: "silver",
    requirement: "totalSpellsCast",
    targetValue: 30,
    xpReward: 150,
    darkPowerReward: 35,
    icon: "🌀",
  },
  {
    id: "arcane_lord",
    name: "Arcane Lord",
    description: "Cast 100 dark spells.",
    tier: "gold",
    requirement: "totalSpellsCast",
    targetValue: 100,
    xpReward: 500,
    darkPowerReward: 120,
    icon: "💫",
  },
  {
    id: "spirit_medium",
    name: "Spirit Medium",
    description: "Contact 5 different spirits.",
    tier: "bronze",
    requirement: "totalSpiritsContacted",
    targetValue: 5,
    xpReward: 50,
    darkPowerReward: 20,
    icon: "👻",
  },
  {
    id: "spirit_master",
    name: "Spirit Master",
    description: "Contact all 15 spirits at least once.",
    tier: "obsidian",
    requirement: "totalSpiritsContacted",
    targetValue: 15,
    xpReward: 1000,
    darkPowerReward: 300,
    icon: "💀",
  },
  {
    id: "tarot_reader",
    name: "Tarot Reader",
    description: "Perform 10 tarot readings.",
    tier: "bronze",
    requirement: "totalTarotReadings",
    targetValue: 10,
    xpReward: 40,
    darkPowerReward: 10,
    icon: "🃏",
  },
  {
    id: "oracle_of_darkness",
    name: "Oracle of Darkness",
    description: "Perform 50 tarot readings.",
    tier: "silver",
    requirement: "totalTarotReadings",
    targetValue: 50,
    xpReward: 180,
    darkPowerReward: 45,
    icon: "🔮",
  },
  {
    id: "tome_collector",
    name: "Tome Collector",
    description: "Own all 6 forbidden tomes.",
    tier: "gold",
    requirement: "totalTomesStudied",
    targetValue: 6,
    xpReward: 600,
    darkPowerReward: 150,
    icon: "📖",
  },
  {
    id: "knowledge_seeker",
    name: "Knowledge Seeker",
    description: "Unlock 10 knowledge tree nodes.",
    tier: "silver",
    requirement: "knowledgeNodes",
    targetValue: 10,
    xpReward: 150,
    darkPowerReward: 40,
    icon: "📚",
  },
  {
    id: "daily_devotee",
    name: "Daily Devotee",
    description: "Complete 7 daily dark rituals in a row.",
    tier: "silver",
    requirement: "dailyStreak",
    targetValue: 7,
    xpReward: 120,
    darkPowerReward: 30,
    icon: "🗓️",
  },
  {
    id: "eternal_coven",
    name: "Eternal Coven",
    description: "Maintain a 30-day daily ritual streak.",
    tier: "obsidian",
    requirement: "dailyStreak",
    targetValue: 30,
    xpReward: 2000,
    darkPowerReward: 500,
    icon: "♾️",
  },
];

// ============================================================================
// Constants: Daily Dark Ritual Data
// ============================================================================

export const OCC_DAILY_RITUALS: readonly OccDailyRitualData[] = [
  {
    phase: "dawn_invocation",
    name: "Dawn Invocation",
    description: "A ritual performed at the first light, channeling the dying darkness of night into power before the sun banishes it.",
    duration: 300,
    requiredMastery: 1,
    darkPowerReward: 15,
    xpReward: 25,
    ingredientReward: "shadow_dust",
    specialEffect: "+10% dark power regeneration for the day",
    bonusCircle: "circle_of_shadow",
  },
  {
    phase: "midnight_summoning",
    name: "Midnight Summoning",
    description: "At the witching hour, the veil thins and spirits respond. This ritual calls forth beneficial dark entities.",
    duration: 600,
    requiredMastery: 5,
    darkPowerReward: 30,
    xpReward: 50,
    ingredientReward: "grave_dust",
    specialEffect: "+15% spirit affinity for 24 hours",
    bonusCircle: "circle_of_bone",
  },
  {
    phase: "eclipse_communion",
    name: "Eclipse Communion",
    description: "A powerful ritual that briefly aligns your circle with celestial eclipse energy, granting visions of the future.",
    duration: 900,
    requiredMastery: 15,
    darkPowerReward: 60,
    xpReward: 100,
    ingredientReward: "eclipse_shard",
    specialEffect: "Free tarot reading with enhanced accuracy",
    bonusCircle: "circle_of_eclipse",
  },
  {
    phase: "void_meditation",
    name: "Void Meditation",
    description: "Meditate upon the void, letting its emptiness fill you with dark clarity and terrible purpose.",
    duration: 1200,
    requiredMastery: 25,
    darkPowerReward: 100,
    xpReward: 150,
    ingredientReward: "void_crystal",
    specialEffect: "+25% spell potency for 24 hours",
    bonusCircle: "circle_of_void",
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function occGetXpForMastery(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.5) + 100 * level)
}

function occGetMasteryLevel(xp: number): number {
  let level = 1
  let xpNeeded = 0
  while (level < 50) {
    xpNeeded = occGetXpForMastery(level)
    if (xp < xpNeeded) break
    xp -= xpNeeded
    level++
  }
  return level
}

function occGetMasteryProgressInner(xp: number): number {
  const level = occGetMasteryLevel(xp)
  if (level >= 50) return 1
  const currentLevelXp = occGetXpForMastery(level)
  const prevTotalXp = level > 1 ? occGetXpForMastery(level - 1) : 0
  return (xp - prevTotalXp) / (currentLevelXp - prevTotalXp)
}

function occGetFamiliarBondLevelInner(bond: number): OccFamiliarBondLevel {
  if (bond >= 80) return "soulbound"
  if (bond >= 60) return "partner"
  if (bond >= 40) return "companion"
  if (bond >= 20) return "acquaintance"
  return "stranger"
}

function occGetTodaysDateString(): string {
  return new Date().toISOString().split("T")[0]
}

function occGetDailyRitualPhase(): OccDailyRitualPhase {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const phases: OccDailyRitualPhase[] = [
    "dawn_invocation",
    "midnight_summoning",
    "eclipse_communion",
    "void_meditation",
  ]
  return phases[dayOfYear % 4]
}

function occGetDefaultInventory(): OccInventoryState {
  return {
    ingredients: {
      shadow_dust: 5,
      void_ember: 3,
      blood_vial: 0,
      crimson_salt: 0,
      bone_fragment: 0,
      grave_dust: 0,
      sacred_ash: 0,
      ember_coal: 2,
      void_crystal: 0,
      null_shard: 0,
      thorn_briar: 0,
      curse_vine: 0,
      eclipse_shard: 0,
      obsidian_dust: 0,
      abyss_heart: 0,
      entropy_stone: 0,
    },
    darkPowerCrystals: 0,
    soulFragments: 0,
    voidEssence: 0,
    bloodVials: 0,
    boneDust: 0,
    ashResidue: 0,
  }
}

function occGetDefaultDailyRitual(): OccDailyRitualState {
  return {
    isActive: false,
    phase: null,
    progress: 0,
    targetProgress: 100,
    startTime: null,
    lastCompletedDate: null,
    completedToday: false,
    totalCompleted: 0,
    streakDays: 0,
    bestStreak: 0,
  }
}

function occGetDefaultRitualCast(): OccRitualCastState {
  return {
    circleId: null,
    status: null,
    progress: 0,
    targetProgress: 100,
    activeSpell: null,
    startTime: null,
    participants: [],
    darkPowerConsumed: 0,
    darkPowerGenerated: 0,
  }
}

function occGetDefaultKnowledgeTree(): OccKnowledgeTreeState {
  return {
    unlockedNodes: [],
    totalInvested: 0,
    branchProgress: {
      forbidden_lore: 0,
      demonology: 0,
      necromancy: 0,
      ritual_mastery: 0,
      astral_projection: 0,
    },
  }
}

function occGetDefaultSpiritContacts(): Record<string, OccSpiritContactState> {
  const contacts: Record<string, OccSpiritContactState> = {}
  for (const spirit of OCC_SPIRITS) {
    contacts[spirit.id] = {
      spiritId: spirit.id,
      isContacting: false,
      progress: 0,
      targetProgress: spirit.contactDifficulty,
      offeringsGiven: [],
      contactSuccessful: null,
      lastContactTimestamp: 0,
      totalContacts: 0,
    }
  }
  return contacts
}

function occGetDefaultForbiddenTomes(): Record<string, OccForbiddenTomeState> {
  const tomes: Record<string, OccForbiddenTomeState> = {}
  for (const tome of OCC_FORBIDDEN_TOMES) {
    tomes[tome.id] = {
      id: tome.id,
      isOwned: false,
      pagesStudied: 0,
      isStudying: false,
      studyProgress: 0,
      lastStudyTimestamp: 0,
      corruptionLevel: 0,
    }
  }
  return tomes
}

function occGetDefaultState(): OccOccultCircleState {
  return {
    playerName: "Unnamed Initiate",
    ritualMastery: 1,
    ritualMasteryXP: 0,
    darkPower: 0,
    totalDarkPowerEarned: 0,
    totalRitualsPerformed: 0,
    totalSpellsCast: 0,
    totalSpiritsContacted: 0,
    totalTarotReadings: 0,
    totalAchievementsUnlocked: 0,
    totalTomesStudied: 0,
    totalDailyRitualsCompleted: 0,
    unlockedCircles: ["circle_of_shadow"],
    activeCircle: null,
    unlockedSpells: ["shadow_bolt"],
    activeSpells: [],
    spellCooldowns: {},
    familiarState: null,
    unlockedFamiliars: [],
    tarotReading: null,
    tarotReadingsHistory: [],
    spiritContacts: occGetDefaultSpiritContacts(),
    knowledgeTree: occGetDefaultKnowledgeTree(),
    forbiddenTomes: occGetDefaultForbiddenTomes(),
    achievements: [],
    dailyRitual: occGetDefaultDailyRitual(),
    ritualCast: occGetDefaultRitualCast(),
    inventory: occGetDefaultInventory(),
    corruptionLevel: 0,
    currentDay: Math.floor(Date.now() / 86400000),
  }
}

function occGenerateTarotReading(): OccTarotReading {
  const shuffled = [...OCC_TAROT_CARDS].sort(() => Math.random() - 0.5)
  const selectedCards = shuffled.slice(0, 3)
  const isReversed = [Math.random() > 0.5, Math.random() > 0.5, Math.random() > 0.5]
  const totalPower = selectedCards.reduce((sum, c, i) => {
    const multiplier = isReversed[i] ? 0.5 : 1.0
    return sum + c.divinationPower * multiplier
  }, 0)

  const outcomes: OccDivinationOutcome[] = [
    "great_blessing",
    "minor_blessing",
    "neutral",
    "minor_curse",
    "great_curse",
  ]
  let outcomeIndex = 2
  if (totalPower >= 30) outcomeIndex = 0
  else if (totalPower >= 22) outcomeIndex = 1
  else if (totalPower < 12) outcomeIndex = 4
  else if (totalPower < 18) outcomeIndex = 3

  const interpretations: Record<OccDivinationOutcome, string> = {
    great_blessing:
      "The cards align in your favor. Great dark power flows toward you. The spirits smile upon your path.",
    minor_blessing:
      "A favorable reading. The shadows offer you a modest boon. Continue your dark studies diligently.",
    neutral:
      "The cards reveal neither favor nor disfavor. The path ahead is shrouded in uncertainty — proceed with caution.",
    minor_curse:
      "A shadow passes over the cards. Minor misfortune may befall you. Strengthen your wards.",
    great_curse:
      "The cards scream in warning. A terrible fate approaches. Only the strongest rituals can avert disaster.",
  }

  const outcome = outcomes[outcomeIndex] as OccDivinationOutcome
  const cardNames = selectedCards.map((c) => c.name).join(", ")

  return {
    cards: selectedCards.map((c) => c.id),
    isReversed,
    outcome,
    interpretation: `${cardNames}: ${interpretations[outcome]}`,
    timestamp: Date.now(),
    darkPowerGained: outcome === "great_blessing" ? 20 : outcome === "minor_blessing" ? 10 : outcome === "neutral" ? 3 : 0,
  }
}

function occCheckAchievements(state: OccOccultCircleState): string[] {
  const newAchievements: string[] = []
  for (const ach of OCC_ACHIEVEMENTS) {
    if (state.achievements.includes(ach.id)) continue
    let currentValue = 0
    switch (ach.requirement) {
      case "totalRitualsPerformed":
        currentValue = state.totalRitualsPerformed
        break
      case "totalSpellsCast":
        currentValue = state.totalSpellsCast
        break
      case "totalSpiritsContacted":
        currentValue = state.totalSpiritsContacted
        break
      case "totalTarotReadings":
        currentValue = state.totalTarotReadings
        break
      case "totalTomesStudied":
        currentValue = Object.values(state.forbiddenTomes).filter((t) => t.isOwned).length
        break
      case "knowledgeNodes":
        currentValue = state.knowledgeTree.unlockedNodes.length
        break
      case "dailyStreak":
        currentValue = state.dailyRitual.bestStreak
        break
      default:
        currentValue = 0
    }
    if (currentValue >= ach.targetValue) {
      newAchievements.push(ach.id)
    }
  }
  return newAchievements
}

// ============================================================================
// STORAGE KEY
// ============================================================================

const OCC_STORAGE_KEY = "occult-circle-save"

// ============================================================================
// Default Export Hook
// ============================================================================

export default function useOccultCircle() {
  const [state, setState] = useState<OccOccultCircleState>(() => {
    try {
      const saved = localStorage.getItem(OCC_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        const defaults = occGetDefaultState()
        return { ...defaults, ...parsed }
      }
    } catch {
      // Fall through to default
    }
    return occGetDefaultState()
  })

  useState(() => {
    try {
      localStorage.setItem(OCC_STORAGE_KEY, JSON.stringify(state))
    } catch {
      // Storage full or unavailable
    }
  })

  // ================================================================
  // PLAYER & MASTERY FUNCTIONS
  // ================================================================

  function occGetPlayerName(): string {
    return state.playerName
  }

  function occSetPlayerName(name: string): void {
    setState((prev) => ({ ...prev, playerName: name }))
  }

  function occGetRitualMastery(): number {
    return state.ritualMastery
  }

  function occGetRitualMasteryXP(): number {
    return state.ritualMasteryXP
  }

  function occGetXpForNextLevel(): number {
    return occGetXpForMastery(state.ritualMastery)
  }

  function occGetMasteryProgress(): number {
    return occGetMasteryProgressInner(state.ritualMasteryXP)
  }

  function occAddMasteryXP(amount: number): void {
    setState((prev) => {
      const newXP = prev.ritualMasteryXP + amount
      const newLevel = occGetMasteryLevel(newXP)
      const newDarkPower = prev.darkPower + Math.floor(amount * 0.5)
      return {
        ...prev,
        ritualMasteryXP: newXP,
        ritualMastery: newLevel,
        darkPower: newDarkPower,
        totalDarkPowerEarned: prev.totalDarkPowerEarned + Math.floor(amount * 0.5),
      }
    })
  }

  function occGetDarkPower(): number {
    return state.darkPower
  }

  function occSpendDarkPower(amount: number): boolean {
    if (state.darkPower < amount) return false
    setState((prev) => ({ ...prev, darkPower: prev.darkPower - amount }))
    return true
  }

  function occGetTotalDarkPowerEarned(): number {
    return state.totalDarkPowerEarned
  }

  function occGetCorruptionLevel(): number {
    return state.corruptionLevel
  }

  // ================================================================
  // RITUAL CIRCLE FUNCTIONS
  // ================================================================

  function occGetAllCircles(): OccRitualCircleData[] {
    return [...OCC_RITUAL_CIRCLES]
  }

  function occGetCircle(id: OccRitualCircle): OccRitualCircleData | undefined {
    return OCC_RITUAL_CIRCLES.find((c) => c.id === id)
  }

  function occGetUnlockedCircles(): OccRitualCircleData[] {
    return OCC_RITUAL_CIRCLES.filter((c) => state.unlockedCircles.includes(c.id))
  }

  function occIsCircleUnlocked(id: OccRitualCircle): boolean {
    return state.unlockedCircles.includes(id)
  }

  function occCanUnlockCircle(id: OccRitualCircle): boolean {
    const circle = OCC_RITUAL_CIRCLES.find((c) => c.id === id)
    if (!circle) return false
    if (state.unlockedCircles.includes(id)) return false
    return state.ritualMastery >= circle.unlockLevel
  }

  function occUnlockCircle(id: OccRitualCircle): boolean {
    if (!occCanUnlockCircle(id)) return false
    const circle = OCC_RITUAL_CIRCLES.find((c) => c.id === id)
    if (!circle) return false
    setState((prev) => ({
      ...prev,
      unlockedCircles: [...prev.unlockedCircles, id],
    }))
    return true
  }

  function occGetActiveCircle(): OccRitualCircle | null {
    return state.activeCircle
  }

  function occSetActiveCircle(id: OccRitualCircle | null): boolean {
    if (id !== null && !state.unlockedCircles.includes(id)) return false
    setState((prev) => ({ ...prev, activeCircle: id }))
    return true
  }

  function occGetCircleCount(): number {
    return state.unlockedCircles.length
  }

  function occGetCircleBonus(circleId: OccRitualCircle): { darkPower: number; spellPotency: number; spiritAffinity: number } {
    const circle = OCC_RITUAL_CIRCLES.find((c) => c.id === circleId)
    if (!circle) return { darkPower: 0, spellPotency: 0, spiritAffinity: 0 }
    return {
      darkPower: circle.darkPowerBonus,
      spellPotency: circle.spellPotencyBonus,
      spiritAffinity: circle.spiritAffinity,
    }
  }

  // ================================================================
  // DARK SPELL FUNCTIONS
  // ================================================================

  function occGetAllSpells(): OccSpellData[] {
    return [...OCC_DARK_SPELLS]
  }

  function occGetSpell(id: string): OccSpellData | undefined {
    return OCC_DARK_SPELLS.find((s) => s.id === id)
  }

  function occGetUnlockedSpells(): OccSpellData[] {
    return OCC_DARK_SPELLS.filter((s) => state.unlockedSpells.includes(s.id))
  }

  function occIsSpellUnlocked(id: string): boolean {
    return state.unlockedSpells.includes(id)
  }

  function occCanUnlockSpell(id: string): boolean {
    const spell = OCC_DARK_SPELLS.find((s) => s.id === id)
    if (!spell) return false
    if (state.unlockedSpells.includes(id)) return false
    if (state.ritualMastery < spell.minMastery) return false
    if (spell.requiredCircle && !state.unlockedCircles.includes(spell.requiredCircle)) return false
    if (spell.forbiddenTomeRequired) {
      const tomeState = state.forbiddenTomes[spell.forbiddenTomeRequired]
      if (!tomeState || !tomeState.isOwned) return false
    }
    return true
  }

  function occUnlockSpell(id: string): boolean {
    if (!occCanUnlockSpell(id)) return false
    setState((prev) => ({
      ...prev,
      unlockedSpells: [...prev.unlockedSpells, id],
    }))
    return true
  }

  function occGetActiveSpells(): OccSpellData[] {
    return OCC_DARK_SPELLS.filter((s) => state.activeSpells.includes(s.id))
  }

  function occActivateSpell(id: string): boolean {
    if (!state.unlockedSpells.includes(id)) return false
    if (state.spellCooldowns[id] && state.spellCooldowns[id] > Date.now()) return false
    const spell = OCC_DARK_SPELLS.find((s) => s.id === id)
    if (!spell) return false
    setState((prev) => ({
      ...prev,
      activeSpells: [...prev.activeSpells, id],
      spellCooldowns: {
        ...prev.spellCooldowns,
        [id]: Date.now() + spell.cooldown * 1000,
      },
      totalSpellsCast: prev.totalSpellsCast + 1,
    }))
    return true
  }

  function occGetSpellCooldown(id: string): number {
    const cooldownEnd = state.spellCooldowns[id]
    if (!cooldownEnd) return 0
    const remaining = cooldownEnd - Date.now()
    return remaining > 0 ? remaining : 0
  }

  function occGetSpellCount(): number {
    return state.unlockedSpells.length
  }

  function occGetSpellsBySchool(school: OccSpellSchool): OccSpellData[] {
    return OCC_DARK_SPELLS.filter((s) => s.school === school && state.unlockedSpells.includes(s.id))
  }

  function occGetSpellsByCircle(circleId: OccRitualCircle): OccSpellData[] {
    return OCC_DARK_SPELLS.filter(
      (s) => s.requiredCircle === circleId && state.unlockedSpells.includes(s.id)
    )
  }

  // ================================================================
  // POTION INGREDIENT FUNCTIONS
  // ================================================================

  function occGetAllIngredients(): OccPotionIngredientData[] {
    return [...OCC_POTION_INGREDIENTS]
  }

  function occGetIngredient(id: string): OccPotionIngredientData | undefined {
    return OCC_POTION_INGREDIENTS.find((i) => i.id === id)
  }

  function occGetIngredientCount(id: string): number {
    return state.inventory.ingredients[id] ?? 0
  }

  function occAddIngredient(id: string, amount: number): void {
    setState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        ingredients: {
          ...prev.inventory.ingredients,
          [id]: (prev.inventory.ingredients[id] ?? 0) + amount,
        },
      },
    }))
  }

  function occRemoveIngredient(id: string, amount: number): boolean {
    const current = state.inventory.ingredients[id] ?? 0
    if (current < amount) return false
    setState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        ingredients: {
          ...prev.inventory.ingredients,
          [id]: current - amount,
        },
      },
    }))
    return true
  }

  function occBuyIngredient(id: string): boolean {
    const ingredient = OCC_POTION_INGREDIENTS.find((i) => i.id === id)
    if (!ingredient || !ingredient.canBeBought) return false
    if (state.darkPower < ingredient.baseCost) return false
    setState((prev) => ({
      ...prev,
      darkPower: prev.darkPower - ingredient.baseCost,
      inventory: {
        ...prev.inventory,
        ingredients: {
          ...prev.inventory.ingredients,
          [id]: (prev.inventory.ingredients[id] ?? 0) + 1,
        },
      },
    }))
    return true
  }

  function occGatherIngredient(id: string): boolean {
    const ingredient = OCC_POTION_INGREDIENTS.find((i) => i.id === id)
    if (!ingredient) return false
    const familiarBonus = state.familiarState && ingredient.familiarBonus === state.familiarState.type ? 2 : 0
    const yieldAmount = 1 + familiarBonus
    const darkPowerGain = ingredient.darkPowerYield * yieldAmount
    setState((prev) => ({
      ...prev,
      darkPower: prev.darkPower + darkPowerGain,
      totalDarkPowerEarned: prev.totalDarkPowerEarned + darkPowerGain,
      inventory: {
        ...prev.inventory,
        ingredients: {
          ...prev.inventory.ingredients,
          [id]: (prev.inventory.ingredients[id] ?? 0) + yieldAmount,
        },
      },
    }))
    return true
  }

  function occGetIngredientsByRarity(rarity: OccPotionRarity): OccPotionIngredientData[] {
    return OCC_POTION_INGREDIENTS.filter((i) => i.rarity === rarity)
  }

  // ================================================================
  // FAMILIAR FUNCTIONS
  // ================================================================

  function occGetAllFamiliars(): OccFamiliarData[] {
    return [...OCC_FAMILIARS]
  }

  function occGetFamiliar(type: OccFamiliarType): OccFamiliarData | undefined {
    return OCC_FAMILIARS.find((f) => f.type === type)
  }

  function occGetUnlockedFamiliars(): OccFamiliarData[] {
    return OCC_FAMILIARS.filter((f) => state.unlockedFamiliars.includes(f.type))
  }

  function occIsFamiliarUnlocked(type: OccFamiliarType): boolean {
    return state.unlockedFamiliars.includes(type)
  }

  function occCanUnlockFamiliar(type: OccFamiliarType): boolean {
    const familiar = OCC_FAMILIARS.find((f) => f.type === type)
    if (!familiar) return false
    if (state.unlockedFamiliars.includes(type)) return false
    return state.ritualMastery >= familiar.unlockMastery
  }

  function occUnlockFamiliar(type: OccFamiliarType): boolean {
    if (!occCanUnlockFamiliar(type)) return false
    const familiar = OCC_FAMILIARS.find((f) => f.type === type)
    if (!familiar) return false
    setState((prev) => ({
      ...prev,
      unlockedFamiliars: [...prev.unlockedFamiliars, type],
      familiarState: {
        type,
        bond: 0,
        bondLevel: "stranger",
        isSummoned: false,
        feedCount: 0,
        lastFedTimestamp: 0,
        ritualAssists: 0,
      },
    }))
    return true
  }

  function occGetActiveFamiliar(): OccFamiliarState | null {
    return state.familiarState
  }

  function occGetFamiliarBond(): number {
    return state.familiarState?.bond ?? 0
  }

  function occGetFamiliarBondLevel(): OccFamiliarBondLevel {
    if (!state.familiarState) return "stranger"
    return state.familiarState.bondLevel
  }

  function occFeedFamiliar(): boolean {
    if (!state.familiarState) return false
    const newBond = Math.min(state.familiarState.bond + 5, state.familiarState.bond === 100 ? 100 : 100)
    const familiar = OCC_FAMILIARS.find((f) => f.type === state.familiarState?.type)
    if (!familiar) return false
    const maxBond = familiar.maxBond
    const cappedBond = Math.min(newBond, maxBond)
    const newLevel = occGetFamiliarBondLevelInner(cappedBond)
    setState((prev) => ({
      ...prev,
      familiarState: prev.familiarState
        ? {
            ...prev.familiarState,
            bond: cappedBond,
            bondLevel: newLevel,
            feedCount: prev.familiarState.feedCount + 1,
            lastFedTimestamp: Date.now(),
          }
        : null,
    }))
    return true
  }

  function occSummonFamiliar(): boolean {
    if (!state.familiarState) return false
    setState((prev) => ({
      ...prev,
      familiarState: prev.familiarState
        ? { ...prev.familiarState, isSummoned: true }
        : null,
    }))
    return true
  }

  function occDismissFamiliar(): void {
    setState((prev) => ({
      ...prev,
      familiarState: prev.familiarState
        ? { ...prev.familiarState, isSummoned: false }
        : null,
    }))
  }

  function occIsFamiliarSummoned(): boolean {
    return state.familiarState?.isSummoned ?? false
  }

  function occGetFamiliarBonus(): number {
    if (!state.familiarState) return 0
    const familiar = OCC_FAMILIARS.find((f) => f.type === state.familiarState?.type)
    if (!familiar) return 0
    const bondMultiplier = 1 + state.familiarState.bond / 100
    return Math.floor(familiar.baseBonus * bondMultiplier)
  }

  function occGetFamiliarCount(): number {
    return state.unlockedFamiliars.length
  }

  function occGetFamiliarsByCircle(circleId: OccRitualCircle): OccFamiliarData[] {
    return OCC_FAMILIARS.filter(
      (f) => f.preferredCircle === circleId && state.unlockedFamiliars.includes(f.type)
    )
  }

  // ================================================================
  // TAROT CARD FUNCTIONS
  // ================================================================

  function occGetAllTarotCards(): OccTarotCardData[] {
    return [...OCC_TAROT_CARDS]
  }

  function occGetTarotCard(id: OccTarotCard): OccTarotCardData | undefined {
    return OCC_TAROT_CARDS.find((c) => c.id === id)
  }

  function occGetTarotCardByNumber(number: number): OccTarotCardData | undefined {
    return OCC_TAROT_CARDS.find((c) => c.number === number)
  }

  function occPerformTarotReading(): OccTarotReading {
    const reading = occGenerateTarotReading()
    setState((prev) => ({
      ...prev,
      tarotReading: reading,
      tarotReadingsHistory: [reading, ...prev.tarotReadingsHistory].slice(0, 50),
      totalTarotReadings: prev.totalTarotReadings + 1,
      darkPower: prev.darkPower + reading.darkPowerGained,
      totalDarkPowerEarned: prev.totalDarkPowerEarned + reading.darkPowerGained,
    }))
    return reading
  }

  function occGetCurrentReading(): OccTarotReading | null {
    return state.tarotReading
  }

  function occGetReadingHistory(): OccTarotReading[] {
    return [...state.tarotReadingsHistory]
  }

  function occGetTotalReadings(): number {
    return state.totalTarotReadings
  }

  function occGetCardInterpretation(cardId: OccTarotCard, isReversed: boolean): string {
    const card = OCC_TAROT_CARDS.find((c) => c.id === cardId)
    if (!card) return "Unknown card"
    if (isReversed) {
      return `${card.name} (Reversed): ${card.reversedMeaning}. Dark meaning: ${card.darkInterpretation}`
    }
    return `${card.name} (Upright): ${card.uprightMeaning}. Dark meaning: ${card.darkInterpretation}`
  }

  function occGetMostDrawnCard(): OccTarotCard | null {
    if (state.tarotReadingsHistory.length === 0) return null
    const cardCounts: Record<string, number> = {}
    for (const reading of state.tarotReadingsHistory) {
      for (const cardId of reading.cards) {
        cardCounts[cardId] = (cardCounts[cardId] ?? 0) + 1
      }
    }
    let maxCount = 0
    let mostDrawn = ""
    for (const [cardId, count] of Object.entries(cardCounts)) {
      if (count > maxCount) {
        maxCount = count
        mostDrawn = cardId
      }
    }
    return mostDrawn as OccTarotCard
  }

  function occGetReadingOutcomeCounts(): Record<OccDivinationOutcome, number> {
    const counts: Record<OccDivinationOutcome, number> = {
      great_blessing: 0,
      minor_blessing: 0,
      neutral: 0,
      minor_curse: 0,
      great_curse: 0,
    }
    for (const reading of state.tarotReadingsHistory) {
      counts[reading.outcome]++
    }
    return counts
  }

  function occGetCardsByElement(element: string): OccTarotCardData[] {
    return OCC_TAROT_CARDS.filter((c) => c.element === element)
  }

  // ================================================================
  // SPIRIT CONTACT FUNCTIONS
  // ================================================================

  function occGetAllSpirits(): OccSpiritData[] {
    return [...OCC_SPIRITS]
  }

  function occGetSpirit(id: string): OccSpiritData | undefined {
    return OCC_SPIRITS.find((s) => s.id === id)
  }

  function occGetSpiritsByRealm(realm: OccSpiritRealm): OccSpiritData[] {
    return OCC_SPIRITS.filter((s) => s.realm === realm)
  }

  function occGetSpiritContact(id: string): OccSpiritContactState | undefined {
    return state.spiritContacts[id]
  }

  function occCanContactSpirit(id: string): boolean {
    const spirit = OCC_SPIRITS.find((s) => s.id === id)
    if (!spirit) return false
    if (state.ritualMastery < spirit.minMastery) return false
    const contact = state.spiritContacts[id]
    if (contact && contact.isContacting) return false
    return true
  }

  function occBeginSpiritContact(id: string): boolean {
    if (!occCanContactSpirit(id)) return false
    const spirit = OCC_SPIRITS.find((s) => s.id === id)
    if (!spirit) return false
    setState((prev) => ({
      ...prev,
      spiritContacts: {
        ...prev.spiritContacts,
        [id]: {
          ...prev.spiritContacts[id],
          isContacting: true,
          progress: 0,
          targetProgress: spirit.contactDifficulty,
          offeringsGiven: [],
          contactSuccessful: null,
        },
      },
    }))
    return true
  }

  function occAdvanceSpiritContact(id: string, amount: number): void {
    const contact = state.spiritContacts[id]
    if (!contact || !contact.isContacting) return
    const newProgress = Math.min(contact.progress + amount, contact.targetProgress)
    const isComplete = newProgress >= contact.targetProgress
    setState((prev) => ({
      ...prev,
      spiritContacts: {
        ...prev.spiritContacts,
        [id]: {
          ...prev.spiritContacts[id],
          progress: newProgress,
          isContacting: !isComplete,
          contactSuccessful: isComplete,
          lastContactTimestamp: isComplete ? Date.now() : prev.spiritContacts[id].lastContactTimestamp,
          totalContacts: isComplete ? prev.spiritContacts[id].totalContacts + 1 : prev.spiritContacts[id].totalContacts,
        },
      },
      totalSpiritsContacted: isComplete
        ? prev.totalSpiritsContacted + 1
        : prev.totalSpiritsContacted,
    }))
  }

  function occGiveOffering(spiritId: string, offeringId: string): boolean {
    const contact = state.spiritContacts[spiritId]
    if (!contact || !contact.isContacting) return false
    const spirit = OCC_SPIRITS.find((s) => s.id === spiritId)
    if (!spirit) return false
    if (!spirit.offeringRequired.includes(offeringId)) return false
    const hasIngredient = (state.inventory.ingredients[offeringId] ?? 0) > 0
    if (!hasIngredient) return false
    setState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        ingredients: {
          ...prev.inventory.ingredients,
          [offeringId]: (prev.inventory.ingredients[offeringId] ?? 0) - 1,
        },
      },
      spiritContacts: {
        ...prev.spiritContacts,
        [spiritId]: {
          ...prev.spiritContacts[spiritId],
          offeringsGiven: [...prev.spiritContacts[spiritId].offeringsGiven, offeringId],
          progress: prev.spiritContacts[spiritId].progress + 5,
        },
      },
    }))
    return true
  }

  function occGetContactedSpiritsCount(): number {
    return Object.values(state.spiritContacts).filter((c) => c.totalContacts > 0).length
  }

  function occGetSpiritTotalContacts(id: string): number {
    return state.spiritContacts[id]?.totalContacts ?? 0
  }

  // ================================================================
  // KNOWLEDGE TREE FUNCTIONS
  // ================================================================

  function occGetAllKnowledgeNodes(): OccKnowledgeNodeData[] {
    return [...OCC_KNOWLEDGE_NODES]
  }

  function occGetKnowledgeNode(id: string): OccKnowledgeNodeData | undefined {
    return OCC_KNOWLEDGE_NODES.find((n) => n.id === id)
  }

  function occGetUnlockedNodes(): OccKnowledgeNodeData[] {
    return OCC_KNOWLEDGE_NODES.filter((n) => state.knowledgeTree.unlockedNodes.includes(n.id))
  }

  function occIsNodeUnlocked(id: string): boolean {
    return state.knowledgeTree.unlockedNodes.includes(id)
  }

  function occCanUnlockNode(id: string): boolean {
    const node = OCC_KNOWLEDGE_NODES.find((n) => n.id === id)
    if (!node) return false
    if (state.knowledgeTree.unlockedNodes.includes(id)) return false
    if (state.darkPower < node.unlockCost) return false
    for (const prereq of node.prerequisiteNodes) {
      if (!state.knowledgeTree.unlockedNodes.includes(prereq)) return false
    }
    return true
  }

  function occUnlockKnowledgeNode(id: string): boolean {
    if (!occCanUnlockNode(id)) return false
    const node = OCC_KNOWLEDGE_NODES.find((n) => n.id === id)
    if (!node) return false
    setState((prev) => ({
      ...prev,
      darkPower: prev.darkPower - node.unlockCost,
      knowledgeTree: {
        ...prev.knowledgeTree,
        unlockedNodes: [...prev.knowledgeTree.unlockedNodes, id],
        totalInvested: prev.knowledgeTree.totalInvested + node.unlockCost,
        branchProgress: {
          ...prev.knowledgeTree.branchProgress,
          [node.branch]: prev.knowledgeTree.branchProgress[node.branch] + 1,
        },
      },
    }))
    return true
  }

  function occGetNodesByBranch(branch: OccKnowledgeBranch): OccKnowledgeNodeData[] {
    return OCC_KNOWLEDGE_NODES.filter((n) => n.branch === branch)
  }

  function occGetBranchProgress(branch: OccKnowledgeBranch): number {
    const totalInBranch = OCC_KNOWLEDGE_NODES.filter((n) => n.branch === branch).length
    const unlockedInBranch = OCC_KNOWLEDGE_NODES.filter(
      (n) => n.branch === branch && state.knowledgeTree.unlockedNodes.includes(n.id)
    ).length
    return totalInBranch > 0 ? unlockedInBranch / totalInBranch : 0
  }

  function occGetTotalKnowledgeBonus(): { darkPower: number; spell: number; spirit: number; ritual: number } {
    let darkPower = 0
    let spell = 0
    let spirit = 0
    let ritual = 0
    for (const nodeId of state.knowledgeTree.unlockedNodes) {
      const node = OCC_KNOWLEDGE_NODES.find((n) => n.id === nodeId)
      if (node) {
        darkPower += node.darkPowerBonus
        spell += node.spellBonus
        spirit += node.spiritBonus
        ritual += node.ritualBonus
      }
    }
    return { darkPower, spell, spirit, ritual }
  }

  function occGetTotalInvestedKnowledge(): number {
    return state.knowledgeTree.totalInvested
  }

  function occGetAvailableNodes(): OccKnowledgeNodeData[] {
    return OCC_KNOWLEDGE_NODES.filter((n) => occCanUnlockNode(n.id))
  }

  // ================================================================
  // FORBIDDEN TOME FUNCTIONS
  // ================================================================

  function occGetAllTomes(): OccForbiddenTomeData[] {
    return [...OCC_FORBIDDEN_TOMES]
  }

  function occGetTome(id: string): OccForbiddenTomeData | undefined {
    return OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
  }

  function occIsTomeOwned(id: string): boolean {
    return state.forbiddenTomes[id]?.isOwned ?? false
  }

  function occCanAcquireTome(id: string): boolean {
    const tome = OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
    if (!tome) return false
    if (state.forbiddenTomes[id]?.isOwned) return false
    return state.ritualMastery >= tome.unlockMastery
  }

  function occAcquireTome(id: string): boolean {
    if (!occCanAcquireTome(id)) return false
    setState((prev) => ({
      ...prev,
      forbiddenTomes: {
        ...prev.forbiddenTomes,
        [id]: {
          ...prev.forbiddenTomes[id],
          isOwned: true,
        },
      },
    }))
    return true
  }

  function occGetTomeStudyProgress(id: string): number {
    const tomeData = OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
    const tomeState = state.forbiddenTomes[id]
    if (!tomeData || !tomeState) return 0
    return tomeState.pagesStudied / tomeData.totalPages
  }

  function occStudyTome(id: string): boolean {
    const tomeData = OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
    const tomeState = state.forbiddenTomes[id]
    if (!tomeData || !tomeState || !tomeState.isOwned) return false
    if (tomeState.pagesStudied >= tomeData.totalPages) return false
    const corruptionGain = tomeData.corruptionRisk
    const newPagesStudied = tomeState.pagesStudied + 1
    const knowledgeGain = tomeData.darkKnowledgePer
    setState((prev) => ({
      ...prev,
      darkPower: prev.darkPower + knowledgeGain,
      totalDarkPowerEarned: prev.totalDarkPowerEarned + knowledgeGain,
      corruptionLevel: Math.min(prev.corruptionLevel + corruptionGain, 100),
      totalTomesStudied: newPagesStudied === tomeData.totalPages ? prev.totalTomesStudied + 1 : prev.totalTomesStudied,
      forbiddenTomes: {
        ...prev.forbiddenTomes,
        [id]: {
          ...prev.forbiddenTomes[id],
          pagesStudied: newPagesStudied,
          lastStudyTimestamp: Date.now(),
          corruptionLevel: prev.forbiddenTomes[id].corruptionLevel + corruptionGain,
        },
      },
    }))
    return true
  }

  function occGetTomePagesStudied(id: string): number {
    return state.forbiddenTomes[id]?.pagesStudied ?? 0
  }

  function occGetTomeTotalPages(id: string): number {
    const tome = OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
    return tome?.totalPages ?? 0
  }

  function occIsTomeComplete(id: string): boolean {
    const tomeData = OCC_FORBIDDEN_TOMES.find((t) => t.id === id)
    const tomeState = state.forbiddenTomes[id]
    if (!tomeData || !tomeState) return false
    return tomeState.isOwned && tomeState.pagesStudied >= tomeData.totalPages
  }

  function occGetTomeCorruptionLevel(id: string): number {
    return state.forbiddenTomes[id]?.corruptionLevel ?? 0
  }

  function occGetOwnedTomesCount(): number {
    return Object.values(state.forbiddenTomes).filter((t) => t.isOwned).length
  }

  function occGetCompletedTomesCount(): number {
    return Object.values(state.forbiddenTomes).filter((t) => {
      const tomeData = OCC_FORBIDDEN_TOMES.find((td) => td.id === t.id)
      return t.isOwned && tomeData !== undefined && t.pagesStudied >= tomeData.totalPages
    }).length
  }

  function occGetTomesByPower(power: OccTomePower): OccForbiddenTomeData[] {
    return OCC_FORBIDDEN_TOMES.filter((t) => t.power === power)
  }

  // ================================================================
  // RITUAL CAST FUNCTIONS
  // ================================================================

  function occGetRitualCastState(): OccRitualCastState {
    return { ...state.ritualCast }
  }

  function occBeginRitual(circleId: OccRitualCircle, spellId: string | null): boolean {
    if (!state.unlockedCircles.includes(circleId)) return false
    if (spellId && !state.unlockedSpells.includes(spellId)) return false
    const circle = OCC_RITUAL_CIRCLES.find((c) => c.id === circleId)
    if (!circle) return false
    const targetProgress = 100 + circle.riskLevel * 20
    setState((prev) => ({
      ...prev,
      ritualCast: {
        circleId,
        status: "preparing",
        progress: 0,
        targetProgress,
        activeSpell: spellId,
        startTime: Date.now(),
        participants: [],
        darkPowerConsumed: 0,
        darkPowerGenerated: 0,
      },
    }))
    return true
  }

  function occAdvanceRitual(amount: number): void {
    if (!state.ritualCast.status) return
    const newProgress = Math.min(state.ritualCast.progress + amount, state.ritualCast.targetProgress)
    const isComplete = newProgress >= state.ritualCast.targetProgress
    const circle = OCC_RITUAL_CIRCLES.find((c) => c.id === state.ritualCast.circleId)
    const darkPowerGain = circle ? circle.darkPowerBonus + Math.floor(circle.baseXP * 0.3) : 0
    const xpGain = circle ? circle.baseXP : 0
    const currentStatus = state.ritualCast.status
    let newStatus: OccRitualStatus = currentStatus as OccRitualStatus
    if (newProgress >= state.ritualCast.targetProgress * 0.25 && currentStatus === "preparing") {
      newStatus = "chanting"
    }
    if (newProgress >= state.ritualCast.targetProgress * 0.5 && newStatus === "chanting") {
      newStatus = "empowering"
    }
    if (newProgress >= state.ritualCast.targetProgress * 0.75 && newStatus === "empowering") {
      newStatus = "culminating"
    }
    if (isComplete) {
      newStatus = "completed"
    }
    setState((prev) => ({
      ...prev,
      ritualCast: {
        ...prev.ritualCast,
        progress: newProgress,
        status: newStatus,
        darkPowerGenerated: prev.ritualCast.darkPowerGenerated + (isComplete ? darkPowerGain : 0),
      },
      darkPower: prev.darkPower + (isComplete ? darkPowerGain : 0),
      totalDarkPowerEarned: prev.totalDarkPowerEarned + (isComplete ? darkPowerGain : 0),
      totalRitualsPerformed: isComplete ? prev.totalRitualsPerformed + 1 : prev.totalRitualsPerformed,
      ritualMasteryXP: isComplete ? prev.ritualMasteryXP + xpGain : prev.ritualMasteryXP,
    }))
  }

  function occFailRitual(): void {
    if (!state.ritualCast.status) return
    setState((prev) => ({
      ...prev,
      ritualCast: {
        ...prev.ritualCast,
        status: "failed",
      },
      corruptionLevel: Math.min(prev.corruptionLevel + 2, 100),
    }))
  }

  function occEndRitual(): void {
    setState((prev) => ({
      ...prev,
      ritualCast: {
        circleId: null,
        status: null,
        progress: 0,
        targetProgress: 100,
        activeSpell: null,
        startTime: null,
        participants: [],
        darkPowerConsumed: 0,
        darkPowerGenerated: 0,
      },
    }))
  }

  function occGetRitualProgress(): number {
    if (state.ritualCast.targetProgress === 0) return 0
    return state.ritualCast.progress / state.ritualCast.targetProgress
  }

  function occIsRitualActive(): boolean {
    return state.ritualCast.status !== null && state.ritualCast.status !== "completed" && state.ritualCast.status !== "failed"
  }

  // ================================================================
  // DAILY DARK RITUAL FUNCTIONS
  // ================================================================

  function occGetDailyRitualState(): OccDailyRitualState {
    return { ...state.dailyRitual }
  }

  function occGetTodayDailyRitual(): OccDailyRitualData | undefined {
    const phase = occGetDailyRitualPhase()
    return OCC_DAILY_RITUALS.find((r) => r.phase === phase)
  }

  function occCanStartDailyRitual(): boolean {
    if (state.dailyRitual.isActive) return false
    if (state.dailyRitual.completedToday) return false
    const todayDate = occGetTodaysDateString()
    if (state.dailyRitual.lastCompletedDate === todayDate) return false
    const ritual = occGetTodayDailyRitual()
    if (!ritual) return false
    return state.ritualMastery >= ritual.requiredMastery
  }

  function occStartDailyRitual(): boolean {
    if (!occCanStartDailyRitual()) return false
    const ritual = occGetTodayDailyRitual()
    if (!ritual) return false
    setState((prev) => ({
      ...prev,
      dailyRitual: {
        ...prev.dailyRitual,
        isActive: true,
        phase: ritual.phase,
        progress: 0,
        targetProgress: ritual.duration,
        startTime: Date.now(),
        completedToday: false,
      },
    }))
    return true
  }

  function occAdvanceDailyRitual(amount: number): void {
    if (!state.dailyRitual.isActive) return
    const ritual = OCC_DAILY_RITUALS.find((r) => r.phase === state.dailyRitual.phase)
    if (!ritual) return
    const newProgress = Math.min(state.dailyRitual.progress + amount, state.dailyRitual.targetProgress)
    const isComplete = newProgress >= state.dailyRitual.targetProgress
    const todayDate = occGetTodaysDateString()
    const wasYesterday = state.dailyRitual.lastCompletedDate !== todayDate
    const newStreak = isComplete
      ? wasYesterday
        ? state.dailyRitual.streakDays + 1
        : state.dailyRitual.lastCompletedDate === todayDate
          ? state.dailyRitual.streakDays
          : 1
      : state.dailyRitual.streakDays
    const newBestStreak = Math.max(newStreak, state.dailyRitual.bestStreak)
    setState((prev) => ({
      ...prev,
      dailyRitual: {
        ...prev.dailyRitual,
        progress: newProgress,
        isActive: !isComplete,
        completedToday: isComplete,
        lastCompletedDate: isComplete ? todayDate : prev.dailyRitual.lastCompletedDate,
        totalCompleted: isComplete ? prev.dailyRitual.totalCompleted + 1 : prev.dailyRitual.totalCompleted,
        streakDays: newStreak,
        bestStreak: newBestStreak,
      },
      darkPower: prev.darkPower + (isComplete ? ritual.darkPowerReward : 0),
      totalDarkPowerEarned: prev.totalDarkPowerEarned + (isComplete ? ritual.darkPowerReward : 0),
      ritualMasteryXP: prev.ritualMasteryXP + (isComplete ? ritual.xpReward : 0),
      totalDailyRitualsCompleted: isComplete
        ? prev.totalDailyRitualsCompleted + 1
        : prev.totalDailyRitualsCompleted,
    }))
    if (isComplete && ritual.ingredientReward) {
      const ingredientId = ritual.ingredientReward
      setState((prev) => ({
        ...prev,
        inventory: {
          ...prev.inventory,
          ingredients: {
            ...prev.inventory.ingredients,
            [ingredientId]: (prev.inventory.ingredients[ingredientId] ?? 0) + 1,
          },
        },
      }))
    }
  }

  function occGetDailyRitualProgress(): number {
    if (state.dailyRitual.targetProgress === 0) return 0
    return state.dailyRitual.progress / state.dailyRitual.targetProgress
  }

  function occGetDailyStreak(): number {
    return state.dailyRitual.streakDays
  }

  function occGetDailyBestStreak(): number {
    return state.dailyRitual.bestStreak
  }

  function occGetTotalDailyCompleted(): number {
    return state.dailyRitual.totalCompleted
  }

  function occIsDailyCompleted(): boolean {
    return state.dailyRitual.completedToday
  }

  // ================================================================
  // ACHIEVEMENT FUNCTIONS
  // ================================================================

  function occGetAllAchievements(): OccAchievementData[] {
    return [...OCC_ACHIEVEMENTS]
  }

  function occGetAchievement(id: string): OccAchievementData | undefined {
    return OCC_ACHIEVEMENTS.find((a) => a.id === id)
  }

  function occGetUnlockedAchievements(): OccAchievementData[] {
    return OCC_ACHIEVEMENTS.filter((a) => state.achievements.includes(a.id))
  }

  function occIsAchievementUnlocked(id: string): boolean {
    return state.achievements.includes(id)
  }

  function occCheckAndUnlockAchievements(): string[] {
    const newAchievements = occCheckAchievements(state)
    if (newAchievements.length > 0) {
      let totalXpReward = 0
      let totalDarkPowerReward = 0
      for (const achId of newAchievements) {
        const ach = OCC_ACHIEVEMENTS.find((a) => a.id === achId)
        if (ach) {
          totalXpReward += ach.xpReward
          totalDarkPowerReward += ach.darkPowerReward
        }
      }
      setState((prev) => ({
        ...prev,
        achievements: [...prev.achievements, ...newAchievements],
        ritualMasteryXP: prev.ritualMasteryXP + totalXpReward,
        darkPower: prev.darkPower + totalDarkPowerReward,
        totalDarkPowerEarned: prev.totalDarkPowerEarned + totalDarkPowerReward,
        totalAchievementsUnlocked: prev.achievements.length + newAchievements.length,
      }))
    }
    return newAchievements
  }

  function occGetAchievementProgress(id: string): number {
    const ach = OCC_ACHIEVEMENTS.find((a) => a.id === id)
    if (!ach) return 0
    let currentValue = 0
    switch (ach.requirement) {
      case "totalRitualsPerformed":
        currentValue = state.totalRitualsPerformed
        break
      case "totalSpellsCast":
        currentValue = state.totalSpellsCast
        break
      case "totalSpiritsContacted":
        currentValue = state.totalSpiritsContacted
        break
      case "totalTarotReadings":
        currentValue = state.totalTarotReadings
        break
      case "totalTomesStudied":
        currentValue = Object.values(state.forbiddenTomes).filter((t) => t.isOwned).length
        break
      case "knowledgeNodes":
        currentValue = state.knowledgeTree.unlockedNodes.length
        break
      case "dailyStreak":
        currentValue = state.dailyRitual.bestStreak
        break
      default:
        currentValue = 0
    }
    return Math.min(currentValue / ach.targetValue, 1)
  }

  function occGetAchievementsByTier(tier: OccAchievementTier): OccAchievementData[] {
    return OCC_ACHIEVEMENTS.filter((a) => a.tier === tier)
  }

  function occGetUnlockedAchievementCount(): number {
    return state.achievements.length
  }

  function occGetTotalAchievementCount(): number {
    return OCC_ACHIEVEMENTS.length
  }

  // ================================================================
  // INVENTORY & RESOURCE FUNCTIONS
  // ================================================================

  function occGetInventory(): OccInventoryState {
    return { ...state.inventory }
  }

  function occGetDarkPowerCrystals(): number {
    return state.inventory.darkPowerCrystals
  }

  function occGetSoulFragments(): number {
    return state.inventory.soulFragments
  }

  function occGetVoidEssence(): number {
    return state.inventory.voidEssence
  }

  function occGetBloodVials(): number {
    return state.inventory.bloodVials
  }

  function occGetBoneDust(): number {
    return state.inventory.boneDust
  }

  function occGetAshResidue(): number {
    return state.inventory.ashResidue
  }

  function occAddResource(resource: string, amount: number): void {
    setState((prev) => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        [resource]: ((prev.inventory as unknown) as Record<string, number>)[resource] + amount,
      },
    }))
  }

  // ================================================================
  // STATISTICS & SUMMARY FUNCTIONS
  // ================================================================

  function occGetTotalRitualsPerformed(): number {
    return state.totalRitualsPerformed
  }

  function occGetTotalSpellsCast(): number {
    return state.totalSpellsCast
  }

  function occGetTotalSpiritsContacted(): number {
    return state.totalSpiritsContacted
  }

  function occGetTotalTarotReadings(): number {
    return state.totalTarotReadings
  }

  function occGetTotalAchievementsUnlocked(): number {
    return state.totalAchievementsUnlocked
  }

  function occGetTotalDailyRitualsCompleted(): number {
    return state.totalDailyRitualsCompleted
  }

  function occGetOverallPowerScore(): number {
    let score = 0
    score += state.darkPower
    score += state.ritualMastery * 10
    score += state.unlockedCircles.length * 25
    score += state.unlockedSpells.length * 15
    score += state.unlockedFamiliars.length * 20
    score += state.knowledgeTree.unlockedNodes.length * 30
    score += Object.values(state.forbiddenTomes).filter((t) => t.isOwned).length * 50
    score += state.totalTarotReadings * 2
    score += state.totalSpiritsContacted * 8
    score += state.achievements.length * 35
    score += state.dailyRitual.bestStreak * 5
    if (state.familiarState) {
      score += state.familiarState.bond
    }
    return score
  }

  function occGetLevelTitle(): string {
    const mastery = state.ritualMastery
    if (mastery >= 45) return "Abyssal Sovereign"
    if (mastery >= 40) return "Void Archon"
    if (mastery >= 35) return "Eclipse Master"
    if (mastery >= 30) return "Grand Necromancer"
    if (mastery >= 25) return "Dark Warlock"
    if (mastery >= 20) return "Shadow Adept"
    if (mastery >= 15) return "Curse Weaver"
    if (mastery >= 10) return "Blood Mage"
    if (mastery >= 5) return "Dusk Initiate"
    return "Unbound Acolyte"
  }

  function occGetState(): OccOccultCircleState {
    return { ...state }
  }

  function occResetState(): void {
    setState(occGetDefaultState())
  }

  // ================================================================
  // DAILY RESET FUNCTIONS
  // ================================================================

  function occCheckDailyReset(): boolean {
    const today = Math.floor(Date.now() / 86400000)
    if (today !== state.currentDay) {
      setState((prev) => ({
        ...prev,
        currentDay: today,
        dailyRitual: {
          ...prev.dailyRitual,
          isActive: false,
          phase: null,
          progress: 0,
          completedToday: false,
        },
        activeSpells: [],
        spellCooldowns: {},
      }))
      return true
    }
    return false
  }

  // ================================================================
  // UTILITY FUNCTIONS
  // ================================================================

  function occGetSpellSchools(): OccSpellSchool[] {
    return ["necromancy", "demonology", "hex_weaving", "soul_binding", "void_channeling", "blood_magic", "curse_craft", "shadow_mastery"]
  }

  function occGetSpiritRealms(): OccSpiritRealm[] {
    return ["astral_plane", "ethereal_void", "shadow_realm", "dreamscape", "netherworld", "limbo"]
  }

  function occGetKnowledgeBranches(): OccKnowledgeBranch[] {
    return ["forbidden_lore", "demonology", "necromancy", "ritual_mastery", "astral_projection"]
  }

  function occGetTomePowers(): OccTomePower[] {
    return ["minor", "moderate", "major", "transcendent"]
  }

  function occGetAchievementTiers(): OccAchievementTier[] {
    return ["bronze", "silver", "gold", "obsidian"]
  }

  function occGetPotionRarities(): OccPotionRarity[] {
    return ["common", "uncommon", "rare", "epic", "legendary"]
  }

  function occGetFamiliarTypes(): OccFamiliarType[] {
    return ["raven", "cat", "owl", "bat", "toad", "snake", "spider", "wolf"]
  }

  function occGetAllTarotCardIds(): OccTarotCard[] {
    return OCC_TAROT_CARDS.map((c) => c.id)
  }

  function occGetRitualCircleIds(): OccRitualCircle[] {
    return OCC_RITUAL_CIRCLES.map((c) => c.id)
  }

  function occGetDarkSpellIds(): string[] {
    return OCC_DARK_SPELLS.map((s) => s.id)
  }

  function occGetPotionIngredientIds(): string[] {
    return OCC_POTION_INGREDIENTS.map((i) => i.id)
  }

  function occGetSpiritIds(): string[] {
    return OCC_SPIRITS.map((s) => s.id)
  }

  function occGetKnowledgeNodeIds(): string[] {
    return OCC_KNOWLEDGE_NODES.map((n) => n.id)
  }

  function occGetForbiddenTomeIds(): string[] {
    return OCC_FORBIDDEN_TOMES.map((t) => t.id)
  }

  function occGetAchievementIds(): string[] {
    return OCC_ACHIEVEMENTS.map((a) => a.id)
  }

  function occGetDailyRitualPhases(): OccDailyRitualPhase[] {
    return ["dawn_invocation", "midnight_summoning", "eclipse_communion", "void_meditation"]
  }

  // ================================================================
  // RETURN
  // ================================================================

  return {
    state,
    // Player & Mastery
    occGetPlayerName,
    occSetPlayerName,
    occGetRitualMastery,
    occGetRitualMasteryXP,
    occGetXpForNextLevel,
    occGetMasteryProgress,
    occAddMasteryXP,
    occGetDarkPower,
    occSpendDarkPower,
    occGetTotalDarkPowerEarned,
    occGetCorruptionLevel,
    // Ritual Circles
    occGetAllCircles,
    occGetCircle,
    occGetUnlockedCircles,
    occIsCircleUnlocked,
    occCanUnlockCircle,
    occUnlockCircle,
    occGetActiveCircle,
    occSetActiveCircle,
    occGetCircleCount,
    occGetCircleBonus,
    // Dark Spells
    occGetAllSpells,
    occGetSpell,
    occGetUnlockedSpells,
    occIsSpellUnlocked,
    occCanUnlockSpell,
    occUnlockSpell,
    occGetActiveSpells,
    occActivateSpell,
    occGetSpellCooldown,
    occGetSpellCount,
    occGetSpellsBySchool,
    occGetSpellsByCircle,
    // Potion Ingredients
    occGetAllIngredients,
    occGetIngredient,
    occGetIngredientCount,
    occAddIngredient,
    occRemoveIngredient,
    occBuyIngredient,
    occGatherIngredient,
    occGetIngredientsByRarity,
    // Familiars
    occGetAllFamiliars,
    occGetFamiliar,
    occGetUnlockedFamiliars,
    occIsFamiliarUnlocked,
    occCanUnlockFamiliar,
    occUnlockFamiliar,
    occGetActiveFamiliar,
    occGetFamiliarBond,
    occGetFamiliarBondLevel,
    occFeedFamiliar,
    occSummonFamiliar,
    occDismissFamiliar,
    occIsFamiliarSummoned,
    occGetFamiliarBonus,
    occGetFamiliarCount,
    occGetFamiliarsByCircle,
    // Tarot Cards
    occGetAllTarotCards,
    occGetTarotCard,
    occGetTarotCardByNumber,
    occPerformTarotReading,
    occGetCurrentReading,
    occGetReadingHistory,
    occGetTotalReadings,
    occGetCardInterpretation,
    occGetMostDrawnCard,
    occGetReadingOutcomeCounts,
    occGetCardsByElement,
    // Spirit Contact
    occGetAllSpirits,
    occGetSpirit,
    occGetSpiritsByRealm,
    occGetSpiritContact,
    occCanContactSpirit,
    occBeginSpiritContact,
    occAdvanceSpiritContact,
    occGiveOffering,
    occGetContactedSpiritsCount,
    occGetSpiritTotalContacts,
    // Knowledge Tree
    occGetAllKnowledgeNodes,
    occGetKnowledgeNode,
    occGetUnlockedNodes,
    occIsNodeUnlocked,
    occCanUnlockNode,
    occUnlockKnowledgeNode,
    occGetNodesByBranch,
    occGetBranchProgress,
    occGetTotalKnowledgeBonus,
    occGetTotalInvestedKnowledge,
    occGetAvailableNodes,
    // Forbidden Tomes
    occGetAllTomes,
    occGetTome,
    occIsTomeOwned,
    occCanAcquireTome,
    occAcquireTome,
    occGetTomeStudyProgress,
    occStudyTome,
    occGetTomePagesStudied,
    occGetTomeTotalPages,
    occIsTomeComplete,
    occGetTomeCorruptionLevel,
    occGetOwnedTomesCount,
    occGetCompletedTomesCount,
    occGetTomesByPower,
    // Ritual Casting
    occGetRitualCastState,
    occBeginRitual,
    occAdvanceRitual,
    occFailRitual,
    occEndRitual,
    occGetRitualProgress,
    occIsRitualActive,
    // Daily Dark Rituals
    occGetDailyRitualState,
    occGetTodayDailyRitual,
    occCanStartDailyRitual,
    occStartDailyRitual,
    occAdvanceDailyRitual,
    occGetDailyRitualProgress,
    occGetDailyStreak,
    occGetDailyBestStreak,
    occGetTotalDailyCompleted,
    occIsDailyCompleted,
    // Achievements
    occGetAllAchievements,
    occGetAchievement,
    occGetUnlockedAchievements,
    occIsAchievementUnlocked,
    occCheckAndUnlockAchievements,
    occGetAchievementProgress,
    occGetAchievementsByTier,
    occGetUnlockedAchievementCount,
    occGetTotalAchievementCount,
    // Inventory
    occGetInventory,
    occGetDarkPowerCrystals,
    occGetSoulFragments,
    occGetVoidEssence,
    occGetBloodVials,
    occGetBoneDust,
    occGetAshResidue,
    occAddResource,
    // Statistics
    occGetTotalRitualsPerformed,
    occGetTotalSpellsCast,
    occGetTotalSpiritsContacted,
    occGetTotalTarotReadings,
    occGetTotalAchievementsUnlocked,
    occGetTotalDailyRitualsCompleted,
    occGetOverallPowerScore,
    occGetLevelTitle,
    // State
    occGetState,
    occResetState,
    occCheckDailyReset,
    // Utility
    occGetSpellSchools,
    occGetSpiritRealms,
    occGetKnowledgeBranches,
    occGetTomePowers,
    occGetAchievementTiers,
    occGetPotionRarities,
    occGetFamiliarTypes,
    occGetAllTarotCardIds,
    occGetRitualCircleIds,
    occGetDarkSpellIds,
    occGetPotionIngredientIds,
    occGetSpiritIds,
    occGetKnowledgeNodeIds,
    occGetForbiddenTomeIds,
    occGetAchievementIds,
    occGetDailyRitualPhases,
  }
}
