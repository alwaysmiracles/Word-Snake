// =============================================================================
// Jungle Navigator Wire — Exploration & Navigation Module for Word Snake Game
// =============================================================================
// SSR-safe: no localStorage / window / document / setInterval /
//           addEventListener / Math.random
// All exports prefixed jn—, constants JN_—. Seeded PRNG throughout.
// =============================================================================

import { useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// 1. TYPES
// ---------------------------------------------------------------------------

export type JNRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface JNRegion {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly terrain: string;
  readonly requiredLevel: number;
  readonly dangerLevel: number;
  readonly rewards: JNRewardPool;
  readonly wildlifeIds: string[];
  readonly connections: string[];
}

export interface JNTerrain {
  readonly id: string;
  readonly name: string;
  readonly speedModifier: number;
  readonly stealthModifier: number;
  readonly hazardChance: number;
  readonly description: string;
  readonly color: string;
}

export interface JNWildlifeSpecies {
  readonly id: string;
  readonly name: string;
  readonly scientificName: string;
  readonly rarity: JNRarity;
  readonly habitat: string[];
  readonly dangerLevel: number;
  readonly description: string;
  readonly xpReward: number;
  readonly coinReward: number;
}

export interface JNEquipmentItem {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly type: "weapon" | "tool" | "armor" | "accessory" | "consumable";
  readonly stats: JNEquipmentStats;
  readonly requiredLevel: number;
  readonly rarity: JNRarity;
  readonly maxStack: number;
}

export interface JNEquipmentStats {
  attack: number;
  defense: number;
  speed: number;
  stealth: number;
  luck: number;
  survival: number;
}

export interface JNCamp {
  readonly id: string;
  readonly name: string;
  readonly regionId: string;
  readonly baseCapacity: number;
  readonly upgradeCost: number;
  readonly description: string;
  readonly amenities: string[];
}

export interface JNRuin {
  readonly id: string;
  readonly name: string;
  readonly regionId: string;
  readonly description: string;
  readonly depth: number;
  readonly trapsCount: number;
  readonly treasurePool: JNRewardPool;
  readonly loreFragments: string[];
  readonly requiredEquipment: string[];
  readonly difficulty: number;
}

export interface JNQuest {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: "explore" | "collect" | "defeat" | "escort" | "mystery";
  readonly requirements: Record<string, number>;
  readonly xpReward: number;
  readonly coinReward: number;
  readonly itemReward?: string;
  readonly requiredLevel: number;
  readonly regionId?: string;
}

export interface JNNpc {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly specialty: string;
  readonly hireCost: number;
  readonly bonusType: string;
  readonly bonusValue: number;
  readonly description: string;
  readonly dialogues: string[];
}

export interface JNAchievement {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly category: "exploration" | "combat" | "collection" | "social" | "mastery";
  readonly condition: string;
  readonly threshold: number;
  readonly xpReward: number;
  readonly coinReward: number;
  readonly icon: string;
}

export interface JNWeatherHazard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly speedPenalty: number;
  readonly damagePerTick: number;
  readonly avoidanceChance: number;
  readonly duration: number;
  readonly severity: "mild" | "moderate" | "severe" | "extreme";
}

export interface JNTitleThreshold {
  readonly name: string;
  readonly requiredLevel: number;
  readonly description: string;
}

export interface JNRewardPool {
  readonly xpMin: number;
  readonly xpMax: number;
  readonly coinMin: number;
  readonly coinMax: number;
  readonly itemChance: number;
  readonly possibleItems: string[];
}

export interface JNDailyTask {
  readonly id: string;
  readonly description: string;
  readonly target: number;
  readonly progress: number;
  readonly xpReward: number;
  readonly coinReward: number;
  readonly completed: boolean;
  readonly claimed: boolean;
}

export interface JNTreasureEntry {
  readonly id: string;
  readonly regionId: string;
  readonly name: string;
  readonly value: number;
  readonly rarity: JNRarity;
  readonly foundAt: number;
  readonly description: string;
}

export interface JNExplorationLog {
  readonly regionId: string;
  readonly timestamp: number;
  readonly xpGained: number;
  readonly coinsGained: number;
  readonly wildlifeObserved: string[];
  readonly events: string[];
}

export interface JNEncounter {
  readonly id: string;
  readonly type: "wildlife" | "trap" | "weather" | "npc" | "treasure" | "ruin";
  readonly name: string;
  readonly description: string;
  readonly difficulty: number;
  readonly resolved: boolean;
  readonly outcome: string;
  readonly rewards: JNRewardPool;
}

// ---------------------------------------------------------------------------
// 2. CONSTANTS
// ---------------------------------------------------------------------------

export const JN_MAX_LEVEL = 45;

export const JN_TITLE_THRESHOLDS: readonly JNTitleThreshold[] = [
  { name: "Explorer", requiredLevel: 1, description: "A fresh face in the jungle" },
  { name: "Pathfinder", requiredLevel: 6, description: "Navigating through dense undergrowth" },
  { name: "Trailblazer", requiredLevel: 11, description: "Clearing paths where none existed" },
  { name: "Scout", requiredLevel: 16, description: "Eyes sharp, ears keen" },
  { name: "Ranger", requiredLevel: 21, description: "Guardian of the wild" },
  { name: "Expedition Leader", requiredLevel: 26, description: "Commanding deep jungle sorties" },
  { name: "Jungle Master", requiredLevel: 31, description: "The jungle bends to your will" },
  { name: "Jungle Legend", requiredLevel: 36, description: "Your name is whispered in every canopy" },
] as const;

export const JN_TERRAINS: readonly JNTerrain[] = [
  { id: "dense_forest", name: "Dense Forest", speedModifier: 0.6, stealthModifier: 0.8, hazardChance: 0.25, description: "Thick canopy blocks most light", color: "#1a4d1a" },
  { id: "swamp", name: "Muddy Swamp", speedModifier: 0.4, stealthModifier: 0.5, hazardChance: 0.4, description: "Treacherous ground and hidden pools", color: "#3d5c1e" },
  { id: "riverbank", name: "Riverbank", speedModifier: 0.7, stealthModifier: 0.6, hazardChance: 0.2, description: "Fast-flowing waters carve the landscape", color: "#1a6b4d" },
  { id: "cliff_face", name: "Cliff Face", speedModifier: 0.3, stealthModifier: 0.9, hazardChance: 0.35, description: "Sheer drops and narrow ledges", color: "#6b5b1a" },
  { id: "bamboo_grove", name: "Bamboo Grove", speedModifier: 0.8, stealthModifier: 0.4, hazardChance: 0.15, description: "Towering stalks sway and creak", color: "#4d7a1a" },
  { id: "volcanic_ash", name: "Volcanic Ash", speedModifier: 0.5, stealthModifier: 0.7, hazardChance: 0.3, description: "Scorched earth and sulfur vents", color: "#5c3d1a" },
  { id: "underground_cave", name: "Underground Cave", speedModifier: 0.5, stealthModifier: 0.95, hazardChance: 0.3, description: "Dark passages and bioluminescence", color: "#2d2d4d" },
  { id: "canopy_walk", name: "Canopy Walk", speedModifier: 0.9, stealthModifier: 0.3, hazardChance: 0.2, description: "Bridges of vine and wood high above", color: "#3d8c3d" },
] as const;

export const JN_WILDLIFE: readonly JNWildlifeSpecies[] = [
  { id: "emerald_parrot", name: "Emerald Parrot", scientificName: "Ara viridis", rarity: "common", habitat: ["canopy_village", "misty_highlands"], dangerLevel: 1, description: "Brilliant green feathers flash through the canopy", xpReward: 10, coinReward: 5 },
  { id: "golden_frog", name: "Golden Poison Frog", scientificName: "Phyllobates auratus", rarity: "uncommon", habitat: ["poisoned_marches", "crystal_lagoon"], dangerLevel: 3, description: "Tiny but deadly, its skin glistens like molten gold", xpReward: 25, coinReward: 15 },
  { id: "shadow_jaguar", name: "Shadow Jaguar", scientificName: "Panthera umbra", rarity: "rare", habitat: ["lost_temple", "whispering_jungle"], dangerLevel: 5, description: "Moves like liquid darkness between ancient trees", xpReward: 60, coinReward: 40 },
  { id: "vine_serpent", name: "Vine Serpent", scientificName: "Serpentes viridis", rarity: "common", habitat: ["vine_labyrinth", "ancient_grove"], dangerLevel: 2, description: "Nearly invisible among the hanging vines", xpReward: 12, coinReward: 8 },
  { id: "crystal_moth", name: "Crystal Moth", scientificName: "Lepidoptera crystallis", rarity: "rare", habitat: ["crystal_lagoon", "fungal_forest"], dangerLevel: 1, description: "Wings refract light into rainbow patterns", xpReward: 50, coinReward: 30 },
  { id: "river_dragon", name: "River Dragon", scientificName: "Draco flumenis", rarity: "legendary", habitat: ["crocodile_creek", "river_delta"], dangerLevel: 7, description: "An ancient semi-aquatic reptile of immense power", xpReward: 150, coinReward: 100 },
  { id: "howler_monkey", name: "Howler Monkey", scientificName: "Alouatta caraya", rarity: "common", habitat: ["canopy_village", "monkey_rock"], dangerLevel: 2, description: "Their territorial cries echo for miles", xpReward: 15, coinReward: 8 },
  { id: "ghost_owl", name: "Ghost Owl", scientificName: "Bubo phantasma", rarity: "epic", habitat: ["moonlit_clearing", "ancient_grove"], dangerLevel: 4, description: "Silent hunter of the deepest night", xpReward: 80, coinReward: 55 },
  { id: "moss_tortoise", name: "Moss Tortoise", scientificName: "Testudo muscosa", rarity: "common", habitat: ["ancient_grove", "mossy_sanctuary"], dangerLevel: 1, description: "Carries a small ecosystem on its shell", xpReward: 8, coinReward: 4 },
  { id: "jewel_beetle", name: "Jewel Beetle", scientificName: "Buprestis gemma", rarity: "uncommon", habitat: ["lost_temple", "volcanic_ridge"], dangerLevel: 1, description: "Iridescent carapace rivals any gemstone", xpReward: 20, coinReward: 20 },
  { id: "thunder_croc", name: "Thunder Crocodile", scientificName: "Crocodylus tonitrus", rarity: "epic", habitat: ["crocodile_creek", "sunken_ruins"], dangerLevel: 6, description: "Its jaws create a sound like cracking thunder", xpReward: 90, coinReward: 65 },
  { id: "mushroom_sprite", name: "Mushroom Sprite", scientificName: "Fungus spiritus", rarity: "rare", habitat: ["fungal_forest", "mossy_sanctuary"], dangerLevel: 2, description: "Tiny bioluminescent beings living on giant fungi", xpReward: 45, coinReward: 25 },
  { id: "obsidian_spider", name: "Obsidian Spider", scientificName: "Araneus obsidianus", rarity: "uncommon", habitat: ["shadow_ravine", "volcanic_ridge"], dangerLevel: 4, description: "Builds webs from volcanic glass strands", xpReward: 30, coinReward: 20 },
  { id: "sun_butterfly", name: "Sun Butterfly", scientificName: "Papilio solaris", rarity: "common", habitat: ["sunlit_meadow", "crystal_lagoon"], dangerLevel: 0, description: "Wings glow with captured sunlight", xpReward: 10, coinReward: 6 },
  { id: "stone_golem", name: "Stone Golem", scientificName: "Golem petra", rarity: "legendary", habitat: ["ancient_grove", "forbidden_city"], dangerLevel: 8, description: "Ancient guardian animated by forgotten magic", xpReward: 200, coinReward: 150 },
  { id: "mist_walker", name: "Mist Walker", scientificName: "Umbra nebulae", rarity: "epic", habitat: ["misty_highlands", "moonlit_clearing"], dangerLevel: 5, description: "A shape-shifting being that dwells in perpetual fog", xpReward: 85, coinReward: 60 },
  { id: "blue_macaw", name: "Blue Macaw", scientificName: "Ara caerulea", rarity: "common", habitat: ["canopy_village", "sunlit_meadow"], dangerLevel: 1, description: "Striking blue plumage and raucous calls", xpReward: 10, coinReward: 5 },
  { id: "poison_dart_swarm", name: "Poison Dart Swarm", scientificName: "Dendrobatidae grex", rarity: "uncommon", habitat: ["poisoned_marches", "fungal_forest"], dangerLevel: 3, description: "Hundreds of tiny frogs create a deadly carpet", xpReward: 28, coinReward: 18 },
  { id: "fever_vine_snake", name: "Fever Vine Snake", scientificName: "Serpens febris", rarity: "rare", habitat: ["vine_labyrinth", "shadow_ravine"], dangerLevel: 4, description: "Its bite induces a burning fever", xpReward: 55, coinReward: 35 },
  { id: "ancient_scarab", name: "Ancient Scarab", scientificName: "Scarabaeus antiquus", rarity: "rare", habitat: ["lost_temple", "forbidden_city"], dangerLevel: 3, description: "Sacred beetle believed to guard pharaohs' secrets", xpReward: 50, coinReward: 40 },
  { id: "glowing_jellyfish", name: "Glowing Jellyfish", scientificName: "Aurelia luminosa", rarity: "uncommon", habitat: ["crystal_lagoon", "sunken_ruins"], dangerLevel: 2, description: "Bioluminescent tentacles drift in jungle pools", xpReward: 22, coinReward: 15 },
  { id: "wind_eagle", name: "Wind Eagle", scientificName: "Aquila ventus", rarity: "epic", habitat: ["misty_highlands", "eagle_peak"], dangerLevel: 5, description: "Soars on thermal currents above the canopy", xpReward: 75, coinReward: 50 },
  { id: "cave_bat_colony", name: "Cave Bat Colony", scientificName: "Chiroptera spelaea", rarity: "common", habitat: ["underground_cave", "shadow_ravine"], dangerLevel: 2, description: "Thousands of bats fill cavern ceilings", xpReward: 12, coinReward: 7 },
  { id: "wild_boar", name: "Wild Boar", scientificName: "Sus ferus", rarity: "common", habitat: ["sunlit_meadow", "river_delta"], dangerLevel: 3, description: "Short-tempered and surprisingly fast", xpReward: 18, coinReward: 10 },
  { id: "spirit_stag", name: "Spirit Stag", scientificName: "Cervus spiritus", rarity: "legendary", habitat: ["moonlit_clearing", "ancient_grove"], dangerLevel: 3, description: "A translucent deer that appears only under moonlight", xpReward: 160, coinReward: 120 },
  { id: "lava_salamander", name: "Lava Salamander", scientificName: "Salamandra ignis", rarity: "rare", habitat: ["volcanic_ridge", "shadow_ravine"], dangerLevel: 4, description: "Thrives in the hottest volcanic vents", xpReward: 48, coinReward: 32 },
] as const;

