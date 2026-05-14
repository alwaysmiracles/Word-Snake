/**
 * Crimson Dunes Wire — 红沙荒漠 (Crimson Dunes) feature module for Word Snake
 *
 * A desert survival mini-game: collect 35 desert creatures across 5 rarity tiers
 * and 7 species, tend 8 sacred oases, gather 30 sand/gem materials, build 25
 * dune structures, wield 22 desert abilities, earn 8 progression titles,
 * gather 15 legendary artifacts, and survive 12 random dune events — backed by
 * a Zustand store with persist middleware.
 *
 * Storage key: crimson-dunes-wire
 * Prefix: cd / CD_
 * Colors: crimson #DC143C, sand gold #DAA520, oasis teal #008080, dune amber #FFBF00
 */

import { useMemo, useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════

export type CDRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
export type CDSpecies =
  | 'sand_wyrm'
  | 'dust_devil'
  | 'scarab_golem'
  | 'crimson_hawk'
  | 'dune_walker'
  | 'fire_ant_swarm'
  | 'mirage_stalker'
export type CDMaterialType = 'sand' | 'gem' | 'mineral' | 'crystal' | 'relic'
export type CDAbilityType = 'combat' | 'exploration' | 'survival' | 'mystic'
export type CDEventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface CDCreatureDef {
  readonly id: string
  readonly name: string
  readonly species: CDSpecies
  readonly rarity: CDRarity
  readonly power: number
  readonly hp: number
  readonly description: string
  readonly specialAbility: string
}

export interface CDOasisDef {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly description: string
}

export interface CDMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: CDRarity
  readonly description: string
  readonly value: number
  readonly type: CDMaterialType
}

export interface CDStructureDef {
  readonly id: string
  readonly name: string
  readonly maxLevel: number
  readonly description: string
  readonly effectPerLevel: string
  readonly baseCost: number
}

export interface CDAbilityDef {
  readonly id: string
  readonly name: string
  readonly type: CDAbilityType
  readonly power: number
  readonly cooldown: number
  readonly description: string
}

export interface CDAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface CDTitleDef {
  readonly id: string
  readonly name: string
  readonly requirement: string
  readonly bonus: string
}

export interface CDArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly power: number
  readonly lore: string
}

export interface CDEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly effect: string
  readonly rarity: CDEventRarity
}

export interface CDCreatureState {
  collected: boolean
  collectedAt: number
  level: number
}

export interface CDOasisState {
  tended: boolean
  lastTendedAt: number
  level: number
  resourcesGathered: number
}

export interface CDInventoryItem {
  materialId: string
  quantity: number
}

export interface CrimsonDunesState {
  cdCreatures: Record<string, CDCreatureState>
  cdOasis: Record<string, CDOasisState>
  cdInventory: CDInventoryItem[]
  cdArtifacts: string[]
  cdAchievements: string[]
  cdTitle: string
  cdEvents: string[]
  cdStructures: Record<string, number>
  cdStats: {
    totalCollected: number
    totalExplored: number
    totalCrafted: number
    totalBattles: number
    totalEvents: number
    totalOasisVisits: number
    highestCreaturePower: number
    daysInDesert: number
  }
}

export interface CrimsonDunesActions {
  collectCreature: (id: string) => boolean
  tendOasis: (id: string) => boolean
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerDuneEvent: () => CDEventDef | null
  resetCrimsonDunes: () => void
}

export type CDStore = CrimsonDunesState & CrimsonDunesActions

// ═══════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════

export const CD_COLOR_CRIMSON: string = '#DC143C'
export const CD_COLOR_SAND_GOLD: string = '#DAA520'
export const CD_COLOR_OASIS_TEAL: string = '#008080'
export const CD_COLOR_DUNE_AMBER: string = '#FFBF00'

export const CD_COLORS: Record<string, string> = {
  crimson: '#DC143C',
  sandGold: '#DAA520',
  oasisTeal: '#008080',
  duneAmber: '#FFBF00',
  background: '#1A0A0A',
  surface: '#2D1010',
  textPrimary: '#F5DEB3',
  textSecondary: '#D2B48C',
}

// ═══════════════════════════════════════════════════════
// SECTION 3: RARITY & SPECIES HELPERS
// ═══════════════════════════════════════════════════════

export const CD_RARITY_TIERS: Record<
  CDRarity,
  { name: string; color: string; multiplier: number; weight: number }
> = {
  common: { name: 'Common', color: '#A0A0A0', multiplier: 1.0, weight: 45 },
  uncommon: { name: 'Uncommon', color: '#2E8B57', multiplier: 1.5, weight: 28 },
  rare: { name: 'Rare', color: '#008080', multiplier: 2.5, weight: 16 },
  epic: { name: 'Epic', color: '#DC143C', multiplier: 4.0, weight: 8 },
  legendary: { name: 'Legendary', color: '#FFBF00', multiplier: 7.0, weight: 3 },
}

export const CD_SPECIES: Record<
  CDSpecies,
  { name: string; description: string; color: string }
> = {
  sand_wyrm: {
    name: 'Sand Wyrm',
    description: 'Massive serpentine creatures that tunnel beneath the dunes.',
    color: '#DAA520',
  },
  dust_devil: {
    name: 'Dust Devil',
    description: 'Whirling elemental spirits of the desert wind.',
    color: '#C0C0C0',
  },
  scarab_golem: {
    name: 'Scarab Golem',
    description: 'Ancient constructs powered by sacred scarab magic.',
    color: '#006400',
  },
  crimson_hawk: {
    name: 'Crimson Hawk',
    description: 'Fierce raptors with feathers that shimmer like blood.',
    color: '#DC143C',
  },
  dune_walker: {
    name: 'Dune Walker',
    description: 'Enigmatic humanoid beings that stride atop the sand.',
    color: '#FFBF00',
  },
  fire_ant_swarm: {
    name: 'Fire Ant Swarm',
    description: 'Burning insect colonies that rage across the desert.',
    color: '#FF4500',
  },
  mirage_stalker: {
    name: 'Mirage Stalker',
    description: 'Predators that exist half in this world, half in illusion.',
    color: '#87CEEB',
  },
}

function cdRarityMultiplier(rarity: CDRarity): number {
  return CD_RARITY_TIERS[rarity].multiplier
}

function cdRarityColor(rarity: CDRarity): string {
  return CD_RARITY_TIERS[rarity].color
}

// ═══════════════════════════════════════════════════════
// SECTION 4: CD_SPECIES_BONUSES — Per-species collection bonuses
// ═══════════════════════════════════════════════════════

export const CD_SPECIES_BONUSES: Record<
  CDSpecies,
  { passiveBonus: string; activeBonus: string; synergy: CDSpecies[] }
> = {
  sand_wyrm: {
    passiveBonus: '+5% underground resource detection',
    activeBonus: 'Tunneling: Travel underground, bypassing obstacles',
    synergy: ['dust_devil', 'mirage_stalker'],
  },
  dust_devil: {
    passiveBonus: '+3% evasion in sandstorm conditions',
    activeBonus: 'Wind Shield: Reduce incoming damage by 10%',
    synergy: ['sand_wyrm', 'dune_walker'],
  },
  scarab_golem: {
    passiveBonus: '+8% structure defense bonus',
    activeBonus: 'Stone Skin: Temporary damage absorption',
    synergy: ['dune_walker', 'mirage_stalker'],
  },
  crimson_hawk: {
    passiveBonus: '+5% creature detection range',
    activeBonus: 'Eagle Eye: Reveal all creatures in a wide area',
    synergy: ['fire_ant_swarm', 'dust_devil'],
  },
  dune_walker: {
    passiveBonus: '+10% movement speed on sand',
    activeBonus: 'Dune Step: Teleport between known locations',
    synergy: ['sand_wyrm', 'scarab_golem'],
  },
  fire_ant_swarm: {
    passiveBonus: '+5% burn damage on all attacks',
    activeBonus: 'Swarm Fury: Multi-target burning assault',
    synergy: ['crimson_hawk', 'dust_devil'],
  },
  mirage_stalker: {
    passiveBonus: '+7% illusion resistance',
    activeBonus: 'Mirror Image: Create decoys to confuse enemies',
    synergy: ['dune_walker', 'scarab_golem'],
  },
}

// ═══════════════════════════════════════════════════════
// SECTION 5: CD_ABILITY_CATEGORIES — Ability type metadata
// ═══════════════════════════════════════════════════════

export const CD_ABILITY_CATEGORIES: Record<
  CDAbilityType,
  { name: string; description: string; color: string }
> = {
  combat: {
    name: 'Combat',
    description: 'Offensive abilities that deal direct damage to creatures and enemies in the Crimson Dunes.',
    color: '#DC143C',
  },
  exploration: {
    name: 'Exploration',
    description: 'Utility abilities that aid in discovering new locations, resources, and hidden desert secrets.',
    color: '#DAA520',
  },
  survival: {
    name: 'Survival',
    description: 'Defensive abilities that protect from environmental hazards and extend desert endurance.',
    color: '#008080',
  },
  mystic: {
    name: 'Mystic',
    description: 'Magical abilities that harness the ancient, primordial forces of the Crimson Dunes.',
    color: '#FFBF00',
  },
}

// ═══════════════════════════════════════════════════════
// SECTION 6: CD_MATERIAL_CATEGORIES — Material type metadata
// ═══════════════════════════════════════════════════════

export const CD_MATERIAL_CATEGORIES: Record<
  CDMaterialType,
  { name: string; description: string; color: string; icon: string }
> = {
  sand: {
    name: 'Sand',
    description: 'Granular desert materials used in construction and basic alchemy.',
    color: '#DAA520',
    icon: '⏳',
  },
  gem: {
    name: 'Gem',
    description: 'Precious and semi-precious gemstones with innate magical properties.',
    color: '#DC143C',
    icon: '💎',
  },
  mineral: {
    name: 'Mineral',
    description: 'Raw ores and extracted minerals used in crafting and construction.',
    color: '#808080',
    icon: '🪨',
  },
  crystal: {
    name: 'Crystal',
    description: 'Crystalline formations that store and channel magical energy.',
    color: '#00BFFF',
    icon: '🔮',
  },
  relic: {
    name: 'Relic',
    description: 'Ancient artifacts of immense power and historical significance.',
    color: '#FFBF00',
    icon: '🏺',
  },
}

// ═══════════════════════════════════════════════════════
// SECTION 7: CD_STRUCTURE_CATEGORIES — Structure type groupings
// ═══════════════════════════════════════════════════════

