// ============================================================================
// Nether World Wire (幽冥世界)
// Dark underworld exploration: ghostly realms, soul harvesting, demon encounters
// ============================================================================

// ============================================================================
// Enums & Constants
// ============================================================================

export const NETHER_REALM_IDS = [
  'shadow_marches',
  'weeping_catacombs',
  'phantom_gardens',
  'bone_spire_wastes',
  'obsidian_throne',
  'spectral_sea',
  'void_hollows',
  'soul_furnace',
] as const;

export type NetherRealmId = (typeof NETHER_REALM_IDS)[number];

export const SOUL_TYPE_IDS = [
  'lost',
  'restless',
  'ancient',
  'vengeful',
  'whispering',
  'crystallized',
  'shattered',
  'twilight',
  'echoing',
  'wandering',
  'bound',
  'ascending',
  'corrupted',
  'transcendent',
] as const;

export type SoulTypeId = (typeof SOUL_TYPE_IDS)[number];

export const DEMON_TYPE_IDS = [
  'imp',
  'shade_stalker',
  'wraith_lord',
  'hellhound',
  'succubus',
  'bone_collector',
  'flame_wraith',
  'ice_devourer',
  'void_titan',
  'soul_reaver',
] as const;

export type DemonTypeId = (typeof DEMON_TYPE_IDS)[number];

export const RIVER_IDS = [
  'styx',
  'acheron',
  'lethe',
  'phlegethon',
  'cocytus',
] as const;

export type RiverId = (typeof RIVER_IDS)[number];

export const ELEMENT_IDS = [
  'shadow',
  'fire',
  'ice',
  'void',
  'bone',
  'spirit',
  'lightning',
  'plague',
] as const;

export type ElementId = (typeof ELEMENT_IDS)[number];

export const ABILITY_IDS = [
  'phase_shift',
  'possess',
  'siphon',
  'wail',
  'veil_walk',
  'death_grip',
  'spectral_form',
  'soul_bind',
] as const;

export type AbilityId = (typeof ABILITY_IDS)[number];

export const BAZAAR_ITEM_IDS = [
  'soul_shard',
  'spectral_essence',
  'obsidian_key',
  'lantern_oil',
  'void_crystal',
  'wraith_cloak',
  'bone_charm',
  'phantom_dust',
  'abyssal_map',
  'hellfire_ingot',
  'spirit_veil',
  'death_whistle',
  'nether_compass',
  'soul_anchor',
  'ethereal_lens',
] as const;

export type BazaarItemId = (typeof BAZAAR_ITEM_IDS)[number];