export const JN_EQUIPMENT: readonly JNEquipmentItem[] = [
  { id: "machete", name: "Jungle Machete", description: "Essential for cutting through thick vegetation", cost: 50, type: "weapon", stats: { attack: 3, defense: 0, speed: 1, stealth: 0, luck: 0, survival: 2 }, requiredLevel: 1, rarity: "common", maxStack: 1 },
  { id: "leather_boots", name: "Leather Boots", description: "Sturdy boots for treacherous terrain", cost: 40, type: "armor", stats: { attack: 0, defense: 2, speed: 1, stealth: 0, luck: 0, survival: 1 }, requiredLevel: 1, rarity: "common", maxStack: 1 },
  { id: "compass", name: "Explorer's Compass", description: "Always points toward the nearest camp", cost: 80, type: "accessory", stats: { attack: 0, defense: 0, speed: 0, stealth: 0, luck: 2, survival: 1 }, requiredLevel: 1, rarity: "common", maxStack: 1 },
  { id: "binoculars", name: "Tracking Binoculars", description: "Spot wildlife from great distances", cost: 120, type: "tool", stats: { attack: 0, defense: 0, speed: 0, stealth: 2, luck: 2, survival: 0 }, requiredLevel: 3, rarity: "uncommon", maxStack: 1 },
  { id: "antidote_kit", name: "Antidote Kit", description: "Three doses of universal antivenom", cost: 150, type: "consumable", stats: { attack: 0, defense: 1, speed: 0, stealth: 0, luck: 0, survival: 4 }, requiredLevel: 3, rarity: "uncommon", maxStack: 5 },
  { id: "climbing_gear", name: "Climbing Gear", description: "Ropes, pitons, and harness for vertical terrain", cost: 200, type: "tool", stats: { attack: 0, defense: 1, speed: 0, stealth: 0, luck: 0, survival: 3 }, requiredLevel: 5, rarity: "uncommon", maxStack: 1 },
  { id: "blowgun", name: "Hunting Blowgun", description: "Silent ranged weapon with poison darts", cost: 180, type: "weapon", stats: { attack: 5, defense: 0, speed: 1, stealth: 3, luck: 0, survival: 1 }, requiredLevel: 5, rarity: "uncommon", maxStack: 1 },
  { id: "vinesuit", name: "Vinesuit Camouflage", description: "Woven from living vines for perfect concealment", cost: 250, type: "armor", stats: { attack: 0, defense: 1, speed: 0, stealth: 5, luck: 0, survival: 0 }, requiredLevel: 8, rarity: "rare", maxStack: 1 },
  { id: "lucky_charm", name: "Tribal Lucky Charm", description: "Blessed by a village shaman", cost: 300, type: "accessory", stats: { attack: 0, defense: 0, speed: 0, stealth: 0, luck: 6, survival: 1 }, requiredLevel: 8, rarity: "rare", maxStack: 1 },
  { id: "machete_of_ruins", name: "Ancient Machete of Ruins", description: "Unearthed from a forgotten temple", cost: 500, type: "weapon", stats: { attack: 8, defense: 2, speed: 2, stealth: 1, luck: 1, survival: 2 }, requiredLevel: 12, rarity: "rare", maxStack: 1 },
  { id: "expedition_pack", name: "Expedition Backpack", description: "Increases carrying capacity and supplies", cost: 220, type: "accessory", stats: { attack: 0, defense: 1, speed: 0, stealth: 0, luck: 0, survival: 5 }, requiredLevel: 10, rarity: "uncommon", maxStack: 1 },
  { id: "tribal_shield", name: "Tribal War Shield", description: "Decorated with protective glyphs", cost: 350, type: "armor", stats: { attack: 0, defense: 7, speed: -1, stealth: 0, luck: 0, survival: 3 }, requiredLevel: 15, rarity: "epic", maxStack: 1 },
  { id: "spirit_lantern", name: "Spirit Lantern", description: "Guides through darkness and repels phantoms", cost: 450, type: "tool", stats: { attack: 2, defense: 2, speed: 0, stealth: 1, luck: 3, survival: 3 }, requiredLevel: 18, rarity: "epic", maxStack: 1 },
  { id: "phoenix_feather", name: "Phoenix Feather Amulet", description: "Grants one-time resurrection from defeat", cost: 800, type: "accessory", stats: { attack: 3, defense: 3, speed: 2, stealth: 1, luck: 4, survival: 5 }, requiredLevel: 25, rarity: "legendary", maxStack: 1 },
  { id: "obsidian_blade", name: "Obsidian Jagged Blade", description: "Forged from volcanic glass by ancient smiths", cost: 750, type: "weapon", stats: { attack: 12, defense: 1, speed: 3, stealth: 2, luck: 2, survival: 1 }, requiredLevel: 30, rarity: "legendary", maxStack: 1 },
] as const;

export const JN_CAMPS: readonly JNCamp[] = [
  { id: "camp_entry", name: "Gateway Camp", regionId: "canopy_village", baseCapacity: 2, upgradeCost: 100, description: "The starting point for all jungle expeditions", amenities: ["bedroll", "water_source"] },
  { id: "camp_river", name: "Riverside Haven", regionId: "river_delta", baseCapacity: 3, upgradeCost: 150, description: "A peaceful camp along the great river bend", amenities: ["bedroll", "water_source", "fishing_spot"] },
  { id: "camp_temple", name: "Temple Perch", regionId: "lost_temple", baseCapacity: 2, upgradeCost: 200, description: "Perched on a hill overlooking ancient stones", amenities: ["bedroll", "shelter", "lookout"] },
  { id: "camp_cliff", name: "Eagle's Nest", regionId: "eagle_peak", baseCapacity: 1, upgradeCost: 300, description: "A dizzying outpost at the cliff edge", amenities: ["bedroll", "lookout", "signal_fire"] },
  { id: "camp_mossy", name: "Mossy Sanctuary", regionId: "mossy_sanctuary", baseCapacity: 4, upgradeCost: 180, description: "Nestled among ancient moss-covered trees", amenities: ["bedroll", "water_source", "herb_garden", "shelter"] },
  { id: "camp_volcano", name: "Ash Pit Station", regionId: "volcanic_ridge", baseCapacity: 2, upgradeCost: 350, description: "Built from volcanic rock near thermal vents", amenities: ["bedroll", "heat_source", "shelter"] },
  { id: "camp_underground", name: "Crystal Cavern", regionId: "underground_cave", baseCapacity: 3, upgradeCost: 400, description: "An illuminated cave with bioluminescent fungi", amenities: ["bedroll", "water_source", "shelter", "gem_workshop"] },
  { id: "camp_forbidden", name: "Last Outpost", regionId: "forbidden_city", baseCapacity: 2, upgradeCost: 500, description: "The final camp before the deepest jungle", amenities: ["bedroll", "shelter", "arsenal", "signal_fire"] },
] as const;

export const JN_RUINS: readonly JNRuin[] = [
  { id: "ruin_serpent_temple", name: "Temple of the Serpent", regionId: "lost_temple", description: "An ancient temple devoted to a serpent deity, its walls covered in scaled carvings", depth: 3, trapsCount: 5, treasurePool: { xpMin: 100, xpMax: 200, coinMin: 80, coinMax: 160, itemChance: 0.3, possibleItems: ["ancient_scarab", "tribal_shield"] }, loreFragments: ["The serpent once guarded the boundary between worlds", "Its eyes were made of emerald and starlight"], requiredEquipment: ["machete", "compass"], difficulty: 4 },
  { id: "ruin_sun_altar", name: "Sun Altar Ruins", regionId: "sunlit_meadow", description: "Circular stone altar that once tracked celestial movements", depth: 1, trapsCount: 2, treasurePool: { xpMin: 60, xpMax: 120, coinMin: 40, coinMax: 80, itemChance: 0.25, possibleItems: ["lucky_charm", "compass"] }, loreFragments: ["The altar aligned with solstices to predict harvests", "Gold offerings were buried beneath the central stone"], requiredEquipment: [], difficulty: 2 },
  { id: "ruin_flooded_vault", name: "Flooded Vault", regionId: "sunken_ruins", description: "A partially submerged treasure vault beneath the river delta", depth: 4, trapsCount: 6, treasurePool: { xpMin: 150, xpMax: 300, coinMin: 120, coinMax: 240, itemChance: 0.35, possibleItems: ["ancient_scarab", "phoenix_feather"] }, loreFragments: ["The vault was sealed when the river changed course", "Its builders worshipped the river dragon"], requiredEquipment: ["climbing_gear", "antidote_kit"], difficulty: 6 },
  { id: "ruin_fungal_chamber", name: "Fungal Chamber", regionId: "fungal_forest", description: "A cavern overgrown with sentient fungal colonies", depth: 2, trapsCount: 3, treasurePool: { xpMin: 80, xpMax: 160, coinMin: 50, coinMax: 100, itemChance: 0.3, possibleItems: ["spirit_lantern", "antidote_kit"] }, loreFragments: ["The fungi are connected by an underground network", "They remember everything that enters the chamber"], requiredEquipment: ["spirit_lantern"], difficulty: 3 },
  { id: "ruin_obsidian_forge", name: "Obsidian Forge", regionId: "volcanic_ridge", description: "An ancient blacksmith's workshop built inside a dormant vent", depth: 3, trapsCount: 4, treasurePool: { xpMin: 120, xpMax: 240, coinMin: 90, coinMax: 180, itemChance: 0.4, possibleItems: ["obsidian_blade", "machete_of_ruins"] }, loreFragments: ["The forge was used to craft weapons for gods", "Its fires burned for a thousand years without fuel"], requiredEquipment: ["machete", "climbing_gear"], difficulty: 5 },
  { id: "ruin_moon_shrine", name: "Moonlit Shrine", regionId: "moonlit_clearing", description: "A delicate shrine that only reveals its secrets under moonlight", depth: 1, trapsCount: 2, treasurePool: { xpMin: 100, xpMax: 180, coinMin: 70, coinMax: 130, itemChance: 0.35, possibleItems: ["spirit_lantern", "lucky_charm", "phoenix_feather"] }, loreFragments: ["The shrine honours the spirit stag", "Moonbeams activate hidden mechanisms in the stone"], requiredEquipment: ["spirit_lantern"], difficulty: 4 },
  { id: "ruin_deep_catacombs", name: "Deep Catacombs", regionId: "shadow_ravine", description: "Vast underground burial chambers stretching for miles", depth: 5, trapsCount: 8, treasurePool: { xpMin: 200, xpMax: 400, coinMin: 150, coinMax: 300, itemChance: 0.4, possibleItems: ["tribal_shield", "obsidian_blade", "phoenix_feather"] }, loreFragments: ["The catacombs hold the remains of a lost civilization", "Some say the dead still walk these halls"], requiredEquipment: ["climbing_gear", "spirit_lantern", "machete"], difficulty: 7 },
  { id: "ruin_jade_palace", name: "Jade Palace", regionId: "forbidden_city", description: "The legendary palace at the jungle's heart, encrusted with jade", depth: 6, trapsCount: 10, treasurePool: { xpMin: 300, xpMax: 500, coinMin: 250, coinMax: 450, itemChance: 0.5, possibleItems: ["obsidian_blade", "phoenix_feather", "machete_of_ruins"] }, loreFragments: ["The palace was built by the first jungle civilization", "Its jade walls hold the collective memory of the forest"], requiredEquipment: ["machete_of_ruins", "spirit_lantern", "climbing_gear", "tribal_shield"], difficulty: 9 },
] as const;

export const JN_QUESTS: readonly JNQuest[] = [
  { id: "quest_first_steps", name: "First Steps", description: "Explore your first jungle region", type: "explore", requirements: { regions_explored: 1 }, xpReward: 50, coinReward: 30, requiredLevel: 1 },
  { id: "quest_wildlife_observer", name: "Wildlife Watcher", description: "Observe 10 different wildlife species", type: "collect", requirements: { wildlife_observed: 10 }, xpReward: 200, coinReward: 100, itemReward: "binoculars", requiredLevel: 3 },
  { id: "quest_temple_explorer", name: "Temple Bound", description: "Explore the Lost Temple region", type: "explore", requirements: { region_explored_lost_temple: 1 }, xpReward: 150, coinReward: 80, requiredLevel: 5, regionId: "lost_temple" },
  { id: "quest_ruin_raider", name: "Ruin Raider", description: "Excavate 3 different ruins", type: "collect", requirements: { ruins_excavated: 3 }, xpReward: 300, coinReward: 200, itemReward: "climbing_gear", requiredLevel: 8 },
  { id: "quest_equipment_master", name: "Well Equipped", description: "Own at least 8 different equipment items", type: "collect", requirements: { equipment_owned: 8 }, xpReward: 250, coinReward: 150, requiredLevel: 10 },
  { id: "quest_deep_explorer", name: "Into the Depths", description: "Excavate a ruin with difficulty 5 or higher", type: "explore", requirements: { high_difficulty_ruin: 1 }, xpReward: 400, coinReward: 250, requiredLevel: 12 },
  { id: "quest_treasure_hunter", name: "Treasure Seeker", description: "Find 5 treasures across the jungle", type: "collect", requirements: { treasures_found: 5 }, xpReward: 350, coinReward: 200, itemReward: "lucky_charm", requiredLevel: 15 },
  { id: "quest_legendary_sightings", name: "Legendary Encounters", description: "Observe 3 legendary wildlife species", type: "collect", requirements: { legendary_wildlife: 3 }, xpReward: 500, coinReward: 400, requiredLevel: 20 },
  { id: "quest_camp_builder", name: "Camp Network", description: "Set up camps in 5 different regions", type: "explore", requirements: { camps_setup: 5 }, xpReward: 300, coinReward: 180, requiredLevel: 7 },
  { id: "quest_achiever", name: "Jungle Achiever", description: "Unlock 10 achievements", type: "mystery", requirements: { achievements_unlocked: 10 }, xpReward: 600, coinReward: 500, requiredLevel: 25 },
] as const;