export const CD_STRUCTURE_CATEGORIES: readonly {
  id: string
  name: string
  description: string
  structureIds: string[]
  color: string
}[] = [
  {
    id: 'shelter',
    name: 'Shelter',
    description: 'Structures that provide living quarters and base protection for desert settlers.',
    structureIds: ['sand_tent', 'adobe_hut', 'stone_watchtower', 'fortress_dunes', 'obsidian_palace'],
    color: '#DAA520',
  },
  {
    id: 'resource',
    name: 'Resource',
    description: 'Extraction and processing facilities for gathering and refining desert materials.',
    structureIds: ['sand_quarry', 'crystal_mine', 'gem_workshop', 'relic_forge', 'creation_anvil'],
    color: '#008080',
  },
  {
    id: 'water',
    name: 'Water',
    description: 'Water management infrastructure essential for long-term desert survival.',
    structureIds: ['clay_well', 'deep_bore', 'oasis_pump', 'aqueduct_network', 'water_temple'],
    color: '#87CEEB',
  },
  {
    id: 'combat',
    name: 'Combat',
    description: 'Defensive fortifications and weapon emplacements to repel desert creatures.',
    structureIds: ['sand_barrier', 'spike_trench', 'crystal_turret', 'scarab_bastion', 'wyrm_gate'],
    color: '#DC143C',
  },
  {
    id: 'mystical',
    name: 'Mystical',
    description: 'Sacred structures that channel the ancient magical forces of the Crimson Dunes.',
    structureIds: ['shrine_dunes', 'star_observatory', 'dream_chamber', 'blood_altar_desert', 'primal_shrine'],
    color: '#FFBF00',
  },
]

// ═══════════════════════════════════════════════════════
// SECTION 8: CD_DIFFICULTY_TIERS — Difficulty progression
// ═══════════════════════════════════════════════════════

export const CD_DIFFICULTY_TIERS: readonly {
  id: string
  name: string
  creatureLevelRange: [number, number]
  eventFrequency: number
  resourceMultiplier: number
  color: string
}[] = [
  { id: 'scorching_plains', name: 'Scorching Plains', creatureLevelRange: [1, 5], eventFrequency: 1.0, resourceMultiplier: 1.0, color: '#DAA520' },
  { id: 'winding_canyons', name: 'Winding Canyons', creatureLevelRange: [3, 10], eventFrequency: 1.2, resourceMultiplier: 1.3, color: '#CD853F' },
  { id: 'crimson_depths', name: 'Crimson Depths', creatureLevelRange: [8, 20], eventFrequency: 1.5, resourceMultiplier: 1.8, color: '#DC143C' },
  { id: 'mirror_desert', name: 'Mirror Desert', creatureLevelRange: [15, 30], eventFrequency: 1.8, resourceMultiplier: 2.5, color: '#FFBF00' },
  { id: 'primal_void', name: 'Primal Void', creatureLevelRange: [25, 50], eventFrequency: 2.5, resourceMultiplier: 4.0, color: '#800080' },
]

// ═══════════════════════════════════════════════════════
// SECTION 9: CD_CREATURES — 35 Desert Creatures (5 rarity × 7 species)
// ═══════════════════════════════════════════════════════

export const CD_CREATURES: readonly CDCreatureDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'common_dune_serpent',
    name: 'Dune Serpent',
    species: 'sand_wyrm',
    rarity: 'common',
    power: 15,
    hp: 40,
    description:
      'A young sand wyrm that burrows just beneath the surface of the dunes. Its scales shimmer like wet sand, and it hunts by sensing vibrations through the ground. Though small for its kind, it can still swallow a camel whole.',
    specialAbility: 'Sand Sense',
  },
  {
    id: 'common_dust_sprite',
    name: 'Dust Sprite',
    species: 'dust_devil',
    rarity: 'common',
    power: 12,
    hp: 25,
    description:
      'A tiny whirlwind of sentient dust that dances across the desert floor. It poses little threat but can blind travelers with swirling grit. Nomads consider them omens of changing weather and shifting dunes.',
    specialAbility: 'Grit Blind',
  },
  {
    id: 'common_clay_beetle',
    name: 'Clay Beetle',
    species: 'scarab_golem',
    rarity: 'common',
    power: 10,
    hp: 60,
    description:
      'A small golem assembled from dried clay and animated by a fragment of scarab magic. It moves with slow, jerky motions but is surprisingly durable. Often found near ancient ruins where the magic is strongest.',
    specialAbility: 'Clay Armor',
  },
  {
    id: 'common_sand_finch',
    name: 'Sand Finch',
    species: 'crimson_hawk',
    rarity: 'common',
    power: 8,
    hp: 20,
    description:
      'A small hawk with dusty brown feathers that blends perfectly with the desert terrain. It feeds on lizards and insects, diving from great heights with silent precision. Desert tribes use its feathers in ceremonial headdresses.',
    specialAbility: 'Silent Dive',
  },
  {
    id: 'common_wanderers_shade',
    name: "Wanderer's Shade",
    species: 'dune_walker',
    rarity: 'common',
    power: 14,
    hp: 35,
    description:
      'A faint, humanoid silhouette that appears at the hottest part of the day. It follows lost travelers at a distance, sometimes leading them to safety, other times deeper into the wastes. Its intentions remain unknowable.',
    specialAbility: 'Heat Shimmer',
  },
  {
    id: 'common_ember_ant',
    name: 'Ember Ant',
    species: 'fire_ant_swarm',
    rarity: 'common',
    power: 11,
    hp: 15,
    description:
      'A solitary fire ant that glows with a faint orange light. Its bite delivers a mild burning sensation that lingers for hours. They build sprawling underground colonies connected by tunnels that glow like veins of fire.',
    specialAbility: 'Burn Bite',
  },
  {
    id: 'common_heat_mirage',
    name: 'Heat Mirage',
    species: 'mirage_stalker',
    rarity: 'common',
    power: 13,
    hp: 30,
    description:
      'A semi-transparent predator that takes the form of distant water or shelter. It feeds on the desperation of thirsty travelers, luring them away from true oases and into the killing ground of the deep desert.',
    specialAbility: 'Illusion Lure',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'uncommon_rust_wyrm',
    name: 'Rust Wyrm',
    species: 'sand_wyrm',
    rarity: 'uncommon',
    power: 32,
    hp: 90,
    description:
      'An adolescent sand wyrm whose scales have oxidized to a deep reddish-brown. It creates underground tunnels wide enough for a horse to gallop through. Its breath smells of copper and old blood, and its roar echoes for miles.',
    specialAbility: 'Tunnel Collapse',
  },
  {
    id: 'uncommon_whirling_devil',
    name: 'Whirling Devil',
    species: 'dust_devil',
    rarity: 'uncommon',
    power: 28,
    hp: 55,
    description:
      'A man-sized whirlwind that picks up sand, rocks, and the occasional small animal. It moves with apparent malice, targeting encampments and chasing lone travelers across the flats with terrifying persistence.',
    specialAbility: 'Debris Storm',
  },
  {
    id: 'uncommon_amber_scarab',
    name: 'Amber Scarab',
    species: 'scarab_golem',
    rarity: 'uncommon',
    power: 30,
    hp: 110,
    description:
      'A golem constructed from polished amber and desert resin. Golden light pulses within its chest like a mechanical heartbeat. It guards forgotten tombs with unwavering vigilance and possesses intelligence far beyond other golems.',
    specialAbility: 'Amber Shield',
  },
  {
    id: 'uncommon_crimson_falcon',
    name: 'Crimson Falcon',
    species: 'crimson_hawk',
    rarity: 'uncommon',
    power: 35,
    hp: 65,
    description:
      'A magnificent hawk with feathers that range from deep burgundy to bright scarlet. It is revered by desert tribes as a symbol of war and courage. Its talons can pierce chain mail, and its cry inspires allies to fight harder.',
    specialAbility: 'Crimson Dive',
  },
  {
    id: 'uncommon_dune_phantom',
    name: 'Dune Phantom',
    species: 'dune_walker',
    rarity: 'uncommon',
    power: 26,
    hp: 75,
    description:
      'A more substantial dune walker that can manipulate small patches of sand, creating false footsteps and hiding trails. Nomads hire them as guides through the most treacherous desert passes, though their price is always knowledge.',
    specialAbility: 'Sand Manipulation',
  },
  {
    id: 'uncommon_blaze_swarm',
    name: 'Blaze Swarm',
    species: 'fire_ant_swarm',
    rarity: 'uncommon',
    power: 33,
    hp: 80,
    description:
      'A coordinated swarm of fire ants that moves as a single organism. They can strip a carcass to bone in minutes and their collective body heat is enough to ignite dry brush. The sound of their approach is like crackling flames.',
    specialAbility: 'Collective Burn',
  },
  {
    id: 'uncommon_shimmer_wraith',
    name: 'Shimmer Wraith',
    species: 'mirage_stalker',
    rarity: 'uncommon',
    power: 29,
    hp: 60,
    description:
      'A predatory mirage that has learned to mimic human voices. It calls out from the dunes with the voices of lost loved ones, drawing the grieving into its hunting grounds where the sand itself becomes a weapon.',
    specialAbility: 'Voice Mimicry',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'rare_golden_leviathan',
    name: 'Golden Leviathan',
    species: 'sand_wyrm',
    rarity: 'rare',
    power: 65,
    hp: 220,
    description:
      'A massive sand wyrm covered in scales that gleam like polished gold. It is worshipped by some desert tribes as a living deity. Its tunnels form underground rivers of quicksand, and its appearance is considered both an omen and a blessing.',
    specialAbility: 'Quicksand Surge',
  },
  {
    id: 'rare_sandstorm_djinn',
    name: 'Sandstorm Djinn',
    species: 'dust_devil',
    rarity: 'rare',
    power: 60,
    hp: 150,
    description:
      'A powerful elemental spirit that can summon localized sandstorms at will. It appears as a towering vortex of dark sand with two points of amber light for eyes. Ancient desert shamans learned to bargain with it for safe passage.',
    specialAbility: 'Sandstorm Summon',
  },
  {
    id: 'rare_jade_golem',
    name: 'Jade Golem',
    species: 'scarab_golem',
    rarity: 'rare',
    power: 58,
    hp: 280,
    description:
      'A towering golem carved from a single block of desert jade. Ancient scarab hieroglyphs glow along its surface, pulsing with protective magic that predates human civilization. It guards the entrances to the most sacred tombs.',
    specialAbility: 'Scarab Ward',
  },
  {
    id: 'rare_blood_wing',
    name: 'Blood Wing',
    species: 'crimson_hawk',
    rarity: 'rare',
    power: 62,
    hp: 130,
    description:
      'A hawk of terrifying size with wings that span forty feet. Its feathers are the color of fresh blood, and it hunts sand wyrms for sport. Villages build elaborate netting to protect their livestock from its razor-sharp talons.',
    specialAbility: 'Blood Screech',
  },
  {
    id: 'rare_treader_of_dunes',
    name: 'Treader of Dunes',
    species: 'dune_walker',
    rarity: 'rare',
    power: 55,
    hp: 180,
    description:
      'An ancient dune walker that has walked the desert for centuries. It knows every secret path and hidden spring. Its feet never touch the ground — it hovers inches above the sand, leaving no footprints and making no sound.',
    specialAbility: 'Path Revelation',
  },
  {
    id: 'rare_inferno_colony',
    name: 'Inferno Colony',
    species: 'fire_ant_swarm',
    rarity: 'rare',
    power: 64,
    hp: 200,
    description:
      'A massive supercolony of fire ants that has developed collective intelligence rivaling that of a human. They build towering mounds of fused sand and can coordinate attacks on creatures a hundred times their individual size.',
    specialAbility: 'Inferno Mound',
  },
  {
    id: 'rare_phantom_serpent',
    name: 'Phantom Serpent',
    species: 'mirage_stalker',
    rarity: 'rare',
    power: 57,
    hp: 160,
    description:
      'A mirage stalker that has achieved partial physical form. It appears as a translucent serpent with scales made of frozen light. Its venom causes hallucinations that last for days, during which victims see the desert as it truly is.',
    specialAbility: 'Hallucination Venom',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'epic_crimson_abyssal',
    name: 'Crimson Abyssal',
    species: 'sand_wyrm',
    rarity: 'epic',
    power: 120,
    hp: 500,
    description:
      'A legendary sand wyrm that has lived for millennia beneath the Crimson Abyss — a bottomless chasm in the desert\'s heart. Its scales are stained red from the blood of countless victims. When it surfaces, the ground shakes for miles around.',
    specialAbility: 'Abyssal Eruption',
  },
  {
    id: 'epic_devil_of_the_deep',
    name: 'Devil of the Deep',
    species: 'dust_devil',
    rarity: 'epic',
    power: 110,
    hp: 400,
    description:
      'The most powerful dust devil ever recorded, this entity can generate winds strong enough to strip flesh from bone. It roams the deepest desert canyons, feeding on the kinetic energy of sandstorms and growing ever stronger.',
    specialAbility: 'Canyon Fury',
  },
  {
    id: 'epic_obsidian_scarab_king',
    name: 'Obsidian Scarab King',
    species: 'scarab_golem',
    rarity: 'epic',
    power: 115,
    hp: 650,
    description:
      'The largest scarab golem in existence, standing thirty feet tall and carved entirely from volcanic obsidian. It was built by an extinct civilization to guard their most sacred treasure. The hieroglyphs on its body tell the full story of their fallen empire.',
    specialAbility: 'Obsidian Fortress',
  },
  {
    id: 'epic_crimson_talon_emperor',
    name: 'Crimson Talon Emperor',
    species: 'crimson_hawk',
    rarity: 'epic',
    power: 125,
    hp: 380,
    description:
      'The alpha of all crimson hawks, a bird of immense power and terrible beauty. Its wingspan blots out the sun when it flies overhead, and its cry can shatter stone. It perches only on the highest dune peaks, surveying its domain.',
    specialAbility: 'Emperor\'s Screech',
  },
  {
    id: 'epic_dune_colossus',
    name: 'Dune Colossus',
    species: 'dune_walker',
    rarity: 'epic',
    power: 105,
    hp: 550,
    description:
      'A titanic dune walker that stands over a hundred feet tall. It moves so slowly that it appears to be a permanent feature of the landscape — until it raises its foot and the desert trembles. Each step reshapes the terrain for miles.',
    specialAbility: 'Colossus Stride',
  },
  {
    id: 'epic_apocalypse_swarm',
    name: 'Apocalypse Swarm',
    species: 'fire_ant_swarm',
    rarity: 'epic',
    power: 130,
    hp: 450,
    description:
      'A sentient superorganism comprising billions of fire ants. It communicates through chemical signals and can solve complex problems. When threatened, it ignites itself in a blaze that can be seen from orbit, scorching everything within a mile.',
    specialAbility: 'Self-Immolation',
  },
  {
    id: 'epic_mirage_sovereign',
    name: 'Mirage Sovereign',
    species: 'mirage_stalker',
    rarity: 'epic',
    power: 118,
    hp: 420,
    description:
      'The ruler of all mirages, a being that exists simultaneously in reality and illusion. It can create entire false landscapes — cities, forests, armies — that feel completely real to anyone who enters them. No one has ever proven they escaped its domain.',
    specialAbility: 'Reality Rewrite',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'legendary_elder_sand_dragon',
    name: 'Elder Sand Dragon',
    species: 'sand_wyrm',
    rarity: 'legendary',
    power: 200,
    hp: 1000,
    description:
      'The primordial ancestor of all sand wyrms, a creature so ancient it remembers when the desert was an ocean. Its body is a living geode, with crystals erupting from between scales of petrified sand. It speaks in a voice like shifting dunes and commands absolute loyalty from all lesser wyrms.',
    specialAbility: 'Ocean Memory',
  },
  {
    id: 'legendary_primordial_dust_titan',
    name: 'Primordial Dust Titan',
    species: 'dust_devil',
    rarity: 'legendary',
    power: 190,
    hp: 900,
    description:
      'The first dust devil, born when the primordial wind first touched the primordial sand. It is as large as a mountain and moves with the patience of geological time. Entire deserts are created and destroyed by its passage, and civilizations rise and fall in its shadow.',
    specialAbility: 'Desert Genesis',
  },
  {
    id: 'legendary_eternal_scarab_god',
    name: 'Eternal Scarab God',
    species: 'scarab_golem',
    rarity: 'legendary',
    power: 195,
    hp: 1200,
    description:
      'A sentient golem of divine origin, worshipped as a god by the ancient desert civilizations. It can grant or strip away life with a touch, and its shell is impervious to all known weapons. It guards the cycle of life and death in the desert and has done so since the beginning of time.',
    specialAbility: 'Life Cycle',
  },
  {
    id: 'legendary_phoenix_of_crimson_skies',
    name: 'Phoenix of Crimson Skies',
    species: 'crimson_hawk',
    rarity: 'legendary',
    power: 210,
    hp: 800,
    description:
      'A crimson hawk that has transcended mortality through the ancient phoenix ritual. When it dies, it is reborn from its own ashes, stronger than before. It has died and been reborn seven times, each incarnation more powerful and terrible than the last.',
    specialAbility: 'Eternal Rebirth',
  },
  {
    id: 'legendary_ancient_dune_titan',
    name: 'Ancient Dune Titan',
    species: 'dune_walker',
    rarity: 'legendary',
    power: 185,
    hp: 1100,
    description:
      'The oldest dune walker, a being that has walked every inch of the desert. It knows the name of every grain of sand and can reshape the landscape with a gesture. It carries the memories of every traveler who has ever crossed the dunes, and it shares them selectively.',
    specialAbility: 'Sand Mastery',
  },
  {
    id: 'legendary_solar_fire_legion',
    name: 'Solar Fire Legion',
    species: 'fire_ant_swarm',
    rarity: 'legendary',
    power: 205,
    hp: 950,
    description:
      'A consciousness that has achieved godhood through sheer collective will. The Solar Fire Legion exists in multiple places simultaneously, its ants burning with the captured heat of a thousand sunrises. It can ignite the atmosphere itself, creating new stars.',
    specialAbility: 'Solar Ignition',
  },
  {
    id: 'legendary_oasis_dreamweaver',
    name: 'Oasis Dreamweaver',
    species: 'mirage_stalker',
    rarity: 'legendary',
    power: 188,
    hp: 850,
    description:
      'A mirage stalker that has learned to create permanent oases through pure will. Its illusions are so powerful they become real. It dreams the desert into existence every night, and if it were to stop dreaming, the entire Crimson Dunes would simply vanish.',
    specialAbility: 'Dream Reality',
  },
]