export const ACHIEVEMENT_IDS = [
  'first_harvest',
  'realm_explorer',
  'demon_slayer',
  'river_crosser',
  'lantern_keeper',
  'spectral_master',
  'bazaar_haggler',
  'wraith_ascendant',
  'soul_collector',
  'phantom_navigator',
  'bone_collector_ach',
  'void_walker',
  'furnace_born',
  'daily_expeditioner',
  'transcendent_wraith',
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

// ============================================================================
// Interfaces (all readonly properties)
// ============================================================================

export interface NetherRealm {
  readonly id: NetherRealmId;
  readonly name: string;
  readonly description: string;
  readonly dangerLevel: number;
  readonly theme: string;
  readonly requiredWraithLevel: number;
  readonly soulTypes: readonly SoulTypeId[];
  readonly demonTypes: readonly DemonTypeId[];
  readonly riverCrossing: RiverId | null;
  readonly ambientGlow: string;
}

export interface SoulType {
  readonly id: SoulTypeId;
  readonly name: string;
  readonly description: string;
  readonly power: number;
  readonly rarity: number;
  readonly element: ElementId;
  readonly harvestDifficulty: number;
}

export interface DemonType {
  readonly id: DemonTypeId;
  readonly name: string;
  readonly description: string;
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly weakness: ElementId;
  readonly resistance: ElementId;
  readonly soulReward: SoulTypeId;
  readonly experienceReward: number;
  readonly wraithLevel: number;
}

export interface UnderworldRiver {
  readonly id: RiverId;
  readonly name: string;
  readonly description: string;
  readonly dangerLevel: number;
  readonly challengeType: string;
  readonly crossingCost: number;
  readonly element: ElementId;
}

export interface SpectralAbility {
  readonly id: AbilityId;
  readonly name: string;
  readonly description: string;
  readonly manaCost: number;
  readonly cooldown: number;
  readonly unlockLevel: number;
  readonly element: ElementId;
  readonly duration: number;
  readonly effect: string;
}

export interface Achievement {
  readonly id: AchievementId;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly requirement: string;
  readonly rewardXp: number;
  readonly rewardSoulShards: number;
}

export interface BazaarItem {
  readonly id: BazaarItemId;
  readonly name: string;
  readonly description: string;
  readonly basePrice: number;
  readonly stackable: boolean;
  readonly maxStack: number;
  readonly category: string;
  readonly rarity: number;
}

export interface GhostShip {
  readonly durability: number;
  readonly maxDurability: number;
  readonly speed: number;
  readonly capacity: number;
  readonly currentRealm: NetherRealmId;
  readonly destination: NetherRealmId | null;
  readonly isSailing: boolean;
}

export interface SoulLantern {
  readonly fuel: number;
  readonly maxFuel: number;
  readonly lightLevel: number;
  readonly maxLightLevel: number;
  readonly isActive: boolean;
  readonly lanternColor: string;
  readonly bonusRadius: number;
}

export type SoulCollection = { readonly [K in SoulTypeId]: number };
export type UnlockedAbilities = { readonly [K in AbilityId]: boolean };
export type BazaarInventory = { readonly [K in BazaarItemId]: number };
export type AchievementProgress = { readonly [K in AchievementId]: number };
export type RealmDiscovery = { readonly [K in NetherRealmId]: boolean };
export type RiverCrossingRecord = { readonly [K in RiverId]: number };

export interface WraithStats {
  readonly level: number;
  readonly experience: number;
  readonly experienceToNext: number;
  readonly maxHealth: number;
  readonly attack: number;
  readonly defense: number;
  readonly spiritPower: number;
  readonly mana: number;
  readonly maxMana: number;
}

export interface DemonEncounter {
  readonly demonId: DemonTypeId;
  readonly currentHp: number;
  readonly maxHp: number;
  readonly isDefeated: boolean;
  readonly turnCount: number;
  readonly statusEffects: readonly StatusEffect[];
}

export interface StatusEffect {
  readonly id: string;
  readonly name: string;
  readonly duration: number;
  readonly potency: number;
  readonly element: ElementId;
}

export interface NetherExpedition {
  readonly isActive: boolean;
  readonly realmId: NetherRealmId;
  readonly stepsCompleted: number;
  readonly totalSteps: number;
  readonly soulsHarvested: number;
  readonly demonsDefeated: number;
  readonly lootCollected: readonly BazaarItemId[];
  readonly startTime: number;
  readonly bonusRewards: boolean;
}

export interface DailyExpeditionState {
  readonly isAvailable: boolean;
  readonly completedToday: boolean;
  readonly realmId: NetherRealmId;
  readonly rewardMultiplier: number;
  readonly bonusSoulType: SoulTypeId | null;
  readonly dayOfYear: number;
}

export interface CombatLog {
  readonly id: string;
  readonly turn: number;
  readonly action: string;
  readonly damage: number;
  readonly attacker: string;
  readonly target: string;
  readonly element: ElementId;
  readonly isCritical: boolean;
}

export interface MapNode {
  readonly id: string;
  readonly realmId: NetherRealmId;
  readonly name: string;
  readonly description: string;
  readonly isExplored: boolean;
  readonly hasSoul: boolean;
  readonly soulType: SoulTypeId | null;
  readonly hasDemon: boolean;
  readonly demonType: DemonTypeId | null;
  readonly connectedNodes: readonly string[];
  readonly dangerLevel: number;
  readonly loot: readonly BazaarItemId[];
}

export interface NetherWorldState {
  readonly currentRealm: NetherRealmId;
  readonly wraithStats: WraithStats;
  readonly soulCollection: SoulCollection;
  readonly abilities: UnlockedAbilities;
  readonly lantern: SoulLantern;
  readonly ship: GhostShip;
  readonly encounter: DemonEncounter | null;
  readonly expedition: NetherExpedition;
  readonly dailyExpedition: DailyExpeditionState;
  readonly bazaarInventory: BazaarInventory;
  readonly achievements: AchievementProgress;
  readonly discoveredRealms: RealmDiscovery;
  readonly riverCrossings: RiverCrossingRecord;
  readonly gold: number;
  readonly soulShards: number;
  readonly combatLog: readonly CombatLog[];
  readonly mapNodes: readonly MapNode[];
  readonly currentNodeId: string;
  readonly totalSoulPower: number;
  readonly totalDemonsDefeated: number;
  readonly totalRiversCrossed: number;
  readonly totalExpeditionsCompleted: number;
  readonly currentAbilityCooldowns: readonly Readonly<{ abilityId: AbilityId; remaining: number }>[];
  readonly statusEffects: readonly StatusEffect[];
  readonly isInCombat: boolean;
  readonly isInExpedition: boolean;
  readonly hasLanternActive: boolean;
  readonly phaseShiftActive: boolean;
  readonly spectralFormActive: boolean;
}

// ============================================================================
// Data Tables
// ============================================================================

export const NETHER_REALMS: readonly NetherRealm[] = [
  {
    id: 'shadow_marches',
    name: 'Shadow Marches',
    description: 'Mist-shrouded wetlands where shadows move with purpose and lost souls wander endlessly.',
    dangerLevel: 1,
    theme: 'dark_swamp',
    requiredWraithLevel: 1,
    soulTypes: ['lost', 'restless', 'whispering'],
    demonTypes: ['imp', 'shade_stalker'],
    riverCrossing: 'styx',
    ambientGlow: '#1a0a2e',
  },
  {
    id: 'weeping_catacombs',
    name: 'Weeping Catacombs',
    description: 'Endless burial halls filled with the echoing sobs of forgotten dead.',
    dangerLevel: 2,
    theme: 'bone_catacomb',
    requiredWraithLevel: 5,
    soulTypes: ['bound', 'echoing', 'shattered'],
    demonTypes: ['shade_stalker', 'bone_collector', 'imp'],
    riverCrossing: 'acheron',
    ambientGlow: '#2d1b3d',
  },
  {
    id: 'phantom_gardens',
    name: 'Phantom Gardens',
    description: 'Ethereal blooms that feed on memories grow in spectral soil beneath pale moonlight.',
    dangerLevel: 3,
    theme: 'ghost_garden',
    requiredWraithLevel: 10,
    soulTypes: ['whispering', 'twilight', 'ancient'],
    demonTypes: ['wraith_lord', 'succubus'],
    riverCrossing: 'lethe',
    ambientGlow: '#1e3a2f',
  },
  {
    id: 'bone_spire_wastes',
    name: 'Bone Spire Wastes',
    description: 'Towering spires of fused bone pierce a sky of perpetual ash and ember.',
    dangerLevel: 4,
    theme: 'bone_waste',
    requiredWraithLevel: 15,
    soulTypes: ['vengeful', 'shattered', 'corrupted'],
    demonTypes: ['bone_collector', 'flame_wraith', 'hellhound'],
    riverCrossing: 'phlegethon',
    ambientGlow: '#3d1b1b',
  },
  {
    id: 'obsidian_throne',
    name: 'Obsidian Throne',
    description: 'A citadel of black glass where demon lords hold court over legions of the damned.',
    dangerLevel: 5,
    theme: 'dark_throne',
    requiredWraithLevel: 20,
    soulTypes: ['ancient', 'corrupted', 'crystallized'],
    demonTypes: ['wraith_lord', 'soul_reaver', 'void_titan'],
    riverCrossing: null,
    ambientGlow: '#0d0d0d',
  },
  {
    id: 'spectral_sea',
    name: 'Spectral Sea',
    description: 'An ocean of liquid spirit where ghost ships sail between dimensional shores.',
    dangerLevel: 6,
    theme: 'ghost_sea',
    requiredWraithLevel: 25,
    soulTypes: ['wandering', 'echoing', 'ascending'],
    demonTypes: ['ice_devourer', 'hellhound', 'succubus'],
    riverCrossing: 'cocytus',
    ambientGlow: '#0a1628',
  },
  {
    id: 'void_hollows',
    name: 'Void Hollows',
    description: 'Fractures in reality where existence itself breaks down into pure nothingness.',
    dangerLevel: 7,
    theme: 'void_realm',
    requiredWraithLevel: 35,
    soulTypes: ['transcendent', 'crystallized', 'ascending'],
    demonTypes: ['void_titan', 'soul_reaver'],
    riverCrossing: null,
    ambientGlow: '#050510',
  },
  {
    id: 'soul_furnace',
    name: 'Soul Furnace',
    description: 'The infernal heart of the nether world where souls are reforged or annihilated.',
    dangerLevel: 8,
    theme: 'infernal_furnace',
    requiredWraithLevel: 45,
    soulTypes: ['corrupted', 'transcendent', 'vengeful'],
    demonTypes: ['flame_wraith', 'soul_reaver', 'void_titan'],
    riverCrossing: 'phlegethon',
    ambientGlow: '#4a0a00',
  },
] as const;

export const SOUL_TYPES: readonly SoulType[] = [
  { id: 'lost', name: 'Lost Soul', description: 'A soul that has forgotten its past entirely.', power: 5, rarity: 1, element: 'shadow', harvestDifficulty: 1 },
  { id: 'restless', name: 'Restless Spirit', description: 'Cannot find peace, forever wandering.', power: 8, rarity: 1, element: 'spirit', harvestDifficulty: 1 },
  { id: 'ancient', name: 'Ancient Soul', description: 'Carries wisdom from millennia of existence.', power: 25, rarity: 4, element: 'bone', harvestDifficulty: 4 },
  { id: 'vengeful', name: 'Vengeful Wraith', description: 'Burning with hatred from beyond the grave.', power: 18, rarity: 3, element: 'fire', harvestDifficulty: 3 },
  { id: 'whispering', name: 'Whispering Echo', description: 'Speaks secrets of the dead in hushed tones.', power: 10, rarity: 2, element: 'spirit', harvestDifficulty: 2 },
  { id: 'crystallized', name: 'Crystallized Soul', description: 'Compressed into a perfect ethereal gem.', power: 35, rarity: 5, element: 'ice', harvestDifficulty: 5 },
  { id: 'shattered', name: 'Shattered Fragment', description: 'A broken piece of a once-great soul.', power: 7, rarity: 1, element: 'bone', harvestDifficulty: 1 },
  { id: 'twilight', name: 'Twilight Soul', description: 'Exists between day and night, life and death.', power: 15, rarity: 3, element: 'shadow', harvestDifficulty: 2 },
  { id: 'echoing', name: 'Echoing Spirit', description: 'Repeats the final moments of its life endlessly.', power: 12, rarity: 2, element: 'spirit', harvestDifficulty: 2 },
  { id: 'wandering', name: 'Wandering Ghost', description: 'Travels the nether world seeking a way home.', power: 9, rarity: 2, element: 'shadow', harvestDifficulty: 1 },
  { id: 'bound', name: 'Bound Soul', description: 'Chained to a specific location or object.', power: 14, rarity: 3, element: 'bone', harvestDifficulty: 2 },
  { id: 'ascending', name: 'Ascending Spirit', description: 'On the verge of transcendence but held back.', power: 30, rarity: 5, element: 'lightning', harvestDifficulty: 4 },
  { id: 'corrupted', name: 'Corrupted Soul', description: 'Twisted by dark magic into something sinister.', power: 22, rarity: 4, element: 'plague', harvestDifficulty: 4 },
  { id: 'transcendent', name: 'Transcendent Soul', description: 'Has achieved perfect spiritual clarity.', power: 50, rarity: 5, element: 'lightning', harvestDifficulty: 5 },
] as const;

export const DEMON_TYPES: readonly DemonType[] = [
  { id: 'imp', name: 'Nether Imp', description: 'Mischievous but dangerous in swarms.', hp: 30, attack: 8, defense: 3, weakness: 'lightning', resistance: 'fire', soulReward: 'lost', experienceReward: 15, wraithLevel: 1 },
  { id: 'shade_stalker', name: 'Shade Stalker', description: 'Hunts from the shadows with silent precision.', hp: 55, attack: 14, defense: 7, weakness: 'lightning', resistance: 'shadow', soulReward: 'restless', experienceReward: 30, wraithLevel: 3 },
  { id: 'wraith_lord', name: 'Wraith Lord', description: 'Commands lesser wraiths with devastating power.', hp: 120, attack: 28, defense: 15, weakness: 'fire', resistance: 'shadow', soulReward: 'ancient', experienceReward: 80, wraithLevel: 10 },
  { id: 'hellhound', name: 'Hellhound', description: 'A three-headed beast of infernal flame.', hp: 80, attack: 22, defense: 10, weakness: 'ice', resistance: 'fire', soulReward: 'vengeful', experienceReward: 50, wraithLevel: 8 },
  { id: 'succubus', name: 'Succubus', description: 'Drains the will and spirit of her victims.', hp: 70, attack: 18, defense: 8, weakness: 'lightning', resistance: 'spirit', soulReward: 'twilight', experienceReward: 45, wraithLevel: 7 },
  { id: 'bone_collector', name: 'Bone Collector', description: 'Assembles armies from the remains of the dead.', hp: 100, attack: 20, defense: 25, weakness: 'fire', resistance: 'bone', soulReward: 'bound', experienceReward: 65, wraithLevel: 12 },
  { id: 'flame_wraith', name: 'Flame Wraith', description: 'Born from the agony of burning souls.', hp: 90, attack: 30, defense: 12, weakness: 'ice', resistance: 'fire', soulReward: 'corrupted', experienceReward: 70, wraithLevel: 15 },
  { id: 'ice_devourer', name: 'Ice Devourer', description: 'Freezes souls and shatters them for sustenance.', hp: 95, attack: 25, defense: 18, weakness: 'fire', resistance: 'ice', soulReward: 'crystallized', experienceReward: 75, wraithLevel: 18 },
  { id: 'void_titan', name: 'Void Titan', description: 'A massive entity from beyond the edge of reality.', hp: 200, attack: 40, defense: 30, weakness: 'lightning', resistance: 'void', soulReward: 'transcendent', experienceReward: 150, wraithLevel: 30 },
  { id: 'soul_reaver', name: 'Soul Reaver', description: 'The ultimate predator of the nether world.', hp: 150, attack: 35, defense: 20, weakness: 'fire', resistance: 'plague', soulReward: 'ascending', experienceReward: 120, wraithLevel: 25 },
] as const;

export const UNDERWORLD_RIVERS: readonly UnderworldRiver[] = [
  { id: 'styx', name: 'River Styx', description: 'The river of hatred. Its waters erode memories and resolve.', dangerLevel: 1, challengeType: 'willpower', crossingCost: 50, element: 'shadow' },
  { id: 'acheron', name: 'River Acheron', description: 'The river of woe. Endless lamentation drowns those who waver.', dangerLevel: 2, challengeType: 'endurance', crossingCost: 100, element: 'bone' },
  { id: 'lethe', name: 'River Lethe', description: 'The river of forgetfulness. One sip erases a lifetime.', dangerLevel: 3, challengeType: 'memory', crossingCost: 150, element: 'spirit' },
  { id: 'phlegethon', name: 'River Phlegethon', description: 'The river of fire. Boiling blood and molten metal flow eternally.', dangerLevel: 4, challengeType: 'resistance', crossingCost: 200, element: 'fire' },
  { id: 'cocytus', name: 'River Cocytus', description: 'The river of lamentation. Frozen tears form its bitter current.', dangerLevel: 5, challengeType: 'fortitude', crossingCost: 250, element: 'ice' },
] as const;

export const SPECTRAL_ABILITIES: readonly SpectralAbility[] = [
  { id: 'phase_shift', name: 'Phase Shift', description: 'Pass through solid matter for a brief moment.', manaCost: 15, cooldown: 3, unlockLevel: 1, element: 'shadow', duration: 2, effect: 'intangible' },
  { id: 'possess', name: 'Possess', description: 'Take control of a weaker demon temporarily.', manaCost: 30, cooldown: 5, unlockLevel: 5, element: 'spirit', duration: 3, effect: 'control' },
  { id: 'siphon', name: 'Soul Siphon', description: 'Drain spiritual energy from nearby souls.', manaCost: 20, cooldown: 2, unlockLevel: 3, element: 'spirit', duration: 1, effect: 'drain' },
  { id: 'wail', name: 'Death Wail', description: 'Emit a devastating spectral scream.', manaCost: 25, cooldown: 4, unlockLevel: 8, element: 'bone', duration: 1, effect: 'damage' },
  { id: 'veil_walk', name: 'Veil Walk', description: 'Step between the veil of life and death.', manaCost: 35, cooldown: 6, unlockLevel: 12, element: 'shadow', duration: 4, effect: 'stealth' },
  { id: 'death_grip', name: 'Death Grip', description: 'Reach across the veil and grasp a target.', manaCost: 20, cooldown: 3, unlockLevel: 15, element: 'bone', duration: 1, effect: 'stun' },
  { id: 'spectral_form', name: 'Spectral Form', description: 'Transform into pure spectral energy.', manaCost: 50, cooldown: 8, unlockLevel: 20, element: 'spirit', duration: 5, effect: 'transform' },
  { id: 'soul_bind', name: 'Soul Bind', description: 'Chain souls together, sharing damage and healing.', manaCost: 40, cooldown: 7, unlockLevel: 25, element: 'spirit', duration: 3, effect: 'link' },
] as const;

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first_harvest', name: 'First Harvest', description: 'Harvest your first soul.', icon: '👻', requirement: 'harvest_soul', rewardXp: 50, rewardSoulShards: 5 },
  { id: 'realm_explorer', name: 'Realm Explorer', description: 'Discover all 8 nether realms.', icon: '🗺️', requirement: 'discover_realms', rewardXp: 500, rewardSoulShards: 50 },
  { id: 'demon_slayer', name: 'Demon Slayer', description: 'Defeat 100 demons.', icon: '⚔️', requirement: 'defeat_demons', rewardXp: 300, rewardSoulShards: 30 },
  { id: 'river_crosser', name: 'River Crosser', description: 'Cross all 5 underworld rivers.', icon: '🌊', requirement: 'cross_rivers', rewardXp: 400, rewardSoulShards: 40 },
  { id: 'lantern_keeper', name: 'Lantern Keeper', description: 'Keep your soul lantern at maximum light for 10 explorations.', icon: '🏮', requirement: 'lantern_max', rewardXp: 200, rewardSoulShards: 20 },
  { id: 'spectral_master', name: 'Spectral Master', description: 'Unlock all 8 spectral abilities.', icon: '👁️', requirement: 'unlock_abilities', rewardXp: 600, rewardSoulShards: 60 },
  { id: 'bazaar_haggler', name: 'Bazaar Haggler', description: 'Complete 50 trades at the underworld bazaar.', icon: '💰', requirement: 'bazaar_trades', rewardXp: 250, rewardSoulShards: 25 },
  { id: 'wraith_ascendant', name: 'Wraith Ascendant', description: 'Reach Wraith Level 50.', icon: '👑', requirement: 'max_level', rewardXp: 1000, rewardSoulShards: 100 },
  { id: 'soul_collector', name: 'Soul Collector', description: 'Collect 500 total souls.', icon: '✨', requirement: 'collect_souls', rewardXp: 400, rewardSoulShards: 40 },
  { id: 'phantom_navigator', name: 'Phantom Navigator', description: 'Sail the ghost ship to all reachable realms.', icon: '⛵', requirement: 'navigate_ship', rewardXp: 350, rewardSoulShards: 35 },
  { id: 'bone_collector_ach', name: 'Bone Collector', description: 'Collect 100 bone element souls.', icon: '🦴', requirement: 'bone_souls', rewardXp: 300, rewardSoulShards: 30 },
  { id: 'void_walker', name: 'Void Walker', description: 'Survive 10 encounters in the Void Hollows.', icon: '🕳️', requirement: 'void_survival', rewardXp: 500, rewardSoulShards: 50 },
  { id: 'furnace_born', name: 'Furnace Born', description: 'Defeat a demon in the Soul Furnace.', icon: '🔥', requirement: 'furnace_victory', rewardXp: 450, rewardSoulShards: 45 },
  { id: 'daily_expeditioner', name: 'Daily Expeditioner', description: 'Complete 30 daily expeditions.', icon: '📅', requirement: 'daily_expeditions', rewardXp: 350, rewardSoulShards: 35 },
  { id: 'transcendent_wraith', name: 'Transcendent Wraith', description: 'Harvest a Transcendent Soul.', icon: '🌟', requirement: 'transcendent_soul', rewardXp: 800, rewardSoulShards: 80 },
] as const;

export const BAZAAR_ITEMS: readonly BazaarItem[] = [
  { id: 'soul_shard', name: 'Soul Shard', description: 'A fragment of crystallized soul energy. Universal currency.', basePrice: 10, stackable: true, maxStack: 999, category: 'currency', rarity: 1 },
  { id: 'spectral_essence', name: 'Spectral Essence', description: 'Pure spectral energy used to fuel abilities.', basePrice: 25, stackable: true, maxStack: 99, category: 'consumable', rarity: 2 },
  { id: 'obsidian_key', name: 'Obsidian Key', description: 'Opens locked chambers in the catacombs.', basePrice: 100, stackable: true, maxStack: 10, category: 'key', rarity: 3 },
  { id: 'lantern_oil', name: 'Lantern Oil', description: 'Fuel for the soul lantern. Burns with ethereal flame.', basePrice: 15, stackable: true, maxStack: 50, category: 'consumable', rarity: 1 },
  { id: 'void_crystal', name: 'Void Crystal', description: 'A shard of crystallized void energy.', basePrice: 200, stackable: true, maxStack: 20, category: 'material', rarity: 4 },
  { id: 'wraith_cloak', name: 'Wraith Cloak', description: 'Woven from shadow threads. Grants stealth.', basePrice: 500, stackable: false, maxStack: 1, category: 'equipment', rarity: 4 },
  { id: 'bone_charm', name: 'Bone Charm', description: 'Carved from the bones of the ancient dead.', basePrice: 75, stackable: true, maxStack: 5, category: 'trinket', rarity: 2 },
  { id: 'phantom_dust', name: 'Phantom Dust', description: 'Residue of dispelled specters.', basePrice: 30, stackable: true, maxStack: 99, category: 'material', rarity: 1 },
  { id: 'abyssal_map', name: 'Abyssal Map', description: 'Reveals hidden passages in the nether world.', basePrice: 150, stackable: true, maxStack: 5, category: 'utility', rarity: 3 },
  { id: 'hellfire_ingot', name: 'Hellfire Ingot', description: 'Forged in the Phlegethon. Burns with eternal flame.', basePrice: 300, stackable: true, maxStack: 10, category: 'material', rarity: 4 },
  { id: 'spirit_veil', name: 'Spirit Veil', description: 'A thin membrane that shields from soul damage.', basePrice: 400, stackable: false, maxStack: 1, category: 'equipment', rarity: 4 },
  { id: 'death_whistle', name: 'Death Whistle', description: 'Its sound weakens demon resolve.', basePrice: 250, stackable: true, maxStack: 3, category: 'trinket', rarity: 3 },
  { id: 'nether_compass', name: 'Nether Compass', description: 'Points toward the nearest soul cluster.', basePrice: 120, stackable: false, maxStack: 1, category: 'utility', rarity: 2 },
  { id: 'soul_anchor', name: 'Soul Anchor', description: 'Prevents soul loss during river crossings.', basePrice: 350, stackable: true, maxStack: 3, category: 'trinket', rarity: 4 },
  { id: 'ethereal_lens', name: 'Ethereal Lens', description: 'See through illusions and hidden realms.', basePrice: 450, stackable: false, maxStack: 1, category: 'utility', rarity: 5 },
] as const;