export const JN_NPCS: readonly JNNpc[] = [
  { id: "npc_kaia", name: "Kaia", title: "The Pathfinder", specialty: "navigation", hireCost: 100, bonusType: "speed", bonusValue: 0.15, description: "Born in the canopy, she knows every trail", dialogues: ["The trees speak if you listen.", "Trust the moss—it grows on the north side."] },
  { id: "npc_rongo", name: "Rongo", title: "The Tracker", specialty: "wildlife", hireCost: 120, bonusType: "luck", bonusValue: 0.2, description: "Reads tracks like a book", dialogues: ["That print? Three hours old, male, well-fed.", "Every creature leaves a story in the mud."] },
  { id: "npc_zephyr", name: "Zephyr", title: "The Storm Reader", specialty: "weather", hireCost: 90, bonusType: "survival", bonusValue: 0.15, description: "Senses storms before the first cloud forms", dialogues: ["Wind's changing. Find shelter soon.", "The sky tells me we have two hours."] },
  { id: "npc_mara", name: "Mara", title: "The Herbalist", specialty: "healing", hireCost: 110, bonusType: "defense", bonusValue: 0.2, description: "Every plant is a remedy to her", dialogues: ["This root cures fever, that one causes it.", "Nature provides if you know where to look."] },
  { id: "npc_talon", name: "Talon", title: "The Hunter", specialty: "combat", hireCost: 150, bonusType: "attack", bonusValue: 0.2, description: "The most skilled warrior in five villages", dialogues: ["Strike fast, think faster.", "The best fight is the one you avoid."] },
  { id: "npc_sage_iris", name: "Iris", title: "The Lore Keeper", specialty: "ruins", hireCost: 200, bonusType: "luck", bonusValue: 0.25, description: "Deciphers ancient texts in forgotten languages", dialogues: ["These glyphs tell of a great flood.", "The ancients left warnings—ignore them at your peril."] },
  { id: "npc_bramble", name: "Bramble", title: "The Shadow", specialty: "stealth", hireCost: 130, bonusType: "stealth", bonusValue: 0.25, description: "Moves through the jungle like a whisper", dialogues: ["Silence is the strongest weapon.", "The shadows hide more than darkness."] },
  { id: "npc_grandpa_koa", name: "Grandpa Koa", title: "The Elder", specialty: "overall", hireCost: 300, bonusType: "speed", bonusValue: 0.1, description: "Seventy years of jungle wisdom in one person", dialogues: ["Patience, young one. The jungle teaches those who wait.", "I have seen this path change a hundred times."] },
] as const;

export const JN_ACHIEVEMENTS: readonly JNAchievement[] = [
  { id: "ach_first_exploration", name: "First Footfall", description: "Explore your first jungle region", category: "exploration", condition: "regions_explored", threshold: 1, xpReward: 25, coinReward: 15, icon: "🦶" },
  { id: "ach_region_5", name: "Jungle Traveller", description: "Explore 5 different regions", category: "exploration", condition: "regions_explored", threshold: 5, xpReward: 150, coinReward: 80, icon: "🗺️" },
  { id: "ach_region_10", name: "Cartographer", description: "Explore 10 different regions", category: "exploration", condition: "regions_explored", threshold: 10, xpReward: 400, coinReward: 200, icon: "🌍" },
  { id: "ach_region_all", name: "Full Map", description: "Explore all 20 jungle regions", category: "exploration", condition: "regions_explored", threshold: 20, xpReward: 1000, coinReward: 500, icon: "🏆" },
  { id: "ach_wildlife_5", name: "Naturalist", description: "Observe 5 wildlife species", category: "collection", condition: "wildlife_observed", threshold: 5, xpReward: 80, coinReward: 40, icon: "🦎" },
  { id: "ach_wildlife_15", name: "Wildlife Expert", description: "Observe 15 wildlife species", category: "collection", condition: "wildlife_observed", threshold: 15, xpReward: 300, coinReward: 150, icon: "🦜" },
  { id: "ach_wildlife_all", name: "Complete Bestiary", description: "Observe all 25 wildlife species", category: "collection", condition: "wildlife_observed", threshold: 25, xpReward: 800, coinReward: 400, icon: "📖" },
  { id: "ach_equipment_5", name: "Gear Up", description: "Own 5 equipment items", category: "collection", condition: "equipment_owned", threshold: 5, xpReward: 100, coinReward: 50, icon: "🎒" },
  { id: "ach_equipment_legendary", name: "Legendary Gear", description: "Own a legendary equipment item", category: "collection", condition: "legendary_equipment", threshold: 1, xpReward: 300, coinReward: 200, icon: "⚔️" },
  { id: "ach_ruins_3", name: "Ruins Explorer", description: "Excavate 3 different ruins", category: "exploration", condition: "ruins_excavated", threshold: 3, xpReward: 200, coinReward: 100, icon: "🏛️" },
  { id: "ach_ruins_all", name: "Master Archaeologist", description: "Excavate all 8 ruins", category: "mastery", condition: "ruins_excavated", threshold: 8, xpReward: 800, coinReward: 400, icon: "⛏️" },
  { id: "ach_treasure_10", name: "Treasure Trove", description: "Find 10 treasures", category: "collection", condition: "treasures_found", threshold: 10, xpReward: 350, coinReward: 180, icon: "💰" },
  { id: "ach_level_20", name: "Seasoned Explorer", description: "Reach level 20", category: "mastery", condition: "level_reached", threshold: 20, xpReward: 500, coinReward: 250, icon: "⭐" },
  { id: "ach_level_45", name: "Pinnacle of Adventure", description: "Reach the maximum level 45", category: "mastery", condition: "level_reached", threshold: 45, xpReward: 2000, coinReward: 1000, icon: "👑" },
  { id: "ach_daily_streak_7", name: "Dedicated Explorer", description: "Complete daily tasks for 7 consecutive days", category: "social", condition: "daily_streak", threshold: 7, xpReward: 400, coinReward: 200, icon: "📅" },
] as const;

export const JN_REGIONS: readonly JNRegion[] = [
  { id: "canopy_village", name: "Canopy Village", description: "A thriving village built among the treetops", terrain: "canopy_walk", requiredLevel: 1, dangerLevel: 1, rewards: { xpMin: 15, xpMax: 30, coinMin: 10, coinMax: 20, itemChance: 0.05, possibleItems: ["machete", "leather_boots"] }, wildlifeIds: ["emerald_parrot", "howler_monkey", "blue_macaw"], connections: ["vine_labyrinth", "sunlit_meadow", "river_delta"] },
  { id: "lost_temple", name: "Lost Temple", description: "Ancient stone temple reclaimed by the jungle", terrain: "dense_forest", requiredLevel: 5, dangerLevel: 4, rewards: { xpMin: 40, xpMax: 80, coinMin: 30, coinMax: 60, itemChance: 0.15, possibleItems: ["machete_of_ruins", "ancient_scarab"] }, wildlifeIds: ["shadow_jaguar", "jewel_beetle", "ancient_scarab"], connections: ["vine_labyrinth", "whispering_jungle", "poisoned_marches"] },
  { id: "vine_labyrinth", name: "Vine Labyrinth", description: "A maze of tangled vines that shifts with the wind", terrain: "dense_forest", requiredLevel: 3, dangerLevel: 3, rewards: { xpMin: 25, xpMax: 50, coinMin: 15, coinMax: 35, itemChance: 0.1, possibleItems: ["machete", "vinesuit"] }, wildlifeIds: ["vine_serpent", "fever_vine_snake", "howler_monkey"], connections: ["canopy_village", "lost_temple", "ancient_grove"] },
  { id: "sunlit_meadow", name: "Sunlit Meadow", description: "A rare open area bathed in golden sunlight", terrain: "bamboo_grove", requiredLevel: 1, dangerLevel: 1, rewards: { xpMin: 10, xpMax: 25, coinMin: 5, coinMax: 15, itemChance: 0.05, possibleItems: ["leather_boots", "compass"] }, wildlifeIds: ["sun_butterfly", "wild_boar", "blue_macaw"], connections: ["canopy_village", "ancient_grove", "monkey_rock"] },
  { id: "river_delta", name: "River Delta", description: "A vast network of waterways and islands", terrain: "riverbank", requiredLevel: 3, dangerLevel: 3, rewards: { xpMin: 25, xpMax: 50, coinMin: 20, coinMax: 40, itemChance: 0.1, possibleItems: ["antidote_kit", "compass"] }, wildlifeIds: ["river_dragon", "thunder_croc", "glowing_jellyfish"], connections: ["canopy_village", "sunken_ruins", "crocodile_creek"] },
  { id: "misty_highlands", name: "Misty Highlands", description: "Elevated plateaus shrouded in perpetual mist", terrain: "canopy_walk", requiredLevel: 8, dangerLevel: 4, rewards: { xpMin: 50, xpMax: 90, coinMin: 40, coinMax: 70, itemChance: 0.15, possibleItems: ["binoculars", "lucky_charm"] }, wildlifeIds: ["emerald_parrot", "mist_walker", "wind_eagle"], connections: ["eagle_peak", "moonlit_clearing", "whispering_jungle"] },
  { id: "poisoned_marches", name: "Poisoned Marches", description: "Toxic wetlands where few dare to tread", terrain: "swamp", requiredLevel: 10, dangerLevel: 6, rewards: { xpMin: 60, xpMax: 110, coinMin: 45, coinMax: 80, itemChance: 0.2, possibleItems: ["antidote_kit", "vinesuit"] }, wildlifeIds: ["golden_frog", "poison_dart_swarm", "glowing_jellyfish"], connections: ["lost_temple", "fungal_forest", "shadow_ravine"] },
  { id: "ancient_grove", name: "Ancient Grove", description: "Trees thousands of years old stand as silent sentinels", terrain: "dense_forest", requiredLevel: 6, dangerLevel: 3, rewards: { xpMin: 35, xpMax: 70, coinMin: 25, coinMax: 50, itemChance: 0.12, possibleItems: ["expedition_pack", "lucky_charm"] }, wildlifeIds: ["moss_tortoise", "vine_serpent", "stone_golem", "spirit_stag"], connections: ["vine_labyrinth", "sunlit_meadow", "mossy_sanctuary", "moonlit_clearing"] },
  { id: "eagle_peak", name: "Eagle Peak", description: "The highest point in the jungle with panoramic views", terrain: "cliff_face", requiredLevel: 12, dangerLevel: 5, rewards: { xpMin: 70, xpMax: 130, coinMin: 50, coinMax: 90, itemChance: 0.18, possibleItems: ["binoculars", "climbing_gear"] }, wildlifeIds: ["wind_eagle", "howler_monkey", "mist_walker"], connections: ["misty_highlands", "volcanic_ridge", "forbidden_city"] },
  { id: "shadow_ravine", name: "Shadow Ravine", description: "A deep gorge where sunlight never reaches", terrain: "underground_cave", requiredLevel: 14, dangerLevel: 6, rewards: { xpMin: 80, xpMax: 150, coinMin: 60, coinMax: 100, itemChance: 0.2, possibleItems: ["obsidian_spider", "spirit_lantern"] }, wildlifeIds: ["obsidian_spider", "cave_bat_colony", "fever_vine_snake", "lava_salamander"], connections: ["poisoned_marches", "fungal_forest", "volcanic_ridge"] },
  { id: "crystal_lagoon", name: "Crystal Lagoon", description: "Pristine waters surrounded by crystal formations", terrain: "riverbank", requiredLevel: 7, dangerLevel: 2, rewards: { xpMin: 30, xpMax: 60, coinMin: 25, coinMax: 50, itemChance: 0.15, possibleItems: ["compass", "lucky_charm"] }, wildlifeIds: ["golden_frog", "crystal_moth", "glowing_jellyfish", "sun_butterfly"], connections: ["ancient_grove", "sunken_ruins", "fungal_forest"] },
  { id: "monkey_rock", name: "Monkey Rock", description: "A massive rock formation that is home to hundreds of monkeys", terrain: "cliff_face", requiredLevel: 2, dangerLevel: 2, rewards: { xpMin: 15, xpMax: 35, coinMin: 10, coinMax: 25, itemChance: 0.08, possibleItems: ["compass", "blowgun"] }, wildlifeIds: ["howler_monkey", "sun_butterfly", "wild_boar"], connections: ["sunlit_meadow", "vine_labyrinth"] },
  { id: "volcanic_ridge", name: "Volcanic Ridge", description: "A chain of smouldering volcanic peaks", terrain: "volcanic_ash", requiredLevel: 18, dangerLevel: 7, rewards: { xpMin: 100, xpMax: 180, coinMin: 80, coinMax: 140, itemChance: 0.25, possibleItems: ["obsidian_blade", "machete_of_ruins"] }, wildlifeIds: ["jewel_beetle", "obsidian_spider", "lava_salamander", "stone_golem"], connections: ["eagle_peak", "shadow_ravine", "forbidden_city"] },
  { id: "moonlit_clearing", name: "Moonlit Clearing", description: "A magical clearing that glows under moonlight", terrain: "bamboo_grove", requiredLevel: 9, dangerLevel: 3, rewards: { xpMin: 45, xpMax: 85, coinMin: 35, coinMax: 65, itemChance: 0.18, possibleItems: ["spirit_lantern", "lucky_charm"] }, wildlifeIds: ["ghost_owl", "spirit_stag", "mist_walker", "crystal_moth"], connections: ["misty_highlands", "ancient_grove", "mossy_sanctuary"] },
  { id: "fungal_forest", name: "Fungal Forest", description: "Giant mushrooms tower like trees in this eerie biome", terrain: "dense_forest", requiredLevel: 11, dangerLevel: 5, rewards: { xpMin: 55, xpMax: 100, coinMin: 40, coinMax: 75, itemChance: 0.18, possibleItems: ["antidote_kit", "spirit_lantern"] }, wildlifeIds: ["mushroom_sprite", "crystal_moth", "poison_dart_swarm", "glowing_jellyfish"], connections: ["crystal_lagoon", "poisoned_marches", "shadow_ravine"] },
  { id: "sunken_ruins", name: "Sunken Ruins", description: "Ancient city half-submerged in jungle waters", terrain: "swamp", requiredLevel: 16, dangerLevel: 6, rewards: { xpMin: 90, xpMax: 160, coinMin: 70, coinMax: 120, itemChance: 0.22, possibleItems: ["tribal_shield", "ancient_scarab"] }, wildlifeIds: ["thunder_croc", "glowing_jellyfish", "river_dragon"], connections: ["river_delta", "crystal_lagoon", "forbidden_city"] },
  { id: "crocodile_creek", name: "Crocodile Creek", description: "A narrow waterway teeming with apex predators", terrain: "riverbank", requiredLevel: 4, dangerLevel: 4, rewards: { xpMin: 30, xpMax: 55, coinMin: 20, coinMax: 40, itemChance: 0.1, possibleItems: ["blowgun", "antidote_kit"] }, wildlifeIds: ["thunder_croc", "river_dragon", "wild_boar"], connections: ["river_delta", "poisoned_marches"] },
  { id: "mossy_sanctuary", name: "Mossy Sanctuary", description: "A peaceful haven draped in ancient moss", terrain: "dense_forest", requiredLevel: 7, dangerLevel: 2, rewards: { xpMin: 25, xpMax: 50, coinMin: 20, coinMax: 40, itemChance: 0.12, possibleItems: ["expedition_pack", "antidote_kit"] }, wildlifeIds: ["moss_tortoise", "mushroom_sprite", "spirit_stag"], connections: ["ancient_grove", "moonlit_clearing", "whispering_jungle"] },
  { id: "whispering_jungle", name: "Whispering Jungle", description: "Trees that communicate through rustling leaves", terrain: "dense_forest", requiredLevel: 6, dangerLevel: 3, rewards: { xpMin: 35, xpMax: 65, coinMin: 25, coinMax: 45, itemChance: 0.12, possibleItems: ["vinesuit", "compass"] }, wildlifeIds: ["shadow_jaguar", "ghost_owl", "emerald_parrot"], connections: ["lost_temple", "misty_highlands", "mossy_sanctuary", "ancient_grove"] },
  { id: "forbidden_city", name: "Forbidden City", description: "The mythical city at the jungle's heart", terrain: "cliff_face", requiredLevel: 25, dangerLevel: 9, rewards: { xpMin: 150, xpMax: 300, coinMin: 120, coinMax: 250, itemChance: 0.35, possibleItems: ["obsidian_blade", "phoenix_feather", "machete_of_ruins"] }, wildlifeIds: ["stone_golem", "shadow_jaguar", "ancient_scarab", "river_dragon"], connections: ["eagle_peak", "volcanic_ridge", "sunken_ruins"] },
] as const;