// ═══════════════════════════════════════════════════════
// SECTION 10: CD_OASIS — 8 Sacred Oasis Locations
// ═══════════════════════════════════════════════════════

export const CD_OASIS: readonly CDOasisDef[] = [
  {
    id: 'oasis_mirage_spring',
    name: 'Mirage Spring',
    level: 1,
    resources: ['fresh_water', 'healing_herbs', 'sand_pearl'],
    capacity: 50,
    description:
      'A small spring that flickers in and out of existence like a candle flame. Its waters are crystal clear and taste of starlight. Nomads say it appears only for those pure of heart and vanishes for the greedy.',
  },
  {
    id: 'oasis_emerald_pool',
    name: 'Emerald Pool',
    level: 3,
    resources: ['emerald_water', 'rare_minerals', 'oasis_fruit'],
    capacity: 80,
    description:
      'A deep pool of emerald-green water surrounded by towering date palms. Minerals in the water give it healing properties, and rare gems can be found along its sandy bottom on moonlit nights.',
  },
  {
    id: 'oasis_crimson_veil',
    name: 'Crimson Veil',
    level: 6,
    resources: ['crimson_ore', 'fire_crystals', 'molten_glass'],
    capacity: 120,
    description:
      'An oasis shrouded in a permanent red mist. The water here is warm to the touch and tastes faintly metallic. Crimson ore deposits line the surrounding cliffs, and fire crystals grow naturally in the volcanic sand.',
  },
  {
    id: 'oasis_whispering_palms',
    name: 'Whispering Palms',
    level: 10,
    resources: ['palm_essence', 'shade_spice', 'wind_resin'],
    capacity: 160,
    description:
      'A grove of ancient palm trees whose fronds rustle with voices from the past. Drinking the palm essence grants visions of the desert\'s history. The shade spice grown here is valued across the known world for its medicinal properties.',
  },
  {
    id: 'oasis_golden_basin',
    name: 'Golden Basin',
    level: 15,
    resources: ['gold_dust', 'sun_stone', 'amber_resin'],
    capacity: 200,
    description:
      'A vast natural basin filled with shallow golden water. Flecks of real gold float on the surface, and sun stones line the bottom like fallen stars. Amber resin oozes from the surrounding cliffs, prized by alchemists and artisans alike.',
  },
  {
    id: 'oasis_serpent_depths',
    name: 'Serpent Depths',
    level: 22,
    resources: ['wyrm_scale', 'abyssal_pearl', 'deep_crystal'],
    capacity: 250,
    description:
      'An oasis with water so deep its bottom has never been reached. Ancient sand wyrms nest in its depths, and their shed scales wash ashore. Divers who venture too deep never return — but sometimes their equipment does, encrusted with abyssal pearls.',
  },
  {
    id: 'oasis_eternal_garden',
    name: 'Eternal Garden',
    level: 30,
    resources: ['eternal_bloom', 'life_water', 'ancient_pollen'],
    capacity: 320,
    description:
      'A garden that never wilts, blooming with flowers from every era of the desert\'s history. The life water that feeds it grants temporary immortality. Ancient pollen collected here can resurrect dead plants and heal mortal wounds.',
  },
  {
    id: 'oasis_primal_well',
    name: 'Primal Well',
    level: 40,
    resources: ['primal_essence', 'creation_sand', 'time_crystal'],
    capacity: 500,
    description:
      'The original well from which all desert water flows. Its water predates the desert itself, from when this land was an ocean. Primal essence extracted from it can reshape reality at the fundamental level, bending the laws of nature.',
  },
]

// ═══════════════════════════════════════════════════════
// SECTION 11: CD_MATERIALS — 30 Sand/Gem Materials
// ═══════════════════════════════════════════════════════

