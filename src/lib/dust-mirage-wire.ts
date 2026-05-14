/**
 * Dust Mirage Wire — 沙尘幻影 (Dust Mirage) themed module for Word Snake
 *
 * A desert illusion mini-game: summon 35 dust phantoms across 5 rarity tiers
 * and 7 species, discover 8 oases, gather 30 enchanted materials, build 25
 * oasis structures, wield 22 mirage abilities, earn 18 achievements, claim
 * 8 progression titles, collect 15 legendary artifacts, and survive 12
 * random desert events — backed by a Zustand store with persist middleware.
 *
 * Storage key: dust-mirage-wire
 * Prefix: dm / DM_
 * Colors: sand gold #DAA520, dust red #CD853F, mirage cyan #40E0D0, twilight purple #9370DB
 */

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ═══════════════════════════════════════════════════════════════════
// SECTION 1: TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════

export type DMRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export type DMSpecies =
  | 'sand_wraith'
  | 'dust_devil'
  | 'mirage_djinn'
  | 'ash_specter'
  | 'storm_genie'
  | 'glass_golem'
  | 'dune_haunt'

export type DMMaterialType = 'sand' | 'gem' | 'mineral' | 'crystal' | 'relic'

export type DMAbilityType = 'combat' | 'exploration' | 'survival' | 'mystic'

export type DMEventRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

export interface DMPhantomDef {
  readonly id: string
  readonly name: string
  readonly species: DMSpecies
  readonly rarity: DMRarity
  readonly power: number
  readonly hp: number
  readonly description: string
  readonly specialAbility: string
}

export interface DMOasisDef {
  readonly id: string
  readonly name: string
  readonly level: number
  readonly resources: string[]
  readonly capacity: number
  readonly description: string
}

export interface DMMaterialDef {
  readonly id: string
  readonly name: string
  readonly rarity: DMRarity
  readonly description: string
  readonly value: number
  readonly type: DMMaterialType
}

export interface DMStructureDef {
  readonly id: string
  readonly name: string
  readonly maxLevel: number
  readonly description: string
  readonly effectPerLevel: string
  readonly baseCost: number
}

export interface DMAbilityDef {
  readonly id: string
  readonly name: string
  readonly type: DMAbilityType
  readonly power: number
  readonly cooldown: number
  readonly description: string
}

export interface DMAchievementDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly condition: string
  readonly reward: string
}

export interface DMTitleDef {
  readonly id: string
  readonly name: string
  readonly requirement: string
  readonly bonus: string
}

export interface DMArtifactDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly power: number
  readonly lore: string
}

export interface DMEventDef {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly effect: string
  readonly rarity: DMEventRarity
}

export interface DMPhantomState {
  collected: boolean
  collectedAt: number
  level: number
}

export interface DMOasisState {
  discovered: boolean
  lastVisitedAt: number
  level: number
  resourcesGathered: number
}

export interface DMInventoryItem {
  materialId: string
  quantity: number
}

export interface DustMirageState {
  dmPhantoms: Record<string, DMPhantomState>
  dmOases: Record<string, DMOasisState>
  dmInventory: DMInventoryItem[]
  dmArtifacts: string[]
  dmAchievements: string[]
  dmTitle: string
  dmEvents: string[]
  dmStructures: Record<string, number>
  dmStats: {
    totalSummoned: number
    totalExplored: number
    totalCrafted: number
    totalBattles: number
    totalEvents: number
    totalOasisVisits: number
    highestPhantomPower: number
    miragePowerEarned: number
    sandShaped: number
    stormsSurvived: number
  }
}

export interface DustMirageActions {
  summonPhantom: (id: string) => boolean
  discoverOasis: (id: string) => boolean
  buildStructure: (id: string) => boolean
  activateArtifact: (id: string) => boolean
  triggerMirageEvent: () => DMEventDef | null
  resetDustMirage: () => void
}

export type DMStore = DustMirageState & DustMirageActions

// ═══════════════════════════════════════════════════════════════════
// SECTION 2: COLOR THEME CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const DM_COLOR_SAND_GOLD: string = '#DAA520'
export const DM_COLOR_DUST_RED: string = '#CD853F'
export const DM_COLOR_MIRAGE_CYAN: string = '#40E0D0'
export const DM_COLOR_TWILIGHT_PURPLE: string = '#9370DB'