export const JN_WEATHER_HAZARDS: readonly JNWeatherHazard[] = [
  { id: "weather_tropical_storm", name: "Tropical Storm", description: "Torrential rain and gale-force winds", speedPenalty: 0.5, damagePerTick: 2, avoidanceChance: 0.15, duration: 5, severity: "severe" },
  { id: "weather_dense_fog", name: "Dense Fog", description: "Visibility drops to mere metres", speedPenalty: 0.3, damagePerTick: 0, avoidanceChance: 0.3, duration: 4, severity: "mild" },
  { id: "weather_quicksand", name: "Quicksand Patches", description: "Hidden pools of sinking mud", speedPenalty: 0.4, damagePerTick: 1, avoidanceChance: 0.2, duration: 3, severity: "moderate" },
  { id: "weather_insect_swarm", name: "Insect Swarm", description: "Relentless biting insects fill the air", speedPenalty: 0.2, damagePerTick: 1, avoidanceChance: 0.25, duration: 3, severity: "moderate" },
  { id: "weather_monsoon", name: "Monsoon Deluge", description: "The sky opens with devastating rainfall", speedPenalty: 0.6, damagePerTick: 3, avoidanceChance: 0.1, duration: 6, severity: "extreme" },
  { id: "wildfire_threat", name: "Wildfire Threat", description: "Distant fires create ash and danger", speedPenalty: 0.3, damagePerTick: 4, avoidanceChance: 0.2, duration: 4, severity: "severe" },
  { id: "weather_flood", name: "Flash Flood", description: "Sudden water surge through low terrain", speedPenalty: 0.7, damagePerTick: 5, avoidanceChance: 0.05, duration: 2, severity: "extreme" },
  { id: "heat_wave", name: "Jungle Heatwave", description: "Oppressive heat saps all energy", speedPenalty: 0.35, damagePerTick: 2, avoidanceChance: 0.2, duration: 5, severity: "moderate" },
] as const;

// ---------------------------------------------------------------------------
// 3. SEEDED PRNG (Mulberry32)
// ---------------------------------------------------------------------------