export const CD_MATERIALS: readonly CDMaterialDef[] = [
  // Common (6)
  { id: 'rough_sand', name: 'Rough Sand', rarity: 'common', description: 'Coarse grains of desert sand, found everywhere. The most basic building material of the Crimson Dunes, used in everything from construction to simple rituals.', value: 3, type: 'sand' },
  { id: 'red_clay', name: 'Red Clay', rarity: 'common', description: 'Iron-rich clay dug from desert canyons. Used in pottery, construction, and basic scarab golem repair. Its reddish hue deepens when fired in a kiln.', value: 4, type: 'mineral' },
  { id: 'salt_crystal', name: 'Salt Crystal', rarity: 'common', description: 'Crystallized salt from dried-up desert lakes. Essential for food preservation and basic alchemy. Desert merchants trade it by the cartload.', value: 5, type: 'crystal' },
  { id: 'dry_wood', name: 'Driftwood Shard', rarity: 'common', description: 'Petrified wood fragments carried by ancient rivers that no longer exist. Light and durable, used in tool crafting and as fuel for sacred fires.', value: 3, type: 'mineral' },
  { id: 'pebble_stone', name: 'Desert Pebble', rarity: 'common', description: 'Smooth stones polished by millennia of sand erosion. Used as sling ammunition and basic construction filler. Children collect them for their varied colors.', value: 2, type: 'mineral' },
  { id: 'copper_nugget', name: 'Copper Nugget', rarity: 'common', description: 'Raw copper extracted from surface deposits. The first metal worked by desert civilizations, still used in basic tools and low-level enchantments.', value: 8, type: 'mineral' },

  // Uncommon (6)
  { id: 'fine_quartz', name: 'Fine Quartz', rarity: 'uncommon', description: 'Translucent quartz crystals found in desert rock formations. Used in basic enchantments and lens crafting. Desert astronomers prize clear specimens for their telescopes.', value: 25, type: 'crystal' },
  { id: 'iron_sand', name: 'Iron Sand', rarity: 'uncommon', description: 'Magnetic black sand rich in iron ore. Scarab golems incorporate it into their frames for added strength and resilience against attacks.', value: 30, type: 'sand' },
  { id: 'amber_chunk', name: 'Amber Chunk', rarity: 'uncommon', description: 'Fossilized tree resin containing traces of ancient desert life — insects, leaves, and occasionally tiny creatures frozen in time. Used in jewelry and as a magical catalyst.', value: 35, type: 'gem' },
  { id: 'limestone_brick', name: 'Limestone Brick', rarity: 'uncommon', description: 'Cut limestone from desert quarries. The primary building material for permanent desert structures, from simple walls to grand temples and palaces.', value: 28, type: 'mineral' },
  { id: 'turquoise_shard', name: 'Turquoise Shard', rarity: 'uncommon', description: 'Blue-green gemstone mined from copper-rich desert deposits. Sacred to desert shamans and healers, it is said to protect the wearer from evil spirits.', value: 40, type: 'gem' },
  { id: 'silk_thread', name: 'Sand Spider Silk', rarity: 'uncommon', description: 'Incredibly strong silk harvested from desert spiders. Lighter than cotton and stronger than steel wire, it is woven into armor and used in construction.', value: 32, type: 'mineral' },

  // Rare (6)
  { id: 'ruby_fleck', name: 'Ruby Fleck', rarity: 'rare', description: 'Raw rubies found in volcanic desert deposits. Their deep crimson color matches the heart of the Crimson Dunes itself. The finest specimens glow with inner fire.', value: 120, type: 'gem' },
  { id: 'star_sand', name: 'Star Sand', rarity: 'rare', description: 'Bioluminescent sand grains that glow faintly at night. Each grain contains a trapped fragment of ancient starlight that fell to earth during meteor showers.', value: 150, type: 'sand' },
  { id: 'scarab_gem', name: 'Scarab Gem', rarity: 'rare', description: 'A gemstone naturally formed in the shape of a scarab beetle. Scarab golems are drawn to them instinctively, and they amplify golem power when embedded in their frames.', value: 140, type: 'gem' },
  { id: 'obsidian_shard', name: 'Obsidian Shard', rarity: 'rare', description: 'Volcanic glass sharper than any steel blade. Used in ritual daggers and the finest weapons of the desert. It holds an edge that never dulls and can cut through almost anything.', value: 130, type: 'crystal' },
  { id: 'desert_pearl', name: 'Desert Pearl', rarity: 'rare', description: 'Pearls formed in the underground aquifers beneath the desert. They shimmer with a warm, golden iridescence unique to the Crimson Dunes and are among the most valuable treasures.', value: 160, type: 'gem' },
  { id: 'storm_crystal', name: 'Storm Crystal', rarity: 'rare', description: 'Crystals that form during desert electrical storms, charged with raw lightning energy. They crackle when touched and can power devices for months.', value: 145, type: 'crystal' },

  // Epic (6)
  { id: 'crimson_diamond', name: 'Crimson Diamond', rarity: 'epic', description: 'A diamond with a natural red tint, formed under extreme pressure in the desert\'s deepest geological faults. Its value is incalculable, and it radiates an aura of raw power.', value: 500, type: 'gem' },
  { id: 'phoenix_ash', name: 'Phoenix Ash', rarity: 'epic', description: 'Ash from the burning of a crimson hawk that has undergone the phoenix ritual. It glows with residual life energy and can heal any wound or resurrect the recently dead.', value: 550, type: 'relic' },
  { id: 'wyrm_bone', name: 'Wyrm Bone', rarity: 'epic', description: 'A bone fragment from an ancient sand wyrm. It hums with seismic energy and can cause minor earthquakes when struck. Scarab golems revere these bones as sacred relics.', value: 480, type: 'relic' },
  { id: 'oasis_heart', name: 'Oasis Heart Stone', rarity: 'epic', description: 'A crystallized drop of water from the heart of an eternal oasis. It pulses with life energy and never dries out, no matter how extreme the desert heat.', value: 520, type: 'relic' },
  { id: 'dune_glass', name: 'Dune Glass', rarity: 'epic', description: 'Glass formed by a lightning strike on sand, perfect and clear as diamond. It can store and release magical energy, making it the foundation of desert enchantment.', value: 490, type: 'crystal' },
  { id: 'ancient_tablet', name: 'Ancient Clay Tablet', rarity: 'epic', description: 'A clay tablet inscribed with the lost language of the first desert civilization. Deciphering it grants ancient knowledge of construction, alchemy, and the nature of mirages.', value: 580, type: 'relic' },

  // Legendary (6)
  { id: 'primordial_sand', name: 'Primordial Sand', rarity: 'legendary', description: 'Sand that has existed since before the desert was formed, when this land was an ocean floor. It can remember and replay the past, revealing events that no living being witnessed.', value: 2500, type: 'sand' },
  { id: 'dragon_eye_gem', name: 'Dragon Eye Gem', rarity: 'legendary', description: 'A gemstone that perfectly resembles the eye of the Elder Sand Dragon. It grants the ability to see through solid rock and sand, revealing every hidden treasure and secret tunnel.', value: 3000, type: 'gem' },
  { id: 'creation_core', name: 'Creation Core', rarity: 'legendary', description: 'A sphere of compressed creation energy from the Primal Well. It can bring inanimate objects to life with a touch, transforming stone into flesh and sand into water.', value: 3500, type: 'relic' },
  { id: 'eternal_flame_crystal', name: 'Eternal Flame Crystal', rarity: 'legendary', description: 'A crystal containing a flame that has burned since the first sunrise. It never dims, never dies, and never needs fuel. Legends say it was lit by the first desert god.', value: 2800, type: 'crystal' },
  { id: 'mirage_seed', name: 'Mirage Seed', rarity: 'legendary', description: 'A seed that, when planted, grows an oasis overnight. It was created by the Oasis Dreamweaver as a gift to the desert — proof that even illusions can become real.', value: 3200, type: 'relic' },
  { id: 'time_sand_vial', name: 'Time Sand Vial', rarity: 'legendary', description: 'A vial of sand from the Hourglass of Eternity. Each grain represents one second of time. When spilled, time flows differently in the affected area.', value: 4000, type: 'sand' },
]

// ═══════════════════════════════════════════════════════
// SECTION 12: CD_STRUCTURES — 25 Dune Structures (upgradeable to level 10)
// ═══════════════════════════════════════════════════════