// ============================================================================
// Initial State Factory
// ============================================================================

function nwMakeEmptySoulCollection(): SoulCollection {
  const out = {} as Record<string, number>;
  for (const id of SOUL_TYPE_IDS) out[id] = 0;
  return out as SoulCollection;
}

function nwMakeEmptyBazaarInventory(): BazaarInventory {
  const out = {} as Record<string, number>;
  for (const id of BAZAAR_ITEM_IDS) out[id] = 0;
  return out as BazaarInventory;
}

function nwMakeEmptyAchievementProgress(): AchievementProgress {
  const out = {} as Record<string, number>;
  for (const id of ACHIEVEMENT_IDS) out[id] = 0;
  return out as AchievementProgress;
}

function nwMakeEmptyAbilities(): UnlockedAbilities {
  const out = {} as Record<string, boolean>;
  for (const id of ABILITY_IDS) out[id] = false;
  return out as UnlockedAbilities;
}

function nwMakeEmptyRealmDiscovery(): RealmDiscovery {
  const out = {} as Record<string, boolean>;
  for (const id of NETHER_REALM_IDS) out[id] = id === 'shadow_marches';
  return out as RealmDiscovery;
}

function nwMakeEmptyRiverCrossings(): RiverCrossingRecord {
  const out = {} as Record<string, number>;
  for (const id of RIVER_IDS) out[id] = 0;
  return out as RiverCrossingRecord;
}

function nwCalcXpToLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

function nwBuildMapNodes(): readonly MapNode[] {
  const allNodes: MapNode[] = [];

  for (const realmId of NETHER_REALM_IDS) {
    const realm = NETHER_REALMS.find(r => r.id === realmId)!;
    const nodeCount = 2 + realm.dangerLevel;
    const realmNodeIds: string[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const nid = `${realmId}_node_${i}`;
      const hasSoul = i % 2 === 0;
      const hasDemon = i % 3 === 0 && i > 0;
      realmNodeIds.push(nid);
      allNodes.push({
        id: nid,
        realmId,
        name: `${realm.name} - Chamber ${i + 1}`,
        description: `A ${hasDemon ? 'dangerous' : hasSoul ? 'haunted' : 'quiet'} chamber in ${realm.name}.`,
        isExplored: realmId === 'shadow_marches' && i === 0,
        hasSoul,
        soulType: hasSoul ? realm.soulTypes[i % realm.soulTypes.length] : null,
        hasDemon,
        demonType: hasDemon ? realm.demonTypes[Math.floor(i / 3) % realm.demonTypes.length] : null,
        connectedNodes: [],
        dangerLevel: realm.dangerLevel,
        loot: hasSoul ? [BAZAAR_ITEM_IDS[i % BAZAAR_ITEM_IDS.length]] : [],
      });
    }

    for (let i = 0; i < realmNodeIds.length; i++) {
      const idx = allNodes.findIndex(n => n.id === realmNodeIds[i]);
      if (idx < 0) continue;
      const connected: string[] = [];
      if (i > 0) connected.push(realmNodeIds[i - 1]);
      if (i < realmNodeIds.length - 1) connected.push(realmNodeIds[i + 1]);
      allNodes[idx] = { ...allNodes[idx], connectedNodes: connected };
    }
  }

  return allNodes;
}

function nwCreateInitialState(): NetherWorldState {
  const level = 1;
  return {
    currentRealm: 'shadow_marches',
    wraithStats: {
      level,
      experience: 0,
      experienceToNext: nwCalcXpToLevel(level),
      maxHealth: 50,
      attack: 10,
      defense: 5,
      spiritPower: 8,
      mana: 30,
      maxMana: 30,
    },
    soulCollection: nwMakeEmptySoulCollection(),
    abilities: nwMakeEmptyAbilities(),
    lantern: {
      fuel: 100,
      maxFuel: 100,
      lightLevel: 1,
      maxLightLevel: 10,
      isActive: true,
      lanternColor: '#4a90d9',
      bonusRadius: 2,
    },
    ship: {
      durability: 100,
      maxDurability: 100,
      speed: 1,
      capacity: 20,
      currentRealm: 'shadow_marches',
      destination: null,
      isSailing: false,
    },
    encounter: null,
    expedition: {
      isActive: false,
      realmId: 'shadow_marches',
      stepsCompleted: 0,
      totalSteps: 10,
      soulsHarvested: 0,
      demonsDefeated: 0,
      lootCollected: [],
      startTime: 0,
      bonusRewards: false,
    },
    dailyExpedition: {
      isAvailable: true,
      completedToday: false,
      realmId: 'shadow_marches',
      rewardMultiplier: 1,
      bonusSoulType: null,
      dayOfYear: 1,
    },
    bazaarInventory: nwMakeEmptyBazaarInventory(),
    achievements: nwMakeEmptyAchievementProgress(),
    discoveredRealms: nwMakeEmptyRealmDiscovery(),
    riverCrossings: nwMakeEmptyRiverCrossings(),
    gold: 0,
    soulShards: 50,
    combatLog: [],
    mapNodes: nwBuildMapNodes(),
    currentNodeId: 'shadow_marches_node_0',
    totalSoulPower: 0,
    totalDemonsDefeated: 0,
    totalRiversCrossed: 0,
    totalExpeditionsCompleted: 0,
    currentAbilityCooldowns: [],
    statusEffects: [],
    isInCombat: false,
    isInExpedition: false,
    hasLanternActive: true,
    phaseShiftActive: false,
    spectralFormActive: false,
  };
}

// ============================================================================
// Internal Helpers
// ============================================================================

function nwComputeSoulPower(collection: SoulCollection): number {
  let total = 0;
  for (const id of SOUL_TYPE_IDS) {
    const info = SOUL_TYPES.find(s => s.id === id);
    if (info) total += (collection as Record<string, number>)[id] * info.power;
  }
  return total;
}

function nwCheckLevelUp(xp: number, currentLevel: number): { experience: number; level: number; experienceToNext: number } {
  let level = currentLevel;
  let remaining = xp;
  let xpToNext = nwCalcXpToLevel(level);
  while (remaining >= xpToNext && level < 50) {
    remaining -= xpToNext;
    level++;
    xpToNext = nwCalcXpToLevel(level);
  }
  return { experience: remaining, level, experienceToNext: xpToNext };
}

function nwApplyLevelUpStats(stats: WraithStats, newLevel: number): WraithStats {
  return {
    ...stats,
    level: newLevel,
    maxHealth: 50 + (newLevel - 1) * 10,
    attack: 10 + (newLevel - 1) * 3,
    defense: 5 + (newLevel - 1) * 2,
    spiritPower: 8 + (newLevel - 1) * 2,
    maxMana: 30 + (newLevel - 1) * 5,
  };
}

// ============================================================================
// State Accessors
// ============================================================================

export function nwGetState(state: NetherWorldState): NetherWorldState {
  return state;
}

export function nwGetWraithLevel(state: NetherWorldState): number {
  return state.wraithStats.level;
}

export function nwGetExperience(state: NetherWorldState): number {
  return state.wraithStats.experience;
}

export function nwGetExperienceToNext(state: NetherWorldState): number {
  return state.wraithStats.experienceToNext;
}

export function nwGetExperienceProgress(state: NetherWorldState): number {
  const { experience, experienceToNext } = state.wraithStats;
  if (experienceToNext === 0) return 0;
  return experience / experienceToNext;
}

export function nwGetGold(state: NetherWorldState): number {
  return state.gold;
}

export function nwGetSoulShards(state: NetherWorldState): number {
  return state.soulShards;
}

export function nwGetCurrentRealm(state: NetherWorldState): NetherRealmId {
  return state.currentRealm;
}

export function nwGetRealmInfo(realmId: NetherRealmId): NetherRealm | undefined {
  return NETHER_REALMS.find(r => r.id === realmId);
}

export function nwGetRealmByName(name: string): NetherRealm | undefined {
  return NETHER_REALMS.find(r => r.name === name);
}

export function nwGetAllRealms(): readonly NetherRealm[] {
  return NETHER_REALMS;
}

export function nwGetDiscoveredRealms(state: NetherWorldState): readonly NetherRealmId[] {
  const disc = state.discoveredRealms as Record<string, boolean>;
  return NETHER_REALM_IDS.filter(id => disc[id] === true);
}

export function nwIsRealmDiscovered(state: NetherWorldState, realmId: NetherRealmId): boolean {
  return (state.discoveredRealms as Record<string, boolean>)[realmId] === true;
}

export function nwGetSoulCollection(state: NetherWorldState): SoulCollection {
  return state.soulCollection;
}

export function nwGetSoulCount(state: NetherWorldState, soulTypeId: SoulTypeId): number {
  return (state.soulCollection as Record<string, number>)[soulTypeId];
}

export function nwGetTotalSoulCount(state: NetherWorldState): number {
  const coll = state.soulCollection as Record<string, number>;
  let total = 0;
  for (const id of SOUL_TYPE_IDS) total += coll[id];
  return total;
}

export function nwGetSoulTypeInfo(soulTypeId: SoulTypeId): SoulType | undefined {
  return SOUL_TYPES.find(s => s.id === soulTypeId);
}

export function nwGetAllSoulTypes(): readonly SoulType[] {
  return SOUL_TYPES;
}

export function nwGetSoulPower(state: NetherWorldState, soulTypeId: SoulTypeId): number {
  const count = (state.soulCollection as Record<string, number>)[soulTypeId];
  const info = SOUL_TYPES.find(s => s.id === soulTypeId);
  if (!info) return 0;
  return count * info.power;
}

export function nwGetTotalSoulPower(state: NetherWorldState): number {
  return state.totalSoulPower;
}

export function nwGetDemonInfo(demonTypeId: DemonTypeId): DemonType | undefined {
  return DEMON_TYPES.find(d => d.id === demonTypeId);
}

export function nwGetAllDemons(): readonly DemonType[] {
  return DEMON_TYPES;
}

export function nwGetDemonWeakness(demonTypeId: DemonTypeId): ElementId | undefined {
  const demon = DEMON_TYPES.find(d => d.id === demonTypeId);
  return demon?.weakness;
}

export function nwGetDemonResistance(demonTypeId: DemonTypeId): ElementId | undefined {
  const demon = DEMON_TYPES.find(d => d.id === demonTypeId);
  return demon?.resistance;
}

export function nwGetDemonsForRealm(realmId: NetherRealmId): readonly DemonTypeId[] {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  return realm?.demonTypes ?? [];
}

export function nwGetSoulsForRealm(realmId: NetherRealmId): readonly SoulTypeId[] {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  return realm?.soulTypes ?? [];
}

export function nwGetRiverInfo(riverId: RiverId): UnderworldRiver | undefined {
  return UNDERWORLD_RIVERS.find(r => r.id === riverId);
}

export function nwGetAllRivers(): readonly UnderworldRiver[] {
  return UNDERWORLD_RIVERS;
}

export function nwGetRiverForRealm(realmId: NetherRealmId): RiverId | null {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  return realm?.riverCrossing ?? null;
}

export function nwGetTotalRiversCrossed(state: NetherWorldState): number {
  return state.totalRiversCrossed;
}

export function nwGetRiverCrossingCount(state: NetherWorldState, riverId: RiverId): number {
  return (state.riverCrossings as Record<string, number>)[riverId];
}

export function nwGetLanternState(state: NetherWorldState): SoulLantern {
  return state.lantern;
}

export function nwGetLanternFuel(state: NetherWorldState): number {
  return state.lantern.fuel;
}

export function nwGetLanternFuelPercent(state: NetherWorldState): number {
  if (state.lantern.maxFuel === 0) return 0;
  return state.lantern.fuel / state.lantern.maxFuel;
}

export function nwGetLanternLightLevel(state: NetherWorldState): number {
  return state.lantern.lightLevel;
}

