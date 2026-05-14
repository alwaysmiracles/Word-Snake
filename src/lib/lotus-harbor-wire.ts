import { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// =============================================================================
// LOTUS HARBOR — 莲花港湾 — Eastern Harbor Town Wire Module
// A serene Eastern harbor town built on floating lotus pads, where merchants
// trade silk and spices, and water spirits guard ancient treasures beneath
// the jade waters.
// =============================================================================

// =============================================================================
// SECTION 1: TYPE DEFINITIONS
// =============================================================================

export type LoRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type LoSpecies =
  | 'lotus_dragon'
  | 'jade_koi'
  | 'silk_merchant'
  | 'water_spirit'
  | 'crane_guardian'
  | 'pearl_diver'
  | 'storm_heron';

export type LoAbilityCategory =
  | 'combat'
  | 'trade'
  | 'exploration'
  | 'defense'
  | 'crafting'
  | 'navigation';

export type LoStructureBonusType =
  | 'trade_bonus'
  | 'defense_bonus'
  | 'exploration_bonus'
  | 'crafting_bonus'
  | 'navigation_bonus'
  | 'coin_bonus'
  | 'xp_bonus'
  | 'recruit_bonus';

export type LoMaterialCategory =
  | 'gem'
  | 'fabric'
  | 'herb'
  | 'mineral'
  | 'essence'
  | 'spice';

export type LoChamberId =
  | 'jade_dock'
  | 'lotus_market'
  | 'pearl_bay'
  | 'silk_wharf'
  | 'jade_bridge'
  | 'spirit_temple'
  | 'spice_warehouse'
  | 'lotus_throne';

export type LoEventId =
  | 'lotus_bloom_festival'
  | 'jade_tide_rising'
  | 'silk_caravan_arrival'
  | 'water_spirit_blessing'
  | 'storm_heron_migration'
  | 'pearl_diving_season'
  | 'spice_trade_fair'
  | 'ancient_treasure_rise';

// ─── Definition Interfaces ────────────────────────────────────────────────────

export interface LoRarityDef {
  readonly key: LoRarity;
  readonly label: string;
  readonly color: string;
  readonly xpMultiplier: number;
  readonly coinMultiplier: number;
  readonly recruitWeight: number;
}

export interface LoSpeciesDef {
  readonly id: LoSpecies;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly color: string;
  readonly basePower: number;
  readonly baseWisdom: number;
  readonly tradeAffinity: number;
  readonly explorationAffinity: number;
}

export interface LoCreatureDef {
  readonly id: string;
  readonly name: string;
  readonly species: LoSpecies;
  readonly rarity: LoRarity;
  readonly power: number;
  readonly wisdom: number;
  readonly tradeSkill: number;
  readonly recruitCost: number;
  readonly upkeepCost: number;
  readonly description: string;
  readonly emoji: string;
  readonly requiredLevel: number;
  readonly specialAbility: string;
}

export interface LoChamberDef {
  readonly id: LoChamberId;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly unlockLevel: number;
  readonly unlockCost: number;
  readonly baseXpPerVisit: number;
  readonly baseCoinsPerVisit: number;
  readonly materialChance: number;
  readonly dangerLevel: number;
}

export interface LoMaterialDef {
  readonly id: string;
  readonly name: string;
  readonly category: LoMaterialCategory;
  readonly rarity: LoRarity;
  readonly baseValue: number;
  readonly description: string;
  readonly emoji: string;
}

export interface LoStructureDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly maxLevel: number;
  readonly baseCost: number;
  readonly costPerLevel: number;
  readonly bonusType: LoStructureBonusType;
  readonly bonusValue: number;
  readonly requiredLevel: number;
}

export interface LoAbilityDef {
  readonly id: string;
  readonly name: string;
  readonly category: LoAbilityCategory;
  readonly description: string;
  readonly emoji: string;
  readonly cooldown: number;
  readonly power: number;
  readonly xpCost: number;
  readonly coinCost: number;
  readonly unlockCost: number;
  readonly requiredLevel: number;
}

export interface LoAchievementDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly conditionKey: string;
  readonly targetValue: number;
  readonly rewardXP: number;
  readonly rewardCoins: number;
  readonly emoji: string;
}

export interface LoTitleDef {
  readonly id: string;
  readonly name: string;
  readonly requiredLevel: number;
  readonly description: string;
  readonly emoji: string;
  readonly color: string;
  readonly coinMultiplier: number;
  readonly xpMultiplier: number;
}

export interface LoArtifactDef {
  readonly id: string;
  readonly name: string;
  readonly rarity: LoRarity;
  readonly description: string;
  readonly emoji: string;
  readonly power: number;
  readonly cost: number;
  readonly lore: string;
  readonly bonusType: string;
}

export interface LoEventDef {
  readonly id: LoEventId;
  readonly name: string;
  readonly description: string;
  readonly emoji: string;
  readonly durationHours: number;
  readonly xpMultiplier: number;
  readonly coinMultiplier: number;
  readonly recruitBonus: number;
  readonly explorationBonus: number;
  readonly color: string;
}

// ─── Runtime State Types ─────────────────────────────────────────────────────

export interface LoSailorInstance {
  readonly instanceId: string;
  readonly creatureId: string;
  readonly recruitedAt: number;
  readonly level: number;
  readonly xp: number;
  readonly nickname: string;
}

export interface LoInventoryItem {
  readonly materialId: string;
  readonly quantity: number;
}

export interface LoStructureState {
  readonly structureId: string;
  readonly level: number;
  readonly builtAt: number;
  readonly lastCollected: number;
}

export interface LoArtifactState {
  readonly artifactId: string;
  readonly activated: boolean;
  readonly activatedAt: number | null;
  readonly charges: number;
}

export interface LoAbilityState {
  readonly abilityId: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly lastUsedAt: number;
  readonly totalUses: number;
}

export interface LoAchievementState {
  readonly id: string;
  readonly unlocked: boolean;
  readonly unlockedAt: number | null;
  readonly currentValue: number;
}

export interface LoChamberState {
  readonly chamberId: string;
  readonly discovered: boolean;
  readonly visits: number;
  readonly totalXpGained: number;
  readonly totalCoinsGained: number;
  readonly lastVisitAt: number | null;
}

export interface LoEventLogEntry {
  readonly eventId: string;
  readonly startedAt: number;
  readonly endedAt: number | null;
  readonly xpGained: number;
  readonly coinsGained: number;
}

export interface LoHarborStats {
  readonly totalSailorsRecruited: number;
  readonly totalDistrictsExplored: number;
  readonly totalStructuresBuilt: number;
  readonly totalArtifactsActivated: number;
  readonly totalAbilitiesUsed: number;
  readonly totalEventsCompleted: number;
  readonly totalMaterialsCollected: number;
  readonly totalCoinsEarned: number;
  readonly totalXpEarned: number;
  readonly totalRecruitCosts: number;
  readonly daysActive: number;
  readonly highestChamberDanger: number;
}