export const CD_STRUCTURES: readonly CDStructureDef[] = [
  // Shelter (5)
  { id: 'sand_tent', name: 'Sand Tent', maxLevel: 10, description: 'A basic shelter woven from desert grass and animal hides. Provides protection from sandstorms and the blazing sun. The first home of every desert pioneer.', effectPerLevel: '+5% sandstorm resistance per level', baseCost: 50 },
  { id: 'adobe_hut', name: 'Adobe Hut', maxLevel: 10, description: 'A sturdy mud-brick dwelling that keeps interiors cool during the day and warm at night. The traditional home of desert nomads, built from the land itself.', effectPerLevel: '+10% comfort bonus per level', baseCost: 200 },
  { id: 'stone_watchtower', name: 'Stone Watchtower', maxLevel: 10, description: 'A tall tower built from desert stone blocks, used for spotting approaching creatures and sandstorms from afar. A beacon of safety in the endless dunes.', effectPerLevel: '+8% detection range per level', baseCost: 500 },
  { id: 'fortress_dunes', name: 'Fortress of Dunes', maxLevel: 10, description: 'A massive fortification built into the side of a canyon wall. Its walls are thick enough to withstand any sandstorm or creature attack known to the desert.', effectPerLevel: '+12% defense per level', baseCost: 1500 },
  { id: 'obsidian_palace', name: 'Obsidian Palace', maxLevel: 10, description: 'A palace carved from volcanic obsidian, reflecting the crimson sky in its dark surfaces. The ultimate desert stronghold, impervious to all but the most powerful forces.', effectPerLevel: '+15% all stats per level', baseCost: 5000 },

  // Resource (5)
  { id: 'sand_quarry', name: 'Sand Quarry', maxLevel: 10, description: 'An open-pit mine for extracting basic sand and clay materials. The foundation of all desert construction and the simplest resource gathering structure.', effectPerLevel: '+5 sand materials per day per level', baseCost: 80 },
  { id: 'crystal_mine', name: 'Crystal Mine', maxLevel: 10, description: 'A network of tunnels leading to underground crystal deposits. Miners work by the light of bioluminescent fungi, extracting crystals of various magical properties.', effectPerLevel: '+3 crystal materials per day per level', baseCost: 400 },
  { id: 'gem_workshop', name: 'Gem Workshop', maxLevel: 10, description: 'A workshop where raw gemstones are cut, polished, and enchanted. Master gemcutters produce works of stunning beauty and considerable magical power.', effectPerLevel: '+2 gem quality bonus per level', baseCost: 1000 },
  { id: 'relic_forge', name: 'Relic Forge', maxLevel: 10, description: 'A forge that can work with the rarest desert materials. Powered by underground geothermal vents and ancient scarab magic, it produces artifacts of legendary quality.', effectPerLevel: '+5% relic craft chance per level', baseCost: 3000 },
  { id: 'creation_anvil', name: 'Creation Anvil', maxLevel: 10, description: 'An anvil of primordial origin where new materials can be synthesized from raw creation energy. The pinnacle of desert craftsmanship and the most advanced structure.', effectPerLevel: '+10% synthesis success per level', baseCost: 8000 },

  // Water (5)
  { id: 'clay_well', name: 'Clay Well', maxLevel: 10, description: 'A simple well lined with baked clay, reaching the shallow aquifer beneath the sand. Essential for desert survival and the first water structure every settler builds.', effectPerLevel: '+10 water per day per level', baseCost: 60 },
  { id: 'deep_bore', name: 'Deep Borehole', maxLevel: 10, description: 'A mechanically drilled well that reaches the deep aquifer. Produces cleaner, more abundant water than surface wells, and is less affected by sandstorms.', effectPerLevel: '+25 water per day per level', baseCost: 350 },
  { id: 'oasis_pump', name: 'Oasis Pump Station', maxLevel: 10, description: 'An advanced pumping system that draws water from an oasis spring and distributes it through clay pipes across the settlement. A marvel of desert engineering.', effectPerLevel: '+50 water per day per level', baseCost: 900 },
  { id: 'aqueduct_network', name: 'Aqueduct Network', maxLevel: 10, description: 'An extensive system of raised channels that carries water from distant oases. An engineering marvel of the ancient desert world that still functions perfectly.', effectPerLevel: '+100 water per day per level', baseCost: 2500 },
  { id: 'water_temple', name: 'Temple of Living Water', maxLevel: 10, description: 'A temple built around a sacred spring that produces unlimited pure water. Water from the temple can heal any wound and cleanse any curse, making it priceless.', effectPerLevel: '+200 water + healing per day per level', baseCost: 7000 },

  // Combat (5)
  { id: 'sand_barrier', name: 'Sand Barrier', maxLevel: 10, description: 'A simple wall of compacted sand reinforced with clay. Stops common desert creatures and deflects minor sandstorms. The most basic defensive structure.', effectPerLevel: '+50 HP barrier per level', baseCost: 100 },
  { id: 'spike_trench', name: 'Spike Trench', maxLevel: 10, description: 'A deep trench lined with sharpened obsidian stakes. Effective against charging creatures and unwary intruders who fail to spot it in the shifting sand.', effectPerLevel: '+30 damage per level to charging enemies', baseCost: 300 },
  { id: 'crystal_turret', name: 'Crystal Turret', maxLevel: 10, description: 'A defensive tower armed with crystal-focusing lenses that channel sunlight into concentrated beams of heat. Devastating against airborne creatures.', effectPerLevel: '+15 ranged damage per level', baseCost: 800 },
  { id: 'scarab_bastion', name: 'Scarab Bastion', maxLevel: 10, description: 'A fortress manned by loyal scarab golems. They patrol the walls day and night, attacking any creature that approaches with unwavering mechanical precision.', effectPerLevel: '+3 scarab golem defenders per level', baseCost: 2000 },
  { id: 'wyrm_gate', name: 'Wyrm Gate', maxLevel: 10, description: 'A massive gate enchanted to repel sand wyrms. Ancient scarab magic creates a barrier that burrowing creatures cannot pass, protecting everything within.', effectPerLevel: '+20% creature repulsion per level', baseCost: 6000 },

  // Mystical (5)
  { id: 'shrine_dunes', name: 'Shrine of the Dunes', maxLevel: 10, description: 'A small stone shrine where desert travelers leave offerings. The spirits of the desert occasionally grant blessings to those who pray here with sincere hearts.', effectPerLevel: '+5% event quality per level', baseCost: 150 },
  { id: 'star_observatory', name: 'Star Observatory', maxLevel: 10, description: 'An astronomical platform where the desert stars are studied. Knowledge of celestial patterns aids in navigation, prophecy, and understanding the desert\'s magical cycles.', effectPerLevel: '+3% exploration bonus per level', baseCost: 600 },
  { id: 'dream_chamber', name: 'Dream Chamber', maxLevel: 10, description: 'A sealed chamber where the boundaries between waking and dreaming are thin. Visions of past and future appear to those who meditate here, granting foresight.', effectPerLevel: '+8% achievement chance per level', baseCost: 1800 },
  { id: 'blood_altar_desert', name: 'Altar of Desert Blood', maxLevel: 10, description: 'An ancient altar where blood sacrifices are offered to the desert spirits. The crimson energy fuels powerful enchantments and strengthens all abilities.', effectPerLevel: '+10% ability power per level', baseCost: 4000 },
  { id: 'primal_shrine', name: 'Primal Shrine', maxLevel: 10, description: 'A shrine built from primordial materials at the exact center of the Crimson Dunes. It resonates with the fundamental forces of creation and amplifies all magic.', effectPerLevel: '+15% all bonuses per level', baseCost: 10000 },
]

// ═══════════════════════════════════════════════════════
// SECTION 13: CD_ABILITIES — 22 Desert Abilities
// ═══════════════════════════════════════════════════════

export const CD_ABILITIES: readonly CDAbilityDef[] = [
  // Combat (6)
  { id: 'sand_lance', name: 'Sand Lance', type: 'combat', power: 30, cooldown: 3, description: 'Launches a hardened spear of compressed sand that pierces through enemy armor with devastating force and leaves granular wounds.' },
  { id: 'crimson_strike', name: 'Crimson Strike', type: 'combat', power: 45, cooldown: 5, description: 'A sweeping blade attack imbued with crimson energy that leaves burning wounds that refuse to close and weaken the target over time.' },
  { id: 'wyrm_call', name: 'Wyrm Call', type: 'combat', power: 60, cooldown: 8, description: 'Summons a lesser sand wyrm to burst from beneath the ground and devour a targeted enemy in a single gulp, destroying all but the most powerful foes.' },
  { id: 'scarab_bombardment', name: 'Scarab Bombardment', type: 'combat', power: 55, cooldown: 7, description: 'Commands a swarm of scarab golems to launch themselves at enemies like living projectiles, each one detonating on impact with explosive force.' },
  { id: 'dust_storm_slash', name: 'Dust Storm Slash', type: 'combat', power: 70, cooldown: 10, description: 'Creates a localized dust devil around the wielder\'s weapon, extending its reach enormously and inflicting bleeding wounds coated with abrasive sand.' },
  { id: 'inferno_swarm_bite', name: 'Inferno Swarm Bite', type: 'combat', power: 85, cooldown: 12, description: 'Commands a massive fire ant swarm to engulf the target, delivering thousands of burning bites simultaneously that consume flesh and armor alike.' },

  // Exploration (6)
  { id: 'dune_sight', name: 'Dune Sight', type: 'exploration', power: 20, cooldown: 2, description: 'Enhances vision to see through sand and detect hidden creatures, resources, and structures beneath the surface of the desert.' },
  { id: 'oasis_compass', name: 'Oasis Compass', type: 'exploration', power: 15, cooldown: 5, description: 'Creates a mental map showing the direction and distance to the nearest oasis, even if it is hidden by mirages or sandstorms.' },
  { id: 'sand_stride', name: 'Sand Stride', type: 'exploration', power: 35, cooldown: 4, description: 'Allows the user to walk on top of sand as if it were solid ground, moving at triple normal speed across dunes and quicksand alike.' },
  { id: 'wind_whisper', name: 'Wind Whisper', type: 'exploration', power: 25, cooldown: 3, description: 'Interprets the desert winds to learn about approaching weather, creatures, and events within a wide radius of the user.' },
  { id: 'phase_sand', name: 'Phase Sand', type: 'exploration', power: 50, cooldown: 8, description: 'Temporarily merges the user\'s body with sand, allowing passage through solid walls and completely invisible movement through any terrain.' },
  { id: 'mirage_step', name: 'Mirage Step', type: 'exploration', power: 40, cooldown: 6, description: 'Creates a mirage duplicate at a target location and instantly teleports the user there when the duplicate is touched or triggered.' },

  // Survival (5)
  { id: 'sun_shield', name: 'Sun Shield', type: 'survival', power: 20, cooldown: 4, description: 'Generates a dome of compressed air that blocks the sun\'s rays, providing cool shade and protection from heat exhaustion.' },
  { id: 'water_find', name: 'Water Find', type: 'survival', power: 15, cooldown: 6, description: 'Senses the presence and depth of underground water sources, allowing the user to dig wells in optimal locations for maximum yield.' },
  { id: 'sand_cocoon', name: 'Sand Cocoon', type: 'survival', power: 40, cooldown: 8, description: 'Encases the user in a protective shell of hardened sand that absorbs damage and filters breathable air from the desert atmosphere.' },
  { id: 'heat_absorb', name: 'Heat Absorb', type: 'survival', power: 30, cooldown: 5, description: 'Absorbs ambient heat energy from the environment, converting it into a burst of physical strength and extended endurance.' },
  { id: 'desert_camouflage', name: 'Desert Camouflage', type: 'survival', power: 35, cooldown: 7, description: 'Renders the user completely invisible in desert environments by perfectly matching the color and texture of surrounding terrain.' },

  // Mystic (5)
  { id: 'crimson_heal', name: 'Crimson Heal', type: 'mystic', power: 25, cooldown: 5, description: 'Channels crimson desert energy to rapidly heal wounds. The healed area temporarily glows with a warm red light and feels warm to the touch.' },
  { id: 'oasis_blessing', name: 'Oasis Blessing', type: 'mystic', power: 45, cooldown: 8, description: 'Draws life energy from a nearby oasis to restore health, remove curses, and grant temporary invulnerability to all forms of damage.' },
  { id: 'scarab_resurrection', name: 'Scarab Resurrection', type: 'mystic', power: 80, cooldown: 15, description: 'Channels the Eternal Scarab God\'s power to resurrect a fallen companion. The resurrected being returns stronger than before with enhanced abilities.' },
  { id: 'dune_prophecy', name: 'Dune Prophecy', type: 'mystic', power: 55, cooldown: 10, description: 'Reads the patterns in the sand to predict future events with uncanny accuracy. Reveals hidden dangers, treasure locations, and coming storms.' },
  { id: 'time_sand_bend', name: 'Time Sand Bend', type: 'mystic', power: 100, cooldown: 20, description: 'Manipulates the flow of time in a small area, rewinding recent events or accelerating the aging of objects and creatures within range.' },
]

// ═══════════════════════════════════════════════════════
// SECTION 14: CD_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════