export function nwGetLanternIsActive(state: NetherWorldState): boolean {
  return state.lantern.isActive;
}

export function nwGetShipState(state: NetherWorldState): GhostShip {
  return state.ship;
}

export function nwGetShipDurability(state: NetherWorldState): number {
  return state.ship.durability;
}

export function nwGetShipDurabilityPercent(state: NetherWorldState): number {
  if (state.ship.maxDurability === 0) return 0;
  return state.ship.durability / state.ship.maxDurability;
}

export function nwGetShipIsSailing(state: NetherWorldState): boolean {
  return state.ship.isSailing;
}

export function nwGetAbilityInfo(abilityId: AbilityId): SpectralAbility | undefined {
  return SPECTRAL_ABILITIES.find(a => a.id === abilityId);
}

export function nwGetAllAbilities(): readonly SpectralAbility[] {
  return SPECTRAL_ABILITIES;
}

export function nwIsAbilityUnlocked(state: NetherWorldState, abilityId: AbilityId): boolean {
  return (state.abilities as Record<string, boolean>)[abilityId] === true;
}

export function nwGetUnlockedAbilities(state: NetherWorldState): readonly AbilityId[] {
  const ab = state.abilities as Record<string, boolean>;
  return ABILITY_IDS.filter(id => ab[id] === true);
}

export function nwGetAbilityCooldown(state: NetherWorldState, abilityId: AbilityId): number {
  const cd = state.currentAbilityCooldowns.find(c => c.abilityId === abilityId);
  return cd?.remaining ?? 0;
}

export function nwGetEncounter(state: NetherWorldState): DemonEncounter | null {
  return state.encounter;
}

export function nwIsInCombat(state: NetherWorldState): boolean {
  return state.isInCombat;
}

export function nwGetExpedition(state: NetherWorldState): NetherExpedition {
  return state.expedition;
}

export function nwIsInExpedition(state: NetherWorldState): boolean {
  return state.isInExpedition;
}

export function nwGetExpeditionProgress(state: NetherWorldState): number {
  if (!state.expedition.isActive || state.expedition.totalSteps === 0) return 0;
  return state.expedition.stepsCompleted / state.expedition.totalSteps;
}

export function nwGetDailyExpedition(state: NetherWorldState): DailyExpeditionState {
  return state.dailyExpedition;
}

export function nwGetDailyExpeditionAvailable(state: NetherWorldState): boolean {
  return state.dailyExpedition.isAvailable && !state.dailyExpedition.completedToday;
}

export function nwGetBazaarItemInfo(itemId: BazaarItemId): BazaarItem | undefined {
  return BAZAAR_ITEMS.find(i => i.id === itemId);
}

export function nwGetAllBazaarItems(): readonly BazaarItem[] {
  return BAZAAR_ITEMS;
}

export function nwGetBazaarItemPrice(itemId: BazaarItemId): number {
  const item = BAZAAR_ITEMS.find(i => i.id === itemId);
  return item?.basePrice ?? 0;
}

export function nwGetInventoryCount(state: NetherWorldState, itemId: BazaarItemId): number {
  return (state.bazaarInventory as Record<string, number>)[itemId];
}

export function nwGetCombatLog(state: NetherWorldState): readonly CombatLog[] {
  return state.combatLog;
}

export function nwGetCombatLogLength(state: NetherWorldState): number {
  return state.combatLog.length;
}

export function nwGetStatusEffects(state: NetherWorldState): readonly StatusEffect[] {
  return state.statusEffects;
}

export function nwGetTotalDemonsDefeated(state: NetherWorldState): number {
  return state.totalDemonsDefeated;
}

export function nwGetTotalExpeditionsCompleted(state: NetherWorldState): number {
  return state.totalExpeditionsCompleted;
}

export function nwGetAchievementInfo(achievementId: AchievementId): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === achievementId);
}

export function nwGetAllAchievements(): readonly Achievement[] {
  return ACHIEVEMENTS;
}

export function nwGetAchievementProgress(state: NetherWorldState, achievementId: AchievementId): number {
  return (state.achievements as Record<string, number>)[achievementId];
}

export function nwGetAchievementTarget(achievementId: AchievementId): number {
  const targets: Record<string, number> = {
    first_harvest: 1,
    realm_explorer: 8,
    demon_slayer: 100,
    river_crosser: 5,
    lantern_keeper: 10,
    spectral_master: 8,
    bazaar_haggler: 50,
    wraith_ascendant: 50,
    soul_collector: 500,
    phantom_navigator: 7,
    bone_collector_ach: 100,
    void_walker: 10,
    furnace_born: 1,
    daily_expeditioner: 30,
    transcendent_wraith: 1,
  };
  return targets[achievementId];
}

export function nwGetCompletedAchievements(state: NetherWorldState): readonly AchievementId[] {
  const achMap = state.achievements as Record<string, number>;
  return ACHIEVEMENT_IDS.filter(id => achMap[id] >= nwGetAchievementTarget(id));
}

export function nwGetCurrentNode(state: NetherWorldState): MapNode | undefined {
  return state.mapNodes.find(n => n.id === state.currentNodeId);
}

export function nwGetMapNodes(state: NetherWorldState): readonly MapNode[] {
  return state.mapNodes;
}

export function nwGetMapNodesForRealm(state: NetherWorldState, realmId: NetherRealmId): readonly MapNode[] {
  return state.mapNodes.filter(n => n.realmId === realmId);
}

export function nwGetConnectedNodes(state: NetherWorldState): readonly MapNode[] {
  const current = state.mapNodes.find(n => n.id === state.currentNodeId);
  if (!current) return [];
  return state.mapNodes.filter(n => current.connectedNodes.includes(n.id));
}

export function nwGetPhaseShiftActive(state: NetherWorldState): boolean {
  return state.phaseShiftActive;
}

export function nwGetSpectralFormActive(state: NetherWorldState): boolean {
  return state.spectralFormActive;
}

export function nwGetWraithStats(state: NetherWorldState): WraithStats {
  return state.wraithStats;
}

export function nwGetWraithHealth(state: NetherWorldState): number {
  return state.wraithStats.maxHealth;
}

export function nwGetWraithAttack(state: NetherWorldState): number {
  return state.wraithStats.attack;
}

export function nwGetWraithDefense(state: NetherWorldState): number {
  return state.wraithStats.defense;
}

export function nwGetWraithMana(state: NetherWorldState): number {
  return state.wraithStats.mana;
}

export function nwGetWraithMaxMana(state: NetherWorldState): number {
  return state.wraithStats.maxMana;
}

export function nwGetWraithManaPercent(state: NetherWorldState): number {
  if (state.wraithStats.maxMana === 0) return 0;
  return state.wraithStats.mana / state.wraithStats.maxMana;
}

export function nwGetWraithSpiritPower(state: NetherWorldState): number {
  return state.wraithStats.spiritPower;
}

// ============================================================================
// State Mutators (Pure Functions)
// ============================================================================

export function nwTravelToRealm(state: NetherWorldState, realmId: NetherRealmId): NetherWorldState {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  if (!realm) return state;
  if (realm.requiredWraithLevel > state.wraithStats.level) return state;

  const realmNodes = state.mapNodes.filter(n => n.realmId === realmId);
  const firstNode = realmNodes.length > 0 ? realmNodes[0].id : '';

  return {
    ...state,
    currentRealm: realmId,
    discoveredRealms: { ...state.discoveredRealms, [realmId]: true } as RealmDiscovery,
    currentNodeId: firstNode || state.currentNodeId,
    encounter: null,
    isInCombat: false,
  };
}

export function nwDiscoverRealm(state: NetherWorldState, realmId: NetherRealmId): NetherWorldState {
  if ((state.discoveredRealms as Record<string, boolean>)[realmId]) return state;
  return {
    ...state,
    discoveredRealms: { ...state.discoveredRealms, [realmId]: true } as RealmDiscovery,
  };
}

export function nwHarvestSoul(state: NetherWorldState, soulTypeId: SoulTypeId): NetherWorldState {
  const soulInfo = SOUL_TYPES.find(s => s.id === soulTypeId);
  if (!soulInfo) return state;

  const realm = NETHER_REALMS.find(r => r.id === state.currentRealm);
  if (realm && !realm.soulTypes.includes(soulTypeId)) return state;

  const lightBonus = state.lantern.isActive ? Math.ceil(soulInfo.rarity * state.lantern.lightLevel * 0.1) : 0;
  const harvestChance = Math.min(0.9, 0.5 + (state.wraithStats.spiritPower / 100) - (soulInfo.harvestDifficulty * 0.05) + (lightBonus * 0.02));

  if (Math.random() > harvestChance) return state;

  const coll = { ...(state.soulCollection as Record<string, number>) };
  coll[soulTypeId] = (coll[soulTypeId] ?? 0) + 1;
  const newCollection = coll as SoulCollection;
  const newTotalPower = nwComputeSoulPower(newCollection);

  const fuelCost = 5;
  const newFuel = Math.max(0, state.lantern.fuel - fuelCost);
  const newLightLevel = Math.min(state.lantern.maxLightLevel, Math.max(1, Math.floor(newFuel / (state.lantern.maxFuel / state.lantern.maxLightLevel))));
  const lanternStillOn = newFuel > 0 && state.lantern.isActive;

  const newXp = state.wraithStats.experience + soulInfo.power;
  const levelUpResult = nwCheckLevelUp(newXp, state.wraithStats.level);

  const ach = { ...(state.achievements as Record<string, number>) };
  ach.first_harvest = Math.max(ach.first_harvest, 1);
  const totalSouls = SOUL_TYPE_IDS.reduce((sum, id) => sum + (coll[id] ?? 0), 0);
  ach.soul_collector = totalSouls;
  ach.bone_collector_ach = coll.bone ?? 0;
  if (soulTypeId === 'transcendent') ach.transcendent_wraith = 1;

  return {
    ...state,
    soulCollection: newCollection,
    totalSoulPower: newTotalPower,
    lantern: { ...state.lantern, fuel: newFuel, lightLevel: newLightLevel, isActive: lanternStillOn },
    hasLanternActive: lanternStillOn,
    wraithStats: nwApplyLevelUpStats(state.wraithStats, levelUpResult.level),
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
  };
}

export function nwHarvestSoulOnNode(state: NetherWorldState): NetherWorldState {
  const node = state.mapNodes.find(n => n.id === state.currentNodeId);
  if (!node || !node.hasSoul || !node.soulType) return state;
  return nwHarvestSoul(state, node.soulType);
}

// ============================================================================
// Combat System
// ============================================================================

export function nwStartEncounter(state: NetherWorldState, demonTypeId: DemonTypeId): NetherWorldState {
  const demon = DEMON_TYPES.find(d => d.id === demonTypeId);
  if (!demon) return state;
  if (state.isInCombat) return state;

  const encounter: DemonEncounter = {
    demonId: demonTypeId,
    currentHp: demon.hp,
    maxHp: demon.hp,
    isDefeated: false,
    turnCount: 0,
    statusEffects: [],
  };

  const log: CombatLog = {
    id: `log_enc_start_${demonTypeId}`,
    turn: 0,
    action: 'encounter_start',
    damage: 0,
    attacker: demon.name,
    target: 'Wraith',
    element: 'shadow',
    isCritical: false,
  };

  return { ...state, encounter, isInCombat: true, combatLog: [...state.combatLog, log] };
}

export function nwStartRandomEncounter(state: NetherWorldState): NetherWorldState {
  if (state.isInCombat) return state;
  const node = state.mapNodes.find(n => n.id === state.currentNodeId);
  if (!node || !node.hasDemon || !node.demonType) return state;
  return nwStartEncounter(state, node.demonType);
}

export function nwFight(state: NetherWorldState, elementOverride?: ElementId): NetherWorldState {
  if (!state.encounter || state.encounter.isDefeated) return state;

  const demon = DEMON_TYPES.find(d => d.id === state.encounter!.demonId);
  if (!demon) return state;

  const element = elementOverride ?? 'shadow';
  const isWeak = element === demon.weakness;
  const isResisted = element === demon.resistance;
  const isCritical = Math.random() < (state.wraithStats.spiritPower / 200);

  let baseDamage = state.wraithStats.attack + state.wraithStats.spiritPower * 0.5;
  if (isWeak) baseDamage *= 1.5;
  if (isResisted) baseDamage *= 0.5;
  if (isCritical) baseDamage *= 2;
  if (state.spectralFormActive) baseDamage *= 1.3;

  const finalDamage = Math.max(1, Math.floor(baseDamage - demon.defense * 0.3));
  const newHp = Math.max(0, state.encounter.currentHp - finalDamage);
  const newTurnCount = state.encounter.turnCount + 1;
  const isDefeated = newHp <= 0;

  const attackLog: CombatLog = {
    id: `log_atk_${newTurnCount}`,
    turn: newTurnCount,
    action: 'attack',
    damage: finalDamage,
    attacker: 'Wraith',
    target: demon.name,
    element,
    isCritical,
  };

  let next: NetherWorldState = {
    ...state,
    encounter: { ...state.encounter, currentHp: newHp, turnCount: newTurnCount, isDefeated },
    combatLog: [...state.combatLog, attackLog],
  };

  if (isDefeated) {
    next = nwProcessDemonDefeat(next);
  } else {
    next = nwProcessDemonAttack(next);
  }

  return next;
}