export interface LoHarborState {
  readonly loLevel: number;
  readonly loXp: number;
  readonly loMaxXp: number;
  readonly loCurrentTitle: string;
  readonly loTotalXp: number;
  readonly loTotalCoins: number;
  readonly loSailors: LoSailorInstance[];
  readonly loInventory: LoInventoryItem[];
  readonly loStructures: Record<string, LoStructureState>;
  readonly loArtifacts: Record<string, LoArtifactState>;
  readonly loAbilities: Record<string, LoAbilityState>;
  readonly loAchievements: Record<string, LoAchievementState>;
  readonly loChambers: Record<string, LoChamberState>;
  readonly loEventLog: LoEventLogEntry[];
  readonly loActiveEvent: LoEventId | null;
  readonly loActiveEventEndsAt: number | null;
  readonly loStats: LoHarborStats;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// =============================================================================
// SECTION 2: LO_ CONSTANTS
// =============================================================================

export const LO_SAVE_KEY = 'lotus-harbor-save';
export const LO_MAX_LEVEL = 50;
export const LO_XP_BASE = 100;
export const LO_XP_SCALE = 1.5;
export const LO_STARTING_COINS = 150;
export const LO_MAX_SAILORS = 30;
export const LO_MAX_INVENTORY_STACK = 999;
export const LO_MAX_STRUCTURE_LEVEL = 10;
export const LO_DAILY_RESET_MS = 86_400_000;

// ─── Color Palette ───────────────────────────────────────────────────────────

export const LO_LOTUS_PINK = '#FFB7C5';
export const LO_JADE_GREEN = '#00A86B';
export const LO_PEARL_WHITE = '#FDEEF4';
export const LO_SILK_GOLD = '#CFB53B';
export const LO_WATER_BLUE = '#4682B4';
export const LO_BAMBOO_GREEN = '#8FBC8F';
export const LO_SUNSET_RED = '#E34234';
export const LO_DEEP_JADE = '#2E8B57';
export const LO_MIST_PURPLE = '#9370DB';
export const LO_SEAFOAM = '#AFEEEE';
export const LO_CORAL_PEACH = '#FFDAB9';
export const LO_DARK_TEAL = '#006D6F';
export const LO_IVORY = '#FFFFF0';
export const LO_INK_BLACK = '#1A1A2E';

export const LO_THEME_COLORS = {
  lotusPink: LO_LOTUS_PINK,
  jadeGreen: LO_JADE_GREEN,
  pearlWhite: LO_PEARL_WHITE,
  silkGold: LO_SILK_GOLD,
  waterBlue: LO_WATER_BLUE,
  bambooGreen: LO_BAMBOO_GREEN,
  sunsetRed: LO_SUNSET_RED,
  deepJade: LO_DEEP_JADE,
  mistPurple: LO_MIST_PURPLE,
  seafoam: LO_SEAFOAM,
  coralPeach: LO_CORAL_PEACH,
  darkTeal: LO_DARK_TEAL,
  ivory: LO_IVORY,
  inkBlack: LO_INK_BLACK,
} as const;

export const LO_RARITY_COLORS: Record<LoRarity, string> = {
  common: '#9CA3AF',
  uncommon: '#34D399',
  rare: '#60A5FA',
  epic: '#A78BFA',
  legendary: LO_SILK_GOLD,
};

export const LO_SPECIES_COLORS: Record<LoSpecies, string> = {
  lotus_dragon: LO_SUNSET_RED,
  jade_koi: LO_JADE_GREEN,
  silk_merchant: LO_SILK_GOLD,
  water_spirit: LO_WATER_BLUE,
  crane_guardian: LO_BAMBOO_GREEN,
  pearl_diver: LO_PEARL_WHITE,
  storm_heron: LO_MIST_PURPLE,
};

// ─── Rarity Definitions ──────────────────────────────────────────────────────

export const LO_RARITIES: readonly LoRarityDef[] = [
  { key: 'common', label: 'Common', color: '#9CA3AF', xpMultiplier: 1.0, coinMultiplier: 1.0, recruitWeight: 40 },
  { key: 'uncommon', label: 'Uncommon', color: '#34D399', xpMultiplier: 1.5, coinMultiplier: 1.5, recruitWeight: 28 },
  { key: 'rare', label: 'Rare', color: '#60A5FA', xpMultiplier: 2.5, coinMultiplier: 2.5, recruitWeight: 18 },
  { key: 'epic', label: 'Epic', color: '#A78BFA', xpMultiplier: 4.0, coinMultiplier: 4.0, recruitWeight: 10 },
  { key: 'legendary', label: 'Legendary', color: LO_SILK_GOLD, xpMultiplier: 7.0, coinMultiplier: 7.0, recruitWeight: 4 },
] as const;

// ─── Species Definitions (7 species) ────────────────────────────────────────

export const LO_SPECIES: readonly LoSpeciesDef[] = [
  { id: 'lotus_dragon', name: 'Lotus Dragon', description: 'Ancient water dragons that sleep beneath blooming lotus flowers, awakening to guard the harbor during storms.', emoji: '🐲', color: LO_SUNSET_RED, basePower: 15, baseWisdom: 12, tradeAffinity: 0.6, explorationAffinity: 0.8 },
  { id: 'jade_koi', name: 'Jade Koi', description: 'Iridescent koi fish blessed by water spirits, said to bring fortune to any vessel they follow.', emoji: '🐟', color: LO_JADE_GREEN, basePower: 8, baseWisdom: 18, tradeAffinity: 1.0, explorationAffinity: 0.5 },
  { id: 'silk_merchant', name: 'Silk Merchant', description: 'Wandering traders who navigate the harbor\'s waterways on rafts laden with shimmering silk.', emoji: '🧑‍💼', color: LO_SILK_GOLD, basePower: 6, baseWisdom: 14, tradeAffinity: 1.5, explorationAffinity: 0.4 },
  { id: 'water_spirit', name: 'Water Spirit', description: 'Ethereal beings that dwell in the jade waters, granting blessings to those who respect the harbor.', emoji: '👻', color: LO_WATER_BLUE, basePower: 12, baseWisdom: 20, tradeAffinity: 0.5, explorationAffinity: 1.2 },
  { id: 'crane_guardian', name: 'Crane Guardian', description: 'Noble cranes that patrol the harbor skyline, their vigilance unmatched among all harbor creatures.', emoji: '🦩', color: LO_BAMBOO_GREEN, basePower: 18, baseWisdom: 10, tradeAffinity: 0.4, explorationAffinity: 1.0 },
  { id: 'pearl_diver', name: 'Pearl Diver', description: 'Expert divers who plunge into the harbor depths to retrieve luminous pearls and sunken treasures.', emoji: '🤿', color: LO_PEARL_WHITE, basePower: 10, baseWisdom: 16, tradeAffinity: 1.2, explorationAffinity: 0.9 },
  { id: 'storm_heron', name: 'Storm Heron', description: 'Majestic herons that ride the monsoon winds, guiding ships safely through the fiercest gales.', emoji: '🪽', color: LO_MIST_PURPLE, basePower: 14, baseWisdom: 14, tradeAffinity: 0.7, explorationAffinity: 1.1 },
] as const;

// ─── Creatures (35, 5 per species) ──────────────────────────────────────────

export const LO_CREATURES: readonly LoCreatureDef[] = [
  // ── Lotus Dragons (5) ──
  { id: 'sproutling_dragon', name: 'Sproutling Dragon', species: 'lotus_dragon', rarity: 'common', power: 12, wisdom: 10, tradeSkill: 5, recruitCost: 30, upkeepCost: 3, description: 'A tiny dragon hatchling that has just emerged from a lotus bud, still covered in petals.', emoji: '🌱', requiredLevel: 1, specialAbility: 'Petal Shield — blocks minor attacks with lotus petals' },
  { id: 'pond_guardian_dragon', name: 'Pond Guardian Dragon', species: 'lotus_dragon', rarity: 'uncommon', power: 22, wisdom: 18, tradeSkill: 10, recruitCost: 120, upkeepCost: 12, description: 'A young dragon that has claimed a small pond as its territory, fiercely protective of nearby lotuses.', emoji: '🌊', requiredLevel: 5, specialAbility: 'Tidal Surge — pushes threats away with a wave of water' },
  { id: 'jade_scale_dragon', name: 'Jade Scale Dragon', species: 'lotus_dragon', rarity: 'rare', power: 38, wisdom: 28, tradeSkill: 18, recruitCost: 450, upkeepCost: 40, description: 'A dragon whose scales gleam like polished jade, said to be the harbinger of good fortune.', emoji: '💎', requiredLevel: 12, specialAbility: 'Jade Armor — absorbs damage, converts it to healing' },
  { id: 'lotus_throne_dragon', name: 'Lotus Throne Dragon', species: 'lotus_dragon', rarity: 'epic', power: 60, wisdom: 42, tradeSkill: 28, recruitCost: 1500, upkeepCost: 120, description: 'An ancient dragon that sleeps upon a throne of living lotus, awakening only during eclipses.', emoji: '👑', requiredLevel: 25, specialAbility: 'Throne Awakening — unleashes devastating area attack' },
  { id: 'primordial_lotus_wyrm', name: 'Primordial Lotus Wyrm', species: 'lotus_dragon', rarity: 'legendary', power: 95, wisdom: 70, tradeSkill: 45, recruitCost: 6000, upkeepCost: 400, description: 'The first dragon born from the original lotus seed at the dawn of the harbor, a being of immense ancient power.', emoji: '🐉', requiredLevel: 40, specialAbility: 'Genesis Bloom — reshapes the battlefield with a field of giant lotuses' },
  // ── Jade Koi (5) ──
  { id: 'copper_koi', name: 'Copper Koi', species: 'jade_koi', rarity: 'common', power: 6, wisdom: 14, tradeSkill: 12, recruitCost: 20, upkeepCost: 2, description: 'A humble copper-colored koi that brings a small measure of luck to its owner.', emoji: '🐟', requiredLevel: 1, specialAbility: 'Lucky Ripple — slightly improves trade outcomes' },
  { id: 'silver_fin_koi', name: 'Silver Fin Koi', species: 'jade_koi', rarity: 'uncommon', power: 10, wisdom: 22, tradeSkill: 20, recruitCost: 100, upkeepCost: 10, description: 'A koi with shimmering silver fins that illuminate murky harbor waters.', emoji: '✨', requiredLevel: 4, specialAbility: 'Silver Light — reveals hidden materials in the water' },
  { id: 'golden_scale_koi', name: 'Golden Scale Koi', species: 'jade_koi', rarity: 'rare', power: 16, wisdom: 32, tradeSkill: 35, recruitCost: 400, upkeepCost: 35, description: 'A magnificent koi with pure gold scales, believed to be an incarnation of wealth spirits.', emoji: '🪙', requiredLevel: 10, specialAbility: 'Gold Rush — doubles coin rewards for a short time' },
  { id: 'jade_emperor_koi', name: 'Jade Emperor Koi', species: 'jade_koi', rarity: 'epic', power: 24, wisdom: 48, tradeSkill: 55, recruitCost: 1400, upkeepCost: 110, description: 'A koi so radiant it is said to have been blessed by the Jade Emperor himself.', emoji: '👑', requiredLevel: 22, specialAbility: 'Imperial Fortune — guarantees a rare trade encounter' },
  { id: 'celestial_pearl_koi', name: 'Celestial Pearl Koi', species: 'jade_koi', rarity: 'legendary', power: 35, wisdom: 75, tradeSkill: 90, recruitCost: 5500, upkeepCost: 380, description: 'The mythical koi that leapt the Dragon Gate of the heavens, carrying a celestial pearl in its mouth.', emoji: '🌟', requiredLevel: 38, specialAbility: 'Heavenly Gate — opens access to exclusive trade routes' },
  // ── Silk Merchants (5) ──
  { id: 'apprentice_weaver', name: 'Apprentice Weaver', species: 'silk_merchant', rarity: 'common', power: 5, wisdom: 12, tradeSkill: 18, recruitCost: 25, upkeepCost: 3, description: 'A young apprentice learning the ancient art of lotus silk weaving from harbor masters.', emoji: '🧵', requiredLevel: 1, specialAbility: 'Quick Stitch — slightly reduces repair costs' },
  { id: 'bargain_hawker', name: 'Bargain Hawker', species: 'silk_merchant', rarity: 'uncommon', power: 8, wisdom: 18, tradeSkill: 30, recruitCost: 110, upkeepCost: 11, description: 'A charismatic trader who can haggle the price of anything down by half.', emoji: '🪭', requiredLevel: 5, specialAbility: 'Silver Tongue — improves buying prices at market' },
  { id: 'silk_road_veteran', name: 'Silk Road Veteran', species: 'silk_merchant', rarity: 'rare', power: 12, wisdom: 24, tradeSkill: 48, recruitCost: 420, upkeepCost: 38, description: 'A seasoned merchant who has walked every trade route from here to the distant jade mountains.', emoji: '🐫', requiredLevel: 11, specialAbility: 'Trade Network — unlocks rare material exchanges' },
  { id: 'lotus_boutique_owner', name: 'Lotus Boutique Owner', species: 'silk_merchant', rarity: 'epic', power: 18, wisdom: 36, tradeSkill: 72, recruitCost: 1600, upkeepCost: 130, description: 'Owner of the finest boutique on Lotus Wharf, their silk creations command astronomical prices.', emoji: '🏬', requiredLevel: 24, specialAbility: 'Royal Commission — sells goods at triple value once per day' },
  { id: 'grand_silk_archon', name: 'Grand Silk Archon', species: 'silk_merchant', rarity: 'legendary', power: 28, wisdom: 55, tradeSkill: 120, recruitCost: 6200, upkeepCost: 420, description: 'The legendary merchant who controls the entire lotus silk trade across all eastern harbors.', emoji: '🏛️', requiredLevel: 42, specialAbility: 'Silk Dynasty — all trade profits doubled permanently while active' },
  // ── Water Spirits (5) ──
  { id: 'mist_wisp', name: 'Mist Wisp', species: 'water_spirit', rarity: 'common', power: 8, wisdom: 18, tradeSkill: 6, recruitCost: 30, upkeepCost: 3, description: 'A tiny glowing wisp that drifts over the harbor waters on foggy mornings.', emoji: '🌫️', requiredLevel: 1, specialAbility: 'Fog Veil — slightly obscures harbor from threats' },
  { id: 'tide_singer', name: 'Tide Singer', species: 'water_spirit', rarity: 'uncommon', power: 14, wisdom: 28, tradeSkill: 10, recruitCost: 130, upkeepCost: 13, description: 'A gentle spirit whose songs guide the harbor tides and calm rough waters.', emoji: '🎵', requiredLevel: 6, specialAbility: 'Tide Song — boosts XP gain from harbor exploration' },
  { id: 'jade_fountain_guardian', name: 'Jade Fountain Guardian', species: 'water_spirit', rarity: 'rare', power: 24, wisdom: 42, tradeSkill: 15, recruitCost: 480, upkeepCost: 42, description: 'A powerful spirit that dwells within the ancient jade fountain at the harbor center.', emoji: '⛲', requiredLevel: 13, specialAbility: 'Jade Healing — restores sailor vitality during events' },
  { id: 'deep_current_sage', name: 'Deep Current Sage', species: 'water_spirit', rarity: 'epic', power: 38, wisdom: 65, tradeSkill: 22, recruitCost: 1800, upkeepCost: 140, description: 'An ancient sage who knows every current, every hidden passage beneath the jade waters.', emoji: '🧙', requiredLevel: 27, specialAbility: 'Current Reading — reveals the best exploration opportunities' },
  { id: 'ocean_sovereign', name: 'Ocean Sovereign', species: 'water_spirit', rarity: 'legendary', power: 55, wisdom: 100, tradeSkill: 30, recruitCost: 7000, upkeepCost: 480, description: 'The supreme water spirit who rules all waters touching the lotus harbor, a being older than the harbor itself.', emoji: '🌊', requiredLevel: 45, specialAbility: 'Tidal Dominion — controls all harbor water, maximizing every action' },
  // ── Crane Guardians (5) ──
  { id: 'fledgling_sentry', name: 'Fledgling Sentry', species: 'crane_guardian', rarity: 'common', power: 14, wisdom: 8, tradeSkill: 4, recruitCost: 28, upkeepCost: 3, description: 'A young crane recently recruited into the harbor watch, eager and watchful.', emoji: '🐣', requiredLevel: 1, specialAbility: 'Keen Eyes — small chance to detect hidden threats' },
  { id: 'patrol_wing', name: 'Patrol Wing', species: 'crane_guardian', rarity: 'uncommon', power: 26, wisdom: 14, tradeSkill: 7, recruitCost: 115, upkeepCost: 12, description: 'An experienced patrol crane that circles the harbor perimeter every dawn.', emoji: '🦅', requiredLevel: 5, specialAbility: 'Sky Patrol — increases exploration safety' },
  { id: 'stormbreak_crane', name: 'Stormbreak Crane', species: 'crane_guardian', rarity: 'rare', power: 42, wisdom: 22, tradeSkill: 12, recruitCost: 460, upkeepCost: 40, description: 'A mighty crane that can part storm clouds with a single beat of its enormous wings.', emoji: '⛈️', requiredLevel: 14, specialAbility: 'Stormbreak — nullifies one negative event effect' },
  { id: 'jade_plumed_commander', name: 'Jade-Plumed Commander', species: 'crane_guardian', rarity: 'epic', power: 65, wisdom: 35, tradeSkill: 18, recruitCost: 1700, upkeepCost: 135, description: 'The commander of all crane guardians, recognizable by its magnificent jade-tipped feathers.', emoji: '🪖', requiredLevel: 28, specialAbility: 'Command Aura — boosts all other sailors\' defense' },
  { id: 'divine_crane_immortal', name: 'Divine Crane Immortal', species: 'crane_guardian', rarity: 'legendary', power: 100, wisdom: 55, tradeSkill: 25, recruitCost: 6500, upkeepCost: 450, description: 'An immortal crane that has lived for ten thousand years, said to have carried the first lotus seed to the harbor.', emoji: '🦩', requiredLevel: 43, specialAbility: 'Immortal Vigilance — renders the harbor immune to raid events' },
  // ── Pearl Divers (5) ──
  { id: 'shore_collector', name: 'Shore Collector', species: 'pearl_diver', rarity: 'common', power: 8, wisdom: 14, tradeSkill: 10, recruitCost: 22, upkeepCost: 2, description: 'A beachcomber who gathers loose pearls and shells washed ashore by the tide.', emoji: '🐚', requiredLevel: 1, specialAbility: 'Beachcomb — small chance to find free materials' },
  { id: 'shallow_diver', name: 'Shallow Diver', species: 'pearl_diver', rarity: 'uncommon', power: 12, wisdom: 20, tradeSkill: 16, recruitCost: 105, upkeepCost: 10, description: 'A skilled diver who retrieves pearls from the shallows of Pearl Bay with graceful efficiency.', emoji: '🤿', requiredLevel: 4, specialAbility: 'Pearl Sense — locates nearby pearl deposits' },
  { id: 'deep_reef_hunter', name: 'Deep Reef Hunter', species: 'pearl_diver', rarity: 'rare', power: 20, wisdom: 30, tradeSkill: 25, recruitCost: 430, upkeepCost: 38, description: 'An expert diver who plunges into the deep reef to retrieve rare luminous pearls.', emoji: '🫧', requiredLevel: 12, specialAbility: 'Deep Dive — uncovers rare materials from the deep' },
  { id: 'abyssal_pearl_master', name: 'Abyssal Pearl Master', species: 'pearl_diver', rarity: 'epic', power: 32, wisdom: 48, tradeSkill: 40, recruitCost: 1550, upkeepCost: 125, description: 'A legendary diver who can hold their breath for an hour, reaching the deepest pearl beds.', emoji: '🫧', requiredLevel: 26, specialAbility: 'Abyssal Harvest — retrieves legendary-grade pearls' },
  { id: 'dragon_pearl_seekers', name: 'Dragon Pearl Seekers', species: 'pearl_diver', rarity: 'legendary', power: 50, wisdom: 72, tradeSkill: 65, recruitCost: 5800, upkeepCost: 400, description: 'An elite order of divers who seek the mythical dragon pearls said to grant wishes.', emoji: '🔮', requiredLevel: 41, specialAbility: 'Dragon Pearl Wish — choose one reward from three options' },
  // ── Storm Herons (5) ──
  { id: 'cloud_skimmer', name: 'Cloud Skimmer', species: 'storm_heron', rarity: 'common', power: 12, wisdom: 12, tradeSkill: 6, recruitCost: 26, upkeepCost: 3, description: 'A nimble heron that skims low clouds, carrying messages between harbor districts.', emoji: '☁️', requiredLevel: 1, specialAbility: 'Cloud Message — delivers instant updates from distant districts' },
  { id: 'gale_rider', name: 'Gale Rider', species: 'storm_heron', rarity: 'uncommon', power: 22, wisdom: 18, tradeSkill: 9, recruitCost: 125, upkeepCost: 12, description: 'A bold heron that rides the monsoon gales, guiding ships through treacherous winds.', emoji: '💨', requiredLevel: 6, specialAbility: 'Gale Guidance — boosts navigation through dangerous districts' },
  { id: 'thunder_caller', name: 'Thunder Caller', species: 'storm_heron', rarity: 'rare', power: 35, wisdom: 28, tradeSkill: 14, recruitCost: 470, upkeepCost: 42, description: 'A magnificent heron whose cry summons thunder, used to signal harbor alerts across miles.', emoji: '🌩️', requiredLevel: 15, specialAbility: 'Thunder Call — warns of incoming threats in advance' },
  { id: 'cyclone_sovereign', name: 'Cyclone Sovereign', species: 'storm_heron', rarity: 'epic', power: 55, wisdom: 42, tradeSkill: 20, recruitCost: 1750, upkeepCost: 140, description: 'A heron so powerful it commands entire cyclones, bending storms to its will.', emoji: '🌀', requiredLevel: 30, specialAbility: 'Cyclone Shield — creates a wind barrier protecting all sailors' },
  { id: 'celestial_storm_lord', name: 'Celestial Storm Lord', species: 'storm_heron', rarity: 'legendary', power: 88, wisdom: 65, tradeSkill: 30, recruitCost: 6800, upkeepCost: 460, description: 'The supreme heron deity who controls all weather over the eastern seas, lord of wind and wave.', emoji: '⚡', requiredLevel: 46, specialAbility: 'Weather Dominion — chooses weather conditions for all exploration' },
] as const;

// ─── Harbor Districts / Chambers (8) ────────────────────────────────────────

export const LO_CHAMBERS: readonly LoChamberDef[] = [
  { id: 'jade_dock', name: 'Jade Dock', description: 'The main harbor entrance where jade-green waters lap against ancient stone piers. All newcomers arrive here first.', emoji: '⚓', unlockLevel: 1, unlockCost: 0, baseXpPerVisit: 10, baseCoinsPerVisit: 15, materialChance: 0.10, dangerLevel: 1 },
  { id: 'lotus_market', name: 'Lotus Market', description: 'A bustling floating market built on enormous lotus pads, where merchants trade silk, spices, and rare gems.', emoji: '🏪', unlockLevel: 3, unlockCost: 150, baseXpPerVisit: 18, baseCoinsPerVisit: 25, materialChance: 0.20, dangerLevel: 1 },
  { id: 'pearl_bay', name: 'Pearl Bay', description: 'A sheltered cove where luminous pearls can be found in the shallow jade waters beneath the moonlight.', emoji: '🫧', unlockLevel: 6, unlockCost: 400, baseXpPerVisit: 28, baseCoinsPerVisit: 35, materialChance: 0.30, dangerLevel: 2 },
  { id: 'silk_wharf', name: 'Silk Wharf', description: 'The largest silk trading post in the eastern harbor, where the finest lotus silk changes hands.', emoji: '🧶', unlockLevel: 10, unlockCost: 900, baseXpPerVisit: 42, baseCoinsPerVisit: 50, materialChance: 0.35, dangerLevel: 2 },
  { id: 'jade_bridge', name: 'Jade Bridge', description: 'An ancient arched bridge of pure jade connecting the harbor to the spirit realm, humming with otherworldly energy.', emoji: '🌉', unlockLevel: 16, unlockCost: 1800, baseXpPerVisit: 65, baseCoinsPerVisit: 75, materialChance: 0.40, dangerLevel: 3 },
  { id: 'spirit_temple', name: 'Spirit Temple', description: 'A sacred temple on a floating lotus where water spirits are honored with offerings of pearls and silk.', emoji: '⛩️', unlockLevel: 22, unlockCost: 3500, baseXpPerVisit: 95, baseCoinsPerVisit: 110, materialChance: 0.45, dangerLevel: 4 },
  { id: 'spice_warehouse', name: 'Spice Warehouse', description: 'A massive warehouse where rare eastern spices from distant lands are stored and traded.', emoji: '🌶️', unlockLevel: 30, unlockCost: 6000, baseXpPerVisit: 140, baseCoinsPerVisit: 160, materialChance: 0.50, dangerLevel: 5 },
  { id: 'lotus_throne', name: 'Lotus Throne', description: 'The legendary throne room atop the great lotus, seat of the harbor\'s ancient power and greatest secrets.', emoji: '🪷', unlockLevel: 40, unlockCost: 12000, baseXpPerVisit: 220, baseCoinsPerVisit: 250, materialChance: 0.60, dangerLevel: 6 },
] as const;

// ─── Materials (12) ────────────────────────────────────────────────────────

export const LO_MATERIALS: readonly LoMaterialDef[] = [
  { id: 'jade_fragment', name: 'Jade Fragment', category: 'mineral', rarity: 'common', baseValue: 5, description: 'A shard of harbor jade, warm to the touch and humming with faint energy.', emoji: '💚' },
  { id: 'lotus_silk', name: 'Lotus Silk', category: 'fabric', rarity: 'common', baseValue: 8, description: 'Silk harvested from lotus flowers that grow in the harbor, softer than spider silk.', emoji: '🪭' },
  { id: 'pearl_essence', name: 'Pearl Essence', category: 'essence', rarity: 'common', baseValue: 6, description: 'Concentrated pearl powder used in alchemy and silk dyeing.', emoji: '🫧' },
  { id: 'spice_dust', name: 'Spice Dust', category: 'spice', rarity: 'common', baseValue: 4, description: 'A fragrant blend of eastern spices traded at the harbor market.', emoji: '🫙' },
  { id: 'bamboo_pulp', name: 'Bamboo Pulp', category: 'herb', rarity: 'uncommon', baseValue: 12, description: 'Refined bamboo fiber used to craft paper, armor, and building materials.', emoji: '🎋' },
  { id: 'jadeite_gem', name: 'Jadeite Gem', category: 'gem', rarity: 'uncommon', baseValue: 25, description: 'A polished jadeite gemstone of remarkable clarity, prized by collectors.', emoji: '💎' },
  { id: 'golden_lotus_thread', name: 'Golden Lotus Thread', category: 'fabric', rarity: 'rare', baseValue: 55, description: 'Thread spun from golden lotus flowers that bloom only once a decade.', emoji: '🧵' },
  { id: 'spirit_water', name: 'Spirit Water', category: 'essence', rarity: 'rare', baseValue: 45, description: 'Water blessed by harbor spirits, capable of healing and purification.', emoji: '💧' },
  { id: 'phoenix_spice', name: 'Phoenix Spice', category: 'spice', rarity: 'epic', baseValue: 120, description: 'An impossibly rare spice said to grant visions of past lives when consumed.', emoji: '🔥' },
  { id: 'dragon_pearl', name: 'Dragon Pearl', category: 'gem', rarity: 'epic', baseValue: 150, description: 'A pearl from the forehead of a dragon, radiating raw elemental power.', emoji: '🔮' },
  { id: 'celestial_lotus_petal', name: 'Celestial Lotus Petal', category: 'herb', rarity: 'epic', baseValue: 100, description: 'A petal from the celestial lotus that blooms in the spirit temple.', emoji: '🌸' },
  { id: 'primordial_jade_heart', name: 'Primordial Jade Heart', category: 'mineral', rarity: 'legendary', baseValue: 500, description: 'The core of the first jade deposit in the harbor, containing primordial energy.', emoji: '💚' },
] as const;

// ─── Harbor NPCs (10) ──────────────────────────────────────────────────────────

export interface LoNpcDef {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly description: string;
  readonly emoji: string;
  readonly greeting: string;
  readonly harborDistrict: LoChamberId;
}

export const LO_NPCS: readonly LoNpcDef[] = [
  { id: 'npc_harbor_master_lin', name: 'Master Lin', role: 'Harbor Master', description: 'The aging harbor master who has guided Lotus Harbor for forty years, knowing every waterway and hidden passage.', emoji: '🧓', greeting: 'Welcome to Lotus Harbor, traveler. The jade waters have been expecting you.', harborDistrict: 'jade_dock' },
  { id: 'npc_merchant_mei', name: 'Mei the Silk Weaver', role: 'Master Silk Weaver', description: 'The finest silk weaver in the eastern seas, whose lotus silk is said to be lighter than air.', emoji: '🧵', greeting: 'Ah, a visitor! Would you like to see my latest lotus silk creations?', harborDistrict: 'lotus_market' },
  { id: 'npc_pearl_elder', name: 'Elder Pearl-eye', role: 'Pearl Expert', description: 'A wise elder who can identify any pearl by touch alone, having handled ten thousand in his lifetime.', emoji: '🫧', greeting: 'The pearls sing to me, young one. What treasures has the bay offered you today?', harborDistrict: 'pearl_bay' },
  { id: 'npc_captain_feng', name: 'Captain Feng Stormborn', role: 'Wharf Master', description: 'A retired naval captain who now manages the Silk Wharf, known for his booming voice and iron discipline.', emoji: '⚓', greeting: 'Silk Wharf is the heart of our trade! Handle your cargo with care!', harborDistrict: 'silk_wharf' },
  { id: 'npc_spirit_guide', name: 'Wisp of the Jade Waters', role: 'Spirit Guide', description: 'A benevolent water spirit that appears as shimmering mist, offering cryptic but valuable advice.', emoji: '👻', greeting: 'The waters speak of change on the horizon... heed their whispers.', harborDistrict: 'jade_bridge' },
  { id: 'npc_temple_keeper', name: 'High Priestess Yue', role: 'Temple Keeper', description: 'The guardian of the Spirit Temple who mediates between humans and the water spirits.', emoji: '📿', greeting: 'The spirits are restless today. Perhaps you should make an offering.', harborDistrict: 'spirit_temple' },
  { id: 'npc_spice_master', name: 'Spice Master Raja', role: 'Spice Trader', description: 'A trader from distant lands who brings exotic spices that fetch astronomical prices at the harbor.', emoji: '🌶️', greeting: 'My spices travel from the edge of the world to reach this harbor. Taste destiny itself!', harborDistrict: 'spice_warehouse' },
  { id: 'npc_throne_guardian', name: 'Sentinel of the Lotus Throne', role: 'Throne Guardian', description: 'An immortal guardian who has protected the Lotus Throne since the harbor\'s founding, never sleeping.', emoji: '🛡️', greeting: 'Few mortals reach this sacred place. The Lotus Throne recognizes your worth.', harborDistrict: 'lotus_throne' },
  { id: 'npc_fisherman_kai', name: 'Old Man Kai', role: 'Harbor Fisherman', description: 'A cheerful old fisherman who knows every fish in the jade waters and tells stories of the deep.', emoji: '🎣', greeting: 'Good fishing today! The koi are biting well near the jade bridge.', harborDistrict: 'jade_dock' },
  { id: 'npc_spirit_medium', name: 'Medium Zhen', role: 'Spirit Medium', description: 'A young woman who can communicate with water spirits through ancient meditation techniques.', emoji: '🧘', greeting: 'I sense the spirits stirring... they have messages for you from the deep.', harborDistrict: 'spirit_temple' },
] as const;

// ─── Trade Routes (6) ─────────────────────────────────────────────────────────

export interface LoTradeRouteDef {
  readonly id: string;
  readonly name: string;
  readonly origin: LoChamberId;
  readonly description: string;
  readonly baseProfit: number;
  readonly riskLevel: number;
  readonly durationMinutes: number;
  readonly requiredSailors: number;
  readonly emoji: string;
}

export const LO_TRADE_ROUTES: readonly LoTradeRouteDef[] = [
  { id: 'route_jade_silk', name: 'Jade Silk Circuit', origin: 'lotus_market', description: 'A circular trade route through the lotus fields delivering silk to all harbor districts.', baseProfit: 50, riskLevel: 1, durationMinutes: 10, requiredSailors: 1, emoji: '🔄' },
  { id: 'route_pearl_shipment', name: 'Pearl Shipment Run', origin: 'pearl_bay', description: 'Transport luminous pearls from Pearl Bay to the Silk Wharf for premium pricing.', baseProfit: 120, riskLevel: 2, durationMinutes: 20, requiredSailors: 2, emoji: '📦' },
  { id: 'route_spice_caravan', name: 'Overland Spice Caravan', origin: 'spice_warehouse', description: 'Navigate treacherous land routes to deliver rare spices to distant markets.', baseProfit: 200, riskLevel: 3, durationMinutes: 30, requiredSailors: 3, emoji: '🐪' },
  { id: 'route_spirit_relics', name: 'Spirit Relic Trade', origin: 'spirit_temple', description: 'Barter blessed relics from the spirit realm through the Jade Bridge.', baseProfit: 300, riskLevel: 4, durationMinutes: 45, requiredSailors: 4, emoji: '⛩️' },
  { id: 'route_celestial_goods', name: 'Celestial Goods Exchange', origin: 'jade_bridge', description: 'Exchange goods with the spirit realm through the ancient jade portal.', baseProfit: 500, riskLevel: 5, durationMinutes: 60, requiredSailors: 5, emoji: '🌌' },
  { id: 'route_throne_treasures', name: 'Lotus Throne Treasures', origin: 'lotus_throne', description: 'The most profitable and dangerous route, carrying treasures from the ancient throne.', baseProfit: 1000, riskLevel: 6, durationMinutes: 90, requiredSailors: 6, emoji: '👑' },
] as const;

// ─── Harbor Lore (12 lore entries) ──────────────────────────────────────────────

export interface LoLoreEntry {
  readonly id: string;
  readonly title: string;
  readonly content: string;
  readonly unlockLevel: number;
  readonly emoji: string;
}

export const LO_LORE: readonly LoLoreEntry[] = [
  { id: 'lore_founding', title: 'The Founding of Lotus Harbor', content: 'Legend says that a single lotus seed fell from the heavens and rooted in the jade waters, growing into the great floating city over a thousand years. The first settlers were water spirits who welcomed human travelers.', unlockLevel: 1, emoji: '🌱' },
  { id: 'lore_jade_waters', title: 'The Jade Waters', content: 'The harbor waters are jade-green due to mineral deposits from an ancient underwater jade vein that stretches for miles beneath the harbor floor.', unlockLevel: 2, emoji: '💧' },
  { id: 'lore_lotus_silk', title: 'The Secret of Lotus Silk', content: 'Lotus silk is harvested from flowers that grow only in the harbor. Each thread is said to carry a fragment of the lotus\'s purity and protective power.', unlockLevel: 5, emoji: '🧵' },
  { id: 'lore_water_spirits', title: 'The Water Spirits', content: 'Water spirits are ancient beings who have guarded the harbor since before human memory. They appear as shimmering mist and speak through the tides.', unlockLevel: 8, emoji: '👻' },
  { id: 'lore_pearl_origins', title: 'Pearls of Power', content: 'The pearls of Pearl Bay are not ordinary pearls — they are condensed spirit energy, each containing a tiny fragment of a water spirit\'s blessing.', unlockLevel: 12, emoji: '🫧' },
  { id: 'lore_jade_bridge', title: 'The Jade Bridge', content: 'The Jade Bridge is not a natural formation — it was grown from a single jade crystal by the first harbor masters over three hundred years of meditation.', unlockLevel: 16, emoji: '🌉' },
  { id: 'lore_spirit_temple', title: 'The Spirit Temple', content: 'The Spirit Temple floats on the largest lotus pad in the harbor. Inside, the walls are alive with flowing water that tells stories of ancient battles and lost treasures.', unlockLevel: 22, emoji: '⛩️' },
  { id: 'lore_storm_herons', title: 'Storm Herons and the Monsoon', content: 'Storm herons migrate through the harbor during the monsoon season, riding wind currents that would destroy ordinary birds. Their migration is considered a sign of good fortune.', unlockLevel: 26, emoji: '🦩' },
  { id: 'lore_lotus_throne', title: 'The Lotus Throne', content: 'Atop the great lotus sits a throne of living flowers that only blooms for those deemed worthy by the harbor spirits. No one knows what power it truly holds.', unlockLevel: 35, emoji: '🪷' },
  { id: 'lore_dragon_lineage', title: 'The Lotus Dragon Lineage', content: 'The lotus dragons are the oldest creatures in the harbor, descended from the primordial wyrm born from the first lotus seed. Each generation grows more powerful.', unlockLevel: 40, emoji: '🐲' },
  { id: 'lore_harbor_protection', title: 'The Harbor\'s Protection', content: 'A mystical barrier surrounds the harbor, maintained by the collective prayers of the water spirits and the faith of the harbor folk. It repels storms and sea monsters.', unlockLevel: 44, emoji: '🛡️' },
  { id: 'lore_final_revelation', title: 'The Secret of the Depths', content: 'Beneath the harbor lies an enormous jade chamber where the original lotus seed still grows, its roots reaching through the ocean floor to the very center of the world.', unlockLevel: 50, emoji: '🌍' },
] as const;

// ─── Structures (8) ────────────────────────────────────────────────────────

export const LO_STRUCTURES: readonly LoStructureDef[] = [
  { id: 'lotus_dockhouse', name: 'Lotus Dockhouse', description: 'A sturdy dockhouse built from living lotus wood where sailors rest and harbor plans are made.', emoji: '🏠', maxLevel: 10, baseCost: 0, costPerLevel: 15, bonusType: 'defense_bonus', bonusValue: 3, requiredLevel: 1 },
  { id: 'silk_weaving_studio', name: 'Silk Weaving Studio', description: 'A workshop where lotus silk is woven into fine cloth, boosting trade income.', emoji: '🧵', maxLevel: 10, baseCost: 80, costPerLevel: 22, bonusType: 'trade_bonus', bonusValue: 5, requiredLevel: 3 },
  { id: 'jade_storehouse', name: 'Jade Storehouse', description: 'A secure storehouse for harbor materials, increasing storage capacity.', emoji: '🏪', maxLevel: 10, baseCost: 120, costPerLevel: 28, bonusType: 'coin_bonus', bonusValue: 4, requiredLevel: 5 },
  { id: 'spirit_shrine', name: 'Spirit Shrine', description: 'A small shrine honoring the water spirits, granting blessings to explorers.', emoji: '⛩️', maxLevel: 10, baseCost: 200, costPerLevel: 35, bonusType: 'exploration_bonus', bonusValue: 5, requiredLevel: 8 },
  { id: 'pearl_refinery', name: 'Pearl Refinery', description: 'Refines raw pearls into valuable essence, boosting crafting output.', emoji: '⚙️', maxLevel: 10, baseCost: 300, costPerLevel: 42, bonusType: 'crafting_bonus', bonusValue: 6, requiredLevel: 12 },
  { id: 'storm_watchtower', name: 'Storm Watchtower', description: 'A tall tower from which harbor sentinels spot incoming storms and threats.', emoji: '🗼', maxLevel: 10, baseCost: 450, costPerLevel: 55, bonusType: 'defense_bonus', bonusValue: 8, requiredLevel: 18 },
  { id: 'ancient_navigation_chamber', name: 'Ancient Navigation Chamber', description: 'A chamber filled with star maps and tidal charts, improving harbor navigation.', emoji: '🗺️', maxLevel: 10, baseCost: 700, costPerLevel: 70, bonusType: 'navigation_bonus', bonusValue: 7, requiredLevel: 25 },
  { id: 'lotus_training_hall', name: 'Lotus Training Hall', description: 'A grand hall where sailors train under the lotus masters, boosting all skills.', emoji: '🏫', maxLevel: 10, baseCost: 1200, costPerLevel: 100, bonusType: 'xp_bonus', bonusValue: 10, requiredLevel: 35 },
] as const;

// ─── Abilities (8) ─────────────────────────────────────────────────────────

export const LO_ABILITIES: readonly LoAbilityDef[] = [
  { id: 'lotus_bloom', name: 'Lotus Bloom', category: 'exploration', description: 'Causes a burst of lotus flowers to bloom, revealing hidden treasures in the current district.', emoji: '🪷', cooldown: 5, power: 20, xpCost: 10, coinCost: 20, unlockCost: 0, requiredLevel: 1 },
  { id: 'jade_strike', name: 'Jade Strike', category: 'combat', description: 'Channel jade energy into a devastating attack against harbor threats.', emoji: '💚', cooldown: 8, power: 35, xpCost: 15, coinCost: 30, unlockCost: 0, requiredLevel: 1 },
  { id: 'silk_tangle', name: 'Silk Tangle', category: 'defense', description: 'Entrap enemies in unbreakable lotus silk threads, neutralizing their next action.', emoji: '🕸️', cooldown: 10, power: 25, xpCost: 12, coinCost: 25, unlockCost: 80, requiredLevel: 4 },
  { id: 'tide_surge', name: 'Tide Surge', category: 'navigation', description: 'Summon a powerful tide that propels your exploration fleet faster through districts.', emoji: '🌊', cooldown: 12, power: 30, xpCost: 20, coinCost: 40, unlockCost: 150, requiredLevel: 8 },
  { id: 'pearl_rain', name: 'Pearl Rain', category: 'trade', description: 'Conjure a rain of luminous pearls, boosting coin income for a limited time.', emoji: '🌧️', cooldown: 15, power: 50, xpCost: 30, coinCost: 50, unlockCost: 300, requiredLevel: 14 },
  { id: 'spirit_blessing', name: 'Spirit Blessing', category: 'defense', description: 'Call upon the water spirits to shield your sailors from harm during explorations.', emoji: '👻', cooldown: 20, power: 45, xpCost: 25, coinCost: 60, unlockCost: 600, requiredLevel: 20 },
  { id: 'dragon_breath', name: 'Dragon Breath', category: 'combat', description: 'Unleash the breath of the ancient lotus dragon, devastating all threats in range.', emoji: '🐉', cooldown: 25, power: 80, xpCost: 40, coinCost: 80, unlockCost: 1200, requiredLevel: 30 },
  { id: 'harmonious_winds', name: 'Harmonious Winds', category: 'exploration', description: 'Align all harbor winds in harmony, granting massive bonuses to every action.', emoji: '🌬️', cooldown: 30, power: 100, xpCost: 50, coinCost: 100, unlockCost: 2500, requiredLevel: 40 },
] as const;

// ─── Achievements (10) ─────────────────────────────────────────────────────

export const LO_ACHIEVEMENTS: readonly LoAchievementDef[] = [
  { id: 'ach_first_sailor', name: 'First Recruit', description: 'Recruit your first sailor to the lotus harbor', conditionKey: 'totalSailorsRecruited', targetValue: 1, rewardXP: 50, rewardCoins: 50, emoji: '🎣' },
  { id: 'ach_five_sailors', name: 'Harbor Crew', description: 'Have 5 sailors in your harbor crew', conditionKey: 'totalSailorsRecruited', targetValue: 5, rewardXP: 150, rewardCoins: 150, emoji: '🚣' },
  { id: 'ach_explore_all', name: 'District Explorer', description: 'Discover all 8 harbor districts', conditionKey: 'totalDistrictsExplored', targetValue: 8, rewardXP: 400, rewardCoins: 400, emoji: '🗺️' },
  { id: 'ach_rich_merchant', name: 'Silk Tycoon', description: 'Accumulate 5,000 total coins', conditionKey: 'totalCoinsEarned', targetValue: 5000, rewardXP: 300, rewardCoins: 500, emoji: '💰' },
  { id: 'ach_structure_master', name: 'Master Builder', description: 'Build or upgrade 5 structures', conditionKey: 'totalStructuresBuilt', targetValue: 5, rewardXP: 250, rewardCoins: 300, emoji: '🏗️' },
  { id: 'ach_artifact_collector', name: 'Relic Keeper', description: 'Activate 3 ancient artifacts', conditionKey: 'totalArtifactsActivated', targetValue: 3, rewardXP: 350, rewardCoins: 400, emoji: '🏺' },
  { id: 'ach_event_veteran', name: 'Harbor Veteran', description: 'Complete 5 harbor events', conditionKey: 'totalEventsCompleted', targetValue: 5, rewardXP: 400, rewardCoins: 500, emoji: '🎭' },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', description: 'Collect 100 total materials', conditionKey: 'totalMaterialsCollected', targetValue: 100, rewardXP: 200, rewardCoins: 250, emoji: '📦' },
  { id: 'ach_level_25', name: 'Harbor Elder', description: 'Reach harbor level 25', conditionKey: 'loLevel', targetValue: 25, rewardXP: 500, rewardCoins: 600, emoji: '🌟' },
  { id: 'ach_level_50', name: 'Lotus Sovereign', description: 'Reach the maximum harbor level of 50', conditionKey: 'loLevel', targetValue: 50, rewardXP: 2000, rewardCoins: 3000, emoji: '👑' },
] as const;

// ─── Titles (8) ─────────────────────────────────────────────────────────────

export const LO_TITLES: readonly LoTitleDef[] = [
  { id: 'title_wanderer', name: 'Lotus Wanderer', requiredLevel: 1, description: 'A curious traveler who has just arrived at the lotus harbor, eager to explore.', emoji: '🌸', color: LO_LOTUS_PINK, coinMultiplier: 1.0, xpMultiplier: 1.0 },
  { id: 'title_anchorer', name: 'Anchorer', requiredLevel: 5, description: 'A newcomer who has set anchor and begun building a life at the harbor.', emoji: '⚓', color: LO_WATER_BLUE, coinMultiplier: 1.05, xpMultiplier: 1.05 },
  { id: 'title_trader', name: 'Lotus Trader', requiredLevel: 10, description: 'A savvy merchant who knows the silk market like the back of their hand.', emoji: '🧑‍💼', color: LO_SILK_GOLD, coinMultiplier: 1.1, xpMultiplier: 1.1 },
  { id: 'title_explorer', name: 'Harbor Explorer', requiredLevel: 16, description: 'An intrepid explorer who has braved every district from Jade Dock to Silk Wharf.', emoji: '🧭', color: LO_BAMBOO_GREEN, coinMultiplier: 1.15, xpMultiplier: 1.15 },
  { id: 'title_guardian', name: 'Harbor Guardian', requiredLevel: 22, description: 'A seasoned guardian who protects the harbor from storms, spirits, and rival merchants.', emoji: '🛡️', color: LO_JADE_GREEN, coinMultiplier: 1.2, xpMultiplier: 1.2 },
  { id: 'title_master', name: 'Lotus Master', requiredLevel: 30, description: 'A master of all harbor arts — trade, exploration, and diplomacy flow through them.', emoji: '🏯', color: LO_SUNSET_RED, coinMultiplier: 1.3, xpMultiplier: 1.3 },
  { id: 'title_sage', name: 'Jade Water Sage', requiredLevel: 40, description: 'A venerable sage who communes with the ancient water spirits and knows the harbor\'s deepest secrets.', emoji: '🧙', color: LO_MIST_PURPLE, coinMultiplier: 1.45, xpMultiplier: 1.45 },
  { id: 'title_sovereign', name: 'Lotus Harbor Sovereign', requiredLevel: 50, description: 'The supreme ruler of Lotus Harbor, blessed by all water spirits and dragon kings.', emoji: '👑', color: LO_SILK_GOLD, coinMultiplier: 1.6, xpMultiplier: 1.6 },
] as const;

// ─── Artifacts (6) ─────────────────────────────────────────────────────────

export const LO_ARTIFACTS: readonly LoArtifactDef[] = [
  { id: 'art_lotus_lantern', name: 'Lotus Lantern', rarity: 'common', description: 'A paper lantern shaped like a lotus flower that glows softly in the harbor mist.', emoji: '🏮', power: 5, cost: 80, lore: 'Every new arrival at Lotus Harbor receives one of these lanterns to light their way.', bonusType: 'exploration_bonus' },
  { id: 'art_jade_compass', name: 'Jade Compass', rarity: 'uncommon', description: 'An ancient compass carved from a single piece of jade that always points toward treasure.', emoji: '🧭', power: 12, cost: 250, lore: 'Gifted by the Jade Koi King to the first merchant who fed him lotus seeds for a year.', bonusType: 'navigation_bonus' },
  { id: 'art_silk_tapestry', name: 'Silk Tapestry of Waves', rarity: 'rare', description: 'A magnificent tapestry depicting the harbor\'s history, woven from enchanted lotus silk.', emoji: '🎨', power: 25, cost: 700, lore: 'This tapestry shows every harbor event since the harbor\'s founding a thousand years ago.', bonusType: 'coin_bonus' },
  { id: 'art_spirit_crown', name: 'Spirit Crown', rarity: 'epic', description: 'A crown of woven reeds and water spirit essence that grants dominion over harbor waters.', emoji: '👑', power: 50, cost: 2000, lore: 'Worn by the legendary first harbor master who made peace between the water spirits and humans.', bonusType: 'defense_bonus' },
  { id: 'art_dragon_pearl_scepter', name: 'Dragon Pearl Scepter', rarity: 'epic', description: 'A scepter topped with a dragon pearl that commands the loyalty of all harbor creatures.', emoji: '🔱', power: 65, cost: 3500, lore: 'The scepter was forged from the wish-granting pearl of the Celestial Pearl Koi.', bonusType: 'recruit_bonus' },
  { id: 'art_primordial_lotus_seed', name: 'Primordial Lotus Seed', rarity: 'legendary', description: 'The original lotus seed from which the entire harbor was born, containing boundless creative power.', emoji: '🌱', power: 120, cost: 10000, lore: 'Before the harbor existed, a single lotus seed fell from heaven and rooted in the jade waters, growing into the great floating city.', bonusType: 'xp_bonus' },
] as const;

// ─── Events (8) ─────────────────────────────────────────────────────────────

export const LO_EVENTS: readonly LoEventDef[] = [
  { id: 'lotus_bloom_festival', name: 'Lotus Bloom Festival', description: 'Once a year, all lotus flowers in the harbor bloom simultaneously, releasing fragrant pollen that boosts every sailor\'s morale.', emoji: '🌸', durationHours: 4, xpMultiplier: 1.5, coinMultiplier: 1.3, recruitBonus: 0.1, explorationBonus: 1.2, color: LO_LOTUS_PINK },
  { id: 'jade_tide_rising', name: 'Jade Tide Rising', description: 'The jade waters swell with magical energy, revealing submerged treasure troves along the harbor floor.', emoji: '🌊', durationHours: 6, xpMultiplier: 1.3, coinMultiplier: 2.0, recruitBonus: 0.0, explorationBonus: 1.5, color: LO_JADE_GREEN },
  { id: 'silk_caravan_arrival', name: 'Silk Caravan Arrival', description: 'A massive silk caravan from the distant western mountains arrives at Silk Wharf with exotic wares.', emoji: '🐫', durationHours: 3, xpMultiplier: 1.0, coinMultiplier: 1.8, recruitBonus: 0.2, explorationBonus: 1.0, color: LO_SILK_GOLD },
  { id: 'water_spirit_blessing', name: 'Water Spirit Blessing', description: 'The ancient water spirits emerge from the jade waters to bless the harbor and its sailors.', emoji: '👻', durationHours: 8, xpMultiplier: 2.0, coinMultiplier: 1.2, recruitBonus: 0.15, explorationBonus: 1.3, color: LO_WATER_BLUE },
  { id: 'storm_heron_migration', name: 'Storm Heron Migration', description: 'Thousands of storm herons pass through the harbor during their annual migration, bringing powerful winds.', emoji: '🦩', durationHours: 5, xpMultiplier: 1.4, coinMultiplier: 1.5, recruitBonus: 0.1, explorationBonus: 1.8, color: LO_BAMBOO_GREEN },
  { id: 'pearl_diving_season', name: 'Pearl Diving Season', description: 'The warm currents bring rare pearls close to the surface, making it the best time for diving.', emoji: '🫧', durationHours: 4, xpMultiplier: 1.2, coinMultiplier: 2.5, recruitBonus: 0.0, explorationBonus: 1.0, color: LO_PEARL_WHITE },
  { id: 'spice_trade_fair', name: 'Spice Trade Fair', description: 'Merchants from across the eastern seas converge on Lotus Market for the annual spice fair.', emoji: '🌶️', durationHours: 6, xpMultiplier: 1.3, coinMultiplier: 2.2, recruitBonus: 0.05, explorationBonus: 1.1, color: LO_SUNSET_RED },
  { id: 'ancient_treasure_rise', name: 'Ancient Treasure Rise', description: 'An alignment of celestial bodies causes ancient treasures buried beneath the harbor to surface.', emoji: '💰', durationHours: 2, xpMultiplier: 1.0, coinMultiplier: 3.0, recruitBonus: 0.0, explorationBonus: 2.0, color: LO_MIST_PURPLE },
] as const;

// =============================================================================
// SECTION 3: HELPER FUNCTIONS
// =============================================================================

function loXpRequired(level: number): number {
  if (level >= LO_MAX_LEVEL) return Infinity;
  return Math.floor(LO_XP_BASE * Math.pow(LO_XP_SCALE, level - 1));
}

function loClampLevel(lvl: number): number {
  return Math.max(1, Math.min(LO_MAX_LEVEL, lvl));
}

function loGenerateInstanceId(): string {
  return `lo_inst_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function loGetRarityDef(rarity: LoRarity): LoRarityDef {
  return LO_RARITIES.find(r => r.key === rarity) ?? LO_RARITIES[0];
}

function loGetSpeciesDef(species: LoSpecies): LoSpeciesDef {
  return LO_SPECIES.find(s => s.id === species) ?? LO_SPECIES[0];
}

function loGetTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// =============================================================================
// SECTION 4: INITIAL STATE FACTORY
// =============================================================================

function createDefaultLoState(): LoHarborState {
  const now = Date.now();
  const chambers: Record<string, LoChamberState> = {};
  for (const ch of LO_CHAMBERS) {
    chambers[ch.id] = {
      chamberId: ch.id,
      discovered: ch.unlockLevel <= 1,
      visits: 0,
      totalXpGained: 0,
      totalCoinsGained: 0,
      lastVisitAt: null,
    };
  }
  const abilities: Record<string, LoAbilityState> = {};
  for (const ab of LO_ABILITIES) {
    abilities[ab.id] = {
      abilityId: ab.id,
      unlocked: ab.unlockCost === 0,
      unlockedAt: ab.unlockCost === 0 ? now : null,
      lastUsedAt: 0,
      totalUses: 0,
    };
  }
  const achievements: Record<string, LoAchievementState> = {};
  for (const ach of LO_ACHIEVEMENTS) {
    achievements[ach.id] = {
      id: ach.id,
      unlocked: false,
      unlockedAt: null,
      currentValue: 0,
    };
  }
  const artifacts: Record<string, LoArtifactState> = {};
  for (const art of LO_ARTIFACTS) {
    artifacts[art.id] = {
      artifactId: art.id,
      activated: false,
      activatedAt: null,
      charges: 0,
    };
  }
  const structures: Record<string, LoStructureState> = {
    lotus_dockhouse: { structureId: 'lotus_dockhouse', level: 1, builtAt: now, lastCollected: now },
  };

  return {
    loLevel: 1,
    loXp: 0,
    loMaxXp: loXpRequired(1),
    loCurrentTitle: 'title_wanderer',
    loTotalXp: 0,
    loTotalCoins: LO_STARTING_COINS,
    loSailors: [],
    loInventory: [],
    loStructures: structures,
    loArtifacts: artifacts,
    loAbilities: abilities,
    loAchievements: achievements,
    loChambers: chambers,
    loEventLog: [],
    loActiveEvent: null,
    loActiveEventEndsAt: null,
    loStats: {
      totalSailorsRecruited: 0,
      totalDistrictsExplored: 0,
      totalStructuresBuilt: 0,
      totalArtifactsActivated: 0,
      totalAbilitiesUsed: 0,
      totalEventsCompleted: 0,
      totalMaterialsCollected: 0,
      totalCoinsEarned: LO_STARTING_COINS,
      totalXpEarned: 0,
      totalRecruitCosts: 0,
      daysActive: 0,
      highestChamberDanger: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}

function loadLoState(): LoHarborState | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(LO_SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LoHarborState;
    if (parsed && parsed.loLevel && parsed.loSailors !== undefined) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveLoState(state: LoHarborState): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(LO_SAVE_KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    /* quota exceeded or unavailable */
  }
}

// =============================================================================
// SECTION 5: HOOK IMPLEMENTATION
// =============================================================================

export default function useLotusHarbor() {
  const [state, setState] = useState<LoHarborState>(() => loadLoState() ?? createDefaultLoState());
  const stateRef = useRef(state);

  useEffect(() => { stateRef.current = state; }, [state]);

  // ─── Persistence ────────────────────────────────────────────────────────────

  useEffect(() => {
    saveLoState(state);
  }, [state]);

  // ─── XP / Level Helpers ─────────────────────────────────────────────────────

  const addXp = useCallback((amount: number) => {
    setState(prev => {
      const rarity = loGetRarityDef('common');
      let xpGained = Math.floor(amount);
      let currentXp = prev.loXp + xpGained;
      let currentLevel = prev.loLevel;
      let maxXp = prev.loMaxXp;
      let totalXp = prev.loTotalXp + xpGained;

      while (currentXp >= maxXp && currentLevel < LO_MAX_LEVEL) {
        currentXp -= maxXp;
        currentLevel += 1;
        maxXp = loXpRequired(currentLevel);
      }

      if (currentLevel >= LO_MAX_LEVEL) {
        currentXp = 0;
        maxXp = Infinity;
      }

      const newTitle = LO_TITLES.reduceRight((best, t) => {
        return currentLevel >= t.requiredLevel ? t.id : best;
      }, prev.loCurrentTitle);

      return {
        ...prev,
        loLevel: currentLevel,
        loXp: currentXp,
        loMaxXp: maxXp,
        loCurrentTitle: newTitle,
        loTotalXp: totalXp,
        loStats: { ...prev.loStats, totalXpEarned: prev.loStats.totalXpEarned + xpGained },
      };
    });
  }, []);

  const addCoins = useCallback((amount: number) => {
    setState(prev => ({
      ...prev,
      loTotalCoins: prev.loTotalCoins + Math.floor(amount),
      loStats: { ...prev.loStats, totalCoinsEarned: prev.loStats.totalCoinsEarned + Math.floor(amount) },
    }));
  }, []);

  // ─── Recruit Sailor ─────────────────────────────────────────────────────────

  const recruitSailor = useCallback((creatureId: string): boolean => {
    const s = stateRef.current;
    const def = LO_CREATURES.find(c => c.id === creatureId);
    if (!def) return false;
    if (s.loLevel < def.requiredLevel) return false;
    if (s.loSailors.length >= LO_MAX_SAILORS) return false;
    if (s.loTotalCoins < def.recruitCost) return false;

    setState(prev => {
      const newSailor: LoSailorInstance = {
        instanceId: loGenerateInstanceId(),
        creatureId: def.id,
        recruitedAt: Date.now(),
        level: 1,
        xp: 0,
        nickname: def.name,
      };
      const newTotalRecruited = prev.loStats.totalSailorsRecruited + 1;
      return {
        ...prev,
        loTotalCoins: prev.loTotalCoins - def.recruitCost,
        loSailors: [...prev.loSailors, newSailor],
        loStats: {
          ...prev.loStats,
          totalSailorsRecruited: newTotalRecruited,
          totalRecruitCosts: prev.loStats.totalRecruitCosts + def.recruitCost,
        },
      };
    });

    addXp(Math.floor(def.recruitCost * 0.5));
    return true;
  }, [addXp]);

  // ─── Explore District ───────────────────────────────────────────────────────

  const exploreDistrict = useCallback((chamberId: string): { xp: number; coins: number; materialFound: boolean } => {
    const s = stateRef.current;
    const chamberDef = LO_CHAMBERS.find(c => c.id === chamberId);
    if (!chamberDef) return { xp: 0, coins: 0, materialFound: false };
    if (!s.loChambers[chamberId]?.discovered) return { xp: 0, coins: 0, materialFound: false };

    const eventMultiplier = s.loActiveEvent
      ? (LO_EVENTS.find(e => e.id === s.loActiveEvent)?.xpMultiplier ?? 1.0)
      : 1.0;
    const coinEventMultiplier = s.loActiveEvent
      ? (LO_EVENTS.find(e => e.id === s.loActiveEvent)?.coinMultiplier ?? 1.0)
      : 1.0;
    const explorationEventBonus = s.loActiveEvent
      ? (LO_EVENTS.find(e => e.id === s.loActiveEvent)?.explorationBonus ?? 1.0)
      : 1.0;

    let structureExplorationBonus = 0;
    for (const structId of Object.keys(s.loStructures)) {
      const structDef = LO_STRUCTURES.find(st => st.id === structId);
      const structState = s.loStructures[structId];
      if (structDef && structState && structDef.bonusType === 'exploration_bonus') {
        structureExplorationBonus += structDef.bonusValue * structState.level;
      }
    }

    const titleDef = LO_TITLES.find(t => t.id === s.loCurrentTitle);
    const titleMultiplier = titleDef?.xpMultiplier ?? 1.0;

    const baseXp = chamberDef.baseXpPerVisit * explorationEventBonus;
    const baseCoins = chamberDef.baseCoinsPerVisit * explorationEventBonus;
    const totalXp = Math.floor(baseXp * eventMultiplier * titleMultiplier + structureExplorationBonus);
    const totalCoins = Math.floor(baseCoins * coinEventMultiplier);

    let materialFound = false;
    const roll = Math.random();
    if (roll < chamberDef.materialChance) {
      const eligibleMaterials = LO_MATERIALS.filter(m =>
        m.rarity === 'common' || chamberDef.dangerLevel >= 3
      );
      if (eligibleMaterials.length > 0) {
        const mat = eligibleMaterials[Math.floor(Math.random() * eligibleMaterials.length)];
        setState(prev => {
          const existing = prev.loInventory.find(i => i.materialId === mat.id);
          if (existing) {
            return {
              ...prev,
              loInventory: prev.loInventory.map(i =>
                i.materialId === mat.id
                  ? { ...i, quantity: Math.min(i.quantity + 1, LO_MAX_INVENTORY_STACK) }
                  : i
              ),
              loStats: { ...prev.loStats, totalMaterialsCollected: prev.loStats.totalMaterialsCollected + 1 },
            };
          }
          return {
            ...prev,
            loInventory: [...prev.loInventory, { materialId: mat.id, quantity: 1 }],
            loStats: { ...prev.loStats, totalMaterialsCollected: prev.loStats.totalMaterialsCollected + 1 },
          };
        });
        materialFound = true;
      }
    }

    addXp(totalXp);
    addCoins(totalCoins);

    setState(prev => {
      const chamber = prev.loChambers[chamberId];
      const isFirstVisit = chamber?.visits === 0;
      const newDistrictsExplored = isFirstVisit
        ? prev.loStats.totalDistrictsExplored + 1
        : prev.loStats.totalDistrictsExplored;
      return {
        ...prev,
        loChambers: {
          ...prev.loChambers,
          [chamberId]: {
            ...chamber,
            visits: (chamber?.visits ?? 0) + 1,
            totalXpGained: (chamber?.totalXpGained ?? 0) + totalXp,
            totalCoinsGained: (chamber?.totalCoinsGained ?? 0) + totalCoins,
            lastVisitAt: Date.now(),
          },
        },
        loStats: {
          ...prev.loStats,
          totalDistrictsExplored: newDistrictsExplored,
          highestChamberDanger: Math.max(prev.loStats.highestChamberDanger, chamberDef.dangerLevel),
        },
      };
    });

    return { xp: totalXp, coins: totalCoins, materialFound };
  }, [addXp, addCoins]);

  // ─── Discover District ──────────────────────────────────────────────────────

  const discoverDistrict = useCallback((chamberId: string): boolean => {
    const s = stateRef.current;
    const chamberDef = LO_CHAMBERS.find(c => c.id === chamberId);
    if (!chamberDef) return false;
    if (s.loLevel < chamberDef.unlockLevel) return false;
    if (s.loTotalCoins < chamberDef.unlockCost) return false;
    if (s.loChambers[chamberId]?.discovered) return false;

    setState(prev => ({
      ...prev,
      loTotalCoins: prev.loTotalCoins - chamberDef.unlockCost,
      loChambers: {
        ...prev.loChambers,
        [chamberId]: {
          ...prev.loChambers[chamberId],
          discovered: true,
        },
      },
    }));

    addXp(Math.floor(chamberDef.unlockCost * 0.3));
    return true;
  }, [addXp]);

  // ─── Build / Upgrade Structure ──────────────────────────────────────────────

  const buildStructure = useCallback((structureId: string): boolean => {
    const s = stateRef.current;
    const structDef = LO_STRUCTURES.find(st => st.id === structureId);
    if (!structDef) return false;
    if (s.loLevel < structDef.requiredLevel) return false;

    const existingState = s.loStructures[structureId];
    const currentLevel = existingState?.level ?? 0;
    if (currentLevel >= structDef.maxLevel) return false;

    const cost = currentLevel === 0
      ? structDef.baseCost
      : structDef.baseCost + structDef.costPerLevel * currentLevel;

    if (s.loTotalCoins < cost) return false;

    setState(prev => {
      const isNew = !prev.loStructures[structureId];
      const newLevel = (prev.loStructures[structureId]?.level ?? 0) + 1;
      return {
        ...prev,
        loTotalCoins: prev.loTotalCoins - cost,
        loStructures: {
          ...prev.loStructures,
          [structureId]: {
            structureId,
            level: newLevel,
            builtAt: isNew ? Date.now() : (prev.loStructures[structureId]?.builtAt ?? Date.now()),
            lastCollected: Date.now(),
          },
        },
        loStats: {
          ...prev.loStats,
          totalStructuresBuilt: prev.loStats.totalStructuresBuilt + 1,
        },
      };
    });

    addXp(Math.floor(cost * 0.2));
    return true;
  }, [addXp]);

  // ─── Activate Artifact ─────────────────────────────────────────────────────

  const activateArtifact = useCallback((artifactId: string): boolean => {
    const s = stateRef.current;
    const artDef = LO_ARTIFACTS.find(a => a.id === artifactId);
    if (!artDef) return false;
    if (s.loTotalCoins < artDef.cost) return false;
    if (s.loArtifacts[artifactId]?.activated) return false;

    setState(prev => ({
      ...prev,
      loTotalCoins: prev.loTotalCoins - artDef.cost,
      loArtifacts: {
        ...prev.loArtifacts,
        [artifactId]: {
          artifactId,
          activated: true,
          activatedAt: Date.now(),
          charges: 3,
        },
      },
      loStats: {
        ...prev.loStats,
        totalArtifactsActivated: prev.loStats.totalArtifactsActivated + 1,
      },
    }));

    addXp(Math.floor(artDef.cost * 0.15));
    return true;
  }, [addXp]);

  // ─── Use Ability ───────────────────────────────────────────────────────────

  const useAbility = useCallback((abilityId: string): boolean => {
    const s = stateRef.current;
    const abDef = LO_ABILITIES.find(a => a.id === abilityId);
    if (!abDef) return false;
    const abState = s.loAbilities[abilityId];
    if (!abState?.unlocked) return false;
    if (s.loLevel < abDef.requiredLevel) return false;
    if (s.loXp < abDef.xpCost) return false;
    if (s.loTotalCoins < abDef.coinCost) return false;

    setState(prev => ({
      ...prev,
      loXp: prev.loXp - abDef.xpCost,
      loTotalCoins: prev.loTotalCoins - abDef.coinCost,
      loAbilities: {
        ...prev.loAbilities,
        [abilityId]: {
          ...prev.loAbilities[abilityId],
          lastUsedAt: Date.now(),
          totalUses: (prev.loAbilities[abilityId]?.totalUses ?? 0) + 1,
        },
      },
      loStats: {
        ...prev.loStats,
        totalAbilitiesUsed: prev.loStats.totalAbilitiesUsed + 1,
      },
    }));

    addXp(abDef.power);
    return true;
  }, [addXp]);

  // ─── Trigger Harbor Event ─────────────────────────────────────────────────

  const triggerHarborEvent = useCallback((eventId: LoEventId): boolean => {
    const s = stateRef.current;
    const eventDef = LO_EVENTS.find(e => e.id === eventId);
    if (!eventDef) return false;
    if (s.loActiveEvent !== null) return false;

    const endsAt = Date.now() + eventDef.durationHours * 3600_000;

    setState(prev => ({
      ...prev,
      loActiveEvent: eventId,
      loActiveEventEndsAt: endsAt,
      loEventLog: [
        ...prev.loEventLog,
        {
          eventId,
          startedAt: Date.now(),
          endedAt: null,
          xpGained: 0,
          coinsGained: 0,
        },
      ],
    }));

    return true;
  }, []);

  // ─── Check Event Expiry ─────────────────────────────────────────────────────

  const checkEventExpiry = useCallback(() => {
    const s = stateRef.current;
    if (s.loActiveEvent === null || s.loActiveEventEndsAt === null) return;

    if (Date.now() >= s.loActiveEventEndsAt) {
      const eventDef = LO_EVENTS.find(e => e.id === s.loActiveEvent);
      const bonusXp = eventDef ? Math.floor(100 * eventDef.xpMultiplier) : 100;
      const bonusCoins = eventDef ? Math.floor(200 * eventDef.coinMultiplier) : 200;

      setState(prev => {
        const updatedLog = prev.loEventLog.map(entry =>
          entry.eventId === prev.loActiveEvent && entry.endedAt === null
            ? { ...entry, endedAt: Date.now(), xpGained: bonusXp, coinsGained: bonusCoins }
            : entry
        );
        return {
          ...prev,
          loActiveEvent: null,
          loActiveEventEndsAt: null,
          loEventLog: updatedLog,
          loStats: {
            ...prev.loStats,
            totalEventsCompleted: prev.loStats.totalEventsCompleted + 1,
          },
        };
      });

      addXp(bonusXp);
      addCoins(bonusCoins);
    }
  }, [addXp, addCoins]);

  // ─── Check And Claim Achievements ──────────────────────────────────────────

  const checkAndClaimAchievements = useCallback(() => {
    setState(prev => {
      const updated = { ...prev };
      const newAchievements = { ...prev.loAchievements };

      for (const achDef of LO_ACHIEVEMENTS) {
        const achState = newAchievements[achDef.id];
        if (!achState || achState.unlocked) continue;

        let currentValue = 0;
        switch (achDef.conditionKey) {
          case 'totalSailorsRecruited':
            currentValue = prev.loStats.totalSailorsRecruited;
            break;
          case 'totalDistrictsExplored':
            currentValue = prev.loStats.totalDistrictsExplored;
            break;
          case 'totalCoinsEarned':
            currentValue = prev.loStats.totalCoinsEarned;
            break;
          case 'totalStructuresBuilt':
            currentValue = prev.loStats.totalStructuresBuilt;
            break;
          case 'totalArtifactsActivated':
            currentValue = prev.loStats.totalArtifactsActivated;
            break;
          case 'totalEventsCompleted':
            currentValue = prev.loStats.totalEventsCompleted;
            break;
          case 'totalMaterialsCollected':
            currentValue = prev.loStats.totalMaterialsCollected;
            break;
          case 'loLevel':
            currentValue = prev.loLevel;
            break;
          default:
            currentValue = 0;
        }

        newAchievements[achDef.id] = { ...achState, currentValue };
        if (currentValue >= achDef.targetValue) {
          newAchievements[achDef.id] = {
            ...newAchievements[achDef.id],
            unlocked: true,
            unlockedAt: Date.now(),
          };
        }
      }

      return { ...updated, loAchievements: newAchievements };
    });
  }, []);

  // ─── Reset ─────────────────────────────────────────────────────────────────

  const resetLotusHarbor = useCallback(() => {
    setState(createDefaultLoState());
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(LO_SAVE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  // ─── Computed Values ───────────────────────────────────────────────────────

  const currentTitleDef = useMemo(() => {
    return LO_TITLES.find(t => t.id === state.loCurrentTitle) ?? LO_TITLES[0];
  }, [state.loCurrentTitle]);

  const nextTitleDef = useMemo(() => {
    const nextTitles = LO_TITLES.filter(t => t.requiredLevel > state.loLevel);
    return nextTitles.length > 0 ? nextTitles[0] : null;
  }, [state.loLevel]);

  const activeEventDef = useMemo(() => {
    if (!state.loActiveEvent) return null;
    return LO_EVENTS.find(e => e.id === state.loActiveEvent) ?? null;
  }, [state.loActiveEvent]);

  const eventTimeRemaining = useMemo(() => {
    if (!state.loActiveEventEndsAt) return null;
    const remaining = state.loActiveEventEndsAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }, [state.loActiveEventEndsAt]);

  const unlockedChambers = useMemo(() => {
    return LO_CHAMBERS.filter(ch => state.loChambers[ch.id]?.discovered);
  }, [state.loChambers]);

  const lockedChambers = useMemo(() => {
    return LO_CHAMBERS.filter(ch => !state.loChambers[ch.id]?.discovered);
  }, [state.loChambers]);

  const recruitEligibleCreatures = useMemo(() => {
    return LO_CREATURES.filter(c => c.requiredLevel <= state.loLevel);
  }, [state.loLevel]);

  const structureSummary = useMemo(() => {
    return LO_STRUCTURES.map(def => {
      const sState = state.loStructures[def.id];
      return {
        ...def,
        currentLevel: sState?.level ?? 0,
        isBuilt: !!sState,
        upgradeCost: sState ? def.baseCost + def.costPerLevel * sState.level : def.baseCost,
        canUpgrade: sState ? sState.level < def.maxLevel && state.loLevel >= def.requiredLevel : state.loLevel >= def.requiredLevel,
      };
    });
  }, [state.loStructures, state.loLevel]);

  const abilitySummary = useMemo(() => {
    return LO_ABILITIES.map(def => {
      const aState = state.loAbilities[def.id];
      return {
        ...def,
        isUnlocked: aState?.unlocked ?? false,
        totalUses: aState?.totalUses ?? 0,
        lastUsedAt: aState?.lastUsedAt ?? 0,
        canUse: (aState?.unlocked ?? false) && state.loLevel >= def.requiredLevel && state.loXp >= def.xpCost && state.loTotalCoins >= def.coinCost,
        canUnlock: !aState?.unlocked && state.loTotalCoins >= def.unlockCost && state.loLevel >= def.requiredLevel,
      };
    });
  }, [state.loAbilities, state.loLevel, state.loXp, state.loTotalCoins]);

  const achievementSummary = useMemo(() => {
    return LO_ACHIEVEMENTS.map(def => {
      const aState = state.loAchievements[def.id];
      return {
        ...def,
        isUnlocked: aState?.unlocked ?? false,
        currentValue: aState?.currentValue ?? 0,
        progress: aState ? Math.min(1, (aState.currentValue ?? 0) / def.targetValue) : 0,
      };
    });
  }, [state.loAchievements]);

  const sailorDetails = useMemo(() => {
    return state.loSailors.map(sailor => {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      const speciesDef = def ? loGetSpeciesDef(def.species) : null;
      const rarityDef = def ? loGetRarityDef(def.rarity) : null;
      return {
        ...sailor,
        creatureDef: def,
        speciesDef,
        rarityDef,
        rarityColor: rarityDef?.color ?? '#9CA3AF',
      };
    });
  }, [state.loSailors]);

  const sailorsBySpecies = useMemo(() => {
    const groups: Record<string, typeof sailorDetails> = {};
    for (const s of sailorDetails) {
      const species = s.creatureDef?.species ?? 'unknown';
      if (!groups[species]) groups[species] = [];
      groups[species].push(s);
    }
    return groups;
  }, [sailorDetails]);

  const sailorsByRarity = useMemo(() => {
    const groups: Record<string, typeof sailorDetails> = {};
    for (const s of sailorDetails) {
      const rarity = s.creatureDef?.rarity ?? 'common';
      if (!groups[rarity]) groups[rarity] = [];
      groups[rarity].push(s);
    }
    return groups;
  }, [sailorDetails]);

  const totalSailorPower = useMemo(() => {
    return sailorDetails.reduce((sum, s) => sum + (s.creatureDef?.power ?? 0), 0);
  }, [sailorDetails]);

  const totalSailorWisdom = useMemo(() => {
    return sailorDetails.reduce((sum, s) => sum + (s.creatureDef?.wisdom ?? 0), 0);
  }, [sailorDetails]);

  const totalSailorTradeSkill = useMemo(() => {
    return sailorDetails.reduce((sum, s) => sum + (s.creatureDef?.tradeSkill ?? 0), 0);
  }, [sailorDetails]);

  const inventorySummary = useMemo(() => {
    return state.loInventory.map(item => {
      const matDef = LO_MATERIALS.find(m => m.id === item.materialId);
      return {
        ...item,
        materialDef: matDef,
        totalValue: (matDef?.baseValue ?? 0) * item.quantity,
        rarityColor: matDef ? LO_RARITY_COLORS[matDef.rarity] : '#9CA3AF',
      };
    });
  }, [state.loInventory]);

  const totalInventoryValue = useMemo(() => {
    return inventorySummary.reduce((sum, item) => sum + item.totalValue, 0);
  }, [inventorySummary]);

  const materialsByCategory = useMemo(() => {
    const groups: Record<string, typeof inventorySummary> = {};
    for (const item of inventorySummary) {
      const cat = item.materialDef?.category ?? 'unknown';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    }
    return groups;
  }, [inventorySummary]);

  const xpProgress = useMemo(() => {
    if (state.loMaxXp === Infinity) return 1;
    return state.loMaxXp > 0 ? state.loXp / state.loMaxXp : 0;
  }, [state.loXp, state.loMaxXp]);

  const xpToNextLevel = useMemo(() => {
    if (state.loMaxXp === Infinity) return 0;
    return Math.max(0, state.loMaxXp - state.loXp);
  }, [state.loXp, state.loMaxXp]);

  const sailorCapacityUsed = useMemo(() => {
    return state.loSailors.length;
  }, [state.loSailors]);

  const sailorCapacityMax = useMemo(() => {
    return LO_MAX_SAILORS;
  }, []);

  const discoveredCount = useMemo(() => {
    return LO_CHAMBERS.filter(ch => state.loChambers[ch.id]?.discovered).length;
  }, [state.loChambers]);

  const totalChamberVisits = useMemo(() => {
    return Object.values(state.loChambers).reduce((sum, ch) => sum + (ch?.visits ?? 0), 0);
  }, [state.loChambers]);

  const unlockedAchievementCount = useMemo(() => {
    return Object.values(state.loAchievements).filter(a => a.unlocked).length;
  }, [state.loAchievements]);

  const activatedArtifactCount = useMemo(() => {
    return Object.values(state.loArtifacts).filter(a => a.activated).length;
  }, [state.loArtifacts]);

  const builtStructureCount = useMemo(() => {
    return Object.values(state.loStructures).filter(s => s).length;
  }, [state.loStructures]);

  const totalStructureBonus = useMemo(() => {
    let total = 0;
    for (const structId of Object.keys(state.loStructures)) {
      const def = LO_STRUCTURES.find(st => st.id === structId);
      const sState = state.loStructures[structId];
      if (def && sState) {
        total += def.bonusValue * sState.level;
      }
    }
    return total;
  }, [state.loStructures]);

  const harborPowerRating = useMemo(() => {
    return totalSailorPower + totalStructureBonus * 2 + state.loLevel * 5;
  }, [totalSailorPower, totalStructureBonus, state.loLevel]);

  const harborTradeRating = useMemo(() => {
    return totalSailorTradeSkill + totalStructureBonus + state.loLevel * 3;
  }, [totalSailorTradeSkill, totalStructureBonus, state.loLevel]);

  const recentEventLog = useMemo(() => {
    return [...state.loEventLog].reverse().slice(0, 10);
  }, [state.loEventLog]);

  const activeEventMultiplier = useMemo(() => {
    if (!activeEventDef) return { xp: 1.0, coins: 1.0 };
    return { xp: activeEventDef.xpMultiplier, coins: activeEventDef.coinMultiplier };
  }, [activeEventDef]);

  const creatureRarityDistribution = useMemo(() => {
    const dist: Record<string, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    for (const sailor of state.loSailors) {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      if (def) dist[def.rarity]++;
    }
    return dist;
  }, [state.loSailors]);

  const speciesDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const species of LO_SPECIES) {
      dist[species.id] = 0;
    }
    for (const sailor of state.loSailors) {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      if (def) dist[def.species]++;
    }
    return dist;
  }, [state.loSailors]);

  const availableEvents = useMemo(() => {
    return LO_EVENTS.filter(e => e.id !== state.loActiveEvent);
  }, [state.loActiveEvent]);

  const unlockedLore = useMemo(() => {
    return LO_LORE.filter(entry => entry.unlockLevel <= state.loLevel);
  }, [state.loLevel]);

  const availableTradeRoutes = useMemo(() => {
    return LO_TRADE_ROUTES.filter(route => {
      const chamber = state.loChambers[route.origin];
      if (!chamber?.discovered) return false;
      return state.loSailors.length >= route.requiredSailors;
    });
  }, [state.loChambers, state.loSailors]);

  const chamberProgression = useMemo(() => {
    return LO_CHAMBERS.map(ch => {
      const chState = state.loChambers[ch.id];
      return {
        ...ch,
        isDiscovered: chState?.discovered ?? false,
        visits: chState?.visits ?? 0,
        totalXpGained: chState?.totalXpGained ?? 0,
        totalCoinsGained: chState?.totalCoinsGained ?? 0,
        lastVisitAt: chState?.lastVisitAt ?? null,
        unlockable: !chState?.discovered && state.loLevel >= ch.unlockLevel && state.loTotalCoins >= ch.unlockCost,
      };
    });
  }, [state.loChambers, state.loLevel, state.loTotalCoins]);

  const totalUpkeepCost = useMemo(() => {
    return state.loSailors.reduce((sum, sailor) => {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      return sum + (def?.upkeepCost ?? 0);
    }, 0);
  }, [state.loSailors]);

  const netIncomePerDay = useMemo(() => {
    let income = 0;
    for (const structId of Object.keys(state.loStructures)) {
      const def = LO_STRUCTURES.find(st => st.id === structId);
      const sState = state.loStructures[structId];
      if (def && sState) {
        if (def.bonusType === 'coin_bonus') income += def.bonusValue * sState.level;
      }
    }
    return income - totalUpkeepCost;
  }, [state.loStructures, totalUpkeepCost]);

  const strongestSailor = useMemo(() => {
    if (state.loSailors.length === 0) return null;
    return sailorDetails.reduce((best, sailor) => {
      const power = sailor.creatureDef?.power ?? 0;
      const bestPower = best.creatureDef?.power ?? 0;
      return power > bestPower ? sailor : best;
    });
  }, [sailorDetails]);

  const wisestSailor = useMemo(() => {
    if (state.loSailors.length === 0) return null;
    return sailorDetails.reduce((best, sailor) => {
      const wisdom = sailor.creatureDef?.wisdom ?? 0;
      const bestWisdom = best.creatureDef?.wisdom ?? 0;
      return wisdom > bestWisdom ? sailor : best;
    });
  }, [sailorDetails]);

  const bestTraderSailor = useMemo(() => {
    if (state.loSailors.length === 0) return null;
    return sailorDetails.reduce((best, sailor) => {
      const trade = sailor.creatureDef?.tradeSkill ?? 0;
      const bestTrade = best.creatureDef?.tradeSkill ?? 0;
      return trade > bestTrade ? sailor : best;
    });
  }, [sailorDetails]);

  const sailorsForChamber = useCallback((chamberId: string) => {
    const chamberDef = LO_CHAMBERS.find(c => c.id === chamberId);
    if (!chamberDef) return [];
    const bonusSpecies = LO_SPECIES.filter(sp => {
      return (sp.explorationAffinity + sp.tradeAffinity) / 2 >= 0.7;
    }).map(sp => sp.id);
    return state.loSailors.filter(sailor => {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      return def && bonusSpecies.includes(def.species);
    });
  }, [state.loSailors]);

  const hasLegendarySailor = useMemo(() => {
    return state.loSailors.some(sailor => {
      const def = LO_CREATURES.find(c => c.id === sailor.creatureId);
      return def?.rarity === 'legendary';
    });
  }, [state.loSailors]);

  const getCreatureDef = useCallback((creatureId: string) => {
    return LO_CREATURES.find(c => c.id === creatureId) ?? null;
  }, []);

  const getChamberDef = useCallback((chamberId: string) => {
    return LO_CHAMBERS.find(c => c.id === chamberId) ?? null;
  }, []);

  const getMaterialDef = useCallback((materialId: string) => {
    return LO_MATERIALS.find(m => m.id === materialId) ?? null;
  }, []);

  const getStructureDef = useCallback((structureId: string) => {
    return LO_STRUCTURES.find(s => s.id === structureId) ?? null;
  }, []);

  const getAbilityDef = useCallback((abilityId: string) => {
    return LO_ABILITIES.find(a => a.id === abilityId) ?? null;
  }, []);

  const getArtifactDef = useCallback((artifactId: string) => {
    return LO_ARTIFACTS.find(a => a.id === artifactId) ?? null;
  }, []);

  const getNpcForChamber = useCallback((chamberId: string) => {
    return LO_NPCS.filter(n => n.harborDistrict === chamberId);
  }, []);

  const getLoreEntry = useCallback((loreId: string) => {
    return LO_LORE.find(l => l.id === loreId) ?? null;
  }, []);

  const getTradeRoute = useCallback((routeId: string) => {
    return LO_TRADE_ROUTES.find(r => r.id === routeId) ?? null;
  }, []);

  // ─── Return ─────────────────────────────────────────────────────────────────

  return {
    state,
    // Actions
    recruitSailor,
    exploreDistrict,
    discoverDistrict,
    buildStructure,
    activateArtifact,
    useAbility,
    triggerHarborEvent,
    checkEventExpiry,
    checkAndClaimAchievements,
    resetLotusHarbor,
    addXp,
    addCoins,
    // Lookup helpers
    getCreatureDef,
    getChamberDef,
    getMaterialDef,
    getStructureDef,
    getAbilityDef,
    getArtifactDef,
    getNpcForChamber,
    getLoreEntry,
    getTradeRoute,
    // Computed
    currentTitleDef,
    nextTitleDef,
    activeEventDef,
    eventTimeRemaining,
    unlockedChambers,
    lockedChambers,
    recruitEligibleCreatures,
    structureSummary,
    abilitySummary,
    achievementSummary,
    sailorDetails,
    sailorsBySpecies,
    sailorsByRarity,
    totalSailorPower,
    totalSailorWisdom,
    totalSailorTradeSkill,
    inventorySummary,
    totalInventoryValue,
    materialsByCategory,
    xpProgress,
    xpToNextLevel,
    sailorCapacityUsed,
    sailorCapacityMax,
    discoveredCount,
    totalChamberVisits,
    unlockedAchievementCount,
    activatedArtifactCount,
    builtStructureCount,
    totalStructureBonus,
    harborPowerRating,
    harborTradeRating,
    recentEventLog,
    activeEventMultiplier,
    creatureRarityDistribution,
    speciesDistribution,
    availableEvents,
    unlockedLore,
    availableTradeRoutes,
    chamberProgression,
    totalUpkeepCost,
    netIncomePerDay,
    strongestSailor,
    wisestSailor,
    bestTraderSailor,
    sailorsForChamber,
    hasLegendarySailor,
    // Constants (re-exported for convenience)
    LO_LOTUS_PINK,
    LO_JADE_GREEN,
    LO_PEARL_WHITE,
    LO_SILK_GOLD,
    LO_WATER_BLUE,
    LO_BAMBOO_GREEN,
    LO_SUNSET_RED,
    LO_RARITY_COLORS,
    LO_SPECIES_COLORS,
    LO_THEME_COLORS,
    LO_RARITIES,
    LO_SPECIES,
    LO_CREATURES,
    LO_CHAMBERS,
    LO_MATERIALS,
    LO_STRUCTURES,
    LO_ABILITIES,
    LO_ACHIEVEMENTS,
    LO_TITLES,
    LO_ARTIFACTS,
    LO_EVENTS,
    LO_MAX_LEVEL,
    LO_SAVE_KEY,
  };
}