export const CD_ACHIEVEMENTS: readonly CDAchievementDef[] = [
  { id: 'ach_first_footprints', name: 'First Footprints', description: 'Take your first steps into the Crimson Dunes and begin your desert journey among the red sands.', condition: 'totalCollected >= 1', reward: 'Sand Stride ability unlocked' },
  { id: 'ach_sand_collector', name: 'Sand Collector', description: 'Collect 10 different desert creatures and add them to your bestiary of Crimson Dunes wildlife.', condition: 'creatures >= 10', reward: '+10% creature encounter rate' },
  { id: 'ach_oasis_discoverer', name: 'Oasis Discoverer', description: 'Find and tend to your first sacred oasis, unlocking its healing waters and resources.', condition: 'oasisVisited >= 1', reward: 'Oasis Compass ability unlocked' },
  { id: 'ach_material_hoarder', name: 'Material Hoarder', description: 'Accumulate 100 total material units across all types in your desert inventory.', condition: 'totalMaterials >= 100', reward: 'Relic Forge structure unlocked' },
  { id: 'ach_structure_builder', name: 'Structure Builder', description: 'Build or upgrade 5 different dune structures, establishing a permanent presence in the desert.', condition: 'structures >= 5', reward: '+20% build speed' },
  { id: 'ach_ability_master', name: 'Ability Master', description: 'Use desert abilities 50 times in total, mastering the ancient arts of the Crimson Dunes.', condition: 'abilitiesUsed >= 50', reward: '-1 cooldown on all abilities' },
  { id: 'ach_creature_whisperer', name: 'Creature Whisperer', description: 'Collect 20 different desert creatures, earning the trust of the desert\'s wildest inhabitants.', condition: 'creatures >= 20', reward: '+15% creature capture rate' },
  { id: 'ach_oasis_tender', name: 'Oasis Tender', description: 'Tend to 5 different oases, becoming known as a guardian of the desert\'s sacred waters.', condition: 'oasisVisited >= 5', reward: '+25% oasis resource yield' },
  { id: 'ach_gem_cutter', name: 'Master Gem Cutter', description: 'Collect 15 different gem and crystal materials, becoming one of the desert\'s finest artisans.', condition: 'gemsCollected >= 15', reward: 'Gem Workshop upgraded' },
  { id: 'ach_dune_architect', name: 'Dune Architect', description: 'Build or upgrade 15 different dune structures, reshaping the desert to serve your vision.', condition: 'structures >= 15', reward: '-15% build cost' },
  { id: 'ach_event_survivor', name: 'Event Survivor', description: 'Survive 10 random dune events, proving your resilience against the desert\'s unpredictable nature.', condition: 'totalEvents >= 10', reward: '+10% event reward bonus' },
  { id: 'ach_legendary_hunter', name: 'Legendary Hunter', description: 'Collect a legendary-tier desert creature, one of the most powerful beings in the Crimson Dunes.', condition: 'hasLegendaryCreature', reward: 'Wyrm Call ability unlocked' },
  { id: 'ach_full_bestiary', name: 'Complete Bestiary', description: 'Collect all 35 desert creatures, completing the definitive catalog of Crimson Dunes wildlife.', condition: 'creatures >= 35', reward: 'Desert God title unlocked' },
  { id: 'ach_all_oasis', name: 'Oasis Master', description: 'Discover and tend to all 8 sacred oases, connecting them into a network of life across the desert.', condition: 'oasisVisited >= 8', reward: 'Primal Shrine structure unlocked' },
  { id: 'ach_artifact_seeker', name: 'Artifact Seeker', description: 'Activate 5 legendary desert artifacts, each one a relic of immense power and ancient origin.', condition: 'artifacts >= 5', reward: '+20% artifact discovery rate' },
  { id: 'ach_dune_sovereign', name: 'Dune Sovereign', description: 'Build all 25 dune structures to maximum level, creating an empire that dominates the Crimson Dunes.', condition: 'allStructuresMax', reward: 'Obsidian Palace unlocked' },
  { id: 'ach_century_walker', name: 'Century Walker', description: 'Spend 100 in-game days in the Crimson Dunes, becoming one with the rhythm of the desert.', condition: 'daysInDesert >= 100', reward: 'Eternal Desert title unlocked' },
  { id: 'ach_crimson_legend', name: 'Crimson Legend', description: 'Unlock all other achievements and become a true legend of the Crimson Dunes, remembered for all time.', condition: 'allOtherAchievements', reward: 'Crimson Crown artifact unlocked' },
]

// ═══════════════════════════════════════════════════════
// SECTION 15: CD_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════

export const CD_TITLES: readonly CDTitleDef[] = [
  { id: 'title_sand_strider', name: 'Sand Strider', requirement: 'Begin your journey in the Crimson Dunes', bonus: '+5% movement speed' },
  { id: 'title_dune_scout', name: 'Dune Scout', requirement: 'Collect 5 desert creatures', bonus: '+5% creature encounter rate' },
  { id: 'title_oasis_keeper', name: 'Oasis Keeper', requirement: 'Tend to 3 sacred oases', bonus: '+10% oasis resource yield' },
  { id: 'title_crimson_hunter', name: 'Crimson Hunter', requirement: 'Collect 15 desert creatures', bonus: '+10% creature capture rate' },
  { id: 'title_desert_scholar', name: 'Desert Scholar', requirement: 'Collect 10 different materials', bonus: '+5% material discovery rate' },
  { id: 'title_dune_warlord', name: 'Dune Warlord', requirement: 'Build 10 dune structures', bonus: '+15% structure effectiveness' },
  { id: 'title_scarab_champion', name: 'Scarab Champion', requirement: 'Collect 25 desert creatures', bonus: '+20% all stats' },
  { id: 'title_desert_god', name: 'Desert God', requirement: 'Complete all achievements', bonus: '+50% all bonuses' },
]

// ═══════════════════════════════════════════════════════
// SECTION 16: CD_ARTIFACTS — 15 Legendary Desert Artifacts
// ═══════════════════════════════════════════════════════

export const CD_ARTIFACTS: readonly CDArtifactDef[] = [
  {
    id: 'artifact_scarab_amulet',
    name: 'Scarab Amulet of Khepri',
    description: 'A golden amulet shaped like a scarab beetle, radiating warm solar energy. It grants the wearer limited control over sand and stone, and protects against sand wyrm attacks.',
    power: 30,
    lore: 'Forged by the sun god Khepri at the dawn of the first desert, this amulet has passed through the hands of a hundred pharaohs.',
  },
  {
    id: 'artifact_sandstorm_flask',
    name: 'Flask of Eternal Sandstorm',
    description: 'A sealed obsidian flask containing a perpetual miniature sandstorm. When opened, it releases a devastating wall of wind and grit that can level small buildings.',
    power: 45,
    lore: 'Captured by a mad djinn who attempted to bottle the entire desert. He succeeded only in capturing a single storm before going mad.',
  },
  {
    id: 'artifact_oasis_pearl',
    name: 'Pearl of the Eternal Oasis',
    description: 'A massive pearl from the bottom of the Primal Well. It glows with life energy and can create temporary springs of pure water wherever it is placed.',
    power: 35,
    lore: 'Dropped by the Oasis Dreamweaver as a gift to the first mortal who showed kindness to a mirage, proving compassion transcends reality.',
  },
  {
    id: 'artifact_wyrm_fang',
    name: 'Fang of the Elder Wyrm',
    description: 'A fang the size of a sword, shed by the Elder Sand Dragon during its last molting. It vibrates with seismic energy and can cause earthquakes when struck.',
    power: 55,
    lore: 'The Elder Wyrm sheds one fang every thousand years. This one was found embedded in the heart of a mountain by an intrepid explorer.',
  },
  {
    id: 'artifact_crimson_crown',
    name: 'Crimson Crown of the Dunes',
    description: 'A crown of hardened crimson sand that grants absolute authority over all desert creatures. The sand flows like liquid metal, reshaping itself to fit any wearer.',
    power: 70,
    lore: 'Worn by the legendary Desert God who united all the Crimson Dunes under one rule. It was buried with him in an unmarked grave.',
  },
  {
    id: 'artifact_dreamweavers_staff',
    name: 'Staff of the Dreamweaver',
    description: 'A staff of twisted driftwood topped with a sphere of frozen mirage-light. It can reshape reality within a limited radius, turning dreams into the tangible world.',
    power: 50,
    lore: 'Carved from a tree that grew only in the Oasis Dreamweaver\'s first dream. The tree has never existed in reality.',
  },
  {
    id: 'artifact_fire_ant_queens_gem',
    name: 'Gem of the Fire Ant Queen',
    description: 'A gemstone that serves as the heart of a fire ant colony. It grants the ability to command fire ant swarms and creates a protective aura of heat.',
    power: 40,
    lore: 'The Solar Fire Legion\'s previous queen gem, discarded during their ascension to godhood. Still retains tremendous power and instinctive authority.',
  },
  {
    id: 'artifact_dust_devils_heart',
    name: 'Heart of the Dust Devil',
    description: 'A crystallized core of pure wind energy, humming with the power of a thousand dust devils. Wielders can summon storms and control air currents at will.',
    power: 42,
    lore: 'The Primordial Dust Titan\'s heart was removed by an ancient hero who wanted to control the desert winds for the good of all people.',
  },
  {
    id: 'artifact_scarab_gods_shell',
    name: 'Shell of the Scarab God',
    description: 'An impenetrable shell fragment from the Eternal Scarab God. It provides absolute defense against physical attacks and radiates an aura of invulnerability.',
    power: 60,
    lore: 'When the Scarab God molted at the beginning of time, it left behind seven shell fragments. This is the largest and most powerful.',
  },
  {
    id: 'artifact_crimson_hawks_feather',
    name: 'Feather of the Crimson Phoenix',
    description: 'A feather from the Phoenix of Crimson Skies that burns with eternal flame but never consumes itself. It grants fire immunity and enhanced regeneration.',
    power: 48,
    lore: 'The Phoenix drops one perfect feather after each rebirth. This feather has been through seven cycles of death and resurrection.',
  },
  {
    id: 'artifact_time_hourglass',
    name: 'Hourglass of Shifting Sands',
    description: 'An hourglass whose sand flows upward. It can briefly reverse or accelerate time for the user, allowing them to undo mistakes or rush processes.',
    power: 65,
    lore: 'Created by the first desert clockmaker who discovered that time flows differently in the deep desert, faster or slower depending on the dunes.',
  },
  {
    id: 'artifact_dune_colossus_ring',
    name: 'Ring of the Dune Colossus',
    description: 'A ring that allows the wearer to grow to colossal size for a short duration, gaining immense strength and the ability to reshape the terrain.',
    power: 52,
    lore: 'The Ancient Dune Titan\'s smallest finger bone was carved into this ring by a devoted follower who wished to carry a piece of their god.',
  },
  {
    id: 'artifact_mirage_cloak',
    name: 'Cloak of Infinite Mirages',
    description: 'A cloak woven from actual mirages. The wearer becomes completely invisible and can create convincing illusions that fool even the sharpest senses.',
    power: 38,
    lore: 'The Mirage Sovereign created this cloak from its own essence, giving up part of its reality-bending power to forge a tool of perfect deception.',
  },
  {
    id: 'artifact_primal_well_bucket',
    name: 'Bucket of the Primal Well',
    description: 'A bucket that, when lowered into any water source, draws water with healing and empowering properties far beyond the original source.',
    power: 33,
    lore: 'The bucket was originally a normal bucket. After a thousand years of drawing from the Primal Well, it absorbed the well\'s essence completely.',
  },
  {
    id: 'artifact_creation_sand',
    name: 'Handful of Creation Sand',
    description: 'A handful of sand from the moment of creation. It can bring any inanimate object to life for a short time, granting it consciousness and purpose.',
    power: 75,
    lore: 'The last handful of sand left when the Creator finished shaping the Crimson Dunes. It contains the memory of genesis itself.',
  },
]

// ═══════════════════════════════════════════════════════
// SECTION 17: CD_EVENTS — 12 Random Dune Events
// ═══════════════════════════════════════════════════════