export function nwUseAbilityInCombat(state: NetherWorldState, abilityId: AbilityId): NetherWorldState {
  if (!state.encounter || state.encounter.isDefeated) return state;
  if (!(state.abilities as Record<string, boolean>)[abilityId]) return state;

  const ability = SPECTRAL_ABILITIES.find(a => a.id === abilityId);
  if (!ability) return state;

  const currentCd = state.currentAbilityCooldowns.find(c => c.abilityId === abilityId);
  if (currentCd && currentCd.remaining > 0) return state;
  if (state.wraithStats.mana < ability.manaCost) return state;

  const newMana = state.wraithStats.mana - ability.manaCost;
  const newCooldowns = [
    ...state.currentAbilityCooldowns.filter(c => c.abilityId !== abilityId),
    { abilityId, remaining: ability.cooldown },
  ];

  let next: NetherWorldState = {
    ...state,
    wraithStats: { ...state.wraithStats, mana: newMana },
    currentAbilityCooldowns: newCooldowns,
  };

  const demon = DEMON_TYPES.find(d => d.id === state.encounter!.demonId);
  if (!demon) return next;

  const isWeak = ability.element === demon.weakness;
  const abilityDamage = Math.floor(ability.manaCost * 2 * (isWeak ? 1.5 : 1));

  if (ability.effect === 'damage' || ability.effect === 'stun') {
    const newHp = Math.max(0, state.encounter.currentHp - abilityDamage);
    const newTurnCount = state.encounter.turnCount + 1;
    const isDefeated = newHp <= 0;

    const abilityLog: CombatLog = {
      id: `log_ab_${abilityId}_${newTurnCount}`,
      turn: newTurnCount,
      action: `ability_${ability.name}`,
      damage: abilityDamage,
      attacker: 'Wraith',
      target: demon.name,
      element: ability.element,
      isCritical: false,
    };

    next = {
      ...next,
      encounter: { ...next.encounter!, currentHp: newHp, turnCount: newTurnCount, isDefeated },
      combatLog: [...next.combatLog, abilityLog],
    };

    if (ability.effect === 'stun') {
      const stun: StatusEffect = { id: `stun_${newTurnCount}`, name: 'Stunned', duration: 1, potency: 1, element: 'bone' };
      next = { ...next, encounter: { ...next.encounter!, statusEffects: [...next.encounter!.statusEffects, stun] } };
    }

    if (isDefeated) {
      next = nwProcessDemonDefeat(next);
    } else {
      const hasStun = next.encounter!.statusEffects.some(e => e.name === 'Stunned' && e.duration > 0);
      if (!hasStun) next = nwProcessDemonAttack(next);
    }
  } else if (ability.effect === 'drain') {
    const drainAmount = Math.floor(abilityDamage * 0.5);
    const healedMana = Math.min(state.wraithStats.maxMana, newMana + drainAmount);
    next = { ...next, wraithStats: { ...next.wraithStats, mana: healedMana } };
  }

  return next;
}

function nwProcessDemonDefeat(state: NetherWorldState): NetherWorldState {
  if (!state.encounter) return state;
  const encounter = state.encounter;
  if (!encounter) return state;
  const demon = DEMON_TYPES.find(d => d.id === encounter.demonId);
  if (!demon) return state;

  const coll = { ...(state.soulCollection as Record<string, number>) };
  coll[demon.soulReward] = (coll[demon.soulReward] ?? 0) + 1;
  const newCollection = coll as SoulCollection;
  const newTotalPower = nwComputeSoulPower(newCollection);
  const newTotalDefeated = state.totalDemonsDefeated + 1;
  const goldReward = demon.wraithLevel * 10 + Math.floor(Math.random() * 20);
  const shardReward = Math.floor(demon.experienceReward * 0.5);

  const newXp = state.wraithStats.experience + demon.experienceReward;
  const levelUpResult = nwCheckLevelUp(newXp, state.wraithStats.level);

  const ach = { ...(state.achievements as Record<string, number>) };
  ach.demon_slayer = newTotalDefeated;
  if (state.currentRealm === 'soul_furnace') ach.furnace_born = 1;

  const updatedNodes = state.mapNodes.map(n => {
    if (n.id === state.currentNodeId && n.hasDemon) {
      return { ...n, hasDemon: false, demonType: null as DemonTypeId | null, isExplored: true };
    }
    return n;
  });

  const defeatLog: CombatLog = {
    id: `log_def_${state.encounter.turnCount}`,
    turn: state.encounter.turnCount,
    action: 'demon_defeated',
    damage: 0,
    attacker: 'Wraith',
    target: demon.name,
    element: 'spirit',
    isCritical: false,
  };

  return {
    ...state,
    encounter: null,
    isInCombat: false,
    soulCollection: newCollection,
    totalSoulPower: newTotalPower,
    totalDemonsDefeated: newTotalDefeated,
    gold: state.gold + goldReward,
    soulShards: state.soulShards + shardReward,
    wraithStats: nwApplyLevelUpStats(state.wraithStats, levelUpResult.level),
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
    mapNodes: updatedNodes,
    combatLog: [...state.combatLog, defeatLog],
  };
}

function nwProcessDemonAttack(state: NetherWorldState): NetherWorldState {
  if (!state.encounter || state.encounter.isDefeated) return state;
  const encounter = state.encounter;
  if (!encounter) return state;
  const demon = DEMON_TYPES.find(d => d.id === encounter.demonId);
  if (!demon) return state;

  const isCritical = Math.random() < 0.1;
  let demonDamage = demon.attack * 0.8;
  if (isCritical) demonDamage *= 1.5;
  if (state.phaseShiftActive) demonDamage = 0;

  const finalDamage = Math.max(0, Math.floor(demonDamage - state.wraithStats.defense * 0.4));

  const log: CombatLog = {
    id: `log_dmg_${state.encounter.turnCount + 1}`,
    turn: state.encounter.turnCount + 1,
    action: 'demon_attack',
    damage: finalDamage,
    attacker: demon.name,
    target: 'Wraith',
    element: demon.resistance,
    isCritical,
  };

  const reducedCooldowns = state.currentAbilityCooldowns.map(c => ({ ...c, remaining: Math.max(0, c.remaining - 1) }));

  return { ...state, combatLog: [...state.combatLog, log], currentAbilityCooldowns: reducedCooldowns };
}

export function nwFlee(state: NetherWorldState): NetherWorldState {
  if (!state.isInCombat || !state.encounter) return state;
  const fleeChance = 0.4 + (state.wraithStats.spiritPower * 0.005);
  if (Math.random() > fleeChance) return state;

  const log: CombatLog = {
    id: `log_flee_${state.encounter.turnCount}`,
    turn: state.encounter.turnCount,
    action: 'flee',
    damage: 0,
    attacker: 'Wraith',
    target: 'escaped',
    element: 'shadow',
    isCritical: false,
  };

  return { ...state, encounter: null, isInCombat: false, combatLog: [...state.combatLog, log] };
}

// ============================================================================
// River Crossing System
// ============================================================================

export function nwCrossRiver(state: NetherWorldState, riverId: RiverId): NetherWorldState {
  const river = UNDERWORLD_RIVERS.find(r => r.id === riverId);
  if (!river || state.isInCombat) return state;

  const hasSoulAnchor = (state.bazaarInventory as Record<string, number>).soul_anchor > 0;
  const successChance = hasSoulAnchor ? 0.95 : 0.7;
  if (Math.random() > successChance) return state;

  const crossings = { ...(state.riverCrossings as Record<string, number>) };
  crossings[riverId] = (crossings[riverId] ?? 0) + 1;
  const totalCrossed = Object.values(crossings).reduce((s, v) => s + v, 0);

  const inv = { ...(state.bazaarInventory as Record<string, number>) };
  if (hasSoulAnchor) inv.soul_anchor = Math.max(0, inv.soul_anchor - 1);

  const goldCost = Math.floor(river.crossingCost * 0.5);
  const xpReward = river.dangerLevel * 20;
  const newXp = state.wraithStats.experience + xpReward;
  const levelUpResult = nwCheckLevelUp(newXp, state.wraithStats.level);

  const ach = { ...(state.achievements as Record<string, number>) };
  ach.river_crosser = totalCrossed;

  return {
    ...state,
    riverCrossings: crossings as RiverCrossingRecord,
    totalRiversCrossed: totalCrossed,
    bazaarInventory: inv as BazaarInventory,
    gold: Math.max(0, state.gold - goldCost),
    wraithStats: nwApplyLevelUpStats(state.wraithStats, levelUpResult.level),
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
  };
}

export function nwGetRiverSuccessChance(state: NetherWorldState, riverId: RiverId): number {
  return (state.bazaarInventory as Record<string, number>).soul_anchor > 0 ? 0.95 : 0.7;
}

export function nwGetRiverCrossingCost(riverId: RiverId): number {
  const river = UNDERWORLD_RIVERS.find(r => r.id === riverId);
  return river ? Math.floor(river.crossingCost * 0.5) : 0;
}

// ============================================================================
// Ghost Ship System
// ============================================================================

export function nwBoardShip(state: NetherWorldState): NetherWorldState {
  if (state.isInCombat) return state;
  return { ...state, ship: { ...state.ship, currentRealm: state.currentRealm } };
}

export function nwSetShipDestination(state: NetherWorldState, destination: NetherRealmId): NetherWorldState {
  if (state.isInCombat) return state;
  const realm = NETHER_REALMS.find(r => r.id === destination);
  if (!realm || realm.requiredWraithLevel > state.wraithStats.level) return state;
  return { ...state, ship: { ...state.ship, destination, isSailing: true } };
}

export function nwNavigateShip(state: NetherWorldState): NetherWorldState {
  if (!state.ship.isSailing || !state.ship.destination || state.isInCombat) return state;
  const dest = state.ship.destination;

  const durabilityLoss = 5 + Math.floor(Math.random() * 10);
  const newDurability = Math.max(0, state.ship.durability - durabilityLoss);
  const realmNodes = state.mapNodes.filter(n => n.realmId === dest);
  const firstNode = realmNodes.length > 0 ? realmNodes[0].id : '';

  return {
    ...state,
    currentRealm: dest,
    discoveredRealms: { ...state.discoveredRealms, [dest]: true } as RealmDiscovery,
    currentNodeId: firstNode || state.currentNodeId,
    ship: { ...state.ship, currentRealm: dest, destination: null, isSailing: false, durability: newDurability },
  };
}

export function nwRepairShip(state: NetherWorldState): NetherWorldState {
  const cost = Math.floor((state.ship.maxDurability - state.ship.durability) * 2);
  if (state.gold < cost) return state;
  return { ...state, ship: { ...state.ship, durability: state.ship.maxDurability }, gold: state.gold - cost };
}

export function nwGetRepairCost(state: NetherWorldState): number {
  return Math.floor((state.ship.maxDurability - state.ship.durability) * 2);
}

export function nwUpgradeShip(state: NetherWorldState): NetherWorldState {
  const cost = state.ship.maxDurability * 3;
  if (state.gold < cost) return state;
  return {
    ...state,
    ship: { ...state.ship, maxDurability: state.ship.maxDurability + 50, durability: state.ship.maxDurability + 50, speed: state.ship.speed + 1 },
    gold: state.gold - cost,
  };
}

export function nwGetShipUpgradeCost(state: NetherWorldState): number {
  return state.ship.maxDurability * 3;
}

// ============================================================================
// Soul Lantern System
// ============================================================================

export function nwIgniteLantern(state: NetherWorldState): NetherWorldState {
  if (state.lantern.fuel <= 0) return state;
  return { ...state, lantern: { ...state.lantern, isActive: true }, hasLanternActive: true };
}

export function nwExtinguishLantern(state: NetherWorldState): NetherWorldState {
  return { ...state, lantern: { ...state.lantern, isActive: false }, hasLanternActive: false };
}

export function nwFuelLantern(state: NetherWorldState, amount: number): NetherWorldState {
  const oilCount = (state.bazaarInventory as Record<string, number>).lantern_oil;
  const actualAmount = Math.min(amount, oilCount);
  if (actualAmount <= 0) return state;

  const newFuel = Math.min(state.lantern.maxFuel, state.lantern.fuel + actualAmount * 10);
  const newOil = oilCount - actualAmount;
  const newLightLevel = Math.min(state.lantern.maxLightLevel, Math.max(1, Math.floor(newFuel / (state.lantern.maxFuel / state.lantern.maxLightLevel))));
  const inv = { ...(state.bazaarInventory as Record<string, number>), lantern_oil: newOil };

  return {
    ...state,
    lantern: { ...state.lantern, fuel: newFuel, lightLevel: newLightLevel },
    bazaarInventory: inv as BazaarInventory,
  };
}

export function nwUpgradeLantern(state: NetherWorldState): NetherWorldState {
  const cost = 200 + state.lantern.maxLightLevel * 50;
  if (state.soulShards < cost || state.lantern.maxLightLevel >= 10) return state;
  return { ...state, lantern: { ...state.lantern, maxLightLevel: state.lantern.maxLightLevel + 1 }, soulShards: state.soulShards - cost };
}

export function nwGetLanternUpgradeCost(state: NetherWorldState): number {
  return state.lantern.maxLightLevel >= 10 ? 0 : 200 + state.lantern.maxLightLevel * 50;
}