export const DM_COLORS: Record<string, string> = {
  sandGold: '#DAA520',
  dustRed: '#CD853F',
  mirageCyan: '#40E0D0',
  twilightPurple: '#9370DB',
  background: '#1A140A',
  surface: '#2D2010',
  textPrimary: '#F5DEB3',
  textSecondary: '#D2B48C',
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 3: RARITY & SPECIES HELPERS
// ═══════════════════════════════════════════════════════════════════

export const DM_RARITY_TIERS: Record<
  DMRarity,
  { name: string; color: string; multiplier: number; weight: number }
> = {
  common: { name: 'Common', color: '#A0A0A0', multiplier: 1.0, weight: 45 },
  uncommon: { name: 'Uncommon', color: '#2E8B57', multiplier: 1.5, weight: 28 },
  rare: { name: 'Rare', color: '#40E0D0', multiplier: 2.5, weight: 16 },
  epic: { name: 'Epic', color: '#CD853F', multiplier: 4.0, weight: 8 },
  legendary: { name: 'Legendary', color: '#9370DB', multiplier: 7.0, weight: 3 },
}

export const DM_SPECIES: Record<
  DMSpecies,
  { name: string; description: string; color: string }
> = {
  sand_wraith: {
    name: 'Sand Wraith',
    description: 'Ethereal spirits born from the shifting sands of ancient deserts, bound to the dunes by primordial oaths.',
    color: '#DAA520',
  },
  dust_devil: {
    name: 'Dust Devil',
    description: 'Spiraling elemental forces of the desert wind that whirl across the wasteland with malicious glee.',
    color: '#C0C0C0',
  },
  mirage_djinn: {
    name: 'Mirage Djinn',
    description: 'Powerful wish-granting spirits that manifest as shimmering illusions in the noonday heat.',
    color: '#40E0D0',
  },
  ash_specter: {
    name: 'Ash Specter',
    description: 'Ghostly remnants of ancient desert civilizations, haunting the ruins of their fallen cities.',
    color: '#CD853F',
  },
  storm_genie: {
    name: 'Storm Genie',
    description: 'Elemental lords of the desert tempest, commanding thunder, lightning, and howling sandstorms.',
    color: '#9370DB',
  },
  glass_golem: {
    name: 'Glass Golem',
    description: 'Animated constructs of fused desert glass, built by forgotten architects to guard sacred tombs.',
    color: '#87CEEB',
  },
  dune_haunt: {
    name: 'Dune Haunt',
    description: 'Shadowy beings that lurk between the dunes, feeding on the fear of lost desert travelers.',
    color: '#8B0000',
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 4: DM_SPECIES_BONUSES — Per-species collection bonuses
// ═══════════════════════════════════════════════════════════════════

export const DM_SPECIES_BONUSES: Record<
  DMSpecies,
  { passiveBonus: string; activeBonus: string; synergy: DMSpecies[] }
> = {
  sand_wraith: {
    passiveBonus: '+5% mirage detection range in sandstorms',
    activeBonus: 'Sand Phase: Pass through sand obstacles unharmed',
    synergy: ['dust_devil', 'dune_haunt'],
  },
  dust_devil: {
    passiveBonus: '+3% evasion when moving through open desert',
    activeBonus: 'Dust Cloak: Become partially invisible in sandy areas',
    synergy: ['sand_wraith', 'storm_genie'],
  },
  mirage_djinn: {
    passiveBonus: '+8% illusion resistance for the party',
    activeBonus: 'Wish Veil: Create a protective mirage barrier',
    synergy: ['ash_specter', 'glass_golem'],
  },
  ash_specter: {
    passiveBonus: '+5% spirit damage on all attacks',
    activeBonus: 'Ash Shroud: Blind enemies with spectral ash',
    synergy: ['dune_haunt', 'mirage_djinn'],
  },
  storm_genie: {
    passiveBonus: '+7% lightning affinity in desert storms',
    activeBonus: 'Tempest Call: Summon a localized sandstorm',
    synergy: ['dust_devil', 'glass_golem'],
  },
  glass_golem: {
    passiveBonus: '+10% physical damage resistance',
    activeBonus: 'Crystal Fortress: Reflect 25% of incoming damage',
    synergy: ['mirage_djinn', 'storm_genie'],
  },
  dune_haunt: {
    passiveBonus: '+4% stealth in twilight hours',
    activeBonus: 'Shadow Step: Teleport between dark dune shadows',
    synergy: ['sand_wraith', 'ash_specter'],
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 5: DM_ABILITY_CATEGORIES — Ability type metadata
// ═══════════════════════════════════════════════════════════════════

export const DM_ABILITY_CATEGORIES: Record<
  DMAbilityType,
  { name: string; description: string; color: string }
> = {
  combat: {
    name: 'Combat',
    description: 'Offensive abilities that channel the destructive power of sand, storm, and spectral energy against enemies.',
    color: '#CD853F',
  },
  exploration: {
    name: 'Exploration',
    description: 'Utility abilities that reveal hidden oases, phantom paths, and buried treasures across the desert.',
    color: '#DAA520',
  },
  survival: {
    name: 'Survival',
    description: 'Defensive abilities that harness mirage illusions and glass barriers to endure desert hazards.',
    color: '#40E0D0',
  },
  mystic: {
    name: 'Mystic',
    description: 'Arcane abilities that manipulate the fabric of mirages, summon dust phantoms, and bend reality.',
    color: '#9370DB',
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 6: DM_MATERIAL_CATEGORIES — Material type metadata
// ═══════════════════════════════════════════════════════════════════

export const DM_MATERIAL_CATEGORIES: Record<
  DMMaterialType,
  { name: string; description: string; color: string; icon: string }
> = {
  sand: {
    name: 'Enchanted Sand',
    description: 'Magically infused desert sand used in mirage crafting and phantom summoning rituals.',
    color: '#DAA520',
    icon: '\u23F3',
  },
  gem: {
    name: 'Desert Gem',
    description: 'Precious gemstones imbued with the essence of ancient desert spirits and trapped starlight.',
    color: '#9370DB',
    icon: '\uD83D\uDC8E',
  },
  mineral: {
    name: 'Sand Mineral',
    description: 'Rare mineral deposits found deep beneath the dunes, essential for glass golem construction.',
    color: '#CD853F',
    icon: '\uD83E\uDEA8',
  },
  crystal: {
    name: 'Mirage Crystal',
    description: 'Crystalline formations that store and channel the illusory energies of the mirage realm.',
    color: '#40E0D0',
    icon: '\uD83D\uDD2E',
  },
  relic: {
    name: 'Ancient Relic',
    description: 'Artifacts of immense power left behind by the civilizations that once ruled the desert.',
    color: '#DAA520',
    icon: '\uD83D\uDCFA',
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 7: DM_STRUCTURE_CATEGORIES — Structure type groupings
// ═══════════════════════════════════════════════════════════════════

export const DM_STRUCTURE_CATEGORIES: readonly {
  id: string
  name: string
  description: string
  structureIds: string[]
  color: string
}[] = [
  {
    id: 'shelter',
    name: 'Shelter',
    description: 'Structures providing living quarters and protection for desert wanderers and their phantoms.',
    structureIds: [
      'sand_tent_dm',
      'mirage_hut_dm',
      'glass_watchtower_dm',
      'dust_fortress_dm',
      'phantom_palace_dm',
    ],
    color: '#DAA520',
  },
  {
    id: 'resource',
    name: 'Resource',
    description: 'Facilities for extracting and refining enchanted sand, mirage crystals, and desert minerals.',
    structureIds: [
      'sand_quarry_dm',
      'mirage_crucible_dm',
      'glass_workshop_dm',
      'relic_forge_dm',
      'creation_anvil_dm',
    ],
    color: '#40E0D0',
  },
  {
    id: 'water',
    name: 'Water',
    description: 'Water infrastructure essential for sustaining life in the mirage desert and tending oasis gardens.',
    structureIds: [
      'clay_well_dm',
      'phantom_bore_dm',
      'oasis_siphon_dm',
      'mirage_aqueduct_dm',
      'dust_water_temple_dm',
    ],
    color: '#87CEEB',
  },
  {
    id: 'combat',
    name: 'Combat',
    description: 'Defensive fortifications and weapon emplacements to repel hostile dust phantoms and sand wyrms.',
    structureIds: [
      'sand_barrier_dm',
      'glass_turret_dm',
      'specter_bastion_dm',
      'storm_battery_dm',
      'dune_gates_dm',
    ],
    color: '#CD853F',
  },
  {
    id: 'mystical',
    name: 'Mystical',
    description: 'Sacred structures that channel the ancient mirage forces and summon powerful dust phantoms.',
    structureIds: [
      'shrine_sands_dm',
      'twilight_observatory_dm',
      'phantom_chamber_dm',
      'mirage_altar_dm',
      'primal_shrine_dm',
    ],
    color: '#9370DB',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 8: DM_DIFFICULTY_TIERS — Difficulty progression
// ═══════════════════════════════════════════════════════════════════

export const DM_DIFFICULTY_TIERS: readonly {
  id: string
  name: string
  phantomLevelRange: [number, number]
  eventFrequency: number
  resourceMultiplier: number
  color: string
}[] = [
  { id: 'shimmering_flats', name: 'Shimmering Flats', phantomLevelRange: [1, 5], eventFrequency: 1.0, resourceMultiplier: 1.0, color: '#DAA520' },
  { id: 'whispering_dunes', name: 'Whispering Dunes', phantomLevelRange: [3, 10], eventFrequency: 1.2, resourceMultiplier: 1.3, color: '#CD853F' },
  { id: 'glass_wastes', name: 'Glass Wastes', phantomLevelRange: [8, 20], eventFrequency: 1.5, resourceMultiplier: 1.8, color: '#40E0D0' },
  { id: 'twilight_desert', name: 'Twilight Desert', phantomLevelRange: [15, 30], eventFrequency: 1.8, resourceMultiplier: 2.5, color: '#9370DB' },
  { id: 'void_sands', name: 'Void Sands', phantomLevelRange: [25, 50], eventFrequency: 2.5, resourceMultiplier: 4.0, color: '#4B0082' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 9: DM_PHANTOMS — 35 Dust Phantoms (5 rarity x 7 species)
// ═══════════════════════════════════════════════════════════════════

export const DM_PHANTOMS: readonly DMPhantomDef[] = [
  // ── Common (7) ────────────────────────────────────────────────
  {
    id: 'dm_common_dust_wisp',
    name: 'Dust Wisp',
    species: 'sand_wraith',
    rarity: 'common',
    power: 15,
    hp: 40,
    description:
      'A faintly glowing wisp that drifts above the dunes at twilight. It is the weakest of the sand wraiths, barely more than a sparkle of desert magic given form. Nomads consider them harmless omens of fair weather ahead.',
    specialAbility: 'Spark Drift',
  },
  {
    id: 'dm_common_grit_sprite',
    name: 'Grit Sprite',
    species: 'dust_devil',
    rarity: 'common',
    power: 12,
    hp: 25,
    description:
      'A tiny spinning column of sand and air that zips across the desert floor. Grit sprites are mischievous rather than dangerous, stealing small objects and tangling hair. Children chase them for sport during sand festivals.',
    specialAbility: 'Sand Prank',
  },
  {
    id: 'dm_common_glass_imp',
    name: 'Glass Imp',
    species: 'glass_golem',
    rarity: 'common',
    power: 10,
    hp: 60,
    description:
      'A diminutive construct made from shards of desert glass held together by residual magic. Glass imps are curious and loyal, often following travelers for miles before vanishing into a pile of sand. They clink softly when they move.',
    specialAbility: 'Glass Shards',
  },
  {
    id: 'dm_common_haze_moth',
    name: 'Haze Moth',
    species: 'mirage_djinn',
    rarity: 'common',
    power: 8,
    hp: 20,
    description:
      'A moth whose wings create the illusion of a larger creature when viewed from certain angles. Haze moths are attracted to heat sources and often gather around campfires, creating beautiful swirling patterns of refracted light.',
    specialAbility: 'Haze Camouflage',
  },
  {
    id: 'dm_common_cinder_trace',
    name: 'Cinder Trace',
    species: 'ash_specter',
    rarity: 'common',
    power: 14,
    hp: 35,
    description:
      'A barely visible trail of floating ash that follows ancient caravan routes. Cinder traces are the remnants of burned travelers whose spirits cannot rest. They flicker like dying embers and whisper directions to the lost.',
    specialAbility: 'Ash Guidance',
  },
  {
    id: 'dm_common_breeze_elf',
    name: 'Breeze Elf',
    species: 'storm_genie',
    rarity: 'common',
    power: 11,
    hp: 15,
    description:
      'A playful elemental spirit born from gentle desert breezes. Breeze elves are the smallest and weakest of the storm genies, no larger than a hand. They amuse themselves by tying knots in tent ropes and ruffling hair.',
    specialAbility: 'Zephyr Tickling',
  },
  {
    id: 'dm_common_dusk_shade',
    name: 'Dusk Shade',
    species: 'dune_haunt',
    rarity: 'common',
    power: 13,
    hp: 30,
    description:
      'A shadowy figure that appears between dunes at the moment between day and night. Dusk shades are harmless observers, drawn to places where strong emotions were once felt. They vanish at the first sound of laughter.',
    specialAbility: 'Twilight Flicker',
  },

  // ── Uncommon (7) ──────────────────────────────────────────────
  {
    id: 'dm_uncommon_sand_lurker',
    name: 'Sand Lurker',
    species: 'sand_wraith',
    rarity: 'uncommon',
    power: 32,
    hp: 90,
    description:
      'A wraith that hides beneath the sand, ambushing prey by erupting from beneath their feet. Sand lurkers can sense vibrations through the ground for hundreds of meters and coordinate attacks with other wraiths in perfect silence.',
    specialAbility: 'Sand Ambush',
  },
  {
    id: 'dm_uncommon_whirl_mage',
    name: 'Whirl Mage',
    species: 'dust_devil',
    rarity: 'uncommon',
    power: 28,
    hp: 55,
    description:
      'An intelligent dust devil that has learned to cast simple spells by weaving sand into magical patterns. Whirl mages collect spell fragments from ancient ruins and incorporate them into their swirling bodies, gaining new abilities over time.',
    specialAbility: 'Sand Spell',
  },
  {
    id: 'dm_uncommon_crystal_guard',
    name: 'Crystal Guard',
    species: 'glass_golem',
    rarity: 'uncommon',
    power: 30,
    hp: 110,
    description:
      'A humanoid glass golem standing eight feet tall, constructed from enchanted desert crystal. Crystal guards were built by an ancient desert empire to protect their most sacred sites. They are tireless, emotionless, and absolutely loyal to their original commands.',
    specialAbility: 'Crystal Shield',
  },
  {
    id: 'dm_uncommon_mirage_fox',
    name: 'Mirage Fox',
    species: 'mirage_djinn',
    rarity: 'uncommon',
    power: 35,
    hp: 65,
    description:
      'A djinn that takes the form of a fox made entirely of shimmering desert light. Mirage foxes are tricksters of the highest order, capable of creating convincing illusions of entire landscapes. They trade in secrets and only accept knowledge as payment.',
    specialAbility: 'Fox Illusion',
  },
  {
    id: 'dm_uncommon_cinder_wraith',
    name: 'Cinder Wraith',
    species: 'ash_specter',
    rarity: 'uncommon',
    power: 26,
    hp: 75,
    description:
      'A more powerful specter formed from the collective ashes of a burned village. Cinder wraiths are filled with grief and rage, attacking any living creature that approaches their burial grounds. Their touch leaves burns that never heal.',
    specialAbility: 'Burning Touch',
  },
  {
    id: 'dm_uncommon_tempest_scout',
    name: 'Tempest Scout',
    species: 'storm_genie',
    rarity: 'uncommon',
    power: 33,
    hp: 80,
    description:
      'A storm genie that serves as the advance scout for larger desert storms. Tempest scouts race ahead of sandstorms, testing the defenses of any settlements in the storm path. They can summon small bolts of lightning at will.',
    specialAbility: 'Lightning Scout',
  },
  {
    id: 'dm_uncommon_sand_stalker',
    name: 'Sand Stalker',
    species: 'dune_haunt',
    rarity: 'uncommon',
    power: 29,
    hp: 60,
    description:
      'A predatory haunt that uses the shadows between dunes to conceal its approach. Sand stalkers are patient hunters, willing to follow prey for days across the desert. They strike only at the perfect moment, dragging victims beneath the sand.',
    specialAbility: 'Shadow Hunt',
  },

  // ── Rare (7) ──────────────────────────────────────────────────
  {
    id: 'dm_rare_sand_pharaoh',
    name: 'Sand Pharaoh',
    species: 'sand_wraith',
    rarity: 'rare',
    power: 65,
    hp: 220,
    description:
      'The spectral remnant of an ancient desert king who ruled a vast empire now buried beneath the dunes. The Sand Pharaoh commands lesser wraiths with absolute authority and can raise armies of sand warriors with a single gesture of his translucent hand.',
    specialAbility: 'Pharaoh Command',
  },
  {
    id: 'dm_rare_dust_titan',
    name: 'Dust Titan',
    species: 'dust_devil',
    rarity: 'rare',
    power: 60,
    hp: 150,
    description:
      'A colossal dust devil reaching three hundred feet into the sky. Dust titans are born once per century when the desert wind aligns with a magical ley line. They can reshape entire dune systems with their passage and their roar sounds like grinding stone.',
    specialAbility: 'Dust Reshape',
  },
  {
    id: 'dm_rare_glass_dragon',
    name: 'Glass Dragon',
    species: 'glass_golem',
    rarity: 'rare',
    power: 58,
    hp: 280,
    description:
      'The masterpiece of a forgotten glass-smith, a dragon-shaped golem made from enchanted obsidian glass. It reflects and refracts light in mesmerizing patterns, disorienting enemies. Its glass breath is superheated sand that melts armor and ignites flesh.',
    specialAbility: 'Glass Breath',
  },
  {
    id: 'dm_rare_mirage_sphinx',
    name: 'Mirage Sphinx',
    species: 'mirage_djinn',
    rarity: 'rare',
    power: 62,
    hp: 130,
    description:
      'A djinn that takes the form of a great sphinx, half-lion and half-eagle, rendered in perfect illusion. It poses riddles to those who seek passage through its domain. Those who answer correctly are rewarded; those who fail become part of the mirage forever.',
    specialAbility: 'Riddle Bind',
  },
  {
    id: 'dm_rare_ash_guardian',
    name: 'Ash Guardian',
    species: 'ash_specter',
    rarity: 'rare',
    power: 55,
    hp: 180,
    description:
      'A specter of incredible power, formed from the ashes of a warrior who died defending their homeland. Ash Guardians are bound to specific locations and cannot leave, but within their domain they are nearly invincible, wielding spectral weapons of pure ash.',
    specialAbility: 'Domain Ward',
  },
  {
    id: 'dm_rare_storm_colossus',
    name: 'Storm Colossus',
    species: 'storm_genie',
    rarity: 'rare',
    power: 64,
    hp: 200,
    description:
      'A massive genie born from the collision of three simultaneous desert storms. Storm Colossi are as large as buildings and radiate crackling electrical energy. The ground around them is permanently scorched with lightning scars and turned to glass.',
    specialAbility: 'Triple Storm',
  },
  {
    id: 'dm_rare_dune_specter',
    name: 'Dune Specter',
    species: 'dune_haunt',
    rarity: 'rare',
    power: 57,
    hp: 160,
    description:
      'A haunt so powerful it has merged with the desert itself, able to appear anywhere within a hundred-mile radius. Dune Specters have existed for millennia, accumulating the memories and fears of every traveler who has crossed their territory.',
    specialAbility: 'Desert Merge',
  },

  // ── Epic (7) ──────────────────────────────────────────────────
  {
    id: 'dm_epic_wraith_sovereign',
    name: 'Wraith Sovereign',
    species: 'sand_wraith',
    rarity: 'epic',
    power: 120,
    hp: 500,
    description:
      'The undisputed king of all sand wraiths, a being of pure desert magic so ancient it predates the formation of the dunes themselves. The Wraith Sovereign commands the loyalty of every wraith in the desert and can summon sandstorms that bury entire cities overnight.',
    specialAbility: 'Sovereign Storm',
  },
  {
    id: 'dm_epic_devil_of_ashes',
    name: 'Devil of Ashes',
    species: 'dust_devil',
    rarity: 'epic',
    power: 110,
    hp: 400,
    description:
      'A dust devil of terrifying power that has absorbed the ashes of a hundred burned cities into its swirling form. The Devil of Ashes radiates heat intense enough to melt metal, and the sand it kicks up burns like coals. Entire caravans vanish in its path.',
    specialAbility: 'Ash Inferno',
  },
  {
    id: 'dm_epic_prism_golem_king',
    name: 'Prism Golem King',
    species: 'glass_golem',
    rarity: 'epic',
    power: 115,
    hp: 650,
    description:
      'A towering glass golem standing fifty feet tall, constructed from every type of enchanted desert crystal known to exist. The Prism Golem King refracts reality itself, creating prismatic duplicates of itself that fight alongside the original.',
    specialAbility: 'Prismatic Army',
  },
  {
    id: 'dm_epic_djinn_architect',
    name: 'Djinn Architect',
    species: 'mirage_djinn',
    rarity: 'epic',
    power: 125,
    hp: 380,
    description:
      'A mirage djinn of unmatched power who designed the greatest illusory cities ever seen. The Djinn Architect can create permanent structures of pure mirage that are indistinguishable from reality, complete with sounds, smells, and physical substance.',
    specialAbility: 'City of Mirages',
  },
  {
    id: 'dm_epic_specter_emperor',
    name: 'Specter Emperor',
    species: 'ash_specter',
    rarity: 'epic',
    power: 105,
    hp: 550,
    description:
      'The combined spirit of every ruler who ever died in the desert, fused into a single, terrifying entity. The Specter Emperor wears a crown of spectral flames and wields a sword forged from the condensed grief of a thousand fallen empires.',
    specialAbility: 'Emperor Grief',
  },
  {
    id: 'dm_epic_hurricane_genie',
    name: 'Hurricane Genie',
    species: 'storm_genie',
    rarity: 'epic',
    power: 130,
    hp: 450,
    description:
      'A storm genie so powerful it generates its own permanent hurricane around its body. The Hurricane Genie can control the direction and intensity of desert storms across an entire continent, and its mere presence turns sand to glass in a mile radius.',
    specialAbility: 'Hurricane Domain',
  },
  {
    id: 'dm_epic_haunt_eternal',
    name: 'Haunt Eternal',
    species: 'dune_haunt',
    rarity: 'epic',
    power: 118,
    hp: 420,
    description:
      'A dune haunt that has existed since the first desert was formed and will persist until the last grain of sand blows away. Haunt Eternal knows every secret buried in the desert and has witnessed the rise and fall of every civilization that dared to build here.',
    specialAbility: 'Eternal Knowledge',
  },

  // ── Legendary (7) ─────────────────────────────────────────────
  {
    id: 'dm_legendary_sand_primordial',
    name: 'Sand Primordial',
    species: 'sand_wraith',
    rarity: 'legendary',
    power: 200,
    hp: 1000,
    description:
      'The first sand wraith, born when the desert was still young and the world was new. The Sand Primordial is the desert itself given consciousness, every grain of sand an extension of its vast awareness. It speaks through sandstorms and dreams through mirages.',
    specialAbility: 'Desert Awakening',
  },
  {
    id: 'dm_legendary_ultimate_devil',
    name: 'Ultimate Devil',
    species: 'dust_devil',
    rarity: 'legendary',
    power: 190,
    hp: 900,
    description:
      'The primordial dust devil that created the first desert by grinding mountains into sand. The Ultimate Devil is a being of pure, unrestrained motion, spinning so fast it exists simultaneously in thousands of locations. It is the source of all lesser dust devils.',
    specialAbility: 'World Grinding',
  },
  {
    id: 'dm_legendary_crystal_titan',
    name: 'Crystal Titan',
    species: 'glass_golem',
    rarity: 'legendary',
    power: 195,
    hp: 1200,
    description:
      'A golem of godlike proportions, built by the first civilization to discover the secret of desert glass. The Crystal Titan is a walking mountain of enchanted crystal that absorbs all magical energy directed at it and converts it into devastating counterattacks.',
    specialAbility: 'Absorb and Reflect',
  },
  {
    id: 'dm_legendary_grand_vizier',
    name: 'Grand Vizier',
    species: 'mirage_djinn',
    rarity: 'legendary',
    power: 210,
    hp: 800,
    description:
      'The most powerful mirage djinn ever to exist, said to have been the vizier of the First Sultan who ruled the world from a palace of perfect illusion. The Grand Vizier can rewrite reality within its line of sight, making the impossible real and the real impossible.',
    specialAbility: 'Reality Rewrite',
  },
  {
    id: 'dm_legendary_ash_primordial',
    name: 'Ash Primordial',
    species: 'ash_specter',
    rarity: 'legendary',
    power: 185,
    hp: 1100,
    description:
      'The first ash specter, born from the volcanic eruption that created the desert. The Ash Primordial is the ghost of the world that existed before the sand, a vast consciousness of fire and destruction that haunts the deepest desert canyons in eternal mourning.',
    specialAbility: 'World Remembrance',
  },
  {
    id: 'dm_legendary_eye_of_storm',
    name: 'Eye of Storm',
    species: 'storm_genie',
    rarity: 'legendary',
    power: 205,
    hp: 950,
    description:
      'A legendary storm genie that exists at the exact center of every desert storm simultaneously. The Eye of Storm is a being of perfect calm surrounded by perfect chaos, and those who reach its center find absolute stillness and clarity before being consumed by the tempest.',
    specialAbility: 'Perfect Calm',
  },
  {
    id: 'dm_legendary_dune_lord',
    name: 'Dune Lord',
    species: 'dune_haunt',
    rarity: 'legendary',
    power: 188,
    hp: 850,
    description:
      'The ultimate dune haunt, a being that IS the desert night itself. The Dune Lord walks between the dunes when the sun sets, collecting the dreams of sleeping travelers and weaving them into the fabric of the mirage realm. Without the Dune Lord, no mirage could ever form.',
    specialAbility: 'Dream Harvest',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 10: DM_OASES — 8 Oasis Locations
// ═══════════════════════════════════════════════════════════════════

export const DM_OASES: readonly DMOasisDef[] = [
  {
    id: 'dm_oasis_phantom_springs',
    name: 'Phantom Springs',
    level: 1,
    resources: ['phantom_water', 'healing_sand', 'wisp_crystal'],
    capacity: 50,
    description:
      'A set of springs that glows with an ethereal blue light at night. The water here is said to have spectral properties, granting the drinker temporary ghostly vision. Phantom wisps dance above the surface on moonless nights.',
  },
  {
    id: 'dm_oasis_shimmer_basin',
    name: 'Shimmer Basin',
    level: 3,
    resources: ['shimmer_moss', 'mirror_stone', 'dust_pearl'],
    capacity: 80,
    description:
      'A shallow basin of perfectly still water that reflects the sky with uncanny clarity. On clear days, the reflection shows not the present sky but the sky as it will be tomorrow. Desert seers travel here to read the weather of the coming week.',
  },
  {
    id: 'dm_oasis_dust_devils_eye',
    name: "Dust Devil's Eye",
    level: 6,
    resources: ['storm_glass', 'wind_essence', 'turbine_gem'],
    capacity: 120,
    description:
      'A perfectly circular oasis at the center of a permanent dust devil. The vortex never touches the water, spinning around it in a protective ring. Inside the eye, the air is perfectly calm and the temperature is always comfortable.',
  },
  {
    id: 'dm_oasis_glass_desert',
    name: 'Glass Desert',
    level: 10,
    resources: ['pure_glass', 'prism_shard', 'refraction_dust'],
    capacity: 160,
    description:
      'An oasis in a field of naturally formed desert glass, created by an ancient lightning strike of incredible power. The glass reflects and refracts sunlight into dazzling rainbow patterns. It is the primary source of mirage crystals for glass golem construction.',
  },
  {
    id: 'dm_oasis_twilight_pools',
    name: 'Twilight Pools',
    level: 15,
    resources: ['dusk_water', 'shadow_lotus', 'violet_resin'],
    capacity: 200,
    description:
      'A series of interconnected pools that change color with the time of day. At twilight, the water turns a deep purple and reveals glowing inscriptions on the pool bottoms written in a language no living person can read.',
  },
  {
    id: 'dm_oasis_sand_kings_rest',
    name: "Sand King's Rest",
    level: 22,
    resources: ['royal_sand', 'crown_gem', 'scepter_crystal'],
    capacity: 250,
    description:
      'An oasis built on the ruins of a desert palace, its waters flowing through channels carved into ancient sandstone. The ghost of a long-dead king is said to appear here on midsummer night, offering boons to those who bring him the right tribute.',
  },
  {
    id: 'dm_oasis_mirage_garden',
    name: 'Mirage Garden',
    level: 30,
    resources: ['illusion_bloom', 'dream_pollen', 'reality_sap'],
    capacity: 320,
    description:
      'A garden that exists partly in reality and partly in the mirage realm. The flowers here change species every hour, cycling through plants from every era of the desert history. Walking through the garden feels like dreaming while awake.',
  },
  {
    id: 'dm_oasis_eternal_mirage',
    name: 'Eternal Mirage',
    level: 40,
    resources: ['eternal_sand', 'genesis_crystal', 'mirage_heart'],
    capacity: 500,
    description:
      'The most powerful oasis in the desert, a place where reality and illusion have merged completely. The Eternal Mirage is said to be the birthplace of all dust phantoms. Its waters grant the drinker the ability to see through any illusion.',
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 11: DM_MATERIALS — 30 Enchanted Materials
// ═══════════════════════════════════════════════════════════════════

export const DM_MATERIALS: readonly DMMaterialDef[] = [
  // Common (6)
  { id: 'dm_enchanted_sand', name: 'Enchanted Sand', rarity: 'common', description: 'Sand infused with trace amounts of desert magic. It shimmers faintly in direct sunlight and is the most basic crafting material in the mirage desert.', value: 3, type: 'sand' },
  { id: 'dm_phantom_glass', name: 'Phantom Glass', rarity: 'common', description: 'Translucent glass fragments left behind when a dust phantom dissipates. They retain a faint spectral glow and are used in basic mirage potions.', value: 4, type: 'crystal' },
  { id: 'dm_mirage_silk', name: 'Mirage Silk', rarity: 'common', description: 'A weightless fabric harvested from mirage moth cocoons. Mirage silk is nearly invisible and is used to weave cloaks of partial concealment.', value: 5, type: 'mineral' },
  { id: 'dm_dust_salt', name: 'Dust Salt', rarity: 'common', description: 'Magical salt harvested from dried-up mirage pools. It preserves food indefinitely and has mild healing properties when dissolved in water.', value: 3, type: 'mineral' },
  { id: 'dm_dune_resin', name: 'Dune Resin', rarity: 'common', description: 'Amber-colored resin that oozes from ancient desert trees during sandstorms. It hardens into a glassy substance when exposed to strong light.', value: 4, type: 'gem' },
  { id: 'dm_wind_blade', name: 'Wind Blade', rarity: 'common', description: 'A crystallized fragment of desert wind, shaped like a tiny blade. Wind blades are used as ammunition for sand-casters and basic enchantments.', value: 8, type: 'crystal' },

  // Uncommon (6)
  { id: 'dm_illusion_quartz', name: 'Illusion Quartz', rarity: 'uncommon', description: 'Quartz crystals that naturally produce mirages when exposed to heat. They are the primary component in mirage-crafting tools and are prized by desert artisans.', value: 25, type: 'crystal' },
  { id: 'dm_sand_wraith_essence', name: 'Wraith Essence', rarity: 'uncommon', description: 'The concentrated spiritual energy of a defeated sand wraith. It glows with a pale golden light and is used to summon and strengthen phantom allies.', value: 30, type: 'relic' },
  { id: 'dm_storm_glass_shard', name: 'Storm Glass Shard', rarity: 'uncommon', description: 'Fulgurite-like glass tubes created when lightning strikes sand. Storm glass contains trapped electrical energy and crackles when held near other enchanted materials.', value: 35, type: 'crystal' },
  { id: 'dm_ash_crystal', name: 'Ash Crystal', rarity: 'uncommon', description: 'Crystals that form in the ashes of burned desert settlements. They absorb nearby sound and are used in stealth enchantments and silent barriers.', value: 28, type: 'crystal' },
  { id: 'dm_dune_amber', name: 'Dune Amber', rarity: 'uncommon', description: 'Rare amber found only in the deepest desert deposits. Each piece contains a perfectly preserved ancient insect that still moves inside its golden prison.', value: 40, type: 'gem' },
  { id: 'dm_mirage_fiber', name: 'Mirage Fiber', rarity: 'uncommon', description: 'Ultra-fine threads spun from solidified mirage light. Mirage fiber is lighter than air and stronger than steel, used in the finest enchanted garments and armor.', value: 32, type: 'mineral' },

  // Rare (6)
  { id: 'dm_prism_core', name: 'Prism Core', rarity: 'rare', description: 'The heart of a shattered glass golem, a perfectly spherical crystal that refracts light into infinite colors. It serves as an amplifier for all mirage-based enchantments and spells.', value: 120, type: 'crystal' },
  { id: 'dm_sand_kings_crown', name: "Sand King's Crown Fragment", rarity: 'rare', description: 'A shard from the legendary crown of the First Sand King. It radiates authority and allows the wearer to command lesser dust phantoms with a single word.', value: 150, type: 'relic' },
  { id: 'dm_twilight_obsidian', name: 'Twilight Obsidian', rarity: 'rare', description: 'Obsidian formed at the exact moment of sunset in the deepest desert canyon. It absorbs light during the day and releases it as a soft purple glow at night.', value: 140, type: 'mineral' },
  { id: 'dm_mirage_pearl', name: 'Mirage Pearl', rarity: 'rare', description: 'A pearl that shifts between being real and illusory. Mirage pearls are the currency of the spirit realm and can purchase services from powerful dust phantoms.', value: 160, type: 'gem' },
  { id: 'dm_storm_genie_bottle', name: 'Storm Genie Bottle', rarity: 'rare', description: 'An ancient bottle containing a miniature storm inside. When opened, it releases a brief but powerful gust of wind and a single bolt of lightning.', value: 130, type: 'relic' },
  { id: 'dm_haunt_cloak_fabric', name: 'Haunt Cloak Fabric', rarity: 'rare', description: 'Fabric woven from the substance of dune haunts themselves. It allows the wearer to move through shadows and become invisible in dim desert light.', value: 145, type: 'mineral' },

  // Epic (6)
  { id: 'dm_eternal_sand_vial', name: 'Vial of Eternal Sand', rarity: 'epic', description: 'A small vial containing sand from the edge of reality itself. The sand inside never settles, always flowing upward against gravity. It can undo any enchantment when sprinkled upon it.', value: 500, type: 'sand' },
  { id: 'dm_specter_crown', name: 'Specter Crown', rarity: 'epic', description: 'A crown forged from the condensed spectral energy of a thousand ash specters. Wearing it grants dominion over the dead of the desert and allows communication with ancient spirits.', value: 480, type: 'relic' },
  { id: 'dm_glass_dragon_scale', name: 'Glass Dragon Scale', rarity: 'epic', description: 'A single scale from the legendary Glass Dragon. It is unbreakable, transparent as air, and reflects magic back at its source. Glass golem smiths consider it the ultimate crafting material.', value: 520, type: 'crystal' },
  { id: 'dm_mirage_sphinx_gem', name: 'Mirage Sphinx Gem', rarity: 'epic', description: 'A gemstone cut into the shape of a sphinx that whispers riddles to anyone who holds it. Answering the riddle correctly grants a temporary boost to all mirage abilities.', value: 490, type: 'gem' },
  { id: 'dm_hurricane_core', name: 'Hurricane Core', rarity: 'epic', description: 'The crystallized heart of a Hurricane Genie. It contains enough storm energy to power an entire city and hums with barely contained electrical fury.', value: 550, type: 'crystal' },
  { id: 'dm_dune_lords_eye', name: "Dune Lord's Eye", rarity: 'epic', description: 'A gemstone that looks exactly like a living eye. It sees everything that happens in the desert at night and can show the holder visions of any location they wish to observe.', value: 510, type: 'gem' },

  // Legendary (6)
  { id: 'dm_primordial_sand', name: 'Primordial Sand', rarity: 'legendary', description: 'Sand from before the world was formed, brought to the surface by the Sand Primordial itself. A single grain contains the memory of creation and can reshape reality when used in rituals.', value: 2000, type: 'sand' },
  { id: 'dm_grand_vizier_lamp', name: "Grand Vizier's Lamp", rarity: 'legendary', description: 'The lamp that bound the Grand Vizier, the most powerful mirage djinn ever known. It is said that anyone who possesses the lamp can command the Vizier to rewrite reality itself.', value: 2500, type: 'relic' },
  { id: 'dm_crystal_titan_heart', name: 'Crystal Titan Heart', rarity: 'legendary', description: 'The massive crystal core that powers the Crystal Titan. It pulses with rainbow light and contains the accumulated magical knowledge of every glass golem ever constructed.', value: 2200, type: 'crystal' },
  { id: 'dm_sand_primordial_mask', name: 'Sand Primordial Mask', rarity: 'legendary', description: 'A mask carved from a single grain of the Sand Primordial. Wearing it merges the user consciousness with the desert itself, allowing them to feel and control every grain of sand.', value: 2800, type: 'relic' },
  { id: 'dm_mirage_eternal_gem', name: 'Eternal Mirage Gem', rarity: 'legendary', description: 'A gemstone that exists in a state of permanent quantum superposition between real and illusory. It grants the ability to create permanent mirages and phase between reality and the spirit realm.', value: 3000, type: 'gem' },
  { id: 'dm_ash_primordial_urn', name: 'Ash Primordial Urn', rarity: 'legendary', description: 'An ancient urn containing the first ashes ever produced by fire. Opening it releases the Ash Primordial and begins the cycle of creation and destruction anew.', value: 2600, type: 'relic' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 12: DM_STRUCTURES — 25 Oasis Structures (maxLevel 10)
// ═══════════════════════════════════════════════════════════════════

export const DM_STRUCTURES: readonly DMStructureDef[] = [
  // Shelter (5)
  { id: 'sand_tent_dm', name: 'Sand Tent', maxLevel: 10, description: 'A simple shelter woven from enchanted sand fibers, providing basic protection from sandstorms and phantom attacks.', effectPerLevel: '+5% sandstorm resistance per level', baseCost: 50 },
  { id: 'mirage_hut_dm', name: 'Mirage Hut', maxLevel: 10, description: 'A hut that exists partly in the mirage realm, making it nearly invisible to hostile dust phantoms and sand wyrms.', effectPerLevel: '+5% stealth bonus per level', baseCost: 120 },
  { id: 'glass_watchtower_dm', name: 'Glass Watchtower', maxLevel: 10, description: 'A tower of enchanted glass that provides an elevated view of the surrounding desert and detects approaching phantoms.', effectPerLevel: '+8% detection range per level', baseCost: 250 },
  { id: 'dust_fortress_dm', name: 'Dust Fortress', maxLevel: 10, description: 'A massive fortress with walls of compressed enchanted sand, reinforced with phantom glass and spectral bindings.', effectPerLevel: '+10% defense per level', baseCost: 500 },
  { id: 'phantom_palace_dm', name: 'Phantom Palace', maxLevel: 10, description: 'The ultimate desert residence, a palace that shifts between reality and illusion at its master command.', effectPerLevel: '+15% all bonuses per level', baseCost: 1200 },

  // Resource (5)
  { id: 'sand_quarry_dm', name: 'Enchanted Sand Quarry', maxLevel: 10, description: 'A quarry that extracts magically infused sand from deep beneath the dunes using spectral mining tools.', effectPerLevel: '+10% sand yield per level', baseCost: 80 },
  { id: 'mirage_crucible_dm', name: 'Mirage Crucible', maxLevel: 10, description: 'A magical furnace that fuses enchanted sand into glass and crystal using concentrated mirage energy.', effectPerLevel: '+10% crystal yield per level', baseCost: 200 },
  { id: 'glass_workshop_dm', name: 'Glass Workshop', maxLevel: 10, description: 'A specialized workshop for crafting glass golem components and enchanted desert glass items.', effectPerLevel: '+8% crafting speed per level', baseCost: 350 },
  { id: 'relic_forge_dm', name: 'Relic Forge', maxLevel: 10, description: 'An ancient forge powered by spectral flames that can repair and enhance magical desert relics.', effectPerLevel: '+10% relic enhancement per level', baseCost: 600 },
  { id: 'creation_anvil_dm', name: 'Creation Anvil', maxLevel: 10, description: 'A primordial anvil where the raw materials of the desert can be combined into legendary artifacts.', effectPerLevel: '+12% legendary craft chance per level', baseCost: 1500 },

  // Water (5)
  { id: 'clay_well_dm', name: 'Clay Well', maxLevel: 10, description: 'A simple well lined with enchanted clay that purifies desert water and generates a small supply of phantom water daily.', effectPerLevel: '+5 water per day per level', baseCost: 60 },
  { id: 'phantom_bore_dm', name: 'Phantom Bore', maxLevel: 10, description: 'A spectral drilling apparatus that taps into underground mirage aquifers, producing a steady supply of enchanted water.', effectPerLevel: '+10 water per day per level', baseCost: 150 },
  { id: 'oasis_siphon_dm', name: 'Oasis Siphon', maxLevel: 10, description: 'A device that channels water from discovered oases to your base through a network of enchanted clay pipes.', effectPerLevel: '+8 water per oasis per level', baseCost: 300 },
  { id: 'mirage_aqueduct_dm', name: 'Mirage Aqueduct', maxLevel: 10, description: 'A spectacular aqueduct that exists half in reality and half in the mirage realm, transporting water across impossible distances.', effectPerLevel: '+15 water per day per level', baseCost: 700 },
  { id: 'dust_water_temple_dm', name: 'Dust Water Temple', maxLevel: 10, description: 'A sacred temple dedicated to the desert water spirits, generating vast quantities of blessed phantom water.', effectPerLevel: '+25 water per day per level', baseCost: 1400 },

  // Combat (5)
  { id: 'sand_barrier_dm', name: 'Sand Barrier', maxLevel: 10, description: 'A wall of enchanted sand that rises from the ground to block approaching enemies and hostile phantoms.', effectPerLevel: '+5% barrier HP per level', baseCost: 100 },
  { id: 'glass_turret_dm', name: 'Glass Turret', maxLevel: 10, description: 'An automated turret that fires shards of enchanted glass at approaching threats with uncanny accuracy.', effectPerLevel: '+8% damage per level', baseCost: 280 },
  { id: 'specter_bastion_dm', name: 'Specter Bastion', maxLevel: 10, description: 'A fortified position that is partially phased into the spirit realm, making it immune to physical attacks.', effectPerLevel: '+10% spirit resistance per level', baseCost: 500 },
  { id: 'storm_battery_dm', name: 'Storm Battery', maxLevel: 10, description: 'A battery of captured storm genie energy that can be discharged as devastating lightning attacks.', effectPerLevel: '+12% lightning damage per level', baseCost: 800 },
  { id: 'dune_gates_dm', name: 'Dune Gates', maxLevel: 10, description: 'Massive gates of fused desert glass and spectral metal that seal off entire passages through the dunes.', effectPerLevel: '+15% defense per level', baseCost: 1600 },

  // Mystical (5)
  { id: 'shrine_sands_dm', name: 'Shrine of Sands', maxLevel: 10, description: 'A shrine dedicated to the desert spirits that provides a passive bonus to phantom summoning rituals.', effectPerLevel: '+5% summon success rate per level', baseCost: 120 },
  { id: 'twilight_observatory_dm', name: 'Twilight Observatory', maxLevel: 10, description: 'An observatory that studies the desert stars through enchanted glass lenses, revealing hidden oases and phantom paths.', effectPerLevel: '+8% exploration range per level', baseCost: 300 },
  { id: 'phantom_chamber_dm', name: 'Phantom Chamber', maxLevel: 10, description: 'A sealed chamber where dust phantoms can be communicated with and bargains struck for their services.', effectPerLevel: '+10% bargain success per level', baseCost: 550 },
  { id: 'mirage_altar_dm', name: 'Mirage Altar', maxLevel: 10, description: 'An altar that amplifies mirage magic, making illusions stronger and allowing permanent enchantments to be placed on the desert.', effectPerLevel: '+12% illusion power per level', baseCost: 900 },
  { id: 'primal_shrine_dm', name: 'Primal Shrine', maxLevel: 10, description: 'The most sacred structure in the desert, a shrine to the primordial forces that created the sands themselves.', effectPerLevel: '+15% all mystical bonuses per level', baseCost: 2000 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 13: DM_ABILITIES — 22 Mirage Abilities
// ═══════════════════════════════════════════════════════════════════

export const DM_ABILITIES: readonly DMAbilityDef[] = [
  // Combat (6)
  { id: 'dm_ability_sand_blast', name: 'Sand Blast', type: 'combat', power: 20, cooldown: 3, description: 'Launch a concentrated blast of enchanted sand that deals damage and blinds enemies for a short duration.' },
  { id: 'dm_ability_phantom_strike', name: 'Phantom Strike', type: 'combat', power: 35, cooldown: 5, description: 'Channel spectral energy through your weapon, allowing it to strike through physical defenses and hit spectral enemies.' },
  { id: 'dm_ability_glass_rain', name: 'Glass Rain', type: 'combat', power: 50, cooldown: 8, description: 'Summon a rain of razor-sharp enchanted glass shards from the sky, damaging all enemies in a wide area.' },
  { id: 'dm_ability_ash_ember', name: 'Ash Ember', type: 'combat', power: 65, cooldown: 10, description: 'Fire a concentrated beam of spectral ash that burns through armor and leaves a lingering damage-over-time effect.' },
  { id: 'dm_ability_storm_lance', name: 'Storm Lance', type: 'combat', power: 80, cooldown: 12, description: 'Call down a bolt of concentrated lightning from a summoned storm cloud, dealing devastating electrical damage to a single target.' },
  { id: 'dm_ability_desert_fury', name: 'Desert Fury', type: 'combat', power: 100, cooldown: 20, description: 'Unleash the full fury of the desert, combining sandstorm, lightning, and spectral energy into a single devastating area attack.' },

  // Exploration (6)
  { id: 'dm_ability_sand_sight', name: 'Sand Sight', type: 'exploration', power: 15, cooldown: 5, description: 'Extend your senses through the desert sand, revealing hidden objects, phantom paths, and buried treasures nearby.' },
  { id: 'dm_ability_mirage_map', name: 'Mirage Map', type: 'exploration', power: 25, cooldown: 8, description: 'Create an illusory map that shows the layout of the surrounding desert, including hidden oases and phantom territories.' },
  { id: 'dm_ability_phantom_path', name: 'Phantom Path', type: 'exploration', power: 30, cooldown: 10, description: 'Reveal a hidden path through the dunes that only the spirits can see, allowing safe passage through dangerous areas.' },
  { id: 'dm_ability_wind_trace', name: 'Wind Trace', type: 'exploration', power: 40, cooldown: 12, description: 'Follow the ancient wind currents to find your way back to any previously visited oasis or location in the desert.' },
  { id: 'dm_ability_glass_lens', name: 'Glass Lens', type: 'exploration', power: 55, cooldown: 15, description: 'Peer through a lens of enchanted glass that reveals the true nature of mirages, illusions, and hidden objects.' },
  { id: 'dm_ability_desert_eye', name: 'Desert Eye', type: 'exploration', power: 70, cooldown: 20, description: 'Project your consciousness into the sky above the desert, gaining a birds-eye view of everything within a ten-mile radius.' },

  // Survival (5)
  { id: 'dm_ability_sand_shield', name: 'Sand Shield', type: 'survival', power: 20, cooldown: 6, description: 'Raise a wall of enchanted sand that absorbs incoming damage and gradually repairs itself from the surrounding desert.' },
  { id: 'dm_ability_mirage_hide', name: 'Mirage Hide', type: 'survival', power: 35, cooldown: 8, description: 'Wrap yourself in a mirage disguise that makes you invisible to enemies and hostile dust phantoms for a limited time.' },
  { id: 'dm_ability_glass_armor', name: 'Glass Armor', type: 'survival', power: 50, cooldown: 12, description: 'Encase yourself in a suit of enchanted glass armor that reflects a portion of incoming damage back at attackers.' },
  { id: 'dm_ability_ash_shroud', name: 'Ash Shroud', type: 'survival', power: 65, cooldown: 15, description: 'Surround yourself with a cloud of spectral ash that absorbs magic attacks and makes it impossible for enemies to target you.' },
  { id: 'dm_ability_storm_sanctuary', name: 'Storm Sanctuary', type: 'survival', power: 80, cooldown: 25, description: 'Create a pocket of calm within a summoned storm, providing complete protection from all desert hazards for a brief time.' },

  // Mystic (5)
  { id: 'dm_ability_phantom_summon', name: 'Phantom Summon', type: 'mystic', power: 25, cooldown: 10, description: 'Summon a random dust phantom to fight alongside you. The phantom strength depends on your mystic power level.' },
  { id: 'dm_ability_mirage_craft', name: 'Mirage Craft', type: 'mystic', power: 40, cooldown: 15, description: 'Craft a temporary mirage object that has physical substance for a limited duration, such as a bridge, ladder, or shelter.' },
  { id: 'dm_ability_sand_prophecy', name: 'Sand Prophecy', type: 'mystic', power: 55, cooldown: 20, description: 'Read the patterns in the sand to predict upcoming desert events, revealing enemy positions and incoming storms.' },
  { id: 'dm_ability_ritual_binding', name: 'Ritual Binding', type: 'mystic', power: 70, cooldown: 30, description: 'Perform an ancient binding ritual that permanently strengthens a collected dust phantom, increasing its power and loyalty.' },
  { id: 'dm_ability_reality_weave', name: 'Reality Weave', type: 'mystic', power: 100, cooldown: 60, description: 'The ultimate mystic ability: temporarily rewrite reality in a small area, turning desert into oasis or enemies into allies.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 14: DM_ACHIEVEMENTS — 18 Achievements
// ═══════════════════════════════════════════════════════════════════

export const DM_ACHIEVEMENTS: readonly DMAchievementDef[] = [
  { id: 'dm_ach_first_phantom', name: 'First Contact', description: 'Summon your first dust phantom from the shifting sands.', condition: 'Summon 1 phantom', reward: '+50 mirage power' },
  { id: 'dm_ach_collector_5', name: 'Phantom Collector', description: 'Build a small collection of five dust phantoms from across the desert.', condition: 'Collect 5 phantoms', reward: '+100 mirage power' },
  { id: 'dm_ach_collector_15', name: 'Spirit Herder', description: 'Amass fifteen phantom companions from various species and rarity tiers.', condition: 'Collect 15 phantoms', reward: '+300 mirage power' },
  { id: 'dm_ach_collector_35', name: 'Phantom Lord', description: 'Complete the entire phantom collection, gathering all thirty-five dust phantoms.', condition: 'Collect 35 phantoms', reward: '+1000 mirage power' },
  { id: 'dm_ach_oasis_explorer', name: 'Oasis Seeker', description: 'Discover three hidden oases scattered across the mirage desert.', condition: 'Discover 3 oases', reward: '+75 mirage power' },
  { id: 'dm_ach_all_oases', name: 'Oasis Master', description: 'Locate and catalog every oasis in the Dust Mirage desert.', condition: 'Discover 8 oases', reward: '+500 mirage power' },
  { id: 'dm_ach_sand_shaper_10', name: 'Sand Sculptor', description: 'Shape ten sand formations into useful structures and buildings.', condition: 'Build 10 structures total', reward: '+80 mirage power' },
  { id: 'dm_ach_sand_shaper_25', name: 'Desert Architect', description: 'Build all twenty-five possible structures across the oasis network.', condition: 'Build 25 structures total', reward: '+600 mirage power' },
  { id: 'dm_ach_structure_max', name: 'Master Builder', description: 'Upgrade any structure to its maximum level of ten.', condition: 'Reach level 10 on any structure', reward: '+200 mirage power' },
  { id: 'dm_ach_first_artifact', name: 'Relic Hunter', description: 'Activate your first legendary artifact from the desert depths.', condition: 'Activate 1 artifact', reward: '+100 mirage power' },
  { id: 'dm_ach_artifact_5', name: 'Artifact Collector', description: 'Gather five legendary artifacts from the buried ruins of the desert.', condition: 'Activate 5 artifacts', reward: '+400 mirage power' },
  { id: 'dm_ach_artifact_15', name: 'Curator of Wonders', description: 'Assemble the complete collection of fifteen legendary desert artifacts.', condition: 'Activate 15 artifacts', reward: '+1500 mirage power' },
  { id: 'dm_ach_event_survivor', name: 'Event Survivor', description: 'Survive five random desert events without losing any phantoms.', condition: 'Survive 5 events', reward: '+120 mirage power' },
  { id: 'dm_ach_event_12', name: 'Desert Veteran', description: 'Experience every type of desert event the mirage has to offer.', condition: 'Experience 12 events', reward: '+500 mirage power' },
  { id: 'dm_ach_storm_survive', name: 'Storm Rider', description: 'Survive three major sandstorms in a single desert expedition.', condition: 'Survive 3 storms', reward: '+150 mirage power' },
  { id: 'dm_ach_material_30', name: 'Sand Alchemist', description: 'Collect one of every type of enchanted material available in the desert.', condition: 'Collect 30 different materials', reward: '+350 mirage power' },
  { id: 'dm_ach_legendary_phantom', name: 'Legendary Summoner', description: 'Successfully summon a legendary dust phantom from the deepest desert.', condition: 'Collect 1 legendary phantom', reward: '+500 mirage power' },
  { id: 'dm_ach_all_species', name: 'Species Master', description: 'Collect at least one phantom from every species category in the desert.', condition: 'Collect 1 of each species', reward: '+250 mirage power' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 15: DM_TITLES — 8 Progression Titles
// ═══════════════════════════════════════════════════════════════════

export const DM_TITLES: readonly DMTitleDef[] = [
  { id: 'dm_title_dust_walker', name: 'Dust Walker', requirement: 'Begin your journey into the mirage desert.', bonus: '+5% movement speed' },
  { id: 'dm_title_sand_seeker', name: 'Sand Seeker', requirement: 'Discover 2 oases and collect 5 phantoms.', bonus: '+10% mirage detection' },
  { id: 'dm_title_phantom_friend', name: 'Phantom Friend', requirement: 'Collect 10 phantoms and build 5 structures.', bonus: '+8% phantom power' },
  { id: 'dm_title_mirage_weaver', name: 'Mirage Weaver', requirement: 'Activate 3 artifacts and discover 5 oases.', bonus: '+12% illusion power' },
  { id: 'dm_title_dust_sovereign', name: 'Dust Sovereign', requirement: 'Collect 20 phantoms and activate 8 artifacts.', bonus: '+15% all stats' },
  { id: 'dm_title_storm_caller', name: 'Storm Caller', requirement: 'Survive 10 events and build 15 structures.', bonus: '+18% combat power' },
  { id: 'dm_title_sand_emperor', name: 'Sand Emperor', requirement: 'Collect 30 phantoms and build 20 structures.', bonus: '+22% all stats' },
  { id: 'dm_title_mirage_emperor', name: 'Mirage Emperor', requirement: 'Complete the full phantom collection and activate all artifacts.', bonus: '+30% all stats' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 16: DM_ARTIFACTS — 15 Legendary Artifacts
// ═══════════════════════════════════════════════════════════════════

export const DM_ARTIFACTS: readonly DMArtifactDef[] = [
  { id: 'dm_art_lamp_of_mirages', name: 'Lamp of Mirages', description: 'An ancient lamp that produces perfect illusions indistinguishable from reality. Rubbing it summons a mirage djinn that can reshape the landscape.', power: 50, lore: 'The Lamp of Mirages was forged by the Grand Vizier himself in the First Age, when the boundary between reality and illusion was thin enough to walk through.' },
  { id: 'dm_art_crown_of_dust', name: 'Crown of Dust', description: 'A crown woven from enchanted desert sand that never settles. It grants the wearer command over all sand wraiths within earshot.', power: 45, lore: 'The Crown of Dust was worn by the last Sand King before his kingdom was swallowed by the desert. It still carries his royal authority.' },
  { id: 'dm_art_storm_globe', name: 'Storm Globe', description: 'A glass sphere containing a perpetual miniature sandstorm. Shaking it releases a powerful wind that can knock enemies off their feet.', power: 40, lore: 'The Storm Globe was created when the first Hurricane Genie was trapped by an ingenious desert wizard using a bottle made from the sky itself.' },
  { id: 'dm_art_glass_blade', name: 'Glass Blade', description: 'A sword made from a single piece of enchanted desert glass. It cuts through any material and reflects magic back at the caster.', power: 55, lore: 'The Glass Blade was forged in the heart of the Glass Desert by a master smith who sacrificed his sight to achieve perfection.' },
  { id: 'dm_art_ash_urn', name: 'Ash Urn of Ages', description: 'An urn containing ashes from every fire that has ever burned in the desert. Opening it briefly summons the ghosts of the ancient dead.', power: 48, lore: 'The Ash Urn was created by the Ash Primordial as a record of every flame it has ever witnessed, from cooking fires to burning cities.' },
  { id: 'dm_art_mirage_cloak', name: 'Mirage Cloak', description: 'A cloak that renders the wearer completely invisible by bending light around them. It also protects from all illusion-based attacks.', power: 42, lore: 'The Mirage Cloak was a gift from the Mirage Fox to a human child who solved its greatest riddle. The child grew up to become the greatest desert explorer.' },
  { id: 'dm_art_sand_glasses', name: 'Sand Seer Glasses', description: 'Enchanted spectacles that reveal hidden phantom paths, buried treasures, and the true forms of mirage disguises.', power: 35, lore: 'Crafted by the Twilight Observatory from lenses ground by a thousand years of desert wind, these glasses can see through any deception.' },
  { id: 'dm_art_dune_compass', name: 'Dune Compass', description: 'A compass that always points toward the nearest oasis, even if it is hidden by a mirage or buried beneath the sand.', power: 30, lore: 'The Dune Compass was given to the first desert nomads by the Sand Primordial itself, so they would never die of thirst.' },
  { id: 'dm_art_twilight_scepter', name: 'Twilight Scepter', description: 'A scepter that glows with purple light at dusk and dawn. It amplifies all twilight-based abilities and strengthens dune haunts.', power: 52, lore: 'The Twilight Scepter was the badge of office of the Dune Lord, passed from one haunt to another across millennia.' },
  { id: 'dm_art_crystal_titan_shard', name: 'Titan Crystal Shard', description: 'A fragment of the Crystal Titan itself. It grants immense defensive power and slowly regenerates the health of nearby allies.', power: 58, lore: 'When the Crystal Titan was first shattered by a cataclysmic sandstorm, these shards scattered across the desert. Each one retains a fragment of its power.' },
  { id: 'dm_art_primordial_hourglass', name: 'Primordial Hourglass', description: 'An hourglass filled with sand from the beginning of time. Turning it over briefly slows time for everyone except the user.', power: 65, lore: 'The Primordial Hourglass was created by the Sand Primordial to measure the life of the desert. When the last grain falls, the desert will end.' },
  { id: 'dm_art_mirage_sphere', name: 'Mirage Sphere', description: 'A perfect sphere of enchanted glass that stores and projects three-dimensional mirages. It can create entire false landscapes.', power: 44, lore: 'The Mirage Sphere was the pride of the Djinn Architect, who used it to design the greatest illusory city ever conceived.' },
  { id: 'dm_art_ash_crown', name: 'Ash Crown', description: 'A crown of smoldering ash that burns with spectral fire. It grants the wearer power over all ash specters and resistance to fire.', power: 50, lore: 'The Ash Crown was forged in the volcanic eruption that created the desert, tempered by the heat of a dying world.' },
  { id: 'dm_art_storm_ring', name: 'Storm Ring', description: 'A ring that crackles with captured lightning. It allows the wearer to summon small storms and grants immunity to electrical damage.', power: 46, lore: 'The Storm Ring was given to a mortal by the Eye of Storm as payment for a debt that can never be repaid.' },
  { id: 'dm_art_eternal_dust', name: 'Vial of Eternal Dust', description: 'A vial containing dust that never settles and cannot be destroyed. A single grain can power a mirage for a century.', power: 70, lore: 'The Eternal Dust was what remained after the first Sand Wraith completed its final journey across the desert, dissolving into particles that will exist forever.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 17: DM_EVENTS — 12 Random Desert Events
// ═══════════════════════════════════════════════════════════════════

export const DM_EVENTS: readonly DMEventDef[] = [
  { id: 'dm_event_sandstorm', name: 'Encroaching Sandstorm', description: 'A massive sandstorm approaches from the west, reducing visibility to zero and threatening to bury unprotected structures.', effect: 'All exploration actions fail for 3 turns. Sand Barrier provides protection.', rarity: 'common' },
  { id: 'dm_event_phantom_parade', name: 'Phantom Parade', description: 'A procession of spectral figures marches across the desert under the light of the full moon, each one carrying a gift for those who watch respectfully.', effect: 'Receive 1-3 random enchanted materials from the parade.', rarity: 'uncommon' },
  { id: 'dm_event_mirage_city', name: 'Mirage City Appears', description: 'A magnificent city materializes on the horizon, shimmering with impossible beauty. It vanishes at sunset, but not before leaving behind treasure.', effect: 'Discover 1 hidden oasis and gain bonus mirage power.', rarity: 'rare' },
  { id: 'dm_event_glass_rain', name: 'Glass Rain', description: 'The sky turns green and shards of enchanted glass begin falling from above, both a danger and an opportunity for resourceful explorers.', effect: 'Lose some HP but gain valuable glass crafting materials.', rarity: 'uncommon' },
  { id: 'dm_event_ash_storm', name: 'Ash Storm', description: 'A supernatural storm of spectral ash sweeps across the desert, awakening dormant ash specters and blinding all living creatures.', effect: 'All ash specter enemies become aggressive. Ash Shroud provides immunity.', rarity: 'rare' },
  { id: 'dm_event_dune_shift', name: 'Great Dune Shift', description: 'The desert itself rearranges as massive dunes migrate overnight, revealing previously buried ruins and hiding known landmarks.', effect: 'Random oases may become undiscovered. New phantom paths are revealed.', rarity: 'common' },
  { id: 'dm_event_lightning_feast', name: 'Lightning Feast', description: 'A spectacular electrical storm lights up the desert sky, charging all enchanted materials and structures with residual energy.', effect: 'All structures gain temporary +1 level bonus for 5 turns.', rarity: 'uncommon' },
  { id: 'dm_event_spirit_bazaar', name: 'Spirit Bazaar', description: 'A marketplace appears between the dunes, staffed by ghostly merchants selling rare materials and artifacts at steep discounts.', effect: 'Access exclusive trades for rare materials at 50% cost.', rarity: 'epic' },
  { id: 'dm_event_time_mirage', name: 'Time Mirage', description: 'A temporal anomaly creates a mirage of the desert as it existed a thousand years ago, complete with living inhabitants and bustling cities.', effect: 'Gain unique materials and lore only available from the past era.', rarity: 'epic' },
  { id: 'dm_event_phantom_war', name: 'Phantom War', description: 'Two rival phantom armies clash across the desert, their spectral battle threatening to engulf any settlements in their path.', effect: 'Defend your structures from phantom armies. Victory grants rare phantom rewards.', rarity: 'rare' },
  { id: 'dm_event_void_sand', name: 'Void Sand Awakening', description: 'The deepest sands of the desert begin to glow with an otherworldly purple light as the Void Sands stir from their ancient slumber.', effect: 'Legendary phantom encounters become available for a limited time.', rarity: 'legendary' },
  { id: 'dm_event_primordial_dream', name: 'Primordial Dream', description: 'The Sand Primordial dreams, and every creature in the desert shares the dream: a vision of the world before the desert existed.', effect: 'All phantoms gain temporary power boost. Gain the Mirage Emperor title progress.', rarity: 'legendary' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18: DM_CRAFTING_RECIPES — Material crafting combinations
// ═══════════════════════════════════════════════════════════════════

export const DM_CRAFTING_RECIPES: readonly {
  id: string
  name: string
  inputs: { materialId: string; quantity: number }[]
  output: { materialId: string; quantity: number }
  description: string
  requiredLevel: number
}[] = [
  {
    id: 'dm_recipe_glass_shard',
    name: 'Glass Shard Synthesis',
    inputs: [{ materialId: 'dm_enchanted_sand', quantity: 5 }, { materialId: 'dm_wind_blade', quantity: 2 }],
    output: { materialId: 'dm_phantom_glass', quantity: 3 },
    description: 'Fuse enchanted sand with wind blades under intense heat to create phantom glass shards used in basic crafting.',
    requiredLevel: 1,
  },
  {
    id: 'dm_recipe_mirage_thread',
    name: 'Mirage Thread Spinning',
    inputs: [{ materialId: 'dm_mirage_silk', quantity: 3 }, { materialId: 'dm_dune_resin', quantity: 2 }],
    output: { materialId: 'dm_mirage_fiber', quantity: 2 },
    description: 'Spin mirage silk and dune resin together to create ultra-fine mirage fiber for enchanted garments.',
    requiredLevel: 3,
  },
  {
    id: 'dm_recipe_storm_crystal',
    name: 'Storm Crystal Formation',
    inputs: [{ materialId: 'dm_storm_glass_shard', quantity: 3 }, { materialId: 'dm_wind_blade', quantity: 5 }],
    output: { materialId: 'dm_storm_genie_bottle', quantity: 1 },
    description: 'Combine storm glass shards and wind blades to capture the essence of a minor desert storm in a usable bottle.',
    requiredLevel: 5,
  },
  {
    id: 'dm_recipe_illusion_lens',
    name: 'Illusion Lens Crafting',
    inputs: [{ materialId: 'dm_illusion_quartz', quantity: 4 }, { materialId: 'dm_phantom_glass', quantity: 3 }],
    output: { materialId: 'dm_sand_glasses', quantity: 1 },
    description: 'Grind illusion quartz and phantom glass into a pair of enchanted spectacles that reveal hidden phantom paths.',
    requiredLevel: 8,
  },
  {
    id: 'dm_recipe_ash_gem',
    name: 'Ash Gem Refinement',
    inputs: [{ materialId: 'dm_ash_crystal', quantity: 5 }, { materialId: 'dm_dust_salt', quantity: 3 }],
    output: { materialId: 'dm_ash_crown', quantity: 1 },
    description: 'Refine ash crystals with purifying dust salt to create a crown of smoldering spectral fire.',
    requiredLevel: 10,
  },
  {
    id: 'dm_recipe_glass_dragon_scale',
    name: 'Glass Dragon Scale Forging',
    inputs: [{ materialId: 'dm_prism_core', quantity: 2 }, { materialId: 'dm_twilight_obsidian', quantity: 3 }],
    output: { materialId: 'dm_glass_dragon_scale', quantity: 1 },
    description: 'Forge a replica glass dragon scale using prism cores and twilight obsidian in the Mirage Crucible.',
    requiredLevel: 12,
  },
  {
    id: 'dm_recipe_primordial_sand',
    name: 'Primordial Sand Distillation',
    inputs: [{ materialId: 'dm_eternal_sand_vial', quantity: 1 }, { materialId: 'dm_mirage_pearl', quantity: 2 }],
    output: { materialId: 'dm_primordial_sand', quantity: 1 },
    description: 'Distill eternal sand with the essence of mirage pearls to create a grain of primordial sand from the dawn of time.',
    requiredLevel: 15,
  },
  {
    id: 'dm_recipe_eternal_dust',
    name: 'Eternal Dust Synthesis',
    inputs: [{ materialId: 'dm_primordial_sand', quantity: 1 }, { materialId: 'dm_specter_crown', quantity: 1 }],
    output: { materialId: 'dm_eternal_dust', quantity: 1 },
    description: 'The ultimate crafting recipe: combine primordial sand with a specter crown to create the legendary Eternal Dust.',
    requiredLevel: 18,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18B: DM_ENCOUNTER_TABLES — Phantom encounter data
// ═══════════════════════════════════════════════════════════════════

export const DM_ENCOUNTER_TABLES: readonly {
  id: string
  name: string
  description: string
  difficultyTier: string
  phantomIds: string[]
  rewards: { materialId: string; quantity: number; chance: number }[]
  minLevel: number
}[] = [
  {
    id: 'dm_enc_shimmering_flats',
    name: 'Shimmering Flats Patrol',
    description: 'A patrol through the gently shimmering flats where common dust phantoms wander in the early morning mist.',
    difficultyTier: 'shimmering_flats',
    phantomIds: ['dm_common_dust_wisp', 'dm_common_grit_sprite', 'dm_common_glass_imp', 'dm_common_haze_moth', 'dm_common_cinder_trace', 'dm_common_breeze_elf', 'dm_common_dusk_shade'],
    rewards: [
      { materialId: 'dm_enchanted_sand', quantity: 3, chance: 0.8 },
      { materialId: 'dm_phantom_glass', quantity: 1, chance: 0.5 },
      { materialId: 'dm_dune_resin', quantity: 2, chance: 0.3 },
    ],
    minLevel: 1,
  },
  {
    id: 'dm_enc_whispering_dunes',
    name: 'Whispering Dunes Expedition',
    description: 'An expedition into the dunes that whisper secrets of the ancient past, where uncommon phantoms lurk.',
    difficultyTier: 'whispering_dunes',
    phantomIds: ['dm_uncommon_sand_lurker', 'dm_uncommon_whirl_mage', 'dm_uncommon_crystal_guard', 'dm_uncommon_mirage_fox', 'dm_uncommon_cinder_wraith', 'dm_uncommon_tempest_scout', 'dm_uncommon_sand_stalker'],
    rewards: [
      { materialId: 'dm_illusion_quartz', quantity: 2, chance: 0.6 },
      { materialId: 'dm_storm_glass_shard', quantity: 1, chance: 0.4 },
      { materialId: 'dm_dune_amber', quantity: 1, chance: 0.3 },
    ],
    minLevel: 3,
  },
  {
    id: 'dm_enc_glass_wastes',
    name: 'Glass Wastes Trek',
    description: 'A dangerous trek through the razor-sharp Glass Wastes where rare phantoms have been sighted among the crystalline dunes.',
    difficultyTier: 'glass_wastes',
    phantomIds: ['dm_rare_sand_pharaoh', 'dm_rare_dust_titan', 'dm_rare_glass_dragon', 'dm_rare_mirage_sphinx', 'dm_rare_ash_guardian', 'dm_rare_storm_colossus', 'dm_rare_dune_specter'],
    rewards: [
      { materialId: 'dm_prism_core', quantity: 1, chance: 0.5 },
      { materialId: 'dm_twilight_obsidian', quantity: 1, chance: 0.4 },
      { materialId: 'dm_mirage_pearl', quantity: 1, chance: 0.3 },
    ],
    minLevel: 8,
  },
  {
    id: 'dm_enc_twilight_desert',
    name: 'Twilight Desert Descent',
    description: 'A descent into the Twilight Desert where reality bends and epic phantoms hold dominion over the shifting sands.',
    difficultyTier: 'twilight_desert',
    phantomIds: ['dm_epic_wraith_sovereign', 'dm_epic_devil_of_ashes', 'dm_epic_prism_golem_king', 'dm_epic_djinn_architect', 'dm_epic_specter_emperor', 'dm_epic_hurricane_genie', 'dm_epic_haunt_eternal'],
    rewards: [
      { materialId: 'dm_eternal_sand_vial', quantity: 1, chance: 0.4 },
      { materialId: 'dm_specter_crown', quantity: 1, chance: 0.3 },
      { materialId: 'dm_glass_dragon_scale', quantity: 1, chance: 0.2 },
    ],
    minLevel: 15,
  },
  {
    id: 'dm_enc_void_sands',
    name: 'Void Sands Incursion',
    description: 'The most dangerous expedition possible: an incursion into the Void Sands where legendary phantoms rule supreme.',
    difficultyTier: 'void_sands',
    phantomIds: ['dm_legendary_sand_primordial', 'dm_legendary_ultimate_devil', 'dm_legendary_crystal_titan', 'dm_legendary_grand_vizier', 'dm_legendary_ash_primordial', 'dm_legendary_eye_of_storm', 'dm_legendary_dune_lord'],
    rewards: [
      { materialId: 'dm_primordial_sand', quantity: 1, chance: 0.3 },
      { materialId: 'dm_grand_vizier_lamp', quantity: 1, chance: 0.1 },
      { materialId: 'dm_eternal_dust', quantity: 1, chance: 0.05 },
    ],
    minLevel: 25,
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18C: DM_OASIS_RESOURCES — Detailed oasis resource data
// ═══════════════════════════════════════════════════════════════════

export const DM_OASIS_RESOURCES: readonly {
  id: string
  name: string
  description: string
  rarity: DMRarity
  oasisId: string
  gatherYield: number
}[] = [
  { id: 'dm_res_phantom_water', name: 'Phantom Water', description: 'Ethereal water that glows faintly and grants temporary spectral vision when consumed.', rarity: 'common', oasisId: 'dm_oasis_phantom_springs', gatherYield: 5 },
  { id: 'dm_res_healing_sand', name: 'Healing Sand', description: 'Sand infused with restorative energy that accelerates wound healing when applied to injuries.', rarity: 'uncommon', oasisId: 'dm_oasis_phantom_springs', gatherYield: 3 },
  { id: 'dm_res_wisp_crystal', name: 'Wisp Crystal', description: 'A tiny crystal containing the essence of a dust wisp. Used in phantom summoning rituals.', rarity: 'rare', oasisId: 'dm_oasis_phantom_springs', gatherYield: 1 },
  { id: 'dm_res_shimmer_moss', name: 'Shimmer Moss', description: 'Bioluminescent moss that grows around the Shimmer Basin and produces a calming fragrance.', rarity: 'common', oasisId: 'dm_oasis_shimmer_basin', gatherYield: 6 },
  { id: 'dm_res_mirror_stone', name: 'Mirror Stone', description: 'A perfectly smooth stone that reflects not what is, but what could be. Used in mirage crafting.', rarity: 'uncommon', oasisId: 'dm_oasis_shimmer_basin', gatherYield: 3 },
  { id: 'dm_res_dust_pearl', name: 'Dust Pearl', description: 'A pearl formed from compressed desert dust under extreme magical pressure over centuries.', rarity: 'rare', oasisId: 'dm_oasis_shimmer_basin', gatherYield: 1 },
  { id: 'dm_res_storm_glass', name: 'Storm Glass', description: 'Glass formed when lightning strikes the sand at the exact center of a dust devil vortex.', rarity: 'uncommon', oasisId: 'dm_oasis_dust_devils_eye', gatherYield: 4 },
  { id: 'dm_res_wind_essence', name: 'Wind Essence', description: 'The concentrated essence of desert wind, captured in a fragile glass container.', rarity: 'rare', oasisId: 'dm_oasis_dust_devils_eye', gatherYield: 2 },
  { id: 'dm_res_turbine_gem', name: 'Turbine Gem', description: 'A gemstone that spins perpetually when exposed to moving air, generating small amounts of electricity.', rarity: 'epic', oasisId: 'dm_oasis_dust_devils_eye', gatherYield: 1 },
  { id: 'dm_res_pure_glass', name: 'Pure Desert Glass', description: 'Glass of exceptional clarity and purity, formed naturally by ancient lightning strikes on pure quartz sand.', rarity: 'common', oasisId: 'dm_oasis_glass_desert', gatherYield: 8 },
  { id: 'dm_res_prism_shard', name: 'Prism Shard', description: 'A shard of enchanted glass that splits light into perfect rainbow spectra. Essential for glass golem construction.', rarity: 'uncommon', oasisId: 'dm_oasis_glass_desert', gatherYield: 3 },
  { id: 'dm_res_refraction_dust', name: 'Refraction Dust', description: 'Fine crystalline dust that bends light around objects, creating natural invisibility fields.', rarity: 'rare', oasisId: 'dm_oasis_glass_desert', gatherYield: 2 },
  { id: 'dm_res_dusk_water', name: 'Dusk Water', description: 'Water that turns deep purple at twilight and carries a faint floral scent. Used in twilight enchantments.', rarity: 'uncommon', oasisId: 'dm_oasis_twilight_pools', gatherYield: 5 },
  { id: 'dm_res_shadow_lotus', name: 'Shadow Lotus', description: 'A flower that grows only in the shadows between dunes. Its petals are black and absorb all light.', rarity: 'rare', oasisId: 'dm_oasis_twilight_pools', gatherYield: 2 },
  { id: 'dm_res_violet_resin', name: 'Violet Resin', description: 'Purple resin harvested from ancient trees that grow only at the Twilight Pools. Used in illusion potions.', rarity: 'epic', oasisId: 'dm_oasis_twilight_pools', gatherYield: 1 },
  { id: 'dm_res_royal_sand', name: 'Royal Sand', description: 'Gold-colored sand found in the ruins of the Sand King palace. It hums with ancient royal authority.', rarity: 'rare', oasisId: 'dm_oasis_sand_kings_rest', gatherYield: 3 },
  { id: 'dm_res_crown_gem', name: 'Crown Gem', description: 'A gemstone that once adorned the crown of an ancient desert monarch. It still carries regal enchantments.', rarity: 'epic', oasisId: 'dm_oasis_sand_kings_rest', gatherYield: 1 },
  { id: 'dm_res_scepter_crystal', name: 'Scepter Crystal', description: 'A crystal shaped like a miniature scepter that grants temporary command over minor dust phantoms.', rarity: 'epic', oasisId: 'dm_oasis_sand_kings_rest', gatherYield: 1 },
  { id: 'dm_res_illusion_bloom', name: 'Illusion Bloom', description: 'A flower that exists in multiple states simultaneously, appearing as different species to different observers.', rarity: 'rare', oasisId: 'dm_oasis_mirage_garden', gatherYield: 3 },
  { id: 'dm_res_dream_pollen', name: 'Dream Pollen', description: 'Pollen that induces vivid prophetic dreams when inhaled. Used by desert shamans for divination rituals.', rarity: 'epic', oasisId: 'dm_oasis_mirage_garden', gatherYield: 2 },
  { id: 'dm_res_reality_sap', name: 'Reality Sap', description: 'Sap from the World Tree of the mirage garden that can make temporary illusions permanently real.', rarity: 'legendary', oasisId: 'dm_oasis_mirage_garden', gatherYield: 1 },
  { id: 'dm_res_eternal_sand', name: 'Eternal Sand', description: 'Sand that never erodes, never blows away, and never loses its magical charge. The foundation of all permanent mirages.', rarity: 'epic', oasisId: 'dm_oasis_eternal_mirage', gatherYield: 2 },
  { id: 'dm_res_genesis_crystal', name: 'Genesis Crystal', description: 'A crystal containing the moment of the desert creation. Looking into it shows the birth of all dust phantoms.', rarity: 'legendary', oasisId: 'dm_oasis_eternal_mirage', gatherYield: 1 },
  { id: 'dm_res_mirage_heart', name: 'Mirage Heart', description: 'The crystallized heart of a mirage djinn, the rarest and most valuable substance in the entire desert.', rarity: 'legendary', oasisId: 'dm_oasis_eternal_mirage', gatherYield: 1 },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18D: DM_TITLE_THRESHOLDS — Title progression config
// ═══════════════════════════════════════════════════════════════════

export const DM_TITLE_THRESHOLDS: readonly {
  titleId: string
  titleName: string
  minLevel: number
  bonusMultiplier: number
  color: string
  description: string
}[] = [
  { titleId: 'dm_title_dust_walker', titleName: 'Dust Walker', minLevel: 1, bonusMultiplier: 1.0, color: '#A0A0A0', description: 'A humble traveler taking their first steps into the shimmering desert.' },
  { titleId: 'dm_title_sand_seeker', titleName: 'Sand Seeker', minLevel: 3, bonusMultiplier: 1.1, color: '#DAA520', description: 'An explorer who has begun to unravel the secrets hidden beneath the dunes.' },
  { titleId: 'dm_title_phantom_friend', titleName: 'Phantom Friend', minLevel: 5, bonusMultiplier: 1.2, color: '#40E0D0', description: 'A trusted ally of the dust phantoms who has earned their respect and loyalty.' },
  { titleId: 'dm_title_mirage_weaver', titleName: 'Mirage Weaver', minLevel: 8, bonusMultiplier: 1.3, color: '#9370DB', description: 'A master of illusions who can create mirages indistinguishable from reality.' },
  { titleId: 'dm_title_dust_sovereign', titleName: 'Dust Sovereign', minLevel: 12, bonusMultiplier: 1.5, color: '#CD853F', description: 'A ruler of the desert sands who commands both the living and the spectral.' },
  { titleId: 'dm_title_storm_caller', titleName: 'Storm Caller', minLevel: 15, bonusMultiplier: 1.7, color: '#9370DB', description: 'A wielder of the desert tempest who can summon storms at will.' },
  { titleId: 'dm_title_sand_emperor', titleName: 'Sand Emperor', minLevel: 18, bonusMultiplier: 2.0, color: '#DAA520', description: 'The undisputed emperor of the shifting sands, master of all desert domains.' },
  { titleId: 'dm_title_mirage_emperor', titleName: 'Mirage Emperor', minLevel: 20, bonusMultiplier: 2.5, color: '#40E0D0', description: 'The supreme ruler of reality and illusion, the Mirage Emperor whose word reshapes the desert itself.' },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18E: DM_SANDBOX_CONFIG — Sandbox and progression config
// ═══════════════════════════════════════════════════════════════════

export const DM_SANDBOX_CONFIG: {
  maxInventorySize: number
  maxPhantomLevel: number
  baseSummonCost: number
  summonCostPerLevel: number
  structureUpgradeCostMultiplier: number
  eventCooldown: number
  autoSaveInterval: number
  phantomXpPerLevel: number
  phantomXpBase: number
  miragePowerPerPhantomLevel: number
} = {
  maxInventorySize: 200,
  maxPhantomLevel: 20,
  baseSummonCost: 10,
  summonCostPerLevel: 5,
  structureUpgradeCostMultiplier: 1.5,
  eventCooldown: 300,
  autoSaveInterval: 30000,
  phantomXpPerLevel: 100,
  phantomXpBase: 50,
  miragePowerPerPhantomLevel: 12,
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18F: DM_EVENT_WEIGHTS — Event probability configuration
// ═══════════════════════════════════════════════════════════════════

export const DM_EVENT_WEIGHTS: Record<
  DMEventRarity,
  { weight: number; color: string; minLevel: number }
> = {
  common: { weight: 40, color: '#A0A0A0', minLevel: 1 },
  uncommon: { weight: 30, color: '#2E8B57', minLevel: 3 },
  rare: { weight: 18, color: '#40E0D0', minLevel: 8 },
  epic: { weight: 9, color: '#CD853F', minLevel: 15 },
  legendary: { weight: 3, color: '#9370DB', minLevel: 25 },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18G: DM_STRUCTURE_UPGRADE_TABLE — Upgrade cost table
// ═══════════════════════════════════════════════════════════════════

export const DM_STRUCTURE_UPGRADE_TABLE: Record<
  string,
  { baseCost: number; costMultiplier: number; effectAtLevel: string[] }
> = {
  sand_tent_dm: {
    baseCost: 50,
    costMultiplier: 1.4,
    effectAtLevel: [
      '+5% sandstorm resistance',
      '+10% sandstorm resistance',
      '+15% sandstorm resistance',
      '+20% sandstorm resistance',
      '+25% sandstorm resistance',
      '+30% sandstorm resistance',
      '+35% sandstorm resistance',
      '+40% sandstorm resistance',
      '+45% sandstorm resistance',
      '+50% sandstorm resistance',
    ],
  },
  glass_watchtower_dm: {
    baseCost: 250,
    costMultiplier: 1.5,
    effectAtLevel: [
      '+8% detection range',
      '+16% detection range',
      '+24% detection range',
      '+32% detection range',
      '+40% detection range',
      '+48% detection range',
      '+56% detection range',
      '+64% detection range',
      '+72% detection range',
      '+80% detection range',
    ],
  },
  creation_anvil_dm: {
    baseCost: 1500,
    costMultiplier: 1.8,
    effectAtLevel: [
      '+12% legendary craft chance',
      '+24% legendary craft chance',
      '+36% legendary craft chance',
      '+48% legendary craft chance',
      '+60% legendary craft chance',
      '+72% legendary craft chance',
      '+84% legendary craft chance',
      '+96% legendary craft chance',
      '+108% legendary craft chance',
      '+120% legendary craft chance',
    ],
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 18H: DM_LORE_ENTRIES — Flavor lore for the desert world
// ═══════════════════════════════════════════════════════════════════

export const DM_LORE_ENTRIES: readonly {
  id: string
  title: string
  content: string
  category: 'creation' | 'phantom' | 'oasis' | 'artifact' | 'event' | 'prophecy'
  relatedIds: string[]
}[] = [
  {
    id: 'dm_lore_first_sand',
    title: 'The First Grain',
    content: 'Before the desert existed, there was only the void. The Sand Primordial reached into the void and withdrew a single grain of sand, the first grain ever to exist. That grain multiplied and spread until it covered the world. Every phantom, every oasis, every mirage is a descendant of that first grain.',
    category: 'creation',
    relatedIds: ['dm_legendary_sand_primordial'],
  },
  {
    id: 'dm_lore_mirage_birth',
    title: 'Birth of the Mirage',
    content: 'The first mirage appeared when the Sand Primordial dreamed for the first time. Its dream was so powerful that it leaked into reality, creating a shimmering image of water where none existed. Every mirage since has been an echo of that primordial dream.',
    category: 'creation',
    relatedIds: ['dm_legendary_grand_vizier'],
  },
  {
    id: 'dm_lore_glass_dragon',
    title: 'The Crystal Titan and the Dragon',
    content: 'The Crystal Titan was built to protect the desert from an invasion of shadow creatures from beyond the veil. Its final act was to forge the Glass Dragon from its own shattered body, ensuring that even in defeat, the desert would have a guardian of unimaginable power.',
    category: 'artifact',
    relatedIds: ['dm_legendary_crystal_titan', 'dm_rare_glass_dragon'],
  },
  {
    id: 'dm_lore_phantom_springs',
    title: 'Tears of the First Djinn',
    content: 'The Phantom Springs were created when the Grand Vizier wept after being trapped in the Lamp of Mirages. Its tears fell to the sand and became springs of spectral water that glow with ethereal blue light. Drinking from the springs grants temporary ghostly vision.',
    category: 'oasis',
    relatedIds: ['dm_oasis_phantom_springs', 'dm_art_lamp_of_mirages'],
  },
  {
    id: 'dm_lore_void_sands',
    title: 'The Void Beneath the Dunes',
    content: 'Beneath the deepest sands lies the Void, a place where reality has worn thin. The Void Sands are where the desert floor meets this abyss, and the boundary between what is real and what is illusion dissolves entirely. Only the most powerful phantoms can survive here.',
    category: 'prophecy',
    relatedIds: ['dm_event_void_sand'],
  },
  {
    id: 'dm_lore_ash_primordial',
    title: 'The Fire That Forged the Desert',
    content: 'Before the sand there was fire. The Ash Primordial remembers a world of flame and destruction that preceded the desert. When the last fire finally died, its ashes became the foundation upon which the Sand Primordial built the dunes. The ash remembers what the sand has forgotten.',
    category: 'creation',
    relatedIds: ['dm_legendary_ash_primordial'],
  },
  {
    id: 'dm_lore_eternal_mirage',
    title: 'The Last Oasis',
    content: 'The Eternal Mirage is said to be the last place in the world where the boundary between reality and illusion has completely dissolved. Those who reach it must choose: remain in reality forever, or step into the mirage and become a phantom themselves. Neither choice can be undone.',
    category: 'oasis',
    relatedIds: ['dm_oasis_eternal_mirage'],
  },
  {
    id: 'dm_lore_storm_genie_trapped',
    title: 'The Captured Tempest',
    content: 'The Eye of Storm was once a mortal who angered a Storm Genie. As punishment, the genie transformed the mortal into a living storm, trapping them between calm and chaos for eternity. The eye at the storm center is all that remains of the original person, watching the world through a wall of wind.',
    category: 'phantom',
    relatedIds: ['dm_legendary_eye_of_storm'],
  },
  {
    id: 'dm_lore_dune_lord_dreams',
    title: 'The Dreamer of Dunes',
    content: 'Every night, the Dune Lord walks between the sleeping camps of desert travelers, collecting their dreams and weaving them into the fabric of the mirage realm. If a dream is particularly beautiful or terrible, the Dune Lord may recreate it as a permanent mirage that other travelers will encounter.',
    category: 'phantom',
    relatedIds: ['dm_legendary_dune_lord', 'dm_event_primordial_dream'],
  },
  {
    id: 'dm_lore_primordial_hourglass',
    title: 'The Measure of All Things',
    content: 'The Primordial Hourglass was created by the Sand Primordial not to measure time, but to measure the life of the desert itself. Each grain represents one thousand years of desert existence. When the last grain falls, the desert will dissolve into the void from which it came.',
    category: 'artifact',
    relatedIds: ['dm_art_primordial_hourglass'],
  },
]

// ═══════════════════════════════════════════════════════════════════
// SECTION 18I: DM_SPECIES_LORE — Per-species deep lore entries
// ═══════════════════════════════════════════════════════════════════

export const DM_SPECIES_LORE: Record<
  DMSpecies,
  {
    origin: string
    behavior: string
    weakness: string
    bondingRitual: string
    legendaryForm: string
  }
> = {
  sand_wraith: {
    origin: 'Born from the collective memory of the desert sand itself, sand wraiths are the oldest phantom species.',
    behavior: 'Sand wraiths are solitary and territorial. They mark their territory by rearranging dunes into spiraling patterns.',
    weakness: 'Sand wraiths are vulnerable to water magic, which causes their spectral forms to destabilize and dissipate.',
    bondingRitual: 'To bond with a sand wraith, one must stand barefoot on the sand at noon and speak the Wraith Oath in the old tongue.',
    legendaryForm: 'The Sand Primordial is the ultimate form of the sand wraith, the desert itself given consciousness.',
  },
  dust_devil: {
    origin: 'Dust devils are spontaneous manifestations of desert wind energy that have gained sentience through accumulated magical charge.',
    behavior: 'Dust devils are chaotic and playful, often racing each other across the flats and playing pranks on travelers.',
    weakness: 'Dust devils dissipate in completely still air. Enclosing them in an airtight space neutralizes their power entirely.',
    bondingRitual: 'Catch a dust devil in a jar of enchanted glass and release it while whispering your name into the spinning air.',
    legendaryForm: 'The Ultimate Devil is a dust devil of such power that it ground an entire mountain range into sand.',
  },
  mirage_djinn: {
    origin: 'Mirage djinn are the dream fragments of sleeping gods that crystallized into sentient beings when the first mirage appeared.',
    behavior: 'Mirage djinn are the most intelligent phantom species, often engaging in complex social hierarchies and long-term planning.',
    weakness: 'Mirage djinn cannot maintain their illusions when observed by someone who truly believes they are real.',
    bondingRitual: 'Solve a riddle posed by a mirage djinn in your dreams. If you answer correctly, the djinn will bond with you upon waking.',
    legendaryForm: 'The Grand Vizier is the most powerful mirage djinn, capable of rewriting the fabric of reality within its domain.',
  },
  ash_specter: {
    origin: 'Ash specters form when the ashes of burned beings absorb enough ambient magic to develop consciousness and a desire for existence.',
    behavior: 'Ash specters are melancholic and drawn to places of past destruction. They often try to complete unfinished business from their living days.',
    weakness: 'Ash specters are weakened by new fire, which reminds them of the flames that created them and causes existential distress.',
    bondingRitual: 'Scatter a handful of the specter original ashes into the wind while speaking of their former life and offering to help them find peace.',
    legendaryForm: 'The Ash Primordial is the consciousness of the primordial fire itself, older than the desert and older than sand.',
  },
  storm_genie: {
    origin: 'Storm genies are born when three or more desert storms collide and their combined energy achieves critical magical mass.',
    behavior: 'Storm genies are proud and territorial, claiming entire weather systems as their personal domains. They communicate through thunder.',
    weakness: 'Storm genies cannot exist in areas where the air is completely dry and still. Desiccation chambers can neutralize them.',
    bondingRitual: 'Stand at the exact center of a storm during a full moon and offer a gemstone that has been struck by lightning.',
    legendaryForm: 'The Eye of Storm exists at the center of every desert storm simultaneously, a being of perfect calm in perfect chaos.',
  },
  glass_golem: {
    origin: 'Glass golems are artificial constructs created by ancient desert civilizations to serve as guardians, workers, and warriors.',
    behavior: 'Glass golems are methodical and unwavering, following their original programming with mechanical precision unless reprogrammed.',
    weakness: 'Resonance frequencies can shatter glass golems. Each golem has a unique resonance frequency determined by its composition.',
    bondingRitual: 'Repair a damaged glass golem using enchanted sand and mirage crystal, then inscribe your name on its core with a diamond stylus.',
    legendaryForm: 'The Crystal Titan is the greatest glass golem ever constructed, absorbing all magical energy and converting it to power.',
  },
  dune_haunt: {
    origin: 'Dune haunts are shadow entities that formed in the spaces between dunes where sunlight never reaches, feeding on accumulated fear.',
    behavior: 'Dune haunts are ambush predators of the spirit world, using fear and shadow as their primary hunting tools.',
    weakness: 'Dune haunts are banished by strong light sources, especially enchanted light that carries the warmth of true compassion.',
    bondingRitual: 'Sit alone in the desert at midnight with no light and invite the haunt to share your warmth. If it accepts, a bond forms.',
    legendaryForm: 'The Dune Lord is the ultimate dune haunt, a being that IS the desert night and harvests the dreams of sleeping travelers.',
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const DM_INITIAL_STATE: DustMirageState = {
  dmPhantoms: {},
  dmOases: {},
  dmInventory: [],
  dmArtifacts: [],
  dmAchievements: [],
  dmTitle: 'dm_title_dust_walker',
  dmEvents: [],
  dmStructures: {},
  dmStats: {
    totalSummoned: 0,
    totalExplored: 0,
    totalCrafted: 0,
    totalBattles: 0,
    totalEvents: 0,
    totalOasisVisits: 0,
    highestPhantomPower: 0,
    miragePowerEarned: 0,
    sandShaped: 0,
    stormsSurvived: 0,
  },
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 19: ZUSTAND STORE
// ═══════════════════════════════════════════════════════════════════

const useDMStore = create<DMStore>()(
  persist(
    (set, get) => ({
      ...DM_INITIAL_STATE,

      summonPhantom: (id: string): boolean => {
        const state = get()
        const existing = state.dmPhantoms[id]
        if (existing && existing.collected) return false
        const def = DM_PHANTOMS.find(p => p.id === id)
        if (!def) return false
        set({
          dmPhantoms: {
            ...state.dmPhantoms,
            [id]: { collected: true, collectedAt: Date.now(), level: 1 },
          },
          dmStats: {
            ...state.dmStats,
            totalSummoned: state.dmStats.totalSummoned + 1,
            highestPhantomPower: Math.max(state.dmStats.highestPhantomPower, def.power),
            miragePowerEarned: state.dmStats.miragePowerEarned + def.power,
          },
        })
        return true
      },

      discoverOasis: (id: string): boolean => {
        const state = get()
        const existing = state.dmOases[id]
        if (existing && existing.discovered) return false
        const def = DM_OASES.find(o => o.id === id)
        if (!def) return false
        set({
          dmOases: {
            ...state.dmOases,
            [id]: { discovered: true, lastVisitedAt: Date.now(), level: 1, resourcesGathered: 0 },
          },
          dmStats: {
            ...state.dmStats,
            totalExplored: state.dmStats.totalExplored + 1,
            totalOasisVisits: state.dmStats.totalOasisVisits + 1,
          },
        })
        return true
      },

      buildStructure: (id: string): boolean => {
        const state = get()
        const currentLevel = state.dmStructures[id] ?? 0
        const def = DM_STRUCTURES.find(s => s.id === id)
        if (!def) return false
        if (currentLevel >= def.maxLevel) return false
        set({
          dmStructures: {
            ...state.dmStructures,
            [id]: currentLevel + 1,
          },
          dmStats: {
            ...state.dmStats,
            sandShaped: state.dmStats.sandShaped + 1,
            totalCrafted: state.dmStats.totalCrafted + 1,
          },
        })
        return true
      },

      activateArtifact: (id: string): boolean => {
        const state = get()
        if (state.dmArtifacts.includes(id)) return false
        const def = DM_ARTIFACTS.find(a => a.id === id)
        if (!def) return false
        set({
          dmArtifacts: [...state.dmArtifacts, id],
          dmStats: {
            ...state.dmStats,
            miragePowerEarned: state.dmStats.miragePowerEarned + def.power,
          },
        })
        return true
      },

      triggerMirageEvent: (): DMEventDef | null => {
        const state = get()
        const eligibleEvents = DM_EVENTS.filter(e => !state.dmEvents.includes(e.id))
        if (eligibleEvents.length === 0) return null
        const randomIndex = Math.floor(Math.random() * eligibleEvents.length)
        const event = eligibleEvents[randomIndex]
        set({
          dmEvents: [...state.dmEvents, event.id],
          dmStats: {
            ...state.dmStats,
            totalEvents: state.dmStats.totalEvents + 1,
          },
        })
        return event
      },

      resetDustMirage: (): void => {
        set(DM_INITIAL_STATE)
      },
    }),
    {
      name: 'dust-mirage-wire',
    }
  )
)

// ═══════════════════════════════════════════════════════════════════
// SECTION 20: HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

function dmCalculateLevel(miragePowerEarned: number): number {
  if (miragePowerEarned < 100) return 1
  if (miragePowerEarned < 250) return 2
  if (miragePowerEarned < 500) return 3
  if (miragePowerEarned < 800) return 4
  if (miragePowerEarned < 1200) return 5
  if (miragePowerEarned < 1800) return 6
  if (miragePowerEarned < 2500) return 7
  if (miragePowerEarned < 3500) return 8
  if (miragePowerEarned < 5000) return 9
  if (miragePowerEarned < 7000) return 10
  if (miragePowerEarned < 10000) return 11
  if (miragePowerEarned < 14000) return 12
  if (miragePowerEarned < 19000) return 13
  if (miragePowerEarned < 25000) return 14
  if (miragePowerEarned < 35000) return 15
  if (miragePowerEarned < 45000) return 16
  if (miragePowerEarned < 60000) return 17
  if (miragePowerEarned < 80000) return 18
  if (miragePowerEarned < 110000) return 19
  if (miragePowerEarned >= 110000) return 20
  return 1
}

function dmCalculateMiragePowerBonus(level: number): number {
  return Math.floor(level * 15 + Math.pow(level, 1.3) * 8)
}

function dmCalculateSandStormIntensity(level: number): number {
  return Math.min(100, Math.floor(level * 5 + Math.pow(level, 1.2) * 3))
}

function dmCalculateTitle(stats: DustMirageState['dmStats'], phantomsCount: number, oasesCount: number, artifactsCount: number, structuresBuilt: number): string {
  if (phantomsCount >= 35 && artifactsCount >= 15) return 'dm_title_mirage_emperor'
  if (phantomsCount >= 30 && structuresBuilt >= 20) return 'dm_title_sand_emperor'
  if (stats.stormsSurvived >= 10 && structuresBuilt >= 15) return 'dm_title_storm_caller'
  if (phantomsCount >= 20 && artifactsCount >= 8) return 'dm_title_dust_sovereign'
  if (artifactsCount >= 3 && oasesCount >= 5) return 'dm_title_mirage_weaver'
  if (phantomsCount >= 10 && structuresBuilt >= 5) return 'dm_title_phantom_friend'
  if (oasesCount >= 2 && phantomsCount >= 5) return 'dm_title_sand_seeker'
  return 'dm_title_dust_walker'
}

// ═══════════════════════════════════════════════════════════════════
// SECTION 21: MAIN HOOK — useDustMirage
// ═══════════════════════════════════════════════════════════════════

export default function useDustMirage() {
  const store = useDMStore()

  // ── Local state for computed values ──────────────────────────────
  const [dmLevel, setDmLevel] = useState<number>(1)
  const [dmMiragePower, setDmMiragePower] = useState<number>(0)
  const [dmSandStorm, setDmSandStorm] = useState<number>(0)

  // ── Ref for accessing store state inside effects ─────────────────
  const stateRef = useRef<DMStore>(store)

  // ── Sync ref with latest store state ─────────────────────────────
  useEffect(() => {
    stateRef.current = store
  }, [store])

  // ── Derived state computation inside useEffect ───────────────────
  useEffect(() => {
    const s = stateRef.current
    const level = dmCalculateLevel(s.dmStats.miragePowerEarned)
    const miragePower = dmCalculateMiragePowerBonus(level)
    const sandStorm = dmCalculateSandStormIntensity(level)
    setDmLevel(level)
    setDmMiragePower(miragePower)
    setDmSandStorm(sandStorm)
  }, [store])

  // ── Auto-check achievements inside useEffect ─────────────────────
  useEffect(() => {
    const s = stateRef.current
    const phantomsCount = Object.values(s.dmPhantoms).filter(p => p.collected).length
    const oasesCount = Object.values(s.dmOases).filter(o => o.discovered).length
    const structuresBuilt = Object.values(s.dmStructures).reduce((sum, lv) => sum + lv, 0)
    const materialsCount = s.dmInventory.length
    const eventsExperienced = s.dmEvents.length
    const artifactCount = s.dmArtifacts.length

    const newAchievements: string[] = []

    if (phantomsCount >= 1 && !s.dmAchievements.includes('dm_ach_first_phantom')) {
      newAchievements.push('dm_ach_first_phantom')
    }
    if (phantomsCount >= 5 && !s.dmAchievements.includes('dm_ach_collector_5')) {
      newAchievements.push('dm_ach_collector_5')
    }
    if (phantomsCount >= 15 && !s.dmAchievements.includes('dm_ach_collector_15')) {
      newAchievements.push('dm_ach_collector_15')
    }
    if (phantomsCount >= 35 && !s.dmAchievements.includes('dm_ach_collector_35')) {
      newAchievements.push('dm_ach_collector_35')
    }
    if (oasesCount >= 3 && !s.dmAchievements.includes('dm_ach_oasis_explorer')) {
      newAchievements.push('dm_ach_oasis_explorer')
    }
    if (oasesCount >= 8 && !s.dmAchievements.includes('dm_ach_all_oases')) {
      newAchievements.push('dm_ach_all_oases')
    }
    if (structuresBuilt >= 10 && !s.dmAchievements.includes('dm_ach_sand_shaper_10')) {
      newAchievements.push('dm_ach_sand_shaper_10')
    }
    if (structuresBuilt >= 25 && !s.dmAchievements.includes('dm_ach_sand_shaper_25')) {
      newAchievements.push('dm_ach_sand_shaper_25')
    }
    if (Object.values(s.dmStructures).some(lv => lv >= 10) && !s.dmAchievements.includes('dm_ach_structure_max')) {
      newAchievements.push('dm_ach_structure_max')
    }
    if (artifactCount >= 1 && !s.dmAchievements.includes('dm_ach_first_artifact')) {
      newAchievements.push('dm_ach_first_artifact')
    }
    if (artifactCount >= 5 && !s.dmAchievements.includes('dm_ach_artifact_5')) {
      newAchievements.push('dm_ach_artifact_5')
    }
    if (artifactCount >= 15 && !s.dmAchievements.includes('dm_ach_artifact_15')) {
      newAchievements.push('dm_ach_artifact_15')
    }
    if (eventsExperienced >= 5 && !s.dmAchievements.includes('dm_ach_event_survivor')) {
      newAchievements.push('dm_ach_event_survivor')
    }
    if (eventsExperienced >= 12 && !s.dmAchievements.includes('dm_ach_event_12')) {
      newAchievements.push('dm_ach_event_12')
    }
    if (s.dmStats.stormsSurvived >= 3 && !s.dmAchievements.includes('dm_ach_storm_survive')) {
      newAchievements.push('dm_ach_storm_survive')
    }
    if (materialsCount >= 30 && !s.dmAchievements.includes('dm_ach_material_30')) {
      newAchievements.push('dm_ach_material_30')
    }

    const hasLegendary = DM_PHANTOMS.some(p => p.rarity === 'legendary' && s.dmPhantoms[p.id]?.collected)
    if (hasLegendary && !s.dmAchievements.includes('dm_ach_legendary_phantom')) {
      newAchievements.push('dm_ach_legendary_phantom')
    }

    const collectedSpecies = new Set<string>()
    for (const [id, ps] of Object.entries(s.dmPhantoms)) {
      if (ps.collected) {
        const def = DM_PHANTOMS.find(p => p.id === id)
        if (def) {
          collectedSpecies.add(def.species)
        }
      }
    }
    if (collectedSpecies.size >= 7 && !s.dmAchievements.includes('dm_ach_all_species')) {
      newAchievements.push('dm_ach_all_species')
    }

    if (newAchievements.length > 0) {
      useDMStore.getState().dmAchievements = [...s.dmAchievements, ...newAchievements]
    }

    // Auto-update title
    const newTitle = dmCalculateTitle(s.dmStats, phantomsCount, oasesCount, artifactCount, structuresBuilt)
    if (newTitle !== s.dmTitle) {
      useDMStore.getState().dmTitle = newTitle
    }
  }, [store])

  // ── Action wrappers using useCallback ────────────────────────────
  const dmSummonMirage = useCallback((phantomId: string): boolean => {
    return useDMStore.getState().summonPhantom(phantomId)
  }, [])

  const dmShapeSand = useCallback((structureId: string): boolean => {
    return useDMStore.getState().buildStructure(structureId)
  }, [])

  const dmChaseOasis = useCallback((oasisId: string): boolean => {
    return useDMStore.getState().discoverOasis(oasisId)
  }, [])

  const dmDustStorm = useCallback((): DMArtifactDef | null => {
    const event = useDMStore.getState().triggerMirageEvent()
    if (event) {
      const artifact = DM_ARTIFACTS.find(a => a.id === `dm_art_${event.id}`)
      if (artifact) return artifact
    }
    return null
  }, [])

  const dmActivateRelic = useCallback((artifactId: string): boolean => {
    return useDMStore.getState().activateArtifact(artifactId)
  }, [])

  const dmResetAll = useCallback((): void => {
    useDMStore.getState().resetDustMirage()
  }, [])

  // ── Computed values (React Compiler auto-memoizes) ────────────────
  const dmAPI = {
    // ── Constants ────────────────────────────────────────────
    DM_SPECIES,
    DM_PHANTOMS,
    DM_OASES,
    DM_MATERIALS,
    DM_STRUCTURES,
    DM_ABILITIES,
    DM_ACHIEVEMENTS,
    DM_TITLES,
    DM_ARTIFACTS,
    DM_EVENTS,
    DM_COLORS,
    DM_RARITY_TIERS,
    DM_SPECIES_BONUSES,
    DM_ABILITY_CATEGORIES,
    DM_MATERIAL_CATEGORIES,
    DM_STRUCTURE_CATEGORIES,
    DM_DIFFICULTY_TIERS,
    DM_COLOR_SAND_GOLD,
    DM_COLOR_DUST_RED,
    DM_COLOR_MIRAGE_CYAN,
    DM_COLOR_TWILIGHT_PURPLE,
    DM_CRAFTING_RECIPES,
    DM_ENCOUNTER_TABLES,
    DM_OASIS_RESOURCES,
    DM_TITLE_THRESHOLDS,
    DM_SANDBOX_CONFIG,
    DM_EVENT_WEIGHTS,
    DM_STRUCTURE_UPGRADE_TABLE,
    DM_LORE_ENTRIES,
    DM_SPECIES_LORE,

    // ── State ────────────────────────────────────────────────
    dmLevel,
    dmMiragePower,
    dmSandStorm,

    // ── Store access ─────────────────────────────────────────
    store,

    // ── Computed analytics ───────────────────────────────────
    collectedPhantomIds: Object.keys(store.dmPhantoms),
    discoveredOasisIds: Object.keys(store.dmOases),
    builtStructureIds: Object.keys(store.dmStructures),
    activeArtifactIds: store.dmArtifacts,
    experiencedEventIds: store.dmEvents,

    // ── Action wrappers ──────────────────────────────────────
    dmSummonMirage,
    dmShapeSand,
    dmChaseOasis,
    dmDustStorm,
    dmActivateRelic,
    dmResetAll,

    // ── Stats snapshot ───────────────────────────────────────
    stats: { ...store.dmStats },

    // ── Inventory access ─────────────────────────────────────
    inventory: [...store.dmInventory],

    // ── Title info ───────────────────────────────────────────
    currentTitle: store.dmTitle,
    currentTitleDef: DM_TITLES.find(t => t.id === store.dmTitle) ?? DM_TITLES[0],

    // ── Unlocked achievements ────────────────────────────────
    unlockedAchievements: store.dmAchievements,
    unlockedAchievementDefs: store.dmAchievements
      .map(id => DM_ACHIEVEMENTS.find(a => a.id === id))
      .filter((a): a is DMAchievementDef => a !== undefined),

    // ── Active artifact details ──────────────────────────────
    activeArtifactDefs: store.dmArtifacts
      .map(id => DM_ARTIFACTS.find(a => a.id === id))
      .filter((a): a is DMArtifactDef => a !== undefined),

    // ── Structure levels ─────────────────────────────────────
    structureLevels: { ...store.dmStructures },
  }

  return dmAPI
}