export const CD_EVENTS: readonly CDEventDef[] = [
  {
    id: 'event_great_sandstorm',
    name: 'Great Sandstorm',
    description: 'A massive sandstorm engulfs the surrounding area, reducing visibility to zero and threatening to bury unprotected structures beneath tons of shifting red sand.',
    effect: 'All creature encounters doubled for 1 hour; structure damage risk increased.',
    rarity: 'common',
  },
  {
    id: 'event_oasis_bloom',
    name: 'Oasis Bloom',
    description: 'A rare alignment of stars causes nearby oases to overflow with life energy, producing bonus resources and attracting rare creatures to their waters.',
    effect: 'Oasis resource yield tripled for 2 hours; rare materials appear.',
    rarity: 'common',
  },
  {
    id: 'event_scarab_migration',
    name: 'Scarab Migration',
    description: 'Millions of scarabs swarm across the desert in their annual migration, carrying buried materials to the surface and revealing hidden deposits.',
    effect: 'Material discovery rate doubled for 3 hours; common and uncommon materials abundant.',
    rarity: 'uncommon',
  },
  {
    id: 'event_wyrm_surfacing',
    name: 'Wyrm Surfacing',
    description: 'A sand wyrm erupts from beneath the dunes nearby, shaking the ground violently and exposing underground deposits of valuable materials.',
    effect: 'Rare creatures appear for 1 hour; underground resources revealed in a wide area.',
    rarity: 'uncommon',
  },
  {
    id: 'event_mirage_festival',
    name: 'Mirage Festival',
    description: 'The Mirage Stalkers converge for their rare festival, creating spectacular illusions that reveal hidden paths and secret locations.',
    effect: 'Exploration range doubled for 2 hours; hidden oases and structures revealed.',
    rarity: 'rare',
  },
  {
    id: 'event_fire_ant_rage',
    name: 'Fire Ant Rage',
    description: 'A fire ant colony enters a berserk state, spreading across the desert in a burning wave that threatens settlements and wildlife alike.',
    effect: 'Combat encounters tripled for 1 hour; fire ant materials abundant; danger level high.',
    rarity: 'common',
  },
  {
    id: 'event_crimson_eclipse',
    name: 'Crimson Eclipse',
    description: 'A rare eclipse turns the sky blood red, amplifying mystic abilities across the desert and causing bizarre phenomena at every oasis.',
    effect: 'Mystic ability power doubled for 3 hours; legendary creature chance increased.',
    rarity: 'rare',
  },
  {
    id: 'event_dust_devil_convergence',
    name: 'Dust Devil Convergence',
    description: 'Hundreds of dust devils converge into a single massive vortex, creating a permanent new landmark that reshapes the desert topology.',
    effect: 'New exploration area unlocked; wind-based materials abundant for 2 hours.',
    rarity: 'epic',
  },
  {
    id: 'event_ancient_tomb_unveiled',
    name: 'Ancient Tomb Unveiled',
    description: 'Shifting sands reveal the entrance to a previously unknown ancient tomb, filled with untold treasures and deadly traps from a lost civilization.',
    effect: 'Exclusive dungeon unlocked for 4 hours; epic and legendary materials available.',
    rarity: 'rare',
  },
  {
    id: 'event_phoenix_rebirth',
    name: 'Phoenix Rebirth',
    description: 'The Phoenix of Crimson Skies performs its legendary rebirth nearby, showering the area with phoenix ash and crimson feathers of immense power.',
    effect: 'All stats boosted by 25% for 3 hours; phoenix materials abundant; healing doubled.',
    rarity: 'epic',
  },
  {
    id: 'event_desert_god_walks',
    name: 'The Desert God Walks',
    description: 'A Dune Colossus passes through the area, reshaping the landscape with each titanic step and leaving behind trails of creation energy.',
    effect: 'All structures gain 1 free level; all abilities cooldowns reset; rare events triggered.',
    rarity: 'legendary',
  },
  {
    id: 'event_primal_surge',
    name: 'Primal Surge',
    description: 'A surge of creation energy erupts from the Primal Well, temporarily breaking down the boundaries between reality and dream across the desert.',
    effect: 'Mirage Stalker and Dune Walker encounters guaranteed for 2 hours; all materials doubled.',
    rarity: 'epic',
  },
]

// ═══════════════════════════════════════════════════════
// SECTION 18: RESOURCE TYPE CONSTANTS
// ═══════════════════════════════════════════════════════

export const CD_RESOURCE_TYPES: readonly string[] = [
  'fresh_water',
  'healing_herbs',
  'sand_pearl',
  'emerald_water',
  'rare_minerals',
  'oasis_fruit',
  'crimson_ore',
  'fire_crystals',
  'molten_glass',
  'palm_essence',
  'shade_spice',
  'wind_resin',
  'gold_dust',
  'sun_stone',
  'amber_resin',
  'wyrm_scale',
  'abyssal_pearl',
  'deep_crystal',
  'eternal_bloom',
  'life_water',
  'ancient_pollen',
  'primal_essence',
  'creation_sand',
  'time_crystal',
]

export const CD_MAX_STRUCTURE_LEVEL: number = 10

// ═══════════════════════════════════════════════════════
// SECTION 19: INITIAL STATE & HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════

const CD_INITIAL_STATE: CrimsonDunesState = {
  cdCreatures: {},
  cdOasis: {},
  cdInventory: [],
  cdArtifacts: [],
  cdAchievements: [],
  cdTitle: 'title_sand_strider',
  cdEvents: [],
  cdStructures: {},
  cdStats: {
    totalCollected: 0,
    totalExplored: 0,
    totalCrafted: 0,
    totalBattles: 0,
    totalEvents: 0,
    totalOasisVisits: 0,
    highestCreaturePower: 0,
    daysInDesert: 0,
  },
}

function cdFindCreatureDef(id: string): CDCreatureDef | undefined {
  return CD_CREATURES.find((c) => c.id === id)
}

function cdFindOasisDef(id: string): CDOasisDef | undefined {
  return CD_OASIS.find((o) => o.id === id)
}

function cdFindStructureDef(id: string): CDStructureDef | undefined {
  return CD_STRUCTURES.find((s) => s.id === id)
}

function cdFindArtifactDef(id: string): CDArtifactDef | undefined {
  return CD_ARTIFACTS.find((a) => a.id === id)
}