export function nwConsumeLanternFuel(state: NetherWorldState, amount: number): NetherWorldState {
  const newFuel = Math.max(0, state.lantern.fuel - amount);
  const newLightLevel = Math.min(state.lantern.maxLightLevel, Math.max(1, Math.floor(newFuel / (state.lantern.maxFuel / state.lantern.maxLightLevel))));
  const lanternOn = newFuel > 0 && state.lantern.isActive;
  return { ...state, lantern: { ...state.lantern, fuel: newFuel, lightLevel: newLightLevel, isActive: lanternOn }, hasLanternActive: lanternOn };
}

// ============================================================================
// Spectral Abilities
// ============================================================================

export function nwUnlockAbility(state: NetherWorldState, abilityId: AbilityId): NetherWorldState {
  if ((state.abilities as Record<string, boolean>)[abilityId]) return state;
  const ability = SPECTRAL_ABILITIES.find(a => a.id === abilityId);
  if (!ability || state.wraithStats.level < ability.unlockLevel) return state;

  const ab = { ...(state.abilities as Record<string, boolean>), [abilityId]: true };
  const unlockedCount = ABILITY_IDS.filter(id => ab[id]).length;

  const ach = { ...(state.achievements as Record<string, number>) };
  ach.spectral_master = unlockedCount;

  return {
    ...state,
    abilities: ab as UnlockedAbilities,
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
  };
}

export function nwUnlockAvailableAbilities(state: NetherWorldState): NetherWorldState {
  let s = state;
  for (const id of ABILITY_IDS) s = nwUnlockAbility(s, id);
  return s;
}

export function nwTickCooldowns(state: NetherWorldState): NetherWorldState {
  const reduced = state.currentAbilityCooldowns.map(c => ({ ...c, remaining: Math.max(0, c.remaining - 1) })).filter(c => c.remaining > 0);
  return { ...state, currentAbilityCooldowns: reduced };
}

export function nwActivatePhaseShift(state: NetherWorldState): NetherWorldState {
  if (!(state.abilities as Record<string, boolean>).phase_shift || state.wraithStats.mana < 15) return state;
  return { ...state, phaseShiftActive: true, wraithStats: { ...state.wraithStats, mana: state.wraithStats.mana - 15 } };
}

export function nwDeactivatePhaseShift(state: NetherWorldState): NetherWorldState {
  return { ...state, phaseShiftActive: false };
}

export function nwActivateSpectralForm(state: NetherWorldState): NetherWorldState {
  if (!(state.abilities as Record<string, boolean>).spectral_form || state.wraithStats.mana < 50) return state;
  return { ...state, spectralFormActive: true, wraithStats: { ...state.wraithStats, mana: state.wraithStats.mana - 50 } };
}

export function nwDeactivateSpectralForm(state: NetherWorldState): NetherWorldState {
  return { ...state, spectralFormActive: false };
}

export function nwRestoreMana(state: NetherWorldState, amount: number): NetherWorldState {
  return { ...state, wraithStats: { ...state.wraithStats, mana: Math.min(state.wraithStats.maxMana, state.wraithStats.mana + amount) } };
}

// ============================================================================
// Bazaar System
// ============================================================================

export function nwBuyItem(state: NetherWorldState, itemId: BazaarItemId, quantity: number): NetherWorldState {
  const item = BAZAAR_ITEMS.find(i => i.id === itemId);
  if (!item || quantity <= 0) return state;

  const currentCount = (state.bazaarInventory as Record<string, number>)[itemId] ?? 0;
  const actualQty = item.stackable ? Math.min(quantity, item.maxStack - currentCount) : 1;
  if (actualQty <= 0) return state;

  const totalPrice = item.basePrice * actualQty;
  if (state.gold < totalPrice) return state;

  const inv = { ...(state.bazaarInventory as Record<string, number>), [itemId]: currentCount + actualQty };
  return { ...state, gold: state.gold - totalPrice, bazaarInventory: inv as BazaarInventory };
}

export function nwSellItem(state: NetherWorldState, itemId: BazaarItemId, quantity: number): NetherWorldState {
  const item = BAZAAR_ITEMS.find(i => i.id === itemId);
  if (!item || quantity <= 0) return state;

  const currentCount = (state.bazaarInventory as Record<string, number>)[itemId] ?? 0;
  const actualQty = Math.min(quantity, currentCount);
  if (actualQty <= 0) return state;

  const sellPrice = Math.floor(item.basePrice * 0.6 * actualQty);
  const ach = { ...(state.achievements as Record<string, number>) };
  ach.bazaar_haggler = (ach.bazaar_haggler ?? 0) + actualQty;

  const inv = { ...(state.bazaarInventory as Record<string, number>), [itemId]: currentCount - actualQty };
  return {
    ...state,
    gold: state.gold + sellPrice,
    bazaarInventory: inv as BazaarInventory,
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
  };
}

export function nwGetSellPrice(itemId: BazaarItemId, quantity: number): number {
  const item = BAZAAR_ITEMS.find(i => i.id === itemId);
  if (!item) return 0;
  return Math.floor(item.basePrice * 0.6 * quantity);
}

export function nwUseBazaarItem(state: NetherWorldState, itemId: BazaarItemId): NetherWorldState {
  if ((state.bazaarInventory as Record<string, number>)[itemId] <= 0) return state;

  const inv = { ...(state.bazaarInventory as Record<string, number>), [itemId]: (state.bazaarInventory as Record<string, number>)[itemId] - 1 };
  const base = { ...state, bazaarInventory: inv as BazaarInventory };

  if (itemId === 'spectral_essence') return nwRestoreMana(base, 20);
  if (itemId === 'lantern_oil') return nwFuelLantern(base, 1);
  return base;
}

export function nwCanAfford(state: NetherWorldState, goldCost: number): boolean {
  return state.gold >= goldCost;
}

export function nwCanAffordSoulShards(state: NetherWorldState, cost: number): boolean {
  return state.soulShards >= cost;
}

// ============================================================================
// Map & Exploration
// ============================================================================

export function nwMoveToNode(state: NetherWorldState, nodeId: string): NetherWorldState {
  const current = state.mapNodes.find(n => n.id === state.currentNodeId);
  if (!current || !current.connectedNodes.includes(nodeId)) return state;

  const target = state.mapNodes.find(n => n.id === nodeId);
  if (!target || target.realmId !== state.currentRealm) return state;

  let next = nwConsumeLanternFuel(state, 3);
  next = nwTickCooldowns(next);

  const xpReward = 5 + target.dangerLevel * 2;
  const newXp = next.wraithStats.experience + xpReward;
  const levelUpResult = nwCheckLevelUp(newXp, next.wraithStats.level);

  const updatedNodes = next.mapNodes.map(n => (n.id === nodeId && !n.isExplored ? { ...n, isExplored: true } : n));

  return {
    ...next,
    currentNodeId: nodeId,
    wraithStats: nwApplyLevelUpStats(next.wraithStats, levelUpResult.level),
    mapNodes: updatedNodes,
  };
}

export function nwExplore(state: NetherWorldState): NetherWorldState {
  const current = state.mapNodes.find(n => n.id === state.currentNodeId);
  if (!current || current.isExplored) return state;

  let next = nwConsumeLanternFuel(state, 5);
  const xpReward = 10 + current.dangerLevel * 5;

  const soulFindChance = current.hasSoul ? 0.4 + (state.lantern.lightLevel * 0.05) : 0;
  const demonFindChance = current.hasDemon ? 0.3 + (current.dangerLevel * 0.05) : 0;

  if (soulFindChance > Math.random() && current.soulType) {
    next = nwHarvestSoul(next, current.soulType);
  }

  const updatedNodes = next.mapNodes.map(n => (n.id === current.id ? { ...n, isExplored: true } : n));
  next = { ...next, mapNodes: updatedNodes };

  if (demonFindChance > Math.random() && current.demonType && !next.isInCombat) {
    next = nwStartEncounter(next, current.demonType);
  }

  const newXp = next.wraithStats.experience + xpReward;
  const levelUpResult = nwCheckLevelUp(newXp, next.wraithStats.level);

  return { ...next, wraithStats: nwApplyLevelUpStats(next.wraithStats, levelUpResult.level) };
}

export function nwGetExploredNodes(state: NetherWorldState): readonly MapNode[] {
  return state.mapNodes.filter(n => n.isExplored);
}

export function nwGetUnexploredNodes(state: NetherWorldState): readonly MapNode[] {
  return state.mapNodes.filter(n => !n.isExplored);
}

export function nwGetExploredCount(state: NetherWorldState): number {
  return state.mapNodes.filter(n => n.isExplored).length;
}

export function nwGetTotalNodeCount(state: NetherWorldState): number {
  return state.mapNodes.length;
}

export function nwGetExplorationPercent(state: NetherWorldState): number {
  if (state.mapNodes.length === 0) return 0;
  return state.mapNodes.filter(n => n.isExplored).length / state.mapNodes.length;
}

// ============================================================================
// Expedition System
// ============================================================================

export function nwStartExpedition(state: NetherWorldState): NetherWorldState {
  if (state.isInCombat || state.expedition.isActive) return state;
  return {
    ...state,
    expedition: {
      isActive: true,
      realmId: state.currentRealm,
      stepsCompleted: 0,
      totalSteps: 10 + state.wraithStats.level,
      soulsHarvested: 0,
      demonsDefeated: 0,
      lootCollected: [],
      startTime: Date.now(),
      bonusRewards: false,
    },
    isInExpedition: true,
  };
}

export function nwAdvanceExpedition(state: NetherWorldState): NetherWorldState {
  if (!state.expedition.isActive || state.expedition.stepsCompleted >= state.expedition.totalSteps) return state;

  const newSteps = state.expedition.stepsCompleted + 1;
  const isComplete = newSteps >= state.expedition.totalSteps;
  const soulChance = 0.4 + (state.lantern.lightLevel * 0.03);

  let next = { ...state, expedition: { ...state.expedition, stepsCompleted: newSteps } };
  const newLoot = [...state.expedition.lootCollected];

  if (soulChance > Math.random()) {
    const realm = NETHER_REALMS.find(r => r.id === state.currentRealm);
    if (realm) {
      const soulType = realm.soulTypes[Math.floor(Math.random() * realm.soulTypes.length)];
      const prevCount = (next.soulCollection as Record<string, number>)[soulType] ?? 0;
      next = nwHarvestSoul(next, soulType);
      const gained = (next.soulCollection as Record<string, number>)[soulType] - prevCount;
      next = { ...next, expedition: { ...next.expedition, soulsHarvested: next.expedition.soulsHarvested + gained } };
    }
  }

  if (!next.isInCombat && Math.random() < 0.3) {
    const realm = NETHER_REALMS.find(r => r.id === state.currentRealm);
    if (realm && realm.demonTypes.length > 0) {
      next = nwStartEncounter(next, realm.demonTypes[Math.floor(Math.random() * realm.demonTypes.length)]);
    }
  }

  if (Math.random() < 0.25) {
    const randomItem = BAZAAR_ITEM_IDS[Math.floor(Math.random() * BAZAAR_ITEM_IDS.length)];
    if (!newLoot.includes(randomItem)) newLoot.push(randomItem);
  }

  const completedCount = isComplete ? state.totalExpeditionsCompleted + 1 : state.totalExpeditionsCompleted;
  const ach = { ...(next.achievements as Record<string, number>) };
  ach.daily_expeditioner = completedCount;

  if (isComplete) {
    const bonusXp = 50 + state.wraithStats.level * 10;
    const newXp = next.wraithStats.experience + bonusXp;
    const levelUpResult = nwCheckLevelUp(newXp, next.wraithStats.level);
    next = { ...next, wraithStats: nwApplyLevelUpStats(next.wraithStats, levelUpResult.level) };
  }

  return {
    ...next,
    expedition: { ...next.expedition, lootCollected: newLoot },
    totalExpeditionsCompleted: completedCount,
    isInExpedition: !isComplete,
    achievements: { ...next.achievements, ...ach } as AchievementProgress,
  };
}

export function nwEndExpedition(state: NetherWorldState): NetherWorldState {
  if (!state.expedition.isActive) return state;
  const bonusXp = Math.floor(state.expedition.stepsCompleted * 5);
  const goldReward = state.expedition.stepsCompleted * 3;
  return {
    ...state,
    expedition: { ...state.expedition, isActive: false },
    isInExpedition: false,
    isInCombat: false,
    encounter: null,
    gold: state.gold + goldReward,
    wraithStats: { ...state.wraithStats, experience: state.wraithStats.experience + bonusXp },
  };
}

// ============================================================================
// Daily Expedition
// ============================================================================

export function nwStartDailyExpedition(state: NetherWorldState): NetherWorldState {
  if (!state.dailyExpedition.isAvailable || state.dailyExpedition.completedToday || state.isInCombat) return state;
  const expeditionState = nwStartExpedition(state);
  return { ...expeditionState, dailyExpedition: { ...state.dailyExpedition, isAvailable: false } };
}

export function nwCompleteDailyExpedition(state: NetherWorldState): NetherWorldState {
  if (state.dailyExpedition.completedToday) return state;

  const mult = state.dailyExpedition.rewardMultiplier;
  const bonusGold = Math.floor(100 * mult);
  const bonusXp = Math.floor(200 * mult);
  const bonusShards = Math.floor(20 * mult);

  const newXp = state.wraithStats.experience + bonusXp;
  const levelUpResult = nwCheckLevelUp(newXp, state.wraithStats.level);

  return {
    ...state,
    dailyExpedition: { ...state.dailyExpedition, completedToday: true },
    gold: state.gold + bonusGold,
    soulShards: state.soulShards + bonusShards,
    totalExpeditionsCompleted: state.totalExpeditionsCompleted + 1,
    wraithStats: nwApplyLevelUpStats(state.wraithStats, levelUpResult.level),
  };
}