function createPRNG(seed: number): () => number {
  let s = seed | 0;
  return (): number => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function prngInt(rng: () => number, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function prngPick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function prngChance(rng: () => number, chance: number): boolean {
  return rng() < chance;
}

// ---------------------------------------------------------------------------
// 4. XP / LEVEL TABLE
// ---------------------------------------------------------------------------

const JN_XP_TABLE: number[] = (() => {
  const table: number[] = [0]; // level 1 = 0 XP
  let cumulative = 0;
  for (let lvl = 2; lvl <= JN_MAX_LEVEL; lvl++) {
    // Quadratic scaling: each level needs more XP
    cumulative += Math.floor(50 + (lvl - 1) * 18 + (lvl - 1) * (lvl - 1) * 1.2);
    table.push(cumulative);
  }
  return table;
})();

function computeLevel(totalXP: number): number {
  let lvl = 1;
  for (let i = 1; i < JN_XP_TABLE.length; i++) {
    if (totalXP >= JN_XP_TABLE[i]) {
      lvl = i + 1;
    }
  }
  return Math.min(lvl, JN_MAX_LEVEL);
}

// ---------------------------------------------------------------------------
// 5. STATE TYPE
// ---------------------------------------------------------------------------

export interface JNState {
  totalXP: number;
  coins: number;
  totalCoinsEarned: number;
  exploredRegions: string[];
  observedWildlife: string[];
  ownedEquipment: Record<string, number>;
  equippedItems: string[];
  setupCamps: Record<string, number>; // campId -> level
  excavatedRuins: string[];
  discoveredLore: string[];
  acceptedQuests: string[];
  completedQuests: string[];
  unlockedAchievements: string[];
  hiredGuide: string | null;
  treasures: JNTreasureEntry[];
  explorationLog: JNExplorationLog[];
  encounterLog: JNEncounter[];
  discoveredPaths: string[];
  dailyTasks: JNDailyTask[];
  dailyStreak: number;
  dailySeed: number;
  statRegionsExplored: number;
  statWildlifeObserved: number;
  statRuinsExcavated: number;
  statTreasuresFound: number;
  statEncountersTotal: number;
  statEncountersFled: number;
}

function createInitialState(seed: number): JNState {
  return {
    totalXP: 0,
    coins: 100,
    totalCoinsEarned: 100,
    exploredRegions: [],
    observedWildlife: [],
    ownedEquipment: {},
    equippedItems: [],
    setupCamps: {},
    excavatedRuins: [],
    discoveredLore: [],
    acceptedQuests: [],
    completedQuests: [],
    unlockedAchievements: [],
    hiredGuide: null,
    treasures: [],
    explorationLog: [],
    encounterLog: [],
    discoveredPaths: [],
    dailyTasks: generateDailyTasks(seed),
    dailyStreak: 0,
    dailySeed: seed,
    statRegionsExplored: 0,
    statWildlifeObserved: 0,
    statRuinsExcavated: 0,
    statTreasuresFound: 0,
    statEncountersTotal: 0,
    statEncountersFled: 0,
  };
}

// ---------------------------------------------------------------------------
// 6. DAILY TASK GENERATION
// ---------------------------------------------------------------------------

const DAILY_TASK_TEMPLATES = [
  { id: "dt_explore", desc: "Explore {n} regions", target: 2, xp: 40, coin: 20 },
  { id: "dt_wildlife", desc: "Observe {n} wildlife", target: 3, xp: 30, coin: 15 },
  { id: "dt_excavate", desc: "Excavate {n} ruins", target: 1, xp: 60, coin: 30 },
  { id: "dt_treasure", desc: "Find {n} treasures", target: 2, xp: 50, coin: 25 },
  { id: "dt_encounter", desc: "Survive {n} encounters", target: 3, xp: 35, coin: 18 },
  { id: "dt_equipment", desc: "Buy {n} equipment", target: 1, xp: 25, coin: 12 },
  { id: "dt_camp", desc: "Rest at a camp", target: 1, xp: 20, coin: 10 },
  { id: "dt_coins", desc: "Earn {n} coins from exploration", target: 50, xp: 45, coin: 22 },
];

function generateDailyTasks(seed: number): JNDailyTask[] {
  const rng = createPRNG(seed);
  const tasks: JNDailyTask[] = [];
  const indices = [0, 1, 2, 3]; // pick 4 tasks
  const selected = indices.map(() => prngPick(rng, DAILY_TASK_TEMPLATES));
  for (let i = 0; i < 4; i++) {
    const tmpl = selected[i];
    const scaledTarget = tmpl.target + Math.floor(rng() * (tmpl.target > 1 ? 2 : 1));
    tasks.push({
      id: `${tmpl.id}_${i}_${seed}`,
      description: tmpl.desc.replace("{n}", String(scaledTarget)),
      target: scaledTarget,
      progress: 0,
      xpReward: tmpl.xp + Math.floor(rng() * 20),
      coinReward: tmpl.coin + Math.floor(rng() * 10),
      completed: false,
      claimed: false,
    });
  }
  return tasks;
}

// ---------------------------------------------------------------------------
// 7. HELPER LOOKUPS
// ---------------------------------------------------------------------------

function findRegion(id: string): JNRegion | undefined {
  return JN_REGIONS.find((r) => r.id === id);
}

function findWildlife(id: string): JNWildlifeSpecies | undefined {
  return JN_WILDLIFE.find((w) => w.id === id);
}

function findEquipment(id: string): JNEquipmentItem | undefined {
  return JN_EQUIPMENT.find((e) => e.id === id);
}

function findCamp(id: string): JNCamp | undefined {
  return JN_CAMPS.find((c) => c.id === id);
}

function findRuin(id: string): JNRuin | undefined {
  return JN_RUINS.find((r) => r.id === id);
}

function findNpc(id: string): JNNpc | undefined {
  return JN_NPCS.find((n) => n.id === id);
}

function findTerrain(id: string): JNTerrain | undefined {
  return JN_TERRAINS.find((t) => t.id === id);
}

function findAchievement(id: string): JNAchievement | undefined {
  return JN_ACHIEVEMENTS.find((a) => a.id === id);
}

function findWeather(id: string): JNWeatherHazard | undefined {
  return JN_WEATHER_HAZARDS.find((w) => w.id === id);
}

function rewardRange(rng: () => number, pool: JNRewardPool): { xp: number; coins: number } {
  return {
    xp: prngInt(rng, pool.xpMin, pool.xpMax),
    coins: prngInt(rng, pool.coinMin, pool.coinMax),
  };
}

function makePathKey(from: string, to: string): string {
  return [from, to].sort().join("::");
}

// ---------------------------------------------------------------------------
// 8. ACHIEVEMENT CHECKING
// ---------------------------------------------------------------------------

function evaluateCondition(state: JNState, condition: string, threshold: number): boolean {
  switch (condition) {
    case "regions_explored":
      return state.exploredRegions.length >= threshold;
    case "wildlife_observed":
      return state.observedWildlife.length >= threshold;
    case "equipment_owned":
      return Object.keys(state.ownedEquipment).length >= threshold;
    case "legendary_equipment":
      return Object.keys(state.ownedEquipment).some(
        (id) => findEquipment(id)?.rarity === "legendary"
      );
    case "ruins_excavated":
      return state.excavatedRuins.length >= threshold;
    case "treasures_found":
      return state.treasures.length >= threshold;
    case "level_reached":
      return computeLevel(state.totalXP) >= threshold;
    case "daily_streak":
      return state.dailyStreak >= threshold;
    case "achievements_unlocked":
      return state.unlockedAchievements.length >= threshold;
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// 9. MAIN HOOK
// ---------------------------------------------------------------------------

export function useJungleNavigator(initialSeed?: number) {
  const _initSeed = initialSeed ?? 42;
  const seedRef = useRef<number>(_initSeed);
  const [state, setState] = useState<JNState>(() =>
    createInitialState(_initSeed)
  );

  // ----- Utility: fresh RNG per action -----
  const freshRng = useCallback((salt?: number) => {
    const base = seedRef.current;
    const s = salt !== undefined ? base + salt : base;
    return createPRNG(s + state.totalXP + state.coins + state.exploredRegions.length * 7);
  }, [state.totalXP, state.coins, state.exploredRegions.length]);

  // ===== STATE =====

  const jnGetState = useCallback((): JNState => {
    return state;
  }, [state]);

  const jnResetState = useCallback((newSeed?: number) => {
    seedRef.current = newSeed ?? 42;
    setState(createInitialState(seedRef.current));
  }, []);

  const jnGetSeed = useCallback((): number => {
    return seedRef.current;
  }, []);

  const jnSetSeed = useCallback((seed: number) => {
    seedRef.current = seed;
  }, []);

  // ===== LEVEL / XP =====

  const jnGetLevel = useCallback((): number => {
    return computeLevel(state.totalXP);
  }, [state.totalXP]);

  const jnGetTotalXP = useCallback((): number => {
    return state.totalXP;
  }, [state.totalXP]);

  const jnGetXPToNext = useCallback((): number => {
    const lvl = computeLevel(state.totalXP);
    if (lvl >= JN_MAX_LEVEL) return 0;
    const currentThreshold = JN_XP_TABLE[lvl - 1] ?? 0;
    const nextThreshold = JN_XP_TABLE[lvl] ?? 0;
    return nextThreshold - state.totalXP;
  }, [state.totalXP]);

  const jnGetTitle = useCallback((): JNTitleThreshold => {
    const lvl = computeLevel(state.totalXP);
    let title = JN_TITLE_THRESHOLDS[0];
    for (const t of JN_TITLE_THRESHOLDS) {
      if (lvl >= t.requiredLevel) {
        title = t;
      }
    }
    return title;
  }, [state.totalXP]);

  const jnGetProgress = useCallback((): { level: number; xp: number; xpToNext: number; percent: number; title: string } => {
    const lvl = computeLevel(state.totalXP);
    if (lvl >= JN_MAX_LEVEL) {
      return { level: lvl, xp: state.totalXP, xpToNext: 0, percent: 100, title: "Jungle Legend" };
    }
    const currentThreshold = JN_XP_TABLE[lvl - 1] ?? 0;
    const nextThreshold = JN_XP_TABLE[lvl] ?? 1;
    const inLevel = state.totalXP - currentThreshold;
    const range = nextThreshold - currentThreshold;
    const percent = Math.min(100, Math.round((inLevel / range) * 100));
    const title = jnGetTitle().name;
    return { level: lvl, xp: state.totalXP, xpToNext: nextThreshold - state.totalXP, percent, title };
  }, [state.totalXP, jnGetTitle]);

  const jnAddXP = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((prev) => {
      const capped = computeLevel(prev.totalXP + amount) > JN_MAX_LEVEL
        ? JN_XP_TABLE[JN_MAX_LEVEL - 1] + (JN_XP_TABLE[JN_MAX_LEVEL] ?? 99999)
        : prev.totalXP + amount;
      return { ...prev, totalXP: Math.min(capped, JN_XP_TABLE[JN_XP_TABLE.length - 1]) };
    });
  }, []);

  // ===== COINS =====

  const jnGetCoins = useCallback((): number => {
    return state.coins;
  }, [state.coins]);

  const jnAddCoins = useCallback((amount: number) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      coins: prev.coins + amount,
      totalCoinsEarned: prev.totalCoinsEarned + amount,
    }));
  }, []);

  const jnSpendCoins = useCallback((amount: number): boolean => {
    if (amount <= 0 || state.coins < amount) return false;
    setState((prev) => ({ ...prev, coins: prev.coins - amount }));
    return true;
  }, [state.coins]);

  const jnGetTotalEarned = useCallback((): number => {
    return state.totalCoinsEarned;
  }, [state.totalCoinsEarned]);

  // ===== REGIONS =====

  const jnGetRegions = useCallback((): JNRegion[] => {
    return [...JN_REGIONS];
  }, []);

  const jnGetRegionDetails = useCallback((regionId: string): JNRegion | null => {
    return findRegion(regionId) ?? null;
  }, []);

  const jnIsRegionExplored = useCallback((regionId: string): boolean => {
    return state.exploredRegions.includes(regionId);
  }, [state.exploredRegions]);

  const jnUnlockRegion = useCallback((regionId: string): boolean => {
    const region = findRegion(regionId);
    if (!region) return false;
    if (state.exploredRegions.includes(regionId)) return false;
    if (computeLevel(state.totalXP) < region.requiredLevel) return false;
    setState((prev) => ({
      ...prev,
      exploredRegions: [...prev.exploredRegions, regionId],
      statRegionsExplored: prev.statRegionsExplored + 1,
    }));
    return true;
  }, [state.exploredRegions, state.totalXP]);

  const jnExploreRegion = useCallback((regionId: string): {
    success: boolean;
    xpGained: number;
    coinsGained: number;
    wildlifeObserved: string[];
    events: string[];
    error?: string;
  } => {
    const region = findRegion(regionId);
    if (!region) return { success: false, xpGained: 0, coinsGained: 0, wildlifeObserved: [], events: [], error: "Region not found" };
    const lvl = computeLevel(state.totalXP);
    if (lvl < region.requiredLevel) return { success: false, xpGained: 0, coinsGained: 0, wildlifeObserved: [], events: [], error: "Level too low" };

    const rng = freshRng(regionId.length * 31);
    const { xp, coins } = rewardRange(rng, region.rewards);
    const events: string[] = [];

    // Guide bonus
    const guide = state.hiredGuide ? findNpc(state.hiredGuide) : null;
    const guideMultiplier = guide ? 1 + guide.bonusValue : 1;
    const finalXP = Math.floor(xp * guideMultiplier);
    const finalCoins = Math.floor(coins * guideMultiplier);

    // Terrain modifier
    const terrain = findTerrain(region.terrain);
    const terrainStealth = terrain?.stealthModifier ?? 0.5;
    const terrainHazard = terrain?.hazardChance ?? 0.2;

    // Weather check
    if (prngChance(rng, 0.25)) {
      const weather = prngPick(rng, JN_WEATHER_HAZARDS);
      if (terrainHazard > 0.15 && prngChance(rng, terrainHazard * 0.5)) {
        events.push(`Weather hazard: ${weather.name} — ${weather.description}`);
      }
    }

    // Wildlife observation
    const observed: string[] = [];
    for (const wid of region.wildlifeIds) {
      const species = findWildlife(wid);
      if (!species) continue;
      // Higher stealth = more chance to observe, rarer = harder to spot
      const rarityFactor = species.rarity === "common" ? 0.8 : species.rarity === "uncommon" ? 0.5 : species.rarity === "rare" ? 0.3 : species.rarity === "epic" ? 0.15 : 0.05;
      const observeChance = Math.min(0.95, terrainStealth * rarityFactor * guideMultiplier);
      if (prngChance(rng, observeChance)) {
        observed.push(wid);
        if (!state.observedWildlife.includes(wid)) {
          events.push(`New species discovered: ${species.name} (${species.scientificName})!`);
        }
      }
    }

    // Treasure chance
    if (prngChance(rng, region.rewards.itemChance)) {
      const treasureItem = prngPick(rng, region.rewards.possibleItems);
      const eq = findEquipment(treasureItem);
      if (eq) {
        events.push(`Found equipment: ${eq.name}`);
      }
    }

    // Encounter chance
    if (prngChance(rng, 0.2)) {
      const encounterTypes: JNEncounter["type"][] = ["wildlife", "trap", "treasure", "npc"];
      const encType = prngPick(rng, encounterTypes);
      const encName = encType === "wildlife" ? "A creature blocks the path" :
        encType === "trap" ? "A hidden trap springs!" :
        encType === "treasure" ? "A glinting object catches your eye" :
        "A fellow explorer waves you down";
      events.push(`Encounter: ${encName}`);
    }

    // Commit state changes
    setState((prev) => {
      const newObserved = [...prev.observedWildlife];
      let newWildlifeCount = 0;
      for (const wid of observed) {
        if (!newObserved.includes(wid)) {
          newObserved.push(wid);
          newWildlifeCount++;
        }
      }
      const isAlreadyExplored = prev.exploredRegions.includes(regionId);
      return {
        ...prev,
        totalXP: prev.totalXP + finalXP,
        coins: prev.coins + finalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
        exploredRegions: isAlreadyExplored ? prev.exploredRegions : [...prev.exploredRegions, regionId],
        observedWildlife: newObserved,
        statRegionsExplored: isAlreadyExplored ? prev.statRegionsExplored : prev.statRegionsExplored + 1,
        statWildlifeObserved: prev.statWildlifeObserved + newWildlifeCount,
        explorationLog: [...prev.explorationLog, {
          regionId,
          timestamp: Date.now(),
          xpGained: finalXP,
          coinsGained: finalCoins,
          wildlifeObserved: observed,
          events,
        }],
        discoveredPaths: isAlreadyExplored
          ? prev.discoveredPaths
          : [...prev.discoveredPaths, ...region.connections.map((c) => makePathKey(regionId, c))],
      };
    });

    return { success: true, xpGained: finalXP, coinsGained: finalCoins, wildlifeObserved: observed, events };
  }, [state.totalXP, state.observedWildlife, state.hiredGuide, freshRng]);

  const jnGetRegionBonus = useCallback((regionId: string): number => {
    const region = findRegion(regionId);
    if (!region) return 0;
    const camp = Object.entries(state.setupCamps).find(([cid]) => {
      const c = findCamp(cid);
      return c?.regionId === regionId;
    });
    if (!camp) return 0;
    const campData = findCamp(camp[0]);
    if (!campData) return 0;
    return camp[1] * 0.1; // 10% bonus per camp level
  }, [state.setupCamps]);

  // ===== WILDLIFE =====

  const jnGetWildlife = useCallback((): JNWildlifeSpecies[] => {
    return [...JN_WILDLIFE];
  }, []);

  const jnObserveWildlife = useCallback((speciesId: string): {
    success: boolean;
    isNew: boolean;
    xpGained: number;
    coinReward: number;
    species: JNWildlifeSpecies | null;
  } => {
    const species = findWildlife(speciesId);
    if (!species) return { success: false, isNew: false, xpGained: 0, coinReward: 0, species: null };

    const isNew = !state.observedWildlife.includes(speciesId);
    const xpBonus = isNew ? Math.floor(species.xpReward * 1.5) : species.xpReward;

    setState((prev) => ({
      ...prev,
      totalXP: prev.totalXP + xpBonus,
      coins: prev.coins + species.coinReward,
      totalCoinsEarned: prev.totalCoinsEarned + species.coinReward,
      observedWildlife: isNew ? [...prev.observedWildlife, speciesId] : prev.observedWildlife,
      statWildlifeObserved: isNew ? prev.statWildlifeObserved + 1 : prev.statWildlifeObserved,
    }));

    return { success: true, isNew, xpGained: xpBonus, coinReward: species.coinReward, species };
  }, [state.observedWildlife]);

  const jnGetWildlifeJournal = useCallback((): { observed: JNWildlifeSpecies[]; unobserved: JNWildlifeSpecies[]; completionPercent: number } => {
    const observed = state.observedWildlife
      .map((id) => findWildlife(id))
      .filter((s): s is JNWildlifeSpecies => s !== undefined);
    const unobserved = JN_WILDLIFE.filter((s) => !state.observedWildlife.includes(s.id));
    return {
      observed,
      unobserved,
      completionPercent: Math.round((observed.length / JN_WILDLIFE.length) * 100),
    };
  }, [state.observedWildlife]);

  const jnGetWildlifeRarity = useCallback((speciesId: string): JNRarity | null => {
    return findWildlife(speciesId)?.rarity ?? null;
  }, []);

  // ===== EQUIPMENT =====

  const jnGetEquipment = useCallback((): JNEquipmentItem[] => {
    return [...JN_EQUIPMENT];
  }, []);

  const jnBuyEquipment = useCallback((itemId: string): {
    success: boolean;
    error?: string;
    equipment?: JNEquipmentItem;
  } => {
    const item = findEquipment(itemId);
    if (!item) return { success: false, error: "Item not found" };
    if (computeLevel(state.totalXP) < item.requiredLevel) return { success: false, error: "Level too low" };
    const currentCount = state.ownedEquipment[itemId] ?? 0;
    if (currentCount >= item.maxStack) return { success: false, error: "Max stack reached" };
    if (state.coins < item.cost) return { success: false, error: "Not enough coins" };

    setState((prev) => ({
      ...prev,
      coins: prev.coins - item.cost,
      ownedEquipment: {
        ...prev.ownedEquipment,
        [itemId]: currentCount + 1,
      },
    }));

    return { success: true, equipment: item };
  }, [state.coins, state.ownedEquipment, state.totalXP]);

  const jnEquipItem = useCallback((itemId: string): boolean => {
    const item = findEquipment(itemId);
    if (!item) return false;
    if ((state.ownedEquipment[itemId] ?? 0) <= 0) return false;

    const currentOfType = state.equippedItems.find((id) => findEquipment(id)?.type === item.type);
    if (currentOfType) {
      // Unequip previous
      setState((prev) => ({
        ...prev,
        equippedItems: [...prev.equippedItems.filter((id) => id !== currentOfType), itemId],
      }));
    } else {
      setState((prev) => ({
        ...prev,
        equippedItems: [...prev.equippedItems, itemId],
      }));
    }
    return true;
  }, [state.ownedEquipment, state.equippedItems]);

  const jnUnequipItem = useCallback((itemId: string): boolean => {
    if (!state.equippedItems.includes(itemId)) return false;
    setState((prev) => ({
      ...prev,
      equippedItems: prev.equippedItems.filter((id) => id !== itemId),
    }));
    return true;
  }, [state.equippedItems]);

  const jnGetEquippedItems = useCallback((): JNEquipmentItem[] => {
    return state.equippedItems
      .map((id) => findEquipment(id))
      .filter((e): e is JNEquipmentItem => e !== undefined);
  }, [state.equippedItems]);

  const jnGetEquipmentStats = useCallback((): JNEquipmentStats => {
    const total: JNEquipmentStats = { attack: 0, defense: 0, speed: 0, stealth: 0, luck: 0, survival: 0 };
    for (const id of state.equippedItems) {
      const item = findEquipment(id);
      if (item) {
        total.attack += item.stats.attack;
        total.defense += item.stats.defense;
        total.speed += item.stats.speed;
        total.stealth += item.stats.stealth;
        total.luck += item.stats.luck;
        total.survival += item.stats.survival;
      }
    }
    // Guide bonus
    const guide = state.hiredGuide ? findNpc(state.hiredGuide) : null;
    if (guide) {
      switch (guide.bonusType) {
        case "attack": total.attack += Math.floor(total.attack * guide.bonusValue); break;
        case "defense": total.defense += Math.floor(total.defense * guide.bonusValue); break;
        case "speed": total.speed += Math.floor(total.speed * guide.bonusValue); break;
        case "stealth": total.stealth += Math.floor(total.stealth * guide.bonusValue); break;
        case "luck": total.luck += Math.floor(total.luck * guide.bonusValue); break;
        case "survival": total.survival += Math.floor(total.survival * guide.bonusValue); break;
      }
    }
    return total;
  }, [state.equippedItems, state.hiredGuide]);

  // ===== CAMPS =====

  const jnGetCamps = useCallback((): JNCamp[] => {
    return [...JN_CAMPS];
  }, []);

  const jnSetupCamp = useCallback((campId: string): {
    success: boolean;
    error?: string;
  } => {
    const camp = findCamp(campId);
    if (!camp) return { success: false, error: "Camp not found" };
    const region = findRegion(camp.regionId);
    if (region && !state.exploredRegions.includes(camp.regionId)) {
      return { success: false, error: "Region not yet explored" };
    }
    if (state.setupCamps[campId] && state.setupCamps[campId] > 0) {
      return { success: false, error: "Camp already set up" };
    }
    if (state.coins < camp.upgradeCost) return { success: false, error: "Not enough coins" };

    setState((prev) => ({
      ...prev,
      coins: prev.coins - camp.upgradeCost,
      setupCamps: { ...prev.setupCamps, [campId]: 1 },
    }));

    return { success: true };
  }, [state.coins, state.exploredRegions, state.setupCamps]);

  const jnUpgradeCamp = useCallback((campId: string): {
    success: boolean;
    error?: string;
    newLevel?: number;
  } => {
    const camp = findCamp(campId);
    if (!camp) return { success: false, error: "Camp not found" };
    const currentLevel = state.setupCamps[campId] ?? 0;
    if (currentLevel === 0) return { success: false, error: "Camp not set up yet" };
    if (currentLevel >= 5) return { success: false, error: "Camp at max level" };
    const cost = Math.floor(camp.upgradeCost * (1 + currentLevel * 0.5));
    if (state.coins < cost) return { success: false, error: "Not enough coins" };

    const newLevel = currentLevel + 1;
    setState((prev) => ({
      ...prev,
      coins: prev.coins - cost,
      setupCamps: { ...prev.setupCamps, [campId]: newLevel },
    }));

    return { success: true, newLevel };
  }, [state.coins, state.setupCamps]);

  const jnRestAtCamp = useCallback((campId: string): {
    success: boolean;
    xpRecovered: number;
    coinsFound: number;
    message: string;
  } => {
    const camp = findCamp(campId);
    const campLevel = state.setupCamps[campId] ?? 0;
    if (!camp || campLevel === 0) return { success: false, xpRecovered: 0, coinsFound: 0, message: "Camp not available" };

    const rng = freshRng(campId.length * 17 + 999);
    const baseXP = 10 * campLevel;
    const foundCoins = prngInt(rng, 5, 15) * campLevel;
    const messages = [
      `You rest at ${camp.name} and feel rejuvenated.`,
      `The sounds of the jungle lull you to peaceful rest.`,
      `Camp amenities help you recover your energy.`,
    ];

    setState((prev) => ({
      ...prev,
      totalXP: prev.totalXP + baseXP,
      coins: prev.coins + foundCoins,
      totalCoinsEarned: prev.totalCoinsEarned + foundCoins,
    }));

    return {
      success: true,
      xpRecovered: baseXP,
      coinsFound: foundCoins,
      message: prngPick(rng, messages),
    };
  }, [state.setupCamps, freshRng]);

  const jnGetCampBonus = useCallback((campId: string): number => {
    const level = state.setupCamps[campId] ?? 0;
    if (level === 0) return 0;
    return level * 0.1;
  }, [state.setupCamps]);

  // ===== RUINS =====

  const jnGetRuins = useCallback((): JNRuin[] => {
    return [...JN_RUINS];
  }, []);

  const jnExcavateRuins = useCallback((ruinId: string): {
    success: boolean;
    xpGained: number;
    coinsGained: number;
    itemsFound: string[];
    loreDiscovered: string[];
    trapsTriggered: number;
    error?: string;
  } => {
    const ruin = findRuin(ruinId);
    if (!ruin) return { success: false, xpGained: 0, coinsGained: 0, itemsFound: [], loreDiscovered: [], trapsTriggered: 0, error: "Ruin not found" };

    if (state.excavatedRuins.includes(ruinId)) return { success: false, xpGained: 0, coinsGained: 0, itemsFound: [], loreDiscovered: [], trapsTriggered: 0, error: "Already excavated" };

    const region = findRegion(ruin.regionId);
    if (region && !state.exploredRegions.includes(ruin.regionId)) {
      return { success: false, xpGained: 0, coinsGained: 0, itemsFound: [], loreDiscovered: [], trapsTriggered: 0, error: "Region not explored" };
    }

    // Check required equipment
    const equipped = new Set(state.equippedItems);
    for (const reqId of ruin.requiredEquipment) {
      if (!equipped.has(reqId)) {
        return { success: false, xpGained: 0, coinsGained: 0, itemsFound: [], loreDiscovered: [], trapsTriggered: 0, error: `Requires ${findEquipment(reqId)?.name ?? reqId}` };
      }
    }

    const lvl = computeLevel(state.totalXP);
    if (lvl < ruin.difficulty * 3) return { success: false, xpGained: 0, coinsGained: 0, itemsFound: [], loreDiscovered: [], trapsTriggered: 0, error: "Level too low for this ruin" };

    const rng = freshRng(ruinId.length * 47 + 333);
    const { xp, coins } = rewardRange(rng, ruin.treasurePool);
    const guide = state.hiredGuide ? findNpc(state.hiredGuide) : null;
    const guideMult = guide ? 1 + guide.bonusValue : 1;
    const finalXP = Math.floor(xp * guideMult);
    const finalCoins = Math.floor(coins * guideMult);

    // Survival stat reduces traps
    const eqStats = state.equippedItems.reduce((acc, id) => {
      const eq = findEquipment(id);
      if (!eq) return acc;
      return { ...acc, survival: acc.survival + eq.stats.survival };
    }, { survival: 0 });

    const trapsTriggered = Math.max(0, ruin.trapsCount - Math.floor(eqStats.survival * 0.5));

    // Items found
    const itemsFound: string[] = [];
    for (const poolItem of ruin.treasurePool.possibleItems) {
      if (prngChance(rng, ruin.treasurePool.itemChance)) {
        itemsFound.push(poolItem);
      }
    }

    // Lore discovery
    const loreDiscovered: string[] = [];
    for (const lore of ruin.loreFragments) {
      if (prngChance(rng, 0.7)) {
        loreDiscovered.push(lore);
      }
    }

    setState((prev) => {
      const newLore = [...prev.discoveredLore];
      for (const l of loreDiscovered) {
        if (!newLore.includes(l)) newLore.push(l);
      }
      const newEquipment = { ...prev.ownedEquipment };
      for (const itemId of itemsFound) {
        const eq = findEquipment(itemId);
        if (eq) {
          newEquipment[itemId] = Math.min((newEquipment[itemId] ?? 0) + 1, eq.maxStack);
        }
      }
      return {
        ...prev,
        totalXP: prev.totalXP + finalXP,
        coins: prev.coins + finalCoins,
        totalCoinsEarned: prev.totalCoinsEarned + finalCoins,
        excavatedRuins: [...prev.excavatedRuins, ruinId],
        discoveredLore: newLore,
        ownedEquipment: newEquipment,
        statRuinsExcavated: prev.statRuinsExcavated + 1,
      };
    });

    return { success: true, xpGained: finalXP, coinsGained: finalCoins, itemsFound, loreDiscovered, trapsTriggered };
  }, [state.excavatedRuins, state.exploredRegions, state.equippedItems, state.hiredGuide, state.totalXP, freshRng]);

  const jnGetRuinsLore = useCallback((): string[] => {
    return [...state.discoveredLore];
  }, [state.discoveredLore]);

  const jnDiscoverRuins = useCallback((): JNRuin[] => {
    const available = JN_RUINS.filter((r) => {
      if (state.excavatedRuins.includes(r.id)) return false;
      const region = findRegion(r.regionId);
      return region ? state.exploredRegions.includes(region.id) : false;
    });
    return available;
  }, [state.excavatedRuins, state.exploredRegions]);

  // ===== QUESTS =====

  const jnGetQuests = useCallback((): JNQuest[] => {
    return [...JN_QUESTS];
  }, []);

  const jnAcceptQuest = useCallback((questId: string): boolean => {
    const quest = JN_QUESTS.find((q) => q.id === questId);
    if (!quest) return false;
    if (state.acceptedQuests.includes(questId)) return false;
    if (state.completedQuests.includes(questId)) return false;
    if (computeLevel(state.totalXP) < quest.requiredLevel) return false;

    setState((prev) => ({
      ...prev,
      acceptedQuests: [...prev.acceptedQuests, questId],
    }));
    return true;
  }, [state.acceptedQuests, state.completedQuests, state.totalXP]);

  const jnGetActiveQuests = useCallback((): JNQuest[] => {
    return JN_QUESTS.filter((q) => state.acceptedQuests.includes(q.id));
  }, [state.acceptedQuests]);

  const jnGetQuestProgress = useCallback((questId: string): { completed: boolean; requirements: Record<string, number>; progress: Record<string, number> } => {
    const quest = JN_QUESTS.find((q) => q.id === questId);
    if (!quest) return { completed: false, requirements: {}, progress: {} };

    const progress: Record<string, number> = {};
    let completed = true;

    for (const [key, target] of Object.entries(quest.requirements)) {
      let current = 0;
      switch (key) {
        case "regions_explored": current = state.exploredRegions.length; break;
        case "wildlife_observed": current = state.observedWildlife.length; break;
        case "ruins_excavated": current = state.excavatedRuins.length; break;
        case "equipment_owned": current = Object.keys(state.ownedEquipment).length; break;
        case "high_difficulty_ruin":
          current = state.excavatedRuins.filter((rid) => (findRuin(rid)?.difficulty ?? 0) >= 5).length;
          break;
        case "treasures_found": current = state.treasures.length; break;
        case "legendary_wildlife":
          current = state.observedWildlife.filter((wid) => findWildlife(wid)?.rarity === "legendary").length;
          break;
        case "camps_setup": current = Object.keys(state.setupCamps).length; break;
        case "achievements_unlocked": current = state.unlockedAchievements.length; break;
        default:
          if (key.startsWith("region_explored_")) {
            current = state.exploredRegions.includes(key.replace("region_explored_", "")) ? 1 : 0;
          }
          break;
      }
      progress[key] = current;
      if (current < target) completed = false;
    }

    return { completed, requirements: quest.requirements, progress };
  }, [state.exploredRegions, state.observedWildlife, state.excavatedRuins, state.ownedEquipment, state.setupCamps, state.unlockedAchievements, state.treasures]);

  const jnCompleteQuest = useCallback((questId: string): {
    success: boolean;
    xpGained: number;
    coinsGained: number;
    itemReward?: string;
    error?: string;
  } => {
    const quest = JN_QUESTS.find((q) => q.id === questId);
    if (!quest) return { success: false, xpGained: 0, coinsGained: 0, error: "Quest not found" };
    if (!state.acceptedQuests.includes(questId)) return { success: false, xpGained: 0, coinsGained: 0, error: "Quest not accepted" };
    if (state.completedQuests.includes(questId)) return { success: false, xpGained: 0, coinsGained: 0, error: "Already completed" };

    const { completed } = jnGetQuestProgress(questId);
    if (!completed) return { success: false, xpGained: 0, coinsGained: 0, error: "Requirements not met" };

    setState((prev) => {
      const newEquipment = { ...prev.ownedEquipment };
      if (quest.itemReward) {
        const eq = findEquipment(quest.itemReward);
        if (eq) {
          newEquipment[quest.itemReward] = Math.min((newEquipment[quest.itemReward] ?? 0) + 1, eq.maxStack);
        }
      }
      return {
        ...prev,
        totalXP: prev.totalXP + quest.xpReward,
        coins: prev.coins + quest.coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + quest.coinReward,
        acceptedQuests: prev.acceptedQuests.filter((id) => id !== questId),
        completedQuests: [...prev.completedQuests, questId],
        ownedEquipment: newEquipment,
      };
    });

    return { success: true, xpGained: quest.xpReward, coinsGained: quest.coinReward, itemReward: quest.itemReward };
  }, [state.acceptedQuests, state.completedQuests, jnGetQuestProgress]);

  // ===== NPCs / GUIDES =====

  const jnGetNPCs = useCallback((): JNNpc[] => {
    return [...JN_NPCS];
  }, []);

  const jnHireGuide = useCallback((npcId: string): boolean => {
    const npc = findNpc(npcId);
    if (!npc) return false;
    if (state.hiredGuide === npcId) return false;
    if (state.coins < npc.hireCost) return false;

    setState((prev) => ({
      ...prev,
      coins: prev.coins - npc.hireCost,
      hiredGuide: npcId,
    }));
    return true;
  }, [state.coins, state.hiredGuide]);

  const jnDismissGuide = useCallback((): boolean => {
    if (!state.hiredGuide) return false;
    setState((prev) => ({ ...prev, hiredGuide: null }));
    return true;
  }, [state.hiredGuide]);

  const jnGetActiveGuide = useCallback((): JNNpc | null => {
    if (!state.hiredGuide) return null;
    return findNpc(state.hiredGuide) ?? null;
  }, [state.hiredGuide]);

  const jnGetGuideBonus = useCallback((statKey: string): number => {
    if (!state.hiredGuide) return 0;
    const npc = findNpc(state.hiredGuide);
    if (!npc) return 0;
    if (npc.bonusType === statKey) return npc.bonusValue;
    return 0;
  }, [state.hiredGuide]);

  const jnGetGuideDialogue = useCallback((): string => {
    if (!state.hiredGuide) return "No guide hired.";
    const npc = findNpc(state.hiredGuide);
    if (!npc) return "";
    const rng = freshRng(Date.now() % 1000);
    return prngPick(rng, npc.dialogues);
  }, [state.hiredGuide, freshRng]);

  // ===== ACHIEVEMENTS =====

  const jnGetAchievements = useCallback((): JNAchievement[] => {
    return [...JN_ACHIEVEMENTS];
  }, []);

  const jnCheckAchievements = useCallback((): JNAchievement[] => {
    const newlyUnlocked: JNAchievement[] = [];
    for (const ach of JN_ACHIEVEMENTS) {
      if (state.unlockedAchievements.includes(ach.id)) continue;
      if (evaluateCondition(state, ach.condition, ach.threshold)) {
        newlyUnlocked.push(ach);
      }
    }

    if (newlyUnlocked.length > 0) {
      setState((prev) => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newlyUnlocked.map((a) => a.id)],
        totalXP: prev.totalXP + newlyUnlocked.reduce((sum, a) => sum + a.xpReward, 0),
        coins: prev.coins + newlyUnlocked.reduce((sum, a) => sum + a.coinReward, 0),
        totalCoinsEarned: prev.totalCoinsEarned + newlyUnlocked.reduce((sum, a) => sum + a.coinReward, 0),
      }));
    }

    return newlyUnlocked;
  }, [state]);

  const jnGetAchievementProgress = useCallback((achievementId: string): { current: number; threshold: number; percent: number; unlocked: boolean } => {
    const ach = findAchievement(achievementId);
    if (!ach) return { current: 0, threshold: 0, percent: 0, unlocked: false };

    let current = 0;
    switch (ach.condition) {
      case "regions_explored": current = state.exploredRegions.length; break;
      case "wildlife_observed": current = state.observedWildlife.length; break;
      case "equipment_owned": current = Object.keys(state.ownedEquipment).length; break;
      case "legendary_equipment": current = Object.keys(state.ownedEquipment).filter((id) => findEquipment(id)?.rarity === "legendary").length; break;
      case "ruins_excavated": current = state.excavatedRuins.length; break;
      case "treasures_found": current = state.treasures.length; break;
      case "level_reached": current = computeLevel(state.totalXP); break;
      case "daily_streak": current = state.dailyStreak; break;
      case "achievements_unlocked": current = state.unlockedAchievements.length; break;
    }

    const unlocked = state.unlockedAchievements.includes(achievementId);
    const percent = Math.min(100, Math.round((current / ach.threshold) * 100));

    return { current, threshold: ach.threshold, percent, unlocked };
  }, [state.exploredRegions, state.observedWildlife, state.ownedEquipment, state.excavatedRuins, state.treasures, state.totalXP, state.dailyStreak, state.unlockedAchievements]);

  const jnGetUnlockedAchievements = useCallback((): JNAchievement[] => {
    return state.unlockedAchievements
      .map((id) => findAchievement(id))
      .filter((a): a is JNAchievement => a !== undefined);
  }, [state.unlockedAchievements]);

  // ===== DAILY TASKS =====

  const jnGetDailyTask = useCallback((): JNDailyTask[] => {
    return [...state.dailyTasks];
  }, [state.dailyTasks]);

  const jnUpdateDailyProgress = useCallback((taskIndex: number, amount: number): void => {
    setState((prev) => {
      const tasks = [...prev.dailyTasks];
      if (taskIndex < 0 || taskIndex >= tasks.length) return prev;
      const task = tasks[taskIndex];
      if (task.completed) return prev;
      const newProgress = Math.min(task.target, task.progress + amount);
      tasks[taskIndex] = { ...task, progress: newProgress, completed: newProgress >= task.target };
      return { ...prev, dailyTasks: tasks };
    });
  }, []);

  const jnClaimDailyReward = useCallback((taskIndex: number): {
    success: boolean;
    xpGained: number;
    coinsGained: number;
    error?: string;
  } => {
    if (taskIndex < 0 || taskIndex >= state.dailyTasks.length) return { success: false, xpGained: 0, coinsGained: 0, error: "Invalid task" };
    const task = state.dailyTasks[taskIndex];
    if (!task.completed) return { success: false, xpGained: 0, coinsGained: 0, error: "Task not completed" };
    if (task.claimed) return { success: false, xpGained: 0, coinsGained: 0, error: "Already claimed" };

    setState((prev) => {
      const tasks = [...prev.dailyTasks];
      tasks[taskIndex] = { ...tasks[taskIndex], claimed: true };
      return {
        ...prev,
        dailyTasks: tasks,
        totalXP: prev.totalXP + task.xpReward,
        coins: prev.coins + task.coinReward,
        totalCoinsEarned: prev.totalCoinsEarned + task.coinReward,
      };
    });

    return { success: true, xpGained: task.xpReward, coinsGained: task.coinReward };
  }, [state.dailyTasks]);

  const jnResetDailyTasks = useCallback((): void => {
    const newSeed = seedRef.current + 1;
    seedRef.current = newSeed;
    setState((prev) => ({
      ...prev,
      dailyTasks: generateDailyTasks(newSeed),
      dailySeed: newSeed,
    }));
  }, []);

  const jnGetDailyStreak = useCallback((): number => {
    return state.dailyStreak;
  }, [state.dailyStreak]);

  const jnIncrementDailyStreak = useCallback((): void => {
    setState((prev) => ({ ...prev, dailyStreak: prev.dailyStreak + 1 }));
  }, []);

  // ===== WEATHER =====

  const jnGetWeather = useCallback((regionId: string): JNWeatherHazard | null => {
    const rng = freshRng(regionId.length * 53 + 777);
    if (!prngChance(rng, 0.4)) return null;
    return prngPick(rng, JN_WEATHER_HAZARDS);
  }, [freshRng]);

  const jnPredictWeather = useCallback((regionId: string): { hazard: JNWeatherHazard | null; confidence: number; description: string } => {
    const hazard = jnGetWeather(regionId);
    const rng = freshRng(regionId.length * 61 + 888);
    const confidence = hazard ? prngInt(rng, 55, 90) : prngInt(rng, 60, 85);
    const guideBonus = state.hiredGuide === "npc_zephyr" ? 15 : 0;
    const finalConfidence = Math.min(99, confidence + guideBonus);

    const description = hazard
      ? `Predicts ${hazard.name} with ${finalConfidence}% confidence`
      : `Clear conditions expected with ${finalConfidence}% confidence`;

    return { hazard, confidence: finalConfidence, description };
  }, [jnGetWeather, freshRng, state.hiredGuide]);

  const jnGetWeatherHazard = useCallback((): JNWeatherHazard[] => {
    return [...JN_WEATHER_HAZARDS];
  }, []);

  // ===== TREASURE =====

  const jnFindTreasure = useCallback((regionId: string): {
    found: boolean;
    treasure: JNTreasureEntry | null;
    error?: string;
  } => {
    const region = findRegion(regionId);
    if (!region) return { found: false, treasure: null, error: "Region not found" };
    if (!state.exploredRegions.includes(regionId)) return { found: false, treasure: null, error: "Region not explored" };

    const rng = freshRng(regionId.length * 41 + 555);
    const luckStat = jnGetEquipmentStats().luck;
    const findChance = 0.15 + luckStat * 0.02 + (state.hiredGuide ? findNpc(state.hiredGuide)?.bonusType === "luck" ? 0.1 : 0 : 0);

    if (!prngChance(rng, findChance)) {
      return { found: false, treasure: null };
    }

    const rarities: JNRarity[] = ["common", "common", "uncommon", "uncommon", "rare", "rare", "epic", "legendary"];
    const rarity = luckStat > 5 ? prngPick(rng, rarities.slice(2)) : prngPick(rng, rarities);
    const valueMultipliers: Record<JNRarity, number> = { common: 1, uncommon: 2, rare: 5, epic: 10, legendary: 25 };
    const baseValue = prngInt(rng, 10, 50);
    const value = baseValue * valueMultipliers[rarity];

    const treasureNames: Record<JNRarity, string[]> = {
      common: ["Tarnished Coin", "Rusty Compass", "Old Map Fragment", "Beaded Necklace", "Clay Pot"],
      uncommon: ["Silver Idol", "Etched Bone", "Gem-studded Ring", "Ancient Scroll", "Coral Pendant"],
      rare: ["Golden Mask", "Jeweled Dagger", "Crystal Skull Fragment", "Enchanted Amulet", "Royal Seal"],
      epic: ["Pharaoh's Eye", "Heart of the Jungle", "Serpent Crown Piece", "Dragon Scale Shield", "Starfall Gem"],
      legendary: ["Jungle Eternal Ruby", "Lost City Keystone", "Emperor's Feathered Crown", "World Tree Seed", "Gods' Map"],
    };

    const name = prngPick(rng, treasureNames[rarity]);

    const treasure: JNTreasureEntry = {
      id: `treasure_${regionId}_${Date.now()}`,
      regionId,
      name,
      value,
      rarity,
      foundAt: Date.now(),
      description: `A ${rarity} treasure found in ${region.name}`,
    };

    setState((prev) => ({
      ...prev,
      treasures: [...prev.treasures, treasure],
      coins: prev.coins + Math.floor(value * 0.5),
      totalCoinsEarned: prev.totalCoinsEarned + Math.floor(value * 0.5),
      statTreasuresFound: prev.statTreasuresFound + 1,
    }));

    return { found: true, treasure };
  }, [state.exploredRegions, freshRng, jnGetEquipmentStats, state.hiredGuide]);

  const jnGetTreasureLog = useCallback((): JNTreasureEntry[] => {
    return [...state.treasures];
  }, [state.treasures]);

  const jnGetTreasureValue = useCallback((): { total: number; byRarity: Record<JNRarity, number> } => {
    const byRarity: Record<JNRarity, number> = { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 0 };
    let total = 0;
    for (const t of state.treasures) {
      total += t.value;
      byRarity[t.rarity] += t.value;
    }
    return { total, byRarity };
  }, [state.treasures]);

  // ===== NAVIGATION / MAP =====

  const jnGetMapData = useCallback((): {
    nodes: Array<{ id: string; name: string; explored: boolean; dangerLevel: number; requiredLevel: number }>;
    edges: Array<{ from: string; to: string; discovered: boolean }>;
  } => {
    const nodes = JN_REGIONS.map((r) => ({
      id: r.id,
      name: r.name,
      explored: state.exploredRegions.includes(r.id),
      dangerLevel: r.dangerLevel,
      requiredLevel: r.requiredLevel,
    }));

    const edges: Array<{ from: string; to: string; discovered: boolean }> = [];
    for (const region of JN_REGIONS) {
      for (const conn of region.connections) {
        if (region.id < conn) {
          edges.push({
            from: region.id,
            to: conn,
            discovered: state.discoveredPaths.includes(makePathKey(region.id, conn)),
          });
        }
      }
    }

    return { nodes, edges };
  }, [state.exploredRegions, state.discoveredPaths]);

  const jnGetDiscoveredPaths = useCallback((): string[] => {
    return [...state.discoveredPaths];
  }, [state.discoveredPaths]);

  const jnGetNavigationStats = useCallback((): {
    totalRegions: number;
    exploredRegions: number;
    completionPercent: number;
    totalPaths: number;
    discoveredPaths: number;
  } => {
    const totalPaths = new Set<string>();
    for (const region of JN_REGIONS) {
      for (const conn of region.connections) {
        totalPaths.add(makePathKey(region.id, conn));
      }
    }
    return {
      totalRegions: JN_REGIONS.length,
      exploredRegions: state.exploredRegions.length,
      completionPercent: Math.round((state.exploredRegions.length / JN_REGIONS.length) * 100),
      totalPaths: totalPaths.size,
      discoveredPaths: state.discoveredPaths.length,
    };
  }, [state.exploredRegions, state.discoveredPaths]);

  const jnGetConnectedRegions = useCallback((regionId: string): string[] => {
    const region = findRegion(regionId);
    if (!region) return [];
    return region.connections.filter((c) => state.discoveredPaths.includes(makePathKey(regionId, c)));
  }, [state.discoveredPaths]);

  // ===== ENCOUNTERS =====

  const jnHandleEncounter = useCallback((encounterType: JNEncounter["type"], regionId: string): {
    success: boolean;
    encounter: JNEncounter;
    xpGained: number;
    coinsGained: number;
    events: string[];
  } => {
    const rng = freshRng(regionId.length * 37 + 222);
    const region = findRegion(regionId);
    const eqStats = jnGetEquipmentStats();

    const encounterNames: Record<JNEncounter["type"], string[]> = {
      wildlife: ["Ambush Predator", "Protective Mother", "Territorial Beast", "Pack Hunters"],
      trap: ["Pitfall", "Poison Darts", "Swinging Log", "Collapsing Floor"],
      weather: ["Sudden Downpour", "Wind Gust", "Lightning Strike", "Fog Bank"],
      npc: ["Wandering Merchant", "Fellow Explorer", "Stranded Villager", "Mysterious Stranger"],
      treasure: ["Hidden Cache", "Buried Chest", "Abandoned Supplies", "Natural Treasure"],
      ruin: ["Collapsed Passage", "Hidden Chamber", "Sacred Altar", "Guardian Statue"],
    };

    const name = prngPick(rng, encounterNames[encounterType]);
    const difficulty = region ? region.dangerLevel : 3;
    const power = eqStats.attack + eqStats.defense + eqStats.survival + eqStats.speed;
    const successChance = Math.min(0.95, 0.4 + power * 0.03 + (region ? (1 - region.dangerLevel / 10) * 0.2 : 0));
    const resolved = prngChance(rng, successChance);
    const outcome = resolved ? "victory" : "defeat";

    const xpGained = resolved ? prngInt(rng, 10, 30) * difficulty : prngInt(rng, 2, 8);
    const coinsGained = resolved ? prngInt(rng, 5, 20) * difficulty : 0;
    const events: string[] = resolved
      ? [`Successfully handled: ${name}`, `+${xpGained} XP, +${coinsGained} coins`]
      : [`Struggled with: ${name}`, `Only gained ${xpGained} XP as consolation`];

    const encounter: JNEncounter = {
      id: `enc_${regionId}_${Date.now()}`,
      type: encounterType,
      name,
      description: `${name} encountered in ${region?.name ?? "unknown region"}`,
      difficulty,
      resolved,
      outcome,
      rewards: { xpMin: xpGained, xpMax: xpGained, coinMin: coinsGained, coinMax: coinsGained, itemChance: 0, possibleItems: [] },
    };

    setState((prev) => ({
      ...prev,
      totalXP: prev.totalXP + xpGained,
      coins: prev.coins + coinsGained,
      totalCoinsEarned: prev.totalCoinsEarned + coinsGained,
      encounterLog: [...prev.encounterLog, encounter],
      statEncountersTotal: prev.statEncountersTotal + 1,
    }));

    return { success: resolved, encounter, xpGained, coinsGained, events };
  }, [freshRng, jnGetEquipmentStats]);

  const jnFleeEncounter = useCallback((): {
    success: boolean;
    xpGained: number;
    message: string;
  } => {
    const rng = freshRng(666);
    const eqStats = jnGetEquipmentStats();
    const fleeChance = 0.3 + eqStats.speed * 0.05 + eqStats.stealth * 0.03;
    const success = prngChance(rng, Math.min(0.9, fleeChance));

    setState((prev) => ({
      ...prev,
      totalXP: prev.totalXP + (success ? 2 : 0),
      statEncountersFled: prev.statEncountersFled + (success ? 1 : 0),
    }));

    return {
      success,
      xpGained: success ? 2 : 0,
      message: success ? "You successfully escaped into the undergrowth!" : "Your escape was blocked!",
    };
  }, [freshRng, jnGetEquipmentStats]);

  const jnGetEncounterLog = useCallback((): JNEncounter[] => {
    return [...state.encounterLog];
  }, [state.encounterLog]);

  // ===== EXPEDITION REPORT =====

  const jnGetExpeditionReport = useCallback((): {
    totalRegions: number;
    exploredRegions: number;
    totalWildlife: number;
    observedWildlife: number;
    totalRuins: number;
    excavatedRuins: number;
    totalEquipment: number;
    ownedEquipment: number;
    totalTreasures: number;
    foundTreasures: number;
    encountersWon: number;
    encountersTotal: number;
    achievementsUnlocked: number;
    questsCompleted: number;
    campsSetup: number;
    loreFragments: number;
  } => {
    const encountersWon = state.encounterLog.filter((e) => e.resolved).length;
    return {
      totalRegions: JN_REGIONS.length,
      exploredRegions: state.exploredRegions.length,
      totalWildlife: JN_WILDLIFE.length,
      observedWildlife: state.observedWildlife.length,
      totalRuins: JN_RUINS.length,
      excavatedRuins: state.excavatedRuins.length,
      totalEquipment: JN_EQUIPMENT.length,
      ownedEquipment: Object.keys(state.ownedEquipment).length,
      totalTreasures: 999,
      foundTreasures: state.treasures.length,
      encountersWon,
      encountersTotal: state.encounterLog.length,
      achievementsUnlocked: state.unlockedAchievements.length,
      questsCompleted: state.completedQuests.length,
      campsSetup: Object.keys(state.setupCamps).length,
      loreFragments: state.discoveredLore.length,
    };
  }, [state]);

  // ===== GLOBAL STATS =====

  const jnGetGlobalStats = useCallback((): Record<string, number> => {
    return {
      level: computeLevel(state.totalXP),
      totalXP: state.totalXP,
      coins: state.coins,
      totalCoinsEarned: state.totalCoinsEarned,
      regionsExplored: state.statRegionsExplored,
      wildlifeObserved: state.statWildlifeObserved,
      ruinsExcavated: state.statRuinsExcavated,
      treasuresFound: state.statTreasuresFound,
      encountersTotal: state.statEncountersTotal,
      encountersFled: state.statEncountersFled,
      dailyStreak: state.dailyStreak,
      achievementsUnlocked: state.unlockedAchievements.length,
      questsCompleted: state.completedQuests.length,
    };
  }, [state]);

  // ===== TERRAIN INFO =====

  const jnGetTerrainInfo = useCallback((terrainId: string): JNTerrain | null => {
    return findTerrain(terrainId) ?? null;
  }, []);

  const jnGetTerrains = useCallback((): JNTerrain[] => {
    return [...JN_TERRAINS];
  }, []);

  // ===== EXPLORATION LOG =====

  const jnGetExplorationLog = useCallback((): JNExplorationLog[] => {
    return [...state.explorationLog];
  }, [state.explorationLog]);

  const jnClearExplorationLog = useCallback((): void => {
    setState((prev) => ({ ...prev, explorationLog: [] }));
  }, []);

  // ===== IMPORT STATE (for hydration / save/load) =====

  const jnImportState = useCallback((imported: JNState): void => {
    setState(imported);
  }, []);

  // ===== REGION ACCESSIBILITY CHECK =====

  const jnCanAccessRegion = useCallback((regionId: string): boolean => {
    const region = findRegion(regionId);
    if (!region) return false;
    if (computeLevel(state.totalXP) < region.requiredLevel) return false;
    // Must have at least one explored connection or be starting region
    if (region.requiredLevel === 1) return true;
    return region.connections.some((c) => state.exploredRegions.includes(c));
  }, [state.totalXP, state.exploredRegions]);

  // ===== DANGER ASSESSMENT =====

  const jnAssessDanger = useCallback((regionId: string): {
    dangerLevel: number;
    survivabilityPercent: number;
    recommendation: string;
  } => {
    const region = findRegion(regionId);
    if (!region) return { dangerLevel: 0, survivabilityPercent: 100, recommendation: "Region unknown" };

    const eqStats = jnGetEquipmentStats();
    const guide = state.hiredGuide ? findNpc(state.hiredGuide) : null;
    const level = computeLevel(state.totalXP);

    const powerScore = eqStats.attack + eqStats.defense + eqStats.survival + level;
    const dangerScore = region.dangerLevel * 10;
    const guideBonus = guide ? guide.bonusValue * 10 : 0;
    const survivability = Math.min(99, Math.max(5, Math.round(((powerScore + guideBonus) / (dangerScore + 1)) * 50)));

    const recommendation = survivability > 80
      ? "Safe to explore freely"
      : survivability > 60
      ? "Exercise caution"
      : survivability > 40
      ? "Bring better equipment"
      : "Extremely dangerous—avoid if possible";

    return { dangerLevel: region.dangerLevel, survivabilityPercent: survivability, recommendation };
  }, [jnGetEquipmentStats, state.hiredGuide, state.totalXP]);

  // ===== RANDOM EVENT GENERATOR =====

  const jnGenerateRandomEvent = useCallback((): {
    event: string;
    type: string;
    effect: { xp?: number; coins?: number; item?: string };
  } => {
    const rng = freshRng(state.explorationLog.length * 29 + 111);
    const events = [
      { event: "You stumble upon a rare herb patch!", type: "discovery", effect: { xp: 15, coins: 10 } },
      { event: "A guide shows you a secret shortcut.", type: "navigation", effect: { xp: 10 } },
      { event: "You find ancient carvings on a rock face.", type: "lore", effect: { xp: 25 } },
      { event: "A friendly villager shares dried rations.", type: "supply", effect: { xp: 5, coins: 15 } },
      { event: "You discover a natural hot spring!", type: "rest", effect: { xp: 20, coins: 5 } },
      { event: "A monkey steals some of your supplies!", type: "hazard", effect: { coins: -10 } },
      { event: "You find a abandoned explorer's backpack.", type: "discovery", effect: { xp: 30, coins: 25 } },
      { event: "The jungle reveals a breathtaking vista.", type: "wonder", effect: { xp: 40 } },
      { event: "You uncover tracks of a rare creature.", type: "tracking", effect: { xp: 15 } },
      { event: "A sudden rockslide blocks the path!", type: "hazard", effect: { xp: 5 } },
      { event: "You rescue an injured bird and it leads you to a cache.", type: "compassion", effect: { xp: 35, coins: 20 } },
      { event: "Night falls and fireflies light your way.", type: "wonder", effect: { xp: 10 } },
    ];

    const selected = prngPick(rng, events);

    setState((prev) => {
      const newXp = selected.effect.xp ?? 0;
      const newCoins = selected.effect.coins ?? 0;
      return {
        ...prev,
        totalXP: Math.max(0, prev.totalXP + newXp),
        coins: Math.max(0, prev.coins + newCoins),
        totalCoinsEarned: prev.totalCoinsEarned + Math.max(0, newCoins),
      };
    });

    return selected;
  }, [freshRng, state.explorationLog.length]);

  // ===== COMPLETE EXPLORATION SUMMARY =====

  const jnGetRegionSummary = useCallback((regionId: string): {
    region: JNRegion | null;
    explored: boolean;
    campSetup: boolean;
    campLevel: number;
    ruinsInRegion: JNRuin[];
    ruinsExcavated: number;
    wildlifeInRegion: JNWildlifeSpecies[];
    wildlifeObserved: number;
    treasureCount: number;
    explorationCount: number;
  } => {
    const region = findRegion(regionId);
    const explored = state.exploredRegions.includes(regionId);
    const campEntry = Object.entries(state.setupCamps).find(([cid]) => findCamp(cid)?.regionId === regionId);
    const campSetup = !!campEntry;
    const campLevel = campEntry ? campEntry[1] : 0;
    const ruinsInRegion = JN_RUINS.filter((r) => r.regionId === regionId);
    const ruinsExcavated = ruinsInRegion.filter((r) => state.excavatedRuins.includes(r.id)).length;
    const wildlifeInRegion = region ? region.wildlifeIds.map((wid) => findWildlife(wid)).filter((w): w is JNWildlifeSpecies => w !== undefined) : [];
    const wildlifeObserved = wildlifeInRegion.filter((w) => state.observedWildlife.includes(w.id)).length;
    const treasureCount = state.treasures.filter((t) => t.regionId === regionId).length;
    const explorationCount = state.explorationLog.filter((log) => log.regionId === regionId).length;

    return {
      region: region ?? null,
      explored,
      campSetup,
      campLevel,
      ruinsInRegion,
      ruinsExcavated,
      wildlifeInRegion,
      wildlifeObserved,
      treasureCount,
      explorationCount,
    };
  }, [state.exploredRegions, state.setupCamps, state.excavatedRuins, state.observedWildlife, state.treasures, state.explorationLog]);

  // ===== RETURN ALL FUNCTIONS =====

  return {
    // State management
    jnGetState,
    jnResetState,
    jnGetSeed,
    jnSetSeed,
    jnImportState,

    // Level / XP
    jnGetLevel,
    jnGetTotalXP,
    jnGetXPToNext,
    jnGetTitle,
    jnGetProgress,
    jnAddXP,

    // Coins
    jnGetCoins,
    jnAddCoins,
    jnSpendCoins,
    jnGetTotalEarned,

    // Regions
    jnGetRegions,
    jnGetRegionDetails,
    jnIsRegionExplored,
    jnUnlockRegion,
    jnExploreRegion,
    jnGetRegionBonus,
    jnCanAccessRegion,
    jnAssessDanger,
    jnGetConnectedRegions,

    // Wildlife
    jnGetWildlife,
    jnObserveWildlife,
    jnGetWildlifeJournal,
    jnGetWildlifeRarity,

    // Equipment
    jnGetEquipment,
    jnBuyEquipment,
    jnEquipItem,
    jnUnequipItem,
    jnGetEquippedItems,
    jnGetEquipmentStats,

    // Camps
    jnGetCamps,
    jnSetupCamp,
    jnUpgradeCamp,
    jnRestAtCamp,
    jnGetCampBonus,

    // Ruins
    jnGetRuins,
    jnExcavateRuins,
    jnGetRuinsLore,
    jnDiscoverRuins,

    // Quests
    jnGetQuests,
    jnAcceptQuest,
    jnGetActiveQuests,
    jnGetQuestProgress,
    jnCompleteQuest,

    // NPCs / Guides
    jnGetNPCs,
    jnHireGuide,
    jnDismissGuide,
    jnGetActiveGuide,
    jnGetGuideBonus,
    jnGetGuideDialogue,

    // Achievements
    jnGetAchievements,
    jnCheckAchievements,
    jnGetAchievementProgress,
    jnGetUnlockedAchievements,

    // Daily Tasks
    jnGetDailyTask,
    jnUpdateDailyProgress,
    jnClaimDailyReward,
    jnResetDailyTasks,
    jnGetDailyStreak,
    jnIncrementDailyStreak,

    // Weather
    jnGetWeather,
    jnPredictWeather,
    jnGetWeatherHazard,

    // Treasure
    jnFindTreasure,
    jnGetTreasureLog,
    jnGetTreasureValue,

    // Navigation / Map
    jnGetMapData,
    jnGetDiscoveredPaths,
    jnGetNavigationStats,

    // Encounters
    jnHandleEncounter,
    jnFleeEncounter,
    jnGetEncounterLog,

    // Terrain
    jnGetTerrainInfo,
    jnGetTerrains,

    // Logs & Reports
    jnGetExplorationLog,
    jnClearExplorationLog,
    jnGetExpeditionReport,
    jnGetGlobalStats,

    // Region Summary
    jnGetRegionSummary,

    // Random Events
    jnGenerateRandomEvent,
  };
}

export default useJungleNavigator;