function cdRandomEvent(): CDEventDef {
  const weights: Record<CDEventRarity, number> = {
    common: 40,
    uncommon: 30,
    rare: 18,
    epic: 9,
    legendary: 3,
  }
  const pool: CDEventDef[] = []
  for (const event of CD_EVENTS) {
    const w = weights[event.rarity] ?? 10
    for (let i = 0; i < w; i++) {
      pool.push(event)
    }
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

function cdCheckAchievements(
  stats: CrimsonDunesState['cdStats'],
  creaturesCount: number,
  oasisCount: number,
  structureCount: number,
  artifactCount: number,
  existingAchievements: string[]
): string[] {
  const newAchievements: string[] = []

  const checks: Array<{ id: string; condition: boolean }> = [
    { id: 'ach_first_footprints', condition: stats.totalCollected >= 1 },
    { id: 'ach_sand_collector', condition: creaturesCount >= 10 },
    { id: 'ach_oasis_discoverer', condition: stats.totalOasisVisits >= 1 },
    { id: 'ach_material_hoarder', condition: stats.totalCollected >= 100 },
    { id: 'ach_structure_builder', condition: structureCount >= 5 },
    { id: 'ach_creature_whisperer', condition: creaturesCount >= 20 },
    { id: 'ach_oasis_tender', condition: stats.totalOasisVisits >= 5 },
    { id: 'ach_event_survivor', condition: stats.totalEvents >= 10 },
    { id: 'ach_all_oasis', condition: oasisCount >= 8 },
    { id: 'ach_artifact_seeker', condition: artifactCount >= 5 },
    { id: 'ach_century_walker', condition: stats.daysInDesert >= 100 },
  ]

  for (const check of checks) {
    if (!existingAchievements.includes(check.id) && check.condition) {
      newAchievements.push(check.id)
    }
  }

  return newAchievements
}

function cdUpdateTitle(
  creaturesCount: number,
  oasisCount: number,
  structureCount: number,
  materialsCount: number,
  currentTitle: string
): string {
  const titleMap: Array<{ id: string; condition: boolean }> = [
    { id: 'title_sand_strider', condition: true },
    { id: 'title_dune_scout', condition: creaturesCount >= 5 },
    { id: 'title_oasis_keeper', condition: oasisCount >= 3 },
    { id: 'title_crimson_hunter', condition: creaturesCount >= 15 },
    { id: 'title_desert_scholar', condition: materialsCount >= 10 },
    { id: 'title_dune_warlord', condition: structureCount >= 10 },
    { id: 'title_scarab_champion', condition: creaturesCount >= 25 },
    { id: 'title_desert_god', condition: creaturesCount >= 35 && structureCount >= 25 },
  ]

  let bestTitle = 'title_sand_strider'
  for (const t of titleMap) {
    if (t.condition) {
      bestTitle = t.id
    }
  }

  return bestTitle
}

// ═══════════════════════════════════════════════════════
// SECTION 20: ZUSTAND STORE WITH PERSIST
// ═══════════════════════════════════════════════════════

const useCDStore = create<CDStore>()(
  persist(
    (set, get) => ({
      ...CD_INITIAL_STATE,

      // ── collectCreature ────────────────────────────────────────
      collectCreature: (id: string): boolean => {
        const state = get()
        const creatureDef = cdFindCreatureDef(id)
        if (!creatureDef) return false
        if (state.cdCreatures[id]) return false

        const newCreatureState: CDCreatureState = {
          collected: true,
          collectedAt: Date.now(),
          level: 1,
        }

        const newStats = { ...state.cdStats }
        newStats.totalCollected += 1
        if (creatureDef.power > newStats.highestCreaturePower) {
          newStats.highestCreaturePower = creatureDef.power
        }

        const creaturesCount = Object.keys(state.cdCreatures).length + 1
        const oasisCount = Object.keys(state.cdOasis).length
        const structureCount = Object.keys(state.cdStructures).length
        const artifactCount = state.cdArtifacts.length

        const newAchievements = cdCheckAchievements(
          newStats,
          creaturesCount,
          oasisCount,
          structureCount,
          artifactCount,
          state.cdAchievements
        )

        const materialsCount = state.cdInventory.length
        const newTitle = cdUpdateTitle(
          creaturesCount,
          oasisCount,
          structureCount,
          materialsCount,
          state.cdTitle
        )

        set({
          cdCreatures: { ...state.cdCreatures, [id]: newCreatureState },
          cdStats: newStats,
          cdAchievements: [...state.cdAchievements, ...newAchievements],
          cdTitle: newTitle,
        })

        return true
      },

      // ── tendOasis ─────────────────────────────────────────────
      tendOasis: (id: string): boolean => {
        const state = get()
        const oasisDef = cdFindOasisDef(id)
        if (!oasisDef) return false

        const existingOasis = state.cdOasis[id]
        const now = Date.now()

        if (existingOasis && existingOasis.tended) {
          const timeSinceLastTend = now - existingOasis.lastTendedAt
          if (timeSinceLastTend < 3600000) return false
        }

        const newOasisState: CDOasisState = {
          tended: true,
          lastTendedAt: now,
          level: existingOasis ? existingOasis.level + 1 : 1,
          resourcesGathered: existingOasis
            ? existingOasis.resourcesGathered + oasisDef.resources.length
            : oasisDef.resources.length,
        }

        const newInventory = [...state.cdInventory]
        for (const resource of oasisDef.resources) {
          const existing = newInventory.find((item) => item.materialId === resource)
          if (existing) {
            existing.quantity += 1
          } else {
            newInventory.push({ materialId: resource, quantity: 1 })
          }
        }

        const newStats = { ...state.cdStats }
        newStats.totalOasisVisits += 1

        const creaturesCount = Object.keys(state.cdCreatures).length
        const oasisCount = Object.keys(state.cdOasis).length + 1
        const structureCount = Object.keys(state.cdStructures).length
        const artifactCount = state.cdArtifacts.length

        const newAchievements = cdCheckAchievements(
          newStats,
          creaturesCount,
          oasisCount,
          structureCount,
          artifactCount,
          state.cdAchievements
        )

        const materialsCount = newInventory.length
        const newTitle = cdUpdateTitle(
          creaturesCount,
          oasisCount,
          structureCount,
          materialsCount,
          state.cdTitle
        )

        set({
          cdOasis: { ...state.cdOasis, [id]: newOasisState },
          cdInventory: newInventory,
          cdStats: newStats,
          cdAchievements: [...state.cdAchievements, ...newAchievements],
          cdTitle: newTitle,
        })

        return true
      },

      // ── buildStructure ────────────────────────────────────────
      buildStructure: (id: string): boolean => {
        const state = get()
        const structureDef = cdFindStructureDef(id)
        if (!structureDef) return false

        const currentLevel = state.cdStructures[id] ?? 0
        if (currentLevel >= structureDef.maxLevel) return false

        const newLevel = currentLevel + 1
        const cost = Math.floor(structureDef.baseCost * Math.pow(1.5, currentLevel))

        const totalMaterialsValue = state.cdInventory.reduce((sum, item) => {
          const matDef = CD_MATERIALS.find((m) => m.id === item.materialId)
          return sum + (matDef ? matDef.value * item.quantity : 0)
        }, 0)

        if (totalMaterialsValue < cost) return false

        const newStructures = { ...state.cdStructures, [id]: newLevel }
        const newStats = { ...state.cdStats }
        newStats.totalCrafted += 1

        const creaturesCount = Object.keys(state.cdCreatures).length
        const oasisCount = Object.keys(state.cdOasis).length
        const structureCount = Object.keys(newStructures).length
        const artifactCount = state.cdArtifacts.length

        const newAchievements = cdCheckAchievements(
          newStats,
          creaturesCount,
          oasisCount,
          structureCount,
          artifactCount,
          state.cdAchievements
        )

        const materialsCount = state.cdInventory.length
        const newTitle = cdUpdateTitle(
          creaturesCount,
          oasisCount,
          structureCount,
          materialsCount,
          state.cdTitle
        )

        set({
          cdStructures: newStructures,
          cdStats: newStats,
          cdAchievements: [...state.cdAchievements, ...newAchievements],
          cdTitle: newTitle,
        })

        return true
      },

      // ── activateArtifact ──────────────────────────────────────
      activateArtifact: (id: string): boolean => {
        const state = get()
        const artifactDef = cdFindArtifactDef(id)
        if (!artifactDef) return false
        if (state.cdArtifacts.includes(id)) return false

        const newStats = { ...state.cdStats }
        newStats.totalCollected += artifactDef.power

        const creaturesCount = Object.keys(state.cdCreatures).length
        const oasisCount = Object.keys(state.cdOasis).length
        const structureCount = Object.keys(state.cdStructures).length
        const artifactCount = state.cdArtifacts.length + 1

        const newAchievements = cdCheckAchievements(
          newStats,
          creaturesCount,
          oasisCount,
          structureCount,
          artifactCount,
          state.cdAchievements
        )

        const materialsCount = state.cdInventory.length
        const newTitle = cdUpdateTitle(
          creaturesCount,
          oasisCount,
          structureCount,
          materialsCount,
          state.cdTitle
        )

        set({
          cdArtifacts: [...state.cdArtifacts, id],
          cdStats: newStats,
          cdAchievements: [...state.cdAchievements, ...newAchievements],
          cdTitle: newTitle,
        })

        return true
      },

      // ── triggerDuneEvent ──────────────────────────────────────
      triggerDuneEvent: (): CDEventDef | null => {
        const state = get()
        const event = cdRandomEvent()
        if (!event) return null

        const newStats = { ...state.cdStats }
        newStats.totalEvents += 1

        const creaturesCount = Object.keys(state.cdCreatures).length
        const oasisCount = Object.keys(state.cdOasis).length
        const structureCount = Object.keys(state.cdStructures).length
        const artifactCount = state.cdArtifacts.length

        const newAchievements = cdCheckAchievements(
          newStats,
          creaturesCount,
          oasisCount,
          structureCount,
          artifactCount,
          state.cdAchievements
        )

        set({
          cdEvents: [...state.cdEvents, event.id],
          cdStats: newStats,
          cdAchievements: [...state.cdAchievements, ...newAchievements],
        })

        return event
      },

      // ── resetCrimsonDunes ─────────────────────────────────────
      resetCrimsonDunes: (): void => {
        set(CD_INITIAL_STATE)
      },
    }),
    { name: 'crimson-dunes-wire' }
  )
)

// ═══════════════════════════════════════════════════════
// SECTION 21: MAIN HOOK — useCrimsonDunes
// ═══════════════════════════════════════════════════════

export default function useCrimsonDunes() {
  const store = useCDStore()

  const collectCreature = useCallback((id: string): boolean => {
    return useCDStore.getState().collectCreature(id)
  }, [])

  const tendOasis = useCallback((id: string): boolean => {
    return useCDStore.getState().tendOasis(id)
  }, [])

  const buildStructure = useCallback((id: string): boolean => {
    return useCDStore.getState().buildStructure(id)
  }, [])

  const activateArtifact = useCallback((id: string): boolean => {
    return useCDStore.getState().activateArtifact(id)
  }, [])

  const triggerDuneEvent = useCallback((): CDEventDef | null => {
    return useCDStore.getState().triggerDuneEvent()
  }, [])

  const resetCrimsonDunes = useCallback((): void => {
    useCDStore.getState().resetCrimsonDunes()
  }, [])

  const cdAPI = useMemo(() => {
    const currentCreatures = Object.keys(store.cdCreatures)
    const currentOasis = Object.keys(store.cdOasis)
    const currentStructures = Object.keys(store.cdStructures)
    const currentMaterials = store.cdInventory.length

    return {
      // ── Constants ────────────────────────────────────────────
      CD_CREATURES,
      CD_OASIS,
      CD_MATERIALS,
      CD_STRUCTURES,
      CD_ABILITIES,
      CD_ACHIEVEMENTS,
      CD_TITLES,
      CD_ARTIFACTS,
      CD_EVENTS,
      CD_COLORS,
      CD_COLOR_CRIMSON,
      CD_COLOR_SAND_GOLD,
      CD_COLOR_OASIS_TEAL,
      CD_COLOR_DUNE_AMBER,
      CD_RARITY_TIERS,
      CD_SPECIES,
      CD_SPECIES_BONUSES,
      CD_ABILITY_CATEGORIES,
      CD_MATERIAL_CATEGORIES,
      CD_STRUCTURE_CATEGORIES,
      CD_DIFFICULTY_TIERS,
      CD_RESOURCE_TYPES,
      CD_MAX_STRUCTURE_LEVEL,

      // ── State ────────────────────────────────────────────────
      state: store,
      creaturesCollected: currentCreatures,
      oasisVisited: currentOasis,
      structuresBuilt: currentStructures,
      materialsOwned: currentMaterials,

      // ── Computed helpers ─────────────────────────────────────
      creaturesByRarity: CD_CREATURES.filter((c) => c.rarity === 'common'),
      creaturesBySpecies: (species: CDSpecies) =>
        CD_CREATURES.filter((c) => c.species === species),
      getCreatureById: (id: string) => cdFindCreatureDef(id),
      getOasisById: (id: string) => cdFindOasisDef(id),
      getStructureById: (id: string) => cdFindStructureDef(id),
      getArtifactById: (id: string) => cdFindArtifactDef(id),
      isCreatureCollected: (id: string) => !!store.cdCreatures[id],
      isArtifactActivated: (id: string) => store.cdArtifacts.includes(id),
      getStructureLevel: (id: string) => store.cdStructures[id] ?? 0,
      getCollectedCreaturesCount: () => currentCreatures.length,
      getTotalMaterialsValue: () =>
        store.cdInventory.reduce((sum, item) => {
          const matDef = CD_MATERIALS.find((m) => m.id === item.materialId)
          return sum + (matDef ? matDef.value * item.quantity : 0)
        }, 0),
      getUnlockedAchievements: () =>
        store.cdAchievements
          .map((id) => CD_ACHIEVEMENTS.find((a) => a.id === id))
          .filter(Boolean) as CDAchievementDef[],
      getCurrentTitle: () =>
        CD_TITLES.find((t) => t.id === store.cdTitle) ?? CD_TITLES[0],
      getCreaturesByRarity: (rarity: CDRarity) =>
        CD_CREATURES.filter((c) => c.rarity === rarity),
      getMaterialsByType: (type: CDMaterialType) =>
        CD_MATERIALS.filter((m) => m.type === type),
      getAbilitiesByType: (type: CDAbilityType) =>
        CD_ABILITIES.filter((a) => a.type === type),
      getEventsByRarity: (rarity: CDEventRarity) =>
        CD_EVENTS.filter((e) => e.rarity === rarity),
      getStructuresByCategory: (categoryId: string) => {
        const category = CD_STRUCTURE_CATEGORIES.find((c) => c.id === categoryId)
        if (!category) return []
        return category.structureIds
          .map((sid) => CD_STRUCTURES.find((s) => s.id === sid))
          .filter(Boolean) as CDStructureDef[]
      },
      getCompletionPercentage: () => {
        const creaturePct = currentCreatures.length / CD_CREATURES.length
        const oasisPct = currentOasis.length / CD_OASIS.length
        const structurePct = currentStructures.length / CD_STRUCTURES.length
        const artifactPct = store.cdArtifacts.length / CD_ARTIFACTS.length
        const achievementPct = store.cdAchievements.length / CD_ACHIEVEMENTS.length
        return Math.floor(
          ((creaturePct + oasisPct + structurePct + artifactPct + achievementPct) / 5) * 100
        )
      },
      getSpeciesCollectionCount: (species: CDSpecies) =>
        CD_CREATURES.filter(
          (c) => c.species === species && store.cdCreatures[c.id]
        ).length,
      getRarityCollectionCount: (rarity: CDRarity) =>
        CD_CREATURES.filter(
          (c) => c.rarity === rarity && store.cdCreatures[c.id]
        ).length,

      // ── Action functions ─────────────────────────────────────
      collectCreature,
      tendOasis,
      buildStructure,
      activateArtifact,
      triggerDuneEvent,
      resetCrimsonDunes,
    }
  }, [
    store,
    collectCreature,
    tendOasis,
    buildStructure,
    activateArtifact,
    triggerDuneEvent,
    resetCrimsonDunes,
  ])

  return cdAPI
}