export function nwResetDailyExpedition(state: NetherWorldState): NetherWorldState {
  const realmIndex = Math.floor(Math.random() * NETHER_REALM_IDS.length);
  const soulIndex = Math.floor(Math.random() * SOUL_TYPE_IDS.length);
  return {
    ...state,
    dailyExpedition: {
      isAvailable: true,
      completedToday: false,
      realmId: NETHER_REALM_IDS[realmIndex],
      rewardMultiplier: 1 + Math.floor(Math.random() * 3),
      bonusSoulType: SOUL_TYPE_IDS[soulIndex],
      dayOfYear: (state.dailyExpedition.dayOfYear % 365) + 1,
    },
  };
}

// ============================================================================
// Experience & Level System
// ============================================================================

export function nwAddExperience(state: NetherWorldState, amount: number): NetherWorldState {
  const newXp = state.wraithStats.experience + amount;
  const levelUpResult = nwCheckLevelUp(newXp, state.wraithStats.level);
  const ach = { ...(state.achievements as Record<string, number>) };
  ach.wraith_ascendant = levelUpResult.level;
  return {
    ...state,
    wraithStats: nwApplyLevelUpStats(state.wraithStats, levelUpResult.level),
    achievements: { ...state.achievements, ...ach } as AchievementProgress,
  };
}

export function nwGetLevelForExperience(experience: number): number {
  return nwCheckLevelUp(experience, 1).level;
}

export function nwGetWraithTitle(level: number): string {
  if (level >= 50) return 'Transcendent Wraith';
  if (level >= 45) return 'Sovereign of the Void';
  if (level >= 40) return 'Lord of the Nether';
  if (level >= 35) return 'Void Herald';
  if (level >= 30) return 'Soul Reaper';
  if (level >= 25) return 'Phantom Admiral';
  if (level >= 20) return 'Demon Slayer';
  if (level >= 15) return 'Bone Walker';
  if (level >= 10) return 'Shadow Strider';
  if (level >= 5) return 'River Crosser';
  if (level >= 2) return 'Soul Seeker';
  return 'Lost Wraith';
}

export function nwGetDangerRating(realmId: NetherRealmId): string {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  if (!realm) return 'Unknown';
  const d = realm.dangerLevel;
  if (d <= 2) return 'Haunted';
  if (d <= 4) return 'Treacherous';
  if (d <= 6) return 'Deadly';
  if (d <= 7) return 'Abyssal';
  return 'Annihilating';
}

// ============================================================================
// Achievement System
// ============================================================================

export function nwCheckAllAchievements(state: NetherWorldState): readonly { id: AchievementId; completed: boolean; progress: number; target: number }[] {
  const achMap = state.achievements as Record<string, number>;
  return ACHIEVEMENT_IDS.map(id => {
    const progress = achMap[id];
    const target = nwGetAchievementTarget(id);
    return { id, completed: progress >= target, progress, target };
  });
}

export function nwGetNewlyCompletedAchievements(prev: NetherWorldState, next: NetherWorldState): readonly AchievementId[] {
  const prevMap = prev.achievements as Record<string, number>;
  const nextMap = next.achievements as Record<string, number>;
  return ACHIEVEMENT_IDS.filter(id => {
    const target = nwGetAchievementTarget(id);
    return (prevMap[id] ?? 0) < target && (nextMap[id] ?? 0) >= target;
  });
}

export function nwGetAchievementRewardXp(achievementId: AchievementId): number {
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  return ach?.rewardXp ?? 0;
}

export function nwGetAchievementRewardSoulShards(achievementId: AchievementId): number {
  const ach = ACHIEVEMENTS.find(a => a.id === achievementId);
  return ach?.rewardSoulShards ?? 0;
}

// ============================================================================
// Status Effects
// ============================================================================

export function nwApplyStatusEffect(state: NetherWorldState, effect: StatusEffect): NetherWorldState {
  const existing = state.statusEffects.find(e => e.name === effect.name);
  if (existing) {
    return {
      ...state,
      statusEffects: state.statusEffects.map(e =>
        e.name === effect.name ? { ...e, duration: Math.max(e.duration, effect.duration), potency: Math.max(e.potency, effect.potency) } : e,
      ),
    };
  }
  return { ...state, statusEffects: [...state.statusEffects, effect] };
}

export function nwTickStatusEffects(state: NetherWorldState): NetherWorldState {
  return { ...state, statusEffects: state.statusEffects.map(e => ({ ...e, duration: e.duration - 1 })).filter(e => e.duration > 0) };
}

export function nwHasStatusEffect(state: NetherWorldState, name: string): boolean {
  return state.statusEffects.some(e => e.name === name);
}

export function nwGetStatusEffectPotency(state: NetherWorldState, name: string): number {
  const effect = state.statusEffects.find(e => e.name === name);
  return effect?.potency ?? 0;
}

export function nwClearStatusEffects(state: NetherWorldState): NetherWorldState {
  return { ...state, statusEffects: [] };
}

// ============================================================================
// Combat Log
// ============================================================================

export function nwClearCombatLog(state: NetherWorldState): NetherWorldState {
  return { ...state, combatLog: [] };
}

export function nwGetLastCombatAction(state: NetherWorldState): CombatLog | undefined {
  if (state.combatLog.length === 0) return undefined;
  return state.combatLog[state.combatLog.length - 1];
}

export function nwGetCriticalHitsCount(state: NetherWorldState): number {
  return state.combatLog.filter(l => l.isCritical).length;
}

export function nwGetTotalDamageDealt(state: NetherWorldState): number {
  return state.combatLog.filter(l => l.attacker === 'Wraith').reduce((sum, l) => sum + l.damage, 0);
}

export function nwGetTotalDamageReceived(state: NetherWorldState): number {
  return state.combatLog.filter(l => l.attacker !== 'Wraith').reduce((sum, l) => sum + l.damage, 0);
}

// ============================================================================
// Utility & Calculation Helpers
// ============================================================================

export function nwCalculateDamage(attack: number, defense: number, element: ElementId, weakness?: ElementId, resistance?: ElementId): number {
  let base = attack * 0.8;
  if (weakness && element === weakness) base *= 1.5;
  if (resistance && element === resistance) base *= 0.5;
  return Math.max(1, Math.floor(base - defense * 0.3));
}

export function nwCalculateHarvestChance(spiritPower: number, harvestDifficulty: number, lightLevel: number, lanternActive: boolean): number {
  const lightBonus = lanternActive ? lightLevel * 0.02 : 0;
  return Math.min(0.95, 0.4 + (spiritPower / 100) - (harvestDifficulty * 0.05) + lightBonus);
}

export function nwCalculateXpReward(baseReward: number, wraithLevel: number): number {
  return Math.floor(baseReward * (1 + (wraithLevel - 1) * 0.02));
}

export function nwCalculateGoldReward(baseReward: number, wraithLevel: number, isCritical: boolean): number {
  return Math.floor(baseReward * (1 + (wraithLevel - 1) * 0.01) * (isCritical ? 2 : 1));
}

export function nwGetRarityLabel(rarity: number): string {
  if (rarity >= 5) return 'Legendary';
  if (rarity >= 4) return 'Epic';
  if (rarity >= 3) return 'Rare';
  if (rarity >= 2) return 'Uncommon';
  return 'Common';
}

export function nwGetRarityColor(rarity: number): string {
  if (rarity >= 5) return '#ff8c00';
  if (rarity >= 4) return '#a855f7';
  if (rarity >= 3) return '#3b82f6';
  if (rarity >= 2) return '#22c55e';
  return '#9ca3af';
}

export function nwGetElementIcon(element: ElementId): string {
  const icons: Record<ElementId, string> = { shadow: '🌑', fire: '🔥', ice: '❄️', void: '🕳️', bone: '🦴', spirit: '👻', lightning: '⚡', plague: '☣️' };
  return icons[element];
}

export function nwGetElementName(element: ElementId): string {
  const names: Record<ElementId, string> = { shadow: 'Shadow', fire: 'Fire', ice: 'Ice', void: 'Void', bone: 'Bone', spirit: 'Spirit', lightning: 'Lightning', plague: 'Plague' };
  return names[element];
}

export function nwIsElementEffective(attackingElement: ElementId, defendingElement: ElementId): boolean {
  const chart: Partial<Record<ElementId, ElementId>> = { lightning: 'shadow', fire: 'ice', ice: 'fire', void: 'spirit', bone: 'plague', spirit: 'bone', shadow: 'void', plague: 'lightning' };
  return chart[attackingElement] === defendingElement;
}

export function nwGetEffectivenessMultiplier(attackingElement: ElementId, defendingElement: ElementId): number {
  const chart: Partial<Record<ElementId, ElementId>> = { lightning: 'shadow', fire: 'ice', ice: 'fire', void: 'spirit', bone: 'plague', spirit: 'bone', shadow: 'void', plague: 'lightning' };
  if (chart[attackingElement] === defendingElement) return 1.5;
  if (chart[defendingElement] === attackingElement) return 0.67;
  return 1.0;
}

export function nwGetOptimalElementForDemon(demonTypeId: DemonTypeId): ElementId {
  const demon = DEMON_TYPES.find(d => d.id === demonTypeId);
  return demon?.weakness ?? 'shadow';
}

export function nwGetDemonicThreatLevel(demonTypeId: DemonTypeId, wraithLevel: number): string {
  const demon = DEMON_TYPES.find(d => d.id === demonTypeId);
  if (!demon) return 'Unknown';
  const ratio = demon.wraithLevel / wraithLevel;
  if (ratio <= 0.5) return 'Trivial';
  if (ratio <= 0.8) return 'Easy';
  if (ratio <= 1.0) return 'Moderate';
  if (ratio <= 1.3) return 'Hard';
  if (ratio <= 1.6) return 'Deadly';
  return 'Impossible';
}

export function nwGetSoulTypeByRarity(minRarity: number): readonly SoulType[] {
  return SOUL_TYPES.filter(s => s.rarity >= minRarity);
}

export function nwGetDemonsByLevelRange(minLevel: number, maxLevel: number): readonly DemonType[] {
  return DEMON_TYPES.filter(d => d.wraithLevel >= minLevel && d.wraithLevel <= maxLevel);
}

export function nwGetRealmsByDangerRange(minDanger: number, maxDanger: number): readonly NetherRealm[] {
  return NETHER_REALMS.filter(r => r.dangerLevel >= minDanger && r.dangerLevel <= maxDanger);
}

export function nwGetBazaarItemsByCategory(category: string): readonly BazaarItem[] {
  return BAZAAR_ITEMS.filter(i => i.category === category);
}

export function nwGetBazaarItemsByMaxPrice(maxPrice: number): readonly BazaarItem[] {
  return BAZAAR_ITEMS.filter(i => i.basePrice <= maxPrice);
}

export function nwSortSoulsByPower(ascending: boolean): readonly SoulType[] {
  return [...SOUL_TYPES].sort((a, b) => ascending ? a.power - b.power : b.power - a.power);
}

export function nwSortDemonsByHp(ascending: boolean): readonly DemonType[] {
  return [...DEMON_TYPES].sort((a, b) => ascending ? a.hp - b.hp : b.hp - a.hp);
}

export function nwSortRealmsByDanger(ascending: boolean): readonly NetherRealm[] {
  return [...NETHER_REALMS].sort((a, b) => ascending ? a.dangerLevel - b.dangerLevel : b.dangerLevel - a.dangerLevel);
}

// ============================================================================
// Gold & Economy Helpers
// ============================================================================

export function nwSpendGold(state: NetherWorldState, amount: number): NetherWorldState {
  return { ...state, gold: Math.max(0, state.gold - amount) };
}

export function nwSpendSoulShards(state: NetherWorldState, amount: number): NetherWorldState {
  return { ...state, soulShards: Math.max(0, state.soulShards - amount) };
}

export function nwAddGold(state: NetherWorldState, amount: number): NetherWorldState {
  return { ...state, gold: state.gold + amount };
}

export function nwAddSoulShards(state: NetherWorldState, amount: number): NetherWorldState {
  return { ...state, soulShards: state.soulShards + amount };
}

export function nwGetTotalWealth(state: NetherWorldState): number {
  const inv = state.bazaarInventory as Record<string, number>;
  let inventoryValue = 0;
  for (const id of BAZAAR_ITEM_IDS) {
    const item = BAZAAR_ITEMS.find(i => i.id === id);
    if (item) inventoryValue += (inv[id] ?? 0) * Math.floor(item.basePrice * 0.6);
  }
  return state.gold + state.soulShards * 10 + inventoryValue;
}

// ============================================================================
// State Reset & Serialization
// ============================================================================

export function nwResetState(): NetherWorldState {
  return nwCreateInitialState();
}

export function nwExportState(state: NetherWorldState): string {
  return JSON.stringify(state);
}

export function nwImportState(json: string): NetherWorldState | null {
  try {
    const parsed = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && parsed.wraithStats && parsed.soulCollection) {
      return parsed as NetherWorldState;
    }
    return null;
  } catch {
    return null;
  }
}

export function nwGetStateSummary(state: NetherWorldState): {
  readonly wraithLevel: number;
  readonly realm: string;
  readonly totalSouls: number;
  readonly totalPower: number;
  readonly gold: number;
  readonly demonsDefeated: number;
  readonly realmsDiscovered: number;
  readonly achievementsCompleted: number;
} {
  const realm = NETHER_REALMS.find(r => r.id === state.currentRealm);
  return {
    wraithLevel: state.wraithStats.level,
    realm: realm?.name ?? 'Unknown',
    totalSouls: nwGetTotalSoulCount(state),
    totalPower: state.totalSoulPower,
    gold: state.gold,
    demonsDefeated: state.totalDemonsDefeated,
    realmsDiscovered: NETHER_REALM_IDS.filter(id => (state.discoveredRealms as Record<string, boolean>)[id]).length,
    achievementsCompleted: nwGetCompletedAchievements(state).length,
  };
}

// ============================================================================
// Thematic Flavor Helpers
// ============================================================================

export function nwGetRealmFlavorText(realmId: NetherRealmId): string {
  const flavors: Record<NetherRealmId, string> = {
    shadow_marches: 'The mists coil around your ankles like ghostly fingers, whispering forgotten names...',
    weeping_catacombs: 'Tears streak down ancient stone walls, each drop carrying a fragment of sorrow...',
    phantom_gardens: 'Spectral petals drift on winds that carry no warmth, only the scent of memory...',
    bone_spire_wastes: 'The spires groan and shift, their fused bones creaking with the weight of eons...',
    obsidian_throne: 'Before you, a throne of perfect darkness awaits its next occupant...',
    spectral_sea: 'Waves of luminous spirit lap against shores of crystallized regret...',
    void_hollows: 'Reality itself frays at the edges, each thread a pathway to oblivion...',
    soul_furnace: 'The heat is unbearable—not physical, but spiritual. Your very essence trembles...',
  };
  return flavors[realmId];
}

export function nwGetSoulFlavorText(soulTypeId: SoulTypeId): string {
  const flavors: Record<SoulTypeId, string> = {
    lost: 'It drifts aimlessly, a faint glow with no direction.',
    restless: 'It paces back and forth, unable to find rest.',
    ancient: 'Wisdom radiates from its core like a fading star.',
    vengeful: 'Burning eyes fix upon you with centuries of hatred.',
    whispering: 'You can almost hear the words it carries from beyond.',
    crystallized: 'A perfect gem of pure spiritual energy—rare and beautiful.',
    shattered: 'Only fragments remain, scattered like broken glass.',
    twilight: 'It shimmers between states, neither here nor there.',
    echoing: 'The last words of its life repeat endlessly in a loop.',
    wandering: 'It searches for something—a home, a face, a name.',
    bound: 'Invisible chains hold it to this place, forever tethered.',
    ascending: 'Light pours from within as it struggles toward transcendence.',
    corrupted: 'Dark tendrils twist through its once-pure form.',
    transcendent: 'A being of perfect clarity, radiating absolute peace.',
  };
  return flavors[soulTypeId];
}

export function nwGetDemonFlavorText(demonTypeId: DemonTypeId): string {
  const flavors: Record<DemonTypeId, string> = {
    imp: 'A tiny figure with oversized eyes and a wicked grin materializes from the shadows.',
    shade_stalker: 'The darkness itself seems to peel away and take form.',
    wraith_lord: 'An aura of absolute dread announces the arrival of this spectral overlord.',
    hellhound: 'Three heads emerge from the darkness, each blazing with infernal fire.',
    succubus: 'Beauty and terror intertwine as she steps from the void.',
    bone_collector: 'The clatter of bones heralds the approach of the assembler of the dead.',
    flame_wraith: 'A pillar of screaming fire coalesces into humanoid form.',
    ice_devourer: 'The temperature plummets as a shape of living frost takes form.',
    void_titan: 'The fabric of reality tears open as something impossibly vast peers through.',
    soul_reaver: 'The ultimate predator of spirits descends, its hunger insatiable.',
  };
  return flavors[demonTypeId];
}

export function nwGetRiverFlavorText(riverId: RiverId): string {
  const flavors: Record<RiverId, string> = {
    styx: 'The black waters flow silently, carrying the accumulated hatred of ages.',
    acheron: 'The wailing of the damned rises from these sorrowful waters.',
    lethe: 'Crystal-clear waters that promise the bliss of forgetting.',
    phlegethon: 'Rivers of fire and molten iron surge through channels of obsidian.',
    cocytus: 'Frozen tears form a bitter river that chills the very soul.',
  };
  return flavors[riverId];
}

export function nwGetAbilityFlavorText(abilityId: AbilityId): string {
  const flavors: Record<AbilityId, string> = {
    phase_shift: 'Your form becomes translucent, then invisible—you pass through the barrier.',
    possess: 'Your consciousness surges forward and seizes control of the target.',
    siphon: 'Spectral tendrils extend from your hands, drawing life force from nearby souls.',
    wail: 'A scream that resonates across the veil of death echoes through the chamber.',
    veil_walk: 'You step sideways through reality, existing between worlds.',
    death_grip: 'Your hand reaches across the boundary, closing around the target\'s essence.',
    spectral_form: 'Your physical form dissolves into pure spectral energy.',
    soul_bind: 'Luminous chains of spirit energy link your soul to another.',
  };
  return flavors[abilityId];
}

export function nwGetRealmAmbientDescription(realmId: NetherRealmId, lightLevel: number): string {
  const realm = NETHER_REALMS.find(r => r.id === realmId);
  if (!realm) return 'Darkness surrounds you.';
  if (lightLevel <= 2) return `The ${realm.name} is shrouded in near-total darkness. Shapes lurk just beyond perception.`;
  if (lightLevel <= 5) return `Your lantern casts a dim glow across the ${realm.name}. Shadows still dominate the periphery.`;
  if (lightLevel <= 8) return `The ${realm.name} reveals its secrets under your lantern's steady light.`;
  return `Your lantern blazes brilliantly, illuminating every corner of the ${realm.name} in spectral radiance.`;
}

// ============================================================================
// Stat Summary Helpers
// ============================================================================

export function nwGetSoulCollectionSummary(state: NetherWorldState): readonly { id: SoulTypeId; count: number; power: number; rarity: number }[] {
  const coll = state.soulCollection as Record<string, number>;
  return SOUL_TYPE_IDS.map(id => {
    const info = SOUL_TYPES.find(s => s.id === id)!;
    return { id, count: coll[id] ?? 0, power: (coll[id] ?? 0) * info.power, rarity: info.rarity };
  }).filter(s => s.count > 0);
}

export function nwGetRealmExplorationSummary(state: NetherWorldState): readonly { realmId: NetherRealmId; discovered: boolean; exploredNodes: number; totalNodes: number }[] {
  const disc = state.discoveredRealms as Record<string, boolean>;
  return NETHER_REALM_IDS.map(id => {
    const nodes = state.mapNodes.filter(n => n.realmId === id);
    return { realmId: id, discovered: disc[id] === true, exploredNodes: nodes.filter(n => n.isExplored).length, totalNodes: nodes.length };
  });
}

export function nwGetCombatSummary(state: NetherWorldState): {
  readonly totalLogEntries: number;
  readonly totalDamageDealt: number;
  readonly totalDamageReceived: number;
  readonly criticalHits: number;
  readonly demonsDefeated: number;
  readonly averageDamageDealt: number;
} {
  const dealt = nwGetTotalDamageDealt(state);
  const wraithAttacks = state.combatLog.filter(l => l.attacker === 'Wraith' && l.action !== 'flee' && l.action !== 'encounter_start' && l.action !== 'demon_defeated').length;
  return {
    totalLogEntries: state.combatLog.length,
    totalDamageDealt: dealt,
    totalDamageReceived: nwGetTotalDamageReceived(state),
    criticalHits: nwGetCriticalHitsCount(state),
    demonsDefeated: state.totalDemonsDefeated,
    averageDamageDealt: wraithAttacks > 0 ? Math.floor(dealt / wraithAttacks) : 0,
  };
}

// ============================================================================
// Constants Export
// ============================================================================

export const NW_MAX_WRAITH_LEVEL = 50;
export const NW_MAX_LANTERN_FUEL = 100;
export const NW_MAX_LANTERN_LIGHT = 10;
export const NW_MAX_SHIP_DURABILITY = 300;
export const NW_REALM_COUNT = 8;
export const NW_SOUL_TYPE_COUNT = 14;
export const NW_DEMON_TYPE_COUNT = 10;
export const NW_RIVER_COUNT = 5;
export const NW_ABILITY_COUNT = 8;
export const NW_ACHIEVEMENT_COUNT = 15;
export const NW_BAZAAR_ITEM_COUNT = 15;

// ============================================================================
// Default Export (React Hook — ONLY place with React import)
// ============================================================================

export default function useNetherWorld(initialState?: NetherWorldState) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react') as typeof import('react');
  const useState = React.useState;
  const [state, setState] = useState<NetherWorldState>(initialState ?? nwCreateInitialState());

  return {
    state,
    setState,
    get: () => state,
    // Realm
    travelToRealm: (realmId: NetherRealmId) => setState(nwTravelToRealm(state, realmId)),
    discoverRealm: (realmId: NetherRealmId) => setState(nwDiscoverRealm(state, realmId)),
    // Souls
    harvestSoul: (soulTypeId: SoulTypeId) => setState(nwHarvestSoul(state, soulTypeId)),
    harvestSoulOnNode: () => setState(nwHarvestSoulOnNode(state)),
    // Combat
    startEncounter: (demonTypeId: DemonTypeId) => setState(nwStartEncounter(state, demonTypeId)),
    startRandomEncounter: () => setState(nwStartRandomEncounter(state)),
    fight: (element?: ElementId) => setState(nwFight(state, element)),
    flee: () => setState(nwFlee(state)),
    useAbilityInCombat: (abilityId: AbilityId) => setState(nwUseAbilityInCombat(state, abilityId)),
    // River
    crossRiver: (riverId: RiverId) => setState(nwCrossRiver(state, riverId)),
    // Ship
    boardShip: () => setState(nwBoardShip(state)),
    setShipDestination: (dest: NetherRealmId) => setState(nwSetShipDestination(state, dest)),
    navigateShip: () => setState(nwNavigateShip(state)),
    repairShip: () => setState(nwRepairShip(state)),
    upgradeShip: () => setState(nwUpgradeShip(state)),
    // Lantern
    igniteLantern: () => setState(nwIgniteLantern(state)),
    extinguishLantern: () => setState(nwExtinguishLantern(state)),
    fuelLantern: (amount: number) => setState(nwFuelLantern(state, amount)),
    upgradeLantern: () => setState(nwUpgradeLantern(state)),
    // Abilities
    unlockAbility: (abilityId: AbilityId) => setState(nwUnlockAbility(state, abilityId)),
    unlockAvailableAbilities: () => setState(nwUnlockAvailableAbilities(state)),
    activatePhaseShift: () => setState(nwActivatePhaseShift(state)),
    deactivatePhaseShift: () => setState(nwDeactivatePhaseShift(state)),
    activateSpectralForm: () => setState(nwActivateSpectralForm(state)),
    deactivateSpectralForm: () => setState(nwDeactivateSpectralForm(state)),
    // Bazaar
    buyItem: (itemId: BazaarItemId, qty: number) => setState(nwBuyItem(state, itemId, qty)),
    sellItem: (itemId: BazaarItemId, qty: number) => setState(nwSellItem(state, itemId, qty)),
    useBazaarItem: (itemId: BazaarItemId) => setState(nwUseBazaarItem(state, itemId)),
    // Map
    moveToNode: (nodeId: string) => setState(nwMoveToNode(state, nodeId)),
    explore: () => setState(nwExplore(state)),
    // Expedition
    startExpedition: () => setState(nwStartExpedition(state)),
    advanceExpedition: () => setState(nwAdvanceExpedition(state)),
    endExpedition: () => setState(nwEndExpedition(state)),
    startDailyExpedition: () => setState(nwStartDailyExpedition(state)),
    completeDailyExpedition: () => setState(nwCompleteDailyExpedition(state)),
    resetDailyExpedition: () => setState(nwResetDailyExpedition(state)),
    // XP & Economy
    addExperience: (amount: number) => setState(nwAddExperience(state, amount)),
    spendGold: (amount: number) => setState(nwSpendGold(state, amount)),
    spendSoulShards: (amount: number) => setState(nwSpendSoulShards(state, amount)),
    addGold: (amount: number) => setState(nwAddGold(state, amount)),
    addSoulShards: (amount: number) => setState(nwAddSoulShards(state, amount)),
    restoreMana: (amount: number) => setState(nwRestoreMana(state, amount)),
    // Status & Log
    applyStatusEffect: (effect: StatusEffect) => setState(nwApplyStatusEffect(state, effect)),
    tickStatusEffects: () => setState(nwTickStatusEffects(state)),
    clearStatusEffects: () => setState(nwClearStatusEffects(state)),
    tickCooldowns: () => setState(nwTickCooldowns(state)),
    clearCombatLog: () => setState(nwClearCombatLog(state)),
    // Reset
    resetState: () => setState(nwResetState()),
  };
}
